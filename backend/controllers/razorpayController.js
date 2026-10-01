import mongoose from "mongoose";

import Book from "../models/Book.js";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";

import {
  RAZORPAY_KEY_ID,
} from "../config/razorpay.js";

import {
  amountToPaise,
  createRazorpayOrder,
  fetchRazorpayPayment,
  generateRazorpayTransactionId,
  verifyRazorpayPaymentSignature,
  verifyRazorpayWebhookSignature,
} from "../utils/razorpay.js";

import {
  generateDownloadToken,
  hashDownloadToken,
} from "../utils/payu.js";

import {
  validateCouponForPayment,
} from "./couponController.js";

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "https://www.targettrek.in";

const ACCESS_DURATION =
  24 * 60 * 60 * 1000;

// ======================================================
// FRONTEND REDIRECTS
// ======================================================

const failedRedirect = (
  orderId = null
) => {
  if (!orderId) {
    return `${FRONTEND_URL}/payment/failed`;
  }

  return (
    `${FRONTEND_URL}/payment/failed` +
    `?order=${encodeURIComponent(orderId)}`
  );
};

const successRedirect = (
  token,
  orderId
) => {
  return (
    `${FRONTEND_URL}/payment/success` +
    `?token=${encodeURIComponent(token)}` +
    `&order=${encodeURIComponent(orderId)}`
  );
};

// ======================================================
// NORMALIZE REQUEST METADATA
// ======================================================

const getRequestMetadata = (
  req,
  {
    utmSource,
    utmMedium,
    utmCampaign,
  } = {}
) => {
  return {
    ipAddress:
      req.headers[
        "x-forwarded-for"
      ]
        ?.split(",")[0]
        ?.trim() ||
      req.socket
        ?.remoteAddress ||
      null,

    userAgent:
      req.headers[
        "user-agent"
      ] ||
      null,

    referrer:
      req.headers
        .referer ||
      null,

    utmSource:
      utmSource ||
      null,

    utmMedium:
      utmMedium ||
      null,

    utmCampaign:
      utmCampaign ||
      null,
  };
};

// ======================================================
// BUILD COUPON SNAPSHOT
// ======================================================

const buildCouponData = (
  pricing
) => {
  if (
    pricing.couponApplied
  ) {
    return {
      applied: true,

      couponId:
        pricing.coupon
          .couponId,

      code:
        pricing.coupon
          .code,

      name:
        pricing.coupon
          .name,

      description:
        pricing.coupon
          .description,

      discountType:
        pricing.coupon
          .discountType,

      discountValue:
        pricing.coupon
          .discountValue,

      maxDiscountAmount:
        pricing.coupon
          .maxDiscountAmount,

      minimumOrderAmount:
        pricing.coupon
          .minimumOrderAmount,

      originalAmount:
        pricing.originalAmount,

      discountAmount:
        pricing.discountAmount,

      finalAmount:
        pricing.finalAmount,

      appliedAt:
        new Date(),
    };
  }

  return {
    applied: false,

    couponId: null,

    code: null,

    name: null,

    description: null,

    discountType: null,

    discountValue: 0,

    maxDiscountAmount: null,

    minimumOrderAmount: null,

    originalAmount:
      pricing.originalAmount,

    discountAmount: 0,

    finalAmount:
      pricing.finalAmount,

    appliedAt: null,
  };
};

// ======================================================
// GENERATE EBOOK ACCESS TOKEN
// ======================================================

const generateAccessData =
  () => {
    const rawToken =
      generateDownloadToken();

    const tokenHash =
      hashDownloadToken(
        rawToken
      );

    const now =
      new Date();

    const expiresAt =
      new Date(
        Date.now() +
          ACCESS_DURATION
      );

    return {
      rawToken,
      tokenHash,
      now,
      expiresAt,
    };
  };

// ======================================================
// INCREMENT COUNTERS
// ONLY AFTER FIRST SUCCESSFUL PAID TRANSITION
// ======================================================

