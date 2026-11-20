import mongoose from "mongoose";

/*
  Singleton: where NEW book files are stored (Cloudinary or AWS S3), plus the
  progress of the last "transfer all files to the other storage" job.
  Changed by an admin on /admin/book-storage (no redeploy).
*/
const schema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true, immutable: true },

    provider: { type: String, enum: ["cloudinary", "s3"], default: "cloudinary" },

    transfer: {
      status: { type: String, enum: ["idle", "running", "done", "failed"], default: "idle" },
      from: { type: String, default: "" },
      to: { type: String, default: "" },
      total: { type: Number, default: 0 },
      done: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      errors: { type: [String], default: [] },
      startedAt: { type: Date, default: null },
      finishedAt: { type: Date, default: null },
      startedBy: { type: String, default: null },
    },

    updatedBy: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.BookStorageSettings ||
  mongoose.model("BookStorageSettings", schema);
