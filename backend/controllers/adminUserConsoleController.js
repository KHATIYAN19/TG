import mongoose from "mongoose";

import User from "../models/User.js";
import UserSession from "../models/UserSession.js";
import UserActivity from "../models/UserActivity.js";
import Order from "../models/Order.js";

import { shapeActivity, shapeSession } from "./accountController.js";
import {
  updateUserStatus,
  deleteUser,
  sendPasswordLink,
  adminRevokeAll,
} from "./adminUserController.js";

/*
  ADMIN · USER CONSOLE  (/admin/users)
  One call per screen. The single-user actions (edit, status, affiliate status, password link,
  sign out, delete) stay in adminUserController.js; this file adds the reads that feed the screens,
  bulk actions that re-use those handlers (so every rule and audit log still applies), and a CSV export.

    GET  /api/admin/users/console?view=overview            numbers, charts, lists that need attention
    GET  /api/admin/users/console?view=all|affiliates|restricted|pending&…filters
                                                           one page of users + online/device counts + chip counts
    GET  /api/admin/users/:userId/console                  everything for one person
    POST /api/admin/users/bulk                             { ids, action, status?, reason? }
    GET  /api/admin/users/export?…same filters             CSV
*/

const ROLES = ["admin", "Employee", "normal", "affiliate", "partner"];
const STATUSES = ["active", "inactive", "suspended", "blocked"];
const RESTRICTED = ["inactive", "suspended", "blocked"];
const SORTS = {
  new: { createdAt: -1 },
  old: { createdAt: 1 },
  name: { name: 1, createdAt: -1 },
  login: { lastLoginAt: -1, createdAt: -1 },
};
const LIST_FIELDS =
  "name email countryCode mobile role status statusReason affiliate lastLoginAt mustChangePassword emailVerifiedAt googleLinkedAt createdAt updatedAt";

const fail = (res, status, message) => res.status(status).json({ success: false, message });
const escapeRegex = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const DAY = 86400000;

/* ---------- filters shared by the list and the export ---------- */
const buildFilter = (q = {}) => {
  const filter = { isDeleted: false };
  const view = String(q.view || "all");

  if (view === "affiliates") filter.role = "affiliate";
  if (view === "restricted") filter.status = { $in: RESTRICTED };
  if (view === "pending") filter.mustChangePassword = true;

  if (ROLES.includes(q.role) && view !== "affiliates") filter.role = q.role;
  if (STATUSES.includes(q.status)) filter.status = q.status;
  if (["active", "inactive"].includes(q.affiliateStatus)) {
    filter.role = "affiliate";
    filter["affiliate.status"] = q.affiliateStatus;
  }
  if (q.setup === "pending") filter.mustChangePassword = true;
  if (q.setup === "done") filter.mustChangePassword = { $ne: true };

  const joined = Number(q.joined);
  if ([1, 7, 30, 90, 365].includes(joined)) filter.createdAt = { $gte: new Date(Date.now() - joined * DAY) };

  const idle = Number(q.idle); // has not signed in for N days (or never)
  if ([30, 90, 180].includes(idle)) {
    filter.$and = [{ $or: [{ lastLoginAt: null }, { lastLoginAt: { $lt: new Date(Date.now() - idle * DAY) } }] }];
  }

  if (typeof q.search === "string" && q.search.trim()) {
    const rx = { $regex: escapeRegex(q.search.trim().slice(0, 80)), $options: "i" };
    const or = [{ name: rx }, { email: rx }, { mobile: rx }, { "affiliate.code": rx }];
    if (mongoose.isValidObjectId(q.search.trim())) or.push({ _id: q.search.trim() });
    filter.$and = [...(filter.$and || []), { $or: or }];
  }
  return filter;
};

/* ---------- headline numbers (short cache: they are shown on every tab) ---------- */
let statsCache = null; // { at, data }
const STATS_TTL = 20 * 1000;

const signedInUserIds = () =>
  UserSession.distinct("user", { purpose: "login", state: "active", refreshExpiresAt: { $gt: new Date() } });

