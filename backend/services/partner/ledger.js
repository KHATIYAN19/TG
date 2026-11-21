import Order from "../../models/Order.js";
import ArenaEntry from "../../models/arena/ArenaEntry.js";
import MemoryOrder from "../../models/memory/MemoryOrder.js";
import MemoryReferral from "../../models/memory/MemoryReferral.js";
import ResumePurchase from "../../models/resume/ResumePurchase.js";
import ReferralOrder from "../../models/referral/ReferralOrder.js";
import ReferralSubCharge from "../../models/referral/ReferralSubCharge.js";
import ReferralSubscription from "../../models/referral/ReferralSubscription.js";

import mongoose from "mongoose";

import { enabledProducts, KNOWN_GATEWAYS, PAID_STATUSES } from "./permissions.js";

/*
  PARTNER LEDGER
  Every paid order of every product, read into ONE row shape so the partner screens need one query:

    { product, at, ref, txnId, gateway, item, amount, listPrice, discount, coupon, referralCode, referralAmount, refunded, status }

  Money is in paise (integers) for every product (books store rupees: converted here).
  status: "paid" | "partial_refund" | "refunded" | "pending" | "failed"

  PRIVACY: each source's $project names the ONLY fields that leave the database. No customer name, email,
  phone, user id, IP or raw gateway payload is ever projected, so nothing downstream can leak them.
  The controller then strips the columns this partner may not see (see shapeRow).
*/

const TZ = "Asia/Kolkata";
export const ROW_STATUSES = ["paid", "partial_refund", "refunded", "pending", "failed"];

const paise = (rupeesPath) => ({ $round: [{ $multiply: [{ $ifNull: [rupeesPath, 0] }, 100] }, 0] });
const str = (path) => ({ $cond: [{ $gt: [{ $strLenCP: { $ifNull: [path, ""] } }, 0] }, path, null] });
const lower = (path) => ({ $cond: [{ $gt: [{ $strLenCP: { $ifNull: [path, ""] } }, 0] }, { $toLower: path }, null] });
const upper = (path) => ({ $cond: [{ $gt: [{ $strLenCP: { $ifNull: [path, ""] } }, 0] }, { $toUpper: path }, null] });

/* Rough pre-filter on the indexed createdAt so a date-bounded query never scans a whole collection.
   A payment can land a little after its order was created, hence the slack. */
const SLACK_MS = 3 * 86400000;
const createdWindow = (from, to) => {
  const w = {};
  if (from) w.$gte = new Date(from.getTime() - SLACK_MS);
  if (to) w.$lt = to;
  return Object.keys(w).length ? { createdAt: w } : {};
};

