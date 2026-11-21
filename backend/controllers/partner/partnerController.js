import mongoose from "mongoose";

import User from "../../models/User.js";
import Book from "../../models/Book.js";
import PartnerAccess from "../../models/partner/PartnerAccess.js";
import PartnerSettings from "../../models/partner/PartnerSettings.js";
import {
  PRODUCTS, PRODUCT_KEYS, FIELDS, SECTIONS, STATUSES, GATEWAYS, DEFAULT_ACCESS, PermissionInputError,
  MAX_HIDDEN, MAX_HIDDEN_ALL, cleanHidden,
  catalog, cleanAccess, cleanSettings, settingsView, accessView, effectivePermissions, enabledProducts, visibleStatuses, scopeOf,
} from "../../services/partner/permissions.js";
import { listRows, exportRows, summarize, totalOf, EXPORT_CAP } from "../../services/partner/ledger.js";

/*
  PARTNERS
    Partner (role "partner"):
      GET  /api/partner/me              who they are + what they may see
      GET  /api/partner/overview        totals, product split, day chart, top codes
      GET  /api/partner/transactions    one page of payments
      GET  /api/partner/export          CSV of the payments they can see
    Admin:
      GET  /api/admin/partners                       settings + every partner
      PUT  /api/admin/partners/settings              the ceiling for all partners
      GET  /api/admin/partners/:userId               one partner's access
      PUT  /api/admin/partners/:userId/access        change it
      GET  /api/admin/partners/:userId/preview/{me,overview,transactions}   see exactly what they see

  Every read goes through effectivePermissions(): settings AND this partner's access.
  Rows only ever carry columns from services/partner/permissions.js FIELDS; customer identity is never read.
*/

const IST_OFFSET_MS = 330 * 60 * 1000;
const DAY = 86400000;
const RANGES = { "7d": 7, "30d": 30, "90d": 90, "365d": 365 };

class PartnerError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    if (err instanceof PermissionInputError) return res.status(400).json({ success: false, message: err.message, code: "BAD_INPUT" });
    if (err instanceof PartnerError) return res.status(err.status).json({ success: false, message: err.message, code: err.code });
    console.error("Partner error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
};

/* ------------------------------------------------------------ permissions */
const loadSettings = async () => (await PartnerSettings.findOne({ key: "global" }).lean()) || null;

const loadPartner = async (userId) => {
  if (!mongoose.isValidObjectId(userId)) throw new PartnerError(404, "Partner not found.", "NOT_FOUND");
  const user = await User.findOne({ _id: userId, isDeleted: false }).select("name role status createdAt lastLoginAt").lean();
  if (!user || user.role !== "partner") throw new PartnerError(404, "Partner not found.", "NOT_FOUND");
  return user;
};

const resolve = async (userId) => {
  const [user, settings, access] = await Promise.all([loadPartner(userId), loadSettings(), PartnerAccess.findOne({ user: userId }).lean()]);
  return { user, settings, access, perms: effectivePermissions(settings, access) };
};

/* req.partner = { user, perms }: the partner themself, or (preview) the partner an admin is looking at */
const fromSelf = async (req) => resolve(req.user.id);
const fromPreview = async (req) => resolve(req.params.userId);

const requireActive = (perms) => {
  if (perms.expired) throw new PartnerError(403, "Your partner access has ended. Contact the Target Trek team to extend it.", "PARTNER_EXPIRED");
  if (!perms.portalEnabled) throw new PartnerError(403, "The partner dashboard is switched off for now.", "PARTNER_PORTAL_OFF");
  if (!perms.accessEnabled) throw new PartnerError(403, "Your partner access is paused. Contact the Target Trek team.", "PARTNER_PAUSED");
  if (!enabledProducts(perms).length) throw new PartnerError(403, "No products are shared with you yet.", "PARTNER_NO_PRODUCTS");
};
const requireSection = (perms, key) => {
  if (!perms.sections[key]) throw new PartnerError(403, "This part of the dashboard isn't shared with you.", "PARTNER_SECTION_HIDDEN");
};

