// import React, {
//   memo,
//   useCallback,
//   useEffect,
//   useRef,
//   useState,
// } from "react";

// import {
//   ArrowRight,
//   ArrowUpRight,
//   BarChart3,
//   BookOpen,
//   ChevronDown,
//   Code,
//   DollarSign,
//   Edit3,
//   FileText,
//   GraduationCap,
//   LayoutDashboard,
//   LogOut,
//   Mail,
//   Menu,
//   Moon,
//   Sparkles,
//   Sun,
//   User,
//   Users,
//   X,
// } from "lucide-react";

// import {
//   NavLink,
//   useLocation,
//   useNavigate,
// } from "react-router-dom";

// import {
//   useDispatch,
//   useSelector,
// } from "react-redux";

// import { logout } from "../Redux/authSlice";
// import logo from "../utils/target_Trek_logo_2.jpg";

// const THEME_KEY = "theme";
// const THEME_EVENT = "targettrek-theme-change";

// const services = [
//   {
//     slug: "social-media-marketing",
//     title: "Social Media Marketing",
//     icon: Users,
//   },
//   {
//     slug: "content-marketing",
//     title: "Content Marketing",
//     icon: Edit3,
//   },
//   {
//     slug: "affiliate-marketing",
//     title: "Affiliate Marketing",
//     icon: DollarSign,
//   },
//   {
//     slug: "web-development",
//     title: "Web Development",
//     icon: Code,
//   },
//   {
//     slug: "genai-solutions",
//     title: "GenAI Solutions",
//     icon: Sparkles,
//   },
// ];

// /*
//  * ======================================================
//  * NAVBAR ROUTE MODE CONFIGURATION
//  * ======================================================
//  *
//  * Keep your current setup.
//  * While these stay commented, all routes use Learn navbar.
//  */
// const MAIN_EXACT_ROUTES = [
//   // "/",
//   // "/about",
//   // "/contact",
// ];

// const MAIN_ROUTE_PREFIXES = [
//   // "/services",
//   // "/portfolio",
//   // "/affiliate-marketing",
//   // "/carrers",
//   // "/submit-review",
// ];

// const matchesExactRoute = (pathname, routes) =>
//   routes.includes(pathname);

// const routeMatches = (pathname, prefix) =>
//   pathname === prefix ||
//   pathname.startsWith(`${prefix}/`);

// const matchesAnyRoute = (pathname, prefixes) =>
//   prefixes.some((prefix) =>
//     routeMatches(pathname, prefix)
//   );

// const isMainRoute = (pathname) =>
//   matchesExactRoute(
//     pathname,
//     MAIN_EXACT_ROUTES
//   ) ||
//   matchesAnyRoute(
//     pathname,
//     MAIN_ROUTE_PREFIXES
//   );

// const MAIN_SITE_ENTRY =
//   MAIN_EXACT_ROUTES.includes("/")
//     ? "/"
//     : MAIN_EXACT_ROUTES[0] ||
//       MAIN_ROUTE_PREFIXES[0] ||
//       null;

// const HAS_MAIN_SITE =
//   Boolean(MAIN_SITE_ENTRY);

// const getNavbarMode = (pathname) =>
//   isMainRoute(pathname)
//     ? "main"
//     : "learn";

// const readTheme = () => {
//   if (
//     typeof window === "undefined"
//   ) {
//     return "light";
//   }

//   return window.localStorage.getItem(
//     THEME_KEY
//   ) === "dark"
//     ? "dark"
//     : "light";
// };

// const applyThemeToDocument = (
//   theme
// ) => {
//   if (
//     typeof document === "undefined"
//   ) {
//     return;
//   }

//   document.documentElement.classList.toggle(
//     "dark",
//     theme === "dark"
//   );

//   document.documentElement.setAttribute(
//     "data-theme",
//     theme
//   );
// };

// const getColors = (isDark) => ({
//   navBackground: isDark
//     ? "border-slate-800 bg-[#090D14]/95"
//     : "border-slate-200 bg-white/95",

//   drawerBackground: isDark
//     ? "border-slate-800 bg-[#0B1119]"
//     : "border-slate-200 bg-white",

//   primaryText: isDark
//     ? "text-white"
//     : "text-slate-950",

//   secondaryText: isDark
//     ? "text-slate-400"
//     : "text-slate-600",

//   cardBackground: isDark
//     ? "border-slate-700 bg-slate-900"
//     : "border-slate-200 bg-white",
// });

// const desktopLinkClass = (
//   isDark,
//   active
// ) => {
//   if (active) {
//     return isDark
//       ? "bg-blue-950/40 text-blue-300"
//       : "bg-blue-50 text-blue-700";
//   }

//   return isDark
//     ? "text-slate-300 hover:bg-slate-800 hover:text-white"
//     : "text-slate-600 hover:bg-slate-100 hover:text-slate-950";
// };

// const mobileLinkClass = (
//   isDark,
//   active
// ) => {
//   if (active) {
//     return isDark
//       ? "bg-blue-950/40 text-blue-300"
//       : "bg-blue-50 text-blue-700";
//   }

//   return isDark
//     ? "text-slate-300 hover:bg-slate-800"
//     : "text-slate-700 hover:bg-slate-100";
// };

// /* ======================================================
//  * BRAND
//  * ====================================================== */

// const Brand = memo(function Brand({
//   mobile = false,
//   isLearn,
//   isDark,
//   onNavigate,
// }) {
//   const {
//     cardBackground,
//     primaryText,
//   } = getColors(isDark);

//   const destination = isLearn
//     ? "/learn"
//     : "/";

//   return (
//     <button
//       type="button"
//       onClick={() =>
//         onNavigate(destination)
//       }
//       className="
//         flex
//         shrink-0
//         touch-manipulation
//         items-center
//         gap-2.5
//       "
//       aria-label={
//         isLearn
//           ? "Go to TargetTrek Learn home"
//           : "Go to TargetTrek home"
//       }
//     >
//       <div
//         className={`
//           overflow-hidden
//           rounded-xl
//           border
//           ${!isLearn ? "shadow-sm" : ""}
//           ${cardBackground}
//           ${
//             mobile
//               ? "h-9 w-9"
//               : "h-10 w-10"
//           }
//         `}
//       >
//         <img
//           src={logo}
//           alt={
//             isLearn
//               ? "TargetTrek Learn"
//               : "TargetTrek"
//           }
//           className="
//             h-full
//             w-full
//             object-cover
//           "
//           loading="eager"
//           decoding="async"
//         />
//       </div>

//       {isLearn ? (
//         <div
//           className={`
//             relative
//             pb-1
//             font-extrabold
//             leading-none
//             tracking-tight
//             ${primaryText}
//             ${
//               mobile
//                 ? "text-lg"
//                 : "text-xl"
//             }
//           `}
//         >
//           Target
//           <span className="text-blue-500">
//             Trek
//           </span>

//           <span
//             className="
//               absolute
//               -bottom-2
//               right-0
//               text-[8px]
//               font-black
//               uppercase
//               tracking-[0.18em]
//               text-blue-500
//             "
//           >
//             Learn
//           </span>
//         </div>
//       ) : (
//         <span
//           className={`
//             font-extrabold
//             tracking-tight
//             ${primaryText}
//             ${
//               mobile
//                 ? "text-lg"
//                 : "text-xl"
//             }
//           `}
//         >
//           Target
//           <span className="text-blue-500">
//             Trek
//           </span>
//         </span>
//       )}
//     </button>
//   );
// });

// /* ======================================================
//  * THEME BUTTON
//  * ====================================================== */

// const ThemeButton = memo(
//   function ThemeButton({
//     isLearn,
//     isDark,
//     onToggle,
//   }) {
//     if (!isLearn) {
//       return null;
//     }

//     return (
//       <button
//         type="button"
//         onClick={onToggle}
//         aria-label={
//           isDark
//             ? "Switch to light mode"
//             : "Switch to dark mode"
//         }
//         className={`
//           flex
//           h-10
//           w-10
//           shrink-0
//           touch-manipulation
//           items-center
//           justify-center
//           rounded-xl
//           border
//           transition-colors
//           duration-150
//           ${
//             isDark
//               ? "border-slate-700 bg-slate-900 text-yellow-400 hover:bg-slate-800"
//               : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
//           }
//         `}
//       >
//         {isDark ? (
//           <Sun size={18} />
//         ) : (
//           <Moon size={18} />
//         )}
//       </button>
//     );
//   }
// );

// /* ======================================================
//  * DESKTOP PROFILE
//  * State is LOCAL so Navbar does not rerender.
//  * ====================================================== */

// const DesktopProfile = memo(
//   function DesktopProfile({
//     user,
//     isAuthenticated,
//     isAdmin,
//     isDark,
//     onNavigate,
//     onLogout,
//   }) {
//     const [
//       profileOpen,
//       setProfileOpen,
//     ] = useState(false);

//     const profileRef =
//       useRef(null);

//     useEffect(() => {
//       if (!profileOpen) {
//         return undefined;
//       }

//       const handleOutsideClick = (
//         event
//       ) => {
//         if (
//           profileRef.current &&
//           !profileRef.current.contains(
//             event.target
//           )
//         ) {
//           setProfileOpen(false);
//         }
//       };

//       document.addEventListener(
//         "pointerdown",
//         handleOutsideClick
//       );

//       return () => {
//         document.removeEventListener(
//           "pointerdown",
//           handleOutsideClick
//         );
//       };
//     }, [profileOpen]);

//     if (!isAuthenticated) {
//       return null;
//     }

//     const {
//       cardBackground,
//       primaryText,
//       secondaryText,
//     } = getColors(isDark);

//     const userInitial =
//       user?.name
//         ?.trim()
//         ?.charAt(0)
//         ?.toUpperCase() || "U";

//     const navigateAndClose = (
//       path
//     ) => {
//       setProfileOpen(false);
//       onNavigate(path);
//     };

//     const logoutAndClose = () => {
//       setProfileOpen(false);
//       onLogout();
//     };

//     return (
//       <div
//         ref={profileRef}
//         className="relative"
//       >
//         <button
//           type="button"
//           onClick={() =>
//             setProfileOpen(
//               (previous) => !previous
//             )
//           }
//           aria-label="Open profile menu"
//           aria-expanded={profileOpen}
//           className={`
//             flex
//             h-10
//             w-10
//             items-center
//             justify-center
//             rounded-full
//             border
//             text-sm
//             font-black
//             transition-colors
//             duration-150
//             ${
//               isDark
//                 ? "border-slate-700 bg-slate-900 text-blue-300 hover:border-blue-700"
//                 : "border-slate-200 bg-slate-100 text-blue-700 hover:border-blue-300"
//             }
//           `}
//         >
//           {userInitial}
//         </button>

//         {profileOpen && (
//           <div
//             className={`
//               absolute
//               right-0
//               top-full
//               mt-3
//               w-72
//               overflow-hidden
//               rounded-2xl
//               border
//               p-2
//               shadow-xl
//               ${cardBackground}
//             `}
//           >
//             <div
//               className={`
//                 rounded-xl
//                 p-3
//                 ${
//                   isDark
//                     ? "bg-slate-800"
//                     : "bg-slate-50"
//                 }
//               `}
//             >
//               <div className="flex items-center gap-3">
//                 <div
//                   className="
//                     flex
//                     h-10
//                     w-10
//                     shrink-0
//                     items-center
//                     justify-center
//                     rounded-full
//                     bg-blue-600
//                     font-black
//                     text-white
//                   "
//                 >
//                   {userInitial}
//                 </div>

