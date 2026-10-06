import express from "express";

import {
  sendPendingPurchaseMail,
  resendBookAccessMail,
  revokeBookAccess,
  extendBookAccess,
} from "../controllers/orderMailSender.js";

import {
  auth,
  isAdmin,
} from "../Middleware/auth.js";


const router =
  express.Router();


/* =========================================================
   SEND PENDING PURCHASE REMINDER
========================================================= */

router.post(
  "/orders/:orderId/send-pending-mail",
  auth,
  isAdmin,
  sendPendingPurchaseMail
);


/* =========================================================
   RESEND BOOK ACCESS
========================================================= */

router.post(
  "/orders/:orderId/resend-book-access",
  auth,
  isAdmin,
  resendBookAccessMail
);


/* =========================================================
   REVOKE BOOK ACCESS
========================================================= */

router.patch(
  "/orders/:orderId/access/revoke",
  auth,
  isAdmin,
  revokeBookAccess
);


/* =========================================================
   EXTEND / REACTIVATE BOOK ACCESS
========================================================= */

/*
 * Body:
 *
 * {
 *   "hours": 24
 * }
 *
 * New expiry =
 * current time + hours
 */
router.patch(
  "/orders/:orderId/access/extend",
  auth,
  isAdmin,
  extendBookAccess
);


export default router;