
import express from "express";

import {
  auth,
  isAdmin,
} from "../Middleware/auth.js";

/* =====================================================
   INTERVIEW BOOKING CONTROLLERS
===================================================== */

import {
  getAvailableSlots,
  getPublicSlot,
  createInterviewBooking,
  getBookingStatus,
  getMyBookings,
  cancelMyBooking,
} from "../controllers/interviewBookingController.js";

/* =====================================================
   ADMIN CONTROLLERS
===================================================== */

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

/* =====================================================
   PAYMENT CONTROLLERS
===================================================== */

import {
  createInterviewPayment,
  reconcileInterviewPayment,
  initiateInterviewRefund,
  syncInterviewRefund,
} from "../controllers/interviewPaymentController.js";

const router = express.Router();

/* =====================================================
   IMPORTANT: CASHFREE WEBHOOK

   The following webhook is now registered directly
   in index.js BEFORE express.json():

   POST /api/interviews/payment/cashfree/webhook

   Do not register it again in this router.

   This ensures:
   - Original raw request body is preserved
   - Cashfree signature can be verified
   - Webhook does not require JWT authentication
   - Global rate limiter does not block webhook calls

   All other interview APIs remain in this router.
===================================================== */

/* =====================================================
   1. PUBLIC INTERVIEW SLOT ROUTES

   Mounted under:
   /api/interviews

   These routes do not require authentication.
===================================================== */

// GET /api/interviews/slots
// Supports date and availability filters.
router.get(
  "/slots",
  getAvailableSlots
);

// GET /api/interviews/slots/:id
router.get(
  "/slots/:id",
  getPublicSlot
);

/* =====================================================
   2. AUTHENTICATED USER ROUTES

   Only authenticated users can:
   - Create interview bookings
   - Initiate payments
   - Reconcile payments
   - View their bookings
   - Cancel their bookings
===================================================== */

// GET /api/interviews/my-bookings
router.get(
  "/my-bookings",
  auth,
  getMyBookings
);

// POST /api/interviews/bookings
router.post(
  "/bookings",
  auth,
  createInterviewBooking
);

// POST /api/interviews/bookings/:id/payment
router.post(
  "/bookings/:id/payment",
  auth,
  createInterviewPayment
);

// POST /api/interviews/bookings/:id/reconcile
//
// Checks the payment status directly with Cashfree.
// It must not trust any payment status from the browser.
//
// SUCCESS => payment SUCCESS, booking CONFIRMED,
//            and slot BOOKED.
//
// FAILED / EXPIRED => update only after a verified
//                     terminal result.
//
// PENDING => retain reservation until safe to release.
router.post(
  "/bookings/:id/reconcile",
  auth,
  reconcileInterviewPayment
);

// GET /api/interviews/bookings/:id/status
router.get(
  "/bookings/:id/status",
  auth,
  getBookingStatus
);

// POST /api/interviews/bookings/:id/cancel
router.post(
  "/bookings/:id/cancel",
  auth,
  cancelMyBooking
);

/* =====================================================
   3. ADMIN AUTHENTICATION

   All routes below /admin require:
   - Valid JWT
   - Admin role

   Final API prefix:
   /api/interviews/admin
===================================================== */

router.use(
  "/admin",
  auth,
  isAdmin
);

/* =====================================================
   4. ADMIN SLOT MANAGEMENT
===================================================== */

// Create multiple slots in one request.
//
// POST /api/interviews/admin/slots/bulk
router.post(
  "/admin/slots/bulk",
  bulkCreateSlots
);

// Create a single interview slot.
//
// POST /api/interviews/admin/slots
router.post(
  "/admin/slots",
  createSlot
);

// List all slots, including booked/blocked slots.
//
// GET /api/interviews/admin/slots
router.get(
  "/admin/slots",
  getAdminSlots
);

// Update slot price, MRP, date, time,
// duration, topics and meeting URL.
//
// PATCH /api/interviews/admin/slots/:id
router.patch(
  "/admin/slots/:id",
  updateSlot
);

// Block an available slot.
//
// PATCH /api/interviews/admin/slots/:id/block
router.patch(
  "/admin/slots/:id/block",
  blockSlot
);

// Unblock a blocked slot.
//
// PATCH /api/interviews/admin/slots/:id/unblock
router.patch(
  "/admin/slots/:id/unblock",
  unblockSlot
);

// Soft-delete an interview slot.
//
// DELETE /api/interviews/admin/slots/:id
router.delete(
  "/admin/slots/:id",
  deleteSlot
);

/* =====================================================
   5. ADMIN BOOKING MANAGEMENT
===================================================== */

// View all bookings with pagination and filters.
//
// GET /api/interviews/admin/bookings
router.get(
  "/admin/bookings",
  getAdminBookings
);

// Get complete booking details.
//
// GET /api/interviews/admin/bookings/:id
router.get(
  "/admin/bookings/:id",
  getAdminBooking
);

// Update candidate information and admin notes.
//
// PATCH /api/interviews/admin/bookings/:id
router.patch(
  "/admin/bookings/:id",
  updateBooking
);

// Assign/update video meeting URL.
//
// PATCH /api/interviews/admin/bookings/:id/meeting
//
// The controller can send confirmation emails
// once a verified booking has a meeting URL.
router.patch(
  "/admin/bookings/:id/meeting",
  updateMeetingLink
);

// Cancel a booking with required reason.
//
// POST /api/interviews/admin/bookings/:id/cancel
//
// The controller:
// - Records cancellation reason
// - Releases the slot when safe
// - Preserves booking/payment history
// - Marks applicable refund as pending
// - Sends cancellation notifications
router.post(
  "/admin/bookings/:id/cancel",
  cancelBookingByAdmin
);

// Mark interview completed.
//
// PATCH /api/interviews/admin/bookings/:id/complete
router.patch(
  "/admin/bookings/:id/complete",
  completeBooking
);

// Soft-delete a closed booking.
//
// DELETE /api/interviews/admin/bookings/:id
router.delete(
  "/admin/bookings/:id",
  deleteBooking
);

/* =====================================================
   6. ADMIN REFUND MANAGEMENT
===================================================== */

// Initiate Cashfree refund.
//
// POST /api/interviews/admin/bookings/:id/refund
router.post(
  "/admin/bookings/:id/refund",
  initiateInterviewRefund
);

// Fetch latest refund status from Cashfree.
//
// GET /api/interviews/admin/bookings/:id/refund
router.get(
  "/admin/bookings/:id/refund",
  syncInterviewRefund
);

/* =====================================================
   EXPORT
===================================================== */

export default router;
