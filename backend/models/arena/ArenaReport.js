import mongoose from "mongoose";

const { Schema } = mongoose;

export const REPORT_REASONS = [
  "harassment",
  "spam",
  "fake_profile",
  "inappropriate_content",
  "asked_for_money",
  "other",
];

const reportSchema = new Schema(
  {
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reported: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reportedProfile: { type: Schema.Types.ObjectId, ref: "ArenaProfile", required: true },
    reason: { type: String, enum: REPORT_REASONS, required: true },
    details: { type: String, trim: true, maxlength: 1000, default: "" },

    status: { type: String, enum: ["open", "actioned", "dismissed"], default: "open", index: true },
    resolution: { type: String, trim: true, maxlength: 500, default: "" },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

reportSchema.index({ reporter: 1, reported: 1, status: 1 });

export default mongoose.models.ArenaReport ||
  mongoose.model("ArenaReport", reportSchema);