//                 <div className="min-w-0">
//                   <p
//                     className={`
//                       truncate
//                       text-sm
//                       font-black
//                       ${primaryText}
//                     `}
//                   >
//                     {user?.name ||
//                       "User"}
//                   </p>

//                   <p
//                     className={`
//                       mt-0.5
//                       truncate
//                       text-xs
//                       ${secondaryText}
//                     `}
//                   >
//                     {user?.email}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <button
//               type="button"
//               onClick={() =>
//                 navigateAndClose(
//                   "/profile"
//                 )
//               }
//               className={`
//                 mt-2
//                 flex
//                 w-full
//                 items-center
//                 gap-3
//                 rounded-xl
//                 px-3
//                 py-2.5
//                 text-left
//                 text-sm
//                 font-semibold
//                 ${secondaryText}
//                 ${
//                   isDark
//                     ? "hover:bg-slate-800"
//                     : "hover:bg-slate-100"
//                 }
//               `}
//             >
//               <User size={17} />
//               Profile
//             </button>

//             {isAdmin && (
//               <>
//                 <button
//                   type="button"
//                   onClick={() =>
//                     navigateAndClose(
//                       "/dashboard"
//                     )
//                   }
//                   className={`
//                     flex
//                     w-full
//                     items-center
//                     gap-3
//                     rounded-xl
//                     px-3
//                     py-2.5
//                     text-left
//                     text-sm
//                     font-semibold
//                     ${secondaryText}
//                     ${
//                       isDark
//                         ? "hover:bg-slate-800"
//                         : "hover:bg-slate-100"
//                     }
//                   `}
//                 >
//                   <LayoutDashboard
//                     size={17}
//                   />
//                   Dashboard
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     navigateAndClose(
//                       "/admin/book/analytics"
//                     )
//                   }
//                   className={`
//                     flex
//                     w-full
//                     items-center
//                     gap-3
//                     rounded-xl
//                     px-3
//                     py-2.5
//                     text-left
//                     text-sm
//                     font-semibold
//                     ${secondaryText}
//                     ${
//                       isDark
//                         ? "hover:bg-slate-800"
//                         : "hover:bg-slate-100"
//                     }
//                   `}
//                 >
//                   <BarChart3
//                     size={17}
//                   />
//                   Analytics
//                 </button>
//               </>
//             )}

//             <div
//               className={`
//                 my-2
//                 border-t
//                 ${
//                   isDark
//                     ? "border-slate-800"
//                     : "border-slate-200"
//                 }
//               `}
//             />

//             <button
//               type="button"
//               onClick={logoutAndClose}
//               className={`
//                 flex
//                 w-full
//                 items-center
//                 gap-3
//                 rounded-xl
//                 px-3
//                 py-2.5
//                 text-left
//                 text-sm
//                 font-semibold
//                 text-red-500
//                 ${
//                   isDark
//                     ? "hover:bg-red-950/30"
//                     : "hover:bg-red-50"
//                 }
//               `}
//             >
//               <LogOut size={17} />
//               Logout
//             </button>
//           </div>
//         )}
//       </div>
//     );
//   }
// );

// /* ======================================================
//  * MAIN DESKTOP NAVIGATION
//  * Services state is LOCAL.
//  * ====================================================== */

// const MainDesktopNavigation = memo(
//   function MainDesktopNavigation({
//     pathname,
//     isDark,
//     isAdmin,
//     user,
//     isAuthenticated,
//     onNavigate,
//     onLogout,
//   }) {
//     const [
//       servicesOpen,
//       setServicesOpen,
//     ] = useState(false);

//     const servicesTimeoutRef =
//       useRef(null);

//     useEffect(() => {
//       return () => {
//         if (
//           servicesTimeoutRef.current
//         ) {
//           clearTimeout(
//             servicesTimeoutRef.current
//           );
//         }
//       };
//     }, []);

//     const handleServicesEnter =
//       () => {
//         clearTimeout(
//           servicesTimeoutRef.current
//         );
//         setServicesOpen(true);
//       };

//     const handleServicesLeave =
//       () => {
//         servicesTimeoutRef.current =
//           setTimeout(() => {
//             setServicesOpen(false);
//           }, 120);
//       };

//     const {
//       cardBackground,
//     } = getColors(isDark);

//     const isActive = (path) =>
//       routeMatches(
//         pathname,
//         path
//       );

//     return (
//       <>
//         <div className="hidden flex-1 items-center justify-center gap-1 xl:flex">
//           <NavLink
//             to="/about"
//             className={`
//               rounded-lg
//               px-4
//               py-2
//               text-sm
//               font-semibold
//               transition-colors
//               duration-150
//               ${desktopLinkClass(
//                 isDark,
//                 isActive("/about")
//               )}
//             `}
//           >
//             About
//           </NavLink>

//           <div
//             className="relative"
//             onMouseEnter={
//               handleServicesEnter
//             }
//             onMouseLeave={
//               handleServicesLeave
//             }
//           >
//             <NavLink
//               to="/services"
//               className={`
//                 flex
//                 items-center
//                 gap-1.5
//                 rounded-lg
//                 px-4
//                 py-2
//                 text-sm
//                 font-semibold
//                 transition-colors
//                 duration-150
//                 ${desktopLinkClass(
//                   isDark,
//                   isActive("/services")
//                 )}
//               `}
//             >
//               Services

//               <ChevronDown
//                 size={15}
//                 className={`
//                   transition-transform
//                   duration-150
//                   ${
//                     servicesOpen
//                       ? "rotate-180"
//                       : ""
//                   }
//                 `}
//               />
//             </NavLink>

//             {servicesOpen && (
//               <div
//                 className={`
//                   absolute
//                   left-1/2
//                   top-full
//                   mt-2
//                   w-80
//                   -translate-x-1/2
//                   rounded-2xl
//                   border
//                   p-2
//                   shadow-xl
//                   ${cardBackground}
//                 `}
//               >
//                 <p
//                   className="
//                     px-3
//                     pb-2
//                     pt-2
//                     text-[10px]
//                     font-black
//                     uppercase
//                     tracking-[0.15em]
//                     text-slate-400
//                   "
//                 >
//                   Services
//                 </p>

//                 {services.map(
//                   (service) => {
//                     const Icon =
//                       service.icon;

//                     return (
//                       <NavLink
//                         key={
//                           service.slug
//                         }
//                         to={`/services/${service.slug}`}
//                         className={`
//                           flex
//                           items-center
//                           gap-3
//                           rounded-xl
//                           px-3
//                           py-3
//                           text-sm
//                           font-semibold
//                           transition-colors
//                           duration-150
//                           ${
//                             isDark
//                               ? "text-slate-300 hover:bg-slate-800 hover:text-white"
//                               : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
//                           }
//                         `}
//                       >
//                         <div
//                           className={`
//                             flex
//                             h-8
//                             w-8
//                             items-center
//                             justify-center
//                             rounded-lg
//                             ${
//                               isDark
//                                 ? "bg-slate-800"
//                                 : "bg-slate-100"
//                             }
//                           `}
//                         >
//                           <Icon
//                             size={16}
//                           />
//                         </div>

//                         {
//                           service.title
//                         }
//                       </NavLink>
//                     );
//                   }
//                 )}
//               </div>
//             )}
//           </div>

//           <button
//             type="button"
//             onClick={() =>
//               onNavigate("/learn")
//             }
//             className={`
//               flex
//               items-center
//               gap-2
//               rounded-lg
//               px-4
//               py-2
//               text-sm
//               font-semibold
//               transition-colors
//               duration-150
//               ${desktopLinkClass(
//                 isDark,
//                 false
//               )}
//             `}
//           >
//             <GraduationCap
//               size={16}
//             />
//             Learn
//           </button>
//         </div>

//         <div className="hidden items-center gap-1 xl:flex">
//           <NavLink
//             to="/contact"
//             className={`
//               rounded-lg
//               px-3
//               py-2
//               text-sm
//               font-semibold
//               transition-colors
//               duration-150
//               ${desktopLinkClass(
//                 isDark,
//                 isActive("/contact")
//               )}
//             `}
//           >
//             Contact
//           </NavLink>

//           {isAdmin && (
//             <>
//               <button
//                 type="button"
//                 onClick={() =>
//                   onNavigate(
//                     "/dashboard"
//                   )
//                 }
//                 className={`
//                   rounded-lg
//                   px-3
//                   py-2
//                   text-sm
//                   font-semibold
//                   transition-colors
//                   duration-150
//                   ${desktopLinkClass(
//                     isDark,
//                     pathname ===
//                       "/dashboard"
//                   )}
//                 `}
//               >
//                 Dashboard
//               </button>

//               <button
//                 type="button"
//                 onClick={() =>
//                   onNavigate(
//                     "/admin/book/analytics"
//                   )
//                 }
//                 className={`
//                   rounded-lg
//                   px-3
//                   py-2
//                   text-sm
//                   font-semibold
//                   transition-colors
//                   duration-150
//                   ${desktopLinkClass(
//                     isDark,
//                     pathname.startsWith(
//                       "/admin/book/analytics"
//                     )
//                   )}
//                 `}
//               >
//                 Analytics
//               </button>
//             </>
//           )}

//           <DesktopProfile
//             user={user}
//             isAuthenticated={
//               isAuthenticated
//             }
//             isAdmin={isAdmin}
//             isDark={isDark}
//             onNavigate={onNavigate}
//             onLogout={onLogout}
//           />
//         </div>
//       </>
//     );
//   }
// );

// /* ======================================================
//  * LEARN DESKTOP NAVIGATION
//  * ====================================================== */

// const LearnDesktopNavigation = memo(
//   function LearnDesktopNavigation({
//     pathname,
//     isDark,
//     isAdmin,
//     user,
//     isAuthenticated,
//     onNavigate,
//     onLogout,
//     onToggleTheme,
//   }) {
//     const isActive = (path) =>
//       routeMatches(
//         pathname,
//         path
//       );

//     const booksActive =
//       isActive("/books") ||
//       isActive("/book") ||
//       isActive("/ebook");

//     const interviewsActive =
//       isActive("/interviews") ||
//       isActive("/interview");

//     const resourcesActive =
//       isActive("/resources") ||
//       isActive("/resource");

//     const blogsActive =
//       isActive("/blogs") ||
//       isActive("/blog");

//     const aboutActive =
//       isActive("/about");

//     const contactActive =
//       isActive("/contact");

//     return (
//       <>
//         <div className="hidden flex-1 items-center justify-center gap-1 xl:flex">
//           <NavLink
//             to="/books"
//             className={`
//               rounded-lg
//               px-4
//               py-2
//               text-sm
//               font-semibold
//               transition-colors
//               duration-150
//               ${desktopLinkClass(
//                 isDark,
//                 booksActive
//               )}
//             `}
//           >
//             Books
//           </NavLink>

//           <NavLink
//             to="/interviews"
//             className={`
//               rounded-lg
//               px-4
//               py-2
//               text-sm
//               font-semibold
//               transition-colors
//               duration-150
//               ${desktopLinkClass(
//                 isDark,
//                 interviewsActive
//               )}
//             `}
//           >
//             Interviews
//           </NavLink>

//           <NavLink
//             to="/resources"
//             className={`
//               rounded-lg
//               px-4
//               py-2
//               text-sm
//               font-semibold
//               transition-colors
//               duration-150
//               ${desktopLinkClass(
//                 isDark,
//                 resourcesActive
//               )}
//             `}
//           >
//             Resources
//           </NavLink>

//           <NavLink
//             to="/blogs"
//             className={`
//               rounded-lg
//               px-4
//               py-2
//               text-sm
//               font-semibold
//               transition-colors
//               duration-150
//               ${desktopLinkClass(
//                 isDark,
//                 blogsActive
//               )}
//             `}
//           >
//             Blogs
//           </NavLink>

//           <NavLink
//             to="/about"
//             className={`
//               rounded-lg
//               px-4
//               py-2
//               text-sm
//               font-semibold
//               transition-colors
//               duration-150
//               ${desktopLinkClass(
//                 isDark,
//                 aboutActive
//               )}
//             `}
//           >
//             About Us
//           </NavLink>
//         </div>

//         <div className="hidden items-center gap-1 xl:flex">
//           <NavLink
//             to="/contact"
//             className={`
//               rounded-lg
//               px-3
//               py-2
//               text-sm
//               font-semibold
//               transition-colors
//               duration-150
//               ${desktopLinkClass(
//                 isDark,
//                 contactActive
//               )}
//             `}
//           >
//             Contact Us
//           </NavLink>

//           {isAdmin && (
//             <>
//               <button
//                 type="button"
//                 onClick={() =>
//                   onNavigate(
//                     "/dashboard"
//                   )
//                 }
//                 className={`
//                   rounded-lg
//                   px-3
//                   py-2
//                   text-sm
//                   font-semibold
//                   transition-colors
//                   duration-150
//                   ${desktopLinkClass(
//                     isDark,
//                     pathname ===
//                       "/dashboard"
//                   )}
//                 `}
//               >
//                 Dashboard
//               </button>

//               <button
//                 type="button"
//                 onClick={() =>
//                   onNavigate(
//                     "/admin/book/analytics"
//                   )
//                 }
//                 className={`
//                   rounded-lg
//                   px-3
//                   py-2
//                   text-sm
//                   font-semibold
//                   transition-colors
//                   duration-150
//                   ${desktopLinkClass(
//                     isDark,
//                     pathname.startsWith(
//                       "/admin/book/analytics"
//                     )
//                   )}
//                 `}
//               >
//                 Analytics
//               </button>
//             </>
//           )}

//           <div className="ml-1">
//             <ThemeButton
//               isLearn
//               isDark={isDark}
//               onToggle={
//                 onToggleTheme
//               }
//             />
//           </div>

//           <DesktopProfile
//             user={user}
//             isAuthenticated={
//               isAuthenticated
//             }
//             isAdmin={isAdmin}
//             isDark={isDark}
//             onNavigate={onNavigate}
//             onLogout={onLogout}
//           />
//         </div>
//       </>
//     );
//   }
// );

// /* ======================================================
//  * MOBILE TOP BAR
//  * ====================================================== */

// const MobileTopBar = memo(
//   function MobileTopBar({
//     isLearn,
//     isDark,
//     onOpen,
//     onNavigate,
//     onToggleTheme,
//   }) {
//     const {
//       cardBackground,
//       primaryText,
//     } = getColors(isDark);

//     return (
//       <div
//         className="
//           grid
//           h-16
//           grid-cols-[40px_1fr_40px]
//           items-center
//           gap-3
//           xl:hidden
//         "
//       >
//         <button
//           type="button"
//           onClick={onOpen}
//           aria-label="Open menu"
//           className={`
//             flex
//             h-10
//             w-10
//             touch-manipulation
//             items-center
//             justify-center
//             rounded-xl
//             border
//             ${cardBackground}
//             ${primaryText}
//           `}
//         >
//           <Menu size={20} />
//         </button>

//         <div className="flex justify-center">
//           <Brand
//             mobile
//             isLearn={isLearn}
//             isDark={isDark}
//             onNavigate={
//               onNavigate
//             }
//           />
//         </div>

//         {isLearn ? (
//           <ThemeButton
//             isLearn
//             isDark={isDark}
//             onToggle={
//               onToggleTheme
//             }
//           />
//         ) : (
//           <div
//             className="h-10 w-10"
//             aria-hidden="true"
//           />
//         )}
//       </div>
//     );
//   }
// );

// /* ======================================================
//  * MAIN MOBILE NAVIGATION
//  * Services state is LOCAL.
//  * ====================================================== */

// const MainMobileNavigation = memo(
//   function MainMobileNavigation({
//     pathname,
//     isDark,
//     onNavigate,
//     onClose,
//   }) {
//     const [
//       servicesOpen,
//       setServicesOpen,
//     ] = useState(false);

//     const isActive = (path) =>
//       routeMatches(
//         pathname,
//         path
//       );

//     const handleNavigate = (
//       path
//     ) => {
//       onClose();
//       onNavigate(path);
//     };

//     return (
//       <div className="space-y-1">
//         <NavLink
//           to="/about"
//           onClick={onClose}
//           className={`
//             block
//             rounded-xl
//             px-4
//             py-3
//             text-sm
//             font-semibold
//             ${mobileLinkClass(
//               isDark,
//               isActive("/about")
//             )}
//           `}
//         >
//           About
//         </NavLink>

//         <div>
//           <button
//             type="button"
//             onClick={() =>
//               setServicesOpen(
//                 (previous) =>
//                   !previous
//               )
//             }
//             aria-expanded={
//               servicesOpen
//             }
//             className={`
//               flex
//               w-full
//               items-center
//               justify-between
//               rounded-xl
//               px-4
//               py-3
//               text-sm
//               font-semibold
//               ${mobileLinkClass(
//                 isDark,
//                 isActive(
//                   "/services"
//                 )
//               )}
//             `}
//           >
//             Services

//             <ChevronDown
//               size={17}
//               className={`
//                 transition-transform
//                 duration-150
//                 ${
//                   servicesOpen
//                     ? "rotate-180"
//                     : ""
//                 }
//               `}
//             />
//           </button>

//           {servicesOpen && (
//             <div
//               className={`
//                 ml-4
//                 mt-1
//                 space-y-1
//                 border-l
//                 pl-3
//                 ${
//                   isDark
//                     ? "border-slate-800"
//                     : "border-slate-200"
//                 }
//               `}
//             >
//               <NavLink
//                 to="/services"
//                 onClick={onClose}
//                 className="
//                   block
//                   rounded-lg
//                   px-3
//                   py-2
//                   text-xs
//                   font-black
//                   text-blue-500
//                 "
//               >
//                 All Services
//               </NavLink>

//               {services.map(
//                 (service) => {
//                   const Icon =
//                     service.icon;

//                   return (
//                     <NavLink
//                       key={
//                         service.slug
//                       }
//                       to={`/services/${service.slug}`}
//                       onClick={
//                         onClose
//                       }
//                       className={`
//                         flex
//                         items-center
//                         gap-3
//                         rounded-lg
//                         px-3
//                         py-2.5
//                         text-xs
//                         font-semibold
//                         ${
//                           isDark
//                             ? "text-slate-300 hover:bg-slate-800"
//                             : "text-slate-600 hover:bg-slate-100"
//                         }
//                       `}
//                     >
//                       <Icon
//                         size={15}
//                       />
//                       {
//                         service.title
//                       }
//                     </NavLink>
//                   );
//                 }
//               )}
//             </div>
//           )}
//         </div>

//         <button
//           type="button"
//           onClick={() =>
//             handleNavigate(
//               "/learn"
//             )
//           }
//           className={`
//             flex
//             w-full
//             items-center
//             justify-between
//             rounded-xl
//             px-4
//             py-3
//             text-sm
//             font-semibold
//             ${mobileLinkClass(
//               isDark,
//               false
//             )}
//           `}
//         >
//           <span className="flex items-center gap-3">
//             <GraduationCap
//               size={18}
//             />
//             Learn
//           </span>

//           <ArrowUpRight
//             size={16}
//           />
//         </button>

//         <NavLink
//           to="/contact"
//           onClick={onClose}
//           className={`
//             block
//             rounded-xl
//             px-4
//             py-3
//             text-sm
//             font-semibold
//             ${mobileLinkClass(
//               isDark,
//               isActive("/contact")
//             )}
//           `}
//         >
//           Contact
//         </NavLink>
//       </div>
//     );
//   }
// );

// /* ======================================================
//  * LEARN MOBILE NAVIGATION
//  * ====================================================== */

// const LearnMobileNavigation = memo(
//   function LearnMobileNavigation({
//     pathname,
//     isDark,
//     onClose,
//   }) {
//     const isActive = (path) =>
//       routeMatches(
//         pathname,
//         path
//       );

//     const booksActive =
//       isActive("/books") ||
//       isActive("/book") ||
//       isActive("/ebook");

//     const interviewsActive =
//       isActive("/interviews") ||
//       isActive("/interview");

//     const resourcesActive =
//       isActive("/resources") ||
//       isActive("/resource");

//     const blogsActive =
//       isActive("/blogs") ||
//       isActive("/blog");

//     const learnHomeActive =
//       pathname === "/" ||
//       pathname === "/learn";

//     const aboutActive =
//       isActive("/about");

//     const contactActive =
//       isActive("/contact");

//     const links = [
//       {
//         to: "/learn",
//         label: "Learn Home",
//         icon: GraduationCap,
//         active: learnHomeActive,
//       },
//       {
//         to: "/books",
//         label: "Books",
//         icon: BookOpen,
//         active: booksActive,
//       },
//       {
//         to: "/interviews",
//         label: "Interviews",
//         icon: Users,
//         active:
//           interviewsActive,
//       },
//       {
//         to: "/resources",
//         label: "Resources",
//         icon: GraduationCap,
//         active:
//           resourcesActive,
//       },
//       {
//         to: "/blogs",
//         label: "Blogs",
//         icon: FileText,
//         active: blogsActive,
//       },
//     ];

//     return (
//       <div className="space-y-1">
//         {links.map(
//           ({
//             to,
//             label,
//             icon: Icon,
//             active,
//           }) => (
//             <NavLink
//               key={to}
//               to={to}
//               onClick={onClose}
//               className={`
//                 flex
//                 items-center
//                 gap-3
//                 rounded-xl
//                 px-4
//                 py-3
//                 text-sm
//                 font-semibold
//                 ${mobileLinkClass(
//                   isDark,
//                   active
//                 )}
//               `}
//             >
//               <Icon size={18} />
//               {label}
//             </NavLink>
//           )
//         )}

//         <div
//           className={`
//             my-3
//             border-t
//             ${
//               isDark
//                 ? "border-slate-800"
//                 : "border-slate-200"
//             }
//           `}
//         />

//         <NavLink
//           to="/about"
//           onClick={onClose}
//           className={`
//             flex
//             items-center
//             gap-3
//             rounded-xl
//             px-4
//             py-3
//             text-sm
//             font-semibold
//             ${mobileLinkClass(
//               isDark,
//               aboutActive
//             )}
//           `}
//         >
//           <User size={18} />
//           About Us
//         </NavLink>

//         <NavLink
//           to="/contact"
//           onClick={onClose}
//           className={`
//             flex
//             items-center
//             gap-3
//             rounded-xl
//             px-4
//             py-3
//             text-sm
//             font-semibold
//             ${mobileLinkClass(
//               isDark,
//               contactActive
//             )}
//           `}
//         >
//           <Mail size={18} />
//           Contact Us
//         </NavLink>
//       </div>
//     );
//   }
// );

// /* ======================================================
//  * MOBILE ADMIN
//  * ====================================================== */

// const MobileAdmin = memo(
//   function MobileAdmin({
//     pathname,
//     isAdmin,
//     isDark,
//     onNavigate,
//     onClose,
//   }) {
//     if (!isAdmin) {
//       return null;
//     }

//     const handleNavigate = (
//       path
//     ) => {
//       onClose();
//       onNavigate(path);
//     };

//     return (
//       <div
//         className={`
//           mt-6
//           border-t
//           pt-5
//           ${
//             isDark
//               ? "border-slate-800"
//               : "border-slate-200"
//           }
//         `}
//       >
//         <p
//           className={`
//             mb-2
//             px-4
//             text-[10px]
//             font-black
//             uppercase
//             tracking-[0.16em]
//             ${
//               isDark
//                 ? "text-slate-600"
//                 : "text-slate-400"
//             }
//           `}
//         >
//           Administration
//         </p>

//         <button
//           type="button"
//           onClick={() =>
//             handleNavigate(
//               "/dashboard"
//             )
//           }
//           className={`
//             flex
//             w-full
//             items-center
//             gap-3
//             rounded-xl
//             px-4
//             py-3
//             text-sm
//             font-semibold
//             ${mobileLinkClass(
//               isDark,
//               pathname ===
//                 "/dashboard"
//             )}
//           `}
//         >
//           <LayoutDashboard
//             size={18}
//           />
//           Dashboard
//         </button>

//         <button
//           type="button"
//           onClick={() =>
//             handleNavigate(
//               "/admin/book/analytics"
//             )
//           }
//           className={`
//             mt-1
//             flex
//             w-full
//             items-center
//             gap-3
//             rounded-xl
//             px-4
//             py-3
//             text-sm
//             font-semibold
//             ${mobileLinkClass(
//               isDark,
//               pathname.startsWith(
//                 "/admin/book/analytics"
//               )
//             )}
//           `}
//         >
//           <BarChart3 size={18} />
//           Analytics
//         </button>
//       </div>
//     );
//   }
// );

// /* ======================================================
//  * MOBILE PROFILE
//  * ====================================================== */

// const MobileProfile = memo(
//   function MobileProfile({
//     user,
//     isAuthenticated,
//     isLearn,
//     isDark,
//     onNavigate,
//     onLogout,
//     onClose,
//   }) {
//     const {
//       primaryText,
//       secondaryText,
//     } = getColors(isDark);

//     const handleNavigate = (
//       path
//     ) => {
//       onClose();
//       onNavigate(path);
//     };

//     if (!isAuthenticated) {
//       return (
//         <div
//           className={`
//             border-t
//             p-4
//             ${
//               isDark
//                 ? "border-slate-800"
//                 : "border-slate-200"
//             }
//           `}
//         >
//           {isLearn ? (
//             <a
//               href="mailto:supporttargettrek@gmail.com"
//               className={`
//                 flex
//                 items-center
//                 gap-3
//                 rounded-xl
//                 p-3
//                 text-sm
//                 font-semibold
//                 ${
//                   isDark
//                     ? "bg-slate-900 text-slate-300"
//                     : "bg-slate-50 text-slate-700"
//                 }
//               `}
//             >
//               <Mail size={18} />
//               Books & Support
//             </a>
//           ) : (
//             <button
//               type="button"
//               onClick={() =>
//                 handleNavigate(
//                   "/contact"
//                 )
//               }
//               className="
//                 flex
//                 w-full
//                 items-center
//                 justify-center
//                 gap-2
//                 rounded-xl
//                 bg-blue-600
//                 px-4
//                 py-3
//                 text-sm
//                 font-black
//                 text-white
//               "
//             >
//               Contact TargetTrek
//               <ArrowRight
//                 size={16}
//               />
//             </button>
//           )}
//         </div>
//       );
//     }

//     const userInitial =
//       user?.name
//         ?.trim()
//         ?.charAt(0)
//         ?.toUpperCase() || "U";

//     return (
//       <div
//         className={`
//           border-t
//           p-4
//           ${
//             isDark
//               ? "border-slate-800"
//               : "border-slate-200"
//           }
//         `}
//       >
//         <div
//           className={`
//             rounded-2xl
//             border
//             p-4
//             ${
//               isDark
//                 ? "border-slate-700 bg-slate-900"
//                 : "border-slate-200 bg-slate-50"
//             }
//           `}
//         >
//           <div className="flex items-center gap-3">
//             <div
//               className="
//                 flex
//                 h-11
//                 w-11
//                 shrink-0
//                 items-center
//                 justify-center
//                 rounded-full
//                 bg-blue-600
//                 font-black
//                 text-white
//               "
//             >
//               {userInitial}
//             </div>

//             <div className="min-w-0 flex-1">
//               <p
//                 className={`
//                   truncate
//                   text-sm
//                   font-black
//                   ${primaryText}
//                 `}
//               >
//                 {user?.name ||
//                   "User"}
//               </p>

//               <p
//                 className={`
//                   mt-0.5
//                   truncate
//                   text-xs
//                   ${secondaryText}
//                 `}
//               >
//                 {user?.email}
//               </p>

//               {user?.role && (
//                 <p
//                   className="
//                     mt-1
//                     text-[10px]
//                     font-black
//                     uppercase
//                     tracking-wider
//                     text-blue-500
//                   "
//                 >
//                   {user.role}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="mt-4 grid grid-cols-2 gap-2">
//             <button
//               type="button"
//               onClick={() =>
//                 handleNavigate(
//                   "/profile"
//                 )
//               }
//               className={`
//                 rounded-xl
//                 px-3
//                 py-2.5
//                 text-xs
//                 font-bold
//                 ${
//                   isDark
//                     ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
//                     : "bg-white text-slate-700 hover:bg-slate-100"
//                 }
//               `}
//             >
//               Profile
//             </button>

//             <button
//               type="button"
//               onClick={() => {
//                 onClose();
//                 onLogout();
//               }}
//               className={`
//                 flex
//                 items-center
//                 justify-center
//                 gap-2
//                 rounded-xl
//                 px-3
//                 py-2.5
//                 text-xs
//                 font-bold
//                 text-red-500
//                 ${
//                   isDark
//                     ? "bg-red-950/20 hover:bg-red-950/40"
//                     : "bg-red-50 hover:bg-red-100"
//                 }
//               `}
//             >
//               <LogOut size={14} />
//               Logout
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }
// );

