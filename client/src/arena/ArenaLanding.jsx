import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowRight, Ban, BadgeCheck, Briefcase, CalendarClock, Check, Clock, CreditCard, Eye, EyeOff, Flag, Handshake, Landmark, Lock,
  MailCheck, MessageCircle, RefreshCw, Send, ShieldCheck, Smartphone, Timer, Users, Wallet,
} from "lucide-react";

import { http, inr } from "./api";
import { resolveGateway } from "./gateway";
import { useArenaChrome } from "./chrome";
import OfferBanner from "./OfferBanner";
import {
  BENEFITS, FALLBACK_FIELDS, OG_IMAGE, PAGE_NAV, PAGE_URL, SAFETY, SEO, STEPS, TOPICS, UPDATED_ISO, WHAT_IS, WHO_FOR, buildFaq, schemaJson,
} from "./landingContent";
import "./prep.css";
import { loginUrl } from "../auth/authRedirect";

const FONTS = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Geist+Mono:wght@500;600&family=Manrope:wght@400;500;600;700;800&display=swap";
const cx = (...a) => a.filter(Boolean).join(" ");

/* ============================ head: SEO, AEO and GEO ============================ */
function Head({ faq, info }) {
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
      <meta property="og:image:alt" content="Prep Buddy Arena by Target Trek" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={SEO.title} />
      <meta name="twitter:description" content={SEO.description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta property="article:modified_time" content={UPDATED_ISO} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" href={FONTS} />
      <script type="application/ld+json">{schemaJson(faq, info)}</script>
    </Helmet>
  );
}

function Section({ id, eyebrow, title, lead, tint, children }) {
  return (
    <section id={id} className={cx("pb-sec", tint && "pb-sec-tint")} aria-labelledby={`${id}-h`}>
      <div className="pb-shell">
        <header className="pb-sec-head">
          {eyebrow && <span className="pb-eyebrow">{eyebrow}</span>}
          <h2 id={`${id}-h`} className="pb-h2">{title}</h2>
          {lead && <p>{lead}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

/* ============================ hero picture ============================ */
const HUES = { K7: 172, "9T": 196 };
function Member({ side, alias, role, bio, chips }) {
  const short = alias.replace(/^Member-/, "").slice(0, 2);
  const h = HUES[short] ?? 172;
  return (
    <div className={cx("pb-member", side)}>
      <div className="pb-member-top">
        <span className="pb-avatar" aria-hidden style={{ background: `linear-gradient(135deg, hsl(${h} 70% 38%), hsl(${h + 18} 75% 26%))` }}>{short}</span>
        <div><b>{alias}</b><small>{role}</small></div>
      </div>
      <p>{bio}</p>
      <div className="pb-chips">{chips.map((c, i) => <i key={c} className={i < 2 ? "on" : ""}>{c}</i>)}</div>
      <span className="pb-hidden"><EyeOff size={14} aria-hidden />Name hidden until you both accept</span>
    </div>
  );
}

const STORY = [[Send, "Request sent"], [Check, "Accepted. You're matched!"], [MessageCircle, "Private chat unlocked"]];
function MatchStory() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;
    const t = setInterval(() => setI((v) => (v + 1) % STORY.length), 2400);
    return () => clearInterval(t);
  }, []);
  const [Icon, text] = STORY[i];
  return <p className="pb-match" aria-hidden><Icon size={16} strokeWidth={2.5} /><span key={i}>{text}</span></p>;
}

function HeroArt() {
  return (
    <figure className="pb-art" aria-label="Example: two anonymous member cards being matched">
      <Member side="a" alias="Member-K7QX2" role="Backend Engineer · product company · 4 yrs" bio="Prepping for product-company design rounds. Evenings work best." chips={["HLD", "LLD", "Kafka", "Caching"]} />
      <MatchStory />
      <Member side="b" alias="Member-9TWPM" role="Final-year student · 0 yrs" bio="Want weekly mock interviews and honest feedback." chips={["DSA", "Frontend", "React"]} />
    </figure>
  );
}

