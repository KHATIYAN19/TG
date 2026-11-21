import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowRight, BarChart3, BookOpen, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronDown, ChevronRight,
  CircleDollarSign, CircleUserRound, Clock3, CreditCard, FileText, Gift, Handshake, Heart, Image, LayoutDashboard,
  LockKeyhole, Mail, Megaphone, MessageSquareHeart, PlusCircle, Receipt, Search, Send, Settings, Sparkles, Star,
  Swords, TicketPercent, UserCog, UserPlus, Users, X, Crown, FileCheck2,
} from "lucide-react";

import { useArenaChrome } from "../arena/chrome";
import NewQueriesNotice from "./NewQueriesNotice.jsx";
import { Page, cx } from "../resume/ui";
import "../referral/referral.css";
import "./adminReferrals.css";
import "./adminResume.css";
import "./adminDash.css";

/*
  ADMIN DASHBOARD  (/dashboard)
  Same look as the other admin consoles (Resume Lab, Referrals, Users): light page in light mode, dark in dark.

    1. Products     ONE card each: Memories, Resume Lab, Prep Buddy, Referrals (with quick links into each console)
    2. Essentials   the tools used every day
    3. All tools    everything else, grouped by area, with area chips
  Search (press "/") looks through every tool. Star a tool to pin it; recently opened tools come back at the top.
  No API calls: the page is instant. Employees only see the tools they are allowed to use.
*/

const FAVORITES_KEY = "targettrek_admin_favorites";
const RECENT_KEY = "targettrek_admin_recent";

/* ---------- areas: one colour each (icon chip, chips, section dot) ---------- */
const AREAS = {
  Products: "#0F766E",
  "Books & Products": "#2563EB",
  "Finance & Revenue": "#059669",
  Marketing: "#4F46E5",
  Interviews: "#0D9488",
  "Users & Access": "#475569",
  "Content & Publishing": "#9333EA",
  "Reviews & Support": "#0891B2",
  "Business Operations": "#65A30D",
  Platform: "#52525B",
};
const AREA_ORDER = Object.keys(AREAS).filter((a) => a !== "Products");
const accent = (area) => AREAS[area] || "#0F766E";

/* ---------- 1. products: exactly one card each ---------- */
const PRODUCTS = [
  {
    path: "/admin/memories", name: "Memories", icon: Heart, color: "#DB2777", tag: "Pages · PIN links",
    description: "Birthday, proposal, Christmas and sorry pages: pages, users, orders, codes, templates and pricing.",
    links: [["Overview", "/admin/memories"], ["Pages", "/admin/memories?tab=pages"], ["Orders", "/admin/memories?tab=orders"], ["Tickets", "/admin/memories?tab=tickets"]],
    keywords: "memory memories birthday proposal sorry love page pin codes price gumroad",
  },
  {
    path: "/admin/resume-reviews", name: "Resume Lab", icon: FileCheck2, color: "#0F766E", tag: "AI + human reviews",
    description: "Review resumes and LinkedIn profiles after the AI first look, payments, members, plans and the AI model.",
    links: [["Console", "/admin/resume-reviews"], ["Public page", "/resume-review"], ["Member app", "/resume-review/app"]],
    keywords: "resume linkedin review cv ats ai reviewer packages plans builder",
  },
  {
    path: "/admin/arena", name: "Prep Buddy", icon: Swords, color: "#EA580C", tag: "Mock-interview arena",
    description: "Entry price, members, requests, matches, payments, reports, coupons and deleted accounts.",
    links: [["Overview", "/admin/arena"], ["Members", "/admin/arena?tab=members"], ["Matches", "/admin/arena?tab=matches"], ["Payments", "/admin/arena?tab=payments"]],
    keywords: "prep buddy arena members matches requests price cancellation fee coupons reports accounts",
  },
  {
    path: "/admin/referrals", name: "Referrals", icon: Handshake, color: "#7C3AED", tag: "Chats · jobs · plans",
    description: "Referral chats, members, job board, payments, credits, subscriptions, plans and settings.",
    links: [["Console", "/admin/referrals"], ["Public page", "/referral"], ["Member app", "/referral/app"]],
    keywords: "referral refer chat hiring job board members plans credits subscription",
  },
].map((p) => ({ ...p, area: "Products" }));

