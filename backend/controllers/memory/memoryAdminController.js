import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { z } from "zod";

import MemoryPage from "../../models/memory/MemoryPage.js";
import MemoryOccasion from "../../models/memory/MemoryOccasion.js";
import MemoryCode from "../../models/memory/MemoryCode.js";
import MemoryCredit from "../../models/memory/MemoryCredit.js";
import MemoryOrder from "../../models/memory/MemoryOrder.js";
import MemoryGumroadProduct from "../../models/memory/MemoryGumroadProduct.js";
import MemoryGumroadSale from "../../models/memory/MemoryGumroadSale.js";
import { checkConnection } from "../../services/memory/gumroad.js";
import MemoryEvent from "../../models/memory/MemoryEvent.js";
import MemoryMailBlock from "../../models/memory/MemoryMailBlock.js";
import User from "../../models/User.js";
import UserActivity from "../../models/UserActivity.js";

import { digitsOf, formatPhone } from "../../utils/phone.js";
import { removeFiles } from "../../services/memory/storageCleanup.js";
import { changeAccountSecurityState, invalidateUserAuth, revokeAllRedisSessions } from "../../services/authStateService.js";
import { purgeUser } from "../../services/arena/purge.js";
import { activeGateways, knownGateways } from "../../services/memory/payments/index.js";
import {
  MemoryError, assertId, deleteMediaObjects, purgePageEvents, ensureOccasions, escapeRegex, getSettings, grantCredits,
  hashPin, encryptPin, buildActivity, MAX_EVENTS_PER_PAGE, newCode, newPin, newSlug, pageView, parse, sendError, updateSettings,
} from "../../services/memory/memoryService.js";

const handler = (fn) =>
  asyncHandler(async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      return sendError(res, err);
    }
  });
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const paginate = (req, max = 100) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), max);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  return { limit, page, skip: (page - 1) * limit };
};

/*
  KEYSET PAGINATION (lazy loading). "Skip N" gets slower the further you scroll; a cursor ("everything older than this row") stays fast
  however many rows there are, and never repeats or skips a row when new ones arrive. The cursor is opaque to the browser.
*/
const encodeCursor = (row) => Buffer.from(JSON.stringify([new Date(row.createdAt).toISOString(), String(row._id)])).toString("base64url");
const cursorFilter = (cursor) => {
  if (!cursor) return null;
  try {
    const [t, id] = JSON.parse(Buffer.from(String(cursor), "base64url").toString("utf8"));
    const at = new Date(t);
    if (Number.isNaN(at.getTime()) || !mongoose.isValidObjectId(id)) return null;
    return { $or: [{ createdAt: { $lt: at } }, { createdAt: at, _id: { $lt: new mongoose.Types.ObjectId(id) } }] };
  } catch {
    return null;
  }
};
/** Newest first, `limit` rows after `cursor`. Fetches one extra row to know whether there is more, without counting the whole collection. */
const keysetPage = async (Model, filter, req, { max = 100, populate, select } = {}) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), max);
  const after = cursorFilter(req.query.cursor);
  const where = after ? { $and: [filter, after] } : filter;
  let q = Model.find(where).sort({ createdAt: -1, _id: -1 }).limit(limit + 1);
  if (select) q = q.select(select);
  if (populate) q = q.populate(...populate);
  const rows = await q.lean();
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  return { items, hasMore, nextCursor: hasMore ? encodeCursor(items[items.length - 1]) : null, limit };
};
/** A total is a full count, so it is only worked out when asked for (the first page), not on every "load more". */
const maybeTotal = async (Model, filter, req) => (req.query.withTotal === "1" ? Model.countDocuments(filter) : undefined);

const rupees = (paise) => Math.round(Number(paise) || 0) / 100;
const pinField = z.string().regex(/^\d{6}$/, "PIN must be exactly 6 digits");

/* =====================================================
   SETTINGS  (price + upload limits)
===================================================== */

/** Every gateway the code supports, whether its keys are present, and whether the admin switched it on. */
export const listGateways = handler(async (req, res) => {
  const s = await getSettings();
  const live = new Set(activeGateways(s).map((g) => g.id));
  ok(res, {
    defaultGateway: s.defaultGateway || "",
    items: knownGateways().map((g) => ({ ...g, enabled: live.has(g.id) })),
  });
});

