// import Book from "../models/Book.js";
// import Order from "../models/Order.js";

// import {
//   PAYU_KEY,
//   PAYU_SALT,
//   PAYU_PAYMENT_URL,
// } from "../config/payu.js";

// import {
//   generateTransactionId,
//   generatePaymentHash,
//   verifyPayUResponseHash,
//   verifyTransactionWithPayU,
//   generateDownloadToken,
//   hashDownloadToken,
// } from "../utils/payu.js";
// import {
//   validateCouponForPayment,
// } from "../controllers/couponController.js"

// const FRONTEND_URL =
//   process.env.FRONTEND_URL ||
//   "https://targettrek.in";

// const BACKEND_URL =
//   process.env.BACKEND_URL ||
//   "https://target-trek.onrender.com";

// const ACCESS_DURATION =
//   24 * 60 * 60 * 1000;

// const failedRedirect = (orderId = null) => {
//   if (!orderId) {
//     return `${FRONTEND_URL}/payment/failed`;
//   }

//   return (
//     `${FRONTEND_URL}/payment/failed` +
//     `?order=${encodeURIComponent(orderId)}`
//   );
// };

// const successRedirect = (
//   token,
//   orderId
// ) => {
//   return (
//     `${FRONTEND_URL}/payment/success` +
//     `?token=${encodeURIComponent(token)}` +
//     `&order=${encodeURIComponent(orderId)}`
//   );
// };

// export const createPayUPayment = async (
//   req,
//   res
// ) => {
//   try {
//     const {
//       affiliateCode,
//       bookId,
//       firstname,
//       email,
//       phone,
//       utmSource,
//       utmMedium,
//       utmCampaign,
//     } = req.body;


//     if (
//       !bookId ||
//       !firstname ||
//       !email ||
//       !phone
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Name, email, phone and bookId are required.",
//       });
//     }

//     const book = await Book.findOne({
//       _id: bookId,
//       isPublished: true,
//       isActive: true,
//     });

//     if (!book) {
//       return res.status(404).json({
//         success: false,
//         message: "Book not found.",
//       });
//     }
//     const normalizedAffiliateCode =
//       typeof affiliateCode === "string"
//         ? affiliateCode.trim().toLowerCase()
//         : null;

//     const amount = Number(
//       book.price
//     ).toFixed(2);

//     const txnid =
//       generateTransactionId();

//     const productinfo =
//       book.title;

//     const normalizedEmail =
//       email.trim().toLowerCase();

//     const normalizedName =
//       firstname.trim();

//     const normalizedPhone =
//       phone.trim();

//     const hash =
//       generatePaymentHash({
//         key: PAYU_KEY,
//         txnid,
//         amount,
//         productinfo,
//         firstname:
//           normalizedName,
//         email:
//           normalizedEmail,
//         salt: PAYU_SALT,
//       });

//     const order =
//       await Order.create({
//         orderId: txnid,

//         bookId: book._id,

//         book: {
//           title:
//             book.title,

//           price:
//             book.price,

//           mrp:
//             book.mrp ||
//             book.price,

//           currency:
//             book.currency ||
//             "INR",
//         },

//         customer: {
//           name:
//             normalizedName,

//           email:
//             normalizedEmail,

//           phone:
//             normalizedPhone,
//         },

//         payment: {
//           provider:
//             "PayU",
          
//           affiliateCode: normalizedAffiliateCode,

//           transactionId:
//             txnid,

//           amount:
//             book.price,

//           status:
//             "PENDING",
//         },

//         orderStatus:
//           "PENDING",

//         metadata: {
//           ipAddress:
//             req.headers[
//               "x-forwarded-for"
//             ]
//               ?.split(",")[0]
//               ?.trim() ||
//             req.socket
//               .remoteAddress ||
//             null,

//           userAgent:
//             req.headers[
//               "user-agent"
//             ] ||
//             null,

//           referrer:
//             req.headers
//               .referer ||
//             null,

//           utmSource:
//             utmSource ||
//             null,

//           utmMedium:
//             utmMedium ||
//             null,