/* ============================ visibility ============================ */
function Visibility({ fields }) {
  const g = useMemo(() => {
    const pub = new Map();
    fields.filter((f) => f.visibility === "public").forEach((f) => { if (!pub.has(f.group)) pub.set(f.group, []); pub.get(f.group).push(f); });
    return { pub: [...pub.entries()], optional: fields.filter((f) => f.visibility === "after_match_optional"), never: fields.filter((f) => f.visibility === "never") };
  }, [fields]);

  return (
    <div className="pb-vis">
      <article className="pb-card pb-vis-pub">
        <div className="pb-vis-head">
          <span className="pb-ico"><Eye size={20} aria-hidden /></span>
          <div><h3>Public on your card</h3><p>Seen by signed-in members who have paid to enter. Never shown to search engines or visitors.</p></div>
        </div>
        <div className="pb-vis-groups">
          {g.pub.map(([group, list]) => (
            <div key={group}>
              <h4 className="pb-vis-k">{group}</h4>
              <ul className="pb-checks">
                {list.map((f) => <li key={f.key}><BadgeCheck size={16} aria-hidden /><span>{f.label}{f.note && <small>{f.note}</small>}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
      </article>

      <article className="pb-card">
        <div className="pb-vis-head">
          <span className="pb-ico"><Lock size={20} aria-hidden /></span>
          <div><h3>Private until you match</h3><p>You choose each one, and can change it any time.</p></div>
        </div>
        <ul className="pb-opt">
          {g.optional.map((f) => <li key={f.key}>{f.label}<em className={f.defaultShared ? "on" : ""}>{f.defaultShared ? "On by default" : "Off by default"}</em></li>)}
        </ul>
        <p className="pb-fine">Switching one off later hides it again, but can't un-see what a buddy has already seen.</p>
      </article>

      <article className="pb-card">
        <div className="pb-vis-head">
          <span className="pb-ico"><Ban size={20} aria-hidden /></span>
          <div><h3>Never shared with anyone</h3><p>Not visible to other members under any setting.</p></div>
        </div>
        <ul className="pb-never">
          {g.never.map((f) => <li key={f.key}><Lock size={15} aria-hidden /><span>{f.label}{f.note && <small>{f.note}</small>}</span></li>)}
        </ul>
        <div className="pb-scan">
          <b><ShieldCheck size={16} aria-hidden />We scan what you type</b>
          Bio, goal, skills, company fields and request messages are checked. Emails, phone numbers, links and social handles are blocked, so nobody can take the conversation off-platform before both sides agree.
        </div>
      </article>
    </div>
  );
}

/* ============================ pricing ============================ */
function Pricing({ info, gw, cta, ctaLabel }) {
  const m = info?.matchesPerEntry;
  const word = m === 1 ? "match" : "matches";
  const refundsOn = Boolean(info?.cancelRefundEnabled) && info?.cancellationFeePercent != null;
  const fee = info?.cancellationFeePercent;
  const feePaise = refundsOn ? Math.round((info.entryPricePaise * fee) / 100) : 0;
  const days = (n) => `${n} ${n === 1 ? "day" : "days"}`;

  return (
    <Section id="pricing" eyebrow="Pricing & rules" title="Simple, one-time pricing" lead="No subscription. Pay once to enter, match and chat." tint>
      <div className="pb-price-grid">
        <article className="pb-card pb-price">
          <div className="pb-price-top">
            <p>Arena entry</p>
            <p className="pb-price-num pb-mono">{info ? inr(info.entryPricePaise) : "One-time fee"}</p>
            <p>one-time · <span className="pb-mark">{m ? `${m} ${word} included` : "matches included"}</span></p>
          </div>
          <div className="pb-price-body">
            <ul className="pb-checks">
              {[
                "Your profile live in the arena",
                "Browse members with role, company and experience",
                "Send and accept buddy requests",
                m ? `${m} ${m === 1 ? "partnership" : "partnerships"} with private real-time chat${m > 1 ? " (one at a time)" : ""}` : "Private real-time chat with your buddy",
                "You control what you share after matching",
                ...(info?.couponsAvailable ? ["Coupon codes accepted at checkout"] : []),
              ].map((t) => <li key={t}><Check size={16} strokeWidth={2.5} aria-hidden />{t}</li>)}
            </ul>
            <Link to={cta} className="pb-btn pb-btn-primary pb-btn-lg">{ctaLabel}<ArrowRight size={17} aria-hidden /></Link>
            <OfferBanner offer={info?.offer} className="pb-offer" />
            <p className="pb-price-fine">Email verification required · {gw ? `payment via ${gw.name}` : "secure online payment"}</p>
          </div>
        </article>

        <div className="pb-side">
          {(!info || refundsOn) && (
            <article className="pb-card">
              <h3><Wallet size={20} aria-hidden />Cancellation & refund</h3>
              {info ? (
                <>
                  <p>Cancel any time <b>before you use your first match</b>. We keep a <b>{fee}%</b> fee and refund the rest to your original payment method.</p>
                  <div className="pb-bar" role="img" aria-label={`${100 - fee}% refunded, ${fee}% fee`}><em style={{ width: `${100 - fee}%` }} /></div>
                  <dl className="pb-split">
                    <div><dt>You pay</dt><dd className="pb-mono">{inr(info.entryPricePaise)}</dd></div>
                    <div><dt>Fee ({fee}%)</dt><dd className="pb-mono bad">−{inr(feePaise)}</dd></div>
                    <div><dt>Refund</dt><dd className="pb-mono ok">{inr(info.entryPricePaise - feePaise)}</dd></div>
                  </dl>
                  <p>Once a match is used, the entry is not refundable. The fee that applies is the one shown when you paid.</p>
                </>
              ) : <p>Cancel before your first match and get your money back, minus a small cancellation fee.</p>}
            </article>
          )}

          <article className="pb-card">
            <h3><Timer size={20} aria-hidden />Arena rules</h3>
            <ul className="pb-rules">
              <li><Handshake size={16} aria-hidden />{m ? `${m} ${word} per entry${m > 1 ? ", one after another, never at the same time" : ""}.` : "Matches happen one at a time, never in parallel."}</li>
              <li><Clock size={16} aria-hidden />{info ? `Requests expire after ${days(info.requestExpiryDays)} if unanswered.` : "Unanswered requests expire after a few days."}</li>
              {info && <li><Users size={16} aria-hidden />Up to {info.maxOutgoingRequests} pending requests at once.</li>}
              <li><RefreshCw size={16} aria-hidden />{info?.minMatchDaysBeforeEnd > 0 ? `A partnership can be ended after ${days(info.minMatchDaysBeforeEnd)}.` : "Either buddy can end a partnership at any time."}</li>
              <li><ShieldCheck size={16} aria-hidden />You can't be re-matched with someone you've already partnered with.</li>
              <li><Flag size={16} aria-hidden />Block or report anyone. Blocking ends the partnership immediately.</li>
            </ul>
          </article>

          <article className="pb-card">
            <h3><CreditCard size={20} aria-hidden />Payment</h3>
            <p>Payments are processed securely{gw ? <> by <b>{gw.name}</b></> : ""}. We never see or store your card details.</p>
            <ul className="pb-methods">
              {(gw?.methods || ["UPI", "Cards", "Net banking"]).map((x) => (
                <li key={x}>{x === "UPI" ? <Smartphone size={14} aria-hidden /> : x === "Net banking" ? <Landmark size={14} aria-hidden /> : <CreditCard size={14} aria-hidden />}{x}</li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </Section>
  );
}

/* ============================ FAQ ============================ */
function Faq({ faq }) {
  return (
    <section id="faq" className="pb-sec" aria-labelledby="faq-h">
      <div className="pb-shell pb-faq-grid">
        <header className="pb-faq-side">
          <span className="pb-eyebrow">Questions</span>
          <h2 id="faq-h" className="pb-h2">Prep buddy questions, answered</h2>
          <p>Still unsure? Write to <b>supporttargettrek@gmail.com</b> and a person replies.</p>
        </header>
        <div className="pb-faq-list">
          {faq.map((f, i) => (
            <details key={f.q} className="pb-faq" open={i === 0}>
              <summary><h3>{f.q}</h3></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* the docked bar: appears once the hero has scrolled away */
function StickyBar({ show, cta, ctaLabel, note }) {
  return (
    <div className={cx("pb-stick", show && "is-on")} role="region" aria-label="Quick action" aria-hidden={!show}>
      <div className="pb-stick-in">
        <div><b>Prep Buddy Arena</b><span>{note}</span></div>
        <Link to={cta} className="pb-btn pb-btn-primary" tabIndex={show ? 0 : -1}>{ctaLabel}<ArrowRight size={16} aria-hidden /></Link>
      </div>
    </div>
  );
}

/* ============================ page ============================ */
export default function ArenaLanding() {
  useArenaChrome();
  const signedIn = useSelector((s) => Boolean(s.auth?.token));
  const [info, setInfo] = useState(null);
  const [stage, setStage] = useState(null); // none | draft | active | matched | suspended
  const [stick, setStick] = useState(false);
  const heroRef = useRef(null);

  // shown once, right after "Delete my account" finished and the page reloaded here
  useEffect(() => {
    try {
      if (sessionStorage.getItem("arena:accountDeleted")) {
        sessionStorage.removeItem("arena:accountDeleted");
        toast.success("Your account has been deleted. You're welcome back any time.", { id: "arena-account-deleted", duration: 7000 });
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    let alive = true;
    http.get("/public").then(({ data }) => alive && setInfo(data.data)).catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    http.get("/me").then(({ data }) => setStage(data.data.profile?.status ?? "none")).catch(() => setStage(null));
  }, [signedIn]);

  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => setStick(!e.isIntersecting), { rootMargin: "-80px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const gw = resolveGateway(info?.paymentGateway);
  const faq = useMemo(() => buildFaq(info, gw), [info, gw?.key]); // eslint-disable-line react-hooks/exhaustive-deps
  const m = info?.matchesPerEntry;
  const waiting = info?.activeMembers ?? 0;
  const price = info ? inr(info.entryPricePaise) : null;

  const cta = signedIn ? "/prep-buddy/app" : loginUrl("/prep-buddy/app", "signup");
  const ctaLabel = !signedIn
    ? "Join the arena"
    : { none: "Add your details", draft: "Continue to payment", active: "Open my arena", matched: "Open my buddy chat", suspended: "View my account" }[stage] ?? "Open my arena";

  return (
    <div className="pb" style={{ paddingTop: "var(--arena-nav-h, 4rem)" }}>
      <Head faq={faq} info={info} />

      {/* ================================ HERO ================================ */}
      <header className="pb-hero" ref={heroRef}>
        <div className="pb-shell pb-hero-grid">
          <div className="pb-hero-copy">
            <span className="pb-pill"><span className="pb-dot" />Prep Buddy Arena by Target Trek</span>
            <h1 className="pb-h1">Don't prepare alone. <span className="pb-mark">Find your prep buddy.</span></h1>
            <p className="pb-lead">
              Match with someone as serious as you are for system design, DSA, frontend, backend, DevOps, SDET or GenAI interviews. See each member's role, company and experience, connect only when both agree, and practise mock interviews together in a private chat.
            </p>
            <div className="pb-btns">
              <Link to={cta} className="pb-btn pb-btn-primary pb-btn-lg">{ctaLabel}<ArrowRight size={17} aria-hidden /></Link>
              <a href="#how-it-works" className="pb-btn pb-btn-ghost pb-btn-lg">How it works</a>
            </div>
            <OfferBanner offer={info?.offer} />
            {!signedIn && <p className="pb-hero-alt">Already a member? <Link to={loginUrl("/prep-buddy/app")} className="pb-link">Log in</Link></p>}
            {waiting > 0 && <p className="pb-live"><i aria-hidden /><span><b>{waiting}</b> {waiting === 1 ? "member is" : "members are"} looking for a prep buddy right now</span></p>}
            {info && !info.enabled && <p role="status" className="pb-paused">New entries are paused for the moment. Check back soon.</p>}
            <dl className="pb-facts">
              <div><dt>{price ?? "One-time"}</dt><dd>{price ? "paid once, no subscription" : "entry fee, no subscription"}</dd></div>
              <div><dt>{m ? `${m} ${m === 1 ? "match" : "matches"}` : "Mutual"}</dt><dd>{m ? "included in every entry" : "both must accept"}</dd></div>
              <div><dt>Anonymous</dt><dd>name hidden until you match</dd></div>
              <div><dt>Verified</dt><dd>every member confirms email</dd></div>
            </dl>
          </div>
          <HeroArt />
        </div>
        <nav className="pb-shell pb-jump" aria-label="On this page">
          <span>On this page</span>
          <div>{PAGE_NAV.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</div>
        </nav>
      </header>

      <main>
        {/* ============================ WHAT IT IS ============================ */}
        <Section id="what-is" eyebrow="What it is" title="What is Prep Buddy Arena?">
          <p className="pb-answer">{WHAT_IS}</p>
          <div className="pb-grid pb-grid-3 pb-benefits">
            {BENEFITS.map(([t, d], i) => {
              const I = [Users, CalendarClock, Briefcase][i];
              return <article key={t} className="pb-card pb-tile"><span className="pb-ico"><I size={20} aria-hidden /></span><h3>{t}</h3><p>{d}</p></article>;
            })}
          </div>
        </Section>

        {/* ============================ HOW IT WORKS ============================ */}
        <Section id="how-it-works" eyebrow="How it works" title="From sign-up to your first mock interview in six steps" lead="Each step is explained before you commit to it." tint>
          <ol className="pb-steps">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="pb-step-n pb-mono">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* ============================ VISIBILITY ============================ */}
        <Section id="visibility" eyebrow="Transparency" title="Exactly what other members can see" lead="Your company, job title and experience are public so requests feel informed. Your name and contact details stay private until you both accept.">
          <Visibility fields={info?.fields?.length ? info.fields : FALLBACK_FIELDS} />
        </Section>

        {/* ============================ TOPICS ============================ */}
        <Section id="topics" eyebrow="Topics" title="Find a partner for any tech interview round" lead="Pick your topics on your profile, then filter other members by topic, level, language and availability." tint>
          <div className="pb-topics">
            {TOPICS.map(([group, list]) => (
              <article key={group} className="pb-card">
                <h3>{group}</h3>
                <ul>{list.map((t) => <li key={t}>{t}</li>)}</ul>
              </article>
            ))}
          </div>
        </Section>

        <Pricing info={info} gw={gw} cta={cta} ctaLabel={ctaLabel} />

        {/* ============================ SAFETY ============================ */}
        <Section id="safety" eyebrow="Safety" title="Built so conversations stay safe" lead="A few quiet rules that keep the arena useful for everyone.">
          <div className="pb-grid pb-grid-3">
            {SAFETY.map(([t, d], i) => {
              const I = [MailCheck, EyeOff, Flag][i];
              return <article key={t} className="pb-card pb-tile"><span className="pb-ico"><I size={20} aria-hidden /></span><h3>{t}</h3><p>{d}</p></article>;
            })}
          </div>
        </Section>

        {/* ============================ WHO IT'S FOR ============================ */}
        <Section id="who-for" eyebrow="Who it's for" title="For students, freshers and working engineers" tint>
          <div className="pb-grid pb-grid-3">
            {WHO_FOR.map(([t, d]) => <article key={t} className="pb-card pb-tile"><h3>{t}</h3><p>{d}</p></article>)}
          </div>
        </Section>

        <Faq faq={faq} />

        {/* ============================ FINAL CTA ============================ */}
        <section className="pb-sec" aria-labelledby="final-h" style={{ paddingTop: 0 }}>
          <div className="pb-shell">
            <div className="pb-final">
              <h2 id="final-h" className="pb-h2">Your next mock interview is <span className="pb-mark">one match away.</span></h2>
              <p>Join the arena, pick a buddy, and start practising this week.</p>
              <div className="pb-btns">
                <Link to={cta} className="pb-btn pb-btn-primary pb-btn-lg">{ctaLabel}<ArrowRight size={17} aria-hidden /></Link>
                <a href="#faq" className="pb-btn pb-btn-ghost pb-btn-lg">Read the FAQ</a>
              </div>
            </div>
          </div>
        </section>
        <div className="pb-end-pad" aria-hidden />
      </main>

      <StickyBar show={stick} cta={cta} ctaLabel={ctaLabel} note={price ? `${price} once · ${m ? `${m} ${m === 1 ? "match" : "matches"} included` : "no subscription"}` : "Find your interview prep partner"} />
    </div>
  );
}
