/*
  Partner dashboard: integration suite. NOT picked up by `node --test` automatically.
  Needs a throw-away MongoDB:  npm i -D --no-save mongodb-memory-server
  Run:  node tests/partner/partner.integration.test.mjs   (exit code 1 on any failure)

  Covers: every product is read into the ledger, permission AND-ing (settings ceiling × partner access),
  hidden columns never leave the server, customer details are never returned, masking, history limits,
  product / status / code / search filters, CSV export, admin preview and role guards.
*/
import assert from "node:assert/strict";

const B = new URL("../../", import.meta.url).pathname.replace(/\/$/, "");
process.env.MONGO_URI = "mongodb://x/x";
process.env.JWT_SECRET = "0123456789012345678901234567890123456789";
process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "x";
process.env.RESEND_API_KEY = "";
process.env.MAIL_DISABLE_SEND = "true";

const { MongoMemoryServer } = await import("mongodb-memory-server");
const mongoose = (await import(`${B}/node_modules/mongoose/index.js`)).default;
const mongo = await MongoMemoryServer.create();
await mongoose.connect(mongo.getUri(), { dbName: "t" });

const m = async (p) => (await import(`${B}/${p}`)).default;
const User = await m("models/User.js");
const Order = await m("models/Order.js");
const ArenaEntry = await m("models/arena/ArenaEntry.js");
const MemoryOrder = await m("models/memory/MemoryOrder.js");
const MemoryReferral = await m("models/memory/MemoryReferral.js");
const ResumePurchase = await m("models/resume/ResumePurchase.js");
const ReferralOrder = await m("models/referral/ReferralOrder.js");
const ReferralSubCharge = await m("models/referral/ReferralSubCharge.js");
const ReferralSubscription = await m("models/referral/ReferralSubscription.js");
const PartnerAccess = await m("models/partner/PartnerAccess.js");
const PartnerSettings = await m("models/partner/PartnerSettings.js");
const C = await import(`${B}/controllers/partner/partnerController.js`);

let failed = 0;
const test = async (name, fn) => {
  try { await fn(); console.log(`  ✓ ${name}`); } catch (e) { failed++; console.error(`  ✗ ${name}\n    ${e.stack || e}`); }
};

/* fake express req/res */
const call = async (handler, { user, params = {}, query = {}, body = {} } = {}) => {
  const res = { statusCode: 200, headers: {}, body: undefined };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  res.send = (b) => { res.body = b; return res; };
  res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; };
  await handler({ user, params, query, body }, res);
  return res;
};

/* ------------------------------------------------------------ fixtures */
const oid = () => new mongoose.Types.ObjectId();
const now = Date.now();
const daysAgo = (d) => new Date(now - d * 86400000);
/* raw inserts: the ledger reads stored documents, so the fixtures skip unrelated model validation */
const raw = async (Model, docs) => {
  const list = (Array.isArray(docs) ? docs : [docs]).map((d) => ({ _id: oid(), createdAt: new Date(now), updatedAt: new Date(now), ...d }));
  await Model.collection.insertMany(list);
  return Array.isArray(docs) ? list : list[0];
};
const buyer = { name: "Secret Buyer", email: "secret.buyer@example.com", phone: "9876500000" };

const admin = await User.create({ name: "Admin", email: "a@x.io", password: "x", role: "admin", mustChangePassword: false });
const partner = await User.create({ name: "Pat Partner", email: "p@x.io", mobile: "9876543210", password: "x", role: "partner", mustChangePassword: false });
const normal = await User.create({ name: "Norm", email: "n@x.io", mobile: "9876543211", password: "x", role: "normal", mustChangePassword: false });
const buyerUser = await User.create({ name: buyer.name, email: buyer.email, mobile: buyer.phone, password: "x", role: "normal", mustChangePassword: false });

