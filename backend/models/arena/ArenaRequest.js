import mongoose from "mongoose";

const { Schema } = mongoose;

export const REQUEST_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "withdrawn",
  "expired",
  "cancelled",
];

const requestSchema = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: "ArenaProfile", required: true, index: true },
    to: { type: Schema.Types.ObjectId, ref: "ArenaProfile", required: true, index: true },
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Anonymous intro. Contact details are rejected at validation time.
    message: { type: String, trim: true, maxlength: 300, default: "" },

    status: { type: String, enum: REQUEST_STATUSES, default: "pending", index: true },
    // Set when the request is accepted, so admins can jump from a request to its chat.
    match: { type: Schema.Types.ObjectId, ref: "ArenaMatch", default: null },
    expiresAt: { type: Date, required: true, index: true },
    respondedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// At most one pending request per ordered pair.
requestSchema.index(
  { from: 1, to: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);
requestSchema.index({ to: 1, status: 1, createdAt: -1 });
requestSchema.index({ from: 1, status: 1, createdAt: -1 });

export default mongoose.models.ArenaRequest ||
  mongoose.model("ArenaRequest", requestSchema);