//           utmCampaign:
//             utmCampaign ||
//             null,
//         },

//         createdBy:
//           "customer",
//       });

//     const paymentData = {
//       key:
//         PAYU_KEY,

//       txnid,

//       amount,

//       productinfo,

//       firstname:
//         normalizedName,

//       email:
//         normalizedEmail,

//       phone:
//         normalizedPhone,

//       surl:
//         `${BACKEND_URL}/payment/payu/success`,

//       furl:
//         `${BACKEND_URL}/payment/payu/failure`,

//       udf1: "",
//       udf2: "",
//       udf3: "",
//       udf4: "",
//       udf5: "",

//       hash,
//     };

//     return res
//       .status(200)
//       .json({
//         success: true,

//         data: {
//           orderId:
//             order.orderId,

//           paymentUrl:
//             PAYU_PAYMENT_URL,

//           paymentData,
//         },
//       });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({
//         success: false,
//         message:
//           "Unable to create payment.",
//       });
//   }
// };

// export const payUSuccess = async (
//   req,
//   res
// ) => {
//   try {
//     const payuData =
//       req.body;

//     const {
//       txnid,
//       status,
//       amount,
//       mihpayid,
//       mode,
//     } = payuData;

//     if (!txnid) {
//       return res.redirect(
//         failedRedirect()
//       );
//     }

//     const order =
//       await Order.findOne({
//         "payment.transactionId":
//           txnid,
//       });

//     if (!order) {
//       return res.redirect(
//         failedRedirect()
//       );
//     }

//     const callbackHashVerified =
//       verifyPayUResponseHash(
//         payuData,
//         PAYU_SALT
//       );

//     if (!callbackHashVerified) {
//       await Order.updateOne(
//         {
//           _id:
//             order._id,

//           orderStatus: {
//             $ne: "PAID",
//           },
//         },
//         {
//           $set: {
//             "payment.callbackResponse":
//               payuData,

//             "verification.callbackHashVerified":
//               false,

//             updatedBy:
//               "payu-callback",
//           },
//         }
//       );

//       return res.redirect(
//         failedRedirect(
//           order.orderId
//         )
//       );
//     }

//     let verifiedTransaction;

//     try {
//       verifiedTransaction =
//         await verifyTransactionWithPayU(
//           txnid
//         );
//     } catch {
//       return res.redirect(
//         failedRedirect(
//           order.orderId
//         )
//       );
//     }

//     if (!verifiedTransaction) {
//       return res.redirect(
//         failedRedirect(
//           order.orderId
//         )
//       );
//     }

//     const callbackStatus =
//       String(
//         status || ""
//       )
//         .trim()
//         .toLowerCase();

//     const verifiedStatus =
//       String(
//         verifiedTransaction
//           .status || ""
//       )
//         .trim()
//         .toLowerCase();

//     const paymentSuccessful =
//       callbackStatus ===
//         "success" &&
//       verifiedStatus ===
//         "success";

//     if (!paymentSuccessful) {
//       await Order.updateOne(
//         {
//           _id:
//             order._id,

//           orderStatus: {
//             $ne: "PAID",
//           },
//         },
//         {
//           $set: {
//             "payment.status":
//               "FAILED",

//             "payment.failedAt":
//               new Date(),

//             "payment.callbackResponse":
//               payuData,

//             "payment.verificationResponse":
//               verifiedTransaction,

//             "verification.callbackHashVerified":
//               true,

//             "verification.payuVerified":
//               false,

//             "verification.amountVerified":
//               false,

//             "verification.verifiedAt":
//               new Date(),

//             orderStatus:
//               "FAILED",

//             updatedBy:
//               "payu-callback",
//           },
//         }
//       );

//       return res.redirect(
//         failedRedirect(
//           order.orderId
//         )
//       );
//     }

//     const expectedAmount =
//       Number(
//         order.book.price
//       );

//     const callbackAmount =
//       Number(amount);

//     const verifiedAmount =
//       Number(
//         verifiedTransaction
//           .amt ??
//         verifiedTransaction
//           .amount ??
//         0
//       );

