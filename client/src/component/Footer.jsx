
import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Code2,
  Headphones,
  Mail,
  Rocket,
  ShieldCheck,
  Video,
} from "lucide-react";

import { Link } from "react-router-dom";

/* =========================================================
   CONFIGURATION
========================================================= */

const THEME_KEY = "theme";

const THEME_EVENT =
  "targettrek-theme-change";

const GENERAL_EMAIL =
  "enquiry@targettrek.in";

const SUPPORT_EMAIL =
  "supporttargettrek@gmail.com";

const MOCK_INTERVIEW_ROUTE =
  "/mock-interviews";

/* =========================================================
   NAVIGATION DATA
========================================================= */

const QUICK_LINKS = [
  { name: "Home", href: "/" },
  { name: "Learn", href: "/learn" },
  { name: "Books", href: "/books" },
  {
    name: "Mock Interviews",
    href: "/mock-interviews",
  },
  {
    name: "Interview Experiences",
    href: "/interviews",
  },
  {
    name: "Resources",
    href: "/resources",
  },
  { name: "Blogs", href: "/blogs" },
  {
    name: "Services",
    href: "/services",
  },
  {
    name: "About Us",
    href: "/about",
  },
  {
    name: "Portfolio",
    href: "/portfolio",
  },
  {
    name: "Contact",
    href: "/contact",
  },
];

const BOOK_LINKS = [
  {
    name: "All Books",
    href: "/books",
  },
  {
    name: "Mastering System Design — HLD",
    href: "/book/system-design/hld",
  },
  {
    name: "Mastering System Design — LLD (Java)",
    href: "/book/system-design/lld",
  },
];

const LEGAL_LINKS = [
  {
    name: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    name: "Terms of Service",
    href: "/terms-of-service",
  },
  {
    name: "Refund Policy",
    href: "/refund-policy",
  },
];

/* =========================================================
   THEME HELPERS
========================================================= */

function readTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const stored =
      window.localStorage.getItem(
        THEME_KEY
      );

    if (
      stored === "dark" ||
      stored === "light"
    ) {
      return stored;
    }

    return document.documentElement.classList
      .contains("dark")
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function useFooterTheme() {
  const [theme, setTheme] =
    useState(readTheme);

  useEffect(() => {
    const syncTheme = () => {
      setTheme(readTheme());
    };

    const handleThemeEvent = (event) => {
      const next =
        event?.detail?.theme;

      if (
        next === "dark" ||
        next === "light"
      ) {
        setTheme(next);
      } else {
        syncTheme();
      }
    };

    const handleStorageChange = (event) => {
      if (
        event.key === THEME_KEY ||
        event.key === null
      ) {
        syncTheme();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncTheme();
      }
    };

    window.addEventListener(
      THEME_EVENT,
      handleThemeEvent
    );

    window.addEventListener(
      "themechange",
      handleThemeEvent
    );

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    window.addEventListener(
      "focus",
      syncTheme
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    const observer =
      new MutationObserver(syncTheme);

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

    syncTheme();

    return () => {
      window.removeEventListener(
        THEME_EVENT,
        handleThemeEvent
      );

      window.removeEventListener(
        "themechange",
        handleThemeEvent
      );

      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        "focus",
        syncTheme
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      observer.disconnect();
    };
  }, []);

  return theme;
}

/* =========================================================
   CONTACT CARD
========================================================= */

function ContactCard({
  href,
  label,
  email,
  Icon,
  isDark,
}) {
  return (
    <a
      href={href}
      className={`
        group flex items-center
        gap-3 rounded-2xl
        border p-4
        transition-all duration-300
        hover:-translate-y-0.5
        ${
          isDark
            ? "border-[#49372c] bg-[#241b15] hover:border-orange-800 hover:bg-[#302219]"
            : "border-[#f0ded0] bg-[#fffaf5] hover:border-orange-300 hover:bg-white hover:shadow-[0_12px_30px_rgba(194,65,12,.07)]"
        }
      `}
    >
      <div
        className={`
          flex h-11 w-11
          shrink-0 items-center
          justify-center
          rounded-xl
          ${
            isDark
              ? "bg-orange-500/15 text-orange-400"
              : "bg-orange-100 text-orange-600"
          }
        `}
      >
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`
            text-[11px] font-bold
            ${
              isDark
                ? "text-[#ad9889]"
                : "text-[#927c6e]"
            }
          `}
        >
          {label}
        </p>

        <p
          className={`
            mt-1 break-all
            text-sm font-semibold
            ${
              isDark
                ? "text-[#fff8f0]"
                : "text-[#34271f]"
            }
          `}
        >
          {email}
        </p>
      </div>

      <ArrowUpRight
        size={17}
        className={`
          hidden shrink-0
          transition-transform
          group-hover:-translate-y-0.5
          group-hover:translate-x-0.5
          sm:block
          ${
            isDark
              ? "text-orange-400"
              : "text-orange-600"
          }
        `}
      />
    </a>
  );
}

