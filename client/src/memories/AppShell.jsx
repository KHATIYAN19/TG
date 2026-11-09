import { Helmet } from "react-helmet-async";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FolderHeart, LayoutGrid, LifeBuoy, LogOut, Ticket } from "lucide-react";

import { logout } from "../Redux/authSlice";
import { signOutRequest } from "./api";
import { useMemoriesChrome } from "./chrome";
import { LEGAL_LINKS, SUPPORT_EMAIL } from "./legal/constants";
import { Button, FONT_LINKS, Logo, cx } from "./ui";
import "./memories.css";

/* the three places in the app */
const TABS = [
  { to: "/memories/app", end: true, Icon: LayoutGrid, label: "Templates", hint: "Choose a design" },
  { to: "/memories/app/pay", Icon: Ticket, label: "Credits", hint: "Buy or redeem" },
  { to: "/memories/app/pages", Icon: FolderHeart, label: "My pages", hint: "Links, replies, PINs" },
];

/*
  THE FRAME AROUND EVERY SIGNED-IN MEMORIES SCREEN.
    small screens : built like a phone app. A slim top bar and three icons along the bottom.
    large screens : a side panel with the same three places, your credits and help, and a wide area for the content.
  The builder, edit and preview screens are full screens: they hide the navigation and use the whole width.
*/
export default function AppShell({ title, credits, children }) {
  useMemoriesChrome();
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

  const creditPill = credits != null && (
    <Link to="/memories/app/pay" className={cx("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition", credits > 0 ? "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100" : "bg-amber-50 text-amber-800 ring-amber-200 hover:bg-amber-100")} aria-label={`${credits} page credit${credits === 1 ? "" : "s"}. Add another`}>
      <Ticket className="h-3.5 w-3.5" aria-hidden /> {credits} credit{credits === 1 ? "" : "s"}
    </Link>
  );

  return (
    <div className="mem-root min-h-screen bg-gradient-to-br from-[#fff3ee] via-[#fffaf6] to-[#ffeef5]">
      <Helmet>
        <title>{title ? `${title} | Memories by Target Trek` : "Memories by Target Trek"}</title>
        <meta name="robots" content="noindex" />
        <meta name="theme-color" content="#fffaf6" />
        {FONT_LINKS.map((l) => <link key={l.href} {...l} />)}
      </Helmet>

      {/* large screens: the side panel */}
      {!full && (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-rose-100 bg-white/90 px-4 py-5 backdrop-blur-md lg:flex" aria-label="Memories">
          <Logo />
          <nav className="mt-8 space-y-1" aria-label="My Memories">
            {TABS.map(({ to, end, Icon, label, hint }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => cx("flex items-center gap-3 rounded-2xl px-3 py-2.5 transition", isActive ? "bg-gradient-to-r from-rose-50 to-orange-50 text-rose-600 ring-1 ring-rose-100" : "text-[#6b3a5a] hover:bg-rose-50")}>
                {({ isActive }) => (
                  <>
                    <span className={cx("grid h-9 w-9 place-items-center rounded-xl", isActive ? "bg-white text-rose-500 shadow-sm" : "bg-rose-50/70 text-rose-400")}><Icon className="h-[18px] w-[18px]" aria-hidden /></span>
                    <span><span className="block text-sm font-bold leading-tight">{label}</span><span className="block text-[11px] font-medium opacity-70">{hint}</span></span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-3">
            {credits != null && (
              <Link to="/memories/app/pay" className="block rounded-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 p-4 text-white shadow-lg shadow-rose-200/70 transition hover:brightness-105">
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">Page credits</p>
                <p className="mt-0.5 text-3xl font-bold tabular-nums">{credits}</p>
                <p className="text-xs text-white/90">{credits > 0 ? "1 credit = 1 page. Add more" : "Get a credit to create a page"}</p>
              </Link>
            )}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#6b3a5a] hover:bg-rose-50"><LifeBuoy className="h-4 w-4 text-rose-400" aria-hidden /> Help &amp; support</a>
            <div className="flex items-center gap-2 border-t border-rose-100 pt-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rose-100 text-sm font-bold text-rose-600" aria-hidden>{(first[0] || "M").toUpperCase()}</span>
              <p className="min-w-0 flex-1 truncate text-sm font-semibold text-[#3a1530]">{first || "You"}</p>
              <button type="button" onClick={signOut} aria-label="Log out" className="grid h-9 w-9 place-items-center rounded-full text-[#6b3a5a] hover:bg-rose-50"><LogOut className="h-4 w-4" aria-hidden /></button>
            </div>
          </div>
        </aside>
      )}

      <div className={cx(!full && "lg:pl-64")}>
        <header className="sticky top-0 z-40 border-b border-rose-100/80 bg-white/90 backdrop-blur-md">
          <div className={cx("mx-auto flex h-14 items-center gap-3 px-4 sm:px-6", full ? "max-w-6xl" : "max-w-3xl lg:max-w-none lg:px-8")}>
            <div className={cx(!full && "lg:hidden")}><Logo /></div>
            {!full && title && <p className="hidden text-sm font-bold text-[#3a1530] lg:block">{title}</p>}
            <div className="ml-auto flex items-center gap-2">
              {creditPill}
              <Button variant="ghost" size="sm" onClick={signOut} aria-label="Log out" className={cx(!full && "lg:hidden")}><LogOut className="h-4 w-4" aria-hidden /></Button>
            </div>
          </div>
        </header>

        <main className={cx("mx-auto w-full px-4 sm:px-6", full ? "max-w-6xl pb-12" : "max-w-lg pb-28 md:max-w-3xl lg:max-w-6xl lg:px-8 lg:pb-14")}>{children}
          {!full && (
            <p className="mt-10 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-[#a07890]">
              {LEGAL_LINKS.map(([label, to]) => <Link key={to} to={to} className="hover:text-rose-600 hover:underline">{label}</Link>)}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-rose-600 hover:underline">{SUPPORT_EMAIL}</a>
            </p>
          )}
        </main>
      </div>

      {/* small screens: the three icons along the bottom */}
      {!full && (
        <nav aria-label="My Memories (mobile)" className="fixed inset-x-0 bottom-0 z-50 border-t border-rose-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
          <ul className="mx-auto grid max-w-lg grid-cols-3 md:max-w-3xl">
            {TABS.map(({ to, end, Icon, label }) => (
              <li key={to}>
                <NavLink to={to} end={end} className={({ isActive }) => cx("relative flex flex-col items-center gap-0.5 px-2 pb-2 pt-2.5 text-[11px] font-semibold transition", isActive ? "text-rose-600" : "text-[#8a6a80] hover:text-rose-500")}>
                  {({ isActive }) => (
                    <>
                      <span className={cx("grid h-9 w-14 place-items-center rounded-full transition", isActive ? "bg-rose-100" : "")}><Icon className="h-[22px] w-[22px]" strokeWidth={isActive ? 2.4 : 2} aria-hidden /></span>
                      {label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

export const Loading = ({ label = "Loading…" }) => (
  <div className="grid min-h-[50vh] place-items-center text-sm text-[#7a5370]" role="status">
    <span className="flex items-center gap-3"><span className="h-5 w-5 animate-spin rounded-full border-[3px] border-rose-200 border-t-rose-500" /> {label}</span>
  </div>
);
