import { useEffect, useMemo, useState } from "react";

/*
  Memories is a LIGHT-ONLY product. The rest of the site can be switched to dark from its navbar
  (that puts `dark` + data-theme on <html>). While a Memories page is open we pin <html> to light,
  and when the visitor leaves we put back whatever they had chosen.
*/
const THEME_KEY = "theme";

const savedTheme = () => {
  try {
    return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

const apply = (theme) => {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.setAttribute("data-theme", theme);
};

export function useMemoriesChrome() {
  useEffect(() => {
    apply("light");
    document.documentElement.classList.add("mem-smooth");

    // the site's theme toggle is hidden here, but another tab could still flip it
    const keepLight = (e) => { if (!e.key || e.key === THEME_KEY) apply("light"); };
    window.addEventListener("storage", keepLight);

    return () => {
      window.removeEventListener("storage", keepLight);
      document.documentElement.classList.remove("mem-smooth");
      apply(savedTheme());
    };
  }, []);
}

/** Fades sections in as they scroll into view. Everything is visible if IntersectionObserver is missing. */
export function useReveal(deps = []) {
  useEffect(() => {
    const nodes = [...document.querySelectorAll(".mem-reveal:not(.in)")];
    if (typeof IntersectionObserver === "undefined") {
      nodes.forEach((n) => n.classList.add("in"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    nodes.forEach((n) => io.observe(n));
    // sections that appear later (a gift or photo added in the live preview) fade in too, instead of staying invisible
    let queued = 0;
    const mo = typeof MutationObserver === "undefined" ? null : new MutationObserver(() => {
      if (queued) return;
      queued = requestAnimationFrame(() => { queued = 0; document.querySelectorAll(".mem-reveal:not(.in)").forEach((n) => io.observe(n)); });
    });
    mo?.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo?.disconnect(); cancelAnimationFrame(queued); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * EMBED MODE: the landing page shows the REAL template pages inside a phone frame (an iframe of /memories/preview/...?embed=1).
 * In embed mode a preview hides its editor, ignores saved edits, and with &auto=1 opens its welcome screen by itself.
 */
export function useEmbed() {
  const embed = useMemo(() => { try { return new URLSearchParams(window.location.search).get("embed") === "1"; } catch { return false; } }, []);
  useEffect(() => {
    if (!embed) return undefined;
    document.documentElement.classList.add("mem-embed");
    const auto = new URLSearchParams(window.location.search).get("auto") === "1";
    const t = auto ? setTimeout(() => document.querySelector(".bd-gate-btn")?.click(), 1100) : null;
    return () => { clearTimeout(t); document.documentElement.classList.remove("mem-embed"); };
  }, [embed]);
  return embed;
}

/**
 * LIVE PREVIEW (used by the page builder): the builder puts the real template page in an iframe (?embed=1&live=1) and posts
 * the form's data to it as the person types. This listens for that and re-renders the page. Only same-origin messages are accepted.
 */
export function useLivePreview(embed, base, setData, setThemeId) {
  useEffect(() => {
    if (!embed || new URLSearchParams(window.location.search).get("live") !== "1") return undefined;
    const on = (e) => {
      if (e.origin !== window.location.origin || e.data?.type !== "memories:live") return;
      const { data, themeId } = e.data;
      if (data && typeof data === "object") {
        setData({ ...base, ...data, recipientName: (data.recipientName || "").trim() || base.recipientName, senderName: (data.senderName || "").trim() || base.senderName, message: data.message ?? "" });
      }
      if (themeId) setThemeId(themeId);
    };
    window.addEventListener("message", on);
    window.parent?.postMessage({ type: "memories:live-ready" }, window.location.origin);
    return () => window.removeEventListener("message", on);
  }, [embed, base, setData, setThemeId]);
}

/** True while the window matches a CSS media query (e.g. "(min-width: 1024px)"). Used to pick a layout, not just a style. */
export function useMedia(query) {
  const get = () => (typeof window !== "undefined" && typeof window.matchMedia === "function" ? window.matchMedia(query).matches : false);
  const [match, setMatch] = useState(get);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return undefined;
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [query]);
  return match;
}
