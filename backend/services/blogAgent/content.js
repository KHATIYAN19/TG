/*
|--------------------------------------------------------------------------
| CONTENT PROCESSING
|--------------------------------------------------------------------------
|
| Turns model HTML into HTML that:
|
|   1. the Target Trek rich-text editor (Quill) can open and edit without
|      losing anything (same formats the Add Blog page supports),
|   2. only contains links that are real:
|        - internal -> must exist in the link catalog
|        - external -> must be a source the research step actually found
|      (anything else is unwrapped, text kept),
|   3. is finally passed through the same sanitizer the blog controller uses.
|
*/

import sanitizeHtml from "sanitize-html";

import {
  sanitizeBlogHtml,
  sanitizePlainText,
} from "../../controllers/Blog.js";

import { SITE_URL } from "./links.js";

/* ------------------------------------------------------------------ */

export const normalizeUrl = (
  value
) => {
  try {
    const url = new URL(
      String(value).trim()
    );

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return "";
    }

    url.hash = "";

    for (const key of [
      ...url.searchParams.keys(),
    ]) {
      if (
        key.startsWith("utm_") ||
        key === "ref" ||
        key === "source"
      ) {
        url.searchParams.delete(key);
      }
    }

    let out = url.toString();

    if (
      out.endsWith("/") &&
      url.pathname !== "/"
    ) {
      out = out.slice(0, -1);
    }

    return out.toLowerCase();
  } catch {
    return "";
  }
};

/*
 * Removes tracking parameters (utm_*, ref, source…) but keeps the URL
 * otherwise exactly as written (case, path, other params).
 */
export const cleanUrl = (value) => {
  try {
    const url = new URL(
      String(value).trim()
    );

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return "";
    }

    for (const key of [
      ...url.searchParams.keys(),
    ]) {
      if (
        key.startsWith("utm_") ||
        key === "ref" ||
        key === "source" ||
        key === "fbclid" ||
        key === "gclid"
      ) {
        url.searchParams.delete(key);
      }
    }

    url.hash = "";

    return url.toString();
  } catch {
    return "";
  }
};

const BARE_DOMAIN =
  /^(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/\S*)?$/i;

/*
 * Search-tool style output sometimes leaks into text as markdown:
 *   "... continue processing ([cwiki.apache.org](https://…?utm_source=openai))."
 * Convert real markdown links to <a>, and remove bare-domain citations
 * (the Sources section already lists them).
 */
function normalizeStrayMarkdown(html) {
  let out = String(html);

  /* "([domain](url))" / "(domain)" citations -> removed */
  out = out.replace(
    /\s*\(\s*\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\s*\)/g,
    (_m, text) =>
      BARE_DOMAIN.test(text.trim())
        ? ""
        : ` (${text})`
  );

  /* remaining markdown links -> <a> (bare-domain anchors dropped) */
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    (_m, text, url) =>
      BARE_DOMAIN.test(text.trim())
        ? ""
        : `<a href="${url}">${text}</a>`
  );

  /* **bold** / *italic* leftovers */
  out = out
    .replace(
      /\*\*([^*\n<>]+)\*\*/g,
      "<strong>$1</strong>"
    );

  return out;
}

/* Run a text fix only outside <pre> blocks (never touch code). */
const outsidePre = (html, fn) =>
  String(html)
    .split(/(<pre[\s\S]*?<\/pre>)/gi)
    .map((part, i) => (i % 2 ? part : fn(part)))
    .join("");

const siteHost = () => {
  try {
    return new URL(SITE_URL).host;
  } catch {
    return "www.targettrek.in";
  }
};


/*
 * Keeps only real links. Done as a separate pass (not sanitize-html's
 * transformTags) because renaming a tag to a disallowed name makes
 * sanitize-html mis-pair later closing tags.
 */
