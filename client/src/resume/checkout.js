import { registerRunner, runCheckout as run } from "../payment/checkoutRunner.js";
import { buyPlan, payPlan, verifyPayment } from "./api";

/*
  RESUME LAB CHECKOUT
  The server picks the gateway and answers with a `checkout`; the shared runner opens it. Nothing here decides that a payment
  worked: only the server does, after asking the gateway itself.
*/
registerRunner("mock", async ({ orderId }) => ({ status: (await verifyPayment(orderId, { paymentId: "mock_payment" }))?.status }));

const open = async (pay, description, user) =>
  ({
    purchaseId: pay.purchaseId,
    ...(await run({
      checkout: pay.checkout,
      orderId: pay.purchaseId,
      name: "Resume Lab by Target Trek",
      description,
      theme: "#ea580c",
      prefill: { name: user?.name || "", email: user?.email || "" },
      onPaid: async (response) => ({ status: (await verifyPayment(pay.purchaseId, response))?.status }),
    })),
  });

/**
 * Pay for a plan. Resolves one of (always with `purchaseId`):
 *   { status: "paid" | "pending" | "failed" }   the popup finished and our server checked it
 *   { status: "redirect" }                      the browser is leaving for the gateway and comes back to /resume-review/payment-result
 *   { status: "dismissed" }                     the buyer closed the popup
 */
export const payForPlan = async ({ packageId, description, user }) =>
  open(await buyPlan({ packageId, returnOrigin: window.location.origin }), description, user);

/* pay again for a plan that was started but not finished */
export const payForExisting = async ({ purchaseId, description, user }) =>
  open(await payPlan(purchaseId, { returnOrigin: window.location.origin }), description, user);
