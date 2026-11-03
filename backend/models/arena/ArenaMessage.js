import mongoose from "mongoose";

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    match: { type: Schema.Types.ObjectId, ref: "ArenaMatch", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ match: 1, createdAt: -1 });

export default mongoose.models.ArenaMessage ||
  mongoose.model("ArenaMessage", messageSchema);
