import { Children, Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowDown, ArrowRight, ArrowUp, BookOpen, CaretDown, Check, CheckCircle, Clock, Copy, Info, Lightbulb, ListBullets, Sparkle, Target, Warning, X, XCircle,
} from "@phosphor-icons/react";

import { Btn, Page, cx } from "../../resume/ui";
import { LOGO, SITE, guideSchemaJson } from "./seo";
import "./kit.css";

/*
  RESOURCE READER KIT
  ───────────────────
  <ReaderPage guide={GUIDE}> … sections … </ReaderPage>

  `guide` holds everything that is not body copy: SEO, hero, contents, interview questions, quiz, takeaways,
  glossary, FAQ and the next topic. ReaderPage draws the hero and the contents rail, renders the page's own
  sections, then appends the shared closing blocks in the same order on every guide:
     Interview questions → Quick quiz → Glossary → Key takeaways → FAQ → Next topic + book
  Their ids are added to the contents automatically, so a page only lists its own sections in `guide.toc`.
*/

const VISITED_KEY = "tt:resources:visited";
const TAIL = [
  ["questions", "interview-questions", "Interview questions"],
  ["quiz", "quiz", "Quick quiz"],
  ["glossary", "glossary", "Glossary"],
  ["takeaways", "takeaways", "Key takeaways"],
  ["faq", "faq", "FAQ"],
];

/* ============================ hooks ============================ */
/* the site's navbar is fixed; measure it so sticky bars and anchors land below it on every device */
function useNavOffset(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    let ro;
    const measure = () => {
      const nav = document.querySelector(".tt-nav");
      const h = nav ? Math.round(nav.getBoundingClientRect().height) : 0;
      root.style.setProperty("--rk-nav", `${h}px`);
    };
    measure();
    const nav = document.querySelector(".tt-nav");
    if (nav && typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(measure); ro.observe(nav); }
    window.addEventListener("resize", measure);
    return () => { ro?.disconnect(); window.removeEventListener("resize", measure); };
  }, [rootRef]);
}

/* which section is on screen, and which ones the reader has already scrolled past */
function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0]);
  const [done, setDone] = useState(() => new Set());
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-25% 0px -65% 0px" });
    els.forEach((el) => io.observe(el));
    const onScroll = () => {
      const line = window.innerHeight * 0.3;
      const passed = new Set();
      els.forEach((el) => { if (el.getBoundingClientRect().bottom < line) passed.add(el.id); });
      setDone((prev) => (prev.size === passed.size ? prev : passed));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [ids.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  return { active, done };
}

/* reading progress (a CSS variable, so no re-render per scroll) + whether to show "back to top" */
function useProgress(barRef) {
  const [far, setFar] = useState(false);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      barRef.current?.style.setProperty("--rk-p", p.toFixed(4));
      setFar(window.scrollY > 1200);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tick); };
    tick();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, [barRef]);
  return far;
}

function useMarkVisited(id) {
  useEffect(() => {
    if (!id) return;
    try {
      const list = JSON.parse(window.localStorage.getItem(VISITED_KEY) || "[]");
      if (Array.isArray(list) && !list.includes(id)) window.localStorage.setItem(VISITED_KEY, JSON.stringify([...list, id]));
    } catch { /* storage blocked: nothing to remember */ }
  }, [id]);
}

