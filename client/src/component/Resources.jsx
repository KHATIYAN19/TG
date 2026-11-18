import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowsSplit, BookOpen, Books, Check, Code, Coffee, Compass, Database, Desktop, GraduationCap, Gauge,
  HardDrives, Infinity as InfinityIcon, Leaf, Lightning, MagnifyingGlass, Plugs, Queue, ShieldCheck, Sparkle, Stack, X,
} from "@phosphor-icons/react";

import { Btn, Page, cx } from "../resume/ui";
import "./resources.css";

/* =====================================================================
   SEO
===================================================================== */
const SITE_URL = "https://www.targettrek.in";
const PAGE_URL = `${SITE_URL}/resources`;
const SITE_NAME = "TargetTrek";
const SEO_TITLE = "Free Software Engineering Resources, System Design & Backend Guides | TargetTrek";
const SEO_DESCRIPTION =
  "Explore free software engineering resources from TargetTrek. Learn SQL, API engineering, REST, GraphQL, system design, API Gateway, caching, load balancing, databases, message queues, rate limiting and practical backend engineering concepts.";
const SEO_KEYWORDS =
  "software engineering resources, SQL tutorial, SQL interview questions, API tutorial, REST API, GraphQL, system design resources, HLD tutorial, API gateway system design, caching system design, load balancing, database system design, message queues, rate limiting, backend engineering, TargetTrek";

const VISITED_KEY = "tt:resources:visited";

/* =====================================================================
   CONTENT
===================================================================== */
const RESOURCES = [
  {
    id: "sql", group: "core", title: "SQL", tag: "Database", level: "Beginner → Advanced", path: "/resources/sql", icon: Database,
    description: "Master SQL from fundamentals to advanced queries, joins, subqueries, CTEs, window functions, indexes, transactions, ACID, locking, optimization and interview problems.",
    topics: ["Joins", "CTEs", "Window functions", "Indexes", "Transactions", "Query tuning"],
    keywords: "sql database joins subqueries cte window functions indexes transactions acid isolation locking optimization interview queries",
  },
  {
    id: "apis", group: "core", title: "API Engineering", tag: "Backend", level: "Beginner → Advanced", path: "/resources/apis", icon: Plugs,
    description: "Learn REST, RESTful API design, HTTP, GraphQL, authentication, authorization, pagination, idempotency, caching, rate limiting, webhooks, OpenAPI and production API architecture.",
    topics: ["REST", "GraphQL", "Auth", "Pagination", "Idempotency", "Webhooks"],
    keywords: "api rest restful graphql http authentication authorization pagination idempotency caching rate limiting webhook openapi backend",
  },
  {
    id: "cache", group: "hld", title: "Caching", tag: "Performance", level: "Intermediate", path: "/resources/hld/cache", icon: Lightning,
    description: "Learn cache-aside, write-through, write-back, TTL, eviction policies, Redis, distributed caching, consistency and cache invalidation.",
    topics: ["Cache-aside", "Write-through", "TTL", "Eviction", "Redis", "Invalidation"],
    keywords: "cache caching redis ttl eviction performance distributed system",
  },
  {
    id: "lb", group: "hld", title: "Load Balancing", tag: "Scalability", level: "Intermediate", path: "/resources/hld/load-balancing", icon: ArrowsSplit,
    description: "Understand load balancers, Layer 4 vs Layer 7, routing algorithms, health checks, sticky sessions and high availability.",
    topics: ["L4 vs L7", "Round robin", "Health checks", "Sticky sessions", "HA"],
    keywords: "load balancing load balancer l4 l7 routing scalability high availability",
  },
  {
    id: "db", group: "hld", title: "Database Design", tag: "Data", level: "Intermediate", path: "/resources/hld/database", icon: HardDrives,
    description: "Learn SQL vs NoSQL decisions, indexing, replication, sharding, transactions, consistency and database scaling trade-offs.",
    topics: ["SQL vs NoSQL", "Replication", "Sharding", "Indexing", "Consistency"],
    keywords: "database sql nosql indexing replication sharding consistency transactions",
  },
  {
    id: "mq", group: "hld", title: "Message Queues", tag: "Async Systems", level: "Intermediate", path: "/resources/hld/message-queue", icon: Queue,
    description: "Understand asynchronous processing, producers, consumers, retries, dead-letter queues, ordering and event-driven systems.",
    topics: ["Producers", "Consumers", "Retries", "DLQ", "Ordering", "Kafka"],
    keywords: "message queue kafka rabbitmq async producer consumer events retries",
  },
  {
    id: "rl", group: "hld", title: "Rate Limiting", tag: "Reliability", level: "Intermediate", path: "/resources/hld/rate-limiting", icon: Gauge,
    description: "Learn token bucket, leaky bucket, fixed window, sliding window and distributed rate limiting with Redis.",
    topics: ["Token bucket", "Leaky bucket", "Sliding window", "Redis"],
    keywords: "rate limit token bucket sliding window leaky bucket redis throttle",
  },
  {
    id: "gw", group: "hld", title: "API Gateway", tag: "Microservices", level: "Intermediate", path: "/resources/hld/api-gateway", icon: ShieldCheck,
    description: "Learn routing, authentication, authorization, throttling, BFF, aggregation, retries, circuit breakers and gateway security.",
    topics: ["Routing", "Auth", "BFF", "Aggregation", "Circuit breaker"],
    keywords: "api gateway routing authentication authorization bff circuit breaker microservices",
  },
];
const BY_ID = Object.fromEntries(RESOURCES.map((r) => [r.id, r]));
const CORE = RESOURCES.filter((r) => r.group === "core");
const HLD = RESOURCES.filter((r) => r.group === "hld");

