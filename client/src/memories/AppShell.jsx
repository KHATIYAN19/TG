import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Cards, Lifebuoy, SignOut, Sparkle, SquaresFour, Ticket } from "@phosphor-icons/react";

import { logout } from "../Redux/authSlice";
import { signOutRequest } from "./api";
import { useMemoriesChrome } from "./chrome";
import { LEGAL_LINKS, SUPPORT_EMAIL } from "./legal/constants";
import { useStickyFix } from "./landingUi";
import { FONT_LINKS, Logo, cx } from "./ui";
import "./memories.css";
import "./landing.css";
import "./app.css";

/* the three places in the app */
const TABS = [
  { to: "/memories/app", end: true, Icon: SquaresFour, label: "Templates", hint: "Choose a design" },
  { to: "/memories/app/pay", Icon: Ticket, label: "Redeem", hint: "Codes and checkout" },
  { to: "/memories/app/pages", Icon: Cards, label: "My pages", hint: "Links, replies, PINs" },
];

/*
  THE FRAME AROUND EVERY SIGNED-IN MEMORIES SCREEN.
    phones and tablets : a floating top bar and three tabs in a floating bar along the bottom.
    large screens      : a side panel with the same three places, your paid pages and help, and a wide area for the content.
  The builder, edit and preview screens are full screens: they hide the navigation and use the whole width.
*/
export default function AppShell({ title, credits, children }) {
  useMemoriesChrome();
  const root = useRef(null);
  useStickyFix(root); // the price bars and summaries inside the app stick to the screen edges
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const token = useSelector((s) => s.auth?.token);
  const user = useSelector((s) => s.auth?.user);
  const full = /\/(create\/|pages\/[^/]+\/(edit|preview))/.test(pathname);
  const first = String(user?.name || "").split(" ")[0];

  const signOut = async () => {
    await signOutRequest(token);
    dispatch(logout());
    navigate("/memories", { replace: true });
  };

  const creditPill = credits > 0 && (
    <Link to="/memories/app" className="ma-chip caption-3 bg-[#ecfdf5] px-3 py-2 text-emerald-700 ring-1 ring-inset ring-emerald-200 transition-transform duration-500 hover:-translate-y-0.5" aria-label={`${credits} page${credits === 1 ? "" : "s"} ready to create`}>
      <Sparkle size={14} weight="fill" className="ma-wiggle" aria-hidden /> {credits} ready
    </Link>
  );

  return (
    <div ref={root} className="mem-root ml-root ma-root min-h-screen">
      <Helmet>
        <title>{title ? `${title} | Memories by Target Trek` : "Memories by Target Trek"}</title>
        <meta name="robots" content="noindex" />
        <meta name="theme-color" content="#fff5f8" />
        {FONT_LINKS.map((l) => <link key={l.href} {...l} />)}
      </Helmet>

      {/* large screens: the side panel */}
      {!full && (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col overflow-y-auto bg-white p-4 ring-1 ring-[#f8d7e0] lg:flex" aria-label="Memories">
          <div className="px-2 py-2"><Logo /></div>
          <nav className="mt-6 space-y-2" aria-label="My Memories">
            {TABS.map(({ to, end, Icon, label, hint }, i) => (
              <NavLink key={to} to={to} end={end} style={{ "--i": i }} className={({ isActive }) => cx("ma-side-link ma-in flex items-center gap-3 rounded-2xl p-2", isActive && "on")}>
                {({ isActive }) => (
                  <>
                    <span className={cx("ma-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl", isActive ? "bg-[#e11d48] text-white" : "bg-[#fff0f4] text-[#e11d48]")}><Icon size={20} weight={isActive ? "fill" : "duotone"} aria-hidden /></span>
                    <span className="min-w-0"><span className="body-4 block">{label}</span><span className="caption-5 block opacity-70">{hint}</span></span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-3 pt-6">
            {credits > 0 && (
              <Link to="/memories/app" className="ma-lift relative block overflow-hidden rounded-3xl bg-[#e11d48] p-4 text-white">
                <Sparkle size={64} weight="fill" className="ma-float absolute -right-3 -top-3 text-[#fb7185]" style={{ "--r": "12deg" }} aria-hidden />
                <p className="caption-3 relative text-rose-100" style={{ letterSpacing: "0.12em" }}>READY TO CREATE</p>
                <p className="relative mt-1 text-4xl font-semibold leading-10 tabular-nums">{credits}</p>
                <p className="caption-4 relative text-rose-100">Paid page{credits === 1 ? "" : "s"}. Pick a template.</p>
              </Link>
            )}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="ma-side-link title-4 flex items-center gap-2 rounded-xl px-3 py-2"><Lifebuoy size={18} weight="duotone" className="text-[#e11d48]" aria-hidden /> Help and support</a>
            <div className="flex items-center gap-2 rounded-2xl bg-[#fff0f4] p-2">
              <span className="body-4 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#be123c]" aria-hidden>{(first[0] || "M").toUpperCase()}</span>
              <p className="body-4 min-w-0 flex-1 truncate text-[#2a1023]">{first || "You"}</p>
              <button type="button" onClick={signOut} aria-label="Log out" title="Log out" className="ma-round"><SignOut size={18} aria-hidden /></button>
            </div>
          </div>
        </aside>
      )}

      <div className={cx("min-w-0", !full && "lg:pl-64")}>
        <header className={cx("sticky top-0 z-40 px-3 pt-3", !full && "lg:hidden")}>
          <div className={cx("ma-bar mx-auto flex items-center gap-2 rounded-full p-2 pl-4", full ? "max-w-6xl" : "max-w-3xl")}>
            <Logo />
            <div className="ml-auto flex items-center gap-2">
              {creditPill}
              <button type="button" onClick={signOut} aria-label="Log out" title="Log out" className="ma-round"><SignOut size={18} aria-hidden /></button>
            </div>
          </div>
        </header>

        <main key={full ? "full" : pathname} className={cx("ml-step mx-auto w-full min-w-0 px-4 sm:px-6", full ? "max-w-6xl pb-12" : "max-w-3xl pb-32 lg:max-w-6xl lg:px-8 lg:pb-16")}>
          {children}
          {!full && (
            <p className="caption-5 mt-12 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[#a07890]">
              {LEGAL_LINKS.map(([label, to]) => <Link key={to} to={to} className="ml-link">{label}</Link>)}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="ml-link break-all">{SUPPORT_EMAIL}</a>
            </p>
          )}
        </main>
      </div>

      {/* phones and tablets: three tabs in a floating bar */}
      {!full && (
        <nav aria-label="My Memories" className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(12px,env(safe-area-inset-bottom))] lg:hidden">
          <ul className="ma-bar mx-auto grid max-w-md grid-cols-3 gap-1 rounded-full p-1">
            {TABS.map(({ to, end, Icon, label }) => (
              <li key={to} className="min-w-0">
                <NavLink to={to} end={end} className={({ isActive }) => cx("ma-tab caption-3 flex flex-col items-center justify-center gap-0.5 rounded-full px-1 py-2 min-[400px]:flex-row min-[400px]:gap-2 min-[400px]:px-2 min-[400px]:py-3", isActive && "on")}>
                  {({ isActive }) => (<><Icon size={20} weight={isActive ? "fill" : "regular"} className="ma-icon shrink-0" aria-hidden /><span className="max-w-full truncate">{label}</span></>)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

/* a loading state shaped like the screen that is coming, instead of a spinner */
export const Loading = ({ label = "Loading…" }) => (
  <div className="py-8" role="status" aria-label={label}>
    <div className="ma-skel h-4 w-24" />
    <div className="ma-skel mt-3 h-10 w-3/4 max-w-md" />
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => <div key={i} className="ma-skel h-40" style={{ animationDelay: `${i * 0.15}s` }} />)}
    </div>
    <span className="sr-only">{label}</span>
  </div>
);
