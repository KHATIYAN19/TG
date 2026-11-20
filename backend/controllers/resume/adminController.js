import asyncHandler from "express-async-handler";
import { z } from "zod";

import ResumeBlock from "../../models/resume/ResumeBlock.js";
import ResumePackage from "../../models/resume/ResumePackage.js";
import ResumeDraft from "../../models/resume/ResumeDraft.js";
import ResumeFile from "../../models/resume/ResumeFile.js";
import ResumePurchase from "../../models/resume/ResumePurchase.js";
import ResumeRequest from "../../models/resume/ResumeRequest.js";
import User from "../../models/User.js";
import { createDownloadUrl, deleteObject, headObject, keyBelongsTo, userPrefix } from "../../services/storage/s3.js";
import { builderMode, refundDraftCredit, saveBuilderMode } from "../../services/resume/builderAccess.js";
import { builderQuestionsData } from "./builderController.js";
import { DAY_MS, ResumeError, allowancesOf, assertId, listActivePackages, packageOut, parse, purchaseOut, sendError, snapshotOf, toRupees } from "../../services/resume/service.js";
import { rerunWithCredit } from "../../services/resume/ai.js";
import { MODELS, PROVIDERS, PROVIDER_IDS, costPerReviewUsd, findModel, isConfigured, validModelId } from "../../services/resume/aiModels.js";
import { ProviderError, extractJson, generateJson } from "../../services/resume/aiProviders.js";
import { readSettings, resolveActive, saveSettings } from "../../services/resume/aiSettings.js";
import { sendReviewReady } from "../../services/resume/mail.js";
import { requestOut } from "./userController.js";

const uid = (req) => String(req.user?.id || req.user?._id);
const isAdminUser = (req) => req.user?.role === "admin";
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const handler = (fn) => asyncHandler(async (req, res) => { try { await fn(req, res); } catch (err) { return sendError(res, err); } });
const escRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const quietDelete = (key) => (key ? deleteObject(key).catch((e) => console.error("[resume] could not delete file:", e?.message || e)) : Promise.resolve());
const ids = z.array(z.string().regex(/^[a-f\d]{24}$/i, "Invalid id")).min(1).max(100);

/* Delete stored files that no record points at any more. A vault file, another review or a builder draft
   can share the same object, so a key is only removed from storage once nothing still uses it. */
const dropUnusedFiles = async (keys) => {
  const list = [...new Set(keys.filter(Boolean))];
  if (!list.length) return;
  const [a, b, c, d] = await Promise.all([
    ResumeRequest.distinct("resume.key", { "resume.key": { $in: list } }),
    ResumeRequest.distinct("human.deliverable.key", { "human.deliverable.key": { $in: list } }),
    ResumeFile.distinct("key", { key: { $in: list }, hiddenAt: null }),
    ResumeDraft.distinct("source.resumeKey", { "source.resumeKey": { $in: list } }),
  ]);
  const used = new Set([...a, ...b, ...c, ...d]);
  await Promise.all(list.filter((k) => !used.has(k)).map(quietDelete));
};

/* HARD delete of reviews: the records go for good, then their files. refund = give each review's credits back to its plans. */
const hardDeleteRequests = async (rows, { refund = false } = {}) => {
  if (!rows.length) return 0;
  await ResumeRequest.deleteMany({ _id: { $in: rows.map((r) => r._id) } });
  if (refund) {
    await Promise.all(rows.flatMap((r) => [
      r.purchase && ResumePurchase.updateOne({ _id: r.purchase, aiUsed: { $gt: 0 } }, { $inc: { aiUsed: -1 } }),
      r.humanPurchase && ResumePurchase.updateOne({ _id: r.humanPurchase, humanUsed: { $gt: 0 } }, { $inc: { humanUsed: -1 } }),
      r.linkedinPurchase && ResumePurchase.updateOne({ _id: r.linkedinPurchase, linkedinUsed: { $gt: 0 } }, { $inc: { linkedinUsed: -1 } }),
    ].filter(Boolean)));
  }
  await dropUnusedFiles(rows.flatMap((r) => [r.resume?.key, r.human?.deliverable?.key]));
  return rows.length;
};
const REQ_FILE_FIELDS = "resume.key human.deliverable.key purchase humanPurchase linkedinPurchase";

