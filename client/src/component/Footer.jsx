import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowUpRight,
  BookOpen,
  Headphones,
  Mail,
  Rocket,
  ShieldCheck,
} from "lucide-react";

import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

import { Link } from "react-router-dom";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const THEME_KEY = "theme";

const THEME_EVENT =
  "targettrek-theme-change";

/*
|--------------------------------------------------------------------------
| READ THEME
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
| FOOTER
|--------------------------------------------------------------------------
*/

const Footer = () => {
  const currentYear =
    new Date().getFullYear();

  /*
  |--------------------------------------------------------------------------
  | THEME
  |--------------------------------------------------------------------------
  |
  | Footer DOES NOT change theme.
  |
  | Navbar is the controller.
  |
  | Footer only:
  |
  | 1. reads localStorage
  | 2. listens for navbar theme event
  | 3. updates automatically
  |
  */

  const [
    theme,
    setTheme,
  ] = useState(
    readTheme
  );

  const isDark =
    theme === "dark";

  /*
  |--------------------------------------------------------------------------
  | LISTEN FOR GLOBAL THEME CHANGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    /*
    |--------------------------------------------------------------------------
    | Sync when component mounts
    |--------------------------------------------------------------------------
    */

    setTheme(
      readTheme()
    );

    /*
    |--------------------------------------------------------------------------
    | SAME TAB
    |--------------------------------------------------------------------------
    |
    | Navbar dispatches:
    |
    | targettrek-theme-change
    |
    */

    const handleThemeChange =
      (event) => {
        const newTheme =
          event?.detail
            ?.theme;

        if (
          newTheme === "dark" ||
          newTheme === "light"
        ) {
          setTheme(
            newTheme
          );
        }
      };

    /*
    |--------------------------------------------------------------------------
    | DIFFERENT TAB / WINDOW
    |--------------------------------------------------------------------------
    */

    const handleStorageChange =
      (event) => {
        if (
          event.key !==
          THEME_KEY
        ) {
          return;
        }

        const newTheme =
          event.newValue;

        if (
          newTheme === "dark" ||
          newTheme === "light"
        ) {
          setTheme(
            newTheme
          );
        }
      };

    window.addEventListener(
      THEME_EVENT,
      handleThemeChange
    );

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        THEME_EVENT,
        handleThemeChange
      );

      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | EXPLORE LINKS
  |--------------------------------------------------------------------------
  */

  const quickLinks = [
    {
      name:
        "Home",
      href:
        "/",
    },

    {
      name:
        "Learn",
      href:
        "/learn",
    },

    {
      name:
        "Books",
      href:
        "/books",
    },

    {
      name:
        "Interviews",
      href:
        "/interviews",
    },

    {
      name:
        "Resources",
      href:
        "/resources",
    },

    {
      name:
        "Blogs",
      href:
        "/blogs",
    },

    {
      name:
        "Services",
      href:
        "/services",
    },

    {
      name:
        "About Us",
      href:
        "/about",
    },

    {
      name:
        "Portfolio",
      href:
        "/portfolio",
    },

    {
      name:
        "Contact",
      href:
        "/contact",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | BOOK LINKS
  |--------------------------------------------------------------------------
  */

  const bookLinks = [
    {
      name:
        "All Books",

      href:
        "/books",
    },

    {
      name:
        "Mastering System Design — HLD",

      href:
        "/book/system-design/hld",
    },

    {
      name:
        "Mastering System Design — LLD (Java)",

      href:
        "/book/system-design/lld",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | LEGAL LINKS
  |--------------------------------------------------------------------------
  */

  const legalLinks = [
    {
      name:
        "Privacy Policy",

      href:
        "/privacy-policy",
    },

    {
      name:
        "Terms of Service",

      href:
        "/terms-of-service",
    },

    {
      name:
        "Refund Policy",

      href:
        "/refund-policy",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | SOCIAL LINKS
  |--------------------------------------------------------------------------
  */

  const socialLinks = [
    {
      label:
        "Instagram",

      href:
        "https://www.instagram.com/target_trek",

      icon:
        FaInstagram,
    },

    {
      label:
        "Facebook",

      href:
        "https://www.facebook.com/targettreks/",

      icon:
        FaFacebook,
    },

    {
      label:
        "LinkedIn",

      href:
        "https://www.linkedin.com/company/target-trek/",

      icon:
        FaLinkedin,
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | THEME CLASSES
  |--------------------------------------------------------------------------
  */

  const footerBg =
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
      : "bg-[#F5F9FC]";

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

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <footer
      className={`
        tt-sans
        relative
        overflow-hidden
        transition-colors
        duration-300
        ${footerBg}
        ${primaryText}
      `}
    >
      {/* ============================================================ */}
      {/* SUBTLE BACKGROUND */}
      {/* ============================================================ */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* LEFT GLOW */}

        <div
          className={`
            absolute
            left-[-130px]
            top-[-120px]
            h-[330px]
            w-[330px]
            rounded-full
            blur-[120px]
            ${
              isDark
                ? "bg-blue-900/10"
                : "bg-[#E4F1FB]/70"
            }
          `}
        />

        {/* RIGHT GLOW */}

        <div
          className={`
            absolute
            right-[-180px]
            top-[25%]
            h-[420px]
            w-[420px]
            rounded-full
            blur-[130px]
            ${
              isDark
                ? "bg-cyan-900/10"
                : "bg-[#EAF4FC]/70"
            }
          `}
        />

        {/* EDITORIAL GRID */}

        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              isDark
                ? "repeating-linear-gradient(90deg, rgba(110,180,220,0.025) 0px, rgba(110,180,220,0.025) 1px, transparent 1px, transparent 42px)"
                : "repeating-linear-gradient(90deg, rgba(29,92,134,0.035) 0px, rgba(29,92,134,0.035) 1px, transparent 1px, transparent 42px)",
          }}
        />
      </div>

      {/* ============================================================ */}
      {/* MAIN FOOTER */}
      {/* ============================================================ */}

      <div
        className={`
          relative
          border-t
          transition-colors
          duration-300
          ${borderColor}
          ${primaryBg}
        `}
      >
        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            py-12

            sm:px-6
            sm:py-14

            lg:px-8
            lg:py-16
          "
        >
          <div
            className="
              grid
              gap-10

              sm:grid-cols-2

              lg:grid-cols-12
              lg:gap-10
            "
          >
            {/* ====================================================== */}
            {/* BRAND */}
            {/* ====================================================== */}

            <div className="sm:col-span-2 lg:col-span-4">
              {/* LOGO / BRAND */}

              <Link
                to="/"
                className="group inline-flex items-center gap-3"
              >
                <div
                  className={`
                    relative
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-2xl
                    text-white
                    shadow-[0_8px_18px_rgba(11,21,36,0.14)]
                    transition-all
                    duration-300
                    group-hover:-translate-y-0.5
                    ${
                      isDark
                        ? "bg-[#172333] group-hover:bg-[#1D5C86]"
                        : "bg-[#0B1524] group-hover:bg-[#1D5C86]"
                    }
                  `}
                >
                  <Rocket
                    size={22}
                    strokeWidth={
                      2.1
                    }
                  />
                </div>

                <div className="text-2xl font-extrabold tracking-tight">
                  <span
                    className={
                      primaryText
                    }
                  >
                    Target
                  </span>

                  <span
                    className={
                      blueText
                    }
                  >
                    Trek
                  </span>
                </div>
              </Link>

              {/* DESCRIPTION */}

              <p
                className={`
                  mt-6
                  max-w-sm
                  text-sm
                  leading-7
                  ${secondaryText}
                `}
              >
                Practical software
                engineering
                resources,
                interview
                experiences,
                technical books and
                learning content for
                developers.
              </p>

              {/* SMALL DIVIDER */}

              <div className="mt-7 h-px w-16 bg-[#2E86C1]" />

              {/* SOCIAL LINKS */}

              <div className="mt-6 flex items-center gap-2.5">
                {socialLinks.map(
                  (social) => {
                    const Icon =
                      social.icon;

                    return (
                      <a
                        key={
                          social.label
                        }
                        href={
                          social.href
                        }
                        target="_blank"
                        rel="noreferrer"
                        aria-label={
                          social.label
                        }
                        className={`
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          border
                          transition-all
                          duration-300
                          hover:-translate-y-1
                          ${borderColor}
                          ${
                            isDark
                              ? "bg-[#101924] text-[#8798AA] hover:border-blue-900 hover:bg-blue-950/20 hover:text-blue-400"
                              : "bg-[#F5F9FC] text-[#5B6B82] hover:border-[#D9E7F2] hover:bg-[#EAF4FC] hover:text-[#1D5C86]"
                          }
                        `}
                      >
                        <Icon
                          size={
                            17
                          }
                        />
                      </a>
                    );
                  }
                )}
              </div>
            </div>

            {/* ====================================================== */}
            {/* EXPLORE */}
            {/* ====================================================== */}

            <div className="lg:col-span-2">
              <h3
                className={`
                  mb-5
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  ${primaryText}
                `}
              >
                Explore
              </h3>

              <ul className="space-y-3">
                {quickLinks.map(
                  (link) => (
                    <li
                      key={
                        link.name
                      }
                    >
                      <Link
                        to={
                          link.href
                        }
                        className={`
                          group
                          inline-flex
                          items-center
                          gap-2
                          text-sm
                          transition-all
                          duration-200
                          hover:translate-x-1
                          ${
                            isDark
                              ? "text-[#9AA9BA] hover:text-[#66B8EA]"
                              : "text-[#5B6B82] hover:text-[#1D5C86]"
                          }
                        `}
                      >
                        <span
                          className="
                            h-1
                            w-1
                            rounded-full
                            bg-[#2E86C1]
                            opacity-0
                            transition
                            group-hover:opacity-100
                          "
                        />

                        {link.name}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* ====================================================== */}
            {/* BOOKS */}
            {/* ====================================================== */}

            <div className="lg:col-span-3">
              <div className="mb-5 flex items-center gap-2">
                <BookOpen
                  size={15}
                  className={
                    blueText
                  }
                />

                <h3
                  className={`
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    ${primaryText}
                  `}
                >
                  Books
                </h3>
              </div>

              <ul className="space-y-3.5">
                {bookLinks.map(
                  (book) => (
                    <li
                      key={
                        book.name
                      }
                    >
                      <Link
                        to={
                          book.href
                        }
                        className={`
                          group
                          flex
                          items-start
                          gap-2.5
                          text-sm
                          leading-6
                          transition
                          duration-200
                          ${
                            isDark
                              ? "text-[#9AA9BA] hover:text-[#66B8EA]"
                              : "text-[#5B6B82] hover:text-[#1D5C86]"
                          }
                        `}
                      >
                        <ArrowUpRight
                          size={14}
                          className="
                            mt-1
                            shrink-0
                            opacity-50
                            transition
                            group-hover:-translate-y-0.5
                            group-hover:translate-x-0.5
                            group-hover:opacity-100
                          "
                        />

                        <span>
                          {book.name}
                        </span>
                      </Link>
                    </li>
                  )
                )}
              </ul>

              <Link
                to="/books"
                className={`
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  px-4
                  py-2.5
                  text-xs
                  font-bold
                  transition
                  ${borderColor}
                  ${
                    isDark
                      ? "bg-[#101924] text-blue-300 hover:border-blue-800 hover:bg-blue-950/20"
                      : "bg-[#F5F9FC] text-[#1D5C86] hover:border-[#BFDDF2] hover:bg-[#EAF4FC]"
                  }
                `}
              >
                View all books

                <ArrowUpRight
                  size={14}
                />
              </Link>
            </div>

            {/* ====================================================== */}
            {/* CONTACT / SUPPORT */}
            {/* ====================================================== */}

            <div className="sm:col-span-2 lg:col-span-3">
              <h3
                className={`
                  mb-5
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  ${primaryText}
                `}
              >
                Get in Touch
              </h3>

              <div className="space-y-3">
                {/* ================================================== */}
                {/* GENERAL ENQUIRY */}
                {/* ================================================== */}

                <a
                  href="mailto:enquiry@targettrek.in"
                  className={`
                    group
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    p-4
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    ${borderColor}
                    ${cardBg}
                    ${
                      isDark
                        ? "hover:border-blue-900 hover:bg-[#131E2A]"
                        : "hover:border-[#BFDDF2] hover:bg-white hover:shadow-[0_10px_25px_rgba(15,35,58,0.06)]"
                    }
                  `}
                >
                  <div
                    className={`
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      ${
                        isDark
                          ? "bg-blue-950/30 text-blue-300"
                          : "bg-[#E4F1FB] text-[#1D5C86]"
                      }
                    `}
                  >
                    <Mail
                      size={18}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`
                        text-[11px]
                        font-semibold
                        ${mutedText}
                      `}
                    >
                      General Enquiry
                    </p>

                    <p
                      className={`
                        mt-1
                        break-all
                        text-sm
                        font-semibold
                        ${primaryText}
                      `}
                    >
                      enquiry@targettrek.in
                    </p>
                  </div>

                  <ArrowUpRight
                    size={16}
                    className={`
                      ml-auto
                      hidden
                      shrink-0
                      transition
                      group-hover:-translate-y-0.5
                      group-hover:translate-x-0.5
                      sm:block
                      ${mutedText}
                    `}
                  />
                </a>

                {/* ================================================== */}
                {/* BOOKS / SUPPORT */}
                {/* ================================================== */}

                <a
                  href="mailto:supporttargettrek@gmail.com"
                  className={`
                    group
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    border
                    p-4
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    ${borderColor}
                    ${cardBg}
                    ${
                      isDark
                        ? "hover:border-blue-900 hover:bg-[#131E2A]"
                        : "hover:border-[#BFDDF2] hover:bg-white hover:shadow-[0_10px_25px_rgba(15,35,58,0.06)]"
                    }
                  `}
                >
                  <div
                    className={`
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      ${
                        isDark
                          ? "bg-emerald-950/30 text-emerald-300"
                          : "bg-emerald-50 text-emerald-700"
                      }
                    `}
                  >
                    <Headphones
                      size={18}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`
                        text-[11px]
                        font-semibold
                        ${mutedText}
                      `}
                    >
                      Books & Support
                    </p>

                    <p
                      className={`
                        mt-1
                        break-all
                        text-sm
                        font-semibold
                        ${primaryText}
                      `}
                    >
                      supporttargettrek@gmail.com
                    </p>
                  </div>

                  <ArrowUpRight
                    size={16}
                    className={`
                      ml-auto
                      hidden
                      shrink-0
                      transition
                      group-hover:-translate-y-0.5
                      group-hover:translate-x-0.5
                      sm:block
                      ${mutedText}
                    `}
                  />
                </a>
              </div>

              {/* ==================================================== */}
              {/* SUPPORT NOTE */}
              {/* ==================================================== */}

              <div
                className={`
                  mt-4
                  rounded-2xl
                  border
                  p-4
                  ${borderColor}
                  ${primaryBg}
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      ${
                        isDark
                          ? "bg-blue-950/30 text-blue-300"
                          : "bg-[#EAF4FC] text-[#1D5C86]"
                      }
                    `}
                  >
                    <ShieldCheck
                      size={17}
                    />
                  </div>

                  <div>
                    <p
                      className={`
                        text-sm
                        font-semibold
                        ${primaryText}
                      `}
                    >
                      Need help with a
                      book?
                    </p>

                    <p
                      className={`
                        mt-1
                        text-xs
                        leading-5
                        ${mutedText}
                      `}
                    >
                      For payment,
                      download, access
                      or book-related
                      issues, contact
                      our support
                      email.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM BAR */}
      {/* ============================================================ */}

      <div
        className={`
          relative
          border-t
          transition-colors
          duration-300
          ${borderColor}
          ${footerBg}
        `}
      >
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            flex-col
            gap-5
            px-4
            py-6

            sm:px-6

            md:flex-row
            md:items-center
            md:justify-between

            lg:px-8
          "
        >
          {/* COPYRIGHT */}

          <div
            className={`
              flex
              flex-wrap
              items-center
              gap-2
              text-xs
              ${mutedText}
            `}
          >
            <span>
              © {currentYear} Target
              Trek.
            </span>

            <span
              className={`
                hidden
                h-1
                w-1
                rounded-full
                sm:block
                ${
                  isDark
                    ? "bg-slate-700"
                    : "bg-[#CBD5E1]"
                }
              `}
            />

            <span>
              All rights reserved.
            </span>
          </div>

          {/* LEGAL */}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {legalLinks.map(
              (link) => (
                <Link
                  key={
                    link.name
                  }
                  to={
                    link.href
                  }
                  className={`
                    text-xs
                    transition
                    ${
                      isDark
                        ? "text-[#708196] hover:text-[#66B8EA]"
                        : "text-[#7C8CA3] hover:text-[#1D5C86]"
                    }
                  `}
                >
                  {link.name}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;