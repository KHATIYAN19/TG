import Book from "../../models/Book.js";
import Coupon from "../../models/Coupon.js";
import Order from "../../models/Order.js";
import { computeDiscount } from "../../controllers/couponController.js";
import { PAID_STATUSES, expandBundles, isBookOwned, loadBundleMap, normalizeEmail } from "./audience.js";

/*
  BOOK OFFERS FOR CAMPAIGN EMAILS

  An offer is a list of books plus the coupon that applies to each one:

    offer = {
      enabled,
      defaultCouponCode,                       // used by every line set to "default"
      items: [{ bookId, couponMode, couponCode, url }]
        couponMode "default" -> defaultCouponCode
                   "own"     -> this line's couponCode (a different coupon per book)
                   "none"    -> shown at the normal price
    }

  What a coupon is allowed to do is decided by the coupon itself (all books, or only
  some). The checks below follow validateCouponForPayment() in couponController.js, and
  the discount maths is that file's own computeDiscount(), so the price in the email is
  the price the customer is charged at checkout.

  Checkout sells one book per order, so a coupon used on several books is used several
  times: that is what the per-user limit check below is for.
*/

export const MAX_OFFER_BOOKS = 10;

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export const normalizeCode = (value) => String(value || "").trim().toUpperCase();

/* The coupon code that applies to one line ("" = none). */
export const effectiveCode = (offer, item) => {
  if (item.couponMode === "none") return "";
  if (item.couponMode === "own") return normalizeCode(item.couponCode);
  return normalizeCode(offer.defaultCouponCode);
};

/* ------------------------------------------------------------------ */
/* Catalog: the books and coupons an offer refers to                    */
/* ------------------------------------------------------------------ */

export const loadOfferCatalog = async (offer) => {
  const items = offer?.items || [];
  const codes = new Set(items.map((item) => effectiveCode(offer, item)).filter(Boolean));

  const [books, coupons, bundleMap] = await Promise.all([
    items.length
      ? Book.find({ _id: { $in: items.map((i) => i.bookId) } })
          .select("title subtitle price mrp coverPageUrl coverImage redirectUrl isActive isPublished includedBooks")
          .lean()
      : [],
    codes.size ? Coupon.find({ code: { $in: [...codes] } }).lean() : [],
    loadBundleMap(),
  ]);

  return {
    books: new Map(books.map((b) => [String(b._id), b])),
    coupons: new Map(coupons.map((c) => [c.code, c])),
    bundleMap,
  };
};

/* ------------------------------------------------------------------ */
/* One coupon on one book (mirrors validateCouponForPayment)            */
/* ------------------------------------------------------------------ */

export const evaluateCoupon = (coupon, book, now = new Date()) => {
  const fail = (code, message) => ({ ok: false, code, message });

  if (!coupon) return fail("COUPON_NOT_FOUND", "this coupon code does not exist.");
  if (!coupon.isActive) return fail("COUPON_INACTIVE", "this coupon is switched off.");
  if (coupon.validFrom && new Date(coupon.validFrom) > now) return fail("COUPON_NOT_STARTED", "this coupon is not active yet.");
  if (coupon.validTill && new Date(coupon.validTill) < now) return fail("COUPON_EXPIRED", "this coupon has expired.");
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return fail("COUPON_USAGE_LIMIT_REACHED", "this coupon has reached its usage limit.");
  }

  if (!coupon.appliesToAllBooks && !(coupon.applicableBooks || []).some((id) => String(id) === String(book._id))) {
    return fail("COUPON_NOT_APPLICABLE", "this coupon does not apply to this book.");
  }

  const originalAmount = round2(book.price);
  if (coupon.minimumOrderAmount && originalAmount < coupon.minimumOrderAmount) {
    return fail("MINIMUM_ORDER_NOT_MET", `needs a minimum order of ₹${coupon.minimumOrderAmount}.`);
  }

  const { discountAmount, finalAmount } = computeDiscount(coupon, originalAmount);
  // Checkout refuses a free order.
  if (finalAmount <= 0) return fail("ZERO_PAYMENT_AMOUNT", "it would make the book free, which checkout does not support.");

  return { ok: true, originalAmount, discountAmount, finalAmount };
};

/* ------------------------------------------------------------------ */
/* Price an offer                                                       */
/* ------------------------------------------------------------------ */

