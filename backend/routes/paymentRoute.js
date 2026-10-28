
import express from "express";

import {
  getBookPayments,
  deleteBookPayment,
  getDailyAdminPayments,
} from "../controllers/paymentController.js";

import {
  auth,
  isAdmin,
} from "../Middleware/auth.js";

const router = express.Router();

/* =====================================================
   ADMIN - DAILY PAYMENTS (ALL BOOKS)
===================================================== */

/**
 * GET - All payments for today (default IST)
 *
 * /daily
 *
 * GET - Payments for a specific date
 *
 * /daily?date=2026-10-28
 *
 * GET - Paginated payments
 *
 * /daily?date=2026-10-28&page=1&limit=20
 *
 * GET - Payments filtered by status
 *
 * /daily?date=2026-10-28&status=SUCCESS
 *
 * Available statuses:
 * SUCCESS
 * FAILED
 * PENDING
 * CANCELLED
 * REFUNDED
 * PARTIALLY_REFUNDED
 */

router.get(
  "/daily",
  auth,
  isAdmin,
  getDailyAdminPayments
);

/* =====================================================
   ADMIN - BOOK SPECIFIC PAYMENTS
===================================================== */

/**
 * GET - All payments for a specific book
 *
 * /:bookId/payments
 */

router.get(
  "/:bookId/payments",
  auth,
  isAdmin,
  getBookPayments
);

/**
 * GET - Paginated payments for a specific book
 *
 * /:bookId/payments/page/:page
 *
 * Example:
 * /68abc123abc123abc123abc1/payments/page/1
 */

router.get(
  "/:bookId/payments/page/:page",
  auth,
  isAdmin,
  getBookPayments
);

/* =====================================================
   ADMIN - DELETE BOOK PAYMENT
===================================================== */

/**
 * DELETE - Delete a specific payment/order
 *
 * /:bookId/payments/:orderId
 */

router.delete(
  "/:bookId/payments/:orderId",
  auth,
  isAdmin,
  deleteBookPayment
);

export default router;
