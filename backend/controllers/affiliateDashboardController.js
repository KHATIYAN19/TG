import ArenaEntry from "../models/arena/ArenaEntry.js";
import { commissionOf, NET_COMMISSION_EXPR } from "../services/arena/affiliate.js";

// import mongoose from "mongoose";
// import Order from "../models/Order.js";
// import User from "../models/User.js";

// /* =====================================================
//    CONFIGURATION
// ===================================================== */

// const TIMEZONE = "Asia/Kolkata";
// const IST_MINUTES = 330;

// const MAX_PAGE_SIZE = 50;
// const DEFAULT_PAGE_SIZE = 15;
// const MAX_DATE_RANGE_DAYS = 3660;

// const SUCCESS = "SUCCESS";
// const PAID = "PAID";

// /* =====================================================
//    COMMON HELPERS
// ===================================================== */

// const money = (value) =>
//   Math.round(
//     (Number(value || 0) + Number.EPSILON) * 100
//   ) / 100;

// const number = (value) =>
//   Number(value || 0);

// const parsePositiveInt = (
//   value,
//   fallback,
//   maximum
// ) => {
//   const parsed = Number(value);

//   if (!Number.isSafeInteger(parsed) || parsed < 1) {
//     return fallback;
//   }

//   return Math.min(parsed, maximum);
// };

// const istDate = (date = new Date()) =>
//   new Date(
//     date.getTime() + IST_MINUTES * 60 * 1000
//   )
//     .toISOString()
//     .slice(0, 10);

// const dateToUTC = (dateString) =>
//   new Date(`${dateString}T00:00:00.000Z`);

// const shiftDay = (dateString, days) => {
//   const date = dateToUTC(dateString);

//   date.setUTCDate(date.getUTCDate() + days);

//   return date.toISOString().slice(0, 10);
// };

// const startIST = (dateString) =>
//   new Date(`${dateString}T00:00:00.000+05:30`);

// const endExclusiveIST = (dateString) =>
//   startIST(shiftDay(dateString, 1));

// const validDate = (value) => {
//   if (
//     typeof value !== "string" ||
//     !/^\d{4}-\d{2}-\d{2}$/.test(value)
//   ) {
//     return false;
//   }

//   const date = dateToUTC(value);

//   return (
//     !Number.isNaN(date.getTime()) &&
//     date.toISOString().slice(0, 10) === value
//   );
// };

// const daysBetween = (start, end) =>
//   Math.round(
//     (dateToUTC(end) - dateToUTC(start)) /
//       86400000
//   );

// const listDates = (startDate, days) =>
//   Array.from(
//     { length: days },
//     (_, i) => shiftDay(startDate, i)
//   );

// /* =====================================================
//    AUTHENTICATED AFFILIATE CONTEXT

//    Never accept affiliateUserId or affiliateCode
//    from req.query, req.params or req.body.
// ===================================================== */

// const getAffiliateContext = async (req) => {
//   const rawUserId =
//     req.user?.userId ||
//     req.user?._id ||
//     req.user?.sub;

//   if (
//     !rawUserId ||
//     !mongoose.Types.ObjectId.isValid(
//       String(rawUserId)
//     )
//   ) {
//     return {
//       error: "Authentication required.",
//       status: 401,
//     };
//   }

//   const user = await User.findOne({
//     _id: rawUserId,
//     role: "affiliate",
//     status: "active",
//     isDeleted: { $ne: true },
//   })
//     .select(
//       "name email role status " +
//       "affiliate.code " +
//       "affiliate.status " +
//       "affiliate.commissionType " +
//       "affiliate.commissionValue"
//     )
//     .lean();

//   if (!user) {
//     return {
//       error: "Active affiliate account required.",
//       status: 403,
//     };
//   }

//   if (
//     !user.affiliate ||
//     user.affiliate.status !== "active"
//   ) {
//     return {
//       error: "Affiliate partnership is inactive.",
//       status: 403,
//     };
//   }

//   return {
//     user,
//     affiliateUserId: new mongoose.Types.ObjectId(
//       String(user._id)
//     ),
//   };
// };

// /* =====================================================
//    PAYMENT VERIFICATION

//    Never treat a PENDING order as earned commission.

//    Supported payment providers:
//    Cashfree, PayU and Razorpay.

//    This deliberately excludes unverified historical
//    payments until their verification records are
//    reconciled.
// ===================================================== */

// const providerVerifiedExpr = {
//   $switch: {
//     branches: [
//       {
//         case: {
//           $eq: [
//             { $toLower: "$payment.provider" },
//             "cashfree",
//           ],
//         },
//         then: {
//           $eq: [
//             "$verification.cashfreeVerified",
//             true,
//           ],
//         },
//       },
//       {
//         case: {
//           $eq: [
//             { $toLower: "$payment.provider" },
//             "payu",
//           ],
//         },
//         then: {
//           $eq: [
//             "$verification.payuVerified",
//             true,
//           ],
//         },
//       },
//       {
//         case: {
//           $eq: [
//             { $toLower: "$payment.provider" },
//             "razorpay",
//           ],
//         },
//         then: {
//           $eq: [
//             "$verification.razorpayVerified",
//             true,
//           ],
//         },
//       },
//     ],
//     default: false,
//   },
// };

// /*
//   NOTE:
//   The financial dashboard currently reports INR.
//   Other currencies are excluded rather than added
//   together without conversion.
// */

// const validSaleExpr = {
//   $and: [
//     { $eq: ["$orderStatus", PAID] },
//     { $eq: ["$payment.status", SUCCESS] },
//     { $eq: ["$book.currency", "INR"] },
//     { $eq: ["$verification.amountVerified", true] },
//     providerVerifiedExpr,
//     { $gt: ["$payment.amount", 0] },
//     { $gte: ["$payment.affiliateAmount", 0] },
//     { $ne: ["$payment.affiliateUserId", null] },
//   ],
// };

// const failedExpr = {
//   $or: [
//     { $eq: ["$payment.status", "FAILED"] },
//     { $eq: ["$orderStatus", "FAILED"] },
//   ],
// };

// const refundedExpr = {
//   $or: [
//     {
//       $in: [
//         "$payment.status",
//         ["REFUNDED", "PARTIALLY_REFUNDED"],
//       ],
//     },
//     {
//       $in: [
//         "$orderStatus",
//         ["REFUNDED", "PARTIALLY_REFUNDED"],
//       ],
//     },
//     {
//       $in: [
//         "$refund.status",
//         ["PARTIAL", "REFUNDED"],
//       ],
//     },
//   ],
// };

// /*
//   Single consistent event date:
//   payment.paidAt if present; otherwise createdAt.

//   Use this same definition for dashboard periods,
//   graph buckets, and custom date filters.
// */

// const classificationStages = [
//   {
//     $addFields: {
//       eventAt: {
//         $ifNull: [
//           "$payment.paidAt",
//           "$createdAt",
//         ],
//       },
//     },
//   },
//   {
//     $addFields: {
//       isEarned: validSaleExpr,
//       isFailed: failedExpr,
//       isRefunded: refundedExpr,
//     },
//   },
//   {
//     $addFields: {
//       isPending: {
//         $and: [
//           { $eq: ["$payment.status", "PENDING"] },
//           { $eq: ["$orderStatus", "PENDING"] },
//         ],
//       },
//     },
//   },
// ];