const FILTERS = [
  { id: "all", label: "All guides" },
  { id: "core", label: "Core engineering" },
  { id: "hld", label: "System design" },
];

const SUGGESTIONS = ["Redis", "Kafka", "Sharding", "REST", "Window functions", "Token bucket"];

const HERO_FACTS = [
  [String(RESOURCES.length), "free guides, live now"],
  ["₹0", "no sign-up, no paywall"],
  ["Diagrams", "request flows for every topic"],
  ["Interview", "questions and trade-offs"],
];

const GOALS = [
  {
    id: "sd", label: "Crack a system design round", icon: Compass,
    blurb: "Follow the path a request takes: in through the edge, across your services, down to the data. That is also the order most interviewers probe in.",
    steps: [["lb", "Spread traffic and survive a dead server."], ["gw", "One front door for auth, routing and throttling."], ["rl", "Protect the system when traffic spikes."], ["cache", "Make reads fast and cheap."], ["db", "Pick, replicate and shard the store."], ["mq", "Move slow work off the request path."]],
    book: true,
  },
  {
    id: "be", label: "Become a stronger backend engineer", icon: Code,
    blurb: "Start with the two things every backend touches every day: the API contract and the database. Then add the patterns that keep them fast under load.",
    steps: [["apis", "Design APIs people can depend on."], ["sql", "Query and model data properly."], ["cache", "Take load off the database."], ["mq", "Process work asynchronously."]],
  },
  {
    id: "sql", label: "Prepare for SQL and data rounds", icon: Database,
    blurb: "Get fluent writing queries first, then learn how databases behave when the data no longer fits on one machine.",
    steps: [["sql", "Joins, CTEs, window functions and indexes."], ["db", "Replication, sharding and consistency."], ["cache", "Where caching helps a slow query, and where it lies."]],
  },
  {
    id: "new", label: "I'm new to distributed systems", icon: GraduationCap,
    blurb: "Four building blocks show up in almost every architecture. Learn what problem each one solves before worrying about the details.",
    steps: [["lb", "Why one server is never enough."], ["cache", "The simplest way to go faster."], ["db", "Where your data actually lives."], ["mq", "Doing work later, safely."]],
  },
];

const FLOW = [
  ["01", "Understand the concept", "Start with the problem a component solves and where it fits in a real architecture.", "~ 10 min"],
  ["02", "See the architecture", "Use diagrams and request flows to see how clients, infrastructure and services connect.", "Diagrams"],
  ["03", "Study trade-offs", "Learn when a solution works well, when it fails and which alternatives an interviewer expects.", "The real test"],
  ["04", "Prepare for interviews", "Revise common questions, failure cases, scaling decisions and production considerations.", "Revision"],
];

