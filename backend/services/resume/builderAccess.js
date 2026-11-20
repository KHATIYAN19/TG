import ResumeBuilderSettings from "../../models/resume/ResumeBuilderSettings.js";
import ResumeDraft from "../../models/resume/ResumeDraft.js";
import ResumePurchase from "../../models/resume/ResumePurchase.js";
import { ResumeError, builderLeftOf, poolOf } from "./service.js";

/*
  WHO CAN USE THE RESUME BUILDER, AND WHAT IT COSTS.
    The admin's switch (ResumeBuilderSettings.mode):
      on        everyone sees it. Anyone with a builder credit can build; others are sent to the plans.
      existing  off for NEW members. Only people who already hold builder credits (or already have builder resumes) still see and use it.
      off       off completely. Hidden and blocked for everyone. Nothing is deleted, so turning it back on restores every resume.
    One credit is taken when the person presses Build (see spendBuilder) and given back if that resume is deleted before it was ever written.
*/
export const MODES = ["on", "existing", "off"];

const TTL_MS = 15_000;
let cache = { at: 0, doc: null };

export const readBuilderSettings = async ({ fresh = false } = {}) => {
  if (!fresh && cache.at && Date.now() - cache.at < TTL_MS) return cache.doc;
  const doc = await ResumeBuilderSettings.findOne({ key: "global" }).lean();
  cache = { at: Date.now(), doc };
  return doc;
};
export const forgetBuilderSettings = () => { cache = { at: 0, doc: null }; };

/** "on" | "existing" | "off". Never throws: if the setting can't be read the builder stays off. */
export const builderMode = async () => {
  try { return (await readBuilderSettings())?.mode || "off"; } catch { return "off"; }
};

export const saveBuilderMode = async ({ mode, userId, userName }) => {
  if (!MODES.includes(mode)) throw new ResumeError(400, "Choose on, off for new members, or off.", "VALIDATION_FAILED");
  const before = (await readBuilderSettings({ fresh: true }))?.mode || "off";
  const doc = await ResumeBuilderSettings.findOneAndUpdate(
    { key: "global" },
    { $set: { mode, updatedBy: userId || null }, $push: { history: { $each: [{ from: before, to: mode, by: userId || null, byName: userName || "", at: new Date() }], $slice: -30 } } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  forgetBuilderSettings();
  return doc;
};

const liveFilter = (now) => ({ "payment.status": "paid", revokedAt: null, $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] });

const livePurchases = (userId) => ResumePurchase.find({ user: userId, ...liveFilter(new Date()) }).lean();

/**
 * The builder as one person sees it.
 *   visible   show the builder in menus and let them open the pages
 *   canBuild  they can start a new resume right now (needs a credit)
 *   left / allowed   credits across all their live plans (they add up)
 */
/* `known` = the person's pool, when the caller already worked it out (saves a query) */
export const builderStatusFor = async (userId, known = null) => {
  const mode = await builderMode();
  const pool = known || poolOf(await livePurchases(userId));
  const hasCredits = pool.builderAvailable;
  let visible = false;
  if (mode === "on") visible = true;
  else if (mode === "existing") visible = hasCredits || (await ResumeDraft.exists({ user: userId }).then(Boolean));
  const canBuild = visible && pool.builderLeft > 0;
  return { mode, visible, canBuild, left: pool.builderLeft, allowed: pool.builderAllowed, available: hasCredits, nextExpiry: pool.nextExpiry };
};

/** Throws unless this person may open the builder at all. */
export const assertBuilderOpen = async (userId) => {
  const s = await builderStatusFor(userId);
  if (!s.visible) throw new ResumeError(403, s.mode === "off" ? "The resume builder isn't available right now." : "The resume builder is no longer offered to new members.", "BUILDER_OFF");
  return s;
};

/* One credit, from the plan that expires first, atomically: two tabs can never spend the last one twice. Returns the purchase or null. */
export const spendBuilder = async (userId) => {
  const filter = (now) => ({ user: userId, ...liveFilter(now), builderAllowed: { $gt: 0 }, $expr: { $lt: ["$builderUsed", "$builderAllowed"] } });
  const candidates = await ResumePurchase.find(filter(new Date())).select("_id expiresAt").lean();
  candidates.sort((a, b) => (a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity) - (b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity));
  for (const c of candidates) {
    const got = await ResumePurchase.findOneAndUpdate({ _id: c._id, ...filter(new Date()) }, { $inc: { builderUsed: 1 } }, { new: true });
    if (got) return got;
  }
  return null;
};

export const refundBuilder = (purchaseId) => ResumePurchase.updateOne({ _id: purchaseId, builderUsed: { $gt: 0 } }, { $inc: { builderUsed: -1 } });

/* a resume that was never written costs nothing: give its credit back (once) */
export const refundDraftCredit = async (draft) => {
  const c = draft?.credit;
  if (!c?.spent || c.refunded || !c.purchase || draft.wasReady || draft.phase === "ready") return false;
  const won = await ResumeDraft.updateOne({ _id: draft._id, "credit.refunded": { $ne: true } }, { $set: { "credit.refunded": true } });
  if (!won.modifiedCount) return false;
  await refundBuilder(c.purchase);
  return true;
};

export { builderLeftOf };
