import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Flame,
  IndianRupee,
  MapPin,
  Plus,
  Search,
  SearchX,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from "lucide-react";

import BASE_URL from "../utils/Url.js";
import {
  formatLabel,
  getExperienceText,
  getTimeAgo,
  stripMarkdown,
} from "../utils/InterviewUiUtils.js";
import {
  SITE_NAME,
  SITE_URL,
  asText,
  clip,
  useInterviewFonts,
  useSiteTheme,
} from "./interviewShared.js";
import "./interviews.css";

/* ==========================================================================
   /interviews  -  Software engineering interview experiences (feed)

   Redesigned from scratch:
   - URL-driven state (?section= &q= &page= &company= ...): every view is linkable and crawlable.
   - SEO: title / description / canonical / robots (filtered + search views are noindex,follow),
     Open Graph, Twitter, JSON-LD (Organization, WebSite, CollectionPage, BreadcrumbList, ItemList, FAQPage).
   - AEO: answer-first intro paragraph + a visible FAQ whose text is the same text used in the FAQPage schema.
   - GEO: entity-rich plain-language facts, semantic HTML (header / nav / main / section / article / time), stable headings.
   API calls are unchanged: GET /api/interview and GET /api/interview/filters.
========================================================================== */

const PAGE_URL = `${SITE_URL}/interviews`;
const PAGE_SIZE = 25;
const MOCK_INTERVIEW_URL = "/mock-interviews";

const SEO_TITLE = "Software Engineering Interview Experiences: Real Rounds & Questions | Target Trek";
const SEO_DESCRIPTION =
  "Read real software engineering interview experiences from engineers: round-by-round breakdowns, actual DSA, LLD, HLD, backend and GenAI questions, difficulty, results and preparation tips.";

const SECTIONS = [
  { value: "for-you", label: "All", icon: Sparkles, description: "Every published software engineering interview experience." },
  { value: "latest", label: "Newest", icon: Clock3, description: "The most recently published interview experiences." },
  { value: "trending", label: "Trending", icon: Flame, description: "The most-read interview experiences right now." },
  { value: "editor-picks", label: "Editor's picks", icon: BadgeCheck, description: "Experiences our editors found especially useful." },
  { value: "featured", label: "Featured", icon: Star, description: "Featured interview experiences." },
  { value: "compensation", label: "Compensation", icon: IndianRupee, description: "Experiences that include salary, CTC and offer details." },
];

const RESULT_OPTIONS = [
  { value: "", label: "Any result" },
  { value: "SELECTED", label: "Selected" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WAITING", label: "Waiting" },
  { value: "OFFER_DECLINED", label: "Offer declined" },
  { value: "NOT_DISCLOSED", label: "Not disclosed" },
];

const DIFFICULTY_OPTIONS = [
  { value: "", label: "Any difficulty" },
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "MEDIUM_HARD", label: "Medium-hard" },
  { value: "HARD", label: "Hard" },
  { value: "NOT_SPECIFIED", label: "Not specified" },
];

const FILTER_KEYS = ["company", "role", "location", "topic", "technology", "result", "difficulty"];

const FILTER_LABELS = {
  company: "Company",
  role: "Role",
  location: "Location",
  topic: "Topic",
  technology: "Technology",
  result: "Result",
  difficulty: "Difficulty",
};

/* ---------- client-side safety layer (never show unpublished items) ---------- */

const isPublished = (item = {}) => {
  if (typeof item.published === "boolean") return item.published;
  if (typeof item.isPublished === "boolean") return item.isPublished;
  const status = String(item.status || item.publicationStatus || item.publishStatus || "")
    .trim()
    .toUpperCase();
  if (status) return ["PUBLISHED", "LIVE", "APPROVED"].includes(status);
  return Boolean(item.publishedAt);
};

const getViews = (item = {}) =>
  Number(item.views ?? item.viewCount ?? item.stats?.views ?? item.analytics?.views ?? 0);

const hasCompensation = (item = {}) => {
  const bucket = [
    ...(Array.isArray(item.tags) ? item.tags : []),
    ...(Array.isArray(item.topics) ? item.topics : []),
    ...(Array.isArray(item.categories) ? item.categories : item.category ? [item.category] : []),
    item.type,
  ]
    .map(asText)
    .join(" ")
    .toLowerCase();
  return ["compensation", "salary", "ctc", "package", "base salary"].some((k) => bucket.includes(k));
};