/* =====================================================
   OVERVIEW: the whole console's first screen in ONE call
   (counts, what needs attention, the oldest waiting reviews, and for admins money, plans, builder and AI)
===================================================== */
export const overview = handler(async (req, res) => {
  const admin = isAdminUser(req);
  const now = Date.now();
  const scope = admin ? { deletedAt: null } : { deletedAt: null, humanRequested: true };
  const [byStatus, aiFailed, stale, queue] = await Promise.all([
    ResumeRequest.aggregate([{ $match: scope }, { $group: { _id: "$status", n: { $sum: 1 } } }]),
    ResumeRequest.countDocuments({ ...scope, "ai.status": "failed" }),
    ResumeRequest.countDocuments({ ...scope, humanRequested: true, status: "awaiting_review", createdAt: { $lte: new Date(now - 2 * DAY_MS) } }),
    ResumeRequest.find({ ...scope, humanRequested: true, status: { $in: ["awaiting_review", "in_review"] } }).sort({ createdAt: 1 }).limit(6)
      .select("status createdAt user packageSnapshot.name profile.targetRole human.reviewerName ai.result.overallScore").populate("user", "name email").lean(),
  ]);
  const by = Object.fromEntries(byStatus.map((r) => [r._id, r.n]));
  const out = {
    counts: { awaiting: by.awaiting_review || 0, inReview: by.in_review || 0, aiRunning: by.ai_reviewing || 0, completed: by.completed || 0, total: byStatus.reduce((n, r) => n + r.n, 0), aiFailed, stale },
    queue: queue.map((r) => ({ id: String(r._id), status: r.status, createdAt: r.createdAt, package: r.packageSnapshot?.name || "", targetRole: r.profile?.targetRole || "", reviewerName: r.human?.reviewerName || "", aiScore: r.ai?.result?.overallScore ?? null, user: { name: r.user?.name || "", email: r.user?.email || "" } })),
  };
  if (!admin) return ok(res, out);

  const paid = { "payment.status": "paid", "payment.amount": { $gt: 0 } };
  const [money, week, members, blocked, unpaid, expiring, trash, livePlans, recent, mode, ai] = await Promise.all([
    ResumePurchase.aggregate([{ $match: paid }, { $group: { _id: null, n: { $sum: 1 }, revenue: { $sum: "$payment.amount" } } }]),
    ResumePurchase.aggregate([{ $match: { ...paid, "payment.paidAt": { $gte: new Date(now - 7 * DAY_MS) } } }, { $group: { _id: null, n: { $sum: 1 }, revenue: { $sum: "$payment.amount" } } }]),
    ResumePurchase.distinct("user", { "payment.status": "paid" }),
    ResumeBlock.countDocuments(),
    ResumePurchase.countDocuments({ "payment.status": { $ne: "paid" }, createdAt: { $gte: new Date(now - 7 * DAY_MS) } }),
    ResumePurchase.countDocuments({ "payment.status": "paid", revokedAt: null, expiresAt: { $gt: new Date(now), $lte: new Date(now + 7 * DAY_MS) } }),
    ResumeRequest.countDocuments({ deletedAt: { $ne: null } }),
    ResumePackage.countDocuments({ isActive: true }),
    ResumePurchase.find({ "payment.status": "paid" }).sort({ "payment.paidAt": -1 }).limit(5).populate("user", "name email").lean(),
    builderMode(),
    resolveActive(),
  ]);
  ok(res, {
    ...out,
    money: { revenue: toRupees(money[0]?.revenue || 0), paidPlans: money[0]?.n || 0, weekRevenue: toRupees(week[0]?.revenue || 0), weekPlans: week[0]?.n || 0, unpaid, expiring },
    members: { paying: members.length, blocked },
    trash, livePlans, builder: mode, ai,
    recentPayments: recent.map((p) => purchaseRow(p, p.user)),
  });
});

/* =====================================================
   DASHBOARD NUMBERS (kept for older clients; the console now uses /overview)
===================================================== */
export const stats = handler(async (req, res) => {
  const [byStatus, money, members, blocked] = await Promise.all([
    ResumeRequest.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    ResumePurchase.aggregate([{ $match: { "payment.status": "paid", "payment.amount": { $gt: 0 } } }, { $group: { _id: null, n: { $sum: 1 }, revenue: { $sum: "$payment.amount" } } }]),
    ResumePurchase.distinct("user", { "payment.status": "paid" }),
    ResumeBlock.countDocuments(),
  ]);
  const by = Object.fromEntries(byStatus.map((r) => [r._id, r.n]));
  const counts = { awaiting: by.awaiting_review || 0, inReview: by.in_review || 0, aiRunning: by.ai_reviewing || 0, completed: by.completed || 0, totalReviews: byStatus.reduce((n, r) => n + r.n, 0) };
  // money and member numbers are for admins only: a reviewer account never gets them
  ok(res, isAdminUser(req) ? { ...counts, paidPlans: money[0]?.n || 0, revenue: toRupees(money[0]?.revenue || 0), members: members.length, blocked } : counts);
});

