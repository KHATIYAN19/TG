import { consume, waitText } from "../utils/limits.js";

/*
  BUDGET LIMITER
  --------------
  Express middleware that caps how many times something may happen per
  window, per key (IP, signed-in user, or both). Built to keep email, payment
  and database cost inside a budget, not just to stop floods.

    budget({
      name: "coupon-validate",       // part of the Redis key
      limit: 30, windowSec: 600,     // numbers or () => number (read at request time)
      key: byIp,                     // string | string[] per request
      message: "Too many coupon checks.",
      failClosed: false,             // true = refuse when Redis is down
    })

  Answers 429 { code, message, retryAfter } with a Retry-After header.
*/

export const byIp = (req) => req.ip || req.socket?.remoteAddress || "unknown";
export const byUser = (req) => req.user?.id || req.user?.userId || null;

const read = (v) => (typeof v === "function" ? v() : v);

export const budget = (options) => {
  const middleware = makeBudget(options);
  middleware.budgetName = options.name; // lets tests assert a route is covered
  return middleware;
};

const makeBudget = ({
  name,
  limit,
  windowSec,
  key = byIp,
  message = "Too many requests.",
  code = "RATE_LIMITED",
  failClosed = false,
}) =>
  async (req, res, next) => {
    try {
      const keys = [].concat(key(req)).filter(Boolean).map(String);
      const max = read(limit);
      const win = read(windowSec);

      for (const k of keys) {
        const result = await consume(`tt:budget:${name}:${k}`, max, win);

        if (!result.allowed) {
          res.set("Retry-After", String(result.ttl));
          return res.status(429).json({
            success: false,
            code,
            message: `${message} Please try again in ${waitText(result.ttl)}.`,
            retryAfter: result.ttl,
            limit: max,
          });
        }
      }

      return next();
    } catch (error) {
      console.error(`[budget:${name}]`, error.message);

      if (failClosed) {
        return res.status(503).json({
          success: false,
          code: "RATE_LIMIT_UNAVAILABLE",
          message: "Service temporarily unavailable. Please try again.",
        });
      }

      return next();
    }
  };
