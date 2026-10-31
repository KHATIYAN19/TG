/**
 * ============================================================
 * GOOGLE ADS CONVERSION TRACKING (ready, currently inactive)
 * ============================================================
 *
 * Nothing is sent until Google is set up. To turn it on:
 *
 * 1. Add the gtag.js snippet for your Google Ads account to
 *    index.html (AW-XXXXXXXXX).
 * 2. Set in client/.env:
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

export const isGoogleAdsReady = () =>
  typeof window !== "undefined" &&
  typeof window.gtag === "function" &&
  Boolean(ADS_ID && PURCHASE_LABEL);

export const trackGooglePurchase = (order) => {
  if (order?.attribution?.platform !== "google") return false;
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
