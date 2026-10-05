const appId =
  String(
    process.env.CASHFREE_APP_ID ||
    ""
  ).trim();

const secretKey =
  String(
    process.env.CASHFREE_SECRET_KEY ||
    ""
  ).trim();

const environment =
  String(
    process.env.CASHFREE_ENV ||
    "sandbox"
  )
    .trim()
    .toLowerCase();

const apiVersion =
  String(
    process.env.CASHFREE_API_VERSION ||
    "2025-01-01"
  ).trim();

export const CASHFREE_APP_ID =
  appId;

export const CASHFREE_SECRET_KEY =
  secretKey;

export const CASHFREE_ENV =
  environment === "production"
    ? "production"
    : "sandbox";

export const CASHFREE_API_VERSION =
  apiVersion;

export const CASHFREE_BASE_URL =
  CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

export const validateCashfreeConfig =
  () => {
    if (!CASHFREE_APP_ID) {
      throw new Error(
        "CASHFREE_APP_ID is missing."
      );
    }

    if (!CASHFREE_SECRET_KEY) {
      throw new Error(
        "CASHFREE_SECRET_KEY is missing."
      );
    }
  };