/* ---------- 2. essentials ---------- */
const ESSENTIALS = [
  { path: "/admin/books", name: "Books", icon: BookOpen, area: "Books & Products", description: "Listings, prices, covers, files and publishing.", keywords: "books products ebook manage publishing" },
  { path: "/admin/daily-payments", name: "Daily Payments", icon: CreditCard, area: "Finance & Revenue", description: "Every payment for a chosen day.", keywords: "daily payments orders cashfree payu razorpay" },
  { path: "/admin/transactions", name: "All Transactions", icon: Receipt, area: "Finance & Revenue", description: "Every order with filters and actions.", keywords: "transactions payments history refund access mail" },
  { path: "/admin/finance", name: "Finance", icon: CircleDollarSign, area: "Finance & Revenue", description: "Revenue, fees, expenses and profit.", keywords: "finance revenue costs profit expenses" },
  { path: "/admin/users", name: "Users", icon: UserCog, area: "Users & Access", description: "Accounts, roles, devices and access.", keywords: "users employee admin roles accounts" },
  { path: "/admin/partners", name: "Partners", icon: Handshake, area: "Users & Access", description: "What each partner can see: products, revenue, columns.", keywords: "partners partner access permissions revenue dashboard hide" },
  { path: "/admin/website-analytics", name: "Website Analytics", icon: BarChart3, area: "Marketing", description: "Live visitors, traffic and journeys.", keywords: "website traffic visitors live analytics" },
  { path: "/admin/campaigns", name: "Campaign Studio", icon: Megaphone, area: "Marketing", description: "Targeted emails to book buyers.", keywords: "campaign audience buyers coupon template queue" },
  { path: "/admin/mock-interviews", name: "Mock Interviews", icon: Users, area: "Interviews", description: "Requests, sessions and feedback.", keywords: "mock interviews candidates sessions booking" },
];

/* ---------- 3. everything else ---------- */
const TOOLS = [
  { path: "/admin/membership", name: "Book Packs & Matches", icon: Crown, area: "Books & Products", description: "Pack members, matches, book requests and announcements.", keywords: "membership pack pass lifetime matches suggestions" },
  { path: "/admin/book-offers", name: "Book Offers", icon: TicketPercent, area: "Books & Products", description: "Multi-book deals and bundles.", keywords: "bundle offers combo discount placement" },
  { path: "/admin/coupon/dashboard", name: "Coupons", icon: TicketPercent, area: "Books & Products", description: "Create codes and track how they perform.", keywords: "coupon discounts promo codes" },
  { path: "/admin/book/create", name: "Add New Book", icon: PlusCircle, area: "Books & Products", description: "Create a new ebook listing.", keywords: "new book create upload" },
  { path: "/admin/book-offers/payments", name: "Offer Payments", icon: CreditCard, area: "Finance & Revenue", description: "Bundle orders, access links and reminders.", keywords: "offer payments bundle resend access pdf reminder" },
  { path: "/admin/book/analytics", name: "Book Analytics", icon: BarChart3, area: "Finance & Revenue", description: "Sales, purchases and revenue by book.", keywords: "book sales reports analytics" },
  { path: "/admin/dashboard", name: "Sales Dashboard", icon: LayoutDashboard, area: "Finance & Revenue", description: "Orders, statuses and performance.", keywords: "sales dashboard statistics" },
  { path: "/campaign", name: "Quick Email", icon: Send, area: "Marketing", description: "Send one HTML email to a pasted list.", keywords: "email bulk send newsletter" },
  { path: "/admin/affiliate-manage", name: "Affiliates", icon: Handshake, area: "Marketing", description: "Partners, commissions and their sales.", keywords: "referral affiliates creators partners" },
  { path: "/interest", name: "Interested Users", icon: MessageSquareHeart, area: "Marketing", description: "Leads interested in products and services.", keywords: "interested leads prospects" },
  { path: "/admin/interviews", name: "Interview Experiences", icon: BriefcaseBusiness, area: "Interviews", description: "Review, edit and publish experiences.", keywords: "interview experiences content" },
  { path: "/admin/signup", name: "Add a User", icon: UserPlus, area: "Users & Access", description: "Create a team or customer account.", keywords: "signup employee account create" },
  { path: "/profile", name: "My Profile", icon: CircleUserRound, area: "Users & Access", description: "Your account, devices and password.", keywords: "profile account" },
  { path: "/admin/add-blog", name: "Add Blog", icon: PlusCircle, area: "Content & Publishing", description: "Write and publish an article.", keywords: "new blog article write" },
  { path: "/blog-manage", name: "Manage Blogs", icon: FileText, area: "Content & Publishing", description: "Edit, publish or remove posts.", keywords: "blog content publishing" },
  { path: "/admin/add-portfolio", name: "Add Portfolio", icon: PlusCircle, area: "Content & Publishing", description: "Add a project to the portfolio.", keywords: "portfolio create" },
  { path: "/portfolio-manage", name: "Manage Portfolio", icon: Image, area: "Content & Publishing", description: "Edit projects and images.", keywords: "portfolio images projects" },
  { path: "/admin/generate-review-link", name: "Review Links", icon: Gift, area: "Reviews & Support", description: "Create links for customers to review.", keywords: "review link feedback" },
  { path: "/admin/manage-reviews", name: "Manage Reviews", icon: CheckCircle2, area: "Reviews & Support", description: "Approve and edit ratings.", keywords: "reviews ratings testimonials" },
  { path: "/contact-query", name: "Contact Queries", icon: Mail, area: "Reviews & Support", description: "Questions from the contact form.", keywords: "support contact customer mail" },
  { path: "/clients", name: "Clients", icon: BriefcaseBusiness, area: "Business Operations", description: "Client records and relationships.", keywords: "clients customer business" },
  { path: "/admin/mail", name: "Email Provider", icon: Mail, area: "Platform", description: "Mailtrap, Resend or SES, with failover.", keywords: "email provider mailtrap resend ses smtp failover test" },
  { path: "/admin/book-storage", name: "Book Storage", icon: Settings, area: "Platform", description: "S3 or Cloudinary for book files.", keywords: "storage s3 cloudinary pdf migrate" },
];

