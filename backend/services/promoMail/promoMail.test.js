import test from "node:test";
import assert from "node:assert/strict";

import Order from "../../models/Order.js";
import { buildPersonalOffer } from "../campaign/offerPricing.js";
import { PROMO_REF, bookLink, buildPromoMail, coverUrl } from "./promoMailBuilder.js";

const chain = (rows) => {
  const q = { select: () => q, lean: async () => rows };
  return q;
};

const A = "000000000000000000000001";
const B = "000000000000000000000002";
const C = "000000000000000000000003";

const books = [
  { _id: A, title: "System Design HLD", subtitle: "Handbook", price: 499, mrp: 999, isActive: true, coverImage: "https://cdn.example.com/a.jpg", redirectUrl: "/book/system-design/hld" },
  { _id: B, title: "LLD <Handbook>", price: 299, mrp: 599, isActive: true, coverPageUrl: "http://insecure.example.com/b.jpg", redirectUrl: "https://evil.example.com/steal" },
  { _id: C, title: "Java Handbook", price: 199, mrp: 399, isActive: true, redirectUrl: "/book/java-interview-handbook?x=1" },
];
const coupon = (code, extra = {}) => ({
  _id: `id-${code}`, code, isActive: true, discountType: "PERCENTAGE", discountValue: 20,
  appliesToAllBooks: true, applicableBooks: [], perUserLimit: 5, usageLimit: null, usedCount: 0, minimumOrderAmount: 0,
  validTill: new Date("2099-12-31"), ...extra,
});
const catalog = (cs) => ({
  books: new Map(books.map((b) => [String(b._id), b])),
  coupons: new Map(cs.map((c) => [c.code, c])),
  bundleMap: new Map(),
});

const withOrders = async (rows, fn) => {
  const original = Order.find;
  Order.find = () => chain(rows);
  try {
    return await fn();
  } finally {
    Order.find = original;
  }
};

const build = async (offer, cs, owned = []) =>
  withOrders(owned.map((id) => ({ bookId: id, purchasedBookIds: [], orderStatus: "PAID", payment: { status: "SUCCESS" }, coupon: {} })), async () => {
    const result = await buildPersonalOffer(offer, catalog(cs), "buyer@example.com", { snapshotOwned: [C] });
    return buildPromoMail({ email: "buyer@example.com", name: "Aarav Sharma", purchasedTitle: "Java Handbook", offer: result.offer, note: "" });
  });

test("book links are built on our own site with ?ref=, never taken from elsewhere", () => {
  assert.equal(bookLink(books[0]), `https://www.targettrek.in/book/system-design/hld?ref=${PROMO_REF}`);
  assert.equal(PROMO_REF, "lkh");
  // an off-site address falls back to the books page
  assert.equal(bookLink(books[1]), `https://www.targettrek.in/books?ref=${PROMO_REF}`);
  // existing query strings are kept
  assert.equal(bookLink(books[2]), `https://www.targettrek.in/book/java-interview-handbook?x=1&ref=${PROMO_REF}`);
  // an existing ref is replaced, not duplicated
  assert.equal(bookLink({ redirectUrl: "/books?ref=other" }), `https://www.targettrek.in/books?ref=${PROMO_REF}`);
});

test("only https covers are used", () => {
  assert.equal(coverUrl(books[0]), "https://cdn.example.com/a.jpg");
  assert.equal(coverUrl(books[1]), "");
  assert.equal(coverUrl({ coverImage: { secure_url: "https://x.example.com/c.png" } }), "https://x.example.com/c.png");
});

test("email: thanks line first, then cover, name, coupon code, amount to pay, links, Prep Arena, unsubscribe", async () => {
  const offer = { enabled: true, defaultCouponCode: "THANKS20", items: [{ bookId: A, couponMode: "default" }, { bookId: B, couponMode: "default" }] };
  const mail = await build(offer, [coupon("THANKS20")]);

  assert.equal(mail.subject, "Thanks for purchasing Java Handbook");
  assert.ok(mail.html.indexOf("Thanks for purchasing") < mail.html.indexOf("THANKS20"), "thanks comes first");
  assert.match(mail.html, /https:\/\/cdn\.example\.com\/a\.jpg/); // cover
  assert.match(mail.html, /System Design HLD/);
  assert.match(mail.html, /THANKS20/); // coupon code
  assert.match(mail.html, /₹399\.2/); // 499 - 20% = 399.20 to pay
  assert.match(mail.html, /book\/system-design\/hld\?ref=lkh/);
  assert.match(mail.html, /Prep Arena/);
  assert.match(mail.html, /targettrek\.in\/prep-buddy/);
  assert.match(mail.html, /api\/mail\/unsubscribe\?e=buyer%40example\.com/);
  assert.match(mail.html, /supporttargettrek@gmail\.com/);
  assert.match(mail.html, /padding:0 16px/); // small side padding
  assert.match(mail.html, /Total for all 2 books/);
  assert.match(mail.text, /Coupon code: THANKS20/);
  assert.match(mail.text, /Unsubscribe from promotional emails: /);
});

test("email: unsubscribe headers allow one-click unsubscribe", async () => {
  const mail = await build({ enabled: true, defaultCouponCode: "", items: [{ bookId: A, couponMode: "none" }] }, []);
  assert.match(mail.headers["List-Unsubscribe"], /^<https?:\/\/.+\/api\/mail\/unsubscribe\?e=.+>, <mailto:supporttargettrek@gmail\.com/);
  assert.equal(mail.headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
});

test("email: a book the customer owns is never in it; a different coupon per book works", async () => {
  const offer = {
    enabled: true,
    defaultCouponCode: "",
    items: [
      { bookId: A, couponMode: "own", couponCode: "AAA10" },
      { bookId: B, couponMode: "own", couponCode: "BBB50" },
    ],
  };
  const mail = await build(offer, [coupon("AAA10", { discountValue: 10 }), coupon("BBB50", { discountValue: 50 })], [A]);
  assert.ok(!mail.html.includes("System Design HLD"), "owned book left out");
  assert.match(mail.html, /BBB50/);
  assert.ok(!mail.html.includes("AAA10"));
  assert.match(mail.html, /₹149\.5/); // 299 - 50%
});

test("email: admin text and book titles cannot inject HTML", async () => {
  const offer = { enabled: true, defaultCouponCode: "", items: [{ bookId: B, couponMode: "none" }] };
  const result = await withOrders([], () => buildPersonalOffer(offer, catalog([]), "buyer@example.com"));
  const mail = buildPromoMail({
    email: "buyer@example.com",
    name: "<img src=x onerror=alert(1)>",
    purchasedTitle: "<script>x</script>",
    offer: result.offer,
    note: "<b onclick=alert(1)>hi</b>",
  });
  assert.ok(!/<script>x/.test(mail.html));
  assert.ok(!/<img src=x/.test(mail.html));
  assert.ok(!/<b onclick/.test(mail.html));
  assert.match(mail.html, /LLD &lt;Handbook&gt;/);
});
