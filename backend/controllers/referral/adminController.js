import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { z } from "zod";

import ReferralProfile from "../../models/referral/ReferralProfile.js";
import ReferralPost from "../../models/referral/ReferralPost.js";
import ReferralRequest from "../../models/referral/ReferralRequest.js";
import ReferralMessage from "../../models/referral/ReferralMessage.js";
import ReferralPlan from "../../models/referral/ReferralPlan.js";
import ReferralOrder from "../../models/referral/ReferralOrder.js";
import ReferralSettings from "../../models/referral/ReferralSettings.js";
import ReferralSubPlan from "../../models/referral/ReferralSubPlan.js";
import ReferralSubscription from "../../models/referral/ReferralSubscription.js";
import ReferralSubCharge from "../../models/referral/ReferralSubCharge.js";
import User from "../../models/User.js";
import { createDownloadUrl } from "../../services/storage/s3.js";
import { ResumeError, assertId, parse, sendError, toRupees } from "../../services/resume/service.js";
import { autoUnlockFor, endChat, forgetSettings, getSettings, openChat, tellRequest } from "../../services/referral/core.js";
import { history } from "../../services/referral/chat.js";
import { disconnectUser } from "../../services/referral/hub.js";
import { cancelOwn, chargeOut, isLive, subOut, subPlanOut, syncSubscription } from "../../services/referral/subscriptions.js";

const uid = (req) => String(req.user?.id || req.user?._id);
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const handler = (fn) => asyncHandler(async (req, res) => { try { await fn(req, res); } catch (err) { return sendError(res, err); } });
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const num = (v, d, min, max) => Math.min(max, Math.max(min, Number.parseInt(v, 10) || d));
const paged = (req, d = 20) => { const page = num(req.query.page, 1, 1, 1000), limit = num(req.query.limit, d, 1, 100); return { page, limit, skip: (page - 1) * limit }; };
const pages = (total, limit) => Math.max(1, Math.ceil(total / limit));

export const stats = handler(async (req, res) => {
  const day = new Date(Date.now() - 7 * 86400000);
  const [profiles, referrers, posts, pending, accepted, openChats, locked, ended, rejected, revenue, week, unlocks] = await Promise.all([
    ReferralProfile.countDocuments(), ReferralProfile.countDocuments({ canRefer: true, status: "active" }), ReferralPost.countDocuments({ status: "open", hidden: false }),
    ReferralRequest.countDocuments({ status: "pending" }), ReferralRequest.countDocuments({ status: "accepted" }), ReferralRequest.countDocuments({ status: "accepted", "chat.unlocked": true }),
    ReferralRequest.countDocuments({ status: "accepted", "chat.unlocked": false }), ReferralRequest.countDocuments({ status: "ended" }), ReferralRequest.countDocuments({ status: "rejected" }),
    ReferralOrder.aggregate([{ $match: { "payment.status": "paid", "payment.gateway": { $ne: "admin" } } }, { $group: { _id: null, paise: { $sum: "$payment.amount" }, n: { $sum: 1 } } }]),
    ReferralOrder.aggregate([{ $match: { "payment.status": "paid", "payment.gateway": { $ne: "admin" }, "payment.paidAt": { $gte: day } } }, { $group: { _id: null, paise: { $sum: "$payment.amount" } } }]),
    ReferralRequest.countDocuments({ "chat.unlocked": true }),
  ]);
  const [activeSubs, mrr, priorityNow] = await Promise.all([
    ReferralSubscription.countDocuments({ status: { $in: ["active", "past_due"] } }),
    ReferralSubscription.aggregate([{ $match: { status: { $in: ["active", "past_due"] } } }, { $group: { _id: null, paise: { $sum: "$pricePaise" } } }]),
    ReferralSubscription.countDocuments({ kind: "priority", status: { $in: ["active", "past_due"] } }),
  ]);
  ok(res, { subscriptions: { active: activeSubs, pastDue: await ReferralSubscription.countDocuments({ status: "past_due" }), monthly: toRupees(mrr[0]?.paise), priority: priorityNow }, profiles, referrers, posts, requests: { pending, accepted, openChats, locked, ended, rejected }, unlocks, revenue: toRupees(revenue[0]?.paise), payments: revenue[0]?.n || 0, revenueWeek: toRupees(week[0]?.paise) });
});

