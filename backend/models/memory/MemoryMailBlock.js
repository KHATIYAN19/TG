import mongoose from "mongoose";

const { Schema } = mongoose;

/* An address that has asked not to be emailed pages. Nothing is ever sent to it. Added by an admin when someone writes to support. */
const memoryMailBlockSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    note: { type: String, trim: true, maxlength: 300, default: "" },
    addedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.MemoryMailBlock || mongoose.model("MemoryMailBlock", memoryMailBlockSchema);
