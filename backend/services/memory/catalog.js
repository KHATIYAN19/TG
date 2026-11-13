import MemoryAddon from "../../models/memory/MemoryAddon.js";
import MemoryCredit from "../../models/memory/MemoryCredit.js";
import { TEMPLATE_THEMES, MemoryError } from "./memoryService.js";

/*
  PRICING AND LIMITS: the one place that answers
    - what does this template + theme cost?              priceOf()
    - which add-ons exist and what does a pack add?       addonCatalog()
    - how much can THIS page hold?                        limitsFor()
    - what is the total for an order?                     buildQuote()
  Money is kept in PAISE (integers) everywhere here. The admin types rupees; toPaise() converts once.
*/

export const toPaise = (rupees) => Math.round((Number(rupees) || 0) * 100);
export const toRupees = (paise) => Math.round(Number(paise) || 0) / 100;

/* ---------- add-ons: the keys are fixed, because each one changes one specific limit ---------- */
export const ADDON_DEFS = {
  photos: { field: "photos", name: "More photos", unitLabel: "photos", description: "Room for more photos in the gallery.", unit: 10, price: 29, maxPacks: 5 },
  videos: { field: "videos", name: "More videos", unitLabel: "videos", description: "Add more videos to the page.", unit: 1, price: 39, maxPacks: 5 },
  photoMb: { field: "photoMb", name: "Bigger photos", unitLabel: "MB per photo", description: "Allow larger photo files (sharper pictures).", unit: 5, price: 19, maxPacks: 4 },
  videoMb: { field: "videoMb", name: "Bigger videos", unitLabel: "MB per video", description: "Allow larger video files.", unit: 50, price: 29, maxPacks: 6 },
  videoSec: { field: "videoSec", name: "Longer videos", unitLabel: "seconds per video", description: "Allow each video to run longer.", unit: 30, price: 29, maxPacks: 6 },
  audioMb: { field: "audioMb", name: "Bigger voice message", unitLabel: "MB", description: "Allow a larger voice message file.", unit: 5, price: 15, maxPacks: 4 },
  audioSec: { field: "audioSec", name: "Longer voice message", unitLabel: "seconds", description: "Let your voice message run longer.", unit: 60, price: 19, maxPacks: 5 },
  chars: { field: "chars", name: "Longer message", unitLabel: "characters", description: "Room for a longer letter.", unit: 1000, price: 15, maxPacks: 5 },
  days: { field: "days", name: "Keep it online longer", unitLabel: "days", description: "Extend how long the page stays online.", unit: 30, price: 49, maxPacks: 6 },
};
export const ADDON_KEYS = Object.keys(ADDON_DEFS);
/* what a page's `extra` holds (same names as ADDON_DEFS fields) */
export const EXTRA_FIELDS = ADDON_KEYS.map((k) => ADDON_DEFS[k].field);
export const emptyExtra = () => Object.fromEntries(EXTRA_FIELDS.map((f) => [f, 0]));

/** Create the default add-ons the first time (the admin edits them afterwards). */
export const ensureAddons = async () => {
  if (await MemoryAddon.estimatedDocumentCount()) return;
  await MemoryAddon.insertMany(
    ADDON_KEYS.map((key, i) => { const d = ADDON_DEFS[key]; return { key, name: d.name, description: d.description, unit: d.unit, price: d.price, maxPacks: d.maxPacks, sortOrder: i, enabled: true }; }),
    { ordered: false }
  ).catch(() => {});
};

export const addonOut = (a) => ({
  key: a.key, name: a.name, description: a.description || "", enabled: a.enabled !== false, unit: a.unit, unitLabel: ADDON_DEFS[a.key]?.unitLabel || "", price: a.price, maxPacks: a.maxPacks, sortOrder: a.sortOrder || 0,
});

export const addonCatalog = async ({ onlyEnabled = false } = {}) => {
  await ensureAddons();
  const rows = await MemoryAddon.find(onlyEnabled ? { enabled: true } : {}).sort({ sortOrder: 1 }).lean();
  return rows.filter((a) => ADDON_DEFS[a.key]);
};

/* ---------- templates and themes ---------- */

/** The theme ids of a template, in the order the site shows them. A template with no themes returns []. */
export const themeIdsOf = (occasion) => TEMPLATE_THEMES[occasion?.theme] || [];
const themeCfg = (occasion, id) => (occasion?.themes || []).find((t) => t.key === id);
export const themeEnabled = (occasion, id) => themeCfg(occasion, id)?.enabled !== false;
/** The themes a NEW page may use right now. */
export const enabledThemes = (occasion) => themeIdsOf(occasion).filter((id) => themeEnabled(occasion, id));

/** Price of a template + theme in paise: the theme's own price, else the template's, else the default from Settings. */
export const priceOf = (occasion, themeId, settings) => {
  const own = themeId ? themeCfg(occasion, themeId)?.price : null;
  const rupees = own ?? occasion?.price ?? settings?.price ?? 0;
  return toPaise(rupees);
};

