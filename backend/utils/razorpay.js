import crypto from "crypto";

import {
  RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET,
  getRazorpayClient,
} from "../config/razorpay.js";

// ======================================================
// SAFE STRING COMPARISON
// ======================================================

const safeEqual = (
  received,
  calculated
) => {
  if (
    !received ||
    !calculated
  ) {
    return false;
  }

  const receivedBuffer =
    Buffer.from(
      String(received)
    );

  const calculatedBuffer =
    Buffer.from(
      String(calculated)
    );

  if (
    receivedBuffer.length !==
    calculatedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    receivedBuffer,
    calculatedBuffer
  );
};

// ======================================================
// GENERATE TARGET TREK ORDER ID
// ======================================================

export const generateRazorpayTransactionId =
  () => {
    return `TT_RZP_${Date.now()}_${crypto
      .randomBytes(4)
      .toString("hex")}`;
  };

// ======================================================
// CONVERT INR TO PAISE
// ======================================================

export const amountToPaise = (
  amount
) => {
  const numericAmount =
    Number(amount);

  if (
    !Number.isFinite(
      numericAmount
    ) ||
    numericAmount <= 0
  ) {
    throw new Error(
      "Invalid payment amount."
    );
  }

  return Math.round(
    numericAmount * 100
  );
};

// ======================================================
// VERIFY RAZORPAY CHECKOUT SIGNATURE
// ======================================================

export const verifyRazorpayPaymentSignature =
  ({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }) => {
    try {
      if (
        !razorpayOrderId ||
        !razorpayPaymentId ||
        !razorpaySignature ||
        !RAZORPAY_KEY_SECRET
      ) {
        return false;
      }

      const payload =
        `${razorpayOrderId}|${razorpayPaymentId}`;

      const calculatedSignature =
        crypto
          .createHmac(
            "sha256",
            RAZORPAY_KEY_SECRET
          )
          .update(payload)
          .digest("hex");

      return safeEqual(
        razorpaySignature,
        calculatedSignature
      );
    } catch (error) {
      console.error(
        "Razorpay payment signature verification error:",
        error
      );

      return false;
    }
  };

// ======================================================
// VERIFY RAZORPAY WEBHOOK SIGNATURE
// ======================================================

export const verifyRazorpayWebhookSignature =
  ({
    rawBody,
    signature,
  }) => {
    try {
      if (
        !rawBody ||
        !signature ||
        !RAZORPAY_WEBHOOK_SECRET
      ) {
        return false;
      }

      const calculatedSignature =
        crypto
          .createHmac(
            "sha256",
            RAZORPAY_WEBHOOK_SECRET
          )
          .update(rawBody)
          .digest("hex");

      return safeEqual(
        signature,
        calculatedSignature
      );
    } catch (error) {
      console.error(
        "Razorpay webhook signature verification error:",
        error
      );

      return false;
    }
  };

// ======================================================
// CREATE RAZORPAY ORDER
// ======================================================

export const createRazorpayOrder =
  async ({
    amount,
    currency = "INR",
    receipt,
    notes = {},
  }) => {
    const razorpay =
      getRazorpayClient();

    return razorpay.orders.create({
      amount,
      currency,
      receipt,
      notes,
    });
  };

// ======================================================
// FETCH PAYMENT FROM RAZORPAY
// ======================================================

export const fetchRazorpayPayment =
  async (
    paymentId
  ) => {
    if (!paymentId) {
      throw new Error(
        "Razorpay payment ID is required."
      );
    }

    const razorpay =
      getRazorpayClient();

    return razorpay.payments.fetch(
      paymentId
    );
  };

// ======================================================
// FETCH RAZORPAY ORDER
// ======================================================

export const fetchRazorpayOrder =
  async (
    orderId
  ) => {
    if (!orderId) {
      throw new Error(
        "Razorpay order ID is required."
      );
    }

    const razorpay =
      getRazorpayClient();

    return razorpay.orders.fetch(
      orderId
    );
  };