const BOOK_B = oid();
const bookBase = (o) => ({
  orderId: `BK-${Math.random().toString(36).slice(2, 10)}`, bookId: oid(),
  book: { title: "System Design Notes", price: 199, mrp: 299 },
  customer: buyer,
  ...o,
});
await raw(Order, [
  bookBase({ orderId: "BK-PAID-1", orderStatus: "PAID", createdAt: daysAgo(2),
    coupon: { applied: true, code: "SAVE20", discountAmount: 50 },
    payment: { provider: "Razorpay", transactionId: "pay_ABCDEF123456", amount: 149, status: "SUCCESS", paidAt: daysAgo(2), affiliateCode: "creator20", affiliateUserId: oid(), affiliateAmount: 29.8, callbackResponse: { email: buyer.email } } }),
  bookBase({ orderId: "BK-DIRECT", bookId: BOOK_B, orderStatus: "PAID", createdAt: daysAgo(5), payment: { provider: "Cashfree", transactionId: "cf_777", amount: 199, status: "SUCCESS", paidAt: daysAgo(5), affiliateCode: "tt" } }),
  bookBase({ orderId: "BK-REFUND", orderStatus: "PARTIALLY_REFUNDED", createdAt: daysAgo(3), payment: { provider: "PayU", transactionId: "payu_9", amount: 199, status: "PARTIALLY_REFUNDED", paidAt: daysAgo(3) }, refund: { refundedAmount: 99.5 } }),
  bookBase({ orderId: "BK-PENDING", orderStatus: "PENDING", createdAt: daysAgo(1), payment: { provider: "PayU", amount: 199 } }),
  bookBase({ orderId: "BK-OLD", orderStatus: "PAID", createdAt: daysAgo(200), payment: { provider: "PayU", transactionId: "payu_old", amount: 199, status: "SUCCESS", paidAt: daysAgo(200) } }),
]);

await raw(ArenaEntry, [
  { user: buyerUser._id, status: "consumed", listPricePaise: 49900, discountPaise: 10000, paidPaise: 39900, cancellationFeePercent: 10, coupon: { code: "BUDDY100" },
    payment: { gateway: "razorpay", orderId: "order_arena1", paymentId: "pay_arena1" }, affiliate: { user: oid(), code: "creator20", type: "percentage", value: 10, commissionPaise: 3990 }, paidAt: daysAgo(4), createdAt: daysAgo(4) },
  { user: oid(), status: "paid", listPricePaise: 0, paidPaise: 0, cancellationFeePercent: 0, complimentary: true, payment: { gateway: "admin" }, paidAt: daysAgo(4) },
]);

const mOrder = await raw(MemoryOrder, { user: buyerUser._id, amount: 9900, gateway: "razorpay", gatewayOrderId: "order_mem1", gatewayPaymentId: "pay_mem1", status: "paid", kind: "page", paidAt: daysAgo(6), clientIp: "1.2.3.4", createdAt: daysAgo(6) });
await raw(MemoryReferral, { referrer: oid(), referee: buyerUser._id, code: "anu7", status: "qualified", qualifyingOrder: mOrder._id });

await raw(ResumePurchase, [
  { user: buyerUser._id, package: oid(), packageSnapshot: { name: "Pro Review", pricePaise: 49900 }, payment: { amount: 39900, gateway: "cashfree", gatewayOrderId: "cf_res1", gatewayPaymentId: "cfp_res1", status: "paid", paidAt: daysAgo(7) }, createdAt: daysAgo(7) },
  { user: buyerUser._id, package: oid(), grantedBy: admin._id, payment: { amount: 0, gateway: "admin", status: "paid", paidAt: daysAgo(7) } },
]);

await raw(ReferralOrder, [
  { user: buyerUser._id, kind: "unlock", title: "Chat unlock", payment: { amount: 4900, gateway: "razorpay", gatewayOrderId: "order_ref1", gatewayPaymentId: "pay_ref1", status: "paid", paidAt: daysAgo(8) }, createdAt: daysAgo(8) },
  { user: buyerUser._id, kind: "grant", source: "signup", allowed: 2 },
]);
const sub = await raw(ReferralSubscription, { user: buyerUser._id, plan: oid(), planName: "Priority Monthly", gateway: "razorpay" });
await raw(ReferralSubCharge, { subscription: sub._id, user: buyerUser._id, kind: "renewal", status: "paid", amountPaise: 19900, gatewayPaymentId: "pay_sub1", gatewayInvoiceId: "inv_sub1", at: daysAgo(9) });

