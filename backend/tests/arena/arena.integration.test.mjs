/*
  Prep Buddy Arena – integration suite. NOT picked up by `node --test` automatically.
  Needs a throw-away MongoDB replica set:  npm i -D mongodb-memory-server
  Run:  node tests/arena/<file>.test.mjs   (exit code 1 on any failure)
*/
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const B = new URL("../../", import.meta.url).pathname.replace(/\/$/, "");
process.env.MONGO_URI = "mongodb://x/x";
process.env.JWT_SECRET = "0123456789012345678901234567890123456789";
process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "x";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.CASHFREE_APP_ID = "TEST_APP"; process.env.CASHFREE_SECRET_KEY = "cfsk_test_secret"; process.env.CASHFREE_ENV = "sandbox";
process.env.ARENA_PAYMENT_GATEWAY = "cashfree";
process.env.RESEND_API_KEY = "";               // tests must never use the real Resend key from .env (dotenv will not override a set variable)

const { MongoMemoryReplSet } = await import("mongodb-memory-server");
const mongoose = (await import(`${B}/node_modules/mongoose/index.js`)).default;

const repl = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
await mongoose.connect(repl.getUri(), { dbName: "t" });

const m = async (p) => (await import(`${B}/${p}`)).default;
const User = await m("models/User.js");
const Profile = await m("models/arena/ArenaProfile.js");
const Entry = await m("models/arena/ArenaEntry.js");
const Request = await m("models/arena/ArenaRequest.js");
const Match = await m("models/arena/ArenaMatch.js");
const Coupon = await m("models/arena/ArenaCoupon.js");
const Redemption = await m("models/arena/ArenaCouponRedemption.js");
const { acceptRequest, endMatch } = await import(`${B}/services/arena/matchService.js`);
const { reserveCoupon, releaseCoupon, findValidCoupon } = await import(`${B}/services/arena/coupons.js`);
const { markEntryPaid, expireEntry } = await import(`${B}/services/arena/entryService.js`);
const { generateAlias } = await import(`${B}/services/arena/privacy.js`);

for (const M of [User, Profile, Entry, Request, Match, Coupon, Redemption]) await M.syncIndexes();

let n = 0;
const makeMember = async (name, { paid = true, matches = 1 } = {}) => {
  n += 1;
  const user = await User.create({
    name, email: `${name.toLowerCase()}${n}@t.com`, mobile: `98765${String(10000 + n)}`,
    password: "x".repeat(20), mustChangePassword: false,
  });
  const profile = await Profile.create({
    user: user._id, alias: generateAlias(), realName: name, topics: ["HLD"], level: "intermediate", companyName: `${name} Corp`, designation: "Engineer",
    skills: ["kafka"], availability: ["weekday_evening"], companyType: "product",
  });
  if (paid) {
    const entry = await Entry.create({
      user: user._id, profile: profile._id, listPricePaise: 29900, paidPaise: 29900, matchesAllowed: matches,
      cancellationFeePercent: 10, payment: { gateway: "cashfree", orderId: `order_${n}` },
    });
    await markEntryPaid({ entryId: entry._id, paymentId: `pay_${n}` });
  }
  return { user, profile: await Profile.findById(profile._id) };
};
const sendReq = (from, to) =>
  Request.create({ from: from.profile._id, to: to.profile._id, fromUser: from.user._id, toUser: to.user._id, expiresAt: new Date(Date.now() + 864e5) });

const results = [];
const t = async (name, fn) => {
  try { await fn(); results.push(["PASS", name]); } catch (e) { results.push(["FAIL", name, e.message]); }
};

await t("markEntryPaid activates profile exactly once (idempotent)", async () => {
  const a = await makeMember("Ann");
  assert.equal(a.profile.status, "active");
  const entryId = a.profile.entry;
  const again = await markEntryPaid({ entryId });
  assert.equal(again.transitioned, false);
});

await t("one open entry per user (unique partial index)", async () => {
  const a = await makeMember("Bob", { paid: false });
  await Entry.create({ user: a.user._id, profile: a.profile._id, listPricePaise: 1, paidPaise: 1, cancellationFeePercent: 10 });
  await assert.rejects(Entry.create({ user: a.user._id, profile: a.profile._id, listPricePaise: 1, paidPaise: 1, cancellationFeePercent: 10 }), /E11000/);
});

await t("accept creates match, consumes entries, cancels other requests", async () => {
  const a = await makeMember("Cy"), b = await makeMember("Di"), c = await makeMember("Ed");
  const r1 = await sendReq(a, b);
  const r2 = await sendReq(c, b);          // competing request to b
  const r3 = await sendReq(a, c);          // a's other outgoing
  const match = await acceptRequest({ requestId: r1._id, userId: b.user._id });
  assert.equal(match.status, "active");
  const [pa, pb] = await Promise.all([Profile.findById(a.profile._id), Profile.findById(b.profile._id)]);
  assert.equal(pa.status, "matched"); assert.equal(pb.status, "matched");
  assert.equal((await Entry.findById(pa.entry)).status, "in_match");   // spends one of the entry's included matches
  assert.equal((await Request.findById(r2._id)).status, "cancelled");
  assert.equal((await Request.findById(r3._id)).status, "cancelled");
  assert.equal((await Request.findById(r1._id)).status, "accepted");
});

await t("RACE: b accepts two requests at once → exactly one match", async () => {
  const a = await makeMember("Fay"), b = await makeMember("Gus"), c = await makeMember("Hal");
  const r1 = await sendReq(a, b), r2 = await sendReq(c, b);
  const settled = await Promise.allSettled([
    acceptRequest({ requestId: r1._id, userId: b.user._id }),
    acceptRequest({ requestId: r2._id, userId: b.user._id }),
  ]);
  const ok = settled.filter((s) => s.status === "fulfilled").length;
  assert.equal(ok, 1, JSON.stringify(settled.map((s) => s.status)));
  assert.equal(await Match.countDocuments({ users: b.user._id, status: "active" }), 1);
  // the loser's profile must be untouched
  const losers = await Profile.find({ _id: { $in: [a.profile._id, c.profile._id] }, status: "active" });
  assert.equal(losers.length, 1);
});

await t("RACE: two people accept requests involving the same third member", async () => {
  const a = await makeMember("Ivy"), b = await makeMember("Jon"), c = await makeMember("Kim");
  const r1 = await sendReq(a, b), r2 = await sendReq(a, c);
  const settled = await Promise.allSettled([
    acceptRequest({ requestId: r1._id, userId: b.user._id }),
    acceptRequest({ requestId: r2._id, userId: c.user._id }),
  ]);
  assert.equal(settled.filter((s) => s.status === "fulfilled").length, 1);
  assert.equal(await Match.countDocuments({ users: a.user._id, status: "active" }), 1);
});

await t("matched member cannot accept (profile no longer active)", async () => {
  const a = await makeMember("Lee"), b = await makeMember("Max"), c = await makeMember("Nia");
  const r1 = await sendReq(a, b);
  await acceptRequest({ requestId: r1._id, userId: b.user._id });
  const r2 = await Request.create({ from: c.profile._id, to: b.profile._id, fromUser: c.user._id, toUser: b.user._id, expiresAt: new Date(Date.now() + 1e5) });
  await assert.rejects(acceptRequest({ requestId: r2._id, userId: b.user._id }), /no longer available/);
});

await t("expired request cannot be accepted", async () => {
  const a = await makeMember("Oz"), b = await makeMember("Pat");
  const r = await Request.create({ from: a.profile._id, to: b.profile._id, fromUser: a.user._id, toUser: b.user._id, expiresAt: new Date(Date.now() - 1000) });
  await assert.rejects(acceptRequest({ requestId: r._id, userId: b.user._id }), /no longer available/);
});

await t("only the recipient can accept", async () => {
  const a = await makeMember("Quin"), b = await makeMember("Rae");
  const r = await sendReq(a, b);
  await assert.rejects(acceptRequest({ requestId: r._id, userId: a.user._id }), /no longer available/);
});

await t("user_ended: both back to draft (must pay again)", async () => {
  const a = await makeMember("Sid"), b = await makeMember("Tia");
  const match = await acceptRequest({ requestId: (await sendReq(a, b))._id, userId: b.user._id });
  await endMatch({ matchId: match._id, byUserId: a.user._id, reason: "user_ended" });
  for (const x of [a, b]) {
    const p = await Profile.findById(x.profile._id);
    assert.equal(p.status, "draft"); assert.equal(p.entry, null);
  }
  assert.equal((await Match.findById(match._id)).status, "ended");
});

await t("admin dissolve restores the innocent member's entry", async () => {
  const a = await makeMember("Uma"), b = await makeMember("Vic");
  const match = await acceptRequest({ requestId: (await sendReq(a, b))._id, userId: b.user._id });
  await endMatch({ matchId: match._id, byUserId: null, reason: "suspended", restoreProfileIds: [b.profile._id] });
  const pb = await Profile.findById(b.profile._id), pa = await Profile.findById(a.profile._id);
  assert.equal(pb.status, "active");
  assert.equal((await Entry.findById(pb.entry)).status, "paid");
  assert.equal(pa.status, "draft");
});

await t("ending an already-ended match is a no-op", async () => {
  const a = await makeMember("Wes"), b = await makeMember("Xan");
  const match = await acceptRequest({ requestId: (await sendReq(a, b))._id, userId: b.user._id });
  await endMatch({ matchId: match._id, byUserId: a.user._id, reason: "user_ended" });
  assert.equal(await endMatch({ matchId: match._id, byUserId: a.user._id, reason: "user_ended" }), null);
});

await t("duplicate pending request between same pair rejected", async () => {
  const a = await makeMember("Yan"), b = await makeMember("Zed");
  await sendReq(a, b);
  await assert.rejects(sendReq(a, b), /E11000/);
});

await t("COUPON: usageLimit=3 with 8 concurrent reservations → exactly 3 succeed", async () => {
  const coupon = await Coupon.create({ code: "RACE3", discountType: "FIXED", discountValue: 5000, usageLimit: 3 });
  const people = [];
  for (let i = 0; i < 8; i++) people.push(await makeMember(`C${i}`, { paid: false }));
  const entries = await Promise.all(people.map((p) =>
    Entry.create({ user: p.user._id, profile: p.profile._id, listPricePaise: 29900, paidPaise: 24900, discountPaise: 5000, cancellationFeePercent: 10 })));
  const settled = await Promise.allSettled(entries.map((e, i) =>
    reserveCoupon({ coupon, userId: people[i].user._id, entryId: e._id, discountPaise: 5000 })));
  assert.equal(settled.filter((s) => s.status === "fulfilled").length, 3);
  assert.equal((await Coupon.findById(coupon._id)).usedCount, 3);
});

