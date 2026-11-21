import mongoose from "mongoose";

/*
  PARTNER PERMISSIONS: the one list of everything a partner can ever be shown.

  Two layers, both set by an admin:
    1. PartnerSettings (one document): the CEILING for every partner. Turning something off here hides it from all partners.
    2. PartnerAccess (one per partner): what THIS partner gets, inside that ceiling.
  What a partner actually sees = layer 1 AND layer 2. Anything not listed in this file can't be shown, whatever the settings say.

  Transaction rules (which payments are visible at all), applied to every list, total, chart and CSV:
    window       only payments between two dates (IST days, both inclusive). Both layers: the overlap wins.
    delayDays    hide the newest N days (e.g. until payments settle). Both layers: the longer delay wins.
    historyDays  a rolling "last N days" limit. Both layers: the shorter wins.
    statuses     which payment states (paid, part refunded, refunded, pending, failed). Both layers must allow.
    gateways     which payment gateways. Empty = all. Both layers: the overlap wins.
    min/maxAmount, codes, books   per partner only.
    expiresAt    per partner: access ends after this day.
    hiddenTxns   transaction / order IDs that are never shown (per partner, plus a list in Settings for everyone).
                 A hidden payment is gone everywhere: lists, totals, charts, codes and CSV.

  Never shown, and deliberately not in any list below, so no setting can turn them on:
    customer name, email, phone, user id, IP address, device, address, notes, messages, uploaded files, gateway raw payloads.
*/

export const PRODUCTS = [
  { key: "books", label: "Books" },
  { key: "prepBuddy", label: "Prep Buddy" },
  { key: "memories", label: "Memories" },
  { key: "resume", label: "Resume Lab" },
  { key: "referral", label: "Referrals" },
];

export const SECTIONS = [
  { key: "overview", label: "Overview", hint: "Headline numbers and the product split." },
  { key: "revenue", label: "Revenue chart", hint: "Day by day revenue chart." },
  { key: "transactions", label: "Transactions", hint: "The list of individual payments." },
  { key: "codes", label: "Coupons & referral codes", hint: "Which codes were used and how much they earned." },
  { key: "export", label: "CSV export", hint: "Download the transactions they can see." },
];

/* Columns of a transaction row (and the totals that come from them). */
export const FIELDS = [
  { key: "amount", label: "Amount paid", hint: "Price the customer paid. Off = revenue totals are hidden too." },
  { key: "listPrice", label: "List price & discount", hint: "Price before discount and the discount given." },
  { key: "transactionId", label: "Transaction ID", hint: "The gateway's payment id." },
  { key: "orderId", label: "Order ID", hint: "Our order / gateway order reference." },
  { key: "gateway", label: "Payment gateway", hint: "Razorpay, Cashfree, PayU…" },
  { key: "item", label: "Item bought", hint: "Book title, plan or package name." },
  { key: "coupon", label: "Coupon used", hint: "Coupon code applied at checkout." },
  { key: "referralCode", label: "Referral / affiliate code", hint: "Code the sale came through." },
  { key: "referralAmount", label: "Referral amount", hint: "Commission owed on that code." },
  { key: "refund", label: "Refunds", hint: "Refunded amount and refund status." },
  { key: "status", label: "Payment status", hint: "Paid, refunded, failed…" },
];

/* Payment states a row can be in. "Unpaid" ones are never counted in totals. */
export const STATUSES = [
  { key: "paid", label: "Paid", hint: "Completed payments." },
  { key: "partial_refund", label: "Part refunded", hint: "Paid, then partly refunded." },
  { key: "refunded", label: "Refunded", hint: "Paid, then fully refunded." },
  { key: "pending", label: "Pending", hint: "Checkout started, not paid yet. Never counted in totals." },
  { key: "failed", label: "Failed / expired", hint: "Payment failed or was abandoned. Never counted in totals." },
];
export const PAID_STATUSES = ["paid", "partial_refund", "refunded"];

/* "other" = any gateway not in this list (older orders, manual payments). */
export const GATEWAYS = [
  { key: "razorpay", label: "Razorpay" },
  { key: "cashfree", label: "Cashfree" },
  { key: "payu", label: "PayU" },
  { key: "other", label: "Other" },
];
export const KNOWN_GATEWAYS = ["razorpay", "cashfree", "payu"];

export const PRODUCT_KEYS = PRODUCTS.map((p) => p.key);
export const SECTION_KEYS = SECTIONS.map((s) => s.key);
export const FIELD_KEYS = FIELDS.map((f) => f.key);
export const STATUS_KEYS = STATUSES.map((s) => s.key);
export const GATEWAY_KEYS = GATEWAYS.map((g) => g.key);

