import { Suspense, lazy, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { BookOpen, Compass, CreditCard, Eye, EyeOff, Inbox, MessageCircle, Settings2, UserRound, Wifi, WifiOff } from "lucide-react";

import { ArenaProvider, useArena } from "./ArenaContext";
import { http, errMsg } from "./api";
import { BugReportButton } from "./BugReport";
import { useArenaChrome } from "./chrome";
import { Badge, Spinner, cx } from "./ui";
import { loginUrl } from "../auth/authRedirect";
import "./appShell.css";

const JoinPage = lazy(() => import("./pages/JoinPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const BrowsePage = lazy(() => import("./pages/BrowsePage"));
const RequestsPage = lazy(() => import("./pages/RequestsPage"));
const BuddyPage = lazy(() => import("./pages/BuddyPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const BooksPage = lazy(() => import("./pages/BooksPage"));

/*
  Temporarily hide / show my profile. Hidden = nobody can find or request me,
  and I can't send requests either. Existing partnerships carry on.
  If the team hid the profile, only the team can bring it back.
*/
function VisibilityButton({ profile, toggleEnabled }) {
  const { refresh } = useArena();
  const [busy, setBusy] = useState(false);
  const hidden = profile.hidden === true;
  const byAdmin = hidden && profile.hiddenBy === "admin";

  // The team can switch member hiding off. Members who are hidden can still make themselves visible;
  // everyone else simply doesn't get the button.
  if (!toggleEnabled && !hidden) return null;

  const toggle = async () => {
    if (byAdmin || busy) return;
    setBusy(true);
    try {
      const { data } = await http.put("/visibility", { hidden: !hidden });
      toast.success(data.message, { id: "arena-visibility" });
      await refresh();
    } catch (e) {
      toast.error(errMsg(e), { id: "arena-visibility" });
    } finally {
      setBusy(false);
    }
  };

  const label = byAdmin ? "Hidden by the Target Trek team" : hidden ? "Profile hidden. Click to show it again" : "Hide my profile from the arena for now";
  const Icon = hidden ? EyeOff : Eye;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy || byAdmin}
      title={label}
      aria-label={label}
      aria-pressed={hidden}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
        hidden
          ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dk:border-amber-500/40 dk:bg-amber-500/10 dk:text-amber-200"
          : "border-stone-300 bg-white text-stone-600 hover:border-teal-400 hover:text-teal-800 dk:border-[#2e4641] dk:bg-[#101c1a] dk:text-[#a3b8b2] dk:hover:text-teal-300"
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span>{hidden ? "Hidden" : "Visible"}</span>
    </button>
  );
}

/* Desktop: a sticky row of tabs under the header. */
function TopTabs({ tabs }) {
  return (
    <nav aria-label="Arena sections" className="sticky top-[var(--arena-nav-h,4rem)] z-30 mb-6 hidden border-b border-[#dfe8e5] dk:border-[#1f302c] bg-[#edf3f1]/90 dk:bg-[#0a1312]/90 backdrop-blur lg:block">
      <ul className="flex flex-wrap gap-1">
        {tabs.map(({ to, label, icon: Icon, badge, dot }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                cx(
                  "relative flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
                  isActive ? "border-teal-700 text-teal-800 dk:text-teal-300" : "border-transparent text-stone-500 dk:text-[#93aaa3] hover:text-stone-800 dk:hover:text-[#d9ebe6]"
                )
              }
            >
              <Icon className="h-4 w-4" aria-hidden />
              {label}
              {badge > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white" aria-label={`${badge} new`}>{badge}</span>
              )}
              {dot && <span className="h-2 w-2 rounded-full bg-emerald-500" aria-label="Matched" />}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* Phones and tablets: the same tabs as a bottom bar, like Resume Lab's app. Styles live in appShell.css. */
function BottomTabs({ tabs }) {
  return (
    <nav aria-label="Arena sections" className="arena-tabbar">
      {tabs.map(({ to, label, icon: Icon, badge, dot }) => (
        <NavLink key={to} to={to} className={({ isActive }) => cx("arena-tab", isActive && "is-active")}>
          <span className="arena-tab-ico">
            <Icon className="h-[21px] w-[21px]" strokeWidth={2} aria-hidden />
            {badge > 0 && <b className="arena-tab-badge" aria-label={`${badge} new`}>{badge > 9 ? "9+" : badge}</b>}
            {dot && <i className="arena-tab-dot" aria-label="Matched" />}
          </span>
          <span className="arena-tab-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

/* While the shell is on screen, <html> gets .arena-tabs: it sets --arena-tabbar and pads <body> on small screens. */
function useTabBarSpace() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("arena-tabs");
    return () => root.classList.remove("arena-tabs");
  }, []);
}

function Shell() {
  const { me, loading, error, socketState } = useArena();
  useTabBarSpace();

  if (loading) return <Spinner label="Loading your arena" />;

  if (error && !me) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-stone-700 dk:text-[#cfe0db]">{error}</p>
      </div>
    );
  }

  const status = me?.profile?.status; // undefined | draft | active | matched | suspended
  const matched = status === "matched" || Boolean(me?.match);
  const paid = status === "active" || matched;
  const suspended = status === "suspended";
  const incoming = me?.counts?.incoming ?? 0;

  // Unpaid members only ever see the join flow (details → payment) and settings.
  // The API enforces this too; hiding tabs is just the friendly side of it.
  const packMember = Boolean(me?.pack?.packMember);
  // Pay-first: paid, but hasn't added details (so no profile yet).
  const paidNoDetails = !me?.profile && ["paid", "in_match"].includes(me?.entry?.status);

  const baseTabs = (
    paid
      ? [
          { to: "arena", label: "Arena", icon: Compass, hidden: matched },
          { to: "requests", label: "Requests", icon: Inbox, badge: incoming, hidden: matched },
          { to: "buddy", label: "My buddy", icon: MessageCircle, dot: matched, hidden: !matched },
          { to: "profile", label: "Profile", icon: UserRound },
          { to: "settings", label: "Settings", icon: Settings2 },
        ]
      : suspended
        ? [
            { to: "profile", label: "Profile", icon: UserRound },
            { to: "settings", label: "Settings", icon: Settings2 },
          ]
        : [
            { to: "join", label: me?.profile ? "Payment" : paidNoDetails ? "Your details" : "Get started", icon: CreditCard },
            { to: "settings", label: "Settings", icon: Settings2 },
          ]
  ).filter((t) => !t.hidden);

  // Book-pack members get a "Books" tab (all current books + request a new one), just before Settings.
  const tabs = packMember ? [...baseTabs.slice(0, -1), { to: "books", label: "Books", icon: BookOpen }, ...baseTabs.slice(-1)] : baseTabs;

  const home = matched ? "buddy" : status === "active" ? "arena" : suspended ? "profile" : "join";
  const gate = (element) => (paid && !matched ? element : <Navigate to={`/prep-buddy/app/${home}`} replace />);

  return (
    <div className="arena-shell min-h-screen-safe bg-[#edf3f1] dk:bg-[#0a1312] pt-[calc(var(--arena-nav-h,5rem)+0.5rem)]">
      <Helmet>
        <title>My arena – Prep Buddy | Target Trek</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mx-auto max-w-6xl px-3 pb-10 sm:px-6 lg:pb-24">
        <header className="flex flex-col gap-3 pb-4 pt-4 sm:pt-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700 dk:text-teal-400 sm:text-xs">Prep Buddy Arena</p>
              <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-[#0c1a17] dk:text-[#e8f2ef] sm:text-2xl">
                Hi {me?.user?.name?.split(" ")[0] ?? "there"} 👋
              </h1>
            </div>
            {/* phones: live status as a small dot beside the greeting */}
            <span
              title={socketState === "open" ? "Live updates on" : "Reconnecting…"}
              className={cx("mt-1 inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:hidden", socketState === "open" ? "border-emerald-200 bg-emerald-50 text-emerald-700 dk:border-emerald-500/30 dk:bg-emerald-500/10 dk:text-emerald-300" : "border-stone-200 bg-white text-stone-500 dk:border-[#2e4641] dk:bg-[#101c1a] dk:text-[#73897f]")}
            >
              <span className={cx("h-1.5 w-1.5 rounded-full", socketState === "open" ? "bg-emerald-500" : "bg-stone-400")} aria-hidden />
              {socketState === "open" ? "Live" : "Offline"}
            </span>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {me?.profile && (
              <Badge tone={me.profile.status === "matched" ? "emerald" : me.profile.status === "active" ? "brand" : me.profile.status === "suspended" ? "rose" : "slate"} className="max-w-full min-w-0">
                <span className="min-w-0 max-w-[16rem] truncate">{me.profile.alias} · {me.profile.status === "draft" ? "payment pending" : me.profile.status}</span>
              </Badge>
            )}
            {paid && me?.profile && <VisibilityButton profile={me.profile} toggleEnabled={me.settings?.visibilityToggleEnabled !== false} />}
            <BugReportButton className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 dk:border-[#2e4641] bg-white dk:bg-[#101c1a] px-3 py-1 text-xs font-semibold text-stone-600 dk:text-[#a3b8b2] hover:border-teal-400 hover:text-teal-800 dk:hover:text-teal-300" />
            <span
              title={socketState === "open" ? "Live updates on" : "Reconnecting…"}
              className={cx("hidden items-center gap-1 text-xs sm:flex", socketState === "open" ? "text-emerald-600 dk:text-emerald-400" : "text-stone-400 dk:text-[#73897f]")}
            >
              {socketState === "open" ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {socketState === "open" ? "Live" : "Offline"}
            </span>
          </div>
        </header>

        <TopTabs tabs={tabs} />

        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route index element={<Navigate to={home} replace />} />
            <Route path="join" element={paid || suspended ? <Navigate to={`/prep-buddy/app/${home}`} replace /> : <JoinPage />} />
            <Route path="arena" element={gate(<BrowsePage />)} />
            <Route path="requests" element={gate(<RequestsPage />)} />
            <Route path="buddy" element={matched ? <BuddyPage /> : <Navigate to={`/prep-buddy/app/${home}`} replace />} />
            <Route path="profile" element={me?.profile && (paid || suspended) ? <ProfilePage /> : <Navigate to={`/prep-buddy/app/${home}`} replace />} />
            <Route path="books" element={packMember ? <BooksPage /> : <Navigate to={`/prep-buddy/app/${home}`} replace />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to={`/prep-buddy/app/${home}`} replace />} />
          </Routes>
        </Suspense>
      </div>

      <BottomTabs tabs={tabs} />
    </div>
  );
}

export default function ArenaApp() {
  useArenaChrome();
  const token = useSelector((s) => s.auth.token);
  const location = useLocation();

  // Only signed-in members may enter. (The API enforces this independently.)
  if (!token) {
    return <Navigate to={loginUrl(location)} replace />;
  }

  return (
    <ArenaProvider>
      <Shell />
    </ArenaProvider>
  );
}