/* ---------- requests and chats ---------- */
const people = async (rows) => {
  const ids = [...new Set(rows.flatMap((r) => [String(r.seeker), String(r.referrer)]))];
  const [users, profiles] = await Promise.all([User.find({ _id: { $in: ids } }).select("name email").lean(), ReferralProfile.find({ user: { $in: ids } }).select("user displayName hideName company role").lean()]);
  return { users: Object.fromEntries(users.map((u) => [String(u._id), u])), profiles: Object.fromEntries(profiles.map((p) => [String(p.user), p])) };
};
const rowOut = (r, ctx) => {
  const s = ctx.users[String(r.seeker)] || {}, f = ctx.users[String(r.referrer)] || {}, fp = ctx.profiles[String(r.referrer)] || {};
  return {
    id: String(r._id), status: r.status, company: r.company, job: r.job, message: r.message, createdAt: r.createdAt, decidedAt: r.decidedAt, updatedAt: r.updatedAt, rejectReason: r.rejectReason,
    seeker: { id: String(r.seeker), name: r.seekerInfo?.name || s.name || "", email: s.email || "", role: r.seekerInfo?.currentRole, company: r.seekerInfo?.currentCompany, yearsExp: r.seekerInfo?.yearsExp, noticePeriod: r.seekerInfo?.noticePeriod, linkedin: r.seekerInfo?.linkedin, portfolio: r.seekerInfo?.portfolio },
    referrer: { id: String(r.referrer), name: fp.displayName || f.name || "", email: f.email || "", hidesName: Boolean(fp.hideName), role: r.referrerRole, company: r.company },
    resume: r.resume?.key ? { filename: r.resume.filename, size: r.resume.size } : null,
    chat: { unlocked: Boolean(r.chat?.unlocked), via: r.chat?.unlockedVia || "", unlockedAt: r.chat?.unlockedAt, endedAt: r.chat?.endedAt, endedByAdmin: Boolean(r.chat?.endedByAdmin), endReason: r.chat?.endReason || "" },
    last: r.last?.at ? { text: r.last.text, at: r.last.at } : null,
  };
};
export const listRequests = handler(async (req, res) => {
  const { page, limit, skip } = paged(req);
  const find = {};
  if (["pending", "accepted", "rejected", "cancelled", "ended"].includes(req.query.status)) find.status = req.query.status;
  if (req.query.locked === "1") { find.status = "accepted"; find["chat.unlocked"] = false; }
  if (req.query.live === "1") { find.status = "accepted"; find["chat.unlocked"] = true; }
  const q = String(req.query.q || "").trim();
  if (q) {
    const users = await User.find({ $or: [{ name: { $regex: esc(q), $options: "i" } }, { email: { $regex: esc(q), $options: "i" } }] }).select("_id").limit(50).lean();
    find.$or = [{ company: { $regex: esc(q), $options: "i" } }, { "job.jobId": q }, { seeker: { $in: users.map((u) => u._id) } }, { referrer: { $in: users.map((u) => u._id) } }];
  }
  const [total, rows] = await Promise.all([ReferralRequest.countDocuments(find), ReferralRequest.find(find).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean()]);
  const ctx = await people(rows);
  ok(res, { items: rows.map((r) => rowOut(r, ctx)), total, page, pages: pages(total, limit) });
});
export const getRequest = handler(async (req, res) => {
  assertId(req.params.id, "request");
  const r = await ReferralRequest.findById(req.params.id).lean();
  if (!r) throw new ResumeError(404, "Request not found.", "NOT_FOUND");
  const ctx = await people([r]);
  const chat = await history({ requestId: r._id, admin: true, limit: 100 });
  ok(res, { request: rowOut(r, ctx), messages: chat.items, more: chat.more });
});
export const moreMessages = handler(async (req, res) => ok(res, await history({ requestId: req.params.id, admin: true, before: req.query.before, limit: 100 })));
export const resumeLink = handler(async (req, res) => {
  assertId(req.params.id, "request");
  const r = await ReferralRequest.findById(req.params.id).lean();
  if (!r?.resume?.key) throw new ResumeError(404, "There is no resume.", "NO_FILE");
  ok(res, { url: (await createDownloadUrl(r.resume.key, { filename: r.resume.filename || "resume", inline: true, sensitive: true })).url });
});
export const endRequest = handler(async (req, res) => {
  assertId(req.params.id, "request");
  const r = await ReferralRequest.findById(req.params.id);
  if (!r) throw new ResumeError(404, "Request not found.", "NOT_FOUND");
  if (!(await endChat(r, { admin: true, by: uid(req), reason: String(req.body?.reason || "") }))) throw new ResumeError(409, "Only an accepted chat can be ended.", "NOT_ACTIVE");
  ok(res, { ended: true });
});
export const unlockRequest = handler(async (req, res) => {
  assertId(req.params.id, "request");
  if (!(await openChat(req.params.id, "admin"))) throw new ResumeError(409, "This chat is not waiting to be unlocked.", "NOT_LOCKED");
  ok(res, { unlocked: true });
});
export const deleteRequest = handler(async (req, res) => {
  assertId(req.params.id, "request");
  const r = await ReferralRequest.findById(req.params.id);
  if (!r) throw new ResumeError(404, "Request not found.", "NOT_FOUND");
  await ReferralMessage.deleteMany({ request: r._id });
  await ReferralRequest.deleteOne({ _id: r._id });
  r.status = "ended"; r.chat = { ...(r.chat?.toObject?.() || {}), unlocked: false }; tellRequest(r, { removed: true });
  ok(res, { deleted: true });
});
export const removeMessage = handler(async (req, res) => {
  assertId(req.params.mid, "message");
  const m = await ReferralMessage.findOneAndUpdate({ _id: req.params.mid, system: false }, { $set: { deletedAt: new Date(), text: "", reactions: [] } }, { new: true });
  if (!m) throw new ResumeError(404, "Message not found.", "NOT_FOUND");
  const r = await ReferralRequest.findById(m.request);
  if (r) tellRequest(r, { refresh: true });
  ok(res, { removed: true });
});

