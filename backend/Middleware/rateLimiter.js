// import { Ratelimit } from "@upstash/ratelimit";
// import redis from "../utils/redis.js";

// const ratelimit = new Ratelimit({
//   redis,

//   limiter: Ratelimit.slidingWindow(
//     50,
//     "1 m"
//   ),

//   analytics: true,

//   prefix: "targettrek:ratelimit",
// });

// export const globalRateLimiter = async (
//   req,
//   res,
//   next
// ) => {
//   try {

//     // Skip Cashfree webhook
//     if (
//       req.originalUrl.startsWith(
//         "/payment/cashfree/webhook"
//       )
//     ) {
//       return next();
//     }

//     const forwarded =
//       req.headers["x-forwarded-for"];

//     const ip =
//       forwarded
//         ?.split(",")[0]
//         ?.trim() ||
//       req.ip ||
//       "unknown";

//     const {
//       success,
//       limit,
//       remaining,
//       reset,
//     } = await ratelimit.limit(ip);

//     res.setHeader(
//       "X-RateLimit-Limit",
//       limit
//     );

//     res.setHeader(
//       "X-RateLimit-Remaining",
//       remaining
//     );

//     res.setHeader(
//       "X-RateLimit-Reset",
//       reset
//     );

//     if (!success) {
//       return res.status(429).json({
//         success: false,
//         message:
//           "Too many requests. Please try again later.",
//       });
//     }

//     return next();

//   } catch (error) {
//     console.error(
//       "Rate limiter error:",
//       error
//     );

//     return next();
//   }
// };


import { Ratelimit } from "@upstash/ratelimit";
import redis from "../utils/redis.js";

/* =====================================================
   CONFIGURATION
===================================================== */

const createRateLimiter = (
  prefix,
  requests,
  window
) => {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      requests,
      window
    ),
    analytics: true,
    prefix: `targettrek:ratelimit:${prefix}`,
  });
};

/* =====================================================
   RATE LIMIT DEFINITIONS
===================================================== */

// Existing global limit: 50 requests per minute.
const globalLimiter = createRateLimiter(
  "global",
  50,
  "1 m"
);

// Login: 10 attempts per 15 minutes.
const loginRateLimit = createRateLimiter(
  "login",
  10,
  "15 m"
);

// OTP verification: 10 attempts per 10 minutes.
const otpVerifyRateLimit = createRateLimiter(
  "otp-verify",
  10,
  "10 m"
);

// OTP resend: 3 requests per 10 minutes.
const otpResendRateLimit = createRateLimiter(
  "otp-resend",
  3,
  "10 m"
);

// Refresh: 30 requests per minute.
const refreshRateLimit = createRateLimiter(
  "refresh",
  30,
  "1 m"
);

// Password setup/reset: 5 attempts per 15 minutes.
const passwordSetupRateLimit = createRateLimiter(
  "password-setup",
  5,
  "15 m"
);

/* =====================================================
   CLIENT IP RESOLUTION
===================================================== */

const getClientIp = (req) => {
  // Express resolves req.ip using the configured
  // trust proxy setting. Never independently trust
  // an arbitrary X-Forwarded-For header.
  return (
    req.ip ||
    req.socket.remoteAddress ||
    "unknown"
  );
};

/* =====================================================
   REDIS RATE LIMIT MIDDLEWARE
===================================================== */

const createMiddleware = (
  limiter,
  options = {}
) => {
  const {
    skip = () => false,
    failClosed = true,
    getIdentifier = getClientIp,
  } = options;

  return async (req, res, next) => {
    try {
      if (skip(req)) {
        return next();
      }

      const identifier = String(
        getIdentifier(req)
      );

      const {
        success,
        limit,
        remaining,
        reset,
      } = await limiter.limit(identifier);

      /* ===== RESPONSE HEADERS ===== */

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
        const retryAfter = Math.max(
          1,
          Math.ceil(
            (reset - Date.now()) / 1000
          )
        );

        res.setHeader(
          "Retry-After",
          retryAfter
        );

        return res.status(429).json({
          success: false,
          message:
            "Too many requests. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter,
        });
      }

      return next();

    } catch (error) {
      console.error(
        "Rate limiter error:",
        error
      );

      // Authentication endpoints must not bypass
      // rate limits when Redis is unavailable.
      if (failClosed) {
        return res.status(503).json({
          success: false,
          message:
            "Service temporarily unavailable. Please try again.",
          code: "RATE_LIMIT_UNAVAILABLE",
        });
      }

      // Preserve existing fail-open behavior
      // for ordinary non-authentication APIs.
      return next();
    }
  };
};

/* =====================================================
   GLOBAL RATE LIMITER
===================================================== */

export const globalRateLimiter = createMiddleware(
  globalLimiter,
  {
    failClosed: false,

    skip: (req) => {
      const path = req.path;

      // Payment gateway webhook must not be blocked
      // by the IP-based global limiter.
      if (
        path.startsWith(
          "/payment/cashfree/webhook"
        )
      ) {
        return true;
      }

      // Avoid using global IP-based limits on auth
      // endpoints. Dedicated limiters apply below.
      if (
        path === "/api/auth" ||
        path.startsWith("/api/auth/")
      ) {
        return true;
      }

      // Health checks should remain lightweight.
      if (
        path === "/" ||
        path === "/health"
      ) {
        return true;
      }

      return false;
    },
  }
);

/* =====================================================
   LOGIN RATE LIMITER
===================================================== */

export const loginLimiter = createMiddleware(
  loginRateLimit,
  {
    failClosed: true,
  }
);

/* =====================================================
   OTP VERIFICATION RATE LIMITER
===================================================== */

export const otpLimiter = createMiddleware(
  otpVerifyRateLimit,
  {
    failClosed: true,
  }
);

/* =====================================================
   OTP RESEND RATE LIMITER
===================================================== */

export const otpResendLimiter = createMiddleware(
  otpResendRateLimit,
  {
    failClosed: true,
  }
);

/* =====================================================
   TOKEN REFRESH RATE LIMITER
===================================================== */

export const refreshLimiter = createMiddleware(
  refreshRateLimit,
  {
    failClosed: true,
  }
);

/* =====================================================
   PASSWORD SETUP / RESET RATE LIMITER
===================================================== */

export const passwordSetupLimiter = createMiddleware(
  passwordSetupRateLimit,
  {
    failClosed: true,
  }
);

/* =====================================================
   ANALYTICS TRACKING RATE LIMITER

   Separate from the global limiter so heartbeats never
   use up a visitor's quota for real API calls. Fails
   open: analytics must not block the website.
===================================================== */

const analyticsTrackRateLimit = createRateLimiter(
  "analytics-track",
  120,
  "1 m"
);

export const analyticsTrackLimiter = createMiddleware(
  analyticsTrackRateLimit,
  {
    failClosed: false,
  }
);
