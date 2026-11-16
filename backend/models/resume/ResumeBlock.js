import mongoose from "mongoose";

const { Schema } = mongoose;

/* A member an admin has stopped from using Resume Lab (buying, submitting). Their account elsewhere is untouched. */
const resumeBlockSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    reason: { type: String, default: "", maxlength: 300 },
    blockedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.ResumeBlock || mongoose.model("ResumeBlock", resumeBlockSchema);