const DISABLED = [
  { path: "/admin/booking", name: "Bookings", icon: CalendarDays, description: "Legacy bookings. Use Mock Interviews instead." },
  { path: "/admin/slots", name: "Booking Slots", icon: Clock3, description: "Legacy slot management." },
];

const EMPLOYEE_PATHS = new Set([
  "/profile", "/campaign", "/admin/interviews", "/admin/add-blog", "/blog-manage", "/admin/generate-review-link",
  "/admin/manage-reviews", "/contact-query", "/admin/add-portfolio", "/portfolio-manage", "/admin/affiliate-manage",
]);

/* ---------- helpers ---------- */
const readArray = (key) => { try { const v = JSON.parse(localStorage.getItem(key) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; } };
const saveArray = (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage blocked */ } };
const matches = (t, q) => !q || [t.name, t.description, t.area, t.keywords, t.path, t.tag].join(" ").toLowerCase().includes(q);
const greeting = () => { const h = Number(new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(new Date())); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };
const today = () => new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" }).format(new Date());

/* ---------- pieces ---------- */
function Star_({ on, name, onToggle }) {
  return (
    <button type="button" className={cx("adx-star", on && "on")} onClick={onToggle} aria-pressed={on} aria-label={on ? `Unpin ${name}` : `Pin ${name}`} title={on ? "Unpin" : "Pin to top"}>
      <Star size={15} fill={on ? "currentColor" : "none"} />
    </button>
  );
}

function ProductCard({ p, pinned, onPin, onOpen }) {
  const Icon = p.icon;
  return (
    <article className="adx-product" style={{ "--c": p.color }}>
      <Link to={p.path} className="adx-product-main" onClick={() => onOpen(p.path)}>
        <span className="ico" aria-hidden><Icon size={24} /></span>
        <span className="txt">
          <small>{p.tag}</small>
          <b>{p.name}</b>
          <span>{p.description}</span>
        </span>
        <span className="go" aria-hidden><ArrowRight size={18} /></span>
      </Link>
      {p.links.length > 1 && (
        <nav className="adx-quick" aria-label={`${p.name} shortcuts`}>
          {p.links.map(([label, to]) => <Link key={to} to={to} onClick={() => onOpen(p.path)}>{label}</Link>)}
        </nav>
      )}
      <Star_ on={pinned} name={p.name} onToggle={() => onPin(p.path)} />
    </article>
  );
}

