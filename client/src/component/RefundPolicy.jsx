import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  FileCheck2,
  HelpCircle,
  LockKeyhole,
  Mail,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  CalendarClock,
  CalendarX2,
  Video,
} from "lucide-react";

/* ======================================================
   CONSTANTS
====================================================== */

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";

const CANONICAL_URL = `${SITE_URL}/refund-policy`;

const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const GENERAL_EMAIL = "enquiry@targettrek.in";
// Interview cancellation requests: address supplied for this policy.
const INTERVIEW_CANCELLATION_EMAIL = "supporttqrgeterek@gmail.com";
const INTERVIEW_CANCELLATION_FEE = 199;
const INTERVIEW_NOTICE_HOURS = 24;

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const LAST_UPDATED = "October 3, 2026";
const DATE_MODIFIED = "2026-10-03";

const SEO_TITLE =
  "Refund & Cancellation Policy for Ebooks and Mock Interviews | Target Trek";

const SEO_DESCRIPTION =
  "Read the Target Trek refund policy for digital ebooks and mock interviews, including duplicate-payment refunds, the ₹199 interview cancellation fee and the 24-hour email notice requirement.";

const SEO_KEYWORDS = [
  "Target Trek refund policy",
  "Target Trek ebook refund",
  "ebook refund policy",
  "digital product refund policy",
  "duplicate payment refund",
  "double payment refund",
  "ebook purchase support",
  "Target Trek books",
  "Target Trek mock interview cancellation",
  "mock interview cancellation fee 199",
  "mock interview 24 hour cancellation",
].join(", ");

/* ======================================================
   EMAIL
====================================================== */

const REFUND_EMAIL_SUBJECT =
  "Duplicate Payment Refund Request - Target Trek";

const REFUND_EMAIL_BODY = `Hello Target Trek Support,

I believe I was charged twice for the same Target Trek purchase and would like to request a duplicate-payment refund review.

Please find my details below:

Full Name:
Email Used During Checkout:
Ebook / Product Name:
Order ID:
Amount Paid:
Payment Date:

First Transaction ID / UTR / Payment Reference:
Second Transaction ID / UTR / Payment Reference:

Payment Method:

Description:
I was charged more than once for the same intended purchase.

I have attached supporting proof showing both transactions.

Thank you.`;

const REFUND_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  REFUND_EMAIL_SUBJECT
)}&body=${encodeURIComponent(REFUND_EMAIL_BODY)}`;

const SUPPORT_EMAIL_SUBJECT =
  "Ebook Purchase Support - Target Trek";

const SUPPORT_EMAIL_BODY = `Hello Target Trek Support,

I need help with my Target Trek ebook purchase.

Name:
Email Used During Checkout:
Ebook Name:
Order ID:
Transaction ID:
Issue:

Thank you.`;

const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  SUPPORT_EMAIL_SUBJECT
)}&body=${encodeURIComponent(SUPPORT_EMAIL_BODY)}`;

const INTERVIEW_CANCELLATION_SUBJECT =
  "Mock Interview Cancellation Request - Target Trek";

const INTERVIEW_CANCELLATION_BODY = `Hello Target Trek Support,

I request cancellation of my booked mock interview.

Candidate Name:
Email Used to Book:
Booking ID:
Scheduled Interview Date and Time (IST):
Payment / Order Reference:
Reason for Cancellation:

I understand that cancellation requests must reach support at least 24 hours before the scheduled interview start time and that a ₹199 cancellation fee applies to an eligible candidate-requested cancellation. Any eligible refund is the amount paid less the fee, subject to the policy and applicable law.

Thank you.`;

const INTERVIEW_CANCELLATION_MAILTO = `mailto:${INTERVIEW_CANCELLATION_EMAIL}?subject=${encodeURIComponent(
  INTERVIEW_CANCELLATION_SUBJECT
)}&body=${encodeURIComponent(INTERVIEW_CANCELLATION_BODY)}`;


/* ======================================================
   THEME
====================================================== */

const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme =
    localStorage.getItem(THEME_KEY);

  if (
    storedTheme === "dark" ||
    storedTheme === "light"
  ) {
    return storedTheme;
  }

  return "light";
};

/* ======================================================
   QUICK LINKS
====================================================== */

const quickLinks = [
  {
    id: "general-policy",
    label: "General refund policy",
  },
  {
    id: "duplicate-payment",
    label: "Duplicate payment",
  },
  {
    id: "refund-process",
    label: "How to request a refund",
  },
  {
    id: "proof-required",
    label: "Proof required",
  },
  {
    id: "refund-timeline",
    label: "7-day refund process",
  },
  {
    id: "delivery-issues",
    label: "Ebook delivery issues",
  },
  {
    id: "failed-payments",
    label: "Failed & pending payments",
  },
  {
    id: "mock-interview-cancellation",
    label: "Mock interview cancellation",
  },
  {
    id: "cancellation",
    label: "Ebook cancellation policy",
  },
  {
    id: "support",
    label: "Contact support",
  },
];

/* ======================================================
   FAQ
====================================================== */

const faqs = [
  {
    question: "Can I cancel my Target Trek mock interview?",
    answer:
      "You may request cancellation by emailing supporttqrgeterek@gmail.com at least 24 hours before your scheduled mock interview start time. A ₹199 cancellation fee applies to eligible candidate-requested cancellations. If less than 24 hours remain, no refund is initiated under this cancellation policy, except where required by applicable law.",
  },
  {
    question: "How much will I receive if I cancel a mock interview in time?",
    answer:
      "For an eligible cancellation requested at least 24 hours before the scheduled start, the refund is the amount paid minus the ₹199 cancellation fee, with no negative refund balance. Requests received later are not eligible for a refund under the standard candidate cancellation policy.",
  },
  {
    question:
      "Are Target Trek ebook purchases refundable?",
    answer:
      "Target Trek digital ebooks and downloadable products are generally non-refundable. Verified duplicate charges for the same intended ebook purchase may be refunded, subject to applicable law. Mock interview bookings have a separate candidate-requested cancellation policy, including a ₹199 fee and a 24-hour advance email requirement.",
  },
  {
    question:
      "What happens if I accidentally pay twice?",
    answer:
      "Contact Target Trek support with the order details and proof of both successful transactions. If the duplicate payment is verified, the additional duplicate amount will be refunded.",
  },
  {
    question:
      "How long does a duplicate-payment refund take?",
    answer:
      "After Target Trek verifies that a duplicate payment was successfully received, the refund will be processed and initiated within seven calendar days to the original payment method.",
  },
  {
    question:
      "What if I paid successfully but did not receive the ebook?",
    answer:
      "Contact Target Trek support. We will verify the transaction and help restore access, resend the ebook, provide the correct download link, or otherwise resolve the delivery issue.",
  },
  {
    question:
      "Where will my duplicate-payment refund be sent?",
    answer:
      "Approved duplicate-payment refunds are returned to the original payment method used for the duplicate transaction whenever supported by the payment provider.",
  },
];

