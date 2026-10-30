
import express from "express";

import {
  getOverview,
  getTimeline,
  getPages,
  getPageDetails,
  getReferrals,
  getDevices,
  getLive,
} from "../controllers/analyticsReportController.js";

import {auth, isAdmin} from "../Middleware/auth.js";

const router = express.Router();

// Add auth and isAdmin to this router at mount time,
// as shown below. This ensures every route is protected.

// Live users, independent of reporting period
router.get("/live", auth, isAdmin, getLive);

// Overall reporting
router.get("/overview", auth, isAdmin,   getOverview);

// Graph showing page views and users over time
router.get("/timeline", auth, isAdmin, getTimeline);

// Most viewed routes with unique visitor counts
router.get("/pages", auth, isAdmin, getPages);

// Detailed metrics for one specific route
router.get("/page-details", auth, isAdmin, getPageDetails);

// Referrals: ASH, TT and other codes
router.get("/referrals", auth, isAdmin, getReferrals);

// Devices, browser and operating system
router.get("/devices", auth, isAdmin,  getDevices);

export default router;
