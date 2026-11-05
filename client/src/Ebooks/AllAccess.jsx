import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig, animate, motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BellRing,
  BookOpen,
  Briefcase,
  Check,
  ChevronDown,
  Gift,
  GraduationCap,
  Infinity as InfinityIcon,
  Lightbulb,
  LockKeyhole,
  LogIn,
  Mail,
  MessagesSquare,
  Minus,
  RefreshCw,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  Users,
  Zap,
} from "lucide-react";

import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { PACK_CSS, PackCard, inr, usePacks } from "./PackSections";

/* =====================================================
   PACK PAGE
   Served on /book/all-books, /book/life-type-combo (and /all-access).
   Shows BOTH packs; the one whose URL you are on is highlighted.

   Every number, price, book and match count comes from the database
   (the pack Book rows, see PackSections.jsx). A pack with 0 matches
   shows no matches anywhere on this page.
===================================================== */

const SITE_URL = "https://www.targettrek.in";
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";
const EASE = [0.22, 1, 0.36, 1];

const readTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

/* ---------- small animation helpers ---------- */

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
  transition: { duration: 0.7, ease: EASE, delay },
});

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } };

function Counter({ value, prefix = "", suffix = "", format }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(0, Number(value) || 0, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return <span ref={ref}>{prefix}{format ? format(shown) : shown.toLocaleString("en-IN")}{suffix}</span>;
}

function Section({ id, alt, children, className = "" }) {
  return (
    <section id={id} className={`pg-section ${alt ? "pg-alt" : ""} ${className}`}>
      <div className="pk-wrap">{children}</div>
    </section>
  );
}

function Heading({ eyebrow, title, lead, center }) {
  return (
    <motion.div className={`pg-head ${center ? "center" : ""}`} {...rise()}>
      {eyebrow && <span className="pk-eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {lead && <p className="pk-lead">{lead}</p>}
    </motion.div>
  );
}

/* ---------- static copy ---------- */

const PERSONAS = [
  { icon: GraduationCap, title: "Freshers & final-year students", text: "Build the fundamentals interviewers expect, with every topic in one place instead of ten scattered tabs." },
  { icon: Briefcase, title: "Working engineers (2-6 years)", text: "Revise fast before an interview loop and fill the gaps in system design, Java and backend rounds." },
  { icon: Rocket, title: "Career switchers", text: "Move into backend or product companies with a structured library and a practice partner to keep you going." },
  { icon: Target, title: "Senior and lead candidates", text: "Sharpen design discussions and trade-off answers, then rehearse them live in mock interviews." },
];

const STEPS = [
  { icon: Zap, title: "Pick a pack", text: "Pay once by UPI, card or net banking. No subscription, no renewals." },
  { icon: Mail, title: "Books land in your inbox", text: "Your PDFs are emailed right after payment, with a welcome email explaining everything you got." },
  { icon: Swords, title: "Sign up on Prep Arena", text: "Use the same email. Your credits are added to your account the moment you sign up.", needsMatches: true },
  { icon: BellRing, title: "Stay up to date", text: "New book? You get an email when it is released. Lifetime members get the PDF in it." },
];

const TRUST = [
  { icon: LockKeyhole, title: "Secure payment", text: "Paid through a trusted payment gateway. We never see your card details." },
  { icon: Mail, title: "Instant delivery", text: "PDFs are emailed right after payment. Large files arrive as a download link." },
  { icon: MessagesSquare, title: "Real support", text: `A human replies at ${SUPPORT_EMAIL}.` },
  { icon: ShieldCheck, title: "Your data stays yours", text: "Prep Arena shows only an alias. Your email and phone stay hidden unless you choose to share." },
];

const MATCH_FLOW = [
  { title: "Sign up", text: "Create your Prep Arena profile with the email you bought with. Your credits are added instantly." },
  { title: "Find a buddy", text: "Browse members preparing for similar roles and send a request, or accept one." },
  { title: "Practise together", text: "Run mock interviews and chat privately inside the platform. You appear under an alias." },
  { title: "Use the next credit", text: "When a partnership ends, your next credit pairs you with someone new." },
];

const faqList = (hasMatches) => [
  { q: "What is in the All Books pack?", a: "Every book available on Target Trek on the day you pay, as PDFs emailed to you, plus an email whenever we publish a new book. Books published after your purchase can be bought separately or by upgrading to Lifetime." },
  { q: "What does the Lifetime pack add?", a: "All current books, and every book we publish in the future is emailed to you free, with no extra payment, for as long as Target Trek publishes." },
  ...(hasMatches
    ? [
        { q: "What is a Prep Arena credit?", a: "Prep Arena pairs you with another serious candidate for mock interviews and private chat. 1 credit = 1 match = 1 partnership. When it ends, your next credit pairs you with someone new, so several credits means several buddies, one after another." },
        { q: "When do I get my credits?", a: "The moment you sign up on Prep Arena with the same email you used at checkout. If you already have an arena account they are added right after payment. There is nothing more to pay." },
        { q: "Do unused credits expire?", a: "No. Credits stay on your account until you use them." },
      ]
    : []),
  { q: "How do I request a new book?", a: "Sign in to Prep Arena with the email you bought the pack with, open the Books tab and send your suggestion. It is open to pack members only, and you can see the status of each request." },
  { q: "How will I know a new book is out?", a: "We email you when a new book is released. Lifetime members get the PDF in that email. Use the unsubscribe link in any email to stop alerts." },
  { q: "Which email should I use at checkout?", a: "Use the email you also sign in with. Your books, new-book alerts and credits are all linked to it." },
  { q: "How are the books delivered?", a: "As PDFs by email right after payment. Very large files come as a download link. If anything is missing, write to us and we will resend it." },
  { q: "I already bought one of the books. Can I still get a pack?", a: "Yes. Write to us with your order details and we will help you pick the right option." },
];

/* ===================================================== */

export default function AllAccess() {
  const { pathname } = useLocation();
  const { data, loading, error, reload } = usePacks();

  const [theme, setTheme] = useState(readTheme);
  const [product, setProduct] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [showBar, setShowBar] = useState(false);
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });

  // Parallax: the hero background and covers drift at different speeds while you scroll.
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const blobY1 = useTransform(heroP, [0, 1], [0, 170]);
  const blobY2 = useTransform(heroP, [0, 1], [0, -110]);
  const fanY = useTransform(heroP, [0, 1], [0, 80]);
  const heroFade = useTransform(heroP, [0, 0.9], [1, 0.25]);

  // Scroll-spy for the sticky section nav.
  const [active, setActive] = useState("packs");
  useEffect(() => {
    const ids = ["packs", "compare", "library", "prep-arena", "request", "faq"];
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [loading, data]);

  useEffect(() => {
    const sync = (event) => {
      const next = event?.detail?.theme;
      setTheme(next === "dark" || next === "light" ? next : readTheme());
    };
    window.addEventListener(THEME_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(THEME_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const hero = heroRef.current;
      setShowBar(hero ? hero.getBoundingClientRect().bottom < 0 : false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const packs = useMemo(() => data?.packs || [], [data]);
  const books = useMemo(() => data?.books || [], [data]);
  const stats = data?.stats || { bookCount: 0, individualWorth: 0 };
  const current = packs.find((p) => p.redirectUrl === pathname) || null;
  const cheapest = packs[0];
  const lifetimePack = packs.find((p) => p.plan === "lifetime");
  const maxMatches = Math.max(0, ...packs.map((p) => Number(p.matches) || 0));
  const anyMatches = maxMatches > 0;
  const bestSave = cheapest && stats.individualWorth > cheapest.price ? stats.individualWorth - cheapest.price : 0;
  const savePct = cheapest && stats.individualWorth > 0 ? Math.round((1 - cheapest.price / stats.individualWorth) * 100) : 0;

  const title = current ? `${current.title} | Target Trek` : "All Books & Lifetime Packs | Target Trek";
  const description = cheapest
    ? `Get every Target Trek interview book from ${inr(cheapest.price)}, or go Lifetime and get every future book too.${anyMatches ? ` Includes up to ${maxMatches} Prep Arena credits.` : ""}`
    : "Get every Target Trek interview book in one pack.";

  const jsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: packs.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: p.title,
          description: p.subtitle || undefined,
          offers: { "@type": "Offer", priceCurrency: p.currency || "INR", price: p.price, availability: "https://schema.org/InStock" },
        },
      })),
    }),
    [packs]
  );


  // Bottom bar: the HLD, LLD, Java and Spring Boot covers (matched by name from the live book list).
  const barCovers = useMemo(() => {
    const withCover = books.filter((b) => b.coverPageUrl);
    const text = (b) => `${b.title} ${b.slug || ""}`.toLowerCase();
    const wanted = [/\bhld\b|high[- ]level/, /\blld\b|low[- ]level/, /\bjava\b(?!script)/, /spring ?boot/];
    const picked = [];
    for (const re of wanted) {
      const hit = withCover.find((b) => re.test(text(b)) && !picked.includes(b));
      if (hit) picked.push(hit);
    }
    return picked.length ? picked : withCover.slice(0, 4);
  }, [books]);
  const ticker = books.length ? [...books, ...books].map((b) => b.title) : [];
  const newest = books.length ? books[books.length - 1] : null;

  const goPacks = () => document.getElementById("packs")?.scrollIntoView({ behavior: "smooth" });

  /* ---------- comparison table rows (driven by the packs that exist) ---------- */
  const columns = packs.slice(0, 3);
  const rows = [
    { label: "Books available today", cell: () => true, other: "Pay for each" },
    { label: "Books published later", cell: (p) => p.plan === "lifetime", other: "Pay for each", note: (p) => (p.plan === "lifetime" ? "Emailed free" : "") },
    { label: "Email when a new book is published", cell: () => true, other: false },
    ...(anyMatches ? [{ label: "Prep Arena credits", cell: (p) => (Number(p.matches) > 0 ? `${p.matches}` : false), other: false }] : []),
    ...(columns.some((p) => p.plan === "lifetime") ? [{ label: "Free limited credits on new feature launches", cell: (p) => p.plan === "lifetime", other: false }] : []),
    { label: "Request new books in Prep Arena", cell: () => true, other: false },
    { label: "One payment, no renewal", cell: () => true, other: "Pay again each time" },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="pk-root pk-page mt-16" data-theme={theme}>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
          <link rel="canonical" href={`${SITE_URL}${current?.redirectUrl || "/book/all-books"}`} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          {packs.length > 0 && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
        </Helmet>

        <style>{PACK_CSS}</style>
        <style>{PAGE_CSS}</style>

        <motion.div className="pg-progress" style={{ scaleX: progress }} aria-hidden="true" />

        {/* ================= HERO ================= */}
        <header className="pg-hero" ref={heroRef}>
          <motion.div className="pg-blob pg-blob-1" style={{ y: blobY1 }} aria-hidden="true" />
          <motion.div className="pg-blob pg-blob-2" style={{ y: blobY2 }} aria-hidden="true" />
          <div className="pg-grid-bg" aria-hidden="true" />

          <div className="pk-wrap pg-hero-grid">
            <div>
              <motion.span className="pk-eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Sparkles size={13} style={{ verticalAlign: "-2px", marginRight: 6 }} />Target Trek packs
              </motion.span>

              <motion.h1 initial="hidden" animate="show" variants={stagger}>
                {["Every interview book.", "One pack."].map((line, i) => (
                  <motion.span key={line} className={`pg-line ${i === 1 ? "accent" : ""}`} variants={item}>{line}</motion.span>
                ))}
              </motion.h1>

              <motion.p className="pg-lead" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35, ease: EASE }}>
                {stats.bookCount > 0 ? `All ${stats.bookCount} books` : "Every book"} on the platform{cheapest ? ` from ${inr(cheapest.price)}` : ""}.
                Go Lifetime and every book we publish later is yours too.
                {anyMatches && ` Plus up to ${maxMatches} Prep Arena credits to find your practice partner.`}
              </motion.p>

              <motion.div className="pg-cta-row" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5, ease: EASE }}>
                <button type="button" className="pk-btn pk-btn-primary" onClick={goPacks}>See the packs <ArrowRight size={16} /></button>
                <a className="pk-btn pk-btn-ghost" href="#library">Browse the books</a>
                <Link className="pk-btn pk-btn-ghost" to="/prep-buddy">Prep Arena <ArrowUpRight size={15} /></Link>
              </motion.div>

              <motion.ul className="pg-chips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                <li><Check size={14} /> One-time payment</li>
                <li><Check size={14} /> PDFs by email</li>
                <li><Check size={14} /> No subscription</li>
              </motion.ul>
            </div>

            {/* floating covers */}
            <motion.div className="pg-fan" style={{ y: fanY, opacity: heroFade }} aria-hidden="true">
              {(barCovers.length ? barCovers : [null, null, null]).map((b, i) => (
                <motion.div
                  key={b?._id || i}
                  className="pg-fan-card"
                  style={{ "--i": i }}
                  initial={{ opacity: 0, y: 60, rotate: 0 }}
                  animate={{ opacity: 1, y: 0, rotate: (i - 1.5) * 7 }}
                  transition={{ duration: 0.9, delay: 0.3 + i * 0.12, ease: EASE }}
                  whileHover={{ y: -12, scale: 1.07, rotate: 0, zIndex: 30, transition: { duration: 0.25 } }}
                >
                  <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}>
                    {b?.coverPageUrl ? <img src={b.coverPageUrl} alt="" /> : <div className="pg-fan-ph"><BookOpen size={34} /></div>}
                    {b?.title && <span className="pg-fan-cap">{b.title}</span>}
                  </motion.div>
                </motion.div>
              ))}
              {anyMatches && (
                <motion.div className="pg-float-tag" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, type: "spring", stiffness: 160, damping: 12 }}>
                  <Swords size={16} /> Up to {maxMatches} credits
                </motion.div>
              )}
            </motion.div>
          </div>
        </header>

        {/* ================= TICKER ================= */}
        {ticker.length > 0 && (
          <div className="pg-ticker" aria-hidden="true">
            <div className="pg-ticker-track">
              {ticker.map((t, i) => <span key={`${t}-${i}`}><i />{t}</span>)}
            </div>
          </div>
        )}

        {/* ================= SECTION NAV (scroll-spy) ================= */}
        <nav className="pg-nav" aria-label="Sections">
          <div className="pk-wrap pg-nav-in">
            {[
              ["packs", "Packs"],
              ["compare", "Compare"],
              ["library", "Books"],
              ...(anyMatches ? [["prep-arena", "Prep Arena"]] : []),
              ["request", "Request a book"],
              ["faq", "FAQ"],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`} className={active === id ? "on" : ""}>{label}</a>
            ))}
            <Link to="/prep-buddy" className="pg-nav-ext">Prep Arena <ArrowUpRight size={13} /></Link>
          </div>
        </nav>

        {/* ================= STATS ================= */}
        {!loading && !error && packs.length > 0 && (
          <Section className="pg-stats-wrap">
            <motion.div className="pg-stats" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
              <motion.div variants={item}><b><Counter value={stats.bookCount} /></b><span>Books included today</span></motion.div>
              {stats.individualWorth > 0 && <motion.div variants={item}><b><Counter value={stats.individualWorth} prefix="₹" /></b><span>Worth if bought one by one</span></motion.div>}
              {savePct > 0 && <motion.div variants={item}><b><Counter value={savePct} suffix="%" /></b><span>Saved with the {cheapest?.title || "pack"}</span></motion.div>}
              {anyMatches && <motion.div variants={item}><b><Counter value={maxMatches} /></b><span>Prep Arena credits included</span></motion.div>}
            </motion.div>
          </Section>
        )}

        {/* ================= PACKS ================= */}
        <Section id="packs">
          <Heading eyebrow="Choose your pack" title="Two ways to get every book" lead="One payment. No subscription. PDFs are emailed right after payment." />

          {loading && (
            <div className="pk-grid" aria-hidden="true">
              {[0, 1].map((i) => <div key={i} className="pk-card pk-skel"><i /><i /><i /></div>)}
            </div>
          )}

          {!loading && error && (
            <div className="pg-error" role="alert">
              <span>{error}</span>
              <button type="button" className="pk-btn pk-btn-ghost" onClick={reload}><RefreshCw size={15} /> Try again</button>
            </div>
          )}

          {!loading && !error && packs.length === 0 && <p className="pk-lead">Packs are coming soon.</p>}

          {!loading && !error && packs.length > 0 && (
            <motion.div className="pk-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
              {packs.map((p) => (
                <motion.div key={p._id} variants={item} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} style={{ display: "flex" }}>
                  <PackCard pack={p} worth={stats.individualWorth} current={p.redirectUrl === pathname} onBuy={setProduct} />
                </motion.div>
              ))}
            </motion.div>
          )}
          {lifetimePack && (
            <motion.div className="pg-bonus" {...rise(0.05)}>
              <span className="pg-ico"><Gift size={22} /></span>
              <div>
                <b>Lifetime bonus: free limited credits when we launch new features</b>
                <p>We will give you free, limited Prep Arena credits when we launch new features and more. Buy once; the perks keep growing.</p>
              </div>
            </motion.div>
          )}
          <p className="pg-note">Questions? <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
        </Section>

        {/* ================= COMPARE ================= */}
        {columns.length > 0 && (
          <Section id="compare" alt>
            <Heading center eyebrow="Compare" title="What is in each pack" lead="See exactly what you get, and what buying book by book would mean." />
            <motion.div className="pg-table-wrap" {...rise(0.05)}>
              <table className="pg-table">
                <thead>
                  <tr>
                    <th scope="col"><span className="sr-only">Feature</span></th>
                    {columns.map((p) => (
                      <th scope="col" key={p._id} className={p.plan === "lifetime" ? "hl" : ""}>
                        {p.title}<small>{inr(p.price)}</small>
                      </th>
                    ))}
                    <th scope="col">One by one<small>{stats.individualWorth > 0 ? inr(stats.individualWorth) : ""}</small></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      {columns.map((p) => {
                        const v = r.cell(p);
                        return (
                          <td key={p._id} className={p.plan === "lifetime" ? "hl" : ""}>
                            {v === true ? <Check className="yes" size={18} /> : v === false ? <Minus className="no" size={18} /> : <b>{v}</b>}
                            {r.note?.(p) && <small>{r.note(p)}</small>}
                          </td>
                        );
                      })}
                      <td>{r.other === false ? <Minus className="no" size={18} /> : <span className="pg-muted">{r.other}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </Section>
        )}

        {/* ================= VALUE BARS ================= */}
        {stats.individualWorth > 0 && cheapest && (
          <Section>
            <Heading eyebrow="The maths" title="Why a pack beats buying one by one" />
            <div className="pg-bars">
              {[
                { label: "Buying every book separately", value: stats.individualWorth, tone: "muted" },
                ...packs.map((p) => ({ label: p.title, value: p.price, tone: p.plan === "lifetime" ? "hot" : "warm" })),
              ].map((b, i) => (
                <div key={b.label} className="pg-bar-row">
                  <span className="pg-bar-label">{b.label}</span>
                  <div className="pg-bar-track">
                    <motion.div
                      className={`pg-bar ${b.tone}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.max(6, (b.value / Math.max(stats.individualWorth, ...packs.map((p) => p.price))) * 100)}%` }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 1.1, ease: EASE, delay: i * 0.12 }}
                    />
                  </div>
                  <b className="pg-bar-val">{inr(b.value)}</b>
                </div>
              ))}
            </div>
            {bestSave > 0 && (
              <motion.p className="pg-save-line" {...rise(0.1)}>
                You save up to <b>{inr(bestSave)}</b>{lifetimePack ? ", and Lifetime keeps adding books for free." : "."}
              </motion.p>
            )}
          </Section>
        )}

        {/* ================= LIBRARY ================= */}
        <Section id="library" alt>
          <Heading
            eyebrow="The library"
            title="Books included today"
            lead={books.length > 0 ? `${books.length} ${books.length === 1 ? "book" : "books"} from our Main Books, worth ${inr(stats.individualWorth)} if bought one by one. This list updates by itself as books are added.` : "Books will appear here as soon as they are published."}
          />
          <BookLibrary books={books} />
        </Section>

        {/* ================= WHO IT IS FOR ================= */}
        <Section>
          <Heading center eyebrow="Made for you" title="Who gets the most out of it" />
          <motion.div className="pg-personas" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            {PERSONAS.map(({ icon: Icon, title: t, text }) => (
              <motion.div key={t} className="pg-persona" variants={item} whileHover={{ y: -6 }}>
                <span className="pg-ico"><Icon size={22} /></span>
                <h3>{t}</h3>
                <p>{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </Section>

        {/* ================= HOW IT WORKS ================= */}
        <Section alt>
          <Heading center eyebrow="How it works" title="From payment to prepared" />
          <ol className="pg-steps">
            {STEPS.filter((s) => !s.needsMatches || anyMatches).map(({ icon: Icon, title: t, text }, i) => (
              <motion.li key={t} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}>
                <span className="pg-step-n">{i + 1}</span>
                <span className="pg-ico"><Icon size={20} /></span>
                <h3>{t}</h3>
                <p>{text}</p>
              </motion.li>
            ))}
          </ol>
        </Section>

        {/* ================= PREP ARENA (only when a pack has matches) ================= */}
        {anyMatches && (
          <Section id="prep-arena">
            <div className="pg-arena">
              <div>
                <Heading eyebrow="Prep Arena" title="Credits: your practice partners" lead="Reading is half the work. Prep Arena pairs you with another serious candidate so you can rehearse real interviews together." />
                <motion.p className="pg-defn" {...rise(0.05)}>
                  <b>1 credit = 1 match = 1 buddy partnership.</b> It lasts as long as you both keep practising. When it ends, your next credit pairs you with someone new.
                </motion.p>
                <motion.ol className="pg-flow" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
                  {MATCH_FLOW.map((s, i) => (
                    <motion.li key={s.title} variants={item}>
                      <span className="pg-step-n sm">{i + 1}</span>
                      <div><h4>{s.title}</h4><p>{s.text}</p></div>
                    </motion.li>
                  ))}
                </motion.ol>
                <Link className="pk-btn pk-btn-ghost pg-inline" to="/prep-buddy">See Prep Arena <ArrowRight size={15} /></Link>
              </div>

              {/* match chips: one per match in the biggest pack */}
              <motion.div className="pg-matchcard" {...rise(0.1)}>
                <p className="pg-matchcard-t">Your {maxMatches} Prep Arena {maxMatches === 1 ? "credit" : "credits"}</p>
                <div className="pg-dots" aria-hidden="true">
                  {Array.from({ length: Math.min(maxMatches, 60) }, (_, i) => (
                    <motion.i key={i} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.02, type: "spring", stiffness: 260, damping: 16 }} />
                  ))}
                </div>
                <p className="pg-matchcard-s">Added to your account the moment you sign up with the same email. Unused credits never expire.</p>
              </motion.div>
            </div>
          </Section>
        )}

        {/* ================= NEW BOOK ALERTS ================= */}
        <Section alt>
          <div className="pg-alert-grid">
            <div>
              <Heading eyebrow="Never miss a book" title="New books, straight to your inbox" lead="When we release a new book you get an email. With Lifetime, the PDF is in that email and there is nothing to pay." />
              <ul className="pg-ticks">
                <li><Check size={16} /> Email when a new book is released</li>
                <li><Check size={16} /> Lifetime: PDF included, free, forever</li>
                <li><Check size={16} /> Unsubscribe any time from the email</li>
              </ul>
            </div>
            <motion.div className="pg-mail" initial={{ opacity: 0, y: 40, rotate: 2 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, ease: EASE }} aria-label="Example new-book email">
              <div className="pg-mail-bar"><span /><span /><span /><em>Example email</em></div>
              <div className="pg-mail-body">
                <b>Target Trek</b>
                <p>Hi there,</p>
                <p>A new book is live{lifetimePack ? ", and it is included in your Lifetime pack" : ""}.</p>
                <div className="pg-mail-card"><BookOpen size={18} /><span>{newest?.title || "Your next book"}</span></div>
                <span className="pg-mail-btn">{lifetimePack ? "Download your copy" : "View the book"}</span>
              </div>
            </motion.div>
          </div>
        </Section>

        {/* ================= REQUEST BOOKS ================= */}
        <Section id="request">
          <motion.div className="pg-request" {...rise()}>
            <span className="pg-ico big"><Lightbulb size={26} /></span>
            <div>
              <h2>Request or suggest a new book</h2>
              <p>
                Tell us which IT topic you are preparing for. Pack members can send requests and track their status from inside Prep Arena.
                <b> Sign in to Prep Arena</b> with the email you bought the pack with, then open the <b>Books</b> tab.
              </p>
              <ul className="pg-ticks inline">
                <li><Check size={15} /> See every book available right now</li>
                <li><Check size={15} /> Send a request in under a minute</li>
                <li><Check size={15} /> Track: new, planned, published</li>
              </ul>
              <div className="pg-btn-row">
                <Link className="pk-btn pk-btn-primary" to="/prep-buddy/signup?mode=login" state={{ from: { pathname: "/prep-buddy/app/books", search: "" } }}>
                  <LogIn size={16} /> Sign in to Prep Arena
                </Link>
                <Link className="pk-btn pk-btn-ghost" to="/prep-buddy">About Prep Arena <ArrowUpRight size={15} /></Link>
              </div>
              <p className="pg-req-note"><b>Lifetime pack?</b> After you buy it you can request or suggest any new book to us, and every future book is emailed to you free.</p>
            </div>
          </motion.div>
        </Section>

        {/* ================= TRUST ================= */}
        <Section alt>
          <Heading center eyebrow="Buy with confidence" title="Simple, secure, supported" />
          <motion.div className="pg-trust" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            {TRUST.map(({ icon: Icon, title: t, text }) => (
              <motion.div key={t} className="pg-trust-item" variants={item}>
                <span className="pg-ico"><Icon size={20} /></span>
                <h3>{t}</h3>
                <p>{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </Section>

        {/* ================= FAQ ================= */}
        <Section id="faq">
          <div className="pg-narrow">
            <Heading center eyebrow="FAQ" title="Questions, answered" />
            <div className="pg-faq">
              {faqList(anyMatches).map((f, i) => (
                <motion.div key={f.q} className={`pg-faq-item ${openFaq === i ? "open" : ""}`} {...rise(i * 0.03)}>
                  <button type="button" onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i}>
                    <span>{f.q}</span><ChevronDown size={18} />
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} style={{ overflow: "hidden" }}>
                        <p>{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ================= FINAL CTA ================= */}
        {cheapest && (
          <section className="pg-final">
            <motion.div className="pk-wrap pg-final-in" {...rise()}>
              <InfinityIcon size={34} />
              <h2>Stop collecting links. Start preparing.</h2>
              <p>Every book{anyMatches ? `, up to ${maxMatches} Prep Arena credits` : ""} and an inbox that tells you when there is more, from {inr(cheapest.price)}.</p>
              <button type="button" className="pg-final-btn" onClick={goPacks}>Choose your pack <ArrowRight size={17} /></button>
              <small>
                <Users size={13} style={{ verticalAlign: "-2px" }} /> Questions? <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
                {" · "}<Link to="/prep-buddy">Prep Arena</Link>{" · "}<Link to="/books">All books</Link>
              </small>
            </motion.div>
          </section>
        )}

        {/* ================= STICKY BAR ================= */}
        <AnimatePresence>
          {showBar && cheapest && !product && (
            <motion.div className="pg-sticky" initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 90, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
              <span className="pg-st-covers" aria-hidden="true">
                {barCovers.length > 0 ? (
                  barCovers.map((b, i) => (
                    <motion.img
                      key={b._id}
                      src={b.coverPageUrl}
                      alt=""
                      title={b.title}
                      style={{ zIndex: barCovers.length - i }}
                      initial={{ opacity: 0, y: 14, rotate: 0 }}
                      animate={{ opacity: 1, y: 0, rotate: (i - (barCovers.length - 1) / 2) * 5 }}
                      transition={{ duration: 0.45, delay: 0.1 + i * 0.07, ease: EASE }}
                      whileHover={{ y: -8, scale: 1.12, rotate: 0, zIndex: 20 }}
                    />
                  ))
                ) : (
                  <span className="pg-st-ico"><BookOpen size={20} /></span>
                )}
              </span>
              <div className="pg-st-text">
                <span className="pg-st-eyebrow">Book pack</span>
                <b className="pg-st-name">{cheapest.title}</b>
              </div>
              <div className="pg-st-price">
                <small>from</small>
                <b>{inr(cheapest.price)}</b>
                {savePct > 0 && <em>Save {savePct}%</em>}
              </div>
              <button type="button" className="pk-btn pk-btn-primary pg-st-btn" onClick={goPacks}>
                <span>Get a pack</span> <ArrowRight size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <PayUCheckoutModal isOpen={Boolean(product)} onClose={() => setProduct(null)} product={product} />
      </div>
    </MotionConfig>
  );
}

/* ===================================================== */

function BookLibrary({ books }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState(null);

  const cats = useMemo(() => ["All", ...Array.from(new Set(books.map((b) => b.category).filter(Boolean)))], [books]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return books.filter((b) => {
      if (cat !== "All" && b.category !== cat) return false;
      if (!needle) return true;
      return [b.title, b.subtitle, b.category, ...(b.topics || []), ...(b.tags || [])].join(" ").toLowerCase().includes(needle);
    });
  }, [books, q, cat]);

  if (books.length === 0) return null;

  return (
    <>
      <motion.div className="pg-filter" {...rise(0.05)}>
        <label className="pg-search">
          <Search size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search books, topics…" aria-label="Search books" />
        </label>
        {cats.length > 2 && (
          <div className="pg-cats" role="tablist" aria-label="Category">
            {cats.map((c) => (
              <button key={c} type="button" role="tab" aria-selected={cat === c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div className="pg-books" layout>
        <AnimatePresence mode="popLayout">
          {shown.map((b, i) => {
            const topics = [...(b.topics || []), ...(b.tags || [])].slice(0, 5);
            const points = (b.highlights || []).slice(0, 5);
            const isOpen = open === b._id;
            const hasMore = Boolean(b.description) || points.length > 0;
            return (
              <motion.article
                key={b._id}
                layout
                className="pg-book"
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease: EASE, delay: Math.min(i, 6) * 0.05 }}
                whileHover={{ y: -6 }}
              >
                <div className="pg-book-top">
                  <Link to={b.redirectUrl || "/books"} className="pg-cover" aria-label={`Open ${b.title}`}>
                    {b.coverPageUrl ? <img src={b.coverPageUrl} alt={b.title} loading="lazy" /> : <BookOpen size={26} />}
                    <span className="pg-shine" aria-hidden="true" />
                  </Link>
                  <div className="pg-book-body">
                    <div className="pg-book-tags">
                      {b.category && <span className="pg-tag">{b.category}</span>}
                      {b.badge && <span className="pg-tag hot">{b.badge}</span>}
                    </div>
                    <h3><Link to={b.redirectUrl || "/books"}>{b.title}</Link></h3>
                    {b.subtitle && <p className="pg-sub">{b.subtitle}</p>}
                    {Number(b.matches) > 0 && <span className="pg-bk-matches"><Swords size={12} /> {b.matches} Prep Arena {Number(b.matches) === 1 ? "credit" : "credits"}</span>}
                  </div>
                </div>

                {topics.length > 0 && <div className="pg-topics">{topics.map((t) => <span key={t}>{t}</span>)}</div>}

                <AnimatePresence initial={false}>
                  {isOpen && hasMore && (
                    <motion.div key="more" className="pg-more" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
                      {b.description && <p>{b.description}</p>}
                      {points.length > 0 && <ul>{points.map((h) => <li key={h}><Check size={13} /> {h}</li>)}</ul>}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pg-book-foot">
                  <span className="pg-incl"><Check size={13} /> Included</span>
                  <span className="pg-was">{inr(b.price)}</span>
                  {hasMore && (
                    <button type="button" className="pg-more-btn" onClick={() => setOpen(isOpen ? null : b._id)} aria-expanded={isOpen}>
                      {isOpen ? "Less" : "Details"}
                    </button>
                  )}
                  <Link to={b.redirectUrl || "/books"} className="pg-view">View <ArrowUpRight size={13} /></Link>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {shown.length === 0 && <p className="pg-empty">No books match your search. <button type="button" onClick={() => { setQ(""); setCat("All"); }}>Clear filters</button></p>}
    </>
  );
}

const PAGE_CSS = `
.pk-page.mt-16{margin-top:4rem}
.pk-page{--pg-bg:#FFFBF7;--pg-alt:#FFF4EA;--pg-glow:rgba(249,115,22,.22);background:var(--pg-bg);min-height:100vh;padding:0;overflow-x:clip}
.pk-page[data-theme="dark"]{--pg-bg:#161210;--pg-alt:#1C1714;--pg-glow:rgba(249,115,22,.16)}
.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.pg-progress{position:fixed;top:0;left:0;right:0;height:3px;transform-origin:0 50%;background:linear-gradient(90deg,#F97316,#EA580C);z-index:60}

/* hero */
.pg-hero{position:relative;overflow:hidden;padding:72px 0 56px;background:var(--pg-bg)}
.pg-blob{position:absolute;border-radius:50%;filter:blur(70px);pointer-events:none}
.pg-blob-1{width:420px;height:420px;right:-80px;top:-120px;background:var(--pg-glow);animation:pg-drift 14s ease-in-out infinite}
.pg-blob-2{width:320px;height:320px;left:-100px;bottom:-140px;background:rgba(251,191,36,.18);animation:pg-drift 18s ease-in-out infinite reverse}
@keyframes pg-drift{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,24px)}}
.pg-grid-bg{position:absolute;inset:0;pointer-events:none;opacity:.5;background-image:radial-gradient(var(--pk-line) 1px,transparent 1px);background-size:26px 26px;mask-image:linear-gradient(180deg,#000,transparent 80%)}
.pg-hero-grid{position:relative;display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center}
.pg-hero h1{margin:16px 0 14px;font-size:clamp(2.2rem,6vw,3.7rem);line-height:1.06;font-weight:800;letter-spacing:-.025em}
.pg-line{display:block}.pg-line.accent{background:linear-gradient(90deg,#F97316,#EA580C 60%,#C2410C);-webkit-background-clip:text;background-clip:text;color:transparent}
.pg-lead{max-width:560px;font-size:1.1rem;color:var(--pk-mut);margin:0 0 24px}
.pg-cta-row{display:flex;flex-wrap:wrap;gap:12px}
.pg-cta-row .pk-btn-primary{flex:none}
.pg-chips{list-style:none;display:flex;flex-wrap:wrap;gap:8px 18px;padding:0;margin:20px 0 0;color:var(--pk-mut);font-size:13.5px}
.pg-chips li{display:inline-flex;gap:6px;align-items:center}.pg-chips svg{color:var(--pk-ok)}
.pg-fan{position:relative;height:340px;display:flex;justify-content:center;align-items:center}
.pg-fan-card{width:150px;margin:0 -22px;flex:none;border-radius:12px;overflow:hidden;box-shadow:0 22px 46px rgba(120,53,15,.28);background:var(--pk-card);border:1px solid var(--pk-line);z-index:calc(var(--i) + 1)}
.pg-fan-card img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover}
.pg-fan-cap{display:block;padding:7px 8px;font-size:11px;font-weight:800;line-height:1.25;text-align:center;color:var(--pk-ink);background:var(--pk-card);border-top:1px solid var(--pk-line);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.pg-fan-ph{aspect-ratio:3/4;display:grid;place-items:center;background:var(--pk-soft);color:var(--pk-or2)}
.pg-float-tag{position:absolute;right:4px;bottom:14px;z-index:9;display:inline-flex;gap:7px;align-items:center;background:var(--pk-or2);color:#fff;font-weight:800;font-size:13px;padding:9px 14px;border-radius:999px;box-shadow:0 10px 26px rgba(234,88,12,.4)}

/* ticker */
.pg-ticker{overflow:hidden;border-block:1px solid var(--pk-line);background:var(--pg-alt);padding:12px 0}
.pg-ticker-track{display:flex;gap:34px;width:max-content;animation:pg-scroll 48s linear infinite}
.pg-ticker:hover .pg-ticker-track{animation-play-state:paused}
.pg-ticker span{display:inline-flex;align-items:center;gap:34px;white-space:nowrap;font-size:14px;font-weight:700;color:var(--pk-mut)}
.pg-ticker i{width:6px;height:6px;border-radius:50%;background:var(--pk-or)}
@keyframes pg-scroll{to{transform:translateX(-50%)}}

/* sections */
.pg-section{padding:64px 0}.pg-alt{background:var(--pg-alt)}.pg-narrow{max-width:780px;margin:0 auto}
.pg-head{margin-bottom:30px}.pg-head.center{text-align:center}.pg-head.center .pk-lead{margin-inline:auto}
.pg-head h2{margin:10px 0 8px}
.pg-note{text-align:center;color:var(--pk-mut);font-size:13px;margin:22px 0 0}.pg-note a{color:var(--pk-or2)}
.pg-muted{color:var(--pk-mut);font-size:13px}
.pg-error{display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:14px 16px;border-radius:12px;background:rgba(185,28,28,.08);border:1px solid #B91C1C;color:#B91C1C}
.pg-inline{display:inline-flex;margin-top:18px;flex:none}
.pg-ico{display:inline-grid;place-items:center;width:44px;height:44px;border-radius:12px;background:var(--pk-soft);color:var(--pk-or2);flex:none}
.pg-ico.big{width:56px;height:56px;border-radius:16px}

/* stats */
.pg-stats-wrap{padding:36px 0 0}
.pg-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px}
.pg-stats>div{background:var(--pk-card);border:1px solid var(--pk-line);border-radius:16px;padding:18px;text-align:center}
.pg-stats b{display:block;font-size:2rem;line-height:1.1;font-weight:800;color:var(--pk-or2)}
.pg-stats span{font-size:13px;color:var(--pk-mut)}

/* compare */
.pg-table-wrap{overflow-x:auto;border:1px solid var(--pk-line);border-radius:18px;background:var(--pk-card)}
.pg-table{width:100%;min-width:560px;border-collapse:collapse;font-size:14.5px}
.pg-table th,.pg-table td{padding:14px 16px;text-align:center;border-bottom:1px solid var(--pk-line)}
.pg-table tbody tr:last-child th,.pg-table tbody tr:last-child td{border-bottom:0}
.pg-table th[scope=row]{text-align:left;font-weight:600}
.pg-table thead th{font-size:15px;font-weight:800;vertical-align:bottom}
.pg-table small{display:block;font-weight:600;color:var(--pk-mut);font-size:12px;margin-top:2px}
.pg-table .hl{background:var(--pk-soft)}
.pg-table .yes{color:var(--pk-ok)}.pg-table .no{color:var(--pk-mut);opacity:.45}
.pg-table td b{color:var(--pk-or2);font-size:16px}

/* bars */
.pg-bars{display:grid;gap:16px;max-width:860px}
.pg-bar-row{display:grid;grid-template-columns:minmax(120px,210px) 1fr auto;gap:14px;align-items:center}
.pg-bar-label{font-size:14px;font-weight:600}
.pg-bar-track{height:16px;border-radius:999px;background:var(--pk-line);overflow:hidden}
.pg-bar{height:100%;border-radius:999px}
.pg-bar.muted{background:linear-gradient(90deg,#A8A29E,#78716C)}.pg-bar.warm{background:linear-gradient(90deg,#FDBA74,#F97316)}.pg-bar.hot{background:linear-gradient(90deg,#F97316,#C2410C)}
.pg-bar-val{font-size:15px;min-width:70px;text-align:right}
.pg-save-line{margin:22px 0 0;font-size:1.05rem}.pg-save-line b{color:var(--pk-ok)}

/* books */
.pg-filter{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-bottom:22px}
.pg-search{display:flex;align-items:center;gap:8px;flex:1 1 260px;max-width:380px;background:var(--pk-card);border:1px solid var(--pk-line);border-radius:12px;padding:0 12px;transition:box-shadow .2s,border-color .2s}
.pg-search:focus-within{border-color:var(--pk-or);box-shadow:0 0 0 3px rgba(249,115,22,.18)}
.pg-search svg{color:var(--pk-mut);flex:none}
.pg-search input{flex:1;border:0;background:none;outline:0;color:var(--pk-ink);padding:11px 0;font:inherit;font-size:14px;min-width:0}
.pg-cats{display:flex;flex-wrap:wrap;gap:8px}
.pg-cats button{border:1px solid var(--pk-line);background:var(--pk-card);color:var(--pk-ink);border-radius:999px;padding:7px 14px;font:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:all .18s}
.pg-cats button:hover{border-color:var(--pk-or);color:var(--pk-or2);transform:translateY(-1px)}
.pg-cats button.on{background:var(--pk-or2);border-color:var(--pk-or2);color:#fff}
.pg-books{display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:18px}
.pg-book{display:flex;flex-direction:column;gap:12px;background:var(--pk-card);border:1px solid var(--pk-line);border-radius:18px;padding:16px;transition:box-shadow .25s,border-color .25s}
.pg-book:hover{box-shadow:0 20px 44px rgba(120,53,15,.18);border-color:#FDBA74}
.pg-book-top{display:flex;gap:14px}
.pg-cover{position:relative;width:88px;flex:none;aspect-ratio:3/4;border-radius:10px;overflow:hidden;background:var(--pk-soft);display:grid;place-items:center;color:var(--pk-or2);box-shadow:0 8px 18px rgba(120,53,15,.18)}
.pg-cover img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s}
.pg-book:hover .pg-cover img{transform:scale(1.08)}
.pg-shine{position:absolute;inset:0;background:linear-gradient(115deg,transparent 35%,rgba(255,255,255,.4) 50%,transparent 65%);transform:translateX(-120%);transition:transform .7s}
.pg-book:hover .pg-shine{transform:translateX(120%)}
.pg-book-body{display:flex;flex-direction:column;gap:4px;min-width:0;flex:1}
.pg-book-tags{display:flex;gap:6px;flex-wrap:wrap}
.pg-tag{font-size:10.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;padding:2px 8px;border-radius:999px;background:var(--pk-soft);color:var(--pk-or2)}
.pg-tag.hot{background:var(--pk-or2);color:#fff}
.pg-book h3{margin:0;font-size:16px;font-weight:800;line-height:1.3}
.pg-book h3 a{color:inherit;text-decoration:none;background:linear-gradient(var(--pk-or),var(--pk-or)) 0 100%/0 2px no-repeat;transition:background-size .3s,color .2s}
.pg-book h3 a:hover{background-size:100% 2px;color:var(--pk-or2)}
.pg-sub{margin:0;font-size:13px;color:var(--pk-mut);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.pg-bk-matches{display:inline-flex;align-items:center;gap:5px;width:fit-content;margin-top:4px;padding:2px 9px;border-radius:999px;font-size:11.5px;font-weight:800;color:#C2410C;background:var(--pk-soft);border:1px solid var(--pk-line)}
.pg-topics{display:flex;flex-wrap:wrap;gap:6px}
.pg-topics span{font-size:12px;padding:3px 10px;border-radius:8px;background:var(--pg-alt);border:1px solid var(--pk-line);color:var(--pk-mut);transition:all .18s}
.pg-topics span:hover{color:var(--pk-or2);border-color:var(--pk-or)}
.pg-more{overflow:hidden;font-size:13.5px;color:var(--pk-mut)}
.pg-more p{margin:0 0 8px}.pg-more ul{list-style:none;margin:0;padding:0;display:grid;gap:5px}.pg-more li{display:flex;gap:7px;align-items:flex-start}.pg-more li svg{color:var(--pk-ok);flex:none;margin-top:3px}
.pg-book-foot{margin-top:auto;display:flex;align-items:center;gap:10px;font-size:13px;padding-top:10px;border-top:1px dashed var(--pk-line)}
.pg-incl{display:inline-flex;gap:4px;align-items:center;color:var(--pk-ok);font-weight:700}.pg-was{color:var(--pk-mut);text-decoration:line-through}
.pg-more-btn{margin-left:auto;border:0;background:none;color:var(--pk-or2);font:inherit;font-weight:700;cursor:pointer;padding:2px 6px;border-radius:6px}
.pg-more-btn:hover{background:var(--pk-soft)}
.pg-view{display:inline-flex;align-items:center;gap:3px;font-weight:800;color:#fff;background:var(--pk-or2);padding:6px 12px;border-radius:9px;text-decoration:none;transition:transform .15s,box-shadow .15s}
.pg-view:hover{transform:translateY(-1px);box-shadow:0 8px 18px rgba(234,88,12,.35)}
.pg-empty{text-align:center;color:var(--pk-mut)}.pg-empty button{border:0;background:none;color:var(--pk-or2);font:inherit;font-weight:800;cursor:pointer;text-decoration:underline}

/* section nav */
.pg-nav{position:sticky;top:64px;z-index:40;background:color-mix(in srgb,var(--pg-bg) 88%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--pk-line)}
.pg-nav-in{display:flex;gap:4px;align-items:center;overflow-x:auto;scrollbar-width:none;padding-block:6px}
.pg-nav-in::-webkit-scrollbar{display:none}
.pg-nav a{flex:none;padding:8px 14px;border-radius:999px;font-size:13.5px;font-weight:700;color:var(--pk-mut);text-decoration:none;transition:all .2s}
.pg-nav a:hover{color:var(--pk-or2);background:var(--pk-soft)}
.pg-nav a.on{color:#fff;background:var(--pk-or2);box-shadow:0 6px 14px rgba(234,88,12,.3)}
.pg-nav a.pg-nav-ext{margin-left:auto;display:inline-flex;gap:4px;align-items:center;border:1px solid var(--pk-or);color:var(--pk-or2)}
.pg-bonus{display:flex;gap:16px;align-items:center;margin-top:22px;padding:16px 18px;border-radius:16px;border:1px dashed var(--pk-or);background:linear-gradient(135deg,var(--pk-soft),transparent)}
.pg-bonus b{font-size:15.5px}.pg-bonus p{margin:2px 0 0;color:var(--pk-mut);font-size:14px}
.pg-btn-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}.pg-btn-row .pk-btn{flex:none}
.pg-req-note{margin:14px 0 0 !important;padding:10px 12px;border-radius:12px;background:var(--pk-soft);border:1px solid var(--pk-line);font-size:14px}

/* personas + trust */
.pg-personas,.pg-trust{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px}
.pg-persona,.pg-trust-item{background:var(--pk-card);border:1px solid var(--pk-line);border-radius:18px;padding:22px}
.pg-persona h3,.pg-trust-item h3{margin:14px 0 6px;font-size:16.5px;font-weight:800}
.pg-persona p,.pg-trust-item p{margin:0;color:var(--pk-mut);font-size:14.5px}

/* steps */
.pg-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;counter-reset:s}
.pg-steps li{position:relative;background:var(--pk-card);border:1px solid var(--pk-line);border-radius:18px;padding:24px 20px 20px}
.pg-steps h3{margin:12px 0 6px;font-size:16.5px;font-weight:800}.pg-steps p{margin:0;color:var(--pk-mut);font-size:14.5px}
.pg-step-n{position:absolute;top:-14px;right:16px;width:30px;height:30px;border-radius:50%;background:var(--pk-or2);color:#fff;font-weight:800;display:grid;place-items:center;font-size:14px;box-shadow:0 6px 14px rgba(234,88,12,.35)}
.pg-step-n.sm{position:static;flex:none;width:28px;height:28px;font-size:13px;box-shadow:none}

/* prep arena */
.pg-arena{display:grid;grid-template-columns:1.15fr .85fr;gap:36px;align-items:start}
.pg-defn{margin:0 0 20px;padding:14px 16px;border-radius:14px;background:var(--pk-soft);border:1px solid var(--pk-line);font-size:15px}
.pg-flow{list-style:none;margin:0;padding:0;display:grid;gap:14px}
.pg-flow li{display:flex;gap:12px;align-items:flex-start}
.pg-flow h4{margin:0 0 2px;font-size:15.5px}.pg-flow p{margin:0;color:var(--pk-mut);font-size:14px}
.pg-matchcard{position:sticky;top:90px;background:linear-gradient(160deg,#F97316,#C2410C);color:#fff;border-radius:22px;padding:26px;box-shadow:0 24px 54px rgba(194,65,12,.34)}
.pg-matchcard-t{margin:0 0 14px;font-size:1.3rem;font-weight:800}
.pg-dots{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:16px}
.pg-dots i{width:16px;height:16px;border-radius:50%;background:#fff;opacity:.92;display:block}
.pg-matchcard-s{margin:0;font-size:13.5px;opacity:.92}

/* alerts */
.pg-alert-grid{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center}
.pg-ticks{list-style:none;margin:0;padding:0;display:grid;gap:10px}.pg-ticks li{display:flex;gap:10px;align-items:center;font-size:15px}.pg-ticks svg{color:var(--pk-ok);flex:none}
.pg-ticks.inline{margin:14px 0 0}
.pg-mail{background:var(--pk-card);border:1px solid var(--pk-line);border-radius:16px;overflow:hidden;box-shadow:0 22px 50px rgba(120,53,15,.16);max-width:440px;width:100%;justify-self:center}
.pg-mail-bar{display:flex;gap:6px;align-items:center;padding:10px 14px;background:var(--pk-soft)}
.pg-mail-bar span{width:10px;height:10px;border-radius:50%;background:var(--pk-or);opacity:.55}.pg-mail-bar em{margin-left:auto;font-size:11px;font-style:normal;color:var(--pk-mut)}
.pg-mail-body{padding:18px;font-size:14px}.pg-mail-body b{color:var(--pk-or2);font-size:16px}.pg-mail-body p{margin:8px 0}
.pg-mail-card{display:flex;gap:10px;align-items:center;margin:12px 0;padding:12px;border-radius:10px;background:var(--pk-soft);border:1px solid var(--pk-line);font-weight:700;color:var(--pk-ink)}
.pg-mail-card svg{color:var(--pk-or2)}
.pg-mail-btn{display:inline-block;background:var(--pk-or2);color:#fff;font-weight:700;font-size:13px;padding:9px 16px;border-radius:7px;animation:pg-pulse 2.4s ease-in-out infinite}
@keyframes pg-pulse{0%,100%{box-shadow:0 0 0 0 rgba(234,88,12,.45)}50%{box-shadow:0 0 0 10px rgba(234,88,12,0)}}

/* request */
.pg-request{display:flex;gap:22px;align-items:flex-start;background:var(--pk-card);border:1px solid var(--pk-line);border-radius:24px;padding:32px}
.pg-request h2{margin:0 0 8px}.pg-request p{margin:0;color:var(--pk-mut);max-width:680px}.pg-request b{color:var(--pk-ink)}

/* faq */
.pg-faq{display:grid;gap:10px}
.pg-faq-item{background:var(--pk-card);border:1px solid var(--pk-line);border-radius:14px;overflow:hidden}
.pg-faq button{width:100%;display:flex;justify-content:space-between;gap:12px;align-items:center;text-align:left;padding:16px 18px;background:none;border:0;color:var(--pk-ink);font:inherit;font-weight:700;cursor:pointer}
.pg-faq button:focus-visible{outline:3px solid #FDBA74;outline-offset:-3px}
.pg-faq button svg{flex:none;transition:transform .25s}.pg-faq-item.open button svg{transform:rotate(180deg)}
.pg-faq p{margin:0;padding:0 18px 16px;color:var(--pk-mut);font-size:14.5px}

/* final cta + sticky */
.pg-final{background:linear-gradient(135deg,#F97316,#C2410C);color:#fff;padding:64px 0;text-align:center}
.pg-final-in{display:grid;justify-items:center;gap:10px}
.pg-final h2{color:#fff;margin:0;font-size:clamp(1.6rem,4vw,2.3rem)}.pg-final p{margin:0;max-width:560px;opacity:.95}
.pg-final-btn{margin-top:8px;display:inline-flex;gap:8px;align-items:center;background:#fff;color:#C2410C;font-weight:800;font-size:16px;border:0;border-radius:14px;padding:14px 26px;cursor:pointer;box-shadow:0 14px 30px rgba(0,0,0,.2);font-family:inherit;transition:transform .15s}
.pg-final-btn:hover{transform:translateY(-2px) scale(1.02)}
.pg-final small{opacity:.9}.pg-final a{color:#fff;text-decoration:underline}
.pg-final small a{margin:0 2px}
.pg-sticky{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));translate:-50% 0;z-index:50;width:min(760px,calc(100vw - 28px));display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:16px;padding:10px 10px 10px 14px;border-radius:20px;color:var(--pk-ink);background:color-mix(in srgb,var(--pk-card) 92%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--pk-line);box-shadow:0 22px 54px rgba(120,53,15,.28),0 0 0 1px rgba(249,115,22,.18);overflow:hidden}
.pg-sticky::before{content:"";position:absolute;inset:0 0 auto 0;height:3px;background:linear-gradient(90deg,#FDBA74,#F97316,#C2410C,#F97316,#FDBA74);background-size:200% 100%;animation:pg-slide 5s linear infinite}
@keyframes pg-slide{to{background-position:-200% 0}}
.pg-st-covers{display:flex;align-items:center;padding:0 10px 0 4px}
.pg-st-covers img{position:relative;width:34px;height:46px;object-fit:cover;border-radius:5px;margin-left:-12px;border:2px solid var(--pk-card);box-shadow:0 6px 14px rgba(120,53,15,.35);background:var(--pk-soft)}
.pg-st-covers img:first-child{margin-left:0}
.pg-st-ico{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:linear-gradient(135deg,#F97316,#C2410C);color:#fff;box-shadow:0 8px 18px rgba(234,88,12,.4)}
.pg-st-text{display:flex;flex-direction:column;min-width:0;line-height:1.25}
.pg-st-eyebrow{font-size:10.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--pk-or2)}
.pg-st-name{font-size:16px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pg-st-price{display:flex;align-items:baseline;gap:6px;white-space:nowrap}
.pg-st-price small{font-size:12px;color:var(--pk-mut);font-weight:600}
.pg-st-price b{font-size:1.45rem;font-weight:800;line-height:1;color:var(--pk-ink)}
.pg-st-price em{font-style:normal;font-size:11px;font-weight:800;padding:3px 8px;border-radius:999px;background:rgba(21,128,61,.14);color:var(--pk-ok);align-self:center}
.pg-sticky .pg-st-btn{flex:none;width:auto;min-height:44px;padding:10px 20px;font-size:14.5px;border-radius:14px;position:relative;animation:pg-pulse 2.6s ease-in-out infinite}

@media (max-width:900px){
  .pg-hero-grid,.pg-arena,.pg-alert-grid{grid-template-columns:1fr}
  .pg-fan{height:270px;order:-1}.pg-fan-card{width:112px;margin:0 -16px}
  .pg-matchcard{position:static}
}
@media (max-width:640px){
  .pg-hero{padding:48px 0 36px}.pg-section{padding:44px 0}
  .pg-nav{top:56px}
  .pg-bar-row{grid-template-columns:1fr auto;grid-template-areas:"l v" "t t"}
  .pg-bar-label{grid-area:l}.pg-bar-val{grid-area:v}.pg-bar-track{grid-area:t}
  .pg-request{flex-direction:column;padding:22px}
}
/* tablet */
@media (max-width:900px){
  .pg-sticky{width:min(640px,calc(100vw - 24px));gap:12px}
  .pg-st-price em{display:none}
}
/* phone: a compact full-width bar */
@media (max-width:640px){
  .pg-sticky{width:calc(100vw - 20px);bottom:calc(10px + env(safe-area-inset-bottom,0px));grid-template-columns:auto minmax(0,1fr) auto;grid-template-areas:"cov text btn" "cov price btn";gap:2px 10px;padding:10px 10px 10px 14px;border-radius:18px}
  .pg-st-ico{display:none}
  .pg-st-covers{grid-area:cov;padding:0 6px 0 2px}
  .pg-st-covers img{width:28px;height:38px;margin-left:-10px;border-width:1.5px}
  .pg-st-text{grid-area:text}
  .pg-st-price{grid-area:price}
  .pg-st-price b{font-size:1.25rem}
  .pg-st-name{font-size:14.5px}
  .pg-sticky .pg-st-btn{grid-area:btn;padding:10px 16px;min-height:46px}
}
@media (max-width:400px){
  .pg-st-covers img:nth-child(n+4){display:none}
}
@media (max-width:360px){
  .pg-st-covers{display:none}
  .pg-sticky{grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"text btn" "price btn"}
  .pg-sticky .pg-st-btn span{display:none}
  .pg-sticky .pg-st-btn{padding:10px 14px}
}
@media (min-width:1280px){
  .pg-sticky{width:min(820px,calc(100vw - 48px));padding:12px 12px 12px 18px;gap:20px}
  .pg-st-name{font-size:17px}
}
@media (prefers-reduced-motion:reduce){
  .pg-sticky::before,.pg-sticky .pg-st-btn{animation:none!important}
  .pg-blob,.pg-ticker-track,.pg-mail-btn{animation:none!important}
}
`;
