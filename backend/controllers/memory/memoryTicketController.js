import asyncHandler from "express-async-handler";
import crypto from "crypto";
import { z } from "zod";

import MemoryTicket from "../../models/memory/MemoryTicket.js";
import MemoryPage from "../../models/memory/MemoryPage.js";
import User from "../../models/User.js";
import { MemoryError, assertId, escapeRegex, parse, sendError } from "../../services/memory/memoryService.js";

const handler = (fn) =>
  asyncHandler(async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      return sendError(res, err);
    }
  });
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const uid = (req) => String(req.user?.id || req.user?._id);

const CATEGORIES = ["payment", "page", "login", "refund", "bug", "feature", "other"];
const PRIORITIES = ["low", "normal", "high", "urgent"];
const MAX_MESSAGES = 200;
const MAX_OPEN_PER_USER = 10;

const text = z.string().trim().min(2, "Please write a little more.").max(5000, "That message is too long.");
const newTicketNo = () => `TT-${Date.now().toString(36).toUpperCase().slice(-5)}${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

/* ---------- shapes ---------- */
const msgOut = (m, forAdmin) => ({ id: String(m._id), from: m.from, authorName: m.authorName, text: m.text, at: m.at, ...(forAdmin ? { note: Boolean(m.note) } : {}) });
const visible = (t, forAdmin) => (forAdmin ? t.messages : t.messages.filter((m) => !m.note));

const summary = (t, forAdmin) => {
  const msgs = visible(t, forAdmin);
  const last = msgs[msgs.length - 1];
  return {
    id: String(t._id), ticketNo: t.ticketNo, subject: t.subject, category: t.category, priority: t.priority, status: t.status,
    createdAt: t.createdAt, lastMessageAt: t.lastMessageAt, closedAt: t.closedAt, closedBy: t.closedBy, reopenCount: t.reopenCount || 0,
    messageCount: msgs.length,
    unread: forAdmin ? t.unreadByAdmin : t.unreadByUser,
    preview: last ? last.text.slice(0, 140) : "",
    lastFrom: last?.from || null,
  };
};
const detail = (t, forAdmin) => ({
  ...summary(t, forAdmin),
  pageId: t.page ? String(t.page._id || t.page) : null,
  pageTitle: t.page?.title || null,
  messages: visible(t, forAdmin).map((m) => msgOut(m, forAdmin)),
  ...(forAdmin && t.user?.email !== undefined ? { user: { id: String(t.user._id), name: t.user.name, email: t.user.email, mobile: t.user.mobile || null } } : {}),
});

/* ---------- keyset pagination (newest activity first) ---------- */
const enc = (row) => Buffer.from(JSON.stringify([new Date(row.lastMessageAt).toISOString(), String(row._id)])).toString("base64url");
const after = (cursor) => {
  if (!cursor) return null;
  try {
    const [t, id] = JSON.parse(Buffer.from(String(cursor), "base64url").toString("utf8"));
    const at = new Date(t);
    if (Number.isNaN(at.getTime())) return null;
    assertId(id);
    return { $or: [{ lastMessageAt: { $lt: at } }, { lastMessageAt: at, _id: { $lt: id } }] };
  } catch {
    return null;
  }
};
const listPage = async (filter, req, forAdmin, populate) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const cur = after(req.query.cursor);
  let q = MemoryTicket.find(cur ? { $and: [filter, cur] } : filter).sort({ lastMessageAt: -1, _id: -1 }).limit(limit + 1);
  if (populate) q = q.populate("user", "name email");
  const rows = await q;
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const total = req.query.withTotal === "1" ? await MemoryTicket.countDocuments(filter) : undefined;
  return {
    items: items.map((t) => ({ ...summary(t, forAdmin), ...(forAdmin ? { user: t.user ? { id: String(t.user._id), name: t.user.name, email: t.user.email } : null } : {}) })),
    hasMore, nextCursor: hasMore ? enc(items[items.length - 1]) : null, ...(total !== undefined ? { total } : {}),
  };
};

/* =====================================================
   OWNER  /api/memories/tickets
===================================================== */
const mine = async (req) => {
  assertId(req.params.id, "ticket id");
  const t = await MemoryTicket.findOne({ _id: req.params.id, user: uid(req) }).populate("page", "title");
  if (!t) throw new MemoryError(404, "Ticket not found.", "TICKET_NOT_FOUND");
  return t;
};

export const myTickets = handler(async (req, res) => {
  const filter = { user: uid(req) };
  if (req.query.status === "closed") filter.status = "closed";
  else if (req.query.status === "active") filter.status = { $ne: "closed" };
  const data = await listPage(filter, req, false);
  data.unread = await MemoryTicket.countDocuments({ user: uid(req), unreadByUser: true });
  ok(res, data);
});

export const myUnreadCount = handler(async (req, res) => ok(res, { unread: await MemoryTicket.countDocuments({ user: uid(req), unreadByUser: true }) }));

export const createTicket = handler(async (req, res) => {
  const b = parse(
    z.object({
      subject: z.string().trim().min(4, "Add a short subject.").max(120),
      message: text,
      category: z.enum(CATEGORIES).default("other"),
      pageId: z.string().optional().nullable(),
    }),
    req.body
  );
  const active = await MemoryTicket.countDocuments({ user: uid(req), status: { $ne: "closed" } });
  if (active >= MAX_OPEN_PER_USER) throw new MemoryError(429, `You already have ${MAX_OPEN_PER_USER} open tickets. Please wait for a reply or close one first.`, "TOO_MANY_TICKETS");

  let page = null;
  if (b.pageId) {
    assertId(b.pageId, "page id");
    page = await MemoryPage.findOne({ _id: b.pageId, user: uid(req) }).select("_id");
    if (!page) throw new MemoryError(404, "That page was not found on your account.", "PAGE_NOT_FOUND");
  }
  const u = await User.findById(uid(req)).select("name");
  const t = await MemoryTicket.create({
    ticketNo: newTicketNo(), user: uid(req), subject: b.subject, category: b.category, page: page?._id || null,
    priority: b.category === "payment" || b.category === "refund" ? "high" : "normal",
    messages: [{ from: "user", authorName: u?.name || "", text: b.message }],
  });
  ok(res, summary(t, false), 201);
});

export const getMyTicket = handler(async (req, res) => {
  const t = await mine(req);
  if (t.unreadByUser) { t.unreadByUser = false; await t.save(); }
  ok(res, detail(t, false));
});

export const replyMine = handler(async (req, res) => {
  const { message } = parse(z.object({ message: text }), req.body);
  const t = await mine(req);
  if (t.status === "closed") throw new MemoryError(409, "This ticket is closed. Reopen it to reply.", "TICKET_CLOSED");
  if (t.messages.length >= MAX_MESSAGES) throw new MemoryError(409, "This conversation is full. Please open a new ticket.", "TICKET_FULL");
  const u = await User.findById(uid(req)).select("name");
  t.messages.push({ from: "user", authorName: u?.name || "", text: message });
  t.status = "open";
  t.unreadByAdmin = true;
  t.unreadByUser = false;
  t.lastMessageAt = new Date();
  await t.save();
  ok(res, detail(t, false));
});

export const closeMine = handler(async (req, res) => {
  const t = await mine(req);
  if (t.status !== "closed") { t.status = "closed"; t.closedAt = new Date(); t.closedBy = "user"; t.unreadByUser = false; t.lastMessageAt = new Date(); await t.save(); }
  ok(res, detail(t, false));
});

/* Users cannot reopen or delete tickets: only an admin can (see the admin section). A closed ticket stays as their history. */

/* =====================================================
   ADMIN  /api/admin/memories/tickets
===================================================== */
const adminTicket = async (req) => {
  assertId(req.params.id, "ticket id");
  const t = await MemoryTicket.findById(req.params.id).populate("user", "name email mobile").populate("page", "title");
  if (!t) throw new MemoryError(404, "Ticket not found.", "TICKET_NOT_FOUND");
  return t;
};

export const adminList = handler(async (req, res) => {
  const filter = {};
  if (["open", "answered", "closed"].includes(req.query.status)) filter.status = req.query.status;
  else if (req.query.status === "active") filter.status = { $ne: "closed" };
  if (PRIORITIES.includes(req.query.priority)) filter.priority = req.query.priority;
  if (CATEGORIES.includes(req.query.category)) filter.category = req.query.category;
  if (req.query.unread === "1") filter.unreadByAdmin = true;
  const q = String(req.query.q || "").trim().slice(0, 80);
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    const users = await User.find({ $or: [{ name: rx }, { email: rx }] }).select("_id").limit(200).lean();
    filter.$or = [{ ticketNo: rx }, { subject: rx }, { user: { $in: users.map((u) => u._id) } }];
  }
  ok(res, await listPage(filter, req, true, true));
});

export const adminStats = handler(async (req, res) => {
  const [counts, unread] = await Promise.all([
    MemoryTicket.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    MemoryTicket.countDocuments({ unreadByAdmin: true, status: { $ne: "closed" } }),
  ]);
  const by = Object.fromEntries(counts.map((c) => [c._id, c.n]));
  ok(res, { open: by.open || 0, answered: by.answered || 0, closed: by.closed || 0, total: (by.open || 0) + (by.answered || 0) + (by.closed || 0), unread });
});

export const adminGet = handler(async (req, res) => {
  const t = await adminTicket(req);
  if (t.unreadByAdmin) { t.unreadByAdmin = false; await t.save(); }
  ok(res, detail(t, true));
});

export const adminReply = handler(async (req, res) => {
  const b = parse(z.object({ message: text, note: z.boolean().optional(), close: z.boolean().optional() }), req.body);
  const t = await adminTicket(req);
  if (t.messages.length >= MAX_MESSAGES) throw new MemoryError(409, "This conversation is full (200 messages).", "TICKET_FULL");
  const admin = await User.findById(uid(req)).select("name");
  t.messages.push({ from: "admin", authorName: admin?.name || "Support", text: b.message, note: Boolean(b.note) });
  t.lastMessageAt = new Date();
  if (!b.note) {
    t.unreadByUser = true;
    if (b.close) { t.status = "closed"; t.closedAt = new Date(); t.closedBy = "admin"; }
    else { t.status = "answered"; t.closedAt = null; t.closedBy = null; }
  }
  t.unreadByAdmin = false;
  await t.save();
  ok(res, detail(t, true));
});

export const adminSetStatus = handler(async (req, res) => {
  const { status } = parse(z.object({ status: z.enum(["open", "answered", "closed"]) }), req.body);
  const t = await adminTicket(req);
  if (t.status !== status) {
    if (status === "closed") { t.closedAt = new Date(); t.closedBy = "admin"; t.unreadByUser = true; }
    else { t.closedAt = null; t.closedBy = null; if (t.status === "closed") t.reopenCount += 1; }
    t.status = status;
    await t.save();
  }
  ok(res, detail(t, true));
});

export const adminSetMeta = handler(async (req, res) => {
  const b = parse(z.object({ priority: z.enum(PRIORITIES).optional(), category: z.enum(CATEGORIES).optional() }), req.body);
  const t = await adminTicket(req);
  if (b.priority) t.priority = b.priority;
  if (b.category) t.category = b.category;
  await t.save();
  ok(res, detail(t, true));
});

export const adminMarkUnread = handler(async (req, res) => {
  const t = await adminTicket(req);
  t.unreadByAdmin = Boolean(req.body?.unread ?? true);
  await t.save();
  ok(res, detail(t, true));
});

export const adminDelete = handler(async (req, res) => {
  assertId(req.params.id, "ticket id");
  const r = await MemoryTicket.deleteOne({ _id: req.params.id });
  if (!r.deletedCount) throw new MemoryError(404, "Ticket not found.", "TICKET_NOT_FOUND");
  ok(res, { deleted: 1 });
});

/** Bulk: delete by ids, or every closed ticket (optionally older than N days). */
export const adminBulk = handler(async (req, res) => {
  const b = parse(
    z.object({
      action: z.enum(["delete", "close", "reopen"]),
      ids: z.array(z.string()).max(200).optional(),
      closedOlderThanDays: z.number().int().min(0).max(3650).optional(),
    }),
    req.body
  );
  let filter;
  if (b.ids?.length) { b.ids.forEach((i) => assertId(i, "ticket id")); filter = { _id: { $in: b.ids } }; }
  else if (b.action === "delete" && b.closedOlderThanDays !== undefined) filter = { status: "closed", closedAt: { $lt: new Date(Date.now() - b.closedOlderThanDays * 86400000) } };
  else throw new MemoryError(400, "Choose tickets first.", "NO_TICKETS");

  if (b.action === "delete") return ok(res, { affected: (await MemoryTicket.deleteMany(filter)).deletedCount });
  const set = b.action === "close"
    ? { status: "closed", closedAt: new Date(), closedBy: "admin", unreadByUser: true }
    : { status: "open", closedAt: null, closedBy: null };
  const r = await MemoryTicket.updateMany({ ...filter, status: b.action === "close" ? { $ne: "closed" } : "closed" }, { $set: set });
  ok(res, { affected: r.modifiedCount });
});