/** The theme a new page gets: the one asked for, or the first one that is switched on. Throws when it can't be used. */
export const resolveTheme = (occasion, asked) => {
  const ids = themeIdsOf(occasion);
  if (!ids.length) return ""; // a template without looks
  if (asked) {
    if (!ids.includes(asked)) throw new MemoryError(400, `Unknown theme. Choose one of: ${ids.join(", ")}.`, "INVALID_THEME");
    if (!themeEnabled(occasion, asked)) throw new MemoryError(400, "That look isn't available right now. Please pick another.", "THEME_DISABLED");
    return asked;
  }
  const first = enabledThemes(occasion)[0];
  if (!first) throw new MemoryError(400, "This template isn't available right now.", "THEME_DISABLED");
  return first;
};

/* ---------- limits ---------- */

/** The limits a page of this template gets before add-ons: the template's own number, else the global one from Settings. */
export const baseLimits = (settings, occasion) => {
  const o = occasion?.limits || {};
  const pick = (own, global, fallback) => (own ?? global ?? fallback);
  return {
    photos: pick(o.photos, settings.maxPhotos, 10),
    videos: pick(o.videos, settings.maxVideos, 3),
    photoMb: pick(o.photoMb, settings.maxPhotoMb, 10),
    videoMb: pick(o.videoMb, settings.maxVideoMb, 100),
    videoSec: pick(o.videoSec, settings.maxVideoSec, 60),
    audioMb: pick(o.audioMb, settings.maxAudioMb, 10),
    audioSec: pick(o.audioSec, settings.maxAudioSec, 120),
    messageChars: pick(o.messageChars, settings.maxMessageChars, 2000),
  };
};

/** base limits + what the page bought. `extra` is the page's (or the credit's) extra room. */
export const withExtra = (base, extra) => {
  const e = extra || {};
  return {
    photos: base.photos + (e.photos || 0),
    videos: base.videos + (e.videos || 0),
    photoMb: base.photoMb + (e.photoMb || 0),
    videoMb: base.videoMb + (e.videoMb || 0),
    videoSec: base.videoSec + (e.videoSec || 0),
    audioMb: base.audioMb + (e.audioMb || 0),
    audioSec: base.audioSec + (e.audioSec || 0),
    messageChars: base.messageChars + (e.chars || 0),
  };
};
export const limitsFor = (settings, occasion, extra) => withExtra(baseLimits(settings, occasion), extra);

/** The shape the browser uses (`cfg.limits`, page.limits). */
export const limitsOut = (l) => ({ photos: l.photos, videos: l.videos, photoMb: l.photoMb, videoMb: l.videoMb, videoSec: l.videoSec, audioMb: l.audioMb, audioSec: l.audioSec, messageChars: l.messageChars });

/* ---------- quote ---------- */

/**
 * What is being bought, and what it costs. `packs` is { addonKey: number of packs }. The server decides every number here:
 * the browser only says what it wants. Returns paise.
 */
export const buildQuote = async ({ settings, occasion, themeId, packs = {}, forPage = null, baseOverride = null }) => {
  const catalog = await addonCatalog({ onlyEnabled: true });
  const byKey = new Map(catalog.map((a) => [a.key, a]));
  const lines = [];
  for (const [key, raw] of Object.entries(packs || {})) {
    const n = Math.floor(Number(raw) || 0);
    if (n <= 0) continue;
    const a = byKey.get(key);
    if (!a) throw new MemoryError(400, "One of the add-ons you picked isn't available right now.", "ADDON_UNAVAILABLE");
    const already = forPage ? Math.round((forPage.extra?.[ADDON_DEFS[key].field] || 0) / a.unit) : 0; // packs the page already has
    if (n + already > a.maxPacks) throw new MemoryError(400, `You can add up to ${a.maxPacks} packs of "${a.name}" to one page.`, "ADDON_MAX", { key, maxPacks: a.maxPacks });
    lines.push({ key, name: a.name, packs: n, unit: a.unit, grant: Math.round(a.unit * n * 100) / 100, pricePaise: toPaise(a.price) * n });
  }
  const basePaise = baseOverride != null ? baseOverride : forPage ? 0 : occasion ? priceOf(occasion, themeId, settings) : 0;
  const addonsPaise = lines.reduce((s, l) => s + l.pricePaise, 0);
  return { basePaise, addons: lines, addonsPaise, totalPaise: basePaise + addonsPaise };
};

/** The extra room an order's add-on lines add up to: { photos: 10, days: 30, ... } */
export const extraFromLines = (lines) => {
  const extra = emptyExtra();
  for (const l of lines || []) { const f = ADDON_DEFS[l.key]?.field; if (f) extra[f] += Number(l.grant) || 0; }
  return extra;
};

/* ---------- occasions as the browser / admin sees them ---------- */

