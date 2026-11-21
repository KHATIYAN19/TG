import { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowRight, BookOpen, Books, Brain, CaretRight, Check, Code, Database, Envelope, FileCode, GraduationCap,
  Lightbulb, MapPin, Phone, Plugs, Robot, SealCheck, ShieldCheck, Sparkle, Stack, Target, Terminal, TreeStructure, User,
} from "@phosphor-icons/react";

import { Btn, Page, cx, useReveal } from "../resume/ui";
import "./about.css";

/* =====================================================================
   SEO
===================================================================== */
const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";
const PAGE_URL = `${SITE_URL}/about`;
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const SEO_TITLE = "About Target Trek | System Design, GenAI & Developer Books";
const SEO_DESCRIPTION =
  "Target Trek is an Indian developer learning platform making practical ebooks and free guides on system design, Java LLD, backend, GenAI and tech interviews.";
const SEO_KEYWORDS =
  "Target Trek, Target Trek books, developer books, developer ebooks, software engineering books, system design book, system design ebook, HLD book, high level design book, LLD book, low level design Java, LLD Java book, GenAI book, RAG book, RAG pipeline, MCP book, Model Context Protocol book, Google ADK book, AI agents book, backend engineering, software engineering interview preparation, system design interview preparation";
const OG_IMAGE = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80";

/*
  Business / operator details come from .env:
    VITE_OPERATOR_NAME=...   VITE_OPERATOR_MOBILE=...   VITE_OPERATOR_ADDRESS=...
  A row is shown only when its variable has a value (restart the dev server after editing .env).
*/
const readEnv = (v) => String(v || "").trim();
const OPERATOR_NAME = readEnv(import.meta.env.VITE_OPERATOR_NAME);
const OPERATOR_MOBILE = readEnv(import.meta.env.VITE_OPERATOR_MOBILE);
const OPERATOR_ADDRESS = readEnv(import.meta.env.VITE_OPERATOR_ADDRESS);
const OPERATOR_PHONE_HREF = OPERATOR_MOBILE ? `tel:${OPERATOR_MOBILE.replace(/[^\d+]/g, "")}` : "";
const HAS_OPERATOR_INFO = Boolean(OPERATOR_NAME || OPERATOR_MOBILE || OPERATOR_ADDRESS);

/* =====================================================================
   CONTENT
===================================================================== */
const BOOKS = [
  {
    icon: TreeStructure, title: "Mastering System Design — HLD", short: "System Design HLD", category: "High-Level Design", path: "/book/system-design/hld",
    description: "A practical system design resource covering requirements, APIs, databases, caching, scalability, distributed systems, reliability and real interview-style architecture problems.",
    topics: ["Requirements & APIs", "Databases & Caching", "Scalability", "Distributed Systems", "Real HLD Problems"],
  },
  {
    icon: Code, title: "Mastering System Design — LLD (Java)", short: "LLD in Java", category: "Low-Level Design", path: "/book/system-design/lld",
    description: "A Java-focused Low-Level Design book covering object-oriented programming, SOLID principles, design patterns, concurrency, UML and complete interview-style design problems.",
    topics: ["OOP Principles", "SOLID", "Design Patterns", "Java Implementation", "LLD Problems"],
  },
  {
    icon: Database, title: "Master GenAI Interview — RAG Pipeline", short: "RAG Pipeline", category: "Generative AI", path: "/book/genai/rag",
    description: "A developer-focused RAG resource covering ingestion, chunking, embeddings, vector databases, retrieval, generation and complete offline and online RAG pipelines.",
    topics: ["RAG Fundamentals", "Chunking", "Embeddings", "Vector Databases", "Production RAG"],
  },
  {
    icon: Plugs, title: "Master GenAI Interview — MCP", short: "Model Context Protocol", category: "Model Context Protocol", path: "/book/genai/mcp",
    description: "Understand MCP from fundamentals to implementation, including hosts, clients, servers, transports, JSON-RPC, lifecycle management, connectors and practical MCP projects.",
    topics: ["MCP Architecture", "Hosts & Clients", "MCP Servers", "JSON-RPC", "Practical Projects"],
  },
  {
    icon: Robot, title: "Google ADK Complete Developer Handbook", short: "Google ADK", category: "AI Agents", path: "/book/genai/google-adk",
    description: "A practical Google ADK handbook covering agents, tools, sessions, memory, multi-agent orchestration, guardrails, evaluation, RAG, MCP and production agent development.",
    topics: ["Google ADK", "AI Agents", "Tools & Sessions", "Multi-Agent Systems", "RAG & MCP"],
  },
];

