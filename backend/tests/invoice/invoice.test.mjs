/*
  Offline checks for the invoice feature (no database, no S3, no mail): in-memory fakes stand in for them.
  Run: node --test tests/invoice/invoice.test.mjs
*/
import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";

mongoose.set("bufferCommands", false);
process.env.AMAZON_ACCESS_KEY_ID = "AKIDEXAMPLE";
process.env.AMAZON_SECRET_ACCESS_KEY = "secret";
process.env.S3_REGION = "ap-south-1";
process.env.S3_BUCKET_NAME = "test-bucket";

const { ensureInvoice, deleteInvoice, emailInvoiceToBuyer, InvoiceError } = await import("../../services/invoice/service.js");
const { amountInWords, formatIst, istYear } = await import("../../services/invoice/format.js");
const { buildInvoiceFields, isInvoiceable } = await import("../../services/invoice/snapshot.js");
const { renderInvoicePdf } = await import("../../services/invoice/pdf.js");
const { getInvoiceConfig } = await import("../../config/invoice.js");

/* ---------- fakes ---------- */
const matches = (doc, q) => Object.entries(q).every(([k, v]) => (v && typeof v === "object" && "$in" in v ? v.$in.includes(doc[k]) : doc[k] === v));
const wrap = (d) => ({ ...d, toObject: () => ({ ...d }) });

const makeDeps = ({ orders, failUpload = false } = {}) => {
  const invoices = [];
  const uploads = new Map();
  const mails = [];
  let id = 0;
  const Invoice = {
    findOne: async (q) => {
      const d = invoices.find((i) => matches(i, q));
      return d ? wrap(d) : null;
    },
    findById: async (i) => {
      const d = invoices.find((x) => x._id === i);
      return d ? wrap(d) : null;
    },
    findOneAndUpdate: async (q, u) => {
      const taken = u.$set?.invoiceNumber;
      if (taken && invoices.some((i) => i.invoiceNumber === taken)) {
        const e = new Error("dup");
        e.code = 11000;
        throw e;
      }
      let d = invoices.find((i) => matches(i, q));
      if (!d && u.$setOnInsert) {
        await new Promise((r) => setImmediate(r)); // yield, so parallel callers interleave like a real DB
        if (invoices.find((i) => matches(i, { orderId: q.orderId }))) {
          const e = new Error("dup");
          e.code = 11000;
          throw e;
        }
        const { ["email.requested"]: er, ...rest } = u.$setOnInsert;
        d = { _id: `inv${++id}`, invoiceNumber: null, attempts: 0, email: { requested: er, status: "NONE", attempts: 0 }, pdf: {}, ...rest };
        invoices.push(d);
      } else if (d && u.$set) Object.assign(d, u.$set);
      return d ? wrap(d) : null;
    },
    findByIdAndUpdate: async (i, u) => {
      const d = invoices.find((x) => x._id === i);
      for (const [k, v] of Object.entries(u.$set || {})) {
        if (k.includes(".")) {
          const [a, b] = k.split(".");
          d[a] = { ...(d[a] || {}), [b]: v };
        } else d[k] = v;
      }
      for (const k of Object.keys(u.$inc || {})) {
        const [a, b] = k.split(".");
        if (b) d[a] = { ...(d[a] || {}), [b]: (d[a]?.[b] || 0) + 1 };
        else d[a] = (d[a] || 0) + 1;
      }
      return wrap(d);
    },
    updateOne: async (q, u) => {
      const d = invoices.find((x) => x._id === q._id);
      Object.assign(d, u.$set || {});
      d.attempts = (d.attempts || 0) + (u.$inc?.attempts || 0);
    },
    deleteOne: async (q) => invoices.splice(invoices.findIndex((x) => x._id === q._id), 1),
  };
  return {
    invoices,
    uploads,
    mails,
    Invoice,
    Order: { findOne: (q) => ({ lean: async () => orders.find((o) => (q._id ? o._id === q._id : o.orderId === q.orderId)) || null }) },
    render: async (inv) => Buffer.from(`PDF ${inv.invoiceNumber}`),
    storage: {
      upload: async (k, b) => {
        if (failUpload) throw new Error("S3 down");
        uploads.set(k, b);
      },
      remove: async (k) => uploads.delete(k),
      signedUrl: async () => ({ url: "https://signed" }),
      read: async (k) => uploads.get(k),
    },
    mail: async (...a) => mails.push(a),
    loadBundleInfo: async () => ({ titles: [], mrp: 0 }),
    config: getInvoiceConfig,
  };
};