const applySection = (items, section) => {
  const list = items.filter(isPublished);
  switch (section) {
    case "latest":
      return [...list].sort(
        (a, b) =>
          new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0)
      );
    case "trending":
      return [...list].sort((a, b) => getViews(b) - getViews(a));
    case "editor-picks":
      return list.filter((i) => i.editorPick === true);
    case "featured":
      return list.filter((i) => i.featured === true);
    case "compensation":
      return list.filter(hasCompensation);
    default:
      return list;
  }
};

const resultChip = (result) =>
  ({ SELECTED: "iv-chip-ok", REJECTED: "iv-chip-bad", WAITING: "iv-chip-warn", OFFER_DECLINED: "iv-chip-info" })[
    result
  ] || "";

const difficultyChip = (d) =>
  ({ EASY: "iv-chip-ok", MEDIUM: "iv-chip-warn", MEDIUM_HARD: "iv-chip-accent", HARD: "iv-chip-bad" })[d] || "";

/* ---------- small components ---------- */

function Field({ label, value, onChange, options, id }) {
  return (
    <div className="iv-field">
      <label htmlFor={id}>{label}</label>
      <div className="iv-select">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={17} aria-hidden="true" />
      </div>
    </div>
  );
}

function InterviewCard({ interview, index }) {
  const info = interview?.interviewInfo || {};
  const experience = getExperienceText(info);
  const technologies = (Array.isArray(interview?.technologies) ? interview.technologies : [])
    .map(asText)
    .filter(Boolean);
  const topics = (Array.isArray(interview?.topics) ? interview.topics : []).map(asText).filter(Boolean);
  const summary = stripMarkdown(interview?.summaryMarkdown || interview?.contentMarkdown || "");
  const views = getViews(interview);
  const slug = interview?.slug || "";
  const href = slug ? `/interview/${encodeURIComponent(slug)}` : "/interviews";
  const published = interview?.publishedAt || interview?.createdAt;
  const company = interview?.company?.name || "Company";
  const tags = [...technologies, ...topics].slice(0, 4);
  const rounds = Number(interview?.totalRounds) || 0;

  return (
    <article className="iv-card" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
      <div className="iv-card-top">
        <div className="iv-logo">
          {interview?.company?.logoUrl ? (
            <img src={interview.company.logoUrl} alt={`${company} logo`} loading="lazy" decoding="async" />
          ) : (
            <Building2 size={20} aria-hidden="true" />
          )}
        </div>
        <div className="iv-card-co">
          <b>{company}</b>
          {interview?.role?.title && <span>{interview.role.title}</span>}
        </div>
        {interview?.editorPick === true && (
          <span className="iv-chip iv-chip-accent iv-card-pick">
            <BadgeCheck size={13} aria-hidden="true" /> Editor's pick
          </span>
        )}
      </div>

      <h2>
        <Link to={href}>{interview?.title || `${company} interview experience`}</Link>
      </h2>

      {summary && <p className="iv-card-sum">{summary}</p>}

      <div className="iv-chips">
        {info.result && info.result !== "NOT_DISCLOSED" && (
          <span className={`iv-chip ${resultChip(info.result)}`}>
            <span>{formatLabel(info.result)}</span>
          </span>
        )}
        {info.difficulty && info.difficulty !== "NOT_SPECIFIED" && (
          <span className={`iv-chip ${difficultyChip(info.difficulty)}`}>
            <span>{formatLabel(info.difficulty)}</span>
          </span>
        )}
        {rounds > 0 && (
          <span className="iv-chip">
            <span>{rounds} {rounds === 1 ? "round" : "rounds"}</span>
          </span>
        )}
        {tags.map((tag) => (
          <span key={tag} className="iv-chip iv-chip-accent">
            <span>{tag}</span>
          </span>
        ))}
      </div>

      <div className="iv-meta">
        {info.location && (
          <span>
            <MapPin size={14} aria-hidden="true" />
            {info.location}
          </span>
        )}
        {experience && (
          <span>
            <BriefcaseBusiness size={14} aria-hidden="true" />
            {experience} exp.
          </span>
        )}
        {published && (
          <span>
            <Clock3 size={14} aria-hidden="true" />
            <time dateTime={new Date(published).toISOString()}>{getTimeAgo(published)}</time>
          </span>
        )}
        {views > 0 && (
          <span>
            <Eye size={14} aria-hidden="true" />
            {views.toLocaleString("en-IN")} views
          </span>
        )}
        {Number(interview?.readingTimeMinutes) > 0 && <span>{interview.readingTimeMinutes} min read</span>}
      </div>

      <div className="iv-card-foot" aria-hidden="true">
        <span>{interview?.author?.isAnonymous ? "Anonymous candidate" : interview?.author?.name || "Candidate"}</span>
        <span>
          Read full story <ArrowRight size={15} />
        </span>
      </div>
    </article>
  );
}