const AREAS = [
  [TreeStructure, "System Design", "How large-scale systems are designed: requirements, APIs, databases, caching, queues, scaling, reliability and distributed architecture."],
  [Code, "Low-Level Design", "Object modeling, OOP, SOLID, design patterns, UML, concurrency and complete Java implementations."],
  [Brain, "Generative AI", "RAG, MCP, AI agents, orchestration and modern GenAI application development."],
  [Terminal, "Backend Engineering", "APIs, services, databases, caching, queues, concurrency, reliability and production systems."],
  [GraduationCap, "Interview Preparation", "Software engineering and GenAI interviews, with structured explanations, trade-offs, examples and real design problems."],
  [Robot, "AI Agents", "Agent architecture, tools, sessions, memory, orchestration, MCP, retrieval and production AI workflows."],
];

const PRINCIPLES = [
  ["01", Lightbulb, "Understand why", "We first explain why a concept or architecture exists, before discussing how to build it.", "Concept"],
  ["02", Stack, "See the architecture", "Diagrams and request flows connect single ideas into complete, working systems.", "Diagrams"],
  ["03", FileCode, "Move to implementation", "Concepts are tied to code, APIs, commands and implementation examples wherever it helps.", "Code"],
  ["04", ShieldCheck, "Think about production", "Scale, failures, reliability, security, concurrency and trade-offs are part of the engineering, not an appendix.", "Trade-offs"],
];

const AUDIENCE = [
  "Software Developers", "Backend Engineers", "Java Developers", "GenAI Engineers",
  "AI Engineers", "Software Engineering Students", "System Design Learners", "Interview Candidates",
];

const APPROACH = [
  [Target, "Focused content", "Topics are built around what developers actually meet while learning, building systems and preparing for interviews."],
  [BookOpen, "Structured learning", "Every book moves from fundamentals to architecture, implementation, examples and practical problems."],
  [Sparkle, "Always improving", "Our resources keep evolving as technologies, engineering practice and developer needs change."],
];

const TOPICS = ["System Design", "HLD", "LLD", "Java", "Backend", "RAG", "MCP", "Google ADK", "AI Agents", "Interviews"];

const FACTS = [
  [BOOKS.length, "Developer books"],
  [AREAS.length, "Learning areas"],
  [PRINCIPLES.length, "Writing principles"],
  [AUDIENCE.length, "Learner groups"],
];

