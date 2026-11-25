/*
  /book/claude-code — Claude Code: The Complete Handbook
  Uses the shared hb- / bookKit design system (pine-green brand, Bricolage + Manrope + Geist Mono).
  Sticky BuyBar identical to HLD page. No FAQ section.
*/
import { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, BookOpen, CaretDown, Check, Code, Copy,
  FileText, GitBranch, Lightning, LockKey, MagnifyingGlass, Path,
  Rocket, ShieldCheck, Sparkle, Stack, Terminal, TreeStructure,
  Wrench, Robot, Cpu, Gear, ArrowsClockwise, FlowArrow,
} from "@phosphor-icons/react";

import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { gatewayLabel, preferredGateway } from "../payment/gatewayConfig";
import ResumePromo from "../resume/ResumePromo.jsx";
import {
  BookFooter, BuyBar, FONT_HREF, FinalSection,
  Price, SITE_NAME, SITE_URL, SUPPORT_EMAIL,
  cx, priceOf, scrollToId, useOnScreen, useProduct,
  useReferral, useSiteTheme, useTrackView,
} from "./bookKit";

import * as data from "./claudeCodeBookData";
import "./claudeCodeBook.css";

const SEO_TITLE   = "Claude Code Handbook: The Complete Guide | Target Trek";
const SEO_DESC    = "Master Claude Code from install to production: agent loop, CLAUDE.md, slash commands, hooks, MCP, CI automation and 100 interview Q&A in one PDF.";
const SEO_KEYS    = "Claude Code book, Claude Code handbook, Claude Code PDF, Claude Code tutorial, Claude Code guide, Anthropic Claude Code, AI coding assistant, claude code interview questions, CLAUDE.md, MCP server, Claude hooks, claude code CI, anthropic API";
const PROVIDER    = gatewayLabel(preferredGateway("books"));

/* ─── tiny helpers ──────────────────────────────────────────────────────── */

function Caret() {
  return <span className="cc-caret" aria-hidden>█</span>;
}
function WinDots() {
  return (
    <span className="cc-dots" aria-hidden>
      <i /><i /><i />
    </span>
  );
}
function CopyBtn({ text }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const ta = Object.assign(document.createElement("textarea"), { value: text });
        ta.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
      }
      setDone(true); window.setTimeout(() => setDone(false), 1600);
    } catch { /**/ }
  };
  return (
    <button type="button" className="cc-copy" onClick={copy} aria-label={done ? "Copied" : "Copy"}>
      {done ? <Check size={12} weight="bold" aria-hidden /> : <Copy size={12} weight="bold" aria-hidden />}
      <span>{done ? "Copied" : "Copy"}</span>
    </button>
  );
}

