import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  Archive,
  ArchiveRestore,
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Filter,
  FolderOpen,
  Image as ImageIcon,
  Info,
  Loader2,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Star,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useSelector } from "react-redux";

import toast, {
  Toaster,
} from "react-hot-toast";

import BASE_URL from "../utils/Url.js";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const THEME_KEY =
  "theme";

const THEME_EVENT =
  "targettrek-theme-change";

const PAGE_LIMIT = 12;

/*
|--------------------------------------------------------------------------
| THEME
|--------------------------------------------------------------------------
*/

const readTheme = () => {
  if (
    typeof window ===
    "undefined"
  ) {
    return "light";
  }

  const saved =
    window.localStorage.getItem(
      THEME_KEY
    );

  return saved === "dark"
    ? "dark"
    : "light";
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const safeArray = (
  value
) => {
  return Array.isArray(value)
    ? value
    : [];
};

const safeNumber = (
  value
) => {
  const parsed =
    Number(value);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0;
};

const stripHtml = (
  html = ""
) => {
  if (!html) {
    return "";
  }

  try {
    const doc =
      new DOMParser().parseFromString(
        String(html),
        "text/html"
      );

    return (
      doc.body.textContent ||
      ""
    );
  } catch {
    return String(html).replace(
      /<[^>]*>/g,
      " "
    );
  }
};

const truncateText = (
  value = "",
  length = 140
) => {
  const text =
    stripHtml(value)
      .replace(/\s+/g, " ")
      .trim();

  if (
    text.length <= length
  ) {
    return text;
  }

  return `${text
    .slice(0, length)
    .trim()}...`;
};

const formatDate = (
  value
) => {
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

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
};

const formatDateTime = (
  value
) => {
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

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  ).format(date);
};

const formatViews = (
  value
) => {
  const views =
    safeNumber(value);

  if (
    views >= 1000000
  ) {
    return `${(
      views / 1000000
    ).toFixed(
      views >= 10000000
        ? 0
        : 1
    )}M`;
  }

  if (
    views >= 1000
  ) {
    return `${(
      views / 1000
    ).toFixed(
      views >= 10000
        ? 0
        : 1
    )}K`;
  }

  return views.toLocaleString(
    "en-IN"
  );
};

const getErrorMessage = (
  error,
  fallback = "Something went wrong."
) => {
  return (
    error?.response?.data?.error
      ?.message ||
    error?.response?.data
      ?.message ||
    error?.message ||
    fallback
  );
};

const getTags = (
  blog
) => {
  if (
    !Array.isArray(
      blog?.tags
    )
  ) {
    return [];
  }

  return blog.tags
    .map((tag) =>
      typeof tag ===
      "string"
        ? tag
        : tag?.name ||
          tag?.title ||
          ""
    )
    .filter(Boolean);
};

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

const StatCard = ({
  icon: Icon,
  label,
  value,
  description,
  isDark,
  accent = "blue",
  onClick,
}) => {
  const palettes = {
    blue: isDark
      ? "bg-blue-950/25 text-blue-300"
      : "bg-blue-50 text-blue-700",

    emerald: isDark
      ? "bg-emerald-950/25 text-emerald-300"
      : "bg-emerald-50 text-emerald-700",

    amber: isDark
      ? "bg-amber-950/25 text-amber-300"
      : "bg-amber-50 text-amber-700",

    violet: isDark
      ? "bg-violet-950/25 text-violet-300"
      : "bg-violet-50 text-violet-700",

    rose: isDark
      ? "bg-rose-950/25 text-rose-300"
      : "bg-rose-50 text-rose-700",

    cyan: isDark
      ? "bg-cyan-950/25 text-cyan-300"
      : "bg-cyan-50 text-cyan-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full
        rounded-2xl
        border
        p-4
        text-left
        transition-all
        duration-200
        hover:-translate-y-0.5
        ${
          isDark
            ? "border-[#1E2C3D] bg-[#0C131D] hover:border-[#29415B]"
            : "border-[#E1E9F1] bg-white hover:border-[#BFDDF2] hover:shadow-sm"
        }
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${palettes[accent]}
          `}
        >
          <Icon size={19} />
        </div>

        <ArrowRight
          size={15}
          className={
            isDark
              ? "text-[#4C5E72]"
              : "text-[#A1ADBB]"
          }
        />
      </div>

      <div className="mt-4">
        <p
          className={`
            text-2xl
            font-black
            tracking-tight
            ${
              isDark
                ? "text-[#F4F7FA]"
                : "text-[#0B1524]"
            }
          `}
        >
          {value}
        </p>

        <p
          className={`
            mt-1
            text-sm
            font-bold
            ${
              isDark
                ? "text-[#CFD8E3]"
                : "text-[#25364A]"
            }
          `}
        >
          {label}
        </p>

        <p
          className={`
            mt-1
            text-xs
            leading-5
            ${
              isDark
                ? "text-[#708196]"
                : "text-[#7C8CA3]"
            }
          `}
        >
          {description}
        </p>
      </div>
    </button>
  );
};

/*
|--------------------------------------------------------------------------
| BADGE
|--------------------------------------------------------------------------
*/

const StatusBadge = ({
  children,
  type,
  isDark,
}) => {
  const styles = {
    published: isDark
      ? "bg-emerald-950/30 text-emerald-300 border-emerald-900/40"
      : "bg-emerald-50 text-emerald-700 border-emerald-200",

    draft: isDark
      ? "bg-amber-950/30 text-amber-300 border-amber-900/40"
      : "bg-amber-50 text-amber-700 border-amber-200",

    featured: isDark
      ? "bg-blue-950/30 text-blue-300 border-blue-900/40"
      : "bg-blue-50 text-blue-700 border-blue-200",

    editor: isDark
      ? "bg-violet-950/30 text-violet-300 border-violet-900/40"
      : "bg-violet-50 text-violet-700 border-violet-200",

    deleted: isDark
      ? "bg-red-950/30 text-red-300 border-red-900/40"
      : "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-2.5
        py-1
        text-[10px]
        font-bold
        ${styles[type]}
      `}
    >
      {children}
    </span>
  );
};

/*
|--------------------------------------------------------------------------
| PAGINATION
|--------------------------------------------------------------------------
*/

