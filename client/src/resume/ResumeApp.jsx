import { createContext, useContext, useEffect, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, ArrowRight, Brain, CalendarBlank, CaretLeft, CaretRight, FilePdf, House, LinkedinLogo, Plus, Stack, UploadSimple, UserCircle } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { PLAN_STATE, STATUS, dayFmt, daysLeft, fetchPackages, formatINR, myPlans, myRequestsPage } from "./api";
import PlanPicker, { usePlanBuy } from "./PlanPicker";
import ResumeBuy from "./ResumeBuy";
import ResumeDetail from "./ResumeDetail";
import ResumeSubmit from "./ResumeSubmit";
import { Bar, Btn, Kicker, Page, Pill, ScoreRing, Skeleton } from "./ui";

const n0 = (v) => Number(v ?? 0).toLocaleString("en-IN"); // never crashes on a missing number
const pct = (left, all) => (all > 0 ? Math.max(0, Math.min(100, (left / all) * 100)) : 0);
const tone = (v) => (v <= 15 ? "bad" : v <= 40 ? "warn" : "ok");

/* One credit: what is left, out of what you bought, as a bar. */
function Meter({ icon: Icon, label, left, all, unlimited, hint }) {
  const v = unlimited ? 100 : pct(left, all);
  return (
    <div className="rv-meter">
      <div className="rv-meter-top"><span className="rv-ico"><Icon size={20} weight="duotone" aria-hidden /></span><span className="rv-xs rv-subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</span></div>
      <div className="rv-meter-num"><b className="rv-mono">{unlimited ? "∞" : n0(left)}</b>{!unlimited && <span className="rv-muted">of {n0(all)} left</span>}{unlimited && <span className="rv-muted">unlimited</span>}</div>
      <Bar value={v} tone={unlimited ? "ok" : tone(v)} />
      {hint && <p className="rv-xs rv-subtle" style={{ marginTop: 10 }}>{hint}</p>}
    </div>
  );
}

/* What the person has left across all their plans. Human and LinkedIn are only shown if a plan of theirs has them. */
function Summary({ s }) {
  if (!s || s.plans === 0) return null;
  const days = s.nextExpiry ? daysLeft(s.nextExpiry) : null;
  const aiAll = s.aiAllowed ?? s.aiLeft;
  return (
    <section aria-label="Your credits" className="rv-meters">
      <Meter icon={Brain} label="AI reviews" left={s.aiLeft} all={aiAll} unlimited={s.aiUnlimited} hint={s.plans > 1 ? `across ${s.plans} plans` : undefined} />
      {s.humanAvailable && <Meter icon={UserCircle} label="Human reviews" left={s.humanLeft} all={s.humanAllowed} />}
      {s.linkedinAvailable && <Meter icon={LinkedinLogo} label="LinkedIn reviews" left={s.linkedinLeft} all={s.linkedinAllowed} />}
      <div className="rv-meter">
        <div className="rv-meter-top"><span className="rv-ico"><CalendarBlank size={20} weight="duotone" aria-hidden /></span><span className="rv-xs rv-subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>Time left</span></div>
        <div className="rv-meter-num"><b className="rv-mono">{s.nextExpiry ? days : "∞"}</b><span className="rv-muted">{s.nextExpiry ? `day${days === 1 ? "" : "s"}` : "no expiry"}</span></div>
        <p className="rv-xs rv-subtle" style={{ marginTop: 14 }}>{s.nextExpiry ? `Soonest plan ends ${dayFmt(s.nextExpiry)}` : "Your plans never expire."}</p>
      </div>
    </section>
  );
}

