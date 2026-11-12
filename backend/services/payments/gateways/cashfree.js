import axios from "axios";
import crypto from "crypto";
import { PaymentError } from "../errors.js";

/*
  Cashfree: server creates an order -> the browser opens Cashfree's JS checkout with payment_session_id
  and is returned to `returnUrl` afterwards.  Webhooks need an https notify url.
*/
const http = (c, method, path, data) =>
  axios({
    method,
    url: `${c.baseUrl}${path}`,
    data,
    timeout: 15000,
    headers: {
      "x-client-id": c.appId,
      "x-client-secret": c.secret,
      "x-api-version": c.apiVersion,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }).then((r) => r.data);

const rupees = (paise) => Number((paise / 100).toFixed(2));
const withOrderPlaceholder = (url) => (url.includes("order_id=") ? url : `${url}${url.includes("?") ? "&" : "?"}order_id={order_id}`);

export default {
  id: "cashfree",
  label: "Cashfree",

  async createOrder({ credentials: c, mode }, req) {
    const phone = req.customer.phone;
    const body = {
      order_id: req.orderRef,
      order_amount: rupees(req.amountPaise),
      order_currency: req.currency,
      customer_details: {
        customer_id: String(req.customer.id).replace(/[^A-Za-z0-9_-]/g, "").slice(0, 50) || "guest",
        customer_name: String(req.customer.name || "Customer").slice(0, 100),
        customer_email: req.customer.email,
        customer_phone: phone,
      },
      order_meta: {
        return_url: withOrderPlaceholder(req.returnUrl),
        // Cashfree only accepts an https notify_url; on localhost the return trip + status check settle the order.
        ...(String(req.webhookUrl || "").startsWith("https://") ? { notify_url: req.webhookUrl } : {}),
      },
      order_note: String(req.description || "").slice(0, 200),
      ...(req.notes && Object.keys(req.notes).length ? { order_tags: stringTags(req.notes) } : {}),
    };
    const data = await http(c, "post", "/orders", body);
    if (!data?.payment_session_id) throw new PaymentError(502, "The payment provider did not return a session.", "GATEWAY_ERROR", data);
    return {
      gatewayOrderId: req.orderRef,
      checkout: { type: "cashfree", paymentSessionId: data.payment_session_id, environment: c.sdkMode },
    };
  },

  async fetchStatus({ credentials: c }, { gatewayOrderId }) {
    const list = await http(c, "get", `/orders/${encodeURIComponent(gatewayOrderId)}/payments`);
    const payments = Array.isArray(list) ? list : [];
    const hit = payments.find((p) => String(p?.payment_status || "").toUpperCase() === "SUCCESS");
    if (hit) return { status: "paid", paymentId: String(hit.cf_payment_id), amountPaise: Math.round(Number(hit.payment_amount) * 100), currency: String(hit.payment_currency || "").toUpperCase(), method: hit.payment_group ? String(hit.payment_group) : Object.keys(hit.payment_method || {})[0] || null, raw: { payments } };
    const failed = payments.length && payments.every((p) => ["FAILED", "USER_DROPPED", "CANCELLED"].includes(String(p?.payment_status || "").toUpperCase()));
    return { status: failed ? "failed" : "pending" };
  },

  parseWebhook({ credentials: c }, { rawBody, headers }) {
    const signature = headers["x-webhook-signature"];
    const timestamp = headers["x-webhook-timestamp"];
    if (!rawBody || !signature || !timestamp) return { valid: false };
    const expected = Buffer.from(crypto.createHmac("sha256", c.secret).update(`${timestamp}${rawBody}`).digest("base64"));
    const got = Buffer.from(String(signature));
    if (expected.length !== got.length || !crypto.timingSafeEqual(expected, got)) return { valid: false };
    let evt;
    try { evt = JSON.parse(rawBody); } catch { return { valid: false }; }
    const id = evt?.data?.order?.order_id;
    const ok = String(evt?.data?.payment?.payment_status || "").toUpperCase() === "SUCCESS";
    return id && ok ? { valid: true, gatewayOrderId: id } : { valid: true, ignore: true };
  },

  async refund({ credentials: c }, { gatewayOrderId, amountPaise, refundId, note }) {
    const data = await http(c, "post", `/orders/${encodeURIComponent(gatewayOrderId)}/refunds`, {
      refund_amount: rupees(amountPaise),
      refund_id: refundId, // idempotent: the same id can't refund twice
      refund_note: String(note || "Refund").slice(0, 100),
      refund_speed: "STANDARD",
    });
    return { refundId: String(data.cf_refund_id ?? data.refund_id) };
  },

  describeError: (e) => e?.response?.data?.message || e?.response?.data?.error_description || e?.message || "unknown error",
  httpStatus: (e) => e?.response?.status,
};

const stringTags = (notes) =>
  Object.fromEntries(Object.entries(notes).slice(0, 15).map(([k, v]) => [String(k).slice(0, 255), String(v).slice(0, 255)]));
