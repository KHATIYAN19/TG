/*
  MEMORIES: META PIXEL EVENTS (browser side only).
  The pixel itself is initialised once in index.html and PageView is sent by MetaPageTracker, so this file only sends the extra events:

    ViewContent         the landing page was opened
    MemoriesCtaClick    (custom) a "Create a page" button was clicked
    CompleteRegistration  signup finished (email OTP verified, or Google signup)
    InitiateCheckout    "Pay" was pressed
    Purchase            the SERVER confirmed the order is paid (once per order)

  Every call is safe: no pixel, blocked storage or a bad value never throws or slows the page.
*/
import { getCampaignParams } from "../lib/attribution";

const CONTENT_ID = "memories_page_credit";
const CONTENT_NAME = "Memories page credit";
const PENDING_KEY = "mem_meta_pending_order";
const PURCHASE_KEY = "mem_meta_purchase_";

const isLocal = () => typeof window !== "undefined" && /^(localhost|127\.0\.0\.1|\[::1\]|.*\.local)$/.test(window.location.hostname);

const ready = () => typeof window !== "undefined" && typeof window.fbq === "function";

const send = (kind, name, data = {}, eventId) => {
  // Local development: log what WOULD be sent, but never send anything to Meta.
  if (isLocal()) {
    console.info("[Memories Meta Pixel] (local, not sent)", name, data, eventId || "");
    return true;
  }
  if (!ready()) return false;
  try {
    const payload = { ...data, ...getCampaignParams("meta") };
    if (eventId) window.fbq(kind, name, payload, { eventID: String(eventId) });
    else window.fbq(kind, name, payload);
    return true;
  } catch { return false; }
};

const store = (fn) => { try { return fn(window.localStorage); } catch { return null; } };

const money = (price) => {
  const value = Number(price);
  return Number.isFinite(value) && value >= 0 ? value : null;
};

export const trackLandingView = () => send("track", "ViewContent", { content_name: "Memories landing", content_type: "product" });

export const trackCtaClick = (label) => send("trackCustom", "MemoriesCtaClick", { label: String(label || "").slice(0, 60) });

export const trackSignup = (method) => send("track", "CompleteRegistration", { content_name: "Memories signup", status: true, method });

export const trackCheckoutStart = ({ orderId, price, gateway } = {}) => {
  const value = money(price);
  if (orderId && value !== null) store((s) => s.setItem(PENDING_KEY, JSON.stringify({ orderId: String(orderId), value })));
  if (value === null) return false;
  return send("track", "InitiateCheckout", {
    content_ids: [CONTENT_ID], content_name: CONTENT_NAME, content_type: "product", num_items: 1, value, currency: "INR", gateway,
  });
};

/* Call only after the server says the order is paid. `price` is optional: it falls back to what checkout stored. */
export const trackPaid = (orderId, price) => {
  const id = String(orderId || "").trim();
  if (!id || store((s) => s.getItem(PURCHASE_KEY + id))) return false;

  let value = money(price);
  if (value === null) {
    const pending = store((s) => JSON.parse(s.getItem(PENDING_KEY) || "null"));
    if (pending?.orderId === id) value = money(pending.value);
  }
  if (value === null || value <= 0) return false; // free credits and codes are not purchases

  const sent = send("track", "Purchase", {
    content_ids: [CONTENT_ID], content_name: CONTENT_NAME, content_type: "product", contents: [{ id: CONTENT_ID, quantity: 1 }], num_items: 1, value, currency: "INR",
  }, `purchase_${id}`);

  if (sent) store((s) => { s.setItem(PURCHASE_KEY + id, "1"); s.removeItem(PENDING_KEY); });
  return sent;
};
