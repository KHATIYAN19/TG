import express from "express";

import { auth, isAdmin } from "../../Middleware/auth.js";
import { budget, byIp } from "../../Middleware/budget.js";
import { envInt, HOUR, MINUTE } from "../../utils/limits.js";
import * as PB from "../../Middleware/publicBudgets.js";

import * as U from "../../controllers/memory/memoryUserController.js";
import * as V from "../../controllers/memory/memoryPublicController.js";
import * as A from "../../controllers/memory/memoryAdminController.js";
import * as P from "../../controllers/memory/memoryPaymentController.js";
import * as RS from "../../controllers/memory/memoryResponseController.js";

/* ---------- limits ---------- */
// Wrong-PIN guessing: per visitor per page (10 / 15 min) plus a per-page ceiling (60 / hour); fail closed if Redis is down.
const pinGuess = budget({
  name: "memory-pin",
  limit: () => envInt("MEMORY_PIN_LIMIT", 10),
  windowSec: 15 * MINUTE,
  key: (req) => `${byIp(req)}:${req.params.slug}`,
  message: "Too many PIN attempts.",
  failClosed: true,
});
const pinGuessPerPage = budget({ name: "memory-pin-page", limit: () => envInt("MEMORY_PIN_PAGE_LIMIT", 60), windowSec: HOUR, key: (req) => `page:${req.params.slug}`, message: "Too many PIN attempts for this page.", failClosed: true });
const viewLimit = budget({ name: "memory-view", limit: () => envInt("MEMORY_VIEW_LIMIT", 120), windowSec: 10 * MINUTE, key: byIp, message: "Too many requests." });
// What the receiver sends back: batches of events, one answer, a few replies. Per visitor per page.
const eventLimit = budget({ name: "memory-events", limit: () => envInt("MEMORY_EVENT_LIMIT", 120), windowSec: 10 * MINUTE, key: (req) => `${byIp(req)}:${req.params.slug}`, message: "Too many requests." });
const answerLimit = budget({ name: "memory-answer", limit: () => envInt("MEMORY_ANSWER_LIMIT", 30), windowSec: HOUR, key: (req) => `${byIp(req)}:${req.params.slug}`, message: "Too many requests." });
const replyLimit = budget({ name: "memory-reply", limit: () => envInt("MEMORY_REPLY_LIMIT", 20), windowSec: HOUR, key: (req) => `${byIp(req)}:${req.params.slug}`, message: "Too many replies." });
const emailResendLimit = budget({ name: "memory-email-resend", limit: () => envInt("MEMORY_EMAIL_RESEND_LIMIT", 20), windowSec: HOUR, key: (req) => req.user?.id, message: "Too many emails." });
const codeLimit = budget({ name: "memory-code", limit: () => envInt("MEMORY_CODE_LIMIT", 10), windowSec: 10 * MINUTE, key: (req) => [byIp(req), req.user?.id], message: "Too many code attempts.", failClosed: true });
const uploadLimit = budget({ name: "memory-upload", limit: () => envInt("MEMORY_UPLOAD_LIMIT", 100), windowSec: HOUR, key: (req) => req.user?.id, message: "Too many uploads." });

/* =====================================================
   PUBLIC VIEWER  /api/memories/view/*   (no login)
===================================================== */
export const infoRouter = express.Router();
infoRouter.get("/", viewLimit, V.publicInfo);

export const publicRouter = express.Router();
publicRouter.get("/:slug", viewLimit, V.viewPage);
publicRouter.post("/:slug/unlock", pinGuess, pinGuessPerPage, V.unlockPage);
publicRouter.post("/:slug/events", eventLimit, RS.recordEvents);
publicRouter.post("/:slug/answer", answerLimit, RS.giveAnswer);
publicRouter.post("/:slug/reply", replyLimit, RS.sendReply);

/* =====================================================
   PAYMENT RETURN  /api/memories/payments/callback/:gateway  (browser coming back from the gateway)
   Public on purpose: the gateway redirects/POSTs here without our login cookie. Safe because it only
   asks the gateway about that one order and settles it to the order's own user.
===================================================== */
export const paymentCallbackRouter = express.Router();
paymentCallbackRouter.all("/:gateway", PB.payStatusTenMin, P.gatewayCallback);

