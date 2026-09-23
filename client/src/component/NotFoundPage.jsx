import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Compass,
  Home,
  Search,
} from "lucide-react";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(rgba(37,99,235,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.04) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        {/* Soft glow */}
        <div className="absolute -left-32 top-20 h-[350px] w-[350px] rounded-full bg-blue-100/60 blur-3xl" />

        <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-indigo-100/50 blur-3xl" />
      </div>

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl text-center">
          {/* Small badge */}

          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600 shadow-sm">
            <Compass className="h-3.5 w-3.5" />
            Lost in Target Trek?
          </div>

          {/* =================================================
              404
          ================================================= */}

          <div className="relative mx-auto w-fit">
            <h1 className="select-none text-[110px] font-black leading-[0.8] tracking-[-0.08em] text-slate-950 sm:text-[150px] md:text-[190px]">
              404
            </h1>

            {/* Blue accent */}
            <div className="absolute -right-2 -top-3 h-5 w-5 rounded-full bg-blue-600 sm:h-7 sm:w-7" />
          </div>

          {/* =================================================
              TEXT
          ================================================= */}

          <h2 className="mt-10 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            This page went off the
            <span className="text-blue-600"> roadmap.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
            The page you're looking for doesn't exist, may have been moved,
            or the URL might be incorrect. You can head back home or explore
            our learning resources.
          </p>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="
                group
                inline-flex
                h-12
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-blue-600
                px-6
                text-sm
                font-bold
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

              Go to Homepage

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/books")}
              className="
                group
                inline-flex
                h-12
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-6
                text-sm
                font-bold
                text-slate-700
                shadow-sm
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:border-blue-200
                hover:text-blue-600
                hover:shadow-md
                sm:w-auto
              "
            >
              <BookOpen className="h-4 w-4" />

              Explore Books
            </button>
          </div>

          {/* =================================================
              BACK BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              group
              mt-7
              inline-flex
              items-center
              gap-2
              text-xs
              font-bold
              text-slate-400
              transition
              hover:text-slate-700
            "
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />

            Go back to previous page
          </button>

          {/* =================================================
              DIVIDER
          ================================================= */}

          <div className="mx-auto mt-12 flex max-w-md items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />

            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white">
              <Search className="h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="mt-5 text-[11px] font-medium text-slate-400">
            Error 404 · The requested page could not be found
          </p>
        </div>
      </div>
    </main>
  );
}

export default NotFoundPage;

