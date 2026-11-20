import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  Singleton document: the admin's switch for the Resume Builder (the AI resume writer).
    mode "on"        everyone can see it; anyone with builder credits can use it; plans with builder credits are sold.
    mode "existing"  switched off for NEW members: people who already hold builder credits keep using them, nothing new is sold
                     and nobody else sees the builder.
    mode "off"       switched off completely: hidden everywhere for everyone, builder plans are not sold. Nothing is deleted.
  Starts "off" so the builder never appears before an admin turns it on.
*/
const resumeBuilderSettingsSchema = new Schema(
  {
    key: { type: String, default: "global", unique: true, immutable: true },
    mode: { type: String, enum: ["on", "existing", "off"], default: "off" },
    seededPlans: { type: Boolean, default: false }, // the two starter builder plans were created once (never again, so an admin can delete them)
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    history: {
      type: [new Schema({ from: String, to: String, by: { type: Schema.Types.ObjectId, ref: "User" }, byName: String, at: { type: Date, default: Date.now } }, { _id: false })],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.ResumeBuilderSettings || mongoose.model("ResumeBuilderSettings", resumeBuilderSettingsSchema);
