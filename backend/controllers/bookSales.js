// import mongoose from "mongoose";
// import Order from "../models/Order.js";
// import Book from "../models/Book.js";

// const TIMEZONE = "Asia/Kolkata";
// const IST_OFFSET_MINUTES = 330;
// const IST_OFFSET_MS = IST_OFFSET_MINUTES * 60 * 1000;

// const VALID_GRANULARITIES = [
//   "hour",
//   "day",
//   "week",
//   "month",
//   "year",
// ];

// const round = (value) => {
//   return Number(Number(value || 0).toFixed(2));
// };

// const percentageChange = (current, previous) => {
//   current = Number(current || 0);
//   previous = Number(previous || 0);

//   if (previous === 0) {
//     return current === 0 ? 0 : null;
//   }

//   return round(((current - previous) / previous) * 100);
// };

// const isDateOnly = (value) => {
//   return /^\d{4}-\d{2}-\d{2}$/.test(value || "");
// };

// const getISTDateParts = (date = new Date()) => {
//   const istDate = new Date(date.getTime() + IST_OFFSET_MS);

//   return {
//     year: istDate.getUTCFullYear(),
//     month: istDate.getUTCMonth() + 1,
//     day: istDate.getUTCDate(),
//     hour: istDate.getUTCHours(),
//     minute: istDate.getUTCMinutes(),
//     second: istDate.getUTCSeconds(),
//     millisecond: istDate.getUTCMilliseconds(),
//   };
// };

// const getISTDateKey = (date = new Date()) => {
//   const parts = getISTDateParts(date);

//   return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(
//     parts.day
//   ).padStart(2, "0")}`;
// };

// const createISTDate = (
//   year,
//   month,
//   day,
//   hour = 0,
//   minute = 0,
//   second = 0,
//   millisecond = 0
// ) => {
//   return new Date(
//     Date.UTC(
//       year,
//       month - 1,
//       day,
//       hour,
//       minute,
//       second,
//       millisecond
//     ) - IST_OFFSET_MS
//   );
// };

// const parseISTDateStart = (value) => {
//   if (!isDateOnly(value)) {
//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//       throw new Error("Invalid date");
//     }

//     return date;
//   }

//   const [year, month, day] = value.split("-").map(Number);

//   const date = createISTDate(year, month, day);

//   if (Number.isNaN(date.getTime())) {
//     throw new Error("Invalid date");
//   }

//   return date;
// };

// const getNextISTDayStart = (value) => {
//   const date = parseISTDateStart(value);

//   const istWallClock = new Date(date.getTime() + IST_OFFSET_MS);

//   istWallClock.setUTCDate(istWallClock.getUTCDate() + 1);

//   return new Date(istWallClock.getTime() - IST_OFFSET_MS);
// };

// const getDaysInMonth = (year, monthIndex) => {
//   return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
// };

// const shiftISTMonths = (date, months) => {
//   const wallClock = new Date(date.getTime() + IST_OFFSET_MS);

//   const year = wallClock.getUTCFullYear();
//   const month = wallClock.getUTCMonth();
//   const day = wallClock.getUTCDate();

//   const targetMonthDate = new Date(Date.UTC(year, month + months, 1));

//   const targetYear = targetMonthDate.getUTCFullYear();
//   const targetMonth = targetMonthDate.getUTCMonth();

//   const maxDay = getDaysInMonth(targetYear, targetMonth);
//   const targetDay = Math.min(day, maxDay);

//   const result = Date.UTC(
//     targetYear,
//     targetMonth,
//     targetDay,
//     wallClock.getUTCHours(),
//     wallClock.getUTCMinutes(),
//     wallClock.getUTCSeconds(),
//     wallClock.getUTCMilliseconds()
//   );

//   return new Date(result - IST_OFFSET_MS);
// };

// const shiftISTYears = (date, years) => {
//   const wallClock = new Date(date.getTime() + IST_OFFSET_MS);

//   const targetYear = wallClock.getUTCFullYear() + years;
//   const month = wallClock.getUTCMonth();
//   const day = wallClock.getUTCDate();

//   const maxDay = getDaysInMonth(targetYear, month);
//   const targetDay = Math.min(day, maxDay);

//   const result = Date.UTC(
//     targetYear,
//     month,
//     targetDay,
//     wallClock.getUTCHours(),
//     wallClock.getUTCMinutes(),
//     wallClock.getUTCSeconds(),
//     wallClock.getUTCMilliseconds()
//   );

//   return new Date(result - IST_OFFSET_MS);
// };

// const getCurrentISTMonthStart = () => {
//   const now = new Date();
//   const parts = getISTDateParts(now);

//   return createISTDate(parts.year, parts.month, 1);
// };

// const getDateRanges = (query) => {
//   const now = new Date();
//   const todayIST = getISTDateKey(now);

//   const startDate = query.from
//     ? parseISTDateStart(query.from)
//     : getCurrentISTMonthStart();

//   let endDate;

//   if (!query.to) {
//     endDate = now;
//   } else if (isDateOnly(query.to)) {
//     if (query.to === todayIST) {
//       endDate = now;
//     } else {
//       endDate = getNextISTDayStart(query.to);
//     }
//   } else {
//     endDate = new Date(query.to);

//     if (Number.isNaN(endDate.getTime())) {
//       throw new Error("Invalid to date");
//     }
//   }

//   if (startDate >= endDate) {
//     throw new Error("from must be before to");
//   }

//   const duration = endDate.getTime() - startDate.getTime();

//   const previousPeriodEnd = new Date(startDate);

//   const previousPeriodStart = new Date(
//     startDate.getTime() - duration
//   );

//   const previousMonthStart = shiftISTMonths(startDate, -1);

//   const previousMonthEnd = shiftISTMonths(endDate, -1);

//   const previousYearStart = shiftISTYears(startDate, -1);

//   const previousYearEnd = shiftISTYears(endDate, -1);

//   return {
//     current: {
//       start: startDate,
//       end: endDate,
//     },

//     previousPeriod: {
//       start: previousPeriodStart,
//       end: previousPeriodEnd,
//     },

//     previousMonth: {
//       start: previousMonthStart,
//       end: previousMonthEnd,
//     },

//     previousYear: {
//       start: previousYearStart,
//       end: previousYearEnd,
//     },
//   };
// };

// const buildFilters = (query, overrides = {}) => {
//   const match = {};

//   const bookId = overrides.bookId || query.bookId;

//   const affiliateCode =
//     overrides.affiliateCode !== undefined
//       ? overrides.affiliateCode
//       : query.affiliateCode;

//   if (bookId) {
//     if (!mongoose.Types.ObjectId.isValid(bookId)) {
//       throw new Error("Invalid bookId");
//     }

//     match.bookId = new mongoose.Types.ObjectId(bookId);
//   }

//   if (query.provider) {
//     match["payment.provider"] = query.provider;
//   }

//   if (query.method) {
//     match["payment.method"] = query.method;
//   }

//   if (query.orderStatus) {
//     match.orderStatus = query.orderStatus;
//   }

//   if (query.paymentStatus) {
//     match["payment.status"] = query.paymentStatus;
//   }

//   match["book.currency"] = (
//     query.currency || "INR"
//   ).toUpperCase();

//   if (affiliateCode) {
//     if (affiliateCode.toUpperCase() === "DIRECT") {
//       match.$or = [
//         {
//           "payment.affiliateCode": null,
//         },
//         {
//           "payment.affiliateCode": "",
//         },
//         {
//           "payment.affiliateCode": {
//             $exists: false,
//           },
//         },
//       ];
//     } else {
//       match["payment.affiliateCode"] = affiliateCode.toLowerCase();
//     }
//   }

//   return match;
// };

// const paidMatch = (range) => {
//   return {
//     "payment.paidAt": {
//       $gte: range.start,
//       $lt: range.end,
//     },

//     "payment.status": {
//       $in: ["SUCCESS", "REFUNDED"],
//     },

//     orderStatus: {
//       $in: ["PAID", "REFUNDED"],
//     },
//   };
// };

// const summaryPipeline = (range) => {
//   return [
//     {
//       $match: paidMatch(range),
//     },

//     {
//       $set: {
//         affiliate: {
//           $trim: {
//             input: {
//               $ifNull: ["$payment.affiliateCode", ""],
//             },
//           },
//         },
//       },
//     },

//     {
//       $group: {
//         _id: null,

//         revenue: {
//           $sum: "$payment.amount",
//         },

//         orders: {
//           $sum: 1,
//         },

//         mrpValue: {
//           $sum: "$book.mrp",
//         },

//         listedValue: {
//           $sum: "$book.price",
//         },

//         affiliateRevenue: {
//           $sum: {
//             $cond: [
//               {
//                 $gt: [
//                   {
//                     $strLenCP: "$affiliate",
//                   },
//                   0,
//                 ],
//               },
//               "$payment.amount",
//               0,
//             ],
//           },
//         },

//         affiliateOrders: {
//           $sum: {
//             $cond: [
//               {
//                 $gt: [
//                   {
//                     $strLenCP: "$affiliate",
//                   },
//                   0,
//                 ],
//               },
//               1,
//               0,
//             ],
//           },
//         },

