import { useContext, useEffect, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft, ArrowRight, Brain, CalendarBlank, CaretLeft, CaretRight, FilePdf, FileText, House, LinkedinLogo, MagicWand, Plus, Question, Stack, UploadSimple, UserCircle, Warning,
} from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { PLAN_STATE, STATUS, dateFmt, dayFmt, daysLeft, formatINR, myPlans, myRequestsPage } from "./api";
import { AppData } from "./appData";
import { BUILDER_LIVE } from "./landingContent";
import ResumeBuy from "./ResumeBuy";
import ResumeDetail from "./ResumeDetail";
import ResumeSubmit from "./ResumeSubmit";
import { Bar, Btn, Page, ScoreRing, Skeleton, cx } from "./ui";
import { loginUrl } from "../auth/authRedirect";

/*
  THE SIGNED-IN AREA: /resume-review/app/*
    large screens   menu on the left (who you are, the main action, pages, credits), the page on the right
    phones/tablets  a compact header with the main action and a scrollable row of pages; credits live on the home page
*/

const n0 = (v) => Number(v ?? 0).toLocaleString("en-IN"); // never crashes on a missing number
const pct = (left, all) => (all > 0 ? Math.max(0, Math.min(100, (left / all) * 100)) : 0);
const tone = (v) => (v <= 15 ? "bad" : v <= 40 ? "warn" : "ok");
const PAGE = 20;

/* ---------------------------------------------------------------- menu */
function Sidebar() {
  const user = useSelector((s) => s.auth?.user);
  const { data } = useContext(AppData);
  const s = data?.summary;
  const usable = data?.plans?.find((p) => p.usable);
  const days = s?.nextExpiry ? daysLeft(s.nextExpiry) : null;
  const name = user?.name || "Your account";
  const row = (label, left, all, unl) => (
    <div key={label} className="rla-credit">
      <div><span>{label}</span><b className="rv-mono">{unl ? "Unlimited" : `${n0(left)} / ${n0(all)}`}</b></div>
      <Bar value={unl ? 100 : pct(left, all)} tone={unl ? "ok" : tone(pct(left, all))} />
    </div>
  );
  const nav = [
    ["/resume-review/app", House, "Home", true],
    ...(BUILDER_LIVE ? [["/resume-review/app/builder", FileText, "Resume builder", false]] : []),
    ["/resume-review/app/plans", Stack, "Plans", false],
  ];
  return (
    <aside className="rla-side" aria-label="Resume Lab menu">
      <div className="rla-brand">
        <span className="rla-logo" aria-hidden>R</span>
        <div><b>Resume Lab</b><span>by Target Trek</span></div>
      </div>

      <div className="rla-user rla-lg">
        <span className="rla-avatar" aria-hidden>{String(name).trim().charAt(0).toUpperCase()}</span>
        <div><b>{name}</b>{user?.email && <span>{user.email}</span>}</div>
      </div>

      <div className="rla-cta">
        {usable
          ? <Btn as={Link} to={`/resume-review/app/submit/${usable.id}`} block><UploadSimple size={17} weight="bold" aria-hidden />Upload a resume</Btn>
          : <Btn as={Link} to="/resume-review/app/plans" block><Plus size={17} weight="bold" aria-hidden />Choose a plan</Btn>}
      </div>

      <nav className="rla-nav" aria-label="Resume Lab pages">
        {nav.map(([to, Icon, label, end]) => (
          <NavLink key={to} to={to} end={end}><Icon size={19} weight="duotone" aria-hidden /><span>{label}</span></NavLink>
        ))}
        <Link to="/resume-review" className="rla-nav-back"><ArrowLeft size={19} weight="bold" aria-hidden /><span>About Resume Lab</span></Link>
      </nav>

      {s && s.plans > 0 && (
        <div className="rla-credits rla-lg">
          <p className="rla-k">Your credits</p>
          {row("AI reviews", s.aiLeft, s.aiAllowed ?? s.aiLeft, s.aiUnlimited)}
          {s.humanAvailable && row("Human reviews", s.humanLeft, s.humanAllowed)}
          {s.linkedinAvailable && row("LinkedIn reviews", s.linkedinLeft, s.linkedinAllowed)}
          <p className="rla-credits-foot"><CalendarBlank size={14} weight="bold" aria-hidden />{s.nextExpiry ? `${days} day${days === 1 ? "" : "s"} left · ends ${dayFmt(s.nextExpiry)}` : "Your plans never expire"}</p>
          <Link to="/resume-review/app/plans" className="rl-textlink">Get more reviews <ArrowRight size={13} weight="bold" aria-hidden /></Link>
        </div>
      )}

      <p className="rla-help rla-lg"><Question size={15} weight="bold" aria-hidden /><span>Help: <b className="rl-select">supporttargettrek@gmail.com</b></span></p>
    </aside>
  );
}