const COMING = [
  { title: "Backend Engineering", icon: Stack, description: "Authentication, concurrency, distributed systems, queues, caching and production backend patterns." },
  { title: "Java", icon: Coffee, description: "Fundamentals, OOP, collections, concurrency, JVM concepts and interview-focused topics." },
  { title: "Spring Boot", icon: Leaf, description: "REST APIs, dependency injection, persistence, validation, security and production practices." },
  { title: "DevOps", icon: InfinityIcon, description: "Docker, CI/CD, cloud deployment, monitoring, scaling and practical production operations." },
];

const FAQ = [
  ["Are TargetTrek resources really free?", "Yes. Every guide on this page is free to read, with no sign-up and no paywall. The paid books are optional and go deeper for complete interview preparation."],
  ["Where should I start with system design?", "Start with Load Balancing, then API Gateway, Rate Limiting, Caching, Database Design and Message Queues. That follows a request from the edge of the system down to the data, which is the order most interviews explore."],
  ["Are these guides good enough for interviews?", "They cover the concepts, diagrams, trade-offs and common questions for each topic, which is what most interview rounds test. For full mock designs and end-to-end case studies, use the System Design book alongside them."],
  ["Do I need to know SQL before system design?", "It helps but is not required. Knowing joins, indexes and transactions makes Database Design and Caching easier to follow, so the SQL guide is a good warm-up."],
  ["How often are new resources added?", "The library is growing. Backend Engineering, Java, Spring Boot and DevOps tracks are being written next."],
];

/* =====================================================================
   HOOKS
===================================================================== */
/* which guides this viewer has opened, kept in their own browser only */
function useVisited() {
  const [visited, setVisited] = useState([]);
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(VISITED_KEY) || "[]");
      if (Array.isArray(saved)) setVisited(saved.filter((id) => BY_ID[id]));
    } catch { /* storage blocked: just show nothing as read */ }
  }, []);
  const save = (next) => {
    setVisited(next);
    try { window.localStorage.setItem(VISITED_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };
  const mark = useCallback((id) => setVisited((prev) => {
    if (prev.includes(id)) return prev;
    const next = [...prev, id];
    try { window.localStorage.setItem(VISITED_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    return next;
  }), []);
  return { visited, mark, reset: () => save([]) };
}

/* the site toggle sets html.dark; the CSS follows it on its own, this only keeps the browser bar colour in step */
function useIsDark() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const read = () => setDark(document.documentElement.classList.contains("dark"));
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

const matches = (r, q) => [r.title, r.description, r.tag, r.keywords, r.topics.join(" ")].join(" ").toLowerCase().includes(q);
const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

/* =====================================================================
   HEAD
===================================================================== */
function Head({ dark }) {
  const schema = useMemo(() => JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", "@id": `${PAGE_URL}#webpage`, url: PAGE_URL, name: SEO_TITLE, description: SEO_DESCRIPTION, isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL } },
      { "@type": "BreadcrumbList", "@id": `${PAGE_URL}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Resources", item: PAGE_URL },
      ] },
      ...[["core-resources", "Core Engineering Resources", CORE], ["hld-resources", "System Design HLD Resources", HLD]].map(([id, name, list]) => ({
        "@type": "ItemList", "@id": `${PAGE_URL}#${id}`, name, numberOfItems: list.length,
        itemListElement: list.map((r, i) => ({ "@type": "ListItem", position: i + 1, name: r.title, url: `${SITE_URL}${r.path}` })),
      })),
      { "@type": "FAQPage", "@id": `${PAGE_URL}#faq`, mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ],
  }), []);

  return (
    <Helmet>
      <meta name="keywords" content={SEO_KEYWORDS} />
      <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      <meta name="googlebot" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      <meta name="theme-color" content={dark ? "#0a1312" : "#f6f8f7"} />
      <link rel="canonical" href={PAGE_URL} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={SEO_TITLE} />
      <meta property="og:description" content={SEO_DESCRIPTION} />
      <meta property="og:url" content={PAGE_URL} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={SEO_TITLE} />
      <meta name="twitter:description" content={SEO_DESCRIPTION} />
      <script type="application/ld+json">{schema}</script>
    </Helmet>
  );
}

