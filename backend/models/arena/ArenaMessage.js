import mongoose from "mongoose";

const { Schema } = mongoose;

const reactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    emoji: { type: String, required: true, maxlength: 16 },
  },
  { _id: false }
);

const messageSchema = new Schema(
  {
    match: { type: Schema.Types.ObjectId, ref: "ArenaMatch", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Emptied (not kept) when the sender deletes the message.
    text: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
      validate: {
        validator() {
          return Boolean(this.deletedAt) || Boolean(this.text);
        },
        message: "Message text is required",
      },
    },
    // Set when the sender edits within the edit window.
    editedAt: { type: Date, default: null },
    // Set when the sender deletes within the delete window ("deleted for everyone").
    deletedAt: { type: Date, default: null },
    // At most one emoji per member per message.
    reactions: { type: [reactionSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ match: 1, createdAt: -1 });

export default mongoose.models.ArenaMessage ||
  mongoose.model("ArenaMessage", messageSchema);
