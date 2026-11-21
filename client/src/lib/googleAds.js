import { hasConsent, isSensitiveUrl } from "./consent";
/**
 * ============================================================
 * GOOGLE ADS CONVERSION TRACKING (ready, currently inactive)
 * ============================================================
 *
 * Nothing is sent until Google is set up. To turn it on:
 *
 * 1. (No snippet needed: ensureGoogleAdsTag() below loads gtag.js
 *    for the Ads account itself, independent of analytics consent.)
 * 2. Set in client/.env (or Vercel env):
 *      VITE_GOOGLE_ADS_ID=AW-XXXXXXXXX
 *      VITE_GOOGLE_ADS_PURCHASE_LABEL=xxxxxxxxxxxx
 * 3. Tag your Google ads with auto-tagging (gclid) or
 *    utm_source=google&utm_medium=cpc.
 *
 * The backend already stores gclid / gbraid / wbraid and sets
 * order.metadata.attribution.platform = "google", and the
 * success page already calls trackGooglePurchase for those
 * orders. Meta-only and Google-only sales never cross over.
 * ============================================================
 */

const ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID;
const PURCHASE_LABEL = import.meta.env.VITE_GOOGLE_ADS_PURCHASE_LABEL;

const STORAGE_PREFIX = "google_purchase_";

/*
  Loads Google's tag for the Ads account (AW-…) on its own. Google Analytics is opt-in and only loads after
  "Accept all", so the Ads conversion must not depend on it: sales measurement is always on (lib/consent.js).
  Safe to call many times; does nothing until VITE_GOOGLE_ADS_ID is set.
*/
export const ensureGoogleAdsTag = () => {
  if (typeof window === "undefined" || !ADS_ID) return false;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };
  if (!document.querySelector(`script[data-google-ads="${ADS_ID}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ADS_ID)}`;
    script.setAttribute("data-google-ads", ADS_ID);
    document.head.appendChild(script);
    window.gtag("js", new Date());
    // Purchase/access pages carry a private token in the query string: Google only ever sees the bare path.
    window.gtag("config", ADS_ID, isSensitiveUrl()
      ? { page_location: `${window.location.origin}${window.location.pathname}`, page_referrer: "" }
      : {});
  }
  return true;
};

export const isGoogleAdsReady = () =>
  typeof window !== "undefined" &&
  typeof window.gtag === "function" &&
  Boolean(ADS_ID && PURCHASE_LABEL);

export const trackGooglePurchase = (order) => {
  if (order?.attribution?.platform !== "google") return false;
  if (!hasConsent("marketing")) return false; // always true today: sales measurement is always on
  ensureGoogleAdsTag();
  if (!isGoogleAdsReady()) return false;

  const orderId = String(order?.orderId || "").trim();
  const amount = Number(order?.amount);

  if (!orderId || !Number.isFinite(amount) || amount <= 0) return false;

  const key = `${STORAGE_PREFIX}${orderId}`;

  try {
    if (window.localStorage.getItem(key)) return false;
  } catch {
    /* storage unavailable */
  }

  try {
    window.gtag("event", "conversion", {
      send_to: `${ADS_ID}/${PURCHASE_LABEL}`,
      value: amount,
      currency: order.currency || "INR",
      // Google de-duplicates conversions on transaction_id
      transaction_id: orderId,
    });

    try {
      window.localStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }

    return true;
  } catch {
    return false;
  }
};
