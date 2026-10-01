import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Helmet } from "react-helmet-async";
import {
  Link,
  useParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

import BASE_URL from "../utils/Url";

const REVIEW_API =
  `${BASE_URL}/api/book/review`;

const INITIAL_FORM = {
  rating: 0,
  title: "",
  comment: "",
};

const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme =
    localStorage.getItem("theme");

  if (
    storedTheme === "dark" ||
    storedTheme === "light"
  ) {
    return storedTheme;
  }

  if (
    document.documentElement.classList.contains(
      "dark"
    )
  ) {
    return "dark";
  }

  return "light";
};

export default function BookReview() {
  const { token } = useParams();

  const [
    theme,
    setTheme,
  ] = useState(getStoredTheme);

  const [
    reviewData,
    setReviewData,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    pageError,
    setPageError,
  ] = useState("");

  const [
    form,
    setForm,
  ] = useState(
    INITIAL_FORM
  );

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    submitted,
    setSubmitted,
  ] = useState(false);

  const [
    hoveredRating,
    setHoveredRating,
  ] = useState(0);

  // ======================================================
  // THEME SYNC
  // ======================================================

  useEffect(() => {
    const syncTheme = () => {
      const nextTheme =
        getStoredTheme();

      setTheme((current) =>
        current === nextTheme
          ? current
          : nextTheme
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

  // ======================================================
  // FETCH REVIEW LINK DETAILS
  // ======================================================

  const fetchReviewLink =
    useCallback(async () => {
      if (!token) {
        setPageError(
          "This review link is invalid."
        );

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setPageError("");

        const response =
          await fetch(
            `${REVIEW_API}/link/${encodeURIComponent(
              token
            )}`,
            {
              method: "GET",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to verify this review link."
          );
        }

        setReviewData(
          data?.data || null
        );
      } catch (error) {
        console.error(
          "Fetch review link error:",
          error
        );

        setPageError(
          error?.message ||
            "Unable to load this review page."
        );
      } finally {
        setLoading(false);
      }
    }, [token]);

  useEffect(() => {
    fetchReviewLink();
  }, [fetchReviewLink]);

  // ======================================================
  // DERIVED DATA
  // ======================================================

  const book =
    reviewData?.book || {};

  const canReview =
    reviewData?.canReview ===
    true;

  const alreadyReviewed =
    reviewData?.reason ===
      "ALREADY_REVIEWED" ||
    reviewData?.canReview ===
      false;

  const displayRating =
    hoveredRating ||
    form.rating;

  const ratingText =
    useMemo(() => {
      const labels = {
        1: "Poor",
        2: "Fair",
        3: "Good",
        4: "Very Good",
        5: "Excellent",
      };

      return (
        labels[
          displayRating
        ] || "Select a rating"
      );
    }, [displayRating]);

  // ======================================================
  // FORM CHANGE
  // ======================================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  };

  // ======================================================
  // SELECT RATING
  // ======================================================

  const selectRating = (
    rating
  ) => {
    setForm((current) => ({
      ...current,
      rating,
    }));

    if (errors.rating) {
      setErrors((current) => ({
        ...current,
        rating: "",
      }));
    }
  };

  // ======================================================
  // VALIDATION
  // ======================================================

  const validateForm = () => {
    const nextErrors = {};

    const rating =
      Number(form.rating);

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      nextErrors.rating =
        "Please select a rating.";
    }

    const title =
      form.title.trim();

    const comment =
      form.comment.trim();

    if (
      title.length > 120
    ) {
      nextErrors.title =
        "Review title cannot exceed 120 characters.";
    }

    if (!comment) {
      nextErrors.comment =
        "Please write your review.";
    } else if (
      comment.length < 5
    ) {
      nextErrors.comment =
        "Review must contain at least 5 characters.";
    } else if (
      comment.length > 3000
    ) {
      nextErrors.comment =
        "Review cannot exceed 3000 characters.";
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

  // ======================================================
  // SUBMIT REVIEW
  // ======================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (submitting) {
        return;
      }

      if (!validateForm()) {
        toast.error(
          "Please check the review form."
        );

        return;
      }

      try {
        setSubmitting(true);

        const response =
          await fetch(
            `${REVIEW_API}/link/${encodeURIComponent(
              token
            )}`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },

              body:
                JSON.stringify({
                  rating:
                    Number(
                      form.rating
                    ),

                  title:
                    form.title.trim(),

                  comment:
                    form.comment.trim(),
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          if (
            data?.code ===
            "ALREADY_REVIEWED"
          ) {
            setReviewData(
              (current) => ({
                ...(current || {}),
                canReview: false,
                reason:
                  "ALREADY_REVIEWED",
              })
            );
          }

          throw new Error(
            data?.message ||
              "Unable to submit your review."
          );
        }

        setSubmitted(true);

        setReviewData(
          (current) => ({
            ...(current || {}),
            canReview: false,
            reason:
              "ALREADY_REVIEWED",
          })
        );

        toast.success(
          data?.message ||
            "Thank you! Your review has been submitted."
        );
      } catch (error) {
        console.error(
          "Submit review error:",
          error
        );

        toast.error(
          error?.message ||
            "Unable to submit your review."
        );
      } finally {
        setSubmitting(false);
      }
    };

  // ======================================================
  // THEME COLORS
  // ======================================================

  const colors = {
    page: isDark
      ? "bg-slate-950 text-slate-100"
      : "bg-slate-50 text-slate-900",

    card: isDark
      ? "border-slate-800 bg-slate-900"
      : "border-slate-200 bg-white",

    cardSecondary:
      isDark
        ? "border-slate-800 bg-slate-900/70"
        : "border-slate-200 bg-slate-50",

    heading: isDark
      ? "text-white"
      : "text-slate-950",

    text: isDark
      ? "text-slate-300"
      : "text-slate-600",

    muted: isDark
      ? "text-slate-500"
      : "text-slate-400",

    label: isDark
      ? "text-slate-300"
      : "text-slate-700",

    input: isDark
      ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/20"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/10",

    divider: isDark
      ? "border-slate-800"
      : "border-slate-100",

    subtleButton:
      isDark
        ? "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900",
  };

  // ======================================================
  // SEO
  // ======================================================

  const pageTitle =
    book?.title
      ? `Review ${book.title} | Target Trek`
      : "Write a Review | Target Trek";

  const pageDescription =
    book?.title
      ? `Share your experience with ${book.title} on Target Trek.`
      : "Share your experience with your Target Trek purchase.";

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <>
        <Helmet>
          <title>
            Write a Review | Target Trek
          </title>

          <meta
            name="robots"
            content="noindex,nofollow,noarchive,nosnippet"
          />

          <meta
            name="googlebot"
            content="noindex,nofollow,noarchive,nosnippet"
          />
        </Helmet>

        <main
          className={`flex min-h-screen items-center justify-center px-4 ${colors.page}`}
        >
          <div className="text-center">
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border ${colors.card}`}
            >
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>

            <p
              className={`mt-4 text-sm font-bold ${colors.text}`}
            >
              Loading your review page...
            </p>
          </div>
        </main>
      </>
    );
  }

  // ======================================================
  // ERROR PAGE
  // ======================================================

  if (pageError) {
    return (
      <>
        <Helmet>
          <title>
            Review Link | Target Trek
          </title>

          <meta
            name="robots"
            content="noindex,nofollow,noarchive,nosnippet"
          />

          <meta
            name="googlebot"
            content="noindex,nofollow,noarchive,nosnippet"
          />
        </Helmet>

        <main
          className={`min-h-screen px-4 py-10 sm:px-6 ${colors.page}`}
        >
          <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
            <div
              className={`w-full rounded-3xl border p-6 text-center shadow-xl sm:p-9 ${colors.card}`}
            >
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
                  isDark
                    ? "bg-red-500/10 text-red-400"
                    : "bg-red-50 text-red-600"
                }`}
              >
                <AlertCircle className="h-8 w-8" />
              </div>

              <h1
                className={`mt-6 text-2xl font-black ${colors.heading}`}
              >
                Review link unavailable
              </h1>

              <p
                className={`mx-auto mt-3 max-w-md text-sm leading-6 ${colors.text}`}
              >
                {pageError}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={
                    fetchReviewLink
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4" />

                  Try Again
                </button>

                <Link
                  to="/book"
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-extrabold transition ${colors.subtleButton}`}
                >
                  <ArrowLeft className="h-4 w-4" />

                  View Books
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // ======================================================
  // ALREADY SUBMITTED / SUCCESS
  // ======================================================

  if (
    submitted ||
    alreadyReviewed
  ) {
    return (
      <>
        <Helmet>
          <title>
            Review Submitted | Target Trek
          </title>

          <meta
            name="robots"
            content="noindex,nofollow,noarchive,nosnippet"
          />

          <meta
            name="googlebot"
            content="noindex,nofollow,noarchive,nosnippet"
          />
        </Helmet>

        <main
          className={`min-h-screen px-4 py-10 sm:px-6 lg:py-16 ${colors.page}`}
        >
          <div className="mx-auto flex min-h-[72vh] max-w-xl items-center justify-center">
            <div
              className={`w-full overflow-hidden rounded-3xl border shadow-xl ${colors.card}`}
            >
              <div
                className={`border-b px-6 py-8 text-center sm:px-9 ${colors.divider}`}
              >
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${
                    isDark
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <h1
                  className={`mt-5 text-2xl font-black sm:text-3xl ${colors.heading}`}
                >
                  {submitted
                    ? "Thank you for your review!"
                    : "Review already submitted"}
                </h1>

                <p
                  className={`mx-auto mt-3 max-w-md text-sm leading-6 ${colors.text}`}
                >
                  {submitted
                    ? "Your feedback has been received successfully. It helps us improve our resources and helps other learners."
                    : "A review has already been submitted using this review link."}
                </p>
              </div>

              {book?.title && (
                <div className="p-6 sm:p-8">
                  <div
                    className={`flex items-center gap-4 rounded-2xl border p-4 ${colors.cardSecondary}`}
                  >
                    {book.coverPageUrl ? (
                      <img
                        src={
                          book.coverPageUrl
                        }
                        alt={`${book.title} book cover`}
                        className="h-20 w-14 shrink-0 rounded-lg object-cover shadow-sm"
                      />
                    ) : (
                      <div
                        className={`flex h-20 w-14 shrink-0 items-center justify-center rounded-lg ${
                          isDark
                            ? "bg-slate-800"
                            : "bg-slate-100"
                        }`}
                      >
                        <BookOpen
                          className={`h-5 w-5 ${colors.muted}`}
                        />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p
                        className={`text-[10px] font-extrabold uppercase tracking-[0.1em] ${colors.muted}`}
                      >
                        Book reviewed
                      </p>

                      <p
                        className={`mt-1 font-extrabold leading-6 ${colors.heading}`}
                      >
                        {book.title}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/book"
                    className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700"
                  >
                    <BookOpen className="h-4 w-4" />

                    Explore More Books
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </>
    );
  }

  // ======================================================
  // MAIN REVIEW FORM
  // ======================================================

  return (
    <>
      <Helmet>
        <title>
          {pageTitle}
        </title>

        <meta
          name="description"
          content={
            pageDescription
          }
        />

        <meta
          name="robots"
          content="noindex,nofollow,noarchive,nosnippet"
        />

        <meta
          name="googlebot"
          content="noindex,nofollow,noarchive,nosnippet"
        />

        <meta
          property="og:title"
          content={
            pageTitle
          }
        />

        <meta
          property="og:description"
          content={
            pageDescription
          }
        />

        <meta
          property="og:type"
          content="website"
        />
      </Helmet>

      <main
        className={`min-h-screen transition-colors duration-300 ${colors.page}`}
      >
        {/* ==================================================
            TOP BAR
        ================================================== */}

        <div
          className={`border-b ${
            isDark
              ? "border-slate-800 bg-slate-950"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8">
            <Link
              to="/book"
              className={`inline-flex items-center gap-2 text-sm font-bold transition ${
                isDark
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <ArrowLeft className="h-4 w-4" />

              Back to Books
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden">
          <div
            className={`pointer-events-none absolute inset-x-0 top-0 h-72 ${
              isDark
                ? "bg-gradient-to-b from-blue-500/10 via-transparent to-transparent"
                : "bg-gradient-to-b from-blue-50 via-slate-50 to-transparent"
            }`}
          />

          <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mx-auto max-w-2xl text-center">
              <div
                className={`mx-auto inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-extrabold ${
                  isDark
                    ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
                    : "border-blue-100 bg-blue-50 text-blue-700"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />

                Verified Purchase Review
              </div>

              <h1
                className={`mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${colors.heading}`}
              >
                How was your experience?
              </h1>

              <p
                className={`mx-auto mt-4 max-w-xl text-sm leading-6 sm:text-base ${colors.text}`}
              >
                Your feedback helps us
                improve our learning
                resources and gives other
                learners useful insights.
              </p>
            </div>

            {/* ==================================================
                CONTENT
            ================================================== */}

            <div className="mx-auto mt-8 grid max-w-4xl gap-6 lg:mt-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
              {/* ==================================================
                  BOOK CARD
              ================================================== */}

              <aside
                className={`overflow-hidden rounded-3xl border shadow-sm ${colors.card}`}
              >
                {book.coverPageUrl ? (
                  <div
                    className={`flex justify-center p-6 ${
                      isDark
                        ? "bg-slate-950/50"
                        : "bg-slate-50"
                    }`}
                  >
                    <img
                      src={
                        book.coverPageUrl
                      }
                      alt={`${book.title} book cover`}
                      className="max-h-72 w-auto max-w-full rounded-xl object-contain shadow-lg"
                    />
                  </div>
                ) : (
                  <div
                    className={`flex h-52 items-center justify-center ${
                      isDark
                        ? "bg-slate-950/50"
                        : "bg-slate-50"
                    }`}
                  >
                    <BookOpen
                      className={`h-12 w-12 ${colors.muted}`}
                    />
                  </div>
                )}

                <div className="p-5">
                  <p
                    className={`text-[10px] font-extrabold uppercase tracking-[0.12em] ${colors.muted}`}
                  >
                    You're reviewing
                  </p>

                  <h2
                    className={`mt-2 text-lg font-black leading-6 ${colors.heading}`}
                  >
                    {book.title ||
                      "Target Trek Book"}
                  </h2>

                  <div
                    className={`mt-5 flex items-start gap-3 rounded-xl border p-3 ${
                      isDark
                        ? "border-emerald-500/20 bg-emerald-500/5"
                        : "border-emerald-100 bg-emerald-50"
                    }`}
                  >
                    <ShieldCheck
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        isDark
                          ? "text-emerald-400"
                          : "text-emerald-600"
                      }`}
                    />

                    <div>
                      <p
                        className={`text-xs font-extrabold ${
                          isDark
                            ? "text-emerald-300"
                            : "text-emerald-800"
                        }`}
                      >
                        Verified Purchase
                      </p>

                      <p
                        className={`mt-1 text-[11px] leading-4 ${
                          isDark
                            ? "text-emerald-400/70"
                            : "text-emerald-700/80"
                        }`}
                      >
                        This review link was
                        generated from a verified
                        Target Trek purchase.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>

              {/* ==================================================
                  REVIEW FORM
              ================================================== */}

              <section
                className={`overflow-hidden rounded-3xl border shadow-sm ${colors.card}`}
              >
                <div
                  className={`border-b px-5 py-5 sm:px-7 ${colors.divider}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isDark
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <MessageSquareText className="h-5 w-5" />
                    </div>

                    <div>
                      <h2
                        className={`text-lg font-black ${colors.heading}`}
                      >
                        Write your review
                      </h2>

                      <p
                        className={`mt-1 text-xs leading-5 ${colors.text}`}
                      >
                        It only takes a minute.
                        Share what you liked and
                        what could be improved.
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={
                    handleSubmit
                  }
                  noValidate
                  className="space-y-7 p-5 sm:p-7"
                >
                  {/* ==================================================
                      RATING
                  ================================================== */}

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <label
                        className={`text-sm font-extrabold ${colors.label}`}
                      >
                        Overall rating

                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <span
                        className={`text-xs font-bold ${
                          form.rating
                            ? isDark
                              ? "text-amber-400"
                              : "text-amber-600"
                            : colors.muted
                        }`}
                      >
                        {ratingText}
                      </span>
                    </div>

                    <div
                      className="mt-3 flex flex-wrap items-center gap-1 sm:gap-2"
                      role="radiogroup"
                      aria-label="Review rating"
                    >
                      {[
                        1,
                        2,
                        3,
                        4,
                        5,
                      ].map(
                        (
                          rating
                        ) => {
                          const selected =
                            rating <=
                            displayRating;

                          return (
                            <button
                              key={
                                rating
                              }
                              type="button"
                              role="radio"
                              aria-checked={
                                form.rating ===
                                rating
                              }
                              aria-label={`${rating} ${
                                rating ===
                                1
                                  ? "star"
                                  : "stars"
                              }`}
                              onMouseEnter={() =>
                                setHoveredRating(
                                  rating
                                )
                              }
                              onMouseLeave={() =>
                                setHoveredRating(
                                  0
                                )
                              }
                              onFocus={() =>
                                setHoveredRating(
                                  rating
                                )
                              }
                              onBlur={() =>
                                setHoveredRating(
                                  0
                                )
                              }
                              onClick={() =>
                                selectRating(
                                  rating
                                )
                              }
                              className={`group flex h-12 w-12 items-center justify-center rounded-xl border transition sm:h-14 sm:w-14 ${
                                selected
                                  ? isDark
                                    ? "border-amber-500/40 bg-amber-500/10"
                                    : "border-amber-200 bg-amber-50"
                                  : isDark
                                  ? "border-slate-700 bg-slate-950 hover:border-amber-500/30"
                                  : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50"
                              }`}
                            >
                              <Star
                                className={`h-6 w-6 transition ${
                                  selected
                                    ? "fill-amber-400 text-amber-400"
                                    : isDark
                                    ? "text-slate-600 group-hover:text-amber-400"
                                    : "text-slate-300 group-hover:text-amber-400"
                                }`}
                              />
                            </button>
                          );
                        }
                      )}
                    </div>

                    {errors.rating && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-500">
                        <AlertCircle className="h-3.5 w-3.5" />

                        {errors.rating}
                      </p>
                    )}
                  </div>

                  {/* ==================================================
                      TITLE
                  ================================================== */}

                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <label
                        htmlFor="review-title"
                        className={`text-sm font-extrabold ${colors.label}`}
                      >
                        Review title

                        <span
                          className={`ml-1 text-xs font-medium ${colors.muted}`}
                        >
                          (optional)
                        </span>
                      </label>

                      <span
                        className={`text-[10px] font-bold ${colors.muted}`}
                      >
                        {
                          form.title
                            .length
                        }
                        /120
                      </span>
                    </div>

                    <input
                      id="review-title"
                      type="text"
                      name="title"
                      value={
                        form.title
                      }
                      onChange={
                        handleChange
                      }
                      maxLength={120}
                      placeholder="Summarize your experience"
                      className={`mt-2.5 w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition focus:ring-4 ${colors.input} ${
                        errors.title
                          ? "!border-red-500 focus:!border-red-500 focus:!ring-red-500/10"
                          : ""
                      }`}
                    />

                    {errors.title && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-500">
                        <AlertCircle className="h-3.5 w-3.5" />

                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* ==================================================
                      COMMENT
                  ================================================== */}

                  <div>
                    <div className="flex items-center justify-between gap-4">
                      <label
                        htmlFor="review-comment"
                        className={`text-sm font-extrabold ${colors.label}`}
                      >
                        Your review

                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <span
                        className={`text-[10px] font-bold ${colors.muted}`}
                      >
                        {
                          form.comment
                            .length
                        }
                        /3000
                      </span>
                    </div>

                    <textarea
                      id="review-comment"
                      name="comment"
                      value={
                        form.comment
                      }
                      onChange={
                        handleChange
                      }
                      rows={7}
                      maxLength={3000}
                      placeholder="What did you find useful? How was the content? What could we improve?"
                      className={`mt-2.5 w-full resize-y rounded-xl border px-4 py-3 text-sm font-medium leading-6 outline-none transition focus:ring-4 ${colors.input} ${
                        errors.comment
                          ? "!border-red-500 focus:!border-red-500 focus:!ring-red-500/10"
                          : ""
                      }`}
                    />

                    {errors.comment ? (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-500">
                        <AlertCircle className="h-3.5 w-3.5" />

                        {errors.comment}
                      </p>
                    ) : (
                      <p
                        className={`mt-2 text-[11px] leading-5 ${colors.muted}`}
                      >
                        Please share an honest
                        review based on your
                        experience with the book.
                      </p>
                    )}
                  </div>

                  {/* ==================================================
                      PRIVACY
                  ================================================== */}

                  <div
                    className={`flex items-start gap-3 rounded-2xl border p-4 ${
                      isDark
                        ? "border-slate-700 bg-slate-950/70"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <ShieldCheck
                      className={`mt-0.5 h-5 w-5 shrink-0 ${
                        isDark
                          ? "text-blue-400"
                          : "text-blue-600"
                      }`}
                    />

                    <div>
                      <p
                        className={`text-xs font-extrabold ${colors.heading}`}
                      >
                        Your purchase details
                        stay private
                      </p>

                      <p
                        className={`mt-1 text-[11px] leading-5 ${colors.text}`}
                      >
                        Your name, email address
                        and payment information
                        are not displayed with
                        the public review.
                        Reviews are shown as
                        coming from a Verified
                        Buyer.
                      </p>
                    </div>
                  </div>

                  {/* ==================================================
                      SUBMIT
                  ================================================== */}

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      !canReview
                    }
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Submitting Review...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />

                        Submit Review
                      </>
                    )}
                  </button>

                  <p
                    className={`text-center text-[10px] leading-5 ${colors.muted}`}
                  >
                    Reviews can be submitted
                    only once using this link.
                  </p>
                </form>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}