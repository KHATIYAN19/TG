import mongoose from "mongoose";
import { z } from "zod";

import Book from "../models/Book.js";
import User from "../models/User.js";
import ArenaProfile from "../models/arena/ArenaProfile.js";
import ArenaEntry from "../models/arena/ArenaEntry.js";
import Membership from "../models/Membership.js";
import BookSuggestion from "../models/BookSuggestion.js";
import BookLaunchNotice from "../models/BookLaunchNotice.js";
import {
  catalogQuery,
  getCatalogBooks,
  getAnnouncementOverview,
  getMemberSummary,
  getPackProducts,
  notifyNewBook,
  PLANS,
} from "../services/membership/membershipService.js";
import { deleteMembership, suspendMembership, unsuspendMembership } from "../services/membership/memberAdmin.js";

const handler = (fn, fallback) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0]?.message || "Invalid request" });
    }
    if (error?.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error(`[membership] ${fallback}:`, error);
    res.status(500).json({ success: false, message: fallback });
  }
};

const httpError = (status, message) => Object.assign(new Error(message), { status });

const sum = (rows, key) => rows.reduce((s, r) => s + (Number(r[key]) || 0), 0);

/* =====================================================
   PUBLIC: GET /api/membership/plans
   Everything the packs section and pack pages need in one call.
   packs: Book rows marked as a pack (main list or not), cheapest first.
===================================================== */
export const getPlans = handler(async (req, res) => {
  const [packs, books] = await Promise.all([getPackProducts(), getCatalogBooks()]);

  res.set("Cache-Control", "no-cache"); // prices / matches are edited in admin; always show the live values
  res.json({
    success: true,
    data: {
      packs,
      books,
      stats: { bookCount: books.length, individualWorth: sum(books, "price") },
    },
  });
}, "Unable to load the packs");

/* =====================================================
   PUBLIC: GET /api/membership/book-matches?redirectUrl=/book/...
   Prep Arena matches a book page gives (does not count a page view).
===================================================== */
export const getBookMatches = handler(async (req, res) => {
  const redirectUrl = String(req.query.redirectUrl || "").trim();
  if (!/^\/[A-Za-z0-9/_-]{1,200}$/.test(redirectUrl)) throw httpError(400, "Invalid page.");

  const book = await Book.findOne({ redirectUrl, isActive: true, isPublished: true }).select("title matches membership.plan").lean();

  res.set("Cache-Control", "no-cache");
  res.json({
    success: true,
    data: { matches: Number(book?.matches) || 0, title: book?.title || "", plan: book?.membership?.plan || "none" },
  });
}, "Unable to load this book");

/* =====================================================
   MEMBER: GET /api/membership/me
===================================================== */
export const getMyMembership = handler(async (req, res) => {
  const user = await User.findById(req.user.id).select("email name").lean();
  const summary = await getMemberSummary(user?.email);

  res.json({
    success: true,
    data: summary || { suspended: false, packMember: false, lifetime: false, packs: [], matches: { granted: 0, waiting: 0 } },
  });
}, "Unable to load your membership");

/* =====================================================
   PACK MEMBER: GET /api/membership/library
   "All currently available books" for the Prep Arena Books tab.
===================================================== */
const requirePackMember = async (userId) => {
  const user = await User.findById(userId).select("email name").lean();
  const email = String(user?.email || "").toLowerCase();
  const suspended = email ? await Membership.exists({ email, status: "suspended" }) : false;
  if (suspended) throw httpError(403, "Your membership is suspended. Please contact support.");
  const membership = email ? await Membership.findOne({ email, plan: { $in: PLANS }, status: { $ne: "suspended" } }).select("_id lifetime").lean() : null;
  if (!membership) {
    throw httpError(403, "This is for members of the All Books or Lifetime pack. Sign in with the email you bought the pack with.");
  }
  return { user, email, membership };
};

export const getLibrary = handler(async (req, res) => {
  const { membership } = await requirePackMember(req.user.id);
  const books = await getCatalogBooks();
  res.json({ success: true, data: { lifetime: Boolean(membership.lifetime), books } });
}, "Unable to load the books");

/* =====================================================
   MEMBER: POST /api/membership/suggestions
   Pass holders can tell us which book to write next.
===================================================== */
const suggestionSchema = z.object({
  title: z.string().trim().min(3, "Tell us the book or topic (at least 3 characters)").max(120),
  topic: z.string().trim().max(60).optional().default(""),
  details: z.string().trim().max(1000).optional().default(""),
});

const MAX_OPEN_SUGGESTIONS = 10;

export const createSuggestion = handler(async (req, res) => {
  const body = suggestionSchema.parse(req.body);

  const { user, email, membership } = await requirePackMember(req.user.id);

  const open = await BookSuggestion.countDocuments({ email, status: { $in: ["new", "planned"] } });
  if (open >= MAX_OPEN_SUGGESTIONS) {
    throw httpError(429, "You already have several suggestions waiting. We read every one; please check back soon.");
  }

  const created = await BookSuggestion.create({
    email,
    name: user.name || "",
    user: user._id,
    membership: membership._id,
    ...body,
  });

  res.status(201).json({ success: true, message: "Thanks! Your suggestion has been sent to our team.", data: { id: created._id } });
}, "Unable to save your suggestion");

