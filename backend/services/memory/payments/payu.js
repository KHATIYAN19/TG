import { PAYU_KEY, PAYU_SALT, PAYU_PAYMENT_URL } from "../../../config/payu.js";
import { gatewayPhone } from "../../../utils/phone.js";
import { PaymentError } from "./errors.js";
import { generatePaymentHash, generateTransactionId, verifyTransactionWithPayU } from "../../../utils/payu.js";

/* PayU: client auto-submits a form to PayU; PayU redirects the browser back to our callback URL. */
export default {
  id: "payu",
  label: "PayU (UPI, cards, netbanking)",
  needsPublicUrl: true, // return/notify URLs must be reachable by the gateway (set BACKEND_URL)
  isConfigured: () => Boolean(PAYU_KEY && PAYU_SALT),

  async createCheckout({ order, user, amountPaise, urls }) {
    const gatewayOrderId = generateTransactionId();
    const amount = (amountPaise / 100).toFixed(2);
    if (!gatewayPhone(user)) throw new PaymentError(400, "There is no mobile number on your account. Please contact support.", "PHONE_UNAVAILABLE");
    const fields = {
      key: PAYU_KEY,
      txnid: gatewayOrderId,
      amount,
      productinfo: "Memory page",
      firstname: String(user.name || "Customer").slice(0, 60),
      email: user.email,
      phone: gatewayPhone(user),
      surl: urls.callback("payu"),
      furl: urls.callback("payu"),
      udf1: "", udf2: "", udf3: "", udf4: "", udf5: "",
    };
    fields.hash = generatePaymentHash({ key: PAYU_KEY, txnid: fields.txnid, amount, productinfo: fields.productinfo, firstname: fields.firstname, email: fields.email, salt: PAYU_SALT });
    return { gatewayOrderId, checkout: { type: "form_post", url: PAYU_PAYMENT_URL, fields } };
  },

  async fetchStatus(order) {
    const t = await verifyTransactionWithPayU(order.gatewayOrderId);
    if (!t || String(t.status).toLowerCase() !== "success") return { paid: false };
    return { paid: true, paymentId: String(t.mihpayid || t.txnid || order.gatewayOrderId), amountPaise: Math.round(Number(t.amt ?? t.transaction_amount) * 100) };
  },

  /* PayU posts the txnid back to the callback; we still confirm through the verify API. */
  parseCallback(body = {}) {
    return { gatewayOrderId: body.txnid || null };
  },
};