//     const callbackAmountValid =
//       Math.abs(
//         expectedAmount -
//           callbackAmount
//       ) < 0.01;

//     const verifiedAmountValid =
//       Math.abs(
//         expectedAmount -
//           verifiedAmount
//       ) < 0.01;

//     if (
//       !callbackAmountValid ||
//       !verifiedAmountValid
//     ) {
//       await Order.updateOne(
//         {
//           _id:
//             order._id,

//           orderStatus: {
//             $ne: "PAID",
//           },
//         },
//         {
//           $set: {
//             "payment.callbackResponse":
//               payuData,

//             "payment.verificationResponse":
//               verifiedTransaction,

//             "verification.callbackHashVerified":
//               true,

//             "verification.payuVerified":
//               true,

//             "verification.amountVerified":
//               false,

//             "verification.verifiedAt":
//               new Date(),

//             updatedBy:
//               "payu-callback",
//           },
//         }
//       );

//       return res.redirect(
//         failedRedirect(
//           order.orderId
//         )
//       );
//     }

//     const rawAccessToken =
//       generateDownloadToken();

//     const accessTokenHash =
//       hashDownloadToken(
//         rawAccessToken
//       );

//     const now =
//       new Date();

//     const accessExpiresAt =
//       new Date(
//         Date.now() +
//           ACCESS_DURATION
//       );

//     const updatedOrder =
//       await Order.findOneAndUpdate(
//         {
//           _id:
//             order._id,

//           orderStatus: {
//             $ne: "PAID",
//           },
//         },
//         {
//           $set: {
//             orderStatus:
//               "PAID",

//             "payment.status":
//               "SUCCESS",

//             "payment.paymentId":
//               mihpayid ||
//               verifiedTransaction
//                 .mihpayid ||
//               null,

//             "payment.method":
//               mode ||
//               verifiedTransaction
//                 .mode ||
//               null,

//             "payment.amount":
//               expectedAmount,

//             "payment.paidAt":
//               now,

//             "payment.failedAt":
//               null,

//             "payment.callbackResponse":
//               payuData,

//             "payment.verificationResponse":
//               verifiedTransaction,

//             "verification.callbackHashVerified":
//               true,

//             "verification.payuVerified":
//               true,

//             "verification.amountVerified":
//               true,

//             "verification.verifiedAt":
//               now,

//             "access.tokenHash":
//               accessTokenHash,

//             "access.expiresAt":
//               accessExpiresAt,

//             "access.generatedAt":
//               now,

//             "access.lastAccessedAt":
//               null,

//             "access.accessCount":
//               0,

//             "access.revoked":
//               false,

//             updatedBy:
//               "payu-callback",
//           },
//         },
//         {
//           new: true,
//         }
//       );

//     if (updatedOrder) {
//       try {
//         await Book.updateOne(
//           {
//             _id:
//               updatedOrder
//                 .bookId,
//           },
//           {
//             $inc: {
//               "stats.purchases":
//                 1,
//             },
//           }
//         );
//       } catch {}

//       return res.redirect(
//         successRedirect(
//           rawAccessToken,
//           updatedOrder.orderId
//         )
//       );
//     }

//     const duplicateRawToken =
//       generateDownloadToken();

//     const duplicateTokenHash =
//       hashDownloadToken(
//         duplicateRawToken
//       );

//     const duplicateExpiresAt =
//       new Date(
//         Date.now() +
//           ACCESS_DURATION
//       );

//     const duplicateNow =
//       new Date();

//     const paidOrder =
//       await Order.findOneAndUpdate(
//         {
//           _id:
//             order._id,

//           orderStatus:
//             "PAID",

//           "payment.status":
//             "SUCCESS",
//         },
//         {
//           $set: {
//             "payment.callbackResponse":
//               payuData,

//             "payment.verificationResponse":
//               verifiedTransaction,

//             "verification.callbackHashVerified":
//               true,

//             "verification.payuVerified":
//               true,

//             "verification.amountVerified":
//               true,

