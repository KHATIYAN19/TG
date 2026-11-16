import ResumePurchase from "../../models/resume/ResumePurchase.js";
import { BACKEND_URL } from "../../config/urls.js";
import { createPayment, verifyPayment, parseWebhook, parseCallback, pickGateway, PaymentError } from "../payments/index.js";
import { gatewayPhone } from "../../utils/phone.js";
import { DAY_MS, ResumeError } from "./service.js";

/*
  RESUME REVIEW -> CENTRAL PAYMENT PROCESSOR
  Same pattern as Memories: all gateway logic lives in services/payments. Choose the gateway in .env with
  RESUME_PAYMENT_GATEWAY (cashfree | razorpay | payu) or the global PAYMENT_GATEWAY.
*/
const PRODUCT = "RESUME";

export const urlsFor = (purchaseId) => ({
  callback: (gateway) => `${BACKEND_URL}/api/resume/payments/callback/${gateway}?ref=${purchaseId}`,
  webhook: (gateway) => `${BACKEND_URL}/api/resume/payments/webhook/${gateway}`,
});

export const startCheckout = async ({ purchase, user, preferredGateway }) => {
  const gateway = pickGateway(PRODUCT, preferredGateway);
  const urls = urlsFor(purchase._id);
  try {
    const p = await createPayment({
      product: PRODUCT,
      gateway,
      orderRef: `RES_${purchase._id}_${Date.now().toString(36)}`, // a new reference per attempt: gateways refuse a repeated order id
      amountPaise: purchase.payment.amount,
      customer: { id: String(user._id), name: user.name, email: user.email, phone: gatewayPhone(user), rawPhone: user.mobile },
      returnUrl: urls.callback(gateway),
      webhookUrl: urls.webhook(gateway),
      description: `Resume Lab: ${purchase.packageSnapshot?.name || "plan"}`.slice(0, 100),
      notes: { type: "resume_plan", userId: String(purchase.user) },
    });
    return { gateway: p.gateway, gatewayOrderId: p.gatewayOrderId, checkout: p.checkout };
  } catch (e) {
    if (e instanceof PaymentError) throw new ResumeError(e.status >= 500 ? 502 : e.status, e.message, e.code);
    console.error("[resume] could not create the order:", e?.message || e);
    throw new ResumeError(502, "The payment provider couldn't start the payment. Please try again in a moment.", "GATEWAY_ERROR");
  }
};

/* The gateway's own answer, never the browser's. */
export const fetchStatus = async (purchase, proof) => {
  const r = await verifyPayment({
    product: PRODUCT, gateway: purchase.payment.gateway, gatewayOrderId: purchase.payment.gatewayOrderId,
    expectedAmountPaise: purchase.payment.amount, ...(proof ? { proof } : {}),
  });
  if (r.status === "paid" || r.reason === "AMOUNT_MISMATCH") return { paid: true, paymentId: r.paymentId, amountPaise: r.amountPaise };
  return r.status === "failed" ? { paid: false, failed: true, reason: r.reason || "GATEWAY_FAILED" } : { paid: false };
};

export const webhookOf = ({ gateway, rawBody, headers }) => {
  try { return parseWebhook({ product: PRODUCT, gateway, rawBody, headers }); } catch { return { valid: false }; }
};
export const callbackOf = ({ gateway, body }) => {
  try { return { gatewayOrderId: parseCallback({ product: PRODUCT, gateway, body }).gatewayOrderId }; } catch { return { gatewayOrderId: null }; }
};

/*
  The ONE place a payment turns into a usable plan. Safe to call any number of times (callback, webhook, status poll):
  the purchase flips to paid once, and its days start counting from that moment.
*/
export const settlePurchase = async (purchase, status) => {
  if (purchase.payment.status === "paid") return "paid";
  if (!status?.paid) {
    if (status?.failed) {
      await ResumePurchase.updateOne({ _id: purchase._id, "payment.status": "created" }, { "payment.status": "failed", "payment.failureReason": status.reason || "GATEWAY_FAILED" });
      return "failed";
    }
    return purchase.payment.status === "failed" ? "failed" : "pending";
  }
  if (Number(status.amountPaise) !== Number(purchase.payment.amount)) {
    console.error(`[resume] amount mismatch on ${purchase._id}: expected ${purchase.payment.amount}, gateway says ${status.amountPaise}`);
    await ResumePurchase.updateOne({ _id: purchase._id, "payment.status": { $ne: "paid" } }, { "payment.status": "failed", "payment.failureReason": "AMOUNT_MISMATCH" });
    return "failed";
  }
  const now = new Date();
  const days = purchase.packageSnapshot?.validityDays || 0;
  await ResumePurchase.updateOne(
    { _id: purchase._id, "payment.status": { $ne: "paid" } },
    { $set: { "payment.status": "paid", "payment.gatewayPaymentId": status.paymentId || null, "payment.paidAt": now, "payment.failureReason": null, expiresAt: days > 0 ? new Date(now.getTime() + days * DAY_MS) : null } }
  );
  return "paid";
};

export const refreshPurchase = async (purchase) => {
  if (purchase.payment.status === "paid") return "paid";
  if (!purchase.payment.gatewayOrderId) return "pending";
  try {
    return await settlePurchase(purchase, await fetchStatus(purchase));
  } catch (e) {
    console.error(`[resume] status check failed for ${purchase._id}:`, e?.message || e);
    return purchase.payment.status === "failed" ? "failed" : "pending";
  }
};