/* one section: eyebrow, h2, optional lead, then content (same shape as the Resume Lab landing) */
function Section({ id, eyebrow, title, lead, tone = "", children }) {
  return (
    <section id={id} className={cx("rl-sec", tone && `rl-sec-${tone}`)} aria-labelledby={`${id}-h`}>
      <div className="rv-shell">
        <header className="rl-sec-head">
          {eyebrow && <span className="rl-eyebrow">{eyebrow}</span>}
          <h2 id={`${id}-h`} className="rl-h2">{title}</h2>
          {lead && <p className="rl-lead">{lead}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

/* =====================================================================
   HERO: a request's path through a system, every box a guide
===================================================================== */
function MapNode({ id, label, sub, visited, onOpen, plain = false, icon: PlainIcon }) {
  if (plain) {
    return (
      <div className="rs-node is-plain">
        <span className="rs-node-ico"><PlainIcon size={18} weight="duotone" aria-hidden /></span>
        <span className="rs-node-txt"><b>{label}</b><small>{sub}</small></span>
      </div>
    );
  }
  const r = BY_ID[id];
  const Icon = r.icon;
  return (
    <Link to={r.path} onClick={() => onOpen(id)} className={cx("rs-node", visited.includes(id) && "is-read")} aria-label={`${label}: open the ${r.title} guide`}>
      <span className="rs-node-ico"><Icon size={18} weight="duotone" aria-hidden /></span>
      <span className="rs-node-txt"><b>{label}</b><small>{sub}</small></span>
      <ArrowRight className="rs-node-go" size={15} weight="bold" aria-hidden />
    </Link>
  );
}

function SystemMap({ visited, onOpen }) {
  const p = { visited, onOpen };
  return (
    <figure className="rs-map" aria-label="A request's path through a typical system. Each box opens its guide.">
      <div className="rl-paper-bar"><Sparkle size={16} weight="fill" aria-hidden /><span>how-a-request-flows.excalidraw</span><span className="rl-paper-pg rv-mono">tap a box</span></div>
      <div className="rs-map-body">
        <p className="rs-map-k">One request, six guides</p>
        <MapNode plain icon={Desktop} label="Client" sub="browser · mobile app" />
        <span className="rs-wire is-live" aria-hidden />
        <MapNode id="lb" label="Load balancer" sub="L4 / L7 · health checks" {...p} />
        <span className="rs-wire is-live" aria-hidden />
        <MapNode id="gw" label="API gateway" sub="auth · routing · BFF" {...p} />
        <span className="rs-note">1,000 req/s from one IP? Throttle here.</span>
        <MapNode id="rl" label="Rate limiter" sub="token bucket · Redis" {...p} />
        <span className="rs-wire is-live" aria-hidden />
        <MapNode id="apis" label="Your service" sub="REST · GraphQL · idempotency" {...p} />
        <span className="rs-wire" aria-hidden />
        <div className="rs-map-split">
          <MapNode id="cache" label="Cache" sub="cache-aside" {...p} />
          <MapNode id="db" label="Database" sub="replicas · shards" {...p} />
          <MapNode id="mq" label="Queue" sub="async · DLQ" {...p} />
        </div>
        <span className="rs-note left">Cache miss? Then the DB. Slow job? Queue it.</span>
      </div>
      <figcaption className="rl-paper-strip">
        <div><span className="rl-strip-k">Guides</span><b className="rv-mono" style={{ color: "var(--rv-brand)" }}>{RESOURCES.length}</b></div>
        <div><span className="rl-strip-k">You&rsquo;ve read</span><b className="rv-mono" style={{ color: "var(--rv-brand)" }}>{visited.length}<small>/{RESOURCES.length}</small></b></div>
        <div className="rl-strip-wide"><span className="rl-strip-k">Coming next</span><span className="rl-strip-chips">{COMING.slice(0, 3).map((c) => <i key={c.title} style={{ background: "var(--rv-brand-soft)", color: "var(--rv-brand)" }}>{c.title.split(" ")[0]}</i>)}</span></div>
      </figcaption>
    </figure>
  );
}

const PAGE_NAV = [["library", "Library"], ["start", "Where to start"], ["method", "How to study"], ["books", "Resources vs books"], ["coming", "Coming soon"], ["faq", "FAQ"]];

function Hero({ visited, onOpen }) {
  return (
    <header className="rl-hero">
      <div className="rv-shell rl-hero-grid">
        <div className="rl-hero-copy">
          <span className="rl-pill"><span className="rl-dot" />Free engineering library by TargetTrek</span>
          <h1 className="rl-h1">Learn backend and system design, <span className="rl-mark">one concept at a time.</span></h1>
          <p className="rl-lead">Practical, interview-focused guides on SQL, APIs, caching, load balancing, databases, queues and more. Every guide explains the problem, draws the architecture and lays out the trade-offs.</p>
          <div className="rl-hero-btns">
            <Btn size="lg" onClick={() => scrollTo("library")}>Browse the library <ArrowRight size={17} weight="bold" aria-hidden /></Btn>
            <Btn size="lg" variant="ghost" onClick={() => scrollTo("start")}><Compass size={17} weight="bold" aria-hidden />Help me pick</Btn>
          </div>
          <p className="rl-hero-alt">Want the complete prep? <Link to="/book/system-design/hld" className="rl-textlink">Read the System Design book <ArrowRight size={14} weight="bold" aria-hidden /></Link></p>
          <dl className="rl-facts">
            {HERO_FACTS.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
        <div className="rs-hero-art"><SystemMap visited={visited} onOpen={onOpen} /></div>
      </div>
      <nav className="rv-shell rl-jump" aria-label="On this page">
        <span>On this page</span>
        <div>{PAGE_NAV.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</div>
      </nav>
    </header>
  );
}

/* =====================================================================
   LIBRARY: search, filter, cards
===================================================================== */
function ResourceCard({ r, i, read, query, onOpen }) {
  const Icon = r.icon;
  return (
    <article className={cx("rs-card", r.group === "core" && "is-core")} style={{ "--i": i }}>
      <div className="rs-card-top">
        <span className="rs-card-ico"><Icon size={24} weight="duotone" aria-hidden /></span>
        <span className="rs-card-badges">
          {r.group === "core" && <span className="rs-badge mark">Complete track</span>}
          {read ? <span className="rs-badge brand"><Check size={11} weight="bold" aria-hidden /> Read</span> : <span className="rs-badge">{r.tag}</span>}
        </span>
      </div>
      <h3><Link to={r.path} onClick={() => onOpen(r.id)}>{r.title}</Link></h3>
      <p>{r.description}</p>
      <ul className="rs-topics" aria-label="Topics covered">
        {r.topics.map((t) => <li key={t} className={query && t.toLowerCase().includes(query) ? "hit" : ""}>{t}</li>)}
      </ul>
      <div className="rs-card-foot">
        <span>{read ? "Read again" : "Start reading"}<br /><small>{r.level}</small></span>
        <span className="rs-arrow" aria-hidden><ArrowRight size={16} weight="bold" /></span>
      </div>
    </article>
  );
}

function Library({ visited, onOpen, onReset }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const inputRef = useRef(null);
  const query = search.trim().toLowerCase();

  /* "/" jumps to the search box, Esc clears it */
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (e.key === "/" && tag !== "input" && tag !== "textarea" && !e.target?.isContentEditable) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const inGroup = (r, f) => f === "all" || r.group === f;
  const list = RESOURCES.filter((r) => inGroup(r, filter) && (!query || matches(r, query)));
  const countFor = (f) => RESOURCES.filter((r) => inGroup(r, f) && (!query || matches(r, query))).length;
  const pct = Math.round((visited.length / RESOURCES.length) * 100);

  return (
    <Section id="library" eyebrow="The library" title="Every guide, free to read" lead="Two complete core tracks and six system design deep-dives. Search by any concept, from Redis to window functions.">
      <div className="rs-toolbar">
        <div className="rs-search">
          <MagnifyingGlass size={19} weight="bold" aria-hidden />
          <label htmlFor="rs-q" className="rl-sr">Search resources</label>
          <input
            id="rs-q" ref={inputRef} type="search" className="rv-input" value={search} autoComplete="off"
            placeholder="Search caching, Kafka, joins, sharding…"
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") { setSearch(""); e.currentTarget.blur(); } }}
          />
          <span className="rs-search-end">
            {search ? <button type="button" className="rs-clear" onClick={() => { setSearch(""); inputRef.current?.focus(); }} aria-label="Clear search"><X size={15} weight="bold" /></button>
              : <kbd className="rs-kbd rv-mono">/</kbd>}
          </span>
        </div>
        <div className="rs-filters" role="group" aria-label="Filter guides">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}<span className="rv-mono">{countFor(f.id)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rs-status" aria-live="polite">
        <span>Showing <b>{list.length}</b> of {RESOURCES.length} guides{query && <> for “<b>{search.trim()}</b>”</>}</span>
        {visited.length > 0 && (
          <span className="rs-progress">
            <span className="rl-meter" aria-hidden><em style={{ width: `${pct}%` }} /></span>
            <span><b>{visited.length}</b> of {RESOURCES.length} read</span>
            <button type="button" className="rs-reset" onClick={onReset}>Reset</button>
          </span>
        )}
      </div>

      {list.length ? (
        <div className="rs-grid">
          {list.map((r, i) => <ResourceCard key={r.id} r={r} i={i} read={visited.includes(r.id)} query={query} onOpen={onOpen} />)}
        </div>
      ) : (
        <div className="rs-empty">
          <MagnifyingGlass size={34} weight="duotone" aria-hidden />
          <b>Nothing matches “{search.trim()}” yet</b>
          <p>Try a broader word, or one of these:</p>
          <div className="rs-empty-sugg">
            {SUGGESTIONS.map((s) => <button key={s} type="button" className="rl-tag" onClick={() => { setSearch(s); setFilter("all"); }}>{s}</button>)}
          </div>
        </div>
      )}
    </Section>
  );
}

/* =====================================================================
   WHERE TO START: pick a goal, get an ordered path
===================================================================== */
function StartHere({ visited, onOpen }) {
  const [goalId, setGoalId] = useState(GOALS[0].id);
  const goal = GOALS.find((g) => g.id === goalId);
  const GoalIcon = goal.icon;
  const done = goal.steps.filter(([id]) => visited.includes(id)).length;

  return (
    <Section id="start" tone="tint" eyebrow="Where to start" title="Tell us the goal. We'll give you the order." lead="Pick what you're preparing for and follow the guides top to bottom. Each one builds on the one before it.">
      <div className="rl-explorer">
        <div className="rl-flist" role="tablist" aria-label="Your goal">
          {GOALS.map((g) => {
            const Icon = g.icon;
            return (
              <button key={g.id} type="button" role="tab" id={`goal-${g.id}`} aria-selected={g.id === goalId} aria-controls="goal-panel" className="rl-ftab" onClick={() => setGoalId(g.id)}>
                <Icon size={19} weight="duotone" aria-hidden /><span>{g.label}</span><small>{g.steps.length}</small>
              </button>
            );
          })}
        </div>
        <div key={goal.id} id="goal-panel" role="tabpanel" aria-labelledby={`goal-${goal.id}`} className="rl-fpanel">
          <div className="rl-fpanel-copy">
            <div className="rl-fpanel-top">
              <span className="rl-fico"><GoalIcon size={24} weight="duotone" aria-hidden /></span>
              <span className="rl-fmeta">{done} of {goal.steps.length} done</span>
            </div>
            <h3 className="rl-h3">{goal.label}</h3>
            <p className="rl-fpitch">{goal.blurb}</p>
            <p className="rl-fwhere"><b>Tip:</b> after each guide, close it and try to draw the diagram from memory. If you can explain the trade-offs out loud, move on.</p>
          </div>
          <ol className="rs-path-list rl-fpanel-art">
            {goal.steps.map(([id, why], n) => {
              const r = BY_ID[id];
              const read = visited.includes(id);
              return (
                <li key={id}>
                  <Link to={r.path} onClick={() => onOpen(id)} className={cx("rs-path-item", read && "is-read")}>
                    <span className="rs-path-n rv-mono">{read ? <Check size={14} weight="bold" aria-label="read" /> : n + 1}</span>
                    <span className="rs-path-txt"><b>{r.title}</b><small>{why}</small></span>
                    <ArrowRight size={16} weight="bold" aria-hidden />
                  </Link>
                </li>
              );
            })}
            {goal.book && (
              <li>
                <Link to="/book/system-design/hld" className="rs-path-item is-book">
                  <span className="rs-path-n rv-mono">+</span>
                  <span className="rs-path-txt"><b>Then: full case studies</b><small>Put it all together with end-to-end designs in the System Design book.</small></span>
                  <ArrowRight size={16} weight="bold" aria-hidden />
                </Link>
              </li>
            )}
          </ol>
        </div>
      </div>
    </Section>
  );
}

/* =====================================================================
   PAGE
===================================================================== */
export default function Resources() {
  const { visited, mark, reset } = useVisited();
  const dark = useIsDark();

  return (
    <Page title={SEO_TITLE} description={SEO_DESCRIPTION} className="rl rs">
      <Head dark={dark} />
      <main>
        <Hero visited={visited} onOpen={mark} />
        <Library visited={visited} onOpen={mark} onReset={reset} />
        <StartHere visited={visited} onOpen={mark} />

        <Section id="method" eyebrow="How to study" title="Read it once. Understand it for good." lead="Every guide follows the same four steps, so you always know what to look for and when you're ready to move on.">
          <ol className="rl-steps">
            {FLOW.map(([n, title, text, chip]) => (
              <li key={n}>
                <span className="rl-step-n rv-mono">{n}</span>
                <h3>{title}</h3>
                <span className="rl-step-t">{chip}</span>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="books" tone="tint" eyebrow="Resources vs books" title="Free guides for one concept. Books for the whole interview." lead="Use the resources when you need to understand a single topic fast. Pick up a book when you want a complete, structured path.">
          <div className="rl-vs">
            <div className="rl-vs-card">
              <div className="rl-vs-top"><BookOpen size={24} weight="duotone" aria-hidden /><h3>Free resources</h3><span>₹0</span></div>
              <ul className="rs-vs-list">
                {["One concept per guide, read in a sitting", "Diagrams, request flows and trade-offs", "Common interview questions per topic", "Great for revision the night before"].map((t) => <li key={t}><Check size={16} weight="bold" aria-hidden />{t}</li>)}
              </ul>
              <div className="rs-vs-cta"><Btn variant="ghost" onClick={() => scrollTo("library")}>Browse the library</Btn></div>
            </div>
            <div className="rl-vs-card is-human">
              <div className="rl-vs-top"><Books size={24} weight="duotone" aria-hidden /><h3>TargetTrek books</h3><span>Complete prep</span></div>
              <ul className="rs-vs-list">
                {["End-to-end system design case studies", "HLD, LLD, Java, Spring Boot, SQL and more", "Structured chapters from basics to advanced", "Interview answers you can rehearse"].map((t) => <li key={t}><Check size={16} weight="bold" aria-hidden />{t}</li>)}
              </ul>
              <div className="rs-vs-cta">
                <Btn as={Link} to="/book/system-design/hld">System Design book <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
                <Btn as={Link} to="/books" variant="ghost">All books</Btn>
              </div>
            </div>
          </div>
        </Section>

        <Section id="coming" eyebrow="Growing library" title="More tracks are being written" lead="The next four tracks follow the same format: concept, architecture, trade-offs, interview questions.">
          <ul className="rs-soon">
            {COMING.map(({ title, icon: Icon, description }) => (
              <li key={title}>
                <div className="rs-soon-top"><Icon size={26} weight="duotone" aria-hidden /><span className="rs-badge mark">Coming soon</span></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ul>
        </Section>

        <section id="faq" className="rl-sec rl-sec-tint" aria-labelledby="faq-h">
          <div className="rv-shell rl-faq-grid">
            <div className="rl-faq-side">
              <span className="rl-eyebrow">FAQ</span>
              <h2 id="faq-h" className="rl-h2">Questions, answered</h2>
              <p className="rl-lead">Still unsure where to begin? Use <a href="#start" className="rl-textlink">Where to start</a> and follow the order.</p>
            </div>
            <div className="rl-faq-list">
              {FAQ.map(([q, a], i) => (
                <details key={q} className="rl-faq" open={i === 0}>
                  <summary><h3>{q}</h3></summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="rl-sec" aria-labelledby="final-h">
          <div className="rv-shell">
            <div className="rl-final">
              <span className="rl-eyebrow" style={{ color: "#5eead4" }}>Start now, it&rsquo;s free</span>
              <h2 id="final-h" className="rl-h2">Ten minutes from now, you could <span className="rl-mark">explain caching</span> to an interviewer.</h2>
              <p>Open your first guide. No account, no paywall, just the concept, the diagram and the trade-offs.</p>
              <div className="rl-hero-btns">
                <Btn as={Link} size="lg" to={BY_ID.cache.path} onClick={() => mark("cache")}>Start with Caching <ArrowRight size={17} weight="bold" aria-hidden /></Btn>
                <Btn size="lg" variant="ghost" onClick={() => scrollTo("library")}>See every guide</Btn>
              </div>
              <p className="rs-also">Applying for jobs soon? <Link to="/resume-review">Get your resume reviewed</Link></p>
            </div>
          </div>
        </section>
      </main>
    </Page>
  );
}