/* =====================================================================
   PIECES
===================================================================== */
function Head() {
  const schema = useMemo(() => {
    const org = {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: "Target Trek creates practical developer books and technical learning resources covering System Design, Low-Level Design, Backend Engineering, Generative AI, RAG, MCP, Google ADK and software engineering interviews.",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.ico` },
      email: SUPPORT_EMAIL,
      sameAs: ["https://www.facebook.com/targettreks/", "https://www.linkedin.com/company/target-trek/"],
      knowsAbout: ["Software Engineering", "System Design", "High-Level Design", "Low-Level Design", "Java", "Backend Engineering", "Generative AI", "Retrieval-Augmented Generation", "Model Context Protocol", "Google ADK", "AI Agents", "Software Engineering Interviews"],
    };
    if (OPERATOR_NAME) org.founder = { "@type": "Person", name: OPERATOR_NAME };
    if (OPERATOR_MOBILE) org.telephone = OPERATOR_MOBILE;
    if (OPERATOR_ADDRESS) org.address = { "@type": "PostalAddress", streetAddress: OPERATOR_ADDRESS.replace(/\s*\n\s*/g, ", ") };

    return JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        org,
        { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, publisher: { "@id": `${SITE_URL}/#organization` }, inLanguage: "en" },
        {
          "@type": "AboutPage", "@id": `${PAGE_URL}#webpage`, url: PAGE_URL, name: SEO_TITLE, description: SEO_DESCRIPTION,
          isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#organization` }, publisher: { "@id": `${SITE_URL}/#organization` },
          breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` }, inLanguage: "en",
        },
        {
          "@type": "BreadcrumbList", "@id": `${PAGE_URL}#breadcrumb`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "About Target Trek", item: PAGE_URL },
          ],
        },
        {
          "@type": "ItemList", name: "Target Trek Developer Books",
          itemListElement: BOOKS.map((b, i) => ({
            "@type": "ListItem", position: i + 1,
            item: { "@type": "Book", name: b.title, description: b.description, url: `${SITE_URL}${b.path}`, publisher: { "@id": `${SITE_URL}/#organization` }, inLanguage: "en", genre: b.category },
          })),
        },
      ],
    });
  }, []);

  return (
    <Helmet>
      <meta name="keywords" content={SEO_KEYWORDS} />
      <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      <meta name="googlebot" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      <meta name="author" content={SITE_NAME} />
      <link rel="canonical" href={PAGE_URL} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={SEO_TITLE} />
      <meta property="og:description" content={SEO_DESCRIPTION} />
      <meta property="og:url" content={PAGE_URL} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:alt" content="Target Trek developer books covering system design, GenAI and software engineering" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={SEO_TITLE} />
      <meta name="twitter:description" content={SEO_DESCRIPTION} />
      <meta name="twitter:image" content={OG_IMAGE} />
      <script type="application/ld+json">{schema}</script>
    </Helmet>
  );
}

