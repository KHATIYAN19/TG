import mongoose from "mongoose";

const { Schema } = mongoose;

const blockSchema = new Schema(
  {
    blocker: { type: Schema.Types.ObjectId, ref: "User", required: true },
    blocked: { type: Schema.Types.ObjectId, ref: "User", required: true },
    blockerProfile: { type: Schema.Types.ObjectId, ref: "ArenaProfile", required: true },
    blockedProfile: { type: Schema.Types.ObjectId, ref: "ArenaProfile", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

blockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });
blockSchema.index({ blocked: 1 });

export default mongoose.models.ArenaBlock ||
  mongoose.model("ArenaBlock", blockSchema);
