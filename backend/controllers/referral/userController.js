import { cleanReferralCode } from "../../utils/referralCode.js";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { z } from "zod";

import ReferralProfile, { keyOf } from "../../models/referral/ReferralProfile.js";
import ReferralPost from "../../models/referral/ReferralPost.js";
import ReferralRequest from "../../models/referral/ReferralRequest.js";
import ReferralPlan from "../../models/referral/ReferralPlan.js";
import ReferralOrder from "../../models/referral/ReferralOrder.js";
import ReferralSubPlan from "../../models/referral/ReferralSubPlan.js";
import ReferralSubscription from "../../models/referral/ReferralSubscription.js";
import ReferralSubCharge from "../../models/referral/ReferralSubCharge.js";
import User from "../../models/User.js";
import { FRONTEND_URL } from "../../config/urls.js";
import { createDownloadUrl, headObject, keyBelongsTo, userPrefix } from "../../services/storage/s3.js";
import { ResumeError, assertId, assertNotBlocked, parse, sendError, toRupees } from "../../services/resume/service.js";
import { autoUnlockFor, grantSignupCredits, hasUnlimited, hasPriority, priorityFor, endChat, getSettings, creditsLeft, giveBackCredit, openChat, publicPerson, requestView, spendCredit, tellRequest, systemMessage } from "../../services/referral/core.js";
import { callbackOf, fetchStatus, refreshOrder, settleOrder, startCheckout, webhookOf } from "../../services/referral/payments.js";
import { deleteMessage, editMessage, history, markRead, openRequestFor, postMessage, reactMessage } from "../../services/referral/chat.js";
import { emitToUser } from "../../services/referral/hub.js";
import { parseSubscriptionWebhook } from "../../services/payments/index.js";
import { accessFrom, accessOf, livePass, applyGatewayEvent, cancelOwn, chargeOut, confirmSubscription, findByGatewayId, isLive, startSubscription, subOut, subPlanOut, syncSubscription } from "../../services/referral/subscriptions.js";

const uid = (req) => String(req.user?.id || req.user?._id);
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const handler = (fn) => asyncHandler(async (req, res) => { try { await fn(req, res); } catch (err) { return sendError(res, err); } });
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const num = (v, d, min, max) => Math.min(max, Math.max(min, Number.parseInt(v, 10) || d));
const url = z.string().trim().max(500).refine((v) => !v || /^https?:\/\/\S+$/i.test(v), "Enter a full link starting with https://").default("");
const list = (a) => (Array.isArray(a) ? a : String(a || "").split(",")).map((s) => String(s).trim()).filter(Boolean);

/* every feature needs the program to be on */
const live = async () => {
  const s = await getSettings();
  if (!s.enabled) throw new ResumeError(503, "The referral program is paused right now. Please check back soon.", "REFERRAL_OFF");
  return s;
};
const withUsers = async (rows) => {
  const ids = [...new Set(rows.flatMap((r) => [String(r.seeker), String(r.referrer)]))];
  const [profiles, users] = await Promise.all([ReferralProfile.find({ user: { $in: ids } }).lean(), User.find({ _id: { $in: ids } }).select("name email").lean()]);
  return { profiles: Object.fromEntries(profiles.map((p) => [String(p.user), p])), users: Object.fromEntries(users.map((u) => [String(u._id), u])) };
};
const viewRows = async (rows, viewerId) => {
  const ids = [...new Set(rows.flatMap((r) => [String(r.seeker), String(r.referrer)]))];
  // people and "who holds a priority pass right now" (the icon next to a name) are looked up together
  const [ctx, vip] = await Promise.all([withUsers(rows), priorityFor(ids)]);
  return rows.map((r) => requestView(r, { viewerId, ...ctx, vip }));
};

/* ---------- public: is the program on, and what does a chat cost ---------- */
export const publicInfo = handler(async (req, res) => {
  const s = await getSettings();
  const kinds = [s.subscriptionEnabled && "unlimited", s.priorityEnabled && "priority"].filter(Boolean);
  const [plans, members, companies, subPlans] = await Promise.all([
    ReferralPlan.find({ isActive: true }).sort({ sortOrder: 1, pricePaise: 1 }).lean(),
    ReferralProfile.countDocuments({ canRefer: true, status: "active" }),
    ReferralProfile.distinct("companyKey", { canRefer: true, status: "active", companyKey: { $ne: "" } }),
    kinds.length ? ReferralSubPlan.find({ isActive: true, kind: { $in: kinds } }).sort({ kind: 1, sortOrder: 1, pricePaise: 1 }).lean() : [],
  ]);
  ok(res, { subPlans: subPlans.map((p) => subPlanOut(p)), enabled: s.enabled, paywall: s.paywall, unlockFee: toRupees(s.unlockFeePaise), postsEnabled: s.postsEnabled, plansEnabled: s.plansEnabled, subscriptionEnabled: s.subscriptionEnabled, priorityEnabled: s.priorityEnabled, plans: s.plansEnabled ? plans.map(planOut) : [], stats: { referrers: members, companies: companies.length } });
});
const planOut = (p) => ({ id: String(p._id), key: p.key, name: p.name, tagline: p.tagline, price: toRupees(p.pricePaise), compareAt: toRupees(p.compareAtPaise), unlocks: p.unlocks, validityDays: p.validityDays, badge: p.badge, features: p.features, perChat: Math.round((toRupees(p.pricePaise) / p.unlocks) * 100) / 100 });