// /* ======================================================
//  * MOBILE DRAWER
//  * Only this component needs to rerender when menu opens.
//  * No backdrop blur.
//  * GPU transform.
//  * 200ms animation.
//  * ====================================================== */

// const MobileDrawer = memo(
//   function MobileDrawer({
//     menuOpen,
//     pathname,
//     isLearn,
//     isDark,
//     isAdmin,
//     user,
//     isAuthenticated,
//     onClose,
//     onNavigate,
//     onLogout,
//   }) {
//     const {
//       drawerBackground,
//       secondaryText,
//     } = getColors(isDark);

//     return (
//       <>
//         <div
//           onClick={onClose}
//           aria-hidden="true"
//           className={`
//             fixed
//             inset-0
//             z-[70]
//             bg-black/50
//             transition-opacity
//             duration-150
//             xl:hidden
//             ${
//               menuOpen
//                 ? "pointer-events-auto opacity-100"
//                 : "pointer-events-none opacity-0"
//             }
//           `}
//         />

//         <aside
//           aria-hidden={!menuOpen}
//           className={`
//             fixed
//             inset-y-0
//             left-0
//             z-[80]
//             flex
//             w-[88vw]
//             max-w-[360px]
//             flex-col
//             border-r
//             shadow-xl
//             transform-gpu
//             will-change-transform
//             transition-transform
//             duration-200
//             ease-out
//             xl:hidden
//             ${drawerBackground}
//             ${
//               menuOpen
//                 ? "translate-x-0"
//                 : "-translate-x-full"
//             }
//           `}
//         >
//           <div
//             className={`
//               flex
//               h-16
//               shrink-0
//               items-center
//               justify-between
//               border-b
//               px-4
//               ${
//                 isDark
//                   ? "border-slate-800"
//                   : "border-slate-200"
//               }
//             `}
//           >
//             <Brand
//               mobile
//               isLearn={isLearn}
//               isDark={isDark}
//               onNavigate={
//                 onNavigate
//               }
//             />

