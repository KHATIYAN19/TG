import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";

import { useArenaChrome } from "../arena/chrome";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  CircleUserRound,
  Clock3,
  CreditCard,
  FileText,
  Gift,
  Grid2X2,
  Handshake,
  Image,
  LayoutDashboard,
  List,
  LockKeyhole,
  Mail,
  MessageSquareHeart,
  PlusCircle,
  Search,
  Send,
  Megaphone,
  Star,
  TicketPercent,
  UserCog,
  UserPlus,
  Users,
  X,
} from "lucide-react";

/* ==========================================================
   CONFIGURATION
========================================================== */

const THEME_STORAGE_KEY = "theme";
const FAVORITES_KEY = "targettrek_admin_favorites";
const RECENT_KEY = "targettrek_admin_recent";

/* ==========================================================
   PRIORITY ROUTES

   These six cards always appear at the top for admins.
========================================================== */

const PRIORITY_ROUTES = [
  {
    path: "/admin/books",
    name: "Books Management",
    icon: BookOpen,
    description:
      "Manage all ebooks, product listings, prices, covers, payment links, publishing settings and availability.",
    category: "Books & Products",
    keywords:
      "books products hld lld java ebook manage publishing",
    featured: true,
    priority: 1,
  },
  {
    path: "/admin/finance",
    name: "Finance Management",
    icon: CircleDollarSign,
    description:
      "Monitor gross revenue, payment gateway fees, expenses, affiliate commissions, profit and financial analytics.",
    category: "Finance & Revenue",
    keywords:
      "finance revenue costs profit expenses income",
    featured: true,
    priority: 2,
  },
  {
    path: "/admin/daily-payments",
    name: "Daily Payments",
    icon: CreditCard,
    description:
      "View all payments for any date, inspect transactions, track successful and failed orders, and manage payment records.",
    category: "Finance & Revenue",
    keywords:
      "daily payments orders transactions cashfree payu razorpay",
    featured: true,
    priority: 3,
  },
  {
    path: "/admin/campaigns",
    name: "Campaign Studio",
    icon: Megaphone,
    description:
      "Targeted marketing: email buyers of specific books (or everyone except them) using templates and coupons. Sent in the background via the email queue, with progress, retries and unsubscribe.",
    category: "Marketing",
    keywords:
      "campaign studio audience segment buyers hld lld coupon template queue sqs dlq unsubscribe",
    featured: true,
    priority: 4,
  },
  {
    path: "/admin/coupon/dashboard",
    name: "Coupon Dashboard",
    icon: TicketPercent,
    description:
      "Create coupon codes, manage discounts, configure promotional offers and monitor coupon performance.",
    category: "Books & Products",
    keywords:
      "coupon discounts offers sales promo codes",
    featured: true,
    priority: 4,
  },
  {
    path: "/admin/mock-interviews",
    name: "Mock Interviews",
    icon: Users,
    description:
      "Manage mock interview requests, candidates, interviewers, scheduled sessions, feedback and interview operations.",
    category: "Interviews",
    keywords:
      "mock interviews candidates engineers booking sessions",
    featured: true,
    priority: 5,
  },
  {
    path: "/admin/mail",
    name: "Email Provider",
    icon: Mail,
    description:
      "Choose whether the site sends email through Mailtrap, Resend or Amazon SES, switch instantly, enable automatic failover and send a test email.",
    category: "Platform",
    keywords:
      "email mail provider mailtrap resend smtp limit failover test",
    featured: true,
    priority: 6,
  },
  {
    path: "/admin/arena",
    name: "Prep Buddy Arena",
    icon: Users,
    description:
      "Set the arena entry price and cancellation fee, manage members, requests, matches, reports, coupons and payments.",
    category: "Prep Buddy",
    keywords:
      "prep buddy arena members matches requests price cancellation fee coupons reports suspend",
    featured: true,
    priority: 5,
  },
  {
    path: "/admin/arena?tab=accounts",
    name: "Arena Accounts",
    icon: UserCog,
    description:
      "See every deleted account and every sign-up that never created a profile, and clean them up.",
    category: "Prep Buddy",
    keywords:
      "deleted accounts signed up no profile incomplete signups cleanup users",
    featured: false,
    priority: 5,
  },
  {
    path: "/campaign",
    name: "Quick Email Send",
    icon: Send,
    description:
      "One-off sender: paste a list of addresses and send a single HTML email right now. No audience filters or queue. For marketing use Campaign Studio.",
    category: "Marketing",
    keywords:
      "email campaigns marketing newsletters bulk promotions",
    featured: true,
    priority: 6,
  },
];