const ALL_ON = { books: true, prepBuddy: true, memories: true, resume: true, referral: true };
const FIELDS_ON = Object.fromEntries(["amount", "listPrice", "transactionId", "orderId", "gateway", "item", "coupon", "referralCode", "referralAmount", "refund", "status"].map((k) => [k, true]));
const PAID_ON = { paid: true, partial_refund: true, refunded: true, pending: false, failed: false };
const SECTIONS_ON = { overview: true, revenue: true, transactions: true, codes: true, export: true };
const asPartner = { id: String(partner._id), role: "partner" };
const asAdmin = { id: String(admin._id), role: "admin" };
const setAccess = (a) => call(C.adminUpdateAccess, { user: asAdmin, params: { userId: String(partner._id) }, body: a });
const setSettings = (s) => call(C.adminUpdateSettings, { user: asAdmin, body: s });
const txns = (query = {}) => call(C.partnerTransactions, { user: asPartner, query: { range: "30d", limit: 50, ...query } });

const forbiddenText = [buyer.name, buyer.email, buyer.phone, String(buyerUser._id), "1.2.3.4", "callbackResponse", "customer"];
const assertNoPii = (body) => {
  const s = JSON.stringify(body);
  for (const t of forbiddenText) assert.ok(!s.includes(t), `response leaked "${t}"`);
};

console.log("Partner dashboard");

await test("a new partner sees nothing until an admin opens a product", async () => {
  const me = await call(C.partnerMe, { user: asPartner });
  assert.equal(me.statusCode, 200);
  assert.equal(me.body.data.permissions.active, false);
  const r = await txns();
  assert.equal(r.statusCode, 403);
  assert.equal(r.body.code, "PARTNER_NO_PRODUCTS");
});

await test("all products open: every paid row of every product, none of the free / unpaid / old ones", async () => {
  await setAccess({ products: ALL_ON, fields: FIELDS_ON, sections: SECTIONS_ON });
  const r = await txns();
  assert.equal(r.statusCode, 200, JSON.stringify(r.body));
  const refs = r.body.data.rows.map((x) => x.ref).sort();
  assert.deepEqual(refs, ["BK-DIRECT", "BK-PAID-1", "BK-REFUND", "cf_res1", "inv_sub1", "order_arena1", "order_mem1", "order_ref1"].sort());
  assertNoPii(r.body);
  const bk = r.body.data.rows.find((x) => x.ref === "BK-PAID-1");
  assert.equal(bk.amount, 14900);
  assert.equal(bk.discount, 5000);
  assert.equal(bk.listPrice, 19900);
  assert.equal(bk.coupon, "SAVE20");
  assert.equal(bk.referralCode, "CREATOR20");
  assert.equal(bk.referralAmount, 2980);
  assert.equal(bk.txnId, "pay_ABCDEF123456");
  assert.equal(r.body.data.rows.find((x) => x.ref === "BK-DIRECT").referralCode, null, "tt is a direct sale");
  const rf = r.body.data.rows.find((x) => x.ref === "BK-REFUND");
  assert.equal(rf.status, "partial_refund"); assert.equal(rf.refunded, 9950);
  const ar = r.body.data.rows.find((x) => x.ref === "order_arena1");
  assert.equal(ar.product, "prepBuddy"); assert.equal(ar.coupon, "BUDDY100"); assert.equal(ar.referralAmount, 3990);
  assert.equal(r.body.data.rows.find((x) => x.ref === "order_mem1").referralCode, "ANU7");
  assert.match(r.body.data.rows.find((x) => x.ref === "inv_sub1").item, /Priority Monthly/);
});