function Tile({ t, pinned, onPin, onOpen }) {
  const Icon = t.icon;
  return (
    <div className="adx-tile" style={{ "--c": t.color || accent(t.area) }}>
      <Link to={t.path} onClick={() => onOpen(t.path)} title={t.description}>
        <span className="ico" aria-hidden><Icon size={19} /></span>
        <span className="txt"><b>{t.name}</b><small>{t.description}</small></span>
        <ChevronRight size={16} className="chev" aria-hidden />
      </Link>
      <Star_ on={pinned} name={t.name} onToggle={() => onPin(t.path)} />
    </div>
  );
}

function Section({ title, count, color, action, children }) {
  return (
    <section className="adx-sec">
      <header>
        <span className="dot" style={{ background: color }} aria-hidden />
        <h2>{title}</h2>
        {count != null && <em>{count}</em>}
        <span className="line" aria-hidden />
        {action}
      </header>
      {children}
    </section>
  );
}

/* ---------- page ---------- */
export default function AdminDashboard() {
  useArenaChrome();
  const user = useSelector((s) => s.auth?.user);
  const role = String(user?.role || "").trim().toLowerCase();
  const isAdmin = role === "admin";
  const isEmployee = role === "employee";

  const [query, setQuery] = useState("");
  const [area, setArea] = useState("All");
  const [favorites, setFavorites] = useState(() => readArray(FAVORITES_KEY));
  const [recent, setRecent] = useState(() => readArray(RECENT_KEY));
  const searchRef = useRef(null);

  const allow = useCallback((t) => isAdmin || (isEmployee && EMPLOYEE_PATHS.has(t.path)), [isAdmin, isEmployee]);
  const products = useMemo(() => PRODUCTS.filter(allow), [allow]);
  const essentials = useMemo(() => ESSENTIALS.filter(allow), [allow]);
  const tools = useMemo(() => TOOLS.filter(allow), [allow]);
  const everything = useMemo(() => [...products, ...essentials, ...tools], [products, essentials, tools]);
  const byPath = useMemo(() => new Map(everything.map((t) => [t.path, t])), [everything]);

  const togglePin = useCallback((path) => setFavorites((prev) => { const next = prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]; saveArray(FAVORITES_KEY, next); return next; }), []);
  const trackOpen = useCallback((path) => setRecent((prev) => { const next = [path, ...prev.filter((p) => p !== path)].slice(0, 12); saveArray(RECENT_KEY, next); return next; }), []);

  useEffect(() => {
    const onKey = (e) => {
      const el = document.activeElement;
      const typing = el && (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) || el.isContentEditable);
      if (e.key === "/" && !typing) { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "Escape" && el === searchRef.current) setQuery("");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const q = query.trim().toLowerCase();
  const pinned = favorites.map((p) => byPath.get(p)).filter(Boolean);
  const recents = recent.map((p) => byPath.get(p)).filter(Boolean).slice(0, 6);
  const areas = AREA_ORDER.filter((a) => tools.some((t) => t.area === a));
  const results = q ? everything.filter((t) => matches(t, q)) : [];
  const shownTools = area === "All" ? tools : tools.filter((t) => t.area === area);
  const groups = areas.map((a) => ({ a, items: shownTools.filter((t) => t.area === a) })).filter((g) => g.items.length);
  const isPinned = (path) => favorites.includes(path);
  const tile = (t) => <Tile key={t.path} t={t} pinned={isPinned(t.path)} onPin={togglePin} onOpen={trackOpen} />;

  if (!isAdmin && !isEmployee) {
    return (
      <Page title="Access denied · Target Trek" top={false}>
        <div className="arx rlx adx">
          <div className="adx-wrap adx-denied">
            <span className="ico"><LockKeyhole size={26} /></span>
            <h1>Access denied</h1>
            <p>You need an administrator or employee account to open this page.</p>
            <Link to="/" className="rv-btn rv-btn-primary">Back to home<ArrowRight size={16} /></Link>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title={`${isAdmin ? "Admin" : "Employee"} dashboard · Target Trek`} top={false}>
      {isAdmin && <NewQueriesNotice />}
      <div className="arx rlx adx">
        <div className="adx-wrap">
          {/* ---------- header ---------- */}
          <header className="adx-head">
            <div className="hello">
              <span className="eyebrow">{isAdmin ? "Administrator" : "Employee"} · {today()}</span>
              <h1>{greeting()}{user?.name ? `, ${String(user.name).split(" ")[0]}` : ""}</h1>
              <p>{everything.length} tools across {areas.length + (products.length ? 1 : 0)} areas<span className="adx-hint">. Press <kbd>/</kbd> to search</span>.</p>
            </div>
            <div className="adx-search">
              <Search size={18} aria-hidden />
              <input ref={searchRef} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search every tool…" aria-label="Search dashboard tools" />
              {query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X size={16} /></button> : <kbd aria-hidden>/</kbd>}
            </div>
          </header>

          {q ? (
            /* ---------- search results ---------- */
            <Section title={`Results for “${query.trim()}”`} count={results.length} color="#0F766E">
              {results.length === 0 ? (
                <div className="adx-empty"><b>No tools match</b><span>Try another word, like “payments”, “coupon” or “users”.</span><button type="button" className="rv-btn rv-btn-ghost rv-btn-sm" onClick={() => setQuery("")}>Clear search</button></div>
              ) : <div className="adx-grid">{results.map(tile)}</div>}
            </Section>
          ) : (
            <>
              {/* ---------- recent + pinned ---------- */}
              {(recents.length > 0 || pinned.length > 0) && (
                <div className="adx-strips">
                  {pinned.length > 0 && (
                    <div className="adx-strip"><span><Star size={13} fill="currentColor" />Pinned</span>
                      <div>{pinned.map((t) => <Link key={t.path} to={t.path} onClick={() => trackOpen(t.path)} style={{ "--c": t.color || accent(t.area) }}><t.icon size={14} aria-hidden />{t.name}</Link>)}</div>
                    </div>
                  )}
                  {recents.length > 0 && (
                    <div className="adx-strip"><span><Clock3 size={13} />Recent</span>
                      <div>{recents.map((t) => <Link key={t.path} to={t.path} onClick={() => trackOpen(t.path)} style={{ "--c": t.color || accent(t.area) }}><t.icon size={14} aria-hidden />{t.name}</Link>)}</div>
                    </div>
                  )}
                </div>
              )}

              {/* ---------- 1. products ---------- */}
              {products.length > 0 && (
                <Section title="Products" count={products.length} color={AREAS.Products}>
                  <div className="adx-products">
                    {products.map((p) => <ProductCard key={p.path} p={p} pinned={isPinned(p.path)} onPin={togglePin} onOpen={trackOpen} />)}
                  </div>
                </Section>
              )}

              {/* ---------- 2. essentials ---------- */}
              {essentials.length > 0 && (
                <Section title="Essentials" count={essentials.length} color="#CA8A04">
                  <div className="adx-grid">{essentials.map(tile)}</div>
                </Section>
              )}

              {/* ---------- 3. all tools by area ---------- */}
              <Section title="All tools" count={tools.length} color="#64748B">
                <div className="adx-chips" role="tablist" aria-label="Filter by area">
                  {[["All", tools.length], ...areas.map((a) => [a, tools.filter((t) => t.area === a).length])].map(([a, n]) => (
                    <button key={a} type="button" role="tab" aria-selected={area === a} onClick={() => setArea(a)} style={{ "--c": a === "All" ? "#0F766E" : accent(a) }}>
                      {a !== "All" && <i aria-hidden />}{a}<em>{n}</em>
                    </button>
                  ))}
                </div>
                <div className="adx-groups">
                  {groups.map(({ a, items }) => (
                    <div key={a} className="adx-group">
                      <h3 style={{ "--c": accent(a) }}><i aria-hidden />{a}<em>{items.length}</em></h3>
                      <div className="adx-grid">{items.map(tile)}</div>
                    </div>
                  ))}
                </div>
              </Section>

              {/* ---------- unavailable ---------- */}
              {isAdmin && (
                <details className="adx-off">
                  <summary><ChevronDown size={16} aria-hidden />Unavailable tools<em>{DISABLED.length}</em></summary>
                  <div className="adx-grid">
                    {DISABLED.map((t) => (
                      <div key={t.path} className="adx-tile off" aria-disabled="true">
                        <div><span className="ico" aria-hidden><t.icon size={19} /></span><span className="txt"><b>{t.name}</b><small>{t.description}</small></span></div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </>
          )}
        </div>
      </div>
    </Page>
  );
}
