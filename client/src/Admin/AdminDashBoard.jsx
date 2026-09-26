import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { useSelector } from "react-redux";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  CircleUserRound,
  FileText,
  Gift,
  Handshake,
  Image,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MessageSquareHeart,
  PlusCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  TicketPercent,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";

const adminRoutes = [
  {
    path: "/admin/books",
    name: "Books",
    icon: BookOpen,
    description:
      "Manage books, pricing, visibility, payment links, covers and publishing settings.",
    category: "Books & Sales",
    tone: "blue",
  },
  {
    path: "/admin/book/analytics",
    name: "Book Analytics",
    icon: BarChart3,
    description:
      "Track book performance, orders, revenue, payments and sales activity.",
    category: "Books & Sales",
    tone: "emerald",
  },
  {
    path: "/admin/coupon/dashboard",
    name: "Coupons Dashboard",
    icon: TicketPercent,
    description:
      "Create and monitor coupon codes, discounts, usage and promotional campaigns.",
    category: "Books & Sales",
    tone: "violet",
  },
  {
    path: "/admin/dashboard",
    name: "Sales Dashboard",
    icon: LayoutDashboard,
    description:
      "Monitor sales, payment performance, revenue trends and important business metrics.",
    category: "Books & Sales",
    tone: "amber",
  },
  {
    path: "/profile",
    name: "Profile",
    icon: CircleUserRound,
    description:
      "View your account information and update your personal profile settings.",
    category: "Users & Access",
    tone: "slate",
  },
  {
    path: "/admin/users",
    name: "User Management",
    icon: UserCog,
    description:
      "View, manage and maintain all registered user and employee accounts.",
    category: "Users & Access",
    tone: "indigo",
  },
  {
    path: "/admin/signup",
    name: "Add a User",
    icon: UserPlus,
    description:
      "Create a new admin, employee or authorized user account for the platform.",
    category: "Users & Access",
    tone: "sky",
  },
  {
    path: "/admin/add-blog",
    name: "Add Blog",
    icon: PlusCircle,
    description:
      "Write and publish a new article, interview experience or learning resource.",
    category: "Content",
    tone: "blue",
  },
  {
    path: "/blog-manage",
    name: "Manage Blogs",
    icon: FileText,
    description:
      "Edit, review, organize or remove existing blog posts and published articles.",
    category: "Content",
    tone: "emerald",
  },
  {
    path: "/admin/generate-review-link",
    name: "Generate Review Link",
    icon: Gift,
    description:
      "Generate dedicated links that allow customers and users to submit reviews.",
    category: "Reviews & Support",
    tone: "violet",
  },
  {
    path: "/admin/manage-reviews",
    name: "Manage Reviews",
    icon: CheckCircle2,
    description:
      "Review, approve, edit or remove customer reviews submitted to Target Trek.",
    category: "Reviews & Support",
    tone: "emerald",
  },
  {
    path: "/contact-query",
    name: "Contact Queries",
    icon: Mail,
    description:
      "Review customer questions, support requests and contact form submissions.",
    category: "Reviews & Support",
    tone: "amber",
  },
  {
    path: "/admin/add-portfolio",
    name: "Add Portfolio",
    icon: PlusCircle,
    description:
      "Create a new portfolio entry and showcase projects or professional work.",
    category: "Portfolio",
    tone: "blue",
  },
  {
    path: "/portfolio-manage",
    name: "Manage Portfolio",
    icon: Image,
    description:
      "Edit, organize or remove existing portfolio projects and portfolio assets.",
    category: "Portfolio",
    tone: "sky",
  },
  {
    path: "/admin/affiliate-manage",
    name: "Affiliate Management",
    icon: Handshake,
    description:
      "Manage affiliates, referral relationships and affiliate sales activity.",
    category: "Business",
    tone: "violet",
  },
  {
    path: "/interest",
    name: "Interested Users",
    icon: MessageSquareHeart,
    description:
      "Review users who expressed interest in products, services or opportunities.",
    category: "Business",
    tone: "rose",
  },
  {
    path: "/clients",
    name: "Clients",
    icon: BriefcaseBusiness,
    description:
      "View and manage all customers and clients currently onboarded with Target Trek.",
    category: "Business",
    tone: "slate",
  },
];

