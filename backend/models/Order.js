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

      // PayU mihpayid
      paymentId: {
        type: String,
        default: null,
        trim: true,
        index: true,
      },

      // UPI / CC / DC / NB etc.
      method: {
        type: String,
        default: null,
        trim: true,
      },

      // Actual payment amount
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

      // Raw callback received from PayU
      callbackResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },

      // Response received from PayU Verify Payment API
      verificationResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },

    // =====================================================
    // ORDER STATUS
    // =====================================================

    orderStatus: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "FAILED",
        "CANCELLED",
        "REFUNDED",
      ],
      default: "PENDING",
      index: true,
    },

    // =====================================================
    // BOOK ACCESS
    // =====================================================

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

// Find orders for a particular book
orderSchema.index({
  bookId: 1,
  createdAt: -1,
});

// Payment/order reporting
orderSchema.index({
  orderStatus: 1,
  createdAt: -1,
});

// Customer purchase history
orderSchema.index({
  "customer.email": 1,
  createdAt: -1,
});

const Order = mongoose.model("Order", orderSchema);

export default Order;