/* ---------- profiles and posts ---------- */
export const listProfiles = handler(async (req, res) => {
  const { page, limit, skip } = paged(req);
  const find = {};
  if (["active", "hidden", "blocked"].includes(req.query.status)) find.status = req.query.status;
  if (req.query.referrers === "1") find.canRefer = true;
  const q = String(req.query.q || "").trim();
  if (q) find.$or = [{ company: { $regex: esc(q), $options: "i" } }, { displayName: { $regex: esc(q), $options: "i" } }, { role: { $regex: esc(q), $options: "i" } }];
  const [total, rows] = await Promise.all([ReferralProfile.countDocuments(find), ReferralProfile.find(find).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean()]);
  const users = Object.fromEntries((await User.find({ _id: { $in: rows.map((p) => p.user) } }).select("email").lean()).map((u) => [String(u._id), u.email]));
  ok(res, { items: rows.map((p) => ({ id: String(p._id), userId: String(p.user), email: users[String(p.user)] || "", name: p.displayName, company: p.company, role: p.role, yearsExp: p.yearsExp, location: p.location, canRefer: p.canRefer, hideName: p.hideName, status: p.status, statusReason: p.statusReason, createdAt: p.createdAt })), total, page, pages: pages(total, limit) });
});
export const setProfileStatus = handler(async (req, res) => {
  assertId(req.params.id, "profile");
  const b = parse(z.object({ status: z.enum(["active", "hidden", "blocked"]), reason: z.string().trim().max(300).default("") }), req.body);
  const p = await ReferralProfile.findByIdAndUpdate(req.params.id, { $set: { status: b.status, statusReason: b.status === "active" ? "" : b.reason } }, { new: true }).lean();
  if (!p) throw new ResumeError(404, "Profile not found.", "NOT_FOUND");
  ok(res, { status: p.status });
});
/* PERMANENT delete of a member's referral profile and their posts (their requests and chats stay, so the other person keeps the history) */
export const deleteProfile = handler(async (req, res) => {
  assertId(req.params.id, "profile");
  const p = await ReferralProfile.findByIdAndDelete(req.params.id).lean();
  if (!p) throw new ResumeError(404, "Profile not found.", "NOT_FOUND");
  const posts = await ReferralPost.deleteMany({ user: p.user });
  disconnectUser?.(String(p.user));
  ok(res, { deleted: true, posts: posts.deletedCount });
});
export const listPosts = handler(async (req, res) => {
  const { page, limit, skip } = paged(req);
  const find = {};
  if (req.query.hidden === "1") find.hidden = true;
  if (["hiring", "referral"].includes(req.query.kind)) find.kind = req.query.kind;
  const q = String(req.query.q || "").trim();
  if (q) find.$or = [{ company: { $regex: esc(q), $options: "i" } }, { title: { $regex: esc(q), $options: "i" } }];
  const [total, rows] = await Promise.all([ReferralPost.countDocuments(find), ReferralPost.find(find).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()]);
  const users = Object.fromEntries((await User.find({ _id: { $in: rows.map((p) => p.user) } }).select("name email").lean()).map((u) => [String(u._id), u]));
  ok(res, { items: rows.map((x) => ({ id: String(x._id), kind: x.kind, company: x.company, title: x.title, roles: x.roles, applyLink: x.applyLink, status: x.status, hidden: x.hidden, hiddenReason: x.hiddenReason, createdAt: x.createdAt, author: users[String(x.user)]?.name || "", email: users[String(x.user)]?.email || "" })), total, page, pages: pages(total, limit) });
});
export const hidePost = handler(async (req, res) => {
  assertId(req.params.id, "post");
  const hidden = Boolean(req.body?.hidden);
  const x = await ReferralPost.findByIdAndUpdate(req.params.id, { $set: { hidden, hiddenReason: hidden ? String(req.body?.reason || "").slice(0, 300) : "" } }, { new: true }).lean();
  if (!x) throw new ResumeError(404, "Post not found.", "NOT_FOUND");
  ok(res, { hidden: x.hidden });
});
export const deletePost = handler(async (req, res) => { assertId(req.params.id, "post"); await ReferralPost.deleteOne({ _id: req.params.id }); ok(res, { deleted: true }); });

