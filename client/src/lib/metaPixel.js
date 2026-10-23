
/**
 * Target Trek - Meta Pixel Tracking
 * Pixel ID: 965336112563401
 *
 * Pixel initialized in index.html.
 * Do not initialize it again here.
 */

const sendMetaEvent = (eventName, data = {}, eventId = null) => {
  if (
    typeof window === "undefined" ||
    typeof window.fbq !== "function"
  ) {
    return false;
  }

  try {
    if (eventId) {
      window.fbq("track", eventName, data, {
        eventID: eventId,
      });
    } else {
      window.fbq("track", eventName, data);
    }
    return true;
  } catch (error) {
    console.error("Meta Pixel tracking error:", error);
    return false;
  }
};

// 1. PageView
export const trackPageView = () => {
  return sendMetaEvent("PageView");
};

// 2. ViewContent
export const trackViewContent = (book) => {
  if (!book?.id || book.price == null) return false;

  return sendMetaEvent("ViewContent", {
    content_ids: [String(book.id)],
    content_name: book.title || "",
    content_type: "product",
    value: Number(book.price),
    currency: book.currency || "INR",
  });
};

// 3. InitiateCheckout
export const trackInitiateCheckout = (book) => {
  if (!book?.id || book.price == null) return false;

  return sendMetaEvent("InitiateCheckout", {
    content_ids: [String(book.id)],
    content_type: "product",
    num_items: 1,
    value: Number(book.price),
    currency: book.currency || "INR",
  });
};

// 4. Purchase
export const trackPurchase = (order) => {
  if (
    !order?.orderId ||
    !Number.isFinite(Number(order.amount)) ||
    Number(order.amount) < 0 ||
    !Array.isArray(order.bookIds) ||
    !order.bookIds.length
  ) {
    return false;
  }

  const storageKey = `meta_purchase_${order.orderId}`;

  try {
    if (localStorage.getItem(storageKey)) {
      return false;
    }
  } catch (error) {
    // Tracking can continue if storage is unavailable.
  }

  const sent = sendMetaEvent(
    "Purchase",
    {
      value: Number(order.amount),
      currency: order.currency || "INR",
      content_ids: order.bookIds.map(String),
      content_type: "product",
      num_items: order.bookIds.length,
    },
    String(order.orderId)
  );

  if (sent) {
    try {
      localStorage.setItem(storageKey, "1");
    } catch (error) {
      // Storage may be blocked.
    }
  }

  return sent;
};
