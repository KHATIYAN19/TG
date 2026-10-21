
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
  Math.round(
    (Number(value || 0) + Number.EPSILON) * 100
  ) / 100;

const number = (value) =>
  Number(value || 0);

const parsePositiveInt = (
  value,
  fallback,
  maximum
) => {
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, maximum);
};

const istDate = (date = new Date()) =>
  new Date(
    date.getTime() + IST_MINUTES * 60 * 1000
  )
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
    (dateToUTC(end) - dateToUTC(start)) /
      86400000
  );

const listDates = (startDate, days) =>
  Array.from(
    { length: days },
    (_, i) => shiftDay(startDate, i)
  );

/* =====================================================
   AUTHENTICATED AFFILIATE CONTEXT

   Never accept affiliateUserId or affiliateCode
   from req.query, req.params or req.body.
===================================================== */

const getAffiliateContext = async (req) => {
  const rawUserId =
    req.user?.userId ||
    req.user?._id ||
    req.user?.sub;

  if (
    !rawUserId ||
    !mongoose.Types.ObjectId.isValid(
      String(rawUserId)
    )
  ) {
    return {
      error: "Authentication required.",
      status: 401,
    };
  }

  const user = await User.findOne({
    _id: rawUserId,
    role: "affiliate",
    status: "active",
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
      error: "Active affiliate account required.",
      status: 403,
    };
  }

  if (
    !user.affiliate ||
    user.affiliate.status !== "active"
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

   Never treat a PENDING order as earned commission.

   Supported payment providers:
   Cashfree, PayU and Razorpay.

   This deliberately excludes unverified historical
   payments until their verification records are
   reconciled.
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

/*
  NOTE:
  The financial dashboard currently reports INR.
  Other currencies are excluded rather than added
  together without conversion.
*/

const validSaleExpr = {
  $and: [
    { $eq: ["$orderStatus", PAID] },
    { $eq: ["$payment.status", SUCCESS] },
    { $eq: ["$book.currency", "INR"] },
    { $eq: ["$verification.amountVerified", true] },
    providerVerifiedExpr,
    { $gt: ["$payment.amount", 0] },
    { $gte: ["$payment.affiliateAmount", 0] },
    { $ne: ["$payment.affiliateUserId", null] },
  ],
};

const failedExpr = {
  $or: [
    { $eq: ["$payment.status", "FAILED"] },
    { $eq: ["$orderStatus", "FAILED"] },
  ],
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

/*
  Single consistent event date:
  payment.paidAt if present; otherwise createdAt.

  Use this same definition for dashboard periods,
  graph buckets, and custom date filters.
*/

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
      isEarned: validSaleExpr,
      isFailed: failedExpr,
      isRefunded: refundedExpr,
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

   The same group definition is reused everywhere.
===================================================== */

const metricGroup = {
  $group: {
    _id: null,

    totalOrders: {
      $sum: 1,
    },

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

const emptyMetrics = () => ({
  totalOrders: 0,
  successfulOrders: 0,
  successfulAmount: 0,
  earnedCommission: 0,
  remainingAmount: 0,
  failedOrders: 0,
  failedAttemptedAmount: 0,
  pendingOrders: 0,
  refundedOrders: 0,
  conversionRate: 0,
});

const normalizeMetrics = (raw) => {
  const data = raw || {};

  const result = {
    totalOrders: number(data.totalOrders),
    successfulOrders: number(
      data.successfulOrders
    ),
    successfulAmount: money(
      data.successfulAmount
    ),
    earnedCommission: money(
      data.earnedCommission
    ),
    remainingAmount: money(
      data.remainingAmount
    ),
    failedOrders: number(data.failedOrders),
    failedAttemptedAmount: money(
      data.failedAttemptedAmount
    ),
    pendingOrders: number(data.pendingOrders),
    refundedOrders: number(
      data.refundedOrders
    ),
  };

  result.conversionRate =
    result.totalOrders > 0
      ? money(
          (result.successfulOrders /
            result.totalOrders) *
            100
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

   Never expose:
   - Customer name/email/phone
   - Customer IP/user agent
   - Payment session/payment IDs
   - Payment gateway response payloads
   - Book access tokens
   - Full coupon/internal metadata
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

    // A snapshot from checkout.
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

    // This determines whether commission contributes
    // to the financial summary.
    commissionEarned: Boolean(row.isEarned),

    state,
  };
};

/* =====================================================
   PERIOD DEFINITIONS
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
   API 1: AFFILIATE DASHBOARD

   GET /api/affiliate/dashboard

   Optional:
   ?graphDays=7
   ?graphDays=30
   ?graphDays=365

   Includes:
   - All-time metrics
   - Today, last 7, 30, 365 days
   - Daily graph
   - Last 15 orders
   - Affiliate commission configuration
===================================================== */

export const getAffiliateDashboard = async (
  req,
  res
) => {
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
    const graphEnd = endExclusiveIST(
      periods.today
    );

    const baseMatch = {
      "payment.affiliateUserId":
        context.affiliateUserId,
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

    const period = (key) =>
      normalizeMetrics(aggregated[key]?.[0]);

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

      return {
        date,
        orders: number(point?.orders),
        successfulOrders: number(
          point?.successfulOrders
        ),
        salesAmount: money(
          point?.salesAmount
        ),
        commission: money(
          point?.commission
        ),
        failedOrders: number(
          point?.failedOrders
        ),
      };
    });

    const affiliate = context.user.affiliate;

    return res.status(200).json({
      success: true,

      data: {
        currency: "INR",
        timezone: TIMEZONE,

        generatedAt: new Date().toISOString(),

        affiliate: {
          name: context.user.name,
          code: affiliate.code,
          commissionType:
            affiliate.commissionType,
          commissionValue:
            affiliate.commissionValue,
          status: affiliate.status,
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

        recentOrders: recentOrders.map(
          cleanOrder
        ),

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
    console.error(
      "Affiliate dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load affiliate dashboard.",
    });
  }
};

/* =====================================================
   API 2: AFFILIATE TRANSACTIONS

   GET /api/affiliate/orders

   Optional query params:
   page=1
   limit=15
   status=ALL|EARNED|FAILED|PENDING|REFUNDED|UNVERIFIED
   startDate=2026-10-01
   endDate=2026-10-21
   sort=desc|asc

   Returns:
   - Paginated safe orders
   - Filtered totals
   - Date range
   - Pagination metadata

   Security:
   Affiliate ID comes only from authenticated JWT.
===================================================== */

export const getAffiliateOrders = async (
  req,
  res
) => {
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

    if (
      Boolean(startDate) !== Boolean(endDate)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Provide both startDate and endDate.",
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
          message:
            "Date range cannot exceed 3660 days.",
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

    /*
      Apply one status classification priority:
      REFUNDED > FAILED > EARNED > PENDING >
      UNVERIFIED.

      This prevents an order from being counted in
      two filtered transaction states.
    */

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

    const total = number(
      result?.count?.[0]?.value
    );

    const pages = Math.ceil(total / limit);

    const rows = (result?.items || []).map(
      cleanOrder
    );

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

        totals: normalizeMetrics(
          result?.totals?.[0]
        ),

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
    console.error(
      "Affiliate orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve affiliate orders.",
    });
  }
};
