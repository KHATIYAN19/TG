import { useEffect, useState } from "react";

/*
  Shared helpers for the Interview pages (feed + detail).
  - useSiteTheme(): follows the site's light/dark toggle with events + a class observer (no polling).
  - loadInterviewFonts(): the same Google fonts the rest of the redesigned pages use, injected once.
*/

const THEME_KEY = "theme";

const readTheme = () => {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
    const html = document.documentElement;
    return html.classList.contains("dark") || html.getAttribute("data-theme") === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

export function useSiteTheme() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const sync = (event) => {
      const next = event?.detail?.theme;
      setTheme(next === "dark" || next === "light" ? next : readTheme());
    };

    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    window.addEventListener("themechange", sync);
    window.addEventListener("theme-change", sync);
    window.addEventListener("targettrek-theme-change", sync);

    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    sync();

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      window.removeEventListener("themechange", sync);
      window.removeEventListener("theme-change", sync);
      window.removeEventListener("targettrek-theme-change", sync);
      observer.disconnect();
    };
  }, []);

  return theme;
}

const FONTS_ID = "tt-pay-fonts"; // same id as the payment pages, so the fonts load once site-wide
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Geist+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&display=swap";

export function useInterviewFonts() {
  useEffect(() => {
    if (typeof document === "undefined" || document.getElementById(FONTS_ID)) return;
    const link = document.createElement("link");
    link.id = FONTS_ID;
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(link);
  }, []);
}

export const SITE_URL = "https://www.targettrek.in";
export const SITE_NAME = "Target Trek";

/** Plain text for schema.org answers: strips markdown and trims to a sentence-ish length. */
export const clip = (text = "", max = 300) => {
  const value = String(text).replace(/\s+/g, " ").trim();
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "));
  return (stop > max * 0.5 ? cut.slice(0, stop + 1) : cut.replace(/\s+\S*$/, "") + "…").trim();
};

export const asText = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return value.name || value.label || value.value || value.title || "";
  }
  return "";
};
