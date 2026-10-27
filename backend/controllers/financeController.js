
import mongoose from "mongoose";

import FinanceTracker from "../models/FinanceTracker.js";
import Order from "../models/Order.js";

// ============================================================
// TARGET TREK - FINANCE MANAGEMENT CONTROLLER
// ============================================================
//
// Order model:
//   orderStatus       -> PAID
//   payment.status    -> SUCCESS
//   payment.amount    -> Amount in INR
//   payment.provider  -> PayU / Cashfree / Razorpay
//   payment.paidAt    -> Payment completion date
//   payment.affiliateAmount -> Affiliate commission
//
// Affiliate commission is REPORTING ONLY.
// It is NOT deducted from revenue, expenses or profit.
//
// All report dates use Asia/Kolkata (IST).
// ============================================================

// ============================================================
// CONSTANTS
// ============================================================

const IST_OFFSET_MS = 330 * 60 * 1000;

const RECORD_TYPES = [
  "INCOME",
  "EXPENSE",
  "GATEWAY_RULE",
];

const INCOME_CATEGORIES = [
  "MOCK_INTERVIEW",
  "CONSULTING",
  "FREELANCE",
  "SERVICE",
  "OTHER_INCOME",
];

const EXPENSE_CATEGORIES = [
  "ADVERTISEMENT",
  "CLOUD",
  "DOMAIN",
  "HOSTING",
  "EMAIL",
  "SOFTWARE",
  "AFFILIATE",
  "REFUND",
  "OTHER",
];

const GATEWAYS = [
  "CASHFREE",
  "PAYU",
  "RAZORPAY",
  "ALL",
];

const PAYMENT_METHODS = [
  "UPI",
  "BANK_TRANSFER",
  "CARD",
  "CASH",
  "WALLET",
  "OTHER",
  "NONE",
];

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

const EDITABLE_FIELDS = [
  "title",
  "recordType",
  "category",
  "amount",
  "percentage",
  "gateway",
  "description",
  "transactionDate",
  "paymentMethod",
  "referenceNumber",
  "notes",
  "isActive",
];

// ============================================================
// GENERAL UTILITIES
// ============================================================

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

class FinanceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "FinanceError";
    this.status = status;
  }
}

const success = (
  res,
  message,
  data = null,
  status = 200
) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

const fail = (
  res,
  message,
  status = 400
) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

const handleError = (res, error) => {
  if (error.code === 11000) {
    return fail(
      res,
      "An active gateway rule already exists for this gateway.",
      409
    );
  }

  if (error instanceof FinanceError) {
    return fail(res, error.message, error.status);
  }

  throw error;
};

const actorId = (req) => {
  const id = req.user?._id ?? req.user?.id;

  return id && mongoose.isValidObjectId(id)
    ? id
    : null;
};

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toUpperCase();

const validId = (id) =>
  mongoose.isValidObjectId(id);

// Work with integer paise internally.
// This avoids repeatedly calculating totals using INR floats.

const toPaise = (value) =>
  Math.round(Number(value) * 100);

const toRupees = (paise) =>
  Math.round(paise) / 100;

const calculatePercentageFee = (
  amountPaise,
  percentage
) => {
  return Math.round(
    (amountPaise * Number(percentage)) / 100
  );
};

const validateAmount = (value) => {
  const amount = Number(value);

  if (
    value === "" ||
    value === null ||
    value === undefined ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new FinanceError(
      "Amount must be greater than zero."
    );
  }

  const paise = toPaise(amount);

  if (!Number.isSafeInteger(paise)) {
    throw new FinanceError("Amount is too large.");
  }

  if (
    Math.abs(amount - paise / 100) > 0.000001
  ) {
    throw new FinanceError(
      "Amount supports a maximum of two decimal places."
    );
  }

  return amount;
};

// ============================================================
// DATE UTILITIES - IST
// ============================================================

const istStart = (
  year,
  month,
  day
) => {
  return new Date(
    Date.UTC(year, month - 1, day) -
      IST_OFFSET_MS
  );
};

const validCalendarDate = (year, month, day) => {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return false;
  }

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
};

const parseISODate = (value) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw new FinanceError(
      "Date must use YYYY-MM-DD format."
    );
  }

  const [year, month, day] =
    value.split("-").map(Number);

  if (!validCalendarDate(year, month, day)) {
    throw new FinanceError(
      "Invalid calendar date."
    );
  }

  return {
    year,
    month,
    day,
  };
};

const parseMonth = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const raw = String(value)
    .trim()
    .toLowerCase();

  if (/^\d{1,2}$/.test(raw)) {
    const number = Number(raw);

    if (number >= 1 && number <= 12) {
      return number;
    }
  }

  const index = MONTHS.indexOf(raw);

  if (index >= 0) {
    return index + 1;
  }

  throw new FinanceError(
    "Invalid month. Use January-December or 1-12."
  );
};