/* ---------- home summary ---------- */
export const summary = handler(async (req, res) => {
  const me = uid(req);
  // Only the first call after opening the app does the housekeeping (free signup credits, then credits spent on chats still waiting to
  // open). The app asks again after every live event, and those calls only need the numbers.
  if (req.query.init === "1") {
    await grantSignupCredits(me);
    await autoUnlockFor(me).catch((e) => console.error("[referral] auto unlock failed:", e?.message || e));
  }
  const m = new mongoose.Types.ObjectId(me);
  const when = (cond) => ({ $sum: { $cond: [cond, 1, 0] } });
  const [s, profile, credits, access, gift, failing, agg] = await Promise.all([
    getSettings(), ReferralProfile.findOne({ user: me }).lean(), creditsLeft(me), accessOf(me),
    // the free credits given on the first visit, while the member hasn't closed the message about them
    ReferralOrder.findOne({ user: me, source: "signup", noticeClosedAt: null, revokedAt: null }).select("allowed createdAt").lean(),
    // a renewal that failed, while the member hasn't closed the message about it
    ReferralSubscription.findOne({ user: me, status: "past_due", failNoticeClosedAt: null }).sort({ updatedAt: -1 }).lean(),
    // every counter in ONE pass over this member's requests
    ReferralRequest.aggregate([
      { $match: { $or: [{ seeker: m }, { referrer: m }] } },
      { $group: {
        _id: null,
        received: when({ $and: [{ $eq: ["$referrer", m] }, { $eq: ["$status", "pending"] }] }),
        sent: when({ $and: [{ $eq: ["$seeker", m] }, { $eq: ["$status", "pending"] }] }),
        openChats: when({ $and: [{ $eq: ["$status", "accepted"] }, { $eq: ["$chat.unlocked", true] }] }),
        needUnlock: when({ $and: [{ $eq: ["$seeker", m] }, { $eq: ["$status", "accepted"] }, { $ne: ["$chat.unlocked", true] }] }),
        unseen: when({ $and: [{ $eq: ["$referrer", m] }, { $eq: ["$status", "pending"] }, { $ne: ["$referrerSeen", true] }] }),
        unread: { $sum: { $cond: [{ $eq: ["$status", "accepted"] }, { $cond: [{ $eq: ["$seeker", m] }, { $ifNull: ["$unread.seeker", 0] }, { $ifNull: ["$unread.referrer", 0] }] }, 0] } },
      } },
    ]),
  ]);
  const { received = 0, sent = 0, openChats = 0, needUnlock = 0, unseen = 0, unread = 0 } = agg[0] || {};
  ok(res, {
    enabled: s.enabled, paywall: s.paywall, unlockFee: toRupees(s.unlockFeePaise), postsEnabled: s.postsEnabled,
    plansEnabled: s.plansEnabled, subscriptionEnabled: s.subscriptionEnabled, priorityEnabled: s.priorityEnabled, access,
    profile: profileOut(profile), complete: Boolean(profile?.company && profile?.role), credits,
    counts: { received, sent, openChats, unread, needUnlock, unseen },
    welcomeCredits: gift ? { id: String(gift._id), credits: gift.allowed, at: gift.createdAt } : null,
    paymentIssue: failing ? { id: String(failing._id), planName: failing.planName, price: toRupees(failing.pricePaise), reason: failing.lastFailureReason || "", tries: failing.failedCount || 0, nextTry: failing.nextChargeAt, accessUntil: failing.currentPeriodEnd } : null,
  });
});
/* the member closed the free-credits message: never show it again, on any device */
export const closeWelcome = handler(async (req, res) => {
  await ReferralOrder.updateMany({ user: uid(req), source: "signup", noticeClosedAt: null }, { $set: { noticeClosedAt: new Date() } });
  ok(res, { closed: true });
});

/* ---------- my profile ---------- */
const profileOut = (p) => p && {
  id: String(p._id), displayName: p.displayName, headline: p.headline, company: p.company, role: p.role, yearsExp: p.yearsExp, location: p.location, skills: p.skills, bio: p.bio, linkedin: p.linkedin,
  canRefer: p.canRefer, hideName: p.hideName, resume: p.resume?.key ? { filename: p.resume.filename, size: p.resume.size } : null, status: p.status, statusReason: p.statusReason,
};
export const getProfile = handler(async (req, res) => {
  const p = await ReferralProfile.findOne({ user: uid(req) }).lean();
  const u = p ? null : await User.findById(uid(req)).select("name").lean();
  ok(res, { profile: profileOut(p), suggestedName: u?.name || "" });
});

const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Enter your name").max(80),
  headline: z.string().trim().max(120).default(""),
  company: z.string().trim().min(2, "Enter your company").max(100),
  role: z.string().trim().min(2, "Enter your role").max(100),
  yearsExp: z.coerce.number().min(0).max(60),
  location: z.string().trim().min(2, "Enter your location").max(80),
  bio: z.string().trim().max(600).default(""),
  canRefer: z.coerce.boolean().default(false),
  hideName: z.coerce.boolean().default(false),
});

/* a resume the person uploaded themselves; returns the stored shape */
const checkedResume = async (userId, r) => {
  if (!r?.key) throw new ResumeError(400, "Attach your resume.", "RESUME_REQUIRED");
  if (!keyBelongsTo(r.key, `${userPrefix(userId)}resume/`) || !/\.(pdf|docx?)$/i.test(r.key)) throw new ResumeError(400, "That resume file isn't valid. Please upload it again.", "INVALID_RESUME");
  const obj = await headObject(r.key);
  if (!obj) throw new ResumeError(400, "We couldn't find your uploaded resume. Please upload it again.", "RESUME_NOT_FOUND");
  return { key: r.key, filename: String(r.filename || "resume.pdf").replace(/[^\w.\- ()]+/g, "_").slice(0, 120) || "resume.pdf", size: obj.size || 0 };
};

export const saveProfile = handler(async (req, res) => {
  await assertNotBlocked(uid(req));
  await live();
  const b = parse(profileSchema, req.body);
  const prev = await ReferralProfile.findOne({ user: uid(req) });
  if (prev?.status === "blocked") throw new ResumeError(403, "Your referral profile has been paused. Please contact support.", "PROFILE_BLOCKED");
  const set = { displayName: b.displayName, headline: b.headline, company: b.company, companyKey: keyOf(b.company), role: b.role, yearsExp: b.yearsExp, location: b.location, bio: b.bio, canRefer: b.canRefer, hideName: b.hideName };
  const p = await ReferralProfile.findOneAndUpdate({ user: uid(req) }, { $set: set, $setOnInsert: { status: "active" } }, { upsert: true, new: true }).lean();
  ok(res, { profile: profileOut(p) });
});

/* ---------- directory: who can refer at which company ---------- */
const card = (p) => ({ id: String(p._id), ...publicPerson(p), canRefer: true });
export const companies = handler(async (req, res) => {
  await live();
  const q = keyOf(req.query.q);
  const match = { canRefer: true, status: "active", companyKey: q ? { $regex: esc(q) } : { $ne: "" } };
  const rows = await ReferralProfile.aggregate([{ $match: match }, { $group: { _id: "$companyKey", company: { $first: "$company" }, members: { $sum: 1 } } }, { $sort: { members: -1, company: 1 } }, { $limit: 16 }]);
  ok(res, { items: rows.map((r) => ({ key: r._id, company: r.company, members: r.members })) });
});