/* ============================ head ============================ */
function Head({ g }) {
  const url = `${SITE}${g.path}`;
  return (
    <Helmet>
      <html lang="en-IN" />
      <title>{g.seoTitle}</title>
      <meta name="description" content={g.description} />
      <meta name="keywords" content={g.keywords.join(", ")} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="author" content="Target Trek" />
      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="en-IN" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content="Target Trek" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={g.seoTitle} />
      <meta property="og:description" content={g.description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={LOGO} />
      <meta property="og:image:alt" content={`${g.h1}, a free guide by Target Trek`} />
      <meta property="article:section" content={g.section} />
      <meta property="article:modified_time" content={g.updated} />
      {g.about?.map((t) => <meta key={t} property="article:tag" content={t} />)}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={g.seoTitle} />
      <meta name="twitter:description" content={g.description} />
      <meta name="twitter:image" content={LOGO} />
      <script type="application/ld+json">{guideSchemaJson(g)}</script>
    </Helmet>
  );
}

/* ============================ hero ============================ */
function Hero({ g, onStart }) {
  return (
    <header className="rk-hero">
      <div className="rk-shell">
        <nav aria-label="Breadcrumb">
          <ol className="rk-crumbs">
            <li><Link to="/">Home</Link></li>
            {g.crumbs.map(([name, path], i) => (
              <li key={path}>{i === g.crumbs.length - 1 ? <span aria-current="page">{name}</span> : <Link to={path}>{name}</Link>}</li>
            ))}
          </ol>
        </nav>
        <div className="rk-hero-grid">
          <div className="rk-hero-copy">
            <div className="rk-tags">
              {g.tags.map((t, i) => <span key={t} className={cx("rk-tag", i === 0 && "is-brand")}>{t}</span>)}
            </div>
            <h1 id="rk-title" className="rk-h1">{g.h1}</h1>
            <p className="rk-sub">{g.sub}</p>
            <p className="rk-answer"><b>The short answer</b>{g.answer}</p>
            <div className="rk-btns">
              <Btn size="lg" onClick={onStart}>Start reading <ArrowDown size={17} weight="bold" aria-hidden /></Btn>
              {g.book && <Btn as={Link} to={g.book.path} size="lg" variant="ghost"><BookOpen size={17} weight="duotone" aria-hidden />{g.book.label}</Btn>}
            </div>
          </div>
          <aside className="rk-glance" aria-label="Guide at a glance">
            <dl className="rk-glance-meta">
              <div><dt>Read</dt><dd>{g.minutes} min</dd></div>
              <div><dt>Level</dt><dd>{g.level}</dd></div>
              <div><dt>Sections</dt><dd>{g.toc.length}</dd></div>
            </dl>
            <div className="rk-glance-body">
              <p>What you'll learn</p>
              <ul className="rk-checks">{g.learn.map((x) => <li key={x}><Check size={15} weight="bold" aria-hidden />{x}</li>)}</ul>
            </div>
          </aside>
        </div>
      </div>
    </header>
  );
}

/* ============================ contents ============================ */
function TocList({ items, active, done, onPick }) {
  return (
    <ol className="rk-toc">
      {items.map((s, i) => (
        <li key={s.id}>
          <a href={`#${s.id}`} className={cx(active === s.id && "is-on", done.has(s.id) && "is-done")} aria-current={active === s.id ? "location" : undefined} onClick={onPick}>
            <small>{String(i + 1).padStart(2, "0")}</small>{s.label}
          </a>
        </li>
      ))}
    </ol>
  );
}

function MobileToc({ items, active, done }) {
  const [open, setOpen] = useState(false);
  const i = Math.max(0, items.findIndex((s) => s.id === active));
  return (
    <div className="rk-mtoc">
      <button type="button" aria-expanded={open} aria-controls="rk-mtoc-panel" onClick={() => setOpen((v) => !v)}>
        <ListBullets size={18} weight="bold" aria-hidden />
        <small>{i + 1}/{items.length}</small>
        <span>{items[i]?.label || "Contents"}</span>
        <CaretDown size={16} weight="bold" aria-hidden />
      </button>
      {open && (
        <nav id="rk-mtoc-panel" className="rk-mtoc-panel" aria-label="Contents">
          <TocList items={items} active={active} done={done} onPick={() => setOpen(false)} />
        </nav>
      )}
    </div>
  );
}

/* ============================ article building blocks ============================ */
export function Sec({ id, n, eyebrow, title, lead, children }) {
  return (
    <section id={id} className="rk-sec" aria-labelledby={`${id}-h`}>
      <header className="rk-sec-head">
        {(eyebrow || n) && <span className="rk-sec-k">{n && <i>{String(n).padStart(2, "0")}</i>}{eyebrow}</span>}
        <h2 id={`${id}-h`} className="rk-h2"><a href={`#${id}`}>{title}</a></h2>
        {lead && <p className="rk-lead">{lead}</p>}
      </header>
      {children}
    </section>
  );
}

export const H3 = ({ children, id }) => <h3 id={id} className="rk-h3">{children}</h3>;
export const Prose = ({ children }) => <div className="rk-prose">{children}</div>;
export const Mark = ({ children }) => <mark className="rk-mark">{children}</mark>;
export const Bullets = ({ items }) => <ul className="rk-bullets rk-block">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>;
export const Chips = ({ items, label }) => <ul className="rk-chips" aria-label={label}>{items.map((x) => <li key={x}>{x}</li>)}</ul>;

const CALL_ICON = { tip: Lightbulb, warn: Warning, ok: CheckCircle, info: Info, interview: Target };
export function Call({ tone = "tip", title, children }) {
  const I = CALL_ICON[tone] || Lightbulb;
  return (
    <aside className={cx("rk-call", tone)} role="note">
      <I size={22} weight="duotone" aria-hidden />
      <div>{title && <b>{tone === "interview" ? `Interview tip · ${title}` : title}</b>}<div>{children}</div></div>
    </aside>
  );
}

/* tiny, dependency-free highlighter: comments, strings and a few keywords per language */
const KW = {
  js: "const|let|var|async|await|function|return|if|else|throw|new|for|of|in|try|catch|class|import|from|export|null|true|false|while",
  sql: "SELECT|FROM|WHERE|UPDATE|SET|INSERT|INTO|VALUES|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|ORDER|HAVING|LIMIT|AND|OR|NOT|NULL|AS|WITH|CREATE|TABLE|INDEX|BEGIN|COMMIT|ROLLBACK|OVER|PARTITION|CASE|WHEN|THEN|ELSE|END|DISTINCT|UNION|ALL|EXISTS|IN|IS|PRIMARY|KEY|FOREIGN|REFERENCES|DESC|ASC|COUNT|SUM|AVG|MIN|MAX|FOR",
  lua: "if|then|else|end|return|local|function|and|or|not",
  java: "public|private|protected|class|interface|return|new|void|static|final|if|else|throw|throws|try|catch|import|package|extends|implements|null|true|false",
  http: "GET|POST|PUT|PATCH|DELETE|HTTP",
  bash: "curl|redis-cli|echo|export",
  yaml: "",
  text: "",
  json: "true|false|null",
  graphql: "type|query|mutation|input|schema|subscription",
  python: "def|return|if|else|elif|import|from|for|in|while|class|None|True|False|with|as",
};
const COMMENT = { js: "//[^\\n]*", java: "//[^\\n]*", sql: "--[^\\n]*", lua: "--[^\\n]*", bash: "#[^\\n]*", yaml: "#[^\\n]*", python: "#[^\\n]*", graphql: "#[^\\n]*" };
function highlight(code, lang) {
  const kw = KW[lang] ?? "";
  const parts = [COMMENT[lang] ? `(${COMMENT[lang]})` : "(\\u0000\\u0000)", "(\"(?:[^\"\\\\\\n]|\\\\.)*\"|'(?:[^'\\\\\\n]|\\\\.)*'|`[^`]*`)", kw ? `\\b(${kw})\\b` : "(\\u0000\\u0001)"];
  const re = new RegExp(parts.join("|"), lang === "sql" ? "gi" : "g");
  const out = [];
  let last = 0;
  let m;
  let k = 0;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const cls = m[1] ? "c" : m[2] ? "s" : "k";
    out.push(<span key={k++} className={cls}>{m[0]}</span>);
    last = m.index + m[0].length;
    if (m[0].length === 0) re.lastIndex++;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function Code({ title, lang = "js", children }) {
  const code = String(Children.toArray(children).join("")).replace(/^\n+|\s+$/g, "");
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1600); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(code).then(done).catch(() => {});
  }, [code]);
  const parts = useMemo(() => highlight(code, lang), [code, lang]);
  return (
    <figure className="rk-code">
      <figcaption className="rk-code-bar">
        <span>{title || "Example"}</span>
        <em>{lang}</em>
        <button type="button" className="rk-copy" onClick={copy} aria-label={`Copy ${title || "code"}`}>
          {copied ? <Check size={14} weight="bold" aria-hidden /> : <Copy size={14} weight="bold" aria-hidden />}{copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre tabIndex={0}><code>{parts}</code></pre>
    </figure>
  );
}

