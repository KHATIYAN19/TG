import crypto from "crypto";
import Razorpay from "razorpay";
import { PaymentError } from "../errors.js";

/* Razorpay: server creates an order -> the browser opens Razorpay Checkout -> it posts the signed result back. */
const clients = new Map();
const client = (c) => {
  const k = `${c.keyId}:${c.secret}`;
  if (!clients.has(k)) clients.set(k, new Razorpay({ key_id: c.keyId, key_secret: c.secret }));
  return clients.get(k);
};

/* Razorpay's subscription entity, in the shape the rest of the app uses */
const T = (n) => (n ? new Date(n * 1000) : null);
const subState = (s) => ({ status: s.status, paidCount: s.paid_count || 0, remaining: s.remaining_count ?? null, currentStart: T(s.current_start), currentEnd: T(s.current_end), chargeAt: T(s.charge_at), endedAt: T(s.ended_at), gatewayPlanId: s.plan_id || null });

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a || ""));
  const y = Buffer.from(String(b || ""));
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
};

export default {
  id: "razorpay",
  label: "Razorpay",

  async createOrder({ credentials: c }, req) {
    const order = await client(c).orders.create({
      amount: req.amountPaise,
      currency: req.currency,
      receipt: String(req.orderRef).slice(0, 40),
      notes: req.notes || {},
    });
    return {
      gatewayOrderId: order.id,
      checkout: {
        type: "razorpay",
        keyId: c.keyId,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        name: req.merchantName || "Target Trek",
        description: req.description || "",
        prefill: { name: req.customer.name, email: req.customer.email, contact: req.customer.rawPhone || "" },
      },
    };
  },

  /* The browser's signed result. Signature proves the payment belongs to our order; the gateway is still asked for the truth. */
  async verifyClient({ credentials: c }, { gatewayOrderId, proof = {} }) {
    const orderId = proof.razorpay_order_id || proof.orderId || gatewayOrderId;
    const paymentId = proof.razorpay_payment_id || proof.paymentId;
    const signature = proof.razorpay_signature || proof.signature;
    if (!paymentId || !signature || orderId !== gatewayOrderId) return { status: "failed", reason: "SIGNATURE_MISMATCH" };
    const expected = crypto.createHmac("sha256", c.secret).update(`${orderId}|${paymentId}`).digest("hex");
    if (!safeEqual(signature, expected)) return { status: "failed", reason: "SIGNATURE_MISMATCH" };

    const p = await client(c).payments.fetch(paymentId);
    if (p.order_id !== gatewayOrderId) return { status: "failed", reason: "ORDER_MISMATCH" };
    if (p.status === "captured") return { status: "paid", paymentId: p.id, amountPaise: Number(p.amount), currency: String(p.currency || "").toUpperCase(), method: p.method || null, raw: p };
    return { status: p.status === "failed" ? "failed" : "pending", paymentId: p.id };
  },

  async fetchStatus({ credentials: c }, { gatewayOrderId }) {
    const list = await client(c).orders.fetchPayments(gatewayOrderId);
    const hit = (list?.items || []).find((p) => p.status === "captured");
    if (hit) return { status: "paid", paymentId: hit.id, amountPaise: Number(hit.amount), currency: String(hit.currency || "").toUpperCase(), method: hit.method || null, raw: hit };
    return { status: "pending", progress: (list?.items || []).some((p) => ["created", "authorized"].includes(p.status)) ? "processing" : "none" };
  },

  parseWebhook({ credentials: c }, { rawBody, headers }) {
    if (!c.webhookSecret || !rawBody) return { valid: false };
    const expected = crypto.createHmac("sha256", c.webhookSecret).update(rawBody).digest("hex");
    if (!safeEqual(headers["x-razorpay-signature"], expected)) return { valid: false };
    let evt;
    try { evt = JSON.parse(rawBody); } catch { return { valid: false }; }
    if (!["payment.captured", "order.paid"].includes(evt?.event)) return { valid: true, ignore: true };
    const id = evt?.payload?.payment?.entity?.order_id || evt?.payload?.order?.entity?.id;
    return id ? { valid: true, gatewayOrderId: id } : { valid: true, ignore: true };
  },

  async refund({ credentials: c }, { paymentId, amountPaise, refundId, note }) {
    if (!paymentId) throw new PaymentError(400, "This payment has no gateway payment id to refund.", "NOT_REFUNDABLE");
    const r = await client(c).payments.refund(paymentId, {
      amount: amountPaise,
      speed: "normal",
      notes: { note: String(note || "") },
      receipt: String(refundId || "").slice(0, 40) || undefined,
    });
    return { refundId: r.id };
  },

  /* ---------------- recurring billing (Razorpay Subscriptions) ---------------- */
  supportsSubscriptions: true,

  /* A Razorpay "plan" is a price + period. `plan.gatewayPlanId` is reused when the caller already has one. */
  async createSubscription({ credentials: c }, req) {
    const rz = client(c);
    let planId = req.plan.gatewayPlanId;
    if (!planId) {
      const made = await rz.plans.create({ period: req.plan.period || "monthly", interval: req.plan.interval || 1, item: { name: String(req.plan.name || "Plan").slice(0, 100), amount: req.plan.amountPaise, currency: req.currency || "INR" }, notes: { plan: String(req.plan.key || "") } });
      planId = made.id;
    }
    // No start_at: the first charge happens right now, while the buyer authorises the mandate. Later charges follow every period.
    const sub = await rz.subscriptions.create({ plan_id: planId, total_count: req.totalCycles || 120, quantity: 1, customer_notify: 1, notes: { ...(req.notes || {}), ref: req.ref } });
    return {
      gatewaySubscriptionId: sub.id, gatewayPlanId: planId,
      checkout: { type: "razorpay", keyId: c.keyId, subscriptionId: sub.id, name: req.merchantName || "Target Trek", description: req.description || "", prefill: { name: req.customer.name, email: req.customer.email, contact: req.customer.rawPhone || "" } },
    };
  },

  /* Razorpay signs `payment_id|subscription_id` for the first payment. */
  async verifySubscriptionClient({ credentials: c }, { gatewaySubscriptionId, proof = {} }) {
    const paymentId = proof.razorpay_payment_id, signature = proof.razorpay_signature, subId = proof.razorpay_subscription_id || gatewaySubscriptionId;
    if (!paymentId || !signature || subId !== gatewaySubscriptionId) return { valid: false };
    const expected = crypto.createHmac("sha256", c.secret).update(`${paymentId}|${subId}`).digest("hex");
    return safeEqual(signature, expected) ? { valid: true, paymentId } : { valid: false };
  },

  async fetchSubscription({ credentials: c }, { gatewaySubscriptionId }) {
    return subState(await client(c).subscriptions.fetch(gatewaySubscriptionId));
  },

  /* Every charge the gateway made for this subscription (paid ones carry a payment id; unpaid ones show as failed/pending). */
  async listSubscriptionCharges({ credentials: c }, { gatewaySubscriptionId }) {
    const r = await client(c).invoices.all({ subscription_id: gatewaySubscriptionId, count: 100 });
    return (r?.items || []).map((i) => ({
      invoiceId: i.id, paymentId: i.payment_id || null, amountPaise: Number(i.amount || 0),
      status: i.status === "paid" ? "paid" : ["expired", "cancelled"].includes(i.status) ? "failed" : "pending",
      at: i.paid_at ? new Date(i.paid_at * 1000) : i.created_at ? new Date(i.created_at * 1000) : new Date(),
      periodStart: i.billing_start ? new Date(i.billing_start * 1000) : null, periodEnd: i.billing_end ? new Date(i.billing_end * 1000) : null,
      reason: i.status === "paid" ? null : i.status,
    }));
  },

  /* atCycleEnd=false stops all future charges now. (Our own records keep the access until the paid period ends.) */
  async cancelSubscription({ credentials: c }, { gatewaySubscriptionId, atCycleEnd }) {
    return subState(await client(c).subscriptions.cancel(gatewaySubscriptionId, atCycleEnd ? 1 : 0));
  },

  parseSubscriptionWebhook({ credentials: c }, { rawBody, headers }) {
    if (!c.webhookSecret || !rawBody) return { valid: false };
    const expected = crypto.createHmac("sha256", c.webhookSecret).update(rawBody).digest("hex");
    if (!safeEqual(headers["x-razorpay-signature"], expected)) return { valid: false };
    let evt;
    try { evt = JSON.parse(rawBody); } catch { return { valid: false }; }
    const kind = { "subscription.authenticated": "authenticated", "subscription.activated": "activated", "subscription.charged": "charged", "subscription.pending": "pending", "subscription.halted": "halted", "subscription.cancelled": "cancelled", "subscription.completed": "completed", "subscription.paused": "paused", "subscription.resumed": "resumed", "subscription.updated": "updated" }[evt?.event];
    if (!kind) return { valid: true, ignore: true, subscription: false };
    const sub = evt?.payload?.subscription?.entity;
    if (!sub?.id) return { valid: true, ignore: true, subscription: true };
    const pay = evt?.payload?.payment?.entity;
    return {
      valid: true, subscription: true,
      event: { id: String(headers["x-razorpay-event-id"] || `${evt.event}:${sub.id}:${pay?.id || sub.paid_count || ""}:${evt.created_at || ""}`), type: kind, gatewaySubscriptionId: sub.id, state: subState(sub),
        payment: pay ? { paymentId: pay.id, invoiceId: pay.invoice_id || null, amountPaise: Number(pay.amount || 0), method: pay.method || null, status: pay.status, reason: pay.error_description || null } : null },
    };
  },

  describeError: (e) => e?.error?.description || e?.message || "unknown error",
  httpStatus: (e) => e?.statusCode || e?.response?.status,
};