await t("COUPON: release is idempotent and frees a use; per-user limit enforced", async () => {
  const coupon = await Coupon.create({ code: "ONCE", discountType: "PERCENTAGE", discountValue: 50, perUserLimit: 1 });
  const a = await makeMember("Dana", { paid: false });
  const e = await Entry.create({ user: a.user._id, profile: a.profile._id, listPricePaise: 29900, paidPaise: 14950, discountPaise: 14950, cancellationFeePercent: 10 });
  await reserveCoupon({ coupon, userId: a.user._id, entryId: e._id, discountPaise: 14950 });
  await assert.rejects(findValidCoupon("once", a.user._id), /already used/);
  await expireEntry(e._id);
  await releaseCoupon(e._id);                       // second release must not double-decrement
  assert.equal((await Coupon.findById(coupon._id)).usedCount, 0);
  await findValidCoupon("once", a.user._id);        // usable again
});

await t("COUPON: expired / inactive / not-started rejected", async () => {
  const u = (await makeMember("Eve", { paid: false })).user._id;
  await Coupon.create({ code: "OLD", discountType: "FIXED", discountValue: 100, validUntil: new Date(Date.now() - 1000) });
  await Coupon.create({ code: "OFF", discountType: "FIXED", discountValue: 100, active: false });
  await Coupon.create({ code: "SOON", discountType: "FIXED", discountValue: 100, validFrom: new Date(Date.now() + 1e6) });
  await assert.rejects(findValidCoupon("OLD", u), /expired/);
  await assert.rejects(findValidCoupon("OFF", u), /not valid/);
  await assert.rejects(findValidCoupon("SOON", u), /not active yet/);
});


/* ===================== PAYMENT GATE + CASHFREE ADAPTER ===================== */
const axios = (await import(`${B}/node_modules/axios/index.js`)).default;
const ctl = await import(`${B}/controllers/arena/memberController.js`);
const pay = await import(`${B}/controllers/arena/paymentController.js`);
const Settings = await import(`${B}/models/arena/ArenaSettings.js`);
const ArenaProfile2 = Profile;

const call = async (handler, { user, body = {}, query = {}, params = {} }) => {
  const res = { code: 200, body: null, headers: {}, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; }, set() { return this; }, setHeader(k, v) { this.headers[k] = v; }, send(b) { this.body = b; return this; } };
  await handler({ user: { id: String(user._id) }, body, query, params, get: () => "test-agent", ip: "127.0.0.1" }, res);
  return res;
};

let cfCalls = [];
let cfMode = "ok";
axios.defaults.adapter = async (config) => {
  cfCalls.push({ method: config.method, url: config.url, data: config.data ? JSON.parse(config.data) : null, headers: config.headers });
  const reply = (data, status = 200) => ({ data, status, statusText: "OK", headers: {}, config });
  if (cfMode === "401") { const e = new Error("Request failed with status code 401"); e.response = { status: 401, data: { message: "authentication failed" } }; throw e; }
  if (config.method === "post" && config.url.endsWith("/orders")) return reply({ payment_session_id: "session_abc", order_id: JSON.parse(config.data).order_id });
  if (config.method === "get" && config.url.endsWith("/payments")) return reply([{ payment_status: "SUCCESS", cf_payment_id: 555 }]);
  if (config.method === "get" && /\/orders\/[^/]+$/.test(config.url)) {
    const amount = JSON.parse(JSON.stringify(cfCalls.findLast((c) => c.method === "post" && c.url.endsWith("/orders")).data.order_amount));
    return reply({ order_status: cfMode === "unpaid" ? "ACTIVE" : "PAID", order_amount: amount });
  }
  if (config.method === "post" && config.url.endsWith("/refunds")) return reply({ cf_refund_id: "rf_123" });
  throw new Error("unmocked " + config.method + " " + config.url);
};

const draftMember = async (name) => makeMember(name, { paid: false });

await t("GATE: unpaid member cannot browse or list requests (402)", async () => {
  const u = await draftMember("Gate1");
  await makeMember("Visible1");                       // someone is in the arena
  const r1 = await call(ctl.browse, { user: u.user });
  assert.equal(r1.code, 402); assert.equal(r1.body.code, "ENTRY_REQUIRED");
  assert.equal(JSON.stringify(r1.body).includes("Member-"), false);   // nothing leaked
  const r2 = await call(ctl.listRequests, { user: u.user, query: { box: "incoming" } });
  assert.equal(r2.code, 402);
});

await t("GATE: unpaid member cannot send requests, block or report", async () => {
  const u = await draftMember("Gate2"); const v = await makeMember("Visible2");
  assert.equal((await call(ctl.sendRequest, { user: u.user, body: { toProfileId: String(v.profile._id), message: "hi" } })).code, 402);
  assert.equal((await call(ctl.block, { user: u.user, body: { profileId: String(v.profile._id) } })).code, 402);
  assert.equal((await call(ctl.report, { user: u.user, body: { profileId: String(v.profile._id), reason: "spam" } })).code, 402);
});

await t("GATE: paid member can browse and sees only anonymous fields", async () => {
  const me = await makeMember("Paid1"); await makeMember("Other1");
  const r = await call(ctl.browse, { user: me.user });
  assert.equal(r.code, 200); assert.ok(r.body.data.items.length >= 1);
  const json = JSON.stringify(r.body);
  for (const secret of ["realName", "other1", "contact", "@t.com", "9876"]) assert.equal(json.toLowerCase().includes(secret.toLowerCase().replace("other1","other1@")), false, secret);
  assert.equal(/"realName"/.test(json), false);
});

await t("PII: request message with contact info is rejected", async () => {
  const a = await makeMember("Pii1"), b = await makeMember("Pii2");
  for (const message of ["ping me on whatsapp 9876543210", "gmail dot com", "t.me/abc", "my name is Raj"]) {
    const r = await call(ctl.sendRequest, { user: a.user, body: { toProfileId: String(b.profile._id), message } });
    assert.equal(r.code, 400, message);
  }
  const ok = await call(ctl.sendRequest, { user: a.user, body: { toProfileId: String(b.profile._id), message: "Hi! Also prepping HLD, evenings work for me." } });
  assert.equal(ok.code, 201);
});

await t("PAY: checkout → Cashfree order payload, session returned, entry linked", async () => {
  const u = await draftMember("Pay1"); cfCalls = []; cfMode = "ok";
  const r = await call(pay.checkout, { user: u.user, body: {} });
  assert.equal(r.code, 200, JSON.stringify(r.body));
  assert.equal(r.body.data.checkout.gateway, "cashfree");
  assert.equal(r.body.data.checkout.paymentSessionId, "session_abc");
  const order = cfCalls.find((c) => c.url.endsWith("/orders")).data;
  assert.equal(order.order_amount, 299); assert.equal(order.order_currency, "INR");
  assert.match(order.order_meta.return_url, /\/prep-buddy\/app\/join\?order_id=\{order_id\}$/);
  assert.match(order.customer_details.customer_phone, /^\d{10}$/);
  const e = await Entry.findOne({ user: u.user._id });
  assert.equal(e.payment.gateway, "cashfree"); assert.equal(e.payment.orderId, order.order_id);
  assert.equal(e.status, "pending_payment");
  assert.equal(cfCalls[0].headers["x-client-secret"], "cfsk_test_secret");
});

await t("PAY: verify before paying → 202 processing, still not in arena", async () => {
  const u = await draftMember("Pay2"); cfMode = "ok";
  const c = await call(pay.checkout, { user: u.user, body: {} });
  cfMode = "unpaid";
  const v = await call(pay.verifyPayment, { user: u.user, body: { orderId: c.body.data.orderId } });
  assert.equal(v.code, 202);
  assert.equal((await Profile.findById(u.profile._id)).status, "draft");
});

await t("PAY: verify after PAID → active; repeat is idempotent; another user can't verify it", async () => {
  const u = await draftMember("Pay3"), other = await draftMember("Pay3b"); cfMode = "ok";
  const c = await call(pay.checkout, { user: u.user, body: {} });
  const orderId = c.body.data.orderId;
  assert.equal((await call(pay.verifyPayment, { user: other.user, body: { orderId } })).code, 404);
  const v = await call(pay.verifyPayment, { user: u.user, body: { orderId } });
  assert.equal(v.code, 200); assert.equal(v.body.data.status, "paid");
  const p = await Profile.findById(u.profile._id);
  assert.equal(p.status, "active");
  assert.equal((await Entry.findById(p.entry)).payment.paymentId, "555");
  assert.equal((await call(pay.verifyPayment, { user: u.user, body: { orderId } })).code, 200);
  assert.equal((await call(pay.checkout, { user: u.user, body: {} })).code, 409);           // already in arena
});

await t("PAY: forged amount (gateway says different amount) is rejected", async () => {
  const u = await draftMember("Pay4"); cfMode = "ok";
  const c = await call(pay.checkout, { user: u.user, body: {} });
  const real = axios.defaults.adapter;
  axios.defaults.adapter = async (cfg) => (/\/orders\/[^/]+$/.test(cfg.url) && cfg.method === "get" ? { data: { order_status: "PAID", order_amount: 1 }, status: 200, statusText: "OK", headers: {}, config: cfg } : real(cfg));
  const v = await call(pay.verifyPayment, { user: u.user, body: { orderId: c.body.data.orderId } });
  axios.defaults.adapter = real;
  assert.equal(v.code, 400); assert.equal((await Profile.findById(u.profile._id)).status, "draft");
});