export const readSettings = handler(async (req, res) => ok(res, await getSettings()));

export const saveSettings = handler(async (req, res) => {
  const b = parse(
    z.object({
      price: z.number().min(0).max(1000000),
      maxPhotos: z.number().int().min(0).max(500),
      maxVideos: z.number().int().min(0).max(100),
      maxPhotoMb: z.number().min(0.1).max(25),
      maxVideoMb: z.number().min(0.1).max(500),
      maxMessageChars: z.number().int().min(10).max(10000),
      pageLifetimeDays: z.number().int().min(1).max(3650),
      emailEnabled: z.boolean(),
      maxEmailsPerUserPerDay: z.number().int().min(1).max(200),
      enabled: z.boolean(),
      enabledGateways: z.array(z.string()).max(20),
      defaultGateway: z.string().max(30),
    }).partial(),
    req.body
  );
  // Only real, configured gateways can be switched on.
  const known = new Map(knownGateways().map((g) => [g.id, g]));
  for (const id of b.enabledGateways || []) {
    if (!known.has(id)) throw new MemoryError(400, `Unknown payment gateway "${id}".`, "UNKNOWN_GATEWAY");
    if (!known.get(id).configured) throw new MemoryError(400, `${known.get(id).label} has no API keys on the server yet.`, "GATEWAY_NOT_CONFIGURED");
  }
  if (b.defaultGateway && !known.has(b.defaultGateway)) throw new MemoryError(400, "Unknown default gateway.", "UNKNOWN_GATEWAY");
  ok(res, await updateSettings(b));
});

/* =====================================================
   DASHBOARD
===================================================== */

export const stats = handler(async (req, res) => {
  const [pages, active, orders, revenue, redeemed, storage, creditsOpen] = await Promise.all([
    MemoryPage.estimatedDocumentCount(),
    MemoryPage.countDocuments({ status: "active" }),
    MemoryOrder.countDocuments({ status: "paid" }),
    MemoryOrder.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, t: { $sum: "$amount" } } }]),
    MemoryCode.aggregate([{ $group: { _id: null, t: { $sum: "$usedCount" } } }]),
    MemoryPage.aggregate([{ $unwind: "$media" }, { $group: { _id: null, t: { $sum: "$media.size" } } }]),
    MemoryCredit.countDocuments({ page: null }),
  ]);
  const views = await MemoryPage.aggregate([{ $group: { _id: null, t: { $sum: "$viewCount" } } }]);
  ok(res, {
    pages, activePages: active, paidOrders: orders, revenue: rupees(revenue[0]?.t),
    codesRedeemed: redeemed[0]?.t || 0, storageBytes: storage[0]?.t || 0, unusedCredits: creditsOpen, totalViews: views[0]?.t || 0,
  });
});

/* =====================================================
   PAGES  (live list + controls)
===================================================== */

const loadPage = async (id) => {
  assertId(id, "page id");
  const page = await MemoryPage.findById(id).select("+pinEnc").populate("occasion", "name theme").populate("user", "name email mobile countryCode");
  if (!page) throw new MemoryError(404, "Page not found.", "PAGE_NOT_FOUND");
  return page;
};
const out = async (id, opts) => pageView(await loadPage(id), opts);

