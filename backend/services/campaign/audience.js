import mongoose from "mongoose";

import Book from "../../models/Book.js";
import MailSuppression from "../../models/MailSuppression.js";
import MarketingRecipient from "../../models/MarketingRecipient.js";
import Order from "../../models/Order.js";
import User from "../../models/User.js";

/*
  AUDIENCE BUILDER

  filters = {
    sources:        ["buyers", "users", "manual"]   who to consider (default ["buyers"])

    -- buyers (people with a successful order) --
    includeBooks:   [bookId]       must have bought these ...
    includeMode:    "any" | "all"  ... any one of them, or every one of them
    excludeBooks:   [bookId]       must NOT have bought any of these (the "reverse")
    purchasedFrom / purchasedTo    the qualifying purchase happened in this window
    minOrders, minSpent, maxSpent  order count / total money spent

    -- registered users --
    userScope:      "nonBuyers" | "all"   (default "nonBuyers": signed up, never bought)

    -- manual --
    manualEmails:   [email]        pasted / uploaded list

    -- always applied --
    excludeEmails:      [email]
    excludeCampaignIds: [campaignId]   do not mail people already mailed by these
    (unsubscribed / suppressed addresses are always removed)
  }
*/

export const PAID_STATUSES = ["SUCCESS", "PARTIALLY_REFUNDED"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
export const isValidEmail = (value) => EMAIL_RE.test(value) && value.length <= 254;

/*
  The same mailbox can be written several ways (Gmail ignores dots and "+tags").
  Used to make sure one person never gets the same campaign twice.
*/
export const canonicalEmail = (value) => {
  const email = normalizeEmail(value);
  const at = email.lastIndexOf("@");
  if (at < 1) return email;
  let local = email.slice(0, at);
  let domain = email.slice(at + 1);
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") local = local.split("+")[0].replace(/\./g, "");
  return `${local}@${domain}`;
};

/*
  One row per person, however many books / orders / addresses they have.
  Merges books, orders and spend into the first row seen.
*/
export const dedupeRecipients = (recipients) => {
  const seen = new Map();
  let duplicates = 0;

  for (const r of recipients) {
    const key = canonicalEmail(r.email);
    const first = seen.get(key);
    if (!first) {
      seen.set(key, r);
      continue;
    }
    duplicates += 1;
    first.books = [...new Set([...first.books, ...r.books])];
    first.orders += r.orders || 0;
    first.spent += r.spent || 0;
    if (!first.name && r.name) first.name = r.name;
  }

  return { recipients: [...seen.values()], duplicates };
};

export const parseEmailList = (value) => {
  const list = Array.isArray(value) ? value : String(value || "").split(/[\s,;]+/);
  return [...new Set(list.map(normalizeEmail).filter(Boolean))];
};

const idList = (value) =>
  (Array.isArray(value) ? value : [])
    .map(String)
    .filter((id) => mongoose.Types.ObjectId.isValid(id));

const toDate = (value, endOfDay = false) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(String(value))) date.setUTCHours(23, 59, 59, 999);
  return date;
};

/* ------------------------------------------------------------------ */
/* Data loading                                                        */
/* ------------------------------------------------------------------ */

// One row per buyer e-mail: every book ever bought + the same limited to the date window.
export const loadBuyers = async ({ from = null, to = null } = {}) => {
  const rows = await Order.aggregate([
    {
      $match: {
        "payment.status": { $in: PAID_STATUSES },
        "customer.email": { $type: "string", $ne: "" },
      },
    },
    {
      $project: {
        email: { $toLower: { $trim: { input: "$customer.email" } } },
        name: "$customer.name",
        books: { $setUnion: [["$bookId"], { $ifNull: ["$purchasedBookIds", []] }] },
        amount: { $ifNull: ["$payment.amount", 0] },
        at: { $ifNull: ["$payment.paidAt", "$createdAt"] },
      },
    },
    {
      $set: {
        inWindow: {
          $and: [
            from ? { $gte: ["$at", from] } : true,
            to ? { $lte: ["$at", to] } : true,
          ],
        },
      },
    },
    { $sort: { at: 1 } },
    {
      $group: {
        _id: "$email",
        name: { $last: "$name" },
        orders: { $sum: 1 },
        spent: { $sum: "$amount" },
        lastPurchaseAt: { $max: "$at" },
        allBooks: { $push: "$books" },
        windowBooks: { $push: { $cond: ["$inWindow", "$books", []] } },
        windowOrders: { $sum: { $cond: ["$inWindow", 1, 0] } },
      },
    },
  ]);

  return rows.map((row) => ({
    email: row._id,
    name: row.name || "",
    orders: row.orders,
    spent: row.spent,
    lastPurchaseAt: row.lastPurchaseAt,
    allBooks: new Set(row.allBooks.flat().map(String)),
    windowBooks: new Set(row.windowBooks.flat().map(String)),
    windowOrders: row.windowOrders,
  }));
};

