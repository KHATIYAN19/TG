import React from "react";
import {
  XCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ADK_PAYMENT_URL from "../utils/adk_payment_url";

const PaymentFailed = () => {
  const navigate = useNavigate();

  const handleBackToEbook = () => {
    navigate("/ebook/googleADK", {
      replace: true,
    });
  };

  const handleTryAgain = () => {
    window.location.href = ADK_PAYMENT_URL;
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">

      <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">

        <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

          {/* HEADER */}

          <div className="px-6 py-12 text-center sm:px-12 sm:py-16">

            {/* FAILED ICON */}

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-50">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">

                <XCircle
                  size={40}
                  strokeWidth={2.5}
                  className="text-red-600"
                />

              </div>

            </div>

            {/* TITLE */}

            <h1 className="mt-7 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Payment Failed
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
              Unfortunately, we couldn't complete your payment.
              Your order has not been completed.
            </p>

            {/* PAYMENT DETAILS */}

            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-red-100 bg-red-50 p-5 text-left sm:p-6">

              <div className="flex items-start gap-3">

                <AlertCircle
                  size={22}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div className="flex-1">

                  <p className="font-bold text-red-700">
                    Payment was unsuccessful
                  </p>

                  <p className="mt-2 text-sm leading-6 text-red-600">
                    No payment was successfully completed for
                    <span className="font-semibold">
                      {" "}Build AI Agents with Google ADK
                    </span>.
                  </p>

                </div>

              </div>

            </div>

            {/* DETAILS CARD */}

            <div className="mx-auto mt-6 max-w-xl overflow-hidden rounded-2xl border border-slate-200">

              <div className="grid grid-cols-2 border-b border-slate-200">

                <div className="border-r border-slate-200 bg-slate-50 px-5 py-4 text-left">

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Product
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    Google ADK Ebook
                  </p>

                </div>

                <div className="bg-slate-50 px-5 py-4 text-left">

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Amount
                  </p>

                  <div className="mt-1 flex items-center gap-2">

                    <span className="text-xs text-slate-400 line-through">
                      ₹299
                    </span>

                    <span className="text-sm font-bold text-slate-800">
                      ₹149
                    </span>

                  </div>

                </div>

              </div>

              <div className="grid grid-cols-2">

                <div className="border-r border-slate-200 px-5 py-4 text-left">

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </p>

                  <p className="mt-1 text-sm font-bold text-red-600">
                    Failed
                  </p>

                </div>

                <div className="px-5 py-4 text-left">

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Ebook Access
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    Not Generated
                  </p>

                </div>

              </div>

            </div>

            {/* POSSIBLE REASONS */}

            <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-slate-200 bg-white p-5 text-left">

              <p className="font-semibold text-slate-800">
                What can you do?
              </p>

              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-500">

                <li>
                  • Check your internet connection and try again.
                </li>

                <li>
                  • Make sure your payment method has sufficient balance.
                </li>

                <li>
                  • If the amount was deducted, please contact your
                  bank/payment provider before making another payment.
                </li>

              </ul>

            </div>

            {/* TRY AGAIN */}

            <button
              type="button"
              onClick={handleTryAgain}
              className="mt-8 inline-flex w-full max-w-xl items-center justify-center gap-3 rounded-xl bg-blue-600 px-7 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99]"
            >
              <RefreshCw size={20} />
              Try Payment Again
            </button>

            {/* BACK BUTTON */}

            <button
              type="button"
              onClick={handleBackToEbook}
              className="mt-3 inline-flex w-full max-w-xl items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
              Back to Ebook
            </button>

          </div>

          {/* FOOTER */}

          <div className="border-t border-slate-100 bg-slate-50 px-6 py-6 text-center">

            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">

              <ShieldAlert size={16} />

              Secure payment powered by Target Trek

            </div>

            <p className="mt-2 text-xs text-slate-400">
              If your account was charged despite the failure,
              please contact your payment provider before trying again.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default PaymentFailed;