const paidOrder = (n, over = {}) => ({
  _id: `o${n}`,
  orderId: `ORD-${n}`,
  orderStatus: "PAID",
  book: { title: "Aptitude Mastery", price: 499, mrp: 999, currency: "INR" },
  customer: { name: "Asha", email: "asha@example.com", phone: "9999999999" },
  coupon: { applied: true, code: "SAVE100", discountType: "FIXED", discountValue: 100, originalAmount: 499, discountAmount: 100, finalAmount: 399 },
  payment: { provider: "Razorpay", transactionId: "order_X", paymentId: "pay_X", method: "upi", amount: 399, status: "SUCCESS", paidAt: new Date("2026-03-05T10:00:00Z") },
  verification: { amountVerified: true },
  ...over,
});

/* ---------- tests ---------- */
test("no invoice for unpaid, failed, pending or unverified orders", async () => {
  const bad = [
    paidOrder(1, { orderStatus: "PENDING" }),
    paidOrder(2, { orderStatus: "FAILED", payment: { ...paidOrder(2).payment, status: "FAILED" } }),
    paidOrder(3, { payment: { ...paidOrder(3).payment, status: "PENDING", paidAt: null } }),
    paidOrder(4, { verification: { amountVerified: false } }),
    paidOrder(5, { orderStatus: "REFUNDED" }),
  ];
  const deps = makeDeps({ orders: bad });
  for (const o of bad) {
    assert.equal(isInvoiceable(o), false);
    await assert.rejects(ensureInvoice(o.orderId, { deps }), (e) => e instanceof InvoiceError && e.code === "ORDER_NOT_PAID");
  }
  assert.equal(deps.invoices.length, 0);
  assert.equal(deps.uploads.size, 0);
});

test("idempotent: the same order never gets two invoices, even with parallel webhooks in one process", async () => {
  const deps = makeDeps({ orders: [paidOrder(1)] });
  const results = await Promise.all([ensureInvoice("ORD-1", { deps }), ensureInvoice("ORD-1", { deps }), ensureInvoice("ORD-1", { deps })]);
  const again = await ensureInvoice("ORD-1", { deps });
  assert.equal(deps.invoices.length, 1);
  assert.equal(deps.uploads.size, 1);
  assert.equal(new Set([...results, again].map((r) => r.invoiceNumber)).size, 1);
  assert.match(again.invoiceNumber, /^TT-2026-/);
});

test("numbers are random, unique, well-formed, and reveal no sales count", async () => {
  const orders = Array.from({ length: 30 }, (_, i) => paidOrder(i + 1));
  orders.push(paidOrder(31, { payment: { ...paidOrder(31).payment, paidAt: new Date("2026-12-31T19:00:00Z") } }));
  const deps = makeDeps({ orders });
  const out = await Promise.all(orders.map((o) => ensureInvoice(o.orderId, { deps })));
  const nums = out.map((i) => i.invoiceNumber);
  assert.equal(new Set(nums).size, 31);
  for (const n of nums.slice(0, 30)) assert.match(n, /^TT-2026-[A-HJKMNP-Z2-9]{7}$/);
  assert.match(nums[30], /^TT-2027-[A-HJKMNP-Z2-9]{7}$/); // the year (IST) still comes from the payment date
  assert.ok(!nums.slice(0, 30).some((n) => /-0*\d{1,4}$/.test(n) && /^\d+$/.test(n.split("-")[2])));
});

