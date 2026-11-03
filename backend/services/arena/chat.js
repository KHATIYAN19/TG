import mongoose from "mongoose";
import sanitizeHtml from "sanitize-html";

import ArenaMessage from "../../models/arena/ArenaMessage.js";
import ArenaProfile from "../../models/arena/ArenaProfile.js";

import { ArenaError } from "./errors.js";
import { emitToUser } from "./hub.js";
import { findActiveMatchForUser } from "./matchService.js";

/*
  CHAT RULES
  ----------
  - A sender may EDIT or DELETE their own message for 5 minutes after sending.
  - Either member may react to any (non-deleted) message with one emoji from
    a fixed set; picking the same emoji again removes it, a different one
    replaces it.
  - Everything is enforced here, on the server: the UI only mirrors it.
*/

export const EDIT_WINDOW_MS = 5 * 60 * 1000;
export const MAX_TEXT = 1000;

// Fixed set: no free-form strings in a field every member renders.
export const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🎉", "🔥"];

const userObjectId = (id) => new mongoose.Types.ObjectId(String(id));

export const cleanText = (text) =>
  sanitizeHtml(String(text ?? ""), { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+\n/g, "\n")
    .trim();

export const editableUntil = (m) => new Date(new Date(m.createdAt).getTime() + EDIT_WINDOW_MS);

/* Reactions as [{emoji, count, mine}] from one member's point of view. */
export const summariseReactions = (reactions = [], userId) => {
  const byEmoji = new Map();
  for (const r of reactions) {
    const entry = byEmoji.get(r.emoji) ?? { emoji: r.emoji, count: 0, mine: false };
    entry.count += 1;
    if (String(r.user) === String(userId)) entry.mine = true;
    byEmoji.set(r.emoji, entry);
  }
  return [...byEmoji.values()];
};

/* One message as `userId` should see it. */
export const messageView = (m, userId) => {
  const mine = String(m.sender) === String(userId);
  const deleted = Boolean(m.deletedAt);
  return {
    id: String(m._id),
    mine,
    text: deleted ? "" : m.text,
    deleted,
    edited: Boolean(m.editedAt) && !deleted,
    createdAt: m.createdAt,
    editableUntil: mine && !deleted ? editableUntil(m) : null,
    reactions: deleted ? [] : summariseReactions(m.reactions, userId),
  };
};

/* Tell BOTH members about a changed message (each gets their own view). */
const broadcastUpdate = (match, message) => {
  for (const uid of match.users) {
    emitToUser(uid, { type: "message_updated", message: messageView(message, uid) });
  }
};

const loadForMember = async (userId, messageId) => {
  const match = await findActiveMatchForUser(userId);
  if (!match) throw new ArenaError(403, "NO_MATCH", "Your partnership has ended");

  const profiles = await ArenaProfile.find({ _id: { $in: match.profiles } }).select("status").lean();
  if (profiles.some((p) => p.status === "suspended")) {
    throw new ArenaError(403, "SUSPENDED", "Chat is unavailable");
  }

  // Scoping by match means a member can never touch someone else's chat.
  const message = await ArenaMessage.findOne({ _id: messageId, match: match._id });
  if (!message) throw new ArenaError(404, "NOT_FOUND", "Message not found");

  return { match, message };
};

const assertOwnAndInWindow = (message, userId, verb) => {
  if (String(message.sender) !== String(userId)) {
    throw new ArenaError(403, "NOT_YOURS", `You can only ${verb} your own messages`);
  }
  if (message.deletedAt) {
    throw new ArenaError(409, "ALREADY_DELETED", "This message was already deleted");
  }
  if (Date.now() - new Date(message.createdAt).getTime() > EDIT_WINDOW_MS) {
    throw new ArenaError(403, "WINDOW_CLOSED", `You can only ${verb} a message within 5 minutes of sending it`);
  }
};

export const editMessage = async ({ userId, messageId, text }) => {
  const clean = cleanText(text);
  if (!clean) throw new ArenaError(400, "EMPTY", "A message can't be empty");
  if (clean.length > MAX_TEXT) throw new ArenaError(400, "TOO_LONG", `Messages are limited to ${MAX_TEXT} characters`);

  const { match, message } = await loadForMember(userId, messageId);
  assertOwnAndInWindow(message, userId, "edit");

  if (clean !== message.text) {
    message.text = clean;
    message.editedAt = new Date();
    await message.save();
    broadcastUpdate(match, message);
  }
  return messageView(message, userId);
};

export const deleteMessage = async ({ userId, messageId }) => {
  const { match, message } = await loadForMember(userId, messageId);
  assertOwnAndInWindow(message, userId, "delete");

  message.text = "";
  message.deletedAt = new Date();
  message.editedAt = null;
  message.reactions = [];
  await message.save();

  broadcastUpdate(match, message);
  return messageView(message, userId);
};

export const reactToMessage = async ({ userId, messageId, emoji }) => {
  if (emoji !== null && !REACTION_EMOJIS.includes(emoji)) {
    throw new ArenaError(400, "BAD_EMOJI", "That reaction isn't available");
  }

  const { match, message } = await loadForMember(userId, messageId);
  if (message.deletedAt) throw new ArenaError(409, "ALREADY_DELETED", "This message was deleted");

  const current = message.reactions.find((r) => String(r.user) === String(userId))?.emoji ?? null;
  const next = emoji === current ? null : emoji; // same emoji again = remove

  // One atomic pipeline update: drop my old reaction, add the new one.
  const updated = await ArenaMessage.findOneAndUpdate(
    { _id: message._id, deletedAt: null },
    [
      {
        $set: {
          reactions: {
            $concatArrays: [
              { $filter: { input: { $ifNull: ["$reactions", []] }, as: "r", cond: { $ne: ["$$r.user", userObjectId(userId)] } } },
              next ? [{ user: userObjectId(userId), emoji: next }] : [],
            ],
          },
        },
      },
    ],
    { new: true }
  );
  if (!updated) throw new ArenaError(409, "ALREADY_DELETED", "This message was deleted");

  broadcastUpdate(match, updated);
  return messageView(updated, userId);
};
