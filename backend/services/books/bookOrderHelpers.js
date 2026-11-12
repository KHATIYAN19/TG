import Book from "../../models/Book.js";
import Order from "../../models/Order.js";
import Coupon from "../../models/Coupon.js";
import User from "../../models/User.js";
import { scheduleEbookEmail } from "../../utils/ebookEmailDelivery.js";
import { recordOfferPurchase } from "../bundleOffers.js";
import { generateDownloadToken, hashDownloadToken } from "../../utils/payu.js";

/*
  BOOK ORDER HELPERS (gateway-neutral)
  Everything a book purchase needs that has nothing to do with WHICH payment gateway is used.
  Copied from the per-gateway controllers so one settle function serves Cashfree, Razorpay, PayU and any future gateway.
*/
export const ACCESS_DURATION = 24 * 60 * 60 * 1000;

/** How a gateway id is written on the order (Order.payment.provider). Unknown gateways get a capitalised id. */
const PROVIDER_LABELS = { cashfree: "Cashfree", razorpay: "Razorpay", payu: "PayU" };
export const providerLabel = (gateway) => PROVIDER_LABELS[gateway] || String(gateway).charAt(0).toUpperCase() + String(gateway).slice(1);

/** The verification flags set on a paid order, per gateway (the book-access check and admin screens read these). */
const VERIFY_FLAGS = {
  cashfree: ["cashfreeVerified"],
  razorpay: ["callbackHashVerified", "razorpayVerified"],
  payu: ["callbackHashVerified", "payuVerified"],
};
const verifyFlagsFor = (gateway) => ["amountVerified", ...(VERIFY_FLAGS[gateway] || ["callbackHashVerified"])];

export const buildCouponData = (pricing) => {
    if (!pricing.couponApplied) {
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
            originalAmount: pricing.originalAmount,
            discountAmount: 0,
            finalAmount: pricing.finalAmount,
            appliedAt: null
        };
    }

    return {
        applied: true,
        couponId: pricing.coupon.couponId,
        code: pricing.coupon.code,
        name: pricing.coupon.name,
        description: pricing.coupon.description,
        discountType: pricing.coupon.discountType,
        discountValue: pricing.coupon.discountValue,
        maxDiscountAmount: pricing.coupon.maxDiscountAmount,
        minimumOrderAmount: pricing.coupon.minimumOrderAmount,
        originalAmount: pricing.originalAmount,
        discountAmount: pricing.discountAmount,
        finalAmount: pricing.finalAmount,
        appliedAt: new Date()
    };
};

export const incrementPurchaseCounters = async (order) => {
    if (order.coupon?.applied && order.coupon?.couponId) {
        try {
            await Coupon.updateOne(
                {
                    _id: order.coupon.couponId
                },
                {
                    $inc: {
                        usedCount: 1
                    }
                }
            );
        } catch (error) {
            console.error("Unable to increment coupon usage:", error);
        }
    }

    try {
        await Book.updateOne(
            {
                _id: order.bookId
            },
            {
                $inc: {
                    "stats.purchases": 1
                }
            }
        );
    } catch (error) {
        console.error("Unable to increment book purchases:", error);
    }

    await recordOfferPurchase(order);
};

const normalizeAffiliateCode = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const code = value.trim().toLowerCase();

  return code || null;
};

const roundMoney = (value) => {
  return Math.round(
    (Number(value) + Number.EPSILON) * 100
  ) / 100;
};

/**
 * Resolve an affiliate against the User collection.
 *
 * Returns:
 * {
 *   affiliateCode,
 *   affiliateUserId,
 *   affiliateType,
 *   affiliateValue,
 *   affiliateAmount,
 *   remainingAmount
 * }
 *
 * If no valid affiliate is found, only affiliateCode
 * is populated. Other fields are null.
 */