/* ------------------------------------------------------------ dates (IST) */
const istDayStart = (y, m, d) => new Date(Date.UTC(y, m, d) - IST_OFFSET_MS);
const istToday = () => {
  const n = new Date(Date.now() + IST_OFFSET_MS);
  return istDayStart(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
};
const parseDay = (v) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || ""));
  if (!m) return null;
  const d = istDayStart(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
};
const dayKey = (date) => new Date(date.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

/*
  The dates a partner may ever see, as [floor, ceil) instants, or nulls:
    window.from / window.to   fixed dates set by an admin (IST days, both inclusive)
    historyDays               rolling: the last N days, today included
    delayDays                 the newest N days are hidden (today included)
*/
const visibleBounds = (perms) => {
  const today = istToday();
  let floor = perms.window.from ? parseDay(perms.window.from) : null;
  let ceil = perms.window.to ? new Date(parseDay(perms.window.to).getTime() + DAY) : null;
  if (perms.historyDays) {
    const h = new Date(today.getTime() - (perms.historyDays - 1) * DAY);
    if (!floor || h > floor) floor = h;
  }
  if (perms.delayDays) {
    const d = new Date(today.getTime() - (perms.delayDays - 1) * DAY);
    if (!ceil || d < ceil) ceil = d;
  }
  return { floor, ceil, empty: Boolean(floor && ceil && floor >= ceil) };
};

/* The range the viewer picked, cut to what they may see. outside = nothing can match (answer empty, not an error). */
const rangeOf = (q, perms) => {
  const today = istToday();
  let from = null;
  let to = null;
  let key = RANGES[q.range] ? q.range : q.range === "all" ? "all" : q.range === "custom" ? "custom" : "30d";

  if (key === "custom") {
    from = parseDay(q.from);
    const end = parseDay(q.to);
    to = end ? new Date(end.getTime() + DAY) : null;
    if (!from && !to) key = "30d";
    if (from && to && from >= to) throw new PartnerError(400, "The start date must be before the end date.", "BAD_RANGE");
  }
  if (RANGES[key]) from = new Date(today.getTime() - (RANGES[key] - 1) * DAY);

  const { floor, ceil, empty } = visibleBounds(perms);
  let clamped = false;
  if (floor && (!from || from < floor)) { from = floor; clamped = true; }
  if (ceil && (!to || to > ceil)) { to = ceil; clamped = true; }
  const outside = empty || Boolean(from && to && from >= to);
  return { from, to, key, clamped, outside, floor, ceil };
};

const pickProduct = (q, perms) => (PRODUCT_KEYS.includes(q.product) && perms.products[q.product] ? q.product : null);

/* ------------------------------------------------------------ shaping: only what this partner may see */
const mask = (v) => (v && v.length > 4 ? `••••${v.slice(-4)}` : v ? "••••" : null);

const shapeRow = (r, perms) => {
  const f = perms.fields;
  const out = { product: r.product, at: r.at };
  if (f.item) out.item = r.item || null;
  if (f.amount) out.amount = r.amount || 0;
  if (f.listPrice) { out.discount = r.discount || 0; out.listPrice = (r.amount || 0) + (r.discount || 0); }
  if (f.transactionId) out.txnId = perms.maskTransactionIds ? mask(r.txnId) : r.txnId || null;
  if (f.orderId) out.ref = perms.maskTransactionIds ? mask(r.ref) : r.ref || null;
  if (f.gateway) out.gateway = r.gateway || null;
  if (f.coupon) out.coupon = r.coupon || null;
  if (f.referralCode) out.referralCode = r.referralCode || null;
  if (f.referralAmount) out.referralAmount = r.referralAmount || 0;
  if (f.refund) out.refunded = r.refunded || 0;
  if (f.status) out.status = r.status;
  return out;
};

/* Search only looks inside columns the partner can already see (and never inside masked ones). */
const searchableFields = (perms) => {
  const f = perms.fields;
  return [
    f.transactionId && !perms.maskTransactionIds && "txnId",
    f.orderId && !perms.maskTransactionIds && "ref",
    f.coupon && "coupon",
    f.referralCode && "referralCode",
    f.item && "item",
  ].filter(Boolean);
};
const cleanSearch = (v) => (typeof v === "string" ? v.trim().slice(0, 60) : "");
const cleanCode = (v, perms) => {
  if (!perms.fields.coupon && !perms.fields.referralCode) return null;
  const c = typeof v === "string" ? v.trim().toUpperCase() : "";
  return /^[A-Z0-9_-]{2,40}$/.test(c) ? c : null;
};

const fillSeries = (series, from, to) => {
  const map = new Map(series.map((p) => [p._id, p]));
  const start = from || (series[0] ? parseDay(series[0]._id) : null);
  if (!start) return [];
  const end = to ? new Date(to.getTime() - DAY) : istToday();
  const days = Math.round((end - start) / DAY) + 1;
  const out = [];
  if (days > 0 && days <= 400) {
    for (let i = 0; i < days; i++) {
      const k = dayKey(new Date(start.getTime() + i * DAY));
      const p = map.get(k);
      out.push({ date: k, count: p?.count || 0, amount: p?.amount || 0, refunded: p?.refunded || 0 });
    }
    return out;
  }
  // long ranges: one point per month
  const months = new Map();
  for (const p of series) {
    const k = `${p._id.slice(0, 7)}-01`;
    const m = months.get(k) || { date: k, count: 0, amount: 0, refunded: 0, month: true };
    m.count += p.count; m.amount += p.amount; m.refunded += p.refunded;
    months.set(k, m);
  }
  return [...months.values()];
};

const dayOut = (d) => (d ? dayKey(d) : "");
const permsForClient = (perms) => {
  const { floor, ceil, empty } = visibleBounds(perms);
  return {
  active: perms.active && enabledProducts(perms).length > 0,
  portalEnabled: perms.portalEnabled,
  accessEnabled: perms.accessEnabled,
  expired: perms.expired,
  expiresAt: perms.expiresAt,
  // first and last visible day (inclusive), for the date pickers and the "you can see…" line
  visible: { from: dayOut(floor), to: ceil ? dayOut(new Date(ceil.getTime() - DAY)) : "", empty },
  window: perms.window,
  delayDays: perms.delayDays,
  limits: {
    minAmount: perms.minAmount, maxAmount: perms.maxAmount,
    codes: perms.codes || [], books: perms.books ? perms.books.length : 0,
    gateways: perms.gateways ? GATEWAYS.filter((g) => perms.gateways.includes(g.key)).map((g) => g.label) : [],
  },
  products: PRODUCTS.filter((p) => perms.products[p.key]),
  sections: perms.sections,
  fields: perms.fields,
  historyDays: perms.historyDays,
  maskTransactionIds: perms.maskTransactionIds,
  includeUnpaid: visibleStatuses(perms).some((x) => !["paid", "partial_refund", "refunded"].includes(x)),
  statuses: perms.fields.status ? visibleStatuses(perms) : [],
  searchable: searchableFields(perms),
  notice: perms.notice,
  };
};

/* ------------------------------------------------------------ handlers shared by partner + admin preview */
const meHandler = (who) => handle(async (req, res) => {
  const { user, perms } = await who(req);
  if (who === fromSelf) PartnerAccess.updateOne({ user: user._id }, { $set: { lastSeenAt: new Date() } }).catch(() => {});
  res.json({ success: true, data: { partner: { name: user.name, since: user.createdAt }, permissions: permsForClient(perms) } });
});

const overviewHandler = (who) => handle(async (req, res) => {
  const { perms } = await who(req);
  requireActive(perms);
  if (!perms.sections.overview && !perms.sections.revenue && !perms.sections.codes) requireSection(perms, "overview");

  const { from, to, key, clamped, outside, floor } = rangeOf(req.query, perms);
  const product = pickProduct(req.query, perms);
  const f = perms.fields;
  const scope = scopeOf(perms);

  // the same length of time just before, for "vs previous" (only when all of it is visible)
  const span = from ? (to || new Date()).getTime() - from.getTime() : 0;
  const prevFrom = from && key !== "all" && !clamped ? new Date(from.getTime() - span) : null;
  const prevHidden = prevFrom && floor && prevFrom < floor;

  const [sum, prev] = outside ? [null, null] : await Promise.all([
    summarize({ perms, scope, from, to, product }),
    prevFrom && !prevHidden && perms.sections.overview ? totalOf({ perms, scope, from: prevFrom, to: from, product }) : null,
  ]);

  const t = sum?.totals?.[0] || { count: 0, amount: 0, refunded: 0, discount: 0, referralAmount: 0, couponUses: 0, referralUses: 0, refunds: 0 };
  const data = { range: { key, from, to, clamped, outside, historyDays: perms.historyDays }, product };

  if (perms.sections.overview) {
    data.totals = { count: t.count };
    if (f.amount) data.totals.amount = t.amount;
    if (f.amount && f.refund) { data.totals.refunded = t.refunded; data.totals.net = t.amount - t.refunded; data.totals.refunds = t.refunds; }
    if (f.listPrice) data.totals.discount = t.discount;
    if (f.referralAmount) data.totals.referralAmount = t.referralAmount;
    if (f.coupon) data.totals.couponUses = t.couponUses;
    if (f.referralCode) data.totals.referralUses = t.referralUses;
    if (prev) data.previous = { count: prev.count, ...(f.amount ? { amount: prev.amount } : {}) };

    data.byProduct = PRODUCTS.filter((p) => perms.products[p.key] && (!product || p.key === product)).map((p) => {
      const g = sum?.byProduct?.find((x) => x._id === p.key) || { count: 0, amount: 0, refunded: 0 };
      return { product: p.key, label: p.label, count: g.count, ...(f.amount ? { amount: g.amount } : {}), ...(f.amount && f.refund ? { refunded: g.refunded } : {}) };
    });
    if (f.gateway) data.gateways = (sum?.gateways || []).map((g) => ({ gateway: g._id, count: g.count, ...(f.amount ? { amount: g.amount } : {}) }));
  }

  if (perms.sections.revenue) {
    data.series = (outside ? [] : fillSeries(sum?.series || [], from, to)).map((p) => ({ date: p.date, month: p.month || undefined, count: p.count, ...(f.amount ? { amount: p.amount } : {}), ...(f.amount && f.refund ? { refunded: p.refunded } : {}) }));
  }

  if (perms.sections.codes) {
    data.codes = {};
    if (f.coupon) data.codes.coupons = (sum?.coupons || []).map((c) => ({ code: c._id, count: c.count, ...(f.amount ? { amount: c.amount } : {}), ...(f.listPrice ? { discount: c.discount } : {}) }));
    if (f.referralCode) data.codes.referrals = (sum?.referrals || []).map((c) => ({ code: c._id, count: c.count, ...(f.amount ? { amount: c.amount } : {}), ...(f.referralAmount ? { referralAmount: c.referralAmount } : {}) }));
  }

  res.json({ success: true, data });
});

const listQuery = (req, perms) => {
  const { from, to, key, clamped, outside } = rangeOf(req.query, perms);
  let status = null;
  if (req.query.status && req.query.status !== "all") {
    const allowed = perms.fields.status && visibleStatuses(perms).includes(req.query.status);
    if (!allowed) throw new PartnerError(400, "That status filter isn't available.", "BAD_STATUS");
    status = req.query.status;
  }
  return {
    perms, scope: scopeOf(perms), from, to, key, clamped, outside,
    product: pickProduct(req.query, perms),
    status,
    search: cleanSearch(req.query.q),
    code: cleanCode(req.query.code, perms),
    searchable: searchableFields(perms),
  };
};

const transactionsHandler = (who) => handle(async (req, res) => {
  const { perms } = await who(req);
  requireActive(perms);
  requireSection(perms, "transactions");
  const q = listQuery(req, perms);
  const limit = [10, 25, 50].includes(Number(req.query.limit)) ? Number(req.query.limit) : 25;
  const page = Math.min(400, Math.max(1, Number.parseInt(req.query.page, 10) || 1));
  const { rows, total } = q.outside ? { rows: [], total: 0 } : await listRows({ ...q, page, limit });
  // admin preview only: the real id of each row, so the admin can hide it from this partner
  const forAdmin = who === fromPreview;
  res.json({
    success: true,
    data: {
      rows: rows.map((r) => ({ ...shapeRow(r, perms), ...(forAdmin ? { hideId: r.txnId || r.ref || null } : {}) })),
      ...(forAdmin ? { hiddenCount: perms.hiddenTxns.length } : {}),
      page, limit, total, pages: Math.max(1, Math.ceil(total / limit)),
      range: { key: q.key, from: q.from, to: q.to, clamped: q.clamped, outside: q.outside },
    },
  });
});

/* CSV: same rows, same columns. Cells that start like a formula are prefixed so spreadsheets don't run them. */
const csvCell = (v) => {
  if (v === null || v === undefined) return "";
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const rupees = (p) => (Number(p || 0) / 100).toFixed(2);
const PRODUCT_LABEL = Object.fromEntries(PRODUCTS.map((p) => [p.key, p.label]));

const exportHandler = (who) => handle(async (req, res) => {
  const { perms } = await who(req);
  requireActive(perms);
  requireSection(perms, "transactions");
  requireSection(perms, "export");
  const q = listQuery(req, perms);
  const rows = q.outside ? [] : (await exportRows(q)).map((r) => shapeRow(r, perms));
  const f = perms.fields;
  const cols = [
    ["Date (IST)", (r) => new Date(new Date(r.at).getTime() + IST_OFFSET_MS).toISOString().replace("T", " ").slice(0, 16)],
    ["Product", (r) => PRODUCT_LABEL[r.product] || r.product],
    f.item && ["Item", (r) => r.item],
    f.status && ["Status", (r) => r.status],
    f.listPrice && ["List price (INR)", (r) => rupees(r.listPrice)],
    f.listPrice && ["Discount (INR)", (r) => rupees(r.discount)],
    f.amount && ["Amount paid (INR)", (r) => rupees(r.amount)],
    f.refund && ["Refunded (INR)", (r) => rupees(r.refunded)],
    f.coupon && ["Coupon", (r) => r.coupon],
    f.referralCode && ["Referral code", (r) => r.referralCode],
    f.referralAmount && ["Referral amount (INR)", (r) => rupees(r.referralAmount)],
    f.gateway && ["Gateway", (r) => r.gateway],
    f.transactionId && ["Transaction ID", (r) => r.txnId],
    f.orderId && ["Order ID", (r) => r.ref],
  ].filter(Boolean);
  const lines = [cols.map((c) => csvCell(c[0])).join(","), ...rows.map((r) => cols.map((c) => csvCell(c[1](r))).join(","))];
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="partner-transactions-${dayKey(new Date())}.csv"`);
  res.setHeader("Cache-Control", "no-store");
  if (rows.length >= EXPORT_CAP) res.setHeader("X-Export-Truncated", String(EXPORT_CAP));
  res.send(`﻿${lines.join("\r\n")}`);
});

/* ------------------------------------------------------------ partner */
export const partnerMe = meHandler(fromSelf);
export const partnerOverview = overviewHandler(fromSelf);
export const partnerTransactions = transactionsHandler(fromSelf);
export const partnerExport = exportHandler(fromSelf);

/* ------------------------------------------------------------ admin preview (exactly what that partner sees) */
export const previewMe = meHandler(fromPreview);
export const previewOverview = overviewHandler(fromPreview);
export const previewTransactions = transactionsHandler(fromPreview);

/* ------------------------------------------------------------ admin: settings + per-partner access */
const partnerCard = (u, access, settings) => {
  const a = accessView(access);
  const eff = effectivePermissions(settings, access);
  return {
    id: String(u._id), name: u.name, email: u.email, status: u.status, lastLoginAt: u.lastLoginAt, createdAt: u.createdAt,
    pendingSetup: u.mustChangePassword === true,
    configured: Boolean(access), lastSeenAt: access?.lastSeenAt || null, updatedAt: access?.updatedAt || null,
    access: a,
    effective: {
      active: eff.active && enabledProducts(eff).length > 0 && !visibleBounds(eff).empty,
      products: enabledProducts(eff),
      sections: SECTIONS.filter((s) => eff.sections[s.key]).map((s) => s.key),
      fields: FIELDS.filter((x) => eff.fields[x.key]).map((x) => x.key),
      historyDays: eff.historyDays,
      statuses: STATUSES.filter((x) => eff.statuses[x.key]).map((x) => x.key),
      gateways: eff.gateways,
      window: eff.window,
      delayDays: eff.delayDays,
      visible: (() => { const b = visibleBounds(eff); return { from: dayOut(b.floor), to: b.ceil ? dayOut(new Date(b.ceil.getTime() - DAY)) : "", empty: b.empty }; })(),
      expired: eff.expired,
      minAmount: eff.minAmount, maxAmount: eff.maxAmount,
      codes: eff.codes || [], books: eff.books || [],
      hiddenOwn: eff.hiddenOwn, hiddenAll: eff.hiddenAll,
    },
  };
};

export const adminListPartners = handle(async (req, res) => {
  const [settings, books, users] = await Promise.all([
    loadSettings(),
    Book.find({}).select("title").sort({ title: 1 }).limit(1000).lean(),
    User.find({ role: "partner", isDeleted: false }).select("name email status lastLoginAt createdAt mustChangePassword").sort({ createdAt: -1 }).limit(500).lean(),
  ]);
  const access = await PartnerAccess.find({ user: { $in: users.map((u) => u._id) } }).lean();
  const byUser = new Map(access.map((a) => [String(a.user), a]));
  res.json({
    success: true,
    data: {
      catalog: { ...catalog(), books: books.map((b) => ({ id: String(b._id), title: b.title })) },
      settings: settingsView(settings),
      settingsUpdatedAt: settings?.updatedAt || null,
      defaults: DEFAULT_ACCESS,
      partners: users.map((u) => partnerCard(u, byUser.get(String(u._id)), settings)),
    },
  });
});

export const adminUpdateSettings = handle(async (req, res) => {
  const current = settingsView(await loadSettings());
  const next = cleanSettings(req.body || {}, current);
  const doc = await PartnerSettings.findOneAndUpdate(
    { key: "global" },
    { $set: { ...next, updatedBy: req.user.id }, $unset: { includeUnpaid: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true, lean: true }
  );
  res.json({ success: true, message: "Partner settings saved.", data: { settings: settingsView(doc), settingsUpdatedAt: doc.updatedAt } });
});

export const adminGetPartner = handle(async (req, res) => {
  const user = await User.findOne({ _id: req.params.userId, isDeleted: false, role: "partner" }).select("name email status lastLoginAt createdAt mustChangePassword").lean();
  if (!user) throw new PartnerError(404, "Partner not found.", "NOT_FOUND");
  const [settings, access] = await Promise.all([loadSettings(), PartnerAccess.findOne({ user: user._id }).lean()]);
  res.json({ success: true, data: partnerCard(user, access, settings) });
});

export const adminUpdateAccess = handle(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.userId)) throw new PartnerError(404, "Partner not found.", "NOT_FOUND");
  const user = await User.findOne({ _id: req.params.userId, isDeleted: false, role: "partner" }).select("name email status lastLoginAt createdAt mustChangePassword").lean();
  if (!user) throw new PartnerError(404, "Partner not found. Give the account the Partner role first.", "NOT_FOUND");
  const existing = await PartnerAccess.findOne({ user: user._id }).lean();
  const next = req.body?.reset === true ? { ...DEFAULT_ACCESS } : cleanAccess(req.body || {}, accessView(existing));
  const doc = await PartnerAccess.findOneAndUpdate(
    { user: user._id },
    { $set: { ...next, updatedBy: req.user.id }, $unset: { includeUnpaid: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true, lean: true }
  );
  const settings = await loadSettings();
  res.json({ success: true, message: `Access saved for ${user.name}.`, data: partnerCard(user, doc, settings) });
});

/* PATCH /api/admin/partners/:userId/hidden  { add?: [ids], remove?: [ids] }   (userId "all" = the list in Settings)
   Quick hide / unhide from the preview, without sending the whole access form. */
export const adminHideTransactions = handle(async (req, res) => {
  const all = req.params.userId === "all";
  const add = cleanHidden(req.body?.add ?? [], [], all ? MAX_HIDDEN_ALL : MAX_HIDDEN);
  const remove = cleanHidden(req.body?.remove ?? [], [], all ? MAX_HIDDEN_ALL : MAX_HIDDEN);
  if (!add.length && !remove.length) throw new PartnerError(400, "Give at least one transaction ID.", "BAD_INPUT");

  if (all) {
    const current = settingsView(await loadSettings());
    const next = [...new Set([...current.hiddenTxns.filter((x) => !remove.includes(x)), ...add])];
    if (next.length > MAX_HIDDEN_ALL) throw new PartnerError(400, `Up to ${MAX_HIDDEN_ALL} hidden transactions.`, "BAD_INPUT");
    const doc = await PartnerSettings.findOneAndUpdate({ key: "global" }, { $set: { hiddenTxns: next, updatedBy: req.user.id } }, { upsert: true, new: true, setDefaultsOnInsert: true, lean: true });
    return res.json({ success: true, message: add.length ? "Hidden from every partner." : "Shown again.", data: { settings: settingsView(doc) } });
  }

  if (!mongoose.isValidObjectId(req.params.userId)) throw new PartnerError(404, "Partner not found.", "NOT_FOUND");
  const user = await User.findOne({ _id: req.params.userId, isDeleted: false, role: "partner" }).select("name email status lastLoginAt createdAt mustChangePassword").lean();
  if (!user) throw new PartnerError(404, "Partner not found.", "NOT_FOUND");
  const existing = accessView(await PartnerAccess.findOne({ user: user._id }).lean());
  const next = [...new Set([...existing.hiddenTxns.filter((x) => !remove.includes(x)), ...add])];
  if (next.length > MAX_HIDDEN) throw new PartnerError(400, `Up to ${MAX_HIDDEN} hidden transactions per partner.`, "BAD_INPUT");
  const doc = await PartnerAccess.findOneAndUpdate(
    { user: user._id },
    { $set: { ...existing, hiddenTxns: next, updatedBy: req.user.id } },
    { upsert: true, new: true, setDefaultsOnInsert: true, lean: true }
  );
  res.json({ success: true, message: add.length ? `Hidden from ${user.name}.` : "Shown again.", data: partnerCard(user, doc, await loadSettings()) });
});