await test("hidden columns are not in the response at all", async () => {
  await setAccess({ fields: { ...FIELDS_ON, transactionId: false, referralAmount: false, coupon: false, gateway: false } });
  const r = await txns();
  for (const row of r.body.data.rows) {
    assert.ok(!("txnId" in row) && !("referralAmount" in row) && !("coupon" in row) && !("gateway" in row), JSON.stringify(row));
    assert.ok("amount" in row && "referralCode" in row);
  }
});

await test("the global ceiling beats the partner's own access", async () => {
  await setAccess({ fields: FIELDS_ON });
  await setSettings({ fields: { ...FIELDS_ON, amount: false }, products: { ...ALL_ON, memories: false } });
  const r = await txns();
  assert.ok(r.body.data.rows.every((x) => !("amount" in x)));
  assert.ok(r.body.data.rows.every((x) => x.product !== "memories"));
  const o = await call(C.partnerOverview, { user: asPartner, query: { range: "30d" } });
  assert.ok(!("amount" in o.body.data.totals), "revenue totals hidden with amount");
  assert.ok(o.body.data.series.every((p) => !("amount" in p)));
  await setSettings({ fields: FIELDS_ON, products: ALL_ON });
});

await test("portal switched off / partner paused", async () => {
  await setSettings({ enabled: false });
  assert.equal((await txns()).body.code, "PARTNER_PORTAL_OFF");
  await setSettings({ enabled: true });
  await setAccess({ enabled: false });
  assert.equal((await txns()).body.code, "PARTNER_PAUSED");
  await setAccess({ enabled: true });
});

await test("masking hides all but the last 4 characters, and masked ids are not searchable", async () => {
  await setAccess({ maskTransactionIds: true });
  const r = await txns();
  const bk = r.body.data.rows.find((x) => x.txnId?.endsWith("3456"));
  assert.equal(bk.txnId, "••••3456");
  assert.ok(!JSON.stringify(r.body).includes("pay_ABCDEF"));
  const s = await txns({ q: "pay_ABC" });
  assert.equal(s.body.data.total, 0);
  await setAccess({ maskTransactionIds: false });
  assert.equal((await txns({ q: "pay_ABC" })).body.data.total, 1);
});

await test("history limit clamps every range", async () => {
  const all = await txns({ range: "all" });
  assert.ok(all.body.data.rows.some((x) => x.ref === "BK-OLD"));
  await setAccess({ historyDays: 7 });
  const r = await txns({ range: "all" });
  assert.equal(r.body.data.range.clamped, true);
  assert.ok(r.body.data.rows.every((x) => new Date(x.at) >= daysAgo(7.1)));
  assert.ok(!r.body.data.rows.some((x) => x.ref === "BK-OLD"));
  const out = await txns({ range: "custom", from: "2020-01-01", to: "2020-01-31" });
  assert.equal(out.statusCode, 200);
  assert.equal(out.body.data.range.outside, true);
  assert.equal(out.body.data.total, 0);
  await setAccess({ historyDays: 0 });
});

await test("filters: product, status, code", async () => {
  assert.ok((await txns({ product: "books" })).body.data.rows.every((x) => x.product === "books"));
  assert.deepEqual((await txns({ status: "partial_refund" })).body.data.rows.map((x) => x.ref), ["BK-REFUND"]);
  const c = await txns({ code: "creator20" });
  assert.deepEqual(c.body.data.rows.map((x) => x.ref).sort(), ["BK-PAID-1", "order_arena1"]);
  // unpaid rows need both layers to allow them
  assert.equal((await txns({ status: "pending" })).body.code, "BAD_STATUS");
  await setAccess({ statuses: { ...PAID_ON, pending: true } });
  assert.equal((await txns({ status: "pending" })).body.code, "BAD_STATUS", "ceiling still says no");
  await setSettings({ statuses: { ...PAID_ON, pending: true } });
  assert.ok((await txns({ status: "pending" })).body.data.rows.some((x) => x.ref === "BK-PENDING"));
  const o = await call(C.partnerOverview, { user: asPartner, query: { range: "30d" } });
  assert.equal(o.body.data.totals.count, 8, "pending never counted in totals");
  await setSettings({ statuses: PAID_ON });
  await setAccess({ statuses: PAID_ON });
});