await t("PAY: gateway 401 → safe generic message, no secrets, coupon + entry released", async () => {
  const u = await draftMember("Pay5");
  await Coupon.create({ code: "HALF", discountType: "PERCENTAGE", discountValue: 50, usageLimit: 5 });
  cfMode = "401";
  const origErr = console.error; let logged = ""; console.error = (...a) => { logged += a.join(" "); };
  const r = await call(pay.checkout, { user: u.user, body: { couponCode: "half" } });
  console.error = origErr; cfMode = "ok";
  assert.equal(r.code, 503); assert.equal(r.body.code, "PAYMENT_UNAVAILABLE");
  assert.ok(!JSON.stringify(r.body).includes("cfsk") && !JSON.stringify(r.body).includes("401"));
  assert.match(logged, /rejected our credentials/);
  assert.ok(!logged.includes("cfsk_test_secret"));
  assert.equal((await Coupon.findOne({ code: "HALF" })).usedCount, 0);         // reservation released
  assert.equal((await Entry.findOne({ user: u.user._id, status: "expired" })) !== null, true);
  const retry = await call(pay.checkout, { user: u.user, body: {} });             // can try again
  assert.equal(retry.code, 200);
});

await t("PAY: 100% coupon skips the gateway and activates the member", async () => {
  const u = await draftMember("Pay6");
  await Coupon.create({ code: "FREE100", discountType: "PERCENTAGE", discountValue: 100 });
  cfCalls = [];
  const r = await call(pay.checkout, { user: u.user, body: { couponCode: "FREE100" } });
  assert.equal(r.body.data.free, true); assert.equal(cfCalls.length, 0);
  assert.equal((await Profile.findById(u.profile._id)).status, "active");
});

await t("CANCEL: refund = paid − 10% fee, sent to Cashfree, member back to draft", async () => {
  const u = await draftMember("Pay7"); cfMode = "ok";
  const c = await call(pay.checkout, { user: u.user, body: {} });
  await call(pay.verifyPayment, { user: u.user, body: { orderId: c.body.data.orderId } });
  cfCalls = [];
  const r = await call(pay.cancelEntry, { user: u.user });
  assert.equal(r.code, 200, JSON.stringify(r.body));
  assert.deepEqual([r.body.data.feePaise, r.body.data.refundPaise], [2990, 26910]);
  const refund = cfCalls.find((x) => x.url.endsWith("/refunds")).data;
  assert.equal(refund.refund_amount, 269.1); assert.match(refund.refund_id, /^RF_/);
  assert.equal((await Profile.findById(u.profile._id)).status, "draft");
  assert.equal((await Call_second(u)).code, 409);                                // can't cancel twice
});
async function Call_second(u) { return call(pay.cancelEntry, { user: u.user }); }

await t("CANCEL: refund failure restores entry so member can retry (no double refund)", async () => {
  const u = await draftMember("Pay8"); cfMode = "ok";
  const c = await call(pay.checkout, { user: u.user, body: {} });
  await call(pay.verifyPayment, { user: u.user, body: { orderId: c.body.data.orderId } });
  cfMode = "401"; const origErr = console.error; console.error = () => {};
  const r = await call(pay.cancelEntry, { user: u.user });
  console.error = origErr; cfMode = "ok";
  assert.equal(r.code, 502);
  assert.equal((await Entry.findOne({ user: u.user._id, status: "paid" })) !== null, true);
  assert.equal((await Profile.findById(u.profile._id)).status, "active");
  assert.equal((await call(pay.cancelEntry, { user: u.user })).code, 200);
});

await t("CANCEL: fee is the one shown at payment, even if admin changes it later", async () => {
  const u = await draftMember("Pay9"); cfMode = "ok";
  const c = await call(pay.checkout, { user: u.user, body: {} });
  await call(pay.verifyPayment, { user: u.user, body: { orderId: c.body.data.orderId } });
  await Settings.default.updateOne({ key: "global" }, { $set: { cancellationFeePercent: 50 } }); Settings.invalidateArenaSettingsCache();
  const r = await call(pay.cancelEntry, { user: u.user });
  assert.equal(r.body.data.feePaise, 2990);                         // still 10%
  const next = await draftMember("Pay9b");                           // new buyers see the new fee
  const c2 = await call(pay.checkout, { user: next.user, body: {} });
  assert.equal((await Entry.findOne({ user: next.user._id })).cancellationFeePercent, 50);
  await Settings.default.updateOne({ key: "global" }, { $set: { cancellationFeePercent: 10 } }); Settings.invalidateArenaSettingsCache();
});

await t("ADMIN PRICE: changing entry price changes the next checkout amount", async () => {
  await Settings.default.updateOne({ key: "global" }, { $set: { entryPricePaise: 49900 } }); Settings.invalidateArenaSettingsCache();
  const u = await draftMember("Pay10"); cfCalls = []; cfMode = "ok";
  await call(pay.checkout, { user: u.user, body: {} });
  assert.equal(cfCalls.find((c) => c.url.endsWith("/orders")).data.order_amount, 499);
  await Settings.default.updateOne({ key: "global" }, { $set: { entryPricePaise: 29900 } }); Settings.invalidateArenaSettingsCache();
});


/* ===================== MULTI-MATCH ENTRIES, PUBLIC COMPANY, BUGS ===================== */
const Bug = await m("models/arena/ArenaBugReport.js");
const stateOf = async (x) => { const p = await Profile.findById(x.profile._id); const e = p.entry ? await Entry.findById(p.entry) : null; return { profile: p.status, entry: e?.status ?? null, used: e?.matchesUsed ?? null }; };
const reqTo = async (a, b) => (await sendReq(a, b))._id;

await t("MULTI: entry with 2 matches → after 1st ends, member is back in the arena (entry alive)", async () => {
  const a = await makeMember("Mm1", { matches: 2 }), b = await makeMember("Mm2"), c = await makeMember("Mm3");
  const match1 = await acceptRequest({ requestId: await reqTo(b, a), userId: a.user._id });
  assert.deepEqual(await stateOf(a), { profile: "matched", entry: "in_match", used: 1 });
  await endMatch({ matchId: match1._id, byUserId: a.user._id, reason: "user_ended" });
  assert.deepEqual(await stateOf(a), { profile: "active", entry: "paid", used: 1 });   // 1 of 2 used, still in arena
  assert.equal((await stateOf(b)).profile, "draft");                                     // b had only 1 → needs new entry
  // second partnership, one after the other
  const match2 = await acceptRequest({ requestId: await reqTo(c, a), userId: a.user._id });
  assert.deepEqual(await stateOf(a), { profile: "matched", entry: "in_match", used: 2 });
  await endMatch({ matchId: match2._id, byUserId: a.user._id, reason: "user_ended" });
  assert.deepEqual(await stateOf(a), { profile: "draft", entry: null, used: null });     // both matches used
});

await t("MULTI: never two buddies at once (still one active match)", async () => {
  const a = await makeMember("Mm4", { matches: 3 }), b = await makeMember("Mm5"), c = await makeMember("Mm6");
  await acceptRequest({ requestId: await reqTo(b, a), userId: a.user._id });
  const r = await sendReq(c, a);
  await assert.rejects(acceptRequest({ requestId: r._id, userId: a.user._id }), /no longer available/);
  assert.equal(await Match.countDocuments({ users: a.user._id, status: "active" }), 1);
});

await t("MULTI: same two people cannot be re-paired; browse hides past buddies", async () => {
  const a = await makeMember("Mm7", { matches: 2 }), b = await makeMember("Mm8", { matches: 2 });
  const mt = await acceptRequest({ requestId: await reqTo(b, a), userId: a.user._id });
  await endMatch({ matchId: mt._id, byUserId: a.user._id, reason: "user_ended" });
  assert.equal((await stateOf(a)).profile, "active"); assert.equal((await stateOf(b)).profile, "active");
  const r = await sendReq(b, a);
  await assert.rejects(acceptRequest({ requestId: r._id, userId: a.user._id }), /already been matched/);
  const send = await call(ctl.sendRequest, { user: b.user, body: { toProfileId: String(a.profile._id), message: "hi again" } });
  assert.equal(send.code, 409); assert.equal(send.body.code, "PREVIOUS_BUDDY");
  const browse = await call(ctl.browse, { user: a.user });
  assert.ok(!browse.body.data.items.some((x) => x.id === String(b.profile._id)), "past buddy must be hidden");
});

await t("MULTI: cannot cancel/refund once a match was used", async () => {
  const a = await makeMember("Mm9", { matches: 2 }), b = await makeMember("Mm10");
  const mt = await acceptRequest({ requestId: await reqTo(b, a), userId: a.user._id });
  await endMatch({ matchId: mt._id, byUserId: a.user._id, reason: "user_ended" });
  assert.equal((await stateOf(a)).profile, "active");
  const r = await call(pay.cancelEntry, { user: a.user });
  assert.equal(r.code, 409); assert.equal(r.body.code, "MATCH_ALREADY_USED");
  assert.equal((await call(pay.cancelPreview, { user: a.user })).body.code, "MATCH_ALREADY_USED");
});

await t("MULTI: admin dissolve restores innocent member's used match", async () => {
  const a = await makeMember("Mm11", { matches: 2 }), b = await makeMember("Mm12", { matches: 2 });
  const mt = await acceptRequest({ requestId: await reqTo(b, a), userId: a.user._id });
  await endMatch({ matchId: mt._id, byUserId: null, reason: "admin_dissolved", restoreProfileIds: [a.profile._id] });
  assert.deepEqual(await stateOf(a), { profile: "active", entry: "paid", used: 0 });   // not counted against a
  assert.deepEqual(await stateOf(b), { profile: "active", entry: "paid", used: 1 });
});

await t("ADMIN: matchesPerEntry is snapshotted at checkout (later changes don't alter it)", async () => {
  await Settings.default.updateOne({ key: "global" }, { $set: { matchesPerEntry: 2 } }); Settings.invalidateArenaSettingsCache();
  const u = await draftMember("Snap1"); cfMode = "ok";
  await call(pay.checkout, { user: u.user, body: {} });
  await Settings.default.updateOne({ key: "global" }, { $set: { matchesPerEntry: 4 } }); Settings.invalidateArenaSettingsCache();
  assert.equal((await Entry.findOne({ user: u.user._id })).matchesAllowed, 2);
  const u2 = await draftMember("Snap2"); await call(pay.checkout, { user: u2.user, body: {} });
  assert.equal((await Entry.findOne({ user: u2.user._id })).matchesAllowed, 4);
  await Settings.default.updateOne({ key: "global" }, { $set: { matchesPerEntry: 1 } }); Settings.invalidateArenaSettingsCache();
});

