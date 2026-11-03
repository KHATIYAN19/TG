import { budget, byIp, byUser } from "./budget.js";
import { DAY, HOUR, envInt } from "../utils/limits.js";

/*
  PREP BUDDY: PER-MEMBER BUDGETS
  ------------------------------
  Keep abuse and cost bounded: request spam / send-withdraw-send churn,
  report and block flooding, payment and coupon hammering, chat edits.
  Every number can be tuned with an env var; values are read at request time.
  Keys are per signed-in member (never shared across members).
*/

const perUser = (name, env, fallback, windowSec, message, extra = {}) =>
  budget({
    name,
    limit: () => envInt(env, fallback),
    windowSec,
    key: byUser,
    message,
    code: "ARENA_LIMIT",
    ...extra,
  });

/* ---- requests: sent / unsent / answered ---- */
export const sendRequestHourly = perUser("req-send-h", "ARENA_REQ_HOURLY_LIMIT", 10, HOUR, "You're sending requests too fast (10 per hour).");
export const sendRequestDaily = perUser("req-send-d", "ARENA_REQ_DAILY_LIMIT", 30, DAY, "You've reached today's limit of 30 requests.");
/* Stops send → withdraw → send → withdraw loops against ONE member. */
export const sendRequestPerTarget = budget({
  name: "req-send-target",
  limit: () => envInt("ARENA_REQ_PER_TARGET_LIMIT", 3),
  windowSec: DAY,
  key: (req) => (byUser(req) && req.body?.toProfileId ? `${byUser(req)}:${String(req.body.toProfileId).slice(0, 40)}` : null),
  message: "You've already sent this member a request 3 times today.",
  code: "ARENA_LIMIT",
});
export const withdrawDaily = perUser("req-withdraw", "ARENA_WITHDRAW_DAILY_LIMIT", 15, DAY, "You've withdrawn too many requests today (15).");
export const respondDaily = perUser("req-respond", "ARENA_RESPOND_DAILY_LIMIT", 60, DAY, "You've answered too many requests today.");

/* ---- safety actions ---- */
export const blockDaily = perUser("block", "ARENA_BLOCK_DAILY_LIMIT", 10, DAY, "You've blocked or unblocked too many members today.");
export const reportDaily = perUser("report", "ARENA_REPORT_DAILY_LIMIT", 10, DAY, "You've sent too many reports today.");
export const bugDaily = perUser("bug", "ARENA_BUG_DAILY_LIMIT", 5, DAY, "You've sent too many bug reports today (5).");

/* ---- profile ---- */
export const profileHourly = perUser("profile", "ARENA_PROFILE_HOURLY_LIMIT", 20, HOUR, "You're changing your profile too often.");

/* ---- money ---- */
export const checkoutHourly = perUser("checkout", "ARENA_CHECKOUT_HOURLY_LIMIT", 10, HOUR, "Too many payment attempts.");
export const verifyHourly = perUser("verify", "ARENA_VERIFY_HOURLY_LIMIT", 30, HOUR, "Too many payment checks.");
export const reconcileHourly = perUser("reconcile", "ARENA_RECONCILE_HOURLY_LIMIT", 20, HOUR, "Too many payment status checks.");
export const cancelDaily = perUser("cancel", "ARENA_CANCEL_DAILY_LIMIT", 5, DAY, "Too many cancellation attempts today.");
export const accountDeleteDaily = perUser("account-delete", "ARENA_ACCOUNT_DELETE_DAILY_LIMIT", 10, DAY, "Too many account deletion attempts today.");
/* Coupon codes are guessable: limit per member AND per network. */
export const couponHourly = budget({
  name: "coupon",
  limit: () => envInt("ARENA_COUPON_HOURLY_LIMIT", 30),
  windowSec: HOUR,
  key: (req) => [byUser(req), byIp(req) && `ip:${byIp(req)}`],
  message: "Too many coupon checks.",
  code: "ARENA_LIMIT",
});

/* ---- chat (REST actions; live messages are capped in the socket) ---- */
export const chatEditHourly = perUser("chat-edit", "ARENA_CHAT_EDIT_HOURLY_LIMIT", 60, HOUR, "You're editing or deleting messages too often.");
export const chatReactHourly = perUser("chat-react", "ARENA_CHAT_REACT_HOURLY_LIMIT", 300, HOUR, "You're reacting too often.");
