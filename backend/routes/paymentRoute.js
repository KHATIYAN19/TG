import express from "express";

import {
  getBookPayments,
  deleteBookPayment,
} from "../controllers/paymentController.js";

import {
  auth,
  isAdmin,
} from "../Middleware/auth.js";

const router = express.Router();

router.get(
  "/:bookId/payments",
  auth,
  isAdmin,
  getBookPayments
);


router.get(
  "/:bookId/payments/page/:page",
  auth,
  isAdmin,
  getBookPayments
);

router.delete(
  "/:bookId/payments/:orderId",
  auth,
  isAdmin,
  deleteBookPayment
);

export default router;