/* ==========================================================
   OTHER ADMIN ROUTES
========================================================== */

const OTHER_ADMIN_ROUTES = [
  {
    path: "/admin/website-analytics",
    name: "Website Analytics",
    icon: BarChart3,
    description:
      "Live visitors, traffic graphs, routes, referral codes, devices, events and visitor journeys.",
    category: "Marketing",
    keywords: "website traffic visitors live users analytics referral ref",
  },
  {
    path: "/admin/book/analytics",
    name: "Book Analytics",
    icon: BarChart3,
    description:
      "Analyze book sales, purchases, revenue, payment performance and product growth.",
    category: "Finance & Revenue",
    keywords: "book sales reports analytics",
  },
  {
    path: "/admin/dashboard",
    name: "Sales Dashboard",
    icon: LayoutDashboard,
    description:
      "Review overall sales, orders, payment statuses and business performance.",
    category: "Finance & Revenue",
    keywords: "sales dashboard payments statistics",
  },
  {
    path: "/admin/book/create",
    name: "Add New Book",
    icon: PlusCircle,
    description:
      "Create a new ebook listing with pricing, cover, resource details and publishing settings.",
    category: "Books & Products",
    keywords: "new book create upload",
  },
  {
    path: "/admin/interviews",
    name: "Interview Experiences",
    icon: BriefcaseBusiness,
    description:
      "Review, edit, publish and manage technical interview experiences.",
    category: "Content & Publishing",
    keywords: "interview experiences content",
  },
  {
    path: "/admin/add-blog",
    name: "Add Blog",
    icon: PlusCircle,
    description:
      "Write and publish technical articles, learning resources and interview posts.",
    category: "Content & Publishing",
    keywords: "new blog article write",
  },
  {
    path: "/blog-manage",
    name: "Manage Blogs",
    icon: FileText,
    description:
      "Edit, organize, publish or remove existing blog posts and articles.",
    category: "Content & Publishing",
    keywords: "blog content publishing",
  },
  {
    path: "/admin/affiliate-manage",
    name: "Affiliate Management",
    icon: Handshake,
    description:
      "Manage referral partners, affiliate relationships, commissions and affiliate sales.",
    category: "Marketing",
    keywords: "referral affiliates creators partners",
  },
  {
    path: "/interest",
    name: "Interested Users",
    icon: MessageSquareHeart,
    description:
      "Review leads and users interested in products, interviews and services.",
    category: "Marketing",
    keywords: "interested leads prospects",
  },
  {
    path: "/admin/users",
    name: "User Management",
    icon: UserCog,
    description:
      "Manage registered users, employees, roles, permissions and account access.",
    category: "Users & Access",
    keywords: "users employee admin roles",
  },
  {
    path: "/admin/signup",
    name: "Add a User",
    icon: UserPlus,
    description:
      "Create authorized accounts for administrators, employees and internal team members.",
    category: "Users & Access",
    keywords: "signup employee account",
  },
  {
    path: "/profile",
    name: "My Profile",
    icon: CircleUserRound,
    description:
      "Manage your account information and personal profile details.",
    category: "Users & Access",
    keywords: "profile account",
  },
  {
    path: "/admin/generate-review-link",
    name: "Generate Review Link",
    icon: Gift,
    description:
      "Create review submission links for customers and book purchasers.",
    category: "Reviews & Support",
    keywords: "review link feedback",
  },
  {
    path: "/admin/manage-reviews",
    name: "Manage Reviews",
    icon: CheckCircle2,
    description:
      "Review, approve, edit and manage ratings, testimonials and customer feedback.",
    category: "Reviews & Support",
    keywords: "reviews ratings testimonials",
  },
  {
    path: "/contact-query",
    name: "Contact Queries",
    icon: Mail,
    description:
      "Review customer questions, contact submissions and support inquiries.",
    category: "Reviews & Support",
    keywords: "support contact customer mail",
  },
  {
    path: "/admin/add-portfolio",
    name: "Add Portfolio",
    icon: PlusCircle,
    description:
      "Create portfolio entries for projects and professional achievements.",
    category: "Content & Publishing",
    keywords: "portfolio create",
  },
  {
    path: "/portfolio-manage",
    name: "Manage Portfolio",
    icon: Image,
    description:
      "Edit existing portfolio projects, images and other portfolio assets.",
    category: "Content & Publishing",
    keywords: "portfolio images projects",
  },
  {
    path: "/clients",
    name: "Clients",
    icon: BriefcaseBusiness,
    description:
      "Manage onboarded clients, customer records and business relationships.",
    category: "Business Operations",
    keywords: "clients customer business",
  },
];

