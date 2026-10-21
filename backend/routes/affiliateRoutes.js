
import express from "express";

import { auth,isAffiliate } from "../Middleware/auth.js";

import {
  getAffiliateDashboard,
  getAffiliateOrders,
} from "../controllers/affiliateDashboardController.js";

const router = express.Router();

/*
  All requests require a valid JWT.

  The controllers independently verify the current
  user's role, account status and affiliate status.
*/

router.use(auth, isAffiliate);

router.get(
  "/dashboard",
  getAffiliateDashboard
);

router.get(
  "/orders",
  getAffiliateOrders
);

export default router;
