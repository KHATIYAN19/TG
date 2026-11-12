/*
  PAYMENT GATEWAY  -  the one place the front-end reads gateway env variables.
  ============================================================================
  The SERVER decides which gateway really charges (backend .env: PAYMENT_GATEWAY / <PRODUCT>_PAYMENT_GATEWAY;
  test or live follows the keys) and tells the browser what to open through the `checkout` it returns
  (checkout.type = "cashfree" | "razorpay" | "form_post"; Cashfree's sandbox/production comes with it).
  These variables only name the gateway for display, and as the "preferred" hint sent with a request:

    VITE_PAYMENT_GATEWAY            global default            cashfree | razorpay | payu
    VITE_BOOKS_PAYMENT_GATEWAY      per-product override
    VITE_ARENA_PAYMENT_GATEWAY
    VITE_MEMORIES_PAYMENT_GATEWAY
*/
const clean = (v) => String(v ?? "").trim().toLowerCase().replace(/^"|"$/g, "");

const METHODS = ["UPI", "Debit & credit cards", "Net banking", "Wallets"];

/* To show a new gateway in the UI, add one line here (its name and the methods it offers). */
export const GATEWAYS = {
  cashfree: { label: "Cashfree", methods: METHODS },
  razorpay: { label: "Razorpay", methods: METHODS },
  payu: { label: "PayU", methods: METHODS },
};

const ENV = import.meta.env;

const PER_PRODUCT = {
  books: ENV.VITE_BOOKS_PAYMENT_GATEWAY,
  arena: ENV.VITE_ARENA_PAYMENT_GATEWAY,
  memories: ENV.VITE_MEMORIES_PAYMENT_GATEWAY,
};

/** The gateway this product prefers: its own variable, then the global one, then Cashfree. */
export const preferredGateway = (product) => {
  const id = clean(PER_PRODUCT[String(product).toLowerCase()]) || clean(ENV.VITE_PAYMENT_GATEWAY);
  return GATEWAYS[id] ? id : "cashfree";
};

export const gatewayLabel = (id) => GATEWAYS[id]?.label || id || "";


/** What a screen shows about the gateway: { id, label, methods }. `serverId` (what the API reported) wins over the env. */
export const gatewayInfo = (product, serverId) => {
  const id = GATEWAYS[clean(serverId)] ? clean(serverId) : preferredGateway(product);
  return { id, ...GATEWAYS[id] };
};
