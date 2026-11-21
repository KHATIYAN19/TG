import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowRight, ArrowsSplit, BookOpen, Brain, CheckCircle, Clock, Cloud, Database, Gauge, Globe, HardDrives, Lightning, Lock, MagnifyingGlass, Queue,
  ShieldCheck, SquaresFour, TreeStructure, Users, X,
} from "@phosphor-icons/react";

import { Btn, Page, cx } from "../resume/ui";
import { LOGO, SITE } from "../resources/kit/seo";
import "../resources/kit/kit.css";

/* =====================================================================
   SYSTEM DESIGN (HLD) RESOURCES  (/resources/hld)
   The hub for the six system design guides, in the order a request
   travels: edge → services → data → async work.
===================================================================== */
const PATH = "/resources/hld";
const URL = `${SITE}${PATH}`;
const BOOK = "/book/system-design/hld";
const UPDATED = "2026-11-18";
const VISITED_KEY = "tt:resources:visited";

const SEO = {
  title: "Free System Design (HLD) Interview Guides | Target Trek",
  description: "Free high-level design guides for system design interviews: load balancing, API gateway, rate limiting, caching, databases and message queues, with diagrams.",
  keywords: "system design resources, HLD, high level design, system design interview preparation, load balancing, api gateway, rate limiting, caching, database design, message queue, distributed systems, backend architecture",
};

const ANSWER = "High level design (HLD) is the big picture of a software system: which components it has (clients, load balancers, gateways, services, caches, databases, queues), what each one is responsible for, and how requests and data flow between them. A system design interview tests whether you can build that picture from vague requirements, size it for real traffic and defend the trade-offs.";

/* the six live guides, in the recommended order */
const TOPICS = [
  { id: "lb", title: "Load Balancing", path: "/resources/hld/load-balancing", icon: ArrowsSplit, cat: "Scalability", mins: 30, level: "Fundamental", why: "Why one server is never enough, and how traffic is spread across many.", chips: ["L4 vs L7", "Round robin", "Least connections", "Health checks", "Sticky sessions"], keys: "load balancer round robin least connections l4 l7 health check sticky session failover high availability" },
  { id: "gw", title: "API Gateway", path: "/resources/hld/api-gateway", icon: ShieldCheck, cat: "Architecture", mins: 35, level: "Intermediate", why: "One front door for routing, auth, throttling and aggregation across services.", chips: ["Routing", "Auth", "BFF", "Aggregation", "Circuit breaker"], keys: "api gateway routing authentication authorization throttling aggregation bff circuit breaker microservices" },
  { id: "rl", title: "Rate Limiting", path: "/resources/hld/rate-limiting", icon: Gauge, cat: "Reliability", mins: 35, level: "Intermediate", why: "Protect the system from spikes and abuse, and answer with HTTP 429.", chips: ["Token bucket", "Leaky bucket", "Sliding window", "Redis", "429"], keys: "rate limiter token bucket leaky bucket fixed window sliding window redis 429 throttling burst" },
  { id: "cache", title: "Caching", path: "/resources/hld/cache", icon: Lightning, cat: "Performance", mins: 25, level: "Intermediate", why: "Make reads fast and cheap without serving wrong data.", chips: ["Cache-aside", "Write-through", "TTL", "Stampede", "Redis"], keys: "cache caching redis ttl cache aside write through write back eviction lru lfu stampede hot key invalidation" },
  { id: "db", title: "Database Design", path: "/resources/hld/database", icon: Database, cat: "Data", mins: 40, level: "Fundamental", why: "Choose the store, then replicate and shard it as data grows.", chips: ["SQL vs NoSQL", "Indexing", "Replication", "Sharding", "Consistency"], keys: "database sql nosql index replication sharding partitioning transaction acid consistency cap" },
  { id: "mq", title: "Message Queues", path: "/resources/hld/message-queue", icon: Queue, cat: "Async systems", mins: 35, level: "Intermediate", why: "Move slow work off the request path, safely and in order.", chips: ["Kafka", "RabbitMQ", "Consumer groups", "Retries", "DLQ"], keys: "message queue kafka rabbitmq producer consumer consumer group partition ordering retry dead letter queue dlq pub sub event driven" },
];
const CATS = ["All", ...new Set(TOPICS.map((t) => t.cat))];

