/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import { AnimatePresence, motion, MotionConfig, useScroll, useSpring } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Eye,
  EyeOff,
  Facebook,
  Library,
  Link2,
  Linkedin,
  ListTree,
  MessageCircle,
  RefreshCw,
  Settings2,
  Share2,
  Sparkles,
  Star,
  Trash2,
  Twitter,
} from "lucide-react";

import {
  API,
  BLOG_URL,
  FONT_URL,
  LOGO_URL,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  errText,
  extractFaqs,
  fmtDate,
  fmtViews,
  getVisitorId,
  initials,
  isoDate,
  postUrl,
  stripHtml,
  titleCase,
  truncate,
  useSiteTheme,
  wordCount,
} from "../blog/blogUtils.js";
import { Media, PostCard } from "../blog/BlogCards.jsx";
import "../blog/blog.css";

/* =====================================================
   ARTICLE (/blog/:slug)
   The body HTML is sanitised by the backend before it is stored and
   comes back with ids on every h2/h3 plus a `toc` array. Here it is
   only decorated: copy buttons on code, scrollable tables, anchor
   links on headings, lazy images and safe external links.
===================================================== */

const EASE = [0.22, 1, 0.36, 1];

/* Decorate the article HTML once per post (browser only). */
function enhanceHtml(html = "") {
  if (typeof window === "undefined" || typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(`<div id="root">${html}</div>`, "text/html");
  const root = doc.getElementById("root");
  if (!root) return html;

  root.querySelectorAll("h2[id], h3[id]").forEach((h) => {
    const a = doc.createElement("a");
    a.className = "bl-anchor";
    a.href = `#${h.id}`;
    a.setAttribute("aria-label", `Link to section: ${h.textContent.trim()}`);
    a.textContent = "#";
    h.appendChild(a);
  });

  root.querySelectorAll("pre").forEach((pre) => {
    if (pre.parentElement?.classList.contains("bl-code")) return;
    const code = pre.querySelector("code");
    const cls = `${pre.className} ${code?.className || ""}`;
    const lang = (/(?:language|lang)-([\w+#-]+)/i.exec(cls)?.[1] || "").replace(/^js$/i, "javascript");
    const wrap = doc.createElement("div");
    wrap.className = "bl-code";
    wrap.innerHTML = `<div class="bl-code-bar"><span>${lang ? lang.toLowerCase() : "code"}</span><button type="button" class="bl-code-copy" data-copy>Copy</button></div>`;
    pre.replaceWith(wrap);
    wrap.appendChild(pre);
    pre.setAttribute("tabindex", "0");
  });

  root.querySelectorAll("table").forEach((t) => {
    if (t.parentElement?.classList.contains("bl-table")) return;
    const wrap = doc.createElement("div");
    wrap.className = "bl-table";
    wrap.setAttribute("role", "region");
    wrap.setAttribute("tabindex", "0");
    wrap.setAttribute("aria-label", "Scrollable table");
    t.replaceWith(wrap);
    wrap.appendChild(t);
  });

  root.querySelectorAll("img").forEach((img) => {
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
    if (!img.getAttribute("alt")) img.setAttribute("alt", "");
  });

  root.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (/^https?:\/\//i.test(href) && !href.startsWith(SITE_URL)) {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    }
  });

  return root.innerHTML;
}

/* ---------- share ---------- */
function ShareButtons({ url, title, onCopy, compact = false }) {
  const enc = encodeURIComponent;
  const links = [
    { icon: Twitter, label: "Share on X", href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}` },
    { icon: Linkedin, label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { icon: MessageCircle, label: "Share on WhatsApp", href: `https://wa.me/?text=${enc(`${title} ${url}`)}` },
    ...(compact ? [] : [{ icon: Facebook, label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` }]),
  ];
  const canNative = typeof navigator !== "undefined" && typeof navigator.share === "function";
  return (
    <div className="bl-share">
      {links.map(({ icon: Icon, label, href }) => (
        <a key={label} className="bl-icon-btn" href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
          <Icon size={17} />
        </a>
      ))}
      <button type="button" className="bl-icon-btn" onClick={onCopy} aria-label="Copy link" title="Copy link">
        <Link2 size={17} />
      </button>
      {canNative && (
        <button
          type="button"
          className="bl-icon-btn"
          aria-label="More sharing options"
          title="Share"
          onClick={() => navigator.share({ title, url }).catch(() => {})}
        >
          <Share2 size={17} />
        </button>
      )}
    </div>
  );
}

/* ---------- table of contents with scroll spy ---------- */
function useActiveHeading(ids) {
  const [active, setActive] = useState(ids[0] || "");
  useEffect(() => {
    if (!ids.length || typeof IntersectionObserver === "undefined") return undefined;
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const visible = new Map();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
        const firstVisible = ids.find((id) => visible.get(id));
        if (firstVisible) {
          setActive(firstVisible);
          return;
        }
        // Nothing in the band: keep the last heading above the viewport.
        const above = els.filter((el) => el.getBoundingClientRect().top < 120);
        if (above.length) setActive(above[above.length - 1].id);
      },
      { rootMargin: "-90px 0px -65% 0px", threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

function Toc({ toc, active, onJump }) {
  return (
    <nav className="bl-toc" aria-label="Table of contents">
      <h2>On this page</h2>
      <ol>
        {toc.map((t) => (
          <li key={t.id}>
            <a
              href={`#${t.id}`}
              className={`${t.level === 3 ? "is-sub" : ""} ${active === t.id ? "is-active" : ""}`}
              aria-current={active === t.id ? "location" : undefined}
              onClick={(e) => onJump(e, t.id)}
            >
              {t.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ---------- states ---------- */
function ArticleSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="bl-shell bl-article-head">
        <div className="bl-head-in" style={{ display: "grid", gap: 14 }}>
          <span className="bl-skel" style={{ width: 160, height: 14 }} />
          <span className="bl-skel" style={{ width: 100, height: 26, borderRadius: 99 }} />
          <span className="bl-skel" style={{ height: 44 }} />
          <span className="bl-skel" style={{ width: "70%", height: 44 }} />
          <span className="bl-skel" style={{ height: 18 }} />
          <span className="bl-skel" style={{ width: "60%", height: 18 }} />
        </div>
      </div>
      <div className="bl-shell">
        <div className="bl-cover"><span className="bl-skel" style={{ aspectRatio: "16 / 9", borderRadius: 24 }} /></div>
        <div className="bl-main" style={{ display: "grid", gap: 12, padding: "32px 0" }}>
          {Array.from({ length: 8 }, (_, i) => <span key={i} className="bl-skel" style={{ height: 16, width: `${90 - (i % 3) * 12}%` }} />)}
        </div>
      </div>
    </div>
  );
}

function StatePage({ code, title, text, onRetry }) {
  return (
    <div className="bl-state">
      <div className="bl-state-in">
        <span className="bl-state-code">{code}</span>
        <h1>{title}</h1>
        <p>{text}</p>
        <div className="bl-state-actions">
          {onRetry && <button type="button" className="bl-btn bl-btn-primary" onClick={onRetry}><RefreshCw size={16} /> Try again</button>}
          <Link to="/blogs" className={`bl-btn ${onRetry ? "bl-btn-ghost" : "bl-btn-primary"}`}><ArrowLeft size={16} /> All articles</Link>
        </div>
      </div>
    </div>
  );
}

/* ===================================================== */

export default function BlogPostDetail() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const theme = useSiteTheme();
  const { user, token, isAuthenticated } = useSelector((s) => s?.auth || {});
  const isAdmin = Boolean(isAuthenticated && user?.role === "admin");

  const [state, setState] = useState({ post: null, loading: true, error: "", notFound: false });
  const [reload, setReload] = useState(0);
  const [related, setRelated] = useState([]);
  const [views, setViews] = useState(0);
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState("");
  const proseRef = useRef(null);
  const articleRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: articleRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });

  const flash = useCallback((msg) => {
    setToast(msg);
    window.clearTimeout(flash.t);
    flash.t = window.setTimeout(() => setToast(""), 2200);
  }, []);

  /* ---------- load the post ---------- */
  useEffect(() => {
    const ctrl = new AbortController();
    setState({ post: null, loading: true, error: "", notFound: false });
    setRelated([]);
    axios
      .get(`${API}/${encodeURIComponent(slug)}`, { signal: ctrl.signal, timeout: 25000 })
      .then((r) => {
        const post = r.data?.data?.post || r.data?.data;
        if (!r.data?.success || !post) throw Object.assign(new Error("Not found"), { response: { status: 404 } });
        setState({ post, loading: false, error: "", notFound: false });
        setViews(Number(post.views) || 0);
      })
      .catch((e) => {
        if (axios.isCancel(e) || ctrl.signal.aborted) return;
        const notFound = e?.response?.status === 404;
        setState({ post: null, loading: false, notFound, error: notFound ? "" : errText(e, "Could not load this article.") });
      });
    window.scrollTo({ top: 0, behavior: "instant" in document.documentElement.style ? "instant" : "auto" });
    return () => ctrl.abort();
  }, [slug, reload]);

  const post = state.post;

  /* ---------- count one view per visitor (server de-duplicates too) ---------- */
  useEffect(() => {
    if (!post?.slug) return;
    const key = `bl-viewed:${post.slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch { /* storage blocked: still count */ }
    const visitorId = getVisitorId();
    if (!visitorId) return;
    axios
      .post(`${API}/${encodeURIComponent(post.slug)}/view`, null, { headers: { "x-blog-visitor-id": visitorId } })
      .then((r) => {
        const v = Number(r.data?.data?.views ?? r.data?.views);
        if (Number.isFinite(v) && v > 0) setViews(v);
      })
      .catch(() => {});
  }, [post?.slug]);

  /* ---------- related: same topic first, then latest ---------- */
  useEffect(() => {
    if (!post?.slug) return undefined;
    const ctrl = new AbortController();
    const opts = { signal: ctrl.signal, timeout: 15000 };
    Promise.all([
      axios.get(API, { ...opts, params: { category: post.category, limit: 6, sort: "latest" } }).catch(() => null),
      axios.get(API, { ...opts, params: { limit: 6, sort: "trending" } }).catch(() => null),
    ]).then(([same, popular]) => {
      if (ctrl.signal.aborted) return;
      const seen = new Set([post.slug]);
      const out = [];
      [...(same?.data?.data || []), ...(popular?.data?.data || [])].forEach((p) => {
        if (p?.slug && !seen.has(p.slug) && out.length < 4) {
          seen.add(p.slug);
          out.push(p);
        }
      });
      setRelated(out);
    });
    return () => ctrl.abort();
  }, [post?.slug, post?.category]);

  /* ---------- derived ---------- */
  const html = useMemo(() => enhanceHtml(post?.content || ""), [post?.content]);
  const toc = useMemo(() => (Array.isArray(post?.toc) ? post.toc.filter((t) => t?.id && t?.text) : []), [post?.toc]);
  const tocIds = useMemo(() => toc.map((t) => t.id), [toc]);
  const active = useActiveHeading(tocIds);
  const faqs = useMemo(() => extractFaqs(post?.content || ""), [post?.content]);
  const words = useMemo(() => wordCount(post?.content || ""), [post?.content]);
  const sectionCount = toc.filter((t) => t.level === 2).length;

  /* Copy buttons inside the article (event delegation). */
  useEffect(() => {
    const root = proseRef.current;
    if (!root) return undefined;
    const onClick = async (e) => {
      const btn = e.target.closest?.("[data-copy]");
      if (!btn) return;
      const text = btn.closest(".bl-code")?.querySelector("pre")?.innerText || "";
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied";
        btn.classList.add("is-done");
      } catch {
        btn.textContent = "Press Ctrl+C";
      }
      window.setTimeout(() => {
        btn.textContent = "Copy";
        btn.classList.remove("is-done");
      }, 1800);
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [html]);

  /* Deep links (#section) once the body is in the DOM. */
  useEffect(() => {
    if (!html || !window.location.hash) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 120);
    return () => window.clearTimeout(t);
  }, [html]);

  const jump = (e, id) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
  };

  const canonical = post?.seo?.canonicalUrl || (post ? postUrl(post.slug) : `${SITE_URL}/blog/${slug}`);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(canonical);
      flash("Link copied");
    } catch {
      flash("Could not copy the link");
    }
  };

  /* ---------- admin ---------- */
  const auth = { headers: { Authorization: `Bearer ${token}` } };
  const unpublish = async () => {
    if (!post?._id || busy) return;
    setBusy("publish");
    try {
      await axios.patch(`${API}/${post._id}/toggle-publish`, null, auth);
      flash("Moved to drafts");
      navigate("/blog-manage");
    } catch (e) {
      flash(errText(e, "Could not change status"));
    } finally {
      setBusy("");
    }
  };
  const remove = async () => {
    if (!post?._id || busy) return;
    setBusy("delete");
    try {
      await axios.delete(`${API}/admin/${post._id}`, auth);
      setConfirmDelete(false);
      navigate("/blogs");
    } catch (e) {
      flash(errText(e, "Could not delete the article"));
    } finally {
      setBusy("");
    }
  };

  /* ---------- SEO ---------- */
  const seo = post?.seo || {};
  const metaTitle = seo.metaTitle ? (seo.metaTitle.includes(SITE_NAME) ? seo.metaTitle : `${seo.metaTitle} | ${SITE_NAME}`) : post ? `${post.title} | ${SITE_NAME}` : `Article | ${SITE_NAME}`;
  const metaDesc = seo.metaDescription || truncate(post?.excerpt || "", 160);
  const image = absoluteUrl(seo.ogImageUrl || post?.imageUrl || "");
  const keywords = useMemo(() => (seo.keywords?.length ? seo.keywords : post?.tags) || [], [seo.keywords, post?.tags]);
  const published = isoDate(post?.publishedAt || post?.createdAt);
  const modified = isoDate(post?.updatedAt || post?.publishedAt);
  const updatedLater = post?.updatedAt && post?.publishedAt && new Date(post.updatedAt) - new Date(post.publishedAt) > 86400000;
  const catName = titleCase(post?.category || "");

  const jsonLd = useMemo(() => {
    if (!post) return null;
    const out = [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": `${canonical}#article`,
        headline: String(post.title).slice(0, 110),
        name: post.title,
        description: metaDesc,
        abstract: stripHtml(post.excerpt || ""),
        url: canonical,
        mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
        isPartOf: { "@type": "Blog", "@id": `${BLOG_URL}#blog`, name: `${SITE_NAME} Blog`, url: BLOG_URL },
        ...(image && { image: { "@type": "ImageObject", url: image, caption: post.altText || post.title } }),
        author: { "@type": "Person", name: post.author || SITE_NAME, url: BLOG_URL },
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: LOGO_URL } },
        datePublished: published,
        dateModified: modified,
        articleSection: catName,
        keywords: keywords.join(", "),
        about: (post.tags || []).slice(0, 8).map((t) => ({ "@type": "Thing", name: titleCase(t) })),
        wordCount: words,
        timeRequired: `PT${post.readingTimeMinutes || 1}M`,
        inLanguage: "en",
        isAccessibleForFree: true,
        ...(views > 0 && { interactionStatistic: { "@type": "InteractionCounter", interactionType: "https://schema.org/ReadAction", userInteractionCount: views } }),
        ...((post.sources || []).length && { citation: post.sources.map((s) => ({ "@type": "CreativeWork", name: s.title || s.url, url: s.url })) }),
        speakable: { "@type": "SpeakableSpecification", cssSelector: [".bl-title", ".bl-summary p"] },
        ...(toc.length && { hasPart: toc.filter((t) => t.level === 2).map((t) => ({ "@type": "WebPageElement", name: t.text, url: `${canonical}#${t.id}` })) }),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: BLOG_URL },
          { "@type": "ListItem", position: 3, name: catName, item: `${BLOG_URL}?category=${encodeURIComponent(post.category)}` },
          { "@type": "ListItem", position: 4, name: post.title, item: canonical },
        ],
      },
    ];
    if (faqs.length) {
      out.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      });
    }
    return out;
  }, [post, canonical, metaDesc, image, published, modified, catName, keywords, words, views, toc, faqs]);

  /* ---------- render ---------- */
  const head = (
    <Helmet>
      <html lang="en" />
      <title>{metaTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content={!post || seo.noIndex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={FONT_URL} />
      {post && <link rel="alternate" type="application/rss+xml" title={`${SITE_NAME} Blog`} href={`${SITE_URL}/rss.xml`} />}
      {post && <meta name="author" content={post.author} />}
      {post && keywords.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}
      {post && <meta property="og:type" content="article" />}
      {post && <meta property="og:site_name" content={SITE_NAME} />}
      {post && <meta property="og:title" content={post.title} />}
      {post && <meta property="og:description" content={metaDesc} />}
      {post && <meta property="og:url" content={canonical} />}
      {post && image && <meta property="og:image" content={image} />}
      {post && image && <meta property="og:image:alt" content={post.altText || post.title} />}
      {post && published && <meta property="article:published_time" content={published} />}
      {post && modified && <meta property="article:modified_time" content={modified} />}
      {post && <meta property="article:section" content={catName} />}
      {post && (post.tags || []).map((t) => <meta key={t} property="article:tag" content={t} />)}
      {post && <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />}
      {post && <meta name="twitter:title" content={post.title} />}
      {post && <meta name="twitter:description" content={metaDesc} />}
      {post && image && <meta name="twitter:image" content={image} />}
      {post && <meta name="twitter:label1" content="Reading time" />}
      {post && <meta name="twitter:data1" content={`${post.readingTimeMinutes || 1} min read`} />}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );

  if (state.loading) {
    return (
      <main className="bl" data-theme={theme} aria-busy="true">
        {head}
        <ArticleSkeleton />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="bl" data-theme={theme}>
        {head}
        {state.notFound ? (
          <StatePage code="404" title="This article is not here" text="It may have been moved or unpublished. The rest of the blog is one click away." />
        ) : (
          <StatePage code=":(" title="We could not load this article" text={state.error} onRetry={() => setReload((n) => n + 1)} />
        )}
      </main>
    );
  }

  const shareTitle = post.title;

  return (
    <MotionConfig reducedMotion="user">
      {head}
      <motion.div className="bl-progress" style={{ scaleX: progress }} aria-hidden="true" />

      <main className="bl" data-theme={theme}>
        <article ref={articleRef} itemScope itemType="https://schema.org/BlogPosting">
          <meta itemProp="mainEntityOfPage" content={canonical} />
          {published && <meta itemProp="datePublished" content={published} />}
          {modified && <meta itemProp="dateModified" content={modified} />}

          {/* ================= HEADER ================= */}
          <header className="bl-shell bl-article-head">
            <motion.div className="bl-head-in" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
              <nav aria-label="Breadcrumb">
                <ol className="bl-crumbs">
                  <li><Link to="/">Home</Link></li>
                  <li aria-hidden="true">/</li>
                  <li><Link to="/blogs">Blog</Link></li>
                  <li aria-hidden="true">/</li>
                  <li><Link to={`/blogs?category=${encodeURIComponent(post.category)}`}>{catName}</Link></li>
                  <li aria-hidden="true" className="bl-crumb-sep">/</li>
                  <li aria-current="page">{post.title}</li>
                </ol>
              </nav>

              <div className="bl-head-tags">
                <Link to={`/blogs?category=${encodeURIComponent(post.category)}`} className="bl-chip is-on" itemProp="articleSection">{catName}</Link>
                {post.editorChoice && <span className="bl-badge"><Star size={11} fill="currentColor" /> Editor&apos;s pick</span>}
                {post.isFeatured && <span className="bl-badge"><Sparkles size={11} /> Featured</span>}
              </div>

              <h1 className="bl-title" itemProp="headline">{post.title}</h1>
              {post.excerpt && <p className="bl-dek" itemProp="description">{stripHtml(post.excerpt)}</p>}

              <div className="bl-byline">
                <div className="bl-byline-who">
                  <span className="bl-avatar is-lg" aria-hidden="true">{initials(post.author)}</span>
                  <div>
                    <b itemProp="author" itemScope itemType="https://schema.org/Person"><span itemProp="name">{post.author}</span></b>
                    <div className="bl-meta">
                      {published && <span><CalendarDays size={13} /> <time dateTime={published}>{fmtDate(post.publishedAt)}</time></span>}
                      <span><Clock3 size={13} /> {post.readingTimeMinutes || 1} min read</span>
                      {views > 0 && <span><Eye size={13} /> {fmtViews(views)} reads</span>}
                    </div>
                  </div>
                </div>
                <ShareButtons url={canonical} title={shareTitle} onCopy={copyLink} compact />
              </div>
            </motion.div>
          </header>

          {/* ================= COVER ================= */}
          {post.imageUrl && (
            <motion.figure className="bl-shell bl-cover" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}>
              <Media post={post} eager sizes="(min-width: 1100px) 1080px, 100vw" />
              <meta itemProp="image" content={absoluteUrl(post.imageUrl)} />
            </motion.figure>
          )}

          {/* ================= BODY ================= */}
          <div className="bl-shell bl-layout">
            <aside className="bl-aside" aria-label="Article navigation">
              <div className="bl-sticky">
                {toc.length > 1 && <Toc toc={toc} active={active} onJump={jump} />}
                {toc.length > 1 && <p className="bl-toc-progress">{sectionCount || toc.length} sections · {post.readingTimeMinutes || 1} min</p>}
                <Link to="/blogs" className="bl-link"><ArrowLeft size={15} /> All articles</Link>
              </div>
            </aside>

            <div className="bl-main">
              {toc.length > 1 && (
                <details className="bl-toc-mobile">
                  <summary><span className="bl-meta" style={{ color: "var(--text)", fontSize: 15 }}><ListTree size={17} /> On this page · {toc.length}</span><ChevronDown size={18} /></summary>
                  <ol>
                    {toc.map((t) => (
                      <li key={t.id}>
                        <a
                          href={`#${t.id}`}
                          className={t.level === 3 ? "is-sub" : ""}
                          onClick={(e) => {
                            e.currentTarget.closest("details")?.removeAttribute("open");
                            jump(e, t.id);
                          }}
                        >
                          {t.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </details>
              )}

              {/* Answer first: the short version for skimmers, voice assistants and AI answers */}
              {post.excerpt && (
                <section className="bl-summary" aria-labelledby="bl-sum-h">
                  <h2 id="bl-sum-h"><BookOpen size={15} /> The short answer</h2>
                  <p>{stripHtml(post.excerpt)}</p>
                  <ul>
                    <li><Clock3 size={13} /> {post.readingTimeMinutes || 1} min read</li>
                    {words > 0 && <li>{words.toLocaleString("en-IN")} words</li>}
                    {sectionCount > 0 && <li>{sectionCount} sections</li>}
                    {updatedLater && <li>Updated {fmtDate(post.updatedAt)}</li>}
                  </ul>
                </section>
              )}

              <div ref={proseRef} className="bl-prose" itemProp="articleBody" dangerouslySetInnerHTML={{ __html: html }} />

              {/* ================= AFTER THE ARTICLE ================= */}
              <div className="bl-after">
                {(post.tags || []).length > 0 && (
                  <section aria-labelledby="bl-tags-h">
                    <h2 id="bl-tags-h">Topics in this article</h2>
                    <div className="bl-tags">
                      {post.tags.map((t) => <Link key={t} to={`/blogs?tag=${encodeURIComponent(t)}`} className="bl-tag" itemProp="keywords">#{t}</Link>)}
                    </div>
                  </section>
                )}

                {(post.sources || []).length > 0 && (
                  <section className="bl-sources" aria-labelledby="bl-src-h">
                    <h2 id="bl-src-h">Sources and further reading</h2>
                    <ol>
                      {post.sources.map((s) => {
                        let host = "";
                        try { host = new URL(s.url).hostname.replace(/^www\./, ""); } catch { /* keep empty */ }
                        return (
                          <li key={s.url}>
                            <a href={s.url} target="_blank" rel="noopener noreferrer" itemProp="citation">{s.title || s.url}</a>
                            {host && <small>{host}</small>}
                          </li>
                        );
                      })}
                    </ol>
                  </section>
                )}

                <section className="bl-author" aria-label="About the author">
                  <span className="bl-avatar is-lg" aria-hidden="true">{initials(post.author)}</span>
                  <div>
                    <b>Written by {post.author}</b>
                    <p>
                      Published on {SITE_NAME}{published ? ` on ${fmtDate(post.publishedAt, { day: "numeric", month: "long", year: "numeric" })}` : ""}
                      {updatedLater ? `, last updated ${fmtDate(post.updatedAt, { day: "numeric", month: "long", year: "numeric" })}` : ""}.
                      {" "}Found a mistake? <a className="bl-link" href={`mailto:supporttargettrek@gmail.com?subject=${encodeURIComponent(`Feedback: ${post.title}`)}`}>Tell us</a>
                    </p>
                  </div>
                </section>

                <div className="bl-share-row">
                  <b>Helpful? Share it with a friend preparing too.</b>
                  <ShareButtons url={canonical} title={shareTitle} onCopy={copyLink} />
                </div>
              </div>
            </div>

            <aside className="bl-rail-right" aria-label="More from Target Trek">
              <div className="bl-sticky">
                <div className="bl-rail-card">
                  <h2>Share</h2>
                  <ShareButtons url={canonical} title={shareTitle} onCopy={copyLink} compact />
                </div>
                <div className="bl-rail-card is-panel">
                  <p className="bl-eyebrow" style={{ color: "#5eead4" }}><Library size={14} /> Interview books</p>
                  <h3 style={{ marginTop: 10 }}>Go deeper than a blog post</h3>
                  <p>Full handbooks on system design, Java and GenAI, emailed as PDFs.</p>
                  <Link to="/books" className="bl-btn bl-btn-accent bl-btn-sm">See the books <ArrowRight size={15} /></Link>
                </div>
              </div>
            </aside>
          </div>
        </article>

        {/* ================= RELATED ================= */}
        {related.length > 0 && (
          <section className="bl-sec bl-tint" aria-labelledby="bl-rel-h">
            <div className="bl-shell">
              <div className="bl-sec-head">
                <div>
                  <p className="bl-eyebrow">Keep reading</p>
                  <h2 id="bl-rel-h" className="bl-h2">More on {catName} and beyond</h2>
                </div>
                <Link to={`/blogs?category=${encodeURIComponent(post.category)}`} className="bl-link">All {catName} articles <ArrowUpRight size={16} /></Link>
              </div>
              <div className="bl-related">
                {related.map((p) => <PostCard key={p.slug} post={p} />)}
              </div>
            </div>
          </section>
        )}

        <section className="bl-sec">
          <div className="bl-shell">
            <div className="bl-cta">
              <div>
                <p className="bl-eyebrow">Next step</p>
                <h2>Turn reading into <span className="bl-cta-hl">offers.</span></h2>
                <p>Our interview handbooks cover what a blog post cannot: full system designs, Java deep dives and the questions that keep coming up.</p>
              </div>
              <div className="bl-cta-actions">
                <Link to="/books" className="bl-btn bl-btn-accent">Browse the books <ArrowRight size={16} /></Link>
                <Link to="/blogs" className="bl-btn bl-btn-onpanel">More articles</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ADMIN ================= */}
        {isAdmin && (
          <div className="bl-admin" role="region" aria-label="Admin controls">
            <span><Settings2 size={14} style={{ verticalAlign: "-2px" }} /> Admin</span>
            <Link to="/blog-manage" className="bl-btn bl-btn-onpanel">Manage</Link>
            <button type="button" className="bl-btn bl-btn-onpanel" onClick={unpublish} disabled={Boolean(busy)}>
              <EyeOff size={14} /> {busy === "publish" ? "Saving…" : "Unpublish"}
            </button>
            <button type="button" className="bl-btn bl-btn-danger" onClick={() => setConfirmDelete(true)} disabled={Boolean(busy)}>
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}

        <AnimatePresence>
          {confirmDelete && (
            <motion.div className="bl-modal-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button type="button" className="bl-modal-backdrop" aria-label="Close" onClick={() => setConfirmDelete(false)} />
              <motion.div className="bl-modal" role="alertdialog" aria-modal="true" aria-labelledby="bl-del-h" initial={{ y: 16, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 16, scale: 0.98 }}>
                <h2 id="bl-del-h">Delete this article?</h2>
                <p>“{post.title}” moves to the trash and disappears from the blog. You can restore it from Manage.</p>
                <div className="bl-modal-actions">
                  <button type="button" className="bl-btn bl-btn-ghost" onClick={() => setConfirmDelete(false)}>Cancel</button>
                  <button type="button" className="bl-btn bl-btn-danger" onClick={remove} disabled={busy === "delete"}>
                    <Trash2 size={15} /> {busy === "delete" ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div className="bl-toast" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
              <Check size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} />{toast}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}
