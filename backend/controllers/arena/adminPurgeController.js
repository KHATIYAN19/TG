import User from "../../models/User.js";
import ArenaAuditLog, { audit } from "../../models/arena/ArenaAuditLog.js";
import { ArenaError, handle } from "../../services/arena/errors.js";
import { purgeChat, purgeMessage, purgeRequest, purgeMatch, purgeEntry, purgeUser } from "../../services/arena/purge.js";
import { clearLocks } from "../../services/authLocks.js";
import { syncUserAuth } from "../../services/authStateService.js";
import { objectId } from "./schemas.js";

/* Admin: permanent deletes. Each one is written to the activity log. */

export const deletePayment = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const { entry, redemptions, profileReset } = await purgeEntry(req.params.id);

  await audit(req.user.id, "payment_deleted", {
    targetType: "payment",
    targetId: entry._id,
    summary: `Permanently deleted a ${entry.status} payment of ₹${((entry.paidPaise || 0) / 100).toFixed(2)}${entry.complimentary ? " (complimentary)" : ""}`,
    meta: {
      user: String(entry.user),
      status: entry.status,
      paidPaise: entry.paidPaise,
      gateway: entry.payment?.gateway ?? null,
      orderId: entry.payment?.orderId ?? null,
      paymentId: entry.payment?.paymentId ?? null,
      redemptions,
      profileReset,
    },
  });

  res.json({
    success: true,
    message: "Payment permanently deleted. Nothing was refunded.",
    data: { profileReset },
  });
}, "Unable to delete the payment");

export const deleteRequest = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const request = await purgeRequest(req.params.id);

  await audit(req.user.id, "request_deleted", {
    targetType: "request",
    targetId: request._id,
    summary: `Permanently deleted a ${request.status} request`,
    meta: { status: request.status, from: String(request.from), to: String(request.to) },
  });

  res.json({ success: true, message: "Request permanently deleted" });
}, "Unable to delete the request");

export const deleteMatch = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const restore = Array.isArray(req.body?.restoreProfileIds) ? req.body.restoreProfileIds.map(String) : [];
  restore.forEach((id) => objectId.parse(id));

  const { match, messages } = await purgeMatch(req.params.id, { restoreProfileIds: restore });

  await audit(req.user.id, "match_deleted", {
    targetType: "match",
    targetId: match._id,
    summary: `Permanently deleted a match and ${messages} message${messages === 1 ? "" : "s"}`,
    meta: { wasActive: match.status === "active", messages, profiles: match.profiles.map(String) },
  });

  res.json({ success: true, message: "Match and its chat permanently deleted", data: { messages } });
}, "Unable to delete the match");

export const clearChat = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const { messages, match } = await purgeChat(req.params.id);

  await audit(req.user.id, "chat_cleared", {
    targetType: "match",
    targetId: match._id,
    summary: `Permanently deleted the whole chat (${messages} message${messages === 1 ? "" : "s"})`,
    meta: { messages },
  });

  res.json({ success: true, message: `Chat deleted (${messages} message${messages === 1 ? "" : "s"})`, data: { messages } });
}, "Unable to delete the chat");

export const deleteChatMessage = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const message = await purgeMessage(req.params.id);

  await audit(req.user.id, "message_deleted", {
    targetType: "message",
    targetId: message._id,
    summary: "Permanently deleted one chat message",
    meta: { match: String(message.match) },
  });

  res.json({ success: true, message: "Message permanently deleted" });
}, "Unable to delete the message");

export const deleteMember = handle(async (req, res) => {
  objectId.parse(req.params.userId);

  if (String(req.params.userId) === String(req.user.id)) {
    throw new ArenaError(400, "SELF_DELETE", "You can't delete your own account here");
  }

  const target = await User.findById(req.params.userId).select("role").lean();
  if (!target) throw new ArenaError(404, "NOT_FOUND", "User not found");
  if (target.role !== "normal") {
    throw new ArenaError(403, "PROTECTED_ACCOUNT", "Admin, employee and affiliate accounts can't be deleted from the arena portal.");
  }

  const { user, profiles, counts } = await purgeUser(req.params.userId);

  await audit(req.user.id, "member_deleted", {
    targetType: "member",
    targetId: user._id,
    summary: `Permanently deleted ${user.name} (${user.email}) and all arena data`,
    meta: { aliases: profiles.map((p) => p.alias), ...counts },
  });

  res.json({ success: true, message: "Member and all their data permanently deleted", data: counts });
}, "Unable to delete the member");

/*
  Lift the 24-hour locks for a customer who got caught by them (support tool):
  sign-up / password-reset / login-by-network locks for an email and/or an IP,
  and the account's own "5 wrong passwords" lock.
*/
export const clearLocksFor = handle(async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase().slice(0, 120) : "";
  const ip = typeof req.body?.ip === "string" ? req.body.ip.trim().slice(0, 64) : "";

  if (!email && !ip) {
    throw new ArenaError(400, "NOTHING_TO_UNLOCK", "Enter an email address or an IP address.");
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ArenaError(400, "BAD_EMAIL", "Enter a valid email address.");
  }

  const keys = await clearLocks({ email, ip });

  let accountUnlocked = false;
  if (email) {
    const user = await User.findOne({ email }).select("_id").lean();
    if (user) {
      await User.collection.updateOne({ _id: user._id }, { $set: { failedLoginAttempts: 0, lockedUntil: null } });
      await syncUserAuth(user._id).catch(() => {});
      accountUnlocked = true;
    }
  }

  await audit(req.user.id, "locks_cleared", {
    targetType: "lock",
    targetId: email || ip,
    summary: `Lifted locks for ${[email, ip].filter(Boolean).join(" and ")}`,
    meta: { email: email || null, ip: ip || null, keys, accountUnlocked },
  });

  res.json({ success: true, message: "Locks lifted. They can try again now.", data: { keys, accountUnlocked } });
}, "Unable to lift the locks");

/* ----- the admin activity log itself ----- */

export const deleteAuditEntry = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const row = await ArenaAuditLog.findByIdAndDelete(req.params.id).lean();
  if (!row) throw new ArenaError(404, "NOT_FOUND", "Log entry not found");
  console.log(`[arena:audit] entry ${row._id} (${row.action}) deleted by ${req.user.id}`);
  res.json({ success: true, message: "Log entry permanently deleted" });
}, "Unable to delete the log entry");

/* Wipes the whole log. A single entry is written afterwards so the wipe itself is accountable. */
export const clearAudit = handle(async (req, res) => {
  const { deletedCount } = await ArenaAuditLog.deleteMany({});
  await audit(req.user.id, "audit_cleared", { targetType: "audit", summary: `Cleared the activity log (${deletedCount} entr${deletedCount === 1 ? "y" : "ies"})`, meta: { deletedCount } });
  res.json({ success: true, message: `Activity log cleared (${deletedCount} entr${deletedCount === 1 ? "y" : "ies"})`, data: { deletedCount } });
}, "Unable to clear the activity log");