export const resolveAffiliate = async ({
  affiliateCode,
  finalAmount,
  currency,
}) => {
  const code = normalizeAffiliateCode(affiliateCode);

  const empty = {
    affiliateCode: code,
    affiliateUserId: null,
    affiliateType: null,
    affiliateValue: null,
    affiliateAmount: null,
    remainingAmount: null,
  };

  /* ----------------------------------------------------------
     DIRECT TARGET TREK SALE
  ---------------------------------------------------------- */

  if (!code || code === "tt") {
    return empty;
  }

  /* ----------------------------------------------------------
     FIND ACTIVE AFFILIATE USER

     Your User model stores affiliate.code in uppercase,
     while Order.payment.affiliateCode is lowercase.
  ---------------------------------------------------------- */

  const affiliateUser = await User.findOne({
    role: "affiliate",
    status: "active",
    isDeleted: { $ne: true },

    "affiliate.code": code.toUpperCase(),
    "affiliate.status": "active",
  })
    .select(
      "_id name role status " +
      "affiliate.code " +
      "affiliate.status " +
      "affiliate.commissionType " +
      "affiliate.commissionValue"
    )
    .lean();

  /* ----------------------------------------------------------
     INVALID / INACTIVE AFFILIATE

     Keep the referral code only.
  ---------------------------------------------------------- */

  if (!affiliateUser?.affiliate) {
    return empty;
  }

  const commissionType =
    affiliateUser.affiliate.commissionType;

  const commissionValue = Number(
    affiliateUser.affiliate.commissionValue
  );

  /* ----------------------------------------------------------
     VALIDATE COMMISSION CONFIGURATION
  ---------------------------------------------------------- */

  if (
    !["percentage", "fixed"].includes(commissionType) ||
    !Number.isFinite(commissionValue) ||
    commissionValue <= 0
  ) {
    return empty;
  }

  if (
    commissionType === "percentage" &&
    commissionValue > 100
  ) {
    return empty;
  }

  const amount = roundMoney(finalAmount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return empty;
  }

  /*
   * Percentage commissions work with any currency.
   *
   * Fixed commissions are assumed to be configured
   * in INR, since User.affiliate does not currently
   * store a commission currency.
   *
   * Skip fixed commissions for non-INR orders to
   * avoid incorrect payouts.
   */
  if (
    commissionType === "fixed" &&
    String(currency).toUpperCase() !== "INR"
  ) {
    return empty;
  }

  /* ----------------------------------------------------------
     CALCULATE COMMISSION
  ---------------------------------------------------------- */

  let affiliateAmount = 0;

  if (commissionType === "percentage") {
    affiliateAmount = roundMoney(
      (amount * commissionValue) / 100
    );
  } else {
    affiliateAmount = roundMoney(commissionValue);
  }

  /*
   * Never allocate more affiliate commission
   * than the amount actually charged.
   */
  affiliateAmount = Math.min(
    Math.max(affiliateAmount, 0),
    amount
  );

  const remainingAmount = roundMoney(
    amount - affiliateAmount
  );

  return {
    affiliateCode: code,

    affiliateUserId: affiliateUser._id,

    affiliateType:
      commissionType === "percentage"
        ? "PERCENTAGE"
        : "FIXED",

    affiliateValue: commissionValue,

    affiliateAmount,

    remainingAmount,
  };
};

/* ============================================================
   CREATE CASHFREE PAYMENT
============================================================ */

export const createAccessTokenData = () => {
  const rawToken = generateDownloadToken();
  return { rawToken, tokenHash: hashDownloadToken(rawToken), now: new Date(), expiresAt: new Date(Date.now() + ACCESS_DURATION) };
};

const accessFields = (a) => ({
  "access.tokenHash": a.tokenHash,
  "access.expiresAt": a.expiresAt,
  "access.generatedAt": a.now,
  "access.lastAccessedAt": null,
  "access.accessCount": 0,
  "access.revoked": false,
});

/**
 * The ONE place a book order becomes PAID, for every gateway.
 * Safe to call any number of times (return trip, browser verify, webhook): the first call marks the order paid and
 * runs the purchase side effects once; later calls only refresh the record (and can issue a fresh access link).
 *
 * @param order            the Order document
 * @param gateway          "cashfree" | "razorpay" | "payu" | ...
 * @param result           what verifyPayment returned ({ paymentId, method, raw })
 * @param signatureVerified  true when a signed browser/webhook payload was checked too
 * @param issueAccessToken   true on the buyer's own return trip: returns { token } for the success page
 */
export const settleBookOrder = async ({ order, gateway, result, signatureVerified = false, issueAccessToken = false, updatedBy = "payment" }) => {
  const provider = providerLabel(gateway);
  const now = new Date();
  const flags = Object.fromEntries(verifyFlagsFor(gateway).map((f) => [`verification.${f}`, true]));
  if (signatureVerified) flags["verification.callbackHashVerified"] = true;

  const common = {
    "payment.paymentId": result.paymentId ? String(result.paymentId) : order.payment?.paymentId ?? null,
    "payment.method": result.method || order.payment?.method || null,
    "payment.verificationResponse": result.raw ?? null,
    ...flags,
    "verification.verifiedAt": now,
    updatedBy,
  };

  const access = issueAccessToken ? createAccessTokenData() : null;

  const first = await Order.findOneAndUpdate(
    { _id: order._id, "payment.provider": provider, orderStatus: { $ne: "PAID" } },
    {
      $set: {
        ...common,
        orderStatus: "PAID",
        "payment.status": "SUCCESS",
        "payment.amount": Number(order.payment.amount),
        "payment.paidAt": now,
        "payment.failedAt": null,
        ...(access ? accessFields(access) : {}),
      },
    },
    { new: true }
  );

  if (first) {
    await incrementPurchaseCounters(first);
    scheduleEbookEmail(first); // background PDF email, not awaited
    return { order: first, token: access?.rawToken || null, firstPayment: true };
  }

  const again = issueAccessToken ? createAccessTokenData() : null;
  const paid = await Order.findOneAndUpdate(
    { _id: order._id, "payment.provider": provider, orderStatus: "PAID", "payment.status": "SUCCESS", "verification.amountVerified": true },
    { $set: { ...common, ...(again ? accessFields(again) : {}) } },
    { new: true }
  );
  return { order: paid, token: again?.rawToken || null, firstPayment: false };
};