function rewriteLinks(
  html,
  { internalPaths, allowedExternal }
) {
  return html.replace(
    /<a\s+([^>]*?)>([\s\S]*?)<\/a>/gi,
    (_match, attrs, inner) => {
      const href = (
        /href\s*=\s*"([^"]*)"/i.exec(
          attrs
        ) ||
        /href\s*=\s*'([^']*)'/i.exec(
          attrs
        ) ||
        []
      )[1]?.trim();

      if (!href) {
        return inner;
      }

      if (href.startsWith("mailto:")) {
        return `<a href="${href}">${inner}</a>`;
      }

      const absolute = href.startsWith(
        "/"
      )
        ? `${SITE_URL}${href}`
        : cleanUrl(href) || href;

      let parsed;

      try {
        parsed = new URL(absolute);
      } catch {
        return inner;
      }

      if (
        parsed.protocol !== "http:" &&
        parsed.protocol !== "https:"
      ) {
        return inner;
      }

      /* ---------------- internal ---------------- */

      if (parsed.host === siteHost()) {
        const path =
          parsed.pathname.replace(
            /\/+$/,
            ""
          ) || "/";

        return internalPaths.has(path)
          ? `<a href="${SITE_URL}${path}">${inner}</a>`
          : inner;
      }

      /* ---------------- external ---------------- */

      return allowedExternal.has(
        normalizeUrl(absolute)
      )
        ? `<a href="${absolute.replace(
            /"/g,
            "%22"
          )}" target="_blank" rel="noopener noreferrer">${inner}</a>`
        : inner;
    }
  );
}

/* ------------------------------------------------------------------ */

export function processContent(
  html,
  {
    internalPaths = new Set(),
    allowedExternal = new Set(),
  } = {}
) {
  let input = outsidePre(
    html || "",
    normalizeStrayMarkdown
  );

  /*
   * Quill code blocks are <pre class="ql-syntax"> with plain text inside.
   */
  input = input.replace(
    /<pre[^>]*>([\s\S]*?)<\/pre>/gi,
    (_m, inner) =>
      `<pre class="ql-syntax" spellcheck="false">${inner.replace(
        /<\/?(?:code|span)[^>]*>/gi,
        ""
      )}</pre>`
  );

  input = rewriteLinks(input, {
    internalPaths,
    allowedExternal,
  });

  const cleaned = sanitizeHtml(
    input,
    {
      allowedTags: [
        "p",
        "br",
        "h2",
        "h3",
        "h4",
        "strong",
        "em",
        "u",
        "s",
        "ul",
        "ol",
        "li",
        "blockquote",
        "pre",
        "code",
        "a",
      ],

      allowedAttributes: {
        a: [
          "href",
          "target",
          "rel",
        ],

        pre: ["class", "spellcheck"],
      },

      allowedClasses: {
        pre: ["ql-syntax"],
      },

      allowedSchemes: [
        "http",
        "https",
        "mailto",
      ],

      /*
       * Dangerous / unsupported containers are dropped WITH their content.
       */
      nonTextTags: [
        "script",
        "style",
        "textarea",
        "noscript",
        "iframe",
      ],

      transformTags: {
        h1: "h2",
        h5: "h4",
        h6: "h4",
        b: "strong",
        i: "em",
      },
    }
  );

  /*
   * Final guard: identical sanitiser to the Add Blog endpoint.
   */
  return sanitizeBlogHtml(cleaned)
    .replace(/<p>\s*<\/p>/g, "")
    .trim();
}

/* ------------------------------------------------------------------ */

export const plainTextOf = (html) =>
  sanitizePlainText(html);

export const wordCountOf = (html) => {
  const text = plainTextOf(html);

  return text
    ? text.split(/\s+/).length
    : 0;
};

export const countLinks = (html) => {
  const internal = [];
  const external = [];

  for (const m of String(
    html
  ).matchAll(/<a\s[^>]*href="([^"]+)"/gi)) {
    (m[1].startsWith(SITE_URL)
      ? internal
      : external
    ).push(m[1]);
  }

  return { internal, external };
};
