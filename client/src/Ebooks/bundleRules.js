/*
  BUNDLE OFFER RULES  (pure functions, no imports)

  THIS FILE EXISTS TWICE, BYTE FOR BYTE:
    backend/services/bundleRules.js
    client/src/Ebooks/bundleRules.js
  The server is the authority; the browser runs the same code only to show the price
  instantly. Change one, copy it to the other.

  An offer = WHICH books (scope) x HOW the buyer chooses (selectionMode) x THE DEAL (type)

  scope        ALL | CUSTOM (a book qualifies if it matches ANY of tags / categories / bookIds)
               + excludeBookIds, minBookPrice, maxBookPrice, tagMatch (ANY | ALL tags)
  selectionMode PICK (buyer picks min..max books)  |  ALL (every book in scope, nothing to pick)
  type         FIXED_PRICE      N books for a flat total            "any 5 books for 999"
               PERCENT_OFF      % off the total                     "4+ books, 60% off"
               AMOUNT_OFF       flat rupees off the total           "Rs 200 off on 3+ books"
               PER_BOOK_PRICE   every book at the same price        "any 4+ books at Rs 199 each"
               FREE_BOOKS       buy X, the cheapest Y are free      "buy 3 get 1 free"
               TIERED_PERCENT   more books = bigger %               "3 books 20%, 5 books 40%"
*/

export const OFFER_TYPES = [
  "FIXED_PRICE",
  "PERCENT_OFF",
  "AMOUNT_OFF",
  "PER_BOOK_PRICE",
  "FREE_BOOKS",
  "TIERED_PERCENT",
];

export const MAX_BOOKS_LIMIT = 50;

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const norm = (v) => String(v ?? "").trim().toLowerCase();

export const inr = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

/* ----------------------------- which books ----------------------------- */

export const matchesScope = (offer, book) => {
  const scope = offer?.scope || {};

  if (String(book?._id) && (scope.excludeBookIds || []).map(String).includes(String(book._id))) {
    return false;
  }

  const price = Number(book?.price || 0);
  if (Number(scope.minBookPrice) > 0 && price < Number(scope.minBookPrice)) return false;
  if (Number(scope.maxBookPrice) > 0 && price > Number(scope.maxBookPrice)) return false;

  if (!scope.mode || scope.mode === "ALL") return true;

  // CUSTOM (and the older TAGS / CATEGORIES / BOOKS modes): any criterion may match
  const tags = (scope.tags || []).map(norm).filter(Boolean);
  const categories = new Set((scope.categories || []).map(norm).filter(Boolean));
  const ids = new Set((scope.bookIds || []).map(String));

  if (tags.length) {
    const own = new Set((book.tags || []).map(norm));
    const hit = scope.tagMatch === "ALL" ? tags.every((t) => own.has(t)) : tags.some((t) => own.has(t));
    if (hit) return true;
  }

  if (categories.size && categories.has(norm(book.category))) return true;

  if (ids.size && ids.has(String(book._id))) return true;

  return false;
};

export const isBookEligible = (offer, book) => {
  if (!book || !book.isPublished || !book.isActive) return false;
  if (book.resourceType === "bundle") return false;
  if (book.membership?.plan && book.membership.plan !== "none") return false;
  if (!(Number(book.price) > 0)) return false;
  return matchesScope(offer, book);
};

/* ------------------------------ how many ------------------------------ */

export const maxBooksFor = (offer) => {
  if (offer.selectionMode === "ALL") return MAX_BOOKS_LIMIT;
  if (offer.type === "FIXED_PRICE" || offer.type === "FREE_BOOKS") return offer.minBooks;
  return offer.maxBooks || MAX_BOOKS_LIMIT;
};

const sortedTiers = (offer) =>
  [...(offer.tiers || [])]
    .map((t) => ({ minBooks: Number(t.minBooks), percent: Number(t.percent) }))
    .sort((a, b) => a.minBooks - b.minBooks);

/* ------------------------------- pricing ------------------------------- */

const bad = (code, message) => ({ ok: false, code, message });

