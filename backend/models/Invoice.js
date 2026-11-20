import mongoose from "mongoose";

/*
  One invoice per paid order (unique on orderId, so a webhook that fires twice can never make two).
  Buyer, prices and seller are SNAPSHOTS taken at the time of sale: later edits to the order, the book or the seller config never change
  an invoice that already exists.
*/
const lineSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    quantity: { type: Number, default: 1 },
    mrp: { type: Number, default: 0 },
    unitPrice: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    // "TT-2026-K7M2X9Q" (random on purpose, so it never reveals sales volume). Null only for the short moment between claiming the order and receiving a number.
    invoiceNumber: { type: String, default: null },
    year: { type: Number, default: null },

    orderId: { type: String, required: true, unique: true, index: true }, // Order.orderId (the public one)
    orderRef: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, index: true },

    invoiceDate: { type: Date, required: true }, // = payment date and time

    buyer: {
      name: { type: String, default: null },
      email: { type: String, default: null, index: true },
      phone: { type: String, default: null },
    },

    lines: { type: [lineSchema], default: [] },
    currency: { type: String, default: "INR" },
    mrpTotal: { type: Number, default: 0 }, // list price (MRP) before any discount
    subtotal: { type: Number, default: 0 }, // selling price before coupon/offer
    offerDiscount: { type: Number, default: 0 },
    couponDiscount: { type: Number, default: 0 },
    otherDiscount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    coupon: {
      code: { type: String, default: null },
      name: { type: String, default: null },
      discountType: { type: String, default: null },
      discountValue: { type: Number, default: 0 },
    },
    offerName: { type: String, default: null },

    payment: {
      provider: { type: String, default: null },
      transactionId: { type: String, default: null }, // gateway order id
      paymentId: { type: String, default: null }, // gateway payment id
      method: { type: String, default: null },
      status: { type: String, default: "Paid" },
      paidAt: { type: Date, default: null },
    },

    seller: { type: mongoose.Schema.Types.Mixed, default: {} },
    taxLine: { type: String, default: "" },

    pdf: {
      key: { type: String, default: null },
      size: { type: Number, default: 0 },
      generatedAt: { type: Date, default: null },
    },

    status: { type: String, enum: ["PENDING", "READY", "FAILED"], default: "PENDING", index: true },
    attempts: { type: Number, default: 0 },
    lastAttemptAt: { type: Date, default: null },
    lastError: { type: String, default: null },

    // Email to the buyer. `requested` is true for invoices born from a real payment; admin/backfill invoices are not mailed.
    email: {
      requested: { type: Boolean, default: false },
      status: { type: String, enum: ["NONE", "SENT", "FAILED"], default: "NONE" },
      attempts: { type: Number, default: 0 },
      sentAt: { type: Date, default: null },
      lastError: { type: String, default: null },
    },

    source: { type: String, enum: ["payment", "admin", "backfill"], default: "payment" },
    createdBy: { type: String, default: null },
  },
  { timestamps: true }
);

// Unique, but only for numbers that exist (the "claimed, not yet numbered" state stays null).
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true, partialFilterExpression: { invoiceNumber: { $type: "string" } } });
invoiceSchema.index({ invoiceDate: -1 });
invoiceSchema.index({ status: 1, lastAttemptAt: 1 });

const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
export default Invoice;
