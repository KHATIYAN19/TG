
import express from "express";

/* ==========================================
   AUTH CONTROLLERS
========================================== */

import {
  login,
  verifyOtp,
  resendOtp,
  refreshToken,
  logout,
  logoutAll,
  me,
} from "../controllers/authController.js";

/* ==========================================
   PASSWORD SETUP CONTROLLER
========================================== */

import {
  completePasswordSetup,
} from "../controllers/passwordSetupController.js";

/* ==========================================
   CHANGE PASSWORD CONTROLLER
========================================== */

import {
  changeMyPassword,
} from "../controllers/adminUserController.js";

/* ==========================================
   AUTH MIDDLEWARE
========================================== */

import {
  auth,
} from "../Middleware/auth.js";

/* ==========================================
   REDIS RATE LIMITERS
========================================== */

import {
  loginLimiter,
  otpLimiter,
  otpResendLimiter,
  refreshLimiter,
  passwordSetupLimiter,
} from "../Middleware/rateLimiter.js";

/* ==========================================
   INITIALIZE ROUTER
========================================== */

const router = express.Router();

/* ==========================================
   PUBLIC AUTHENTICATION ROUTES
========================================== */

// Login with email/mobile and password.
// Admins skip OTP.
// Other roles require OTP on untrusted devices.
router.post(
  "/login",
  loginLimiter,
  login
);

// Verify login OTP.
router.post(
  "/verify-otp",
  otpLimiter,
  verifyOtp
);

// Resend login OTP.
router.post(
  "/resend-otp",
  otpResendLimiter,
  resendOtp
);

// Complete initial password setup or
// admin-initiated password reset.
router.post(
  "/password/setup",
  passwordSetupLimiter,
  completePasswordSetup
);

// Refresh access token using refresh cookie.
router.post(
  "/refresh",
  refreshLimiter,
  refreshToken
);

/* ==========================================
   AUTHENTICATED ROUTES
========================================== */

// Get currently authenticated user.
router.get(
  "/me",
  auth,
  me
);

// Change own password.
// Supported roles:
// admin, Employee, normal, affiliate.
//
// Requires current password.
// On success, all sessions are revoked.
router.post(
  "/change-password",
  auth,
  passwordSetupLimiter,
  changeMyPassword
);

// Logout current device.
router.post(
  "/logout",
  auth,
  logout
);

// Logout all devices and invalidate tokens.
router.post(
  "/logout-all",
  auth,
  logoutAll
);

/* ==========================================
   EXPORT
========================================== */

export default router;
