import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    subtitle: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    resourceType: {
      type: String,
      enum: ["pdf", "ebook", "course", "bundle", "template", "notes", "other"],
      default: "pdf",
    },
    includedBooks: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book"
      }],
      default: []
    },

    // Prep Arena matches the buyer receives (1 match = 1 buddy partnership).
    // 0 = none, and the storefront hides the line. Edit any time: pages read it live,
    // and each purchase keeps the number that was on the book when it was bought.
    matches: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      validate: { validator: Number.isInteger, message: "Matches must be a whole number." },
    },

    // Marks the two "all books" packs (buyers get new-book alerts, can suggest books, and
    // see the pack in the Prep Arena). Prices, contents and matches are edited like any book.
    //   none         normal book / combo
    //   all_current  all books available today
    //   lifetime     all books today + every book published later, emailed free
    membership: {
      plan: {
        type: String,
        enum: ["none", "all_current", "lifetime"],
        default: "none",
        index: true,
      },
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    mrp: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true,
    },

    paymentUrl: {
      type: String,
      required: true,
      trim: true,
    },

    redirectUrl: {
      type: String,
      required: true,
      trim: true,
    },

    pageKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    coverPageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    pdfUrl: {
      type: String,
      default: "",
      trim: true,
    },

    fileName: {
      type: String,
      default: "",
      trim: true,
    },
    showInMainBooks: {
  type: Boolean,
  default: true,
  index: true,
},

    tags: {
      type: [String],
      default: [],
    },

    topics: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    highlights: {
      type: [String],
      default: [],
    },

    badge: {
      type: String,
      default: "",
      trim: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Admin-controlled display order. 1 = first. Lower comes first in every list API.
    // Books that were never positioned keep the default and sort last.
    position: {
      type: Number,
      default: 999999,
      min: 1,
      index: true,
    },

    // When true, the PDF(s) are emailed to the buyer automatically
    // after a verified successful payment. For bundles this setting
    // lives on the bundle itself and attaches every included book.
    sendEbookEmailOnPurchase: {
      type: Boolean,
      default: false,
    },

    stats: {
      views: {
        type: Number,
        default: 0,
      },
      purchases: {
        type: Number,
        default: 0,
      },
      downloads: {
        type: Number,
        default: 0,
      },
    },

    createdBy: {
      type: String,
      required: true,
      trim: true,
    },

    updatedBy: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;