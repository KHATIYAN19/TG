import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { z } from "zod";

import ResumePackage from "../../models/resume/ResumePackage.js";
import ResumePurchase from "../../models/resume/ResumePurchase.js";
import ResumeRequest from "../../models/resume/ResumeRequest.js";
import User from "../../models/User.js";
import { FRONTEND_URL } from "../../config/urls.js";
import { createDownloadUrl, headObject, keyBelongsTo, userPrefix } from "../../services/storage/s3.js";
import { ResumeError, allowancesOf, assertId, assertNotBlocked, listActivePackages, packageOut, parse, poolOf, purchaseOut, sendError, snapshotOf, toRupees } from "../../services/resume/service.js";
import { builderMode, builderStatusFor } from "../../services/resume/builderAccess.js";
import { callbackOf, fetchStatus, refreshPurchase, settlePurchase, startCheckout, webhookOf } from "../../services/resume/payments.js";
import { rerunWithCredit, runAiReview } from "../../services/resume/ai.js";
import { pipelineOut } from "../../services/resume/agents/pipeline.js";
import { VAULT_MAX, addToVault, fileForSubmit, listVault, markUsed, removeFile, updateFile } from "../../services/resume/vault.js";

const DAY = 24 * 60 * 60 * 1000;
const uid = (req) => String(req.user?.id || req.user?._id);
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const handler = (fn) => asyncHandler(async (req, res) => { try { await fn(req, res); } catch (err) { return sendError(res, err); } });

/* ---------- what a person may see of a submission ---------- */
export const requestOut = (r, { admin = false } = {}) => {
  const human = r.human || {};
  const done = r.status === "completed";
  const asked = Boolean(r.humanRequested);
  const visible = admin || (done && asked);
  return {
    id: String(r._id),
    purchaseId: String(r.purchase),
    humanRequested: asked,
    status: r.status,
    createdAt: r.createdAt,
    package: { name: r.packageSnapshot?.name, key: r.packageSnapshot?.key, deliveryHours: r.packageSnapshot?.deliveryHours, includes: r.packageSnapshot?.includes },
    profile: r.profile,
    ...(admin ? { deletedAt: r.deletedAt || null } : {}),
    linkedinRequested: Boolean(r.linkedinRequested),
    linkedinUrl: r.linkedinRequested ? r.linkedinUrl : "",
    jobDescription: r.jobDescription,
    notes: r.notes,
    resume: { filename: r.resume?.filename || "", size: r.resume?.size || 0, ...(admin ? { key: r.resume?.key || "" } : {}) },
    ai: { status: r.ai?.status, finishedAt: r.ai?.finishedAt, result: r.ai?.status === "done" ? r.ai.result : null, pipeline: pipelineOut(r.ai?.pipeline, { admin }), ...(r.ai?.status === "failed" ? { userMessage: r.ai?.userMessage || "", refunded: Boolean(r.ai?.refunded) } : {}), ...(admin ? { error: r.ai?.error, model: r.ai?.model } : {}) },
    human: visible
      ? {
          ...(admin ? { reviewerName: human.reviewerName || "" } : {}), claimedAt: human.claimedAt, completedAt: human.completedAt, score: human.score,
          summary: human.summary, detailedFeedback: human.detailedFeedback, strengths: human.strengths || [], improvements: human.improvements || [],
          linkedinFeedback: human.linkedinFeedback, jobMatchFeedback: human.jobMatchFeedback, nextSteps: human.nextSteps,
          deliverable: human.deliverable?.key ? { filename: human.deliverable.filename, size: human.deliverable.size } : null,
          ...(admin ? { internalNotes: human.internalNotes, reviewer: human.reviewer ? String(human.reviewer) : null } : {}),
        }
      : asked ? { claimedAt: human.claimedAt } : null, // no human review asked for: no human words at all. A member never gets the reviewer's name.
  };
};

