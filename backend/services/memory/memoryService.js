import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import MemorySettings from "../../models/memory/MemorySettings.js";
import MemoryOccasion from "../../models/memory/MemoryOccasion.js";
import MemoryCredit from "../../models/memory/MemoryCredit.js";
import MemoryEvent from "../../models/memory/MemoryEvent.js";
import { StorageError, createDownloadUrl } from "../storage/s3.js";
import { removeFiles } from "./storageCleanup.js";
import { formatPhone } from "../../utils/phone.js";

/* =====================================================
   ERRORS + VALIDATION
===================================================== */

export class MemoryError extends Error {
  constructor(status, message, code = "MEMORY_ERROR", extra = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

/** Zod parse that throws a 400 MemoryError with readable details. */
export const parse = (schema, data) => {
  const result = schema.safeParse(data ?? {});
  if (!result.success) {
    throw new MemoryError(400, result.error.issues.map((i) => `${i.path.join(".") || "value"}: ${i.message}`).join("; "), "VALIDATION_FAILED");
  }
  return result.data;
};

export const assertId = (id, label = "id") => {
  if (!mongoose.isValidObjectId(id)) throw new MemoryError(400, `Invalid ${label}.`, "INVALID_ID");
  return id;
};

/** Translate MemoryError to the project's { success:false, message, code } shape; rethrow the rest. */
export const sendError = (res, err) => {
  if (err instanceof MemoryError) {
    return res.status(err.status).json({ success: false, message: err.message, code: err.code, ...err.extra });
  }
  if (err instanceof StorageError) {
    return res.status(err.status).json({ success: false, message: err.message, code: err.code });
  }
  if (err?.name === "ZodError") {
    return res.status(400).json({ success: false, message: "Validation failed", code: "VALIDATION_FAILED" });
  }
  throw err;
};

export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* =====================================================
   SETTINGS + OCCASIONS
===================================================== */

/* Allowed theme ids per template. The designs live in the client (memories/templates/<name>/themes.js).
   The SENDER picks one for their page; if none is picked the first one is used. */
export const TEMPLATE_THEMES = {
  birthday: ["candy", "love", "friendship", "citrus", "dreamy", "midnight", "tropical", "galaxy"],
  sorry: ["teddy", "rain", "rose", "starry", "sunflower", "friends"],
  anniversary: ["lovey", "golden", "candlelight", "garden", "sunset"],
  proposal: ["romance", "starlit", "blossom", "fairytale", "sunrise"],
  thanks: ["harvest", "cozy", "sunshine", "professional", "meadow", "twilight"],
};
export const MAX_TIMELINE = 8;
export const MAX_REASONS = 12;
export const MAX_STATS = 6;
export const MAX_GIFTS = 8;
export const MAX_PROMISES = 8;
export const MAX_WISHES = 10;

/** The theme to show: the sender's choice if valid for this template, else the template's default. */
export const styleFor = (page) => {
  const list = TEMPLATE_THEMES[page.occasion?.theme] || null;
  if (!list) return null;
  return list.includes(page.style) ? page.style : list[0];
};

export const MAX_PEOPLE = 10;
export const THANKS_AUDIENCES = ["friend", "family", "colleague", "team", "mentor", "community"];
export const timelineOut = (page) => (page.timeline || []).map((m) => ({ id: String(m._id), date: m.date || "", title: m.title, note: m.note || "" }));
export const statsOut = (page) => (page.stats || []).map((s) => ({ id: String(s._id), label: s.label, value: s.value }));

export const giftsOut = (page) => (page.gifts || []).map((g) => ({ id: String(g._id), title: g.title, note: g.note || "", emoji: g.emoji || "" }));

export const getSettings = () =>
  MemorySettings.findOneAndUpdate(
    { key: "main" },
    { $setOnInsert: { key: "main" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

export const updateSettings = (patch) =>
  MemorySettings.findOneAndUpdate({ key: "main" }, { $set: patch }, { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }).lean();

const DEFAULT_OCCASIONS = [
  ["Birthday", "birthday"],
  ["Marriage Proposal", "proposal"],
  ["Sorry", "sorry"],
  ["Anniversary", "anniversary"],
  ["Thank You", "thanks"],
];

export const ensureOccasions = async () => {
  if (await MemoryOccasion.estimatedDocumentCount()) return;
  await MemoryOccasion.insertMany(DEFAULT_OCCASIONS.map(([name, theme], i) => ({ name, theme, sortOrder: i })), { ordered: false }).catch(() => {});
};

/* =====================================================
   LINKS, PINS, TOKENS
===================================================== */

export const newSlug = () => crypto.randomBytes(9).toString("base64url");
export const newPin = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
export const newCode = () => crypto.randomBytes(5).toString("hex").toUpperCase();
export const hashPin = (pin) => bcrypt.hash(pin, 10);

/*
  The PIN is stored twice: hashed (what visitors are checked against) and ENCRYPTED with AES-256-GCM, so the page's owner can see it
  again in My pages. The key comes from MEMORY_PIN_SECRET (or, failing that, JWT_SECRET). It is never sent to visitors.
*/
const pinKey = () => crypto.createHash("sha256").update(`${process.env.MEMORY_PIN_SECRET || process.env.JWT_SECRET}:memory-pin`).digest();
export const encryptPin = (pin) => {
  if (!pin) return null;
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", pinKey(), iv);
  const enc = Buffer.concat([c.update(String(pin), "utf8"), c.final()]);
  return [iv, c.getAuthTag(), enc].map((b) => b.toString("base64url")).join(".");
};
export const decryptPin = (blob) => {
  try {
    if (!blob) return null;
    const [iv, tag, enc] = String(blob).split(".").map((x) => Buffer.from(x, "base64url"));
    const d = crypto.createDecipheriv("aes-256-gcm", pinKey(), iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(enc), d.final()]).toString("utf8");
  } catch {
    return null; // a changed key or a damaged value: the owner just makes a new PIN
  }
};
export const checkPin = (pin, hash) => (hash ? bcrypt.compare(String(pin), hash) : false);

export const shareUrl = (slug) =>
  `${String(process.env.FRONTEND_URL || "https://www.targettrek.in").replace(/\/+$/, "")}/memories/${slug}`;

/* Page-unlock tokens use their own secret + audience so they can never act as a login token. */
const pageSecret = () => `${process.env.JWT_SECRET}:memory-page`;

export const signPageToken = (page) =>
  jwt.sign({ pid: String(page._id), v: page.accessVersion }, pageSecret(), { algorithm: "HS256", expiresIn: "12h", audience: "memory-page" });

export const verifyPageToken = (token, page) => {
  try {
    const d = jwt.verify(String(token || ""), pageSecret(), { algorithms: ["HS256"], audience: "memory-page" });
    return d.pid === String(page._id) && d.v === page.accessVersion;
  } catch {
    return false;
  }
};

/* =====================================================
   MEDIA
===================================================== */

const MEDIA_URL_TTL = () => Number(process.env.MEMORY_MEDIA_URL_TTL_SECONDS) || 3600;

const mediaOut = async (m) => {
  let url = null;
  try {
    url = (await createDownloadUrl(m.key, { inline: true, ttl: MEDIA_URL_TTL() })).url;
  } catch (e) {
    console.error("[memory] could not sign media url:", e.message);
  }
  const width = m.width || null;
  const height = m.height || null;
  // landscape (16:9 and friends), portrait (9:16) or square: the page uses this to choose how to show it
  const orientation = width && height ? (width / height > 1.05 ? "landscape" : width / height < 0.95 ? "portrait" : "square") : null;
  return { id: String(m._id), kind: m.kind, isMain: Boolean(m.isMain), contentType: m.contentType, size: m.size, name: m.originalName, url, width, height, orientation, durationSec: m.durationSec ?? null };
};

export const signMedia = (page) => Promise.all((page.media || []).map(mediaOut));

/** Every file of these media entries leaves the bucket now (queued for retry if the bucket refuses). */
export const deleteMediaObjects = (media) => removeFiles((media || []).map((m) => m.key));

/* =====================================================
   RECEIVER ACTIVITY: events, the locked answer, replies
===================================================== */

/* What a page may report about itself. "answer" and "reply" are NOT here: they only come from their own endpoints. */
export const EVENT_TYPES = new Set([
  "open", "gate_open", "time_spent", "media_view", "letter_open", "finale", "song",
  "balloon_pop", "candles_blown", "cake_cut", "gift_open", "gifts_all_open", "chocolate_bite", // birthday
  "comfort", "heart_mended", "promise_flip", "gesture", // sorry
  "jar_reason", "toast", "bouquet", "lantern", // anniversary
  "box_open", // proposal
  "leaf", "react", // thank you
]);
export const MAX_EVENTS_PER_PAGE = 4000;
export const MAX_REPLIES = 30;
export const MAX_EMAIL_SENDS = 3; // the creation email + up to two resends
export const ANSWER_TEMPLATES = ["proposal", "sorry"];

/** Keep `data` tiny and boring: up to 6 short strings / numbers / booleans. Anything else is dropped. */
export const cleanEventData = (d) => {
  const out = {};
  if (!d || typeof d !== "object" || Array.isArray(d)) return out;
  let n = 0;
  for (const [k, v] of Object.entries(d)) {
    if (n >= 6) break;
    if (!/^[a-z][a-z_]{0,19}$/i.test(k)) continue;
    if (typeof v === "string") { out[k] = v.slice(0, 120); n++; }
    else if (typeof v === "number" && Number.isFinite(v)) { out[k] = Math.round(v * 100) / 100; n++; }
    else if (typeof v === "boolean") { out[k] = v; n++; }
  }
  return out;
};

export const cleanVisitor = (v) => String(v || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 40);

export const answerOut = (page) =>
  page.answer?.value ? { value: page.answer.value, final: Boolean(page.answer.final), at: page.answer.at, firstAt: page.answer.firstAt || page.answer.at, history: (page.answer.history || []).map((h) => ({ value: h.value, at: h.at })) } : null;

export const repliesOut = (page) => (page.replies || []).map((r) => ({ text: r.text, at: r.at }));

/** Everything the owner's activity screen shows, from the page and its events (oldest first). */
export const buildActivity = (page, events) => {
  const byType = {};
  const visitors = new Set();
  const devices = {};
  let seconds = 0;
  for (const e of events) {
    if (e.visitor) visitors.add(e.visitor);
    const t = (byType[e.type] ||= { count: 0, total: 0, first: e.at, last: e.at, items: [], seen: new Set() });
    t.count += 1;
    t.last = e.at;
    t.lastData = e.data || {}; // e.g. where the comfort meter ended up
    const n = Number(e.data?.n);
    if (Number.isFinite(n) && n > 0) t.total += n;
    const key = e.data?.id ?? e.data?.key ?? e.data?.i ?? e.data?.kind;
    if (key != null && !t.seen.has(String(key))) {
      t.seen.add(String(key));
      t.items.push({ key: String(key), label: e.data?.title ?? e.data?.text ?? e.data?.name ?? null, at: e.at });
    }
    if (e.type === "time_spent") seconds += Math.min(Number(e.data?.secs) || 0, 6 * 3600);
    if (e.type === "open" && e.data?.device) devices[e.data.device] = (devices[e.data.device] || 0) + 1;
  }
  for (const t of Object.values(byType)) delete t.seen;
  const theme = page.occasion?.theme || null;
  return {
    page: { id: String(page._id), url: shareUrl(page.slug), expiresAt: page.expiresAt || null, daysLeft: daysLeft(page), title: page.title, theme, recipientName: page.recipientName, senderName: page.senderName || "", status: page.status, visibility: page.visibility, createdAt: page.createdAt, viewCount: page.viewCount || 0 },
    summary: { opens: page.activity?.opens || 0, uniqueVisitors: visitors.size, firstOpenedAt: page.activity?.firstOpenedAt || null, lastOpenedAt: page.activity?.lastOpenedAt || null, totalSeconds: Math.round(seconds), devices },
    totals: { gifts: (page.gifts || []).length, promises: (page.promises || []).length, reasons: (page.reasons || []).length, people: (page.people || []).length, photos: (page.media || []).filter((m) => m.kind === "photo").length, videos: (page.media || []).filter((m) => m.kind === "video").length },
    answer: answerOut(page),
    replies: repliesOut(page),
    byType,
    timeline: events.slice(-120).reverse().map((e) => ({ type: e.type, data: e.data || {}, at: e.at })),
  };
};

export const purgePageEvents = (pageIds) => MemoryEvent.deleteMany({ page: { $in: [].concat(pageIds) } });

/* =====================================================
   PAGE LIFETIME: every page stays online for 30 days
===================================================== */
export const PAGE_LIFETIME_DAYS = Math.max(1, parseInt(process.env.MEMORY_PAGE_LIFETIME_DAYS, 10) || 30);
export const DAY_MS = 24 * 60 * 60 * 1000;
/** The lifetime comes from the admin settings (stored in the database); the environment value is only the starting default. */
export const lifetimeDays = (settings) => Math.max(1, Math.round(Number(settings?.pageLifetimeDays) || PAGE_LIFETIME_DAYS));
export const expiryFrom = (from = Date.now(), days = PAGE_LIFETIME_DAYS) => new Date(new Date(from).getTime() + days * DAY_MS);
export const isExpired = (page) => Boolean(page?.expiresAt) && new Date(page.expiresAt).getTime() <= Date.now();
export const daysLeft = (page) => (page?.expiresAt ? Math.max(0, Math.ceil((new Date(page.expiresAt).getTime() - Date.now()) / DAY_MS)) : null);

/* =====================================================
   SERIALIZERS
===================================================== */

/** Owner / admin view. `withMedia` adds short-lived signed URLs (one S3 sign per file, so opt in). */
export const pageView = async (page, { withMedia = false, withPin = false } = {}) => {
  const user = page.user && page.user._id ? page.user : null;
  const occasion = page.occasion && page.occasion._id ? page.occasion : null;
  return {
    id: String(page._id),
    title: page.title,
    recipientName: page.recipientName,
    senderName: page.senderName || "",
    message: page.message || "",
    occasionId: String(occasion?._id || page.occasion),
    occasion: occasion?.name || null,
    theme: occasion?.theme || null,
    style: page.style || "",
    age: page.age ?? null,
    gifts: giftsOut(page),
    wishes: page.wishes || [],
    promises: page.promises || [],
    since: page.since || "",
    question: page.question || "",
    audience: page.audience || "",
    people: timelineOut({ timeline: page.people }),
    timeline: timelineOut(page),
    reasons: page.reasons || [],
    stats: statsOut(page),
    answer: page.answer?.value || null,
    answerFinal: Boolean(page.answer?.final),
    repliesCount: (page.replies || []).length,
    opens: page.activity?.opens || 0,
    lastOpenedAt: page.activity?.lastOpenedAt || null,
    visibility: page.visibility,
    hasPin: Boolean(page.pinHash) || page.visibility === "private",
    // only the owner's own screens ask for this; admin and visitor views never include it
    ...(withPin ? { pin: page.visibility === "private" ? decryptPin(page.pinEnc) : null } : {}),
    status: page.status,
    shareEmail: page.shareEmail || "",
    emailStatus: page.emailStatus || "",
    emailSendsLeft: page.shareEmail ? Math.max(0, MAX_EMAIL_SENDS - (page.emailSends || 0)) : 0,
    expiresAt: page.expiresAt || null,
    daysLeft: daysLeft(page),
    slug: page.slug,
    url: shareUrl(page.slug),
    viewCount: page.viewCount || 0,
    photoCount: (page.media || []).filter((m) => m.kind === "photo").length,
    videoCount: (page.media || []).filter((m) => m.kind === "video").length,
    owner: user ? { id: String(user._id), name: user.name, email: user.email, ...(user.mobile ? { phone: formatPhone(user.countryCode, user.mobile) } : {}) } : { id: String(page.user) },
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
    ...(withMedia ? { media: await signMedia(page) } : {}),
  };
};

/* =====================================================
   CREDITS
===================================================== */

export const availableCredits = (userId) => MemoryCredit.countDocuments({ user: userId, page: null });

export const grantCredits = (userId, { source, ref = null, count = 1 }) =>
  MemoryCredit.insertMany(Array.from({ length: count }, () => ({ user: userId, source, ref })));
