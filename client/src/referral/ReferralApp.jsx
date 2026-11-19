import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, Briefcase, ChatsCircle, Crown, DotsThreeOutline, House, MagnifyingGlass, Receipt, UserCircle, X } from "@phosphor-icons/react";
import { Helmet } from "react-helmet-async";

import { Btn, Page, cx } from "../resume/ui";
import { RefProvider, useRef_ } from "./RefContext";
import { Ico, Live, ResumeBoost, Sheet, Vip } from "./ui";
import Profile from "./Profile";
import Directory from "./Directory";
import Board from "./Board";
import Inbox from "./Inbox";
import Credits, { PaymentResult } from "./Credits";
import Payments from "./Payments";
import { closeFailNotice, closeWelcome, formatINR, retrySubscription } from "./api";
import toast from "react-hot-toast";
import { errMsg } from "../arena/api";
import { loginUrl } from "../auth/authRedirect";
import "./referral.css";

const B = "/referral/app";
const n0 = (v) => Number(v ?? 0).toLocaleString("en-IN");
const HELP = "supporttargettrek@gmail.com";
const dayFmt = (v) => (v ? new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "");

/* what the member has right now, in a few words (sidebar and the phone "More" sheet) */
function PlanLine({ s }) {
  const a = s?.access || {};
  if (a.unlimited) return <span><b>♾️ Unlimited</b> · till {dayFmt(a.unlimitedUntil)}</span>;
  if (s?.paywall === false) return <span><b>🎉 Chats are free</b> right now</span>;
  return <span><b>💬 {n0(s?.credits?.left)} chat credit{s?.credits?.left === 1 ? "" : "s"}</b></span>;
}

/* "You got free credits" on the first visit. It stays on every page until the member closes it (remembered on the server). */
function WelcomeCredits({ s, refresh }) {
  const [closed, setClosed] = useState("");
  const w = s?.welcomeCredits;
  if (!w || closed === w.id) return null;
  const close = () => { setClosed(w.id); closeWelcome().then(refresh).catch(() => {}); };
  return (
    <div className="rf-welcome" role="status">
      <span className="e" aria-hidden>🎁</span>
      <div>
        <b>Welcome! You got {w.credits} free chat credit{w.credits === 1 ? "" : "s"}.</b>
        <p>Added to your account when you joined{w.at ? ` on ${dayFmt(w.at)}` : ""}. Each credit opens one chat after a referrer says yes.</p>
      </div>
      <Link to={`${B}/find`} className="rv-btn rv-btn-primary rf-welcome-go">Use them</Link>
      <button type="button" className="rf-iconbtn" onClick={close} aria-label="Close this message"><X size={16} weight="bold" aria-hidden /></button>
    </div>
  );
}