/* ---------------------------------------------------------------- a payment that was started and never finished */
function Unfinished() {
  const { data } = useContext(AppData);
  const u = (data?.unfinished || [])[0]; // only the latest
  if (!u) return null;
  return (
    <div className="rla-unfinished" role="status">
      <Warning size={22} weight="duotone" aria-hidden />
      <div><b>Unfinished payment: {u.name}</b><p>{formatINR(u.amount)} · started {dayFmt(u.startedAt)}. Not confirmed yet.</p></div>
      <Btn as={Link} to={`/resume-review/payment-result?purchase=${u.id}&status=pending`} size="sm">Check or finish <ArrowRight size={14} weight="bold" aria-hidden /></Btn>
    </div>
  );
}

/* ---------------------------------------------------------------- paging */
const pageList = (page, pages) => {
  const out = [];
  for (let i = 1; i <= pages; i += 1) if (i === 1 || i === pages || Math.abs(i - page) <= 1) out.push(i);
  return out.flatMap((n, i) => (i > 0 && n - out[i - 1] > 1 ? ["…", n] : [n]));
};
function Pager({ page, pages, onGo }) {
  if (pages <= 1) return null;
  return (
    <nav className="rv-pager" aria-label="Pages">
      <button type="button" onClick={() => onGo(page - 1)} disabled={page === 1} aria-label="Previous page"><CaretLeft size={14} weight="bold" aria-hidden /></button>
      {pageList(page, pages).map((n, i) => (n === "…" ? <span key={`d${i}`} aria-hidden>…</span> : <button key={n} type="button" className={n === page ? "on" : ""} aria-current={n === page ? "page" : undefined} onClick={() => onGo(n)}>{n}</button>))}
      <button type="button" onClick={() => onGo(page + 1)} disabled={page === pages} aria-label="Next page"><CaretRight size={14} weight="bold" aria-hidden /></button>
    </nav>
  );
}

/* ---------------------------------------------------------------- one uploaded resume, as a row */
const ago = (d) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(d).getTime()) / 60000));
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const days = Math.round(h / 24);
  return days < 30 ? `${days} day${days === 1 ? "" : "s"} ago` : dayFmt(d);
};

function ResumeRow({ r }) {
  const st = r.humanRequested ? STATUS[r.status] || {} : r.aiStatus === "failed" ? { label: "AI report not generated", tone: "bad" } : { label: r.status === "completed" ? "AI report ready" : "AI is reading it", tone: r.status === "completed" ? "ok" : "" };
  return (
    <li>
      <Link to={`/resume-review/app/requests/${r.id}`} className="rla-row">
        {r.score != null ? <ScoreRing value={r.score} size={56} stroke={5} /> : <span className="rla-row-wait" aria-label="Report in progress"><span className="rv-spin" /></span>}
        <span className="rla-row-main">
          <b>{r.targetRole || r.package?.name || "Resume"}</b>
          <span className="rla-row-file"><FilePdf size={14} weight="duotone" aria-hidden /><span>{r.filename || "Resume"}</span></span>
        </span>
        <span className="rla-row-meta">
          <span className={cx("rla-status", st.tone)}>{st.label}</span>
          {r.humanRequested && <span className="rla-status human">Human</span>}
          <span className="rla-row-date" title={dateFmt(r.createdAt)}>{ago(r.createdAt)}</span>
        </span>
        <ArrowRight size={18} weight="bold" className="rla-row-go" aria-hidden />
      </Link>
    </li>
  );
}

/* ---------------------------------------------------------------- one plan the person owns */
function PlanTile({ p }) {
  const left = daysLeft(p.expiresAt);
  const st = PLAN_STATE[p.state] || {};
  const bits = [
    ["AI", Brain, p.ai.unlimited, p.ai.left, p.ai.allowed, true],
    ["Human", UserCircle, false, p.human.left, p.human.allowed, p.human.enabled],
    ["LinkedIn", LinkedinLogo, false, p.linkedin.left, p.linkedin.allowed, p.linkedin.enabled],
  ].filter((x) => x[5]);
  return (
    <article className="rla-plan">
      <div className="rla-plan-top">
        <div><h3>{p.package.name}</h3><p>Bought {dayFmt(p.payment?.paidAt || p.createdAt)} · {p.expiresAt ? (p.state === "expired" ? `ended ${dayFmt(p.expiresAt)}` : `${left} day${left === 1 ? "" : "s"} left`) : "no expiry"}</p></div>
        <span className={cx("rla-status", st.tone)}>{st.label}</span>
      </div>
      <div className="rla-plan-bars">
        {bits.map(([name, Icon, unl, l, all]) => (
          <div key={name}>
            <div className="rla-plan-bar-top"><span><Icon size={15} weight="duotone" aria-hidden />{name}</span><b className="rv-mono">{unl ? "Unlimited" : `${l} / ${all}`}</b></div>
            <Bar value={unl ? 100 : pct(l, all)} tone={unl ? "ok" : tone(pct(l, all))} />
          </div>
        ))}
      </div>
      <div className="rla-plan-foot">
        {p.usable
          ? <Btn as={Link} to={`/resume-review/app/submit/${p.id}`} variant="ghost" block>Upload a resume <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
          : p.state === "active" && p.human.left > 0 ? <p>Human reviews can still be added to resumes you've sent in.</p>
          : <Btn as={Link} to="/resume-review/app/plans" variant="ghost" block>Buy again</Btn>}
      </div>
    </article>
  );
}

