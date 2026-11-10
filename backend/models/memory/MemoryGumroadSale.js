import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  A Gumroad order that has been redeemed (licenseKey holds "ORDER-<sale id>"). The unique indexes are what make "one purchase, one redemption" true:
  two people pasting the same key at the same moment can't both insert a row.
*/
const memoryGumroadSaleSchema = new Schema(
  {
    licenseKey: { type: String, required: true, unique: true }, // "ORDER-<sale id>", upper-cased
    saleId: { type: String, required: true, unique: true }, // Gumroad's own id for the purchase
    productId: { type: String, required: true, index: true },
    productName: { type: String, default: "" },
    credits: { type: Number, required: true, min: 1 },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    buyerEmail: { type: String, default: "" }, // the email Gumroad has for the buyer (may differ from the account email)
  },
  { timestamps: true }
);

export default mongoose.models.MemoryGumroadSale || mongoose.model("MemoryGumroadSale", memoryGumroadSaleSchema);
