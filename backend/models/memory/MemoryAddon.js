import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  The catalog of add-ons a user can buy for a page. The KEYS are fixed in code (services/memory/catalog.js, ADDON_DEFS) because each one
  changes a specific limit; everything else (name, size of one pack, price, on/off, how many packs) is set by the admin.
*/
const memoryAddonSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, immutable: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, trim: true, maxlength: 200, default: "" },
    enabled: { type: Boolean, default: true },
    /* what ONE pack adds, in the add-on's own unit (photos, MB, seconds, characters, days) */
    unit: { type: Number, required: true, min: 0.1, max: 100000 },
    /* price of ONE pack in RUPEES */
    price: { type: Number, required: true, min: 0, max: 100000 },
    /* the most packs one page can have of this add-on */
    maxPacks: { type: Number, default: 5, min: 1, max: 100 },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.MemoryAddon || mongoose.model("MemoryAddon", memoryAddonSchema);