/* =====================================================
   OWNER  /api/memories/*   (login required)
===================================================== */
export const userRouter = express.Router();
userRouter.use(auth);

userRouter.get("/config", U.getConfig);
userRouter.post("/codes/redeem", codeLimit, U.redeemCode);
userRouter.post("/credits/free", codeLimit, U.claimFreeCredit);
userRouter.post("/payments/create", PB.payCreateHourly, PB.payCreateDaily, P.createPayment);
userRouter.post("/payments/verify", PB.payVerifyHourly, P.verifyPayment);
userRouter.get("/payments/mine", P.myPayments);
userRouter.get("/payments/:orderId/status", PB.payStatusTenMin, P.paymentStatus);

userRouter.post("/pages", U.createPage);
userRouter.get("/pages", U.listPages);
userRouter.get("/pages/:id", U.getPage);
userRouter.get("/pages/:id/activity", U.getActivity);
userRouter.patch("/pages/:id", U.updatePage);
userRouter.delete("/pages/:id", U.deletePage);
userRouter.post("/pages/:id/visibility", U.setVisibility);
userRouter.post("/pages/:id/pin", U.changePin);
userRouter.post("/pages/:id/close", U.closePage);
userRouter.post("/pages/:id/email/resend", emailResendLimit, U.resendEmail);
userRouter.post("/pages/:id/reopen", U.reopenPage);
userRouter.post("/pages/:id/regenerate-link", U.regenerateLink);

userRouter.post("/pages/:id/media/presign", uploadLimit, U.presignMedia);
userRouter.post("/pages/:id/media/confirm", uploadLimit, U.confirmMedia);
userRouter.post("/pages/:id/media/:mediaId/main", U.setMainMedia);
userRouter.delete("/pages/:id/media/:mediaId", U.removeMedia);

/* =====================================================
   ADMIN  /api/admin/memories/*
===================================================== */
export const adminRouter = express.Router();
adminRouter.use(auth, isAdmin);

adminRouter.get("/settings", A.readSettings);
adminRouter.put("/settings", A.saveSettings);
adminRouter.get("/stats", A.stats);

adminRouter.get("/pages", A.listPages);
adminRouter.get("/pages/:id", A.getPage);
adminRouter.post("/pages/:id/pin", A.setPin);
adminRouter.post("/pages/:id/expiry", A.setExpiry);
adminRouter.post("/pages/:id/visibility", A.setVisibility);
adminRouter.post("/pages/:id/close", A.closePage);
adminRouter.post("/pages/:id/reopen", A.reopenPage);
adminRouter.post("/pages/:id/regenerate-link", A.regenerateLink);
adminRouter.post("/pages/:id/block", A.blockPage);
adminRouter.delete("/pages/:id/media/:mediaId", A.removePageMedia);
adminRouter.delete("/pages/:id", A.deletePage);

adminRouter.get("/users", A.listUsers);
adminRouter.post("/users/:userId/credits", A.grantUserCredits);
adminRouter.post("/users/:userId/credits/remove", A.removeUserCredits);
adminRouter.post("/users/:userId/suspend", A.suspendUser);
adminRouter.post("/users/:userId/unsuspend", A.unsuspendUser);
adminRouter.delete("/users/:userId", A.deleteUser);
adminRouter.get("/logins", A.loginActivity);
adminRouter.delete("/logins", A.clearLoginEvents);
adminRouter.delete("/logins/:id", A.deleteLoginEvent);
adminRouter.delete("/users/:userId/pages", A.deleteUserPages);

adminRouter.get("/codes", A.listCodes);
adminRouter.post("/codes", A.createCodes);
adminRouter.patch("/codes/:id", A.updateCode);
adminRouter.delete("/codes/:id", A.deleteCode);

adminRouter.get("/gateways", A.listGateways);
adminRouter.get("/mail-blocks", A.listMailBlocks);
adminRouter.post("/mail-blocks", A.addMailBlock);
adminRouter.delete("/mail-blocks/:id", A.removeMailBlock);
adminRouter.get("/orders", A.listOrders);
adminRouter.delete("/orders/:id", A.deleteOrder);

adminRouter.get("/occasions", A.listOccasions);
adminRouter.post("/occasions", A.createOccasion);
adminRouter.patch("/occasions/:id", A.updateOccasion);
adminRouter.delete("/occasions/:id", A.deleteOccasion);
