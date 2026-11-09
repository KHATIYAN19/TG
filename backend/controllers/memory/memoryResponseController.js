import asyncHandler from "express-async-handler";
import { z } from "zod";

import MemoryPage from "../../models/memory/MemoryPage.js";
import MemoryEvent from "../../models/memory/MemoryEvent.js";
import {
  ANSWER_TEMPLATES, EVENT_TYPES, MAX_EVENTS_PER_PAGE, MAX_REPLIES, MemoryError, answerOut, cleanEventData, cleanVisitor, parse, repliesOut, sendError, verifyPageToken,
} from "../../services/memory/memoryService.js";
import { loadVisible, tokenOf } from "./memoryPublicController.js";

/*
  What the RECEIVER sends back from the page: what they did (events), their answer, their replies.
  Anyone with the link (and the PIN, for a private page) can do this, so everything is validated and size-limited here.
*/
const handler = (fn) =>
  asyncHandler(async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      return sendError(res, err);
    }
  });

const ok = (res, data, status = 200) => { res.set("Cache-Control", "no-store"); res.status(status).json({ success: true, data }); };

/* the same door as viewing: a closed page is closed, and a private page needs its PIN token */
const access = async (req) => {
  const page = await loadVisible(req.params.slug);
  if (page.visibility === "private" && !verifyPageToken(tokenOf(req), page)) {
    throw new MemoryError(401, "Enter the PIN to open this page.", "PIN_REQUIRED", { pinRequired: true });
  }
  return page;
};

const addEvent = (page, type, data, visitor) => MemoryEvent.create({ page: page._id, type, data: cleanEventData(data), visitor });

/* POST /api/memories/view/:slug/events  { visitor, events: [{ type, data? }] } */
export const recordEvents = handler(async (req, res) => {
  const b = parse(z.object({ visitor: z.string().max(60).optional(), events: z.array(z.object({ type: z.string().max(30), data: z.any().optional() })).min(1).max(40) }), req.body);
  const page = await access(req);
  const visitor = cleanVisitor(b.visitor);
  const clean = b.events.filter((e) => EVENT_TYPES.has(e.type));

  if (clean.some((e) => e.type === "open")) {
    const now = new Date();
    await MemoryPage.updateOne({ _id: page._id }, { $inc: { "activity.opens": clean.filter((e) => e.type === "open").length }, $set: { "activity.lastOpenedAt": now }, $min: { "activity.firstOpenedAt": now } });
  }
  // a hard cap per page, so a script can't fill the database
  const have = await MemoryEvent.countDocuments({ page: page._id });
  const room = Math.max(0, MAX_EVENTS_PER_PAGE - have);
  const docs = clean.slice(0, room).map((e) => ({ page: page._id, type: e.type, data: cleanEventData(e.data), visitor, at: new Date() }));
  if (docs.length) await MemoryEvent.insertMany(docs, { ordered: false });
  ok(res, { recorded: docs.length });
});

/*
  POST /api/memories/view/:slug/answer  { answer: "yes" | "no" | "later", visitor? }
  "yes" and "no" are FINAL. Once one is stored it is never changed: asking again just returns what was already given.
  "later" ("I need a little time") is not final, so it can still become yes or no.
*/
export const giveAnswer = handler(async (req, res) => {
  const b = parse(z.object({ answer: z.enum(["yes", "no", "later"]), visitor: z.string().max(60).optional() }), req.body);
  const page = await access(req);
  if (!ANSWER_TEMPLATES.includes(page.occasion?.theme)) throw new MemoryError(400, "This page doesn't ask a question.", "NOT_APPLICABLE");
  const visitor = cleanVisitor(b.visitor);

  if (page.answer?.final) return ok(res, { answer: answerOut(page), locked: true });
  if (page.answer?.value === "later" && b.answer === "later") return ok(res, { answer: answerOut(page), locked: false });

  const now = new Date();
  // one atomic step: it only applies while no final answer exists, so two taps (or two devices) can't overwrite each other
  const updated = await MemoryPage.findOneAndUpdate(
    { _id: page._id, "answer.final": { $ne: true } },
    {
      $set: { "answer.value": b.answer, "answer.final": b.answer !== "later", "answer.at": now },
      $min: { "answer.firstAt": now },
      $push: { "answer.history": { $each: [{ value: b.answer, at: now }], $slice: -20 } },
    },
    { new: true }
  );
  if (!updated) {
    const fresh = await MemoryPage.findById(page._id);
    return ok(res, { answer: answerOut(fresh), locked: true });
  }
  await addEvent(page, "answer", { value: b.answer }, visitor).catch(() => {});
  ok(res, { answer: answerOut(updated), locked: updated.answer.final });
});

/* POST /api/memories/view/:slug/reply  { text, visitor? }: a message from the receiver to the sender */
export const sendReply = handler(async (req, res) => {
  const b = parse(z.object({ text: z.string().trim().min(1).max(500), visitor: z.string().max(60).optional() }), req.body);
  const page = await access(req);
  const visitor = cleanVisitor(b.visitor);
  if ((page.replies || []).length >= MAX_REPLIES) throw new MemoryError(409, "This page has reached its limit of replies.", "REPLY_LIMIT");
  const last = (page.replies || []).at(-1);
  if (last && Date.now() - new Date(last.at).getTime() < 3000) throw new MemoryError(429, "Please wait a moment before sending another reply.", "TOO_FAST");

  const updated = await MemoryPage.findOneAndUpdate(
    { _id: page._id, $expr: { $lt: [{ $size: "$replies" }, MAX_REPLIES] } },
    { $push: { replies: { text: b.text, at: new Date(), visitor } } },
    { new: true }
  );
  if (!updated) throw new MemoryError(409, "This page has reached its limit of replies.", "REPLY_LIMIT");
  await addEvent(page, "reply", { text: b.text.slice(0, 120) }, visitor).catch(() => {});
  ok(res, { replies: repliesOut(updated) }, 201);
});
