import mongoose from "mongoose";

import Book from "../models/Book.js";
import BookOffer from "../models/BookOffer.js";
import {
  isBookEligible,
  maxBooksFor,
  priceSelection as computePrice,
  round2,
} from "./bundleRules.js";

/*
  Multi-book offers: loading, validation, and the glue the payment controllers share.
  The pricing/eligibility rules live in bundleRules.js (shared with the browser).
  The server is the only source of truth for what the buyer pays.
*/

export { isBookEligible, maxBooksFor, round2 };

const BOOK_FIELDS =
  "title slug subtitle coverPageUrl price mrp currency redirectUrl " +
  "tags category resourceType membership isPublished isActive position createdAt";

const fail = (statusCode, code, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

export const isOfferLive = (offer, now = new Date()) =>
  Boolean(
    offer?.isActive &&
      (!offer.startsAt || offer.startsAt <= now) &&
      (!offer.endsAt || offer.endsAt >= now) &&
      !(Number(offer.maxUses) > 0 && Number(offer.usedCount) >= Number(offer.maxUses))
  );

/* throwing wrapper around the shared pure pricing function */
export const priceSelection = (offer, books) => {
  const result = computePrice(offer, books);
  if (!result.ok) throw fail(400, result.code, result.message);
  return result;
};

/* ---------- caches (the public list is requested on every visit) ---------- */

let listCache = { at: 0, data: null };
const LIST_TTL_MS = 20 * 1000;

export const clearOfferCache = () => {
  listCache = { at: 0, data: null };
};

/* ---------- books ---------- */

const loadSellableBooks = () =>
  Book.find({ isPublished: true, isActive: true, resourceType: { $ne: "bundle" } })
    .select(BOOK_FIELDS)
    .sort({ position: 1, createdAt: -1 })
    .lean();

/* eligible book count for many offers with ONE query */
export const eligibleCountsFor = async (offers) => {
  const books = await loadSellableBooks();
  return offers.map((offer) => books.filter((b) => isBookEligible(offer, b)).length);
};

export const countEligibleBooks = async (offerLike) => (await eligibleCountsFor([offerLike]))[0];

/* ---------- loading a live offer ---------- */

export const loadLiveOffer = async (offerId) => {
  if (!mongoose.Types.ObjectId.isValid(offerId)) {
    throw fail(400, "OFFER_INVALID", "Invalid offer.");
  }

  const offer = await BookOffer.findById(offerId).lean();

  if (!offer || !isOfferLive(offer)) {
    throw fail(404, "OFFER_NOT_FOUND", "This offer is not available any more.");
  }

  return offer;
};

/* The amount the buyer saw must be what the server computes. */
export const assertExpectedAmount = (expected, actual) => {
  if (expected === undefined || expected === null || expected === "") return;

  if (Math.abs(round2(expected) - round2(actual)) > 0.009) {
    const error = fail(
      409,
      "OFFER_PRICE_MISMATCH",
      `The price changed. The correct offer price is ₹${round2(actual)}. Please review your selection and try again.`
    );
    error.expected = round2(actual);
    throw error;
  }
};

/* ---------- validate a pick and price it (quote + checkout) ---------- */

export const resolveOfferSelection = async ({ offerId, bookIds, expectedAmount }) => {
  const offer = await loadLiveOffer(offerId);

  let ids;
  let books;

  if (offer.selectionMode === "ALL") {
    // "All books" offer: the server decides the books (the buyer cannot add or remove any)
    const all = await loadSellableBooks();
    books = all.filter((b) => isBookEligible(offer, b));
    ids = books.map((b) => String(b._id));
  } else {
    if (!Array.isArray(bookIds) || bookIds.length === 0) {
      throw fail(400, "OFFER_NO_BOOKS", "Select the books you want.");
    }

    if (bookIds.length > 60) {
      throw fail(400, "OFFER_TOO_MANY", "Too many books selected.");
    }

    ids = [...new Set(bookIds.map(String))];

    if (!ids.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      throw fail(400, "OFFER_INVALID_BOOK", "Invalid book in selection.");
    }

    const found = await Book.find({ _id: { $in: ids } }).select(BOOK_FIELDS).lean();
    const map = new Map(found.map((b) => [String(b._id), b]));
    books = ids.map((id) => map.get(id)).filter(Boolean);

    if (books.length !== ids.length) {
      throw fail(400, "OFFER_INVALID_BOOK", "A selected book is not available.");
    }
  }

  const notEligible = books.find((b) => !isBookEligible(offer, b));

  if (notEligible) {
    throw fail(400, "OFFER_BOOK_NOT_ELIGIBLE", `"${notEligible.title}" is not part of this offer.`);
  }

  const pricing = priceSelection(offer, books);

  assertExpectedAmount(expectedAmount, pricing.finalAmount);

  return { offer, books, bookIds: ids, pricing };
};

/* ---------- checkout glue used by PayU / Razorpay / Cashfree ---------- */

/*
  Returns null for a normal single-book checkout.
  For an offer checkout returns what the controller needs:
    pricing        same shape validateCouponForPayment() returns (no coupon)
    purchasedBookIds, offer (Order.offer snapshot), title, primaryBookId
*/
export const resolveOfferCheckout = async (body = {}) => {
  if (!body.offerId) return null;

  const { offer, books, bookIds, pricing } = await resolveOfferSelection({
    offerId: body.offerId,
    bookIds: body.bookIds,
    expectedAmount: body.expectedAmount,
  });

  const primaryBookId = bookIds[0];

  if (String(body.bookId) !== primaryBookId) {
    throw fail(400, "OFFER_INVALID_BOOK", "Invalid offer selection.");
  }

  return {
    primaryBookId,
    title: `${offer.name} (${books.length} books)`.slice(0, 200),
    originalAmount: pricing.originalAmount,
    finalAmount: pricing.finalAmount,
    purchasedBookIds: bookIds,
    pricing: {
      couponApplied: false,
      coupon: null,
      originalAmount: pricing.originalAmount,
      discountAmount: 0,
      finalAmount: pricing.finalAmount,
    },
    offer: {
      offerId: offer._id,
      name: offer.name,
      type: offer.type,
      bookCount: books.length,
      originalAmount: pricing.originalAmount,
      discountAmount: pricing.discountAmount,
      finalAmount: pricing.finalAmount,
    },
  };
};

/*
  Make the (unsaved) Book document describe the offer so the existing
  order / gateway code (title, price, mrp) needs no other change.
*/
export const applyOfferToBook = (book, checkout) => {
  book.title = checkout.title;
  book.price = checkout.finalAmount;
  book.mrp = checkout.originalAmount;
  return book;
};

/* Order fields to spread into Order.create() */
export const offerOrderFields = (checkout) =>
  checkout ? { purchasedBookIds: checkout.purchasedBookIds, offer: checkout.offer } : {};

/* Error -> response for the controllers */
export const offerErrorResponse = (res, error) =>
  res.status(error.statusCode || 400).json({
    success: false,
    code: error.code || "OFFER_INVALID",
    message: error.message || "Invalid offer.",
    ...(error.expected !== undefined ? { expectedAmount: error.expected } : {}),
  });

/* ---------- after a paid transition (call next to the existing counters) ---------- */

export const recordOfferPurchase = async (order) => {
  const offerId = order?.offer?.offerId;

  if (!offerId) return;

  try {
    const others = (order.purchasedBookIds || []).filter(
      (id) => String(id) !== String(order.bookId)
    );

    await Promise.all([
      BookOffer.updateOne({ _id: offerId }, { $inc: { usedCount: 1 } }),
      others.length
        ? Book.updateMany({ _id: { $in: others } }, { $inc: { "stats.purchases": 1 } })
        : null,
    ]);

    clearOfferCache();
  } catch (error) {
    console.error("Unable to record offer purchase:", error.message);
  }
};

/* ---------- public listing ---------- */

const toPublicOffer = (offer, eligible) => ({
  _id: offer._id,
  name: offer.name,
  slug: offer.slug,
  description: offer.description,
  badge: offer.badge,
  type: offer.type,
  selectionMode: offer.selectionMode || "PICK",
  minBooks: offer.minBooks,
  maxBooks: maxBooksFor(offer),
  fixedPrice: offer.fixedPrice,
  discountPercent: offer.discountPercent,
  maxDiscountAmount: offer.maxDiscountAmount,
  amountOff: offer.amountOff,
  perBookPrice: offer.perBookPrice,
  freeBooks: offer.freeBooks,
  tiers: offer.tiers || [],
  endsAt: offer.endsAt,
  spotsLeft:
    Number(offer.maxUses) > 0 ? Math.max(0, Number(offer.maxUses) - Number(offer.usedCount || 0)) : null,
  eligibleCount: eligible.length,
  available:
    eligible.length >= offer.minBooks &&
    (offer.selectionMode !== "ALL" || eligible.length <= 50),
  books: eligible.map((b) => ({
    _id: b._id,
    title: b.title,
    slug: b.slug,
    subtitle: b.subtitle || "",
    coverPageUrl: b.coverPageUrl || "",
    price: b.price,
    mrp: b.mrp || b.price,
    currency: b.currency || "INR",
    redirectUrl: b.redirectUrl,
    tags: b.tags || [],
    category: b.category || "",
  })),
});

export const listLiveOffersWithBooks = async () => {
  if (listCache.data && Date.now() - listCache.at < LIST_TTL_MS) return listCache.data;

  const now = new Date();

  const offers = (
    await BookOffer.find({
      isActive: true,
      $and: [
        { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
      ],
    })
      .sort({ position: 1, createdAt: -1 })
      .lean()
  ).filter((o) => isOfferLive(o, now));

  if (!offers.length) {
    listCache = { at: Date.now(), data: [] };
    return [];
  }

  const books = await loadSellableBooks();

  const data = offers.map((offer) =>
    toPublicOffer(
      offer,
      books.filter((b) => isBookEligible(offer, b))
    )
  );

  listCache = { at: Date.now(), data };
  return data;
};
