
import mongoose from "mongoose";

const { Schema } = mongoose;

export const INTERVIEW_TOPICS = [
  "DSA",
  "LLD",
  "HLD",
  "GENAI",
  "PROJECTS",
];

export const SLOT_STATUSES = [
  "AVAILABLE",
  "HELD",
  "BOOKED",
  "BLOCKED",
  "CANCELLED",
];

const reservationSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "InterviewBooking",
      default: null,
    },

    heldAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },

    bookedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const interviewSlotSchema = new Schema(
  {
    interviewerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
      default: "1:1 Mock Interview",
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2000,
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
      min: 15,
      max: 240,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    /*
      SLOT-WISE PRICING

      Example:
      30 minutes => Rs. 299
      60 minutes => Rs. 599
      90 minutes => Rs. 999

      Admin can set any valid price.
    */

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
      enum: ["INR"],
    },

    /*
      Admin decides which interview
      topics are permitted for this slot.
    */

    allowedTopics: {
      type: [
        {
          type: String,
          enum: INTERVIEW_TOPICS,
        },
      ],
      default: () => [...INTERVIEW_TOPICS],
    },

    maxTopics: {
      type: Number,
      default: 3,
      min: 1,
      max: 5,
    },

    /*
      SLOT AVAILABILITY

      AVAILABLE = Open for booking
      HELD      = Payment in progress
      BOOKED    = Payment verified
      BLOCKED   = Manually blocked by admin
      CANCELLED = Manually cancelled by admin
    */

    status: {
      type: String,
      enum: SLOT_STATUSES,
      default: "AVAILABLE",
      index: true,
    },

    /*
      Only the current reservation
      is stored here.

      Old bookings are permanently
      preserved in InterviewBooking.
    */

    reservation: {
      type: reservationSchema,
      default: () => ({}),
    },

    /*
      Admin blocking details
    */

    blocked: {
      reason: {
        type: String,
        trim: true,
        default: null,
      },

      blockedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      blockedAt: {
        type: Date,
        default: null,
      },
    },

    /*
      Soft deletion

      Never physically delete a slot
      referenced by booking history.
    */

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
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    deleteReason: {
      type: String,
      trim: true,
      default: null,
    },

    active: {
      type: Boolean,
      default: true,
    },
    meetingUrl: {
  type: String,
  trim: true,
  default: null,
},

    /*
      Optional admin notes.
      Do not expose these publicly.
    */

    adminNotes: {
      type: String,
      default: "",
      maxlength: 2000,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    collection: "interviewslots",
  }
);

/* =====================================================
   INDEXES
===================================================== */

// Prevent exact duplicate slots for one interviewer.
interviewSlotSchema.index(
  {
    interviewerId: 1,
    startTime: 1,
    endTime: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  }
);

// Public availability searches.
interviewSlotSchema.index({
  status: 1,
  active: 1,
  isDeleted: 1,
  startTime: 1,
});

// Expired holds.
interviewSlotSchema.index({
  status: 1,
  "reservation.expiresAt": 1,
});

// Admin schedule management.
interviewSlotSchema.index({
  interviewerId: 1,
  startTime: 1,
});

/* =====================================================
   VALIDATION
===================================================== */

interviewSlotSchema.pre("validate", function () {
  if (
    !this.startTime ||
    !this.endTime ||
    this.startTime >= this.endTime
  ) {
    throw new Error(
      "End time must be after start time."
    );
  }

  const calculatedDuration =
    (this.endTime.getTime() -
      this.startTime.getTime()) /
    60000;

  if (
    calculatedDuration !==
    this.durationMinutes
  ) {
    throw new Error(
      "Duration must match startTime and endTime."
    );
  }

  if (this.mrp < this.price) {
    throw new Error(
      "MRP cannot be lower than price."
    );
  }

  if (
    this.allowedTopics.length === 0 ||
    new Set(this.allowedTopics).size !==
      this.allowedTopics.length
  ) {
    throw new Error(
      "Select unique allowed topics."
    );
  }

  if (
    this.maxTopics >
    this.allowedTopics.length
  ) {
    throw new Error(
      "maxTopics cannot exceed allowedTopics count."
    );
  }

  const owner = this.reservation?.bookingId;

  if (
    ["HELD", "BOOKED"].includes(this.status) &&
    !owner
  ) {
    throw new Error(
      "Held or booked slots require a booking ID."
    );
  }

  if (
    this.status === "AVAILABLE" &&
    owner
  ) {
    throw new Error(
      "Available slots cannot have an active reservation."
    );
  }
});

/* =====================================================
   PUBLIC SERIALIZATION

   Important:
   Explicitly select public fields in your
   controllers rather than returning the
   entire slot to customers.
===================================================== */

export default mongoose.model(
  "InterviewSlot",
  interviewSlotSchema
);
