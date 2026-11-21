import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getConsent, setConsent, OPEN_SETTINGS_EVENT } from "../lib/consent";

/*
  Cookie choices.
  - "Reject all" / "Accept all" / "Settings". Reject is exactly as easy and as prominent as Accept, nothing is
    pre-ticked. The only optional group is Analytics (Microsoft Clarity, Google Analytics).
  - Sales measurement (which ad led to a sale) is always on, is not a choice here and is not affected by
    "Reject all" (lib/consent.js). It is disclosed in the Privacy Policy linked below.
  - "Cookie settings" in the footer reopens this panel.
*/

const ANALYTICS_TEXT =
  "Helps us see how pages are used (clicks, scrolling, session replays) so we can fix problems. Pages with private links are never recorded.";

export default function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (!getConsent()) setOpen(true);
    const reopen = () => {
      setAnalytics(Boolean(getConsent()?.analytics));
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);

  if (!open) return null;

  const decide = (allowAnalytics) => {
    setConsent({ analytics: allowAnalytics });
    setOpen(false);
    setDetails(false);
  };

  const btn =
    "rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500";
  const primary = `${btn} bg-slate-900 text-white hover:bg-slate-800 dk:bg-white dk:text-slate-900 dk:hover:bg-slate-100`;
  const secondary = `${btn} border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dk:border-slate-600 dk:bg-slate-800 dk:text-white dk:hover:bg-slate-700`;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="tt-consent-title"
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-2xl sm:p-5 dk:border-slate-700 dk:bg-slate-900 dk:text-slate-100"
    >
      <h2 id="tt-consent-title" className="text-base font-bold">
        We use cookies
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-slate-600 dk:text-slate-300">
        Some cookies are needed to keep you signed in, secure your account, complete payments and measure our sales.
        With your permission we also use analytics cookies to improve the website. You can change this any time from{" "}
        <b>Cookie settings</b> in the footer. See our{" "}
        <Link to="/privacy-policy" className="font-semibold underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>

      {details && (
        <ul className="mt-3 space-y-2">
          <li className="rounded-xl bg-slate-50 p-3 text-sm dk:bg-slate-800">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold">Essential</span>
              <span className="text-xs font-semibold text-slate-500 dk:text-slate-400">Always on</span>
            </div>
            <p className="mt-1 text-slate-600 dk:text-slate-300">
              Sign-in, security, checkout, sales measurement, remembering this choice, and anonymous page counts.
            </p>
          </li>
          <li className="rounded-xl bg-slate-50 p-3 text-sm dk:bg-slate-800">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="font-semibold">Analytics</span>
              <input
                type="checkbox"
                className="h-5 w-5 accent-teal-600"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
            </label>
            <p className="mt-1 text-slate-600 dk:text-slate-300">{ANALYTICS_TEXT}</p>
          </li>
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className={secondary} onClick={() => decide(false)}>
          Reject all
        </button>
        <button type="button" className={secondary} onClick={() => decide(true)}>
          Accept all
        </button>
        {details ? (
          <button type="button" className={primary} onClick={() => decide(analytics)}>
            Save my choices
          </button>
        ) : (
          <button type="button" className={`${btn} text-slate-700 underline underline-offset-2 dk:text-slate-200`} onClick={() => setDetails(true)}>
            Settings
          </button>
        )}
      </div>
    </div>
  );
}
