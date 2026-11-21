// Extracts SEO text (titles, descriptions, FAQs, lists) straight from the page
// components so the server-rendered HTML always matches what the React pages
// show. Run automatically before `vite build`; output: api/_seo-data.json
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = "https://www.targettrek.in";

const PAGES = {
  "/learn": {
    file: "src/component/LearnHome.jsx",
    pick: ["SEO_TITLE", "SEO_DESCRIPTION", "FAQS", "FREE_RESOURCES", "FEATURED_BOOKS", "LEARNING_AREAS"],
  },
  "/books": {
    file: "src/Ebooks/Books.jsx",
    pick: ["SEO_TITLE", "SEO_DESCRIPTION", "FAQS"],
  },
  "/book/system-design/hld": {
    files: ["src/component/SystemDesignHLD.jsx", "src/component/hldBookData.js"],
    pick: ["SEO_TITLE", "SEO_DESCRIPTION", "SEO_LONG_DESCRIPTION", "SEO_KEYWORDS", "faqs", "caseStudies"],
  },
  "/book/system-design/lld": {
    files: ["src/component/SystemDesignLLD.jsx", "src/component/lldBookData.js"],
    pick: ["SEO_TITLE", "SEO_DESCRIPTION", "SEO_LONG_DESCRIPTION", "SEO_KEYWORDS", "faqItems"],
  },
  "/book/cloud/aws": {
    files: ["src/component/AwsHandbook.jsx", "src/component/awsBookData.js"],
    pick: ["SEO_TITLE", "SEO_DESCRIPTION", "SEO_LONG_DESCRIPTION", "SEO_KEYWORDS", "HANDBOOK", "QUICK_ANSWER", "PARTS_RAW", "PICKER", "REF_ARCHS", "LABS"],
  },
  "/book/docker": {
    files: ["src/component/DockerBooks.jsx", "src/component/dockerBookData.js"],
    pick: ["SEO_TITLE", "SEO_DESCRIPTION", "SEO_LONG_DESCRIPTION", "SEO_KEYWORDS", "FAQS", "HANDBOOK", "CHEATSHEET", "PARTS_RAW", "cheatSheetSections"],
  },
  "/book/git": {
    files: ["src/component/GitBooks.jsx", "src/component/gitBookData.js"],
    pick: ["SEO_TITLE", "SEO_DESCRIPTION", "SEO_LONG_DESCRIPTION", "SEO_KEYWORDS", "FAQS", "HANDBOOK", "CHEATSHEET", "CHAPTERS_RAW", "APPENDIX", "cheatSheetSections"],
  },
  "/book/cloud/gcp": {
    files: ["src/component/GcpHandbook.jsx", "src/component/gcpBookData.js"],
    pick: ["SEO_TITLE", "SEO_DESCRIPTION", "SEO_LONG_DESCRIPTION", "SEO_KEYWORDS", "HANDBOOK", "QUICK_ANSWER", "PARTS_RAW", "PICKER", "REF_ARCHS", "LABS"],
  },
  "/book/database/sql": {
    file: "src/component/csBook/sqlData.jsx",
    pick: ["FAQS"],
    props: { BOOK_SEO: ["SQL_BOOK", "seo"], QUICK: ["SQL_BOOK", "quick"] },
  },
  "/book/system-design/hld-lld/combo": {
    file: "src/component/SystemDesignCombo.jsx",
    pick: ["SEO_TITLE", "SEO_DESCRIPTION", "SEO_LONG_DESCRIPTION", "SEO_KEYWORDS", "FAQS"],
  },
  "/book/java-interview-handbook": {
    file: "src/component/JavaInterviewHandbook.jsx",
    pick: ["SEO", "FAQS"],
  },
  "/book/springboot-interview-handbook": {
    file: "src/component/SpringBootInterviewHandbook.jsx",
    pick: ["SEO", "FAQS"],
  },
  "/book/genai/google-adk": {
    file: "src/component/GenAiGoogleAdk.jsx",
    pick: ["SEO", "FAQS"],
  },
  "/book/genai/mcp": {
    file: "src/component/GenaiMCP.jsx",
    pick: ["SEO", "FAQS"],
  },
  "/book/genai/rag": {
    file: "src/component/GenaiRAG.jsx",
    pick: ["SEO", "FAQS"],
  },
  "/book/computer-network": {
    file: "src/component/csBook/cnData.jsx",
    pick: [],
    props: { BOOK_SEO: ["CN_BOOK", "seo"], QUICK: ["CN_BOOK", "quick"], FAQS: ["CN_BOOK", "faqs"] },
  },
  "/books/operating-systems": {
    file: "src/component/csBook/osData.jsx",
    pick: [],
    props: { BOOK_SEO: ["OS_BOOK", "seo"], QUICK: ["OS_BOOK", "quick"], FAQS: ["OS_BOOK", "faqs"] },
  },
  "/others/book/how-to-sell-ebook": {
    file: "src/component/HowToSellEbook.jsx",
    pick: ["SEO", "FAQS"],
  },
};