const FRONTEND = () => FRONTEND_URL;
const resultUrl = (purchaseId, status, origin) => `${origin || FRONTEND()}/resume-review/payment-result?purchase=${encodeURIComponent(purchaseId)}&status=${status}`;
const allowedReturnOrigin = (raw) => {
  let o;
  try { o = new URL(String(raw)).origin; } catch { return ""; }
  const site = new URL(FRONTEND()).origin;
  const twin = site.includes("//www.") ? site.replace("//www.", "//") : site.replace("//", "//www.");
  if (o === site || o === twin) return o;
  if (process.env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)) return o;
  return "";
};

/* ---------- public ---------- */
/* A plan that holds nothing but builder credits: it can't be sold, or shown, while the builder is off. */
const builderOnly = (p) => p.includes?.aiReview === false && !(p.humanReviews > 0 && p.includes?.humanReview !== false) && !(p.linkedinReviews > 0);

export const publicInfo = handler(async (req, res) => {
  const mode = await builderMode();
  const on = mode === "on";
  const packages = (await listActivePackages()).filter((p) => on || !builderOnly(p)).map((p) => packageOut(p, { builderOn: on }));
  ok(res, { packages, builder: { mode, on } });
});

/* ---------- buy a plan (payment comes first) ---------- */
const ownPurchase = async (req, id = req.params.id || req.body?.purchaseId) => {
  assertId(id, "plan");
  const p = await ResumePurchase.findOne({ _id: id, user: uid(req) });
  if (!p) throw new ResumeError(404, "Plan not found.", "NOT_FOUND");
  return p;
};

const startPayment = async (req, purchase, b) => {
  const user = await User.findById(uid(req)).select("name email mobile countryCode").lean();
  if (!user) throw new ResumeError(404, "User not found.", "USER_NOT_FOUND");
  const { gateway, gatewayOrderId, checkout } = await startCheckout({ purchase, user, preferredGateway: b.gateway });
  await ResumePurchase.updateOne(
    { _id: purchase._id, "payment.status": { $ne: "paid" } },
    { $set: { "payment.gateway": gateway, "payment.gatewayOrderId": gatewayOrderId, "payment.status": "created", "payment.failureReason": null, "payment.returnOrigin": b.returnOrigin ? allowedReturnOrigin(b.returnOrigin) : "" }, $push: { "payment.attempts": { gateway, gatewayOrderId } } }
  );
  return { purchaseId: String(purchase._id), gateway, amount: purchase.payment.amount, currency: "INR", checkout };
};

const payBody = z.object({ gateway: z.string().max(30).optional(), returnOrigin: z.string().max(120).optional() });

/* One call: makes the order for a plan (reusing an unpaid one for the same plan) and starts the payment. */
export const buyPlan = handler(async (req, res) => {
  await assertNotBlocked(uid(req));
  const b = parse(payBody.extend({ packageId: z.string() }), req.body);
  assertId(b.packageId, "plan");
  const pkg = await ResumePackage.findOne({ _id: b.packageId, isActive: true }).lean();
  if (!pkg) throw new ResumeError(404, "This plan isn't available right now.", "PACKAGE_UNAVAILABLE");
  const builderOn = (await builderMode()) === "on";
  if (!builderOn && builderOnly(pkg)) throw new ResumeError(409, "This plan isn't available right now.", "PACKAGE_UNAVAILABLE");
  const snap = snapshotOf(pkg);
  let purchase = await ResumePurchase.findOne({ user: uid(req), package: pkg._id, "payment.status": { $in: ["none", "created", "failed"] }, "payment.amount": pkg.pricePaise, "packageSnapshot.aiReviews": snap.aiReviews, "packageSnapshot.humanReviews": snap.humanReviews, "packageSnapshot.linkedinReviews": snap.linkedinReviews, "packageSnapshot.builderCredits": snap.builderCredits, "packageSnapshot.validityDays": pkg.validityDays ?? 0, builderAllowed: allowancesOf(snap, { builderOn }).builderAllowed });
  if (!purchase) {
    purchase = await ResumePurchase.create({ user: uid(req), package: pkg._id, packageSnapshot: snap, ...allowancesOf(snap, { builderOn }), payment: { amount: pkg.pricePaise, status: "none" } });
  }
  ok(res, await startPayment(req, purchase, b), 201);
});

