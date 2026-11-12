import crypto from "crypto";
import { PaymentError } from "./errors.js";
import { GATEWAY_IDS, resolvePayment, credentialsFor, resolveMode } from "./config.js";
import cashfree from "./gateways/cashfree.js";
import razorpay from "./gateways/razorpay.js";
import payu from "./gateways/payu.js";

/*
  PAYMENT PROCESSOR
  =================
  The only code in the project that talks to a payment gateway. Books, Prep Arena, Memories (and anything
  added later) each have their own API that validates its own request, then calls this:

     1. createPayment(...)   -> starts a payment on the gateway chosen by the .env
                                (returns what the browser needs: a `checkout` descriptor)
     2. verifyPayment(...)   -> asks the gateway what really happened and checks the amount
     3. parseWebhook / parseCallback / refund  -> the other gateway-specific moments

  The caller never knows which gateway it is. It stores `gateway` (and `mode`) on its own order, and passes them
  back on later calls, so a payment started on Razorpay is always checked on Razorpay even if the .env changes.
*/
const ADAPTERS = { cashfree, razorpay, payu };

const clean = (v) => String(v ?? "").trim();
const mask = (s) => (s ? `${s.slice(0, 4)}…` : "");

const adapterFor = (gateway) => {
  const a = ADAPTERS[gateway];
  if (!a) throw new PaymentError(400, "That payment method is not supported.", "UNSUPPORTED_GATEWAY");
  return a;
};

const contextFor = (product, { gateway, mode } = {}) => {
  const ctx = resolvePayment(product, { gateway, mode });
  const adapter = adapterFor(ctx.gateway);
  if (!ctx.credentials) {
    console.error(
      `[payments] ${ctx.product}: ${ctx.gateway} (${ctx.mode}) has no credentials. Check the ${ctx.gateway.toUpperCase()}_* variables in .env (keys must match ${ctx.mode} mode).`
    );
    throw new PaymentError(503, "Payments are not available right now. Please try again later.", "GATEWAY_NOT_CONFIGURED");
  }
  return { ...ctx, adapter };
};

/** Gateway failures become our own safe error; the real reason is logged, never relayed. */
const wrap = async (ctx, action, fn) => {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof PaymentError) throw e;
    const detail = ctx.adapter.describeError?.(e) || e?.message || "unknown error";
    const http = ctx.adapter.httpStatus?.(e);
    const keyHint =
      http === 401 || http === 403
        ? ` (credentials rejected: check the ${ctx.gateway.toUpperCase()}_* keys: ${ctx.mode} keys are needed)`
        : "";
    console.error(`[payments] ${ctx.product}/${ctx.gateway}/${ctx.mode} ${action} failed: ${detail}${keyHint}`);
    const bad = http === 400;
    throw new PaymentError(bad ? 400 : 502, "The payment provider couldn't process this. Please try again in a moment.", "GATEWAY_ERROR", detail);
  }
};

/* ------------------------------------------------------------------ */

/**
 * Start a payment.
 *
 * @param {object} p
 * @param {string} p.product       "BOOKS" | "ARENA" | "MEMORIES" | ... (selects the .env overrides)
 * @param {string} [p.gateway]     force a gateway (otherwise from the .env)
 * @param {string} p.orderRef      our unique id for this payment (<= 40 chars, letters/digits/_-)
 * @param {number} p.amountPaise   integer paise
 * @param {string} [p.currency]    default INR
 * @param {{id,name,email,phone?}} p.customer   phone: 10 digits for Cashfree/PayU
 * @param {string} p.returnUrl     where the gateway sends the browser back to
 * @param {string} [p.webhookUrl]  server-to-server notification url
 * @param {string} [p.description]
 * @param {object} [p.notes]       small key/value tags stored on the gateway order
 * @returns {{gateway, mode, gatewayOrderId, amountPaise, currency, checkout}}
 */
export const createPayment = async (p) => {
  const amountPaise = Number(p.amountPaise);
  if (!Number.isInteger(amountPaise) || amountPaise <= 0) throw new PaymentError(400, "Invalid payment amount.", "INVALID_AMOUNT");
  if (!clean(p.orderRef) || !/^[A-Za-z0-9_-]{1,40}$/.test(p.orderRef)) throw new PaymentError(500, "Invalid order reference.", "INVALID_ORDER_REF");
  if (!clean(p.returnUrl)) throw new PaymentError(500, "A return url is required.", "RETURN_URL_MISSING");
  if (!p.customer?.email) throw new PaymentError(400, "A customer email is required.", "CUSTOMER_EMAIL_MISSING");

  const ctx = contextFor(p.product, { gateway: p.gateway, mode: p.mode });

  // Cashfree and PayU insist on a 10 digit mobile number. The caller provides it already cleaned.
  const needsPhone = ctx.gateway === "cashfree" || ctx.gateway === "payu";
  if (needsPhone && !/^\d{10}$/.test(String(p.customer.phone || ""))) {
    throw new PaymentError(400, "There is no valid mobile number on your account. Please contact support.", "PHONE_UNAVAILABLE");
  }

  const req = {
    orderRef: p.orderRef,
    amountPaise,
    currency: clean(p.currency) || "INR",
    customer: { ...p.customer, phone: String(p.customer.phone || "") },
    returnUrl: p.returnUrl,
    webhookUrl: p.webhookUrl,
    description: p.description,
    notes: p.notes,
    merchantName: p.merchantName,
  };

  const out = await wrap(ctx, "createPayment", () => ctx.adapter.createOrder(ctx, req));
  return { gateway: ctx.gateway, mode: ctx.mode, gatewayOrderId: out.gatewayOrderId, amountPaise, currency: req.currency, checkout: out.checkout };
};

