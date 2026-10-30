
import express from "express";
import {
  pageViewController,
  heartbeatController,
  engagementController,
  eventController,
  pageExitController,
  sessionEndController,
  liveController,
  overviewController,
  referralController,
  visitorsController,
  visitorJourneyController,
  dailyTrafficController,
} from "../controllers/analyticsController.js";

import {
  validateBase,
} from "../Middleware/analyticsValidation.js";

const router = express.Router();

// PUBLIC TRACKING ROUTES
// Mount behind your existing request-rate limiter.

router.post(
  "/page-view",
  validateBase,
  pageViewController
);

router.post(
  "/heartbeat",
  validateBase,
  heartbeatController
);

router.post(
  "/engagement",
  validateBase,
  engagementController
);

router.post(
  "/event",
  validateBase,
  eventController
);

router.post(
  "/page-exit",
  validateBase,
  pageExitController
);

router.post(
  "/session-end",
  validateBase,
  sessionEndController
);

// ADMIN ROUTES
// Must be protected in app.js using your existing
// authentication and admin-role authorization.

export const analyticsAdminRouter = express.Router();

analyticsAdminRouter.get("/live", liveController);
analyticsAdminRouter.get("/overview", overviewController);
analyticsAdminRouter.get("/referrals", referralController);
analyticsAdminRouter.get("/visitors", visitorsController);
analyticsAdminRouter.get(
  "/visitors/:visitorId",
  visitorJourneyController
);
analyticsAdminRouter.get(
  "/daily-traffic",
  dailyTrafficController
);

export default router;
