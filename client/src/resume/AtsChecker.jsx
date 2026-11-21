import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowRight, ArrowsClockwise, CaretRight, Check, CheckCircle, FilePdf, Gauge, LockSimple, MagicWand, Sparkle, Target, UploadSimple, Warning, X, XCircle,
} from "@phosphor-icons/react";

import { checkAts, pdfToText } from "./atsCheck";
import {
  ATS_LIST, ATS_WEIGHTS, FAQ, FORMAT_ROWS, GOOD_SCORE_ANSWER, HERO, HERO_FACTS, HOW_TO, IMPROVE, OG_IMAGE, PAGE_NAV, PAGE_URL, SCORE_BANDS, SEO,
  UPDATED_ISO, UPDATED_LABEL, WHAT_IS_ATS_SCORE, schemaJson,
} from "./atsContent";
import { ATS_DO, ATS_DONT } from "./landingContent";
import { useBuilderMode } from "./useBuilder";
import { Btn, Page, ScoreRing, cx } from "./ui";
import { loginUrl } from "../auth/authRedirect";
import "./ats.css";

/*
  /resume-review/ats-score-checker: a free, public ATS score checker (no sign-up), plus the guide content people search for
  ("what is a good ATS score", "how to check ATS score", "ATS friendly resume format"). The checker runs entirely in the browser
  (atsCheck.js); a PDF is read on the visitor's device with pdf.js. It is prerendered, so crawlers get the full page without JavaScript.
*/

const MAX_RESUME = 30000;
const MAX_JOB = 15000;
const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

const SAMPLE_RESUME = `Asha Rao
Backend Engineer · Bengaluru · asha.rao@example.com · +91 98765 43210
linkedin.com/in/asharao · github.com/asharao

Summary
Backend engineer with 3 years building Java and Spring Boot services for a payments company.

Experience
Software Engineer, Acme Payments · Jul 2022 – Present
• Built 40+ REST APIs in Spring Boot that serve 2 million requests a day
• Cut p95 latency from 800ms to 220ms by adding Redis caching to the ledger service
• Responsible for maintaining the build pipeline
• Migrated 3 services to Docker on AWS, saving ₹4 lakh a year in hosting

Projects
Booking API · Java, PostgreSQL
• Designed a seat-booking API with optimistic locking that handled 10,000 test users without double bookings

Skills
Java, Spring Boot, PostgreSQL, Redis, Docker, AWS, Git, JUnit

Education
B.Tech, Computer Science · VIT Vellore · 2022 · CGPA 8.4`;

const SAMPLE_JOB = `We are hiring a Backend Engineer (2–5 years) in Bengaluru.
What you'll do: design and build scalable microservices in Java and Spring Boot, own REST APIs end to end, and improve reliability.
Requirements: strong experience with Java, Spring Boot and PostgreSQL. Kafka is a must. Hands-on Docker and Kubernetes experience is required, along with CI/CD.
Nice to have: AWS, Redis, Terraform, system design experience.`;