/* a subscription renewal failed: say so, offer to pay now, and let the member close it (it returns on the next failure) */
function PaymentIssue({ s, refresh }) {
  const user = useSelector((st) => st.auth?.user);
  const [closed, setClosed] = useState("");
  const [busy, setBusy] = useState(false);
  const p = s?.paymentIssue;
  if (!p || closed === p.id) return null;
  const close = () => { setClosed(p.id); closeFailNotice(p.id).then(refresh).catch(() => {}); };
  const pay = async () => {
    setBusy(true);
    try {
      const r = await retrySubscription(p.id, user);
      if (r.status === "paid") { toast.success(`Paid ✅ ${p.planName} is back on.`); setClosed(p.id); refresh(); }
      else if (r.status === "pending") toast("Your payment is being confirmed. This updates soon.", { icon: "⏳" });
      else if (r.status === "failed") toast.error(r.message || "The payment didn't go through. Nothing was charged.");
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <div className="rf-welcome bad" role="alert">
      <span className="e" aria-hidden>⚠️</span>
      <div>
        <b>Your {p.planName} payment of {formatINR(p.price)} failed.</b>
        <p>{p.reason ? `${p.reason}. ` : ""}{p.nextTry ? `We'll try again on ${dayFmt(p.nextTry)}. ` : ""}Pay now to keep your plan on.</p>
      </div>
      <Btn size="sm" loading={busy} onClick={pay} className="rf-welcome-pay">Pay {formatINR(p.price)}</Btn>
      <button type="button" className="rf-iconbtn" onClick={close} aria-label="Close this message"><X size={16} weight="bold" aria-hidden /></button>
    </div>
  );
}

/* ------------------------------------------------------------ the frame: sidebar on desktop, header + tab bar on phones */
function Shell({ children }) {
  const { summary: s, refresh } = useRef_();
  const user = useSelector((st) => st.auth?.user);
  const loc = useLocation();
  const [more, setMore] = useState(false);
  useEffect(() => setMore(false), [loc.pathname]);
  const c = s?.counts || {};
  const inbox = (c.unseen || 0) + (c.unread || 0) + (c.needUnlock || 0);
  const inChat = /^\/referral\/app\/inbox\/[^/]+/.test(loc.pathname);
  const groups = [
    ["Discover", [[B, House, "Home", true], [`${B}/find`, MagnifyingGlass, "Find referrers"], [`${B}/board`, Briefcase, "Job board"]]],
    ["You", [[`${B}/inbox`, ChatsCircle, "Inbox", false, inbox], [`${B}/profile`, UserCircle, "Profile"]]],
    ["Billing", [[`${B}/plans`, Crown, "Plans"], [`${B}/payments`, Receipt, "Payments"]]],
  ];
  const tabs = [[B, House, "Home", true], [`${B}/find`, MagnifyingGlass, "Find"], [`${B}/board`, Briefcase, "Jobs"], [`${B}/inbox`, ChatsCircle, "Inbox", false, inbox]];
  const moreActive = ["/profile", "/plans", "/credits", "/payments"].some((p) => loc.pathname.startsWith(B + p));
  const brand = (
    <Link to={B} className="rf-brand" aria-label="Referrals home">
      <span className="rf-logo" aria-hidden>🤝</span>
      <div><b>Referrals</b><small>{user?.name ? `Hi, ${String(user.name).split(" ")[0]}` : "by Target Trek"}<Vip show={s?.access?.priority} label="" /></small></div>
    </Link>
  );
  return (
    <div className={cx("rv-shell rf", inChat && "in-chat")}>
      <aside className="rf-side" aria-label="Referrals menu">
        {brand}
        {groups.map(([g, items]) => (
          <nav key={g} className="rf-navgroup" aria-label={g}><span>{g}</span>
            {items.map(([to, Icon, label, end, badge]) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => cx("rf-navlink", (isActive || (to.endsWith("/plans") && loc.pathname.startsWith(`${B}/credits`))) && "active")}>
                <Icon size={19} weight="duotone" aria-hidden /><span>{label}</span>{badge > 0 && <em aria-label={`${badge} waiting`}>{badge > 99 ? "99+" : badge}</em>}
              </NavLink>
            ))}
          </nav>
        ))}
        <div className="rf-sidecard">
          <div className="row"><span className="rf-label">Your plan</span>{s?.access?.priority && <Vip show label="Priority" />}</div>
          <PlanLine s={s} />
          <Link to={`${B}/plans`} className="rl-textlink" style={{ fontWeight: 700 }}>See plans <ArrowRight size={13} weight="bold" aria-hidden /></Link>
        </div>
        <div className="rf-help"><span>Need help? <a href={`mailto:${HELP}`}>{HELP}</a></span><Link to="/referral" style={{ color: "inherit" }}>About Referrals</Link></div>
      </aside>

      <main className="rf-main rv-app-main" id="rf-main">
        <div className="rf-mtop">{brand}<Link to={`${B}/plans`} className="rf-badge brand" style={{ textDecoration: "none" }}><PlanLine s={s} /></Link></div>
        {!inChat && <PaymentIssue s={s} refresh={refresh} />}
        {!inChat && <WelcomeCredits s={s} refresh={refresh} />}
        {children}
      </main>

      <nav className="rf-tabbar" aria-label="Referrals">
        {tabs.map(([to, Icon, label, end, badge]) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => cx("rf-tab", isActive && "active")}>
            {({ isActive }) => (<><Icon size={23} weight={isActive ? "fill" : "regular"} aria-hidden /><span>{label}</span>{badge > 0 && <em aria-label={`${badge} waiting`}>{badge > 9 ? "9+" : badge}</em>}</>)}
          </NavLink>
        ))}
        <button type="button" className={cx("rf-tab", moreActive && "active")} onClick={() => setMore(true)} aria-haspopup="dialog"><DotsThreeOutline size={23} weight={moreActive ? "fill" : "regular"} aria-hidden /><span>More</span></button>
      </nav>

      {more && (
        <Sheet title="More" onClose={() => setMore(false)} compact>
          <div className="rf-menu">
            <Link to={`${B}/profile`}><Ico e="🪪" size="sm" tone="violet" /><div>Profile<small>Where you work, privacy, “I can refer”</small></div></Link>
            <Link to={`${B}/plans`}><Ico e="👑" size="sm" tone="gold" /><div>Plans<small><PlanLine s={s} /></small></div></Link>
            <Link to={`${B}/payments`}><Ico e="🧾" size="sm" tone="sky" /><div>Payments<small>Every payment, receipt and retry</small></div></Link>
            <a href={`mailto:${HELP}`}><Ico e="💌" size="sm" tone="green" /><div>Help<small>{HELP}</small></div></a>
            <Link to="/referral"><Ico e="📖" size="sm" /><div>About Referrals<small>How it works, FAQ</small></div></Link>
          </div>
        </Sheet>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ home */
function Home() {
  const { summary: s, state } = useRef_();
  const user = useSelector((st) => st.auth?.user);
  const first = String(user?.name || "").split(" ")[0];
  const c = s?.counts || {};
  const todo = [
    s && !s.complete && ["🪪", "violet", "Finish your profile", "Add your company and role. It takes a minute.", `${B}/profile`],
    c.unseen > 0 && ["📨", "rose", `${c.unseen} new request${c.unseen === 1 ? "" : "s"} for you`, "Read the details and resume, then accept or decline.", `${B}/inbox?box=received`],
    c.needUnlock > 0 && ["🎉", "green", `${c.needUnlock} referrer${c.needUnlock === 1 ? "" : "s"} said yes`, "Open the chat to talk to them.", `${B}/inbox?box=sent`],
    c.unread > 0 && ["💬", "sky", `${c.unread} unread message${c.unread === 1 ? "" : "s"}`, "Pick up where you left off.", `${B}/inbox`],
  ].filter(Boolean);
  const tiles = [
    ["🔎", "sky", "Find a referrer", "Search any company", `${B}/find`],
    ["💼", "amber", "Job board", "Openings and offers", `${B}/board`],
    ["💬", "green", "Inbox", c.openChats ? `${c.openChats} open chat${c.openChats === 1 ? "" : "s"}` : "Requests and chats", `${B}/inbox`],
    ["👑", "gold", "Plans", s?.access?.unlimited ? "Unlimited is on" : "Unlimited and Priority", `${B}/plans`],
  ];
  const stats = [
    ["📥", "Asked you", n0(c.received), "waiting for you", `${B}/inbox?box=received`],
    ["📤", "You asked", n0(c.sent), "waiting for them", `${B}/inbox?box=sent`],
    ["💬", "Open chats", n0(c.openChats), "live now", `${B}/inbox`],
    ["🎟️", s?.access?.unlimited ? "Plan" : "Credits", s?.access?.unlimited ? "♾️" : n0(s?.credits?.left), s?.access?.unlimited ? "Unlimited" : "chat credits", `${B}/plans`],
  ];
  return (
    <div>
      <section className="rf-hello">
        <div>
          <Live state={state} />
          <h1>{first ? `Hi ${first} 👋` : "Welcome 👋"}<br />Get referred, or refer someone.</h1>
          <p>Ask people who work where you want to work. Or switch on “I can refer” and help someone get an interview.</p>
        </div>
        <div className="rf-btns">
          <Btn as={Link} to={`${B}/find`} size="lg"><MagnifyingGlass size={18} weight="bold" aria-hidden />Find a referrer</Btn>
          <Btn as={Link} to={`${B}/profile`} size="lg" variant="ghost">{s?.profile?.canRefer ? "Edit profile" : "I can refer"}</Btn>
        </div>
      </section>

      {s && !s.enabled && <p className="rf-banner warn" style={{ marginTop: 16 }}><span className="e" aria-hidden>⏸️</span><span>Referrals are paused right now. You can still read your chats.</span></p>}

      {todo.length > 0 && (
        <section className="rf-block" aria-labelledby="todo">
          <div className="rf-bhead"><h2 id="todo" className="rf-h2">Next up</h2></div>
          <div className="rf-todo">{todo.map(([e, tone, t, d, to]) => <Link key={t} to={to}><Ico e={e} tone={tone} /><div><b>{t}</b><span>{d}</span></div><ArrowRight size={18} weight="bold" className="go" aria-hidden /></Link>)}</div>
        </section>
      )}

      <section className="rf-block" aria-labelledby="go">
        <div className="rf-bhead"><h2 id="go" className="rf-h2">Jump in</h2></div>
        <div className="rf-tiles">{tiles.map(([e, tone, t, d, to]) => <Link key={t} to={to} className="rf-tile"><Ico e={e} tone={tone} /><b>{t}</b><span>{d}</span></Link>)}</div>
      </section>

      <section className="rf-block" aria-labelledby="act">
        <div className="rf-bhead"><h2 id="act" className="rf-h2">Your activity</h2></div>
        <div className="rf-stats c4">{stats.map(([e, label, big, small, to]) => <Link key={label} to={to} className="rf-stat"><span><span aria-hidden>{e}</span>{label}</span><b>{s ? big : "–"}</b><small>{small}</small></Link>)}</div>
      </section>

      <section className="rf-block" aria-labelledby="how">
        <div className="rf-bhead"><h2 id="how" className="rf-h2">How it works</h2><Link to="/referral">Learn more <ArrowRight size={14} weight="bold" aria-hidden /></Link></div>
        <div className="rf-grid c2">
          <div className="rf-card rf-path">
            <div className="rf-person"><Ico e="🙋" tone="sky" /><div><b>I want a referral</b><span className="s">Three steps</span></div></div>
            <ol className="rf-steps">
              <li><div><b>Search the company</b><span>See who works there and their role.</span></div></li>
              <li><div><b>Send your request</b><span>Your resume, LinkedIn and the job link.</span></div></li>
              <li><div><b>Chat once they accept</b><span>{s?.paywall === false ? "Chats are free right now." : s?.access?.unlimited ? "Free with your Unlimited plan." : `₹${s?.unlockFee ?? "–"} a chat, or use a credit.`}</span></div></li>
            </ol>
          </div>
          <div className="rf-card rf-path">
            <div className="rf-person"><Ico e="🧑‍💼" tone="violet" /><div><b>I can refer people</b><span className="s">{s?.profile?.canRefer ? "✅ You show up in search" : "Free, always"}</span></div></div>
            <ol className="rf-steps">
              <li><div><b>Add where you work</b><span>Company, role, experience.</span></div></li>
              <li><div><b>Turn on “I can refer”</b><span>Hide your name if you like.</span></div></li>
              <li><div><b>Accept or decline</b><span>Read the resume first. You decide.</span></div></li>
            </ol>
          </div>
        </div>
      </section>

      <div className="rf-block"><ResumeBoost /></div>
    </div>
  );
}

export default function ReferralApp() {
  const token = useSelector((s) => s.auth?.token);
  const location = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [location.pathname]);
  if (!token) {
    return <Navigate to={loginUrl(location)} replace />;
  }
  return (
    <Page title="Referrals | Target Trek" className="rla-page rfa">
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <RefProvider>
        <Shell>
          <Routes>
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="find" element={<Directory />} />
            <Route path="find/:id" element={<Directory />} />
            <Route path="board" element={<Board />} />
            <Route path="board/:id" element={<Board />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="inbox/:id" element={<Inbox />} />
            <Route path="plans" element={<Credits />} />
            {/* the gateway return address (Cashfree) and older links still land on the plans page */}
            <Route path="credits" element={<Credits />} />
            <Route path="payments" element={<Payments />} />
            <Route path="payment-result" element={<PaymentResult />} />
            <Route path="*" element={<Navigate to={B} replace />} />
          </Routes>
        </Shell>
      </RefProvider>
    </Page>
  );
}
