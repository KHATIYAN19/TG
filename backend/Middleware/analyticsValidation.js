
import { UAParser } from "ua-parser-js";
import { validate as validateUUID } from "uuid";

// The next function avoids requiring an extra UUID package.
// Replace the import above with the regex version below
// if uuid is not installed in your project.
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_EVENTS = new Set([
  "BUY_NOW",
  "PREVIEW_PDF",
  "CHECKOUT_STARTED",
  "ADD_TO_CART",
  "DOWNLOAD_CLICK",
  "MOCK_INTERVIEW_BOOK",
  "CTA_CLICK",
]);

export function isUUID(value) {
  return (
    typeof value === "string" &&
    UUID_PATTERN.test(value)
  );
}

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

  return value.split("?")[0].split("#")[0];
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

export function getDevice(req, input = {}) {
  const parsed = new UAParser(
    req.headers["user-agent"] || ""
  ).getResult();

  const width = Number(input.screenWidth);
  const height = Number(input.screenHeight);

  return {
    type: parsed.device.type || "desktop",
    vendor: parsed.device.vendor || null,
    model: parsed.device.model || null,
    browser: parsed.browser.name || "Unknown",
    browserVersion: parsed.browser.version || null,
    os: parsed.os.name || "Unknown",
    osVersion: parsed.os.version || null,
    screenWidth:
      Number.isInteger(width) && width > 0 && width <= 10000
        ? width
        : null,
    screenHeight:
      Number.isInteger(height) && height > 0 && height <= 10000
        ? height
        : null,
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

export function validateBase(req, res, next) {
  const { visitorId, sessionId } = req.body || {};

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
