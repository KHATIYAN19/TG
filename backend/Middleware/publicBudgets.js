import { budget, byIp } from "./budget.js";
import { DAY, HOUR, MINUTE, envInt } from "../utils/limits.js";

/*
  PUBLIC ENDPOINTS: COST & ABUSE BUDGETS (per client IP)
  ------------------------------------------------------
  Everything here is reachable without logging in, so each one has a cap sized
  for real people but not for scripts:
    - anything that creates a payment order or calls a payment gateway
    - coupon lookups (codes are guessable)
    - interview booking steps
    - public forms (these can send email or write to the database)
    - counters that write on every page view
  Gateway WEBHOOKS are deliberately not limited here: they come from the
  payment provider and are verified by signature.
  All numbers can be tuned with env vars and are read at request time.
*/

const perIp = (name, env, fallback, windowSec, message, extra = {}) =>
  budget({ name, limit: () => envInt(env, fallback), windowSec, key: byIp, message, ...extra });

/* ---- payments (a gateway API call + a DB write each time) ---- */
export const payCreateHourly = perIp("pay-create-h", "PAY_CREATE_HOURLY_LIMIT", 20, HOUR, "Too many payment attempts from your network.");
export const payCreateDaily = perIp("pay-create-d", "PAY_CREATE_DAILY_LIMIT", 100, DAY, "You've reached today's payment attempt limit.");
export const payVerifyHourly = perIp("pay-verify", "PAY_VERIFY_HOURLY_LIMIT", 60, HOUR, "Too many payment confirmations.");
export const payStatusTenMin = perIp("pay-status", "PAY_STATUS_LIMIT", 60, 10 * MINUTE, "Too many payment status checks.");

/* ---- coupons ---- */
export const couponValidate = perIp("coupon-validate", "COUPON_VALIDATE_LIMIT", 30, 10 * MINUTE, "Too many coupon checks.");
export const couponList = perIp("coupon-list", "COUPON_LIST_LIMIT", 60, 10 * MINUTE, "Too many requests.");

/* ---- interview booking funnel ---- */
export const bookingCreateHourly = perIp("booking-create-h", "BOOKING_CREATE_HOURLY_LIMIT", 10, HOUR, "Too many booking attempts from your network.");
export const bookingCreateDaily = perIp("booking-create-d", "BOOKING_CREATE_DAILY_LIMIT", 30, DAY, "You've reached today's booking limit.");
export const bookingStep = perIp("booking-step", "BOOKING_STEP_HOURLY_LIMIT", 40, HOUR, "Too many booking requests.");
export const bookingStatus = perIp("booking-status", "BOOKING_STATUS_LIMIT", 120, 10 * MINUTE, "Too many status checks.");

/* ---- public forms: on top of the existing 5 / 10 minutes ---- */
export const formDaily = perIp("form-d", "PUBLIC_FORM_DAILY_LIMIT", 15, DAY, "You've sent too many messages today.");

/* ---- review links + blog view counter ---- */
export const reviewLinkHourly = perIp("review-link", "REVIEW_LINK_HOURLY_LIMIT", 20, HOUR, "Too many review requests.");
export const blogViewTenMin = perIp("blog-view", "BLOG_VIEW_LIMIT", 60, 10 * MINUTE, "Too many requests.", { code: "RATE_LIMITED" });
