import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },

    book: {
      title: {
        type: String,
        required: true,
        trim: true,
      },

      price: {
        type: Number,
        required: true,
        min: 0,
      },

      mrp: {
        type: Number,
        required: true,
        min: 0,
      },

      currency: {
        type: String,
        default: "INR",
        uppercase: true,
        trim: true,
      },
    },

    customer: {
      name: {
        type: String,
        default: null,
        trim: true,
      },

      email: {
        type: String,
        default: null,
        lowercase: true,
        trim: true,
      },

      phone: {
        type: String,
        default: null,
        trim: true,
      },
    },

    coupon: {
      applied: {
        type: Boolean,
        default: false,
      },

      couponId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
        default: null,
      },

      code: {
        type: String,
        default: null,
        trim: true,
        uppercase: true,
      },

      name: {
        type: String,
        default: null,
        trim: true,
      },

      description: {
        type: String,
        default: null,
        trim: true,
      },

      discountType: {
        type: String,
        enum: ["PERCENTAGE", "FIXED"],
        default: null,
      },

      discountValue: {
        type: Number,
        default: 0,
        min: 0,
      },

      maxDiscountAmount: {
        type: Number,
        default: null,
        min: 0,
      },

      minimumOrderAmount: {
        type: Number,
        default: null,
        min: 0,
      },

      originalAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      discountAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      finalAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      appliedAt: {
        type: Date,
        default: null,
      },
    },

    payment: {
      provider: {
        type: String,
        default: "PayU",
        trim: true,
      },

      transactionId: {
        type: String,
        default: null,
        trim: true,
        index: true,
      },

      affiliateCode: {
        type: String,
        default: null,
        trim: true,
        lowercase: true,
      },

      paymentId: {
        type: String,
        default: null,
        trim: true,
        index: true,
      },

      method: {
        type: String,
        default: null,
        trim: true,
      },

      amount: {
        type: Number,
        default: 0,
        min: 0,
      },

      status: {
        type: String,
        enum: [
          "PENDING",
          "SUCCESS",
          "FAILED",
          "CANCELLED",
          "REFUNDED",
          "PARTIALLY_REFUNDED",
        ],
        default: "PENDING",
        index: true,
      },

      paidAt: {
        type: Date,
        default: null,
      },

      failedAt: {
        type: Date,
        default: null,
      },

      refundedAt: {
        type: Date,
        default: null,
      },

      callbackResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },

      verificationResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },

    refund: {
      status: {
        type: String,
        enum: [
          "NOT_REQUESTED",
          "PENDING",
          "PROCESSING",
          "PARTIAL",
          "REFUNDED",
          "FAILED",
          "CANCELLED",
        ],
        default: "NOT_REQUESTED",
        index: true,
      },

      requestedAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      refundedAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      remainingAmount: {
        type: Number,
        default: 0,
        min: 0,
      },

      reason: {
        type: String,
        default: null,
        trim: true,
      },

      provider: {
        type: String,
        default: null,
        trim: true,
      },

      providerRefundId: {
        type: String,
        default: null,
        trim: true,
        index: true,
      },

      refundTransactionId: {
        type: String,
        default: null,
        trim: true,
        index: true,
      },

      initiatedBy: {
        type: String,
        default: null,
        trim: true,
      },

      initiatedAt: {
        type: Date,
        default: null,
      },

      processedAt: {
        type: Date,
        default: null,
      },

      completedAt: {
        type: Date,
        default: null,
      },

      failedAt: {
        type: Date,
        default: null,
      },

      failureReason: {
        type: String,
        default: null,
        trim: true,
      },

      requestPayload: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },

      providerResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },

    pendingMail: {
      sentCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      firstSentAt: {
        type: Date,
        default: null,
      },

      lastSentAt: {
        type: Date,
        default: null,
        index: true,
      },

      lastSentBy: {
        type: String,
        default: null,
        trim: true,
      },

      lastStatus: {
        type: String,
        enum: ["NOT_SENT", "SENT", "FAILED"],
        default: "NOT_SENT",
      },

      lastError: {
        type: String,
        default: null,
      },
    },

    orderStatus: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "FAILED",
        "CANCELLED",
        "REFUNDED",
        "PARTIALLY_REFUNDED",
      ],
      default: "PENDING",
      index: true,
    },

    access: {
      tokenHash: {
        type: String,
        default: null,
        index: true,
      },

      expiresAt: {
        type: Date,
        default: null,
        index: true,
      },

      generatedAt: {
        type: Date,
        default: null,
      },

      lastAccessedAt: {
        type: Date,
        default: null,
      },

      accessCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      revoked: {
        type: Boolean,
        default: false,
      },
    },

    verification: {
      callbackHashVerified: {
        type: Boolean,
        default: false,
      },

      payuVerified: {
        type: Boolean,
        default: false,
      },

      amountVerified: {
        type: Boolean,
        default: false,
      },

      verifiedAt: {
        type: Date,
        default: null,
      },
    },

    metadata: {
      ipAddress: {
        type: String,
        default: null,
        trim: true,
      },

      userAgent: {
        type: String,
        default: null,
      },

      referrer: {
        type: String,
        default: null,
      },

      utmSource: {
        type: String,
        default: null,
        trim: true,
      },

      utmMedium: {
        type: String,
        default: null,
        trim: true,
      },

      utmCampaign: {
        type: String,
        default: null,
        trim: true,
      },
    },

    createdBy: {
      type: String,
      required: true,
      trim: true,
    },

    updatedBy: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({
  createdAt: -1,
});

orderSchema.index({
  bookId: 1,
  createdAt: -1,
});

orderSchema.index({
  orderStatus: 1,
  createdAt: -1,
});

orderSchema.index({
  "customer.email": 1,
  createdAt: -1,
});

orderSchema.index({
  "coupon.code": 1,
  createdAt: -1,
});

orderSchema.index({
  "payment.affiliateCode": 1,
  createdAt: -1,
});

const Order = mongoose.model("Order", orderSchema);

export default Order;