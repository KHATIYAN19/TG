import { memoriesHttp } from "../arena/api";
import { runCheckout as run, registerRunner } from "../payment/checkoutRunner.js";

/*
  MEMORIES CHECKOUT
  One create request goes to the memories API; the server answers with a `checkout` for whichever gateway it chose and the
  shared runner (payment/checkoutRunner.js) opens it. Only the product-specific parts live here: what to say in the Razorpay
  popup and how the signed result is verified on OUR server. Nothing here decides that a payment worked: only the server does.
*/
const verify = async (orderId, payload) => (await memoriesHttp.post("/payments/verify", { orderId, payload })).data?.data?.status;

/* development only: the server confirms immediately */
registerRunner("mock", async ({ orderId }) => ({ status: await verify(orderId, { paymentId: "mock_payment" }) }));

export async function runCheckout({ checkout, orderId, user, description = "Memories page" }) {
  return run({
    checkout,
    orderId,
    name: "Memories by Target Trek",
    description,
    theme: "#f43f6e",
    prefill: { name: user?.name || "", email: user?.email || "" },
    onPaid: async (response) => ({ status: await verify(orderId, response) }),
  });
}
