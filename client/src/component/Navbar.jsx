import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight, ArrowUpRight, BarChart3, BookOpen, CalendarCheck2, ChevronDown, Code2, Contact,
  DollarSign, Edit3, FileText, GraduationCap, Heart, LayoutDashboard, LogOut, Mail, Menu, Moon,
  Sparkles, Sun, UserRound, Users, X,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { serverLogout } from "../lib/authSession";
import logo from "../utils/target_Trek_logo_2.jpg";
import "./Navbar.css";

/* =====================================================
   TARGET TREK NAVBAR
   Resume Lab look (pine + teal, yellow highlighter), light / dark, desktop bar,
   two-row mobile header and a slide-in drawer. Styles live in Navbar.css.
===================================================== */

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

const ROUTES = {
  home: "/learn",
  books: "/books",
  interviews: "/interviews",
  mockInterviews: "/mock-interviews",
  resumeReview: "/resume-review",
  memories: "/memories",
  resources: "/resources",
  blogs: "/blogs",
  about: "/about",
  contact: "/contact",
  profile: "/profile",
  dashboard: "/dashboard",
  analytics: "/admin/book/analytics",
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

/* ---------- nav model ---------- */

function buildNavItems(isLearn, active) {
  if (!isLearn) return [{ title: "About", path: ROUTES.about, selected: active("/about") }];
  return [
    { title: "Prep Buddy", path: "/prep-buddy", selected: active("/prep-buddy") },
    { title: "Books", path: ROUTES.books, selected: active("/books") || active("/book") || active("/ebook") },
    { title: "Interviews", path: ROUTES.interviews, selected: active("/interviews") || active("/interview") },
    { title: "Mock Interviews", path: ROUTES.mockInterviews, selected: active(ROUTES.mockInterviews) },
    { title: "Memories", path: ROUTES.memories, selected: active(ROUTES.memories), heart: true },
    { title: "Resources", path: ROUTES.resources, selected: active("/resources") || active("/resource") },
    { title: "Blogs", path: ROUTES.blogs, selected: active("/blogs") || active("/blog") },
    { title: "About Us", path: ROUTES.about, selected: active("/about") },
  ];
}

const initialOf = (user) => user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

/* ---------- small pieces ---------- */

const Brand = memo(function Brand({ isLearn, onNavigate }) {
  return (
    <button type="button" className="tt-brand" aria-label="Target Trek home" onClick={() => onNavigate(isLearn ? "/learn" : "/")}>
      <span className="tt-brand-logo">
        <img src={logo} alt="Target Trek logo" loading="eager" />
      </span>
      <span className="tt-brand-t">
        <span className="tt-brand-name">Target<b>Trek</b></span>
        {isLearn && <span className="tt-brand-tag">Learn</span>}
      </span>
    </button>
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

const ResumeCTA = memo(function ResumeCTA({ active, small = false, onClick }) {
  return (
    <button type="button" className={`tt-btn tt-btn--brand${small ? " tt-btn--sm" : ""}`} data-active={active} onClick={onClick}>
      <FileText size={small ? 16 : 17} />
      <span>Resume Review</span>
      {!small && <ArrowUpRight size={15} />}
    </button>
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
    <div className="tt-menu-wrap" ref={ref}>
      <button type="button" className="tt-avatar tt-avatar--btn" aria-label="Open profile menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {initial}
      </button>
      {open && (
        <div className="tt-menu" role="menu">
          <div className="tt-menu-user">
            <span className="tt-avatar">{initial}</span>
            <div style={{ minWidth: 0 }}>
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

const ServicesMenu = memo(function ServicesMenu({ pathname, onNavigate }) {
  const { open, setOpen, ref } = usePopover();
  const selected = routeMatches(pathname, "/services");
  return (
    <div className="tt-menu-wrap" ref={ref}>
      <button type="button" className="tt-link" data-active={selected} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        Services <ChevronDown size={15} style={{ transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div className="tt-menu tt-menu--left">
          <button type="button" className="tt-menu-item" onClick={() => { setOpen(false); onNavigate("/services"); }}>
            <Contact size={17} /> All Services
          </button>
          <hr />
          {SERVICES.map(({ slug, title, icon: Icon }) => (
            <button key={slug} type="button" className="tt-menu-item" onClick={() => { setOpen(false); onNavigate(`/services/${slug}`); }}>
              <Icon size={17} /> {title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

/* ---------- desktop ---------- */

const DesktopBar = memo(function DesktopBar({ pathname, isLearn, isDark, isAdmin, user, isAuthenticated, onNavigate, onLogout, onToggleTheme }) {
  const active = (p) => routeMatches(pathname, p);
  const items = buildNavItems(isLearn, active);

  return (
    <div className="tt-desk">
      <Brand isLearn={isLearn} onNavigate={onNavigate} />

      <nav className="tt-links" aria-label="Main">
        {items.map((item) => (
          <NavLink key={item.path + item.title} to={item.path} className="tt-link tt-link--n" data-active={item.selected} aria-current={item.selected ? "page" : undefined}>
            {item.heart && <Heart size={14} fill="currentColor" aria-hidden="true" />}
            {item.title}
          </NavLink>
        ))}
        {!isLearn && (
          <>
            <ServicesMenu pathname={pathname} onNavigate={onNavigate} />
            <NavLink to={ROUTES.home} className="tt-link" data-active={false}>Learn</NavLink>
            <NavLink to="/prep-buddy" className="tt-link" data-active={active("/prep-buddy")}>Prep Buddy</NavLink>
          </>
        )}
      </nav>

      <div className="tt-right">
        <NavLink to={ROUTES.contact} className="tt-link" data-active={active("/contact")}>Contact</NavLink>
        {isAdmin && (
          <button type="button" className="tt-link" data-active={active(ROUTES.dashboard)} onClick={() => onNavigate(ROUTES.dashboard)}>
            Dashboard
          </button>
        )}
        <ResumeCTA active={active(ROUTES.resumeReview)} onClick={() => onNavigate(ROUTES.resumeReview)} />
        {isLearn && <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />}
        {isAuthenticated && <ProfileMenu user={user} isAdmin={isAdmin} onNavigate={onNavigate} onLogout={onLogout} />}
      </div>
    </div>
  );
});

/* ---------- mobile header: menu · logo · theme, then a quick-actions row ---------- */

const MobileBar = memo(function MobileBar({ isLearn, isDark, pathname, onOpen, onNavigate, onToggleTheme }) {
  const memActive = routeMatches(pathname, ROUTES.memories);
  const resumeActive = routeMatches(pathname, ROUTES.resumeReview);

  const memories = (
    <button type="button" className="tt-btn tt-btn--memories" data-active={memActive} onClick={() => onNavigate(ROUTES.memories)} aria-label="Memories">
      <Heart size={16} fill="currentColor" aria-hidden="true" />
      <span>Memories</span>
    </button>
  );
  const resume = (
    <button type="button" className="tt-btn tt-btn--brand tt-btn--glow" data-active={resumeActive} onClick={() => onNavigate(ROUTES.resumeReview)}>
      <FileText size={16} />
      <span>Resume Review</span>
    </button>
  );

  return (
    <div className="tt-mob">
      <div className="tt-mob-top">
        <button type="button" className="tt-icon-btn" onClick={onOpen} aria-label="Open navigation menu">
          <Menu size={20} />
        </button>
        <Brand isLearn={isLearn} onNavigate={onNavigate} />
        {isLearn && <div className="tt-mob-top-actions">{memories}{resume}</div>}
        {isLearn ? <ThemeToggle isDark={isDark} onToggle={onToggleTheme} /> : <span aria-hidden="true" />}
      </div>

      {isLearn && <div className="tt-mob-sub">{memories}{resume}</div>}
    </div>
  );
});

/* ---------- mobile drawer ---------- */

function DrawerLink({ to, icon: Icon, active, onClick, children, heart = false, external = false }) {
  return (
    <NavLink to={to} onClick={onClick} className={`tt-dr-link${heart ? " tt-dr-link--heart" : ""}`} data-active={active} aria-current={active ? "page" : undefined}>
      {Icon && <Icon size={18} />}
      <span style={{ flex: 1, minWidth: 0 }}>{children}</span>
      {external && <ArrowUpRight size={15} />}
    </NavLink>
  );
}

const MobileDrawer = memo(function MobileDrawer({ open, pathname, isLearn, isDark, isAdmin, user, isAuthenticated, onClose, onNavigate, onLogout }) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const active = (p) => routeMatches(pathname, p);
  const go = (path) => { onClose(); onNavigate(path); };

  useEffect(() => { if (!open) setServicesOpen(false); }, [open]);

  return (
    <>
      <div className="tt-nav-scrim" data-theme={isDark ? "dark" : "light"} data-open={open} onClick={onClose} aria-hidden="true" />
      <aside className="tt-nav-drawer" data-theme={isDark ? "dark" : "light"} data-open={open} aria-hidden={!open} aria-label="Mobile navigation" role="dialog" aria-modal="true">
        <div className="tt-dr-head">
          <Brand isLearn={isLearn} onNavigate={go} />
          <button type="button" className="tt-icon-btn" onClick={onClose} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>

        <div className="tt-dr-body">
          <div className="tt-dr-label">Quick access</div>
          <button type="button" className="tt-dr-cta" onClick={() => go(ROUTES.resumeReview)}>
            <span className="tt-dr-cta-ic"><FileText size={21} /></span>
            <span>
              <b>Resume Review</b>
              <small>Get more interview calls</small>
            </span>
            <ArrowRight size={17} />
          </button>

          <div className="tt-dr-label">{isLearn ? "Learn" : "Explore"}</div>
          <div className="tt-dr-list">
            {isLearn ? (
              <>
                <DrawerLink to={ROUTES.home} icon={GraduationCap} active={pathname === "/" || pathname === "/learn"} onClick={onClose}>Learn Home</DrawerLink>
                <DrawerLink to="/prep-buddy" icon={Sparkles} active={active("/prep-buddy")} onClick={onClose}>Prep Buddy</DrawerLink>
                <DrawerLink to={ROUTES.books} icon={BookOpen} active={active("/books") || active("/book") || active("/ebook")} onClick={onClose}>Books</DrawerLink>
                <DrawerLink to={ROUTES.interviews} icon={Users} active={active("/interviews") || active("/interview")} onClick={onClose}>Interviews</DrawerLink>
                <DrawerLink to={ROUTES.mockInterviews} icon={CalendarCheck2} active={active(ROUTES.mockInterviews)} onClick={onClose}>Mock Interviews</DrawerLink>
                <DrawerLink to={ROUTES.memories} icon={Heart} heart active={active(ROUTES.memories)} onClick={onClose}>Memories</DrawerLink>
                <DrawerLink to={ROUTES.resources} icon={FileText} active={active("/resources") || active("/resource")} onClick={onClose}>Resources</DrawerLink>
                <DrawerLink to={ROUTES.blogs} icon={Edit3} active={active("/blogs") || active("/blog")} onClick={onClose}>Blogs</DrawerLink>
                <DrawerLink to={ROUTES.about} icon={Contact} active={active("/about")} onClick={onClose}>About Us</DrawerLink>
              </>
            ) : (
              <>
                <DrawerLink to={ROUTES.about} icon={Contact} active={active("/about")} onClick={onClose}>About</DrawerLink>
                <button type="button" className="tt-dr-link" data-active={active("/services")} aria-expanded={servicesOpen} onClick={() => setServicesOpen((v) => !v)}>
                  <Code2 size={18} />
                  <span style={{ flex: 1, textAlign: "left" }}>Services</span>
                  <ChevronDown size={16} style={{ transform: servicesOpen ? "rotate(180deg)" : "none" }} />
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
                <DrawerLink to="/prep-buddy" icon={Sparkles} active={active("/prep-buddy")} onClick={onClose}>Prep Buddy</DrawerLink>
              </>
            )}
          </div>

          <div className="tt-dr-label">More</div>
          <div className="tt-dr-list">
            <DrawerLink to={ROUTES.contact} icon={Mail} active={active("/contact")} onClick={onClose}>Contact</DrawerLink>
            {isAdmin && (
              <>
                <DrawerLink to={ROUTES.dashboard} icon={LayoutDashboard} active={active(ROUTES.dashboard)} onClick={onClose}>Dashboard</DrawerLink>
                <DrawerLink to={ROUTES.analytics} icon={BarChart3} active={active(ROUTES.analytics)} onClick={onClose}>Analytics</DrawerLink>
              </>
            )}
            {isLearn && MAIN_SITE_ENTRY && (
              <button type="button" className="tt-dr-link" onClick={() => go(MAIN_SITE_ENTRY)}>
                <ArrowUpRight size={18} /> Main Website
              </button>
            )}
          </div>
        </div>

        <div className="tt-dr-foot">
          {isAuthenticated ? (
            <div className="tt-dr-user">
              <div className="tt-dr-user-row">
                <span className="tt-avatar">{initialOf(user)}</span>
                <div style={{ minWidth: 0 }}>
                  <div className="tt-menu-name">{user?.name || "User"}</div>
                  <div className="tt-menu-mail">{user?.email}</div>
                </div>
              </div>
              <div className="tt-dr-user-btns">
                <button type="button" className="tt-dr-sbtn" onClick={() => go(ROUTES.profile)}>Profile</button>
                <button type="button" className="tt-dr-sbtn tt-dr-sbtn--bad" onClick={() => { onClose(); onLogout(); }}>
                  <LogOut size={15} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <a className="tt-dr-support" href={`mailto:${SUPPORT_EMAIL}`}>
              <Mail size={17} /> Books &amp; Support
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

  /* drawer: lock scroll, Escape closes */
  useEffect(() => {
    if (!menuOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  /* close the drawer when the screen grows to desktop */
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    const onChange = () => { if (media.matches) setMenuOpen(false); };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <header className="tt-nav" data-theme={isDark ? "dark" : "light"}>
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
          <MobileBar isLearn={isLearn} isDark={isDark} pathname={location.pathname} onOpen={openMenu} onNavigate={goTo} onToggleTheme={toggleTheme} />
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
        onClose={closeMenu}
        onNavigate={goTo}
        onLogout={handleLogout}
      />
    </>
  );
}