/* ==========================================================
   DISABLED FEATURES

   Moved to bottom.
   No navigation is allowed.
========================================================== */

const DISABLED_ROUTES = [
  {
    path: "/admin/booking",
    name: "Bookings",
    icon: CalendarDays,
    description:
      "Legacy booking administration is currently disabled. Use Mock Interviews for interview-related operations.",
    category: "Disabled Features",
    disabled: true,
  },
  {
    path: "/admin/slots",
    name: "Booking Slots",
    icon: Clock3,
    description:
      "Legacy booking-slot management is currently disabled. This section is unavailable.",
    category: "Disabled Features",
    disabled: true,
  },
];

/* ==========================================================
   PERMISSIONS
========================================================== */

const employeeAllowedPaths = new Set([
  "/profile",
  "/campaign",
  "/admin/interviews",
  "/admin/add-blog",
  "/blog-manage",
  "/admin/generate-review-link",
  "/admin/manage-reviews",
  "/contact-query",
  "/admin/add-portfolio",
  "/portfolio-manage",
  "/admin/affiliate-manage",
]);

const ADMIN_ROUTES = [
  ...PRIORITY_ROUTES,
  ...OTHER_ADMIN_ROUTES,
];

const EMPLOYEE_ROUTES = ADMIN_ROUTES.filter((route) =>
  employeeAllowedPaths.has(route.path)
);

const CATEGORY_ORDER = [
  "Books & Products",
  "Finance & Revenue",
  "Interviews",
  "Prep Buddy",
  "Marketing",
  "Users & Access",
  "Content & Publishing",
  "Reviews & Support",
  "Business Operations",
  "Platform",
];

/* ==========================================================
   STORAGE HELPERS
========================================================== */

const readTheme = () => {
  if (typeof window === "undefined") return "light";

  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);

    if (value === "dark" || value === "light") {
      return value;
    }
  } catch {
    // Use root document theme as fallback.
  }

  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
};

const readArray = (key) => {
  if (typeof window === "undefined") return [];

  try {
    const value = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const saveArray = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Dashboard still works if storage is blocked.
  }
};

/* ==========================================================
   THEME SYNCHRONIZATION

   Navbar controls localStorage["theme"].
   This component never changes the theme itself.
========================================================== */

function useSyncedTheme() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const synchronize = () => {
      const next = readTheme();

      setTheme((previous) =>
        previous === next ? previous : next
      );
    };

    synchronize();

    const events = [
      "storage",
      "themeChange",
      "theme-change",
      "theme-changed",
      "THEME_EVENT",
      "focus",
    ];

    events.forEach((eventName) => {
      window.addEventListener(eventName, synchronize);
    });

    const observer = new MutationObserver(synchronize);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const handleVisibility = () => {
      if (!document.hidden) synchronize();
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    // Covers navbar implementations that only change
    // localStorage without dispatching an event.
    const interval = window.setInterval(synchronize, 500);

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, synchronize);
      });

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return {
    theme,
    isDark: theme === "dark",
  };
}

/* ==========================================================
   LOCAL THEME COLORS
========================================================== */

