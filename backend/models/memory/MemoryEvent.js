import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  One thing the receiver did on a page: opened it, popped a balloon, opened a gift, flipped a promise, wrote a reply...
  Small and append-only. `data` holds a few short values (see cleanEventData). The owner's activity screen is built from these.
*/
const memoryEventSchema = new Schema(
  {
    page: { type: Schema.Types.ObjectId, ref: "MemoryPage", required: true },
    type: { type: String, required: true, maxlength: 30 },
    data: { type: Schema.Types.Mixed, default: {} },
    /* a random id the visitor's browser made up, so "2 visitors" can be told from "1 visitor, 2 visits". Not an identity. */
    visitor: { type: String, default: "", maxlength: 40 },
    at: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

memoryEventSchema.index({ page: 1, at: -1 });

export default mongoose.models.MemoryEvent || mongoose.model("MemoryEvent", memoryEventSchema);
