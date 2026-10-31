import express from "express";

import {
  getLive,
  getLiveHistory,
  getDashboard,
  getOverview,
  getTimeline,
  getPages,
  getPageDetails,
  getEntryExit,
  getReferrals,
  getSources,
  getQueryParams,
  getDevices,
  getGeo,
  getEvents,
  getHeatmap,
  getVisitors,
  getSessions,
  getVisitorJourney,
} from "../controllers/analyticsReportController.js";

import { auth, isAdmin } from "../Middleware/auth.js";

const router = express.Router();

// Mounted at /api/admin/analytics. Every route is admin-only.
router.use(auth, isAdmin);

// Real time
router.get("/live", getLive);
router.get("/live-history", getLiveHistory);

// Everything for the dashboard in one request
router.get("/dashboard", getDashboard);

// Totals, with comparison to the previous period
router.get("/overview", getOverview);

// Chart series: page views, visitors, sessions per bucket
router.get("/timeline", getTimeline);

// Routes
router.get("/pages", getPages);
router.get("/page-details", getPageDetails);
router.get("/entry-exit", getEntryExit);

// Acquisition
router.get("/referrals", getReferrals);
router.get("/sources", getSources);
router.get("/query-params", getQueryParams);

// Audience
router.get("/devices", getDevices);
router.get("/geo", getGeo);

// Behaviour
router.get("/events", getEvents);
router.get("/heatmap", getHeatmap);

// Individual records
router.get("/visitors", getVisitors);
router.get("/visitors/:visitorId", getVisitorJourney);
router.get("/sessions", getSessions);

export default router;