const COMING = [
  ["CDN", "Edge locations, origin shielding, cache keys and invalidation for global users.", Globe],
  ["Consistent hashing", "Hash rings, virtual nodes and moving the fewest keys when nodes change.", TreeStructure],
  ["Database sharding", "Shard keys, routing, hot partitions and resharding without downtime.", HardDrives],
  ["Distributed locking", "Leases, fencing tokens and why Redis locks need a backstop.", Lock],
  ["CAP theorem", "Consistency vs availability when the network splits, in practice.", Brain],
  ["Idempotency", "Idempotency keys and safe retries for payments and bookings.", CheckCircle],
  ["Service discovery", "Registries, DNS discovery and health-checked endpoints.", Cloud],
  ["Microservices", "Service boundaries, data ownership and when not to split.", SquaresFour],
  ["Distributed transactions", "Two-phase commit, sagas and compensating actions.", TreeStructure],
];

const FRAMEWORK = [
  ["Clarify functional requirements", "What must the system do? Pin down the 3–5 core use cases and say what's out of scope.", "5 min"],
  ["Non-functional requirements", "Scale, latency targets, availability, consistency and durability. These drive every later choice.", "3 min"],
  ["Estimate traffic and storage", "Requests per second (peak, not average), read/write ratio, data per day and per year.", "5 min"],
  ["Define APIs and data model", "The main endpoints and the core entities with their keys. This exposes access patterns early.", "5 min"],
  ["Draw the high-level architecture", "Client → load balancer → gateway → services → cache → database → queue. Walk one request through it.", "10 min"],
  ["Find bottlenecks and scale", "Where does it break at 10× traffic? Cache, replicate, shard, queue and say why for each.", "10 min"],
  ["Failures and trade-offs", "What happens when a node, a zone or the cache dies? What did you trade for what?", "7 min"],
];

const PILLARS = [
  ["Scalability", "Keep working as traffic grows 10× and 100×.", ArrowsSplit],
  ["Data", "Store, replicate and partition data correctly.", Database],
  ["Distributed systems", "Coordinate services that fail independently.", Cloud],
  ["Reliability", "Stay available and correct when parts break.", ShieldCheck],
];

const FAQ = [
  { q: "What is high level design (HLD) in software engineering?", a: "High level design describes the major components of a system and how they interact: clients, load balancers, API gateways, services, caches, databases and message queues, plus the request and data flows between them. Low level design (LLD) then goes inside one component: classes, interfaces and algorithms." },
  { q: "What should I study for a system design interview?", a: "Learn the core building blocks first: load balancing, API gateways, rate limiting, caching, databases (replication, sharding, consistency) and message queues. Then practise a repeatable framework (requirements, estimates, APIs, architecture, scaling, failures) on full problems like a URL shortener, chat app or ticket booking system." },
  { q: "In what order should I learn system design topics?", a: "Follow a request from the edge to the data: load balancing, then API gateway, rate limiting, caching, database design and finally message queues for asynchronous work. That is also the order most interviewers probe in." },
  { q: "How should I approach an HLD interview question?", a: "Clarify functional and non-functional requirements, estimate traffic and storage, define the APIs and data model, draw the high-level architecture and walk one request through it, then scale the bottlenecks and discuss failures and trade-offs. Budget roughly 45 minutes across those seven steps." },
  { q: "Is HLD asked for freshers?", a: "Usually lightly. Freshers and juniors mostly face DSA and LLD, but many product companies include a basic design discussion. From about two to three years of experience, a dedicated system design round is standard." },
  { q: "Are these system design guides free?", a: "Yes. Every guide is free to read with no sign-up. The Mastering System Design (HLD) book is optional and adds complete end-to-end interview designs." },
];

