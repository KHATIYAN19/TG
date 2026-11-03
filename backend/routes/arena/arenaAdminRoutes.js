import express from "express";

import { auth, isAdmin } from "../../Middleware/auth.js";
import * as admin from "../../controllers/arena/adminController.js";
import * as ops from "../../controllers/arena/adminOpsController.js";

const router = express.Router();

router.use(auth, isAdmin);

router.get("/settings", admin.getSettings);
router.put("/settings", admin.updateSettings);
router.get("/stats", admin.stats);
router.post("/repair", admin.repair);

router.get("/profiles", admin.listProfiles);
router.post("/profiles/:id/suspend", admin.suspendProfile);
router.post("/profiles/:id/unsuspend", admin.unsuspendProfile);

router.get("/requests", ops.listRequests);
router.get("/matches", ops.listMatches);
router.get("/matches/:id/messages", ops.matchMessages);
router.post("/matches/:id/dissolve", admin.dissolveMatch);

router.get("/reports", admin.listReports);
router.post("/reports/:id/resolve", admin.resolveReport);
router.delete("/reports/:id", ops.deleteReport);

router.get("/coupons", admin.listCoupons);
router.post("/coupons", admin.createCoupon);
router.put("/coupons/:id", admin.updateCoupon);
router.delete("/coupons/:id", admin.deleteCoupon);

router.get("/payments", ops.listPayments);

router.post("/members/:id/matches", ops.adjustMatches);
router.get("/audit", ops.listAudit);

router.get("/bugs", admin.listBugs);
router.put("/bugs/:id", admin.updateBug);
router.delete("/bugs/:id", ops.deleteBug);

export default router;
