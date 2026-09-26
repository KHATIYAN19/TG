import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BadgePercent,
  Banknote,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleDollarSign,
  Clock3,
  Copy,
  CreditCard,
  Database,
  Filter,
  Globe2,
  Hash,
  Info,
  Loader2,
  Mail,
  MoreVertical,
  Receipt,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  User,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import BASE_URL from "../utils/Url";

const EMPTY_SUMMARY = {
  totalOrders: 0,
  totalOrderAmount: 0,
  payments: {
    paidOrders: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingPayments: 0,
    cancelledPayments: 0,
    fullyRefundedPayments: 0,
    partiallyRefundedPayments: 0,
    successfulAmount: 0,
    failedAmount: 0,
    pendingAmount: 0,
    cancelledAmount: 0,
    grossPaidAmount: 0,
    netRevenue: 0,
  },
  refunds: {
    refundOrders: 0,
    pendingRefunds: 0,
    processingRefunds: 0,
    partialRefunds: 0,
    completedRefunds: 0,
    failedRefunds: 0,
    cancelledRefunds: 0,
    totalRefundRequestedAmount: 0,
    totalRefundedAmount: 0,
    totalRefundRemainingAmount: 0,
  },
  coupons: {
    couponAppliedOrders: 0,
    totalDiscountAmount: 0,
    originalAmount: 0,
    finalAmount: 0,
  },
  reminderMails: {
    totalSent: 0,
    ordersWithReminderMail: 0,
    lastStatusSent: 0,
    lastStatusFailed: 0,
    firstMailSentAt: null,
    lastMailSentAt: null,
  },
  access: {
    totalAccessCount: 0,
    revokedAccessOrders: 0,
  },
  verification: {
    callbackHashVerified: 0,
    payuVerified: 0,
    amountVerified: 0,
  },
  affiliates: {
    affiliateOrders: 0,
  },
};

const FILTERS = [
  {
    key: "ALL",
    label: "All",
    icon: Filter,
  },
  {
    key: "SUCCESS",
    label: "Success",
    icon: CheckCircle2,
  },
  {
    key: "PENDING",
    label: "Pending",
    icon: Clock3,
  },
  {
    key: "FAILED",
    label: "Failed",
    icon: XCircle,
  },
];

const SUCCESS_STATUSES = new Set([
  "SUCCESS",
  "PAID",
  "COMPLETED",
]);

const PENDING_STATUSES = new Set([
  "PENDING",
  "PROCESSING",
  "INITIATED",
]);

const FAILED_STATUSES = new Set([
  "FAILED",
  "BOUNCED",
  "DECLINED",
]);

function money(value, currency = "INR") {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  try {
    return new Intl.NumberFormat(
      currency === "INR" ? "en-IN" : "en-US",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }
    ).format(number);
  } catch {
    return `${currency} ${number.toLocaleString()}`;
  }
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function yesNo(value) {
  if (value === true) {
    return "Yes";
  }

  if (value === false) {
    return "No";
  }

  return "—";
}

function normalizeStatus(status) {
  return String(status || "")
    .trim()
    .toUpperCase();
}

function getOrderPrimaryStatus(order) {
  return normalizeStatus(
    order?.payment?.status ||
      order?.orderStatus
  );
}

function matchesStatusFilter(
  order,
  filter
) {
  if (filter === "ALL") {
    return true;
  }

  const status =
    getOrderPrimaryStatus(order);

  if (filter === "SUCCESS") {
    return SUCCESS_STATUSES.has(
      status
    );
  }

  if (filter === "PENDING") {
    return PENDING_STATUSES.has(
      status
    );
  }

  if (filter === "FAILED") {
    return FAILED_STATUSES.has(
      status
    );
  }

  return true;
}

function copyValue(
  value,
  label = "Value"
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return;
  }

  navigator.clipboard
    ?.writeText(String(value))
    .then(() => {
      toast.success(
        `${label} copied`
      );
    })
    .catch(() => {
      toast.error(
        "Unable to copy"
      );
    });
}

