import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight, BarChart3, BookOpen, CalendarCheck2, Check, ChevronDown, Code2, Contact, DollarSign, Edit3,
  FileText, GraduationCap, Heart, LayoutDashboard, LogOut, Mail, Menu, Moon, Sparkles, Sun, UserRound,
  Users, X,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { serverLogout } from "../lib/authSession";
import logo from "../utils/target_Trek_logo_2.jpg";
import "./Navbar.css";

/* =====================================================
   TARGET TREK NAVBAR  (rebuilt from scratch)

   Same pine + teal + yellow-highlighter look as Resume Lab and Books.
   - >= 1280px : one 76px glass bar. Brand, primary links, a "More" menu, theme switch, Resume Lab button, profile.
   - <  1280px : one 64px bar. Menu button, brand, Resume Lab pill, theme switch. The menu opens a slide-in drawer
                 with a Resume Lab card, quick tiles, the full list, a Light/Dark switch and the account card.
   Heights are unchanged (64px / 76px), so page offsets elsewhere keep working. Root class stays ".tt-nav".
   Real <a> links everywhere (middle-click, crawlable), focus is managed for the drawer, and nothing depends on
   :has() or other very new CSS. Styles live in Navbar.css.
===================================================== */

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const DRAWER_BREAKPOINT = "(min-width: 1280px)";

const ROUTES = {
  home: "/learn",
  books: "/books",
  interviews: "/interviews",
  mockInterviews: "/mock-interviews",
  resumeLab: "/resume-review", // the page keeps its URL; only the name changed
  memories: "/memories",
  resources: "/resources",
  blogs: "/blogs",
  about: "/about",
  contact: "/contact",
  profile: "/profile",
  dashboard: "/dashboard",
  analytics: "/admin/book/analytics",
  prepBuddy: "/prep-buddy",
};

const SERVICES = [
  { slug: "social-media-marketing", title: "Social Media Marketing", icon: Users },
  { slug: "content-marketing", title: "Content Marketing", icon: Edit3 },
  { slug: "affiliate-marketing", title: "Affiliate Marketing", icon: DollarSign },
  { slug: "web-development", title: "Web Development", icon: Code2 },
  { slug: "genai-solutions", title: "GenAI Solutions", icon: Sparkles },
];

/* Keep empty to use the Learn navigation across the whole site. Fill in for a separate Main site. */
const MAIN_EXACT_ROUTES = [];
const MAIN_ROUTE_PREFIXES = [];