/* =====================================================
   SUBMISSIONS (every resume sent in, and what the AI said)
===================================================== */
export const listRequests = handler(async (req, res) => {
  const q = parse(z.object({
    status: z.enum(["all", "ai_reviewing", "awaiting_review", "in_review", "completed", "ai_failed", "human", "trash"]).optional().default("all"),
    search: z.string().max(80).optional().default(""),
    mine: z.enum(["1", "0"]).optional().default("0"),
    deleted: z.enum(["all", "hide", "only"]).optional().default("hide"), // older clients; status=trash is the same as deleted=only
    counts: z.enum(["1", "0"]).optional().default("1"), // the chip numbers come back with the rows, so the tab needs one call
    page: z.coerce.number().int().min(1).max(500).optional().default(1),
  }), req.query);
  const admin = isAdminUser(req);
  const base = {};
  if (!admin) base.humanRequested = true; // a reviewer only sees resumes whose owner asked for a human review
  if (q.mine === "1") base["human.reviewer"] = uid(req);
  if (q.search) {
    const re = new RegExp(escRe(q.search), "i");
    const users = await User.find({ $or: [{ name: re }, { email: re }] }).select("_id").limit(50).lean();
    base.$or = [{ "profile.organization": re }, { "profile.targetRole": re }, { "resume.filename": re }, { user: { $in: users.map((u) => u._id) } }];
  }
  const trash = admin && (q.status === "trash" || q.deleted === "only");
  const filter = { ...base, deletedAt: trash ? { $ne: null } : null }; // reviews a member deleted live in Trash until an admin removes them for good
  if (["ai_reviewing", "awaiting_review", "in_review", "completed"].includes(q.status)) filter.status = q.status;
  if (q.status === "ai_failed") filter["ai.status"] = "failed";
  if (q.status === "human") filter.humanRequested = true;
  const PAGE = 25;
  const live = { ...base, deletedAt: null };
  const [rows, total, byStatus, extra] = await Promise.all([
    ResumeRequest.find(filter).sort({ createdAt: -1 }).skip((q.page - 1) * PAGE).limit(PAGE).populate("user", "name email").lean(),
    ResumeRequest.countDocuments(filter),
    q.counts === "1" ? ResumeRequest.aggregate([{ $match: live }, { $group: { _id: "$status", n: { $sum: 1 } } }]) : [],
    q.counts === "1" ? Promise.all([
      ResumeRequest.countDocuments({ ...live, "ai.status": "failed" }),
      ResumeRequest.countDocuments({ ...live, humanRequested: true }),
      admin ? ResumeRequest.countDocuments({ ...base, deletedAt: { $ne: null } }) : 0,
    ]) : [0, 0, 0],
  ]);
  const by = Object.fromEntries(byStatus.map((r) => [r._id, r.n]));
  ok(res, {
    total, page: q.page, pages: Math.max(1, Math.ceil(total / PAGE)),
    counts: q.counts === "1" ? { all: byStatus.reduce((n, r) => n + r.n, 0), ai_reviewing: by.ai_reviewing || 0, awaiting_review: by.awaiting_review || 0, in_review: by.in_review || 0, completed: by.completed || 0, ai_failed: extra[0], human: extra[1], trash: extra[2] } : null,
    rows: rows.map((r) => ({
      id: String(r._id), status: r.status, humanRequested: Boolean(r.humanRequested), createdAt: r.createdAt, package: r.packageSnapshot?.name, includes: r.packageSnapshot?.includes,
      user: { name: r.user?.name || "", email: r.user?.email || "" }, kind: r.profile?.kind, organization: r.profile?.organization, targetRole: r.profile?.targetRole,
      file: r.resume?.filename || "", aiScore: r.ai?.result?.overallScore ?? null, aiStatus: r.ai?.status, reviewerName: r.human?.reviewerName || "", humanScore: r.human?.score ?? null,
      deletedAt: r.deletedAt || null, // the member deleted it (soft); an admin can delete it for good
    })),
  });
});

export const getRequest = handler(async (req, res) => {
  assertId(req.params.id, "review");
  const lite = req.query.lite === "1"; // the live AI progress poll: no signed links, no plan lookup
  const r = await (lite ? ResumeRequest.findById(req.params.id).select("status ai humanRequested deletedAt").lean() : ResumeRequest.findById(req.params.id).populate("user", "name email mobile").lean());
  if (!r || (!isAdminUser(req) && (!r.humanRequested || r.deletedAt))) throw new ResumeError(404, "Review not found.", "NOT_FOUND");
  if (lite) return ok(res, { status: r.status, ai: requestOut(r, { admin: true }).ai });
  let resumeUrl = "";
  let deliverableUrl = "";
  try { if (r.resume?.key) resumeUrl = (await createDownloadUrl(r.resume.key, { filename: r.resume.filename || "resume.pdf", inline: true, sensitive: true })).url; } catch { /* storage hiccup: the page still opens */ }
  try { if (r.human?.deliverable?.key) deliverableUrl = (await createDownloadUrl(r.human.deliverable.key, { filename: r.human.deliverable.filename || "resume", inline: false, sensitive: true })).url; } catch { /* same */ }
  const purchase = await ResumePurchase.findById(r.purchase).lean();
  ok(res, {
    ...requestOut(r, { admin: true }),
    user: { id: String(r.user?._id || ""), name: r.user?.name || "", email: r.user?.email || "", mobile: r.user?.mobile || "" },
    resumeUrl, deliverableUrl, plan: purchase ? purchaseOut(purchase) : null,
  });
});

/* take a review: from now on it is yours (an admin can take over any) */
export const claim = handler(async (req, res) => {
  assertId(req.params.id, "review");
  const me = await User.findById(uid(req)).select("name").lean();
  const r = await ResumeRequest.findOneAndUpdate(
    { _id: req.params.id, humanRequested: true, deletedAt: null, $or: [{ status: "awaiting_review" }, { status: "ai_reviewing" }, ...(isAdminUser(req) ? [{ status: "in_review" }] : [])] },
    { $set: { status: "in_review", "human.reviewer": uid(req), "human.reviewerName": me?.name || "Reviewer", "human.claimedAt": new Date() } },
    { new: true }
  );
  if (!r) throw new ResumeError(409, "This review can't be taken right now (someone else may have it, or no human review was asked for).", "NOT_CLAIMABLE");
  ok(res, { status: r.status });
});

const list = z.array(z.string().trim().min(1).max(600)).max(20).default([]);
const reviewSchema = z.object({
  score: z.coerce.number().int().min(0).max(100).nullable().optional(),
  summary: z.string().max(4000).default(""),
  detailedFeedback: z.string().max(30000).default(""),
  strengths: list,
  improvements: list,
  linkedinFeedback: z.string().max(8000).default(""),
  jobMatchFeedback: z.string().max(8000).default(""),
  nextSteps: z.string().max(6000).default(""),
  internalNotes: z.string().max(3000).default(""),
  /* undefined = leave the file alone, null = remove it, {key, filename} = the new rewritten resume */
  deliverable: z.object({ key: z.string().max(1024), filename: z.string().trim().max(200).optional().default("resume.pdf") }).nullable().optional(),
  complete: z.boolean().optional().default(false),
});

const DELIVERABLE_RE = /\.(pdf|docx?|DOCX?|PDF)$/;

