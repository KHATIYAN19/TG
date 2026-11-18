/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion, MotionConfig } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Clock3,
  Eye,
  Flame,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  X,
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
  fmtDate,
  fmtViews,
  initials,
  isoDate,
  postUrl,
  titleCase,
  truncate,
  useSiteTheme,
} from "../blog/blogUtils.js";
import { Media, PostCard } from "../blog/BlogCards.jsx";
import "../blog/blog.css";

/* =====================================================
   BLOG INDEX (/blogs)
   URL is the source of truth so every view is shareable and crawlable:
     /blogs?category=system-design   /blogs?tag=java
     /blogs?q=kafka                  /blogs?sort=trending
===================================================== */

const PAGE_SIZE = 12;
const EASE = [0.22, 1, 0.36, 1];
const SORTS = [
  { value: "latest", label: "Latest" },
  { value: "trending", label: "Most read" },
  { value: "oldest", label: "Oldest" },
  { value: "title", label: "A to Z" },
];

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

function CardSkeleton() {
  return (
    <div className="bl-card-skel" aria-hidden="true">
      <span className="bl-skel" style={{ aspectRatio: "16 / 9", borderRadius: 0 }} />
      <span className="bl-skel" style={{ width: "35%", height: 12 }} />
      <span className="bl-skel" style={{ height: 20 }} />
      <span className="bl-skel" style={{ width: "75%", height: 20 }} />
      <span className="bl-skel" style={{ height: 12 }} />
    </div>
  );
}

/* ===================================================== */