const Pagination = ({
  pagination,
  onPageChange,
  isDark,
}) => {
  const current =
    safeNumber(
      pagination?.page
    ) || 1;

  const totalPages =
    Math.max(
      1,
      safeNumber(
        pagination?.totalPages
      ) || 1
    );

  if (
    totalPages <= 1
  ) {
    return null;
  }

  const pages = [];

  const start =
    Math.max(
      1,
      current - 2
    );

  const end =
    Math.min(
      totalPages,
      current + 2
    );

  for (
    let page = start;
    page <= end;
    page += 1
  ) {
    pages.push(page);
  }

  const normalButton =
    isDark
      ? "border-[#1E2C3D] bg-[#0C131D] text-[#9AA9BA] hover:bg-[#172333]"
      : "border-[#E1E9F1] bg-white text-[#5B6B82] hover:bg-[#F5F9FC]";

  const activeButton =
    isDark
      ? "border-[#66B8EA] bg-[#1D5C86] text-white"
      : "border-[#1D5C86] bg-[#1D5C86] text-white";

  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
      <p
        className={`
          text-xs
          ${
            isDark
              ? "text-[#708196]"
              : "text-[#7C8CA3]"
          }
        `}
      >
        Page{" "}
        <strong>
          {current}
        </strong>{" "}
        of{" "}
        <strong>
          {totalPages}
        </strong>
        {" · "}
        {safeNumber(
          pagination?.total
        ).toLocaleString(
          "en-IN"
        )}{" "}
        posts
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          disabled={
            current <= 1
          }
          onClick={() =>
            onPageChange(
              current - 1
            )
          }
          className={`
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            transition
            disabled:cursor-not-allowed
            disabled:opacity-40
            ${normalButton}
          `}
        >
          <ChevronLeft
            size={16}
          />
        </button>

        {start > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                onPageChange(
                  1
                )
              }
              className={`
                h-9
                min-w-9
                rounded-xl
                border
                px-3
                text-xs
                font-bold
                ${normalButton}
              `}
            >
              1
            </button>

            {start > 2 && (
              <span
                className={
                  isDark
                    ? "text-[#708196]"
                    : "text-slate-400"
                }
              >
                …
              </span>
            )}
          </>
        )}

        {pages.map(
          (page) => (
            <button
              key={page}
              type="button"
              onClick={() =>
                onPageChange(
                  page
                )
              }
              className={`
                h-9
                min-w-9
                rounded-xl
                border
                px-3
                text-xs
                font-bold
                transition
                ${
                  page ===
                  current
                    ? activeButton
                    : normalButton
                }
              `}
            >
              {page}
            </button>
          )
        )}

        {end <
          totalPages && (
          <>
            {end <
              totalPages -
                1 && (
              <span
                className={
                  isDark
                    ? "text-[#708196]"
                    : "text-slate-400"
                }
              >
                …
              </span>
            )}

            <button
              type="button"
              onClick={() =>
                onPageChange(
                  totalPages
                )
              }
              className={`
                h-9
                min-w-9
                rounded-xl
                border
                px-3
                text-xs
                font-bold
                ${normalButton}
              `}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          disabled={
            current >=
            totalPages
          }
          onClick={() =>
            onPageChange(
              current + 1
            )
          }
          className={`
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            border
            transition
            disabled:cursor-not-allowed
            disabled:opacity-40
            ${normalButton}
          `}
        >
          <ChevronRight
            size={16}
          />
        </button>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| CONFIRMATION MODAL
|--------------------------------------------------------------------------
*/

const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  loading,
  title,
  message,
  confirmText,
  destructive = true,
  isDark,
}) => {
  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/65
        p-4
        backdrop-blur-sm
      "
      onClick={
        loading
          ? undefined
          : onClose
      }
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className={`
          w-full
          max-w-md
          overflow-hidden
          rounded-3xl
          border
          shadow-2xl
          ${
            isDark
              ? "border-[#1E2C3D] bg-[#0C131D]"
              : "border-[#E1E9F1] bg-white"
          }
        `}
      >
        <div
          className={`
            flex
            items-center
            justify-between
            border-b
            p-5
            ${
              isDark
                ? "border-[#1E2C3D]"
                : "border-[#E1E9F1]"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div
              className={`
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                ${
                  destructive
                    ? isDark
                      ? "bg-red-950/30 text-red-300"
                      : "bg-red-50 text-red-600"
                    : isDark
                    ? "bg-blue-950/30 text-blue-300"
                    : "bg-blue-50 text-blue-700"
                }
              `}
            >
              {destructive ? (
                <ShieldAlert
                  size={19}
                />
              ) : (
                <ArchiveRestore
                  size={19}
                />
              )}
            </div>

            <h2
              className={`
                font-bold
                ${
                  isDark
                    ? "text-[#F4F7FA]"
                    : "text-[#0B1524]"
                }
              `}
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className={`
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              ${
                isDark
                  ? "text-[#9AA9BA] hover:bg-[#172333]"
                  : "text-slate-500 hover:bg-slate-100"
              }
            `}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <p
            className={`
              text-sm
              leading-6
              ${
                isDark
                  ? "text-[#9AA9BA]"
                  : "text-[#5B6B82]"
              }
            `}
          >
            {message}
          </p>
        </div>

        <div
          className={`
            flex
            flex-col-reverse
            gap-3
            border-t
            p-4
            sm:flex-row
            sm:justify-end
            ${
              isDark
                ? "border-[#1E2C3D]"
                : "border-[#E1E9F1]"
            }
          `}
        >
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className={`
              rounded-xl
              border
              px-4
              py-2.5
              text-sm
              font-semibold
              ${
                isDark
                  ? "border-[#1E2C3D] bg-[#101924] text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }
            `}
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              px-4
              py-2.5
              text-sm
              font-bold
              text-white
              disabled:opacity-60
              ${
                destructive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[#1D5C86] hover:bg-[#246F9F]"
              }
            `}
          >
            {loading && (
              <Loader2
                size={15}
                className="animate-spin"
              />
            )}

            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| BLOG DETAILS MODAL
|--------------------------------------------------------------------------
*/

const BlogDetailsModal = ({
  open,
  blog,
  loading,
  onClose,
  isDark,
}) => {
  if (!open) {
    return null;
  }

  const primaryText =
    isDark
      ? "text-[#F4F7FA]"
      : "text-[#0B1524]";

  const secondaryText =
    isDark
      ? "text-[#9AA9BA]"
      : "text-[#5B6B82]";

  const mutedText =
    isDark
      ? "text-[#708196]"
      : "text-[#7C8CA3]";

  const borderColor =
    isDark
      ? "border-[#1E2C3D]"
      : "border-[#E1E9F1]";

  const cardBg =
    isDark
      ? "bg-[#101924]"
      : "bg-[#F8FBFD]";

  const seo =
    blog?.seo || {};

  const tags =
    getTags(blog);

  return (
    <div
      className="
        fixed
        inset-0
        z-[90]
        bg-black/65
        p-0
        backdrop-blur-sm
        sm:p-4
      "
      onClick={onClose}
    >
      <div
        onClick={(e) =>
          e.stopPropagation()
        }
        className={`
          ml-auto
          flex
          h-full
          w-full
          max-w-3xl
          flex-col
          overflow-hidden
          border-l
          shadow-2xl
          ${
            isDark
              ? "border-[#1E2C3D] bg-[#080D14]"
              : "border-[#E1E9F1] bg-[#F5F9FC]"
          }
        `}
      >
        {/* HEADER */}

        <div
          className={`
            flex
            items-center
            justify-between
            gap-4
            border-b
            px-5
            py-4
            sm:px-6
            ${borderColor}
            ${
              isDark
                ? "bg-[#0C131D]"
                : "bg-white"
            }
          `}
        >
          <div className="min-w-0">
            <p
              className={`
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                ${mutedText}
              `}
            >
              Internal Blog Details
            </p>

            <h2
              className={`
                mt-1
                truncate
                text-lg
                font-black
                ${primaryText}
              `}
            >
              {blog?.title ||
                "Blog Details"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              transition
              ${
                isDark
                  ? "text-[#9AA9BA] hover:bg-[#172333]"
                  : "text-slate-500 hover:bg-slate-100"
              }
            `}
          >
            <X size={19} />
          </button>
        </div>

        {/* BODY */}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2
                size={30}
                className="animate-spin text-[#2E86C1]"
              />
            </div>
          ) : !blog ? (
            <div
              className={`
                py-16
                text-center
                text-sm
                ${secondaryText}
              `}
            >
              Blog details could
              not be loaded.
            </div>
          ) : (
            <div className="space-y-5">
              {/* IMAGE */}

              {blog.imageUrl && (
                <div
                  className={`
                    overflow-hidden
                    rounded-2xl
                    border
                    ${borderColor}
                  `}
                >
                  <img
                    src={
                      blog.imageUrl
                    }
                    alt={
                      blog.altText ||
                      blog.title
                    }
                    className="max-h-72 w-full object-cover"
                  />
                </div>
              )}

              {/* CORE */}

              <section
                className={`
                  rounded-2xl
                  border
                  p-5
                  ${borderColor}
                  ${
                    isDark
                      ? "bg-[#0C131D]"
                      : "bg-white"
                  }
                `}
              >
                <h3
                  className={`
                    text-sm
                    font-black
                    ${primaryText}
                  `}
                >
                  Core Information
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <DetailField
                    label="Title"
                    value={
                      blog.title
                    }
                    isDark={
                      isDark
                    }
                  />

                  <DetailField
                    label="Slug"
                    value={
                      blog.slug
                    }
                    isDark={
                      isDark
                    }
                  />

                  <DetailField
                    label="Author"
                    value={
                      blog.author
                    }
                    isDark={
                      isDark
                    }
                  />

                  <DetailField
                    label="Category"
                    value={
                      blog.category
                    }
                    isDark={
                      isDark
                    }
                  />

                  <DetailField
                    label="Views"
                    value={safeNumber(
                      blog.views
                    ).toLocaleString(
                      "en-IN"
                    )}
                    isDark={
                      isDark
                    }
                  />

                  <DetailField
                    label="Reading Time"
                    value={`${
                      safeNumber(
                        blog.readingTimeMinutes
                      ) || "—"
                    } min`}
                    isDark={
                      isDark
                    }
                  />

                  <DetailField
                    label="Published"
                    value={
                      blog.isPublished
                        ? "Yes"
                        : "No"
                    }
                    isDark={
                      isDark
                    }
                  />

                  <DetailField
                    label="Featured"
                    value={
                      blog.isFeatured
                        ? "Yes"
                        : "No"
                    }
                    isDark={
                      isDark
                    }
                  />

                  <DetailField
                    label="Editor's Choice"
                    value={
                      blog.editorChoice
                        ? "Yes"
                        : "No"
                    }
                    isDark={
                      isDark
                    }
                  />

                  <DetailField
                    label="Deleted"
                    value={
                      blog.isDeleted
                        ? "Yes"
                        : "No"
                    }
                    isDark={
                      isDark
                    }
                  />
                </div>
              </section>

              {/* EXCERPT */}

              <section
                className={`
                  rounded-2xl
                  border
                  p-5
                  ${borderColor}
                  ${
                    isDark
                      ? "bg-[#0C131D]"
                      : "bg-white"
                  }
                `}
              >
                <h3
                  className={`
                    text-sm
                    font-black
                    ${primaryText}
                  `}
                >
                  Excerpt
                </h3>

                <p
                  className={`
                    mt-3
                    text-sm
                    leading-7
                    ${secondaryText}
                  `}
                >
                  {blog.excerpt ||
                    "No excerpt."}
                </p>
              </section>

              {/* TAGS */}

              <section
                className={`
                  rounded-2xl
                  border
                  p-5
                  ${borderColor}
                  ${
                    isDark
                      ? "bg-[#0C131D]"
                      : "bg-white"
                  }
                `}
              >
                <h3
                  className={`
                    text-sm
                    font-black
                    ${primaryText}
                  `}
                >
                  Tags
                </h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.length >
                  0 ? (
                    tags.map(
                      (tag) => (
                        <span
                          key={
                            tag
                          }
                          className={`
                            rounded-full
                            border
                            px-3
                            py-1.5
                            text-xs
                            font-semibold
                            ${borderColor}
                            ${cardBg}
                            ${secondaryText}
                          `}
                        >
                          #{tag}
                        </span>
                      )
                    )
                  ) : (
                    <span
                      className={`
                        text-sm
                        ${mutedText}
                      `}
                    >
                      No tags.
                    </span>
                  )}
                </div>
              </section>

              {/* TIMELINE */}

              <section
                className={`
                  rounded-2xl
                  border
                  p-5
                  ${borderColor}
                  ${
                    isDark
                      ? "bg-[#0C131D]"
                      : "bg-white"
                  }
                `}
              >
                <h3
                  className={`
                    text-sm
                    font-black
                    ${primaryText}
                  `}
                >
                  Internal Timeline
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <DetailField
                    label="Created"
                    value={formatDateTime(
                      blog.createdAt
                    )}
                    isDark={
                      isDark
                    }
                  />

                  <DetailField
                    label="Published"
                    value={formatDateTime(
                      blog.publishedAt
                    )}
                    isDark={
                      isDark
                    }
                  />

                  <DetailField
                    label="Updated"
                    value={formatDateTime(
                      blog.updatedAt
                    )}
                    isDark={
                      isDark
                    }
                  />

                  <DetailField
                    label="Deleted"
                    value={formatDateTime(
                      blog.deletedAt
                    )}
                    isDark={
                      isDark
                    }
                  />

                  {blog.deletedBy && (
                    <DetailField
                      label="Deleted By"
                      value={
                        blog.deletedBy
                      }
                      isDark={
                        isDark
                      }
                    />
                  )}
                </div>
              </section>

              {/* IMAGE */}

              <section
                className={`
                  rounded-2xl
                  border
                  p-5
                  ${borderColor}
                  ${
                    isDark
                      ? "bg-[#0C131D]"
                      : "bg-white"
                  }
                `}
              >
                <h3
                  className={`
                    text-sm
                    font-black
                    ${primaryText}
                  `}
                >
                  Image Information
                </h3>

                <div className="mt-4 space-y-4">
                  <DetailField
                    label="Image URL"
                    value={
                      blog.imageUrl ||
                      "—"
                    }
                    isDark={
                      isDark
                    }
                  />

                  <DetailField
                    label="Alt Text"
                    value={
                      blog.altText ||
                      "—"
                    }
                    isDark={
                      isDark
                    }
                  />
                </div>
              </section>

              {/* SEO INTERNAL */}

              <section
                className={`
                  rounded-2xl
                  border
                  p-5
                  ${borderColor}
                  ${
                    isDark
                      ? "bg-[#0C131D]"
                      : "bg-white"
                  }
                `}
              >
                <h3
                  className={`
                    text-sm
                    font-black
                    ${primaryText}
                  `}
                >
                  Stored SEO Data
                </h3>

                <p
                  className={`
                    mt-1
                    text-xs
                    ${mutedText}
                  `}
                >
                  Internal database
                  values only.
                </p>

                <div className="mt-4 space-y-4">
                  <DetailField
                    label="Meta Title"
                    value={
                      seo.metaTitle ||
                      "—"
                    }
                    isDark={
                      isDark
                    }
                  />

                  <DetailField
                    label="Meta Description"
                    value={
                      seo.metaDescription ||
                      "—"
                    }
                    isDark={
                      isDark
                    }
                  />

                  <DetailField
                    label="Canonical URL"
                    value={
                      seo.canonicalUrl ||
                      "—"
                    }
                    isDark={
                      isDark
                    }
                  />

                  <DetailField
                    label="OG Image"
                    value={
                      seo.ogImageUrl ||
                      "—"
                    }
                    isDark={
                      isDark
                    }
                  />

                  <DetailField
                    label="No Index"
                    value={
                      seo.noIndex
                        ? "Yes"
                        : "No"
                    }
                    isDark={
                      isDark
                    }
                  />

                  <DetailField
                    label="SEO Keywords"
                    value={
                      Array.isArray(
                        seo.keywords
                      )
                        ? seo.keywords.join(
                            ", "
                          ) ||
                          "—"
                        : "—"
                    }
                    isDark={
                      isDark
                    }
                  />
                </div>
              </section>

              {/* DATABASE */}

              <section
                className={`
                  rounded-2xl
                  border
                  p-5
                  ${borderColor}
                  ${
                    isDark
                      ? "bg-[#0C131D]"
                      : "bg-white"
                  }
                `}
              >
                <h3
                  className={`
                    text-sm
                    font-black
                    ${primaryText}
                  `}
                >
                  Database Information
                </h3>

                <div className="mt-4">
                  <DetailField
                    label="MongoDB ID"
                    value={
                      blog._id ||
                      "—"
                    }
                    isDark={
                      isDark
                    }
                  />
                </div>
              </section>

              {/* CONTENT */}

              {blog.content && (
                <section
                  className={`
                    rounded-2xl
                    border
                    p-5
                    ${borderColor}
                    ${
                      isDark
                        ? "bg-[#0C131D]"
                        : "bg-white"
                    }
                  `}
                >
                  <h3
                    className={`
                      text-sm
                      font-black
                      ${primaryText}
                    `}
                  >
                    Content Preview
                  </h3>

                  <div
                    className={`
                      admin-blog-content
                      mt-4
                      rounded-xl
                      border
                      p-4
                      ${borderColor}
                      ${cardBg}
                    `}
                    dangerouslySetInnerHTML={{
                      __html:
                        blog.content,
                    }}
                  />
                </section>
              )}
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          .admin-blog-content {
            color: ${
              isDark
                ? "#C4CFDA"
                : "#334155"
            };
            font-size: 14px;
            line-height: 1.7;
            overflow-wrap: anywhere;
          }

          .admin-blog-content h1,
          .admin-blog-content h2,
          .admin-blog-content h3,
          .admin-blog-content h4 {
            color: ${
              isDark
                ? "#F4F7FA"
                : "#0B1524"
            };
            font-weight: 800;
            margin: 1rem 0 0.5rem;
          }

          .admin-blog-content p {
            margin-bottom: 0.8rem;
          }

          .admin-blog-content img {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
          }

          .admin-blog-content pre {
            overflow-x: auto;
            border-radius: 10px;
            background: #0F172A;
            color: #E5EDF5;
            padding: 12px;
          }

          .admin-blog-content ul {
            list-style: disc;
            padding-left: 1.3rem;
          }

          .admin-blog-content ol {
            list-style: decimal;
            padding-left: 1.3rem;
          }
        `}
      </style>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| DETAIL FIELD
|--------------------------------------------------------------------------
*/

const DetailField = ({
  label,
  value,
  isDark,
}) => {
  return (
    <div>
      <p
        className={`
          text-[10px]
          font-bold
          uppercase
          tracking-[0.14em]
          ${
            isDark
              ? "text-[#708196]"
              : "text-[#7C8CA3]"
          }
        `}
      >
        {label}
      </p>

      <div
        className={`
          mt-1.5
          break-words
          rounded-xl
          px-3
          py-2.5
          text-xs
          leading-5
          ${
            isDark
              ? "bg-[#101924] text-[#CFD8E3]"
              : "bg-[#F5F9FC] text-[#334155]"
          }
        `}
      >
        {value}
      </div>
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| MAIN PAGE
|--------------------------------------------------------------------------
*/

const AdminBlogManagementPage =
  () => {
    const navigate =
      useNavigate();

    /*
    |--------------------------------------------------------------------------
    | AUTH
    |--------------------------------------------------------------------------
    */

    const auth =
      useSelector(
        (state) =>
          state?.auth || {}
      );

    const token =
      auth?.token;

    const user =
      auth?.user;

    const userRole =
      String(
        user?.role || ""
      ).toLowerCase();

    const canHardDelete =
      userRole === "admin";

    /*
    |--------------------------------------------------------------------------
    | THEME
    |--------------------------------------------------------------------------
    */

    const [
      theme,
      setTheme,
    ] = useState(
      readTheme
    );

    const isDark =
      theme === "dark";

    useEffect(() => {
      setTheme(
        readTheme()
      );

      const handleTheme =
        (event) => {
          const next =
            event?.detail
              ?.theme;

          if (
            next === "dark" ||
            next === "light"
          ) {
            setTheme(next);

            return;
          }

          setTheme(
            readTheme()
          );
        };

      const handleStorage =
        (event) => {
          if (
            event.key !==
            THEME_KEY
          ) {
            return;
          }

          if (
            event.newValue ===
              "dark" ||
            event.newValue ===
              "light"
          ) {
            setTheme(
              event.newValue
            );
          }
        };

      window.addEventListener(
        THEME_EVENT,
        handleTheme
      );

      window.addEventListener(
        "storage",
        handleStorage
      );

      return () => {
        window.removeEventListener(
          THEME_EVENT,
          handleTheme
        );

        window.removeEventListener(
          "storage",
          handleStorage
        );
      };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | MAIN STATE
    |--------------------------------------------------------------------------
    */

    const [
      blogs,
      setBlogs,
    ] = useState([]);

    const [
      stats,
      setStats,
    ] = useState({
      total: 0,
      published: 0,
      drafts: 0,
      featured: 0,
      editorChoice: 0,
      deleted: 0,
      totalViews: 0,
      topViewed: [],
    });

    const [
      categories,
      setCategories,
    ] = useState([]);

    const [
      loadingBlogs,
      setLoadingBlogs,
    ] = useState(true);

    const [
      loadingOverview,
      setLoadingOverview,
    ] = useState(true);

    const [
      refreshing,
      setRefreshing,
    ] = useState(false);

    const [
      error,
      setError,
    ] = useState("");

    /*
    |--------------------------------------------------------------------------
    | TAB
    |--------------------------------------------------------------------------
    */

    const [
      activeTab,
      setActiveTab,
    ] = useState("active");

    /*
    |--------------------------------------------------------------------------
    | FILTERS
    |--------------------------------------------------------------------------
    */

    const [
      searchInput,
      setSearchInput,
    ] = useState("");

    const [
      searchQuery,
      setSearchQuery,
    ] = useState("");

    const [
      statusFilter,
      setStatusFilter,
    ] = useState("all");

    const [
      categoryFilter,
      setCategoryFilter,
    ] = useState("");

    const [
      sortBy,
      setSortBy,
    ] = useState("latest");

    const [
      featuredOnly,
      setFeaturedOnly,
    ] = useState(false);

    const [
      editorOnly,
      setEditorOnly,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const [
      page,
      setPage,
    ] = useState(1);

    const [
      pagination,
      setPagination,
    ] = useState({
      page: 1,
      limit:
        PAGE_LIMIT,
      total: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage:
        false,
    });

    /*
    |--------------------------------------------------------------------------
    | ACTION STATE
    |--------------------------------------------------------------------------
    */

    const [
      actionLoading,
      setActionLoading,
    ] = useState("");

    const [
      softDeleteTarget,
      setSoftDeleteTarget,
    ] = useState(null);

    const [
      hardDeleteTarget,
      setHardDeleteTarget,
    ] = useState(null);

    const [
      restoreTarget,
      setRestoreTarget,
    ] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | DETAILS
    |--------------------------------------------------------------------------
    */

    const [
      detailsOpen,
      setDetailsOpen,
    ] = useState(false);

    const [
      detailsLoading,
      setDetailsLoading,
    ] = useState(false);

    const [
      selectedBlog,
      setSelectedBlog,
    ] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | THEME VALUES
    |--------------------------------------------------------------------------
    */

    const pageBg =
      isDark
        ? "bg-[#080D14]"
        : "bg-[#F5F9FC]";

    const primaryBg =
      isDark
        ? "bg-[#0C131D]"
        : "bg-white";

    const cardBg =
      isDark
        ? "bg-[#101924]"
        : "bg-[#F8FBFD]";

    const borderColor =
      isDark
        ? "border-[#1E2C3D]"
        : "border-[#E1E9F1]";

    const primaryText =
      isDark
        ? "text-[#F4F7FA]"
        : "text-[#0B1524]";

    const secondaryText =
      isDark
        ? "text-[#9AA9BA]"
        : "text-[#5B6B82]";

    const mutedText =
      isDark
        ? "text-[#708196]"
        : "text-[#7C8CA3]";

    const blueText =
      isDark
        ? "text-[#66B8EA]"
        : "text-[#1D5C86]";

    const inputClasses = `
      h-11
      w-full
      rounded-xl
      border
      px-3.5
      text-sm
      outline-none
      transition
      focus:border-[#2E86C1]
      focus:ring-4
      focus:ring-[#2E86C1]/10
      ${borderColor}
      ${
        isDark
          ? "bg-[#080D14] text-[#F4F7FA] placeholder:text-[#708196]"
          : "bg-[#F8FBFD] text-[#0B1524] placeholder:text-slate-400"
      }
    `;

    /*
    |--------------------------------------------------------------------------
    | SEARCH DEBOUNCE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
      const timer =
        window.setTimeout(
          () => {
            setSearchQuery(
              searchInput.trim()
            );

            setPage(1);
          },
          350
        );

      return () =>
        window.clearTimeout(
          timer
        );
    }, [searchInput]);

    /*
    |--------------------------------------------------------------------------
    | AUTH HEADER
    |--------------------------------------------------------------------------
    */

    const authHeaders =
      useMemo(
        () => ({
          Authorization:
            `Bearer ${token}`,
        }),
        [token]
      );

    /*
    |--------------------------------------------------------------------------
    | FETCH OVERVIEW
    |--------------------------------------------------------------------------
    */

    const fetchOverview =
      useCallback(
        async (
          silent = false
        ) => {
          if (!token) {
            return;
          }

          if (!silent) {
            setLoadingOverview(
              true
            );
          }

          try {
            const [
              statsResult,
              categoryResult,
            ] =
              await Promise.allSettled(
                [
                  axios.get(
                    `${BASE_URL}/blogs/admin/stats`,
                    {
                      headers:
                        authHeaders,
                    }
                  ),

                  axios.get(
                    `${BASE_URL}/blogs/meta/categories`
                  ),
                ]
              );

            if (
              statsResult.status ===
              "fulfilled"
            ) {
              const response =
                statsResult.value;

              if (
                response?.data
                  ?.success
              ) {
                setStats({
                  total:
                    safeNumber(
                      response.data
                        .data
                        ?.total
                    ),

                  published:
                    safeNumber(
                      response.data
                        .data
                        ?.published
                    ),

                  drafts:
                    safeNumber(
                      response.data
                        .data
                        ?.drafts
                    ),

                  featured:
                    safeNumber(
                      response.data
                        .data
                        ?.featured
                    ),

                  editorChoice:
                    safeNumber(
                      response.data
                        .data
                        ?.editorChoice
                    ),

                  deleted:
                    safeNumber(
                      response.data
                        .data
                        ?.deleted
                    ),

                  totalViews:
                    safeNumber(
                      response.data
                        .data
                        ?.totalViews
                    ),

                  topViewed:
                    safeArray(
                      response.data
                        .data
                        ?.topViewed
                    ),
                });
              }
            } else {
              console.error(
                "Blog stats error:",
                statsResult.reason
              );
            }

            if (
              categoryResult.status ===
              "fulfilled"
            ) {
              const response =
                categoryResult.value;

              if (
                response?.data
                  ?.success
              ) {
                setCategories(
                  safeArray(
                    response.data
                      .data
                  )
                );
              }
            } else {
              console.error(
                "Category fetch error:",
                categoryResult.reason
              );
            }
          } finally {
            if (!silent) {
              setLoadingOverview(
                false
              );
            }
          }
        },
        [
          token,
          authHeaders,
        ]
      );

    /*
    |--------------------------------------------------------------------------
    | FETCH BLOGS
    |--------------------------------------------------------------------------
    */

    const fetchBlogs =
      useCallback(
        async (
          silent = false
        ) => {
          if (!token) {
            return;
          }

          if (!silent) {
            setLoadingBlogs(
              true
            );
          }

          setError("");

          try {
            let url = "";

            const params = {
              page,
              limit:
                PAGE_LIMIT,
            };

            /*
             * ACTIVE POSTS
             */

            if (
              activeTab ===
              "active"
            ) {
              url =
                `${BASE_URL}/blogs/admin/all`;

              if (
                searchQuery
              ) {
                params.search =
                  searchQuery;
              }

              if (
                statusFilter !==
                "all"
              ) {
                params.status =
                  statusFilter;
              }

              if (
                categoryFilter
              ) {
                params.category =
                  categoryFilter;
              }

              if (sortBy) {
                params.sort =
                  sortBy;
              }

              if (
                featuredOnly
              ) {
                params.featured =
                  "true";
              }

              if (
                editorOnly
              ) {
                params.editorChoice =
                  "true";
              }
            }

            /*
             * TRASH
             */

            if (
              activeTab ===
              "trash"
            ) {
              url =
                `${BASE_URL}/blogs/admin/trash`;

              if (
                searchQuery
              ) {
                params.search =
                  searchQuery;
              }
            }

            const response =
              await axios.get(
                url,
                {
                  headers:
                    authHeaders,
                  params,
                }
              );

            if (
              !response?.data
                ?.success
            ) {
              throw new Error(
                response?.data
                  ?.error
                  ?.message ||
                  "Failed to load blogs."
              );
            }

            setBlogs(
              safeArray(
                response.data
                  .data
              )
            );

            const incoming =
              response.data
                .pagination || {};

            setPagination({
              page:
                safeNumber(
                  incoming.page
                ) || page,

              limit:
                safeNumber(
                  incoming.limit
                ) ||
                PAGE_LIMIT,

              total:
                safeNumber(
                  incoming.total
                ),

              totalPages:
                Math.max(
                  1,
                  safeNumber(
                    incoming.totalPages
                  ) || 1
                ),

              hasNextPage:
                Boolean(
                  incoming.hasNextPage
                ),

              hasPreviousPage:
                Boolean(
                  incoming.hasPreviousPage
                ),
            });
          } catch (err) {
            const message =
              getErrorMessage(
                err,
                "Failed to fetch blog posts."
              );

            setError(
              message
            );

            if (!silent) {
              toast.error(
                message
              );
            }

            setBlogs([]);
          } finally {
            if (!silent) {
              setLoadingBlogs(
                false
              );
            }
          }
        },
        [
          token,
          authHeaders,
          activeTab,
          page,
          searchQuery,
          statusFilter,
          categoryFilter,
          sortBy,
          featuredOnly,
          editorOnly,
        ]
      );

    /*
    |--------------------------------------------------------------------------
    | INITIAL / FILTER FETCH
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
    }, []);

    useEffect(() => {
      fetchOverview();
    }, [fetchOverview]);

    useEffect(() => {
      fetchBlogs();
    }, [fetchBlogs]);

    /*
    |--------------------------------------------------------------------------
    | REFRESH ALL
    |--------------------------------------------------------------------------
    */

    const refreshAll =
      async () => {
        setRefreshing(
          true
        );

        try {
          await Promise.all([
            fetchOverview(
              true
            ),
            fetchBlogs(
              true
            ),
          ]);

          toast.success(
            "Blog dashboard refreshed."
          );
        } finally {
          setRefreshing(
            false
          );
        }
      };

    /*
    |--------------------------------------------------------------------------
    | OPEN DETAILS
    |--------------------------------------------------------------------------
    */

    const openDetails =
      async (blog) => {
        if (!blog?._id) {
          return;
        }

        setSelectedBlog(
          blog
        );

        setDetailsOpen(
          true
        );

        setDetailsLoading(
          true
        );

        try {
          /*
           * Deleted posts cannot be
           * fetched by admin/:id
           * because that controller
           * searches isDeleted:false.
           *
           * For trash, list payload
           * already contains metadata,
           * so use that directly.
           */

          if (
            activeTab ===
            "trash"
          ) {
            return;
          }

          const response =
            await axios.get(
              `${BASE_URL}/blogs/admin/${blog._id}`,
              {
                headers:
                  authHeaders,
              }
            );

          if (
            response?.data
              ?.success
          ) {
            setSelectedBlog(
              response.data
                .data
            );
          } else {
            throw new Error(
              "Unable to load blog details."
            );
          }
        } catch (err) {
          toast.error(
            getErrorMessage(
              err,
              "Unable to load blog details."
            )
          );
        } finally {
          setDetailsLoading(
            false
          );
        }
      };

    /*
    |--------------------------------------------------------------------------
    | PUBLISH STATUS
    |--------------------------------------------------------------------------
    */

    const changePublishStatus =
      async (
        blog
      ) => {
        const id =
          blog?._id;

        if (!id) {
          return;
        }

        const nextStatus =
          !blog.isPublished;

        const key =
          `status-${id}`;

        setActionLoading(
          key
        );

        try {
          const response =
            await axios.patch(
              `${BASE_URL}/blogs/admin/${id}/status`,
              {
                isPublished:
                  nextStatus,
              },
              {
                headers:
                  authHeaders,
              }
            );

          if (
            !response?.data
              ?.success
          ) {
            throw new Error(
              response?.data
                ?.error
                ?.message ||
                "Failed to update status."
            );
          }

          toast.success(
            response.data
              .message ||
              "Status updated."
          );

          await Promise.all([
            fetchBlogs(
              true
            ),
            fetchOverview(
              true
            ),
          ]);
        } catch (err) {
          toast.error(
            getErrorMessage(
              err,
              "Failed to update status."
            )
          );
        } finally {
          setActionLoading(
            ""
          );
        }
      };

    /*
    |--------------------------------------------------------------------------
    | FEATURED
    |--------------------------------------------------------------------------
    */

    const changeFeatured =
      async (
        blog
      ) => {
        const id =
          blog?._id;

        if (!id) {
          return;
        }

        const key =
          `featured-${id}`;

        setActionLoading(
          key
        );

        try {
          const response =
            await axios.patch(
              `${BASE_URL}/blogs/admin/${id}/featured`,
              {
                isFeatured:
                  !blog.isFeatured,
              },
              {
                headers:
                  authHeaders,
              }
            );

          if (
            !response?.data
              ?.success
          ) {
            throw new Error(
              response?.data
                ?.error
                ?.message ||
                "Unable to update featured status."
            );
          }

          toast.success(
            response.data
              .message ||
              "Featured status updated."
          );

          await Promise.all([
            fetchBlogs(
              true
            ),
            fetchOverview(
              true
            ),
          ]);
        } catch (err) {
          toast.error(
            getErrorMessage(
              err
            )
          );
        } finally {
          setActionLoading(
            ""
          );
        }
      };

    /*
    |--------------------------------------------------------------------------
    | EDITOR CHOICE
    |--------------------------------------------------------------------------
    */

    const changeEditorChoice =
      async (
        blog
      ) => {
        const id =
          blog?._id;

        if (!id) {
          return;
        }

        const key =
          `editor-${id}`;

        setActionLoading(
          key
        );

        try {
          const response =
            await axios.patch(
              `${BASE_URL}/blogs/admin/${id}/editor-choice`,
              {
                editorChoice:
                  !blog.editorChoice,
              },
              {
                headers:
                  authHeaders,
              }
            );

          if (
            !response?.data
              ?.success
          ) {
            throw new Error(
              response?.data
                ?.error
                ?.message ||
                "Unable to update Editor's Choice."
            );
          }

          toast.success(
            response.data
              .message ||
              "Editor's Choice updated."
          );

          await Promise.all([
            fetchBlogs(
              true
            ),
            fetchOverview(
              true
            ),
          ]);
        } catch (err) {
          toast.error(
            getErrorMessage(
              err
            )
          );
        } finally {
          setActionLoading(
            ""
          );
        }
      };

    /*
    |--------------------------------------------------------------------------
    | SOFT DELETE
    |--------------------------------------------------------------------------
    */

    const softDeleteBlog =
      async () => {
        const blog =
          softDeleteTarget;

        if (!blog?._id) {
          return;
        }

        const key =
          `delete-${blog._id}`;

        setActionLoading(
          key
        );

        try {
          const response =
            await axios.delete(
              `${BASE_URL}/blogs/admin/${blog._id}`,
              {
                headers:
                  authHeaders,
              }
            );

          if (
            !response?.data
              ?.success
          ) {
            throw new Error(
              response?.data
                ?.error
                ?.message ||
                "Unable to move blog to trash."
            );
          }

          toast.success(
            response.data
              .message ||
              "Blog moved to trash."
          );

          setSoftDeleteTarget(
            null
          );

          await Promise.all([
            fetchBlogs(
              true
            ),
            fetchOverview(
              true
            ),
          ]);
        } catch (err) {
          toast.error(
            getErrorMessage(
              err
            )
          );
        } finally {
          setActionLoading(
            ""
          );
        }
      };

    /*
    |--------------------------------------------------------------------------
    | RESTORE
    |--------------------------------------------------------------------------
    */

    const restoreBlog =
      async () => {
        const blog =
          restoreTarget;

        if (!blog?._id) {
          return;
        }

        const key =
          `restore-${blog._id}`;

        setActionLoading(
          key
        );

        try {
          const response =
            await axios.patch(
              `${BASE_URL}/blogs/admin/${blog._id}/restore`,
              null,
              {
                headers:
                  authHeaders,
              }
            );

          if (
            !response?.data
              ?.success
          ) {
            throw new Error(
              response?.data
                ?.error
                ?.message ||
                "Unable to restore blog."
            );
          }

          toast.success(
            response.data
              .message ||
              "Blog restored."
          );

          setRestoreTarget(
            null
          );

          await Promise.all([
            fetchBlogs(
              true
            ),
            fetchOverview(
              true
            ),
          ]);
        } catch (err) {
          toast.error(
            getErrorMessage(
              err
            )
          );
        } finally {
          setActionLoading(
            ""
          );
        }
      };

    /*
    |--------------------------------------------------------------------------
    | HARD DELETE
    |--------------------------------------------------------------------------
    */

    const hardDeleteBlog =
      async () => {
        const blog =
          hardDeleteTarget;

        if (
          !blog?._id ||
          !canHardDelete
        ) {
          return;
        }

        const key =
          `hard-${blog._id}`;

        setActionLoading(
          key
        );

        try {
          const response =
            await axios.delete(
              `${BASE_URL}/blogs/admin/${blog._id}/hard`,
              {
                headers:
                  authHeaders,
              }
            );

          if (
            !response?.data
              ?.success
          ) {
            throw new Error(
              response?.data
                ?.error
                ?.message ||
                "Permanent deletion failed."
            );
          }

          toast.success(
            response.data
              .message ||
              "Blog permanently deleted."
          );

          setHardDeleteTarget(
            null
          );

          await Promise.all([
            fetchBlogs(
              true
            ),
            fetchOverview(
              true
            ),
          ]);
        } catch (err) {
          toast.error(
            getErrorMessage(
              err
            )
          );
        } finally {
          setActionLoading(
            ""
          );
        }
      };

    /*
    |--------------------------------------------------------------------------
    | RESET FILTERS
    |--------------------------------------------------------------------------
    */

    const resetFilters =
      () => {
        setSearchInput("");
        setSearchQuery("");
        setStatusFilter(
          "all"
        );
        setCategoryFilter(
          ""
        );
        setSortBy(
          "latest"
        );
        setFeaturedOnly(
          false
        );
        setEditorOnly(
          false
        );
        setPage(1);
      };

    /*
    |--------------------------------------------------------------------------
    | STAT CARD FILTERS
    |--------------------------------------------------------------------------
    */

    const showAll =
      () => {
        setActiveTab(
          "active"
        );
        resetFilters();
      };

    const showPublished =
      () => {
        setActiveTab(
          "active"
        );
        setStatusFilter(
          "published"
        );
        setFeaturedOnly(
          false
        );
        setEditorOnly(
          false
        );
        setPage(1);
      };

    const showDrafts =
      () => {
        setActiveTab(
          "active"
        );
        setStatusFilter(
          "draft"
        );
        setFeaturedOnly(
          false
        );
        setEditorOnly(
          false
        );
        setPage(1);
      };

    const showFeatured =
      () => {
        setActiveTab(
          "active"
        );
        setStatusFilter(
          "all"
        );
        setFeaturedOnly(
          true
        );
        setEditorOnly(
          false
        );
        setPage(1);
      };

    const showEditorChoice =
      () => {
        setActiveTab(
          "active"
        );
        setStatusFilter(
          "all"
        );
        setFeaturedOnly(
          false
        );
        setEditorOnly(
          true
        );
        setPage(1);
      };

    const showTrash =
      () => {
        setActiveTab(
          "trash"
        );
        setPage(1);
      };

    /*
    |--------------------------------------------------------------------------
    | CHANGE TAB
    |--------------------------------------------------------------------------
    */

    const handleTabChange =
      (tab) => {
        setActiveTab(tab);

        setPage(1);

        setSearchInput("");
        setSearchQuery("");

        if (
          tab === "active"
        ) {
          setStatusFilter(
            "all"
          );
          setCategoryFilter(
            ""
          );
          setSortBy(
            "latest"
          );
          setFeaturedOnly(
            false
          );
          setEditorOnly(
            false
          );
        }
      };

    /*
    |--------------------------------------------------------------------------
    | STATS CARDS
    |--------------------------------------------------------------------------
    */

    const statCards = [
      {
        label:
          "Active Blogs",

        value:
          stats.total.toLocaleString(
            "en-IN"
          ),

        description:
          "All non-deleted blog posts.",

        icon:
          BookOpen,

        accent:
          "blue",

        onClick:
          showAll,
      },

      {
        label:
          "Published",

        value:
          stats.published.toLocaleString(
            "en-IN"
          ),

        description:
          "Currently visible to readers.",

        icon:
          Eye,

        accent:
          "emerald",

        onClick:
          showPublished,
      },

      {
        label:
          "Drafts",

        value:
          stats.drafts.toLocaleString(
            "en-IN"
          ),

        description:
          "Posts not publicly published.",

        icon:
          EyeOff,

        accent:
          "amber",

        onClick:
          showDrafts,
      },

      {
        label:
          "Total Views",

        value:
          formatViews(
            stats.totalViews
          ),

        description:
          "Views across active blog posts.",

        icon:
          BarChart3,

        accent:
          "cyan",

        onClick: () => {
          setActiveTab(
            "active"
          );
          setSortBy(
            "views"
          );
          setStatusFilter(
            "all"
          );
          setPage(1);
        },
      },

      {
        label:
          "Featured",

        value:
          stats.featured.toLocaleString(
            "en-IN"
          ),

        description:
          "Posts marked as featured.",

        icon:
          Sparkles,

        accent:
          "blue",

        onClick:
          showFeatured,
      },

      {
        label:
          "Editor's Choice",

        value:
          stats.editorChoice.toLocaleString(
            "en-IN"
          ),

        description:
          "Editorially selected posts.",

        icon:
          Star,

        accent:
          "violet",

        onClick:
          showEditorChoice,
      },

      {
        label:
          "Trash",

        value:
          stats.deleted.toLocaleString(
            "en-IN"
          ),

        description:
          "Soft-deleted posts available for restore.",

        icon:
          Archive,

        accent:
          "rose",

        onClick:
          showTrash,
      },
    ];

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
      <main
        className={`
          min-h-screen
          pb-20
          pt-20
          transition-colors
          duration-300
          ${pageBg}
          ${primaryText}
        `}
      >
        <Toaster
          position="top-center"
          reverseOrder={false}
        />

        {/* ============================================================= */}
        {/* HEADER */}
        {/* ============================================================= */}

        <section
          className={`
            border-b
            ${borderColor}
            ${primaryBg}
          `}
        >
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div
                  className={`
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    px-3
                    py-1.5
                    text-xs
                    font-bold
                    ${borderColor}
                    ${
                      isDark
                        ? "bg-blue-950/20 text-[#66B8EA]"
                        : "bg-[#EAF4FC] text-[#1D5C86]"
                    }
                  `}
                >
                  <BookOpen
                    size={14}
                  />

                  Internal Blog
                  Management
                </div>

                <h1
                  className={`
                    mt-4
                    text-3xl
                    font-black
                    tracking-tight
                    sm:text-4xl
                    ${primaryText}
                  `}
                >
                  Blog Operations
                </h1>

                <p
                  className={`
                    mt-2
                    max-w-2xl
                    text-sm
                    leading-6
                    ${secondaryText}
                  `}
                >
                  Manage publishing,
                  visibility,
                  editorial labels,
                  analytics, trash and
                  permanent deletion
                  from one dashboard.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={
                    refreshAll
                  }
                  disabled={
                    refreshing
                  }
                  className={`
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    transition
                    disabled:opacity-50
                    ${borderColor}
                    ${
                      isDark
                        ? "bg-[#101924] text-[#CFD8E3] hover:bg-[#172333]"
                        : "bg-white text-[#334155] hover:bg-[#F8FBFD]"
                    }
                  `}
                >
                  <RefreshCw
                    size={16}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh
                </button>

                <Link
                  to="/admin/add-blog"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#1D5C86]
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-[#246F9F]
                  "
                >
                  <PlusCircle
                    size={17}
                  />

                  Create Blog
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* =========================================================== */}
          {/* STATS */}
          {/* =========================================================== */}

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2
                  className={`
                    text-lg
                    font-black
                    ${primaryText}
                  `}
                >
                  Overview
                </h2>

                <p
                  className={`
                    mt-1
                    text-xs
                    ${mutedText}
                  `}
                >
                  Click a card to
                  filter the blog
                  list.
                </p>
              </div>

              {loadingOverview && (
                <Loader2
                  size={17}
                  className="animate-spin text-[#2E86C1]"
                />
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {statCards.map(
                (card) => (
                  <StatCard
                    key={
                      card.label
                    }
                    {...card}
                    isDark={
                      isDark
                    }
                  />
                )
              )}
            </div>
          </section>

          {/* =========================================================== */}
          {/* TOP VIEWED */}
          {/* =========================================================== */}

          {stats.topViewed.length >
            0 && (
            <section className="mt-8">
              <div
                className={`
                  overflow-hidden
                  rounded-3xl
                  border
                  ${borderColor}
                  ${primaryBg}
                `}
              >
                <div
                  className={`
                    flex
                    items-center
                    justify-between
                    border-b
                    px-5
                    py-4
                    sm:px-6
                    ${borderColor}
                  `}
                >
                  <div>
                    <h2
                      className={`
                        flex
                        items-center
                        gap-2
                        text-sm
                        font-black
                        ${primaryText}
                      `}
                    >
                      <BarChart3
                        size={17}
                        className={
                          blueText
                        }
                      />

                      Top Viewed
                    </h2>

                    <p
                      className={`
                        mt-1
                        text-xs
                        ${mutedText}
                      `}
                    >
                      Top 5 published
                      posts by views.
                    </p>
                  </div>
                </div>

                <div className="grid gap-0 divide-y divide-transparent sm:grid-cols-2 lg:grid-cols-5">
                  {stats.topViewed.map(
                    (
                      blog,
                      index
                    ) => (
                      <Link
                        key={
                          blog._id ||
                          blog.slug
                        }
                        to={`/blog/${blog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                          group
                          flex
                          items-center
                          gap-3
                          p-4
                          transition
                          ${
                            isDark
                              ? "hover:bg-[#101924]"
                              : "hover:bg-[#F8FBFD]"
                          }
                        `}
                      >
                        <div
                          className={`
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            text-xs
                            font-black
                            ${
                              index ===
                              0
                                ? isDark
                                  ? "bg-amber-950/30 text-amber-300"
                                  : "bg-amber-50 text-amber-700"
                                : cardBg
                            }
                          `}
                        >
                          #
                          {index +
                            1}
                        </div>

                        <div className="min-w-0">
                          <p
                            className={`
                              truncate
                              text-xs
                              font-bold
                              ${primaryText}
                            `}
                          >
                            {
                              blog.title
                            }
                          </p>

                          <p
                            className={`
                              mt-1
                              flex
                              items-center
                              gap-1
                              text-[11px]
                              ${mutedText}
                            `}
                          >
                            <Eye
                              size={
                                11
                              }
                            />

                            {formatViews(
                              blog.views
                            )}
                          </p>
                        </div>
                      </Link>
                    )
                  )}
                </div>
              </div>
            </section>
          )}

          {/* =========================================================== */}
          {/* MANAGEMENT AREA */}
          {/* =========================================================== */}

          <section className="mt-8">
            <div
              className={`
                overflow-hidden
                rounded-3xl
                border
                ${borderColor}
                ${primaryBg}
              `}
            >
              {/* TABS */}

              <div
                className={`
                  flex
                  flex-col
                  gap-4
                  border-b
                  p-4
                  sm:p-5
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                  ${borderColor}
                `}
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleTabChange(
                        "active"
                      )
                    }
                    className={`
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      px-4
                      py-2.5
                      text-sm
                      font-bold
                      transition
                      ${
                        activeTab ===
                        "active"
                          ? isDark
                            ? "bg-white text-[#0B1524]"
                            : "bg-[#0B1524] text-white"
                          : isDark
                          ? "bg-[#101924] text-[#9AA9BA]"
                          : "bg-[#F5F9FC] text-[#5B6B82]"
                      }
                    `}
                  >
                    <BookOpen
                      size={15}
                    />

                    Active Blogs

                    <span
                      className={`
                        rounded-full
                        px-2
                        py-0.5
                        text-[10px]
                        ${
                          activeTab ===
                          "active"
                            ? "bg-white/15"
                            : ""
                        }
                      `}
                    >
                      {
                        stats.total
                      }
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleTabChange(
                        "trash"
                      )
                    }
                    className={`
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      px-4
                      py-2.5
                      text-sm
                      font-bold
                      transition
                      ${
                        activeTab ===
                        "trash"
                          ? "bg-red-600 text-white"
                          : isDark
                          ? "bg-[#101924] text-[#9AA9BA]"
                          : "bg-[#F5F9FC] text-[#5B6B82]"
                      }
                    `}
                  >
                    <Archive
                      size={15}
                    />

                    Trash

                    <span className="rounded-full px-2 py-0.5 text-[10px]">
                      {
                        stats.deleted
                      }
                    </span>
                  </button>
                </div>

                <p
                  className={`
                    text-xs
                    ${mutedText}
                  `}
                >
                  {
                    pagination.total
                  }{" "}
                  result
                  {pagination.total ===
                  1
                    ? ""
                    : "s"}
                </p>
              </div>

              {/* ======================================================= */}
              {/* FILTERS */}
              {/* ======================================================= */}

              <div
                className={`
                  border-b
                  p-4
                  sm:p-5
                  ${borderColor}
                  ${cardBg}
                `}
              >
                <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_180px]">
                  {/* SEARCH */}

                  <div className="relative">
                    <Search
                      size={17}
                      className={`
                        pointer-events-none
                        absolute
                        left-3.5
                        top-1/2
                        -translate-y-1/2
                        ${mutedText}
                      `}
                    />

                    <input
                      type="search"
                      value={
                        searchInput
                      }
                      onChange={(e) =>
                        setSearchInput(
                          e.target
                            .value
                        )
                      }
                      placeholder={
                        activeTab ===
                        "trash"
                          ? "Search deleted posts..."
                          : "Search title, slug, author, category or tags..."
                      }
                      className={`${inputClasses} pl-10 pr-10`}
                    />

                    {searchInput && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearchInput(
                            ""
                          )
                        }
                        className={`
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          ${mutedText}
                        `}
                      >
                        <X
                          size={15}
                        />
                      </button>
                    )}
                  </div>

                  {/* CATEGORY */}

                  {activeTab ===
                    "active" && (
                    <div className="relative">
                      <FolderOpen
                        size={16}
                        className={`
                          pointer-events-none
                          absolute
                          left-3.5
                          top-1/2
                          -translate-y-1/2
                          ${mutedText}
                        `}
                      />

                      <select
                        value={
                          categoryFilter
                        }
                        onChange={(e) => {
                          setCategoryFilter(
                            e.target
                              .value
                          );

                          setPage(1);
                        }}
                        className={`${inputClasses} appearance-none pl-10 pr-9`}
                      >
                        <option value="">
                          All Categories
                        </option>

                        {categories.map(
                          (
                            category
                          ) => (
                            <option
                              key={
                                category
                              }
                              value={
                                category
                              }
                            >
                              {
                                category
                              }
                            </option>
                          )
                        )}
                      </select>

                      <ChevronDown
                        size={15}
                        className={`
                          pointer-events-none
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          ${mutedText}
                        `}
                      />
                    </div>
                  )}

                  {/* SORT */}

                  {activeTab ===
                    "active" && (
                    <div className="relative">
                      <BarChart3
                        size={16}
                        className={`
                          pointer-events-none
                          absolute
                          left-3.5
                          top-1/2
                          -translate-y-1/2
                          ${mutedText}
                        `}
                      />

                      <select
                        value={
                          sortBy
                        }
                        onChange={(e) => {
                          setSortBy(
                            e.target
                              .value
                          );

                          setPage(1);
                        }}
                        className={`${inputClasses} appearance-none pl-10 pr-9`}
                      >
                        <option value="latest">
                          Latest Created
                        </option>

                        <option value="oldest">
                          Oldest Created
                        </option>

                        <option value="published">
                          Latest Published
                        </option>

                        <option value="views">
                          Most Viewed
                        </option>

                        <option value="title">
                          Title A-Z
                        </option>
                      </select>

                      <ChevronDown
                        size={15}
                        className={`
                          pointer-events-none
                          absolute
                          right-3
                          top-1/2
                          -translate-y-1/2
                          ${mutedText}
                        `}
                      />
                    </div>
                  )}
                </div>

                {/* SECOND ROW */}

                {activeTab ===
                  "active" && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter(
                          "all"
                        );

                        setPage(1);
                      }}
                      className={`
                        rounded-full
                        border
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        ${
                          statusFilter ===
                          "all"
                            ? "border-transparent bg-[#1D5C86] text-white"
                            : `${borderColor} ${primaryBg} ${secondaryText}`
                        }
                      `}
                    >
                      All Status
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter(
                          "published"
                        );

                        setPage(1);
                      }}
                      className={`
                        rounded-full
                        border
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        ${
                          statusFilter ===
                          "published"
                            ? "border-transparent bg-emerald-600 text-white"
                            : `${borderColor} ${primaryBg} ${secondaryText}`
                        }
                      `}
                    >
                      Published
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter(
                          "draft"
                        );

                        setPage(1);
                      }}
                      className={`
                        rounded-full
                        border
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        ${
                          statusFilter ===
                          "draft"
                            ? "border-transparent bg-amber-600 text-white"
                            : `${borderColor} ${primaryBg} ${secondaryText}`
                        }
                      `}
                    >
                      Draft
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFeaturedOnly(
                          (value) =>
                            !value
                        );

                        setPage(1);
                      }}
                      className={`
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        ${
                          featuredOnly
                            ? "border-transparent bg-blue-600 text-white"
                            : `${borderColor} ${primaryBg} ${secondaryText}`
                        }
                      `}
                    >
                      <Sparkles
                        size={12}
                      />

                      Featured
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditorOnly(
                          (value) =>
                            !value
                        );

                        setPage(1);
                      }}
                      className={`
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        ${
                          editorOnly
                            ? "border-transparent bg-violet-600 text-white"
                            : `${borderColor} ${primaryBg} ${secondaryText}`
                        }
                      `}
                    >
                      <Star
                        size={12}
                      />

                      Editor&apos;s
                      Choice
                    </button>

                    <button
                      type="button"
                      onClick={
                        resetFilters
                      }
                      className={`
                        ml-auto
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        transition
                        ${mutedText}
                      `}
                    >
                      <RotateCcw
                        size={12}
                      />

                      Reset
                    </button>
                  </div>
                )}
              </div>

              {/* ======================================================= */}
              {/* ERROR */}
              {/* ======================================================= */}

              {error && (
                <div className="p-5">
                  <div
                    className={`
                      rounded-2xl
                      border
                      p-4
                      ${
                        isDark
                          ? "border-red-900/40 bg-red-950/15 text-red-300"
                          : "border-red-200 bg-red-50 text-red-700"
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <ShieldAlert
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <div>
                        <p className="text-sm font-bold">
                          Unable to load
                          blogs
                        </p>

                        <p className="mt-1 text-xs leading-5">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* LOADING */}
              {/* ======================================================= */}

              {loadingBlogs ? (
                <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({
                    length: 6,
                  }).map(
                    (
                      _,
                      index
                    ) => (
                      <div
                        key={
                          index
                        }
                        className={`
                          h-72
                          animate-pulse
                          rounded-2xl
                          border
                          ${borderColor}
                          ${
                            isDark
                              ? "bg-[#101924]"
                              : "bg-slate-100"
                          }
                        `}
                      />
                    )
                  )}
                </div>
              ) : blogs.length ===
                0 ? (
                /* ===================================================== */
                /* EMPTY */
                /* ===================================================== */

                <div className="px-5 py-16 text-center">
                  <div
                    className={`
                      mx-auto
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      ${
                        isDark
                          ? "bg-[#101924] text-[#66B8EA]"
                          : "bg-[#EAF4FC] text-[#1D5C86]"
                      }
                    `}
                  >
                    {activeTab ===
                    "trash" ? (
                      <Archive
                        size={25}
                      />
                    ) : (
                      <BookOpen
                        size={25}
                      />
                    )}
                  </div>

                  <h3
                    className={`
                      mt-4
                      text-lg
                      font-black
                      ${primaryText}
                    `}
                  >
                    {activeTab ===
                    "trash"
                      ? "Trash is empty"
                      : "No blog posts found"}
                  </h3>

                  <p
                    className={`
                      mx-auto
                      mt-2
                      max-w-md
                      text-sm
                      leading-6
                      ${secondaryText}
                    `}
                  >
                    {activeTab ===
                    "trash"
                      ? "Deleted blogs will appear here and can be restored."
                      : "Try changing your search or filters, or create a new blog."}
                  </p>
                </div>
              ) : (
                /* ===================================================== */
                /* BLOG CARDS */
                /* ===================================================== */

                <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-3">
                  {blogs.map(
                    (blog) => {
                      const tags =
                        getTags(
                          blog
                        );

                      const busy =
                        actionLoading.includes(
                          String(
                            blog._id
                          )
                        );

                      return (
                        <article
                          key={
                            blog._id
                          }
                          className={`
                            group
                            flex
                            min-w-0
                            flex-col
                            overflow-hidden
                            rounded-2xl
                            border
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            ${borderColor}
                            ${
                              isDark
                                ? "bg-[#0C131D] hover:border-[#29415B]"
                                : "bg-white hover:border-[#BFDDF2] hover:shadow-md"
                            }
                          `}
                        >
                          {/* IMAGE */}

                          <div
                            className={`
                              relative
                              h-40
                              overflow-hidden
                              border-b
                              ${borderColor}
                              ${cardBg}
                            `}
                          >
                            {blog.imageUrl ? (
                              <img
                                src={
                                  blog.imageUrl
                                }
                                alt={
                                  blog.altText ||
                                  blog.title
                                }
                                loading="lazy"
                                className="
                                  h-full
                                  w-full
                                  object-cover
                                  transition-transform
                                  duration-500
                                  group-hover:scale-[1.03]
                                "
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <ImageIcon
                                  size={
                                    27
                                  }
                                  className={
                                    mutedText
                                  }
                                />
                              </div>
                            )}

                            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                              {activeTab ===
                              "trash" ? (
                                <StatusBadge
                                  type="deleted"
                                  isDark={
                                    isDark
                                  }
                                >
                                  Deleted
                                </StatusBadge>
                              ) : (
                                <>
                                  <StatusBadge
                                    type={
                                      blog.isPublished
                                        ? "published"
                                        : "draft"
                                    }
                                    isDark={
                                      isDark
                                    }
                                  >
                                    {blog.isPublished
                                      ? "Published"
                                      : "Draft"}
                                  </StatusBadge>

                                  {blog.isFeatured && (
                                    <StatusBadge
                                      type="featured"
                                      isDark={
                                        isDark
                                      }
                                    >
                                      Featured
                                    </StatusBadge>
                                  )}

                                  {blog.editorChoice && (
                                    <StatusBadge
                                      type="editor"
                                      isDark={
                                        isDark
                                      }
                                    >
                                      Editor
                                    </StatusBadge>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* CONTENT */}

                          <div className="flex flex-1 flex-col p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p
                                  className={`
                                    flex
                                    items-center
                                    gap-1.5
                                    text-[10px]
                                    font-bold
                                    uppercase
                                    tracking-[0.14em]
                                    ${blueText}
                                  `}
                                >
                                  <FolderOpen
                                    size={
                                      11
                                    }
                                  />

                                  {blog.category ||
                                    "Uncategorized"}
                                </p>

                                <h3
                                  className={`
                                    mt-2
                                    line-clamp-2
                                    text-base
                                    font-black
                                    leading-6
                                    ${primaryText}
                                  `}
                                >
                                  {blog.title ||
                                    "Untitled Blog"}
                                </h3>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  openDetails(
                                    blog
                                  )
                                }
                                className={`
                                  flex
                                  h-9
                                  w-9
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-xl
                                  border
                                  transition
                                  ${borderColor}
                                  ${
                                    isDark
                                      ? "bg-[#101924] text-[#9AA9BA] hover:text-white"
                                      : "bg-[#F8FBFD] text-[#5B6B82] hover:text-[#1D5C86]"
                                  }
                                `}
                                title="View all details"
                              >
                                <Info
                                  size={
                                    16
                                  }
                                />
                              </button>
                            </div>

                            <p
                              className={`
                                mt-3
                                line-clamp-3
                                text-xs
                                leading-5
                                ${secondaryText}
                              `}
                            >
                              {truncateText(
                                blog.excerpt,
                                155
                              ) ||
                                "No excerpt available."}
                            </p>

                            {/* TAGS */}

                            {tags.length >
                              0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {tags
                                  .slice(
                                    0,
                                    3
                                  )
                                  .map(
                                    (
                                      tag
                                    ) => (
                                      <span
                                        key={
                                          tag
                                        }
                                        className={`
                                          rounded-full
                                          px-2
                                          py-1
                                          text-[10px]
                                          font-semibold
                                          ${cardBg}
                                          ${mutedText}
                                        `}
                                      >
                                        #
                                        {
                                          tag
                                        }
                                      </span>
                                    )
                                  )}

                                {tags.length >
                                  3 && (
                                  <span
                                    className={`
                                      rounded-full
                                      px-2
                                      py-1
                                      text-[10px]
                                      ${mutedText}
                                    `}
                                  >
                                    +
                                    {tags.length -
                                      3}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* STATS */}

                            <div
                              className={`
                                mt-4
                                grid
                                grid-cols-3
                                gap-2
                                rounded-xl
                                p-3
                                ${cardBg}
                              `}
                            >
                              <div>
                                <p
                                  className={`
                                    flex
                                    items-center
                                    gap-1
                                    text-[10px]
                                    ${mutedText}
                                  `}
                                >
                                  <Eye
                                    size={
                                      11
                                    }
                                  />

                                  Views
                                </p>

                                <p
                                  className={`
                                    mt-1
                                    text-xs
                                    font-bold
                                    ${primaryText}
                                  `}
                                >
                                  {formatViews(
                                    blog.views
                                  )}
                                </p>
                              </div>

                              <div>
                                <p
                                  className={`
                                    flex
                                    items-center
                                    gap-1
                                    text-[10px]
                                    ${mutedText}
                                  `}
                                >
                                  <Clock3
                                    size={
                                      11
                                    }
                                  />

                                  Read
                                </p>

                                <p
                                  className={`
                                    mt-1
                                    text-xs
                                    font-bold
                                    ${primaryText}
                                  `}
                                >
                                  {safeNumber(
                                    blog.readingTimeMinutes
                                  ) ||
                                    "—"}{" "}
                                  min
                                </p>
                              </div>

                              <div>
                                <p
                                  className={`
                                    flex
                                    items-center
                                    gap-1
                                    text-[10px]
                                    ${mutedText}
                                  `}
                                >
                                  <User
                                    size={
                                      11
                                    }
                                  />

                                  Author
                                </p>

                                <p
                                  className={`
                                    mt-1
                                    truncate
                                    text-xs
                                    font-bold
                                    ${primaryText}
                                  `}
                                >
                                  {blog.author ||
                                    "—"}
                                </p>
                              </div>
                            </div>

                            {/* DATES */}

                            <div
                              className={`
                                mt-4
                                space-y-1.5
                                border-t
                                pt-3
                                text-[11px]
                                ${borderColor}
                                ${mutedText}
                              `}
                            >
                              {activeTab ===
                              "trash" ? (
                                <>
                                  <div className="flex items-center justify-between gap-3">
                                    <span>
                                      Deleted
                                    </span>

                                    <span className="text-right">
                                      {formatDateTime(
                                        blog.deletedAt
                                      )}
                                    </span>
                                  </div>

                                  {blog.deletedBy && (
                                    <div className="flex items-center justify-between gap-3">
                                      <span>
                                        Deleted
                                        by
                                      </span>

                                      <span className="max-w-[170px] truncate text-right">
                                        {
                                          blog.deletedBy
                                        }
                                      </span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center justify-between gap-3">
                                    <span>
                                      Created
                                    </span>

                                    <span>
                                      {formatDate(
                                        blog.createdAt
                                      )}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between gap-3">
                                    <span>
                                      Updated
                                    </span>

                                    <span>
                                      {formatDate(
                                        blog.updatedAt
                                      )}
                                    </span>
                                  </div>

                                  {blog.publishedAt && (
                                    <div className="flex items-center justify-between gap-3">
                                      <span>
                                        Published
                                      </span>

                                      <span>
                                        {formatDate(
                                          blog.publishedAt
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            {/* ACTIONS */}

                            <div className="mt-auto pt-4">
                              {activeTab ===
                              "active" ? (
                                <>
                                  <div className="grid grid-cols-2 gap-2">
                                    {/* PUBLISH */}

                                    <button
                                      type="button"
                                      disabled={
                                        busy
                                      }
                                      onClick={() =>
                                        changePublishStatus(
                                          blog
                                        )
                                      }
                                      className={`
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-1.5
                                        rounded-xl
                                        border
                                        px-3
                                        py-2
                                        text-[11px]
                                        font-bold
                                        transition
                                        disabled:opacity-50
                                        ${borderColor}
                                        ${
                                          blog.isPublished
                                            ? isDark
                                              ? "bg-yellow-950/20 text-yellow-300"
                                              : "bg-yellow-50 text-yellow-700"
                                            : isDark
                                            ? "bg-emerald-950/20 text-emerald-300"
                                            : "bg-emerald-50 text-emerald-700"
                                        }
                                      `}
                                    >
                                      {actionLoading ===
                                      `status-${blog._id}` ? (
                                        <Loader2
                                          size={
                                            13
                                          }
                                          className="animate-spin"
                                        />
                                      ) : blog.isPublished ? (
                                        <EyeOff
                                          size={
                                            13
                                          }
                                        />
                                      ) : (
                                        <Eye
                                          size={
                                            13
                                          }
                                        />
                                      )}

                                      {blog.isPublished
                                        ? "Unpublish"
                                        : "Publish"}
                                    </button>

                                    {/* VIEW */}

                                    {blog.isPublished ? (
                                      <Link
                                        to={`/blog/${blog.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`
                                          inline-flex
                                          items-center
                                          justify-center
                                          gap-1.5
                                          rounded-xl
                                          border
                                          px-3
                                          py-2
                                          text-[11px]
                                          font-bold
                                          ${borderColor}
                                          ${primaryBg}
                                          ${blueText}
                                        `}
                                      >
                                        <ExternalLink
                                          size={
                                            13
                                          }
                                        />

                                        Public
                                      </Link>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          openDetails(
                                            blog
                                          )
                                        }
                                        className={`
                                          inline-flex
                                          items-center
                                          justify-center
                                          gap-1.5
                                          rounded-xl
                                          border
                                          px-3
                                          py-2
                                          text-[11px]
                                          font-bold
                                          ${borderColor}
                                          ${primaryBg}
                                          ${secondaryText}
                                        `}
                                      >
                                        <Info
                                          size={
                                            13
                                          }
                                        />

                                        Details
                                      </button>
                                    )}
                                  </div>

                                  <div className="mt-2 grid grid-cols-3 gap-2">
                                    {/* FEATURED */}

                                    <button
                                      type="button"
                                      disabled={
                                        busy
                                      }
                                      onClick={() =>
                                        changeFeatured(
                                          blog
                                        )
                                      }
                                      title="Toggle featured"
                                      className={`
                                        flex
                                        items-center
                                        justify-center
                                        rounded-xl
                                        border
                                        py-2
                                        transition
                                        disabled:opacity-50
                                        ${borderColor}
                                        ${
                                          blog.isFeatured
                                            ? "bg-blue-600 text-white"
                                            : `${primaryBg} ${mutedText}`
                                        }
                                      `}
                                    >
                                      {actionLoading ===
                                      `featured-${blog._id}` ? (
                                        <Loader2
                                          size={
                                            14
                                          }
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Sparkles
                                          size={
                                            14
                                          }
                                        />
                                      )}
                                    </button>

                                    {/* EDITOR */}

                                    <button
                                      type="button"
                                      disabled={
                                        busy
                                      }
                                      onClick={() =>
                                        changeEditorChoice(
                                          blog
                                        )
                                      }
                                      title="Toggle Editor's Choice"
                                      className={`
                                        flex
                                        items-center
                                        justify-center
                                        rounded-xl
                                        border
                                        py-2
                                        transition
                                        disabled:opacity-50
                                        ${borderColor}
                                        ${
                                          blog.editorChoice
                                            ? "bg-violet-600 text-white"
                                            : `${primaryBg} ${mutedText}`
                                        }
                                      `}
                                    >
                                      {actionLoading ===
                                      `editor-${blog._id}` ? (
                                        <Loader2
                                          size={
                                            14
                                          }
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Star
                                          size={
                                            14
                                          }
                                        />
                                      )}
                                    </button>

                                    {/* DELETE */}

                                    <button
                                      type="button"
                                      disabled={
                                        busy
                                      }
                                      onClick={() =>
                                        setSoftDeleteTarget(
                                          blog
                                        )
                                      }
                                      title="Move to trash"
                                      className={`
                                        flex
                                        items-center
                                        justify-center
                                        rounded-xl
                                        border
                                        py-2
                                        transition
                                        disabled:opacity-50
                                        ${
                                          isDark
                                            ? "border-red-900/40 bg-red-950/15 text-red-300"
                                            : "border-red-200 bg-red-50 text-red-600"
                                        }
                                      `}
                                    >
                                      <Trash2
                                        size={
                                          14
                                        }
                                      />
                                    </button>
                                  </div>
                                </>
                              ) : (
                                /* ================================================= */
                                /* TRASH ACTIONS */
                                /* ================================================= */

                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    disabled={
                                      busy
                                    }
                                    onClick={() =>
                                      setRestoreTarget(
                                        blog
                                      )
                                    }
                                    className={`
                                      inline-flex
                                      items-center
                                      justify-center
                                      gap-1.5
                                      rounded-xl
                                      border
                                      px-3
                                      py-2.5
                                      text-xs
                                      font-bold
                                      ${borderColor}
                                      ${
                                        isDark
                                          ? "bg-blue-950/20 text-blue-300"
                                          : "bg-blue-50 text-blue-700"
                                      }
                                    `}
                                  >
                                    <ArchiveRestore
                                      size={
                                        14
                                      }
                                    />

                                    Restore
                                  </button>

                                  {canHardDelete ? (
                                    <button
                                      type="button"
                                      disabled={
                                        busy
                                      }
                                      onClick={() =>
                                        setHardDeleteTarget(
                                          blog
                                        )
                                      }
                                      className={`
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-1.5
                                        rounded-xl
                                        border
                                        px-3
                                        py-2.5
                                        text-xs
                                        font-bold
                                        ${
                                          isDark
                                            ? "border-red-900/40 bg-red-950/20 text-red-300"
                                            : "border-red-200 bg-red-50 text-red-600"
                                        }
                                      `}
                                    >
                                      <Trash2
                                        size={
                                          14
                                        }
                                      />

                                      Delete
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openDetails(
                                          blog
                                        )
                                      }
                                      className={`
                                        rounded-xl
                                        border
                                        px-3
                                        py-2.5
                                        text-xs
                                        font-bold
                                        ${borderColor}
                                        ${primaryBg}
                                        ${secondaryText}
                                      `}
                                    >
                                      Details
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              )}

              {/* PAGINATION */}

              {!loadingBlogs &&
                blogs.length >
                  0 && (
                  <div
                    className={`
                      border-t
                      px-4
                      pb-5
                      sm:px-5
                      ${borderColor}
                    `}
                  >
                    <Pagination
                      pagination={
                        pagination
                      }
                      onPageChange={
                        setPage
                      }
                      isDark={
                        isDark
                      }
                    />
                  </div>
                )}
            </div>
          </section>
        </div>

        {/* ============================================================= */}
        {/* DETAILS */}
        {/* ============================================================= */}

        <BlogDetailsModal
          open={
            detailsOpen
          }
          blog={
            selectedBlog
          }
          loading={
            detailsLoading
          }
          onClose={() => {
            setDetailsOpen(
              false
            );

            setSelectedBlog(
              null
            );
          }}
          isDark={
            isDark
          }
        />

        {/* ============================================================= */}
        {/* SOFT DELETE */}
        {/* ============================================================= */}

        <ConfirmationModal
          open={
            Boolean(
              softDeleteTarget
            )
          }
          onClose={() =>
            setSoftDeleteTarget(
              null
            )
          }
          onConfirm={
            softDeleteBlog
          }
          loading={
            actionLoading ===
            `delete-${softDeleteTarget?._id}`
          }
          title="Move blog to trash?"
          message={
            softDeleteTarget
              ? `"${softDeleteTarget.title}" will be removed from the active blog list and moved to Trash. You can restore it later. The Cloudinary image is not permanently deleted at this stage.`
              : ""
          }
          confirmText="Move to Trash"
          destructive
          isDark={
            isDark
          }
        />

        {/* ============================================================= */}
        {/* RESTORE */}
        {/* ============================================================= */}

        <ConfirmationModal
          open={
            Boolean(
              restoreTarget
            )
          }
          onClose={() =>
            setRestoreTarget(
              null
            )
          }
          onConfirm={
            restoreBlog
          }
          loading={
            actionLoading ===
            `restore-${restoreTarget?._id}`
          }
          title="Restore blog?"
          message={
            restoreTarget
              ? `"${restoreTarget.title}" will be moved out of Trash and returned to the active blog collection.`
              : ""
          }
          confirmText="Restore Blog"
          destructive={
            false
          }
          isDark={
            isDark
          }
        />

        {/* ============================================================= */}
        {/* PERMANENT DELETE */}
        {/* ============================================================= */}

        <ConfirmationModal
          open={
            Boolean(
              hardDeleteTarget
            )
          }
          onClose={() =>
            setHardDeleteTarget(
              null
            )
          }
          onConfirm={
            hardDeleteBlog
          }
          loading={
            actionLoading ===
            `hard-${hardDeleteTarget?._id}`
          }
          title="Permanently delete blog?"
          message={
            hardDeleteTarget
              ? `"${hardDeleteTarget.title}" will be permanently removed from MongoDB. Its Cloudinary image will also be deleted. This action cannot be undone.`
              : ""
          }
          confirmText="Delete Permanently"
          destructive
          isDark={
            isDark
          }
        />
      </main>
    );
  };

export default AdminBlogManagementPage;