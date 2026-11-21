// Prerenders content pages (no per-request data) into static HTML after
// `vite build`: dist/prerendered/<route>.html. Vercel rewrites serve these
// files, so crawlers get the full head + body without running JavaScript.
// Any page that fails to render falls back to the plain SPA shell so the
// rewrite target always exists.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

// Minimal browser stubs for module-level code (e.g. Redux auth slice).
// `window` is intentionally NOT defined so SSR guards keep working.
const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
  clear: () => mem.clear(),
};

const ROUTES = {
  "/": "src/component/LearnHome.jsx",
  "/about": "src/component/AboutPage.jsx",
  "/contact": "src/component/ContactPage.jsx",
  "/mock-interviews": "src/component/InterviewBookingPage.jsx",
  "/privacy-policy": "src/component/PrivacyPolicy.jsx",
  "/terms-of-service": "src/component/TermsOfService.jsx",
  "/refund-policy": "src/component/RefundPolicy.jsx",
  "/resources": "src/component/Resources.jsx",
  "/resources/hld": "src/hld/HLDResources.jsx",
  "/resources/hld/cache": "src/hld/HLDCacheResource.jsx",
  "/resources/hld/load-balancing": "src/hld/HLDLoadBalancingResource.jsx",
  "/resources/hld/database": "src/hld/HLDDatabaseResource.jsx",
  "/resources/hld/message-queue": "src/hld/HLDMessageQueueResource.jsx",
  "/resources/hld/rate-limiting": "src/hld/HLDRateLimitingResource.jsx",
  "/resources/hld/api-gateway": "src/hld/HLDApiGatewayResource.jsx",
  "/resources/sql": "src/sql/SQLResource.jsx",
  "/resources/apis": "src/api/APIResource.jsx",
  "/memories": "src/memories/MemoriesLanding.jsx",
  "/memories/birthday": "src/memories/BirthdayLanding.jsx",
  "/resume-review": "src/resume/ResumeLanding.jsx",
  "/resume-review/ats-score-checker": "src/resume/AtsChecker.jsx",
  "/referral": "src/referral/ReferralLanding.jsx",
  "/prep-buddy": "src/arena/ArenaLanding.jsx",
  "/books/bundle-offers": "src/Ebooks/BundleOffers.jsx",
};

/* Book and pack pages. Rendered here with live data seeded into the page caches, so the HTML carries the
   whole page (contents, FAQs, case studies, price) and not a loading state. They are served through
   api/page.js, which reads these files and swaps in the current price at request time. */
const BOOK_ROUTES = {
  "/books": "src/Ebooks/Books.jsx",
  "/book/system-design/hld": "src/component/SystemDesignHLD.jsx",
  "/book/system-design/lld": "src/component/SystemDesignLLD.jsx",
  "/book/system-design/hld-lld/combo": "src/component/SystemDesignCombo.jsx",
  "/book/cloud/aws": "src/component/AwsHandbook.jsx",
  "/book/cloud/gcp": "src/component/GcpHandbook.jsx",
  "/book/docker": "src/component/DockerBooks.jsx",
  "/book/git": "src/component/GitBooks.jsx",
  "/book/database/sql": "src/component/SqlInterviewHandbook.jsx",
  "/book/computer-network": "src/component/ComputerNetworkBook.jsx",
  "/books/operating-systems": "src/component/OperatingSystemBook.jsx",
  "/book/java-interview-handbook": "src/component/JavaInterviewHandbook.jsx",
  "/book/springboot-interview-handbook": "src/component/SpringBootInterviewHandbook.jsx",
  "/book/genai/google-adk": "src/component/GenAiGoogleAdk.jsx",
  "/book/genai/mcp": "src/component/GenaiMCP.jsx",
  "/book/genai/rag": "src/component/GenaiRAG.jsx",
  "/book/all-books": "src/Ebooks/AllAccess.jsx",
  "/book/life-type-combo": "src/Ebooks/AllAccess.jsx",
  "/others/book/how-to-sell-ebook": "src/component/HowToSellEbook.jsx",
};
Object.assign(ROUTES, BOOK_ROUTES);