export const payPurchase = handler(async (req, res) => {
  await assertNotBlocked(uid(req));
  const b = parse(payBody, req.body);
  const purchase = await ownPurchase(req);
  if (purchase.payment.status === "paid") throw new ResumeError(409, "This plan is already paid.", "ALREADY_PAID");
  ok(res, await startPayment(req, purchase, b), 201);
});

/* the browser says "I paid" (Razorpay's signed popup result). Valid signature + captured at the gateway = paid. */
export const verifyPayment = handler(async (req, res) => {
  const purchase = await ownPurchase(req);
  let result;
  try {
    result = await settlePurchase(purchase, await fetchStatus(purchase, req.body?.payload || {}));
  } catch (e) {
    console.error(`[resume] verify failed for ${purchase._id}:`, e?.message || e);
    result = await refreshPurchase(purchase);
  }
  ok(res, { status: result });
});

export const paymentStatus = handler(async (req, res) => {
  const purchase = await ownPurchase(req);
  const { state, progress, reason } = await refreshPurchase(purchase, { detail: true });
  ok(res, {
    status: state === "pending" ? "created" : state, // "created" = not paid yet (see `progress`)
    progress, // pending only: "processing" | "none" | "unknown"
    reason: state === "failed" ? reason : null, // USER_CANCELLED | PAYMENT_DECLINED | ...
    purchaseId: String(purchase._id),
    plan: { name: purchase.packageSnapshot?.name || "Resume Lab plan", amount: toRupees(purchase.payment.amount), human: (purchase.humanAllowed || 0) > 0, builder: (purchase.builderAllowed || 0) > 0, builderOnly: Boolean(purchase.noAi) && (purchase.builderAllowed || 0) > 0 },
    startedAt: purchase.updatedAt,
  });
});

const livePurchases = (userId) => ResumePurchase.find({ user: userId, "payment.status": "paid" }).sort({ createdAt: -1 }).limit(100).lean();

/* payments the person started in the last 2 days and never finished, so the app can offer "complete this payment" */
const unfinishedPurchases = async (userId, paid = []) => {
  const rows = await ResumePurchase.find({ user: userId, "payment.status": "created", "payment.gateway": { $ne: "admin" }, updatedAt: { $gt: new Date(Date.now() - 2 * DAY) } }).sort({ updatedAt: -1 }).limit(10).lean();
  // a plan they have since paid for (same plan, later) is not "unfinished" any more
  const done = (p) => paid.some((x) => String(x.package) === String(p.package) && new Date(x.payment?.paidAt || 0) >= new Date(p.createdAt));
  // only the most recent one: older half-finished attempts are just noise
  return rows.filter((p) => !done(p)).slice(0, 1).map((p) => ({ id: String(p._id), name: p.packageSnapshot?.name || "Resume Lab plan", amount: toRupees(p.payment?.amount), startedAt: p.updatedAt }));
};

export const myPlans = handler(async (req, res) => {
  const rows = await livePurchases(uid(req));
  const unfinished = await unfinishedPurchases(uid(req), rows);
  ok(res, { plans: rows.map(purchaseOut), summary: poolOf(rows), unfinished, builder: await builderStatusFor(uid(req)) });
});

export const getPlan = handler(async (req, res) => {
  const p = await ownPurchase(req);
  const pool = poolOf(await livePurchases(uid(req)));
  ok(res, { ...purchaseOut(p), pool });
});

/* ---------- credits: spend and give back, always one atomic step ---------- */
const liveFilter = (now) => ({ "payment.status": "paid", revokedAt: null, $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] });

