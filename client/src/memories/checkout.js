import { memoriesHttp } from "../arena/api";

/*
  CHECKOUT RUNNERS: one small function per kind of checkout the server can ask for.
  The server returns `checkout: { type, ... }` for whichever gateway was chosen (see paymentGateway.js).
  A runner resolves { status: "paid" | "pending" | "failed" | "dismissed" | "redirect" }.
  Nothing here decides that a payment worked: only the server does, after asking the gateway itself.
*/
const loadScript = (id, src, ready) =>
  new Promise((resolve) => {
    if (ready()) return resolve(true);
    let s = document.getElementById(id);
    if (!s) { s = document.createElement("script"); s.id = id; s.src = src; s.async = true; document.body.appendChild(s); }
    s.addEventListener("load", () => resolve(ready()));
    s.addEventListener("error", () => resolve(false));
  });

const CANT_LOAD = "Couldn't load the payment window. Check your connection and try again.";
const verify = async (orderId, payload) => (await memoriesHttp.post("/payments/verify", { orderId, payload })).data?.data?.status;

export const RUNNERS = {
  /* Razorpay: a pop-up window; the signed result goes to the server to verify */
  async razorpay({ checkout, orderId, user }) {
    if (!(await loadScript("rzp-sdk", "https://checkout.razorpay.com/v1/checkout.js", () => Boolean(window.Razorpay)))) throw new Error(CANT_LOAD);
    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: checkout.keyId, amount: checkout.amount, currency: checkout.currency, order_id: checkout.orderId,
        name: "Memories by Target Trek", description: "1 page credit", theme: { color: "#f43f6e" },
        prefill: { name: user?.name || "", email: user?.email || "" },
        handler: async (r) => { try { resolve({ status: await verify(orderId, r) }); } catch (e) { reject(e); } },
        modal: { ondismiss: () => resolve({ status: "dismissed" }) },
      });
      rzp.on("payment.failed", () => resolve({ status: "failed" }));
      rzp.open();
    });
  },

  /* Cashfree: hand the session to Cashfree's hosted checkout. It returns through the server to /memories/payment-result */
  async cashfree({ checkout }) {
    if (!(await loadScript("cashfree-sdk", "https://sdk.cashfree.com/js/v3/cashfree.js", () => Boolean(window.Cashfree)))) throw new Error(CANT_LOAD);
    const cf = window.Cashfree({ mode: /prod/i.test(checkout.environment || "") ? "production" : "sandbox" });
    cf.checkout({ paymentSessionId: checkout.paymentSessionId, redirectTarget: "_self" });
    return { status: "redirect" };
  },

  /* PayU (and any gateway that wants a form POST): submit a form to the gateway */
  async form_post({ checkout }) {
    const form = document.createElement("form");
    form.method = "POST"; form.action = checkout.url; form.style.display = "none";
    Object.entries(checkout.fields || {}).forEach(([k, v]) => { const i = document.createElement("input"); i.type = "hidden"; i.name = k; i.value = v; form.appendChild(i); });
    document.body.appendChild(form);
    form.submit();
    return { status: "redirect" };
  },

  /* a gateway that just gives a link to open */
  async redirect({ checkout }) {
    window.location.assign(checkout.url);
    return { status: "redirect" };
  },

  /* development only: the server confirms immediately */
  async mock({ orderId }) {
    return { status: await verify(orderId, { paymentId: "mock_payment" }) };
  },
};

export async function runCheckout(args) {
  const run = RUNNERS[args.checkout?.type];
  if (!run) throw new Error("This payment method isn't supported yet.");
  return run(args);
}
