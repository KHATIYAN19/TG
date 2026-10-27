// import React, { useEffect, useMemo, useState } from "react";

// import { Link } from "react-router-dom";

// import { motion } from "framer-motion";

// import { Helmet } from "react-helmet";

// import { useSelector } from "react-redux";

// import {

//   Activity,

//   ArrowRight,

//   BarChart3,

//   BookOpen,

//   BriefcaseBusiness,

//   CheckCircle2,

//   CircleUserRound,

//   FileText,

//   Gift,

//   Handshake,

//   Image,

//   LayoutDashboard,

//   LockKeyhole,

//   Mail,

//   MessageSquareHeart,

//   PlusCircle,

//   Search,

//   Send,

//   ShieldCheck,

//   Sparkles,

//   Tag,

//   TicketPercent,

//   UserCog,

//   UserPlus,

// } from "lucide-react";



// const adminRoutes = [
//   {
//     path: "/admin/books",
//     name: "Books",
//     icon: BookOpen,
//     description:
//       "Manage books, pricing, visibility, payment links, covers and publishing settings.",
//     category: "Books & Sales",
//     tone: "blue",
//   },
//   {
//     path: "/admin/book/create",
//     name: "Add Book",
//     icon: PlusCircle,
//     description:
//       "Create a new book with pricing, cover, payment, publishing and resource details.",
//     category: "Books & Sales",
//     tone: "sky",
//   },
//   {
//     path: "/admin/book/analytics",
//     name: "Book Analytics",
//     icon: BarChart3,
//     description:
//       "Track book performance, orders, revenue, payments and sales activity.",
//     category: "Books & Sales",
//     tone: "emerald",
//   },
//   {
//     path: "/admin/coupon/dashboard",
//     name: "Coupons Dashboard",
//     icon: TicketPercent,
//     description:
//       "Create and monitor coupon codes, discounts, usage and promotional campaigns.",
//     category: "Books & Sales",
//     tone: "violet",
//   },
//   {
//     path: "/admin/dashboard",
//     name: "Sales Dashboard",
//     icon: LayoutDashboard,
//     description:
//       "Monitor sales, payment performance, revenue trends and important business metrics.",
//     category: "Books & Sales",
//     tone: "amber",
//   },
//   {
//     path: "/campaign",
//     name: "Campaign Email",
//     icon: Send,
//     description:
//       "Create and send promotional emails, book notifications, coupon campaigns and customer updates.",
//     category: "Marketing & Notifications",
//     tone: "rose",
//   },
//   {
//     path: "/admin/interviews",
//     name: "Interview Experiences",
//     icon: BriefcaseBusiness,
//     description:
//       "Review, edit and manage submitted interview experiences, publishing status and interview content.",
//     category: "Content",
//     tone: "indigo",
//   },
//   {
//     path: "/admin/add-blog",
//     name: "Add Blog",
//     icon: PlusCircle,
//     description:
//       "Write and publish a new article, interview experience or learning resource.",
//     category: "Content",
//     tone: "blue",
//   },
//   {
//     path: "/blog-manage",
//     name: "Manage Blogs",
//     icon: FileText,
//     description:
//       "Edit, review, organize or remove existing blog posts and published articles.",
//     category: "Content",
//     tone: "emerald",
//   },
//   {
//     path: "/profile",
//     name: "Profile",
//     icon: CircleUserRound,
//     description:
//       "View your account information and update your personal profile settings.",
//     category: "Users & Access",
//     tone: "slate",
//   },
//   {
//     path: "/admin/users",
//     name: "User Management",
//     icon: UserCog,
//     description:
//       "View, manage and maintain all registered user and employee accounts.",
//     category: "Users & Access",
//     tone: "indigo",
//   },
//   {
//     path: "/admin/signup",
//     name: "Add a User",
//     icon: UserPlus,
//     description:
//       "Create a new admin, employee or authorized user account for the platform.",
//     category: "Users & Access",
//     tone: "sky",
//   },
//   {
//     path: "/admin/generate-review-link",
//     name: "Generate Review Link",
//     icon: Gift,
//     description:
//       "Generate dedicated links that allow customers and users to submit reviews.",
//     category: "Reviews & Support",
//     tone: "violet",
//   },
//   {
//     path: "/admin/manage-reviews",
//     name: "Manage Reviews",
//     icon: CheckCircle2,
//     description:
//       "Review, approve, edit or remove customer reviews submitted to Target Trek.",
//     category: "Reviews & Support",
//     tone: "emerald",
//   },
//   {
//     path: "/contact-query",
//     name: "Contact Queries",
//     icon: Mail,
//     description:
//       "Review customer questions, support requests and contact form submissions.",
//     category: "Reviews & Support",
//     tone: "amber",
//   },
//   {
//     path: "/admin/add-portfolio",
//     name: "Add Portfolio",
//     icon: PlusCircle,
//     description:
//       "Create a new portfolio entry and showcase projects or professional work.",
//     category: "Portfolio",
//     tone: "blue",
//   },
//   {
//     path: "/portfolio-manage",
//     name: "Manage Portfolio",
//     icon: Image,
//     description:
//       "Edit, organize or remove existing portfolio projects and portfolio assets.",
//     category: "Portfolio",
//     tone: "sky",
//   },
//   {
//     path: "/admin/booking",
//     name: "Bookings",
//     icon: BriefcaseBusiness,
//     description:
//       "View and manage booking requests, scheduled sessions and booking-related activity.",
//     category: "Operations",
//     tone: "blue",
//   },
//   {
//     path: "/admin/slots",
//     name: "Booking Slots",
//     icon: Activity,
//     description:
//       "Manage available booking slots, schedules and availability for customer sessions.",
//     category: "Operations",
//     tone: "emerald",
//   },
//   {
//     path: "/admin/affiliate-manage",
//     name: "Affiliate Management",
//     icon: Handshake,
//     description:
//       "Manage affiliates, referral relationships and affiliate sales activity.",
//     category: "Business",
//     tone: "violet",
//   },
//   {
//     path: "/interest",
//     name: "Interested Users",
//     icon: MessageSquareHeart,
//     description:
//       "Review users who expressed interest in products, services or opportunities.",
//     category: "Business",
//     tone: "rose",
//   },
//   {
//     path: "/clients",
//     name: "Clients",
//     icon: BriefcaseBusiness,
//     description:
//       "View and manage all customers and clients currently onboarded with Target Trek.",
//     category: "Business",
//     tone: "slate",
//   },
// ];

