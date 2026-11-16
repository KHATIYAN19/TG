import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  What a person paid for. Payment comes FIRST: once it is paid, the plan lets them send in resumes
  (ResumeRequest) until the uses or the days run out.
*/
const resumePurchaseSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    package: { type: Schema.Types.ObjectId, ref: "ResumePackage", required: true },
    packageSnapshot: {
      key: String,
      name: String,
      pricePaise: Number,
      deliveryHours: Number,
      aiReviews: Number,
      humanReviews: Number,
      linkedinReviews: Number,
      validityDays: Number,
      includes: { resume: Boolean, linkedin: Boolean, jobMatch: Boolean, humanReview: Boolean, rewrittenResume: Boolean },
    },

    /* the plan's allowance, copied at purchase and adjustable by an admin (extend / add reviews) */
    aiAllowed: { type: Number, default: 1, min: 0 }, // 0 = unlimited
    aiUsed: { type: Number, default: 0, min: 0 },
    humanAllowed: { type: Number, default: 0, min: 0 }, // 0 = this plan has no human reviews
    humanUsed: { type: Number, default: 0, min: 0 },
    linkedinAllowed: { type: Number, default: 0, min: 0 }, // 0 = this plan has no LinkedIn reviews
    linkedinUsed: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, default: null }, // set when it is paid; null = never
    revokedAt: { type: Date, default: null }, // an admin switched the plan off
    revokeReason: { type: String, default: "", maxlength: 300 },
    grantedBy: { type: Schema.Types.ObjectId, ref: "User", default: null }, // set when an admin gave the plan for free

    payment: {
      amount: { type: Number, default: 0 }, // paise
      currency: { type: String, default: "INR" },
      gateway: { type: String, default: "" }, // razorpay | cashfree | payu | admin
      gatewayOrderId: { type: String, default: "" },
      gatewayPaymentId: { type: String, default: null },
      attempts: { type: [{ _id: false, gateway: String, gatewayOrderId: String }], default: [] },
      status: { type: String, enum: ["none", "created", "paid", "failed"], default: "none" },
      failureReason: { type: String, default: null },
      paidAt: { type: Date, default: null },
      returnOrigin: { type: String, default: "", maxlength: 120 },
    },
  },
  { timestamps: true }
);

resumePurchaseSchema.index({ "payment.gateway": 1, "payment.gatewayOrderId": 1 });
resumePurchaseSchema.index({ "payment.status": 1, createdAt: -1 });

export default mongoose.models.ResumePurchase || mongoose.model("ResumePurchase", resumePurchaseSchema);