function StatusBadge({ status }) {
  const normalized =
    normalizeStatus(status);

  const config = {
    SUCCESS: {
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    },

    PAID: {
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    },

    COMPLETED: {
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    },

    SENT: {
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    },

    ACTIVE: {
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    },

    PENDING: {
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
      icon: Clock3,
    },

    PROCESSING: {
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
      icon: Clock3,
    },

    INITIATED: {
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
      icon: Clock3,
    },

    FAILED: {
      className:
        "border-red-200 bg-red-50 text-red-700",
      icon: XCircle,
    },

    BOUNCED: {
      className:
        "border-red-200 bg-red-50 text-red-700",
      icon: XCircle,
    },

    DECLINED: {
      className:
        "border-red-200 bg-red-50 text-red-700",
      icon: XCircle,
    },

    CANCELLED: {
      className:
        "border-slate-200 bg-slate-100 text-slate-600",
      icon: XCircle,
    },

    REFUNDED: {
      className:
        "border-violet-200 bg-violet-50 text-violet-700",
      icon: RotateCcw,
    },

    PARTIAL: {
      className:
        "border-sky-200 bg-sky-50 text-sky-700",
      icon: RotateCcw,
    },

    PARTIALLY_REFUNDED: {
      className:
        "border-sky-200 bg-sky-50 text-sky-700",
      icon: RotateCcw,
    },

    REVOKED: {
      className:
        "border-red-200 bg-red-50 text-red-700",
      icon: XCircle,
    },
  };

  const selected =
    config[normalized] || {
      className:
        "border-slate-200 bg-slate-50 text-slate-600",
      icon: Activity,
    };

  const Icon =
    selected.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.07em] ${selected.className}`}
    >
      <Icon className="h-3 w-3" />

      {normalized || "UNKNOWN"}
    </span>
  );
}

function MetricCard({
  icon,
  label,
  value,
  helper,
  tone = "blue",
}) {
  const tones = {
    blue:
      "bg-blue-50 text-blue-600 ring-blue-100",

    green:
      "bg-emerald-50 text-emerald-600 ring-emerald-100",

    red:
      "bg-red-50 text-red-600 ring-red-100",

    amber:
      "bg-amber-50 text-amber-600 ring-amber-100",

    violet:
      "bg-violet-50 text-violet-600 ring-violet-100",

    slate:
      "bg-slate-100 text-slate-600 ring-slate-200",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
            {label}
          </p>

          <p className="mt-2 break-words text-xl font-extrabold text-slate-950">
            {value ?? 0}
          </p>

          {helper && (
            <p className="mt-1 text-[11px] font-medium leading-4 text-slate-400">
              {helper}
            </p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${
            tones[tone] ||
            tones.blue
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function FilterTab({
  active,
  icon: Icon,
  label,
  count,
  onClick,
  tone,
}) {
  const tones = {
    ALL: active
      ? "border-slate-900 bg-slate-900 text-white"
      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",

    SUCCESS: active
      ? "border-emerald-600 bg-emerald-600 text-white"
      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300",

    PENDING: active
      ? "border-amber-500 bg-amber-500 text-white"
      : "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300",

    FAILED: active
      ? "border-red-600 bg-red-600 text-white"
      : "border-red-200 bg-red-50 text-red-700 hover:border-red-300",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-extrabold transition ${tones[tone]}`}
    >
      <Icon className="h-4 w-4" />

      <span>
        {label}
      </span>

      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
          active
            ? "bg-white/20 text-white"
            : "bg-white/80 text-current"
        }`}
      >
        {count ?? 0}
      </span>
    </button>
  );
}

function DataField({
  label,
  value,
  mono = false,
  copy = false,
  badge = false,
  important = false,
}) {
  const hasValue =
    value !== undefined &&
    value !== null &&
    value !== "";

  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3">
      <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <div className="mt-1.5 flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          {badge &&
          hasValue ? (
            <StatusBadge
              status={value}
            />
          ) : (
            <p
              className={`break-words ${
                mono
                  ? "font-mono text-[11px] font-semibold text-slate-700"
                  : important
                  ? "text-base font-extrabold text-slate-950"
                  : "text-sm font-bold text-slate-800"
              }`}
            >
              {hasValue
                ? String(value)
                : "—"}
            </p>
          )}
        </div>

        {copy &&
          hasValue && (
            <button
              type="button"
              onClick={() =>
                copyValue(
                  value,
                  label
                )
              }
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-blue-600 hover:shadow-sm"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
      </div>
    </div>
  );
}

function SectionCard({
  icon,
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-slate-950">
            {title}
          </h3>

          {subtitle && (
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 p-4 sm:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function TechnicalJson({
  label,
  value,
}) {
  const [open, setOpen] =
    useState(false);

  const hasValue =
    value !== undefined &&
    value !== null;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50"
      >
        <div>
          <p className="text-xs font-extrabold text-slate-800">
            {label}
          </p>

          <p className="mt-0.5 text-[10px] font-medium text-slate-400">
            {hasValue
              ? "Open raw provider data"
              : "No raw data available"}
          </p>
        </div>

        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="border-t border-slate-200 bg-slate-950 p-4">
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all text-[11px] leading-5 text-slate-100">
            {hasValue
              ? JSON.stringify(
                  value,
                  null,
                  2
                )
              : "No data available"}
          </pre>
        </div>
      )}
    </div>
  );
}

function TimelineItem({
  label,
  value,
  icon: Icon,
  tone = "slate",
}) {
  const tones = {
    slate:
      "bg-slate-100 text-slate-600",

    green:
      "bg-emerald-50 text-emerald-600",

    red:
      "bg-red-50 text-red-600",

    amber:
      "bg-amber-50 text-amber-600",

    blue:
      "bg-blue-50 text-blue-600",

    violet:
      "bg-violet-50 text-violet-600",
  };

  return (
    <div className="flex min-w-0 items-start gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </p>

        <p className="mt-1 text-xs font-bold leading-5 text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function PaymentCard({
  order,
  index,
  currency,
  menuOpen,
  onToggleMenu,
  onSendMail,
  onDelete,
}) {
  const [
    showMore,
    setShowMore,
  ] = useState(false);

  const payment =
    order?.payment || {};

  const customer =
    order?.customer || {};

  const book =
    order?.book || {};

  const coupon =
    order?.coupon || {};

  const refund =
    order?.refund || {};

  const pendingMail =
    order?.pendingMail || {};

  const verification =
    order?.verification || {};

  const access =
    order?.access || {};

  const metadata =
    order?.metadata || {};

  const orderCurrency =
    book?.currency ||
    currency ||
    "INR";

  const displayAmount =
    payment.amount ??
    coupon.finalAmount ??
    book.price;

  const originalAmount =
    coupon.originalAmount ??
    book.price;

  const finalAmount =
    coupon.applied
      ? coupon.finalAmount ??
        payment.amount
      : payment.amount;

  const discountAmount =
    coupon.applied
      ? coupon.discountAmount
      : 0;

  const refundAmount =
    refund.refundedAmount ??
    0;

  const hasCoupon =
    coupon.applied === true;

  const hasRefund =
    Boolean(refund.status) ||
    Number(
      refund.refundedAmount
    ) > 0 ||
    Number(
      refund.requestedAmount
    ) > 0;

  const hasReminder =
    Number(
      pendingMail.sentCount
    ) > 0 ||
    pendingMail.firstSentAt ||
    pendingMail.lastSentAt;

  const primaryStatus =
    payment.status ||
    order.orderStatus;

  const timeline = [
    {
      label:
        "Order created",

      value:
        formatDate(
          order.createdAt
        ),

      icon:
        CalendarDays,

      tone:
        "blue",
    },

    payment.paidAt
      ? {
          label:
            "Payment completed",

          value:
            formatDate(
              payment.paidAt
            ),

          icon:
            CheckCircle2,

          tone:
            "green",
        }
      : payment.failedAt
      ? {
          label:
            "Payment failed",

          value:
            formatDate(
              payment.failedAt
            ),

          icon:
            XCircle,

          tone:
            "red",
        }
      : {
          label:
            "Payment state",

          value:
            normalizeStatus(
              primaryStatus
            ) ||
            "UNKNOWN",

          icon:
            Clock3,

          tone:
            "amber",
        },

    hasReminder
      ? {
          label:
            "Last reminder",

          value:
            formatDate(
              pendingMail.lastSentAt ||
                pendingMail.firstSentAt
            ),

          icon:
            Mail,

          tone:
            "violet",
        }
      : {
          label:
            "Reminder email",

          value:
            "Not sent yet",

          icon:
            Mail,

          tone:
            "slate",
        },

    hasRefund
      ? {
          label:
            "Refund activity",

          value:
            refund.completedAt
              ? formatDate(
                  refund.completedAt
                )
              : normalizeStatus(
                  refund.status
                ) ||
                "Refund recorded",

          icon:
            RotateCcw,

          tone:
            "violet",
        }
      : {
          label:
            "Refund",

          value:
            "No refund activity",

          icon:
            RotateCcw,

          tone:
            "slate",
        },
  ];

  return (
    <article className="relative overflow-visible rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative rounded-t-3xl border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-4 pr-12">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-extrabold text-white shadow-sm">
              {index}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-extrabold text-slate-950">
                  {customer.name ||
                    "Customer"}
                </h2>

                <StatusBadge
                  status={
                    primaryStatus
                  }
                />

                {order.orderStatus &&
                  normalizeStatus(
                    order.orderStatus
                  ) !==
                    normalizeStatus(
                      primaryStatus
                    ) && (
                    <StatusBadge
                      status={
                        order.orderStatus
                      }
                    />
                  )}
              </div>

              <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                {customer.email ||
                  "No customer email"}
              </p>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-semibold text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Hash className="h-3 w-3" />

                  {order.orderId ||
                    "No Order ID"}
                </span>

                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />

                  {formatDate(
                    order.createdAt
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-5 xl:justify-end">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                Final amount
              </p>

              <p className="mt-1 text-xl font-extrabold text-slate-950">
                {money(
                  displayAmount,
                  orderCurrency
                )}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                Provider
              </p>

              <p className="mt-1 text-sm font-extrabold text-slate-800">
                {payment.provider ||
                  "—"}
              </p>

              <p className="mt-0.5 text-[10px] font-bold uppercase text-slate-400">
                {payment.method ||
                  "Payment"}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute right-4 top-4 z-30">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              onToggleMenu();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div
              onClick={(event) =>
                event.stopPropagation()
              }
              className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-2xl"
            >
              <button
                type="button"
                onClick={
                  onSendMail
                }
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <Mail className="h-4 w-4" />

                Send Purchase Reminder
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={
                  onDelete
                }
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />

                Delete Payment
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          <SectionCard
            icon={
              <User className="h-4 w-4" />
            }
            title="Customer"
            subtitle="Buyer and order identity"
          >
            <DataField
              label="Name"
              value={
                customer.name
              }
            />

            <DataField
              label="Email"
              value={
                customer.email
              }
              copy
            />

            <DataField
              label="Phone"
              value={
                customer.phone
              }
              copy
            />

            <DataField
              label="Order Status"
              value={
                order.orderStatus
              }
              badge
            />
          </SectionCard>

          <SectionCard
            icon={
              <CreditCard className="h-4 w-4" />
            }
            title="Transaction"
            subtitle="Current payment state"
          >
            <DataField
              label="Payment Status"
              value={
                payment.status
              }
              badge
            />

            <DataField
              label="Paid Amount"
              value={money(
                payment.amount,
                orderCurrency
              )}
              important
            />

            <DataField
              label="Provider"
              value={
                payment.provider
              }
            />

            <DataField
              label="Method"
              value={
                payment.method
              }
            />
          </SectionCard>

          <SectionCard
            icon={
              <Banknote className="h-4 w-4" />
            }
            title="Pricing"
            subtitle={
              hasCoupon
                ? "Coupon applied to this order"
                : "Original pricing snapshot"
            }
          >
            <DataField
              label="Original Amount"
              value={money(
                originalAmount,
                orderCurrency
              )}
            />

            <DataField
              label="Discount"
              value={
                hasCoupon
                  ? money(
                      discountAmount,
                      orderCurrency
                    )
                  : "No discount"
              }
            />

            <DataField
              label="Final Amount"
              value={money(
                finalAmount,
                orderCurrency
              )}
              important
            />

            <DataField
              label="Coupon"
              value={
                hasCoupon
                  ? coupon.code ||
                    "Applied"
                  : "Not applied"
              }
              mono={
                hasCoupon
              }
            />
          </SectionCard>

          <SectionCard
            icon={
              <Activity className="h-4 w-4" />
            }
            title="Recovery & Access"
            subtitle="Refund, reminder and resource access"
          >
            <DataField
              label="Refunded"
              value={money(
                refundAmount,
                orderCurrency
              )}
              important={
                Number(
                  refundAmount
                ) > 0
              }
            />

            <DataField
              label="Reminder Count"
              value={
                pendingMail.sentCount ??
                0
              }
            />

            <DataField
              label="Access Count"
              value={
                access.accessCount ??
                0
              }
            />

            <DataField
              label="Access Revoked"
              value={yesNo(
                access.revoked
              )}
            />
          </SectionCard>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />

            <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-700">
              Order Timeline
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {timeline.map(
              (item) => (
                <TimelineItem
                  key={
                    item.label
                  }
                  {...item}
                />
              )
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={() =>
            setShowMore(
              (current) =>
                !current
            )
          }
          className="flex w-full items-center justify-between gap-4 text-left"
        >
          <div>
            <p className="text-sm font-extrabold text-slate-900">
              Complete Payment Record
            </p>

            <p className="mt-0.5 text-xs font-medium text-slate-400">
              IDs, coupon, refund, reminder, verification,
              access, attribution and raw provider data
            </p>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm">
            {showMore ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>
      </div>

      {showMore && (
        <div className="grid grid-cols-1 gap-4 border-t border-slate-100 bg-slate-50 p-5 sm:p-6 xl:grid-cols-2">
          <SectionCard
            icon={
              <Hash className="h-4 w-4" />
            }
            title="Identifiers"
            subtitle="Order and provider references"
          >
            <DataField
              label="Mongo ID"
              value={
                order._id
              }
              mono
              copy
            />

            <DataField
              label="Order ID"
              value={
                order.orderId
              }
              mono
              copy
            />

            <DataField
              label="Book ID"
              value={
                order.bookId
              }
              mono
              copy
            />

            <DataField
              label="Transaction ID"
              value={
                payment.transactionId
              }
              mono
              copy
            />

            <DataField
              label="Payment ID"
              value={
                payment.paymentId
              }
              mono
              copy
            />

            <DataField
              label="Affiliate Code"
              value={
                payment.affiliateCode
              }
              mono
              copy
            />
          </SectionCard>

          <SectionCard
            icon={
              <Clock3 className="h-4 w-4" />
            }
            title="Payment Timeline"
            subtitle="Recorded transaction timestamps"
          >
            <DataField
              label="Paid At"
              value={formatDate(
                payment.paidAt
              )}
            />

            <DataField
              label="Failed At"
              value={formatDate(
                payment.failedAt
              )}
            />

            <DataField
              label="Refunded At"
              value={formatDate(
                payment.refundedAt
              )}
            />

            <DataField
              label="Created At"
              value={formatDate(
                order.createdAt
              )}
            />

            <DataField
              label="Updated At"
              value={formatDate(
                order.updatedAt
              )}
            />
          </SectionCard>

          <SectionCard
            icon={
              <BookOpen className="h-4 w-4" />
            }
            title="Book Snapshot"
            subtitle="Book information stored with this order"
          >
            <DataField
              label="Title"
              value={
                book.title
              }
            />

            <DataField
              label="Price"
              value={money(
                book.price,
                orderCurrency
              )}
              important
            />

            <DataField
              label="MRP"
              value={money(
                book.mrp,
                orderCurrency
              )}
            />

            <DataField
              label="Currency"
              value={
                book.currency
              }
            />
          </SectionCard>

          <SectionCard
            icon={
              <BadgePercent className="h-4 w-4" />
            }
            title="Coupon Details"
            subtitle="Coupon snapshot and discount calculation"
          >
            <DataField
              label="Applied"
              value={yesNo(
                coupon.applied
              )}
            />

            <DataField
              label="Coupon ID"
              value={
                coupon.couponId
              }
              mono
              copy
            />

            <DataField
              label="Code"
              value={
                coupon.code
              }
              mono
              copy
            />

            <DataField
              label="Name"
              value={
                coupon.name
              }
            />

            <DataField
              label="Description"
              value={
                coupon.description
              }
            />

            <DataField
              label="Discount Type"
              value={
                coupon.discountType
              }
            />

            <DataField
              label="Discount Value"
              value={
                coupon.discountValue
              }
            />

            <DataField
              label="Max Discount"
              value={money(
                coupon.maxDiscountAmount,
                orderCurrency
              )}
            />

            <DataField
              label="Minimum Order"
              value={money(
                coupon.minimumOrderAmount,
                orderCurrency
              )}
            />

            <DataField
              label="Original Amount"
              value={money(
                coupon.originalAmount,
                orderCurrency
              )}
            />

            <DataField
              label="Discount Amount"
              value={money(
                coupon.discountAmount,
                orderCurrency
              )}
              important
            />

            <DataField
              label="Final Amount"
              value={money(
                coupon.finalAmount,
                orderCurrency
              )}
              important
            />

            <DataField
              label="Applied At"
              value={formatDate(
                coupon.appliedAt
              )}
            />
          </SectionCard>

          <SectionCard
            icon={
              <RotateCcw className="h-4 w-4" />
            }
            title="Refund Details"
            subtitle="Refund request and settlement information"
          >
            <DataField
              label="Status"
              value={
                refund.status
              }
              badge={
                Boolean(
                  refund.status
                )
              }
            />

            <DataField
              label="Requested Amount"
              value={money(
                refund.requestedAmount,
                orderCurrency
              )}
            />

            <DataField
              label="Refunded Amount"
              value={money(
                refund.refundedAmount,
                orderCurrency
              )}
              important
            />

            <DataField
              label="Remaining Amount"
              value={money(
                refund.remainingAmount,
                orderCurrency
              )}
            />

            <DataField
              label="Reason"
              value={
                refund.reason
              }
            />

            <DataField
              label="Provider"
              value={
                refund.provider
              }
            />

            <DataField
              label="Provider Refund ID"
              value={
                refund.providerRefundId
              }
              mono
              copy
            />

            <DataField
              label="Refund Transaction ID"
              value={
                refund.refundTransactionId
              }
              mono
              copy
            />

            <DataField
              label="Initiated By"
              value={
                refund.initiatedBy
              }
            />

            <DataField
              label="Initiated At"
              value={formatDate(
                refund.initiatedAt
              )}
            />

            <DataField
              label="Processed At"
              value={formatDate(
                refund.processedAt
              )}
            />

            <DataField
              label="Completed At"
              value={formatDate(
                refund.completedAt
              )}
            />

            <DataField
              label="Failed At"
              value={formatDate(
                refund.failedAt
              )}
            />

            <DataField
              label="Failure Reason"
              value={
                refund.failureReason
              }
            />
          </SectionCard>

          <SectionCard
            icon={
              <Mail className="h-4 w-4" />
            }
            title="Reminder History"
            subtitle="Purchase recovery email activity"
          >
            <DataField
              label="Sent Count"
              value={
                pendingMail.sentCount ??
                0
              }
              important
            />

            <DataField
              label="First Sent At"
              value={formatDate(
                pendingMail.firstSentAt
              )}
            />

            <DataField
              label="Last Sent At"
              value={formatDate(
                pendingMail.lastSentAt
              )}
            />

            <DataField
              label="Last Sent By"
              value={
                pendingMail.lastSentBy
              }
            />

            <DataField
              label="Last Status"
              value={
                pendingMail.lastStatus
              }
              badge={
                Boolean(
                  pendingMail.lastStatus
                )
              }
            />

            <DataField
              label="Last Error"
              value={
                pendingMail.lastError
              }
            />
          </SectionCard>

          <SectionCard
            icon={
              <ShieldCheck className="h-4 w-4" />
            }
            title="Verification & Access"
            subtitle="Payment checks and resource access"
          >
            <DataField
              label="Callback Hash Verified"
              value={yesNo(
                verification.callbackHashVerified
              )}
            />

            <DataField
              label="PayU Verified"
              value={yesNo(
                verification.payuVerified
              )}
            />

            <DataField
              label="Amount Verified"
              value={yesNo(
                verification.amountVerified
              )}
            />

            <DataField
              label="Verified At"
              value={formatDate(
                verification.verifiedAt
              )}
            />

            <DataField
              label="Access Generated"
              value={formatDate(
                access.generatedAt
              )}
            />

            <DataField
              label="Access Expires"
              value={formatDate(
                access.expiresAt
              )}
            />

            <DataField
              label="Last Accessed"
              value={formatDate(
                access.lastAccessedAt
              )}
            />

            <DataField
              label="Access Count"
              value={
                access.accessCount ??
                0
              }
            />

            <DataField
              label="Revoked"
              value={yesNo(
                access.revoked
              )}
            />
          </SectionCard>

          <SectionCard
            icon={
              <Globe2 className="h-4 w-4" />
            }
            title="Traffic & Attribution"
            subtitle="Request metadata and campaign information"
          >
            <DataField
              label="IP Address"
              value={
                metadata.ipAddress
              }
              mono
              copy
            />

            <DataField
              label="User Agent"
              value={
                metadata.userAgent
              }
            />

            <DataField
              label="Referrer"
              value={
                metadata.referrer
              }
            />

            <DataField
              label="UTM Source"
              value={
                metadata.utmSource
              }
            />

            <DataField
              label="UTM Medium"
              value={
                metadata.utmMedium
              }
            />

            <DataField
              label="UTM Campaign"
              value={
                metadata.utmCampaign
              }
            />
          </SectionCard>

          <SectionCard
            icon={
              <Database className="h-4 w-4" />
            }
            title="Audit"
            subtitle="Record creation and update information"
          >
            <DataField
              label="Created By"
              value={
                order.createdBy
              }
              mono
            />

            <DataField
              label="Updated By"
              value={
                order.updatedBy
              }
              mono
            />

            <DataField
              label="Created At"
              value={formatDate(
                order.createdAt
              )}
            />

            <DataField
              label="Updated At"
              value={formatDate(
                order.updatedAt
              )}
            />
          </SectionCard>

          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
            <div className="mb-1 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Database className="h-4 w-4" />
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-950">
                  Raw Provider Data
                </h3>

                <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                  Expand only when debugging payment or refund
                  issues
                </p>
              </div>
            </div>

            <TechnicalJson
              label="Payment Callback Response"
              value={
                payment.callbackResponse
              }
            />

            <TechnicalJson
              label="Payment Verification Response"
              value={
                payment.verificationResponse
              }
            />

            <TechnicalJson
              label="Refund Request Payload"
              value={
                refund.requestPayload
              }
            />

            <TechnicalJson
              label="Refund Provider Response"
              value={
                refund.providerResponse
              }
            />
          </section>
        </div>
      )}
    </article>
  );
}

function BreakdownSection({
  breakdown,
  currency,
}) {
  const hasData =
    breakdown.paymentStatus.length >
      0 ||
    breakdown.orderStatus.length >
      0 ||
    breakdown.refundStatus.length >
      0 ||
    breakdown.coupons.length > 0 ||
    breakdown.affiliates.length >
      0;

  if (!hasData) {
    return null;
  }

  const renderGroup = (
    title,
    items,
    keyName
  ) => {
    if (!items?.length) {
      return null;
    }

    return (
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
          {title}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {items.map(
            (item, index) => {
              const label =
                item.status ||
                item.code ||
                item.name ||
                item.affiliateCode ||
                "Unknown";

              const amount =
                item.amount ??
                item.refundedAmount ??
                item.discountAmount;

              return (
                <div
                  key={`${keyName}-${label}-${index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-extrabold text-slate-700">
                      {label}
                    </p>

                    {item.count !==
                      undefined && (
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-slate-500 shadow-sm">
                        {
                          item.count
                        }
                      </span>
                    )}
                  </div>

                  {amount !==
                    undefined && (
                    <p className="mt-1 text-[11px] font-bold text-slate-400">
                      {money(
                        amount,
                        currency
                      )}
                    </p>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Activity className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-base font-extrabold text-slate-950">
            Business Breakdown
          </h2>

          <p className="mt-0.5 text-xs font-medium text-slate-400">
            Aggregated payment, refund, coupon and affiliate
            distribution
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {renderGroup(
          "Payment Status",
          breakdown.paymentStatus,
          "payment"
        )}

        {renderGroup(
          "Order Status",
          breakdown.orderStatus,
          "order"
        )}

        {renderGroup(
          "Refund Status",
          breakdown.refundStatus,
          "refund"
        )}

        {renderGroup(
          "Coupons",
          breakdown.coupons,
          "coupon"
        )}

        {renderGroup(
          "Affiliates",
          breakdown.affiliates,
          "affiliate"
        )}
      </div>
    </section>
  );
}

export default function AdminBookPayments() {
  const navigate =
    useNavigate();

  const { bookId } =
    useParams();

  const token =
    useSelector(
      (state) =>
        state.auth.token
    );

  const [
    book,
    setBook,
  ] = useState(null);

  const [
    summary,
    setSummary,
  ] = useState(
    EMPTY_SUMMARY
  );

  const [
    breakdown,
    setBreakdown,
  ] = useState({
    paymentStatus: [],
    orderStatus: [],
    refundStatus: [],
    coupons: [],
    affiliates: [],
  });

  const [
    payments,
    setPayments,
  ] = useState([]);

  const [
    pagination,
    setPagination,
  ] = useState({
    enabled: true,
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
    returnedItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    menuOrderId,
    setMenuOrderId,
  ] = useState(null);

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    pendingOrder,
    setPendingOrder,
  ] = useState(null);

  const [
    couponCode,
    setCouponCode,
  ] = useState("");

  const [
    couponDescription,
    setCouponDescription,
  ] = useState("");

  const [
    sendingMail,
    setSendingMail,
  ] = useState(false);

  const [
    deleteOrder,
    setDeleteOrder,
  ] = useState(null);

  const [
    deletingPayment,
    setDeletingPayment,
  ] = useState(false);

  const fetchPayments =
    useCallback(
      async (
        requestedPage = page,
        signal = undefined
      ) => {
        try {
          if (
            !bookId ||
            !token
          ) {
            return;
          }

          setLoading(
            true
          );

          setError("");

          const response =
            await fetch(
              `${BASE_URL}/admin/books/${encodeURIComponent(
                bookId
              )}/payments/page/${requestedPage}`,
              {
                method:
                  "GET",

                headers: {
                  Accept:
                    "application/json",

                  Authorization: `Bearer ${token}`,
                },

                signal,
              }
            );

          let result =
            null;

          try {
            result =
              await response.json();
          } catch {
            throw new Error(
              "Invalid payment response received from server."
            );
          }

          if (
            !response.ok ||
            result?.success !==
              true
          ) {
            throw new Error(
              result?.message ||
                "Unable to load payment details."
            );
          }

          const data =
            result?.data ||
            {};

          const rawSummary =
            data.summary ||
            {};

          setBook(
            data.book ||
              null
          );

          setSummary({
            ...EMPTY_SUMMARY,
            ...rawSummary,

            payments: {
              ...EMPTY_SUMMARY.payments,

              ...(rawSummary.payments ||
                {}),
            },

            refunds: {
              ...EMPTY_SUMMARY.refunds,

              ...(rawSummary.refunds ||
                {}),
            },

            coupons: {
              ...EMPTY_SUMMARY.coupons,

              ...(rawSummary.coupons ||
                {}),
            },

            reminderMails: {
              ...EMPTY_SUMMARY.reminderMails,

              ...(rawSummary.reminderMails ||
                {}),
            },

            access: {
              ...EMPTY_SUMMARY.access,

              ...(rawSummary.access ||
                {}),
            },

            verification: {
              ...EMPTY_SUMMARY.verification,

              ...(rawSummary.verification ||
                {}),
            },

            affiliates: {
              ...EMPTY_SUMMARY.affiliates,

              ...(rawSummary.affiliates ||
                {}),
            },
          });

          setBreakdown({
            paymentStatus:
              data?.breakdown
                ?.paymentStatus ||
              [],

            orderStatus:
              data?.breakdown
                ?.orderStatus ||
              [],

            refundStatus:
              data?.breakdown
                ?.refundStatus ||
              [],

            coupons:
              data?.breakdown
                ?.coupons ||
              [],

            affiliates:
              data?.breakdown
                ?.affiliates ||
              [],
          });

          setPayments(
            Array.isArray(
              data.payments
            )
              ? data.payments
              : []
          );

          setPagination({
            enabled:
              true,

            page:
              requestedPage,

            limit:
              10,

            totalItems:
              0,

            totalPages:
              1,

            returnedItems:
              0,

            hasNextPage:
              false,

            hasPreviousPage:
              false,

            ...(data.pagination ||
              {}),
          });
        } catch (err) {
          if (
            err?.name ===
            "AbortError"
          ) {
            return;
          }

          console.error(
            "Fetch payments error:",
            err
          );

          setError(
            err?.message ||
              "Unable to load payment details."
          );
        } finally {
          if (
            !signal?.aborted
          ) {
            setLoading(
              false
            );
          }
        }
      },
      [
        bookId,
        token,
        page,
      ]
    );

  useEffect(() => {
    const controller =
      new AbortController();

    fetchPayments(
      page,
      controller.signal
    );

    return () =>
      controller.abort();
  }, [
    page,
    fetchPayments,
  ]);

  useEffect(() => {
    const closeMenu =
      () =>
        setMenuOrderId(
          null
        );

    document.addEventListener(
      "click",
      closeMenu
    );

    return () =>
      document.removeEventListener(
        "click",
        closeMenu
      );
  }, []);

  useEffect(() => {
    setMenuOrderId(
      null
    );
  }, [
    statusFilter,
    searchQuery,
  ]);

  const filterCounts =
    useMemo(
      () => ({
        ALL:
          summary.totalOrders ||
          pagination.totalItems ||
          0,

        SUCCESS:
          summary.payments
            .successfulPayments ||
          0,

        PENDING:
          summary.payments
            .pendingPayments ||
          0,

        FAILED:
          summary.payments
            .failedPayments ||
          0,
      }),
      [
        summary,
        pagination.totalItems,
      ]
    );

  const visiblePayments =
    useMemo(() => {
      const normalizedSearch =
        searchQuery
          .trim()
          .toLowerCase();

      return payments.filter(
        (order) => {
          if (
            !matchesStatusFilter(
              order,
              statusFilter
            )
          ) {
            return false;
          }

          if (
            !normalizedSearch
          ) {
            return true;
          }

          const searchable = [
            order?._id,
            order?.orderId,
            order?.customer
              ?.name,
            order?.customer
              ?.email,
            order?.customer
              ?.phone,
            order?.book
              ?.title,
            order?.payment
              ?.transactionId,
            order?.payment
              ?.paymentId,
            order?.payment
              ?.provider,
            order?.payment
              ?.affiliateCode,
            order?.coupon
              ?.code,
          ]
            .filter(
              Boolean
            )
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            normalizedSearch
          );
        }
      );
    }, [
      payments,
      statusFilter,
      searchQuery,
    ]);

  const openPendingModal =
    (order) => {
      setMenuOrderId(
        null
      );

      setPendingOrder(
        order
      );

      setCouponCode("");

      setCouponDescription(
        ""
      );
    };

  const closePendingModal =
    () => {
      if (
        sendingMail
      ) {
        return;
      }

      setPendingOrder(
        null
      );

      setCouponCode("");

      setCouponDescription(
        ""
      );
    };

  const handleSendPendingMail =
    async () => {
      if (
        !pendingOrder?._id
      ) {
        return;
      }

      const code =
        couponCode.trim();

      const description =
        couponDescription.trim();

      if (
        Boolean(code) !==
        Boolean(
          description
        )
      ) {
        toast.error(
          "Fill both coupon code and coupon description, or leave both empty."
        );

        return;
      }

      try {
        setSendingMail(
          true
        );

        const response =
          await fetch(
            `${BASE_URL}/api/admin/notification/orders/${encodeURIComponent(
              pendingOrder._id
            )}/send-pending-mail`,
            {
              method:
                "POST",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization: `Bearer ${token}`,
              },

              body:
                JSON.stringify(
                  code
                    ? {
                        couponCode:
                          code,

                        couponDescription:
                          description,
                      }
                    : {}
                ),
            }
          );

        let result =
          null;

        try {
          result =
            await response.json();
        } catch {
          result =
            null;
        }

        if (
          !response.ok ||
          result?.success ===
            false
        ) {
          throw new Error(
            result?.message ||
              "Unable to send pending notification."
          );
        }

        toast.success(
          result?.message ||
            "Purchase reminder sent successfully."
        );

        setPendingOrder(
          null
        );

        setCouponCode(
          ""
        );

        setCouponDescription(
          ""
        );

        await fetchPayments(
          page
        );
      } catch (err) {
        console.error(
          "Send pending mail error:",
          err
        );

        toast.error(
          err?.message ||
            "Unable to send pending notification."
        );
      } finally {
        setSendingMail(
          false
        );
      }
    };

  const handleDeletePayment =
    async () => {
      if (
        !deleteOrder?._id
      ) {
        return;
      }

      try {
        setDeletingPayment(
          true
        );

        const response =
          await fetch(
            `${BASE_URL}/admin/books/${encodeURIComponent(
              bookId
            )}/payments/${encodeURIComponent(
              deleteOrder._id
            )}`,
            {
              method:
                "DELETE",

              headers: {
                Accept:
                  "application/json",

                Authorization: `Bearer ${token}`,
              },
            }
          );

        let result =
          null;

        try {
          result =
            await response.json();
        } catch {
          result =
            null;
        }

        if (
          !response.ok ||
          result?.success ===
            false
        ) {
          throw new Error(
            result?.message ||
              "Unable to delete payment."
          );
        }

        toast.success(
          result?.message ||
            "Payment deleted successfully."
        );

        setDeleteOrder(
          null
        );

        if (
          payments.length ===
            1 &&
          page > 1
        ) {
          setPage(
            (current) =>
              current - 1
          );
        } else {
          await fetchPayments(
            page
          );
        }
      } catch (err) {
        console.error(
          "Delete payment error:",
          err
        );

        toast.error(
          err?.message ||
            "Unable to delete payment."
        );
      } finally {
        setDeletingPayment(
          false
        );
      }
    };

  const goToPage =
    (nextPage) => {
      const totalPages =
        Math.max(
          Number(
            pagination.totalPages
          ) || 1,
          1
        );

      if (
        nextPage < 1 ||
        nextPage >
          totalPages ||
        nextPage ===
          page ||
        loading
      ) {
        return;
      }

      setPage(
        nextPage
      );

      setMenuOrderId(
        null
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  const currency =
    book?.currency ||
    "INR";

  return (
    <>
      <Helmet>
        <title>
          {book?.title
            ? `${book.title} Payments`
            : "Book Payments"}{" "}
          | Admin
        </title>
      </Helmet>

      <Toaster position="top-right" />

      <main className="min-h-screen bg-slate-50 pt-24 text-slate-900 sm:pt-28">
        <div className="mx-auto max-w-[1550px] px-4 pb-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/admin/book/${bookId}`
                )
              }
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />

              Back to Book Details
            </button>

            <button
              type="button"
              onClick={() =>
                fetchPayments(
                  page
                )
              }
              disabled={
                loading
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh
            </button>
          </div>

          <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-blue-50 via-white to-slate-50 p-5 sm:p-7">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                      <ShoppingBag className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-blue-600">
                        Payment Management
                      </p>

                      <h1 className="mt-1 truncate text-2xl font-extrabold text-slate-950 sm:text-3xl">
                        {book?.title ||
                          "Book Payments"}
                      </h1>
                    </div>
                  </div>

                  <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                    Review payment status, customer details,
                    discounts, refunds, reminder emails,
                    verification, access activity and provider
                    data from one place.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex">
                  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                      Book Price
                    </p>

                    <p className="mt-1 text-xl font-extrabold text-slate-950">
                      {money(
                        book?.price,
                        currency
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white shadow-sm">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
                      Total Orders
                    </p>

                    <p className="mt-1 text-xl font-extrabold">
                      {summary.totalOrders ||
                        0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="sticky top-20 z-20 mt-5 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur sm:top-24 sm:p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
                {FILTERS.map(
                  (filter) => (
                    <FilterTab
                      key={
                        filter.key
                      }
                      active={
                        statusFilter ===
                        filter.key
                      }
                      icon={
                        filter.icon
                      }
                      label={
                        filter.label
                      }
                      count={
                        filterCounts[
                          filter.key
                        ]
                      }
                      tone={
                        filter.key
                      }
                      onClick={() =>
                        setStatusFilter(
                          filter.key
                        )
                      }
                    />
                  )
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative min-w-0 sm:w-[320px]">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    value={
                      searchQuery
                    }
                    onChange={(
                      event
                    ) =>
                      setSearchQuery(
                        event.target
                          .value
                      )
                    }
                    placeholder="Search name, email, order or transaction"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() =>
                        setSearchQuery(
                          ""
                        )
                      }
                      className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="whitespace-nowrap rounded-xl bg-slate-100 px-3.5 py-3 text-xs font-extrabold text-slate-600">
                  {
                    visiblePayments.length
                  }{" "}
                  shown
                </div>
              </div>
            </div>
          </section>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <MetricCard
              icon={
                <CheckCircle2 className="h-5 w-5" />
              }
              label="Successful"
              value={
                summary.payments
                  .successfulPayments
              }
              helper={money(
                summary.payments
                  .successfulAmount,
                currency
              )}
              tone="green"
            />

            <MetricCard
              icon={
                <Clock3 className="h-5 w-5" />
              }
              label="Pending"
              value={
                summary.payments
                  .pendingPayments
              }
              helper={money(
                summary.payments
                  .pendingAmount,
                currency
              )}
              tone="amber"
            />

            <MetricCard
              icon={
                <XCircle className="h-5 w-5" />
              }
              label="Failed"
              value={
                summary.payments
                  .failedPayments
              }
              helper={money(
                summary.payments
                  .failedAmount,
                currency
              )}
              tone="red"
            />

            <MetricCard
              icon={
                <CircleDollarSign className="h-5 w-5" />
              }
              label="Gross Paid"
              value={money(
                summary.payments
                  .grossPaidAmount,
                currency
              )}
              helper={`${
                summary.payments
                  .paidOrders || 0
              } paid orders`}
              tone="blue"
            />

            <MetricCard
              icon={
                <Banknote className="h-5 w-5" />
              }
              label="Net Revenue"
              value={money(
                summary.payments
                  .netRevenue,
                currency
              )}
              helper="After recorded refunds"
              tone="green"
            />

            <MetricCard
              icon={
                <RotateCcw className="h-5 w-5" />
              }
              label="Refunded"
              value={money(
                summary.refunds
                  .totalRefundedAmount,
                currency
              )}
              helper={`${
                summary.refunds
                  .refundOrders || 0
              } refund orders`}
              tone="violet"
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <MetricCard
              icon={
                <BadgePercent className="h-5 w-5" />
              }
              label="Coupon Orders"
              value={
                summary.coupons
                  .couponAppliedOrders
              }
              helper={money(
                summary.coupons
                  .totalDiscountAmount,
                currency
              )}
              tone="blue"
            />

            <MetricCard
              icon={
                <Mail className="h-5 w-5" />
              }
              label="Reminder Mails"
              value={
                summary.reminderMails
                  .totalSent
              }
              helper={`${
                summary.reminderMails
                  .ordersWithReminderMail ||
                0
              } orders contacted`}
              tone="blue"
            />

            <MetricCard
              icon={
                <Activity className="h-5 w-5" />
              }
              label="Access Count"
              value={
                summary.access
                  .totalAccessCount
              }
              helper={`${
                summary.access
                  .revokedAccessOrders ||
                0
              } revoked`}
              tone="slate"
            />

            <MetricCard
              icon={
                <ShieldCheck className="h-5 w-5" />
              }
              label="PayU Verified"
              value={
                summary.verification
                  .payuVerified
              }
              helper={`${
                summary.verification
                  .amountVerified || 0
              } amount verified`}
              tone="green"
            />

            <MetricCard
              icon={
                <Tag className="h-5 w-5" />
              }
              label="Affiliate Orders"
              value={
                summary.affiliates
                  .affiliateOrders
              }
              helper="Attributed orders"
              tone="slate"
            />

            <MetricCard
              icon={
                <Receipt className="h-5 w-5" />
              }
              label="Order Value"
              value={money(
                summary.totalOrderAmount,
                currency
              )}
              helper="Total recorded amount"
              tone="blue"
            />
          </div>

          <BreakdownSection
            breakdown={
              breakdown
            }
            currency={
              currency
            }
          />

          {error && (
            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-sm font-semibold text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                {error}
              </div>

              <button
                type="button"
                onClick={() =>
                  fetchPayments(
                    page
                  )
                }
                className="text-left text-xs font-extrabold text-red-700 sm:text-right"
              >
                Retry
              </button>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-700">
                Page{" "}
                <span className="font-extrabold text-slate-950">
                  {pagination.page ||
                    page}
                </span>{" "}
                of{" "}
                <span className="font-extrabold text-slate-950">
                  {Math.max(
                    pagination.totalPages ||
                      1,
                    1
                  )}
                </span>
              </p>

              <p className="mt-1 text-xs font-medium text-slate-400">
                {pagination.totalItems ||
                  0}{" "}
                total payment records ·{" "}
                {pagination.returnedItems ||
                  0}{" "}
                loaded on this page
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  goToPage(
                    page - 1
                  )
                }
                disabled={
                  !pagination.hasPreviousPage ||
                  loading
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />

                Previous
              </button>

              <button
                type="button"
                onClick={() =>
                  goToPage(
                    page + 1
                  )
                }
                disabled={
                  !pagination.hasNextPage ||
                  loading
                }
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Next

                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {loading &&
          payments.length ===
            0 ? (
            <div className="py-24 text-center">
              <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-600" />

              <p className="mt-3 text-sm font-semibold text-slate-500">
                Loading payment
                records...
              </p>
            </div>
          ) : payments.length ===
            0 ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white py-20 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Receipt className="h-7 w-7 text-slate-400" />
              </div>

              <h3 className="mt-4 text-lg font-extrabold text-slate-900">
                No payments found
              </h3>

              <p className="mt-2 text-sm font-medium text-slate-400">
                There are no payment
                records available for
                this page.
              </p>
            </div>
          ) : visiblePayments.length ===
            0 ? (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Search className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-lg font-extrabold text-slate-900">
                No matching payments
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm font-medium leading-6 text-slate-400">
                No payment on this
                loaded page matches the
                selected status and
                search criteria.
              </p>

              <button
                type="button"
                onClick={() => {
                  setStatusFilter(
                    "ALL"
                  );

                  setSearchQuery(
                    ""
                  );
                }}
                className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {visiblePayments.map(
                (order) => {
                  const originalIndex =
                    payments.findIndex(
                      (item) =>
                        item ===
                        order
                    );

                  return (
                    <PaymentCard
                      key={
                        order._id ||
                        order.orderId ||
                        originalIndex
                      }
                      order={
                        order
                      }
                      index={
                        (page -
                          1) *
                          10 +
                        originalIndex +
                        1
                      }
                      currency={
                        currency
                      }
                      menuOpen={
                        menuOrderId ===
                        order._id
                      }
                      onToggleMenu={() =>
                        setMenuOrderId(
                          (
                            current
                          ) =>
                            current ===
                            order._id
                              ? null
                              : order._id
                        )
                      }
                      onSendMail={() =>
                        openPendingModal(
                          order
                        )
                      }
                      onDelete={() => {
                        setMenuOrderId(
                          null
                        );

                        setDeleteOrder(
                          order
                        );
                      }}
                    />
                  );
                }
              )}
            </div>
          )}

          {payments.length >
            0 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() =>
                  goToPage(
                    page - 1
                  )
                }
                disabled={
                  !pagination.hasPreviousPage ||
                  loading
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />

                Previous
              </button>

              <span className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm">
                {page} /{" "}
                {Math.max(
                  pagination.totalPages ||
                    1,
                  1
                )}
              </span>

              <button
                type="button"
                onClick={() =>
                  goToPage(
                    page + 1
                  )
                }
                disabled={
                  !pagination.hasNextPage ||
                  loading
                }
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm disabled:bg-slate-300"
              >
                Next

                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </main>

      {pendingOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white p-6">
              <div className="flex items-start justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                    <Send className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-extrabold text-slate-950">
                      Send Purchase Reminder
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Send a recovery email
                      for this incomplete
                      purchase.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    closePendingModal
                  }
                  disabled={
                    sendingMail
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <User className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900">
                      {pendingOrder
                        .customer
                        ?.name ||
                        "Customer"}
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-slate-500">
                      {pendingOrder
                        .customer
                        ?.email ||
                        "No email"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Order
                    </p>

                    <p className="mt-1 break-all font-mono text-xs font-bold text-slate-700">
                      {pendingOrder.orderId ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Status
                    </p>

                    <div className="mt-1">
                      <StatusBadge
                        status={
                          pendingOrder
                            .payment
                            ?.status ||
                          pendingOrder.orderStatus
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="flex gap-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

                  <p className="text-xs font-semibold leading-5 text-blue-700">
                    Coupon is optional.
                    Enter both coupon code
                    and description to
                    include an offer, or
                    leave both fields empty
                    to send a normal
                    reminder.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-extrabold text-slate-700">
                    Coupon Code
                  </label>

                  <input
                    value={
                      couponCode
                    }
                    onChange={(
                      event
                    ) =>
                      setCouponCode(
                        event.target
                          .value
                      )
                    }
                    placeholder="Example: SAVE20"
                    disabled={
                      sendingMail
                    }
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-extrabold text-slate-700">
                    Coupon Description
                  </label>

                  <textarea
                    value={
                      couponDescription
                    }
                    onChange={(
                      event
                    ) =>
                      setCouponDescription(
                        event.target
                          .value
                      )
                    }
                    placeholder="Example: Get 20% off on your purchase"
                    rows={4}
                    disabled={
                      sendingMail
                    }
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  />
                </div>
              </div>

              {couponCode.trim() &&
                couponDescription.trim() && (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
                      Coupon Preview
                    </p>

                    <p className="mt-2 font-mono text-lg font-extrabold text-emerald-700">
                      {couponCode
                        .trim()
                        .toUpperCase()}
                    </p>

                    <p className="mt-1 text-sm font-semibold leading-6 text-emerald-700">
                      {couponDescription.trim()}
                    </p>
                  </div>
                )}

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closePendingModal
                  }
                  disabled={
                    sendingMail
                  }
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleSendPendingMail
                  }
                  disabled={
                    sendingMail
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sendingMail ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}

                  {sendingMail
                    ? "Sending Reminder..."
                    : "Send Reminder Email"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteOrder && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>

            <h2 className="mt-5 text-2xl font-extrabold text-slate-950">
              Delete Payment?
            </h2>

            <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
              This will permanently
              delete the payment and
              order record for{" "}
              <strong className="text-slate-800">
                {deleteOrder.customer
                  ?.email ||
                  deleteOrder.orderId}
              </strong>
              . This action cannot be
              undone.
            </p>

            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-500">
                Mongo ID
              </p>

              <p className="mt-1 break-all font-mono text-xs font-bold text-red-700">
                {deleteOrder._id}
              </p>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteOrder(
                    null
                  )
                }
                disabled={
                  deletingPayment
                }
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDeletePayment
                }
                disabled={
                  deletingPayment
                }
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
              >
                {deletingPayment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}

                {deletingPayment
                  ? "Deleting..."
                  : "Delete Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}