const employeeRoutes = [
  {
    path: "/profile",
    name: "Profile",
    icon: CircleUserRound,
    description:
      "View your account information and update your personal profile settings.",
    category: "Account",
    tone: "slate",
  },
  {
    path: "/admin/add-blog",
    name: "Add Blog",
    icon: PlusCircle,
    description:
      "Write and publish a new article, interview experience or learning resource.",
    category: "Content",
    tone: "blue",
  },
  {
    path: "/blog-manage",
    name: "Manage Blogs",
    icon: FileText,
    description:
      "Edit, review, organize or remove existing blog posts and published articles.",
    category: "Content",
    tone: "emerald",
  },
  {
    path: "/admin/generate-review-link",
    name: "Generate Review Link",
    icon: Gift,
    description:
      "Generate dedicated links that allow customers and users to submit reviews.",
    category: "Reviews & Support",
    tone: "violet",
  },
  {
    path: "/admin/manage-reviews",
    name: "Manage Reviews",
    icon: CheckCircle2,
    description:
      "Review, approve, edit or remove customer reviews submitted to Target Trek.",
    category: "Reviews & Support",
    tone: "emerald",
  },
  {
    path: "/contact-query",
    name: "Contact Queries",
    icon: Mail,
    description:
      "Review customer questions, support requests and contact form submissions.",
    category: "Reviews & Support",
    tone: "amber",
  },
  {
    path: "/admin/add-portfolio",
    name: "Add Portfolio",
    icon: PlusCircle,
    description:
      "Create a new portfolio entry and showcase projects or professional work.",
    category: "Portfolio",
    tone: "blue",
  },
  {
    path: "/portfolio-manage",
    name: "Manage Portfolio",
    icon: Image,
    description:
      "Edit, organize or remove existing portfolio projects and portfolio assets.",
    category: "Portfolio",
    tone: "sky",
  },
  {
    path: "/admin/affiliate-manage",
    name: "Affiliate Management",
    icon: Handshake,
    description:
      "Manage affiliates, referral relationships and affiliate sales activity.",
    category: "Business",
    tone: "violet",
  },
  {
    path: "/interest",
    name: "Interested Users",
    icon: MessageSquareHeart,
    description:
      "Review users who expressed interest in products, services or opportunities.",
    category: "Business",
    tone: "rose",
  },
];

const toneStyles = {
  blue: {
    icon: "bg-blue-50 text-blue-600 ring-blue-100",
    hover: "group-hover:border-blue-200",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    hover: "group-hover:border-emerald-200",
  },
  violet: {
    icon: "bg-violet-50 text-violet-600 ring-violet-100",
    hover: "group-hover:border-violet-200",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600 ring-amber-100",
    hover: "group-hover:border-amber-200",
  },
  indigo: {
    icon: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    hover: "group-hover:border-indigo-200",
  },
  sky: {
    icon: "bg-sky-50 text-sky-600 ring-sky-100",
    hover: "group-hover:border-sky-200",
  },
  rose: {
    icon: "bg-rose-50 text-rose-600 ring-rose-100",
    hover: "group-hover:border-rose-200",
  },
  slate: {
    icon: "bg-slate-100 text-slate-600 ring-slate-200",
    hover: "group-hover:border-slate-300",
  },
};

function DashboardCard({ route, index }) {
  const Icon = route.icon;

  const styles =
    toneStyles[route.tone] ||
    toneStyles.blue;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.035, 0.35),
      }}
      whileHover={{
        y: -3,
      }}
      className="h-full"
    >
      <Link
        to={route.path}
        className="group block h-full"
      >
        <div
          className={`relative flex h-full min-h-[210px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg ${styles.hover}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${styles.icon}`}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all duration-300 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600">
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
          </div>

          <div className="mt-5 flex-1">
            <div className="mb-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-500">
                {route.category}
              </span>
            </div>

            <h2 className="text-base font-extrabold text-slate-950 transition group-hover:text-blue-700">
              {route.name}
            </h2>

            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              {route.description}
            </p>
          </div>

          <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-extrabold text-blue-600">
            Open
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

