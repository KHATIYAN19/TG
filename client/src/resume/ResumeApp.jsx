import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Handshake, House, ListChecks, MagicWand, Question, Sparkle, Stack, Vault } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { getAppData } from "./api";
import { AppData, useApp } from "./appData";
import { Bar, Btn, Page, cx } from "./ui";
import { loginUrl } from "../auth/authRedirect";
import { startTarget } from "./parts";
import AppHome from "./AppHome";
import AppReviews from "./AppReviews";
import { VaultPage } from "./AppVault";
import NewReview from "./NewReview";
import Checkout from "./CheckoutPage";
import ResumeBuy from "./ResumeBuy";
import ResumeDetail from "./ResumeDetail";
import ResumeBuilder from "./ResumeBuilder";

/*
  THE SIGNED-IN SPACE: /resume-review/app/*

  Data: ONE call (GET /api/resume/app) fills the whole space: plans, credits, an unfinished payment, builder access, the latest reviews,
  the Resume Vault and the details last used. Pages read it from AppData; after a change a page calls refresh() (or setVault() for a
  vault change, which already answers with the new list), so nothing is fetched twice.

  Layout: a left rail on desktop; on phones and tablets a slim header and a bottom tab bar. Focused flows (start a review, checkout)
  hide the tab bar and show their own action bar instead.
*/

export { useApp };
const n0 = (v) => Number(v ?? 0).toLocaleString("en-IN");
const pct = (left, all) => (all > 0 ? Math.max(0, Math.min(100, (left / all) * 100)) : 0);
const toneOf = (v) => (v <= 15 ? "bad" : v <= 40 ? "warn" : "ok");
const STALE_MS = 30_000;

const tabsFor = (data) => [
  { to: "/resume-review/app", icon: House, label: "Home", end: true },
  { to: "/resume-review/app/reviews", icon: ListChecks, label: "Reviews", count: data?.totals?.inProgress || 0 },
  { to: "/resume-review/app/vault", icon: Vault, label: "Vault" },
  { to: "/resume-review/app/plans", icon: Stack, label: "Plans" },
  ...(data?.builder?.visible ? [{ to: "/resume-review/app/builder", icon: MagicWand, label: "Builder" }] : []),
];

function Brand() {
  return (
    <Link to="/resume-review/app" className="rs-brand">
      <span className="rs-logo" aria-hidden>R</span>
      <span><b>Resume Lab</b><small>by Target Trek</small></span>
    </Link>
  );
}

function Wallet({ s, builderOn }) {
  if (!s || !s.plans) return null;
  const row = (label, left, all, unl) => (
    <div key={label} className="rs-wallet-row">
      <div><span>{label}</span><b className="rs-num">{unl ? "Unlimited" : `${n0(left)} / ${n0(all)}`}</b></div>
      <Bar value={unl ? 100 : pct(left, all)} tone={unl ? "ok" : toneOf(pct(left, all))} />
    </div>
  );
  return (
    <div className="rs-wallet">
      <p className="rs-k">Your credits</p>
      {(s.aiUnlimited || s.aiAllowed > 0) && row("AI reviews", s.aiLeft, s.aiAllowed, s.aiUnlimited)}
      {s.humanAvailable && row("Human reviews", s.humanLeft, s.humanAllowed)}
      {s.linkedinAvailable && row("LinkedIn reviews", s.linkedinLeft, s.linkedinAllowed)}
      {builderOn && s.builderAvailable && row("Resume builds", s.builderLeft, s.builderAllowed)}
      <Link to="/resume-review/app/plans" className="rs-link">Add credits</Link>
    </div>
  );
}

function Rail({ data, tabs }) {
  const user = useSelector((st) => st.auth?.user);
  const name = user?.name || "Your account";
  const canStart = data?.plans?.some((p) => p.usable);
  return (
    <aside className="rs-rail" aria-label="Resume Lab">
      <Brand />
      <div className="rs-me">
        <span className="rs-avatar" aria-hidden>{String(name).trim().charAt(0).toUpperCase()}</span>
        <div><b>{name}</b>{user?.email && <span>{user.email}</span>}</div>
      </div>
      <Btn as={Link} to={startTarget(data)} block><Sparkle size={17} weight="fill" aria-hidden />{canStart || !data ? "Start a review" : "Choose a plan"}</Btn>
      <nav className="rs-nav" aria-label="Resume Lab pages">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.end}>
            <t.icon size={20} weight="duotone" aria-hidden /><span>{t.label}</span>
            {t.count > 0 ? <span className="rs-nav-count" aria-label={`${t.count} in progress`}>{t.count}</span> : <span />}
          </NavLink>
        ))}
        <span className="rs-nav-sep" aria-hidden />
        <NavLink to="/referral/app"><Handshake size={20} weight="duotone" aria-hidden /><span>Referrals</span><span /></NavLink>
        <NavLink to="/resume-review" end><ArrowLeft size={20} weight="bold" aria-hidden /><span>About Resume Lab</span><span /></NavLink>
      </nav>
      <Wallet s={data?.summary} builderOn={Boolean(data?.builder?.visible)} />
      <p className="rs-help"><Question size={16} weight="bold" aria-hidden /><span>Help: <b>supporttargettrek@gmail.com</b></span></p>
    </aside>
  );
}

