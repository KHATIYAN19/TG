import express from "express";

import { auth } from "../../Middleware/auth.js";
import { arenaSignupLimiter, arenaPasswordLimiter, arenaWriteLimiter } from "../../Middleware/rateLimiter.js";

import { signup, verifySignup, resendSignupOtp, forgotPassword, resetPassword } from "../../controllers/arena/authController.js";
import * as member from "../../controllers/arena/memberController.js";
import * as pay from "../../controllers/arena/paymentController.js";

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
router.put("/profile", arenaWriteLimiter, member.upsertProfile);
router.put("/share-settings", arenaWriteLimiter, member.updateShareSettings);

router.get("/browse", member.browse);

router.get("/requests", member.listRequests);
router.post("/requests", arenaWriteLimiter, member.sendRequest);
router.post("/requests/:id/accept", arenaWriteLimiter, member.accept);
router.post("/requests/:id/reject", arenaWriteLimiter, member.reject);
router.post("/requests/:id/withdraw", arenaWriteLimiter, member.withdraw);

router.get("/match", member.getMatch);
router.get("/match/messages", member.matchMessages);
router.post("/match/end", arenaWriteLimiter, member.endMyMatch);

router.get("/blocks", member.listBlocks);
router.post("/blocks", arenaWriteLimiter, member.block);
router.delete("/blocks/:profileId", arenaWriteLimiter, member.unblock);
router.post("/reports", arenaWriteLimiter, member.report);

router.post("/bugs", arenaWriteLimiter, member.reportBug);
router.get("/bugs", member.myBugs);

router.post("/coupon/validate", arenaWriteLimiter, pay.validateCoupon);
router.post("/entry/checkout", arenaWriteLimiter, pay.checkout);
router.post("/entry/verify", arenaWriteLimiter, pay.verifyPayment);
router.post("/entry/reconcile", arenaWriteLimiter, pay.reconcile);
router.get("/entry/cancel-preview", pay.cancelPreview);
router.post("/entry/cancel", arenaWriteLimiter, pay.cancelEntry);

export default router;