await t("PROFILE: multiple topics + new fields saved; company & role are PUBLIC in the arena", async () => {
  const u = await User.create({ name: "Tina Roy", email: "tina@t.com", mobile: "9812345678", password: "x".repeat(20), mustChangePassword: false });
  const body = { topics: ["HLD", "LLD", "GENAI"], level: "advanced", skills: ["Kafka", "redis", "kafka"], yearsExperience: 6, companyType: "product",
    companyName: "Observe.AI", designation: "Senior Backend Engineer", targetCompanies: ["Google", "Amazon", "Google"],
    languages: ["english", "hindi"], sessionsPerWeek: 3, sessionModes: ["voice", "video"], buddyPreference: "similar_level", timeline: "within_3_months",
    availability: ["weekend_morning"], bio: "Strong on APIs.", goal: "Weekly HLD mocks", contact: {} };
  const r = await call(ctl.upsertProfile, { user: u, body });
  assert.equal(r.code, 200, JSON.stringify(r.body));
  const p = await Profile.findOne({ user: u._id });
  assert.deepEqual([...p.topics], ["HLD", "LLD", "GENAI"]);
  assert.deepEqual([...p.skills], ["kafka", "redis"]);              // lower-cased + de-duplicated
  assert.deepEqual([...p.targetCompanies], ["Google", "Amazon"]);
  assert.equal(p.companyName, "Observe.AI");                        // legit company with a domain-like name
  assert.equal(p.sessionsPerWeek, 3);
  // another paid member browsing sees company + role, but never the real name/contact
  const viewer = await makeMember("Viewer1");
  p.status = "active"; p.activatedAt = new Date(); await p.save();
  const browse = await call(ctl.browse, { user: viewer.user });
  const card = browse.body.data.items.find((x) => x.alias === p.alias);
  assert.ok(card, "tina should be visible");
  assert.equal(card.companyName, "Observe.AI"); assert.equal(card.designation, "Senior Backend Engineer");
  assert.deepEqual(card.topics, ["HLD", "LLD", "GENAI"]);
  assert.equal(JSON.stringify(card).includes("Tina"), false); assert.equal(JSON.stringify(card).includes("tina@t.com"), false);
  assert.equal(JSON.stringify(card).includes("9812345678"), false);
});

await t("PROFILE: contact details in company / role / target companies are rejected; no topics rejected", async () => {
  const u = await User.create({ name: "Uma Jain", email: "uma@t.com", mobile: "9812345679", password: "x".repeat(20), mustChangePassword: false });
  const base = { topics: ["DSA"], level: "beginner", skills: ["java"], yearsExperience: 1, companyType: "student", availability: ["weekday_evening"], bio: "", goal: "", contact: {} };
  for (const bad of [{ companyName: "Acme, mail uma@acme.com" }, { designation: "call 9876543210" }, { targetCompanies: ["@uma_dev"] }, { companyName: "https://acme.com" }]) {
    assert.equal((await call(ctl.upsertProfile, { user: u, body: { ...base, ...bad } })).code, 400, JSON.stringify(bad));
  }
  assert.equal((await call(ctl.upsertProfile, { user: u, body: { ...base, topics: [] } })).code, 400);
  assert.equal((await call(ctl.upsertProfile, { user: u, body: { ...base, companyName: "Zoho Corporation" } })).code, 200);
});

await t("BROWSE: topic filter matches profiles with that topic among several", async () => {
  const me = await makeMember("Flt1");
  const other = await makeMember("Flt2");
  await Profile.updateOne({ _id: other.profile._id }, { $set: { topics: ["LLD", "GENAI"], languages: ["tamil"] } });
  const hit = await call(ctl.browse, { user: me.user, query: { topic: "GENAI" } });
  assert.ok(hit.body.data.items.some((x) => x.id === String(other.profile._id)));
  const miss = await call(ctl.browse, { user: me.user, query: { topic: "JAVA" } });
  assert.ok(!miss.body.data.items.some((x) => x.id === String(other.profile._id)));
  const lang = await call(ctl.browse, { user: me.user, query: { language: "tamil" } });
  assert.ok(lang.body.data.items.some((x) => x.id === String(other.profile._id)));
});

await t("BUGS: user can report; validation; daily cap of 5; admin can triage", async () => {
  const admin = await import(`${B}/controllers/arena/adminController.js`);
  const u = await draftMember("Bug1");   // unpaid users may report bugs too
  const good = { category: "payment", severity: "high", title: "Payment page stuck", description: "After paying, the page stays on loading for a long time.", stepsToReproduce: "1. pay 2. wait", pageUrl: "/prep-buddy/app/join" };
  assert.equal((await call(ctl.reportBug, { user: u.user, body: { ...good, title: "x" } })).code, 400);
  assert.equal((await call(ctl.reportBug, { user: u.user, body: { ...good, category: "nope" } })).code, 400);
  const first = await call(ctl.reportBug, { user: u.user, body: good });
  assert.equal(first.code, 201);
  for (let i = 0; i < 4; i++) assert.equal((await call(ctl.reportBug, { user: u.user, body: { ...good, title: `Bug number ${i}` } })).code, 201);
  const sixth = await call(ctl.reportBug, { user: u.user, body: good });
  assert.equal(sixth.code, 429); assert.equal(sixth.body.code, "BUG_LIMIT");
  const mine = await call(ctl.myBugs, { user: u.user });
  assert.equal(mine.body.data.length, 5);
  const adm = await User.create({ name: "Adm", email: "adm@t.com", mobile: "9812345680", password: "x".repeat(20), mustChangePassword: false, role: "admin" });
  const list = await call(admin.listBugs, { user: adm, query: { status: "open" } });
  assert.ok(list.body.data.items.length >= 5); assert.ok(list.body.data.items[0].reporter.email);
  const upd = await call(admin.updateBug, { user: adm, params: { id: first.body.data.id }, body: { status: "resolved", adminNote: "Fixed in v2" } });
  assert.equal(upd.code, 200);
  assert.equal((await Bug.findById(first.body.data.id)).status, "resolved");
  assert.equal((await call(ctl.myBugs, { user: u.user })).body.data.find((b) => b.id === first.body.data.id).adminNote, "Fixed in v2");
});


await t("PUBLIC INFO: exposes admin rules + one headline count only, and no member data or stats", async () => {
  await Settings.default.updateOne({ key: "global" }, { $set: { matchesPerEntry: 3, requestExpiryDays: 9, maxOutgoingRequests: 7, minMatchDaysBeforeEnd: 2, cancellationFeePercent: 15, entryPricePaise: 39900 } }); Settings.invalidateArenaSettingsCache();
  const before = await Profile.countDocuments({ status: "active" });
  const a = await makeMember("Pub1"), b = await makeMember("Pub2"), c = await makeMember("Pub3");
  await acceptRequest({ requestId: await reqTo(b, a), userId: a.user._id });           // a,b matched; c stays active
  const r = await call(ctl.publicInfo, { user: a.user });
  const d = r.body.data;
  assert.equal(r.code, 200);
  assert.equal(d.activeMembers, before + 1);
  assert.deepEqual([d.matchesPerEntry, d.requestExpiryDays, d.maxOutgoingRequests, d.minMatchDaysBeforeEnd, d.cancellationFeePercent, d.entryPricePaise], [3, 9, 7, 2, 15, 39900]);
  assert.equal(d.paymentGateway, "cashfree");
  assert.ok(d.fields.some((f) => f.key === "companyName" && f.visibility === "public"));
  // nothing beyond the allow-list is exposed publicly
  assert.deepEqual(Object.keys(d).sort(), ["activeMembers", "cancellationFeePercent", "couponsAvailable", "enabled", "entryPricePaise", "fields", "matchesPerEntry", "maxOutgoingRequests", "minMatchDaysBeforeEnd", "paymentGateway", "requestExpiryDays"].sort());
  const { fields: _docs, ...stats } = d;
  const json = JSON.stringify(stats);
  for (const secret of ["Pub1", "Pub2", "Pub3", "@t.com", "9876", "Member-"]) assert.equal(json.includes(secret), false, secret);
  await Settings.default.updateOne({ key: "global" }, { $set: { matchesPerEntry: 1, requestExpiryDays: 14, maxOutgoingRequests: 10, minMatchDaysBeforeEnd: 0, cancellationFeePercent: 10, entryPricePaise: 29900 } }); Settings.invalidateArenaSettingsCache();
});


/* ===================== PAYMENT ACTIVATION + EMAIL POLICY ===================== */
const { healPaidMembers, countNeedingAttention } = await import(`${B}/services/arena/activation.js`);
const { endMatch: endM } = await import(`${B}/services/arena/matchService.js`);

/* capture every "[arena:mail] <subject>" attempt (mail is unconfigured in tests, so each send logs its subject) */
const mailLog = [];
const realErr = console.error;
// mail is fire-and-forget and reads the provider setting from MongoDB first, so wait for it to settle
const captureMail = async (fn) => {
  await new Promise((r) => setTimeout(r, 1200));   // let mail from EARLIER tests finish logging, so it isn't counted here
  mailLog.length = 0;
  console.error = (...a) => { const line = a.join(" "); if (line.startsWith("[arena:mail]")) mailLog.push(line.replace("[arena:mail] ", "").split(" ")[0] + " " + line.split("] ")[1]?.split(" ").slice(0, 6).join(" ")); };
  try { await fn(); await new Promise((r) => setTimeout(r, 1200)); } finally { console.error = realErr; }
  return [...mailLog];
};

const stuckMember = async (name) => {            // entry PAID but profile still DRAFT: the reported bug state
  const a = await makeMember(name, { paid: false });
  const e = await Entry.create({ user: a.user._id, profile: a.profile._id, listPricePaise: 29900, paidPaise: 29900, cancellationFeePercent: 10, status: "paid", paidAt: new Date(), payment: { gateway: "cashfree", orderId: `ARENA_stuck_${n}` } });
  return { ...a, entry: e };
};

await t("STUCK PAYMENT: a paid-but-inactive member is healed the moment they open the arena (/me)", async () => {
  const a = await stuckMember("Stuck1");
  assert.equal((await Profile.findById(a.profile._id)).status, "draft");
  const r = await call(ctl.me, { user: a.user });
  assert.equal(r.body.data.profile.status, "active");
  assert.equal(String((await Profile.findById(a.profile._id)).entry), String(a.entry._id));
});

