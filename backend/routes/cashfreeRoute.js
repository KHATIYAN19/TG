import express from "express";
import {
    createCashfreePayment,
    cashfreeReturn,
    cashfreeWebhook,
    getCashfreePaymentStatus
} from "../controllers/cashfreeController.js";

const router = express.Router();

router.post(
    "/create",
    createCashfreePayment
);

router.get(
    "/return",
    cashfreeReturn
);

router.post(
    "/webhook",
    cashfreeWebhook
);

router.get(
    "/status/:orderId",
    getCashfreePaymentStatus
);

export default router;