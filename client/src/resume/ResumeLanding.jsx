import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Brain, LinkedinLogo, Sparkle, UserCircle, Prohibit } from "@phosphor-icons/react";

import { cachedPackages, fetchPackages, formatINR, myPlans } from "./api";
import {
  AI_VS_HUMAN, ATS_ANSWER, ATS_DO, ATS_DONT, ATS_HOW, FAQ, INSIDE, INSIDE_TAGS, MISTAKES, PAGE_URL, PLAN_TYPES, REVIEWER_ANSWER, REVIEWER_POINTS,
  REVIEWER_PROCESS, SECTIONS, SEO, STEPS, UPDATED_ISO, WHICH_PLAN, WHO_FOR, planType,
} from "./landingContent";
import PlanPicker, { usePlanBuy } from "./PlanPicker";
import { ReviewView } from "./ResumeDetail";
import { SAMPLE_AI, SAMPLE_HUMAN, SAMPLE_POOL } from "./sampleReview";
import { schemaJson } from "./seo";
import { Bar, Btn, Kicker, Page, Pill, ScoreRing, Skeleton, Tick, cx, toneOf, useReveal } from "./ui";

const OG_IMAGE = "https://i.postimg.cc/13B9k289/target-Trek-logo-2.jpg";

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

/* a section: one h2, an optional kicker and lead, then the content */
function Section({ id, kicker, title, lead, alt = false, center = false, children, answer }) {
  return (
    <section id={id} className={cx("rv-section", alt && "rv-alt")} aria-labelledby={`${id}-h`} style={{ scrollMarginTop: 80 }}>
      <div className="rv-shell">
        <header className={cx("rv-head rv-reveal", center && "rv-center")}>
          {kicker && <Kicker>{kicker}</Kicker>}
          <h2 id={`${id}-h`} className="rv-h2">{title}</h2>
          {lead && <p className="rv-lead">{lead}</p>}
        </header>
        {answer && <p className="rv-answer rv-reveal" style={{ marginTop: 28, maxWidth: 820 }}>{answer}</p>}
        <div style={{ marginTop: 40 }}>{children}</div>
      </div>
    </section>
  );
}

const TYPE_ICON = { ai: Brain, human: UserCircle, linkedin: LinkedinLogo, mix: Sparkle };
const RETURN_KEY = "resume:returnTo";

/* ============================ hero ============================ */
function Hero({ onPick, paid, signedIn, onLogin }) {
  return (
    <header className="rv-section rv-hero">
      <div className="rv-shell rv-center-col">
        <Pill className="rv-in"><span className="rv-dot" style={{ color: "var(--rv-bad)" }} />Applied to 50 jobs and heard nothing?</Pill>
        <h1 className="rv-h1 rv-in" style={{ marginTop: 24, "--i": 1, maxWidth: 940 }}>Not getting interview calls? <span className="rv-strike">Your resume</span> is probably the reason.</h1>
        <p className="rv-lead rv-in" style={{ marginTop: 24, maxWidth: 680, "--i": 2 }}>Most resumes are rejected by software or skimmed in ten seconds, long before anyone judges your skills. Pick a review, upload your resume and find out exactly what is costing you shortlists.</p>

        <div className="rv-heropick rv-in" style={{ "--i": 3 }} role="group" aria-label="Choose the kind of review">
          {PLAN_TYPES.filter((t) => t.id !== "all").map((t) => {
            const Icon = TYPE_ICON[t.id];
            return (
              <button key={t.id} type="button" onClick={() => onPick(t.id)} className="rv-card rv-hover">
                <Icon size={24} weight="duotone" aria-hidden />
                <b>{t.label}</b>
                <span className="rv-xs rv-muted">{t.blurb}</span>
                <span className="rv-xs" style={{ fontWeight: 700, display: "inline-flex", gap: 6, alignItems: "center", marginTop: "auto" }}>See plans <ArrowRight size={12} weight="bold" aria-hidden /></span>
              </button>
            );
          })}
        </div>

        <div className="rv-row rv-hero-btns rv-in" style={{ marginTop: 32, justifyContent: "center", "--i": 4 }}>
          <Btn as="a" href="#pricing" size="lg">Choose a plan <ArrowRight size={17} weight="bold" aria-hidden /></Btn>
          <Btn as="a" href="#sample" variant="ghost" size="lg">See a sample review</Btn>
          {paid && <Btn as={Link} to="/resume-review/app" variant="ghost" size="lg"><UserCircle size={18} weight="duotone" aria-hidden />My reviews and plans</Btn>}
          {!signedIn && <Btn as={Link} to="/resume-review/login" variant="ghost" size="lg" onClick={onLogin}><UserCircle size={18} weight="duotone" aria-hidden />Log in</Btn>}
        </div>
        <p className="rv-updated rv-in" style={{ marginTop: 20, "--i": 5 }}>One-time payment · No subscription{!signedIn && <> · Already bought a plan? <Link to="/resume-review/login" className="rv-link" onClick={onLogin}>Log in</Link></>}</p>
      </div>
    </header>
  );
}