/* ------------------------------------------------------------ one pipeline per product */
const SOURCES = {
  books: {
    model: Order,
    pipeline: ({ unpaid, from, to, books }) => [
      ...(books ? [{ $match: { $or: [{ bookId: { $in: books } }, { purchasedBookIds: { $in: books } }] } }] : []),
      { $match: { ...createdWindow(from, to), orderStatus: { $in: unpaid ? ["PAID", "REFUNDED", "PARTIALLY_REFUNDED", "PENDING", "FAILED", "CANCELLED"] : ["PAID", "REFUNDED", "PARTIALLY_REFUNDED"] } } },
      {
        $project: {
          _id: 0,
          product: { $literal: "books" },
          at: { $ifNull: ["$payment.paidAt", "$createdAt"] },
          ref: str("$orderId"),
          txnId: { $ifNull: [str("$payment.transactionId"), str("$payment.paymentId")] },
          gateway: lower("$payment.provider"),
          item: { $ifNull: [str("$offer.name"), { $ifNull: ["$book.title", "Book"] }] },
          amount: paise("$payment.amount"),
          discount: { $add: [paise({ $cond: ["$coupon.applied", "$coupon.discountAmount", 0] }), paise("$offer.discountAmount")] },
          coupon: { $cond: ["$coupon.applied", upper("$coupon.code"), null] },
          // "tt" marks a direct Target Trek sale, not a referral
          referralCode: { $cond: [{ $in: [{ $toLower: { $ifNull: ["$payment.affiliateCode", ""] } }, ["", "tt"]] }, null, upper("$payment.affiliateCode")] },
          referralAmount: { $cond: [{ $ifNull: ["$payment.affiliateUserId", false] }, paise("$payment.affiliateAmount"), 0] },
          refunded: paise("$refund.refundedAmount"),
          status: {
            $switch: {
              branches: [
                { case: { $eq: ["$orderStatus", "PAID"] }, then: "paid" },
                { case: { $eq: ["$orderStatus", "REFUNDED"] }, then: "refunded" },
                { case: { $eq: ["$orderStatus", "PARTIALLY_REFUNDED"] }, then: "partial_refund" },
                { case: { $eq: ["$orderStatus", "PENDING"] }, then: "pending" },
              ],
              default: "failed",
            },
          },
        },
      },
    ],
  },

  prepBuddy: {
    model: ArenaEntry,
    pipeline: ({ unpaid, from, to }) => [
      {
        $match: {
          ...createdWindow(from, to),
          complimentary: { $ne: true },
          "payment.gateway": { $nin: ["admin", "pass"] },
          status: { $in: unpaid ? ["paid", "in_match", "consumed", "cancelling", "cancelled", "pending_payment", "expired"] : ["paid", "in_match", "consumed", "cancelling", "cancelled"] },
        },
      },
      { $addFields: { _ref: { $add: [{ $ifNull: ["$refundedPaise", 0] }, { $ifNull: ["$cancel.refundPaise", 0] }] } } },
      {
        $project: {
          _id: 0,
          product: { $literal: "prepBuddy" },
          at: { $ifNull: ["$paidAt", "$createdAt"] },
          ref: str("$payment.orderId"),
          txnId: str("$payment.paymentId"),
          gateway: lower("$payment.gateway"),
          item: { $literal: "Prep Buddy entry" },
          amount: { $ifNull: ["$paidPaise", 0] },
          discount: { $ifNull: ["$discountPaise", 0] },
          coupon: upper("$coupon.code"),
          referralCode: upper("$affiliate.code"),
          // commission shrinks with refunds, the same way services/arena/affiliate.js reads it
          referralAmount: {
            $let: {
              vars: { c: { $ifNull: ["$affiliate.commissionPaise", 0] }, p: { $ifNull: ["$paidPaise", 0] } },
              in: { $cond: [{ $gt: ["$$p", 0] }, { $round: [{ $multiply: ["$$c", { $max: [0, { $subtract: [1, { $divide: ["$_ref", "$$p"] }] }] }] }, 0] }, 0] },
            },
          },
          refunded: "$_ref",
          status: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "pending_payment"] }, then: "pending" },
                { case: { $eq: ["$status", "expired"] }, then: "failed" },
                { case: { $and: [{ $gt: ["$_ref", 0] }, { $gte: ["$_ref", "$paidPaise"] }] }, then: "refunded" },
                { case: { $gt: ["$_ref", 0] }, then: "partial_refund" },
              ],
              default: "paid",
            },
          },
        },
      },
    ],
  },

  memories: {
    model: MemoryOrder,
    pipeline: ({ unpaid, from, to }) => [
      { $match: { ...createdWindow(from, to), status: { $in: unpaid ? ["paid", "created", "failed"] : ["paid"] } } },
      { $lookup: { from: MemoryReferral.collection.name, localField: "_id", foreignField: "qualifyingOrder", as: "_r" } },
      {
        $project: {
          _id: 0,
          product: { $literal: "memories" },
          at: { $ifNull: ["$paidAt", "$createdAt"] },
          ref: str("$gatewayOrderId"),
          txnId: str("$gatewayPaymentId"),
          gateway: lower("$gateway"),
          item: { $switch: { branches: [{ case: { $eq: ["$kind", "addon"] }, then: "Memory add-ons" }, { case: { $eq: ["$kind", "upgrade"] }, then: "Memory upgrade" }], default: "Memory page" } },
          amount: { $ifNull: ["$amount", 0] },
          discount: { $literal: 0 },
          coupon: { $literal: null },
          referralCode: upper({ $first: "$_r.code" }),
          referralAmount: { $literal: 0 },
          refunded: { $literal: 0 },
          status: { $switch: { branches: [{ case: { $eq: ["$status", "paid"] }, then: "paid" }, { case: { $eq: ["$status", "created"] }, then: "pending" }], default: "failed" } },
        },
      },
    ],
  },

  resume: {
    model: ResumePurchase,
    pipeline: ({ unpaid, from, to }) => [
      { $match: { ...createdWindow(from, to), grantedBy: null, "payment.gateway": { $nin: ["admin", ""] }, "payment.status": { $in: unpaid ? ["paid", "created", "failed"] : ["paid"] } } },
      {
        $project: {
          _id: 0,
          product: { $literal: "resume" },
          at: { $ifNull: ["$payment.paidAt", "$createdAt"] },
          ref: str("$payment.gatewayOrderId"),
          txnId: str("$payment.gatewayPaymentId"),
          gateway: lower("$payment.gateway"),
          item: { $ifNull: [str("$packageSnapshot.name"), "Resume plan"] },
          amount: { $ifNull: ["$payment.amount", 0] },
          discount: { $max: [0, { $subtract: [{ $ifNull: ["$packageSnapshot.pricePaise", 0] }, { $ifNull: ["$payment.amount", 0] }] }] },
          coupon: { $literal: null },
          referralCode: { $literal: null },
          referralAmount: { $literal: 0 },
          refunded: { $literal: 0 },
          status: { $switch: { branches: [{ case: { $eq: ["$payment.status", "paid"] }, then: "paid" }, { case: { $eq: ["$payment.status", "created"] }, then: "pending" }], default: "failed" } },
        },
      },
    ],
  },

  referral: {
    model: ReferralOrder,
    pipeline: ({ unpaid, from, to }) => [
      { $match: { ...createdWindow(from, to), kind: { $ne: "grant" }, "payment.gateway": { $nin: ["admin", ""] }, "payment.status": { $in: unpaid ? ["paid", "created", "failed"] : ["paid"] } } },
      {
        $project: {
          _id: 0,
          product: { $literal: "referral" },
          at: { $ifNull: ["$payment.paidAt", "$createdAt"] },
          ref: str("$payment.gatewayOrderId"),
          txnId: str("$payment.gatewayPaymentId"),
          gateway: lower("$payment.gateway"),
          item: { $ifNull: [str("$title"), { $switch: { branches: [{ case: { $eq: ["$kind", "unlock"] }, then: "Chat unlock" }, { case: { $eq: ["$kind", "priority"] }, then: "Priority pass" }], default: "Unlock plan" } }] },
          amount: { $ifNull: ["$payment.amount", 0] },
          discount: { $literal: 0 },
          coupon: { $literal: null },
          referralCode: { $literal: null },
          referralAmount: { $literal: 0 },
          refunded: { $literal: 0 },
          status: { $switch: { branches: [{ case: { $eq: ["$payment.status", "paid"] }, then: "paid" }, { case: { $eq: ["$payment.status", "created"] }, then: "pending" }], default: "failed" } },
        },
      },
      // subscription charges (first payment + renewals) belong to Referrals too
      {
        $unionWith: {
          coll: ReferralSubCharge.collection.name,
          pipeline: [
            { $match: { ...(from || to ? { at: { ...(from ? { $gte: new Date(from.getTime() - SLACK_MS) } : {}), ...(to ? { $lt: to } : {}) } } : {}), status: { $in: unpaid ? ["paid", "refunded", "failed"] : ["paid", "refunded"] } } },
            { $lookup: { from: ReferralSubscription.collection.name, localField: "subscription", foreignField: "_id", as: "_s" } },
            {
              $project: {
                _id: 0,
                product: { $literal: "referral" },
                at: { $ifNull: ["$at", "$createdAt"] },
                ref: str("$gatewayInvoiceId"),
                txnId: str("$gatewayPaymentId"),
                gateway: lower({ $first: "$_s.gateway" }),
                item: { $concat: [{ $ifNull: [str({ $first: "$_s.planName" }), "Subscription"] }, { $cond: [{ $eq: ["$kind", "initial"] }, "", " · renewal"] }] },
                amount: { $ifNull: ["$amountPaise", 0] },
                discount: { $literal: 0 },
                coupon: { $literal: null },
                referralCode: { $literal: null },
                referralAmount: { $literal: 0 },
                refunded: { $cond: [{ $eq: ["$status", "refunded"] }, { $ifNull: ["$amountPaise", 0] }, 0] },
                status: { $switch: { branches: [{ case: { $eq: ["$status", "paid"] }, then: "paid" }, { case: { $eq: ["$status", "refunded"] }, then: "refunded" }], default: "failed" } },
              },
            },
          ],
        },
      },
    ],
  },
};

