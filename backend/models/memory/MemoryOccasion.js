import mongoose from "mongoose";

const { Schema } = mongoose;

const memoryOccasionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60, unique: true },
    /* which front-end template/theme renders this occasion (e.g. birthday, proposal, sorry) */
    theme: { type: String, trim: true, lowercase: true, maxlength: 40, default: "default" },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.MemoryOccasion ||
  mongoose.model("MemoryOccasion", memoryOccasionSchema);
