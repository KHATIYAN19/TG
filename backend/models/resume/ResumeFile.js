import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  The Resume Vault: the resume PDFs a member keeps on file, so a new review starts with the last one already picked.
  A file that is removed is only hidden (hiddenAt): its S3 object is deleted only when no review or builder draft still points at it.
  One file per person is the default (the one a new review starts with).
*/
const resumeFileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    key: { type: String, required: true, maxlength: 1024 },
    filename: { type: String, default: "resume.pdf", trim: true, maxlength: 120 },
    label: { type: String, default: "", trim: true, maxlength: 60 }, // the person's own name for it, e.g. "Backend version"
    size: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
    uses: { type: Number, default: 0 }, // reviews sent with it
    lastUsedAt: { type: Date, default: null },
    hiddenAt: { type: Date, default: null },
  },
  { timestamps: true }
);

resumeFileSchema.index({ user: 1, key: 1 }, { unique: true });
resumeFileSchema.index({ user: 1, hiddenAt: 1, isDefault: -1, updatedAt: -1 });

export default mongoose.models.ResumeFile || mongoose.model("ResumeFile", resumeFileSchema);
