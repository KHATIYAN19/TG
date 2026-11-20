import { ResumeError } from "./service.js";
import { hasInjection } from "./ai.js";

/*
  Everything the Resume Builder knows about what is TRUE, worked out by code and not by the model:
    extractSource()  the text of an uploaded resume AND the real hyperlinks inside it (a "GitHub" word that links to github.com/asha is
                     invisible in plain text, so we read the link annotations from the PDF itself)
    normUrl / urlsInText / isAllowedUrl   a link may appear in the new resume only if it was in the old one or the person typed it
    guardInput()     one gate for everything a person types: strips markup and hidden characters, refuses prompt-injection text
*/

/* ---------- links ---------- */
export const normUrl = (u) => String(u || "").trim().toLowerCase().replace(/^mailto:/, "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[?#].*$/, "").replace(/[\s.,;:)]+$/, "").replace(/\/+$/, "");

const KNOWN = "linkedin\\.com|github\\.com|gitlab\\.com|leetcode\\.com|geeksforgeeks\\.org|codeforces\\.com|codechef\\.com|hackerrank\\.com|hackerearth\\.com|kaggle\\.com|medium\\.com|behance\\.net|dribbble\\.com|npmjs\\.com|stackoverflow\\.com|naukri\\.com|codingninjas\\.com|coursera\\.org|credly\\.com|[a-z0-9-]+\\.(?:vercel\\.app|netlify\\.app|herokuapp\\.com|onrender\\.com|web\\.app|firebaseapp\\.com|github\\.io|pages\\.dev|railway\\.app)";
const URL_RE = new RegExp(`(?:https?:\\/\\/|www\\.)[^\\s)"'<>\\]]+|\\b(?:(?:[a-z0-9-]+\\.)*(?:${KNOWN}))(?:\\/[^\\s)"'<>\\]]*)?`, "gi");
export const urlsInText = (t) => [...new Set((String(t || "").match(URL_RE) || []).map((u) => u.replace(/[.,;:]+$/, "")))];

export const isAllowedUrl = (url, allowed) => {
  const n = normUrl(url);
  return Boolean(n) && allowed.has(n);
};
export const allowedSet = (...lists) => new Set(lists.flat().map((u) => normUrl(u?.url ?? u)).filter(Boolean));

const LABELS = [["linkedin.com", "LinkedIn"], ["github.com", "GitHub"], ["leetcode.com", "LeetCode"], ["geeksforgeeks.org", "GeeksforGeeks"], ["codeforces.com", "Codeforces"], ["codechef.com", "CodeChef"], ["hackerrank.com", "HackerRank"], ["kaggle.com", "Kaggle"], ["medium.com", "Medium"], ["behance.net", "Behance"], ["gitlab.com", "GitLab"]];
export const labelFor = (url, fallback = "") => {
  const n = normUrl(url);
  const hit = LABELS.find(([d]) => n.startsWith(d) || n.includes(`.${d}`));
  return hit ? hit[1] : (fallback && fallback.length <= 30 ? fallback : "Portfolio");
};

/* the hyperlink targets written plainly in the file: a fallback for PDFs the text reader cannot open (including the ones this builder makes) */
const rawLinks = (buf) => {
  const out = [];
  for (const m of buf.toString("latin1").matchAll(/\/URI\s*\(((?:[^()\\]|\\.){3,300})\)/g)) out.push({ text: "", url: m[1].replace(/\\(.)/g, "$1") });
  return out;
};
const realLinks = (list) => {
  const seen = new Set();
  return list.filter((l) => /^https?:\/\//i.test(l.url) && !seen.has(normUrl(l.url)) && seen.add(normUrl(l.url)));
};

/* ---------- reading the PDF ---------- */
export const extractSource = async (buf) => {
  const links = [];
  const pagerender = async (page) => {
    const [tc, ann] = await Promise.all([page.getTextContent({ normalizeWhitespace: true }), page.getAnnotations().catch(() => [])]);
    let lastY;
    let text = "";
    for (const item of tc.items) {
      text += lastY == item.transform[5] || !lastY ? item.str : `\n${item.str}`;
      lastY = item.transform[5];
    }
    for (const a of ann || []) {
      if (a?.subtype !== "Link" || !a.url || !Array.isArray(a.rect)) continue;
      const [x1, y1, x2, y2] = a.rect;
      const label = tc.items.filter((i) => {
        const x = i.transform[4], y = i.transform[5], w = i.width || 0;
        return x + w >= x1 - 1 && x <= x2 + 1 && y >= y1 - 3 && y <= y2 + 1;
      }).map((i) => i.str).join("").replace(/\s+/g, " ").trim();
      links.push({ text: label.slice(0, 60), url: String(a.url).slice(0, 300) });
    }
    return text;
  };
  try {
    const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js");
    const out = await Promise.race([pdfParse(buf, { max: 6, pagerender }), new Promise((_, rej) => setTimeout(() => rej(new Error("PDF text extraction timed out")), 30_000))]);
    const text = String(out?.text || "").replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    return { text, links: realLinks([...links, ...rawLinks(buf)]), pages: out?.numpages || 0 };
  } catch (e) {
    console.warn("[resume-builder] PDF read failed:", e?.message || e);
    return { text: "", links: realLinks(rawLinks(buf)), pages: 0 };
  }
};

/* ---------- what a person types ---------- */
const INVISIBLE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g;
const MARKUP = /<\s*\/?\s*(script|iframe|object|embed|style|img|svg|link|meta|form|input|base|a)\b|javascript\s*:|data\s*:\s*text\/html|\bon[a-z]{3,}\s*=\s*["']?[^\s]/i;
const TAGS = /<\/?[a-z!][^>]*>/gi;

export const cleanText = (v, { multiline = false } = {}) => {
  let s = String(v ?? "").replace(INVISIBLE, "").replace(TAGS, " ").replace(/<<<|>>>/g, " ");
  s = multiline ? s.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n") : s.replace(/\s+/g, " ");
  return s.trim();
};

const SAFE_URL = /^(https?:\/\/)?[^\s:/@]+\.[^\s:/@]{2,}(\/\S*)?$/i;
export const cleanUrl = (v) => {
  const s = String(v ?? "").replace(INVISIBLE, "").trim();
  if (!s) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(s) && !/^https?:\/\//i.test(s)) throw new ResumeError(400, "Links must start with https:// or be a plain web address.", "BAD_LINK");
  if (!SAFE_URL.test(s)) throw new ResumeError(400, `“${s.slice(0, 40)}” doesn't look like a web address.`, "BAD_LINK");
  return s;
};

/* walks any object and cleans every string in it. Keys named link/url/repo are checked as web addresses. Throws a plain-English error for markup or instructions aimed at the AI. */
export const guardInput = (value, where = "your text") => {
  const walk = (v, key) => {
    if (typeof v === "string") {
      if (/^(url|link|repo)$/i.test(key)) return cleanUrl(v);
      if (MARKUP.test(v)) throw new ResumeError(400, `Please remove the code or HTML from ${where}.`, "MARKUP");
      if (hasInjection(v)) throw new ResumeError(400, `Part of ${where} looks like instructions for the AI, not resume content. Please remove it and try again.`, "INJECTION");
      return cleanText(v, { multiline: /^(jobDescription|details)$/.test(key) });
    }
    if (Array.isArray(v)) return v.map((x) => walk(x, key));
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x, k)]));
    return v;
  };
  return walk(value, "");
};
