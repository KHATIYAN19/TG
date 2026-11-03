import mongoose from "mongoose";

const { Schema } = mongoose;

export const MAIL_PROVIDERS = ["mailtrap", "resend", "ses"];

/*
  Singleton document: which email provider the whole backend sends through.
  Changed at runtime by an admin (no redeploy).
*/
const mailSettingsSchema = new Schema(
  {
    key: { type: String, default: "global", unique: true, immutable: true },

    provider: { type: String, enum: MAIL_PROVIDERS, default: "mailtrap" },

    // If the chosen provider fails (limit reached, outage, bad key…),
    // try the other configured providers before giving up.
    fallbackEnabled: { type: Boolean, default: true },

    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },

    history: {
      type: [
        new Schema(
          {
            from: String,
            to: String,
            fallbackEnabled: Boolean,
            by: { type: Schema.Types.ObjectId, ref: "User" },
            byName: String,
            at: { type: Date, default: Date.now },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.MailSettings ||
  mongoose.model("MailSettings", mailSettingsSchema);