/* ============================ head ============================ */
function Head() {
  const graph = [
    { "@type": "Organization", "@id": `${SITE}/#organization`, name: "Target Trek", url: SITE, logo: LOGO },
    {
      "@type": "CollectionPage", "@id": `${URL}#webpage`, url: URL, name: SEO.title, description: SEO.description, inLanguage: "en-IN",
      isPartOf: { "@type": "WebSite", "@id": `${SITE}/#website`, url: SITE, name: "Target Trek" }, dateModified: UPDATED,
      breadcrumb: { "@id": `${URL}#breadcrumb` }, mainEntity: { "@id": `${URL}#guides` },
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".rk-answer"] },
      about: ["High level design", "System design", "Distributed systems", "Scalability"].map((name) => ({ "@type": "Thing", name })),
    },
    { "@type": "BreadcrumbList", "@id": `${URL}#breadcrumb`, itemListElement: [["Target Trek", ""], ["Resources", "/resources"], ["System design", PATH]].map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${SITE}${p}` })) },
    {
      "@type": "ItemList", "@id": `${URL}#guides`, name: "System design guides, in learning order", numberOfItems: TOPICS.length, itemListOrder: "https://schema.org/ItemListOrderAscending",
      itemListElement: TOPICS.map((t, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}${t.path}`, name: t.title, description: t.why })),
    },
    {
      "@type": "HowTo", "@id": `${URL}#framework`, name: "How to answer a system design interview question", totalTime: "PT45M",
      step: FRAMEWORK.map(([name, text], i) => ({ "@type": "HowToStep", position: i + 1, name, text, url: `${URL}#framework` })),
    },
    { "@type": "FAQPage", "@id": `${URL}#faq`, mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ];
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return (
    <Helmet>
      <html lang="en-IN" />
      <title>{SEO.title}</title>
      <meta name="description" content={SEO.description} />
      <meta name="keywords" content={SEO.keywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={URL} />
      <link rel="alternate" hrefLang="en-IN" href={URL} />
      <link rel="alternate" hrefLang="x-default" href={URL} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Target Trek" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={SEO.title} />
      <meta property="og:description" content={SEO.description} />
      <meta property="og:url" content={URL} />
      <meta property="og:image" content={LOGO} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={SEO.title} />
      <meta name="twitter:description" content={SEO.description} />
      <meta name="twitter:image" content={LOGO} />
      <script type="application/ld+json">{json}</script>
    </Helmet>
  );
}

/* ============================ hooks ============================ */
function useVisited() {
  const [v, setV] = useState([]);
  useEffect(() => {
    try { const s = JSON.parse(window.localStorage.getItem(VISITED_KEY) || "[]"); if (Array.isArray(s)) setV(s); } catch { /* ignore */ }
  }, []);
  return v;
}
function useNavOffset(ref) {
  useEffect(() => {
    const nav = document.querySelector(".tt-nav");
    const set = () => ref.current?.style.setProperty("--rk-nav", `${nav ? Math.round(nav.getBoundingClientRect().height) : 0}px`);
    set();
    const ro = nav && typeof ResizeObserver !== "undefined" ? new ResizeObserver(set) : null;
    ro?.observe(nav);
    window.addEventListener("resize", set);
    return () => { ro?.disconnect(); window.removeEventListener("resize", set); };
  }, [ref]);
}

const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

function Section({ id, eyebrow, title, lead, tint, children }) {
  return (
    <section id={id} className={cx("rl-sec rkh-sec", tint && "rl-sec-tint")} aria-labelledby={`${id}-h`}>
      <div className="rk-shell">
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

/* ============================ hero: the path a request takes ============================ */
function RequestMap({ visited }) {
  const layer = (label, ids) => (
    <div className="rkh-layer">
      <span className="rkh-layer-k">{label}</span>
      <div>{ids.map((id) => { const t = TOPICS.find((x) => x.id === id); const I = t.icon; return (
        <Link key={id} to={t.path} className={cx("rkh-node", visited.includes(id) && "is-read")}>
          <I size={18} weight="duotone" aria-hidden /><b>{t.title}</b><ArrowRight size={14} weight="bold" aria-hidden />
        </Link>
      ); })}</div>
    </div>
  );
  return (
    <figure className="rkh-map" aria-label="The path a request takes through a system, with a guide for each building block">
      <figcaption>The path a request takes</figcaption>
      <div className="rkh-client"><Users size={18} weight="duotone" aria-hidden /><b>Users</b><small>web · mobile</small></div>
      <i className="rkh-wire" aria-hidden />
      {layer("Edge", ["lb", "gw", "rl"])}
      <i className="rkh-wire" aria-hidden />
      {layer("Data", ["cache", "db"])}
      <i className="rkh-wire" aria-hidden />
      {layer("Async", ["mq"])}
    </figure>
  );
}

function Hero({ visited }) {
  const read = TOPICS.filter((t) => visited.includes(t.id)).length;
  const next = TOPICS.find((t) => !visited.includes(t.id));
  return (
    <header className="rk-hero">
      <div className="rk-shell">
        <nav aria-label="Breadcrumb">
          <ol className="rk-crumbs"><li><Link to="/">Home</Link></li><li><Link to="/resources">Resources</Link></li><li><span aria-current="page">System design</span></li></ol>
        </nav>
        <div className="rk-hero-grid">
          <div className="rk-hero-copy">
            <div className="rk-tags"><span className="rk-tag is-brand">High level design</span><span className="rk-tag">Free</span><span className="rk-tag">Interview-focused</span></div>
            <h1 className="rk-h1">System design, <span className="rl-mark">one building block</span> at a time</h1>
            <p className="rk-sub">Six free guides that follow a request from the edge of the system down to the data, each with diagrams, trade-offs, interview questions with answers, and a quiz.</p>
            <p className="rk-answer"><b>What is HLD?</b>{ANSWER}</p>
            <div className="rk-btns">
              {next
                ? <Btn as={Link} to={next.path} size="lg">{read ? "Continue with" : "Start with"} {next.title} <ArrowRight size={17} weight="bold" aria-hidden /></Btn>
                : <Btn size="lg" onClick={() => go("framework")}>Practise the framework <ArrowRight size={17} weight="bold" aria-hidden /></Btn>}
              <Btn size="lg" variant="ghost" onClick={() => go("path")}>See all guides</Btn>
            </div>
            <dl className="rl-facts">
              <div><dt>{TOPICS.length} guides</dt><dd>live now, free</dd></div>
              <div><dt>{TOPICS.reduce((s, t) => s + t.mins, 0) / 60 | 0}+ hours</dt><dd>of reading in total</dd></div>
              <div><dt>{read}/{TOPICS.length}</dt><dd>read on this device</dd></div>
              <div><dt>Q&amp;A</dt><dd>answers in every guide</dd></div>
            </dl>
          </div>
          <RequestMap visited={visited} />
        </div>
      </div>
    </header>
  );
}

/* ============================ learning path ============================ */
function LearningPath({ visited }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return TOPICS.map((t, i) => ({ ...t, n: i + 1 })).filter((t) => (cat === "All" || t.cat === cat) && (!s || [t.title, t.why, t.cat, t.keys, t.chips.join(" ")].join(" ").toLowerCase().includes(s)));
  }, [q, cat]);
  const clear = () => { setQ(""); setCat("All"); };

  return (
    <Section id="path" eyebrow="Learning path" title="Six guides, in the order to read them" lead="Each one takes 25 to 40 minutes. Read them in order the first time; after that, jump straight to what your interview needs.">
      <div className="rkh-tools">
        <label className="rkh-search">
          <MagnifyingGlass size={18} weight="bold" aria-hidden />
          <span className="rl-sr">Search system design guides</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: Kafka, sharding, token bucket…" />
          {q && <button type="button" onClick={() => setQ("")} aria-label="Clear search"><X size={16} weight="bold" /></button>}
        </label>
        <div className="rkh-cats" role="group" aria-label="Filter by area">
          {CATS.map((c) => <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
        </div>
      </div>
      <p className="rkh-count" aria-live="polite">{list.length === TOPICS.length ? `All ${TOPICS.length} guides` : `${list.length} of ${TOPICS.length} guides`}</p>
      {list.length ? (
        <ol className="rkh-list">
          {list.map((t) => {
            const I = t.icon;
            const read = visited.includes(t.id);
            return (
              <li key={t.id}>
                <Link to={t.path} className={cx("rkh-card", read && "is-read")}>
                  <span className="rkh-n rv-mono">{String(t.n).padStart(2, "0")}</span>
                  <span className="rkh-ico"><I size={24} weight="duotone" aria-hidden /></span>
                  <span className="rkh-body">
                    <span className="rkh-meta"><em>{t.cat}</em><span><Clock size={13} weight="bold" aria-hidden />{t.mins} min</span><span>{t.level}</span>{read && <strong>Read</strong>}</span>
                    <h3>{t.title}</h3>
                    <p>{t.why}</p>
                    <span className="rkh-chips">{t.chips.map((c) => <i key={c}>{c}</i>)}</span>
                  </span>
                  <span className="rkh-go" aria-hidden><ArrowRight size={20} weight="bold" /></span>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="rl-empty"><p>No guide matches “{q}”.</p><Btn variant="ghost" onClick={clear}>Show all guides</Btn></div>
      )}
    </Section>
  );
}

/* ============================ page ============================ */
export default function HLDResources() {
  const ref = useRef(null);
  useNavOffset(ref);
  const visited = useVisited();

  return (
    <div ref={ref} className="rk-root">
      <Page title={SEO.title} description={SEO.description} className="rk rkh">
        <Head />
        <Hero visited={visited} />
        <main>
          <LearningPath visited={visited} />

          <Section id="pillars" eyebrow="What you're being tested on" title="Every design answer is judged on four things" tint>
            <div className="rkh-pillars">
              {PILLARS.map(([t, d, I]) => <div key={t}><I size={24} weight="duotone" aria-hidden /><h3>{t}</h3><p>{d}</p></div>)}
            </div>
          </Section>

          <Section id="framework" eyebrow="Interview framework" title="How to answer any system design question in 45 minutes" lead="Use the same seven steps every time. Interviewers grade the process as much as the final diagram.">
            <ol className="rkh-frame">
              {FRAMEWORK.map(([t, d, time], i) => (
                <li key={t}>
                  <span className="rv-mono">{String(i + 1).padStart(2, "0")}</span>
                  <div><h3>{t}</h3><p>{d}</p></div>
                  <em>{time}</em>
                </li>
              ))}
            </ol>
            <aside className="rk-call interview" role="note">
              <Brain size={22} weight="duotone" aria-hidden />
              <div><b>Interview tip · think out loud</b><div>Say what you're assuming and why before you draw. “I'll assume 10 million daily users and a 100:1 read/write ratio, so reads dominate and caching matters” earns more credit than a perfect diagram drawn in silence.</div></div>
            </aside>
          </Section>

          <Section id="coming" eyebrow="Coming next" title="More guides on the way" tint>
            <ul className="rkh-coming">
              {COMING.map(([t, d, I]) => <li key={t}><I size={20} weight="duotone" aria-hidden /><div><h3>{t}</h3><p>{d}</p></div></li>)}
            </ul>
          </Section>

          <section id="faq" className="rl-sec rkh-sec" aria-labelledby="faq-h">
            <div className="rk-shell rl-faq-grid">
              <header className="rl-faq-side">
                <span className="rl-eyebrow">Questions</span>
                <h2 id="faq-h" className="rl-h2">System design questions, answered</h2>
                <p className="rl-lead">Short answers to what people ask most before their first design round.</p>
              </header>
              <div className="rl-faq-list">
                {FAQ.map((f, i) => <details key={f.q} className="rl-faq" open={i === 0}><summary><h3>{f.q}</h3></summary><p>{f.a}</p></details>)}
              </div>
            </div>
          </section>

          <section className="rl-sec rkh-sec" aria-label="Go deeper">
            <div className="rk-shell">
              <div className="rl-final">
                <BookOpen size={30} weight="duotone" aria-hidden style={{ color: "#5eead4" }} />
                <h2 className="rl-h2">Ready for full problems? <span className="rl-mark">Design them end to end.</span></h2>
                <p>Mastering System Design (HLD) walks through complete interview designs, from requirements and estimates to APIs, data, scaling, concurrency and failures.</p>
                <div className="rl-hero-btns">
                  <Btn as={Link} to={BOOK} size="lg">Explore the HLD book <ArrowRight size={17} weight="bold" aria-hidden /></Btn>
                  <Btn as={Link} to="/resources" size="lg" variant="ghost">All free resources</Btn>
                </div>
              </div>
            </div>
          </section>
        </main>
      </Page>
    </div>
  );
}