export const listPages = handler(async (req, res) => {
  const { limit, page, skip } = paginate(req);
  const filter = {};
  if (["active", "closed", "blocked"].includes(req.query.status)) filter.status = req.query.status;
  if (["public", "private"].includes(req.query.visibility)) filter.visibility = req.query.visibility;
  // filter by end date: ?expiresWithin=7 (days from now), or an exact range ?expiresFrom=2026-12-01&expiresTo=2026-12-31
  const within = parseInt(req.query.expiresWithin, 10);
  const range = {};
  if (within > 0) { range.$gt = new Date(); range.$lte = new Date(Date.now() + within * 24 * 3600 * 1000); }
  const day = (v, end) => { const d = new Date(`${String(v)}T${end ? "23:59:59.999" : "00:00:00"}Z`); return Number.isNaN(d.getTime()) ? null : d; };
  if (req.query.expiresFrom && day(req.query.expiresFrom)) range.$gte = day(req.query.expiresFrom);
  if (req.query.expiresTo && day(req.query.expiresTo, true)) range.$lte = day(req.query.expiresTo, true);
  if (Object.keys(range).length) filter.expiresAt = range;
  const sort = req.query.sort === "expiry" ? { expiresAt: 1, createdAt: -1 } : { createdAt: -1 };
  const q = String(req.query.q || "").trim().slice(0, 80);
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    const owners = await User.find({ $or: [{ email: rx }, { name: rx }, ...(digitsOf(q).length >= 3 ? [{ mobile: new RegExp(escapeRegex(digitsOf(q))) }] : [])] }).select("_id").limit(200).lean();
    filter.$or = [{ title: rx }, { recipientName: rx }, { slug: q }, { user: { $in: owners.map((u) => u._id) } }];
  }
  const [rows, total] = await Promise.all([
    MemoryPage.find(filter).select("+pinEnc").sort(sort).skip(skip).limit(limit).populate("occasion", "name theme").populate("user", "name email mobile countryCode"),
    MemoryPage.countDocuments(filter),
  ]);
  ok(res, { items: await Promise.all(rows.map((p) => pageView(p, { withPin: true }))), total, page, pages: Math.ceil(total / limit) });
});

export const getPage = handler(async (req, res) => ok(res, await out(req.params.id, { withMedia: true, withPin: true })));

/** What the receiver did on a page (same report the owner sees). */
export const getPageActivity = handler(async (req, res) => {
  const page = await loadPage(req.params.id);
  const events = await MemoryEvent.find({ page: page._id }).sort({ at: 1 }).limit(MAX_EVENTS_PER_PAGE).select("type data visitor at").lean();
  ok(res, buildActivity(page, events));
});

/** Give a page more time (or set its last day). Works on a page that has run out but hasn't been cleaned up yet. */
export const setExpiry = handler(async (req, res) => {
  const b = parse(z.object({ extendDays: z.number().int().min(1).max(3650).optional(), endsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() }), req.body);
  if (!b.extendDays && !b.endsOn) throw new MemoryError(400, "Say how many days to add, or the last day.", "NOTHING_TO_CHANGE");
  const page = await loadPage(req.params.id);
  let next;
  if (b.endsOn) {
    next = new Date(`${b.endsOn}T23:59:59.999Z`);
    if (Number.isNaN(next.getTime()) || next.getTime() <= Date.now()) throw new MemoryError(400, "The last day must be in the future.", "INVALID_DATE");
  } else {
    const base = page.expiresAt && new Date(page.expiresAt).getTime() > Date.now() ? new Date(page.expiresAt).getTime() : Date.now();
    next = new Date(base + b.extendDays * 24 * 3600 * 1000);
  }
  page.expiresAt = next;
  await page.save();
  console.log(`[memory] admin ${req.user.id} set page ${page._id} to end ${next.toISOString()}`);
  ok(res, await out(page._id));
});

/** Set / regenerate a PIN. A public page becomes private. The PIN is returned once. */
export const setPin = handler(async (req, res) => {
  const page = await loadPage(req.params.id);
  const b = parse(z.object({ pin: pinField.optional() }), req.body);
  const pin = b.pin || newPin();
  page.pinHash = await hashPin(pin);
  page.pinEnc = encryptPin(pin);
  page.visibility = "private";
  page.accessVersion += 1;
  await page.save();
  ok(res, { pin, page: await out(page._id) });
});

export const setVisibility = handler(async (req, res) => {
  const page = await loadPage(req.params.id);
  const b = parse(z.object({ visibility: z.enum(["public", "private"]), pin: pinField.optional() }), req.body);
  let pin = null;
  if (b.visibility === "private") {
    pin = b.pin || newPin();
    page.pinHash = await hashPin(pin);
    page.pinEnc = encryptPin(pin);
  } else {
    page.pinHash = null;
    page.pinEnc = null;
  }
  page.visibility = b.visibility;
  page.accessVersion += 1;
  await page.save();
  ok(res, { pin, page: await out(page._id) });
});

const notBlocked = (page) => {
  if (page.status === "blocked") throw new MemoryError(400, "Page is blocked. Unblock it first.", "PAGE_BLOCKED");
};