/*
  owned       Set of book ids the person already has (bundles expanded). Those lines are dropped.
  couponUsage Map couponId -> times this person already used it. When given, a coupon is only
              applied as many times as the coupon's per-user limit still allows.
              Omit for the generic (not personalised) price list.

  Returns { lines, skippedOwned, problems, total, originalTotal, savings, couponCodes, validTill }
*/
export const priceOffer = (offer, catalog, { owned = new Set(), couponUsage = null, now = new Date() } = {}) => {
  const lines = [];
  const problems = [];
  const skippedOwned = [];

  for (const item of offer?.items || []) {
    const book = catalog.books.get(String(item.bookId));
    if (!book) {
      problems.push("A book in this offer no longer exists.");
      continue;
    }
    if (book.isActive === false) {
      problems.push(`"${book.title}" is switched off, so it cannot be sold.`);
      continue;
    }
    if (isBookOwned(book._id, owned, catalog.bundleMap)) {
      skippedOwned.push(book.title);
      continue;
    }

    const price = round2(book.price);
    const line = {
      bookId: String(book._id),
      title: book.title,
      subtitle: book.subtitle || "",
      coverPageUrl: book.coverPageUrl || "",
      coverImage: book.coverImage || "",
      redirectUrl: book.redirectUrl || "",
      url: item.url || "",
      price,
      mrp: Number(book.mrp) || 0,
      intendedCode: effectiveCode(offer, item),
      couponCode: "",
      couponId: null,
      discountAmount: 0,
      finalAmount: price,
      couponNote: "",
    };

    if (line.intendedCode) {
      const coupon = catalog.coupons.get(line.intendedCode);
      const result = evaluateCoupon(coupon, book, now);
      if (!result.ok) {
        problems.push(`${line.intendedCode} on "${book.title}": ${result.message}`);
      } else {
        line.couponCode = line.intendedCode;
        line.couponId = String(coupon._id);
        line.discountAmount = result.discountAmount;
        line.finalAmount = result.finalAmount;
        line.coupon = coupon;
      }
    }
    lines.push(line);
  }

  // Per-person limit: a coupon can only be used perUserLimit times in total.
  if (couponUsage) {
    const byCoupon = new Map();
    for (const line of lines.filter((l) => l.couponId)) {
      byCoupon.set(line.couponId, [...(byCoupon.get(line.couponId) || []), line]);
    }
    for (const [couponId, group] of byCoupon) {
      const limit = group[0].coupon.perUserLimit;
      if (limit == null) continue;
      const left = Math.max(0, limit - (couponUsage.get(couponId) || 0));
      // Keep the coupon on the lines where it saves the most.
      group.sort((a, b) => b.discountAmount - a.discountAmount);
      for (const line of group.slice(left)) {
        line.couponNote = "You have already used this coupon";
        line.couponCode = "";
        line.couponId = null;
        line.discountAmount = 0;
        line.finalAmount = line.price;
      }
    }
  }

  const total = round2(lines.reduce((sum, l) => sum + l.finalAmount, 0));
  const originalTotal = round2(lines.reduce((sum, l) => sum + l.price, 0));
  const used = lines.filter((l) => l.couponId);
  const validTills = used.map((l) => l.coupon.validTill).filter(Boolean).map((d) => new Date(d).getTime());

  for (const line of lines) delete line.coupon;

  return {
    lines,
    skippedOwned,
    problems,
    total,
    originalTotal,
    savings: round2(originalTotal - total),
    couponCodes: [...new Set(used.map((l) => l.couponCode))],
    validTill: validTills.length ? new Date(Math.min(...validTills)) : null,
  };
};

/* ------------------------------------------------------------------ */
/* Check an offer before it is sent (admin screen + launch)             */
/* ------------------------------------------------------------------ */

const discountLabel = (c) =>
  c.discountType === "PERCENTAGE"
    ? `${c.discountValue}% off${c.maxDiscountAmount ? ` (max ₹${c.maxDiscountAmount})` : ""}`
    : `₹${c.discountValue} off`;

