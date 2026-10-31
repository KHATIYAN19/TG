/**
 * ============================================================
 * TARGET TREK — META PIXEL TRACKING
 * ============================================================
 *
 * Pixel ID: 965336112563401
 *
 * Pixel is initialized in index.html.
 * DO NOT initialize Meta Pixel again in this file.
 *
 * Supported events:
 * 1. PageView
 * 2. ViewContent
 * 3. InitiateCheckout
 * 4. Purchase
 *
 * Features:
 * - Production and localhost support
 * - Payment amount validation
 * - Currency validation
 * - Single-book and bundle purchases
 * - Stable Purchase event IDs
 * - Duplicate Purchase protection
 * - Meta Pixel availability checks
 * - Safe tracking error handling
 * - Sensitive URL protection
 * - Development debugging
 *
 * IMPORTANT:
 * This is browser-side tracking.
 * Calling fbq() does not guarantee Meta received an event.
 *
 * Purchase must be called only after the backend
 * has confirmed that the order was paid.
 *
 * ============================================================
 */

import { getCampaignParams } from "./attribution";

const META_PIXEL_ID = "965336112563401";

const PURCHASE_STORAGE_PREFIX =
  "meta_purchase_v2_";

const PURCHASE_LOCK_PREFIX =
  "meta_purchase_lock_";

const PURCHASE_LOCK_DURATION = 30000;

const IS_DEV =
  import.meta.env.DEV === true;

// ============================================================
// HELPERS
// ============================================================

const isBrowser = () => {
  return typeof window !== "undefined";
};

const debugLog = (...args) => {
  if (IS_DEV) {
    console.log(
      "[Target Trek Meta Pixel]",
      ...args
    );
  }
};

const debugWarn = (...args) => {
  if (IS_DEV) {
    console.warn(
      "[Target Trek Meta Pixel]",
      ...args
    );
  }
};

const normalizeCurrency = (currency) => {
  const value = String(
    currency || "INR"
  )
    .trim()
    .toUpperCase();

  return /^[A-Z]{3}$/.test(value)
    ? value
    : null;
};

const normalizeAmount = (amount) => {
  if (
    amount === null ||
    amount === undefined ||
    amount === ""
  ) {
    return null;
  }

  const value = Number(amount);

  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    return null;
  }

  return value;
};

const normalizeBookIds = (bookIds) => {
  if (!Array.isArray(bookIds)) {
    return [];
  }

  return [
    ...new Set(
      bookIds
        .filter(
          (id) =>
            id !== null &&
            id !== undefined
        )
        .map((id) => String(id).trim())
        .filter(Boolean)
    ),
  ];
};

