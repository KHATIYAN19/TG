import mongoose from "mongoose";

import BookOffer from "../models/BookOffer.js";
import Book from "../models/Book.js";
import Order from "../models/Order.js";
import { getEbookMailSettings, setAutoEbookEmailEnabled } from "../utils/ebookEmailDelivery.js";
import {
  listLiveOffersWithBooks,
  resolveOfferSelection,
  offerErrorResponse,
  eligibleCountsFor,
  countEligibleBooks,
  clearOfferCache,
} from "../services/bundleOffers.js";
import { OFFER_TYPES } from "../services/bundleRules.js";

const asyncRoute = (fn) => (req, res) =>
  Promise.resolve(fn(req, res)).catch((error) => {
    console.error("[BOOK OFFER]", error);
    res.status(500).json({ success: false, message: "Something went wrong." });
  });

const slugify = (v) =>
  String(v || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const list = (v) =>
  (Array.isArray(v) ? v : String(v || "").split(","))
    .map((x) => String(x).trim())
    .filter(Boolean);

const ids = (v) => [...new Set(list(v).filter((id) => mongoose.Types.ObjectId.isValid(id)))];

const num = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const date = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const adminId = (req) => req.user?.userId?.toString() || "admin";

/* ---------------- body -> clean document (or an error message) ---------------- */

export const buildOffer = (body) => {
  const name = String(body.name || "").trim();
  if (!name) return { error: "Offer name is required." };

  const type = body.type;
  if (!OFFER_TYPES.includes(type)) return { error: "Choose how the discount works." };

  const selectionMode = body.selectionMode === "ALL" ? "ALL" : "PICK";
  const all = selectionMode === "ALL";

  const doc = {
    name,
    slug: slugify(body.slug || name),
    description: String(body.description || "").trim().slice(0, 300),
    badge: String(body.badge || "").trim().slice(0, 30),
    type,
    selectionMode,
    isActive: body.isActive !== false && body.isActive !== "false",
    startsAt: date(body.startsAt),
    endsAt: date(body.endsAt),
    position: Math.max(1, Math.floor(num(body.position, 999999))),
    maxUses: Math.max(0, Math.floor(num(body.maxUses, 0))),
    fixedPrice: 0,
    discountPercent: 0,
    maxDiscountAmount: 0,
    amountOff: 0,
    perBookPrice: 0,
    freeBooks: 0,
    tiers: [],
  };

  if (!doc.slug) return { error: "Slug is required." };

  if (doc.startsAt && doc.endsAt && doc.endsAt < doc.startsAt) {
    return { error: "End date must be after the start date." };
  }

  /* ---- how many books ---- */
  let minBooks = Math.floor(num(body.minBooks, 0));
  let maxBooks = Math.floor(num(body.maxBooks, 50));

  switch (type) {
    case "FIXED_PRICE":
      doc.fixedPrice = num(body.fixedPrice, 0);
      if (!(doc.fixedPrice > 0)) return { error: "Flat price must be greater than 0." };
      break;

    case "PERCENT_OFF":
      doc.discountPercent = num(body.discountPercent, 0);
      if (!(doc.discountPercent >= 1 && doc.discountPercent <= 95)) {
        return { error: "Discount must be between 1% and 95%." };
      }
      doc.maxDiscountAmount = Math.max(0, num(body.maxDiscountAmount, 0));
      break;

    case "AMOUNT_OFF":
      doc.amountOff = num(body.amountOff, 0);
      if (!(doc.amountOff > 0)) return { error: "Amount off must be greater than 0." };
      break;

    case "PER_BOOK_PRICE":
      doc.perBookPrice = num(body.perBookPrice, 0);
      if (!(doc.perBookPrice > 0)) return { error: "Price per book must be greater than 0." };
      break;

    case "FREE_BOOKS": {
      const buy = Math.floor(num(body.buyBooks, 0));
      const free = Math.floor(num(body.freeBooks, 0));
      if (buy < 1) return { error: "Books to buy must be at least 1." };
      if (free < 1) return { error: "Free books must be at least 1." };
      doc.freeBooks = free;
      minBooks = buy + free;
      break;
    }

    case "TIERED_PERCENT": {
      const tiers = (Array.isArray(body.tiers) ? body.tiers : [])
        .map((t) => ({ minBooks: Math.floor(num(t.minBooks, 0)), percent: num(t.percent, 0) }))
        .filter((t) => t.minBooks >= 2 && t.percent >= 1)
        .sort((a, b) => a.minBooks - b.minBooks);

      if (!tiers.length) return { error: "Add at least one discount tier." };
      if (tiers.some((t) => t.percent > 95 || t.minBooks > 50)) {
        return { error: "Tiers need 2 to 50 books and 1% to 95% off." };
      }
      for (let i = 1; i < tiers.length; i += 1) {
        if (tiers[i].minBooks === tiers[i - 1].minBooks) return { error: "Two tiers have the same number of books." };
        if (tiers[i].percent <= tiers[i - 1].percent) return { error: "Each tier must give a bigger discount than the one before." };
      }

      doc.tiers = tiers;
      doc.maxDiscountAmount = Math.max(0, num(body.maxDiscountAmount, 0));
      minBooks = tiers[0].minBooks;
      break;
    }

    default:
      break;
  }

  if (!(minBooks >= 2 && minBooks <= 50)) return { error: "The offer needs between 2 and 50 books." };

  if (all) {
    maxBooks = 50;
  } else if (type === "FIXED_PRICE" || type === "FREE_BOOKS") {
    maxBooks = minBooks;
  } else {
    const lastTier = doc.tiers.at(-1)?.minBooks || minBooks;
    if (maxBooks < Math.max(minBooks, lastTier) || maxBooks > 50) {
      return { error: `Maximum books must be between ${Math.max(minBooks, lastTier)} and 50.` };
    }
  }

  doc.minBooks = minBooks;
  doc.maxBooks = maxBooks;

  /* ---- which books ---- */
  const sc = body.scope || {};
  const mode = sc.mode && sc.mode !== "ALL" ? "CUSTOM" : "ALL";

  const scope = {
    mode,
    tags: [],
    tagMatch: sc.tagMatch === "ALL" ? "ALL" : "ANY",
    categories: [],
    bookIds: [],
    excludeBookIds: ids(sc.excludeBookIds),
    minBookPrice: Math.max(0, num(sc.minBookPrice, 0)),
    maxBookPrice: Math.max(0, num(sc.maxBookPrice, 0)),
  };

  if (scope.maxBookPrice > 0 && scope.minBookPrice > scope.maxBookPrice) {
    return { error: "Minimum book price cannot be higher than the maximum." };
  }

  if (mode === "CUSTOM") {
    scope.tags = list(sc.tags);
    scope.categories = list(sc.categories);
    scope.bookIds = ids(sc.bookIds);

    if (!scope.tags.length && !scope.categories.length && !scope.bookIds.length) {
      return { error: "Choose at least one tag, category or book, or use all books." };
    }
  }

  doc.scope = scope;

  return { doc };
};

const notEnoughBooks = (doc, eligible) =>
  eligible < doc.minBooks
    ? `Only ${eligible} book${eligible === 1 ? "" : "s"} match this offer's books, but it needs at least ${doc.minBooks}. ` +
      "Widen the books, tag more books, or lower the number of books."
    : null;

/* ---------------- public ---------------- */

export const getPublicOffers = asyncRoute(async (_req, res) => {
  const data = await listLiveOffersWithBooks();
  res.status(200).json({ success: true, count: data.length, data });
});

export const quoteOffer = asyncRoute(async (req, res) => {
  try {
    const { offerId, bookIds, expectedAmount } = req.body || {};
    const { offer, books, pricing } = await resolveOfferSelection({ offerId, bookIds, expectedAmount });

    res.status(200).json({
      success: true,
      data: {
        offerId: String(offer._id),
        name: offer.name,
        title: `${offer.name} (${books.length} books)`,
        bookIds: books.map((b) => String(b._id)),
        ...pricing,
        currency: "INR",
      },
    });
  } catch (error) {
    if (error.statusCode) return offerErrorResponse(res, error);
    throw error;
  }
});

/* ---------------- admin ---------------- */

export const adminListOffers = asyncRoute(async (_req, res) => {
  const offers = await BookOffer.find().sort({ position: 1, createdAt: -1 }).lean();
  const counts = await eligibleCountsFor(offers);

  const data = offers.map((o, i) => ({ ...o, eligibleCount: counts[i] }));

  res.status(200).json({ success: true, count: data.length, data });
});

/* every book an admin can put in an offer, plus tag / category lists for the picker */
export const adminOfferCatalog = asyncRoute(async (_req, res) => {
  const books = await Book.find({ resourceType: { $ne: "bundle" } })
    .select("title slug coverPageUrl price mrp category tags resourceType membership isPublished isActive position createdAt")
    .sort({ position: 1, createdAt: -1 })
    .lean();

  const usable = books.filter((b) => !(b.membership?.plan && b.membership.plan !== "none"));

  const tally = (pick) => {
    const map = new Map();
    for (const b of usable) {
      for (const raw of pick(b)) {
        const key = String(raw || "").trim();
        if (!key) continue;
        const k = key.toLowerCase();
        const prev = map.get(k);
        map.set(k, { name: prev?.name || key, count: (prev?.count || 0) + 1 });
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  };

  res.status(200).json({
    success: true,
    data: {
      books: usable.map((b) => ({
        _id: b._id,
        title: b.title,
        slug: b.slug,
        coverPageUrl: b.coverPageUrl || "",
        price: b.price,
        mrp: b.mrp || b.price,
        category: b.category || "",
        tags: b.tags || [],
        resourceType: b.resourceType,
        isPublished: b.isPublished === true,
        isActive: b.isActive !== false,
        membership: b.membership,
      })),
      tags: tally((b) => b.tags || []),
      categories: tally((b) => [b.category]),
    },
  });
});

export const adminCreateOffer = asyncRoute(async (req, res) => {
  const { doc, error } = buildOffer(req.body || {});
  if (error) return res.status(400).json({ success: false, message: error });

  if (doc.isActive) {
    const short = notEnoughBooks(doc, await countEligibleBooks(doc));
    if (short) return res.status(400).json({ success: false, message: short });
  }

  if (await BookOffer.exists({ slug: doc.slug })) {
    return res.status(409).json({ success: false, message: "An offer with this slug already exists." });
  }

  const created = await BookOffer.create({ ...doc, createdBy: adminId(req) });
  clearOfferCache();

  res.status(201).json({ success: true, data: created });
});

export const adminUpdateOffer = asyncRoute(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid offer id." });
  }

  const { doc, error } = buildOffer(req.body || {});
  if (error) return res.status(400).json({ success: false, message: error });

  if (doc.isActive) {
    const short = notEnoughBooks(doc, await countEligibleBooks(doc));
    if (short) return res.status(400).json({ success: false, message: short });
  }

  if (await BookOffer.exists({ slug: doc.slug, _id: { $ne: id } })) {
    return res.status(409).json({ success: false, message: "An offer with this slug already exists." });
  }

  // $set replaces the whole rule (fields of other types are reset by buildOffer)
  const updated = await BookOffer.findByIdAndUpdate(
    id,
    { $set: { ...doc, updatedBy: adminId(req) } },
    { new: true }
  );

  if (!updated) return res.status(404).json({ success: false, message: "Offer not found." });

  clearOfferCache();

  res.status(200).json({ success: true, data: updated });
});

/* quick on / off without re-sending the whole form */
export const adminToggleOffer = asyncRoute(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id) || typeof req.body?.isActive !== "boolean") {
    return res.status(400).json({ success: false, message: "Invalid request." });
  }

  const offer = await BookOffer.findById(id).lean();
  if (!offer) return res.status(404).json({ success: false, message: "Offer not found." });

  if (req.body.isActive) {
    const short = notEnoughBooks(offer, await countEligibleBooks(offer));
    if (short) return res.status(400).json({ success: false, message: short });
  }

  const updated = await BookOffer.findByIdAndUpdate(
    id,
    { $set: { isActive: req.body.isActive, updatedBy: adminId(req) } },
    { new: true }
  );

  clearOfferCache();

  res.status(200).json({ success: true, data: updated });
});