/* save the review (draft) or deliver it. Line breaks in the long fields are kept exactly as typed. */
export const saveReview = handler(async (req, res) => {
  assertId(req.params.id, "review");
  const b = parse(reviewSchema, req.body);
  const r = await ResumeRequest.findById(req.params.id);
  if (!r) throw new ResumeError(404, "Review not found.", "NOT_FOUND");
  if (!r.humanRequested) throw new ResumeError(409, "The person didn't ask for a human review on this one.", "NO_HUMAN_REVIEW");
  if (r.status === "completed" && !isAdminUser(req)) throw new ResumeError(409, "This review was already delivered.", "ALREADY_DONE");
  if (!["in_review", "completed"].includes(r.status)) throw new ResumeError(409, "Take this review first.", "NOT_CLAIMED");
  if (!isAdminUser(req) && String(r.human?.reviewer) !== uid(req)) throw new ResumeError(403, "This review belongs to another reviewer.", "NOT_YOURS");

  const set = {
    "human.score": b.score ?? null, "human.summary": b.summary.replace(/\r\n/g, "\n"), "human.detailedFeedback": b.detailedFeedback.replace(/\r\n/g, "\n"),
    "human.strengths": b.strengths, "human.improvements": b.improvements, "human.linkedinFeedback": b.linkedinFeedback.replace(/\r\n/g, "\n"),
    "human.jobMatchFeedback": b.jobMatchFeedback.replace(/\r\n/g, "\n"), "human.nextSteps": b.nextSteps.replace(/\r\n/g, "\n"), "human.internalNotes": b.internalNotes,
  };

  let removeKey = "";
  if (b.deliverable === null) {
    set["human.deliverable"] = { key: "", filename: "", size: 0 };
    removeKey = r.human?.deliverable?.key || "";
  } else if (b.deliverable && b.deliverable.key !== r.human?.deliverable?.key) {
    const key = b.deliverable.key;
    if (!keyBelongsTo(key, `${userPrefix(uid(req))}resume/`) || !DELIVERABLE_RE.test(key)) throw new ResumeError(400, "That file isn't valid. Upload a PDF or Word file.", "INVALID_FILE");
    const obj = await headObject(key);
    if (!obj) throw new ResumeError(400, "We couldn't find the uploaded file. Please upload it again.", "FILE_NOT_FOUND");
    set["human.deliverable"] = { key, filename: b.deliverable.filename.replace(/[^\w.\- ()]+/g, "_").slice(0, 120) || "resume.pdf", size: obj.size || 0 };
    removeKey = r.human?.deliverable?.key || "";
  }

  if (b.complete) {
    if (b.summary.trim().length < 20) throw new ResumeError(400, "Write a short summary for the person before delivering.", "SUMMARY_REQUIRED");
    if (b.score == null) throw new ResumeError(400, "Give an overall score before delivering.", "SCORE_REQUIRED");
    const willHaveFile = set["human.deliverable"] ? Boolean(set["human.deliverable"].key) : Boolean(r.human?.deliverable?.key);
    if (r.linkedinRequested && b.linkedinFeedback.trim().length < 20) throw new ResumeError(400, "This person paid for a LinkedIn review. Write the LinkedIn feedback before delivering.", "LINKEDIN_REQUIRED");
    if (r.packageSnapshot?.includes?.rewrittenResume && !willHaveFile) throw new ResumeError(400, "This plan includes a complete rewritten resume. Upload it before delivering.", "DELIVERABLE_REQUIRED");
    if (r.status !== "completed") { set.status = "completed"; set["human.completedAt"] = new Date(); }
  }
  await ResumeRequest.updateOne({ _id: r._id }, { $set: set });
  if (removeKey) void quietDelete(removeKey);
  if (b.complete && r.status !== "completed") void sendReviewReady(r._id);
  ok(res, { status: set.status || r.status });
});

export const rerunAi = handler(async (req, res) => {
  assertId(req.params.id, "review");
  const fresh = await rerunWithCredit(req.params.id); // costs the member 1 AI credit, given back if the run fails
  ok(res, { aiStatus: fresh.ai?.status, error: fresh.ai?.status === "failed" ? fresh.ai.error : "" });
});

/* HARD delete (admins only): the record and its files are gone for good, whether or not the member deleted it first */
export const deleteRequest = handler(async (req, res) => {
  assertId(req.params.id, "review");
  const r = await ResumeRequest.findById(req.params.id).select(REQ_FILE_FIELDS).lean();
  if (!r) throw new ResumeError(404, "Review not found.", "NOT_FOUND");
  await hardDeleteRequests([r], { refund: req.query.giveBackUse === "1" });
  ok(res, { deleted: true });
});

/* HARD delete many at once: picked rows ({ ids }), or every review members deleted themselves ({ trash: true }) */
export const bulkDeleteRequests = handler(async (req, res) => {
  const b = parse(z.object({ ids: ids.optional(), trash: z.boolean().optional().default(false), giveBackUse: z.boolean().optional().default(false) }), req.body);
  if (!b.trash && !b.ids?.length) throw new ResumeError(400, "Pick at least one review.", "VALIDATION_FAILED");
  const rows = await ResumeRequest.find(b.trash ? { deletedAt: { $ne: null } } : { _id: { $in: b.ids } }).select(REQ_FILE_FIELDS).limit(b.trash ? 5000 : 100).lean();
  const deleted = await hardDeleteRequests(rows, { refund: b.giveBackUse && !b.trash });
  ok(res, { deleted });
});

/* =====================================================
   PAYMENTS / PLANS BOUGHT
===================================================== */
const purchaseRow = (p, user) => ({
  ...purchaseOut(p),
  user: { id: String(p.user?._id || p.user), name: user?.name || "", email: user?.email || "" },
  gatewayOrderId: p.payment?.gatewayOrderId || "", gatewayPaymentId: p.payment?.gatewayPaymentId || "", failureReason: p.payment?.failureReason || "",
  free: p.payment?.gateway === "admin", revokeReason: p.revokeReason || "",
});