// /* =====================================================
//    METRIC AGGREGATION

//    The same group definition is reused everywhere.
// ===================================================== */

// const metricGroup = {
//   $group: {
//     _id: null,

//     totalOrders: {
//       $sum: 1,
//     },

//     successfulOrders: {
//       $sum: {
//         $cond: ["$isEarned", 1, 0],
//       },
//     },

//     successfulAmount: {
//       $sum: {
//         $cond: [
//           "$isEarned",
//           "$payment.amount",
//           0,
//         ],
//       },
//     },

//     earnedCommission: {
//       $sum: {
//         $cond: [
//           "$isEarned",
//           "$payment.affiliateAmount",
//           0,
//         ],
//       },
//     },

//     remainingAmount: {
//       $sum: {
//         $cond: [
//           "$isEarned",
//           "$payment.remainingAmount",
//           0,
//         ],
//       },
//     },

//     failedOrders: {
//       $sum: {
//         $cond: ["$isFailed", 1, 0],
//       },
//     },

//     failedAttemptedAmount: {
//       $sum: {
//         $cond: [
//           "$isFailed",
//           "$payment.amount",
//           0,
//         ],
//       },
//     },

//     pendingOrders: {
//       $sum: {
//         $cond: ["$isPending", 1, 0],
//       },
//     },

//     refundedOrders: {
//       $sum: {
//         $cond: ["$isRefunded", 1, 0],
//       },
//     },
//   },
// };

// const emptyMetrics = () => ({
//   totalOrders: 0,
//   successfulOrders: 0,
//   successfulAmount: 0,
//   earnedCommission: 0,
//   remainingAmount: 0,
//   failedOrders: 0,
//   failedAttemptedAmount: 0,
//   pendingOrders: 0,
//   refundedOrders: 0,
//   conversionRate: 0,
// });

// const normalizeMetrics = (raw) => {
//   const data = raw || {};

//   const result = {
//     totalOrders: number(data.totalOrders),
//     successfulOrders: number(
//       data.successfulOrders
//     ),
//     successfulAmount: money(
//       data.successfulAmount
//     ),
//     earnedCommission: money(
//       data.earnedCommission
//     ),
//     remainingAmount: money(
//       data.remainingAmount
//     ),
//     failedOrders: number(data.failedOrders),
//     failedAttemptedAmount: money(
//       data.failedAttemptedAmount
//     ),
//     pendingOrders: number(data.pendingOrders),
//     refundedOrders: number(
//       data.refundedOrders
//     ),
//   };

//   result.conversionRate =
//     result.totalOrders > 0
//       ? money(
//           (result.successfulOrders /
//             result.totalOrders) *
//             100
//         )
//       : 0;

//   return result;
// };

// const dateMatch = (start, endExclusive) => ({
//   $match: {
//     eventAt: {
//       $gte: start,
//       $lt: endExclusive,
//     },
//   },
// });

// /* =====================================================
//    SAFE ORDER PROJECTION

//    Never expose:
//    - Customer name/email/phone
//    - Customer IP/user agent
//    - Payment session/payment IDs
//    - Payment gateway response payloads
//    - Book access tokens
//    - Full coupon/internal metadata
// ===================================================== */

// const safeOrderProjection = {
//   $project: {
//     _id: 0,
//     orderId: 1,

//     createdAt: 1,
//     eventAt: 1,

//     bookTitle: "$book.title",

//     currency: "$book.currency",

//     originalBookPrice: "$book.price",

//     discountAmount: "$coupon.discountAmount",

//     paymentProvider: "$payment.provider",

//     paymentMethod: "$payment.method",

//     paymentStatus: "$payment.status",

//     orderStatus: 1,

//     affiliateCode: "$payment.affiliateCode",

//     commissionType: "$payment.affiliateType",

//     commissionValue: "$payment.affiliateValue",

//     commissionAmount: "$payment.affiliateAmount",

//     remainingAmount: "$payment.remainingAmount",

//     amount: "$payment.amount",

//     paidAt: "$payment.paidAt",

//     isEarned: 1,
//     isFailed: 1,
//     isRefunded: 1,
//     isPending: 1,
//   },
// };

// const cleanOrder = (row) => {
//   const state = row.isRefunded
//     ? "REFUNDED"
//     : row.isFailed
//       ? "FAILED"
//       : row.isEarned
//         ? "EARNED"
//         : row.isPending
//           ? "PENDING"
//           : "UNVERIFIED";

//   return {
//     orderId: row.orderId,

//     book: {
//       title: row.bookTitle || "Book",
//       price: money(row.originalBookPrice),
//     },

//     createdAt: row.createdAt,
//     eventAt: row.eventAt,
//     paidAt: row.paidAt || null,

//     currency: row.currency || "INR",

//     paymentProvider: row.paymentProvider || null,
//     paymentMethod: row.paymentMethod || null,

//     paymentStatus: row.paymentStatus,
//     orderStatus: row.orderStatus,

//     affiliateCode: row.affiliateCode,

//     commissionType: row.commissionType,
//     commissionValue: row.commissionValue,

//     // A snapshot from checkout.
//     commissionAmount:
//       row.commissionAmount == null
//         ? null
//         : money(row.commissionAmount),

//     remainingAmount:
//       row.remainingAmount == null
//         ? null
//         : money(row.remainingAmount),

//     amount: money(row.amount),
//     discountAmount: money(row.discountAmount),

//     // This determines whether commission contributes
//     // to the financial summary.
//     commissionEarned: Boolean(row.isEarned),

//     state,
//   };
// };

// /* =====================================================
//    PERIOD DEFINITIONS
// ===================================================== */

// const getPeriods = () => {
//   const today = istDate();

//   return {
//     today,
//     current: {
//       start: startIST(today),
//       end: endExclusiveIST(today),
//     },
//     last7Days: {
//       start: startIST(shiftDay(today, -6)),
//       end: endExclusiveIST(today),
//     },
//     last30Days: {
//       start: startIST(shiftDay(today, -29)),
//       end: endExclusiveIST(today),
//     },
//     last365Days: {
//       start: startIST(shiftDay(today, -364)),
//       end: endExclusiveIST(today),
//     },
//   };
// };

// const metricFacet = (start, end) => [
//   dateMatch(start, end),
//   metricGroup,
// ];

// /* =====================================================
//    API 1: AFFILIATE DASHBOARD

//    GET /api/affiliate/dashboard

//    Optional:
//    ?graphDays=7
//    ?graphDays=30
//    ?graphDays=365

//    Includes:
//    - All-time metrics
//    - Today, last 7, 30, 365 days
//    - Daily graph
//    - Last 15 orders
//    - Affiliate commission configuration
// ===================================================== */

// export const getAffiliateDashboard = async (
//   req,
//   res
// ) => {
//   try {
//     const context = await getAffiliateContext(req);

//     if (context.error) {
//       return res.status(context.status).json({
//         success: false,
//         message: context.error,
//       });
//     }

//     const graphDays = [7, 30, 365].includes(
//       Number(req.query.graphDays)
//     )
//       ? Number(req.query.graphDays)
//       : 7;