export const directory = handler(async (req, res) => {
  await live();
  const q = keyOf(req.query.q);
  const page = num(req.query.page, 1, 1, 500);
  const limit = num(req.query.limit, 12, 1, 30);
  const find = { canRefer: true, status: "active", company: { $ne: "" }, user: { $ne: uid(req) } };
  if (q) find.$or = [{ companyKey: { $regex: esc(q) } }, { role: { $regex: esc(req.query.q.trim()), $options: "i" } }, { skills: { $regex: esc(req.query.q.trim()), $options: "i" } }];
  const min = Number(req.query.minExp), max = Number(req.query.maxExp);
  if (Number.isFinite(min) || Number.isFinite(max)) find.yearsExp = { ...(Number.isFinite(min) && req.query.minExp !== "" ? { $gte: min } : {}), ...(Number.isFinite(max) && req.query.maxExp !== "" ? { $lte: max } : {}) };
  if (!Object.keys(find.yearsExp || {}).length) delete find.yearsExp;
  const [total, rows] = await Promise.all([ReferralProfile.countDocuments(find), ReferralProfile.find(find).sort({ companyKey: 1, yearsExp: -1 }).skip((page - 1) * limit).limit(limit).lean()]);
  const mine = await ReferralRequest.find({ seeker: uid(req), status: { $in: ["pending", "accepted"] }, referrer: { $in: rows.map((p) => p.user) } }).select("referrer status").lean();
  const asked = Object.fromEntries(mine.map((r) => [String(r.referrer), r.status]));
  const vip = await priorityFor(rows.map((p) => p.user));
  ok(res, { items: rows.map((p) => ({ ...card(p), priority: vip.has(String(p.user)), requested: asked[String(p.user)] || "" })), total, page, pages: Math.max(1, Math.ceil(total / limit)), limit });
});

export const directoryOne = handler(async (req, res) => {
  await live();
  assertId(req.params.id, "member");
  const p = await ReferralProfile.findOne({ _id: req.params.id, canRefer: true, status: "active" }).lean();
  if (!p) throw new ResumeError(404, "This member isn't taking referral requests.", "NOT_FOUND");
  const open = await ReferralRequest.findOne({ seeker: uid(req), referrer: p.user, status: { $in: ["pending", "accepted"] } }).select("status").lean();
  const posts = await ReferralPost.find({ user: p.user, status: "open", hidden: false, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 }).limit(5).lean();
  ok(res, { member: { ...card(p), self: String(p.user) === uid(req), requested: open?.status || "" }, posts: posts.map((x) => postOut(x, p)) });
});