//             <button
//               type="button"
//               onClick={onClose}
//               aria-label="Close menu"
//               className={`
//                 flex
//                 h-9
//                 w-9
//                 touch-manipulation
//                 items-center
//                 justify-center
//                 rounded-xl
//                 ${secondaryText}
//                 ${
//                   isDark
//                     ? "hover:bg-slate-800"
//                     : "hover:bg-slate-100"
//                 }
//               `}
//             >
//               <X size={20} />
//             </button>
//           </div>

//           <div
//             className="
//               flex-1
//               overflow-y-auto
//               overscroll-contain
//               px-3
//               py-5
//               [-webkit-overflow-scrolling:touch]
//             "
//           >
//             <p
//               className={`
//                 mb-3
//                 px-4
//                 text-[10px]
//                 font-black
//                 uppercase
//                 tracking-[0.16em]
//                 ${
//                   isDark
//                     ? "text-slate-600"
//                     : "text-slate-400"
//                 }
//               `}
//             >
//               {isLearn
//                 ? "Learning"
//                 : "Navigation"}
//             </p>

//             {isLearn ? (
//               <LearnMobileNavigation
//                 pathname={
//                   pathname
//                 }
//                 isDark={isDark}
//                 onClose={onClose}
//               />
//             ) : (
//               <MainMobileNavigation
//                 pathname={
//                   pathname
//                 }
//                 isDark={isDark}
//                 onNavigate={
//                   onNavigate
//                 }
//                 onClose={onClose}
//               />
//             )}

//             <MobileAdmin
//               pathname={pathname}
//               isAdmin={isAdmin}
//               isDark={isDark}
//               onNavigate={
//                 onNavigate
//               }
//               onClose={onClose}
//             />