//     const periods = getPeriods();

//     const graphStartDate = shiftDay(
//       periods.today,
//       -(graphDays - 1)
//     );

//     const graphStart = startIST(graphStartDate);
//     const graphEnd = endExclusiveIST(
//       periods.today
//     );

//     const baseMatch = {
//       "payment.affiliateUserId":
//         context.affiliateUserId,
//     };

//     const [aggregateResult, recentOrders] =
//       await Promise.all([
//         Order.aggregate([
//           { $match: baseMatch },

//           ...classificationStages,

//           {
//             $facet: {
//               allTime: [metricGroup],

//               today: metricFacet(
//                 periods.current.start,
//                 periods.current.end
//               ),

//               last7Days: metricFacet(
//                 periods.last7Days.start,
//                 periods.last7Days.end
//               ),

//               last30Days: metricFacet(
//                 periods.last30Days.start,
//                 periods.last30Days.end
//               ),

//               last365Days: metricFacet(
//                 periods.last365Days.start,
//                 periods.last365Days.end
//               ),

//               graph: [
//                 dateMatch(graphStart, graphEnd),

//                 {
//                   $group: {
//                     _id: {
//                       $dateToString: {
//                         date: "$eventAt",
//                         format: "%Y-%m-%d",
//                         timezone: TIMEZONE,
//                       },
//                     },

//                     orders: { $sum: 1 },

//                     successfulOrders: {
//                       $sum: {
//                         $cond: ["$isEarned", 1, 0],
//                       },
//                     },

//                     salesAmount: {
//                       $sum: {
//                         $cond: [
//                           "$isEarned",
//                           "$payment.amount",
//                           0,
//                         ],
//                       },
//                     },

//                     commission: {
//                       $sum: {
//                         $cond: [
//                           "$isEarned",
//                           "$payment.affiliateAmount",
//                           0,
//                         ],
//                       },
//                     },

//                     failedOrders: {
//                       $sum: {
//                         $cond: ["$isFailed", 1, 0],
//                       },
//                     },
//                   },
//                 },

//                 { $sort: { _id: 1 } },
//               ],
//             },
//           },
//         ]),

//         Order.aggregate([
//           { $match: baseMatch },

//           { $sort: { createdAt: -1 } },

//           { $limit: 15 },

//           ...classificationStages,

//           safeOrderProjection,
//         ]),
//       ]);

//     const aggregated = aggregateResult[0] || {};

//     const period = (key) =>
//       normalizeMetrics(aggregated[key]?.[0]);

//     const graphMap = new Map(
//       (aggregated.graph || []).map(
//         (row) => [row._id, row]
//       )
//     );

//     const graph = listDates(
//       graphStartDate,
//       graphDays
//     ).map((date) => {
//       const point = graphMap.get(date);

//       return {
//         date,
//         orders: number(point?.orders),
//         successfulOrders: number(
//           point?.successfulOrders
//         ),
//         salesAmount: money(
//           point?.salesAmount
//         ),
//         commission: money(
//           point?.commission
//         ),
//         failedOrders: number(
//           point?.failedOrders
//         ),
//       };
//     });

//     const affiliate = context.user.affiliate;

//     return res.status(200).json({
//       success: true,

//       data: {
//         currency: "INR",
//         timezone: TIMEZONE,

//         generatedAt: new Date().toISOString(),

//         affiliate: {
//           name: context.user.name,
//           code: affiliate.code,
//           commissionType:
//             affiliate.commissionType,
//           commissionValue:
//             affiliate.commissionValue,
//           status: affiliate.status,
//         },

//         summary: {
//           allTime: period("allTime"),
//           today: period("today"),
//           last7Days: period("last7Days"),
//           last30Days: period("last30Days"),
//           last365Days: period("last365Days"),
//         },

//         graph: {
//           interval: "DAY",
//           days: graphDays,
//           startDate: graphStartDate,
//           endDate: periods.today,
//           points: graph,
//         },

//         recentOrders: recentOrders.map(
//           cleanOrder
//         ),

//         calculationPolicy: {
//           commissionBasis:
//             "Final paid amount after coupon discounts",

//           recognizedSales:
//             "PAID + SUCCESS + verified provider and amount",

//           dateField:
//             "payment.paidAt, falling back to createdAt",

//           refundedSales:
//             "Excluded from recognized earnings",

//           currency:
//             "INR only; other currencies are not converted",

//           earningsType:
//             "Current verified non-refunded order totals, not payout balances",
//         },
//       },
//     });
//   } catch (error) {
//     console.error(
//       "Affiliate dashboard error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Unable to load affiliate dashboard.",
//     });
//   }
// };

// /* =====================================================
//    API 2: AFFILIATE TRANSACTIONS

//    GET /api/affiliate/orders

//    Optional query params:
//    page=1
//    limit=15
//    status=ALL|EARNED|FAILED|PENDING|REFUNDED|UNVERIFIED
//    startDate=2026-10-01
//    endDate=2026-10-21
//    sort=desc|asc

//    Returns:
//    - Paginated safe orders
//    - Filtered totals
//    - Date range
//    - Pagination metadata

//    Security:
//    Affiliate ID comes only from authenticated JWT.
// ===================================================== */

// export const getAffiliateOrders = async (
//   req,
//   res
// ) => {
//   try {
//     const context = await getAffiliateContext(req);

//     if (context.error) {
//       return res.status(context.status).json({
//         success: false,
//         message: context.error,
//       });
//     }

//     const page = parsePositiveInt(
//       req.query.page,
//       1,
//       100000
//     );

//     const limit = parsePositiveInt(
//       req.query.limit,
//       DEFAULT_PAGE_SIZE,
//       MAX_PAGE_SIZE
//     );

//     const sort =
//       req.query.sort === "asc" ? 1 : -1;

//     const status = String(
//       req.query.status || "ALL"
//     ).toUpperCase();

//     const allowedStatuses = new Set([
//       "ALL",
//       "EARNED",
//       "FAILED",
//       "PENDING",
//       "REFUNDED",
//       "UNVERIFIED",
//     ]);

//     if (!allowedStatuses.has(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid transaction status.",
//       });
//     }

//     const { startDate, endDate } = req.query;

//     if (
//       Boolean(startDate) !== Boolean(endDate)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Provide both startDate and endDate.",
//       });
//     }

//     let start = null;
//     let end = null;

//     if (startDate && endDate) {
//       if (
//         !validDate(startDate) ||
//         !validDate(endDate) ||
//         startDate > endDate
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid date range.",
//         });
//       }

//       if (
//         daysBetween(startDate, endDate) >
//         MAX_DATE_RANGE_DAYS
//       ) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "Date range cannot exceed 3660 days.",
//         });
//       }

//       start = startIST(startDate);
//       end = endExclusiveIST(endDate);
//     }

//     const filterStages = [
//       {
//         $match: {
//           "payment.affiliateUserId":
//             context.affiliateUserId,
//         },
//       },

//       ...classificationStages,
//     ];

//     if (start && end) {
//       filterStages.push(dateMatch(start, end));
//     }

//     /*
//       Apply one status classification priority:
//       REFUNDED > FAILED > EARNED > PENDING >
//       UNVERIFIED.