/* ============================ plans ============================ */
function Plans({ packs, failed, type, setType, buyer }) {
  return (
    <Section id="pricing" kicker="Plans" title="Pick the review that fits. Pay once." lead="Choose AI reviews, a working professional, a LinkedIn review, or a mix. Credits from several plans add up." center>
      <div className="rv-reveal"><PlanPicker packs={packs} failed={failed} type={type} setType={setType} buyer={buyer} /></div>

      <div className="rv-nocancel rv-reveal">
        <Prohibit size={22} weight="duotone" aria-hidden />
        <p><b>No plan can be cancelled once bought.</b> Every plan is a single payment: no subscription, nothing renews, you are never charged again. Your reviews stay in your account until the plan's validity ends.</p>
      </div>

      <h3 className="rv-h3 rv-reveal" style={{ margin: "56px 0 8px" }}>Which plan is right for me?</h3>
      <div className="rv-auto" style={{ "--min": "260px", marginTop: 20 }}>
        {WHICH_PLAN.map(([a, b], i) => <div key={a} className="rv-card rv-reveal" style={{ padding: 22, "--i": i % 4 }}><p style={{ fontWeight: 700 }}>{a}</p><p className="rv-muted" style={{ marginTop: 8, fontSize: 15, lineHeight: 1.65 }}>{b}</p></div>)}
      </div>
    </Section>
  );
}

/* ============================ sample result: the real review page, with made-up data ============================ */
/* Flip to true to show the human-review sample again (a second tab, and the "get a human review" box). */
const SHOW_HUMAN_SAMPLE = false;