//             {(!isLearn ||
//               HAS_MAIN_SITE) && (
//               <div
//                 className={`
//                   mt-6
//                   border-t
//                   pt-5
//                   ${
//                     isDark
//                       ? "border-slate-800"
//                       : "border-slate-200"
//                   }
//                 `}
//               >
//                 {isLearn ? (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       onClose();
//                       onNavigate(
//                         MAIN_SITE_ENTRY
//                       );
//                     }}
//                     className={`
//                       flex
//                       w-full
//                       items-center
//                       justify-between
//                       rounded-xl
//                       px-4
//                       py-3
//                       text-sm
//                       font-semibold
//                       ${mobileLinkClass(
//                         isDark,
//                         false
//                       )}
//                     `}
//                   >
//                     TargetTrek Website
//                     <ArrowUpRight
//                       size={16}
//                     />
//                   </button>
//                 ) : (
//                   <button
//                     type="button"
//                     onClick={() => {
//                       onClose();
//                       onNavigate(
//                         "/learn"
//                       );
//                     }}
//                     className={`
//                       flex
//                       w-full
//                       items-center
//                       justify-between
//                       rounded-xl
//                       px-4
//                       py-3
//                       text-sm
//                       font-bold
//                       ${
//                         isDark
//                           ? "bg-blue-950/40 text-blue-300"
//                           : "bg-blue-50 text-blue-700"
//                       }
//                     `}
//                   >
//                     <span className="flex items-center gap-3">
//                       <GraduationCap
//                         size={18}
//                       />
//                       TargetTrek Learn
//                     </span>

//                     <ArrowRight
//                       size={16}
//                     />
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>

//           <MobileProfile
//             user={user}
//             isAuthenticated={
//               isAuthenticated
//             }
//             isLearn={isLearn}
//             isDark={isDark}
//             onNavigate={
//               onNavigate
//             }
//             onLogout={onLogout}
//             onClose={onClose}
//           />
//         </aside>
//       </>
//     );
//   }
// );

// /* ======================================================
//  * MAIN NAVBAR
//  * Only top-level state:
//  * - menuOpen
//  * - theme
//  * ====================================================== */

// const Navbar = () => {
//   const navigate =
//     useNavigate();

//   const location =
//     useLocation();

//   const dispatch =
//     useDispatch();

//   const {
//     user,
//     isAuthenticated,
//   } = useSelector(
//     (state) => state.auth
//   );

//   const [menuOpen, setMenuOpen] =
//     useState(false);

//   const [theme, setTheme] =
//     useState(() => {
//       if (
//         isMainRoute(
//           location.pathname
//         )
//       ) {
//         return "light";
//       }

//       return readTheme();
//     });

//   const navMode = getNavbarMode(
//     location.pathname
//   );

//   const isLearn =
//     navMode === "learn";

//   const isDark =
//     isLearn &&
//     theme === "dark";

//   const isAdmin =
//     isAuthenticated &&
//     (user?.role === "admin" ||
//       user?.role ===
//         "Employee");

//   const {
//     navBackground,
//   } = getColors(isDark);

//   const closeMenu =
//     useCallback(() => {
//       setMenuOpen(false);
//     }, []);

//   const openMenu =
//     useCallback(() => {
//       setMenuOpen(true);
//     }, []);

//   const goTo =
//     useCallback(
//       (path) => {
//         if (!path) {
//           return;
//         }

//         navigate(path);
//       },
//       [navigate]
//     );

//   const handleLogout =
//     useCallback(() => {
//       dispatch(logout());

//       navigate(
//         isLearn
//           ? "/learn"
//           : "/"
//       );
//     }, [
//       dispatch,
//       navigate,
//       isLearn,
//     ]);

//   const changeTheme =
//     useCallback(
//       (newTheme) => {
//         if (
//           !isLearn ||
//           (newTheme !== "dark" &&
//             newTheme !== "light")
//         ) {
//           return;
//         }

//         setTheme(newTheme);

//         window.localStorage.setItem(
//           THEME_KEY,
//           newTheme
//         );

//         applyThemeToDocument(
//           newTheme
//         );

//         window.dispatchEvent(
//           new CustomEvent(
//             THEME_EVENT,
//             {
//               detail: {
//                 theme: newTheme,
//               },
//             }
//           )
//         );
//       },
//       [isLearn]
//     );

//   const toggleTheme =
//     useCallback(() => {
//       changeTheme(
//         isDark
//           ? "light"
//           : "dark"
//       );
//     }, [
//       changeTheme,
//       isDark,
//     ]);

//   /*
//    * Listen for theme changes from other parts of app.
//    */
//   useEffect(() => {
//     const handleThemeEvent = (
//       event
//     ) => {
//       const currentPath =
//         window.location.pathname;

//       if (
//         isMainRoute(
//           currentPath
//         )
//       ) {
//         setTheme("light");
//         applyThemeToDocument(
//           "light"
//         );
//         return;
//       }

//       const newTheme =
//         event?.detail?.theme;

//       if (
//         newTheme === "dark" ||
//         newTheme === "light"
//       ) {
//         setTheme(newTheme);
//         applyThemeToDocument(
//           newTheme
//         );
//       }
//     };

//     const handleStorage = (
//       event
//     ) => {
//       if (
//         event.key !==
//         THEME_KEY
//       ) {
//         return;
//       }

//       const currentPath =
//         window.location.pathname;

//       if (
//         isMainRoute(
//           currentPath
//         )
//       ) {
//         setTheme("light");
//         applyThemeToDocument(
//           "light"
//         );
//         return;
//       }

//       if (
//         event.newValue ===
//           "dark" ||
//         event.newValue ===
//           "light"
//       ) {
//         setTheme(
//           event.newValue
//         );

//         applyThemeToDocument(
//           event.newValue
//         );
//       }
//     };

//     window.addEventListener(
//       THEME_EVENT,
//       handleThemeEvent
//     );

//     window.addEventListener(
//       "storage",
//       handleStorage
//     );

//     return () => {
//       window.removeEventListener(
//         THEME_EVENT,
//         handleThemeEvent
//       );

//       window.removeEventListener(
//         "storage",
//         handleStorage
//       );
//     };
//   }, []);

//   /*
//    * Apply correct theme when route changes.
//    */
//   useEffect(() => {
//     if (
//       isMainRoute(
//         location.pathname
//       )
//     ) {
//       setTheme("light");

//       applyThemeToDocument(
//         "light"
//       );
//     } else {
//       const storedTheme =
//         readTheme();

//       setTheme(storedTheme);

//       applyThemeToDocument(
//         storedTheme
//       );
//     }

//     setMenuOpen(false);
//   }, [location.pathname]);

//   /*
//    * Lock background scroll while drawer is open.
//    */
//   useEffect(() => {
//     if (!menuOpen) {
//       document.body.style.overflow =
//         "";

//       return undefined;
//     }

//     const previousOverflow =
//       document.body.style.overflow;

//     document.body.style.overflow =
//       "hidden";

//     return () => {
//       document.body.style.overflow =
//         previousOverflow;
//     };
//   }, [menuOpen]);

//   /*
//    * Escape key closes mobile drawer.
//    */
//   useEffect(() => {
//     if (!menuOpen) {
//       return undefined;
//     }

//     const handleKeyDown = (
//       event
//     ) => {
//       if (
//         event.key === "Escape"
//       ) {
//         setMenuOpen(false);
//       }
//     };

//     window.addEventListener(
//       "keydown",
//       handleKeyDown
//     );

//     return () => {
//       window.removeEventListener(
//         "keydown",
//         handleKeyDown
//       );
//     };
//   }, [menuOpen]);

//   return (
//     <>
//       <nav
//         className={`
//           fixed
//           left-0
//           top-0
//           z-50
//           w-full
//           border-b
//           transition-colors
//           duration-200
//           ${navBackground}
//         `}
//       >
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="hidden h-16 items-center xl:flex">
//             <Brand
//               isLearn={isLearn}
//               isDark={isDark}
//               onNavigate={
//                 goTo
//               }
//             />

//             {isLearn ? (
//               <LearnDesktopNavigation
//                 pathname={
//                   location.pathname
//                 }
//                 isDark={isDark}
//                 isAdmin={isAdmin}
//                 user={user}
//                 isAuthenticated={
//                   isAuthenticated
//                 }
//                 onNavigate={
//                   goTo
//                 }
//                 onLogout={
//                   handleLogout
//                 }
//                 onToggleTheme={
//                   toggleTheme
//                 }
//               />
//             ) : (
//               <MainDesktopNavigation
//                 pathname={
//                   location.pathname
//                 }
//                 isDark={isDark}
//                 isAdmin={isAdmin}
//                 user={user}
//                 isAuthenticated={
//                   isAuthenticated
//                 }
//                 onNavigate={
//                   goTo
//                 }
//                 onLogout={
//                   handleLogout
//                 }
//               />
//             )}
//           </div>

//           <MobileTopBar
//             isLearn={isLearn}
//             isDark={isDark}
//             onOpen={openMenu}
//             onNavigate={goTo}
//             onToggleTheme={
//               toggleTheme
//             }
//           />
//         </div>
//       </nav>

//       <MobileDrawer
//         menuOpen={menuOpen}
//         pathname={
//           location.pathname
//         }
//         isLearn={isLearn}
//         isDark={isDark}
//         isAdmin={isAdmin}
//         user={user}
//         isAuthenticated={
//           isAuthenticated
//         }
//         onClose={closeMenu}
//         onNavigate={goTo}
//         onLogout={
//           handleLogout
//         }
//       />
//     </>
//   );
// };

// export default Navbar;

import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CalendarCheck2,
  ChevronDown,
  Code2,
  Contact,
  DollarSign,
  Edit3,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Moon,
  Sparkles,
  Sun,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import { logout } from "../Redux/authSlice";
import logo from "../utils/target_Trek_logo_2.jpg";

/* =====================================================
   TARGET TREK — RESPONSIVE NAVBAR

   Features:
   - Orange brand theme
   - Light and dark mode
   - Mock Interviews CTA
   - Fully responsive desktop navigation
   - Accessible mobile drawer
   - Existing Redux authentication
   - Admin and employee navigation
   - Existing main/learn route modes
   - Theme event compatibility
   - No additional dependencies beyond existing ones
===================================================== */

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const ROUTES = {
  home: "/learn",
  books: "/books",
  interviews: "/interviews",
  mockInterviews: "/mock-interviews",
  resources: "/resources",
  blogs: "/blogs",
  about: "/about",
  contact: "/contact",
  profile: "/profile",
  dashboard: "/dashboard",
  analytics: "/admin/book/analytics",
};

const SERVICES = [
  {
    slug: "social-media-marketing",
    title: "Social Media Marketing",
    icon: Users,
  },
  {
    slug: "content-marketing",
    title: "Content Marketing",
    icon: Edit3,
  },
  {
    slug: "affiliate-marketing",
    title: "Affiliate Marketing",
    icon: DollarSign,
  },
  {
    slug: "web-development",
    title: "Web Development",
    icon: Code2,
  },
  {
    slug: "genai-solutions",
    title: "GenAI Solutions",
    icon: Sparkles,
  },
];

/* =====================================================
   ROUTE MODE

   Keep these commented to use Learn navigation
   across the entire website.

   Uncomment when separate Main-site routes
   are required.
===================================================== */

const MAIN_EXACT_ROUTES = [
  // "/",
  // "/about",
  // "/contact",
];

const MAIN_ROUTE_PREFIXES = [
  // "/services",
  // "/portfolio",
  // "/affiliate-marketing",
];