export const priceSelection = (offer, books) => {
  const count = books.length;
  const maxBooks = maxBooksFor(offer);

  if (count < offer.minBooks) {
    return bad(
      "OFFER_TOO_FEW",
      `Select ${offer.minBooks} book${offer.minBooks === 1 ? "" : "s"} to get this offer.`
    );
  }

  if (count > maxBooks) {
    return bad(
      "OFFER_TOO_MANY",
      maxBooks === offer.minBooks
        ? `This offer is for exactly ${offer.minBooks} books.`
        : `You can select up to ${maxBooks} books in this offer.`
    );
  }

  const prices = books.map((b) => Number(b.price || 0));
  const original = round2(prices.reduce((s, p) => s + p, 0));

  let final;
  let percentApplied = null;
  let freeBookIds = [];

  switch (offer.type) {
    case "FIXED_PRICE":
      final = round2(offer.fixedPrice);
      break;

    case "PERCENT_OFF": {
      let disc = (original * Number(offer.discountPercent || 0)) / 100;
      if (Number(offer.maxDiscountAmount) > 0) disc = Math.min(disc, Number(offer.maxDiscountAmount));
      percentApplied = Number(offer.discountPercent || 0);
      final = round2(original - disc);
      break;
    }

    case "AMOUNT_OFF":
      final = round2(original - Number(offer.amountOff || 0));
      break;

    case "PER_BOOK_PRICE":
      final = round2(count * Number(offer.perBookPrice || 0));
      break;

    case "FREE_BOOKS": {
      const ranked = books
        .map((b) => ({ id: String(b._id ?? ""), price: Number(b.price || 0) }))
        .sort((a, b) => a.price - b.price)
        .slice(0, Math.min(Number(offer.freeBooks || 0), count));
      freeBookIds = ranked.map((r) => r.id);
      final = round2(original - ranked.reduce((s, r) => s + r.price, 0));
      break;
    }

    case "TIERED_PERCENT": {
      const tier = [...sortedTiers(offer)].reverse().find((t) => count >= t.minBooks);
      if (!tier) {
        return bad("OFFER_TOO_FEW", `Select at least ${sortedTiers(offer)[0]?.minBooks || offer.minBooks} books to get this offer.`);
      }
      let disc = (original * tier.percent) / 100;
      if (Number(offer.maxDiscountAmount) > 0) disc = Math.min(disc, Number(offer.maxDiscountAmount));
      percentApplied = tier.percent;
      final = round2(original - disc);
      break;
    }

    default:
      return bad("OFFER_INVALID", "This offer is not set up correctly.");
  }

  if (!(final > 0)) return bad("OFFER_INVALID_PRICE", "Offer price is not valid.");

  if (final >= original) {
    return bad(
      "OFFER_NO_SAVING",
      "These books cost less than the offer price. Pick other books or buy them individually."
    );
  }

  return {
    ok: true,
    originalAmount: original,
    discountAmount: round2(original - final),
    finalAmount: final,
    savingsPercent: Math.round(((original - final) / original) * 100),
    percentApplied,
    freeBookIds,
    bookCount: count,
  };
};

/* ------------------------- wording used on every page ------------------------- */

const buyCount = (offer) => Math.max(1, Number(offer.minBooks || 0) - Number(offer.freeBooks || 0));

