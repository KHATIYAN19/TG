import Order from "../../models/Order.js";
import crypto from "node:crypto";
import InvoiceModel from "../../models/Invoice.js";
import { getInvoiceConfig } from "../../config/invoice.js";
import { buildInvoiceFields, isInvoiceable, loadBundleInfo } from "./snapshot.js";
import { renderInvoicePdf } from "./pdf.js";
import { s3Config, uploadBuffer, deleteObject, createDownloadUrl, getObjectBuffer } from "../storage/s3.js";
import sendMail from "../../utils/MailSender.js";

export class InvoiceError extends Error {
  constructor(message, status = 400, code = "INVOICE_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/* Real dependencies by default; the tests pass in-memory fakes. */
const realDeps = () => ({
  Invoice: InvoiceModel,
  Order,
  render: renderInvoicePdf,
  storage: { upload: uploadBuffer, remove: deleteObject, signedUrl: createDownloadUrl, read: getObjectBuffer },
  mail: sendMail,
  loadBundleInfo,
  config: getInvoiceConfig,
});

const MAX_ATTEMPTS = 8;
const errText = (e) => String(e?.message || e || "error").slice(0, 300);
const isDup = (e) => e?.code === 11000;
const esc = (v) => String(v ?? "").replace(/[<>&"]/g, "");

/* Random, unguessable numbers on purpose: a running counter (…-0042) would tell anyone holding an invoice how many sales were made.
   No 0/O/1/I/L so a number read out over the phone is never ambiguous. */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const formatInvoiceNumber = (prefix, year, code) => `${prefix}-${year}-${code}`;
export const randomCode = (len = 7) => Array.from(crypto.randomBytes(len), (b) => ALPHABET[b % ALPHABET.length]).join("");

/** S3 key. The file is only ever served through a short-lived signed URL, never a public link. */
export const invoiceKey = (inv) => {
  const prefix = s3Config().keyPrefix;
  return `${prefix ? `${prefix}/` : ""}invoices/${inv.year}/${inv.invoiceNumber}.pdf`;
};

/* Single-flight per order inside this process (a webhook and a browser verify landing together). Across processes the unique index on
   orderId decides the winner. */
const inflight = new Map();

/** Gives a claimed invoice its random number. The unique index rejects a clash, in which case a new code is drawn. */
const assignNumber = async (doc, { Invoice }, prefix) => {
  if (doc.invoiceNumber) return doc;
  for (let i = 0; i < 8; i++) {
    try {
      const updated = await Invoice.findOneAndUpdate({ _id: doc._id, invoiceNumber: null }, { $set: { invoiceNumber: formatInvoiceNumber(prefix, doc.year, randomCode()) } }, { new: true });
      return updated || (await Invoice.findById(doc._id)); // somebody else numbered it first: use theirs
    } catch (e) {
      if (!isDup(e)) throw e;
    }
  }
  throw new InvoiceError("Could not allocate an invoice number.", 500, "NUMBER_FAILED");
};

const mailHtml = (inv, cfg) => `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111827">
  <h2 style="color:#1e3a5f;margin:0 0 12px">Your invoice from ${esc(cfg.seller.name)}</h2>
  <p>Hi ${esc(inv.buyer?.name || "there")},</p>
  <p>Thank you for your purchase. Your invoice <b>${esc(inv.invoiceNumber)}</b> for order <b>${esc(inv.orderId)}</b> is attached as a PDF.</p>
  <p style="color:#6b7280;font-size:13px">Need help? Reply to this email or write to ${esc(cfg.seller.email)}.</p>
</div>`;

/** Admin-triggered only: mails the stored PDF to the buyer. Nothing in the system calls this automatically. */
export const emailInvoiceToBuyer = async (inv, deps = realDeps()) => {
  const cfg = deps.config();
  if (inv.status !== "READY" || !inv.pdf?.key) throw new InvoiceError("The invoice PDF is not ready yet.", 409, "NOT_READY");
  if (!inv.buyer?.email) throw new InvoiceError("This order has no buyer email.", 400, "NO_EMAIL");
  const buffer = await deps.storage.read(inv.pdf.key);
  try {
    await deps.mail(
      inv.buyer.email,
      `Your Target Trek invoice ${inv.invoiceNumber}`,
      `Thank you for your purchase. Your invoice ${inv.invoiceNumber} for order ${inv.orderId} is attached.`,
      mailHtml(inv, cfg),
      { attachments: [{ filename: `${inv.invoiceNumber}.pdf`, content: buffer, contentType: "application/pdf" }], replyTo: cfg.seller.email, sync: true }
    );
  } catch (e) {
    await deps.Invoice.findByIdAndUpdate(inv._id, { $set: { "email.status": "FAILED", "email.lastError": errText(e) }, $inc: { "email.attempts": 1 } });
    throw new InvoiceError("The email could not be sent. Please try again.", 502, "EMAIL_FAILED");
  }
  await deps.Invoice.findByIdAndUpdate(inv._id, { $set: { "email.status": "SENT", "email.sentAt": new Date(), "email.lastError": null }, $inc: { "email.attempts": 1 } });
  return inv.buyer.email;
};

/** Renders and stores the PDF for an already-numbered invoice. Never throws: failures are recorded and retried by the sweeper. */
const finish = async (doc, deps) => {
  const cfg = deps.config();
  try {
    await deps.Invoice.updateOne({ _id: doc._id }, { $set: { lastAttemptAt: new Date() }, $inc: { attempts: 1 } });
    const buffer = await deps.render(doc.toObject ? doc.toObject() : doc, { refundPolicyUrl: cfg.refundPolicyUrl });
    const key = invoiceKey(doc);
    await deps.storage.upload(key, buffer, "application/pdf");
    const ready = await deps.Invoice.findByIdAndUpdate(
      doc._id,
      { $set: { status: "READY", lastError: null, "pdf.key": key, "pdf.size": buffer.length, "pdf.generatedAt": new Date() } },
      { new: true }
    );
    return ready;
  } catch (e) {
    console.error("[invoice] generation failed:", doc.invoiceNumber, errText(e));
    return await deps.Invoice.findByIdAndUpdate(doc._id, { $set: { status: "FAILED", lastError: errText(e) } }, { new: true });
  }
};

const run = async (orderOrId, { source = "payment", createdBy = null, deps }) => {
  const ref = typeof orderOrId === "object" && orderOrId ? { _id: orderOrId._id } : { orderId: String(orderOrId) };
  // Always judge the stored order, never what the caller says about it.
  const order = await deps.Order.findOne(ref).lean();
  if (!order) throw new InvoiceError("Order not found.", 404, "ORDER_NOT_FOUND");
  if (!isInvoiceable(order)) throw new InvoiceError("An invoice can only be created for a paid, verified order.", 409, "ORDER_NOT_PAID");

  let doc = await deps.Invoice.findOne({ orderId: order.orderId });
  if (doc?.status === "READY") return doc;

  const cfg = deps.config();
  if (!doc) {
    const bundle = await deps.loadBundleInfo(order);
    const fields = buildInvoiceFields(order, { bundleTitles: bundle.titles, bundleMrp: bundle.mrp, config: cfg });
    try {
      doc = await deps.Invoice.findOneAndUpdate(
        { orderId: order.orderId },
        { $setOnInsert: { ...fields, status: "PENDING", source, createdBy } },
        { upsert: true, new: true }
      );
    } catch (e) {
      if (!isDup(e)) throw e;
      doc = await deps.Invoice.findOne({ orderId: order.orderId }); // a parallel request claimed it first
    }
  }
  if (doc.status === "READY") return doc;

  doc = await assignNumber(doc, deps, cfg.prefix);
  return finish(doc, deps);
};

/**
 * Creates the invoice for a paid order, or returns the one that already exists. Idempotent and race-safe.
 * Throws InvoiceError("ORDER_NOT_PAID") for anything that is not a verified paid order.
 */
export const ensureInvoice = (orderOrId, opts = {}) => {
  const deps = opts.deps || realDeps();
  const key = String(typeof orderOrId === "object" && orderOrId ? orderOrId.orderId : orderOrId);
  if (inflight.has(key)) return inflight.get(key);
  const p = run(orderOrId, { ...opts, deps }).finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
};

/** Called from the payment-success path. Never awaited by the caller and never throws: the checkout must not depend on it. */
export const scheduleInvoice = (order) => {
  if (!getInvoiceConfig().autoGenerate) return; // SEND_BOOKS_BILL is not "true": invoices are made by hand
  setImmediate(() => {
    ensureInvoice(order, { source: "payment" }).catch((e) => console.error("[invoice] schedule failed:", order?.orderId, errText(e)));
  });
};

/** Short-lived signed link, served as an attachment. `sensitive` keeps shared caches from storing it. */
export const invoiceDownloadUrl = async (inv, deps = realDeps()) => {
  if (inv.status !== "READY" || !inv.pdf?.key) throw new InvoiceError("The invoice PDF is not ready yet.", 409, "NOT_READY");
  const { url } = await deps.storage.signedUrl(inv.pdf.key, { filename: `${inv.invoiceNumber}.pdf`, ttl: 120, sensitive: true });
  return url;
};

/** Removes the PDF from S3 and then the record. If S3 refuses, the record stays so nothing is orphaned. */
export const deleteInvoice = async (inv, deps = realDeps()) => {
  if (inv.pdf?.key) await deps.storage.remove(inv.pdf.key);
  await deps.Invoice.deleteOne({ _id: inv._id });
};

/** Retries invoices that failed (or were interrupted). Runs every few minutes. */
export const sweepInvoices = async (deps = realDeps()) => {
  const cutoff = new Date(Date.now() - 2 * 60 * 1000);
  const stuck = await deps.Invoice.find({ status: { $in: ["PENDING", "FAILED"] }, attempts: { $lt: MAX_ATTEMPTS }, $or: [{ lastAttemptAt: null }, { lastAttemptAt: { $lt: cutoff } }] })
    .sort({ invoiceDate: 1 })
    .limit(25);
  for (const doc of stuck) {
    try {
      await ensureInvoice(doc.orderId, { source: doc.source, createdBy: doc.createdBy, deps });
    } catch (e) {
      console.error("[invoice] sweep failed:", doc.orderId, errText(e));
    }
  }
};

export const startInvoiceSweeper = () => {
  setTimeout(() => sweepInvoices().catch(() => {}), 60 * 1000).unref();
  setInterval(() => sweepInvoices().catch((e) => console.error("[invoice] sweep error:", errText(e))), 5 * 60 * 1000).unref();
};
