import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  A plan the admin sells on the resume-review page: one review, a bundle, or a time-boxed pass.
    aiReviews     AI reviews included (0 = unlimited). Every resume sent in uses one.
    humanReviews  reviews by a working professional. Optional on each resume; the admin can switch human review off for a plan.
    validityDays  how long the plan lasts after payment (0 = never expires)
    includes      what each review covers; rewrittenResume means the reviewer delivers a complete rewritten resume (a file),
                  otherwise the reviewer writes comments only.
  Prices are in paise and are copied onto every purchase, so a later change never rewrites history.
*/
const resumePackageSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true, match: /^[a-z0-9-]{2,40}$/ },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    tagline: { type: String, default: "", trim: true, maxlength: 160 },
    description: { type: String, default: "", trim: true, maxlength: 1000 },
    pricePaise: { type: Number, required: true, min: 100, max: 100000000 },
    compareAtPaise: { type: Number, default: 0, min: 0 },
    badge: { type: String, default: "", trim: true, maxlength: 30 },
    aiReviews: { type: Number, default: 1, min: 0, max: 1000000 }, // AI reviews in the plan (0 = unlimited)
    humanReviews: { type: Number, default: 0, min: 0, max: 100000 }, // reviews by a working professional (only count while includes.humanReview is on)
    linkedinReviews: { type: Number, default: 0, min: 0, max: 1000 }, // LinkedIn profile reviews in the plan (0 = none; most plans give 1)
    validityDays: { type: Number, default: 0, min: 0, max: 3650 }, // 0 = never expires
    includes: {
      resume: { type: Boolean, default: true },
      linkedin: { type: Boolean, default: false },
      jobMatch: { type: Boolean, default: false },
      humanReview: { type: Boolean, default: true }, // the admin's switch: off = this plan never offers a human review
      rewrittenResume: { type: Boolean, default: false },
    },
    features: { type: [{ type: String, trim: true, maxlength: 120 }], default: [] },
    deliveryHours: { type: Number, default: 48, min: 1, max: 720 },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.ResumePackage || mongoose.model("ResumePackage", resumePackageSchema);
