import API_BASE_URL from "./Url";

/*
  One place for every public book request.

  - products: every loadProduct() call made in the same tick is merged into ONE
    GET /book/products?redirectUrls=/a,/b,/c  (was: one request per book)
  - results are kept in memory (PRODUCT_TTL) so moving between book pages costs nothing
  - identical in-flight requests are shared
  - catalog: GET /book/catalog returns the books list, the running offers AND the packs together
  - the browser may also reuse responses (the server sends Cache-Control: max-age=30)
*/

const PRODUCT_TTL = 60_000;
const CATALOG_TTL = 30_000;
const TIMEOUT_MS = 8_000;
const MESSAGE = "Book details are unavailable.";
const JSON_HEADERS = { Accept: "application/json" };

const products = new Map(); // url -> { product, at }
const inflight = new Map(); // url -> Promise<product>
let queue = [];

const getJson = async (path) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { headers: JSON_HEADERS, signal: controller.signal });
    const body = await res.json().catch(() => null);
    return { ok: res.ok, body };
  } finally {
    clearTimeout(timer);
  }
};

const fetchOne = async (url) => {
  const { ok, body } = await getJson(`/book/product?redirectUrl=${encodeURIComponent(url)}`);
  if (!ok || !body?.success || !body?.data) throw new Error(body?.error?.message || body?.message || MESSAGE);
  return body.data;
};

function flush() {
  const batch = queue;
  queue = [];
  const urls = [...new Set(batch.map((q) => q.url))];

  (async () => {
    let map;
    try {
      const { ok, body } = await getJson(`/book/products?redirectUrls=${encodeURIComponent(urls.join(","))}`);
      if (!ok || !body?.success || !body?.data) throw new Error("batch failed");
      map = body.data;
    } catch {
      // old servers / transient failure: fall back to one request per book
      map = {};
      await Promise.all(urls.map(async (u) => { try { map[u] = await fetchOne(u); } catch { map[u] = null; } }));
    }
    const now = Date.now();
    urls.forEach((u) => { if (map[u]) products.set(u, { product: map[u], at: now }); });
    batch.forEach((q) => (map[q.url] ? q.resolve(map[q.url]) : q.reject(new Error(MESSAGE))));
  })();
}

/* the product if it is already in memory (fresh), else null: lets a page paint with no loading state */
export function peekProduct(url) {
  const hit = products.get(url);
  return hit && Date.now() - hit.at < PRODUCT_TTL ? hit.product : null;
}

/* load one product; calls made in the same tick share a single network request */
export function loadProduct(url, { force = false } = {}) {
  if (!force) {
    const cached = peekProduct(url);
    if (cached) return Promise.resolve(cached);
    if (inflight.has(url)) return inflight.get(url);
  } else {
    products.delete(url);
  }
  const promise = new Promise((resolve, reject) => {
    if (!queue.length) setTimeout(flush, 0);
    queue.push({ url, resolve, reject });
  }).finally(() => inflight.delete(url));
  inflight.set(url, promise);
  return promise;
}

/* build-time prerender (scripts/prerender.mjs) seeds the cache with live products so the static HTML that
   crawlers read carries real titles, prices and covers instead of loading placeholders */
export function primeProducts(map = {}) {
  const now = Date.now();
  Object.entries(map).forEach(([url, product]) => { if (product) products.set(url, { product, at: now }); });
}

/* warm the cache (e.g. on link hover) without caring about the result */
export const prefetchProducts = (urls) => { urls.forEach((u) => loadProduct(u).catch(() => {})); };

/* ---------------------------------------------------------------- /books page: list + offers + packs in one call */
let catalog = null; // { data, at }
let catalogInflight = null;

export function loadCatalog({ force = false } = {}) {
  if (!force && catalog && Date.now() - catalog.at < CATALOG_TTL) return Promise.resolve(catalog.data);
  if (!force && catalogInflight) return catalogInflight;
  catalogInflight = (async () => {
    try {
      const { ok, body } = await getJson("/book/catalog");
      if (!ok || body?.success !== true) throw new Error(body?.error?.message || body?.message || "Unable to load resources.");
      const data = {
        books: Array.isArray(body.data) ? body.data : [],
        offers: Array.isArray(body.offers) ? body.offers : [],
        plans: body.plans && typeof body.plans === "object" ? body.plans : null, // same shape as /api/membership/plans -> data
      };
      catalog = { data, at: Date.now() };
      return data;
    } finally {
      catalogInflight = null;
    }
  })();
  return catalogInflight;
}

/* build-time prerender only: same shape loadCatalog() resolves to */
export const primeCatalog = (data) => { if (data) catalog = { data, at: Date.now() }; };

export const peekCatalog = () => (catalog && Date.now() - catalog.at < CATALOG_TTL ? catalog.data : null);
