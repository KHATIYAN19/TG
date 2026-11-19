import { PaymentError } from "./errors.js";
import { GATEWAY_IDS, resolvePayment, credentialsFor, resolveMode, subscriptionGatewayId } from "./config.js";
import razorpay from "./gateways/razorpay.js";
import cashfree from "./gateways/cashfree.js";
import payu from "./gateways/payu.js";

/*
  RECURRING BILLING  -  one reusable entry point for "charge now, then every period".
  ===================================================================================
  Any product (Referrals today; Courses, Memberships tomorrow) calls these. None of them knows which gateway is used.

     createSubscription(...)           makes the gateway plan (once) and the subscription; the buyer's first charge happens
                                       the moment they authorise it in the checkout, later charges follow every period
     verifySubscriptionPayment(...)    checks the browser's signed proof of that first payment
     fetchSubscription(...)            what the gateway says right now: status, paid cycles, current period, next charge
     listSubscriptionCharges(...)      every invoice the gateway raised (paid, failed, pending)
     cancelSubscription(...)           stops future charges
     parseSubscriptionWebhook(...)     a verified, normalised event: authenticated | activated | charged | pending | halted
                                       | cancelled | completed | paused | resumed

  Only the money-moving facts come from the gateway. The caller stores them (see services/referral/subscriptions.js).
  A gateway that has no recurring product here (Cashfree, PayU) answers with a clear 501, so a product can fall back to
  `pickSubscriptionGateway`, which prefers the .env gateway and otherwise any configured one that supports subscriptions.
  To add one: implement the methods used below on its adapter and set `supportsSubscriptions: true`.
*/
const ADAPTERS = { razorpay, cashfree, payu };

const ctxFor = (product, { gateway, mode } = {}) => {
  const ctx = resolvePayment(product, { gateway, mode });
  const adapter = ADAPTERS[ctx.gateway];
  if (!adapter) throw new PaymentError(400, "That payment method is not supported.", "UNSUPPORTED_GATEWAY");
  if (!adapter.supportsSubscriptions) throw new PaymentError(501, "Monthly billing isn't available on this payment method yet.", "SUBSCRIPTIONS_UNSUPPORTED");
  if (!ctx.credentials) {
    console.error(`[payments] ${ctx.product}: ${ctx.gateway} (${ctx.mode}) has no credentials for subscriptions.`);
    throw new PaymentError(503, "Payments are not available right now. Please try again later.", "GATEWAY_NOT_CONFIGURED");
  }
  return { ...ctx, adapter };
};

const wrap = async (ctx, action, fn) => {
  try { return await fn(); } catch (e) {
    if (e instanceof PaymentError) throw e;
    const detail = ctx.adapter.describeError?.(e) || e?.message || "unknown error";
    console.error(`[payments] ${ctx.product}/${ctx.gateway}/${ctx.mode} ${action} failed: ${detail}`);
    throw new PaymentError(ctx.adapter.httpStatus?.(e) === 400 ? 400 : 502, "The payment provider couldn't process this. Please try again in a moment.", "GATEWAY_ERROR", detail);
  }
};

/**
 * The gateway a NEW subscription is billed on.
 *   1. SUBSCRIPTION_PAYMENT_GATEWAY (or <PRODUCT>_SUBSCRIPTION_PAYMENT_GATEWAY) when set: used as is, and a clear error if it can't bill
 *      monthly or has no keys (no silent switch to another gateway: money would move somewhere you didn't choose)
 *   2. otherwise the product's normal gateway if it supports subscriptions, else any configured one that does
 */