//             "verification.verifiedAt":
//               duplicateNow,

//             "access.tokenHash":
//               duplicateTokenHash,

//             "access.expiresAt":
//               duplicateExpiresAt,

//             "access.generatedAt":
//               duplicateNow,

//             "access.lastAccessedAt":
//               null,

//             "access.accessCount":
//               0,

//             "access.revoked":
//               false,

//             updatedBy:
//               "payu-callback",
//           },
//         },
//         {
//           new: true,
//         }
//       );

//     if (!paidOrder) {
//       return res.redirect(
//         failedRedirect(
//           order.orderId
//         )
//       );
//     }

//     return res.redirect(
//       successRedirect(
//         duplicateRawToken,
//         paidOrder.orderId
//       )
//     );
//   } catch (error) {
//     return res.redirect(
//       failedRedirect()
//     );
//   }
// };

// export const payUFailure = async (
//   req,
//   res
// ) => {
//   try {
//     const data =
//       req.body;

//     const txnid =
//       data?.txnid;

//     if (!txnid) {
//       return res.redirect(
//         failedRedirect()
//       );
//     }

//     const order =
//       await Order.findOne({
//         orderId:
//           txnid,
//       });

//     if (!order) {
//       return res.redirect(
//         failedRedirect()
//       );
//     }

//     const validHash =
//       verifyPayUResponseHash(
//         data,
//         PAYU_SALT
//       );

//     if (!validHash) {
//       return res.redirect(
//         failedRedirect(
//           order.orderId
//         )
//       );
//     }

//     if (
//       order.orderStatus !==
//       "PAID"
//     ) {
//       await Order.updateOne(
//         {
//           _id:
//             order._id,

//           orderStatus: {
//             $ne: "PAID",
//           },
//         },
//         {
//           $set: {
//             "payment.status":
//               "FAILED",

//             "payment.paymentId":
//               data.mihpayid ||
//               null,

//             "payment.method":
//               data.mode ||
//               null,

//             "payment.failedAt":
//               new Date(),

//             "payment.callbackResponse":
//               data,

//             orderStatus:
//               "FAILED",

//             updatedBy:
//               "payu-callback",
//           },
//         }
//       );
//     }

//     return res.redirect(
//       failedRedirect(
//         txnid
//       )
//     );
//   } catch (error) {
//     return res.redirect(
//       failedRedirect()
//     );
//   }
// };

// export const getPurchasedBookAccess =
//   async (req, res) => {
//     try {
//       const { token } =
//         req.query;

//       if (!token) {
//         return res
//           .status(400)
//           .json({
//             success: false,
//             message:
//               "Access token is required.",
//           });
//       }

//       const tokenHash =
//         hashDownloadToken(
//           token
//         );

//       const order =
//         await Order.findOne({
//           "access.tokenHash":
//             tokenHash,

//           orderStatus:
//             "PAID",

//           "payment.status":
//             "SUCCESS",

//           "verification.callbackHashVerified":
//             true,

//           "verification.payuVerified":
//             true,

//           "verification.amountVerified":
//             true,

//           "access.revoked":
//             false,

//           "access.expiresAt": {
//             $gt: new Date(),
//           },
//         });

//       if (!order) {
//         return res
//           .status(403)
//           .json({
//             success: false,
//             message:
//               "Access link is invalid or expired.",
//           });
//       }

//       const book =
//         await Book.findOne({
//           _id:
//             order.bookId,

//           isActive:
//             true,
//         })
//           .select(
//             "title pdfUrl coverPageUrl"
//           )
//           .lean();

//       if (!book) {
//         return res
//           .status(404)
//           .json({
//             success: false,
//             message:
//               "Book not found.",
//           });
//       }

//       if (!book.pdfUrl) {
//         return res
//           .status(404)
//           .json({
//             success: false,
//             message:
//               "Book PDF is unavailable.",
//           });
//       }

//       await Order.updateOne(
//         {
//           _id:
//             order._id,
//         },
//         {
//           $set: {
//             "access.lastAccessedAt":
//               new Date(),
//           },

