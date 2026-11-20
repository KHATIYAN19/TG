// Usage:
//   node scripts/backfillInvoices.js                 dry run (default): lists what WOULD be created, writes nothing
//   node scripts/backfillInvoices.js --write         actually creates invoices (PDF -> S3 + database)
//   node scripts/backfillInvoices.js --write --limit=50 --from=2026-01-01 --to=2026-06-30
//
// Creates an invoice for every existing PAID, verified order that does not have one, oldest payment first. Orders that already have an invoice are skipped, so it is safe to re-run.
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env") });
import mongoose from "mongoose";

import connectDB from "../utils/dbConnection.js";
import Order from "../models/Order.js";
import Invoice from "../models/Invoice.js";
import { ensureInvoice } from "../services/invoice/service.js";

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const write = process.argv.includes("--write");
const limit = Number(arg("limit")) || 0;
const from = arg("from") && new Date(`${arg("from")}T00:00:00+05:30`);
const to = arg("to") && new Date(`${arg("to")}T23:59:59.999+05:30`);

await connectDB();

const query = { orderStatus: "PAID", "payment.status": "SUCCESS", "verification.amountVerified": true, "payment.paidAt": { $ne: null } };
if (from || to) query["payment.paidAt"] = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };

const have = new Set((await Invoice.find({}, "orderId").lean()).map((i) => i.orderId));
let created = 0;
let skipped = 0;
let failed = 0;
let seen = 0;

console.log(write ? "WRITE mode: invoices will be created." : "DRY RUN: nothing will be written. Add --write to create invoices.");

for await (const order of Order.find(query).sort({ "payment.paidAt": 1 }).select("orderId customer.email payment.paidAt payment.amount").lean().cursor()) {
  if (have.has(order.orderId)) {
    skipped++;
    continue;
  }
  if (limit && seen >= limit) break;
  seen++;
  const when = new Date(order.payment.paidAt).toISOString();
  if (!write) {
    console.log(`  would create: ${order.orderId}  paid ${when}  Rs.${order.payment.amount}  ${order.customer?.email || ""}`);
    continue;
  }
  try {
    const inv = await ensureInvoice(order.orderId, { source: "backfill" });
    if (inv.status === "READY") {
      created++;
      console.log(`  created ${inv.invoiceNumber}  ${order.orderId}`);
    } else {
      failed++;
      console.log(`  saved but PDF pending (will be retried): ${order.orderId}  ${inv.lastError || ""}`);
    }
  } catch (e) {
    failed++;
    console.log(`  FAILED ${order.orderId}: ${e.message}`);
  }
}

console.log(write ? `Done. created ${created}, failed/pending ${failed}, already had invoice ${skipped}.` : `Dry run: ${seen} order(s) need an invoice, ${skipped} already have one.`);
await mongoose.disconnect();
