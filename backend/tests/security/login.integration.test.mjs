/*
  Login hardening (integration): real login controller, in-memory MongoDB, fake Upstash Redis.
  Needs:  npm i -D mongodb-memory-server
  Run:    node tests/security/login.integration.test.mjs     (exit code 1 on any failure)

  Checks
    1. An unknown email and a real member with a wrong password get IDENTICAL answers
       (same JSON, same countdown, both locked on the 5th try), and similar response times.
    2. Staff accounts (admin / partner / Employee) can't sign in with a password alone on a new
       device: they get an emailed code (requiresOtp). Members and affiliates sign straight in.
*/
import assert from "node:assert/strict";
import http from "node:http";

/* ---------- fake Upstash Redis (REST), same as tests/arena/http-security.test.mjs ---------- */
const store = new Map();
const expiry = new Map();
const alive = (k) => {
  const e = expiry.get(k);
  if (e !== undefined && e <= Date.now()) { store.delete(k); expiry.delete(k); }
  return store.has(k);
};
const exec = (cmd) => {
  const [op, ...args] = cmd; const o = String(op).toLowerCase();
  if (o === "mget") return { result: args.map((k) => (alive(k) ? store.get(k) : null)) };
  if (o === "get") return { result: alive(args[0]) ? store.get(args[0]) : null };
  if (o === "set") {
    const [k, v, ...opts] = args; const flags = opts.map((x) => String(x).toLowerCase());
    if (flags.includes("nx") && alive(k)) return { result: null };
    store.set(k, v); expiry.delete(k);
    const ex = flags.indexOf("ex"); if (ex >= 0) expiry.set(k, Date.now() + Number(opts[ex + 1]) * 1000);
    return { result: "OK" };
  }
  if (o === "del") { let n = 0; args.forEach((k) => { if (alive(k)) n += 1; store.delete(k); expiry.delete(k); }); return { result: n }; }
  if (o === "incr") { const v = (alive(args[0]) ? Number(store.get(args[0])) : 0) + 1; store.set(args[0], String(v)); return { result: v }; }
  if (o === "expire") { if (!alive(args[0])) return { result: 0 }; expiry.set(args[0], Date.now() + Number(args[1]) * 1000); return { result: 1 }; }
  if (o === "ttl") { if (!alive(args[0])) return { result: -2 }; const e = expiry.get(args[0]); return { result: e === undefined ? -1 : Math.ceil((e - Date.now()) / 1000) }; }
  return { error: "unsupported in fake" };
};
const redisServer = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    let parsed = [];
    try { parsed = JSON.parse(body); } catch { /* ignore */ }
    res.setHeader("content-type", "application/json");
    if (req.url.startsWith("/pipeline") || req.url.startsWith("/multi-exec")) return res.end(JSON.stringify(parsed.map(exec)));
    const out = exec(parsed);
    if (out.error) res.statusCode = 400;
    res.end(JSON.stringify(out));
  });
});
await new Promise((r) => redisServer.listen(0, "127.0.0.1", r));

process.env.MONGO_URI = "mongodb://x/x";
process.env.JWT_SECRET = "0123456789012345678901234567890123456789";
process.env.UPSTASH_REDIS_REST_URL = `http://127.0.0.1:${redisServer.address().port}`;
process.env.UPSTASH_REDIS_REST_TOKEN = "fake";
process.env.FRONTEND_URL = "http://localhost:5173";
process.env.LOGIN_OTP_ENABLED = "false";
process.env.LOGIN_OTP_ROLES = "admin,partner,employee";
process.env.LOGIN_IP_FAIL_LIMIT = "100000";
process.env.COOKIE_SECURE = "false";
// Mail: Resend only, stubbed below. No real fallback provider can send anything.
process.env.MAIL_PROVIDER = "resend";
process.env.RESEND_API_KEY = "re_test";
process.env.MAILTRAP_TOKEN = "";
process.env.AMAZON_ACCESS_KEY_ID = "";
process.env.AWS_ACCESS_KEY_ID = "";
process.env.SQS_EMAIL_QUEUE_NAME = "";

const sentMail = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init = {}) => {
  if (String(url).startsWith("https://api.resend.com")) {
    sentMail.push(JSON.parse(init.body));
    return new Response(JSON.stringify({ id: `r-${sentMail.length}` }), { status: 200 });
  }
  return realFetch(url, init);
};

const { MongoMemoryReplSet } = await import("mongodb-memory-server");
const mongod = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
const mongoose = (await import("mongoose")).default;
await mongoose.connect(mongod.getUri());

const B = new URL("../../", import.meta.url).pathname;
const { default: User } = await import(`${B}models/User.js`);
const { login } = await import(`${B}controllers/authController.js`);
const { hashPassword } = await import(`${B}utils/authUtils.js`);
const { provisionUserAuth } = await import(`${B}services/authStateService.js`);

