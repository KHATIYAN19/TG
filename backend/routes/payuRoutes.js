import express from "express";

import {
  createPayUPayment,
  payUSuccess,
  payUFailure,
  getPurchasedBookAccess,
} from "../controllers/payuController.js";

const router = express.Router();

router.post(
  "/create",
  createPayUPayment
);

router.post(
  "/success",
  payUSuccess
);

router.post(
  "/failure",
  payUFailure
);

router.get(
  "/access",
  getPurchasedBookAccess
);

export default router;