function PlanRow({ p }) {
  const left = daysLeft(p.expiresAt);
  const st = PLAN_STATE[p.state] || {};
  const bits = [
    ["AI", Brain, p.ai.unlimited, p.ai.left, p.ai.allowed, true],
    ["Human", UserCircle, false, p.human.left, p.human.allowed, p.human.enabled],
    ["LinkedIn", LinkedinLogo, false, p.linkedin.left, p.linkedin.allowed, p.linkedin.enabled],
  ].filter((x) => x[5]);
  return (
    <article className="rv-card rv-myplan">
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ minWidth: 0 }}>
          <h3 className="rv-h3">{p.package.name}</h3>
          <p className="rv-xs rv-subtle" style={{ marginTop: 4 }}>Bought {dayFmt(p.payment?.paidAt || p.createdAt)} · {p.expiresAt ? (p.state === "expired" ? `ended ${dayFmt(p.expiresAt)}` : `${left} day${left === 1 ? "" : "s"} left`) : "no expiry"}</p>
        </div>
        <Pill className={st.tone}>{st.label}</Pill>
      </div>
      <div style={{ display: "grid", gap: 14, marginTop: 20 }}>
        {bits.map(([name, Icon, unl, l, all]) => (
          <div key={name}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }} className="rv-sm"><span style={{ display: "inline-flex", gap: 8, alignItems: "center", fontWeight: 600 }}><Icon size={16} weight="duotone" aria-hidden />{name}</span><span className="rv-mono rv-muted">{unl ? "Unlimited" : `${l} / ${all}`}</span></div>
            <Bar value={unl ? 100 : pct(l, all)} tone={unl ? "ok" : tone(pct(l, all))} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 22 }}>
        {p.usable
          ? <Btn as={Link} to={`/resume-review/app/submit/${p.id}`} block>Send in a resume <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
          : p.state === "active" && p.human.left > 0 ? <p className="rv-xs rv-muted">Human reviews can still be added to resumes you've sent in.</p>
          : <Btn as="a" href="#more-plans" variant="ghost" block>Buy again</Btn>}
      </div>
    </article>
  );
}

const AppData = createContext({ data: null, error: "" });
const PAGE = 20;

/* ---------- sidebar (large screens) / pill bar (phones and tablets) ---------- */
function Sidebar() {
  const user = useSelector((s) => s.auth?.user);
  const { data } = useContext(AppData);
  const s = data?.summary;
  const usable = data?.plans?.find((p) => p.usable);
  const days = s?.nextExpiry ? daysLeft(s.nextExpiry) : null;
  const row = (label, left, all, unl) => (
    <div key={label}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }} className="rv-xs"><b>{label}</b><span className="rv-mono rv-muted">{unl ? "Unlimited" : `${n0(left)} / ${n0(all)}`}</span></div>
      <Bar value={unl ? 100 : pct(left, all)} tone={unl ? "ok" : tone(pct(left, all))} />
    </div>
  );
  return (
    <aside className="rv-side" aria-label="Resume Lab menu">
      <div className="rv-side-user rv-side-extra">
        <span className="rv-avatar" aria-hidden>{String(user?.name || "U").trim().charAt(0).toUpperCase()}</span>
        <div style={{ minWidth: 0 }}><b style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "Your account"}</b><span className="rv-xs rv-subtle" style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</span></div>
      </div>
      <div className="rv-side-extra">
        {usable
          ? <Btn as={Link} to={`/resume-review/app/submit/${usable.id}`} block><UploadSimple size={16} weight="bold" aria-hidden />Send in a resume</Btn>
          : <Btn as={Link} to="/resume-review/app/plans" block><Plus size={16} weight="bold" aria-hidden />Choose a plan</Btn>}
      </div>
      <nav className="rv-sidenav" aria-label="Resume Lab">
        <NavLink end to="/resume-review/app"><House size={18} weight="duotone" aria-hidden /><span>My space</span></NavLink>
        <NavLink to="/resume-review/app/plans"><Stack size={18} weight="duotone" aria-hidden /><span>Plans</span></NavLink>
        <Link to="/resume-review" className="rv-sidenav-back"><ArrowLeft size={18} weight="bold" aria-hidden /><span>Resume Review</span></Link>
      </nav>
      {s && s.plans > 0 && (
        <div className="rv-side-credits rv-side-extra">
          <p className="rv-kicker" style={{ marginBottom: 16 }}>Your credits</p>
          <div style={{ display: "grid", gap: 14 }}>
            {row("AI reviews", s.aiLeft, s.aiAllowed ?? s.aiLeft, s.aiUnlimited)}
            {s.humanAvailable && row("Human reviews", s.humanLeft, s.humanAllowed)}
            {s.linkedinAvailable && row("LinkedIn reviews", s.linkedinLeft, s.linkedinAllowed)}
          </div>
          <p className="rv-xs rv-subtle" style={{ marginTop: 16, display: "flex", gap: 6, alignItems: "center" }}><CalendarBlank size={14} weight="bold" aria-hidden />{s.nextExpiry ? `${days} day${days === 1 ? "" : "s"} left · ends ${dayFmt(s.nextExpiry)}` : "Plans never expire"}</p>
        </div>
      )}
    </aside>
  );
}

