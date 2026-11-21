/*
  CONSENT / COOKIE CHOICES

    essential         always on   sign-in, security, checkout, remembering these choices, anonymous page counts
    sales measurement always on   Meta Pixel, Meta Conversions API (server) and Google Ads conversion tags, used to
                                  see which of our ads lead to a sale. Not shown as a choice in the banner and not
                                  affected by "Reject all"; disclosed in the Privacy Policy.
    analytics         opt-in      Microsoft Clarity (session replay / heatmaps), Google Analytics. This is the only
                                  thing "Accept all" / "Reject all" / the settings switch control.

  The choice is stored on this device only (localStorage "tt_consent"): { v, analytics, decidedAt }. An old
  `marketing` field from earlier versions of the banner is ignored. Keep CONSENT_VERSION in sync with the
  inline Meta Pixel loader in index.html.
*/

const KEY = "tt_consent";
export const CONSENT_VERSION = 1;
const EVENT = "tt:consent-change";
export const OPEN_SETTINGS_EVENT = "tt:open-consent";

const isBrowser = () => typeof window !== "undefined";

export const getConsent = () => {
  if (!isBrowser()) return null;
  try {
    const c = JSON.parse(window.localStorage.getItem(KEY) || "null");
    if (!c || c.v !== CONSENT_VERSION) return null;
    return { analytics: c.analytics === true, marketing: true, decidedAt: c.decidedAt, v: c.v };
  } catch {
    return null;
  }
};

/*
  analytics: true only after an explicit "yes" (no decision yet = no).
  marketing (sales measurement): always true.
*/
export const hasConsent = (purpose) => {
  if (purpose === "marketing") return true;
  return getConsent()?.[purpose] === true;
};

const deleteCookie = (name) => {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const d of domains) {
    document.cookie = `${name}=; Max-Age=0; Path=/${d ? `; Domain=${d}` : ""}`;
  }
};

const TRACKER_COOKIES = {
  analytics: ["_clck", "_clsk", "CLID", "ANONCHK", "MR", "MUID", "SM", "_ga", "_gid", "_gat"],
};

const revoke = (purpose) => {
  try {
    if (purpose === "analytics") {
      window.clarity?.("consent", false);
      // GA4 cookies start with _ga_<id>
      document.cookie.split("; ").forEach((c) => {
        const name = c.split("=")[0];
        if (name.startsWith("_ga_")) deleteCookie(name);
      });
    }
    TRACKER_COOKIES[purpose].forEach(deleteCookie);
  } catch {
    /* never break the page */
  }
};

export const setConsent = ({ analytics }) => {
  if (!isBrowser()) return;
  const before = getConsent();
  const next = { v: CONSENT_VERSION, analytics: analytics === true, marketing: true, decidedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: the choice still applies to this page view */
  }
  if (before?.analytics && !next.analytics) revoke("analytics");
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
};

export const onConsentChange = (fn) => {
  if (!isBrowser()) return () => {};
  const handler = (e) => fn(e.detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
};

export const openConsentSettings = () => {
  if (isBrowser()) window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
};

/*
  Pages whose URL carries a private credential (purchase access links, password links). Session replay and
  ad pixels must never record these URLs, even with consent.
*/
const SENSITIVE_PATHS = ["/payment/success", "/ebook/adk/payment/success", "/set-password", "/reset-password"];
const SENSITIVE_PARAMS = ["token", "access_token", "accesstoken", "download_token", "pdf"];

export const isSensitiveUrl = (loc = isBrowser() ? window.location : null) => {
  if (!loc) return false;
  const path = String(loc.pathname || "").toLowerCase();
  if (SENSITIVE_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) return true;
  try {
    const params = new URLSearchParams(loc.search || "");
    for (const key of params.keys()) if (SENSITIVE_PARAMS.includes(key.toLowerCase())) return true;
  } catch {
    /* ignore */
  }
  return false;
};