const call = async (body, ip = "10.0.0.1") => {
  const req = {
    body, ip, cookies: {}, headers: { "user-agent": "Mozilla/5.0 test" },
    get(h) { return this.headers[String(h).toLowerCase()]; },
  };
  const out = { status: 200, body: null };
  const res = {
    status(c) { out.status = c; return this; },
    json(b) { out.body = b; return this; },
    set() { return this; }, cookie() { return this; }, clearCookie() { return this; },
  };
  const t = process.hrtime.bigint();
  await login(req, res);
  out.ms = Number(process.hrtime.bigint() - t) / 1e6;
  return out;
};

let failures = 0;
const t = async (name, fn) => {
  try { await fn(); console.log(`PASS  ${name}`); } catch (e) { failures++; console.log(`FAIL  ${name}\n      → ${e.message.split("\n").slice(0, 6).join("\n        ")}`); }
};

const makeUser = async (email, role) => {
  const doc = {
    name: `${role} user`, email, mobile: String(9000000000 + Math.floor(Math.random() * 99999999)), countryCode: "+91",
    password: await hashPassword("Correct#Pass1"), role, status: "active", mustChangePassword: false,
    ...(role === "affiliate" ? { affiliate: { code: `AFF${Date.now() % 100000}`, commissionType: "percentage", commissionValue: 10, status: "active" } } : {}),
  };
  const user = await User.create(doc);
  // Same as creating the account from the admin console: the auth state is cached in Redis.
  await provisionUserAuth(await User.findById(user._id).select("+tokenVersion"));
  return user;
};

/* strip what may legitimately differ (nothing should) */
const shape = (r) => ({ status: r.status, ...r.body, lockedUntil: r.body?.lockedUntil ? "<time>" : undefined, retryAfter: r.body?.retryAfter ? "<n>" : undefined });

await makeUser("member@example.com", "normal");

await t("unknown email vs real member + wrong password: identical answers on every try, both lock on the 5th", async () => {
  const known = [], unknown = [];
  for (let i = 0; i < 6; i++) {
    known.push(await call({ identifier: "member@example.com", password: `wrong-${i}` }, "10.0.0.2"));
    unknown.push(await call({ identifier: "nobody@example.com", password: `wrong-${i}` }, "10.0.0.3"));
  }
  for (let i = 0; i < 6; i++) assert.deepEqual(shape(unknown[i]), shape(known[i]), `attempt ${i + 1} differs`);
  assert.equal(known[3].body.attemptsLeft, 1);
  assert.equal(known[4].status, 429);
  assert.equal(unknown[4].body.code, "ACCOUNT_LOCKED");
  assert.equal(unknown[5].status, 429, "still locked afterwards, like a real account");
});

await t("unknown email takes about as long as a real wrong password (bcrypt is run for both)", async () => {
  const avg = async (identifier, n = 3) => {
    let total = 0;
    for (let i = 0; i < n; i++) total += (await call({ identifier, password: "x" }, `10.1.${i}.${identifier.length}`)).ms;
    return total / n;
  };
  await makeUser("timing@example.com", "normal");
  const known = await avg("timing@example.com");
  const unknown = await avg("nobody-timing@example.com");
  assert.ok(unknown > known * 0.5, `unknown ${unknown.toFixed(0)} ms vs known ${known.toFixed(0)} ms: unknown answers too fast`);
});

for (const role of ["admin", "partner", "Employee"]) {
  await t(`${role}: correct password on a new device → emailed code required, no token issued`, async () => {
    await makeUser(`${role.toLowerCase()}@example.com`, role);
    sentMail.length = 0;
    const r = await call({ identifier: `${role.toLowerCase()}@example.com`, password: "Correct#Pass1" }, "10.2.0.1");
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.equal(r.body.requiresOtp, true);
    assert.ok(r.body.challengeId);
    assert.equal(r.body.token, undefined, "must not hand out an access token");
    assert.equal(sentMail.length, 1, "one OTP email");
  });
}

await t("affiliate: correct password signs straight in, no code emailed", async () => {
  await makeUser("affiliate@example.com", "affiliate");
  sentMail.length = 0;
  const r = await call({ identifier: "affiliate@example.com", password: "Correct#Pass1" }, "10.2.0.2");
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.ok(r.body.token, "access token issued");
  assert.notEqual(r.body.requiresOtp, true);
  assert.equal(sentMail.length, 0, "no OTP email");
});

await t("member: correct password still signs straight in (LOGIN_OTP_ENABLED=false)", async () => {
  const r = await call({ identifier: "timing@example.com", password: "Correct#Pass1" }, "10.3.0.1");
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.ok(r.body.token, "access token issued");
  assert.notEqual(r.body.requiresOtp, true);
});

await mongoose.disconnect();
await mongod.stop();
redisServer.close();
console.log(failures ? `\n${failures} failing` : "\nall passing");
process.exit(failures ? 1 : 0);
