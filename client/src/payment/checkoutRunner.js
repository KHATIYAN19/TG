/*
  CHECKOUT RUNNER  -  the one place that opens a payment window, for Books, Prep Arena and Memories.
  ====================================================================================================
  Every product sends ONE create request to its own API. The server answers with a `checkout` descriptor for
  whichever gateway the backend chose, and this file turns that into the right browser action:

      checkout.type   what happens
      -------------   --------------------------------------------------------------------------------
      "cashfree"      Cashfree's hosted checkout (page redirects, then comes back through the server)
      "razorpay"      Razorpay popup; the signed result is handed to `onPaid` (your product's verify call)
      "form_post"     auto-submitted form POST to the gateway (PayU)
      "redirect"      plain redirect to checkout.url

  ADD A NEW GATEWAY: if it fits one of the types above, the backend alone is enough (services/payments).
  If it needs a new browser action, add one runner with `registerRunner("mytype", async (args) => ...)`.

  runCheckout({ checkout, onPaid, prefill, name, description, theme }) resolves one of:
      { status: "redirect" }                  the browser is leaving for the gateway (Cashfree / PayU)
      { status: "dismissed" }                 the buyer closed the popup
      { status: "failed", message }           the gateway reported a failure
      whatever `onPaid(response)` returned    popup finished; onPaid verified it with your server
  Nothing here decides that a payment worked: only the server does, after asking the gateway itself.
*/
const CANT_LOAD = "Couldn't load the payment window. Check your connection and try again.";

const loadScript = (id, src, ready) =>
  new Promise((resolve) => {
    if (ready()) return resolve(true);
    let s = document.getElementById(id);
    if (!s) {
      s = document.createElement("script");
      s.id = id;
      s.src = src;
      s.async = true;
      document.body.appendChild(s);
    }
    s.addEventListener("load", () => resolve(ready()));
    s.addEventListener("error", () => resolve(false));
  });

/* Only one Razorpay window may exist at a time: a second tap (or a re-render) must never stack another on top. */
let activeRzp = null;
const closeActiveRzp = () => {
  try { activeRzp?.close(); } catch { /* already closed */ }
  activeRzp = null;
};

const RUNNERS = {
  async cashfree({ checkout }) {
    if (!(await loadScript("cashfree-sdk", "https://sdk.cashfree.com/js/v3/cashfree.js", () => Boolean(window.Cashfree)))) throw new Error(CANT_LOAD);
    if (!checkout.paymentSessionId) throw new Error("Invalid payment session received from server.");
    const mode = /prod|live/i.test(checkout.environment || checkout.mode || "") ? "production" : "sandbox";
    const result = await window.Cashfree({ mode }).checkout({ paymentSessionId: checkout.paymentSessionId, redirectTarget: "_self" });
    if (result?.error) throw new Error(result.error.message || "Unable to open the payment window.");
    return { status: "redirect" };
  },

  async razorpay({ checkout, onPaid, prefill, name, description, theme }) {
    if (!(await loadScript("rzp-sdk", "https://checkout.razorpay.com/v1/checkout.js", () => Boolean(window.Razorpay)))) throw new Error(CANT_LOAD);
    const key = checkout.keyId || checkout.key;
    const orderId = checkout.orderId || checkout.razorpayOrderId;
    const subscriptionId = checkout.subscriptionId; // recurring billing: Razorpay charges the first period now, then every period
    if (!key || (subscriptionId ? false : !orderId || !checkout.amount)) throw new Error("Invalid payment information received from server.");

    closeActiveRzp();

    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (fn, value) => {
        if (settled) return;
        settled = true;
        if (activeRzp === rzp) activeRzp = null;
        fn(value);
      };
      const rzp = new window.Razorpay({
        key,
        ...(subscriptionId ? { subscription_id: subscriptionId } : { amount: checkout.amount, currency: checkout.currency || "INR", order_id: orderId }),
        name: name || checkout.name || "Target Trek",
        description: description || checkout.description || "",
        prefill: { ...(checkout.prefill || {}), ...Object.fromEntries(Object.entries(prefill || {}).filter(([, v]) => v)) },
        theme: { color: theme || "#f97316" },
        retry: { enabled: true },
        handler: async (response) => {
          try {
            finish(resolve, (await onPaid?.(response)) || { status: "paid" });
          } catch (e) {
            finish(reject, e);
          }
        },
        modal: { ondismiss: () => finish(resolve, { status: "dismissed" }) },
      });
      // The caller treats "failed" as final (it shows the error and re-enables its own button), so close the
      // Razorpay window too. Leaving it open is what made it linger on screen after the app moved on.
      rzp.on("payment.failed", (r) => {
        finish(resolve, { status: "failed", message: r?.error?.description || "Payment failed. Please try again." });
        try { rzp.close(); } catch { /* already closed */ }
      });
      activeRzp = rzp;
      rzp.open();
    });
  },

  /* Cashfree recurring billing: hosted mandate + first payment page, then back to the return url (the server checks with Cashfree) */
  async cashfree_subscription({ checkout }) {
    if (!(await loadScript("cashfree-sdk", "https://sdk.cashfree.com/js/v3/cashfree.js", () => Boolean(window.Cashfree)))) throw new Error(CANT_LOAD);
    if (!checkout.subscriptionSessionId) throw new Error("Invalid payment session received from server.");
    const mode = /prod|live/i.test(checkout.environment || checkout.mode || "") ? "production" : "sandbox";
    const result = await window.Cashfree({ mode }).subscriptionsCheckout({ subsSessionId: checkout.subscriptionSessionId, redirectTarget: "_self" });
    if (result?.error) throw new Error(result.error.message || "Unable to open the payment window.");
    return { status: "redirect" };
  },

  async form_post({ checkout }) {
    if (!checkout.url || !checkout.fields) throw new Error("Invalid payment information received from server.");
    const form = document.createElement("form");
    form.method = "POST";
    form.action = checkout.url;
    form.style.display = "none";
    Object.entries(checkout.fields).forEach(([k, v]) => {
      const i = document.createElement("input");
      i.type = "hidden";
      i.name = k;
      i.value = v ?? "";
      form.appendChild(i);
    });
    document.body.appendChild(form);
    form.submit();
    return { status: "redirect" };
  },

  async redirect({ checkout }) {
    window.location.assign(checkout.url);
    return { status: "redirect" };
  },
};

/** Add (or replace) the browser action for a checkout type. */
export const registerRunner = (type, fn) => {
  RUNNERS[type] = fn;
};

export const runCheckout = async (args) => {
  const run = RUNNERS[args?.checkout?.type];
  if (!run) throw new Error("This payment method isn't supported yet.");
  return run(args);
};
