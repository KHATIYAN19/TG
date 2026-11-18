import API_BASE_URL from "../utils/Url";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CaretLeft, CaretRight, Check, Lightning, LockKey, ShieldCheck, Sparkle } from "@phosphor-icons/react";
import { pdfjs } from "react-pdf";

import { trackViewContent } from "../lib/metaPixel.js";

import "./BookPage.css";

/*
  BOOK PAGE KIT: the pieces shared by the System Design book pages (HLD, LLD).
  Same look everywhere (Resume Lab palette, light first, dark with the site's switch), same buying flow, same preview reader.
  Every class starts with "hb-" and lives in BookPage.css.
*/

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export const SITE_URL = "https://www.targettrek.in";
export const SITE_NAME = "Target Trek";
export const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
export const FONT_HREF = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Geist+Mono:wght@500;600&family=Manrope:wght@400;500;600;700;800&display=swap";
const THEME_STORAGE_KEY = "theme";

export const cx = (...c) => c.filter(Boolean).join(" ");
export const coverOf = (p) => p?.coverpageurl || p?.coverPageUrl || p?.cover_page_url || "";

export const formatMoney = (amount, code = "INR") => {
  const v = Number(amount || 0);
  const locale = { INR: "en-IN", USD: "en-US", GBP: "en-GB", EUR: "en-IE", AUD: "en-AU", CAD: "en-CA" }[code] || "en";
  try { return new Intl.NumberFormat(locale, { style: "currency", currency: code, minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 }).format(v); } catch { return `${code} ${v}`; }
};

/* price facts for one product: what to show and whether it can be bought */
export const priceOf = (p, loading = false) => {
  const price = Number(p?.price);
  const valid = p?.price != null && p.price !== "" && Number.isFinite(price) && price >= 0;
  const mrp = Number(p?.mrp ?? 0);
  const currency = p?.currency || "INR";
  return {
    loading, valid, price: valid ? price : 0, mrp, currency,
    hasMrp: valid && mrp > price,
    discount: valid && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0,
    canBuy: !loading && valid && Boolean(p?._id) && p?.isActive !== false && p?.active !== false && p?.isDeleted !== true,
    label: loading ? "…" : valid ? formatMoney(price, currency) : "Unavailable",
  };
};

/* ------------------------------------------------------------------ theme: follow the site's switch (localStorage + html class + events) */
const normalizeTheme = (v) => { const t = String(v || "").trim().toLowerCase(); return t === "dark" || t === "light" ? t : null; };
const themeFromStorage = () => { try { return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY)); } catch { return null; } };
const themeFromDom = () => {
  const h = document.documentElement; const b = document.body;
  const explicit = normalizeTheme(h?.getAttribute("data-theme")) || normalizeTheme(b?.getAttribute("data-theme"));
  if (explicit) return explicit;
  if (h?.classList.contains("dark") || b?.classList.contains("dark")) return "dark";
  if (h?.classList.contains("light") || b?.classList.contains("light")) return "light";
  return null;
};
const systemTheme = () => (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light");

export function useSiteTheme() {
  const [theme, setTheme] = useState(() => (typeof window === "undefined" ? "light" : themeFromStorage() || themeFromDom() || systemTheme()));
  useEffect(() => {
    let lastStore = themeFromStorage();
    let lastDom = themeFromDom();
    const sync = () => {
      const s = themeFromStorage(); const d = themeFromDom();
      let next;
      if (s && s !== lastStore) next = s; // a same-tab localStorage write fires no event, so we also poll
      else if (d && d !== lastDom) next = d;
      else next = s || d || systemTheme();
      lastStore = s; lastDom = d;
      setTheme((cur) => (cur === next ? cur : next));
    };
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    if (document.body) mo.observe(document.body, { attributes: true, attributeFilter: ["class", "data-theme"] });
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const id = window.setInterval(sync, 1000);
    window.addEventListener("storage", sync);
    window.addEventListener("themechange", sync);
    window.addEventListener("targettrek-theme-change", sync);
    window.addEventListener("focus", sync);
    media?.addEventListener?.("change", sync);
    sync();
    return () => {
      mo.disconnect(); window.clearInterval(id);
      window.removeEventListener("storage", sync); window.removeEventListener("themechange", sync);
      window.removeEventListener("targettrek-theme-change", sync); window.removeEventListener("focus", sync);
      media?.removeEventListener?.("change", sync);
    };
  }, []);
  return theme;
}

/* ------------------------------------------------------------------ a product from the server */
export function useProduct(redirectUrl) {
  const [state, setState] = useState({ product: null, loading: true, error: "" });
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/book/product?redirectUrl=${encodeURIComponent(redirectUrl)}`, { cache: "no-store", headers: { Accept: "application/json" }, signal: controller.signal });
        const result = await res.json().catch(() => null);
        if (!res.ok || !result?.success || !result?.data) throw new Error(result?.error?.message || "Book details are unavailable.");
        setState({ product: result.data, loading: false, error: "" });
      } catch (e) {
        if (e?.name === "AbortError") return;
        setState({ product: null, loading: false, error: e?.message || "Book details are unavailable." });
      }
    })();
    return () => controller.abort();
  }, [redirectUrl]);
  return state;
}

/* remember a referral code from the link (?ref= or ?referralCode=) */
export function useReferral() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = (params.get("referralCode") || params.get("ref") || "").trim();
    if (ref) { try { localStorage.setItem("referralCode", ref); } catch { /* ignore */ } }
  }, []);
}

/* true while the element is on screen (used to hide the buy bar while the hero's own button is visible) */
export function useOnScreen(ref, initial = true) {
  const [on, setOn] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return on;
}

/* becomes true once the element is near the screen, then stays true */
export function useNear(ref, margin = "600px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined") { setNear(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: `${margin} 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin]);
  return [near, setNear];
}