/* =========================================================
   FOOTER COMPONENT
========================================================= */

export default function Footer() {
  const theme = useFooterTheme();

  const isDark =
    theme === "dark";

  const currentYear =
    new Date().getFullYear();

  /* ======================================================
     LOCAL DESIGN VARIABLES
  ====================================================== */

  const footerBg = isDark
    ? "bg-[#15110e]"
    : "bg-[#fff8f2]";

  const primaryBg = isDark
    ? "bg-[#1c1612]"
    : "bg-[#fffdfb]";

  const cardBg = isDark
    ? "bg-[#241b15]"
    : "bg-[#fff4e9]";

  const border = isDark
    ? "border-[#403128]"
    : "border-[#f0ded0]";

  const primaryText = isDark
    ? "text-[#fff8f0]"
    : "text-[#2b211b]";

  const secondaryText = isDark
    ? "text-[#bba89b]"
    : "text-[#79695e]";

  const mutedText = isDark
    ? "text-[#998578]"
    : "text-[#9b8779]";

  const accentText = isDark
    ? "text-orange-400"
    : "text-orange-600";

  const linkStyle = `
    group inline-flex
    items-center gap-2
    text-sm leading-6
    transition-all duration-200
    hover:translate-x-1
    ${
      isDark
        ? "text-[#bba89b] hover:text-orange-400"
        : "text-[#79695e] hover:text-orange-600"
    }
  `;

  const headingStyle = `
    mb-5 text-[11px]
    font-extrabold uppercase
    tracking-[0.18em]
    ${primaryText}
  `;

  return (
    <footer
      data-theme={theme}
      className={`
        relative overflow-hidden
        font-sans
        transition-colors
        duration-300
        ${footerBg}
        ${primaryText}
      `}
    >
      {/* ===============================================
          DECORATIVE BACKGROUND
      =============================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`
            absolute -left-28 -top-32
            h-[350px] w-[350px]
            rounded-full blur-[110px]
            ${
              isDark
                ? "bg-orange-700/10"
                : "bg-orange-200/50"
            }
          `}
        />

        <div
          className={`
            absolute -right-32 top-[20%]
            h-[420px] w-[420px]
            rounded-full blur-[125px]
            ${
              isDark
                ? "bg-amber-700/10"
                : "bg-amber-100/70"
            }
          `}
        />

        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              isDark
                ? "repeating-linear-gradient(90deg,rgba(251,146,60,.025) 0px,rgba(251,146,60,.025) 1px,transparent 1px,transparent 44px)"
                : "repeating-linear-gradient(90deg,rgba(234,88,12,.035) 0px,rgba(234,88,12,.035) 1px,transparent 1px,transparent 44px)",
          }}
        />
      </div>

      {/* ===============================================
          MOCK INTERVIEW CTA STRIP
      =============================================== */}

      <div
        className={`
          relative border-t
          ${border}
        `}
      >
        <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
          <div
            className={`
              relative overflow-hidden
              rounded-[24px] border
              p-6 sm:p-8
              ${
                isDark
                  ? "border-orange-900/60 bg-gradient-to-r from-[#382114] to-[#241a14]"
                  : "border-orange-200 bg-gradient-to-r from-[#ffedd5] to-[#fff6ed]"
              }
            `}
          >
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-orange-400/15 blur-3xl" />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-600 text-white">
                  <Video size={23} />
                </div>

                <div>
                  <p className={`text-[11px] font-extrabold uppercase tracking-[0.15em] ${accentText}`}>
                    Target Trek Mock Interviews
                  </p>

                  <h2 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
                    Turn preparation into interview confidence.
                  </h2>

                  <p className={`mt-2 max-w-2xl text-sm leading-7 ${secondaryText}`}>
                    Practice DSA, LLD, HLD, GenAI
                    and project discussions in a
                    live, personalized technical
                    mock interview.
                  </p>
                </div>
              </div>

              <Link
                to={MOCK_INTERVIEW_ROUTE}
                className="
                  inline-flex min-h-[48px]
                  shrink-0 items-center
                  justify-center gap-2
                  rounded-xl bg-orange-600
                  px-6 py-3 text-sm
                  font-extrabold text-white
                  transition hover:bg-orange-700
                "
              >
                <CalendarDays size={18} />
                Book Mock Interview
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ===============================================
          MAIN FOOTER CONTENT
      =============================================== */}

      <div
        className={`
          relative mt-10
          border-t
          ${border}
          ${primaryBg}
        `}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-9">

            {/* ======================================
                BRAND
            ====================================== */}

            <div className="sm:col-span-2 lg:col-span-4">
              <Link
                to="/"
                className="group inline-flex items-center gap-3"
              >
                <div
                  className="
                    flex h-12 w-12
                    items-center justify-center
                    rounded-2xl
                    bg-orange-600
                    text-white
                    shadow-lg shadow-orange-600/15
                    transition-transform
                    group-hover:-translate-y-1
                  "
                >
                  <Rocket
                    size={23}
                    strokeWidth={2.1}
                  />
                </div>

                <div className="text-2xl font-black tracking-tight">
                  <span className={primaryText}>
                    Target
                  </span>

                  <span className={accentText}>
                    Trek
                  </span>
                </div>
              </Link>

              <p
                className={`
                  mt-6 max-w-sm
                  text-sm leading-8
                  ${secondaryText}
                `}
              >
                Practical software engineering
                books, interview experiences,
                system design resources and
                technical learning content
                built for developers preparing
                for their next career opportunity.
              </p>

              <div className="mt-7 h-1 w-16 rounded-full bg-orange-600" />

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  "Backend Engineering",
                  "System Design",
                  "GenAI",
                ].map((topic) => (
                  <span
                    key={topic}
                    className={`
                      rounded-full border
                      px-3 py-1.5
                      text-[11px] font-semibold
                      ${border}
                      ${cardBg}
                      ${secondaryText}
                    `}
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* ======================================
                EXPLORE
            ====================================== */}

            <div className="lg:col-span-2">
              <h3 className={headingStyle}>
                Explore
              </h3>

              <ul className="space-y-3">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className={linkStyle}
                    >
                      <span className="h-1 w-1 rounded-full bg-orange-500 opacity-0 transition group-hover:opacity-100" />

                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ======================================
                BOOKS
            ====================================== */}

            <div className="lg:col-span-3">
              <div className="mb-5 flex items-center gap-2">
                <BookOpen
                  size={17}
                  className={accentText}
                />

                <h3 className={headingStyle.replace("mb-5", "mb-0")}>
                  Books
                </h3>
              </div>

              <ul className="space-y-3.5">
                {BOOK_LINKS.map((book) => (
                  <li key={book.href}>
                    <Link
                      to={book.href}
                      className={`
                        group flex items-start
                        gap-2.5 text-sm
                        leading-6 transition
                        ${
                          isDark
                            ? "text-[#bba89b] hover:text-orange-400"
                            : "text-[#79695e] hover:text-orange-600"
                        }
                      `}
                    >
                      <ArrowUpRight
                        size={15}
                        className="mt-1 shrink-0 opacity-60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />

                      <span>
                        {book.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <Link
                to="/books"
                className={`
                  mt-6 inline-flex
                  items-center gap-2
                  rounded-xl border
                  px-4 py-2.5
                  text-xs font-extrabold
                  transition
                  ${border}
                  ${
                    isDark
                      ? "bg-[#2c211a] text-orange-300 hover:border-orange-800"
                      : "bg-orange-50 text-orange-700 hover:border-orange-300"
                  }
                `}
              >
                View all books
                <ArrowUpRight size={15} />
              </Link>
            </div>

            {/* ======================================
                CONTACT AND SUPPORT
            ====================================== */}

            <div className="sm:col-span-2 lg:col-span-3">
              <h3 className={headingStyle}>
                Get in Touch
              </h3>

              <div className="space-y-3">
                <ContactCard
                  href={`mailto:${GENERAL_EMAIL}`}
                  label="General Enquiry"
                  email={GENERAL_EMAIL}
                  Icon={Mail}
                  isDark={isDark}
                />

                <ContactCard
                  href={`mailto:${SUPPORT_EMAIL}`}
                  label="Books & Support"
                  email={SUPPORT_EMAIL}
                  Icon={Headphones}
                  isDark={isDark}
                />
              </div>

              <div
                className={`
                  mt-4 rounded-2xl
                  border p-4
                  ${border}
                  ${cardBg}
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`
                      flex h-10 w-10
                      shrink-0 items-center
                      justify-center
                      rounded-xl
                      ${
                        isDark
                          ? "bg-orange-500/15 text-orange-400"
                          : "bg-orange-100 text-orange-600"
                      }
                    `}
                  >
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold">
                      Need help with a book?
                    </h4>

                    <p
                      className={`
                        mt-2 text-xs
                        leading-6
                        ${secondaryText}
                      `}
                    >
                      For payment, ebook
                      downloads, access or
                      purchase-related questions,
                      contact our support team.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===============================================
          COPYRIGHT AND LEGAL LINKS
      =============================================== */}

      <div
        className={`
          relative border-t
          ${border}
          ${footerBg}
        `}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div
            className={`
              flex flex-wrap
              items-center gap-2
              text-xs
              ${mutedText}
            `}
          >
            <span>
              © {currentYear} Target Trek.
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-orange-400/40 sm:block" />

            <span>
              All rights reserved.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`
                  text-xs transition
                  ${
                    isDark
                      ? "text-[#998578] hover:text-orange-400"
                      : "text-[#9b8779] hover:text-orange-600"
                  }
                `}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
