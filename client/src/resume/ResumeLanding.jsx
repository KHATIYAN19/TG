import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ArrowRight, Brain, Check, FileText, Gauge, LinkedinLogo, MagicWand, Target, UserCircle, Sparkle, SquaresFour, X, FilePdf, Briefcase, PencilSimpleLine,
} from "@phosphor-icons/react";

import { cachedPackages, fetchPackages, formatINR, myPlans } from "./api";
import {
  AI_VS_HUMAN, ATS_ANSWER, ATS_DO, ATS_DONT, ATS_HOW, FAQ, FEATURES, HERO_FACTS, MISTAKES, NEEDS, PAGE_NAV, PAGE_URL, REVIEWER_ANSWER,
  REVIEWER_PROCESS, SEO, STEPS, UPDATED_ISO, WHO_FOR,
} from "./landingContent";
import PlanPicker, { PlanAssurance, PlanCompare, needsFor, usePlanBuy } from "./PlanPicker";
import { ReviewView } from "./ResumeDetail";
import { SAMPLE_AI, SAMPLE_POOL } from "./sampleReview";
import { schemaJson } from "./seo";
import { Btn, Page, cx } from "./ui";

const OG_IMAGE = "https://i.postimg.cc/13B9k289/target-Trek-logo-2.jpg";
const RETURN_KEY = "resume:returnTo";
const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

/* ============================ head: SEO, AEO and GEO ============================ */
function Head({ plans }) {
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
      <meta property="og:image:alt" content="Target Trek Resume Lab" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={SEO.title} />
      <meta name="twitter:description" content={SEO.description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta property="article:modified_time" content={UPDATED_ISO} />
      <script type="application/ld+json">{schemaJson(plans)}</script>
    </Helmet>
  );
}

