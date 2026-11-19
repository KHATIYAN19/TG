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


/* ---- subscription helpers ---- */
/*
  Subscription calls retry when Cashfree itself is briefly down (502/503/504, "internal server error", a dropped connection): up to 3 tries,
  a short pause between. Creating uses ONE idempotency key for all tries, so a try that actually went through is never created twice.
*/
const transient = (e) => { const st = e?.response?.status; return !st ? ["ECONNABORTED", "ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "EAI_AGAIN"].includes(e?.code) : st === 429 || st >= 500; };
const subHttp = async (c, method, path, data) => {
  const key = crypto.randomUUID();
  let last;
  for (let i = 0; i < 3; i += 1) {
    try {
      return await axios({ method, url: `${c.baseUrl}${path}`, data, timeout: 20000, headers: { "x-client-id": c.appId, "x-client-secret": c.secret, "x-api-version": c.subscriptionApiVersion || c.apiVersion, "x-idempotency-key": key, "Content-Type": "application/json", Accept: "application/json" } }).then((r) => r.data);
    } catch (e) {
      last = e;
      if (!transient(e) || i === 2) break;
      console.error(`[payments] cashfree ${method.toUpperCase()} ${path} hit a temporary error (${e?.response?.status || e?.code}); retrying`);
      await new Promise((r) => setTimeout(r, 700 * (i + 1)));
    }
  }
  throw last;
};
/* Cashfree only accepts letters, numbers, spaces, - and _ in plan names and notes ("Priority · 10 days" is rejected) */
const plain = (v, max) => String(v || "").replace(/[^A-Za-z0-9 _-]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const ist = (d) => { const t = new Date(d.getTime() + 330 * 60000); return `${t.toISOString().slice(0, 19)}+05:30`; }; // Cashfree stores IST
const nextMonth = (d) => { const x = new Date(d); x.setMonth(x.getMonth() + 1); return x; };
const D = (v) => (v ? new Date(v) : null);
/* Cashfree's subscription_status in the vocabulary the rest of the app uses (the same words Razorpay's adapter returns) */
const STATUS = { INITIALIZED: "created", BANK_APPROVAL_PENDING: "authenticated", ACTIVE: "active", ON_HOLD: "pending", PAUSED: "paused", CUSTOMER_PAUSED: "paused", COMPLETED: "completed", CANCELLED: "cancelled", CUSTOMER_CANCELLED: "cancelled", LINK_EXPIRED: "cancelled", EXPIRED: "halted", CARD_EXPIRED: "halted" };
const statusType = (st) => ({ active: "synced", authenticated: "synced", created: "synced", pending: "pending", paused: "paused", completed: "completed", cancelled: "cancelled", halted: "halted" })[STATUS[String(st || "").toUpperCase()] || ""] || "";
const subState = (s) => ({ status: STATUS[String(s.subscription_status || s.status || "").toUpperCase()] || String(s.subscription_status || "").toLowerCase(), chargeAt: D(s.next_schedule_date), currentStart: null, currentEnd: null, paidCount: 0, endedAt: null });
const payOut = (p) => {
  const st = String(p.payment_status || "").toUpperCase();
  const when = D(p.payment_initiated_date || p.payment_schedule_date);
  return {
    paymentId: String(p.cf_payment_id || p.payment_id || ""), invoiceId: String(p.payment_id || ""), amountPaise: Math.round(Number(p.payment_amount || 0) * 100),
    status: st === "SUCCESS" ? "paid" : ["FAILED", "CANCELLED"].includes(st) ? "failed" : "pending",
    at: when || new Date(), periodStart: when, periodEnd: when ? nextMonth(when) : null,
    reason: p.failure_details?.failure_reason || p.failureDetails?.failureReason || null,
  };
};

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
    if (failed) return { status: "failed", reason: payments.every((p) => ["USER_DROPPED", "CANCELLED"].includes(String(p?.payment_status || "").toUpperCase())) ? "USER_CANCELLED" : "PAYMENT_DECLINED" };
    // "processing" = a payment is really in flight at the bank; "none" = nothing was paid or attempted (closed the window, never started)
    return { status: "pending", progress: payments.some((p) => String(p?.payment_status || "").toUpperCase() === "PENDING") ? "processing" : "none" };
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

  /* ---------------- recurring billing (Cashfree Subscriptions) ---------------- */
  supportsSubscriptions: true,

  /*
    The plan is defined inline (no pre-made plan to keep in sync). The buyer's authorisation payment is for the FULL first period and is
    not refunded (authorization_amount = price, authorization_amount_refund = false), so they are charged straight away. The first
    scheduled debit is set one period later, so the second charge lands about a month on.
  */
  async createSubscription({ credentials: c }, req) {
    if (!/^\d{10}$/.test(String(req.customer.phone || ""))) throw new PaymentError(400, "There is no valid mobile number on your account. Please contact support.", "PHONE_UNAVAILABLE");
    const amount = rupees(req.plan.amountPaise);
    const now = new Date();
    const first = new Date(now); first.setMonth(first.getMonth() + 1);
    const expiry = new Date(now); expiry.setFullYear(expiry.getFullYear() + 10);
    const body = {
      subscription_id: req.ref,
      customer_details: { customer_name: String(req.customer.name || "Customer").slice(0, 100), customer_email: req.customer.email, customer_phone: req.customer.phone },
      plan_details: {
        plan_name: plain(req.plan.name, 40) || "Plan", plan_type: "PERIODIC", plan_amount: amount, plan_max_amount: amount,
        plan_max_cycles: req.totalCycles || 120, plan_intervals: req.plan.interval || 1, plan_interval_type: ({ monthly: "MONTH", yearly: "YEAR", weekly: "WEEK", daily: "DAY" })[req.plan.period || "monthly"] || "MONTH",
        plan_currency: req.currency || "INR", plan_note: plain(req.description, 100),
      },
      authorization_details: { authorization_amount: amount, authorization_amount_refund: false, payment_methods: ["upi", "card"] },
      subscription_meta: { return_url: req.returnUrl, notification_channel: ["EMAIL", "SMS"] },
      subscription_expiry_time: ist(expiry),
      subscription_first_charge_time: ist(first),
      subscription_tags: { ...stringTags({ ...(req.notes || {}) }), psp_note: plain(req.description, 60) || "Target Trek" },
    };
    const data = await subHttp(c, "post", "/subscriptions", body);
    if (!data?.subscription_session_id) throw new PaymentError(502, "The payment provider did not return a session.", "GATEWAY_ERROR", data);
    return {
      gatewaySubscriptionId: data.subscription_id || req.ref, gatewayPlanId: "",
      checkout: { type: "cashfree_subscription", subscriptionSessionId: data.subscription_session_id, environment: c.sdkMode },
    };
  },

  /* Cashfree gives no browser signature: the buyer returns to our page, which asks us to look at the subscription (fetch + payments). */
  async verifySubscriptionClient() { return { valid: false }; },

  async fetchSubscription({ credentials: c }, { gatewaySubscriptionId }) {
    return subState(await subHttp(c, "get", `/subscriptions/${encodeURIComponent(gatewaySubscriptionId)}`));
  },

  async listSubscriptionCharges({ credentials: c }, { gatewaySubscriptionId }) {
    const rows = await subHttp(c, "get", `/subscriptions/${encodeURIComponent(gatewaySubscriptionId)}/payments`);
    return (Array.isArray(rows) ? rows : rows?.data || []).map((p) => payOut(p));
  },

  /* Cancelling stops every future debit. (Our own records keep the access until the paid period ends.) */
  async cancelSubscription({ credentials: c }, { gatewaySubscriptionId }) {
    return subState(await subHttp(c, "post", `/subscriptions/${encodeURIComponent(gatewaySubscriptionId)}/manage`, { subscription_id: gatewaySubscriptionId, action: "CANCEL" }));
  },

  /* Same signature scheme as order webhooks: base64(HMAC-SHA256(timestamp + rawBody)) with the client secret. */
  parseSubscriptionWebhook({ credentials: c }, { rawBody, headers }) {
    const signature = headers["x-webhook-signature"], timestamp = headers["x-webhook-timestamp"];
    if (!rawBody || !signature || !timestamp) return { valid: false, subscription: false };
    const expected = Buffer.from(crypto.createHmac("sha256", c.secret).update(`${timestamp}${rawBody}`).digest("base64"));
    const got = Buffer.from(String(signature));
    if (expected.length !== got.length || !crypto.timingSafeEqual(expected, got)) return { valid: false, subscription: false };
    let evt;
    try { evt = JSON.parse(rawBody); } catch { return { valid: false, subscription: false }; }
    const type = String(evt?.type || "");
    if (!type.startsWith("SUBSCRIPTION_")) return { valid: true, subscription: false }; // an order webhook: not ours
    const d = evt.data || {};
    const subId = d.subscription_id || d.subscription_details?.subscription_id || d.subscription_status_webhook?.subscription_details?.subscription_id;
    if (!subId) return { valid: true, subscription: true, ignore: true };
    const id = `${type}:${d.cf_payment_id || d.payment_id || d.subscription_details?.subscription_status || ""}:${evt.event_time || timestamp}`;
    const pay = d.payment_id || d.cf_payment_id ? payOut(d) : null;
    const make = (kind, extra = {}) => ({ valid: true, subscription: true, event: { id, type: kind, gatewaySubscriptionId: subId, state: extra.state || {}, payment: extra.payment ?? null } });

    if (type === "SUBSCRIPTION_PAYMENT_SUCCESS" || (type === "SUBSCRIPTION_AUTH_STATUS" && pay?.status === "paid")) {
      if (pay?.status !== "paid") return { valid: true, subscription: true, ignore: true };
      const start = pay.at || new Date();
      return make("charged", { state: { status: "active", currentStart: start, currentEnd: nextMonth(start) }, payment: { paymentId: pay.paymentId, invoiceId: pay.invoiceId, amountPaise: pay.amountPaise, method: null } });
    }
    // A failed first (AUTH) attempt is left alone: the buyer can retry inside the same checkout. A failed RENEWAL is a retry notice.
    if (type === "SUBSCRIPTION_PAYMENT_FAILED" && String(d.payment_type || "").toUpperCase() !== "AUTH") return make("pending", { state: { status: "on_hold" }, payment: { paymentId: pay?.paymentId, invoiceId: pay?.invoiceId, amountPaise: pay?.amountPaise, reason: pay?.reason || "The renewal payment didn't go through" } });
    if (type === "SUBSCRIPTION_STATUS_CHANGED" || type === "SUBSCRIPTION_CARD_EXPIRY_REMINDER") {
      const st = d.subscription_details || d.subscription_status_webhook?.subscription_details || {};
      const mapped = statusType(st.subscription_status);
      if (!mapped || mapped === "synced") return { valid: true, subscription: true, ignore: true };
      return make(mapped, { state: subState(st) });
    }
    return { valid: true, subscription: true, ignore: true };
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

  describeError: (e) => (e?.response?.status >= 500 ? `Cashfree is temporarily unavailable (HTTP ${e.response.status})` : null) || e?.response?.data?.message || e?.response?.data?.error_description || e?.message || "unknown error",
  httpStatus: (e) => e?.response?.status,
};

const stringTags = (notes) =>
  Object.fromEntries(Object.entries(notes).slice(0, 15).map(([k, v]) => [String(k).slice(0, 255), String(v).slice(0, 255)]));
