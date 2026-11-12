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
    return hit ? { status: "paid", paymentId: hit.id, amountPaise: Number(hit.amount), currency: String(hit.currency || "").toUpperCase(), method: hit.method || null, raw: hit } : { status: "pending" };
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

  describeError: (e) => e?.error?.description || e?.message || "unknown error",
  httpStatus: (e) => e?.statusCode || e?.response?.status,
};