await test("overview totals, product split, codes and day series", async () => {
  const o = await call(C.partnerOverview, { user: asPartner, query: { range: "30d" } });
  assert.equal(o.statusCode, 200, JSON.stringify(o.body));
  const d = o.body.data;
  assert.equal(d.totals.count, 8);
  assert.equal(d.totals.amount, 14900 + 19900 + 19900 + 39900 + 9900 + 39900 + 4900 + 19900);
  assert.equal(d.totals.refunded, 9950);
  assert.equal(d.totals.net, d.totals.amount - 9950);
  assert.equal(d.totals.referralAmount, 2980 + 3990);
  assert.equal(d.byProduct.find((p) => p.product === "books").count, 3);
  assert.equal(d.series.length, 30);
  assert.equal(d.series.reduce((s, p) => s + p.count, 0), 8);
  assert.equal(d.codes.referrals.find((c) => c.code === "CREATOR20").count, 2);
  assert.ok(d.codes.coupons.some((c) => c.code === "SAVE20"));
  assertNoPii(o.body);
});

await test("sections: transactions / export can be closed", async () => {
  await setAccess({ sections: { ...SECTIONS_ON, transactions: false } });
  assert.equal((await txns()).body.code, "PARTNER_SECTION_HIDDEN");
  await setAccess({ sections: { ...SECTIONS_ON, export: false } });
  assert.equal((await call(C.partnerExport, { user: asPartner, query: { range: "30d" } })).statusCode, 403);
  await setAccess({ sections: SECTIONS_ON });
});

await test("CSV has only visible columns and defuses formulas", async () => {
  await setAccess({ fields: { ...FIELDS_ON, transactionId: false } });
  const r = await call(C.partnerExport, { user: asPartner, query: { range: "30d" } });
  assert.equal(r.statusCode, 200);
  const [head] = r.body.replace(/^﻿/, "").split("\r\n");
  assert.ok(!head.includes("Transaction ID"));
  assert.ok(head.includes("Coupon") && head.includes("Referral amount (INR)"));
  assert.ok(r.body.includes("149.00"));
  assertNoPii(r.body);
  await setAccess({ fields: FIELDS_ON });
});

await test("admin preview returns exactly what the partner gets", async () => {
  const a = await txns();
  const b = await call(C.previewTransactions, { user: asAdmin, params: { userId: String(partner._id) }, query: { range: "30d", limit: 50 } });
  // same rows and columns; the preview only adds the admin's hide id
  assert.deepEqual(b.body.data.rows.map(({ hideId, ...r }) => r), a.body.data.rows);
  assert.ok(b.body.data.rows.every((r) => r.hideId));
  const notPartner = await call(C.previewTransactions, { user: asAdmin, params: { userId: String(normal._id) }, query: {} });
  assert.equal(notPartner.statusCode, 404);
});

await test("access for a non-partner account is refused; bad input is cleaned", async () => {
  const r = await call(C.adminUpdateAccess, { user: asAdmin, params: { userId: String(normal._id) }, body: { products: ALL_ON } });
  assert.equal(r.statusCode, 404);
  await setAccess({ historyDays: 12345, products: { books: "yes", evil: true }, note: "x".repeat(900) });
  const doc = await PartnerAccess.findOne({ user: partner._id }).lean();
  assert.equal(doc.historyDays, 0);
  assert.equal(doc.products.books, true, "non-boolean ignored, previous value kept");
  assert.ok(!("evil" in doc.products));
  assert.equal(doc.note.length, 300);
  const list = await call(C.adminListPartners, { user: asAdmin });
  assert.equal(list.body.data.partners.length, 1);
  assert.equal(list.body.data.partners[0].name, "Pat Partner");
});

