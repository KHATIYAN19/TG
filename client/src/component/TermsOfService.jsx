import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";

import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileCode2,
  HelpCircle,
  LockKeyhole,
  Mail,
  Phone,
  ReceiptText,
  RefreshCcw,
  Scale,
  ShieldCheck,
  UserRound,
} from "lucide-react";

/* ======================================================
   SITE
====================================================== */

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";

const CANONICAL_URL = `${SITE_URL}/terms-of-service`;

const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const GENERAL_EMAIL = "enquiry@targettrek.in";

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const LAST_UPDATED = "October 3, 2026";
const DATE_MODIFIED = "2026-10-03";

/* ======================================================
   SEO
====================================================== */

const SEO_TITLE =
  "Terms & Conditions for Ebooks & Digital Products | Target Trek";

const SEO_DESCRIPTION =
  "Read Target Trek's Terms & Conditions for ebooks and digital products, including digital delivery, payments, duplicate-payment refunds, personal-use licences, privacy, intellectual property and customer support.";

const SEO_KEYWORDS = [
  "Target Trek terms",
  "Target Trek terms and conditions",
  "Target Trek ebooks",
  "ebook terms and conditions",
  "digital product terms",
  "ebook refund policy",
  "duplicate payment refund",
  "ebook licence",
  "digital product licence",
  "Target Trek privacy",
  "Target Trek payment terms",
].join(", ");

/* ======================================================
   THEME
====================================================== */

const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = localStorage.getItem(THEME_KEY);

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return "light";
};

/* ======================================================
   ANIMATION
====================================================== */

const pageVariants = {
  initial: {
    opacity: 0,
    y: 14,
  },

  animate: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.4,
    },
  },

  exit: {
    opacity: 0,
    y: -14,

    transition: {
      duration: 0.25,
    },
  },
};

/* ======================================================
   QUICK LINKS
====================================================== */

const quickLinks = [
  {
    id: "digital-products",
    label: "Digital products",
  },
  {
    id: "payments",
    label: "Pricing & payments",
  },
  {
    id: "refund-policy",
    label: "Refund policy",
  },
  {
    id: "customer-information",
    label: "Customer information",
  },
  {
    id: "personal-use-licence",
    label: "Personal-use licence",
  },
  {
    id: "sharing-restrictions",
    label: "Sharing restrictions",
  },
  {
    id: "technical-content",
    label: "Technical content",
  },
  {
    id: "privacy",
    label: "Privacy",
  },
  {
    id: "governing-law",
    label: "Governing law",
  },
  {
    id: "ebook-support",
    label: "Ebook support",
  },
];

/* ======================================================
   FAQ
====================================================== */

const termsFaqs = [
  {
    question:
      "Are Target Trek ebook purchases refundable?",

    answer:
      "Target Trek ebooks and digital products are generally non-refundable. Under the standard Target Trek refund policy, a refund is available for a verified duplicate or double payment for the same intended purchase, except where another remedy is required by applicable law.",
  },

  {
    question:
      "What happens if I accidentally pay twice?",

    answer:
      "Contact Target Trek support with proof of both successful transactions. Once an unintended duplicate payment is verified, the duplicate amount will be processed for refund within seven calendar days to the original payment method.",
  },

  {
    question:
      "What if I do not receive my ebook?",

    answer:
      "Contact Target Trek support with your purchase details. We can verify your payment and assist by restoring access, providing the correct ebook, resending access information, or resolving the delivery issue.",
  },

  {
    question:
      "Can I share a Target Trek ebook with other people?",

    answer:
      "Unless specifically stated otherwise, Target Trek ebooks are licensed for the purchaser's personal use and must not be unlawfully resold, redistributed, publicly uploaded, or shared through unauthorized access links.",
  },

  {
    question:
      "Does Target Trek sell my personal data?",

    answer:
      "No. Target Trek does not sell, rent, or trade customer names, email addresses, mobile numbers, purchase information, or other personal data to unrelated third parties for their independent marketing purposes.",
  },
];

/* ======================================================
   SUPPORT EMAIL
====================================================== */

const SUPPORT_EMAIL_SUBJECT =
  "Ebook Purchase Support - Target Trek";

const SUPPORT_EMAIL_BODY = `Hello Target Trek Support,

I need help with my Target Trek purchase.

Full Name:
Email Address Used During Checkout:
Mobile Number:
Ebook / Product Name:
Order ID:
Transaction ID:

Issue:

Thank you.`;