const parseDateRange = (query = {}) => {
  const {
    startDate,
    endDate,
    date,
    year,
    month,
    day,
  } = query;

  const hasRange =
    startDate !== undefined ||
    endDate !== undefined;

  const hasDate = date !== undefined;

  const hasParts =
    year !== undefined ||
    month !== undefined ||
    day !== undefined;

  const modes = [
    hasRange,
    hasDate,
    hasParts,
  ].filter(Boolean).length;

  if (modes > 1) {
    throw new FinanceError(
      "Use only one date filter mode at a time."
    );
  }

  // ----------------------------------------------------------
  // BETWEEN TWO DATES
  // ----------------------------------------------------------

  if (hasRange) {
    if (!startDate || !endDate) {
      throw new FinanceError(
        "Both startDate and endDate are required."
      );
    }

    const start = parseISODate(startDate);
    const end = parseISODate(endDate);

    const from = istStart(
      start.year,
      start.month,
      start.day
    );

    const toExclusive = istStart(
      end.year,
      end.month,
      end.day + 1
    );

    if (from >= toExclusive) {
      throw new FinanceError(
        "startDate cannot be after endDate."
      );
    }

    return {
      from,
      toExclusive,
      type: "CUSTOM_RANGE",
      label: `${startDate} to ${endDate}`,
    };
  }

  // ----------------------------------------------------------
  // EXACT DATE
  // ----------------------------------------------------------

  if (hasDate) {
    const d = parseISODate(date);

    return {
      from: istStart(
        d.year,
        d.month,
        d.day
      ),

      toExclusive: istStart(
        d.year,
        d.month,
        d.day + 1
      ),

      type: "DAY",
      label: date,
    };
  }

  // ----------------------------------------------------------
  // YEAR / MONTH / DAY
  // ----------------------------------------------------------

  if (hasParts) {
    if (year === undefined) {
      throw new FinanceError(
        "Year is required when filtering by month or day."
      );
    }

    const y = Number(year);

    if (
      !/^\d{4}$/.test(String(year)) ||
      y < 2000 ||
      y > 9999
    ) {
      throw new FinanceError(
        "Invalid year."
      );
    }

    const m = parseMonth(month);

    if (day !== undefined) {
      if (m === null) {
        throw new FinanceError(
          "Month is required when selecting a day."
        );
      }

      const d = Number(day);

      if (
        !/^\d{1,2}$/.test(String(day)) ||
        !validCalendarDate(y, m, d)
      ) {
        throw new FinanceError(
          "Invalid day."
        );
      }

      return {
        from: istStart(y, m, d),
        toExclusive: istStart(y, m, d + 1),
        type: "DAY",
        label: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      };
    }

    if (m !== null) {
      return {
        from: istStart(y, m, 1),
        toExclusive: istStart(y, m + 1, 1),
        type: "MONTH",
        label: `${MONTHS[m - 1]} ${y}`,
      };
    }

    return {
      from: istStart(y, 1, 1),
      toExclusive: istStart(y + 1, 1, 1),
      type: "YEAR",
      label: String(y),
    };
  }

  // ----------------------------------------------------------
  // LIFETIME
  // ----------------------------------------------------------

  return {
    from: null,
    toExclusive: null,
    type: "ALL_TIME",
    label: "All Time",
  };
};

const dateMongoFilter = (
  field,
  range
) => {
  if (!range.from && !range.toExclusive) {
    return {};
  }

  const filter = {};

  if (range.from) {
    filter.$gte = range.from;
  }

  if (range.toExclusive) {
    filter.$lt = range.toExclusive;
  }

  return {
    [field]: filter,
  };
};

const isInRange = (
  dateValue,
  range
) => {
  if (!dateValue) return false;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  if (
    range.from &&
    date < range.from
  ) {
    return false;
  }

  if (
    range.toExclusive &&
    date >= range.toExclusive
  ) {
    return false;
  }

  return true;
};

const parseTransactionDate = (
  value
) => {
  if (!value) {
    return new Date();
  }

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    const d = parseISODate(value);

    return istStart(
      d.year,
      d.month,
      d.day
    );
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new FinanceError(
      "Invalid transactionDate."
    );
  }

  return date;
};

const getPeriodKey = (
  dateValue,
  groupBy
) => {
  const date = new Date(
    new Date(dateValue).getTime() +
      IST_OFFSET_MS
  );

  const iso = date.toISOString();

  if (groupBy === "yearly") {
    return iso.slice(0, 4);
  }

  if (groupBy === "monthly") {
    return iso.slice(0, 7);
  }

  return iso.slice(0, 10);
};

// ============================================================
// ACTUAL TARGET TREK ORDER SCHEMA HELPERS
// ============================================================

// Your Order schema uses:
// orderStatus = PAID
// payment.status = SUCCESS
//
// Refunded orders have separate refund statuses.
// This report uses successfully paid, currently PAID orders.
// Refunds are not automatically recognized as a loss here.

const SUCCESSFUL_ORDER_QUERY = {
  orderStatus: "PAID",
  "payment.status": "SUCCESS",
};

// ------------------------------------------------------------
// ORIGINAL CUSTOMER-PAID AMOUNT
// ------------------------------------------------------------

