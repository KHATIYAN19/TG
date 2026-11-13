import mongoose from "mongoose";

const { Schema } = mongoose;

/* One gateway payment for one page credit. Gateway-neutral; kept separate from the ebook Order model. */
const memoryOrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 }, // paise
    currency: { type: String, default: "INR" },
    /* which payment gateway handled this order (razorpay, cashfree, payu, ...) */
    gateway: { type: String, required: true, index: true },
    /* the gateway's own id for this order / transaction */
    gatewayOrderId: { type: String, required: true },
    gatewayPaymentId: { type: String, default: null },
    failureReason: { type: String, default: null },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created", index: true },
    /*
      "page"  = pays for one page (a template look, plus any add-ons chosen with it): fulfilled by minting a credit.
      "addon" = pays for add-ons on a page that already exists: fulfilled by adding the room to that page.
      "upgrade" = pays only the DIFFERENCE to move an existing page to a dearer look: fulfilled by raising what that page was bought for.
      A "page" order that has `upgradeCredit` also pays only the difference: it raises a paid page the user has not used yet, instead of making a second one.
    */
    kind: { type: String, enum: ["page", "addon", "upgrade"], default: "page", index: true },
    occasion: { type: Schema.Types.ObjectId, ref: "MemoryOccasion", default: null },
    theme: { type: String, default: "" },
    page: { type: Schema.Types.ObjectId, ref: "MemoryPage", default: null },
    upgradeCredit: { type: Schema.Types.ObjectId, ref: "MemoryCredit", default: null },
    /* the full price of the look being bought, in paise (basePaise is only what is charged after the credit for what was already paid) */
    fullPricePaise: { type: Number, default: 0, min: 0 },
    /* price breakdown at the time of ordering (paise) so a later price change never rewrites history */
    basePaise: { type: Number, default: 0, min: 0 },
    addons: { type: [{ _id: false, key: String, name: String, packs: Number, unit: Number, grant: Number, pricePaise: Number }], default: [] },
    /* set once the order has been turned into its credit / page room. Lets a retry finish a half-done fulfilment. */
    fulfilledAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    /* the site the buyer started from, so the return trip from the gateway lands on the same site (and the same login) */
    returnOrigin: { type: String, default: "", maxlength: 120 },
    /* Meta Ads: ad attribution (utils/attribution.js) and the buyer's request context, kept so the server can report Purchase later (webhook, tab closed) */
    attribution: { type: Schema.Types.Mixed, default: null },
    clientIp: { type: String, default: "" },
    clientUserAgent: { type: String, default: "" },
    eventSourceUrl: { type: String, default: "" },
    metaPurchaseSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

memoryOrderSchema.index({ gateway: 1, gatewayOrderId: 1 }, { unique: true });

export default mongoose.models.MemoryOrder || mongoose.model("MemoryOrder", memoryOrderSchema);
