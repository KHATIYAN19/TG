import mongoose from "mongoose";
import Book from "../models/Book.js";
import Order from "../models/Order.js";

const roundAmount = (value = 0) => {
  return Number(Number(value || 0).toFixed(2));
};

export const getBookPayments = async (req, res) => {
  try {
    const { bookId, page } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID.",
      });
    }

    let currentPage = null;
    const paginationEnabled = page !== undefined;

    if (paginationEnabled) {
      currentPage = Number(page);

      if (
        !Number.isInteger(currentPage) ||
        currentPage < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Page must be a positive integer.",
        });
      }
    }

    const book = await Book.findById(bookId)
      .select(
        "title slug price mrp currency coverPageUrl stats active"
      )
      .lean();

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    const objectBookId =
      new mongoose.Types.ObjectId(bookId);

    const paymentAmountExpression = {
      $ifNull: [
        "$payment.amount",
        {
          $ifNull: [
            "$book.price",
            0,
          ],
        },
      ],
    };

    const [
      summaryResult,
      paymentStatusBreakdown,
      orderStatusBreakdown,
      refundStatusBreakdown,
      couponBreakdown,
      affiliateBreakdown,
      mailHistoryResult,
    ] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            bookId: objectBookId,
          },
        },

        {
          $group: {
            _id: null,

            totalOrders: {
              $sum: 1,
            },

            totalOrderAmount: {
              $sum: paymentAmountExpression,
            },

            successfulPayments: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$payment.status",
                      "SUCCESS",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            failedPayments: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$payment.status",
                      "FAILED",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            pendingPayments: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$payment.status",
                      "PENDING",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            cancelledPayments: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$payment.status",
                      "CANCELLED",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            fullyRefundedPayments: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$payment.status",
                      "REFUNDED",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            partiallyRefundedPayments: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$payment.status",
                      "PARTIALLY_REFUNDED",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            paidOrders: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "$payment.status",
                      [
                        "SUCCESS",
                        "REFUNDED",
                        "PARTIALLY_REFUNDED",
                      ],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            successfulAmount: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$payment.status",
                      "SUCCESS",
                    ],
                  },
                  paymentAmountExpression,
                  0,
                ],
              },
            },

            failedAmount: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$payment.status",
                      "FAILED",
                    ],
                  },
                  paymentAmountExpression,
                  0,
                ],
              },
            },

            pendingAmount: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$payment.status",
                      "PENDING",
                    ],
                  },
                  paymentAmountExpression,
                  0,
                ],
              },
            },

            cancelledAmount: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$payment.status",
                      "CANCELLED",
                    ],
                  },
                  paymentAmountExpression,
                  0,
                ],
              },
            },

            grossPaidAmount: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "$payment.status",
                      [
                        "SUCCESS",
                        "REFUNDED",
                        "PARTIALLY_REFUNDED",
                      ],
                    ],
                  },
                  paymentAmountExpression,
                  0,
                ],
              },
            },

            refundOrders: {
              $sum: {
                $cond: [
                  {
                    $ne: [
                      {
                        $ifNull: [
                          "$refund.status",
                          "NOT_REQUESTED",
                        ],
                      },
                      "NOT_REQUESTED",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            pendingRefunds: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$refund.status",
                      "PENDING",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            processingRefunds: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$refund.status",
                      "PROCESSING",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            partialRefunds: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$refund.status",
                      "PARTIAL",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            completedRefunds: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$refund.status",
                      "REFUNDED",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            failedRefunds: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$refund.status",
                      "FAILED",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            cancelledRefunds: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$refund.status",
                      "CANCELLED",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            totalRefundRequestedAmount: {
              $sum: {
                $ifNull: [
                  "$refund.requestedAmount",
                  0,
                ],
              },
            },

            totalRefundedAmount: {
              $sum: {
                $ifNull: [
                  "$refund.refundedAmount",
                  0,
                ],
              },
            },

            totalRefundRemainingAmount: {
              $sum: {
                $ifNull: [
                  "$refund.remainingAmount",
                  0,
                ],
              },
            },

            couponAppliedOrders: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$coupon.applied",
                      true,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            totalCouponDiscountAmount: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$coupon.applied",
                      true,
                    ],
                  },
                  {
                    $ifNull: [
                      "$coupon.discountAmount",
                      0,
                    ],
                  },
                  0,
                ],
              },
            },

            couponOriginalAmount: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$coupon.applied",
                      true,
                    ],
                  },
                  {
                    $ifNull: [
                      "$coupon.originalAmount",
                      0,
                    ],
                  },
                  0,
                ],
              },
            },

            couponFinalAmount: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$coupon.applied",
                      true,
                    ],
                  },
                  {
                    $ifNull: [
                      "$coupon.finalAmount",
                      0,
                    ],
                  },
                  0,
                ],
              },
            },

            totalReminderMailsSent: {
              $sum: {
                $ifNull: [
                  "$pendingMail.sentCount",
                  0,
                ],
              },
            },

            ordersWithReminderMail: {
              $sum: {
                $cond: [
                  {
                    $gt: [
                      {
                        $ifNull: [
                          "$pendingMail.sentCount",
                          0,
                        ],
                      },
                      0,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            lastReminderStatusSent: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$pendingMail.lastStatus",
                      "SENT",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            lastReminderStatusFailed: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$pendingMail.lastStatus",
                      "FAILED",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            totalAccessCount: {
              $sum: {
                $ifNull: [
                  "$access.accessCount",
                  0,
                ],
              },
            },

            revokedAccessOrders: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$access.revoked",
                      true,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            callbackHashVerifiedCount: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$verification.callbackHashVerified",
                      true,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            payuVerifiedCount: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$verification.payuVerified",
                      true,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            amountVerifiedCount: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$verification.amountVerified",
                      true,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            affiliateOrders: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $ne: [
                          "$payment.affiliateCode",
                          null,
                        ],
                      },
                      {
                        $ne: [
                          "$payment.affiliateCode",
                          "",
                        ],
                      },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            bookId: objectBookId,
          },
        },

        {
          $group: {
            _id: {
              $ifNull: [
                "$payment.status",
                "UNKNOWN",
              ],
            },

            count: {
              $sum: 1,
            },

            amount: {
              $sum: paymentAmountExpression,
            },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            bookId: objectBookId,
          },
        },

        {
          $group: {
            _id: {
              $ifNull: [
                "$orderStatus",
                "UNKNOWN",
              ],
            },

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            bookId: objectBookId,
          },
        },

        {
          $group: {
            _id: {
              $ifNull: [
                "$refund.status",
                "NOT_REQUESTED",
              ],
            },

            count: {
              $sum: 1,
            },

            requestedAmount: {
              $sum: {
                $ifNull: [
                  "$refund.requestedAmount",
                  0,
                ],
              },
            },

            refundedAmount: {
              $sum: {
                $ifNull: [
                  "$refund.refundedAmount",
                  0,
                ],
              },
            },

            remainingAmount: {
              $sum: {
                $ifNull: [
                  "$refund.remainingAmount",
                  0,
                ],
              },
            },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            bookId: objectBookId,
            "coupon.applied": true,
          },
        },

        {
          $group: {
            _id: {
              code: {
                $ifNull: [
                  "$coupon.code",
                  "UNKNOWN",
                ],
              },

              name: {
                $ifNull: [
                  "$coupon.name",
                  null,
                ],
              },

              discountType: {
                $ifNull: [
                  "$coupon.discountType",
                  null,
                ],
              },
            },

            uses: {
              $sum: 1,
            },

            totalDiscountAmount: {
              $sum: {
                $ifNull: [
                  "$coupon.discountAmount",
                  0,
                ],
              },
            },

            originalAmount: {
              $sum: {
                $ifNull: [
                  "$coupon.originalAmount",
                  0,
                ],
              },
            },

            finalAmount: {
              $sum: {
                $ifNull: [
                  "$coupon.finalAmount",
                  0,
                ],
              },
            },
          },
        },

        {
          $sort: {
            uses: -1,
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            bookId: objectBookId,
          },
        },

        {
          $group: {
            _id: {
              $cond: [
                {
                  $and: [
                    {
                      $ne: [
                        "$payment.affiliateCode",
                        null,
                      ],
                    },
                    {
                      $ne: [
                        "$payment.affiliateCode",
                        "",
                      ],
                    },
                  ],
                },

                "$payment.affiliateCode",

                "NO_AFFILIATE",
              ],
            },

            orders: {
              $sum: 1,
            },

            amount: {
              $sum: paymentAmountExpression,
            },

            successfulOrders: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$payment.status",
                      "SUCCESS",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            successfulAmount: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$payment.status",
                      "SUCCESS",
                    ],
                  },
                  paymentAmountExpression,
                  0,
                ],
              },
            },
          },
        },

        {
          $sort: {
            orders: -1,
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            bookId: objectBookId,

            "pendingMail.sentCount": {
              $gt: 0,
            },
          },
        },

        {
          $group: {
            _id: null,

            firstMailSentAt: {
              $min: "$pendingMail.firstSentAt",
            },

            lastMailSentAt: {
              $max: "$pendingMail.lastSentAt",
            },
          },
        },
      ]),
    ]);

    const rawSummary =
      summaryResult[0] || {};

    const grossPaidAmount =
      Number(
        rawSummary.grossPaidAmount || 0
      );

    const totalRefundedAmount =
      Number(
        rawSummary.totalRefundedAmount || 0
      );

    const summary = {
      totalOrders:
        rawSummary.totalOrders || 0,

      totalOrderAmount:
        roundAmount(
          rawSummary.totalOrderAmount
        ),

      payments: {
        paidOrders:
          rawSummary.paidOrders || 0,

        successfulPayments:
          rawSummary.successfulPayments || 0,

        failedPayments:
          rawSummary.failedPayments || 0,

        pendingPayments:
          rawSummary.pendingPayments || 0,

        cancelledPayments:
          rawSummary.cancelledPayments || 0,

        fullyRefundedPayments:
          rawSummary.fullyRefundedPayments || 0,

        partiallyRefundedPayments:
          rawSummary.partiallyRefundedPayments || 0,

        successfulAmount:
          roundAmount(
            rawSummary.successfulAmount
          ),

        failedAmount:
          roundAmount(
            rawSummary.failedAmount
          ),

        pendingAmount:
          roundAmount(
            rawSummary.pendingAmount
          ),

        cancelledAmount:
          roundAmount(
            rawSummary.cancelledAmount
          ),

        grossPaidAmount:
          roundAmount(
            grossPaidAmount
          ),

        netRevenue:
          roundAmount(
            grossPaidAmount -
              totalRefundedAmount
          ),
      },

      refunds: {
        refundOrders:
          rawSummary.refundOrders || 0,

        pendingRefunds:
          rawSummary.pendingRefunds || 0,

        processingRefunds:
          rawSummary.processingRefunds || 0,

        partialRefunds:
          rawSummary.partialRefunds || 0,

        completedRefunds:
          rawSummary.completedRefunds || 0,

        failedRefunds:
          rawSummary.failedRefunds || 0,

        cancelledRefunds:
          rawSummary.cancelledRefunds || 0,

        totalRefundRequestedAmount:
          roundAmount(
            rawSummary.totalRefundRequestedAmount
          ),

        totalRefundedAmount:
          roundAmount(
            totalRefundedAmount
          ),

        totalRefundRemainingAmount:
          roundAmount(
            rawSummary.totalRefundRemainingAmount
          ),
      },

      coupons: {
        couponAppliedOrders:
          rawSummary.couponAppliedOrders || 0,

        totalDiscountAmount:
          roundAmount(
            rawSummary.totalCouponDiscountAmount
          ),

        originalAmount:
          roundAmount(
            rawSummary.couponOriginalAmount
          ),

        finalAmount:
          roundAmount(
            rawSummary.couponFinalAmount
          ),
      },

      reminderMails: {
        totalSent:
          rawSummary.totalReminderMailsSent || 0,

        ordersWithReminderMail:
          rawSummary.ordersWithReminderMail || 0,

        lastStatusSent:
          rawSummary.lastReminderStatusSent || 0,

        lastStatusFailed:
          rawSummary.lastReminderStatusFailed || 0,

        firstMailSentAt:
          mailHistoryResult[0]
            ?.firstMailSentAt || null,

        lastMailSentAt:
          mailHistoryResult[0]
            ?.lastMailSentAt || null,
      },

      access: {
        totalAccessCount:
          rawSummary.totalAccessCount || 0,

        revokedAccessOrders:
          rawSummary.revokedAccessOrders || 0,
      },

      verification: {
        callbackHashVerified:
          rawSummary.callbackHashVerifiedCount || 0,

        payuVerified:
          rawSummary.payuVerifiedCount || 0,

        amountVerified:
          rawSummary.amountVerifiedCount || 0,
      },

      affiliates: {
        affiliateOrders:
          rawSummary.affiliateOrders || 0,
      },
    };

    const limit = 10;

    const paymentQuery = Order.find({
      bookId: objectBookId,
    }).sort({
      createdAt: -1,
    });

    if (paginationEnabled) {
      paymentQuery
        .skip(
          (currentPage - 1) * limit
        )
        .limit(limit);
    }

    const orders =
      await paymentQuery.lean();

    const payments = orders.map(
      (order) => {
        const access =
          order.access || {};

        const {
          tokenHash,
          ...safeAccess
        } = access;

        return {
          _id: order._id,

          orderId:
            order.orderId,

          bookId:
            order.bookId,

          book:
            order.book || null,

          customer:
            order.customer || null,

          coupon:
            order.coupon || null,

          payment:
            order.payment || null,

          refund:
            order.refund || null,

          pendingMail:
            order.pendingMail || null,

          orderStatus:
            order.orderStatus,

          access:
            safeAccess,

          verification:
            order.verification || null,

          metadata:
            order.metadata || null,

          createdBy:
            order.createdBy || null,

          updatedBy:
            order.updatedBy || null,

          createdAt:
            order.createdAt,

          updatedAt:
            order.updatedAt,
        };
      }
    );

    const totalOrders =
      summary.totalOrders;

    const pagination =
      paginationEnabled
        ? {
            enabled: true,

            page:
              currentPage,

            limit,

            totalItems:
              totalOrders,

            totalPages:
              Math.ceil(
                totalOrders / limit
              ),

            returnedItems:
              payments.length,

            hasNextPage:
              currentPage <
              Math.ceil(
                totalOrders / limit
              ),

            hasPreviousPage:
              currentPage > 1,
          }
        : {
            enabled: false,

            totalItems:
              totalOrders,

            returnedItems:
              payments.length,
          };

    return res.status(200).json({
      success: true,

      data: {
        book,

        summary,

        breakdown: {
          paymentStatus:
            paymentStatusBreakdown.map(
              (item) => ({
                status:
                  item._id,

                count:
                  item.count,

                amount:
                  roundAmount(
                    item.amount
                  ),
              })
            ),

          orderStatus:
            orderStatusBreakdown.map(
              (item) => ({
                status:
                  item._id,

                count:
                  item.count,
              })
            ),

          refundStatus:
            refundStatusBreakdown.map(
              (item) => ({
                status:
                  item._id,

                count:
                  item.count,

                requestedAmount:
                  roundAmount(
                    item.requestedAmount
                  ),

                refundedAmount:
                  roundAmount(
                    item.refundedAmount
                  ),

                remainingAmount:
                  roundAmount(
                    item.remainingAmount
                  ),
              })
            ),

          coupons:
            couponBreakdown.map(
              (item) => ({
                code:
                  item._id.code,

                name:
                  item._id.name,

                discountType:
                  item._id.discountType,

                uses:
                  item.uses,

                totalDiscountAmount:
                  roundAmount(
                    item.totalDiscountAmount
                  ),

                originalAmount:
                  roundAmount(
                    item.originalAmount
                  ),

                finalAmount:
                  roundAmount(
                    item.finalAmount
                  ),
              })
            ),

          affiliates:
            affiliateBreakdown.map(
              (item) => ({
                affiliateCode:
                  item._id,

                orders:
                  item.orders,

                amount:
                  roundAmount(
                    item.amount
                  ),

                successfulOrders:
                  item.successfulOrders,

                successfulAmount:
                  roundAmount(
                    item.successfulAmount
                  ),
              })
            ),
        },

        pagination,

        payments,
      },
    });
  } catch (error) {
    console.error(
      "Get book payments:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch book payments.",
    });
  }
};

