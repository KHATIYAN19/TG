import { Ratelimit } from "@upstash/ratelimit";
import redis from "../utils/redis.js";

const ratelimit = new Ratelimit({
  redis,

  limiter: Ratelimit.slidingWindow(
    30,
    "1 m"
  ),

  analytics: true,

  prefix: "targettrek:ratelimit",
});

export const globalRateLimiter = async (
  req,
  res,
  next
) => {
  try {
    // Cloud Run sets x-forwarded-for
    const forwarded =
      req.headers["x-forwarded-for"];

    const ip =
      forwarded
        ?.split(",")[0]
        ?.trim() ||
      req.ip ||
      "unknown";

    const {
      success,
      limit,
      remaining,
      reset,
    } = await ratelimit.limit(ip);

    // Helpful standard headers
    res.setHeader(
      "X-RateLimit-Limit",
      limit
    );

    res.setHeader(
      "X-RateLimit-Remaining",
      remaining
    );

    res.setHeader(
      "X-RateLimit-Reset",
      reset
    );

    if (!success) {
      return res.status(429).json({
        success: false,
        message:
          "Too many requests. Please try again later.",
      });
    }

    next();

  } catch (error) {
    console.error(
      "Rate limiter error:",
      error
    );

    next();
  }
};