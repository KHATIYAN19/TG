
// import express from "express";

// import { auth,isAffiliate ,isAdmin} from "../Middleware/auth.js";

// import {
//   getAffiliateDashboard,
//   getAffiliateOrders,
// } from "../controllers/affiliateDashboardController.js";

// const router = express.Router();

// /*
//   All requests require a valid JWT.

//   The controllers independently verify the current
//   user's role, account status and affiliate status.
// */

// router.use(auth, isAffiliate);

// router.get(
//   "/dashboard",
//   getAffiliateDashboard
// );

// router.get(
//   "/orders",
//   getAffiliateOrders
// );

// export default router;

import express from "express";

import {
  auth,
  isAffiliate,
  isAdmin,
} from "../Middleware/auth.js";

import {
  getAffiliateDashboard,
  getAffiliateOrders,
} from "../controllers/affiliateDashboardController.js";

const router = express.Router();

/* =====================================================
   ADMIN OR AFFILIATE AUTHORIZATION
===================================================== */

const isAdminOrAffiliate = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const role = req.user.role;

  if (role === "admin" || role === "affiliate") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied. Admin or Affiliate only.",
  });
};

/* =====================================================
   MIDDLEWARE

   auth:
   - Validates JWT
   - Validates active session (if implemented)
   - Attaches authenticated user to req.user

   isAdminOrAffiliate:
   - Allows admin and affiliate users

   Controller:
   - Rechecks account and role using MongoDB
===================================================== */

router.use(auth, isAdminOrAffiliate);

/* =====================================================
   AFFILIATE SALES DASHBOARD

   Affiliate:
   GET /api/affiliate/dashboard

   Admin:
   GET /api/affiliate/dashboard?userId=AFFILIATE_USER_ID

   Optional graphDays: 7, 30, 365
===================================================== */

router.get(
  "/dashboard",
  getAffiliateDashboard
);

/* =====================================================
   AFFILIATE TRANSACTIONS

   Affiliate:
   GET /api/affiliate/orders?page=1&limit=15

   Admin:
   GET /api/affiliate/orders?userId=AFFILIATE_USER_ID&page=1&limit=15

   Optional:
   status=ALL|EARNED|FAILED|PENDING|REFUNDED|UNVERIFIED
   startDate=YYYY-MM-DD
   endDate=YYYY-MM-DD
   sort=asc|desc
===================================================== */

router.get(
  "/orders",
  getAffiliateOrders
);

export default router;