const incrementSuccessfulPurchaseStats =
  async (
    updatedOrder
  ) => {
    if (
      updatedOrder
        ?.coupon
        ?.applied &&
      updatedOrder
        ?.coupon
        ?.couponId
    ) {
      try {
        await Coupon.updateOne(
          {
            _id:
              updatedOrder
                .coupon
                .couponId,
          },
          {
            $inc: {
              usedCount: 1,
            },
          }
        );
      } catch (error) {
        console.error(
          "Unable to increment coupon usage:",
          error
        );
      }
    }

    try {
      await Book.updateOne(
        {
          _id:
            updatedOrder
              .bookId,
        },
        {
          $inc: {
            "stats.purchases":
              1,
          },
        }
      );
    } catch (error) {
      console.error(
        "Unable to increment book purchase count:",
        error
      );
    }
  };

// ======================================================
// VALIDATE PAYMENT RETURNED DIRECTLY BY RAZORPAY
// ======================================================

const validateRazorpayPayment =
  ({
    order,
    payment,
  }) => {
    const expectedAmountPaise =
      amountToPaise(
        order.payment.amount
      );

    const expectedCurrency =
      String(
        order.book.currency ||
          "INR"
      ).toUpperCase();

    const paymentAmount =
      Number(
        payment?.amount
      );

    const amountVerified =
      Number.isInteger(
        paymentAmount
      ) &&
      paymentAmount ===
        expectedAmountPaise;

    const currencyVerified =
      String(
        payment?.currency ||
          ""
      ).toUpperCase() ===
        expectedCurrency;

    const orderVerified =
      payment?.order_id ===
        order.payment
          .transactionId;

    const paymentCaptured =
      String(
        payment?.status ||
          ""
      ).toLowerCase() ===
        "captured" &&
      payment?.captured ===
        true;

    return {
      expectedAmountPaise,
      amountVerified,
      currencyVerified,
      orderVerified,
      paymentCaptured,

      valid:
        amountVerified &&
        currencyVerified &&
        orderVerified &&
        paymentCaptured,
    };
  };

// ======================================================
// MARK RAZORPAY PAYMENT AS PAID
//
// Atomic transition prevents:
//
// - duplicate purchase count
// - duplicate coupon usage count
//
// Webhook and browser verification can safely race.
// ======================================================

const finalizeRazorpayPayment =
  async ({
    order,
    payment,
    source,
    callbackResponse = null,
    issueAccessToken = false,
  }) => {
    const now =
      new Date();

    const access =
      issueAccessToken
        ? generateAccessData()
        : null;

    const updateData = {
      orderStatus:
        "PAID",

      "payment.status":
        "SUCCESS",

      "payment.paymentId":
        payment.id,

      "payment.method":
        payment.method ||
        null,

      "payment.amount":
        Number(
          order.payment.amount
        ),

      "payment.paidAt":
        now,

      "payment.failedAt":
        null,

      "payment.callbackResponse":
        callbackResponse,

      "payment.verificationResponse":
        payment,

      "verification.callbackHashVerified":
        true,

      "verification.razorpayVerified":
        true,

      "verification.amountVerified":
        true,

      "verification.verifiedAt":
        now,

      updatedBy:
        source,
    };

    if (access) {
      Object.assign(
        updateData,
        {
          "access.tokenHash":
            access.tokenHash,

          "access.expiresAt":
            access.expiresAt,

          "access.generatedAt":
            access.now,

          "access.lastAccessedAt":
            null,

          "access.accessCount":
            0,

          "access.revoked":
            false,
        }
      );
    }

    const updatedOrder =
      await Order
        .findOneAndUpdate(
          {
            _id:
              order._id,

            "payment.provider":
              "Razorpay",

            orderStatus: {
              $ne:
                "PAID",
            },
          },

          {
            $set:
              updateData,
          },

          {
            new:
              true,
          }
        );

    // ==============================================
    // FIRST SUCCESSFUL TRANSITION
    // ==============================================

    if (updatedOrder) {
      await incrementSuccessfulPurchaseStats(
        updatedOrder
      );

      return {
        order:
          updatedOrder,

        rawToken:
          access
            ?.rawToken ||
          null,

        firstSuccessfulTransition:
          true,
      };
    }

    // ==============================================
    // ORDER WAS ALREADY PAID
    //
    // Webhook may have completed before /verify.
    // If frontend is requesting verification,
    // generate a fresh ebook access token.
    // ==============================================

    const paidOrder =
      await Order.findOne({
        _id:
          order._id,

        "payment.provider":
          "Razorpay",

        orderStatus:
          "PAID",

        "payment.status":
          "SUCCESS",

        "verification.razorpayVerified":
          true,

        "verification.amountVerified":
          true,
      });

    if (!paidOrder) {
      throw new Error(
        "Unable to finalize Razorpay payment."
      );
    }

    if (!issueAccessToken) {
      return {
        order:
          paidOrder,

        rawToken:
          null,

        firstSuccessfulTransition:
          false,
      };
    }

    const duplicateAccess =
      generateAccessData();

    const refreshedOrder =
      await Order
        .findOneAndUpdate(
          {
            _id:
              paidOrder._id,

            orderStatus:
              "PAID",

            "payment.status":
              "SUCCESS",

            "payment.provider":
              "Razorpay",
          },

          {
            $set: {
              "access.tokenHash":
                duplicateAccess
                  .tokenHash,

              "access.expiresAt":
                duplicateAccess
                  .expiresAt,

              "access.generatedAt":
                duplicateAccess
                  .now,

              "access.lastAccessedAt":
                null,

              "access.accessCount":
                0,

              "access.revoked":
                false,

              updatedBy:
                source,
            },
          },

          {
            new:
              true,
          }
        );

    if (!refreshedOrder) {
      throw new Error(
        "Unable to generate ebook access token."
      );
    }

    return {
      order:
        refreshedOrder,

      rawToken:
        duplicateAccess
          .rawToken,

      firstSuccessfulTransition:
        false,
    };
  };