const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  SUPPORT_EMAIL_SUBJECT
)}&body=${encodeURIComponent(SUPPORT_EMAIL_BODY)}`;

/* ======================================================
   COMPONENTS
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
          ? "border-slate-800"
          : "border-slate-100"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black sm:flex ${
            isDark
              ? "bg-blue-500/10 text-blue-400"
              : "bg-blue-50 text-blue-700"
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
                : "text-slate-950"
            }`}
          >
            <span className="mr-2 text-blue-600 sm:hidden">
              {number}.
            </span>

            {title}
          </h2>

          <div
            className={`mt-5 space-y-4 text-[15px] leading-7 sm:text-base sm:leading-8 ${
              isDark
                ? "text-slate-400"
                : "text-slate-600"
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
}) => (
  <ul className="space-y-3">
    {items.map((item, index) => (
      <li
        key={`${index}-${item}`}
        className="flex items-start gap-3"
      >
        <CheckCircle2
          size={17}
          className="mt-1.5 shrink-0 text-blue-500"
        />

        <span
          className={
            isDark
              ? "text-slate-400"
              : "text-slate-600"
          }
        >
          {item}
        </span>
      </li>
    ))}
  </ul>
);

/* ======================================================
   PAGE
====================================================== */

const TermsOfService = () => {
  const [theme, setTheme] =
    useState(getStoredTheme);

  const isDark = theme === "dark";

  /* ====================================================
     THEME SYNC
  ==================================================== */

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    const syncTheme = () => {
      setTheme(getStoredTheme());
    };

    const handleStorageChange = (event) => {
      if (event.key === THEME_KEY) {
        syncTheme();
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    window.addEventListener(
      THEME_EVENT,
      syncTheme
    );

    syncTheme();

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
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

          contactType:
            "customer support",

          email: SUPPORT_EMAIL,

          areaServed: "Worldwide",

          availableLanguage: [
            "English",
          ],
        },
      },

      {
        "@type": "WebSite",

        "@id": `${SITE_URL}/#website`,

        url: SITE_URL,

        name: SITE_NAME,

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

        about: [
          {
            "@type": "Thing",
            name: "Terms and Conditions",
          },

          {
            "@type": "Thing",
            name: "Digital Products",
          },

          {
            "@type": "Thing",
            name: "Ebook Purchases",
          },

          {
            "@type": "Thing",
            name: "Digital Product Licence",
          },
        ],
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
            name: "Terms & Conditions",
            item: CANONICAL_URL,
          },
        ],
      },

      {
        "@type": "FAQPage",

        mainEntity:
          termsFaqs.map(
            (faq) => ({
              "@type": "Question",

              name: faq.question,

              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })
          ),
      },
    ],
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`min-h-screen pt-16 transition-colors duration-300 md:pt-20 ${
        isDark
          ? "bg-slate-950 text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* =================================================
          SEO
      ================================================= */}

      <Helmet>
        <title>
          {SEO_TITLE}
        </title>

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

        <meta
          property="article:modified_time"
          content={DATE_MODIFIED}
        />

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

        <script
          type="application/ld+json"
        >
          {JSON.stringify(
            structuredData
          )}
        </script>
      </Helmet>

      <main>

        {/* =================================================
            HERO
        ================================================= */}

        <section
          className={`relative overflow-hidden border-b ${
            isDark
              ? "border-slate-800 bg-slate-950"
              : "border-slate-200 bg-white"
          }`}
        >
          <div
            className={`pointer-events-none absolute -right-48 -top-48 h-[500px] w-[500px] rounded-full blur-3xl ${
              isDark
                ? "bg-blue-500/10"
                : "bg-blue-100/70"
            }`}
          />

          <div
            className={`pointer-events-none absolute -left-32 bottom-0 h-[330px] w-[330px] rounded-full blur-3xl ${
              isDark
                ? "bg-indigo-500/5"
                : "bg-indigo-100/50"
            }`}
          />

          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">

            <nav
              aria-label="Breadcrumb"
              className={`mb-8 flex items-center gap-2 text-xs font-semibold ${
                isDark
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              <a
                href="/"
                className="transition hover:text-blue-500"
              >
                Home
              </a>

              <span>/</span>

              <span
                className={
                  isDark
                    ? "text-slate-300"
                    : "text-slate-600"
                }
              >
                Terms & Conditions
              </span>
            </nav>

            <div className="max-w-4xl">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${
                  isDark
                    ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
                    : "border-blue-100 bg-blue-50 text-blue-700"
                }`}
              >
                <Scale size={15} />

                Target Trek Terms
              </div>

              <h1
                className={`mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl ${
                  isDark
                    ? "text-white"
                    : "text-slate-950"
                }`}
              >
                Terms & Conditions
              </h1>

              <p
                className={`mt-6 max-w-3xl text-base leading-8 sm:text-lg ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                These Terms & Conditions
                govern your use of Target
                Trek and your purchase,
                access, download and use of
                our ebooks, technical
                learning resources and other
                digital educational products.
              </p>

              <div
                className={`mt-6 max-w-3xl rounded-2xl border p-5 ${
                  isDark
                    ? "border-blue-500/20 bg-blue-500/10"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <p
                  className={`font-bold leading-7 ${
                    isDark
                      ? "text-blue-200"
                      : "text-blue-900"
                  }`}
                >
                  Target Trek primarily sells
                  digital products. Please review
                  the product description, price,
                  format, refund policy and these
                  Terms before completing a
                  purchase.
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {[
                  `Last updated: ${LAST_UPDATED}`,
                  "Digital Products",
                  "Personal Use",
                  "Indian Law",
                ].map((item) => (
                  <span
                    key={item}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                      isDark
                        ? "border-slate-800 bg-slate-900 text-slate-400"
                        : "border-slate-200 bg-white text-slate-600 shadow-sm"
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <section
          className={`border-b ${
            isDark
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-7 sm:grid-cols-3 sm:px-6 lg:px-8">

            <div
              className={`rounded-2xl border p-5 ${
                isDark
                  ? "border-slate-800 bg-slate-950"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <BookOpen
                size={22}
                className="text-blue-500"
              />

              <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-blue-600">
                Digital Products
              </p>

              <p
                className={`mt-2 text-sm font-bold leading-6 ${
                  isDark
                    ? "text-slate-200"
                    : "text-slate-800"
                }`}
              >
                Target Trek products are
                primarily digital ebooks and
                educational resources.
              </p>
            </div>

            <div
              className={`rounded-2xl border p-5 ${
                isDark
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <RefreshCcw
                size={22}
                className="text-emerald-500"
              />

              <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-emerald-600">
                Refunds
              </p>

              <p
                className={`mt-2 text-sm font-bold leading-6 ${
                  isDark
                    ? "text-slate-200"
                    : "text-slate-800"
                }`}
              >
                Standard refunds apply only
                to verified duplicate payments,
                subject to applicable law.
              </p>
            </div>

            <div
              className={`rounded-2xl border p-5 ${
                isDark
                  ? "border-violet-500/20 bg-violet-500/5"
                  : "border-violet-200 bg-violet-50"
              }`}
            >
              <ShieldCheck
                size={22}
                className="text-violet-500"
              />

              <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-violet-600">
                Personal Use
              </p>

              <p
                className={`mt-2 text-sm font-bold leading-6 ${
                  isDark
                    ? "text-slate-200"
                    : "text-slate-800"
                }`}
              >
                Paid ebooks are generally
                licensed to the purchaser for
                personal use only.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            LAYOUT
        ================================================= */}

        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8 lg:py-14">

          {/* SIDEBAR */}

          <aside className="hidden lg:block">
            <div
              className={`sticky top-28 rounded-2xl border p-5 shadow-sm ${
                isDark
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <p
                className={`text-xs font-black uppercase tracking-[0.16em] ${
                  isDark
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              >
                Quick Navigation
              </p>

              <nav
                aria-label="Terms quick navigation"
                className="mt-4 space-y-1"
              >
                {quickLinks.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                      isDark
                        ? "text-slate-400 hover:bg-blue-500/10 hover:text-blue-400"
                        : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div
                className={`mt-6 border-t pt-5 ${
                  isDark
                    ? "border-slate-800"
                    : "border-slate-100"
                }`}
              >
                <p className="text-xs leading-5 text-slate-500">
                  Need purchase support?
                </p>

                <a
                  href={SUPPORT_MAILTO}
                  className="mt-2 block break-all text-xs font-bold text-blue-500 hover:text-blue-600"
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          </aside>

          {/* ARTICLE */}

          <article className="min-w-0">

            {/* DIGITAL NOTICE */}

            <section
              id="digital-products"
              className={`scroll-mt-28 rounded-3xl border p-6 sm:p-8 ${
                isDark
                  ? "border-amber-500/20 bg-amber-500/5"
                  : "border-amber-200 bg-amber-50"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                    isDark
                      ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                      : "border-amber-200 bg-white text-amber-600"
                  }`}
                >
                  <AlertTriangle size={21} />
                </div>

                <div>
                  <h2
                    className={`text-xl font-black ${
                      isDark
                        ? "text-white"
                        : "text-slate-950"
                    }`}
                  >
                    Important Digital Product Notice
                  </h2>

                  <p
                    className={`mt-3 leading-7 ${
                      isDark
                        ? "text-slate-400"
                        : "text-slate-700"
                    }`}
                  >
                    Target Trek primarily sells
                    digital educational products
                    and ebooks. Access may be
                    provided immediately after a
                    successful payment.
                  </p>

                  <p
                    className={`mt-3 leading-7 ${
                      isDark
                        ? "text-slate-400"
                        : "text-slate-700"
                    }`}
                  >
                    Digital products cannot
                    ordinarily be returned after
                    they have been delivered,
                    accessed, saved or downloaded.
                    Therefore, purchases are
                    generally final and
                    non-refundable.
                  </p>

                  <p
                    className={`mt-3 font-bold leading-7 ${
                      isDark
                        ? "text-amber-200"
                        : "text-amber-900"
                    }`}
                  >
                    Under Target Trek's standard
                    policy, refunds are available
                    only for verified duplicate
                    payments for the same intended
                    purchase, except where another
                    remedy is required by applicable
                    law.
                  </p>
                </div>
              </div>
            </section>

            {/* TERMS */}

            <div
              className={`mt-10 space-y-10 rounded-3xl border p-6 shadow-sm sm:p-10 ${
                isDark
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >

              {/* 1 */}

              <Section
                id="acceptance"
                number="1"
                title="Acceptance of Terms"
                isDark={isDark}
              >
                <p>
                  By accessing Target Trek,
                  purchasing an ebook,
                  downloading digital material,
                  accessing paid content or
                  otherwise using the website,
                  you agree to these Terms &
                  Conditions.
                </p>

                <p>
                  If you do not agree with these
                  Terms, you should not purchase
                  or use Target Trek products.
                </p>

                <p>
                  These Terms should be read
                  together with our{" "}
                  <a
                    href="/privacy-policy"
                    className="font-bold text-blue-500 hover:text-blue-600"
                  >
                    Privacy Policy
                  </a>
                  ,{" "}
                  <a
                    href="/refund-policy"
                    className="font-bold text-blue-500 hover:text-blue-600"
                  >
                    Refund & Cancellation Policy
                  </a>{" "}
                  and any product-specific terms
                  shown before purchase.
                </p>
              </Section>

              {/* 2 */}

              <Section
                id="about-target-trek"
                number="2"
                title="About Target Trek"
                isDark={isDark}
              >
                <p>
                  Target Trek provides digital
                  educational resources including
                  developer ebooks, technical
                  guides, interview preparation
                  materials and software
                  engineering learning resources.
                </p>

                <p>
                  Topics may include System
                  Design, Low-Level Design,
                  Backend Engineering, Generative
                  AI, RAG, MCP, Google ADK,
                  AI Agents and related technical
                  subjects.
                </p>

                <p>
                  Product availability, pricing,
                  content, edition and features
                  may change from time to time.
                </p>
              </Section>

              {/* 3 */}

              <Section
                id="delivery"
                number="3"
                title="Digital Products and Ebook Delivery"
                isDark={isDark}
              >
                <p>
                  Unless specifically stated
                  otherwise, Target Trek products
                  are digital and no physical book
                  or physical product will be
                  shipped.
                </p>

                <p>
                  After a successful payment,
                  digital access may be provided
                  through:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "A PDF or another downloadable digital file.",
                    "A browser-based ebook or document viewer.",
                    "A secure or purchase-specific access page.",
                    "A temporary or secure download link.",
                    "An email containing purchase or access information.",
                    "Another digital delivery mechanism described during purchase.",
                  ]}
                />

                <p>
                  Delivery may depend on successful
                  confirmation of payment by the
                  applicable payment provider.
                </p>
              </Section>

              {/* 4 */}

              <Section
                id="payments"
                number="4"
                title="Pricing and Payments"
                isDark={isDark}
              >
                <p>
                  The applicable product price is
                  displayed on the product or
                  checkout page before purchase.
                </p>

                <p>
                  Prices, discounts, coupon offers
                  and promotional pricing may
                  change from time to time.
                </p>

                <p>
                  A future price change does not
                  generally affect a purchase that
                  has already been successfully
                  completed.
                </p>

                <div
                  className={`rounded-2xl border p-5 ${
                    isDark
                      ? "border-blue-500/20 bg-blue-500/10"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <CreditCard
                      size={21}
                      className="mt-1 shrink-0 text-blue-500"
                    />

                    <p
                      className={`font-bold leading-7 ${
                        isDark
                          ? "text-blue-200"
                          : "text-slate-900"
                      }`}
                    >
                      Payments may be processed
                      through third-party payment
                      providers. The payment
                      provider may process
                      information necessary to
                      complete, verify or reconcile
                      the transaction.
                    </p>
                  </div>
                </div>

                <p>
                  Depending on the provider and
                  payment method, this may include:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Your name.",
                    "Your email address.",
                    "Your mobile number.",
                    "Order or transaction reference.",
                    "Transaction amount and currency.",
                    "Payment status.",
                    "Other limited information necessary to process or verify the transaction.",
                  ]}
                />

                <div
                  className={`rounded-2xl border p-5 ${
                    isDark
                      ? "border-red-500/20 bg-red-500/10"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <p
                    className={`font-bold ${
                      isDark
                        ? "text-red-200"
                        : "text-slate-900"
                    }`}
                  >
                    Never send Target Trek your
                    UPI PIN, OTP, CVV, banking
                    password or complete card
                    credentials by email.
                  </p>
                </div>
              </Section>

              {/* 5 */}

              <Section
                id="refund-policy"
                number="5"
                title="Refund & Cancellation Policy"
                isDark={isDark}
              >
                <div
                  className={`rounded-2xl border p-5 ${
                    isDark
                      ? "border-red-500/20 bg-red-500/10"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <p
                    className={`font-bold leading-7 ${
                      isDark
                        ? "text-red-200"
                        : "text-slate-900"
                    }`}
                  >
                    Ebook and digital-product
                    purchases are generally final,
                    non-returnable and
                    non-refundable once successfully
                    purchased or delivered.
                  </p>
                </div>

                <p>
                  Under Target Trek's standard
                  refund policy, a refund is
                  available only when an unintended
                  duplicate or double payment has
                  been successfully received for
                  the same intended purchase.
                </p>

                <p>
                  If a duplicate payment is
                  confirmed:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "The original valid transaction remains the payment for the purchased product.",
                    "The unintended duplicate amount will be eligible for refund.",
                    "The refund will be processed and initiated within seven calendar days after verification.",
                    "The refund will be returned to the original payment method whenever supported by the applicable payment provider.",
                  ]}
                />

                <div
                  className={`rounded-2xl border p-5 ${
                    isDark
                      ? "border-violet-500/20 bg-violet-500/10"
                      : "border-violet-200 bg-violet-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Clock3
                      size={21}
                      className="mt-1 shrink-0 text-violet-500"
                    />

                    <p
                      className={`font-bold leading-7 ${
                        isDark
                          ? "text-violet-200"
                          : "text-violet-900"
                      }`}
                    >
                      Target Trek will initiate a
                      verified duplicate-payment
                      refund within 7 calendar days.
                      Your bank or payment provider
                      may take additional time to
                      reflect the amount after the
                      refund has been initiated.
                    </p>
                  </div>
                </div>

                <p>
                  Change of mind, accidental
                  purchase, finding similar
                  information elsewhere, a later
                  price change or failure to
                  achieve a desired interview or
                  career outcome does not create a
                  standard refund entitlement.
                </p>

                <p>
                  Nothing in these Terms is intended
                  to exclude or restrict a remedy
                  that cannot legally be excluded
                  under applicable law.
                </p>

                <a
                  href="/refund-policy"
                  className="inline-flex font-bold text-blue-500 transition hover:text-blue-600"
                >
                  Read Refund & Cancellation Policy →
                </a>
              </Section>

              {/* 6 */}

              <Section
                id="delivery-support"
                number="6"
                title="Missing, Incorrect, or Inaccessible Ebook"
                isDark={isDark}
              >
                <p>
                  If a successful payment is
                  confirmed but you cannot access
                  your ebook, or if the delivered
                  file is incorrect or corrupted,
                  please contact Target Trek
                  support.
                </p>

                <p>
                  Depending on the issue, we may:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Verify your successful payment.",
                    "Restore ebook access.",
                    "Provide a new download link.",
                    "Provide the correct purchased ebook.",
                    "Replace a corrupted or inaccessible file.",
                    "Resolve the underlying delivery problem where reasonably possible.",
                  ]}
                />

                <p>
                  These issues are normally handled
                  as product delivery or support
                  matters and do not, by themselves,
                  qualify for a refund under the
                  standard duplicate-payment
                  refund policy.
                </p>
              </Section>

              {/* 7 */}

              <Section
                id="customer-information"
                number="7"
                title="Customer Information and Responsibilities"
                isDark={isDark}
              >
                <p>
                  When purchasing a Target Trek
                  product, you agree to provide
                  reasonably accurate information
                  where requested.
                </p>

                <p>
                  This may include:
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      icon: UserRound,
                      title: "Name",
                      text: "Your name as provided during checkout.",
                    },
                    {
                      icon: Mail,
                      title: "Email Address",
                      text: "A valid email address associated with your purchase.",
                    },
                    {
                      icon: Phone,
                      title: "Mobile Number",
                      text: "A valid mobile number where requested during checkout.",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className={`rounded-2xl border p-5 ${
                          isDark
                            ? "border-slate-800 bg-slate-950"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <Icon
                          size={21}
                          className="text-blue-500"
                        />

                        <h3
                          className={`mt-4 font-black ${
                            isDark
                              ? "text-white"
                              : "text-slate-900"
                          }`}
                        >
                          {item.title}
                        </h3>

                        <p
                          className={`mt-2 text-sm leading-6 ${
                            isDark
                              ? "text-slate-400"
                              : "text-slate-600"
                          }`}
                        >
                          {item.text}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <p>
                  You are also responsible for:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Reviewing the product description before purchasing.",
                    "Providing accurate checkout information.",
                    "Keeping purchase-specific access links reasonably secure.",
                    "Saving or downloading your ebook where the delivery instructions recommend doing so.",
                    "Using the purchased product in accordance with these Terms.",
                  ]}
                />

                <p>
                  Target Trek may not be able to
                  correctly identify or deliver an
                  order where materially incorrect
                  customer information is provided.
                </p>
              </Section>

              {/* 8 */}

              <Section
                id="personal-use-licence"
                number="8"
                title="Personal-Use Licence"
                isDark={isDark}
              >
                <p>
                  Unless expressly stated
                  otherwise on the applicable
                  product page, purchasing a Target
                  Trek ebook gives the purchaser a{" "}
                  <strong
                    className={
                      isDark
                        ? "text-white"
                        : "text-slate-900"
                    }
                  >
                    limited, non-exclusive,
                    non-transferable licence for
                    personal use
                  </strong>
                  .
                </p>

                <p>
                  Purchasing an ebook does not
                  transfer ownership of Target
                  Trek's copyright, branding,
                  diagrams, source material,
                  written content or other
                  intellectual property.
                </p>
              </Section>

              {/* 9 */}

              <Section
                id="sharing-restrictions"
                number="9"
                title="Prohibited Sharing and Redistribution"
                isDark={isDark}
              >
                <p>
                  Unless expressly authorized by
                  Target Trek or permitted by
                  applicable law, you must not:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Resell a Target Trek ebook.",
                    "Upload a paid ebook to a public website, cloud folder, messaging group, repository, torrent, or file-sharing service.",
                    "Share purchase-specific access or download links with unauthorized users.",
                    "Commercially reproduce or distribute substantial portions of a paid ebook.",
                    "Remove copyright or proprietary notices from a product.",
                    "Present Target Trek paid material as your own commercial product.",
                    "Sell, sublicense, rent or commercially redistribute purchased ebooks without authorization.",
                  ]}
                />

                <p>
                  Target Trek may take reasonable
                  measures to protect its digital
                  products and intellectual
                  property where unauthorized
                  redistribution or abuse is
                  detected.
                </p>
              </Section>

              {/* 10 */}

              <Section
                id="intellectual-property"
                number="10"
                title="Intellectual Property"
                isDark={isDark}
              >
                <p>
                  Unless otherwise stated, Target
                  Trek owns or licenses the
                  applicable content made available
                  through its website and digital
                  products.
                </p>

                <p>
                  This may include:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Written educational material.",
                    "Original diagrams and illustrations.",
                    "Book layouts.",
                    "Website content and design.",
                    "Original code examples and explanations.",
                    "Target Trek branding.",
                    "Other proprietary learning material.",
                  ]}
                />

                <p>
                  Third-party names, technologies,
                  trademarks, products and services
                  referenced for educational
                  purposes remain the property of
                  their respective owners.
                </p>
              </Section>

              {/* 11 */}

              <Section
                id="educational-purpose"
                number="11"
                title="Educational and Informational Purpose"
                isDark={isDark}
              >
                <p>
                  Target Trek ebooks and technical
                  resources are provided primarily
                  for educational and informational
                  purposes.
                </p>

                <p>
                  Technology, APIs, libraries,
                  cloud services, prices,
                  documentation and industry
                  practices can change over time.
                </p>

                <p>
                  Information important to a
                  production, security, financial
                  or other critical decision should
                  be independently verified against
                  appropriate current authoritative
                  documentation.
                </p>
              </Section>

              {/* 12 */}

              <Section
                id="no-career-guarantee"
                number="12"
                title="No Interview, Employment, or Career Guarantee"
                isDark={isDark}
              >
                <p>
                  Purchasing or using a Target Trek
                  ebook does not guarantee:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "A job or internship.",
                    "An interview call.",
                    "Selection in an interview.",
                    "A particular salary.",
                    "Admission to a company or educational institution.",
                    "A particular examination result.",
                    "Any specific career or professional outcome.",
                  ]}
                />

                <p>
                  Learning and career outcomes
                  depend on many factors including
                  individual preparation,
                  experience, practice and
                  circumstances.
                </p>
              </Section>

              {/* 13 */}

              <Section
                id="technical-content"
                number="13"
                title="Technical Content and Code Examples"
                isDark={isDark}
              >
                <div
                  className={`rounded-2xl border p-5 ${
                    isDark
                      ? "border-blue-500/20 bg-blue-500/10"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <FileCode2
                      size={21}
                      className="mt-1 shrink-0 text-blue-500"
                    />

                    <p
                      className={`font-bold leading-7 ${
                        isDark
                          ? "text-blue-200"
                          : "text-blue-900"
                      }`}
                    >
                      Code snippets, architecture
                      examples, commands,
                      configurations and system
                      designs are primarily
                      provided for learning and
                      demonstration.
                    </p>
                  </div>
                </div>

                <p>
                  Before using examples in a
                  production environment, you
                  should independently review and
                  test them for:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Security.",
                    "Correctness.",
                    "Scalability.",
                    "Compatibility.",
                    "Licensing.",
                    "Reliability.",
                    "Suitability for your specific requirements.",
                  ]}
                />
              </Section>

              {/* 14 */}

              <Section
                id="product-updates"
                number="14"
                title="Product Updates and Editions"
                isDark={isDark}
              >
                <p>
                  Target Trek may periodically
                  update, revise, correct, expand
                  or release new editions of its
                  ebooks and digital products.
                </p>

                <p>
                  Purchasing one edition does not
                  automatically guarantee access
                  to every future edition, course,
                  replacement product or separately
                  released resource unless that
                  benefit was expressly included
                  with the purchase.
                </p>
              </Section>

              {/* 15 */}

              <Section
                id="website-availability"
                number="15"
                title="Website and Digital Delivery Availability"
                isDark={isDark}
              >
                <p>
                  Target Trek aims to keep its
                  website and digital-delivery
                  systems reasonably available.
                  Temporary interruptions may
                  nevertheless occur because of:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Maintenance.",
                    "Hosting outages.",
                    "Network failures.",
                    "Payment-provider outages.",
                    "Security incidents.",
                    "Software deployments or updates.",
                    "Events outside our reasonable control.",
                  ]}
                />

                <p>
                  We do not guarantee uninterrupted
                  availability of every website
                  feature at all times.
                </p>
              </Section>

              {/* 16 */}

              <Section
                id="unauthorized-access"
                number="16"
                title="Unauthorized Access and Abuse"
                isDark={isDark}
              >
                <p>
                  You must not attempt to:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Bypass payment or paid-product access controls.",
                    "Obtain paid material without authorization.",
                    "Manipulate payment callbacks, order IDs, access tokens or download URLs.",
                    "Probe or exploit vulnerabilities in Target Trek systems.",
                    "Interfere with normal website operation or security.",
                    "Use automated systems to improperly scrape, overload or abuse protected services.",
                  ]}
                />
              </Section>

              {/* 17 */}

              <Section
                id="third-party-services"
                number="17"
                title="Third-Party Services"
                isDark={isDark}
              >
                <p>
                  Target Trek may rely on third-party
                  providers for:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Payment processing.",
                    "Website hosting.",
                    "Cloud infrastructure.",
                    "Database services.",
                    "Email delivery.",
                    "File or document hosting.",
                    "Security and technical functionality.",
                  ]}
                />

                <p>
                  Independent third-party providers
                  operate under their respective
                  terms and privacy practices, and
                  some aspects of their service may
                  be outside Target Trek's direct
                  control.
                </p>
              </Section>

              {/* 18 */}

              <Section
                id="warranties"
                number="18"
                title="Disclaimer of Warranties"
                isDark={isDark}
              >
                <p>
                  To the extent permitted by
                  applicable law, the Target Trek
                  website and digital educational
                  products are provided on an{" "}
                  <strong
                    className={
                      isDark
                        ? "text-white"
                        : "text-slate-900"
                    }
                  >
                    "as available"
                  </strong>{" "}
                  basis.
                </p>

                <p>
                  While we aim to provide useful
                  and carefully prepared material,
                  we do not guarantee that every
                  item of technical content will
                  remain complete, current,
                  error-free or suitable for every
                  user's individual purpose.
                </p>

                <p>
                  Nothing in this section excludes
                  a warranty, guarantee or right
                  that cannot legally be excluded.
                </p>
              </Section>

              {/* 19 */}

              <Section
                id="liability"
                number="19"
                title="Limitation of Liability"
                isDark={isDark}
              >
                <p>
                  To the extent permitted by
                  applicable law, Target Trek will
                  not be responsible for indirect,
                  incidental, special or
                  consequential losses arising
                  solely from the use of its website
                  or educational digital products.
                </p>

                <p>
                  Where liability cannot lawfully
                  be excluded, any limitation will
                  apply only to the maximum extent
                  permitted by applicable law.
                </p>

                <p>
                  Nothing in these Terms excludes
                  liability where doing so would
                  be prohibited by law.
                </p>
              </Section>

              {/* 20 */}

              <Section
                id="suspension"
                number="20"
                title="Suspension of Protected Access"
                isDark={isDark}
              >
                <p>
                  Target Trek may restrict or
                  suspend protected digital access
                  where reasonably necessary to
                  address:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Fraudulent transactions.",
                    "Unauthorized ebook redistribution.",
                    "Security threats.",
                    "Abuse of access controls.",
                    "Material violations of these Terms.",
                  ]}
                />

                <p>
                  Legitimate purchase or access
                  problems can be raised with our
                  support team.
                </p>
              </Section>

              {/* 21 */}

              <Section
                id="privacy"
                number="21"
                title="Privacy and Customer Information"
                isDark={isDark}
              >
                <p>
                  Information provided when using
                  Target Trek or completing a
                  purchase is handled in accordance
                  with our{" "}
                  <a
                    href="/privacy-policy"
                    className="font-bold text-blue-500 hover:text-blue-600"
                  >
                    Privacy Policy
                  </a>
                  .
                </p>

                <p>
                  Information we may process can
                  include:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Your name.",
                    "Your email address.",
                    "Your mobile number.",
                    "The product purchased.",
                    "Order and transaction references.",
                    "Payment status and amount.",
                    "Information voluntarily provided to customer support.",
                  ]}
                />

                <div
                  className={`rounded-2xl border p-5 ${
                    isDark
                      ? "border-emerald-500/20 bg-emerald-500/10"
                      : "border-emerald-200 bg-emerald-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <LockKeyhole
                      size={21}
                      className="mt-1 shrink-0 text-emerald-500"
                    />

                    <div>
                      <p
                        className={`font-black ${
                          isDark
                            ? "text-emerald-200"
                            : "text-emerald-900"
                        }`}
                      >
                        We do not sell your personal data.
                      </p>

                      <p
                        className={`mt-2 text-sm leading-7 ${
                          isDark
                            ? "text-emerald-200/80"
                            : "text-emerald-800"
                        }`}
                      >
                        Target Trek does not sell,
                        rent or trade customer
                        names, email addresses,
                        mobile numbers, purchase
                        history or similar personal
                        information to data brokers,
                        advertisers or unrelated
                        third parties for their
                        independent marketing.
                      </p>
                    </div>
                  </div>
                </div>

                <p>
                  Limited information may be
                  processed by payment, hosting,
                  infrastructure or communication
                  providers where reasonably
                  necessary to complete a payment,
                  operate the website, deliver the
                  purchased product or provide
                  support.
                </p>
              </Section>

              {/* 22 */}

              <Section
                id="changes"
                number="22"
                title="Changes to These Terms"
                isDark={isDark}
              >
                <p>
                  Target Trek may update these
                  Terms from time to time to reflect
                  changes to products, payment
                  processes, technology, business
                  practices or applicable
                  requirements.
                </p>

                <p>
                  The updated Terms will be
                  published on this page and the
                  Last Updated date may be revised.
                </p>
              </Section>

              {/* 23 */}

              <Section
                id="governing-law"
                number="23"
                title="Governing Law"
                isDark={isDark}
              >
                <p>
                  These Terms are governed by the
                  applicable laws of{" "}
                  <strong
                    className={
                      isDark
                        ? "text-white"
                        : "text-slate-900"
                    }
                  >
                    India
                  </strong>
                  , subject to any mandatory
                  consumer protection or other
                  rights that may apply.
                </p>

                <p>
                  If a purchase or product-related
                  dispute arises, we encourage
                  customers to contact Target Trek
                  support first so that the matter
                  can be reviewed and, where
                  possible, resolved.
                </p>
              </Section>

              {/* 24 */}

              <Section
                id="severability"
                number="24"
                title="Severability"
                isDark={isDark}
              >
                <p>
                  If any provision of these Terms
                  is found to be invalid, unlawful
                  or unenforceable, the remaining
                  provisions will continue to apply
                  to the extent permitted by law.
                </p>
              </Section>

              {/* 25 */}

              <Section
                id="ebook-support"
                number="25"
                title="Target Trek Ebook & Payment Support"
                isDark={isDark}
              >
                <div
                  className={`rounded-2xl border p-6 ${
                    isDark
                      ? "border-blue-500/20 bg-blue-500/10"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <Mail
                    size={28}
                    className="text-blue-500"
                  />

                  <h3
                    className={`mt-4 text-xl font-black ${
                      isDark
                        ? "text-white"
                        : "text-slate-950"
                    }`}
                  >
                    Need Help With Your Purchase?
                  </h3>

                  <p
                    className={`mt-3 leading-7 ${
                      isDark
                        ? "text-slate-400"
                        : "text-slate-600"
                    }`}
                  >
                    Contact Target Trek for ebook
                    access, payment verification,
                    duplicate payment, incorrect
                    file, corrupted download or
                    another purchase-related issue.
                  </p>

                  <div className="mt-5">
                    <p
                      className={`text-sm font-bold ${
                        isDark
                          ? "text-slate-300"
                          : "text-slate-700"
                      }`}
                    >
                      Ebook & Payment Support
                    </p>

                    <a
                      href={SUPPORT_MAILTO}
                      className="mt-1 block break-all font-black text-blue-500 underline decoration-blue-300 underline-offset-4"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </div>

                  <div className="mt-5">
                    <p
                      className={`text-sm font-bold ${
                        isDark
                          ? "text-slate-300"
                          : "text-slate-700"
                      }`}
                    >
                      General Enquiries
                    </p>

                    <a
                      href={`mailto:${GENERAL_EMAIL}`}
                      className="mt-1 block break-all font-bold text-blue-500"
                    >
                      {GENERAL_EMAIL}
                    </a>
                  </div>

                  <div
                    className={`mt-6 rounded-2xl border p-5 ${
                      isDark
                        ? "border-slate-700 bg-slate-900"
                        : "border-blue-100 bg-white"
                    }`}
                  >
                    <p
                      className={`text-sm font-bold ${
                        isDark
                          ? "text-slate-300"
                          : "text-slate-700"
                      }`}
                    >
                      When contacting us about a
                      purchase, include where
                      available:
                    </p>

                    <div className="mt-4">
                      <BulletList
                        isDark={isDark}
                        items={[
                          "Your name.",
                          "Email address used during checkout.",
                          "Mobile number used during checkout.",
                          "Ebook or product name.",
                          "Order ID.",
                          "Transaction or payment reference.",
                          "A clear description of the issue.",
                        ]}
                      />
                    </div>
                  </div>

                  <div
                    className={`mt-5 rounded-xl border p-4 ${
                      isDark
                        ? "border-red-500/20 bg-red-500/5"
                        : "border-red-100 bg-red-50"
                    }`}
                  >
                    <p
                      className={`text-sm font-bold leading-6 ${
                        isDark
                          ? "text-red-300"
                          : "text-red-800"
                      }`}
                    >
                      Never send your OTP, UPI PIN,
                      CVV, banking password or
                      complete debit/credit card
                      information by email.
                    </p>
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
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Terms FAQs
              </span>

              <h2
                className={`mt-3 text-2xl font-black tracking-tight sm:text-3xl ${
                  isDark
                    ? "text-white"
                    : "text-slate-950"
                }`}
              >
                Common Questions
              </h2>

              <div className="mt-8 space-y-4">
                {termsFaqs.map(
                  (item, index) => (
                    <article
                      key={item.question}
                      className={`rounded-2xl border p-5 ${
                        isDark
                          ? "border-slate-800 bg-slate-950"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                            isDark
                              ? "bg-blue-500/10 text-blue-400"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {index + 1}
                        </div>

                        <div>
                          <h3
                            className={`font-black ${
                              isDark
                                ? "text-white"
                                : "text-slate-900"
                            }`}
                          >
                            {item.question}
                          </h3>

                          <p
                            className={`mt-2 text-sm leading-7 ${
                              isDark
                                ? "text-slate-400"
                                : "text-slate-600"
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
                FOOTER
            ================================================= */}

            <footer
              className={`mt-10 rounded-3xl border p-6 shadow-sm sm:p-8 ${
                isDark
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start gap-4">
                <ReceiptText
                  size={21}
                  className="mt-1 shrink-0 text-blue-500"
                />

                <div>
                  <p
                    className={`text-sm leading-7 ${
                      isDark
                        ? "text-slate-500"
                        : "text-slate-500"
                    }`}
                  >
                    By purchasing or accessing a
                    Target Trek digital product,
                    you acknowledge that you had
                    an opportunity to review these
                    Terms & Conditions, the{" "}
                    <a
                      href="/privacy-policy"
                      className="font-semibold text-blue-500 hover:text-blue-600"
                    >
                      Privacy Policy
                    </a>
                    , the{" "}
                    <a
                      href="/refund-policy"
                      className="font-semibold text-blue-500 hover:text-blue-600"
                    >
                      Refund & Cancellation Policy
                    </a>{" "}
                    and the applicable product
                    information before completing
                    the purchase.
                  </p>

                  <div
                    className={`mt-6 flex flex-col gap-3 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between ${
                      isDark
                        ? "border-slate-800 text-slate-600"
                        : "border-slate-100 text-slate-400"
                    }`}
                  >
                    <p>
                      ©{" "}
                      {new Date().getFullYear()}{" "}
                      <strong
                        className={
                          isDark
                            ? "font-semibold text-slate-400"
                            : "font-semibold text-slate-600"
                        }
                      >
                        Target Trek
                      </strong>
                      . All rights reserved.
                    </p>

                    <a
                      href={SUPPORT_MAILTO}
                      className="font-semibold text-blue-500 hover:text-blue-600"
                    >
                      Contact Support
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </article>
        </div>
      </main>
    </motion.div>
  );
};

export default TermsOfService;