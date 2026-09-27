import express from "express";

import {
  sendPendingPurchaseMail,
  resendBookAccessMail,
} from "../controllers/orderMailSender.js";
import {auth,isAdmin} from "../Middleware/auth.js";

const router = express.Router();

// Send pending purchase reminder email
router.post(
  "/orders/:orderId/send-pending-mail",
   auth,
   isAdmin,
  sendPendingPurchaseMail
);

router.post(
  "/orders/:orderId/resend-book-access",
  resendBookAccessMail
);

export default router;