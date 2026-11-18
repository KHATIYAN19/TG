import React, { useEffect, useMemo, useState } from "react";

import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  Layers3,
  MapPin,
  Plus,
} from "lucide-react";

import BASE_URL from "../utils/Url.js";
import {
  buildDescription,
  formatDate,
  formatLabel,
  getExperienceText,
  markdownToHtml,
} from "../utils/InterviewUiUtils.js";
import {
  SITE_NAME,
  SITE_URL,
  asText,
  useInterviewFonts,
  useSiteTheme,
} from "./interviewShared.js";
import "./interviews.css";

/* ==========================================================================
   /interview/:slug  (also served at /interviews/:slug)

   Reading-first layout in the /books palette (pine panel + teal):
     pine header  ->  summary  ->  full story  ->  numbered round timeline  ->  preparation / advice / takeaways
   with a sticky "In this article" rail (desktop) and a jump bar (phones).
   No FAQ block, no result / difficulty badges: just the interview itself.

   SEO: title / description / canonical / robots / Open Graph / Twitter + JSON-LD Article (speakable) and BreadcrumbList.
   GEO: entity-rich headings ("<Company> <Role> interview rounds"), explicit dates and author, question text
        in plain semantic HTML, and internal links to more interviews at the same company.
   API: GET /api/interview/:slug (unchanged) + the existing list endpoint for related stories.
========================================================================== */

const Prose = ({ markdown, theme, small }) =>
  markdown ? (
    <div
      className={`iv-prose${small ? " sm" : ""}`}
      dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown, theme === "dark") }}
    />
  ) : null;

function RelatedCard({ item }) {
  const company = item?.company?.name || "Company";
  return (
    <article className="iv-card">
      <div className="iv-card-top">
        <div className="iv-logo">
          {item?.company?.logoUrl ? (
            <img src={item.company.logoUrl} alt={`${company} logo`} loading="lazy" decoding="async" />
          ) : (
            <Building2 size={20} aria-hidden="true" />
          )}
        </div>
        <div className="iv-card-co">
          <b>{company}</b>
          {item?.role?.title && <span>{item.role.title}</span>}
        </div>
      </div>
      <h3>
        <Link to={`/interview/${encodeURIComponent(item.slug)}`}>
          {item.title || `${company} interview experience`}
        </Link>
      </h3>
      <div className="iv-card-foot" aria-hidden="true">
        <span>Interview experience</span>
        <span>
          Read <ArrowRight size={15} />
        </span>
      </div>
    </article>
  );
}

