import mongoose from "mongoose";

import ResumePackage from "../../models/resume/ResumePackage.js";
import ResumePurchase from "../../models/resume/ResumePurchase.js";
import ResumeBlock from "../../models/resume/ResumeBlock.js";
import ResumeBuilderSettings from "../../models/resume/ResumeBuilderSettings.js";

export class ResumeError extends Error {
  constructor(status, message, code = "RESUME_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const sendError = (res, err) => {
  if (err instanceof ResumeError) return res.status(err.status).json({ success: false, message: err.message, code: err.code });
  if (err?.name === "StorageError") return res.status(err.status || 500).json({ success: false, message: err.message, code: err.code });
  console.error("[resume]", err);
  return res.status(500).json({ success: false, message: "Something went wrong. Please try again.", code: "SERVER_ERROR" });
};

export const parse = (schema, data) => {
  const r = schema.safeParse(data ?? {});
  if (!r.success) {
    throw new ResumeError(400, r.error.issues.map((i) => `${i.path.join(".") || "value"}: ${i.message}`).join("; "), "VALIDATION_FAILED");
  }
  return r.data;
};

export const assertId = (id, label = "id") => {
  if (!mongoose.isValidObjectId(id)) throw new ResumeError(400, `Invalid ${label}.`, "INVALID_ID");
  return String(id);
};

export const toRupees = (paise) => Math.round(Number(paise) || 0) / 100;
export const DAY_MS = 86400000;

/* ---------- blocked members ---------- */
export const blockOf = (userId) => ResumeBlock.findOne({ user: userId }).lean();
export const assertNotBlocked = async (userId) => {
  const b = await blockOf(userId);
  if (b) throw new ResumeError(403, b.reason ? `Your access to Resume Lab has been paused: ${b.reason}` : "Your access to Resume Lab has been paused. Please contact support.", "RESUME_BLOCKED");
};

/* ---------- plan state ---------- */
const now0 = () => Date.now();
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
export const aiLeftOf = (p) => (p.noAi ? 0 : num(p.aiAllowed) === 0 ? null : Math.max(0, num(p.aiAllowed) - num(p.aiUsed))); // null = unlimited
export const humanLeftOf = (p) => Math.max(0, num(p.humanAllowed) - num(p.humanUsed));
export const linkedinLeftOf = (p) => Math.max(0, num(p.linkedinAllowed) - num(p.linkedinUsed));
export const builderLeftOf = (p) => Math.max(0, num(p.builderAllowed) - num(p.builderUsed));
const aiGone = (p) => Boolean(p.noAi) || (num(p.aiAllowed) > 0 && num(p.aiUsed) >= num(p.aiAllowed)); // a builder-only plan holds no AI review at all

/** Why a purchase can't be used at all right now, or "" when it still holds something to use. */
export const unusableReason = (p, now = now0()) => {
  if (p.payment?.status !== "paid") return "UNPAID";
  if (p.revokedAt) return "REVOKED";
  if (p.expiresAt && new Date(p.expiresAt).getTime() <= now) return "EXPIRED";
  if (aiGone(p) && humanLeftOf(p) === 0 && linkedinLeftOf(p) === 0 && builderLeftOf(p) === 0) return "USED_UP";
  return "";
};
/** Can another resume be sent in under it? (needs an AI review left) */
export const canSubmit = (p, now = now0()) => unusableReason(p, now) === "" && !aiGone(p);

const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
export const planTerms = ({ aiReviews, humanReviews, linkedinReviews = 0, builderCredits = 0, noAi = false, validityDays }) => {
  const ai = noAi ? "" : aiReviews === 0 ? "Unlimited AI reviews" : plural(aiReviews, "AI review");
  const builder = builderCredits > 0 ? plural(builderCredits, "resume build") : "";
  const human = humanReviews > 0 ? plural(humanReviews, "human review") : "";
  const li = linkedinReviews > 0 ? plural(linkedinReviews, "LinkedIn review") : "";
  const time = !validityDays ? "no expiry" : validityDays % 365 === 0 ? `valid ${plural(validityDays / 365, "year")}` : `valid ${validityDays} days`;
  return `${[ai, human, li, builder].filter(Boolean).join(" + ")} · ${time}`;
};

/** How many human reviews a plan really gives: the count, unless the admin switched human review off. */
export const linkedinOf = (pkg) => Math.max(0, pkg?.linkedinReviews ?? 0);
export const humanOf = (pkg) => (pkg?.includes?.humanReview !== false ? Math.max(0, pkg?.humanReviews ?? 0) : 0);

export const builderOf = (pkg) => Math.max(0, pkg?.builderCredits ?? 0);
export const noAiOf = (pkg) => pkg?.includes?.aiReview === false;

/* `builderOn` false = the builder is switched off: the plan is shown without any builder credits (see builderAccess.js) */
export const packageOut = (p, { builderOn = true } = {}) => {
  const human = humanOf(p);
  const li = linkedinOf(p);
  const noAi = noAiOf(p);
  const bc = builderOn ? builderOf(p) : 0;
  const ai = noAi ? 0 : p.aiReviews ?? 1;
  return {
    id: String(p._id), key: p.key, name: p.name, tagline: p.tagline, description: p.description, badge: p.badge,
    price: toRupees(p.pricePaise), compareAt: p.compareAtPaise > p.pricePaise ? toRupees(p.compareAtPaise) : 0,
    ai: { reviews: ai, enabled: !noAi }, builder: { enabled: bc > 0, credits: bc, configured: builderOf(p) }, human: { enabled: human > 0, reviews: human, switch: p.includes?.humanReview !== false, configured: p.humanReviews ?? 0 },
    linkedin: { enabled: li > 0, reviews: li },
    validityDays: p.validityDays ?? 0, terms: planTerms({ aiReviews: ai, humanReviews: human, linkedinReviews: li, builderCredits: bc, noAi, validityDays: p.validityDays ?? 0 }),
    includes: { aiReview: !noAi, resume: !!p.includes?.resume, linkedin: li > 0, jobMatch: !!p.includes?.jobMatch, humanReview: human > 0, rewrittenResume: human > 0 && !!p.includes?.rewrittenResume },
    features: p.features || [], deliveryHours: p.deliveryHours, isActive: p.isActive, sortOrder: p.sortOrder,
  };
};

export const purchaseOut = (p) => {
  const reason = unusableReason(p);
  const humanAllowed = p.humanAllowed || 0;
  return {
    id: String(p._id), createdAt: p.createdAt,
    package: { name: p.packageSnapshot?.name, key: p.packageSnapshot?.key, price: toRupees(p.packageSnapshot?.pricePaise), deliveryHours: p.packageSnapshot?.deliveryHours, includes: p.packageSnapshot?.includes, terms: planTerms({ aiReviews: p.aiAllowed, humanReviews: humanAllowed, linkedinReviews: p.linkedinAllowed || 0, builderCredits: p.builderAllowed || 0, noAi: Boolean(p.noAi), validityDays: p.packageSnapshot?.validityDays ?? 0 }) },
    payment: { status: p.payment?.status, amount: toRupees(p.payment?.amount), gateway: p.payment?.gateway, paidAt: p.payment?.paidAt },
    ai: { enabled: !p.noAi, unlimited: !p.noAi && num(p.aiAllowed) === 0, allowed: num(p.aiAllowed), used: num(p.aiUsed), left: aiLeftOf(p) },
    builder: { enabled: (p.builderAllowed || 0) > 0, allowed: p.builderAllowed || 0, used: p.builderUsed || 0, left: builderLeftOf(p) },
    human: { enabled: humanAllowed > 0, allowed: humanAllowed, used: p.humanUsed || 0, left: humanLeftOf(p) },
    linkedin: { enabled: (p.linkedinAllowed || 0) > 0, allowed: p.linkedinAllowed || 0, used: p.linkedinUsed || 0, left: linkedinLeftOf(p) },
    expiresAt: p.expiresAt, revoked: Boolean(p.revokedAt), usable: canSubmit(p), state: reason === "" ? "active" : reason.toLowerCase(),
  };
};

/* Everything the person can still use, across all the plans they hold. Plans combine: credits add up. */
export const poolOf = (purchases) => {
  const live = purchases.filter((p) => unusableReason(p) === "");
  const submitters = live.filter((p) => !aiGone(p));
  const expiries = live.map((p) => p.expiresAt).filter(Boolean).map((d) => new Date(d).getTime());
  const humanTotal = live.reduce((n, p) => n + (p.humanAllowed || 0), 0);
  return {
    plans: live.length,
    aiUnlimited: submitters.some((p) => !p.noAi && num(p.aiAllowed) === 0),
    aiLeft: submitters.reduce((n, p) => n + (aiLeftOf(p) ?? 0), 0),
    aiAllowed: live.reduce((n, p) => n + num(p.aiAllowed), 0),
    humanAvailable: humanTotal > 0, // does any live plan hold human reviews at all (used or not)?
    humanLeft: live.reduce((n, p) => n + humanLeftOf(p), 0),
    humanAllowed: humanTotal,
    linkedinAvailable: live.some((p) => (p.linkedinAllowed || 0) > 0),
    linkedinLeft: live.reduce((n, p) => n + linkedinLeftOf(p), 0),
    linkedinAllowed: live.reduce((n, p) => n + (p.linkedinAllowed || 0), 0),
    builderAvailable: live.some((p) => (p.builderAllowed || 0) > 0),
    builderLeft: live.reduce((n, p) => n + builderLeftOf(p), 0),
    builderAllowed: live.reduce((n, p) => n + (p.builderAllowed || 0), 0),
    nextExpiry: expiries.length ? new Date(Math.min(...expiries)) : null,
    neverExpires: live.some((p) => !p.expiresAt),
  };
};

/* ---------- spending one AI review ---------- */
const liveNow = (now) => ({ "payment.status": "paid", revokedAt: null, $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] });
const aiFilter = (userId, now) => ({ user: userId, noAi: { $ne: true }, ...liveNow(now), $and: [{ $or: [{ aiAllowed: 0 }, { $expr: { $lt: ["$aiUsed", "$aiAllowed"] } }] }] });

