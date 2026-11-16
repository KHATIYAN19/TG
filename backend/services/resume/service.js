import mongoose from "mongoose";

import ResumePackage from "../../models/resume/ResumePackage.js";
import ResumeBlock from "../../models/resume/ResumeBlock.js";

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
export const aiLeftOf = (p) => (num(p.aiAllowed) === 0 ? null : Math.max(0, num(p.aiAllowed) - num(p.aiUsed))); // null = unlimited
export const humanLeftOf = (p) => Math.max(0, num(p.humanAllowed) - num(p.humanUsed));
export const linkedinLeftOf = (p) => Math.max(0, num(p.linkedinAllowed) - num(p.linkedinUsed));
const aiGone = (p) => num(p.aiAllowed) > 0 && num(p.aiUsed) >= num(p.aiAllowed);

/** Why a purchase can't be used at all right now, or "" when it still holds something to use. */
export const unusableReason = (p, now = now0()) => {
  if (p.payment?.status !== "paid") return "UNPAID";
  if (p.revokedAt) return "REVOKED";
  if (p.expiresAt && new Date(p.expiresAt).getTime() <= now) return "EXPIRED";
  if (aiGone(p) && humanLeftOf(p) === 0 && linkedinLeftOf(p) === 0) return "USED_UP";
  return "";
};
/** Can another resume be sent in under it? (needs an AI review left) */
export const canSubmit = (p, now = now0()) => unusableReason(p, now) === "" && !aiGone(p);

const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
export const planTerms = ({ aiReviews, humanReviews, linkedinReviews = 0, validityDays }) => {
  const ai = aiReviews === 0 ? "Unlimited AI reviews" : plural(aiReviews, "AI review");
  const human = humanReviews > 0 ? plural(humanReviews, "human review") : "";
  const li = linkedinReviews > 0 ? plural(linkedinReviews, "LinkedIn review") : "";
  const time = !validityDays ? "no expiry" : validityDays % 365 === 0 ? `valid ${plural(validityDays / 365, "year")}` : `valid ${validityDays} days`;
  return `${[ai, human, li].filter(Boolean).join(" + ")} · ${time}`;
};

/** How many human reviews a plan really gives: the count, unless the admin switched human review off. */
export const linkedinOf = (pkg) => Math.max(0, pkg?.linkedinReviews ?? 0);
export const humanOf = (pkg) => (pkg?.includes?.humanReview !== false ? Math.max(0, pkg?.humanReviews ?? 0) : 0);

export const packageOut = (p) => {
  const human = humanOf(p);
  const li = linkedinOf(p);
  const ai = p.aiReviews ?? 1;
  return {
    id: String(p._id), key: p.key, name: p.name, tagline: p.tagline, description: p.description, badge: p.badge,
    price: toRupees(p.pricePaise), compareAt: p.compareAtPaise > p.pricePaise ? toRupees(p.compareAtPaise) : 0,
    ai: { reviews: ai }, human: { enabled: human > 0, reviews: human, switch: p.includes?.humanReview !== false, configured: p.humanReviews ?? 0 },
    linkedin: { enabled: li > 0, reviews: li },
    validityDays: p.validityDays ?? 0, terms: planTerms({ aiReviews: ai, humanReviews: human, linkedinReviews: li, validityDays: p.validityDays ?? 0 }),
    includes: { resume: !!p.includes?.resume, linkedin: li > 0, jobMatch: !!p.includes?.jobMatch, humanReview: human > 0, rewrittenResume: human > 0 && !!p.includes?.rewrittenResume },
    features: p.features || [], deliveryHours: p.deliveryHours, isActive: p.isActive, sortOrder: p.sortOrder,
  };
};

export const purchaseOut = (p) => {
  const reason = unusableReason(p);
  const humanAllowed = p.humanAllowed || 0;
  return {
    id: String(p._id), createdAt: p.createdAt,
    package: { name: p.packageSnapshot?.name, key: p.packageSnapshot?.key, price: toRupees(p.packageSnapshot?.pricePaise), deliveryHours: p.packageSnapshot?.deliveryHours, includes: p.packageSnapshot?.includes, terms: planTerms({ aiReviews: p.aiAllowed, humanReviews: humanAllowed, linkedinReviews: p.linkedinAllowed || 0, validityDays: p.packageSnapshot?.validityDays ?? 0 }) },
    payment: { status: p.payment?.status, amount: toRupees(p.payment?.amount), gateway: p.payment?.gateway, paidAt: p.payment?.paidAt },
    ai: { unlimited: num(p.aiAllowed) === 0, allowed: num(p.aiAllowed), used: num(p.aiUsed), left: aiLeftOf(p) },
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
    aiUnlimited: submitters.some((p) => num(p.aiAllowed) === 0),
    aiLeft: submitters.reduce((n, p) => n + (aiLeftOf(p) ?? 0), 0),
    aiAllowed: live.reduce((n, p) => n + num(p.aiAllowed), 0),
    humanAvailable: humanTotal > 0, // does any live plan hold human reviews at all (used or not)?
    humanLeft: live.reduce((n, p) => n + humanLeftOf(p), 0),
    humanAllowed: humanTotal,
    linkedinAvailable: live.some((p) => (p.linkedinAllowed || 0) > 0),
    linkedinLeft: live.reduce((n, p) => n + linkedinLeftOf(p), 0),
    linkedinAllowed: live.reduce((n, p) => n + (p.linkedinAllowed || 0), 0),
    nextExpiry: expiries.length ? new Date(Math.min(...expiries)) : null,
    neverExpires: live.some((p) => !p.expiresAt),
  };
};

