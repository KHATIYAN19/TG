import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Eye,
  FileText,
  Filter,
  Layers3,
  Package,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  X,
  XCircle,
} from "lucide-react";

import BASE_URL from "../utils/Url";

/* =========================================================
   HELPERS
========================================================= */

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

  return map[type] || type || "Unknown";
}

function formatDate(date) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDiscount(book) {
  const price = Number(book?.price);
  const mrp = Number(book?.mrp);

  if (
    !Number.isFinite(price) ||
    !Number.isFinite(mrp) ||
    mrp <= 0 ||
    price >= mrp
  ) {
    return 0;
  }

  return Math.round(((mrp - price) / mrp) * 100);
}

/* =========================================================
   SELECT
========================================================= */

function SelectField({
  value,
  onChange,
  options,
  placeholder,
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="
          h-11
          min-w-[145px]
          appearance-none
          rounded-xl
          border
          border-slate-200
          bg-white
          pl-4
          pr-10
          text-sm
          font-semibold
          text-slate-700
          outline-none
          transition
          hover:border-slate-300
          focus:border-blue-400
          focus:ring-4
          focus:ring-blue-100
        "
      >
        <option value="">{placeholder}</option>

        {options.map((option) => {
          const optionValue = option.value ?? option;
          const optionLabel = option.label ?? option;

          return (
            <option
              key={optionValue}
              value={optionValue}
            >
              {optionLabel}
            </option>
          );
        })}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  active,
  activeText,
  inactiveText,
}) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
      <CheckCircle2 className="h-3 w-3" />
      {activeText}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
      <XCircle className="h-3 w-3" />
      {inactiveText}
    </span>
  );
}

/* =========================================================
   STATS CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
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
   BOOK COVER
========================================================= */