/* ------------------------------------------------------------------ live data for the book pages */
const API_URL = (process.env.VITE_BASE_URL || "https://tg-540700086743.asia-south2.run.app").replace(/\/+$/, "");
const getJson = async (p) => {
  try {
    const res = await fetch(`${API_URL}${p}`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(30000) });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
};
const [catalogRes, plansRes] = await Promise.all([getJson("/book/catalog"), getJson("/api/membership/plans")]);
const catalogData = catalogRes?.success
  ? { books: catalogRes.data || [], offers: catalogRes.offers || [], plans: catalogRes.plans || null }
  : null;
const productUrls = [...new Set([...Object.keys(BOOK_ROUTES), ...(catalogData?.books || []).map((b) => b.redirectUrl).filter(Boolean)])];
// the backend answers at most 10 URLs per batch request
const productMap = {};
for (let i = 0; i < productUrls.length; i += 10) {
  const r = await getJson(`/book/products?redirectUrls=${encodeURIComponent(productUrls.slice(i, i + 10).join(","))}`);
  if (r?.success) Object.assign(productMap, r.data || {});
}
console.log(`live data: catalog=${catalogData ? catalogData.books.length : "unavailable"} products=${Object.values(productMap).filter(Boolean).length} packs=${plansRes?.data?.packs?.length ?? "unavailable"}`);

// Keep the pristine SPA shell: dist/index.html is overwritten below with the
// prerendered home page, and the serverless functions + catch-all rewrite use
// shell.html as their template.
const DEFAULT_OG_IMAGE = "https://www.targettrek.in/brand/target-trek-logo.jpg";
const shellFile = path.join(dist, "shell.html");
if (!fs.existsSync(shellFile)) {
  fs.copyFileSync(path.join(dist, "index.html"), shellFile);
}
const template = fs.readFileSync(shellFile, "utf8");

const strip = (html) =>
  html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(
      /<meta\s+(?:name|property)="(?:description|keywords|author|robots|og:[^"]*|twitter:[^"]*)"[\s\S]*?>/gi,
      ""
    )
    .replace(/<link\s+rel="canonical"[\s\S]*?>/gi, "");

const outFile = (route) =>
  route === "/"
    ? path.join(dist, "index.html")
    : path.join(dist, "prerendered", `${route.replace(/^\//, "")}.html`);

const write = (route, html) => {
  const file = outFile(route);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
};

/* ------------------------------------------------------------------ route -> chunk map
   Every lazy page lives in its own JS + CSS chunk. Without links to them in the HTML,
   the browser paints the prerendered body unstyled until the entry JS has run, the
   router has picked the route and the chunk's CSS has been fetched. So:
     - prerendered pages get the page's <link rel="stylesheet"> + <link rel="modulepreload">
     - dist/route-assets.json lets the serverless book pages and the client's hover/tap
       prefetch do the same for any route. */
const manifestFile = path.join(dist, ".vite", "manifest.json");
const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, "utf8")) : {};

