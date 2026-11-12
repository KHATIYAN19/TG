import crypto from "crypto";
import { PaymentError } from "../errors.js";

/* PayU: the browser auto-submits a form to PayU; PayU redirects (POST) back to `returnUrl`. */
const sha512 = (v) => crypto.createHash("sha512").update(String(v)).digest("hex");
const eq = (a, b) => {
  const x = Buffer.from(String(a || "").toLowerCase());
  const y = Buffer.from(String(b || "").toLowerCase());
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
};

export default {
  id: "payu",
  label: "PayU",

  async createOrder({ credentials: c }, req) {
    const txnid = req.orderRef;
    const amount = (req.amountPaise / 100).toFixed(2);
    const fields = {
      key: c.key,
      txnid,
      amount,
      productinfo: String(req.description || "Payment").slice(0, 100),
      firstname: String(req.customer.name || "Customer").slice(0, 60),
      email: req.customer.email,
      phone: req.customer.phone,
      surl: req.returnUrl,
      furl: req.returnUrl,
      udf1: "", udf2: "", udf3: "", udf4: "", udf5: "",
    };
    fields.hash = sha512(`${c.key}|${txnid}|${amount}|${fields.productinfo}|${fields.firstname}|${fields.email}|||||||||||${c.salt}`);
    return { gatewayOrderId: txnid, checkout: { type: "form_post", url: c.paymentUrl, fields } };
  },

  async fetchStatus({ credentials: c }, { gatewayOrderId }) {
    const hash = sha512(`${c.key}|verify_payment|${gatewayOrderId}|${c.salt}`);
    const res = await fetch(c.verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ key: c.key, command: "verify_payment", var1: gatewayOrderId, hash }).toString(),
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    if (!res.ok) throw new PaymentError(502, "The payment provider could not be reached.", "GATEWAY_ERROR", `HTTP ${res.status}`);
    let t;
    try { t = JSON.parse(text)?.transaction_details?.[gatewayOrderId]; } catch { throw new PaymentError(502, "Invalid response from the payment provider.", "GATEWAY_ERROR"); }
    if (!t) return { status: "pending" };
    const st = String(t.status || "").toLowerCase();
    if (st === "success") {
      return { status: "paid", paymentId: String(t.mihpayid || t.txnid || gatewayOrderId), amountPaise: Math.round(Number(t.amt ?? t.transaction_amount) * 100), currency: "INR", method: t.mode || null, raw: t };
    }
    return { status: ["failure", "failed", "bounced", "dropped"].includes(st) ? "failed" : "pending" };
  },

  /* PayU posts the result to returnUrl. This only reads the id and checks the reverse hash; the amount/status still come from fetchStatus. */
  parseCallback({ credentials: c }, body = {}) {
    const { status = "", udf1 = "", udf2 = "", udf3 = "", udf4 = "", udf5 = "", email = "", firstname = "", productinfo = "", amount = "", txnid = "", key = "", hash = "" } = body;
    const extra = body.additionalCharges || body.additional_charges;
    let s = `${c.salt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    if (extra) s = `${extra}|${s}`;
    return { gatewayOrderId: txnid || null, signatureValid: eq(hash, sha512(s)) };
  },

  async refund() {
    throw new PaymentError(501, "Refunds for PayU are handled from the PayU dashboard.", "REFUND_UNSUPPORTED");
  },

  describeError: (e) => e?.message || "unknown error",
  httpStatus: () => undefined,
};