//       This prevents an order from being counted in
//       two filtered transaction states.
//     */

//     const stateExpression = {
//       $switch: {
//         branches: [
//           {
//             case: "$isRefunded",
//             then: "REFUNDED",
//           },
//           {
//             case: "$isFailed",
//             then: "FAILED",
//           },
//           {
//             case: "$isEarned",
//             then: "EARNED",
//           },
//           {
//             case: "$isPending",
//             then: "PENDING",
//           },
//         ],
//         default: "UNVERIFIED",
//       },
//     };

//     filterStages.push({
//       $addFields: {
//         transactionState: stateExpression,
//       },
//     });

//     if (status !== "ALL") {
//       filterStages.push({
//         $match: {
//           transactionState: status,
//         },
//       });
//     }

//     const skip = (page - 1) * limit;

//     const [result] = await Order.aggregate([
//       ...filterStages,

//       {
//         $facet: {
//           items: [
//             {
//               $sort: {
//                 eventAt: sort,
//                 _id: sort,
//               },
//             },

//             { $skip: skip },

//             { $limit: limit },

//             safeOrderProjection,
//           ],

//           count: [
//             { $count: "value" },
//           ],

//           totals: [
//             metricGroup,
//           ],
//         },
//       },
//     ]);

//     const total = number(
//       result?.count?.[0]?.value
//     );

//     const pages = Math.ceil(total / limit);

//     const rows = (result?.items || []).map(
//       cleanOrder
//     );

//     return res.status(200).json({
//       success: true,

//       data: {
//         currency: "INR",
//         timezone: TIMEZONE,

//         filters: {
//           status,
//           startDate: startDate || null,
//           endDate: endDate || null,
//           sort: sort === 1 ? "asc" : "desc",
//         },

//         totals: normalizeMetrics(
//           result?.totals?.[0]
//         ),

//         pagination: {
//           page,
//           limit,
//           total,
//           pages,
//           hasNext: page < pages,
//           hasPrevious: page > 1,
//         },

//         orders: rows,
//       },
//     });
//   } catch (error) {
//     console.error(
//       "Affiliate orders error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message:
//         "Unable to retrieve affiliate orders.",
//     });
//   }
// };

import mongoose from "mongoose";
import Order from "../models/Order.js";
import User from "../models/User.js";

/* =====================================================
   CONFIGURATION
===================================================== */

const TIMEZONE = "Asia/Kolkata";
const IST_MINUTES = 330;

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 15;
const MAX_DATE_RANGE_DAYS = 3660;

const SUCCESS = "SUCCESS";
const PAID = "PAID";

/* =====================================================
   COMMON HELPERS
===================================================== */

const money = (value) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const number = (value) => Number(value || 0);

const parsePositiveInt = (value, fallback, maximum) => {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(parsed, maximum);
};

const istDate = (date = new Date()) =>
  new Date(date.getTime() + IST_MINUTES * 60000)
    .toISOString()
    .slice(0, 10);

const dateToUTC = (dateString) =>
  new Date(`${dateString}T00:00:00.000Z`);

const shiftDay = (dateString, days) => {
  const date = dateToUTC(dateString);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const startIST = (dateString) =>
  new Date(`${dateString}T00:00:00.000+05:30`);

const endExclusiveIST = (dateString) =>
  startIST(shiftDay(dateString, 1));

const validDate = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const date = dateToUTC(value);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};

const daysBetween = (start, end) =>
  Math.round(
    (dateToUTC(end) - dateToUTC(start)) / 86400000
  );

const listDates = (startDate, days) =>
  Array.from(
    { length: days },
    (_, index) => shiftDay(startDate, index)
  );

/* =====================================================
   AUTHENTICATED AFFILIATE CONTEXT

   Affiliate:
   GET /api/affiliate/dashboard
   GET /api/affiliate/orders

   Administrator:
   GET /api/affiliate/dashboard?userId=...
   GET /api/affiliate/orders?userId=...

   Security:
   - Actor identity comes from verified auth middleware.
   - Actor role is rechecked in MongoDB.
   - Affiliates cannot select other users.
   - Admins can select an affiliate by MongoDB _id.
===================================================== */

const getAffiliateContext = async (req) => {
  const rawActorId =
    req.user?.userId ||
    req.user?._id ||
    req.user?.sub;

  if (
    !rawActorId ||
    !mongoose.isValidObjectId(String(rawActorId))
  ) {
    return {
      error: "Authentication required.",
      status: 401,
    };
  }

  const actor = await User.findOne({
    _id: rawActorId,
    status: "active",
    isDeleted: { $ne: true },
  })
    .select("_id role status")
    .lean();

  if (!actor) {
    return {
      error: "Active account required.",
      status: 403,
    };
  }

  const hasTargetParam = Object.prototype.hasOwnProperty.call(
    req.query || {},
    "userId"
  );

  const targetParam = req.query?.userId;

  if (hasTargetParam && actor.role !== "admin") {
    return {
      error: "Only administrators may select an affiliate user.",
      status: 403,
    };
  }

  let affiliateId;

  if (actor.role === "admin") {
    if (
      typeof targetParam !== "string" ||
      !mongoose.isValidObjectId(targetParam)
    ) {
      return {
        error:
          "A valid affiliate userId is required for administrator requests.",
        status: 400,
      };
    }

    affiliateId = targetParam;
  } else if (actor.role === "affiliate") {
    affiliateId = String(actor._id);
  } else {
    return {
      error: "Affiliate or administrator access required.",
      status: 403,
    };
  }

  const user = await User.findOne({
    _id: affiliateId,
    role: "affiliate",
    isDeleted: { $ne: true },
  })
    .select(
      "name email role status " +
        "affiliate.code " +
        "affiliate.status " +
        "affiliate.commissionType " +
        "affiliate.commissionValue"
    )
    .lean();

  if (!user) {
    return {
      error: "Affiliate account not found.",
      status: 404,
    };
  }

  // Administrators may inspect historical sales
  // for inactive or suspended affiliate accounts.
  // The partner themselves must remain active.
  if (
    actor.role === "affiliate" &&
    (
      user.status !== "active" ||
      user.affiliate?.status !== "active"
    )
  ) {
    return {
      error: "Affiliate partnership is inactive.",
      status: 403,
    };
  }

  return {
    user,
    affiliateUserId: new mongoose.Types.ObjectId(
      String(user._id)
    ),
  };
};

/* =====================================================
   PAYMENT VERIFICATION

   The provider's verification flag and amount
   verification must both be true.
===================================================== */

const providerVerifiedExpr = {
  $switch: {
    branches: [
      {
        case: {
          $eq: [
            { $toLower: "$payment.provider" },
            "cashfree",
          ],
        },
        then: {
          $eq: [
            "$verification.cashfreeVerified",
            true,
          ],
        },
      },
      {
        case: {
          $eq: [
            { $toLower: "$payment.provider" },
            "payu",
          ],
        },
        then: {
          $eq: [
            "$verification.payuVerified",
            true,
          ],
        },
      },
      {
        case: {
          $eq: [
            { $toLower: "$payment.provider" },
            "razorpay",
          ],
        },
        then: {
          $eq: [
            "$verification.razorpayVerified",
            true,
          ],
        },
      },
    ],
    default: false,
  },
};

