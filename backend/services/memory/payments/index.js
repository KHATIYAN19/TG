import { BACKEND_URL } from "../../../config/urls.js";
import { cashfreeAdapter as cashfree, razorpayAdapter as razorpay, payuAdapter as payu } from "./processorAdapters.js";
import { resolveGatewayId } from "../../payments/config.js";
import mock from "./mock.js";

/*
  PAYMENT GATEWAY REGISTRY
  ------------------------
  To add a gateway, create an adapter in this folder and list it below. An adapter is:

    {
      id: "stripe",                       // stored on every order
      label: "Stripe",                    // shown to users / admin
      isConfigured(): boolean,            // true when its env keys are present
      createCheckout({ order, user, amountPaise, urls })
          -> { gatewayOrderId, checkout }  // `checkout` tells the front-end what to do:
                                           //   { type:"razorpay"|"cashfree"|"form_post"|"redirect"|"mock", ... }
      fetchStatus(order)                   // ask the gateway: -> { paid, paymentId, amountPaise }
      verifyClient?(order, payload)        // optional: verify a signed browser callback
      parseCallback?(body)                 // optional: redirect gateways -> { gatewayOrderId }
      parseWebhook?({ rawBody, headers })  // optional: -> { valid, ignore?, gatewayOrderId }
    }

  `urls.callback(id)` and `urls.webhook(id)` give the public URLs of this backend.
  Nothing else in the app changes: orders, credits, admin screens and the user API are gateway-neutral.
*/
const ADAPTERS = [cashfree, razorpay, payu, mock]; // order = preference when the admin has not chosen a default
const byId = new Map(ADAPTERS.map((a) => [a.id, a]));

export const knownGateways = () => ADAPTERS.map((a) => ({ id: a.id, label: a.label, configured: a.isConfigured() }));
export const getGateway = (id) => byId.get(String(id));

/*
  WHICH GATEWAY IS USED
  The preferred gateway comes from MEMORIES_PAYMENT_GATEWAY / PAYMENT_GATEWAY (cashfree | razorpay | payu), default cashfree; test or live follows the keys (CASHFREE_ENV, PAYU_MODE, rzp_ key).
  - If it has its keys set, it is always offered and is the default, even when the admin's saved list or default says otherwise.
  - Other configured gateways are offered only if the admin switched them on in Settings (until then, every real one is).
  - If the preferred gateway has no keys, the admin's default, then the first available one, is used.
*/
const DEFAULT_ENABLED = ["cashfree", "razorpay", "payu"]; // the mock stays opt-in
export const preferredGatewayId = () => resolveGatewayId("MEMORIES");

/** Gateways a user can actually pay with: configured AND switched on by the admin (the preferred one is always on), preferred first. */
export const activeGateways = (settings) => {
  const pref = preferredGatewayId();
  const on = new Set(settings?.enabledGateways?.length ? settings.enabledGateways : DEFAULT_ENABLED);
  on.add(pref);
  return ADAPTERS.filter((a) => a.isConfigured() && on.has(a.id)).sort((a, b) => (b.id === pref) - (a.id === pref));
};

export const pickGateway = (settings, requested) => {
  const active = activeGateways(settings);
  if (!active.length) return null;
  if (requested) return active.find((a) => a.id === requested) || null;
  return active.find((a) => a.id === preferredGatewayId()) || active.find((a) => a.id === settings?.defaultGateway) || active[0];
};

/** Public URLs of this backend for one order. `ref` lets the return trip find the order again. */
export const publicUrls = (orderId) => {
  const base = BACKEND_URL;
  return {
    base,
    callback: (id) => `${base}/api/memories/payments/callback/${id}?ref=${orderId}`,
    webhook: (id) => `${base}/api/memories/payments/webhook/${id}`,
  };
};
