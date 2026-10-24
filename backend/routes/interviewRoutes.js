
import express from "express";

import {
  auth,
  isAdmin,
} from "../Middleware/auth.js";

import {
  getAvailableSlots,
  getPublicSlot,
  createInterviewBooking,
  getBookingStatus,
} from "../controllers/interviewBookingController.js";

import {
  createSlot,
  bulkCreateSlots,
  getAdminSlots,
  updateSlot,
  blockSlot,
  unblockSlot,
  deleteSlot,
  getAdminBookings,
  getAdminBooking,
  updateBooking,
  updateMeetingLink,
  cancelBookingByAdmin,
  completeBooking,
  deleteBooking,
} from "../controllers/interviewAdminController.js";

import {
  createInterviewPayment,
  reconcileInterviewPayment,
  initiateInterviewRefund,
  syncInterviewRefund,
} from "../controllers/interviewPaymentController.js";

const router = express.Router();

/* ==========================================
   PUBLIC ROUTES — NO ACCOUNT LOGIN
========================================== */

router.get(
  "/slots",
  getAvailableSlots
);

router.get(
  "/slots/:id",
  getPublicSlot
);

router.post(
  "/bookings",
  createInterviewBooking
);

router.post(
  "/bookings/:id/payment",
  createInterviewPayment
);

router.post(
  "/bookings/:id/reconcile",
  reconcileInterviewPayment
);

router.get(
  "/bookings/:id/status",
  getBookingStatus
);

/* ==========================================
   ADMIN ROUTES — AUTHENTICATION REQUIRED
========================================== */

router.use("/admin", auth, isAdmin);

/* Slot management */

router.post(
  "/admin/slots/bulk",
  bulkCreateSlots
);

router.post(
  "/admin/slots",
  createSlot
);

router.get(
  "/admin/slots",
  getAdminSlots
);

router.patch(
  "/admin/slots/:id",
  updateSlot
);

router.patch(
  "/admin/slots/:id/block",
  blockSlot
);

router.patch(
  "/admin/slots/:id/unblock",
  unblockSlot
);

router.delete(
  "/admin/slots/:id",
  deleteSlot
);

/* Booking management */

router.get(
  "/admin/bookings",
  getAdminBookings
);

router.get(
  "/admin/bookings/:id",
  getAdminBooking
);

router.patch(
  "/admin/bookings/:id",
  updateBooking
);

router.patch(
  "/admin/bookings/:id/meeting",
  updateMeetingLink
);

router.post(
  "/admin/bookings/:id/cancel",
  cancelBookingByAdmin
);

router.patch(
  "/admin/bookings/:id/complete",
  completeBooking
);

router.delete(
  "/admin/bookings/:id",
  deleteBooking
);

/* Refund management */

router.post(
  "/admin/bookings/:id/refund",
  initiateInterviewRefund
);

router.get(
  "/admin/bookings/:id/refund",
  syncInterviewRefund
);

/*
  Cashfree webhook stays registered in index.js
  BEFORE express.json().

  POST /api/interviews/payment/cashfree/webhook
*/

export default router;