export const adminDeleteOffer = asyncRoute(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid offer id." });
  }

  const deleted = await BookOffer.findByIdAndDelete(id);

  if (!deleted) return res.status(404).json({ success: false, message: "Offer not found." });

  clearOfferCache();

  res.status(200).json({ success: true, message: "Offer deleted." });
});

/* ---------------- admin: orders placed through offers ---------------- */

const escapeRegex = (v) => String(v).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const adminOfferPayments = asyncRoute(async (req, res) => {
  const page = Math.max(1, Math.floor(num(req.query.page, 1)));
  const limit = Math.min(100, Math.max(1, Math.floor(num(req.query.limit, 20))));

  const filter = { "offer.offerId": { $ne: null } };

  if (req.query.offerId && mongoose.Types.ObjectId.isValid(req.query.offerId)) {
    filter["offer.offerId"] = new mongoose.Types.ObjectId(req.query.offerId);
  }

  const status = String(req.query.status || "").toUpperCase();
  if (["PENDING", "PAID", "FAILED", "CANCELLED", "REFUNDED", "PARTIALLY_REFUNDED"].includes(status)) {
    filter.orderStatus = status;
  }

  const q = String(req.query.q || "").trim().slice(0, 80);
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { orderId: rx },
      { "customer.email": rx },
      { "customer.name": rx },
      { "customer.phone": rx },
      { "payment.transactionId": rx },
    ];
  }

  const [orders, total, summaryRows] = await Promise.all([
    Order.find(filter)
      .select(
        "orderId orderStatus createdAt updatedAt customer offer purchasedBookIds book " +
          "payment.provider payment.amount payment.status payment.method payment.paidAt payment.failedAt " +
          "payment.transactionId payment.paymentId payment.sessionId payment.affiliateCode " +
          "payment.affiliateType payment.affiliateValue payment.affiliateAmount payment.remainingAmount " +
          "access.expiresAt access.generatedAt access.accessCount access.lastAccessedAt access.revoked " +
          "ebookEmail.status ebookEmail.trigger ebookEmail.attempts ebookEmail.sentAt ebookEmail.sentBy " +
          "ebookEmail.sentTo ebookEmail.lastError ebookEmail.mailsSent ebookEmail.lastAttemptAt " +
          "pendingMail.sentCount pendingMail.lastSentAt pendingMail.lastStatus " +
          "verification.amountVerified verification.verifiedAt " +
          "refund.status refund.refundedAmount refund.requestedAmount refund.reason refund.completedAt " +
          "metadata.ipAddress metadata.referrer metadata.utmSource metadata.utmMedium metadata.utmCampaign " +
          "metadata.attribution.platform metadata.attribution.landingPath"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
    Order.aggregate([
      { $match: { "offer.offerId": filter["offer.offerId"] } },
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ["$orderStatus", "PAID"] }, "$payment.amount", 0] } },
        },
      },
    ]),
  ]);

  const ids = [...new Set(orders.flatMap((o) => (o.purchasedBookIds || []).map(String)))];
  const bookDocs = ids.length
    ? await Book.find({ _id: { $in: ids } })
        .select("title slug coverPageUrl price mrp redirectUrl resourceType")
        .lean()
    : [];
  const bookOf = new Map(bookDocs.map((b) => [String(b._id), b]));

  const data = orders.map((o) => {
    const books = (o.purchasedBookIds || [])
      .map((id) => bookOf.get(String(id)))
      .filter(Boolean)
      .map((b) => ({
        _id: b._id,
        title: b.title,
        slug: b.slug,
        coverPageUrl: b.coverPageUrl || "",
        price: b.price,
        mrp: b.mrp || b.price,
        redirectUrl: b.redirectUrl || "",
      }));

    return { ...o, books, bookTitles: books.map((b) => b.title) };
  });

  const summary = { orders: 0, paid: 0, pending: 0, revenue: 0 };
  for (const row of summaryRows) {
    summary.orders += row.count;
    if (row._id === "PAID") {
      summary.paid = row.count;
      summary.revenue = row.revenue;
    }
    if (row._id === "PENDING") summary.pending = row.count;
  }

  res.status(200).json({
    success: true,
    data,
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    summary,
  });
});

/* ---------------- admin: automatic PDF mail switch ---------------- */

export const adminGetMailSettings = asyncRoute(async (_req, res) => {
  res.status(200).json({ success: true, data: await getEbookMailSettings() });
});

export const adminSetMailSettings = asyncRoute(async (req, res) => {
  if (typeof req.body?.autoEbookEmail !== "boolean") {
    return res.status(400).json({ success: false, message: "autoEbookEmail must be true or false." });
  }

  await setAutoEbookEmailEnabled(req.body.autoEbookEmail, req.user?.userId?.toString() || "admin");

  res.status(200).json({ success: true, data: await getEbookMailSettings() });
});
