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