const AdminDashboard = () => {
  const user = useSelector(
    (state) => state.auth.user
  );

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const normalizedRole = String(
    user?.role || ""
  ).trim();

  const isAdmin =
    normalizedRole.toLowerCase() ===
    "admin";

  const isEmployee =
    normalizedRole.toLowerCase() ===
    "employee";

  const dashboardTitle = isAdmin
    ? "Admin Dashboard"
    : isEmployee
    ? "Employee Dashboard"
    : "Dashboard";

  const currentRoutes = isAdmin
    ? adminRoutes
    : isEmployee
    ? employeeRoutes
    : [];

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          currentRoutes.map(
            (route) => route.category
          )
        )
      ),
    ];
  }, [currentRoutes]);

  const filteredRoutes = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return currentRoutes.filter(
      (route) => {
        const matchesCategory =
          selectedCategory === "All" ||
          route.category ===
            selectedCategory;

        const matchesSearch =
          !query ||
          route.name
            .toLowerCase()
            .includes(query) ||
          route.description
            .toLowerCase()
            .includes(query) ||
          route.category
            .toLowerCase()
            .includes(query);

        return (
          matchesCategory &&
          matchesSearch
        );
      }
    );
  }, [
    currentRoutes,
    searchQuery,
    selectedCategory,
  ]);

  if (
    !user ||
    (!isAdmin &&
      !isEmployee)
  ) {
    return (
      <>
        <Helmet>
          <title>
            Access Denied - Target Trek
          </title>
        </Helmet>

        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <LockKeyhole className="h-7 w-7" />
            </div>

            <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.15em] text-red-500">
              Restricted Area
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-slate-950">
              Access Denied
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-slate-500">
              Your account does not have
              permission to access this
              dashboard. Please sign in
              using an authorized admin or
              employee account.
            </p>

            <Link
              to="/"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Back to Home

              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {dashboardTitle} - Target Trek
        </title>
      </Helmet>

      <main className="min-h-screen bg-slate-50 pb-20 pt-24 text-slate-900 sm:pt-28">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />

            <div className="absolute -bottom-32 left-20 h-72 w-72 rounded-full bg-sky-100/40 blur-3xl" />

            <div className="relative p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-blue-700">
                      <ShieldCheck className="h-3.5 w-3.5" />

                      {isAdmin
                        ? "Administrator"
                        : "Employee"}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-500">
                      <Sparkles className="h-3.5 w-3.5" />

                      Target Trek
                    </span>
                  </div>

                  <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                    {dashboardTitle}
                  </h1>

                  <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-500 sm:text-base">
                    Manage Target Trek
                    operations from one
                    place. Quickly access
                    books, payments,
                    analytics, customers,
                    content, reviews,
                    affiliates and other
                    administrative tools.
                  </p>

                  {user?.name && (
                    <p className="mt-4 text-sm font-semibold text-slate-600">
                      Welcome back,{" "}
                      <span className="font-extrabold text-blue-600">
                        {user.name}
                      </span>
                      .
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[380px]">
                  <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Activity className="h-4 w-4" />
                    </div>

                    <p className="mt-3 text-2xl font-extrabold text-slate-950">
                      {
                        currentRoutes.length
                      }
                    </p>

                    <p className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Tools
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Tag className="h-4 w-4" />
                    </div>

                    <p className="mt-3 text-2xl font-extrabold text-slate-950">
                      {
                        categories.filter(
                          (item) =>
                            item !== "All"
                        ).length
                      }
                    </p>

                    <p className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Categories
                    </p>
                  </div>

                  <div className="col-span-2 rounded-2xl bg-slate-950 p-4 text-white shadow-sm sm:col-span-1">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                      <ShieldCheck className="h-4 w-4" />
                    </div>

                    <p className="mt-3 text-sm font-extrabold">
                      {isAdmin
                        ? "Full Access"
                        : "Employee"}
                    </p>

                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Permission
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="sticky top-20 z-20 mt-5 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur sm:top-24 sm:p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full xl:max-w-md">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search dashboard tools..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
                {categories.map(
                  (category) => {
                    const active =
                      selectedCategory ===
                      category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() =>
                          setSelectedCategory(
                            category
                          )
                        }
                        className={`whitespace-nowrap rounded-xl border px-3.5 py-2.5 text-xs font-extrabold transition ${
                          active
                            ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          </section>

          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-blue-600">
                Workspace
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-slate-950">
                Dashboard Tools
              </h2>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Choose a section to
                manage.
              </p>
            </div>

            <p className="text-xs font-bold text-slate-400">
              Showing{" "}
              <span className="text-slate-700">
                {filteredRoutes.length}
              </span>{" "}
              of{" "}
              <span className="text-slate-700">
                {currentRoutes.length}
              </span>{" "}
              tools
            </p>
          </div>

          {filteredRoutes.length >
          0 ? (
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredRoutes.map(
                (route, index) => (
                  <DashboardCard
                    key={route.path}
                    route={route}
                    index={index}
                  />
                )
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white py-16 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Search className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-lg font-extrabold text-slate-950">
                No tools found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
                No dashboard section
                matches your current
                search or selected
                category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(
                    "All"
                  );
                }}
                className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;