const spendAi = (purchaseId, userId) => {
  const now = new Date();
  return ResumePurchase.findOneAndUpdate(
    { _id: purchaseId, user: userId, noAi: { $ne: true }, ...liveFilter(now), $and: [{ $or: [{ aiAllowed: 0 }, { $expr: { $lt: ["$aiUsed", "$aiAllowed"] } }] }] },
    { $inc: { aiUsed: 1 } },
    { new: true }
  );
};

/* a pooled credit (human or LinkedIn) from this plan first, then from any other plan that still has one, soonest to expire first */
const spendPooled = async (userId, preferId, allowed, used) => {
  const filter = (now) => ({ user: userId, ...liveFilter(now), [allowed]: { $gt: 0 }, $expr: { $lt: [`$${used}`, `$${allowed}`] } });
  const candidates = await ResumePurchase.find(filter(new Date())).select("_id expiresAt").lean();
  candidates.sort((a, b) => (String(a._id) === String(preferId) ? -1 : String(b._id) === String(preferId) ? 1 : (a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity) - (b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity)));
  for (const c of candidates) {
    const got = await ResumePurchase.findOneAndUpdate({ _id: c._id, ...filter(new Date()) }, { $inc: { [used]: 1 } }, { new: true });
    if (got) return got;
  }
  return null;
};
const spendHuman = (userId, preferId) => spendPooled(userId, preferId, "humanAllowed", "humanUsed");
const spendLinkedin = (userId, preferId) => spendPooled(userId, preferId, "linkedinAllowed", "linkedinUsed");

const giveBack = (purchaseId, field) => ResumePurchase.updateOne({ _id: purchaseId, [field]: { $gt: 0 } }, { $inc: { [field]: -1 } });

/* ---------- send in a resume (after the plan is paid) ---------- */
const LINKEDIN_RE = /^https?:\/\/([a-z0-9-]+\.)?linkedin\.com\/(in|pub|profile)\/[^\s]+$/i;
const text = (max) => z.string().trim().max(max);

const submitSchema = z.object({
  purchaseId: z.string(),
  humanReview: z.boolean().optional().default(false),
  linkedinReview: z.boolean().optional().default(false),
  profile: z.object({
    kind: z.enum(["student", "professional"]),
    currentRole: text(100).optional().default(""),
    experienceYears: z.coerce.number().min(0).max(60).optional().default(0),
    organization: text(140).min(2, "Enter your company or college"),
    course: text(120).optional().default(""),
    targetRole: text(120).min(2, "Tell us the role you are aiming for"),
  }),
  linkedinUrl: text(300).optional().default(""),
  jobDescription: text(10000).optional().default(""),
  notes: text(1500).optional().default(""),
  resume: z.object({ key: z.string().max(1024), filename: text(200).optional().default("resume.pdf") }).optional(),
  resumeFileId: z.string().max(40).optional(), // a file from the Resume Vault (preferred over `resume`)
});

