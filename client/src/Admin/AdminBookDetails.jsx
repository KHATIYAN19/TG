import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Helmet } from "react-helmet-async";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useSelector } from "react-redux";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Hash,
  Image as ImageIcon,
  Info,
  Link as LinkIcon,
  Loader2,
  Mail,
  Package,
  Phone,
  Receipt,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  User,
  Users,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";

import BASE_URL from "../utils/Url";

/* =========================================================
   CONSTANTS
========================================================= */

const RESOURCE_TYPES = [
  "pdf",
  "ebook",
  "course",
  "bundle",
  "template",
  "notes",
  "other",
];

const ORDERS_PER_PAGE = 10;

const INITIAL_FORM = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",

  resourceType: "ebook",

  price: "",
  mrp: "",
  currency: "INR",

  paymentUrl: "",
  redirectUrl: "",
  pageKey: "",

  fileName: "",

  tags: "",
  topics: "",
  category: "",
  highlights: "",
  badge: "",

  isPublished: false,
  isActive: true,
  isFeatured: false,
};

const INITIAL_PAYMENT_SUMMARY = {
  totalOrders: 0,

  successfulPayments: 0,

  failedPayments: 0,

  pendingPayments: 0,

  successfulAmount: 0,

  failedAmount: 0,

  pendingAmount: 0,
};

/* =========================================================
   HELPERS
========================================================= */

function money(
  value,
  currency = "INR"
) {
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
      currency === "INR"
        ? "en-IN"
        : "en-US",
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

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",

      month: "short",

      year: "numeric",

      hour: "2-digit",

      minute: "2-digit",
    }
  );
}

function formatResourceType(type) {
  const map = {
    pdf: "PDF",

    ebook: "Ebook",

    course: "Course",

    bundle: "Bundle",

    template: "Template",

    notes: "Notes",

    other: "Other",
  };

  return (
    map[type] ||
    type ||
    "—"
  );
}

function arrayToString(value) {
  if (!Array.isArray(value)) {
    return "";
  }

  return value.join(", ");
}

function stringToArray(value) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) =>
      item.trim()
    )
    .filter(Boolean);
}

function createFormFromBook(book) {
  return {
    title:
      book?.title || "",

    slug:
      book?.slug || "",

    subtitle:
      book?.subtitle || "",

    description:
      book?.description || "",

    resourceType:
      book?.resourceType ||
      "ebook",

    price:
      book?.price !==
        undefined &&
      book?.price !== null
        ? String(
            book.price
          )
        : "",

    mrp:
      book?.mrp !==
        undefined &&
      book?.mrp !== null
        ? String(
            book.mrp
          )
        : "",

    currency:
      book?.currency ||
      "INR",

    paymentUrl:
      book?.paymentUrl ||
      "",

    redirectUrl:
      book?.redirectUrl ||
      "",

    pageKey:
      book?.pageKey || "",

    fileName:
      book?.fileName || "",

    tags:
      arrayToString(
        book?.tags
      ),

    topics:
      arrayToString(
        book?.topics
      ),

    category:
      book?.category || "",

    highlights:
      arrayToString(
        book?.highlights
      ),

    badge:
      book?.badge || "",

    isPublished:
      book?.isPublished ===
      true,

    isActive:
      book?.isActive !==
      false,

    isFeatured:
      book?.isFeatured ===
      true,
  };
}

function normalizeForm(form) {
  return {
    ...form,

    title:
      form.title.trim(),

    slug:
      form.slug.trim(),

    subtitle:
      form.subtitle.trim(),

    description:
      form.description.trim(),

    resourceType:
      form.resourceType.trim(),

    price:
      String(
        form.price
      ).trim(),

    mrp:
      String(
        form.mrp
      ).trim(),

    currency:
      form.currency
        .trim()
        .toUpperCase(),

    paymentUrl:
      form.paymentUrl.trim(),

    redirectUrl:
      form.redirectUrl.trim(),

    pageKey:
      form.pageKey.trim(),

    fileName:
      form.fileName.trim(),

    tags:
      stringToArray(
        form.tags
      ),

    topics:
      stringToArray(
        form.topics
      ),

    category:
      form.category.trim(),

    highlights:
      stringToArray(
        form.highlights
      ),

    badge:
      form.badge.trim(),

    isPublished:
      Boolean(
        form.isPublished
      ),

    isActive:
      Boolean(
        form.isActive
      ),

    isFeatured:
      Boolean(
        form.isFeatured
      ),
  };
}

function areFormsEqual(
  formA,
  formB
) {
  return (
    JSON.stringify(
      normalizeForm(
        formA
      )
    ) ===
    JSON.stringify(
      normalizeForm(
        formB
      )
    )
  );
}



function StatusBadge({
  value,
  trueText,
  falseText,
}) {
  if (value) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />

        {trueText}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
      <XCircle className="h-3.5 w-3.5" />

      {falseText}
    </span>
  );
}

/* =========================================================
   PAYMENT STATUS BADGE
========================================================= */

function PaymentStatusBadge({
  status,
}) {
  const normalized =
    String(
      status || ""
    ).toUpperCase();

  if (
    normalized ===
    "SUCCESS"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />

        Success
      </span>
    );
  }

  if (
    normalized ===
    "FAILED"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-red-600">
        <XCircle className="h-3.5 w-3.5" />

        Failed
      </span>
    );
  }

  if (
    normalized ===
    "PENDING"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
        <Loader2 className="h-3.5 w-3.5" />

        Pending
      </span>
    );
  }

  if (
    normalized ===
    "CANCELLED"
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
        <XCircle className="h-3.5 w-3.5" />

        Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
      {normalized ||
        "Unknown"}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-2 truncate text-2xl font-extrabold text-slate-950">
            {value ?? 0}
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({
  label,
  value,
  mono = false,
}) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 break-words text-sm text-slate-800 ${
          mono
            ? "font-mono text-xs"
            : "font-medium"
        }`}
      >
        {value === undefined ||
        value === null ||
        value === ""
          ? "—"
          : String(value)}
      </p>
    </div>
  );
}

/* =========================================================
   ARRAY DISPLAY
========================================================= */

function ArrayDisplay({
  title,
  values,
  color = "blue",
}) {
  const colors = {
    blue:
      "border-blue-200 bg-blue-50 text-blue-700",

    violet:
      "border-violet-200 bg-violet-50 text-violet-700",

    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700",

    orange:
      "border-orange-200 bg-orange-50 text-orange-700",
  };

  const list =
    Array.isArray(values)
      ? values
      : [];

  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      {list.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {list.map(
            (
              item,
              index
            ) => (
              <span
                key={`${item}-${index}`}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${colors[color]}`}
              >
                {item}
              </span>
            )
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          No{" "}
          {title.toLowerCase()}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   FORM INPUT
========================================================= */

