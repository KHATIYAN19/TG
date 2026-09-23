import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  ChevronDown,
  FileText,
  Filter,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import BASE_URL from "../utils/Url";

/* =========================================================
   HELPERS
========================================================= */

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname]);

  return null;
}

function money(value, currency = "INR") {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "";
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

function getSavings(book) {
  const price = Number(book?.price);
  const mrp = Number(book?.mrp);

  if (
    !Number.isFinite(price) ||
    !Number.isFinite(mrp) ||
    mrp <= price
  ) {
    return 0;
  }

  return mrp - price;
}

function formatResourceType(type) {
  const map = {
    pdf: "PDF",
    ebook: "Ebook",
    course: "Course",
    bundle: "Bundle",
    template: "Template",
    notes: "Notes",
    other: "Digital Product",
  };

  return map[type] || "Digital Product";
}

/* =========================================================
   TAG COLORS
========================================================= */

const TAG_STYLES = [
  "border-blue-200 bg-blue-50 text-blue-700",
  "border-violet-200 bg-violet-50 text-violet-700",
  "border-emerald-200 bg-emerald-50 text-emerald-700",
  "border-orange-200 bg-orange-50 text-orange-700",
  "border-pink-200 bg-pink-50 text-pink-700",
  "border-cyan-200 bg-cyan-50 text-cyan-700",
  "border-amber-200 bg-amber-50 text-amber-700",
  "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  "border-teal-200 bg-teal-50 text-teal-700",
];

function getTagStyle(tag = "") {
  let hash = 0;

  for (let i = 0; i < tag.length; i++) {
    hash =
      tag.charCodeAt(i) +
      ((hash << 5) - hash);
  }

  return TAG_STYLES[
    Math.abs(hash) % TAG_STYLES.length
  ];
}

/* =========================================================
   COVER
========================================================= */

function BookCover({ book }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [book?.coverPageUrl]);

  return (
    <div className="relative h-full w-full">
      {book?.coverPageUrl && !imageError ? (
        <img
          src={book.coverPageUrl}
          alt={`${book?.title || "Product"} cover`}
          loading="lazy"
          onError={() => setImageError(true)}
          className="
            h-full
            w-full
            object-cover
            transition
            duration-500
            group-hover:scale-[1.03]
          "
        />
      ) : (
        <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <BookOpen className="h-6 w-6 text-blue-200" />

            <span className="text-[8px] font-bold uppercase tracking-widest text-white/50">
              Target Trek
            </span>
          </div>

          <div>
            <div className="mb-3 h-1 w-9 rounded-full bg-blue-300" />

            <h3 className="line-clamp-4 text-sm font-bold leading-5 sm:text-base">
              {book?.title || "Digital Product"}
            </h3>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-white/5" />
    </div>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({ book, onOpen }) {
  const discount = getDiscount(book);
  const savings = getSavings(book);

  const firstTag =
    Array.isArray(book?.tags) && book.tags.length > 0
      ? book.tags[0]
      : null;

  const handleKeyboard = (event) => {
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
      onKeyDown={handleKeyboard}
      aria-label={`View ${book?.title || "product"}`}
      className="
        group
        relative
        flex
        min-h-[245px]
        cursor-pointer
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-[0_3px_12px_rgba(15,23,42,0.05)]
        outline-none
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-blue-200
        hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]
        focus-visible:ring-4
        focus-visible:ring-blue-100
      "
    >
      {/* =============================================
          LEFT - COVER
      ============================================= */}

      <div
        className="
          relative
          m-3
          w-[115px]
          shrink-0
          overflow-hidden
          rounded-xl
          border
          border-slate-200
          bg-slate-100
          shadow-sm

          sm:m-4
          sm:w-[135px]

          lg:w-[145px]
        "
      >
        <BookCover book={book} />
      </div>

      {/* =============================================
          RIGHT - DETAILS
      ============================================= */}

      <div className="flex min-w-0 flex-1 flex-col px-2 py-4 pr-4 sm:py-5 sm:pr-5">
        {/* Top badges */}

        <div className="mb-3 flex min-h-[25px] flex-wrap items-center gap-1.5">
          {firstTag && (
            <span
              title={firstTag}
              className={`
                max-w-[110px]
                truncate
                rounded-full
                border
                px-2.5
                py-1
                text-[9px]
                font-bold
                uppercase
                tracking-wide
                ${getTagStyle(firstTag)}
              `}
            >
              {firstTag}
            </span>
          )}

          {book?.category && (
            <span
              title={book.category}
              className="
                max-w-[110px]
                truncate
                rounded-full
                border
                border-violet-200
                bg-violet-50
                px-2.5
                py-1
                text-[9px]
                font-bold
                uppercase
                tracking-wide
                text-violet-700
              "
            >
              {book.category}
            </span>
          )}

          <span
            className="
              flex
              items-center
              gap-1
              rounded-full
              border
              border-emerald-200
              bg-emerald-50
              px-2.5
              py-1
              text-[9px]
              font-bold
              uppercase
              tracking-wide
              text-emerald-700
            "
          >
            <FileText className="h-2.5 w-2.5" />

            {formatResourceType(book?.resourceType)}
          </span>
        </div>

        {/* Featured + badge */}

        {(book?.isFeatured || book?.badge) && (
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {book?.isFeatured && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-blue-600">
                <Sparkles className="h-3 w-3" />
                Featured
              </span>
            )}

            {book?.badge && (
              <span className="text-[10px] font-semibold text-slate-400">
                {book.badge}
              </span>
            )}
          </div>
        )}

        {/* Title */}

        <h2
          className="
            line-clamp-2
            text-base
            font-extrabold
            leading-6
            tracking-tight
            text-slate-950
            transition-colors
            group-hover:text-blue-700

            sm:text-lg
          "
        >
          {book?.title || "Untitled Product"}
        </h2>

        {/* Subtitle */}

        {book?.subtitle && (
          <p
            className="
              mt-1.5
              line-clamp-2
              text-xs
              leading-5
              text-slate-500
              sm:text-[13px]
            "
          >
            {book.subtitle}
          </p>
        )}

        {/* Spacer */}

        <div className="flex-1" />

        {/* Price */}

        <div className="mt-4 border-t border-slate-100 pt-3">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Get it for
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-950">
                  {money(book?.price, book?.currency)}
                </span>

                {Number(book?.mrp) > Number(book?.price) && (
                  <span className="text-xs font-medium text-slate-400 line-through">
                    {money(book?.mrp, book?.currency)}
                  </span>
                )}
              </div>

              {(savings > 0 || discount > 0) && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {savings > 0 && (
                    <span className="text-[10px] font-bold text-emerald-600">
                      Save {money(savings, book?.currency)}
                    </span>
                  )}

                  {discount > 0 && (
                    <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                      {discount}% OFF
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Arrow */}

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-slate-950
                text-white
                transition-all
                duration-300
                group-hover:scale-105
                group-hover:bg-blue-600
              "
            >
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
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
   SKELETON
========================================================= */

function ProductSkeleton() {
  return (
    <div className="flex min-h-[245px] animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="m-3 w-[115px] shrink-0 rounded-xl bg-slate-100 sm:m-4 sm:w-[135px] lg:w-[145px]" />

      <div className="flex flex-1 flex-col py-5 pr-5">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full bg-slate-100" />
          <div className="h-5 w-20 rounded-full bg-slate-100" />
        </div>

        <div className="mt-5 h-5 w-full rounded bg-slate-100" />

        <div className="mt-2 h-5 w-4/5 rounded bg-slate-100" />

        <div className="mt-3 h-3 w-full rounded bg-slate-50" />

        <div className="mt-2 h-3 w-2/3 rounded bg-slate-50" />

        <div className="flex-1" />

        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="h-7 w-24 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   HERO STAT
========================================================= */

function HeroStat({ value, label }) {
  return (
    <div className="px-5 py-5 first:pl-0">
      <div className="text-3xl font-extrabold text-blue-600">
        {value}
      </div>

      <div className="mt-1 text-xs font-medium text-slate-500">
        {label}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function Books() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("");

  const [resourceType, setResourceType] = useState("");

  const [sort, setSort] = useState("");

  /* =======================================================
     FETCH BOOKS
  ======================================================= */

  const fetchBooks = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${BASE_URL}/book`, {
        method: "GET",

        headers: {
          Accept: "application/json",
        },

        signal,
      });

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
            result?.message ||
            "Unable to load products."
        );
      }

      if (result?.success !== true) {
        throw new Error(
          result?.error?.message ||
            result?.message ||
            "Unable to load products."
        );
      }

      const data = Array.isArray(result?.data)
        ? result.data
        : [];

      setBooks(data);
    } catch (err) {
      if (err?.name === "AbortError") {
        return;
      }

      console.error("Products fetch error:", err);

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
  }, []);

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
     FILTER + SORT
  ======================================================= */

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = books.filter((book) => {
      const tags = Array.isArray(book?.tags)
        ? book.tags.join(" ")
        : "";

      const searchable = [
        book?.title,
        book?.slug,
        book?.subtitle,
        book?.resourceType,
        book?.pageKey,
        book?.category,
        book?.badge,
        tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchable.includes(query);

      const matchesCategory =
        !category || book?.category === category;

      const matchesType =
        !resourceType ||
        book?.resourceType === resourceType;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType
      );
    });

    return [...result].sort((a, b) => {
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
    sort,
  ]);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const openBook = (book) => {
    const redirectUrl = book?.redirectUrl?.trim();

    if (!redirectUrl) {
      console.error(
        "Product redirectUrl is missing:",
        book
      );

      return;
    }

    /*
     * External URL
     */
    if (
      redirectUrl.startsWith("http://") ||
      redirectUrl.startsWith("https://")
    ) {
      window.location.href = redirectUrl;
      return;
    }

    /*
     * Internal React route
     */
    const normalizedPath = redirectUrl.startsWith("/")
      ? redirectUrl
      : `/${redirectUrl}`;

    navigate(normalizedPath);
  };

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setResourceType("");
    setSort("");
  };

  const hasFilters =
    Boolean(search) ||
    Boolean(category) ||
    Boolean(resourceType) ||
    Boolean(sort);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <Helmet>
        <title>
          Books & Digital Resources | Target Trek
        </title>

        <meta
          name="description"
          content="Explore ebooks, developer guides, courses, PDFs and practical learning resources from Target Trek."
        />
      </Helmet>

      <ScrollToTop />

      <main className="min-h-screen bg-slate-50 pt-24 text-slate-900 sm:pt-28">
        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "linear-gradient(rgba(37,99,235,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.035) 1px, transparent 1px)",

              backgroundSize: "40px 40px",
            }}
          />

          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                <BookOpen className="h-3.5 w-3.5" />

                Target Trek Library
              </div>

              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Learn from resources

                <span className="block text-blue-600">
                  built for practical growth.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
                Explore practical ebooks, developer guides,
                PDFs, courses and carefully created learning
                resources.
              </p>

              {!loading &&
                !error &&
                books.length > 0 && (
                  <div className="mt-8 grid max-w-md grid-cols-2 divide-x divide-slate-200 border-y border-slate-200">
                    <HeroStat
                      value={books.length}
                      label={
                        books.length === 1
                          ? "Product"
                          : "Products"
                      }
                    />

                    <HeroStat
                      value={categories.length}
                      label="Categories"
                    />
                  </div>
                )}
            </div>
          </div>
        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
          {/* ===============================================
              FILTER BAR
          =============================================== */}

          {!loading &&
            !error &&
            books.length > 0 && (
              <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  {/* Search */}

                  <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search books, tags, categories..."
                      className="
                        h-11
                        w-full
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        pl-11
                        pr-10
                        text-sm
                        text-slate-800
                        outline-none
                        transition
                        placeholder:text-slate-400
                        focus:border-blue-400
                        focus:bg-white
                        focus:ring-4
                        focus:ring-blue-100
                      "
                    />

                    {search && (
                      <button
                        type="button"
                        aria-label="Clear search"
                        onClick={() => setSearch("")}
                        className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full transition hover:bg-slate-100"
                      >
                        <X className="h-4 w-4 text-slate-500" />
                      </button>
                    )}
                  </div>

                  {/* Filters */}

                  <div className="flex flex-wrap gap-2">
                    {categories.length > 0 && (
                      <SelectField
                        value={category}
                        onChange={setCategory}
                        options={categories}
                        placeholder="All Categories"
                      />
                    )}

                    {resourceTypes.length > 0 && (
                      <SelectField
                        value={resourceType}
                        onChange={setResourceType}
                        options={resourceTypes.map((type) => ({
                          value: type,
                          label: formatResourceType(type),
                        }))}
                        placeholder="All Types"
                      />
                    )}

                    <SelectField
                      value={sort}
                      onChange={setSort}
                      options={[
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
                      placeholder="Sort By"
                    />
                  </div>
                </div>

                {/* Result count */}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Filter className="h-3.5 w-3.5" />

                    <span>
                      Showing{" "}
                      <strong className="text-slate-900">
                        {filteredBooks.length}
                      </strong>{" "}
                      of{" "}
                      <strong className="text-slate-900">
                        {books.length}
                      </strong>{" "}
                      products
                    </span>
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
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          )}

          {/* ===============================================
              ERROR
          =============================================== */}

          {!loading && error && (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>

              <h2 className="mt-6 text-2xl font-bold text-slate-950">
                Unable to load products
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-7 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ===============================================
              NO PRODUCTS
          =============================================== */}

          {!loading &&
            !error &&
            books.length === 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white px-6 py-24 text-center shadow-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
                  <BookOpen className="h-9 w-9 text-blue-600" />
                </div>

                <h2 className="mt-7 text-3xl font-bold text-slate-950">
                  New resources are coming soon
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
                  We're currently adding books and digital
                  learning resources to the library.
                </p>
              </div>
            )}

          {/* ===============================================
              PRODUCT GRID

              MOBILE  = 1 CARD
              DESKTOP = 2 CARDS
          =============================================== */}

          {!loading &&
            !error &&
            books.length > 0 &&
            filteredBooks.length > 0 && (
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {filteredBooks.map((book) => (
                  <ProductCard
                    key={
                      book._id ||
                      book.pageKey ||
                      book.slug
                    }
                    book={book}
                    onOpen={openBook}
                  />
                ))}
              </div>
            )}

          {/* ===============================================
              NO FILTER RESULTS
          =============================================== */}

          {!loading &&
            !error &&
            books.length > 0 &&
            filteredBooks.length === 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                  <Search className="h-7 w-7 text-slate-400" />
                </div>

                <h2 className="mt-6 text-2xl font-bold text-slate-950">
                  No products found
                </h2>

                <p className="mt-3 text-sm text-slate-500">
                  Try another search term or clear the
                  selected filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-7 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            )}
        </section>
      </main>
    </>
  );
}