export const submitRequest = handler(async (req, res) => {
  await assertNotBlocked(uid(req));
  const b = parse(submitSchema, req.body);
  const purchase = await ownPurchase(req, b.purchaseId);
  const snap = purchase.packageSnapshot || {};
  const inc = snap.includes || {};

  // 1. everything is checked BEFORE a use of the plan is spent
  if (b.profile.kind === "professional" && b.profile.currentRole.length < 2) throw new ResumeError(400, "Enter your current role.", "VALIDATION_FAILED");
  if (b.linkedinReview && !LINKEDIN_RE.test(b.linkedinUrl)) throw new ResumeError(400, "Enter your LinkedIn profile link (linkedin.com/in/your-name).", "VALIDATION_FAILED");
  if (!b.linkedinReview) b.linkedinUrl = "";
  if (inc.jobMatch && b.jobDescription.length < 40) throw new ResumeError(400, "Paste the job description you want to match (at least a few lines).", "VALIDATION_FAILED");
  if (b.profile.kind === "student") b.profile.experienceYears = 0;

  let resume = { key: "", filename: "", size: 0 };
  if (inc.resume && b.resumeFileId) b.resume = await fileForSubmit(uid(req), b.resumeFileId);
  if (inc.resume) {
    if (!b.resume?.key) throw new ResumeError(400, "Choose a resume from your vault, or add one.", "RESUME_REQUIRED");
    const key = b.resume.key;
    if (!keyBelongsTo(key, `${userPrefix(uid(req))}resume/`) || !/\.pdf$/i.test(key)) throw new ResumeError(400, "That resume file isn't valid. Please upload it again as a PDF.", "INVALID_RESUME");
    const obj = await headObject(key);
    if (!obj) throw new ResumeError(400, "We couldn't find your uploaded resume. Please upload it again.", "RESUME_NOT_FOUND");
    if (obj.contentType && !/pdf/i.test(obj.contentType)) throw new ResumeError(400, "Please upload your resume as a PDF.", "INVALID_RESUME");
    resume = { key, filename: b.resume.filename.replace(/[^\w.\- ()]+/g, "_").slice(0, 120) || "resume.pdf", size: obj.size || 0 };
  }

  // 2. spend the credits, atomically: two tabs can never use the last one twice
  const spentAi = await spendAi(purchase._id, uid(req));
  if (!spentAi) {
    const now = new Date();
    const reason = purchase.payment.status !== "paid" ? "Please pay for this plan first." : purchase.revokedAt ? "This plan has been switched off. Please contact support." : purchase.expiresAt && purchase.expiresAt <= now ? "This plan has expired." : "You've used all the AI reviews in this plan.";
    throw new ResumeError(409, reason, "PLAN_NOT_USABLE");
  }
  let humanPlan = null;
  if (b.humanReview) {
    humanPlan = await spendHuman(uid(req), purchase._id);
    if (!humanPlan) {
      await giveBack(purchase._id, "aiUsed");
      throw new ResumeError(409, "You have no human reviews left. You can still send this one for an AI review.", "NO_HUMAN_LEFT");
    }
  }

  let linkedinPlan = null;
  if (b.linkedinReview) {
    linkedinPlan = await spendLinkedin(uid(req), purchase._id);
    if (!linkedinPlan) {
      await giveBack(purchase._id, "aiUsed");
      if (humanPlan) await giveBack(humanPlan._id, "humanUsed");
      throw new ResumeError(409, "You have no LinkedIn reviews left. You can still send this one without it.", "NO_LINKEDIN_LEFT");
    }
  }

  try {
    const hs = humanPlan?.packageSnapshot || {};
    const doc = await ResumeRequest.create({
      user: uid(req), purchase: purchase._id, humanRequested: Boolean(humanPlan), humanPurchase: humanPlan?._id || null, linkedinRequested: Boolean(linkedinPlan), linkedinPurchase: linkedinPlan?._id || null,
      packageSnapshot: {
        key: snap.key, name: snap.name, deliveryHours: humanPlan ? hs.deliveryHours || snap.deliveryHours : snap.deliveryHours,
        includes: { resume: !!inc.resume, linkedin: Boolean(linkedinPlan), jobMatch: !!inc.jobMatch, humanReview: Boolean(humanPlan), rewrittenResume: Boolean(humanPlan) && Boolean(inc.rewrittenResume || hs.includes?.rewrittenResume) },
      },
      profile: b.profile, linkedinUrl: b.linkedinUrl, jobDescription: b.jobDescription, notes: b.notes, resume, status: "ai_reviewing",
    });
    void runAiReview(doc._id); // never awaited: the person should not wait for the AI
    if (resume.key) void markUsed(uid(req), resume.key, resume.filename);
    ok(res, requestOut(doc), 201);
  } catch (e) {
    await giveBack(purchase._id, "aiUsed"); // give the credits back
    if (humanPlan) await giveBack(humanPlan._id, "humanUsed");
    if (linkedinPlan) await giveBack(linkedinPlan._id, "linkedinUsed");
    throw e;
  }
});