export const listPurchases = handler(async (req, res) => {
  const q = parse(z.object({
    status: z.enum(["all", "paid", "unpaid", "revoked", "expired"]).optional().default("paid"),
    search: z.string().max(80).optional().default(""),
    page: z.coerce.number().int().min(1).max(500).optional().default(1),
  }), req.query);
  const now = new Date();
  const base = {};
  if (q.search) {
    const re = new RegExp(escRe(q.search), "i");
    const users = await User.find({ $or: [{ name: re }, { email: re }] }).select("_id").limit(50).lean();
    base.$or = [{ user: { $in: users.map((u) => u._id) } }, { "payment.gatewayOrderId": re }, { "payment.gatewayPaymentId": re }, { "packageSnapshot.name": re }];
  }
  const by = {
    all: {},
    paid: { "payment.status": "paid" },
    unpaid: { "payment.status": { $ne: "paid" } },
    expired: { "payment.status": "paid", expiresAt: { $lte: now } },
    revoked: { revokedAt: { $ne: null } },
  };
  const filter = { ...base, ...by[q.status] };
  const PAGE = 25;
  // rows + chip counts + the plan list for "Give a plan": everything the Payments tab needs, in one call
  const [rows, total, counts, packages] = await Promise.all([
    ResumePurchase.find(filter).sort({ createdAt: -1 }).skip((q.page - 1) * PAGE).limit(PAGE).populate("user", "name email").lean(),
    ResumePurchase.countDocuments(filter),
    Promise.all(Object.keys(by).map((k) => ResumePurchase.countDocuments({ ...base, ...by[k] }))).then((n) => Object.fromEntries(Object.keys(by).map((k, i) => [k, n[i]]))),
    ResumePackage.find().sort({ isActive: -1, sortOrder: 1, createdAt: 1 }).lean().then((list) => list.map((p) => { const o = packageOut(p); return { id: o.id, name: o.name, terms: o.terms, price: o.price, isActive: o.isActive }; })),
  ]);
  ok(res, { total, page: q.page, pages: Math.max(1, Math.ceil(total / PAGE)), counts, packages, rows: rows.map((p) => purchaseRow(p, p.user)) });
});

/* extend days, add reviews, switch a plan off or on */
export const updatePurchase = handler(async (req, res) => {
  assertId(req.params.id, "plan");
  const b = parse(z.object({
    addDays: z.coerce.number().int().min(-3650).max(3650).optional(),
    addAi: z.coerce.number().int().min(-1000000).max(1000000).optional(),
    addHuman: z.coerce.number().int().min(-100000).max(100000).optional(),
    addLinkedin: z.coerce.number().int().min(-1000).max(1000).optional(),
    addBuilder: z.coerce.number().int().min(-100000).max(100000).optional(),
    revoked: z.boolean().optional(),
    reason: z.string().trim().max(300).optional().default(""),
  }), req.body);
  const p = await ResumePurchase.findById(req.params.id);
  if (!p) throw new ResumeError(404, "Plan not found.", "NOT_FOUND");
  if (p.payment.status !== "paid") throw new ResumeError(409, "Only a paid plan can be changed.", "NOT_PAID");
  const set = {};
  if (b.addDays) {
    const base = p.expiresAt && p.expiresAt.getTime() > Date.now() ? p.expiresAt.getTime() : Date.now();
    set.expiresAt = new Date(base + b.addDays * DAY_MS);
  }
  if (b.addAi && p.aiAllowed > 0) set.aiAllowed = Math.max(p.aiUsed, p.aiAllowed + b.addAi);
  if (b.addHuman) set.humanAllowed = Math.max(p.humanUsed || 0, (p.humanAllowed || 0) + b.addHuman);
  if (b.addLinkedin) set.linkedinAllowed = Math.max(p.linkedinUsed || 0, (p.linkedinAllowed || 0) + b.addLinkedin);
  if (b.addBuilder) set.builderAllowed = Math.max(p.builderUsed || 0, (p.builderAllowed || 0) + b.addBuilder);
  if (b.revoked === true) { set.revokedAt = new Date(); set.revokeReason = b.reason; }
  if (b.revoked === false) { set.revokedAt = null; set.revokeReason = ""; }
  if (Object.keys(set).length) await ResumePurchase.updateOne({ _id: p._id }, { $set: set });
  const fresh = await ResumePurchase.findById(p._id).populate("user", "name email").lean();
  ok(res, purchaseRow(fresh, fresh.user));
});

/* delete a payment record. By default the reviews sent in under it go too (with their files); keepReviews=1 leaves them. */
export const deletePurchase = handler(async (req, res) => {
  assertId(req.params.id, "plan");
  const p = await ResumePurchase.findById(req.params.id).lean();
  if (!p) throw new ResumeError(404, "Plan not found.", "NOT_FOUND");
  const reviews = await deletePurchases([p._id], { keepReviews: req.query.keepReviews === "1" });
  ok(res, { deleted: true, reviewsDeleted: reviews });
});

const deletePurchases = async (purchaseIds, { keepReviews = false } = {}) => {
  let reviews = 0;
  if (!keepReviews) reviews = await hardDeleteRequests(await ResumeRequest.find({ purchase: { $in: purchaseIds } }).select(REQ_FILE_FIELDS).lean());
  await ResumePurchase.deleteMany({ _id: { $in: purchaseIds } });
  return reviews;
};