const getOrderAmountPaise = (order) => {
  const originalValue =
    order.payment?.amount;

  if (
    originalValue === null ||
    originalValue === undefined ||
    originalValue === ""
  ) {
    return null;
  }

  const amount = Number(originalValue);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return null;
  }

  const paise = toPaise(amount);

  if (!Number.isSafeInteger(paise)) {
    return null;
  }

  return paise;
};

// ------------------------------------------------------------
// PAYMENT GATEWAY
// ------------------------------------------------------------

const getOrderGateway = (order) => {
  const provider = normalize(
    order.payment?.provider
  );

  if (provider.includes("CASHFREE")) {
    return "CASHFREE";
  }

  if (provider.includes("RAZORPAY")) {
    return "RAZORPAY";
  }

  if (provider.includes("PAYU")) {
    return "PAYU";
  }

  return "UNKNOWN";
};

// ------------------------------------------------------------
// PAYMENT DATE
// ------------------------------------------------------------

const getOrderDate = (order) => {
  return (
    order.payment?.paidAt ||
    order.createdAt
  );
};

// ------------------------------------------------------------
// AFFILIATE COMMISSION
// IMPORTANT: REPORTING ONLY
// ------------------------------------------------------------

const getAffiliateCommissionPaise = (
  order
) => {
  const amount = Number(
    order.payment?.affiliateAmount ?? 0
  );

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return 0;
  }

  const paise = toPaise(amount);

  return Number.isSafeInteger(paise)
    ? paise
    : 0;
};

// ============================================================
// VALIDATE / PREPARE FINANCE RECORD
// ============================================================

const validateAndPrepare = (
  input,
  existing = null
) => {
  const base = existing || {};
  const record = {};

  for (const field of EDITABLE_FIELDS) {
    record[field] =
      Object.prototype.hasOwnProperty.call(
        input,
        field
      )
        ? input[field]
        : base[field];
  }

  record.title = String(
    record.title ?? ""
  ).trim();

  record.recordType = normalize(
    record.recordType ?? "EXPENSE"
  );

  record.category = normalize(
    record.category ??
    (record.recordType === "INCOME"
      ? "OTHER_INCOME"
      : "OTHER")
  );

  record.gateway = normalize(
    record.gateway ?? "NONE"
  );

  record.paymentMethod = normalize(
    record.paymentMethod ?? "NONE"
  );

  record.description = String(
    record.description ?? ""
  ).trim();

  record.notes = String(
    record.notes ?? ""
  ).trim();

  record.referenceNumber = String(
    record.referenceNumber ?? ""
  ).trim();

  record.isActive =
    record.isActive === undefined
      ? true
      : record.isActive;

  if (
    typeof record.isActive !== "boolean"
  ) {
    throw new FinanceError(
      "isActive must be a boolean."
    );
  }

  if (
    !record.title ||
    record.title.length > 200
  ) {
    throw new FinanceError(
      "Title is required (maximum 200 characters)."
    );
  }

  if (record.description.length > 2000) {
    throw new FinanceError(
      "Description cannot exceed 2000 characters."
    );
  }

  if (
    !PAYMENT_METHODS.includes(
      record.paymentMethod
    )
  ) {
    throw new FinanceError(
      "Invalid payment method."
    );
  }

  record.transactionDate =
    parseTransactionDate(
      record.transactionDate ?? new Date()
    );

  // ----------------------------------------------------------
  // INCOME
  // ----------------------------------------------------------

  if (record.recordType === "INCOME") {
    if (
      !INCOME_CATEGORIES.includes(
        record.category
      )
    ) {
      throw new FinanceError(
        "Invalid income category."
      );
    }

    record.amount = validateAmount(
      record.amount
    );

    record.percentage = 0;
    record.gateway = "NONE";
  }

  // ----------------------------------------------------------
  // EXPENSE
  // ----------------------------------------------------------

  else if (
    record.recordType === "EXPENSE"
  ) {
    if (
      !EXPENSE_CATEGORIES.includes(
        record.category
      )
    ) {
      throw new FinanceError(
        "Invalid expense category."
      );
    }

    record.amount = validateAmount(
      record.amount
    );

    record.percentage = 0;
    record.gateway = "NONE";
  }

  // ----------------------------------------------------------
  // GATEWAY RULE
  // ----------------------------------------------------------

  else if (
    record.recordType === "GATEWAY_RULE"
  ) {
    record.category = "PAYMENT_GATEWAY";

    if (!GATEWAYS.includes(record.gateway)) {
      throw new FinanceError(
        "Invalid payment gateway."
      );
    }

    const percentage = Number(
      record.percentage
    );

    if (
      record.percentage === "" ||
      record.percentage === null ||
      record.percentage === undefined ||
      !Number.isFinite(percentage) ||
      percentage < 0 ||
      percentage > 100
    ) {
      throw new FinanceError(
        "Gateway percentage must be between 0 and 100."
      );
    }

    record.percentage = percentage;
    record.amount = 0;
  }

  else {
    throw new FinanceError(
      "Invalid record type."
    );
  }

  return record;
};

// ============================================================
// 1. CREATE RECORD
// POST /api/admin/finance
// ============================================================