/* ---------- paging ---------- */
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

/* ---------- one uploaded resume ---------- */
function ResumeCard({ r }) {
  const st = r.humanRequested ? STATUS[r.status] || {} : r.aiStatus === "failed" ? { label: "AI report not generated", tone: "bad" } : { label: r.status === "completed" ? "AI report ready" : "AI is reading it", tone: r.status === "completed" ? "ok" : "" };
  return (
    <Link to={`/resume-review/app/requests/${r.id}`} className="rv-rcard rv-hover">
      <div className="rv-rcard-top">
        {r.score != null ? <ScoreRing value={r.score} size={68} stroke={6} /> : <span className="rv-rcard-wait" aria-hidden><span className="rv-spin" /></span>}
        <div style={{ minWidth: 0, flex: 1 }}>
          <Pill className={st.tone}>{st.label}</Pill>
          <h3 className="rv-rcard-role">{r.targetRole || r.package?.name || "Resume"}</h3>
        </div>
      </div>
      {r.filename && <p className="rv-rcard-file"><FilePdf size={16} weight="duotone" aria-hidden /><span>{r.filename}</span></p>}
      <div className="rv-rcard-foot">
        <span className="rv-xs rv-subtle">{r.package?.name} · {dayFmt(r.createdAt)}</span>
        <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>{r.humanRequested && <Pill className="dark">Human</Pill>}<ArrowRight size={16} weight="bold" className="rv-rcard-go" aria-hidden /></span>
      </div>
    </Link>
  );
}