//         customers: {
//           $addToSet: {
//             $cond: [
//               {
//                 $and: [
//                   {
//                     $ne: ["$customer.email", null],
//                   },
//                   {
//                     $ne: ["$customer.email", ""],
//                   },
//                 ],
//               },
//               {
//                 $toLower: "$customer.email",
//               },
//               {
//                 $cond: [
//                   {
//                     $and: [
//                       {
//                         $ne: ["$customer.phone", null],
//                       },
//                       {
//                         $ne: ["$customer.phone", ""],
//                       },
//                     ],
//                   },
//                   "$customer.phone",
//                   null,
//                 ],
//               },
//             ],
//           },
//         },
//       },
//     },

//     {
//       $project: {
//         _id: 0,

//         revenue: 1,
//         orders: 1,
//         mrpValue: 1,
//         listedValue: 1,

//         affiliateRevenue: 1,
//         affiliateOrders: 1,

//         directRevenue: {
//           $subtract: ["$revenue", "$affiliateRevenue"],
//         },

//         directOrders: {
//           $subtract: ["$orders", "$affiliateOrders"],
//         },

//         uniqueCustomers: {
//           $size: {
//             $setDifference: ["$customers", [null]],
//           },
//         },

//         aov: {
//           $cond: [
//             {
//               $gt: ["$orders", 0],
//             },
//             {
//               $divide: ["$revenue", "$orders"],
//             },
//             0,
//           ],
//         },

//         discountVsMrp: {
//           $subtract: ["$mrpValue", "$revenue"],
//         },

//         discountVsListedPrice: {
//           $subtract: ["$listedValue", "$revenue"],
//         },
//       },
//     },
//   ];
// };

// const getDashboardData = async (query, overrides = {}) => {
//   const ranges = getDateRanges(query);

//   const timezone = TIMEZONE;

//   const granularity = VALID_GRANULARITIES.includes(query.granularity)
//     ? query.granularity
//     : "day";

//   const filters = buildFilters(query, overrides);

//   const affiliateExpression = {
//     $let: {
//       vars: {
//         affiliate: {
//           $trim: {
//             input: {
//               $ifNull: ["$payment.affiliateCode", ""],
//             },
//           },
//         },
//       },

//       in: {
//         $cond: [
//           {
//             $gt: [
//               {
//                 $strLenCP: "$$affiliate",
//               },
//               0,
//             ],
//           },
//           "$$affiliate",
//           "DIRECT",
//         ],
//       },
//     },
//   };

//   const pipeline = [
//     {
//       $match: filters,
//     },

//     {
//       $facet: {
//         summary: summaryPipeline(ranges.current),

//         previousPeriod: summaryPipeline(ranges.previousPeriod),

//         previousMonth: summaryPipeline(ranges.previousMonth),

//         previousYear: summaryPipeline(ranges.previousYear),

//         revenueTrend: [
//           {
//             $match: paidMatch(ranges.current),
//           },

//           {
//             $group: {
//               _id: {
//                 $dateTrunc: {
//                   date: "$payment.paidAt",
//                   unit: granularity,
//                   timezone,
//                 },
//               },

//               revenue: {
//                 $sum: "$payment.amount",
//               },

//               orders: {
//                 $sum: 1,
//               },
//             },
//           },

//           {
//             $project: {
//               _id: 0,

//               date: "$_id",

//               revenue: 1,

//               orders: 1,

//               aov: {
//                 $cond: [
//                   {
//                     $gt: ["$orders", 0],
//                   },
//                   {
//                     $divide: ["$revenue", "$orders"],
//                   },
//                   0,
//                 ],
//               },
//             },
//           },

//           {
//             $sort: {
//               date: 1,
//             },
//           },
//         ],

//         bookWise: [
//           {
//             $match: paidMatch(ranges.current),
//           },

//           {
//             $group: {
//               _id: "$bookId",

//               title: {
//                 $first: "$book.title",
//               },

//               currency: {
//                 $first: "$book.currency",
//               },

//               orders: {
//                 $sum: 1,
//               },

//               revenue: {
//                 $sum: "$payment.amount",
//               },

//               mrpValue: {
//                 $sum: "$book.mrp",
//               },

//               listedValue: {
//                 $sum: "$book.price",
//               },

//               affiliateRevenue: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $gt: [
//                         {
//                           $strLenCP: {
//                             $trim: {
//                               input: {
//                                 $ifNull: [
//                                   "$payment.affiliateCode",
//                                   "",
//                                 ],
//                               },
//                             },
//                           },
//                         },
//                         0,
//                       ],
//                     },
//                     "$payment.amount",
//                     0,
//                   ],
//                 },
//               },

//               affiliateOrders: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $gt: [
//                         {
//                           $strLenCP: {
//                             $trim: {
//                               input: {
//                                 $ifNull: [
//                                   "$payment.affiliateCode",
//                                   "",
//                                 ],
//                               },
//                             },
//                           },
//                         },
//                         0,
//                       ],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },
//             },
//           },

//           {
//             $lookup: {
//               from: Book.collection.name,
//               localField: "_id",
//               foreignField: "_id",
//               as: "bookDetails",
//             },
//           },

//           {
//             $set: {
//               bookDetails: {
//                 $arrayElemAt: ["$bookDetails", 0],
//               },
//             },
//           },

//           {
//             $setWindowFields: {
//               output: {
//                 totalDashboardRevenue: {
//                   $sum: "$revenue",

//                   window: {
//                     documents: ["unbounded", "unbounded"],
//                   },
//                 },
//               },
//             },
//           },

//           {
//             $project: {
//               _id: 0,

//               bookId: "$_id",

//               title: {
//                 $ifNull: ["$bookDetails.title", "$title"],
//               },

//               slug: "$bookDetails.slug",

//               pageKey: "$bookDetails.pageKey",

//               category: "$bookDetails.category",

//               coverPageUrl: "$bookDetails.coverPageUrl",

//               currency: 1,

//               orders: 1,

//               revenue: 1,

//               mrpValue: 1,

//               listedValue: 1,

//               affiliateRevenue: 1,

//               affiliateOrders: 1,

//               directRevenue: {
//                 $subtract: ["$revenue", "$affiliateRevenue"],
//               },

//               directOrders: {
//                 $subtract: ["$orders", "$affiliateOrders"],
//               },

//               aov: {
//                 $cond: [
//                   {
//                     $gt: ["$orders", 0],
//                   },
//                   {
//                     $divide: ["$revenue", "$orders"],
//                   },
//                   0,
//                 ],
//               },

//               discountGiven: {
//                 $subtract: ["$mrpValue", "$revenue"],
//               },

//               revenueShare: {
//                 $cond: [
//                   {
//                     $gt: ["$totalDashboardRevenue", 0],
//                   },
//                   {
//                     $multiply: [
//                       {
//                         $divide: [
//                           "$revenue",
//                           "$totalDashboardRevenue",
//                         ],
//                       },
//                       100,
//                     ],
//                   },
//                   0,
//                 ],
//               },
//             },
//           },

//           {
//             $sort: {
//               revenue: -1,
//             },
//           },
//         ],

//         bookDaily: [
//           {
//             $match: paidMatch(ranges.current),
//           },

//           {
//             $group: {
//               _id: {
//                 bookId: "$bookId",

//                 date: {
//                   $dateTrunc: {
//                     date: "$payment.paidAt",
//                     unit: granularity,
//                     timezone,
//                   },
//                 },
//               },

//               title: {
//                 $first: "$book.title",
//               },

//               revenue: {
//                 $sum: "$payment.amount",
//               },

//               orders: {
//                 $sum: 1,
//               },
//             },
//           },

//           {
//             $project: {
//               _id: 0,

//               bookId: "$_id.bookId",

//               date: "$_id.date",

//               title: 1,

//               revenue: 1,

//               orders: 1,
//             },
//           },

//           {
//             $sort: {
//               date: 1,
//               revenue: -1,
//             },
//           },
//         ],

//         affiliateWise: [
//           {
//             $match: paidMatch(ranges.current),
//           },

//           {
//             $set: {
//               affiliateCode: affiliateExpression,
//             },
//           },

//           {
//             $group: {
//               _id: "$affiliateCode",

//               orders: {
//                 $sum: 1,
//               },

//               revenue: {
//                 $sum: "$payment.amount",
//               },

//               books: {
//                 $addToSet: "$bookId",
//               },
//             },
//           },

//           {
//             $setWindowFields: {
//               output: {
//                 totalAffiliateRevenue: {
//                   $sum: "$revenue",

//                   window: {
//                     documents: ["unbounded", "unbounded"],
//                   },
//                 },
//               },
//             },
//           },

//           {
//             $project: {
//               _id: 0,

//               affiliateCode: "$_id",

//               orders: 1,

//               revenue: 1,

//               uniqueBooks: {
//                 $size: "$books",
//               },

//               aov: {
//                 $cond: [
//                   {
//                     $gt: ["$orders", 0],
//                   },
//                   {
//                     $divide: ["$revenue", "$orders"],
//                   },
//                   0,
//                 ],
//               },