/* syntax-colour one shell line */
function ShellLine({ line }) {
  if (/^\s*#/.test(line)) return <span className="cc-sh-c">{line}{"\n"}</span>;
  const parts = line.split(/(\s+)/);
  let first = true;
  return (
    <span>
      {parts.map((w, i) => {
        if (!w || /^\s+$/.test(w)) return w;
        let cls = "";
        if (first && /^(claude|npm|npx|export|node|curl|sh|bash)$/.test(w)) cls = "cc-sh-k";
        else if (w.startsWith("--") || (w.startsWith("-") && w.length === 2)) cls = "cc-sh-f";
        else if (/^["'`]/.test(w) || /["'`]$/.test(w)) cls = "cc-sh-s";
        else if (w.includes("$")) cls = "cc-sh-v";
        if (w !== "\\") first = false;
        return cls ? <span key={i} className={cls}>{w}</span> : w;
      })}
      {"\n"}
    </span>
  );
}
function Shell({ code }) {
  return <>{code.split("\n").map((l, i) => <ShellLine key={i} line={l} />)}</>;
}

/* ─── terminal samples ──────────────────────────────────────────────────── */
function TerminalSamples() {
  const [active, setActive] = useState(data.SAMPLES[0].id);
  const sample = data.SAMPLES.find(s => s.id === active) || data.SAMPLES[0];
  const onKey = (e) => {
    const idx = data.SAMPLES.findIndex(s => s.id === active);
    let n = -1;
    if (e.key === "ArrowRight") n = (idx + 1) % data.SAMPLES.length;
    if (e.key === "ArrowLeft")  n = (idx - 1 + data.SAMPLES.length) % data.SAMPLES.length;
    if (n < 0) return;
    e.preventDefault();
    setActive(data.SAMPLES[n].id);
    document.getElementById(`cc-tab-${data.SAMPLES[n].id}`)?.focus();
  };
  return (
    <div className="cc-samples">
      <div className="cc-rail" role="tablist" aria-label="Claude Code samples" onKeyDown={onKey}>
        {data.SAMPLES.map(s => (
          <button key={s.id} id={`cc-tab-${s.id}`} type="button" role="tab"
            aria-selected={active === s.id} aria-controls={`cc-panel-${s.id}`}
            tabIndex={active === s.id ? 0 : -1} onClick={() => setActive(s.id)}>
            {s.tab}
          </button>
        ))}
      </div>
      {data.SAMPLES.map(s => (
        <div key={s.id} id={`cc-panel-${s.id}`} role="tabpanel"
          aria-labelledby={`cc-tab-${s.id}`} hidden={active !== s.id}
          className="cc-sample">
          <div className="cc-sample-info">
            <span className="hb-eyebrow">{s.where}</span>
            <h3 className="hb-h3">{s.title}</h3>
            <p className="hb-muted">{s.intro}</p>
            <div className="cc-tip">
              <Sparkle size={14} weight="fill" aria-hidden />
              <span>{s.tip}</span>
            </div>
          </div>
          <div className="cc-term">
            <div className="cc-term-bar">
              <WinDots />
              <span className="cc-term-title hb-mono">claude — bash</span>
              <CopyBtn text={s.code} />
            </div>
            <pre className="cc-code" tabIndex={0}><code><Shell code={s.code} /></code></pre>
            {s.output && (
              <div className="cc-out">
                <span>output</span>
                <pre>{s.output}</pre>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── searchable table of contents ─────────────────────────────────────── */
function PartRow({ part, forceOpen }) {
  const [open, setOpen] = useState(false);
  const isOpen = open || forceOpen;
  const totalTopics = part.chapters.flatMap(c => c.topics).length;
  return (
    <li className={cx("cc-part", isOpen && "is-open")}>
      <button type="button" className="cc-part-head" onClick={() => setOpen(o => !o)} aria-expanded={isOpen}>
        <span className="cc-part-label">
          {part.number !== "0" && <span className="cc-part-pill hb-mono">{part.eyebrow}</span>}
          <strong>{part.title}</strong>
          <span className="cc-part-meta hb-mono">{part.chapters.length} ch · {totalTopics} topics</span>
        </span>
        <CaretDown size={16} weight="bold" className={cx("cc-caret-icon", isOpen && "is-open")} aria-hidden />
      </button>
      {isOpen && (
        <ol className="cc-chapters">
          {part.chapters.map(ch => (
            <li key={ch.slug} className="cc-chapter">
              <div className="cc-ch-head">
                <Terminal size={13} weight="duotone" aria-hidden />
                <strong>{ch.title}</strong>
              </div>
              <ul className="cc-topics">
                {ch.topics.map(t => (
                  <li key={t}><span className="cc-sym" aria-hidden>›</span>{t}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </li>
  );
}

function Contents({ parts }) {
  const [q, setQ] = useState("");
  const [expandAll, setExpandAll] = useState(false);
  const lq = q.toLowerCase().trim();

  const filtered = useMemo(() => {
    if (!lq) return parts;
    return parts.map(p => ({
      ...p,
      chapters: p.chapters.map(ch => ({
        ...ch,
        topics: ch.topics.filter(t => t.toLowerCase().includes(lq)),
        _match: ch.title.toLowerCase().includes(lq),
      })).filter(ch => ch._match || ch.topics.length > 0),
    })).filter(p => p.chapters.length > 0 || p.title.toLowerCase().includes(lq));
  }, [lq, parts]);

  return (
    <div className="cc-toc">
      <div className="cc-toc-search">
        <MagnifyingGlass size={16} weight="bold" aria-hidden />
        <input type="search" value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search chapters and topics…" aria-label="Search the table of contents" />
        {q && <button type="button" className="cc-search-clear" onClick={() => setQ("")} aria-label="Clear">×</button>}
      </div>
      {!q && (
        <button type="button" className="cc-expand-all" onClick={() => setExpandAll(o => !o)}>
          {expandAll ? "Collapse all" : "Expand all parts"}
        </button>
      )}
      <ol className="cc-parts-list" aria-label="Table of contents">
        {(lq ? filtered : parts).map(part =>
          lq ? (
            <li key={part.number} className="cc-part is-open">
              <div className="cc-part-head cc-part-head--static">
                <span className="cc-part-label">
                  {part.number !== "0" && <span className="cc-part-pill hb-mono">{part.eyebrow}</span>}
                  <strong>{part.title}</strong>
                </span>
              </div>
              <ol className="cc-chapters">
                {part.chapters.map(ch => (
                  <li key={ch.slug} className="cc-chapter">
                    <div className="cc-ch-head"><Terminal size={13} weight="duotone" aria-hidden /><strong>{ch.title}</strong></div>
                    {ch.topics.length > 0 && (
                      <ul className="cc-topics">
                        {ch.topics.map(t => <li key={t}><span className="cc-sym" aria-hidden>›</span>{t}</li>)}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </li>
          ) : (
            <PartRow key={part.number} part={part} forceOpen={expandAll} />
          )
        )}
      </ol>
      {lq && filtered.length === 0 && (
        <p className="cc-no-results">No match for <strong>{q}</strong>.</p>
      )}
    </div>
  );
}

/* ─── agent loop diagram ────────────────────────────────────────────────── */
const LOOP_STEPS = [
  { icon: FileText,       label: "Read context",    sub: "Files, CLAUDE.md, history" },
  { icon: Cpu,            label: "Think",           sub: "Pick the right tool or action" },
  { icon: Wrench,         label: "Use a tool",      sub: "Edit, shell, search, MCP…" },
  { icon: ArrowsClockwise,label: "Observe output",  sub: "Check result, update state" },
  { icon: GitBranch,      label: "Decide next step",sub: "Repeat or mark task done" },
];

function AgentLoop() {
  return (
    <div className="cc-loop">
      {LOOP_STEPS.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="cc-loop-step">
            <div className="cc-loop-icon">
              <Icon size={22} weight="duotone" aria-hidden />
            </div>
            <div className="cc-loop-body">
              <strong>{s.label}</strong>
              <p>{s.sub}</p>
            </div>
            {i < LOOP_STEPS.length - 1 && <div className="cc-loop-arrow" aria-hidden>→</div>}
          </div>
        );
      })}
    </div>
  );
}

/* ─── slash command grid ────────────────────────────────────────────────── */
const SLASH_CMDS = [
  { cmd: "/plan",     desc: "Switch to plan-only mode — Claude thinks, never edits" },
  { cmd: "/model",    desc: "Pick the model mid-session (Sonnet, Haiku, Opus…)" },
  { cmd: "/compact",  desc: "Summarise history to reclaim context window space" },
  { cmd: "/rewind",   desc: "Roll back to any earlier checkpoint in the session" },
  { cmd: "/clear",    desc: "Wipe history and start a clean slate" },
  { cmd: "/memory",   desc: "Open CLAUDE.md for quick in-session edits" },
  { cmd: "/batch",    desc: "Run the same prompt across many files in parallel" },
  { cmd: "/goal",     desc: "Work autonomously until the entire goal is achieved" },
  { cmd: "/review",   desc: "Ask Claude to review changes before they are saved" },
  { cmd: "/status",   desc: "Show token usage, model and session info at a glance" },
  { cmd: "/mcp",      desc: "List or toggle connected MCP servers" },
  { cmd: "/help",     desc: "Full command menu, searchable" },
];

function SlashCmds() {
  return (
    <ul className="cc-slash-grid">
      {SLASH_CMDS.map(({ cmd, desc }) => (
        <li key={cmd} className="cc-slash-item">
          <code className="cc-cmd hb-mono">{cmd}</code>
          <p>{desc}</p>
        </li>
      ))}
    </ul>
  );
}

/* ─── build-along steps ─────────────────────────────────────────────────── */
const BUILD_STEPS = [
  { n: "01", title: "Set up the folder",        copy: "Scaffold the project, install deps, and confirm Claude can see the structure." },
  { n: "02", title: "Write CLAUDE.md",          copy: "Tell Claude your stack, style rules, test commands, and commit prefix conventions." },
  { n: "03", title: "Plan in plan mode",        copy: "Use /plan to get a full implementation plan reviewed before a single line is written." },
  { n: "04", title: "Implement with tests",     copy: "Claude writes the FastAPI endpoints, Pydantic schemas, and pytest tests in one pass." },
  { n: "05", title: "Add a formatter hook",     copy: "A post-save hook runs Black on every .py file Claude touches. Exit 2 to block on failure." },
  { n: "06", title: "Add a skill + subagent",   copy: "Package the \"generate OpenAPI docs\" task as a reusable skill and invoke it via a subagent." },
  { n: "07", title: "Review and ship",          copy: "Use /review, check the diff, run tests in CI via headless mode, and tag the release." },
];

/* ─── cheat-sheet row ───────────────────────────────────────────────────── */
const CHEAT = [
  { key: "Esc",         what: "Pause Claude while it is working" },
  { key: "Ctrl + C",   what: "Cancel the current action immediately" },
  { key: "↑ / ↓",      what: "Cycle through your prompt history" },
  { key: "#",           what: "Append a rule to CLAUDE.md mid-session" },
  { key: "!",           what: "Run a raw shell command without Claude" },
  { key: "@",           what: "Reference a file by path in your prompt" },
];

/* ─── main page ─────────────────────────────────────────────────────────── */
export default function ClaudeCodeHandbook() {
  const { isDark } = useSiteTheme();
  const { product, loading: productLoading } = useProduct(data.PAGE_URL);
  useReferral();
  const info = priceOf(product, productLoading);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);

  const heroRef  = useRef(null);
  const heroVisible = useOnScreen(heroRef);
  useTrackView(product, data.HANDBOOK.title);

  const buyThis = () => { setCheckoutProduct(product); setIsCheckoutOpen(true); };

  const totalChapters = data.PARTS_RAW.reduce((s, p) => s + p.chapters.length, 0);

  return (
    <div className={cx("hb cc-page", isDark && "is-dark")} data-theme={isDark ? "dark" : "light"}>
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESC} />
        <meta name="keywords"    content={SEO_KEYS} />
        <link rel="canonical" href={`${SITE_URL}${data.PAGE_URL}`} />
        <meta property="og:title"       content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESC} />
        <meta property="og:url"         content={`${SITE_URL}${data.PAGE_URL}`} />
        <meta property="og:type"        content="product" />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESC} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONT_HREF} rel="stylesheet" />
      </Helmet>

      {/* ═══ HERO ════════════════════════════════════════════════════════ */}
      <section className="hb-sec cc-hero hb-tint" ref={heroRef} aria-labelledby="cc-h1">
        <div className="hb-shell">
          <div className="cc-hero-grid">

            {/* left */}
            <div className="cc-hero-copy">
              <div className="cc-pill hb-mono">
                <Terminal size={13} weight="duotone" aria-hidden />
                Claude Code · Complete Handbook · 2026
              </div>

              <div className="cc-hero-prompt" aria-hidden>
                <span className="cc-p-sym">◆</span>
                <span className="cc-p-cmd hb-mono">claude --version</span>
                <span className="cc-p-out hb-mono">Claude Code 1.0 · Anthropic</span>
              </div>

              <h1 id="cc-h1" className="hb-h1">
                Claude Code:<br />
                <span className="hb-mark">The Complete Handbook</span>
              </h1>
              <p className="hb-lead cc-hero-lead">
                Every command, pattern, hook, and workflow—from your first{" "}
                <code className="cc-ic hb-mono">claude login</code> to running agents
                in CI. {totalChapters} chapters, 100 interview Q&amp;A, one PDF.
              </p>

              <div className="cc-stats-card">
                <dl className="cc-stats-grid">
                  {data.STATS.map(([n, l]) => (
                    <div key={l} className="cc-stat-box">
                      <dt className="hb-mono">{n}</dt>
                      <dd>{l}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="cc-hero-buy-box">
                <div className="cc-hero-price-line">
                  <Price info={info} />
                </div>
                <div className="cc-hero-actions">
                  <button type="button" className="hb-btn hb-btn-primary hb-btn-lg cc-hero-btn-primary"
                    onClick={buyThis} disabled={!info.canBuy}>
                    <span>Get the handbook</span>
                    <ArrowRight size={18} weight="bold" aria-hidden />
                  </button>
                  <button type="button" className="hb-btn hb-btn-ghost hb-btn-lg cc-hero-btn-ghost"
                    onClick={() => scrollToId("contents")}>
                    <BookOpen size={17} weight="bold" aria-hidden />
                    <span>Browse contents</span>
                  </button>
                </div>
                <ul className="cc-hero-trust">
                  <li><LockKey size={14} weight="bold" aria-hidden />Secure checkout via {PROVIDER}</li>
                  <li><Lightning size={14} weight="bold" aria-hidden />Digital PDF · instant email delivery</li>
                  <li><ShieldCheck size={14} weight="bold" aria-hidden />Read on phone, tablet or laptop</li>
                </ul>
              </div>
            </div>

            {/* right — simulated VS terminal */}
            <div className="cc-hero-art" aria-hidden>
              <div className="cc-vterm">
                <div className="cc-vterm-bar">
                  <WinDots />
                  <span className="cc-vterm-title hb-mono">
                    <Terminal size={11} weight="duotone" /> TERMINAL
                  </span>
                  <span className="cc-vterm-tabs">
                    <span className="is-active">bash</span>
                    <span>problems</span>
                    <span>output</span>
                  </span>
                </div>
                <div className="cc-vterm-body">
                  <div className="cc-vl"><span className="cc-vl-ps">~/project</span><span className="cc-vl-dollar">$</span><span className="cc-vl-cmd"> claude</span></div>
                  <div className="cc-vout"><span className="cc-vbrand">◆ Claude Code</span><span className="cc-vdim"> by Anthropic</span></div>
                  <div className="cc-vout cc-vdim">Use / for commands, ? for help</div>
                  <div className="cc-vl cc-vprompt"><span className="cc-vgt">›</span><span className="cc-vtyping">Write tests for auth module<Caret /></span></div>
                  <div className="cc-vsteps">
                    <div><span className="cc-vok">◆</span> Reading src/auth/…</div>
                    <div><span className="cc-vok">◆</span> Writing tests/auth.test.ts</div>
                    <div><span className="cc-vok">◆</span> Running vitest…</div>
                    <div className="cc-vsuccess"><span>✓</span> 12 tests passed · 0 failed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main id="main">

        {/* ═══ OVERVIEW ═════════════════════════════════════════════════ */}
        <section id="overview" className="hb-sec" aria-labelledby="overview-h">
          <div className="hb-shell">
            <header className="hb-sec-head">
              <span className="hb-eyebrow">What you're getting</span>
              <h2 id="overview-h" className="hb-h2">The only Claude Code reference you need</h2>
              <p className="hb-lead">
                Claude Code is Anthropic's agentic coding tool that reads your codebase, runs commands,
                edits files, and self-corrects—all autonomously. This handbook covers it end-to-end.
              </p>
            </header>
            <div className="cc-overview-grid">
              <div className="cc-answer">
                <p>
                  Claude Code drives an <strong>agent loop</strong>: read context → pick a tool →
                  execute → observe → decide next step. The handbook shows you how to control every
                  part of that loop: which commands steer it, how <code className="cc-ic hb-mono">CLAUDE.md</code> gives it
                  persistent memory, how hooks let you intercept every action before it lands,
                  and how to run it headless in CI without babysitting.
                </p>
                <p>
                  Part 7 adds 100 interview questions with full answers so you can speak fluently
                  about Claude Code in any technical interview.
                </p>
              </div>
              <div className="cc-includes">
                <p className="cc-includes-label hb-mono">What's inside</p>
                <ul className="hb-checks">
                  {[
                    "7 parts · 29 chapters · 100 interview Q&A",
                    "Every slash command documented with examples",
                    "CLAUDE.md patterns and full project examples",
                    "4 hook recipes you can copy and ship today",
                    "MCP server setup and .mcp.json team sharing",
                    "GitHub Actions CI workflow ready to drop in",
                    "Build-along Todo API: blank folder → shipped",
                    "Glossary of every Claude Code term",
                  ].map(item => (
                    <li key={item}><Check size={14} weight="bold" aria-hidden />{item}</li>
                  ))}
                </ul>
                <div className="cc-includes-buy">
                  <Price info={info} />
                  <button type="button" className="hb-btn hb-btn-primary"
                    onClick={buyThis} disabled={!info.canBuy}>
                    Get the ebook <ArrowRight size={15} weight="bold" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ AGENT LOOP ═══════════════════════════════════════════════ */}
        <section id="loop" className="hb-sec hb-tint" aria-labelledby="loop-h">
          <div className="hb-shell">
            <header className="hb-sec-head">
              <span className="hb-eyebrow">Chapter 01 · The agent loop</span>
              <h2 id="loop-h" className="hb-h2">How Claude Code thinks and acts</h2>
              <p className="hb-lead">
                Every action Claude takes goes through this five-step loop. Understanding it lets you
                steer, pause, and hook into every phase—covered in full in Chapters 1, 10, and 15.
              </p>
            </header>
            <AgentLoop />
            <p className="hb-muted" style={{ marginTop: 20 }}>
              <strong>Deterministic vs non-deterministic control:</strong> you choose. Use
              <code className="cc-ic hb-mono"> /plan</code> mode to keep Claude in read-only analysis,
              or set permission rules so certain tools require explicit approval every time.
            </p>
          </div>
        </section>

        {/* ═══ TERMINAL SAMPLES ═════════════════════════════════════════ */}
        <section id="samples" className="hb-sec" aria-labelledby="samples-h">
          <div className="hb-shell">
            <header className="hb-sec-head">
              <span className="hb-eyebrow">Real code from the book</span>
              <h2 id="samples-h" className="hb-h2">Every example runs in a real terminal</h2>
              <p className="hb-lead">
                No synthetic snippets. Every sample is from an actual Claude Code session and links
                back to the chapter it comes from.
              </p>
            </header>
            <TerminalSamples />
          </div>
        </section>

        {/* ═══ SLASH COMMANDS ═══════════════════════════════════════════ */}
        <section id="commands" className="hb-sec hb-tint" aria-labelledby="commands-h">
          <div className="hb-shell">
            <header className="hb-sec-head">
              <span className="hb-eyebrow">Part 2 · Chapter 04 — Slash commands</span>
              <h2 id="commands-h" className="hb-h2">The commands that run your sessions</h2>
              <p className="hb-lead">
                Chapter 04 is the master reference for every slash command.
                Here's a preview of the twelve you'll use most.
              </p>
            </header>
            <SlashCmds />
          </div>
        </section>

        {/* ═══ CHEAT SHEET STRIP ════════════════════════════════════════ */}
        <section id="cheatsheet" className="hb-sec" aria-labelledby="cheat-h">
          <div className="hb-shell">
            <header className="hb-sec-head">
              <span className="hb-eyebrow">Chapter 26 · Cheat sheet</span>
              <h2 id="cheat-h" className="hb-h2">Keyboard shortcuts you use every session</h2>
            </header>
            <div className="cc-cheat-grid">
              {CHEAT.map(({ key, what }) => (
                <div key={key} className="cc-cheat-row">
                  <kbd className="cc-kbd hb-mono">{key}</kbd>
                  <span>{what}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ LEARNING STAGES ══════════════════════════════════════════ */}
        <section id="stages" className="hb-sec hb-tint" aria-labelledby="stages-h">
          <div className="hb-shell">
            <header className="hb-sec-head">
              <span className="hb-eyebrow">Learning path</span>
              <h2 id="stages-h" className="hb-h2">Seven stages from first login to full automation</h2>
              <p className="hb-lead">Read front to back as a course, or jump to the stage you need. Each builds on the one before.</p>
            </header>
            <ol className="hb-steps cc-stages-grid">
              {data.STAGES.map((s, i) => (
                <li key={s.title}>
                  <span className="hb-mono">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <small className="hb-mono" style={{ color: "var(--brand)", fontSize: 11, letterSpacing: ".06em", textTransform: "uppercase" }}>{s.parts}</small>
                    <b>{s.title}</b>
                    <p>{s.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ═══ TABLE OF CONTENTS ════════════════════════════════════════ */}
        <section id="contents" className="hb-sec" aria-labelledby="contents-h">
          <div className="hb-shell">
            <header className="hb-sec-head">
              <span className="hb-eyebrow">Full table of contents</span>
              <h2 id="contents-h" className="hb-h2">Every part, chapter, and topic</h2>
              <p className="hb-lead">
                Every part starts collapsed. Open one to see chapters and all their topics,
                or search to check a specific concept is covered.
              </p>
            </header>
            <Contents parts={data.PARTS_RAW} />
          </div>
        </section>

        {/* ═══ BUILD-ALONG PROJECT ══════════════════════════════════════ */}
        <section id="build" className="hb-sec hb-tint" aria-labelledby="build-h">
          <div className="hb-shell">
            <header className="hb-sec-head">
              <span className="hb-eyebrow">Chapter 27 · Build-along project</span>
              <h2 id="build-h" className="hb-h2">Ship a real Todo API with Claude Code, step by step</h2>
              <p className="hb-lead">
                Chapter 27 walks you through a complete project from blank folder to production-ready
                API, applying skills from every earlier chapter as you go.
              </p>
            </header>
            <ol className="hb-steps cc-stages-grid">
              {BUILD_STEPS.map(s => (
                <li key={s.n}>
                  <span className="hb-mono">{s.n}</span>
                  <div>
                    <b>{s.title}</b>
                    <p>{s.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ═══ INTERVIEW PREP ═══════════════════════════════════════════ */}
        <section id="interview" className="hb-sec" aria-labelledby="interview-h">
          <div className="hb-shell">
            <div className="cc-interview-grid">
              <div className="cc-interview-copy">
                <span className="hb-eyebrow">Part 7 · Interview prep</span>
                <h2 id="interview-h" className="hb-h2">100 questions.<br />Every chapter covered.</h2>
                <p className="hb-lead">
                  100 curated questions and full answers, grouped into 10 topic sets that map
                  directly to the chapters. Plus a complete glossary.
                </p>
                <ul className="hb-checks" style={{ marginTop: 8 }}>
                  {[
                    "Fundamentals — agent loop, tools, install",
                    "Commands — slash commands, CLI flags, models",
                    "Context — window management, CLAUDE.md",
                    "Safety — permissions, modes, sandbox",
                    "Extensions — skills, hooks, MCP, subagents",
                    "Automation — CI, SDK, headless runs",
                    "Scenarios and judgement questions",
                  ].map(item => <li key={item}><Check size={14} weight="bold" aria-hidden />{item}</li>)}
                </ul>
              </div>

              {/* Q&A terminal */}
              <div className="cc-qa-term" aria-hidden>
                <div className="cc-qa-bar">
                  <WinDots />
                  <span className="hb-mono" style={{ fontSize: 11.5, color: "#8b949e" }}>interview-prep.md</span>
                </div>
                <div className="cc-qa-body">
                  {[
                    { q: "What is the Claude Code agent loop?", a: "Claude reads context, picks a tool, executes it, observes the output, then decides the next step — repeating until done or a turn limit is hit." },
                    { q: "How does CLAUDE.md differ from a system prompt?", a: "CLAUDE.md is loaded from disk at the start of every session and can include imports — it's persistent memory across restarts, not a one-off prompt." },
                    { q: "When should you use a hook vs a skill?", a: "Hooks react to lifecycle events (save, run, stop). Skills are reusable, invocable task templates. Use both together for the most reliable workflows." },
                  ].map((item, i) => (
                    <div key={i} className="cc-qa-item">
                      <p className="cc-qa-q"><span className="cc-qa-badge cc-qa-q-badge">Q</span>{item.q}</p>
                      <p className="cc-qa-a"><span className="cc-qa-badge cc-qa-a-badge">A</span>{item.a}</p>
                    </div>
                  ))}
                  <p className="cc-qa-more cc-vbrand">+ 97 more in Part 7…</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ WHO IT'S FOR + WHAT YOU GET ══════════════════════════════ */}
        <section id="for-you" className="hb-sec hb-tint" aria-labelledby="for-you-h">
          <div className="hb-shell">
            <header className="hb-sec-head">
              <span className="hb-eyebrow">Who it's for</span>
              <h2 id="for-you-h" className="hb-h2">Made for engineers who build with Claude Code</h2>
            </header>
            <div className="hb-split">
              <ul className="hb-who">
                {data.AUDIENCE.map(a => (
                  <li key={a.title}>
                    <Path size={18} weight="duotone" aria-hidden />
                    <div><b>{a.title}</b><p>{a.copy}</p></div>
                  </li>
                ))}
              </ul>
              <div className="hb-get">
                <p className="hb-get-k">What you get</p>
                <ul>
                  {data.VALUE.map(v => (
                    <li key={v.title}>
                      <BookOpen size={18} weight="duotone" aria-hidden />
                      <div><b>{v.title}</b><p>{v.copy}</p></div>
                    </li>
                  ))}
                </ul>
                <div className="hb-get-buy">
                  <Price info={info} />
                  <button type="button" className="hb-btn hb-btn-primary hb-btn-block"
                    onClick={buyThis} disabled={!info.canBuy}>
                    Get the ebook <ArrowRight size={16} weight="bold" aria-hidden />
                  </button>
                  <p style={{ fontSize: 12.5, color: "var(--panel-muted)", margin: 0 }}>
                    Digital PDF · emailed after purchase · not refundable · {SUPPORT_EMAIL}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ════════════════════════════════════════════════ */}
        <FinalSection
          title={<>Know Claude Code inside out,{" "}<span className="hb-mark">ship faster because of it.</span></>}
          line={`7 parts · ${totalChapters} chapters · 100 interview Q&A · full glossary — one digital PDF.`}
          info={info}
          onBuy={buyThis}
          onPreview={null}
          previewLabel={null}
        >
          <ResumePromo variant="banner" isDark={isDark} />
        </FinalSection>

      </main>

      <BookFooter
        line="Claude Code: The Complete Handbook · Digital PDF ebook · Digital purchases are not refundable"
        links={[
          ["/book/genai/google-adk", "Google ADK Handbook"],
          ["/book/genai/mcp", "MCP Handbook"],
          ["/book/cloud/gcp", "GCP Handbook"],
          ["/book/system-design/hld", "System Design HLD"],
        ]}
      />

      {/* ═══ STICKY BUY BAR (identical to HLD page) ═══════════════════ */}
      <BuyBar
        name={data.HANDBOOK.title}
        info={info}
        onBuy={buyThis}
        onPreview={null}
        hidden={isCheckoutOpen}
        heroVisible={heroVisible}
        previewLabel={null}
      />

      <PayUCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={checkoutProduct || product}
      />
    </div>
  );
}
