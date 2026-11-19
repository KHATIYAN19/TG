import ReferralSettings from "../../models/referral/ReferralSettings.js";
import ReferralPlan from "../../models/referral/ReferralPlan.js";
import ReferralOrder from "../../models/referral/ReferralOrder.js";
import ReferralRequest from "../../models/referral/ReferralRequest.js";
import ReferralMessage from "../../models/referral/ReferralMessage.js";
import ReferralSubPlan from "../../models/referral/ReferralSubPlan.js";
import ReferralSubscription from "../../models/referral/ReferralSubscription.js";
import { emitToUser } from "./hub.js";

/* ---------- the admin's switches (cached for a few seconds) ---------- */
const DEFAULT_PLANS = [
  { key: "chat-5", name: "5 chats", tagline: "Open five referral chats", pricePaise: 10000, compareAtPaise: 24500, unlocks: 5, validityDays: 90, badge: "Popular", features: ["5 chat unlocks", "Valid for 90 days", "Resume and details shared in every chat"], sortOrder: 1 },
  { key: "chat-12", name: "12 chats", tagline: "Best for an active job search", pricePaise: 19900, compareAtPaise: 58800, unlocks: 12, validityDays: 180, badge: "Best value", features: ["12 chat unlocks", "Valid for 180 days", "Resume and details shared in every chat"], sortOrder: 2 },
];
const DEFAULT_SUB_PLANS = [
  { key: "unlimited-monthly", kind: "unlimited", billing: "monthly", name: "Unlimited", tagline: "Unlimited requests and chats", pricePaise: 9900, badge: "Popular", features: ["Unlimited referral requests", "Every accepted chat opens free", "Cancel any time"], sortOrder: 1 },
  { key: "priority-10-days", kind: "priority", billing: "once", days: 10, name: "Priority · 10 days", tagline: "Be seen first for 10 days", pricePaise: 9900, features: ["Priority badge on your profile", "Your requests are listed first"], sortOrder: 1 },
  { key: "priority-monthly", kind: "priority", billing: "monthly", name: "Priority · monthly", tagline: "Stay on top every month", pricePaise: 14900, features: ["Priority badge on your profile", "Your requests are listed first", "Renews monthly, cancel any time"], sortOrder: 2 },
];
let cache = { at: 0, doc: null };
export const getSettings = async ({ fresh = false } = {}) => {
  if (!fresh && cache.doc && Date.now() - cache.at < 8000) return cache.doc;
  let doc = await ReferralSettings.findOne({ key: "global" }).lean();
  if (!doc) {
    try { await ReferralSettings.create({ key: "global" }); } catch { /* created by another request */ }
    doc = await ReferralSettings.findOne({ key: "global" }).lean();
  }
  if (!doc.seededPlans) {
    const claimed = await ReferralSettings.updateOne({ key: "global", seededPlans: { $ne: true } }, { $set: { seededPlans: true } });
    if (claimed.modifiedCount) for (const p of DEFAULT_PLANS) await ReferralPlan.updateOne({ key: p.key }, { $setOnInsert: p }, { upsert: true });
  }
  if (!doc.seededSubPlans) {
    const claimed = await ReferralSettings.updateOne({ key: "global", seededSubPlans: { $ne: true } }, { $set: { seededSubPlans: true } });
    if (claimed.modifiedCount) for (const p of DEFAULT_SUB_PLANS) await ReferralSubPlan.updateOne({ key: p.key }, { $setOnInsert: p }, { upsert: true });
  }
  cache = { at: Date.now(), doc };
  return doc;
};
export const forgetSettings = () => { cache = { at: 0, doc: null }; };

