
import express from "express";

import { auth } from "../Middleware/auth.js";

import {
  me,
} from "../controllers/authController.js";

import {
  getMySessions,
  revokeMySession,
  forgetMyDevice,
} from "../controllers/sessionController.js";

import {
  getMyActivities,
} from "../controllers/activityController.js";

const router = express.Router();

router.use(auth);

/* READ-ONLY PROFILE */

router.get("/me", me);

/* SESSION CONTROL */

router.get("/sessions", getMySessions);

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
