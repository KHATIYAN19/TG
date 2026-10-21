
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
} from "../controllers/activityController.js";

const router = express.Router();

router.use(auth, isAdmin);

/* USER MANAGEMENT */

router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:userId", getUserById);

router.patch("/:userId", updateUser);

router.patch(
  "/:userId/status",
  updateUserStatus
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

export default router;
