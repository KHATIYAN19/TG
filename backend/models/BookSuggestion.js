import mongoose from "mongoose";

const { Schema } = mongoose;

const suggestionSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    name: { type: String, default: "", trim: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    membership: { type: Schema.Types.ObjectId, ref: "Membership", default: null },

    title: { type: String, required: true, trim: true, maxlength: 120 },
    topic: { type: String, default: "", trim: true, maxlength: 60 },
    details: { type: String, default: "", trim: true, maxlength: 1000 },

    status: { type: String, enum: ["new", "planned", "published", "declined"], default: "new", index: true },
    adminNote: { type: String, default: "", maxlength: 300 },
  },
  { timestamps: true }
);

suggestionSchema.index({ createdAt: -1 });

export default mongoose.models.BookSuggestion || mongoose.model("BookSuggestion", suggestionSchema);