/**
 * Ask the gateway what happened, and check the amount.
 *
 * @param {object} p
 * @param {string} p.product
 * @param {string} p.gateway          the gateway stored on the order
 * @param {string} [p.mode]           the mode stored on the order (defaults to the current .env mode)
 * @param {string} p.gatewayOrderId   as returned by createPayment
 * @param {number} p.expectedAmountPaise   what we asked the buyer to pay
 * @param {object} [p.proof]          the browser's own evidence (Razorpay: razorpay_payment_id + razorpay_signature)
 * @returns {{status: "paid"|"pending"|"failed", paymentId?, amountPaise?, method?, raw?, reason?}}
 *          Only "paid" with a matching amount means money was received. Safe to call repeatedly.
 */
export const verifyPayment = async (p) => {
  const ctx = contextFor(p.product, { gateway: p.gateway, mode: p.mode });
  const ref = { gatewayOrderId: p.gatewayOrderId };

  const result = await wrap(ctx, "verifyPayment", async () => {
    if (p.proof && ctx.adapter.verifyClient) return ctx.adapter.verifyClient(ctx, { ...ref, proof: p.proof });
    return ctx.adapter.fetchStatus(ctx, ref);
  });

  if (result.status === "paid" && Number(result.amountPaise) !== Number(p.expectedAmountPaise)) {
    console.error(`[payments] ${ctx.product}/${ctx.gateway} amount mismatch on ${p.gatewayOrderId}: expected ${p.expectedAmountPaise}, gateway says ${result.amountPaise}`);
    return { status: "failed", reason: "AMOUNT_MISMATCH", paymentId: result.paymentId, amountPaise: result.amountPaise };
  }
  // `raw` is the gateway's own payload: for server-side records only, never send it to a browser.
  return result;
};

/** Gateway -> server notification. Returns { valid, ignore?, gatewayOrderId? }. The caller should still run verifyPayment. */
export const parseWebhook = ({ product, gateway, mode, rawBody, headers }) => {
  const ctx = contextFor(product, { gateway, mode });
  if (!ctx.adapter.parseWebhook) return { valid: false };
  return ctx.adapter.parseWebhook(ctx, { rawBody, headers: headers || {} });
};

/** Browser returned from a redirect gateway (PayU posts the result). Only a hint: always follow with verifyPayment. */
export const parseCallback = ({ product, gateway, mode, body }) => {
  const ctx = contextFor(product, { gateway, mode });
  return ctx.adapter.parseCallback ? ctx.adapter.parseCallback(ctx, body || {}) : { gatewayOrderId: null };
};

/** Refund (full or partial). `refundId` must be unique per attempt so a retry can't refund twice. */
export const refundPayment = async (p) => {
  const ctx = contextFor(p.product, { gateway: p.gateway, mode: p.mode });
  const amountPaise = Number(p.amountPaise);
  if (!Number.isInteger(amountPaise) || amountPaise <= 0) throw new PaymentError(400, "Invalid refund amount.", "INVALID_AMOUNT");
  return wrap(ctx, "refund", () =>
    ctx.adapter.refund(ctx, { gatewayOrderId: p.gatewayOrderId, paymentId: p.paymentId, amountPaise, refundId: p.refundId, note: p.note })
  );
};

/* ------------------------------ helpers ------------------------------ */

/** A unique order reference. Prefix keeps orders recognisable in the gateway dashboard (e.g. "MEM", "ARENA", "BOOK"). */
export const newOrderRef = (prefix = "PAY") => `${String(prefix).replace(/[^A-Za-z0-9]/g, "").slice(0, 8)}_${Date.now().toString(36)}${crypto.randomBytes(5).toString("hex")}`;

/** Which gateways are configured for a product right now (for admin screens / the public config). */
export const paymentStatus = (product) => {
  const current = resolvePayment(product);
  return {
    product: current.product,
    gateway: current.gateway,
    mode: current.mode,
    ready: Boolean(current.credentials),
    gateways: GATEWAY_IDS.map((id) => {
      const mode = resolveMode(product, id);
      return { id, mode, configured: Boolean(credentialsFor(id, mode)) };
    }),
  };
};

/**
 * The gateway to use for a product: the buyer's/browser's preferred one when it is supported AND configured,
 * otherwise the one from the .env. (A preference can never select a gateway that has no keys.)
 */
export const pickGateway = (product, preferred) => {
  const want = String(preferred || "").trim().toLowerCase();
  if (want && GATEWAY_IDS.includes(want) && credentialsFor(want, resolveMode(product, want))) return want;
  return resolvePayment(product).gateway;
};

export const isGatewaySupported = (id) => GATEWAY_IDS.includes(String(id));
export const _debug = { mask };
