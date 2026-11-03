import express from "express";

import { auth } from "../../Middleware/auth.js";
import { arenaSignupLimiter, arenaPasswordLimiter, arenaWriteLimiter } from "../../Middleware/rateLimiter.js";
import * as B from "../../Middleware/arenaBudgets.js";

import { signup, verifySignup, resendSignupOtp, forgotPassword, resetPassword } from "../../controllers/arena/authController.js";
import * as member from "../../controllers/arena/memberController.js";
import * as pay from "../../controllers/arena/paymentController.js";
import * as chat from "../../controllers/arena/chatController.js";
import { deleteMyAccount } from "../../controllers/arena/accountController.js";

const router = express.Router();

/* ---------- public ---------- */
router.get("/public", member.publicInfo);
router.post("/signup", arenaSignupLimiter, signup);
router.post("/signup/verify", arenaSignupLimiter, verifySignup);
router.post("/signup/resend", arenaSignupLimiter, resendSignupOtp);
router.post("/password/forgot", arenaPasswordLimiter, forgotPassword);
router.post("/password/reset", arenaPasswordLimiter, resetPassword);

/* ---------- everything below needs a signed-in member ---------- */
router.use(auth);

router.get("/me", member.me);
router.delete("/account", arenaWriteLimiter, B.accountDeleteDaily, deleteMyAccount);
router.put("/profile", arenaWriteLimiter, B.profileHourly, member.upsertProfile);
router.put("/share-settings", arenaWriteLimiter, B.profileHourly, member.updateShareSettings);
router.put("/visibility", arenaWriteLimiter, B.profileHourly, member.setVisibility);

router.get("/browse", member.browse);

router.get("/requests", member.listRequests);
router.post("/requests", arenaWriteLimiter, B.sendRequestHourly, B.sendRequestDaily, B.sendRequestPerTarget, member.sendRequest);
router.post("/requests/:id/accept", arenaWriteLimiter, B.respondDaily, member.accept);
router.post("/requests/:id/reject", arenaWriteLimiter, B.respondDaily, member.reject);
router.post("/requests/:id/withdraw", arenaWriteLimiter, B.withdrawDaily, member.withdraw);

router.get("/match", member.getMatch);
router.get("/match/messages", member.matchMessages);
router.post("/match/end", arenaWriteLimiter, member.endMyMatch);
router.patch("/match/messages/:id", arenaWriteLimiter, B.chatEditHourly, chat.edit);
router.delete("/match/messages/:id", arenaWriteLimiter, B.chatEditHourly, chat.remove);
router.put("/match/messages/:id/reaction", arenaWriteLimiter, B.chatReactHourly, chat.react);

router.get("/blocks", member.listBlocks);
router.post("/blocks", arenaWriteLimiter, B.blockDaily, member.block);
router.delete("/blocks/:profileId", arenaWriteLimiter, B.blockDaily, member.unblock);
router.post("/reports", arenaWriteLimiter, B.reportDaily, member.report);

router.post("/bugs", arenaWriteLimiter, B.bugDaily, member.reportBug);
router.get("/bugs", member.myBugs);

router.post("/coupon/validate", arenaWriteLimiter, B.couponHourly, pay.validateCoupon);
router.post("/entry/checkout", arenaWriteLimiter, B.checkoutHourly, pay.checkout);
router.post("/entry/verify", arenaWriteLimiter, B.verifyHourly, pay.verifyPayment);
router.post("/entry/reconcile", arenaWriteLimiter, B.reconcileHourly, pay.reconcile);
router.get("/entry/cancel-preview", pay.cancelPreview);
router.post("/entry/cancel", arenaWriteLimiter, B.cancelDaily, pay.cancelEntry);

export default router;