function MobileBar({ data }) {
  const canStart = data?.plans?.some((p) => p.usable);
  return (
    <header className="rs-bar">
      <Brand />
      <Btn as={Link} to={startTarget(data)} size="sm"><Sparkle size={16} weight="fill" aria-hidden /><span>{canStart || !data ? "Start a review" : "Plans"}</span></Btn>
    </header>
  );
}

function Tabs({ tabs }) {
  return (
    <nav className="rs-tabs" aria-label="Resume Lab pages">
      {tabs.map((t) => (
        <NavLink key={t.to} to={t.to} end={t.end}>
          <i><t.icon size={22} weight="duotone" aria-hidden /></i>
          <span>{t.label}</span>
          {t.count > 0 && <b aria-label={`${t.count} in progress`}>{t.count > 9 ? "9+" : t.count}</b>}
        </NavLink>
      ))}
    </nav>
  );
}

/* the old link /submit/:purchaseId opens the new page with that plan */
function SubmitRedirect() {
  const { purchaseId } = useParams();
  const [params] = useSearchParams();
  const from = params.get("from");
  return <Navigate to={`/resume-review/app/new?plan=${encodeURIComponent(purchaseId)}${from ? `&from=${encodeURIComponent(from)}` : ""}`} replace />;
}

export default function ResumeApp() {
  const token = useSelector((s) => s.auth?.token);
  const location = useLocation();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const at = useRef(0);
  const inflight = useRef(null);

  const refresh = useCallback(() => {
    if (inflight.current) return inflight.current; // one request at a time, shared by everyone who asks
    inflight.current = getAppData(5)
      .then((d) => { setData(d); setError(""); at.current = Date.now(); return d; })
      .catch((e) => { setError(errMsg(e)); throw e; })
      .finally(() => { inflight.current = null; });
    return inflight.current;
  }, []);
  const setVault = useCallback((v) => setData((d) => (d ? { ...d, vault: { files: v.files, max: v.max ?? d.vault?.max } } : d)), []);

  useEffect(() => { if (token) refresh().catch(() => {}); }, [token, refresh]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [location.pathname]);
  // back on a page after a while: quietly bring the numbers up to date
  useEffect(() => { if (token && at.current && Date.now() - at.current > STALE_MS) refresh().catch(() => {}); }, [location.pathname, token, refresh]);

  const ctx = useMemo(() => ({ data, error, refresh, setVault }), [data, error, refresh, setVault]);
  const tabs = tabsFor(data);

  if (!token) return <Navigate to={loginUrl(location)} replace />;
  // never bought anything: the plans page is the only useful start
  if (data && data.plans?.length === 0 && /^\/resume-review\/app\/?$/.test(location.pathname)) return <Navigate to="/resume-review/app/plans" replace state={{ first: true }} />;

  const focus = /\/app\/(new|checkout)(\/|$)/.test(location.pathname);
  return (
    <Page title="Resume Lab" className="rla-page">
      <AppData.Provider value={ctx}>
        <div className={cx("rs", focus && "is-focus")}>
          <Rail data={data} tabs={tabs} />
          <main className="rs-main rv-app-main">
            <MobileBar data={data} />
            <Routes>
              <Route index element={<AppHome />} />
              <Route path="reviews" element={<AppReviews />} />
              <Route path="vault" element={<VaultPage />} />
              <Route path="plans" element={<ResumeBuy />} />
              <Route path="checkout/:packageId" element={<Checkout />} />
              <Route path="new" element={<NewReview />} />
              <Route path="submit/:purchaseId" element={<SubmitRedirect />} />
              <Route path="builder" element={<ResumeBuilder />} />
              <Route path="builder/:id" element={<ResumeBuilder />} />
              <Route path="requests/:id" element={<ResumeDetail />} />
              <Route path="*" element={<Navigate to="/resume-review/app" replace />} />
            </Routes>
          </main>
          {!focus && <Tabs tabs={tabs} />}
        </div>
      </AppData.Provider>
    </Page>
  );
}
