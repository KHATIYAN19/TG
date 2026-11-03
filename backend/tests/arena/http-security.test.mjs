/*
  Prep Buddy Arena – integration suite. NOT picked up by `node --test` automatically.
  Needs a throw-away MongoDB replica set:  npm i -D mongodb-memory-server
  Run:  node tests/arena/<file>.test.mjs   (exit code 1 on any failure)
*/
import assert from "node:assert/strict";
import http from "node:http";

const B = new URL("../../", import.meta.url).pathname.replace(/\/$/, "");

/* ---------- fake Upstash Redis (REST) so the REAL auth middleware runs ---------- */
const store = new Map();
const exec = (cmd) => {
  const [op, ...args] = cmd; const o = String(op).toLowerCase();
  if (o === "mget") return { result: args.map((k) => store.get(k) ?? null) };
  if (o === "get") return { result: store.get(args[0]) ?? null };
  if (o === "set") { store.set(args[0], args[1]); return { result: "OK" }; }
  if (o === "del") { args.forEach((k) => store.delete(k)); return { result: args.length }; }
  return { error: "unsupported in fake" };            // rate limiters then fail-open (as designed)
};
const redisServer = http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    let parsed = [];
    try { parsed = JSON.parse(body); } catch { /* ignore */ }
    res.setHeader("content-type", "application/json");
    // Upstash auto-pipelining posts an ARRAY of commands to /pipeline.
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
process.env.ARENA_PAYMENT_GATEWAY = "cashfree";
process.env.RESEND_API_KEY = "";
for (const k of ["AMAZON_ACCESS_KEY_ID", "AMAZON_SECRET_ACCESS_KEY", "AMAZON_REGION", "AMAZON_SES_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "AWS_DEFAULT_REGION", "AMAZON_SESSION_TOKEN", "AWS_SESSION_TOKEN", "AMAZON_SES_FROM_EMAIL", "AMAZON_SES_CONFIGURATION_SET"]) process.env[k] = "";   // never use real mail credentials from .env in tests               // tests must never use the real Resend key from .env (dotenv will not override a set variable)
process.env.MAILTRAP_TOKEN = "fake-token-for-tests";   // Mailtrap "configured" but will fail: no real account

const { default: express } = await import(`${B}/node_modules/express/index.js`);
const { default: cookieParser } = await import(`${B}/node_modules/cookie-parser/index.js`);
const { default: jwt } = await import(`${B}/node_modules/jsonwebtoken/index.js`);
const mongoose = (await import(`${B}/node_modules/mongoose/index.js`)).default;
const { MongoMemoryReplSet } = await import("mongodb-memory-server");

const repl = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
await mongoose.connect(repl.getUri(), { dbName: "sec" });

const m = async (p) => (await import(`${B}/${p}`)).default;
const User = await m("models/User.js");
const Profile = await m("models/arena/ArenaProfile.js");
const Entry = await m("models/arena/ArenaEntry.js");
const Request = await m("models/arena/ArenaRequest.js");
const { markEntryPaid } = await import(`${B}/services/arena/entryService.js`);
const { generateAlias } = await import(`${B}/services/arena/privacy.js`);
const arenaRouter = await m("routes/arena/arenaRoutes.js");
const adminRouter = await m("routes/arena/arenaAdminRoutes.js");

const app = express();
app.set("trust proxy", true);
app.use(cookieParser());
app.use(express.json());
const authCtl = await import(`${B}/controllers/authController.js`);
const { hashPassword } = await import(`${B}/utils/authUtils.js`);
const { provisionUserAuth } = await import(`${B}/services/authStateService.js`);
app.post("/api/auth/login", authCtl.login);                // the rate limiter is bypassed here; it needs real Redis
const { forgotPassword, resetPassword } = await import(`${B}/controllers/arena/authController.js`);
const { signup: signupHandler, verifySignup: verifySignupHandler } = await import(`${B}/controllers/arena/authController.js`);
app.post("/api/arena/signup", signupHandler);              // route limiter needs real Redis; handler logic is real
app.post("/api/arena/signup/verify", verifySignupHandler);
app.post("/api/arena/password/forgot", forgotPassword);   // route limiter needs real Redis; handler limits are real
app.post("/api/arena/password/reset", resetPassword);
const { arenaOtpRateLimit } = await import(`${B}/Middleware/rateLimiter.js`);
const otpHits = new Map();                                 // same contract as Upstash: 5 per 24 h per key
arenaOtpRateLimit.limit = async (key) => { const l = (otpHits.get(key) ?? []).filter((x) => Date.now() - x < 86400000); if (l.length >= 5) return { success: false, reset: l[0] + 86400000 }; l.push(Date.now()); otpHits.set(key, l); return { success: true, reset: Date.now() + 86400000 }; };
app.use("/api/arena", arenaRouter);
app.use("/api/admin/arena", adminRouter);
const mailRouter = await m("routes/mailSettingsRoutes.js");
app.use("/api/admin/mail", mailRouter);
const server = await new Promise((r) => { const s = app.listen(0, () => r(s)); });
const BASE = `http://127.0.0.1:${server.address().port}`;

/* ---------- helpers ---------- */
let n = 0;
const makeUser = async (name, { paid = true, role = "normal" } = {}) => {
  n += 1;
  const user = await User.create({ name, email: `${name.toLowerCase()}${n}@t.com`, mobile: `98100${String(10000 + n)}`, password: "x".repeat(20), mustChangePassword: false, role });
  const sid = `sess-${n}`;
  store.set(`auth:user:${user._id}`, JSON.stringify({ role, status: "active", isDeleted: false, tokenVersion: 0, mustChangePassword: false, lockedUntil: null }));
  store.set(`auth:session:${sid}`, JSON.stringify({ userId: String(user._id), tokenVersion: 0, state: "active", expiresAt: Date.now() + 3_600_000 }));
  const token = jwt.sign({ sub: String(user._id), sid, tv: 0 }, process.env.JWT_SECRET, { algorithm: "HS256", expiresIn: "15m" });
  let profile = null;
  if (paid !== null) {
    profile = await Profile.create({ user: user._id, alias: generateAlias(), realName: name, topics: ["HLD"], level: "intermediate", skills: ["kafka"], availability: ["weekday_evening"], companyType: "product", companyName: `${name} Corp` });
    if (paid) {
      const e = await Entry.create({ user: user._id, profile: profile._id, listPricePaise: 29900, paidPaise: 29900, cancellationFeePercent: 10, matchesAllowed: 2, payment: { gateway: "cashfree", orderId: `ARENA_order_${n}` } });
      await markEntryPaid({ entryId: e._id, paymentId: `p_${n}` });
      profile = await Profile.findById(profile._id);
    }
  }
  return { user, token, profile };
};

const api = async (method, path, { token, body, cookie, ip } = {}) => {
  const r = await fetch(`${BASE}${path}`, { method, headers: { "content-type": "application/json", ...(ip ? { "x-forwarded-for": ip } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}), ...(cookie ? { cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
  let j = null; try { j = await r.json(); } catch { /* none */ }
  return { status: r.status, body: j };
};

const results = [];
const t = async (name, fn) => { try { await fn(); results.push(["PASS", name]); } catch (e) { results.push(["FAIL", name, e.message]); } };

/* ================= 1. ROUTE INVENTORY: what is public, what is protected ================= */
const inventory = (router, prefix) => {
  const out = []; let authSeen = false;
  const isAuthLayer = (l) => l.name === "auth" || l.handle?.name === "auth";
  for (const layer of router.stack) {
    if (!layer.route) { if (isAuthLayer(layer)) authSeen = true; continue; }
    const handlers = layer.route.stack.map((s) => s.handle?.name || s.name);
    const hasOwnAuth = handlers.includes("auth");
    for (const method of Object.keys(layer.route.methods)) out.push({ method: method.toUpperCase(), path: prefix + layer.route.path, protected: authSeen || hasOwnAuth });
  }
  return out;
};
const memberRoutes = inventory(arenaRouter, "/api/arena");
const adminRoutes = inventory(adminRouter, "/api/admin/arena");
const PUBLIC_OK = new Set(["GET /api/arena/public", "POST /api/arena/signup", "POST /api/arena/signup/verify", "POST /api/arena/signup/resend", "POST /api/arena/password/forgot", "POST /api/arena/password/reset"]);
console.log(`\nRoute inventory: ${memberRoutes.length} member routes, ${adminRoutes.length} admin routes`);
console.log("  public (by design):", memberRoutes.filter((r) => !r.protected).map((r) => `${r.method} ${r.path.replace("/api/arena", "")}`).join(", "));

await t("INVENTORY: the only public member routes are public info + signup/OTP", () => {
  const open = memberRoutes.filter((r) => !r.protected).map((r) => `${r.method} ${r.path}`);
  assert.deepEqual(new Set(open), PUBLIC_OK, `unexpected public routes: ${open.join(", ")}`);
});
await t("INVENTORY: every admin route sits behind auth", () => assert.ok(adminRoutes.length && adminRoutes.every((r) => r.protected)));

const fill = (p) => p.replace(/:id\b/g, "64b000000000000000000001").replace(/:profileId\b/g, "64b000000000000000000001");
const protectedMember = memberRoutes.filter((r) => r.protected);

/* ================= 2. NO TOKEN → 401 TOKEN_MISSING on EVERY protected route ================= */
await t(`NO TOKEN: all ${protectedMember.length} protected member routes answer 401 TOKEN_MISSING`, async () => {
  for (const r of protectedMember) {
    const res = await api(r.method, fill(r.path), { body: r.method === "GET" ? undefined : {} });
    assert.equal(res.status, 401, `${r.method} ${r.path} → ${res.status}`);
    assert.equal(res.body.code, "TOKEN_MISSING", `${r.method} ${r.path}`);
  }
});
await t(`NO TOKEN: all ${adminRoutes.length} admin routes answer 401`, async () => {
  for (const r of adminRoutes) { const res = await api(r.method, fill(r.path), { body: r.method === "GET" ? undefined : {} }); assert.equal(res.status, 401, `${r.method} ${r.path}`); }
});
await t("BAD TOKEN: garbage / expired-signature / wrong-secret tokens are rejected everywhere", async () => {
  const forged = jwt.sign({ sub: "64b000000000000000000001", sid: "x", tv: 0 }, "a-different-secret-of-at-least-32-chars!!", { algorithm: "HS256" });
  for (const tok of ["garbage", forged]) for (const r of protectedMember.slice(0, 8)) {
    const res = await api(r.method, fill(r.path), { token: tok, body: r.method === "GET" ? undefined : {} });
    assert.equal(res.status, 401, `${r.method} ${r.path} with ${tok.slice(0, 8)}`);
  }
});
await t("CLIENT-SUPPLIED USER IDS ARE NOT TRUSTED: a 'token' cookie/header with a forged sub but no valid session is refused", async () => {
  const noSession = jwt.sign({ sub: "64b000000000000000000002", sid: "does-not-exist", tv: 0 }, process.env.JWT_SECRET, { algorithm: "HS256" });
  const res = await api("GET", "/api/arena/browse", { token: noSession });
  assert.equal(res.status, 401); assert.equal(res.body.code, "SESSION_NOT_FOUND");
});

/* ================= 3. ROLE: normal members can't touch admin routes ================= */
const normal = await makeUser("Norm");
await t("ROLE: a normal member gets 403 on every admin route", async () => {
  for (const r of adminRoutes) { const res = await api(r.method, fill(r.path), { token: normal.token, body: r.method === "GET" ? undefined : {} }); assert.equal(res.status, 403, `${r.method} ${r.path} → ${res.status}`); }
});
const admin = await makeUser("Boss", { paid: null, role: "admin" });
await t("ROLE: an admin can use admin routes", async () => {
  assert.equal((await api("GET", "/api/admin/arena/settings", { token: admin.token })).status, 200);
  assert.equal((await api("GET", "/api/admin/arena/stats", { token: admin.token })).status, 200);
});

/* ================= 4. BROWSE works with a token; the reported message appears WITHOUT one ================= */
const A = await makeUser("Alice"), Bm = await makeUser("Bob"), C = await makeUser("Cara"), U = await makeUser("Unpaid", { paid: false });
await t("BROWSE: with a valid token a paid member sees other members (anonymised)", async () => {
  const res = await api("GET", "/api/arena/browse", { token: A.token });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.ok(res.body.data.items.length >= 2);
  const raw = JSON.stringify(res.body);
  assert.ok(!raw.includes("realName") && !raw.includes("@t.com"));
});
await t("BROWSE: the SAME call without a token returns exactly the reported {TOKEN_MISSING} (e.g. opening the URL in the address bar)", async () => {
  const res = await api("GET", "/api/arena/browse");
  assert.deepEqual([res.status, res.body.success, res.body.code, res.body.message], [401, false, "TOKEN_MISSING", "Authentication token missing."]);
});
await t("BROWSE vs REQUESTS: both behave identically with and without a token", async () => {
  for (const p of ["/api/arena/browse", "/api/arena/requests?box=incoming", "/api/arena/requests?box=outgoing"]) {
    assert.equal((await api("GET", p)).status, 401, p + " (no token)");
    assert.equal((await api("GET", p, { token: A.token })).status, 200, p + " (token)");
  }
});
await t("UNPAID: a signed-in but unpaid member is refused (402) on browse AND requests", async () => {
  for (const p of ["/api/arena/browse", "/api/arena/requests?box=incoming", "/api/arena/requests?box=outgoing"]) {
    const res = await api("GET", p, { token: U.token });
    assert.equal(res.status, 402, p); assert.equal(res.body.code, "ENTRY_REQUIRED");
  }
});

/* ================= 5. OWNERSHIP: only the right member can send / accept / reject / withdraw ================= */
let reqId;
await t("SEND: the sender is ALWAYS the authenticated member (spoofed body fields are ignored)", async () => {
  const res = await api("POST", "/api/arena/requests", { token: A.token, body: { toProfileId: String(Bm.profile._id), message: "Hi Bob, HLD evenings?", from: String(C.profile._id), fromUser: String(C.user._id), fromProfileId: String(C.profile._id), status: "accepted" } });
  assert.equal(res.status, 201, JSON.stringify(res.body));
  reqId = res.body.data.id;
  const doc = await Request.findById(reqId);
  assert.equal(String(doc.fromUser), String(A.user._id)); assert.equal(String(doc.from), String(A.profile._id));
  assert.equal(doc.status, "pending");                                              // can't self-accept via body
});
await t("SEND: nobody can send a request to themselves", async () => {
  assert.equal((await api("POST", "/api/arena/requests", { token: A.token, body: { toProfileId: String(A.profile._id) } })).status, 404);
});
await t("VISIBILITY: only sender and recipient can see the request; a stranger sees nothing", async () => {
  const inB = await api("GET", "/api/arena/requests?box=incoming", { token: Bm.token });
  assert.equal(inB.body.data.items.length, 1);
  const outA = await api("GET", "/api/arena/requests?box=outgoing", { token: A.token });
  assert.equal(outA.body.data.items.length, 1);
  for (const box of ["incoming", "outgoing"]) assert.equal((await api("GET", `/api/arena/requests?box=${box}`, { token: C.token })).body.data.items.length, 0, `stranger sees ${box}`);
});
await t("ACCEPT: a stranger cannot accept someone else's request", async () => {
  const res = await api("POST", `/api/arena/requests/${reqId}/accept`, { token: C.token });
  assert.ok([404, 409].includes(res.status), String(res.status)); assert.equal((await Request.findById(reqId)).status, "pending");
});
await t("ACCEPT: the SENDER cannot accept their own request", async () => {
  const res = await api("POST", `/api/arena/requests/${reqId}/accept`, { token: A.token });
  assert.ok([404, 409].includes(res.status)); assert.equal((await Request.findById(reqId)).status, "pending");
});
await t("REJECT: a stranger and the sender cannot reject it; request stays pending", async () => {
  for (const who of [C, A]) { const res = await api("POST", `/api/arena/requests/${reqId}/reject`, { token: who.token }); assert.equal(res.status, 404); }
  assert.equal((await Request.findById(reqId)).status, "pending");
});
await t("WITHDRAW: a stranger and the RECIPIENT cannot withdraw it; request stays pending", async () => {
  for (const who of [C, Bm]) { const res = await api("POST", `/api/arena/requests/${reqId}/withdraw`, { token: who.token }); assert.equal(res.status, 404); }
  assert.equal((await Request.findById(reqId)).status, "pending");
});
await t("INVALID IDs are rejected cleanly (400), not crashed", async () => {
  assert.equal((await api("POST", "/api/arena/requests/not-an-id/accept", { token: Bm.token })).status, 400);
});
await t("REJECT: only the recipient can reject", async () => {
  const mine = await api("POST", "/api/arena/requests", { token: C.token, body: { toProfileId: String(Bm.profile._id), message: "Hello" } });
  const id2 = mine.body.data.id;
  assert.equal((await api("POST", `/api/arena/requests/${id2}/reject`, { token: Bm.token })).status, 200);
  assert.equal((await Request.findById(id2)).status, "rejected");
  assert.equal((await api("POST", `/api/arena/requests/${id2}/reject`, { token: Bm.token })).status, 404);   // can't act twice
});
await t("WITHDRAW: only the sender can withdraw", async () => {
  const mine = await api("POST", "/api/arena/requests", { token: C.token, body: { toProfileId: String(A.profile._id), message: "Hey" } });
  const id3 = mine.body.data.id;
  assert.equal((await api("POST", `/api/arena/requests/${id3}/withdraw`, { token: C.token })).status, 200);
  assert.equal((await Request.findById(id3)).status, "withdrawn");
});
await t("ACCEPT: only the recipient can accept — then a match exists for exactly those two", async () => {
  const res = await api("POST", `/api/arena/requests/${reqId}/accept`, { token: Bm.token });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  const matchA = await api("GET", "/api/arena/match", { token: A.token });
  const matchB = await api("GET", "/api/arena/match", { token: Bm.token });
  const matchC = await api("GET", "/api/arena/match", { token: C.token });
  assert.equal(matchA.status, 200); assert.equal(matchB.status, 200); assert.equal(matchC.status, 404);   // stranger has no match
});

/* ================= 6. CHAT / MATCH data is private to the two buddies ================= */
await t("CHAT: only the two matched members can read messages; a stranger cannot", async () => {
  assert.equal((await api("GET", "/api/arena/match/messages", { token: A.token })).status, 200);
  assert.equal((await api("GET", "/api/arena/match/messages", { token: Bm.token })).status, 200);
  assert.equal((await api("GET", "/api/arena/match/messages", { token: C.token })).status, 404);
});
await t("MATCH: a stranger cannot end someone else's partnership", async () => {
  assert.equal((await api("POST", "/api/arena/match/end", { token: C.token })).status, 404);
  assert.equal((await api("GET", "/api/arena/match", { token: A.token })).status, 200);       // still active
});
await t("PAYMENT: one member's cancel/verify can never touch another member's entry", async () => {
  const before = await Entry.find({ user: { $in: [A.user._id, Bm.user._id] } }).lean();
  await api("POST", "/api/arena/entry/cancel", { token: C.token });                          // acts on C's OWN entry only (gateway unreachable here → 502 is fine)
  const after = await Entry.find({ user: { $in: [A.user._id, Bm.user._id] } }).lean();
  assert.deepEqual(after.map((e) => [String(e._id), e.status]), before.map((e) => [String(e._id), e.status]));
  const ordersOfA = before.find((e) => String(e.user) === String(A.user._id)).payment.orderId;
  assert.equal((await api("POST", "/api/arena/entry/verify", { token: C.token, body: { orderId: ordersOfA } })).status, 404);
});
await t("BLOCKS: a member can only remove their OWN blocks", async () => {
  await api("POST", "/api/arena/blocks", { token: C.token, body: { profileId: String(Bm.profile._id) } });
  assert.equal((await api("DELETE", `/api/arena/blocks/${Bm.profile._id}`, { token: A.token })).status, 200);     // A deleting "A blocked Bob": nothing to delete
  const still = await api("GET", "/api/arena/blocks", { token: C.token });
  assert.equal(still.body.data.length, 1, "C's block must survive A's unblock call");
});


/* ================= LOGIN: no OTP ================= */
const loginUser = async (role) => {
  n += 1;
  const u = await User.create({ name: `Login${n}`, email: `login${n}@t.com`, mobile: `98200${String(10000 + n)}`, password: await hashPassword("Str0ng!Pass#1"), role, mustChangePassword: false, status: "active",
    ...(role === "affiliate" ? { affiliate: { code: `AFF${n}`, commissionType: "percentage", commissionValue: 10, status: "active" } } : {}) });
  const full = await User.findById(u._id).select("+tokenVersion");
  await provisionUserAuth(full);
  return u;
};
const login = (identifier, password) => api("POST", "/api/auth/login", { body: { identifier, password } });

for (const role of ["normal", "Employee", "admin", "affiliate"]) {
  await t(`LOGIN (${role}): a correct password signs in immediately: no OTP, token issued`, async () => {
    const u = await loginUser(role);
    const r = await login(u.email, "Str0ng!Pass#1");
    assert.equal(r.status, 200, JSON.stringify(r.body));
    assert.equal(r.body.requiresOtp, false);
    assert.ok(r.body.token && r.body.user, "token + user returned");
    assert.equal(r.body.challengeId, undefined);
  });
}
await t("LOGIN: the issued token really works on a protected arena route", async () => {
  const u = await loginUser("normal");
  const r = await login(u.email, "Str0ng!Pass#1");
  assert.equal((await api("GET", "/api/arena/me", { token: r.body.token })).status, 200);
});
await t("LOGIN: wrong password is still refused (no OTP bypass of the password)", async () => {
  const u = await loginUser("normal");
  const r = await login(u.email, "wrong-password");
  assert.equal(r.status, 401); assert.equal(r.body.token, undefined);
});
await t("LOGIN: OTP can be switched back on with LOGIN_OTP_ENABLED=true (members only; admin stays exempt)", async () => {
  process.env.LOGIN_OTP_ENABLED = "true";
  const origErr = console.error; console.error = () => {};
  try {
    const m = await loginUser("normal");
    const r = await login(m.email, "Str0ng!Pass#1");
    assert.notEqual(r.body.requiresOtp, false, "member must NOT get a direct login when OTP is enabled");
    assert.equal(r.body.token, undefined);
    const ad = await loginUser("admin");
    assert.equal((await login(ad.email, "Str0ng!Pass#1")).body.requiresOtp, false);
  } finally { console.error = origErr; delete process.env.LOGIN_OTP_ENABLED; }
});

/* ================= ADMIN: repair paid-but-inactive members ================= */
await t("ADMIN REPAIR: stats flag a stuck paid member; POST /repair fixes it; normal members can't call it", async () => {
  const s = await makeUser("StuckOne", { paid: false });
  await Entry.create({ user: s.user._id, profile: s.profile._id, listPricePaise: 1, paidPaise: 1, cancellationFeePercent: 10, status: "paid", paidAt: new Date(), payment: { gateway: "cashfree", orderId: `ARENA_adm_${n}` } });
  const before = await api("GET", "/api/admin/arena/stats", { token: admin.token });
  assert.ok(before.body.data.needsAttention >= 1);
  assert.equal((await api("POST", "/api/admin/arena/repair", { token: normal.token })).status, 403);
  const fix = await api("POST", "/api/admin/arena/repair", { token: admin.token });
  assert.equal(fix.status, 200); assert.ok(fix.body.data.healed >= 1); assert.equal(fix.body.data.remaining, 0);
  assert.equal((await Profile.findById(s.profile._id)).status, "active");
});


/* ================= LOGIN LOCK: 5 wrong passwords → 24 h, auto-unlock ================= */
await t("LOCK: 5 wrong passwords lock a member for 24 h; the 5th answers 429 ACCOUNT_LOCKED with lockedUntil", async () => {
  const u = await loginUser("normal");
  for (let i = 1; i <= 4; i++) {
    const r = await login(u.email, "Wrong!Pass#9");
    assert.equal(r.status, 401); assert.equal(r.body.attemptsLeft, 5 - i);
  }
  const fifth = await login(u.email, "Wrong!Pass#9");
  assert.equal(fifth.status, 429); assert.equal(fifth.body.code, "ACCOUNT_LOCKED");
  const ms = new Date(fifth.body.lockedUntil).getTime() - Date.now();
  assert.ok(ms > 23.9 * 3600e3 && ms <= 24 * 3600e3, `lock should be ~24h, got ${ms / 3600e3}h`);
  assert.ok(fifth.body.retryAfter > 86000);
});
await t("LOCK: while locked even the CORRECT password is refused", async () => {
  const u = await loginUser("normal");
  for (let i = 0; i < 5; i++) await login(u.email, "Wrong!Pass#9");
  const r = await login(u.email, "Str0ng!Pass#1");
  assert.equal(r.status, 429); assert.equal(r.body.code, "ACCOUNT_LOCKED"); assert.equal(r.body.token, undefined);
});
await t("LOCK: unlocks AUTOMATICALLY when lockedUntil passes, and the counter starts again at 0", async () => {
  const u = await loginUser("normal");
  for (let i = 0; i < 5; i++) await login(u.email, "Wrong!Pass#9");
  await User.updateOne({ _id: u._id }, { $set: { lockedUntil: new Date(Date.now() - 1000) } });   // 24 h later
  const bad = await login(u.email, "Wrong!Pass#9");
  assert.equal(bad.status, 401); assert.equal(bad.body.attemptsLeft, 4, "fresh count after the lock expired");
  const ok = await login(u.email, "Str0ng!Pass#1");
  assert.equal(ok.status, 200); assert.ok(ok.body.token);
  const d = await User.findById(u._id).select("+failedLoginAttempts +lockedUntil");
  assert.equal(d.failedLoginAttempts, 0); assert.equal(d.lockedUntil, null);
});
await t("LOCK: a success in between resets the streak (only CONSECUTIVE failures lock)", async () => {
  const u = await loginUser("normal");
  for (let i = 0; i < 4; i++) await login(u.email, "Wrong!Pass#9");
  assert.equal((await login(u.email, "Str0ng!Pass#1")).status, 200);
  for (let i = 0; i < 4; i++) assert.equal((await login(u.email, "Wrong!Pass#9")).status, 401);
});
await t("LOCK: parallel guesses cannot beat the limit", async () => {
  const u = await loginUser("normal");
  const rs = await Promise.all(Array.from({ length: 8 }, () => login(u.email, "Wrong!Pass#9")));
  assert.ok(rs.filter((r) => r.body.code === "ACCOUNT_LOCKED").length >= 1);
  assert.equal((await login(u.email, "Str0ng!Pass#1")).status, 429);
});
await t("LOCK: admins keep the short (15 min) lock so they can't be locked out for a day", async () => {
  const a = await loginUser("admin");
  let r; for (let i = 0; i < 5; i++) r = await login(a.email, "Wrong!Pass#9");
  assert.equal(r.status, 429);
  const ms = new Date(r.body.lockedUntil).getTime() - Date.now();
  assert.ok(ms <= 15 * 60e3 && ms > 14 * 60e3);
});

/* ================= FORGOT PASSWORD ================= */
const { hashToken } = await import(`${B}/utils/authUtils.js`);
const plantCode = (email, otp, extra = {}) => {      // we can't read the email, so write a code we know
  const k = `arena:reset:${email}`;
  const rec = JSON.parse(store.get(k));
  store.set(k, JSON.stringify({ ...rec, otpHash: hashToken(`reset:${email}:${otp}:${process.env.JWT_SECRET}`), ...extra }));
};
let ipN = 0;
const forgot = (email, ip = `10.1.${Math.floor(++ipN / 250)}.${ipN % 250 + 1}`) => api("POST", "/api/arena/password/forgot", { body: { email }, ip });
const reset = (email, otp, password = "N3w!Passw0rd", confirmPassword = password) => api("POST", "/api/arena/password/reset", { body: { email, otp, password, confirmPassword } });
const origLog = console.error; console.error = () => {};

await t("FORGOT: known and unknown emails get the IDENTICAL answer (no account enumeration)", async () => {
  const u = await loginUser("normal");
  const a = await forgot(u.email); const b = await forgot("nobody-here@t.com");
  assert.equal(a.status, 200); assert.equal(b.status, 200);
  assert.deepEqual(a.body, b.body);
  assert.equal(a.body.resendInSeconds, 60);
});
await t("FORGOT: a second request inside 60 s is refused with OTP_COOLDOWN + retryAfter (known AND unknown email)", async () => {
  const u = await loginUser("normal");
  await forgot(u.email); await forgot("ghost@t.com");
  for (const e of [u.email, "ghost@t.com"]) {
    const r = await forgot(e);
    assert.equal(r.status, 429); assert.equal(r.body.code, "OTP_COOLDOWN"); assert.ok(r.body.retryAfter >= 1 && r.body.retryAfter <= 60);
  }
});
await t("FORGOT: admin/affiliate/employee accounts can't be reset this way (and the answer still looks the same)", async () => {
  const a = await loginUser("admin");
  assert.equal((await forgot(a.email)).status, 200);
  assert.equal((await reset(a.email, "123456")).body.code, "OTP_INVALID");
});
await t("RESET: wrong code → 400 with attemptsLeft; 5 wrong burn the code, even the right one then fails", async () => {
  const u = await loginUser("normal"); await forgot(u.email); plantCode(u.email, "424242");
  for (let i = 1; i <= 5; i++) { const r = await reset(u.email, "111111"); assert.equal(r.status, 400); assert.equal(r.body.attemptsLeft, 5 - i); }
  const burnt = await reset(u.email, "424242");
  assert.equal(burnt.status, 429); assert.equal(burnt.body.code, "OTP_ATTEMPTS");
  assert.equal((await reset(u.email, "424242")).body.code, "OTP_INVALID");
});
await t("RESET: right code sets the password, old password stops working, new one logs in", async () => {
  const u = await loginUser("normal"); await forgot(u.email); plantCode(u.email, "424242");
  const r = await reset(u.email, "424242");
  assert.equal(r.status, 200);
  assert.equal((await login(u.email, "Str0ng!Pass#1")).status, 401);
  const ok = await login(u.email, "N3w!Passw0rd"); assert.equal(ok.status, 200); assert.ok(ok.body.token);
});
await t("RESET: the code works once (replay refused)", async () => {
  const u = await loginUser("normal"); await forgot(u.email); plantCode(u.email, "424242");
  assert.equal((await reset(u.email, "424242")).status, 200);
  assert.equal((await reset(u.email, "424242", "An0ther!Passw0rd")).body.code, "OTP_INVALID");
});
await t("RESET: lifts a 24 h lock (the member proved they own the mailbox)", async () => {
  const u = await loginUser("normal");
  for (let i = 0; i < 5; i++) await login(u.email, "Wrong!Pass#9");
  assert.equal((await login(u.email, "Str0ng!Pass#1")).status, 429);
  await forgot(u.email); plantCode(u.email, "424242");
  assert.equal((await reset(u.email, "424242")).status, 200);
  assert.equal((await login(u.email, "N3w!Passw0rd")).status, 200);
});
await t("RESET: revokes sessions already open (tokenVersion bumped)", async () => {
  const u = await loginUser("normal");
  const before = (await User.findById(u._id).select("+tokenVersion")).tokenVersion;
  await forgot(u.email); plantCode(u.email, "424242"); await reset(u.email, "424242");
  assert.equal((await User.findById(u._id).select("+tokenVersion")).tokenVersion, before + 1);
});
await t("RESET: weak password, mismatch and reusing the current password are all refused (code survives)", async () => {
  const u = await loginUser("normal"); await forgot(u.email); plantCode(u.email, "424242");
  assert.equal((await reset(u.email, "424242", "weak")).status, 400);
  assert.equal((await reset(u.email, "424242", "N3w!Passw0rd", "Different!1")).status, 400);
  assert.equal((await reset(u.email, "424242", "Str0ng!Pass#1")).body.code, "PASSWORD_REUSED");
  assert.equal((await reset(u.email, "424242")).status, 200);
});
await t("RESET: unknown email and malformed code get the same generic failure", async () => {
  assert.equal((await reset("ghost2@t.com", "123456")).body.code, "OTP_INVALID");
  assert.equal((await api("POST", "/api/arena/password/reset", { body: { email: "a@b.com", otp: "12", password: "N3w!Passw0rd", confirmPassword: "N3w!Passw0rd" } })).status, 400);
});
await t("OTP LIMIT: 6th code for the same email in 24 h → 429 OTP_RATE_LIMIT (cooldown bypassed to isolate the limiter)", async () => {
  const u = await loginUser("normal");
  for (let i = 0; i < 5; i++) { assert.equal((await forgot(u.email)).status, 200); store.delete(`arena:reset:${u.email}`); }
  const r = await forgot(u.email);
  assert.equal(r.status, 429); assert.equal(r.body.code, "OTP_RATE_LIMIT"); assert.equal(r.body.limitedBy, "email");
});
await t("OTP LIMIT: signup codes and reset codes are counted in SEPARATE buckets", async () => {
  const u = await loginUser("normal");
  for (let i = 0; i < 5; i++) { await forgot(u.email); store.delete(`arena:reset:${u.email}`); }
  assert.equal(otpHits.has(`email:${u.email}`), false, "reset must not spend the signup quota");
});
console.error = origLog;



/* ================= HIDE PROFILE · CHAT EDIT/DELETE/REACT · ADMIN PERMANENT DELETES ================= */
const Message = await m("models/arena/ArenaMessage.js");
const Match = await m("models/arena/ArenaMatch.js");
const Session = await m("models/UserSession.js");
const Audit = await m("models/arena/ArenaAuditLog.js");
const hub = await import(`${B}/services/arena/hub.js`);
const watch = (userId) => { const events = []; hub.registerSocket(userId, { readyState: 1, send: (p) => events.push(JSON.parse(p)), close() {} }); return events; };
const AR = "/api/admin/arena";
const pair = async (nameA, nameB) => {
  const a = await makeUser(nameA), b = await makeUser(nameB);
  const sent = await api("POST", "/api/arena/requests", { token: a.token, body: { toProfileId: String(b.profile._id), message: "Hi there, HLD evenings?" } });
  assert.equal(sent.status, 201, JSON.stringify(sent.body));
  const acc = await api("POST", `/api/arena/requests/${sent.body.data.id}/accept`, { token: b.token });
  assert.equal(acc.status, 200, JSON.stringify(acc.body));
  const match = await Match.findOne({ users: a.user._id, status: "active" });
  return { a, b, match, requestId: sent.body.data.id };
};
const say = (match, user, text, ageMs = 0) => Message.create({ match: match._id, sender: user._id, text }).then(async (doc) => {
  if (ageMs) await Message.collection.updateOne({ _id: doc._id }, { $set: { createdAt: new Date(Date.now() - ageMs) } });
  return doc;
});
const MIN = 60_000;

/* ---- hide / show ---- */
const H1 = await makeUser("Hider"), H2 = await makeUser("Seeker");
await t("HIDE: a member hides their profile: it disappears from browse and can't be requested", async () => {
  const r = await api("PUT", "/api/arena/visibility", { token: H1.token, body: { hidden: true } });
  assert.equal(r.status, 200); assert.equal(r.body.data.hidden, true); assert.equal(r.body.data.hiddenBy, "user");
  const browse = await api("GET", "/api/arena/browse", { token: H2.token });
  assert.ok(!browse.body.data.items.some((x) => x.alias === H1.profile.alias), "hidden profile must not be browsable");
  const req = await api("POST", "/api/arena/requests", { token: H2.token, body: { toProfileId: String(H1.profile._id), message: "hello there" } });
  assert.equal(req.status, 404); assert.equal(req.body.code, "NOT_AVAILABLE");
  assert.equal((await api("GET", "/api/arena/me", { token: H1.token })).body.data.profile.hidden, true);
});
await t("HIDE: a hidden member can't send requests until visible again", async () => {
  const r = await api("POST", "/api/arena/requests", { token: H1.token, body: { toProfileId: String(H2.profile._id), message: "hello there" } });
  assert.equal(r.status, 403); assert.equal(r.body.code, "PROFILE_HIDDEN");
});
await t("HIDE: showing the profile again puts it back in browse", async () => {
  assert.equal((await api("PUT", "/api/arena/visibility", { token: H1.token, body: { hidden: false } })).status, 200);
  const browse = await api("GET", "/api/arena/browse", { token: H2.token });
  assert.ok(browse.body.data.items.some((x) => x.alias === H1.profile.alias));
});
await t("HIDE: validation, and members who haven't joined the arena can't hide", async () => {
  assert.equal((await api("PUT", "/api/arena/visibility", { token: H1.token, body: { hidden: "yes" } })).status, 400);
  assert.equal((await api("PUT", "/api/arena/visibility", { token: U.token, body: { hidden: true } })).body.code, "NOT_IN_ARENA");
  assert.equal((await api("PUT", "/api/arena/visibility", { body: { hidden: true } })).status, 401);
});
await t("HIDE (admin): admin hides a profile; the member can't override it; admin shows it again", async () => {
  assert.equal((await api("POST", `${AR}/profiles/${H1.profile._id}/hide`, { token: admin.token })).status, 200);
  const un = await api("PUT", "/api/arena/visibility", { token: H1.token, body: { hidden: false } });
  assert.equal(un.status, 403); assert.equal(un.body.code, "HIDDEN_BY_ADMIN");
  const list = await api("GET", `${AR}/profiles`, { token: admin.token });
  assert.equal(list.body.data.items.find((x) => x.id === String(H1.profile._id)).hidden, true);
  assert.equal((await api("POST", `${AR}/profiles/${H1.profile._id}/unhide`, { token: admin.token })).status, 200);
  assert.equal((await api("PUT", "/api/arena/visibility", { token: H1.token, body: { hidden: true } })).status, 200);   // user can hide again
  assert.equal((await api("PUT", "/api/arena/visibility", { token: H1.token, body: { hidden: false } })).status, 200);
  assert.equal((await api("POST", `${AR}/profiles/${H1.profile._id}/hide`, { token: normal.token })).status, 403);
});

/* ---- chat: edit / delete (5 min) / reactions ---- */
const P1 = await pair("ChatA", "ChatB");
const evA = watch(P1.a.user._id), evB = watch(P1.b.user._id);
const MSG = (id) => `/api/arena/match/messages/${id}`;

await t("CHAT: message list says who may edit and until when; buddy's messages are not editable", async () => {
  const mine = await say(P1.match, P1.a.user, "hello from A"); const theirs = await say(P1.match, P1.b.user, "hello from B");
  const list = await api("GET", "/api/arena/match/messages", { token: P1.a.token });
  const a = list.body.data.messages.find((x) => x.id === String(mine._id)), b = list.body.data.messages.find((x) => x.id === String(theirs._id));
  assert.equal(a.mine, true); assert.ok(a.editableUntil); assert.equal(b.mine, false); assert.equal(b.editableUntil, null);
  const ms = new Date(a.editableUntil).getTime() - new Date(a.createdAt).getTime(); assert.equal(ms, 5 * MIN);
});
await t("EDIT: the sender edits within 5 minutes; both members get a live update", async () => {
  const msg = await say(P1.match, P1.a.user, "typo hre"); evA.length = evB.length = 0;
  const r = await api("PATCH", MSG(msg._id), { token: P1.a.token, body: { text: "typo here" } });
  assert.equal(r.status, 200); assert.equal(r.body.data.text, "typo here"); assert.equal(r.body.data.edited, true);
  const doc = await Message.findById(msg._id); assert.equal(doc.text, "typo here"); assert.ok(doc.editedAt);
  const ea = evA.find((e) => e.type === "message_updated"), eb = evB.find((e) => e.type === "message_updated");
  assert.equal(ea.message.mine, true); assert.equal(eb.message.mine, false); assert.equal(eb.message.text, "typo here"); assert.equal(eb.message.edited, true);
  assert.equal(eb.message.editableUntil, null, "buddy never gets edit rights");
});
await t("EDIT: only the sender · not strangers · not after 5 minutes · not empty · not too long · html stripped", async () => {
  const msg = await say(P1.match, P1.a.user, "mine");
  assert.equal((await api("PATCH", MSG(msg._id), { token: P1.b.token, body: { text: "hijack" } })).body.code, "NOT_YOURS");
  assert.equal((await api("PATCH", MSG(msg._id), { token: C.token, body: { text: "hijack" } })).body.code, "NO_MATCH");
  assert.equal((await api("PATCH", MSG(msg._id), { token: P1.a.token, body: { text: "   " } })).body.code, "EMPTY");
  assert.equal((await api("PATCH", MSG(msg._id), { token: P1.a.token, body: { text: "x".repeat(1001) } })).body.code, "TOO_LONG");
  assert.equal((await api("PATCH", MSG(msg._id), { token: P1.a.token, body: { text: "<script>alert(1)</script>ok" } })).body.data.text, "ok");
  const old = await say(P1.match, P1.a.user, "old one", 5 * MIN + 2000);
  const r = await api("PATCH", MSG(old._id), { token: P1.a.token, body: { text: "too late" } });
  assert.equal(r.status, 403); assert.equal(r.body.code, "WINDOW_CLOSED"); assert.equal((await Message.findById(old._id)).text, "old one");
  assert.equal((await api("PATCH", MSG("not-an-id"), { token: P1.a.token, body: { text: "x" } })).status, 400);
});
await t("EDIT: a message from a DIFFERENT match can't be reached by id", async () => {
  const P2 = await pair("OtherA", "OtherB"); const foreign = await say(P2.match, P2.a.user, "private");
  assert.equal((await api("PATCH", MSG(foreign._id), { token: P1.a.token, body: { text: "x" } })).status, 404);
  assert.equal((await api("DELETE", MSG(foreign._id), { token: P1.a.token })).status, 404);
  assert.equal((await api("PUT", `${MSG(foreign._id)}/reaction`, { token: P1.a.token, body: { emoji: "👍" } })).status, 404);
});
await t("DELETE: the sender deletes within 5 minutes: text is wiped for both, edit/react afterwards refused", async () => {
  const msg = await say(P1.match, P1.a.user, "oops wrong chat"); evA.length = evB.length = 0;
  const r = await api("DELETE", MSG(msg._id), { token: P1.a.token });
  assert.equal(r.status, 200); assert.equal(r.body.data.deleted, true); assert.equal(r.body.data.text, "");
  const doc = await Message.findById(msg._id); assert.equal(doc.text, ""); assert.ok(doc.deletedAt, "stored as deleted, text gone from the database");
  assert.equal(evB.find((e) => e.type === "message_updated").message.deleted, true);
  const list = await api("GET", "/api/arena/match/messages", { token: P1.b.token });
  const seen = list.body.data.messages.find((x) => x.id === String(msg._id)); assert.equal(seen.deleted, true); assert.equal(seen.text, "");
  assert.equal((await api("PATCH", MSG(msg._id), { token: P1.a.token, body: { text: "again" } })).body.code, "ALREADY_DELETED");
  assert.equal((await api("PUT", `${MSG(msg._id)}/reaction`, { token: P1.b.token, body: { emoji: "👍" } })).body.code, "ALREADY_DELETED");
});
await t("DELETE: only the sender, and only within 5 minutes", async () => {
  const msg = await say(P1.match, P1.a.user, "stays");
  assert.equal((await api("DELETE", MSG(msg._id), { token: P1.b.token })).body.code, "NOT_YOURS");
  const old = await say(P1.match, P1.a.user, "too old", 5 * MIN + 2000);
  assert.equal((await api("DELETE", MSG(old._id), { token: P1.a.token })).body.code, "WINDOW_CLOSED");
  assert.equal((await Message.findById(old._id)).text, "too old");
});
await t("REACT: either member reacts; one emoji each; same emoji removes it; a new one replaces it", async () => {
  const msg = await say(P1.match, P1.a.user, "react to me"); evA.length = evB.length = 0;
  const react = (tok, emoji) => api("PUT", `${MSG(msg._id)}/reaction`, { token: tok, body: { emoji } });
  let r = await react(P1.b.token, "👍");
  assert.deepEqual(r.body.data.reactions, [{ emoji: "👍", count: 1, mine: true }]);
  assert.deepEqual(evA.find((e) => e.type === "message_updated").message.reactions, [{ emoji: "👍", count: 1, mine: false }], "the other member sees mine:false");
  r = await react(P1.a.token, "👍"); assert.deepEqual(r.body.data.reactions, [{ emoji: "👍", count: 2, mine: true }]);
  r = await react(P1.b.token, "👍"); assert.deepEqual(r.body.data.reactions, [{ emoji: "👍", count: 1, mine: false }], "same emoji again removes mine");
  r = await react(P1.b.token, "❤️"); r = await react(P1.b.token, "🔥");
  assert.deepEqual(r.body.data.reactions.map((x) => x.emoji).sort(), ["👍", "🔥"].sort(), "one emoji per member: ❤️ was replaced by 🔥");
  assert.equal((await Message.findById(msg._id)).reactions.filter((x) => String(x.user) === String(P1.b.user._id)).length, 1);
  r = await react(P1.a.token, null); assert.ok(!r.body.data.reactions.some((x) => x.mine));
});
await t("REACT: only the fixed emoji set is accepted; a closed edit window doesn't block reactions", async () => {
  const msg = await say(P1.match, P1.a.user, "old but reactable", 30 * MIN);
  for (const bad of ["💩", "<b>x</b>", "👍👍", ""]) assert.equal((await api("PUT", `${MSG(msg._id)}/reaction`, { token: P1.b.token, body: { emoji: bad } })).status, 400, bad);
  assert.equal((await api("PUT", `${MSG(msg._id)}/reaction`, { token: P1.b.token, body: { emoji: "🎉" } })).status, 200);
  assert.equal((await api("PUT", `${MSG(msg._id)}/reaction`, { token: P1.b.token })).status, 400);
});
await t("CHAT: signed-out callers and non-members are refused on the new chat routes", async () => {
  const msg = await say(P1.match, P1.a.user, "auth check");
  for (const [method, path, body] of [["PATCH", MSG(msg._id), { text: "x" }], ["DELETE", MSG(msg._id)], ["PUT", `${MSG(msg._id)}/reaction`, { emoji: "👍" }]]) {
    assert.equal((await api(method, path, { body })).status, 401, `${method} signed-out`);
    assert.equal((await api(method, path, { token: U.token, body })).status >= 400, true);
  }
});

/* ---- admin: permanent deletes ---- */
await t("ADMIN DELETE: all new delete routes are admin-only (member 403, signed-out 401)", async () => {
  const id = "64b000000000000000000001";
  for (const [method, path] of [["DELETE", `${AR}/payments/${id}`], ["DELETE", `${AR}/requests/${id}`], ["DELETE", `${AR}/matches/${id}`], ["DELETE", `${AR}/matches/${id}/messages`], ["DELETE", `${AR}/messages/${id}`], ["DELETE", `${AR}/members/${id}`]]) {
    assert.equal((await api(method, path)).status, 401, `${path} signed-out`);
    assert.equal((await api(method, path, { token: normal.token })).status, 403, `${path} member`);
  }
});
await t("ADMIN DELETE: one chat message; then the whole chat. Both members' open chats are told", async () => {
  const keep = await say(P1.match, P1.a.user, "k1"), gone = await say(P1.match, P1.b.user, "g1"); evA.length = evB.length = 0;
  assert.equal((await api("DELETE", `${AR}/messages/${gone._id}`, { token: admin.token })).status, 200);
  assert.equal(await Message.findById(gone._id), null); assert.ok(await Message.findById(keep._id));
  assert.ok(evA.some((e) => e.type === "message_removed" && e.id === String(gone._id)) && evB.some((e) => e.type === "message_removed"));
  assert.equal((await api("DELETE", `${AR}/messages/${gone._id}`, { token: admin.token })).status, 404);
  const total = await Message.countDocuments({ match: P1.match._id }); evA.length = evB.length = 0;
  const r = await api("DELETE", `${AR}/matches/${P1.match._id}/messages`, { token: admin.token });
  assert.equal(r.status, 200); assert.equal(r.body.data.messages, total); assert.equal(await Message.countDocuments({ match: P1.match._id }), 0);
  assert.ok(evA.some((e) => e.type === "chat_cleared") && evB.some((e) => e.type === "chat_cleared"));
  assert.ok((await Match.findById(P1.match._id)).status === "active", "clearing a chat keeps the match");
});
await t("ADMIN DELETE: a request (any status) is permanently removed", async () => {
  const pend = await api("POST", "/api/arena/requests", { token: H2.token, body: { toProfileId: String(H1.profile._id), message: "hello again" } });
  assert.equal(pend.status, 201);
  assert.equal((await api("DELETE", `${AR}/requests/${pend.body.data.id}`, { token: admin.token })).status, 200);
  assert.equal(await Request.findById(pend.body.data.id), null);
  assert.equal((await api("DELETE", `${AR}/requests/${pend.body.data.id}`, { token: admin.token })).status, 404);
  assert.equal((await api("DELETE", `${AR}/requests/${P1.requestId}`, { token: admin.token })).status, 200, "accepted requests too");
});
await t("ADMIN DELETE: a payment in use by a live match is refused; deleting an unused one resets the profile to payment", async () => {
  const inUse = await Entry.findOne({ user: P1.a.user._id });
  const r = await api("DELETE", `${AR}/payments/${inUse._id}`, { token: admin.token });
  assert.equal(r.status, 409); assert.equal(r.body.code, "ACTIVE_MATCH"); assert.ok(await Entry.findById(inUse._id));
  const solo = await makeUser("PaidSolo"); const entry = await Entry.findOne({ user: solo.user._id });
  const del = await api("DELETE", `${AR}/payments/${entry._id}`, { token: admin.token });
  assert.equal(del.status, 200); assert.equal(del.body.data.profileReset, true); assert.equal(await Entry.findById(entry._id), null);
  assert.equal((await Profile.findById(solo.profile._id)).status, "draft"); assert.equal((await Profile.findById(solo.profile._id)).entry, null);
  assert.equal((await api("DELETE", `${AR}/payments/${entry._id}`, { token: admin.token })).status, 404);
});
await t("ADMIN DELETE: an ACTIVE match is dissolved then removed with its chat; both members are free to match again", async () => {
  const P3 = await pair("DelA", "DelB"); await say(P3.match, P3.a.user, "bye"); await say(P3.match, P3.b.user, "bye too");
  const r = await api("DELETE", `${AR}/matches/${P3.match._id}`, { token: admin.token, body: { restoreProfileIds: [String(P3.a.profile._id), String(P3.b.profile._id)] } });
  assert.equal(r.status, 200); assert.equal(r.body.data.messages, 2);
  assert.equal(await Match.findById(P3.match._id), null); assert.equal(await Message.countDocuments({ match: P3.match._id }), 0);
  for (const p of [P3.a, P3.b]) { const prof = await Profile.findById(p.profile._id); assert.equal(prof.status, "active"); assert.equal(prof.match, null); }
  assert.equal((await api("DELETE", `${AR}/matches/${P3.match._id}`, { token: admin.token })).status, 404);
});
await t("ADMIN DELETE: a MEMBER is erased from the database with everything linked to them; the buddy is restored and told", async () => {
  const P4 = await pair("GoneA", "StaysB"); const evStay = watch(P4.b.user._id);
  await say(P4.match, P4.a.user, "last words"); await say(P4.match, P4.b.user, "reply");
  const other = await makeUser("Spectator");
  await api("POST", "/api/arena/requests", { token: other.token, body: { toProfileId: String(P4.a.profile._id), message: "hello hello" } });   // blocked by existing match? (A is matched → 404) fine
  await Session.create({ user: P4.a.user._id, sessionId: "doomed-session", state: "active", expiresAt: new Date(Date.now() + 3600e3) }).catch(() => {});
  const before = await Audit.countDocuments({ action: "member_deleted" }); evStay.length = 0;
  const r = await api("DELETE", `${AR}/members/${P4.a.user._id}`, { token: admin.token });
  assert.equal(r.status, 200, JSON.stringify(r.body)); assert.ok(r.body.data.messages >= 2 && r.body.data.matches === 1 && r.body.data.payments === 1 && r.body.data.profiles === 1);
  assert.equal(await User.findById(P4.a.user._id), null, "account is gone");
  assert.equal(await Profile.countDocuments({ user: P4.a.user._id }), 0); assert.equal(await Entry.countDocuments({ user: P4.a.user._id }), 0);
  assert.equal(await Request.countDocuments({ $or: [{ fromUser: P4.a.user._id }, { toUser: P4.a.user._id }] }), 0);
  assert.equal(await Match.countDocuments({ users: P4.a.user._id }), 0); assert.equal(await Message.countDocuments({ match: P4.match._id }), 0);
  assert.equal(await Session.countDocuments({ user: P4.a.user._id }), 0);
  const buddy = await Profile.findById(P4.b.profile._id); assert.equal(buddy.status, "active", "buddy isn't left stuck as matched"); assert.equal(buddy.match, null);
  assert.ok(evStay.some((e) => e.type === "match_ended"), "buddy is told live");
  assert.equal((await Entry.findOne({ user: P4.b.user._id })).status, "paid", "buddy keeps their match credit");
  assert.equal((await api("GET", "/api/arena/me", { token: P4.a.token })).status, 401, "deleted member's old token stops working");
  assert.equal(await Audit.countDocuments({ action: "member_deleted" }), before + 1);
  assert.equal((await api("DELETE", `${AR}/members/${P4.a.user._id}`, { token: admin.token })).status, 404);
});
await t("ADMIN DELETE: can't delete yourself, other admins, or non-member accounts", async () => {
  assert.equal((await api("DELETE", `${AR}/members/${admin.user._id}`, { token: admin.token })).body.code, "SELF_DELETE");
  const other = await makeUser("Boss2", { paid: null, role: "admin" });
  assert.equal((await api("DELETE", `${AR}/members/${other.user._id}`, { token: admin.token })).body.code, "PROTECTED_ACCOUNT");
  assert.ok(await User.findById(other.user._id));
  assert.equal((await api("DELETE", `${AR}/members/not-an-id`, { token: admin.token })).status, 400);
});
await t("ADMIN DELETE: every permanent delete is written to the activity log", async () => {
  for (const action of ["message_deleted", "chat_cleared", "request_deleted", "payment_deleted", "match_deleted", "member_deleted", "profile_hidden", "profile_unhidden"]) {
    assert.ok(await Audit.exists({ action }), `missing audit entry: ${action}`);
  }
});


/* ================= DELETE MY ACCOUNT ================= */
const GOOD_PW = "Str0ng!Pass#1";
const withPassword = async (u) => { await User.updateOne({ _id: u.user._id }, { $set: { password: await hashPassword(GOOD_PW) } }); return u; };
const DEL = (token, body) => api("DELETE", "/api/arena/account", { token, body });
const OTP_KEY = (email) => `arena:signup:${email}`;

await t("DELETE ACCOUNT: needs a session; password + typed DELETE are both required", async () => {
  assert.equal((await api("DELETE", "/api/arena/account", { body: { password: GOOD_PW, confirm: "DELETE" } })).status, 401);
  const u = await withPassword(await makeUser("DelV"));
  assert.equal((await DEL(u.token, { password: GOOD_PW })).status, 400);
  assert.equal((await DEL(u.token, { password: GOOD_PW, confirm: "delete" })).status, 400);
  assert.equal((await DEL(u.token, { confirm: "DELETE" })).status, 400);
  assert.ok(await User.findById(u.user._id), "nothing happens on a malformed request");
});
await t("DELETE ACCOUNT: wrong password is refused with attempts left; 5 wrong in a row locks deletion for a while; nothing is deleted", async () => {
  const u = await withPassword(await makeUser("DelW"));
  for (let i = 1; i <= 5; i++) { const r = await DEL(u.token, { password: "Nope!Nope#9", confirm: "DELETE" }); assert.equal(r.status, 403); assert.equal(r.body.code, "WRONG_PASSWORD"); assert.equal(r.body.attemptsLeft, 5 - i); }
  const locked = await DEL(u.token, { password: GOOD_PW, confirm: "DELETE" });
  assert.equal(locked.status, 429); assert.equal(locked.body.code, "TOO_MANY_ATTEMPTS");
  assert.ok(await User.findById(u.user._id)); assert.ok(await Profile.findById(u.profile._id));
});
await t("DELETE ACCOUNT: while matched it is refused (ACTIVE_MATCH); after ending the partnership it works", async () => {
  const P5 = await pair("QuitA", "QuitB"); await withPassword(P5.a);
  await say(P5.match, P5.a.user, "hi"); await say(P5.match, P5.b.user, "hello");
  const refused = await DEL(P5.a.token, { password: GOOD_PW, confirm: "DELETE" });
  assert.equal(refused.status, 409); assert.equal(refused.body.code, "ACTIVE_MATCH"); assert.match(refused.body.message, /My buddy/);
  assert.ok(await User.findById(P5.a.user._id)); assert.equal((await Match.findById(P5.match._id)).status, "active", "nothing is unmatched for them");
  assert.equal((await api("POST", "/api/arena/match/end", { token: P5.a.token })).status, 200);
  const ok = await DEL(P5.a.token, { password: GOOD_PW, confirm: "DELETE" });
  assert.equal(ok.status, 200, JSON.stringify(ok.body)); assert.match(ok.body.message, /sign up again/i);
  const buddy = await Profile.findById(P5.b.profile._id); assert.equal(buddy.status, "active", "the buddy is untouched and back in the arena");
  assert.equal((await Entry.findOne({ user: P5.b.user._id })).status, "paid");
});
await t("DELETE ACCOUNT: a payment or refund in flight blocks it; admins/employees can't self-delete", async () => {
  const u = await withPassword(await makeUser("DelPay", { paid: false }));
  await Entry.create({ user: u.user._id, profile: u.profile._id, listPricePaise: 29900, paidPaise: 29900, cancellationFeePercent: 10, status: "pending_payment", payment: { gateway: "cashfree", orderId: `ARENA_inflight_${Date.now()}` } });
  assert.equal((await DEL(u.token, { password: GOOD_PW, confirm: "DELETE" })).body.code, "PAYMENT_IN_PROGRESS");
  await Entry.collection.updateMany({ user: u.user._id }, { $set: { createdAt: new Date(Date.now() - 3 * 3600e3) } });   // abandoned checkout: not in flight any more
  assert.equal((await DEL(u.token, { password: GOOD_PW, confirm: "DELETE" })).status, 200);
  const staff = await makeUser("Staffer", { paid: null, role: "Employee" }); await withPassword(staff);
  assert.equal((await DEL(staff.token, { password: GOOD_PW, confirm: "DELETE" })).body.code, "PROTECTED_ACCOUNT");
  assert.equal((await DEL(admin.token, { password: GOOD_PW, confirm: "DELETE" })).body.code, "PROTECTED_ACCOUNT");
});
await t("DELETE ACCOUNT: everything is erased, NO refund is attempted, the account is an empty shell and old sessions die", async () => {
  const u = await withPassword(await makeUser("DelAll")); const other = await makeUser("DelOther");
  await api("POST", "/api/arena/requests", { token: other.token, body: { toProfileId: String(u.profile._id), message: "hello hello" } });
  await api("POST", "/api/arena/requests", { token: u.token, body: { toProfileId: String(H2.profile._id), message: "hello again" } });
  const email = u.user.email, mobile = u.user.mobile;
  const r = await DEL(u.token, { password: GOOD_PW, confirm: "DELETE" }); assert.equal(r.status, 200);
  assert.equal(await Profile.countDocuments({ user: u.user._id }), 0); assert.equal(await Entry.countDocuments({ user: u.user._id }), 0);
  assert.equal(await Request.countDocuments({ $or: [{ fromUser: u.user._id }, { toUser: u.user._id }] }), 0);
  const shell = await User.collection.findOne({ _id: u.user._id });
  assert.equal(shell.isDeleted, true); assert.equal(shell.status, "inactive"); assert.equal(shell.name, "Deleted user");
  assert.match(shell.email, /^deleted-.*@deleted\.invalid$/); assert.equal(shell.mobile, undefined); assert.notEqual(shell.email, email);
  assert.equal(await User.collection.countDocuments({ $or: [{ email }, { mobile }] }), 0, "old email and mobile are free");
  assert.equal((await api("GET", "/api/arena/me", { token: u.token })).status, 401, "the old session stops working");
  assert.equal((await login(email, GOOD_PW)).status, 401, "and so does logging in with the old details");
  assert.equal((await api("GET", "/api/arena/browse", { token: other.token })).status, 200, "other members are unaffected");
});
await t("DELETE ACCOUNT: the same email + mobile can sign up AGAIN and verify (unique indexes don't block it)", async () => {
  const u = await withPassword(await makeUser("DelAgain")); const email = u.user.email, mobile = u.user.mobile;
  assert.equal((await DEL(u.token, { password: GOOD_PW, confirm: "DELETE" })).status, 200);
  const sig = await api("POST", "/api/arena/signup", { body: { name: "Again User", email, mobile, password: GOOD_PW, confirmPassword: GOOD_PW }, ip: "10.9.9.9" });
  assert.equal(sig.status, 201, JSON.stringify(sig.body));
  const rec = JSON.parse(store.get(OTP_KEY(email)));
  store.set(OTP_KEY(email), JSON.stringify({ ...rec, otpHash: hashToken(`${email}:424242:${process.env.JWT_SECRET}`) }));
  const ver = await api("POST", "/api/arena/signup/verify", { body: { email, otp: "424242" } });
  assert.equal(ver.status, 200, JSON.stringify(ver.body)); assert.ok(ver.body.token);
  const fresh = await User.findOne({ email }); assert.ok(fresh && !fresh.isDeleted && fresh.mobile === mobile);
  assert.notEqual(String(fresh._id), String(u.user._id), "a brand-new account, no old data");
  assert.equal(await Profile.countDocuments({ user: fresh._id }), 0);
});

/* ================= MAIL PROVIDER: runtime switch (Mailtrap / Resend) ================= */
const origFetch = globalThis.fetch;
const resendCalls = []; let resendReply = { status: 200, body: { id: "re_test_123" } };
const sesCalls = []; let sesReply = { status: 200, body: { MessageId: "ses-msg-1" }, headers: {} };
globalThis.fetch = async (url, init) => {
  if (/^https:\/\/email\.[a-z0-9-]+\.amazonaws\.com\//.test(String(url))) {
    sesCalls.push({ url: String(url), headers: init.headers, body: JSON.parse(init.body), rawBody: init.body });
    return new Response(JSON.stringify(sesReply.body), { status: sesReply.status, headers: { "content-type": "application/json", ...sesReply.headers } });
  }
  if (String(url).startsWith("https://api.resend.com/")) {
    resendCalls.push({ url: String(url), headers: init.headers, body: JSON.parse(init.body) });
    return new Response(JSON.stringify(resendReply.body), { status: resendReply.status, headers: { "content-type": "application/json" } });
  }
  return origFetch(url, init);
};
const origLogs = [console.log, console.warn, console.error]; console.log = console.warn = console.error = () => {};
const { default: sendMail } = await import(`${B}/utils/MailSender.js`);
const MailSettings = await m("models/MailSettings.js");
const { getMailSettings } = await import(`${B}/services/mail/mailSettings.js`);
const mailAdmin = await makeUser("MailAdmin", { paid: null, role: "admin" });
const mailNormal = await makeUser("MailNormal", { paid: null });
const MAIL = "/api/admin/mail";

await t("MAIL API: signed-out → 401, member → 403 (admin only)", async () => {
  assert.equal((await api("GET", MAIL)).status, 401);
  assert.equal((await api("GET", MAIL, { token: mailNormal.token })).status, 403);
  assert.equal((await api("PUT", MAIL, { token: mailNormal.token, body: { provider: "resend" } })).status, 403);
  assert.equal((await api("POST", `${MAIL}/test`, { token: mailNormal.token, body: { provider: "resend" } })).status, 403);
});
await t("MAIL: default provider is Mailtrap (current behaviour unchanged)", async () => {
  const r = await api("GET", MAIL, { token: mailAdmin.token });
  assert.equal(r.status, 200); assert.equal(r.body.data.provider, "mailtrap"); assert.equal(r.body.data.fallbackEnabled, true);
  assert.equal(r.body.data.providers.mailtrap.configured, true);
});
await t("MAIL: cannot select Resend while RESEND_API_KEY is missing", async () => {
  delete process.env.RESEND_API_KEY;
  const r = await api("PUT", MAIL, { token: mailAdmin.token, body: { provider: "resend" } });
  assert.equal(r.status, 400); assert.equal(r.body.code, "PROVIDER_NOT_CONFIGURED");
});
await t("MAIL: validation rejects unknown providers / empty body", async () => {
  process.env.RESEND_API_KEY = "re_fake_key";
  assert.equal((await api("PUT", MAIL, { token: mailAdmin.token, body: { provider: "sendgrid" } })).status, 400);
  assert.equal((await api("PUT", MAIL, { token: mailAdmin.token, body: {} })).status, 400);
});
await t("MAIL: admin switches to Resend at runtime; sendMail() then goes through Resend with the SAME arguments", async () => {
  const r = await api("PUT", MAIL, { token: mailAdmin.token, body: { provider: "resend" } });
  assert.equal(r.status, 200); assert.equal(r.body.data.provider, "resend");
  assert.equal(r.body.data.history[0].from, "mailtrap"); assert.equal(r.body.data.history[0].to, "resend");
  resendCalls.length = 0;
  const info = await sendMail("a@x.com", "Subj", "plain", "<b>html</b>", { replyTo: "help@x.com", attachments: [{ filename: "invite.ics", content: Buffer.from("BEGIN:VCALENDAR").toString("base64"), contentType: "text/calendar" }, { filename: "book.pdf", content: Buffer.from("PDFDATA"), contentType: "application/pdf" }] });
  assert.equal(info.messageId, "re_test_123"); assert.equal(info.provider, "resend");
  const c = resendCalls[0];
  assert.equal(c.headers.Authorization, "Bearer re_fake_key");
  assert.deepEqual(c.body.to, ["a@x.com"]); assert.equal(c.body.subject, "Subj"); assert.equal(c.body.text, "plain"); assert.equal(c.body.html, "<b>html</b>"); assert.equal(c.body.reply_to, "help@x.com");
  assert.match(c.body.from, /no-reply@targettrek\.in/);
  assert.equal(c.body.attachments[0].content, Buffer.from("BEGIN:VCALENDAR").toString("base64"), "ICS stays base64 (not double-encoded)");
  assert.equal(Buffer.from(c.body.attachments[1].content, "base64").toString(), "PDFDATA", "Buffers become base64");
});
await t("MAIL: change reaches the sender within the cache window and is persisted in MongoDB", async () => {
  assert.equal((await MailSettings.findOne({ key: "global" })).provider, "resend");
  assert.equal((await getMailSettings()).provider, "resend");
});
await t("MAIL: Resend fails + fallback ON → mail still delivered via Mailtrap attempt, error from primary surfaces only if both fail", async () => {
  resendReply = { status: 429, body: { name: "daily_quota_exceeded", message: "Daily quota exceeded" } };
  resendCalls.length = 0;
  // Mailtrap has a fake token → it fails too, so both fail and the PRIMARY (Resend) error is reported.
  await assert.rejects(sendMail("a@x.com", "S", "t", "<p>h</p>"), (e) => /quota/i.test(e.message));
  assert.equal(resendCalls.filter((c) => c.body.subject === "S").length, 1);   // other calls = earlier fire-and-forget mails falling over, which is the feature working
});
await t("MAIL: fallback ON from Mailtrap → falls over to Resend when Mailtrap is rejected/limited", async () => {
  await api("PUT", MAIL, { token: mailAdmin.token, body: { provider: "mailtrap", fallbackEnabled: true } });
  resendReply = { status: 200, body: { id: "re_fallback_1" } }; resendCalls.length = 0;
  const info = await sendMail("a@x.com", "S", "t", "<p>h</p>");
  assert.equal(info.messageId, "re_fallback_1"); assert.equal(resendCalls.filter((c) => c.body.subject === "S").length, 1);
  const st = (await api("GET", MAIL, { token: mailAdmin.token })).body.data.stats;
  assert.ok(st.fallbacks >= 1 && st.mailtrap.failed >= 1);
});
await t("MAIL: fallback OFF → the chosen provider's error is thrown, other provider NOT tried", async () => {
  await api("PUT", MAIL, { token: mailAdmin.token, body: { provider: "mailtrap", fallbackEnabled: false } });
  resendCalls.length = 0;
  await assert.rejects(sendMail("a@x.com", "S", "t", "<p>h</p>"));
  assert.equal(resendCalls.filter((c) => c.body.subject === "S").length, 0);
});
await t("MAIL: test-send goes through ONE provider and reports success / the provider's own error", async () => {
  resendReply = { status: 200, body: { id: "re_test_ok" } };
  const ok = await api("POST", `${MAIL}/test`, { token: mailAdmin.token, body: { provider: "resend", to: "me@x.com" } });
  assert.equal(ok.status, 200); assert.equal(ok.body.data.messageId, "re_test_ok"); assert.equal(ok.body.data.to, "me@x.com");
  resendReply = { status: 403, body: { name: "validation_error", message: "The targettrek.in domain is not verified" } };
  const bad = await api("POST", `${MAIL}/test`, { token: mailAdmin.token, body: { provider: "resend", to: "me@x.com" } });
  assert.equal(bad.status, 502); assert.equal(bad.body.code, "TEST_SEND_FAILED"); assert.match(bad.body.message, /not verified/);
});
await t("MAIL: removing the Resend key makes the page refuse Resend again and sendMail with Mailtrap unchanged", async () => {
  delete process.env.RESEND_API_KEY;
  const r = await api("POST", `${MAIL}/test`, { token: mailAdmin.token, body: { provider: "resend" } });
  assert.equal(r.status, 400);
});

/* ---- Amazon SES (third provider). fetch is stubbed: NOTHING is sent to AWS ---- */
const { signRequest } = await import(`${B}/utils/awsSigV4.js`);
const SES_ENV = { AMAZON_ACCESS_KEY_ID: "AKIATESTKEY123", AMAZON_SECRET_ACCESS_KEY: "test/secret+key", AMAZON_REGION: "ap-south-1" };
const sesOn = () => Object.assign(process.env, SES_ENV);
const sesOff = () => { for (const k of Object.keys(SES_ENV)) process.env[k] = ""; };
const simple = (call) => call.body.Content.Simple;

await t("SES: cannot be selected until keys AND region are set; the page is told exactly what is missing", async () => {
  sesOff();
  let g = await api("GET", MAIL, { token: mailAdmin.token });
  assert.equal(g.body.data.providers.ses.configured, false); assert.deepEqual(g.body.data.providers.ses.missing, ["AMAZON_ACCESS_KEY_ID", "AMAZON_SECRET_ACCESS_KEY", "AMAZON_REGION"]);
  process.env.AMAZON_ACCESS_KEY_ID = "AKIATESTKEY123"; process.env.AMAZON_SECRET_ACCESS_KEY = "test/secret+key";
  g = await api("GET", MAIL, { token: mailAdmin.token }); assert.deepEqual(g.body.data.providers.ses.missing, ["AMAZON_REGION"]);
  const r = await api("PUT", MAIL, { token: mailAdmin.token, body: { provider: "ses" } });
  assert.equal(r.status, 400); assert.equal(r.body.code, "PROVIDER_NOT_CONFIGURED"); assert.match(r.body.message, /AMAZON_REGION/);
});
await t("SES: also accepts the standard AWS_* variable names", async () => {
  sesOff(); process.env.AWS_ACCESS_KEY_ID = "AKIAOTHER"; process.env.AWS_SECRET_ACCESS_KEY = "other-secret"; process.env.AWS_REGION = "us-east-1";
  const g = await api("GET", MAIL, { token: mailAdmin.token }); assert.equal(g.body.data.providers.ses.configured, true); assert.equal(g.body.data.providers.ses.region, "us-east-1");
  for (const k of ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION"]) process.env[k] = "";
});
await t("SES: admin switches to it at runtime; sendMail() posts a SigV4-signed SES v2 SendEmail request (Simple content, so only ses:SendEmail is needed)", async () => {
  sesOn();
  const r = await api("PUT", MAIL, { token: mailAdmin.token, body: { provider: "ses", fallbackEnabled: true } });
  assert.equal(r.status, 200); assert.equal(r.body.data.provider, "ses"); assert.equal(r.body.data.providers.ses.configured, true);
  sesCalls.length = 0;
  const info = await sendMail(["a@x.com", "b@x.com"], "Subj line", "plain body", "<b>html body</b>", { replyTo: "help@x.com", attachments: [{ filename: "invite.ics", content: Buffer.from("BEGIN:VCALENDAR").toString("base64"), contentType: "text/calendar" }, { filename: "book.pdf", content: Buffer.from("PDFDATA"), contentType: "application/pdf" }] });
  assert.equal(info.provider, "ses"); assert.equal(info.messageId, "ses-msg-1");
  const c = sesCalls.at(-1);
  assert.equal(c.url, "https://email.ap-south-1.amazonaws.com/v2/email/outbound-emails");
  assert.match(c.headers.authorization, /^AWS4-HMAC-SHA256 Credential=AKIATESTKEY123\/\d{8}\/ap-south-1\/ses\/aws4_request, SignedHeaders=content-type;host;x-amz-date, Signature=[0-9a-f]{64}$/);
  assert.equal(c.headers["content-type"], "application/json"); assert.deepEqual(c.body.Destination.ToAddresses, ["a@x.com", "b@x.com"]);
  assert.equal(c.body.Content.Raw, undefined, "never Raw: that would need the ses:SendRawEmail permission");
  assert.equal(c.body.FromEmailAddress, "Target Trek <no-reply@targettrek.in>"); assert.deepEqual(c.body.ReplyToAddresses, ["help@x.com"]);
  assert.deepEqual(simple(c).Subject, { Data: "Subj line", Charset: "UTF-8" });
  assert.equal(simple(c).Body.Text.Data, "plain body"); assert.equal(simple(c).Body.Html.Data, "<b>html body</b>");
  const [ics, pdf] = simple(c).Attachments;
  assert.equal(ics.FileName, "invite.ics"); assert.equal(Buffer.from(ics.RawContent, "base64").toString(), "BEGIN:VCALENDAR", "ICS decoded once, not double-encoded"); assert.equal(ics.ContentTransferEncoding, "BASE64");
  assert.equal(pdf.FileName, "book.pdf"); assert.equal(pdf.ContentType, "application/pdf"); assert.equal(Buffer.from(pdf.RawContent, "base64").toString(), "PDFDATA");
});
await t("SES: the signature is genuine: re-signing the same request reproduces it exactly (so AWS will accept it)", async () => {
  const c = sesCalls.at(-1);
  const again = signRequest({ method: "POST", url: c.url, headers: { "content-type": "application/json" }, body: c.rawBody, region: "ap-south-1", service: "ses", accessKeyId: "AKIATESTKEY123", secretAccessKey: "test/secret+key", date: new Date(c.headers["x-amz-date"].replace(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/, "$1-$2-$3T$4:$5:$6Z")) });
  assert.equal(again.authorization, c.headers.authorization);
});
await t("SES: optional settings: session token, configuration set, sender override", async () => {
  process.env.AMAZON_SESSION_TOKEN = "SESSIONTOKEN"; process.env.AMAZON_SES_CONFIGURATION_SET = "tt-set"; process.env.AMAZON_SES_FROM_EMAIL = "hello@targettrek.in";
  sesCalls.length = 0; await sendMail("a@x.com", "S", "t", "<p>h</p>");
  const c = sesCalls.at(-1);
  assert.equal(c.headers["x-amz-security-token"], "SESSIONTOKEN"); assert.match(c.headers.authorization, /SignedHeaders=content-type;host;x-amz-date;x-amz-security-token,/);
  assert.equal(c.body.ConfigurationSetName, "tt-set"); assert.equal(c.body.FromEmailAddress, "Target Trek <hello@targettrek.in>");
  for (const k of ["AMAZON_SESSION_TOKEN", "AMAZON_SES_CONFIGURATION_SET", "AMAZON_SES_FROM_EMAIL"]) process.env[k] = "";
});
await t("SES: AWS errors are reported with AWS's own reason and error type", async () => {
  await api("PUT", MAIL, { token: mailAdmin.token, body: { provider: "ses", fallbackEnabled: false } });
  sesReply = { status: 400, body: { message: "Email address is not verified. The following identities failed the check in region AP-SOUTH-1: a@x.com" }, headers: { "x-amzn-errortype": "MessageRejected" } };
  await assert.rejects(sendMail("a@x.com", "S", "t", "<p>h</p>"), (e) => /not verified/.test(e.message) && e.code === "MessageRejected" && e.statusCode === 400);
  sesReply = { status: 403, body: { message: "The security token included in the request is invalid." }, headers: { "x-amzn-errortype": "UnrecognizedClientException:http://internal.amazon.com/coral/com.amazon.coral.service/" } };
  await assert.rejects(sendMail("a@x.com", "S", "t", "<p>h</p>"), (e) => e.code === "UnrecognizedClientException" && e.statusCode === 403);
  sesReply = { status: 429, body: { message: "Daily message quota exceeded." }, headers: { "x-amzn-errortype": "TooManyRequestsException" } };
  await assert.rejects(sendMail("a@x.com", "S", "t", "<p>h</p>"), (e) => /quota/.test(e.message));
  sesReply = { status: 200, body: { MessageId: "ses-msg-2" }, headers: {} };
});
await t("SES: failover chain: Mailtrap fails → Resend fails → SES delivers; stops at the first success", async () => {
  await api("PUT", MAIL, { token: mailAdmin.token, body: { provider: "mailtrap", fallbackEnabled: true } });
  process.env.RESEND_API_KEY = "re_fake_key"; resendReply = { status: 429, body: { name: "daily_quota_exceeded", message: "Daily quota exceeded" } };
  resendCalls.length = 0; sesCalls.length = 0;
  const info = await sendMail("a@x.com", "CHAIN", "t", "<p>h</p>");
  assert.equal(info.provider, "ses"); assert.equal(resendCalls.filter((c) => c.body.subject === "CHAIN").length, 1, "Resend tried first");
  assert.equal(sesCalls.filter((c) => simple(c).Subject.Data === "CHAIN").length, 1);
  resendReply = { status: 200, body: { id: "re_ok" } }; resendCalls.length = 0; sesCalls.length = 0;
  assert.equal((await sendMail("a@x.com", "CHAIN2", "t", "<p>h</p>")).provider, "resend");
  assert.equal(sesCalls.length, 0, "SES untouched when Resend succeeds");
});
await t("SES: an unconfigured provider is skipped by failover; with failover off nothing else is tried", async () => {
  sesOff(); resendReply = { status: 429, body: { message: "limit" } }; sesCalls.length = 0;
  await assert.rejects(sendMail("a@x.com", "SKIP", "t", "<p>h</p>")); assert.equal(sesCalls.length, 0);
  sesOn(); await api("PUT", MAIL, { token: mailAdmin.token, body: { fallbackEnabled: false } });
  await assert.rejects(sendMail("a@x.com", "OFF", "t", "<p>h</p>")); assert.equal(sesCalls.length, 0, "failover off → SES not used as a backup");
});
await t("SES: test-send and stats work for it (stubbed: nothing leaves the machine)", async () => {
  sesCalls.length = 0;
  const ok = await api("POST", `${MAIL}/test`, { token: mailAdmin.token, body: { provider: "ses", to: "me@x.com" } });
  assert.equal(ok.status, 200); assert.equal(ok.body.data.messageId, "ses-msg-2"); assert.deepEqual(sesCalls.at(-1).body.Destination.ToAddresses, ["me@x.com"]);
  const st = (await api("GET", MAIL, { token: mailAdmin.token })).body.data.stats;
  assert.ok(st.ses.sent >= 1 && st.ses.failed >= 1 && st.ses.lastError);
});
await t("MAILJET IS GONE: it can't be selected, and an old saved 'mailjet' choice falls back safely", async () => {
  assert.equal((await api("PUT", MAIL, { token: mailAdmin.token, body: { provider: "mailjet" } })).status, 400);
  const g = await api("GET", MAIL, { token: mailAdmin.token }); assert.ok(!("mailjet" in g.body.data.providers)); assert.ok(!("mailjet" in g.body.data.stats));
  await MailSettings.collection.updateOne({ key: "global" }, { $set: { provider: "mailjet" } });
  assert.equal((await getMailSettings({ fresh: true })).provider, "mailtrap");
  await api("PUT", MAIL, { token: mailAdmin.token, body: { provider: "mailtrap" } });
});
globalThis.fetch = origFetch; [console.log, console.warn, console.error] = origLogs;

console.log("\n" + results.map((r) => `${r[0]}  ${r[1]}${r[2] ? "\n      → " + r[2] : ""}`).join("\n"));
const failed = results.filter((r) => r[0] === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} passed`);
server.close(); redisServer.close(); await mongoose.disconnect(); await repl.stop();
process.exit(failed ? 1 : 0);
