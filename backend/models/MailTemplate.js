import mongoose from "mongoose";

const { Schema } = mongoose;

// Admin-created email templates (built-in ones live in code, see
// services/campaign/builtinTemplates.js).
const mailTemplateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", trim: true, maxlength: 300 },
    category: { type: String, default: "custom", trim: true },
    subject: { type: String, default: "", trim: true, maxlength: 300 },
    html: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.MailTemplate ||
  mongoose.model("MailTemplate", mailTemplateSchema);
