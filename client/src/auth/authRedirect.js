/*
  One login / sign-up for the whole site (the Memories product keeps its own).

    /login?redirect=/some/page      log in, then come back to /some/page
    /signup?redirect=/some/page     create an account, then come back to /some/page

  Anything that needs a signed-in user sends people to loginUrl(<where they were>); the auth page sends them back with safeRedirect().
*/

export const LOGIN_PATH = "/login";
export const SIGNUP_PATH = "/signup";
export const DEFAULT_AFTER_LOGIN = "/";
export const ALLOWED_ROLES = ["admin", "Employee", "affiliate", "partner", "normal"];

// Pages that must never be a redirect target (they would bounce straight back to the login).
const AUTH_ONLY = /^\/(login|signup|admin\/login|resume-review\/(login|signup)|prep-buddy\/signup)(\/|$)/i;

/* Only same-site paths: "/x?y=1#z". Rejects "//evil.com", "/\evil.com", "https://evil.com", control characters and the auth pages themselves. */
export function safeRedirect(raw) {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || value.length > 1000) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(value)) return null;
  const path = value.split(/[?#]/)[0];
  if (AUTH_ONLY.test(path)) return null;
  return value;
}

/* The page someone is on right now, as a path they can come back to. */
export const pathOf = (loc) => (loc ? `${loc.pathname || "/"}${loc.search || ""}${loc.hash || ""}` : "/");

/* /login or /signup, remembering where to return to. */
export function loginUrl(redirect, mode = "login") {
  const base = mode === "signup" ? SIGNUP_PATH : LOGIN_PATH;
  const back = safeRedirect(typeof redirect === "string" ? redirect : pathOf(redirect));
  return back && back !== "/" ? `${base}?redirect=${encodeURIComponent(back)}` : base;
}

/* A react-router location (or path) sent here as `state.from` by older links. */
export function redirectFromState(state) {
  const from = state?.from;
  if (!from) return null;
  return safeRedirect(typeof from === "string" ? from : pathOf(from));
}
