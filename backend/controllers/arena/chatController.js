import { handle } from "../../services/arena/errors.js";
import { editMessage, deleteMessage, reactToMessage } from "../../services/arena/chat.js";
import { editMessageSchema, reactionSchema, objectId } from "./schemas.js";

/* Member chat actions: edit / delete (5-minute window) and emoji reactions. */

export const edit = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const { text } = editMessageSchema.parse(req.body);
  const message = await editMessage({ userId: req.user.id, messageId: req.params.id, text });
  res.json({ success: true, data: message });
}, "Unable to edit the message");

export const remove = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const message = await deleteMessage({ userId: req.user.id, messageId: req.params.id });
  res.json({ success: true, data: message });
}, "Unable to delete the message");

export const react = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const { emoji } = reactionSchema.parse(req.body);
  const message = await reactToMessage({ userId: req.user.id, messageId: req.params.id, emoji });
  res.json({ success: true, data: message });
}, "Unable to react");