export const createFinanceRecord =
  asyncHandler(async (req, res) => {
    try {
      const payload = validateAndPrepare(
        req.body || {}
      );

      const record =
        await FinanceTracker.create({
          ...payload,
          createdBy: actorId(req),
          updatedBy: actorId(req),
        });

      return success(
        res,
        "Finance record created successfully.",
        record,
        201
      );
    } catch (error) {
      return handleError(res, error);
    }
  });

// ============================================================
// 2. LIST RECORDS
// GET /api/admin/finance
// ============================================================

export const getFinanceRecords =
  asyncHandler(async (req, res) => {
    try {
      const range = parseDateRange(
        req.query
      );

      const page = Math.max(
        1,
        parseInt(req.query.page, 10) || 1
      );

      const limit = Math.min(
        100,
        Math.max(
          1,
          parseInt(req.query.limit, 10) || 10
        )
      );

      const filter = {};

      if (
        req.query.onlyDeleted === "true"
      ) {
        filter.isDeleted = true;
      } else if (
        req.query.includeDeleted !== "true"
      ) {
        filter.isDeleted = false;
      }

      if (req.query.recordType) {
        const type = normalize(
          req.query.recordType
        );

        if (!RECORD_TYPES.includes(type)) {
          throw new FinanceError(
            "Invalid recordType filter."
          );
        }

        filter.recordType = type;
      }

      if (req.query.category) {
        filter.category = normalize(
          req.query.category
        );
      }

      if (req.query.gateway) {
        filter.gateway = normalize(
          req.query.gateway
        );
      }

      if (
        req.query.isActive === "true"
      ) {
        filter.isActive = true;
      }

      if (
        req.query.isActive === "false"
      ) {
        filter.isActive = false;
      }

      if (req.query.search) {
        const escaped = String(
          req.query.search
        )
          .slice(0, 100)
          .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );

        filter.$or = [
          {
            title: {
              $regex: escaped,
              $options: "i",
            },
          },
          {
            description: {
              $regex: escaped,
              $options: "i",
            },
          },
          {
            referenceNumber: {
              $regex: escaped,
              $options: "i",
            },
          },
        ];
      }

      Object.assign(
        filter,
        dateMongoFilter(
          "transactionDate",
          range
        )
      );

      const [records, total] =
        await Promise.all([
          FinanceTracker.find(filter)
            .sort({
              transactionDate: -1,
              _id: -1,
            })
            .skip(
              (page - 1) * limit
            )
            .limit(limit)
            .lean(),

          FinanceTracker.countDocuments(
            filter
          ),
        ]);

      return success(
        res,
        "Finance records fetched successfully.",
        {
          records,

          filter: {
            type: range.type,
            label: range.label,
          },

          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(
              total / limit
            ),
          },
        }
      );
    } catch (error) {
      return handleError(res, error);
    }
  });

// ============================================================
// 3. GET RECORD BY ID
// GET /api/admin/finance/:id
// ============================================================

export const getFinanceRecordById =
  asyncHandler(async (req, res) => {
    if (!validId(req.params.id)) {
      return fail(
        res,
        "Invalid finance record ID."
      );
    }

    const record =
      await FinanceTracker.findById(
        req.params.id
      ).lean();

    if (!record) {
      return fail(
        res,
        "Finance record not found.",
        404
      );
    }

    return success(
      res,
      "Finance record fetched successfully.",
      record
    );
  });

// ============================================================
// 4. UPDATE RECORD
// PATCH /api/admin/finance/:id
// ============================================================

export const updateFinanceRecord =
  asyncHandler(async (req, res) => {
    if (!validId(req.params.id)) {
      return fail(
        res,
        "Invalid finance record ID."
      );
    }

    const record =
      await FinanceTracker.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

    if (!record) {
      return fail(
        res,
        "Finance record not found.",
        404
      );
    }

    try {
      const payload = validateAndPrepare(
        req.body || {},
        record.toObject()
      );

      Object.assign(record, payload);

      record.updatedBy = actorId(req);

      await record.save();

      return success(
        res,
        "Finance record updated successfully.",
        record
      );
    } catch (error) {
      return handleError(res, error);
    }
  });

// ============================================================
// 5. SOFT DELETE
// PATCH /api/admin/finance/:id/soft-delete
// ============================================================

export const softDeleteFinanceRecord =
  asyncHandler(async (req, res) => {
    if (!validId(req.params.id)) {
      return fail(
        res,
        "Invalid finance record ID."
      );
    }

    const record =
      await FinanceTracker.findOneAndUpdate(
        {
          _id: req.params.id,
          isDeleted: false,
        },
        {
          $set: {
            isDeleted: true,
            isActive: false,
            deletedAt: new Date(),
            deletedBy: actorId(req),
            updatedBy: actorId(req),
          },
        },
        { new: true }
      );

    if (!record) {
      return fail(
        res,
        "Record not found or already deleted.",
        404
      );
    }

    return success(
      res,
      "Finance record moved to trash.",
      record
    );
  });

