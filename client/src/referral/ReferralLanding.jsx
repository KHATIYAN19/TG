import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, Check, MagnifyingGlass, Minus, Plus } from "@phosphor-icons/react";

import { Page } from "../resume/ui";
import { Avatar, Ico, ResumeBoost, Vip } from "./ui";
import { publicInfo } from "./api";
import { ANSWER, FACTS, HELP_EMAIL, HOWTO_NAME, OG_IMAGE, PAGE_URL, REFERRER_STEPS, SEEKER_STEPS, SEO, UPDATED_ISO, UPDATED_LABEL, faqFor, featuresFor, offered, schemaJson } from "./referralContent";
import "./referral.css";

/* ============================ head: SEO, AEO and GEO ============================ */
function Head({ info }) {
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
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      <meta name="geo.position" content="20.5937;78.9629" />
      <meta name="ICBM" content="20.5937, 78.9629" />
      <meta name="content-language" content="en-IN" />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Target Trek" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={SEO.title} />
      <meta property="og:description" content={SEO.description} />
      <meta property="og:url" content={PAGE_URL} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:alt" content="Target Trek Referrals" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={SEO.title} />
      <meta name="twitter:description" content={SEO.description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta property="article:modified_time" content={UPDATED_ISO} />
      {/* rebuilt once the live plans arrive, so the schema never mentions a plan that isn't on sale */}
      <script type="application/ld+json">{schemaJson(info)}</script>
    </Helmet>
  );
}

const Section = ({ id, eyebrow, title, lead, children, tint }) => (
  <section id={id} className={`rfl-sec${tint ? " tint" : ""}`} aria-labelledby={`${id}-h`}>
    <div className="rv-shell">
      <div className="rfl-head">{eyebrow && <span className="rf-eyebrow">{eyebrow}</span>}<h2 id={`${id}-h`}>{title}</h2>{lead && <p>{lead}</p>}</div>
      {children}
    </div>
  </section>
);

/* a small picture of the product (decorative) */
function Mock({ priority }) {
  return (
    <div className="rfl-mock" aria-hidden>
      <div className="m">
        <div className="m-p"><Avatar person={{ name: "Aarav K.", initials: "AK" }} ring={priority} /><div><b>Aarav K.<Vip show={priority} /></b><small>SDE-2 at Flipkart · 4 yrs</small></div><span className="rf-badge ok">Can refer</span></div>
        <p>Backend engineer. Happy to refer people with strong fundamentals.</p>
        <div className="m-btn">🚀 Ask for a referral</div>
      </div>
      <div className="m">
        <div className="b them">Hi! I read your resume. Sending it to the hiring manager today.</div>
        <div className="b me">Thank you so much! 🙏 Job ID is R-12345.</div>
        <div className="b them">Done 🎉</div>
      </div>
    </div>
  );
}

const Price = ({ e, tone, title, price, unit, note, items, best }) => (
  <article className={`rf-card rf-plan rfl-price${best ? " best" : ""}`}>
    {best && <span className="rf-ribbon">{best}</span>}
    <div className="name"><Ico e={e} tone={tone} size="sm" /><b>{title}</b></div>
    <div className="p">{price}{unit && <small> {unit}</small>}</div>
    {note && <p className="rf-xs">{note}</p>}
    <ul>{items.map((x) => <li key={x}><Check size={15} weight="bold" aria-hidden />{x}</li>)}</ul>
  </article>
);

const COMPARE = [
  ["Who sees your resume first", "A screening tool", "A person at the company"],
  ["Context on why you fit", "Only your resume", "Your note, plus their word"],
  ["Knowing what happened", "Often silence", "Accepted or declined, here"],
  ["Cost to ask", "Free", "Free"],
];

