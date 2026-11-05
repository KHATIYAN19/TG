import mongoose from "mongoose";

const { Schema } = mongoose;

// One row per announced book. The unique bookId is the "announce once" lock.
const noticeSchema = new Schema(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true, unique: true },
    title: { type: String, default: "" },
    status: { type: String, enum: ["running", "done", "failed"], default: "running" },
    recipients: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date, default: null },
    lastError: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.BookLaunchNotice || mongoose.model("BookLaunchNotice", noticeSchema);
