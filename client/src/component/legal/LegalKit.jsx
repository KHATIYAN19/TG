import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUp,
  BookOpen,
  CaretDown,
  Gift,
  UsersThree,
  VideoCamera,
  FilePdf,
  Check,
  CheckCircle,
  Clock,
  Copy,
  EnvelopeSimple,
  FileText,
  Info,
  Plus,
  Printer,
  Receipt,
  ShieldCheck,
  Warning,
  XCircle,
} from "@phosphor-icons/react";

import "./legal.css";

/* ======================================================
   SHARED CONSTANTS
====================================================== */

export const SITE_URL = "https://www.targettrek.in";
export const SITE_NAME = "Target Trek";
export const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Geist+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&display=swap";

export const mailto = (subject, body = "") =>
  `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}${
    body ? `&body=${encodeURIComponent(body)}` : ""
  }`;

export const POLICIES = [
  {
    slug: "privacy",
    path: "/privacy-policy",
    label: "Privacy Policy",
    short: "Privacy",
    blurb: "What we collect, why, and how to delete it.",
    Icon: ShieldCheck,
  },
  {
    slug: "terms",
    path: "/terms-of-service",
    label: "Terms of Service",
    short: "Terms",
    blurb: "The rules for using Target Trek and its products.",
    Icon: FileText,
  },
  {
    slug: "refund",
    path: "/refund-policy",
    label: "Refund Policy",
    short: "Refunds",
    blurb: "No refunds after purchase, except double payments and real issues.",
    Icon: Receipt,
  },
];

/* every paid product on Target Trek, used across all three policies */
export const PRODUCTS = [
  { Icon: BookOpen, title: "Ebooks & All Access", text: "Digital books, handbooks and bundles you read or download." },
  { Icon: FilePdf, title: "Resume Lab", text: "Resume reviews, AI scoring, job-match checks and review credits." },
  { Icon: Gift, title: "Memories", text: "Credits, upgrades and extra room for personalised memory pages." },
  { Icon: UsersThree, title: "Prep Arena", text: "Entry to the prep-buddy arena, matches and private buddy chat." },
  { Icon: VideoCamera, title: "Mock interviews", text: "Live technical mock interviews booked for a date and time." },
];

/* ======================================================
   SMALL BUILDING BLOCKS
====================================================== */

export const P = ({ children }) => <p>{children}</p>;

export const H3 = ({ children }) => <h3>{children}</h3>;

export const UL = ({ items, cross = false }) => (
  <ul className={`lg-ul${cross ? " x" : ""}`}>
    {items.map((item, i) => (
      <li key={i}>
        {cross ? (
          <XCircle size={17} weight="fill" aria-hidden />
        ) : (
          <CheckCircle size={17} weight="fill" aria-hidden />
        )}
        <div>{item}</div>
      </li>
    ))}
  </ul>
);

const NOTE_ICON = { info: Info, warn: Warning, bad: XCircle, ok: CheckCircle };

export const Note = ({ tone = "info", title, children }) => {
  const Icon = NOTE_ICON[tone] || Info;
  return (
    <div className={`lg-note ${tone}`} role="note">
      <Icon size={20} weight="fill" aria-hidden />
      <div>
        {title && <span className="lg-note-title">{title}</span>}
        {children}
      </div>
    </div>
  );
};

export const Split = ({ yesTitle, yes, noTitle, no }) => (
  <div className="lg-split">
    <div className="ok">
      <h3>
        <CheckCircle size={20} weight="fill" aria-hidden />
        {yesTitle}
      </h3>
      <UL items={yes} />
    </div>
    <div className="bad">
      <h3>
        <XCircle size={20} weight="fill" aria-hidden />
        {noTitle}
      </h3>
      <UL items={no} cross />
    </div>
  </div>
);

export const Products = ({ items }) => (
  <div className="lg-products">
    {items.map(({ Icon, title, text }) => (
      <div className="lg-product" key={title}>
        <span className="lg-ico">
          <Icon size={20} weight="duotone" aria-hidden />
        </span>
        <div>
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      </div>
    ))}
  </div>
);

export const Table = ({ rows }) => (
  <dl className="lg-table">
    {rows.map(([k, v]) => (
      <div key={k}>
        <dt>{k}</dt>
        <dd>{v}</dd>
      </div>
    ))}
  </dl>
);

export const Steps = ({ items }) => (
  <ol className="lg-steps">
    {items.map(([title, text]) => (
      <li key={title}>
        <b>{title}</b>
        {text}
      </li>
    ))}
  </ol>
);

export const Mail = ({ subject, body, children }) => (
  <a className="lg-link" href={subject ? mailto(subject, body) : `mailto:${SUPPORT_EMAIL}`}>
    {children || SUPPORT_EMAIL}
  </a>
);

const useCopy = () => {
  const [copied, setCopied] = useState(false);
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };
  return [copied, copy];
};

