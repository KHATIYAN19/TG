import { createPayment, verifyPayment, parseWebhook, parseCallback, PaymentError as ProcessorError } from "../../payments/index.js";
import { credentialsFor, resolveMode } from "../../payments/config.js";
import { gatewayPhone } from "../../../utils/phone.js";
import { PaymentError } from "./errors.js";

/*
  MEMORIES -> CENTRAL PAYMENT PROCESSOR
  Every real gateway is the same thin adapter: all gateway logic lives in services/payments.
  Pick the gateway in .env: MEMORIES_PAYMENT_GATEWAY (or MEMORY_PAYMENT_GATEWAY) / PAYMENT_GATEWAY.
*/
const PRODUCT = "MEMORIES";

const asMemoryError = (e) => (e instanceof ProcessorError ? new PaymentError(e.status, e.message, e.code) : e);

const make = ({ id, label, needsPublicUrl, withClientVerify }) => {
  const adapter = {
    id,
    label,
    needsPublicUrl,
    isConfigured: () => Boolean(credentialsFor(id, resolveMode(PRODUCT, id))),

    async createCheckout({ order, user, amountPaise, urls }) {
      try {
        const p = await createPayment({
          product: PRODUCT,
          gateway: id,
          orderRef: `MEM_${order._id}`,
          amountPaise,
          customer: { id: String(user._id), name: user.name, email: user.email, phone: gatewayPhone(user), rawPhone: user.mobile },
          returnUrl: urls.callback(id),
          webhookUrl: urls.webhook(id),
          description: "Memory page",
          notes: { type: "memory_page", userId: String(order.user) },
        });
        return { gatewayOrderId: p.gatewayOrderId, checkout: p.checkout };
      } catch (e) {
        throw asMemoryError(e);
      }
    },

    /* The gateway's own answer, in the shape settleOrder expects. A wrong amount is passed through so settleOrder records AMOUNT_MISMATCH. */
    async fetchStatus(order) {
      const r = await verifyPayment({ product: PRODUCT, gateway: id, gatewayOrderId: order.gatewayOrderId, expectedAmountPaise: order.amount });
      if (r.status === "paid" || r.reason === "AMOUNT_MISMATCH") return { paid: true, paymentId: r.paymentId, amountPaise: r.amountPaise };
      // "failed" = the gateway says every attempt was declined or cancelled; anything else is simply not paid yet
      return r.status === "failed" ? { paid: false, failed: true, reason: r.reason || "GATEWAY_FAILED" } : { paid: false };
    },

    parseWebhook({ rawBody, headers }) {
      try {
        return parseWebhook({ product: PRODUCT, gateway: id, rawBody, headers });
      } catch {
        return { valid: false };
      }
    },

    parseCallback(body = {}) {
      try {
        return { gatewayOrderId: parseCallback({ product: PRODUCT, gateway: id, body }).gatewayOrderId };
      } catch {
        return { gatewayOrderId: null };
      }
    },
  };

  if (!needsPublicUrl) delete adapter.needsPublicUrl;
  if (id === "payu") delete adapter.parseWebhook; // PayU has no webhook; it posts back to the callback url
  if (id === "razorpay") delete adapter.parseCallback; // Razorpay returns through the signed browser callback

  /* Razorpay: the browser posts a signed result. Valid signature + captured at Razorpay = paid. */
  if (withClientVerify) {
    adapter.verifyClient = async (order, payload = {}) => {
      try {
        const r = await verifyPayment({ product: PRODUCT, gateway: id, gatewayOrderId: order.gatewayOrderId, expectedAmountPaise: order.amount, proof: payload });
        if (r.status === "paid") return { paid: true, paymentId: r.paymentId, amountPaise: r.amountPaise };
        if (r.reason === "AMOUNT_MISMATCH") return { paid: true, paymentId: r.paymentId, amountPaise: r.amountPaise };
        if (r.status === "pending") return { paid: false, pending: true };
        return { paid: false, reason: r.reason || "VERIFY_FAILED" };
      } catch (e) {
        console.error(`[memory] ${id} verify failed:`, e?.message);
        return { paid: false, pending: true }; // gateway unreachable: not a failure, ask again later
      }
    };
  }
  return adapter;
};

export const cashfreeAdapter = make({ id: "cashfree", label: "Cashfree (UPI, cards, netbanking)", needsPublicUrl: true });
export const razorpayAdapter = make({ id: "razorpay", label: "Razorpay (UPI, cards, netbanking)", needsPublicUrl: false, withClientVerify: true });
export const payuAdapter = make({ id: "payu", label: "PayU (UPI, cards, netbanking)", needsPublicUrl: true });