await t("STUCK PAYMENT: browse works for a stuck member (no 402), and heals them", async () => {
  const a = await stuckMember("Stuck2"); await makeMember("Visible9");
  const r = await call(ctl.browse, { user: a.user });
  assert.equal(r.code, 200, JSON.stringify(r.body));
  assert.equal((await Profile.findById(a.profile._id)).status, "active");
});

await t("STUCK PAYMENT: re-verifying an already-paid order heals instead of just saying 'ok'", async () => {
  const a = await stuckMember("Stuck3");
  const r = await call(pay.verifyPayment, { user: a.user, body: { orderId: a.entry.payment.orderId } });
  assert.equal(r.code, 200); assert.equal((await Profile.findById(a.profile._id)).status, "active");
});

await t("STUCK PAYMENT: a stuck member who clicks Pay again is NOT charged twice", async () => {
  const a = await stuckMember("Stuck4"); cfCalls = []; cfMode = "ok";
  const r = await call(pay.checkout, { user: a.user, body: {} });
  assert.equal(r.code, 409); assert.equal(r.body.code, "ALREADY_IN_ARENA");
  assert.equal(cfCalls.length, 0, "must not create a second gateway order");
  assert.equal(await Entry.countDocuments({ user: a.user._id }), 1);
});

await t("STUCK PAYMENT: the periodic/boot sweep repairs everyone at once, admin count reflects it", async () => {
  await stuckMember("Stuck5"); await stuckMember("Stuck6");
  assert.ok((await countNeedingAttention()) >= 2);
  assert.ok((await healPaidMembers()) >= 2);
  assert.equal(await countNeedingAttention(), 0);
});

await t("ATOMIC: if activating the profile fails mid-payment, NOTHING is half-saved (entry stays pending) and a retry succeeds", async () => {
  const u = await draftMember("Atomic1"); cfMode = "ok";
  const c = await call(pay.checkout, { user: u.user, body: {} });
  const entryId = (await Entry.findOne({ user: u.user._id }))._id;
  const real = Profile.updateOne;
  Profile.updateOne = () => { throw new Error("simulated crash between the two writes"); };
  await assert.rejects(markEntryPaid({ entryId, paymentId: "pay_x" }), /simulated crash/);
  Profile.updateOne = real;
  assert.equal((await Entry.findById(entryId)).status, "pending_payment");          // rolled back, not 'paid'
  assert.equal((await Profile.findById(u.profile._id)).status, "draft");
  const retry = await call(pay.verifyPayment, { user: u.user, body: { orderId: c.body.data.orderId } });
  assert.equal(retry.code, 200);
  assert.equal((await Profile.findById(u.profile._id)).status, "active");
  assert.equal((await Entry.findById(entryId)).status, "paid");
});

await t("CONCURRENCY: 8 simultaneous confirmations of the same payment → exactly one transition, member active", async () => {
  const u = await draftMember("Conc1"); cfMode = "ok";
  await call(pay.checkout, { user: u.user, body: {} });
  const entryId = (await Entry.findOne({ user: u.user._id }))._id;
  const results2 = await Promise.allSettled(Array.from({ length: 8 }, () => markEntryPaid({ entryId, paymentId: "pay_c" })));
  assert.equal(results2.filter((r) => r.status === "fulfilled" && r.value.transitioned).length, 1);
  assert.equal(results2.filter((r) => r.status === "rejected").length, 0);
  assert.equal((await Profile.findById(u.profile._id)).status, "active");
});

await t("MID-PAYMENT SUSPENSION: money is recorded, member stays suspended (not silently re-activated)", async () => {
  const u = await draftMember("Susp1"); cfMode = "ok";
  const c = await call(pay.checkout, { user: u.user, body: {} });
  await Profile.updateOne({ _id: u.profile._id }, { $set: { status: "suspended", statusBeforeSuspend: "draft" } });
  await call(pay.verifyPayment, { user: u.user, body: { orderId: c.body.data.orderId } });
  const p = await Profile.findById(u.profile._id);
  assert.equal(p.status, "suspended"); assert.equal((await Entry.findOne({ user: u.user._id })).status, "paid");
});

await t("EMAILS: payment, requests, cancellation and ending a match send NO email", async () => {
  const sent = await captureMail(async () => {
    const a = await draftMember("Mail1"), b = await makeMember("Mail2"); cfMode = "ok";
    const c = await call(pay.checkout, { user: a.user, body: {} });
    await call(pay.verifyPayment, { user: a.user, body: { orderId: c.body.data.orderId } });          // payment
    await call(ctl.sendRequest, { user: a.user, body: { toProfileId: String(b.profile._id), message: "Hi there" } });  // request sent
    const x = await draftMember("Mail3"); const c2 = await call(pay.checkout, { user: x.user, body: {} });
    await call(pay.verifyPayment, { user: x.user, body: { orderId: c2.body.data.orderId } });
    await call(pay.cancelEntry, { user: x.user });                                                    // cancellation (+ refund)
  });
  assert.deepEqual(sent, [], `unexpected emails: ${sent.join(" | ")}`);
});

await t("EMAILS: accepting a request sends the 'matched' email to both members, and ending it sends nothing", async () => {
  const a = await makeMember("Mail4"), b = await makeMember("Mail5");
  const reqId2 = await reqTo(a, b);
  const sent = await captureMail(async () => {
    const match = await acceptRequest({ requestId: reqId2, userId: b.user._id });
    await endM({ matchId: match._id, byUserId: a.user._id, reason: "user_ended" });
  });
  assert.equal(sent.length, 2, `expected 2 matched emails, got: ${sent.join(" | ")}`);
  assert.ok(sent.every((l) => /matched/i.test(l)), sent.join(" | "));
});


/* ===================== ADMIN: requests, chats, matches, payments, deletes, match grants ===================== */
const ops = await import(`${B}/controllers/arena/adminOpsController.js`);
const adminC = await import(`${B}/controllers/arena/adminController.js`);
const AuditLog = await m("models/arena/ArenaAuditLog.js");
const Message = await m("models/arena/ArenaMessage.js");
const Report = await m("models/arena/ArenaReport.js");
const Bug2 = await m("models/arena/ArenaBugReport.js");
const adminUser = await User.create({ name: "Admin Annie", email: "annie@t.com", mobile: "9840000001", password: "x".repeat(20), mustChangePassword: false, role: "admin" });
const auditCount = (action) => AuditLog.countDocuments({ action });

await t("ADMIN REQUESTS: every status with sender, recipient, sent time, answered time and a link to the chat", async () => {
  const a = await makeMember("Ra1"), b = await makeMember("Rb1"), c = await makeMember("Rc1"), d = await makeMember("Rd1");
  const pend = await call(ctl.sendRequest, { user: a.user, body: { toProfileId: String(b.profile._id), message: "pending one" } });
  const rej = await call(ctl.sendRequest, { user: c.user, body: { toProfileId: String(b.profile._id), message: "will be rejected" } });
  await call(ctl.reject, { user: b.user, params: { id: rej.body.data.id } });
  const wd = await call(ctl.sendRequest, { user: d.user, body: { toProfileId: String(b.profile._id), message: "will be withdrawn" } });
  await call(ctl.withdraw, { user: d.user, params: { id: wd.body.data.id } });
  const e = await makeMember("Re1"), f = await makeMember("Rf1");                // separate pair so accepting doesn't cancel the pending one above
  const acc = await call(ctl.sendRequest, { user: e.user, body: { toProfileId: String(f.profile._id), message: "will be accepted" } });
  await call(ctl.accept, { user: f.user, params: { id: acc.body.data.id } });

  const r = await call(ops.listRequests, { user: adminUser, query: { q: "Rb1" } });
  assert.equal(r.code, 200, JSON.stringify(r.body));
  const by = Object.fromEntries(r.body.data.items.map((x) => [x.message, x]));
  assert.equal(by["pending one"].status, "pending"); assert.equal(by["pending one"].respondedAt, null);
  assert.equal(by["will be rejected"].status, "rejected"); assert.ok(by["will be rejected"].respondedAt);
  assert.equal(by["will be withdrawn"].status, "withdrawn"); assert.ok(by["will be withdrawn"].respondedAt);
  for (const x of r.body.data.items) { assert.ok(x.sentAt); assert.ok(x.from.name && x.from.email && x.from.alias); assert.ok(x.to.name && x.to.email); }
  assert.equal(by["pending one"].from.name, "Ra1"); assert.equal(by["pending one"].to.name, "Rb1");
  const all = await call(ops.listRequests, { user: adminUser, query: { q: "Rf1" } });
  const accepted = all.body.data.items.find((x) => x.message === "will be accepted");
  assert.equal(accepted.status, "accepted"); assert.ok(accepted.matchId, "accepted request links to its match"); assert.equal(accepted.from.name, "Re1"); assert.equal(accepted.to.name, "Rf1");
  assert.ok(accepted.respondedAt, "shows when it was accepted"); assert.equal(accepted.matchStatus, "active");
  const onlyRej = await call(ops.listRequests, { user: adminUser, query: { status: "rejected", q: "Rb1" } });
  assert.ok(onlyRej.body.data.items.every((x) => x.status === "rejected") && onlyRej.body.data.items.length >= 1);
  assert.ok(r.body.data.counts.rejected >= 1 && r.body.data.counts.pending >= 1);
});

await t("ADMIN CHAT: admin reads a match's chat with real names; the view is audit-logged; paging doesn't re-log", async () => {
  const a = await makeMember("Ca1"), b = await makeMember("Cb1");
  const mt = await acceptRequest({ requestId: await reqTo(a, b), userId: b.user._id });
  await Message.create([{ match: mt._id, sender: a.user._id, text: "hello Cb1" }, { match: mt._id, sender: b.user._id, text: "hi Ca1, mock tonight?" }, { match: mt._id, sender: a.user._id, text: "yes 8pm" }]);
  const before = await auditCount("chat_viewed");
  const r = await call(ops.matchMessages, { user: adminUser, params: { id: String(mt._id) } });
  assert.equal(r.code, 200); assert.equal(r.body.data.total, 3);
  assert.deepEqual(r.body.data.messages.map((x) => x.text), ["hello Cb1", "hi Ca1, mock tonight?", "yes 8pm"]);   // chronological
  assert.deepEqual(r.body.data.messages.map((x) => x.senderName), ["Ca1", "Cb1", "Ca1"]);
  assert.ok(r.body.data.messages[0].senderAlias.startsWith("Member-"));
  assert.equal(await auditCount("chat_viewed"), before + 1);
  await call(ops.matchMessages, { user: adminUser, params: { id: String(mt._id) }, query: { before: new Date().toISOString() } });
  assert.equal(await auditCount("chat_viewed"), before + 1, "loading older messages must not add another log row");
  assert.equal((await call(ops.matchMessages, { user: adminUser, params: { id: "64b000000000000000000009" } })).code, 404);
});