/* ---------- money: orders, grants, plans, settings ---------- */
export const listOrders = handler(async (req, res) => {
  const { page, limit, skip } = paged(req);
  const find = {};
  if (["unlock", "plan", "grant", "priority"].includes(req.query.kind)) find.kind = req.query.kind;
  const q = String(req.query.q || "").trim();
  if (q) { const u = await User.find({ $or: [{ email: { $regex: esc(q), $options: "i" } }, { name: { $regex: esc(q), $options: "i" } }] }).select("_id").limit(200).lean(); find.$or = [{ user: { $in: u.map((x) => x._id) } }, { "payment.gatewayPaymentId": q }, { "payment.gatewayOrderId": q }]; }
  find["payment.status"] = ["paid", "created", "failed"].includes(req.query.status) ? req.query.status : { $in: ["paid", "created", "failed"] };
  const [total, rows] = await Promise.all([ReferralOrder.countDocuments(find), ReferralOrder.find(find).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()]);
  const users = Object.fromEntries((await User.find({ _id: { $in: rows.map((o) => o.user) } }).select("name email").lean()).map((u) => [String(u._id), u]));
  ok(res, { items: rows.map((o) => ({ id: String(o._id), kind: o.kind, title: o.title, user: users[String(o.user)]?.name || "", email: users[String(o.user)]?.email || "", amount: toRupees(o.payment?.amount), gateway: o.payment?.gateway, status: o.payment?.status, allowed: o.allowed, used: o.used, expiresAt: o.expiresAt, paidAt: o.payment?.paidAt, createdAt: o.createdAt, revoked: Boolean(o.revokedAt), note: o.note, userId: String(o.user), paymentId: o.payment?.gatewayPaymentId || "", orderRef: o.payment?.gatewayOrderId || "", reason: o.payment?.failureReason || "", validityDays: o.validityDays || 0, requestId: o.request ? String(o.request) : null })), total, page, pages: pages(total, limit) });
});
export const grant = handler(async (req, res) => {
  const b = parse(z.object({ email: z.string().trim().toLowerCase().email(), unlocks: z.coerce.number().int().min(1).max(1000), validityDays: z.coerce.number().int().min(0).max(3650).default(0), note: z.string().trim().max(300).default("") }), req.body);
  const user = await User.findOne({ email: b.email }).select("_id name").lean();
  if (!user) throw new ResumeError(404, "No member with that email.", "USER_NOT_FOUND");
  const now = new Date();
  const o = await ReferralOrder.create({ user: user._id, kind: "grant", title: "Chat credits from Target Trek", allowed: b.unlocks, validityDays: b.validityDays, expiresAt: b.validityDays ? new Date(now.getTime() + b.validityDays * 86400000) : null, grantedBy: uid(req), note: b.note, payment: { amount: 0, gateway: "admin", status: "paid", paidAt: now } });
  await autoUnlockFor(user._id).catch((e) => console.error("[referral] auto unlock failed:", e?.message || e));
  ok(res, { id: String(o._id), name: user.name }, 201);
});
export const updateOrder = handler(async (req, res) => {
  assertId(req.params.id, "order");
  const o = await ReferralOrder.findById(req.params.id);
  if (!o) throw new ResumeError(404, "Order not found.", "NOT_FOUND");
  if (typeof req.body?.revoked === "boolean") o.revokedAt = req.body.revoked ? new Date() : null;
  if (req.body?.addUnlocks) o.allowed = Math.max(0, o.allowed + Math.trunc(Number(req.body.addUnlocks) || 0));
  await o.save();
  ok(res, { revoked: Boolean(o.revokedAt), allowed: o.allowed });
});
/* PERMANENT delete of any payment record (paid ones too). Credits it held disappear with it; an opened chat stays open. */
export const deleteOrder = handler(async (req, res) => {
  assertId(req.params.id, "order");
  const o = await ReferralOrder.findByIdAndDelete(req.params.id).lean();
  if (!o) throw new ResumeError(404, "Payment not found.", "NOT_FOUND");
  ok(res, { deleted: true, kind: o.kind, paid: o.payment?.status === "paid" });
});

