import mongoose from "mongoose";
import Book from "../models/Book.js";
import Order from "../models/Order.js";

export const getBookPayments = async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID.",
      });
    }

    const book = await Book.findById(bookId)
      .select(
        "title slug price mrp currency coverPageUrl stats"
      )
      .lean();

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    const orders = await Order.find({
      bookId,
    })
      .sort({ createdAt: -1 })
      .lean();

    let successfulPayments = 0;
    let failedPayments = 0;
    let pendingPayments = 0;

    let successfulAmount = 0;
    let failedAmount = 0;
    let pendingAmount = 0;

    for (const order of orders) {
      const amount = Number(
        order.payment?.amount ||
        order.book?.price ||
        0
      );

      if (order.payment?.status === "SUCCESS") {
        successfulPayments++;
        successfulAmount += amount;
      }

      if (order.payment?.status === "FAILED") {
        failedPayments++;
        failedAmount += amount;
      }

      if (order.payment?.status === "PENDING") {
        pendingPayments++;
        pendingAmount += amount;
      }
    }

    const payments = orders.map((order) => ({
      _id: order._id,

      orderId: order.orderId,

      book: {
        bookId: order.bookId,
        title: order.book?.title,
        price: order.book?.price,
        mrp: order.book?.mrp,
        currency: order.book?.currency,
      },

      customer: {
        name: order.customer?.name,
        email: order.customer?.email,
        phone: order.customer?.phone,
      },

      payment: {
        provider: order.payment?.provider,

        transactionId:
          order.payment?.transactionId,

        paymentId:
          order.payment?.paymentId,

        method:
          order.payment?.method,

        amount:
          order.payment?.amount,

        status:
          order.payment?.status,

        paidAt:
          order.payment?.paidAt,

        failedAt:
          order.payment?.failedAt,
      },

      verification: {
        callbackHashVerified:
          order.verification?.callbackHashVerified,

        payuVerified:
          order.verification?.payuVerified,

        amountVerified:
          order.verification?.amountVerified,

        verifiedAt:
          order.verification?.verifiedAt,
      },

      access: {
        expiresAt:
          order.access?.expiresAt,

        generatedAt:
          order.access?.generatedAt,

        lastAccessedAt:
          order.access?.lastAccessedAt,

        accessCount:
          order.access?.accessCount,

        revoked:
          order.access?.revoked,
      },

      metadata: {
        ipAddress:
          order.metadata?.ipAddress,

        userAgent:
          order.metadata?.userAgent,

        referrer:
          order.metadata?.referrer,

        utmSource:
          order.metadata?.utmSource,

        utmMedium:
          order.metadata?.utmMedium,

        utmCampaign:
          order.metadata?.utmCampaign,
      },

      orderStatus:
        order.orderStatus,

      createdAt:
        order.createdAt,

      updatedAt:
        order.updatedAt,
    }));

    return res.status(200).json({
      success: true,

      data: {
        book,

        summary: {
          totalOrders:
            orders.length,

          successfulPayments,

          failedPayments,

          pendingPayments,

          successfulAmount:
            Number(
              successfulAmount.toFixed(2)
            ),

          failedAmount:
            Number(
              failedAmount.toFixed(2)
            ),

          pendingAmount:
            Number(
              pendingAmount.toFixed(2)
            ),
        },

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