import express from "express";
import { auth, isAdmin } from "../Middleware/auth.js";
import { getOrderInvoice, createOrderInvoice, adminDownloadInvoice, adminDeleteInvoice, adminEmailInvoice, exportInvoicesCsv } from "../controllers/invoiceController.js";

/* Mounted at /admin/invoices. Admin only. */
const router = express.Router();
router.use(auth, isAdmin);

router.get("/export.csv", exportInvoicesCsv);
router.get("/order/:orderRef", getOrderInvoice);
router.post("/order/:orderRef", createOrderInvoice);
router.get("/:id/download", adminDownloadInvoice);
router.post("/:id/email", adminEmailInvoice);
router.delete("/:id", adminDeleteInvoice);

export default router;
