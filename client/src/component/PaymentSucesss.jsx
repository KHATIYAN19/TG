import React, { useEffect, useState } from "react";
import {
  CheckCircle,
  BookOpen,
  Download,
  ShieldCheck,
  Clock,
  AlertCircle,
  ExternalLink,
  Eye,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [pdfUrl, setPdfUrl] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const [showPdf, setShowPdf] = useState(false);

  // Get PDF URL once and immediately remove ?pdf= from browser URL
  useEffect(() => {
    const urlFromParams = searchParams.get("pdf");

    if (urlFromParams && !pdfUrl) {
      setPdfUrl(urlFromParams);

      setSearchParams({}, { replace: true });
    }
  }, [searchParams, pdfUrl, setSearchParams]);

  // Countdown
  useEffect(() => {
    if (!pdfUrl || showPdf) {
      return;
    }

    setCountdown(10);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowPdf(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pdfUrl, showPdf]);

  // Directly show preview
  const handleViewPreview = () => {
    setShowPdf(true);
  };

  const handleDownload = () => {
    if (!pdfUrl) {
      return;
    }

    const link = document.createElement("a");

    link.href = pdfUrl;
    link.download = "Build-AI-Agents-with-Google-ADK.pdf";
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenPdf = () => {
    if (!pdfUrl) {
      return;
    }

    window.open(
      pdfUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /*
   * PDF PREVIEW
   */
  if (showPdf && pdfUrl) {
    return (
      <div className="min-h-screen bg-slate-100">

        {/* Extra top space for existing navbar */}
        <div className="h-20 sm:h-24" />

        <div className="border-b border-slate-200 bg-white px-4 py-5 shadow-sm">

          <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                Ebook Preview
              </p>

              <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                Build AI Agents with Google ADK
              </h1>

            </div>

            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700"
              >
                <Download size={18} />
                Download PDF
              </button>

              <button
                type="button"
                onClick={handleOpenPdf}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ExternalLink size={17} />
                Open PDF
              </button>

            </div>

          </div>

        </div>

        <main className="mx-auto max-w-6xl px-3 py-6 sm:px-6">

          <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xl">

            <iframe
              src={pdfUrl}
              title="Build AI Agents with Google ADK"
              className="h-[calc(100vh-230px)] min-h-[700px] w-full"
            />

          </div>

          <div className="mt-4 flex items-center justify-center gap-2 pb-6 text-sm text-slate-500">

            <ShieldCheck
              size={17}
              className="text-blue-600"
            />

            Build AI Agents with Google ADK • Target Trek

          </div>

        </main>

      </div>
    );
  }

  /*
   * SUCCESS PAGE
   */

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

          <div className="px-6 py-10 text-center sm:px-12 sm:py-14">

            {/* SUCCESS ICON */}

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">

                <CheckCircle
                  size={34}
                  strokeWidth={2.5}
                  className="text-green-600"
                />

              </div>

            </div>

            <h1 className="mt-7 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Payment Successful!
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">

              Thank you for purchasing{" "}

              <span className="font-semibold text-slate-900">
                Build AI Agents with Google ADK
              </span>

              .

              <br />

              Your payment has been successfully received.

            </p>

            {/* BOOK DETAILS */}

            <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">

              <div className="flex flex-col items-center gap-5 sm:flex-row sm:text-left">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20">

                  <BookOpen
                    size={30}
                    className="text-white"
                  />

                </div>

                <div className="flex-1">

                  <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                    Your Purchase
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                    Build AI Agents with Google ADK
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Practical Developer Guide • Digital PDF Ebook
                  </p>

                </div>

                <div className="text-center sm:text-right">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Paid
                  </p>

                  <div className="mt-1 flex items-center gap-2">

                    <span className="text-sm font-semibold text-slate-400 line-through">
                      ₹299
                    </span>

                    <span className="text-2xl font-black text-blue-600">
                      ₹149
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* IMPORTANT DOWNLOAD WARNING */}

            <div className="mx-auto mt-7 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-left">

              <div className="flex items-start gap-3">

                <AlertCircle
                  size={21}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>

                  <p className="font-bold text-red-700">
                    Important — Download Your Ebook
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-600">
                    Please download and save your ebook immediately.
                    If you lose access to this download, you may need
                    to purchase the book again to receive a new copy.
                  </p>

                </div>

              </div>

            </div>

            {/* DIRECT PREVIEW BUTTON */}

            <div className="mt-7">

              <button
                type="button"
                onClick={handleViewPreview}
                disabled={!pdfUrl}
                className="inline-flex w-full max-w-2xl items-center justify-center gap-3 rounded-xl bg-blue-600 px-7 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <Eye size={21} />

                View Google ADK Book Now

              </button>

            </div>

            {/* COUNTDOWN */}

            {pdfUrl && (

              <div className="mt-5">

                <div className="flex items-center justify-center gap-2 text-sm text-slate-500">

                  <Clock
                    size={17}
                    className="text-blue-600"
                  />

                  PDF preview will open automatically in

                  <span className="font-bold text-blue-600">
                    {countdown}s
                  </span>

                </div>

              </div>

            )}

          </div>

          {/* FOOTER */}

          <div className="border-t border-slate-100 bg-white px-6 py-7 text-center">

            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">

              <ShieldCheck size={17} />

              Secure digital delivery by Target Trek

            </div>

            <p className="mt-2 text-sm text-slate-400">
              Thank you for supporting Target Trek.
            </p>

          </div>

        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © Target Trek • Build. Learn. Grow.
        </p>

      </div>

    </div>
  );
};

export default PaymentSuccess;