import mongoose from "mongoose";

// One row per minute: how many sessions were live.
// Powers the "concurrent users" history graph.
const activeUserSnapshotSchema = new mongoose.Schema(
  {
    minute: {
      type: Date,
      required: true,
      unique: true,
    },

    activeSessions: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: false }
);

activeUserSnapshotSchema.index(
  { minute: 1 },
  { expireAfterSeconds: 120 * 24 * 60 * 60 }
);

export default mongoose.model(
  "ActiveUserSnapshot",
  activeUserSnapshotSchema
);
