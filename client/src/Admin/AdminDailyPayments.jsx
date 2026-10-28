
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  CreditCard,
  Download,
  Eye,
  Filter,
  IndianRupee,
  Mail,
  Search,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
  X,
  XCircle,
  RotateCcw,
} from "lucide-react";

import BASE_URL from "../utils/Url.js";

/* ============================================================
   CONFIGURATION AND HELPERS
============================================================ */

const API = `${String(BASE_URL).replace(/\/$/, "")}/admin/books`;

const IST = "Asia/Kolkata";

const todayIST = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (key) =>
    parts.find((p) => p.type === key)?.value || "";

  return `${get("year")}-${get("month")}-${get("day")}`;
};

const readTheme = () => {
  try {
    return localStorage.getItem("theme") === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

const getToken = () => {
  try {
    const token = localStorage.getItem("token");

    if (token) return token;

    const persisted = localStorage.getItem("persist:root");

    if (persisted) {
      const root = JSON.parse(persisted);
      const auth = root.auth
        ? JSON.parse(root.auth)
        : null;

      return auth?.token || auth?.user?.token || null;
    }
  } catch {
    // Ignore invalid persisted storage.
  }

  return null;
};

const n = (value) => Number(value || 0);

const currencyOf = (p) =>
  p?.payment?.currency || p?.book?.currency || "INR";

const amountOf = (p) =>
  n(p?.payment?.amount ?? p?.book?.price);

const money = (value, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n(value));
  } catch {
    return `${currency} ${n(value).toFixed(2)}`;
  }
};

const fmtNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(n(value));

const fmtDate = (value, includeTime = true) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      : {}),
  }).format(date);
};

const affiliateCode = (p) =>
  String(p?.payment?.affiliateCode || "").trim();

const isDirect = (code) => {
  const normalized = String(code || "")
    .trim()
    .toLowerCase();

  return (
    !normalized ||
    normalized === "tt" ||
    normalized === "no_affiliate"
  );
};

const sourceOf = (p) => {
  const code = affiliateCode(p);

  if (code.toLowerCase() === "tt") {
    return "Direct · TT";
  }

  if (!code) return "Direct / Unattributed";

  return `Affiliate · ${code}`;
};

const statusOf = (p) =>
  String(p?.payment?.status || "UNKNOWN").toUpperCase();

const methodOf = (p) =>
  p?.payment?.paymentMethod ||
  p?.payment?.method ||
  p?.payment?.paymentMode ||
  "—";

const gatewayOf = (p) =>
  p?.payment?.gateway ||
  p?.payment?.provider ||
  "—";

const copyText = async (value) => {
  if (!value || !navigator.clipboard) return;
  try {
    await navigator.clipboard.writeText(String(value));
  } catch {
    // Clipboard access might be restricted.
  }
};

const CSVCell = (value) => {
  let s = String(value ?? "");

  if (/^\s*[=+\-@]/.test(s)) s = `'${s}`;

  return `"${s.replace(/"/g, '""')}"`;
};

/* ============================================================
   BADGES
============================================================ */

function StatusBadge({ status, dark }) {
  const s = String(status || "UNKNOWN").toUpperCase();

  let color = dark
    ? "bg-slate-800 text-slate-300 border-slate-700"
    : "bg-slate-100 text-slate-600 border-slate-200";

  if (s === "SUCCESS" || s === "SENT") {
    color = dark
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (s === "FAILED" || s === "CANCELLED") {
    color = dark
      ? "bg-red-500/10 text-red-300 border-red-500/30"
      : "bg-red-50 text-red-700 border-red-200";
  } else if (s === "PENDING" || s === "PROCESSING") {
    color = dark
      ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
      : "bg-amber-50 text-amber-700 border-amber-200";
  } else if (
    s === "REFUNDED" ||
    s === "PARTIALLY_REFUNDED"
  ) {
    color = dark
      ? "bg-violet-500/10 text-violet-300 border-violet-500/30"
      : "bg-violet-50 text-violet-700 border-violet-200";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold tracking-wide ${color}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.replaceAll("_", " ")}
    </span>
  );
}

function SourceBadge({ code, dark }) {
  const direct = isDirect(code);

  return (
    <span
      className={`inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-bold ${
        direct
          ? dark
            ? "border-sky-500/20 bg-sky-500/10 text-sky-300"
            : "border-sky-200 bg-sky-50 text-sky-700"
          : dark
          ? "border-orange-500/20 bg-orange-500/10 text-orange-300"
          : "border-orange-200 bg-orange-50 text-orange-700"
      }`}
    >
      {direct
        ? code?.toLowerCase() === "tt"
          ? "Direct · TT"
          : "Direct / Unattributed"
        : `Affiliate · ${code}`}
    </span>
  );
}

