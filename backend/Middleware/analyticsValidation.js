import crypto from "node:crypto";
import { UAParser } from "ua-parser-js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const TRACK_TYPES = new Set([
  "page_view",
  "heartbeat",
  "engagement",
  "event",
  "page_exit",
  "session_end",
]);

const ALLOWED_EVENTS = new Set([
  "BUY_NOW",
  "PREVIEW_PDF",
  "CHECKOUT_STARTED",
  "ADD_TO_CART",
  "DOWNLOAD_CLICK",
  "MOCK_INTERVIEW_BOOK",
  "CTA_CLICK",
  "LOGIN",
  "SIGNUP",
  "PAYMENT_SUCCESS",
  "FORM_SUBMIT",
  "WHATSAPP_CLICK",
  "SHARE_CLICK",
]);

// Query params that may carry secrets or personal data.
const SENSITIVE_QUERY_KEY =
  /(token|pass|secret|key|otp|email|phone|mobile|auth|session|signature|hash|card|cvv|code_verifier)/i;

const UTM_KEYS = [
  "source",
  "medium",
  "campaign",
  "term",
  "content",
];

export function isUUID(value) {
  return (
    typeof value === "string" &&
    UUID_PATTERN.test(value)
  );
}

// Path only. Query string is captured separately.
export function cleanPage(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.length > 300 ||
    /[\x00-\x1f]/.test(value)
  ) {
    return null;
  }

  const path = value.split("?")[0].split("#")[0];

  // Normalise trailing slash: /books/ -> /books
  return path.length > 1
    ? path.replace(/\/+$/, "") || "/"
    : path;
}

export function cleanReferral(value) {
  if (value == null || value === "") return null;

  if (
    typeof value !== "string" ||
    !/^[a-zA-Z0-9_-]{1,50}$/.test(value)
  ) {
    return null;
  }

  return value.toUpperCase();
}

// Keeps up to 20 harmless string params, e.g. { ref: "ASH" }.
export function cleanQuery(input) {
  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input)
  ) {
    return {};
  }

  const out = {};

  for (const [key, raw] of Object.entries(input)) {
    if (Object.keys(out).length >= 20) break;

    if (
      !/^[a-zA-Z0-9_-]{1,40}$/.test(key) ||
      SENSITIVE_QUERY_KEY.test(key)
    ) {
      continue;
    }

    if (
      typeof raw === "string" ||
      typeof raw === "number"
    ) {
      out[key] = String(raw)
        .replace(/[\x00-\x1f]/g, "")
        .slice(0, 100);
    }
  }

  return out;
}

export function cleanUtm(query = {}) {
  const utm = {};

  for (const key of UTM_KEYS) {
    const value = query[`utm_${key}`];
    if (value) utm[key] = value.slice(0, 100);
  }

  return Object.keys(utm).length ? utm : null;
}

// External referrer (document.referrer). Own-site referrers
// are dropped so internal navigation is not a "source".
export function cleanReferrer(value) {
  if (typeof value !== "string" || !value) {
    return { referrer: null, referrerHost: null };
  }

  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("bad protocol");
    }

    const host = url.hostname
      .replace(/^www\./, "")
      .toLowerCase();

    const own = (process.env.FRONTEND_URL || "")
      .replace(/^https?:\/\/(www\.)?/, "")
      .replace(/\/.*$/, "")
      .toLowerCase();

    if (host === own || host === "targettrek.in") {
      return { referrer: null, referrerHost: null };
    }

    return {
      referrer: `${url.origin}${url.pathname}`.slice(
        0,
        300
      ),
      referrerHost: host.slice(0, 100),
    };
  } catch {
    return { referrer: null, referrerHost: null };
  }
}

export function getDevice(req, input = {}) {
  const parsed = new UAParser(
    req.headers["user-agent"] || ""
  ).getResult();

  const width = Number(input.screenWidth);
  const height = Number(input.screenHeight);

  const validSize = (n) =>
    Number.isInteger(n) && n > 0 && n <= 10000;

  return {
    type: parsed.device.type || "desktop",
    vendor: parsed.device.vendor || null,
    model: parsed.device.model || null,
    browser: parsed.browser.name || "Unknown",
    browserVersion: parsed.browser.version || null,
    os: parsed.os.name || "Unknown",
    osVersion: parsed.os.version || null,
    screenWidth: validSize(width) ? width : null,
    screenHeight: validSize(height) ? height : null,
    language:
      typeof input.language === "string"
        ? input.language.slice(0, 30)
        : null,
    timezone:
      typeof input.timezone === "string"
        ? input.timezone.slice(0, 100)
        : null,
  };
}

// Country comes from the CDN/proxy header, IP is stored hashed.
export function getClientInfo(req) {
  const ip = req.ip || req.socket?.remoteAddress || "";

  const salt =
    process.env.ANALYTICS_IP_SALT ||
    process.env.JWT_SECRET ||
    "";

  const countryRaw =
    req.headers["cf-ipcountry"] ||
    req.headers["x-vercel-ip-country"] ||
    req.headers["cloudfront-viewer-country"] ||
    "";

  const country = /^[A-Za-z]{2}$/.test(countryRaw)
    ? countryRaw.toUpperCase()
    : null;

  return {
    ipHash: ip
      ? crypto
          .createHash("sha256")
          .update(`${salt}:${ip}`)
          .digest("hex")
          .slice(0, 24)
      : null,
    country,
  };
}

export function validateBase(req, res, next) {
  const { type, visitorId, sessionId } =
    req.body || {};

  if (!TRACK_TYPES.has(type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid tracking type",
    });
  }

  if (!isUUID(visitorId) || !isUUID(sessionId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid visitorId or sessionId",
    });
  }

  next();
}

export function validateEventType(value) {
  return ALLOWED_EVENTS.has(value);
}
