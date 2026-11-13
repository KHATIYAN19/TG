import mongoose from "mongoose";

const { Schema } = mongoose;

const memoryOccasionSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60, unique: true },
    /* which front-end template/theme renders this occasion (e.g. birthday, proposal, sorry) */
    theme: { type: String, trim: true, lowercase: true, maxlength: 40, default: "default" },
    isActive: { type: Boolean, default: true },
    /* price of this template in RUPEES. null = use the default price from Settings, 0 = free. A theme can override it (see `themes`). */
    price: { type: Number, default: null, min: 0, max: 1000000 },
    /* per-theme controls. A theme with no entry here is shown and uses the template price. */
    themes: {
      type: [{ _id: false, key: { type: String, trim: true, lowercase: true, maxlength: 30, required: true }, enabled: { type: Boolean, default: true }, price: { type: Number, default: null, min: 0, max: 1000000 } }],
      default: [],
    },
    /* limits for pages made with this template. A field left null uses the global limit from Settings. */
    limits: {
      photos: { type: Number, default: null, min: 0, max: 500 },
      videos: { type: Number, default: null, min: 0, max: 100 },
      photoMb: { type: Number, default: null, min: 0.1, max: 25 },
      videoMb: { type: Number, default: null, min: 0.1, max: 500 },
      videoSec: { type: Number, default: null, min: 1, max: 3600 },
      audioMb: { type: Number, default: null, min: 0.1, max: 25 },
      audioSec: { type: Number, default: null, min: 1, max: 1800 },
      messageChars: { type: Number, default: null, min: 10, max: 10000 },
    },
    description: { type: String, trim: true, maxlength: 200, default: "" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.MemoryOccasion ||
  mongoose.model("MemoryOccasion", memoryOccasionSchema);