function Section({ id, eyebrow, title, lead, tone = "", children }) {
  return (
    <section id={id} className={cx("rl-sec", tone && `rl-sec-${tone}`)} aria-labelledby={`${id}-h`}>
      <div className="rv-shell">
        <header className="rl-sec-head rv-reveal">
          {eyebrow && <span className="rl-eyebrow">{eyebrow}</span>}
          <h2 id={`${id}-h`} className="rl-h2">{title}</h2>
          {lead && <p className="rl-lead">{lead}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="rl-hero ab-hero" aria-labelledby="about-h">
      <div className="rv-shell">
        <nav aria-label="Breadcrumb" className="tt-crumb" style={{ marginBottom: 24 }}>
          <Link to="/">Home</Link><CaretRight size={12} weight="bold" aria-hidden /><span aria-current="page">About</span>
        </nav>
        <div className="rl-hero-grid">
          <div className="rl-hero-copy rv-in">
            <span className="rl-pill"><span className="rl-dot" aria-hidden />Developer books &amp; learning</span>
            <h1 id="about-h" className="rl-h1">Practical books for <span className="rl-mark">modern</span> software developers.</h1>
            <p className="rl-lead">
              Target Trek is a developer-learning platform. We write structured books and free resources on System Design,
              Backend Engineering, Generative AI, AI Agents and software engineering interviews.
            </p>
            <p className="rl-lead">
              Our goal is simple: make hard engineering concepts easier to understand, by connecting theory, architecture,
              implementation and trade-offs.
            </p>
            <div className="rl-hero-btns">
              <Btn as={Link} to="/books" size="lg">Explore our books <ArrowRight size={18} weight="bold" aria-hidden /></Btn>
              <Btn as={Link} to="/resources" size="lg" variant="ghost">Free resources</Btn>
            </div>
            <dl className="rl-facts">
              {FACTS.map(([n, label]) => (
                <div key={label}><dt className="rv-mono">{n}</dt><dd>{label}</dd></div>
              ))}
            </dl>
          </div>

          <div className="rl-hero-art rv-in" style={{ "--i": 2 }}>
            <figure className="ab-shelf" aria-label="The Target Trek library">
              <div className="rl-paper-bar">
                <Books size={16} weight="duotone" aria-hidden style={{ color: "var(--rv-brand)" }} />
                <span>Target Trek library</span>
                <span className="rl-paper-pg rv-mono">{BOOKS.length} books</span>
              </div>
              <div className="ab-shelf-body">
                {BOOKS.map(({ icon: Icon, short, category, path }, i) => (
                  <Link key={path} to={path} className="ab-spine">
                    <Icon size={20} weight="duotone" aria-hidden />
                    <span className="ab-spine-txt"><b>{short}</b><small>{category}</small></span>
                    <span className="ab-spine-n rv-mono">{String(i + 1).padStart(2, "0")}</span>
                  </Link>
                ))}
                <p className="rl-pen">concept → architecture → code</p>
              </div>
            </figure>
          </div>
        </div>
        <ul className="ab-topics" aria-label="Topics we cover" style={{ marginTop: 40 }}>
          {TOPICS.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </div>
    </section>
  );
}

/* =====================================================================
   PAGE
===================================================================== */
export default function AboutPage() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  useReveal();

  return (
    <Page title={SEO_TITLE} description={SEO_DESCRIPTION} className="rl ab">
      <Head />
      <main>
        <Hero />

        <Section id="books" tone="tint" eyebrow="Our books" title="Developer books built around practical engineering" lead="Each book covers a topic developers keep running into: while building systems, learning modern AI, and preparing for technical interviews.">
          <div className="ab-books">
            {BOOKS.map(({ icon: Icon, title, category, description, topics, path }, i) => (
              <article key={title} className={cx("ab-book rv-reveal", i === 0 && "is-lead")} style={{ "--i": i % 3 }}>
                <div className="ab-book-top">
                  <span className="tt-ico"><Icon size={24} weight="duotone" aria-hidden /></span>
                  <span className="ab-book-cat">{category}</span>
                </div>
                <h3><Link to={path}>{title}</Link></h3>
                <p>{description}</p>
                <ul aria-label="Covers">{topics.map((t) => <li key={t}>{t}</li>)}</ul>
                <Link to={path} className="rl-textlink" style={{ fontSize: 14.5 }}>View book <ArrowRight size={15} weight="bold" aria-hidden /></Link>
              </article>
            ))}
          </div>
          <div className="rl-center-row">
            <Btn as={Link} to="/books" variant="ghost">See all books <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
          </div>
        </Section>

        <Section id="areas" eyebrow="What you can learn" title="Six areas, one connected library" lead="The books and free resources fit together, so what you learn in one area carries into the next.">
          <div className="tt-grid three">
            {AREAS.map(([Icon, title, text], i) => (
              <div key={title} className="tt-card rv-reveal" style={{ "--i": i % 3 }}>
                <span className="tt-ico"><Icon size={24} weight="duotone" aria-hidden /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="method" tone="tint" eyebrow="How we write" title="Learn the concept, see the flow, then build it." lead="We don't present engineering as a list of definitions. Every chapter follows the same four steps.">
          <ol className="rl-steps">
            {PRINCIPLES.map(([n, Icon, title, text, chip], i) => (
              <li key={n} className="rv-reveal" style={{ "--i": i }}>
                <span className="rl-step-n rv-mono" style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon size={18} weight="duotone" aria-hidden />{n}</span>
                <h3>{title}</h3>
                <span className="rl-step-t">{chip}</span>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="mission" eyebrow="Mission & vision" title="Why Target Trek exists">
          <div className="ab-mv">
            <div className="ab-mv-card is-dark rv-reveal">
              <span className="rl-eyebrow">Our mission</span>
              <p className="ab-quote">Make difficult engineering concepts <span className="rl-mark">easier to learn.</span></p>
              <p>
                Software engineering moves fast. Developers are expected to understand architecture, system design, backend
                engineering, distributed systems and, more and more, AI-powered applications. Target Trek organises those
                concepts into practical resources that are easier to revise, understand and apply.
              </p>
            </div>
            <div className="ab-mv-card rv-reveal" style={{ "--i": 1 }}>
              <span className="rl-eyebrow">Our vision</span>
              <p className="ab-quote" style={{ color: "var(--rv-text)" }}>A practical developer-learning library.</p>
              <p>
                Our long-term goal is a structured library covering what developers need across backend development, system
                design, AI and technical interviews.
              </p>
            </div>
          </div>
        </Section>

        <section id="who" className="rl-sec rl-sec-tint" aria-labelledby="who-h">
          <div className="rv-shell ab-who">
            <div className="ab-who-copy rv-reveal">
              <span className="rl-eyebrow">Who it&apos;s for</span>
              <h2 id="who-h" className="rl-h2">Built for developers who want practical depth.</h2>
              <p className="rl-lead">
                Preparing for an interview, learning system design, strengthening backend fundamentals or exploring GenAI: our
                resources are written for the way developers actually learn.
              </p>
            </div>
            <ul className="ab-who-list rv-reveal" style={{ "--i": 1 }}>
              {AUDIENCE.map((a) => <li key={a}><Check size={16} weight="bold" aria-hidden />{a}</li>)}
            </ul>
          </div>
        </section>

        <Section id="approach" eyebrow="Our approach" title="Practical learning over isolated definitions">
          <div className="tt-grid three">
            {APPROACH.map(([Icon, title, text], i) => (
              <div key={title} className="tt-card rv-reveal" style={{ "--i": i }}>
                <span className="tt-ico"><Icon size={24} weight="duotone" aria-hidden /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </Section>

        {HAS_OPERATOR_INFO && (
          <section id="business" className="rl-sec rl-sec-tint" aria-labelledby="business-h">
            <div className="rv-shell">
              <div className="ab-biz rv-reveal">
                <div className="ab-biz-copy">
                  <span className="tt-ico"><SealCheck size={24} weight="duotone" aria-hidden /></span>
                  <span className="rl-eyebrow">Business information</span>
                  <h2 id="business-h" className="rl-h3" style={{ fontSize: "clamp(24px, 3vw, 32px)" }}>Who is behind Target Trek</h2>
                  <p className="rl-muted" style={{ fontSize: 15.5, lineHeight: 1.7 }}>
                    Target Trek creates and improves developer-learning resources on software engineering, System Design,
                    Backend Engineering and Generative AI. Here is how to reach the people running it.
                  </p>
                </div>
                <dl>
                  {OPERATOR_NAME && (
                    <div><span className="tt-ico"><User size={20} weight="duotone" aria-hidden /></span><div><dt>Operated by</dt><dd>{OPERATOR_NAME}</dd></div></div>
                  )}
                  {OPERATOR_MOBILE && (
                    <div><span className="tt-ico"><Phone size={20} weight="duotone" aria-hidden /></span><div><dt>Mobile</dt><dd><a href={OPERATOR_PHONE_HREF}>{OPERATOR_MOBILE}</a></dd></div></div>
                  )}
                  <div><span className="tt-ico"><Envelope size={20} weight="duotone" aria-hidden /></span><div><dt>Support email</dt><dd><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></dd></div></div>
                  {OPERATOR_ADDRESS && (
                    <div className="wide"><span className="tt-ico"><MapPin size={20} weight="duotone" aria-hidden /></span><div><dt>Business address</dt><dd><address>{OPERATOR_ADDRESS}</address></dd></div></div>
                  )}
                </dl>
              </div>
            </div>
          </section>
        )}

        <section className="rl-sec" aria-labelledby="final-h">
          <div className="rv-shell">
            <div className="rl-final rv-reveal">
              <span className="rl-eyebrow" style={{ color: "#5eead4" }}>Keep learning</span>
              <h2 id="final-h" className="rl-h2">Explore the Target Trek <span className="rl-mark">developer library</span></h2>
              <p>System Design, Low-Level Design, Backend Engineering, RAG, MCP, Google ADK and modern GenAI, explained for developers.</p>
              <div className="rl-hero-btns">
                <Btn as={Link} to="/books" size="lg">Explore books <ArrowRight size={18} weight="bold" aria-hidden /></Btn>
                <Btn as={Link} to="/resources" size="lg" variant="ghost">Free resources</Btn>
              </div>
              <p style={{ fontSize: 14.5 }}>
                Need help with a book or purchase? <Link to="/contact" style={{ color: "#5eead4", fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 4 }}>Contact support</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </Page>
  );
}