/** One AI review, atomically: from `preferId` first, then the plan that expires soonest. Returns the purchase or null. */
export const spendAiAny = async (userId, preferId = null) => {
  const candidates = await ResumePurchase.find(aiFilter(userId, new Date())).select("_id expiresAt").lean();
  candidates.sort((a, b) => (String(a._id) === String(preferId) ? -1 : String(b._id) === String(preferId) ? 1 : (a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity) - (b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity)));
  for (const c of candidates) {
    const got = await ResumePurchase.findOneAndUpdate({ _id: c._id, ...aiFilter(userId, new Date()) }, { $inc: { aiUsed: 1 } }, { new: true });
    if (got) return got;
  }
  return null;
};

/* Shown the first time, so the page is never empty. The admin edits or hides these from the dashboard. */
const IN = (o = {}) => ({ resume: true, linkedin: false, jobMatch: false, humanReview: false, rewrittenResume: false, ...o });
export const DEFAULT_PLANS = [
  { key: "ai-49", name: "AI Check", sortOrder: 1, tagline: "One instant AI review of your resume.", pricePaise: 4900, compareAtPaise: 0, deliveryHours: 48, aiReviews: 1, humanReviews: 0, linkedinReviews: 0, validityDays: 30,
    includes: IN(), features: ["1 AI review, valid for 30 days", "Overall and ATS readiness score", "Section grades and missing keywords"] },
  { key: "ai-99", name: "AI Double", sortOrder: 2, tagline: "Two AI reviews to fix and re-check your resume.", pricePaise: 9900, compareAtPaise: 0, deliveryHours: 48, aiReviews: 2, humanReviews: 0, linkedinReviews: 0, validityDays: 60,
    includes: IN(), features: ["2 AI reviews, valid for 60 days", "Check your resume again after you fix it", "Rewritten bullets and keyword gaps"] },
  { key: "ai-199", name: "AI Plus", sortOrder: 3, tagline: "Five AI reviews and a LinkedIn profile review.", pricePaise: 19900, compareAtPaise: 0, deliveryHours: 48, aiReviews: 5, humanReviews: 0, linkedinReviews: 1, validityDays: 60,
    includes: IN({ linkedin: true }), features: ["5 AI reviews, valid for 60 days", "1 LinkedIn profile review", "Check every new version of your resume"] },
  { key: "starter-299", name: "Starter", sortOrder: 4, tagline: "AI, LinkedIn and a person's review for a month.", pricePaise: 29900, compareAtPaise: 0, deliveryHours: 48, aiReviews: 1, humanReviews: 1, linkedinReviews: 1, validityDays: 30,
    includes: IN({ humanReview: true, linkedin: true }), features: ["1 AI review", "1 human review by a working professional", "1 LinkedIn profile review", "Valid for 30 days"] },
  { key: "plus-499", name: "Plus", sortOrder: 5, tagline: "Tailor your resume to the jobs you apply for.", pricePaise: 49900, compareAtPaise: 0, deliveryHours: 48, aiReviews: 15, humanReviews: 1, linkedinReviews: 3, validityDays: 180,
    includes: IN({ humanReview: true, linkedin: true, jobMatch: true }), features: ["15 AI reviews over 6 months", "1 human review by a working professional", "3 LinkedIn profile reviews", "Job-description match on every review"] },
  { key: "pro-999", name: "Pro", badge: "Recommended", sortOrder: 6, tagline: "A full job search, with room to test every change.", pricePaise: 99900, compareAtPaise: 0, deliveryHours: 24, aiReviews: 40, humanReviews: 1, linkedinReviews: 8, validityDays: 180,
    includes: IN({ humanReview: true, linkedin: true, jobMatch: true }), features: ["40 AI reviews over 6 months", "1 human review, back within 24 hours", "8 LinkedIn profile reviews", "Job-description match on every review"] },
  { key: "power-1999", name: "Power", sortOrder: 7, tagline: "For coaches, mentors and small groups.", pricePaise: 199900, compareAtPaise: 0, deliveryHours: 24, aiReviews: 100, humanReviews: 2, linkedinReviews: 20, validityDays: 365,
    includes: IN({ humanReview: true, linkedin: true, jobMatch: true }), features: ["100 AI reviews for a year", "2 human reviews, back within 24 hours", "20 LinkedIn profile reviews", "Job-description match on every review"] },
  { key: "institute-9999", name: "Institute", sortOrder: 8, tagline: "Bulk reviews for colleges and training teams.", pricePaise: 999900, compareAtPaise: 0, deliveryHours: 24, aiReviews: 1500, humanReviews: 5, linkedinReviews: 100, validityDays: 0,
    includes: IN({ humanReview: true, linkedin: true, jobMatch: true }), features: ["1,500 AI reviews, never expire", "5 human reviews and 100 LinkedIn reviews", "One payment, no renewals"] },
];

