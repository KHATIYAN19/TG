import redis from "../utils/redis.js";
import { DAY, envInt, waitText } from "../utils/limits.js";
import { ArenaError } from "./arena/errors.js";

/*
  24-HOUR LOCKS FOR SIGN-UP, PASSWORD RESET AND LOGIN-BY-IP
  ---------------------------------------------------------
  A "failed attempt" is counted per EMAIL and per IP. When either counter
  reaches its limit the email / IP is locked for 24 hours; every request in that
  flow is then refused until the lock expires by itself.

    signup    wrong code or resend:        10 per 24 h  (email, and IP)
    reset     wrong code or resend:         5 per 24 h  (email, and IP)
    login_ip  wrong passwords from one IP: 30 per 24 h  (IP only; each ACCOUNT
              already locks after 5 wrong passwords: see authController)

  Limits can be tuned with env vars (see FLOWS).
  Redis commands per request: 1 (lock check) + 2 (count) on the paths that count.
*/

const FLOWS = {
  signup: {
    label: "Sign-up",
    code: "SIGNUP_LOCKED",
    email: () => envInt("ARENA_SIGNUP_ATTEMPT_LIMIT", 10),
    ip: () => envInt("ARENA_SIGNUP_IP_ATTEMPT_LIMIT", 10),
  },
  reset: {
    label: "Password reset",
    code: "RESET_LOCKED",
    email: () => envInt("ARENA_RESET_ATTEMPT_LIMIT", 5),
    ip: () => envInt("ARENA_RESET_IP_ATTEMPT_LIMIT", 5),
  },
  login_ip: {
    label: "Login",
    code: "LOGIN_IP_LOCKED",
    email: null,
    ip: () => envInt("LOGIN_IP_FAIL_LIMIT", 30),
  },
};

const norm = (v) => String(v || "").trim().toLowerCase();
const lockKey = (flow, dim, value) => `tt:lock:${flow}:${dim}:${value}`;
const countKey = (flow, dim, value) => `tt:cnt:${flow}:${dim}:${value}`;

const dims = (flow, { email, ip }) => {
  const f = FLOWS[flow];
  return [
    ...(f.email && email ? [["email", norm(email), f.email()]] : []),
    ...(f.ip && ip ? [["ip", norm(ip), f.ip()]] : []),
  ];
};

const wrap = async (fn) => {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ArenaError) throw error;
    console.error("[authLocks]", error.message);
    // Security controls fail closed: no unmetered guessing while Redis is down.
    throw new ArenaError(503, "LIMIT_UNAVAILABLE", "Service temporarily unavailable. Please try again.");
  }
};

const lockedError = (flow, dim, ttl) => {
  const f = FLOWS[flow];
  const subject = dim === "email" ? "this email" : "your network";
  const hours = Math.max(1, Math.round(ttl / 3600));
  return new ArenaError(
    429,
    f.code,
    flow === "login_ip"
      ? `Too many failed login attempts from your network. Please try again in ${waitText(ttl)}.`
      : `Too many attempts. ${f.label} is locked for ${subject} for your security. It unlocks automatically in ${ttl > 3600 ? `about ${hours} hours` : waitText(ttl)}.`,
    { retryAfter: ttl, lockedUntil: new Date(Date.now() + ttl * 1000).toISOString(), limitedBy: dim }
  );
};

/* Throws 429 <FLOW>_LOCKED if the email or the IP is locked. 1 Redis command when not locked. */
export const assertNotLocked = (flow, who) =>
  wrap(async () => {
    const list = dims(flow, who);
    if (!list.length) return;

    const states = await redis.mget(...list.map(([dim, value]) => lockKey(flow, dim, value)));

    for (const [i, state] of states.entries()) {
      if (state === null || state === undefined) continue;
      const [dim, value] = list[i];
      let ttl = await redis.ttl(lockKey(flow, dim, value));
      if (!(ttl > 0)) ttl = DAY;
      throw lockedError(flow, dim, ttl);
    }
  });

/*
  Count one failed attempt. The attempt that reaches the limit LOCKS the
  email / IP for 24 h and throws 429 right away.
*/
export const recordAttempt = (flow, who) =>
  wrap(async () => {
    let locked = null;

    // Count BOTH the email and the IP before reporting, so one failure can
    // lock both at once.
    for (const [dim, value, limit] of dims(flow, who)) {
      const key = countKey(flow, dim, value);
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, DAY);

      if (count >= limit) {
        await redis.set(lockKey(flow, dim, value), 1, { ex: DAY });
        await redis.del(key);
        locked = locked || lockedError(flow, dim, DAY);
      }
    }

    if (locked) throw locked;
  });

/* A successful flow clears that email's counter (the IP counter keeps counting). */
export const clearEmailCounter = (flow, email) =>
  wrap(async () => {
    if (email) await redis.del(countKey(flow, "email", norm(email)));
  });

/* Admin: lift every lock and counter for an email and/or an IP. */
export const clearLocks = ({ email, ip }) =>
  wrap(async () => {
    const keys = [];
    for (const flow of Object.keys(FLOWS)) {
      for (const [dim, value] of [["email", email && norm(email)], ["ip", ip && norm(ip)]]) {
        if (!value) continue;
        keys.push(lockKey(flow, dim, value), countKey(flow, dim, value));
      }
    }
    if (keys.length) await redis.del(...keys);
    return keys.length;
  });
