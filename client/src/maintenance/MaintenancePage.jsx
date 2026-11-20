import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Home, Mail, RefreshCw, ShieldCheck, Wrench } from "lucide-react";

import { SECTION_LABELS, SECTION_PAGES } from "./sections";

const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const cx = (...c) => c.filter(Boolean).join(" ");

const fmtTime = (d) => new Date(d).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

function timeLeft(endsAt, now) {
  const ms = new Date(endsAt).getTime() - now;
  if (!Number.isFinite(ms)) return null;
  if (ms <= 0) return "any minute now";
  const mins = Math.ceil(ms / 60000);
  if (mins < 60) return `in about ${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h < 24) return `in about ${h}h${m ? ` ${m}m` : ""}`;
  const d = Math.floor(h / 24);
  return `in about ${d} day${d > 1 ? "s" : ""}`;
}

/*
  The page visitors see while the whole site (scope "sitewide") or one section (scope = section key) is in maintenance.
  sections: the maintenance map (maintenanceConfig.js), used to list the parts of the site that are still open.
*/
export default function MaintenancePage({ scope = "sitewide", window: w = {}, sections = {} }) {
  const sitewide = scope === "sitewide";
  const label = w.label || SECTION_LABELS[scope] || "This page";
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const title = w.title || (sitewide ? "We're upgrading Target Trek" : `${label} is getting an upgrade`);
  const message = w.message || (sitewide
    ? "We're doing some scheduled maintenance to make the site faster and more reliable. We'll be back shortly. Thanks for your patience."
    : `${label} is down for a short maintenance. Everything else on Target Trek is working as usual.`);
  const eta = w.endsAt ? timeLeft(w.endsAt, now) : null;

  const stillOpen = sitewide ? [] : SECTION_PAGES.filter((s) => s.key !== scope && !sections[s.key]?.enabled);

  return (
    <main
      className={cx(
        "relative w-full overflow-hidden bg-[#f6f8f7] text-[#0c1a17] dk:bg-[#0a1312] dk:text-[#e8f2ef]",
        sitewide ? "min-h-screen" : "min-h-[75vh]"
      )}
      aria-labelledby="mt-title"
    >
      <Helmet>
        <title>{sitewide ? "Under maintenance | Target Trek" : `${label}: under maintenance | Target Trek`}</title>
      </Helmet>

      {/* soft brand glow */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-[420px] max-w-3xl rounded-full bg-teal-300/30 blur-3xl dk:bg-teal-500/10" />

      <div className={cx("relative mx-auto flex max-w-2xl flex-col items-center px-4 text-center sm:px-6", sitewide ? "py-16 sm:py-24" : "py-14 sm:py-20")}>
        {sitewide && (
          <a href="/" className="mb-10 text-lg font-extrabold tracking-tight text-teal-800 dk:text-teal-300">Target Trek</a>
        )}

        <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-teal-700 text-white shadow-lg shadow-teal-900/20 dk:bg-teal-600">
          <span aria-hidden className="absolute inset-0 animate-ping rounded-3xl bg-teal-600/30 [animation-duration:2.4s]" />
          <Wrench className="relative h-9 w-9" aria-hidden />
        </div>

        <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 ring-1 ring-inset ring-teal-100 dk:bg-teal-400/10 dk:text-teal-300 dk:ring-teal-400/20">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
          {sitewide ? "Scheduled maintenance" : `${label} · maintenance`}
        </span>

        <h1 id="mt-title" className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600 dk:text-[#a9bfb8] sm:text-lg">{message}</p>

        {w.endsAt && (
          <div className="mt-8 flex w-full max-w-md items-center gap-4 rounded-2xl border border-[#dfe8e5] bg-white p-4 text-left shadow-sm dk:border-[#1f302c] dk:bg-[#101c1a]">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 dk:bg-teal-400/10 dk:text-teal-300"><Clock className="h-5 w-5" aria-hidden /></span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 dk:text-[#93aaa3]">Expected back</p>
              <p className="text-base font-bold">{fmtTime(w.endsAt)} <span className="font-semibold text-teal-700 dk:text-teal-300">({eta})</span></p>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </button>
          {!sitewide && (
            <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-[#c3d2cd] bg-white px-5 py-3 text-sm font-semibold transition-colors hover:bg-teal-50 dk:border-[#1f302c] dk:bg-[#101c1a] dk:hover:bg-[#152522]">
              <Home className="h-4 w-4" aria-hidden /> Go to homepage
            </Link>
          )}
        </div>

        {stillOpen.length > 0 && (
          <section className="mt-12 w-full text-left" aria-labelledby="mt-open">
            <h2 id="mt-open" className="text-center text-sm font-bold uppercase tracking-wider text-stone-500 dk:text-[#93aaa3]">Still open on Target Trek</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {stillOpen.map((s) => (
                <li key={s.key}>
                  <Link to={s.home} className="group flex items-center justify-between gap-3 rounded-xl border border-[#dfe8e5] bg-white px-4 py-3 text-sm font-semibold transition-colors hover:border-teal-600 dk:border-[#1f302c] dk:bg-[#101c1a] dk:hover:border-teal-400">
                    {sections[s.key]?.label || SECTION_LABELS[s.key]}
                    <ArrowRight className="h-4 w-4 text-teal-700 transition-transform group-hover:translate-x-0.5 dk:text-teal-300" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12 grid w-full gap-3 text-left sm:grid-cols-2">
          <div className="flex gap-3 rounded-2xl bg-white/70 p-4 ring-1 ring-[#dfe8e5] dk:bg-[#101c1a]/70 dk:ring-[#1f302c]">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-teal-700 dk:text-teal-300" aria-hidden />
            <p className="text-sm text-stone-600 dk:text-[#a9bfb8]"><b className="block text-[#0c1a17] dk:text-[#e8f2ef]">Your data is safe</b>Your account, purchases and saved work are not affected.</p>
          </div>
          <div className="flex gap-3 rounded-2xl bg-white/70 p-4 ring-1 ring-[#dfe8e5] dk:bg-[#101c1a]/70 dk:ring-[#1f302c]">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-teal-700 dk:text-teal-300" aria-hidden />
            <p className="text-sm text-stone-600 dk:text-[#a9bfb8]"><b className="block text-[#0c1a17] dk:text-[#e8f2ef]">Need help now?</b>Write to <a className="font-semibold text-teal-700 underline-offset-2 hover:underline dk:text-teal-300" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
          </div>
        </div>
      </div>
    </main>
  );
}