/* ---------- what a member's subscription / priority pass gives them ---------- */
/*
  A subscription gives access while it is paid up: active or past_due get a short grace (a renewal can be a few hours late or retrying),
  and a cancelled one keeps working until the period they paid for ends.
*/
export const GRACE_MS = 2 * 86400000;
export const liveSubFilter = (now = new Date()) => ({
  $or: [
    { status: "cancelled", currentPeriodEnd: { $gt: now } },
    { status: { $in: ["active", "past_due"] }, currentPeriodEnd: { $gt: new Date(now.getTime() - GRACE_MS) } },
  ],
});
export const hasUnlimited = async (userId) => Boolean(await ReferralSubscription.exists({ user: userId, kind: "unlimited", ...liveSubFilter() }));
/* the set of these members (ids as strings) who hold a priority pass right now: a priority subscription or a paid one-time pass */
export const priorityFor = async (userIds) => {
  const ids = [...new Set((userIds || []).map(String))];
  if (!ids.length) return new Set();
  const now = new Date();
  const [subs, passes] = await Promise.all([
    ReferralSubscription.find({ user: { $in: ids }, kind: "priority", ...liveSubFilter(now) }).distinct("user"),
    ReferralOrder.find({ user: { $in: ids }, kind: "priority", "payment.status": "paid", revokedAt: null, expiresAt: { $gt: now } }).distinct("user"),
  ]);
  return new Set([...subs, ...passes].map(String));
};
export const hasPriority = async (userId) => (await priorityFor([userId])).has(String(userId));

/* ---------- how a person is shown to others ---------- */
export const ANON = "Anonymous";
export const initials = (name) => String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
export const publicPerson = (profile, user) => {
  const real = profile?.displayName || user?.name || "Member";
  const anonymous = Boolean(profile?.hideName);
  return {
    name: anonymous ? ANON : real, anonymous, initials: anonymous ? "?" : initials(real),
    company: profile?.company || "", role: profile?.role || "", yearsExp: profile?.yearsExp ?? 0, location: profile?.location || "",
    headline: profile?.headline || "", skills: profile?.skills || [], bio: profile?.bio || "", linkedin: anonymous ? "" : profile?.linkedin || "",
  };
};

/* ---------- chat credits ---------- */
const liveBucket = (userId) => ({
  user: userId, kind: { $in: ["plan", "grant"] }, "payment.status": "paid", revokedAt: null,
  $and: [{ $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] }, { $expr: { $lt: ["$used", "$allowed"] } }],
});
export const creditsLeft = async (userId) => {
  const rows = await ReferralOrder.find(liveBucket(userId)).select("allowed used expiresAt").lean();
  return { left: rows.reduce((n, r) => n + Math.max(0, r.allowed - r.used), 0), nextExpiry: rows.map((r) => r.expiresAt).filter(Boolean).sort((a, b) => a - b)[0] || null };
};
/* one credit, taken atomically from the bucket that ends soonest */
export const spendCredit = async (userId) => {
  const rows = await ReferralOrder.find(liveBucket(userId)).select("_id expiresAt").lean();
  rows.sort((a, b) => (a.expiresAt ? a.expiresAt.getTime() : Infinity) - (b.expiresAt ? b.expiresAt.getTime() : Infinity));
  for (const r of rows) {
    const hit = await ReferralOrder.findOneAndUpdate({ _id: r._id, ...liveBucket(userId) }, { $inc: { used: 1 } }, { new: true }).select("_id").lean();
    if (hit) return String(hit._id);
  }
  return null;
};
export const giveBackCredit = (orderId) => ReferralOrder.updateOne({ _id: orderId, used: { $gt: 0 } }, { $inc: { used: -1 } });

/* ---------- messages ---------- */
export const REACTIONS = ["👍", "❤️", "😂", "🙏", "🎉", "👀"];
export const cleanText = (v) => String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").replace(/\r\n?/g, "\n").replace(/\n{4,}/g, "\n\n\n").trim();
export const MAX_TEXT = 2000;
const same = (a, b) => String(a) === String(b);

