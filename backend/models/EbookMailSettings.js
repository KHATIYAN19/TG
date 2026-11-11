import mongoose from "mongoose";

/*
  Singleton: switches for the automatic mails sent after a book payment.
  Changed by an admin on /admin/book-offers/payments (no redeploy).
*/
const schema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true, immutable: true },

    // Automatic "PDFs by email" right after a successful payment. OFF by default.
    autoEbookEmail: { type: Boolean, default: false },

    updatedBy: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.EbookMailSettings ||
  mongoose.model("EbookMailSettings", schema);
