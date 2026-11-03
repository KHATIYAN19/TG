import mongoose from "mongoose";

const { Schema } = mongoose;

/* Reserved at checkout; released if the checkout is abandoned. */
const redemptionSchema = new Schema(
  {
    coupon: { type: Schema.Types.ObjectId, ref: "ArenaCoupon", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    entry: { type: Schema.Types.ObjectId, ref: "ArenaEntry", required: true },
    discountPaise: { type: Number, required: true },
    status: { type: String, enum: ["reserved", "redeemed", "released"], default: "reserved" },
  },
  { timestamps: true }
);

redemptionSchema.index({ coupon: 1, entry: 1 }, { unique: true });
redemptionSchema.index({ coupon: 1, user: 1, status: 1 });

export default mongoose.models.ArenaCouponRedemption ||
  mongoose.model("ArenaCouponRedemption", redemptionSchema);
