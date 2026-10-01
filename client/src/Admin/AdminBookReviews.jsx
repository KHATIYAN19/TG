import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useSelector } from "react-redux";

import toast from "react-hot-toast";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Clock3,
  Copy,
  Eye,
  FileText,
  Filter,
  Hash,
  Loader2,
  Mail,
  MessageSquareText,
  Pencil,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Star,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";

import BASE_URL from "../utils/Url";

const REVIEW_API =
  `${BASE_URL}/api/book/review`;

const PAGE_LIMIT = 10;

const FILTERS = [
  {
    key: "ALL",
    label: "All",
    icon: Filter,
  },
  {
    key: "PENDING",
    label: "Pending",
    icon: Clock3,
  },
  {
    key: "SUBMITTED",
    label: "Submitted",
    icon: MessageSquareText,
  },
  {
    key: "ACTIVE",
    label: "Active",
    icon: CheckCircle2,
  },
  {
    key: "INACTIVE",
    label: "Inactive",
    icon: XCircle,
  },
  {
    key: "DELETED",
    label: "Deleted",
    icon: Trash2,
  },
];

const EMPTY_STATS = {
  totalReviewRecords: 0,
  totalActiveRecords: 0,
  pendingReviews: 0,
  submittedReviews: 0,
  activeReviews: 0,
  inactiveReviews: 0,
  deletedReviews: 0,
  totalEmailsSent: 0,
  averageRating: "0.0",

  ratingDistribution: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  },
};

// ======================================================
// HELPERS
// ======================================================

function getStoredTheme() {
  if (
    typeof window ===
    "undefined"
  ) {
    return "light";
  }

  const stored =
    localStorage.getItem(
      "theme"
    );

  if (
    stored === "dark" ||
    stored === "light"
  ) {
    return stored;
  }

  if (
    document.documentElement.classList.contains(
      "dark"
    )
  ) {
    return "dark";
  }

  return "light";
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

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

function yesNo(value) {
  if (value === true) {
    return "Yes";
  }

  if (value === false) {
    return "No";
  }

  return "—";
}

function truncate(
  value,
  length = 130
) {
  if (!value) {
    return "—";
  }

  const text =
    String(value);

  if (
    text.length <= length
  ) {
    return text;
  }

  return `${text.slice(
    0,
    length
  )}...`;
}

async function copyText(
  value,
  label = "Value"
) {
  if (!value) {
    toast.error(
      `${label} is not available.`
    );

    return;
  }

  try {
    await navigator.clipboard.writeText(
      value
    );

    toast.success(
      `${label} copied.`
    );
  } catch {
    toast.error(
      "Unable to copy."
    );
  }
}

function normalizeStatus(
  value
) {
  return String(
    value || ""
  )
    .trim()
    .toUpperCase();
}

// ======================================================
// STATUS BADGE
// ======================================================

function StatusBadge({
  status,
  isDark,
}) {
  const normalized =
    normalizeStatus(status);

  const configs = {
    LINK_GENERATED: isDark
      ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
      : "border-amber-200 bg-amber-50 text-amber-700",

    REVIEW_SUBMITTED:
      isDark
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
        : "border-emerald-200 bg-emerald-50 text-emerald-700",

    SENT: isDark
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : "border-emerald-200 bg-emerald-50 text-emerald-700",

    FAILED: isDark
      ? "border-red-500/30 bg-red-500/10 text-red-300"
      : "border-red-200 bg-red-50 text-red-700",

    NOT_SENT: isDark
      ? "border-slate-700 bg-slate-800 text-slate-300"
      : "border-slate-200 bg-slate-100 text-slate-600",
  };

  const className =
    configs[normalized] ||
    (
      isDark
        ? "border-slate-700 bg-slate-800 text-slate-300"
        : "border-slate-200 bg-slate-100 text-slate-600"
    );

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.07em] ${className}`}
    >
      {normalized || "UNKNOWN"}
    </span>
  );
}

// ======================================================
// METRIC CARD
// ======================================================

function MetricCard({
  icon,
  label,
  value,
  helper,
  isDark,
}) {
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-[10px] font-extrabold uppercase tracking-[0.1em] ${
              isDark
                ? "text-slate-500"
                : "text-slate-400"
            }`}
          >
            {label}
          </p>

          <p
            className={`mt-2 text-xl font-black ${
              isDark
                ? "text-white"
                : "text-slate-950"
            }`}
          >
            {value ?? 0}
          </p>

          {helper && (
            <p
              className={`mt-1 text-[11px] leading-4 ${
                isDark
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              {helper}
            </p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            isDark
              ? "bg-blue-500/10 text-blue-400"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ======================================================
// STAR VIEW
// ======================================================

function RatingStars({
  rating,
}) {
  const numericRating =
    Number(rating) || 0;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(
        (star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <=
              numericRating
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            }`}
          />
        )
      )}
    </div>
  );
}

// ======================================================
// CONFIRM MODAL
// ======================================================