const getStorage = () => {
  if (!isBrowser()) {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

// ============================================================
// META PIXEL AVAILABILITY
// ============================================================

export const isMetaPixelAvailable = () => {
  return (
    isBrowser() &&
    typeof window.fbq === "function" &&
    window.fbq.loaded === true
  );
};

// ============================================================
// SENSITIVE PAYMENT URL PROTECTION
// ============================================================

const SENSITIVE_PAYMENT_PATHS = [
  "/payment/success",
  "/ebook/adk/payment/success",
];

const isSensitivePaymentUrl = () => {
  if (!isBrowser()) {
    return false;
  }

  const pathname =
    window.location.pathname;

  const params =
    new URLSearchParams(
      window.location.search
    );

  const sensitivePath =
    SENSITIVE_PAYMENT_PATHS.some(
      (path) =>
        pathname === path ||
        pathname.startsWith(`${path}/`)
    );

  const hasSensitiveParams =
    params.has("token") ||
    params.has("access_token") ||
    params.has("pdf");

  return (
    sensitivePath ||
    hasSensitiveParams
  );
};

// ============================================================
// BASE META EVENT
// ============================================================

const sendMetaEvent = (
  eventName,
  data = {},
  eventId = null
) => {
  if (!isMetaPixelAvailable()) {
    debugWarn(
      `${eventName} skipped: Pixel unavailable`
    );

    return false;
  }

  try {
    if (eventId) {
      window.fbq(
        "track",
        eventName,
        data,
        {
          eventID: String(eventId),
        }
      );
    } else {
      window.fbq(
        "track",
        eventName,
        data
      );
    }

    debugLog(
      `${eventName} dispatched`,
      {
        eventId,
        data,
      }
    );

    return true;
  } catch (error) {
    console.error(
      `[Meta Pixel] ${eventName} error:`,
      error
    );

    return false;
  }
};

// ============================================================
// 1. PAGE VIEW
// ============================================================

export const trackPageView = () => {
  // Prevent sending sensitive payment access
  // tokens to Meta in the page URL.
  if (isSensitivePaymentUrl()) {
    debugLog(
      "PageView skipped on sensitive payment URL"
    );

    return false;
  }

  return sendMetaEvent(
    "PageView"
  );
};

// ============================================================
// 2. VIEW CONTENT
// ============================================================

export const trackViewContent = (book) => {
  const bookId = String(
    book?.id || ""
  ).trim();

  const amount =
    normalizeAmount(book?.price);

  const currency =
    normalizeCurrency(book?.currency);

  if (
    !bookId ||
    amount === null ||
    !currency
  ) {
    debugWarn(
      "ViewContent skipped: invalid book",
      {
        hasBookId: Boolean(bookId),
        validAmount: amount !== null,
        validCurrency: Boolean(currency),
      }
    );

    return false;
  }

  return sendMetaEvent(
    "ViewContent",
    {
      content_ids: [bookId],

      content_name:
        String(book?.title || ""),

      content_type: "product",

      value: amount,

      currency,

      // Campaign / ad ids when the visitor came from a Meta ad
      ...getCampaignParams("meta"),
    }
  );
};

// ============================================================
// 3. INITIATE CHECKOUT
// ============================================================

export const trackInitiateCheckout = (
  book
) => {
  const bookId = String(
    book?.id || ""
  ).trim();

  const amount =
    normalizeAmount(book?.price);

  const currency =
    normalizeCurrency(book?.currency);

  if (
    !bookId ||
    amount === null ||
    !currency
  ) {
    debugWarn(
      "InitiateCheckout skipped: invalid book"
    );

    return false;
  }

  return sendMetaEvent(
    "InitiateCheckout",
    {
      content_ids: [bookId],

      content_type: "product",

      num_items: 1,

      value: amount,

      currency,

      ...getCampaignParams("meta"),
    }
  );
};

// ============================================================
// 4. PURCHASE
// ============================================================
//
// Expected input:
//
// trackPurchase({
//   orderId: "CF123456789",
//   amount: 249,
//   currency: "INR",
//   bookIds: ["book-id-1"]
// });
//
// IMPORTANT:
// Call this only after obtaining a verified
// paid-order result from the backend.
//
// The function does not validate payment status.
// Payment verification belongs to the caller.
//
// ============================================================

export const trackPurchase = (order) => {
  // ----------------------------------------------------------
  // VALIDATE ORDER
  // ----------------------------------------------------------

  const orderId = String(
    order?.orderId || ""
  ).trim();

  const amount =
    normalizeAmount(order?.amount);

  const currency =
    normalizeCurrency(
      order?.currency
    );

  const bookIds =
    normalizeBookIds(
      order?.bookIds
    );

  // ----------------------------------------------------------
  // META-ONLY GATE
  //
  // Purchase is reported only for orders the backend recorded
  // as coming from a Meta ad. Organic, direct and other-platform
  // sales are never sent to Meta.
  // ----------------------------------------------------------

  const attribution =
    order?.attribution || {};

  if (attribution.platform !== "meta") {
    debugLog(
      "Purchase skipped: order is not from a Meta ad",
      {
        platform:
          attribution.platform ||
          "unknown",
      }
    );

    return false;
  }

  const validOrder =
    Boolean(orderId) &&
    amount !== null &&
    amount > 0 &&
    Boolean(currency) &&
    bookIds.length > 0;

  if (!validOrder) {
    debugWarn(
      "Purchase skipped: invalid order",
      {
        hasOrderId:
          Boolean(orderId),

        validAmount:
          amount !== null &&
          amount > 0,

        validCurrency:
          Boolean(currency),

        bookCount:
          bookIds.length,
      }
    );

    return false;
  }

  // ----------------------------------------------------------
  // CHECK PIXEL
  // ----------------------------------------------------------

  if (!isMetaPixelAvailable()) {
    debugWarn(
      "Purchase skipped: Meta Pixel not loaded"
    );

    return false;
  }

  // ----------------------------------------------------------
  // DEDUPLICATION
  // ----------------------------------------------------------

  const storage =
    getStorage();

  const storageKey =
    `${PURCHASE_STORAGE_PREFIX}${orderId}`;

  const lockKey =
    `${PURCHASE_LOCK_PREFIX}${orderId}`;

  const eventId =
    `purchase_${orderId}`;

  // Existing legacy marker is intentionally
  // respected to avoid replaying real purchases.
  const legacyStorageKey =
    `meta_purchase_${orderId}`;

  try {
    if (storage) {
      const legacyAttempt =
        storage.getItem(
          legacyStorageKey
        );

      if (legacyAttempt) {
        debugWarn(
          "Purchase skipped: legacy attempt exists",
          {
            orderId,
          }
        );

        return false;
      }

      const existingAttempt =
        storage.getItem(
          storageKey
        );

      if (existingAttempt) {
        debugWarn(
          "Purchase skipped: previously attempted",
          {
            orderId,
          }
        );

        return false;
      }

      // Prevent rapid duplicate calls from
      // React effects or multiple components.
      const existingLock =
        storage.getItem(lockKey);

      if (existingLock) {
        const lockTime =
          Number(existingLock);

        if (
          Number.isFinite(lockTime) &&
          Date.now() - lockTime <
            PURCHASE_LOCK_DURATION
        ) {
          debugWarn(
            "Purchase skipped: active dispatch lock",
            {
              orderId,
            }
          );

          return false;
        }
      }

      storage.setItem(
        lockKey,
        String(Date.now())
      );
    }
  } catch (error) {
    debugWarn(
      "Purchase storage check unavailable"
    );
  }

  // ----------------------------------------------------------
  // BUILD META PURCHASE PAYLOAD
  // ----------------------------------------------------------

  const payload = {
    value: amount,

    currency,

    content_ids: bookIds,

    content_type: "product",

    content_name:
      String(order?.title || ""),

    contents: bookIds.map((id) => ({
      id,
      quantity: 1,
    })),

    num_items: bookIds.length,
  };

  // Campaign ids come from the stored order, not the browser,
  // so they survive the payment-gateway redirect.
  if (attribution.campaignId)
    payload.campaign_id = attribution.campaignId;

  if (attribution.adsetId)
    payload.adset_id = attribution.adsetId;

  if (attribution.adId)
    payload.ad_id = attribution.adId;

  if (attribution.utmCampaign)
    payload.utm_campaign = attribution.utmCampaign;

  // ----------------------------------------------------------
  // SEND PURCHASE EVENT
  // ----------------------------------------------------------

  let dispatched = false;

  try {
    dispatched = sendMetaEvent(
      "Purchase",
      payload,
      eventId
    );

    if (dispatched && storage) {
      try {
        storage.setItem(
          storageKey,
          JSON.stringify({
            status: "attempted",
            eventId,
            amount,
            currency,
            attemptedAt:
              new Date().toISOString(),
          })
        );
      } catch (error) {
        debugWarn(
          "Purchase attempt could not be persisted"
        );
      }
    }
  } catch (error) {
    console.error(
      "[Meta Purchase] Dispatch failed:",
      error
    );

    dispatched = false;
  } finally {
    if (storage) {
      try {
        storage.removeItem(
          lockKey
        );
      } catch {
        // Storage unavailable.
      }
    }
  }

  if (IS_DEV) {
    console.log(
      "[Meta Purchase] Dispatch result:",
      {
        dispatched,
        amount,
        currency,
        bookCount: bookIds.length,
        eventId,
      }
    );
  }

  // This result only confirms that fbq()
  // ran without throwing an exception.
  // It does not guarantee server receipt.
  return dispatched;
};

// ============================================================
// OPTIONAL DEBUGGING HELPERS
// ============================================================

export const getMetaPixelStatus = () => {
  if (!isBrowser()) {
    return {
      available: false,
      reason: "Not running in browser",
    };
  }

  return {
    pixelId: META_PIXEL_ID,

    available:
      isMetaPixelAvailable(),

    fbqType:
      typeof window.fbq,

    loaded:
      Boolean(window.fbq?.loaded),

    sensitivePage:
      isSensitivePaymentUrl(),
  };
};

export const getPurchaseTrackingStatus = (
  orderId
) => {
  const id = String(
    orderId || ""
  ).trim();

  if (!id) {
    return {
      status: "invalid_order",
    };
  }

  const storage = getStorage();

  if (!storage) {
    return {
      status: "storage_unavailable",
    };
  }

  try {
    const legacyKey =
      `meta_purchase_${id}`;

    const currentKey =
      `${PURCHASE_STORAGE_PREFIX}${id}`;

    const legacy =
      storage.getItem(
        legacyKey
      );

    const current =
      storage.getItem(
        currentKey
      );

    if (legacy) {
      return {
        status: "previously_attempted",
        version: "legacy",
      };
    }

    if (current) {
      let details = null;

      try {
        details =
          JSON.parse(current);
      } catch {
        details = null;
      }

      return {
        status: "previously_attempted",
        version: "v2",
        details,
      };
    }

    return {
      status: "not_attempted",
    };
  } catch {
    return {
      status: "storage_unavailable",
    };
  }
};