/* ============================================================
   METRIC CARD
============================================================ */

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  dark,
  variant = "orange",
}) {
  const styles = {
    orange: dark
      ? "bg-orange-500/10 text-orange-400"
      : "bg-orange-50 text-orange-600",

    green: dark
      ? "bg-emerald-500/10 text-emerald-400"
      : "bg-emerald-50 text-emerald-600",

    red: dark
      ? "bg-red-500/10 text-red-400"
      : "bg-red-50 text-red-600",

    blue: dark
      ? "bg-sky-500/10 text-sky-400"
      : "bg-sky-50 text-sky-600",

    purple: dark
      ? "bg-violet-500/10 text-violet-400"
      : "bg-violet-50 text-violet-600",
  };

  return (
    <div
      className={`min-w-0 rounded-2xl border p-4 transition-colors sm:p-5 ${
        dark
          ? "border-slate-800 bg-slate-900"
          : "border-orange-100 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={`text-xs font-semibold ${
            dark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {title}
        </p>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles[variant]}`}
        >
          <Icon size={18} />
        </div>
      </div>

      <p
        className={`mt-3 break-words text-xl font-black tracking-tight sm:text-2xl ${
          dark ? "text-white" : "text-slate-900"
        }`}
      >
        {value}
      </p>

      <p
        className={`mt-2 text-[11px] leading-5 ${
          dark ? "text-slate-500" : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

/* ============================================================
   SECTION
============================================================ */

function Section({ title, subtitle, icon: Icon, dark, children }) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border ${
        dark
          ? "border-slate-800 bg-slate-900"
          : "border-orange-100 bg-white"
      }`}
    >
      <div
        className={`flex items-center gap-3 border-b p-4 sm:p-5 ${
          dark ? "border-slate-800" : "border-orange-100"
        }`}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            dark
              ? "bg-orange-500/10 text-orange-400"
              : "bg-orange-50 text-orange-600"
          }`}
        >
          <Icon size={19} />
        </span>

        <div>
          <h2
            className={`text-sm font-extrabold sm:text-base ${
              dark ? "text-white" : "text-slate-900"
            }`}
          >
            {title}
          </h2>

          {subtitle && (
            <p
              className={`mt-1 text-xs ${
                dark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

/* ============================================================
   DETAILS ROW
============================================================ */

function Detail({ label, value, dark, copy = false }) {
  const v =
    value === null || value === undefined || value === ""
      ? "—"
      : typeof value === "boolean"
      ? value
        ? "Yes"
        : "No"
      : String(value);

  return (
    <div
      className={`flex items-start justify-between gap-4 border-b py-3 last:border-0 ${
        dark ? "border-slate-800" : "border-slate-100"
      }`}
    >
      <span
        className={`shrink-0 text-xs ${
          dark ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {label}
      </span>

      <div className="flex min-w-0 items-start gap-2">
        <span
          className={`break-all text-right text-xs font-semibold ${
            dark ? "text-slate-100" : "text-slate-800"
          }`}
        >
          {v}
        </span>

        {copy && v !== "—" && (
          <button
            type="button"
            onClick={() => copyText(v)}
            title={`Copy ${label}`}
            className="shrink-0 text-orange-500"
          >
            <Copy size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   MODAL SHELL
============================================================ */

function Modal({ title, subtitle, onClose, dark, children }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl ${
          dark
            ? "border-slate-700 bg-slate-900"
            : "border-orange-100 bg-white"
        }`}
      >
        <div
          className={`flex shrink-0 items-start justify-between gap-3 border-b p-4 sm:p-5 ${
            dark ? "border-slate-800" : "border-orange-100"
          }`}
        >
          <div>
            <h2
              className={`text-lg font-black ${
                dark ? "text-white" : "text-slate-900"
              }`}
            >
              {title}
            </h2>

            {subtitle && (
              <p
                className={`mt-1 text-xs ${
                  dark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-2 ${
              dark
                ? "bg-slate-800 text-slate-300"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <X size={19} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PAYMENT DETAILS MODAL
============================================================ */

function PaymentDetails({ payment, dark, onClose, onDelete }) {
  const currency = currencyOf(payment);

  const groups = [
    {
      title: "Order Information",
      rows: [
        ["Order ID", payment.orderId, true],
        ["Database ID", payment._id, true],
        ["Book ID", payment.bookId, true],
        ["Order Status", payment.orderStatus],
        ["Created At", fmtDate(payment.createdAt)],
        ["Updated At", fmtDate(payment.updatedAt)],
      ],
    },
    {
      title: "Customer Details",
      rows: [
        ["Name", payment.customer?.name],
        ["Email", payment.customer?.email, true],
        ["Phone", payment.customer?.phone, true],
      ],
    },
    {
      title: "Book Details",
      rows: [
        ["Title", payment.book?.title],
        ["Price", money(payment.book?.price, currency)],
        [
          "MRP",
          payment.book?.mrp != null
            ? money(payment.book.mrp, currency)
            : null,
        ],
        ["Currency", currency],
      ],
    },
    {
      title: "Payment & Gateway",
      rows: [
        ["Payment Status", payment.payment?.status],
        ["Amount", money(amountOf(payment), currency)],
        ["Gateway", gatewayOf(payment)],
        ["Payment Method", methodOf(payment)],
        ["Transaction ID", payment.payment?.transactionId, true],
        [
          "Gateway Transaction",
          payment.payment?.gatewayTransactionId,
          true,
        ],
        [
          "Gateway Order ID",
          payment.payment?.gatewayOrderId,
          true,
        ],
        ["Payment ID", payment.payment?.paymentId, true],
        [
          "Bank Reference",
          payment.payment?.bankReference ||
            payment.payment?.bankReferenceNumber,
          true,
        ],
        ["Paid At", fmtDate(payment.payment?.paidAt)],
        ["Failed At", fmtDate(payment.payment?.failedAt)],
        ["Failure Reason", payment.payment?.failureReason],
      ],
    },
    {
      title: "Sales Attribution",
      rows: [
        ["Revenue Source", sourceOf(payment)],
        ["Referral Code", affiliateCode(payment) || "None"],
        [
          "Affiliate Sale",
          isDirect(affiliateCode(payment)) ? "No" : "Yes",
        ],
        ["Coupon Applied", payment.coupon?.applied],
        ["Coupon Code", payment.coupon?.code],
        ["Discount Type", payment.coupon?.discountType],
        [
          "Discount",
          money(payment.coupon?.discountAmount, currency),
        ],
        [
          "Coupon Final Amount",
          payment.coupon?.finalAmount != null
            ? money(payment.coupon.finalAmount, currency)
            : null,
        ],
      ],
    },
    {
      title: "Refund Information",
      rows: [
        [
          "Refund Status",
          payment.refund?.status || "NOT_REQUESTED",
        ],
        [
          "Requested Amount",
          money(payment.refund?.requestedAmount, currency),
        ],
        [
          "Refunded Amount",
          money(payment.refund?.refundedAmount, currency),
        ],
        [
          "Remaining Amount",
          money(payment.refund?.remainingAmount, currency),
        ],
        ["Refund Reason", payment.refund?.reason],
        ["Refunded At", fmtDate(payment.refund?.refundedAt)],
      ],
    },
    {
      title: "Access & Verification",
      rows: [
        ["Access Revoked", payment.access?.revoked],
        ["Access Count", payment.access?.accessCount],
        [
          "Last Accessed",
          fmtDate(payment.access?.lastAccessedAt),
        ],
        [
          "Callback Verified",
          payment.verification?.callbackHashVerified,
        ],
        ["PayU Verified", payment.verification?.payuVerified],
        [
          "Amount Verified",
          payment.verification?.amountVerified,
        ],
      ],
    },
    {
      title: "Reminder History",
      rows: [
        ["Reminders Sent", payment.pendingMail?.sentCount],
        ["Last Status", payment.pendingMail?.lastStatus],
        [
          "First Sent",
          fmtDate(payment.pendingMail?.firstSentAt),
        ],
        [
          "Last Sent",
          fmtDate(payment.pendingMail?.lastSentAt),
        ],
      ],
    },
  ];

  return (
    <Modal
      title="Transaction Details"
      subtitle={payment.orderId}
      dark={dark}
      onClose={onClose}
    >
      <div
        className={`mb-5 rounded-2xl border p-5 ${
          dark
            ? "border-orange-500/25 bg-orange-500/5"
            : "border-orange-200 bg-orange-50"
        }`}
      >
        <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
          Payment Amount
        </p>

        <p
          className={`mt-2 text-3xl font-black ${
            dark ? "text-white" : "text-slate-900"
          }`}
        >
          {money(amountOf(payment), currency)}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={statusOf(payment)} dark={dark} />
          <SourceBadge
            code={affiliateCode(payment)}
            dark={dark}
          />
        </div>
      </div>

      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-2 text-sm font-extrabold text-orange-500">
              {group.title}
            </h3>

            {group.rows.map(([label, value, copy]) => (
              <Detail
                key={label}
                label={label}
                value={value}
                copy={copy}
                dark={dark}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            onClose();
            onDelete(payment);
          }}
          className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-500"
        >
          <Trash2 size={16} />
          Delete Order
        </button>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-orange-600 px-4 py-3 text-xs font-bold text-white"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

/* ============================================================
   DELETE CONFIRMATION MODAL
============================================================ */

function DeleteConfirmation({
  payment,
  dark,
  deleting,
  error,
  onClose,
  onConfirm,
}) {
  return (
    <Modal
      title="Delete Payment?"
      subtitle="This action permanently deletes the selected order."
      dark={dark}
      onClose={deleting ? () => {} : onClose}
    >
      <div
        className={`mb-5 flex gap-3 rounded-xl border p-4 ${
          dark
            ? "border-red-500/25 bg-red-500/10"
            : "border-red-200 bg-red-50"
        }`}
      >
        <AlertCircle
          size={22}
          className="shrink-0 text-red-500"
        />

        <p
          className={`text-xs leading-6 ${
            dark ? "text-red-300" : "text-red-700"
          }`}
        >
          This permanently removes the order from your database,
          including its recorded payment information.
          It does not issue a payment gateway refund.
        </p>
      </div>

      <div
        className={`rounded-xl border p-4 ${
          dark
            ? "border-slate-800 bg-slate-800/50"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        <Detail
          label="Order ID"
          value={payment.orderId}
          dark={dark}
        />

        <Detail
          label="Customer"
          value={payment.customer?.email}
          dark={dark}
        />

        <Detail
          label="Book"
          value={payment.book?.title}
          dark={dark}
        />

        <Detail
          label="Amount"
          value={money(amountOf(payment), currencyOf(payment))}
          dark={dark}
        />

        <Detail
          label="Status"
          value={statusOf(payment)}
          dark={dark}
        />
      </div>

      {error && (
        <p className="mt-4 text-xs font-semibold text-red-500">
          {error}
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={deleting}
          onClick={onClose}
          className={`rounded-xl border px-4 py-3 text-sm font-bold disabled:opacity-50 ${
            dark
              ? "border-slate-700 text-slate-200"
              : "border-slate-200 text-slate-700"
          }`}
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={deleting}
          onClick={onConfirm}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
        >
          <Trash2 size={16} />
          {deleting ? "Deleting..." : "Delete Permanently"}
        </button>
      </div>
    </Modal>
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function AdminDailyPayments() {
  const [theme, setTheme] = useState(readTheme);
  const dark = theme === "dark";

  const [date, setDate] = useState(todayIST);
  const [status, setStatus] = useState("ALL");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");

  const [tab, setTab] = useState("payments");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);
  const [notice, setNotice] = useState("");

  /* ========================================================
     THEME SYNC
  ======================================================== */

  useEffect(() => {
    const sync = () => {
      setTheme(readTheme());
    };

    sync();

    const events = [
      "storage",
      "themeChange",
      "theme-change",
      "themeChanged",
      "focus",
    ];

    events.forEach((event) =>
      window.addEventListener(event, sync)
    );

    const observer = new MutationObserver(sync);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, sync)
      );

      observer.disconnect();
    };
  }, []);

  /* ========================================================
     FETCH DATA
  ======================================================== */

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const token = getToken();

        if (!token) {
          throw new Error(
            "Authentication token not found. Please log in again."
          );
        }

        const params = new URLSearchParams({
          date,
          page: String(page),
          limit: String(limit),
        });

        if (status !== "ALL") {
          params.set("status", status);
        }

        const response = await fetch(
          `${API}/daily?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            credentials: "include",
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load payment data."
          );
        }

        if (!controller.signal.aborted) {
          setData(result.data);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setData(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => controller.abort();
  }, [date, status, page, limit, reloadKey]);

  /* ========================================================
     DELETE PAYMENT
  ======================================================== */

  const openDelete = (payment) => {
    setDeleteError("");
    setDeleteTarget(payment);
  };

  const closeDelete = () => {
    if (!deleting) {
      setDeleteTarget(null);
      setDeleteError("");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;

    setDeleting(true);
    setDeleteError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Please log in again.");
      }

      const bookId = deleteTarget.bookId;
      const orderId = deleteTarget._id;

      if (!bookId || !orderId) {
        throw new Error(
          "Book ID or database order ID is missing."
        );
      }

      const url =
        `${API}/${encodeURIComponent(bookId)}` +
        `/payments/${encodeURIComponent(orderId)}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to delete payment."
        );
      }

      setSelectedPayment(null);
      setDeleteTarget(null);

      setNotice(
        `Order ${deleteTarget.orderId || ""} deleted successfully.`
      );

      // Return to the previous page only when the deleted
      // order was the last item on the final page.
      if (
        data?.pagination?.totalItems ===
          (page - 1) * limit + 1 &&
        page > 1
      ) {
        setPage((current) => current - 1);
      } else {
        setReloadKey((current) => current + 1);
      }
    } catch (err) {
      setDeleteError(err.message || "Deletion failed.");
    } finally {
      setDeleting(false);
    }
  };

  /* ========================================================
     DATA NORMALIZATION
  ======================================================== */

  const summary = data?.summary || {};
  const stats = summary.payments || {};
  const revenue = summary.revenue || {};
  const breakdown = data?.breakdown || {};
  const payments = data?.payments || [];
  const pagination = data?.pagination || {};

  const currencies = breakdown.currencies || [];
  const mixedCurrency = currencies.length > 1;

  const currency =
    currencies.length === 1
      ? currencies[0].currency || "INR"
      : "INR";

  const showMoney = (value) =>
    mixedCurrency
      ? "Multiple currencies"
      : money(value, currency);

  const totalOrders = n(summary.totalOrders);
  const successCount = n(stats.successfulPayments);
  const failedCount = n(stats.failedPayments);
  const pendingCount = n(stats.pendingPayments);

  const successRate =
    totalOrders > 0
      ? (successCount / totalOrders) * 100
      : 0;

  /* ========================================================
     DIRECT VS AFFILIATE
     tt = DIRECT, NEVER AFFILIATE
  ======================================================== */

  const sourceAnalytics = useMemo(() => {
    const items = breakdown.affiliates || [];

    let directOrders = 0;
    let directSuccessful = 0;
    let directGross = 0;

    let affiliateOrders = 0;
    let affiliateSuccessful = 0;
    let affiliateGross = 0;

    const affiliateList = [];
    const directList = [];

    for (const item of items) {
      const code = String(
        item.affiliateCode || "NO_AFFILIATE"
      ).trim();

      const entry = {
        ...item,
        affiliateCode: code,
      };

      if (isDirect(code)) {
        directOrders += n(item.totalOrders);
        directSuccessful += n(item.successfulOrders);
        directGross += n(item.grossPaidAmount);
        directList.push(entry);
      } else {
        affiliateOrders += n(item.totalOrders);
        affiliateSuccessful += n(item.successfulOrders);
        affiliateGross += n(item.grossPaidAmount);
        affiliateList.push(entry);
      }
    }

    return {
      directOrders,
      directSuccessful,
      directGross,
      affiliateOrders,
      affiliateSuccessful,
      affiliateGross,
      directList,
      affiliateList,
    };
  }, [breakdown.affiliates]);

  /* ========================================================
     FILTER CURRENT PAGE
  ======================================================== */

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return payments;

    return payments.filter((p) => {
      const values = [
        p.orderId,
        p._id,
        p.bookId,
        p.book?.title,
        p.customer?.name,
        p.customer?.email,
        p.customer?.phone,
        p.payment?.status,
        gatewayOf(p),
        methodOf(p),
        affiliateCode(p),
        p.coupon?.code,
        p.payment?.transactionId,
      ];

      return values
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [payments, search]);

  /* ========================================================
     CSV EXPORT - LOADED ROWS ONLY
  ======================================================== */

  const exportCSV = () => {
    if (!filteredPayments.length) return;

    const headers = [
      "Order ID",
      "Date IST",
      "Customer",
      "Email",
      "Phone",
      "Book",
      "Amount",
      "Currency",
      "Payment Status",
      "Order Status",
      "Gateway",
      "Payment Method",
      "Revenue Source",
      "Referral Code",
      "Coupon",
      "Discount",
      "Transaction ID",
      "Refund Status",
      "Refunded Amount",
    ];

    const rows = filteredPayments.map((p) => [
      p.orderId,
      fmtDate(p.createdAt),
      p.customer?.name,
      p.customer?.email,
      p.customer?.phone,
      p.book?.title,
      amountOf(p),
      currencyOf(p),
      statusOf(p),
      p.orderStatus,
      gatewayOf(p),
      methodOf(p),
      sourceOf(p),
      affiliateCode(p),
      p.coupon?.code,
      p.coupon?.discountAmount,
      p.payment?.transactionId,
      p.refund?.status,
      p.refund?.refundedAmount,
    ]);

    const content = [headers, ...rows]
      .map((row) => row.map(CSVCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", content], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `targettrek-${date}-page-${page}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  };

  /* ========================================================
     LOCAL COLOR VARIABLES
  ======================================================== */

  const c = {
    page: dark
      ? "bg-slate-950 text-slate-100"
      : "bg-[#fffaf5] text-slate-900",

    surface: dark
      ? "bg-slate-900 border-slate-800"
      : "bg-white border-orange-100",

    text: dark ? "text-white" : "text-slate-900",

    muted: dark ? "text-slate-400" : "text-slate-500",

    input: dark
      ? "bg-slate-900 border-slate-700 text-slate-100 [color-scheme:dark]"
      : "bg-white border-orange-200 text-slate-900 [color-scheme:light]",

    border: dark ? "border-slate-800" : "border-orange-100",

    hover: dark
      ? "hover:bg-slate-800/60"
      : "hover:bg-orange-50/70",

    inner: dark
      ? "bg-slate-800/40 border-slate-700"
      : "bg-orange-50/40 border-orange-100",
  };

  const selectClass =
    `rounded-xl border px-3 py-2.5 text-sm outline-none ` +
    `focus:border-orange-500 ${c.input}`;

  /* ========================================================
     CONTROLS
  ======================================================== */

  const changeDate = (value) => {
    if (!value) return;
    setDate(value);
    setPage(1);
    setSearch("");
    setNotice("");
  };

  const changeStatus = (value) => {
    setStatus(value);
    setPage(1);
    setSearch("");
  };

  /* ========================================================
     RENDER
  ======================================================== */

  return (
    <div
      className={`mt-16 min-h-screen w-full transition-colors ${c.page}`}
    >
      <div className="mx-auto max-w-[1600px] px-3 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* HEADER */}

        <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-extrabold ${
                dark
                  ? "border-orange-500/25 bg-orange-500/10 text-orange-400"
                  : "border-orange-200 bg-orange-50 text-orange-700"
              }`}
            >
              <Activity size={13} />
              TARGET TREK · ADMIN
            </span>

            <h1
              className={`mt-3 text-2xl font-black tracking-tight sm:text-3xl ${c.text}`}
            >
              Payment <span className="text-orange-500">Analytics</span>
            </h1>

            <p className={`mt-2 text-sm ${c.muted}`}>
              Detailed daily revenue, orders, direct sales, affiliates
              and refund insights.
            </p>
          </div>

          <button
            type="button"
            onClick={exportCSV}
            disabled={!filteredPayments.length}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-orange-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-orange-700 disabled:opacity-50"
          >
            <Download size={16} />
            Export Current Page
          </button>
        </div>

        {/* FILTERS */}

        <div
          className={`mb-6 rounded-2xl border p-4 sm:p-5 ${c.surface}`}
        >
          <div className="flex flex-col flex-wrap gap-4 sm:flex-row sm:items-end">
            <div className="w-full sm:w-56">
              <label
                className={`mb-2 flex items-center gap-2 text-xs font-bold ${c.muted}`}
              >
                <CalendarDays size={14} />
                Payment Date (IST)
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => changeDate(e.target.value)}
                className={`w-full ${selectClass}`}
              />
            </div>

            <div className="w-full sm:w-52">
              <label
                className={`mb-2 flex items-center gap-2 text-xs font-bold ${c.muted}`}
              >
                <Filter size={14} />
                Payment Status
              </label>

              <select
                value={status}
                onChange={(e) => changeStatus(e.target.value)}
                className={`w-full ${selectClass}`}
              >
                <option value="ALL">All Payments</option>
                <option value="SUCCESS">Successful</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
                <option value="PARTIALLY_REFUNDED">
                  Partially Refunded
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => changeDate(todayIST())}
              className="rounded-xl bg-orange-600 px-5 py-3 text-xs font-bold text-white"
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => {
                setDate(todayIST());
                setStatus("ALL");
                setPage(1);
                setLimit(20);
                setSearch("");
              }}
              className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold ${c.input}`}
            >
              <RotateCcw size={14} />
              Reset Filters
            </button>

            <div className={`sm:ml-auto text-xs ${c.muted}`}>
              <p className="font-bold">{date}</p>
              <p className="mt-1">Asia/Kolkata</p>
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS */}

        {notice && (
          <div
            className={`mb-5 flex items-center justify-between gap-3 rounded-xl border p-4 text-xs font-semibold ${
              dark
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              {notice}
            </span>

            <button
              type="button"
              onClick={() => setNotice("")}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <div
            className={`mb-5 flex gap-2 rounded-xl border p-4 text-sm ${
              dark
                ? "border-red-500/20 bg-red-500/10 text-red-300"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <AlertCircle size={18} className="shrink-0" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`h-32 animate-pulse rounded-2xl ${
                  dark ? "bg-slate-900" : "bg-orange-100"
                }`}
              />
            ))}
          </div>
        ) : data ? (
          <>
            {/* REVENUE OVERVIEW */}

            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className={`text-base font-black ${c.text}`}>
                Revenue Overview
              </h2>

              <span className={`text-xs ${c.muted}`}>
                {mixedCurrency
                  ? "Multiple currencies — see below"
                  : currency}
              </span>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <MetricCard
                dark={dark}
                title="Gross Collected"
                value={showMoney(revenue.grossPaidAmount)}
                description="Includes payments later refunded"
                icon={Wallet}
              />

              <MetricCard
                dark={dark}
                title="Successful Amount"
                value={showMoney(revenue.successfulAmount)}
                description="Currently successful payment amount"
                icon={TrendingUp}
                variant="green"
              />

              <MetricCard
                dark={dark}
                title="Refunded"
                value={showMoney(revenue.refundedAmount)}
                description="Total recorded refund amount"
                icon={ArrowDownRight}
                variant="red"
              />

              <MetricCard
                dark={dark}
                title="Net Revenue"
                value={showMoney(revenue.netRevenue)}
                description="Gross collected less refunds"
                icon={IndianRupee}
                variant="blue"
              />
            </div>

            {/* ORDER PERFORMANCE */}

            <h2 className={`mb-4 text-base font-black ${c.text}`}>
              Order Performance
            </h2>

            <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <MetricCard
                dark={dark}
                title="Total Orders"
                value={fmtNumber(totalOrders)}
                description="All statuses"
                icon={ShoppingBag}
              />

              <MetricCard
                dark={dark}
                title="Successful"
                value={fmtNumber(successCount)}
                description={`${successRate.toFixed(1)}% of orders`}
                icon={CheckCircle2}
                variant="green"
              />

              <MetricCard
                dark={dark}
                title="Pending"
                value={fmtNumber(pendingCount)}
                description="Awaiting payment"
                icon={Clock3}
              />

              <MetricCard
                dark={dark}
                title="Failed"
                value={fmtNumber(failedCount)}
                description="Unsuccessful payments"
                icon={XCircle}
                variant="red"
              />

              <MetricCard
                dark={dark}
                title="Cancelled"
                value={fmtNumber(stats.cancelledPayments)}
                description="Cancelled payments"
                icon={XCircle}
                variant="purple"
              />

              <MetricCard
                dark={dark}
                title="Paid Orders"
                value={fmtNumber(stats.paidOrders)}
                description="Including later refunded"
                icon={CreditCard}
                variant="blue"
              />
            </div>

            {/* DIRECT SALES VS AFFILIATE SALES */}

            <h2 className={`mb-4 text-base font-black ${c.text}`}>
              Sales Attribution
            </h2>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div
                className={`rounded-2xl border p-5 ${
                  dark
                    ? "border-sky-500/20 bg-slate-900"
                    : "border-sky-100 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-xl p-3 ${
                      dark
                        ? "bg-sky-500/10 text-sky-400"
                        : "bg-sky-50 text-sky-600"
                    }`}
                  >
                    <Wallet size={21} />
                  </span>

                  <div>
                    <h3 className={`font-extrabold ${c.text}`}>
                      Direct Sales
                    </h3>

                    <p className={`text-xs ${c.muted}`}>
                      Code tt + no affiliate attribution
                    </p>
                  </div>
                </div>

                <p
                  className={`mt-5 text-2xl font-black ${c.text}`}
                >
                  {showMoney(sourceAnalytics.directGross)}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className={`rounded-xl border p-3 ${c.inner}`}>
                    <p className={`text-xs ${c.muted}`}>
                      Total Orders
                    </p>

                    <p
                      className={`mt-1 text-lg font-black ${c.text}`}
                    >
                      {fmtNumber(sourceAnalytics.directOrders)}
                    </p>
                  </div>

                  <div className={`rounded-xl border p-3 ${c.inner}`}>
                    <p className={`text-xs ${c.muted}`}>
                      Successful
                    </p>

                    <p
                      className={`mt-1 text-lg font-black ${c.text}`}
                    >
                      {fmtNumber(sourceAnalytics.directSuccessful)}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl border p-5 ${
                  dark
                    ? "border-orange-500/20 bg-slate-900"
                    : "border-orange-100 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-xl p-3 ${
                      dark
                        ? "bg-orange-500/10 text-orange-400"
                        : "bg-orange-50 text-orange-600"
                    }`}
                  >
                    <Users size={21} />
                  </span>

                  <div>
                    <h3 className={`font-extrabold ${c.text}`}>
                      Affiliate Sales
                    </h3>

                    <p className={`text-xs ${c.muted}`}>
                      Genuine affiliate codes only
                    </p>
                  </div>
                </div>

                <p
                  className={`mt-5 text-2xl font-black ${c.text}`}
                >
                  {showMoney(sourceAnalytics.affiliateGross)}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className={`rounded-xl border p-3 ${c.inner}`}>
                    <p className={`text-xs ${c.muted}`}>
                      Total Orders
                    </p>

                    <p
                      className={`mt-1 text-lg font-black ${c.text}`}
                    >
                      {fmtNumber(sourceAnalytics.affiliateOrders)}
                    </p>
                  </div>

                  <div className={`rounded-xl border p-3 ${c.inner}`}>
                    <p className={`text-xs ${c.muted}`}>
                      Successful
                    </p>

                    <p
                      className={`mt-1 text-lg font-black ${c.text}`}
                    >
                      {fmtNumber(sourceAnalytics.affiliateSuccessful)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* PERFORMANCE / ADDITIONAL INSIGHTS */}

            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Section
                title="Payment Distribution"
                subtitle="Orders grouped by current payment status"
                icon={BarChart3}
                dark={dark}
              >
                <div className="space-y-4 p-4 sm:p-5">
                  {(breakdown.paymentStatus || []).map((item) => {
                    const percent =
                      totalOrders > 0
                        ? (n(item.count) / totalOrders) * 100
                        : 0;

                    return (
                      <div key={item.status}>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <StatusBadge
                            dark={dark}
                            status={item.status}
                          />

                          <span
                            className={`text-xs font-bold ${c.text}`}
                          >
                            {item.count} · {percent.toFixed(1)}%
                          </span>
                        </div>

                        <div
                          className={`h-2 overflow-hidden rounded-full ${
                            dark ? "bg-slate-800" : "bg-slate-100"
                          }`}
                        >
                          <div
                            className={`h-full rounded-full ${
                              item.status === "SUCCESS"
                                ? "bg-emerald-500"
                                : item.status === "FAILED"
                                ? "bg-red-500"
                                : item.status === "PENDING"
                                ? "bg-orange-500"
                                : "bg-violet-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {!breakdown.paymentStatus?.length && (
                    <p className={`py-6 text-center text-sm ${c.muted}`}>
                      No payment data for this date.
                    </p>
                  )}
                </div>
              </Section>

              <Section
                title="Additional Insights"
                subtitle="Discounts, refunds and communications"
                icon={Activity}
                dark={dark}
              >
                <div className="grid grid-cols-2 gap-3 p-4 sm:p-5">
                  {[
                    {
                      title: "Coupon Orders",
                      value: fmtNumber(
                        summary.coupons?.appliedOrders
                      ),
                      icon: Tag,
                    },
                    {
                      title: "Discount Given",
                      value: showMoney(
                        summary.coupons?.totalDiscountAmount
                      ),
                      icon: ArrowDownRight,
                    },
                    {
                      title: "Refunded Orders",
                      value: fmtNumber(
                        n(stats.fullyRefundedPayments) +
                          n(stats.partiallyRefundedPayments)
                      ),
                      icon: RotateCcw,
                    },
                    {
                      title: "Reminder Mails",
                      value: fmtNumber(
                        summary.reminders?.totalSent
                      ),
                      icon: Mail,
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className={`rounded-xl border p-4 ${c.inner}`}
                    >
                      <item.icon
                        size={18}
                        className="mb-3 text-orange-500"
                      />

                      <p
                        className={`break-words text-lg font-black ${c.text}`}
                      >
                        {item.value}
                      </p>

                      <p className={`mt-2 text-xs ${c.muted}`}>
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            {/* CURRENCY BREAKDOWN */}

            {currencies.length > 0 && (
              <div className="mb-6">
                <Section
                  title="Currency Breakdown"
                  subtitle="Individual revenue totals by currency"
                  icon={Wallet}
                  dark={dark}
                >
                  <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                    {currencies.map((item) => (
                      <div
                        key={item.currency}
                        className={`rounded-xl border p-4 ${c.inner}`}
                      >
                        <div className="flex justify-between gap-2">
                          <strong className={c.text}>
                            {item.currency}
                          </strong>

                          <span className={`text-xs ${c.muted}`}>
                            {item.totalOrders} orders
                          </span>
                        </div>

                        <p className={`mt-4 text-xs ${c.muted}`}>
                          Net Revenue
                        </p>

                        <p className="mt-1 text-xl font-black text-orange-500">
                          {money(
                            item.netRevenue,
                            item.currency
                          )}
                        </p>

                        <Detail
                          label="Gross"
                          value={money(
                            item.grossPaidAmount,
                            item.currency
                          )}
                          dark={dark}
                        />

                        <Detail
                          label="Refunds"
                          value={money(
                            item.refundedAmount,
                            item.currency
                          )}
                          dark={dark}
                        />
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {/* TABS */}

            <div
              className={`mb-4 flex gap-2 overflow-x-auto border-b pb-3 ${c.border}`}
            >
              {[
                ["payments", "Transactions", CreditCard],
                ["books", "Book Sales", BookOpen],
                ["affiliates", "Sales Sources", Users],
                ["coupons", "Coupons", Tag],
                ["refunds", "Refunds", RotateCcw],
              ].map(([id, title, Icon]) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setTab(id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold ${
                    tab === id
                      ? "bg-orange-600 text-white"
                      : dark
                      ? "bg-slate-900 text-slate-400 hover:bg-slate-800"
                      : "bg-white text-slate-600 hover:bg-orange-50"
                  }`}
                >
                  <Icon size={15} />
                  {title}
                </button>
              ))}
            </div>

            {/* TRANSACTIONS */}

            {tab === "payments" && (
              <Section
                title="All Transactions"
                subtitle={`Transactions created on ${date} · ${fmtNumber(
                  pagination.totalItems
                )} matching orders`}
                icon={CreditCard}
                dark={dark}
              >
                <div
                  className={`flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between ${c.border}`}
                >
                  <div className="relative w-full sm:max-w-md">
                    <Search
                      size={16}
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${c.muted}`}
                    />

                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search order, customer, book, referral..."
                      className={`w-full rounded-xl border py-3 pl-10 pr-3 text-xs outline-none focus:border-orange-500 ${c.input}`}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${c.muted}`}>
                      Per page
                    </span>

                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className={selectClass}
                    >
                      {[10, 20, 50, 100].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredPayments.length === 0 ? (
                  <div className={`px-4 py-14 text-center text-sm ${c.muted}`}>
                    No transactions found for these filters.
                  </div>
                ) : (
                  <>
                    {/* DESKTOP */}

                    <div className="hidden overflow-x-auto lg:block">
                      <table className="w-full min-w-[1150px] border-collapse text-left">
                        <thead
                          className={
                            dark
                              ? "bg-slate-800/70"
                              : "bg-orange-50/80"
                          }
                        >
                          <tr>
                            {[
                              "Order / Date",
                              "Customer",
                              "Book",
                              "Amount / Method",
                              "Payment",
                              "Sales Source",
                              "Coupon",
                              "Actions",
                            ].map((heading) => (
                              <th
                                key={heading}
                                className={`px-4 py-4 text-[11px] font-black uppercase tracking-wide ${c.muted}`}
                              >
                                {heading}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {filteredPayments.map((p) => (
                            <tr
                              key={p._id}
                              className={`border-t ${c.border} ${c.hover}`}
                            >
                              <td className="px-4 py-4">
                                <div
                                  title={p.orderId}
                                  className={`max-w-[160px] truncate text-xs font-bold ${c.text}`}
                                >
                                  {p.orderId || "—"}
                                </div>

                                <p className={`mt-1 text-[11px] ${c.muted}`}>
                                  {fmtDate(p.createdAt)}
                                </p>
                              </td>

                              <td className="px-4 py-4">
                                <p
                                  className={`max-w-[150px] truncate text-xs font-bold ${c.text}`}
                                >
                                  {p.customer?.name || "Unknown"}
                                </p>

                                <p
                                  title={p.customer?.email}
                                  className={`mt-1 max-w-[180px] truncate text-[11px] ${c.muted}`}
                                >
                                  {p.customer?.email || "—"}
                                </p>

                                <p className={`mt-1 text-[11px] ${c.muted}`}>
                                  {p.customer?.phone || "—"}
                                </p>
                              </td>

                              <td className="px-4 py-4">
                                <p
                                  className={`max-w-[180px] text-xs font-semibold ${c.text}`}
                                >
                                  {p.book?.title || "Unknown Book"}
                                </p>
                              </td>

                              <td className="px-4 py-4">
                                <p
                                  className={`whitespace-nowrap text-sm font-black ${c.text}`}
                                >
                                  {money(amountOf(p), currencyOf(p))}
                                </p>

                                <p className={`mt-1 text-[11px] ${c.muted}`}>
                                  {gatewayOf(p)}
                                </p>

                                <p className={`mt-1 text-[11px] ${c.muted}`}>
                                  {methodOf(p)}
                                </p>
                              </td>

                              <td className="px-4 py-4">
                                <StatusBadge
                                  status={statusOf(p)}
                                  dark={dark}
                                />
                              </td>

                              <td className="px-4 py-4">
                                <SourceBadge
                                  code={affiliateCode(p)}
                                  dark={dark}
                                />
                              </td>

                              <td className="px-4 py-4">
                                <p className={`text-xs font-bold ${c.text}`}>
                                  {p.coupon?.code || "—"}
                                </p>

                                {p.coupon?.applied && (
                                  <p className="mt-1 text-xs text-orange-500">
                                    −{money(
                                      p.coupon.discountAmount,
                                      currencyOf(p)
                                    )}
                                  </p>
                                )}
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    title="View payment"
                                    onClick={() =>
                                      setSelectedPayment(p)
                                    }
                                    className={`rounded-lg border p-2 ${
                                      dark
                                        ? "border-orange-500/25 bg-orange-500/10 text-orange-400"
                                        : "border-orange-200 bg-orange-50 text-orange-600"
                                    }`}
                                  >
                                    <Eye size={16} />
                                  </button>

                                  <button
                                    type="button"
                                    title="Delete payment"
                                    onClick={() => openDelete(p)}
                                    className={`rounded-lg border p-2 ${
                                      dark
                                        ? "border-red-500/25 bg-red-500/10 text-red-400"
                                        : "border-red-200 bg-red-50 text-red-600"
                                    }`}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* MOBILE */}

                    <div className="space-y-3 p-3 lg:hidden">
                      {filteredPayments.map((p) => (
                        <div
                          key={p._id}
                          className={`rounded-xl border p-4 ${c.inner}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p
                                className={`break-all text-xs font-extrabold ${c.text}`}
                              >
                                {p.orderId || "—"}
                              </p>

                              <p className={`mt-1 text-[11px] ${c.muted}`}>
                                {fmtDate(p.createdAt)}
                              </p>
                            </div>

                            <StatusBadge
                              status={statusOf(p)}
                              dark={dark}
                            />
                          </div>

                          <div
                            className={`my-3 border-t ${c.border}`}
                          />

                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className={`text-sm font-bold ${c.text}`}>
                                {p.customer?.name || "Unknown"}
                              </p>

                              <p
                                className={`mt-1 break-all text-xs ${c.muted}`}
                              >
                                {p.customer?.email || "—"}
                              </p>
                            </div>

                            <p className="shrink-0 text-sm font-black text-orange-500">
                              {money(amountOf(p), currencyOf(p))}
                            </p>
                          </div>

                          <p className={`mt-3 text-xs font-semibold ${c.text}`}>
                            {p.book?.title || "Unknown Book"}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <SourceBadge
                              code={affiliateCode(p)}
                              dark={dark}
                            />

                            {p.coupon?.code && (
                              <span
                                className={`rounded-lg border px-2.5 py-1 text-[11px] ${c.inner}`}
                              >
                                {p.coupon.code}
                              </span>
                            )}
                          </div>

                          <div
                            className={`mt-3 flex justify-between gap-3 text-xs ${c.muted}`}
                          >
                            <span>{gatewayOf(p)}</span>
                            <span>{methodOf(p)}</span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedPayment(p)}
                              className="flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-3 py-2.5 text-xs font-bold text-white"
                            >
                              <Eye size={14} />
                              Details
                            </button>

                            <button
                              type="button"
                              onClick={() => openDelete(p)}
                              className="flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs font-bold text-red-500"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* PAGINATION */}

                <div
                  className={`flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between ${c.border}`}
                >
                  <p className={`text-xs ${c.muted}`}>
                    Showing {filteredPayments.length} loaded rows
                    {search ? " (search on current page)" : ""}
                    {" · "}
                    {fmtNumber(pagination.totalItems)} matching orders
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40 ${c.input}`}
                    >
                      <ChevronLeft size={15} />
                      Previous
                    </button>

                    <span className={`whitespace-nowrap text-xs font-bold ${c.text}`}>
                      {page} / {Math.max(n(pagination.totalPages), 1)}
                    </span>

                    <button
                      type="button"
                      disabled={!pagination.hasNextPage}
                      onClick={() => setPage((p) => p + 1)}
                      className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-40 ${c.input}`}
                    >
                      Next
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </Section>
            )}

            {/* BOOK SALES */}

            {tab === "books" && (
              <Section
                title="Book-wise Sales"
                subtitle="Gross collected and successful orders for each book"
                icon={BookOpen}
                dark={dark}
              >
                <div className="space-y-3 p-4 sm:p-5">
                  {(breakdown.books || []).length === 0 && (
                    <p className={`py-8 text-center text-sm ${c.muted}`}>
                      No book sales found.
                    </p>
                  )}

                  {(breakdown.books || []).map((book, i) => (
                    <div
                      key={`${book.bookId}-${book.currency}-${i}`}
                      className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${c.inner}`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            dark
                              ? "bg-orange-500/10 text-orange-400"
                              : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          <BookOpen size={19} />
                        </span>

                        <div>
                          <p className={`text-sm font-bold ${c.text}`}>
                            {book.title}
                          </p>

                          <p className={`mt-1 text-xs ${c.muted}`}>
                            {book.totalOrders} orders ·{" "}
                            {book.successfulOrders} successful
                          </p>
                        </div>
                      </div>

                      <p className="text-lg font-black text-orange-500">
                        {money(
                          book.grossPaidAmount,
                          book.currency || currency
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* SALES ATTRIBUTION */}

            {tab === "affiliates" && (
              <div className="space-y-4">
                <Section
                  title="Direct Revenue Sources"
                  subtitle="tt and orders without an affiliate code"
                  icon={Wallet}
                  dark={dark}
                >
                  <div className="space-y-3 p-4 sm:p-5">
                    {sourceAnalytics.directList.map((item) => (
                      <div
                        key={item.affiliateCode}
                        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${c.inner}`}
                      >
                        <div>
                          <SourceBadge
                            code={item.affiliateCode}
                            dark={dark}
                          />

                          <p className={`mt-2 text-xs ${c.muted}`}>
                            {item.totalOrders} orders ·{" "}
                            {item.successfulOrders} successful
                          </p>
                        </div>

                        <p className="text-base font-black text-orange-500">
                          {showMoney(item.grossPaidAmount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section
                  title="Affiliate Performance"
                  subtitle="Only genuine affiliate codes, excluding tt"
                  icon={Users}
                  dark={dark}
                >
                  <div className="space-y-3 p-4 sm:p-5">
                    {sourceAnalytics.affiliateList.length === 0 && (
                      <p className={`py-6 text-center text-sm ${c.muted}`}>
                        No affiliate-attributed orders on this date.
                      </p>
                    )}

                    {sourceAnalytics.affiliateList.map((item) => (
                      <div
                        key={item.affiliateCode}
                        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${c.inner}`}
                      >
                        <div>
                          <SourceBadge
                            code={item.affiliateCode}
                            dark={dark}
                          />

                          <p className={`mt-2 text-xs ${c.muted}`}>
                            {item.totalOrders} orders ·{" "}
                            {item.successfulOrders} successful
                          </p>
                        </div>

                        <p className="text-base font-black text-orange-500">
                          {showMoney(item.grossPaidAmount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {/* COUPONS */}

            {tab === "coupons" && (
              <Section
                title="Coupon Performance"
                subtitle="Codes, usage and total recorded discounts"
                icon={Tag}
                dark={dark}
              >
                <div className="space-y-3 p-4 sm:p-5">
                  {(breakdown.coupons || []).length === 0 && (
                    <p className={`py-8 text-center text-sm ${c.muted}`}>
                      No coupon activity for this date.
                    </p>
                  )}

                  {(breakdown.coupons || []).map((coupon) => (
                    <div
                      key={coupon.code}
                      className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${c.inner}`}
                    >
                      <div>
                        <p className={`font-extrabold ${c.text}`}>
                          {coupon.code}
                        </p>

                        <p className={`mt-1 text-xs ${c.muted}`}>
                          {coupon.uses} uses
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-black text-orange-500">
                          {showMoney(coupon.totalDiscountAmount)}
                        </p>

                        <p className={`mt-1 text-xs ${c.muted}`}>
                          Discounts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* REFUNDS */}

            {tab === "refunds" && (
              <Section
                title="Refund Status Breakdown"
                subtitle="Refund statuses for the selected order date"
                icon={RotateCcw}
                dark={dark}
              >
                <div className="space-y-3 p-4 sm:p-5">
                  {(breakdown.refundStatus || []).map((item) => (
                    <div
                      key={item.status}
                      className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${c.inner}`}
                    >
                      <div>
                        <StatusBadge
                          status={item.status}
                          dark={dark}
                        />

                        <p className={`mt-2 text-xs ${c.muted}`}>
                          {item.count} orders
                        </p>
                      </div>

                      <p className="font-black text-orange-500">
                        {showMoney(item.refundedAmount)}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <div className={`mt-6 space-y-1 text-xs ${c.muted}`}>
              <p>
                Dates are interpreted in IST. Reports use the order
                creation date, with current recorded payment statuses.
              </p>

              <p>
                Gross revenue includes paid transactions later refunded.
                Net revenue deducts recorded refunds, not gateway fees
                or affiliate payouts.
              </p>

              <p>
                Code tt is classified as direct revenue. Unattributed
                orders are grouped with direct sales for display.
              </p>

              <p>
                Search and CSV export cover the loaded page only.
                Financial summaries cover the entire selected date.
              </p>
            </div>
          </>
        ) : null}
      </div>

      {/* DETAILS MODAL */}

      {selectedPayment && (
        <PaymentDetails
          payment={selectedPayment}
          dark={dark}
          onClose={() => setSelectedPayment(null)}
          onDelete={openDelete}
        />
      )}

      {/* DELETE MODAL */}

      {deleteTarget && (
        <DeleteConfirmation
          payment={deleteTarget}
          dark={dark}
          deleting={deleting}
          error={deleteError}
          onClose={closeDelete}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
