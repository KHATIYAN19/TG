// import React, { useEffect, useState } from "react";
// import {
//   AlertCircle,
//   ArrowLeft,
//   Mail,
// } from "lucide-react";
// import {
//   Link,
//   useSearchParams,
// } from "react-router-dom";

// const getStoredTheme = () => {
//   if (typeof window === "undefined") {
//     return "light";
//   }

//   try {
//     const storedTheme = localStorage.getItem("theme");

//     return storedTheme === "dark"
//       ? "dark"
//       : "light";
//   } catch {
//     return "light";
//   }
// };

// export default function PaymentFailed() {
//   const [searchParams] = useSearchParams();

//   const [theme, setTheme] = useState(() =>
//     getStoredTheme()
//   );

//   const orderId = searchParams.get("order");

//   const isDark = theme === "dark";

//   useEffect(() => {
//     const syncTheme = () => {
//       const currentTheme =
//         getStoredTheme();

//       setTheme((previousTheme) =>
//         previousTheme !== currentTheme
//           ? currentTheme
//           : previousTheme
//       );
//     };

//     syncTheme();

//     const handleStorage = (event) => {
//       if (
//         event.key === "theme" ||
//         event.key === null
//       ) {
//         syncTheme();
//       }
//     };

//     const handleVisibilityChange = () => {
//       if (!document.hidden) {
//         syncTheme();
//       }
//     };

//     const interval = setInterval(
//       syncTheme,
//       200
//     );

//     window.addEventListener(
//       "storage",
//       handleStorage
//     );

//     window.addEventListener(
//       "focus",
//       syncTheme
//     );

//     document.addEventListener(
//       "visibilitychange",
//       handleVisibilityChange
//     );

//     return () => {
//       clearInterval(interval);

//       window.removeEventListener(
//         "storage",
//         handleStorage
//       );

//       window.removeEventListener(
//         "focus",
//         syncTheme
//       );

//       document.removeEventListener(
//         "visibilitychange",
//         handleVisibilityChange
//       );
//     };
//   }, []);

//   return (
//     <div
//       className={`flex min-h-screen items-center justify-center px-3 py-6 transition-colors duration-300 sm:px-4 sm:py-10 ${
//         isDark
//           ? "bg-slate-950"
//           : "bg-slate-50"
//       }`}
//     >
//       <div
//         className={`w-full max-w-lg rounded-2xl border p-5 text-center shadow-xl transition-colors duration-300 sm:rounded-3xl sm:p-9 ${
//           isDark
//             ? "border-slate-800 bg-slate-900 shadow-black/30"
//             : "border-slate-200 bg-white shadow-slate-200/70"
//         }`}
//       >
//         <div
//           className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl transition-colors sm:h-16 sm:w-16 ${
//             isDark
//               ? "bg-red-500/10 ring-1 ring-inset ring-red-500/20"
//               : "bg-red-50"
//           }`}
//         >
//           <AlertCircle
//             size={30}
//             className={
//               isDark
//                 ? "text-red-400"
//                 : "text-red-600"
//             }
//           />
//         </div>

//         <h1
//           className={`mt-5 text-xl font-black leading-tight transition-colors sm:text-3xl ${
//             isDark
//               ? "text-white"
//               : "text-slate-950"
//           }`}
//         >
//           Payment wasn't completed
//         </h1>

//         <p
//           className={`mx-auto mt-3 max-w-sm text-sm leading-6 transition-colors ${
//             isDark
//               ? "text-slate-400"
//               : "text-slate-500"
//           }`}
//         >
//           We could not confirm your payment. You can
//           return to the book and try again.
//         </p>

//         {orderId && (
//           <div
//             className={`mt-5 rounded-xl border px-3 py-3 transition-colors sm:px-4 ${
//               isDark
//                 ? "border-slate-800 bg-slate-950/70"
//                 : "border-slate-100 bg-slate-50"
//             }`}
//           >
//             <p
//               className={`text-xs transition-colors ${
//                 isDark
//                   ? "text-slate-500"
//                   : "text-slate-400"
//               }`}
//             >
//               Order ID
//             </p>

//             <p
//               className={`mt-1 break-all text-sm font-bold transition-colors ${
//                 isDark
//                   ? "text-slate-200"
//                   : "text-slate-700"
//               }`}
//             >
//               {orderId}
//             </p>
//           </div>
//         )}

