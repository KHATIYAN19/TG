import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  Clock3,
  Eye,
  ArrowRight,
  Sparkles,
  Layers3,
  Server,
  Code2,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [pdfUrl, setPdfUrl] = useState(null);
  const [countdown, setCountdown] = useState(8);
  const [showPdf, setShowPdf] = useState(false);

  // Capture the PDF URL once, then clean it from the browser address bar.
  useEffect(() => {
    const urlFromParams = searchParams.get("pdf");

    if (urlFromParams && !pdfUrl) {
      setPdfUrl(urlFromParams);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, pdfUrl, setSearchParams]);

  // Automatically reveal the PDF viewer after the countdown.
  useEffect(() => {
    if (!pdfUrl || showPdf) return;

    setCountdown(8);

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

  const handleViewPreview = () => {
    if (pdfUrl) {
      setShowPdf(true);
    }
  };

  /*
   * PDF READER
   */
  if (showPdf && pdfUrl) {
    return (
      <div className="min-h-screen bg-[#07111f] text-white">
        {/* Existing navbar spacer */}
        <div className="h-20 sm:h-24" />

        {/* Reader Header */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07111f]/95 px-4 py-4 backdrop-blur-xl sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
                <BookOpen size={15} />
                2nd Edition • Ebook Reader
              </div>

              <h1 className="mt-1 truncate text-lg font-black sm:text-xl">
                Google ADK Complete Developer Handbook
              </h1>

              <p className="mt-1 text-xs text-slate-400">
                32 chapters • RAG • MCP • A2A • Evaluation • Production
              </p>
            </div>
          </div>
        </header>

        {/* PDF */}
        <main className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-7">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl shadow-black/30">
            <iframe
              src={pdfUrl}
              title="Google ADK Complete Developer Handbook 2nd Edition"
              className="h-[calc(100vh-190px)] min-h-[700px] w-full"
            />
          </div>

          <div className="flex flex-col items-center justify-center gap-2 py-6 text-center text-xs text-slate-500 sm:flex-row">
            <ShieldCheck size={16} className="text-blue-400" />
            <span>Secure digital delivery</span>

            <span className="hidden sm:inline">•</span>

            <span>
              Google ADK Complete Developer Handbook • 2nd Edition
            </span>
          </div>
        </main>
      </div>
    );
  }

  /*
   * PAYMENT SUCCESS
   */
  return (
    <div className="min-h-screen overflow-hidden bg-[#07111f] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[130px]" />

        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      {/* Existing navbar spacer */}
      <div className="relative h-10 sm:h-14" />

      <main className="relative mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-2xl shadow-black/40">
          {/* SUCCESS HEADER */}
          <div className="bg-gradient-to-br from-white via-white to-blue-50 px-6 pb-10 pt-10 text-center sm:px-12 sm:pb-12 sm:pt-14">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 ring-8 ring-green-50/60">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2
                  size={34}
                  strokeWidth={2.5}
                  className="text-green-600"
                />
              </div>
            </div>

            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-green-700">
              <Sparkles size={14} />
              Purchase Confirmed
            </div>

            <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Your handbook is ready.
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
              Thank you for purchasing the{" "}
              <span className="font-bold text-slate-900">
                Google ADK Complete Developer Handbook — 2nd Edition
              </span>
              .
              <br />
              You now have access to the complete developer reference.
            </p>

            {/* PRODUCT CARD */}
            <div className="mx-auto mt-9 max-w-3xl overflow-hidden rounded-2xl border border-blue-100 bg-white text-left shadow-lg shadow-blue-950/5">
              <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />

              <div className="p-6 sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-600/20">
                    <BookOpen size={29} className="text-white" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                      Your purchase
                    </p>

                    <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
                      Google ADK Complete Developer Handbook
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      2nd Edition • 32 Chapters • Digital PDF
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Paid
                    </p>

                    <p className="mt-1 text-2xl font-black text-blue-600">
                      ₹149
                    </p>
                  </div>
                </div>

                {/* TOPICS */}
                <div className="mt-7 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-4">
                  {[
                    [Code2, "Agent Development"],
                    [Layers3, "RAG • MCP • A2A"],
                    [Server, "Deployment"],
                    [ShieldCheck, "Security & Eval"],
                  ].map(([Icon, label]) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3"
                    >
                      <Icon size={17} className="shrink-0 text-blue-600" />

                      <span className="text-xs font-semibold text-slate-600">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* READING INFORMATION */}
            <div className="mx-auto mt-7 max-w-3xl rounded-2xl border border-blue-200 bg-blue-50 p-5 text-left">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={21}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                  <p className="font-black text-blue-800">
                    Your ebook is ready to read
                  </p>

                  <p className="mt-1 text-sm leading-6 text-blue-700">
                    Read the complete handbook directly on this website using
                    the built-in PDF reader.
                  </p>
                </div>
              </div>
            </div>

            {/* PRIMARY ACTION */}
            <div className="mt-7">
              <button
                type="button"
                onClick={handleViewPreview}
                disabled={!pdfUrl}
                className="group inline-flex w-full max-w-3xl items-center justify-center gap-3 rounded-xl bg-blue-600 px-7 py-4 text-base font-black text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Eye size={21} />

                Read the Handbook Now

                <ArrowRight
                  size={19}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>

            {/* COUNTDOWN */}
            {pdfUrl && !showPdf && (
              <div className="mt-5">
                <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500">
                  <Clock3 size={17} className="text-blue-600" />

                  Opening your handbook automatically in

                  <span className="font-black text-blue-600">
                    {countdown}s
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleViewPreview}
                  className="mt-2 text-xs font-semibold text-slate-400 underline underline-offset-4 transition hover:text-blue-600"
                >
                  Open it now
                </button>
              </div>
            )}
          </div>

          {/* WHAT'S INSIDE */}
          <section className="border-t border-slate-100 bg-slate-50 px-6 py-10 sm:px-12">
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                  Your new reference
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                  What you have inside
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  The 2nd Edition is structured to take you from agent
                  fundamentals to production engineering.
                </p>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  "Agent fundamentals & Google ADK setup",
                  "LlmAgent, Sequential, Parallel & Loop workflows",
                  "Tools, callbacks, plugins & guardrails",
                  "Sessions, state, context, memory & artifacts",
                  "Full RAG pipeline",
                  "MCP & A2A integration",
                  "Gemini, LiteLLM & model routing",
                  "Streaming & multimodal inputs",
                  "Evaluation, datasets & quality loops",
                  "Observability, tracing & debugging",
                  "Agent Runtime, Cloud Run & GKE",
                  "FastAPI, security, testing & performance",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <span className="text-sm font-medium leading-6 text-slate-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* NON-REFUNDABLE + SUPPORT */}
          <section className="border-t border-slate-100 bg-white px-6 py-8 sm:px-12">
            <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
              <div className="flex items-center justify-center gap-2 text-sm font-black text-slate-700">
                <ShieldCheck size={18} className="text-slate-500" />
                Digital Product • Non-Refundable
              </div>

              <p className="mx-auto mt-2 max-w-2xl text-xs leading-5 text-slate-500">
                Due to the digital nature of the ebook, all purchases are final
                and non-refundable.
              </p>

              <p className="mt-3 text-xs text-slate-500">
                Having a purchase or ebook-related issue? Contact{" "}
                <a
                  href="mailto:supporttargettrek@gmail.com"
                  className="font-bold text-slate-700 underline decoration-slate-300 underline-offset-2 hover:text-blue-600"
                >
                  supporttargettrek@gmail.com
                </a>
              </p>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="border-t border-slate-100 bg-white px-6 py-7 text-center">
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-400">
              <ShieldCheck size={17} />
              Secure digital delivery
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Google ADK Complete Developer Handbook • 2nd Edition
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Support:{" "}
              <a
                href="mailto:supporttargettrek@gmail.com"
                className="hover:text-blue-600"
              >
                supporttargettrek@gmail.com
              </a>
            </p>
          </footer>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Target Trek • Practical learning for developers
        </p>
      </main>
    </div>
  );
};

export default PaymentSuccess;