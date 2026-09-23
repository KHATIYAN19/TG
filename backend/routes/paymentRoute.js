import express from "express";

import {
  getBookPayments,
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

export default router;