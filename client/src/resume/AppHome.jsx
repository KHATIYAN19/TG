import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowRight, Brain, CalendarBlank, FilePdf, LinkedinLogo, MagicWand, Plus, Question, Sparkle, Stack, Star, UserCircle, Vault, Warning,
} from "@phosphor-icons/react";

import { PLAN_STATE, daysLeft, dayFmt, formatINR } from "./api";
import { useApp } from "./appData";
import { ListSkeleton, ReviewItem, ago, mb, n0, plural, startTarget } from "./parts";
import { Bar, Btn, Skeleton, cx } from "./ui";

const pct = (left, all) => (all > 0 ? Math.max(0, Math.min(100, (left / all) * 100)) : 0);
const toneOf = (v) => (v <= 15 ? "bad" : v <= 40 ? "warn" : "ok");

/* a payment that was started and never finished */
export function UnfinishedNotice() {
  const { data } = useApp();
  const u = data?.unfinished?.[0];
  if (!u) return null;
  return (
    <div className="rs-notice" role="status">
      <Warning size={22} weight="duotone" aria-hidden />
      <div><b>Unfinished payment: {u.name}</b><p>{formatINR(u.amount)} · started {dayFmt(u.startedAt)}. Not confirmed yet, nothing is lost.</p></div>
      <div className="rs-notice-act"><Btn as={Link} to={`/resume-review/payment-result?purchase=${u.id}&status=pending`} size="sm">Check or finish <ArrowRight size={14} weight="bold" aria-hidden /></Btn></div>
    </div>
  );
}

function Credits({ s, builderOn }) {
  if (!s || !s.plans) return null;
  const days = s.nextExpiry ? daysLeft(s.nextExpiry) : null;
  const tiles = [
    ...(s.aiUnlimited || s.aiAllowed > 0 ? [[Brain, "AI reviews", s.aiUnlimited ? "∞" : n0(s.aiLeft), s.aiUnlimited ? "Unlimited" : `left of ${n0(s.aiAllowed)}`, s.aiUnlimited ? 100 : pct(s.aiLeft, s.aiAllowed)]] : []),
    ...(s.humanAvailable ? [[UserCircle, "Human reviews", n0(s.humanLeft), `left of ${n0(s.humanAllowed)}`, pct(s.humanLeft, s.humanAllowed)]] : []),
    ...(s.linkedinAvailable ? [[LinkedinLogo, "LinkedIn reviews", n0(s.linkedinLeft), `left of ${n0(s.linkedinAllowed)}`, pct(s.linkedinLeft, s.linkedinAllowed)]] : []),
    ...(builderOn && s.builderAvailable ? [[MagicWand, "Resume builds", n0(s.builderLeft), `left of ${n0(s.builderAllowed)}`, pct(s.builderLeft, s.builderAllowed)]] : []),
    [CalendarBlank, "Validity", s.nextExpiry ? n0(days) : "∞", s.nextExpiry ? `days · ends ${dayFmt(s.nextExpiry)}` : "No expiry", null],
  ];
  return (
    <section aria-label="Your credits" className="rs-stats">
      {tiles.map(([Icon, label, big, small, bar]) => (
        <div key={label} className="rs-stat">
          <span className="rs-stat-k"><Icon size={17} weight="duotone" aria-hidden />{label}</span>
          <b>{big}</b>
          <small>{small}</small>
          {bar != null && <Bar value={bar} tone={toneOf(bar)} />}
        </div>
      ))}
    </section>
  );
}