/* ---------- a member's chat credits: look up, add, remove ---------- */
const liveBucketsOf = (userId) => ReferralOrder.find({ user: userId, kind: { $in: ["plan", "grant"] }, "payment.status": "paid", revokedAt: null, $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] }).lean();
const creditsView = async (user) => {
  const [buckets, profile, subs] = await Promise.all([
    ReferralOrder.find({ user: user._id, kind: { $in: ["plan", "grant"] }, "payment.status": "paid" }).sort({ createdAt: -1 }).limit(100).lean(),
    ReferralProfile.findOne({ user: user._id }).select("displayName company role status").lean(),
    ReferralSubscription.find({ user: user._id, status: { $ne: "created" } }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);
  const now = Date.now();
  const live = (b) => !b.revokedAt && (!b.expiresAt || new Date(b.expiresAt).getTime() > now);
  return {
    user: { id: String(user._id), name: user.name, email: user.email }, profile: profile ? { name: profile.displayName, company: profile.company, role: profile.role, status: profile.status } : null,
    left: buckets.filter(live).reduce((n, b) => n + Math.max(0, b.allowed - b.used), 0),
    buckets: buckets.map((b) => ({ id: String(b._id), kind: b.kind, title: b.title, allowed: b.allowed, used: b.used, left: Math.max(0, b.allowed - b.used), expiresAt: b.expiresAt, revoked: Boolean(b.revokedAt), live: live(b), note: b.note, amount: toRupees(b.payment?.amount), createdAt: b.createdAt })),
    subscriptions: subs.map((x) => subOut(x)),
  };
};
const findMember = async (q) => {
  const s = String(q || "").trim();
  if (!s) throw new ResumeError(400, "Enter an email.", "EMAIL_REQUIRED");
  const user = mongoose.isValidObjectId(s) ? await User.findById(s).select("name email").lean() : await User.findOne({ email: s.toLowerCase() }).select("name email").lean();
  if (!user) throw new ResumeError(404, "No member with that email.", "USER_NOT_FOUND");
  return user;
};
export const memberCredits = handler(async (req, res) => ok(res, await creditsView(await findMember(req.query.user))));
/* change > 0 adds a free bucket; change < 0 takes credits away from the buckets that end soonest (never below zero) */
export const changeCredits = handler(async (req, res) => {
  const b = parse(z.object({ user: z.string().trim().min(1), change: z.coerce.number().int().min(-1000).max(1000).refine((n) => n !== 0, "Enter a number other than 0"), validityDays: z.coerce.number().int().min(0).max(3650).default(0), note: z.string().trim().max(300).default("") }), req.body);
  const user = await findMember(b.user);
  let moved = 0;
  if (b.change > 0) {
    const now = new Date();
    await ReferralOrder.create({ user: user._id, kind: "grant", title: "Chat credits from Target Trek", allowed: b.change, validityDays: b.validityDays, expiresAt: b.validityDays ? new Date(now.getTime() + b.validityDays * 86400000) : null, grantedBy: uid(req), note: b.note || "Added by admin", payment: { amount: 0, gateway: "admin", status: "paid", paidAt: now } });
    moved = b.change;
    await autoUnlockFor(user._id).catch(() => {});
  } else {
    let need = -b.change;
    const buckets = (await liveBucketsOf(user._id)).filter((x) => x.used < x.allowed).sort((x, y) => (x.expiresAt ? new Date(x.expiresAt).getTime() : Infinity) - (y.expiresAt ? new Date(y.expiresAt).getTime() : Infinity));
    for (const x of buckets) {
      if (!need) break;
      const take = Math.min(need, x.allowed - x.used);
      const r = await ReferralOrder.updateOne({ _id: x._id, used: x.used }, { $inc: { used: take } });
      if (r.modifiedCount) { need -= take; moved -= take; }
    }
    if (moved === 0) throw new ResumeError(409, "This member has no credits to remove.", "NO_CREDITS");
  }
  ok(res, { changed: moved, ...(await creditsView(user)) });
});
/* set one bucket's numbers directly */
export const editBucket = handler(async (req, res) => {
  assertId(req.params.id, "order");
  const b = parse(z.object({ allowed: z.coerce.number().int().min(0).max(100000).optional(), used: z.coerce.number().int().min(0).max(100000).optional(), expiresAt: z.union([z.string().datetime({ offset: true }), z.literal(""), z.null()]).optional() }), req.body);
  const o = await ReferralOrder.findOne({ _id: req.params.id, kind: { $in: ["plan", "grant"] } });
  if (!o) throw new ResumeError(404, "Credits not found.", "NOT_FOUND");
  if (b.allowed !== undefined) o.allowed = b.allowed;
  if (b.used !== undefined) o.used = b.used;
  if (o.used > o.allowed) o.used = o.allowed;
  if (b.expiresAt !== undefined) o.expiresAt = b.expiresAt ? new Date(b.expiresAt) : null;
  await o.save();
  ok(res, { allowed: o.allowed, used: o.used, expiresAt: o.expiresAt });
});

const planSchema = z.object({
  key: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,40}$/, "Key: 2-40 letters, numbers or dashes"),
  name: z.string().trim().min(2).max(80), tagline: z.string().trim().max(160).default(""),
  price: z.coerce.number().min(1).max(1000000), compareAt: z.coerce.number().min(0).max(1000000).default(0),
  unlocks: z.coerce.number().int().min(1).max(100000), validityDays: z.coerce.number().int().min(0).max(3650).default(0),
  badge: z.string().trim().max(30).default(""), features: z.array(z.string().trim().max(120)).max(10).default([]),
  isActive: z.coerce.boolean().default(true), sortOrder: z.coerce.number().int().default(0),
});
const planDoc = (b) => ({ key: b.key, name: b.name, tagline: b.tagline, pricePaise: Math.round(b.price * 100), compareAtPaise: Math.round(b.compareAt * 100), unlocks: b.unlocks, validityDays: b.validityDays, badge: b.badge, features: b.features, isActive: b.isActive, sortOrder: b.sortOrder });
const planOut = (p) => ({ id: String(p._id), key: p.key, name: p.name, tagline: p.tagline, price: toRupees(p.pricePaise), compareAt: toRupees(p.compareAtPaise), unlocks: p.unlocks, validityDays: p.validityDays, badge: p.badge, features: p.features, isActive: p.isActive, sortOrder: p.sortOrder });
export const listPlans = handler(async (req, res) => { await getSettings(); ok(res, { plans: (await ReferralPlan.find().sort({ sortOrder: 1, pricePaise: 1 }).lean()).map(planOut) }); });
export const createPlan = handler(async (req, res) => {
  const b = parse(planSchema, req.body);
  if (await ReferralPlan.exists({ key: b.key })) throw new ResumeError(409, "A plan with this key already exists.", "DUPLICATE");
  ok(res, { plan: planOut((await ReferralPlan.create(planDoc(b))).toObject()) }, 201);
});
export const updatePlan = handler(async (req, res) => {
  assertId(req.params.id, "plan");
  const b = parse(planSchema, req.body);
  if (await ReferralPlan.exists({ key: b.key, _id: { $ne: req.params.id } })) throw new ResumeError(409, "A plan with this key already exists.", "DUPLICATE");
  const p = await ReferralPlan.findByIdAndUpdate(req.params.id, { $set: planDoc(b) }, { new: true }).lean();
  if (!p) throw new ResumeError(404, "Plan not found.", "NOT_FOUND");
  ok(res, { plan: planOut(p) });
});
export const deletePlan = handler(async (req, res) => { assertId(req.params.id, "plan"); await ReferralPlan.deleteOne({ _id: req.params.id }); ok(res, { deleted: true }); });