const refundedExpr = {
  $or: [
    {
      $in: [
        "$payment.status",
        ["REFUNDED", "PARTIALLY_REFUNDED"],
      ],
    },
    {
      $in: [
        "$orderStatus",
        ["REFUNDED", "PARTIALLY_REFUNDED"],
      ],
    },
    {
      $in: [
        "$refund.status",
        ["PARTIAL", "REFUNDED"],
      ],
    },
  ],
};

const failedExpr = {
  $or: [
    { $eq: ["$payment.status", "FAILED"] },
    { $eq: ["$orderStatus", "FAILED"] },
  ],
};

// Recognize sales only when they are verified,
// paid, INR-denominated, and not refunded.
const validSaleExpr = {
  $and: [
    { $eq: ["$orderStatus", PAID] },
    { $eq: ["$payment.status", SUCCESS] },
    { $eq: ["$book.currency", "INR"] },
    { $eq: ["$verification.amountVerified", true] },
    providerVerifiedExpr,
    { $not: [refundedExpr] },
    { $gt: ["$payment.amount", 0] },
    { $gte: ["$payment.affiliateAmount", 0] },
    { $ne: ["$payment.affiliateUserId", null] },
  ],
};

/* =====================================================
   CLASSIFICATION STAGES

   Use paidAt if present, else createdAt.
===================================================== */

const classificationStages = [
  {
    $addFields: {
      eventAt: {
        $ifNull: [
          "$payment.paidAt",
          "$createdAt",
        ],
      },
    },
  },
  {
    $addFields: {
      isRefunded: refundedExpr,
      isFailed: failedExpr,
      isEarned: validSaleExpr,
    },
  },
  {
    $addFields: {
      isPending: {
        $and: [
          { $eq: ["$payment.status", "PENDING"] },
          { $eq: ["$orderStatus", "PENDING"] },
        ],
      },
    },
  },
];

/* =====================================================
   METRIC AGGREGATION
===================================================== */

const metricGroup = {
  $group: {
    _id: null,

    totalOrders: { $sum: 1 },

    successfulOrders: {
      $sum: {
        $cond: ["$isEarned", 1, 0],
      },
    },

    successfulAmount: {
      $sum: {
        $cond: [
          "$isEarned",
          "$payment.amount",
          0,
        ],
      },
    },

    earnedCommission: {
      $sum: {
        $cond: [
          "$isEarned",
          "$payment.affiliateAmount",
          0,
        ],
      },
    },

    remainingAmount: {
      $sum: {
        $cond: [
          "$isEarned",
          "$payment.remainingAmount",
          0,
        ],
      },
    },

    failedOrders: {
      $sum: {
        $cond: ["$isFailed", 1, 0],
      },
    },

    failedAttemptedAmount: {
      $sum: {
        $cond: [
          "$isFailed",
          "$payment.amount",
          0,
        ],
      },
    },

    pendingOrders: {
      $sum: {
        $cond: ["$isPending", 1, 0],
      },
    },

    refundedOrders: {
      $sum: {
        $cond: ["$isRefunded", 1, 0],
      },
    },
  },
};

const normalizeMetrics = (raw = {}) => {
  const result = {
    totalOrders: number(raw.totalOrders),
    successfulOrders: number(raw.successfulOrders),
    successfulAmount: money(raw.successfulAmount),
    earnedCommission: money(raw.earnedCommission),
    remainingAmount: money(raw.remainingAmount),
    failedOrders: number(raw.failedOrders),
    failedAttemptedAmount: money(raw.failedAttemptedAmount),
    pendingOrders: number(raw.pendingOrders),
    refundedOrders: number(raw.refundedOrders),
  };

  result.conversionRate =
    result.totalOrders > 0
      ? money(
          (result.successfulOrders / result.totalOrders) * 100
        )
      : 0;

  return result;
};

const dateMatch = (start, endExclusive) => ({
  $match: {
    eventAt: {
      $gte: start,
      $lt: endExclusive,
    },
  },
});

/* =====================================================
   SAFE ORDER PROJECTION

   Excludes customer personal information,
   access credentials, and gateway payloads.
===================================================== */

const safeOrderProjection = {
  $project: {
    _id: 0,
    orderId: 1,
    createdAt: 1,
    eventAt: 1,

    bookTitle: "$book.title",
    currency: "$book.currency",
    originalBookPrice: "$book.price",

    discountAmount: "$coupon.discountAmount",

    paymentProvider: "$payment.provider",
    paymentMethod: "$payment.method",

    paymentStatus: "$payment.status",
    orderStatus: 1,

    affiliateCode: "$payment.affiliateCode",

    commissionType: "$payment.affiliateType",
    commissionValue: "$payment.affiliateValue",
    commissionAmount: "$payment.affiliateAmount",
    remainingAmount: "$payment.remainingAmount",

    amount: "$payment.amount",
    paidAt: "$payment.paidAt",

    isEarned: 1,
    isFailed: 1,
    isRefunded: 1,
    isPending: 1,
  },
};

const cleanOrder = (row) => {
  const state = row.isRefunded
    ? "REFUNDED"
    : row.isFailed
      ? "FAILED"
      : row.isEarned
        ? "EARNED"
        : row.isPending
          ? "PENDING"
          : "UNVERIFIED";

  return {
    orderId: row.orderId,

    book: {
      title: row.bookTitle || "Book",
      price: money(row.originalBookPrice),
    },

    createdAt: row.createdAt,
    eventAt: row.eventAt,
    paidAt: row.paidAt || null,

    currency: row.currency || "INR",

    paymentProvider: row.paymentProvider || null,
    paymentMethod: row.paymentMethod || null,

    paymentStatus: row.paymentStatus,
    orderStatus: row.orderStatus,

    affiliateCode: row.affiliateCode,

    commissionType: row.commissionType,
    commissionValue: row.commissionValue,

    commissionAmount:
      row.commissionAmount == null
        ? null
        : money(row.commissionAmount),

    remainingAmount:
      row.remainingAmount == null
        ? null
        : money(row.remainingAmount),

    amount: money(row.amount),
    discountAmount: money(row.discountAmount),

    commissionEarned: Boolean(row.isEarned),

    state,
  };
};

/* =====================================================
   PERIODS — ASIA/KOLKATA
===================================================== */

const getPeriods = () => {
  const today = istDate();

  return {
    today,

    current: {
      start: startIST(today),
      end: endExclusiveIST(today),
    },

    last7Days: {
      start: startIST(shiftDay(today, -6)),
      end: endExclusiveIST(today),
    },

    last30Days: {
      start: startIST(shiftDay(today, -29)),
      end: endExclusiveIST(today),
    },

    last365Days: {
      start: startIST(shiftDay(today, -364)),
      end: endExclusiveIST(today),
    },
  };
};

const metricFacet = (start, end) => [
  dateMatch(start, end),
  metricGroup,
];

/* =====================================================
   PREPBUDDY (ARENA) ENTRIES, MERGED INTO THE SAME REPORTS

   Arena commissions live on ArenaEntry.affiliate. These
   helpers shape them like book orders so the dashboard,
   graph, recent list and transactions list can show both.
   Only money, rate and an opaque reference are exposed.
===================================================== */