const routeMatches = (pathname, prefix) =>
  pathname === prefix ||
  pathname.startsWith(`${prefix}/`);

const isMainRoute = (pathname) =>
  MAIN_EXACT_ROUTES.includes(pathname) ||
  MAIN_ROUTE_PREFIXES.some((prefix) =>
    routeMatches(pathname, prefix)
  );

const getNavbarMode = (pathname) =>
  isMainRoute(pathname) ? "main" : "learn";

const MAIN_SITE_ENTRY =
  MAIN_EXACT_ROUTES.includes("/")
    ? "/"
    : MAIN_EXACT_ROUTES[0] ||
      MAIN_ROUTE_PREFIXES[0] ||
      null;

const HAS_MAIN_SITE = Boolean(MAIN_SITE_ENTRY);

/* =====================================================
   THEME
===================================================== */

function readTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.localStorage.getItem(
    THEME_KEY
  ) === "dark"
    ? "dark"
    : "light";
}

function applyThemeToDocument(theme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle(
    "dark",
    theme === "dark"
  );

  document.documentElement.setAttribute(
    "data-theme",
    theme
  );
}

/* =====================================================
   STYLE HELPERS
===================================================== */

const cx = (...values) =>
  values.filter(Boolean).join(" ");

const getPalette = (dark) => ({
  header: dark
    ? "border-[#3b2a20] bg-[#16110f]/95"
    : "border-orange-100 bg-white/95",

  panel: dark
    ? "border-[#443127] bg-[#201813]"
    : "border-orange-100 bg-white",

  surface: dark
    ? "bg-[#2c211b]"
    : "bg-orange-50",

  text: dark
    ? "text-[#fff7ed]"
    : "text-[#29201b]",

  muted: dark
    ? "text-[#b9a79c]"
    : "text-stone-600",

  border: dark
    ? "border-[#443127]"
    : "border-orange-100",

  hover: dark
    ? "hover:bg-[#35261e]"
    : "hover:bg-orange-50",

  active: dark
    ? "bg-orange-500/15 text-orange-300"
    : "bg-orange-50 text-orange-700",

  icon: dark
    ? "text-orange-300"
    : "text-orange-600",
});

function linkStyle(dark, active) {
  const palette = getPalette(dark);

  return cx(
    "inline-flex items-center justify-center",
    "whitespace-nowrap rounded-xl",
    "px-3 py-2.5 text-[13px]",
    "font-semibold transition-colors",
    "duration-150",
    active
      ? palette.active
      : cx(palette.muted, palette.hover)
  );
}

function mobileLinkStyle(dark, active) {
  const palette = getPalette(dark);

  return cx(
    "flex w-full items-center gap-3",
    "rounded-xl px-3.5 py-3",
    "text-sm font-semibold",
    "transition-colors duration-150",
    active
      ? palette.active
      : cx(palette.text, palette.hover)
  );
}

/* =====================================================
   BRAND
===================================================== */

const Brand = memo(function Brand({
  isLearn,
  isDark,
  onNavigate,
  compact = false,
}) {
  const palette = getPalette(isDark);

  return (
    <button
      type="button"
      onClick={() =>
        onNavigate(isLearn ? "/learn" : "/")
      }
      className={cx(
        "group inline-flex shrink-0",
        "items-center gap-2.5",
        "min-w-0 text-left"
      )}
      aria-label="Target Trek home"
    >
      <span
        className={cx(
          "relative flex shrink-0 items-center",
          "justify-center overflow-hidden",
          "rounded-xl border shadow-sm",
          palette.border,
          compact
            ? "h-9 w-9"
            : "h-10 w-10"
        )}
      >
        <img
          src={logo}
          alt="Target Trek logo"
          className="h-full w-full object-cover"
          loading="eager"
        />
      </span>

      <span
        className={cx(
          "flex min-w-0 flex-col",
          "leading-none",
          palette.text
        )}
      >
        <span
          className={cx(
            "whitespace-nowrap font-extrabold",
            "tracking-[-0.06em]",
            compact
              ? "text-[19px]"
              : "text-[21px]"
          )}
        >
          Target
          <span className="text-orange-600">
            Trek
          </span>
        </span>

        {isLearn && (
          <span
            className={cx(
              "mt-1.5 self-end text-[9px]",
              "font-extrabold uppercase",
              "tracking-[0.23em]",
              isDark
                ? "text-orange-300"
                : "text-orange-600"
            )}
          >
            Learn
          </span>
        )}
      </span>
    </button>
  );
});

/* =====================================================
   THEME TOGGLE
===================================================== */

const ThemeToggle = memo(function ThemeToggle({
  isDark,
  onToggle,
}) {
  const palette = getPalette(isDark);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={
        isDark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      title={
        isDark ? "Light mode" : "Dark mode"
      }
      className={cx(
        "inline-flex h-10 w-10",
        "shrink-0 items-center justify-center",
        "rounded-xl border transition-colors",
        palette.panel,
        palette.muted,
        palette.hover
      )}
    >
      {isDark ? (
        <Sun size={19} className="text-orange-300" />
      ) : (
        <Moon size={19} />
      )}
    </button>
  );
});

/* =====================================================
   MOCK INTERVIEWS CTA

   Prominent on desktop.
   Shown in the mobile top bar where space allows.
===================================================== */

const MockInterviewCTA = memo(
  function MockInterviewCTA({
    isDark,
    active,
    compact = false,
    onClick,
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cx(
          "group inline-flex shrink-0",
          "items-center justify-center",
          "gap-2 rounded-xl",
          "bg-orange-600 text-white",
          "font-bold shadow-sm",
          "shadow-orange-600/20",
          "transition-all duration-150",
          "hover:bg-orange-700",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-orange-400",
          "focus-visible:ring-offset-2",
          compact
            ? "px-3 py-2.5 text-xs"
            : "px-4 py-2.5 text-[13px]",
          active &&
            "ring-2 ring-orange-300/70",
          isDark &&
            "ring-offset-[#16110f]"
        )}
      >
        <CalendarCheck2
          size={compact ? 16 : 17}
        />

        <span className="whitespace-nowrap">
          Mock Interviews
        </span>

        {!compact && (
          <ArrowUpRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        )}
      </button>
    );
  }
);

/* =====================================================
   PROFILE DROPDOWN
===================================================== */

const DesktopProfile = memo(
  function DesktopProfile({
    user,
    isAuthenticated,
    isAdmin,
    isDark,
    onNavigate,
    onLogout,
  }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);
    const palette = getPalette(isDark);

    useEffect(() => {
      if (!open) return undefined;

      const onPointerDown = (event) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(
            event.target
          )
        ) {
          setOpen(false);
        }
      };

      const onKeyDown = (event) => {
        if (event.key === "Escape") {
          setOpen(false);
        }
      };

      document.addEventListener(
        "pointerdown",
        onPointerDown
      );

      document.addEventListener(
        "keydown",
        onKeyDown
      );

      return () => {
        document.removeEventListener(
          "pointerdown",
          onPointerDown
        );

        document.removeEventListener(
          "keydown",
          onKeyDown
        );
      };
    }, [open]);

    if (!isAuthenticated) return null;

    const initial =
      user?.name
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() || "U";

    const navigateTo = (path) => {
      setOpen(false);
      onNavigate(path);
    };

    const handleLogout = () => {
      setOpen(false);
      onLogout();
    };

    const menuItem = cx(
      "flex w-full items-center gap-3",
      "rounded-xl px-3 py-2.5",
      "text-left text-sm font-semibold",
      palette.text,
      palette.hover
    );

    return (
      <div
        ref={containerRef}
        className="relative shrink-0"
      >
        <button
          type="button"
          aria-label="Open profile menu"
          aria-expanded={open}
          onClick={() =>
            setOpen((previous) => !previous)
          }
          className={cx(
            "flex h-10 w-10 items-center",
            "justify-center rounded-full",
            "border text-sm font-extrabold",
            "transition-colors",
            palette.panel,
            palette.icon
          )}
        >
          {initial}
        </button>

        {open && (
          <div
            className={cx(
              "absolute right-0 top-full",
              "z-[90] mt-3 w-[min(290px,90vw)]",
              "rounded-2xl border p-2",
              "shadow-2xl",
              palette.panel
            )}
          >
            <div
              className={cx(
                "rounded-xl p-3",
                palette.surface
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cx(
                    "flex h-10 w-10 shrink-0",
                    "items-center justify-center",
                    "rounded-full bg-orange-600",
                    "font-extrabold text-white"
                  )}
                >
                  {initial}
                </span>

                <div className="min-w-0">
                  <div
                    className={cx(
                      "truncate text-sm font-bold",
                      palette.text
                    )}
                  >
                    {user?.name || "User"}
                  </div>

                  <div
                    className={cx(
                      "mt-1 truncate text-xs",
                      palette.muted
                    )}
                  >
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigateTo(ROUTES.profile)
              }
              className={cx(
                menuItem,
                "mt-2"
              )}
            >
              <UserRound size={17} />
              My Profile
            </button>

            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    navigateTo(
                      ROUTES.dashboard
                    )
                  }
                  className={menuItem}
                >
                  <LayoutDashboard size={17} />
                  Dashboard
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigateTo(
                      ROUTES.analytics
                    )
                  }
                  className={menuItem}
                >
                  <BarChart3 size={17} />
                  Analytics
                </button>
              </>
            )}

            <div
              className={cx(
                "my-2 border-t",
                palette.border
              )}
            />

            <button
              type="button"
              onClick={handleLogout}
              className={cx(
                "flex w-full items-center",
                "gap-3 rounded-xl px-3 py-2.5",
                "text-left text-sm font-semibold",
                "text-red-500",
                isDark
                  ? "hover:bg-red-950/25"
                  : "hover:bg-red-50"
              )}
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        )}
      </div>
    );
  }
);

/* =====================================================
   SERVICES DROPDOWN
===================================================== */