/* ---------- subscriptions and what they sell ---------- */
const subPlanSchema = z.object({
  key: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,40}$/, "Key: 2-40 letters, numbers or dashes"),
  kind: z.enum(["unlimited", "priority"]), billing: z.enum(["monthly", "once"]),
  name: z.string().trim().min(2).max(80), tagline: z.string().trim().max(160).default(""),
  price: z.coerce.number().min(1).max(1000000), days: z.coerce.number().int().min(0).max(3650).default(0),
  badge: z.string().trim().max(30).default(""), features: z.array(z.string().trim().max(120)).max(10).default([]),
  isActive: z.coerce.boolean().default(true), sortOrder: z.coerce.number().int().default(0),
}).superRefine((b, c) => {
  if (b.kind === "unlimited" && b.billing !== "monthly") c.addIssue({ code: "custom", path: ["billing"], message: "The unlimited plan is billed monthly" });
  if (b.billing === "once" && !(b.days > 0)) c.addIssue({ code: "custom", path: ["days"], message: "Enter how many days the pass lasts" });
});
const subPlanDoc = (b) => ({ key: b.key, kind: b.kind, billing: b.billing, name: b.name, tagline: b.tagline, pricePaise: Math.round(b.price * 100), days: b.billing === "once" ? b.days : 0, badge: b.badge, features: b.features, isActive: b.isActive, sortOrder: b.sortOrder });
export const listSubPlans = handler(async (req, res) => { await getSettings(); ok(res, { plans: (await ReferralSubPlan.find().sort({ kind: 1, sortOrder: 1, pricePaise: 1 }).lean()).map((p) => subPlanOut(p, { admin: true })) }); });
export const createSubPlan = handler(async (req, res) => {
  const b = parse(subPlanSchema, req.body);
  if (await ReferralSubPlan.exists({ key: b.key })) throw new ResumeError(409, "A plan with this key already exists.", "DUPLICATE");
  ok(res, { plan: subPlanOut((await ReferralSubPlan.create(subPlanDoc(b))).toObject(), { admin: true }) }, 201);
});
export const updateSubPlan = handler(async (req, res) => {
  assertId(req.params.id, "plan");
  const b = parse(subPlanSchema, req.body);
  if (await ReferralSubPlan.exists({ key: b.key, _id: { $ne: req.params.id } })) throw new ResumeError(409, "A plan with this key already exists.", "DUPLICATE");
  const p = await ReferralSubPlan.findByIdAndUpdate(req.params.id, { $set: subPlanDoc(b) }, { new: true }).lean();
  if (!p) throw new ResumeError(404, "Plan not found.", "NOT_FOUND");
  ok(res, { plan: subPlanOut(p, { admin: true }) }); // people already subscribed keep the price they signed up at
});
export const deleteSubPlan = handler(async (req, res) => {
  assertId(req.params.id, "plan");
  if (await ReferralSubscription.exists({ plan: req.params.id, status: { $in: ["active", "past_due", "cancelled"] } })) throw new ResumeError(409, "Members are subscribed to this plan. Switch it off instead of deleting it.", "IN_USE");
  await ReferralSubPlan.deleteOne({ _id: req.params.id });
  ok(res, { deleted: true });
});