await test("date window: only payments between both dates (and the overlap with the global window)", async () => {
  const d = (n) => new Date(now - n * 86400000 + 330 * 60000).toISOString().slice(0, 10);
  await setAccess({ window: { from: d(5), to: d(3) } });
  const r = await txns({ range: "all" });
  assert.equal(r.statusCode, 200, JSON.stringify(r.body));
  assert.deepEqual(r.body.data.rows.map((x) => x.ref).sort(), ["BK-DIRECT", "BK-REFUND", "order_arena1"].sort());
  const me = await call(C.partnerMe, { user: asPartner });
  assert.equal(me.body.data.permissions.visible.from, d(5));
  assert.equal(me.body.data.permissions.visible.to, d(3));
  const o = await call(C.partnerOverview, { user: asPartner, query: { range: "all" } });
  assert.equal(o.body.data.totals.count, 3);
  // global window narrows it further
  await setSettings({ window: { from: d(4), to: "" } });
  assert.deepEqual((await txns({ range: "all" })).body.data.rows.map((x) => x.ref).sort(), ["BK-REFUND", "order_arena1"].sort());
  // windows that don't overlap: nothing, not an error
  await setSettings({ window: { from: d(1), to: "" } });
  const none = await txns({ range: "all" });
  assert.equal(none.statusCode, 200); assert.equal(none.body.data.total, 0);
  assert.equal((await call(C.adminListPartners, { user: asAdmin })).body.data.partners[0].effective.active, false);
  await setSettings({ window: null });
  // from after to is refused
  const bad = await setAccess({ window: { from: d(1), to: d(5) } });
  assert.equal(bad.statusCode, 400);
  await setAccess({ window: null });
});

await test("hide the newest days", async () => {
  await setAccess({ delayDays: 3 });
  const r = await txns({ range: "all" });
  assert.ok(r.body.data.rows.length > 0);
  assert.ok(r.body.data.rows.every((x) => new Date(x.at) < daysAgo(1.9)), "today and the 2 days before are hidden");
  assert.ok(!r.body.data.rows.some((x) => x.ref === "BK-PAID-1"));
  await setAccess({ delayDays: 0 });
});

await test("gateway, amount, code and book rules", async () => {
  await setAccess({ gateways: ["razorpay"] });
  let r = await txns();
  assert.ok(r.body.data.rows.length && r.body.data.rows.every((x) => x.gateway === "razorpay"), JSON.stringify(r.body.data.rows.map((x) => x.gateway)));
  await setSettings({ gateways: ["cashfree"] });
  assert.equal((await txns()).body.data.total, 0, "no overlap with the ceiling");
  await setSettings({ gateways: [] });
  await setAccess({ gateways: [] });

  await setAccess({ minAmount: 150, maxAmount: 300 }); // rupees in
  r = await txns();
  assert.ok(r.body.data.rows.every((x) => x.amount >= 15000 && x.amount <= 30000));
  assert.equal((await setAccess({ minAmount: 500, maxAmount: 100 })).statusCode, 400);
  await setAccess({ minAmount: null, maxAmount: null });

  await setAccess({ codes: "creator20, buddy100" });
  r = await txns();
  assert.deepEqual(r.body.data.rows.map((x) => x.ref).sort(), ["BK-PAID-1", "order_arena1"]);
  const o = await call(C.partnerOverview, { user: asPartner, query: { range: "30d" } });
  assert.equal(o.body.data.totals.count, 2);
  await setAccess({ codes: [] });

  await setAccess({ books: [String(BOOK_B)], products: { ...ALL_ON } });
  r = await txns({ product: "books" });
  assert.deepEqual(r.body.data.rows.map((x) => x.ref), ["BK-DIRECT"]);
  assert.ok((await txns()).body.data.rows.some((x) => x.product === "prepBuddy"), "book rule only narrows Books");
  await setAccess({ books: [] });
});