/* ---------------------------------------------------------------- home */
function Dashboard() {
  const user = useSelector((s) => s.auth?.user);
  const { data, error: planError } = useContext(AppData);
  const [list, setList] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    myRequestsPage(page, PAGE).then((d) => { if (live) setList(d); }).catch((e) => { if (live) setError(errMsg(e)); });
    return () => { live = false; };
  }, [page]);
  const go = (n) => { setList((l) => l && { ...l, items: null }); setPage(n); document.getElementById("resumes")?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  const first = String(user?.name || "").split(" ")[0];
  const plans = data?.plans;
  const s = data?.summary;
  const usable = plans?.find((p) => p.usable);
  const live = plans?.filter((p) => p.state === "active").length || 0;
  const total = list?.total ?? 0;
  const from = list ? (list.page - 1) * list.limit + 1 : 0;
  const to = list?.items ? from + list.items.length - 1 : 0;
  const days = s?.nextExpiry ? daysLeft(s.nextExpiry) : null;
  const uploadTo = usable ? `/resume-review/app/submit/${usable.id}` : "/resume-review/app/plans";

  const stats = s && s.plans > 0 ? [
    [Brain, "AI reviews left", s.aiUnlimited ? "∞" : n0(s.aiLeft), s.aiUnlimited ? "Unlimited" : `of ${n0(s.aiAllowed ?? s.aiLeft)}`],
    ...(s.humanAvailable ? [[UserCircle, "Human reviews left", n0(s.humanLeft), `of ${n0(s.humanAllowed)}`]] : []),
    ...(s.linkedinAvailable ? [[LinkedinLogo, "LinkedIn reviews left", n0(s.linkedinLeft), `of ${n0(s.linkedinAllowed)}`]] : []),
    [CalendarBlank, "Days left", s.nextExpiry ? n0(days) : "∞", s.nextExpiry ? `ends ${dayFmt(s.nextExpiry)}` : "No expiry"],
  ] : [];

  return (
    <div className="rla-home">
      <section className="rla-hero">
        <div className="rla-hero-copy">
          <span className="rl-eyebrow">Your space</span>
          <h1 className="rla-h1">{first ? `Hi ${first}, welcome back` : "Welcome back"}</h1>
          <p>{plans == null ? "Loading your plans…" : plans.length === 0 ? "You don't have a plan yet. Choose one and send in your resume." : `${live} active plan${live === 1 ? "" : "s"} · ${n0(total)} resume${total === 1 ? "" : "s"} reviewed so far`}</p>
        </div>
        <div className="rla-hero-btns">
          <Btn as={Link} to={uploadTo} size="lg">{usable ? <><UploadSimple size={17} weight="bold" aria-hidden />Upload a resume</> : <><Plus size={17} weight="bold" aria-hidden />Choose a plan</>}</Btn>
          <Btn as={Link} to="/resume-review/app/plans" size="lg" variant="ghost">{usable ? "Get more reviews" : "Compare plans"}</Btn>
        </div>
      </section>

      {(error || planError) && <p role="alert" className="rv-err">{error || planError}</p>}
      <Unfinished />

      {stats.length > 0 && (
        <section aria-label="Your credits" className="rla-stats">
          {stats.map(([Icon, label, big, small]) => (
            <div key={label} className="rla-stat">
              <span className="rla-stat-k"><Icon size={17} weight="duotone" aria-hidden />{label}</span>
              <b className="rv-mono">{big}</b>
              <span className="rla-stat-s">{small}</span>
            </div>
          ))}
        </section>
      )}

      <section aria-label="Quick actions" className="rla-quick">
        <Link to={uploadTo} className="rla-q"><UploadSimple size={22} weight="duotone" aria-hidden /><b>Get a review</b><span>Upload a PDF, AI report in about 2 minutes</span></Link>
        {BUILDER_LIVE && <Link to="/resume-review/app/builder" className="rla-q"><FileText size={22} weight="duotone" aria-hidden /><b>Build a resume</b><span>Answer questions, download an ATS-friendly PDF</span></Link>}
        {BUILDER_LIVE && <Link to="/resume-review/app/builder" className="rla-q"><MagicWand size={22} weight="duotone" aria-hidden /><b>Tailor to a job</b><span>Match your resume to a job post, honestly</span></Link>}
        <Link to="/resume-review/app/plans" className="rla-q"><Stack size={22} weight="duotone" aria-hidden /><b>Get more reviews</b><span>Add AI, human or LinkedIn reviews. Credits add up</span></Link>
        <Link to="/resume-review#mistakes" className="rla-q"><Question size={22} weight="duotone" aria-hidden /><b>Free resume guide</b><span>The 12 mistakes that stop interview calls</span></Link>
      </section>

      <section id="resumes" aria-labelledby="rev-h" className="rla-block">
        <div className="rla-block-head">
          <div><h2 id="rev-h" className="rla-h2">Your resumes</h2>{list?.items && total > 0 && <p>Showing {from} to {to} of {n0(total)}, newest first</p>}</div>
          {usable && total > 0 && <Btn as={Link} to={uploadTo} variant="ghost" size="sm"><Plus size={14} weight="bold" aria-hidden />New resume</Btn>}
        </div>
        {(list === null || list.items === null) && !error && <ul className="rla-rows">{[0, 1, 2].map((i) => <li key={i}><Skeleton h={84} style={{ borderRadius: 16 }} /></li>)}</ul>}
        {list?.items && total === 0 && (
          <div className="rla-empty">
            <span className="rla-empty-ico"><UploadSimple size={26} weight="bold" aria-hidden /></span>
            <h3>No resumes yet</h3>
            <p>{usable ? "Upload your first resume and your AI report arrives in about two minutes." : "Choose a plan, then upload your first resume. Every resume you send shows up here."}</p>
            <Btn as={Link} to={uploadTo} size="lg">{usable ? "Upload a resume" : "See plans"} <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
          </div>
        )}
        {list?.items?.length > 0 && <ul className="rla-rows">{list.items.map((r) => <ResumeRow key={r.id} r={r} />)}</ul>}
        {list && <Pager page={list.page} pages={list.pages} onGo={go} />}
      </section>

      <section aria-labelledby="plans-h" className="rla-block">
        <div className="rla-block-head">
          <div><h2 id="plans-h" className="rla-h2">Your plans</h2>{plans?.length > 1 && <p>Plans add up. A human review is taken from whichever plan still has one.</p>}</div>
          <Btn as={Link} to="/resume-review/app/plans" variant="ghost" size="sm"><Plus size={14} weight="bold" aria-hidden />Add a plan</Btn>
        </div>
        {!data && !planError && <Skeleton h={200} style={{ borderRadius: 18 }} />}
        {plans?.length === 0 && <p className="rla-muted">No plans yet. <Link to="/resume-review/app/plans" className="rl-textlink">Choose one</Link></p>}
        {plans?.length > 0 && <div className="rla-plans">{plans.map((p) => <PlanTile key={p.id} p={p} />)}</div>}
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- the signed-in area */
export default function ResumeApp() {
  const token = useSelector((s) => s.auth?.token);
  const location = useLocation();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { window.scrollTo({ top: 0 }); }, [location.pathname]);
  useEffect(() => { if (token) myPlans().then((d) => setData({ ...d, path: location.pathname })).catch((e) => setError(errMsg(e))); }, [token, location.pathname]);

  if (!token) {
    return <Navigate to={loginUrl(location)} replace />;
  }
  // never paid for anything: the only useful page is the plans page
  if (data && data.path === location.pathname && data.plans?.length === 0 && /^\/resume-review\/app\/?$/.test(location.pathname)) {
    return <Navigate to="/resume-review/app/plans" replace state={{ first: true }} />;
  }
  const wide = /\/(requests|builder)(\/|$)/.test(location.pathname);
  return (
    <Page title="Resume Lab" className="rla-page">
      <AppData.Provider value={{ data, error }}>
        <div className={cx("rv-shell rla", wide && "rla-wide")}>
          <Sidebar />
          <main className="rla-main rv-app-main">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="plans" element={<><Unfinished /><ResumeBuy /></>} />
              <Route path="submit/:purchaseId" element={<ResumeSubmit />} />
              <Route path="requests/:id" element={<ResumeDetail />} />
              <Route path="*" element={<Navigate to="/resume-review/app" replace />} />
            </Routes>
          </main>
        </div>
      </AppData.Provider>
    </Page>
  );
}
