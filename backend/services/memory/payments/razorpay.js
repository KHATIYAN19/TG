import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, getRazorpayClient } from "../../../config/razorpay.js";
import { createRazorpayOrder, verifyRazorpayPaymentSignature, verifyRazorpayWebhookSignature } from "../../../utils/razorpay.js";

/* Razorpay: client opens Razorpay Checkout, then posts the signed result back. */
export default {
  id: "razorpay",
  label: "Razorpay (UPI, cards, netbanking)",
  isConfigured: () => Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET),

  async createCheckout({ order, amountPaise }) {
    const rp = await createRazorpayOrder({
      amount: amountPaise,
      currency: "INR",
      receipt: `mem_${order._id}`,
      notes: { type: "memory_page", userId: String(order.user) },
    });
    return {
      gatewayOrderId: rp.id,
      checkout: { type: "razorpay", keyId: RAZORPAY_KEY_ID, orderId: rp.id, amount: amountPaise, currency: "INR" },
    };
  },

  /* browser callback: { razorpay_order_id, razorpay_payment_id, razorpay_signature } */
  verifyClient(order, payload = {}) {
    const ok =
      payload.razorpay_order_id === order.gatewayOrderId &&
      verifyRazorpayPaymentSignature({
        razorpayOrderId: payload.razorpay_order_id,
        razorpayPaymentId: payload.razorpay_payment_id,
        razorpaySignature: payload.razorpay_signature,
      });
    return ok ? { paid: true, paymentId: payload.razorpay_payment_id, amountPaise: order.amount } : { paid: false, reason: "SIGNATURE_MISMATCH" };
  },

  /* server-to-server truth */
  async fetchStatus(order) {
    const list = await getRazorpayClient().orders.fetchPayments(order.gatewayOrderId);
    const hit = (list?.items || []).find((p) => p.status === "captured");
    return hit ? { paid: true, paymentId: hit.id, amountPaise: Number(hit.amount) } : { paid: false };
  },

  /* POST /api/memories/payments/webhook/razorpay  (configure in the Razorpay dashboard) */
  parseWebhook({ rawBody, headers }) {
    if (!verifyRazorpayWebhookSignature({ rawBody, signature: headers["x-razorpay-signature"] })) return { valid: false };
    let evt;
    try { evt = JSON.parse(rawBody); } catch { return { valid: false }; }
    if (!["payment.captured", "order.paid"].includes(evt?.event)) return { valid: true, ignore: true };
    const gatewayOrderId = evt?.payload?.payment?.entity?.order_id || evt?.payload?.order?.entity?.id;
    return gatewayOrderId ? { valid: true, gatewayOrderId } : { valid: true, ignore: true };
  },
};