function AdminBookCover({ book }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [book?.coverPageUrl]);

  return (
    <div className="h-[150px] w-[105px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm sm:h-[170px] sm:w-[120px]">
      {book?.coverPageUrl && !imageError ? (
        <img
          src={book.coverPageUrl}
          alt={`${book?.title || "Book"} cover`}
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="flex h-full flex-col justify-between bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-3 text-white">
          <BookOpen className="h-5 w-5 text-blue-200" />

          <p className="line-clamp-4 text-xs font-bold leading-4">
            {book?.title || "Digital Product"}
          </p>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   ADMIN BOOK CARD
========================================================= */

function AdminBookCard({
  book,
  onOpen,
}) {
  const discount = getDiscount(book);

  const firstTag =
    Array.isArray(book?.tags) && book.tags.length > 0
      ? book.tags[0]
      : null;

  const firstTopic =
    Array.isArray(book?.topics) && book.topics.length > 0
      ? book.topics[0]
      : null;

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(book);
    }
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => onOpen(book)}
      onKeyDown={handleKeyDown}
      className="
        group
        cursor-pointer
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
        outline-none
        transition
        duration-300
        hover:-translate-y-0.5
        hover:border-blue-200
        hover:shadow-[0_15px_35px_rgba(15,23,42,0.08)]
        focus-visible:ring-4
        focus-visible:ring-blue-100
      "
    >
      <div className="flex gap-4">
        <AdminBookCover book={book} />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Status */}

          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge
              active={book?.isPublished}
              activeText="Published"
              inactiveText="Draft"
            />

            <StatusBadge
              active={book?.isActive}
              activeText="Active"
              inactiveText="Inactive"
            />

            {book?.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                <Sparkles className="h-3 w-3" />
                Featured
              </span>
            )}
          </div>

          {/* Title */}

          <h2 className="mt-3 line-clamp-2 text-lg font-extrabold leading-6 text-slate-950 transition group-hover:text-blue-700">
            {book?.title || "Untitled Product"}
          </h2>

          {book?.subtitle && (
            <p className="mt-1 line-clamp-1 text-xs text-slate-500">
              {book.subtitle}
            </p>
          )}

          {/* Product metadata */}

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
              {formatResourceType(book?.resourceType)}
            </span>

            {book?.category && (
              <span className="rounded-md bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700">
                {book.category}
              </span>
            )}

            {firstTag && (
              <span className="rounded-md bg-cyan-50 px-2 py-1 text-[10px] font-bold text-cyan-700">
                {firstTag}
              </span>
            )}

            {firstTopic && (
              <span className="rounded-md bg-orange-50 px-2 py-1 text-[10px] font-bold text-orange-700">
                {firstTopic}
              </span>
            )}

            {book?.badge && (
              <span className="rounded-md bg-pink-50 px-2 py-1 text-[10px] font-bold text-pink-700">
                {book.badge}
              </span>
            )}
          </div>

          {/* Price */}

          <div className="mt-auto pt-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl font-extrabold text-slate-950">
                    {money(book?.price, book?.currency)}
                  </span>

                  {Number(book?.mrp) > Number(book?.price) && (
                    <span className="text-xs text-slate-400 line-through">
                      {money(book?.mrp, book?.currency)}
                    </span>
                  )}

                  {discount > 0 && (
                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">
                      {discount}% OFF
                    </span>
                  )}
                </div>

                <p className="mt-1 text-[10px] text-slate-400">
                  Updated {formatDate(book?.updatedAt)}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white transition group-hover:bg-blue-600">
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom admin metadata */}

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-[10px] sm:grid-cols-3">
        <div className="min-w-0">
          <p className="text-slate-400">
            Page Key
          </p>

          <p className="mt-0.5 truncate font-semibold text-slate-700">
            {book?.pageKey || "—"}
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-slate-400">
            Redirect
          </p>

          <p className="mt-0.5 truncate font-semibold text-slate-700">
            {book?.redirectUrl || "—"}
          </p>
        </div>

        <div className="hidden min-w-0 sm:block">
          <p className="text-slate-400">
            Book ID
          </p>

          <p className="mt-0.5 truncate font-mono font-semibold text-slate-700">
            {book?._id || "—"}
          </p>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function BookSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex gap-4">
        <div className="h-[170px] w-[120px] shrink-0 rounded-xl bg-slate-100" />

        <div className="flex flex-1 flex-col">
          <div className="flex gap-2">
            <div className="h-5 w-20 rounded-full bg-slate-100" />
            <div className="h-5 w-16 rounded-full bg-slate-100" />
          </div>

          <div className="mt-4 h-6 w-4/5 rounded bg-slate-100" />

          <div className="mt-2 h-3 w-1/2 rounded bg-slate-50" />

          <div className="mt-4 flex gap-2">
            <div className="h-5 w-16 rounded bg-slate-100" />
            <div className="h-5 w-20 rounded bg-slate-100" />
          </div>

          <div className="flex-1" />

          <div className="h-7 w-28 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminBooks() {
  const navigate = useNavigate();

  const token = useSelector(
    (state) => state.auth.token
  );

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [publishStatus, setPublishStatus] = useState("");
  const [activeStatus, setActiveStatus] = useState("");
  const [sort, setSort] = useState("newest");

  /* =======================================================
     API
  ======================================================= */

  const fetchBooks = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError("");

        if (!token) {
          throw new Error(
            "Authentication token is missing. Please login again."
          );
        }

        const response = await fetch(
          `${BASE_URL}/book/admin/all`,
          {
            method: "GET",

            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },

            signal,
          }
        );

        let result;

        try {
          result = await response.json();
        } catch {
          throw new Error(
            "Invalid response received from the server."
          );
        }

        if (!response.ok) {
          throw new Error(
            result?.error?.message ||
              result?.error ||
              result?.message ||
              "Unable to load admin products."
          );
        }

        if (result?.success !== true) {
          throw new Error(
            result?.error?.message ||
              result?.error ||
              result?.message ||
              "Unable to load admin products."
          );
        }

        setBooks(
          Array.isArray(result?.data)
            ? result.data
            : []
        );
      } catch (err) {
        if (err?.name === "AbortError") {
          return;
        }

        console.error(
          "Admin books fetch error:",
          err
        );

        setBooks([]);

        setError(
          err?.message ||
            "Something went wrong while loading products."
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [token]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchBooks(controller.signal);

    return () => controller.abort();
  }, [fetchBooks]);

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = useMemo(() => {
    return [
      ...new Set(
        books
          .map((book) => book?.category?.trim())
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [books]);

  /* =======================================================
     RESOURCE TYPES
  ======================================================= */

  const resourceTypes = useMemo(() => {
    return [
      ...new Set(
        books
          .map((book) => book?.resourceType)
          .filter(Boolean)
      ),
    ].sort();
  }, [books]);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    return {
      total: books.length,

      published: books.filter(
        (book) => book?.isPublished === true
      ).length,

      drafts: books.filter(
        (book) => book?.isPublished !== true
      ).length,

      active: books.filter(
        (book) => book?.isActive === true
      ).length,
    };
  }, [books]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = books.filter((book) => {
      const tags = Array.isArray(book?.tags)
        ? book.tags.join(" ")
        : "";

      const topics = Array.isArray(book?.topics)
        ? book.topics.join(" ")
        : "";

      const highlights = Array.isArray(book?.highlights)
        ? book.highlights.join(" ")
        : "";

      const searchable = [
        book?._id,
        book?.title,
        book?.slug,
        book?.subtitle,
        book?.description,
        book?.resourceType,
        book?.category,
        book?.badge,
        book?.pageKey,
        book?.redirectUrl,
        book?.paymentUrl,
        book?.fileName,
        book?.createdBy,
        book?.updatedBy,
        tags,
        topics,
        highlights,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchable.includes(query);

      const matchesCategory =
        !category ||
        book?.category === category;

      const matchesResourceType =
        !resourceType ||
        book?.resourceType === resourceType;

      let matchesPublish = true;

      if (publishStatus === "published") {
        matchesPublish =
          book?.isPublished === true;
      }

      if (publishStatus === "draft") {
        matchesPublish =
          book?.isPublished !== true;
      }

      let matchesActive = true;

      if (activeStatus === "active") {
        matchesActive =
          book?.isActive === true;
      }

      if (activeStatus === "inactive") {
        matchesActive =
          book?.isActive !== true;
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesResourceType &&
        matchesPublish &&
        matchesActive
      );
    });

    return [...result].sort((a, b) => {
      if (sort === "newest") {
        return (
          new Date(b?.createdAt || 0) -
          new Date(a?.createdAt || 0)
        );
      }

      if (sort === "oldest") {
        return (
          new Date(a?.createdAt || 0) -
          new Date(b?.createdAt || 0)
        );
      }

      if (sort === "updated") {
        return (
          new Date(b?.updatedAt || 0) -
          new Date(a?.updatedAt || 0)
        );
      }

      if (sort === "price-low") {
        return (
          Number(a?.price || 0) -
          Number(b?.price || 0)
        );
      }

      if (sort === "price-high") {
        return (
          Number(b?.price || 0) -
          Number(a?.price || 0)
        );
      }

      if (sort === "title") {
        return String(a?.title || "").localeCompare(
          String(b?.title || "")
        );
      }

      return 0;
    });
  }, [
    books,
    search,
    category,
    resourceType,
    publishStatus,
    activeStatus,
    sort,
  ]);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const openBook = (book) => {
    if (!book?._id) {
      console.error(
        "Book ID is missing:",
        book
      );

      return;
    }

    navigate(
      `/admin/book/${encodeURIComponent(book._id)}`
    );
  };

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setResourceType("");
    setPublishStatus("");
    setActiveStatus("");
    setSort("newest");
  };

  const hasFilters =
    Boolean(search) ||
    Boolean(category) ||
    Boolean(resourceType) ||
    Boolean(publishStatus) ||
    Boolean(activeStatus) ||
    sort !== "newest";

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <Helmet>
        <title>
          Manage Books | Target Trek Admin
        </title>
      </Helmet>

      <main className="min-h-screen bg-slate-50 pt-24 text-slate-900 sm:pt-28">
        <div className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-6 lg:px-8">
          {/* ===============================================
              HEADER
          =============================================== */}

          <div className="flex flex-col gap-5 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                <BookOpen className="h-3.5 w-3.5" />

                Admin Library
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Manage Books
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                View and manage all digital products,
                including published, draft, active and
                inactive resources.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/book/create")
              }
              className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 lg:self-auto"
            >
              <BookOpen className="h-4 w-4" />

              Add New Book
            </button>
          </div>

          {/* ===============================================
              STATS
          =============================================== */}

          {!loading && !error && (
            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={
                  <Package className="h-5 w-5" />
                }
                label="Total Books"
                value={stats.total}
                description="All resources"
              />

              <StatCard
                icon={
                  <CheckCircle2 className="h-5 w-5" />
                }
                label="Published"
                value={stats.published}
                description="Visible products"
              />

              <StatCard
                icon={
                  <FileText className="h-5 w-5" />
                }
                label="Drafts"
                value={stats.drafts}
                description="Not published"
              />

              <StatCard
                icon={
                  <Eye className="h-5 w-5" />
                }
                label="Active"
                value={stats.active}
                description="Currently enabled"
              />
            </div>
          )}

          {/* ===============================================
              FILTERS
          =============================================== */}

          {!loading &&
            !error &&
            books.length > 0 && (
              <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                  {/* Search */}

                  <div className="relative min-w-[250px] flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search title, ID, slug, tag, page key..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearch("")
                        }
                        className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full hover:bg-slate-100"
                      >
                        <X className="h-4 w-4 text-slate-500" />
                      </button>
                    )}
                  </div>

                  {/* Filter fields */}

                  <div className="flex flex-wrap gap-2">
                    {categories.length > 0 && (
                      <SelectField
                        value={category}
                        onChange={setCategory}
                        options={categories}
                        placeholder="Category"
                      />
                    )}

                    {resourceTypes.length > 0 && (
                      <SelectField
                        value={resourceType}
                        onChange={setResourceType}
                        options={resourceTypes.map(
                          (type) => ({
                            value: type,
                            label:
                              formatResourceType(type),
                          })
                        )}
                        placeholder="Type"
                      />
                    )}

                    <SelectField
                      value={publishStatus}
                      onChange={setPublishStatus}
                      options={[
                        {
                          value: "published",
                          label: "Published",
                        },
                        {
                          value: "draft",
                          label: "Draft",
                        },
                      ]}
                      placeholder="Publish Status"
                    />

                    <SelectField
                      value={activeStatus}
                      onChange={setActiveStatus}
                      options={[
                        {
                          value: "active",
                          label: "Active",
                        },
                        {
                          value: "inactive",
                          label: "Inactive",
                        },
                      ]}
                      placeholder="Active Status"
                    />

                    <SelectField
                      value={sort}
                      onChange={setSort}
                      options={[
                        {
                          value: "newest",
                          label: "Newest",
                        },
                        {
                          value: "updated",
                          label: "Recently Updated",
                        },
                        {
                          value: "oldest",
                          label: "Oldest",
                        },
                        {
                          value: "price-low",
                          label: "Price: Low to High",
                        },
                        {
                          value: "price-high",
                          label: "Price: High to Low",
                        },
                        {
                          value: "title",
                          label: "Title: A-Z",
                        },
                      ]}
                      placeholder="Sort"
                    />
                  </div>
                </div>

                {/* Filter bottom */}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Filter className="h-3.5 w-3.5" />

                    Showing{" "}

                    <strong className="text-slate-900">
                      {filteredBooks.length}
                    </strong>

                    {" "}of{" "}

                    <strong className="text-slate-900">
                      {books.length}
                    </strong>

                    {" "}books
                  </div>

                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs font-bold text-blue-600 transition hover:text-blue-700"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            )}

          {/* ===============================================
              LOADING
          =============================================== */}

          {loading && (
            <div className="mt-7 grid grid-cols-1 gap-4 xl:grid-cols-2">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <BookSkeleton key={index} />
              ))}
            </div>
          )}

          {/* ===============================================
              ERROR
          =============================================== */}

          {!loading && error && (
            <div className="mt-7 rounded-2xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <AlertCircle className="h-7 w-7 text-red-500" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-950">
                Unable to load books
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />

                Try Again
              </button>
            </div>
          )}

          {/* ===============================================
              BOOKS
          =============================================== */}

          {!loading &&
            !error &&
            filteredBooks.length > 0 && (
              <div className="mt-7 grid grid-cols-1 gap-4 xl:grid-cols-2">
                {filteredBooks.map((book) => (
                  <AdminBookCard
                    key={
                      book?._id ||
                      book?.pageKey ||
                      book?.slug
                    }
                    book={book}
                    onOpen={openBook}
                  />
                ))}
              </div>
            )}

          {/* ===============================================
              EMPTY DATABASE
          =============================================== */}

          {!loading &&
            !error &&
            books.length === 0 && (
              <div className="mt-7 rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-slate-300" />

                <h2 className="mt-5 text-xl font-bold text-slate-950">
                  No books created yet
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Create your first digital product to
                  get started.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/book/create")
                  }
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Add New Book
                </button>
              </div>
            )}

          {/* ===============================================
              NO FILTER RESULTS
          =============================================== */}

          {!loading &&
            !error &&
            books.length > 0 &&
            filteredBooks.length === 0 && (
              <div className="mt-7 rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
                <Search className="mx-auto h-9 w-9 text-slate-300" />

                <h2 className="mt-5 text-xl font-bold text-slate-950">
                  No matching books
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            )}
        </div>
      </main>
    </>
  );
}