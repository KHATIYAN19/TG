
import mongoose from "mongoose";

const { Schema } = mongoose;

const userActivitySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    sessionId: {
      type: String,
      default: null,
    },

    action: {
      type: String,
      required: true,
      maxlength: 80,
    },

    result: {
      type: String,
      enum: ["success", "failure"],
      default: "success",
    },

    ipAddress: String,
    userAgent: String,

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    versionKey: false,
  }
);

userActivitySchema.index({
  user: 1,
  createdAt: -1,
});

userActivitySchema.index({
  action: 1,
  createdAt: -1,
});

export default mongoose.models.UserActivity ||
  mongoose.model("UserActivity", userActivitySchema);
