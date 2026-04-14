import mongoose from "mongoose";

/* ===== Payment SubSchema ===== */
const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    paidBy: {
      type: String,
      enum: ["UPI", "BANK", "CARD", "CASH"],
      required: true,
    },

    transactionId: String,

    notes: String,
  },
  { _id: true ,timestamps: true}
);

/* ===== Document SubSchema ===== */
const documentSchema = new mongoose.Schema(
  {
    name: String,
    fileUrl: String,
    fileName: String,
    publicId:String
  },
  { _id: true,timestamps: true }
);

/* ===== Service SubSchema ===== */
const serviceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
    },

    notes: String,

    pricingType: {
      type: String,
      enum: ["ONE-TIME", "MONTHLY"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    gst: {
      type: Number,
      default: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    /* ✅ NEW FIELD */
    remainingAmount: {
      type: Number,
      required: true,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    endDate: Date,

    status: {
      type: String,
      enum: ["ACTIVE", "COMPLETED", "CANCELLED"],
      default: "ACTIVE",
    },

    documents: [documentSchema],

    payments: [paymentSchema],
  },
  { _id: true,timestamps: true }
);

/* ===== Main Client Schema ===== */
const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    companyName:{
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    phone: {
      type: String,
      match: [/^\d{10}$/, "Phone must be 10 digits"],
    },
    address: String,
    notes: String,
    services: [serviceSchema],
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Client", clientSchema);