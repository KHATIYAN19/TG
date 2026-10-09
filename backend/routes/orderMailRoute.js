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

router.post(
  "/orders/:orderId/send-pending-mail",
  auth,
  isAdmin,
  sendPendingPurchaseMail
);

router.post(
  "/orders/:orderId/resend-book-access",
  auth,
  isAdmin,
  resendBookAccessMail
);

router.patch(
  "/orders/:orderId/access/revoke",
  auth,
  isAdmin,
  revokeBookAccess
);


router.patch(
  "/orders/:orderId/access/extend",
  auth,
  isAdmin,
  extendBookAccess
);


export default router;