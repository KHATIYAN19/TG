/**
 * ============================================================
 * AD ATTRIBUTION (server side)
 * ============================================================
 *
 * The client sends the visitor's last paid-ad touch with the
 * checkout request. We sanitize it, decide which ad platform
 * it belongs to, and store it on the order. The order is then
 * the single source of truth for "should we report this sale
 * to an ad platform?" - the browser (localStorage, cookies)
 * is not trusted after the payment-gateway round trip.
 *
 * To add another platform (TikTok, LinkedIn...) add one entry
 * to PLATFORMS below and mirror it in client/src/lib/attribution.js.
 * ============================================================
 */

const MAX_LEN = 200;

const clean = (value) => {
  if (typeof value !== "string") return null;

  const v = value.trim().slice(0, MAX_LEN);

  return v || null;
};

// Numeric ids only (Meta / Google ad ids are digits).
const cleanId = (value) => {
  const v = clean(
    typeof value === "number" ? String(value) : value
  );

  return v && /^[A-Za-z0-9_-]{1,64}$/.test(v) ? v : null;
};

const PLATFORMS = {
  meta: {
    sources: ["facebook", "fb", "ig", "instagram", "meta"],
    clickIds: ["fbclid", "fbc"],
  },
  google: {
    sources: ["google", "googleads", "google_ads"],
    clickIds: ["gclid", "gbraid", "wbraid"],
  },
};

const PAID_MEDIUMS = [
  "paid",
  "cpc",
  "ppc",
  "paid_social",
  "paidsocial",
  "display",
  "cpm",
  "social_paid",
];

const detectPlatform = (a) => {
  for (const [name, cfg] of Object.entries(PLATFORMS)) {
    if (cfg.clickIds.some((k) => a[k])) return name;
  }

  const source = (a.utmSource || "").toLowerCase();
  const medium = (a.utmMedium || "").toLowerCase();

  for (const [name, cfg] of Object.entries(PLATFORMS)) {
    if (!cfg.sources.includes(source)) continue;

    // A bare utm_source=facebook is also what organic
    // shares look like, so require a paid medium or ad id.
    if (PAID_MEDIUMS.includes(medium) || a.adId || a.campaignId) {
      return name;
    }
  }

  return "organic";
};

/**
 * @param {object} raw   req.body.attribution
 * @param {object} utm   legacy { utmSource, utmMedium, utmCampaign }
 */
export const buildAttribution = (raw = {}, utm = {}) => {
  const r = raw && typeof raw === "object" ? raw : {};

  const a = {
    fbclid: clean(r.fbclid),
    fbc: clean(r.fbc),
    fbp: clean(r.fbp),

    gclid: clean(r.gclid),
    gbraid: clean(r.gbraid),
    wbraid: clean(r.wbraid),

    utmSource: clean(r.utmSource) || clean(utm.utmSource),
    utmMedium: clean(r.utmMedium) || clean(utm.utmMedium),
    utmCampaign: clean(r.utmCampaign) || clean(utm.utmCampaign),
    utmContent: clean(r.utmContent),
    utmTerm: clean(r.utmTerm),

    campaignId: cleanId(r.campaignId),
    adsetId: cleanId(r.adsetId),
    adId: cleanId(r.adId),

    landingPath: clean(r.landingPath),
    touchedAt: clean(r.touchedAt),
  };

  return { ...a, platform: detectPlatform(a) };
};

/** Safe subset returned to the browser for pixel tracking. */
export const publicAttribution = (a) => {
  const x = a || {};

  return {
    platform: x.platform || "organic",
    campaignId: x.campaignId || null,
    adsetId: x.adsetId || null,
    adId: x.adId || null,
    utmCampaign: x.utmCampaign || null,
  };
};