export const closePage = handler(async (req, res) => {
  const page = await loadPage(req.params.id);
  notBlocked(page);
  page.status = "closed";
  page.accessVersion += 1;
  await page.save();
  ok(res, await out(page._id));
});

export const reopenPage = handler(async (req, res) => {
  const page = await loadPage(req.params.id);
  notBlocked(page);
  page.status = "active";
  await page.save();
  ok(res, await out(page._id));
});

export const regenerateLink = handler(async (req, res) => {
  const page = await loadPage(req.params.id);
  notBlocked(page);
  page.slug = newSlug();
  page.status = "active";
  page.accessVersion += 1;
  await page.save();
  ok(res, await out(page._id));
});

export const blockPage = handler(async (req, res) => {
  const { blocked } = parse(z.object({ blocked: z.boolean() }), req.body);
  const page = await loadPage(req.params.id);
  page.status = blocked ? "blocked" : "closed"; // unblocking leaves it closed so the owner decides when to reopen
  page.accessVersion += 1;
  await page.save();
  ok(res, await out(page._id));
});

export const removePageMedia = handler(async (req, res) => {
  const page = await loadPage(req.params.id);
  const media = page.media.id(req.params.mediaId);
  if (!media) throw new MemoryError(404, "Media not found.", "MEDIA_NOT_FOUND");
  const { key, kind, isMain } = media;
  media.deleteOne();
  if (isMain) {
    const next = page.media.find((m) => m.kind === kind);
    if (next) next.isMain = true;
  }
  await page.save();
  await removeFiles([key]);
  ok(res, await out(page._id, { withMedia: true }));
});

export const deletePage = handler(async (req, res) => {
  const page = await loadPage(req.params.id);
  await deleteMediaObjects(page.media);
  await purgePageEvents(page._id);
  await page.deleteOne();
  ok(res, { deleted: true });
});

/* =====================================================
   USERS  (memory view of the existing user table) + CREDITS
===================================================== */

export const listUsers = handler(async (req, res) => {
  const filter = { isDeleted: { $ne: true } };
  const q = String(req.query.q || "").trim().slice(0, 80);
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { email: rx }, ...(digitsOf(q).length >= 3 ? [{ mobile: new RegExp(escapeRegex(digitsOf(q))) }] : [])];
  }
  if (["active", "inactive", "suspended", "blocked"].includes(req.query.status)) filter.status = req.query.status;

  const { items: users, hasMore, nextCursor } = await keysetPage(User, filter, req, { select: "name email mobile countryCode role status statusReason lastLoginAt createdAt" });
  const ids = users.map((u) => u._id);
  const [pageCounts, creditCounts, total] = await Promise.all([
    MemoryPage.aggregate([{ $match: { user: { $in: ids } } }, { $group: { _id: "$user", n: { $sum: 1 } } }]),
    MemoryCredit.aggregate([{ $match: { user: { $in: ids }, page: null } }, { $group: { _id: "$user", n: { $sum: 1 } } }]),
    maybeTotal(User, filter, req),
  ]);
  const pc = new Map(pageCounts.map((r) => [String(r._id), r.n]));
  const cc = new Map(creditCounts.map((r) => [String(r._id), r.n]));
  ok(res, {
    items: users.map((u) => ({ id: String(u._id), name: u.name, email: u.email, mobile: u.mobile || null, countryCode: u.mobile ? u.countryCode || "+91" : null, phone: formatPhone(u.countryCode, u.mobile) || null, role: u.role, status: u.status, statusReason: u.statusReason || "", lastLoginAt: u.lastLoginAt || null, createdAt: u.createdAt, pages: pc.get(String(u._id)) || 0, credits: cc.get(String(u._id)) || 0 })),
    hasMore, nextCursor, ...(total !== undefined ? { total } : {}),
  });
});

export const grantUserCredits = handler(async (req, res) => {
  assertId(req.params.userId, "user id");
  const { count } = parse(z.object({ count: z.number().int().min(1).max(50).default(1) }), req.body);
  if (!(await User.exists({ _id: req.params.userId }))) throw new MemoryError(404, "User not found.", "USER_NOT_FOUND");
  await grantCredits(req.params.userId, { source: "admin", ref: String(req.user.id), count });
  ok(res, { granted: count });
});