export const getMySuggestions = handler(async (req, res) => {
  const user = await User.findById(req.user.id).select("email").lean();
  const rows = await BookSuggestion.find({ email: String(user?.email || "").toLowerCase() })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("title topic status createdAt")
    .lean();

  res.json({ success: true, data: rows });
}, "Unable to load your suggestions");

/* =====================================================
   ADMIN
===================================================== */
export const adminListMembers = handler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 25));
  const filter = {};

  if (PLANS.includes(req.query.plan)) filter.plan = req.query.plan;
  else if (req.query.plan === "none") filter.plan = "none";
  if (["active", "suspended"].includes(req.query.status)) filter.status = req.query.status;
  const q = String(req.query.q || "").trim().toLowerCase();
  if (q) filter.email = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") };

  const [rows, total] = await Promise.all([
    Membership.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select("-notifiedBookIds").lean(),
    Membership.countDocuments(filter),
  ]);

  // Arena side of each member: do they have a profile, what is its status, how many matches are left.
  const users = await User.find({ email: { $in: rows.map((r) => r.email) } }).select("_id email").lean();
  const idByEmail = new Map(users.map((u) => [u.email, u._id]));
  const userIds = users.map((u) => u._id);
  const [profiles, entries] = await Promise.all([
    ArenaProfile.find({ user: { $in: userIds } }).select("user status alias").lean(),
    ArenaEntry.find({ user: { $in: userIds }, status: { $in: ["paid", "in_match", "consumed"] } }).select("user matchesAllowed matchesUsed").lean(),
  ]);
  const profileBy = new Map(profiles.map((p) => [String(p.user), p]));
  const left = new Map();
  for (const e of entries) left.set(String(e.user), (left.get(String(e.user)) || 0) + Math.max(0, e.matchesAllowed - e.matchesUsed));

  res.json({
    success: true,
    data: {
      rows: rows.map((r) => {
        const uid = idByEmail.get(r.email);
        const profile = uid ? profileBy.get(String(uid)) : null;
        return { ...r, arena: { hasAccount: Boolean(uid), profileStatus: profile?.status || null, alias: profile?.alias || null, matchesLeft: uid ? left.get(String(uid)) || 0 : 0 } };
      }),
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    },
  });
}, "Unable to load members");

/* One call for the dashboard cards and charts at the top of the admin page. */
export const adminOverview = handler(async (req, res) => {
  const since = new Date(Date.now() - 29 * 86400000);
  since.setHours(0, 0, 0, 0);

  const [byPlan, statusCounts, matchTotals, daily, suggestionCounts, catalog, notices] = await Promise.all([
    Membership.aggregate([{ $group: { _id: "$plan", members: { $sum: 1 }, revenue: { $sum: "$paidAmount" }, matchesGranted: { $sum: "$matches.granted" } } }]),
    Membership.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    Membership.aggregate([
      { $match: { "matches.granted": { $gt: 0 } } },
      { $group: { _id: { $cond: [{ $ifNull: ["$matches.claimedAt", false] }, "claimed", "waiting"] }, matches: { $sum: "$matches.granted" } } },
    ]),
    Membership.aggregate([
      { $match: { activatedAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$activatedAt", timezone: "Asia/Kolkata" } }, n: { $sum: 1 }, revenue: { $sum: "$paidAmount" } } },
    ]),
    BookSuggestion.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    getCatalogBooks(),
    BookLaunchNotice.find().select("book").lean(),
  ]);

  const sentIds = new Set(notices.map((n) => String(n.book)));
  const dayMap = new Map(daily.map((d) => [d._id, d]));
  const series = [];
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(Date.now() - i * 86400000);
    const key = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d); // YYYY-MM-DD
    series.push({ date: key, members: dayMap.get(key)?.n || 0, revenue: dayMap.get(key)?.revenue || 0 });
  }

  const count = (rows, k) => rows.find((r) => r._id === k)?.n || 0;
  res.json({
    success: true,
    data: {
      members: { total: statusCounts.reduce((n, r) => n + r.n, 0), active: count(statusCounts, "active"), suspended: count(statusCounts, "suspended") },
      revenue: byPlan.reduce((n, r) => n + r.revenue, 0),
      byPlan: byPlan.map((r) => ({ plan: r._id, members: r.members, revenue: r.revenue, matchesGranted: r.matchesGranted })),
      matches: {
        claimed: matchTotals.find((r) => r._id === "claimed")?.matches || 0,
        waiting: matchTotals.find((r) => r._id === "waiting")?.matches || 0,
      },
      series,
      suggestions: { new: count(suggestionCounts, "new"), planned: count(suggestionCounts, "planned"), published: count(suggestionCounts, "published"), declined: count(suggestionCounts, "declined") },
      booksNotYetSent: catalog.filter((b) => !sentIds.has(String(b._id))).length,
    },
  });
}, "Unable to load the overview");

const objectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw httpError(400, "Invalid id");
  return id;
};

const suspendSchema = z.object({ reason: z.string().trim().min(3, "Give a short reason (at least 3 characters)").max(500) });

const arenaErrorToHttp = (error) => {
  if (error?.status && !error.statusCode) return error;
  if (error?.statusCode) return Object.assign(new Error(error.message), { status: error.statusCode });
  return error;
};

export const adminSuspendMember = handler(async (req, res) => {
  const { reason } = suspendSchema.parse(req.body);
  try {
    const row = await suspendMembership({ id: objectId(req.params.id), adminId: req.user.id, reason });
    res.json({ success: true, message: "Membership suspended. Their Prep Arena access is off until you unsuspend.", data: row });
  } catch (e) {
    throw arenaErrorToHttp(e);
  }
}, "Unable to suspend the membership");

export const adminUnsuspendMember = handler(async (req, res) => {
  try {
    const row = await unsuspendMembership({ id: objectId(req.params.id), adminId: req.user.id });
    res.json({ success: true, message: "Membership restored. They can enter Prep Arena again with the matches they had left.", data: row });
  } catch (e) {
    throw arenaErrorToHttp(e);
  }
}, "Unable to unsuspend the membership");

export const adminDeleteMember = handler(async (req, res) => {
  try {
    const gone = await deleteMembership({ id: objectId(req.params.id), adminId: req.user.id });
    res.json({ success: true, message: "Membership deleted.", data: gone });
  } catch (e) {
    throw arenaErrorToHttp(e);
  }
}, "Unable to delete the membership");

export const adminListSuggestions = handler(async (req, res) => {
  const filter = {};
  if (["new", "planned", "published", "declined"].includes(req.query.status)) filter.status = req.query.status;

  const rows = await BookSuggestion.find(filter).sort({ createdAt: -1 }).limit(200).lean();
  res.json({ success: true, data: rows });
}, "Unable to load suggestions");

const updateSuggestionSchema = z.object({
  status: z.enum(["new", "planned", "published", "declined"]).optional(),
  adminNote: z.string().trim().max(300).optional(),
});

export const adminUpdateSuggestion = handler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw httpError(400, "Invalid suggestion id");
  const body = updateSuggestionSchema.parse(req.body);

  const row = await BookSuggestion.findByIdAndUpdate(req.params.id, { $set: body }, { new: true }).lean();
  if (!row) throw httpError(404, "Suggestion not found");
  res.json({ success: true, data: row });
}, "Unable to update the suggestion");

/* Permanently delete one suggestion (it also disappears from the member's list). */
export const adminDeleteSuggestion = handler(async (req, res) => {
  const gone = await BookSuggestion.findByIdAndDelete(objectId(req.params.id)).lean();
  if (!gone) throw httpError(404, "Suggestion not found");
  res.json({ success: true, message: "Suggestion deleted permanently." });
}, "Unable to delete the suggestion");

/* Permanently delete many: chosen ids, every suggestion with a status, or all of them. */
const bulkDeleteSchema = z
  .object({
    ids: z.array(z.string()).max(500).optional(),
    status: z.enum(["new", "planned", "published", "declined"]).optional(),
    all: z.literal(true).optional(),
  })
  .refine((v) => Number(Boolean(v.ids?.length)) + Number(Boolean(v.status)) + Number(Boolean(v.all)) === 1, {
    message: "Choose ids, a status, or all",
  });

export const adminBulkDeleteSuggestions = handler(async (req, res) => {
  const body = bulkDeleteSchema.parse(req.body);
  let filter;
  if (body.ids?.length) filter = { _id: { $in: body.ids.map(objectId) } };
  else if (body.status) filter = { status: body.status };
  else filter = {};

  const result = await BookSuggestion.deleteMany(filter);
  res.json({ success: true, message: `${result.deletedCount} suggestion${result.deletedCount === 1 ? "" : "s"} deleted permanently.`, data: { deleted: result.deletedCount } });
}, "Unable to delete the suggestions");

/* Announcements are manual: nothing is emailed when a book is published. */
export const adminAnnouncements = handler(async (req, res) => {
  res.json({ success: true, data: await getAnnouncementOverview() });
}, "Unable to load announcements");

/* POST /announcements/:bookId/send – email this book to every eligible member who has not been told yet. */
export const adminSendAnnouncement = handler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.bookId)) throw httpError(400, "Invalid book id");

  const book = await Book.findOne({ _id: req.params.bookId, ...catalogQuery() }).select("_id").lean();
  if (!book) throw httpError(404, "Only a published Main Book with a PDF can be announced.");

  const result = await notifyNewBook(book._id);
  if (result.skipped) throw httpError(409, result.skipped === "already being sent" ? "This book is already being sent. Please wait a moment." : result.skipped);

  res.json({ success: true, data: result });
}, "Unable to send the announcement");