// ============================================================
// 6. RESTORE RECORD
// PATCH /api/admin/finance/:id/restore
// ============================================================

export const restoreFinanceRecord =
  asyncHandler(async (req, res) => {
    if (!validId(req.params.id)) {
      return fail(
        res,
        "Invalid finance record ID."
      );
    }

    const record =
      await FinanceTracker.findOneAndUpdate(
        {
          _id: req.params.id,
          isDeleted: true,
        },
        {
          $set: {
            isDeleted: false,
            isActive: false,
            deletedAt: null,
            deletedBy: null,
            updatedBy: actorId(req),
          },
        },
        { new: true }
      );

    if (!record) {
      return fail(
        res,
        "Deleted finance record not found.",
        404
      );
    }

    return success(
      res,
      "Finance record restored. Activate it to include it in reports.",
      record
    );
  });

// ============================================================
// 7. HARD DELETE
// DELETE /api/admin/finance/:id
// ============================================================

export const hardDeleteFinanceRecord =
  asyncHandler(async (req, res) => {
    if (!validId(req.params.id)) {
      return fail(
        res,
        "Invalid finance record ID."
      );
    }

    // Permanent deletion is allowed only from trash.
    const record =
      await FinanceTracker.findOneAndDelete({
        _id: req.params.id,
        isDeleted: true,
      });

    if (!record) {
      return fail(
        res,
        "Move the record to trash before permanent deletion.",
        404
      );
    }

    return success(
      res,
      "Finance record permanently deleted.",
      {
        id: record._id,
      }
    );
  });

// ============================================================
// 8. GATEWAY SETTINGS
// GET /api/admin/finance/gateway-settings
// ============================================================

export const getGatewaySettings =
  asyncHandler(async (req, res) => {
    const rules =
      await FinanceTracker.find({
        recordType: "GATEWAY_RULE",
        isActive: true,
        isDeleted: false,
      })
        .sort({ gateway: 1 })
        .lean();

    const settings = {
      CASHFREE: null,
      PAYU: null,
      RAZORPAY: null,
      ALL: null,
    };

    for (const rule of rules) {
      settings[rule.gateway] = {
        id: rule._id,
        title: rule.title,
        percentage: rule.percentage,
      };
    }

    return success(
      res,
      "Gateway settings fetched successfully.",
      {
        settings,
        rules,
      }
    );
  });

// ============================================================
// 9. SHARED FINANCE CALCULATION
// ============================================================

