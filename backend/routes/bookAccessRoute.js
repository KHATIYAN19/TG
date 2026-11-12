import express from "express";
import * as PB from "../Middleware/publicBudgets.js";
import { getPurchasedBookAccess } from "../controllers/books/bookAccessController.js";

const router = express.Router();

// Buyer opens their purchased book with the access token (kept at /payment/payu/access for existing links).
router.get("/access", PB.payStatusTenMin, getPurchasedBookAccess);

export default router;
