/*
  PAYMENT CONFIG  -  the only file that reads payment env variables.
  ==================================================================

  1. WHICH GATEWAY  (cashfree | razorpay | payu)
       <PRODUCT>_PAYMENT_GATEWAY   e.g. ARENA_PAYMENT_GATEWAY=razorpay   (per-product override)
       PAYMENT_GATEWAY             global default
       (legacy alias: MEMORY_PAYMENT_GATEWAY)
       default: cashfree

  2. CREDENTIALS  (one set per gateway, test or live keys, whichever you put in)
       CASHFREE_APP_ID, CASHFREE_SECRET_KEY, CASHFREE_ENV (sandbox | production), CASHFREE_API_VERSION
       RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
       PAYU_KEY, PAYU_SALT, PAYU_MODE (test | production)

  3. TEST OR LIVE  is read from the gateway's own variable, so the mode can never disagree with the keys:
       Cashfree: CASHFREE_ENV  (production = live, sandbox = test)
       PayU:     PAYU_MODE     (production = live, otherwise test)
       Razorpay: the key prefix (rzp_live_ = live, rzp_test_ = test)

  PRODUCT is one of: BOOKS, ARENA, MEMORIES  (any new product can be added without touching this file).
*/

export const GATEWAY_IDS = ["cashfree", "razorpay", "payu"];

const env = (name) => String(process.env[name] ?? "").trim();
const first = (...names) => names.map(env).find(Boolean) || "";

const normMode = (v) => {
  const s = String(v || "").trim().toLowerCase();
  if (["live", "production", "prod"].includes(s)) return "live";
  if (["test", "sandbox", "development", "dev"].includes(s)) return "test";
  return "";
};

/** Mode of one gateway, from its own variable. */
const gatewayMode = (gateway) => {
  if (gateway === "cashfree") return normMode(env("CASHFREE_ENV")) || "test";
  if (gateway === "payu") return normMode(env("PAYU_MODE")) || "test";
  if (gateway === "razorpay") return env("RAZORPAY_KEY_ID").startsWith("rzp_live_") ? "live" : "test";
  return "test";
};

const productKey = (product) => String(product || "").trim().toUpperCase();

export const resolveGatewayId = (product, override) => {
  const p = productKey(product);
  const aliases = p === "MEMORIES" ? ["MEMORY_PAYMENT_GATEWAY"] : [];
  const id = String(override || first(`${p}_PAYMENT_GATEWAY`, ...aliases, "PAYMENT_GATEWAY") || "cashfree").toLowerCase();
  return id;
};

export const resolveMode = (_product, gateway) => gatewayMode(gateway);

/** Credentials for one gateway, or null when they are not set. `mode` is the one the keys belong to. */
export const credentialsFor = (gateway, mode = gatewayMode(gateway)) => {
  if (mode !== gatewayMode(gateway)) return null; // e.g. a live payment can never use sandbox keys

  if (gateway === "cashfree") {
    const appId = first("CASHFREE_APP_ID", "CASHFREE_CLIENT_ID");
    const secret = first("CASHFREE_SECRET_KEY", "CASHFREE_CLIENT_SECRET");
    if (!appId || !secret) return null;
    return {
      appId,
      secret,
      apiVersion: env("CASHFREE_API_VERSION") || "2025-01-01",
      baseUrl: mode === "live" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg",
      sdkMode: mode === "live" ? "production" : "sandbox",
    };
  }

  if (gateway === "razorpay") {
    const keyId = first("RAZORPAY_KEY_ID");
    const secret = first("RAZORPAY_KEY_SECRET");
    if (!keyId || !secret) return null;
    return { keyId, secret, webhookSecret: first("RAZORPAY_WEBHOOK_SECRET") };
  }

  if (gateway === "payu") {
    const key = first("PAYU_KEY", "PAYU_MERCHANT_KEY");
    const salt = first("PAYU_SALT", "PAYU_MERCHANT_SALT");
    if (!key || !salt) return null;
    return {
      key,
      salt,
      paymentUrl: mode === "live" ? "https://secure.payu.in/_payment" : "https://test.payu.in/_payment",
      verifyUrl: mode === "live" ? "https://info.payu.in/merchant/postservice.php?form=2" : "https://test.payu.in/merchant/postservice.php?form=2",
    };
  }

  return null;
};

/** Everything the processor needs for one call: which gateway, which mode, which keys. */
export const resolvePayment = (product, { gateway: override, mode: modeOverride } = {}) => {
  const gateway = resolveGatewayId(product, override);
  const mode = normMode(modeOverride) || gatewayMode(gateway);
  return { product: productKey(product), gateway, mode, credentials: credentialsFor(gateway, mode) };
};

/** Public base URL of this backend (for callbacks and webhooks). */
export { BACKEND_URL, FRONTEND_URL } from "../../config/urls.js";