// const employeeRoutes = [
//   {
//     path: "/profile",
//     name: "Profile",
//     icon: CircleUserRound,
//     description:
//       "View your account information and update your personal profile settings.",
//     category: "Account",
//     tone: "slate",
//   },
//   {
//     path: "/campaign",
//     name: "Campaign Email",
//     icon: Send,
//     description:
//       "Create and send promotional emails, book notifications, coupon campaigns and customer updates.",
//     category: "Marketing & Notifications",
//     tone: "rose",
//   },
//   {
//     path: "/admin/interviews",
//     name: "Interview Experiences",
//     icon: BriefcaseBusiness,
//     description:
//       "Review, edit and manage submitted interview experiences, publishing status and interview content.",
//     category: "Content",
//     tone: "indigo",
//   },
//   {
//     path: "/admin/add-blog",
//     name: "Add Blog",
//     icon: PlusCircle,
//     description:
//       "Write and publish a new article, interview experience or learning resource.",
//     category: "Content",
//     tone: "blue",
//   },
//   {
//     path: "/blog-manage",
//     name: "Manage Blogs",
//     icon: FileText,
//     description:
//       "Edit, review, organize or remove existing blog posts and published articles.",
//     category: "Content",
//     tone: "emerald",
//   },
//   {
//     path: "/admin/generate-review-link",
//     name: "Generate Review Link",
//     icon: Gift,
//     description:
//       "Generate dedicated links that allow customers and users to submit reviews.",
//     category: "Reviews & Support",
//     tone: "violet",
//   },
//   {
//     path: "/admin/manage-reviews",
//     name: "Manage Reviews",
//     icon: CheckCircle2,
//     description:
//       "Review, approve, edit or remove customer reviews submitted to Target Trek.",
//     category: "Reviews & Support",
//     tone: "emerald",
//   },
//   {
//     path: "/contact-query",
//     name: "Contact Queries",
//     icon: Mail,
//     description:
//       "Review customer questions, support requests and contact form submissions.",
//     category: "Reviews & Support",
//     tone: "amber",
//   },
//   {
//     path: "/admin/add-portfolio",
//     name: "Add Portfolio",
//     icon: PlusCircle,
//     description:
//       "Create a new portfolio entry and showcase projects or professional work.",
//     category: "Portfolio",
//     tone: "blue",
//   },
//   {
//     path: "/portfolio-manage",
//     name: "Manage Portfolio",
//     icon: Image,
//     description:
//       "Edit, organize or remove existing portfolio projects and portfolio assets.",
//     category: "Portfolio",
//     tone: "sky",
//   },
//   {
//     path: "/admin/affiliate-manage",
//     name: "Affiliate Management",
//     icon: Handshake,
//     description:
//       "Manage affiliates, referral relationships and affiliate sales activity.",
//     category: "Business",
//     tone: "violet",
//   },
// ];

// const toneStyles = {

//   blue: {

//     icon: "bg-blue-50 text-blue-600 ring-blue-100",

//     hover: "group-hover:border-blue-200",

//   },

//   emerald: {

//     icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",

//     hover: "group-hover:border-emerald-200",

//   },

//   violet: {

//     icon: "bg-violet-50 text-violet-600 ring-violet-100",

//     hover: "group-hover:border-violet-200",

//   },

//   amber: {

//     icon: "bg-amber-50 text-amber-600 ring-amber-100",

//     hover: "group-hover:border-amber-200",

//   },

//   indigo: {

//     icon: "bg-indigo-50 text-indigo-600 ring-indigo-100",

//     hover: "group-hover:border-indigo-200",

//   },

//   sky: {

//     icon: "bg-sky-50 text-sky-600 ring-sky-100",

//     hover: "group-hover:border-sky-200",

//   },

//   rose: {

//     icon: "bg-rose-50 text-rose-600 ring-rose-100",

//     hover: "group-hover:border-rose-200",

//   },

//   slate: {

//     icon: "bg-slate-100 text-slate-600 ring-slate-200",

//     hover: "group-hover:border-slate-300",

//   },

// };



// function DashboardCard({ route, index }) {

//   const Icon = route.icon;

//   const styles = toneStyles[route.tone] || toneStyles.blue;



//   return (

//     <motion.div

//       initial={{

//         opacity: 0,

//         y: 16,

//       }}

//       animate={{

//         opacity: 1,

//         y: 0,

//       }}

//       transition={{

//         duration: 0.3,

//         delay: Math.min(index * 0.035, 0.35),

//       }}

//       whileHover={{

//         y: -3,

//       }}

//       className="h-full"

//     >

//       <Link to={route.path} className="group block h-full">

//         <div

//           className={`relative flex h-full min-h-[210px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg ${styles.hover}`}

//         >

//           <div className="flex items-start justify-between gap-4">

//             <div

//               className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${styles.icon}`}

//             >

//               <Icon className="h-5 w-5" />

//             </div>



//             <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition-all duration-300 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600">

//               <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />

//             </div>

//           </div>



//           <div className="mt-5 flex-1">

//             <div className="mb-2">

//               <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-500">

//                 {route.category}

//               </span>

//             </div>



//             <h2 className="text-base font-extrabold text-slate-950 transition group-hover:text-blue-700">

//               {route.name}

//             </h2>



//             <p className="mt-2 text-sm font-medium leading-6 text-slate-500">

//               {route.description}

//             </p>

//           </div>



//           <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs font-extrabold text-blue-600">

//             Open

//             <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />

//           </div>

//         </div>