export default function BlogPage() {
  const theme = useSiteTheme();
  const [params, setParams] = useSearchParams();
  const searchRef = useRef(null);

  const q = params.get("q") || "";
  const category = (params.get("category") || "").toLowerCase();
  const tag = (params.get("tag") || "").toLowerCase();
  const sort = SORTS.some((s) => s.value === params.get("sort")) ? params.get("sort") : "latest";
  const filtering = Boolean(q || category || tag);

  const [draft, setDraft] = useState(q);
  const [reloadKey, setReloadKey] = useState(0);
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [list, setList] = useState({ posts: [], page: 1, total: 0, hasNext: false, loading: true, more: false, error: "" });

  /* ---------- URL helpers ---------- */
  const setParam = useCallback(
    (patch) => {
      const next = new URLSearchParams(params);
      Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      if (next.get("sort") === "latest") next.delete("sort");
      setParams(next, { replace: false });
    },
    [params, setParams]
  );

  const clearAll = () => {
    setDraft("");
    setParams(new URLSearchParams(), { replace: false });
  };

  /* Debounced search → URL */
  useEffect(() => setDraft(q), [q]);
  useEffect(() => {
    if (draft.trim() === q) return undefined;
    const t = setTimeout(() => setParam({ q: draft.trim() }), 350);
    return () => clearTimeout(t);
  }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps

  /* "/" focuses search, like most docs sites */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey) return;
      const tagName = document.activeElement?.tagName;
      if (tagName === "INPUT" || tagName === "TEXTAREA" || document.activeElement?.isContentEditable) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- categories + most read (once): 2 light requests ---------- */
  useEffect(() => {
    const ctrl = new AbortController();
    const opts = { signal: ctrl.signal, timeout: 20000 };
    axios.get(`${API}/meta/categories`, opts)
      .then((r) => setCategories((r.data?.data || []).filter(Boolean)))
      .catch(() => {});
    axios.get(API, { ...opts, params: { limit: 5, sort: "trending" } })
      .then((r) => setTrending((r.data?.data || []).filter((p) => Number(p.views) > 0)))
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  /* ---------- main list ---------- */
  const fetchPage = useCallback(
    async (page, signal) => {
      const res = await axios.get(API, {
        signal,
        timeout: 20000,
        params: { page, limit: PAGE_SIZE, sort, ...(q && { search: q }), ...(category && { category }), ...(tag && { tag }) },
      });
      if (!res.data?.success) throw new Error(res.data?.error?.message || "Could not load articles.");
      return res.data;
    },
    [q, category, tag, sort]
  );

  useEffect(() => {
    const ctrl = new AbortController();
    setList((s) => ({ ...s, loading: true, error: "" }));
    fetchPage(1, ctrl.signal)
      .then((d) => {
        if (!q && !category && !tag) setCatalogTotal(Number(d.pagination?.total) || 0);
        setList({
          posts: d.data || [],
          page: 1,
          total: Number(d.pagination?.total) || 0,
          hasNext: Boolean(d.pagination?.hasNextPage),
          loading: false,
          more: false,
          error: "",
        });
      })
      .catch((e) => {
        if (axios.isCancel(e) || ctrl.signal.aborted) return;
        setList((s) => ({ ...s, posts: [], loading: false, error: errText(e, "Could not load articles.") }));
      });
    return () => ctrl.abort();
  }, [fetchPage, reloadKey]); // eslint-disable-line react-hooks/exhaustive-deps -- fetchPage already tracks q, category and tag

  const loadMore = async () => {
    if (list.more || !list.hasNext) return;
    setList((s) => ({ ...s, more: true }));
    try {
      const d = await fetchPage(list.page + 1);
      setList((s) => {
        const seen = new Set(s.posts.map((p) => p.slug));
        return {
          ...s,
          posts: [...s.posts, ...(d.data || []).filter((p) => !seen.has(p.slug))],
          page: s.page + 1,
          hasNext: Boolean(d.pagination?.hasNextPage),
          more: false,
        };
      });
    } catch (e) {
      setList((s) => ({ ...s, more: false, error: errText(e, "Could not load more articles.") }));
    }
  };

  const retry = () => setReloadKey((n) => n + 1);

  /* ---------- derived ---------- */
  // Highlights come from the first page of the main list (no extra requests):
  // featured and editor's picks first, then the newest.
  const picks = useMemo(() => {
    if (filtering || sort !== "latest") return [];
    const rank = (p) => (p.isFeatured ? 2 : 0) + (p.editorChoice ? 1 : 0);
    return [...list.posts.slice(0, PAGE_SIZE)].sort((x, y) => rank(y) - rank(x)).slice(0, 4);
  }, [list.posts, filtering, sort]);
  const lead = picks[0];
  const side = picks.slice(1, 4);
  // With a small catalogue the grid already shows everything: skip the duplicate highlights.
  const showHighlights = !filtering && sort === "latest" && (list.loading || (picks.length >= 2 && list.total > 4));
  const highlights = { loading: list.loading, trending };
  const total = catalogTotal;
  const newest = list.posts.map((p) => p.publishedAt).filter(Boolean).sort().pop();
  const heroTopics = categories.slice(0, 6);

  /* ---------- SEO ---------- */
  const catName = category ? titleCase(category) : "";
  const title = category
    ? `${catName} Articles and Guides | ${SITE_NAME} Blog`
    : tag
      ? `#${tag} Articles | ${SITE_NAME} Blog`
      : q
        ? `Search: ${q} | ${SITE_NAME} Blog`
        : "Software Engineering, System Design and Interview Prep Blog | Target Trek";
  const description = category
    ? `Practical ${catName} articles from ${SITE_NAME}: clear explanations, real examples and interview-focused takeaways for software engineers.`
    : "Practical articles on system design, backend engineering, Java, GenAI, databases and interview preparation. Clear explanations, real examples and takeaways you can use in your next interview.";
  const canonical = category ? `${BLOG_URL}?category=${encodeURIComponent(category)}` : tag ? `${BLOG_URL}?tag=${encodeURIComponent(tag)}` : BLOG_URL;
  const noindex = Boolean(q) || sort !== "latest";

  const jsonLd = useMemo(() => {
    const items = list.posts.slice(0, 24);
    return [
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": `${BLOG_URL}#blog`,
        name: `${SITE_NAME} Blog`,
        url: BLOG_URL,
        description,
        inLanguage: "en",
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: LOGO_URL } },
        blogPost: items.map((p) => ({
          "@type": "BlogPosting",
          headline: String(p.title).slice(0, 110),
          url: postUrl(p.slug),
          datePublished: isoDate(p.publishedAt),
          dateModified: isoDate(p.updatedAt || p.publishedAt),
          author: { "@type": "Person", name: p.author },
          ...(p.imageUrl && { image: absoluteUrl(p.imageUrl) }),
          articleSection: titleCase(p.category),
          keywords: (p.tags || []).join(", "),
          description: truncate(p.excerpt, 200),
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: title,
        url: canonical,
        description,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
        ...(category && { about: { "@type": "Thing", name: catName } }),
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: items.length,
          itemListElement: items.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: postUrl(p.slug), name: p.title })),
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: BLOG_URL },
          ...(category ? [{ "@type": "ListItem", position: 3, name: catName, item: canonical }] : []),
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${BLOG_URL}?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ];
  }, [list.posts, title, description, canonical, category, catName]);

  /* ---------- render ---------- */
  return (
    <MotionConfig reducedMotion="user">
      <Helmet>
        <html lang="en" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta name="robots" content={noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1"} />
        <link rel="alternate" type="application/rss+xml" title={`${SITE_NAME} Blog`} href={`${SITE_URL}/rss.xml`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        {lead?.imageUrl && <meta property="og:image" content={absoluteUrl(lead.imageUrl)} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONT_URL} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <main className="bl" data-theme={theme}>
        {/* ================= HERO ================= */}
        <header className="bl-hero">
          <div className="bl-shell bl-hero-grid">
            <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
              <motion.p className="bl-eyebrow" variants={fade}><BookOpen size={15} /> The Target Trek Blog</motion.p>
              <h1>
                {category ? (
                  <>{catName} <span className="bl-hl">explained clearly</span></>
                ) : tag ? (
                  <>Everything on <span className="bl-hl">#{tag}</span></>
                ) : (
                  <>Engineering notes that <span className="bl-hl">get you hired</span></>
                )}
              </h1>
              <p className="bl-hero-lead">
                {category
                  ? `Every ${catName} article we have published, newest first. Clear explanations, real examples and interview takeaways.`
                  : "System design, backend, Java, GenAI and interview prep, explained the way you wish your textbook did. Short to read, easy to revise, ready for your next round."}
              </p>

              <motion.form
                variants={fade}
                role="search"
                className="bl-search"
                onSubmit={(e) => {
                  e.preventDefault();
                  setParam({ q: draft.trim() });
                }}
              >
                <Search size={20} aria-hidden="true" />
                <label htmlFor="bl-q" className="bl-sr">Search articles</label>
                <input
                  id="bl-q"
                  ref={searchRef}
                  type="search"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Search Kafka, caching, Spring Boot…"
                  autoComplete="off"
                  enterKeyHint="search"
                />
                {draft ? (
                  <button type="button" className="bl-search-clear" onClick={() => { setDraft(""); setParam({ q: "" }); }} aria-label="Clear search">
                    <X size={16} />
                  </button>
                ) : (
                  <kbd className="bl-kbd">/</kbd>
                )}
              </motion.form>
            </motion.div>

            <motion.div className="bl-hero-side" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}>
              <dl className="bl-stats">
                <div className="bl-stat">
                  <dt className="bl-sr">Articles</dt>
                  <dd><strong>{total || "—"}</strong><span>articles</span></dd>
                </div>
                <div className="bl-stat">
                  <dt className="bl-sr">Topics</dt>
                  <dd><strong>{categories.length || "—"}</strong><span>topics</span></dd>
                </div>
                <div className="bl-stat">
                  <dt className="bl-sr">Latest</dt>
                  <dd><strong>{newest ? fmtDate(newest, { day: "numeric", month: "short" }) : "—"}</strong><span>latest post</span></dd>
                </div>
              </dl>
              {heroTopics.length > 0 && !filtering && (
                <div className="bl-hero-topics">
                  <span>Popular:</span>
                  {heroTopics.map((c) => (
                    <Link key={c} className="bl-chip" to={`/blogs?category=${encodeURIComponent(c)}`}>{titleCase(c)}</Link>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </header>

        {/* ================= STICKY TOPICS BAR ================= */}
        <nav className="bl-topbar" aria-label="Blog topics">
          <div className="bl-shell bl-topbar-in">
            <div className="bl-chips">
              <Link to="/blogs" className={`bl-chip ${!category && !tag ? "is-on" : ""}`} aria-current={!category && !tag ? "page" : undefined}>All</Link>
              {categories.map((c) => (
                <Link
                  key={c}
                  to={`/blogs?category=${encodeURIComponent(c)}`}
                  className={`bl-chip ${category === c ? "is-on" : ""}`}
                  aria-current={category === c ? "page" : undefined}
                >
                  {titleCase(c)}
                </Link>
              ))}
            </div>
            <label className="bl-select">
              <span className="bl-sr">Sort articles</span>
              <select value={sort} onChange={(e) => setParam({ sort: e.target.value })}>
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <ChevronDown size={16} />
            </label>
          </div>
        </nav>

        {/* ================= FEATURED ================= */}
        {showHighlights && (
          <section className="bl-sec" aria-labelledby="bl-featured-h">
            <div className="bl-shell">
              <h2 id="bl-featured-h" className="bl-sr">Featured articles</h2>
              {highlights.loading ? (
                <div className="bl-featured" aria-hidden="true">
                  <span className="bl-skel" style={{ minHeight: 380, borderRadius: 24 }} />
                  <div className="bl-picks">
                    {[0, 1, 2].map((i) => <span key={i} className="bl-skel" style={{ height: 116, borderRadius: 18 }} />)}
                  </div>
                </div>
              ) : (
                <div className="bl-featured">
                  {lead && (
                    <motion.article className="bl-lead" initial="hidden" animate="show" variants={fade}>
                      <Link to={`/blog/${lead.slug}`} tabIndex={-1} aria-hidden="true">
                        <Media post={lead} eager sizes="(min-width: 1024px) 60vw, 100vw" />
                      </Link>
                      <div className="bl-lead-body">
                        <div className="bl-lead-top">
                          <span className="bl-badge">{lead.isFeatured ? <><Sparkles size={11} /> Featured</> : lead.editorChoice ? <><Star size={11} fill="currentColor" /> Editor&apos;s pick</> : <><Flame size={11} /> New</>}</span>
                          <Link to={`/blogs?category=${encodeURIComponent(lead.category)}`} className="bl-kicker">{titleCase(lead.category)}</Link>
                        </div>
                        <h3><Link to={`/blog/${lead.slug}`}>{lead.title}</Link></h3>
                        <p>{truncate(lead.excerpt, 240)}</p>
                        <div className="bl-meta">
                          <span><span className="bl-avatar" aria-hidden="true">{initials(lead.author)}</span> {lead.author}</span>
                          <span className="bl-dot" aria-hidden="true" />
                          {lead.publishedAt && <time dateTime={isoDate(lead.publishedAt)}>{fmtDate(lead.publishedAt)}</time>}
                          <span className="bl-dot" aria-hidden="true" />
                          <span><Clock3 size={13} /> {lead.readingTimeMinutes || 1} min read</span>
                        </div>
                      </div>
                    </motion.article>
                  )}

                  {side.length > 0 && (
                    <div className="bl-picks">
                      <div className="bl-picks-head">
                        <h2>Worth your time</h2>
                      </div>
                      {side.map((p, i) => (
                        <motion.div key={p.slug} initial="hidden" animate="show" variants={fade} transition={{ delay: 0.1 + i * 0.06 }}>
                          <Link to={`/blog/${p.slug}`} className="bl-row">
                            <Media post={p} sizes="140px" />
                            <div>
                              <span className="bl-kicker">{titleCase(p.category)}</span>
                              <h3>{p.title}</h3>
                              <div className="bl-meta">
                                <span><Clock3 size={12} /> {p.readingTimeMinutes || 1} min</span>
                                {p.publishedAt && <time dateTime={isoDate(p.publishedAt)}>{fmtDate(p.publishedAt, { day: "numeric", month: "short" })}</time>}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ================= MOST READ ================= */}
        {showHighlights && highlights.trending.length >= 3 && (
          <section className="bl-sec bl-tint" aria-labelledby="bl-trend-h">
            <div className="bl-shell">
              <div className="bl-sec-head">
                <div>
                  <p className="bl-eyebrow"><TrendingUp size={15} /> Most read</p>
                  <h2 id="bl-trend-h" className="bl-h2">What engineers are reading</h2>
                </div>
                <button type="button" className="bl-link" onClick={() => setParam({ sort: "trending" })}>
                  See all popular <ArrowRight size={16} />
                </button>
              </div>
              <ol className="bl-trend">
                {highlights.trending.map((p, i) => (
                  <li key={p.slug}>
                    <Link to={`/blog/${p.slug}`}>
                      <span className="bl-trend-n" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h3>{p.title}</h3>
                        <div className="bl-meta">
                          <span><Eye size={12} /> {fmtViews(p.views)} reads</span>
                          <span><Clock3 size={12} /> {p.readingTimeMinutes || 1} min</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* ================= ALL ARTICLES ================= */}
        <section className="bl-sec" id="articles" aria-labelledby="bl-all-h">
          <div className="bl-shell">
            <div className="bl-sec-head">
              <div>
                <p className="bl-eyebrow">{filtering ? "Results" : "Library"}</p>
                <h2 id="bl-all-h" className="bl-h2">
                  {q ? <>Results for “{q}”</> : category ? `${catName} articles` : tag ? `Tagged #${tag}` : sort === "trending" ? "Most read articles" : "All articles"}
                </h2>
              </div>
            </div>

            <div className="bl-results" aria-live="polite">
              <span>{list.loading ? "Loading articles…" : <>Showing <b>{list.posts.length}</b> of <b>{list.total}</b> {list.total === 1 ? "article" : "articles"}</>}</span>
              {(filtering || sort !== "latest") && (
                <div className="bl-filters">
                  {q && <span className="bl-filter-pill">“{q}” <button type="button" onClick={() => { setDraft(""); setParam({ q: "" }); }} aria-label="Remove search"><X size={13} /></button></span>}
                  {category && <span className="bl-filter-pill">{catName} <button type="button" onClick={() => setParam({ category: "" })} aria-label="Remove topic"><X size={13} /></button></span>}
                  {tag && <span className="bl-filter-pill">#{tag} <button type="button" onClick={() => setParam({ tag: "" })} aria-label="Remove tag"><X size={13} /></button></span>}
                  {sort !== "latest" && <span className="bl-filter-pill">{SORTS.find((s) => s.value === sort)?.label} <button type="button" onClick={() => setParam({ sort: "" })} aria-label="Reset sort"><X size={13} /></button></span>}
                  <button type="button" className="bl-link" onClick={clearAll}>Clear all</button>
                </div>
              )}
            </div>

            {list.loading ? (
              <div className="bl-grid">{Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}</div>
            ) : list.error && list.posts.length === 0 ? (
              <div className="bl-empty" role="alert">
                <h3>We could not load the articles</h3>
                <p>{list.error}</p>
                <button type="button" className="bl-btn bl-btn-ghost" onClick={retry}><RefreshCw size={16} /> Try again</button>
              </div>
            ) : list.posts.length === 0 ? (
              <div className="bl-empty">
                <h3>No articles match that</h3>
                <p>Try a shorter search, or browse a topic instead.</p>
                <div className="bl-filters" style={{ justifyContent: "center" }}>
                  {categories.slice(0, 6).map((c) => <Link key={c} className="bl-chip" to={`/blogs?category=${encodeURIComponent(c)}`}>{titleCase(c)}</Link>)}
                </div>
                <button type="button" className="bl-btn bl-btn-primary" onClick={clearAll}>See all articles</button>
              </div>
            ) : (
              <>
                <div className="bl-grid">
                  {list.posts.map((p, i) => (
                    <motion.div key={p.slug} initial="hidden" animate="show" variants={fade} transition={{ delay: Math.min(i % PAGE_SIZE, 6) * 0.04 }}>
                      <PostCard post={p} />
                    </motion.div>
                  ))}
                </div>

                <div className="bl-more">
                  <span>You have seen {list.posts.length} of {list.total}</span>
                  <span className="bl-more-bar" aria-hidden="true"><i style={{ width: `${Math.min(100, (list.posts.length / Math.max(1, list.total)) * 100)}%` }} /></span>
                  {list.hasNext && (
                    <button type="button" className="bl-btn bl-btn-ghost" onClick={loadMore} disabled={list.more}>
                      {list.more ? <><RefreshCw size={16} className="bl-spin" /> Loading…</> : <>Load more articles <ChevronDown size={16} /></>}
                    </button>
                  )}
                  {list.error && <span role="alert">{list.error}</span>}
                </div>
              </>
            )}
          </div>
        </section>

        {/* ================= CTA ================= */}
        <section className="bl-sec" style={{ paddingTop: 0 }}>
          <div className="bl-shell">
            <div className="bl-cta">
              <div>
                <p className="bl-eyebrow">Go deeper</p>
                <h2>Liked the notes? <span className="bl-cta-hl">Get the full handbooks.</span></h2>
                <p>System design, Java, Spring Boot and GenAI interview books with the depth a blog post cannot fit. PDFs in your inbox right after payment.</p>
              </div>
              <div className="bl-cta-actions">
                <Link to="/books" className="bl-btn bl-btn-accent">Browse the books <ArrowRight size={16} /></Link>
                <Link to="/resources" className="bl-btn bl-btn-onpanel">Free resources <ArrowUpRight size={16} /></Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </MotionConfig>
  );
}
