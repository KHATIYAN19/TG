
import "dotenv/config";
import ms from "ms";

const intEnv = (key, fallback) => {
  const n = Number(process.env[key] ?? fallback);
  if (!Number.isSafeInteger(n) || n <= 0) {
    throw new Error(`Invalid environment variable: ${key}`);
  }
  return n;
};

const accessTtl = process.env.JWT_EXPIRES_IN || "15m";
const accessTtlMs = ms(accessTtl);

if (!accessTtlMs || accessTtlMs <= 0) {
  throw new Error("Invalid JWT_EXPIRES_IN");
}

if (!process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must have at least 32 characters");
}

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  accessTtl,
  accessTtlMs,

  refreshDays: intEnv("REFRESH_TOKEN_TTL_DAYS", 7),
  trustedDays: intEnv("TRUSTED_DEVICE_TTL_DAYS", 30),

  otpMinutes: intEnv("OTP_TTL_MINUTES", 10),
  setupMinutes: intEnv("PASSWORD_SETUP_TTL_MINUTES", 60),

  maxOtpAttempts: intEnv("MAX_OTP_ATTEMPTS", 5),
  maxLoginAttempts: intEnv("MAX_LOGIN_ATTEMPTS", 5),
  lockMinutes: intEnv("ACCOUNT_LOCK_MINUTES", 15),

  secureCookies: process.env.COOKIE_SECURE !== "false",

  frontendUrl: process.env.FRONTEND_URL,

  bcryptRounds: intEnv("BCRYPT_ROUNDS", 12),
};

export const daysFromNow = days =>
  new Date(Date.now() + days * 86400000);

export const minutesFromNow = minutes =>
  new Date(Date.now() + minutes * 60000);