export const HISTORY_CHOICES = [0, 7, 30, 90, 180, 365]; // 0 = no limit
export const DELAY_CHOICES = [0, 1, 2, 3, 7, 14, 30]; // 0 = show up to now
export const MAX_CODES = 50;
export const MAX_BOOKS = 100;
export const MAX_HIDDEN = 500; // per partner
export const MAX_HIDDEN_ALL = 2000; // in Settings, for every partner

const pickBools = (keys, src, fallback) => {
  const out = {};
  for (const k of keys) out[k] = typeof src?.[k] === "boolean" ? src[k] : fallback[k];
  return out;
};
const allOf = (keys, v) => Object.fromEntries(keys.map((k) => [k, v]));
const PAID_ONLY = { paid: true, partial_refund: true, refunded: true, pending: false, failed: false };

/* ------------------------------------------------------------ defaults */
/* The ceiling starts open (so an admin only switches OFF what they never want any partner to see). */
export const DEFAULT_SETTINGS = {
  enabled: true,
  products: allOf(PRODUCT_KEYS, true),
  sections: allOf(SECTION_KEYS, true),
  fields: allOf(FIELD_KEYS, true),
  statuses: { ...PAID_ONLY },
  gateways: [],
  window: { from: "", to: "" },
  delayDays: 0,
  maxHistoryDays: 0,
  maskTransactionIds: false,
  hiddenTxns: [],
  notice: "",
};

/* A new partner starts closed except the basics: an admin opens what each one needs. */
export const DEFAULT_ACCESS = {
  enabled: true,
  products: allOf(PRODUCT_KEYS, false),
  sections: { overview: true, revenue: true, transactions: true, codes: false, export: false },
  fields: { ...allOf(FIELD_KEYS, false), amount: true, item: true, status: true },
  statuses: { ...PAID_ONLY },
  gateways: [],
  window: { from: "", to: "" },
  delayDays: 0,
  historyDays: 0,
  minAmount: null,
  maxAmount: null,
  codes: [],
  books: [],
  expiresAt: "",
  hiddenTxns: [],
  maskTransactionIds: false,
  note: "",
};