//               revenueShare: {
//                 $cond: [
//                   {
//                     $gt: ["$totalAffiliateRevenue", 0],
//                   },
//                   {
//                     $multiply: [
//                       {
//                         $divide: [
//                           "$revenue",
//                           "$totalAffiliateRevenue",
//                         ],
//                       },
//                       100,
//                     ],
//                   },
//                   0,
//                 ],
//               },
//             },
//           },

//           {
//             $sort: {
//               revenue: -1,
//             },
//           },
//         ],

//         bookAffiliate: [
//           {
//             $match: paidMatch(ranges.current),
//           },

//           {
//             $set: {
//               affiliateCode: affiliateExpression,
//             },
//           },

//           {
//             $group: {
//               _id: {
//                 bookId: "$bookId",
//                 affiliateCode: "$affiliateCode",
//               },

//               title: {
//                 $first: "$book.title",
//               },

//               orders: {
//                 $sum: 1,
//               },

//               revenue: {
//                 $sum: "$payment.amount",
//               },
//             },
//           },

//           {
//             $project: {
//               _id: 0,

//               bookId: "$_id.bookId",

//               affiliateCode: "$_id.affiliateCode",

//               title: 1,

//               orders: 1,

//               revenue: 1,

//               aov: {
//                 $cond: [
//                   {
//                     $gt: ["$orders", 0],
//                   },
//                   {
//                     $divide: ["$revenue", "$orders"],
//                   },
//                   0,
//                 ],
//               },
//             },
//           },

//           {
//             $sort: {
//               revenue: -1,
//             },
//           },
//         ],

//         paymentFunnel: [
//           {
//             $match: {
//               createdAt: {
//                 $gte: ranges.current.start,
//                 $lt: ranges.current.end,
//               },
//             },
//           },

//           {
//             $group: {
//               _id: null,

//               totalOrders: {
//                 $sum: 1,
//               },

//               successfulOrders: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $in: [
//                         "$payment.status",
//                         ["SUCCESS", "REFUNDED"],
//                       ],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },

//               failedOrders: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $eq: ["$payment.status", "FAILED"],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },

//               pendingOrders: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $eq: ["$payment.status", "PENDING"],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },

//               cancelledOrders: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $eq: ["$payment.status", "CANCELLED"],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },

//               refundedOrders: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $eq: ["$payment.status", "REFUNDED"],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },
//             },
//           },

//           {
//             $project: {
//               _id: 0,
//             },
//           },
//         ],

//         refunds: [
//           {
//             $match: {
//               "payment.refundedAt": {
//                 $gte: ranges.current.start,
//                 $lt: ranges.current.end,
//               },
//             },
//           },

//           {
//             $group: {
//               _id: null,

//               orders: {
//                 $sum: 1,
//               },

//               amount: {
//                 $sum: "$payment.amount",
//               },
//             },
//           },

//           {
//             $project: {
//               _id: 0,
//             },
//           },
//         ],

//         paymentMethods: [
//           {
//             $match: {
//               createdAt: {
//                 $gte: ranges.current.start,
//                 $lt: ranges.current.end,
//               },
//             },
//           },

//           {
//             $group: {
//               _id: {
//                 $ifNull: ["$payment.method", "UNKNOWN"],
//               },

//               attempts: {
//                 $sum: 1,
//               },

//               successful: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $in: [
//                         "$payment.status",
//                         ["SUCCESS", "REFUNDED"],
//                       ],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },

//               failed: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $eq: ["$payment.status", "FAILED"],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },

//               revenue: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $in: [
//                         "$payment.status",
//                         ["SUCCESS", "REFUNDED"],
//                       ],
//                     },
//                     "$payment.amount",
//                     0,
//                   ],
//                 },
//               },
//             },
//           },

//           {
//             $project: {
//               _id: 0,

//               method: "$_id",

//               attempts: 1,

//               successful: 1,

//               failed: 1,

//               revenue: 1,

//               successRate: {
//                 $cond: [
//                   {
//                     $gt: ["$attempts", 0],
//                   },
//                   {
//                     $multiply: [
//                       {
//                         $divide: ["$successful", "$attempts"],
//                       },
//                       100,
//                     ],
//                   },
//                   0,
//                 ],
//               },
//             },
//           },

//           {
//             $sort: {
//               revenue: -1,
//             },
//           },
//         ],

//         verification: [
//           {
//             $match: paidMatch(ranges.current),
//           },

//           {
//             $group: {
//               _id: null,

//               total: {
//                 $sum: 1,
//               },

//               callbackVerified: {
//                 $sum: {
//                   $cond: [
//                     "$verification.callbackHashVerified",
//                     1,
//                     0,
//                   ],
//                 },
//               },

//               payuVerified: {
//                 $sum: {
//                   $cond: ["$verification.payuVerified", 1, 0],
//                 },
//               },

//               amountVerified: {
//                 $sum: {
//                   $cond: ["$verification.amountVerified", 1, 0],
//                 },
//               },

//               fullyVerified: {
//                 $sum: {
//                   $cond: [
//                     {
//                       $and: [
//                         "$verification.callbackHashVerified",
//                         "$verification.payuVerified",
//                         "$verification.amountVerified",
//                       ],
//                     },
//                     1,
//                     0,
//                   ],
//                 },
//               },
//             },
//           },

//           {
//             $project: {
//               _id: 0,

//               total: 1,

//               callbackVerified: 1,

//               payuVerified: 1,

//               amountVerified: 1,

//               fullyVerified: 1,

//               verificationRate: {
//                 $cond: [
//                   {
//                     $gt: ["$total", 0],
//                   },
//                   {
//                     $multiply: [
//                       {
//                         $divide: ["$fullyVerified", "$total"],
//                       },
//                       100,
//                     ],
//                   },
//                   0,
//                 ],
//               },
//             },
//           },
//         ],

//         utmSources: [
//           {
//             $match: paidMatch(ranges.current),
//           },

//           {
//             $group: {
//               _id: {
//                 $ifNull: ["$metadata.utmSource", "DIRECT"],
//               },

//               orders: {
//                 $sum: 1,
//               },

//               revenue: {
//                 $sum: "$payment.amount",
//               },
//             },
//           },

//           {
//             $project: {
//               _id: 0,

//               source: "$_id",

//               orders: 1,

//               revenue: 1,
//             },
//           },

//           {
//             $sort: {
//               revenue: -1,
//             },
//           },
//         ],

//         utmMediums: [
//           {
//             $match: paidMatch(ranges.current),
//           },

//           {
//             $group: {
//               _id: {
//                 $ifNull: ["$metadata.utmMedium", "UNATTRIBUTED"],
//               },

//               orders: {
//                 $sum: 1,
//               },

//               revenue: {
//                 $sum: "$payment.amount",
//               },
//             },
//           },

//           {
//             $project: {
//               _id: 0,

//               medium: "$_id",

//               orders: 1,

//               revenue: 1,
//             },
//           },

//           {
//             $sort: {
//               revenue: -1,
//             },
//           },
//         ],

//         utmCampaigns: [
//           {
//             $match: paidMatch(ranges.current),
//           },

//           {
//             $group: {
//               _id: {
//                 $ifNull: ["$metadata.utmCampaign", "UNATTRIBUTED"],
//               },

//               orders: {
//                 $sum: 1,
//               },

//               revenue: {
//                 $sum: "$payment.amount",
//               },
//             },
//           },

//           {
//             $project: {
//               _id: 0,

//               campaign: "$_id",

//               orders: 1,

//               revenue: 1,
//             },
//           },

//           {
//             $sort: {
//               revenue: -1,
//             },
//           },
//         ],

//         dayOfWeek: [
//           {
//             $match: paidMatch(ranges.current),
//           },

//           {
//             $group: {
//               _id: {
//                 $dayOfWeek: {
//                   date: "$payment.paidAt",
//                   timezone,
//                 },
//               },

//               orders: {
//                 $sum: 1,
//               },

//               revenue: {
//                 $sum: "$payment.amount",
//               },
//             },
//           },

//           {
//             $project: {
//               _id: 0,

//               day: "$_id",

//               orders: 1,

//               revenue: 1,
//             },
//           },

//           {
//             $sort: {
//               day: 1,
//             },
//           },
//         ],

//         hourOfDay: [
//           {
//             $match: paidMatch(ranges.current),
//           },

//           {
//             $group: {
//               _id: {
//                 $hour: {
//                   date: "$payment.paidAt",
//                   timezone,
//                 },
//               },

//               orders: {
//                 $sum: 1,
//               },

//               revenue: {
//                 $sum: "$payment.amount",
//               },
//             },
//           },

//           {
//             $project: {
//               _id: 0,

//               hour: "$_id",

//               orders: 1,

//               revenue: 1,
//             },
//           },

//           {
//             $sort: {
//               hour: 1,
//             },
//           },
//         ],

//         monthlyTrend: [
//           {
//             $match: paidMatch(ranges.current),
//           },

//           {
//             $group: {
//               _id: {
//                 $dateTrunc: {
//                   date: "$payment.paidAt",
//                   unit: "month",
//                   timezone,
//                 },
//               },

