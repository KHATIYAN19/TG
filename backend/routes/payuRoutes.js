import express from "express";
import * as PB from "../Middleware/publicBudgets.js";

import {
  createPayUPayment,
  payUSuccess,
  payUFailure,
  getPurchasedBookAccess,
} from "../controllers/payuController.js";

const router = express.Router();

router.post(
  "/create",
  PB.payCreateHourly,
  PB.payCreateDaily,
  createPayUPayment
);

router.post(
  "/success",
  PB.payVerifyHourly,
  payUSuccess
);

router.post(
  "/failure",
  PB.payVerifyHourly,
  payUFailure
);

router.get(
  "/access",
  PB.payStatusTenMin,
  getPurchasedBookAccess
);

export default router;