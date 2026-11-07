import express from "express";

import { auth, isAdmin } from "../../Middleware/auth.js";
import * as admin from "../../controllers/arena/adminController.js";
import * as ops from "../../controllers/arena/adminOpsController.js";
import * as purge from "../../controllers/arena/adminPurgeController.js";
import { refundPayment } from "../../controllers/arena/adminRefundController.js";
import { listAccounts, remindAccount } from "../../controllers/arena/adminAccountsController.js";

const router = express.Router();

router.use(auth, isAdmin);

router.get("/settings", admin.getSettings);
router.put("/settings", admin.updateSettings);
router.get("/stats", admin.stats);
router.post("/repair", admin.repair);

router.get("/profiles", admin.listProfiles);
router.get("/accounts", listAccounts);
router.post("/accounts/:id/remind", remindAccount);
router.post("/accounts/:id/matches", ops.grantToAccount);
router.post("/profiles/:id/suspend", admin.suspendProfile);
router.post("/profiles/:id/unsuspend", admin.unsuspendProfile);
router.post("/profiles/:id/hide", admin.hideProfile);
router.post("/profiles/:id/unhide", admin.unhideProfile);

router.get("/requests", ops.listRequests);
router.delete("/requests/:id", purge.deleteRequest);
router.get("/matches", ops.listMatches);
router.get("/matches/:id/messages", ops.matchMessages);
router.post("/matches/:id/dissolve", admin.dissolveMatch);
router.delete("/matches/:id", purge.deleteMatch);
router.delete("/matches/:id/messages", purge.clearChat);
router.delete("/messages/:id", purge.deleteChatMessage);

router.get("/reports", admin.listReports);
router.post("/reports/:id/resolve", admin.resolveReport);
router.delete("/reports/:id", ops.deleteReport);

router.get("/coupons", admin.listCoupons);
router.post("/coupons", admin.createCoupon);
router.put("/coupons/:id", admin.updateCoupon);
router.delete("/coupons/:id", admin.deleteCoupon);

router.get("/payments", ops.listPayments);
router.post("/payments/:id/refund", refundPayment);
router.delete("/payments/:id", purge.deletePayment);
router.delete("/members/:userId", purge.deleteMember);

router.post("/members/:id/matches", ops.adjustMatches);
router.get("/audit", ops.listAudit);
router.delete("/audit/:id", purge.deleteAuditEntry);
router.delete("/audit", purge.clearAudit);
router.post("/locks/clear", purge.clearLocksFor);

router.get("/bugs", admin.listBugs);
router.put("/bugs/:id", admin.updateBug);
router.delete("/bugs/:id", ops.deleteBug);

export default router;