/** Take unused credits back (newest first). Credits already spent on a page can't be taken: the page exists. */
export const removeUserCredits = handler(async (req, res) => {
  assertId(req.params.userId, "user id");
  const { count } = parse(z.object({ count: z.number().int().min(1).max(500).default(1) }), req.body);
  if (!(await User.exists({ _id: req.params.userId }))) throw new MemoryError(404, "User not found.", "USER_NOT_FOUND");
  const available = await MemoryCredit.countDocuments({ user: req.params.userId, page: null });
  if (available < 1) throw new MemoryError(400, "This user has no unused credits to remove.", "NO_CREDITS");
  if (count > available) throw new MemoryError(400, `This user only has ${available} unused credit${available === 1 ? "" : "s"}.`, "NOT_ENOUGH_CREDITS");
  const ids = (await MemoryCredit.find({ user: req.params.userId, page: null }).sort({ createdAt: -1 }).limit(count).select("_id").lean()).map((c) => c._id);
  const r = await MemoryCredit.deleteMany({ _id: { $in: ids }, page: null }); // `page: null` again, so a credit spent a moment ago is never taken
  console.log(`[memory] admin ${req.user.id} removed ${r.deletedCount} credit(s) from user ${req.params.userId}`);
  ok(res, { removed: r.deletedCount, remaining: available - r.deletedCount });
});

/* ---- suspend / unsuspend / delete: the same account controls as User Management, available here ---- */
const targetUser = async (req) => {
  assertId(req.params.userId, "user id");
  if (String(req.user.id) === String(req.params.userId)) throw new MemoryError(403, "You can't do this to your own account.", "SELF_ACTION");
  const user = await User.findOne({ _id: req.params.userId, isDeleted: { $ne: true } });
  if (!user) throw new MemoryError(404, "User not found.", "USER_NOT_FOUND");
  if (user.role === "admin") throw new MemoryError(403, "Admin accounts can't be suspended or deleted here.", "ADMIN_PROTECTED");
  return user;
};

export const suspendUser = handler(async (req, res) => {
  const { reason } = parse(z.object({ reason: z.string().trim().max(500).optional() }), req.body || {});
  const user = await targetUser(req);
  if (user.status === "suspended") throw new MemoryError(400, "This account is already suspended.", "ALREADY_SUSPENDED");
  // signs them out everywhere, blocks login, and (see the viewer) closes their pages until it is lifted
  await changeAccountSecurityState({
    userId: user._id, actorId: req.user.id, reason: "Suspended by an admin (Memories)",
    update: { status: "suspended", statusReason: reason || null, statusChangedAt: new Date(), statusChangedBy: req.user.id, updatedBy: req.user.id },
  });
  ok(res, { status: "suspended" });
});

export const unsuspendUser = handler(async (req, res) => {
  const user = await targetUser(req);
  if (user.status === "active") throw new MemoryError(400, "This account is already active.", "ALREADY_ACTIVE");
  await changeAccountSecurityState({
    userId: user._id, actorId: req.user.id, reason: "Reinstated by an admin (Memories)",
    update: { status: "active", statusReason: null, statusChangedAt: new Date(), statusChangedBy: req.user.id, updatedBy: req.user.id },
  });
  ok(res, { status: "active" });
});

/** Permanently delete the user: their Memories pages (and every file and activity record), credits, and the account itself. Orders are kept as payment records. */
export const deleteUser = handler(async (req, res) => {
  const user = await targetUser(req);
  const pages = await MemoryPage.find({ user: user._id });
  for (const p of pages) await deleteMediaObjects(p.media);
  await purgePageEvents(pages.map((p) => p._id));
  await MemoryPage.deleteMany({ user: user._id });
  await MemoryCredit.deleteMany({ user: user._id });
  await invalidateUserAuth(user._id);
  await revokeAllRedisSessions(user._id);
  await purgeUser(user._id, { mode: "hard" });
  await UserActivity.deleteMany({ user: user._id });
  console.log(`[memory] admin ${req.user.id} deleted user ${user._id} (${user.email}) with ${pages.length} page(s)`);
  ok(res, { deleted: true, pagesDeleted: pages.length });
});

/* Login history comes from the existing UserActivity log written by authController. */
const LOGIN_ACTIONS = { all: ["LOGIN_SUCCESS", "LOGIN_OTP_FAILED", "LOGOUT"], success: ["LOGIN_SUCCESS"], failed: ["LOGIN_OTP_FAILED"] };