export const pickSubscriptionGateway = (product) => {
  const ok = (id) => ADAPTERS[id]?.supportsSubscriptions && credentialsFor(id, resolveMode(product, id));
  const chosen = subscriptionGatewayId(product);
  if (chosen) {
    if (!ADAPTERS[chosen]?.supportsSubscriptions) throw new PaymentError(503, "Monthly billing isn't set up yet. Please try again later.", "SUBSCRIPTIONS_NOT_CONFIGURED", `SUBSCRIPTION_PAYMENT_GATEWAY=${chosen} is not a gateway that supports subscriptions (use razorpay or cashfree)`);
    if (!ok(chosen)) { console.error(`[payments] SUBSCRIPTION_PAYMENT_GATEWAY=${chosen} but its ${chosen.toUpperCase()}_* keys are missing or don't match the mode.`); throw new PaymentError(503, "Monthly billing isn't set up yet. Please try again later.", "SUBSCRIPTIONS_NOT_CONFIGURED"); }
    return chosen;
  }
  const env = resolvePayment(product).gateway;
  if (ok(env)) return env;
  const any = GATEWAY_IDS.find(ok);
  if (any) return any;
  throw new PaymentError(503, "Monthly billing isn't set up yet. Please try again later.", "SUBSCRIPTIONS_NOT_CONFIGURED");
};

/**
 * @param {object} p
 * @param {string} p.product          "REFERRAL" ...
 * @param {string} [p.gateway]        use pickSubscriptionGateway()
 * @param {string} p.ref              our id for this subscription (stored on the gateway)
 * @param {{key,name,amountPaise,period?,interval?,gatewayPlanId?}} p.plan   period "monthly" (default) | "yearly" | "weekly" | "daily"
 * @param {{id,name,email,rawPhone?}} p.customer
 * @param {number} [p.totalCycles]    how many charges at most (default 120 = 10 years of months)
 * @returns {{gateway, mode, gatewaySubscriptionId, gatewayPlanId, checkout}}
 */
export const createSubscription = async (p) => {
  const amountPaise = Number(p.plan?.amountPaise);
  if (!Number.isInteger(amountPaise) || amountPaise <= 0) throw new PaymentError(400, "Invalid plan amount.", "INVALID_AMOUNT");
  if (!p.customer?.email) throw new PaymentError(400, "A customer email is required.", "CUSTOMER_EMAIL_MISSING");
  const ctx = ctxFor(p.product, { gateway: p.gateway, mode: p.mode });
  const out = await wrap(ctx, "createSubscription", () => ctx.adapter.createSubscription(ctx, { ...p, currency: p.currency || "INR" }));
  return { gateway: ctx.gateway, mode: ctx.mode, ...out };
};

export const verifySubscriptionPayment = async (p) => {
  const ctx = ctxFor(p.product, p);
  return wrap(ctx, "verifySubscriptionPayment", () => ctx.adapter.verifySubscriptionClient(ctx, { gatewaySubscriptionId: p.gatewaySubscriptionId, proof: p.proof }));
};
export const fetchSubscription = async (p) => {
  const ctx = ctxFor(p.product, p);
  return wrap(ctx, "fetchSubscription", () => ctx.adapter.fetchSubscription(ctx, { gatewaySubscriptionId: p.gatewaySubscriptionId }));
};
export const listSubscriptionCharges = async (p) => {
  const ctx = ctxFor(p.product, p);
  return wrap(ctx, "listSubscriptionCharges", () => ctx.adapter.listSubscriptionCharges(ctx, { gatewaySubscriptionId: p.gatewaySubscriptionId }));
};
export const cancelSubscription = async (p) => {
  const ctx = ctxFor(p.product, p);
  return wrap(ctx, "cancelSubscription", () => ctx.adapter.cancelSubscription(ctx, { gatewaySubscriptionId: p.gatewaySubscriptionId, atCycleEnd: Boolean(p.atCycleEnd) }));
};
/** { valid, subscription: boolean, ignore?, event? }. `subscription:false` means "not mine, let the order webhook look at it". */
export const parseSubscriptionWebhook = ({ product, gateway, mode, rawBody, headers }) => {
  let ctx;
  try { ctx = ctxFor(product, { gateway, mode }); } catch { return { valid: false, subscription: false }; }
  if (!ctx.adapter.parseSubscriptionWebhook) return { valid: false, subscription: false };
  return ctx.adapter.parseSubscriptionWebhook(ctx, { rawBody, headers: headers || {} });
};
