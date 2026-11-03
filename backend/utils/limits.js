import redis from "./redis.js";

/*
  COST-AWARE LIMIT PRIMITIVES
  ---------------------------
  Fixed-window counters on plain Redis INCR (+ one EXPIRE the first time).
  That is 1 Redis command per allowed request (2 on the first of a window),
  far cheaper than the sliding-window library, which matters on pay-per-command
  Redis plans. Used for every "budget" limit below.

  A key can never be left without an expiry: if the process dies between INCR
  and EXPIRE, the next over-limit check repairs the TTL.
*/

export const envInt = (name, fallback) => {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

export const MINUTE = 60;
export const HOUR = 3600;
export const DAY = 86400;

/* "about 3 hours", "about 12 minutes": for error messages. */
export const waitText = (seconds) => {
  const s = Math.max(1, Math.ceil(seconds));
  if (s >= 2 * HOUR) return `about ${Math.round(s / HOUR)} hours`;
  if (s >= HOUR) return "about an hour";
  if (s >= 2 * MINUTE) return `about ${Math.ceil(s / MINUTE)} minutes`;
  return s > MINUTE ? "about a minute" : `${s} seconds`;
};

/* Count one hit. { allowed, count, ttl } (ttl = seconds until the window resets). */
export const consume = async (key, limit, windowSec) => {
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, windowSec);

  if (count <= limit) return { allowed: true, count, ttl: null };

  let ttl = await redis.ttl(key);
  if (!(ttl > 0)) {
    await redis.expire(key, windowSec); // repair a key that lost its expiry
    ttl = windowSec;
  }
  return { allowed: false, count, ttl };
};