//       </Link>

//     </motion.div>

//   );

// }



// const AdminDashboard = () => {

//   const user = useSelector((state) => state.auth.user);



//   const [searchQuery, setSearchQuery] = useState("");

//   const [selectedCategory, setSelectedCategory] = useState("All");



//   useEffect(() => {

//     window.scrollTo(0, 0);

//   }, []);



//   const normalizedRole = String(user?.role || "").trim();



//   const isAdmin = normalizedRole.toLowerCase() === "admin";

//   const isEmployee = normalizedRole.toLowerCase() === "employee";



//   const dashboardTitle = isAdmin

//     ? "Admin Dashboard"

//     : isEmployee

//     ? "Employee Dashboard"

//     : "Dashboard";



//   const currentRoutes = isAdmin

//     ? adminRoutes

//     : isEmployee

//     ? employeeRoutes

//     : [];



//   const categories = useMemo(() => {

//     return [

//       "All",

//       ...Array.from(new Set(currentRoutes.map((route) => route.category))),

//     ];

//   }, [currentRoutes]);



//   const filteredRoutes = useMemo(() => {

//     const query = searchQuery.trim().toLowerCase();



//     return currentRoutes.filter((route) => {

//       const matchesCategory =

//         selectedCategory === "All" || route.category === selectedCategory;



//       const matchesSearch =

//         !query ||

//         route.name.toLowerCase().includes(query) ||

//         route.description.toLowerCase().includes(query) ||

//         route.category.toLowerCase().includes(query);



//       return matchesCategory && matchesSearch;

//     });

//   }, [currentRoutes, searchQuery, selectedCategory]);



//   if (!user || (!isAdmin && !isEmployee)) {

//     return (

//       <>

//         <Helmet>

//           <title>Access Denied - Target Trek</title>

//         </Helmet>



//         <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

//           <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl sm:p-10">

//             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">

//               <LockKeyhole className="h-7 w-7" />

//             </div>



//             <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.15em] text-red-500">

//               Restricted Area

//             </p>



//             <h1 className="mt-2 text-3xl font-extrabold text-slate-950">

//               Access Denied

//             </h1>



//             <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-slate-500">

//               Your account does not have permission to access this dashboard.

//               Please sign in using an authorized admin or employee account.

//             </p>



//             <Link

//               to="/"

//               className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"

//             >

//               Back to Home

//               <ArrowRight className="h-4 w-4" />

//             </Link>

//           </div>

//         </main>

//       </>

//     );

//   }



//   return (

//     <>

//       <Helmet>

//         <title>{dashboardTitle} - Target Trek</title>

//       </Helmet>



//       <main className="min-h-screen bg-slate-50 pb-20 pt-24 text-slate-900 sm:pt-28">

//         <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">

//           <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

//             <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />



//             <div className="absolute -bottom-32 left-20 h-72 w-72 rounded-full bg-sky-100/40 blur-3xl" />



//             <div className="relative p-6 sm:p-8 lg:p-10">

//               <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

//                 <div className="max-w-3xl">

//                   <div className="flex flex-wrap items-center gap-2">

//                     <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-blue-700">

//                       <ShieldCheck className="h-3.5 w-3.5" />



//                       {isAdmin ? "Administrator" : "Employee"}

//                     </span>



//                     <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-500">

//                       <Sparkles className="h-3.5 w-3.5" />



//                       Target Trek

//                     </span>

//                   </div>



//                   <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">

//                     {dashboardTitle}

//                   </h1>



//                   <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-500 sm:text-base">

//                     Manage Target Trek operations from one place. Quickly access

//                     books, payments, analytics, email campaigns, customers,

//                     content, reviews, affiliates and other administrative tools.

//                   </p>



//                   {user?.name && (

//                     <p className="mt-4 text-sm font-semibold text-slate-600">

//                       Welcome back,{" "}

//                       <span className="font-extrabold text-blue-600">

//                         {user.name}

//                       </span>

//                       .

//                     </p>

//                   )}

//                 </div>



//                 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[380px]">

//                   <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">

//                     <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

//                       <Activity className="h-4 w-4" />

//                     </div>



//                     <p className="mt-3 text-2xl font-extrabold text-slate-950">

//                       {currentRoutes.length}

//                     </p>



//                     <p className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">

//                       Tools

//                     </p>

//                   </div>



//                   <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">

//                     <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">

//                       <Tag className="h-4 w-4" />

//                     </div>



//                     <p className="mt-3 text-2xl font-extrabold text-slate-950">

//                       {categories.filter((item) => item !== "All").length}

//                     </p>



//                     <p className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">

//                       Categories

//                     </p>

//                   </div>



//                   <div className="col-span-2 rounded-2xl bg-slate-950 p-4 text-white shadow-sm sm:col-span-1">

//                     <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">

//                       <ShieldCheck className="h-4 w-4" />

//                     </div>



//                     <p className="mt-3 text-sm font-extrabold">

//                       {isAdmin ? "Full Access" : "Employee"}

//                     </p>



//                     <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">

//                       Permission

//                     </p>

//                   </div>

//                 </div>

//               </div>

//             </div>

//           </section>



//           <section className="sticky top-20 z-20 mt-5 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur sm:top-24 sm:p-4">

//             <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

//               <div className="relative w-full xl:max-w-md">

//                 <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />



//                 <input

//                   value={searchQuery}

//                   onChange={(event) => setSearchQuery(event.target.value)}

//                   placeholder="Search dashboard tools..."

//                   className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"

//                 />

//               </div>



//               <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">

//                 {categories.map((category) => {

//                   const active = selectedCategory === category;



//                   return (

//                     <button

//                       key={category}

//                       type="button"

//                       onClick={() => setSelectedCategory(category)}

//                       className={`whitespace-nowrap rounded-xl border px-3.5 py-2.5 text-xs font-extrabold transition ${

//                         active

//                           ? "border-blue-600 bg-blue-600 text-white shadow-sm"

//                           : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"

//                       }`}

//                     >

