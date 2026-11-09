import mongoose from "mongoose";

const { Schema } = mongoose;

/* A unique code that lets a user create a page without paying. */
const memoryCodeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, minlength: 4, maxlength: 40 },
    maxUses: { type: Number, default: 1, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    redeemedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    note: { type: String, trim: true, maxlength: 200 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.MemoryCode || mongoose.model("MemoryCode", memoryCodeSchema);
