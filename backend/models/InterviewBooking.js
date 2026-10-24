
import mongoose from "mongoose";

import {
  INTERVIEW_TOPICS,
} from "./InterviewSlot.js";

const { Schema } = mongoose;

export const BOOKING_STATUSES = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PAYMENT_FAILED",
  "EXPIRED",
  "CANCELLED_BY_ADMIN",
  "CANCELLED_BY_USER",
  "COMPLETED",
  "NO_SHOW",
];

export const PAYMENT_STATUSES = [
  "CREATED",
  "PENDING",
  "SUCCESS",
  "FAILED",
  "CANCELLED",
];

export const REFUND_STATUSES = [
  "NOT_REQUIRED",
  "PENDING",
  "PROCESSING",
  "SUCCESS",
  "FAILED",
  "PARTIAL",
];

/* =====================================================
   CANDIDATE DETAILS
===================================================== */

const candidateSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    experienceYears: {
      type: Number,
      min: 0,
      max: 50,
      default: 0,
    },

    currentRole: {
      type: String,
      trim: true,
      default: "",
    },

    targetRole: {
      type: String,
      trim: true,
      default: "",
    },

    currentCompany: {
      type: String,
      trim: true,
      default: "",
    },

    resumeUrl: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },
  },
  { _id: false }
);

/* =====================================================
   PAYMENT ATTEMPTS

   Multiple retries are possible.

   Never overwrite a previous successful
   or failed payment attempt.
===================================================== */