const calculateFinance = async (
  range,
  groupBy = null
) => {
  // ----------------------------------------------------------
  // GET GATEWAY RULES
  // ----------------------------------------------------------

  const gatewayRules =
    await FinanceTracker.find({
      recordType: "GATEWAY_RULE",
      isActive: true,
      isDeleted: false,
    }).lean();

  const gatewayRates = new Map();

  for (const rule of gatewayRules) {
    gatewayRates.set(
      rule.gateway,
      Number(rule.percentage) || 0
    );
  }

  // ----------------------------------------------------------
  // GET MANUAL FINANCE RECORDS
  // ----------------------------------------------------------

  const manualRecords =
    FinanceTracker.find({
      recordType: {
        $in: [
          "INCOME",
          "EXPENSE",
        ],
      },

      isDeleted: false,
      isActive: true,

      ...dateMongoFilter(
        "transactionDate",
        range
      ),
    })
      .lean()
      .cursor();

  // ----------------------------------------------------------
  // FINANCE TOTALS (PAISE)
  // ----------------------------------------------------------

  let bookRevenuePaise = 0;
  let manualIncomePaise = 0;

  let gatewayFeePaise = 0;
  let otherExpensesPaise = 0;

  // Affiliate information only.
  // NOT deducted from any financial calculation.
  let totalAffiliateCommissionPaise = 0;

  let successfulOrders = 0;
  let skippedOrders = 0;
  let unknownGatewayOrders = 0;
  let affiliateOrders = 0;
  let ordersUsingDateFallback = 0;

  const incomeBreakdown = {};
  const expenseBreakdown = {};

  const gatewayBreakdown = {};
  const affiliateBreakdown = {};

  const trendMap = new Map();

  // ----------------------------------------------------------
  // TREND BUCKET
  // ----------------------------------------------------------

  const getTrendBucket = (
    dateValue
  ) => {
    if (!groupBy) {
      return null;
    }

    const period = getPeriodKey(
      dateValue,
      groupBy
    );

    if (!trendMap.has(period)) {
      trendMap.set(period, {
        period,

        bookRevenuePaise: 0,
        manualIncomePaise: 0,

        gatewayFeePaise: 0,
        expensesPaise: 0,

        // Reporting only.
        affiliateCommissionPaise: 0,
        affiliateOrders: 0,

        orders: 0,
      });
    }

    return trendMap.get(period);
  };

  // ----------------------------------------------------------
  // ORDER CURSOR
  // ----------------------------------------------------------

  // Your actual Order model uses:
  //
  // orderStatus: "PAID"
  // payment.status: "SUCCESS"
  //
  // Query payment.paidAt for indexed reporting once a
  // suitable compound index has been introduced.
  //
  // Legacy paidAt-null orders use createdAt as fallback.

  const orderCursor =
    Order.find(SUCCESSFUL_ORDER_QUERY)
      .select({
        orderId: 1,
        orderStatus: 1,

        "payment.status": 1,
        "payment.amount": 1,
        "payment.provider": 1,
        "payment.paidAt": 1,

        "payment.affiliateCode": 1,
        "payment.affiliateUserId": 1,
        "payment.affiliateAmount": 1,

        "book.currency": 1,

        createdAt: 1,
      })
      .lean()
      .cursor();

  // ----------------------------------------------------------
  // CALCULATE REVENUE FROM ORDERS
  // ----------------------------------------------------------

  for await (const order of orderCursor) {
    const orderDate = getOrderDate(order);

    if (
      !orderDate ||
      !isInRange(orderDate, range)
    ) {
      continue;
    }

    // This dashboard is INR-only.
    // Do not silently add USD and INR together.
    if (
      normalize(order.book?.currency || "INR") !==
      "INR"
    ) {
      skippedOrders++;
      continue;
    }

    const amountPaise =
      getOrderAmountPaise(order);

    if (amountPaise === null) {
      skippedOrders++;
      continue;
    }

    if (!order.payment?.paidAt) {
      ordersUsingDateFallback++;
    }

    const gateway =
      getOrderGateway(order);

    // Gateway-specific rule takes priority.
    // ALL is the fallback rule.
    const specificRate =
      gatewayRates.get(gateway);

    const defaultRate =
      gatewayRates.get("ALL");

    const percentage =
      specificRate ??
      defaultRate ??
      0;

    const chargePaise =
      calculatePercentageFee(
        amountPaise,
        percentage
      );

    // --------------------------------------------------------
    // REVENUE / GATEWAY CHARGES
    // --------------------------------------------------------

    bookRevenuePaise += amountPaise;
    gatewayFeePaise += chargePaise;
    successfulOrders++;

    if (gateway === "UNKNOWN") {
      unknownGatewayOrders++;
    }

    // --------------------------------------------------------
    // GATEWAY BREAKDOWN
    // --------------------------------------------------------

    if (!gatewayBreakdown[gateway]) {
      gatewayBreakdown[gateway] = {
        orders: 0,

        revenuePaise: 0,
        chargesPaise: 0,

        appliedPercentage: percentage,
      };
    }

    gatewayBreakdown[gateway].orders++;

    gatewayBreakdown[gateway].revenuePaise +=
      amountPaise;

    gatewayBreakdown[gateway].chargesPaise +=
      chargePaise;

    // --------------------------------------------------------
    // AFFILIATE TRACKING
    // REPORTING ONLY - NO DEDUCTION
    // --------------------------------------------------------

    const affiliateCommissionPaise =
      getAffiliateCommissionPaise(order);

    if (affiliateCommissionPaise > 0) {
      totalAffiliateCommissionPaise +=
        affiliateCommissionPaise;

      affiliateOrders++;

      const affiliateCode = String(
        order.payment?.affiliateCode ??
        "UNKNOWN"
      )
        .trim()
        .toLowerCase();

      const code =
        affiliateCode || "UNKNOWN";

      if (!affiliateBreakdown[code]) {
        affiliateBreakdown[code] = {
          affiliateCode: code,
          orders: 0,
          salesRevenuePaise: 0,
          commissionPaise: 0,
        };
      }

      affiliateBreakdown[code].orders++;

      affiliateBreakdown[code].salesRevenuePaise +=
        amountPaise;

      affiliateBreakdown[code].commissionPaise +=
        affiliateCommissionPaise;
    }

    // --------------------------------------------------------
    // TREND CALCULATION
    // --------------------------------------------------------

    const bucket = getTrendBucket(
      orderDate
    );

    if (bucket) {
      bucket.bookRevenuePaise +=
        amountPaise;

      bucket.gatewayFeePaise +=
        chargePaise;

      bucket.affiliateCommissionPaise +=
        affiliateCommissionPaise;

      if (affiliateCommissionPaise > 0) {
        bucket.affiliateOrders++;
      }

      bucket.orders++;
    }
  }

  // ----------------------------------------------------------
  // MANUAL INCOME + EXPENSES
  // ----------------------------------------------------------

  for await (const record of manualRecords) {
    const amountPaise = toPaise(
      record.amount
    );

    const bucket = getTrendBucket(
      record.transactionDate
    );

    // MANUAL INCOME
    if (record.recordType === "INCOME") {
      manualIncomePaise += amountPaise;

      incomeBreakdown[record.category] =
        (incomeBreakdown[record.category] ?? 0) +
        amountPaise;

      if (bucket) {
        bucket.manualIncomePaise +=
          amountPaise;
      }
    }

    // MANUAL EXPENSE
    if (record.recordType === "EXPENSE") {
      otherExpensesPaise += amountPaise;

      expenseBreakdown[record.category] =
        (expenseBreakdown[record.category] ?? 0) +
        amountPaise;

      if (bucket) {
        bucket.expensesPaise +=
          amountPaise;
      }
    }
  }

  // ----------------------------------------------------------
  // FINAL CALCULATIONS
  // ----------------------------------------------------------

  const totalRevenuePaise =
    bookRevenuePaise +
    manualIncomePaise;

  const totalExpensesPaise =
    gatewayFeePaise +
    otherExpensesPaise;

  const netProfitPaise =
    totalRevenuePaise -
    totalExpensesPaise;

  const profitMargin =
    totalRevenuePaise > 0
      ? Number(
          (
            (netProfitPaise /
              totalRevenuePaise) *
            100
          ).toFixed(2)
        )
      : 0;

  // Affiliate commissions deliberately do NOT appear
  // in the calculations above.

  // ----------------------------------------------------------
  // FORMAT CATEGORY BREAKDOWNS
  // ----------------------------------------------------------

  const formatBreakdown = (obj) =>
    Object.fromEntries(
      Object.entries(obj).map(
        ([key, value]) => [
          key,
          toRupees(value),
        ]
      )
    );

  // ----------------------------------------------------------
  // FORMAT GATEWAY BREAKDOWN
  // ----------------------------------------------------------

  const formattedGateways = {};

  for (const [
    gateway,
    data,
  ] of Object.entries(
    gatewayBreakdown
  )) {
    formattedGateways[gateway] = {
      orders: data.orders,

      revenue: toRupees(
        data.revenuePaise
      ),

      estimatedCharges: toRupees(
        data.chargesPaise
      ),

      appliedPercentage:
        data.appliedPercentage,
    };
  }

  // ----------------------------------------------------------
  // FORMAT AFFILIATE BREAKDOWN
  // ----------------------------------------------------------

  const formattedAffiliates = {};

  for (const [
    code,
    data,
  ] of Object.entries(
    affiliateBreakdown
  )) {
    formattedAffiliates[code] = {
      affiliateCode:
        data.affiliateCode,

      orders: data.orders,

      salesRevenue: toRupees(
        data.salesRevenuePaise
      ),

      commission: toRupees(
        data.commissionPaise
      ),
    };
  }

  // ----------------------------------------------------------
  // FORMAT DAILY / MONTHLY / YEARLY TRENDS
  // ----------------------------------------------------------

  const trends = [
    ...trendMap.values(),
  ]
    .sort((a, b) =>
      a.period.localeCompare(b.period)
    )
    .map((row) => {
      const totalRevenue =
        row.bookRevenuePaise +
        row.manualIncomePaise;

      const totalExpenses =
        row.gatewayFeePaise +
        row.expensesPaise;

      return {
        period: row.period,

        orders: row.orders,

        bookRevenue: toRupees(
          row.bookRevenuePaise
        ),

        manualIncome: toRupees(
          row.manualIncomePaise
        ),

        totalRevenue: toRupees(
          totalRevenue
        ),

        gatewayCharges: toRupees(
          row.gatewayFeePaise
        ),

        otherExpenses: toRupees(
          row.expensesPaise
        ),

        totalExpenses: toRupees(
          totalExpenses
        ),

        profit: toRupees(
          totalRevenue -
          totalExpenses
        ),

        // Affiliate information only.
        affiliateCommission: toRupees(
          row.affiliateCommissionPaise
        ),

        affiliateOrders:
          row.affiliateOrders,
      };
    });

  // ----------------------------------------------------------
  // FINAL RESPONSE
  // ----------------------------------------------------------

  return {
    summary: {
      // Revenue
      bookRevenue: toRupees(
        bookRevenuePaise
      ),

      manualIncome: toRupees(
        manualIncomePaise
      ),

      totalRevenue: toRupees(
        totalRevenuePaise
      ),

      // Expenses
      gatewayCharges: toRupees(
        gatewayFeePaise
      ),

      otherExpenses: toRupees(
        otherExpensesPaise
      ),

      totalExpenses: toRupees(
        totalExpensesPaise
      ),

      // Profit
      netProfit: toRupees(
        netProfitPaise
      ),

      profitMargin,

      // Order information
      successfulOrders,
      skippedOrders,
      unknownGatewayOrders,
      ordersUsingDateFallback,

      // Affiliate reporting only
      totalAffiliateCommission: toRupees(
        totalAffiliateCommissionPaise
      ),

      affiliateOrders,
    },

    incomeBreakdown:
      formatBreakdown(incomeBreakdown),

    expenseBreakdown:
      formatBreakdown(expenseBreakdown),

    gatewayBreakdown:
      formattedGateways,

    affiliateBreakdown:
      formattedAffiliates,

    trends,
  };
};

