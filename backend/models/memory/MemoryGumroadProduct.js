import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  One Gumroad product the admin sells (for example "1 page" or "5 pages").
  `productId` is Gumroad's id for it (Gumroad: product page > Content > License key section shows it).
  A key bought for this product is worth `credits` page credits.
*/
const memoryGumroadProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    productId: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    credits: { type: Number, required: true, min: 1, max: 1000, default: 1 },
    /* shown to buyers, e.g. "$3". Display only: Gumroad decides what is really charged. */
    priceLabel: { type: String, trim: true, maxlength: 30, default: "" },
    /* the product's public Gumroad link; the Buy button opens it */
    url: { type: String, trim: true, maxlength: 300, default: "" },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.MemoryGumroadProduct || mongoose.model("MemoryGumroadProduct", memoryGumroadProductSchema);
