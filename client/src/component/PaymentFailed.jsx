import React from "react";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ADK_PAYMENT_URL from "../utils/adk_payment_url";
const GOOGLE_ADK_PRICE = Number(
  import.meta.env.VITE_GOOGLE_ADK_PRICE
);

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
    <div className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-red-200/50 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(15,23,42,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.35) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-start px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20 lg:px-8 lg:pt-24">
        <div className="w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 backdrop-blur">
          {/* Top brand bar */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                <BookOpen size={19} className="text-indigo-600" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Digital Handbook
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  Google ADK Complete Developer Handbook
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 sm:flex">
              <ShieldAlert size={14} />
              Secure Checkout
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            {/* Main status panel */}
            <div className="px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-18">
              <div className="max-w-2xl">
                {/* Status icon */}
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-red-200 bg-red-50 shadow-inner shadow-red-100">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
                    <XCircle
                      size={34}
                      strokeWidth={2.2}
                      className="text-red-600"
                    />
                  </div>
                </div>

                <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-red-600">
                  <AlertCircle size={14} />
                  Payment not completed
                </div>

                <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                  Payment couldn’t be completed.
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                  We couldn’t confirm a successful payment for your Google ADK
                  handbook purchase. No ebook access has been generated from
                  this transaction.
                </p>

                {/* Product card */}
                <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50">
                      <BookOpen size={21} className="text-indigo-600" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            Google ADK Complete Developer Handbook
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            2nd Edition • 32 Chapters • Digital PDF
                          </p>
                        </div>

                        <div className="shrink-0">
                          <span className="text-xs text-slate-400 line-through">
                            ₹299
                          </span>
                          <span className="ml-2 text-lg font-bold text-slate-900">
                      ₹{GOOGLE_ADK_PRICE}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {[
                          "RAG",
                          "MCP",
                          "A2A",
                          "Evaluation",
                          "Deployment",
                          "Security",
                        ].map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Try again */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-[0.99]"
                  >
                    <RefreshCw size={18} />
                    Try Payment Again
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToEbook}
                    className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]"
                  >
                    <ArrowLeft size={18} />
                    Back to Ebook
                  </button>
                </div>

                <p className="mt-4 text-center text-xs leading-5 text-slate-400 sm:text-left">
                  You can return to the product page and review the handbook
                  details before trying the payment again.
                </p>
              </div>
            </div>

            {/* Guidance panel */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-10 sm:px-10 sm:py-12 lg:border-l lg:border-t-0 lg:px-10 lg:py-14">
              <div className="mx-auto max-w-md lg:pt-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                  <Sparkles size={14} />
                  What to check
                </div>

                <h2 className="mt-5 text-2xl font-bold text-slate-900">
                  Before trying again
                </h2>

                <div className="mt-6 space-y-3">
                  {[
                    {
                      title: "Check your connection",
                      text: "Make sure your internet connection is stable before restarting checkout.",
                    },
                    {
                      title: "Check your payment method",
                      text: "Confirm that your card, UPI, or payment method is active and has sufficient balance or limit.",
                    },
                    {
                      title: "Check for a bank deduction",
                      text: "If money was deducted, avoid making another payment immediately and first confirm the transaction status with your bank or payment provider.",
                    },
                  ].map((item, index) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
                          {index + 1}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {item.title}
                          </p>
                          <p className="mt-1.5 text-sm leading-6 text-slate-600">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment state */}
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Transaction status
                  </p>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">Payment</span>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600">
                        <XCircle size={15} />
                        Not confirmed
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        Ebook access
                      </span>
                      <span className="text-sm font-semibold text-slate-700">
                        Not generated
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-slate-500">
                        Product price
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                      ₹{GOOGLE_ADK_PRICE}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Support */}
                <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-indigo-600"
                    />

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Need help?
                      </p>

                      <p className="mt-1.5 text-sm leading-6 text-slate-600">
                        For payment issues or an unexpected deduction, contact
                        support and include your payment details or screenshot.
                      </p>

                      <a
                        href="mailto:supporttargettrek@gmail.com"
                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                      >
                        supporttargettrek@gmail.com
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-slate-50 px-6 py-5 sm:px-8">
            <div className="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <p className="text-xs text-slate-500">
                Google ADK Complete Developer Handbook • 2nd Edition
              </p>

              <p className="text-xs text-slate-500">
                Support:{" "}
                <a
                  href="mailto:supporttargettrek@gmail.com"
                  className="text-slate-600 transition hover:text-slate-900"
                >
                  supporttargettrek@gmail.com
                </a>
              </p>
            </div>

            <p className="mt-2 text-center text-[11px] leading-5 text-slate-400">
              A failed payment does not grant ebook access. If your bank shows
              a debit, verify the transaction status with your payment provider
              before attempting another payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