await t("ADMIN MATCHES: active + ended history, per-member filter, message counts, who ended it", async () => {
  const a = await makeMember("Ma1", { matches: 3 }), b = await makeMember("Mb1"), c = await makeMember("Mc1");
  const m1 = await acceptRequest({ requestId: await reqTo(b, a), userId: a.user._id });
  await Message.create([{ match: m1._id, sender: a.user._id, text: "x" }, { match: m1._id, sender: b.user._id, text: "y" }]);
  await endMatch({ matchId: m1._id, byUserId: b.user._id, reason: "user_ended" });
  const m2 = await acceptRequest({ requestId: await reqTo(c, a), userId: a.user._id });
  const hist = await call(ops.listMatches, { user: adminUser, query: { user: String(a.user._id) } });
  assert.equal(hist.body.data.total, 2);
  const ended = hist.body.data.items.find((x) => x.status === "ended"), live = hist.body.data.items.find((x) => x.status === "active");
  assert.equal(ended.messageCount, 2); assert.equal(ended.endReason, "user_ended"); assert.equal(ended.endedBy.name, "Mb1");
  assert.ok(ended.endedAt && typeof ended.durationDays === "number");
  assert.deepEqual(new Set(ended.members.map((x) => x.name)), new Set(["Ma1", "Mb1"]));
  assert.ok(ended.members.every((x) => x.email));
  assert.equal(live.id, String(m2._id)); assert.equal(live.endedAt, null);
  assert.equal((await call(ops.listMatches, { user: adminUser, query: { user: String(a.user._id), status: "ended" } })).body.data.items.length, 1);
  assert.equal((await call(ops.listMatches, { user: adminUser, query: { q: "Mc1" } })).body.data.items.length >= 1, true);
  assert.ok(hist.body.data.counts.ended >= 1 && hist.body.data.counts.active >= 1);
});

await t("ADMIN DELETE: reports and bugs can be permanently deleted (gone for good, logged, second delete = 404)", async () => {
  const a = await makeMember("Da1"), b = await makeMember("Db1");
  const rep = await Report.create({ reporter: a.user._id, reported: b.user._id, reportedProfile: b.profile._id, reason: "spam", details: "x", status: "dismissed" });
  const before = await auditCount("report_deleted");
  assert.equal((await call(ops.deleteReport, { user: adminUser, params: { id: String(rep._id) } })).code, 200);
  assert.equal(await Report.findById(rep._id), null);
  assert.equal(await auditCount("report_deleted"), before + 1);
  assert.equal((await call(ops.deleteReport, { user: adminUser, params: { id: String(rep._id) } })).code, 404);
  const bug = await call(ctl.reportBug, { user: a.user, body: { category: "chat", severity: "low", title: "Typing glitch", description: "The typing indicator sticks for a while." } });
  const bugId = bug.body.data.id;
  assert.equal((await call(ops.deleteBug, { user: adminUser, params: { id: bugId } })).code, 200);
  assert.equal(await Bug2.findById(bugId), null);
  assert.equal((await call(ctl.myBugs, { user: a.user })).body.data.some((x) => x.id === bugId), false);   // gone for the reporter too
  assert.equal((await call(ops.deleteBug, { user: adminUser, params: { id: bugId } })).code, 404);
});