const ServicesDropdown = memo(
  function ServicesDropdown({
    pathname,
    isDark,
    onNavigate,
  }) {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef(null);
    const wrapperRef = useRef(null);

    const palette = getPalette(isDark);

    const active = routeMatches(
      pathname,
      "/services"
    );

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    useEffect(() => {
      setOpen(false);
    }, [pathname]);

    useEffect(() => {
      if (!open) return undefined;

      const handleClickOutside = (event) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(
            event.target
          )
        ) {
          setOpen(false);
        }
      };

      document.addEventListener(
        "pointerdown",
        handleClickOutside
      );

      return () =>
        document.removeEventListener(
          "pointerdown",
          handleClickOutside
        );
    }, [open]);

    const show = () => {
      clearTimeout(timeoutRef.current);
      setOpen(true);
    };

    const hide = () => {
      timeoutRef.current = setTimeout(
        () => setOpen(false),
        120
      );
    };

    return (
      <div
        ref={wrapperRef}
        className="relative"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <button
          type="button"
          aria-expanded={open}
          onClick={() =>
            setOpen((previous) => !previous)
          }
          className={linkStyle(isDark, active)}
        >
          Services
          <ChevronDown
            size={15}
            className={cx(
              "ml-1 transition-transform",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <div
            className={cx(
              "absolute left-1/2 top-full",
              "z-[90] mt-2 w-[310px]",
              "-translate-x-1/2",
              "rounded-2xl border p-2 shadow-xl",
              palette.panel
            )}
          >
            <div
              className={cx(
                "px-3 pb-2 pt-2",
                "text-[10px] font-extrabold",
                "uppercase tracking-[0.18em]",
                palette.muted
              )}
            >
              What we offer
            </div>

            {SERVICES.map((service) => {
              const Icon = service.icon;

              return (
                <button
                  key={service.slug}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onNavigate(
                      `/services/${service.slug}`
                    );
                  }}
                  className={cx(
                    "flex w-full items-center",
                    "gap-3 rounded-xl px-3 py-3",
                    "text-left text-sm font-semibold",
                    palette.text,
                    palette.hover
                  )}
                >
                  <span
                    className={cx(
                      "flex h-9 w-9 shrink-0",
                      "items-center justify-center",
                      "rounded-xl",
                      palette.surface,
                      palette.icon
                    )}
                  >
                    <Icon size={17} />
                  </span>

                  <span>{service.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

/* =====================================================
   DESKTOP NAVIGATION

   CTA appears before normal links on Learn mode.
===================================================== */

const DesktopNavigation = memo(
  function DesktopNavigation({
    pathname,
    isLearn,
    isDark,
    isAdmin,
    user,
    isAuthenticated,
    onNavigate,
    onLogout,
    onToggleTheme,
  }) {
    const active = (path) =>
      routeMatches(pathname, path);

    const booksActive =
      active("/books") ||
      active("/book") ||
      active("/ebook");

    const interviewsActive =
      active("/interviews") ||
      active("/interview");

    const mockActive =
      active(ROUTES.mockInterviews);

    const navItems = isLearn
      ? [
          {
            title: "Books",
            path: ROUTES.books,
            selected: booksActive,
          },
          {
            title: "Interviews",
            path: ROUTES.interviews,
            selected: interviewsActive,
          },
          {
            title: "Resources",
            path: ROUTES.resources,
            selected:
              active("/resources") ||
              active("/resource"),
          },
          {
            title: "Blogs",
            path: ROUTES.blogs,
            selected:
              active("/blogs") ||
              active("/blog"),
          },
          {
            title: "About Us",
            path: ROUTES.about,
            selected: active("/about"),
          },
        ]
      : [
          {
            title: "About",
            path: ROUTES.about,
            selected: active("/about"),
          },
        ];

    return (
      <>
        <div
          className={cx(
            "flex min-w-0 flex-1",
            "items-center justify-center gap-1"
          )}
        >
          {isLearn && (
            <MockInterviewCTA
              isDark={isDark}
              active={mockActive}
              onClick={() =>
                onNavigate(
                  ROUTES.mockInterviews
                )
              }
            />
          )}

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={linkStyle(
                isDark,
                item.selected
              )}
            >
              {item.title}
            </NavLink>
          ))}

          {!isLearn && (
            <>
              <ServicesDropdown
                pathname={pathname}
                isDark={isDark}
                onNavigate={onNavigate}
              />

              <NavLink
                to={ROUTES.home}
                className={linkStyle(
                  isDark,
                  false
                )}
              >
                Learn
              </NavLink>

              <MockInterviewCTA
                isDark={isDark}
                active={mockActive}
                compact
                onClick={() =>
                  onNavigate(
                    ROUTES.mockInterviews
                  )
                }
              />
            </>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <NavLink
            to={ROUTES.contact}
            className={linkStyle(
              isDark,
              active("/contact")
            )}
          >
            Contact
          </NavLink>

          {isAdmin && (
            <button
              type="button"
              onClick={() =>
                onNavigate(
                  ROUTES.dashboard
                )
              }
              className={linkStyle(
                isDark,
                active(
                  ROUTES.dashboard
                )
              )}
            >
              Dashboard
            </button>
          )}

          {isLearn && (
            <ThemeToggle
              isDark={isDark}
              onToggle={onToggleTheme}
            />
          )}

          <DesktopProfile
            user={user}
            isAuthenticated={
              isAuthenticated
            }
            isAdmin={isAdmin}
            isDark={isDark}
            onNavigate={onNavigate}
            onLogout={onLogout}
          />
        </div>
      </>
    );
  }
);

/* =====================================================
   MOBILE HEADER

   Layout:
   - Menu
   - Centered logo
   - Theme toggle

   Mock Interview CTA shown in a second compact
   navigation row, avoiding mobile overflow.
===================================================== */

const MobileHeader = memo(
  function MobileHeader({
    isLearn,
    isDark,
    pathname,
    onOpen,
    onNavigate,
    onToggleTheme,
  }) {
    const palette = getPalette(isDark);

    return (
      <div className="xl:hidden">
        <div
          className={cx(
            "grid h-[64px]",
            "grid-cols-[40px_minmax(0,1fr)_40px]",
            "items-center gap-2"
          )}
        >
          <button
            type="button"
            onClick={onOpen}
            aria-label="Open navigation menu"
            className={cx(
              "flex h-10 w-10",
              "items-center justify-center",
              "rounded-xl border",
              palette.panel,
              palette.text
            )}
          >
            <Menu size={20} />
          </button>

          <div className="flex min-w-0 justify-center">
            <Brand
              isLearn={isLearn}
              isDark={isDark}
              compact
              onNavigate={onNavigate}
            />
          </div>

          {isLearn ? (
            <ThemeToggle
              isDark={isDark}
              onToggle={onToggleTheme}
            />
          ) : (
            <div
              className="h-10 w-10"
              aria-hidden="true"
            />
          )}
        </div>

        <div
          className={cx(
            "flex items-center justify-between",
            "gap-2 border-t py-2",
            palette.border
          )}
        >
          <button
            type="button"
            onClick={() =>
              onNavigate(
                isLearn
                  ? ROUTES.books
                  : ROUTES.home
              )
            }
            className={cx(
              "min-w-0 truncate px-2 py-2",
              "text-xs font-bold",
              palette.muted
            )}
          >
            {isLearn
              ? "Explore Books & Learning"
              : "Explore Target Trek"}
          </button>

          <MockInterviewCTA
            compact
            isDark={isDark}
            active={routeMatches(
              pathname,
              ROUTES.mockInterviews
            )}
            onClick={() =>
              onNavigate(
                ROUTES.mockInterviews
              )
            }
          />
        </div>
      </div>
    );
  }
);

/* =====================================================
   MOBILE DRAWER ITEM
===================================================== */

function DrawerLink({
  to,
  icon: Icon,
  children,
  isDark,
  active,
  onClick,
  trailing,
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={mobileLinkStyle(
        isDark,
        active
      )}
    >
      {Icon && (
        <Icon size={18} className="shrink-0" />
      )}

      <span className="min-w-0 flex-1">
        {children}
      </span>

      {trailing && (
        <ArrowUpRight
          size={15}
          className="shrink-0"
        />
      )}
    </NavLink>
  );
}

/* =====================================================
   MOBILE DRAWER
===================================================== */

const MobileDrawer = memo(
  function MobileDrawer({
    open,
    pathname,
    isLearn,
    isDark,
    isAdmin,
    user,
    isAuthenticated,
    onClose,
    onNavigate,
    onLogout,
  }) {
    const [servicesOpen, setServicesOpen] =
      useState(false);

    const palette = getPalette(isDark);
    const active = (path) =>
      routeMatches(pathname, path);

    const booksActive =
      active("/books") ||
      active("/book") ||
      active("/ebook");

    const interviewsActive =
      active("/interviews") ||
      active("/interview");

    const initial =
      user?.name
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() || "U";

    const navigateAndClose = (path) => {
      onClose();
      onNavigate(path);
    };

    const logoutAndClose = () => {
      onClose();
      onLogout();
    };

    useEffect(() => {
      if (!open) {
        setServicesOpen(false);
      }
    }, [open]);

    return (
      <>
        <div
          className={cx(
            "fixed inset-0 z-[70]",
            "bg-black/55 xl:hidden",
            "transition-opacity duration-200",
            open
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          )}
          onClick={onClose}
          aria-hidden="true"
        />

        <aside
          role="dialog"
          aria-modal={open ? "true" : undefined}
          aria-label="Mobile navigation"
          aria-hidden={!open}
          inert={!open}
          className={cx(
            "fixed inset-y-0 left-0",
            "z-[80] flex w-[88vw]",
            "max-w-[365px] flex-col",
            "border-r shadow-2xl xl:hidden",
            "transition-transform duration-200",
            "ease-out",
            palette.panel,
            open
              ? "translate-x-0"
              : "-translate-x-full"
          )}
        >
          <div
            className={cx(
              "flex h-16 shrink-0 items-center",
              "justify-between border-b px-4",
              palette.border
            )}
          >
            <Brand
              isLearn={isLearn}
              isDark={isDark}
              compact
              onNavigate={navigateAndClose}
            />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className={cx(
                "flex h-10 w-10 items-center",
                "justify-center rounded-xl",
                palette.text,
                palette.hover
              )}
            >
              <X size={21} />
            </button>
          </div>

          <div
            className={cx(
              "flex-1 overflow-y-auto",
              "overscroll-contain px-3 py-4"
            )}
          >
            <div
              className={cx(
                "mb-3 px-3 text-[10px]",
                "font-extrabold uppercase",
                "tracking-[0.18em]",
                palette.muted
              )}
            >
              Quick access
            </div>

            <button
              type="button"
              onClick={() =>
                navigateAndClose(
                  ROUTES.mockInterviews
                )
              }
              className={cx(
                "mb-3 flex w-full items-center",
                "gap-3 rounded-2xl",
                "bg-orange-600 px-4 py-4",
                "text-left text-white",
                "shadow-sm shadow-orange-600/20",
                "transition-colors",
                "hover:bg-orange-700"
              )}
            >
              <span
                className={cx(
                  "flex h-10 w-10 shrink-0",
                  "items-center justify-center",
                  "rounded-xl bg-white/15"
                )}
              >
                <CalendarCheck2 size={21} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold">
                  Mock Interviews
                </span>

                <span className="mt-1 block text-xs text-orange-100">
                  Practice technical interviews
                </span>
              </span>

              <ArrowRight
                size={17}
                className="shrink-0"
              />
            </button>

            {isLearn ? (
              <div className="space-y-1">
                <DrawerLink
                  to={ROUTES.home}
                  icon={GraduationCap}
                  isDark={isDark}
                  active={
                    pathname === "/" ||
                    pathname === "/learn"
                  }
                  onClick={onClose}
                >
                  Learn Home
                </DrawerLink>

                <DrawerLink
                  to={ROUTES.books}
                  icon={BookOpen}
                  isDark={isDark}
                  active={booksActive}
                  onClick={onClose}
                >
                  Books
                </DrawerLink>

                <DrawerLink
                  to={ROUTES.interviews}
                  icon={Users}
                  isDark={isDark}
                  active={interviewsActive}
                  onClick={onClose}
                >
                  Interview Experiences
                </DrawerLink>

                <DrawerLink
                  to={ROUTES.resources}
                  icon={GraduationCap}
                  isDark={isDark}
                  active={
                    active("/resources") ||
                    active("/resource")
                  }
                  onClick={onClose}
                >
                  Resources
                </DrawerLink>

                <DrawerLink
                  to={ROUTES.blogs}
                  icon={FileText}
                  isDark={isDark}
                  active={
                    active("/blogs") ||
                    active("/blog")
                  }
                  onClick={onClose}
                >
                  Blogs
                </DrawerLink>

                <DrawerLink
                  to={ROUTES.about}
                  icon={UserRound}
                  isDark={isDark}
                  active={active("/about")}
                  onClick={onClose}
                >
                  About Us
                </DrawerLink>
              </div>
            ) : (
              <div className="space-y-1">
                <DrawerLink
                  to={ROUTES.about}
                  icon={UserRound}
                  isDark={isDark}
                  active={active("/about")}
                  onClick={onClose}
                >
                  About
                </DrawerLink>

                <button
                  type="button"
                  aria-expanded={servicesOpen}
                  onClick={() =>
                    setServicesOpen(
                      (previous) => !previous
                    )
                  }
                  className={mobileLinkStyle(
                    isDark,
                    active("/services")
                  )}
                >
                  <Sparkles size={18} />
                  <span className="flex-1 text-left">
                    Services
                  </span>
                  <ChevronDown
                    size={17}
                    className={cx(
                      "transition-transform",
                      servicesOpen &&
                        "rotate-180"
                    )}
                  />
                </button>

                {servicesOpen && (
                  <div
                    className={cx(
                      "ml-4 space-y-1 border-l pl-3",
                      palette.border
                    )}
                  >
                    <DrawerLink
                      to="/services"
                      icon={Contact}
                      isDark={isDark}
                      active={
                        pathname === "/services"
                      }
                      onClick={onClose}
                    >
                      All Services
                    </DrawerLink>

                    {SERVICES.map((service) => (
                      <DrawerLink
                        key={service.slug}
                        to={`/services/${service.slug}`}
                        icon={service.icon}
                        isDark={isDark}
                        active={active(
                          `/services/${service.slug}`
                        )}
                        onClick={onClose}
                      >
                        {service.title}
                      </DrawerLink>
                    ))}
                  </div>
                )}

                <DrawerLink
                  to={ROUTES.home}
                  icon={GraduationCap}
                  isDark={isDark}
                  active={active("/learn")}
                  onClick={onClose}
                >
                  Target Trek Learn
                </DrawerLink>
              </div>
            )}

            <div
              className={cx(
                "my-4 border-t",
                palette.border
              )}
            />

            <DrawerLink
              to={ROUTES.contact}
              icon={Mail}
              isDark={isDark}
              active={active("/contact")}
              onClick={onClose}
            >
              Contact Us
            </DrawerLink>

            {isAdmin && (
              <div className="mt-5">
                <div
                  className={cx(
                    "mb-2 px-3 text-[10px]",
                    "font-extrabold uppercase",
                    "tracking-[0.18em]",
                    palette.muted
                  )}
                >
                  Administration
                </div>

                <div className="space-y-1">
                  <DrawerLink
                    to={ROUTES.dashboard}
                    icon={LayoutDashboard}
                    isDark={isDark}
                    active={active(
                      ROUTES.dashboard
                    )}
                    onClick={onClose}
                  >
                    Dashboard
                  </DrawerLink>

                  <DrawerLink
                    to={ROUTES.analytics}
                    icon={BarChart3}
                    isDark={isDark}
                    active={active(
                      ROUTES.analytics
                    )}
                    onClick={onClose}
                  >
                    Analytics
                  </DrawerLink>
                </div>
              </div>
            )}

            {isLearn && HAS_MAIN_SITE && (
              <div
                className={cx(
                  "mt-5 border-t pt-5",
                  palette.border
                )}
              >
                <button
                  type="button"
                  onClick={() =>
                    navigateAndClose(
                      MAIN_SITE_ENTRY
                    )
                  }
                  className={mobileLinkStyle(
                    isDark,
                    false
                  )}
                >
                  <ArrowUpRight size={18} />
                  Main Website
                </button>
              </div>
            )}
          </div>

          <div
            className={cx(
              "shrink-0 border-t p-3",
              palette.border
            )}
          >
            {isAuthenticated ? (
              <div
                className={cx(
                  "rounded-2xl p-3",
                  palette.surface
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cx(
                      "flex h-10 w-10 shrink-0",
                      "items-center justify-center",
                      "rounded-full bg-orange-600",
                      "text-sm font-extrabold",
                      "text-white"
                    )}
                  >
                    {initial}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={cx(
                        "truncate text-sm font-bold",
                        palette.text
                      )}
                    >
                      {user?.name || "User"}
                    </p>

                    <p
                      className={cx(
                        "truncate text-xs",
                        palette.muted
                      )}
                    >
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigateAndClose(
                        ROUTES.profile
                      )
                    }
                    className={cx(
                      "rounded-xl border px-3",
                      "py-2.5 text-xs font-bold",
                      palette.panel,
                      palette.text
                    )}
                  >
                    Profile
                  </button>

                  <button
                    type="button"
                    onClick={logoutAndClose}
                    className={cx(
                      "inline-flex items-center",
                      "justify-center gap-2",
                      "rounded-xl px-3 py-2.5",
                      "text-xs font-bold",
                      "text-red-500",
                      isDark
                        ? "bg-red-950/30"
                        : "bg-red-50"
                    )}
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <a
                href="mailto:supporttargettrek@gmail.com"
                className={cx(
                  "flex items-center gap-3",
                  "rounded-xl px-4 py-3",
                  "text-sm font-semibold",
                  palette.surface,
                  palette.text
                )}
              >
                <Mail
                  size={17}
                  className="text-orange-600"
                />
                Books & Support
              </a>
            )}
          </div>
        </aside>
      </>
    );
  }
);

/* =====================================================
   MAIN NAVBAR
===================================================== */

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const auth = useSelector(
    (state) => state.auth
  );

  const user = auth?.user;
  const isAuthenticated =
    Boolean(auth?.isAuthenticated);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [theme, setTheme] = useState(
    readTheme
  );

  const navMode = getNavbarMode(
    location.pathname
  );

  const isLearn = navMode === "learn";

  const isDark =
    isLearn && theme === "dark";

  const isAdmin =
    isAuthenticated &&
    ["admin", "employee"].includes(
      String(user?.role || "")
        .toLowerCase()
    );

  const palette = getPalette(isDark);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
  }, []);

  const goTo = useCallback(
    (path) => {
      if (!path) return;
      navigate(path);
    },
    [navigate]
  );

  const handleLogout = useCallback(
    () => {
      dispatch(logout());

      navigate(
        isLearn ? "/learn" : "/"
      );
    },
    [dispatch, navigate, isLearn]
  );

  const changeTheme = useCallback(
    (nextTheme) => {
      if (
        !isLearn ||
        !["light", "dark"].includes(
          nextTheme
        )
      ) {
        return;
      }

      setTheme(nextTheme);

      window.localStorage.setItem(
        THEME_KEY,
        nextTheme
      );

      applyThemeToDocument(
        nextTheme
      );

      window.dispatchEvent(
        new CustomEvent(
          THEME_EVENT,
          {
            detail: {
              theme: nextTheme,
            },
          }
        )
      );

      // Compatibility for components
      // already using the "themechange" event.
      window.dispatchEvent(
        new CustomEvent(
          "themechange",
          {
            detail: {
              theme: nextTheme,
            },
          }
        )
      );
    },
    [isLearn]
  );

  const toggleTheme = useCallback(
    () => {
      changeTheme(
        isDark ? "light" : "dark"
      );
    },
    [changeTheme, isDark]
  );

  /* ===============================================
     SYNCHRONIZE THEME WITH APP
  =============================================== */

  useEffect(() => {
    const handleThemeEvent = (event) => {
      const pathname =
        window.location.pathname;

      if (isMainRoute(pathname)) {
        setTheme("light");
        applyThemeToDocument("light");
        return;
      }

      const incoming =
        event?.detail?.theme ||
        readTheme();

      if (
        incoming === "light" ||
        incoming === "dark"
      ) {
        setTheme(incoming);
        applyThemeToDocument(incoming);
      }
    };

    const handleStorage = (event) => {
      if (
        event.key &&
        event.key !== THEME_KEY
      ) {
        return;
      }

      handleThemeEvent({
        detail: {
          theme: readTheme(),
        },
      });
    };

    window.addEventListener(
      THEME_EVENT,
      handleThemeEvent
    );

    window.addEventListener(
      "themechange",
      handleThemeEvent
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        THEME_EVENT,
        handleThemeEvent
      );

      window.removeEventListener(
        "themechange",
        handleThemeEvent
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  /* ===============================================
     ROUTE CHANGES
  =============================================== */

  useEffect(() => {
    const nextTheme = isMainRoute(
      location.pathname
    )
      ? "light"
      : readTheme();

    setTheme(nextTheme);

    applyThemeToDocument(
      nextTheme
    );

    setMenuOpen(false);
  }, [location.pathname]);

  /* ===============================================
     MOBILE DRAWER SCROLL LOCK
  =============================================== */

  useEffect(() => {
    if (!menuOpen) return undefined;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [menuOpen]);

  /* ===============================================
     DESKTOP/MOBILE RESIZE SAFETY
  =============================================== */

  useEffect(() => {
    const media = window.matchMedia(
      "(min-width: 1280px)"
    );

    const handleResize = () => {
      if (media.matches) {
        setMenuOpen(false);
      }
    };

    media.addEventListener(
      "change",
      handleResize
    );

    return () => {
      media.removeEventListener(
        "change",
        handleResize
      );
    };
  }, []);

  return (
    <>
      <nav
        className={cx(
          "fixed inset-x-0 top-0 z-50",
          "w-full border-b",
          "transition-colors duration-200",
          "supports-[backdrop-filter]:backdrop-blur-xl",
          palette.header
        )}
      >
        <div
          className={cx(
            "mx-auto w-full max-w-[1440px]",
            "px-3 sm:px-5 lg:px-6"
          )}
        >
          {/* DESKTOP NAVBAR */}

          <div
            className={cx(
              "hidden h-[76px]",
              "items-center gap-4",
              "xl:flex"
            )}
          >
            <Brand
              isLearn={isLearn}
              isDark={isDark}
              onNavigate={goTo}
            />

            <DesktopNavigation
              pathname={location.pathname}
              isLearn={isLearn}
              isDark={isDark}
              isAdmin={isAdmin}
              user={user}
              isAuthenticated={
                isAuthenticated
              }
              onNavigate={goTo}
              onLogout={handleLogout}
              onToggleTheme={toggleTheme}
            />
          </div>

          {/* MOBILE NAVBAR */}

          <MobileHeader
            isLearn={isLearn}
            isDark={isDark}
            pathname={location.pathname}
            onOpen={openMenu}
            onNavigate={goTo}
            onToggleTheme={toggleTheme}
          />
        </div>
      </nav>

      <MobileDrawer
        open={menuOpen}
        pathname={location.pathname}
        isLearn={isLearn}
        isDark={isDark}
        isAdmin={isAdmin}
        user={user}
        isAuthenticated={
          isAuthenticated
        }
        onClose={closeMenu}
        onNavigate={goTo}
        onLogout={handleLogout}
      />
    </>
  );
}