const getColors = (isDark) => ({
  page: isDark ? "#111111" : "#F6F5F2",
  panel: isDark ? "#191919" : "#FFFFFF",
  border: isDark ? "#303030" : "#E7E5E0",
  text: isDark ? "#F5F5F5" : "#1B1B1B",
  muted: isDark ? "#A1A1AA" : "#71717A",
  input: isDark ? "#212121" : "#FAFAF8",
  inputBorder: isDark ? "#393939" : "#E1DFDA",
  subtle: isDark ? "#252525" : "#F7F6F3",
  divider: isDark ? "#343434" : "#EAE8E4",

  orange: "#F28C38",
  orangeDark: "#E9812B",
  orangeSoft: isDark ? "#382719" : "#FFF2E5",
  orangeText: isDark ? "#FFAE67" : "#AD641F",

  green: isDark ? "#68C9A0" : "#26865E",
  greenSoft: isDark ? "#18362B" : "#EAF7F0",

  red: isDark ? "#F28A7D" : "#D45545",
  redSoft: isDark ? "#382221" : "#FFF1EF",
});

const cx = (...items) =>
  items.filter(Boolean).join(" ");

/* ==========================================================
   COMPACT DASHBOARD UI

   One short tile per tool (icon, name, one-line summary), grouped
   by area, with search, category chips, favourites and recents.
   Priority tools come first in an "Essentials" group.
========================================================== */

const GRID =
  "grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4";

const LAYOUT_KEY = "targettrek_admin_layout";

function Tile({
  route,
  colors,
  isFavorite,
  onFavorite,
  onOpen,
  list = false,
  accent = false,
}) {
  const Icon = route.icon;

  return (
    <div className="group relative min-w-0">
      <Link
        to={route.path}
        onClick={() => onOpen(route.path)}
        title={route.description}
        className={cx(
          "flex items-center gap-3 rounded-xl border pr-10 transition-colors",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          "hover:border-[var(--tile-hover)]",
          list ? "px-3 py-2" : "px-3 py-3"
        )}
        style={{
          backgroundColor: colors.panel,
          borderColor: accent ? colors.orange : colors.border,
          outlineColor: colors.orange,
          "--tile-hover": colors.orange,
        }}
      >
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
          style={{
            backgroundColor: colors.orangeSoft,
            color: colors.orangeText,
          }}
          aria-hidden="true"
        >
          <Icon size={19} />
        </span>

        <span className="min-w-0 flex-1">
          <span
            className="block truncate text-[14px] font-bold leading-5"
            style={{ color: colors.text }}
          >
            {route.name}
          </span>

          {!list && (
            <span
              className="mt-0.5 line-clamp-2 text-[12px] leading-[17px]"
              style={{ color: colors.muted }}
            >
              {route.description}
            </span>
          )}
        </span>
      </Link>

      <button
        type="button"
        onClick={() => onFavorite(route.path)}
        aria-label={
          isFavorite
            ? `Remove ${route.name} from favourites`
            : `Add ${route.name} to favourites`
        }
        aria-pressed={isFavorite}
        className={cx(
          "absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg transition-opacity",
          "focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2",
          isFavorite
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-60"
        )}
        style={{
          color: isFavorite ? colors.orangeDark : colors.muted,
          outlineColor: colors.orange,
        }}
      >
        <Star
          size={15}
          fill={isFavorite ? "currentColor" : "none"}
        />
      </button>
    </div>
  );
}

function DisabledTile({ route, colors }) {
  const Icon = route.icon;

  return (
    <div
      className="flex items-center gap-3 rounded-xl border border-dashed px-3 py-3 opacity-70"
      style={{ borderColor: colors.border }}
      aria-disabled="true"
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
        style={{
          backgroundColor: colors.subtle,
          color: colors.muted,
        }}
        aria-hidden="true"
      >
        <Icon size={19} />
      </span>

      <span className="min-w-0">
        <span
          className="block truncate text-[14px] font-bold"
          style={{ color: colors.muted }}
        >
          {route.name}
        </span>
        <span
          className="line-clamp-2 text-[12px] leading-[17px]"
          style={{ color: colors.muted }}
        >
          {route.description}
        </span>
      </span>
    </div>
  );
}

