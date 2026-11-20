import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Order from "../models/Order.js";
import { ensureInvoice, invoiceDownloadUrl, deleteInvoice, emailInvoiceToBuyer, InvoiceError } from "../services/invoice/service.js";
import { hashDownloadToken } from "../utils/payu.js";

const fail = (res, error, fallback) => {
  const known = error instanceof InvoiceError || error?.status;
  if (!known) console.error("[invoice]", error?.message || error);
  return res.status(known ? error.status || 400 : 500).json({ success: false, code: error?.code, message: known ? error.message : fallback });
};

const view = (inv) =>
  inv && {
    id: String(inv._id),
    invoiceNumber: inv.invoiceNumber,
    orderId: inv.orderId,
    status: inv.status,
    total: inv.total,
    invoiceDate: inv.invoiceDate,
    emailStatus: inv.email?.status,
    lastError: inv.status === "FAILED" ? inv.lastError : null,
    hasPdf: Boolean(inv.pdf?.key),
  };

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ------------------------------ admin ------------------------------ */

/** GET /admin/invoices/order/:orderRef  (Order._id) -> the invoice of that order, or null */
export const getOrderInvoice = async (req, res) => {
  try {
    if (!validId(req.params.orderRef)) return res.status(400).json({ success: false, message: "Invalid order." });
    const inv = await Invoice.findOne({ orderRef: req.params.orderRef }).lean();
    return res.json({ success: true, data: view(inv) || null });
  } catch (e) {
    return fail(res, e, "Unable to load the invoice.");
  }
};

/** POST /admin/invoices/order/:orderRef -> create (or return the existing) invoice. Only ever built from the stored, paid order. */
export const createOrderInvoice = async (req, res) => {
  try {
    if (!validId(req.params.orderRef)) return res.status(400).json({ success: false, message: "Invalid order." });
    const order = await Order.findById(req.params.orderRef).select("orderId").lean();
    if (!order) return res.status(404).json({ success: false, message: "Order not found." });
    const inv = await ensureInvoice(order, { source: "admin", createdBy: String(req.user?._id || req.user?.id || "admin") });
    if (inv.status !== "READY") return res.status(502).json({ success: false, data: view(inv), message: "The invoice was saved but the PDF could not be stored yet. It will be retried automatically." });
    return res.status(201).json({ success: true, data: view(inv), message: `Invoice ${inv.invoiceNumber} is ready.` });
  } catch (e) {
    return fail(res, e, "Unable to create the invoice.");
  }
};

/** GET /admin/invoices/:id/download -> { url } short-lived signed link */
export const adminDownloadInvoice = async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid invoice." });
    const inv = await Invoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ success: false, message: "Invoice not found." });
    res.set("Cache-Control", "no-store");
    return res.json({ success: true, data: { url: await invoiceDownloadUrl(inv), invoiceNumber: inv.invoiceNumber } });
  } catch (e) {
    return fail(res, e, "Unable to download the invoice.");
  }
};

/** POST /admin/invoices/:id/email -> sends the PDF to the buyer (manual only) */
export const adminEmailInvoice = async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid invoice." });
    const inv = await Invoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ success: false, message: "Invoice not found." });
    const to = await emailInvoiceToBuyer(inv);
    return res.json({ success: true, message: `Invoice ${inv.invoiceNumber} emailed to ${to}.` });
  } catch (e) {
    return fail(res, e, "Unable to email the invoice.");
  }
};

/** DELETE /admin/invoices/:id -> removes the PDF from S3, then the record */
export const adminDeleteInvoice = async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid invoice." });
    const inv = await Invoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ success: false, message: "Invoice not found." });
    await deleteInvoice(inv);
    console.log(`[invoice] deleted ${inv.invoiceNumber} (order ${inv.orderId}) by ${req.user?._id || "admin"}`);
    return res.json({ success: true, message: `Invoice ${inv.invoiceNumber} deleted from storage.` });
  } catch (e) {
    return fail(res, e, "Unable to delete the invoice. Nothing was removed.");
  }
};

/* A cell that starts with = + - @ would run as a formula in Excel. */
const cell = (v) => {
  let t = v === null || v === undefined ? "" : v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return `"${t.replace(/"/g, '""')}"`;
};

/** GET /admin/invoices/export.csv?from=YYYY-MM-DD&to=YYYY-MM-DD */
export const exportInvoicesCsv = async (req, res) => {
  try {
    const q = {};
    const from = req.query.from && new Date(`${req.query.from}T00:00:00+05:30`);
    const to = req.query.to && new Date(`${req.query.to}T23:59:59.999+05:30`);
    if ((from && isNaN(from)) || (to && isNaN(to))) return res.status(400).json({ success: false, message: "Invalid date." });
    if (from || to) q.invoiceDate = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };

    const head = ["Invoice number", "Invoice date (IST)", "Order ID", "Transaction ID", "Buyer name", "Buyer email", "Buyer phone", "Items", "Subtotal", "Offer discount", "Coupon code", "Coupon discount", "Other discount", "Tax", "Total", "Currency", "Payment provider", "Payment method", "Status", "Email status"];
    const lines = [head.map(cell).join(",")];
    const ist = (d) => new Date(d).toLocaleString("en-GB", { timeZone: "Asia/Kolkata", hour12: false });
    for await (const i of Invoice.find(q).sort({ invoiceDate: 1 }).lean().cursor()) {
      lines.push(
        [i.invoiceNumber, ist(i.invoiceDate), i.orderId, i.payment?.paymentId || i.payment?.transactionId, i.buyer?.name, i.buyer?.email, i.buyer?.phone, i.lines.map((l) => l.title).join("; "), i.subtotal, i.offerDiscount, i.coupon?.code, i.couponDiscount, i.otherDiscount, i.taxAmount, i.total, i.currency, i.payment?.provider, i.payment?.method, i.status, i.email?.status]
          .map(cell)
          .join(",")
      );
    }
    res.set({ "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="invoices-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" });
    return res.send(`﻿${lines.join("\r\n")}\r\n`);
  } catch (e) {
    return fail(res, e, "Unable to export invoices.");
  }
};

/* ------------------------------ buyer ------------------------------ */

/**
 * GET /payment/books/invoice?token=...   The buyer proves ownership with the same private access token as their book page.
 * Returns { url } (a 2-minute signed link). The invoice is only ever looked up through THAT order, so nobody can reach another
 * customer's invoice.
 */
export const buyerInvoice = async (req, res) => {
  try {
    const token = typeof req.query.token === "string" ? req.query.token.trim() : "";
    if (!token) return res.status(400).json({ success: false, message: "Access token is required." });
    const order = await Order.findOne({
      "access.tokenHash": hashDownloadToken(token),
      orderStatus: "PAID",
      "payment.status": "SUCCESS",
      "verification.amountVerified": true,
      "access.revoked": false,
      "access.expiresAt": { $gt: new Date() },
    })
      .select("orderId")
      .lean();
    if (!order) return res.status(403).json({ success: false, message: "Access link is invalid or expired." });

    // Invoices are never created on the buyer's request: only an existing, finished one is served.
    const inv = await Invoice.findOne({ orderId: order.orderId });
    res.set("Cache-Control", "no-store");
    if (!inv || inv.status !== "READY") return res.status(404).json({ success: false, message: "Your invoice is not available yet. Please contact support and we will send it to you." });
    return res.json({ success: true, data: { status: "ready", invoiceNumber: inv.invoiceNumber, url: await invoiceDownloadUrl(inv) } });
  } catch (e) {
    return fail(res, e, "Unable to load your invoice right now.");
  }
};