export const deleteBookPayment = async (
  req,
  res
) => {
  try {
    const {
      bookId,
      orderId,
    } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        bookId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        orderId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment/order ID.",
      });
    }

    const bookExists =
      await Book.exists({
        _id: bookId,
      });

    if (!bookExists) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    const deletedOrder =
      await Order.findOneAndDelete({
        _id: orderId,
        bookId,
      }).lean();

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message:
          "Payment not found for this book.",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Payment deleted successfully.",

      data: {
        _id:
          deletedOrder._id,

        orderId:
          deletedOrder.orderId,

        customerEmail:
          deletedOrder.customer?.email ||
          null,

        paymentStatus:
          deletedOrder.payment?.status ||
          null,

        amount:
          deletedOrder.payment?.amount ||
          0,
      },
    });
  } catch (error) {
    console.error(
      "Delete book payment:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete payment.",
    });
  }
};


/**
 * ADMIN - ALL PAYMENTS FOR A SPECIFIC DATE
 *
 * GET /api/admin/payments/daily
 * GET /api/admin/payments/daily?date=2026-10-28
 * GET /api/admin/payments/daily?date=2026-10-28&page=1&limit=20
 *
 * Date timezone: Asia/Kolkata (IST)
 * Date field used: Order.createdAt
 *
 * Existing Order and roundAmount imports/helpers are reused.
 */