function Section({ title, count, colors, children }) {
  return (
    <section className="mt-6">
      <div className="mb-2.5 flex items-center gap-3">
        <h2
          className="text-[11px] font-extrabold uppercase tracking-[0.14em]"
          style={{ color: colors.muted }}
        >
          {title}
        </h2>

        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{
            backgroundColor: colors.orangeSoft,
            color: colors.orangeText,
          }}
        >
          {count}
        </span>

        <span
          className="h-px flex-1"
          style={{ backgroundColor: colors.divider }}
        />
      </div>

      {children}
    </section>
  );
}

const matchesQuery = (route, query) =>
  !query ||
  [
    route.name,
    route.description,
    route.category,
    route.keywords,
    route.path,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);

export default function AdminDashboard() {
  useArenaChrome();

  const user = useSelector((state) => state.auth?.user);
  const { isDark } = useSyncedTheme();

  const colors = useMemo(
    () => getColors(isDark),
    [isDark]
  );

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [quick, setQuick] = useState("all"); // all | favorites | recent
  const [list, setList] = useState(() => {
    try {
      return localStorage.getItem(LAYOUT_KEY) === "list";
    } catch {
      return false;
    }
  });

  const [favorites, setFavorites] = useState(() =>
    readArray(FAVORITES_KEY)
  );
  const [recent, setRecent] = useState(() =>
    readArray(RECENT_KEY)
  );

  const searchRef = useRef(null);

  /* --------------------------------------------------------
     ROLE / PERMISSIONS
  -------------------------------------------------------- */

  const role = String(user?.role || "").trim().toLowerCase();
  const isAdmin = role === "admin";
  const isEmployee = role === "employee";
  const authorized = isAdmin || isEmployee;

  const routes = useMemo(() => {
    if (isAdmin) return ADMIN_ROUTES;
    if (isEmployee) return EMPLOYEE_ROUTES;
    return [];
  }, [isAdmin, isEmployee]);

  const paths = useMemo(
    () => new Set(routes.map((r) => r.path)),
    [routes]
  );

  const priority = useMemo(
    () => PRIORITY_ROUTES.filter((r) => paths.has(r.path)),
    [paths]
  );

  const others = useMemo(
    () => OTHER_ADMIN_ROUTES.filter((r) => paths.has(r.path)),
    [paths]
  );

  const validFavorites = useMemo(
    () => favorites.filter((p) => paths.has(p)),
    [favorites, paths]
  );

  const validRecent = useMemo(
    () => recent.filter((p) => paths.has(p)),
    [recent, paths]
  );

  const categories = useMemo(
    () =>
      CATEGORY_ORDER.filter((name) =>
        routes.some((r) => r.category === name)
      ),
    [routes]
  );

  const byPath = useMemo(
    () => new Map(routes.map((r) => [r.path, r])),
    [routes]
  );

  /* --------------------------------------------------------
     ACTIONS
  -------------------------------------------------------- */

  const toggleFavorite = useCallback((path) => {
    setFavorites((previous) => {
      const next = previous.includes(path)
        ? previous.filter((item) => item !== path)
        : [...previous, path];

      saveArray(FAVORITES_KEY, next);
      return next;
    });
  }, []);

  const trackOpen = useCallback((path) => {
    setRecent((previous) => {
      const next = [
        path,
        ...previous.filter((item) => item !== path),
      ].slice(0, 12);

      saveArray(RECENT_KEY, next);
      return next;
    });
  }, []);

  const chooseLayout = (asList) => {
    setList(asList);
    try {
      localStorage.setItem(LAYOUT_KEY, asList ? "list" : "grid");
    } catch {
      // Layout choice is a convenience only.
    }
  };

  // "/" jumps to the search box (unless you're already typing).
  useEffect(() => {
    const onKey = (event) => {
      const el = document.activeElement;
      const typing =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable);

      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* --------------------------------------------------------
     WHAT TO SHOW
  -------------------------------------------------------- */

  const q = query.trim().toLowerCase();
  const browsing = !q && category === "All" && quick === "all";

  const results = useMemo(
    () =>
      [...priority, ...others].filter((route) => {
        if (!matchesQuery(route, q)) return false;
        if (category !== "All" && route.category !== category)
          return false;
        if (
          quick === "favorites" &&
          !validFavorites.includes(route.path)
        )
          return false;
        if (quick === "recent" && !validRecent.includes(route.path))
          return false;
        return true;
      }),
    [priority, others, q, category, quick, validFavorites, validRecent]
  );

  const grouped = useMemo(() => {
    const source = browsing ? others : results;

    return categories
      .map((name) => ({
        name,
        items: source.filter((r) => r.category === name),
      }))
      .filter((group) => group.items.length > 0);
  }, [browsing, others, results, categories]);

  const recentRoutes = validRecent
    .map((path) => byPath.get(path))
    .filter(Boolean)
    .slice(0, 6);

  const categoryCount = (name) =>
    routes.filter((r) => r.category === name).length;

  const reset = () => {
    setQuery("");
    setCategory("All");
    setQuick("all");
  };

  const tile = (route, extra = {}) => (
    <Tile
      key={route.path}
      route={route}
      colors={colors}
      isFavorite={validFavorites.includes(route.path)}
      onFavorite={toggleFavorite}
      onOpen={trackOpen}
      list={list}
      {...extra}
    />
  );

  /* ========================================================
     ACCESS DENIED
  ======================================================== */

  if (!authorized) {
    return (
      <>
        <Helmet>
          <title>Access Denied | Target Trek</title>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>

        <main
          className="flex min-h-[75vh] items-center justify-center px-4 pt-[calc(var(--arena-nav-h,5rem)+1rem)]"
          style={{
            backgroundColor: colors.page,
            color: colors.text,
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border p-8 text-center"
            style={{
              backgroundColor: colors.panel,
              borderColor: colors.border,
            }}
          >
            <div
              className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"
              style={{
                backgroundColor: colors.redSoft,
                color: colors.red,
              }}
            >
              <LockKeyhole size={26} />
            </div>

            <h1 className="mt-5 text-2xl font-black">Access Denied</h1>

            <p
              className="mt-3 text-sm leading-6"
              style={{ color: colors.muted }}
            >
              You need an authorized administrator or employee account
              to access this workspace.
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
              style={{
                backgroundColor: colors.orange,
                color: "#1B1B1B",
              }}
            >
              Back to Home
              <ArrowRight size={16} />
            </Link>
          </div>
        </main>
      </>
    );
  }

  /* ========================================================
     MAIN PAGE
  ======================================================== */

  return (
    <>
      <Helmet>
        <title>
          {isAdmin ? "Admin Dashboard" : "Employee Dashboard"}
          {" | Target Trek"}
        </title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <main
        className="min-h-screen pb-16 pt-[calc(var(--arena-nav-h,5rem)+1rem)] transition-colors"
        style={{
          backgroundColor: colors.page,
          color: colors.text,
        }}
      >
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          {/* ---------- title + search ---------- */}
          <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p
                className="text-[11px] font-extrabold uppercase tracking-[0.16em]"
                style={{ color: colors.orangeText }}
              >
                {isAdmin ? "Administrator" : "Employee"}
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-[28px]">
                {isAdmin ? "Admin" : "Employee"}{" "}
                <span style={{ color: colors.orangeDark }}>
                  Dashboard
                </span>
              </h1>

              <p
                className="mt-1 text-[13px]"
                style={{ color: colors.muted }}
              >
                {user?.name ? `Welcome back, ${user.name}. ` : ""}
                {routes.length} tools across {categories.length} areas.
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: colors.muted }}
                aria-hidden="true"
              />

              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools   ( press / )"
                aria-label="Search dashboard tools"
                className="h-11 w-full rounded-xl border pl-10 pr-10 text-sm outline-none transition focus:border-[var(--focus)]"
                style={{
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                  "--focus": colors.orange,
                }}
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg"
                  style={{ color: colors.muted }}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </header>

          {/* ---------- chips + view toggle ---------- */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div
              className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-1 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
              role="tablist"
              aria-label="Filter by area"
            >
              {[
                ["All", routes.length],
                ...categories.map((name) => [name, categoryCount(name)]),
              ].map(([name, count]) => {
                const on = category === name;

                return (
                  <button
                    key={name}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setCategory(name)}
                    className="shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
                    style={{
                      borderColor: on ? colors.orange : colors.border,
                      backgroundColor: on ? colors.orange : colors.panel,
                      color: on ? "#1B1B1B" : colors.muted,
                    }}
                  >
                    {name}
                    <span className="ml-1.5 opacity-70">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 sm:ml-auto">
              {[
                ["all", "All"],
                ["favorites", `Favourites ${validFavorites.length}`],
                ["recent", "Recent"],
              ].map(([value, label]) => {
                const on = quick === value;

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setQuick(value)}
                    className="rounded-lg border px-2.5 py-1.5 text-xs font-bold"
                    style={{
                      borderColor: on ? colors.orange : colors.border,
                      backgroundColor: on ? colors.orangeSoft : "transparent",
                      color: on ? colors.orangeText : colors.muted,
                    }}
                  >
                    {label}
                  </button>
                );
              })}

              <span
                className="mx-1 h-5 w-px"
                style={{ backgroundColor: colors.divider }}
                aria-hidden="true"
              />

              {[
                [false, Grid2X2, "Grid view"],
                [true, List, "List view"],
              ].map(([asList, ViewIcon, label]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => chooseLayout(asList)}
                  aria-label={label}
                  aria-pressed={list === asList}
                  className="grid h-8 w-8 place-items-center rounded-lg border"
                  style={{
                    borderColor: list === asList ? colors.orange : colors.border,
                    backgroundColor:
                      list === asList ? colors.orangeSoft : "transparent",
                    color:
                      list === asList ? colors.orangeText : colors.muted,
                  }}
                >
                  <ViewIcon size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* ---------- recently opened ---------- */}
          {browsing && recentRoutes.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className="text-[11px] font-extrabold uppercase tracking-[0.14em]"
                style={{ color: colors.muted }}
              >
                Jump back in
              </span>

              {recentRoutes.map((route) => (
                <Link
                  key={route.path}
                  to={route.path}
                  onClick={() => trackOpen(route.path)}
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.panel,
                    color: colors.text,
                  }}
                >
                  <route.icon
                    size={13}
                    style={{ color: colors.orangeDark }}
                    aria-hidden="true"
                  />
                  {route.name}
                </Link>
              ))}
            </div>
          )}

          {/* ---------- tools ---------- */}
          {browsing && priority.length > 0 && (
            <Section
              title="Essentials"
              count={priority.length}
              colors={colors}
            >
              <div className={GRID}>
                {priority.map((route) => tile(route, { accent: true }))}
              </div>
            </Section>
          )}

          {grouped.map((group) => (
            <Section
              key={group.name}
              title={group.name}
              count={group.items.length}
              colors={colors}
            >
              <div className={GRID}>
                {group.items.map((route) => tile(route))}
              </div>
            </Section>
          ))}

          {!browsing && results.length === 0 && (
            <div
              className="mt-8 rounded-2xl border border-dashed px-6 py-12 text-center"
              style={{ borderColor: colors.border }}
            >
              <p className="text-base font-bold">No tools match</p>

              <p
                className="mt-1 text-sm"
                style={{ color: colors.muted }}
              >
                Try a different word, or clear the filters.
              </p>

              <button
                type="button"
                onClick={reset}
                className="mt-4 rounded-xl px-4 py-2 text-sm font-bold"
                style={{
                  backgroundColor: colors.orange,
                  color: "#1B1B1B",
                }}
              >
                Clear filters
              </button>
            </div>
          )}

          {/* ---------- unavailable ---------- */}
          {browsing && isAdmin && DISABLED_ROUTES.length > 0 && (
            <Section
              title="Unavailable"
              count={DISABLED_ROUTES.length}
              colors={colors}
            >
              <div className={GRID}>
                {DISABLED_ROUTES.map((route) => (
                  <DisabledTile
                    key={route.path}
                    route={route}
                    colors={colors}
                  />
                ))}
              </div>
            </Section>
          )}
        </div>
      </main>
    </>
  );
}