//           $inc: {
//             "access.accessCount":
//               1,
//           },
//         }
//       );

//       return res
//         .status(200)
//         .json({
//           success: true,

//           data: {
//             orderId:
//               order.orderId,

//             title:
//               book.title,

//             coverPageUrl:
//               book.coverPageUrl,

//             pdfUrl:
//               book.pdfUrl,

//             expiresAt:
//               order.access
//                 .expiresAt,
//           },
//         });
//     } catch (error) {
//       return res
//         .status(500)
//         .json({
//           success: false,
//           message:
//             "Unable to load purchased ebook.",
//         });
//     }
//   };

import mongoose from "mongoose";

import Book from "../models/Book.js";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";

import {
  PAYU_KEY,
  PAYU_SALT,
  PAYU_PAYMENT_URL,
} from "../config/payu.js";

import {
  generateTransactionId,
  generatePaymentHash,
  verifyPayUResponseHash,
  verifyTransactionWithPayU,
  generateDownloadToken,
  hashDownloadToken,
} from "../utils/payu.js";

import {
  validateCouponForPayment,
} from "../controllers/couponController.js";


const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  "https://targettrek.in";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://target-trek.onrender.com";

const ACCESS_DURATION =
  24 * 60 * 60 * 1000;


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


export const createPayUPayment = async (
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


    if (
      !bookId ||
      !firstname ||
      !email ||
      !phone
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Name, email, phone and bookId are required.",
      });
    }


    if (
      !mongoose.Types.ObjectId.isValid(
        bookId
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid book ID.",
      });
    }


    const book =
      await Book.findOne({
        _id: bookId,

        isPublished: true,

        isActive: true,
      });


    if (!book) {
      return res.status(404).json({
        success: false,

        message:
          "Book not found.",
      });
    }


    const normalizedAffiliateCode =
      typeof affiliateCode === "string"
        ? affiliateCode
            .trim()
            .toLowerCase()
        : null;


    const normalizedEmail =
      email
        .trim()
        .toLowerCase();


    const normalizedName =
      firstname.trim();


    const normalizedPhone =
      phone.trim();


    let pricing;


    try {
      pricing =
        await validateCouponForPayment({
          couponCode,

          book,

          email:
            normalizedEmail,
        });
    } catch (error) {
      return res
        .status(
          error.statusCode ||
            400
        )
        .json({
          success: false,

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
      return res.status(400).json({
        success: false,

        message:
          "Invalid payment amount.",
      });
    }


    const amount =
      finalAmount.toFixed(2);


    const txnid =
      generateTransactionId();


    const productinfo =
      book.title;


    const hash =
      generatePaymentHash({
        key:
          PAYU_KEY,

        txnid,

        amount,

        productinfo,

        firstname:
          normalizedName,

        email:
          normalizedEmail,

        salt:
          PAYU_SALT,
      });


    const couponData =
      pricing.couponApplied
        ? {
            applied:
              true,

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
          }
        : {
            applied:
              false,

            couponId:
              null,

            code:
              null,

            name:
              null,

            description:
              null,

            discountType:
              null,

            discountValue:
              0,

            maxDiscountAmount:
              null,

            minimumOrderAmount:
              null,

            originalAmount:
              pricing.originalAmount,

            discountAmount:
              0,

            finalAmount:
              pricing.finalAmount,

            appliedAt:
              null,
          };


    const order =
      await Order.create({
        orderId:
          txnid,


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

          currency:
            book.currency ||
            "INR",
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
            "PayU",

          affiliateCode:
            normalizedAffiliateCode,

          transactionId:
            txnid,

          amount:
            finalAmount,

          status:
            "PENDING",
        },


        orderStatus:
          "PENDING",


        metadata: {
          ipAddress:
            req.headers[
              "x-forwarded-for"
            ]
              ?.split(",")[0]
              ?.trim() ||
            req.socket
              .remoteAddress ||
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
        },


        createdBy:
          "customer",
      });


    const paymentData = {
      key:
        PAYU_KEY,

      txnid,

      amount,

      productinfo,

      firstname:
        normalizedName,

      email:
        normalizedEmail,

      phone:
        normalizedPhone,

      surl:
        `${BACKEND_URL}/payment/payu/success`,

      furl:
        `${BACKEND_URL}/payment/payu/failure`,

      udf1:
        "",

      udf2:
        "",

      udf3:
        "",

      udf4:
        "",

      udf5:
        "",

      hash,
    };


    return res
      .status(200)
      .json({
        success: true,

        data: {
          orderId:
            order.orderId,

          paymentUrl:
            PAYU_PAYMENT_URL,

          pricing: {
            couponApplied:
              pricing.couponApplied,

            couponCode:
              pricing.coupon
                ?.code ||
              null,

            couponName:
              pricing.coupon
                ?.name ||
              null,

            originalAmount:
              pricing.originalAmount,

            discountAmount:
              pricing.discountAmount,

            finalAmount:
              pricing.finalAmount,

            currency:
              book.currency ||
              "INR",
          },

          paymentData,
        },
      });
  } catch (error) {
    console.error(
      "Create PayU payment error:",
      error
    );


    return res
      .status(500)
      .json({
        success: false,

        message:
          "Unable to create payment.",
      });
  }
};