/*
  Two starter plans that hold ONLY Resume Builder credits (no AI review, no human review). They are added once, next to the plans that already exist,
  without touching them. The admin edits or deletes them like any other plan, and can add builder credits to any plan from the plan form.
*/
export const BUILDER_PLANS = [
  { key: "builder-99", name: "Resume Builder", sortOrder: 20, tagline: "Let AI write a one-page resume for the job you want.", pricePaise: 9900, compareAtPaise: 0, deliveryHours: 48, aiReviews: 0, humanReviews: 0, linkedinReviews: 0, builderCredits: 2, validityDays: 60,
    includes: { resume: false, linkedin: false, jobMatch: false, humanReview: false, rewrittenResume: false, aiReview: false }, features: ["2 AI resume builds, valid for 60 days", "Built from your resume and a job description or target role", "Edit every line and link, then download the PDF"] },
  { key: "builder-249", name: "Resume Builder Pack", badge: "Best value", sortOrder: 21, tagline: "A tailored resume for every application.", pricePaise: 24900, compareAtPaise: 0, deliveryHours: 48, aiReviews: 0, humanReviews: 0, linkedinReviews: 0, builderCredits: 8, validityDays: 180,
    includes: { resume: false, linkedin: false, jobMatch: false, humanReview: false, rewrittenResume: false, aiReview: false }, features: ["8 AI resume builds over 6 months", "A new version for every job you apply to", "Edit every line and link, then download the PDF"] },
];

