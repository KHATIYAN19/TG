import { BACKEND_URL } from "../../config/urls.js";
import { gatewayPhone } from "../../utils/phone.js";
import { createPayment, verifyPayment, refundPayment, resolvePayment, pickGateway, PaymentError } from "../payments/index.js";
import { ArenaError } from "./errors.js";

/*
  PRE ARENA  ->  CENTRAL PAYMENT PROCESSOR
  ----------------------------------------
  The arena keeps its own small interface (createOrder / confirmPayment / findPaidPayment / refund), but it no
  longer talks to any gateway itself: every call goes to services/payments.

  Choose the gateway in .env: ARENA_PAYMENT_GATEWAY=cashfree|razorpay (falls back to PAYMENT_GATEWAY).
  Test or live follows the keys (CASHFREE_ENV, rzp_ key).
*/
const PRODUCT = "ARENA";

export const gatewayName = () => resolvePayment(PRODUCT).gateway;

/* Where redirect gateways (Cashfree, PayU) send the buyer back: a backend route that forwards to the join page (PayU posts, a page can't receive that). */
export const RETURN_URL = `${BACKEND_URL}/api/arena/payments/return`;

/* Payment errors -> the arena's own error type, with a message that is safe to show. */
const arena = async (fn) => {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ArenaError) throw e;
    if (e instanceof PaymentError) {
      const unavailable = e.code === "GATEWAY_NOT_CONFIGURED" || e.status >= 500;
      throw new ArenaError(e.status === 400 ? 400 : unavailable ? 503 : e.status, unavailable ? "PAYMENT_UNAVAILABLE" : e.code, unavailable ? "We couldn't start the payment right now. Please try again in a few minutes." : e.message);
    }
    throw e;
  }
};

const storedGateway = (entry) => entry.payment?.gateway || gatewayName();

export const gateway = {
  name: gatewayName,

  createOrder: ({ entry, user, gateway: preferred }) =>
    arena(async () => {
      const description = "Prep Buddy Arena – one-time entry";
      const p = await createPayment({
        product: PRODUCT,
        gateway: pickGateway(PRODUCT, preferred),
        orderRef: `ARENA_${entry._id}`, // unique per entry
        amountPaise: entry.paidPaise,
        customer: { id: `U${String(user._id)}`, name: user.name || "Member", email: user.email, phone: gatewayPhone(user) || "9999999999", rawPhone: user.mobile },
        returnUrl: RETURN_URL,
        description,
        notes: { entryId: String(entry._id), userId: String(user._id), purpose: "prep-buddy-arena" },
      });
      // The processor's checkout descriptor goes to the browser as is (`type` says what to open).
      return { orderId: p.gatewayOrderId, checkout: { gateway: p.gateway, ...p.checkout } };
    }),

  /* Asks the gateway; for Razorpay the browser's signed result is checked too. */
  confirmPayment: ({ entry, paymentId, signature }) =>
    arena(async () => {
      const r = await verifyPayment({
        product: PRODUCT,
        gateway: storedGateway(entry),
        gatewayOrderId: entry.payment.orderId,
        expectedAmountPaise: entry.paidPaise,
        proof: paymentId || signature ? { paymentId, signature } : undefined,
      });
      if (r.reason === "SIGNATURE_MISMATCH") throw new ArenaError(400, "SIGNATURE_INVALID", "Payment verification failed");
      if (r.reason === "AMOUNT_MISMATCH" || r.reason === "ORDER_MISMATCH") throw new ArenaError(400, "PAYMENT_MISMATCH", "Payment details do not match this order");
      return r.status === "paid" ? { status: "paid", paymentId: r.paymentId } : { status: "pending", paymentId: r.paymentId || null };
    }),

  findPaidPayment: (entry) =>
    arena(async () => {
      if (!entry.payment?.orderId) return null;
      const r = await verifyPayment({ product: PRODUCT, gateway: storedGateway(entry), gatewayOrderId: entry.payment.orderId, expectedAmountPaise: entry.paidPaise });
      if (r.reason === "AMOUNT_MISMATCH") throw new ArenaError(400, "PAYMENT_MISMATCH", "Payment amount does not match this order");
      return r.status === "paid" ? { paymentId: r.paymentId } : null;
    }),

  refund: ({ entry, amountPaise }) =>
    arena(async () => {
      const r = await refundPayment({
        product: PRODUCT,
        gateway: storedGateway(entry),
        gatewayOrderId: entry.payment.orderId,
        paymentId: entry.payment.paymentId,
        amountPaise,
        refundId: `RF_${entry._id}`, // idempotent: the same entry can't be refunded twice
        note: "Arena cancellation (fee deducted)",
      });
      return r.refundId;
    }),

  /* Admin refunds show the gateway's own reason to the admin instead of a generic message. */
  adminRefund: async ({ entry, amountPaise, attemptId, note }) => {
    if (!entry.payment?.gateway) throw new ArenaError(400, "NOT_REFUNDABLE", "This payment has no gateway to refund through");
    try {
      const r = await refundPayment({
        product: PRODUCT,
        gateway: entry.payment.gateway,
        gatewayOrderId: entry.payment.orderId,
        paymentId: entry.payment.paymentId,
        amountPaise,
        refundId: attemptId,
        note: note || "Admin refund",
      });
      return r.refundId;
    } catch (error) {
      if (error instanceof ArenaError) throw error;
      throw new ArenaError(502, "REFUND_FAILED", `${entry.payment.gateway} could not process the refund: ${error?.detail || error?.message || "unknown error"}`);
    }
  },
};
