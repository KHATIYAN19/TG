import { useEffect } from "react";

/*
  PAGE CHROME
  -----------
  1. THEME. The navbar's toggle saves "theme" in localStorage and puts
     `dark` + data-theme on <html>. We mirror that here so arena pages are
     correct on first paint, after a reload, and when another tab flips it.
  2. NAVBAR HEIGHT. The site's fixed navbar is ~118px tall on phones/tablets
     (two rows) and ~77px on desktop. We measure it and expose it as the CSS
     variable --arena-nav-h so content never slides under it.
*/

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const readTheme = () => {
  try {
    return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light"; // storage blocked (private mode / strict settings)
  }
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.setAttribute("data-theme", theme);
};

export function useArenaChrome() {
  useEffect(() => {
    applyTheme(readTheme());

    const onThemeEvent = (event) => {
      const next = event?.detail?.theme;
      applyTheme(next === "dark" || next === "light" ? next : readTheme());
    };
    const onStorage = (event) => {
      if (!event.key || event.key === THEME_KEY) applyTheme(readTheme());
    };

    window.addEventListener(THEME_EVENT, onThemeEvent);
    window.addEventListener("themechange", onThemeEvent);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(THEME_EVENT, onThemeEvent);
      window.removeEventListener("themechange", onThemeEvent);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let observer;
    let raf;

    const measure = () => {
      const nav = document.querySelector("nav.fixed.top-0");
      if (!nav) return;
      root.style.setProperty("--arena-nav-h", `${Math.round(nav.getBoundingClientRect().height)}px`);
    };

    const start = () => {
      measure();
      const nav = document.querySelector("nav.fixed.top-0");
      if (nav && typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(measure);
        observer.observe(nav);
      }
      window.addEventListener("resize", measure);
    };

    // The navbar mounts alongside the page; wait a frame for it.
    raf = requestAnimationFrame(start);

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      root.style.removeProperty("--arena-nav-h");
    };
  }, []);
}