/* ======================================================
   REUSABLE COMPONENTS
====================================================== */

const Section = ({
  id,
  number,
  title,
  children,
  isDark,
}) => {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`scroll-mt-28 border-b pb-10 last:border-b-0 ${
        isDark
          ? "border-[#403027]"
          : "border-[#f5e7db]"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black sm:flex ${
            isDark
              ? "bg-orange-500/10 text-orange-400"
              : "bg-orange-50 text-orange-700"
          }`}
        >
          {number}
        </div>

        <div className="min-w-0 flex-1">
          <h2
            id={headingId}
            className={`text-xl font-black tracking-tight sm:text-2xl ${
              isDark
                ? "text-white"
                : "text-[#29201a]"
            }`}
          >
            <span className="mr-2 text-orange-600 sm:hidden">
              {number}.
            </span>

            {title}
          </h2>

          <div
            className={`mt-5 space-y-4 text-[15px] leading-7 sm:text-base sm:leading-8 ${
              isDark
                ? "text-[#bca99b]"
                : "text-[#77665b]"
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

const BulletList = ({
  items,
  isDark,
}) => {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex items-start gap-3"
        >
          <CheckCircle2
            size={17}
            className="mt-1.5 shrink-0 text-orange-500"
          />

          <div
            className={`min-w-0 flex-1 ${
              isDark
                ? "text-[#bca99b]"
                : "text-[#77665b]"
            }`}
          >
            {item}
          </div>
        </li>
      ))}
    </ul>
  );
};

/* ======================================================
   PAGE
====================================================== */

const RefundPolicy = () => {
  const [theme, setTheme] =
    useState(getStoredTheme);

  const isDark = theme === "dark";

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    const syncTheme = () => {
      setTheme(getStoredTheme());
    };

    const handleStorage = (event) => {
      if (event.key === THEME_KEY) {
        syncTheme();
      }
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    window.addEventListener(
      THEME_EVENT,
      syncTheme
    );

    syncTheme();

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        THEME_EVENT,
        syncTheme
      );
    };
  }, []);

  /* ====================================================
     STRUCTURED DATA
  ==================================================== */

  const structuredData = {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "Organization",

        "@id": `${SITE_URL}/#organization`,

        name: SITE_NAME,

        url: SITE_URL,

        email: SUPPORT_EMAIL,

        contactPoint: {
          "@type": "ContactPoint",

          email: SUPPORT_EMAIL,

          contactType: "customer support",

          areaServed: "IN",

          availableLanguage: ["English"],
        },
      },

      {
        "@type": "WebSite",

        "@id": `${SITE_URL}/#website`,

        name: SITE_NAME,

        url: SITE_URL,

        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },

        inLanguage: "en",
      },

      {
        "@type": "WebPage",

        "@id": `${CANONICAL_URL}#webpage`,

        url: CANONICAL_URL,

        name: SEO_TITLE,

        description: SEO_DESCRIPTION,

        dateModified: DATE_MODIFIED,

        inLanguage: "en",

        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },

        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },

        breadcrumb: {
          "@id": `${CANONICAL_URL}#breadcrumb`,
        },
      },

      {
        "@type": "BreadcrumbList",

        "@id": `${CANONICAL_URL}#breadcrumb`,

        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Refund Policy",
            item: CANONICAL_URL,
          },
        ],
      },

      {
        "@type": "FAQPage",

        mainEntity: faqs.map(
          (item) => ({
            "@type": "Question",

            name: item.question,

            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })
        ),
      },
    ],
  };

  return (
    <div
      className={`min-h-screen pt-16 transition-colors duration-300 md:pt-20 ${
        isDark
          ? "bg-[#15110e] text-slate-100"
          : "bg-[#fffaf5] text-[#34271f]"
      }`}
    >
      {/* =================================================
          SEO
      ================================================= */}

      <Helmet>
        <title>{SEO_TITLE}</title>

        <meta
          name="description"
          content={SEO_DESCRIPTION}
        />

        <meta
          name="keywords"
          content={SEO_KEYWORDS}
        />

        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        <meta
          name="googlebot"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        <meta
          name="author"
          content={SITE_NAME}
        />

        <meta
          name="application-name"
          content={SITE_NAME}
        />

        <meta
          name="theme-color"
          content={
            isDark
              ? "#020617"
              : "#ffffff"
          }
        />

        <link
          rel="canonical"
          href={CANONICAL_URL}
        />

        {/* Open Graph */}

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:site_name"
          content={SITE_NAME}
        />

        <meta
          property="og:locale"
          content="en_IN"
        />

        <meta
          property="og:title"
          content={SEO_TITLE}
        />

        <meta
          property="og:description"
          content={SEO_DESCRIPTION}
        />

        <meta
          property="og:url"
          content={CANONICAL_URL}
        />

        {/* Twitter */}

        <meta
          name="twitter:card"
          content="summary"
        />

        <meta
          name="twitter:title"
          content={SEO_TITLE}
        />

        <meta
          name="twitter:description"
          content={SEO_DESCRIPTION}
        />

        <meta
          property="article:modified_time"
          content={DATE_MODIFIED}
        />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <main>

        {/* =================================================
            HERO
        ================================================= */}

        <section
          className={`relative overflow-hidden border-b ${
            isDark
              ? "border-[#403027] bg-[#15110e]"
              : "border-[#f1dfd1] bg-white"
          }`}
        >
          <div
            className={`pointer-events-none absolute -right-48 -top-48 h-[500px] w-[500px] rounded-full blur-3xl ${
              isDark
                ? "bg-orange-500/10"
                : "bg-orange-100/70"
            }`}
          />

          <div
            className={`pointer-events-none absolute -left-32 bottom-0 h-[320px] w-[320px] rounded-full blur-3xl ${
              isDark
                ? "bg-orange-500/5"
                : "bg-[#fff3e8]"
            }`}
          />

          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            {/* Breadcrumb */}

            <nav
              aria-label="Breadcrumb"
              className={`mb-8 flex items-center gap-2 text-xs font-semibold ${
                isDark
                  ? "text-[#9e8b7e]"
                  : "text-[#bca99b]"
              }`}
            >
              <a
                href="/"
                className="transition hover:text-orange-600"
              >
                Home
              </a>

              <span aria-hidden="true">
                /
              </span>

              <span
                className={
                  isDark
                    ? "text-[#ddcfc3]"
                    : "text-[#77665b]"
                }
              >
                Refund Policy
              </span>
            </nav>

            <div className="max-w-4xl">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${
                  isDark
                    ? "border-orange-500/20 bg-orange-500/10 text-orange-300"
                    : "border-orange-100 bg-orange-50 text-orange-700"
                }`}
              >
                <ShieldCheck size={15} />

                Target Trek Refund Policy
              </div>

              <h1
                className={`mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl ${
                  isDark
                    ? "text-white"
                    : "text-[#29201a]"
                }`}
              >
                Refund & Cancellation Policy
              </h1>

              <p
                className={`mt-6 max-w-3xl text-base leading-8 sm:text-lg ${
                  isDark
                    ? "text-[#bca99b]"
                    : "text-[#77665b]"
                }`}
              >
                Target Trek offers digital ebooks,
                educational resources and mock
                interviews. Ebooks may
                be delivered immediately after a
                successful payment. Because of the
                digital nature of these products,
                ebook purchases are generally final
                and non-refundable. Mock interviews
                follow the separate cancellation terms below.
              </p>

              <div
                className={`mt-6 max-w-3xl rounded-2xl border p-5 ${
                  isDark
                    ? "border-emerald-500/20 bg-emerald-500/10"
                    : "border-emerald-200 bg-emerald-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <CircleDollarSign
                    size={22}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />

                  <p
                    className={`font-bold leading-7 ${
                      isDark
                        ? "text-emerald-200"
                        : "text-emerald-900"
                    }`}
                  >
                    For ebooks, a verified duplicate
                    payment may qualify for a refund.
                    For mock interviews, candidate-requested
                    cancellations must be emailed at least
                    24 hours in advance and incur a ₹199
                    cancellation fee. Exceptions required
                    by applicable law still apply.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <span
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                    isDark
                      ? "border-[#403027] bg-[#211a15] text-[#bca99b]"
                      : "border-[#f1dfd1] bg-white text-[#77665b] shadow-sm"
                  }`}
                >
                  Last updated: {LAST_UPDATED}
                </span>

                <span
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                    isDark
                      ? "border-[#403027] bg-[#211a15] text-[#bca99b]"
                      : "border-[#f1dfd1] bg-white text-[#77665b] shadow-sm"
                  }`}
                >
                  Digital Products
                </span>

                <span
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                    isDark
                      ? "border-[#403027] bg-[#211a15] text-[#bca99b]"
                      : "border-[#f1dfd1] bg-white text-[#77665b] shadow-sm"
                  }`}
                >
                  Ebooks & Mock Interviews
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            POLICY SUMMARY
        ================================================= */}

        <section
          className={`border-b ${
            isDark
              ? "border-[#403027] bg-[#211a15]"
              : "border-[#f1dfd1] bg-white"
          }`}
        >
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-7 sm:grid-cols-3 sm:px-6 lg:px-8">

            {/* Card 1 */}

            <div
              className={`rounded-2xl border p-5 ${
                isDark
                  ? "border-[#403027] bg-[#15110e]"
                  : "border-[#f1dfd1] bg-[#fffaf5]"
              }`}
            >
              <BookOpen
                size={21}
                className="text-orange-500"
              />

              <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-orange-600">
                Digital Products
              </p>

              <p
                className={`mt-2 text-sm font-bold leading-6 ${
                  isDark
                    ? "text-[#f3e7dd]"
                    : "text-[#4d3b30]"
                }`}
              >
                Ebook and digital-product
                purchases are non-refundable once
                successfully purchased and
                delivered.
              </p>
            </div>

            {/* Card 2 */}

            <div
              className={`rounded-2xl border p-5 ${
                isDark
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <RefreshCcw
                size={21}
                className="text-emerald-500"
              />

              <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-emerald-600">
                Refund Eligibility
              </p>

              <p
                className={`mt-2 text-sm font-bold leading-6 ${
                  isDark
                    ? "text-[#f3e7dd]"
                    : "text-[#4d3b30]"
                }`}
              >
                A verified duplicate payment for
                the same intended purchase is
                eligible for refund under our
                standard policy.
              </p>
            </div>

            {/* Card 3 */}

            <div
              className={`rounded-2xl border p-5 ${
                isDark
                  ? "border-orange-500/20 bg-orange-500/5"
                  : "border-orange-200 bg-orange-50"
              }`}
            >
              <Clock3
                size={21}
                className="text-orange-500"
              />

              <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-orange-600">
                Refund Timeline
              </p>

              <p
                className={`mt-2 text-sm font-bold leading-6 ${
                  isDark
                    ? "text-[#f3e7dd]"
                    : "text-[#4d3b30]"
                }`}
              >
                Verified duplicate-payment refunds
                are processed within 7 calendar
                days to the original payment
                method.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8 lg:py-14">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="hidden lg:block">
            <div
              className={`sticky top-28 rounded-2xl border p-5 shadow-sm ${
                isDark
                  ? "border-[#403027] bg-[#211a15]"
                  : "border-[#f1dfd1] bg-white"
              }`}
            >
              <p
                className={`text-xs font-black uppercase tracking-[0.16em] ${
                  isDark
                    ? "text-[#9e8b7e]"
                    : "text-[#bca99b]"
                }`}
              >
                Quick Navigation
              </p>

              <nav
                aria-label="Refund policy navigation"
                className="mt-4 space-y-1"
              >
                {quickLinks.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                      isDark
                        ? "text-[#bca99b] hover:bg-orange-500/10 hover:text-orange-400"
                        : "text-[#77665b] hover:bg-orange-50 hover:text-orange-700"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div
                className={`mt-6 border-t pt-5 ${
                  isDark
                    ? "border-[#403027]"
                    : "border-[#f5e7db]"
                }`}
              >
                <p
                  className={`text-xs leading-5 ${
                    isDark
                      ? "text-[#9e8b7e]"
                      : "text-[#9e8b7e]"
                  }`}
                >
                  Refund & purchase support
                </p>

                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="mt-2 block break-all text-xs font-bold text-orange-500 hover:text-orange-600"
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          </aside>

          {/* =================================================
              ARTICLE
          ================================================= */}

          <article className="min-w-0">

            {/* Important Alert */}

            <section
              className={`rounded-3xl border p-6 sm:p-8 ${
                isDark
                  ? "border-red-500/20 bg-red-500/5"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                    isDark
                      ? "border-red-500/20 bg-red-500/10 text-red-400"
                      : "border-red-200 bg-white text-red-600"
                  }`}
                >
                  <AlertTriangle size={21} />
                </div>

                <div>
                  <h2
                    className={`text-xl font-black ${
                      isDark
                        ? "text-white"
                        : "text-[#29201a]"
                    }`}
                  >
                    Digital Ebook Purchases Are
                    Generally Non-Refundable
                  </h2>

                  <p
                    className={`mt-3 leading-7 ${
                      isDark
                        ? "text-[#bca99b]"
                        : "text-[#665246]"
                    }`}
                  >
                    Target Trek primarily sells
                    digital ebooks, PDFs, interview
                    preparation material and other
                    digital educational resources.
                    These products may become
                    available immediately after a
                    successful payment.
                  </p>

                  <p
                    className={`mt-3 leading-7 ${
                      isDark
                        ? "text-[#bca99b]"
                        : "text-[#665246]"
                    }`}
                  >
                    Because a digital product can
                    be accessed, viewed, saved or
                    downloaded after delivery,
                    purchases are considered final
                    and are not returnable in the
                    same manner as physical goods.
                  </p>

                  <p
                    className={`mt-3 font-bold leading-7 ${
                      isDark
                        ? "text-red-300"
                        : "text-red-800"
                    }`}
                  >
                    For ebook purchases, our standard
                    exception is a verified duplicate
                    payment. Mock interview cancellations
                    are governed by the separate terms
                    below, and mandatory rights under
                    applicable law remain unaffected.
                  </p>
                </div>
              </div>
            </section>

            {/* Main Policy Body */}

            <div
              className={`mt-10 space-y-10 rounded-3xl border p-6 shadow-sm sm:p-10 ${
                isDark
                  ? "border-[#403027] bg-[#211a15]"
                  : "border-[#f1dfd1] bg-white"
              }`}
            >

              {/* 1 */}

              <Section
                id="scope"
                number="1"
                title="Scope of This Policy"
                isDark={isDark}
              >
                <p>
                  This Refund & Cancellation Policy
                  applies to digital products and
                  paid mock interview bookings
                  purchased directly through the
                  Target Trek website.
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Digital ebooks.",
                    "Paid mock interview bookings (under the separate session-cancellation terms).",
                    "PDF books and guides.",
                    "System Design learning material.",
                    "GenAI and software engineering resources.",
                    "Interview preparation material.",
                    "Digital study material.",
                    "Other downloadable or digitally accessible products sold by Target Trek.",
                  ]}
                />
              </Section>

              {/* 2 */}

              <Section
                id="delivery"
                number="2"
                title="Digital Product Delivery"
                isDark={isDark}
              >
                <p>
                  Target Trek products are primarily
                  delivered electronically.
                  Depending on the product, access
                  may be provided through:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "A downloadable PDF or other digital file.",
                    "A browser-based ebook or document viewer.",
                    "A purchase-specific success or access page.",
                    "A secure or temporary download link.",
                    "An email containing purchase or access information.",
                    "Another electronic delivery method displayed during checkout.",
                  ]}
                />

                <p>
                  A digital product is considered
                  delivered when the purchased file,
                  viewer, download option, access
                  page or another reasonable method
                  of accessing the purchased product
                  has been made available to the
                  purchaser.
                </p>
              </Section>

              {/* 3 */}

              <Section
                id="general-policy"
                number="3"
                title="General No-Refund Policy"
                isDark={isDark}
              >
                <div
                  className={`rounded-2xl border p-5 ${
                    isDark
                      ? "border-amber-500/20 bg-amber-500/10"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <p
                    className={`font-bold leading-7 ${
                      isDark
                        ? "text-amber-200"
                        : "text-[#34271f]"
                    }`}
                  >
                    All Target Trek ebook and
                    digital-product sales are
                    generally final and
                    non-refundable.
                  </p>
                </div>

                <p>
                  A refund will not normally be
                  provided because a customer:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Changes their mind after purchasing.",
                    "Purchases the wrong ebook.",
                    "Makes an accidental purchase.",
                    "No longer needs the ebook.",
                    "Already knows some or all of the material.",
                    "Finds similar information elsewhere.",
                    "Does not like the writing style, design or presentation.",
                    "Does not read the product description before purchasing.",
                    "Expected topics or features that were not included in the product description.",
                    "Does not achieve a desired interview, job, examination, salary or educational outcome.",
                    "Experiences a device-specific issue outside Target Trek's reasonable control.",
                    "Later sees the same ebook offered at a different price.",
                  ]}
                />

                <p>
                  Customers should review the
                  product title, description,
                  edition, language, topics,
                  format, price and other displayed
                  information before completing the
                  purchase.
                </p>
              </Section>

              {/* 4 */}

              <Section
                id="duplicate-payment"
                number="4"
                title="Duplicate or Double Payment Refund"
                isDark={isDark}
              >
                <div
                  className={`rounded-2xl border p-6 ${
                    isDark
                      ? "border-emerald-500/20 bg-emerald-500/10"
                      : "border-emerald-200 bg-emerald-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <CircleDollarSign
                      size={24}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />

                    <div>
                      <h3
                        className={`font-black ${
                          isDark
                            ? "text-emerald-200"
                            : "text-emerald-900"
                        }`}
                      >
                        Refunds are available for
                        verified duplicate payments.
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-7 ${
                          isDark
                            ? "text-emerald-200/80"
                            : "text-emerald-800"
                        }`}
                      >
                        If you were charged more than
                        once for the same intended
                        Target Trek purchase, contact
                        our support team with proof
                        of both successful payments.
                      </p>
                    </div>
                  </div>
                </div>

                <p>
                  A duplicate payment means that two
                  or more successful payment
                  transactions were received for
                  what was intended to be a single
                  purchase of the same product.
                </p>

                <p>
                  After reviewing our payment and
                  order records, if Target Trek
                  confirms that an unintended
                  duplicate payment was successfully
                  received, the additional duplicate
                  amount will be eligible for a
                  refund.
                </p>

                <p>
                  The original valid payment remains
                  the payment for the purchased
                  product and is not refunded under
                  the duplicate-payment policy.
                </p>
              </Section>

              {/* 5 */}

              <Section
                id="refund-process"
                number="5"
                title="How to Request a Duplicate-Payment Refund"
                isDark={isDark}
              >
                <p>
                  Send your duplicate-payment refund
                  request to:
                </p>

                <div
                  className={`rounded-2xl border p-6 ${
                    isDark
                      ? "border-orange-500/20 bg-orange-500/10"
                      : "border-orange-200 bg-orange-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Mail
                      size={24}
                      className="mt-1 shrink-0 text-orange-500"
                    />

                    <div>
                      <p
                        className={`text-lg font-black ${
                          isDark
                            ? "text-white"
                            : "text-[#29201a]"
                        }`}
                      >
                        Target Trek Ebook Support
                      </p>

                      <a
                        href={REFUND_MAILTO}
                        className="mt-2 block break-all font-bold text-orange-500 underline decoration-orange-300 underline-offset-4"
                      >
                        {SUPPORT_EMAIL}
                      </a>

                      <p
                        className={`mt-3 text-sm ${
                          isDark
                            ? "text-[#bca99b]"
                            : "text-[#77665b]"
                        }`}
                      >
                        Recommended subject:
                      </p>

                      <p
                        className={`mt-1 text-sm font-bold ${
                          isDark
                            ? "text-[#f3e7dd]"
                            : "text-[#4d3b30]"
                        }`}
                      >
                        {REFUND_EMAIL_SUBJECT}
                      </p>
                    </div>
                  </div>

                  <a
                    href={REFUND_MAILTO}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-700"
                  >
                    <Mail size={17} />

                    Email Refund Request

                    <ArrowRight size={16} />
                  </a>
                </div>

                <p>
                  Providing complete information and
                  supporting proof helps us verify
                  duplicate transactions more
                  quickly.
                </p>
              </Section>

              {/* 6 */}

              <Section
                id="proof-required"
                number="6"
                title="Information and Proof Required"
                isDark={isDark}
              >
                <p>
                  When contacting us about a
                  duplicate payment, please provide
                  as much of the following
                  information as possible:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Your full name.",
                    "The email address used during checkout.",
                    "The name of the ebook or digital product purchased.",
                    "Target Trek order ID or order reference, if available.",
                    "The amount charged.",
                    "The date and approximate time of both payments.",
                    "The transaction ID, UTR, payment ID or payment reference for the first payment.",
                    "The transaction ID, UTR, payment ID or payment reference for the duplicate payment.",
                    "The payment method used, such as UPI, card, net banking or another supported method.",
                    "Screenshots showing both successful charges.",
                    "A bank, UPI or payment-app transaction screenshot or statement excerpt where reasonably necessary to verify the duplicate charge.",
                    "A short explanation stating that both payments were made for the same intended purchase.",
                  ]}
                />

                <div
                  className={`rounded-2xl border p-5 ${
                    isDark
                      ? "border-orange-500/20 bg-orange-500/10"
                      : "border-orange-200 bg-orange-50"
                  }`}
                >
                  <div className="flex gap-3">
                    <FileCheck2
                      size={21}
                      className="mt-0.5 shrink-0 text-orange-500"
                    />

                    <p
                      className={`font-bold leading-7 ${
                        isDark
                          ? "text-orange-200"
                          : "text-[#34271f]"
                      }`}
                    >
                      If you send a bank statement
                      or screenshot, you may hide
                      unrelated transactions and
                      unrelated personal financial
                      information. We only need
                      enough information to verify
                      the relevant payments.
                    </p>
                  </div>
                </div>
              </Section>

              {/* 7 */}

              <Section
                id="refund-timeline"
                number="7"
                title="Refund Timeline and Payment Method"
                isDark={isDark}
              >
                <div
                  className={`rounded-2xl border p-6 ${
                    isDark
                      ? "border-orange-500/20 bg-orange-500/10"
                      : "border-orange-200 bg-orange-50"
                  }`}
                >
                  <div className="flex gap-4">
                    <Clock3
                      size={25}
                      className="mt-0.5 shrink-0 text-orange-500"
                    />

                    <div>
                      <h3
                        className={`font-black ${
                          isDark
                            ? "text-orange-200"
                            : "text-orange-900"
                        }`}
                      >
                        Refund processing: within 7
                        calendar days
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-7 ${
                          isDark
                            ? "text-orange-200/80"
                            : "text-orange-800"
                        }`}
                      >
                        Once we confirm that an
                        unintended duplicate payment
                        was successfully received,
                        Target Trek will process and
                        initiate the refund within
                        seven calendar days.
                      </p>
                    </div>
                  </div>
                </div>

                <p>
                  The refund will be sent back to
                  the{" "}
                  <strong
                    className={
                      isDark
                        ? "text-white"
                        : "text-[#34271f]"
                    }
                  >
                    original payment method
                  </strong>{" "}
                  used for the duplicate transaction
                  whenever supported by the payment
                  provider.
                </p>

                <p>
                  For example, a duplicate UPI
                  payment would ordinarily be
                  refunded through the corresponding
                  payment channel, while an eligible
                  card transaction would ordinarily
                  be refunded through the card
                  payment channel.
                </p>

                <p>
                  Once Target Trek has successfully
                  initiated the refund, your bank,
                  card network, UPI provider or
                  payment service provider may take
                  additional time to display the
                  credit in your account. Such
                  external processing time is
                  controlled by the relevant
                  financial institution or payment
                  provider.
                </p>
              </Section>

              {/* 8 */}

              <Section
                id="delivery-issues"
                number="8"
                title="Payment Successful but Ebook Not Received"
                isDark={isDark}
              >
                <p>
                  A missing download or temporary
                  delivery problem does not itself
                  qualify for a refund under our
                  standard refund policy.
                </p>

                <p>
                  If your payment was successful but
                  you cannot access your ebook,
                  please:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Check the payment-success page for the download or access option.",
                    "Check the email address used during checkout.",
                    "Check your spam, junk and promotions folders.",
                    "Confirm that the transaction shows as successful rather than pending or failed.",
                    "Contact Target Trek support with your order and transaction details.",
                  ]}
                />

                <p>
                  After verification, we can assist
                  by restoring access, providing the
                  correct ebook, resending available
                  access information, or resolving a
                  technical delivery issue.
                </p>

                <a
                  href={SUPPORT_MAILTO}
                  className="inline-flex items-center gap-2 font-bold text-orange-500 hover:text-orange-600"
                >
                  Contact ebook support
                  <ArrowRight size={16} />
                </a>
              </Section>

              {/* 9 */}

              <Section
                id="incorrect-product"
                number="9"
                title="Incorrect, Corrupted, or Inaccessible Ebook"
                isDark={isDark}
              >
                <p>
                  If the delivered ebook is
                  corrupted, materially incomplete,
                  inaccessible, or different from
                  the product associated with your
                  order, please contact our support
                  team.
                </p>

                <p>
                  Depending on the issue, Target
                  Trek may:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Provide a working replacement file.",
                    "Provide the correct purchased ebook.",
                    "Restore access to the purchased product.",
                    "Provide a new valid download or access method.",
                    "Investigate and resolve the underlying delivery problem.",
                  ]}
                />

                <p>
                  These situations are handled as
                  product-support or delivery issues
                  and are not, by themselves, part
                  of the duplicate-payment refund
                  policy.
                </p>
              </Section>

              {/* 10 */}

              <Section
                id="failed-payments"
                number="10"
                title="Failed, Pending, or Cancelled Payments"
                isDark={isDark}
              >
                <p>
                  A failed, pending or cancelled
                  transaction does not necessarily
                  mean Target Trek successfully
                  received the payment.
                </p>

                <p>
                  In some cases, a bank or payment
                  provider may temporarily display a
                  debit, hold or authorization even
                  though the payment did not
                  successfully complete.
                </p>

                <p>
                  Such transactions may be
                  automatically reversed by the
                  relevant bank or payment provider
                  according to its own processing
                  timelines.
                </p>

                <p>
                  If the transaction remains
                  unresolved, you may contact Target
                  Trek support so we can check
                  whether our records show a
                  successful payment.
                </p>
              </Section>

              {/* 11 */}

              <Section
                id="payment-security"
                number="11"
                title="Do Not Send Sensitive Payment Information"
                isDark={isDark}
              >
                <div
                  className={`rounded-2xl border p-5 ${
                    isDark
                      ? "border-red-500/20 bg-red-500/10"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <LockKeyhole
                      size={21}
                      className="mt-1 shrink-0 text-red-500"
                    />

                    <p
                      className={`font-bold leading-7 ${
                        isDark
                          ? "text-red-200"
                          : "text-[#34271f]"
                      }`}
                    >
                      Never send Target Trek your
                      UPI PIN, OTP, CVV, internet
                      banking password, complete
                      debit or credit card number,
                      or any account password.
                    </p>
                  </div>
                </div>

                <p>
                  To verify a payment, we may ask
                  for transaction references,
                  payment IDs, UTR numbers, order
                  IDs, amounts, dates, screenshots
                  or limited transaction
                  information.
                </p>

                <p>
                  We do not need your PIN, OTP, CVV
                  or banking password to review a
                  duplicate-payment request.
                </p>
              </Section>

              {/* 12 */}

              {/* MOCK INTERVIEW CANCELLATION — SEPARATE FROM EBOOKS */}
              <Section
                id="mock-interview-cancellation"
                number="12"
                title="Mock Interview Cancellation & Refunds"
                isDark={isDark}
              >
                <p>
                  The following terms apply when a candidate requests
                  cancellation of a paid Target Trek mock interview booking.
                  They are separate from our ebook refund rules.
                </p>
                <div className={`grid gap-4 sm:grid-cols-2`}>
                  <div className={`rounded-2xl border p-5 ${
                    isDark
                      ? "border-orange-900/60 bg-orange-950/20"
                      : "border-orange-200 bg-orange-50"
                  }`}>
                    <CircleDollarSign size={24} className="text-orange-500" />
                    <p className="mt-3 text-xs font-bold uppercase tracking-wider text-orange-500">
                      Candidate cancellation fee
                    </p>
                    <p className={`mt-1 text-3xl font-black ${isDark ? "text-orange-200" : "text-orange-800"}`}>
                      ₹{INTERVIEW_CANCELLATION_FEE}
                    </p>
                    <p className="mt-2 text-sm leading-6">
                      Deducted from an eligible candidate-requested cancellation refund.
                    </p>
                  </div>
                  <div className={`rounded-2xl border p-5 ${
                    isDark
                      ? "border-orange-900/60 bg-orange-950/20"
                      : "border-orange-200 bg-orange-50"
                  }`}>
                    <CalendarClock size={24} className="text-orange-500" />
                    <p className="mt-3 text-xs font-bold uppercase tracking-wider text-orange-500">
                      Required advance notice
                    </p>
                    <p className={`mt-1 text-3xl font-black ${isDark ? "text-orange-200" : "text-orange-800"}`}>
                      {INTERVIEW_NOTICE_HOURS} hours
                    </p>
                    <p className="mt-2 text-sm leading-6">
                      Email must be received at least 24 hours before the scheduled start time.
                    </p>
                  </div>
                </div>
                <BulletList
                  isDark={isDark}
                  items={[
                    "Send the cancellation request from your booking email address, if possible.",
                    "Email the request at least 24 hours before the scheduled mock interview begins (using the scheduled time in IST).",
                    "Include your booking ID, candidate name, registered email, scheduled date and time, and payment reference.",
                    "For eligible advance cancellations, the refundable amount is the amount actually paid minus ₹199, with a minimum refund of ₹0.",
                    "If your cancellation email arrives less than 24 hours before the scheduled start, no refund will be initiated under this candidate-requested cancellation policy.",
                    "Failing to attend the session without timely cancellation is not eligible for a refund under this policy.",
                  ]}
                />
                <div className={`rounded-2xl border p-5 ${
                  isDark
                    ? "border-orange-900/60 bg-[#302016]"
                    : "border-orange-200 bg-[#fff4e9]"
                }`}>
                  <div className="flex items-start gap-3">
                    <Mail size={22} className="mt-1 shrink-0 text-orange-500" />
                    <div className="min-w-0">
                      <h3 className={`font-black ${isDark ? "text-orange-200" : "text-orange-900"}`}>
                        Send your cancellation request by email
                      </h3>
                      <p className="mt-2 text-sm">Required cancellation address:</p>
                      <a
                        className="mt-1 block break-all font-bold text-orange-500 underline underline-offset-4"
                        href={INTERVIEW_CANCELLATION_MAILTO}
                      >
                        {INTERVIEW_CANCELLATION_EMAIL}
                      </a>
                      <a
                        href={INTERVIEW_CANCELLATION_MAILTO}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-700"
                      >
                        <Mail size={17} /> Email Mock Interview Cancellation <ArrowRight size={16} />
                      </a>
                    </div>
                  </div>
                </div>
                <p>
                  Cancellation requests are assessed using the time the email is
                  received and the scheduled interview start time. Approved refunds
                  are returned to the original payment method when supported by
                  the payment provider. These terms do not limit refunds or other
                  remedies required by applicable law, including situations where
                  Target Trek fails to provide the booked service.
                </p>
              </Section>

              <Section
                id="cancellation"
                number="13"
                title="Ebook Cancellation Policy"
                isDark={isDark}
              >
                <p>
                  Target Trek ebooks and downloadable
                  digital products may be processed and
                  delivered automatically
                  immediately after successful
                  payment.
                </p>

                <p>
                  Therefore, orders generally cannot
                  be cancelled after payment and
                  digital delivery or access.
                </p>

                <p>
                  An ebook cancellation request does not
                  itself create a refund entitlement.
                  Mock interview cancellations follow
                  the separate rules above.
                </p>
              </Section>

              {/* 13 */}

              <Section
                id="promotions"
                number="14"
                title="Sale, Coupon, and Discounted Purchases"
                isDark={isDark}
              >
                <p>
                  Ebooks purchased during a sale,
                  launch offer, coupon campaign,
                  promotional offer or discounted
                  period remain subject to this
                  Refund & Cancellation Policy.
                </p>

                <p>
                  A later increase or decrease in an
                  ebook's price does not create an
                  entitlement to a refund,
                  reimbursement or payment of the
                  price difference.
                </p>
              </Section>

              {/* 14 */}

              <Section
                id="updates"
                number="15"
                title="Book Updates and New Editions"
                isDark={isDark}
              >
                <p>
                  Target Trek may revise, improve or
                  release updated editions of its
                  ebooks and learning resources.
                </p>

                <p>
                  The release of a newer edition,
                  revised version, additional
                  material or differently priced
                  version does not make an earlier
                  valid purchase refundable.
                </p>
              </Section>

              {/* 15 */}

              <Section
                id="learning-outcomes"
                number="16"
                title="Interview and Learning Outcomes"
                isDark={isDark}
              >
                <p>
                  Target Trek ebooks are educational
                  resources. Purchasing or reading
                  an ebook does not guarantee:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Employment.",
                    "An internship.",
                    "An interview call.",
                    "Selection in an interview.",
                    "A particular examination result.",
                    "A particular salary or compensation.",
                    "A particular professional or educational outcome.",
                  ]}
                />

                <p>
                  Failure to achieve a particular
                  career, interview or educational
                  outcome is not a basis for a
                  refund.
                </p>
              </Section>

              {/* 16 */}

              <Section
                id="sharing"
                number="17"
                title="Unauthorized Sharing and Redistribution"
                isDark={isDark}
              >
                <p>
                  Target Trek ebooks are licensed
                  for personal use unless otherwise
                  expressly stated.
                </p>

                <p>
                  Customers must not unlawfully
                  resell, upload, publish,
                  redistribute or share paid ebooks,
                  downloadable files or protected
                  purchase links.
                </p>

                <p>
                  Refund requests connected with
                  fraudulent payment activity,
                  unauthorized redistribution or
                  abuse may be denied to the extent
                  permitted by applicable law.
                </p>
              </Section>

              {/* 17 */}

              <Section
                id="consumer-rights"
                number="18"
                title="Applicable Consumer Rights"
                isDark={isDark}
              >
                <p>
                  This page describes Target Trek's
                  standard commercial Refund &
                  Cancellation Policy for ebooks and
                  digital products.
                </p>

                <div
                  className={`rounded-2xl border p-5 ${
                    isDark
                      ? "border-orange-500/20 bg-orange-500/10"
                      : "border-orange-200 bg-orange-50"
                  }`}
                >
                  <p
                    className={`font-bold leading-7 ${
                      isDark
                        ? "text-orange-200"
                        : "text-[#34271f]"
                    }`}
                  >
                    Nothing in this policy is
                    intended to exclude, waive or
                    restrict a consumer right,
                    statutory remedy, refund,
                    replacement or other protection
                    that cannot legally be excluded
                    under applicable law.
                  </p>
                </div>

                <p>
                  If a mandatory legal requirement
                  conflicts with this policy, the
                  applicable mandatory requirement
                  will prevail to the extent of that
                  conflict.
                </p>
              </Section>

              {/* 18 */}

              <Section
                id="policy-changes"
                number="19"
                title="Changes to This Policy"
                isDark={isDark}
              >
                <p>
                  Target Trek may update this Refund
                  & Cancellation Policy from time to
                  time to reflect changes in our
                  products, payment processes,
                  support processes or applicable
                  requirements.
                </p>

                <p>
                  The latest version will be
                  published on this page together
                  with the updated "Last Updated"
                  date.
                </p>
              </Section>

              {/* 19 */}

              <Section
                id="support"
                number="20"
                title="Contact Target Trek Support"
                isDark={isDark}
              >
                <div
                  className={`rounded-2xl border p-6 ${
                    isDark
                      ? "border-orange-500/20 bg-orange-500/10"
                      : "border-orange-200 bg-orange-50"
                  }`}
                >
                  <Mail
                    size={28}
                    className="text-orange-500"
                  />

                  <h3
                    className={`mt-4 text-xl font-black ${
                      isDark
                        ? "text-white"
                        : "text-[#29201a]"
                    }`}
                  >
                    Ebook & Payment Support
                  </h3>

                  <p
                    className={`mt-3 leading-7 ${
                      isDark
                        ? "text-[#bca99b]"
                        : "text-[#77665b]"
                    }`}
                  >
                    For duplicate payments, payment
                    verification, missing ebook
                    access, incorrect files or other
                    purchase-related issues:
                  </p>

                  <div className="mt-5">
                    <p
                      className={`text-sm font-bold ${
                        isDark
                          ? "text-[#ddcfc3]"
                          : "text-[#665246]"
                      }`}
                    >
                      Support Email
                    </p>

                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="mt-1 block break-all font-black text-orange-500 underline decoration-orange-300 underline-offset-4"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </div>

                  <div className="mt-5">
                    <p
                      className={`text-sm font-bold ${
                        isDark
                          ? "text-[#ddcfc3]"
                          : "text-[#665246]"
                      }`}
                    >
                      General Enquiries
                    </p>

                    <a
                      href={`mailto:${GENERAL_EMAIL}`}
                      className="mt-1 block break-all font-bold text-orange-500"
                    >
                      {GENERAL_EMAIL}
                    </a>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <a
                      href={REFUND_MAILTO}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-700"
                    >
                      <ReceiptText size={17} />

                      Duplicate Payment Refund
                    </a>

                    <a
                      href={SUPPORT_MAILTO}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition ${
                        isDark
                          ? "border-[#584336] bg-[#211a15] text-white hover:bg-[#342820]"
                          : "border-[#f1dfd1] bg-white text-[#4d3b30] hover:bg-[#fffaf5]"
                      }`}
                    >
                      <HelpCircle size={17} />

                      General Purchase Support
                    </a>
                  </div>
                </div>
              </Section>
            </div>

            {/* =================================================
                FAQ
            ================================================= */}

            <section
              className={`mt-10 rounded-3xl border p-6 shadow-sm sm:p-10 ${
                isDark
                  ? "border-[#403027] bg-[#211a15]"
                  : "border-[#f1dfd1] bg-white"
              }`}
            >
              <div className="max-w-2xl">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
                  Frequently Asked Questions
                </span>

                <h2
                  className={`mt-3 text-2xl font-black tracking-tight sm:text-3xl ${
                    isDark
                      ? "text-white"
                      : "text-[#29201a]"
                  }`}
                >
                  Refund & Cancellation FAQs
                </h2>

                <p
                  className={`mt-3 leading-7 ${
                    isDark
                      ? "text-[#bca99b]"
                      : "text-[#77665b]"
                  }`}
                >
                  Common questions about Target Trek
                  ebook refunds and mock interview cancellations.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                {faqs.map(
                  (item, index) => (
                    <article
                      key={item.question}
                      className={`rounded-2xl border p-5 ${
                        isDark
                          ? "border-[#403027] bg-[#15110e]"
                          : "border-[#f1dfd1] bg-[#fffaf5]"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                            isDark
                              ? "bg-orange-500/10 text-orange-400"
                              : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          {index + 1}
                        </div>

                        <div>
                          <h3
                            className={`font-black ${
                              isDark
                                ? "text-white"
                                : "text-[#34271f]"
                            }`}
                          >
                            {item.question}
                          </h3>

                          <p
                            className={`mt-2 text-sm leading-7 ${
                              isDark
                                ? "text-[#bca99b]"
                                : "text-[#77665b]"
                            }`}
                          >
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            </section>

            {/* =================================================
                FOOTER NOTICE
            ================================================= */}

            <footer
              className={`mt-10 rounded-3xl border p-6 shadow-sm sm:p-8 ${
                isDark
                  ? "border-[#403027] bg-[#211a15]"
                  : "border-[#f1dfd1] bg-white"
              }`}
            >
              <div className="flex items-start gap-4">
                <CreditCard
                  size={22}
                  className="mt-1 shrink-0 text-orange-500"
                />

                <div>
                  <p
                    className={`text-sm leading-7 ${
                      isDark
                        ? "text-[#9e8b7e]"
                        : "text-[#9e8b7e]"
                    }`}
                  >
                    This Refund & Cancellation
                    Policy should be read together
                    with Target Trek's{" "}
                    <a
                      href="/terms-of-service"
                      className="font-semibold text-orange-500 hover:text-orange-600"
                    >
                      Terms & Conditions
                    </a>
                    ,{" "}
                    <a
                      href="/privacy-policy"
                      className="font-semibold text-orange-500 hover:text-orange-600"
                    >
                      Privacy Policy
                    </a>{" "}
                    and the product or mock interview information
                    shown at the time of booking or purchase.
                  </p>

                  <p
                    className={`mt-3 text-xs ${
                      isDark
                        ? "text-[#77665b]"
                        : "text-[#bca99b]"
                    }`}
                  >
                    Last updated: {LAST_UPDATED}
                  </p>
                </div>
              </div>
            </footer>
          </article>
        </div>
      </main>
    </div>
  );
};

export default RefundPolicy;