await test("access end date", async () => {
  await setAccess({ expiresAt: "2020-01-01" });
  const r = await txns();
  assert.equal(r.body.code, "PARTNER_EXPIRED");
  assert.equal((await call(C.partnerMe, { user: asPartner })).body.data.permissions.expired, true);
  await setAccess({ expiresAt: "2999-12-31" });
  assert.equal((await txns()).statusCode, 200);
  await setAccess({ expiresAt: null });
});

await test("older documents with includeUnpaid still work", async () => {
  await PartnerAccess.updateOne({ user: partner._id }, { $set: { statuses: {}, includeUnpaid: true } });
  await PartnerSettings.updateOne({ key: "global" }, { $set: { statuses: {}, includeUnpaid: true } });
  const me = await call(C.partnerMe, { user: asPartner });
  assert.ok(me.body.data.permissions.statuses.includes("pending"));
  await setAccess({ statuses: PAID_ON });
  await setSettings({ statuses: PAID_ON });
  const doc = await PartnerAccess.findOne({ user: partner._id }).lean();
  assert.ok(!("includeUnpaid" in doc), "legacy flag removed on save");
});

await test("several partners: each one's settings apply to that partner only", async () => {
  const memP = await User.create({ name: "Mem Partner", email: "m@x.io", mobile: "9876543212", password: "x", role: "partner", mustChangePassword: false });
  const bookP = await User.create({ name: "Book Partner", email: "b@x.io", mobile: "9876543213", password: "x", role: "partner", mustChangePassword: false });
  const as = (u) => ({ id: String(u._id), role: "partner" });
  const save = (u, body) => call(C.adminUpdateAccess, { user: asAdmin, params: { userId: String(u._id) }, body });
  await save(memP, { products: { memories: true }, fields: { ...FIELDS_ON, transactionId: false } });
  await save(bookP, { products: { books: true }, fields: FIELDS_ON, window: { from: new Date(now - 4 * 86400000 + 330 * 60000).toISOString().slice(0, 10) } });

  const before = await txns(); // the first partner, untouched
  const m = await call(C.partnerTransactions, { user: as(memP), query: { range: "30d" } });
  const b = await call(C.partnerTransactions, { user: as(bookP), query: { range: "30d" } });
  assert.deepEqual(m.body.data.rows.map((x) => x.product), ["memories"]);
  assert.ok(m.body.data.rows.every((x) => !("txnId" in x)), "memories partner has no transaction ids");
  assert.deepEqual(b.body.data.rows.map((x) => x.ref).sort(), ["BK-PAID-1", "BK-REFUND"], "books partner: books only, own date window");
  const me = await call(C.partnerMe, { user: as(memP) });
  assert.deepEqual(me.body.data.permissions.products.map((p) => p.key), ["memories"]);

  // changing one partner never changes another
  await save(memP, { enabled: false });
  assert.equal((await call(C.partnerTransactions, { user: as(memP), query: {} })).body.code, "PARTNER_PAUSED");
  assert.equal((await call(C.partnerTransactions, { user: as(bookP), query: { range: "30d" } })).statusCode, 200);
  assert.deepEqual((await txns()).body.data.rows, before.body.data.rows);
  const list = await call(C.adminListPartners, { user: asAdmin });
  assert.equal(list.body.data.partners.length, 3);
  await User.deleteMany({ _id: { $in: [memP._id, bookP._id] } });
  await PartnerAccess.deleteMany({ user: { $in: [memP._id, bookP._id] } });
});