const routeMatches = (pathname, prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`);
const isMainRoute = (pathname) =>
  MAIN_EXACT_ROUTES.includes(pathname) || MAIN_ROUTE_PREFIXES.some((p) => routeMatches(pathname, p));
const MAIN_SITE_ENTRY = MAIN_EXACT_ROUTES.includes("/") ? "/" : MAIN_EXACT_ROUTES[0] || MAIN_ROUTE_PREFIXES[0] || null;

/* ---------- theme ---------- */

function readTheme() {
  if (typeof window === "undefined") return "light";
  try {
    return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyThemeToDocument(theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.setAttribute("data-theme", theme);
}

/* ---------- navigation model (one source for desktop + drawer) ---------- */

const initialOf = (user) => user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

function buildModel(active) {
  return {
    primary: [
      { title: "Prep Buddy", path: ROUTES.prepBuddy, icon: Sparkles, selected: active(ROUTES.prepBuddy) },
      { title: "Books", path: ROUTES.books, icon: BookOpen, selected: active("/books") || active("/book") || active("/ebook") },
      { title: "Interviews", path: ROUTES.interviews, icon: Users, selected: active("/interviews") || active("/interview") },
      { title: "Mock Interviews", path: ROUTES.mockInterviews, icon: CalendarCheck2, selected: active(ROUTES.mockInterviews) },
    ],
    memories: { title: "Memories", path: ROUTES.memories, icon: Heart, selected: active(ROUTES.memories) },
    more: [
      { title: "Resources", path: ROUTES.resources, icon: FileText, selected: active("/resources") || active("/resource") },
      { title: "Blogs", path: ROUTES.blogs, icon: Edit3, selected: active("/blogs") || active("/blog") },
      { title: "About Us", path: ROUTES.about, icon: Contact, selected: active(ROUTES.about) },
      { title: "Contact", path: ROUTES.contact, icon: Mail, selected: active(ROUTES.contact) },
    ],
  };
}

/* ---------- small pieces ---------- */

const Brand = memo(function Brand({ isLearn, onClick }) {
  return (
    <Link to={isLearn ? ROUTES.home : "/"} className="tt-brand" aria-label="Target Trek home" onClick={onClick}>
      <span className="tt-brand-logo">
        <img src={logo} alt="" width="40" height="40" loading="eager" decoding="async" />
      </span>
      <span className="tt-brand-t">
        <span className="tt-brand-name">Target<b>Trek</b></span>
        {isLearn && <span className="tt-brand-tag">Learn</span>}
      </span>
    </Link>
  );
});

const ThemeToggle = memo(function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      type="button"
      className="tt-icon-btn"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );
});

/* The Resume Lab button. "compact" is the phone pill: the label shortens on very narrow screens. */
const ResumeLabButton = memo(function ResumeLabButton({ active, compact = false }) {
  return (
    <Link to={ROUTES.resumeLab} className={`tt-lab-btn${compact ? " tt-lab-btn--compact" : ""}`} data-active={active} aria-label="Resume Lab">
      <FileText size={16} aria-hidden="true" />
      <span className="tt-lab-btn-t">
        Resume Lab
      </span>
    </Link>
  );
});

/* closes a popover on outside click / Escape */
function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

const ProfileMenu = memo(function ProfileMenu({ user, isAdmin, onNavigate, onLogout }) {
  const { open, setOpen, ref } = usePopover();
  const go = (path) => { setOpen(false); onNavigate(path); };
  const initial = initialOf(user);

  return (
    <div className="tt-pop" ref={ref}>
      <button type="button" className="tt-avatar tt-avatar--btn" aria-label="Open profile menu" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {initial}
      </button>
      {open && (
        <div className="tt-menu" role="menu">
          <div className="tt-menu-user">
            <span className="tt-avatar">{initial}</span>
            <div className="tt-grow">
              <div className="tt-menu-name">{user?.name || "User"}</div>
              <div className="tt-menu-mail">{user?.email}</div>
            </div>
          </div>
          <button type="button" role="menuitem" className="tt-menu-item" onClick={() => go(ROUTES.profile)}>
            <UserRound size={17} /> My Profile
          </button>
          {isAdmin && (
            <>
              <button type="button" role="menuitem" className="tt-menu-item" onClick={() => go(ROUTES.dashboard)}>
                <LayoutDashboard size={17} /> Dashboard
              </button>
              <button type="button" role="menuitem" className="tt-menu-item" onClick={() => go(ROUTES.analytics)}>
                <BarChart3 size={17} /> Analytics
              </button>
            </>
          )}
          <hr />
          <button type="button" role="menuitem" className="tt-menu-item tt-menu-item--bad" onClick={() => { setOpen(false); onLogout(); }}>
            <LogOut size={17} /> Logout
          </button>
        </div>
      )}
    </div>
  );
});

/* "More" (Resources, Blogs, About, Contact) keeps the desktop bar uncluttered */
const MoreMenu = memo(function MoreMenu({ items, isAdmin, pathname, onNavigate }) {
  const { open, setOpen, ref } = usePopover();
  const selected = items.some((i) => i.selected) || (isAdmin && routeMatches(pathname, ROUTES.dashboard));
  useEffect(() => setOpen(false), [pathname, setOpen]);

  return (
    <div className="tt-pop" ref={ref}>
      <button type="button" className="tt-link" data-active={selected} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        More <ChevronDown size={15} className="tt-chev" data-open={open} aria-hidden="true" />
      </button>
      {open && (
        <div className="tt-menu tt-menu--left" role="menu">
          {items.map(({ title, path, icon: Icon, selected: on }) => (
            <button key={path} type="button" role="menuitem" className="tt-menu-item" data-active={on} onClick={() => { setOpen(false); onNavigate(path); }}>
              <Icon size={17} /> {title}
            </button>
          ))}
          {isAdmin && (
            <>
              <hr />
              <button type="button" role="menuitem" className="tt-menu-item" onClick={() => { setOpen(false); onNavigate(ROUTES.dashboard); }}>
                <LayoutDashboard size={17} /> Dashboard
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
});

const ServicesMenu = memo(function ServicesMenu({ pathname, onNavigate }) {
  const { open, setOpen, ref } = usePopover();
  const selected = routeMatches(pathname, "/services");
  return (
    <div className="tt-pop" ref={ref}>
      <button type="button" className="tt-link" data-active={selected} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        Services <ChevronDown size={15} className="tt-chev" data-open={open} aria-hidden="true" />
      </button>
      {open && (
        <div className="tt-menu tt-menu--left" role="menu">
          <button type="button" role="menuitem" className="tt-menu-item" onClick={() => { setOpen(false); onNavigate("/services"); }}>
            <Contact size={17} /> All Services
          </button>
          <hr />
          {SERVICES.map(({ slug, title, icon: Icon }) => (
            <button key={slug} type="button" role="menuitem" className="tt-menu-item" onClick={() => { setOpen(false); onNavigate(`/services/${slug}`); }}>
              <Icon size={17} /> {title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

/* ---------- desktop bar (>= 1280px) ---------- */

const DesktopBar = memo(function DesktopBar({ pathname, isLearn, isDark, isAdmin, user, isAuthenticated, onNavigate, onLogout, onToggleTheme }) {
  const active = (p) => routeMatches(pathname, p);
  const model = buildModel(active);

  return (
    <div className="tt-desk">
      <Brand isLearn={isLearn} />

      <nav className="tt-links" aria-label="Main">
        {isLearn ? (
          <>
            {model.primary.map((item) => (
              <NavLink key={item.path} to={item.path} className="tt-link" data-active={item.selected} aria-current={item.selected ? "page" : undefined}>
                {item.title}
              </NavLink>
            ))}
            <NavLink to={model.memories.path} className="tt-chip-memories" data-active={model.memories.selected} aria-current={model.memories.selected ? "page" : undefined}>
              <Heart size={14} fill="currentColor" aria-hidden="true" /> Memories
            </NavLink>
            <MoreMenu items={model.more} isAdmin={isAdmin} pathname={pathname} onNavigate={onNavigate} />
          </>
        ) : (
          <>
            <NavLink to={ROUTES.about} className="tt-link" data-active={active(ROUTES.about)}>About</NavLink>
            <ServicesMenu pathname={pathname} onNavigate={onNavigate} />
            <NavLink to={ROUTES.home} className="tt-link" data-active={false}>Learn</NavLink>
            <NavLink to={ROUTES.prepBuddy} className="tt-link" data-active={active(ROUTES.prepBuddy)}>Prep Buddy</NavLink>
            <NavLink to={ROUTES.contact} className="tt-link" data-active={active(ROUTES.contact)}>Contact</NavLink>
          </>
        )}
      </nav>

      <div className="tt-right">
        {isLearn && <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />}
        <ResumeLabButton active={active(ROUTES.resumeLab)} />
        {isAuthenticated && <ProfileMenu user={user} isAdmin={isAdmin} onNavigate={onNavigate} onLogout={onLogout} />}
      </div>
    </div>
  );
});

/* ---------- compact bar (< 1280px): menu · brand · Resume Lab · theme ---------- */

const CompactBar = memo(function CompactBar({ isLearn, isDark, pathname, menuOpen, menuRef, onOpen, onToggleTheme }) {
  return (
    <div className="tt-mob">
      <button type="button" ref={menuRef} className="tt-icon-btn" onClick={onOpen} aria-label="Open navigation menu" aria-haspopup="dialog" aria-expanded={menuOpen}>
        <Menu size={20} />
      </button>
      <Brand isLearn={isLearn} />
      <div className="tt-mob-right">
        <ResumeLabButton compact active={routeMatches(pathname, ROUTES.resumeLab)} />
        {isLearn && <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />}
      </div>
    </div>
  );
});

/* ---------- drawer ---------- */

function DrawerLink({ to, icon: Icon, active, onClick, children, tone }) {
  return (
    <NavLink to={to} onClick={onClick} className={`tt-dr-link${tone ? ` tt-dr-link--${tone}` : ""}`} data-active={active} aria-current={active ? "page" : undefined}>
      {Icon && <Icon size={18} aria-hidden="true" />}
      <span className="tt-grow">{children}</span>
    </NavLink>
  );
}

const Tile = ({ to, icon: Icon, label, active, onClick, tone }) => (
  <NavLink to={to} onClick={onClick} className={`tt-tile${tone ? ` tt-tile--${tone}` : ""}`} data-active={active} aria-current={active ? "page" : undefined}>
    <span className="tt-tile-ic"><Icon size={20} aria-hidden="true" /></span>
    <span className="tt-tile-t">{label}</span>
  </NavLink>
);

const MobileDrawer = memo(function MobileDrawer({ open, pathname, isLearn, isDark, isAdmin, user, isAuthenticated, closeRef, onClose, onNavigate, onLogout, onSetTheme }) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const active = (p) => routeMatches(pathname, p);
  const model = buildModel(active);
  const go = (path) => { onClose(); onNavigate(path); };

  useEffect(() => { if (!open) setServicesOpen(false); }, [open]);

  return (
    <>
      <div className="tt-scrim" data-theme={isDark ? "dark" : "light"} data-open={open} onClick={onClose} aria-hidden="true" />
      <aside className="tt-drawer" data-theme={isDark ? "dark" : "light"} data-open={open} aria-hidden={!open} aria-label="Site navigation" role="dialog" aria-modal="true">
        <div className="tt-dr-head">
          <Brand isLearn={isLearn} onClick={onClose} />
          <button type="button" ref={closeRef} className="tt-icon-btn" onClick={onClose} aria-label="Close navigation menu" tabIndex={open ? 0 : -1}>
            <X size={20} />
          </button>
        </div>

        <div className="tt-dr-body">
          {/* Resume Lab card */}
          <NavLink to={ROUTES.resumeLab} onClick={onClose} className="tt-lab-card" data-active={active(ROUTES.resumeLab)} tabIndex={open ? 0 : -1}>
            <span className="tt-lab-card-eyebrow"><FileText size={14} aria-hidden="true" /> Resume Lab</span>
            <span className="tt-lab-card-title">Get more <mark>interview calls</mark></span>
            <span className="tt-lab-card-sub">AI resume review, ATS check and a rewrite, in minutes.</span>
            <span className="tt-lab-card-go">Open Resume Lab <ArrowRight size={16} aria-hidden="true" /></span>
          </NavLink>

          {isLearn ? (
            <>
              <div className="tt-dr-label">Explore</div>
              <div className="tt-tiles">
                <Tile to={ROUTES.books} icon={BookOpen} label="Books" active={model.primary[1].selected} onClick={onClose} />
                <Tile to={ROUTES.interviews} icon={Users} label="Interviews" active={model.primary[2].selected} onClick={onClose} />
                <Tile to={ROUTES.mockInterviews} icon={CalendarCheck2} label="Mock Interviews" active={model.primary[3].selected} onClick={onClose} />
                <Tile to={ROUTES.memories} icon={Heart} label="Memories" tone="heart" active={model.memories.selected} onClick={onClose} />
              </div>

              <div className="tt-dr-label">More</div>
              <div className="tt-dr-list">
                <DrawerLink to={ROUTES.home} icon={GraduationCap} active={pathname === "/" || pathname === ROUTES.home} onClick={onClose}>Learn Home</DrawerLink>
                <DrawerLink to={ROUTES.prepBuddy} icon={Sparkles} active={model.primary[0].selected} onClick={onClose}>Prep Buddy</DrawerLink>
                {model.more.map((i) => (
                  <DrawerLink key={i.path} to={i.path} icon={i.icon} active={i.selected} onClick={onClose}>{i.title}</DrawerLink>
                ))}
                {isAdmin && (
                  <>
                    <DrawerLink to={ROUTES.dashboard} icon={LayoutDashboard} active={active(ROUTES.dashboard)} onClick={onClose}>Dashboard</DrawerLink>
                    <DrawerLink to={ROUTES.analytics} icon={BarChart3} active={active(ROUTES.analytics)} onClick={onClose}>Analytics</DrawerLink>
                  </>
                )}
                {MAIN_SITE_ENTRY && (
                  <button type="button" className="tt-dr-link" onClick={() => go(MAIN_SITE_ENTRY)}>
                    <ArrowRight size={18} /> <span className="tt-grow">Main Website</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="tt-dr-label">Explore</div>
              <div className="tt-dr-list">
                <DrawerLink to={ROUTES.about} icon={Contact} active={active(ROUTES.about)} onClick={onClose}>About</DrawerLink>
                <button type="button" className="tt-dr-link" data-active={active("/services")} aria-expanded={servicesOpen} onClick={() => setServicesOpen((v) => !v)}>
                  <Code2 size={18} />
                  <span className="tt-grow">Services</span>
                  <ChevronDown size={16} className="tt-chev" data-open={servicesOpen} />
                </button>
                {servicesOpen && (
                  <div className="tt-dr-sub">
                    <DrawerLink to="/services" active={pathname === "/services"} onClick={onClose}>All Services</DrawerLink>
                    {SERVICES.map(({ slug, title, icon }) => (
                      <DrawerLink key={slug} to={`/services/${slug}`} icon={icon} active={active(`/services/${slug}`)} onClick={onClose}>{title}</DrawerLink>
                    ))}
                  </div>
                )}
                <DrawerLink to={ROUTES.home} icon={GraduationCap} active={false} onClick={onClose}>Learn</DrawerLink>
                <DrawerLink to={ROUTES.prepBuddy} icon={Sparkles} active={active(ROUTES.prepBuddy)} onClick={onClose}>Prep Buddy</DrawerLink>
                <DrawerLink to={ROUTES.contact} icon={Mail} active={active(ROUTES.contact)} onClick={onClose}>Contact</DrawerLink>
              </div>
            </>
          )}

          {isLearn && (
            <>
              <div className="tt-dr-label">Appearance</div>
              <div className="tt-seg" role="radiogroup" aria-label="Colour theme">
                <button type="button" role="radio" aria-checked={!isDark} data-on={!isDark} onClick={() => onSetTheme("light")}>
                  <Sun size={16} aria-hidden="true" /> Light {!isDark && <Check size={14} aria-hidden="true" />}
                </button>
                <button type="button" role="radio" aria-checked={isDark} data-on={isDark} onClick={() => onSetTheme("dark")}>
                  <Moon size={16} aria-hidden="true" /> Dark {isDark && <Check size={14} aria-hidden="true" />}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="tt-dr-foot">
          {isAuthenticated ? (
            <div className="tt-dr-user">
              <div className="tt-dr-user-row">
                <span className="tt-avatar">{initialOf(user)}</span>
                <div className="tt-grow">
                  <div className="tt-menu-name">{user?.name || "User"}</div>
                  <div className="tt-menu-mail">{user?.email}</div>
                </div>
              </div>
              <div className="tt-dr-user-btns">
                <button type="button" className="tt-dr-sbtn" onClick={() => go(ROUTES.profile)}>
                  <UserRound size={15} aria-hidden="true" /> Profile
                </button>
                <button type="button" className="tt-dr-sbtn tt-dr-sbtn--bad" onClick={() => { onClose(); onLogout(); }}>
                  <LogOut size={15} aria-hidden="true" /> Logout
                </button>
              </div>
            </div>
          ) : (
            <a className="tt-dr-support" href={`mailto:${SUPPORT_EMAIL}`} tabIndex={open ? 0 : -1}>
              <Mail size={17} aria-hidden="true" />
              <span className="tt-grow">
                <b>Books &amp; Support</b>
                <small>{SUPPORT_EMAIL}</small>
              </span>
            </a>
          )}
        </div>
      </aside>
    </>
  );
});

/* ---------- main ---------- */

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useSelector((state) => state.auth);
  const user = auth?.user;
  const isAuthenticated = Boolean(auth?.isAuthenticated);

  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(readTheme);
  const [scrolled, setScrolled] = useState(false);
  const menuBtnRef = useRef(null);
  const closeBtnRef = useRef(null);

  const isLearn = !isMainRoute(location.pathname);
  const isDark = isLearn && theme === "dark";
  const isAdmin = isAuthenticated && ["admin", "employee"].includes(String(user?.role || "").toLowerCase());

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const goTo = useCallback((path) => { if (path) navigate(path); }, [navigate]);

  const handleLogout = useCallback(async () => {
    // Ends the session on the server too, so the device leaves the active list.
    await serverLogout();
    navigate(isLearn ? "/learn" : "/");
  }, [navigate, isLearn]);

  const changeTheme = useCallback((next) => {
    if (!isLearn || !["light", "dark"].includes(next)) return;
    setTheme(next);
    try { window.localStorage.setItem(THEME_KEY, next); } catch { /* storage blocked */ }
    applyThemeToDocument(next);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme: next } }));
    // compatibility for components listening to "themechange"
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
  }, [isLearn]);

  const toggleTheme = useCallback(() => changeTheme(isDark ? "light" : "dark"), [changeTheme, isDark]);

  /* keep in step with the rest of the app */
  useEffect(() => {
    const onTheme = (event) => {
      if (isMainRoute(window.location.pathname)) {
        setTheme("light");
        applyThemeToDocument("light");
        return;
      }
      const incoming = event?.detail?.theme || readTheme();
      if (incoming === "light" || incoming === "dark") {
        setTheme(incoming);
        applyThemeToDocument(incoming);
      }
    };
    const onStorage = (event) => {
      if (event.key && event.key !== THEME_KEY) return;
      onTheme({ detail: { theme: readTheme() } });
    };
    window.addEventListener(THEME_EVENT, onTheme);
    window.addEventListener("themechange", onTheme);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(THEME_EVENT, onTheme);
      window.removeEventListener("themechange", onTheme);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  /* route change: re-read theme, close drawer */
  useEffect(() => {
    const next = isMainRoute(location.pathname) ? "light" : readTheme();
    setTheme(next);
    applyThemeToDocument(next);
    setMenuOpen(false);
  }, [location.pathname]);

  /* soft shadow once the page scrolls */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* drawer: lock scroll, Escape closes, focus moves in and returns to the menu button */
  useEffect(() => {
    if (!menuOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    const focusTimer = window.setTimeout(() => closeBtnRef.current?.focus(), 60);
    const opener = menuBtnRef.current;
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      opener?.focus?.({ preventScroll: true });
    };
  }, [menuOpen]);

  /* close the drawer when the screen grows to desktop */
  useEffect(() => {
    const media = window.matchMedia(DRAWER_BREAKPOINT);
    const onChange = () => { if (media.matches) setMenuOpen(false); };
    if (media.addEventListener) media.addEventListener("change", onChange);
    else media.addListener(onChange); // older Safari
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", onChange);
      else media.removeListener(onChange);
    };
  }, []);

  return (
    <>
      <header className="tt-nav" data-theme={isDark ? "dark" : "light"} data-scrolled={scrolled}>
        <div className="tt-nav-in">
          <DesktopBar
            pathname={location.pathname}
            isLearn={isLearn}
            isDark={isDark}
            isAdmin={isAdmin}
            user={user}
            isAuthenticated={isAuthenticated}
            onNavigate={goTo}
            onLogout={handleLogout}
            onToggleTheme={toggleTheme}
          />
          <CompactBar
            isLearn={isLearn}
            isDark={isDark}
            pathname={location.pathname}
            menuOpen={menuOpen}
            menuRef={menuBtnRef}
            onOpen={openMenu}
            onToggleTheme={toggleTheme}
          />
        </div>
      </header>

      <MobileDrawer
        open={menuOpen}
        pathname={location.pathname}
        isLearn={isLearn}
        isDark={isDark}
        isAdmin={isAdmin}
        user={user}
        isAuthenticated={isAuthenticated}
        closeRef={closeBtnRef}
        onClose={closeMenu}
        onNavigate={goTo}
        onLogout={handleLogout}
        onSetTheme={changeTheme}
      />
    </>
  );
}