export const occasionForUser = (o, settings) => {
  const ids = themeIdsOf(o);
  return {
    id: String(o._id), name: o.name, theme: o.theme, description: o.description || "",
    price: toRupees(priceOf(o, null, settings)),
    themes: ids.filter((id) => themeEnabled(o, id)).map((id) => ({ id, price: toRupees(priceOf(o, id, settings)) })),
    limits: limitsOut(baseLimits(settings, o)),
  };
};

export const occasionForAdmin = (o, settings) => {
  const ids = themeIdsOf(o);
  return {
    id: String(o._id), name: o.name, theme: o.theme, isActive: o.isActive, sortOrder: o.sortOrder, description: o.description || "",
    price: o.price ?? null, effectivePrice: toRupees(priceOf(o, null, settings)),
    themes: ids.map((id) => { const c = themeCfg(o, id); return { id, enabled: c?.enabled !== false, price: c?.price ?? null, effectivePrice: toRupees(priceOf(o, id, settings)) }; }),
    limits: { photos: o.limits?.photos ?? null, videos: o.limits?.videos ?? null, photoMb: o.limits?.photoMb ?? null, videoMb: o.limits?.videoMb ?? null, videoSec: o.limits?.videoSec ?? null, audioMb: o.limits?.audioMb ?? null, audioSec: o.limits?.audioSec ?? null, messageChars: o.limits?.messageChars ?? null },
    effectiveLimits: limitsOut(baseLimits(settings, o)),
  };
};


/* ---------- passes (unspent credits) ---------- */

/*
  THE ORDER PASSES ARE SPENT IN (one rule, used by spendCredit, findCoveringCredit and passesFor, so the screen and the server always agree):
    1. priced passes that cover the price, CHEAPEST first (a pass worth Rs 99 goes before one worth Rs 299, so a cheap page never uses up a dear pass);
       among passes of the same worth, one that carries bought room goes first, then the oldest;
    2. then "any look" passes (codes, Gumroad, admin), with bought room first, then the oldest.
  A FREE look (price 0) only ever uses a free pass (worth 0). It never touches a paid, code or Gumroad pass.
*/
const PRICED_SORT = { maxPricePaise: 1, extra: -1, createdAt: 1, _id: 1 };
const ANY_SORT = { extra: -1, createdAt: 1, _id: 1 };
const pricedFilter = (userId, pricePaise) => ({ user: userId, page: null, maxPricePaise: pricePaise > 0 ? { $gte: pricePaise } : 0 });
const anyFilter = (userId) => ({ user: userId, page: null, maxPricePaise: null });

/**
 * Take ONE unspent pass that covers `pricePaise` and attach it to the page (see the order above). Atomic: two requests at once cannot spend
 * the same pass. Returns the pass or null. A free look needs no purchase: if the user holds no free pass, one is made for this page on the spot.
 */
export const spendCredit = async (userId, pageId, pricePaise, { occasion = null, theme = "" } = {}) => {
  const credit = await MemoryCredit.findOneAndUpdate(pricedFilter(userId, pricePaise), { page: pageId }, { sort: PRICED_SORT });
  if (credit) return credit;
  if (!(pricePaise > 0)) return MemoryCredit.create({ user: userId, source: "free", maxPricePaise: 0, occasion, theme, page: pageId });
  return MemoryCredit.findOneAndUpdate(anyFilter(userId), { page: pageId }, { sort: ANY_SORT });
};

/** The very pass spendCredit would take for this price (so room bought for it is on the pass the page will use). Or null. */
export const findCoveringCredit = async (userId, pricePaise) =>
  (await MemoryCredit.findOne(pricedFilter(userId, pricePaise)).sort(PRICED_SORT)) ||
  (pricePaise > 0 ? MemoryCredit.findOne(anyFilter(userId)).sort(ANY_SORT) : null);

/** Does the user already hold an unspent pass that spendCredit would use for this price? */
export const hasCoveringCredit = async (userId, pricePaise) => Boolean(await findCoveringCredit(userId, pricePaise));

/**
 * The paid pass that is closest below this price: the user pays only the difference to raise it, instead of buying the look again.
 * (A pass worth Rs 199 and a look at Rs 209 means Rs 10.) Returns the credit or null.
 */
export const findUpgradeCredit = (userId, pricePaise) =>
  MemoryCredit.findOne({ user: userId, page: null, maxPricePaise: { $ne: null, $lt: pricePaise } }).sort({ maxPricePaise: -1, createdAt: 1 });

/** The user's unspent passes for the browser, in the order they would be spent (the same order spendCredit uses). maxPrice is in rupees (null = any theme). */
export const passesFor = async (userId) => {
  const [priced, any] = await Promise.all([
    MemoryCredit.find({ user: userId, page: null, maxPricePaise: { $ne: null } }).select("maxPricePaise extra createdAt").sort(PRICED_SORT).lean(),
    MemoryCredit.find(anyFilter(userId)).select("maxPricePaise extra createdAt").sort(ANY_SORT).lean(),
  ]);
  return [...priced, ...any].map((r) => ({ id: String(r._id), maxPrice: r.maxPricePaise == null ? null : toRupees(r.maxPricePaise), extra: r.extra || null }));
};
