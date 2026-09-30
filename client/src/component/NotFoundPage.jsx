import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Compass,
  GraduationCap,
  Home,
  Search,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { Helmet } from "react-helmet";

const THEME_KEY = "theme";
const THEME_EVENT =
  "targettrek-theme-change";

const readTheme = () => {
  if (
    typeof window === "undefined"
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

function NotFoundPage() {
  const navigate =
    useNavigate();

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

    const handleThemeChange =
      (event) => {
        const newTheme =
          event?.detail?.theme;

        if (
          newTheme === "dark" ||
          newTheme === "light"
        ) {
          setTheme(
            newTheme
          );
        }
      };

    const handleStorageChange =
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

  const pageBg =
    isDark
      ? "bg-[#080D14]"
      : "bg-slate-50";

  const primaryText =
    isDark
      ? "text-white"
      : "text-slate-950";

  const secondaryText =
    isDark
      ? "text-slate-400"
      : "text-slate-500";

  const borderColor =
    isDark
      ? "border-slate-800"
      : "border-slate-200";

  const cardBg =
    isDark
      ? "bg-[#101720]"
      : "bg-white";

  return (
    <>
      <Helmet>
        <title>
          Page Not Found | TargetTrek
        </title>

        <meta
          name="description"
          content="The TargetTrek page you requested could not be found. Explore TargetTrek learning resources, technical books and software engineering interview experiences."
        />

        <meta
          name="robots"
          content="noindex,follow"
        />

        <meta
          property="og:title"
          content="Page Not Found | TargetTrek"
        />

        <meta
          property="og:description"
          content="The requested page could not be found. Continue exploring TargetTrek books, resources and interview experiences."
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          name="twitter:card"
          content="summary"
        />

        <meta
          name="twitter:title"
          content="Page Not Found | TargetTrek"
        />

        <meta
          name="twitter:description"
          content="The requested TargetTrek page could not be found."
        />
      </Helmet>

      <main
        className={`
          relative
          min-h-screen
          w-full
          overflow-hidden
          pt-16
          font-sans
          transition-colors
          duration-300
          ${pageBg}
          ${primaryText}
        `}
      >
        {/* Background */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                isDark
                  ? "linear-gradient(rgba(59,130,246,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.035) 1px, transparent 1px)"
                  : "linear-gradient(rgba(37,99,235,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.04) 1px, transparent 1px)",

              backgroundSize:
                "42px 42px",
            }}
          />

          <div
            className={`
              absolute
              -left-40
              top-20
              h-[380px]
              w-[380px]
              rounded-full
              blur-[120px]
              ${
                isDark
                  ? "bg-blue-900/15"
                  : "bg-blue-100/70"
              }
            `}
          />

          <div
            className={`
              absolute
              -right-40
              bottom-0
              h-[420px]
              w-[420px]
              rounded-full
              blur-[130px]
              ${
                isDark
                  ? "bg-cyan-900/10"
                  : "bg-indigo-100/60"
              }
            `}
          />
        </div>

        {/* Content */}

        <div
          className="
            relative
            mx-auto
            flex
            min-h-[calc(100vh-4rem)]
            max-w-7xl
            items-center
            justify-center
            px-4
            py-14

            sm:px-6
            sm:py-16

            lg:px-8
            lg:py-20
          "
        >
          <div className="w-full max-w-3xl text-center">
            {/* Badge */}

            <div
              className={`
                mb-8
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                px-4
                py-2
                text-[10px]
                font-black
                uppercase
                tracking-[0.16em]

                sm:text-[11px]

                ${
                  isDark
                    ? "border-blue-900/50 bg-blue-950/20 text-blue-300"
                    : "border-blue-100 bg-white text-blue-600 shadow-sm"
                }
              `}
            >
              <Compass className="h-3.5 w-3.5" />

              Page Not Found
            </div>

            {/* 404 */}

            <div className="relative mx-auto w-fit">
              <h1
                className={`
                  select-none
                  text-[100px]
                  font-black
                  leading-[0.8]
                  tracking-[-0.08em]

                  sm:text-[145px]
                  md:text-[180px]
                  lg:text-[200px]

                  ${
                    isDark
                      ? "text-white"
                      : "text-slate-950"
                  }
                `}
              >
                404
              </h1>

              <div
                className="
                  absolute
                  -right-1
                  -top-2
                  h-4
                  w-4
                  rounded-full
                  bg-blue-500

                  sm:-right-2
                  sm:-top-3
                  sm:h-6
                  sm:w-6
                "
              />
            </div>

            {/* Text */}

            <h2
              className={`
                mt-10
                text-2xl
                font-black
                tracking-tight

                sm:text-3xl
                md:text-4xl
                lg:text-5xl

                ${primaryText}
              `}
            >
              This page went off the{" "}

              <span className="text-blue-500">
                roadmap.
              </span>
            </h2>

            <p
              className={`
                mx-auto
                mt-5
                max-w-2xl
                text-sm
                leading-7

                sm:text-base
                sm:leading-8

                ${secondaryText}
              `}
            >
              The page you're looking
              for may have been moved,
              removed or the URL may
              be incorrect. You can
              return to TargetTrek or
              continue exploring our
              books, learning
              resources and interview
              experiences.
            </p>

            {/* Primary Actions */}

            <div
              className="
                mt-9
                grid
                gap-3

                sm:flex
                sm:flex-wrap
                sm:items-center
                sm:justify-center
              "
            >
              <Link
                to="/"
                className="
                  group
                  inline-flex
                  min-h-[48px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-6
                  py-3
                  text-sm
                  font-black
                  text-white
                  shadow-[0_8px_20px_rgba(37,99,235,0.18)]
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-blue-700
                  hover:shadow-[0_12px_28px_rgba(37,99,235,0.25)]

                  sm:w-auto
                "
              >
                <Home className="h-4 w-4" />

                Homepage

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/learn"
                className={`
                  group
                  inline-flex
                  min-h-[48px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  px-6
                  py-3
                  text-sm
                  font-black
                  transition-all
                  duration-200
                  hover:-translate-y-0.5

                  sm:w-auto

                  ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-white hover:border-blue-700 hover:bg-slate-800"
                      : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
                  }
                `}
              >
                <GraduationCap className="h-4 w-4" />

                Explore Learn
              </Link>

              <Link
                to="/books"
                className={`
                  group
                  inline-flex
                  min-h-[48px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  px-6
                  py-3
                  text-sm
                  font-black
                  transition-all
                  duration-200
                  hover:-translate-y-0.5

                  sm:w-auto

                  ${
                    isDark
                      ? "border-slate-700 bg-[#101720] text-slate-300 hover:border-blue-700 hover:text-blue-300"
                      : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-600 hover:shadow-md"
                  }
                `}
              >
                <BookOpen className="h-4 w-4" />

                Explore Books
              </Link>
            </div>

            {/* Back */}

            <button
              type="button"
              onClick={() =>
                navigate(-1)
              }
              className={`
                group
                mt-7
                inline-flex
                items-center
                gap-2
                text-xs
                font-bold
                transition

                ${
                  isDark
                    ? "text-slate-500 hover:text-slate-300"
                    : "text-slate-400 hover:text-slate-700"
                }
              `}
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />

              Go back to previous page
            </button>

            {/* Divider */}

            <div className="mx-auto mt-12 flex max-w-md items-center gap-4">
              <div
                className={`
                  h-px
                  flex-1
                  ${
                    isDark
                      ? "bg-slate-800"
                      : "bg-slate-200"
                  }
                `}
              />

              <div
                className={`
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  border
                  ${borderColor}
                  ${cardBg}
                `}
              >
                <Search
                  className={`h-3.5 w-3.5 ${
                    isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                />
              </div>

              <div
                className={`
                  h-px
                  flex-1
                  ${
                    isDark
                      ? "bg-slate-800"
                      : "bg-slate-200"
                  }
                `}
              />
            </div>

            <p
              className={`
                mt-5
                text-[11px]
                font-medium
                ${
                  isDark
                    ? "text-slate-600"
                    : "text-slate-400"
                }
              `}
            >
              Error 404 · The requested
              page could not be found
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default NotFoundPage;