//                       {category}

//                     </button>

//                   );

//                 })}

//               </div>

//             </div>

//           </section>



//           <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

//             <div>

//               <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-blue-600">

//                 Workspace

//               </p>



//               <h2 className="mt-1 text-2xl font-extrabold text-slate-950">

//                 Dashboard Tools

//               </h2>



//               <p className="mt-1 text-sm font-medium text-slate-500">

//                 Choose a section to manage.

//               </p>

//             </div>



//             <p className="text-xs font-bold text-slate-400">

//               Showing{" "}

//               <span className="text-slate-700">{filteredRoutes.length}</span> of{" "}

//               <span className="text-slate-700">{currentRoutes.length}</span>{" "}

//               tools

//             </p>

//           </div>



//           {filteredRoutes.length > 0 ? (

//             <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">

//               {filteredRoutes.map((route, index) => (

//                 <DashboardCard

//                   key={route.path}

//                   route={route}

//                   index={index}

//                 />

//               ))}

//             </div>

//           ) : (

//             <div className="mt-6 rounded-3xl border border-slate-200 bg-white py-16 text-center shadow-sm">

//               <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

//                 <Search className="h-6 w-6" />

//               </div>



//               <h3 className="mt-4 text-lg font-extrabold text-slate-950">

//                 No tools found

//               </h3>



//               <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">

//                 No dashboard section matches your current search or selected

//                 category.

//               </p>



//               <button

//                 type="button"

//                 onClick={() => {

//                   setSearchQuery("");

//                   setSelectedCategory("All");

//                 }}

//                 className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"

//               >

//                 Clear Filters

//               </button>

//             </div>

//           )}

//         </div>

//       </main>

//     </>

//   );

// };



// export default AdminDashboard;

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

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
  Tag,
  TicketPercent,
  UserCog,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";

// ===========================================================
// ADMIN DASHBOARD - TARGET TREK
// ===========================================================

const THEME_STORAGE_KEY = "theme";
const FAVORITES_KEY = "targettrek_admin_favorites";
const RECENT_KEY = "targettrek_admin_recent";

// ===========================================================
// ADMIN ROUTES
// ===========================================================

const adminRoutes = [
  // FINANCE & REVENUE
  {
    path: "/admin/finance",
    name: "Finance Management",
    icon: CircleDollarSign,
    description:
      "Monitor total revenue, operating costs, affiliate commissions, profit margins, gateway fees, and financial reports.",
    category: "Finance & Revenue",
    keywords: "finance expenses income profits accounting money",
    featured: true,
  },
  {
    path: "/admin/book/analytics",
    name: "Book Analytics",
    icon: BarChart3,
    description:
      "Analyze book performance, payments, successful purchases, order trends, and product revenue.",
    category: "Finance & Revenue",
    keywords: "books sales statistics reports charts",
    featured: true,
  },
  {
    path: "/admin/dashboard",
    name: "Sales Dashboard",
    icon: LayoutDashboard,
    description:
      "Review orders, payment statuses, sales metrics, transaction activity, and sales performance.",
    category: "Finance & Revenue",
    keywords: "sales payments revenue transactions",
  },

  // INTERVIEWS & BOOKINGS
  {
    path: "/admin/mock-interviews",
    name: "Mock Interviews",
    icon: Users,
    description:
      "Manage mock interview requests, candidates, interviewers, scheduled sessions, and interview operations.",
    category: "Interviews & Bookings",
    keywords: "mock interviews practice interview candidates engineers",
    featured: true,
  },
  {
    path: "/admin/booking",
    name: "Bookings",
    icon: CalendarDays,
    description:
      "View and manage booking requests, upcoming sessions, scheduling information, and booking activity.",
    category: "Interviews & Bookings",
    keywords: "appointments meetings interview booking schedule",
  },
  {
    path: "/admin/slots",
    name: "Booking Slots",
    icon: Clock3,
    description:
      "Create and manage available time slots, engineer schedules, and appointment availability.",
    category: "Interviews & Bookings",
    keywords: "slots availability schedule time appointments",
  },
  {
    path: "/admin/interviews",
    name: "Interview Experiences",
    icon: BriefcaseBusiness,
    description:
      "Review, publish, edit, and organize interview experiences submitted to the platform.",
    category: "Content & Publishing",
    keywords: "interview experiences submissions articles",
  },

  // BOOKS
  {
    path: "/admin/books",
    name: "Manage Books",
    icon: BookOpen,
    description:
      "Manage ebook listings, book pricing, payment links, cover images, resource types, and availability.",
    category: "Books & Products",
    keywords: "ebooks hld lld java genai books products",
    featured: true,
  },
  {
    path: "/admin/book/create",
    name: "Add New Book",
    icon: PlusCircle,
    description:
      "Create a book listing with its title, pricing, cover image, delivery settings, and product details.",
    category: "Books & Products",
    keywords: "new book create product ebook",
  },
  {
    path: "/admin/coupon/dashboard",
    name: "Coupons Dashboard",
    icon: TicketPercent,
    description:
      "Create discount codes, configure promotions, monitor coupon usage, and manage offers.",
    category: "Books & Products",
    keywords: "discount promo sale offers coupon",
  },

  // MARKETING
  {
    path: "/campaign",
    name: "Email Campaigns",
    icon: Send,
    description:
      "Send promotional campaigns, product announcements, discount offers, and customer notifications.",
    category: "Marketing",
    keywords: "email marketing newsletter promotions notification",
  },
  {
    path: "/admin/affiliate-manage",
    name: "Affiliate Management",
    icon: Handshake,
    description:
      "Manage referral partners, affiliate relationships, commissions, and affiliate sales performance.",
    category: "Marketing",
    keywords: "referrals creators affiliates commissions partners",
  },
  {
    path: "/interest",
    name: "Interested Users",
    icon: MessageSquareHeart,
    description:
      "Review people interested in Target Trek products, services, interviews, and opportunities.",
    category: "Marketing",
    keywords: "leads interested users prospects",
  },

  // USERS & ACCESS
  {
    path: "/admin/users",
    name: "User Management",
    icon: UserCog,
    description:
      "View registered users, manage roles, account access, user statuses, and internal team members.",
    category: "Users & Access",
    keywords: "users employees admins roles access accounts",
  },
  {
    path: "/admin/signup",
    name: "Add a User",
    icon: UserPlus,
    description:
      "Create authorized accounts for new administrators, employees, and platform team members.",
    category: "Users & Access",
    keywords: "register new admin employee account",
  },
  {
    path: "/profile",
    name: "My Profile",
    icon: CircleUserRound,
    description:
      "View your account details and manage your personal profile information.",
    category: "Users & Access",
    keywords: "my account personal profile",
  },

  // CONTENT & PUBLISHING
  {
    path: "/admin/add-blog",
    name: "Add Blog",
    icon: PlusCircle,
    description:
      "Create a new blog post, technical article, interview experience, or learning resource.",
    category: "Content & Publishing",
    keywords: "new article write blog publish",
  },
  {
    path: "/blog-manage",
    name: "Manage Blogs",
    icon: FileText,
    description:
      "Edit, review, organize, publish, or remove existing articles and blog posts.",
    category: "Content & Publishing",
    keywords: "blog posts articles content edit",
  },
  {
    path: "/admin/add-portfolio",
    name: "Add Portfolio",
    icon: PlusCircle,
    description:
      "Create new portfolio entries to showcase projects, achievements, and professional work.",
    category: "Content & Publishing",
    keywords: "projects portfolio add",
  },
  {
    path: "/portfolio-manage",
    name: "Manage Portfolio",
    icon: Image,
    description:
      "Update existing portfolio projects, images, descriptions, and portfolio assets.",
    category: "Content & Publishing",
    keywords: "portfolio projects images",
  },

  // REVIEWS & SUPPORT
  {
    path: "/admin/generate-review-link",
    name: "Generate Review Link",
    icon: Gift,
    description:
      "Generate dedicated review submission links for customers and product purchasers.",
    category: "Reviews & Support",
    keywords: "review link customers feedback",
  },
  {
    path: "/admin/manage-reviews",
    name: "Manage Reviews",
    icon: CheckCircle2,
    description:
      "Review, approve, edit, and manage customer ratings, feedback, and testimonials.",
    category: "Reviews & Support",
    keywords: "feedback reviews ratings testimonials",
  },
  {
    path: "/contact-query",
    name: "Contact Queries",
    icon: Mail,
    description:
      "Review customer questions, contact submissions, support inquiries, and received messages.",
    category: "Reviews & Support",
    keywords: "support email contacts queries customer",
  },

  // BUSINESS
  {
    path: "/clients",
    name: "Clients",
    icon: BriefcaseBusiness,
    description:
      "Manage customer and client records, onboarded accounts, and client information.",
    category: "Business Operations",
    keywords: "clients customers business accounts",
  },
];