/* ---------- the board: "we are hiring" and "I can refer for these roles" ---------- */
const postOut = (x, profile, me) => {
  const sameCompany = Boolean(profile && profile.companyKey && profile.companyKey === x.companyKey && profile.status === "active");
  return {
  id: String(x._id), kind: x.kind, company: x.company, title: x.title, roles: x.roles, location: x.location, experience: x.experience, description: x.description, applyLink: x.applyLink, status: x.status, createdAt: x.createdAt,
  mine: me ? String(x.user) === me : false,
  canAsk: sameCompany && x.status === "open" && (me ? String(x.user) !== me : true), // the poster works at this company, so they can be asked for it
  author: profile ? { name: profile.hideName ? "Anonymous" : profile.displayName, anonymous: Boolean(profile.hideName), initials: profile.hideName ? "?" : String(profile.displayName || "?").split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase(), headline: profile.headline || "", role: profile.role, company: profile.company, yearsExp: profile.yearsExp, location: profile.location, sameCompany } : null,
  };
};
export const posts = handler(async (req, res) => {
  await live();
  const page = num(req.query.page, 1, 1, 500), limit = num(req.query.limit, 12, 1, 30);
  const find = { status: "open", hidden: false, expiresAt: { $gt: new Date() } };
  if (["hiring", "referral"].includes(req.query.kind)) find.kind = req.query.kind;
  const q = String(req.query.q || "").trim();
  if (q) find.$or = [{ companyKey: { $regex: esc(keyOf(q)) } }, { title: { $regex: esc(q), $options: "i" } }, { roles: { $regex: esc(q), $options: "i" } }];
  const [total, rows] = await Promise.all([ReferralPost.countDocuments(find), ReferralPost.find(find).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean()]);
  const profs = await ReferralProfile.find({ user: { $in: rows.map((r) => r.user) } }).lean();
  const by = Object.fromEntries(profs.map((p) => [String(p.user), p]));
  ok(res, { items: rows.map((x) => postOut(x, by[String(x.user)], uid(req))), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});
export const onePost = handler(async (req, res) => {
  await live();
  assertId(req.params.id, "post");
  const x = await ReferralPost.findOne({ _id: req.params.id, $or: [{ hidden: false }, { user: uid(req) }] }).lean();
  if (!x) throw new ResumeError(404, "This post isn't available.", "NOT_FOUND");
  const profile = await ReferralProfile.findOne({ user: x.user }).lean();
  const asked = await ReferralRequest.findOne({ seeker: uid(req), referrer: x.user, status: { $in: ["pending", "accepted"] } }).select("status").lean();
  ok(res, { post: { ...postOut(x, profile, uid(req)), requested: asked?.status || "" } });
});
export const myPosts = handler(async (req, res) => {
  const rows = await ReferralPost.find({ user: uid(req) }).sort({ createdAt: -1 }).limit(100).lean();
  ok(res, { items: rows.map((x) => ({ ...postOut(x, null, uid(req)), hidden: x.hidden, hiddenReason: x.hiddenReason })) });
});
const postSchema = z.object({
  kind: z.enum(["hiring", "referral"]),
  company: z.string().trim().min(2, "Enter the company").max(100),
  title: z.string().trim().min(4, "Add a short title").max(140),
  roles: z.any().transform((v) => list(v).slice(0, 10).map((s) => s.slice(0, 80))).default([]),
  location: z.string().trim().max(80).default(""),
  experience: z.string().trim().max(60).default(""),
  description: z.string().trim().max(3000).default(""),
  applyLink: url,
});
export const createPost = handler(async (req, res) => {
  await assertNotBlocked(uid(req));
  const s = await live();
  if (!s.postsEnabled) throw new ResumeError(403, "Posting is switched off right now.", "POSTS_OFF");
  const b = parse(postSchema, req.body);
  if (b.kind === "hiring" && !b.applyLink && b.description.length < 20) throw new ResumeError(400, "Add an apply link or a short description so people know how to apply.", "VALIDATION_FAILED");
  if ((await ReferralPost.countDocuments({ user: uid(req), status: "open" })) >= 10) throw new ResumeError(409, "You have 10 open posts. Close one before adding another.", "POST_LIMIT");
  const x = await ReferralPost.create({ ...b, user: uid(req), companyKey: keyOf(b.company) });
  ok(res, { post: postOut(x.toObject(), null, uid(req)) }, 201);
});
export const updatePost = handler(async (req, res) => {
  assertId(req.params.id, "post");
  const x = await ReferralPost.findOne({ _id: req.params.id, user: uid(req) });
  if (!x) throw new ResumeError(404, "Post not found.", "NOT_FOUND");
  if (req.body?.status) { if (!["open", "closed"].includes(req.body.status)) throw new ResumeError(400, "Invalid status.", "VALIDATION_FAILED"); if (x.hidden && req.body.status === "open") throw new ResumeError(403, "An admin removed this post.", "POST_HIDDEN"); x.status = req.body.status; }
  else { Object.assign(x, parse(postSchema.partial(), req.body)); if (req.body.company) x.companyKey = keyOf(x.company); }
  await x.save();
  ok(res, { post: postOut(x.toObject(), null, uid(req)) });
});
export const deletePost = handler(async (req, res) => {
  assertId(req.params.id, "post");
  await ReferralPost.deleteOne({ _id: req.params.id, user: uid(req) });
  ok(res, { deleted: true });
});

/* ---------- ask for a referral ---------- */
const LINKEDIN = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/\S+$/i;
const askSchema = z.object({
  profileId: z.string().optional(),
  postId: z.string().optional(),
  jobTitle: z.string().trim().max(140).default(""),
  jobId: z.string().trim().max(80).default(""),
  jobLink: url,
  message: z.string().trim().min(20, "Write a short message (at least a couple of lines)").max(1500),
  info: z.object({
    currentRole: z.string().trim().min(2, "Enter your current role").max(100),
    currentCompany: z.string().trim().max(100).default(""),
    yearsExp: z.coerce.number({ error: "Enter your years of experience" }).min(0).max(60),
    noticePeriod: z.string().trim().max(40).default(""),
    linkedin: z.string().trim().min(1, "Your LinkedIn link is required").max(200).refine((v) => LINKEDIN.test(v), "Enter a LinkedIn link like https://linkedin.com/in/your-name"),
    portfolio: url,
  }),
  resume: z.object({ key: z.string().max(1024), filename: z.string().max(160) }).optional(),
  useSavedResume: z.coerce.boolean().default(false),
  saveResume: z.coerce.boolean().default(false),
});
export const sendRequest = handler(async (req, res) => {
  const me = uid(req);
  await assertNotBlocked(me);
  const s = await live();
  const b = parse(askSchema, req.body);
  if (!b.jobId && !b.jobLink) throw new ResumeError(400, "Add the job ID or the job link so they know which role to refer you for.", "JOB_REQUIRED");
  // who is being asked: a member from the directory, or the person who posted a job (they work at that company)
  let target = null;
  let postDoc = null;
  if (b.postId && mongoose.isValidObjectId(b.postId)) {
    postDoc = await ReferralPost.findOne({ _id: b.postId, status: "open", hidden: false, expiresAt: { $gt: new Date() } }).lean();
    if (!postDoc) throw new ResumeError(404, "This post is closed or no longer available.", "NOT_FOUND");
    target = await ReferralProfile.findOne({ user: postDoc.user, status: "active" }).lean();
    if (!target || target.companyKey !== postDoc.companyKey) throw new ResumeError(409, "The person who posted this job no longer lists this company, so they can't take requests for it.", "COMPANY_MISMATCH");
  } else {
    assertId(b.profileId, "member");
    target = await ReferralProfile.findOne({ _id: b.profileId, canRefer: true, status: "active" }).lean();
  }
  if (!target) throw new ResumeError(404, "This member isn't taking referral requests.", "NOT_FOUND");
  if (String(target.user) === me) throw new ResumeError(400, "You can't ask yourself for a referral.", "SELF");
  if (await ReferralRequest.exists({ seeker: me, referrer: target.user, status: { $in: ["pending", "accepted"] } })) throw new ResumeError(409, "You already have an open request with this member.", "DUPLICATE");
  const unlimited = await hasUnlimited(me);
  if (!unlimited && (await ReferralRequest.countDocuments({ seeker: me, status: "pending" })) >= s.maxPendingRequests) throw new ResumeError(429, `You have ${s.maxPendingRequests} requests waiting for an answer. Wait for a reply or withdraw one first.`, "TOO_MANY_PENDING");
  const mine = await ReferralProfile.findOne({ user: me }).lean();
  let resume;
  if (b.useSavedResume && mine?.resume?.key) resume = { key: mine.resume.key, filename: mine.resume.filename, size: mine.resume.size };
  else resume = await checkedResume(me, b.resume);
  const u = await User.findById(me).select("name").lean();
  const post = postDoc ? postDoc._id : null;
  const r = await ReferralRequest.create({
    seeker: me, referrer: target.user, post, priority: await hasPriority(me), company: target.company, referrerRole: target.role,
    job: { title: b.jobTitle || postDoc?.title || "", jobId: b.jobId, link: b.jobLink }, message: b.message, resume,
    seekerInfo: { name: mine?.displayName || u?.name || "", ...b.info, currentRole: b.info.currentRole || mine?.role || "", currentCompany: b.info.currentCompany || mine?.company || "" },
  });
  if (b.saveResume && !b.useSavedResume) await ReferralProfile.updateOne({ user: me }, { $set: { resume } }, { upsert: false });
  emitToUser(target.user, { type: "request_new", requestId: String(r._id) });
  ok(res, { id: String(r._id) }, 201);
});

/* ---------- my requests (sent / received) ---------- */
export const listRequests = handler(async (req, res) => {
  const me = uid(req);
  const box = req.query.box === "received" ? "received" : "sent";
  const page = num(req.query.page, 1, 1, 500), limit = num(req.query.limit, 20, 1, 50);
  const find = box === "received" ? { referrer: me } : { seeker: me };
  if (["pending", "accepted", "rejected", "cancelled", "ended"].includes(req.query.status)) find.status = req.query.status;
  const base = box === "received" ? { referrer: me } : { seeker: me };
  const first = page === 1; // the status chips' numbers and the "unopened" count only change the first page's header
  const [total, rows, byStatus, unseen] = await Promise.all([
    ReferralRequest.countDocuments(find),
    box === "received"
      // priority senders' still-waiting requests come first, then everything by latest activity
      ? ReferralRequest.aggregate([{ $match: { ...find, referrer: new mongoose.Types.ObjectId(me) } }, { $addFields: { boost: { $cond: [{ $and: [{ $eq: ["$priority", true] }, { $eq: ["$status", "pending"] }] }, 1, 0] } } }, { $sort: { boost: -1, "last.at": -1, updatedAt: -1 } }, { $skip: (page - 1) * limit }, { $limit: limit }])
      : ReferralRequest.find(find).sort({ "last.at": -1, updatedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    first ? ReferralRequest.aggregate([{ $match: { ...(box === "received" ? { referrer: new mongoose.Types.ObjectId(me) } : { seeker: new mongoose.Types.ObjectId(me) }) } }, { $group: { _id: "$status", n: { $sum: 1 } } }]) : [],
    first && box === "received" ? ReferralRequest.countDocuments({ ...base, status: "pending", referrerSeen: false }) : 0,
  ]);
  const counts = Object.fromEntries(byStatus.map((x) => [x._id, x.n]));
  ok(res, { items: await viewRows(rows, me), total, page, pages: Math.max(1, Math.ceil(total / limit)), box, ...(first ? { counts: { all: byStatus.reduce((n, x) => n + x.n, 0), ...counts }, unseen } : {}) });
});
const mineRequest = async (req) => {
  assertId(req.params.id, "request");
  const r = await ReferralRequest.findOne({ _id: req.params.id, $or: [{ seeker: uid(req) }, { referrer: uid(req) }] });
  if (!r) throw new ResumeError(404, "Request not found.", "NOT_FOUND");
  return r;
};
export const getRequest = handler(async (req, res) => {
  const r = await mineRequest(req);
  const me = uid(req);
  const seen = String(r.referrer) === me && !r.referrerSeen;
  const asSeeker = String(r.seeker) === me && r.status === "accepted" && !r.chat?.unlocked;
  // the "seen" flag, the people, the credits and the settings are all independent: one wait, not four
  const [view, credits, s] = await Promise.all([
    viewRows([r.toObject()], me).then((v) => v[0]),
    asSeeker ? creditsLeft(me) : null,
    getSettings(),
    seen ? ReferralRequest.updateOne({ _id: r._id }, { $set: { referrerSeen: true } }) : null,
  ]);
  if (seen) view.isNew = false;
  ok(res, { request: view, credits, unlockFee: toRupees(s.unlockFeePaise), counted: seen });
});

const reply = (fn) => handler(async (req, res) => { const r = await mineRequest(req); ok(res, await fn(req, r)); });
export const accept = reply(async (req, r) => {
  const me = uid(req);
  if (String(r.referrer) !== me) throw new ResumeError(403, "Only the person asked can accept.", "FORBIDDEN");
  const s = await live();
  const hit = await ReferralRequest.findOneAndUpdate({ _id: r._id, status: { $in: ["pending", "rejected"] } }, { $set: { status: "accepted", decidedAt: new Date(), referrerSeen: true, rejectReason: "" } }, { new: true });
  if (!hit) throw new ResumeError(409, "This request was withdrawn or already accepted.", "NOT_PENDING");
  // The referrer never pays. The chat is theirs to use right now; the SENDER pays: free chat if the admin switched
  // the paywall off, otherwise one of the sender's credits is spent automatically if they have one.
  await systemMessage(hit, "Request accepted.");
  if (!s.paywall) { await openChat(hit._id, "free"); return { status: "open" }; }
  if (await hasUnlimited(hit.seeker)) { if (await openChat(hit._id, "subscription")) return { status: "open" }; }
  const credit = await spendCredit(hit.seeker);
  if (credit) {
    if (await openChat(hit._id, "credit")) return { status: "open" };
    await giveBackCredit(credit);
  }
  tellRequest(hit);
  return { status: "accepted" };
});
export const reject = reply(async (req, r) => {
  if (String(r.referrer) !== uid(req)) throw new ResumeError(403, "Only the person asked can decline.", "FORBIDDEN");
  const reason = String(req.body?.reason || "").trim().slice(0, 300);
  const hit = await ReferralRequest.findOneAndUpdate({ _id: r._id, status: "pending" }, { $set: { status: "rejected", decidedAt: new Date(), rejectReason: reason, referrerSeen: true } }, { new: true });
  if (!hit) throw new ResumeError(409, "This request was already answered or withdrawn.", "NOT_PENDING");
  tellRequest(hit);
  return { status: "rejected" };
});
export const cancel = reply(async (req, r) => {
  if (String(r.seeker) !== uid(req)) throw new ResumeError(403, "Only the sender can withdraw it.", "FORBIDDEN");
  const hit = await ReferralRequest.findOneAndUpdate({ _id: r._id, status: "pending" }, { $set: { status: "cancelled", decidedAt: new Date() } }, { new: true });
  if (!hit) throw new ResumeError(409, "This request was already answered.", "NOT_PENDING");
  tellRequest(hit);
  return { status: "cancelled" };
});
export const end = reply(async (req, r) => {
  const hit = await endChat(r, { by: uid(req), reason: String(req.body?.reason || "") });
  if (!hit) throw new ResumeError(409, "This chat isn't active.", "NOT_ACTIVE");
  return { status: "ended" };
});

/* the resume the sender attached: only the two people in it (and only while the request is alive) */
export const resumeLink = handler(async (req, res) => {
  const r = await mineRequest(req);
  if (!r.resume?.key || (r.status === "cancelled" && String(r.referrer) === uid(req))) throw new ResumeError(404, "There is no resume to open.", "NO_FILE");
  const link = await createDownloadUrl(r.resume.key, { filename: r.resume.filename || "resume", inline: req.query.download !== "1", sensitive: true });
  ok(res, { url: link.url, filename: r.resume.filename });
});

/* ---------- unlock: the sender opens the chat after the referrer accepts ---------- */
const allowedReturnOrigin = (raw) => {
  let o;
  try { o = new URL(String(raw)).origin; } catch { return ""; }
  const site = new URL(FRONTEND_URL).origin;
  if (o === site) return o;
  if (process.env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)) return o;
  return "";
};
const startPayment = async (req, order) => {
  const user = await User.findById(uid(req)).select("name email mobile countryCode").lean();
  if (!user) throw new ResumeError(404, "User not found.", "USER_NOT_FOUND");
  const { gateway, gatewayOrderId, checkout } = await startCheckout({ order, user, preferredGateway: req.body?.gateway });
  await ReferralOrder.updateOne({ _id: order._id, "payment.status": { $ne: "paid" } }, { $set: { "payment.gateway": gateway, "payment.gatewayOrderId": gatewayOrderId, "payment.status": "created", "payment.failureReason": null, "payment.returnOrigin": allowedReturnOrigin(req.body?.returnOrigin), ...(cleanReferralCode(req.body?.referralCode) ? { referralCode: cleanReferralCode(req.body.referralCode) } : {}) }, $push: { "payment.attempts": { gateway, gatewayOrderId } } });
  return { orderId: String(order._id), gateway, amount: order.payment.amount, currency: "INR", checkout };
};
export const unlock = handler(async (req, res) => {
  const me = uid(req);
  await assertNotBlocked(me);
  const r = await mineRequest(req);
  if (String(r.seeker) !== me) throw new ResumeError(403, "The sender unlocks the chat.", "FORBIDDEN");
  if (r.status !== "accepted") throw new ResumeError(409, "This request isn't accepted.", "NOT_ACCEPTED");
  if (r.chat.unlocked) return ok(res, { unlocked: true });
  const s = await getSettings();
  if (!s.paywall) { await openChat(r._id, "free"); return ok(res, { unlocked: true }); }
  if (await hasUnlimited(me)) { await openChat(r._id, "subscription"); return ok(res, { unlocked: true, via: "subscription" }); }
  const mode = req.body?.useCredit;
  if (mode !== false) {
    const credit = await spendCredit(me);
    if (credit) {
      if (await openChat(r._id, "credit")) return ok(res, { unlocked: true, via: "credit" });
      await giveBackCredit(credit);
      return ok(res, { unlocked: true });
    }
    if (mode === true) throw new ResumeError(409, "You don't have any chat credits left.", "NO_CREDITS");
  }
  let order = await ReferralOrder.findOne({ user: me, kind: "unlock", request: r._id, "payment.status": { $in: ["none", "created", "failed"] }, "payment.amount": s.unlockFeePaise });
  if (!order) order = await ReferralOrder.create({ user: me, kind: "unlock", request: r._id, title: `Chat with ${r.company || "a referrer"}`, payment: { amount: s.unlockFeePaise, status: "none" } });
  ok(res, { unlocked: false, payment: await startPayment(req, order) }, 201);
});

/* ---------- plans and credits ---------- */
const orderOut = (o) => ({ id: String(o._id), kind: o.kind, title: o.title, amount: toRupees(o.payment?.amount), status: o.payment?.status, allowed: o.allowed, used: o.used, expiresAt: o.expiresAt, paidAt: o.payment?.paidAt, createdAt: o.createdAt, revoked: Boolean(o.revokedAt) });
export const plans = handler(async (req, res) => {
  const me = uid(req);
  const s = await getSettings();
  const kinds = [s.subscriptionEnabled && "unlimited", s.priorityEnabled && "priority"].filter(Boolean);
  // ONE round trip for the whole Plans page: every query below runs at the same time, and `access` is worked out from rows already loaded
  const [rows, credits, subRows, subs, pass, charges, orders] = await Promise.all([
    s.plansEnabled ? ReferralPlan.find({ isActive: true }).sort({ sortOrder: 1, pricePaise: 1 }).lean() : [],
    creditsLeft(me),
    kinds.length ? ReferralSubPlan.find({ isActive: true, kind: { $in: kinds } }).sort({ kind: 1, sortOrder: 1, pricePaise: 1 }).lean() : [],
    ReferralSubscription.find({ user: me, status: { $ne: "created" } }).sort({ createdAt: -1 }).limit(20).lean(),
    livePass(me),
    ReferralSubCharge.find({ user: me }).sort({ at: -1 }).limit(100).lean(),
    ReferralOrder.find({ user: me, $or: [{ "payment.status": "paid" }, { "payment.status": "created", updatedAt: { $gt: new Date(Date.now() - 2 * 86400000) } }] }).sort({ createdAt: -1 }).limit(50).lean(),
  ]);
  const access = accessFrom(subs, pass);
  const by = {};
  for (const c of charges) (by[String(c.subscription)] ||= []).push(chargeOut(c));
  ok(res, {
    plans: rows.map(planOut), credits, paywall: s.paywall, unlockFee: toRupees(s.unlockFeePaise),
    plansEnabled: s.plansEnabled, subscriptionEnabled: s.subscriptionEnabled, priorityEnabled: s.priorityEnabled,
    orders: orders.map(orderOut),
    subPlans: subRows.map((p) => subPlanOut(p)), access, subscriptions: subs.filter((x) => x.status !== "failed").map((x) => ({ ...subOut(x), charges: by[String(x._id)] || [] })),
  });
});
export const buyPlan = handler(async (req, res) => {
  await assertNotBlocked(uid(req));
  const settings = await live();
  if (!settings.plansEnabled) throw new ResumeError(409, "Credit plans aren't on sale right now.", "PLANS_OFF");
  const b = parse(z.object({ planId: z.string(), returnOrigin: z.string().max(120).optional(), gateway: z.string().max(30).optional(), referralCode: z.string().max(64).optional() }), req.body);
  assertId(b.planId, "plan");
  const plan = await ReferralPlan.findOne({ _id: b.planId, isActive: true }).lean();
  if (!plan) throw new ResumeError(404, "This plan isn't available right now.", "PLAN_UNAVAILABLE");
  let order = await ReferralOrder.findOne({ user: uid(req), kind: "plan", plan: plan._id, "payment.status": { $in: ["none", "created", "failed"] }, "payment.amount": plan.pricePaise, allowed: plan.unlocks });
  if (!order) order = await ReferralOrder.create({ user: uid(req), kind: "plan", plan: plan._id, title: plan.name, allowed: plan.unlocks, validityDays: plan.validityDays, payment: { amount: plan.pricePaise, status: "none" } });
  ok(res, await startPayment(req, order), 201);
});
/* ---------- subscriptions and priority ---------- */
const ownSub = async (req) => {
  assertId(req.params.id, "subscription");
  const sub = await ReferralSubscription.findOne({ _id: req.params.id, user: uid(req) });
  if (!sub) throw new ResumeError(404, "Subscription not found.", "NOT_FOUND");
  return sub;
};
const subFull = async (sub) => ({ ...subOut(sub), charges: (await ReferralSubCharge.find({ subscription: sub._id }).sort({ at: -1 }).limit(100).lean()).map(chargeOut) });
export const startSub = handler(async (req, res) => {
  const me = uid(req);
  await assertNotBlocked(me);
  await live();
  const b = parse(z.object({ planId: z.string(), returnOrigin: z.string().max(120).optional(), gateway: z.string().max(30).optional(), referralCode: z.string().max(64).optional() }), req.body);
  assertId(b.planId, "plan");
  ok(res, await startSubscription({ userId: me, planId: b.planId, returnOrigin: allowedReturnOrigin(b.returnOrigin), referralCode: b.referralCode }), 201);
});
export const verifySub = handler(async (req, res) => {
  const sub = await ownSub(req);
  await confirmSubscription(sub, req.body?.payload || {});
  ok(res, { subscription: await subFull(await ReferralSubscription.findById(sub._id)) });
});
export const getSub = handler(async (req, res) => {
  const sub = await ownSub(req);
  // a member looking at a subscription that hasn't settled is a good moment to ask the gateway
  if (["created", "past_due"].includes(sub.status) && sub.gatewaySubscriptionId) await syncSubscription(sub).catch(() => {});
  ok(res, { subscription: await subFull(await ReferralSubscription.findById(sub._id)) });
});
export const cancelSub = handler(async (req, res) => {
  const sub = await ownSub(req);
  await cancelOwn(sub, { by: "member", reason: String(req.body?.reason || "").trim() });
  ok(res, { subscription: await subFull(await ReferralSubscription.findById(sub._id)) });
});
/* pay again after a failed renewal: a fresh checkout at the same price (see startSubscription `replace`) */
export const retrySub = handler(async (req, res) => {
  const sub = await ownSub(req);
  if (sub.status !== "past_due") throw new ResumeError(409, "This subscription has no failed payment to fix.", "NOT_PAST_DUE");
  ok(res, await startSubscription({ userId: uid(req), replace: sub, returnOrigin: allowedReturnOrigin(req.body?.returnOrigin), referralCode: req.body?.referralCode }), 201);
});
/* hide the "payment failed" message until the next failure */
export const closeFailNotice = handler(async (req, res) => {
  const sub = await ownSub(req);
  await ReferralSubscription.updateOne({ _id: sub._id }, { $set: { failNoticeClosedAt: new Date() } });
  ok(res, { closed: true });
});
/* a one-time priority pass: an ordinary order (kind "priority"), paid through the same checkout and verify calls as credits */
export const buyPriority = handler(async (req, res) => {
  const me = uid(req);
  await assertNotBlocked(me);
  const s = await live();
  if (!s.priorityEnabled) throw new ResumeError(409, "Priority isn't on sale right now.", "PLAN_OFF");
  const b = parse(z.object({ planId: z.string(), returnOrigin: z.string().max(120).optional(), gateway: z.string().max(30).optional(), referralCode: z.string().max(64).optional() }), req.body);
  assertId(b.planId, "plan");
  const plan = await ReferralSubPlan.findOne({ _id: b.planId, isActive: true, kind: "priority", billing: "once" }).lean();
  if (!plan) throw new ResumeError(404, "This plan isn't available right now.", "PLAN_UNAVAILABLE");
  let order = await ReferralOrder.findOne({ user: me, kind: "priority", subPlan: plan._id, "payment.status": { $in: ["none", "created", "failed"] }, "payment.amount": plan.pricePaise, validityDays: plan.days });
  if (!order) order = await ReferralOrder.create({ user: me, kind: "priority", subPlan: plan._id, title: plan.name, validityDays: plan.days, payment: { amount: plan.pricePaise, status: "none" } });
  ok(res, await startPayment(req, order), 201);
});
export const wallet = handler(async (req, res) => {
  const rows = await ReferralOrder.find({ user: uid(req), $or: [{ "payment.status": "paid" }, { "payment.status": "created", updatedAt: { $gt: new Date(Date.now() - 2 * 86400000) } }] }).sort({ createdAt: -1 }).limit(50).lean();
  ok(res, { credits: await creditsLeft(uid(req)), orders: rows.map(orderOut) });
});

/* ---------- every payment, in one list ----------
  Orders (one chat, credit packs, priority passes, free credits) and every subscription charge (first payment, renewals, failed tries)
  merged newest first, with everything the detail view needs, so the Payments page is ONE call per page.
*/
const ORDER_STATUS = (o) => (o.revokedAt ? "revoked" : o.payment?.status === "paid" ? (o.payment?.amount ? "paid" : "free") : o.payment?.status === "failed" ? "failed" : "pending");
export const payments = handler(async (req, res) => {
  const me = uid(req);
  const page = num(req.query.page, 1, 1, 200), limit = num(req.query.limit, 20, 1, 50);
  const filter = ["paid", "failed", "subscription", "onetime"].includes(req.query.filter) ? req.query.filter : "all";
  const [orders, charges, subs] = await Promise.all([
    ReferralOrder.find({ user: me, "payment.status": { $in: ["paid", "created", "failed"] } }).sort({ createdAt: -1 }).limit(400).lean(),
    ReferralSubCharge.find({ user: me }).sort({ at: -1 }).limit(400).lean(),
    ReferralSubscription.find({ user: me }).select("planName kind pricePaise gateway status").lean(),
  ]);
  const subOf = Object.fromEntries(subs.map((x) => [String(x._id), x]));
  const fromOrders = orders.map((o) => ({
    id: `o_${o._id}`, ref: String(o._id), source: "order", kind: o.kind, title: o.title || o.kind,
    amount: toRupees(o.payment?.amount), status: ORDER_STATUS(o), at: o.payment?.paidAt || o.updatedAt || o.createdAt, createdAt: o.createdAt,
    paymentId: o.payment?.gatewayPaymentId || "", orderId: o.payment?.gatewayOrderId || "", gateway: o.payment?.gateway === "admin" ? "" : o.payment?.gateway || "",
    reason: o.payment?.status === "failed" ? o.payment?.failureReason || "" : "", canPay: o.payment?.status !== "paid" && ["unlock", "plan", "priority"].includes(o.kind),
    credits: ["plan", "grant"].includes(o.kind) ? { allowed: o.allowed, used: o.used } : null, expiresAt: o.expiresAt, validityDays: o.validityDays || 0,
    requestId: o.request ? String(o.request) : null, note: o.kind === "grant" ? o.note || "" : "",
  }));
  const fromCharges = charges.map((c) => {
    const sub = subOf[String(c.subscription)] || {};
    return {
      id: `c_${c._id}`, ref: String(c._id), source: "subscription", kind: "subscription", subKind: sub.kind || "", title: `${sub.planName || "Subscription"} · ${c.kind === "initial" ? "first payment" : "renewal"}`,
      amount: toRupees(c.amountPaise), status: c.status, at: c.at, createdAt: c.createdAt, paymentId: c.gatewayPaymentId || "", orderId: c.gatewayInvoiceId || "", gateway: sub.gateway || "",
      method: c.method || "", reason: c.reason || "", attempt: c.attempt || 1, periodStart: c.periodStart, periodEnd: c.periodEnd, subscriptionId: String(c.subscription), canPay: false,
    };
  });
  let all = [...fromOrders, ...fromCharges].sort((a, b) => new Date(b.at) - new Date(a.at));
  const summary = {
    spent: Math.round(all.filter((x) => x.status === "paid").reduce((n, x) => n + Number(x.amount || 0), 0) * 100) / 100,
    paid: all.filter((x) => x.status === "paid").length, failed: all.filter((x) => x.status === "failed").length,
    subscriptions: fromCharges.length, lastPaidAt: all.find((x) => x.status === "paid")?.at || null,
  };
  if (filter === "paid") all = all.filter((x) => x.status === "paid" || x.status === "free");
  else if (filter === "failed") all = all.filter((x) => x.status === "failed" || x.status === "pending");
  else if (filter === "subscription") all = all.filter((x) => x.source === "subscription");
  else if (filter === "onetime") all = all.filter((x) => x.source === "order");
  const total = all.length;
  ok(res, { items: all.slice((page - 1) * limit, page * limit), total, page, pages: Math.max(1, Math.ceil(total / limit)), limit, summary });
});

const ownOrder = async (req, id = req.params.id || req.body?.orderId) => {
  assertId(id, "order");
  const o = await ReferralOrder.findOne({ _id: id, user: uid(req) });
  if (!o) throw new ResumeError(404, "Order not found.", "NOT_FOUND");
  return o;
};
export const payOrder = handler(async (req, res) => {
  const o = await ownOrder(req);
  if (o.payment.status === "paid") throw new ResumeError(409, "This is already paid.", "ALREADY_PAID");
  ok(res, await startPayment(req, o), 201);
});
export const verifyPayment = handler(async (req, res) => {
  const o = await ownOrder(req);
  let result;
  try { result = await settleOrder(o, await fetchStatus(o, req.body?.payload || {})); } catch (e) { console.error(`[referral] verify failed for ${o._id}:`, e?.message || e); result = await refreshOrder(o); }
  ok(res, { status: result });
});
export const paymentStatus = handler(async (req, res) => {
  const o = await ownOrder(req);
  const { state, progress, reason } = await refreshOrder(o, { detail: true });
  ok(res, { status: state === "pending" ? "created" : state, progress, reason: state === "failed" ? reason : null, orderId: String(o._id), kind: o.kind, requestId: o.request ? String(o.request) : null, title: o.title, amount: toRupees(o.payment.amount), startedAt: o.updatedAt });
});

/* ---------- chat: history and a REST fallback for every action ---------- */
export const messages = handler(async (req, res) => ok(res, await history({ requestId: req.params.id, userId: uid(req), before: req.query.before, limit: num(req.query.limit, 50, 1, 100) })));
export const sendMessage = handler(async (req, res) => ok(res, { message: await postMessage({ requestId: req.params.id, userId: uid(req), text: req.body?.text, replyTo: req.body?.replyTo }) }, 201));
export const editMsg = handler(async (req, res) => ok(res, { message: await editMessage({ requestId: req.params.id, userId: uid(req), id: req.params.mid, text: req.body?.text }) }));
export const deleteMsg = handler(async (req, res) => ok(res, { message: await deleteMessage({ requestId: req.params.id, userId: uid(req), id: req.params.mid }) }));
export const reactMsg = handler(async (req, res) => ok(res, { message: await reactMessage({ requestId: req.params.id, userId: uid(req), id: req.params.mid, emoji: req.body?.emoji }) }));
export const readChat = handler(async (req, res) => ok(res, { read: true, ...(await markRead({ requestId: req.params.id, userId: uid(req) })) }));
export { openRequestFor };

/* ---------- gateway return + webhook (no login) ---------- */
const resultUrl = (orderId, status, origin) => `${origin || FRONTEND_URL}/referral/app/payment-result?order=${encodeURIComponent(orderId)}&status=${status}`;
const findByOrder = (gateway, gatewayOrderId) => ReferralOrder.findOne({ $or: [{ "payment.gateway": gateway, "payment.gatewayOrderId": gatewayOrderId }, { "payment.attempts": { $elemMatch: { gateway, gatewayOrderId } } }] });
const asAttempt = (o, gateway, gatewayOrderId) => { o.payment.gateway = gateway; o.payment.gatewayOrderId = gatewayOrderId; return o; };

/* the buyer is back from a subscription checkout: ask the gateway what happened, then send the browser to the Credits page */
const subReturn = async (req, res) => {
  const id = String(req.query.sub || "");
  let sub = mongoose.isValidObjectId(id) ? await ReferralSubscription.findById(id) : null;
  const to = (state) => res.redirect(303, `${sub?.returnOrigin || FRONTEND_URL}/referral/app/credits?subscription=${encodeURIComponent(id)}&state=${state}`);
  if (!sub) return to("unknown");
  try { if (sub.gatewaySubscriptionId && ["created", "past_due"].includes(sub.status)) sub = await syncSubscription(sub); } catch (e) { console.error("[referral] subscription return check failed:", e?.message || e); }
  return to(sub.status === "failed" ? "failed" : isLive(sub) ? "live" : "pending");
};
export const gatewayCallback = asyncHandler(async (req, res) => {
  if (req.query.sub) return subReturn(req, res);
  const ref = String(req.query.ref || "");
  const gateway = String(req.params.gateway || "");
  try {
    if (!mongoose.isValidObjectId(ref)) return res.redirect(303, resultUrl("", "failed"));
    const o = await ReferralOrder.findById(ref);
    if (!o) return res.redirect(303, resultUrl("", "failed"));
    const claimed = callbackOf({ gateway, body: { ...req.query, ...req.body } }).gatewayOrderId;
    if (claimed && !(o.payment.attempts || []).some((a) => a.gateway === gateway && a.gatewayOrderId === claimed)) return res.redirect(303, resultUrl(o._id, "failed", o.payment.returnOrigin));
    const state = await refreshOrder(claimed ? asAttempt(o, gateway, claimed) : o);
    return res.redirect(303, resultUrl(o._id, state === "paid" ? "paid" : state === "failed" ? "failed" : "pending", o.payment.returnOrigin));
  } catch (e) {
    console.error("[referral] callback error:", e.message);
    return res.redirect(303, resultUrl(ref, "pending"));
  }
});
export const gatewayWebhook = asyncHandler(async (req, res) => {
  const gateway = String(req.params.gateway || "");
  if (!Buffer.isBuffer(req.body)) return res.status(404).json({ success: false });
  // subscription events (charged / failed / cancelled ...) first; anything else is an ordinary order payment
  const sp = parseSubscriptionWebhook({ product: "REFERRAL", gateway, rawBody: req.body.toString("utf8"), headers: req.headers });
  if (sp.valid && sp.subscription) {
    if (sp.ignore || !sp.event) return res.json({ success: true });
    try {
      const sub = await findByGatewayId(gateway, sp.event.gatewaySubscriptionId);
      if (sub) await applyGatewayEvent(sub, { type: sp.event.type, state: sp.event.state, payment: sp.event.payment, eventId: sp.event.id });
      return res.json({ success: true });
    } catch (e) { console.error("[referral] subscription webhook error:", e.message); return res.status(500).json({ success: false }); }
  }
  const parsed = webhookOf({ gateway, rawBody: req.body.toString("utf8"), headers: req.headers });
  if (!parsed.valid) return res.status(400).json({ success: false, message: "Invalid signature" });
  if (parsed.ignore) return res.json({ success: true });
  try {
    const o = await findByOrder(gateway, parsed.gatewayOrderId);
    if (o) await refreshOrder(asAttempt(o, gateway, parsed.gatewayOrderId));
    return res.json({ success: true });
  } catch (e) { console.error("[referral] webhook error:", e.message); return res.status(500).json({ success: false }); }
});
