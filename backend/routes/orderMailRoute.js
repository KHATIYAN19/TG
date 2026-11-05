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

import {
  promoMailOptions,
  promoMailPreview,
  promoMailSend,
} from "../controllers/promoMailController.js";

import { arenaWriteLimiter } from "../Middleware/rateLimiter.js";


const router =
  express.Router();

router.post(
  "/orders/:orderId/send-pending-mail",
  auth,
  isAdmin,
  sendPendingPurchaseMail
);

/* Promotional "thanks for purchasing + offer" mail (Book Payments page) */
router.get(
  "/promo-mail/options",
  auth,
  isAdmin,
  promoMailOptions
);

router.post(
  "/orders/:orderId/promo-mail/preview",
  auth,
  isAdmin,
  promoMailPreview
);

router.post(
  "/orders/:orderId/promo-mail/send",
  auth,
  isAdmin,
  arenaWriteLimiter,
  promoMailSend
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