//               orders: {
//                 $sum: 1,
//               },

//               revenue: {
//                 $sum: "$payment.amount",
//               },
//             },
//           },

//           {
//             $project: {
//               _id: 0,

//               month: "$_id",

//               orders: 1,

//               revenue: 1,
//             },
//           },

//           {
//             $sort: {
//               month: 1,
//             },
//           },
//         ],

//         dayWiseCurrentMonth: [
//           {
//             $match: paidMatch(ranges.current),
//           },

//           {
//             $group: {
//               _id: {
//                 $dayOfMonth: {
//                   date: "$payment.paidAt",
//                   timezone,
//                 },
//               },

//               revenue: {
//                 $sum: "$payment.amount",
//               },

//               orders: {
//                 $sum: 1,
//               },
//             },
//           },

//           {
//             $project: {
//               _id: 0,

//               day: "$_id",

//               revenue: 1,

//               orders: 1,
//             },
//           },

//           {
//             $sort: {
//               day: 1,
//             },
//           },
//         ],

//         dayWisePreviousMonth: [
//           {
//             $match: paidMatch(ranges.previousMonth),
//           },

//           {
//             $group: {
//               _id: {
//                 $dayOfMonth: {
//                   date: "$payment.paidAt",
//                   timezone,
//                 },
//               },

//               revenue: {
//                 $sum: "$payment.amount",
//               },

//               orders: {
//                 $sum: 1,
//               },
//             },
//           },

//           {
//             $project: {
//               _id: 0,

//               day: "$_id",

//               revenue: 1,

//               orders: 1,
//             },
//           },

//           {
//             $sort: {
//               day: 1,
//             },
//           },
//         ],
//       },
//     },
//   ];

//   const [result] = await Order.aggregate(pipeline).allowDiskUse(true);

//   const emptySummary = {
//     revenue: 0,
//     orders: 0,
//     mrpValue: 0,
//     listedValue: 0,
//     affiliateRevenue: 0,
//     affiliateOrders: 0,
//     directRevenue: 0,
//     directOrders: 0,
//     uniqueCustomers: 0,
//     aov: 0,
//     discountVsMrp: 0,
//     discountVsListedPrice: 0,
//   };

//   const summary = result.summary?.[0] || emptySummary;

//   const previousPeriod =
//     result.previousPeriod?.[0] || emptySummary;

//   const previousMonth =
//     result.previousMonth?.[0] || emptySummary;

//   const previousYear =
//     result.previousYear?.[0] || emptySummary;

//   const refund = result.refunds?.[0] || {
//     orders: 0,
//     amount: 0,
//   };

//   const paymentFunnel = result.paymentFunnel?.[0] || {
//     totalOrders: 0,
//     successfulOrders: 0,
//     failedOrders: 0,
//     pendingOrders: 0,
//     cancelledOrders: 0,
//     refundedOrders: 0,
//   };

//   const buildComparison = (previous) => {
//     return {
//       current: {
//         revenue: round(summary.revenue),
//         orders: summary.orders || 0,
//         aov: round(summary.aov),
//       },

//       previous: {
//         revenue: round(previous.revenue),
//         orders: previous.orders || 0,
//         aov: round(previous.aov),
//       },

//       change: {
//         revenue: round(
//           summary.revenue - previous.revenue
//         ),

//         orders:
//           summary.orders - previous.orders,

//         revenuePercent: percentageChange(
//           summary.revenue,
//           previous.revenue
//         ),

//         ordersPercent: percentageChange(
//           summary.orders,
//           previous.orders
//         ),

//         aovPercent: percentageChange(
//           summary.aov,
//           previous.aov
//         ),
//       },
//     };
//   };

//   const currentDayMap = new Map(
//     (result.dayWiseCurrentMonth || []).map((item) => [
//       item.day,
//       item,
//     ])
//   );

//   const previousDayMap = new Map(
//     (result.dayWisePreviousMonth || []).map((item) => [
//       item.day,
//       item,
//     ])
//   );

//   const days = [
//     ...new Set([
//       ...currentDayMap.keys(),
//       ...previousDayMap.keys(),
//     ]),
//   ].sort((a, b) => a - b);

//   const monthDayComparison = days.map((day) => {
//     const current = currentDayMap.get(day) || {
//       revenue: 0,
//       orders: 0,
//     };

//     const previous = previousDayMap.get(day) || {
//       revenue: 0,
//       orders: 0,
//     };

//     return {
//       day,

//       currentRevenue: round(current.revenue),

//       previousRevenue: round(previous.revenue),

//       currentOrders: current.orders || 0,

//       previousOrders: previous.orders || 0,

//       revenueGrowth: percentageChange(
//         current.revenue,
//         previous.revenue
//       ),

//       ordersGrowth: percentageChange(
//         current.orders,
//         previous.orders
//       ),
//     };
//   });

//   const totalAttempts =
//     paymentFunnel.totalOrders || 0;

//   return {
//     filters: {
//       from: ranges.current.start,
//       to: ranges.current.end,

//       fromIST: getISTDateKey(
//         ranges.current.start
//       ),

//       toIST: getISTDateKey(
//         ranges.current.end
//       ),

//       timezone,

//       granularity,

//       bookId:
//         overrides.bookId ||
//         query.bookId ||
//         null,

//       affiliateCode:
//         overrides.affiliateCode ??
//         query.affiliateCode ??
//         null,

//       provider:
//         query.provider || null,

//       method:
//         query.method || null,

//       currency: (
//         query.currency || "INR"
//       ).toUpperCase(),
//     },

//     summary: {
//       revenue: round(summary.revenue),

//       grossRevenue: round(
//         summary.revenue
//       ),

//       estimatedNetRevenue: round(
//         summary.revenue - refund.amount
//       ),

//       orders:
//         summary.orders || 0,

//       aov: round(summary.aov),

//       mrpValue: round(
//         summary.mrpValue
//       ),

//       listedValue: round(
//         summary.listedValue
//       ),

//       discountVsMrp: round(
//         summary.discountVsMrp
//       ),

//       discountVsListedPrice: round(
//         summary.discountVsListedPrice
//       ),

//       affiliateRevenue: round(
//         summary.affiliateRevenue
//       ),

//       affiliateOrders:
//         summary.affiliateOrders || 0,

//       directRevenue: round(
//         summary.directRevenue
//       ),

//       directOrders:
//         summary.directOrders || 0,

//       uniqueCustomers:
//         summary.uniqueCustomers || 0,

//       refundedOrders:
//         refund.orders || 0,

//       estimatedRefundAmount:
//         round(refund.amount),
//     },

//     comparison: {
//       previousPeriod:
//         buildComparison(previousPeriod),

//       previousMonth:
//         buildComparison(previousMonth),

//       previousYear:
//         buildComparison(previousYear),
//     },

//     paymentFunnel: {
//       ...paymentFunnel,

//       successRate:
//         totalAttempts > 0
//           ? round(
//               (paymentFunnel.successfulOrders /
//                 totalAttempts) *
//                 100
//             )
//           : 0,

//       failureRate:
//         totalAttempts > 0
//           ? round(
//               (paymentFunnel.failedOrders /
//                 totalAttempts) *
//                 100
//             )
//           : 0,
//     },

//     revenueTrend:
//       result.revenueTrend || [],

//     bookWise:
//       result.bookWise || [],

//     bookDaily:
//       result.bookDaily || [],

//     affiliateWise:
//       result.affiliateWise || [],

//     bookAffiliate:
//       result.bookAffiliate || [],

//     paymentMethods:
//       result.paymentMethods || [],

//     verification:
//       result.verification?.[0] || {
//         total: 0,
//         callbackVerified: 0,
//         payuVerified: 0,
//         amountVerified: 0,
//         fullyVerified: 0,
//         verificationRate: 0,
//       },

//     attribution: {
//       utmSources:
//         result.utmSources || [],

//       utmMediums:
//         result.utmMediums || [],

//       utmCampaigns:
//         result.utmCampaigns || [],
//     },

//     timeAnalytics: {
//       dayOfWeek:
//         result.dayOfWeek || [],

//       hourOfDay:
//         result.hourOfDay || [],

//       monthlyTrend:
//         result.monthlyTrend || [],

//       monthDayComparison,
//     },
//   };
// };

// export const getSalesDashboard = async (
//   req,
//   res
// ) => {
//   try {
//     const data =
//       await getDashboardData(req.query);

//     return res.status(200).json({
//       success: true,
//       data,
//     });
//   } catch (error) {
//     return res.status(400).json({
//       success: false,
//       message:
//         error.message ||
//         "Failed to fetch dashboard",
//     });
//   }
// };

// export const getBookSalesDashboard =
//   async (req, res) => {
//     try {
//       const data =
//         await getDashboardData(
//           req.query,
//           {
//             bookId: req.params.bookId,
//           }
//         );

//       return res.status(200).json({
//         success: true,
//         data,
//       });
//     } catch (error) {
//       return res.status(400).json({
//         success: false,
//         message:
//           error.message ||
//           "Failed to fetch book analytics",
//       });
//     }
//   };