/* ask for a human review of a resume that was sent in without one (uses one human review from any of the person's plans) */
export const requestHuman = handler(async (req, res) => {
  await assertNotBlocked(uid(req));
  const r = await ownRequest(req);
  if (r.humanRequested) throw new ResumeError(409, "A human review was already asked for on this one.", "ALREADY_ASKED");
  const plan = await spendHuman(uid(req), r.purchase);
  if (!plan) throw new ResumeError(409, "You have no human reviews left.", "NO_HUMAN_LEFT");
  const hs = plan.packageSnapshot || {};
  const set = { humanRequested: true, humanPurchase: plan._id, "packageSnapshot.includes.humanReview": true, "packageSnapshot.deliveryHours": hs.deliveryHours || r.packageSnapshot?.deliveryHours };
  if (hs.includes?.rewrittenResume) set["packageSnapshot.includes.rewrittenResume"] = true;
  if (r.status === "completed") set.status = "awaiting_review"; // while the AI is still running, it moves on by itself when it finishes
  const won = await ResumeRequest.findOneAndUpdate({ _id: r._id, humanRequested: false }, { $set: set }, { new: true });
  if (!won) { await giveBack(plan._id, "humanUsed"); throw new ResumeError(409, "A human review was already asked for on this one.", "ALREADY_ASKED"); }
  ok(res, requestOut(won));
});

/* ---------- read ---------- */
/* a list row needs a few fields, never the whole AI report or the agents' trail */
const LIST_FIELDS = "status humanRequested createdAt purchase packageSnapshot profile linkedinUrl linkedinRequested resume.filename resume.size ai.status ai.result.overallScore ai.result.atsScore human.score";
const listItem = (r) => {
  const o = requestOut(r);
  return { id: o.id, status: o.status, humanRequested: o.humanRequested, createdAt: o.createdAt, package: o.package, targetRole: r.profile?.targetRole, profile: r.profile, linkedinUrl: r.linkedinUrl || "", filename: r.resume?.filename || "", fileSize: r.resume?.size || 0, score: r.status === "completed" && r.humanRequested ? r.human?.score ?? r.ai?.result?.overallScore ?? null : r.ai?.result?.overallScore ?? null, aiStatus: o.ai.status };
};

/* Without ?page the whole list (up to 100) as an array, as before. With ?page=N&limit=M (default 20) one page: { items, total, page, pages, limit }. */
export const myRequests = handler(async (req, res) => {
  const filter = { user: uid(req), deletedAt: null };
  if (req.query.state === "active") filter.status = { $ne: "completed" }; // ?state=active | done
  else if (req.query.state === "done") filter.status = "completed";
  if (req.query.page === undefined) {
    const rows = await ResumeRequest.find(filter).select(LIST_FIELDS).sort({ createdAt: -1 }).limit(100).lean();
    return ok(res, rows.map(listItem));
  }
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const page0 = Math.max(1, parseInt(req.query.page, 10) || 1);
  // both at once; a page past the end is asked again for the last page
  let [total, rows] = await Promise.all([ResumeRequest.countDocuments(filter), ResumeRequest.find(filter).select(LIST_FIELDS).sort({ createdAt: -1 }).skip((page0 - 1) * limit).limit(limit).lean()]);
  const pages = Math.max(1, Math.ceil(total / limit));
  const page = Math.min(pages, page0);
  if (page !== page0) rows = await ResumeRequest.find(filter).select(LIST_FIELDS).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
  ok(res, { items: rows.map(listItem), total, page, pages, limit });
});

const ownRequest = async (req) => {
  assertId(req.params.id, "review");
  const r = await ResumeRequest.findOne({ _id: req.params.id, user: uid(req), deletedAt: null });
  if (!r) throw new ResumeError(404, "Review not found.", "NOT_FOUND");
  return r;
};

export const getRequest = handler(async (req, res) => {
  const request = await ownRequest(req);
  // a server restart can leave an AI run half-finished: a visit picks it up again (only one run can claim it)
  if (["pending", "running"].includes(request.ai?.status)) void runAiReview(request._id);
  // ?pool=1 (the first load only, not the live polling): what the person can still add, so the page needs no second call
  if (req.query.pool === "1") {
    const pool = poolOf(await livePurchases(uid(req)));
    return ok(res, { ...requestOut(request), pool: { humanLeft: pool.humanLeft, aiLeft: pool.aiLeft, aiUnlimited: pool.aiUnlimited } });
  }
  ok(res, requestOut(request));
});

