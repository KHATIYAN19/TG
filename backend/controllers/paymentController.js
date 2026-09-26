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