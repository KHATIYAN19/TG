import crypto from "crypto";

/*
  Cashfree webhook authentication, shared by every Cashfree webhook in the app.

  Cashfree signs each delivery as base64(HMAC-SHA256(x-webhook-timestamp + rawBody)) with the client secret.
  On top of the signature we also check the timestamp, so an old captured webhook can't be replayed
  forever. The window is deliberately generous: Cashfree retries failed deliveries for several hours, and
  a retry may carry the original timestamp. A strict 5-minute window (the usual default) would reject
  those genuine retries. Replays inside the window are still harmless, because every handler re-checks
  the payment with Cashfree and every state change is idempotent.

  CASHFREE_WEBHOOK_TOLERANCE_SEC  how old a webhook may be (default 86400 = 24h; 0 turns the age check off)
  FUTURE_SKEW_SEC                 how far ahead of our clock a timestamp may be (clock drift)
*/

const DEFAULT_TOLERANCE_SEC = 24 * 60 * 60;
const FUTURE_SKEW_SEC = 5 * 60;

const toleranceSec = () => {
  const raw = process.env.CASHFREE_WEBHOOK_TOLERANCE_SEC;
  if (raw === undefined || raw === "") return DEFAULT_TOLERANCE_SEC;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_TOLERANCE_SEC;
};

/* Cashfree sends milliseconds; accept seconds as well so a format change can't lock us out. */
export const cashfreeTimestampMs = (timestamp) => {
  const s = String(timestamp ?? "").trim();
  if (!/^\d{9,14}$/.test(s)) return null;
  const n = Number(s);
  return s.length <= 10 ? n * 1000 : n;
};

/*
  Returns { valid: true } or { valid: false, reason } where reason is one of
  "missing" | "signature" | "timestamp" | "stale" | "future".
  The signature is checked first, so the age check can't be used to learn anything about the secret.
*/
export const verifyCashfreeWebhookSignature = ({ rawBody, signature, timestamp, secret, now = Date.now() }) => {
  const body = Buffer.isBuffer(rawBody) ? rawBody.toString("utf8") : rawBody;
  if (!body || !signature || !timestamp || !secret) return { valid: false, reason: "missing" };

  const expected = Buffer.from(crypto.createHmac("sha256", secret).update(`${timestamp}${body}`).digest("base64"));
  const got = Buffer.from(String(signature));
  if (expected.length !== got.length || !crypto.timingSafeEqual(expected, got)) return { valid: false, reason: "signature" };

  const tolerance = toleranceSec();
  if (tolerance > 0) {
    const at = cashfreeTimestampMs(timestamp);
    if (at === null) return { valid: false, reason: "timestamp" };
    if (at - now > FUTURE_SKEW_SEC * 1000) return { valid: false, reason: "future" };
    if (now - at > tolerance * 1000) return { valid: false, reason: "stale" };
  }
  return { valid: true };
};
