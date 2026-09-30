// import React from "react";
// import {
//   AlertCircle,
//   ArrowLeft,
//   Mail,
//   RefreshCw,
// } from "lucide-react";
// import { Link, useSearchParams } from "react-router-dom";

// export default function PaymentFailed() {
//   const [searchParams] = useSearchParams();

//   const orderId = searchParams.get("order");

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
//       <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-9">
//         <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
//           <AlertCircle size={30} className="text-red-600" />
//         </div>

//         <h1 className="mt-5 text-2xl font-black text-slate-950 sm:text-3xl">
//           Payment wasn't completed
//         </h1>

//         <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
//           We could not confirm your payment. You can return to the
//           book and try again.
//         </p>

//         {orderId && (
//           <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
//             <p className="text-xs text-slate-400">Order ID</p>

//             <p className="mt-1 break-all text-sm font-bold text-slate-700">
//               {orderId}
//             </p>
//           </div>
//         )}

//         <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left">
//           <p className="text-sm font-bold text-amber-900">
//             Was money deducted?
//           </p>

//           <p className="mt-1 text-xs leading-5 text-amber-800">
//             Please do not immediately make another payment. Contact
//             us with your order ID so we can verify the transaction.
//           </p>
//         </div>

//         <div className="mt-6 flex flex-col gap-3 sm:flex-row">
//           <Link
//             to="/books"
//             className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
//           >
//             <ArrowLeft size={16} />
//             Back to Books
//           </Link>

//           <a
//             href="mailto:supporttargettrek@gmail.com"
//             className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
//           >
//             <Mail size={16} />
//             Contact Support
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Mail,
} from "lucide-react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const storedTheme = localStorage.getItem("theme");

    return storedTheme === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

export default function PaymentFailed() {
  const [searchParams] = useSearchParams();

  const [theme, setTheme] = useState(() =>
    getStoredTheme()
  );

  const orderId = searchParams.get("order");

  const isDark = theme === "dark";

  useEffect(() => {
    const syncTheme = () => {
      const currentTheme =
        getStoredTheme();

      setTheme((previousTheme) =>
        previousTheme !== currentTheme
          ? currentTheme
          : previousTheme
      );
    };

    syncTheme();

    const handleStorage = (event) => {
      if (
        event.key === "theme" ||
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

    const interval = setInterval(
      syncTheme,
      200
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    window.addEventListener(
      "focus",
      syncTheme
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      clearInterval(interval);

      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        "focus",
        syncTheme
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  return (
    <div
      className={`flex min-h-screen items-center justify-center px-3 py-6 transition-colors duration-300 sm:px-4 sm:py-10 ${
        isDark
          ? "bg-slate-950"
          : "bg-slate-50"
      }`}
    >
      <div
        className={`w-full max-w-lg rounded-2xl border p-5 text-center shadow-xl transition-colors duration-300 sm:rounded-3xl sm:p-9 ${
          isDark
            ? "border-slate-800 bg-slate-900 shadow-black/30"
            : "border-slate-200 bg-white shadow-slate-200/70"
        }`}
      >
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl transition-colors sm:h-16 sm:w-16 ${
            isDark
              ? "bg-red-500/10 ring-1 ring-inset ring-red-500/20"
              : "bg-red-50"
          }`}
        >
          <AlertCircle
            size={30}
            className={
              isDark
                ? "text-red-400"
                : "text-red-600"
            }
          />
        </div>

        <h1
          className={`mt-5 text-xl font-black leading-tight transition-colors sm:text-3xl ${
            isDark
              ? "text-white"
              : "text-slate-950"
          }`}
        >
          Payment wasn't completed
        </h1>

        <p
          className={`mx-auto mt-3 max-w-sm text-sm leading-6 transition-colors ${
            isDark
              ? "text-slate-400"
              : "text-slate-500"
          }`}
        >
          We could not confirm your payment. You can
          return to the book and try again.
        </p>

        {orderId && (
          <div
            className={`mt-5 rounded-xl border px-3 py-3 transition-colors sm:px-4 ${
              isDark
                ? "border-slate-800 bg-slate-950/70"
                : "border-slate-100 bg-slate-50"
            }`}
          >
            <p
              className={`text-xs transition-colors ${
                isDark
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              Order ID
            </p>

            <p
              className={`mt-1 break-all text-sm font-bold transition-colors ${
                isDark
                  ? "text-slate-200"
                  : "text-slate-700"
              }`}
            >
              {orderId}
            </p>
          </div>
        )}

        <div
          className={`mt-5 rounded-xl border p-4 text-left transition-colors sm:mt-6 sm:rounded-2xl ${
            isDark
              ? "border-amber-500/20 bg-amber-500/10"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <p
            className={`text-sm font-bold transition-colors ${
              isDark
                ? "text-amber-300"
                : "text-amber-900"
            }`}
          >
            Was money deducted?
          </p>

          <p
            className={`mt-1 text-xs leading-5 transition-colors ${
              isDark
                ? "text-amber-200/80"
                : "text-amber-800"
            }`}
          >
            Please do not immediately make another
            payment. Contact us with your order ID so
            we can verify the transaction.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row sm:gap-3">
          <Link
            to="/books"
            className={`flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition sm:px-5 ${
              isDark
                ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <ArrowLeft size={16} />

            Back to Books
          </Link>

          <a
            href="mailto:supporttargettrek@gmail.com"
            className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:px-5"
          >
            <Mail size={16} />

            Contact Support
          </a>
        </div>

        <div
          className={`mt-5 border-t pt-4 text-[11px] leading-5 transition-colors sm:mt-6 ${
            isDark
              ? "border-slate-800 text-slate-500"
              : "border-slate-100 text-slate-400"
          }`}
        >
          If your payment was deducted, please contact
          support before attempting another transaction.
        </div>
      </div>
    </div>
  );
}