export default function ReferralLanding() {
  const token = useSelector((s) => s.auth?.token);
  const [info, setInfo] = useState(null);
  useEffect(() => { publicInfo().then(setInfo).catch(() => {}); }, []);
  const go = token ? "Open Referrals" : "Get started free";
  const remember = () => { try { sessionStorage.setItem("resume:returnTo", "/referral/app"); } catch { /* ignore */ } };
  const hasPriority = offered(info, "priority");
  const unlimited = offered(info, "unlimited") ? info.subPlans.find((p) => p.kind === "unlimited") : null;
  const priority = hasPriority ? info.subPlans.filter((p) => p.kind === "priority").sort((a, b) => a.price - b.price) : [];
  const pack = info?.plansEnabled !== false ? (info?.plans || [])[0] : null;
  const hasSub = offered(info, "subscription");
  const features = featuresFor(info);
  const faq = faqFor(info);

  return (
    <Page title={SEO.title} description={SEO.description} className="rv-landing rl rfl">
      <Head info={info} />

      <header className="rfl-hero">
        <div className="rv-shell rfl-hero-in">
          <div className="rfl-copy">
            <nav aria-label="Breadcrumb" className="rf-xs"><Link to="/learn" style={{ color: "inherit" }}>Learn</Link> › <span aria-current="page">Referrals</span></nav>
            <span className="rfl-pill"><span aria-hidden>🤝</span>Target Trek Referrals · India</span>
            <h1>Get referred by people who <em>already work there</em></h1>
            <p className="rfl-answer">{ANSWER}</p>
            <div className="rf-btns">
              <Link to="/referral/app" className="rv-btn rv-btn-primary rv-btn-lg" onClick={remember}>{go}<ArrowRight size={17} weight="bold" aria-hidden /></Link>
              <Link to="/referral/app/find" className="rv-btn rv-btn-ghost rv-btn-lg" onClick={remember}><MagnifyingGlass size={17} weight="bold" aria-hidden />Browse referrers</Link>
            </div>
            <ul className="rfl-points" aria-label="Quick facts">{FACTS.map(([e, a, b]) => <li key={a}><span className="e" aria-hidden>{e}</span><b>{a}</b><span>{b}</span></li>)}</ul>
            {info?.stats?.referrers > 0 && <p className="rf-xs">👥 {info.stats.referrers.toLocaleString("en-IN")} referrers across {info.stats.companies.toLocaleString("en-IN")} companies right now.</p>}
          </div>
          <Mock priority={hasPriority} />
        </div>
      </header>

      <Section id="how-it-works" eyebrow="🧭 How it works" title={HOWTO_NAME} lead="Two sides, one simple flow. Sign in with your Target Trek account.">
        <div className="rf-grid c2">
          <article className="rf-card rfl-path"><header><Ico e="🙋" tone="sky" /><h3>I want a referral</h3></header><ol className="rf-steps">{SEEKER_STEPS.map(([t, d]) => <li key={t}><div><b>{t}</b><span>{d}</span></div></li>)}</ol>
            <Link to="/referral/app/find" className="rl-textlink" onClick={remember} style={{ fontWeight: 700 }}>Find a referrer <ArrowRight size={13} weight="bold" aria-hidden /></Link></article>
          <article className="rf-card rfl-path"><header><Ico e="🧑‍💼" tone="violet" /><h3>I can refer people</h3></header><ol className="rf-steps">{REFERRER_STEPS.map(([t, d]) => <li key={t}><div><b>{t}</b><span>{d}</span></div></li>)}</ol>
            <Link to="/referral/app/profile" className="rl-textlink" onClick={remember} style={{ fontWeight: 700 }}>Start referring, free <ArrowRight size={13} weight="bold" aria-hidden /></Link></article>
        </div>
      </Section>

      <Section id="why" tint eyebrow="🎯 Why it works" title="A referral versus applying alone" lead="A referral doesn't promise a job. It gets a person to look at you.">
        <div className="rf-card rf-scroll" style={{ padding: 0 }}>
          <table className="rf-table">
            <thead><tr><th scope="col">What matters</th><th scope="col">Applying alone</th><th scope="col">With a referral</th></tr></thead>
            <tbody>{COMPARE.map(([a, b, c]) => <tr key={a}><th scope="row" style={{ textAlign: "left", fontWeight: 700, padding: 10 }}>{a}</th><td><Minus size={13} aria-hidden /> {b}</td><td><Check size={13} weight="bold" color="var(--rv-ok)" aria-hidden /> <b>{c}</b></td></tr>)}</tbody>
          </table>
        </div>
      </Section>

      <Section id="features" eyebrow="✨ What you get" title="Everything for a referral, in one place">
        <div className="rf-grid c3">{features.map(([e, tone, t, d]) => <article key={t} className="rf-card rfl-feat"><Ico e={e} tone={tone} /><h3>{t}</h3><p>{d}</p></article>)}</div>
      </Section>

      <Section id="pricing" tint eyebrow="💳 Pricing" title="Free to ask. Pay only when they say yes." lead="Referrers never pay. You open a chat only after a referrer accepts.">
        <div className="rf-grid c3">
          <Price e="🆓" tone="green" title="Ask for referrals" price="Free" items={["Search every company", "Send your resume and the job", "Post on the job board"]} />
          <Price e="💬" tone="sky" best={!unlimited ? "After they accept" : ""} title="Open a chat" price={info?.paywall === false ? "Free" : info ? `₹${info.unlockFee}` : "Small fee"} unit={info?.paywall === false ? "right now" : "per chat"} items={["One private live chat", "Resume and details shared", "End the chat any time"]} />
          {unlimited && <Price e="♾️" tone="green" best="Most popular" title={unlimited.name} price={`₹${unlimited.price}`} unit="/ month" note="Renews monthly. Cancel any time." items={["Unlimited requests", "Every accepted chat opens free", "Stays on until it expires"]} />}
          {priority.length > 0 && <Price e="👑" tone="gold" title="Priority" price={`₹${priority[0].price}`} unit={priority[0].billing === "monthly" ? "/ month" : `for ${priority[0].days} days`} note={priority.length > 1 ? `${priority.length} options: one-time or monthly.` : priority[0].billing === "monthly" ? "Renews monthly." : "Pay once."} items={["Priority badge on your profile", "Your requests are listed first", "Stand out to referrers"]} />}
          {pack && <Price e="🎟️" tone="violet" title={pack.name} price={`₹${pack.price}`} unit="one-time" note={`About ₹${pack.perChat} a chat${pack.validityDays ? ` · valid ${pack.validityDays} days` : ""}`} items={pack.features.length ? pack.features.slice(0, 3) : [`${pack.unlocks} chat credits`]} />}
        </div>
        <ul className="rf-policy" style={{ marginTop: 18 }}>
          {hasSub && <li><span className="e" aria-hidden>✅</span><div><b>Cancel any time</b>Your plan stays on until it expires.</div></li>}
          <li><span className="e" aria-hidden>🚫</span><div><b>No refunds</b>All payments are final.</div></li>
          <li><span className="e" aria-hidden>📧</span><div><b>Charged twice?</b>Email <a href={`mailto:${HELP_EMAIL}`}>{HELP_EMAIL}</a>. We refund duplicates.</div></li>
        </ul>
        <p className="rf-xs" style={{ marginTop: 12 }}>Prices in INR, as of today. Pay by UPI, card or net banking.</p>
      </Section>

      <Section id="trust" eyebrow="🔒 Safety and privacy" title="You stay in control">
        <div className="rf-grid c3">
          <article className="rf-card rfl-feat"><Ico e="🕶️" tone="violet" /><h3>Hide your name</h3><p>Referrers can stay Anonymous. Others see only company, role and experience.</p></article>
          <article className="rf-card rfl-feat"><Ico e="📄" tone="sky" /><h3>Your resume, only to them</h3><p>Only the person you ask can open it, and only while the request is active.</p></article>
          <article className="rf-card rfl-feat"><Ico e="✋" tone="rose" /><h3>Say no, or end a chat</h3><p>Decline any request. Either side can end a chat at any time.</p></article>
        </div>
      </Section>

      <Section id="resume" tint eyebrow="📄 Before you ask" title="A strong resume gets forwarded">
        <ResumeBoost />
      </Section>

      <Section id="faq" eyebrow="❓ FAQ" title="Questions people ask about referrals">
        <div className="rf-faq rfl-faq">{faq.map(([q, a]) => <details key={q}><summary>{q}<Plus size={16} weight="bold" aria-hidden /></summary><p>{a}</p></details>)}</div>
        <p className="rfl-updated" style={{ marginTop: 14 }}>Last updated <time dateTime={UPDATED_ISO}>{UPDATED_LABEL}</time>. We don't guarantee a referral, interview or job.</p>
      </Section>

      <section className="rfl-cta" aria-labelledby="cta-h">
        <div className="rv-shell"><div className="rf-hello">
          <div><h2 id="cta-h" style={{ fontFamily: "var(--rl-display)", fontSize: "clamp(26px,4vw,38px)", color: "#fff", letterSpacing: "-.03em" }}>Ready to get referred? 🚀</h2><p>Search a company and send your resume. It takes about two minutes.</p></div>
          <div className="rf-btns"><Link to="/referral/app" className="rv-btn rv-btn-primary rv-btn-lg" onClick={remember}>{go}<ArrowRight size={17} weight="bold" aria-hidden /></Link><Link to="/learn" className="rv-btn rv-btn-ghost rv-btn-lg">More on Target Trek</Link></div>
        </div></div>
      </section>
    </Page>
  );
}
