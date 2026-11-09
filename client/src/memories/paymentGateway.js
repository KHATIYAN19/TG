/*
  MEMORIES PAYMENT GATEWAY: the one place to change it.
  Set VITE_MEMORIES_PAYMENT_GATEWAY (cashfree | razorpay | payu | mock) in the client .env. Default: cashfree.
  Everything else (the pay page, the checkout window, the return page) reads from here, so changing the name is all it takes.
  To support a NEW gateway: add it to GATEWAYS below and add a runner for its `checkout.type` in checkout.js.
*/
export const GATEWAYS = {
  cashfree: { label: "Cashfree" },
  razorpay: { label: "Razorpay" },
  payu: { label: "PayU" },
  mock: { label: "Test payment" },
};

const asked = String(import.meta.env.VITE_MEMORIES_PAYMENT_GATEWAY || "cashfree").trim().toLowerCase();
export const PREFERRED_GATEWAY = GATEWAYS[asked] ? asked : "cashfree";

/** The gateway to use now: the preferred one if the server offers it, otherwise whatever the server defaults to. */
export const chooseGateway = (cfg) => {
  const offered = (cfg?.gateways || []).map((g) => g.id);
  if (offered.includes(PREFERRED_GATEWAY)) return PREFERRED_GATEWAY;
  return cfg?.defaultGateway || offered[0] || null;
};

export const gatewayLabel = (id) => GATEWAYS[id]?.label || id || "";