/* ------------------------------------------------------------ clean input from an admin */
const DAY_RX = /^\d{4}-\d{2}-\d{2}$/;
const cleanDay = (v) => {
  if (typeof v !== "string" || !DAY_RX.test(v)) return "";
  const d = new Date(`${v}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v ? "" : v;
};
const pickChoice = (choices, v, fallback) => {
  const n = Number(v);
  return choices.includes(n) ? n : fallback;
};
const cleanText = (v, max) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "");

export class PermissionInputError extends Error {}

const cleanWindow = (input, current) => {
  if (input === undefined) return current;
  if (input === null) return { from: "", to: "" };
  const from = input.from === undefined ? current.from : cleanDay(input.from);
  const to = input.to === undefined ? current.to : cleanDay(input.to);
  if (from && to && from > to) throw new PermissionInputError("The visible “from” date must be on or before the “to” date.");
  return { from, to };
};
const cleanGateways = (input, current) => {
  if (input === undefined) return current;
  if (!Array.isArray(input)) return current;
  const list = [...new Set(input.map((g) => String(g).toLowerCase()).filter((g) => GATEWAY_KEYS.includes(g)))];
  return list.length === GATEWAY_KEYS.length ? [] : list; // every gateway ticked = no restriction
};
/* rupees in, paise stored; null = no limit */
const cleanAmount = (v, current) => {
  if (v === undefined) return current;
  if (v === null || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 10_000_000) throw new PermissionInputError("Amounts must be between ₹0 and ₹1,00,00,000.");
  return Math.round(n * 100);
};
const cleanCodes = (input, current) => {
  if (input === undefined) return current;
  const raw = Array.isArray(input) ? input : typeof input === "string" ? input.split(/[\s,]+/) : [];
  const list = [...new Set(raw.map((c) => String(c).trim().toUpperCase()).filter((c) => /^[A-Z0-9_-]{2,40}$/.test(c)))];
  if (list.length > MAX_CODES) throw new PermissionInputError(`Up to ${MAX_CODES} codes.`);
  return list;
};
const cleanBooks = (input, current) => {
  if (input === undefined) return current;
  if (!Array.isArray(input)) return current;
  const list = [...new Set(input.map(String).filter((id) => mongoose.isValidObjectId(id)))];
  if (list.length > MAX_BOOKS) throw new PermissionInputError(`Up to ${MAX_BOOKS} books.`);
  return list;
};
/* gateway payment ids and our order ids: letters, digits and a few separators */
const TXN_RX = /^[A-Za-z0-9_\-.:|/]{3,120}$/;
const cleanHidden = (input, current, max) => {
  if (input === undefined) return current;
  const raw = Array.isArray(input) ? input : typeof input === "string" ? input.split(/[\s,;]+/) : [];
  const list = [...new Set(raw.map((v) => String(v).trim()).filter(Boolean))];
  const bad = list.find((v) => !TXN_RX.test(v));
  if (bad) throw new PermissionInputError(`“${bad.slice(0, 40)}” doesn't look like a transaction or order ID.`);
  if (list.length > max) throw new PermissionInputError(`Up to ${max} hidden transactions.`);
  return list;
};

/* older documents had a single includeUnpaid flag instead of statuses */
const legacyStatuses = (src, fallback) => {
  if (src?.statuses && typeof src.statuses === "object" && Object.keys(src.statuses).length) return pickBools(STATUS_KEYS, src.statuses, fallback);
  if (src?.includeUnpaid === true) return { ...PAID_ONLY, pending: true, failed: true };
  return fallback;
};

export const cleanSettings = (input = {}, current = DEFAULT_SETTINGS) => ({
  enabled: typeof input.enabled === "boolean" ? input.enabled : current.enabled,
  products: pickBools(PRODUCT_KEYS, input.products, current.products),
  sections: pickBools(SECTION_KEYS, input.sections, current.sections),
  fields: pickBools(FIELD_KEYS, input.fields, current.fields),
  statuses: legacyStatuses(input, current.statuses),
  gateways: cleanGateways(input.gateways, current.gateways),
  window: cleanWindow(input.window, current.window),
  delayDays: pickChoice(DELAY_CHOICES, input.delayDays, current.delayDays),
  maxHistoryDays: pickChoice(HISTORY_CHOICES, input.maxHistoryDays, current.maxHistoryDays),
  maskTransactionIds: typeof input.maskTransactionIds === "boolean" ? input.maskTransactionIds : current.maskTransactionIds,
  hiddenTxns: cleanHidden(input.hiddenTxns, current.hiddenTxns, MAX_HIDDEN_ALL),
  notice: input.notice === undefined ? current.notice : cleanText(input.notice, 500),
});

/* Admin input for one partner. minAmount / maxAmount arrive in RUPEES (stored as paise). */
export const cleanAccess = (input = {}, current = DEFAULT_ACCESS) => {
  const out = {
    enabled: typeof input.enabled === "boolean" ? input.enabled : current.enabled,
    products: pickBools(PRODUCT_KEYS, input.products, current.products),
    sections: pickBools(SECTION_KEYS, input.sections, current.sections),
    fields: pickBools(FIELD_KEYS, input.fields, current.fields),
    statuses: legacyStatuses(input, current.statuses),
    gateways: cleanGateways(input.gateways, current.gateways),
    window: cleanWindow(input.window, current.window),
    delayDays: pickChoice(DELAY_CHOICES, input.delayDays, current.delayDays),
    historyDays: pickChoice(HISTORY_CHOICES, input.historyDays, current.historyDays),
    minAmount: cleanAmount(input.minAmount, current.minAmount),
    maxAmount: cleanAmount(input.maxAmount, current.maxAmount),
    codes: cleanCodes(input.codes, current.codes),
    books: cleanBooks(input.books, current.books),
    hiddenTxns: cleanHidden(input.hiddenTxns, current.hiddenTxns, MAX_HIDDEN),
    expiresAt: input.expiresAt === undefined ? current.expiresAt : input.expiresAt === null ? "" : cleanDay(input.expiresAt),
    maskTransactionIds: typeof input.maskTransactionIds === "boolean" ? input.maskTransactionIds : current.maskTransactionIds,
    note: input.note === undefined ? current.note : cleanText(input.note, 300),
  };
  if (out.minAmount !== null && out.maxAmount !== null && out.minAmount > out.maxAmount) throw new PermissionInputError("The minimum amount can't be more than the maximum.");
  return out;
};

/* Stored documents (paise amounts, possibly older shapes) → full shape. Never throws. */
const storedAccess = (doc) => {
  const d = doc || {};
  const safe = (fn, fallback) => { try { return fn(); } catch { return fallback; } };
  return {
    ...cleanAccess({ ...d, minAmount: undefined, maxAmount: undefined, window: undefined, hiddenTxns: undefined }, DEFAULT_ACCESS),
    window: safe(() => cleanWindow(d.window || undefined, DEFAULT_ACCESS.window), DEFAULT_ACCESS.window),
    minAmount: Number.isFinite(d.minAmount) && d.minAmount >= 0 ? d.minAmount : null,
    maxAmount: Number.isFinite(d.maxAmount) && d.maxAmount >= 0 ? d.maxAmount : null,
    books: (d.books || []).map(String),
    hiddenTxns: Array.isArray(d.hiddenTxns) ? d.hiddenTxns.map(String) : [],
  };
};
export const settingsView = (doc) => {
  const d = doc || {};
  const hiddenTxns = Array.isArray(d.hiddenTxns) ? d.hiddenTxns.map(String) : [];
  try { return { ...cleanSettings({ ...d, hiddenTxns: undefined }, DEFAULT_SETTINGS), hiddenTxns }; }
  catch { return { ...cleanSettings({ ...d, window: null, hiddenTxns: undefined }, DEFAULT_SETTINGS), hiddenTxns }; }
};
export { cleanHidden };
export const accessView = (doc) => storedAccess(doc);

/* ------------------------------------------------------------ what a partner actually gets */
const tighterDays = (a, b) => (!a ? b : !b ? a : Math.min(a, b));
const later = (a, b) => (!a ? b : !b ? a : a > b ? a : b);
const earlier = (a, b) => (!a ? b : !b ? a : a < b ? a : b);
const overlapGateways = (a, b) => {
  if (!a.length) return b.length ? b : null;
  if (!b.length) return a;
  return a.filter((g) => b.includes(g));
};

const IST_OFFSET_MS = 330 * 60 * 1000;
const istDayKey = (ms = Date.now()) => new Date(ms + IST_OFFSET_MS).toISOString().slice(0, 10);

export const effectivePermissions = (settingsDoc, accessDoc) => {
  const s = settingsView(settingsDoc);
  const a = accessView(accessDoc);
  const and = (keys, x, y) => Object.fromEntries(keys.map((k) => [k, Boolean(x[k] && y[k])]));

  const fields = and(FIELD_KEYS, s.fields, a.fields);
  const sections = and(SECTION_KEYS, s.sections, a.sections);
  // codes section is about coupon / referral columns; without either there is nothing to show
  if (!fields.coupon && !fields.referralCode) sections.codes = false;

  // access ends at the END of expiresAt (IST)
  const expired = Boolean(a.expiresAt && istDayKey() > a.expiresAt);

  return {
    active: Boolean(s.enabled && a.enabled && !expired),
    portalEnabled: s.enabled,
    accessEnabled: a.enabled,
    expired,
    expiresAt: a.expiresAt || "",
    products: and(PRODUCT_KEYS, s.products, a.products),
    sections,
    fields,
    statuses: and(STATUS_KEYS, s.statuses, a.statuses),
    gateways: overlapGateways(s.gateways, a.gateways), // null = all
    window: { from: later(s.window.from, a.window.from), to: earlier(s.window.to, a.window.to) },
    delayDays: Math.max(s.delayDays, a.delayDays),
    historyDays: tighterDays(s.maxHistoryDays, a.historyDays),
    minAmount: a.minAmount,
    maxAmount: a.maxAmount,
    codes: a.codes.length ? a.codes : null,
    books: a.books.length ? a.books : null,
    maskTransactionIds: Boolean(s.maskTransactionIds || a.maskTransactionIds),
    hiddenTxns: [...new Set([...s.hiddenTxns, ...a.hiddenTxns])],
    hiddenOwn: a.hiddenTxns.length,
    hiddenAll: s.hiddenTxns.length,
    notice: s.notice,
  };
};

export const enabledProducts = (perms) => PRODUCT_KEYS.filter((k) => perms.products[k]);
export const visibleStatuses = (perms) => STATUS_KEYS.filter((k) => perms.statuses[k]);

/* Row-level rules for the ledger query (dates are handled by the controller). */
export const scopeOf = (perms) => ({
  statuses: visibleStatuses(perms),
  gateways: perms.gateways,
  minAmount: perms.minAmount,
  maxAmount: perms.maxAmount,
  codes: perms.codes,
  books: perms.books,
  hidden: perms.hiddenTxns,
});

export const catalog = () => ({
  products: PRODUCTS, sections: SECTIONS, fields: FIELDS, statuses: STATUSES, gateways: GATEWAYS,
  historyChoices: HISTORY_CHOICES, delayChoices: DELAY_CHOICES, maxCodes: MAX_CODES, maxBooks: MAX_BOOKS, maxHidden: MAX_HIDDEN, maxHiddenAll: MAX_HIDDEN_ALL,
});