function VaultCard({ vault }) {
  const files = vault?.files;
  const def = files?.find((f) => f.isDefault) || files?.[0];
  return (
    <section className="rs-card rs-stack sm" aria-labelledby="vault-h">
      <div className="rs-row between nowrap">
        <h2 id="vault-h" className="rs-h2"><Vault size={20} weight="duotone" aria-hidden />Resume Vault</h2>
        <Link to="/resume-review/app/vault" className="rs-link">Manage <ArrowRight size={13} weight="bold" aria-hidden /></Link>
      </div>
      {!files && <Skeleton h={64} style={{ borderRadius: 12 }} />}
      {files && !def && <p className="rs-sm rs-muted">No resume on file yet. Add one and every new review starts with it already picked.</p>}
      {def && (
        <div className="rs-file is-default" style={{ gridTemplateColumns: "auto minmax(0, 1fr)" }}>
          <span className="rs-ico" aria-hidden><FilePdf size={22} weight="duotone" /></span>
          <div className="rs-file-main">
            <span className="rs-file-name"><b title={def.filename}>{def.label || def.filename}</b><span className="rs-chip brand"><Star size={12} weight="fill" aria-hidden /><span>Default</span></span></span>
            <span className="rs-file-meta">{def.size > 0 && <span>{mb(def.size)}</span>}<span>Added {ago(def.createdAt)}</span></span>
          </div>
        </div>
      )}
      {files && <p className="rs-xs rs-subtle">{files.length ? `${plural(files.length, "file")} on file · up to ${vault.max}` : `Up to ${vault?.max || 12} files`}</p>}
      <Btn as={Link} to="/resume-review/app/vault" variant="ghost" size="sm">{files?.length ? "Replace or add a version" : <><Plus size={15} weight="bold" aria-hidden />Add a resume</>}</Btn>
    </section>
  );
}

function OwnedPlan({ p }) {
  const st = PLAN_STATE[p.state] || {};
  const left = daysLeft(p.expiresAt);
  const bits = [
    ["AI", Brain, p.ai.unlimited, p.ai.left, p.ai.allowed, p.ai.enabled !== false],
    ["Human", UserCircle, false, p.human.left, p.human.allowed, p.human.enabled],
    ["LinkedIn", LinkedinLogo, false, p.linkedin.left, p.linkedin.allowed, p.linkedin.enabled],
    ["Resume builds", MagicWand, false, p.builder?.left, p.builder?.allowed, p.builder?.enabled],
  ].filter((x) => x[5]);
  return (
    <article className="rs-owned-card">
      <div className="rs-row between nowrap" style={{ alignItems: "flex-start" }}>
        <div><h3 className="rs-h3">{p.package.name}</h3><p className="rs-xs rs-subtle">Bought {dayFmt(p.payment?.paidAt || p.createdAt)} · {p.expiresAt ? (p.state === "expired" ? `ended ${dayFmt(p.expiresAt)}` : `${left} day${left === 1 ? "" : "s"} left`) : "no expiry"}</p></div>
        <span className={cx("rs-chip", st.tone)}><span>{st.label}</span></span>
      </div>
      <div className="rs-owned-bars">
        {bits.map(([name, Icon, unl, l, all]) => (
          <div key={name}>
            <div><span><Icon size={15} weight="duotone" aria-hidden />{name}</span><b className="rs-num">{unl ? "Unlimited" : `${l} / ${all}`}</b></div>
            <Bar value={unl ? 100 : pct(l, all)} tone={unl ? "ok" : toneOf(pct(l, all))} />
          </div>
        ))}
      </div>
      {p.usable ? <Btn as={Link} to={`/resume-review/app/new?plan=${p.id}`} variant="ghost" size="sm" block><Sparkle size={15} weight="fill" aria-hidden />Start a review with this plan</Btn>
        : p.state === "active" && p.builder?.left > 0 ? <Btn as={Link} to="/resume-review/app/builder/new" variant="ghost" size="sm" block><MagicWand size={15} weight="bold" aria-hidden />Build a resume</Btn>
        : <Btn as={Link} to="/resume-review/app/plans" variant="ghost" size="sm" block>Buy again</Btn>}
    </article>
  );
}