export const describeOffer = (offer, eligibleCount) => {
  const all = offer.selectionMode === "ALL";
  const n = offer.minBooks;
  const plus = (offer.maxBooks || MAX_BOOKS_LIMIT) > n ? "+" : "";
  const count = all && eligibleCount ? `all ${eligibleCount} books` : "all books";

  switch (offer.type) {
    case "FIXED_PRICE":
      return {
        big: inr(offer.fixedPrice),
        sub: all ? `for ${count}` : `for any ${n} books`,
        line: all ? `${count[0].toUpperCase()}${count.slice(1)} for ${inr(offer.fixedPrice)}` : `Any ${n} books for ${inr(offer.fixedPrice)}`,
        rule: all ? "Every book included, nothing to choose" : `Select exactly ${n} books`,
        unlock: inr(offer.fixedPrice),
      };
    case "PERCENT_OFF":
      return {
        big: `${offer.discountPercent}% OFF`,
        sub: all ? `on ${count}` : `on ${n}${plus} books`,
        line: all ? `${offer.discountPercent}% off ${count}` : `${n}${plus} books, ${offer.discountPercent}% off`,
        rule: all ? "Every book included, nothing to choose" : `Select ${n} to ${maxBooksFor(offer)} books`,
        unlock: `${offer.discountPercent}% off`,
      };
    case "AMOUNT_OFF":
      return {
        big: `${inr(offer.amountOff)} OFF`,
        sub: all ? `on ${count}` : `on ${n}${plus} books`,
        line: all ? `${inr(offer.amountOff)} off ${count}` : `${inr(offer.amountOff)} off on ${n}${plus} books`,
        rule: all ? "Every book included, nothing to choose" : `Select ${n} to ${maxBooksFor(offer)} books`,
        unlock: `${inr(offer.amountOff)} off`,
      };
    case "PER_BOOK_PRICE":
      return {
        big: `${inr(offer.perBookPrice)} each`,
        sub: all ? `for ${count}` : `on any ${n}${plus} books`,
        line: all ? `${count[0].toUpperCase()}${count.slice(1)} at ${inr(offer.perBookPrice)} each` : `Any ${n}${plus} books at ${inr(offer.perBookPrice)} each`,
        rule: all ? "Every book included, nothing to choose" : `Select ${n} to ${maxBooksFor(offer)} books`,
        unlock: `${inr(offer.perBookPrice)} per book`,
      };
    case "FREE_BOOKS": {
      const y = Number(offer.freeBooks || 0);
      const x = buyCount(offer);
      return {
        big: `Buy ${x} Get ${y} FREE`,
        sub: `pick ${n} books, the cheapest ${y} ${y === 1 ? "is" : "are"} free`,
        line: `Buy ${x}, get ${y} free`,
        rule: `Select exactly ${n} books`,
        unlock: `${y} free book${y === 1 ? "" : "s"}`,
      };
    }
    case "TIERED_PERCENT": {
      const tiers = sortedTiers(offer);
      const top = tiers[tiers.length - 1];
      return {
        big: `Up to ${top?.percent || 0}% OFF`,
        sub: "more books, bigger discount",
        line: tiers.map((t) => `${t.minBooks}+ books ${t.percent}% off`).join(", "),
        rule: `Select ${n} to ${maxBooksFor(offer)} books`,
        unlock: `${tiers[0]?.percent || 0}% off`,
        tiers,
      };
    }
    default:
      return { big: "Offer", sub: "", line: offer.name || "Offer", rule: "", unlock: "the offer" };
  }
};

/* What to tell the buyer while they pick (not enough yet, or "add 1 more for a bigger tier") */
export const pickHint = (offer, count, priced) => {
  const d = describeOffer(offer);

  if (count < offer.minBooks) {
    const need = offer.minBooks - count;
    return { tone: "info", text: `Add ${need} more book${need === 1 ? "" : "s"} to unlock ${d.unlock}.` };
  }

  if (priced && !priced.ok) return { tone: "warn", text: priced.message };

  if (offer.type === "TIERED_PERCENT") {
    const next = sortedTiers(offer).find((t) => t.minBooks > count);
    if (next && count < maxBooksFor(offer)) {
      const need = next.minBooks - count;
      return { tone: "ok", text: `Add ${need} more for ${next.percent}% off.` };
    }
  }

  if (offer.type === "FREE_BOOKS" && priced?.ok) {
    return { tone: "ok", text: `Your ${offer.freeBooks} cheapest book${offer.freeBooks === 1 ? " is" : "s are"} free.` };
  }

  return { tone: "ok", text: priced?.ok ? `Offer applied. You save ${inr(priced.discountAmount)} (${priced.savingsPercent}% off).` : "" };
};

/* Headline "save about X%" for cards, from the books the offer applies to */
export const estimateSaving = (offer, books) => {
  if (!books?.length) return 0;
  if (offer.type === "PERCENT_OFF") return Math.round(offer.discountPercent || 0);
  if (offer.type === "TIERED_PERCENT") return Math.round(sortedTiers(offer).at(-1)?.percent || 0);

  const take = offer.selectionMode === "ALL" ? books.length : offer.minBooks;
  if (books.length < take) return 0;

  // typical pick: the first books of the offer
  const result = priceSelection(offer, books.slice(0, take));
  return result.ok ? result.savingsPercent : 0;
};