const ARENA_STATUSES = ["paid", "in_match", "consumed", "cancelling", "cancelled"];
const ARENA_TITLE = "PrepBuddy Arena Entry";
const paise = (v) => number(v) / 100;

const arenaBase = (affiliateUserId, start, end) => ({
  "affiliate.user": affiliateUserId,
  status: { $in: ARENA_STATUSES },
  paidAt: start && end ? { $gte: start, $lt: end } : { $ne: null },
});

const ARENA_REFUNDED = {
  $add: [{ $ifNull: ["$cancel.refundPaise", 0] }, { $ifNull: ["$refundedPaise", 0] }],
};
const ARENA_FULLY_REFUNDED = { $gte: [ARENA_REFUNDED, "$paidPaise"] };

const arenaGroup = {
  $group: {
    _id: null,
    totalOrders: { $sum: 1 },
    successfulOrders: { $sum: { $cond: [ARENA_FULLY_REFUNDED, 0, 1] } },
    refundedOrders: { $sum: { $cond: [ARENA_FULLY_REFUNDED, 1, 0] } },
    successfulAmount: { $sum: { $max: [0, { $subtract: ["$paidPaise", ARENA_REFUNDED] }] } },
    earnedCommission: { $sum: NET_COMMISSION_EXPR },
  },
};

const arenaStateMatch = (stateFilter) =>
  stateFilter === "EARNED"
    ? { $expr: { $not: [ARENA_FULLY_REFUNDED] } }
    : stateFilter === "REFUNDED"
      ? { $expr: ARENA_FULLY_REFUNDED }
      : {};

const arenaMetrics = async (affiliateUserId, start, end, stateFilter) => {
  const [r] = await ArenaEntry.aggregate([
    { $match: { ...arenaBase(affiliateUserId, start, end), ...arenaStateMatch(stateFilter) } },
    arenaGroup,
  ]);
  const sales = paise(r?.successfulAmount);
  const commission = paise(r?.earnedCommission);
  return {
    totalOrders: number(r?.totalOrders),
    successfulOrders: number(r?.successfulOrders),
    refundedOrders: number(r?.refundedOrders),
    successfulAmount: sales,
    earnedCommission: commission,
    remainingAmount: Math.max(0, sales - commission),
  };
};

const mergeMetrics = (book, arena) => {
  const out = {
    ...book,
    totalOrders: book.totalOrders + arena.totalOrders,
    successfulOrders: book.successfulOrders + arena.successfulOrders,
    refundedOrders: book.refundedOrders + arena.refundedOrders,
    successfulAmount: money(book.successfulAmount + arena.successfulAmount),
    earnedCommission: money(book.earnedCommission + arena.earnedCommission),
    remainingAmount: money(book.remainingAmount + arena.remainingAmount),
  };
  out.conversionRate = out.totalOrders > 0 ? money((out.successfulOrders / out.totalOrders) * 100) : 0;
  return out;
};

const arenaAsOrder = (r) => {
  const c = commissionOf(r);
  const refunded = number(r.refundedPaise) + number(r.cancel?.refundPaise);
  const fully = refunded >= number(r.paidPaise);
  return {
    orderId: `PB-${String(r._id).slice(-8).toUpperCase()}`,
    source: "PREPBUDDY",
    book: { title: ARENA_TITLE, price: money(paise(r.listPricePaise)) },
    createdAt: r.paidAt,
    eventAt: r.paidAt,
    paidAt: r.paidAt,
    currency: "INR",
    paymentProvider: null,
    paymentMethod: null,
    paymentStatus: fully ? "REFUNDED" : "SUCCESS",
    orderStatus: fully ? "REFUNDED" : "COMPLETED",
    affiliateCode: c?.code || null,
    commissionType: c ? c.type.toUpperCase() : null,
    commissionValue: c ? c.value : null,
    commissionAmount: c ? money(paise(c.netPaise)) : 0,
    remainingAmount: money(paise(r.paidPaise) - (c ? paise(c.netPaise) : 0)),
    amount: money(paise(r.paidPaise)),
    discountAmount: money(paise(r.discountPaise)),
    commissionEarned: !fully && Boolean(c),
    state: fully ? "REFUNDED" : "EARNED",
  };
};

const ARENA_SELECT = "status paidAt paidPaise listPricePaise discountPaise refundedPaise cancel.refundPaise affiliate";

const arenaRecent = async (affiliateUserId, limit, start, end, stateFilter, dir = -1) => {
  const match = arenaBase(affiliateUserId, start, end);
  if (stateFilter === "EARNED") match.$expr = { $not: [ARENA_FULLY_REFUNDED] };
  if (stateFilter === "REFUNDED") match.$expr = ARENA_FULLY_REFUNDED;
  const rows = await ArenaEntry.find(match).sort({ paidAt: dir, _id: dir }).limit(limit).select(ARENA_SELECT).lean();
  return rows.map(arenaAsOrder);
};

const byDateDesc = (a, b) => new Date(b.eventAt || b.createdAt) - new Date(a.eventAt || a.createdAt);

/* =====================================================
   API 1: AFFILIATE DASHBOARD

   GET /api/affiliate/dashboard

   Admin:
   GET /api/affiliate/dashboard
       ?userId=AFFILIATE_ID
       &graphDays=30
===================================================== */