/* Shown the first time, so the page is never empty. The admin edits or hides these from the dashboard. */
const IN = (o = {}) => ({ resume: true, linkedin: false, jobMatch: false, humanReview: false, rewrittenResume: false, ...o });
export const DEFAULT_PLANS = [
  { key: "ai-1", name: "AI Check", sortOrder: 1, tagline: "One instant AI review of your resume.", pricePaise: 9900, compareAtPaise: 0, deliveryHours: 48, aiReviews: 1, humanReviews: 0, linkedinReviews: 0, validityDays: 0,
    includes: IN(), features: ["Overall and ATS readiness score", "Section grades and missing keywords", "Weak bullets rewritten"] },
  { key: "ai-3", name: "AI Triple", sortOrder: 2, tagline: "Three AI reviews to fix and re-check your resume.", pricePaise: 19900, compareAtPaise: 0, deliveryHours: 48, aiReviews: 3, humanReviews: 0, linkedinReviews: 0, validityDays: 0,
    includes: IN(), features: ["Check every new version of your resume", "Overall and ATS readiness score", "Rewritten bullets and keyword gaps"] },
  { key: "human-1", name: "Human Review", sortOrder: 3, tagline: "A working professional reviews your resume.", pricePaise: 24900, compareAtPaise: 0, deliveryHours: 48, aiReviews: 1, humanReviews: 1, linkedinReviews: 0, validityDays: 0,
    includes: IN({ humanReview: true }), features: ["Detailed feedback from a working professional", "Instant AI report on the same resume", "Clear list of what to change first"] },
  { key: "starter-30", name: "Starter · 30 days", badge: "", sortOrder: 4, tagline: "AI, LinkedIn and a person's review for a month.", pricePaise: 49900, compareAtPaise: 0, deliveryHours: 48, aiReviews: 5, humanReviews: 1, linkedinReviews: 2, validityDays: 30,
    includes: IN({ humanReview: true }), features: ["5 AI reviews to test every change", "1 human review by a working professional", "2 LinkedIn profile reviews"] },
  { key: "plus-30", name: "Plus · 30 days", badge: "Recommended", sortOrder: 0, tagline: "Tailor your resume to every job you apply for.", pricePaise: 99900, compareAtPaise: 0, deliveryHours: 24, aiReviews: 20, humanReviews: 1, linkedinReviews: 2, validityDays: 30,
    includes: IN({ humanReview: true, jobMatch: true }), features: ["20 AI reviews in 30 days", "Match each version to a job description", "Human review back within 24 hours", "1 human review and 2 LinkedIn reviews"] },
  { key: "pro-180", name: "Pro · 6 months", sortOrder: 6, tagline: "A full job search, or a small group of students.", pricePaise: 199900, compareAtPaise: 0, deliveryHours: 24, aiReviews: 100, humanReviews: 1, linkedinReviews: 20, validityDays: 180,
    includes: IN({ humanReview: true, jobMatch: true }), features: ["100 AI reviews over 6 months", "20 LinkedIn profile reviews", "Job-description match on every review"] },
  { key: "power-365", name: "Power · 1 year", sortOrder: 7, tagline: "For coaches, mentors and placement cells.", pricePaise: 399900, compareAtPaise: 0, deliveryHours: 24, aiReviews: 500, humanReviews: 1, linkedinReviews: 100, validityDays: 365,
    includes: IN({ humanReview: true, jobMatch: true }), features: ["500 AI reviews for 365 days", "100 LinkedIn profile reviews", "Job-description match on every review"] },
  { key: "institute", name: "Institute · No expiry", sortOrder: 8, tagline: "Bulk reviews for colleges and training teams.", pricePaise: 999900, compareAtPaise: 0, deliveryHours: 24, aiReviews: 1000, humanReviews: 2, linkedinReviews: 250, validityDays: 0,
    includes: IN({ humanReview: true, jobMatch: true }), features: ["1,000 AI reviews, never expire", "250 LinkedIn profile reviews and 2 human reviews", "One payment, no renewals"] },
];

/** Active plans in display order. Creates the starter set once if the admin has never added any. */
export const listActivePackages = async () => {
  if ((await ResumePackage.estimatedDocumentCount()) === 0) {
    try { await ResumePackage.insertMany(DEFAULT_PLANS, { ordered: false }); } catch { /* a parallel request created them first */ }
  }
  return ResumePackage.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
};

/** The snapshot stored on a purchase. Human reviews are zero when the admin has switched them off for the plan. */
export const snapshotOf = (pkg) => {
  const human = humanOf(pkg);
  const li = linkedinOf(pkg);
  return {
    key: pkg.key, name: pkg.name, pricePaise: pkg.pricePaise, deliveryHours: pkg.deliveryHours, aiReviews: pkg.aiReviews ?? 1, humanReviews: human, linkedinReviews: li, validityDays: pkg.validityDays ?? 0,
    includes: { resume: !!pkg.includes?.resume, linkedin: li > 0, jobMatch: !!pkg.includes?.jobMatch, humanReview: human > 0, rewrittenResume: human > 0 && !!pkg.includes?.rewrittenResume },
  };
};