const ensureBuilderPlans = async () => {
  const won = await ResumeBuilderSettings.findOneAndUpdate({ key: "global", seededPlans: { $ne: true } }, { $set: { seededPlans: true } }, { upsert: true, new: true, setDefaultsOnInsert: true }).catch(() => null); // only one request wins the one-time seed
  if (!won) return;
  try { await ResumePackage.insertMany(BUILDER_PLANS, { ordered: false }); } catch { /* a plan with that key already exists: leave it */ }
};

/** Active plans in display order. Creates the starter set once if the admin has never added any, and the builder plans once on top of the existing ones. */
export const listActivePackages = async () => {
  if ((await ResumePackage.estimatedDocumentCount()) === 0) {
    try { await ResumePackage.insertMany(DEFAULT_PLANS, { ordered: false }); } catch { /* a parallel request created them first */ }
  }
  await ensureBuilderPlans();
  return ResumePackage.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
};

/** The snapshot stored on a purchase. Human reviews are zero when the admin has switched them off for the plan. */
export const snapshotOf = (pkg) => {
  const human = humanOf(pkg);
  const li = linkedinOf(pkg);
  const noAi = noAiOf(pkg);
  return {
    key: pkg.key, name: pkg.name, pricePaise: pkg.pricePaise, deliveryHours: pkg.deliveryHours, aiReviews: noAi ? 0 : pkg.aiReviews ?? 1, humanReviews: human, linkedinReviews: li, builderCredits: builderOf(pkg), validityDays: pkg.validityDays ?? 0,
    includes: { resume: !!pkg.includes?.resume, linkedin: li > 0, jobMatch: !!pkg.includes?.jobMatch, humanReview: human > 0, rewrittenResume: human > 0 && !!pkg.includes?.rewrittenResume, aiReview: !noAi },
  };
};

/* The allowances written onto a purchase. `builderOn` false = the builder is off, so a plan bought now holds no builder credits. */
export const allowancesOf = (snap, { builderOn = true } = {}) => ({
  aiAllowed: snap.aiReviews, humanAllowed: snap.humanReviews, linkedinAllowed: snap.linkedinReviews,
  builderAllowed: builderOn ? snap.builderCredits || 0 : 0, noAi: snap.includes?.aiReview === false,
});