await test("hidden transactions: gone from lists, totals, codes and CSV, for one partner or everyone", async () => {
  await setAccess({ products: ALL_ON, fields: FIELDS_ON, sections: SECTIONS_ON, maskTransactionIds: false });
  const base = await call(C.partnerOverview, { user: asPartner, query: { range: "30d" } });
  // hide by gateway transaction id (book) and by our order id (prep buddy)
  const r = await setAccess({ hiddenTxns: "pay_ABCDEF123456\norder_arena1" });
  assert.equal(r.statusCode, 200, JSON.stringify(r.body));
  const t = await txns();
  const refs = t.body.data.rows.map((x) => x.ref);
  assert.ok(!refs.includes("BK-PAID-1") && !refs.includes("order_arena1"));
  assert.equal(t.body.data.total, 6);
  const o = await call(C.partnerOverview, { user: asPartner, query: { range: "30d" } });
  assert.equal(o.body.data.totals.count, base.body.data.totals.count - 2);
  assert.equal(o.body.data.totals.amount, base.body.data.totals.amount - 14900 - 39900);
  assert.ok(!(o.body.data.codes.referrals || []).some((c) => c.code === "CREATOR20"), "codes only from visible payments");
  const csv = await call(C.partnerExport, { user: asPartner, query: { range: "30d" } });
  assert.ok(!csv.body.includes("pay_ABCDEF123456") && !csv.body.includes("order_arena1"));
  assert.equal((await txns({ q: "pay_ABC" })).body.data.total, 0, "search can't find a hidden payment");

  // the preview carries the real id for the hide button; partners never get it
  const pv = await call(C.previewTransactions, { user: asAdmin, params: { userId: String(partner._id) }, query: { range: "30d", limit: 50 } });
  assert.ok(pv.body.data.rows.every((x) => "hideId" in x));
  assert.equal(pv.body.data.hiddenCount, 2);
  assert.ok(t.body.data.rows.every((x) => !("hideId" in x)));

  // quick unhide / hide
  let q = await call(C.adminHideTransactions, { user: asAdmin, params: { userId: String(partner._id) }, body: { remove: ["order_arena1"] } });
  assert.equal(q.statusCode, 200, JSON.stringify(q.body));
  assert.equal((await txns()).body.data.total, 7);
  q = await call(C.adminHideTransactions, { user: asAdmin, params: { userId: String(partner._id) }, body: { add: ["inv_sub1"] } });
  assert.equal((await txns()).body.data.total, 6);
  assert.deepEqual(q.body.data.access.hiddenTxns.sort(), ["inv_sub1", "pay_ABCDEF123456"]);
  assert.equal((await call(C.adminHideTransactions, { user: asAdmin, params: { userId: String(partner._id) }, body: { add: ["bad id with spaces<>"] } })).statusCode, 400);

  // hidden for every partner in Settings
  await setAccess({ hiddenTxns: [] });
  q = await call(C.adminHideTransactions, { user: asAdmin, params: { userId: "all" }, body: { add: ["order_mem1"] } });
  assert.equal(q.statusCode, 200);
  assert.ok(!(await txns()).body.data.rows.some((x) => x.ref === "order_mem1"));
  await call(C.adminHideTransactions, { user: asAdmin, params: { userId: "all" }, body: { remove: ["order_mem1"] } });
  assert.ok((await txns()).body.data.rows.some((x) => x.ref === "order_mem1"));
  assert.equal((await setAccess({ hiddenTxns: Array.from({ length: 501 }, (_, i) => `id_${i}`) })).statusCode, 400);
});

await test("partner routes are role-guarded", async () => {
  const { partnerRouter, partnerAdminRouter } = await import(`${B}/routes/partnerRoutes.js`);
  assert.ok(partnerRouter.stack.length >= 5 && partnerAdminRouter.stack.length >= 8);
  const { authorizeRoles } = await import(`${B}/Middleware/auth.js`);
  let status = 0;
  const res = { status: (c) => { status = c; return res; }, json: () => res };
  authorizeRoles("partner")({ user: { role: "normal" } }, res, () => { status = 200; });
  assert.equal(status, 403);
});

await mongoose.disconnect();
await mongo.stop();
await PartnerSettings.db?.close?.().catch?.(() => {});
console.log(failed ? `\n${failed} failed` : "\nall passed");
process.exit(failed ? 1 : 0);
