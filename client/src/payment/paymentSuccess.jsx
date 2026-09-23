import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  BookOpen,
  ShieldCheck,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

const BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  "https://target-trek.onrender.com";

const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const orderId = searchParams.get("order");

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAccessModal, setShowAccessModal] =
    useState(false);

  const [acceptedTerms, setAcceptedTerms] =
    useState(false);

  const [pdfUnlocked, setPdfUnlocked] =
    useState(false);

  // ============================================================
  // LOAD PURCHASED BOOK
  // ============================================================

  useEffect(() => {
    if (!token) {
      if (orderId) {
        setError(
          "Your payment was already processed. If you need access again, please contact support."
        );
      } else {
        setError("Book access token is missing.");
      }

      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadPurchasedBook = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${BASE_URL}/payment/payu/access?token=${encodeURIComponent(
            token
          )}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        const result = await response
          .json()
          .catch(() => null);

        if (
          !response.ok ||
          !result?.success ||
          !result?.data
        ) {
          throw new Error(
            result?.message ||
              "Unable to access your purchased ebook."
          );
        }

        // Save verified book information.
        setBook(result.data);

        // Show conditions before showing the PDF.
        setShowAccessModal(true);

        // Remove sensitive token from browser address bar.
        window.history.replaceState(
          {},
          document.title,
          "/payment/success"
        );
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }

        console.error(
          "Purchased book access error:",
          error
        );

        setError(
          error?.message ||
            "Unable to access your purchased ebook."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadPurchasedBook();

    return () => {
      controller.abort();
    };
  }, [token, orderId]);

  // ============================================================
  // OPEN PDF
  // ============================================================

  const handleGetPdf = () => {
    if (!acceptedTerms) {
      return;
    }

    setPdfUnlocked(true);
    setShowAccessModal(false);
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pt-24">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <Loader2
              size={30}
              className="animate-spin text-blue-600"
            />
          </div>

          <h1 className="mt-5 text-xl font-black text-slate-950">
            Preparing your ebook
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            We're verifying your secure access.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error || !book) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 pb-10 pt-28">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-9">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle
              size={27}
              className="text-red-600"
            />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-950">
            Unable to open ebook
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            If your payment was deducted, please do not
            pay again.
            <br />
            Contact{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-bold text-blue-600 hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>

          <Link
            to="/books"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Go to Books
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // SUCCESS
  // ============================================================

  return (
    <>
      <div className="min-h-screen bg-slate-50 px-4 pb-10 pt-28 sm:px-6 sm:pb-12 sm:pt-32">
        <div className="mx-auto max-w-7xl">

          {/* ===================================================
              PAYMENT SUCCESS
          =================================================== */}

          <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
                <CheckCircle2
                  size={26}
                  className="text-emerald-700"
                />
              </div>

              <div className="flex-1">
                <h1 className="text-xl font-black text-emerald-950 sm:text-2xl">
                  Payment Successful
                </h1>

                <p className="mt-1 text-sm text-emerald-800">
                  Your purchase has been verified and your
                  ebook is ready.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 self-start rounded-full bg-white px-3 py-2 text-xs font-bold text-emerald-700 sm:self-auto">
                <ShieldCheck size={14} />
                Payment verified
              </div>
            </div>
          </div>

          {/* ===================================================
              BOOK INFORMATION
          =================================================== */}

          <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <BookOpen
                  size={20}
                  className="text-blue-600"
                />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Your ebook
                </p>

                <h2 className="font-black text-slate-950">
                  {book.title}
                </h2>
              </div>
            </div>

            {book.expiresAt && (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Clock3 size={14} />
                Temporary secure access
              </div>
            )}
          </div>

          {/* ===================================================
              PDF
          =================================================== */}

          {pdfUnlocked ? (
            <>
              {/* Warning */}

              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={19}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <div>
                    <p className="text-sm font-black text-amber-900">
                      Save your ebook now
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-800">
                      Please download/save your PDF before
                      refreshing or closing this page.
                    </p>
                  </div>
                </div>
              </div>

              {/* PDF Viewer */}

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <iframe
                  src={book.pdfUrl}
                  title={book.title}
                  className="h-[75vh] min-h-[600px] w-full border-0"
                />
              </div>

              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                This ebook is for your personal use. Please do
                not share your purchase access.
              </p>
            </>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                <BookOpen
                  size={23}
                  className="text-blue-600"
                />
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-950">
                Your ebook is ready
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Accept the access conditions to open your
                purchased PDF.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowAccessModal(true)
                }
                className="mt-5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700"
              >
                Open My Ebook
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          SMALL ACCESS MODAL
      ===================================================== */}

      {showAccessModal && !pdfUnlocked && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">

          {/* Background */}

          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />

          {/* Modal */}

          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            {/* Header */}

            <div className="text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-50">
                <AlertTriangle
                  size={21}
                  className="text-amber-600"
                />
              </div>

              <h2 className="mt-3 text-xl font-black text-slate-950">
                Before You Open Your Ebook
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Please note these important points.
              </p>
            </div>

            {/* Conditions */}

            <div className="mt-5 space-y-2.5">
              <ConditionItem>
                Save/download the PDF as soon as it
                opens.
              </ConditionItem>

              <ConditionItem>
                Don't refresh or close this page before
                saving it.
              </ConditionItem>

              <ConditionItem>
                This is one-time access. You may not be
                able to access the PDF again.
              </ConditionItem>

              <ConditionItem>
                Digital ebook purchases are
                non-refundable.
              </ConditionItem>
            </div>

            {/* Checkbox */}

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-slate-50 p-3.5">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) =>
                  setAcceptedTerms(
                    event.target.checked
                  )
                }
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
              />

              <span className="text-xs font-semibold leading-5 text-slate-700">
                I understand and accept these conditions.
              </span>
            </label>

            {/* Get PDF */}

            <button
              type="button"
              disabled={!acceptedTerms}
              onClick={handleGetPdf}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <BookOpen size={17} />
              Get My PDF
            </button>

            {/* Support */}

            <p className="mt-3 text-center text-[11px] text-slate-400">
              Need help?{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-bold text-blue-600 hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// CONDITION ITEM
// ============================================================

function ConditionItem({ children }) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-slate-600">
      <CheckCircle2
        size={17}
        className="mt-0.5 shrink-0 text-emerald-600"
      />

      <span>{children}</span>
    </div>
  );
}