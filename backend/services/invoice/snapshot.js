import Book from "../../models/Book.js";
import { round2, istYear } from "./format.js";

/*
  The one rule for who gets an invoice: a REAL, verified, paid order. Pending, failed, cancelled, refunded and unverified orders never do,
  and there is no way to hand in your own numbers: every figure below is copied from the stored order.
*/
export const isInvoiceable = (order) =>
  Boolean(
    order &&
      order.orderStatus === "PAID" &&
      order.payment?.status === "SUCCESS" &&
      order.verification?.amountVerified &&
      order.payment?.paidAt &&
      Number(order.payment?.amount) >= 0
  );

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/** Pure: turns the order (plus the titles of bundled books) into the invoice fields that get stored. */
export const buildInvoiceFields = (order, { bundleTitles = [], bundleMrp = 0, config }) => {
  const paidAt = new Date(order.payment.paidAt);
  const isOffer = Boolean(order.offer?.offerId);
  const total = round2(num(order.payment.amount));

  let lines;
  let subtotal;
  let mrpTotal;
  if (isOffer) {
    subtotal = round2(num(order.offer.originalAmount) || num(order.book?.price));
    mrpTotal = round2(Math.max(bundleMrp, subtotal));
    lines = [
      {
        title: order.offer.name || order.book?.title || "Ebook bundle",
        description: bundleTitles.length ? `Includes: ${bundleTitles.join("; ")}` : "",
        quantity: 1,
        mrp: mrpTotal,
        unitPrice: subtotal,
        total: subtotal,
      },
    ];
  } else {
    const unit = round2(num(order.coupon?.originalAmount) || num(order.book?.price));
    subtotal = unit;
    mrpTotal = round2(Math.max(num(order.book?.mrp), unit));
    lines = [{ title: order.book?.title || "Ebook", description: "", quantity: 1, mrp: mrpTotal, unitPrice: unit, total: unit }];
  }

  const offerDiscount = isOffer ? round2(num(order.offer.discountAmount)) : 0;
  const couponDiscount = order.coupon?.applied ? round2(num(order.coupon.discountAmount)) : 0;
  // Anything the stored discounts do not explain (e.g. a rounded-up gateway minimum) is shown as one honest line so the table adds up.
  const gap = round2(subtotal - offerDiscount - couponDiscount - total);
  const otherDiscount = gap > 0.009 ? gap : 0;

  let taxAmount = 0;
  if (config.taxRate > 0) taxAmount = round2(total - total / (1 + config.taxRate / 100)); // total is tax-inclusive

  return {
    orderId: order.orderId,
    orderRef: order._id,
    invoiceDate: paidAt,
    year: istYear(paidAt),
    buyer: { name: order.customer?.name || null, email: order.customer?.email || null, phone: order.customer?.phone || null },
    lines,
    currency: String(order.book?.currency || "INR").toUpperCase(),
    mrpTotal,
    subtotal,
    offerDiscount,
    couponDiscount,
    otherDiscount,
    taxRate: config.taxRate,
    taxAmount,
    total,
    coupon: order.coupon?.applied
      ? { code: order.coupon.code || null, name: order.coupon.name || null, discountType: order.coupon.discountType || null, discountValue: num(order.coupon.discountValue) }
      : { code: null, name: null, discountType: null, discountValue: 0 },
    offerName: isOffer ? order.offer.name || null : null,
    payment: {
      provider: order.payment.provider || null,
      transactionId: order.payment.transactionId || null,
      paymentId: order.payment.paymentId || null,
      method: order.payment.method || null,
      status: "Paid",
      paidAt,
    },
    seller: { ...config.seller },
    taxLine: config.taxLine,
  };
};

/** Titles and combined MRP of the books inside a bundle/offer order (for the line description and the MRP row). */
export const loadBundleInfo = async (order) => {
  if (!order.offer?.offerId || !order.purchasedBookIds?.length) return { titles: [], mrp: 0 };
  const books = await Book.find({ _id: { $in: order.purchasedBookIds } }).select("title mrp price").lean();
  return { titles: books.map((b) => b.title).filter(Boolean), mrp: books.reduce((t, b) => t + num(b.mrp || b.price), 0) };
};