export default function InterviewDetailPage() {
  useInterviewFonts();
  const theme = useSiteTheme();
  const { slug } = useParams();

  const API_BASE = useMemo(() => `${BASE_URL.replace(/\/$/, "")}/api/interview`, []);

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);
  const [activeId, setActiveId] = useState("");

  /* ---- main fetch ---- */
  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/${encodeURIComponent(slug)}`, { signal: controller.signal });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.message || "Unable to load interview experience.");
        }
        setInterview(data?.data || null);
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("Interview detail error:", error);
        setInterview(null);
        toast.error(error?.message || "Unable to load interview experience.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    window.scrollTo({ top: 0 });
    return () => controller.abort();
  }, [API_BASE, slug]);

  /* ---- more interviews from the same company (internal links; fails silently) ---- */
  const companyName = interview?.company?.name || "";
  useEffect(() => {
    setRelated([]);
    if (!companyName) return undefined;

    const controller = new AbortController();
    (async () => {
      try {
        const query = new URLSearchParams({ page: "1", limit: "5", status: "PUBLISHED", company: companyName });
        const response = await fetch(`${API_BASE}?${query.toString()}`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) return;
        setRelated(
          (Array.isArray(data?.data) ? data.data : []).filter((i) => i?.slug && i.slug !== slug).slice(0, 4)
        );
      } catch {
        /* optional section */
      }
    })();
    return () => controller.abort();
  }, [API_BASE, companyName, slug]);

  /* ---- highlight the section being read (rail + jump bar) ---- */
  useEffect(() => {
    if (!interview || typeof IntersectionObserver === "undefined") return undefined;
    const nodes = [...document.querySelectorAll("[data-ivd-section]")];
    if (!nodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -60% 0px", threshold: 0 }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [interview]);

  /* ======================================================================
     LOADING / NOT FOUND
  ====================================================================== */

  if (loading) {
    return (
      <div className="iv" data-theme={theme}>
        <main className="iv-wrap iv-page" aria-busy="true" aria-live="polite">
          <div className="iv-skel-block" style={{ height: 18, width: 240 }} />
          <div className="iv-skel-block" style={{ height: 250, marginTop: 16, borderRadius: 24 }} />
          <div className="iv-skel-block" style={{ height: 360, marginTop: 22 }} />
        </main>
      </div>
    );
  }

  if (!interview) {
    return (
      <>
        <Helmet>
          <title>Interview experience not found | {SITE_NAME}</title>
          <meta name="description" content="This interview experience could not be found. It may have been removed or the link may be incorrect." />
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <div className="iv" data-theme={theme}>
          <main className="iv-wrap iv-page iv-state">
            <div className="box">
              <div className="ico">
                <BriefcaseBusiness size={28} aria-hidden="true" />
              </div>
              <h1 className="iv-display">Interview experience not found</h1>
              <p>This experience may have been removed or unpublished, or the link may be incorrect.</p>
              <Link to="/interviews" className="iv-btn iv-btn-primary">
                <ArrowLeft size={17} aria-hidden="true" />
                Browse all interviews
              </Link>
            </div>
          </main>
        </div>
      </>
    );
  }

  /* ======================================================================
     DERIVED DATA
  ====================================================================== */

  const info = interview.interviewInfo || {};
  const role = interview?.role?.title || "Software Engineer";
  const level = interview?.role?.level || "";
  const company = companyName || "Company";
  const experience = getExperienceText(info);
  const published = interview.publishedAt || interview.createdAt;
  const updated = interview.updatedAt || published;
  const rounds = Array.isArray(interview.rounds) ? interview.rounds : [];
  const topics = (Array.isArray(interview.topics) ? interview.topics : []).map(asText).filter(Boolean);
  const technologies = (Array.isArray(interview.technologies) ? interview.technologies : []).map(asText).filter(Boolean);
  const tags = (Array.isArray(interview.tags) ? interview.tags : []).map(asText).filter(Boolean);
  const totalRounds = interview.totalRounds || rounds.length || 0;
  const authorName = interview?.author?.isAnonymous
    ? `${SITE_NAME} community member`
    : interview?.author?.name || `${SITE_NAME} community`;
  const modeValue = info.interviewMode && info.interviewMode !== "NOT_SPECIFIED" ? formatLabel(info.interviewMode) : "";
  const locationValue = info.location ? `${info.location}${info.country ? `, ${info.country}` : ""}` : info.country || "";

  /* ---- SEO ---- */
  const canonicalPath = (interview?.seo?.canonicalPath || `/interview/${interview.slug || slug}`).replace(
    /^\/interviews\//,
    "/interview/"
  );
  const canonicalUrl = canonicalPath.startsWith("http")
    ? canonicalPath
    : `${SITE_URL}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;

  const seoTitle =
    interview?.seo?.title ||
    `${company} ${role}${level ? ` ${level}` : ""} Interview Experience: Rounds & Questions | ${SITE_NAME}`;
  const seoDescription =
    interview?.seo?.description ||
    buildDescription(interview, 158) ||
    `Read a detailed ${company} ${role} interview experience with rounds, questions and preparation advice.`;
  const ogTitle = interview?.seo?.ogTitle || seoTitle;
  const ogDescription = interview?.seo?.ogDescription || seoDescription;
  const ogImage = interview?.seo?.ogImage || interview?.company?.logoUrl || "";

  const keywords = [
    ...new Set(
      [
        `${company} interview experience`,
        `${company} interview questions`,
        `${company} ${role} interview`,
        `${role} interview experience`,
        level,
        ...topics,
        ...technologies,
        ...tags,
      ].filter(Boolean)
    ),
  ];

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: interview.title || seoTitle,
    name: interview.title || seoTitle,
    description: seoDescription,
    url: canonicalUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    articleSection: "Software engineering interview experiences",
    datePublished: published || undefined,
    dateModified: updated || undefined,
    author: { "@type": interview?.author?.isAnonymous ? "Organization" : "Person", name: authorName },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    keywords,
    about: [company, role, level, ...topics, ...technologies].filter(Boolean).map((name) => ({ "@type": "Thing", name })),
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["#iv-summary", "h1"] },
    ...(interview.readingTimeMinutes > 0 ? { timeRequired: `PT${interview.readingTimeMinutes}M` } : {}),
    ...(ogImage ? { image: [ogImage] } : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Interview experiences", item: `${SITE_URL}/interviews` },
      { "@type": "ListItem", position: 3, name: interview.title || `${company} ${role} interview experience`, item: canonicalUrl },
    ],
  };

  /* ---- table of contents ---- */
  const toc = [
    interview.summaryMarkdown && { id: "iv-summary", label: "Summary" },
    interview.contentMarkdown && { id: "iv-story", label: "The full experience" },
    ...rounds.map((r, i) => ({ id: `round-${i + 1}`, label: r?.title || `Round ${i + 1}` })),
    interview.preparationMarkdown && { id: "iv-prep", label: "How to prepare" },
    interview.adviceMarkdown && { id: "iv-advice", label: "Advice" },
    interview.keyTakeawaysMarkdown && { id: "iv-takeaways", label: "Key takeaways" },
  ].filter(Boolean);

  const pills = [
    experience && { Icon: BriefcaseBusiness, text: `${experience} experience` },
    locationValue && { Icon: MapPin, text: locationValue },
    totalRounds > 0 && { Icon: Layers3, text: `${totalRounds} ${totalRounds === 1 ? "round" : "rounds"}` },
    modeValue && { Icon: BookOpen, text: modeValue },
  ].filter(Boolean);

  const tocLinks = (cls) =>
    toc.map((t) => (
      <a key={t.id} href={`#${t.id}`} className={activeId === t.id ? "on" : ""} aria-current={activeId === t.id ? "location" : undefined}>
        {t.label}
      </a>
    ));

  /* ======================================================================
     RENDER
  ====================================================================== */

  return (
    <>
      <Helmet>
        <html lang="en" />
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        {keywords.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}
        <meta name="author" content={authorName} />
        <meta
          name="robots"
          content={interview?.seo?.robots || "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"}
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:url" content={canonicalUrl} />
        {published && <meta property="article:published_time" content={new Date(published).toISOString()} />}
        {updated && <meta property="article:modified_time" content={new Date(updated).toISOString()} />}
        <meta property="article:section" content="Interview experiences" />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        <script type="application/ld+json">{JSON.stringify(articleLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>

      <div className="iv" data-theme={theme}>
        <main className="iv-wrap iv-page">
          <nav className="iv-crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/interviews">Interview experiences</Link>
              </li>
              <li aria-current="page">{interview.title || `${company} ${role}`}</li>
            </ol>
          </nav>

          {/* ================= HEADER ================= */}
          <header className="ivd-hero">
            <div className="ivd-co">
              <div className="ivd-logo">
                {interview?.company?.logoUrl ? (
                  <img src={interview.company.logoUrl} alt={`${company} logo`} decoding="async" />
                ) : (
                  <Building2 size={24} aria-hidden="true" />
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <b>{company}</b>
                <span>
                  {role}
                  {level ? ` · ${level}` : ""}
                </span>
              </div>
            </div>

            <h1 className="iv-display">{interview.title || `${company} ${role} interview experience`}</h1>

            <div className="ivd-meta">
              <span>
                <CircleUserRound size={15} aria-hidden="true" />
                {authorName}
              </span>
              {published && (
                <span>
                  <CalendarDays size={15} aria-hidden="true" />
                  <time dateTime={new Date(published).toISOString()}>{formatDate(published)}</time>
                </span>
              )}
              {interview.readingTimeMinutes > 0 && (
                <span>
                  <BookOpen size={15} aria-hidden="true" />
                  {interview.readingTimeMinutes} min read
                </span>
              )}
            </div>

            {pills.length > 0 && (
              <ul className="ivd-pills" aria-label="Interview details" style={{ listStyle: "none", padding: 0, marginBottom: 0 }}>
                {pills.map(({ Icon, text }) => (
                  <li key={text} className="ivd-pill">
                    <Icon size={14} aria-hidden="true" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            )}
          </header>

          {toc.length > 1 && (
            <nav className="ivd-jump" aria-label="Jump to section">
              {tocLinks()}
            </nav>
          )}

          <div className="ivd-grid">
            {/* ================= ARTICLE ================= */}
            <article className="ivd-article">
              {interview.summaryMarkdown && (
                <section id="iv-summary" data-ivd-section className="ivd-sec" aria-label="Summary">
                  <div className="ivd-lead">
                    <Prose markdown={interview.summaryMarkdown} theme={theme} />
                  </div>
                </section>
              )}

              {interview.contentMarkdown && (
                <section id="iv-story" data-ivd-section className="ivd-sec" aria-labelledby="iv-story-h">
                  <h2 id="iv-story-h">
                    The full <span className="iv-mark">experience</span>
                  </h2>
                  <Prose markdown={interview.contentMarkdown} theme={theme} />
                </section>
              )}

              {rounds.length > 0 && (
                <section className="ivd-sec" aria-labelledby="iv-rounds-h">
                  <h2 id="iv-rounds-h">
                    {company} {role} <span className="iv-mark">interview rounds</span>
                  </h2>

                  <div className="ivd-rounds">
                    {rounds.map((round, index) => {
                      const questions = Array.isArray(round?.questions) ? round.questions : [];
                      const details = [
                        round?.type && round.type !== "OTHER" ? formatLabel(round.type) : "",
                        Number(round?.durationMinutes) > 0 ? `${round.durationMinutes} min` : "",
                        round?.mode && round.mode !== "NOT_SPECIFIED" ? formatLabel(round.mode) : "",
                        round?.platform || "",
                      ].filter(Boolean);

                      return (
                        <section
                          key={round?._id || `${round?.title}-${index}`}
                          id={`round-${index + 1}`}
                          data-ivd-section
                          className="ivd-round"
                          aria-labelledby={`round-${index + 1}-h`}
                        >
                          <div className="ivd-round-head">
                            <span className="ivd-n" aria-hidden="true">{index + 1}</span>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <h3 id={`round-${index + 1}-h`}>{round?.title || `Round ${index + 1}`}</h3>
                              {details.length > 0 && <p>{details.join(" · ")}</p>}
                            </div>
                          </div>

                          <div className="ivd-round-body">
                            <Prose markdown={round?.contentMarkdown} theme={theme} />

                            {questions.length > 0 && (
                              <div className="ivd-qs">
                                <h4 className="ivd-qs-title">Questions asked ({questions.length})</h4>
                                {questions.map((q, qi) => (
                                  <div key={q?._id || qi} className="ivd-q">
                                    <span className="ivd-q-n" aria-hidden="true">Q{qi + 1}</span>
                                    <div>
                                      <p className="q">{q?.question}</p>
                                      <Prose markdown={q?.descriptionMarkdown} theme={theme} small />
                                      {q?.approachMarkdown && (
                                        <details>
                                          <summary>
                                            How it was approached
                                            <ChevronDown size={17} aria-hidden="true" />
                                          </summary>
                                          <Prose markdown={q.approachMarkdown} theme={theme} small />
                                        </details>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {round?.takeawayMarkdown && (
                              <div className="ivd-callout">
                                <b>
                                  <CheckCircle2 size={15} aria-hidden="true" />
                                  Round takeaway
                                </b>
                                <Prose markdown={round.takeawayMarkdown} theme={theme} small />
                              </div>
                            )}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                </section>
              )}

              {interview.preparationMarkdown && (
                <section id="iv-prep" data-ivd-section className="ivd-sec" aria-labelledby="iv-prep-h">
                  <h2 id="iv-prep-h">
                    How to <span className="iv-mark">prepare</span> for {company}
                  </h2>
                  <Prose markdown={interview.preparationMarkdown} theme={theme} />
                </section>
              )}

              {interview.adviceMarkdown && (
                <section id="iv-advice" data-ivd-section className="ivd-sec" aria-labelledby="iv-advice-h">
                  <h2 id="iv-advice-h">
                    Advice from the <span className="iv-mark">candidate</span>
                  </h2>
                  <Prose markdown={interview.adviceMarkdown} theme={theme} />
                </section>
              )}

              {interview.keyTakeawaysMarkdown && (
                <section id="iv-takeaways" data-ivd-section className="ivd-sec" aria-labelledby="iv-takeaways-h">
                  <h2 id="iv-takeaways-h">
                    Key <span className="iv-mark">takeaways</span>
                  </h2>
                  <Prose markdown={interview.keyTakeawaysMarkdown} theme={theme} />
                </section>
              )}

              {(topics.length > 0 || technologies.length > 0) && (
                <section className="ivd-sec" aria-label="Topics and technologies covered">
                  <div className="ivd-topics">
                    {[...technologies, ...topics].slice(0, 16).map((t) => (
                      <Link key={t} to={`/interviews?q=${encodeURIComponent(t)}`}>
                        {t}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {related.length > 0 && (
                <section className="ivd-sec" aria-labelledby="iv-related-h">
                  <h2 id="iv-related-h">
                    More {company} <span className="iv-mark">interviews</span>
                  </h2>
                  <div className="iv-more">
                    {related.map((item) => (
                      <RelatedCard key={item._id || item.slug} item={item} />
                    ))}
                  </div>
                </section>
              )}

              <div className="iv-foot-nav">
                <Link to="/interviews" className="iv-btn iv-btn-ghost">
                  <ArrowLeft size={17} aria-hidden="true" />
                  All interview experiences
                </Link>
                <Link to="/mock-interviews" className="iv-btn iv-btn-dark">
                  Practice with a mock interview
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </article>

            {/* ================= RAIL ================= */}
            <aside className="ivd-rail" aria-label="Article navigation">
              {toc.length > 1 && (
                <nav className="ivd-box" aria-label="In this article">
                  <h2>In this article</h2>
                  <div className="ivd-toc">{tocLinks()}</div>
                </nav>
              )}

              <div className="ivd-box ivd-box-cta">
                <h2>Share your interview</h2>
                <p>Help other engineers prepare. You can publish anonymously.</p>
                <Link to="/interview/create" className="iv-btn iv-btn-block">
                  <Plus size={17} aria-hidden="true" />
                  Write your experience
                </Link>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
}
