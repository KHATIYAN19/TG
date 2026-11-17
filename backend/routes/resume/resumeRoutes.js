import express from "express";

import { auth, authorizeRoles, isAdmin } from "../../Middleware/auth.js";
import { budget, byIp } from "../../Middleware/budget.js";
import * as PB from "../../Middleware/publicBudgets.js";
import { envInt, HOUR, MINUTE } from "../../utils/limits.js";

import * as U from "../../controllers/resume/userController.js";
import * as A from "../../controllers/resume/adminController.js";

const viewLimit = budget({ name: "resume-view", limit: () => envInt("RESUME_VIEW_LIMIT", 120), windowSec: 10 * MINUTE, key: byIp, message: "Too many requests." });
const submitLimit = budget({ name: "resume-submit", limit: () => envInt("RESUME_SUBMIT_LIMIT", 20), windowSec: HOUR, key: (req) => req.user?.id, message: "Too many submissions. Please wait a little." });

/* PUBLIC  /api/resume/public  (the plans shown on the landing page) */
export const publicRouter = express.Router();
publicRouter.get("/", viewLimit, U.publicInfo);

/* PAYMENT RETURN  /api/resume/payments/callback/:gateway  (browser coming back from the gateway; public, it only asks the gateway about one order) */
export const paymentCallbackRouter = express.Router();
paymentCallbackRouter.all("/:gateway", PB.payStatusTenMin, U.gatewayCallback);

/* SIGNED-IN BUYER  /api/resume/* */
export const userRouter = express.Router();
userRouter.use(auth);
// 1. buy a plan (payment first)
userRouter.post("/plans/buy", PB.payCreateHourly, PB.payCreateDaily, U.buyPlan);
userRouter.get("/plans", U.myPlans);
userRouter.get("/plans/:id", U.getPlan);
userRouter.post("/plans/:id/pay", PB.payCreateHourly, PB.payCreateDaily, U.payPurchase);
userRouter.get("/plans/:id/payment-status", PB.payStatusTenMin, U.paymentStatus);
userRouter.post("/payments/verify", PB.payVerifyHourly, U.verifyPayment);
// 2. then send in a resume under that plan
userRouter.post("/requests", submitLimit, U.submitRequest);
userRouter.get("/requests", U.myRequests);
userRouter.get("/requests/:id", U.getRequest);
userRouter.get("/requests/:id/file", U.downloadDeliverable);
userRouter.post("/requests/:id/human", submitLimit, U.requestHuman);

/* REVIEWERS  /api/admin/resume/*  (admin now; Employee accounts can take and deliver reviews too) */
export const adminRouter = express.Router();
adminRouter.use(auth);
const reviewer = authorizeRoles("admin", "Employee");
adminRouter.get("/stats", reviewer, A.stats);
adminRouter.get("/requests", reviewer, A.listRequests);
adminRouter.get("/requests/:id", reviewer, A.getRequest);
adminRouter.post("/requests/:id/claim", reviewer, A.claim);
adminRouter.put("/requests/:id/review", reviewer, A.saveReview);
adminRouter.post("/requests/:id/rerun-ai", isAdmin, A.rerunAi);
adminRouter.delete("/requests/:id", isAdmin, A.deleteRequest);
adminRouter.get("/purchases", isAdmin, A.listPurchases);
adminRouter.post("/purchases/grant", isAdmin, A.grantPlan);
adminRouter.patch("/purchases/:id", isAdmin, A.updatePurchase);
adminRouter.delete("/purchases/:id", isAdmin, A.deletePurchase);
adminRouter.get("/members", isAdmin, A.listMembers);
adminRouter.post("/members/:userId/block", isAdmin, A.blockMember);
adminRouter.delete("/members/:userId/block", isAdmin, A.unblockMember);
adminRouter.get("/ai-settings", isAdmin, A.getAiSettings);
adminRouter.put("/ai-settings", isAdmin, A.saveAiSettings);
adminRouter.post("/ai-settings/test", isAdmin, A.testAiModel);
adminRouter.get("/packages", isAdmin, A.listPackages);
adminRouter.post("/packages", isAdmin, A.createPackage);
adminRouter.put("/packages/:id", isAdmin, A.updatePackage);
adminRouter.delete("/packages/:id", isAdmin, A.deletePackage);