// ===========================================================
// EMPLOYEE ROUTES
// Keep original access restrictions.
// ===========================================================

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

const employeeRoutes = adminRoutes.filter((route) =>
  employeeAllowedPaths.has(route.path)
);

// ===========================================================
// HELPERS
// ===========================================================

const readTheme = () => {
  if (typeof window === "undefined") return "light";

  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);

    if (value === "dark" || value === "light") return value;
  } catch {
    // Use document theme as fallback.
  }

  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
};

const readArray = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const saveArray = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Navigation remains available if storage is blocked.
  }
};

const useSyncedTheme = () => {
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
    ];

    events.forEach((name) =>
      window.addEventListener(name, synchronize)
    );

    const observer = new MutationObserver(synchronize);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const onVisibility = () => {
      if (!document.hidden) synchronize();
    };

    document.addEventListener(
      "visibilitychange",
      onVisibility
    );

    // Covers Navbar code that only updates localStorage.
    const interval = window.setInterval(synchronize, 500);

    return () => {
      events.forEach((name) =>
        window.removeEventListener(name, synchronize)
      );

      observer.disconnect();
      clearInterval(interval);

      document.removeEventListener(
        "visibilitychange",
        onVisibility
      );
    };
  }, []);

  return {
    theme,
    isDark: theme === "dark",
  };
};

const getColors = (isDark) => ({
  page: isDark ? "#111111" : "#F6F5F2",
  panel: isDark ? "#191919" : "#FFFFFF",
  border: isDark ? "#303030" : "#E7E5E0",
  text: isDark ? "#F5F5F5" : "#1B1B1B",
  muted: isDark ? "#999999" : "#777777",
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

const CATEGORY_ORDER = [
  "Finance & Revenue",
  "Interviews & Bookings",
  "Books & Products",
  "Marketing",
  "Users & Access",
  "Content & Publishing",
  "Reviews & Support",
  "Business Operations",
];

const cx = (...values) => values.filter(Boolean).join(" ");

// ===========================================================
// REUSABLE COMPONENTS
// ===========================================================

function DashboardButton({
  children,
  onClick,
  colors,
  primary = false,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "inline-flex h-10 items-center justify-center gap-2",
        "rounded-[10px] border px-4 text-[12px] font-bold",
        "transition-all duration-200",
        "hover:-translate-y-0.5",
        className
      )}
      style={{
        backgroundColor: primary
          ? colors.orange
          : colors.panel,
        borderColor: primary
          ? colors.orange
          : colors.border,
        color: primary ? "#1B1B1B" : colors.text,
      }}
    >
      {children}
    </button>
  );
}

