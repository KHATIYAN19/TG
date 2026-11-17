import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  Singleton document: which AI model writes the Resume Lab reviews.
  Changed at runtime by an admin (no redeploy). With no document, the reviews use OpenAI and RESUME_AI_MODEL (default gpt-4.1).
*/
const resumeAiSettingsSchema = new Schema(
  {
    key: { type: String, default: "global", unique: true, immutable: true },
    provider: { type: String, enum: ["openai", "gemini", "anthropic"], required: true },
    model: { type: String, required: true, trim: true, maxlength: 100 },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    history: {
      type: [
        new Schema(
          {
            fromProvider: String,
            fromModel: String,
            toProvider: String,
            toModel: String,
            by: { type: Schema.Types.ObjectId, ref: "User" },
            byName: String,
            at: { type: Date, default: Date.now },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.ResumeAiSettings || mongoose.model("ResumeAiSettings", resumeAiSettingsSchema);
