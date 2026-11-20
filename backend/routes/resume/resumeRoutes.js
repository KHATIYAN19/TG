import express from "express";

import { auth, authorizeRoles, isAdmin } from "../../Middleware/auth.js";
import { budget, byIp } from "../../Middleware/budget.js";
import * as PB from "../../Middleware/publicBudgets.js";
import { envInt, HOUR, MINUTE } from "../../utils/limits.js";

import * as U from "../../controllers/resume/userController.js";
import * as A from "../../controllers/resume/adminController.js";
import * as B from "../../controllers/resume/builderController.js";

const viewLimit = budget({ name: "resume-view", limit: () => envInt("RESUME_VIEW_LIMIT", 120), windowSec: 10 * MINUTE, key: byIp, message: "Too many requests." });
const builderLimit = budget({ name: "resume-builder", limit: () => envInt("RESUME_BUILDER_LIMIT", 120), windowSec: HOUR, key: (req) => req.user?.id, message: "Too many changes. Please wait a little." });
const pdfLimit = budget({ name: "resume-builder-pdf", limit: () => envInt("RESUME_BUILDER_PDF_LIMIT", 40), windowSec: HOUR, key: (req) => req.user?.id, message: "Too many PDF previews. Please wait a little." });
const tailorLimit = budget({ name: "resume-builder-ai", limit: () => envInt("RESUME_BUILDER_AI_LIMIT", 10), windowSec: HOUR, key: (req) => req.user?.id, message: "You have used the AI resume writer a lot this hour. Please wait a little." });
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
// 0. the whole space in one call, and the Resume Vault (the PDFs kept on file)
userRouter.get("/app", U.appBootstrap);
userRouter.get("/vault", U.vaultList);
userRouter.post("/vault", submitLimit, U.vaultCreate);
userRouter.patch("/vault/:id", U.vaultUpdate);
userRouter.delete("/vault/:id", U.vaultDelete);
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
userRouter.post("/requests/:id/rerun", submitLimit, U.rerunMine); // 1 AI credit
userRouter.delete("/requests/:id", U.deleteMyRequest); // soft delete; the admin route below deletes for good

// 3. resume builder (AI only): upload a resume + a job or target role, answer a few questions, edit, get a PDF. One builder credit per build; an admin can switch it off.
userRouter.get("/builder/status", B.status);
userRouter.get("/builder/drafts", B.listDrafts);
userRouter.get("/builder/drafts/:id", B.getDraft);
userRouter.put("/builder/drafts/:id", builderLimit, B.saveDraft);
userRouter.delete("/builder/drafts/:id", B.deleteDraft);
userRouter.post("/builder/tailor", tailorLimit, B.startTailor);
userRouter.put("/builder/drafts/:id/answers", builderLimit, B.saveAnswers);
userRouter.post("/builder/drafts/:id/generate", tailorLimit, B.generateTailored);
userRouter.post("/builder/drafts/:id/retry", tailorLimit, B.retry);
userRouter.get("/builder/drafts/:id/pdf", pdfLimit, B.draftPdf);

/* REVIEWERS  /api/admin/resume/*  (admin now; Employee accounts can take and deliver reviews too) */
export const adminRouter = express.Router();
adminRouter.use(auth);
const reviewer = authorizeRoles("admin", "Employee");
adminRouter.get("/overview", reviewer, A.overview); // the console's first screen in one call
adminRouter.get("/stats", reviewer, A.stats);
adminRouter.get("/requests", reviewer, A.listRequests);
adminRouter.post("/requests/bulk-delete", isAdmin, A.bulkDeleteRequests);
adminRouter.get("/requests/:id", reviewer, A.getRequest);
adminRouter.post("/requests/:id/claim", reviewer, A.claim);
adminRouter.put("/requests/:id/review", reviewer, A.saveReview);
adminRouter.post("/requests/:id/rerun-ai", isAdmin, A.rerunAi);
adminRouter.delete("/requests/:id", isAdmin, A.deleteRequest);
adminRouter.get("/purchases", isAdmin, A.listPurchases);
adminRouter.post("/purchases/grant", isAdmin, A.grantPlan);
adminRouter.post("/purchases/bulk-delete", isAdmin, A.bulkDeletePurchases);
adminRouter.patch("/purchases/:id", isAdmin, A.updatePurchase);
adminRouter.delete("/purchases/:id", isAdmin, A.deletePurchase);
adminRouter.get("/members", isAdmin, A.listMembers);
adminRouter.post("/members/:userId/block", isAdmin, A.blockMember);
adminRouter.delete("/members/:userId/block", isAdmin, A.unblockMember);
adminRouter.delete("/members/:userId/data", isAdmin, A.eraseMember);
adminRouter.get("/builder", isAdmin, A.builderPanel); // switch + questions in one call
adminRouter.delete("/builder/drafts/:id", isAdmin, A.deleteDraftForGood);
adminRouter.get("/builder/questions", isAdmin, B.adminQuestions);
adminRouter.get("/builder/settings", isAdmin, A.getBuilderSettings);
adminRouter.put("/builder/settings", isAdmin, A.saveBuilderSettings);
adminRouter.get("/ai-settings", isAdmin, A.getAiSettings);
adminRouter.put("/ai-settings", isAdmin, A.saveAiSettings);
adminRouter.post("/ai-settings/test", isAdmin, A.testAiModel);
adminRouter.get("/packages", isAdmin, A.listPackages);
adminRouter.post("/packages", isAdmin, A.createPackage);
adminRouter.put("/packages/:id", isAdmin, A.updatePackage);
adminRouter.delete("/packages/:id", isAdmin, A.deletePackage);