function InputField({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  type = "text",
  placeholder = "",
  min,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={
          onChange
        }
        placeholder={
          placeholder
        }
        min={min}
        className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
            : "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        }`}
      />

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   TEXTAREA
========================================================= */

function TextAreaField({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  placeholder = "",
  rows = 4,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={
          onChange
        }
        placeholder={
          placeholder
        }
        rows={rows}
        className={`w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
            : "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        }`}
      />

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <select
        name={name}
        value={value}
        onChange={
          onChange
        }
        className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm font-medium text-slate-800 outline-none ${
          error
            ? "border-red-300 focus:ring-4 focus:ring-red-100"
            : "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        }`}
      >
        {options.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {
                option.label
              }
            </option>
          )
        )}
      </select>

      {error && (
        <p className="mt-1.5 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function ToggleField({
  label,
  description,
  checked,
  onChange,
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300">
      <div>
        <p className="text-sm font-bold text-slate-800">
          {label}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          onChange(
            !checked
          )
        }
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked
            ? "bg-blue-600"
            : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </label>
  );
}

/* =========================================================
   PAYMENT DETAIL ITEM
========================================================= */

function PaymentDetail({
  label,
  value,
  mono = false,
}) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 break-all text-sm text-slate-800 ${
          mono
            ? "font-mono text-xs"
            : "font-semibold"
        }`}
      >
        {value === undefined ||
        value === null ||
        value === ""
          ? "—"
          : String(value)}
      </p>
    </div>
  );
}

/* =========================================================
   PAYMENT ORDER CARD
========================================================= */

function PaymentOrderCard({
  order,
  index,
  currency = "INR",
}) {
  const payment =
    order?.payment || {};

  const customer =
    order?.customer || {};

  const verification =
    order?.verification ||
    {};

  const access =
    order?.access || {};

  const metadata =
    order?.metadata || {};

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-extrabold text-white">
            {index + 1}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-950">
                {customer.name ||
                  "Customer"}
              </h3>

              <PaymentStatusBadge
                status={
                  payment.status
                }
              />
            </div>

            <p className="mt-1 font-mono text-[10px] text-slate-400">
              {order.orderId ||
                order._id ||
                "—"}
            </p>
          </div>
        </div>

        <div className="sm:text-right">
          <p className="text-xl font-extrabold text-slate-950">
            {money(
              payment.amount,
              order?.book
                ?.currency ||
                currency
            )}
          </p>

          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {payment.method ||
              payment.provider ||
              "Payment"}
          </p>

        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-2 xl:grid-cols-4">
        {/* CUSTOMER */}

        <div className="border-b border-slate-100 p-5 lg:border-r xl:border-b-0">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />

            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Customer
            </h4>
          </div>

          <div className="space-y-4">
            <PaymentDetail
              label="Name"
              value={
                customer.name
              }
            />

            <PaymentDetail
              label="Email"
              value={
                customer.email
              }
            />

            <PaymentDetail
              label="Phone"
              value={
                customer.phone
              }
            />
          </div>
        </div>

        {/* PAYMENT */}

        <div className="border-b border-slate-100 p-5 xl:border-b-0 xl:border-r">
          <div className="mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-blue-600" />

            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Payment
            </h4>
          </div>

          <div className="space-y-4">
            <PaymentDetail
              label="Provider"
              value={
                payment.provider
              }
            />

            <PaymentDetail
              label="Transaction ID"
              value={
                payment.transactionId
              }
              mono
            />

             <PaymentDetail
              label="Affilate code"
              value={
                payment?.affiliateCode
              }
              mono
            />

            <PaymentDetail
              label="PayU Payment ID"
              value={
                payment.paymentId
              }
              mono
            />

            <PaymentDetail
              label="Method"
              value={
                payment.method
              }
            />

            <PaymentDetail
              label="Amount"
              value={money(
                payment.amount,
                order?.book
                  ?.currency ||
                  currency
              )}
            />

            <PaymentDetail
              label="Paid At"
              value={formatDate(
                payment.paidAt
              )}
            />

            <PaymentDetail
              label="Failed At"
              value={formatDate(
                payment.failedAt
              )}
            />
          </div>
        </div>

        {/* VERIFICATION */}

        <div className="border-b border-slate-100 p-5 lg:border-r lg:border-b-0">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />

            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Verification
            </h4>
          </div>

          <div className="space-y-4">
            <PaymentDetail
              label="Order Status"
              value={
                order.orderStatus
              }
            />

            <PaymentDetail
              label="Callback Hash"
              value={
                verification.callbackHashVerified
                  ? "Verified"
                  : "Not Verified"
              }
            />

            <PaymentDetail
              label="PayU Verification"
              value={
                verification.payuVerified
                  ? "Verified"
                  : "Not Verified"
              }
            />

            <PaymentDetail
              label="Amount Verification"
              value={
                verification.amountVerified
                  ? "Verified"
                  : "Not Verified"
              }
            />

            <PaymentDetail
              label="Verified At"
              value={formatDate(
                verification.verifiedAt
              )}
            />

            <PaymentDetail
              label="Order Created"
              value={formatDate(
                order.createdAt
              )}
            />           
          </div>
        </div>

        {/* ACCESS + META */}

        <div className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />

            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
              Access & Source
            </h4>
          </div>

          <div className="space-y-4">
            <PaymentDetail
              label="Access Generated"
              value={formatDate(
                access.generatedAt
              )}
            />

            <PaymentDetail
              label="Access Expires"
              value={formatDate(
                access.expiresAt
              )}
            />

            <PaymentDetail
              label="Last Accessed"
              value={formatDate(
                access.lastAccessedAt
              )}
            />

            <PaymentDetail
              label="Access Revoked"
              value={
                access.revoked
                  ? "Yes"
                  : "No"
              }
            />

            <PaymentDetail
              label="IP Address"
              value={
                metadata.ipAddress
              }
              mono
            />

            <PaymentDetail
              label="Referrer"
              value={
                metadata.referrer
              }
            />

            <PaymentDetail
              label="UTM Source"
              value={
                metadata.utmSource
              }
            />

            <PaymentDetail
              label="UTM Medium"
              value={
                metadata.utmMedium
              }
            />

            <PaymentDetail
              label="UTM Campaign"
              value={
                metadata.utmCampaign
              }
            />
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   ORDERS MODAL
========================================================= */

function OrdersModal({
  open,
  onClose,
  orders,
  loading,
  error,
  summary,
  book,
  onRefresh,
}) {
  const [
    visibleCount,
    setVisibleCount,
  ] = useState(
    ORDERS_PER_PAGE
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  const loaderRef =
    useRef(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setVisibleCount(
      ORDERS_PER_PAGE
    );

    setSearch("");

    setStatusFilter(
      "ALL"
    );
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [
    open,
    onClose,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [open]);

  const filteredOrders =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return orders.filter(
        (order) => {
          const status =
            String(
              order?.payment
                ?.status ||
                ""
            ).toUpperCase();

          if (
            statusFilter !==
              "ALL" &&
            status !==
              statusFilter
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const values = [
            order?.orderId,
            order?._id,

            order?.customer
              ?.name,

            order?.customer
              ?.email,

            order?.customer
              ?.phone,

            order?.payment
              ?.transactionId,

            order?.payment
              ?.paymentId,

            order?.payment
              ?.method,

            order?.payment
              ?.provider,

            order?.orderStatus,
          ];

          return values.some(
            (value) =>
              String(
                value || ""
              )
                .toLowerCase()
                .includes(
                  query
                )
          );
        }
      );
    }, [
      orders,
      search,
      statusFilter,
    ]);

  useEffect(() => {
    setVisibleCount(
      ORDERS_PER_PAGE
    );
  }, [
    search,
    statusFilter,
  ]);

  const visibleOrders =
    useMemo(
      () =>
        filteredOrders.slice(
          0,
          visibleCount
        ),
      [
        filteredOrders,
        visibleCount,
      ]
    );

  const hasMore =
    visibleCount <
    filteredOrders.length;

  useEffect(() => {
    if (
      !open ||
      !hasMore ||
      !loaderRef.current
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const entry =
            entries[0];

          if (
            entry.isIntersecting
          ) {
            setVisibleCount(
              (current) =>
                Math.min(
                  current +
                    ORDERS_PER_PAGE,

                  filteredOrders.length
                )
            );
          }
        },
        {
          root: null,

          rootMargin:
            "300px",

          threshold: 0.1,
        }
      );

    observer.observe(
      loaderRef.current
    );

    return () =>
      observer.disconnect();
  }, [
    open,
    hasMore,
    filteredOrders.length,
  ]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/60 backdrop-blur-sm">
      <div className="flex h-full flex-col bg-slate-50">
        {/* HEADER */}

        <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1500px] items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-600" />

                <h2 className="text-xl font-extrabold text-slate-950 sm:text-2xl">
                  Payment Orders
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {book?.title ||
                  "Book"}{" "}
                ·{" "}
                {
                  filteredOrders.length
                }{" "}
                order
                {filteredOrders.length ===
                1
                  ? ""
                  : "s"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={
                  onRefresh
                }
                disabled={
                  loading
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={
                  onClose
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white transition hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* BODY */}

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
            {/* MODAL SUMMARY */}

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <StatCard
                icon={
                  <Receipt className="h-5 w-5" />
                }
                label="Orders"
                value={
                  summary.totalOrders
                }
              />

              <StatCard
                icon={
                  <CheckCircle2 className="h-5 w-5" />
                }
                label="Successful"
                value={
                  summary.successfulPayments
                }
              />

              <StatCard
                icon={
                  <XCircle className="h-5 w-5" />
                }
                label="Failed"
                value={
                  summary.failedPayments
                }
              />

              <StatCard
                icon={
                  <Loader2 className="h-5 w-5" />
                }
                label="Pending"
                value={
                  summary.pendingPayments
                }
              />

              <StatCard
                icon={
                  <CircleDollarSign className="h-5 w-5" />
                }
                label="Success Amount"
                value={money(
                  summary.successfulAmount,
                  book?.currency ||
                    "INR"
                )}
              />

              <StatCard
                icon={
                  <WalletCards className="h-5 w-5" />
                }
                label="Failed Amount"
                value={money(
                  summary.failedAmount,
                  book?.currency ||
                    "INR"
                )}
              />
            </div>

            {/* SEARCH */}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-xl">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    value={
                      search
                    }
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Search name, email, phone, order ID or PayU ID..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    "ALL",
                    "SUCCESS",
                    "FAILED",
                    "PENDING",
                  ].map(
                    (status) => (
                      <button
                        key={
                          status
                        }
                        type="button"
                        onClick={() =>
                          setStatusFilter(
                            status
                          )
                        }
                        className={`rounded-lg px-3 py-2 text-xs font-extrabold transition ${
                          statusFilter ===
                          status
                            ? "bg-blue-600 text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {status}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />

                {error}
              </div>
            )}

            {/* LOADING */}

            {loading &&
            orders.length ===
              0 ? (
              <div className="py-24 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />

                <p className="mt-3 text-sm font-semibold text-slate-500">
                  Loading payment
                  orders...
                </p>
              </div>
            ) : visibleOrders.length ===
              0 ? (
              <div className="mt-6 rounded-3xl border border-slate-200 bg-white py-20 text-center shadow-sm">
                <Receipt className="mx-auto h-10 w-10 text-slate-300" />

                <h3 className="mt-4 text-lg font-extrabold text-slate-900">
                  No orders found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  No payment
                  records match
                  your current
                  filters.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-6 space-y-4">
                  {visibleOrders.map(
                    (
                      order,
                      index
                    ) => (
                      <PaymentOrderCard
                        key={
                          order._id ||
                          order.orderId ||
                          index
                        }
                        order={
                          order
                        }
                        index={
                          index
                        }
                        currency={
                          book?.currency ||
                          "INR"
                        }
                      />
                    )
                  )}
                </div>

                {/* INFINITE SCROLL */}

                {hasMore && (
                  <div
                    ref={
                      loaderRef
                    }
                    className="flex items-center justify-center py-10"
                  >
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />

                    <span className="ml-3 text-sm font-semibold text-slate-500">
                      Loading more
                      orders...
                    </span>
                  </div>
                )}

                {!hasMore &&
                  visibleOrders.length >
                    0 && (
                    <div className="py-8 text-center">
                      <p className="text-xs font-semibold text-slate-400">
                        Showing all{" "}
                        {
                          filteredOrders.length
                        }{" "}
                        payment
                        orders
                      </p>
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function AdminBookDetails() {
  const navigate =
    useNavigate();

  const { bookId } =
    useParams();

  const token =
    useSelector(
      (state) =>
        state.auth.token
    );

  const coverInputRef =
    useRef(null);

  const pdfInputRef =
    useRef(null);

  const [book, setBook] =
    useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    notFound,
    setNotFound,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    editMode,
    setEditMode,
  ] = useState(false);

  const [form, setForm] =
    useState(
      INITIAL_FORM
    );

  const [
    originalForm,
    setOriginalForm,
  ] = useState(
    INITIAL_FORM
  );

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    coverFile,
    setCoverFile,
  ] = useState(null);

  const [
    pdfFile,
    setPdfFile,
  ] = useState(null);

  const [
    coverPreview,
    setCoverPreview,
  ] = useState("");

  const [
    updating,
    setUpdating,
  ] = useState(false);

  const [
    updateError,
    setUpdateError,
  ] = useState("");

  const [
    updateSuccess,
    setUpdateSuccess,
  ] = useState("");

  const [
    deleteModal,
    setDeleteModal,
  ] = useState(false);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const [
    deleteError,
    setDeleteError,
  ] = useState("");

  /* =======================================================
     PAYMENT STATE
  ======================================================= */

  const [
    paymentSummary,
    setPaymentSummary,
  ] = useState(
    INITIAL_PAYMENT_SUMMARY
  );

  const [
    paymentOrders,
    setPaymentOrders,
  ] = useState([]);

  const [
    paymentsLoading,
    setPaymentsLoading,
  ] = useState(false);

  const [
    paymentsError,
    setPaymentsError,
  ] = useState("");

  const [
    ordersModal,
    setOrdersModal,
  ] = useState(false);

  /* =======================================================
     FETCH BOOK
  ======================================================= */

  const fetchBook =
    useCallback(
      async (signal) => {
        try {
          setLoading(true);

          setError("");

          setNotFound(
            false
          );

          if (!bookId) {
            setNotFound(
              true
            );

            return;
          }

          if (!token) {
            throw new Error(
              "Authentication token is missing. Please login again."
            );
          }

          const response =
            await fetch(
              `${BASE_URL}/book/admin/${encodeURIComponent(
                bookId
              )}`,
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
            //
          }

          if (
            response.status ===
            404
          ) {
            setNotFound(
              true
            );

            setBook(
              null
            );

            return;
          }

          if (
            !response.ok
          ) {
            throw new Error(
              result?.error
                ?.message ||
                result?.error ||
                result?.message ||
                "Unable to load book."
            );
          }

          if (
            result?.success !==
              true ||
            !result?.data
          ) {
            setNotFound(
              true
            );

            setBook(
              null
            );

            return;
          }

          const fetchedBook =
            result.data;

          setBook(
            fetchedBook
          );

          const initialForm =
            createFormFromBook(
              fetchedBook
            );

          setForm(
            initialForm
          );

          setOriginalForm(
            initialForm
          );

          setCoverPreview(
            fetchedBook?.coverPageUrl ||
              ""
          );
        } catch (err) {
          if (
            err?.name ===
            "AbortError"
          ) {
            return;
          }

          console.error(
            "Fetch book error:",
            err
          );

          setError(
            err?.message ||
              "Unable to load book."
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
      ]
    );

  /* =======================================================
     FETCH PAYMENTS
  ======================================================= */

  const fetchPayments =
    useCallback(
      async (
        signal = undefined
      ) => {
        try {
          if (
            !bookId ||
            !token
          ) {
            return;
          }

          setPaymentsLoading(
            true
          );

          setPaymentsError(
            ""
          );
        const response = await fetch(
          `${BASE_URL}/admin/books/${encodeURIComponent(
            bookId
          )}/payments`,
          {
            method: "GET",

            headers: {
              Accept: "application/json",
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
            !response.ok
          ) {
            throw new Error(
              result?.error
                ?.message ||
                result?.error ||
                result?.message ||
                "Unable to load payment details."
            );
          }

          if (
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

          setPaymentSummary({
            ...INITIAL_PAYMENT_SUMMARY,

            ...(data.summary ||
              {}),
          });

          setPaymentOrders(
            Array.isArray(
              data.payments
            )
              ? data.payments
              : []
          );
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

          setPaymentsError(
            err?.message ||
              "Unable to load payment details."
          );
        } finally {
          if (
            !signal?.aborted
          ) {
            setPaymentsLoading(
              false
            );
          }
        }
      },
      [
        bookId,
        token,
      ]
    );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    const controller =
      new AbortController();

    fetchBook(
      controller.signal
    );

    fetchPayments(
      controller.signal
    );

    return () =>
      controller.abort();
  }, [
    fetchBook,
    fetchPayments,
  ]);

  /* =======================================================
     PREVIEW CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      if (
        coverPreview?.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          coverPreview
        );
      }
    };
  }, [
    coverPreview,
  ]);

  /* =======================================================
     CHANGES
  ======================================================= */

  const hasChanges =
    useMemo(() => {
      const formChanged =
        !areFormsEqual(
          form,
          originalForm
        );

      return (
        formChanged ||
        Boolean(
          coverFile
        ) ||
        Boolean(
          pdfFile
        )
      );
    }, [
      form,
      originalForm,
      coverFile,
      pdfFile,
    ]);

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (prev) => ({
        ...prev,

        [name]:
          value,
      })
    );

    if (
      errors[name]
    ) {
      setErrors(
        (prev) => ({
          ...prev,

          [name]:
            "",
        })
      );
    }

    setUpdateSuccess(
      ""
    );

    setUpdateError(
      ""
    );
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm =
    () => {
      const nextErrors =
        {};

      if (
        !form.title.trim()
      ) {
        nextErrors.title =
          "Title is required.";
      }

      if (
        !form.slug.trim()
      ) {
        nextErrors.slug =
          "Slug is required.";
      }

      if (
        !form.resourceType
      ) {
        nextErrors.resourceType =
          "Resource type is required.";
      }

      if (
        form.price ===
          "" ||
        form.price ===
          null
      ) {
        nextErrors.price =
          "Price is required.";
      } else if (
        !Number.isFinite(
          Number(
            form.price
          )
        ) ||
        Number(
          form.price
        ) < 0
      ) {
        nextErrors.price =
          "Enter a valid price.";
      }

      if (
        form.mrp !==
          "" &&
        (!Number.isFinite(
          Number(
            form.mrp
          )
        ) ||
          Number(
            form.mrp
          ) < 0)
      ) {
        nextErrors.mrp =
          "Enter a valid MRP.";
      }

      if (
        form.mrp !==
          "" &&
        Number(
          form.mrp
        ) <
          Number(
            form.price
          )
      ) {
        nextErrors.mrp =
          "MRP cannot be lower than price.";
      }

      if (
        !form.currency.trim()
      ) {
        nextErrors.currency =
          "Currency is required.";
      }

      if (
        !form.paymentUrl.trim()
      ) {
        nextErrors.paymentUrl =
          "Payment URL is required.";
      }

      if (
        form.paymentUrl.trim() &&
        !/^https?:\/\//i.test(
          form.paymentUrl.trim()
        )
      ) {
        nextErrors.paymentUrl =
          "Enter a valid http/https payment URL.";
      }

      if (
        !form.redirectUrl.trim()
      ) {
        nextErrors.redirectUrl =
          "Redirect URL is required.";
      }

      if (
        !form.pageKey.trim()
      ) {
        nextErrors.pageKey =
          "Page key is required.";
      }

      if (
        coverFile &&
        ![
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
        ].includes(
          coverFile.type
        )
      ) {
        nextErrors.coverPage =
          "Cover must be JPG, JPEG, PNG, or WEBP.";
      }

      if (
        pdfFile &&
        pdfFile.type !==
          "application/pdf"
      ) {
        nextErrors.pdf =
          "Only PDF files are allowed.";
      }

      setErrors(
        nextErrors
      );

      return (
        Object.keys(
          nextErrors
        ).length === 0
      );
    };

  /* =======================================================
     COVER
  ======================================================= */

  const handleCoverChange =
    (event) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      const allowed = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowed.includes(
          file.type
        )
      ) {
        setErrors(
          (prev) => ({
            ...prev,

            coverPage:
              "Cover must be JPG, JPEG, PNG, or WEBP.",
          })
        );

        event.target.value =
          "";

        return;
      }

      if (
        file.size >
        100 *
          1024 *
          1024
      ) {
        setErrors(
          (prev) => ({
            ...prev,

            coverPage:
              "Cover file must be smaller than 100 MB.",
          })
        );

        event.target.value =
          "";

        return;
      }

      if (
        coverPreview?.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          coverPreview
        );
      }

      setCoverFile(
        file
      );

      setCoverPreview(
        URL.createObjectURL(
          file
        )
      );

      setErrors(
        (prev) => ({
          ...prev,

          coverPage:
            "",
        })
      );

      setUpdateSuccess(
        ""
      );
    };

  /* =======================================================
     PDF
  ======================================================= */

  const handlePdfChange =
    (event) => {
      const file =
        event.target
          .files?.[0];

      if (!file) {
        return;
      }

      if (
        file.type !==
        "application/pdf"
      ) {
        setErrors(
          (prev) => ({
            ...prev,

            pdf:
              "Only PDF files are allowed.",
          })
        );

        event.target.value =
          "";

        return;
      }

      if (
        file.size >
        100 *
          1024 *
          1024
      ) {
        setErrors(
          (prev) => ({
            ...prev,

            pdf:
              "PDF must be smaller than 100 MB.",
          })
        );

        event.target.value =
          "";

        return;
      }

      setPdfFile(
        file
      );

      setErrors(
        (prev) => ({
          ...prev,

          pdf: "",
        })
      );

      setUpdateSuccess(
        ""
      );
    };

  /* =======================================================
     REMOVE FILES
  ======================================================= */

  const removeSelectedCover =
    () => {
      if (
        coverPreview?.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          coverPreview
        );
      }

      setCoverFile(
        null
      );

      setCoverPreview(
        book?.coverPageUrl ||
          ""
      );

      if (
        coverInputRef.current
      ) {
        coverInputRef.current.value =
          "";
      }
    };

  const removeSelectedPdf =
    () => {
      setPdfFile(
        null
      );

      if (
        pdfInputRef.current
      ) {
        pdfInputRef.current.value =
          "";
      }
    };

  /* =======================================================
     CANCEL EDIT
  ======================================================= */

  const cancelEdit =
    () => {
      setForm(
        originalForm
      );

      setErrors({});

      setCoverFile(
        null
      );

      setPdfFile(
        null
      );

      if (
        coverPreview?.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          coverPreview
        );
      }

      setCoverPreview(
        book?.coverPageUrl ||
          ""
      );

      if (
        coverInputRef.current
      ) {
        coverInputRef.current.value =
          "";
      }

      if (
        pdfInputRef.current
      ) {
        pdfInputRef.current.value =
          "";
      }

      setUpdateError(
        ""
      );

      setUpdateSuccess(
        ""
      );

      setEditMode(
        false
      );
    };

  /* =======================================================
     UPDATE
  ======================================================= */

  const handleUpdate =
    async (event) => {
      event.preventDefault();

      setUpdateError(
        ""
      );

      setUpdateSuccess(
        ""
      );

      if (!hasChanges) {
        return;
      }

      if (
        !validateForm()
      ) {
        return;
      }

      try {
        setUpdating(
          true
        );

        const data =
          new FormData();

        data.append(
          "title",
          form.title.trim()
        );

        data.append(
          "slug",
          form.slug.trim()
        );

        data.append(
          "subtitle",
          form.subtitle.trim()
        );

        data.append(
          "description",
          form.description.trim()
        );

        data.append(
          "resourceType",
          form.resourceType
        );

        data.append(
          "price",
          String(
            Number(
              form.price
            )
          )
        );

        data.append(
          "mrp",
          form.mrp === ""
            ? "0"
            : String(
                Number(
                  form.mrp
                )
              )
        );

        data.append(
          "currency",
          form.currency
            .trim()
            .toUpperCase()
        );

        data.append(
          "paymentUrl",
          form.paymentUrl.trim()
        );

        data.append(
          "redirectUrl",
          form.redirectUrl.trim()
        );

        data.append(
          "pageKey",
          form.pageKey.trim()
        );

        data.append(
          "fileName",
          form.fileName.trim()
        );

        data.append(
          "tags",
          JSON.stringify(
            stringToArray(
              form.tags
            )
          )
        );

        data.append(
          "topics",
          JSON.stringify(
            stringToArray(
              form.topics
            )
          )
        );

        data.append(
          "category",
          form.category.trim()
        );

        data.append(
          "highlights",
          JSON.stringify(
            stringToArray(
              form.highlights
            )
          )
        );

        data.append(
          "badge",
          form.badge.trim()
        );

        data.append(
          "isPublished",
          String(
            form.isPublished
          )
        );

        data.append(
          "isActive",
          String(
            form.isActive
          )
        );

        data.append(
          "isFeatured",
          String(
            form.isFeatured
          )
        );

        if (
          coverFile
        ) {
          data.append(
            "coverPage",
            coverFile
          );
        }

        if (pdfFile) {
          data.append(
            "pdf",
            pdfFile
          );
        }

        const response =
          await fetch(
            `${BASE_URL}/book/admin/${encodeURIComponent(
              bookId
            )}`,
            {
              method:
                "PATCH",

              headers: {
                Authorization: `Bearer ${token}`,
              },

              body:
                data,
            }
          );

        let result;

        try {
          result =
            await response.json();
        } catch {
          throw new Error(
            "Invalid response received from server."
          );
        }

        if (
          !response.ok
        ) {
          throw new Error(
            result?.error
              ?.message ||
              result?.error ||
              result?.message ||
              "Unable to update book."
          );
        }

        if (
          result?.success !==
          true
        ) {
          throw new Error(
            result?.error
              ?.message ||
              result?.message ||
              "Unable to update book."
          );
        }

        const updatedBook =
          result?.data ||
          null;

        if (
          updatedBook
        ) {
          setBook(
            updatedBook
          );

          const nextForm =
            createFormFromBook(
              updatedBook
            );

          setForm(
            nextForm
          );

          setOriginalForm(
            nextForm
          );

          setCoverPreview(
            updatedBook?.coverPageUrl ||
              ""
          );
        } else {
          const refreshResponse =
            await fetch(
              `${BASE_URL}/book/admin/${encodeURIComponent(
                bookId
              )}`,
              {
                headers: {
                  Accept:
                    "application/json",

                  Authorization: `Bearer ${token}`,
                },
              }
            );

          const refreshResult =
            await refreshResponse.json();

          if (
            refreshResponse.ok &&
            refreshResult?.success &&
            refreshResult?.data
          ) {
            const refreshed =
              refreshResult.data;

            setBook(
              refreshed
            );

            const nextForm =
              createFormFromBook(
                refreshed
              );

            setForm(
              nextForm
            );

            setOriginalForm(
              nextForm
            );

            setCoverPreview(
              refreshed?.coverPageUrl ||
                ""
            );
          }
        }

        setCoverFile(
          null
        );

        setPdfFile(
          null
        );

        if (
          coverInputRef.current
        ) {
          coverInputRef.current.value =
            "";
        }

        if (
          pdfInputRef.current
        ) {
          pdfInputRef.current.value =
            "";
        }

        setErrors({});

        setEditMode(
          false
        );

        setUpdateSuccess(
          "Book updated successfully."
        );
      } catch (err) {
        console.error(
          "Update book error:",
          err
        );

        setUpdateError(
          err?.message ||
            "Unable to update book."
        );
      } finally {
        setUpdating(
          false
        );
      }
    };

  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete =
    async () => {
      try {
        setDeleting(
          true
        );

        setDeleteError(
          ""
        );

        const response =
          await fetch(
            `${BASE_URL}/book/admin/${encodeURIComponent(
              bookId
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
          //
        }

        if (
          !response.ok
        ) {
          throw new Error(
            result?.error
              ?.message ||
              result?.error ||
              result?.message ||
              "Unable to delete book."
          );
        }

        navigate(
          "/admin/books",
          {
            replace:
              true,
          }
        );
      } catch (err) {
        console.error(
          "Delete book error:",
          err
        );

        setDeleteError(
          err?.message ||
            "Unable to delete book."
        );
      } finally {
        setDeleting(
          false
        );
      }
    };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 pt-28">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading book...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (notFound) {
    return (
      <main className="min-h-screen bg-slate-50 pt-28">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
              <BookOpen className="h-9 w-9 text-slate-400" />
            </div>

            <h1 className="mt-6 text-3xl font-extrabold text-slate-950">
              Book Not
              Found
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              The book may
              have been
              deleted or the
              provided book
              ID is invalid.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/books"
                )
              }
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />

              Back to Books
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 pt-28">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <div className="rounded-3xl border border-red-100 bg-white px-6 py-16 text-center">
            <AlertCircle className="mx-auto h-9 w-9 text-red-500" />

            <h1 className="mt-5 text-2xl font-bold text-slate-950">
              Unable to
              load book
            </h1>

            <p className="mt-3 text-sm text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"
            >
              <RefreshCw className="h-4 w-4" />

              Try Again
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>
          {book.title} |
          Admin
        </title>
      </Helmet>

      <main className="min-h-screen bg-slate-50 pt-24 text-slate-900 sm:pt-28">
        <div className="mx-auto max-w-[1500px] px-4 pb-20 sm:px-6 lg:px-8">
          {/* BACK */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/books"
              )
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />

            Back to Books
          </button>

          {/* HEADER */}

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="h-[240px] w-[170px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-md">
                {book.coverPageUrl ? (
                  <img
                    src={
                      book.coverPageUrl
                    }
                    alt={
                      book.title
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-10 w-10 text-slate-300" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge
                    value={
                      book.isPublished
                    }
                    trueText="Published"
                    falseText="Draft"
                  />

                  <StatusBadge
                    value={
                      book.isActive
                    }
                    trueText="Active"
                    falseText="Inactive"
                  />

                  {book.isFeatured && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                      <Sparkles className="h-3.5 w-3.5" />

                      Featured
                    </span>
                  )}
                </div>

                <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                  {
                    book.title
                  }
                </h1>

                {book.subtitle && (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    {
                      book.subtitle
                    }
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                    {formatResourceType(
                      book.resourceType
                    )}
                  </span>

                  {book.category && (
                    <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                      {
                        book.category
                      }
                    </span>
                  )}

                  {book.badge && (
                    <span className="rounded-lg bg-pink-50 px-3 py-1.5 text-xs font-bold text-pink-700">
                      {
                        book.badge
                      }
                    </span>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="text-2xl font-extrabold text-slate-950">
                    {money(
                      book.price,
                      book.currency
                    )}
                  </span>

                  {Number(
                    book.mrp
                  ) >
                    Number(
                      book.price
                    ) && (
                    <span className="text-sm text-slate-400 line-through">
                      {money(
                        book.mrp,
                        book.currency
                      )}
                    </span>
                  )}
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  {!editMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(
                          true
                        );

                        setUpdateSuccess(
                          ""
                        );
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      <Edit3 className="h-4 w-4" />

                      Edit Book
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setOrdersModal(
                        true
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    <Receipt className="h-4 w-4" />

                    Order Details

                    {paymentSummary.totalOrders >
                      0 && (
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px]">
                        {
                          paymentSummary.totalOrders
                        }
                      </span>
                    )}
                  </button>

                  {book.redirectUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        window.open(
                          book.redirectUrl,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <ExternalLink className="h-4 w-4" />

                      Open Product
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setDeleteModal(
                        true
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />

                    Delete
                  </button>
                </div>

                {updateSuccess && (
                  <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />

                    {
                      updateSuccess
                    }
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BOOK + PAYMENT STATS */}

          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={
                <Eye className="h-5 w-5" />
              }
              label="Views"
              value={
                book?.stats
                  ?.views || 0
              }
            />

            <StatCard
              icon={
                <CircleDollarSign className="h-5 w-5" />
              }
              label="Purchases"
              value={
                book?.stats
                  ?.purchases ||
                0
              }
            />

            <StatCard
              icon={
                <Receipt className="h-5 w-5" />
              }
              label="Total Orders"
              value={
                paymentSummary.totalOrders
              }
            />

            <StatCard
              icon={
                <CheckCircle2 className="h-5 w-5" />
              }
              label="Successful"
              value={
                paymentSummary.successfulPayments
              }
            />
          </div>

          {/* PAYMENT SUMMARY */}

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />

                  <h2 className="text-lg font-extrabold text-slate-950">
                    Payment
                    Overview
                  </h2>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Payment
                  performance for
                  this book.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOrdersModal(
                    true
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <Receipt className="h-4 w-4" />

                View Order
                Details
              </button>
            </div>

            {paymentsError && (
              <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                  <AlertCircle className="h-4 w-4" />

                  {
                    paymentsError
                  }
                </div>

                <button
                  type="button"
                  onClick={() =>
                    fetchPayments()
                  }
                  className="text-xs font-extrabold text-red-600"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <StatCard
                icon={
                  <Receipt className="h-5 w-5" />
                }
                label="Orders"
                value={
                  paymentSummary.totalOrders
                }
              />

              <StatCard
                icon={
                  <CheckCircle2 className="h-5 w-5" />
                }
                label="Success"
                value={
                  paymentSummary.successfulPayments
                }
              />

              <StatCard
                icon={
                  <XCircle className="h-5 w-5" />
                }
                label="Failed"
                value={
                  paymentSummary.failedPayments
                }
              />

              <StatCard
                icon={
                  <Loader2 className="h-5 w-5" />
                }
                label="Pending"
                value={
                  paymentSummary.pendingPayments
                }
              />

              <StatCard
                icon={
                  <CircleDollarSign className="h-5 w-5" />
                }
                label="Success Amount"
                value={money(
                  paymentSummary.successfulAmount,
                  book.currency
                )}
              />

              <StatCard
                icon={
                  <WalletCards className="h-5 w-5" />
                }
                label="Failed Amount"
                value={money(
                  paymentSummary.failedAmount,
                  book.currency
                )}
              />
            </div>
          </section>

          {/* EDIT / VIEW */}

          {editMode ? (
            <form
              onSubmit={
                handleUpdate
              }
              className="mt-6"
            >
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-950">
                      Edit Book
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Update book
                      information
                      and files.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={
                        cancelEdit
                      }
                      disabled={
                        updating
                      }
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        !hasChanges ||
                        updating
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-slate-300"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />

                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />

                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {updateError && (
                  <div className="mx-5 mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 sm:mx-6">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    {
                      updateError
                    }
                  </div>
                )}

                {/* BASIC */}

                <div className="border-b border-slate-100 p-5 sm:p-6">
                  <h3 className="mb-5 flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    <Info className="h-4 w-4 text-blue-600" />

                    Basic
                    Information
                  </h3>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <InputField
                      label="Title"
                      name="title"
                      value={
                        form.title
                      }
                      onChange={
                        handleChange
                      }
                      error={
                        errors.title
                      }
                      required
                    />

                    <InputField
                      label="Slug"
                      name="slug"
                      value={
                        form.slug
                      }
                      onChange={
                        handleChange
                      }
                      error={
                        errors.slug
                      }
                      required
                    />

                    <div className="lg:col-span-2">
                      <InputField
                        label="Subtitle"
                        name="subtitle"
                        value={
                          form.subtitle
                        }
                        onChange={
                          handleChange
                        }
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <TextAreaField
                        label="Description"
                        name="description"
                        value={
                          form.description
                        }
                        onChange={
                          handleChange
                        }
                        rows={5}
                      />
                    </div>

                    <SelectField
                      label="Resource Type"
                      name="resourceType"
                      value={
                        form.resourceType
                      }
                      onChange={
                        handleChange
                      }
                      error={
                        errors.resourceType
                      }
                      required
                      options={RESOURCE_TYPES.map(
                        (type) => ({
                          value:
                            type,

                          label:
                            formatResourceType(
                              type
                            ),
                        })
                      )}
                    />

                    <InputField
                      label="Category"
                      name="category"
                      value={
                        form.category
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <InputField
                      label="Badge"
                      name="badge"
                      value={
                        form.badge
                      }
                      onChange={
                        handleChange
                      }
                    />

                    <InputField
                      label="File Name"
                      name="fileName"
                      value={
                        form.fileName
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>
                </div>

                {/* PRICING */}

                <div className="border-b border-slate-100 p-5 sm:p-6">
                  <h3 className="mb-5 flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    <CircleDollarSign className="h-4 w-4 text-blue-600" />

                    Pricing
                  </h3>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <InputField
                      label="Price"
                      name="price"
                      type="number"
                      min="0"
                      value={
                        form.price
                      }
                      onChange={
                        handleChange
                      }
                      error={
                        errors.price
                      }
                      required
                    />

                    <InputField
                      label="MRP"
                      name="mrp"
                      type="number"
                      min="0"
                      value={
                        form.mrp
                      }
                      onChange={
                        handleChange
                      }
                      error={
                        errors.mrp
                      }
                    />

                    <InputField
                      label="Currency"
                      name="currency"
                      value={
                        form.currency
                      }
                      onChange={
                        handleChange
                      }
                      error={
                        errors.currency
                      }
                      required
                    />
                  </div>
                </div>

                {/* URL */}

                <div className="border-b border-slate-100 p-5 sm:p-6">
                  <h3 className="mb-5 flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    <LinkIcon className="h-4 w-4 text-blue-600" />

                    URLs &
                    Routing
                  </h3>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <InputField
                      label="Payment URL"
                      name="paymentUrl"
                      value={
                        form.paymentUrl
                      }
                      onChange={
                        handleChange
                      }
                      error={
                        errors.paymentUrl
                      }
                      required
                    />

                    <InputField
                      label="Redirect URL"
                      name="redirectUrl"
                      value={
                        form.redirectUrl
                      }
                      onChange={
                        handleChange
                      }
                      error={
                        errors.redirectUrl
                      }
                      required
                    />

                    <InputField
                      label="Page Key"
                      name="pageKey"
                      value={
                        form.pageKey
                      }
                      onChange={
                        handleChange
                      }
                      error={
                        errors.pageKey
                      }
                      required
                    />
                  </div>
                </div>

                {/* CLASSIFICATION */}

                <div className="border-b border-slate-100 p-5 sm:p-6">
                  <h3 className="mb-5 flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    <Tag className="h-4 w-4 text-blue-600" />

                    Classification
                    & Content
                  </h3>

                  <div className="grid grid-cols-1 gap-5">
                    <InputField
                      label="Tags"
                      name="tags"
                      value={
                        form.tags
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Java, LLD, Design Patterns"
                    />

                    <InputField
                      label="Topics"
                      name="topics"
                      value={
                        form.topics
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="OOPS, SOLID, System Design"
                    />

                    <TextAreaField
                      label="Highlights"
                      name="highlights"
                      value={
                        form.highlights
                      }
                      onChange={
                        handleChange
                      }
                      rows={3}
                    />
                  </div>
                </div>

                {/* FILES */}

                <div className="border-b border-slate-100 p-5 sm:p-6">
                  <h3 className="mb-1 flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    <Upload className="h-4 w-4 text-blue-600" />

                    Replace Files
                  </h3>

                  <p className="mb-5 text-xs text-slate-500">
                    Both files
                    are optional.
                  </p>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-700">
                        Cover Image
                      </label>

                      <div className="rounded-2xl border border-slate-200 p-4">
                        <div className="flex gap-4">
                          <div className="h-[145px] w-[105px] shrink-0 overflow-hidden rounded-xl bg-slate-100">
                            {coverPreview ? (
                              <img
                                src={
                                  coverPreview
                                }
                                alt="Cover preview"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <ImageIcon className="h-7 w-7 text-slate-300" />
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-slate-700">
                              {coverFile
                                ? coverFile.name
                                : "Current cover"}
                            </p>

                            <input
                              ref={
                                coverInputRef
                              }
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={
                                handleCoverChange
                              }
                              className="hidden"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                coverInputRef.current?.click()
                              }
                              className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold"
                            >
                              Choose New
                              Cover
                            </button>

                            {coverFile && (
                              <button
                                type="button"
                                onClick={
                                  removeSelectedCover
                                }
                                className="ml-2 text-xs font-bold text-red-500"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {errors.coverPage && (
                        <p className="mt-2 text-xs text-red-500">
                          {
                            errors.coverPage
                          }
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold text-slate-700">
                        PDF File
                      </label>

                      <div className="flex min-h-[177px] flex-col justify-between rounded-2xl border border-slate-200 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                            <FileText className="h-5 w-5 text-red-500" />
                          </div>

                          <p className="text-xs font-bold text-slate-700">
                            {pdfFile
                              ? pdfFile.name
                              : book.fileName ||
                                "Existing PDF"}
                          </p>
                        </div>

                        <div>
                          <input
                            ref={
                              pdfInputRef
                            }
                            type="file"
                            accept="application/pdf"
                            onChange={
                              handlePdfChange
                            }
                            className="hidden"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              pdfInputRef.current?.click()
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold"
                          >
                            Choose New
                            PDF
                          </button>

                          {pdfFile && (
                            <button
                              type="button"
                              onClick={
                                removeSelectedPdf
                              }
                              className="ml-3 text-xs font-bold text-red-500"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>

                      {errors.pdf && (
                        <p className="mt-2 text-xs text-red-500">
                          {
                            errors.pdf
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* STATUS */}

                <div className="p-5 sm:p-6">
                  <h3 className="mb-5 text-sm font-extrabold text-slate-900">
                    Product
                    Status
                  </h3>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <ToggleField
                      label="Published"
                      description="Product is visible publicly."
                      checked={
                        form.isPublished
                      }
                      onChange={(
                        value
                      ) =>
                        setForm(
                          (
                            prev
                          ) => ({
                            ...prev,

                            isPublished:
                              value,
                          })
                        )
                      }
                    />

                    <ToggleField
                      label="Active"
                      description="Product is enabled."
                      checked={
                        form.isActive
                      }
                      onChange={(
                        value
                      ) =>
                        setForm(
                          (
                            prev
                          ) => ({
                            ...prev,

                            isActive:
                              value,
                          })
                        )
                      }
                    />

                    <ToggleField
                      label="Featured"
                      description="Prioritize this product."
                      checked={
                        form.isFeatured
                      }
                      onChange={(
                        value
                      ) =>
                        setForm(
                          (
                            prev
                          ) => ({
                            ...prev,

                            isFeatured:
                              value,
                          })
                        )
                      }
                    />
                  </div>

                  <div className="mt-7 flex justify-end border-t border-slate-100 pt-5">
                    <button
                      type="submit"
                      disabled={
                        !hasChanges ||
                        updating
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white disabled:bg-slate-300"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />

                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />

                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="space-y-6 xl:col-span-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-lg font-extrabold text-slate-950">
                    Description
                  </h2>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    {book.description ||
                      "No description provided."}
                  </p>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
                    <ArrayDisplay
                      title="Tags"
                      values={
                        book.tags
                      }
                      color="blue"
                    />

                    <ArrayDisplay
                      title="Topics"
                      values={
                        book.topics
                      }
                      color="violet"
                    />
                  </div>

                  <div className="mt-7 border-t border-slate-100 pt-7">
                    <ArrayDisplay
                      title="Highlights"
                      values={
                        book.highlights
                      }
                      color="emerald"
                    />
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="mb-3 text-lg font-extrabold text-slate-950">
                    URLs &
                    Files
                  </h2>

                  <DetailRow
                    label="Payment URL"
                    value={
                      book.paymentUrl
                    }
                  />

                  <DetailRow
                    label="Redirect URL"
                    value={
                      book.redirectUrl
                    }
                  />

                  <DetailRow
                    label="Cover Page URL"
                    value={
                      book.coverPageUrl
                    }
                  />

                  <DetailRow
                    label="PDF URL"
                    value={
                      book.pdfUrl
                    }
                  />

                  <DetailRow
                    label="File Name"
                    value={
                      book.fileName
                    }
                  />
                </section>
              </div>

              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-2 text-base font-extrabold text-slate-950">
                    Product
                    Details
                  </h2>

                  <DetailRow
                    label="Book ID"
                    value={
                      book._id
                    }
                    mono
                  />

                  <DetailRow
                    label="Slug"
                    value={
                      book.slug
                    }
                  />

                  <DetailRow
                    label="Page Key"
                    value={
                      book.pageKey
                    }
                  />

                  <DetailRow
                    label="Resource Type"
                    value={formatResourceType(
                      book.resourceType
                    )}
                  />

                  <DetailRow
                    label="Category"
                    value={
                      book.category
                    }
                  />

                  <DetailRow
                    label="Currency"
                    value={
                      book.currency
                    }
                  />

                  <DetailRow
                    label="Price"
                    value={money(
                      book.price,
                      book.currency
                    )}
                  />

                  <DetailRow
                    label="MRP"
                    value={money(
                      book.mrp,
                      book.currency
                    )}
                  />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-2 text-base font-extrabold text-slate-950">
                    Audit
                    Information
                  </h2>

                  <DetailRow
                    label="Created At"
                    value={formatDate(
                      book.createdAt
                    )}
                  />

                  <DetailRow
                    label="Updated At"
                    value={formatDate(
                      book.updatedAt
                    )}
                  />

                  <DetailRow
                    label="Created By"
                    value={
                      book.createdBy
                    }
                    mono
                  />

                  <DetailRow
                    label="Updated By"
                    value={
                      book.updatedBy
                    }
                    mono
                  />
                </section>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ORDERS */}

      <OrdersModal
        open={
          ordersModal
        }
        onClose={() =>
          setOrdersModal(
            false
          )
        }
        orders={
          paymentOrders
        }
        loading={
          paymentsLoading
        }
        error={
          paymentsError
        }
        summary={
          paymentSummary
        }
        book={
          book
        }
        onRefresh={() =>
          fetchPayments()
        }
      />

      {/* DELETE */}

      {deleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>

            <h2 className="mt-5 text-2xl font-extrabold text-slate-950">
              Delete Book?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              You are about
              to permanently
              delete{" "}

              <strong className="text-slate-800">
                {
                  book.title
                }
              </strong>

              . This action
              cannot be
              undone.
            </p>

            {deleteError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
                {
                  deleteError
                }
              </div>
            )}

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                disabled={
                  deleting
                }
                onClick={() => {
                  setDeleteModal(
                    false
                  );

                  setDeleteError(
                    ""
                  );
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  deleting
                }
                onClick={
                  handleDelete
                }
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />

                    Delete Book
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}