/* ---------- the whole signed-in space in ONE call ----------
   plans + credit pool + unfinished payment + builder access + latest reviews + review count + vault + the details last used.
   Every query runs at the same time. */
export const appBootstrap = handler(async (req, res) => {
  const userId = uid(req);
  const recentLimit = Math.min(10, Math.max(0, parseInt(req.query.recent, 10) || 5));
  const [rows, pending, recent, total, reviewing, vault, last] = await Promise.all([
    livePurchases(userId),
    ResumePurchase.find({ user: userId, "payment.status": "created", "payment.gateway": { $ne: "admin" }, updatedAt: { $gt: new Date(Date.now() - 2 * DAY) } }).sort({ updatedAt: -1 }).limit(10).lean(),
    recentLimit ? ResumeRequest.find({ user: userId, deletedAt: null }).select(LIST_FIELDS).sort({ createdAt: -1 }).limit(recentLimit).lean() : [],
    ResumeRequest.countDocuments({ user: userId, deletedAt: null }),
    ResumeRequest.countDocuments({ user: userId, deletedAt: null, status: { $ne: "completed" } }),
    listVault(userId),
    ResumeRequest.findOne({ user: userId, deletedAt: null, "profile.organization": { $nin: ["", null] } }).select("profile linkedinUrl").sort({ createdAt: -1 }).lean(),
  ]);
  const summary = poolOf(rows);
  const done = (p) => rows.some((x) => String(x.package) === String(p.package) && new Date(x.payment?.paidAt || 0) >= new Date(p.createdAt));
  const unfinished = pending.filter((p) => !done(p)).slice(0, 1).map((p) => ({ id: String(p._id), name: p.packageSnapshot?.name || "Resume Lab plan", amount: toRupees(p.payment?.amount), startedAt: p.updatedAt }));
  ok(res, {
    plans: rows.map(purchaseOut), summary, unfinished, builder: await builderStatusFor(userId, summary),
    recent: recent.map(listItem), totals: { reviews: total, inProgress: reviewing },
    vault: { files: vault, max: VAULT_MAX },
    lastProfile: last ? { profile: last.profile, linkedinUrl: last.linkedinUrl || "" } : null,
  });
});

/* ---------- a member deletes a review: soft (hidden from them, kept for the admin, who can delete it for good) ---------- */
export const deleteMyRequest = handler(async (req, res) => {
  const r = await ownRequest(req);
  // a person is reviewing it (or about to): it can go once their notes are delivered
  if (r.humanRequested && ["awaiting_review", "in_review"].includes(r.status)) throw new ResumeError(409, "A reviewer is working on this one. You can delete it once their review is delivered.", "HUMAN_IN_PROGRESS");
  await ResumeRequest.updateOne({ _id: r._id, deletedAt: null }, { $set: { deletedAt: new Date() } });
  ok(res, { deleted: true });
});

/* ---------- run the AI agents again: costs 1 AI credit (given back if it fails) ---------- */
export const rerunMine = handler(async (req, res) => {
  await assertNotBlocked(uid(req));
  const r = await ownRequest(req);
  await rerunWithCredit(r._id, { userId: uid(req) });
  ok(res, requestOut(await ResumeRequest.findById(r._id)));
});

/* ---------- the Resume Vault ---------- */
const vaultAdd = z.object({ key: z.string().max(1024), filename: text(200).optional().default("resume.pdf"), label: text(60).optional().default(""), replaceId: z.string().max(40).optional().default(""), makeDefault: z.boolean().optional().default(false) });
const vaultPatch = z.object({ label: text(60).optional(), makeDefault: z.boolean().optional() });

