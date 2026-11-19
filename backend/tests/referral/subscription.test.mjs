import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

process.env.RAZORPAY_KEY_ID = "rzp_test_abc";
process.env.RAZORPAY_KEY_SECRET = "secret123";
process.env.RAZORPAY_WEBHOOK_SECRET = "whsec";
process.env.PAYMENT_GATEWAY = "cashfree";

const { parseSubscriptionWebhook, verifySubscriptionPayment, pickSubscriptionGateway } = await import("../../services/payments/index.js");
const { isLive, subOut } = await import("../../services/referral/subscriptions.js");

const sign = (body, key) => crypto.createHmac("sha256", key).update(body).digest("hex");
const evt = (event, extra = {}) => JSON.stringify({ event, created_at: 1700000000, payload: { subscription: { entity: { id: "sub_1", status: "active", paid_count: 2, current_start: 1700000000, current_end: 1702592000, charge_at: 1702592000, plan_id: "plan_1" } }, ...extra } });

test("subscriptions fall back to Razorpay when the .env gateway can't bill monthly", () => {
  assert.equal(pickSubscriptionGateway("REFERRAL"), "razorpay");
});

test("a signed charged webhook is normalised; a forged one is rejected", () => {
  const body = evt("subscription.charged", { payment: { entity: { id: "pay_9", amount: 9900, invoice_id: "inv_1", method: "upi", status: "captured" } } });
  const ok = parseSubscriptionWebhook({ product: "REFERRAL", gateway: "razorpay", rawBody: body, headers: { "x-razorpay-signature": sign(body, "whsec"), "x-razorpay-event-id": "evt_1" } });
  assert.equal(ok.valid, true);
  assert.equal(ok.event.type, "charged");
  assert.equal(ok.event.id, "evt_1");
  assert.equal(ok.event.payment.paymentId, "pay_9");
  assert.equal(ok.event.payment.amountPaise, 9900);
  assert.equal(ok.event.state.currentEnd.getTime(), 1702592000 * 1000);
  const bad = parseSubscriptionWebhook({ product: "REFERRAL", gateway: "razorpay", rawBody: body, headers: { "x-razorpay-signature": sign(body, "nope") } });
  assert.equal(bad.valid, false);
});

test("order webhooks are left for the order flow", () => {
  const body = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "p", order_id: "o" } } } });
  const r = parseSubscriptionWebhook({ product: "REFERRAL", gateway: "razorpay", rawBody: body, headers: { "x-razorpay-signature": sign(body, "whsec") } });
  assert.equal(r.valid, true);
  assert.equal(r.subscription, false);
});

test("the first-payment proof must carry a correct signature", async () => {
  const good = sign("pay_1|sub_1", "secret123");
  const base = { product: "REFERRAL", gateway: "razorpay", gatewaySubscriptionId: "sub_1" };
  assert.equal((await verifySubscriptionPayment({ ...base, proof: { razorpay_payment_id: "pay_1", razorpay_subscription_id: "sub_1", razorpay_signature: good } })).valid, true);
  assert.equal((await verifySubscriptionPayment({ ...base, proof: { razorpay_payment_id: "pay_1", razorpay_subscription_id: "sub_1", razorpay_signature: "bad" } })).valid, false);
});

test("access rules: cancelled keeps the paid period, no longer", () => {
  const day = 86400000, now = Date.now();
  assert.equal(isLive({ status: "cancelled", currentPeriodEnd: new Date(now + 5 * day) }), true);
  assert.equal(isLive({ status: "cancelled", currentPeriodEnd: new Date(now - 1000) }), false);
  assert.equal(isLive({ status: "active", currentPeriodEnd: new Date(now - day) }), true); // renewal a few hours late
  assert.equal(isLive({ status: "active", currentPeriodEnd: new Date(now - 5 * day) }), false);
  assert.equal(isLive({ status: "created", currentPeriodEnd: new Date(now + day) }), false);
  const out = subOut({ _id: "x", kind: "unlimited", status: "cancelled", pricePaise: 9900, currentPeriodEnd: new Date(now + 3 * day), events: [], seenEvents: [] });
  assert.equal(out.cancelling, true);
  assert.equal(out.daysLeft, 3);
  assert.equal(out.nextChargeAt, null);
});