/* delete many payment records for good (and, unless keepReviews, the reviews sent in under them) */
export const bulkDeletePurchases = handler(async (req, res) => {
  const b = parse(z.object({ ids, keepReviews: z.boolean().optional().default(false) }), req.body);
  const found = await ResumePurchase.find({ _id: { $in: b.ids } }).select("_id").lean();
  const reviews = await deletePurchases(found.map((p) => p._id), b);
  ok(res, { deleted: found.length, reviewsDeleted: reviews });
});

/* give a plan for free (a gift, a fix after a failed payment, a partner) */
export const grantPlan = handler(async (req, res) => {
  const b = parse(z.object({ email: z.string().trim().toLowerCase().email(), packageId: z.string(), extraDays: z.coerce.number().int().min(0).max(3650).optional().default(0) }), req.body);
  assertId(b.packageId, "plan");
  const [user, pkg] = await Promise.all([User.findOne({ email: b.email }).select("_id name email").lean(), ResumePackage.findById(b.packageId).lean()]);
  if (!user) throw new ResumeError(404, "No account with that email. They need to sign up first.", "USER_NOT_FOUND");
  if (!pkg) throw new ResumeError(404, "Plan not found.", "NOT_FOUND");
  const snap = snapshotOf(pkg);
  const now = new Date();
  const days = snap.validityDays + b.extraDays;
  const p = await ResumePurchase.create({
    user: user._id, package: pkg._id, packageSnapshot: snap, ...allowancesOf(snap, { builderOn: true }), grantedBy: uid(req), // an admin's gift always carries the plan's builder credits
    expiresAt: days > 0 ? new Date(now.getTime() + days * DAY_MS) : null,
    payment: { amount: 0, gateway: "admin", status: "paid", paidAt: now },
  });
  ok(res, purchaseRow(p.toObject(), user), 201);
});

/* =====================================================
   MEMBERS (and blocking them from Resume Lab)
===================================================== */
export const listMembers = handler(async (req, res) => {
  const q = parse(z.object({ search: z.string().max(80).optional().default(""), filter: z.enum(["all", "paying", "blocked"]).optional().default("all") }), req.query);
  const [buyers, payers, blockedIds] = await Promise.all([ResumePurchase.distinct("user"), ResumePurchase.distinct("user", { "payment.status": "paid", "payment.amount": { $gt: 0 } }), ResumeBlock.distinct("user")]);
  const pool = q.filter === "blocked" ? blockedIds : q.filter === "paying" ? payers : [...buyers, ...blockedIds];
  let users;
  if (q.search) {
    const re = new RegExp(escRe(q.search), "i");
    // "All" searches every account (to find someone before they buy); the other chips search inside their group
    users = await User.find({ $or: [{ name: re }, { email: re }, { mobile: re }], ...(q.filter === "all" ? {} : { _id: { $in: pool } }) }).select("name email mobile role createdAt").limit(50).lean();
  } else {
    users = await User.find({ _id: { $in: pool } }).select("name email mobile role createdAt").sort({ createdAt: -1 }).limit(200).lean();
  }
  const ids = users.map((u) => u._id);
  const [spend, subs, blocks] = await Promise.all([
    ResumePurchase.aggregate([{ $match: { user: { $in: ids }, "payment.status": "paid" } }, { $group: { _id: "$user", plans: { $sum: 1 }, paid: { $sum: "$payment.amount" } } }]),
    ResumeRequest.aggregate([{ $match: { user: { $in: ids } } }, { $group: { _id: "$user", reviews: { $sum: 1 }, last: { $max: "$createdAt" } } }]),
    ResumeBlock.find({ user: { $in: ids } }).lean(),
  ]);
  const sp = new Map(spend.map((r) => [String(r._id), r]));
  const sb = new Map(subs.map((r) => [String(r._id), r]));
  const bl = new Map(blocks.map((r) => [String(r.user), r]));
  const rows = users.map((u) => ({
    id: String(u._id), name: u.name || "", email: u.email || "", mobile: u.mobile || "", staff: ["admin", "Employee"].includes(u.role), joinedAt: u.createdAt,
    plans: sp.get(String(u._id))?.plans || 0, paid: toRupees(sp.get(String(u._id))?.paid || 0), reviews: sb.get(String(u._id))?.reviews || 0, lastActive: sb.get(String(u._id))?.last || null,
    blocked: bl.has(String(u._id)), blockReason: bl.get(String(u._id))?.reason || "",
  }));
  ok(res, { rows, counts: { all: new Set([...buyers, ...blockedIds].map(String)).size, paying: payers.length, blocked: blockedIds.length } });
});

/* PERMANENT: erase everything this member has in Resume Lab (reviews and their files, plans, builder resumes, vault files, the block).
   Their Target Trek account itself stays. Money already paid is not refunded by this. */
export const eraseMember = handler(async (req, res) => {
  assertId(req.params.userId, "member");
  if (String(req.params.userId) === uid(req)) throw new ResumeError(400, "You can't erase your own data here.", "SELF");
  const user = { user: req.params.userId };
  const [reqs, drafts, files] = await Promise.all([
    ResumeRequest.find(user).select("resume.key human.deliverable.key").lean(),
    ResumeDraft.find(user).select("source.resumeKey").lean(),
    ResumeFile.find(user).select("key").lean(),
  ]);
  const [, plans] = await Promise.all([
    ResumeRequest.deleteMany(user),
    ResumePurchase.deleteMany(user),
    ResumeDraft.deleteMany(user),
    ResumeFile.deleteMany(user),
    ResumeBlock.deleteOne(user),
  ]);
  await dropUnusedFiles([...reqs.flatMap((r) => [r.resume?.key, r.human?.deliverable?.key]), ...drafts.map((d) => d.source?.resumeKey), ...files.map((f) => f.key)]);
  ok(res, { reviews: reqs.length, plans: plans.deletedCount || 0, drafts: drafts.length, files: files.length });
});