function Dashboard() {
  const user = useSelector((s) => s.auth?.user);
  const { data, error: planError } = useContext(AppData);
  const [list, setList] = useState(null);
  const [page, setPage] = useState(1);
  const [packs, setPacks] = useState(null);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState("");
  const buyer = usePlanBuy();
  useEffect(() => { fetchPackages().then(setPacks).catch(() => setFailed(true)); }, []);
  useEffect(() => {
    let live = true;
    myRequestsPage(page, PAGE).then((d) => { if (live) setList(d); }).catch((e) => { if (live) setError(errMsg(e)); });
    return () => { live = false; };
  }, [page]);
  const go = (n) => { setList((l) => l && { ...l, items: null }); setPage(n); document.getElementById("resumes")?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  const first = String(user?.name || "").split(" ")[0];
  const plans = data?.plans;
  const usablePlan = plans?.find((p) => p.usable);
  const live = plans?.filter((p) => p.state === "active").length || 0;
  const total = list?.total ?? 0;
  const from = list ? (list.page - 1) * list.limit + 1 : 0;
  const to = list?.items ? from + list.items.length - 1 : 0;

  return (
    <div style={{ display: "grid", gap: 52, gridTemplateColumns: "minmax(0, 1fr)" }}>
      <section className="rv-panel rv-welcome">
        <div style={{ minWidth: 0 }}>
          <span className="rv-kicker" style={{ color: "#fdba74" }}>Your space</span>
          <h1 className="rv-h2" style={{ marginTop: 14, color: "var(--rv-panel-text)" }}>{first ? `Hi ${first}, welcome back` : "Welcome back"}</h1>
          <p style={{ marginTop: 10, color: "var(--rv-panel-muted)", maxWidth: 520, lineHeight: 1.6 }}>{plans === undefined || plans === null ? "Loading your plans…" : plans.length === 0 ? "You don't have a plan yet. Pick one below and send in your resume." : `${live} active plan${live === 1 ? "" : "s"} · ${total} resume${total === 1 ? "" : "s"} reviewed so far.`}</p>
        </div>
        <div className="rv-row">
          {usablePlan && <Link to={`/resume-review/app/submit/${usablePlan.id}`} className="rv-btn rv-btn-lg rv-btn-invert"><UploadSimple size={17} weight="bold" aria-hidden />Send in a resume</Link>}
          <a href="#more-plans" className="rv-btn rv-btn-lg rv-btn-onpanel"><Plus size={16} weight="bold" aria-hidden />{usablePlan ? "Add more reviews" : "Choose a plan"}</a>
        </div>
      </section>
      {(error || planError) && <p role="alert" className="rv-err">{error || planError}</p>}

      {/* phones and tablets: the credits sit here; on large screens they live in the left menu */}
      <div className="rv-below-lg"><Summary s={data?.summary} /></div>

      <section id="resumes" aria-labelledby="rev-h" style={{ scrollMarginTop: 90 }}>
        <div className="rv-sec-line">
          <div><h2 id="rev-h" className="rv-h3">Your resumes</h2>{list && total > 0 && list.items && <p className="rv-sm rv-muted" style={{ marginTop: 4 }}>Showing {from}–{to} of {total}, newest first</p>}</div>
          {usablePlan && <Btn as={Link} to={`/resume-review/app/submit/${usablePlan.id}`} variant="ghost" size="sm"><Plus size={14} weight="bold" aria-hidden />New resume</Btn>}
        </div>
        {(list === null || list.items === null) && !error && <div className="rv-rgrid">{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={170} style={{ borderRadius: 18 }} />)}</div>}
        {list && list.items && total === 0 && (
          <div className="rv-empty">
            <span className="rv-drop-ico"><UploadSimple size={28} weight="bold" aria-hidden /></span>
            <h3 className="rv-h3" style={{ marginTop: 18 }}>No resumes yet</h3>
            <p className="rv-muted rv-sm" style={{ margin: "8px auto 22px", maxWidth: 380 }}>{usablePlan ? "Upload your first resume and your AI report arrives in about two minutes." : "Pick a plan, then upload your first resume. Every resume you send shows up here."}</p>
            {usablePlan ? <Btn as={Link} to={`/resume-review/app/submit/${usablePlan.id}`} size="lg">Upload a resume <ArrowRight size={16} weight="bold" aria-hidden /></Btn> : <Btn as="a" href="#more-plans" size="lg">See plans <ArrowRight size={16} weight="bold" aria-hidden /></Btn>}
          </div>
        )}
        {list?.items?.length > 0 && <div className="rv-rgrid">{list.items.map((r) => <ResumeCard key={r.id} r={r} />)}</div>}
        {list && <Pager page={list.page} pages={list.pages} onGo={go} />}
      </section>

      <section aria-labelledby="plans-h">
        <h2 id="plans-h" className="rv-h3" style={{ marginBottom: 6 }}>Your plans</h2>
        {plans?.length > 1 && <p className="rv-sm rv-muted" style={{ marginBottom: 16 }}>Plans add up. A human review is taken from whichever of your plans still has one.</p>}
        {!data && !planError && <Skeleton h={220} style={{ marginTop: 16 }} />}
        {plans?.length === 0 && <p className="rv-muted rv-sm" style={{ marginTop: 12 }}>No plans yet. Choose one below.</p>}
        <div className="rv-myplans" style={{ marginTop: 16 }}>{plans?.map((p) => <PlanRow key={p.id} p={p} />)}</div>
      </section>

      <section id="more-plans" aria-labelledby="more-h" style={{ scrollMarginTop: 90 }}>
        <Kicker>New plans</Kicker>
        <h2 id="more-h" className="rv-h2" style={{ margin: "14px 0 8px", fontSize: "clamp(24px, 3vw, 34px)" }}>{plans?.length ? "Add more reviews" : "Choose your plan"}</h2>
        <p className="rv-muted" style={{ maxWidth: 560, marginBottom: 28 }}>Pay once, no subscription. New credits add to what you already have, and each plan keeps its own validity.</p>
        <PlanPicker packs={packs} failed={failed} buyer={buyer} center={false} cta={(p) => `Pay ${formatINR(p.price)}`} />
        <p className="rv-xs rv-subtle" style={{ marginTop: 20 }}>Plans cannot be cancelled once bought.</p>
      </section>
    </div>
  );
}

/* The signed-in area: /resume-review/app/* */
export default function ResumeApp() {
  const token = useSelector((s) => s.auth?.token);
  const location = useLocation();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { window.scrollTo({ top: 0 }); }, [location.pathname]);
  useEffect(() => { if (token) myPlans().then(setData).catch((e) => setError(errMsg(e))); }, [token, location.pathname]);

  if (!token) {
    try { sessionStorage.setItem("resume:returnTo", location.pathname + location.search); } catch { /* ignore */ }
    return <Navigate to="/resume-review/signup" replace state={{ from: location }} />;
  }
  return (
    <Page title="Resume Lab">
      <AppData.Provider value={{ data, error }}>
        <div className="rv-shell rv-app">
          <Sidebar />
          <main className="rv-app-main">
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="plans" element={<ResumeBuy />} />
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