// Scan one JS expression starting at `start`; stops at a depth-0 `;` or `,`, or where the enclosing bracket
// closes. Strings and comments are skipped so an apostrophe in a comment cannot derail the bracket count.
function scanExpr(src, start) {
  let i = start;
  let depth = 0;
  let quote = null;
  for (; i < src.length; i += 1) {
    const c = src[i];
    if (quote) {
      if (c === "\\") i += 1;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === "/" && src[i + 1] === "/") { i = src.indexOf("\n", i); if (i < 0) break; continue; }
    if (c === "/" && src[i + 1] === "*") { i = src.indexOf("*/", i + 2) + 1; if (i <= 0) break; continue; }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if ("[{(".includes(c)) depth += 1;
    else if ("]})".includes(c)) { depth -= 1; if (depth < 0) break; }
    else if ((c === ";" || c === ",") && depth === 0) break;
  }
  return src.slice(start, i).trim();
}

// Return the source text of `const NAME = <expr>;`.
function extractConst(src, name) {
  const re = new RegExp(`^(?:export\\s+)?const\\s+${name}\\s*=\\s*`, "m");
  const m = re.exec(src);
  return m ? scanExpr(src, m.index + m[0].length) : null;
}

// Return the source text of a top-level property of an object constant: `const NAME = { ..., prop: <expr>, ... }`.
// Lets us read plain data (seo, faqs) out of objects that also hold JSX, which cannot be evaluated here.
function extractProp(src, name, prop) {
  const obj = extractConst(src, name);
  if (!obj || obj[0] !== "{") return null;
  const re = new RegExp(`^\\s{2}${prop}\\s*:\\s*`, "m");
  const m = re.exec(obj);
  return m ? scanExpr(obj, m.index + m[0].length) : null;
}

const known = {
  SITE_URL,
  SITE_NAME: "Target Trek",
  PAGE_URL: SITE_URL,
  PAGE_PATH: "/",
  BASE_URL: "",
};
// Unknown capitalised identifiers (icon components etc.) resolve to null.
const ctx = vm.createContext(
  new Proxy(known, {
    has: (t, k) => typeof k === "string" && (k in t || /^[A-Z][A-Za-z0-9]*$/.test(k)),
    get: (t, k) => (k in t ? t[k] : null),
  })
);

const norm = (v) => (v == null ? v : JSON.parse(JSON.stringify(v)));

function normaliseFaqs(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((x) =>
      Array.isArray(x)
        ? { q: x[0], a: x[1] }
        : { q: x.q || x.question, a: x.a || x.answer }
    )
    .filter((x) => typeof x.q === "string" && typeof x.a === "string");
}

const out = {};
const report = [];

for (const [route, spec] of Object.entries(PAGES)) {
  const src = (spec.files || [spec.file]).map((f) => fs.readFileSync(path.join(root, f), "utf8")).join("\n");
  const data = {};
  const evaluate = (name, text) => {
    if (text == null) return;
    try {
      data[name] = norm(vm.runInContext(`(${text})`, ctx, { timeout: 500 }));
    } catch (e) {
      report.push(`  ! ${route}: could not evaluate ${name} (${e.message})`);
    }
  };
  for (const name of spec.pick) evaluate(name, extractConst(src, name));
  for (const [name, [obj, prop]] of Object.entries(spec.props || {})) evaluate(name, extractProp(src, obj, prop));
  // pages use either SEO_TITLE-style constants or one SEO = { title, description, keywords, long } object
  const seo = data.SEO || data.BOOK_SEO || {};
  const faqKey = ["FAQS", "faqs", "faqItems"].find((k) => data[k]);
  out[route] = {
    title: data.SEO_TITLE || seo.title || null,
    description: data.SEO_DESCRIPTION || seo.description || null,
    longDescription: data.SEO_LONG_DESCRIPTION || seo.long || seo.longDescription || null,
    keywords: data.SEO_KEYWORDS || seo.keywords || null,
    faqs: [...normaliseFaqs(data.QUICK), ...(faqKey ? normaliseFaqs(data[faqKey]) : [])],
    extras: Object.fromEntries(
      Object.entries(data).filter(([k]) =>
        ["FREE_RESOURCES", "FEATURED_BOOKS", "LEARNING_AREAS", "caseStudies", "HANDBOOK", "CHEATSHEET", "PARTS_RAW", "CHAPTERS_RAW", "APPENDIX", "cheatSheetSections", "QUICK_ANSWER", "PICKER", "REF_ARCHS", "LABS"].includes(k)
      )
    ),
  };
  report.push(
    `${route}: title=${out[route].title ? out[route].title.length : "MISSING"} desc=${out[route].description ? out[route].description.length : "MISSING"} faqs=${out[route].faqs.length}`
  );
}
out["/book"] = out["/books"];

console.log(report.join("\n"));
// A missing title used to ship as <title>null</title> on live product pages. Fail the build instead.
const missing = Object.entries(out).filter(([, v]) => !v.title || !v.description).map(([r]) => r);
if (missing.length) {
  console.error(`\ngen-seo-data: no SEO title/description found for ${missing.join(", ")}. Update PAGES in scripts/gen-seo-data.mjs.`);
  process.exit(1);
}
fs.writeFileSync(path.join(root, "api/_seo-data.json"), JSON.stringify(out));
