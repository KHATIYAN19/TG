import test from "node:test";
import assert from "node:assert/strict";

import { createOtpLimiter } from "./otpLimit.js";

/* In-memory sliding window: 5 hits per 24 hours per key. */
const makeFakeLimit = () => {
  const hits = new Map();
  let now = 1_000_000;
  const limit = async (key) => {
    const list = (hits.get(key) ?? []).filter((t) => now - t < 24 * 3_600_000);
    if (list.length >= 5) return { success: false, reset: list[0] + 24 * 3_600_000 };
    list.push(now);
    hits.set(key, list);
    return { success: true, reset: now + 24 * 3_600_000 };
  };
  const realNow = Date.now;
  return { limit, advance: (ms) => { now += ms; }, install: () => { Date.now = () => now; }, restore: () => { Date.now = realNow; } };
};

test("allows 5 codes, blocks the 6th (same ip/email/mobile)", async () => {
  const f = makeFakeLimit(); f.install();
  try {
    const check = createOtpLimiter(f.limit);
    const who = { ip: "1.1.1.1", email: "a@x.com", mobile: "9876543210" };
    for (let i = 0; i < 5; i++) await check(who);
    await assert.rejects(check(who), (e) => e.status === 429 && e.code === "OTP_RATE_LIMIT" && e.extra.retryAfter > 0);
  } finally { f.restore(); }
});

test("email limit applies across different IPs (mail-bombing one inbox)", async () => {
  const f = makeFakeLimit(); f.install();
  try {
    const check = createOtpLimiter(f.limit);
    for (let i = 0; i < 5; i++) await check({ ip: `9.9.9.${i}`, email: "victim@x.com", mobile: `98765432${10 + i}` });
    await assert.rejects(check({ ip: "9.9.9.99", email: "victim@x.com", mobile: "9000000000" }), (e) => e.extra.limitedBy === "email");
  } finally { f.restore(); }
});

test("IP limit applies across different emails (one machine spraying)", async () => {
  const f = makeFakeLimit(); f.install();
  try {
    const check = createOtpLimiter(f.limit);
    for (let i = 0; i < 5; i++) await check({ ip: "5.5.5.5", email: `u${i}@x.com`, mobile: `98000000${10 + i}` });
    await assert.rejects(check({ ip: "5.5.5.5", email: "new@x.com", mobile: "9111111111" }), (e) => e.extra.limitedBy === "ip");
  } finally { f.restore(); }
});

test("mobile limit applies across different emails and IPs", async () => {
  const f = makeFakeLimit(); f.install();
  try {
    const check = createOtpLimiter(f.limit);
    for (let i = 0; i < 5; i++) await check({ ip: `7.7.7.${i}`, email: `m${i}@x.com`, mobile: "9876500000" });
    await assert.rejects(check({ ip: "7.7.7.77", email: "z@x.com", mobile: "9876500000" }), (e) => e.extra.limitedBy === "mobile");
  } finally { f.restore(); }
});

test("limit resets after the 24-hour window", async () => {
  const f = makeFakeLimit(); f.install();
  try {
    const check = createOtpLimiter(f.limit);
    const who = { ip: "2.2.2.2", email: "b@x.com", mobile: "9876543211" };
    for (let i = 0; i < 5; i++) await check(who);
    await assert.rejects(check(who));
    f.advance(24 * 3_600_000 + 1);
    await check(who); // allowed again
  } finally { f.restore(); }
});

test("emails are matched case-insensitively", async () => {
  const f = makeFakeLimit(); f.install();
  try {
    const check = createOtpLimiter(f.limit);
    for (const e of ["A@X.com", "a@x.com", "A@x.COM", "a@X.com", "A@x.com"]) await check({ ip: Math.random().toString(), email: e, mobile: String(Math.random()) });
    await assert.rejects(check({ ip: "new", email: "a@x.com", mobile: "new" }), (e) => e.extra.limitedBy === "email");
  } finally { f.restore(); }
});
