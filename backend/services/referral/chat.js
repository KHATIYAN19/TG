import mongoose from "mongoose";

import ReferralRequest from "../../models/referral/ReferralRequest.js";
import ReferralMessage from "../../models/referral/ReferralMessage.js";
import { ResumeError } from "../resume/service.js";
import { REACTIONS, MAX_TEXT, cleanText, messageView, fanOut } from "./core.js";
import { emitToUser } from "./hub.js";

/* Everything a message can do, shared by the WebSocket and the REST fallback. Every call re-checks the chat from MongoDB. */
/* a member can edit or delete their own message for 5 minutes only; after that it stays as sent (an admin can still remove it) */
export const EDIT_MS = 5 * 60 * 1000;
const same = (a, b) => String(a) === String(b);

/* the request, only if this person is in it and the chat is open */
export const openRequestFor = async (requestId, userId, { needOpen = true } = {}) => {
  if (!mongoose.isValidObjectId(requestId)) throw new ResumeError(400, "Invalid chat.", "INVALID_ID");
  const r = await ReferralRequest.findOne({ _id: requestId, $or: [{ seeker: userId }, { referrer: userId }] });
  if (!r) throw new ResumeError(404, "Chat not found.", "NOT_FOUND");
  if (needOpen) {
    if (r.status === "ended") throw new ResumeError(409, "This chat has ended.", "CHAT_ENDED");
    if (r.status !== "accepted") throw new ResumeError(409, "This chat isn't open.", "CHAT_CLOSED");
    // Only the SENDER needs to unlock. The referrer who accepted can write straight away.
    if (!r.chat?.unlocked && same(r.seeker, userId)) throw new ResumeError(402, "Unlock this chat to start messaging.", "CHAT_LOCKED");
  }
  return r;
};
const both = (r, fn) => fanOut(r, (u) => fn(String(u)));
const other = (r, userId) => (same(r.seeker, userId) ? r.referrer : r.seeker);

export const postMessage = async ({ requestId, userId, text, replyTo }) => {
  const body = cleanText(text);
  if (!body) throw new ResumeError(400, "Write a message first.", "EMPTY");
  if (body.length > MAX_TEXT) throw new ResumeError(400, `Messages are limited to ${MAX_TEXT} characters.`, "TOO_LONG");
  const r = await openRequestFor(requestId, userId);
  let quote = {};
  if (replyTo && mongoose.isValidObjectId(replyTo)) {
    const q = await ReferralMessage.findOne({ _id: replyTo, request: r._id }).lean();
    if (q) quote = { replyTo: q._id, replyText: q.deletedAt ? "Message deleted" : q.system ? q.text.slice(0, 160) : q.text.slice(0, 160), replySender: q.sender };
  }
  const at = new Date();
  const side = same(r.seeker, userId) ? "referrer" : "seeker";
  // saving the message and updating the chat list's "last message" don't depend on each other
  const [m] = await Promise.all([
    ReferralMessage.create({ request: r._id, sender: userId, text: body, createdAt: at, ...quote }),
    ReferralRequest.updateOne({ _id: r._id }, { $set: { "last.text": body.slice(0, 160), "last.at": at, "last.sender": userId }, $inc: { [`unread.${side}`]: 1 } }),
  ]);
  both(r, (u) => ({ type: "message", requestId: String(r._id), message: messageView(m, u) }));
  return messageView(m, userId);
};

const ownMessage = async (r, id, userId) => {
  if (!mongoose.isValidObjectId(id)) throw new ResumeError(400, "Invalid message.", "INVALID_ID");
  const m = await ReferralMessage.findOne({ _id: id, request: r._id });
  if (!m || m.system) throw new ResumeError(404, "Message not found.", "NOT_FOUND");
  if (!same(m.sender, userId)) throw new ResumeError(403, "You can only change your own messages.", "FORBIDDEN");
  if (m.deletedAt) throw new ResumeError(409, "That message was deleted.", "DELETED");
  return m;
};
const updated = (r, m) => both(r, (u) => ({ type: "message_updated", requestId: String(r._id), message: messageView(m, u) }));

