
import mongoose from "mongoose";

const { Schema } = mongoose;

const RECORD_TYPES = [
  "INCOME",
  "EXPENSE",
  "GATEWAY_RULE",
];

const CATEGORIES = [
  // Income
  "MOCK_INTERVIEW",
  "CONSULTING",
  "FREELANCE",
  "SERVICE",
  "OTHER_INCOME",

  // Expenses
  "ADVERTISEMENT",
  "CLOUD",
  "DOMAIN",
  "HOSTING",
  "EMAIL",
  "SOFTWARE",
  "AFFILIATE",
  "REFUND",
  "OTHER",

  // Gateway configuration
  "PAYMENT_GATEWAY",
];

const GATEWAYS = [
  "CASHFREE",
  "PAYU",
  "RAZORPAY",
  "ALL",
  "NONE",
];

const financeTrackerSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    recordType: {
      type: String,
      enum: RECORD_TYPES,
      required: true,
    },

    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
    },

    // INR amount for INCOME and EXPENSE.
    // Gateway rules use percentage instead.
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    gateway: {
      type: String,
      enum: GATEWAYS,
      default: "NONE",
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    // Applicable date for a manual income/expense.
    // Gateway rules apply dynamically to reports.
    transactionDate: {
      type: Date,
      default: Date.now,
    },

    paymentMethod: {
      type: String,
      enum: [
        "UPI",
        "BANK_TRANSFER",
        "CARD",
        "CASH",
        "WALLET",
        "OTHER",
        "NONE",
      ],
      default: "NONE",
    },

    referenceNumber: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Soft deletion
    isDeleted: {
      type: Boolean,
      default: false,
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
    versionKey: false,
  }
);

// Record listing and date filtering
financeTrackerSchema.index({
  recordType: 1,
  isDeleted: 1,
  transactionDate: -1,
});

financeTrackerSchema.index({
  category: 1,
  transactionDate: -1,
});

financeTrackerSchema.index({
  isActive: 1,
  isDeleted: 1,
});

// One active gateway rule per gateway.
// Multiple inactive historical rules can exist.
financeTrackerSchema.index(
  { gateway: 1 },
  {
    unique: true,
    partialFilterExpression: {
      recordType: "GATEWAY_RULE",
      isActive: true,
      isDeleted: false,
    },
  }
);

export default mongoose.model(
  "FinanceTracker",
  financeTrackerSchema
);


