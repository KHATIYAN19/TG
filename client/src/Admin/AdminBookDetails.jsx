import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  Mail,
  Receipt,
  RefreshCw,
  Save,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  Users,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import BASE_URL from "../utils/Url";

const RESOURCE_TYPES = [
  "pdf",
  "ebook",
  "course",
  "bundle",
  "template",
  "notes",
  "other",
];

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

function money(value, currency = "INR") {
  if (value === undefined || value === null || value === "") return "—";
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";

  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(number);
  } catch {
    return `${currency} ${number.toLocaleString()}`;
  }
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

  return map[type] || type || "—";
}

function arrayToString(value) {
  return Array.isArray(value) ? value.join(", ") : "";
}

function stringToArray(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function createFormFromBook(book) {
  return {
    title: book?.title || "",
    slug: book?.slug || "",
    subtitle: book?.subtitle || "",
    description: book?.description || "",
    resourceType: book?.resourceType || "ebook",
    price:
      book?.price !== undefined && book?.price !== null
        ? String(book.price)
        : "",
    mrp:
      book?.mrp !== undefined && book?.mrp !== null ? String(book.mrp) : "",
    currency: book?.currency || "INR",
    paymentUrl: book?.paymentUrl || "",
    redirectUrl: book?.redirectUrl || "",
    pageKey: book?.pageKey || "",
    fileName: book?.fileName || "",
    tags: arrayToString(book?.tags),
    topics: arrayToString(book?.topics),
    category: book?.category || "",
    highlights: arrayToString(book?.highlights),
    badge: book?.badge || "",
    isPublished: book?.isPublished === true,
    isActive: book?.isActive !== false,
    isFeatured: book?.isFeatured === true,
  };
}

function normalizeForm(form) {
  return {
    ...form,
    title: form.title.trim(),
    slug: form.slug.trim(),
    subtitle: form.subtitle.trim(),
    description: form.description.trim(),
    resourceType: form.resourceType.trim(),
    price: String(form.price).trim(),
    mrp: String(form.mrp).trim(),
    currency: form.currency.trim().toUpperCase(),
    paymentUrl: form.paymentUrl.trim(),
    redirectUrl: form.redirectUrl.trim(),
    pageKey: form.pageKey.trim(),
    fileName: form.fileName.trim(),
    tags: stringToArray(form.tags),
    topics: stringToArray(form.topics),
    category: form.category.trim(),
    highlights: stringToArray(form.highlights),
    badge: form.badge.trim(),
    isPublished: Boolean(form.isPublished),
    isActive: Boolean(form.isActive),
    isFeatured: Boolean(form.isFeatured),
  };
}

function StatusBadge({ value, trueText, falseText }) {
  return value ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5" />
      {trueText}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
      <XCircle className="h-3.5 w-3.5" />
      {falseText}
    </span>
  );
}

