import mongoose from "mongoose";

const { Schema } = mongoose;

/* A request to be paid cash for referral credits. The rate is copied in when the request is made, so a later change never alters it. */
const memoryPayoutSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    credits: { type: Number, required: true, min: 1 },
    ratePerCredit: { type: Number, required: true, min: 0 }, // rupees
    amount: { type: Number, required: true, min: 0 }, // rupees
    upiId: { type: String, required: true, trim: true, maxlength: 100 },
    status: { type: String, enum: ["requested", "paid", "cancelled"], default: "requested", index: true },
    txnRef: { type: String, default: "", trim: true, maxlength: 100 },
    adminNote: { type: String, default: "", trim: true, maxlength: 500 },
    handledBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    handledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

memoryPayoutSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.MemoryPayout || mongoose.model("MemoryPayout", memoryPayoutSchema);
