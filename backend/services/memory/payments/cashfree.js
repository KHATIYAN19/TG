import { CASHFREE_ENV } from "../../../config/cashfree.js";
import { gatewayPhone } from "../../../utils/phone.js";
import { createCashfreeOrderRequest, fetchCashfreePayments, getCashfreeError, verifyCashfreeWebhookSignature } from "../../../utils/cashfree.js";
import { PaymentError } from "./errors.js";

/* Cashfree: server creates an order -> client opens Cashfree JS checkout with payment_session_id. */
export default {
  id: "cashfree",
  label: "Cashfree (UPI, cards, netbanking)",
  needsPublicUrl: true, // return/notify URLs must be reachable by the gateway (set BACKEND_URL)
  isConfigured: () => Boolean(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY && ["production", "sandbox"].includes(CASHFREE_ENV)),

  async createCheckout({ order, user, amountPaise, urls }) {
    // The number comes from the account (saved at sign-up), never from the payment form.
    const phone = gatewayPhone(user);
    if (!phone) throw new PaymentError(400, "There is no mobile number on your account. Please contact support.", "PHONE_UNAVAILABLE");
    const gatewayOrderId = `MEM_${order._id}`;
    let cf;
    try {
      cf = await createCashfreeOrderRequest({
        order_id: gatewayOrderId,
        order_amount: Number((amountPaise / 100).toFixed(2)),
        order_currency: "INR",
        customer_details: { customer_id: String(user._id), customer_name: user.name, customer_email: user.email, customer_phone: phone },
        // Cashfree only accepts an https notify_url. On localhost there is none, and that is fine: the return trip and the status check settle the order.
        order_meta: { return_url: `${urls.callback("cashfree")}&order_id={order_id}`, ...(String(urls.webhook("cashfree")).startsWith("https://") ? { notify_url: urls.webhook("cashfree") } : {}) },
        order_note: "Memory page",
      });
    } catch (e) {
      const detail = getCashfreeError(e);
      console.error("[memory] cashfree create failed:", detail);
      // While developing, say what Cashfree said. In production keep it generic.
      const why = process.env.NODE_ENV === "production" ? "" : ` (Cashfree: ${detail?.message || detail?.error_description || JSON.stringify(detail)})`.slice(0, 220);
      throw new PaymentError(502, `Payment provider error. Please try again.${why}`, "GATEWAY_ERROR");
    }
    if (!cf?.payment_session_id) throw new PaymentError(502, "Payment provider did not return a session.", "GATEWAY_ERROR");
    return { gatewayOrderId, checkout: { type: "cashfree", paymentSessionId: cf.payment_session_id, environment: CASHFREE_ENV } };
  },

  async fetchStatus(order) {
    const payments = await fetchCashfreePayments(order.gatewayOrderId);
    const hit = payments.find((p) => String(p?.payment_status || "").toUpperCase() === "SUCCESS");
    return hit
      ? { paid: true, paymentId: String(hit.cf_payment_id), amountPaise: Math.round(Number(hit.payment_amount) * 100) }
      : { paid: false };
  },

  parseWebhook({ rawBody, headers }) {
    if (!verifyCashfreeWebhookSignature({ rawBody, signature: headers["x-webhook-signature"], timestamp: headers["x-webhook-timestamp"] })) return { valid: false };
    let evt;
    try { evt = JSON.parse(rawBody); } catch { return { valid: false }; }
    const id = evt?.data?.order?.order_id;
    const ok = String(evt?.data?.payment?.payment_status || "").toUpperCase() === "SUCCESS";
    return id && ok ? { valid: true, gatewayOrderId: id } : { valid: true, ignore: true };
  },
};