function ConfirmModal({
  open,
  title,
  message,
  confirmText,
  danger = false,
  loading,
  onConfirm,
  onClose,
  isDark,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${
          isDark
            ? "border-slate-700 bg-slate-900"
            : "border-slate-200 bg-white"
        }`}
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            danger
              ? isDark
                ? "bg-red-500/10 text-red-400"
                : "bg-red-50 text-red-600"
              : isDark
              ? "bg-blue-500/10 text-blue-400"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          {danger ? (
            <Trash2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
        </div>

        <h2
          className={`mt-5 text-xl font-black ${
            isDark
              ? "text-white"
              : "text-slate-950"
          }`}
        >
          {title}
        </h2>

        <p
          className={`mt-2 text-sm leading-6 ${
            isDark
              ? "text-slate-400"
              : "text-slate-600"
          }`}
        >
          {message}
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={`rounded-xl border px-4 py-2.5 text-sm font-extrabold ${
              isDark
                ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white disabled:opacity-60 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// DETAIL MODAL
// ======================================================

function ReviewDetailsModal({
  review,
  open,
  onClose,
  onEdit,
  onSendReminder,
  onCopyLink,
  sendingReminder,
  isDark,
}) {
  if (
    !open ||
    !review
  ) {
    return null;
  }

  const customer =
    review.customer || {};

  const reviewContent =
    review.review || {};

  const mail =
    review.reviewMail || {};

  const reviewLink =
    review.reviewLink || {};

  const isPending =
    !review.isReviewed ||
    review.status ===
      "LINK_GENERATED";

  const detailBox =
    isDark
      ? "border-slate-800 bg-slate-950/60"
      : "border-slate-200 bg-slate-50";

  const heading =
    isDark
      ? "text-white"
      : "text-slate-950";

  const text =
    isDark
      ? "text-slate-300"
      : "text-slate-700";

  const muted =
    isDark
      ? "text-slate-500"
      : "text-slate-400";

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-black/60 px-4 py-6 backdrop-blur-sm">
      <div
        className={`mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border shadow-2xl ${
          isDark
            ? "border-slate-700 bg-slate-900"
            : "border-slate-200 bg-white"
        }`}
      >
        <div
          className={`flex items-start justify-between gap-4 border-b px-5 py-5 sm:px-7 ${
            isDark
              ? "border-slate-800"
              : "border-slate-100"
          }`}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className={`text-xl font-black ${heading}`}
              >
                Book Review Details
              </h2>

              <StatusBadge
                status={
                  review.status
                }
                isDark={isDark}
              />
            </div>

            <p
              className={`mt-1 text-xs ${muted}`}
            >
              Review ID:{" "}
              {review._id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isDark
                ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          {/* CUSTOMER + ORDER */}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section
              className={`rounded-2xl border p-4 ${detailBox}`}
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />

                <h3
                  className={`text-sm font-extrabold ${heading}`}
                >
                  Customer
                </h3>
              </div>

              <div className="mt-4 space-y-3">
                <DetailRow
                  label="Name"
                  value={
                    customer.name
                  }
                  isDark={
                    isDark
                  }
                />

                <DetailRow
                  label="Email"
                  value={
                    customer.email
                  }
                  copy
                  isDark={
                    isDark
                  }
                />

                <DetailRow
                  label="Verified Purchase"
                  value={yesNo(
                    review.verifiedPurchase
                  )}
                  isDark={
                    isDark
                  }
                />
              </div>
            </section>

            <section
              className={`rounded-2xl border p-4 ${detailBox}`}
            >
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-blue-500" />

                <h3
                  className={`text-sm font-extrabold ${heading}`}
                >
                  Order & Record
                </h3>
              </div>

              <div className="mt-4 space-y-3">
                <DetailRow
                  label="Order Number"
                  value={
                    review.orderNumber
                  }
                  copy
                  isDark={
                    isDark
                  }
                />

                <DetailRow
                  label="Order Mongo ID"
                  value={
                    review.orderId
                  }
                  copy
                  isDark={
                    isDark
                  }
                />

                <DetailRow
                  label="Created"
                  value={formatDate(
                    review.createdAt
                  )}
                  isDark={
                    isDark
                  }
                />

                <DetailRow
                  label="Updated"
                  value={formatDate(
                    review.updatedAt
                  )}
                  isDark={
                    isDark
                  }
                />
              </div>
            </section>
          </div>

          {/* REVIEW */}

          <section
            className={`rounded-2xl border p-4 sm:p-5 ${detailBox}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-blue-500" />

                <h3
                  className={`text-sm font-extrabold ${heading}`}
                >
                  Review
                </h3>
              </div>

              {review.isReviewed && (
                <button
                  type="button"
                  onClick={() =>
                    onEdit(
                      review
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-blue-700"
                >
                  <Pencil className="h-3.5 w-3.5" />

                  Edit Review
                </button>
              )}
            </div>

            {review.isReviewed ? (
              <div className="mt-5 space-y-5">
                <div>
                  <p
                    className={`text-[10px] font-extrabold uppercase tracking-[0.08em] ${muted}`}
                  >
                    Rating
                  </p>

                  <div className="mt-2 flex items-center gap-3">
                    <RatingStars
                      rating={
                        reviewContent.rating
                      }
                    />

                    <span
                      className={`text-sm font-extrabold ${text}`}
                    >
                      {
                        reviewContent.rating
                      }
                      /5
                    </span>
                  </div>
                </div>

                <DetailRow
                  label="Title"
                  value={
                    reviewContent.title
                  }
                  isDark={
                    isDark
                  }
                />

                <div>
                  <p
                    className={`text-[10px] font-extrabold uppercase tracking-[0.08em] ${muted}`}
                  >
                    Comment
                  </p>

                  <p
                    className={`mt-2 whitespace-pre-wrap text-sm leading-7 ${text}`}
                  >
                    {reviewContent.comment ||
                      "—"}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailRow
                    label="Submitted"
                    value={formatDate(
                      reviewContent.submittedAt
                    )}
                    isDark={
                      isDark
                    }
                  />

                  <DetailRow
                    label="Last Edited"
                    value={formatDate(
                      reviewContent.lastEditedAt
                    )}
                    isDark={
                      isDark
                    }
                  />

                  <DetailRow
                    label="Last Edited By"
                    value={
                      reviewContent.lastEditedBy
                    }
                    isDark={
                      isDark
                    }
                  />

                  <DetailRow
                    label="Admin Edited"
                    value={yesNo(
                      reviewContent.editedByAdmin
                    )}
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>
            ) : (
              <div
                className={`mt-4 rounded-xl border p-4 ${
                  isDark
                    ? "border-amber-500/20 bg-amber-500/5"
                    : "border-amber-100 bg-amber-50"
                }`}
              >
                <p
                  className={`text-sm font-extrabold ${
                    isDark
                      ? "text-amber-300"
                      : "text-amber-800"
                  }`}
                >
                  Review has not been submitted yet.
                </p>

                <p
                  className={`mt-1 text-xs leading-5 ${
                    isDark
                      ? "text-amber-400/70"
                      : "text-amber-700"
                  }`}
                >
                  You can resend the
                  review request to the
                  customer.
                </p>
              </div>
            )}
          </section>

          {/* LINK */}

          <section
            className={`rounded-2xl border p-4 sm:p-5 ${detailBox}`}
          >
            <div className="flex items-center gap-2">
              <Clipboard className="h-4 w-4 text-blue-500" />

              <h3
                className={`text-sm font-extrabold ${heading}`}
              >
                Review Link
              </h3>
            </div>

            <div
              className={`mt-4 flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center ${
                isDark
                  ? "border-slate-700 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <p
                className={`min-w-0 flex-1 break-all font-mono text-xs ${text}`}
              >
                {review.reviewUrl ||
                  "No link available"}
              </p>

              {review.reviewUrl && (
                <button
                  type="button"
                  onClick={() =>
                    onCopyLink(
                      review.reviewUrl
                    )
                  }
                  className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-extrabold ${
                    isDark
                      ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Copy className="h-3.5 w-3.5" />

                  Copy
                </button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailRow
                label="Generated At"
                value={formatDate(
                  reviewLink.generatedAt
                )}
                isDark={
                  isDark
                }
              />

              <DetailRow
                label="Generated By"
                value={
                  reviewLink.generatedBy
                }
                isDark={
                  isDark
                }
              />
            </div>
          </section>

          {/* MAIL */}

          <section
            className={`rounded-2xl border p-4 sm:p-5 ${detailBox}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />

                <h3
                  className={`text-sm font-extrabold ${heading}`}
                >
                  Review Mail History
                </h3>
              </div>

              {isPending && (
                <button
                  type="button"
                  onClick={() =>
                    onSendReminder(
                      review
                    )
                  }
                  disabled={
                    sendingReminder
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {sendingReminder ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}

                  Send Review Reminder
                </button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow
                label="Sent Count"
                value={
                  mail.sentCount ??
                  0
                }
                isDark={
                  isDark
                }
              />

              <DetailRow
                label="First Sent"
                value={formatDate(
                  mail.firstSentAt
                )}
                isDark={
                  isDark
                }
              />

              <DetailRow
                label="Last Sent"
                value={formatDate(
                  mail.lastSentAt
                )}
                isDark={
                  isDark
                }
              />

              <DetailRow
                label="Last Attempt"
                value={formatDate(
                  mail.lastAttemptAt
                )}
                isDark={
                  isDark
                }
              />

              <DetailRow
                label="Last Sent By"
                value={
                  mail.lastSentBy
                }
                isDark={
                  isDark
                }
              />

              <div>
                <p
                  className={`text-[10px] font-extrabold uppercase tracking-[0.08em] ${muted}`}
                >
                  Last Status
                </p>

                <div className="mt-2">
                  <StatusBadge
                    status={
                      mail.lastStatus
                    }
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <DetailRow
                  label="Last Error"
                  value={
                    mail.lastError
                  }
                  isDark={
                    isDark
                  }
                />
              </div>
            </div>
          </section>

          {/* VISIBILITY */}

          <section
            className={`rounded-2xl border p-4 sm:p-5 ${detailBox}`}
          >
            <h3
              className={`text-sm font-extrabold ${heading}`}
            >
              Visibility & Audit
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow
                label="Active"
                value={yesNo(
                  review.isActive
                )}
                isDark={
                  isDark
                }
              />

              <DetailRow
                label="Deleted"
                value={yesNo(
                  review.isDeleted
                )}
                isDark={
                  isDark
                }
              />

              <DetailRow
                label="Deleted At"
                value={formatDate(
                  review.deletedAt
                )}
                isDark={
                  isDark
                }
              />

              <DetailRow
                label="Deleted By"
                value={
                  review.deletedBy
                }
                isDark={
                  isDark
                }
              />

              <DetailRow
                label="Created By"
                value={
                  review.createdBy
                }
                isDark={
                  isDark
                }
              />

              <DetailRow
                label="Updated By"
                value={
                  review.updatedBy
                }
                isDark={
                  isDark
                }
              />
            </div>

            <div className="mt-4">
              <DetailRow
                label="Admin Notes"
                value={
                  review.adminNotes
                }
                isDark={
                  isDark
                }
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  copy = false,
  isDark,
}) {
  return (
    <div>
      <p
        className={`text-[10px] font-extrabold uppercase tracking-[0.08em] ${
          isDark
            ? "text-slate-500"
            : "text-slate-400"
        }`}
      >
        {label}
      </p>

      <div className="mt-1.5 flex items-start gap-2">
        <p
          className={`min-w-0 flex-1 break-words text-sm font-semibold ${
            isDark
              ? "text-slate-300"
              : "text-slate-700"
          }`}
        >
          {value === undefined ||
          value === null ||
          value === ""
            ? "—"
            : String(value)}
        </p>

        {copy &&
          value && (
            <button
              type="button"
              onClick={() =>
                copyText(
                  String(value),
                  label
                )
              }
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                isDark
                  ? "text-slate-500 hover:bg-slate-800 hover:text-blue-400"
                  : "text-slate-400 hover:bg-slate-100 hover:text-blue-600"
              }`}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
      </div>
    </div>
  );
}

// ======================================================
// EDIT MODAL
// ======================================================

function EditReviewModal({
  review,
  open,
  saving,
  onClose,
  onSave,
  isDark,
}) {
  const [
    form,
    setForm,
  ] = useState({
    rating: 5,
    title: "",
    comment: "",
    isActive: true,
    adminNotes: "",
  });

  const [
    errors,
    setErrors,
  ] = useState({});

  useEffect(() => {
    if (
      review &&
      open
    ) {
      setForm({
        rating:
          review.review
            ?.rating || 5,

        title:
          review.review
            ?.title || "",

        comment:
          review.review
            ?.comment || "",

        isActive:
          review.isActive ===
          true,

        adminNotes:
          review.adminNotes ||
          "",
      });

      setErrors({});
    }
  }, [
    review,
    open,
  ]);

  if (
    !open ||
    !review
  ) {
    return null;
  }

  const validate = () => {
    const next = {};

    const rating =
      Number(form.rating);

    if (
      !Number.isInteger(
        rating
      ) ||
      rating < 1 ||
      rating > 5
    ) {
      next.rating =
        "Rating must be between 1 and 5.";
    }

    if (
      form.title.trim()
        .length > 120
    ) {
      next.title =
        "Title cannot exceed 120 characters.";
    }

    const comment =
      form.comment.trim();

    if (
      !comment ||
      comment.length < 5
    ) {
      next.comment =
        "Comment must contain at least 5 characters.";
    }

    if (
      comment.length >
      3000
    ) {
      next.comment =
        "Comment cannot exceed 3000 characters.";
    }

    if (
      form.adminNotes.trim()
        .length > 1000
    ) {
      next.adminNotes =
        "Admin notes cannot exceed 1000 characters.";
    }

    setErrors(next);

    return (
      Object.keys(next)
        .length === 0
    );
  };

  const submit = () => {
    if (!validate()) {
      toast.error(
        "Please check the form."
      );

      return;
    }

    onSave({
      rating:
        Number(form.rating),

      title:
        form.title.trim(),

      comment:
        form.comment.trim(),

      isActive:
        form.isActive,

      adminNotes:
        form.adminNotes.trim(),
    });
  };

  const input =
    isDark
      ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400";

  const label =
    isDark
      ? "text-slate-300"
      : "text-slate-700";

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto bg-black/60 px-4 py-6 backdrop-blur-sm">
      <div
        className={`mx-auto w-full max-w-2xl rounded-3xl border shadow-2xl ${
          isDark
            ? "border-slate-700 bg-slate-900"
            : "border-slate-200 bg-white"
        }`}
      >
        <div
          className={`flex items-center justify-between border-b px-5 py-5 sm:px-7 ${
            isDark
              ? "border-slate-800"
              : "border-slate-100"
          }`}
        >
          <div>
            <h2
              className={`text-xl font-black ${
                isDark
                  ? "text-white"
                  : "text-slate-950"
              }`}
            >
              Edit Book Review
            </h2>

            <p
              className={`mt-1 text-xs ${
                isDark
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              Changes are recorded
              as admin edits.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isDark
                ? "bg-slate-800 text-slate-400"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-7">
          {/* RATING */}

          <div>
            <label
              className={`text-sm font-extrabold ${label}`}
            >
              Rating
            </label>

            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map(
                (rating) => (
                  <button
                    key={
                      rating
                    }
                    type="button"
                    onClick={() =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          rating,
                        })
                      )
                    }
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                      rating <=
                      form.rating
                        ? isDark
                          ? "border-amber-500/30 bg-amber-500/10"
                          : "border-amber-200 bg-amber-50"
                        : isDark
                        ? "border-slate-700 bg-slate-950"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        rating <=
                        form.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-400"
                      }`}
                    />
                  </button>
                )
              )}
            </div>

            {errors.rating && (
              <p className="mt-2 text-xs font-semibold text-red-500">
                {errors.rating}
              </p>
            )}
          </div>

          {/* TITLE */}

          <div>
            <div className="flex items-center justify-between">
              <label
                className={`text-sm font-extrabold ${label}`}
              >
                Review Title
              </label>

              <span className="text-[10px] font-bold text-slate-400">
                {
                  form.title
                    .length
                }
                /120
              </span>
            </div>

            <input
              value={
                form.title
              }
              maxLength={120}
              onChange={(
                event
              ) =>
                setForm(
                  (current) => ({
                    ...current,
                    title:
                      event.target
                        .value,
                  })
                )
              }
              className={`mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${input}`}
            />

            {errors.title && (
              <p className="mt-2 text-xs font-semibold text-red-500">
                {errors.title}
              </p>
            )}
          </div>

          {/* COMMENT */}

          <div>
            <div className="flex items-center justify-between">
              <label
                className={`text-sm font-extrabold ${label}`}
              >
                Review Comment
              </label>

              <span className="text-[10px] font-bold text-slate-400">
                {
                  form.comment
                    .length
                }
                /3000
              </span>
            </div>

            <textarea
              rows={8}
              maxLength={3000}
              value={
                form.comment
              }
              onChange={(
                event
              ) =>
                setForm(
                  (current) => ({
                    ...current,
                    comment:
                      event.target
                        .value,
                  })
                )
              }
              className={`mt-2 w-full resize-y rounded-xl border px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${input}`}
            />

            {errors.comment && (
              <p className="mt-2 text-xs font-semibold text-red-500">
                {errors.comment}
              </p>
            )}
          </div>

          {/* ACTIVE */}

          <div
            className={`flex items-center justify-between rounded-2xl border p-4 ${
              isDark
                ? "border-slate-700 bg-slate-950/60"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div>
              <p
                className={`text-sm font-extrabold ${label}`}
              >
                Public Visibility
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Inactive reviews
                will not appear on
                the public website.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setForm(
                  (current) => ({
                    ...current,
                    isActive:
                      !current.isActive,
                  })
                )
              }
              className={`relative h-7 w-12 rounded-full transition ${
                form.isActive
                  ? "bg-emerald-500"
                  : isDark
                  ? "bg-slate-700"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                  form.isActive
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          {/* ADMIN NOTES */}

          <div>
            <div className="flex items-center justify-between">
              <label
                className={`text-sm font-extrabold ${label}`}
              >
                Admin Notes
              </label>

              <span className="text-[10px] font-bold text-slate-400">
                {
                  form.adminNotes
                    .length
                }
                /1000
              </span>
            </div>

            <textarea
              rows={4}
              maxLength={1000}
              value={
                form.adminNotes
              }
              onChange={(
                event
              ) =>
                setForm(
                  (current) => ({
                    ...current,
                    adminNotes:
                      event.target
                        .value,
                  })
                )
              }
              placeholder="Internal notes..."
              className={`mt-2 w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${input}`}
            />

            {errors.adminNotes && (
              <p className="mt-2 text-xs font-semibold text-red-500">
                {
                  errors.adminNotes
                }
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className={`rounded-xl border px-5 py-3 text-sm font-extrabold ${
                isDark
                  ? "border-slate-700 bg-slate-800 text-slate-300"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={submit}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}

              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// MAIN PAGE
// ======================================================

export default function AdminBookReviews() {
  const navigate =
    useNavigate();

  const {
    bookId,
  } = useParams();

  const token =
    useSelector(
      (state) =>
        state.auth.token
    );

  const [
    theme,
    setTheme,
  ] = useState(
    getStoredTheme
  );

  const [
    book,
    setBook,
  ] = useState(null);

  const [
    reviews,
    setReviews,
  ] = useState([]);

  const [
    stats,
    setStats,
  ] = useState(
    EMPTY_STATS
  );

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    totalPages: 1,
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    filter,
    setFilter,
  ] = useState("ALL");

  const [
    selectedReview,
    setSelectedReview,
  ] = useState(null);

  const [
    detailOpen,
    setDetailOpen,
  ] = useState(false);

  const [
    editReview,
    setEditReview,
  ] = useState(null);

  const [
    editOpen,
    setEditOpen,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(null);

  const [
    confirm,
    setConfirm,
  ] = useState({
    open: false,
    action: null,
    review: null,
  });

  // ====================================================
  // THEME
  // ====================================================

  useEffect(() => {
    const syncTheme = () => {
      setTheme(
        getStoredTheme()
      );
    };

    syncTheme();

    window.addEventListener(
      "storage",
      syncTheme
    );

    window.addEventListener(
      "themechange",
      syncTheme
    );

    window.addEventListener(
      "themeChanged",
      syncTheme
    );

    const observer =
      new MutationObserver(
        syncTheme
      );

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: [
          "class",
          "data-theme",
        ],
      }
    );

    const interval =
      window.setInterval(
        syncTheme,
        400
      );

    return () => {
      window.removeEventListener(
        "storage",
        syncTheme
      );

      window.removeEventListener(
        "themechange",
        syncTheme
      );

      window.removeEventListener(
        "themeChanged",
        syncTheme
      );

      observer.disconnect();

      window.clearInterval(
        interval
      );
    };
  }, []);

  const isDark =
    theme === "dark";

  // ====================================================
  // REQUEST HEADERS
  // ====================================================

  const headers =
    useMemo(
      () => ({
        Accept:
          "application/json",

        "Content-Type":
          "application/json",

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),
      }),
      [token]
    );

  // ====================================================
  // QUERY
  // ====================================================

  const queryString =
    useMemo(() => {
      const params =
        new URLSearchParams();

      params.set(
        "page",
        String(page)
      );

      params.set(
        "limit",
        String(PAGE_LIMIT)
      );

      if (search) {
        params.set(
          "search",
          search
        );
      }

      switch (filter) {
        case "PENDING":
          params.set(
            "status",
            "LINK_GENERATED"
          );
          params.set(
            "deleted",
            "false"
          );
          break;

        case "SUBMITTED":
          params.set(
            "status",
            "REVIEW_SUBMITTED"
          );
          params.set(
            "deleted",
            "false"
          );
          break;

        case "ACTIVE":
          params.set(
            "status",
            "REVIEW_SUBMITTED"
          );
          params.set(
            "isActive",
            "true"
          );
          params.set(
            "deleted",
            "false"
          );
          break;

        case "INACTIVE":
          params.set(
            "status",
            "REVIEW_SUBMITTED"
          );
          params.set(
            "isActive",
            "false"
          );
          params.set(
            "deleted",
            "false"
          );
          break;

        case "DELETED":
          params.set(
            "deleted",
            "true"
          );
          break;

        default:
          params.set(
            "deleted",
            "false"
          );
      }

      return params.toString();
    }, [
      page,
      search,
      filter,
    ]);

  // ====================================================
  // LOAD REVIEWS
  // ====================================================

  const fetchReviews =
    useCallback(
      async ({
        silent = false,
        signal,
      } = {}) => {
        try {
          if (!silent) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }

          setError("");

          const response =
            await fetch(
              `${REVIEW_API}/admin/book/${bookId}?${queryString}`,
              {
                method: "GET",
                headers,
                signal,
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Unable to fetch book reviews."
            );
          }

          if (signal?.aborted) {
            return;
          }

          setBook(
            data?.data
              ?.book || null
          );

          setReviews(
            data?.data
              ?.bookReviews ||
              []
          );

          setPagination(
            data?.data
              ?.pagination || {
              page: 1,
              limit:
                PAGE_LIMIT,
              total: 0,
              totalPages: 1,
            }
          );
        } catch (err) {
          if (
            err?.name ===
            "AbortError"
          ) {
            return;
          }

          console.error(
            "fetchReviews:",
            err
          );

          setError(
            err?.message ||
              "Unable to load reviews."
          );
        } finally {
          if (!signal?.aborted) {
            setLoading(false);
            setRefreshing(false);
          }
        }
      },
      [
        bookId,
        queryString,
        headers,
      ]
    );

  // ====================================================
  // STATS
  // ====================================================

  const fetchStats =
    useCallback(
      async ({
        signal,
      } = {}) => {
        try {
          const response =
            await fetch(
              `${REVIEW_API}/admin/book/${bookId}/stats`,
              {
                method: "GET",
                headers,
                signal,
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            return;
          }

          if (signal?.aborted) {
            return;
          }

          setStats(
            data?.data
              ?.stats ||
              EMPTY_STATS
          );

          if (data?.data?.book) {
            setBook(
              (current) =>
                current ||
                data.data.book
            );
          }
        } catch (err) {
          if (
            err?.name ===
            "AbortError"
          ) {
            return;
          }

          console.error(
            "fetchStats:",
            err
          );
        }
      },
      [
        bookId,
        headers,
      ]
    );

  useEffect(() => {
    if (!bookId) {
      return undefined;
    }

    const controller =
      new AbortController();

    Promise.all([
      fetchReviews({
        signal:
          controller.signal,
      }),
      fetchStats({
        signal:
          controller.signal,
      }),
    ]).catch((err) => {
      if (
        err?.name !==
        "AbortError"
      ) {
        console.error(
          "Initial review load:",
          err
        );
      }
    });

    return () => {
      controller.abort();
    };
  }, [
    bookId,
    fetchReviews,
    fetchStats,
  ]);

  // ====================================================
  // SEARCH
  // ====================================================

  const handleSearch =
    (event) => {
      event.preventDefault();

      setPage(1);
      setSearch(
        searchInput.trim()
      );
    };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  // ====================================================
  // REFRESH
  // ====================================================

  const refresh = async () => {
    await Promise.all([
      fetchReviews({
        silent: true,
      }),
      fetchStats(),
    ]);

    toast.success(
      "Reviews refreshed."
    );
  };

  // ====================================================
  // SEND REMINDER
  // ====================================================

  const sendReminder =
    async (review) => {
      if (
        review.isReviewed ||
        review.status ===
          "REVIEW_SUBMITTED"
      ) {
        toast.error(
          "Review has already been submitted."
        );

        return;
      }

      const orderIdentifier =
        review.orderNumber ||
        review.orderId;

      if (!orderIdentifier) {
        toast.error(
          "Order identifier is missing."
        );

        return;
      }

      try {
        setActionLoading(
          `mail-${review._id}`
        );

        const response =
          await fetch(
            `${REVIEW_API}/admin/order/${encodeURIComponent(
              orderIdentifier
            )}/send-mail`,
            {
              method: "POST",
              headers,
              body:
                JSON.stringify(
                  {}
                ),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to send review reminder."
          );
        }

        toast.success(
          data?.message ||
            "Review reminder sent successfully."
        );

        await Promise.all([
          fetchReviews({
            silent: true,
          }),
          fetchStats(),
        ]);

        if (
          selectedReview?._id ===
          review._id
        ) {
          const refreshed =
            await fetchSingleReview(
              review._id
            );

          if (refreshed) {
            setSelectedReview(
              refreshed
            );
          }
        }
      } catch (err) {
        toast.error(
          err?.message ||
            "Unable to send reminder."
        );
      } finally {
        setActionLoading(
          null
        );
      }
    };

  // ====================================================
  // GET SINGLE
  // ====================================================

  const fetchSingleReview =
    async (
      reviewId
    ) => {
      try {
        const response =
          await fetch(
            `${REVIEW_API}/admin/${reviewId}`,
            {
              method: "GET",
              headers,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to fetch review."
          );
        }

        return (
          data?.data
            ?.bookReview ||
          null
        );
      } catch (err) {
        toast.error(
          err?.message ||
            "Unable to fetch review details."
        );

        return null;
      }
    };

  const openDetails =
    async (review) => {
      setActionLoading(
        `details-${review._id}`
      );

      const full =
        await fetchSingleReview(
          review._id
        );

      setActionLoading(
        null
      );

      if (full) {
        setSelectedReview(
          full
        );

        setDetailOpen(
          true
        );
      }
    };

  // ====================================================
  // EDIT
  // ====================================================

  const openEdit = (
    review
  ) => {
    if (
      !review.isReviewed
    ) {
      toast.error(
        "Review has not been submitted yet."
      );

      return;
    }

    setEditReview(
      review
    );

    setEditOpen(
      true
    );
  };

  const saveReview =
    async (payload) => {
      if (!editReview) {
        return;
      }

      try {
        setSaving(true);

        const response =
          await fetch(
            `${REVIEW_API}/admin/${editReview._id}`,
            {
              method: "PATCH",
              headers,
              body:
                JSON.stringify(
                  payload
                ),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to update review."
          );
        }

        toast.success(
          "Book review updated successfully."
        );

        setEditOpen(false);
        setEditReview(null);

        await Promise.all([
          fetchReviews({
            silent: true,
          }),
          fetchStats(),
        ]);

        if (
          selectedReview?._id ===
          editReview._id
        ) {
          const full =
            await fetchSingleReview(
              editReview._id
            );

          if (full) {
            setSelectedReview(
              full
            );
          }
        }
      } catch (err) {
        toast.error(
          err?.message ||
            "Unable to update review."
        );
      } finally {
        setSaving(false);
      }
    };

  // ====================================================
  // TOGGLE ACTIVE
  // ====================================================

  const toggleActive =
    async (review) => {
      if (
        !review.isReviewed
      ) {
        toast.error(
          "Only submitted reviews can change visibility."
        );

        return;
      }

      try {
        setActionLoading(
          `active-${review._id}`
        );

        const response =
          await fetch(
            `${REVIEW_API}/admin/${review._id}`,
            {
              method: "PATCH",
              headers,
              body:
                JSON.stringify({
                  isActive:
                    !review.isActive,
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to update review visibility."
          );
        }

        toast.success(
          review.isActive
            ? "Review deactivated."
            : "Review activated."
        );

        await Promise.all([
          fetchReviews({
            silent: true,
          }),
          fetchStats(),
        ]);
      } catch (err) {
        toast.error(
          err?.message ||
            "Unable to update visibility."
        );
      } finally {
        setActionLoading(
          null
        );
      }
    };

  // ====================================================
  // DELETE ACTIONS
  // ====================================================

  const openDeleteConfirm = (
    review,
    action
  ) => {
    setConfirm({
      open: true,
      review,
      action,
    });
  };

  const runConfirmedAction =
    async () => {
      const review =
        confirm.review;

      const action =
        confirm.action;

      if (
        !review ||
        !action
      ) {
        return;
      }

      try {
        setActionLoading(
          `confirm-${review._id}`
        );

        let url = "";
        let method =
          "PATCH";

        if (
          action ===
          "SOFT_DELETE"
        ) {
          url =
            `${REVIEW_API}/admin/${review._id}/soft-delete`;
        }

        if (
          action ===
          "RESTORE"
        ) {
          url =
            `${REVIEW_API}/admin/${review._id}/restore`;
        }

        if (
          action ===
          "HARD_DELETE"
        ) {
          url =
            `${REVIEW_API}/admin/${review._id}`;

          method =
            "DELETE";
        }

        const response =
          await fetch(
            url,
            {
              method,
              headers,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to complete action."
          );
        }

        toast.success(
          data?.message ||
            "Action completed successfully."
        );

        setConfirm({
          open: false,
          action: null,
          review: null,
        });

        setDetailOpen(
          false
        );

        setSelectedReview(
          null
        );

        await Promise.all([
          fetchReviews({
            silent: true,
          }),
          fetchStats(),
        ]);
      } catch (err) {
        toast.error(
          err?.message ||
            "Unable to complete action."
        );
      } finally {
        setActionLoading(
          null
        );
      }
    };

  // ====================================================
  // FILTER COUNTS
  // ====================================================

  const filterCounts =
    useMemo(
      () => ({
        ALL:
          stats.totalActiveRecords ||
          0,

        PENDING:
          stats.pendingReviews ||
          0,

        SUBMITTED:
          stats.submittedReviews ||
          0,

        ACTIVE:
          stats.activeReviews ||
          0,

        INACTIVE:
          stats.inactiveReviews ||
          0,

        DELETED:
          stats.deletedReviews ||
          0,
      }),
      [stats]
    );

  // ====================================================
  // COLORS
  // ====================================================

  const pageClass =
    isDark
      ? "bg-slate-950 text-slate-100"
      : "bg-slate-50 text-slate-900";

  const cardClass =
    isDark
      ? "border-slate-800 bg-slate-900"
      : "border-slate-200 bg-white";

  const heading =
    isDark
      ? "text-white"
      : "text-slate-950";

  const text =
    isDark
      ? "text-slate-300"
      : "text-slate-700";

  const muted =
    isDark
      ? "text-slate-500"
      : "text-slate-400";

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center pt-5 sm:pt-6 ${pageClass}`}
      >
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-blue-500" />

          <p
            className={`mt-3 text-sm font-bold ${text}`}
          >
            Loading book reviews...
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main
        className={`min-h-screen pt-5 mt-8 transition-colors sm:pt-6 ${pageClass}`}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className={`border-b ${
            isDark
              ? "border-slate-800 bg-slate-950"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/admin/book/${bookId}/payments`
                    )
                  }
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="min-w-0">
                  <p
                    className={`text-[10px] font-extrabold uppercase tracking-[0.12em] ${muted}`}
                  >
                    Admin / Book Reviews
                  </p>

                  <h1
                    className={`mt-1 text-2xl font-black sm:text-3xl ${heading}`}
                  >
                    {book?.title ||
                      "Book Reviews"}
                  </h1>

                  <p
                    className={`mt-1 text-sm ${muted}`}
                  >
                    Manage customer
                    reviews, reminder
                    emails and public
                    visibility.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={refresh}
                disabled={
                  refreshing
                }
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-extrabold ${
                  isDark
                    ? "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
          {/* =================================================
              BOOK DETAILS
          ================================================= */}

          {book && (
            <section
              className={`overflow-hidden rounded-3xl border shadow-sm ${cardClass}`}
            >
              <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
                {book.coverPageUrl ? (
                  <img
                    src={
                      book.coverPageUrl
                    }
                    alt=""
                    className="h-28 w-20 shrink-0 rounded-xl object-cover shadow-sm"
                  />
                ) : (
                  <div
                    className={`flex h-28 w-20 shrink-0 items-center justify-center rounded-xl ${
                      isDark
                        ? "bg-slate-800"
                        : "bg-slate-100"
                    }`}
                  >
                    <BookOpen
                      className={`h-6 w-6 ${muted}`}
                    />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-500" />

                    <span
                      className={`text-xs font-extrabold uppercase ${muted}`}
                    >
                      Book
                    </span>
                  </div>

                  <h2
                    className={`mt-2 text-xl font-black ${heading}`}
                  >
                    {book.title}
                  </h2>

                  <p
                    className={`mt-1 break-all text-xs font-semibold ${muted}`}
                  >
                    {book.slug}
                  </p>

                  <p
                    className={`mt-2 text-[11px] ${muted}`}
                  >
                    Book ID:{" "}
                    {book._id}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex">
                  <div
                    className={`rounded-xl border px-4 py-3 ${
                      isDark
                        ? "border-slate-700 bg-slate-950/50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <p
                      className={`text-[9px] font-extrabold uppercase ${muted}`}
                    >
                      Average Rating
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />

                      <span
                        className={`text-lg font-black ${heading}`}
                      >
                        {
                          stats.averageRating
                        }
                      </span>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl border px-4 py-3 ${
                      isDark
                        ? "border-slate-700 bg-slate-950/50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <p
                      className={`text-[9px] font-extrabold uppercase ${muted}`}
                    >
                      Submitted
                    </p>

                    <p
                      className={`mt-1 text-lg font-black ${heading}`}
                    >
                      {
                        stats.submittedReviews
                      }
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* =================================================
              METRICS
          ================================================= */}

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <MetricCard
              label="Total"
              value={
                stats.totalReviewRecords
              }
              icon={
                <Activity className="h-4 w-4" />
              }
              isDark={
                isDark
              }
            />

            <MetricCard
              label="Pending"
              value={
                stats.pendingReviews
              }
              icon={
                <Clock3 className="h-4 w-4" />
              }
              isDark={
                isDark
              }
            />

            <MetricCard
              label="Submitted"
              value={
                stats.submittedReviews
              }
              icon={
                <MessageSquareText className="h-4 w-4" />
              }
              isDark={
                isDark
              }
            />

            <MetricCard
              label="Active"
              value={
                stats.activeReviews
              }
              icon={
                <CheckCircle2 className="h-4 w-4" />
              }
              isDark={
                isDark
              }
            />

            <MetricCard
              label="Deleted"
              value={
                stats.deletedReviews
              }
              icon={
                <Trash2 className="h-4 w-4" />
              }
              isDark={
                isDark
              }
            />

            <MetricCard
              label="Emails Sent"
              value={
                stats.totalEmailsSent
              }
              icon={
                <Mail className="h-4 w-4" />
              }
              isDark={
                isDark
              }
            />
          </div>

          {/* =================================================
              FILTERS + SEARCH
          ================================================= */}

          <section
            className={`mt-5 rounded-3xl border p-4 shadow-sm sm:p-5 ${cardClass}`}
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {FILTERS.map(
                  (item) => {
                    const Icon =
                      item.icon;

                    const active =
                      filter ===
                      item.key;

                    return (
                      <button
                        key={
                          item.key
                        }
                        type="button"
                        onClick={() => {
                          setFilter(
                            item.key
                          );

                          setPage(
                            1
                          );
                        }}
                        className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-extrabold transition ${
                          active
                            ? "border-blue-600 bg-blue-600 text-white"
                            : isDark
                            ? "border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />

                        {
                          item.label
                        }

                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                            active
                              ? "bg-white/20"
                              : isDark
                              ? "bg-slate-800"
                              : "bg-slate-100"
                          }`}
                        >
                          {
                            filterCounts[
                              item.key
                            ]
                          }
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

              <form
                onSubmit={
                  handleSearch
                }
                className="flex w-full gap-2 xl:max-w-md"
              >
                <div className="relative flex-1">
                  <Search
                    className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${muted}`}
                  />

                  <input
                    value={
                      searchInput
                    }
                    onChange={(
                      event
                    ) =>
                      setSearchInput(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Search name, email, order, review..."
                    className={`h-11 w-full rounded-xl border pl-10 pr-10 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
                      isDark
                        ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-600"
                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                    }`}
                  />

                  {(searchInput ||
                    search) && (
                    <button
                      type="button"
                      onClick={
                        clearSearch
                      }
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${muted}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white hover:bg-blue-700"
                >
                  Search
                </button>
              </form>
            </div>
          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className={`mt-5 rounded-2xl border p-4 ${
                isDark
                  ? "border-red-500/20 bg-red-500/5 text-red-300"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="font-extrabold">
                    Unable to load reviews
                  </p>

                  <p className="mt-1 text-sm">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              REVIEWS
          ================================================= */}

          <div className="mt-5 space-y-4">
            {!reviews.length ? (
              <div
                className={`rounded-3xl border px-5 py-16 text-center shadow-sm ${cardClass}`}
              >
                <MessageSquareText
                  className={`mx-auto h-10 w-10 ${muted}`}
                />

                <h3
                  className={`mt-4 text-lg font-black ${heading}`}
                >
                  No book reviews found
                </h3>

                <p
                  className={`mx-auto mt-2 max-w-md text-sm ${muted}`}
                >
                  There are no review
                  records matching the
                  selected filters.
                </p>
              </div>
            ) : (
              reviews.map(
                (review) => {
                  const customer =
                    review.customer ||
                    {};

                  const content =
                    review.review ||
                    {};

                  const mail =
                    review.reviewMail ||
                    {};

                  const pending =
                    !review.isReviewed ||
                    review.status ===
                      "LINK_GENERATED";

                  return (
                    <article
                      key={
                        review._id
                      }
                      className={`overflow-hidden rounded-3xl border shadow-sm transition hover:shadow-md ${cardClass}`}
                    >
                      <div className="p-5 sm:p-6">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          {/* LEFT */}

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                  isDark
                                    ? "bg-slate-800 text-slate-300"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {review.isReviewed ? (
                                  <MessageSquareText className="h-4 w-4" />
                                ) : (
                                  <Clock3 className="h-4 w-4" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h2
                                    className={`truncate text-base font-black ${heading}`}
                                  >
                                    {customer.name ||
                                      "Customer"}
                                  </h2>

                                  <StatusBadge
                                    status={
                                      review.status
                                    }
                                    isDark={
                                      isDark
                                    }
                                  />

                                  {review.isDeleted && (
                                    <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-extrabold uppercase text-red-400">
                                      Deleted
                                    </span>
                                  )}

                                  {review.isReviewed &&
                                    !review.isDeleted && (
                                      <span
                                        className={`rounded-full border px-2 py-1 text-[10px] font-extrabold uppercase ${
                                          review.isActive
                                            ? isDark
                                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                            : isDark
                                            ? "border-slate-700 bg-slate-800 text-slate-400"
                                            : "border-slate-200 bg-slate-100 text-slate-500"
                                        }`}
                                      >
                                        {review.isActive
                                          ? "Active"
                                          : "Inactive"}
                                      </span>
                                    )}
                                </div>

                                <p
                                  className={`mt-1 truncate text-sm font-semibold ${muted}`}
                                >
                                  {customer.email ||
                                    "No email"}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold ${muted}`}
                              >
                                <Hash className="h-3.5 w-3.5" />

                                {
                                  review.orderNumber
                                }
                              </span>

                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold ${muted}`}
                              >
                                <CalendarDays className="h-3.5 w-3.5" />

                                {formatDate(
                                  review.createdAt
                                )}
                              </span>

                              <span
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold ${muted}`}
                              >
                                <Mail className="h-3.5 w-3.5" />

                                {
                                  mail.sentCount ??
                                  0
                                }{" "}
                                mail(s)
                              </span>
                            </div>

                            {/* REVIEW PREVIEW */}

                            {review.isReviewed ? (
                              <div
                                className={`mt-5 rounded-2xl border p-4 ${
                                  isDark
                                    ? "border-slate-800 bg-slate-950/50"
                                    : "border-slate-200 bg-slate-50"
                                }`}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <RatingStars
                                    rating={
                                      content.rating
                                    }
                                  />

                                  <span
                                    className={`text-xs font-bold ${muted}`}
                                  >
                                    {formatDate(
                                      content.submittedAt
                                    )}
                                  </span>
                                </div>

                                {content.title && (
                                  <h3
                                    className={`mt-3 font-black ${heading}`}
                                  >
                                    {
                                      content.title
                                    }
                                  </h3>
                                )}

                                <p
                                  className={`mt-2 text-sm leading-6 ${text}`}
                                >
                                  {truncate(
                                    content.comment,
                                    220
                                  )}
                                </p>
                              </div>
                            ) : (
                              <div
                                className={`mt-5 rounded-2xl border p-4 ${
                                  isDark
                                    ? "border-amber-500/20 bg-amber-500/5"
                                    : "border-amber-100 bg-amber-50"
                                }`}
                              >
                                <p
                                  className={`text-sm font-extrabold ${
                                    isDark
                                      ? "text-amber-300"
                                      : "text-amber-800"
                                  }`}
                                >
                                  Waiting for customer review
                                </p>

                                <p
                                  className={`mt-1 text-xs ${
                                    isDark
                                      ? "text-amber-400/70"
                                      : "text-amber-700"
                                  }`}
                                >
                                  The review link has
                                  been generated but the
                                  customer has not
                                  submitted a review yet.
                                </p>
                              </div>
                            )}
                          </div>

                          {/* ACTIONS */}

                          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap xl:max-w-sm xl:justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                openDetails(
                                  review
                                )
                              }
                              disabled={
                                actionLoading ===
                                `details-${review._id}`
                              }
                              className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-extrabold ${
                                isDark
                                  ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {actionLoading ===
                              `details-${review._id}` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}

                              Details
                            </button>

                            {pending &&
                              !review.isDeleted && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    sendReminder(
                                      review
                                    )
                                  }
                                  disabled={
                                    actionLoading ===
                                    `mail-${review._id}`
                                  }
                                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60"
                                >
                                  {actionLoading ===
                                  `mail-${review._id}` ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Send className="h-3.5 w-3.5" />
                                  )}

                                  Reminder
                                </button>
                              )}

                            {review.reviewUrl &&
                              !review.isDeleted && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyText(
                                      review.reviewUrl,
                                      "Review link"
                                    )
                                  }
                                  className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-extrabold ${
                                    isDark
                                      ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                  }`}
                                >
                                  <Copy className="h-3.5 w-3.5" />

                                  Copy Link
                                </button>
                              )}

                            {review.isReviewed &&
                              !review.isDeleted && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEdit(
                                        review
                                      )
                                    }
                                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-extrabold text-white hover:bg-blue-700"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />

                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleActive(
                                        review
                                      )
                                    }
                                    disabled={
                                      actionLoading ===
                                      `active-${review._id}`
                                    }
                                    className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-extrabold ${
                                      review.isActive
                                        ? isDark
                                          ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                                          : "border-amber-200 bg-amber-50 text-amber-700"
                                        : isDark
                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    }`}
                                  >
                                    {review.isActive
                                      ? "Deactivate"
                                      : "Activate"}
                                  </button>
                                </>
                              )}

                            {!review.isDeleted ? (
                              <button
                                type="button"
                                onClick={() =>
                                  openDeleteConfirm(
                                    review,
                                    "SOFT_DELETE"
                                  )
                                }
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 text-xs font-extrabold text-red-500 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" />

                                Delete
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openDeleteConfirm(
                                      review,
                                      "RESTORE"
                                    )
                                  }
                                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-extrabold text-white hover:bg-emerald-700"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />

                                  Restore
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openDeleteConfirm(
                                      review,
                                      "HARD_DELETE"
                                    )
                                  }
                                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-3 text-xs font-extrabold text-white hover:bg-red-700"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />

                                  Delete Permanently
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                }
              )
            )}
          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          {pagination.totalPages >
            1 && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p
                className={`text-xs font-semibold ${muted}`}
              >
                Page{" "}
                {
                  pagination.page
                }{" "}
                of{" "}
                {
                  pagination.totalPages
                }{" "}
                ·{" "}
                {
                  pagination.total
                }{" "}
                records
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={
                    page <= 1
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          current -
                            1,
                          1
                        )
                    )
                  }
                  className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-extrabold disabled:cursor-not-allowed disabled:opacity-40 ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-slate-300"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />

                  Previous
                </button>

                <button
                  type="button"
                  disabled={
                    page >=
                    pagination.totalPages
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.min(
                          current +
                            1,
                          pagination.totalPages
                        )
                    )
                  }
                  className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-extrabold disabled:cursor-not-allowed disabled:opacity-40 ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-slate-300"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  Next

                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* =================================================
          DETAILS
      ================================================= */}

      <ReviewDetailsModal
        open={
          detailOpen
        }
        review={
          selectedReview
        }
        onClose={() =>
          setDetailOpen(
            false
          )
        }
        onEdit={(
          review
        ) => {
          setDetailOpen(
            false
          );

          openEdit(
            review
          );
        }}
        onSendReminder={
          sendReminder
        }
        sendingReminder={
          selectedReview
            ? actionLoading ===
              `mail-${selectedReview._id}`
            : false
        }
        onCopyLink={(
          value
        ) =>
          copyText(
            value,
            "Review link"
          )
        }
        isDark={isDark}
      />

      {/* =================================================
          EDIT
      ================================================= */}

      <EditReviewModal
        open={
          editOpen
        }
        review={
          editReview
        }
        saving={
          saving
        }
        onClose={() => {
          setEditOpen(
            false
          );

          setEditReview(
            null
          );
        }}
        onSave={
          saveReview
        }
        isDark={isDark}
      />

      {/* =================================================
          CONFIRM
      ================================================= */}

      <ConfirmModal
        open={
          confirm.open
        }
        isDark={
          isDark
        }
        loading={
          Boolean(
            actionLoading?.startsWith(
              "confirm-"
            )
          )
        }
        danger={
          confirm.action ===
            "SOFT_DELETE" ||
          confirm.action ===
            "HARD_DELETE"
        }
        title={
          confirm.action ===
          "RESTORE"
            ? "Restore Book Review?"
            : confirm.action ===
              "HARD_DELETE"
            ? "Permanently Delete Review?"
            : "Delete Book Review?"
        }
        message={
          confirm.action ===
          "RESTORE"
            ? "This will restore the review record. If the review was submitted it can become publicly visible again."
            : confirm.action ===
              "HARD_DELETE"
            ? "This permanently removes the BookReview record from the database. This action cannot be undone."
            : "This will soft delete the review and immediately remove it from public visibility. It can be restored later."
        }
        confirmText={
          confirm.action ===
          "RESTORE"
            ? "Restore"
            : confirm.action ===
              "HARD_DELETE"
            ? "Delete Permanently"
            : "Delete"
        }
        onClose={() =>
          setConfirm({
            open: false,
            action: null,
            review: null,
          })
        }
        onConfirm={
          runConfirmedAction
        }
      />
    </>
  );
}