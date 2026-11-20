
import express from "express";

import { auth } from "../Middleware/auth.js";

import {
  me,
} from "../controllers/authController.js";

import {
  getMySessions,
  revokeMySession,
  revokeMyOtherSessions,
  renameMySession,
  forgetMyDevice,
} from "../controllers/sessionController.js";

import {
  getMyActivities,
} from "../controllers/activityController.js";

import {
  getMyAccount,
  getMySales,
} from "../controllers/accountController.js";

const router = express.Router();

router.use(auth);

/* READ-ONLY PROFILE */

router.get("/me", me);

// One call for the whole /profile page: profile, 5 devices, 5 activities, affiliate sales.
router.get("/account", getMyAccount);

// Affiliates: sales numbers only (chart range change / refresh).
router.get("/account/sales", getMySales);

/* SESSION CONTROL */

router.get("/sessions", getMySessions);

// Log out every device except the current one.
router.delete("/sessions", revokeMyOtherSessions);

router.patch("/sessions/:sessionId", renameMySession);

router.delete(
  "/sessions/:sessionId",
  revokeMySession
);

router.delete(
  "/trusted-devices/:sessionId",
  forgetMyDevice
);

/* ACTIVITY */

router.get("/activities", getMyActivities);

export default router;