export const messageView = (m, viewerId) => {
  const gone = Boolean(m.deletedAt);
  const counts = new Map();
  for (const r of m.reactions || []) { const c = counts.get(r.emoji) || { emoji: r.emoji, count: 0, mine: false }; c.count += 1; if (same(r.user, viewerId)) c.mine = true; counts.set(r.emoji, c); }
  return {
    id: String(m._id), system: Boolean(m.system), mine: !m.system && same(m.sender, viewerId), text: gone ? "" : m.text, deleted: gone, edited: Boolean(m.editedAt) && !gone,
    replyTo: m.replyTo ? { id: String(m.replyTo), text: m.replyText || "", mine: same(m.replySender, viewerId) } : null,
    reactions: gone ? [] : [...counts.values()], createdAt: m.createdAt,
  };
};

const sides = (r) => [String(r.seeker), String(r.referrer)];
const tell = (r, event) => sides(r).forEach((u) => emitToUser(u, event));
/*
  Send a live event to both people, EXCEPT: while the sender (seeker) hasn't unlocked the chat they get a content-free
  "something changed" nudge instead. The referrer who accepted can already write; the sender must not be able to read it.
*/
export const fanOut = (r, build) =>
  sides(r).forEach((u) => emitToUser(u, !r.chat?.unlocked && same(u, r.seeker) ? { type: "request_updated", requestId: String(r._id), status: r.status, chatUnlocked: false } : build(u)));
export const tellRequest = (r, extra = {}) => tell(r, { type: "request_updated", requestId: String(r._id), status: r.status, chatUnlocked: Boolean(r.chat?.unlocked), ...extra });

export const systemMessage = async (request, text) => {
  const m = await ReferralMessage.create({ request: request._id, system: true, text });
  await ReferralRequest.updateOne({ _id: request._id }, { $set: { "last.text": text, "last.at": m.createdAt, "last.sender": null } });
  fanOut(request, (u) => ({ type: "message", requestId: String(request._id), message: messageView(m, u) }));
  return m;
};

/* ---------- opening and ending a chat ---------- */
/* flips an accepted request to an open chat, once (safe to call twice) */
export const openChat = async (requestId, via) => {
  const r = await ReferralRequest.findOneAndUpdate(
    { _id: requestId, status: "accepted", "chat.unlocked": false },
    { $set: { "chat.unlocked": true, "chat.unlockedAt": new Date(), "chat.unlockedVia": via } },
    { new: true }
  );
  if (!r) return null;
  await systemMessage(r, "The chat is open. Say hello and share anything else that helps the referral.");
  tellRequest(r);
  return r;
};

export const endChat = async (request, { by = null, admin = false, reason = "" } = {}) => {
  const r = await ReferralRequest.findOneAndUpdate(
    { _id: request._id, status: "accepted" },
    { $set: { status: "ended", "chat.endedAt": new Date(), "chat.endedBy": by, "chat.endedByAdmin": admin, "chat.endReason": String(reason).slice(0, 300) } },
    { new: true }
  );
  if (!r) return null;
  await systemMessage(r, admin ? "This chat was closed by the Target Trek team." : "This chat has ended.");
  tellRequest(r);
  return r;
};

