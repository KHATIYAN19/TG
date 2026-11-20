import { SECTION_LABELS, isAlwaysOpen, sectionForPath } from "./sections";

/*
  Maintenance mode: frontend only, set with Vite env vars (Vercel → Settings → Environment Variables, then redeploy).

    VITE_MAINTENANCE=all                         → whole website
    VITE_MAINTENANCE=resume,prep-buddy           → only these sections (keys in sections.js)
    VITE_MAINTENANCE_TITLE="..."                 → optional heading
    VITE_MAINTENANCE_MESSAGE="..."               → optional message
    VITE_MAINTENANCE_ENDS_AT=2026-11-21T14:00:00+05:30   → optional "expected back" time

  Remove VITE_MAINTENANCE (or leave it empty) and redeploy to reopen.
  Signed-in admins (role "admin") never see the maintenance page (checked in App.jsx).
*/
const env = import.meta.env;
const SWITCH = String(env.VITE_MAINTENANCE || "").trim().toLowerCase();

const WINDOW = {
  enabled: true,
  title: String(env.VITE_MAINTENANCE_TITLE || ""),
  message: String(env.VITE_MAINTENANCE_MESSAGE || ""),
  endsAt: env.VITE_MAINTENANCE_ENDS_AT || null,
};

const sectionKeys = SWITCH && SWITCH !== "all"
  ? SWITCH.split(",").map((k) => k.trim()).filter((k) => SECTION_LABELS[k])
  : [];

export const MAINTENANCE = {
  sitewide: SWITCH === "all" ? WINDOW : { enabled: false },
  sections: Object.fromEntries(sectionKeys.map((k) => [k, { ...WINDOW, label: SECTION_LABELS[k] }])),
};

/* What (if anything) blocks this path. Returns { scope, window } or null. */
export function blockFor(status, pathname) {
  if (isAlwaysOpen(pathname)) return null;
  if (status.sitewide?.enabled) return { scope: "sitewide", window: status.sitewide };
  const key = sectionForPath(pathname);
  const w = key && status.sections?.[key];
  return w?.enabled ? { scope: key, window: w } : null;
}

/* Everything currently in maintenance (for the admin banner). */
export function activeWindows(status) {
  const list = [];
  if (status.sitewide?.enabled) list.push({ key: "sitewide", label: "Whole site" });
  Object.entries(status.sections || {}).forEach(([key, w]) => { if (w?.enabled) list.push({ key, label: w.label || SECTION_LABELS[key] || key }); });
  return list;
}
