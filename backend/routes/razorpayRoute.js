import express from "express";

import {
  createRazorpayPayment,
  verifyRazorpayPayment,
  razorpayWebhook,
} from "../controllers/razorpayController.js";

const router = express.Router();

// ======================================================
// CREATE RAZORPAY ORDER
//
// POST /payment/razorpay/create
// ======================================================

router.post(
  "/create",
  createRazorpayPayment
);

// ======================================================
// VERIFY RAZORPAY PAYMENT
//
// Called by frontend after successful Razorpay Checkout.
//
// POST /payment/razorpay/verify
//
// Body:
// {
//   razorpay_order_id,
//   razorpay_payment_id,
//   razorpay_signature
// }
// ======================================================

router.post(
  "/verify",
  verifyRazorpayPayment
);

// ======================================================
// RAZORPAY WEBHOOK
//
// IMPORTANT:
// Razorpay webhook signature verification requires
// the ORIGINAL RAW request body.
//
// This route should only work correctly if this router
// is mounted BEFORE app.use(express.json()).
//
// POST /payment/razorpay/webhook
// ======================================================

router.post(
  "/webhook",

  express.raw({
    type: "application/json",
  }),

  razorpayWebhook
);

export default router;