// Convert selected IST calendar date into a UTC query range.
const getISTDateRange = (dateString) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const check = new Date(Date.UTC(year, month - 1, day));

  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }

  const IST_OFFSET_MS = 330 * 60 * 1000;

  const start = new Date(
    Date.UTC(year, month - 1, day) - IST_OFFSET_MS
  );

  const end = new Date(start.getTime() + 86400000);

  return { start, end };
};

// Return today's date in IST, not server-local timezone.
const getTodayIST = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
};

// Do not expose access tokens, gateway secrets, hashes,
// sensitive callback payloads or internal credentials.
const pickFields = (source, fields) => {
  if (!source || typeof source !== "object") return null;

  const result = {};

  for (const field of fields) {
    if (source[field] !== undefined) {
      result[field] = source[field];
    }
  }

  return result;
};

const safeAdminPayment = (order) => {
  const payment = order.payment || {};

  return {
    _id: order._id,
    orderId: order.orderId,
    bookId: order.bookId,

    book: order.book || null,

    customer: pickFields(order.customer, [
      "name",
      "email",
      "phone",
    ]),

    orderStatus: order.orderStatus,

    payment: pickFields(payment, [
      "status",
      "amount",
      "currency",
      "gateway",
      "provider",
      "method",
      "paymentMethod",
      "paymentMode",
      "transactionId",
      "gatewayTransactionId",
      "gatewayOrderId",
      "paymentId",
      "bankReference",
      "bankReferenceNumber",
      "paidAt",
      "failedAt",
      "failureReason",
      "affiliateCode",
    ]),

    coupon: order.coupon || null,

    refund: pickFields(order.refund, [
      "status",
      "requestedAmount",
      "refundedAmount",
      "remainingAmount",
      "requestedAt",
      "processedAt",
      "refundedAt",
      "reason",
    ]),

    pendingMail: order.pendingMail || null,

    access: pickFields(order.access, [
      "revoked",
      "revokedAt",
      "accessCount",
      "lastAccessedAt",
      "expiresAt",
    ]),

    verification: pickFields(order.verification, [
      "callbackHashVerified",
      "payuVerified",
      "amountVerified",
      "verifiedAt",
    ]),

    createdBy: order.createdBy || null,
    updatedBy: order.updatedBy || null,

    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

export const getDailyAdminPayments = async (req, res) => {
  try {
    const {
      date = getTodayIST(),
      page = "1",
      limit = "20",
      status,
    } = req.query;

    // -------------------------------------------
    // 1. Validate date and pagination
    // -------------------------------------------

    if (typeof date !== "string") {
      return res.status(400).json({
        success: false,
        message: "Date must be YYYY-MM-DD.",
      });
    }

    const range = getISTDateRange(date);

    if (!range) {
      return res.status(400).json({
        success: false,
        message: "Invalid date. Use YYYY-MM-DD.",
      });
    }

    const currentPage = Number(page);
    const pageLimit = Number(limit);

    if (
      !Number.isSafeInteger(currentPage) ||
      currentPage < 1 ||
      !Number.isSafeInteger(pageLimit) ||
      pageLimit < 1 ||
      pageLimit > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Page must be >= 1 and limit must be 1 to 100.",
      });
    }

    const allowedStatuses = [
      "SUCCESS",
      "FAILED",
      "PENDING",
      "CANCELLED",
      "REFUNDED",
      "PARTIALLY_REFUNDED",
    ];

    const normalizedStatus =
      typeof status === "string"
        ? status.trim().toUpperCase()
        : "";

    if (
      status !== undefined &&
      (!normalizedStatus ||
        !allowedStatuses.includes(normalizedStatus))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status.",
        allowedStatuses,
      });
    }

    // -------------------------------------------
    // 2. Date filter across ALL books
    // -------------------------------------------

    const dateFilter = {
      createdAt: {
        $gte: range.start,
        $lt: range.end,
      },
    };

    const listFilter = { ...dateFilter };

    if (normalizedStatus) {
      listFilter["payment.status"] = normalizedStatus;
    }

    // -------------------------------------------
    // 3. Monetary expression
    // -------------------------------------------

    const amountExpression = {
      $convert: {
        input: {
          $ifNull: [
            "$payment.amount",
            "$book.price",
          ],
        },
        to: "double",
        onError: 0,
        onNull: 0,
      },
    };

    const refundedExpression = {
      $convert: {
        input: "$refund.refundedAmount",
        to: "double",
        onError: 0,
        onNull: 0,
      },
    };

    const paidStatuses = [
      "SUCCESS",
      "REFUNDED",
      "PARTIALLY_REFUNDED",
    ];

    const paidCondition = {
      $in: ["$payment.status", paidStatuses],
    };

    // -------------------------------------------
    // 4. Analytics aggregation
    // -------------------------------------------

    const analyticsPipeline = [
      { $match: dateFilter },

      {
        $addFields: {
          _adminAmount: amountExpression,
          _adminRefunded: refundedExpression,
          _adminCurrency: {
            $ifNull: [
              "$payment.currency",
              {
                $ifNull: ["$book.currency", "INR"],
              },
            ],
          },
          _adminAffiliate: {
            $ifNull: [
              "$payment.affiliateCode",
              "NO_AFFILIATE",
            ],
          },
        },
      },

      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,

                totalOrders: { $sum: 1 },

                successfulPayments: {
                  $sum: {
                    $cond: [
                      { $eq: ["$payment.status", "SUCCESS"] },
                      1,
                      0,
                    ],
                  },
                },

                failedPayments: {
                  $sum: {
                    $cond: [
                      { $eq: ["$payment.status", "FAILED"] },
                      1,
                      0,
                    ],
                  },
                },

                pendingPayments: {
                  $sum: {
                    $cond: [
                      { $eq: ["$payment.status", "PENDING"] },
                      1,
                      0,
                    ],
                  },
                },

                cancelledPayments: {
                  $sum: {
                    $cond: [
                      { $eq: ["$payment.status", "CANCELLED"] },
                      1,
                      0,
                    ],
                  },
                },

                fullyRefundedPayments: {
                  $sum: {
                    $cond: [
                      { $eq: ["$payment.status", "REFUNDED"] },
                      1,
                      0,
                    ],
                  },
                },

                partiallyRefundedPayments: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          "$payment.status",
                          "PARTIALLY_REFUNDED",
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },

                paidOrders: {
                  $sum: {
                    $cond: [paidCondition, 1, 0],
                  },
                },

                totalOrderAmount: {
                  $sum: "$_adminAmount",
                },

                successfulAmount: {
                  $sum: {
                    $cond: [
                      { $eq: ["$payment.status", "SUCCESS"] },
                      "$_adminAmount",
                      0,
                    ],
                  },
                },

                grossPaidAmount: {
                  $sum: {
                    $cond: [
                      paidCondition,
                      "$_adminAmount",
                      0,
                    ],
                  },
                },

                totalRefundedAmount: {
                  $sum: "$_adminRefunded",
                },

                couponAppliedOrders: {
                  $sum: {
                    $cond: [
                      { $eq: ["$coupon.applied", true] },
                      1,
                      0,
                    ],
                  },
                },

                couponDiscountAmount: {
                  $sum: {
                    $convert: {
                      input: "$coupon.discountAmount",
                      to: "double",
                      onError: 0,
                      onNull: 0,
                    },
                  },
                },

                reminderMailsSent: {
                  $sum: {
                    $ifNull: ["$pendingMail.sentCount", 0],
                  },
                },

                affiliateOrders: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          {
                            $ne: [
                              "$payment.affiliateCode",
                              null,
                            ],
                          },
                          {
                            $ne: [
                              "$payment.affiliateCode",
                              "",
                            ],
                          },
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],

          paymentStatus: [
            {
              $group: {
                _id: {
                  $ifNull: [
                    "$payment.status",
                    "UNKNOWN",
                  ],
                },
                count: { $sum: 1 },
                amount: { $sum: "$_adminAmount" },
              },
            },
            { $sort: { count: -1 } },
          ],

          orderStatus: [
            {
              $group: {
                _id: {
                  $ifNull: [
                    "$orderStatus",
                    "UNKNOWN",
                  ],
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
          ],

          currencies: [
            {
              $group: {
                _id: "$_adminCurrency",
                totalOrders: { $sum: 1 },

                successfulAmount: {
                  $sum: {
                    $cond: [
                      { $eq: ["$payment.status", "SUCCESS"] },
                      "$_adminAmount",
                      0,
                    ],
                  },
                },

                grossPaidAmount: {
                  $sum: {
                    $cond: [
                      paidCondition,
                      "$_adminAmount",
                      0,
                    ],
                  },
                },

                refundedAmount: {
                  $sum: "$_adminRefunded",
                },
              },
            },
          ],

          books: [
            {
              $group: {
                _id: "$bookId",
                bookTitle: {
                  $first: "$book.title",
                },
                currency: {
                  $first: "$_adminCurrency",
                },
                totalOrders: { $sum: 1 },

                successfulOrders: {
                  $sum: {
                    $cond: [
                      { $eq: ["$payment.status", "SUCCESS"] },
                      1,
                      0,
                    ],
                  },
                },

                grossPaidAmount: {
                  $sum: {
                    $cond: [
                      paidCondition,
                      "$_adminAmount",
                      0,
                    ],
                  },
                },
              },
            },
            { $sort: { grossPaidAmount: -1 } },
          ],

          coupons: [
            { $match: { "coupon.applied": true } },
            {
              $group: {
                _id: {
                  $ifNull: [
                    "$coupon.code",
                    "UNKNOWN",
                  ],
                },
                uses: { $sum: 1 },
                totalDiscountAmount: {
                  $sum: {
                    $convert: {
                      input: "$coupon.discountAmount",
                      to: "double",
                      onError: 0,
                      onNull: 0,
                    },
                  },
                },
              },
            },
            { $sort: { uses: -1 } },
          ],

          affiliates: [
            {
              $group: {
                _id: "$_adminAffiliate",
                totalOrders: { $sum: 1 },

                successfulOrders: {
                  $sum: {
                    $cond: [
                      { $eq: ["$payment.status", "SUCCESS"] },
                      1,
                      0,
                    ],
                  },
                },

                grossPaidAmount: {
                  $sum: {
                    $cond: [
                      paidCondition,
                      "$_adminAmount",
                      0,
                    ],
                  },
                },
              },
            },
            { $sort: { totalOrders: -1 } },
          ],

          refundStatus: [
            {
              $group: {
                _id: {
                  $ifNull: [
                    "$refund.status",
                    "NOT_REQUESTED",
                  ],
                },
                count: { $sum: 1 },
                refundedAmount: {
                  $sum: "$_adminRefunded",
                },
              },
            },
            { $sort: { count: -1 } },
          ],
        },
      },
    ];

    // -------------------------------------------
    // 5. Run analytics and list queries
    // -------------------------------------------

    const skip = (currentPage - 1) * pageLimit;

    const [
      analyticsResults,
      orders,
      filteredCount,
    ] = await Promise.all([
      Order.aggregate(analyticsPipeline),

      Order.find(listFilter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(pageLimit)
        .lean(),

      Order.countDocuments(listFilter),
    ]);

    const analytics = analyticsResults[0] || {};
    const rawSummary = analytics.summary?.[0] || {};

    const grossPaidAmount = Number(
      rawSummary.grossPaidAmount || 0
    );

    const refundedAmount = Number(
      rawSummary.totalRefundedAmount || 0
    );

    const summary = {
      totalOrders: rawSummary.totalOrders || 0,

      payments: {
        paidOrders: rawSummary.paidOrders || 0,
        successfulPayments:
          rawSummary.successfulPayments || 0,
        failedPayments:
          rawSummary.failedPayments || 0,
        pendingPayments:
          rawSummary.pendingPayments || 0,
        cancelledPayments:
          rawSummary.cancelledPayments || 0,
        fullyRefundedPayments:
          rawSummary.fullyRefundedPayments || 0,
        partiallyRefundedPayments:
          rawSummary.partiallyRefundedPayments || 0,
      },

      revenue: {
        totalOrderAmount: roundAmount(
          rawSummary.totalOrderAmount
        ),

        successfulAmount: roundAmount(
          rawSummary.successfulAmount
        ),

        grossPaidAmount: roundAmount(
          grossPaidAmount
        ),

        refundedAmount: roundAmount(
          refundedAmount
        ),

        netRevenue: roundAmount(
          grossPaidAmount - refundedAmount
        ),
      },

      coupons: {
        appliedOrders:
          rawSummary.couponAppliedOrders || 0,

        totalDiscountAmount: roundAmount(
          rawSummary.couponDiscountAmount
        ),
      },

      affiliates: {
        affiliateOrders:
          rawSummary.affiliateOrders || 0,
      },

      reminders: {
        totalSent:
          rawSummary.reminderMailsSent || 0,
      },
    };

    // -------------------------------------------
    // 6. Format breakdowns
    // -------------------------------------------

    const breakdown = {
      paymentStatus: (analytics.paymentStatus || []).map(
        (item) => ({
          status: item._id,
          count: item.count,
          amount: roundAmount(item.amount),
        })
      ),

      orderStatus: (analytics.orderStatus || []).map(
        (item) => ({
          status: item._id,
          count: item.count,
        })
      ),

      currencies: (analytics.currencies || []).map(
        (item) => ({
          currency: item._id,
          totalOrders: item.totalOrders,

          successfulAmount: roundAmount(
            item.successfulAmount
          ),

          grossPaidAmount: roundAmount(
            item.grossPaidAmount
          ),

          refundedAmount: roundAmount(
            item.refundedAmount
          ),

          netRevenue: roundAmount(
            item.grossPaidAmount -
              item.refundedAmount
          ),
        })
      ),

      books: (analytics.books || []).map((item) => ({
        bookId: item._id,
        title: item.bookTitle || "Unknown Book",
        currency: item.currency,
        totalOrders: item.totalOrders,
        successfulOrders: item.successfulOrders,
        grossPaidAmount: roundAmount(
          item.grossPaidAmount
        ),
      })),

      coupons: (analytics.coupons || []).map((item) => ({
        code: item._id,
        uses: item.uses,
        totalDiscountAmount: roundAmount(
          item.totalDiscountAmount
        ),
      })),

      affiliates: (analytics.affiliates || []).map(
        (item) => ({
          affiliateCode: item._id,
          totalOrders: item.totalOrders,
          successfulOrders: item.successfulOrders,
          grossPaidAmount: roundAmount(
            item.grossPaidAmount
          ),
        })
      ),

      refundStatus: (analytics.refundStatus || []).map(
        (item) => ({
          status: item._id,
          count: item.count,
          refundedAmount: roundAmount(
            item.refundedAmount
          ),
        })
      ),
    };

    // -------------------------------------------
    // 7. Pagination
    // -------------------------------------------

    const totalPages = Math.ceil(
      filteredCount / pageLimit
    );

    const pagination = {
      page: currentPage,
      limit: pageLimit,
      totalItems: filteredCount,
      totalPages,
      returnedItems: orders.length,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };

    // -------------------------------------------
    // 8. Return complete admin response
    // -------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Daily admin payments fetched successfully.",

      data: {
        date,

        timezone: "Asia/Kolkata",

        dateRange: {
          startUTC: range.start.toISOString(),
          endUTCExclusive: range.end.toISOString(),
        },

        filters: {
          status: normalizedStatus || "ALL",
        },

        summary,
        breakdown,
        pagination,

        payments: orders.map(safeAdminPayment),
      },
    });
  } catch (error) {
    console.error(
      "Get daily admin payments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch daily admin payments.",
    });
  }
};