export default function AppHome() {
  const user = useSelector((st) => st.auth?.user);
  const { data, error } = useApp();
  const first = String(user?.name || "").trim().split(" ")[0];
  const plans = data?.plans;
  const s = data?.summary;
  const usable = plans?.some((p) => p.usable);
  const recent = data?.recent;
  const totals = data?.totals || { reviews: 0, inProgress: 0 };
  const builder = data?.builder;
  const live = plans?.filter((p) => p.state === "active").length || 0;

  return (
    <>
      <section className="rs-hero">
        <div>
          <span className="rs-eyebrow"><Sparkle size={13} weight="fill" aria-hidden />Your space</span>
          <h1 className="rs-h1" style={{ marginTop: 8 }}>{first ? `Hi ${first}, welcome back` : "Welcome back"}</h1>
          <p>{!data ? "Loading your space…" : `${plural(live, "active plan")} · ${plural(totals.reviews, "review")}${totals.inProgress ? ` · ${n0(totals.inProgress)} in progress` : ""}`}</p>
        </div>
        <div className="rs-hero-btns">
          <Btn as={Link} to={startTarget(data)} size="lg"><Sparkle size={17} weight="fill" aria-hidden />{usable || !data ? "Start a review" : "Choose a plan"}</Btn>
          <Btn as={Link} to="/resume-review/app/plans" size="lg" variant="ghost"><Stack size={17} weight="bold" aria-hidden />Add credits</Btn>
        </div>
      </section>

      {error && <div className="rs-error" role="alert"><b>We couldn't load your space.</b><p className="rs-sm">{error}</p></div>}
      <UnfinishedNotice />
      {!data && !error ? <div className="rs-stats">{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={104} style={{ borderRadius: 16 }} />)}</div> : <Credits s={s} builderOn={Boolean(builder?.visible)} />}

      <div className="rs-grid-2">
        <section aria-labelledby="recent-h" className="rs-card" style={{ gridColumn: "1 / -1" }}>
          <div className="rs-sec-head">
            <div><h2 id="recent-h" className="rs-h2">Latest reviews</h2><p>{totals.reviews ? `Your ${Math.min(totals.reviews, recent?.length || 0)} newest of ${n0(totals.reviews)}` : "Every review you start shows up here."}</p></div>
            {totals.reviews > (recent?.length || 0) && <Link to="/resume-review/app/reviews" className="rs-link">See all {n0(totals.reviews)} <ArrowRight size={13} weight="bold" aria-hidden /></Link>}
          </div>
          {!recent && !error && <ListSkeleton n={3} />}
          {recent?.length === 0 && (
            <div className="rs-empty">
              <span className="rs-ico lg" aria-hidden><Sparkle size={24} weight="fill" /></span>
              <h3 className="rs-h3">No reviews yet</h3>
              <p>{usable ? "Start your first review. Our AI agents plan, score and double-check it in a few minutes." : "Choose a plan, then start your first review."}</p>
              <Btn as={Link} to={startTarget(data)}>{usable ? "Start a review" : "See plans"} <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
            </div>
          )}
          {recent?.length > 0 && <ul className="rs-list">{recent.map((r) => <ReviewItem key={r.id} r={r} />)}</ul>}
        </section>
        <VaultCard vault={data?.vault} />
        <section className="rs-card rs-stack sm" aria-labelledby="quick-h">
          <h2 id="quick-h" className="rs-h2">Shortcuts</h2>
          <div className="rs-quick" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
            <Link to="/resume-review/app/reviews" className="rs-q"><span className="rs-ico sm" aria-hidden><Brain size={18} weight="duotone" /></span><b>All reviews</b><span>Scores, fixes and the agents' checks</span></Link>
            {builder?.visible
              ? <Link to="/resume-review/app/builder" className="rs-q"><span className="rs-ico sm" aria-hidden><MagicWand size={18} weight="duotone" /></span><b>Resume builder</b><span>{builder.canBuild ? `${plural(builder.left, "build")} left` : "AI writes a tailored resume"}</span></Link>
              : <Link to="/resume-review/app/plans" className="rs-q"><span className="rs-ico sm" aria-hidden><Stack size={18} weight="duotone" /></span><b>Compare plans</b><span>AI, human and LinkedIn reviews</span></Link>}
            <Link to="/resume-review/app/vault" className="rs-q"><span className="rs-ico sm" aria-hidden><Vault size={18} weight="duotone" /></span><b>Resume Vault</b><span>Every version, in one place</span></Link>
            <Link to="/resume-review#mistakes" className="rs-q"><span className="rs-ico sm" aria-hidden><Question size={18} weight="duotone" /></span><b>Free guide</b><span>12 mistakes that cost interviews</span></Link>
          </div>
        </section>
      </div>

      <section aria-labelledby="plans-h">
        <div className="rs-sec-head">
          <div><h2 id="plans-h" className="rs-h2">Your plans</h2><p>{plans?.length > 1 ? "Credits add up across plans. Each keeps its own validity." : "What you've bought and what's left."}</p></div>
          <Btn as={Link} to="/resume-review/app/plans" variant="ghost" size="sm"><Plus size={14} weight="bold" aria-hidden />Add a plan</Btn>
        </div>
        {!plans && !error && <Skeleton h={180} style={{ borderRadius: 16 }} />}
        {plans?.length > 0 && <div className="rs-owned">{plans.map((p) => <OwnedPlan key={p.id} p={p} />)}</div>}
      </section>
    </>
  );
}