/* ------------------------------------------------------------ query building */
const escapeRegex = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/*
  One aggregation over every product this partner may see.
    perms     effective permissions (products + row rules: statuses, gateways, amounts, codes, books)
    from, to  date bounds already clamped by the controller (to is exclusive)
    status    one status the viewer picked (must be inside perms' statuses)
    paidOnly  totals and charts: only paid / refunded rows, never pending or failed
    product, search, code, searchable   the viewer's own filters
  Returns [base model, pipeline] or null when nothing can match.
*/
const unionPipeline = ({ perms, scope, product, from, to, status, search, code, searchable = [], paidOnly = false }) => {
  const keys = (product ? enabledProducts(perms).filter((k) => k === product) : enabledProducts(perms)).filter((k) => SOURCES[k]);
  if (!keys.length) return null;

  let statuses = scope.statuses;
  if (paidOnly) statuses = statuses.filter((x) => PAID_STATUSES.includes(x));
  if (status) statuses = statuses.filter((x) => x === status);
  if (!statuses.length) return null;
  if (scope.gateways && !scope.gateways.length) return null;

  const unpaid = statuses.some((x) => !PAID_STATUSES.includes(x));
  const books = scope.books ? scope.books.map((id) => new mongoose.Types.ObjectId(id)) : null;
  const ctx = { unpaid, from, to, books };
  const [first, ...rest] = keys;
  const pipeline = [...SOURCES[first].pipeline(ctx)];
  for (const k of rest) pipeline.push({ $unionWith: { coll: SOURCES[k].model.collection.name, pipeline: SOURCES[k].pipeline(ctx) } });

  const and = [{ status: { $in: statuses } }];
  if (from || to) and.push({ at: { ...(from ? { $gte: from } : {}), ...(to ? { $lt: to } : {}) } });
  if (scope.gateways) {
    const named = scope.gateways.filter((g) => g !== "other");
    const or = [];
    if (named.length) or.push({ gateway: { $in: named } });
    if (scope.gateways.includes("other")) or.push({ gateway: { $nin: KNOWN_GATEWAYS } });
    and.push({ $or: or });
  }
  // hidden by an admin: matched against both the gateway transaction id and our order id
  if (scope.hidden?.length) and.push({ txnId: { $nin: scope.hidden } }, { ref: { $nin: scope.hidden } });
  if (Number.isFinite(scope.minAmount)) and.push({ amount: { $gte: scope.minAmount } });
  if (Number.isFinite(scope.maxAmount)) and.push({ amount: { $lte: scope.maxAmount } });
  // book restriction only narrows Books; other products are untouched
  if (scope.codes) and.push({ $or: [{ coupon: { $in: scope.codes } }, { referralCode: { $in: scope.codes } }] });
  if (code) and.push({ $or: [{ coupon: code }, { referralCode: code }] });
  if (search && searchable.length) {
    const rx = { $regex: escapeRegex(search), $options: "i" };
    and.push({ $or: searchable.map((f) => ({ [f]: rx })) });
  }
  pipeline.push({ $match: { $and: and } });
  return [SOURCES[first].model, pipeline];
};

