import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";

import {
  CheckCircle2,
  CreditCard,
  Eye,
  HelpCircle,
  LockKeyhole,
  Mail,
  Phone,
  ReceiptText,
  ShieldCheck,
  UserRound,
} from "lucide-react";

/* ======================================================
   SITE
====================================================== */

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";

const CANONICAL_URL = `${SITE_URL}/privacy-policy`;

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
  "Privacy Policy for Ebooks & Digital Products | Target Trek";

const SEO_DESCRIPTION =
  "Read Target Trek's Privacy Policy. Learn how we collect and use your name, email address, mobile number and purchase information, how payments are processed, and how we protect your privacy. We do not sell your personal data.";

const SEO_KEYWORDS = [
  "Target Trek privacy policy",
  "Target Trek data privacy",
  "ebook privacy policy",
  "digital product privacy policy",
  "Target Trek payment privacy",
  "personal data privacy",
  "payment gateway privacy",
  "ebook customer privacy",
  "Target Trek ebooks",
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
   MOTION
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
    id: "information-we-collect",
    label: "Information we collect",
  },
  {
    id: "how-we-use-information",
    label: "How we use information",
  },
  {
    id: "payments",
    label: "Payment processing",
  },
  {
    id: "sharing",
    label: "How information is shared",
  },
  {
    id: "no-selling",
    label: "We do not sell your data",
  },
  {
    id: "cookies",
    label: "Cookies & local storage",
  },
  {
    id: "security",
    label: "Data security",
  },
  {
    id: "retention",
    label: "Data retention",
  },
  {
    id: "privacy-rights",
    label: "Your privacy rights",
  },
  {
    id: "privacy-contact",
    label: "Privacy contact",
  },
];

/* ======================================================
   FAQ
====================================================== */

const privacyFaqs = [
  {
    question:
      "Does Target Trek sell my personal information?",

    answer:
      "No. Target Trek does not sell, rent, trade, or commercially distribute your name, email address, mobile number, purchase information, or other personal information to data brokers, advertisers, or unrelated third parties for their independent marketing purposes.",
  },

  {
    question:
      "Why does Target Trek collect my mobile number?",

    answer:
      "Your mobile number may be collected during checkout, purchase, enquiry, or support interactions. It may be used to identify your purchase, assist with payment verification, resolve order issues, and provide customer support.",
  },

  {
    question:
      "What information may be processed by a payment gateway?",

    answer:
      "Depending on the payment provider and payment method, limited information such as your name, email address, mobile number, order reference, transaction amount, currency, payment status, and other information necessary to complete or verify the transaction may be processed.",
  },

  {
    question:
      "Does Target Trek store my UPI PIN, OTP, CVV, or banking password?",

    answer:
      "No. Target Trek does not ask customers to provide UPI PINs, OTPs, CVVs, banking passwords, or similar sensitive payment credentials. Sensitive payment authentication is handled by the applicable payment provider.",
  },

  {
    question:
      "Why does Target Trek need my email address?",

    answer:
      "Your email address may be used to identify your purchase, deliver or restore ebook access, send transaction-related information, respond to support requests, and resolve payment or delivery issues.",
  },
];

/* ======================================================
   PRIVACY EMAIL
====================================================== */

const PRIVACY_EMAIL_SUBJECT =
  "Privacy Request - Target Trek";

const PRIVACY_EMAIL_BODY = `Hello Target Trek Support,

I have a privacy-related request.

Full Name:
Email Address:
Mobile Number:
Order ID (if related to a purchase):

Request / Question:

Thank you.`;