// export const getAffiliateSalesDashboard =
//   async (req, res) => {
//     try {
//       const data =
//         await getDashboardData(
//           req.query,
//           {
//             affiliateCode:
//               req.params.affiliateCode,
//           }
//         );

//       return res.status(200).json({
//         success: true,
//         data,
//       });
//     } catch (error) {
//       return res.status(400).json({
//         success: false,
//         message:
//           error.message ||
//           "Failed to fetch affiliate analytics",
//       });
//     }
//   };

import mongoose from "mongoose";
import Order from "../models/Order.js";
import Book from "../models/Book.js";

const TIMEZONE = "Asia/Kolkata";
const IST_OFFSET_MINUTES = 330;
const IST_OFFSET_MS = IST_OFFSET_MINUTES * 60 * 1000;

const VALID_GRANULARITIES = [
  "hour",
  "day",
  "week",
  "month",
  "year",
];

const round = (value) => {
  return Number(Number(value || 0).toFixed(2));
};

const percentageChange = (current, previous) => {
  current = Number(current || 0);
  previous = Number(previous || 0);

  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return round(((current - previous) / previous) * 100);
};

const isDateOnly = (value) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || "");
};

const getISTDateParts = (date = new Date()) => {
  const istDate = new Date(date.getTime() + IST_OFFSET_MS);

  return {
    year: istDate.getUTCFullYear(),
    month: istDate.getUTCMonth() + 1,
    day: istDate.getUTCDate(),
    hour: istDate.getUTCHours(),
    minute: istDate.getUTCMinutes(),
    second: istDate.getUTCSeconds(),
    millisecond: istDate.getUTCMilliseconds(),
  };
};

