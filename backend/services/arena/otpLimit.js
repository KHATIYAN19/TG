import { arenaOtpRateLimit } from "../../Middleware/rateLimiter.js";
import { ArenaError } from "./errors.js";

/*
  OTP SEND LIMIT
  --------------
  A verification code may be emailed at most OTP_LIMIT times per
  WINDOW_MINUTES, tracked INDEPENDENTLY for:
    - the client IP            (stops one machine spraying many emails)
    - the email address        (stops mail-bombing one inbox)
    - the mobile number        (stops one number being reused across emails)
  Exceeding any one of them blocks the send.

  `limit` is injectable so the logic can be unit-tested without Redis.
*/

export const OTP_LIMIT = 5;
export const OTP_WINDOW_HOURS = 24;

const defaultLimit = (key) => arenaOtpRateLimit.limit(key);

export const createOtpLimiter = (limit = defaultLimit) =>
  async ({ ip, email, mobile, scope = "" }) => {
    const checks = [
      ["ip", ip],
      ["email", email],
      ["mobile", mobile],
    ].filter(([, value]) => Boolean(value));

    for (const [kind, value] of checks) {
      // `scope` keeps flows (signup / password reset) in separate buckets.
      const result = await limit(`${scope ? `${scope}:` : ""}${kind}:${String(value).toLowerCase()}`);

      if (!result.success) {
        const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
        const hours = Math.floor(retryAfter / 3600);
        const minutes = Math.max(1, Math.ceil((retryAfter % 3600) / 60));
        const wait = hours > 0
          ? `${hours} hour${hours === 1 ? "" : "s"}${hours < 24 && minutes > 0 && minutes < 60 ? ` ${minutes} min` : ""}`
          : `${minutes} minute${minutes === 1 ? "" : "s"}`;
        const who = kind === "ip" ? "from this network" : kind === "email" ? "to this email" : "for this mobile number";

        throw new ArenaError(
          429,
          "OTP_RATE_LIMIT",
          `Too many verification codes requested ${who}. You can request ${OTP_LIMIT} codes every ${OTP_WINDOW_HOURS} hours. Please try again in about ${wait}.`,
          { retryAfter, limitedBy: kind }
        );
      }
    }
  };

export const enforceOtpLimit = createOtpLimiter();