/* ---------------- Cashfree ---------------- */
test("SUBSCRIPTION_PAYMENT_GATEWAY chooses the gateway for new subscriptions, and refuses a wrong one", async () => {
  process.env.CASHFREE_APP_ID = "app"; process.env.CASHFREE_SECRET_KEY = "cfsecret"; process.env.CASHFREE_ENV = "sandbox";
  process.env.SUBSCRIPTION_PAYMENT_GATEWAY = "cashfree";
  assert.equal(pickSubscriptionGateway("REFERRAL"), "cashfree");
  process.env.SUBSCRIPTION_PAYMENT_GATEWAY = "razorpay";
  assert.equal(pickSubscriptionGateway("REFERRAL"), "razorpay");
  process.env.SUBSCRIPTION_PAYMENT_GATEWAY = "payu";
  assert.throws(() => pickSubscriptionGateway("REFERRAL"), /Monthly billing/);
  process.env.SUBSCRIPTION_PAYMENT_GATEWAY = "";
});

const cfSign = (body, ts) => crypto.createHmac("sha256", "cfsecret").update(`${ts}${body}`).digest("base64");
const cf = (obj) => { const body = JSON.stringify(obj), ts = "1700000000"; return parseSubscriptionWebhook({ product: "REFERRAL", gateway: "cashfree", rawBody: body, headers: { "x-webhook-signature": cfSign(body, ts), "x-webhook-timestamp": ts } }); };

test("Cashfree: a signed payment-success webhook becomes a charge; a bad signature is rejected", () => {
  const ok = cf({ type: "SUBSCRIPTION_PAYMENT_SUCCESS", event_time: "2026-11-19T10:00:00+05:30", data: { subscription_id: "RSUB_1", cf_payment_id: "cfp_1", payment_id: "pay_a", payment_type: "AUTH", payment_amount: 99, payment_status: "SUCCESS", payment_initiated_date: "2026-11-19T10:00:00+05:30" } });
  assert.equal(ok.event.type, "charged");
  assert.equal(ok.event.gatewaySubscriptionId, "RSUB_1");
  assert.equal(ok.event.payment.paymentId, "cfp_1");
  assert.equal(ok.event.payment.amountPaise, 9900);
  const body = "{}";
  assert.equal(parseSubscriptionWebhook({ product: "REFERRAL", gateway: "cashfree", rawBody: body, headers: { "x-webhook-signature": "bad", "x-webhook-timestamp": "1" } }).valid, false);
});

test("Cashfree: failed renewal = retry notice, failed first attempt = ignored, cancel/hold map to our events", () => {
  const fail = cf({ type: "SUBSCRIPTION_PAYMENT_FAILED", data: { subscription_id: "RSUB_1", cf_payment_id: "c2", payment_type: "CHARGE", payment_amount: 99, payment_status: "FAILED", failure_details: { failure_reason: "Insufficient balance" } } });
  assert.equal(fail.event.type, "pending");
  assert.equal(fail.event.payment.reason, "Insufficient balance");
  assert.equal(cf({ type: "SUBSCRIPTION_PAYMENT_FAILED", data: { subscription_id: "RSUB_1", cf_payment_id: "c3", payment_type: "AUTH", payment_status: "FAILED" } }).ignore, true);
  assert.equal(cf({ type: "SUBSCRIPTION_STATUS_CHANGED", data: { subscription_details: { subscription_id: "RSUB_1", subscription_status: "CUSTOMER_CANCELLED" } } }).event.type, "cancelled");
  assert.equal(cf({ type: "SUBSCRIPTION_STATUS_CHANGED", data: { subscription_details: { subscription_id: "RSUB_1", subscription_status: "ACTIVE" } } }).ignore, true);
  assert.equal(cf({ type: "PAYMENT_SUCCESS_WEBHOOK", data: { order: { order_id: "x" } } }).subscription, false);
});
