
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";

import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  CircleUserRound,
  Clock3,
  CreditCard,
  FileText,
  Filter,
  Gift,
  Grid2X2,
  Handshake,
  Heart,
  Image,
  LayoutDashboard,
  List,
  LockKeyhole,
  Mail,
  MessageSquareHeart,
  PlusCircle,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  TicketPercent,
  UserCog,
  UserPlus,
  Users,
  Wallet,
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
    path: "/campaign",
    name: "Email Campaigns",
    icon: Send,
    description:
      "Send book announcements, promotional emails, discount campaigns, customer notifications and product updates.",
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
  "Marketing",
  "Users & Access",
  "Content & Publishing",
  "Reviews & Support",
  "Business Operations",
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
   DASHBOARD CARD
========================================================== */

function DashboardCard({
  route,
  index,
  colors,
  isFavorite,
  onFavorite,
  onOpen,
  layout = "grid",
  prominent = false,
}) {
  const Icon = route.icon;

  const isList = layout === "list";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{
        duration: 0.2,
        delay: Math.min(index * 0.018, 0.15),
      }}
      className="min-w-0"
    >
      <div
        className={cx(
          "group relative h-full overflow-hidden rounded-2xl border",
          "transition-all duration-200 hover:-translate-y-0.5",
          "hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)]",
          isList ? "p-4" : "p-5",
          prominent && "ring-1"
        )}
        style={{
          backgroundColor: colors.panel,
          borderColor: prominent
            ? colors.orangeSoft
            : colors.border,
          "--tw-ring-color": prominent
            ? colors.orangeSoft
            : "transparent",
        }}
      >
        {prominent && (
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{ backgroundColor: colors.orange }}
          />
        )}

        <div
          className={cx(
            "flex h-full gap-4",
            isList ? "items-center" : "flex-col"
          )}
        >
          {/* TOP */}

          <div
            className={cx(
              "flex items-start justify-between gap-3",
              isList && "shrink-0"
            )}
          >
            <Link
              to={route.path}
              onClick={() => onOpen(route.path)}
              aria-label={`Open ${route.name}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
              style={{
                backgroundColor: colors.orangeSoft,
                color: colors.orangeText,
              }}
            >
              <Icon size={21} strokeWidth={1.9} />
            </Link>

            {!isList && (
              <button
                type="button"
                onClick={() => onFavorite(route.path)}
                title={
                  isFavorite
                    ? "Remove favorite"
                    : "Add favorite"
                }
                aria-label={`${
                  isFavorite ? "Remove" : "Add"
                } ${route.name} ${
                  isFavorite ? "from" : "to"
                } favorites`}
                className="rounded-lg p-2 transition-transform hover:scale-110"
                style={{
                  color: isFavorite
                    ? colors.orangeDark
                    : colors.muted,
                }}
              >
                <Star
                  size={17}
                  fill={
                    isFavorite ? colors.orange : "none"
                  }
                />
              </button>
            )}
          </div>

          {/* CONTENT */}

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className="rounded-md px-2.5 py-1 text-[10px] font-bold"
                style={{
                  backgroundColor: colors.subtle,
                  color: colors.muted,
                }}
              >
                {route.category}
              </span>

              {prominent && !isList && (
                <span
                  className="rounded-md px-2 py-1 text-[10px] font-extrabold"
                  style={{
                    backgroundColor: colors.orangeSoft,
                    color: colors.orangeText,
                  }}
                >
                  Priority Tool
                </span>
              )}
            </div>

            <Link
              to={route.path}
              onClick={() => onOpen(route.path)}
              className="block text-[15px] font-extrabold transition-colors hover:text-[#E9812B]"
              style={{ color: colors.text }}
            >
              {route.name}
            </Link>

            <p
              className={cx(
                "mt-2 text-[12px] leading-[1.8]",
                isList && "line-clamp-2"
              )}
              style={{ color: colors.muted }}
            >
              {route.description}
            </p>
          </div>

          {/* BOTTOM */}

          <div
            className={cx(
              "flex items-center justify-between gap-3",
              isList
                ? "shrink-0"
                : "border-t pt-4"
            )}
            style={{ borderColor: colors.divider }}
          >
            {!isList && (
              <span
                className="text-[11px] font-semibold"
                style={{ color: colors.muted }}
              >
                {prominent ? "Quick Access" : "Workspace Tool"}
              </span>
            )}

            {isList && (
              <button
                type="button"
                onClick={() => onFavorite(route.path)}
                title="Toggle favorite"
                className="rounded-lg p-2"
                style={{
                  color: isFavorite
                    ? colors.orangeDark
                    : colors.muted,
                }}
              >
                <Star
                  size={16}
                  fill={
                    isFavorite ? colors.orange : "none"
                  }
                />
              </button>
            )}

            <Link
              to={route.path}
              onClick={() => onOpen(route.path)}
              className="inline-flex items-center gap-1.5 text-xs font-bold"
              style={{ color: colors.orangeDark }}
            >
              Open
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ==========================================================
   DISABLED CARD

   No Link or onClick.
========================================================== */

function DisabledCard({ route, colors }) {
  const Icon = route.icon;

  return (
    <div
      aria-disabled="true"
      className="relative rounded-2xl border p-5 opacity-60"
      style={{
        backgroundColor: colors.panel,
        borderColor: colors.border,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{
            backgroundColor: colors.subtle,
            color: colors.muted,
          }}
        >
          <Icon size={21} />
        </div>

        <span
          className="rounded-lg border px-2.5 py-1 text-[10px] font-extrabold uppercase"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.subtle,
            color: colors.muted,
          }}
        >
          Disabled
        </span>
      </div>

      <h3
        className="mt-5 text-base font-extrabold"
        style={{ color: colors.text }}
      >
        {route.name}
      </h3>

      <p
        className="mt-2 text-xs leading-6"
        style={{ color: colors.muted }}
      >
        {route.description}
      </p>

      <div
        className="mt-5 flex items-center gap-2 border-t pt-4 text-xs font-semibold"
        style={{
          borderColor: colors.divider,
          color: colors.muted,
        }}
      >
        <LockKeyhole size={14} />
        Currently unavailable
      </div>
    </div>
  );
}

/* ==========================================================
   SECTION HEADING
========================================================== */

function SectionHeading({
  eyebrow,
  title,
  description,
  colors,
  count,
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p
            className="text-[10px] font-extrabold uppercase tracking-[0.14em]"
            style={{ color: colors.orangeText }}
          >
            {eyebrow}
          </p>
        )}

        <h2
          className="mt-1 text-xl font-black tracking-tight sm:text-2xl"
          style={{ color: colors.text }}
        >
          {title}
        </h2>

        {description && (
          <p
            className="mt-1 text-xs leading-6 sm:text-sm"
            style={{ color: colors.muted }}
          >
            {description}
          </p>
        )}
      </div>

      {count !== undefined && (
        <span
          className="rounded-full border px-3 py-1.5 text-xs font-bold"
          style={{
            backgroundColor: colors.panel,
            borderColor: colors.border,
            color: colors.muted,
          }}
        >
          {count} tools
        </span>
      )}
    </div>
  );
}

/* ==========================================================
   ADMIN DASHBOARD
========================================================== */

export default function AdminDashboard() {
  const user = useSelector((state) => state.auth?.user);

  const { isDark } = useSyncedTheme();

  const colors = useMemo(
    () => getColors(isDark),
    [isDark]
  );

  /* --------------------------------------------------------
     STATE
  -------------------------------------------------------- */

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [quickFilter, setQuickFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [layout, setLayout] = useState("grid");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [favorites, setFavorites] = useState(() =>
    readArray(FAVORITES_KEY)
  );

  const [recent, setRecent] = useState(() =>
    readArray(RECENT_KEY)
  );

  /* --------------------------------------------------------
     ROLE / PERMISSIONS
  -------------------------------------------------------- */

  const role = String(user?.role || "")
    .trim()
    .toLowerCase();

  const isAdmin = role === "admin";
  const isEmployee = role === "employee";

  const authorized = isAdmin || isEmployee;

  const currentRoutes = useMemo(() => {
    if (isAdmin) return ADMIN_ROUTES;
    if (isEmployee) return EMPLOYEE_ROUTES;
    return [];
  }, [isAdmin, isEmployee]);

  const currentPaths = useMemo(
    () => new Set(currentRoutes.map((route) => route.path)),
    [currentRoutes]
  );

  const currentPriorityRoutes = useMemo(
    () =>
      PRIORITY_ROUTES.filter((route) =>
        currentPaths.has(route.path)
      ),
    [currentPaths]
  );

  const currentOtherRoutes = useMemo(
    () =>
      OTHER_ADMIN_ROUTES.filter((route) =>
        currentPaths.has(route.path)
      ),
    [currentPaths]
  );

  const validFavorites = useMemo(
    () =>
      favorites.filter((path) =>
        currentPaths.has(path)
      ),
    [favorites, currentPaths]
  );

  const validRecent = useMemo(
    () =>
      recent.filter((path) =>
        currentPaths.has(path)
      ),
    [recent, currentPaths]
  );

  const categories = useMemo(
    () =>
      CATEGORY_ORDER.filter((category) =>
        currentRoutes.some(
          (route) => route.category === category
        )
      ),
    [currentRoutes]
  );

  /* --------------------------------------------------------
     FAVORITES
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

  /* --------------------------------------------------------
     RECENTLY OPENED
  -------------------------------------------------------- */

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

  /* --------------------------------------------------------
     FILTER AND SORT OTHER TOOLS

     Priority tools remain separate and always appear at top
     in their predefined order in the normal dashboard view.
  -------------------------------------------------------- */

  const filteredRoutes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let routes = currentOtherRoutes.filter((route) => {
      const matchesSearch =
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

      const matchesCategory =
        selectedCategory === "All" ||
        route.category === selectedCategory;

      let matchesQuick = true;

      if (quickFilter === "favorites") {
        matchesQuick = validFavorites.includes(route.path);
      }

      if (quickFilter === "recent") {
        matchesQuick = validRecent.includes(route.path);
      }

      if (quickFilter === "featured") {
        matchesQuick = Boolean(route.featured);
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesQuick
      );
    });

    if (sortBy === "az") {
      routes = [...routes].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    if (sortBy === "za") {
      routes = [...routes].sort((a, b) =>
        b.name.localeCompare(a.name)
      );
    }

    if (sortBy === "category") {
      routes = [...routes].sort((a, b) =>
        a.category.localeCompare(b.category) ||
        a.name.localeCompare(b.name)
      );
    }

    if (sortBy === "recent") {
      routes = [...routes].sort((a, b) => {
        const aIndex = validRecent.indexOf(a.path);
        const bIndex = validRecent.indexOf(b.path);

        return (
          (aIndex < 0 ? 999 : aIndex) -
          (bIndex < 0 ? 999 : bIndex)
        );
      });
    }

    return routes;
  }, [
    currentOtherRoutes,
    searchQuery,
    selectedCategory,
    quickFilter,
    sortBy,
    validFavorites,
    validRecent,
  ]);

  const visiblePriority = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return currentPriorityRoutes.filter((route) => {
      const searchMatches =
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

      const categoryMatches =
        selectedCategory === "All" ||
        selectedCategory === route.category;

      const quickMatches =
        quickFilter === "all" ||
        (quickFilter === "favorites" &&
          validFavorites.includes(route.path)) ||
        (quickFilter === "recent" &&
          validRecent.includes(route.path)) ||
        (quickFilter === "featured" && route.featured);

      return (
        searchMatches &&
        categoryMatches &&
        quickMatches
      );
    });
  }, [
    currentPriorityRoutes,
    searchQuery,
    selectedCategory,
    quickFilter,
    validFavorites,
    validRecent,
  ]);

  const groupedRoutes = useMemo(
    () =>
      categories
        .map((category) => ({
          category,
          routes: filteredRoutes.filter(
            (route) => route.category === category
          ),
        }))
        .filter((group) => group.routes.length > 0),
    [filteredRoutes, categories]
  );

  const totalVisible =
    visiblePriority.length + filteredRoutes.length;

  const hasFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== "All" ||
    quickFilter !== "all" ||
    sortBy !== "default";

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setQuickFilter("all");
    setSortBy("default");
  };

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
          className="mt-16 flex min-h-[75vh] items-center justify-center px-4"
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
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: colors.redSoft,
                color: colors.red,
              }}
            >
              <LockKeyhole size={26} />
            </div>

            <h1 className="mt-5 text-2xl font-black">
              Access Denied
            </h1>

            <p
              className="mt-3 text-sm leading-6"
              style={{ color: colors.muted }}
            >
              You need an authorized administrator or employee
              account to access this workspace.
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
        className="mt-16 min-h-screen pb-20 pt-6 transition-colors sm:pt-8"
        style={{
          backgroundColor: colors.page,
          color: colors.text,
        }}
      >
        <div className="mx-auto max-w-[1550px] px-3 sm:px-6 lg:px-8">
          {/* ============================================
              HERO
          ============================================ */}

          <section
            className="relative overflow-hidden rounded-3xl border"
            style={{
              backgroundColor: colors.panel,
              borderColor: colors.border,
            }}
          >
            <div
              className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full blur-3xl"
              style={{
                backgroundColor: colors.orangeSoft,
                opacity: 0.7,
              }}
            />

            <div className="relative p-5 sm:p-8 lg:p-9">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider"
                      style={{
                        backgroundColor: colors.orangeSoft,
                        color: colors.orangeText,
                      }}
                    >
                      <ShieldCheck size={13} />
                      {isAdmin ? "Administrator" : "Employee"}
                    </span>

                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold"
                      style={{
                        backgroundColor: colors.subtle,
                        color: colors.muted,
                      }}
                    >
                      <Sparkles size={13} />
                      Target Trek Workspace
                    </span>
                  </div>

                  <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                    {isAdmin ? "Admin" : "Employee"}{" "}
                    <span style={{ color: colors.orangeDark }}>
                      Dashboard
                    </span>
                  </h1>

                  <p
                    className="mt-3 max-w-xl text-sm leading-7"
                    style={{ color: colors.muted }}
                  >
                    Manage your books, finance, payments, coupons,
                    mock interviews, campaigns and platform
                    operations from one place.
                  </p>

                  {user?.name && (
                    <p
                      className="mt-4 text-sm font-semibold"
                      style={{ color: colors.muted }}
                    >
                      Welcome back,{" "}
                      <span
                        className="font-extrabold"
                        style={{ color: colors.orangeDark }}
                      >
                        {user.name}
                      </span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:w-[360px]">
                  {[
                    {
                      title: "Active Tools",
                      value: currentRoutes.length,
                      icon: Grid2X2,
                    },
                    {
                      title: "Favorites",
                      value: validFavorites.length,
                      icon: Star,
                    },
                    {
                      title: "Categories",
                      value: categories.length,
                      icon: Filter,
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="min-w-0 rounded-2xl border p-3 sm:p-4"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.subtle,
                      }}
                    >
                      <item.icon
                        size={18}
                        style={{ color: colors.orangeDark }}
                      />

                      <p className="mt-3 text-2xl font-black">
                        {item.value}
                      </p>

                      <p
                        className="mt-1 text-[10px] font-semibold"
                        style={{ color: colors.muted }}
                      >
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ============================================
              PRIORITY TOOLS

              ALWAYS ABOVE OTHER WORKSPACE TOOLS
          ============================================ */}

          {visiblePriority.length > 0 && (
            <section className="mt-7">
              <SectionHeading
                eyebrow="Quick Access"
                title="Essential Management Tools"
                description={
                  isAdmin
                    ? "Your six primary administration tools, arranged by priority."
                    : "Your most useful available tools."
                }
                count={visiblePriority.length}
                colors={colors}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {visiblePriority.map((route, index) => (
                  <DashboardCard
                    key={route.path}
                    route={route}
                    index={index}
                    colors={colors}
                    prominent
                    isFavorite={validFavorites.includes(
                      route.path
                    )}
                    onFavorite={toggleFavorite}
                    onOpen={trackOpen}
                    layout="grid"
                  />
                ))}
              </div>
            </section>
          )}

          {/* ============================================
              SEARCH / FILTER BAR
          ============================================ */}

          <section
            className="sticky top-16 z-20 mt-7 rounded-2xl border p-3 shadow-sm backdrop-blur sm:p-4"
            style={{
              backgroundColor: colors.panel,
              borderColor: colors.border,
            }}
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative w-full lg:max-w-md">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                  style={{ color: colors.muted }}
                />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  placeholder="Search dashboard tools..."
                  className="h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[#F28C38]"
                  style={{
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
                {[
                  ["all", "All"],
                  ["favorites", "Favorites"],
                  ["recent", "Recent"],
                  ["featured", "Featured"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setQuickFilter(value)}
                    className="rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors"
                    style={{
                      borderColor:
                        quickFilter === value
                          ? colors.orange
                          : colors.border,
                      backgroundColor:
                        quickFilter === value
                          ? colors.orange
                          : colors.subtle,
                      color:
                        quickFilter === value
                          ? "#1B1B1B"
                          : colors.muted,
                    }}
                  >
                    {label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setShowAdvanced((prev) => !prev)
                  }
                  className="inline-flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold"
                  style={{
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  <ChevronDown
                    size={14}
                    className={
                      showAdvanced ? "rotate-180" : ""
                    }
                  />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="mt-4 grid grid-cols-1 gap-3 border-t pt-4 sm:grid-cols-2 lg:grid-cols-3"
                    style={{ borderColor: colors.divider }}
                  >
                    <div>
                      <label
                        className="mb-2 block text-xs font-bold"
                        style={{ color: colors.muted }}
                      >
                        Category
                      </label>

                      <select
                        value={selectedCategory}
                        onChange={(e) =>
                          setSelectedCategory(e.target.value)
                        }
                        className="w-full rounded-xl border px-3 py-3 text-sm outline-none"
                        style={{
                          backgroundColor: colors.input,
                          borderColor: colors.inputBorder,
                          color: colors.text,
                        }}
                      >
                        <option value="All">
                          All Categories
                        </option>

                        {categories.map((category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        className="mb-2 block text-xs font-bold"
                        style={{ color: colors.muted }}
                      >
                        Sort Other Tools
                      </label>

                      <select
                        value={sortBy}
                        onChange={(e) =>
                          setSortBy(e.target.value)
                        }
                        className="w-full rounded-xl border px-3 py-3 text-sm outline-none"
                        style={{
                          backgroundColor: colors.input,
                          borderColor: colors.inputBorder,
                          color: colors.text,
                        }}
                      >
                        <option value="default">
                          Default Order
                        </option>
                        <option value="az">A to Z</option>
                        <option value="za">Z to A</option>
                        <option value="category">
                          Category
                        </option>
                        <option value="recent">
                          Recently Opened
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        className="mb-2 block text-xs font-bold"
                        style={{ color: colors.muted }}
                      >
                        Display Style
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          ["grid", Grid2X2, "Grid"],
                          ["list", List, "List"],
                        ].map(([value, Icon, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setLayout(value)}
                            className="flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold"
                            style={{
                              backgroundColor:
                                layout === value
                                  ? colors.orangeSoft
                                  : colors.input,
                              borderColor:
                                layout === value
                                  ? colors.orange
                                  : colors.inputBorder,
                              color:
                                layout === value
                                  ? colors.orangeText
                                  : colors.text,
                            }}
                          >
                            <Icon size={15} />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="flex items-center gap-2 text-xs font-bold"
                      style={{
                        color: colors.orangeText,
                      }}
                    >
                      <X size={14} />
                      Reset All Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ============================================
              OTHER MANAGEMENT TOOLS
          ============================================ */}

          <section className="mt-8">
            <SectionHeading
              eyebrow="Workspace"
              title="Other Management Tools"
              description="Access publishing, users, support, analytics and additional platform operations."
              count={filteredRoutes.length}
              colors={colors}
            />

            {groupedRoutes.length > 0 ? (
              <div className="space-y-8">
                {groupedRoutes.map((group) => (
                  <div key={group.category}>
                    <div className="mb-3 flex items-center gap-3">
                      <h3
                        className="text-sm font-extrabold"
                        style={{ color: colors.text }}
                      >
                        {group.category}
                      </h3>

                      <div
                        className="h-px flex-1"
                        style={{
                          backgroundColor: colors.divider,
                        }}
                      />

                      <span
                        className="text-xs font-bold"
                        style={{ color: colors.muted }}
                      >
                        {group.routes.length}
                      </span>
                    </div>

                    <div
                      className={cx(
                        "grid gap-3",
                        layout === "grid"
                          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                          : "grid-cols-1 lg:grid-cols-2"
                      )}
                    >
                      {group.routes.map((route, index) => (
                        <DashboardCard
                          key={route.path}
                          route={route}
                          index={index}
                          colors={colors}
                          layout={layout}
                          isFavorite={validFavorites.includes(
                            route.path
                          )}
                          onFavorite={toggleFavorite}
                          onOpen={trackOpen}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : totalVisible === 0 ? (
              <div
                className="rounded-2xl border px-5 py-14 text-center"
                style={{
                  backgroundColor: colors.panel,
                  borderColor: colors.border,
                }}
              >
                <Search
                  size={27}
                  className="mx-auto"
                  style={{ color: colors.orangeDark }}
                />

                <h3 className="mt-4 text-lg font-extrabold">
                  No Tools Found
                </h3>

                <p
                  className="mt-2 text-sm"
                  style={{ color: colors.muted }}
                >
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-xl px-5 py-2.5 text-sm font-bold"
                  style={{
                    backgroundColor: colors.orange,
                    color: "#1B1B1B",
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                className="rounded-xl border p-6 text-center text-sm"
                style={{
                  backgroundColor: colors.panel,
                  borderColor: colors.border,
                  color: colors.muted,
                }}
              >
                No additional tools match your current filters.
              </div>
            )}
          </section>

          {/* ============================================
              DISABLED FEATURES — BOTTOM

              Admin only.
              Bookings and Booking Slots are not clickable.
          ============================================ */}

          {isAdmin && (
            <section className="mt-12">
              <SectionHeading
                eyebrow="Inactive Modules"
                title="Disabled Features"
                description="These legacy modules are temporarily disabled and cannot be opened from this dashboard."
                count={DISABLED_ROUTES.length}
                colors={colors}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {DISABLED_ROUTES.map((route) => (
                  <DisabledCard
                    key={route.path}
                    route={route}
                    colors={colors}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ============================================
              PAGE STATUS
          ============================================ */}

          <div
            className="mt-10 flex flex-col gap-2 border-t pt-5 text-xs sm:flex-row sm:items-center sm:justify-between"
            style={{
              borderColor: colors.divider,
              color: colors.muted,
            }}
          >
            <span>
              Target Trek Administration Workspace
            </span>

            <span>
              {currentRoutes.length} active tools
              {isAdmin &&
                ` · ${DISABLED_ROUTES.length} disabled modules`}
            </span>
          </div>
        </div>
      </main>
    </>
  );
}