/* ==========================================================================
   PAGE
========================================================================== */

export default function InterviewFeed() {
  useInterviewFonts();
  const theme = useSiteTheme();

  const [params, setParams] = useSearchParams();

  const API_BASE = useMemo(() => `${BASE_URL.replace(/\/$/, "")}/api/interview`, []);

  /* ---- URL is the single source of truth ---- */
  const section = SECTIONS.some((s) => s.value === params.get("section")) ? params.get("section") : "for-you";
  const urlQuery = params.get("q") || "";
  const page = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
  const filters = useMemo(
    () => Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || ""])),
    [params]
  );

  const updateParams = useCallback(
    (changes, { resetPage = true } = {}) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(changes).forEach(([key, value]) => {
            if (value === "" || value === null || value === undefined || (key === "section" && value === "for-you")) {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          });
          if (resetPage && !("page" in changes)) next.delete("page");
          if (next.get("page") === "1") next.delete("page");
          return next;
        },
        { replace: false }
      );
    },
    [setParams]
  );

  /* ---- search box (debounced into the URL) ---- */
  const [searchText, setSearchText] = useState(urlQuery);
  useEffect(() => setSearchText(urlQuery), [urlQuery]);
  useEffect(() => {
    const trimmed = searchText.trim();
    if (trimmed === urlQuery) return undefined;
    const timer = window.setTimeout(() => updateParams({ q: trimmed }), 400);
    return () => window.clearTimeout(timer);
  }, [searchText, urlQuery, updateParams]);

  /* ---- data ---- */
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersData, setFiltersData] = useState({
    companies: [],
    roles: [],
    locations: [],
    topics: [],
    technologies: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [sheetOpen, setSheetOpen] = useState(false);
  const resultsRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`${API_BASE}/filters`, { headers: { Accept: "application/json" } });
        const data = await response.json().catch(() => null);
        if (!response.ok || cancelled) return;
        const d = data?.data || {};
        setFiltersData({
          companies: d.companies || [],
          roles: d.roles || [],
          locations: d.locations || [],
          topics: d.topics || [],
          technologies: d.technologies || [],
        });
      } catch (error) {
        console.error("fetchFilters:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [API_BASE]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);

        const query = new URLSearchParams();
        query.set("page", String(page));
        query.set("limit", String(PAGE_SIZE));
        query.set("status", "PUBLISHED"); // public page = published only
        query.set("feed", section);

        if (section === "latest") {
          query.set("sortBy", "publishedAt");
          query.set("sortOrder", "desc");
        } else if (section === "trending") {
          query.set("sortBy", "views");
          query.set("sortOrder", "desc");
        } else if (section === "editor-picks") {
          query.set("editorPick", "true");
        } else if (section === "featured") {
          query.set("featured", "true");
        } else if (section === "compensation") {
          query.set("tag", "compensation");
        }

        if (urlQuery) query.set("q", urlQuery);
        Object.entries(filters).forEach(([k, v]) => v && query.set(k, v));

        const response = await fetch(`${API_BASE}?${query.toString()}`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.message || "Unable to load interview experiences.");
        }

        const safe = applySection(Array.isArray(data?.data) ? data.data : [], section);
        setInterviews(safe);
        setPagination({
          page: data?.pagination?.page || page,
          total: data?.pagination?.total || safe.length,
          totalPages: data?.pagination?.totalPages || 1,
          hasNextPage: Boolean(data?.pagination?.hasNextPage),
          hasPreviousPage: Boolean(data?.pagination?.hasPreviousPage),
        });
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("fetchInterviews:", error);
        setInterviews([]);
        toast.error(error?.message || "Unable to load interviews.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [API_BASE, page, section, urlQuery, filters]);

  /* ---- lock page scroll behind the mobile filter sheet ---- */
  useEffect(() => {
    if (!sheetOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && setSheetOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

  /* ---- derived ---- */
  const activeFilters = FILTER_KEYS.filter((k) => filters[k]).map((k) => ({
    key: k,
    label: `${FILTER_LABELS[k]}: ${["result", "difficulty"].includes(k) ? formatLabel(filters[k]) : filters[k]}`,
  }));
  const hasRefinement = activeFilters.length > 0 || Boolean(urlQuery);
  const sectionData = SECTIONS.find((s) => s.value === section) || SECTIONS[0];

  const toOptions = (all, list) => [{ value: "", label: all }, ...list.map((v) => ({ value: v, label: v }))];

  const clearAll = () => {
    setSearchText("");
    setParams(section === "for-you" ? {} : { section });
  };

  const goToPage = (n) => {
    updateParams({ page: n }, { resetPage: false });
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pageLink = (n) => {
    const next = new URLSearchParams(params);
    if (n <= 1) next.delete("page");
    else next.set("page", String(n));
    const qs = next.toString();
    return qs ? `?${qs}` : "?";
  };

  const total = pagination.total;
  const topCompanies = filtersData.companies.slice(0, 8);

  /* ---- AEO: one list powers both the visible FAQ and the FAQPage schema ---- */
  const faqs = useMemo(
    () => [
      {
        q: "What are software engineering interview experiences?",
        a: "They are first-hand accounts from engineers who went through a real hiring process. Each one explains the interview rounds, the actual questions asked (DSA, low-level design, high-level design, backend, GenAI and behavioural), how hard it felt, what the result was and what the candidate would do differently.",
      },
      {
        q: "How should I use interview experiences to prepare?",
        a: "Pick the company and role you are targeting, read two or three recent experiences, and note the round structure and recurring topics. Then practise those question types under time pressure, ideally with a mock interview, and revisit the experiences to check your answers against what was actually asked.",
      },
      {
        q: "Which companies and roles are covered?",
        a: topCompanies.length
          ? `Experiences cover companies such as ${topCompanies.join(", ")} and more, across SDE, backend, full-stack, data and AI engineering roles. Use the company, role, location, topic and technology filters to narrow the list.`
          : "Experiences cover product companies, startups and service companies across SDE, backend, full-stack, data and AI engineering roles. Use the company, role, location, topic and technology filters to narrow the list.",
      },
      {
        q: "Are these experiences real?",
        a: "Yes. They are written by candidates about their own interviews and are published after review. Details such as the questions and rounds come from the author, so treat them as one person's account and compare a few before drawing conclusions.",
      },
      {
        q: "Can I share my own interview experience anonymously?",
        a: "Yes. You can submit your experience and choose to publish it anonymously. It helps other engineers prepare, and it only takes a few minutes to write the rounds and questions you remember.",
      },
      {
        q: "How can I practise after reading an experience?",
        a: "Book a 1:1 mock interview on Target Trek to rehearse DSA, LLD, HLD, GenAI or project discussion rounds with feedback before the real interview.",
      },
    ],
    [topCompanies]
  );

  /* ---- SEO ---- */
  const isRefined = hasRefinement || section !== "for-you";
  const canonical = page > 1 && !isRefined ? `${PAGE_URL}?page=${page}` : PAGE_URL;
  const robots = isRefined
    ? "noindex, follow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
  const pageTitle = page > 1 && !isRefined ? `${SEO_TITLE} (Page ${page})` : SEO_TITLE;

  const structuredData = useMemo(() => {
    const items = interviews.slice(0, PAGE_SIZE).map((item, i) => ({
      "@type": "ListItem",
      position: (page - 1) * PAGE_SIZE + i + 1,
      url: `${SITE_URL}/interview/${encodeURIComponent(item.slug || "")}`,
      name: item.title || `${item.company?.name || "Company"} interview experience`,
    }));

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: SITE_NAME,
          url: SITE_URL,
        },
        {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          name: SITE_NAME,
          url: SITE_URL,
          publisher: { "@id": `${SITE_URL}/#organization` },
        },
        {
          "@type": "CollectionPage",
          "@id": `${PAGE_URL}#webpage`,
          url: PAGE_URL,
          name: SEO_TITLE,
          description: SEO_DESCRIPTION,
          inLanguage: "en-IN",
          isPartOf: { "@id": `${SITE_URL}/#website` },
          about: [
            "Software engineering interviews",
            "Data structures and algorithms interviews",
            "System design interviews",
            "Backend engineering interviews",
            "GenAI engineering interviews",
          ],
          breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
          mainEntity: { "@id": `${PAGE_URL}#list` },
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${PAGE_URL}#breadcrumb`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Interview experiences", item: PAGE_URL },
          ],
        },
        {
          "@type": "ItemList",
          "@id": `${PAGE_URL}#list`,
          name: "Software engineering interview experiences",
          numberOfItems: items.length,
          itemListElement: items,
        },
        {
          "@type": "FAQPage",
          "@id": `${PAGE_URL}#faq`,
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        },
      ],
    };
  }, [interviews, page, faqs]);

  const filterFields = (
    <div className="iv-filter-fields">
      <Field id="f-company" label="Company" value={filters.company} onChange={(v) => updateParams({ company: v })} options={toOptions("All companies", filtersData.companies)} />
      <Field id="f-role" label="Role" value={filters.role} onChange={(v) => updateParams({ role: v })} options={toOptions("All roles", filtersData.roles)} />
      <Field id="f-location" label="Location" value={filters.location} onChange={(v) => updateParams({ location: v })} options={toOptions("All locations", filtersData.locations)} />
      <Field id="f-topic" label="Topic" value={filters.topic} onChange={(v) => updateParams({ topic: v })} options={toOptions("All topics", filtersData.topics)} />
      <Field id="f-tech" label="Technology" value={filters.technology} onChange={(v) => updateParams({ technology: v })} options={toOptions("All technologies", filtersData.technologies)} />
      <Field id="f-result" label="Result" value={filters.result} onChange={(v) => updateParams({ result: v })} options={RESULT_OPTIONS} />
      <Field id="f-diff" label="Difficulty" value={filters.difficulty} onChange={(v) => updateParams({ difficulty: v })} options={DIFFICULTY_OPTIONS} />
    </div>
  );

  return (
    <>
      <Helmet htmlAttributes={{ lang: "en" }}>
        <title>{pageTitle}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <meta name="author" content={SITE_NAME} />
        <meta name="robots" content={robots} />
        <meta name="googlebot" content={robots} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESCRIPTION} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="iv" data-theme={theme}>
        <main className="iv-wrap iv-page">
          {/* ================= HERO ================= */}
          <header className="iv-hero">
            <div className="iv-hero-grid">
              <div style={{ minWidth: 0 }}>
                <span className="iv-eyebrow">
                  <BriefcaseBusiness size={15} aria-hidden="true" />
                  Interview experiences
                </span>
                <h1 className="iv-display">
                  Real software engineering <span className="iv-mark">interview experiences</span>
                </h1>
                <p className="iv-answer">
                  <strong>Interview experiences are first-hand accounts of real hiring processes.</strong>{" "}
                  Here you can read round-by-round breakdowns, the actual DSA, LLD, HLD, backend and GenAI
                  questions engineers were asked, how difficult each round felt and what the final result was, so
                  you know what to prepare before your own interview.
                </p>

                <div className="iv-hero-actions">
                  <Link to="/interview/create" className="iv-btn iv-btn-primary">
                    <Plus size={17} aria-hidden="true" />
                    Share your experience
                  </Link>
                  <Link to={MOCK_INTERVIEW_URL} className="iv-btn iv-btn-ghost">
                    Practice with a mock interview
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>

                <form
                  className="iv-search"
                  role="search"
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateParams({ q: searchText.trim() });
                  }}
                >
                  <Search className="lead" size={20} aria-hidden="true" />
                  <label htmlFor="iv-q" className="iv-sr">
                    Search interview experiences by company, role, topic or question
                  </label>
                  <input
                    id="iv-q"
                    type="search"
                    enterKeyHint="search"
                    autoComplete="off"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search company, role, topic or question..."
                  />
                  {searchText && (
                    <button type="button" className="clear" aria-label="Clear search" onClick={() => setSearchText("")}>
                      <X size={18} />
                    </button>
                  )}
                </form>
              </div>

              <div className="iv-stats" role="group" aria-label="Interview library at a glance">
                <div className="iv-stat">
                  <b>{loading && !total ? "…" : total.toLocaleString("en-IN")}</b>
                  <span>{hasRefinement ? "matching experiences" : "published experiences"}</span>
                </div>
                <div className="iv-stat">
                  <b>{filtersData.companies.length || "—"}</b>
                  <span>companies covered</span>
                </div>
                <div className="iv-stat">
                  <b>{filtersData.roles.length || "—"}</b>
                  <span>roles &amp; levels</span>
                </div>
              </div>
            </div>
          </header>

          {/* ================= SECTION TABS ================= */}
          <nav className="iv-tabs-wrap" aria-label="Interview experience collections">
            <div className="iv-tabs">
              {SECTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  className="iv-tab"
                  aria-current={section === value ? "true" : undefined}
                  onClick={() => updateParams({ section: value })}
                >
                  <Icon size={16} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
            <p className="iv-tab-desc">{sectionData.description}</p>
          </nav>

          {/* ================= FILTERS + RESULTS ================= */}
          <div className="iv-layout" ref={resultsRef} style={{ scrollMarginTop: 90 }}>
            <div>
              <div className="iv-filter-toggle">
                <button type="button" className="iv-btn iv-btn-ghost" onClick={() => setSheetOpen(true)} aria-haspopup="dialog">
                  <SlidersHorizontal size={17} aria-hidden="true" />
                  Filters
                  {activeFilters.length > 0 && <span className="iv-filter-count">{activeFilters.length}</span>}
                </button>
              </div>

              <aside
                className={`iv-filters${sheetOpen ? " is-open" : ""}`}
                aria-label="Filter interview experiences"
                role={sheetOpen ? "dialog" : undefined}
                aria-modal={sheetOpen ? "true" : undefined}
              >
                <div className="iv-filters-head">
                  <h2>Filter experiences</h2>
                  <button type="button" className="close" aria-label="Close filters" onClick={() => setSheetOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
                {filterFields}
                <div className="iv-filters-foot">
                  <button type="button" className="iv-btn iv-btn-primary done" onClick={() => setSheetOpen(false)}>
                    Show {loading ? "" : total.toLocaleString("en-IN")} results
                  </button>
                  {(activeFilters.length > 0 || urlQuery) && (
                    <button type="button" className="iv-btn iv-btn-ghost" onClick={clearAll}>
                      Clear all
                    </button>
                  )}
                </div>
              </aside>
              <button
                type="button"
                aria-label="Close filters"
                tabIndex={-1}
                className={`iv-filters-backdrop${sheetOpen ? " is-open" : ""}`}
                onClick={() => setSheetOpen(false)}
              />
            </div>

            <section aria-labelledby="iv-results-title" style={{ minWidth: 0 }} aria-busy={loading}>
              <div className="iv-results-head">
                <h2 id="iv-results-title">{sectionData.value === "for-you" ? "All interview experiences" : sectionData.label}</h2>
                <p role="status">
                  {loading
                    ? "Loading..."
                    : total > 0
                      ? `${total.toLocaleString("en-IN")} ${total === 1 ? "experience" : "experiences"}${
                          pagination.totalPages > 1 ? ` · page ${pagination.page} of ${pagination.totalPages}` : ""
                        }`
                      : "No results"}
                </p>
              </div>

              {(activeFilters.length > 0 || urlQuery) && (
                <div className="iv-active" aria-label="Active filters">
                  {urlQuery && (
                    <button type="button" onClick={() => updateParams({ q: "" })}>
                      <span>Search: {urlQuery}</span>
                      <X size={14} aria-hidden="true" />
                    </button>
                  )}
                  {activeFilters.map((f) => (
                    <button key={f.key} type="button" onClick={() => updateParams({ [f.key]: "" })}>
                      <span>{f.label}</span>
                      <X size={14} aria-hidden="true" />
                    </button>
                  ))}
                </div>
              )}

              {loading ? (
                <div className="iv-list" aria-hidden="true">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="iv-skel" />
                  ))}
                </div>
              ) : interviews.length === 0 ? (
                <div className="iv-empty">
                  <div className="ico">
                    <SearchX size={26} aria-hidden="true" />
                  </div>
                  <h3>No experiences found</h3>
                  <p>Try a different company, role or keyword, or clear your filters to see everything.</p>
                  {(hasRefinement || section !== "for-you") && (
                    <button type="button" className="iv-btn iv-btn-primary" onClick={clearAll}>
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="iv-list">
                  {interviews.map((interview, i) => (
                    <InterviewCard key={interview._id || interview.slug || i} interview={interview} index={i} />
                  ))}
                </div>
              )}

              {!loading && pagination.totalPages > 1 && (
                <nav className="iv-pager" aria-label="Pagination">
                  <Link
                    to={pageLink(pagination.page - 1)}
                    className="iv-btn iv-btn-ghost iv-btn-sm"
                    rel="prev"
                    aria-disabled={!pagination.hasPreviousPage}
                    tabIndex={pagination.hasPreviousPage ? 0 : -1}
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.hasPreviousPage) goToPage(pagination.page - 1);
                    }}
                  >
                    <ChevronLeft size={16} aria-hidden="true" />
                    Previous
                  </Link>
                  <span className="info">
                    Page {pagination.page} / {pagination.totalPages}
                  </span>
                  <Link
                    to={pageLink(pagination.page + 1)}
                    className="iv-btn iv-btn-primary iv-btn-sm"
                    rel="next"
                    aria-disabled={!pagination.hasNextPage}
                    tabIndex={pagination.hasNextPage ? 0 : -1}
                    onClick={(e) => {
                      e.preventDefault();
                      if (pagination.hasNextPage) goToPage(pagination.page + 1);
                    }}
                  >
                    Next
                    <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                </nav>
              )}
            </section>
          </div>

          {/* ================= HOW TO USE (GEO / AEO) ================= */}
          <section className="iv-sec" aria-labelledby="iv-how">
            <div className="iv-sec-head">
              <span className="iv-eyebrow">How to use this library</span>
              <h2 id="iv-how" className="iv-display">
                Turn other people's interviews into <span className="iv-mark">your preparation plan</span>
              </h2>
              <p>
                A good interview experience tells you three things: what the rounds look like, what was actually
                asked, and what separated selected candidates from rejected ones.
              </p>
            </div>
            <ol className="iv-steps">
              <li>
                <div>
                  <b>Find your target</b>
                  <span>Filter by company, role and technology to see the process you will face.</span>
                </div>
              </li>
              <li>
                <div>
                  <b>Study the rounds</b>
                  <span>Note the round order, the question types and the difficulty reported in each one.</span>
                </div>
              </li>
              <li>
                <div>
                  <b>Practise under pressure</b>
                  <span>Rehearse those questions out loud, then book a mock interview to get feedback.</span>
                </div>
              </li>
            </ol>
          </section>

          {/* ================= FAQ (visible, mirrors FAQPage schema) ================= */}
          <section className="iv-sec" aria-labelledby="iv-faq">
            <div className="iv-sec-head">
              <span className="iv-eyebrow">FAQ</span>
              <h2 id="iv-faq" className="iv-display">
                Interview experiences, <span className="iv-mark">answered</span>
              </h2>
            </div>
            <div className="iv-faq">
              {faqs.map((f) => (
                <details key={f.q}>
                  <summary>
                    {f.q}
                    <ChevronDown size={18} aria-hidden="true" />
                  </summary>
                  <p className="a">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ================= CTA ================= */}
          <section className="iv-cta" aria-labelledby="iv-cta-title">
            <div>
              <h2 id="iv-cta-title" className="iv-display">
                Been through an interview? Help the next engineer.
              </h2>
              <p>
                Share the rounds, the questions and what you learned. You can publish anonymously, and it takes
                only a few minutes.
              </p>
            </div>
            <div className="acts">
              <Link to="/interview/create" className="iv-btn iv-btn-primary">
                <Plus size={17} aria-hidden="true" />
                Share your experience
              </Link>
              <Link to={MOCK_INTERVIEW_URL} className="iv-btn iv-btn-ghost">
                Book a mock interview
              </Link>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
