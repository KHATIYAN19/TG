import mongoose from "mongoose";

const { Schema } = mongoose;

/* One gateway payment for one page credit. Gateway-neutral; kept separate from the ebook Order model. */
const memoryOrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 }, // paise
    currency: { type: String, default: "INR" },
    /* which payment gateway handled this order (razorpay, cashfree, payu, ...) */
    gateway: { type: String, required: true, index: true },
    /* the gateway's own id for this order / transaction */
    gatewayOrderId: { type: String, required: true },
    gatewayPaymentId: { type: String, default: null },
    failureReason: { type: String, default: null },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created", index: true },
    paidAt: { type: Date, default: null },
    /* the site the buyer started from, so the return trip from the gateway lands on the same site (and the same login) */
    returnOrigin: { type: String, default: "", maxlength: 120 },
  },
  { timestamps: true }
);

memoryOrderSchema.index({ gateway: 1, gatewayOrderId: 1 }, { unique: true });

export default mongoose.models.MemoryOrder || mongoose.model("MemoryOrder", memoryOrderSchema);