/* ---------- what each side sees of a request ---------- */
export const requestView = (r, { viewerId, profiles = {}, users = {}, admin = false, vip = new Set() } = {}) => {
  const seekerId = String(r.seeker?._id || r.seeker);
  const referrerId = String(r.referrer?._id || r.referrer);
  const asSeeker = !admin && same(viewerId, seekerId);
  const hideChat = asSeeker && !r.chat?.unlocked;
  const referrerProfile = profiles[referrerId];
  const seekerProfile = profiles[seekerId];
  const referrer = admin ? { name: referrerProfile?.displayName || users[referrerId]?.name || "Member", company: r.company, role: r.referrerRole, hidden: Boolean(referrerProfile?.hideName), email: users[referrerId]?.email || "" } : publicPerson(referrerProfile || { company: r.company, role: r.referrerRole }, users[referrerId]);
  const seeker = admin
    ? { name: r.seekerInfo?.name || users[seekerId]?.name || "Member", email: users[seekerId]?.email || "", ...r.seekerInfo }
    : { ...r.seekerInfo, name: r.seekerInfo?.name || users[seekerId]?.name || "Member", anonymous: false, headline: seekerProfile?.headline || "", bio: seekerProfile?.bio || "", priority: Boolean(r.priority) };
  return {
    priority: Boolean(r.priority),
    // the OTHER person in this chat holds a priority pass right now (shown as an icon next to their name)
    peerPriority: !admin && vip.has(asSeeker ? referrerId : seekerId),
    id: String(r._id), role: admin ? "admin" : asSeeker ? "seeker" : "referrer", status: r.status, company: r.company, job: r.job, message: r.message,
    resume: r.resume?.key ? { filename: r.resume.filename, size: r.resume.size } : null,
    seeker, referrer, rejectReason: r.rejectReason || "", decidedAt: r.decidedAt, createdAt: r.createdAt, updatedAt: r.updatedAt,
    chat: { unlocked: Boolean(r.chat?.unlocked), unlockedAt: r.chat?.unlockedAt, via: r.chat?.unlockedVia || "", endedAt: r.chat?.endedAt, endedBy: r.chat?.endedByAdmin ? "admin" : r.chat?.endedBy ? (same(r.chat.endedBy, viewerId) ? "me" : "them") : "", endReason: r.chat?.endReason || "" },
    needsUnlock: r.status === "accepted" && !r.chat?.unlocked,
    // The sender can't see ANY message text until the chat is unlocked: only how many are waiting.
    last: hideChat ? null : r.last?.at ? { text: r.last.text, at: r.last.at, mine: same(r.last.sender, viewerId) } : null,
    waiting: hideChat ? r.unread?.seeker || 0 : 0,
    unread: admin ? 0 : asSeeker ? r.unread?.seeker || 0 : r.unread?.referrer || 0,
    isNew: !admin && !asSeeker && r.status === "pending" && !r.referrerSeen,
  };
};

/* ---------- the sender pays, the referrer never does ---------- */

/*
  Accepted requests whose chat is still locked: if the sender has a credit, spend ONE per request and open it.
  Called when the referrer accepts, when the sender opens the app, and when credits arrive (purchase, grant).
*/
export const autoUnlockFor = async (userId) => {
  const waiting = await ReferralRequest.find({ seeker: userId, status: "accepted", "chat.unlocked": false }).sort({ decidedAt: 1 }).select("_id").limit(25).lean();
  let opened = 0;
  const unlimited = waiting.length ? await hasUnlimited(userId) : false;
  for (const w of waiting) {
    if (unlimited) { if (await openChat(w._id, "subscription")) opened += 1; continue; } // a subscriber's chats are free: no credit is spent
    const credit = await spendCredit(userId);
    if (!credit) break;
    if (await openChat(w._id, "credit")) opened += 1;
    else await giveBackCredit(credit);
  }
  return opened;
};

/* The admin's free credits: once per member, the first time they open the referral app. Never twice. */
export const grantSignupCredits = async (userId) => {
  try {
    const s = await getSettings();
    if (!(s.signupCredits > 0)) return 0;
    if (await ReferralOrder.exists({ user: userId, source: "signup" })) return 0;
    await ReferralOrder.create({ user: userId, kind: "grant", source: "signup", title: "Free chat credits", allowed: s.signupCredits, validityDays: 0, expiresAt: null, note: "Free credits on first login", payment: { amount: 0, gateway: "admin", status: "paid", paidAt: new Date() } });
    return s.signupCredits;
  } catch (e) {
    if (e?.code !== 11000) console.error("[referral] signup credits failed:", e?.message || e); // 11000: a parallel request already granted them
    return 0;
  }
};