/* rows: arrays of cells. The first cell of each row is a header cell (<th scope="row">) */
export function Table({ head, rows, caption }) {
  return (
    <div className="rk-table" role="region" aria-label={caption || head.join(", ")} tabIndex={0}>
      <table>
        {caption && <caption>{caption}</caption>}
        <thead><tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => <tr key={i}>{r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

/* items: [title, text, Icon?]. `bad` marks every card as a problem */
export function Cards({ items, cols = 2, bad = false, level = 3 }) {
  const Hn = level === 4 ? "h4" : "h3";
  return (
    <div className={cx("rk-cards", cols === 3 && "c3")}>
      {items.map(([t, d, I]) => (
        <article key={t} className={cx("rk-card", bad && "is-bad")}>
          <Hn>{I && <I size={18} weight="duotone" aria-hidden />}{t}</Hn>
          <p>{d}</p>
        </article>
      ))}
    </div>
  );
}

/* items: { title, tag, facts: [[label, text, tone?]] } with tone "good" | "cost" */
export function Specs({ items }) {
  return (
    <ol className="rk-specs">
      {items.map((s, i) => (
        <li key={s.title} className="rk-spec">
          <div className="rk-spec-top"><span aria-hidden>{i + 1}</span><h3>{s.title}</h3>{s.tag && <small>{s.tag}</small>}</div>
          <dl>{s.facts.map(([k, v, tone]) => <div key={k} className={tone || ""}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </li>
      ))}
    </ol>
  );
}

/* two columns. side: { tone: "bad" | "good" | "plain", title, text?, items, ordered? } */
export function Compare({ left, right }) {
  const side = (s) => {
    const I = s.tone === "bad" ? XCircle : s.tone === "good" ? CheckCircle : Check;
    const L = s.ordered ? "ol" : "ul";
    return (
      <div className={s.tone || "plain"}>
        <h3>{s.title}</h3>
        {s.text && <p>{s.text}</p>}
        <L>{s.items.map((x) => <li key={x}>{!s.ordered && <I size={16} weight="bold" aria-hidden />}{x}</li>)}</L>
      </div>
    );
  };
  return <div className="rk-compare">{side(left)}{side(right)}</div>;
}

/*
  A request flow. steps: nodes in order; an arrow is drawn between each pair.
    node:  { t, s?, i?: Icon, tone?: "hot" | "bad" | "good", via?: "label on the arrow into this node" }
    group: { row: [node, node, …], via? }   (side by side, e.g. several servers)
  `across` lays the steps out left-to-right on tablets and up; phones always stack them.
*/
function Node({ n }) {
  const I = n.i;
  return (
    <div className={cx("rk-node", n.tone)}>
      {I && <I size={20} weight="duotone" aria-hidden />}
      <div><b>{n.t}</b>{n.s && <small>{n.s}</small>}</div>
    </div>
  );
}
export function Flow({ steps, caption, note, across = false }) {
  const label = caption || "Diagram";
  const text = steps.map((s) => (s.row ? s.row.map((r) => r.t).join(" / ") : s.t)).join(" → ");
  return (
    <figure className={cx("rk-flow", across && "across")} aria-label={`${label}: ${text}`}>
      {caption && <figcaption>{caption}</figcaption>}
      <div className="rk-flow-track">
        {steps.map((s, i) => (
          <Fragment key={i}>
            {i > 0 && <div className="rk-arrow" aria-hidden>{s.via && <span>{s.via}</span>}<ArrowDown size={14} weight="bold" /></div>}
            {s.row ? <div className="rk-flow-row">{s.row.map((r, j) => <Node key={j} n={r} />)}</div> : <Node n={s} />}
          </Fragment>
        ))}
      </div>
      {note && <p className="rk-flow-note">{note}</p>}
    </figure>
  );
}

/* a numbered walkthrough. items: [title, text] */
export function Steps({ items }) {
  return (
    <ol className="rk-steps">
      {items.map(([t, d], i) => (
        <li key={t}><span aria-hidden>{i + 1}</span><div><h4>{t}</h4><p>{d}</p></div></li>
      ))}
    </ol>
  );
}

export const Nots = ({ items }) => <ul className="rk-nots">{items.map((x) => <li key={x}><X size={16} weight="bold" aria-hidden />{x}</li>)}</ul>;

/* ============================ closing blocks ============================ */
function Questions({ g }) {
  return (
    <Sec id="interview-questions" eyebrow="Interview prep" title={`${g.short} interview questions, with answers`} lead="Say your answer out loud first, then open the card to compare. These are the questions interviewers actually ask.">
      <div className="rk-qs">
        {g.questions.map((q, i) => (
          <details key={q.q} className="rk-q">
            <summary><span>{i + 1}</span><h3>{q.q}</h3><CaretDown size={16} weight="bold" aria-hidden /></summary>
            <div><p>{q.a}</p></div>
          </details>
        ))}
      </div>
    </Sec>
  );
}

function Quiz({ g }) {
  const qs = g.quiz;
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const q = qs[i];
  const choose = (n) => { if (pick !== null) return; setPick(n); if (n === q.answer) setScore((s) => s + 1); };
  const next = () => { if (i === qs.length - 1) { setFinished(true); return; } setI(i + 1); setPick(null); };
  const restart = () => { setI(0); setPick(null); setScore(0); setFinished(false); };
  return (
    <Sec id="quiz" eyebrow="Check yourself" title="Quick quiz" lead={`${qs.length} questions. Pick an answer to see why it's right or wrong.`}>
      <div className="rk-quiz">
        <div className="rk-quiz-top"><span>{finished ? "Done" : `Question ${i + 1} of ${qs.length}`}</span><b>{score} / {qs.length}</b></div>
        <div className="rk-quiz-bar" aria-hidden><i style={{ width: `${((finished ? qs.length : i + (pick !== null ? 1 : 0)) / qs.length) * 100}%` }} /></div>
        {finished ? (
          <div className="rk-quiz-done" aria-live="polite">
            <h3>{score === qs.length ? "Perfect score." : score >= qs.length * 0.6 ? "Solid. Review the ones you missed." : "Worth another read of the sections above."}</h3>
            <p>You got {score} of {qs.length} right.</p>
            <Btn variant="ghost" onClick={restart}>Try again</Btn>
          </div>
        ) : (
          <>
            <h3>{q.q}</h3>
            <div className="rk-opts" role="group" aria-label="Answers">
              {q.options.map((o, n) => (
                <button key={o} type="button" disabled={pick !== null} onClick={() => choose(n)}
                  className={cx("rk-opt", pick !== null && n === q.answer && "right", pick === n && n !== q.answer && "wrong")}>
                  <span aria-hidden>{"ABCD"[n]}</span>{o}
                </button>
              ))}
            </div>
            {pick !== null && (
              <>
                <p className="rk-why" aria-live="polite"><b>{pick === q.answer ? "Correct. " : "Not quite. "}</b>{q.why}</p>
                <div className="rk-quiz-nav"><Btn onClick={next}>{i === qs.length - 1 ? "See my score" : "Next question"} <ArrowRight size={15} weight="bold" aria-hidden /></Btn></div>
              </>
            )}
          </>
        )}
      </div>
    </Sec>
  );
}

function Glossary({ g }) {
  return (
    <Sec id="glossary" eyebrow="Reference" title={`${g.short} glossary`} lead="The terms from this guide, in one line each.">
      <dl className="rk-gloss">
        {g.glossary.map(([t, d]) => <div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}
      </dl>
    </Sec>
  );
}

function Takeaways({ g }) {
  return (
    <Sec id="takeaways" eyebrow="Summary" title="Key takeaways">
      <div className="rk-take"><ol>{g.takeaways.map((t) => <li key={t}>{t}</li>)}</ol></div>
    </Sec>
  );
}

function Faq({ g }) {
  return (
    <Sec id="faq" eyebrow="Questions" title={`${g.short}: frequently asked questions`}>
      <div className="rk-faqs">
        {g.faq.map((f, i) => (
          <details key={f.q} className="rk-faq" open={i === 0}>
            <summary><h3>{f.q}</h3></summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </Sec>
  );
}

function End({ g }) {
  return (
    <div className="rk-end">
      {g.next && (
        <Link to={g.next.path} className="rk-nextcard">
          <small>Next topic</small>
          <b>{g.next.title}<ArrowRight size={22} weight="bold" aria-hidden /></b>
          <p>{g.next.text}</p>
        </Link>
      )}
      {g.book && (
        <div className="rk-book">
          <small><Sparkle size={12} weight="fill" aria-hidden /> Go deeper</small>
          <b>{g.book.title}</b>
          <p>{g.book.text}</p>
          {g.book.chips && <ul>{g.book.chips.map((c) => <li key={c}>{c}</li>)}</ul>}
          <Btn as={Link} to={g.book.path}>{g.book.cta || "Explore the book"} <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
        </div>
      )}
    </div>
  );
}

/* ============================ the page ============================ */
export function ReaderPage({ guide: g, children }) {
  const rootRef = useRef(null);
  const barRef = useRef(null);
  useNavOffset(rootRef);
  useMarkVisited(g.id);
  const far = useProgress(barRef);

  const toc = useMemo(() => [...g.toc, ...TAIL.filter(([k]) => g[k]?.length).map(([, id, label]) => ({ id, label }))], [g]);
  const { active, done } = useScrollSpy(toc.map((s) => s.id));
  const start = () => document.getElementById(toc[0].id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div ref={rootRef} className="rk-root">
      <Page title={g.seoTitle} description={g.description} className="rk">
        <Head g={g} />
        <div className="rk-progress" ref={barRef} aria-hidden><i /></div>
        <Hero g={g} onStart={start} />
        <div className="rk-shell rk-layout">
          <aside className="rk-rail" aria-label="Contents">
            <p className="rk-rail-k">On this page <span>{toc.findIndex((s) => s.id === active) + 1}/{toc.length}</span></p>
            <nav aria-label="Contents"><TocList items={toc} active={active} done={done} /></nav>
            {g.book && (
              <div className="rk-rail-card">
                <b>{g.book.title}</b>
                <p>{g.book.short || g.book.text}</p>
                <Link to={g.book.path}>{g.book.cta || "Explore the book"} <ArrowRight size={14} weight="bold" aria-hidden /></Link>
              </div>
            )}
          </aside>
          <article className="rk-article" aria-labelledby="rk-title">
            <MobileToc items={toc} active={active} done={done} />
            {children}
            {g.questions?.length > 0 && <Questions g={g} />}
            {g.quiz?.length > 0 && <Quiz g={g} />}
            {g.glossary?.length > 0 && <Glossary g={g} />}
            {g.takeaways?.length > 0 && <Takeaways g={g} />}
            {g.faq?.length > 0 && <Faq g={g} />}
            <End g={g} />
            <p className="rk-updated"><Clock size={14} weight="bold" aria-hidden style={{ verticalAlign: "-2px" }} /> Last reviewed {new Date(g.updated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
          </article>
        </div>
        <button type="button" className={cx("rk-top", far && "is-on")} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top" tabIndex={far ? 0 : -1}>
          <ArrowUp size={18} weight="bold" aria-hidden />
        </button>
      </Page>
    </div>
  );
}