/* analytics: one Meta Pixel view per loaded product and price */
export function useTrackView(product, fallbackTitle) {
  const tracked = useRef(null);
  useEffect(() => {
    if (!product?._id || product.price == null) return;
    const amount = Number(product.price);
    if (!Number.isFinite(amount) || amount < 0) return;
    const key = `${product._id}:${amount}:${product.currency || "INR"}`;
    if (tracked.current === key) return;
    const sent = trackViewContent({ id: String(product._id), title: product.title || fallbackTitle, price: amount, currency: product.currency || "INR" });
    if (sent !== false) tracked.current = key;
  }, [product?._id, product?.title, product?.price, product?.currency, fallbackTitle]); // eslint-disable-line react-hooks/exhaustive-deps
}

export const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

/* ------------------------------------------------------------------ preview: PDF pages drawn to images, only once someone gets near them */
function usePreviewPages(file, start) {
  const [pages, setPages] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!start || !file) return undefined;
    let cancelled = false; let task = null; const urls = [];
    const toBlob = (canvas) => new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92));
    (async () => {
      try {
        setLoading(true); setError("");
        task = pdfjs.getDocument(file);
        const pdf = await task.promise;
        if (cancelled) return;
        setTotal(pdf.numPages);
        for (let n = 1; n <= pdf.numPages; n += 1) {
          if (cancelled) return;
          const page = await pdf.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const target = Math.min(1400, Math.max(900, window.innerWidth * 1.2));
          const viewport = page.getViewport({ scale: Math.max(1.2, target / base.width) });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d", { alpha: false });
          if (!ctx) throw new Error("This browser can't draw the preview.");
          canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
          ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
          await page.render({ canvasContext: ctx, viewport, background: "white" }).promise;
          const blob = await toBlob(canvas);
          if (!blob) throw new Error(`Couldn't draw preview page ${n}.`);
          const src = URL.createObjectURL(blob); urls.push(src);
          if (!cancelled) setPages((cur) => [...cur, { n, src, w: canvas.width, h: canvas.height }]);
          page.cleanup?.(); canvas.width = 1; canvas.height = 1;
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "The preview couldn't load.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; try { task?.destroy?.(); } catch { /* no-op */ } urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, [file, start]);
  return { pages, total, loading, error };
}

export function PreviewReader({ file, bookTitle, start, onBuy, canBuy, priceLabel, fullBookLine }) {
  const { pages, total, loading, error } = usePreviewPages(file, start);
  const [i, setI] = useState(0);
  const thumbs = useRef(null);
  const count = total || pages.length;
  const cur = pages[i];
  const go = useCallback((n) => setI((x) => Math.max(0, Math.min(Math.max(pages.length - 1, 0), typeof n === "function" ? n(x) : n))), [pages.length]);
  useEffect(() => { thumbs.current?.querySelector(`[data-n="${i}"]`)?.scrollIntoView?.({ block: "nearest", inline: "center", behavior: "smooth" }); }, [i]);
  const onKey = (e) => { if (e.key === "ArrowRight") { e.preventDefault(); go((x) => x + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); go((x) => x - 1); } };
  const last = count > 0 && i === count - 1;

  return (
    <div className="hb-reader" role="region" aria-roledescription="page viewer" aria-label={`${bookTitle} preview`} tabIndex={0} onKeyDown={onKey}>
      <div className="hb-reader-bar">
        <span className="hb-reader-k"><BookOpen size={16} weight="duotone" aria-hidden />Sample pages</span>
        <span className="hb-mono" aria-live="polite">{count ? `Page ${i + 1} of ${count}` : loading ? "Loading pages…" : ""}</span>
      </div>
      <div className="hb-reader-stage">
        <button type="button" className="hb-reader-nav prev" onClick={() => go((x) => x - 1)} disabled={i === 0} aria-label="Previous page"><CaretLeft size={20} weight="bold" aria-hidden /></button>
        <div className="hb-reader-page">
          {cur ? <img src={cur.src} width={cur.w} height={cur.h} alt={`${bookTitle}, sample page ${cur.n}`} decoding="async" />
            : error ? <div className="hb-reader-msg" role="alert"><b>The preview couldn't load.</b><span>{error} Refresh the page to try again.</span></div>
            : <div className="hb-reader-msg"><span className="hb-spin" aria-hidden /><span>{start ? "Preparing sample pages…" : "Sample pages load as you scroll here."}</span></div>}
        </div>
        <button type="button" className="hb-reader-nav next" onClick={() => go((x) => x + 1)} disabled={!count || last || i >= pages.length - 1} aria-label="Next page"><CaretRight size={20} weight="bold" aria-hidden /></button>
      </div>
      {pages.length > 1 && (
        <div className="hb-thumbs" ref={thumbs} aria-label="Jump to page">
          {pages.map((p, n) => (
            <button key={p.n} type="button" data-n={n} className={cx("hb-thumb", n === i && "is-on")} onClick={() => go(n)} aria-label={`Page ${p.n}`} aria-current={n === i ? "true" : undefined}>
              <img src={p.src} alt="" loading="lazy" decoding="async" />
              <span className="hb-mono">{p.n}</span>
            </button>
          ))}
        </div>
      )}
      {last && (
        <div className="hb-reader-end">
          <p><b>That's the sample.</b> {fullBookLine}</p>
          <button type="button" className="hb-btn hb-btn-primary" onClick={onBuy} disabled={!canBuy}>Get the full ebook · {priceLabel}<ArrowRight size={17} weight="bold" aria-hidden /></button>
        </div>
      )}
    </div>
  );
}

/* the preview section: copy on the left, the reader on the right */
export function PreviewSection({ sectionRef, file, bookTitle, start, onBuy, canBuy, priceLabel, fullBookLine, points }) {
  return (
    <section id="preview" ref={sectionRef} className="hb-sec hb-tint" aria-labelledby="preview-h">
      <div className="hb-shell hb-preview-grid">
        <header className="hb-sec-head">
          <span className="hb-eyebrow">Free preview</span>
          <h2 id="preview-h" className="hb-h2">Read real pages before you pay</h2>
          <p className="hb-lead">Actual pages from the book. Use the arrows, the page strip, or your keyboard's arrow keys.</p>
          <ul className="hb-checks">{points.map((p) => <li key={p}><Check size={15} weight="bold" aria-hidden />{p}</li>)}</ul>
        </header>
        <PreviewReader file={file} bookTitle={bookTitle} start={start} onBuy={onBuy} canBuy={canBuy} priceLabel={priceLabel} fullBookLine={fullBookLine} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ layout pieces */
export function Section({ id, eyebrow, title, lead, tint = false, children }) {
  return (
    <section id={id} className={cx("hb-sec", tint && "hb-tint")} aria-labelledby={`${id}-h`}>
      <div className="hb-shell">
        <header className="hb-sec-head">
          {eyebrow && <span className="hb-eyebrow">{eyebrow}</span>}
          <h2 id={`${id}-h`} className="hb-h2">{title}</h2>
          {lead && <p className="hb-lead">{lead}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

export function Price({ info, big = true }) {
  return (
    <div className={cx("hb-price", !big && "hb-price-sm")}>
      {info.loading ? <span className="hb-skel" role="status" aria-label="Loading price" />
        : info.valid ? <b className="hb-mono">{info.label}</b>
        : <span className="hb-unavail">Price unavailable. Refresh to try again.</span>}
      {info.hasMrp && <s className="hb-mono">{formatMoney(info.mrp, info.currency)}</s>}
      {info.discount > 0 && <span className="hb-off">{info.discount}% off</span>}
    </div>
  );
}

function Cover({ src, title, fallback }) {
  return (
    <div className="hb-cover">
      {src ? <img src={src} alt={`${title} ebook cover`} width={600} height={800} />
        : (
          <div className="hb-cover-fake" role="img" aria-label={`${title} ebook cover`}>
            <span className="hb-mono">TARGET TREK</span>
            <b>{fallback.title || "Mastering System Design"}</b>
            <i>{fallback.subtitle}</i>
            <small>{fallback.line}</small>
          </div>
        )}
      <span className="hb-cover-tag">PDF ebook</span>
    </div>
  );
}

/* the hero: what it is, the numbers, the price and the two actions */
export function BookHero({ heroRef, crumb, pill, title, lead, stats, info, onBuy, onPreview, providerName, cover, coverTitle, coverFallback, nav, previewLabel = "Read free sample" }) {
  return (
    <header ref={heroRef} className="hb-hero">
      <div className="hb-shell">
        <nav aria-label="Breadcrumb" className="hb-crumbs">
          <a href="/">Home</a><span aria-hidden>/</span><a href="/books">Books</a><span aria-hidden>/</span><span aria-current="page">{crumb}</span>
        </nav>
        <div className="hb-hero-grid">
          <div className="hb-hero-copy">
            <span className="hb-pill">{pill}</span>
            <h1 className="hb-h1">{title}</h1>
            <p className="hb-lead">{lead}</p>
            <dl className="hb-stats">{stats.map(([n, l]) => <div key={l}><dt className="hb-mono">{n}</dt><dd>{l}</dd></div>)}</dl>
            <div className="hb-buy">
              <Price info={info} />
              <div className="hb-row">
                <button type="button" className="hb-btn hb-btn-primary hb-btn-lg" onClick={onBuy} disabled={!info.canBuy}>Get the ebook<ArrowRight size={18} weight="bold" aria-hidden /></button>
                <button type="button" className="hb-btn hb-btn-ghost hb-btn-lg" onClick={onPreview}><BookOpen size={18} weight="bold" aria-hidden />{previewLabel}</button>
              </div>
              <ul className="hb-trust">
                <li><LockKey size={14} weight="bold" aria-hidden />Secure checkout via {providerName}</li>
                <li><Lightning size={14} weight="bold" aria-hidden />Digital PDF ebook</li>
                <li><ShieldCheck size={14} weight="bold" aria-hidden />Read on phone, tablet or laptop</li>
              </ul>
            </div>
          </div>
          <div className="hb-hero-art"><Cover src={cover} title={coverTitle} fallback={coverFallback} /></div>
        </div>
      </div>
      <nav className="hb-shell hb-jump" aria-label="On this page">
        {nav.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>
    </header>
  );
}

/* the three books side by side (this one marked), then an optional comparison table */
export function BookOffers({ offers, onBuy, onPreview, compare, title, lead, sampleLabel = "Free sample" }) {
  return (
    <Section id="bundle" eyebrow="Choose your book" title={title} lead={lead}>
      {offers.length > 0 && (
        <div className={cx("hb-offers", offers.length === 3 && "is-3")}>
          {offers.map((o) => {
            const info = priceOf(o.p);
            const img = coverOf(o.p);
            return (
              <article key={o.key} className={cx("hb-offer", o.best && "is-best", o.current && "is-current")}>
                {o.best && <span className="hb-offer-badge"><Sparkle size={13} weight="fill" aria-hidden />Best value</span>}
                {o.current && <span className="hb-offer-badge is-current">This page</span>}
                <div className="hb-offer-top">
                  {img ? <img src={img} alt="" width={72} height={96} loading="lazy" /> : <span className="hb-offer-ph" aria-hidden><BookOpen size={26} weight="duotone" /></span>}
                  <div><span className="hb-eyebrow">{o.eyebrow}</span><h3>{o.title}</h3></div>
                </div>
                <p className="hb-muted">{o.copy}</p>
                <ul className="hb-checks">{o.points.map((x) => <li key={x}><Check size={15} weight="bold" aria-hidden />{x}</li>)}</ul>
                <div className="hb-offer-foot">
                  <Price info={info} big={false} />
                  <div className="hb-row">
                    <button type="button" className={cx("hb-btn", o.best ? "hb-btn-primary" : "hb-btn-ghost")} onClick={() => onBuy(o.p)} disabled={!info.canBuy}>{o.cta}<ArrowRight size={16} weight="bold" aria-hidden /></button>
                    {o.current ? <button type="button" className="hb-textlink hb-linkbtn" onClick={onPreview}>{sampleLabel}</button> : <a href={o.href} className="hb-textlink">Details</a>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {compare && (
        <div className="hb-cmp hb-cmp-after" role="region" aria-label="HLD compared with LLD" tabIndex={0}>
          <table>
            <thead><tr><th scope="col"><span className="hb-sr">Topic</span></th>{compare.head.map((h, n) => <th key={h} scope="col" className={n === compare.mine ? "is-mine" : ""}>{h}</th>)}</tr></thead>
            <tbody>{compare.rows.map(([k, ...cells]) => <tr key={k}><th scope="row">{k}</th>{cells.map((c) => <td key={c}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

export function FaqSection({ items }) {
  return (
    <section id="faq" className="hb-sec hb-tint" aria-labelledby="faq-h">
      <div className="hb-shell hb-faq-grid">
        <header className="hb-sec-head hb-faq-side">
          <span className="hb-eyebrow">Questions</span>
          <h2 id="faq-h" className="hb-h2">Before you buy</h2>
          <p className="hb-lead">Anything else? Write to <b className="hb-select">{SUPPORT_EMAIL}</b></p>
        </header>
        <div className="hb-faqs">
          {items.map((f, n) => (
            <details key={f.q} className="hb-faq" open={n === 0}>
              <summary><h3>{f.q}</h3></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalSection({ title, line, info, onBuy, onPreview, children, previewLabel = "Read free sample" }) {
  return (
    <section className="hb-sec" aria-labelledby="final-h">
      <div className="hb-shell">
        <div className="hb-final">
          <h2 id="final-h" className="hb-h2">{title}</h2>
          <p>{line}</p>
          <div className="hb-final-price"><Price info={info} /></div>
          <div className="hb-row hb-row-center">
            <button type="button" className="hb-btn hb-btn-primary hb-btn-lg" onClick={onBuy} disabled={!info.canBuy}>Get the ebook<ArrowRight size={18} weight="bold" aria-hidden /></button>
            <button type="button" className="hb-btn hb-btn-onpanel hb-btn-lg" onClick={onPreview}><BookOpen size={18} weight="bold" aria-hidden />{previewLabel}</button>
          </div>
        </div>
        {children && <div className="hb-promo">{children}</div>}
      </div>
    </section>
  );
}

export function BookFooter({ line, links }) {
  return (
    <footer className="hb-foot">
      <p>{line}</p>
      <p>Support: <b className="hb-select">{SUPPORT_EMAIL}</b></p>
      <p className="hb-foot-links">{links.map(([href, label]) => <a key={href} href={href}>{label}</a>)}<a href="/books"><ArrowLeft size={13} weight="bold" aria-hidden />All books</a></p>
    </footer>
  );
}

/* phones: always docked; tablets and up: once the hero's own button has scrolled away */
export function BuyBar({ name, info, onBuy, onPreview, hidden, heroVisible, previewLabel = "Sample" }) {
  return (
    <div className={cx("hb-bar", hidden && "is-off", heroVisible && "is-hero")} role="region" aria-label="Buy the ebook">
      <div className="hb-bar-in">
        <div className="hb-bar-txt">
          <span>{name}</span>
          <div><b className="hb-mono">{info.label}</b>{info.hasMrp && <s className="hb-mono">{formatMoney(info.mrp, info.currency)}</s>}{info.discount > 0 && <em>{info.discount}% off</em>}</div>
        </div>
        <div className="hb-bar-btns">
          <button type="button" className="hb-btn hb-btn-ghost hb-bar-sample" onClick={onPreview}><BookOpen size={16} weight="bold" aria-hidden />{previewLabel}</button>
          <button type="button" className="hb-btn hb-btn-primary" onClick={onBuy} disabled={!info.canBuy}>Get the ebook<ArrowRight size={16} weight="bold" aria-hidden /></button>
        </div>
      </div>
    </div>
  );
}
