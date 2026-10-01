import Razorpay from "razorpay";

export const RAZORPAY_KEY_ID =
  process.env.RAZORPAY_KEY_ID || "";

export const RAZORPAY_KEY_SECRET =
  process.env.RAZORPAY_KEY_SECRET || "";

export const RAZORPAY_WEBHOOK_SECRET =
  process.env.RAZORPAY_WEBHOOK_SECRET || "";

let razorpayClient = null;

export const getRazorpayClient = () => {
  if (
    !RAZORPAY_KEY_ID ||
    !RAZORPAY_KEY_SECRET
  ) {
    throw new Error(
      "Razorpay configuration is missing."
    );
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  }

  return razorpayClient;
};