//         <div
//           className={`mt-5 rounded-xl border p-4 text-left transition-colors sm:mt-6 sm:rounded-2xl ${
//             isDark
//               ? "border-amber-500/20 bg-amber-500/10"
//               : "border-amber-200 bg-amber-50"
//           }`}
//         >
//           <p
//             className={`text-sm font-bold transition-colors ${
//               isDark
//                 ? "text-amber-300"
//                 : "text-amber-900"
//             }`}
//           >
//             Was money deducted?
//           </p>

//           <p
//             className={`mt-1 text-xs leading-5 transition-colors ${
//               isDark
//                 ? "text-amber-200/80"
//                 : "text-amber-800"
//             }`}
//           >
//             Please do not immediately make another
//             payment. Contact us with your order ID so
//             we can verify the transaction.
//           </p>
//         </div>

//         <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:gap-3">
//           <Link
//             to="/books"
//             className={`flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition sm:px-5 ${
//               isDark
//                 ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
//                 : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
//             }`}
//           >
//             <ArrowLeft size={16} />

//             Back to Books
//           </Link>

//           <a
//             href="mailto:supporttargettrek@gmail.com"
//             className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:px-5"
//           >
//             <Mail size={16} />

//             Contact Support
//           </a>
//         </div>

//         <div
//           className={`mt-5 border-t pt-4 text-[11px] leading-5 transition-colors sm:mt-6 ${
//             isDark
//               ? "border-slate-800 text-slate-500"
//               : "border-slate-100 text-slate-400"
//           }`}
//         >
//           If your payment was deducted, please contact
//           support before attempting another transaction.
//         </div>
//       </div>
//     </div>
//   );
// }

