
import express from "express";

import {
  auth,
  isAdmin,
} from "../Middleware/auth.js";

import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  updateAffiliateStatus,
  deleteUser,
  sendPasswordLink,
  adminRevokeAll,
} from "../controllers/adminUserController.js";

import {
  getUserSessions,
  adminRevokeSession,
} from "../controllers/sessionController.js";

import {
  getUserActivities,
  clearUserActivities,
} from "../controllers/activityController.js";

import {
  getUsersConsole,
  getUserConsole,
  bulkUsers,
  exportUsers,
} from "../controllers/adminUserConsoleController.js";

const router = express.Router();

router.use(auth, isAdmin);

/* USER MANAGEMENT */

/* CONSOLE (one call per screen) — must stay above "/:userId" */
router.get("/console", getUsersConsole);
router.get("/export", exportUsers);
router.post("/bulk", bulkUsers);

router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:userId", getUserById);
router.get("/:userId/console", getUserConsole);

router.patch("/:userId", updateUser);

router.patch(
  "/:userId/status",
  updateUserStatus
);

router.patch(
  "/:userId/affiliate/status",
  updateAffiliateStatus
);

router.delete("/:userId", deleteUser);

/* PASSWORD RESET */

router.post(
  "/:userId/password-link",
  sendPasswordLink
);

/* DEVICE MANAGEMENT */

router.get(
  "/:userId/sessions",
  getUserSessions
);

router.delete(
  "/:userId/sessions/:sessionId",
  adminRevokeSession
);

router.post(
  "/:userId/logout-all",
  adminRevokeAll
);

/* USER ACTIVITIES */

router.get(
  "/:userId/activities",
  getUserActivities
);

router.delete(
  "/:userId/activities",
  clearUserActivities
);

export default router;