export const blockMember = handler(async (req, res) => {
  assertId(req.params.userId, "member");
  const b = parse(z.object({ reason: z.string().trim().max(300).optional().default("") }), req.body);
  if (String(req.params.userId) === uid(req)) throw new ResumeError(400, "You can't block yourself.", "SELF_BLOCK");
  const target = await User.findById(req.params.userId).select("role").lean();
  if (!target) throw new ResumeError(404, "Member not found.", "NOT_FOUND");
  if (["admin", "Employee"].includes(target.role)) throw new ResumeError(400, "Staff accounts can't be blocked here.", "STAFF");
  await ResumeBlock.updateOne({ user: req.params.userId }, { $set: { reason: b.reason, blockedBy: uid(req) } }, { upsert: true });
  ok(res, { blocked: true });
});

export const unblockMember = handler(async (req, res) => {
  assertId(req.params.userId, "member");
  await ResumeBlock.deleteOne({ user: req.params.userId });
  ok(res, { blocked: false });
});

/* =====================================================
   PLANS (admin only)
===================================================== */
const packageSchema = z.object({
  key: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,40}$/, "Use 2-40 letters, numbers or dashes"),
  name: z.string().trim().min(2).max(80),
  tagline: z.string().trim().max(160).default(""),
  description: z.string().trim().max(1000).default(""),
  price: z.coerce.number().min(1).max(1000000),
  compareAt: z.coerce.number().min(0).max(1000000).default(0),
  badge: z.string().trim().max(30).default(""),
  aiReviews: z.coerce.number().int().min(0).max(1000000).default(1),
  humanReviews: z.coerce.number().int().min(0).max(100000).default(0),
  linkedinReviews: z.coerce.number().int().min(0).max(1000).default(0),
  builderCredits: z.coerce.number().int().min(0).max(100000).default(0),
  validityDays: z.coerce.number().int().min(0).max(3650).default(0),
  includes: z.object({ resume: z.boolean(), linkedin: z.boolean(), jobMatch: z.boolean(), humanReview: z.boolean(), rewrittenResume: z.boolean(), aiReview: z.boolean().default(true) }),
  features: z.array(z.string().trim().min(1).max(120)).max(12).default([]),
  deliveryHours: z.coerce.number().int().min(1).max(720).default(48),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(1000).default(0),
});

const toDoc = (b) => ({ ...b, price: undefined, compareAt: undefined, pricePaise: Math.round(b.price * 100), compareAtPaise: Math.round(b.compareAt * 100) });

export const listPackages = handler(async (req, res) => {
  await listActivePackages(); // seeds the starter set on first use
  const rows = await ResumePackage.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  const sold = await ResumePurchase.aggregate([{ $match: { "payment.status": "paid" } }, { $group: { _id: "$package", n: { $sum: 1 } } }]);
  const by = new Map(sold.map((s) => [String(s._id), s.n]));
  ok(res, rows.map((p) => ({ ...packageOut(p), sold: by.get(String(p._id)) || 0 })));
});

const checkPackage = (b) => {
  if (b.includes.humanReview && b.humanReviews < 1) throw new ResumeError(400, "Human review is on, so set how many human reviews the plan includes (or switch it off).", "VALIDATION_FAILED");
  if (b.includes.rewrittenResume && !(b.includes.humanReview && b.humanReviews >= 1)) throw new ResumeError(400, "A rewritten resume is written by a person, so human review must be on with at least one review.", "VALIDATION_FAILED");
  if (!b.includes.resume && b.linkedinReviews < 1 && b.builderCredits < 1) throw new ResumeError(400, "A plan needs a resume review, a LinkedIn review or resume builder credits.", "VALIDATION_FAILED");
  if (!b.includes.aiReview && b.builderCredits < 1 && !(b.includes.humanReview && b.humanReviews >= 1) && b.linkedinReviews < 1) throw new ResumeError(400, "Without an AI review, the plan needs builder credits, a human review or a LinkedIn review.", "VALIDATION_FAILED");
  if (b.includes.rewrittenResume && !b.includes.resume) throw new ResumeError(400, "A rewritten resume needs a resume to rewrite.", "VALIDATION_FAILED");
};

export const createPackage = handler(async (req, res) => {
  const b = parse(packageSchema, req.body);
  checkPackage(b);
  try {
    ok(res, packageOut(await ResumePackage.create(toDoc(b))), 201);
  } catch (e) {
    if (e?.code === 11000) throw new ResumeError(409, "A plan with this key already exists.", "DUPLICATE_KEY");
    throw e;
  }
});

export const updatePackage = handler(async (req, res) => {
  assertId(req.params.id, "plan");
  const b = parse(packageSchema, req.body);
  checkPackage(b);
  try {
    const p = await ResumePackage.findByIdAndUpdate(req.params.id, { $set: toDoc(b) }, { new: true });
    if (!p) throw new ResumeError(404, "Plan not found.", "NOT_FOUND");
    ok(res, packageOut(p));
  } catch (e) {
    if (e?.code === 11000) throw new ResumeError(409, "A plan with this key already exists.", "DUPLICATE_KEY");
    throw e;
  }
});

/* a plan that was ever bought is only hidden; an unused one is removed.
   ?force=1 removes it for good anyway: every purchase keeps its own copy of the plan (packageSnapshot), so buyers keep what they paid for. */
