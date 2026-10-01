import mongoose from "mongoose";

const bookReviewSchema = new mongoose.Schema(
  {
    // ======================================================
    // BOOK
    // ======================================================

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

      slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      coverPageUrl: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // ======================================================
    // ORDER
    // ======================================================

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },

    orderNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // ======================================================
    // CUSTOMER
    //
    // INTERNAL ONLY
    // Never expose this from public APIs.
    // ======================================================

    customer: {
      name: {
        type: String,
        default: null,
        trim: true,
        select: false,
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        select: false,
      },
    },

    // ======================================================
    // REVIEW LINK
    // ======================================================

    reviewLink: {
      token: {
        type: String,
        required: true,
        unique: true,
        index: true,
        select: false,
      },

      generatedAt: {
        type: Date,
        default: Date.now,
      },

      generatedBy: {
        type: String,
        default: null,
        trim: true,
      },
    },

    // ======================================================
    // REVIEW
    // ======================================================

    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },

      title: {
        type: String,
        default: "",
        trim: true,
        maxlength: 120,
      },

      comment: {
        type: String,
        default: "",
        trim: true,
        maxlength: 3000,
      },

      submittedAt: {
        type: Date,
        default: null,
      },

      lastEditedAt: {
        type: Date,
        default: null,
      },

      lastEditedBy: {
        type: String,
        default: null,
        trim: true,
      },

      editedByAdmin: {
        type: Boolean,
        default: false,
      },
    },

    // ======================================================
    // REVIEW STATUS
    // ======================================================

    status: {
      type: String,
      enum: [
        "LINK_GENERATED",
        "REVIEW_SUBMITTED",
      ],
      default: "LINK_GENERATED",
      index: true,
    },

    isReviewed: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Controls whether submitted review is publicly visible.
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    verifiedPurchase: {
      type: Boolean,
      default: true,
    },

    // ======================================================
    // REVIEW EMAIL TRACKING
    // ======================================================

    reviewMail: {
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
      },

      lastAttemptAt: {
        type: Date,
        default: null,
      },

      lastSentBy: {
        type: String,
        default: null,
        trim: true,
      },

      lastStatus: {
        type: String,
        enum: [
          "NOT_SENT",
          "SENT",
          "FAILED",
        ],
        default: "NOT_SENT",
      },

      lastError: {
        type: String,
        default: null,
        maxlength: 1000,
      },
    },

    // ======================================================
    // SOFT DELETE
    // ======================================================

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: String,
      default: null,
      trim: true,
    },

    // ======================================================
    // ADMIN
    // ======================================================

    adminNotes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
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

// ======================================================
// INDEXES
// ======================================================

// Same customer cannot review same book twice.
bookReviewSchema.index(
  {
    bookId: 1,
    "customer.email": 1,
  },
  {
    unique: true,
  }
);

// Public book review query.
bookReviewSchema.index({
  bookId: 1,
  status: 1,
  isReviewed: 1,
  isActive: 1,
  isDeleted: 1,
  "review.submittedAt": -1,
});

// Admin book review query.
bookReviewSchema.index({
  bookId: 1,
  isDeleted: 1,
  createdAt: -1,
});

// Admin status filtering.
bookReviewSchema.index({
  status: 1,
  isDeleted: 1,
  createdAt: -1,
});

// Rating query.
bookReviewSchema.index({
  bookId: 1,
  "review.rating": 1,
});

const BookReview = mongoose.model(
  "BookReview",
  bookReviewSchema
);

export default BookReview;