// ============================================================
// 10. FINANCE OVERVIEW
// GET /api/admin/finance/overview
// ============================================================

export const getFinanceOverview =
  asyncHandler(async (req, res) => {
    try {
      const range = parseDateRange(
        req.query
      );

      const finance = await calculateFinance(
        range
      );

      return success(
        res,
        "Finance overview fetched successfully.",
        {
          filter: {
            type: range.type,
            label: range.label,

            startDate:
              range.from?.toISOString() ??
              null,

            endExclusive:
              range.toExclusive?.toISOString() ??
              null,

            timezone: "Asia/Kolkata",
          },

          ...finance,
        }
      );
    } catch (error) {
      return handleError(res, error);
    }
  });

// ============================================================
// 11. FINANCE TRENDS
// GET /api/admin/finance/trends
//
// groupBy=daily
// groupBy=monthly
// groupBy=yearly
// ============================================================

export const getFinanceTrends =
  asyncHandler(async (req, res) => {
    try {
      const groupBy = String(
        req.query.groupBy ||
        "daily"
      ).toLowerCase();

      if (
        ![
          "daily",
          "monthly",
          "yearly",
        ].includes(groupBy)
      ) {
        throw new FinanceError(
          "groupBy must be daily, monthly or yearly."
        );
      }

      const range = parseDateRange(
        req.query
      );

      const finance = await calculateFinance(
        range,
        groupBy
      );

      return success(
        res,
        "Finance trends fetched successfully.",
        {
          filter: {
            type: range.type,
            label: range.label,
            timezone: "Asia/Kolkata",
          },

          groupBy,

          summary: finance.summary,

          trends: finance.trends,
        }
      );
    } catch (error) {
      return handleError(res, error);
    }
  });