export const payUSuccess = async (
  req,
  res
) => {
  try {
    const payuData =
      req.body;


    const {
      txnid,
      status,
      amount,
      mihpayid,
      mode,
    } = payuData;


    if (!txnid) {
      return res.redirect(
        failedRedirect()
      );
    }


    const order =
      await Order.findOne({
        "payment.transactionId":
          txnid,
      });


    if (!order) {
      return res.redirect(
        failedRedirect()
      );
    }


    const callbackHashVerified =
      verifyPayUResponseHash(
        payuData,
        PAYU_SALT
      );


    if (!callbackHashVerified) {
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
            "payment.callbackResponse":
              payuData,

            "verification.callbackHashVerified":
              false,

            updatedBy:
              "payu-callback",
          },
        }
      );


      return res.redirect(
        failedRedirect(
          order.orderId
        )
      );
    }


    let verifiedTransaction;


    try {
      verifiedTransaction =
        await verifyTransactionWithPayU(
          txnid
        );
    } catch (error) {
      console.error(
        "PayU verification failed:",
        error
      );


      return res.redirect(
        failedRedirect(
          order.orderId
        )
      );
    }


    if (!verifiedTransaction) {
      return res.redirect(
        failedRedirect(
          order.orderId
        )
      );
    }


    const callbackStatus =
      String(
        status ||
          ""
      )
        .trim()
        .toLowerCase();


    const verifiedStatus =
      String(
        verifiedTransaction
          .status ||
          ""
      )
        .trim()
        .toLowerCase();


    const paymentSuccessful =
      callbackStatus ===
        "success" &&
      verifiedStatus ===
        "success";


    if (!paymentSuccessful) {
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
            "payment.status":
              "FAILED",

            "payment.failedAt":
              new Date(),

            "payment.callbackResponse":
              payuData,

            "payment.verificationResponse":
              verifiedTransaction,

            "verification.callbackHashVerified":
              true,

            "verification.payuVerified":
              false,

            "verification.amountVerified":
              false,

            "verification.verifiedAt":
              new Date(),

            orderStatus:
              "FAILED",

            updatedBy:
              "payu-callback",
          },
        }
      );


      return res.redirect(
        failedRedirect(
          order.orderId
        )
      );
    }


    /*
     * IMPORTANT:
     *
     * Do not use order.book.price here.
     *
     * order.payment.amount is the final amount
     * after coupon discount.
     */
    const expectedAmount =
      Number(
        order.payment.amount
      );


    const callbackAmount =
      Number(
        amount
      );


    const verifiedAmount =
      Number(
        verifiedTransaction
          .amt ??
        verifiedTransaction
          .amount ??
        0
      );


    const callbackAmountValid =
      Number.isFinite(
        callbackAmount
      ) &&
      Math.abs(
        expectedAmount -
          callbackAmount
      ) < 0.01;


    const verifiedAmountValid =
      Number.isFinite(
        verifiedAmount
      ) &&
      Math.abs(
        expectedAmount -
          verifiedAmount
      ) < 0.01;


    if (
      !callbackAmountValid ||
      !verifiedAmountValid
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
            "payment.callbackResponse":
              payuData,

            "payment.verificationResponse":
              verifiedTransaction,

            "verification.callbackHashVerified":
              true,

            "verification.payuVerified":
              true,

            "verification.amountVerified":
              false,

            "verification.verifiedAt":
              new Date(),

            updatedBy:
              "payu-callback",
          },
        }
      );


      return res.redirect(
        failedRedirect(
          order.orderId
        )
      );
    }


    const rawAccessToken =
      generateDownloadToken();


    const accessTokenHash =
      hashDownloadToken(
        rawAccessToken
      );


    const now =
      new Date();


    const accessExpiresAt =
      new Date(
        Date.now() +
          ACCESS_DURATION
      );


    /*
     * This update only succeeds if the order
     * has not already become PAID.
     *
     * Therefore first successful callback:
     *
     * PENDING/FAILED -> PAID
     *
     * returns updatedOrder.
     *
     * Duplicate callback will return null
     * and go to duplicate payment handling.
     */
    const updatedOrder =
      await Order.findOneAndUpdate(
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
            orderStatus:
              "PAID",

            "payment.status":
              "SUCCESS",

            "payment.paymentId":
              mihpayid ||
              verifiedTransaction
                .mihpayid ||
              null,

            "payment.method":
              mode ||
              verifiedTransaction
                .mode ||
              null,

            /*
             * Keep the actual amount that was
             * expected and verified.
             */
            "payment.amount":
              expectedAmount,

            "payment.paidAt":
              now,

            "payment.failedAt":
              null,

            "payment.callbackResponse":
              payuData,

            "payment.verificationResponse":
              verifiedTransaction,

            "verification.callbackHashVerified":
              true,

            "verification.payuVerified":
              true,

            "verification.amountVerified":
              true,

            "verification.verifiedAt":
              now,

            "access.tokenHash":
              accessTokenHash,

            "access.expiresAt":
              accessExpiresAt,

            "access.generatedAt":
              now,

            "access.lastAccessedAt":
              null,

            "access.accessCount":
              0,

            "access.revoked":
              false,

            updatedBy:
              "payu-callback",
          },
        },

        {
          new:
            true,
        }
      );


    /*
     * ONLY run this block for the FIRST
     * successful transition to PAID.
     *
     * Therefore:
     *
     * Book purchases +1 only once
     * Coupon usedCount +1 only once
     */
    if (updatedOrder) {
      /*
       * Increase coupon usage only after
       * verified successful payment.
       */
      if (
        updatedOrder
          .coupon
          ?.applied &&
        updatedOrder
          .coupon
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
                usedCount:
                  1,
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


      /*
       * Increase book purchase statistics.
       */
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
          "Unable to increment book purchases:",
          error
        );
      }


      return res.redirect(
        successRedirect(
          rawAccessToken,
          updatedOrder.orderId
        )
      );
    }


    /*
     * -------------------------------------------------
     * DUPLICATE SUCCESS CALLBACK
     * -------------------------------------------------
     *
     * The order was already marked PAID.
     *
     * Do not:
     *
     * - increase coupon usedCount
     * - increase book purchases
     *
     * We only generate a fresh access token.
     */
    const duplicateRawToken =
      generateDownloadToken();


    const duplicateTokenHash =
      hashDownloadToken(
        duplicateRawToken
      );


    const duplicateExpiresAt =
      new Date(
        Date.now() +
          ACCESS_DURATION
      );


    const duplicateNow =
      new Date();


    const paidOrder =
      await Order.findOneAndUpdate(
        {
          _id:
            order._id,

          orderStatus:
            "PAID",

          "payment.status":
            "SUCCESS",
        },

        {
          $set: {
            "payment.callbackResponse":
              payuData,

            "payment.verificationResponse":
              verifiedTransaction,

            "verification.callbackHashVerified":
              true,

            "verification.payuVerified":
              true,

            "verification.amountVerified":
              true,

            "verification.verifiedAt":
              duplicateNow,

            "access.tokenHash":
              duplicateTokenHash,

            "access.expiresAt":
              duplicateExpiresAt,

            "access.generatedAt":
              duplicateNow,

            "access.lastAccessedAt":
              null,

            "access.accessCount":
              0,

            "access.revoked":
              false,

            updatedBy:
              "payu-callback",
          },
        },

        {
          new:
            true,
        }
      );


    if (!paidOrder) {
      return res.redirect(
        failedRedirect(
          order.orderId
        )
      );
    }


    return res.redirect(
      successRedirect(
        duplicateRawToken,
        paidOrder.orderId
      )
    );
  } catch (error) {
    console.error(
      "PayU success callback error:",
      error
    );


    return res.redirect(
      failedRedirect()
    );
  }
};