// ======================================================
// CREATE RAZORPAY PAYMENT
// ======================================================

export const createRazorpayPayment =
  async (
    req,
    res
  ) => {
    try {
      const {
        affiliateCode,
        bookId,
        firstname,
        email,
        phone,

        couponCode,

        utmSource,
        utmMedium,
        utmCampaign,
      } = req.body;

      // ==========================================
      // BASIC VALIDATION
      // ==========================================

      if (
        !bookId ||
        !firstname ||
        !email ||
        !phone
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Name, email, phone and bookId are required.",
          });
      }

      if (
        !mongoose
          .Types
          .ObjectId
          .isValid(
            bookId
          )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid book ID.",
          });
      }

      // ==========================================
      // FETCH BOOK
      // ==========================================

      const book =
        await Book.findOne({
          _id:
            bookId,

          isPublished:
            true,

          isActive:
            true,
        });

      if (!book) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Book not found.",
          });
      }

      // ==========================================
      // NORMALIZE CUSTOMER
      // ==========================================

      const normalizedName =
        firstname
          .trim();

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const normalizedPhone =
        phone
          .trim();

      const normalizedAffiliateCode =
        typeof affiliateCode ===
        "string"
          ? affiliateCode
              .trim()
              .toLowerCase()
          : null;

      // ==========================================
      // COUPON VALIDATION
      //
      // Same controller used by PayU.
      // ==========================================

      let pricing;

      try {
        pricing =
          await validateCouponForPayment(
            {
              couponCode,

              book,

              email:
                normalizedEmail,
            }
          );
      } catch (error) {
        return res
          .status(
            error.statusCode ||
              400
          )
          .json({
            success:
              false,

            code:
              error.code ||
              "COUPON_INVALID",

            message:
              error.message ||
              "Invalid coupon.",
          });
      }

      const finalAmount =
        Number(
          pricing.finalAmount
        );

      if (
        !Number.isFinite(
          finalAmount
        ) ||
        finalAmount <= 0
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid payment amount.",
          });
      }

      // ==========================================
      // CURRENCY
      // ==========================================

      const currency =
        String(
          book.currency ||
            "INR"
        ).toUpperCase();

      /*
       * Your current Target Trek payment flow is INR.
       *
       * amountToPaise() assumes a 2-decimal currency.
       * If you later enable international Razorpay
       * currencies, create a generic currency-subunit
       * conversion utility.
       */

      if (
        currency !==
        "INR"
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Razorpay checkout currently supports INR books only.",
          });
      }

      const amountPaise =
        amountToPaise(
          finalAmount
        );

      // ==========================================
      // TARGET TREK INTERNAL ORDER ID
      // ==========================================

      const internalOrderId =
        generateRazorpayTransactionId();

      // ==========================================
      // CREATE ORDER ON RAZORPAY
      // ==========================================

      const razorpayOrder =
        await createRazorpayOrder(
          {
            amount:
              amountPaise,

            currency,

            receipt:
              internalOrderId,

            notes: {
              targetTrekOrderId:
                internalOrderId,

              bookId:
                String(
                  book._id
                ),

              bookTitle:
                String(
                  book.title
                ).slice(
                  0,
                  250
                ),
            },
          }
        );

      if (
        !razorpayOrder
          ?.id
      ) {
        throw new Error(
          "Razorpay order was not created."
        );
      }

      // ==========================================
      // COUPON SNAPSHOT
      // ==========================================

      const couponData =
        buildCouponData(
          pricing
        );

      // ==========================================
      // CREATE TARGET TREK ORDER
      // ==========================================

      const order =
        await Order.create({
          orderId:
            internalOrderId,

          bookId:
            book._id,

          book: {
            title:
              book.title,

            price:
              book.price,

            mrp:
              book.mrp ||
              book.price,

            currency,
          },

          customer: {
            name:
              normalizedName,

            email:
              normalizedEmail,

            phone:
              normalizedPhone,
          },

          coupon:
            couponData,

          payment: {
            provider:
              "Razorpay",

            affiliateCode:
              normalizedAffiliateCode,

            /*
             * For Razorpay this stores:
             *
             * order_xxxxxxxxx
             */
            transactionId:
              razorpayOrder.id,

            paymentId:
              null,

            method:
              null,

            amount:
              finalAmount,

            status:
              "PENDING",
          },

          orderStatus:
            "PENDING",

          metadata:
            getRequestMetadata(
              req,
              {
                utmSource,
                utmMedium,
                utmCampaign,
              }
            ),

          createdBy:
            "customer",
        });

      // ==========================================
      // RETURN CHECKOUT DATA
      //
      // NEVER RETURN KEY_SECRET
      // ==========================================

      return res
        .status(200)
        .json({
          success:
            true,

          data: {
            orderId:
              order.orderId,

            provider:
              "Razorpay",

            pricing: {
              couponApplied:
                pricing
                  .couponApplied,

              couponCode:
                pricing
                  .coupon
                  ?.code ||
                null,

              couponName:
                pricing
                  .coupon
                  ?.name ||
                null,

              originalAmount:
                pricing
                  .originalAmount,

              discountAmount:
                pricing
                  .discountAmount,

              finalAmount:
                pricing
                  .finalAmount,

              currency,
            },

            checkout: {
              key:
                RAZORPAY_KEY_ID,

              razorpayOrderId:
                razorpayOrder.id,

              amount:
                razorpayOrder
                  .amount,

              currency:
                razorpayOrder
                  .currency,

              name:
                "Target Trek",

              description:
                book.title,

              prefill: {
                name:
                  normalizedName,

                email:
                  normalizedEmail,

                contact:
                  normalizedPhone,
              },
            },
          },
        });
    } catch (error) {
      console.error(
        "Create Razorpay payment error:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to create Razorpay payment.",
        });
    }
  };