const getStats = async (fresh = false) => {
  if (!fresh && statsCache && Date.now() - statsCache.at < STATS_TTL) return statsCache.data;
  const now = Date.now();
  const [facet] = await User.aggregate([
    { $match: { isDeleted: false } },
    {
      $facet: {
        total: [{ $count: "n" }],
        byRole: [{ $group: { _id: "$role", n: { $sum: 1 } } }],
        byStatus: [{ $group: { _id: "$status", n: { $sum: 1 } } }],
        affiliates: [{ $match: { role: "affiliate" } }, { $group: { _id: "$affiliate.status", n: { $sum: 1 } } }],
        pending: [{ $match: { mustChangePassword: true } }, { $count: "n" }],
        new7: [{ $match: { createdAt: { $gte: new Date(now - 7 * DAY) } } }, { $count: "n" }],
        new30: [{ $match: { createdAt: { $gte: new Date(now - 30 * DAY) } } }, { $count: "n" }],
        login24h: [{ $match: { lastLoginAt: { $gte: new Date(now - DAY) } } }, { $count: "n" }],
        login7d: [{ $match: { lastLoginAt: { $gte: new Date(now - 7 * DAY) } } }, { $count: "n" }],
        verified: [{ $match: { emailVerifiedAt: { $ne: null } } }, { $count: "n" }],
      },
    },
  ]);
  const signedIn = await signedInUserIds();
  const n = (arr) => arr?.[0]?.n || 0;
  const map = (arr) => Object.fromEntries((arr || []).map((r) => [r._id || "unknown", r.n]));
  const byStatus = map(facet.byStatus);
  const data = {
    total: n(facet.total),
    byRole: map(facet.byRole),
    byStatus,
    restricted: RESTRICTED.reduce((s, k) => s + (byStatus[k] || 0), 0),
    affiliates: map(facet.affiliates),
    pending: n(facet.pending),
    new7: n(facet.new7),
    new30: n(facet.new30),
    login24h: n(facet.login24h),
    login7d: n(facet.login7d),
    verified: n(facet.verified),
    signedIn: signedIn.length,
  };
  statsCache = { at: Date.now(), data };
  return data;
};
export const dropUserStats = () => { statsCache = null; };

/* ---------- per-row extras: how many devices each listed user is signed in on ---------- */
const deviceCounts = async (ids) => {
  if (!ids.length) return new Map();
  const rows = await UserSession.aggregate([
    { $match: { user: { $in: ids }, purpose: "login", state: "active", refreshExpiresAt: { $gt: new Date() } } },
    { $group: { _id: "$user", n: { $sum: 1 }, last: { $max: "$lastActiveAt" } } },
  ]);
  return new Map(rows.map((r) => [String(r._id), r]));
};

const listRow = (u, dev) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  countryCode: u.countryCode || null,
  mobile: u.mobile || null,
  role: u.role,
  status: u.status,
  statusReason: u.statusReason || null,
  pendingSetup: Boolean(u.mustChangePassword),
  emailVerified: Boolean(u.emailVerifiedAt),
  google: Boolean(u.googleLinkedAt),
  lastLoginAt: u.lastLoginAt || null,
  lastActiveAt: dev?.last || null,
  devices: dev?.n || 0,
  createdAt: u.createdAt,
  affiliate: u.role === "affiliate" && u.affiliate
    ? { code: u.affiliate.code, status: u.affiliate.status, commissionType: u.affiliate.commissionType, commissionValue: u.affiliate.commissionValue }
    : null,
});

/* ---------- overview: sign-ups per day (IST) for the last 30 days ---------- */
const signupSeries = async () => {
  const start = new Date(Date.now() - 29 * DAY);
  start.setUTCHours(0, 0, 0, 0);
  const rows = await User.aggregate([
    { $match: { isDeleted: false, createdAt: { $gte: start } } },
    { $group: { _id: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d", timezone: "Asia/Kolkata" } }, n: { $sum: 1 } } },
  ]);
  const m = new Map(rows.map((r) => [r._id, r.n]));
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });
  return Array.from({ length: 30 }, (_, i) => {
    const date = fmt.format(new Date(Date.now() - (29 - i) * DAY));
    return { date, count: m.get(date) || 0 };
  });
};

