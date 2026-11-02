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
    file: "src/component/SystemDesignHLD.jsx",
    pick: ["SEO_TITLE", "SEO_DESCRIPTION", "SEO_LONG_DESCRIPTION", "SEO_KEYWORDS", "faqs", "caseStudies"],
  },
  "/book/system-design/lld": {
    file: "src/component/SystemDesignLLD.jsx",
    pick: ["SEO_TITLE", "SEO_DESCRIPTION", "SEO_LONG_DESCRIPTION", "faqItems"],
  },
  "/book/system-design/hld-lld/combo": {
    file: "src/component/SystemDesignCombo.jsx",
    pick: ["SEO_TITLE", "SEO_DESCRIPTION", "SEO_LONG_DESCRIPTION", "SEO_KEYWORDS", "FAQS"],
  },
  "/book/java-interview-handbook": {
    file: "src/component/JavaInterviewHandbook.jsx",
    pick: ["SEO_TITLE", "SEO_DESCRIPTION", "SEO_LONG_DESCRIPTION", "SEO_KEYWORDS", "FAQS"],
  },
  "/book/springboot-interview-handbook": {
    file: "src/component/SpringBootInterviewHandbook.jsx",
    pick: ["SEO_TITLE", "SEO_DESCRIPTION", "SEO_LONG_DESCRIPTION", "SEO_KEYWORDS", "FAQS"],
  },
  "/book/genai/google-adk": {
    file: "src/component/GenAiGoogleAdk.jsx",
    pick: ["SEO_TITLE", "SEO_DESCRIPTION", "FAQS"],
  },
  "/book/genai/mcp": {
    file: "src/component/GenaiMCP.jsx",
    pick: ["SEO_TITLE", "SEO_DESCRIPTION", "FAQS"],
  },
  "/book/genai/rag": {
    file: "src/component/GenaiRAG.jsx",
    pick: ["SEO_TITLE", "SEO_DESCRIPTION", "FAQS"],
  },
};

// Return the source text of `const NAME = <expr>;` using bracket matching.
function extractConst(src, name) {
  const re = new RegExp(`^(?:export\\s+)?const\\s+${name}\\s*=\\s*`, "m");
  const m = re.exec(src);
  if (!m) return null;
  let i = m.index + m[0].length;
  const start = i;
  let depth = 0;
  let quote = null;
  for (; i < src.length; i += 1) {
    const c = src[i];
    if (quote) {
      if (c === "\\") i += 1;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if ("[{(".includes(c)) depth += 1;
    else if ("]})".includes(c)) depth -= 1;
    else if (c === ";" && depth === 0) break;
  }
  return src.slice(start, i);
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
  const src = fs.readFileSync(path.join(root, spec.file), "utf8");
  const data = {};
  for (const name of spec.pick) {
    const text = extractConst(src, name);
    if (text == null) continue;
    try {
      data[name] = norm(vm.runInContext(`(${text})`, ctx, { timeout: 500 }));
    } catch (e) {
      report.push(`  ! ${route}: could not evaluate ${name} (${e.message})`);
    }
  }
  const faqKey = ["FAQS", "faqs", "faqItems"].find((k) => data[k]);
  out[route] = {
    title: data.SEO_TITLE || null,
    description: data.SEO_DESCRIPTION || null,
    longDescription: data.SEO_LONG_DESCRIPTION || null,
    keywords: data.SEO_KEYWORDS || null,
    faqs: faqKey ? normaliseFaqs(data[faqKey]) : [],
    extras: Object.fromEntries(
      Object.entries(data).filter(([k]) =>
        ["FREE_RESOURCES", "FEATURED_BOOKS", "LEARNING_AREAS", "caseStudies"].includes(k)
      )
    ),
  };
  report.push(
    `${route}: title=${out[route].title ? out[route].title.length : "MISSING"} desc=${out[route].description ? out[route].description.length : "MISSING"} faqs=${out[route].faqs.length}`
  );
}
out["/book"] = out["/books"];

fs.writeFileSync(path.join(root, "api/_seo-data.json"), JSON.stringify(out));
console.log(report.join("\n"));