const getISTDateKey = (date = new Date()) => {
  const parts = getISTDateParts(date);

  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(
    parts.day
  ).padStart(2, "0")}`;
};

const createISTDate = (
  year,
  month,
  day,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0
) => {
  return new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
      millisecond
    ) - IST_OFFSET_MS
  );
};

const parseISTDateStart = (value) => {
  if (!isDateOnly(value)) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }

    return date;
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = createISTDate(year, month, day);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  return date;
};

const getNextISTDayStart = (value) => {
  const date = parseISTDateStart(value);

  const istWallClock = new Date(date.getTime() + IST_OFFSET_MS);

  istWallClock.setUTCDate(istWallClock.getUTCDate() + 1);

  return new Date(istWallClock.getTime() - IST_OFFSET_MS);
};

const getDaysInMonth = (year, monthIndex) => {
  return new Date(
    Date.UTC(year, monthIndex + 1, 0)
  ).getUTCDate();
};

const shiftISTMonths = (date, months) => {
  const wallClock = new Date(
    date.getTime() + IST_OFFSET_MS
  );

  const year = wallClock.getUTCFullYear();
  const month = wallClock.getUTCMonth();
  const day = wallClock.getUTCDate();

  const targetMonthDate = new Date(
    Date.UTC(year, month + months, 1)
  );

  const targetYear =
    targetMonthDate.getUTCFullYear();

  const targetMonth =
    targetMonthDate.getUTCMonth();

  const maxDay = getDaysInMonth(
    targetYear,
    targetMonth
  );

  const targetDay = Math.min(
    day,
    maxDay
  );

  const result = Date.UTC(
    targetYear,
    targetMonth,
    targetDay,
    wallClock.getUTCHours(),
    wallClock.getUTCMinutes(),
    wallClock.getUTCSeconds(),
    wallClock.getUTCMilliseconds()
  );

  return new Date(
    result - IST_OFFSET_MS
  );
};

const shiftISTYears = (date, years) => {
  const wallClock = new Date(
    date.getTime() + IST_OFFSET_MS
  );

  const targetYear =
    wallClock.getUTCFullYear() + years;

  const month =
    wallClock.getUTCMonth();

  const day =
    wallClock.getUTCDate();

  const maxDay = getDaysInMonth(
    targetYear,
    month
  );

  const targetDay = Math.min(
    day,
    maxDay
  );

  const result = Date.UTC(
    targetYear,
    month,
    targetDay,
    wallClock.getUTCHours(),
    wallClock.getUTCMinutes(),
    wallClock.getUTCSeconds(),
    wallClock.getUTCMilliseconds()
  );

  return new Date(
    result - IST_OFFSET_MS
  );
};

const getCurrentISTMonthStart = () => {
  const now = new Date();

  const parts =
    getISTDateParts(now);

  return createISTDate(
    parts.year,
    parts.month,
    1
  );
};

const getDateRanges = (query) => {
  const now = new Date();

  const todayIST =
    getISTDateKey(now);

  const startDate = query.from
    ? parseISTDateStart(query.from)
    : getCurrentISTMonthStart();

  let endDate;

  if (!query.to) {
    endDate = now;
  } else if (isDateOnly(query.to)) {
    if (query.to === todayIST) {
      endDate = now;
    } else {
      endDate =
        getNextISTDayStart(query.to);
    }
  } else {
    endDate = new Date(query.to);

    if (
      Number.isNaN(
        endDate.getTime()
      )
    ) {
      throw new Error(
        "Invalid to date"
      );
    }
  }

  if (startDate >= endDate) {
    throw new Error(
      "from must be before to"
    );
  }

  const duration =
    endDate.getTime() -
    startDate.getTime();

  const previousPeriodEnd =
    new Date(startDate);

  const previousPeriodStart =
    new Date(
      startDate.getTime() -
        duration
    );

  const previousMonthStart =
    shiftISTMonths(
      startDate,
      -1
    );

  const previousMonthEnd =
    shiftISTMonths(
      endDate,
      -1
    );

  const previousYearStart =
    shiftISTYears(
      startDate,
      -1
    );

  const previousYearEnd =
    shiftISTYears(
      endDate,
      -1
    );

  return {
    current: {
      start: startDate,
      end: endDate,
    },

    previousPeriod: {
      start: previousPeriodStart,
      end: previousPeriodEnd,
    },

    previousMonth: {
      start: previousMonthStart,
      end: previousMonthEnd,
    },

    previousYear: {
      start: previousYearStart,
      end: previousYearEnd,
    },
  };
};

const normalizedAffiliateExpression = {
  $toLower: {
    $trim: {
      input: {
        $ifNull: [
          "$payment.affiliateCode",
          "",
        ],
      },
    },
  },
};

const isAffiliateSaleExpression = {
  $and: [
    {
      $ne: [
        normalizedAffiliateExpression,
        "",
      ],
    },
    {
      $ne: [
        normalizedAffiliateExpression,
        "tt",
      ],
    },
  ],
};

const affiliateExpression = {
  $let: {
    vars: {
      affiliate:
        normalizedAffiliateExpression,
    },

    in: {
      $cond: [
        {
          $or: [
            {
              $eq: [
                "$$affiliate",
                "",
              ],
            },
            {
              $eq: [
                "$$affiliate",
                "tt",
              ],
            },
          ],
        },
        "DIRECT",
        "$$affiliate",
      ],
    },
  },
};

const buildFilters = (
  query,
  overrides = {}
) => {
  const match = {};

  const bookId =
    overrides.bookId ||
    query.bookId;

  const affiliateCode =
    overrides.affiliateCode !==
    undefined
      ? overrides.affiliateCode
      : query.affiliateCode;

  if (bookId) {
    if (
      !mongoose.Types.ObjectId.isValid(
        bookId
      )
    ) {
      throw new Error(
        "Invalid bookId"
      );
    }

    match.bookId =
      new mongoose.Types.ObjectId(
        bookId
      );
  }

  if (query.provider) {
    match["payment.provider"] =
      query.provider;
  }

  if (query.method) {
    match["payment.method"] =
      query.method;
  }

  if (query.orderStatus) {
    match.orderStatus =
      query.orderStatus;
  }

  if (query.paymentStatus) {
    match["payment.status"] =
      query.paymentStatus;
  }

  match["book.currency"] = (
    query.currency || "INR"
  ).toUpperCase();

  if (affiliateCode) {
    const normalized =
      String(
        affiliateCode
      )
        .trim()
        .toLowerCase();

    if (
      normalized === "direct" ||
      normalized === "tt"
    ) {
      match.$or = [
        {
          "payment.affiliateCode":
            null,
        },
        {
          "payment.affiliateCode":
            "",
        },
        {
          "payment.affiliateCode":
            "tt",
        },
        {
          "payment.affiliateCode":
            /^tt$/i,
        },
        {
          "payment.affiliateCode": {
            $exists: false,
          },
        },
      ];
    } else {
      match[
        "payment.affiliateCode"
      ] = normalized;
    }
  }

  return match;
};

const paidMatch = (range) => {
  return {
    "payment.paidAt": {
      $gte: range.start,
      $lt: range.end,
    },

    "payment.status": {
      $in: [
        "SUCCESS",
        "REFUNDED",
      ],
    },

    orderStatus: {
      $in: [
        "PAID",
        "REFUNDED",
      ],
    },
  };
};

const summaryPipeline = (
  range
) => {
  return [
    {
      $match: paidMatch(range),
    },

    {
      $set: {
        normalizedAffiliate:
          normalizedAffiliateExpression,
      },
    },

    {
      $set: {
        isAffiliateSale: {
          $and: [
            {
              $ne: [
                "$normalizedAffiliate",
                "",
              ],
            },
            {
              $ne: [
                "$normalizedAffiliate",
                "tt",
              ],
            },
          ],
        },
      },
    },

    {
      $group: {
        _id: null,

        revenue: {
          $sum:
            "$payment.amount",
        },

        orders: {
          $sum: 1,
        },

        mrpValue: {
          $sum:
            "$book.mrp",
        },

        listedValue: {
          $sum:
            "$book.price",
        },

        affiliateRevenue: {
          $sum: {
            $cond: [
              "$isAffiliateSale",
              "$payment.amount",
              0,
            ],
          },
        },

        affiliateOrders: {
          $sum: {
            $cond: [
              "$isAffiliateSale",
              1,
              0,
            ],
          },
        },

        customers: {
          $addToSet: {
            $cond: [
              {
                $and: [
                  {
                    $ne: [
                      "$customer.email",
                      null,
                    ],
                  },
                  {
                    $ne: [
                      "$customer.email",
                      "",
                    ],
                  },
                ],
              },
              {
                $toLower:
                  "$customer.email",
              },
              {
                $cond: [
                  {
                    $and: [
                      {
                        $ne: [
                          "$customer.phone",
                          null,
                        ],
                      },
                      {
                        $ne: [
                          "$customer.phone",
                          "",
                        ],
                      },
                    ],
                  },
                  "$customer.phone",
                  null,
                ],
              },
            ],
          },
        },
      },
    },

    {
      $project: {
        _id: 0,

        revenue: 1,
        orders: 1,
        mrpValue: 1,
        listedValue: 1,

        affiliateRevenue: 1,
        affiliateOrders: 1,

        directRevenue: {
          $subtract: [
            "$revenue",
            "$affiliateRevenue",
          ],
        },

        directOrders: {
          $subtract: [
            "$orders",
            "$affiliateOrders",
          ],
        },

        uniqueCustomers: {
          $size: {
            $setDifference: [
              "$customers",
              [null],
            ],
          },
        },

        aov: {
          $cond: [
            {
              $gt: [
                "$orders",
                0,
              ],
            },
            {
              $divide: [
                "$revenue",
                "$orders",
              ],
            },
            0,
          ],
        },

        discountVsMrp: {
          $subtract: [
            "$mrpValue",
            "$revenue",
          ],
        },

        discountVsListedPrice: {
          $subtract: [
            "$listedValue",
            "$revenue",
          ],
        },
      },
    },
  ];
};

const getDashboardData = async (
  query,
  overrides = {}
) => {
  const ranges =
    getDateRanges(query);

  const timezone = TIMEZONE;

  const granularity =
    VALID_GRANULARITIES.includes(
      query.granularity
    )
      ? query.granularity
      : "day";

  const filters =
    buildFilters(
      query,
      overrides
    );

  const pipeline = [
    {
      $match: filters,
    },

    {
      $facet: {
        summary:
          summaryPipeline(
            ranges.current
          ),

        previousPeriod:
          summaryPipeline(
            ranges.previousPeriod
          ),

        previousMonth:
          summaryPipeline(
            ranges.previousMonth
          ),

        previousYear:
          summaryPipeline(
            ranges.previousYear
          ),

        revenueTrend: [
          {
            $match:
              paidMatch(
                ranges.current
              ),
          },

          {
            $group: {
              _id: {
                $dateTrunc: {
                  date:
                    "$payment.paidAt",
                  unit:
                    granularity,
                  timezone,
                },
              },

              revenue: {
                $sum:
                  "$payment.amount",
              },

              orders: {
                $sum: 1,
              },
            },
          },

          {
            $project: {
              _id: 0,

              date: "$_id",

              revenue: 1,

              orders: 1,

              aov: {
                $cond: [
                  {
                    $gt: [
                      "$orders",
                      0,
                    ],
                  },
                  {
                    $divide: [
                      "$revenue",
                      "$orders",
                    ],
                  },
                  0,
                ],
              },
            },
          },

          {
            $sort: {
              date: 1,
            },
          },
        ],

        bookWise: [
          {
            $match:
              paidMatch(
                ranges.current
              ),
          },

          {
            $group: {
              _id: "$bookId",

              title: {
                $first:
                  "$book.title",
              },

              currency: {
                $first:
                  "$book.currency",
              },

              orders: {
                $sum: 1,
              },

              revenue: {
                $sum:
                  "$payment.amount",
              },

              mrpValue: {
                $sum:
                  "$book.mrp",
              },

              listedValue: {
                $sum:
                  "$book.price",
              },

              affiliateRevenue: {
                $sum: {
                  $cond: [
                    isAffiliateSaleExpression,
                    "$payment.amount",
                    0,
                  ],
                },
              },

              affiliateOrders: {
                $sum: {
                  $cond: [
                    isAffiliateSaleExpression,
                    1,
                    0,
                  ],
                },
              },
            },
          },

          {
            $lookup: {
              from:
                Book.collection.name,

              localField:
                "_id",

              foreignField:
                "_id",

              as:
                "bookDetails",
            },
          },

          {
            $set: {
              bookDetails: {
                $arrayElemAt: [
                  "$bookDetails",
                  0,
                ],
              },
            },
          },

          {
            $setWindowFields: {
              output: {
                totalDashboardRevenue:
                  {
                    $sum:
                      "$revenue",

                    window: {
                      documents: [
                        "unbounded",
                        "unbounded",
                      ],
                    },
                  },
              },
            },
          },

          {
            $project: {
              _id: 0,

              bookId:
                "$_id",

              title: {
                $ifNull: [
                  "$bookDetails.title",
                  "$title",
                ],
              },

              slug:
                "$bookDetails.slug",

              pageKey:
                "$bookDetails.pageKey",

              category:
                "$bookDetails.category",

              coverPageUrl:
                "$bookDetails.coverPageUrl",

              currency: 1,

              orders: 1,

              revenue: 1,

              mrpValue: 1,

              listedValue: 1,

              affiliateRevenue: 1,

              affiliateOrders: 1,

              directRevenue: {
                $subtract: [
                  "$revenue",
                  "$affiliateRevenue",
                ],
              },

              directOrders: {
                $subtract: [
                  "$orders",
                  "$affiliateOrders",
                ],
              },

              aov: {
                $cond: [
                  {
                    $gt: [
                      "$orders",
                      0,
                    ],
                  },
                  {
                    $divide: [
                      "$revenue",
                      "$orders",
                    ],
                  },
                  0,
                ],
              },

              discountGiven: {
                $subtract: [
                  "$mrpValue",
                  "$revenue",
                ],
              },

              revenueShare: {
                $cond: [
                  {
                    $gt: [
                      "$totalDashboardRevenue",
                      0,
                    ],
                  },
                  {
                    $multiply: [
                      {
                        $divide: [
                          "$revenue",
                          "$totalDashboardRevenue",
                        ],
                      },
                      100,
                    ],
                  },
                  0,
                ],
              },
            },
          },

          {
            $sort: {
              revenue: -1,
            },
          },
        ],

        bookDaily: [
          {
            $match:
              paidMatch(
                ranges.current
              ),
          },

          {
            $group: {
              _id: {
                bookId:
                  "$bookId",

                date: {
                  $dateTrunc: {
                    date:
                      "$payment.paidAt",

                    unit:
                      granularity,

                    timezone,
                  },
                },
              },

              title: {
                $first:
                  "$book.title",
              },

              revenue: {
                $sum:
                  "$payment.amount",
              },

              orders: {
                $sum: 1,
              },
            },
          },

          {
            $project: {
              _id: 0,

              bookId:
                "$_id.bookId",

              date:
                "$_id.date",

              title: 1,

              revenue: 1,

              orders: 1,
            },
          },

          {
            $sort: {
              date: 1,
              revenue: -1,
            },
          },
        ],

        affiliateWise: [
          {
            $match:
              paidMatch(
                ranges.current
              ),
          },

          {
            $set: {
              affiliateCode:
                affiliateExpression,
            },
          },

          {
            $group: {
              _id:
                "$affiliateCode",

              orders: {
                $sum: 1,
              },

              revenue: {
                $sum:
                  "$payment.amount",
              },

              books: {
                $addToSet:
                  "$bookId",
              },
            },
          },

          {
            $setWindowFields: {
              output: {
                totalAffiliateRevenue:
                  {
                    $sum:
                      "$revenue",

                    window: {
                      documents: [
                        "unbounded",
                        "unbounded",
                      ],
                    },
                  },
              },
            },
          },

          {
            $project: {
              _id: 0,

              affiliateCode:
                "$_id",

              orders: 1,

              revenue: 1,

              uniqueBooks: {
                $size:
                  "$books",
              },

              aov: {
                $cond: [
                  {
                    $gt: [
                      "$orders",
                      0,
                    ],
                  },
                  {
                    $divide: [
                      "$revenue",
                      "$orders",
                    ],
                  },
                  0,
                ],
              },

              revenueShare: {
                $cond: [
                  {
                    $gt: [
                      "$totalAffiliateRevenue",
                      0,
                    ],
                  },
                  {
                    $multiply: [
                      {
                        $divide: [
                          "$revenue",
                          "$totalAffiliateRevenue",
                        ],
                      },
                      100,
                    ],
                  },
                  0,
                ],
              },
            },
          },

          {
            $sort: {
              revenue: -1,
            },
          },
        ],

        bookAffiliate: [
          {
            $match:
              paidMatch(
                ranges.current
              ),
          },

          {
            $set: {
              affiliateCode:
                affiliateExpression,
            },
          },

          {
            $group: {
              _id: {
                bookId:
                  "$bookId",

                affiliateCode:
                  "$affiliateCode",
              },

              title: {
                $first:
                  "$book.title",
              },

              orders: {
                $sum: 1,
              },

              revenue: {
                $sum:
                  "$payment.amount",
              },
            },
          },

          {
            $project: {
              _id: 0,

              bookId:
                "$_id.bookId",

              affiliateCode:
                "$_id.affiliateCode",

              title: 1,

              orders: 1,

              revenue: 1,

              aov: {
                $cond: [
                  {
                    $gt: [
                      "$orders",
                      0,
                    ],
                  },
                  {
                    $divide: [
                      "$revenue",
                      "$orders",
                    ],
                  },
                  0,
                ],
              },
            },
          },

          {
            $sort: {
              revenue: -1,
            },
          },
        ],

        paymentFunnel: [
          {
            $match: {
              createdAt: {
                $gte:
                  ranges.current
                    .start,

                $lt:
                  ranges.current
                    .end,
              },
            },
          },

          {
            $group: {
              _id: null,

              totalOrders: {
                $sum: 1,
              },

              successfulOrders: {
                $sum: {
                  $cond: [
                    {
                      $in: [
                        "$payment.status",
                        [
                          "SUCCESS",
                          "REFUNDED",
                        ],
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              failedOrders: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$payment.status",
                        "FAILED",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              pendingOrders: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$payment.status",
                        "PENDING",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              cancelledOrders: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$payment.status",
                        "CANCELLED",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              refundedOrders: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$payment.status",
                        "REFUNDED",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },

          {
            $project: {
              _id: 0,
            },
          },
        ],

        refunds: [
          {
            $match: {
              "payment.refundedAt":
                {
                  $gte:
                    ranges.current
                      .start,

                  $lt:
                    ranges.current
                      .end,
                },
            },
          },

          {
            $group: {
              _id: null,

              orders: {
                $sum: 1,
              },

              amount: {
                $sum:
                  "$payment.amount",
              },
            },
          },

          {
            $project: {
              _id: 0,
            },
          },
        ],

        paymentMethods: [
          {
            $match: {
              createdAt: {
                $gte:
                  ranges.current
                    .start,

                $lt:
                  ranges.current
                    .end,
              },
            },
          },

          {
            $group: {
              _id: {
                $ifNull: [
                  "$payment.method",
                  "UNKNOWN",
                ],
              },

              attempts: {
                $sum: 1,
              },

              successful: {
                $sum: {
                  $cond: [
                    {
                      $in: [
                        "$payment.status",
                        [
                          "SUCCESS",
                          "REFUNDED",
                        ],
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              failed: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        "$payment.status",
                        "FAILED",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },

              revenue: {
                $sum: {
                  $cond: [
                    {
                      $in: [
                        "$payment.status",
                        [
                          "SUCCESS",
                          "REFUNDED",
                        ],
                      ],
                    },
                    "$payment.amount",
                    0,
                  ],
                },
              },
            },
          },

          {
            $project: {
              _id: 0,

              method:
                "$_id",

              attempts: 1,

              successful: 1,

              failed: 1,

              revenue: 1,

              successRate: {
                $cond: [
                  {
                    $gt: [
                      "$attempts",
                      0,
                    ],
                  },
                  {
                    $multiply: [
                      {
                        $divide: [
                          "$successful",
                          "$attempts",
                        ],
                      },
                      100,
                    ],
                  },
                  0,
                ],
              },
            },
          },

          {
            $sort: {
              revenue: -1,
            },
          },
        ],

        verification: [
          {
            $match:
              paidMatch(
                ranges.current
              ),
          },

          {
            $group: {
              _id: null,

              total: {
                $sum: 1,
              },

              callbackVerified: {
                $sum: {
                  $cond: [
                    "$verification.callbackHashVerified",
                    1,
                    0,
                  ],
                },
              },

              payuVerified: {
                $sum: {
                  $cond: [
                    "$verification.payuVerified",
                    1,
                    0,
                  ],
                },
              },

              amountVerified: {
                $sum: {
                  $cond: [
                    "$verification.amountVerified",
                    1,
                    0,
                  ],
                },
              },

              fullyVerified: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        "$verification.callbackHashVerified",
                        "$verification.payuVerified",
                        "$verification.amountVerified",
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },

          {
            $project: {
              _id: 0,

              total: 1,

              callbackVerified: 1,

              payuVerified: 1,

              amountVerified: 1,

              fullyVerified: 1,

              verificationRate: {
                $cond: [
                  {
                    $gt: [
                      "$total",
                      0,
                    ],
                  },
                  {
                    $multiply: [
                      {
                        $divide: [
                          "$fullyVerified",
                          "$total",
                        ],
                      },
                      100,
                    ],
                  },
                  0,
                ],
              },
            },
          },
        ],

        utmSources: [
          {
            $match:
              paidMatch(
                ranges.current
              ),
          },

          {
            $group: {
              _id: {
                $ifNull: [
                  "$metadata.utmSource",
                  "DIRECT",
                ],
              },

              orders: {
                $sum: 1,
              },

              revenue: {
                $sum:
                  "$payment.amount",
              },
            },
          },

          {
            $project: {
              _id: 0,

              source:
                "$_id",

              orders: 1,

              revenue: 1,
            },
          },

          {
            $sort: {
              revenue: -1,
            },
          },
        ],

        utmMediums: [
          {
            $match:
              paidMatch(
                ranges.current
              ),
          },

          {
            $group: {
              _id: {
                $ifNull: [
                  "$metadata.utmMedium",
                  "UNATTRIBUTED",
                ],
              },

              orders: {
                $sum: 1,
              },

              revenue: {
                $sum:
                  "$payment.amount",
              },
            },
          },

          {
            $project: {
              _id: 0,

              medium:
                "$_id",

              orders: 1,

              revenue: 1,
            },
          },

          {
            $sort: {
              revenue: -1,
            },
          },
        ],

        utmCampaigns: [
          {
            $match:
              paidMatch(
                ranges.current
              ),
          },

          {
            $group: {
              _id: {
                $ifNull: [
                  "$metadata.utmCampaign",
                  "UNATTRIBUTED",
                ],
              },

              orders: {
                $sum: 1,
              },

              revenue: {
                $sum:
                  "$payment.amount",
              },
            },
          },

          {
            $project: {
              _id: 0,

              campaign:
                "$_id",

              orders: 1,

              revenue: 1,
            },
          },

          {
            $sort: {
              revenue: -1,
            },
          },
        ],

        dayOfWeek: [
          {
            $match:
              paidMatch(
                ranges.current
              ),
          },

          {
            $group: {
              _id: {
                $dayOfWeek: {
                  date:
                    "$payment.paidAt",
                  timezone,
                },
              },

              orders: {
                $sum: 1,
              },

              revenue: {
                $sum:
                  "$payment.amount",
              },
            },
          },

          {
            $project: {
              _id: 0,

              day: "$_id",

              orders: 1,

              revenue: 1,
            },
          },

          {
            $sort: {
              day: 1,
            },
          },
        ],

        hourOfDay: [
          {
            $match:
              paidMatch(
                ranges.current
              ),
          },

          {
            $group: {
              _id: {
                $hour: {
                  date:
                    "$payment.paidAt",
                  timezone,
                },
              },

              orders: {
                $sum: 1,
              },

              revenue: {
                $sum:
                  "$payment.amount",
              },
            },
          },

          {
            $project: {
              _id: 0,

              hour: "$_id",

              orders: 1,

              revenue: 1,
            },
          },

          {
            $sort: {
              hour: 1,
            },
          },
        ],

        monthlyTrend: [
          {
            $match:
              paidMatch(
                ranges.current
              ),
          },

          {
            $group: {
              _id: {
                $dateTrunc: {
                  date:
                    "$payment.paidAt",

                  unit:
                    "month",

                  timezone,
                },
              },

              orders: {
                $sum: 1,
              },

              revenue: {
                $sum:
                  "$payment.amount",
              },
            },
          },

          {
            $project: {
              _id: 0,

              month:
                "$_id",

              orders: 1,

              revenue: 1,
            },
          },

          {
            $sort: {
              month: 1,
            },
          },
        ],

        dayWiseCurrentMonth: [
          {
            $match:
              paidMatch(
                ranges.current
              ),
          },

          {
            $group: {
              _id: {
                $dayOfMonth: {
                  date:
                    "$payment.paidAt",
                  timezone,
                },
              },

              revenue: {
                $sum:
                  "$payment.amount",
              },

              orders: {
                $sum: 1,
              },
            },
          },

          {
            $project: {
              _id: 0,

              day:
                "$_id",

              revenue: 1,

              orders: 1,
            },
          },

          {
            $sort: {
              day: 1,
            },
          },
        ],

        dayWisePreviousMonth: [
          {
            $match:
              paidMatch(
                ranges.previousMonth
              ),
          },

          {
            $group: {
              _id: {
                $dayOfMonth: {
                  date:
                    "$payment.paidAt",
                  timezone,
                },
              },

              revenue: {
                $sum:
                  "$payment.amount",
              },

              orders: {
                $sum: 1,
              },
            },
          },

          {
            $project: {
              _id: 0,

              day:
                "$_id",

              revenue: 1,

              orders: 1,
            },
          },

          {
            $sort: {
              day: 1,
            },
          },
        ],
      },
    },
  ];

  const [result] =
    await Order.aggregate(
      pipeline
    ).allowDiskUse(true);

  const emptySummary = {
    revenue: 0,
    orders: 0,
    mrpValue: 0,
    listedValue: 0,
    affiliateRevenue: 0,
    affiliateOrders: 0,
    directRevenue: 0,
    directOrders: 0,
    uniqueCustomers: 0,
    aov: 0,
    discountVsMrp: 0,
    discountVsListedPrice: 0,
  };

  const summary =
    result.summary?.[0] ||
    emptySummary;

  const previousPeriod =
    result.previousPeriod?.[0] ||
    emptySummary;

  const previousMonth =
    result.previousMonth?.[0] ||
    emptySummary;

  const previousYear =
    result.previousYear?.[0] ||
    emptySummary;

  const refund =
    result.refunds?.[0] || {
      orders: 0,
      amount: 0,
    };

  const paymentFunnel =
    result.paymentFunnel?.[0] || {
      totalOrders: 0,
      successfulOrders: 0,
      failedOrders: 0,
      pendingOrders: 0,
      cancelledOrders: 0,
      refundedOrders: 0,
    };

  const buildComparison = (
    previous
  ) => {
    return {
      current: {
        revenue: round(
          summary.revenue
        ),

        orders:
          summary.orders || 0,

        aov:
          round(
            summary.aov
          ),
      },

      previous: {
        revenue: round(
          previous.revenue
        ),

        orders:
          previous.orders || 0,

        aov:
          round(
            previous.aov
          ),
      },

      change: {
        revenue: round(
          summary.revenue -
            previous.revenue
        ),

        orders:
          summary.orders -
          previous.orders,

        revenuePercent:
          percentageChange(
            summary.revenue,
            previous.revenue
          ),

        ordersPercent:
          percentageChange(
            summary.orders,
            previous.orders
          ),

        aovPercent:
          percentageChange(
            summary.aov,
            previous.aov
          ),
      },
    };
  };

  const currentDayMap =
    new Map(
      (
        result.dayWiseCurrentMonth ||
        []
      ).map((item) => [
        item.day,
        item,
      ])
    );

  const previousDayMap =
    new Map(
      (
        result.dayWisePreviousMonth ||
        []
      ).map((item) => [
        item.day,
        item,
      ])
    );

  const days = [
    ...new Set([
      ...currentDayMap.keys(),
      ...previousDayMap.keys(),
    ]),
  ].sort(
    (a, b) => a - b
  );

  const monthDayComparison =
    days.map((day) => {
      const current =
        currentDayMap.get(
          day
        ) || {
          revenue: 0,
          orders: 0,
        };

      const previous =
        previousDayMap.get(
          day
        ) || {
          revenue: 0,
          orders: 0,
        };

      return {
        day,

        currentRevenue:
          round(
            current.revenue
          ),

        previousRevenue:
          round(
            previous.revenue
          ),

        currentOrders:
          current.orders || 0,

        previousOrders:
          previous.orders || 0,

        revenueGrowth:
          percentageChange(
            current.revenue,
            previous.revenue
          ),

        ordersGrowth:
          percentageChange(
            current.orders,
            previous.orders
          ),
      };
    });

  const totalAttempts =
    paymentFunnel.totalOrders ||
    0;

  return {
    filters: {
      requestedFrom:
        query.from || null,

      requestedTo:
        query.to || null,

      actualStart:
        ranges.current.start,

      actualEnd:
        ranges.current.end,

      startDateIST:
        getISTDateKey(
          ranges.current.start
        ),

      endDateIST:
        getISTDateKey(
          ranges.current.end
        ),

      timezone,

      granularity,

      bookId:
        overrides.bookId ||
        query.bookId ||
        null,

      affiliateCode:
        overrides.affiliateCode ??
        query.affiliateCode ??
        null,

      provider:
        query.provider || null,

      method:
        query.method || null,

      currency: (
        query.currency || "INR"
      ).toUpperCase(),
    },

    summary: {
      revenue:
        round(
          summary.revenue
        ),

      grossRevenue:
        round(
          summary.revenue
        ),

      estimatedNetRevenue:
        round(
          summary.revenue -
            refund.amount
        ),

      orders:
        summary.orders || 0,

      aov:
        round(
          summary.aov
        ),

      mrpValue:
        round(
          summary.mrpValue
        ),

      listedValue:
        round(
          summary.listedValue
        ),

      discountVsMrp:
        round(
          summary.discountVsMrp
        ),

      discountVsListedPrice:
        round(
          summary.discountVsListedPrice
        ),

      affiliateRevenue:
        round(
          summary.affiliateRevenue
        ),

      affiliateOrders:
        summary.affiliateOrders ||
        0,

      directRevenue:
        round(
          summary.directRevenue
        ),

      directOrders:
        summary.directOrders ||
        0,

      uniqueCustomers:
        summary.uniqueCustomers ||
        0,

      refundedOrders:
        refund.orders || 0,

      estimatedRefundAmount:
        round(
          refund.amount
        ),
    },

    comparison: {
      previousPeriod:
        buildComparison(
          previousPeriod
        ),

      previousMonth:
        buildComparison(
          previousMonth
        ),

      previousYear:
        buildComparison(
          previousYear
        ),
    },

    paymentFunnel: {
      ...paymentFunnel,

      successRate:
        totalAttempts > 0
          ? round(
              (paymentFunnel.successfulOrders /
                totalAttempts) *
                100
            )
          : 0,

      failureRate:
        totalAttempts > 0
          ? round(
              (paymentFunnel.failedOrders /
                totalAttempts) *
                100
            )
          : 0,
    },

    revenueTrend:
      result.revenueTrend ||
      [],

    bookWise:
      result.bookWise ||
      [],

    bookDaily:
      result.bookDaily ||
      [],

    affiliateWise:
      result.affiliateWise ||
      [],

    bookAffiliate:
      result.bookAffiliate ||
      [],

    paymentMethods:
      result.paymentMethods ||
      [],

    verification:
      result.verification?.[0] ||
      {
        total: 0,
        callbackVerified: 0,
        payuVerified: 0,
        amountVerified: 0,
        fullyVerified: 0,
        verificationRate: 0,
      },

    attribution: {
      utmSources:
        result.utmSources ||
        [],

      utmMediums:
        result.utmMediums ||
        [],

      utmCampaigns:
        result.utmCampaigns ||
        [],
    },

    timeAnalytics: {
      dayOfWeek:
        result.dayOfWeek ||
        [],

      hourOfDay:
        result.hourOfDay ||
        [],

      monthlyTrend:
        result.monthlyTrend ||
        [],

      monthDayComparison,
    },
  };
};

export const getSalesDashboard =
  async (req, res) => {
    try {
      const data =
        await getDashboardData(
          req.query
        );

      return res
        .status(200)
        .json({
          success: true,
          data,
        });
    } catch (error) {
      console.error(
        "Sales dashboard error:",
        error
      );

      return res
        .status(400)
        .json({
          success: false,

          message:
            error.message ||
            "Failed to fetch dashboard",
        });
    }
  };

export const getBookSalesDashboard =
  async (req, res) => {
    try {
      const data =
        await getDashboardData(
          req.query,
          {
            bookId:
              req.params.bookId,
          }
        );

      return res
        .status(200)
        .json({
          success: true,
          data,
        });
    } catch (error) {
      console.error(
        "Book sales dashboard error:",
        error
      );

      return res
        .status(400)
        .json({
          success: false,

          message:
            error.message ||
            "Failed to fetch book analytics",
        });
    }
  };

export const getAffiliateSalesDashboard =
  async (req, res) => {
    try {
      const data =
        await getDashboardData(
          req.query,
          {
            affiliateCode:
              req.params
                .affiliateCode,
          }
        );

      return res
        .status(200)
        .json({
          success: true,
          data,
        });
    } catch (error) {
      console.error(
        "Affiliate sales dashboard error:",
        error
      );

      return res
        .status(400)
        .json({
          success: false,

          message:
            error.message ||
            "Failed to fetch affiliate analytics",
        });
    }
  };