await t("ADMIN PAYMENTS: ledger rows, totals, filters, date range and a safe CSV export", async () => {
  await Entry.deleteMany({}); await Profile.deleteMany({});
  const p1 = await makeMember("Pa1"), p2 = await makeMember("Pa2");
  await Profile.updateOne({ _id: p2.profile._id }, { $set: { realName: "=cmd|'/c calc'!A1" } });        // hostile name for the CSV formula-injection check
  await User.updateOne({ _id: p2.user._id }, { $set: { name: "=cmd|'/c calc'!A1" } });
  await Entry.updateOne({ user: p1.user._id }, { $set: { paidPaise: 29900, listPricePaise: 29900, "payment.orderId": "ARENA_AAA111", "payment.paymentId": "5551" } });
  await Entry.updateOne({ user: p2.user._id }, { $set: { paidPaise: 14950, discountPaise: 14950, listPricePaise: 29900, coupon: { code: "HALF" }, "payment.orderId": "ARENA_BBB222", status: "cancelled", cancel: { at: new Date(), feePaise: 1495, refundPaise: 13455, refundId: "RF_1" } } });
  await adjustMemberMatchesDirect(adminUser, await draftMember("Pa3"), 2);                  // a complimentary entry (₹0)
  const r = await call(ops.listPayments, { user: adminUser, query: {} });
  assert.equal(r.code, 200, JSON.stringify(r.body));
  const T = r.body.data.totals;
  assert.equal(T.grossPaidPaise, 29900 + 14950); assert.equal(T.refundedPaise, 13455); assert.equal(T.cancellationFeesPaise, 1495);
  assert.equal(T.netPaise, 29900 + 14950 - 13455); assert.equal(T.complimentaryEntries, 1);
  const rowA = r.body.data.items.find((x) => x.orderId === "ARENA_AAA111");
  assert.ok(rowA.member.name === "Pa1" && rowA.member.email && rowA.paymentId === "5551" && rowA.gateway === "cashfree");
  const rowC = r.body.data.items.find((x) => x.complimentary);
  assert.equal(rowC.paidPaise, 0); assert.equal(rowC.gateway, "admin"); assert.equal(rowC.grantedBy, "Admin Annie");
  const f1 = await call(ops.listPayments, { user: adminUser, query: { status: "cancelled" } }); assert.equal(f1.body.data.items.length, 1);
  assert.equal((await call(ops.listPayments, { user: adminUser, query: { q: "BBB222" } })).body.data.items.length, 1);
  assert.equal((await call(ops.listPayments, { user: adminUser, query: { q: "HALF" } })).body.data.items.length, 1);
  assert.equal((await call(ops.listPayments, { user: adminUser, query: { q: "Pa1" } })).body.data.items.length, 1);
  assert.equal((await call(ops.listPayments, { user: adminUser, query: { complimentary: "true" } })).body.data.items.length, 1);
  const today = new Date().toISOString().slice(0, 10), tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  assert.ok((await call(ops.listPayments, { user: adminUser, query: { from: today, to: today } })).body.data.items.length >= 3);
  assert.equal((await call(ops.listPayments, { user: adminUser, query: { from: tomorrow } })).body.data.items.length, 0);
  const before = await auditCount("payments_exported");
  const csv = await call(ops.listPayments, { user: adminUser, query: { format: "csv" } });
  assert.ok(csv.headers["Content-Type"].startsWith("text/csv")); assert.match(csv.headers["Content-Disposition"], /attachment; filename="arena-payments-/);
  assert.ok(csv.body.startsWith("﻿Date,Member,Email,Phone"));
  assert.ok(csv.body.includes("ARENA_AAA111") && csv.body.includes("299.00") && csv.body.includes("134.55"));
  assert.ok(csv.body.includes("'=cmd|"), "spreadsheet formula must be neutralised");
  assert.ok(!/(^|,)=cmd/m.test(csv.body), "no raw formula cell");
  assert.equal(await auditCount("payments_exported"), before + 1);
});
async function adjustMemberMatchesDirect(admin, member, amount) {
  return call(ops.adjustMatches, { user: admin, params: { id: String(member.profile._id) }, body: { action: "add", amount } });
}

await t("ADMIN MATCHES GRANT: a member who paid nothing gets a free entry: active, can browse, can't claim a refund", async () => {
  const u = await draftMember("Free1"); await makeMember("Visible77"); cfCalls = [];
  const r = await adjustMemberMatchesDirect(adminUser, u, 3);
  assert.equal(r.code, 200, JSON.stringify(r.body));
  assert.deepEqual([r.body.data.matchesAllowed, r.body.data.matchesUsed, r.body.data.complimentary, r.body.data.profileStatus], [3, 0, true, "active"]);
  const e = await Entry.findOne({ user: u.user._id });
  assert.deepEqual([e.paidPaise, e.complimentary, e.payment.gateway, String(e.grantedBy)], [0, true, "admin", String(adminUser._id)]);
  assert.equal((await call(ctl.browse, { user: u.user })).code, 200);
  const me2 = await call(ctl.me, { user: u.user }); assert.equal(me2.body.data.entry.complimentary, true); assert.equal(me2.body.data.entry.matchesAllowed, 3);
  const cancel = await call(pay.cancelEntry, { user: u.user });
  assert.equal(cancel.code, 409); assert.equal(cancel.body.code, "COMPLIMENTARY_ENTRY");
  assert.equal((await call(pay.cancelPreview, { user: u.user })).body.code, "COMPLIMENTARY_ENTRY");
  assert.equal(cfCalls.length, 0, "no payment-gateway call, so no money can move");
  assert.equal((await Entry.findOne({ user: u.user._id })).status, "paid");
});

await t("ADMIN MATCHES: increase / decrease a paying member's matches; never below what they already used; no refund", async () => {
  const a = await makeMember("Adj1", { matches: 2 }), b = await makeMember("Adj2"); cfCalls = [];
  const ent = () => Entry.findOne({ user: a.user._id, status: { $in: ["paid", "in_match", "consumed"] } });
  assert.equal((await call(ops.adjustMatches, { user: adminUser, params: { id: String(a.profile._id) }, body: { action: "add", amount: 2 } })).body.data.matchesAllowed, 4);
  assert.equal((await call(ops.adjustMatches, { user: adminUser, params: { id: String(a.profile._id) }, body: { action: "remove", amount: 3 } })).body.data.matchesAllowed, 1);
  const tooMany = await call(ops.adjustMatches, { user: adminUser, params: { id: String(a.profile._id) }, body: { action: "remove", amount: 5 } });
  assert.equal(tooMany.code, 400); assert.equal(tooMany.body.code, "INVALID_AMOUNT");
  assert.equal((await call(ops.adjustMatches, { user: adminUser, params: { id: String(a.profile._id) }, body: { action: "add", amount: 20 } })).body.code, "TOO_MANY");   // 1 + 20 > 20
  assert.equal((await call(ops.adjustMatches, { user: adminUser, params: { id: String(a.profile._id) }, body: { action: "set", amount: 1 } })).body.code, "NO_CHANGE");
  assert.equal((await call(ops.adjustMatches, { user: adminUser, params: { id: String(a.profile._id) }, body: { action: "remove", amount: 0 } })).code, 400);
  // use a match, then try to drop below it
  await call(ctl.sendRequest, { user: b.user, body: { toProfileId: String(a.profile._id), message: "hi" } });
  const rid = (await Request.findOne({ fromUser: b.user._id, toUser: a.user._id, status: "pending" }))._id;
  await acceptRequest({ requestId: rid, userId: a.user._id });
  await call(ops.adjustMatches, { user: adminUser, params: { id: String(a.profile._id) }, body: { action: "set", amount: 3 } });
  const below = await call(ops.adjustMatches, { user: adminUser, params: { id: String(a.profile._id) }, body: { action: "set", amount: 0 } });
  assert.equal(below.body.code, "BELOW_USED"); assert.match(below.body.message, /already used 1/);
  const e1 = await ent(); assert.deepEqual([e1.matchesAllowed, e1.matchesUsed, e1.status], [3, 1, "in_match"]);
  assert.equal((e1.adjustments.at(-1).by).toString(), String(adminUser._id));
  assert.equal(cfCalls.length, 0, "reducing matches never calls the payment gateway (no refund)");
  assert.equal(e1.paidPaise, 29900, "what they paid is untouched");
});

await t("ADMIN MATCHES: lowering to exactly what was used ends the entry after the current match; raising re-opens it", async () => {
  const a = await makeMember("Adj3"), b = await makeMember("Adj4");           // 1 match each
  const mt = await acceptRequest({ requestId: await reqTo(b, a), userId: a.user._id });
  await endMatch({ matchId: mt._id, byUserId: a.user._id, reason: "user_ended" });
  assert.deepEqual([(await Profile.findById(a.profile._id)).status, (await Entry.findOne({ user: a.user._id })).status], ["draft", "consumed"]);
  const r = await call(ops.adjustMatches, { user: adminUser, params: { id: String(a.profile._id) }, body: { action: "add", amount: 2 } });   // re-open: 1 used of 3
  assert.equal(r.code, 200, JSON.stringify(r.body));
  assert.deepEqual([r.body.data.matchesAllowed, r.body.data.matchesUsed, r.body.data.matchesLeft, r.body.data.profileStatus, r.body.data.status], [3, 1, 2, "active", "paid"]);
  const back = await call(ops.adjustMatches, { user: adminUser, params: { id: String(a.profile._id) }, body: { action: "set", amount: 1 } });   // back to exactly used
  assert.deepEqual([back.body.data.status, back.body.data.profileStatus], ["consumed", "draft"]);
});

await t("ADMIN MATCHES: granting to a suspended member keeps them suspended; reinstating then activates them", async () => {
  const u = await draftMember("Sus9");
  await Profile.updateOne({ _id: u.profile._id }, { $set: { status: "suspended", statusBeforeSuspend: "draft", suspendedReason: "test" } });
  const r = await adjustMemberMatchesDirect(adminUser, u, 2);
  assert.equal(r.body.data.profileStatus, "suspended");
  const un = await call(adminC.unsuspendProfile, { user: adminUser, params: { id: String(u.profile._id) } });
  assert.equal(un.body.data.status, "active");
});

await t("ADMIN MEMBERS LIST: shows each member's matches (used / allowed) and whether the entry is complimentary", async () => {
  const u = await draftMember("ListMe1"); await adjustMemberMatchesDirect(adminUser, u, 4);
  const r = await call(adminC.listProfiles, { user: adminUser, query: { q: "ListMe1" } });
  const item = r.body.data.items[0];
  assert.equal(item.account.email.includes("@"), true);
  assert.deepEqual([item.entry.matchesAllowed, item.entry.matchesUsed, item.entry.matchesLeft, item.entry.complimentary], [4, 0, 4, true]);
});

await t("AUDIT: grants, deletes, chat views and exports are recorded with who did it", async () => {
  const r = await call(ops.listAudit, { user: adminUser, query: {} });
  const actions = new Set(r.body.data.items.map((x) => x.action));
  for (const a of ["chat_viewed", "report_deleted", "bug_deleted", "payments_exported", "matches_adjusted"]) assert.ok(actions.has(a), a);
  assert.ok(r.body.data.items.every((x) => x.admin?.name === "Admin Annie"));
  assert.equal((await call(ops.listAudit, { user: adminUser, query: { action: "matches_adjusted" } })).body.data.items.every((x) => x.action === "matches_adjusted"), true);
});


/* ===================== LEGACY DATA (the "Couldn't load the arena" crash) ===================== */
const { migrateLegacyArenaData } = await import(`${B}/services/arena/migrate.js`);
const mkLegacyUser = async (name) => { n += 1; return User.create({ name, email: `${name.toLowerCase()}${n}@t.com`, mobile: `98300${String(10000 + n)}`, password: "x".repeat(20), mustChangePassword: false }); };

/* a profile exactly as the FIRST version saved it: single `topic`, none of the newer fields */
const insertLegacyProfile = async (user, extra = {}) => {
  const doc = { user: user._id, alias: generateAlias(), realName: user.name, topic: "HLD", level: "intermediate", skills: ["kafka"], yearsExperience: 3, companyType: "product",
    availability: ["weekday_evening"], bio: "", goal: "", contact: {}, shareSettings: { name: true, company: false, email: false, phone: false, linkedin: false },
    status: "active", activatedAt: new Date(), createdAt: new Date(), updatedAt: new Date(), ...extra };
  const r = await Profile.collection.insertOne(doc);
  return { ...doc, _id: r.insertedId };
};

await t("LEGACY: browse no longer crashes on an old profile that has no `topics` (the reported TypeError)", async () => {
  const viewer = await makeMember("LegViewer");
  const legacy = await insertLegacyProfile(await mkLegacyUser("LegacyOne"));
  const broken = await insertLegacyProfile(await mkLegacyUser("BrokenOne"), { topic: undefined });   // no topic AND no topics at all
  assert.equal(legacy.topics, undefined, "setup: this document really has no `topics` field");
  const r = await call(ctl.browse, { user: viewer.user });
  assert.equal(r.code, 200, JSON.stringify(r.body));
  const card = r.body.data.items.find((x) => x.id === String(legacy._id));
  assert.ok(card, "the old profile is still listed");
  assert.deepEqual(card.topics, ["HLD"], "its single old topic is shown as a topics list");
  assert.deepEqual([card.languages, card.sessionModes, card.targetCompanies], [[], [], []], "missing newer fields default to empty lists");
  const bad = r.body.data.items.find((x) => x.id === String(broken._id));
  assert.ok(!bad || bad.topics.length === 0, "a profile with no topic at all can't crash the list");
});

await t("LEGACY: filtering by topic still finds old profiles", async () => {
  const viewer = await makeMember("LegViewer2");
  const legacy = await insertLegacyProfile(await mkLegacyUser("LegacyTwo"));
  const r = await call(ctl.browse, { user: viewer.user, query: { topic: "HLD" } });
  assert.equal(r.code, 200);
  assert.ok(r.body.data.items.some((x) => x.id === String(legacy._id)));
});

await t("LEGACY: a settings record from an older version yields safe defaults (no undefined / NaN)", async () => {
  await Settings.default.collection.deleteMany({});
  await Settings.default.collection.insertOne({ key: "global", enabled: true, entryPricePaise: 39900 });   // none of the newer settings
  Settings.invalidateArenaSettingsCache();
  const cfg = await Settings.getArenaSettings({ fresh: true });
  assert.deepEqual([cfg.entryPricePaise, cfg.matchesPerEntry, cfg.requestExpiryDays, cfg.maxOutgoingRequests, cfg.minMatchDaysBeforeEnd, cfg.cancellationFeePercent], [39900, 1, 14, 10, 0, 10]);
  const pub = await call(ctl.publicInfo, { user: (await makeMember("LegPub")).user });
  assert.equal(pub.code, 200); assert.equal(pub.body.data.matchesPerEntry, 1);
});

await t("LEGACY MIGRATION: converts old profiles, entries and settings, and running it again changes nothing", async () => {
  const u1 = await mkLegacyUser("MigProfile");
  const prof = await insertLegacyProfile(u1);
  const u2 = await mkLegacyUser("MigEntry"); const prof2 = await insertLegacyProfile(u2);
  // entry as the FIRST (Razorpay-only, one-match) version saved it
  const oldPaid = (await Entry.collection.insertOne({ user: u2._id, profile: prof2._id, status: "paid", listPricePaise: 29900, discountPaise: 0, paidPaise: 29900, cancellationFeePercent: 10, razorpay: { orderId: "order_OLD1", paymentId: "pay_OLD1" }, paidAt: new Date(), createdAt: new Date(), updatedAt: new Date() })).insertedId;
  // an old "consumed" entry whose match is still running
  const u3 = await mkLegacyUser("MigLive"), u4 = await mkLegacyUser("MigLive2");
  const p3 = await insertLegacyProfile(u3, { status: "matched" }), p4 = await insertLegacyProfile(u4, { status: "matched" });
  const e3 = (await Entry.collection.insertOne({ user: u3._id, profile: p3._id, status: "consumed", listPricePaise: 29900, paidPaise: 29900, cancellationFeePercent: 10, razorpay: { orderId: "order_OLD3" }, createdAt: new Date(), updatedAt: new Date() })).insertedId;
  const e4 = (await Entry.collection.insertOne({ user: u4._id, profile: p4._id, status: "consumed", listPricePaise: 29900, paidPaise: 29900, cancellationFeePercent: 10, razorpay: { orderId: "order_OLD4" }, createdAt: new Date(), updatedAt: new Date() })).insertedId;
  await Match.collection.insertOne({ profiles: [p3._id, p4._id], users: [u3._id, u4._id], entries: [e3, e4], status: "active", matchedAt: new Date(), createdAt: new Date(), updatedAt: new Date() });

  const first = await migrateLegacyArenaData();
  assert.ok(first.profilesTopics >= 3 && first.entriesPayment >= 3 && first.entriesMatches >= 3 && first.entriesInMatch >= 2, JSON.stringify(first));

  const p = await Profile.collection.findOne({ _id: prof._id });
  assert.deepEqual(p.topics, ["HLD"]); assert.equal(p.topic, undefined);
  assert.deepEqual([p.languages, p.sessionModes, p.sessionsPerWeek, p.buddyPreference, p.timeline, p.designation, p.companyName], [["english"], ["chat"], 2, "any", "exploring", "", ""]);

  const e = await Entry.collection.findOne({ _id: oldPaid });
  assert.deepEqual([e.payment.gateway, e.payment.orderId, e.payment.paymentId, e.razorpay], ["razorpay", "order_OLD1", "pay_OLD1", undefined]);
  assert.deepEqual([e.matchesAllowed, e.matchesUsed, e.complimentary], [1, 0, false]);          // a paid, unused entry keeps its one match
  const live = await Entry.collection.findOne({ _id: e3 });
  assert.deepEqual([live.status, live.matchesAllowed, live.matchesUsed], ["in_match", 1, 1]);   // running match: in_match, 1 of 1 used

  const cfg = await Settings.default.collection.findOne({ key: "global" });
  assert.deepEqual([cfg.matchesPerEntry, cfg.requestExpiryDays, cfg.maxOutgoingRequests], [1, 14, 10]);
  assert.equal(cfg.entryPricePaise, 39900, "an admin-set value is never overwritten by a default");

  const second = await migrateLegacyArenaData();
  assert.deepEqual(Object.values(second).filter(Boolean).length, 0, `second run must change nothing, got ${JSON.stringify(second)}`);
});

await t("LEGACY MIGRATION: a migrated member browses, opens /me, and the admin screens read their old payment", async () => {
  const u = await mkLegacyUser("MigBrowse");
  const prof = await insertLegacyProfile(u, { status: "draft" });
  await Entry.collection.insertOne({ user: u._id, profile: prof._id, status: "paid", listPricePaise: 29900, paidPaise: 29900, cancellationFeePercent: 10, razorpay: { orderId: "order_OLDX", paymentId: "pay_OLDX" }, paidAt: new Date(), createdAt: new Date(), updatedAt: new Date() });
  await migrateLegacyArenaData();
  const viewer = { _id: u._id };
  const me3 = await call(ctl.me, { user: viewer });                       // also heals paid-but-draft
  assert.equal(me3.code, 200, JSON.stringify(me3.body));
  assert.equal(me3.body.data.profile.status, "active"); assert.deepEqual(me3.body.data.profile.topics, ["HLD"]);
  assert.equal(me3.body.data.entry.matchesAllowed, 1);
  assert.equal((await call(ctl.browse, { user: viewer })).code, 200);
  const ledger = await call(ops.listPayments, { user: adminUser, query: { q: "order_OLDX" } });
  assert.equal(ledger.code, 200); assert.equal(ledger.body.data.items[0].gateway, "razorpay"); assert.equal(ledger.body.data.items[0].paymentId, "pay_OLDX");
  assert.equal((await call(adminC.listProfiles, { user: adminUser, query: { q: "MigBrowse" } })).code, 200);
  assert.equal((await call(ops.listRequests, { user: adminUser, query: {} })).code, 200);
});

await t("LEGACY: the admin 'Repair' also upgrades old records and reports it", async () => {
  await insertLegacyProfile(await mkLegacyUser("RepairLeg"));
  const r = await call(adminC.repair, { user: adminUser });
  assert.equal(r.code, 200); assert.ok(r.body.data.migrated.profilesTopics >= 1);
  assert.match(r.body.message, /older version|Activated|Nothing/);
});


/* ===================== PAGINATION (lazy loading) + FULL DETAILS ON INVITATIONS ===================== */
await t("INVITATIONS: received list is paginated (no gaps, no duplicates), newest first, with a correct hasMore", async () => {
  const recv = await makeMember("PgRecv");
  const senders = [];
  for (let i = 0; i < 19; i++) senders.push(await makeMember(`PgSend${i}`));
  for (const [i, sdr] of senders.entries()) await Request.create({ from: sdr.profile._id, to: recv.profile._id, fromUser: sdr.user._id, toUser: recv.user._id, message: `msg ${i}`, expiresAt: new Date(Date.now() + 864e5), createdAt: new Date(Date.now() - (19 - i) * 1000) });
  const seen = []; let page = 1, more = true, pages = 0;
  while (more) {
    const r = await call(ctl.listRequests, { user: recv.user, query: { box: "incoming", page: String(page), pageSize: "8" } });
    assert.equal(r.code, 200, JSON.stringify(r.body));
    const d = r.body.data;
    assert.equal(d.total, 19); assert.equal(d.pageSize, 8); assert.ok(d.items.length <= 8);
    seen.push(...d.items.map((x) => x.id)); more = d.hasMore; page += 1; pages += 1;
    if (!more) assert.equal(d.items.length, 3);                       // 8 + 8 + 3
  }
  assert.equal(pages, 3); assert.equal(seen.length, 19); assert.equal(new Set(seen).size, 19, "no duplicates across pages");
  const first = await call(ctl.listRequests, { user: recv.user, query: { box: "incoming", page: "1", pageSize: "8" } });
  assert.equal(first.body.data.items[0].message, "msg 18", "newest first");
  assert.equal((await call(ctl.listRequests, { user: recv.user, query: { box: "incoming", pageSize: "500" } })).body.data.pageSize, 30, "page size is capped");
});

await t("INVITATIONS: each request carries the sender's FULL arena card (every public field) and never private data", async () => {
  const recv = await makeMember("FullRecv"), sdr = await makeMember("FullSend");
  await Profile.updateOne({ _id: sdr.profile._id }, { $set: { designation: "Staff Engineer", companyName: "Zoho", targetCompanies: ["Google", "Amazon"], languages: ["english", "hindi"], sessionsPerWeek: 4, sessionModes: ["video", "chat"], buddyPreference: "more_experienced", timeline: "within_1_month", bio: "Backend dev", goal: "Weekly mocks", yearsExperience: 7, topics: ["HLD", "LLD"], contact: { email: "secret@x.com", phone: "9876543210" } } });
  await Request.create({ from: sdr.profile._id, to: recv.profile._id, fromUser: sdr.user._id, toUser: recv.user._id, message: "Hi! Mock this week?", expiresAt: new Date(Date.now() + 864e5) });
  const r = await call(ctl.listRequests, { user: recv.user, query: { box: "incoming" } });
  const it = r.body.data.items[0];
  assert.equal(it.message, "Hi! Mock this week?"); assert.ok(it.createdAt && it.expiresAt);
  const p = it.profile;
  for (const k of ["alias", "topics", "level", "skills", "yearsExperience", "companyType", "companyName", "designation", "targetCompanies", "languages", "sessionsPerWeek", "sessionModes", "buddyPreference", "timeline", "availability", "bio", "goal"]) assert.ok(k in p, `missing public field ${k}`);
  assert.deepEqual([p.designation, p.companyName, p.sessionsPerWeek, p.buddyPreference, p.timeline, p.yearsExperience], ["Staff Engineer", "Zoho", 4, "more_experienced", "within_1_month", 7]);
  const raw = JSON.stringify(r.body);
  for (const secret of ["secret@x.com", "9876543210", "realName", "FullSend"]) assert.equal(raw.includes(secret), false, `leaked ${secret}`);
});

await t("CHAT: message history pages backwards by cursor with no gaps or duplicates, and a correct hasMore", async () => {
  const a = await makeMember("ChatA"), b = await makeMember("ChatB");
  const mt = await acceptRequest({ requestId: await reqTo(a, b), userId: b.user._id });
  const docs = Array.from({ length: 75 }, (_, i) => ({ match: mt._id, sender: (i % 2 ? a : b).user._id, text: `m${i}` }));
  for (const d of docs) await Message.create(d);                          // sequential: distinct, increasing ids
  const seen = []; let cursor = null, rounds = 0, more = true;
  while (more) {
    const r = await call(ctl.matchMessages, { user: a.user, query: { limit: "30", ...(cursor ? { beforeId: cursor } : {}) } });
    assert.equal(r.code, 200, JSON.stringify(r.body));
    const { messages, hasMore } = r.body.data;
    seen.unshift(...messages.map((x) => x.text));                           // older pages go in front
    cursor = messages[0]?.id; more = hasMore; rounds += 1;
    assert.ok(rounds <= 4);
  }
  assert.equal(rounds, 3);                                                   // 30 + 30 + 15
  assert.deepEqual(seen, docs.map((d) => d.text), "all 75 messages, in order, exactly once");
  const last = await call(ctl.matchMessages, { user: a.user, query: { limit: "30" } });
  assert.equal(last.body.data.hasMore, true); assert.equal(last.body.data.messages.at(-1).text, "m74");
  assert.ok(last.body.data.messages.every((x) => typeof x.mine === "boolean"));
});

await t("ARENA BROWSE: paginates with total and stable, duplicate-free pages", async () => {
  const viewer = await makeMember("PgViewer");
  for (let i = 0; i < 14; i++) await makeMember(`PgBrowse${i}`);
  const p1 = await call(ctl.browse, { user: viewer.user, query: { page: "1" } });
  const p2 = await call(ctl.browse, { user: viewer.user, query: { page: "2" } });
  assert.equal(p1.code, 200); assert.equal(p1.body.data.pageSize, 12); assert.ok(p1.body.data.total >= 14);
  const ids = [...p1.body.data.items, ...p2.body.data.items].map((x) => x.id);
  assert.equal(new Set(ids).size, ids.length, "no member appears on two pages");
});

console.log("\n" + results.map((r) => `${r[0]}  ${r[1]}${r[2] ? "\n      → " + r[2] : ""}`).join("\n"));
const failed = results.filter((r) => r[0] === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} passed`);
await mongoose.disconnect();
await repl.stop();
process.exit(failed ? 1 : 0);