function Sample() {
  const [tab, setTab] = useState("ai");
  const [open, setOpen] = useState(false);
  const [small, setSmall] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  useEffect(() => {
    const on = () => setSmall(window.innerWidth < 768);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  const full = SHOW_HUMAN_SAMPLE && tab === "human" ? SAMPLE_HUMAN : SAMPLE_AI;
  // phones: render only the top of the report until they ask for the rest, so the page never builds one giant, many-thousand-pixel box (iOS Safari paints those blank)
  const folded = small && !open;
  const r = folded && full.ai?.result
    ? { ...full, ai: { ...full.ai, result: (({ overallScore, atsScore, shortlistChance, headline, summary, recruiterFirstImpression }) => ({ overallScore, atsScore, shortlistChance, headline, summary, recruiterFirstImpression }))(full.ai.result) } }
    : full;
  return (
    <Section id="sample" kicker="Sample result" title="This is exactly what you see after you upload" lead="The real review page, with a made-up resume: scores, your chance of being shortlisted, experience vs the role, every weakness explained, rewritten bullets, interview questions and a plan for the week." alt>
      {SHOW_HUMAN_SAMPLE && <div className="rv-tabs rv-reveal" role="tablist" aria-label="Sample result" style={{ marginBottom: 18 }}>
        {[["ai", "AI report ready"], ["human", "Human review delivered"]].map(([id, l]) => <button key={id} role="tab" type="button" aria-selected={tab === id} onClick={() => setTab(id)}>{l}</button>)}
      </div>}
      <div className={cx("rv-mac rv-reveal", folded && "rv-mac-fold")}>
        <div className="rv-mac-bar" aria-hidden><i /><i /><i /><span>targettrek.in / resume-review / app / requests</span></div>
        <div className="rv-mac-body rv-sample">
          <ReviewView r={r} canAsk={SHOW_HUMAN_SAMPLE && tab === "ai"} pool={SAMPLE_POOL} sent={false} preview />
        </div>
        <div className="rv-mac-more"><Btn variant="ghost" onClick={() => setOpen(true)}>Show full sample review</Btn></div>
      </div>
      <div className="rv-row" style={{ justifyContent: "center", marginTop: 32 }}><Btn as="a" href="#pricing" size="lg">Get my own review <ArrowRight size={17} weight="bold" aria-hidden /></Btn></div>
    </Section>
  );
}

/* ============================ 12 mistakes: one big screen, list on the left, detail on the right ============================ */
function Mistakes() {
  const [i, setI] = useState(0);
  return (
    <section id="mistakes" className="rv-section rv-mist" aria-labelledby="mistakes-h" style={{ scrollMarginTop: 80 }}>
      <div className="rv-shell">
        <header className="rv-head rv-reveal">
          <Kicker>Fix your resume</Kicker>
          <h2 id="mistakes-h" className="rv-h2">12 resume mistakes that stop interview calls, and how to fix each one</h2>
          <p className="rv-lead">Pick a mistake to see why it costs you shortlists, how to fix it, and a before and after.</p>
        </header>
        <div className="rv-mm rv-reveal">
          <div className="rv-mm-list" role="tablist" aria-label="Resume mistakes" aria-orientation="vertical">
            {MISTAKES.map((m, n) => (
              <button key={m.title} id={`mm-t-${n}`} role="tab" type="button" aria-selected={i === n} aria-controls={`mm-p-${n}`} onClick={() => setI(n)}>
                <span className="rv-mnum">{n + 1}</span><span>{m.title}</span>
              </button>
            ))}
          </div>
          <div className="rv-mm-pane">
            {MISTAKES.map((m, n) => (
              <article key={m.title} id={`mm-p-${n}`} role="tabpanel" aria-labelledby={`mm-t-${n}`} hidden={i !== n}>
                <p className="rv-mono rv-subtle" style={{ fontSize: 13, fontWeight: 600 }}>MISTAKE {String(n + 1).padStart(2, "0")} / 12</p>
                <h3 className="rv-h2" style={{ fontSize: "clamp(24px, 3vw, 36px)", marginTop: 12 }}>{m.title}</h3>
                <p className="rv-muted" style={{ lineHeight: 1.75, marginTop: 18, fontSize: 16.5 }}><b style={{ color: "var(--rv-text)" }}>Why it costs you calls. </b>{m.why}</p>
                <p style={{ fontWeight: 700, margin: "26px 0 12px" }}>How to fix it</p>
                <ul className="rv-fixlist">{m.fix.map((f) => <li key={f}>{f}</li>)}</ul>
                <div className="rv-ba"><div className="b"><small>BEFORE</small>{m.before}</div><div className="a"><small>AFTER</small>{m.after}</div></div>
                <div className="rv-mm-nav">
                  <Btn variant="ghost" size="sm" disabled={n === 0} onClick={() => setI(n - 1)}>Previous</Btn>
                  <Btn size="sm" disabled={n === MISTAKES.length - 1} onClick={() => setI(n + 1)}>Next mistake <ArrowRight size={14} weight="bold" aria-hidden /></Btn>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ how it works ============================ */
function How() {
  return (
    <Section id="how-it-works" kicker="How it works" title="How Resume Lab works, step by step" lead="Six steps from choosing a plan to a better resume. Payment comes first, so everything after it is simple.">
      <div className="rv-split even">
        <ol className="rv-steps-l">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rv-reveal" style={{ "--i": i % 3 }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 12px" }}><h3 className="rv-h3">{s.title}</h3><Pill>{s.time}</Pill></div>
              <p className="rv-muted" style={{ marginTop: 8, lineHeight: 1.7, maxWidth: 560 }}>{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="rv-card rv-card-pad rv-reveal" style={{ position: "sticky", top: 100 }}>
          <p className="rv-kicker">Four kinds of plan</p>
          <div style={{ display: "grid", gap: 18, marginTop: 22 }}>
            {[["ai", "AI reviews", "Instant report with score, ATS check, keyword gaps and rewritten bullets. Ready in minutes."],
              ["human", "Human review", "A working professional reads your resume and writes detailed, personal feedback."],
              ["linkedin", "LinkedIn review", "Your live profile checked against your resume by a person."],
              ["mix", "Mix", "AI report, human resume review and LinkedIn review together."]].map(([id, t, d]) => {
              const Icon = TYPE_ICON[id];
              return <div key={id} style={{ display: "flex", gap: 14 }}><span className="rv-ico"><Icon size={20} weight="duotone" aria-hidden /></span><div><b>{t}</b><p className="rv-muted rv-sm" style={{ marginTop: 2 }}>{d}</p></div></div>;
            })}
          </div>
          <p className="rv-hint" style={{ marginTop: 22 }}>You can buy more than one plan. Credits add up and each plan keeps its own validity.</p>
        </div>
      </div>
    </Section>
  );
}

/* ============================ who reviews ============================ */
function Reviewers() {
  return (
    <Section id="reviewers" kicker="Who reviews your resume" title="A working professional reviews your resume, not just a bot" alt answer={REVIEWER_ANSWER}>
      <div className="rv-auto" style={{ "--min": "250px" }}>
        {REVIEWER_POINTS.map(([t, d], i) => (
          <div key={t} className="rv-tile rv-reveal" style={{ "--i": i % 4 }}><h3 className="rv-h3">{t}</h3><p className="rv-muted rv-sm" style={{ marginTop: 10, fontSize: 15 }}>{d}</p></div>
        ))}
      </div>

      <h3 className="rv-h3 rv-reveal" style={{ margin: "56px 0 8px" }}>What the reviewer does with your resume, in order</h3>
      <p className="rv-muted rv-reveal" style={{ maxWidth: 680 }}>Not a template and not a checklist. A real person spends real time on your resume.</p>
      <ol className="rv-auto" style={{ "--min": "300px", marginTop: 24 }}>
        {REVIEWER_PROCESS.map(([t, d], i) => (
          <li key={t} className="rv-card rv-reveal" style={{ padding: 22, "--i": i % 3 }}><span className="rv-mono rv-subtle" style={{ fontSize: 13, fontWeight: 600 }}>0{i + 1}</span><h4 className="rv-h3" style={{ marginTop: 12 }}>{t}</h4><p className="rv-muted" style={{ marginTop: 8, fontSize: 15, lineHeight: 1.65 }}>{d}</p></li>
        ))}
      </ol>

      <h3 className="rv-h3 rv-reveal" style={{ margin: "56px 0 8px" }}>What the AI does, and what the person does</h3>
      <p className="rv-muted rv-reveal" style={{ maxWidth: 680 }}>Each does the part it is best at, so you get speed and judgement together.</p>
      <div className="rv-auto" style={{ "--min": "300px", marginTop: 24 }}>
        {AI_VS_HUMAN.map((c, i) => (
          <article key={c.who} className="rv-card rv-card-pad rv-reveal" style={{ "--i": i, ...(i === 1 ? { borderColor: "var(--rv-brand)", borderWidth: 2 } : {}) }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}><h4 className="rv-h3">{c.who}</h4><Pill className={i === 1 ? "dark" : ""}>{c.when}</Pill></div>
            <ul className="rv-fixlist" style={{ marginTop: 20 }}>{c.items.map((x) => <li key={x}>{x}</li>)}</ul>
          </article>
        ))}
      </div>
    </Section>
  );
}

/* ============================ what you get / who it's for ============================ */
function Inside() {
  return (
    <Section id="inside" kicker="What you get" title="More than a score: a clear plan to fix your resume" lead="Every plan starts with the AI report. Depending on your plan you also get the items tagged Human or LinkedIn.">
      <div className="rv-auto" style={{ "--min": "280px" }}>
        {INSIDE.map(([t, d], i) => (
          <div key={t} className="rv-tile rv-reveal" style={{ "--i": i % 3 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span className="rv-mono rv-subtle" style={{ fontSize: 13, fontWeight: 600 }}>{String(i + 1).padStart(2, "0")}</span><Pill className={INSIDE_TAGS[i] === "AI" ? "" : "dark"}>{INSIDE_TAGS[i]}</Pill></div>
            <h3 className="rv-h3" style={{ marginTop: 14 }}>{t}</h3><p className="rv-muted" style={{ marginTop: 10, fontSize: 15, lineHeight: 1.65 }}>{d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function WhoFor() {
  return (
    <Section id="who-for" kicker="Who it's for" title="Resume review for students, freshers and working professionals" alt>
      <div className="rv-auto" style={{ "--min": "280px" }}>
        {WHO_FOR.map(([t, d], i) => (
          <div key={t} className="rv-card rv-who rv-reveal rv-hover" style={{ "--i": i % 3 }}><h3 className="rv-h3">{t}</h3><p className="rv-muted" style={{ fontSize: 15, lineHeight: 1.65 }}>{d}</p></div>
        ))}
      </div>
    </Section>
  );
}

/* ============================ ATS ============================ */
function Ats() {
  return (
    <Section id="ats" kicker="ATS explained" title="What is an ATS, and how do you get past it?" answer={ATS_ANSWER}>
      <h3 className="rv-h3 rv-reveal" style={{ marginBottom: 20 }}>How an ATS reads your resume</h3>
      <ol className="rv-auto" style={{ "--min": "240px" }}>
        {ATS_HOW.map(([t, d], i) => (
          <li key={t} className="rv-card rv-reveal" style={{ padding: 22, "--i": i % 4 }}><span className="rv-mono rv-subtle" style={{ fontSize: 13, fontWeight: 600 }}>0{i + 1}</span><h4 className="rv-h3" style={{ marginTop: 14 }}>{t}</h4><p className="rv-muted" style={{ marginTop: 8, fontSize: 15, lineHeight: 1.65 }}>{d}</p></li>
        ))}
      </ol>
      <div className="rv-auto" style={{ "--min": "300px", marginTop: 40 }}>
        <div className="rv-do rv-reveal"><h3 className="rv-h3">Do</h3><ul>{ATS_DO.map((x) => <li key={x}>{x}</li>)}</ul></div>
        <div className="rv-dont rv-reveal" style={{ "--i": 1 }}><h3 className="rv-h3">Don't</h3><ul>{ATS_DONT.map((x) => <li key={x}>{x}</li>)}</ul></div>
      </div>
    </Section>
  );
}

/* ============================ FAQ ============================ */
function Faq() {
  return (
    <Section id="faq" kicker="Questions" title="Resume review questions, answered" lead="Short answers to what people ask most before they start, including cancellation.">
      <div style={{ display: "grid", gap: 12, maxWidth: 860 }}>
        {FAQ.map((f, i) => (
          <details key={f.q} className="rv-det rv-reveal" open={i === 0}>
            <summary><h3>{f.q}</h3></summary>
            <div className="rv-det-body"><p className="rv-muted" style={{ fontSize: 15.5, lineHeight: 1.75 }}>{f.a}</p></div>
          </details>
        ))}
      </div>
    </Section>
  );
}

/*
  The sticky bar, same idea as the System Design book page: docked at the bottom with the two things a visitor needs next.
    signed out        Log in  +  Choose a plan
    signed in, plan   My reviews and plans
    signed in, none   Choose a plan
  Always visible, on every screen size, so a visitor can log in or pick a plan from anywhere on the page.
*/
function StickyBar({ token, hasPlan, packs, onLogin }) {
  const cheapest = packs?.length ? Math.min(...packs.map((p) => Number(p.price)).filter((n) => n > 0)) : null;
  const goPlans = () => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <div className="rv-stick" role="region" aria-label="Quick actions">
      <div className="rv-stick-in">
        <div className="rv-stick-txt">
          <b>{token ? (hasPlan ? "Welcome back" : "Resume Review") : "Resume Review"}</b>
          <span>{token && hasPlan ? "Your reports and credits are in your space." : Number.isFinite(cheapest) && cheapest > 0 ? `Plans from ${formatINR(cheapest)} · pay once, no subscription` : "Pay once, no subscription"}</span>
        </div>
        <div className="rv-stick-btns">
          {!token && <Btn as={Link} to="/resume-review/login" variant="ghost" onClick={onLogin}>Log in</Btn>}
          {token && hasPlan
            ? <Btn as={Link} to="/resume-review/app">My reviews and plans <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
            : <Btn onClick={goPlans}>Choose a plan <ArrowRight size={16} weight="bold" aria-hidden /></Btn>}
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
  // the "My reviews and plans" button is only for people who have paid for a plan
  useEffect(() => {
    if (!token) { setPaid(false); return undefined; }
    let live = true;
    myPlans().then((d) => { if (live) setPaid((d?.plans?.length || 0) > 0); }).catch(() => {});
    return () => { live = false; };
  }, [token]);
  useReveal([packs, type]);
  const plans = useMemo(() => packs || undefined, [packs]);

  // signed out: remember which plan, sign up or log in, and come straight back to pay for it here
  const needLogin = useCallback((plan) => {
    if (token) return false;
    const search = `?buy=${encodeURIComponent(plan.key)}`;
    try { sessionStorage.setItem(RETURN_KEY, `/resume-review${search}`); } catch { /* ignore */ }
    navigate("/resume-review/signup", { state: { from: { pathname: "/resume-review", search } } });
    return true;
  }, [token, navigate]);
  // a plain "Log in" (not tied to a plan) lands in their own space afterwards
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

  const pick = (id) => { setType(id); document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return (
    <Page title={SEO.title} description={SEO.description} className="rv-landing">
      <Head plans={plans} />
      {!token && (
        <div className="rv-loginbar" role="navigation" aria-label="Account">
          <span>Already have an account or a plan?</span>
          <Link to="/resume-review/login" className="rv-link" onClick={rememberApp}>Log in to your space <ArrowRight size={14} weight="bold" aria-hidden /></Link>
        </div>
      )}
      <Hero onPick={pick} paid={paid} signedIn={Boolean(token)} onLogin={rememberApp} />
      <StickyBar token={token} hasPlan={paid} packs={packs} onLogin={rememberApp} />
      <main>
        <Plans packs={packs} failed={failed} type={type} setType={setType} buyer={buyer} />
        <Sample />
        <Mistakes />
        <How />
        <Reviewers />
        <Inside />
        <WhoFor />
        <Ats />
        <Faq />

        <section className="rv-section" aria-label="Get started">
          <div className="rv-shell">
            <div className="rv-panel rv-cta-panel rv-reveal">
              <h2 className="rv-h2" style={{ maxWidth: 680, margin: "0 auto" }}>Your next interview starts with a better resume.</h2>
              <p style={{ color: "var(--rv-panel-muted)", marginTop: 16, maxWidth: 520, marginInline: "auto" }}>Choose a plan, send in your resume, and see your AI report in minutes, with a working professional's notes to follow.</p>
              <a href="#pricing" className="rv-btn rv-btn-lg rv-btn-invert" style={{ marginTop: 32 }}>See plans <ArrowRight size={17} weight="bold" aria-hidden /></a>
            </div>
          </div>
        </section>
      </main>
    </Page>
  );
}