function DashboardCard({
  route,
  index,
  colors,
  isFavorite,
  onFavorite,
  onOpen,
  layout,
}) {
  const Icon = route.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{
        duration: 0.22,
        delay: Math.min(index * 0.015, 0.18),
      }}
      className="min-w-0"
    >
      <div
        className={cx(
          "group relative h-full rounded-[16px] border",
          "transition-all duration-200 hover:-translate-y-0.5",
          "hover:shadow-[0_10px_28px_rgba(0,0,0,0.06)]",
          layout === "list" ? "p-4" : "p-5"
        )}
        style={{
          backgroundColor: colors.panel,
          borderColor: colors.border,
        }}
      >
        <div
          className={cx(
            "flex gap-4",
            layout === "grid"
              ? "h-full flex-col"
              : "items-center"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <Link
              to={route.path}
              onClick={() => onOpen(route.path)}
              aria-label={`Open ${route.name}`}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px]"
              style={{
                backgroundColor: colors.orangeSoft,
                color: colors.orangeText,
              }}
            >
              <Icon size={21} strokeWidth={1.9} />
            </Link>

            {layout === "grid" && (
              <button
                type="button"
                onClick={() => onFavorite(route.path)}
                aria-label={
                  isFavorite
                    ? `Remove ${route.name} from favorites`
                    : `Add ${route.name} to favorites`
                }
                title={
                  isFavorite
                    ? "Remove favorite"
                    : "Add to favorites"
                }
                className="rounded-lg p-2 transition-transform hover:scale-110"
                style={{
                  color: isFavorite
                    ? colors.orangeDark
                    : colors.muted,
                }}
              >
                <Star
                  size={17}
                  fill={isFavorite ? colors.orange : "none"}
                />
              </button>
            )}
          </div>

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

              {route.featured && (
                <span
                  className="rounded-md px-2 py-1 text-[10px] font-bold"
                  style={{
                    backgroundColor: colors.orangeSoft,
                    color: colors.orangeText,
                  }}
                >
                  Featured
                </span>
              )}
            </div>

            <Link
              to={route.path}
              onClick={() => onOpen(route.path)}
              className="block text-[15px] font-bold transition-colors hover:text-[#E9812B]"
              style={{ color: colors.text }}
            >
              {route.name}
            </Link>

            <p
              className={cx(
                "mt-2 text-[12px] leading-[1.8]",
                layout === "list" ? "line-clamp-2" : ""
              )}
              style={{ color: colors.muted }}
            >
              {route.description}
            </p>
          </div>

          <div
            className={cx(
              "flex items-center justify-between gap-3",
              layout === "grid"
                ? "border-t pt-4"
                : "shrink-0 self-center"
            )}
            style={{
              borderColor: colors.divider,
            }}
          >
            {layout === "grid" && (
              <span
                className="text-[11px] font-semibold"
                style={{ color: colors.muted }}
              >
                Workspace tool
              </span>
            )}

            {layout === "list" && (
              <button
                type="button"
                onClick={() => onFavorite(route.path)}
                className="rounded-lg p-2"
                title="Toggle favorite"
                style={{
                  color: isFavorite
                    ? colors.orangeDark
                    : colors.muted,
                }}
              >
                <Star
                  size={16}
                  fill={isFavorite ? colors.orange : "none"}
                />
              </button>
            )}

            <Link
              to={route.path}
              onClick={() => onOpen(route.path)}
              className="inline-flex items-center gap-1.5 text-[12px] font-bold"
              style={{ color: colors.orangeDark }}
            >
              Open
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ===========================================================
// MAIN DASHBOARD
// ===========================================================

export default function AdminDashboard() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const { theme, isDark } = useSyncedTheme();

  const colors = useMemo(
    () => getColors(isDark),
    [isDark]
  );

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const role = String(user?.role || "")
    .trim()
    .toLowerCase();

  const isAdmin = role === "admin";
  const isEmployee = role === "employee";

  const currentRoutes = useMemo(() => {
    if (isAdmin) return adminRoutes;
    if (isEmployee) return employeeRoutes;
    return [];
  }, [isAdmin, isEmployee]);

  const currentPaths = useMemo(
    () => new Set(currentRoutes.map((route) => route.path)),
    [currentRoutes]
  );

  const categories = useMemo(() => {
    return CATEGORY_ORDER.filter((category) =>
      currentRoutes.some((route) => route.category === category)
    );
  }, [currentRoutes]);

  const validFavorites = useMemo(
    () => favorites.filter((path) => currentPaths.has(path)),
    [favorites, currentPaths]
  );

  const validRecent = useMemo(
    () => recent.filter((path) => currentPaths.has(path)),
    [recent, currentPaths]
  );

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

  const filteredRoutes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let result = currentRoutes.filter((route) => {
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
      result = [...result].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    if (sortBy === "za") {
      result = [...result].sort((a, b) =>
        b.name.localeCompare(a.name)
      );
    }

    if (sortBy === "category") {
      result = [...result].sort((a, b) => {
        const categoryCompare = a.category.localeCompare(
          b.category
        );

        return categoryCompare || a.name.localeCompare(b.name);
      });
    }

    if (sortBy === "recent") {
      result = [...result].sort((a, b) => {
        const aIndex = validRecent.indexOf(a.path);
        const bIndex = validRecent.indexOf(b.path);

        return (
          (aIndex === -1 ? 999 : aIndex) -
          (bIndex === -1 ? 999 : bIndex)
        );
      });
    }

    return result;
  }, [
    currentRoutes,
    searchQuery,
    selectedCategory,
    quickFilter,
    sortBy,
    validFavorites,
    validRecent,
  ]);

  const groupedRoutes = useMemo(() => {
    return categories
      .map((category) => ({
        category,
        routes: filteredRoutes.filter(
          (route) => route.category === category
        ),
      }))
      .filter((group) => group.routes.length > 0);
  }, [filteredRoutes, categories]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setQuickFilter("all");
    setSortBy("default");
  };

  const hasFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== "All" ||
    quickFilter !== "all" ||
    sortBy !== "default";

  const quickLinks = [
    {
      name: "Finance",
      path: "/admin/finance",
      icon: CircleDollarSign,
    },
    {
      name: "Mock Interviews",
      path: "/admin/mock-interviews",
      icon: Users,
    },
    {
      name: "Books",
      path: "/admin/books",
      icon: BookOpen,
    },
    {
      name: "Sales",
      path: "/admin/dashboard",
      icon: BarChart3,
    },
  ].filter((item) => currentPaths.has(item.path));

  // =========================================================
  // ACCESS DENIED
  // =========================================================

  if (!user || (!isAdmin && !isEmployee)) {
    return (
      <main
        data-theme={theme}
        className="mt-16 flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10"
        style={{
          backgroundColor: colors.page,
          color: colors.text,
        }}
      >
        <div
          className="w-full max-w-md rounded-[18px] border p-7 text-center shadow-sm sm:p-9"
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

          <h1 className="mt-5 text-2xl font-bold">
            Access Denied
          </h1>

          <p
            className="mt-3 text-sm leading-7"
            style={{ color: colors.muted }}
          >
            You need an authorized administrator or employee
            account to access this workspace.
          </p>

          <DashboardButton
            colors={colors}
            primary
            className="mt-6 w-full"
            onClick={() => navigate("/")}
          >
            Return to Home
            <ArrowRight size={15} />
          </DashboardButton>
        </div>
      </main>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main
      data-theme={theme}
      className="mt-16 min-h-[calc(100vh-4rem)] pb-20 pt-6 transition-colors duration-200 sm:pt-8"
      style={{
        backgroundColor: colors.page,
        color: colors.text,
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <section
          className="relative overflow-hidden rounded-[20px] border"
          style={{
            backgroundColor: colors.panel,
            borderColor: colors.border,
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{ backgroundColor: colors.orange }}
          />

          <div className="relative p-5 sm:p-7 lg:p-9">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-[750px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em]"
                    style={{
                      backgroundColor: colors.orangeSoft,
                      color: colors.orangeText,
                    }}
                  >
                    <ShieldCheck size={13} />
                    {isAdmin ? "Administrator" : "Employee"}
                  </span>

                  <span
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: colors.subtle,
                      borderColor: colors.border,
                      color: colors.muted,
                    }}
                  >
                    <Sparkles size={13} />
                    Target Trek Workspace
                  </span>
                </div>

                <h1 className="mt-5 text-[clamp(28px,4vw,42px)] font-bold tracking-[-1.5px]">
                  {isAdmin ? "Admin" : "Employee"}{" "}
                  <span style={{ color: colors.orangeDark }}>
                    Dashboard
                  </span>
                </h1>

                <p
                  className="mt-3 max-w-2xl text-[13px] leading-[1.9] sm:text-[14px]"
                  style={{ color: colors.muted }}
                >
                  Everything you need to manage Target Trek,
                  organized in one workspace. Find tools,
                  monitor business operations, and access your
                  most-used sections quickly.
                </p>

                {user?.name && (
                  <p
                    className="mt-4 text-[12px] font-medium"
                    style={{ color: colors.muted }}
                  >
                    Welcome back,{" "}
                    <span
                      className="font-bold"
                      style={{ color: colors.orangeDark }}
                    >
                      {user.name}
                    </span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:min-w-[340px]">
                {[
                  {
                    label: "Tools",
                    value: currentRoutes.length,
                    icon: Grid2X2,
                  },
                  {
                    label: "Sections",
                    value: categories.length,
                    icon: LayersIcon,
                  },
                  {
                    label: "Favorites",
                    value: validFavorites.length,
                    icon: Star,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="min-w-0 rounded-[13px] border p-3 sm:p-4"
                      style={{
                        backgroundColor: colors.subtle,
                        borderColor: colors.border,
                      }}
                    >
                      <Icon
                        size={18}
                        style={{ color: colors.orangeDark }}
                      />

                      <p className="mt-3 text-xl font-bold sm:text-2xl">
                        {item.value}
                      </p>

                      <p
                        className="mt-1 text-[10px] font-semibold"
                        style={{ color: colors.muted }}
                      >
                        {item.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* QUICK ACCESS - ADMIN */}
        {/* ================================================= */}

        {quickLinks.length > 0 && (
          <section className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles
                size={16}
                style={{ color: colors.orangeDark }}
              />

              <h2 className="text-[13px] font-bold">
                Quick Access
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {quickLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => trackOpen(item.path)}
                    className="group flex min-w-0 items-center gap-3 rounded-[13px] border p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-4"
                    style={{
                      backgroundColor: colors.panel,
                      borderColor: colors.border,
                    }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
                      style={{
                        backgroundColor: colors.orangeSoft,
                        color: colors.orangeText,
                      }}
                    >
                      <Icon size={19} />
                    </div>

                    <span className="min-w-0 flex-1 text-[12px] font-bold sm:text-[13px]">
                      {item.name}
                    </span>

                    <ArrowRight
                      size={15}
                      className="hidden shrink-0 transition-transform group-hover:translate-x-1 sm:block"
                      style={{ color: colors.orangeDark }}
                    />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ================================================= */}
        {/* SEARCH & FILTER PANEL */}
        {/* ================================================= */}

        <section
          className="sticky top-16 z-30 mt-6 rounded-[16px] border p-3 shadow-sm sm:p-4"
          style={{
            backgroundColor: colors.panel,
            borderColor: colors.border,
          }}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-3.5"
                style={{ color: colors.muted }}
              />

              <input
                type="search"
                placeholder="Search finance, interviews, books, users..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                className="h-11 w-full rounded-[10px] border pl-11 pr-10 text-[13px] outline-none transition-colors focus:border-[#F28C38]"
                style={{
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                }}
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 rounded p-1"
                  style={{ color: colors.muted }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-0 flex-1 lg:w-44 lg:flex-none">
                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value)
                  }
                  className="h-11 w-full appearance-none rounded-[10px] border px-3 pr-9 text-[12px] font-semibold outline-none focus:border-[#F28C38]"
                  style={{
                    backgroundColor: colors.input,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  }}
                >
                  <option value="default">Recommended</option>
                  <option value="az">Name A–Z</option>
                  <option value="za">Name Z–A</option>
                  <option value="category">By Category</option>
                  <option value="recent">Recently Opened</option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-3.5"
                  style={{ color: colors.muted }}
                />
              </div>

              <DashboardButton
                colors={colors}
                onClick={() =>
                  setShowAdvanced((previous) => !previous)
                }
              >
                <SlidersHorizontal size={15} />
                <span>Filters</span>
                <ChevronDown
                  size={14}
                  className={cx(
                    "transition-transform",
                    showAdvanced && "rotate-180"
                  )}
                />
              </DashboardButton>

              <div
                className="inline-flex h-10 overflow-hidden rounded-[10px] border"
                style={{ borderColor: colors.border }}
              >
                {[
                  ["grid", Grid2X2],
                  ["list", List],
                ].map(([value, Icon]) => (
                  <button
                    key={value}
                    type="button"
                    title={`${value} view`}
                    onClick={() => setLayout(value)}
                    className="flex h-full w-10 items-center justify-center transition-colors"
                    style={{
                      backgroundColor:
                        layout === value
                          ? colors.orangeSoft
                          : colors.panel,
                      color:
                        layout === value
                          ? colors.orangeDark
                          : colors.muted,
                    }}
                  >
                    <Icon size={17} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {[
              {
                key: "all",
                label: "All Tools",
                icon: Grid2X2,
              },
              {
                key: "featured",
                label: "Featured",
                icon: Sparkles,
              },
              {
                key: "favorites",
                label: "Favorites",
                icon: Star,
              },
              {
                key: "recent",
                label: "Recently Used",
                icon: Clock3,
              },
            ].map((item) => {
              const Icon = item.icon;
              const active = quickFilter === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setQuickFilter(item.key)}
                  className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[9px] border px-3 py-2 text-[11px] font-bold transition-colors"
                  style={{
                    backgroundColor: active
                      ? colors.orangeSoft
                      : colors.panel,
                    borderColor: active
                      ? colors.orange
                      : colors.border,
                    color: active
                      ? colors.orangeText
                      : colors.muted,
                  }}
                >
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="mt-4 border-t pt-4"
                  style={{ borderColor: colors.divider }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[12px] font-bold">
                      Filter by Category
                    </p>

                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-[11px] font-bold"
                      style={{ color: colors.orangeDark }}
                    >
                      Reset All
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["All", ...categories].map((category) => {
                      const active =
                        selectedCategory === category;

                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() =>
                            setSelectedCategory(category)
                          }
                          className="rounded-[9px] border px-3 py-2 text-[11px] font-semibold transition-colors"
                          style={{
                            backgroundColor: active
                              ? colors.orange
                              : colors.subtle,
                            borderColor: active
                              ? colors.orange
                              : colors.border,
                            color: active
                              ? "#1B1B1B"
                              : colors.muted,
                          }}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ================================================= */}
        {/* SECTION HEADING */}
        {/* ================================================= */}

        <section className="mt-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.15em]"
                style={{ color: colors.orangeDark }}
              >
                Workspace
              </p>

              <h2 className="mt-1 text-[23px] font-bold tracking-tight">
                Dashboard Tools
              </h2>

              <p
                className="mt-1 text-[12px]"
                style={{ color: colors.muted }}
              >
                Choose a section to manage.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <p
                className="text-[12px] font-semibold"
                style={{ color: colors.muted }}
              >
                Showing{" "}
                <strong style={{ color: colors.text }}>
                  {filteredRoutes.length}
                </strong>{" "}
                of {currentRoutes.length} tools
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold"
                  style={{ color: colors.orangeDark }}
                >
                  <X size={13} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Active Category */}
          {selectedCategory !== "All" && (
            <div
              className="mt-4 inline-flex items-center gap-2 rounded-[9px] px-3 py-2 text-[11px] font-semibold"
              style={{
                backgroundColor: colors.orangeSoft,
                color: colors.orangeText,
              }}
            >
              <Filter size={13} />
              {selectedCategory}

              <button
                type="button"
                onClick={() => setSelectedCategory("All")}
              >
                <X size={13} />
              </button>
            </div>
          )}
        </section>

        {/* ================================================= */}
        {/* TOOL DIRECTORY */}
        {/* ================================================= */}

        {filteredRoutes.length > 0 ? (
          <div className="mt-5 space-y-8">
            {groupedRoutes.map((group) => (
              <section key={group.category}>
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="h-6 w-[3px] rounded-full"
                    style={{
                      backgroundColor: colors.orange,
                    }}
                  />

                  <h3 className="text-[15px] font-bold">
                    {group.category}
                  </h3>

                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      backgroundColor: colors.subtle,
                      color: colors.muted,
                    }}
                  >
                    {group.routes.length}
                  </span>

                  <div
                    className="h-px min-w-0 flex-1"
                    style={{
                      backgroundColor: colors.divider,
                    }}
                  />
                </div>

                <div
                  className={cx(
                    "grid gap-3.5 sm:gap-4",
                    layout === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                      : "grid-cols-1 lg:grid-cols-2"
                  )}
                >
                  <AnimatePresence mode="popLayout">
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
                  </AnimatePresence>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div
            className="mt-5 rounded-[18px] border px-5 py-14 text-center"
            style={{
              backgroundColor: colors.panel,
              borderColor: colors.border,
            }}
          >
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-[13px]"
              style={{
                backgroundColor: colors.orangeSoft,
                color: colors.orangeText,
              }}
            >
              <Search size={24} />
            </div>

            <h3 className="mt-5 text-[17px] font-bold">
              No tools found
            </h3>

            <p
              className="mx-auto mt-2 max-w-md text-[13px] leading-7"
              style={{ color: colors.muted }}
            >
              No workspace tools match your current search or
              filter selection. Try a different keyword or
              reset the filters.
            </p>

            <DashboardButton
              colors={colors}
              primary
              className="mt-5"
              onClick={resetFilters}
            >
              <X size={15} />
              Clear Filters
            </DashboardButton>
          </div>
        )}
      </div>
    </main>
  );
}

// Small icon wrapper for section statistics.
function LayersIcon(props) {
  return <LayoutDashboard {...props} />;
}
