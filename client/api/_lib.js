// Shared helpers for the SEO/AEO serverless functions.
// Files starting with "_" are not exposed as routes by Vercel.

export const SITE_URL = "https://www.targettrek.in";
export const SITE_NAME = "Target Trek";
export const LOGO_URL = "https://i.postimg.cc/13B9k289/target-Trek-logo-2.jpg";

export const API_URL = (
  process.env.BLOG_API_URL ||
  process.env.VITE_BASE_URL ||
  "https://tg-540700086743.asia-south2.run.app"
).replace(/\/+$/, "");

export const esc = (v = "") =>
  String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

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

// JSON-LD must never be able to close the <script> tag.
export const jsonLd = (obj) =>
  `<script type="application/ld+json" data-rh="true">${JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029")}</script>`;

export const absoluteUrl = (u = "") => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`;
};

export const toIso = (d) => {
  const date = new Date(d);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export async function fetchApi(path, { timeout = 25000 } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(timeout),
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON */
  }
  return { status: res.status, ok: res.ok, body };
}

// The pristine SPA shell (hashed asset links). The build saves it as
// shell.html because dist/index.html is replaced by the prerendered home page.
export async function getTemplate(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  try {
    const res = await fetch(`${proto}://${host}/shell.html`, {
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const html = await res.text();
      if (html.includes('id="root"')) return html;
    }
  } catch {
    /* fall through */
  }
  return null;
}

// Swap the SPA's generic head tags for page-specific ones and pre-render
// content into #root. React replaces the content once it boots, and
// react-helmet-async replaces every tag marked data-rh="true".
export function renderPage(template, { head, bodyHtml }) {
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(
      /<meta\s+(?:name|property)="(?:description|keywords|author|robots|og:[^"]*|twitter:[^"]*)"[\s\S]*?>/gi,
      ""
    )
    .replace(/<link\s+rel="canonical"[\s\S]*?>/gi, "");

  html = html.replace(/<\/head>/i, `${head}\n</head>`);
  html = html.replace(
    /<div id="root">\s*<\/div>/i,
    `<div id="root">${bodyHtml}</div>`
  );
  return html;
}

export const metaTags = ({
  title,
  description,
  canonical,
  image,
  imageAlt,
  type = "website",
  robots = "index, follow, max-image-preview:large, max-snippet:-1",
  extra = "",
}) => `
<title data-rh="true">${esc(title)}</title>
<meta data-rh="true" name="description" content="${esc(description)}" />
<meta data-rh="true" name="robots" content="${esc(robots)}" />
<link data-rh="true" rel="canonical" href="${esc(canonical)}" />
<meta data-rh="true" property="og:type" content="${esc(type)}" />
<meta data-rh="true" property="og:title" content="${esc(title)}" />
<meta data-rh="true" property="og:description" content="${esc(description)}" />
<meta data-rh="true" property="og:url" content="${esc(canonical)}" />
<meta data-rh="true" property="og:site_name" content="${SITE_NAME}" />
<meta data-rh="true" property="og:locale" content="en_IN" />
${image ? `<meta data-rh="true" property="og:image" content="${esc(image)}" />
<meta data-rh="true" property="og:image:alt" content="${esc(imageAlt || title)}" />` : ""}
<meta data-rh="true" name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />
<meta data-rh="true" name="twitter:title" content="${esc(title)}" />
<meta data-rh="true" name="twitter:description" content="${esc(description)}" />
${image ? `<meta data-rh="true" name="twitter:image" content="${esc(image)}" />` : ""}
${extra}`;

export function send(res, status, body, { type = "text/html; charset=utf-8", cache } = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", type);
  res.setHeader(
    "Cache-Control",
    cache || "public, max-age=0, s-maxage=300, stale-while-revalidate=86400"
  );
  res.end(body);
}

// Fetch every published post (paged) – used by sitemap + llms.txt.
export async function fetchAllPosts() {
  const all = [];
  for (let page = 1; page <= 40; page += 1) {
    const { ok, body } = await fetchApi(`/blogs?limit=50&page=${page}&sort=latest`);
    if (!ok || !body?.success) throw new Error("Blog API unavailable");
    all.push(...(body.data || []));
    if (!body.pagination?.hasNextPage) break;
  }
  return all;
}

// Tiny, safe markdown → HTML (escapes everything first). Enough for interview
// write-ups: headings, lists, bold/italic, inline + fenced code, links.
export function mdToHtml(md = "") {
  const lines = esc(String(md)).replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let list = null;
  let code = false;
  let para = [];

  const inline = (t) =>
    t
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$2" rel="noopener nofollow">$1</a>'
      );

  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
    para = [];
  };
  const closeList = () => {
    if (list) out.push(`</${list}>`);
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.trim().startsWith("```")) {
      flushPara();
      closeList();
      out.push(code ? "</code></pre>" : "<pre><code>");
      code = !code;
      continue;
    }
    if (code) {
      out.push(line);
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    const ul = /^\s*[-*]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (h) {
      flushPara();
      closeList();
      const lvl = Math.min(6, h[1].length + 1); // page <h1> is the title
      out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`);
    } else if (ul || ol) {
      flushPara();
      const tag = ul ? "ul" : "ol";
      if (list !== tag) {
        closeList();
        out.push(`<${tag}>`);
        list = tag;
      }
      out.push(`<li>${inline((ul || ol)[1])}</li>`);
    } else if (!line.trim()) {
      flushPara();
      closeList();
    } else {
      closeList();
      para.push(line.trim());
    }
  }
  flushPara();
  closeList();
  if (code) out.push("</code></pre>");
  return out.join("\n");
}

// All published interview experiences (paged API) – sitemap / llms.txt.
export async function fetchAllInterviews() {
  const all = [];
  for (let page = 1; page <= 40; page += 1) {
    const { ok, body } = await fetchApi(`/api/interview?page=${page}`);
    if (!ok || !body?.success) throw new Error("Interview API unavailable");
    all.push(...(body.data || []));
    if (!body.pagination?.hasNextPage) break;
  }
  return all;
}
