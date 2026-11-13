import { createPayment, getPaymentStatus } from "./memApi";
import { runCheckout } from "./checkout";
import { trackCheckoutStart, trackPaid } from "./metaTracking";
import { chooseGateway } from "./paymentGateway";

/*
  ONE WAY TO PAY, for everything on Memories: a page (with add-ons picked with it) or add-ons for a page you already made.
  `buy` is what is being bought, in the shape the server wants ({ kind, occasionId, theme, pageId, packs }): the server works out the price.
  Returns { status } where status is "paid" | "redirect" (the gateway page took over) | "dismissed" | "pending" | "failed".
*/
export async function payFor({ cfg, buy, user, price, description }) {
  const gateway = chooseGateway(cfg);
  const order = await createPayment(gateway, buy);
  trackCheckoutStart({ orderId: order.orderId, price, gateway });
  const r = await runCheckout({ checkout: order.checkout, orderId: order.orderId, user, description });
  if (r.status === "redirect") return { status: "redirect", order };
  let status = r.status;
  if (status !== "paid") status = (await getPaymentStatus(order.orderId)).status; // they may have paid even if the window closed
  if (status === "paid") { trackPaid(order.orderId, price); return { status: "paid", order }; }
  if (r.status === "dismissed") return { status: "dismissed", order };
  return { status: status === "pending" || status === "created" ? "pending" : "failed", order };
}

export const PAY_MESSAGES = {
  dismissed: "Payment cancelled. Nothing was charged.",
  pending: "We haven't received the payment yet. If you were charged, it will appear in a minute. Check again or contact us.",
  failed: "The payment didn't go through. Nothing was charged. Please try again.",
};
