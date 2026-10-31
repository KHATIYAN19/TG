/**
 * ============================================================
 * AD ATTRIBUTION (browser side)
 * ============================================================
 *
 * Remembers the visitor's LAST PAID-AD touch (Meta, Google...)
 * so the checkout can send it to the backend, which stores it
 * on the order. Organic / direct visits never overwrite a paid
 * touch and are never treated as paid.
 *
 * Ad URL template for Meta (Ads Manager > Ad > URL parameters):
 *   utm_source=facebook&utm_medium=paid&utm_campaign={{campaign.name}}
 *   &utm_content={{ad.name}}&utm_term={{adset.name}}
 *   &campaign_id={{campaign.id}}&adset_id={{adset.id}}&ad_id={{ad.id}}
 *
 * Google Ads: turn on auto-tagging (adds gclid) and/or use
 *   utm_source=google&utm_medium=cpc&utm_campaign={campaignid}
 *
 * To support another platform add it to PLATFORMS here and in
 * backend/utils/attribution.js.
 * ============================================================
 */

const STORAGE_KEY = "tt_attr_v1";
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const PLATFORMS = {
  meta: {
    sources: ["facebook", "fb", "ig", "instagram", "meta"],
    clickIds: ["fbclid"],
  },
  google: {
    sources: ["google", "googleads", "google_ads"],
    clickIds: ["gclid", "gbraid", "wbraid"],
  },
};

const PAID_MEDIUMS = [
  "paid", "cpc", "ppc", "paid_social", "paidsocial",
  "display", "cpm", "social_paid",
];

const isBrowser = () => typeof window !== "undefined";

// Ignore unresolved ad-manager macros such as {{campaign.id}}.
const val = (v) => {
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, 200);
  return !t || t.includes("{{") || t.includes("{") ? null : t;
};

const readStore = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);

    if (!data || Date.now() > data.expiresAt) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
};

const writeStore = (data) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* private mode */
  }
};

const readCookie = (name) => {
  try {
    const m = document.cookie.match(
      new RegExp("(?:^|; )" + name + "=([^;]*)")
    );
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
};

export const detectPlatform = (a = {}) => {
  for (const [name, cfg] of Object.entries(PLATFORMS)) {
    if (cfg.clickIds.some((k) => a[k])) return name;
  }

  const source = (a.utmSource || "").toLowerCase();
  const medium = (a.utmMedium || "").toLowerCase();

  for (const [name, cfg] of Object.entries(PLATFORMS)) {
    if (
      cfg.sources.includes(source) &&
      (PAID_MEDIUMS.includes(medium) || a.adId || a.campaignId)
    ) {
      return name;
    }
  }

  return "organic";
};

/**
 * Call once on app start. Saves the touch only if the URL
 * carries a paid-ad signal.
 */
export const captureAttribution = () => {
  if (!isBrowser()) return null;

  const p = new URLSearchParams(window.location.search);

  const touch = {
    fbclid: val(p.get("fbclid")),
    gclid: val(p.get("gclid")),
    gbraid: val(p.get("gbraid")),
    wbraid: val(p.get("wbraid")),
    utmSource: val(p.get("utm_source")),
    utmMedium: val(p.get("utm_medium")),
    utmCampaign: val(p.get("utm_campaign")),
    utmContent: val(p.get("utm_content")),
    utmTerm: val(p.get("utm_term")),
    campaignId: val(p.get("campaign_id")) || val(p.get("utm_id")),
    adsetId: val(p.get("adset_id")),
    adId: val(p.get("ad_id")),
  };

  if (detectPlatform(touch) === "organic") return readStore();

  const now = Date.now();

  const saved = {
    ...touch,
    landingPath: window.location.pathname,
    touchedAt: new Date(now).toISOString(),
    expiresAt: now + WINDOW_MS,
  };

  writeStore(saved);

  return saved;
};

/**
 * Attribution payload sent to the backend at checkout.
 * Always an object; platform is "organic" when no paid touch.
 */
export const getAttribution = () => {
  if (!isBrowser()) return { platform: "organic" };

  const stored = readStore();

  if (!stored) {
    return { platform: "organic", fbp: readCookie("_fbp") };
  }

  const { expiresAt, ...touch } = stored;

  let fbc = readCookie("_fbc");

  // Meta's cookie format: fb.1.<click time ms>.<fbclid>
  if (!fbc && touch.fbclid) {
    fbc = `fb.1.${Date.parse(touch.touchedAt) || Date.now()}.${touch.fbclid}`;
  }

  return {
    ...touch,
    fbc,
    fbp: readCookie("_fbp"),
    platform: detectPlatform(touch),
  };
};

/** True when the visitor's last paid touch came from `platform`. */
export const isFromPlatform = (platform) =>
  getAttribution().platform === platform;

/** Campaign ids to attach as custom params on pixel events. */
export const getCampaignParams = (platform) => {
  const a = getAttribution();

  if (a.platform !== platform) return {};

  const out = {};

  if (a.campaignId) out.campaign_id = a.campaignId;
  if (a.adsetId) out.adset_id = a.adsetId;
  if (a.adId) out.ad_id = a.adId;
  if (a.utmCampaign) out.utm_campaign = a.utmCampaign;

  return out;
};