const paymentAttemptSchema = new Schema(
  {
    attemptId: {
      type: String,
      required: true,
    },

    gateway: {
      type: String,
      enum: ["PAYU", "CASHFREE"],
      required: true,
    },

    gatewayOrderId: {
      type: String,
      required: true,
    },

    gatewayPaymentId: {
      type: String,
      default: null,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      enum: ["INR"],
      default: "INR",
    },

    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "CREATED",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    failureReason: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

/* =====================================================
   CANCELLATION

   Admin cancellation requires a reason.
   Booking remains in history.

   slotReopened tracks whether the
   associated slot was released.
===================================================== */

const cancellationSchema = new Schema(
  {
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    cancelledByRole: {
      type: String,
      enum: ["ADMIN", "USER", "SYSTEM"],
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },

    cancelledAt: {
      type: Date,
      required: true,
    },

    slotReopened: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

/* =====================================================
   REFUND
===================================================== */

const refundSchema = new Schema(
  {
    status: {
      type: String,
      enum: REFUND_STATUSES,
      default: "NOT_REQUIRED",
    },

    amount: {
      type: Number,
      min: 0,
      default: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    gatewayRefundId: {
      type: String,
      default: null,
    },

    reason: {
      type: String,
      default: null,
    },

    initiatedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    failureReason: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

/* =====================================================
   BOOKING EVENTS

   Keep a simple embedded audit history
   rather than creating another collection.
===================================================== */

const bookingEventSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },

    fromStatus: {
      type: String,
      default: null,
    },

    toStatus: {
      type: String,
      default: null,
    },

    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reason: {
      type: String,
      default: "",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/* =====================================================
   MAIN BOOKING SCHEMA
===================================================== */

const interviewBookingSchema = new Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      immutable: true,
    },

    slotId: {
      type: Schema.Types.ObjectId,
      ref: "InterviewSlot",
      required: true,
      index: true,
      immutable: true,
    },

    interviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    candidate: {
      type: candidateSchema,
      required: true,
    },

    /* USER-SELECTED TOPICS */

    selectedTopics: {
      type: [
        {
          type: String,
          enum: INTERVIEW_TOPICS,
        },
      ],
      required: true,

      validate: {
        validator(topics) {
          return (
            topics.length >= 1 &&
            topics.length <= 5 &&
            new Set(topics).size === topics.length
          );
        },

        message:
          "Select between 1 and 5 unique interview topics.",
      },
    },

    /* SLOT SNAPSHOT

       Preserve the original slot time,
       price, duration and name even if
       the admin changes the slot later.
    */

    slotSnapshot: {
      title: {
        type: String,
        required: true,
      },

      startTime: {
        type: Date,
        required: true,
      },

      endTime: {
        type: Date,
        required: true,
      },

      durationMinutes: {
        type: Number,
        required: true,
      },

      timezone: {
        type: String,
        default: "Asia/Kolkata",
      },

      price: {
        type: Number,
        required: true,
      },

      mrp: {
        type: Number,
        required: true,
      },

      currency: {
        type: String,
        required: true,
        default: "INR",
      },
    },

    /* CURRENT BOOKING STATUS */

    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: "PENDING_PAYMENT",
      index: true,
    },

    holdExpiresAt: {
      type: Date,
      default: null,
    },

    confirmedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    /* PAYMENT SUMMARY */

    payment: {
      gateway: {
        type: String,
        enum: ["PAYU", "CASHFREE"],
        default: "CASHFREE",
      },

      status: {
        type: String,
        enum: [
          "NOT_STARTED",
          ...PAYMENT_STATUSES,
        ],
        default: "NOT_STARTED",
      },

      latestAttemptId: {
        type: String,
        default: null,
      },

      gatewayOrderId: {
        type: String,
        default: null,
      },

      gatewayPaymentId: {
        type: String,
        default: null,
      },

      paidAt: {
        type: Date,
        default: null,
      },
    },

    /* EMBEDDED PAYMENT HISTORY */

    paymentAttempts: {
      type: [paymentAttemptSchema],
      default: [],
    },

    /* MEETING DETAILS */

    meeting: {
      provider: {
        type: String,
        enum: [
          "GOOGLE_MEET",
          "ZOOM",
          "MICROSOFT_TEAMS",
          "OTHER",
        ],
        default: "GOOGLE_MEET",
      },

      url: {
        type: String,
        default: null,
      },

      meetingId: {
        type: String,
        default: null,
      },

      assignedAt: {
        type: Date,
        default: null,
      },

      assignedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    failureReason: {
  type: String,
  default: null,
},

verifiedAt: {
  type: Date,
  default: null,
},
    /* ADMIN / USER CANCELLATION */

    cancellation: {
      type: cancellationSchema,
      default: undefined,
    },

    /* REFUND TRACKING */

    refund: {
      type: refundSchema,
      default: () => ({}),
    },

    /* EMAIL STATUS */

    notifications: {
      confirmationSentAt: {
        type: Date,
        default: null,
      },

      reminder24hSentAt: {
        type: Date,
        default: null,
      },

      reminder1hSentAt: {
        type: Date,
        default: null,
      },

      cancellationSentAt: {
        type: Date,
        default: null,
      },
    },

    /* ADMIN NOTES */

    adminNotes: {
      type: String,
      default: "",
      maxlength: 3000,
    },

    /* STATUS HISTORY */

    events: {
      type: [bookingEventSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    collection: "interviewbookings",
  }
);

/* =====================================================
   INDEXES
===================================================== */

interviewBookingSchema.index({
  "candidate.email": 1,
  createdAt: -1,
});

interviewBookingSchema.index({
  slotId: 1,
  createdAt: -1,
});

interviewBookingSchema.index({
  interviewerId: 1,
  status: 1,
  "slotSnapshot.startTime": 1,
});

interviewBookingSchema.index({
  status: 1,
  holdExpiresAt: 1,
});

/*
  Only one CONFIRMED booking can
  reference a given slot.

  This is a secondary safeguard.
  Slot reservation ownership must
  still be enforced atomically.
*/

interviewBookingSchema.index(
  { slotId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "CONFIRMED",
    },
  }
);

/* =====================================================
   VALIDATION
===================================================== */

interviewBookingSchema.pre("validate", function () {
  if (
    !this.selectedTopics ||
    this.selectedTopics.length === 0
  ) {
    throw new Error(
      "At least one interview topic is required."
    );
  }

  if (
    this.cancellation &&
    this.status.startsWith("CANCELLED") &&
    !this.cancellation.reason?.trim()
  ) {
    throw new Error(
      "Cancellation reason is required."
    );
  }
});

export default mongoose.model(
  "InterviewBooking",
  interviewBookingSchema
);