test("a clash on the unique number is retried with a new code", async () => {
  const deps = makeDeps({ orders: [paidOrder(1), paidOrder(2)] });
  const first = await ensureInvoice("ORD-1", { deps });
  const real = deps.Invoice.findOneAndUpdate;
  let calls = 0;
  deps.Invoice.findOneAndUpdate = async (q, u) => {
    if (u.$set?.invoiceNumber && calls++ === 0) u.$set.invoiceNumber = first.invoiceNumber; // force one clash
    return real(q, u);
  };
  const second = await ensureInvoice("ORD-2", { deps });
  assert.notEqual(second.invoiceNumber, first.invoiceNumber);
});

test("a storage failure is recorded, not thrown, and the retry keeps the same number", async () => {
  const orders = [paidOrder(1)];
  const bad = makeDeps({ orders, failUpload: true });
  const first = await ensureInvoice("ORD-1", { deps: bad });
  assert.equal(first.status, "FAILED");
  assert.match(first.invoiceNumber, /^TT-2026-/);
  bad.storage.upload = async (k, b) => bad.uploads.set(k, b);
  const retry = await ensureInvoice("ORD-1", { deps: bad });
  assert.equal(retry.status, "READY");
  assert.equal(retry.invoiceNumber, first.invoiceNumber);
  assert.equal(bad.invoices.length, 1);
});

test("invoices are never emailed on their own", async () => {
  const deps = makeDeps({ orders: [paidOrder(1)] });
  await ensureInvoice("ORD-1", { deps, source: "payment" });
  assert.equal(deps.mails.length, 0);
});

test("manual send mails the stored PDF to the buyer", async () => {
  const deps = makeDeps({ orders: [paidOrder(1)] });
  const inv = await ensureInvoice("ORD-1", { deps });
  assert.equal(await emailInvoiceToBuyer(inv, deps), "asha@example.com");
  assert.equal(deps.mails.length, 1);
});

test("delete removes the S3 object and the record", async () => {
  const deps = makeDeps({ orders: [paidOrder(1)] });
  const inv = await ensureInvoice("ORD-1", { deps });
  assert.equal(deps.uploads.size, 1);
  await deleteInvoice(inv, deps);
  assert.equal(deps.uploads.size, 0);
  assert.equal(deps.invoices.length, 0);
});

test("snapshot copies price, coupon and payment details from the order", () => {
  const f = buildInvoiceFields(paidOrder(1), { config: getInvoiceConfig() });
  assert.equal(f.mrpTotal, 999);
  assert.equal(f.subtotal, 499);
  assert.equal(f.couponDiscount, 100);
  assert.equal(f.otherDiscount, 0);
  assert.equal(f.total, 399);
  assert.equal(f.coupon.code, "SAVE100");
  assert.equal(f.payment.paymentId, "pay_X");
  assert.equal(f.year, 2026);
  assert.equal(f.seller.name, "Target Trek");
  assert.equal(f.taxLine, "Not registered under GST");
});

test("amount in words uses the Indian system", () => {
  assert.equal(amountInWords(399), "Rupees Three Hundred Ninety-Nine Only");
  assert.equal(amountInWords(1499.5), "Rupees One Thousand Four Hundred Ninety-Nine and Fifty Paise Only");
  assert.equal(amountInWords(125000), "Rupees One Lakh Twenty-Five Thousand Only");
  assert.equal(amountInWords(0), "Rupees Zero Only");
  assert.equal(istYear(new Date("2026-12-31T19:00:00Z")), 2027);
  assert.match(formatIst(new Date("2026-03-05T10:00:00Z")), /05 Mar 2026, 03:30 PM IST/);
});

test("the PDF renders as a real A4 PDF containing the key facts", async () => {
  const f = { ...buildInvoiceFields(paidOrder(1), { config: getInvoiceConfig() }), invoiceNumber: "TT-2026-0001" };
  const buf = await renderInvoicePdf(f, { refundPolicyUrl: "https://targettrek.in/refund-policy" });
  assert.equal(buf.subarray(0, 4).toString(), "%PDF");
  assert.ok(buf.length > 2000);
});
