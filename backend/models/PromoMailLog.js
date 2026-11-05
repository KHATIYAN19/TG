import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  One row per promotional ("thanks for purchasing X, here is an offer") email an admin
  sent from the Book Payments page. Lets the admin see what was already sent to a
  customer, and stops an accidental double click from sending it twice.
*/
const promoMailLogSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, default: "", trim: true },
    subject: { type: String, default: "" },
    purchasedBook: { type: String, default: "" },
    bookIds: { type: [Schema.Types.ObjectId], default: [] },
    couponCodes: { type: [String], default: [] },
    total: { type: Number, default: 0 },
    // QUEUED = accepted by the email queue (SES sends it in the background); SENT = sent directly.
    status: { type: String, enum: ["QUEUED", "SENT"], default: "QUEUED" },
    messageId: { type: String, default: "" },
    sentBy: { type: String, default: "" },
  },
  { timestamps: true }
);

promoMailLogSchema.index({ email: 1, createdAt: -1 });

export default mongoose.models.PromoMailLog || mongoose.model("PromoMailLog", promoMailLogSchema);