export const listSubscriptions = handler(async (req, res) => {
  const { page, limit, skip } = paged(req);
  const find = {};
  const now = new Date();
  if (req.query.status === "cancelled") Object.assign(find, { status: "cancelled", currentPeriodEnd: { $gt: now } }); // cancelled, still has paid days left
  else if (req.query.status === "expired") find.$or = [{ status: "expired" }, { status: "cancelled", currentPeriodEnd: { $lte: now } }];
  else if (["created", "active", "past_due", "failed"].includes(req.query.status)) find.status = req.query.status;
  else find.status = { $ne: "created" };
  if (["unlimited", "priority"].includes(req.query.kind)) find.kind = req.query.kind;
  const q = String(req.query.q || "").trim();
  if (q) { const u = await User.find({ $or: [{ email: { $regex: esc(q), $options: "i" } }, { name: { $regex: esc(q), $options: "i" } }] }).select("_id").limit(200).lean(); find.user = { $in: u.map((x) => x._id) }; }
  const [total, rows] = await Promise.all([ReferralSubscription.countDocuments(find), ReferralSubscription.find(find).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()]);
  const users = Object.fromEntries((await User.find({ _id: { $in: rows.map((x) => x.user) } }).select("name email").lean()).map((u) => [String(u._id), u]));
  ok(res, { items: rows.map((x) => ({ ...subOut(x, { admin: true }), user: users[String(x.user)]?.name || "", email: users[String(x.user)]?.email || "", userId: String(x.user), events: undefined })), total, page, pages: pages(total, limit) });
});
const subDetail = async (id) => {
  const sub = await ReferralSubscription.findById(id).lean();
  if (!sub) throw new ResumeError(404, "Subscription not found.", "NOT_FOUND");
  const [user, charges] = await Promise.all([User.findById(sub.user).select("name email").lean(), ReferralSubCharge.find({ subscription: sub._id }).sort({ at: -1 }).limit(200).lean()]);
  return { subscription: { ...subOut(sub, { admin: true }), user: user?.name || "", email: user?.email || "", userId: String(sub.user), live: isLive(sub) }, charges: charges.map(chargeOut) };
};
export const getSubscription = handler(async (req, res) => { assertId(req.params.id, "subscription"); ok(res, await subDetail(req.params.id)); });
export const syncSub = handler(async (req, res) => {
  assertId(req.params.id, "subscription");
  const sub = await ReferralSubscription.findById(req.params.id);
  if (!sub) throw new ResumeError(404, "Subscription not found.", "NOT_FOUND");
  await syncSubscription(sub);
  ok(res, await subDetail(req.params.id));
});
export const cancelSub = handler(async (req, res) => {
  assertId(req.params.id, "subscription");
  const sub = await ReferralSubscription.findById(req.params.id);
  if (!sub) throw new ResumeError(404, "Subscription not found.", "NOT_FOUND");
  const b = parse(z.object({ endNow: z.coerce.boolean().default(false), reason: z.string().trim().max(300).default("") }), req.body || {});
  await cancelOwn(sub, { by: "admin", reason: b.reason, endNow: b.endNow });
  ok(res, await subDetail(req.params.id));
});