export const payUFailure = async (
  req,
  res
) => {
  try {
    const data =
      req.body;


    const txnid =
      data?.txnid;


    if (!txnid) {
      return res.redirect(
        failedRedirect()
      );
    }


    const order =
      await Order.findOne({
        orderId:
          txnid,
      });


    if (!order) {
      return res.redirect(
        failedRedirect()
      );
    }


    const validHash =
      verifyPayUResponseHash(
        data,
        PAYU_SALT
      );


    if (!validHash) {
      return res.redirect(
        failedRedirect(
          order.orderId
        )
      );
    }


    /*
     * Never mark an already-paid order as failed.
     */
    if (
      order.orderStatus !==
      "PAID"
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
            "payment.status":
              "FAILED",

            "payment.paymentId":
              data.mihpayid ||
              null,

            "payment.method":
              data.mode ||
              null,

            "payment.failedAt":
              new Date(),

            "payment.callbackResponse":
              data,

            orderStatus:
              "FAILED",

            updatedBy:
              "payu-callback",
          },
        }
      );
    }


    return res.redirect(
      failedRedirect(
        txnid
      )
    );
  } catch (error) {
    console.error(
      "PayU failure callback error:",
      error
    );


    return res.redirect(
      failedRedirect()
    );
  }
};


export const getPurchasedBookAccess =
  async (req, res) => {
    try {
      const {
        token,
      } = req.query;


      if (!token) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Access token is required.",
          });
      }


      const tokenHash =
        hashDownloadToken(
          token
        );


      const order =
        await Order.findOne({
          "access.tokenHash":
            tokenHash,

          orderStatus:
            "PAID",

          "payment.status":
            "SUCCESS",

          "verification.callbackHashVerified":
            true,

          "verification.payuVerified":
            true,

          "verification.amountVerified":
            true,

          "access.revoked":
            false,

          "access.expiresAt": {
            $gt:
              new Date(),
          },
        });


      if (!order) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Access link is invalid or expired.",
          });
      }


      const book =
        await Book.findOne({
          _id:
            order.bookId,

          isActive:
            true,
        })
          .select(
            "title pdfUrl coverPageUrl"
          )
          .lean();


      if (!book) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Book not found.",
          });
      }


      if (!book.pdfUrl) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Book PDF is unavailable.",
          });
      }


      await Order.updateOne(
        {
          _id:
            order._id,
        },

        {
          $set: {
            "access.lastAccessedAt":
              new Date(),
          },

          $inc: {
            "access.accessCount":
              1,
          },
        }
      );


      return res
        .status(200)
        .json({
          success: true,

          data: {
            orderId:
              order.orderId,

            title:
              book.title,

            coverPageUrl:
              book.coverPageUrl,

            pdfUrl:
              book.pdfUrl,

            expiresAt:
              order
                .access
                .expiresAt,
          },
        });
    } catch (error) {
      console.error(
        "Get purchased book access error:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to load purchased ebook.",
        });
    }
  };