const resolveSrc = (spec) => {
  const base = path.posix.join("src", spec.replace(/^\.\//, ""));
  return [base, `${base}.jsx`, `${base}.js`].find((k) => manifest[k]);
};

const collect = (key, seen = new Set()) => {
  const out = { css: new Set(), js: new Set() };
  const walk = (k) => {
    if (!manifest[k] || seen.has(k)) return;
    seen.add(k);
    out.js.add(manifest[k].file);
    (manifest[k].css || []).forEach((c) => out.css.add(c));
    (manifest[k].imports || []).forEach(walk);
  };
  walk(key);
  return out;
};

const buildRouteAssets = () => {
  const entryKey = Object.keys(manifest).find((k) => manifest[k].isEntry);
  if (!entryKey) return {};
  const base = collect(entryKey); // already linked by the shell
  const app = fs.readFileSync(path.join(root, "src/App.jsx"), "utf8");

  const lazyFiles = {};
  for (const m of app.matchAll(/const\s+(\w+)\s*=\s*lazy\(\s*\(\)\s*=>\s*import\(\s*"([^"]+)"\s*\)/g)) {
    const key = resolveSrc(m[2]);
    if (key) lazyFiles[m[1]] = key;
  }

  const map = {};
  for (const m of app.matchAll(/path="([^"]+)"\s+element=\{\s*<(\w+)/g)) {
    const [, route, comp] = m;
    if (!lazyFiles[comp] || route.includes(":") || route.includes("*") || map[route]) continue;
    const { css, js } = collect(lazyFiles[comp]);
    const cssNeeded = [...css].filter((c) => !base.css.has(c));
    const jsNeeded = [...js].filter((j) => !base.js.has(j));
    map[route] = { css: cssNeeded.map((f) => `/${f}`), js: jsNeeded.map((f) => `/${f}`) };
  }
  return map;
};

const routeAssetsFile = path.join(dist, "route-assets.json");
let routeAssets = buildRouteAssets();
if (Object.keys(routeAssets).length) {
  fs.writeFileSync(routeAssetsFile, JSON.stringify(routeAssets));
} else if (fs.existsSync(routeAssetsFile)) {
  // re-run without a fresh `vite build` (the manifest is deleted after use): keep the existing map
  routeAssets = JSON.parse(fs.readFileSync(routeAssetsFile, "utf8"));
}
console.log(`route-assets.json: ${Object.keys(routeAssets).length} routes`);

const assetLinks = (route) => {
  const a = routeAssets[route];
  if (!a) return "";
  return [
    ...a.css.map((href) => `<link rel="stylesheet" crossorigin href="${href}">`),
    ...a.js.map((href) => `<link rel="modulepreload" crossorigin href="${href}">`),
  ].join("\n");
};

const vite = await createServer({
  root,
  logLevel: "error",
  appType: "custom",
  server: { middlewareMode: true },
  ssr: {
    noExternal: ["react-helmet-async"],
    // react-router v7 publishes its ESM build for Node under the "module-sync" export condition. Without it Vite
    // resolves externals to the CommonJS build, whose named exports (Link, StaticRouter, ...) Node cannot detect.
    resolve: { externalConditions: ["module-sync"] },
  },
  // SSR only: skip the browser dependency scan, otherwise closing the server
  // cancels esbuild mid-scan and logs "[ERROR] The build was canceled".
  optimizeDeps: { noDiscovery: true, include: [], entries: [] },
});

let ok = 0;
const failed = [];

try {
  const { renderPage } = await vite.ssrLoadModule("/src/prerender-entry.jsx");
  const bookApi = await vite.ssrLoadModule("/src/utils/bookApi.js");
  const packSections = await vite.ssrLoadModule("/src/Ebooks/PackSections.jsx");

  for (const [route, file] of Object.entries(ROUTES)) {
    try {
      if (BOOK_ROUTES[route]) {
        // re-seed before every page: the caches have short TTLs and the render loop can take a while
        bookApi.primeProducts(productMap);
        bookApi.primeCatalog(catalogData);
        packSections.primePacks(plansRes?.success ? plansRes.data : null);
      }
      const mod = await vite.ssrLoadModule(`/${file}`);
      const Component = mod.default;
      const { body, head } = renderPage(Component, route);

      if (!/<h1[\s>]/i.test(body) || !/<title/i.test(head)) {
        throw new Error("no <h1> or <title> in output");
      }

      // every shared link needs a preview image (WhatsApp, LinkedIn, X, Slack): fall back to the logo
      const imageTags = /property="og:image"/.test(head)
        ? ""
        : `<meta property="og:image" content="${DEFAULT_OG_IMAGE}" />\n<meta property="og:image:alt" content="Target Trek" />${/name="twitter:image"/.test(head) ? "" : `\n<meta name="twitter:image" content="${DEFAULT_OG_IMAGE}" />`}`;
      let html = strip(template);
      html = html.replace(/<\/head>/i, `${assetLinks(route)}\n${head}\n${imageTags}\n</head>`);
      html = html.replace(/<div id="root">\s*<\/div>/i, `<div id="root">${body}</div>`);
      write(route, html);
      ok += 1;
      console.log(`  ✓ ${route}  (${(body.length / 1024).toFixed(0)} KB body)`);
    } catch (err) {
      failed.push(route);
      write(route, template); // keep the rewrite target valid
      console.log(`  ✗ ${route}: ${String(err.message).split("\n")[0]}`); if (process.env.PRERENDER_DEBUG) console.log(err.stack);
    }
  }
} finally {
  await vite.close();
}

console.log(`Prerendered ${ok}/${Object.keys(ROUTES).length} pages`);
if (failed.length) console.log("Fell back to SPA shell:", failed.join(", "));

// the manifest was only needed above; route-assets.json is what the site serves
fs.rmSync(path.join(dist, ".vite"), { recursive: true, force: true });