export const Template = ({ title, subject, body }) => {
  const [copied, copy] = useCopy();
  return (
    <div className="lg-template">
      <div className="lg-template-bar">
        <span>{title}</span>
        <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="lg-btn lg-btn-ghost lg-btn-sm" onClick={() => copy(body)}>
            {copied ? <Check size={15} weight="bold" aria-hidden /> : <Copy size={15} aria-hidden />}
            {copied ? "Copied" : "Copy"}
          </button>
          <a className="lg-btn lg-btn-primary lg-btn-sm" href={mailto(subject, body)}>
            <EnvelopeSimple size={15} weight="bold" aria-hidden />
            Open in mail
          </a>
        </span>
      </div>
      <pre>{body}</pre>
    </div>
  );
};

/* ======================================================
   PAGE SHELL
====================================================== */

const Contact = ({ title, text, actions }) => {
  const [copied, copy] = useCopy();
  return (
    <section className="lg-contact" aria-labelledby="lg-contact-h" id="contact">
      <h2 id="lg-contact-h">{title}</h2>
      <p>{text}</p>
      <div className="lg-contact-mail">
        <EnvelopeSimple size={20} weight="duotone" aria-hidden style={{ color: "#5eead4", flexShrink: 0 }} />
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        <button type="button" className="lg-copy" onClick={() => copy(SUPPORT_EMAIL)}>
          {copied ? <Check size={14} weight="bold" aria-hidden /> : <Copy size={14} aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {actions?.length > 0 && (
        <div className="lg-contact-actions">
          {actions.map((a, i) => (
            <a
              key={a.label}
              href={mailto(a.subject, a.body)}
              className={`lg-btn ${i === 0 ? "lg-btn-primary" : "lg-btn-ghost"} lg-btn-block-sm`}
            >
              {a.label}
              {i === 0 && <ArrowRight size={16} weight="bold" aria-hidden />}
            </a>
          ))}
        </div>
      )}
      <div className="lg-contact-grid">
        <div>
          <b>One inbox for everything</b>
          Ebooks, Resume Lab, Memories, Prep Arena and mock interviews.
        </div>
        <div>
          <b>Reply time</b>
          Usually within 2 working days, often sooner.
        </div>
        <div>
          <b>Write from your account email</b>
          It helps us find your order quickly and keeps it secure.
        </div>
      </div>
    </section>
  );
};

export default function LegalPage({
  slug,
  seo,
  eyebrow,
  heading,
  lead,
  lastUpdated,
  dateModified,
  summary,
  glance,
  sections,
  faqs,
  contact,
}) {
  const [active, setActive] = useState(sections[0]?.id);
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const tocRef = useRef(null);

  const readMins = seo.readMins || 8;

  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id && document.getElementById(id);
    if (target) target.scrollIntoView({ block: "start" });
    else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [slug]);

  /* the contents list starts open on desktop and folded on phones */
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      if (tocRef.current) tocRef.current.open = mq.matches;
    };
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!els.length || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));

    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
      setShowTop(h.scrollTop > 900);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [sections]);

  const onTocClick = () => {
    if (tocRef.current && window.matchMedia("(max-width: 1023px)").matches) {
      tocRef.current.open = false;
    }
  };

  const activeIndex = Math.max(0, sections.findIndex((s) => s.id === active));
  const policy = POLICIES.find((p) => p.slug === slug);
  const others = POLICIES.filter((p) => p.slug !== slug);
  const canonical = `${SITE_URL}${policy.path}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        email: SUPPORT_EMAIL,
        contactPoint: {
          "@type": "ContactPoint",
          email: SUPPORT_EMAIL,
          contactType: "customer support",
          areaServed: "IN",
          availableLanguage: ["English"],
        },
      },
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: seo.title,
        description: seo.description,
        dateModified,
        inLanguage: "en",
        isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL },
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: policy.label, item: canonical },
        ],
      },
      ...(faqs?.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.text || (typeof f.a === "string" ? f.a : f.q) },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <div className="lg">
      <Helmet>
        <html lang="en" />
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        {seo.keywords && <meta name="keywords" content={seo.keywords} />}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <meta property="article:modified_time" content={dateModified} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      {/* ---------------- HERO ---------------- */}
      <header className="lg-hero">
        <div className="lg-wrap">
          <nav className="lg-tabs" aria-label="Legal pages">
            {POLICIES.map((p) => (
              <Link key={p.slug} to={p.path} className="lg-tab" aria-current={p.slug === slug ? "page" : undefined}>
                <p.Icon size={16} weight={p.slug === slug ? "fill" : "regular"} aria-hidden />
                {p.label}
              </Link>
            ))}
          </nav>

          <div className="lg-hero-grid">
            <div>
              <span className="lg-eyebrow">
                <i aria-hidden />
                {eyebrow}
              </span>
              <h1 className="lg-h1">{heading}</h1>
              <p className="lg-lead">{lead}</p>
              <div className="lg-meta">
                <span className="lg-chip">
                  <Clock size={15} weight="bold" aria-hidden />
                  Last updated <b>{lastUpdated}</b>
                </span>
                <span className="lg-chip">
                  <FileText size={15} weight="bold" aria-hidden />
                  <b className="lg-mono">{sections.length}</b> sections · ~{readMins} min read
                </span>
                <button type="button" className="lg-chip lg-hero-actions" style={{ cursor: "pointer" }} onClick={() => window.print()}>
                  <Printer size={15} weight="bold" aria-hidden />
                  Print / save PDF
                </button>
              </div>
            </div>

            <aside className="lg-hero-card" aria-label={summary.title}>
              <h2>
                <ShieldCheck size={20} weight="fill" aria-hidden />
                {summary.title}
              </h2>
              <ul>
                {summary.items.map((it, i) => (
                  <li key={i}>
                    <Check size={16} weight="bold" aria-hidden />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </header>

      {/* ---------------- AT A GLANCE ---------------- */}
      {glance?.length > 0 && (
        <section className="lg-glance" aria-labelledby="lg-glance-h">
          <div className="lg-wrap">
            <div className="lg-glance-head">
              <h2 id="lg-glance-h" className="lg-h2">
                At a <span className="lg-mark">glance</span>
              </h2>
              <span className="lg-chip">Tap a card to jump to the full section</span>
            </div>
            <div className="lg-glance-grid">
              {glance.map(({ Icon, tone, title, text, to }) => (
                <a key={title} href={`#${to}`} className="lg-gcard">
                  <span className={`lg-ico ${tone || ""}`}>
                    <Icon size={21} weight="duotone" aria-hidden />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- BODY ---------------- */}
      <div className="lg-body">
        <div className="lg-wrap lg-layout">
          <nav className="lg-toc" aria-label="On this page">
            <div className="lg-toc-box">
              <details ref={tocRef} open>
                <summary
                  onClick={(e) => {
                    if (window.matchMedia("(min-width: 1024px)").matches) e.preventDefault();
                  }}
                >
                  <span>On this page</span>
                  <span className="lg-toc-cur">
                    <span className="lg-mono">{String(activeIndex + 1).padStart(2, "0")}</span>{" "}
                    {sections[activeIndex]?.title}
                  </span>
                  <CaretDown size={16} weight="bold" aria-hidden />
                </summary>
                <ol>
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} aria-current={active === s.id ? "true" : undefined} onClick={onTocClick}>
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        <span>{s.title}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
              <div className="lg-toc-progress" aria-hidden>
                <i style={{ width: `${progress}%` }} />
              </div>
            </div>
          </nav>

          <main className="lg-article">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="lg-sec" aria-labelledby={`${s.id}-h`}>
                <div className="lg-sec-head">
                  <span className="lg-sec-num" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <h2 id={`${s.id}-h`}>{s.title}</h2>
                    {s.sub && <p className="lg-sec-sub">{s.sub}</p>}
                  </div>
                </div>
                <div className="lg-prose">{s.body}</div>
              </section>
            ))}

            {faqs?.length > 0 && (
              <section id="faq" className="lg-sec" aria-labelledby="faq-h">
                <div className="lg-sec-head">
                  <span className="lg-sec-num" aria-hidden>
                    ?
                  </span>
                  <div>
                    <h2 id="faq-h">Frequently asked questions</h2>
                    <p className="lg-sec-sub">Short answers to what people ask us most.</p>
                  </div>
                </div>
                <div className="lg-faq">
                  {faqs.map((f) => (
                    <details key={f.q}>
                      <summary>
                        {f.q}
                        <Plus size={18} weight="bold" aria-hidden />
                      </summary>
                      <div>{f.a}</div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            <Contact {...contact} />

            <section aria-labelledby="lg-related-h" style={{ marginTop: 8 }}>
              <h2 id="lg-related-h" className="lg-h2" style={{ fontSize: 22, marginBottom: 12 }}>
                Related policies
              </h2>
              <div className="lg-related">
                {others.map((p) => (
                  <Link key={p.slug} to={p.path}>
                    <span className="lg-ico">
                      <p.Icon size={21} weight="duotone" aria-hidden />
                    </span>
                    <div>
                      <b>{p.label}</b>
                      <span>{p.blurb}</span>
                    </div>
                    <ArrowRight size={18} weight="bold" aria-hidden />
                  </Link>
                ))}
              </div>
            </section>

            <p className="lg-foot-note">
              {policy.label} · {SITE_NAME} · Last updated {lastUpdated}
            </p>
          </main>
        </div>
      </div>

      <button
        type="button"
        className={`lg-top-btn${showTop ? " on" : ""}`}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp size={20} weight="bold" aria-hidden />
      </button>
    </div>
  );
}
