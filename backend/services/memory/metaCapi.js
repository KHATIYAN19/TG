import MemoryOrder from "../../models/memory/MemoryOrder.js";
import User from "../../models/User.js";
import { capiEnabled, isMetaAttributed, phoneDigits, sendPurchaseEvent } from "../metaCapi.js";

/*
  MEMORIES: server side Meta Purchase. The sending, hashing and the "Meta ads sales only" rule live in services/metaCapi.js.
  The browser pixel (client/src/memories/metaTracking.js) uses the same event_id (`purchase_<orderId>`), so Meta dedupes the pair.
*/
export { capiEnabled };

/** Request context stored on the order at checkout (the webhook that settles it has none of this). */
export const captureRequestContext = (req, returnOrigin) => ({
  clientIp: String(req.ip || "").slice(0, 64),
  clientUserAgent: String(req.get?.("user-agent") || "").slice(0, 400),
  eventSourceUrl: returnOrigin ? `${returnOrigin}/memories/app/pay` : "",
});

/** Send Purchase for a paid order, once. Safe to call repeatedly. */
export const sendPurchase = async (order) => {
  try {
    if (!capiEnabled() || !order || order.metaPurchaseSentAt || !isMetaAttributed(order.attribution)) return false;
    const user = await User.findById(order.user).select("email mobile countryCode name").lean();
    const sent = await sendPurchaseEvent({
      eventId: `purchase_${order._id}`,
      value: Number(order.amount) / 100,
      currency: order.currency || "INR",
      contentIds: ["memories_page_credit"],
      contentName: "Memories page credit",
      paidAt: order.paidAt,
      attribution: order.attribution,
      ip: order.clientIp,
      userAgent: order.clientUserAgent,
      url: order.eventSourceUrl,
      user: { email: user?.email, phone: phoneDigits(user?.mobile, user?.countryCode), name: user?.name, externalId: order.user },
    });
    if (sent) await MemoryOrder.updateOne({ _id: order._id }, { metaPurchaseSentAt: new Date() });
    return sent;
  } catch (e) {
    console.error(`[memory] Meta CAPI Purchase error for order ${order?._id}:`, e?.message || e);
    return false;
  }
};