// bundleId -> [included book ids]. A bundle buyer owns the books inside it.
export const loadBundleMap = async () => {
  const bundles = await Book.find({ "includedBooks.0": { $exists: true } })
    .select("_id includedBooks")
    .lean();
  return new Map(bundles.map((b) => [String(b._id), b.includedBooks.map(String)]));
};

export const expandBundles = (set, bundleMap) => {
  for (const id of [...set]) {
    for (const inner of bundleMap.get(id) || []) set.add(inner);
  }
  return set;
};

/*
  Does this person already have the book? `owned` is their book-id set with bundles
  already expanded. A bundle counts as owned when they bought it OR already own every
  book inside it (buying it again would give them nothing new).
*/
export const isBookOwned = (bookId, owned, bundleMap = new Map()) => {
  const id = String(bookId);
  if (owned.has(id)) return true;
  const inner = bundleMap.get(id);
  return Boolean(inner && inner.length && inner.every((b) => owned.has(b)));
};

/* ------------------------------------------------------------------ */
/* Pure filtering (unit-testable)                                      */
/* ------------------------------------------------------------------ */

export const filterBuyers = (buyers, filters = {}, bundleMap = new Map()) => {
  const include = idList(filters.includeBooks);
  const exclude = idList(filters.excludeBooks);
  const windowed = Boolean(toDate(filters.purchasedFrom) || toDate(filters.purchasedTo, true));
  const minOrders = Number(filters.minOrders) || 0;
  const minSpent = Number(filters.minSpent) || 0;
  const maxSpent = Number(filters.maxSpent) || 0;

  return buyers.filter((buyer) => {
    const all = expandBundles(new Set(buyer.allBooks), bundleMap);
    const inWindow = windowed ? expandBundles(new Set(buyer.windowBooks), bundleMap) : all;

    if (windowed && buyer.windowOrders < 1) return false;

    if (include.length) {
      const has = (id) => inWindow.has(id);
      const ok = filters.includeMode === "all" ? include.every(has) : include.some(has);
      if (!ok) return false;
    }

    // "Reverse": anyone who ever bought one of these is out, whatever the window.
    if (exclude.length && exclude.some((id) => all.has(id))) return false;

    if (minOrders && buyer.orders < minOrders) return false;
    if (minSpent && buyer.spent < minSpent) return false;
    if (maxSpent && buyer.spent > maxSpent) return false;

    return true;
  });
};

/* ------------------------------------------------------------------ */
/* Audience resolution                                                 */
/* ------------------------------------------------------------------ */