export const editMessage = async ({ requestId, userId, id, text }) => {
  const body = cleanText(text);
  if (!body) throw new ResumeError(400, "A message can't be empty.", "EMPTY");
  if (body.length > MAX_TEXT) throw new ResumeError(400, `Messages are limited to ${MAX_TEXT} characters.`, "TOO_LONG");
  const r = await openRequestFor(requestId, userId);
  const m = await ownMessage(r, id, userId);
  if (Date.now() - new Date(m.createdAt).getTime() > EDIT_MS) throw new ResumeError(409, "Messages can be edited for 5 minutes only.", "EDIT_WINDOW");
  m.text = body; m.editedAt = new Date();
  await m.save();
  updated(r, m);
  return messageView(m, userId);
};

export const deleteMessage = async ({ requestId, userId, id }) => {
  const r = await openRequestFor(requestId, userId, { needOpen: false });
  const m = await ownMessage(r, id, userId);
  if (Date.now() - new Date(m.createdAt).getTime() > EDIT_MS) throw new ResumeError(409, "Messages can be deleted for 5 minutes only.", "DELETE_WINDOW");
  m.deletedAt = new Date(); m.text = ""; m.reactions = [];
  await m.save();
  updated(r, m);
  return messageView(m, userId);
};

export const reactMessage = async ({ requestId, userId, id, emoji }) => {
  if (!REACTIONS.includes(emoji)) throw new ResumeError(400, "That reaction isn't available.", "BAD_REACTION");
  const r = await openRequestFor(requestId, userId);
  const m = await ReferralMessage.findOne({ _id: id, request: r._id });
  if (!m || m.system || m.deletedAt) throw new ResumeError(404, "Message not found.", "NOT_FOUND");
  const had = m.reactions.find((x) => same(x.user, userId));
  m.reactions = m.reactions.filter((x) => !same(x.user, userId));
  if (!had || had.emoji !== emoji) m.reactions.push({ user: userId, emoji }); // same emoji again = remove
  await m.save();
  updated(r, m);
  return messageView(m, userId);
};

export const markRead = async ({ requestId, userId }) => {
  const r = await openRequestFor(requestId, userId, { needOpen: false });
  const side = same(r.seeker, userId) ? "seeker" : "referrer";
  if (side === "seeker" && !r.chat?.unlocked) return { cleared: 0 }; // can't have read what is still locked: keep the waiting count
  const hit = await ReferralRequest.updateOne({ _id: r._id, [`unread.${side}`]: { $gt: 0 } }, { $set: { [`unread.${side}`]: 0 } });
  if (hit.modifiedCount) emitToUser(other(r, userId), { type: "read", requestId: String(r._id) });
  return { cleared: hit.modifiedCount ? 1 : 0 }; // the app only re-counts its badges when something really was unread
};

export const typing = async ({ requestId, userId }) => {
  const r = await openRequestFor(requestId, userId).catch(() => null);
  if (r && (r.chat?.unlocked || !same(other(r, userId), r.seeker))) emitToUser(other(r, userId), { type: "typing", requestId: String(r._id) });
};

export const history = async ({ requestId, userId, admin = false, before, limit = 60 }) => {
  const r = admin ? await ReferralRequest.findById(requestId) : await openRequestFor(requestId, userId, { needOpen: false });
  if (!r) throw new ResumeError(404, "Chat not found.", "NOT_FOUND");
  // NO CREDIT, NO CONTENT: until the sender unlocks, their API gets only a count: no text, ids or times.
  if (!admin && same(r.seeker, userId) && !r.chat?.unlocked) return { items: [], more: false, locked: true, waiting: r.unread?.seeker || 0 };
  const q = { request: r._id };
  if (before && mongoose.isValidObjectId(before)) q._id = { $lt: before };
  const rows = await ReferralMessage.find(q).sort({ _id: -1 }).limit(Math.min(100, Math.max(1, limit)) + 1).lean();
  const more = rows.length > limit;
  const items = rows.slice(0, limit).reverse();
  return { items: items.map((m) => (admin ? { ...messageView(m, null), sender: m.sender ? (same(m.sender, r.seeker) ? "seeker" : "referrer") : "system", text: m.deletedAt ? "" : m.text, deletedText: m.deletedAt ? "(deleted)" : "" } : messageView(m, userId))), more };
};
