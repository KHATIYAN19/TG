import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  A file in the storage bucket that must go away.
    removed   : the owner (or an admin) deleted it. We delete it from the bucket right away; if that fails it stays here and is retried.
    abandoned : a signed upload was handed out but the file was never attached to a page. It is deleted an hour later unless it was attached.
  The job row is removed only once the bucket confirms the file is gone, so nothing is ever left behind silently.
*/
const memoryStorageJobSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, maxlength: 1024 },
    reason: { type: String, enum: ["removed", "abandoned"], required: true },
    runAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: "", maxlength: 300 },
  },
  { timestamps: true }
);

export default mongoose.models.MemoryStorageJob || mongoose.model("MemoryStorageJob", memoryStorageJobSchema);
