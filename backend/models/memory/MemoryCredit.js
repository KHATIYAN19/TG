import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  One credit = the right to create ONE memory page.
  It is separate from Prep Arena / membership credits on purpose.
  `page` stays null until the credit is spent.
*/
const memoryCreditSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    source: { type: String, enum: ["code", "payment", "admin", "free", "gumroad"], required: true },
    ref: { type: String, default: null }, // code string, order id, or admin user id
    page: { type: Schema.Types.ObjectId, ref: "MemoryPage", default: null },
    /*
      What this credit can create, in paise: it works for any theme that costs this much or LESS.
      null = any theme at any price (codes, Gumroad and admin grants).
    */
    maxPricePaise: { type: Number, default: null, min: 0 },
    /* what the buyer picked when paying (information only) */
    occasion: { type: Schema.Types.ObjectId, ref: "MemoryOccasion", default: null },
    theme: { type: String, default: "" },
    /* add-ons bought together with the page: extra room the page starts with ({ photos, videos, photoMb, videoMb, videoSec, audioMb, audioSec, chars, days }) */
    extra: { type: Schema.Types.Mixed, default: null },
    /* upgrade orders already applied to this pass (makes applying one safe to repeat) */
    upgradeOrders: { type: [Schema.Types.ObjectId], default: [], select: false },
  },
  { timestamps: true }
);

memoryCreditSchema.index({ user: 1, page: 1, createdAt: 1 });
/* a paid order can only ever produce one credit (idempotent verify / reconcile) */
memoryCreditSchema.index(
  { source: 1, ref: 1 },
  { unique: true, partialFilterExpression: { source: "payment" } }
);

export default mongoose.models.MemoryCredit || mongoose.model("MemoryCredit", memoryCreditSchema);
