import express from "express";

import {
  sendPendingPurchaseMail,
  resendBookAccessMail,
  revokeBookAccess,
  extendBookAccess,
  sendEbookPdfs,
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

router.post(
  "/orders/:orderId/send-ebook-pdfs",
  auth,
  isAdmin,
  sendEbookPdfs
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