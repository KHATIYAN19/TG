import mongoose from "mongoose";

const { Schema } = mongoose;

const matchSchema = new Schema(
  {
    profiles: {
      type: [{ type: Schema.Types.ObjectId, ref: "ArenaProfile" }],
      validate: (v) => v.length === 2,
    },
    users: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      validate: (v) => v.length === 2,
    },
    entries: [{ type: Schema.Types.ObjectId, ref: "ArenaEntry" }],

    status: { type: String, enum: ["active", "ended", "dissolved"], default: "active", index: true },
    matchedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    endedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    endReason: {
      type: String,
      enum: ["user_ended", "blocked", "admin_dissolved", "suspended", null],
      default: null,
    },
  },
  { timestamps: true }
);

// Hard guarantee: a user can be in only ONE active match.
matchSchema.index(
  { users: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

export default mongoose.models.ArenaMatch ||
  mongoose.model("ArenaMatch", matchSchema);