function StatCard({ icon, label, value, loading = false }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-2 break-words text-2xl font-extrabold text-slate-950">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            ) : (
              value ?? 0
            )}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 break-words text-sm text-slate-800 ${
          mono ? "font-mono text-xs" : "font-medium"
        }`}
      >
        {value === undefined || value === null || value === "" ? "—" : String(value)}
      </p>
    </div>
  );
}

function ArrayDisplay({ title, values, color = "blue" }) {
  const colors = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
  const list = Array.isArray(values) ? values : [];

  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      {list.length ? (
        <div className="flex flex-wrap gap-2">
          {list.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${colors[color]}`}
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No {title.toLowerCase()}</p>
      )}
    </div>
  );
}

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
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
            : "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        }`}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

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
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
            : "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        }`}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, error }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-slate-700">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm font-medium text-slate-800 outline-none ${
          error
            ? "border-red-300 focus:ring-4 focus:ring-red-100"
            : "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function ToggleField({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function AdminBookDetails() {
  const navigate = useNavigate();
  const { bookId } = useParams();
  const token = useSelector((state) => state.auth.token);
  const coverInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  const [book, setBook] = useState(null);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [breakdown, setBreakdown] = useState({
    paymentStatus: [],
    orderStatus: [],
    refundStatus: [],
    coupons: [],
    affiliates: [],
  });
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [originalForm, setOriginalForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [coverFile, setCoverFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [updating, setUpdating] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchBook = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError("");
        setNotFound(false);

        if (!bookId) {
          setNotFound(true);
          return;
        }

        if (!token) throw new Error("Authentication token is missing. Please login again.");

        const response = await fetch(
          `${BASE_URL}/book/admin/${encodeURIComponent(bookId)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal,
          }
        );

        let result = null;
        try {
          result = await response.json();
        } catch {
          // ignored
        }

        if (response.status === 404) {
          setNotFound(true);
          setBook(null);
          return;
        }

        if (!response.ok) {
          throw new Error(
            result?.error?.message ||
              result?.error ||
              result?.message ||
              "Unable to load book."
          );
        }

        if (result?.success !== true || !result?.data) {
          setNotFound(true);
          setBook(null);
          return;
        }

        const fetchedBook = result.data;
        const nextForm = createFormFromBook(fetchedBook);

        setBook(fetchedBook);
        setForm(nextForm);
        setOriginalForm(nextForm);
        setCoverPreview(fetchedBook?.coverPageUrl || "");
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Fetch book error:", err);
        setError(err?.message || "Unable to load book.");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [bookId, token]
  );

  const fetchPaymentSummary = useCallback(
    async (signal) => {
      try {
        if (!bookId || !token) return;
        setSummaryLoading(true);

        const response = await fetch(
          `${BASE_URL}/admin/books/${encodeURIComponent(bookId)}/payments/page/1`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal,
          }
        );

        const result = await response.json();

        if (!response.ok || result?.success !== true) {
          throw new Error(result?.message || "Unable to load order summary.");
        }

        setSummary({
          ...EMPTY_SUMMARY,
          ...(result?.data?.summary || {}),
          payments: {
            ...EMPTY_SUMMARY.payments,
            ...(result?.data?.summary?.payments || {}),
          },
          refunds: {
            ...EMPTY_SUMMARY.refunds,
            ...(result?.data?.summary?.refunds || {}),
          },
          coupons: {
            ...EMPTY_SUMMARY.coupons,
            ...(result?.data?.summary?.coupons || {}),
          },
          reminderMails: {
            ...EMPTY_SUMMARY.reminderMails,
            ...(result?.data?.summary?.reminderMails || {}),
          },
          access: {
            ...EMPTY_SUMMARY.access,
            ...(result?.data?.summary?.access || {}),
          },
          verification: {
            ...EMPTY_SUMMARY.verification,
            ...(result?.data?.summary?.verification || {}),
          },
          affiliates: {
            ...EMPTY_SUMMARY.affiliates,
            ...(result?.data?.summary?.affiliates || {}),
          },
        });

        setBreakdown({
          paymentStatus: result?.data?.breakdown?.paymentStatus || [],
          orderStatus: result?.data?.breakdown?.orderStatus || [],
          refundStatus: result?.data?.breakdown?.refundStatus || [],
          coupons: result?.data?.breakdown?.coupons || [],
          affiliates: result?.data?.breakdown?.affiliates || [],
        });
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Fetch payment summary error:", err);
        toast.error(err?.message || "Unable to load order summary.");
      } finally {
        if (!signal?.aborted) setSummaryLoading(false);
      }
    },
    [bookId, token]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchBook(controller.signal);
    fetchPaymentSummary(controller.signal);
    return () => controller.abort();
  }, [fetchBook, fetchPaymentSummary]);

  useEffect(() => {
    return () => {
      if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  const hasChanges = useMemo(() => {
    const formChanged =
      JSON.stringify(normalizeForm(form)) !== JSON.stringify(normalizeForm(originalForm));
    return formChanged || Boolean(coverFile) || Boolean(pdfFile);
  }, [form, originalForm, coverFile, pdfFile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = "Title is required.";
    if (!form.slug.trim()) nextErrors.slug = "Slug is required.";
    if (!form.resourceType) nextErrors.resourceType = "Resource type is required.";

    if (form.price === "" || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
      nextErrors.price = "Enter a valid price.";
    }

    if (
      form.mrp !== "" &&
      (!Number.isFinite(Number(form.mrp)) || Number(form.mrp) < 0)
    ) {
      nextErrors.mrp = "Enter a valid MRP.";
    }

    if (form.mrp !== "" && Number(form.mrp) < Number(form.price)) {
      nextErrors.mrp = "MRP cannot be lower than price.";
    }

    if (!form.currency.trim()) nextErrors.currency = "Currency is required.";
    if (!form.paymentUrl.trim()) nextErrors.paymentUrl = "Payment URL is required.";
    if (form.paymentUrl.trim() && !/^https?:\/\//i.test(form.paymentUrl.trim())) {
      nextErrors.paymentUrl = "Enter a valid http/https payment URL.";
    }
    if (!form.redirectUrl.trim()) nextErrors.redirectUrl = "Redirect URL is required.";
    if (!form.pageKey.trim()) nextErrors.pageKey = "Page key is required.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Cover must be JPG, JPEG, PNG, or WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error("Cover file must be smaller than 100 MB.");
      event.target.value = "";
      return;
    }

    if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handlePdfChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error("PDF must be smaller than 100 MB.");
      event.target.value = "";
      return;
    }

    setPdfFile(file);
  };

  const cancelEdit = () => {
    setForm(originalForm);
    setErrors({});
    setCoverFile(null);
    setPdfFile(null);

    if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
    setCoverPreview(book?.coverPageUrl || "");

    if (coverInputRef.current) coverInputRef.current.value = "";
    if (pdfInputRef.current) pdfInputRef.current.value = "";

    setEditMode(false);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!hasChanges || !validateForm()) return;

    try {
      setUpdating(true);

      const data = new FormData();
      data.append("title", form.title.trim());
      data.append("slug", form.slug.trim());
      data.append("subtitle", form.subtitle.trim());
      data.append("description", form.description.trim());
      data.append("resourceType", form.resourceType);
      data.append("price", String(Number(form.price)));
      data.append("mrp", form.mrp === "" ? "0" : String(Number(form.mrp)));
      data.append("currency", form.currency.trim().toUpperCase());
      data.append("paymentUrl", form.paymentUrl.trim());
      data.append("redirectUrl", form.redirectUrl.trim());
      data.append("pageKey", form.pageKey.trim());
      data.append("fileName", form.fileName.trim());
      data.append("tags", JSON.stringify(stringToArray(form.tags)));
      data.append("topics", JSON.stringify(stringToArray(form.topics)));
      data.append("category", form.category.trim());
      data.append("highlights", JSON.stringify(stringToArray(form.highlights)));
      data.append("badge", form.badge.trim());
      data.append("isPublished", String(form.isPublished));
      data.append("isActive", String(form.isActive));
      data.append("isFeatured", String(form.isFeatured));

      if (coverFile) data.append("coverPage", coverFile);
      if (pdfFile) data.append("pdf", pdfFile);

      const response = await fetch(
        `${BASE_URL}/book/admin/${encodeURIComponent(bookId)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("Invalid response received from server.");
      }

      if (!response.ok || result?.success !== true) {
        throw new Error(
          result?.error?.message ||
            result?.error ||
            result?.message ||
            "Unable to update book."
        );
      }

      let updatedBook = result?.data || null;

      if (!updatedBook) {
        const refreshResponse = await fetch(
          `${BASE_URL}/book/admin/${encodeURIComponent(bookId)}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const refreshResult = await refreshResponse.json();
        if (refreshResponse.ok && refreshResult?.success && refreshResult?.data) {
          updatedBook = refreshResult.data;
        }
      }

      if (updatedBook) {
        const nextForm = createFormFromBook(updatedBook);
        setBook(updatedBook);
        setForm(nextForm);
        setOriginalForm(nextForm);
        setCoverPreview(updatedBook?.coverPageUrl || "");
      }

      setCoverFile(null);
      setPdfFile(null);
      setErrors({});
      setEditMode(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
      if (pdfInputRef.current) pdfInputRef.current.value = "";

      toast.success("Book updated successfully.");
    } catch (err) {
      console.error("Update book error:", err);
      toast.error(err?.message || "Unable to update book.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);

      const response = await fetch(
        `${BASE_URL}/book/admin/${encodeURIComponent(bookId)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let result = null;
      try {
        result = await response.json();
      } catch {
        // ignored
      }

      if (!response.ok) {
        throw new Error(
          result?.error?.message ||
            result?.error ||
            result?.message ||
            "Unable to delete book."
        );
      }

      toast.success("Book deleted successfully.");
      navigate("/admin/books", { replace: true });
    } catch (err) {
      console.error("Delete book error:", err);
      toast.error(err?.message || "Unable to delete book.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 pt-28">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-600" />
          <p className="mt-4 text-sm font-medium text-slate-500">Loading book...</p>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-slate-50 pt-28">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
            <h1 className="mt-6 text-3xl font-extrabold text-slate-950">Book Not Found</h1>
            <button
              type="button"
              onClick={() => navigate("/admin/books")}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Books
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 pt-28">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <div className="rounded-3xl border border-red-100 bg-white px-6 py-16 text-center">
            <AlertCircle className="mx-auto h-9 w-9 text-red-500" />
            <h1 className="mt-5 text-2xl font-bold text-slate-950">Unable to load book</h1>
            <p className="mt-3 text-sm text-slate-500">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
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

  if (!book) return null;

  const currency = book.currency || "INR";

  return (
    <>
      <Helmet>
        <title>{book.title} | Admin</title>
      </Helmet>
      <Toaster position="top-right" />

      <main className="min-h-screen bg-slate-50 pt-24 text-slate-900 sm:pt-28">
        <div className="mx-auto max-w-[1500px] px-4 pb-20 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/admin/books")}
            className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Books
          </button>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
              <div className="h-[240px] w-[170px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-md">
                {book.coverPageUrl ? (
                  <img
                    src={book.coverPageUrl}
                    alt={book.title}
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
                  <StatusBadge value={book.isPublished} trueText="Published" falseText="Draft" />
                  <StatusBadge value={book.isActive} trueText="Active" falseText="Inactive" />
                  {book.isFeatured && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                      <Sparkles className="h-3.5 w-3.5" />
                      Featured
                    </span>
                  )}
                </div>

                <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
                  {book.title}
                </h1>

                {book.subtitle && (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    {book.subtitle}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                    {formatResourceType(book.resourceType)}
                  </span>
                  {book.category && (
                    <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                      {book.category}
                    </span>
                  )}
                  {book.badge && (
                    <span className="rounded-lg bg-pink-50 px-3 py-1.5 text-xs font-bold text-pink-700">
                      {book.badge}
                    </span>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <span className="text-2xl font-extrabold text-slate-950">
                    {money(book.price, currency)}
                  </span>
                  {Number(book.mrp) > Number(book.price) && (
                    <span className="text-sm text-slate-400 line-through">
                      {money(book.mrp, currency)}
                    </span>
                  )}
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  {!editMode && (
                    <button
                      type="button"
                      onClick={() => setEditMode(true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit Book
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate(`/admin/book/${bookId}/payments`)}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
                  >
                    <CreditCard className="h-4 w-4" />
                    Payment Details
                    {summary.totalOrders > 0 && (
                      <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px]">
                        {summary.totalOrders}
                      </span>
                    )}
                  </button>

                  {book.redirectUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        window.open(book.redirectUrl, "_blank", "noopener,noreferrer")
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Product
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setDeleteModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Book
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-6">
            <StatCard icon={<Eye className="h-5 w-5" />} label="Views" value={book?.stats?.views || 0} />
            <StatCard icon={<Users className="h-5 w-5" />} label="Purchases" value={book?.stats?.purchases || 0} />
            <StatCard icon={<Receipt className="h-5 w-5" />} label="Total Orders" value={summary.totalOrders} loading={summaryLoading} />
            <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Paid Orders" value={summary.payments.paidOrders} loading={summaryLoading} />
            <StatCard icon={<CircleDollarSign className="h-5 w-5" />} label="Gross Paid" value={money(summary.payments.grossPaidAmount, currency)} loading={summaryLoading} />
            <StatCard icon={<WalletCards className="h-5 w-5" />} label="Net Revenue" value={money(summary.payments.netRevenue, currency)} loading={summaryLoading} />
          </div>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-950">Order & Payment Overview</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Overall totals are calculated from all orders for this book.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate(`/admin/book/${bookId}/payments`)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
              >
                <CreditCard className="h-4 w-4" />
                Open Payment Details
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Successful" value={summary.payments.successfulPayments} loading={summaryLoading} />
              <StatCard icon={<XCircle className="h-5 w-5" />} label="Failed" value={summary.payments.failedPayments} loading={summaryLoading} />
              <StatCard icon={<Loader2 className="h-5 w-5" />} label="Pending" value={summary.payments.pendingPayments} loading={summaryLoading} />
              <StatCard icon={<XCircle className="h-5 w-5" />} label="Cancelled" value={summary.payments.cancelledPayments} loading={summaryLoading} />
              <StatCard icon={<CircleDollarSign className="h-5 w-5" />} label="Success Amount" value={money(summary.payments.successfulAmount, currency)} loading={summaryLoading} />
              <StatCard icon={<Receipt className="h-5 w-5" />} label="All Order Amount" value={money(summary.totalOrderAmount, currency)} loading={summaryLoading} />
            </div>
          </section>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
              <h2 className="text-lg font-extrabold text-slate-950">Refund Overview</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                <StatCard icon={<Receipt className="h-5 w-5" />} label="Refund Orders" value={summary.refunds.refundOrders} loading={summaryLoading} />
                <StatCard icon={<Loader2 className="h-5 w-5" />} label="Pending Refunds" value={summary.refunds.pendingRefunds} loading={summaryLoading} />
                <StatCard icon={<RefreshCw className="h-5 w-5" />} label="Processing" value={summary.refunds.processingRefunds} loading={summaryLoading} />
                <StatCard icon={<CircleDollarSign className="h-5 w-5" />} label="Partial Refunds" value={summary.refunds.partialRefunds} loading={summaryLoading} />
                <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Completed" value={summary.refunds.completedRefunds} loading={summaryLoading} />
                <StatCard icon={<XCircle className="h-5 w-5" />} label="Failed Refunds" value={summary.refunds.failedRefunds} loading={summaryLoading} />
                <StatCard icon={<WalletCards className="h-5 w-5" />} label="Refunded Amount" value={money(summary.refunds.totalRefundedAmount, currency)} loading={summaryLoading} />
                <StatCard icon={<CircleDollarSign className="h-5 w-5" />} label="Requested Amount" value={money(summary.refunds.totalRefundRequestedAmount, currency)} loading={summaryLoading} />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-extrabold text-slate-950">Coupon & Reminder</h2>
              <DetailRow label="Coupon Orders" value={summary.coupons.couponAppliedOrders} />
              <DetailRow label="Coupon Discount" value={money(summary.coupons.totalDiscountAmount, currency)} />
              <DetailRow label="Reminder Mails Sent" value={summary.reminderMails.totalSent} />
              <DetailRow label="Orders Reminded" value={summary.reminderMails.ordersWithReminderMail} />
              <DetailRow label="Failed Reminder Status" value={summary.reminderMails.lastStatusFailed} />
              <DetailRow label="First Mail Sent" value={formatDate(summary.reminderMails.firstMailSentAt)} />
              <DetailRow label="Last Mail Sent" value={formatDate(summary.reminderMails.lastMailSentAt)} />
              <DetailRow label="Affiliate Orders" value={summary.affiliates.affiliateOrders} />
            </section>
          </div>

          {(breakdown.paymentStatus.length > 0 || breakdown.refundStatus.length > 0) && (
            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-extrabold text-slate-950">Database Status Breakdown</h2>
              <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Payment Status</p>
                  <div className="space-y-2">
                    {breakdown.paymentStatus.map((item) => (
                      <div key={item.status} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                        <span className="text-sm font-bold text-slate-700">{item.status}</span>
                        <span className="text-sm text-slate-500">{item.count} · {money(item.amount, currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Refund Status</p>
                  <div className="space-y-2">
                    {breakdown.refundStatus.map((item) => (
                      <div key={item.status} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                        <span className="text-sm font-bold text-slate-700">{item.status}</span>
                        <span className="text-sm text-slate-500">{item.count} · {money(item.refundedAmount, currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {editMode ? (
            <form onSubmit={handleUpdate} className="mt-6">
              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-950">Edit Book</h2>
                    <p className="mt-1 text-xs text-slate-500">Update book information and files.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={updating}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!hasChanges || updating}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-slate-300"
                    >
                      {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {updating ? "Updating..." : "Save Changes"}
                    </button>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <InputField label="Title" name="title" value={form.title} onChange={handleChange} error={errors.title} required />
                    <InputField label="Slug" name="slug" value={form.slug} onChange={handleChange} error={errors.slug} required />
                    <InputField label="Subtitle" name="subtitle" value={form.subtitle} onChange={handleChange} />
                    <SelectField
                      label="Resource Type"
                      name="resourceType"
                      value={form.resourceType}
                      onChange={handleChange}
                      error={errors.resourceType}
                      options={RESOURCE_TYPES.map((type) => ({ value: type, label: formatResourceType(type) }))}
                    />
                    <InputField label="Price" name="price" type="number" min="0" value={form.price} onChange={handleChange} error={errors.price} required />
                    <InputField label="MRP" name="mrp" type="number" min="0" value={form.mrp} onChange={handleChange} error={errors.mrp} />
                    <InputField label="Currency" name="currency" value={form.currency} onChange={handleChange} error={errors.currency} required />
                    <InputField label="Category" name="category" value={form.category} onChange={handleChange} />
                    <InputField label="Badge" name="badge" value={form.badge} onChange={handleChange} />
                    <InputField label="Page Key" name="pageKey" value={form.pageKey} onChange={handleChange} error={errors.pageKey} required />
                    <InputField label="Payment URL" name="paymentUrl" value={form.paymentUrl} onChange={handleChange} error={errors.paymentUrl} required />
                    <InputField label="Redirect URL" name="redirectUrl" value={form.redirectUrl} onChange={handleChange} error={errors.redirectUrl} required />
                    <InputField label="File Name" name="fileName" value={form.fileName} onChange={handleChange} />
                    <InputField label="Tags (comma separated)" name="tags" value={form.tags} onChange={handleChange} />
                    <InputField label="Topics (comma separated)" name="topics" value={form.topics} onChange={handleChange} />
                    <InputField label="Highlights (comma separated)" name="highlights" value={form.highlights} onChange={handleChange} />
                  </div>

                  <div className="mt-5">
                    <TextAreaField label="Description" name="description" value={form.description} onChange={handleChange} rows={6} />
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <ToggleField
                      label="Published"
                      description="Make the book visible as published."
                      checked={form.isPublished}
                      onChange={(value) => setForm((prev) => ({ ...prev, isPublished: value }))}
                    />
                    <ToggleField
                      label="Active"
                      description="Allow the product to remain active."
                      checked={form.isActive}
                      onChange={(value) => setForm((prev) => ({ ...prev, isActive: value }))}
                    />
                    <ToggleField
                      label="Featured"
                      description="Mark the product as featured."
                      checked={form.isFeatured}
                      onChange={(value) => setForm((prev) => ({ ...prev, isFeatured: value }))}
                    />
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4 text-blue-600" />
                        <h3 className="text-sm font-extrabold text-slate-900">Cover Image</h3>
                      </div>
                      {coverPreview && (
                        <img src={coverPreview} alt="Cover preview" className="mt-4 h-40 w-28 rounded-lg object-cover" />
                      )}
                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleCoverChange}
                        className="mt-4 block w-full text-xs"
                      />
                      {coverFile && (
                        <button
                          type="button"
                          onClick={() => {
                            if (coverPreview?.startsWith("blob:")) URL.revokeObjectURL(coverPreview);
                            setCoverFile(null);
                            setCoverPreview(book?.coverPageUrl || "");
                            if (coverInputRef.current) coverInputRef.current.value = "";
                          }}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-red-600"
                        >
                          <X className="h-3.5 w-3.5" /> Remove selected cover
                        </button>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <h3 className="text-sm font-extrabold text-slate-900">PDF File</h3>
                      </div>
                      <p className="mt-3 break-all text-xs text-slate-500">Current: {book.pdfUrl || "No PDF uploaded"}</p>
                      <input
                        ref={pdfInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handlePdfChange}
                        className="mt-4 block w-full text-xs"
                      />
                      {pdfFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setPdfFile(null);
                            if (pdfInputRef.current) pdfInputRef.current.value = "";
                          }}
                          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-red-600"
                        >
                          <X className="h-3.5 w-3.5" /> Remove selected PDF
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-7 flex justify-end border-t border-slate-100 pt-5">
                    <button
                      type="submit"
                      disabled={!hasChanges || updating}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white disabled:bg-slate-300"
                    >
                      {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {updating ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="space-y-6 xl:col-span-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-lg font-extrabold text-slate-950">Description</h2>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    {book.description || "No description provided."}
                  </p>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
                    <ArrayDisplay title="Tags" values={book.tags} color="blue" />
                    <ArrayDisplay title="Topics" values={book.topics} color="violet" />
                  </div>
                  <div className="mt-7 border-t border-slate-100 pt-7">
                    <ArrayDisplay title="Highlights" values={book.highlights} color="emerald" />
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="mb-3 text-lg font-extrabold text-slate-950">URLs & Files</h2>
                  <DetailRow label="Payment URL" value={book.paymentUrl} />
                  <DetailRow label="Redirect URL" value={book.redirectUrl} />
                  <DetailRow label="Cover Page URL" value={book.coverPageUrl} />
                  <DetailRow label="PDF URL" value={book.pdfUrl} />
                  <DetailRow label="File Name" value={book.fileName} />
                </section>
              </div>

              <div className="space-y-6">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-2 text-base font-extrabold text-slate-950">Product Details</h2>
                  <DetailRow label="Book ID" value={book._id} mono />
                  <DetailRow label="Slug" value={book.slug} />
                  <DetailRow label="Page Key" value={book.pageKey} />
                  <DetailRow label="Resource Type" value={formatResourceType(book.resourceType)} />
                  <DetailRow label="Category" value={book.category} />
                  <DetailRow label="Currency" value={book.currency} />
                  <DetailRow label="Price" value={money(book.price, currency)} />
                  <DetailRow label="MRP" value={money(book.mrp, currency)} />
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="mb-2 text-base font-extrabold text-slate-950">Audit Information</h2>
                  <DetailRow label="Created At" value={formatDate(book.createdAt)} />
                  <DetailRow label="Updated At" value={formatDate(book.updatedAt)} />
                  <DetailRow label="Created By" value={book.createdBy} mono />
                  <DetailRow label="Updated By" value={book.updatedBy} mono />
                </section>
              </div>
            </div>
          )}
        </div>
      </main>

      {deleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="mt-5 text-2xl font-extrabold text-slate-950">Delete Book?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              You are about to permanently delete <strong className="text-slate-800">{book.title}</strong>. This action cannot be undone.
            </p>
            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {deleting ? "Deleting..." : "Delete Book"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


