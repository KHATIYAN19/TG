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
  "/carrers": "src/component/CareerPage.jsx",
  "/mock-interviews": "src/component/InterviewBookingPage.jsx",
  "/others/book/how-to-sell-ebook": "src/component/HowToSellEbook.jsx",
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
};

// Keep the pristine SPA shell: dist/index.html is overwritten below with the
// prerendered home page, and the serverless functions + catch-all rewrite use
// shell.html as their template.
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

const vite = await createServer({
  root,
  logLevel: "error",
  appType: "custom",
  server: { middlewareMode: true },
  ssr: { noExternal: ["react-helmet-async"] },
  // SSR only: skip the browser dependency scan, otherwise closing the server
  // cancels esbuild mid-scan and logs "[ERROR] The build was canceled".
  optimizeDeps: { noDiscovery: true, include: [], entries: [] },
});

let ok = 0;
const failed = [];

try {
  const { renderPage } = await vite.ssrLoadModule("/src/prerender-entry.jsx");

  for (const [route, file] of Object.entries(ROUTES)) {
    try {
      const mod = await vite.ssrLoadModule(`/${file}`);
      const Component = mod.default;
      const { body, head } = renderPage(Component, route);

      if (!/<h1[\s>]/i.test(body) || !/<title/i.test(head)) {
        throw new Error("no <h1> or <title> in output");
      }

      let html = strip(template);
      html = html.replace(/<\/head>/i, `${head}\n</head>`);
      html = html.replace(/<div id="root">\s*<\/div>/i, `<div id="root">${body}</div>`);
      write(route, html);
      ok += 1;
      console.log(`  ✓ ${route}  (${(body.length / 1024).toFixed(0)} KB body)`);
    } catch (err) {
      failed.push(route);
      write(route, template); // keep the rewrite target valid
      console.log(`  ✗ ${route}: ${String(err.message).split("\n")[0]}`);
    }
  }
} finally {
  await vite.close();
}

console.log(`Prerendered ${ok}/${Object.keys(ROUTES).length} pages`);
if (failed.length) console.log("Fell back to SPA shell:", failed.join(", "));