/* ============================ head: SEO, AEO and GEO ============================ */
function Head() {
  return (
    <Helmet>
      <title>{SEO.title}</title>
      <meta name="description" content={SEO.description} />
      <meta name="keywords" content={SEO.keywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="author" content="Target Trek" />
      <link rel="canonical" href={PAGE_URL} />
      <link rel="alternate" hrefLang="en-IN" href={PAGE_URL} />
      <link rel="alternate" hrefLang="x-default" href={PAGE_URL} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Target Trek" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={SEO.title} />
      <meta property="og:description" content={SEO.description} />
      <meta property="og:url" content={PAGE_URL} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:alt" content="Free ATS Score Checker by Resume Lab" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={SEO.title} />
      <meta name="twitter:description" content={SEO.description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta property="article:modified_time" content={UPDATED_ISO} />
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      <script type="application/ld+json">{schemaJson()}</script>
    </Helmet>
  );
}

function Section({ id, eyebrow, title, lead, tone = "", children }) {
  return (
    <section id={id} className={cx("rl-sec ats-sec", tone && `rl-sec-${tone}`)} aria-labelledby={`${id}-h`}>
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

/* ============================ the checker ============================ */
const STATUS_ICON = { ok: CheckCircle, warn: Warning, bad: XCircle };
const STATUS_WORD = { ok: "Good", warn: "Improve", bad: "Fix" };

function Result({ r, onAgain }) {
  return (
    <div className="ats-result" aria-live="polite">
      <div className="ats-score">
        <ScoreRing value={r.score} size={132} stroke={10} label="ATS score" />
        <div className="ats-score-copy">
          <p className={cx("ats-grade", r.score >= 65 ? "ok" : r.score >= 50 ? "warn" : "bad")}>{r.grade}</p>
          <p className="ats-score-line">
            {r.hasJob ? "Scored against the job description you pasted." : "General score. Paste a job description to add keyword match, the biggest factor."}
          </p>
          <p className="ats-score-meta rv-mono">{r.words.toLocaleString("en-IN")} words · {r.stats.bullets} bullet points</p>
        </div>
      </div>

      {r.keywords && (
        <div className="ats-kw">
          <div>
            <p className="ats-k">Missing from your resume <span className="rv-mono">({r.keywords.missing.length})</span></p>
            {r.keywords.missing.length ? (
              <div className="rl-chips bad">{r.keywords.missing.map((k) => <i key={k.name}>{k.name}{k.must && <small>required</small>}</i>)}</div>
            ) : <p className="ats-none">None. You cover every skill this job mentions.</p>}
          </div>
          <div>
            <p className="ats-k">You match <span className="rv-mono">({r.keywords.matched.length})</span></p>
            {r.keywords.matched.length ? (
              <div className="rl-chips ok">{r.keywords.matched.map((k) => <i key={k.name}>{k.name}</i>)}</div>
            ) : <p className="ats-none">No matching skills found yet.</p>}
          </div>
        </div>
      )}

      <ol className="ats-checks">
        {r.checks.map((c, i) => {
          const Icon = STATUS_ICON[c.status];
          return (
            <li key={c.id}>
              <details className={cx("ats-check", c.status)} open={i === 0 && c.status !== "ok"}>
                <summary>
                  <Icon size={20} weight="fill" aria-hidden className="ats-check-ico" />
                  <span className="ats-check-name">{c.label}<small>{STATUS_WORD[c.status]} · weight {c.weight}</small></span>
                  <b className="ats-check-num rv-mono" aria-label={`${c.score} out of 100`}>{c.score}</b>
                </summary>
                <div className="ats-check-body">
                  <i className={cx("rl-meter", c.status)} aria-hidden><em style={{ width: `${c.score}%` }} /></i>
                  <p>{c.detail}</p>
                  <ul className="rl-checks">{c.tips.map((t) => <li key={t}><Check size={15} weight="bold" aria-hidden />{t}</li>)}</ul>
                </div>
              </details>
            </li>
          );
        })}
      </ol>

      <div className="ats-result-foot">
        <Btn variant="ghost" onClick={onAgain}><ArrowsClockwise size={16} weight="bold" aria-hidden />Edit and check again</Btn>
        <Btn as={Link} to="/resume-review#pricing">Get a full AI + expert review <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
      </div>
      <p className="ats-fine">This is an estimate from a transparent checklist, not the exact number any one employer's ATS shows. It never guarantees an interview.</p>
    </div>
  );
}

function Checker() {
  const [resume, setResume] = useState("");
  const [job, setJob] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef(null);
  const resultRef = useRef(null);
  const formRef = useRef(null);

  const run = (text = resume, jd = job) => {
    setError("");
    if (String(text).trim().split(/\s+/).length < 40) {
      setError("Paste your full resume (at least a few lines) or upload a PDF.");
      return;
    }
    setResult(checkAts(text, jd));
  };

  useEffect(() => {
    // phones and tablets: the result sits under the form, so bring it into view. Desktop shows it side by side already.
    if (result && resultRef.current && window.innerWidth < 1000) resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setError("");
    if (!/pdf$/i.test(f.type) && !/\.pdf$/i.test(f.name)) { setError("Please choose a PDF file. For Word files, copy the text and paste it."); return; }
    if (f.size > 10 * 1024 * 1024) { setError("That PDF is larger than 10 MB. Please choose a smaller file."); return; }
    setBusy(true);
    try {
      const text = await pdfToText(f);
      if (text.split(/\s+/).filter(Boolean).length < 40) {
        setError("We couldn't read text from this PDF. It may be a scanned image, which most ATS can't read either. Export it as a text PDF from Word or Google Docs.");
        setResume(text);
      } else {
        setResume(text.slice(0, MAX_RESUME));
        setFileName(f.name);
      }
    } catch {
      setError("We couldn't open this PDF. If it's password-protected, remove the password, or paste the text instead.");
    } finally {
      setBusy(false);
    }
  };

  const trySample = () => { setResume(SAMPLE_RESUME); setJob(SAMPLE_JOB); setFileName(""); run(SAMPLE_RESUME, SAMPLE_JOB); };
  const clear = () => { setResume(""); setJob(""); setResult(null); setError(""); setFileName(""); };
  const again = () => { setResult(null); formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <section id="checker" className="ats-tool-sec" aria-labelledby="checker-h">
      <div className="rv-shell">
        <div className="ats-tool">
          <form ref={formRef} className="ats-form" onSubmit={(e) => { e.preventDefault(); run(); }} noValidate>
            <div className="ats-form-head">
              <h2 id="checker-h" className="rl-h3">Check your resume's ATS score</h2>
              <p><LockSimple size={15} weight="bold" aria-hidden />Private: checked in your browser, never uploaded or saved.</p>
            </div>

            <div className="ats-field">
              <div className="ats-label-row">
                <label htmlFor="ats-resume" className="rv-label">1. Your resume <span className="rv-star" aria-hidden>*</span></label>
                <button type="button" className="ats-upload" onClick={() => fileRef.current?.click()} disabled={busy}>
                  {busy ? <span className="rv-spin" aria-hidden /> : <UploadSimple size={16} weight="bold" aria-hidden />}
                  {busy ? "Reading PDF…" : "Upload PDF"}
                </button>
                <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="ats-file" onChange={onFile} tabIndex={-1} aria-hidden />
              </div>
              {fileName && <p className="ats-filename"><FilePdf size={16} weight="duotone" aria-hidden /><span>{fileName}</span><button type="button" onClick={() => { setFileName(""); setResume(""); }} aria-label="Remove file"><X size={14} weight="bold" /></button></p>}
              <textarea
                id="ats-resume"
                className="rv-input ats-area"
                rows={10}
                maxLength={MAX_RESUME}
                placeholder="Paste the full text of your resume here, or upload a PDF."
                value={resume}
                onChange={(e) => { setResume(e.target.value); setFileName(""); }}
                aria-describedby="ats-resume-hint"
              />
              <p id="ats-resume-hint" className="rv-hint">Tip: select all in your resume (Ctrl/Cmd + A), copy and paste. What you see here is roughly what an ATS reads.</p>
            </div>

            <div className="ats-field">
              <label htmlFor="ats-job" className="rv-label">2. Job description <span className="rv-subtle" style={{ fontWeight: 500 }}>· recommended</span></label>
              <textarea
                id="ats-job"
                className="rv-input ats-area ats-area-sm"
                rows={6}
                maxLength={MAX_JOB}
                placeholder="Paste the job posting: responsibilities, requirements and skills."
                value={job}
                onChange={(e) => setJob(e.target.value)}
              />
            </div>

            {error && <p role="alert" className="rv-err"><Warning size={15} weight="fill" style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />{error}</p>}

            <div className="ats-actions">
              <Btn type="submit" size="lg" disabled={busy}><Gauge size={18} weight="bold" aria-hidden />Check my ATS score</Btn>
              <Btn variant="ghost" size="lg" onClick={trySample} disabled={busy}><Sparkle size={17} weight="fill" aria-hidden />Try a sample</Btn>
              {(resume || job || result) && <button type="button" className="ats-clear" onClick={clear}>Clear</button>}
            </div>
          </form>

          <div ref={resultRef} className="ats-out">
            {result ? <Result r={result} onAgain={again} /> : (
              <div className="ats-empty">
                <span className="ats-empty-ico" aria-hidden><Target size={26} weight="duotone" /></span>
                <h3>Your score appears here</h3>
                <p>You'll get a score out of 100, the job keywords you match and miss, and eight checks with a fix for each.</p>
                <ul className="ats-empty-list">
                  {ATS_WEIGHTS.map((w) => <li key={w.id}><span>{w.label}</span><b className="rv-mono">{w.weight}</b></li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ docked action card (same pattern as /resume-review) ============================ */
function StickyBar({ token }) {
  return (
    <div className="rv-stick" role="region" aria-label="Quick actions">
      <div className="rv-stick-in">
        <div className="rv-stick-txt">
          <b>Free ATS Score Checker</b>
          <span>Want a person to read it too? Get an AI report plus a working professional's review.</span>
        </div>
        <div className="rv-stick-btns">
          <Btn variant="ghost" onClick={() => scrollToId("checker")}><Gauge size={16} weight="bold" aria-hidden />Check score</Btn>
          <Btn as={Link} to={token ? "/resume-review/app" : "/resume-review#pricing"}>Full review <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
        </div>
      </div>
    </div>
  );
}

/* ============================ page ============================ */
export default function AtsChecker() {
  const token = useSelector((s) => s.auth?.token);
  const builderOn = useBuilderMode() === "on"; // the builder is only mentioned while the admin has it switched on

  return (
    <Page title={SEO.title} description={SEO.description} className="rv-landing rl ats">
      <Head />

      {/* ================================ HERO ================================ */}
      <header className="rl-hero ats-hero">
        <div className="rv-shell">
          <nav className="ats-crumbs" aria-label="Breadcrumb">
            <ol>
              <li><Link to="/">Target Trek</Link><CaretRight size={12} weight="bold" aria-hidden /></li>
              <li><Link to="/resume-review">Resume Lab</Link><CaretRight size={12} weight="bold" aria-hidden /></li>
              <li aria-current="page">ATS Score Checker</li>
            </ol>
          </nav>
          <div className="ats-hero-copy">
            <span className="rl-pill"><span className="rl-dot" />{HERO.eyebrow}</span>
            <h1 className="rl-h1 ats-h1">{HERO.title} <span className="rl-mark">{HERO.mark}</span></h1>
            <p className="rl-lead">{HERO.lead}</p>
            <div className="rl-hero-btns">
              <Btn size="lg" onClick={() => scrollToId("checker")}>Check my ATS score <ArrowRight size={17} weight="bold" aria-hidden /></Btn>
              <Btn size="lg" variant="ghost" onClick={() => scrollToId("good-score")}>What's a good score?</Btn>
            </div>
            <dl className="rl-facts">
              {HERO_FACTS.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </div>
        </div>
        <nav className="rv-shell rl-jump" aria-label="On this page">
          <span>On this page</span>
          <div>{PAGE_NAV.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</div>
        </nav>
      </header>

      <main>
        <Checker />

        {/* ============================ what is an ATS score ============================ */}
        <Section id="what-is" eyebrow="The basics" title="What is an ATS score?" tone="tint">
          <p className="rl-answer rla-answer">{WHAT_IS_ATS_SCORE}</p>
          <div className="ats-ats-list">
            <p className="ats-k">ATS commonly used by employers hiring in India</p>
            <ul>{ATS_LIST.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </Section>

        {/* ============================ good score ============================ */}
        <Section id="good-score" eyebrow="Benchmarks" title="What is a good ATS score?">
          <p className="rl-answer rla-answer">{GOOD_SCORE_ANSWER}</p>
          <ul className="ats-bands">
            {SCORE_BANDS.map((b) => (
              <li key={b.range} className={b.tone}>
                <span className="ats-band-range rv-mono">{b.range}</span>
                <b>{b.label}</b>
                <p>{b.text}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* ============================ how it's calculated ============================ */}
        <Section id="how-calculated" eyebrow="Transparent scoring" title="How the ATS score is calculated" lead="Eight checks, each with a fixed weight out of 100. Without a job description, the keyword weight is shared across the other seven." tone="tint">
          <div className="ats-weights">
            {ATS_WEIGHTS.map((w) => (
              <div key={w.id} className="ats-weight">
                <div className="ats-weight-top"><b>{w.label}</b><span className="rv-mono">{w.weight}</span></div>
                <i className="rl-meter" aria-hidden><em style={{ width: `${(w.weight / 30) * 100}%` }} /></i>
                <p>{w.note}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ============================ how to use (HowTo) ============================ */}
        <Section id="how-to" eyebrow="How to" title="How to check your ATS score in five steps">
          <ol className="rl-steps ats-steps">
            {HOW_TO.map((s, i) => (
              <li key={s.title}>
                <span className="rl-step-n rv-mono">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* ============================ improve ============================ */}
        <Section id="improve" eyebrow="Fixes that work" title="How to improve your ATS score" lead="In order of impact. Most resumes gain the most from the first three." tone="tint">
          <ol className="ats-improve">
            {IMPROVE.map(([t, d], i) => (
              <li key={t}>
                <span className="rv-mono">{i + 1}</span>
                <div><h3>{t}</h3><p>{d}</p></div>
              </li>
            ))}
          </ol>
        </Section>

        {/* ============================ format ============================ */}
        <Section id="format" eyebrow="Format guide" title="ATS-friendly resume format: what to use and what to avoid">
          <div className="ats-fmt-wrap">
            <table className="ats-fmt">
              <caption className="ats-sr">ATS-friendly resume format: what to use and what to avoid</caption>
              <thead><tr><th scope="col">Item</th><th scope="col">Use</th><th scope="col">Avoid</th></tr></thead>
              <tbody>
                {FORMAT_ROWS.map(([k, ok, bad]) => (
                  <tr key={k}>
                    <th scope="row">{k}</th>
                    <td data-label="Use" className="ok"><Check size={15} weight="bold" aria-hidden /><span>{ok}</span></td>
                    <td data-label="Avoid" className="bad"><X size={15} weight="bold" aria-hidden /><span>{bad}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rl-dodont ats-dodont">
            <div className="do"><h3><Check size={18} weight="bold" aria-hidden />Do</h3><ul>{ATS_DO.map((x) => <li key={x}>{x}</li>)}</ul></div>
            <div className="dont"><h3><X size={18} weight="bold" aria-hidden />Don't</h3><ul>{ATS_DONT.map((x) => <li key={x}>{x}</li>)}</ul></div>
          </div>
        </Section>

        {/* ============================ next step ============================ */}
        <section className="rl-sec" aria-labelledby="next-h">
          <div className="rv-shell">
            <div className="rl-final">
              <h2 id="next-h" className="rl-h2">A good score gets you read. <span className="rl-mark">A great resume gets you called.</span></h2>
              <p>Resume Lab gives you an AI report with rewritten bullets in minutes, then a working professional's notes for your target role.{builderOn ? " Or build a new, ATS-friendly resume tailored to a job." : ""}</p>
              <div className="rl-hero-btns">
                <Btn as={Link} to="/resume-review#pricing" size="lg">See Resume Lab plans <ArrowRight size={17} weight="bold" aria-hidden /></Btn>
                {builderOn
                  ? <Btn as={Link} to={token ? "/resume-review/app/builder" : loginUrl("/resume-review/app/builder", "signup")} size="lg" variant="ghost"><MagicWand size={17} weight="bold" aria-hidden />Build an ATS-friendly resume</Btn>
                  : <Btn size="lg" variant="ghost" onClick={() => scrollToId("checker")}>Check another resume</Btn>}
              </div>
            </div>
          </div>
        </section>

        {/* ============================ FAQ ============================ */}
        <section id="faq" className="rl-sec ats-sec" aria-labelledby="faq-h">
          <div className="rv-shell rl-faq-grid">
            <header className="rl-faq-side">
              <span className="rl-eyebrow">Questions</span>
              <h2 id="faq-h" className="rl-h2">ATS score questions, answered</h2>
              <p className="rl-lead">Still unsure? Write to <b className="rl-select">supporttargettrek@gmail.com</b> and a person replies.</p>
              <p className="ats-updated">Last updated <time dateTime={UPDATED_ISO}>{UPDATED_LABEL}</time></p>
            </header>
            <div className="rl-faq-list">
              {FAQ.map((f, i) => (
                <details key={f.q} className="rl-faq" open={i === 0}>
                  <summary><h3>{f.q}</h3></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <StickyBar token={token} />
    </Page>
  );
}