export const getAffiliateDashboard = async (req, res) => {
  try {
    const context = await getAffiliateContext(req);

    if (context.error) {
      return res.status(context.status).json({
        success: false,
        message: context.error,
      });
    }

    const graphDays = [7, 30, 365].includes(
      Number(req.query.graphDays)
    )
      ? Number(req.query.graphDays)
      : 7;

    const periods = getPeriods();

    const graphStartDate = shiftDay(
      periods.today,
      -(graphDays - 1)
    );

    const graphStart = startIST(graphStartDate);
    const graphEnd = endExclusiveIST(periods.today);

    // Always filter using the server-resolved affiliate ID.
    const baseMatch = {
      "payment.affiliateUserId": context.affiliateUserId,
    };

    const [aggregateResult, recentOrders] =
      await Promise.all([
        Order.aggregate([
          { $match: baseMatch },

          ...classificationStages,

          {
            $facet: {
              allTime: [metricGroup],

              today: metricFacet(
                periods.current.start,
                periods.current.end
              ),

              last7Days: metricFacet(
                periods.last7Days.start,
                periods.last7Days.end
              ),

              last30Days: metricFacet(
                periods.last30Days.start,
                periods.last30Days.end
              ),

              last365Days: metricFacet(
                periods.last365Days.start,
                periods.last365Days.end
              ),

              graph: [
                dateMatch(graphStart, graphEnd),

                {
                  $group: {
                    _id: {
                      $dateToString: {
                        date: "$eventAt",
                        format: "%Y-%m-%d",
                        timezone: TIMEZONE,
                      },
                    },

                    orders: { $sum: 1 },

                    successfulOrders: {
                      $sum: {
                        $cond: ["$isEarned", 1, 0],
                      },
                    },

                    salesAmount: {
                      $sum: {
                        $cond: [
                          "$isEarned",
                          "$payment.amount",
                          0,
                        ],
                      },
                    },

                    commission: {
                      $sum: {
                        $cond: [
                          "$isEarned",
                          "$payment.affiliateAmount",
                          0,
                        ],
                      },
                    },

                    failedOrders: {
                      $sum: {
                        $cond: ["$isFailed", 1, 0],
                      },
                    },
                  },
                },

                { $sort: { _id: 1 } },
              ],
            },
          },
        ]),

        Order.aggregate([
          { $match: baseMatch },

          { $sort: { createdAt: -1 } },

          { $limit: 15 },

          ...classificationStages,

          safeOrderProjection,
        ]),
      ]);

    const aggregated = aggregateResult[0] || {};

    const arenaPeriods = {
      allTime: [null, null],
      today: [periods.current.start, periods.current.end],
      last7Days: [periods.last7Days.start, periods.last7Days.end],
      last30Days: [periods.last30Days.start, periods.last30Days.end],
      last365Days: [periods.last365Days.start, periods.last365Days.end],
    };

    const [arenaByPeriod, arenaGraph, arenaRecentOrders] = await Promise.all([
      Promise.all(
        Object.entries(arenaPeriods).map(async ([key, [a, b]]) => [
          key,
          await arenaMetrics(context.affiliateUserId, a, b),
        ])
      ).then(Object.fromEntries),

      ArenaEntry.aggregate([
        { $match: arenaBase(context.affiliateUserId, graphStart, graphEnd) },
        {
          $group: {
            _id: { $dateToString: { date: "$paidAt", format: "%Y-%m-%d", timezone: TIMEZONE } },
            orders: { $sum: 1 },
            successfulOrders: { $sum: { $cond: [ARENA_FULLY_REFUNDED, 0, 1] } },
            salesAmount: { $sum: { $max: [0, { $subtract: ["$paidPaise", ARENA_REFUNDED] }] } },
            commission: { $sum: NET_COMMISSION_EXPR },
          },
        },
      ]),

      arenaRecent(context.affiliateUserId, 15),
    ]);

    const arenaGraphMap = new Map(arenaGraph.map((row) => [row._id, row]));

    const period = (key) =>
      mergeMetrics(
        normalizeMetrics(aggregated[key]?.[0]),
        arenaByPeriod[key]
      );

    const graphMap = new Map(
      (aggregated.graph || []).map(
        (row) => [row._id, row]
      )
    );

    const graph = listDates(
      graphStartDate,
      graphDays
    ).map((date) => {
      const point = graphMap.get(date);

      const arenaPoint = arenaGraphMap.get(date);

      return {
        date,
        orders: number(point?.orders) + number(arenaPoint?.orders),
        successfulOrders:
          number(point?.successfulOrders) + number(arenaPoint?.successfulOrders),
        salesAmount: money(number(point?.salesAmount) + paise(arenaPoint?.salesAmount)),
        commission: money(number(point?.commission) + paise(arenaPoint?.commission)),
        failedOrders: number(point?.failedOrders),
      };
    });

    const affiliate = context.user.affiliate || {};

    return res.status(200).json({
      success: true,

      data: {
        currency: "INR",
        timezone: TIMEZONE,

        generatedAt: new Date().toISOString(),

        affiliate: {
          name: context.user.name,
          code: affiliate.code || null,
          commissionType: affiliate.commissionType || null,
          commissionValue: affiliate.commissionValue ?? null,
          status: affiliate.status || null,
        },

        summary: {
          allTime: period("allTime"),
          today: period("today"),
          last7Days: period("last7Days"),
          last30Days: period("last30Days"),
          last365Days: period("last365Days"),
        },

        graph: {
          interval: "DAY",
          days: graphDays,
          startDate: graphStartDate,
          endDate: periods.today,
          points: graph,
        },

        recentOrders: [
          ...recentOrders.map(cleanOrder),
          ...arenaRecentOrders,
        ]
          .sort(byDateDesc)
          .slice(0, 15),

        calculationPolicy: {
          commissionBasis:
            "Final paid amount after coupon discounts",

          recognizedSales:
            "PAID + SUCCESS + verified provider and amount",

          dateField:
            "payment.paidAt, falling back to createdAt",

          refundedSales:
            "Excluded from recognized earnings",

          currency:
            "INR only; other currencies are not converted",

          earningsType:
            "Current verified non-refunded order totals, not payout balances",
        },
      },
    });
  } catch (error) {
    console.error("Affiliate dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load affiliate dashboard.",
    });
  }
};

/* =====================================================
   API 2: AFFILIATE TRANSACTIONS

   GET /api/affiliate/orders

   Admin:
   GET /api/affiliate/orders
       ?userId=AFFILIATE_ID
       &page=1
       &limit=15
       &status=ALL

   Supported statuses:
   ALL, EARNED, FAILED, PENDING,
   REFUNDED, UNVERIFIED
===================================================== */