/*
  Returns { recipients: [{ email, name, books, orders, spent, lastPurchaseAt, source }], stats }
  `books` is the list of book TITLES the person owns (for personalisation).
*/
export const resolveAudience = async (filters = {}) => {
  const sources = new Set(
    (Array.isArray(filters.sources) && filters.sources.length ? filters.sources : ["buyers"]).map(String)
  );

  const stats = { duplicates: 0, buyers: 0, users: 0, manual: 0, suppressed: 0, excluded: 0, invalid: 0, alreadyMailed: 0 };
  const byEmail = new Map();

  const bookDocs = await Book.find({}).select("_id title").lean();
  const titleOf = new Map(bookDocs.map((b) => [String(b._id), b.title]));

  // Every successful buyer is needed anyway: it decides who counts as a "non-buyer".
  const needBuyers = sources.has("buyers") || (sources.has("users") && filters.userScope !== "all");
  const allBuyers = needBuyers
    ? await loadBuyers({
        from: toDate(filters.purchasedFrom),
        to: toDate(filters.purchasedTo, true),
      })
    : [];

  const bundleMap = await loadBundleMap();
  const ownedTitles = (buyer) =>
    [...expandBundles(new Set(buyer.allBooks), bundleMap)].map((id) => titleOf.get(id)).filter(Boolean);

  if (sources.has("buyers")) {
    for (const buyer of filterBuyers(allBuyers, filters, bundleMap)) {
      byEmail.set(buyer.email, {
        email: buyer.email,
        name: buyer.name,
        books: ownedTitles(buyer),
        orders: buyer.orders,
        spent: buyer.spent,
        lastPurchaseAt: buyer.lastPurchaseAt,
        source: "buyer",
      });
      stats.buyers += 1;
    }
  }

  if (sources.has("users")) {
    const buyerEmails = new Set(allBuyers.map((b) => b.email));
    const users = await User.find({
      email: { $type: "string", $ne: "" },
      status: "active",
      role: { $nin: ["admin", "Employee"] },
    })
      .select("name email")
      .lean();

    for (const user of users) {
      const email = normalizeEmail(user.email);
      if (filters.userScope !== "all" && buyerEmails.has(email)) continue;
      if (byEmail.has(email)) continue;
      byEmail.set(email, { email, name: user.name || "", books: [], orders: 0, spent: 0, lastPurchaseAt: null, source: "user" });
      stats.users += 1;
    }
  }

  if (sources.has("manual")) {
    for (const email of parseEmailList(filters.manualEmails)) {
      if (byEmail.has(email)) continue;
      byEmail.set(email, { email, name: "", books: [], orders: 0, spent: 0, lastPurchaseAt: null, source: "manual" });
      stats.manual += 1;
    }
  }

  // ---- one email per person (two books, two orders or two spellings = one mail) ----
  {
    const merged = dedupeRecipients([...byEmail.values()]);
    stats.duplicates = merged.duplicates;
    byEmail.clear();
    for (const r of merged.recipients) byEmail.set(r.email, r);
  }

  // ---- removals ----
  for (const email of [...byEmail.keys()]) {
    if (!isValidEmail(email)) {
      byEmail.delete(email);
      stats.invalid += 1;
    }
  }

  for (const email of parseEmailList(filters.excludeEmails)) {
    if (byEmail.delete(email)) stats.excluded += 1;
  }

  const suppressed = await MailSuppression.find({ email: { $in: [...byEmail.keys()] } })
    .select("email")
    .lean();
  for (const { email } of suppressed) {
    if (byEmail.delete(email)) stats.suppressed += 1;
  }

  const priorCampaigns = idList(filters.excludeCampaignIds);
  if (priorCampaigns.length && byEmail.size) {
    const mailed = await MarketingRecipient.find({
      campaignId: { $in: priorCampaigns },
      email: { $in: [...byEmail.keys()] },
      status: { $in: ["QUEUED", "SENDING", "SENT"] },
    })
      .select("email")
      .lean();
    for (const { email } of mailed) {
      if (byEmail.delete(email)) stats.alreadyMailed += 1;
    }
  }

  return { recipients: [...byEmail.values()], stats };
};

/* ------------------------------------------------------------------ */
/* Admin helpers                                                       */
/* ------------------------------------------------------------------ */

export const previewAudience = async (filters, { sample = 25 } = {}) => {
  const { recipients, stats } = await resolveAudience(filters);

  const perBook = new Map();
  for (const r of recipients) for (const title of r.books) perBook.set(title, (perBook.get(title) || 0) + 1);

  return {
    total: recipients.length,
    stats,
    sample: recipients.slice(0, sample).map((r) => ({
      email: r.email,
      name: r.name,
      books: r.books.slice(0, 4),
      orders: r.orders,
      spent: r.spent,
      source: r.source,
    })),
    booksBreakdown: [...perBook.entries()]
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
  };
};

// Per book: how many distinct customers bought it (bundles count their inner books).
export const bookBuyerCounts = async () => {
  const [buyers, bundleMap] = await Promise.all([loadBuyers(), loadBundleMap()]);
  const counts = new Map();
  for (const buyer of buyers) {
    for (const id of expandBundles(new Set(buyer.allBooks), bundleMap)) {
      counts.set(id, (counts.get(id) || 0) + 1);
    }
  }
  return { counts, totalBuyers: buyers.length };
};

export const toCsv = (recipients) => {
  const cell = (value) => {
    let text = String(value ?? "");
    // Neutralise spreadsheet formulas.
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const header = ["email", "name", "source", "orders", "total_spent", "last_purchase", "books"];
  const lines = recipients.map((r) =>
    [
      r.email,
      r.name,
      r.source,
      r.orders,
      r.spent,
      r.lastPurchaseAt ? new Date(r.lastPurchaseAt).toISOString().slice(0, 10) : "",
      r.books.join(" | "),
    ]
      .map(cell)
      .join(",")
  );
  return [header.join(","), ...lines].join("\n");
};