// ======================================================
// VERIFY PAYMENT AFTER CHECKOUT
// ======================================================

export const verifyRazorpayPayment =
  async (
    req,
    res
  ) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Razorpay payment verification data is incomplete.",
          });
      }

      // ==========================================
      // FIND OUR ORDER
      // ==========================================

      const order =
        await Order.findOne({
          "payment.provider":
            "Razorpay",

          "payment.transactionId":
            razorpay_order_id,
        });

      if (!order) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Payment order not found.",
          });
      }

      /*
       * IMPORTANT:
       *
       * For HMAC verification use the Razorpay
       * order ID from our database.
       *
       * Do not use an arbitrary browser supplied
       * order ID as the trusted source.
       */

      const storedRazorpayOrderId =
        order.payment
          .transactionId;

      // ==========================================
      // VERIFY CHECKOUT SIGNATURE
      // ==========================================

      const signatureVerified =
        verifyRazorpayPaymentSignature(
          {
            razorpayOrderId:
              storedRazorpayOrderId,

            razorpayPaymentId:
              razorpay_payment_id,

            razorpaySignature:
              razorpay_signature,
          }
        );

      if (!signatureVerified) {
        await Order.updateOne(
          {
            _id:
              order._id,

            orderStatus: {
              $ne:
                "PAID",
            },
          },
          {
            $set: {
              "verification.callbackHashVerified":
                false,

              updatedBy:
                "razorpay-verify",
            },
          }
        );

        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid Razorpay payment signature.",
          });
      }

      // ==========================================
      // FETCH ACTUAL PAYMENT DIRECTLY FROM RAZORPAY
      // ==========================================

      let payment;

      try {
        payment =
          await fetchRazorpayPayment(
            razorpay_payment_id
          );
      } catch (error) {
        console.error(
          "Unable to fetch Razorpay payment:",
          error
        );

        return res
          .status(502)
          .json({
            success:
              false,

            message:
              "Unable to verify payment with Razorpay.",
          });
      }

      // ==========================================
      // VERIFY PAYMENT ID
      // ==========================================

      if (
        payment?.id !==
        razorpay_payment_id
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Razorpay payment ID mismatch.",
          });
      }

      // ==========================================
      // VERIFY STATUS + ORDER + AMOUNT + CURRENCY
      // ==========================================

      const verification =
        validateRazorpayPayment(
          {
            order,
            payment,
          }
        );

      if (
        !verification
          .paymentCaptured
      ) {
        await Order.updateOne(
          {
            _id:
              order._id,

            orderStatus: {
              $ne:
                "PAID",
            },
          },
          {
            $set: {
              "payment.verificationResponse":
                payment,

              "verification.callbackHashVerified":
                true,

              "verification.razorpayVerified":
                false,

              "verification.amountVerified":
                verification
                  .amountVerified,

              "verification.verifiedAt":
                new Date(),

              updatedBy:
                "razorpay-verify",
            },
          }
        );

        return res
          .status(409)
          .json({
            success:
              false,

            code:
              "PAYMENT_NOT_CAPTURED",

            message:
              "Payment has not been captured yet.",
          });
      }

      if (
        !verification
          .orderVerified ||
        !verification
          .amountVerified ||
        !verification
          .currencyVerified
      ) {
        await Order.updateOne(
          {
            _id:
              order._id,

            orderStatus: {
              $ne:
                "PAID",
            },
          },
          {
            $set: {
              "payment.verificationResponse":
                payment,

              "verification.callbackHashVerified":
                true,

              "verification.razorpayVerified":
                false,

              "verification.amountVerified":
                false,

              "verification.verifiedAt":
                new Date(),

              updatedBy:
                "razorpay-verify",
            },
          }
        );

        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Razorpay payment verification failed.",
          });
      }

      // ==========================================
      // FINALIZE
      // ==========================================

      const finalized =
        await finalizeRazorpayPayment(
          {
            order,

            payment,

            source:
              "razorpay-verify",

            callbackResponse: {
              razorpay_order_id,

              razorpay_payment_id,

              /*
               * No need to persist the signature itself.
               * We persist that verification succeeded.
               */
              signatureVerified:
                true,
            },

            issueAccessToken:
              true,
          }
        );

      if (
        !finalized.rawToken
      ) {
        throw new Error(
          "Access token was not generated."
        );
      }

      const redirectUrl =
        successRedirect(
          finalized.rawToken,
          finalized
            .order
            .orderId
        );

      return res
        .status(200)
        .json({
          success:
            true,

          message:
            "Payment verified successfully.",

          data: {
            orderId:
              finalized
                .order
                .orderId,

            token:
              finalized
                .rawToken,

            redirectUrl,
          },
        });
    } catch (error) {
      console.error(
        "Verify Razorpay payment error:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Unable to verify Razorpay payment.",
        });
    }
  };