export const getAffiliateOrders = async (req, res) => {
  try {
    const context = await getAffiliateContext(req);

    if (context.error) {
      return res.status(context.status).json({
        success: false,
        message: context.error,
      });
    }

    const page = parsePositiveInt(
      req.query.page,
      1,
      100000
    );

    const limit = parsePositiveInt(
      req.query.limit,
      DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE
    );

    const sort =
      req.query.sort === "asc" ? 1 : -1;

    const status = String(
      req.query.status || "ALL"
    ).toUpperCase();

    const allowedStatuses = new Set([
      "ALL",
      "EARNED",
      "FAILED",
      "PENDING",
      "REFUNDED",
      "UNVERIFIED",
    ]);

    if (!allowedStatuses.has(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction status.",
      });
    }

    const { startDate, endDate } = req.query;

    if (Boolean(startDate) !== Boolean(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Provide both startDate and endDate.",
      });
    }

    let start = null;
    let end = null;

    if (startDate && endDate) {
      if (
        !validDate(startDate) ||
        !validDate(endDate) ||
        startDate > endDate
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid date range.",
        });
      }

      if (
        daysBetween(startDate, endDate) >
        MAX_DATE_RANGE_DAYS
      ) {
        return res.status(400).json({
          success: false,
          message: "Date range cannot exceed 3660 days.",
        });
      }

      start = startIST(startDate);
      end = endExclusiveIST(endDate);
    }

    const filterStages = [
      {
        $match: {
          "payment.affiliateUserId":
            context.affiliateUserId,
        },
      },

      ...classificationStages,
    ];

    if (start && end) {
      filterStages.push(dateMatch(start, end));
    }

    // Exactly one transaction status per order.
    const stateExpression = {
      $switch: {
        branches: [
          {
            case: "$isRefunded",
            then: "REFUNDED",
          },
          {
            case: "$isFailed",
            then: "FAILED",
          },
          {
            case: "$isEarned",
            then: "EARNED",
          },
          {
            case: "$isPending",
            then: "PENDING",
          },
        ],
        default: "UNVERIFIED",
      },
    };

    filterStages.push({
      $addFields: {
        transactionState: stateExpression,
      },
    });

    if (status !== "ALL") {
      filterStages.push({
        $match: {
          transactionState: status,
        },
      });
    }

    const skip = (page - 1) * limit;

    const [result] = await Order.aggregate([
      ...filterStages,

      {
        $facet: {
          items: [
            {
              $sort: {
                eventAt: sort,
                _id: sort,
              },
            },

            { $skip: skip },

            { $limit: limit },

            safeOrderProjection,
          ],

          count: [
            { $count: "value" },
          ],

          totals: [
            metricGroup,
          ],
        },
      },
    ]);

    // PrepBuddy entries are merged in (they are EARNED or REFUNDED only).
    const includeArena = ["ALL", "EARNED", "REFUNDED"].includes(status);
    const arenaStart = start && end ? start : null;
    const arenaEnd = start && end ? end : null;

    const arenaStateFilter = status === "ALL" ? null : status;

    const [arenaCount, arenaTotals, arenaHead] = includeArena
      ? await Promise.all([
          ArenaEntry.countDocuments({
            ...arenaBase(context.affiliateUserId, arenaStart, arenaEnd),
            ...(arenaStateFilter === "EARNED" ? { $expr: { $not: [ARENA_FULLY_REFUNDED] } } : {}),
            ...(arenaStateFilter === "REFUNDED" ? { $expr: ARENA_FULLY_REFUNDED } : {}),
          }),
          arenaMetrics(context.affiliateUserId, arenaStart, arenaEnd, arenaStateFilter),
          // Enough from each source to fill this page after a date-ordered merge.
          arenaRecent(context.affiliateUserId, skip + limit, arenaStart, arenaEnd, arenaStateFilter, sort),
        ])
      : [0, null, []];

    const bookTotal = number(result?.count?.[0]?.value);
    const total = bookTotal + arenaCount;

    const pages = Math.ceil(total / limit);

    // Books were already paged by (skip, limit); to merge correctly, re-read
    // the leading (skip + limit) book rows when arena rows exist.
    let bookRows = result?.items || [];
    if (arenaHead.length) {
      const [head] = await Order.aggregate([
        ...filterStages,
        { $sort: { eventAt: sort, _id: sort } },
        { $limit: skip + limit },
        safeOrderProjection,
        { $group: { _id: null, items: { $push: "$$ROOT" } } },
      ]);
      bookRows = head?.items || [];
    }

    const merged = [...bookRows.map(cleanOrder), ...arenaHead].sort((a, b) =>
      sort === 1 ? -byDateDesc(a, b) : byDateDesc(a, b)
    );

    const rows = arenaHead.length
      ? merged.slice(skip, skip + limit)
      : merged;

    return res.status(200).json({
      success: true,

      data: {
        currency: "INR",
        timezone: TIMEZONE,

        filters: {
          status,
          startDate: startDate || null,
          endDate: endDate || null,
          sort: sort === 1 ? "asc" : "desc",
        },

        totals: arenaTotals
          ? mergeMetrics(normalizeMetrics(result?.totals?.[0]), arenaTotals)
          : normalizeMetrics(result?.totals?.[0]),

        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
          hasPrevious: page > 1,
        },

        orders: rows,
      },
    });
  } catch (error) {
    console.error("Affiliate orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve affiliate orders.",
    });
  }
};


/* =====================================================
   PREPBUDDY (ARENA) AFFILIATE TRANSACTIONS

   GET /api/affiliate/arena
       ?userId=AFFILIATE_ID   (admin only)
       &page=1&limit=15
       &startDate=YYYY-MM-DD&endDate=YYYY-MM-DD

   Privacy: only the amounts, commission and an opaque
   reference are returned. No member name, email, phone,
   alias, order id, payment id or gateway data.
===================================================== */

const ARENA_PAID_STATUSES = ["paid", "in_match", "consumed", "cancelling", "cancelled"];

export const getAffiliateArenaTransactions = async (req, res) => {
  try {
    const context = await getAffiliateContext(req);

    if (context.error) {
      return res.status(context.status).json({ success: false, message: context.error });
    }

    const page = parsePositiveInt(req.query.page, 1, 100000);
    const limit = parsePositiveInt(req.query.limit, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const { startDate, endDate } = req.query;

    if (Boolean(startDate) !== Boolean(endDate)) {
      return res.status(400).json({ success: false, message: "Provide both startDate and endDate." });
    }

    const match = {
      "affiliate.user": context.affiliateUserId,
      status: { $in: ARENA_PAID_STATUSES },
      paidAt: { $ne: null },
    };

    if (startDate && endDate) {
      if (!validDate(startDate) || !validDate(endDate) || startDate > endDate) {
        return res.status(400).json({ success: false, message: "Invalid date range." });
      }
      if (daysBetween(startDate, endDate) > MAX_DATE_RANGE_DAYS) {
        return res.status(400).json({ success: false, message: "Date range cannot exceed 3660 days." });
      }
      match.paidAt = { $gte: startIST(startDate), $lt: endExclusiveIST(endDate) };
    }

    const refundExpr = {
      $add: [{ $ifNull: ["$cancel.refundPaise", 0] }, { $ifNull: ["$refundedPaise", 0] }],
    };

    const [rows, totalsAgg] = await Promise.all([
      ArenaEntry.find(match)
        .sort({ paidAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("status paidAt paidPaise listPricePaise discountPaise refundedPaise cancel.refundPaise affiliate")
        .lean(),

      ArenaEntry.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            transactions: { $sum: 1 },
            sales: { $sum: "$paidPaise" },
            refunded: { $sum: refundExpr },
            grossCommission: { $sum: { $ifNull: ["$affiliate.commissionPaise", 0] } },
            netCommission: { $sum: NET_COMMISSION_EXPR },
          },
        },
      ]),
    ]);

    const t = totalsAgg[0] || {};
    const total = number(t.transactions);
    const pages = Math.ceil(total / limit);
    const rupees = (paise) => money(number(paise) / 100);

    return res.status(200).json({
      success: true,
      data: {
        currency: "INR",
        source: "PREPBUDDY",

        totals: {
          transactions: total,
          salesAmount: rupees(t.sales),
          refundedAmount: rupees(t.refunded),
          grossCommission: rupees(t.grossCommission),
          earnedCommission: rupees(t.netCommission),
        },

        pagination: { page, limit, total, pages, hasNext: page < pages, hasPrevious: page > 1 },

        transactions: rows.map((r) => {
          const c = commissionOf(r);
          return {
            // Opaque short reference; not usable to look anything up.
            reference: `PB-${String(r._id).slice(-8).toUpperCase()}`,
            date: r.paidAt,
            state: c ? c.status.toUpperCase() : "EARNED",
            amount: rupees(r.paidPaise),
            listAmount: rupees(r.listPricePaise),
            discountAmount: rupees(r.discountPaise),
            refundedAmount: rupees(number(r.refundedPaise) + number(r.cancel?.refundPaise)),
            commissionType: c ? c.type : null,
            commissionValue: c ? c.value : null,
            commissionGross: c ? rupees(c.grossPaise) : 0,
            commissionAmount: c ? rupees(c.netPaise) : 0,
          };
        }),
      },
    });
  } catch (error) {
    console.error("Affiliate arena transactions error:", error);
    return res.status(500).json({ success: false, message: "Unable to retrieve PrepBuddy transactions." });
  }
};
