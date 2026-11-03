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
const KNOWN = {
  cashfree: {
    name: "Cashfree",
    methods: ["UPI", "Debit & credit cards", "Net banking", "Wallets"],
  },
  razorpay: {
    name: "Razorpay",
    methods: ["UPI", "Debit & credit cards", "Net banking", "Wallets"],
  },
};

const clean = (v) => String(v ?? "").trim().toLowerCase().replace(/^"|"$/g, "");

export const ENV_GATEWAY = clean(import.meta.env.VITE_ARENA_PAYMENT_GATEWAY);

let warned = false;

export const resolveGateway = (serverValue) => {
  const server = clean(serverValue);
  const key = KNOWN[server] ? server : KNOWN[ENV_GATEWAY] ? ENV_GATEWAY : null;

  if (import.meta.env.DEV && !warned && KNOWN[server] && KNOWN[ENV_GATEWAY] && server !== ENV_GATEWAY) {
    warned = true;
    console.warn(
      `[arena] VITE_ARENA_PAYMENT_GATEWAY="${ENV_GATEWAY}" but the server charges via "${server}". ` +
        "Showing the server's value. Set both to the same gateway."
    );
  }

  return key ? { key, ...KNOWN[key] } : null;
};
