import mongoose from "mongoose";

/*
  BOOK OFFER (multi-book deal).  See services/bundleRules.js for the exact rules.

  scope         which books qualify (ALL, or CUSTOM = tags / categories / chosen books, minus exclusions)
  selectionMode PICK (buyer chooses min..max books) | ALL (buyer gets every qualifying book)
  type          FIXED_PRICE | PERCENT_OFF | AMOUNT_OFF | PER_BOOK_PRICE | FREE_BOOKS | TIERED_PERCENT
*/

const tierSchema = new mongoose.Schema(
  {
    minBooks: { type: Number, required: true, min: 2, max: 50 },
    percent: { type: Number, required: true, min: 1, max: 95 },
  },
  { _id: false }
);

const bookOfferSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },

    description: { type: String, default: "", trim: true },

    badge: { type: String, default: "", trim: true },

    type: {
      type: String,
      enum: ["FIXED_PRICE", "PERCENT_OFF", "AMOUNT_OFF", "PER_BOOK_PRICE", "FREE_BOOKS", "TIERED_PERCENT"],
      required: true,
    },

    selectionMode: { type: String, enum: ["PICK", "ALL"], default: "PICK" },

    minBooks: { type: Number, required: true, min: 2, max: 50 },
    maxBooks: { type: Number, default: 50, min: 2, max: 50 },

    // FIXED_PRICE
    fixedPrice: { type: Number, default: 0, min: 0 },

    // PERCENT_OFF / TIERED_PERCENT
    discountPercent: { type: Number, default: 0, min: 0, max: 95 },
    maxDiscountAmount: { type: Number, default: 0, min: 0 }, // cap in rupees, 0 = none

    // AMOUNT_OFF
    amountOff: { type: Number, default: 0, min: 0 },

    // PER_BOOK_PRICE
    perBookPrice: { type: Number, default: 0, min: 0 },

    // FREE_BOOKS: the cheapest `freeBooks` of the `minBooks` picked are free
    freeBooks: { type: Number, default: 0, min: 0, max: 49 },

    // TIERED_PERCENT
    tiers: { type: [tierSchema], default: [] },

    scope: {
      mode: {
        type: String,
        enum: ["ALL", "CUSTOM", "TAGS", "CATEGORIES", "BOOKS"],
        default: "ALL",
      },
      tags: { type: [String], default: [] },
      tagMatch: { type: String, enum: ["ANY", "ALL"], default: "ANY" },
      categories: { type: [String], default: [] },
      bookIds: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
        default: [],
      },
      excludeBookIds: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
        default: [],
      },
      minBookPrice: { type: Number, default: 0, min: 0 },
      maxBookPrice: { type: Number, default: 0, min: 0 },
    },

    startsAt: { type: Date, default: null },
    endsAt: { type: Date, default: null },

    // total paid orders allowed for this offer, 0 = unlimited
    maxUses: { type: Number, default: 0, min: 0 },

    isActive: { type: Boolean, default: true, index: true },

    position: { type: Number, default: 999999, index: true },

    usedCount: { type: Number, default: 0, min: 0 },

    createdBy: { type: String, default: "admin", trim: true },
    updatedBy: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

const BookOffer = mongoose.models.BookOffer || mongoose.model("BookOffer", bookOfferSchema);

export default BookOffer;