const run = (built, tail) => built[0].aggregate([...built[1], ...tail]).allowDiskUse(true);

/* ------------------------------------------------------------ reads */
export const listRows = async ({ page = 1, limit = 25, ...q }) => {
  const built = unionPipeline(q);
  if (!built) return { rows: [], total: 0 };
  const [res] = await run(built, [
    { $sort: { at: -1, ref: -1 } },
    { $facet: { rows: [{ $skip: (page - 1) * limit }, { $limit: limit }], total: [{ $count: "n" }] } },
  ]);
  return { rows: res?.rows || [], total: res?.total?.[0]?.n || 0 };
};

/* Every row of a range, for CSV. Hard cap so one export can't exhaust memory. */
export const EXPORT_CAP = 20000;
export const exportRows = async (q) => {
  const built = unionPipeline(q);
  if (!built) return [];
  return run(built, [{ $sort: { at: -1, ref: -1 } }, { $limit: EXPORT_CAP }]);
};

/* Totals, product split, day series and top codes, in one round trip. Paid rows only. */
export const summarize = async (q) => {
  const built = unionPipeline({ ...q, paidOnly: true, status: null, search: "", code: null });
  if (!built) return null;
  const sumOf = (f) => ({ $sum: `$${f}` });
  const [res] = await run(built, [
    {
      $facet: {
        totals: [{
          $group: {
            _id: null, count: { $sum: 1 }, amount: sumOf("amount"), refunded: sumOf("refunded"), discount: sumOf("discount"), referralAmount: sumOf("referralAmount"),
            couponUses: { $sum: { $cond: [{ $ne: ["$coupon", null] }, 1, 0] } },
            referralUses: { $sum: { $cond: [{ $ne: ["$referralCode", null] }, 1, 0] } },
            refunds: { $sum: { $cond: [{ $gt: ["$refunded", 0] }, 1, 0] } },
          },
        }],
        byProduct: [{ $group: { _id: "$product", count: { $sum: 1 }, amount: sumOf("amount"), refunded: sumOf("refunded") } }],
        series: [
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$at", timezone: TZ } }, count: { $sum: 1 }, amount: sumOf("amount"), refunded: sumOf("refunded") } },
          { $sort: { _id: 1 } },
        ],
        coupons: [
          { $match: { coupon: { $ne: null } } },
          { $group: { _id: "$coupon", count: { $sum: 1 }, amount: sumOf("amount"), discount: sumOf("discount") } },
          { $sort: { count: -1, amount: -1 } }, { $limit: 12 },
        ],
        referrals: [
          { $match: { referralCode: { $ne: null } } },
          { $group: { _id: "$referralCode", count: { $sum: 1 }, amount: sumOf("amount"), referralAmount: sumOf("referralAmount") } },
          { $sort: { count: -1, amount: -1 } }, { $limit: 12 },
        ],
        gateways: [{ $group: { _id: { $ifNull: ["$gateway", "other"] }, count: { $sum: 1 }, amount: sumOf("amount") } }, { $sort: { amount: -1 } }],
      },
    },
  ]);
  return res;
};

/* Just the paid total of a range (for "vs previous period"). */
export const totalOf = async (q) => {
  const built = unionPipeline({ ...q, paidOnly: true, status: null, search: "", code: null });
  if (!built) return { count: 0, amount: 0, refunded: 0 };
  const [res] = await run(built, [{ $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amount" }, refunded: { $sum: "$refunded" } } }]);
  return res || { count: 0, amount: 0, refunded: 0 };
};
