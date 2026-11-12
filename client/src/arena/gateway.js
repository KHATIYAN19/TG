/*
  PAYMENT GATEWAY (display)
  -------------------------
  VITE_ARENA_PAYMENT_GATEWAY   cashfree | razorpay

  The SERVER decides which gateway actually charges the member
  (backend env ARENA_PAYMENT_GATEWAY) and reports it in /api/arena/public and
  /api/arena/me. The UI always prefers that value, so the page can never name
  a gateway that isn't really being used. This env variable is the fallback
  shown while the server's answer is loading (or if the call fails).
*/
import { GATEWAYS } from "../payment/gatewayConfig.js";

// Every gateway the shared config knows (Cashfree, Razorpay, PayU, ...). Add a new one there, not here.
const KNOWN = Object.fromEntries(Object.entries(GATEWAYS).map(([id, g]) => [id, { name: g.label, methods: g.methods }]));

const clean = (v) => String(v ?? "").trim().toLowerCase().replace(/^"|"$/g, "");

import { preferredGateway } from "../payment/gatewayConfig.js";

export const ENV_GATEWAY = clean(import.meta.env.VITE_ARENA_PAYMENT_GATEWAY || import.meta.env.VITE_PAYMENT_GATEWAY) && preferredGateway("arena");


export const resolveGateway = (serverValue) => {
  const server = clean(serverValue);
  const key = KNOWN[server] ? server : KNOWN[ENV_GATEWAY] ? ENV_GATEWAY : null;

  return key ? { key, ...KNOWN[key] } : null;
};
