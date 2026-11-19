import ReferralOrder from "../../models/referral/ReferralOrder.js";
import ReferralRequest from "../../models/referral/ReferralRequest.js";
import { BACKEND_URL } from "../../config/urls.js";
import { createPayment, verifyPayment, parseWebhook, parseCallback, pickGateway, PaymentError } from "../payments/index.js";
import { gatewayPhone } from "../../utils/phone.js";
import { DAY_MS, ResumeError } from "../resume/service.js";
import { openChat, autoUnlockFor } from "./core.js";
import { accessChanged } from "./subscriptions.js";

/* REFERRAL -> CENTRAL PAYMENT PROCESSOR (same pattern as Resume Lab). Gateway: REFERRAL_PAYMENT_GATEWAY or the global PAYMENT_GATEWAY. */
const PRODUCT = "REFERRAL";

export const urlsFor = (orderId) => ({
  callback: (gateway) => `${BACKEND_URL}/api/referral/payments/callback/${gateway}?ref=${orderId}`,
  webhook: (gateway) => `${BACKEND_URL}/api/referral/payments/webhook/${gateway}`,
});

export const startCheckout = async ({ order, user, preferredGateway }) => {
  const gateway = pickGateway(PRODUCT, preferredGateway);
  const urls = urlsFor(order._id);
  try {
    const p = await createPayment({
      product: PRODUCT, gateway, orderRef: `REF_${order._id}_${Date.now().toString(36)}`, amountPaise: order.payment.amount,
      customer: { id: String(user._id), name: user.name, email: user.email, phone: gatewayPhone(user), rawPhone: user.mobile },
      returnUrl: urls.callback(gateway), webhookUrl: urls.webhook(gateway),
      description: `Referrals: ${order.title || "chat"}`.slice(0, 100), notes: { type: `referral_${order.kind}`, userId: String(order.user) },
    });
    return { gateway: p.gateway, gatewayOrderId: p.gatewayOrderId, checkout: p.checkout };
  } catch (e) {
    if (e instanceof PaymentError) throw new ResumeError(e.status >= 500 ? 502 : e.status, e.message, e.code);
    console.error("[referral] could not create the order:", e?.message || e);
    throw new ResumeError(502, "The payment provider couldn't start the payment. Please try again in a moment.", "GATEWAY_ERROR");
  }
};

/* The gateway's own answer, never the browser's. */
export const fetchStatus = async (order, proof) => {
  const r = await verifyPayment({ product: PRODUCT, gateway: order.payment.gateway, gatewayOrderId: order.payment.gatewayOrderId, expectedAmountPaise: order.payment.amount, ...(proof ? { proof } : {}) });
  if (r.status === "paid" || r.reason === "AMOUNT_MISMATCH") return { paid: true, paymentId: r.paymentId, amountPaise: r.amountPaise };
  return r.status === "failed" ? { paid: false, failed: true, reason: r.reason || "GATEWAY_FAILED" } : { paid: false, progress: r.progress || "none" };
};
export const webhookOf = ({ gateway, rawBody, headers }) => { try { return parseWebhook({ product: PRODUCT, gateway, rawBody, headers }); } catch { return { valid: false }; } };
export const callbackOf = ({ gateway, body }) => { try { return { gatewayOrderId: parseCallback({ product: PRODUCT, gateway, body }).gatewayOrderId }; } catch { return { gatewayOrderId: null }; } };

/* The ONE place a payment turns into an open chat or a bucket of credits. Safe to call any number of times. */
export const settleOrder = async (order, status) => {
  if (order.payment.status === "paid") return "paid";
  if (!status?.paid) {
    if (status?.failed) { await ReferralOrder.updateOne({ _id: order._id, "payment.status": "created" }, { "payment.status": "failed", "payment.failureReason": status.reason || "GATEWAY_FAILED" }); return "failed"; }
    return order.payment.status === "failed" ? "failed" : "pending";
  }
  if (Number(status.amountPaise) !== Number(order.payment.amount)) {
    console.error(`[referral] amount mismatch on ${order._id}: expected ${order.payment.amount}, gateway says ${status.amountPaise}`);
    await ReferralOrder.updateOne({ _id: order._id, "payment.status": { $ne: "paid" } }, { "payment.status": "failed", "payment.failureReason": "AMOUNT_MISMATCH" });
    return "failed";
  }
  const now = new Date();
  const days = order.validityDays || 0;
  // a one-time priority pass stacks: buying again while one is running adds the days on top
  let base = now;
  if (order.kind === "priority") {
    const last = await ReferralOrder.findOne({ user: order.user, kind: "priority", "payment.status": "paid", revokedAt: null, expiresAt: { $gt: now } }).sort({ expiresAt: -1 }).select("expiresAt").lean();
    if (last?.expiresAt) base = last.expiresAt;
  }
  const flipped = await ReferralOrder.updateOne(
    { _id: order._id, "payment.status": { $ne: "paid" } },
    { $set: { "payment.status": "paid", "payment.gatewayPaymentId": status.paymentId || null, "payment.paidAt": now, "payment.failureReason": null, expiresAt: (order.kind === "plan" || order.kind === "priority") && days > 0 ? new Date(base.getTime() + days * DAY_MS) : null } }
  );
  if (flipped.modifiedCount && order.kind === "unlock") {
    const opened = await openChat(order.request, "payment");
    if (!opened) { // the request changed while paying (ended, withdrawn): keep the money's worth as one chat credit
      const r = await ReferralRequest.findById(order.request).select("chat").lean();
      if (!r?.chat?.unlocked) await ReferralOrder.updateOne({ _id: order._id }, { $set: { kind: "plan", allowed: 1, used: 0, title: "Unused chat unlock" } });
    }
  }
  // New credits: open every chat the sender was waiting to unlock (one credit each).
  if (flipped.modifiedCount && order.kind === "priority") await accessChanged(order.user);
  if (flipped.modifiedCount && order.kind === "plan") await autoUnlockFor(order.user).catch((e) => console.error("[referral] auto unlock failed:", e?.message || e));
  return "paid";
};

export const refreshOrder = async (order, { detail = false } = {}) => {
  const out = (state, extra = {}) => (detail ? { state, progress: "none", reason: order.payment.failureReason || null, ...extra } : state);
  if (order.payment.status === "paid") return out("paid");
  if (!order.payment.gatewayOrderId) return out("pending", { progress: "none" });
  try {
    const st = await fetchStatus(order);
    const state = await settleOrder(order, st);
    return out(state, { progress: st.progress || "none", reason: st.reason || order.payment.failureReason || null });
  } catch (e) {
    console.error(`[referral] status check failed for ${order._id}:`, e?.message || e);
    return out(order.payment.status === "failed" ? "failed" : "pending", { progress: "unknown" });
  }
};