export const vaultList = handler(async (req, res) => ok(res, { files: await listVault(uid(req)), max: VAULT_MAX }));
export const vaultCreate = handler(async (req, res) => {
  await assertNotBlocked(uid(req));
  const file = await addToVault(uid(req), parse(vaultAdd, req.body));
  ok(res, { file, files: await listVault(uid(req)), max: VAULT_MAX }, 201);
});
export const vaultUpdate = handler(async (req, res) => {
  const file = await updateFile(uid(req), req.params.id, parse(vaultPatch, req.body));
  ok(res, { file, files: await listVault(uid(req)), max: VAULT_MAX });
});
export const vaultDelete = handler(async (req, res) => {
  await removeFile(uid(req), req.params.id);
  ok(res, { files: await listVault(uid(req)), max: VAULT_MAX });
});

/* the finished, rewritten resume (only once the review is delivered) */
export const downloadDeliverable = handler(async (req, res) => {
  const r = await ownRequest(req);
  if (r.status !== "completed" || !r.human?.deliverable?.key) throw new ResumeError(404, "There is no file to download yet.", "NO_FILE");
  const link = await createDownloadUrl(r.human.deliverable.key, { filename: r.human.deliverable.filename || "resume", inline: false, sensitive: true });
  ok(res, { url: link.url });
});

/* ---------- gateway return + webhook (no login) ---------- */
const findByOrder = (gateway, gatewayOrderId) =>
  ResumePurchase.findOne({ $or: [{ "payment.gateway": gateway, "payment.gatewayOrderId": gatewayOrderId }, { "payment.attempts": { $elemMatch: { gateway, gatewayOrderId } } }] });

/* an earlier attempt was the one that got paid: check THAT order with the gateway */
const asAttempt = (purchase, gateway, gatewayOrderId) => {
  purchase.payment.gateway = gateway;
  purchase.payment.gatewayOrderId = gatewayOrderId;
  return purchase;
};

export const gatewayCallback = asyncHandler(async (req, res) => {
  const ref = String(req.query.ref || "");
  const gateway = String(req.params.gateway || "");
  try {
    if (!mongoose.isValidObjectId(ref)) return res.redirect(303, resultUrl("", "failed"));
    const purchase = await ResumePurchase.findOne({ _id: ref });
    if (!purchase) return res.redirect(303, resultUrl("", "failed"));
    const claimed = callbackOf({ gateway, body: { ...req.query, ...req.body } }).gatewayOrderId;
    if (claimed && !(purchase.payment.attempts || []).some((a) => a.gateway === gateway && a.gatewayOrderId === claimed)) return res.redirect(303, resultUrl(purchase._id, "failed", purchase.payment.returnOrigin));
    const state = await refreshPurchase(claimed ? asAttempt(purchase, gateway, claimed) : purchase);
    return res.redirect(303, resultUrl(purchase._id, state === "paid" ? "paid" : state === "failed" ? "failed" : "pending", purchase.payment.returnOrigin));
  } catch (e) {
    console.error("[resume] callback error:", e.message);
    return res.redirect(303, resultUrl(ref, "pending"));
  }
});

export const gatewayWebhook = asyncHandler(async (req, res) => {
  const gateway = String(req.params.gateway || "");
  if (!Buffer.isBuffer(req.body)) return res.status(404).json({ success: false });
  const parsed = webhookOf({ gateway, rawBody: req.body.toString("utf8"), headers: req.headers });
  if (!parsed.valid) return res.status(400).json({ success: false, message: "Invalid signature" });
  if (parsed.ignore) return res.json({ success: true });
  try {
    const purchase = await findByOrder(gateway, parsed.gatewayOrderId);
    if (purchase) await refreshPurchase(asAttempt(purchase, gateway, parsed.gatewayOrderId)); // re-checked with the gateway, not taken from the webhook body
    return res.json({ success: true });
  } catch (e) {
    console.error("[resume] webhook error:", e.message);
    return res.status(500).json({ success: false });
  }
});

export { toRupees };