export const loginActivity = handler(async (req, res) => {
  const actions = LOGIN_ACTIONS[req.query.type] || LOGIN_ACTIONS.all;
  const filter = { action: { $in: actions } };
  const { items: rows, hasMore, nextCursor } = await keysetPage(UserActivity, filter, req, { max: 200, populate: ["user", "name email role"] });
  const total = await maybeTotal(UserActivity, filter, req);
  ok(res, {
    items: rows.map((r) => ({
      id: String(r._id), action: r.action, result: r.result, at: r.createdAt, ip: r.ipAddress || null, userAgent: r.userAgent || null,
      user: r.user ? { id: String(r.user._id), name: r.user.name, email: r.user.email, role: r.user.role } : null,
    })),
    hasMore, nextCursor, ...(total !== undefined ? { total } : {}),
  });
});

/** Delete one login-history entry. Only login/logout events can be removed here. */
export const deleteLoginEvent = handler(async (req, res) => {
  assertId(req.params.id, "activity id");
  const r = await UserActivity.deleteOne({ _id: req.params.id, action: { $in: LOGIN_ACTIONS.all } });
  if (!r.deletedCount) throw new MemoryError(404, "Entry not found.", "ACTIVITY_NOT_FOUND");
  ok(res, { deleted: 1 });
});

/** Clear login history of one type, optionally only entries older than N days. */
export const clearLoginEvents = handler(async (req, res) => {
  const actions = LOGIN_ACTIONS[req.query.type] || LOGIN_ACTIONS.all;
  const filter = { action: { $in: actions } };
  const days = parseInt(req.query.olderThanDays, 10);
  if (days > 0) filter.createdAt = { $lt: new Date(Date.now() - days * 86400000) };
  const r = await UserActivity.deleteMany(filter);
  ok(res, { deleted: r.deletedCount });
});

/** Remove every memory page a user owns (and its files). The account itself is untouched. */
export const deleteUserPages = handler(async (req, res) => {
  assertId(req.params.userId, "user id");
  const pages = await MemoryPage.find({ user: req.params.userId });
  for (const p of pages) await deleteMediaObjects(p.media);
  await purgePageEvents(pages.map((p) => p._id));
  await MemoryPage.deleteMany({ user: req.params.userId });
  ok(res, { deleted: pages.length });
});

/* =====================================================
   ACCESS CODES
===================================================== */

export const listCodes = handler(async (req, res) => {
  const codes = await MemoryCode.find().sort({ createdAt: -1 }).limit(500).lean();
  ok(res, codes.map((c) => ({ id: String(c._id), code: c.code, maxUses: c.maxUses, usedCount: c.usedCount, expiresAt: c.expiresAt, isActive: c.isActive, note: c.note || "", createdAt: c.createdAt })));
});

export const createCodes = handler(async (req, res) => {
  const b = parse(
    z.object({
      code: z.string().trim().min(4).max(40).optional(),
      count: z.number().int().min(1).max(500).default(1),
      maxUses: z.number().int().min(1).max(100000).default(1),
      expiresAt: z.string().datetime().optional(),
      note: z.string().max(200).optional(),
    }),
    req.body
  );
  if (b.code && b.count > 1) throw new MemoryError(400, "A custom code can only be created one at a time.", "CUSTOM_CODE_COUNT");
  const codes = b.code ? [b.code.toUpperCase()] : Array.from({ length: b.count }, newCode);
  try {
    await MemoryCode.insertMany(codes.map((code) => ({ code, maxUses: b.maxUses, expiresAt: b.expiresAt || null, note: b.note, createdBy: req.user.id })));
  } catch (e) {
    if (e?.code === 11000 || e?.writeErrors) throw new MemoryError(409, "That code already exists.", "CODE_EXISTS");
    throw e;
  }
  ok(res, { codes }, 201);
});

export const updateCode = handler(async (req, res) => {
  assertId(req.params.id, "code id");
  const b = parse(z.object({ isActive: z.boolean(), maxUses: z.number().int().min(1), expiresAt: z.string().datetime().nullable() }).partial(), req.body);
  const c = await MemoryCode.findByIdAndUpdate(req.params.id, { $set: b }, { new: true });
  if (!c) throw new MemoryError(404, "Code not found.", "CODE_NOT_FOUND");
  ok(res, { id: String(c._id) });
});

