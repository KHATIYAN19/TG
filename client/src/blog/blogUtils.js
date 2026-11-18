/*
  Shared helpers for /blogs and /blog/:slug.
  Data comes from the public blog API (backend/routes/Blog.js):
    GET  /blogs                 ?page&limit&category&tag&search&sort&featured&editorChoice
    GET  /blogs/meta/categories
    GET  /blogs/:slug           (content already sanitised, headings carry ids, plus `toc`)
    POST /blogs/:slug/view      (header x-blog-visitor-id)
*/
import { useEffect, useState } from "react";
import BASE_URL from "../utils/Url.js";

export const SITE_URL = "https://www.targettrek.in";
export const SITE_NAME = "Target Trek";
export const BLOG_URL = `${SITE_URL}/blogs`;
export const LOGO_URL = "https://i.postimg.cc/13B9k289/target-Trek-logo-2.jpg";
export const API = `${String(BASE_URL || "").replace(/\/+$/, "")}/blogs`;
export const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Geist+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&display=swap";

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";
const VISITOR_KEY = "targettrek_blog_visitor_id";

/* ---------- theme: follows the navbar toggle ---------- */
const readTheme = () => {
  try {
    return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

export function useSiteTheme() {
  const [theme, setTheme] = useState(() => (typeof window === "undefined" ? "light" : readTheme()));
  useEffect(() => {
    const sync = (e) => {
      const next = e?.detail?.theme;
      setTheme(next === "dark" || next === "light" ? next : readTheme());
    };
    window.addEventListener(THEME_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(THEME_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return theme;
}

/* ---------- visitor id for de-duplicated view counts ---------- */
export const getVisitorId = () => {
  try {
    let id = window.localStorage.getItem(VISITOR_KEY);
    if (id) return id;
    id = window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return "";
  }
};

/* ---------- formatting ---------- */
export const toDate = (v) => {
  const d = v ? new Date(v) : null;
  return d && !Number.isNaN(d.getTime()) ? d : null;
};

export const fmtDate = (v, opts = { day: "numeric", month: "short", year: "numeric" }) => {
  const d = toDate(v);
  return d ? d.toLocaleDateString("en-IN", opts) : "";
};

export const isoDate = (v) => toDate(v)?.toISOString() || undefined;

export const fmtViews = (n) => {
  const v = Number(n) || 0;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1).replace(/\.0$/, "")}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
  return String(v);
};

export const titleCase = (s = "") =>
  String(s)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\b(Ai|Api|Apis|Llm|Rag|Sql|Hld|Lld|Aws|Gcp|Mcp|Ui|Ux|Css|Html|Js)\b/g, (w) => w.toUpperCase());

export const initials = (name = "") =>
  String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("") || "TT";

export const stripHtml = (html = "") =>
  String(html)
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

export const truncate = (text = "", max = 160) => {
  const t = stripHtml(text);
  return t.length <= max ? t : `${t.slice(0, max - 1).trim()}…`;
};

export const absoluteUrl = (u = "") => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`;
};

export const postUrl = (slug) => `${SITE_URL}/blog/${slug}`;

export const errText = (e, fallback) =>
  e?.response?.data?.error?.message || e?.response?.data?.message || e?.message || fallback;

/*
  Question headings followed by paragraphs become FAQ entries.
  Only reads what the article already says, so nothing is invented.
  Same rule as the server renderer in client/api/blog.js.
*/
export function extractFaqs(html = "") {
  const faqs = [];
  const re = /<h[2-4][^>]*>([\s\S]*?\?)\s*<\/h[2-4]>\s*((?:<p[^>]*>[\s\S]*?<\/p>\s*){1,3})/gi;
  let m;
  while ((m = re.exec(html)) && faqs.length < 10) {
    const q = stripHtml(m[1]);
    const a = stripHtml(m[2]);
    if (q.length > 8 && a.length > 20) faqs.push({ q, a });
  }
  return faqs;
}

export const wordCount = (html = "") => {
  const t = stripHtml(html);
  return t ? t.split(/\s+/).length : 0;
};
