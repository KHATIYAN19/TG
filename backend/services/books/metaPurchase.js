import Order from "../../models/Order.js";
import { FRONTEND_URL } from "../../config/urls.js";
import { capiEnabled, isMetaAttributed, phoneDigits, sendPurchaseEvent } from "../metaCapi.js";

/*
  BOOKS: server side Meta Purchase, sent when settleBookOrder marks an order PAID (every gateway, webhook included).
  Uses the attribution, IP and browser details saved on the order at checkout, and the same event_id as the browser pixel
  (`purchase_<orderId>`, client/src/lib/metaPixel.js) so Meta counts the sale once. Only Meta-ad sales are sent.
*/
export const sendBookPurchase = async (order) => {
  try {
    const attribution = order?.metadata?.attribution;
    if (!capiEnabled() || !order || order.metadata?.metaPurchaseSentAt || !isMetaAttributed(attribution)) return false;

    // same ids the browser sends: every purchased book, else the single book
    const bookIds = (order.purchasedBookIds?.length ? order.purchasedBookIds : [order.bookId]).map(String);
    const sent = await sendPurchaseEvent({
      eventId: `purchase_${order.orderId}`,
      value: Number(order.payment?.amount),
      currency: order.book?.currency || "INR",
      contentIds: bookIds,
      contentName: order.book?.title,
      paidAt: order.payment?.paidAt,
      attribution,
      ip: order.metadata?.ipAddress,
      userAgent: order.metadata?.userAgent,
      url: `${FRONTEND_URL}${attribution.landingPath && attribution.landingPath.startsWith("/") ? attribution.landingPath : ""}`,
      user: { email: order.customer?.email, phone: phoneDigits(order.customer?.phone), name: order.customer?.name, externalId: order.customer?.email },
    });
    if (sent) await Order.updateOne({ _id: order._id }, { $set: { "metadata.metaPurchaseSentAt": new Date() } });
    return sent;
  } catch (e) {
    console.error(`[books] Meta CAPI Purchase error for order ${order?.orderId}:`, e?.message || e);
    return false;
  }
};