export const deleteCode = handler(async (req, res) => {
  assertId(req.params.id, "code id");
  await MemoryCode.findByIdAndDelete(req.params.id);
  ok(res, { deleted: true });
});

/* =====================================================
   GUMROAD: the products on sale and the keys that have been redeemed
===================================================== */
const gumroadProductBody = z.object({
  name: z.string().trim().min(1).max(80),
  productId: z.string().trim().min(3).max(80),
  credits: z.number().int().min(1).max(1000),
  priceLabel: z.string().trim().max(30).optional(),
  url: z.string().trim().max(300).refine((v) => !v || /^https:\/\//i.test(v), "The link must start with https://").optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(1000).optional(),
});
const gumroadRow = (p) => ({ id: String(p._id), name: p.name, productId: p.productId, credits: p.credits, priceLabel: p.priceLabel || "", url: p.url || "", isActive: p.isActive, sortOrder: p.sortOrder || 0 });

export const gumroadStatus = handler(async (req, res) => ok(res, await checkConnection()));
export const listGumroadProducts = handler(async (req, res) => {
  const rows = await MemoryGumroadProduct.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  ok(res, rows.map(gumroadRow));
});
export const createGumroadProduct = handler(async (req, res) => {
  const b = parse(gumroadProductBody, req.body);
  try {
    const p = await MemoryGumroadProduct.create(b);
    ok(res, gumroadRow(p), 201);
  } catch (e) {
    if (e?.code === 11000) throw new MemoryError(409, "That Gumroad product id is already added.", "PRODUCT_EXISTS");
    throw e;
  }
});
export const updateGumroadProduct = handler(async (req, res) => {
  assertId(req.params.id, "product id");
  const b = parse(gumroadProductBody.partial(), req.body);
  try {
    const p = await MemoryGumroadProduct.findByIdAndUpdate(req.params.id, { $set: b }, { new: true });
    if (!p) throw new MemoryError(404, "Product not found.", "PRODUCT_NOT_FOUND");
    ok(res, gumroadRow(p));
  } catch (e) {
    if (e?.code === 11000) throw new MemoryError(409, "That Gumroad product id is already added.", "PRODUCT_EXISTS");
    throw e;
  }
});
/* "Show on payment page": this product goes first; the others keep their order behind it. */
export const makeGumroadPrimary = handler(async (req, res) => {
  assertId(req.params.id, "product id");
  const rows = await MemoryGumroadProduct.find().sort({ sortOrder: 1, createdAt: 1 }).select("_id").lean();
  if (!rows.some((r) => String(r._id) === req.params.id)) throw new MemoryError(404, "Product not found.", "PRODUCT_NOT_FOUND");
  const order = [req.params.id, ...rows.map((r) => String(r._id)).filter((id) => id !== req.params.id)];
  await MemoryGumroadProduct.bulkWrite(order.map((id, i) => ({ updateOne: { filter: { _id: id }, update: { $set: { sortOrder: i } } } })));
  ok(res, { primary: req.params.id });
});
export const deleteGumroadProduct = handler(async (req, res) => {
  assertId(req.params.id, "product id");
  await MemoryGumroadProduct.findByIdAndDelete(req.params.id); // keys already redeemed stay on record and stay used
  ok(res, { deleted: true });
});
export const listGumroadSales = handler(async (req, res) => {
  const rows = await MemoryGumroadSale.find().sort({ createdAt: -1 }).limit(300).populate("user", "name email").lean();
  ok(res, rows.map((r) => ({
    id: String(r._id), when: r.createdAt, product: r.productName, credits: r.credits, saleId: r.saleId, buyerEmail: r.buyerEmail,
    user: r.user ? { id: String(r.user._id), name: r.user.name, email: r.user.email } : null,
  })));
});

/* =====================================================
   MAIL BLOCKS: addresses that must never be emailed a page
===================================================== */
export const listMailBlocks = handler(async (req, res) => {
  const rows = await MemoryMailBlock.find().sort({ createdAt: -1 }).limit(500).lean();
  ok(res, rows.map((b) => ({ id: String(b._id), email: b.email, note: b.note, createdAt: b.createdAt })));
});
export const addMailBlock = handler(async (req, res) => {
  const b = parse(z.object({ email: z.string().trim().toLowerCase().email().max(254), note: z.string().trim().max(300).optional() }), req.body);
  const row = await MemoryMailBlock.findOneAndUpdate({ email: b.email }, { $set: { note: b.note || "", addedBy: req.user.id } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  ok(res, { id: String(row._id), email: row.email });
});
export const removeMailBlock = handler(async (req, res) => {
  assertId(req.params.id, "id");
  await MemoryMailBlock.deleteOne({ _id: req.params.id });
  ok(res, { deleted: true });
});

/* =====================================================
   ORDERS
===================================================== */

export const listOrders = handler(async (req, res) => {
  const { limit, page, skip } = paginate(req);
  const [rows, total] = await Promise.all([
    MemoryOrder.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user", "name email mobile countryCode").lean(),
    MemoryOrder.countDocuments(),
  ]);
  ok(res, {
    items: rows.map((o) => ({ id: String(o._id), user: o.user ? { name: o.user.name, email: o.user.email, phone: formatPhone(o.user.countryCode, o.user.mobile) || null } : null, amount: rupees(o.amount), status: o.status, gateway: o.gateway, gatewayOrderId: o.gatewayOrderId, gatewayPaymentId: o.gatewayPaymentId, failureReason: o.failureReason, createdAt: o.createdAt, paidAt: o.paidAt })),
    total, page, pages: Math.ceil(total / limit),
  });
});

/**
  An admin can delete any order (after a confirmation in the screen). Deleting a PAID order removes the record only: the credit it gave
  stays with the user, and it can't be given twice because the credit is tied to that order's id.
*/
export const deleteOrder = handler(async (req, res) => {
  assertId(req.params.id, "order id");
  const o = await MemoryOrder.findById(req.params.id);
  if (!o) throw new MemoryError(404, "Order not found.", "ORDER_NOT_FOUND");
  await o.deleteOne();
  console.log(`[memory] admin ${req.user.id} deleted ${o.status} order ${o._id} (${o.gateway} ${o.gatewayOrderId})`);
  ok(res, { deleted: true, wasPaid: o.status === "paid" });
});

/* =====================================================
   OCCASIONS
===================================================== */

const occasionOut = (o) => ({ id: String(o._id), name: o.name, theme: o.theme, isActive: o.isActive, sortOrder: o.sortOrder });

export const listOccasions = handler(async (req, res) => {
  await ensureOccasions();
  ok(res, (await MemoryOccasion.find().sort({ sortOrder: 1, name: 1 }).lean()).map(occasionOut));
});

export const createOccasion = handler(async (req, res) => {
  const b = parse(z.object({ name: z.string().trim().min(1).max(60), theme: z.string().trim().toLowerCase().max(40).optional() }), req.body);
  try {
    const o = await MemoryOccasion.create({ name: b.name, theme: b.theme || "default", sortOrder: await MemoryOccasion.countDocuments() });
    ok(res, occasionOut(o), 201);
  } catch (e) {
    if (e?.code === 11000) throw new MemoryError(409, "That occasion already exists.", "OCCASION_EXISTS");
    throw e;
  }
});

export const updateOccasion = handler(async (req, res) => {
  assertId(req.params.id, "occasion id");
  const b = parse(z.object({ name: z.string().trim().min(1).max(60), theme: z.string().trim().toLowerCase().max(40), isActive: z.boolean(), sortOrder: z.number().int() }).partial(), req.body);
  const o = await MemoryOccasion.findByIdAndUpdate(req.params.id, { $set: b }, { new: true, runValidators: true });
  if (!o) throw new MemoryError(404, "Occasion not found.", "OCCASION_NOT_FOUND");
  ok(res, occasionOut(o));
});

export const deleteOccasion = handler(async (req, res) => {
  assertId(req.params.id, "occasion id");
  const inUse = await MemoryPage.countDocuments({ occasion: req.params.id });
  if (inUse) throw new MemoryError(409, `${inUse} page(s) use this occasion. Hide it instead of deleting.`, "OCCASION_IN_USE");
  await MemoryOccasion.findByIdAndDelete(req.params.id);
  ok(res, { deleted: true });
});