/*
  at           when the email will go out (a coupon must still be valid then)
  audienceSize optional, to warn when a coupon has fewer uses left than people
*/
export const validateOffer = (offer, catalog, { at = new Date(), audienceSize = null } = {}) => {
  const errors = [];
  const warnings = [];
  const items = offer?.items || [];

  if (!items.length) errors.push("Add at least one book to the offer.");
  if (items.length > MAX_OFFER_BOOKS) errors.push(`An offer can have at most ${MAX_OFFER_BOOKS} books.`);

  const seen = new Set();
  for (const item of items) {
    const id = String(item.bookId);
    if (seen.has(id)) errors.push(`"${catalog.books.get(id)?.title || "A book"}" is listed twice.`);
    seen.add(id);
    if (item.couponMode === "own" && !normalizeCode(item.couponCode)) {
      errors.push(`Choose a coupon for "${catalog.books.get(id)?.title || "a book"}", or set it to the default / no coupon.`);
    }
  }
  if (items.some((i) => i.couponMode === "default") && !normalizeCode(offer?.defaultCouponCode) && items.length) {
    // not an error: those books are simply shown at their normal price
    if (items.every((i) => i.couponMode === "default")) warnings.push("No coupon is set, so every book is shown at its normal price.");
  }

  const priced = priceOffer(offer, catalog, { now: at });
  errors.push(...priced.problems);

  // The coupons in use, how far they reach and how often they can be used.
  const perCoupon = new Map();
  for (const item of items) {
    const code = effectiveCode(offer, item);
    if (!code) continue;
    perCoupon.set(code, (perCoupon.get(code) || 0) + 1);
  }

  const couponInfo = [];
  for (const [code, lineCount] of perCoupon) {
    const coupon = catalog.coupons.get(code);
    if (!coupon) continue;

    const listedIds = new Set(items.map((i) => String(i.bookId)));
    const reach = coupon.appliesToAllBooks
      ? { scope: "ALL", otherBooks: null }
      : { scope: "SELECTED", otherBooks: (coupon.applicableBooks || []).filter((id) => !listedIds.has(String(id))).length };

    const usageLeft = coupon.usageLimit == null ? null : Math.max(0, coupon.usageLimit - coupon.usedCount);

    couponInfo.push({
      code,
      name: coupon.name,
      discount: discountLabel(coupon),
      validTill: coupon.validTill || null,
      scope: reach.scope,
      otherBooks: reach.otherBooks,
      perUserLimit: coupon.perUserLimit ?? null,
      usageLeft,
      lines: lineCount,
    });

    if (coupon.perUserLimit != null && coupon.perUserLimit < lineCount) {
      errors.push(
        `${code} can be used only ${coupon.perUserLimit} time(s) per customer, but this offer applies it to ${lineCount} books. ` +
          `Raise its "per-user limit" to ${lineCount} or more, or use a different coupon per book.`
      );
    }
    if (usageLeft != null && audienceSize != null && usageLeft < audienceSize) {
      warnings.push(`${code} has only ${usageLeft} use(s) left but this email goes to about ${audienceSize} people.`);
    }
    if (coupon.validTill) {
      const hours = (new Date(coupon.validTill).getTime() - at.getTime()) / 36e5;
      if (hours > 0 && hours < 72) warnings.push(`${code} expires in less than 3 days after sending.`);
    }
  }

  // A bundle and one of its own books in the same email.
  for (const item of items) {
    const inner = catalog.bundleMap.get(String(item.bookId)) || [];
    const clash = items.find((o) => inner.includes(String(o.bookId)));
    if (clash) {
      warnings.push(`"${catalog.books.get(String(item.bookId))?.title}" is a bundle that already contains "${catalog.books.get(String(clash.bookId))?.title}".`);
    }
  }
  for (const book of catalog.books.values()) {
    if (book.isPublished === false) warnings.push(`"${book.title}" is not marked as published.`);
  }

  return {
    ok: errors.length === 0,
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
    couponInfo,
    offer: priced,
  };
};

/* ------------------------------------------------------------------ */
/* Personalised offer for one recipient (send time)                     */
/* ------------------------------------------------------------------ */

/* What this person has bought (bundles expanded) and which coupons they already used. */
export const loadCustomerHistory = async (email, bundleMap) => {
  const rows = await Order.find({
    "customer.email": normalizeEmail(email),
    "payment.status": { $in: PAID_STATUSES },
  })
    .select("bookId purchasedBookIds orderStatus payment.status coupon.applied coupon.couponId")
    .lean();

  const owned = new Set();
  const usage = new Map();
  for (const row of rows) {
    owned.add(String(row.bookId));
    for (const id of row.purchasedBookIds || []) owned.add(String(id));

    // Counted exactly like checkout counts it (see validateCouponForPayment).
    if (row.orderStatus === "PAID" && row.payment?.status === "SUCCESS" && row.coupon?.applied && row.coupon?.couponId) {
      const id = String(row.coupon.couponId);
      usage.set(id, (usage.get(id) || 0) + 1);
    }
  }
  expandBundles(owned, bundleMap);
  return { owned, usage };
};

/*
  status:
    OK         send it (result.offer holds the personal price list)
    OWNS_ALL   they already own every book in the offer -> do not send
    NO_COUPON  the coupons are used up for this person and nothing would be discounted -> do not send
    INVALID    something is wrong with the offer itself (expired coupon ...) -> pause, do not send
*/
export const buildPersonalOffer = async (offer, catalog, email, { snapshotOwned = [], now = new Date() } = {}) => {
  const history = await loadCustomerHistory(email, catalog.bundleMap);
  // Owned at launch (any spelling of the address) + owned right now.
  const owned = expandBundles(new Set([...snapshotOwned.map(String), ...history.owned]), catalog.bundleMap);

  const priced = priceOffer(offer, catalog, { owned, couponUsage: history.usage, now });

  if (priced.problems.length) return { status: "INVALID", reason: priced.problems[0], offer: priced };
  if (!priced.lines.length) return { status: "OWNS_ALL", reason: "Already owns every book in the offer", offer: priced };

  const wantedDiscount = priced.lines.some((l) => l.intendedCode);
  if (wantedDiscount && priced.lines.every((l) => !l.discountAmount)) {
    return { status: "NO_COUPON", reason: "Has already used the offer coupon(s)", offer: priced };
  }
  return { status: "OK", reason: "", offer: priced };
};
