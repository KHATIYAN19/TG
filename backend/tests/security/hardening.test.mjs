/*
  Security hardening checks (no database needed):
    - body size limits: 1 MB anonymous, 10 MB only with a genuinely signed access token
    - CSP report endpoint: accepts both browser report formats, always 204, strips query strings
  Run: node --test tests/security/hardening.test.mjs
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";

const { bodyParsers } = await import("../../Middleware/bodyLimits.js");
const { default: cspReportRoute } = await import("../../routes/cspReportRoute.js");

const app = express();
app.use("/api/csp-report", cspReportRoute);
app.use(bodyParsers);
app.post("/echo", (req, res) => res.json({ bytes: JSON.stringify(req.body).length }));
app.use((err, req, res, next) => res.status(err.status || 500).json({ type: err.type }));

const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
test.after(() => server.close());

const bodyOf = (mb) => JSON.stringify({ html: "x".repeat(Math.floor(mb * 1024 * 1024)) });
const post = (path, body, headers = {}) =>
  fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body });
const sign = (secret = process.env.JWT_SECRET, opts = {}) =>
  jwt.sign({ sub: "u1", sid: "s1", tv: 0 }, secret, { algorithm: "HS256", expiresIn: "15m", ...opts });

test("anonymous: small body accepted", async () => {
  assert.equal((await post("/echo", bodyOf(0.5))).status, 200);
});

test("anonymous: 2 MB body rejected with 413 (was accepted up to 10 MB before)", async () => {
  const r = await post("/echo", bodyOf(2));
  assert.equal(r.status, 413);
  assert.equal((await r.json()).type, "entity.too.large");
});

test("forged token (wrong secret) gets the anonymous limit", async () => {
  const r = await post("/echo", bodyOf(2), { Authorization: `Bearer ${sign("attacker-guessed-secret-xxxxxxxxxxxxxxxx")}` });
  assert.equal(r.status, 413);
});

test("garbage bearer value gets the anonymous limit", async () => {
  assert.equal((await post("/echo", bodyOf(2), { Authorization: "Bearer not-a-jwt" })).status, 413);
});

test("signed token: 5 MB admin payload accepted", async () => {
  assert.equal((await post("/echo", bodyOf(5), { Authorization: `Bearer ${sign()}` })).status, 200);
});

test("signed but just-expired token still gets the large limit (route can answer 401 TOKEN_EXPIRED)", async () => {
  const expired = sign(undefined, { expiresIn: -10 });
  assert.equal((await post("/echo", bodyOf(5), { Authorization: `Bearer ${expired}` })).status, 200);
});

test("signed token: above 10 MB still rejected", async () => {
  assert.equal((await post("/echo", bodyOf(11), { Authorization: `Bearer ${sign()}` })).status, 413);
});

test("CSP report (legacy application/csp-report) -> 204, logged without query string", async () => {
  const logs = [];
  const orig = console.warn;
  console.warn = (...a) => logs.push(a.join(" "));
  try {
    const r = await fetch(`${base}/api/csp-report`, {
      method: "POST",
      headers: { "Content-Type": "application/csp-report" },
      body: JSON.stringify({ "csp-report": { "effective-directive": "script-src", "blocked-uri": "https://evil.example/x.js?token=SECRET", "document-uri": "https://www.targettrek.in/books?token=SECRET" } }),
    });
    assert.equal(r.status, 204);
  } finally {
    console.warn = orig;
  }
  assert.equal(logs.length, 1);
  assert.match(logs[0], /script-src/);
  assert.doesNotMatch(logs[0], /SECRET/);
});

test("CSP report (Reporting API array, application/reports+json) -> 204", async () => {
  const orig = console.warn;
  console.warn = () => {};
  try {
    const r = await fetch(`${base}/api/csp-report`, {
      method: "POST",
      headers: { "Content-Type": "application/reports+json" },
      body: JSON.stringify([{ type: "csp-violation", body: { effectiveDirective: "img-src", blockedURL: "https://cdn.example/a.png" } }]),
    });
    assert.equal(r.status, 204);
  } finally {
    console.warn = orig;
  }
});

test("CSP report: malformed body never errors", async () => {
  const r = await fetch(`${base}/api/csp-report`, { method: "POST", headers: { "Content-Type": "text/plain" }, body: "junk" });
  assert.equal(r.status, 204);
});