// ============================================================
// 12. MONTHLY REPORT
// GET /api/admin/finance/monthly-report
// ?month=October&year=2026
// ============================================================

export const getMonthlyFinanceReport =
  asyncHandler(async (req, res) => {
    try {
      if (
        req.query.month === undefined ||
        req.query.year === undefined
      ) {
        throw new FinanceError(
          "Both month and year are required."
        );
      }

      const range = parseDateRange({
        month: req.query.month,
        year: req.query.year,
      });

      const finance = await calculateFinance(
        range,
        "daily"
      );

      return success(
        res,
        "Monthly finance report fetched successfully.",
        {
          month: range.label,
          timezone: "Asia/Kolkata",
          ...finance,
        }
      );
    } catch (error) {
      return handleError(res, error);
    }
  });

// ============================================================
// 13. YEARLY REPORT
// GET /api/admin/finance/yearly-report
// ?year=2026
// ============================================================

export const getYearlyFinanceReport =
  asyncHandler(async (req, res) => {
    try {
      if (!req.query.year) {
        throw new FinanceError(
          "Year is required."
        );
      }

      const range = parseDateRange({
        year: req.query.year,
      });

      const finance = await calculateFinance(
        range,
        "monthly"
      );

      return success(
        res,
        "Yearly finance report fetched successfully.",
        {
          year: req.query.year,
          timezone: "Asia/Kolkata",
          ...finance,
        }
      );
    } catch (error) {
      return handleError(res, error);
    }
  });

// ============================================================
// 14. FINANCE FILTER OPTIONS
// GET /api/admin/finance/filter-options
// ============================================================

export const getFinanceFilterOptions =
  asyncHandler(async (req, res) => {
    return success(
      res,
      "Finance filter options fetched successfully.",
      {
        recordTypes: RECORD_TYPES,

        incomeCategories:
          INCOME_CATEGORIES,

        expenseCategories:
          EXPENSE_CATEGORIES,

        gateways: GATEWAYS,

        paymentMethods:
          PAYMENT_METHODS,

        months: MONTHS.map(
          (month, index) => ({
            value: index + 1,

            label:
              month.charAt(0).toUpperCase() +
              month.slice(1),
          })
        ),

        groupBy: [
          "daily",
          "monthly",
          "yearly",
        ],

        timezone: "Asia/Kolkata",
      }
    );
  });

// ============================================================
// 15. MANUAL RECORD SUMMARY
// GET /api/admin/finance/record-summary
// ============================================================

export const getFinanceRecordSummary =
  asyncHandler(async (req, res) => {
    try {
      const range = parseDateRange(
        req.query
      );

      const rows =
        await FinanceTracker.aggregate([
          {
            $match: {
              isDeleted: false,
              isActive: true,

              recordType: {
                $in: [
                  "INCOME",
                  "EXPENSE",
                ],
              },

              ...dateMongoFilter(
                "transactionDate",
                range
              ),
            },
          },
          {
            $group: {
              _id: "$recordType",

              count: {
                $sum: 1,
              },

              amount: {
                $sum: "$amount",
              },
            },
          },
        ]);

      const result = {
        income: {
          count: 0,
          amount: 0,
        },

        expense: {
          count: 0,
          amount: 0,
        },
      };

      for (const row of rows) {
        const key =
          row._id === "INCOME"
            ? "income"
            : "expense";

        result[key] = {
          count: row.count,

          amount: toRupees(
            toPaise(row.amount)
          ),
        };
      }

      result.balance = toRupees(
        toPaise(
          result.income.amount
        ) -
        toPaise(
          result.expense.amount
        )
      );

      return success(
        res,
        "Finance record summary fetched successfully.",
        {
          filter: {
            type: range.type,
            label: range.label,
          },

          ...result,
        }
      );
    } catch (error) {
      return handleError(res, error);
    }
  });
