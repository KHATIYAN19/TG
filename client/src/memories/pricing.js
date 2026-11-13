import { AudioLines, CalendarPlus, Clock, Film, HardDrive, ImagePlus, Images, Mic, Timer, Type } from "lucide-react";

/*
  Prices, passes and limits as the screens need them. The SERVER decides every real number (what is charged, what a page may hold);
  this file only mirrors the same rules so the screens can show them before anything is sent.
  Money here is in RUPEES (what the server sends); comparisons go through paise to avoid 0.1 + 0.2 problems.
*/
export const paise = (r) => Math.round((Number(r) || 0) * 100);
export const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
export const priceLabel = (n) => (paise(n) <= 0 ? "Free" : rupees(n));

/** The template card (from cfg.occasions) for a template id like "birthday". */
export const occasionOf = (cfg, templateId) => cfg?.occasions?.find((o) => o.theme === templateId) || null;

/** The looks a template offers right now (the admin can switch some off). */
export const themesOf = (occ) => occ?.themes || [];

/** Price of a look; a template with no looks uses the template price. */
export const lookPrice = (occ, themeId) => {
  const t = themesOf(occ).find((x) => x.id === themeId);
  return t ? t.price : occ?.price ?? 0;
};

/** The first look that is switched on and the user may pick, or null. */
export const firstLook = (occ) => themesOf(occ)[0]?.id || null;

/** Does this pass cover this price? A pass with maxPrice null works for every look. */
export const passCovers = (pass, price) => pass.maxPrice == null || paise(pass.maxPrice) >= paise(price);

/**
 * The pass that will be used for this price, by the same rule as the server: the cheapest one that covers it, "any look" passes last
 * (cfg.passes is already in that order). A FREE look only ever uses a free pass: it never uses up a paid, code or Gumroad pass.
 */
export const pickPass = (passes, price) => {
  const list = passes || [];
  if (paise(price) <= 0) return list.find((p) => p.maxPrice != null && paise(p.maxPrice) <= 0) || null;
  return list.find((p) => p.maxPrice != null && passCovers(p, price)) || list.find((p) => p.maxPrice == null) || null;
};

/** For the page builder: a free look needs no pass in hand (the server makes the free pass when the page is created). */
const FREE_PASS = Object.freeze({ id: null, maxPrice: 0, extra: null, free: true });
export const passFor = (passes, price) => pickPass(passes, price) || (paise(price) <= 0 ? FREE_PASS : null);

/** The room a page gets: the template's limits plus what the pass / page bought. */
export const limitsWithExtra = (limits, extra) => {
  const e = extra || {};
  const l = limits || {};
  return {
    photos: (l.photos ?? 10) + (e.photos || 0),
    videos: (l.videos ?? 3) + (e.videos || 0),
    photoMb: (l.photoMb ?? 10) + (e.photoMb || 0),
    videoMb: (l.videoMb ?? 100) + (e.videoMb || 0),
    videoSec: (l.videoSec ?? 60) + (e.videoSec || 0),
    audioMb: (l.audioMb ?? 10) + (e.audioMb || 0),
    audioSec: (l.audioSec ?? 120) + (e.audioSec || 0),
    messageChars: (l.messageChars ?? 2000) + (e.chars || 0),
  };
};

/* what each add-on looks like, and which limit it raises */
export const ADDON_META = {
  photos: { Icon: Images, limit: "photos", noun: "photos", tone: "bg-rose-50 text-rose-600" },
  videos: { Icon: Film, limit: "videos", noun: "videos", tone: "bg-violet-50 text-violet-600" },
  photoMb: { Icon: ImagePlus, limit: "photoMb", noun: "MB per photo", tone: "bg-amber-50 text-amber-600" },
  videoMb: { Icon: HardDrive, limit: "videoMb", noun: "MB per video", tone: "bg-sky-50 text-sky-600" },
  videoSec: { Icon: Timer, limit: "videoSec", noun: "sec per video", tone: "bg-indigo-50 text-indigo-600" },
  audioMb: { Icon: Mic, limit: "audioMb", noun: "MB voice message", tone: "bg-emerald-50 text-emerald-600" },
  audioSec: { Icon: AudioLines, limit: "audioSec", noun: "sec voice message", tone: "bg-teal-50 text-teal-600" },
  chars: { Icon: Type, limit: "messageChars", noun: "characters", tone: "bg-orange-50 text-orange-600" },
  days: { Icon: CalendarPlus, limit: null, noun: "days online", tone: "bg-pink-50 text-pink-600" },
};
export const AddonClock = Clock;

/** "{n} packs x +10 photos" style total for a selection: the extra room, by limit key (chars -> messageChars). */
export const extraOfPacks = (catalog, packs) => {
  const extra = {};
  for (const a of catalog || []) {
    const n = packs?.[a.key] || 0;
    if (n > 0) extra[a.key] = Math.round(a.unit * n * 100) / 100;
  }
  return extra;
};

/** total price in rupees of a selection of packs, from the catalog (the server re-checks it) */
export const packsTotal = (catalog, packs) => (catalog || []).reduce((sum, a) => sum + paise(a.price) * (packs?.[a.key] || 0), 0) / 100;

/** compact limit lines for the screens: "10 photos · 3 videos (60 sec) · voice 2 min" */
export const secLabel = (s) => (s >= 120 && s % 60 === 0 ? `${s / 60} min` : s > 90 ? `${Math.floor(s / 60)}m ${s % 60}s`.replace(" 0s", "") : `${s} sec`);

/**
 * A look that no held pass covers, but a cheaper paid pass is held: the user pays only the difference, not the whole price again
 * (a pass worth 199 and a look at 209 means 10). Returns { pass, from, diff } or null. The server works out the real charge.
 */
export const upgradeFrom = (passes, price) => {
  const lower = (passes || []).filter((p) => p.maxPrice != null && paise(p.maxPrice) < paise(price));
  if (!lower.length) return null;
  const best = lower.reduce((a, b) => (paise(b.maxPrice) > paise(a.maxPrice) ? b : a));
  return { pass: best, from: best.maxPrice, diff: (paise(price) - paise(best.maxPrice)) / 100 };
};
