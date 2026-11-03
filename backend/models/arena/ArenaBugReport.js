import mongoose from "mongoose";

const { Schema } = mongoose;

export const BUG_CATEGORIES = ["payment", "signup_login", "profile", "arena_browse", "requests", "chat", "ui_layout", "other"];
export const BUG_SEVERITIES = ["low", "medium", "high"];
export const BUG_STATUSES = ["open", "in_progress", "resolved", "wont_fix"];

const bugSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, enum: BUG_CATEGORIES, required: true },
    severity: { type: String, enum: BUG_SEVERITIES, default: "medium" },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    stepsToReproduce: { type: String, trim: true, maxlength: 1500, default: "" },

    // Context captured automatically to help debugging.
    pageUrl: { type: String, trim: true, maxlength: 300, default: "" },
    userAgent: { type: String, trim: true, maxlength: 300, default: "" },

    status: { type: String, enum: BUG_STATUSES, default: "open", index: true },
    adminNote: { type: String, trim: true, maxlength: 1000, default: "" },
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

bugSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.ArenaBugReport || mongoose.model("ArenaBugReport", bugSchema);
