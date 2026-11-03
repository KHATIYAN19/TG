import express from "express";
import * as PB from "../Middleware/publicBudgets.js";
import {
    createCashfreePayment,
    cashfreeReturn,
    cashfreeWebhook,
    getCashfreePaymentStatus
} from "../controllers/cashfreeController.js";

const router = express.Router();

router.post(
    "/create",
    PB.payCreateHourly,
    PB.payCreateDaily,
    createCashfreePayment
);

router.get(
    "/return",
    PB.payVerifyHourly,
    cashfreeReturn
);

router.post(
    "/webhook",
    cashfreeWebhook
);

router.get(
    "/status/:orderId",
    PB.payStatusTenMin,
    getCashfreePaymentStatus
);

export default router;