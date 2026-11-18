/*
  Warm a page's JS + CSS chunks before the click.

  scripts/prerender.mjs writes /route-assets.json (route -> chunk URLs). On hover, touch or
  keyboard focus of an internal link we add modulepreload / preload tags for that route, so by
  the time the click lands the chunk is already in the browser cache and the page opens at once.
  Silently does nothing when the map is missing (dev server, old deploy).
*/

let assetsPromise = null;
const done = new Set();

const loadAssets = () => {
  if (!assetsPromise) {
    assetsPromise = fetch("/route-assets.json", { headers: { Accept: "application/json" } })
      .then((r) => (r.ok && /json/.test(r.headers.get("content-type") || "") ? r.json() : {}))
      .catch(() => ({}));
  }
  return assetsPromise;
};

const addLink = (attrs) => {
  const link = document.createElement("link");
  Object.entries(attrs).forEach(([k, v]) => link.setAttribute(k, v));
  document.head.appendChild(link);
};

export const internalPath = (anchor) => {
  if (!anchor || !anchor.href) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;
  let url;
  try { url = new URL(anchor.href, window.location.href); } catch { return null; }
  if (url.origin !== window.location.origin) return null;
  return url.pathname.replace(/\/+$/, "") || "/";
};

export async function prefetchRoute(pathname) {
  if (!pathname || done.has(pathname)) return;
  done.add(pathname);
  const entry = (await loadAssets())[pathname];
  if (!entry) return;
  entry.js.forEach((href) => addLink({ rel: "modulepreload", crossorigin: "", href }));
  entry.css.forEach((href) => addLink({ rel: "preload", as: "style", crossorigin: "", href }));
}

export function installRoutePrefetch() {
  if (typeof document === "undefined") return;
  // slow / data-saver connections: don't spend their bandwidth on guesses
  const conn = navigator.connection;
  if (conn?.saveData) return;

  const onIntent = (event) => {
    const path = internalPath(event.target?.closest?.("a[href]"));
    if (path && path !== window.location.pathname.replace(/\/+$/, "")) prefetchRoute(path);
  };
  const opts = { capture: true, passive: true };
  document.addEventListener("mouseover", onIntent, opts);
  document.addEventListener("touchstart", onIntent, opts);
  document.addEventListener("focusin", onIntent, opts);
}