// ======================================================
// RAZORPAY WEBHOOK
//
// IMPORTANT:
// req.body MUST BE THE RAW BUFFER.
// ======================================================

export const razorpayWebhook =
  async (
    req,
    res
  ) => {
    try {
      const signature =
        req.headers[
          "x-razorpay-signature"
        ];

      if (
        !Buffer.isBuffer(
          req.body
        )
      ) {
        console.error(
          "Razorpay webhook body is not raw Buffer."
        );

        return res
          .status(400)
          .send(
            "Invalid webhook body"
          );
      }

      const signatureVerified =
        verifyRazorpayWebhookSignature(
          {
            rawBody:
              req.body,

            signature,
          }
        );

      if (!signatureVerified) {
        return res
          .status(400)
          .send(
            "Invalid webhook signature"
          );
      }

      let event;

      try {
        event =
          JSON.parse(
            req.body.toString(
              "utf8"
            )
          );
      } catch {
        return res
          .status(400)
          .send(
            "Invalid JSON"
          );
      }

      const eventName =
        event?.event;

      // ==========================================
      // PAYMENT CAPTURED
      // ==========================================

      if (
        eventName ===
        "payment.captured"
      ) {
        const webhookPayment =
          event
            ?.payload
            ?.payment
            ?.entity;

        if (
          !webhookPayment
            ?.id ||
          !webhookPayment
            ?.order_id
        ) {
          return res
            .status(200)
            .json({
              success:
                true,
            });
        }

        const order =
          await Order.findOne({
            "payment.provider":
              "Razorpay",

            "payment.transactionId":
              webhookPayment
                .order_id,
          });

        /*
         * Could belong to another Razorpay
         * integration/account workflow.
         */
        if (!order) {
          return res
            .status(200)
            .json({
              success:
                true,
            });
        }

        let payment;

        try {
          /*
           * Fetch directly from Razorpay rather than
           * depending only on webhook payload.
           */
          payment =
            await fetchRazorpayPayment(
              webhookPayment.id
            );
        } catch (error) {
          console.error(
            "Webhook payment fetch failed:",
            error
          );

          return res
            .status(500)
            .json({
              success:
                false,
            });
        }

        const verification =
          validateRazorpayPayment(
            {
              order,
              payment,
            }
          );

        if (
          !verification.valid
        ) {
          console.error(
            "Razorpay webhook payment verification mismatch:",
            {
              orderId:
                order.orderId,

              paymentId:
                payment?.id,

              verification,
            }
          );

          return res
            .status(200)
            .json({
              success:
                true,
            });
        }

        await finalizeRazorpayPayment(
          {
            order,

            payment,

            source:
              "razorpay-webhook",

            callbackResponse: {
              event:
                eventName,

              eventId:
                req.headers[
                  "x-razorpay-event-id"
                ] ||
                null,
            },

            /*
             * No raw token should be generated by
             * an asynchronous webhook because nobody
             * is present to receive it.
             *
             * /verify will issue the access token.
             */
            issueAccessToken:
              false,
          }
        );

        return res
          .status(200)
          .json({
            success:
              true,
          });
      }

      // ==========================================
      // PAYMENT FAILED
      // ==========================================

      if (
        eventName ===
        "payment.failed"
      ) {
        const payment =
          event
            ?.payload
            ?.payment
            ?.entity;

        if (
          payment?.order_id
        ) {
          await Order.updateOne(
            {
              "payment.provider":
                "Razorpay",

              "payment.transactionId":
                payment
                  .order_id,

              orderStatus: {
                $ne:
                  "PAID",
              },
            },

            {
              $set: {
                orderStatus:
                  "FAILED",

                "payment.status":
                  "FAILED",

                "payment.paymentId":
                  payment.id ||
                  null,

                "payment.method":
                  payment.method ||
                  null,

                "payment.failedAt":
                  new Date(),

                "payment.callbackResponse": {
                  event:
                    eventName,

                  eventId:
                    req.headers[
                      "x-razorpay-event-id"
                    ] ||
                    null,

                  payment,
                },

                "verification.callbackHashVerified":
                  true,

                "verification.razorpayVerified":
                  false,

                "verification.verifiedAt":
                  new Date(),

                updatedBy:
                  "razorpay-webhook",
              },
            }
          );
        }

        return res
          .status(200)
          .json({
            success:
              true,
          });
      }

      // ==========================================
      // EVENT NOT USED BY TARGET TREK
      // ==========================================

      return res
        .status(200)
        .json({
          success:
            true,

          ignored:
            true,
        });
    } catch (error) {
      console.error(
        "Razorpay webhook error:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,
        });
    }
  };