/* PERMANENT delete of a subscription and its charge history. A subscription that can still bill is cancelled at the gateway first,
   so deleting the record can never leave someone being charged. */
export const deleteSub = handler(async (req, res) => {
  assertId(req.params.id, "subscription");
  const sub = await ReferralSubscription.findById(req.params.id);
  if (!sub) throw new ResumeError(404, "Subscription not found.", "NOT_FOUND");
  if (["created", "active", "past_due"].includes(sub.status) && sub.gatewaySubscriptionId) await cancelOwn(sub, { by: "admin", reason: "Deleted by admin", endNow: true });
  const charges = await ReferralSubCharge.deleteMany({ subscription: sub._id });
  await ReferralSubscription.deleteOne({ _id: sub._id });
  ok(res, { deleted: true, charges: charges.deletedCount });
});
export const deleteCharge = handler(async (req, res) => {
  assertId(req.params.id, "charge");
  const c = await ReferralSubCharge.findByIdAndDelete(req.params.id).lean();
  if (!c) throw new ResumeError(404, "Charge not found.", "NOT_FOUND");
  // keep the subscription's totals true to the rows that are left
  const paid = await ReferralSubCharge.find({ subscription: c.subscription, status: "paid" }).select("amountPaise").lean();
  await ReferralSubscription.updateOne({ _id: c.subscription }, { $set: { paidCount: paid.length, paidTotalPaise: paid.reduce((n, x) => n + (x.amountPaise || 0), 0) } });
  ok(res, { deleted: true });
});

const settingsOut = (s) => ({ plansEnabled: s.plansEnabled, subscriptionEnabled: s.subscriptionEnabled, priorityEnabled: s.priorityEnabled, enabled: s.enabled, paywall: s.paywall, unlockFee: toRupees(s.unlockFeePaise), postsEnabled: s.postsEnabled, maxPendingRequests: s.maxPendingRequests, signupCredits: s.signupCredits || 0 });
export const getSettingsOut = handler(async (req, res) => ok(res, settingsOut(await getSettings({ fresh: true }))));
export const saveSettings = handler(async (req, res) => {
  const b = parse(z.object({ enabled: z.coerce.boolean(), paywall: z.coerce.boolean(), unlockFee: z.coerce.number().min(1).max(100000), postsEnabled: z.coerce.boolean(), maxPendingRequests: z.coerce.number().int().min(1).max(100), signupCredits: z.coerce.number().int().min(0).max(20).default(0), plansEnabled: z.coerce.boolean().default(true), subscriptionEnabled: z.coerce.boolean().default(false), priorityEnabled: z.coerce.boolean().default(false) }), req.body);
  await getSettings();
  const s = await ReferralSettings.findOneAndUpdate({ key: "global" }, { $set: { enabled: b.enabled, paywall: b.paywall, unlockFeePaise: Math.round(b.unlockFee * 100), postsEnabled: b.postsEnabled, maxPendingRequests: b.maxPendingRequests, signupCredits: b.signupCredits, plansEnabled: b.plansEnabled, subscriptionEnabled: b.subscriptionEnabled, priorityEnabled: b.priorityEnabled, updatedBy: uid(req) } }, { new: true }).lean();
  forgetSettings();
  ok(res, settingsOut(s));
});
export { disconnectUser };