const PRIVACY_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  PRIVACY_EMAIL_SUBJECT
)}&body=${encodeURIComponent(PRIVACY_EMAIL_BODY)}`;

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
        key={`${item}-${index}`}
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

const PrivacyPolicy = () => {
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

        description:
          SEO_DESCRIPTION,

        dateModified:
          DATE_MODIFIED,

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
            name: "Privacy Policy",
          },

          {
            "@type": "Thing",
            name: "Data Privacy",
          },

          {
            "@type": "Thing",
            name: "Ebook Purchases",
          },

          {
            "@type": "Thing",
            name: "Payment Processing",
          },

          {
            "@type": "Thing",
            name: "Personal Information",
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
            name: "Privacy Policy",
            item: CANONICAL_URL,
          },
        ],
      },

      {
        "@type": "FAQPage",

        mainEntity:
          privacyFaqs.map(
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
            className={`pointer-events-none absolute -right-52 -top-52 h-[520px] w-[520px] rounded-full blur-3xl ${
              isDark
                ? "bg-blue-500/10"
                : "bg-blue-100/70"
            }`}
          />

          <div
            className={`pointer-events-none absolute -left-36 bottom-0 h-[340px] w-[340px] rounded-full blur-3xl ${
              isDark
                ? "bg-cyan-500/5"
                : "bg-cyan-100/40"
            }`}
          />

          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">

            {/* Breadcrumb */}

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

              <span>
                /
              </span>

              <span
                className={
                  isDark
                    ? "text-slate-300"
                    : "text-slate-600"
                }
              >
                Privacy Policy
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
                <ShieldCheck
                  size={15}
                />

                Target Trek Privacy
              </div>

              <h1
                className={`mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl ${
                  isDark
                    ? "text-white"
                    : "text-slate-950"
                }`}
              >
                Privacy Policy
              </h1>

              <p
                className={`mt-6 max-w-3xl text-base leading-8 sm:text-lg ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                This Privacy Policy
                explains how Target
                Trek collects, uses,
                processes and protects
                information when you
                browse our website,
                purchase an ebook,
                make a payment, or
                contact our support
                team.
              </p>

              <p
                className={`mt-4 max-w-3xl text-base leading-8 ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                We primarily collect
                information such as
                your name, email
                address, mobile
                number and purchase
                information so that
                we can process your
                order, provide ebook
                access and support
                your purchase.
              </p>

              {/* No Selling */}

              <div
                className={`mt-6 max-w-3xl rounded-2xl border p-5 ${
                  isDark
                    ? "border-emerald-500/20 bg-emerald-500/10"
                    : "border-emerald-200 bg-emerald-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck
                    size={23}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />

                  <div>
                    <p
                      className={`font-black ${
                        isDark
                          ? "text-emerald-200"
                          : "text-emerald-900"
                      }`}
                    >
                      We do not sell
                      your personal
                      information.
                    </p>

                    <p
                      className={`mt-1 text-sm leading-6 ${
                        isDark
                          ? "text-emerald-200/80"
                          : "text-emerald-800"
                      }`}
                    >
                      Target Trek
                      does not sell,
                      rent or trade
                      your name,
                      email address,
                      mobile number,
                      purchase history
                      or other personal
                      data to data
                      brokers,
                      advertisers or
                      unrelated third
                      parties for
                      their independent
                      marketing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {[
                  `Last updated: ${LAST_UPDATED}`,
                  "Ebook Purchases",
                  "Payment Privacy",
                  "No Data Selling",
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

            {/* Information */}

            <div
              className={`rounded-2xl border p-5 ${
                isDark
                  ? "border-slate-800 bg-slate-950"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <UserRound
                size={22}
                className="text-blue-500"
              />

              <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-blue-600">
                Basic Information
              </p>

              <p
                className={`mt-2 text-sm font-bold leading-6 ${
                  isDark
                    ? "text-slate-200"
                    : "text-slate-800"
                }`}
              >
                We primarily collect
                your name, email,
                mobile number and
                purchase information
                to process and support
                your order.
              </p>
            </div>

            {/* Payment */}

            <div
              className={`rounded-2xl border p-5 ${
                isDark
                  ? "border-blue-500/20 bg-blue-500/5"
                  : "border-blue-200 bg-blue-50"
              }`}
            >
              <CreditCard
                size={22}
                className="text-blue-500"
              />

              <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-blue-600">
                Payment Processing
              </p>

              <p
                className={`mt-2 text-sm font-bold leading-6 ${
                  isDark
                    ? "text-slate-200"
                    : "text-slate-800"
                }`}
              >
                Limited customer and
                order information may
                be processed by the
                payment gateway where
                needed to complete or
                verify a transaction.
              </p>
            </div>

            {/* No Sale */}

            <div
              className={`rounded-2xl border p-5 ${
                isDark
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-emerald-200 bg-emerald-50"
              }`}
            >
              <LockKeyhole
                size={22}
                className="text-emerald-500"
              />

              <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-emerald-600">
                No Data Selling
              </p>

              <p
                className={`mt-2 text-sm font-bold leading-6 ${
                  isDark
                    ? "text-slate-200"
                    : "text-slate-800"
                }`}
              >
                We do not sell, rent
                or trade your personal
                information to
                unrelated third
                parties.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            BODY
        ================================================= */}

        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8 lg:py-14">

          {/* Sidebar */}

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
                aria-label="Privacy policy navigation"
                className="mt-4 space-y-1"
              >
                {quickLinks.map(
                  (item) => (
                    <a
                      key={
                        item.id
                      }
                      href={`#${item.id}`}
                      className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                        isDark
                          ? "text-slate-400 hover:bg-blue-500/10 hover:text-blue-400"
                          : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      {
                        item.label
                      }
                    </a>
                  )
                )}
              </nav>

              <div
                className={`mt-6 border-t pt-5 ${
                  isDark
                    ? "border-slate-800"
                    : "border-slate-100"
                }`}
              >
                <p className="text-xs leading-5 text-slate-500">
                  Privacy question?
                </p>

                <a
                  href={
                    PRIVACY_MAILTO
                  }
                  className="mt-2 block break-all text-xs font-bold text-blue-500 hover:text-blue-600"
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          </aside>

          {/* Article */}

          <article className="min-w-0">

            {/* =================================================
                SIMPLE SUMMARY
            ================================================= */}

            <section
              className={`rounded-3xl border p-6 sm:p-8 ${
                isDark
                  ? "border-blue-500/20 bg-blue-500/5"
                  : "border-blue-200 bg-blue-50"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    isDark
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-white text-blue-600"
                  }`}
                >
                  <Eye
                    size={23}
                  />
                </div>

                <div>
                  <h2
                    className={`text-xl font-black ${
                      isDark
                        ? "text-white"
                        : "text-slate-950"
                    }`}
                  >
                    Privacy in Simple
                    Terms
                  </h2>

                  <div
                    className={`mt-4 space-y-3 leading-7 ${
                      isDark
                        ? "text-slate-400"
                        : "text-slate-700"
                    }`}
                  >
                    <p>
                      We collect
                      information
                      reasonably needed
                      to process your
                      ebook purchase,
                      provide access
                      and support your
                      order.
                    </p>

                    <p>
                      This may include
                      your name, email
                      address, mobile
                      number and
                      purchase or
                      transaction
                      information.
                    </p>

                    <p>
                      Limited
                      information may
                      also be provided
                      to or processed
                      by the applicable
                      payment gateway
                      where required to
                      complete, verify,
                      reconcile or
                      refund a payment.
                    </p>

                    <p>
                      <strong
                        className={
                          isDark
                            ? "text-emerald-300"
                            : "text-emerald-800"
                        }
                      >
                        We do not sell
                        your personal
                        information.
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                POLICY
            ================================================= */}

            <div
              className={`mt-10 space-y-10 rounded-3xl border p-6 shadow-sm sm:p-10 ${
                isDark
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >

              {/* 1 */}

              <Section
                id="introduction"
                number="1"
                title="Introduction"
                isDark={isDark}
              >
                <p>
                  At{" "}
                  <strong
                    className={
                      isDark
                        ? "text-white"
                        : "text-slate-900"
                    }
                  >
                    Target Trek
                  </strong>
                  , we respect your
                  privacy and use
                  personal information
                  only for legitimate
                  operational,
                  transactional,
                  support and legal
                  purposes.
                </p>

                <p>
                  This Privacy Policy
                  applies when you
                  visit Target Trek,
                  purchase an ebook or
                  digital product,
                  submit information
                  during checkout,
                  access a purchased
                  resource, contact
                  support or otherwise
                  interact with our
                  website.
                </p>
              </Section>

              {/* 2 */}

              <Section
                id="information-we-collect"
                number="2"
                title="Information We Collect"
                isDark={isDark}
              >
                <p>
                  Depending on how you
                  interact with Target
                  Trek, we may collect
                  the following
                  limited information:
                </p>

                <div className="grid gap-4 sm:grid-cols-2">

                  {/* Name */}

                  <div
                    className={`rounded-2xl border p-5 ${
                      isDark
                        ? "border-slate-800 bg-slate-950"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <UserRound
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
                      Name
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-600"
                      }`}
                    >
                      The name you
                      provide during
                      checkout,
                      purchase,
                      enquiry or
                      support
                      communications.
                    </p>
                  </div>

                  {/* Email */}

                  <div
                    className={`rounded-2xl border p-5 ${
                      isDark
                        ? "border-slate-800 bg-slate-950"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <Mail
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
                      Email Address
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-600"
                      }`}
                    >
                      Used to identify
                      your order,
                      provide ebook
                      access, send
                      transaction
                      information and
                      respond to
                      support requests.
                    </p>
                  </div>

                  {/* Phone */}

                  <div
                    className={`rounded-2xl border p-5 ${
                      isDark
                        ? "border-slate-800 bg-slate-950"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <Phone
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
                      Mobile Number
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-600"
                      }`}
                    >
                      The mobile number
                      you provide during
                      checkout,
                      purchase,
                      enquiry or
                      customer-support
                      interactions.
                    </p>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-600"
                      }`}
                    >
                      It may be used
                      for purchase
                      identification,
                      payment
                      verification,
                      order support and
                      other
                      transaction-related
                      purposes where
                      necessary.
                    </p>
                  </div>

                  {/* Purchase */}

                  <div
                    className={`rounded-2xl border p-5 ${
                      isDark
                        ? "border-slate-800 bg-slate-950"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <ReceiptText
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
                      Purchase
                      Information
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-600"
                      }`}
                    >
                      The ebook
                      purchased,
                      order reference,
                      transaction
                      reference,
                      payment status,
                      amount, currency
                      and purchase
                      date.
                    </p>
                  </div>

                  {/* Support */}

                  <div
                    className={`rounded-2xl border p-5 sm:col-span-2 ${
                      isDark
                        ? "border-slate-800 bg-slate-950"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <HelpCircle
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
                      Support
                      Communications
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-600"
                      }`}
                    >
                      Messages,
                      screenshots,
                      order details or
                      other information
                      you voluntarily
                      provide when
                      contacting us
                      about an ebook,
                      payment,
                      download or
                      support issue.
                    </p>
                  </div>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${
                    isDark
                      ? "border-emerald-500/20 bg-emerald-500/10"
                      : "border-emerald-200 bg-emerald-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <LockKeyhole
                      size={20}
                      className="mt-1 shrink-0 text-emerald-500"
                    />

                    <p
                      className={`font-bold leading-7 ${
                        isDark
                          ? "text-emerald-200"
                          : "text-slate-900"
                      }`}
                    >
                      Target Trek does
                      not ask you to
                      send your UPI
                      PIN, OTP, CVV,
                      banking
                      password,
                      complete card
                      number or similar
                      sensitive payment
                      credentials.
                    </p>
                  </div>
                </div>
              </Section>

              {/* 3 */}

              <Section
                id="how-we-use-information"
                number="3"
                title="How We Use Your Information"
                isDark={isDark}
              >
                <p>
                  Information may be
                  used to:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Process and verify ebook and digital-product purchases.",
                    "Associate a successful payment with the correct customer and order.",
                    "Provide access to purchased ebooks and digital resources.",
                    "Use your email address and mobile number to identify and support your purchase.",
                    "Send transactional, purchase, payment, access, or support-related communications where appropriate.",
                    "Respond to customer enquiries and support requests.",
                    "Resolve missing-download, payment-verification, duplicate-payment, or ebook-access issues.",
                    "Maintain transaction and accounting records.",
                    "Prevent fraud, misuse, unauthorized access, or abuse.",
                    "Maintain and improve website operation and security.",
                    "Comply with applicable legal, accounting, regulatory, or dispute-resolution requirements.",
                  ]}
                />
              </Section>

              {/* 4 */}

              <Section
                id="ebook-access"
                number="4"
                title="Ebook Purchases and Digital Access"
                isDark={isDark}
              >
                <p>
                  When you purchase an
                  ebook from Target
                  Trek, purchase and
                  customer information
                  may be associated
                  with the transaction
                  so that payment can
                  be verified and the
                  correct product can
                  be delivered.
                </p>

                <p>
                  Ebook delivery may
                  occur through:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "A downloadable PDF or digital file.",
                    "A browser-based ebook viewer.",
                    "A purchase-specific access page.",
                    "A temporary or secure download link.",
                    "An email containing purchase or access information.",
                  ]}
                />

                <p>
                  Purchase-specific
                  download links,
                  access URLs and
                  related credentials
                  are intended for the
                  purchaser and should
                  not be publicly
                  shared where doing
                  so may provide
                  unauthorized access
                  to a paid product.
                </p>
              </Section>

              {/* 5 */}

              <Section
                id="payments"
                number="5"
                title="Payment Processing"
                isDark={isDark}
              >
                <div
                  className={`rounded-2xl border p-6 ${
                    isDark
                      ? "border-blue-500/20 bg-blue-500/10"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <CreditCard
                      size={25}
                      className="mt-0.5 shrink-0 text-blue-500"
                    />

                    <div>
                      <h3
                        className={`font-black ${
                          isDark
                            ? "text-blue-200"
                            : "text-blue-900"
                        }`}
                      >
                        Payments are
                        processed using
                        third-party
                        payment
                        providers.
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-7 ${
                          isDark
                            ? "text-blue-200/80"
                            : "text-blue-800"
                        }`}
                      >
                        Limited customer,
                        order and
                        transaction
                        information may
                        be provided to
                        or processed by
                        the applicable
                        payment gateway
                        where necessary
                        to complete,
                        verify, refund
                        or reconcile a
                        transaction.
                      </p>
                    </div>
                  </div>
                </div>

                <p>
                  Depending on the
                  payment provider,
                  payment method and
                  transaction, this
                  information may
                  include:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Your name.",
                    "Your email address.",
                    "Your mobile number, where required for payment processing or verification.",
                    "Order reference.",
                    "Transaction or payment reference.",
                    "Transaction amount.",
                    "Currency.",
                    "Payment status.",
                    "Information technically necessary to complete, verify, reconcile, refund, or investigate the transaction.",
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
                    className={`font-bold leading-7 ${
                      isDark
                        ? "text-red-200"
                        : "text-slate-900"
                    }`}
                  >
                    We do not ask you
                    to email your UPI
                    PIN, OTP, CVV,
                    internet banking
                    password or full
                    card details.
                  </p>
                </div>

                <p>
                  Sensitive payment
                  authentication is
                  handled within the
                  applicable payment
                  provider's payment
                  environment.
                </p>
              </Section>

              {/* 6 */}

              <Section
                id="sharing"
                number="6"
                title="How We Share or Permit Processing of Information"
                isDark={isDark}
              >
                <p>
                  We only share or
                  permit processing of
                  personal information
                  where reasonably
                  necessary to operate
                  Target Trek, process
                  purchases, provide
                  ebooks, communicate
                  with customers, or
                  meet legal
                  obligations.
                </p>

                {/* Payment Gateway */}

                <div
                  className={`rounded-2xl border p-5 ${
                    isDark
                      ? "border-blue-500/20 bg-blue-500/10"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <h3
                    className={`font-black ${
                      isDark
                        ? "text-blue-200"
                        : "text-blue-900"
                    }`}
                  >
                    Payment Providers
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-7 ${
                      isDark
                        ? "text-blue-200/80"
                        : "text-blue-800"
                    }`}
                  >
                    Limited information
                    such as your name,
                    email address,
                    mobile number,
                    order reference,
                    transaction amount
                    and related payment
                    information may be
                    provided to or
                    processed by the
                    applicable payment
                    provider where
                    necessary to
                    complete, verify,
                    reconcile or refund
                    a transaction.
                  </p>
                </div>

                {/* Technical Providers */}

                <div
                  className={`rounded-2xl border p-5 ${
                    isDark
                      ? "border-slate-800 bg-slate-950"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <h3
                    className={`font-black ${
                      isDark
                        ? "text-white"
                        : "text-slate-900"
                    }`}
                  >
                    Website,
                    Infrastructure and
                    Communication
                    Providers
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-7 ${
                      isDark
                        ? "text-slate-400"
                        : "text-slate-600"
                    }`}
                  >
                    Service providers
                    used to host our
                    website, operate
                    databases, deliver
                    ebooks or send
                    transactional
                    communications may
                    technically process
                    limited information
                    where necessary to
                    provide those
                    services.
                  </p>
                </div>

                <p>
                  We may also disclose
                  information where
                  reasonably necessary
                  to comply with law,
                  respond to a valid
                  legal request,
                  investigate fraud,
                  resolve a payment
                  dispute, or protect
                  Target Trek and its
                  customers.
                </p>
              </Section>

              {/* 7 */}

              <Section
                id="no-selling"
                number="7"
                title="We Do Not Sell Your Personal Data"
                isDark={isDark}
              >
                <div
                  className={`rounded-2xl border p-6 ${
                    isDark
                      ? "border-emerald-500/20 bg-emerald-500/10"
                      : "border-emerald-200 bg-emerald-50"
                  }`}
                >
                  <ShieldCheck
                    size={28}
                    className="text-emerald-500"
                  />

                  <h3
                    className={`mt-4 text-xl font-black ${
                      isDark
                        ? "text-emerald-200"
                        : "text-emerald-900"
                    }`}
                  >
                    Your personal
                    information is not
                    for sale.
                  </h3>

                  <p
                    className={`mt-3 leading-7 ${
                      isDark
                        ? "text-emerald-200/80"
                        : "text-emerald-800"
                    }`}
                  >
                    Target Trek does
                    not sell, rent or
                    trade your name,
                    email address,
                    mobile number,
                    purchase history
                    or other personal
                    information to
                    data brokers,
                    advertisers or
                    unrelated third
                    parties for their
                    independent
                    marketing
                    purposes.
                  </p>
                </div>

                <p>
                  We do not sell
                  customer lists
                  containing:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Customer names.",
                    "Email addresses.",
                    "Mobile numbers.",
                    "Ebook purchase history.",
                    "Order information.",
                    "Transaction history.",
                  ]}
                />

                <p>
                  Information shared
                  with a payment
                  processor or
                  technical provider
                  for the limited
                  purpose of operating
                  the website or
                  completing your
                  transaction is not a
                  sale of your data by
                  Target Trek.
                </p>
              </Section>

              {/* 8 */}

              <Section
                id="cookies"
                number="8"
                title="Cookies, Local Storage and Website Functionality"
                isDark={isDark}
              >
                <p>
                  Target Trek may use
                  cookies, browser
                  local storage and
                  similar technologies
                  where necessary for
                  website
                  functionality,
                  preferences,
                  security and basic
                  operation.
                </p>

                <p>
                  For example,
                  browser local
                  storage may be used
                  to remember your
                  selected light or
                  dark website theme.
                </p>

                <p>
                  Your browser may
                  allow you to clear
                  or restrict cookies
                  and local storage.
                  Disabling certain
                  browser features may
                  affect website
                  functionality.
                </p>
              </Section>

              {/* 9 */}

              <Section
                id="security"
                number="9"
                title="Data Security"
                isDark={isDark}
              >
                <p>
                  We use reasonable
                  technical and
                  organizational
                  measures intended to
                  protect information
                  against unauthorized
                  access, alteration,
                  loss, disclosure or
                  misuse.
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Restricted administrative access.",
                    "Transaction verification.",
                    "Secure communications where appropriate.",
                    "Application and infrastructure security measures.",
                    "Limited access to purchase and customer records.",
                  ]}
                />

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
                        : "text-slate-900"
                    }`}
                  >
                    No website,
                    database, payment
                    system or internet
                    transmission can
                    be guaranteed to
                    be completely
                    secure.
                  </p>
                </div>
              </Section>

              {/* 10 */}

              <Section
                id="retention"
                number="10"
                title="Data Retention"
                isDark={isDark}
              >
                <p>
                  We retain personal
                  information only for
                  as long as
                  reasonably necessary
                  for the purposes for
                  which it was
                  collected or where
                  retention is needed
                  for legitimate
                  business or legal
                  purposes.
                </p>

                <p>
                  This may include
                  retaining relevant
                  name, email, mobile
                  number, order and
                  transaction
                  information for:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Providing purchased ebooks and digital products.",
                    "Customer support.",
                    "Purchase verification.",
                    "Payment reconciliation.",
                    "Duplicate-payment verification and refunds.",
                    "Fraud prevention.",
                    "Accounting and financial records.",
                    "Dispute or chargeback resolution.",
                    "Applicable legal and compliance requirements.",
                  ]}
                />
              </Section>

              {/* 11 */}

              <Section
                id="privacy-rights"
                number="11"
                title="Your Privacy Rights"
                isDark={isDark}
              >
                <p>
                  Depending on
                  applicable law and
                  your circumstances,
                  you may have the
                  right to request:
                </p>

                <BulletList
                  isDark={isDark}
                  items={[
                    "Access to certain personal information we hold about you.",
                    "Correction of inaccurate or incomplete information.",
                    "Deletion of eligible personal information, subject to legitimate accounting, legal and operational retention requirements.",
                    "Information about how your personal data is used.",
                    "Withdrawal of consent where processing depends on consent.",
                    "Restriction or objection to certain processing where applicable.",
                  ]}
                />

                <p>
                  We may need to
                  verify your email
                  address, mobile
                  number, identity,
                  order details or
                  transaction
                  information before
                  responding to
                  certain privacy
                  requests.
                </p>
              </Section>

              {/* 12 */}

              <Section
                id="children"
                number="12"
                title="Children's Privacy"
                isDark={isDark}
              >
                <p>
                  Target Trek provides
                  educational ebooks
                  and technical
                  learning resources
                  primarily intended
                  for developers,
                  learners,
                  professionals and
                  interview
                  candidates.
                </p>

                <p>
                  We do not knowingly
                  seek to collect
                  personal
                  information from
                  children in
                  violation of
                  applicable law.
                </p>

                <p>
                  If you believe
                  information
                  relating to a child
                  has been provided
                  improperly, please
                  contact us.
                </p>
              </Section>

              {/* 13 */}

              <Section
                id="third-party-services"
                number="13"
                title="Third-Party Services"
                isDark={isDark}
              >
                <p>
                  Target Trek may use
                  third-party payment,
                  infrastructure,
                  hosting or
                  communication
                  providers in order
                  to operate the
                  website and process
                  customer purchases.
                </p>

                <p>
                  Independent
                  providers may
                  process information
                  according to their
                  own terms, privacy
                  policies and legal
                  obligations.
                </p>

                <p>
                  When you interact
                  directly with a
                  payment gateway or
                  another independent
                  third-party
                  service, you should
                  review the privacy
                  terms provided by
                  that service where
                  appropriate.
                </p>
              </Section>

              {/* 14 */}

              <Section
                id="refund-policy"
                number="14"
                title="Refund and Payment Support"
                isDark={isDark}
              >
                <p>
                  Target Trek ebooks
                  and digital
                  products are
                  generally
                  non-refundable
                  after purchase and
                  delivery.
                </p>

                <p>
                  Under our standard
                  refund policy, a
                  verified duplicate
                  or double payment
                  may qualify for a
                  refund.
                </p>

                <a
                  href="/refund-policy"
                  className="inline-flex font-bold text-blue-500 transition hover:text-blue-600"
                >
                  Read our Refund &
                  Cancellation Policy
                  →
                </a>
              </Section>

              {/* 15 */}

              <Section
                id="policy-changes"
                number="15"
                title="Changes to This Privacy Policy"
                isDark={isDark}
              >
                <p>
                  We may update this
                  Privacy Policy from
                  time to time to
                  reflect changes in
                  our products,
                  checkout process,
                  payment
                  integrations,
                  technology,
                  support practices
                  or applicable
                  requirements.
                </p>

                <p>
                  The updated version
                  will be published
                  on this page and
                  the Last Updated
                  date may be
                  revised.
                </p>
              </Section>

              {/* 16 */}

              <Section
                id="privacy-contact"
                number="16"
                title="Privacy & Ebook Support"
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
                    size={27}
                    className="text-blue-500"
                  />

                  <h3
                    className={`mt-4 text-xl font-black ${
                      isDark
                        ? "text-white"
                        : "text-slate-950"
                    }`}
                  >
                    Target Trek
                    Privacy Support
                  </h3>

                  <p
                    className={`mt-3 leading-7 ${
                      isDark
                        ? "text-slate-400"
                        : "text-slate-600"
                    }`}
                  >
                    Contact us if you
                    have a question
                    about your
                    personal
                    information,
                    payment, purchase,
                    ebook access, or
                    this Privacy
                    Policy.
                  </p>

                  <div className="mt-5">
                    <p
                      className={`text-sm font-bold ${
                        isDark
                          ? "text-slate-300"
                          : "text-slate-700"
                      }`}
                    >
                      Privacy &
                      Customer Support
                    </p>

                    <a
                      href={
                        PRIVACY_MAILTO
                      }
                      className="mt-1 block break-all font-black text-blue-500 underline decoration-blue-300 underline-offset-4"
                    >
                      {
                        SUPPORT_EMAIL
                      }
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
                      General
                      Enquiries
                    </p>

                    <a
                      href={`mailto:${GENERAL_EMAIL}`}
                      className="mt-1 block break-all font-bold text-blue-500"
                    >
                      {
                        GENERAL_EMAIL
                      }
                    </a>
                  </div>

                  <a
                    href={
                      PRIVACY_MAILTO
                    }
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                  >
                    <Mail
                      size={17}
                    />

                    Send Privacy
                    Request
                  </a>

                  <div
                    className={`mt-5 rounded-xl border p-4 ${
                      isDark
                        ? "border-slate-700 bg-slate-900"
                        : "border-blue-100 bg-white"
                    }`}
                  >
                    <p
                      className={`text-sm font-bold leading-6 ${
                        isDark
                          ? "text-slate-300"
                          : "text-slate-700"
                      }`}
                    >
                      Never email us
                      your OTP, UPI
                      PIN, CVV,
                      banking
                      password or
                      complete card
                      information.
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
                Privacy FAQs
              </span>

              <h2
                className={`mt-3 text-2xl font-black tracking-tight sm:text-3xl ${
                  isDark
                    ? "text-white"
                    : "text-slate-950"
                }`}
              >
                Common Privacy
                Questions
              </h2>

              <p
                className={`mt-3 max-w-2xl leading-7 ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                Quick answers about
                customer information,
                mobile numbers and
                payment processing.
              </p>

              <div className="mt-8 space-y-4">
                {privacyFaqs.map(
                  (
                    item,
                    index
                  ) => (
                    <article
                      key={
                        item.question
                      }
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
                            {
                              item.question
                            }
                          </h3>

                          <p
                            className={`mt-2 text-sm leading-7 ${
                              isDark
                                ? "text-slate-400"
                                : "text-slate-600"
                            }`}
                          >
                            {
                              item.answer
                            }
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
              <p
                className={`text-sm leading-7 ${
                  isDark
                    ? "text-slate-500"
                    : "text-slate-500"
                }`}
              >
                This Privacy Policy
                should be read
                together with Target
                Trek's{" "}
                <a
                  href="/terms-of-service"
                  className="font-semibold text-blue-500 transition hover:text-blue-600"
                >
                  Terms & Conditions
                </a>
                ,{" "}
                <a
                  href="/refund-policy"
                  className="font-semibold text-blue-500 transition hover:text-blue-600"
                >
                  Refund &
                  Cancellation
                  Policy
                </a>{" "}
                and information
                displayed during
                checkout.
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
                  . All rights
                  reserved.
                </p>

                <a
                  href={
                    PRIVACY_MAILTO
                  }
                  className="font-semibold text-blue-500 transition hover:text-blue-600"
                >
                  Privacy & Support
                  Contact
                </a>
              </div>
            </footer>
          </article>
        </div>
      </main>
    </motion.div>
  );
};

export default PrivacyPolicy;