/* =====================================================
   GET /api/admin/users/console
===================================================== */
export const getUsersConsole = async (req, res) => {
  try {
    const fresh = req.query.fresh === "1";
    const view = String(req.query.view || "all");

    if (view === "overview") {
      const [stats, series, recent, restricted, pending, recentActivity] = await Promise.all([
        getStats(fresh),
        signupSeries(),
        User.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(6).select(LIST_FIELDS).lean(),
        User.find({ isDeleted: false, status: { $in: RESTRICTED } }).sort({ statusChangedAt: -1, updatedAt: -1 }).limit(5).select(LIST_FIELDS).lean(),
        User.find({ isDeleted: false, mustChangePassword: true }).sort({ createdAt: -1 }).limit(5).select(LIST_FIELDS).lean(),
        UserActivity.find({ action: { $in: ["LOGIN_FAILED", "LOGIN_OTP_FAILED", "ACCOUNT_STATUS_CHANGED", "ALL_SESSIONS_REVOKED", "ACCOUNT_DELETED", "PASSWORD_CHANGED"] } })
          .sort({ createdAt: -1 }).limit(8).populate("user", "name email").populate("actor", "name email").lean(),
      ]);
      return res.json({
        success: true,
        stats,
        series,
        recent: recent.map((u) => listRow(u)),
        restricted: restricted.map((u) => listRow(u)),
        pending: pending.map((u) => listRow(u)),
        events: recentActivity.map((a) => ({
          ...shapeActivity(a, a.user?._id, null),
          user: a.user ? { id: String(a.user._id), name: a.user.name, email: a.user.email } : null,
        })),
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(5, parseInt(req.query.limit, 10) || 20));
    const sort = SORTS[req.query.sort] || SORTS.new;
    const filter = buildFilter(req.query);

    const [users, total, stats] = await Promise.all([
      User.find(filter).select(LIST_FIELDS).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(filter),
      getStats(fresh),
    ]);
    const devs = await deviceCounts(users.map((u) => u._id));

    return res.json({
      success: true,
      users: users.map((u) => listRow(u, devs.get(String(u._id)))),
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
      stats,
    });
  } catch (error) {
    console.error("Admin users console:", error);
    return fail(res, 500, "Unable to load users");
  }
};

/* =====================================================
   GET /api/admin/users/:userId/console
===================================================== */
export const getUserConsole = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId)) return fail(res, 400, "Invalid user ID");

    const user = await User.findOne({ _id: userId, isDeleted: false })
      .select(`${LIST_FIELDS} statusChangedAt statusChangedBy passwordChangedAt createdBy updatedBy googleLinkedAt`)
      .populate("createdBy", "name email")
      .populate("statusChangedBy", "name email")
      .populate("updatedBy", "name email")
      .lean();
    if (!user) return fail(res, 404, "User not found");

    const activeFilter = { user: userId, purpose: "login", state: "active", refreshExpiresAt: { $gt: new Date() } };
    const paid = { "customer.email": user.email, "payment.status": "SUCCESS" };

    const [sessions, activities, activityTotal, failedLogins, orders, orderTotals] = await Promise.all([
      UserSession.find(activeFilter).sort({ lastActiveAt: -1 }).limit(25)
        .select("sessionId isTrusted trustedUntil ipAddress createdAt lastActiveAt refreshExpiresAt device location").lean(),
      UserActivity.find({ user: userId }).sort({ createdAt: -1 }).limit(10).populate("actor", "name email").lean(),
      UserActivity.countDocuments({ user: userId }),
      UserActivity.countDocuments({ user: userId, action: { $in: ["LOGIN_FAILED", "LOGIN_OTP_FAILED"] }, createdAt: { $gte: new Date(Date.now() - 30 * DAY) } }),
      Order.find({ "customer.email": user.email }).sort({ createdAt: -1 }).limit(10)
        .select("orderId book.title payment.amount payment.status payment.paidAt orderStatus coupon.code createdAt").lean(),
      Order.aggregate([{ $match: paid }, { $group: { _id: null, n: { $sum: 1 }, amount: { $sum: "$payment.amount" } } }]),
    ]);

    const who = (p) => (p && p._id ? { name: p.name, email: p.email } : null);
    const base = listRow(user);

    return res.json({
      success: true,
      user: {
        ...base,
        statusChangedAt: user.statusChangedAt || null,
        statusChangedBy: who(user.statusChangedBy),
        passwordChangedAt: user.passwordChangedAt || null,
        emailVerifiedAt: user.emailVerifiedAt || null,
        googleLinkedAt: user.googleLinkedAt || null,
        updatedAt: user.updatedAt,
        createdBy: who(user.createdBy),
        updatedBy: who(user.updatedBy),
      },
      devices: sessions.map((s) => shapeSession(s, null)),
      activities: activities.map((a) => shapeActivity(a, userId, null)),
      activityTotal,
      failedLogins30d: failedLogins,
      purchases: {
        paidOrders: orderTotals[0]?.n || 0,
        paidAmount: Math.round((orderTotals[0]?.amount || 0) * 100) / 100,
        recent: orders.map((o) => ({
          orderId: o.orderId,
          title: o.book?.title || "Book",
          amount: o.payment?.amount || 0,
          status: o.payment?.status || o.orderStatus || "UNKNOWN",
          coupon: o.coupon?.code || null,
          at: o.payment?.paidAt || o.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Admin user console:", error);
    return fail(res, 500, "Unable to load this user");
  }
};

/* =====================================================
   POST /api/admin/users/bulk   { ids: [], action, status?, reason? }
   action: status | logout | password-link | delete
   Each id runs through the same handler a single click uses, so the same checks and audit logs apply.
===================================================== */
const runHandler = (handler, req, params, body) =>
  new Promise((resolve) => {
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      set() { return this; },
      cookie() { return this; },
      clearCookie() { return this; },
      json(payload) { resolve({ status: this.statusCode, body: payload }); return this; },
    };
    Promise.resolve(handler({ ...req, params, body, query: {} , get: req.get?.bind(req), headers: req.headers, cookies: req.cookies, ip: req.ip, user: req.user, sessionId: req.sessionId }, res))
      .catch((e) => resolve({ status: 500, body: { success: false, message: e.message } }));
  });

const BULK = {
  status: updateUserStatus,
  logout: adminRevokeAll,
  "password-link": sendPasswordLink,
  delete: deleteUser,
};

export const bulkUsers = async (req, res) => {
  try {
    const { ids, action, status, reason } = req.body || {};
    const handler = BULK[action];
    if (!handler) return fail(res, 400, "Unknown bulk action");
    if (!Array.isArray(ids) || ids.length === 0) return fail(res, 400, "Pick at least one user");
    if (ids.length > 100) return fail(res, 400, "At most 100 users at a time");
    const list = [...new Set(ids.map(String))].filter((id) => mongoose.isValidObjectId(id));
    if (action === "status" && !STATUSES.includes(status)) return fail(res, 400, "Invalid account status");

    const body = action === "status" ? { status, ...(reason ? { reason: String(reason).slice(0, 500) } : {}) } : {};
    const done = [];
    const failed = [];
    // one at a time: these touch sessions, Redis and mail; a burst helps nobody
    for (const id of list) {
      const r = await runHandler(handler, req, { userId: id }, body);
      if (r.body?.success) done.push(id);
      else failed.push({ id, message: r.body?.message || "Failed" });
    }
    dropUserStats();
    return res.json({
      success: true,
      done: done.length,
      failed,
      message: `${done.length} of ${list.length} done${failed.length ? `, ${failed.length} skipped` : ""}`,
    });
  } catch (error) {
    console.error("Admin bulk users:", error);
    return fail(res, 500, "Bulk action failed");
  }
};

/* =====================================================
   GET /api/admin/users/export  → CSV (max 5,000 rows, same filters as the list)
===================================================== */
const csvCell = (v) => {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // keep spreadsheets from running formulas
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const exportUsers = async (req, res) => {
  try {
    const users = await User.find(buildFilter(req.query)).select(LIST_FIELDS).sort(SORTS[req.query.sort] || SORTS.new).limit(5000).lean();
    const head = ["Name", "Email", "Mobile", "Role", "Status", "Setup pending", "Email verified", "Affiliate code", "Affiliate status", "Commission", "Joined", "Last login"];
    const rows = users.map((u) => [
      u.name, u.email, u.mobile ? `${u.countryCode || ""} ${u.mobile}`.trim() : "", u.role, u.status,
      u.mustChangePassword ? "yes" : "no", u.emailVerifiedAt ? "yes" : "no",
      u.affiliate?.code || "", u.affiliate?.status || "",
      u.affiliate ? (u.affiliate.commissionType === "percentage" ? `${u.affiliate.commissionValue}%` : `INR ${u.affiliate.commissionValue}`) : "",
      u.createdAt ? new Date(u.createdAt).toISOString() : "", u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : "",
    ]);
    const csv = "﻿" + [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
    res.set("Content-Type", "text/csv; charset=utf-8");
    res.set("Content-Disposition", `attachment; filename="users-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.set("Cache-Control", "no-store");
    return res.send(csv);
  } catch (error) {
    console.error("Admin export users:", error);
    return fail(res, 500, "Export failed");
  }
};
