import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  Who (an admin) did what to whom, and when. Written for sensitive admin
  actions: reading a private chat, deleting records, exporting payments,
  changing a member's matches, suspending, dissolving.
*/
export const AUDIT_ACTIONS = [
  "chat_viewed",
  "report_deleted",
  "bug_deleted",
  "payments_exported",
  "matches_adjusted",
  "profile_suspended",
  "profile_unsuspended",
  "match_dissolved",
  "repair_run",
  "settings_updated",
  "profile_hidden",
  "profile_unhidden",
  "payment_deleted",
  "member_deleted",
  "request_deleted",
  "match_deleted",
  "chat_cleared",
  "message_deleted",
];

const auditSchema = new Schema(
  {
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: { type: String, enum: AUDIT_ACTIONS, required: true, index: true },
    targetType: { type: String, default: "" },
    targetId: { type: String, default: "" },
    summary: { type: String, maxlength: 400, default: "" },
    meta: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditSchema.index({ createdAt: -1 });

export default mongoose.models.ArenaAuditLog || mongoose.model("ArenaAuditLog", auditSchema);

/** Never let logging break the action being logged. */
export const audit = async (admin, action, { targetType = "", targetId = "", summary = "", meta = null } = {}) => {
  try {
    await mongoose.models.ArenaAuditLog.create({ admin, action, targetType, targetId: String(targetId || ""), summary, meta });
  } catch (error) {
    console.error("[arena:audit] failed to record", action, error.message);
  }
};
