/*
  Cashfree webhook authentication: signature + timestamp window (utils/cashfreeWebhook.js).
  Run: node --test tests/security/cashfreeWebhook.test.mjs
*/
import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

import { verifyCashfreeWebhookSignature, cashfreeTimestampMs } from "../../utils/cashfreeWebhook.js";

const SECRET = "cf_test_secret";
const sign = (ts, body) => crypto.createHmac("sha256", SECRET).update(`${ts}${body}`).digest("base64");
const BODY = JSON.stringify({ type: "PAYMENT_SUCCESS_WEBHOOK", data: { order: { order_id: "o1" } } });
const NOW = Date.UTC(2026, 10, 21, 12, 0, 0);
const check = (ts, extra = {}) =>
  verifyCashfreeWebhookSignature({ rawBody: BODY, signature: sign(ts, BODY), timestamp: ts, secret: SECRET, now: NOW, ...extra });

test("a fresh, correctly signed webhook is accepted (ms and seconds timestamps, Buffer body)", () => {
  delete process.env.CASHFREE_WEBHOOK_TOLERANCE_SEC;
  assert.deepEqual(check(String(NOW - 5000)), { valid: true });
  assert.deepEqual(check(String(Math.floor(NOW / 1000))), { valid: true });
  const ts = String(NOW);
  assert.equal(verifyCashfreeWebhookSignature({ rawBody: Buffer.from(BODY), signature: sign(ts, BODY), timestamp: ts, secret: SECRET, now: NOW }).valid, true);
});

test("a genuine retry a few hours later still passes (default 24 h window)", () => {
  delete process.env.CASHFREE_WEBHOOK_TOLERANCE_SEC;
  assert.equal(check(String(NOW - 6 * 3600 * 1000)).valid, true);
  assert.equal(check(String(NOW - 23 * 3600 * 1000)).valid, true);
});

test("an old captured webhook is rejected as stale, a far-future one as future", () => {
  delete process.env.CASHFREE_WEBHOOK_TOLERANCE_SEC;
  assert.deepEqual(check(String(NOW - 25 * 3600 * 1000)), { valid: false, reason: "stale" });
  assert.deepEqual(check(String(NOW + 10 * 60 * 1000)), { valid: false, reason: "future" });
  assert.equal(check(String(NOW + 60 * 1000)).valid, true); // small clock drift is fine
});

test("bad signature, missing headers and junk timestamps are rejected", () => {
  assert.equal(verifyCashfreeWebhookSignature({ rawBody: BODY, signature: "bad", timestamp: String(NOW), secret: SECRET, now: NOW }).reason, "signature");
  assert.equal(verifyCashfreeWebhookSignature({ rawBody: BODY, signature: "", timestamp: String(NOW), secret: SECRET }).reason, "missing");
  assert.equal(verifyCashfreeWebhookSignature({ rawBody: BODY, signature: "x", timestamp: "", secret: SECRET }).reason, "missing");
  // signature over a tampered timestamp fails as a signature error, before any age check
  assert.equal(verifyCashfreeWebhookSignature({ rawBody: BODY, signature: sign(String(NOW), BODY), timestamp: String(NOW - 1), secret: SECRET, now: NOW }).reason, "signature");
  assert.equal(check("abc").reason, "timestamp");
  assert.equal(cashfreeTimestampMs("1"), null);
});

test("CASHFREE_WEBHOOK_TOLERANCE_SEC narrows the window; 0 turns the age check off", () => {
  process.env.CASHFREE_WEBHOOK_TOLERANCE_SEC = "300";
  assert.equal(check(String(NOW - 10 * 60 * 1000)).reason, "stale");
  process.env.CASHFREE_WEBHOOK_TOLERANCE_SEC = "0";
  assert.equal(check(String(NOW - 400 * 24 * 3600 * 1000)).valid, true);
  delete process.env.CASHFREE_WEBHOOK_TOLERANCE_SEC;
});