/* one section: eyebrow, h2, optional lead, then content */
function Section({ id, eyebrow, title, lead, tone = "", children, head = true }) {
  return (
    <section id={id} className={cx("rl-sec", tone && `rl-sec-${tone}`)} aria-labelledby={`${id}-h`}>
      <div className="rv-shell">
        {head && (
          <header className="rl-sec-head">
            {eyebrow && <span className="rl-eyebrow">{eyebrow}</span>}
            <h2 id={`${id}-h`} className="rl-h2">{title}</h2>
            {lead && <p className="rl-lead">{lead}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}

/* ============================ hero ============================ */
/* the hero's picture: a resume line marked up the way a reviewer would, with the report strip under it */
function MarkedResume() {
  return (
    <figure className="rl-paper" aria-label="Example: a resume line marked up by a reviewer, with its AI scores">
      <div className="rl-paper-bar"><FilePdf size={16} weight="duotone" aria-hidden /><span>asha-rao-backend.pdf</span><span className="rl-paper-pg rv-mono">p. 1 / 1</span></div>
      <div className="rl-paper-body">
        <p className="rl-paper-name">Asha Rao</p>
        <p className="rl-paper-sub">Backend Engineer · Bengaluru · 3 yrs</p>
        <p className="rl-paper-h">Experience</p>
        <p className="rl-paper-line"><span className="rl-strike">Responsible for maintaining APIs and fixing bugs.</span></p>
        <p className="rl-paper-line rl-paper-fix"><span className="rl-mark">Maintained 40+ REST APIs and cut production bugs by 35%</span> by adding automated tests.</p>
        <span className="rl-pen rl-pen-1">Duty, not a result. Add a number.</span>
        <p className="rl-paper-line rl-ghost" aria-hidden />
        <p className="rl-paper-line rl-ghost short" aria-hidden />
        <p className="rl-paper-h">Skills</p>
        <p className="rl-paper-line">Java, Spring Boot, PostgreSQL, Redis <span className="rl-gap">+ Kafka?</span></p>
        <span className="rl-pen rl-pen-2">The job asks for Kafka.</span>
      </div>
      <figcaption className="rl-paper-strip">
        <div><span className="rl-strip-k">Overall</span><b className="rv-mono">62<small>/100</small></b></div>
        <div><span className="rl-strip-k">ATS</span><b className="rv-mono">71<small>/100</small></b></div>
        <div className="rl-strip-wide"><span className="rl-strip-k">Missing keywords</span><span className="rl-strip-chips"><i>Kafka</i><i>Docker</i><i>CI/CD</i></span></div>
      </figcaption>
    </figure>
  );
}

function Hero({ paid, signedIn, onLogin, cheapest }) {
  return (
    <header className="rl-hero">
      <div className="rv-shell rl-hero-grid">
        <div className="rl-hero-copy">
          <span className="rl-pill"><span className="rl-dot" />Resume Lab by Target Trek</span>
          <h1 className="rl-h1">Fifty applications, <span className="rl-mark">zero calls?</span> Fix the resume first.</h1>
          <p className="rl-lead">Get an AI report in about two minutes, then a working professional's notes. See exactly what is costing you shortlists and how to fix each line.</p>
          <div className="rl-hero-btns">
            <Btn size="lg" onClick={() => scrollTo("pricing")}>See plans{cheapest ? ` from ${formatINR(cheapest)}` : ""} <ArrowRight size={17} weight="bold" aria-hidden /></Btn>
            <Btn size="lg" variant="ghost" onClick={() => scrollTo("features")}>Explore features</Btn>
          </div>
          <p className="rl-hero-alt">
            {paid ? <Link to="/resume-review/app" className="rl-textlink">Go to my reviews and plans <ArrowRight size={14} weight="bold" aria-hidden /></Link>
              : !signedIn ? <>Already bought a plan? <Link to="/resume-review/login" className="rl-textlink" onClick={onLogin}>Log in</Link></>
              : <Link to="/resume-review/app/plans" className="rl-textlink">Choose a plan to get started <ArrowRight size={14} weight="bold" aria-hidden /></Link>}
          </p>
          <dl className="rl-facts">
            {HERO_FACTS.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </div>
        <div className="rl-hero-art"><MarkedResume /></div>
      </div>
      <nav className="rv-shell rl-jump" aria-label="On this page">
        <span>On this page</span>
        <div>{PAGE_NAV.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</div>
      </nav>
    </header>
  );
}

/* ============================ feature explorer ============================ */
const F_ICON = { ai: Brain, human: UserCircle, linkedin: LinkedinLogo, jd: Target, builder: FileText, tailor: MagicWand, rewrite: PencilSimpleLine, space: SquaresFour };
const TYPE_NAME = { ai: "AI", human: "Human", linkedin: "LinkedIn", mix: "Mix" };
const COUNT_WORD = { 4: "Four", 5: "Five", 6: "Six", 7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten" };

/* a small picture for each feature, drawn with the page's own pieces */
function FeatureArt({ id }) {
  if (id === "ai") return (
    <div className="rl-art">
      <div className="rl-art-scores">
        {[["Overall", 62, "warn"], ["ATS", 71, "warn"], ["Shortlist", 38, "bad"]].map(([k, v, t]) => (
          <div key={k} className="rl-art-score"><span>{k}</span><b className="rv-mono">{v}</b><i className={`rl-meter ${t}`}><em style={{ width: `${v}%` }} /></i></div>
        ))}
      </div>
      <div className="rl-art-ba"><p className="b"><small>Before</small>Improved the performance of the search feature.</p><p className="a"><small>After</small>Cut search time from 1.8s to 400ms by adding an index and caching the top 1,000 queries.</p></div>
    </div>
  );
  if (id === "human") return (
    <div className="rl-art">
      <div className="rl-art-note">
        <div className="rl-art-who"><span className="rl-avatar">R</span><div><b>Rahul</b><small>Senior Software Engineer · delivered in 31 h</small></div></div>
        <p>You are a stronger engineer than this resume shows. Lead with the payments platform, cut the first role to three bullets and be specific about scale.</p>
        <ul><li>Move payments work to the top</li><li>Aim for mid-level backend roles</li><li>Link your two best repositories</li></ul>
      </div>
    </div>
  );
  if (id === "linkedin") return (
    <div className="rl-art">
      <div className="rl-art-li">
        <span className="rl-art-k">Headline</span>
        <p className="rl-strike">Software Engineer</p>
        <p className="rl-mark">Backend Engineer · Java, Spring Boot, AWS</p>
        <span className="rl-art-k">About</span>
        <p className="rl-muted">Repeats the resume. Use it to tell the payments story in three lines.</p>
      </div>
    </div>
  );
  if (id === "jd") return (
    <div className="rl-art">
      <span className="rl-art-k">You match</span>
      <div className="rl-chips ok">{["Java", "Spring Boot", "PostgreSQL", "REST APIs", "Git"].map((x) => <i key={x}>{x}</i>)}</div>
      <span className="rl-art-k">Missing</span>
      <div className="rl-chips bad">{[["Kafka", "must"], ["Docker", "must"], ["CI/CD", "nice"]].map(([x, w]) => <i key={x}>{x}<small>{w}</small></i>)}</div>
    </div>
  );
  if (id === "builder") return (
    <div className="rl-art">
      <ol className="rl-art-steps">{["About you", "Links", "Summary", "Education", "Experience", "Projects", "Skills", "Finish"].map((s, i) => <li key={s} className={i < 4 ? "done" : i === 4 ? "now" : ""}>{s}</li>)}</ol>
      <div className="rl-art-tpls">{["Classic", "Modern", "Compact"].map((t, i) => <span key={t} className={i === 1 ? "on" : ""}><i /><i /><i />{t}</span>)}</div>
    </div>
  );
  if (id === "tailor") return (
    <div className="rl-art">
      <div className="rl-art-q">
        <span className="rl-art-k">The job asks for Docker</span>
        <p>Have you used it, for example in a project or internship? If yes, tell us where.</p>
        <div className="rl-art-qa"><span className="on">Yes, in my booking API project</span><span>No</span></div>
      </div>
      <p className="rl-art-foot"><Check size={14} weight="bold" aria-hidden />Only skills you confirm go into the new version.</p>
    </div>
  );
  if (id === "rewrite") return (
    <div className="rl-art">
      <div className="rl-art-file"><FilePdf size={34} weight="duotone" aria-hidden /><div><b>Asha-Rao-Backend-Engineer.pdf</b><small>Rewritten by your reviewer · PDF or Word</small></div></div>
    </div>
  );
  return (
    <div className="rl-art">
      <div className="rl-art-space">
        {[["AI reviews", "18 of 30 left", 60], ["Human reviews", "1 of 2 left", 50], ["Days left", "21 days", 70]].map(([k, v, w]) => (
          <div key={k}><span>{k}</span><b>{v}</b><i className="rl-meter ok"><em style={{ width: `${w}%` }} /></i></div>
        ))}
      </div>
    </div>
  );
}

function Features({ onPickType }) {
  const [i, setI] = useState(0);
  const f = FEATURES[i];
  const Icon = F_ICON[f.id];
  return (
    <Section id="features" eyebrow="Everything inside" title={`${COUNT_WORD[FEATURES.length] || FEATURES.length} tools to take your resume from ignored to shortlisted`} lead="Pick a feature to see what it does, how long it takes and which plans include it.">
      <div className="rl-explorer">
        <div className="rl-flist" role="tablist" aria-label="Features" aria-orientation="vertical">
          {FEATURES.map((x, n) => {
            const I = F_ICON[x.id];
            return (
              <button key={x.id} id={`ft-${x.id}`} role="tab" type="button" aria-selected={i === n} aria-controls="fpanel" className="rl-ftab" onClick={() => setI(n)}>
                <I size={20} weight="duotone" aria-hidden />
                <span>{x.name}</span>
                <small className={x.where === "account" ? "free" : ""}>{x.where === "account" ? "Free" : "Paid"}</small>
              </button>
            );
          })}
        </div>
        <article id="fpanel" role="tabpanel" aria-labelledby={`ft-${f.id}`} className="rl-fpanel" key={f.id}>
          <div className="rl-fpanel-copy">
            <div className="rl-fpanel-top"><span className="rl-fico"><Icon size={24} weight="duotone" aria-hidden /></span><span className="rl-fmeta">{f.time}</span></div>
            <h3 className="rl-h3">{f.name}</h3>
            <p className="rl-fpitch">{f.pitch}</p>
            <ul className="rl-checks">{f.points.map((p) => <li key={p}><Check size={15} weight="bold" aria-hidden />{p}</li>)}</ul>
            <div className="rl-fwhere">
              {f.where === "account"
                ? <p><b>Free with any account.</b> Find it in your space after you log in.</p>
                : <p><b>{f.some ? "On some plans of type:" : "Included in:"}</b> {f.plans.map((p) => <button key={p} type="button" className="rl-tag" onClick={() => onPickType(p)}>{TYPE_NAME[p]}</button>)}</p>}
            </div>
          </div>
          <div className="rl-fpanel-art"><FeatureArt id={f.id} /></div>
        </article>
      </div>
    </Section>
  );
}

/* ============================ how it works ============================ */
function How() {
  return (
    <Section id="how-it-works" eyebrow="How it works" title="From plan to better resume in six steps" lead="Payment comes first, so everything after it is simple." tone="tint">
      <ol className="rl-steps">
        {STEPS.map((s, i) => (
          <li key={s.title}>
            <span className="rl-step-n rv-mono">{String(i + 1).padStart(2, "0")}</span>
            <h3>{s.title}</h3>
            <span className="rl-step-t">{s.time}</span>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ============================ sample result: the real review page, with made-up data ============================ */
function Sample() {
  const [open, setOpen] = useState(false);
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const on = () => setSmall(window.innerWidth < 768);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  // folded until they ask for the rest. Phones also render only the top of the data (iOS Safari paints very tall boxes blank)
  const folded = !open;
  const r = folded && small && SAMPLE_AI.ai?.result
    ? { ...SAMPLE_AI, ai: { ...SAMPLE_AI.ai, result: (({ overallScore, atsScore, shortlistChance, headline, summary, recruiterFirstImpression }) => ({ overallScore, atsScore, shortlistChance, headline, summary, recruiterFirstImpression }))(SAMPLE_AI.ai.result) } }
    : SAMPLE_AI;
  return (
    <Section id="sample" eyebrow="Sample report" title="This is the page you get after you upload" lead="The real review page with a made-up resume: scores, your chance of a shortlist, every weakness explained, rewritten bullets, interview questions and a plan for the week.">
      <div className={cx("rv-mac", folded && "rv-mac-fold")}>
        <div className="rv-mac-bar" aria-hidden><i /><i /><i /><span>targettrek.in / resume-review / app / requests</span></div>
        <div className="rv-mac-body rv-sample">
          <ReviewView r={r} canAsk={false} pool={SAMPLE_POOL} sent={false} preview />
        </div>
        <div className="rv-mac-more"><Btn variant="ghost" onClick={() => setOpen(true)}>Show the full sample report</Btn></div>
      </div>
      <div className="rl-center-row"><Btn size="lg" onClick={() => scrollTo("pricing")}>Get my own report <ArrowRight size={17} weight="bold" aria-hidden /></Btn></div>
    </Section>
  );
}

/* ============================ plans ============================ */
function Pricing({ packs, failed, type, setType, buyer }) {
  return (
    <Section id="pricing" eyebrow="Plans" title="Pick the review you need. Pay once." lead="Every plan starts with the AI report. Add a working professional, a LinkedIn review, or both." tone="tint">
      <div className="rl-needs" aria-label="Quick pick">
        <span>I want</span>
        {needsFor(NEEDS, packs).map(([label, id]) => <button key={label} type="button" className={type === id ? "is-on" : ""} onClick={() => setType(id)}>{label}</button>)}
      </div>
      <PlanPicker packs={packs} failed={failed} type={type} setType={setType} buyer={buyer} />
      <PlanAssurance />
      <div className="rl-sub-block">
        <h3 className="rl-h3">Compare the kinds of plan</h3>
        <PlanCompare onPick={(id) => { setType(id); scrollTo("pricing"); }} />
      </div>
    </Section>
  );
}

/* ============================ who reviews ============================ */
function Reviewers() {
  return (
    <Section id="reviewers" eyebrow="Human review" title="A working professional reads your resume, not just a bot">
      <p className="rl-answer">{REVIEWER_ANSWER}</p>
      <div className="rl-vs">
        {AI_VS_HUMAN.map((c, i) => (
          <article key={c.who} className={cx("rl-vs-card", i === 1 && "is-human")}>
            <div className="rl-vs-top">{i === 0 ? <Brain size={22} weight="duotone" aria-hidden /> : <UserCircle size={22} weight="duotone" aria-hidden />}<h3>{c.who}</h3><span>{c.when}</span></div>
            <ul className="rl-checks">{c.items.map((x) => <li key={x}><Check size={15} weight="bold" aria-hidden />{x}</li>)}</ul>
          </article>
        ))}
      </div>
      <h3 className="rl-h3 rl-sub-title">What the reviewer does, in order</h3>
      <ol className="rl-process">
        {REVIEWER_PROCESS.map(([t, d], i) => <li key={t}><span className="rv-mono">{i + 1}</span><div><b>{t}</b><p>{d}</p></div></li>)}
      </ol>
    </Section>
  );
}

/* ============================ 12 mistakes ============================ */
function Mistakes() {
  const [i, setI] = useState(0);
  const m = MISTAKES[i];
  return (
    <Section id="mistakes" eyebrow="Free guide" title="12 resume mistakes that stop interview calls" lead="Pick a mistake to see why it costs you shortlists, how to fix it, and a before and after." tone="tint">
      <div className="rl-mm">
        <div className="rl-mm-list" role="tablist" aria-label="Resume mistakes">
          {MISTAKES.map((x, n) => (
            <button key={x.title} id={`mm-t-${n}`} role="tab" type="button" aria-selected={i === n} aria-controls="mm-panel" onClick={() => setI(n)}>
              <span className="rv-mono">{String(n + 1).padStart(2, "0")}</span><span className="rl-mm-label">{x.title}</span>
            </button>
          ))}
        </div>
        <article id="mm-panel" role="tabpanel" aria-labelledby={`mm-t-${i}`} className="rl-mm-pane" key={i}>
          <p className="rl-mm-count rv-mono">Mistake {i + 1} of {MISTAKES.length}</p>
          <h3 className="rl-h3">{m.title}</h3>
          <p className="rl-mm-why"><b>Why it costs you calls.</b> {m.why}</p>
          <p className="rl-mm-k">How to fix it</p>
          <ul className="rl-checks">{m.fix.map((f) => <li key={f}><Check size={15} weight="bold" aria-hidden />{f}</li>)}</ul>
          <div className="rl-ba"><p className="b"><small>Before</small>{m.before}</p><p className="a"><small>After</small>{m.after}</p></div>
          <div className="rl-mm-nav">
            <Btn variant="ghost" size="sm" disabled={i === 0} onClick={() => setI(i - 1)}>Previous</Btn>
            <Btn size="sm" disabled={i === MISTAKES.length - 1} onClick={() => setI(i + 1)}>Next mistake <ArrowRight size={14} weight="bold" aria-hidden /></Btn>
          </div>
        </article>
      </div>
    </Section>
  );
}

/* ============================ ATS ============================ */
function Ats() {
  return (
    <Section id="ats" eyebrow="ATS guide" title="What is an ATS, and how do you get past it?">
      <p className="rl-answer">{ATS_ANSWER}</p>
      <ol className="rl-pipe">
        {ATS_HOW.map(([t, d], i) => <li key={t}><span className="rv-mono">{i + 1}</span><b>{t}</b><p>{d}</p></li>)}
      </ol>
      <div className="rl-dodont">
        <div className="do"><h3><Check size={18} weight="bold" aria-hidden />Do</h3><ul>{ATS_DO.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <div className="dont"><h3><X size={18} weight="bold" aria-hidden />Don't</h3><ul>{ATS_DONT.map((x) => <li key={x}>{x}</li>)}</ul></div>
      </div>
    </Section>
  );
}

/* ============================ who it's for ============================ */
const WHO_ICON = [Sparkle, Briefcase, ArrowRight, Gauge, Target, FileText];
function WhoFor() {
  return (
    <Section id="who-for" eyebrow="Who it's for" title="For students, freshers and working professionals" tone="tint">
      <div className="rl-who">
        {WHO_FOR.map(([t, d], i) => {
          const I = WHO_ICON[i];
          return <div key={t}><I size={22} weight="duotone" aria-hidden /><h3>{t}</h3><p>{d}</p></div>;
        })}
      </div>
    </Section>
  );
}

/* ============================ FAQ ============================ */
function Faq() {
  return (
    <section id="faq" className="rl-sec" aria-labelledby="faq-h">
      <div className="rv-shell rl-faq-grid">
        <header className="rl-faq-side">
          <span className="rl-eyebrow">Questions</span>
          <h2 id="faq-h" className="rl-h2">Resume review questions, answered</h2>
          <p className="rl-lead">Still unsure? Write to <b className="rl-select">supporttargettrek@gmail.com</b> and a person replies.</p>
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
  );
}

/*
  The sticky bar: docked at the bottom with the two things a visitor needs next.
    signed out        Log in  +  Choose a plan
    signed in, plan   My reviews and plans
    signed in, none   Choose a plan
*/
function StickyBar({ token, hasPlan, cheapest, onLogin }) {
  return (
    <div className="rv-stick" role="region" aria-label="Quick actions">
      <div className="rv-stick-in">
        <div className="rv-stick-txt">
          <b>{token && hasPlan ? "Welcome back" : "Resume Lab"}</b>
          <span>{token && hasPlan ? "Your reports and credits are in your space." : cheapest ? `Plans from ${formatINR(cheapest)} · pay once, no subscription` : "Pay once, no subscription"}</span>
        </div>
        <div className="rv-stick-btns">
          {!token && <Btn as={Link} to="/resume-review/login" variant="ghost" onClick={onLogin}>Log in</Btn>}
          {token && hasPlan
            ? <Btn as={Link} to="/resume-review/app">My reviews <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
            : <Btn onClick={() => scrollTo("pricing")}>Choose a plan <ArrowRight size={16} weight="bold" aria-hidden /></Btn>}
        </div>
      </div>
    </div>
  );
}

export default function ResumeLanding() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const token = useSelector((s) => s.auth?.token);
  const [packs, setPacks] = useState(() => cachedPackages());
  const [failed, setFailed] = useState(false);
  const [type, setType] = useState("all");
  const [paid, setPaid] = useState(false);
  useEffect(() => { fetchPackages().then(setPacks).catch(() => { if (!cachedPackages()) setFailed(true); }); }, []);
  useEffect(() => {
    if (!token) { setPaid(false); return undefined; }
    let live = true;
    myPlans().then((d) => { if (live) setPaid((d?.plans?.length || 0) > 0); }).catch(() => {});
    return () => { live = false; };
  }, [token]);
  const plans = useMemo(() => packs || undefined, [packs]);
  const cheapest = useMemo(() => {
    const prices = (packs || []).map((p) => Number(p.price)).filter((n) => n > 0);
    return prices.length ? Math.min(...prices) : null;
  }, [packs]);

  // signed out: remember which plan, sign up or log in, and come straight back to pay for it here
  const needLogin = useCallback((plan) => {
    if (token) return false;
    const search = `?buy=${encodeURIComponent(plan.key)}`;
    try { sessionStorage.setItem(RETURN_KEY, `/resume-review${search}`); } catch { /* ignore */ }
    navigate("/resume-review/signup", { state: { from: { pathname: "/resume-review", search } } });
    return true;
  }, [token, navigate]);
  const rememberApp = useCallback(() => { try { sessionStorage.setItem(RETURN_KEY, "/resume-review/app"); } catch { /* ignore */ } }, []);
  const buyer = usePlanBuy({ onNeedLogin: needLogin });

  const want = params.get("buy");
  const started = useRef(false);
  useEffect(() => {
    if (!want || !token || !packs || started.current) return;
    started.current = true;
    setParams({}, { replace: true });
    const plan = packs.find((p) => p.key === want);
    document.getElementById("pricing")?.scrollIntoView({ block: "start" });
    if (plan) { toast(`Opening secure payment for ${plan.name}…`, { id: "resume-auto-pay", duration: 4000 }); buyer.buy(plan); }
  }, [want, token, packs]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickType = (id) => { setType(id); scrollTo("pricing"); };

  return (
    <Page title={SEO.title} description={SEO.description} className="rv-landing rl">
      <Head plans={plans} />
      <Hero paid={paid} signedIn={Boolean(token)} onLogin={rememberApp} cheapest={cheapest} />
      <StickyBar token={token} hasPlan={paid} cheapest={cheapest} onLogin={rememberApp} />
      <main>
        <Features onPickType={pickType} />
        <How />
        <Sample />
        <Pricing packs={packs} failed={failed} type={type} setType={setType} buyer={buyer} />
        <Reviewers />
        <Mistakes />
        <Ats />
        <WhoFor />
        <Faq />
        <section className="rl-sec" aria-label="Get started">
          <div className="rv-shell">
            <div className="rl-final">
              <h2 className="rl-h2">Your next interview starts with <span className="rl-mark">a better resume.</span></h2>
              <p>Choose a plan, upload your resume, and read your AI report in minutes, with a working professional's notes to follow.</p>
              <div className="rl-hero-btns">
                <Btn size="lg" onClick={() => scrollTo("pricing")}>See plans <ArrowRight size={17} weight="bold" aria-hidden /></Btn>
                <Btn as={Link} to={token ? "/resume-review/app" : "/resume-review/login"} size="lg" variant="ghost" onClick={token ? undefined : rememberApp}>{token ? "Go to my space" : "Log in"}</Btn>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Page>
  );
}
