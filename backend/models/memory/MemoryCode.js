import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  A unique code that lets a user create a page without paying.

  source "admin"         made by an admin in the Codes screen
  source "lifetime_pack" made automatically when someone buys the Lifetime pack: one code per paid
                         order (orderId is unique), emailed to the buyer and auto-added to their
                         Memories account when they sign up / log in with that email.
*/
const memoryCodeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, minlength: 4, maxlength: 40 },
    maxUses: { type: Number, default: 1, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    redeemedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    note: { type: String, trim: true, maxlength: 200 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },

    source: { type: String, enum: ["admin", "lifetime_pack"], default: "admin", index: true },
    /* lifetime_pack only: who bought it and which book order it came from */
    ownerEmail: { type: String, lowercase: true, trim: true, maxlength: 254, default: "" },
    ownerName: { type: String, trim: true, maxlength: 120, default: "" },
    orderId: { type: String, default: null }, // Order.orderId
    bookTitle: { type: String, default: "" },

    /* the email that carries this code. "queued" = handed to the mail queue; "sent" = delivered directly (no queue configured). */
    mail: {
      status: { type: String, enum: ["none", "sending", "queued", "sent", "failed"], default: "none" },
      claimedAt: { type: Date, default: null },
      queuedAt: { type: Date, default: null },
      sentAt: { type: Date, default: null },
      sends: { type: Number, default: 0 },
      lastTo: { type: String, default: "" },
      lastError: { type: String, default: "" },
      messageId: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// one code per paid order, however many times the payment callback fires
memoryCodeSchema.index({ orderId: 1 }, { unique: true, partialFilterExpression: { orderId: { $type: "string" } } });
memoryCodeSchema.index({ source: 1, ownerEmail: 1 });

export default mongoose.models.MemoryCode || mongoose.model("MemoryCode", memoryCodeSchema);