export const deletePackage = handler(async (req, res) => {
  assertId(req.params.id, "plan");
  const used = await ResumePurchase.exists({ package: req.params.id });
  if (used && req.query.force !== "1") {
    await ResumePackage.updateOne({ _id: req.params.id }, { isActive: false });
    return ok(res, { hidden: true });
  }
  await ResumePackage.deleteOne({ _id: req.params.id });
  ok(res, { deleted: true });
});


/* =====================================================
   AI MODEL  (which provider and model write the reviews)
===================================================== */
const aiChoiceSchema = z.object({
  provider: z.enum(PROVIDER_IDS),
  model: z.string().trim().min(2).max(100),
});

const usdToInr = () => Number(process.env.USD_INR_RATE) || 85;

const modelOut = (m) => {
  const usd = costPerReviewUsd(m);
  return {
    id: m.id, label: m.label, note: m.note, reasoning: Boolean(m.reasoning),
    inPer1M: m.inPer1M, outPer1M: m.outPer1M,
    costUsd: usd == null ? null : Math.round(usd * 10000) / 10000,
    costInr: usd == null ? null : Math.round(usd * usdToInr() * 100) / 100,
  };
};

export const getAiSettings = handler(async (req, res) => {
  const [active, saved] = await Promise.all([resolveActive(), readSettings({ fresh: true })]);
  ok(res, {
    active, // what the next review really uses
    saved: saved ? { provider: saved.provider, model: saved.model, updatedAt: saved.updatedAt } : null, // what the admin chose
    providers: PROVIDER_IDS.map((id) => ({
      id, label: PROVIDERS[id].label, envKey: PROVIDERS[id].envKey, configured: isConfigured(id),
      models: MODELS.filter((m) => m.provider === id).map(modelOut),
    })),
    history: (saved?.history || []).slice(-10).reverse(),
    usdToInr: usdToInr(),
  });
});

const checkChoice = (req) => {
  const b = parse(aiChoiceSchema, req.body);
  if (!validModelId(b.model)) throw new ResumeError(400, "That model name has characters that are not allowed. Use letters, numbers and . _ - : / only.", "VALIDATION_FAILED");
  if (!isConfigured(b.provider)) throw new ResumeError(400, `${PROVIDERS[b.provider].label} is not set up yet. Add ${PROVIDERS[b.provider].envKey} to the server settings, restart, then choose it here.`, "PROVIDER_NOT_CONFIGURED");
  return b;
};

export const saveAiSettings = handler(async (req, res) => {
  const b = checkChoice(req);
  await saveSettings({ ...b, userId: uid(req), userName: req.user?.name || req.user?.email || "" });
  ok(res, { provider: b.provider, model: b.model, known: Boolean(findModel(b.provider, b.model)) });
});

/* a tiny real call, so the admin knows the key and the model name work before customers use it */
export const testAiModel = handler(async (req, res) => {
  const b = checkChoice(req);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  const started = Date.now();
  try {
    const out = await generateJson({
      provider: b.provider, model: b.model, signal: controller.signal,
      system: "You are a connection test. Reply with a JSON object only.",
      text: 'Reply with exactly this JSON and nothing else: {"ok": true}',
    });
    const json = extractJson(out.text);
    if (!json) return ok(res, { ok: false, message: "The model answered, but not with JSON. It may not suit reviews.", ms: Date.now() - started });
    ok(res, { ok: true, ms: Date.now() - started, usage: out.usage });
  } catch (e) {
    if (e?.name === "AbortError") return ok(res, { ok: false, message: "No answer within 60 seconds.", ms: Date.now() - started });
    if (e instanceof ProviderError) return ok(res, { ok: false, message: e.message, ms: Date.now() - started });
    throw e;
  } finally {
    clearTimeout(timer);
  }
});


/* =====================================================
   RESUME BUILDER SWITCH
===================================================== */
export const getBuilderSettings = handler(async (req, res) => {
  const [mode, holders, drafts] = await Promise.all([
    builderMode(),
    ResumePurchase.countDocuments({ "payment.status": "paid", revokedAt: null, builderAllowed: { $gt: 0 }, $expr: { $lt: ["$builderUsed", "$builderAllowed"] } }),
    ResumeDraft.countDocuments({}),
  ]);
  ok(res, { mode, holders, drafts });
});

/* the whole Resume builder tab in one call: the switch, its numbers, and every question the builder asked */
export const builderPanel = handler(async (req, res) => {
  const [mode, holders, drafts, questions] = await Promise.all([
    builderMode(),
    ResumePurchase.countDocuments({ "payment.status": "paid", revokedAt: null, builderAllowed: { $gt: 0 }, $expr: { $lt: ["$builderUsed", "$builderAllowed"] } }),
    ResumeDraft.countDocuments({}),
    builderQuestionsData(req.query),
  ]);
  ok(res, { settings: { mode, holders, drafts }, ...questions });
});

/* PERMANENT: delete one builder resume. A build that was never written gives its credit back, like the member's own delete. */
export const deleteDraftForGood = handler(async (req, res) => {
  assertId(req.params.id, "resume");
  const d = await ResumeDraft.findById(req.params.id);
  if (!d) throw new ResumeError(404, "Resume not found.", "NOT_FOUND");
  const key = d.source?.resumeKey;
  const refunded = await refundDraftCredit(d);
  await d.deleteOne();
  await dropUnusedFiles([key]);
  ok(res, { deleted: true, refunded });
});

export const saveBuilderSettings = handler(async (req, res) => {
  const b = parse(z.object({ mode: z.enum(["on", "existing", "off"]) }), req.body);
  const doc = await saveBuilderMode({ mode: b.mode, userId: req.user?.id || req.user?._id, userName: req.user?.name });
  ok(res, { mode: doc.mode });
});