import React, {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  Code2,
  CreditCard,
  ExternalLink,
  HelpCircle,
  Layers3,
  LockKeyhole,
  Mail,
  MessageSquareText,
  Network,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

/* ==========================================================
   CONFIGURATION
========================================================== */

const THEME_KEY = "theme";

const THEME_EVENT =
  "targettrek-theme-change";

const SUPPORT_EMAIL =
  "supporttargettrek@gmail.com";

const BOOKS_PAGE = "/books";

const MOCK_INTERVIEW_PAGE =
  "/mock-interviews";

/* ==========================================================
   THEME HELPERS
========================================================== */

function getStoredTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const storedTheme =
      localStorage.getItem(THEME_KEY);

    if (storedTheme === "dark") {
      return "dark";
    }

    if (storedTheme === "light") {
      return "light";
    }

    return document.documentElement.classList
      .contains("dark")
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

/* ==========================================================
   MOCK INTERVIEW FEATURE
========================================================== */

function InterviewFeature({
  Icon,
  title,
  description,
  isDark,
}) {
  return (
    <div
      className={`
        flex items-start
        gap-3 rounded-2xl
        border p-4
        ${
          isDark
            ? "border-[#493528] bg-[#241a14]"
            : "border-orange-100 bg-white"
        }
      `}
    >
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
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-extrabold">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-6 opacity-70">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ==========================================================
   MOCK INTERVIEW PROMOTION CARD
========================================================== */

function MockInterviewCard({
  isDark,
}) {
  const features = [
    {
      Icon: Code2,
      title: "DSA & Coding",
      description:
        "Practice coding questions, problem-solving approaches and complexity analysis.",
    },
    {
      Icon: Layers3,
      title: "Low-Level Design",
      description:
        "Discuss OOP, SOLID principles, design patterns and concurrency.",
    },
    {
      Icon: Network,
      title: "System Design",
      description:
        "Learn to explain scalable systems, APIs, databases and architecture trade-offs.",
    },
    {
      Icon: BrainCircuit,
      title: "GenAI & Projects",
      description:
        "Practice RAG, AI agents, technical projects and production engineering discussions.",
    },
  ];

  return (
    <section
      className={`
        relative mt-7
        overflow-hidden
        rounded-[28px]
        border
        ${
          isDark
            ? "border-orange-900/60 bg-[#20150e]"
            : "border-orange-200 bg-[#fff3e7]"
        }
      `}
    >
      <div
        className="
          pointer-events-none
          absolute -right-20
          -top-24 h-80 w-80
          rounded-full
          bg-orange-500/15
          blur-3xl
        "
      />

      <div
        className="
          relative grid
          gap-8 p-6
          sm:p-8
          lg:grid-cols-[1.05fr_.95fr]
          lg:items-center
          lg:p-10
        "
      >
        {/* LEFT CONTENT */}

        <div>
          <div
            className={`
              inline-flex items-center
              gap-2 rounded-full
              px-3 py-2
              text-[11px] font-black
              uppercase tracking-[0.12em]
              ${
                isDark
                  ? "bg-orange-500/15 text-orange-300"
                  : "bg-orange-100 text-orange-700"
              }
            `}
          >
            <Video size={15} />
            Target Trek Mock Interviews
          </div>

          <h2
            className="
              mt-5 text-2xl
              font-black leading-tight
              tracking-tight
              sm:text-3xl
              lg:text-[35px]
            "
          >
            Preparing for your next
            technical interview?

            <span className="mt-2 block text-orange-500">
              Practice before the real one.
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-8 opacity-75 sm:text-base">
            Technical interview preparation
            involves more than learning concepts.
            You also need to explain your
            approach, answer follow-up questions
            and defend your technical decisions.

            Book a live, personalized mock
            interview to practice these skills
            in an interview-style environment.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {[
              "Live 1:1 sessions",
              "Choose interview topics",
              "Realistic technical discussions",
            ].map((feature) => (
              <span
                key={feature}
                className={`
                  inline-flex items-center
                  gap-2 rounded-full
                  border px-3 py-2
                  text-xs font-bold
                  ${
                    isDark
                      ? "border-orange-900 bg-orange-950/20"
                      : "border-orange-200 bg-white/75"
                  }
                `}
              >
                <Check
                  size={14}
                  className="text-orange-500"
                />

                {feature}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={MOCK_INTERVIEW_PAGE}
              className="
                inline-flex min-h-12
                items-center justify-center
                gap-2 rounded-xl
                bg-orange-600
                px-6 py-3
                text-sm font-extrabold
                text-white
                transition
                hover:bg-orange-700
              "
            >
              <CalendarDays size={18} />

              Book a Mock Interview

              <ArrowRight size={17} />
            </Link>

            <Link
              to={MOCK_INTERVIEW_PAGE}
              className={`
                inline-flex min-h-12
                items-center justify-center
                gap-2 rounded-xl border
                px-5 py-3
                text-sm font-bold
                transition
                ${
                  isDark
                    ? "border-stone-700 bg-stone-900 hover:bg-stone-800"
                    : "border-orange-200 bg-white hover:bg-orange-50"
                }
              `}
            >
              Explore Available Slots

              <ExternalLink size={16} />
            </Link>
          </div>

          <p className="mt-4 text-xs leading-6 opacity-60">
            Select an available interview
            slot, choose your preferred
            topics and complete your booking.
          </p>
        </div>

        {/* RIGHT FEATURE CARDS */}

        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <InterviewFeature
              key={feature.title}
              {...feature}
              isDark={isDark}
            />
          ))}

          <div
            className={`
              rounded-2xl border
              p-5 sm:col-span-2
              ${
                isDark
                  ? "border-orange-900 bg-orange-950/20"
                  : "border-orange-200 bg-white/80"
              }
            `}
          >
            <div className="flex items-start gap-3">
              <MessageSquareText
                size={22}
                className="mt-1 shrink-0 text-orange-500"
              />

              <div>
                <h3 className="text-sm font-extrabold">
                  Learn to communicate
                  your solutions
                </h3>

                <p className="mt-2 text-xs leading-6 opacity-70">
                  Get comfortable explaining
                  your reasoning, discussing
                  alternative approaches
                  and responding to interview
                  follow-up questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================
   MAIN PAYMENT FAILED COMPONENT
========================================================== */

export default function PaymentFailed() {
  const [searchParams] =
    useSearchParams();

  const orderId =
    searchParams.get("order");

  /* --------------------------------------------------------
     THEME STATE
  -------------------------------------------------------- */

  const [theme, setTheme] =
    useState(getStoredTheme);

  const isDark =
    theme === "dark";

  /* --------------------------------------------------------
     THEME SYNCHRONIZATION
  -------------------------------------------------------- */

  useEffect(() => {
    const syncTheme = () => {
      setTheme(getStoredTheme());
    };

    const handleThemeEvent = (event) => {
      const nextTheme =
        event?.detail?.theme;

      if (
        nextTheme === "light" ||
        nextTheme === "dark"
      ) {
        setTheme(nextTheme);
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
      "storage",
      handleStorageChange
    );

    window.addEventListener(
      "focus",
      syncTheme
    );

    window.addEventListener(
      THEME_EVENT,
      handleThemeEvent
    );

    window.addEventListener(
      "themechange",
      handleThemeEvent
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
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        "focus",
        syncTheme
      );

      window.removeEventListener(
        THEME_EVENT,
        handleThemeEvent
      );

      window.removeEventListener(
        "themechange",
        handleThemeEvent
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      observer.disconnect();
    };
  }, []);

  /* --------------------------------------------------------
     LOCAL DESIGN VARIABLES

     All theme colors are derived
     from React's isDark state.
  -------------------------------------------------------- */

  const pageBg = isDark
    ? "bg-[#110e0c]"
    : "bg-[#fffaf5]";

  const cardBg = isDark
    ? "bg-[#211a15]"
    : "bg-white";

  const softBg = isDark
    ? "bg-[#2d2119]"
    : "bg-[#fff3e8]";

  const border = isDark
    ? "border-[#403027]"
    : "border-[#f1dfd1]";

  const primaryText = isDark
    ? "text-[#fff8f0]"
    : "text-[#29201a]";

  const secondaryText = isDark
    ? "text-[#bca99b]"
    : "text-[#76665a]";

  const mutedText = isDark
    ? "text-[#ddcfc3]"
    : "text-[#594a40]";

  const primaryButton = `
    inline-flex
    min-h-[46px]
    items-center
    justify-center
    gap-2
    rounded-xl
    bg-orange-600
    px-5 py-3
    text-sm
    font-extrabold
    text-white
    transition
    hover:bg-orange-700
  `;

  const secondaryButton = `
    inline-flex
    min-h-[46px]
    items-center
    justify-center
    gap-2
    rounded-xl
    border
    px-5 py-3
    text-sm
    font-bold
    transition
    ${border}
    ${
      isDark
        ? "bg-[#2b211b] text-[#f8ede4] hover:bg-[#382a21]"
        : "bg-white text-[#4c3526] hover:bg-orange-50"
    }
  `;

  /* ========================================================
     RETURN JSX
  ======================================================== */

  return (
    <main
      data-theme={theme}
      className={`
        min-h-screen
        w-full
        px-4
        pb-20
        pt-[115px]
        font-sans
        transition-colors
        duration-300
        sm:px-6
        lg:px-8
        ${pageBg}
        ${primaryText}
      `}
    >
      <div className="mx-auto max-w-6xl">

        {/* ======================================
            PAYMENT FAILURE HEADER
        ====================================== */}

        <section
          className={`
            relative
            overflow-hidden
            rounded-[28px]
            border
            p-6
            sm:p-8
            ${border}
            ${
              isDark
                ? "bg-gradient-to-br from-[#321b13] via-[#261a14] to-[#211a15]"
                : "bg-gradient-to-br from-[#fff0e5] via-[#fff8f0] to-white"
            }
          `}
        >
          <div
            className="
              pointer-events-none
              absolute -right-20
              -top-24
              h-72 w-72
              rounded-full
              bg-orange-400/15
              blur-3xl
            "
          />

          <div
            className="
              relative
              flex flex-col
              gap-6
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div className="flex items-start gap-4">
              <div
                className="
                  flex h-14 w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-red-500/10
                  text-red-500
                  ring-1
                  ring-inset
                  ring-red-500/20
                "
              >
                <AlertCircle size={29} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-orange-500">
                  Target Trek · Payment update
                </p>

                <h1
                  className="
                    mt-2 text-2xl
                    font-black
                    tracking-tight
                    sm:text-4xl
                  "
                >
                  Payment wasn't completed
                </h1>

                <p
                  className={`
                    mt-3
                    max-w-2xl
                    text-sm
                    leading-7
                    ${secondaryText}
                  `}
                >
                  We couldn't confirm
                  a successful payment
                  for your purchase.

                  This can happen if checkout
                  was cancelled, interrupted
                  or the transaction
                  wasn't completed.
                </p>
              </div>
            </div>

            <div
              className={`
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-full
                border
                px-4 py-2
                text-xs
                font-extrabold
                ${
                  isDark
                    ? "border-orange-900 bg-orange-500/10 text-orange-300"
                    : "border-orange-200 bg-white text-orange-700"
                }
              `}
            >
              <ShieldCheck size={16} />

              Payment not confirmed
            </div>
          </div>
        </section>

        {/* ======================================
            ORDER INFORMATION
        ====================================== */}

        {orderId && (
          <section
            className={`
              mt-6 rounded-3xl
              border p-5
              shadow-sm
              sm:p-7
              ${border}
              ${cardBg}
            `}
          >
            <div className="flex items-start gap-4">
              <div
                className={`
                  flex h-12 w-12
                  shrink-0 items-center
                  justify-center
                  rounded-xl
                  ${softBg}
                `}
              >
                <CreditCard
                  size={22}
                  className="text-orange-500"
                />
              </div>

              <div className="min-w-0">
                <p
                  className={`
                    text-xs
                    font-bold
                    uppercase
                    tracking-widest
                    ${secondaryText}
                  `}
                >
                  Your payment reference
                </p>

                <h2 className="mt-2 text-lg font-black">
                  Order details
                </h2>

                <p
                  className={`
                    mt-3
                    text-xs
                    ${secondaryText}
                  `}
                >
                  Order ID
                </p>

                <p className="mt-1 break-all text-sm font-extrabold">
                  {orderId}
                </p>

                <p
                  className={`
                    mt-3 text-sm
                    leading-7
                    ${secondaryText}
                  `}
                >
                  Keep this order
                  reference if you
                  contact our support team.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ======================================
            PAYMENT HELP CARD
        ====================================== */}

        <section
          className={`
            mt-6 rounded-3xl
            border p-5
            sm:p-7
            ${
              isDark
                ? "border-amber-900/50 bg-amber-950/20"
                : "border-amber-200 bg-amber-50"
            }
          `}
        >
          <div className="flex items-start gap-4">
            <div
              className="
                flex h-12 w-12
                shrink-0 items-center
                justify-center
                rounded-xl
                bg-amber-500/15
                text-amber-500
              "
            >
              <AlertTriangle size={23} />
            </div>

            <div>
              <h2 className="text-lg font-black">
                Was money deducted?
              </h2>

              <p
                className={`
                  mt-3 text-sm
                  leading-7
                  ${secondaryText}
                `}
              >
                If money was debited
                from your bank account
                but this page shows
                an unsuccessful payment,
                please don't immediately
                pay again.

                Contact our support team
                with your order reference
                so the transaction can
                be checked.
              </p>

              <a
                href={`mailto:${SUPPORT_EMAIL}${
                  orderId
                    ? `?subject=${encodeURIComponent(
                        `Payment assistance - ${orderId}`
                      )}`
                    : ""
                }`}
                className={`
                  ${secondaryButton}
                  mt-5
                `}
              >
                <Mail size={17} />

                Contact Payment Support

                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>

        {/* ======================================
            WHAT TO DO NEXT
        ====================================== */}

        <section
          className={`
            mt-6 rounded-3xl
            border p-6
            sm:p-8
            ${border}
            ${cardBg}
          `}
        >
          <div className="flex items-center gap-3">
            <HelpCircle
              size={24}
              className="text-orange-500"
            />

            <h2 className="text-xl font-black">
              What can you do next?
            </h2>
          </div>

          <p
            className={`
              mt-3 text-sm
              leading-7
              ${secondaryText}
            `}
          >
            Choose the appropriate
            next step depending on
            what happened during checkout.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Check your payment",
                description:
                  "If your bank shows a debit, contact support with the order reference before trying another payment.",
                Icon: ShieldCheck,
              },
              {
                number: "02",
                title: "Return to the books",
                description:
                  "If no payment was deducted, browse your books and start a new checkout when you're ready.",
                Icon: BookOpen,
              },
              {
                number: "03",
                title: "Contact our team",
                description:
                  "Share the issue and order ID so our support team can help you understand the transaction status.",
                Icon: Mail,
              },
            ].map((step) => (
              <div
                key={step.number}
                className={`
                  rounded-2xl
                  border p-5
                  ${border}
                  ${softBg}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-500">
                    STEP {step.number}
                  </span>

                  <step.Icon
                    size={19}
                    className="text-orange-500"
                  />
                </div>

                <h3 className="mt-4 text-sm font-extrabold">
                  {step.title}
                </h3>

                <p
                  className={`
                    mt-3 text-xs
                    leading-7
                    ${secondaryText}
                  `}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* ACTION BUTTONS */}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              to={BOOKS_PAGE}
              className={secondaryButton}
            >
              <ArrowLeft size={17} />

              Back to Books
            </Link>

            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className={primaryButton}
            >
              <Mail size={17} />

              Contact Support

              <ArrowRight size={17} />
            </a>
          </div>
        </section>

        {/* ======================================
            MOCK INTERVIEW CARD
        ====================================== */}

        <MockInterviewCard
          isDark={isDark}
        />

        {/* ======================================
            BOTTOM FOOTER
        ====================================== */}

        <div
          className="
            mt-9 flex
            flex-col gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <Link
            to={BOOKS_PAGE}
            className={secondaryButton}
          >
            <BookOpen size={17} />

            Explore Our Books

            <ArrowRight size={16} />
          </Link>

          <p
            className={`
              text-center
              text-xs
              leading-6
              ${secondaryText}
            `}
          >
            Need assistance?
            {" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-bold text-orange-500 hover:underline"
            >
              Contact Target Trek Support
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
