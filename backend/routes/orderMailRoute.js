import express from "express";

import sendPendingPurchaseMail from "../controllers/orderMailSender.js";
import {auth,isAdmin} from "../Middleware/auth.js";

const router = express.Router();

// Send pending purchase reminder email
router.post(
  "/orders/:orderId/send-pending-mail",
   auth,
   isAdmin,
  sendPendingPurchaseMail
);

export default router;