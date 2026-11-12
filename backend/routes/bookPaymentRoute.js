import express from "express";
import * as PB from "../Middleware/publicBudgets.js";
import { createBookPayment, verifyBookPayment, bookPaymentReturn, bookPaymentStatus } from "../controllers/books/bookPaymentController.js";

/* Mounted at /payment/books. The webhook (raw body) is mounted separately in index.js, above express.json(). */
const router = express.Router();

router.post("/create", PB.payCreateHourly, PB.payCreateDaily, createBookPayment);
router.post("/verify", PB.payVerifyHourly, verifyBookPayment);
router.all("/return", PB.payVerifyHourly, bookPaymentReturn); // Cashfree redirects with GET, PayU with POST
router.get("/status/:orderId", PB.payStatusTenMin, bookPaymentStatus);

export default router;
