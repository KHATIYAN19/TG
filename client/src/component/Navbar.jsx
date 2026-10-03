// import React, { useEffect, useRef, useState } from "react";
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
//   Megaphone,
//   Moon,
//   Sparkles,
//   Sun,
//   User,
//   Users,
//   X,
// } from "lucide-react";
// import { NavLink, useLocation, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "../Redux/authSlice";
// import logo from "../utils/target_Trek_logo_2.jpg";

// const THEME_KEY = "theme";
// const THEME_EVENT = "targettrek-theme-change";

// const services = [
//   {
//     slug: "ppc-advertising",
//     title: "PPC Advertising",
//     icon: Megaphone,
//   },
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
//  * Only these routes belong to the normal TargetTrek website.
//  *
//  * Every route NOT present here automatically becomes
//  * a TargetTrek Learn route.
//  */
// const MAIN_ROUTE_PREFIXES = [
//   "/services",
//   "/portfolio",
//   "/affiliate-marketing",
//   "/carrers",
//   "/submit-review",
// ];

// const routeMatches = (pathname, prefix) =>
//   pathname === prefix || pathname.startsWith(`${prefix}/`);

// const matchesAnyRoute = (pathname, prefixes) =>
//   prefixes.some((prefix) => routeMatches(pathname, prefix));

// const isMainRoute = (pathname) =>
//   // pathname === "/" || matchesAnyRoute(pathname, MAIN_ROUTE_PREFIXES);
//   matchesAnyRoute(pathname, MAIN_ROUTE_PREFIXES);


// /*
//  * Everything other than MAIN routes is Learn.
//  *
//  * Examples:
//  *
//  * /                    -> main
//  * /about               -> main
//  * /services/...        -> main
//  *
//  * /learn               -> learn
//  * /books               -> learn
//  * /book/...            -> learn
//  * /blogs               -> learn
//  * /resources           -> learn
//  * /reviews             -> learn
//  * /dashboard           -> learn
//  * /admin/...           -> learn
//  * /profile             -> learn
//  * /anything-new        -> learn
//  */
// const getNavbarMode = (pathname) => {
//   return isMainRoute(pathname) ? "main" : "learn";
// };

// const readTheme = () => {
//   if (typeof window === "undefined") {
//     return "light";
//   }

//   return window.localStorage.getItem(THEME_KEY) === "dark"
//     ? "dark"
//     : "light";
// };

// const applyThemeToDocument = (theme) => {
//   if (typeof document === "undefined") {
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

// const Navbar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useDispatch();

//   const { user, isAuthenticated } = useSelector(
//     (state) => state.auth
//   );

//   const [menuOpen, setMenuOpen] = useState(false);
//   const [servicesOpen, setServicesOpen] = useState(false);
//   const [profileOpen, setProfileOpen] = useState(false);

//   const [navMode, setNavMode] = useState(() =>
//     getNavbarMode(location.pathname)
//   );

//   /*
//    * Main TargetTrek is always light.
//    * Learn uses saved theme.
//    */
//   const [theme, setTheme] = useState(() => {
//     if (isMainRoute(location.pathname)) {
//       return "light";
//     }

//     return readTheme();
//   });

//   const profileRef = useRef(null);
//   const servicesTimeoutRef = useRef(null);

//   const isLearn = navMode === "learn";

//   /*
//    * Main TargetTrek is always light,
//    * even if Learn has dark theme saved.
//    */
//   const isDark = isLearn && theme === "dark";

//   const isAdmin =
//     isAuthenticated &&
//     (user?.role === "admin" || user?.role === "Employee");

//   const userInitial =
//     user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

//   const closeMenus = () => {
//     setMenuOpen(false);
//     setServicesOpen(false);
//     setProfileOpen(false);
//   };

//   const goTo = (path) => {
//     closeMenus();
//     navigate(path);
//   };

//   const handleLogout = () => {
//     dispatch(logout());

//     closeMenus();

//     navigate(isLearn ? "/learn" : "/");
//   };

//   /*
//    * Theme changes are allowed ONLY inside Learn.
//    */
//   const changeTheme = (newTheme) => {
//     if (!isLearn) {
//       return;
//     }

//     if (newTheme !== "dark" && newTheme !== "light") {
//       return;
//     }

//     setTheme(newTheme);

//     window.localStorage.setItem(
//       THEME_KEY,
//       newTheme
//     );

//     applyThemeToDocument(newTheme);

//     window.dispatchEvent(
//       new CustomEvent(THEME_EVENT, {
//         detail: {
//           theme: newTheme,
//         },
//       })
//     );
//   };

//   const toggleTheme = () => {
//     if (!isLearn) {
//       return;
//     }

//     changeTheme(
//       isDark ? "light" : "dark"
//     );
//   };

//   /*
//    * Listen for theme updates.
//    *
//    * Main website always stays light.
//    * Learn responds to stored/theme events.
//    */
//   useEffect(() => {
//     const applyCorrectTheme = () => {
//       const currentPath =
//         window.location.pathname;

//       if (isMainRoute(currentPath)) {
//         setTheme("light");
//         applyThemeToDocument("light");
//         return;
//       }

//       const savedTheme = readTheme();

//       setTheme(savedTheme);
//       applyThemeToDocument(savedTheme);
//     };

//     applyCorrectTheme();

//     const handleThemeEvent = (event) => {
//       const currentPath =
//         window.location.pathname;

//       /*
//        * Never allow dark mode on normal TargetTrek.
//        */
//       if (isMainRoute(currentPath)) {
//         setTheme("light");
//         applyThemeToDocument("light");
//         return;
//       }

//       const newTheme =
//         event?.detail?.theme;

//       if (
//         newTheme === "dark" ||
//         newTheme === "light"
//       ) {
//         setTheme(newTheme);
//         applyThemeToDocument(newTheme);
//       }
//     };

//     const handleStorage = (event) => {
//       if (event.key !== THEME_KEY) {
//         return;
//       }

//       const currentPath =
//         window.location.pathname;

//       if (isMainRoute(currentPath)) {
//         setTheme("light");
//         applyThemeToDocument("light");
//         return;
//       }

//       if (
//         event.newValue === "dark" ||
//         event.newValue === "light"
//       ) {
//         setTheme(event.newValue);
//         applyThemeToDocument(event.newValue);
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
//    * Navbar mode is completely based on URL.
//    *
//    * Main routes -> TargetTrek
//    * Anything else -> TargetTrek Learn
//    */
//   useEffect(() => {
//     const pathname = location.pathname;

//     const mode =
//       getNavbarMode(pathname);

//     setNavMode(mode);

//     if (mode === "main") {
//       /*
//        * Force normal TargetTrek to light mode.
//        *
//        * IMPORTANT:
//        * We do NOT overwrite localStorage.
//        * This preserves the user's Learn theme.
//        */
//       setTheme("light");
//       applyThemeToDocument("light");
//     } else {
//       /*
//        * Restore Learn theme when entering Learn.
//        */
//       const storedTheme = readTheme();

//       setTheme(storedTheme);
//       applyThemeToDocument(storedTheme);
//     }

//     setMenuOpen(false);
//     setServicesOpen(false);
//     setProfileOpen(false);
//   }, [location.pathname]);

//   useEffect(() => {
//     document.body.style.overflow =
//       menuOpen ? "hidden" : "";

//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [menuOpen]);

//   useEffect(() => {
//     const handleOutsideClick = (event) => {
//       if (
//         profileRef.current &&
//         !profileRef.current.contains(event.target)
//       ) {
//         setProfileOpen(false);
//       }
//     };

//     document.addEventListener(
//       "mousedown",
//       handleOutsideClick
//     );

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleOutsideClick
//       );
//     };
//   }, []);

//   useEffect(() => {
//     return () => {
//       if (servicesTimeoutRef.current) {
//         clearTimeout(
//           servicesTimeoutRef.current
//         );
//       }
//     };
//   }, []);

//   const handleServicesEnter = () => {
//     clearTimeout(
//       servicesTimeoutRef.current
//     );

//     setServicesOpen(true);
//   };

//   const handleServicesLeave = () => {
//     servicesTimeoutRef.current =
//       setTimeout(() => {
//         setServicesOpen(false);
//       }, 150);
//   };

//   const isActive = (path) =>
//     routeMatches(
//       location.pathname,
//       path
//     );

//   const booksActive =
//     isActive("/books") ||
//     isActive("/book") ||
//     isActive("/ebook");

//   const interviewsActive =
//     isActive("/interviews") ||
//     isActive("/interview");

//   const resourcesActive =
//     isActive("/resources") ||
//     isActive("/resource");

//   const blogsActive =
//     isActive("/blogs") ||
//     isActive("/blog");

//   const navBackground = isDark
//     ? "border-slate-800 bg-[#090D14]/95"
//     : "border-slate-200 bg-white/95";

//   const drawerBackground = isDark
//     ? "border-slate-800 bg-[#0B1119]"
//     : "border-slate-200 bg-white";

//   const primaryText = isDark
//     ? "text-white"
//     : "text-slate-950";

//   const secondaryText = isDark
//     ? "text-slate-400"
//     : "text-slate-600";

//   const cardBackground = isDark
//     ? "border-slate-700 bg-slate-900"
//     : "border-slate-200 bg-white";

//   const desktopLinkClass = (active) => {
//     if (active) {
//       return isDark
//         ? "bg-blue-950/40 text-blue-300"
//         : "bg-blue-50 text-blue-700";
//     }

//     return isDark
//       ? "text-slate-300 hover:bg-slate-800 hover:text-white"
//       : "text-slate-600 hover:bg-slate-100 hover:text-slate-950";
//   };

//   const mobileLinkClass = (active) => {
//     if (active) {
//       return isDark
//         ? "bg-blue-950/40 text-blue-300"
//         : "bg-blue-50 text-blue-700";
//     }

//     return isDark
//       ? "text-slate-300 hover:bg-slate-800"
//       : "text-slate-700 hover:bg-slate-100";
//   };

//   const Brand = ({ mobile = false }) => {
//     if (!isLearn) {
//       return (
//         <button
//           type="button"
//           onClick={() => goTo("/")}
//           className="flex shrink-0 items-center gap-2.5"
//           aria-label="Go to TargetTrek home"
//         >
//           <div
//             className={`
//               overflow-hidden
//               rounded-xl
//               border
//               shadow-sm
//               ${cardBackground}
//               ${
//                 mobile
//                   ? "h-9 w-9"
//                   : "h-10 w-10"
//               }
//             `}
//           >
//             <img
//               src={logo}
//               alt="TargetTrek"
//               className="h-full w-full object-cover"
//             />
//           </div>

//           <span
//             className={`
//               font-extrabold
//               tracking-tight
//               ${primaryText}
//               ${
//                 mobile
//                   ? "text-lg"
//                   : "text-xl"
//               }
//             `}
//           >
//             Target
//             <span className="text-blue-500">
//               Trek
//             </span>
//           </span>
//         </button>
//       );
//     }

//     return (
//       <button
//         type="button"
//         onClick={() => goTo("/learn")}
//         className="flex shrink-0 items-center gap-2.5"
//         aria-label="Go to TargetTrek Learn home"
//       >
//         <div
//           className={`
//             overflow-hidden
//             rounded-xl
//             border
//             ${cardBackground}
//             ${
//               mobile
//                 ? "h-9 w-9"
//                 : "h-10 w-10"
//             }
//           `}
//         >
//           <img
//             src={logo}
//             alt="TargetTrek Learn"
//             className="h-full w-full object-cover"
//           />
//         </div>

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
//       </button>
//     );
//   };

//   /*
//    * This button is rendered only on Learn.
//    */
//   const ThemeButton = () => {
//     if (!isLearn) {
//       return null;
//     }

//     return (
//       <button
//         type="button"
//         onClick={toggleTheme}
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
//           items-center
//           justify-center
//           rounded-xl
//           border
//           transition
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
//   };

//   const DesktopProfile = () => {
//     if (!isAuthenticated) {
//       return null;
//     }

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
//             transition
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
//               shadow-2xl
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
//                     {user?.name || "User"}
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
//               onClick={() => goTo("/profile")}
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
//                     goTo("/dashboard")
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
//                   <LayoutDashboard size={17} />
//                   Dashboard
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     goTo(
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
//                   <BarChart3 size={17} />
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
//               onClick={handleLogout}
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
//   };

//   const MainDesktopNavigation = () => (
//     <>
//       <div className="hidden flex-1 items-center justify-center gap-1 xl:flex">
//         <NavLink
//           to="/about"
//           className={`
//             rounded-lg
//             px-4
//             py-2
//             text-sm
//             font-semibold
//             transition
//             ${desktopLinkClass(
//               isActive("/about")
//             )}
//           `}
//         >
//           About
//         </NavLink>

//         <div
//           className="relative"
//           onMouseEnter={handleServicesEnter}
//           onMouseLeave={handleServicesLeave}
//         >
//           <NavLink
//             to="/services"
//             className={`
//               flex
//               items-center
//               gap-1.5
//               rounded-lg
//               px-4
//               py-2
//               text-sm
//               font-semibold
//               transition
//               ${desktopLinkClass(
//                 isActive("/services")
//               )}
//             `}
//           >
//             Services

//             <ChevronDown
//               size={15}
//               className={`
//                 transition-transform
//                 ${
//                   servicesOpen
//                     ? "rotate-180"
//                     : ""
//                 }
//               `}
//             />
//           </NavLink>

//           {servicesOpen && (
//             <div
//               className={`
//                 absolute
//                 left-1/2
//                 top-full
//                 mt-2
//                 w-80
//                 -translate-x-1/2
//                 rounded-2xl
//                 border
//                 p-2
//                 shadow-2xl
//                 ${cardBackground}
//               `}
//             >
//               <p
//                 className="
//                   px-3
//                   pb-2
//                   pt-2
//                   text-[10px]
//                   font-black
//                   uppercase
//                   tracking-[0.15em]
//                   text-slate-400
//                 "
//               >
//                 Services
//               </p>

//               {services.map((service) => {
//                 const Icon = service.icon;

//                 return (
//                   <NavLink
//                     key={service.slug}
//                     to={`/services/${service.slug}`}
//                     className="
//                       flex
//                       items-center
//                       gap-3
//                       rounded-xl
//                       px-3
//                       py-3
//                       text-sm
//                       font-semibold
//                       text-slate-600
//                       transition
//                       hover:bg-blue-50
//                       hover:text-blue-700
//                     "
//                   >
//                     <div
//                       className="
//                         flex
//                         h-8
//                         w-8
//                         items-center
//                         justify-center
//                         rounded-lg
//                         bg-slate-100
//                       "
//                     >
//                       <Icon size={16} />
//                     </div>

//                     {service.title}
//                   </NavLink>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         <button
//           type="button"
//           onClick={() =>
//             goTo("/learn")
//           }
//           className={`
//             flex
//             items-center
//             gap-2
//             rounded-lg
//             px-4
//             py-2
//             text-sm
//             font-semibold
//             transition
//             ${desktopLinkClass(false)}
//           `}
//         >
//           <GraduationCap size={16} />
//           Learn
//         </button>
//       </div>

//       <div className="hidden items-center gap-1 xl:flex">
//         <NavLink
//           to="/contact"
//           className={`
//             rounded-lg
//             px-3
//             py-2
//             text-sm
//             font-semibold
//             transition
//             ${desktopLinkClass(
//               isActive("/contact")
//             )}
//           `}
//         >
//           Contact
//         </NavLink>

//         {isAdmin && (
//           <>
//             <button
//               type="button"
//               onClick={() =>
//                 goTo("/dashboard")
//               }
//               className={`
//                 rounded-lg
//                 px-3
//                 py-2
//                 text-sm
//                 font-semibold
//                 transition
//                 ${desktopLinkClass(false)}
//               `}
//             >
//               Dashboard
//             </button>

//             <button
//               type="button"
//               onClick={() =>
//                 goTo(
//                   "/admin/book/analytics"
//                 )
//               }
//               className={`
//                 rounded-lg
//                 px-3
//                 py-2
//                 text-sm
//                 font-semibold
//                 transition
//                 ${desktopLinkClass(false)}
//               `}
//             >
//               Analytics
//             </button>
//           </>
//         )}

//         {/*
//           No ThemeButton here.
//           Main TargetTrek is always light.
//         */}

//         <DesktopProfile />
//       </div>
//     </>
//   );

//   const LearnDesktopNavigation = () => (
//     <>
//       <div className="hidden flex-1 items-center justify-center gap-1 xl:flex">
//         <NavLink
//           to="/books"
//           className={`
//             rounded-lg
//             px-4
//             py-2
//             text-sm
//             font-semibold
//             transition
//             ${desktopLinkClass(
//               booksActive
//             )}
//           `}
//         >
//           Books
//         </NavLink>

//         <NavLink
//           to="/interviews"
//           className={`
//             rounded-lg
//             px-4
//             py-2
//             text-sm
//             font-semibold
//             transition
//             ${desktopLinkClass(
//               interviewsActive
//             )}
//           `}
//         >
//           Interviews
//         </NavLink>

//         <NavLink
//           to="/resources"
//           className={`
//             rounded-lg
//             px-4
//             py-2
//             text-sm
//             font-semibold
//             transition
//             ${desktopLinkClass(
//               resourcesActive
//             )}
//           `}
//         >
//           Resources
//         </NavLink>

//         <NavLink
//           to="/blogs"
//           className={`
//             rounded-lg
//             px-4
//             py-2
//             text-sm
//             font-semibold
//             transition
//             ${desktopLinkClass(
//               blogsActive
//             )}
//           `}
//         >
//           Blogs
//         </NavLink>
//       </div>

//       <div className="hidden items-center gap-1 xl:flex">
//         {isAdmin && (
//           <>
//             <button
//               type="button"
//               onClick={() =>
//                 goTo("/dashboard")
//               }
//               className={`
//                 rounded-lg
//                 px-3
//                 py-2
//                 text-sm
//                 font-semibold
//                 transition
//                 ${desktopLinkClass(
//                   isActive("/dashboard")
//                 )}
//               `}
//             >
//               Dashboard
//             </button>

//             <button
//               type="button"
//               onClick={() =>
//                 goTo(
//                   "/admin/book/analytics"
//                 )
//               }
//               className={`
//                 rounded-lg
//                 px-3
//                 py-2
//                 text-sm
//                 font-semibold
//                 transition
//                 ${desktopLinkClass(
//                   isActive(
//                     "/admin/book/analytics"
//                   )
//                 )}
//               `}
//             >
//               Analytics
//             </button>
//           </>
//         )}

//         <div className="ml-1">
//           <ThemeButton />
//         </div>

//         <DesktopProfile />
//       </div>
//     </>
//   );

//   const MobileTopBar = () => (
//     <div
//       className="
//         grid
//         h-16
//         grid-cols-[40px_1fr_40px]
//         items-center
//         gap-3
//         xl:hidden
//       "
//     >
//       <button
//         type="button"
//         onClick={() =>
//           setMenuOpen(true)
//         }
//         aria-label="Open menu"
//         className={`
//           flex
//           h-10
//           w-10
//           items-center
//           justify-center
//           rounded-xl
//           border
//           ${cardBackground}
//           ${primaryText}
//         `}
//       >
//         <Menu size={20} />
//       </button>

//       <div className="flex justify-center">
//         <Brand mobile />
//       </div>

//       {isLearn ? (
//         <ThemeButton />
//       ) : (
//         /*
//          * Empty placeholder keeps logo centered.
//          */
//         <div
//           className="h-10 w-10"
//           aria-hidden="true"
//         />
//       )}
//     </div>
//   );

//   const MainMobileNavigation = () => (
//     <div className="space-y-1">
//       <NavLink
//         to="/about"
//         onClick={closeMenus}
//         className={`
//           block
//           rounded-xl
//           px-4
//           py-3
//           text-sm
//           font-semibold
//           ${mobileLinkClass(
//             isActive("/about")
//           )}
//         `}
//       >
//         About
//       </NavLink>

//       <div>
//         <button
//           type="button"
//           onClick={() =>
//             setServicesOpen(
//               (previous) => !previous
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
//               isActive("/services")
//             )}
//           `}
//         >
//           Services

//           <ChevronDown
//             size={17}
//             className={`
//               transition-transform
//               ${
//                 servicesOpen
//                   ? "rotate-180"
//                   : ""
//               }
//             `}
//           />
//         </button>

//         {servicesOpen && (
//           <div
//             className="
//               ml-4
//               mt-1
//               space-y-1
//               border-l
//               border-slate-200
//               pl-3
//             "
//           >
//             <NavLink
//               to="/services"
//               onClick={closeMenus}
//               className="
//                 block
//                 rounded-lg
//                 px-3
//                 py-2
//                 text-xs
//                 font-black
//                 text-blue-500
//               "
//             >
//               All Services
//             </NavLink>

//             {services.map((service) => {
//               const Icon = service.icon;

//               return (
//                 <NavLink
//                   key={service.slug}
//                   to={`/services/${service.slug}`}
//                   onClick={closeMenus}
//                   className="
//                     flex
//                     items-center
//                     gap-3
//                     rounded-lg
//                     px-3
//                     py-2.5
//                     text-xs
//                     font-semibold
//                     text-slate-600
//                     hover:bg-slate-100
//                   "
//                 >
//                   <Icon size={15} />

//                   {service.title}
//                 </NavLink>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       <button
//         type="button"
//         onClick={() =>
//           goTo("/learn")
//         }
//         className={`
//           flex
//           w-full
//           items-center
//           justify-between
//           rounded-xl
//           px-4
//           py-3
//           text-sm
//           font-semibold
//           ${mobileLinkClass(false)}
//         `}
//       >
//         <span className="flex items-center gap-3">
//           <GraduationCap size={18} />
//           Learn
//         </span>

//         <ArrowUpRight size={16} />
//       </button>

//       <NavLink
//         to="/contact"
//         onClick={closeMenus}
//         className={`
//           block
//           rounded-xl
//           px-4
//           py-3
//           text-sm
//           font-semibold
//           ${mobileLinkClass(
//             isActive("/contact")
//           )}
//         `}
//       >
//         Contact
//       </NavLink>
//     </div>
//   );

//   const LearnMobileNavigation = () => (
//     <div className="space-y-1">
//       <NavLink
//         to="/learn"
//         onClick={closeMenus}
//         className={`
//           flex
//           items-center
//           gap-3
//           rounded-xl
//           px-4
//           py-3
//           text-sm
//           font-semibold
//           ${mobileLinkClass(
//             location.pathname === "/learn"
//           )}
//         `}
//       >
//         <GraduationCap size={18} />
//         Learn Home
//       </NavLink>

//       <NavLink
//         to="/books"
//         onClick={closeMenus}
//         className={`
//           flex
//           items-center
//           gap-3
//           rounded-xl
//           px-4
//           py-3
//           text-sm
//           font-semibold
//           ${mobileLinkClass(
//             booksActive
//           )}
//         `}
//       >
//         <BookOpen size={18} />
//         Books
//       </NavLink>

//       <NavLink
//         to="/interviews"
//         onClick={closeMenus}
//         className={`
//           flex
//           items-center
//           gap-3
//           rounded-xl
//           px-4
//           py-3
//           text-sm
//           font-semibold
//           ${mobileLinkClass(
//             interviewsActive
//           )}
//         `}
//       >
//         <Users size={18} />
//         Interviews
//       </NavLink>

//       <NavLink
//         to="/resources"
//         onClick={closeMenus}
//         className={`
//           flex
//           items-center
//           gap-3
//           rounded-xl
//           px-4
//           py-3
//           text-sm
//           font-semibold
//           ${mobileLinkClass(
//             resourcesActive
//           )}
//         `}
//       >
//         <GraduationCap size={18} />
//         Resources
//       </NavLink>

//       <NavLink
//         to="/blogs"
//         onClick={closeMenus}
//         className={`
//           flex
//           items-center
//           gap-3
//           rounded-xl
//           px-4
//           py-3
//           text-sm
//           font-semibold
//           ${mobileLinkClass(
//             blogsActive
//           )}
//         `}
//       >
//         <FileText size={18} />
//         Blogs
//       </NavLink>
//     </div>
//   );

//   const MobileAdmin = () => {
//     if (!isAdmin) {
//       return null;
//     }

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
//             goTo("/dashboard")
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
//               location.pathname ===
//                 "/dashboard"
//             )}
//           `}
//         >
//           <LayoutDashboard size={18} />
//           Dashboard
//         </button>

//         <button
//           type="button"
//           onClick={() =>
//             goTo(
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
//               location.pathname.startsWith(
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
//   };

//   const MobileProfile = () => {
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
//                 goTo("/contact")
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

//               <ArrowRight size={16} />
//             </button>
//           )}
//         </div>
//       );
//     }

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
//                 {user?.name || "User"}
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
//                 goTo("/profile")
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
//               onClick={handleLogout}
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
//   };

//   const MobileDrawer = () => (
//     <>
//       <div
//         onClick={() =>
//           setMenuOpen(false)
//         }
//         className={`
//           fixed
//           inset-0
//           z-[70]
//           bg-black/50
//           backdrop-blur-[2px]
//           transition-opacity
//           duration-300
//           xl:hidden
//           ${
//             menuOpen
//               ? "pointer-events-auto opacity-100"
//               : "pointer-events-none opacity-0"
//           }
//         `}
//       />

//       <aside
//         className={`
//           fixed
//           bottom-0
//           left-0
//           top-0
//           z-[80]
//           flex
//           w-[88vw]
//           max-w-[360px]
//           flex-col
//           border-r
//           shadow-2xl
//           transition-transform
//           duration-300
//           ease-out
//           xl:hidden
//           ${drawerBackground}
//           ${
//             menuOpen
//               ? "translate-x-0"
//               : "-translate-x-full"
//           }
//         `}
//       >
//         <div
//           className={`
//             flex
//             h-16
//             shrink-0
//             items-center
//             justify-between
//             border-b
//             px-4
//             ${
//               isDark
//                 ? "border-slate-800"
//                 : "border-slate-200"
//             }
//           `}
//         >
//           <Brand mobile />

//           <button
//             type="button"
//             onClick={() =>
//               setMenuOpen(false)
//             }
//             aria-label="Close menu"
//             className={`
//               flex
//               h-9
//               w-9
//               items-center
//               justify-center
//               rounded-xl
//               ${secondaryText}
//               ${
//                 isDark
//                   ? "hover:bg-slate-800"
//                   : "hover:bg-slate-100"
//               }
//             `}
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto px-3 py-5">
//           <p
//             className={`
//               mb-3
//               px-4
//               text-[10px]
//               font-black
//               uppercase
//               tracking-[0.16em]
//               ${
//                 isDark
//                   ? "text-slate-600"
//                   : "text-slate-400"
//               }
//             `}
//           >
//             {isLearn
//               ? "Learning"
//               : "Navigation"}
//           </p>

//           {isLearn ? (
//             <LearnMobileNavigation />
//           ) : (
//             <MainMobileNavigation />
//           )}

//           <MobileAdmin />

//           <div
//             className={`
//               mt-6
//               border-t
//               pt-5
//               ${
//                 isDark
//                   ? "border-slate-800"
//                   : "border-slate-200"
//               }
//             `}
//           >
//             {isLearn ? (
//               <button
//                 type="button"
//                 onClick={() =>
//                   goTo("/")
//                 }
//                 className={`
//                   flex
//                   w-full
//                   items-center
//                   justify-between
//                   rounded-xl
//                   px-4
//                   py-3
//                   text-sm
//                   font-semibold
//                   ${mobileLinkClass(false)}
//                 `}
//               >
//                 TargetTrek Website

//                 <ArrowUpRight size={16} />
//               </button>
//             ) : (
//               <button
//                 type="button"
//                 onClick={() =>
//                   goTo("/learn")
//                 }
//                 className="
//                   flex
//                   w-full
//                   items-center
//                   justify-between
//                   rounded-xl
//                   bg-blue-50
//                   px-4
//                   py-3
//                   text-sm
//                   font-bold
//                   text-blue-700
//                 "
//               >
//                 <span className="flex items-center gap-3">
//                   <GraduationCap size={18} />
//                   TargetTrek Learn
//                 </span>

//                 <ArrowRight size={16} />
//               </button>
//             )}
//           </div>
//         </div>

//         <MobileProfile />
//       </aside>
//     </>
//   );

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
//           backdrop-blur-xl
//           transition-colors
//           duration-300
//           ${navBackground}
//         `}
//       >
//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//           <div className="hidden h-16 items-center xl:flex">
//             <Brand />

//             {isLearn ? (
//               <LearnDesktopNavigation />
//             ) : (
//               <MainDesktopNavigation />
//             )}
//           </div>

//           <MobileTopBar />
//         </div>
//       </nav>

//       <MobileDrawer />
//     </>
//   );
// };

// export default Navbar;
import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  ChevronDown,
  Code,
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
  User,
  Users,
  X,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../Redux/authSlice";
import logo from "../utils/target_Trek_logo_2.jpg";
const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";
const services = [
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
    icon: Code,
  },
  {
    slug: "genai-solutions",
    title: "GenAI Solutions",
    icon: Sparkles,
  },
];
/*
 * ======================================================
 * NAVBAR ROUTE MODE CONFIGURATION
 * ======================================================
 *
 * CURRENT STATE:
 * All normal TargetTrek routes are commented.
 *
 * Therefore every route currently uses:
 * - TargetTrek Learn navbar
 * - Learn light/dark theme
 *
 * FUTURE:
 * Uncomment the routes below and Main + Learn mode will
 * automatically start working again.
 *
 * IMPORTANT:
 * "/" is an exact route. Do not put "/" inside the
 * prefix array because it would match every pathname.
 */
const MAIN_EXACT_ROUTES = [
  // "/",
  // "/about",
  // "/contact",
];
const MAIN_ROUTE_PREFIXES = [
  // "/services",
  // "/portfolio",
  // "/affiliate-marketing",
  // "/carrers",
  // "/submit-review",
];
const matchesExactRoute = (pathname, routes) =>
  routes.includes(pathname);
const routeMatches = (pathname, prefix) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);
const matchesAnyRoute = (pathname, prefixes) =>
  prefixes.some((prefix) => routeMatches(pathname, prefix));
const isMainRoute = (pathname) =>
  matchesExactRoute(pathname, MAIN_EXACT_ROUTES) ||
  matchesAnyRoute(pathname, MAIN_ROUTE_PREFIXES);
/*
 * Used by the mobile Learn -> Main switch.
 *
 * While all Main routes are commented this is null,
 * so the switch is hidden.
 *
 * As soon as you uncomment at least one Main route,
 * the switch automatically becomes available.
 */
const MAIN_SITE_ENTRY =
  MAIN_EXACT_ROUTES.includes("/")
    ? "/"
    : MAIN_EXACT_ROUTES[0] ||
      MAIN_ROUTE_PREFIXES[0] ||
      null;
const HAS_MAIN_SITE = Boolean(MAIN_SITE_ENTRY);
/*
 * Any route that is not explicitly Main is Learn.
 */
const getNavbarMode = (pathname) => {
  return isMainRoute(pathname) ? "main" : "learn";
};
const readTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.localStorage.getItem(THEME_KEY) === "dark"
    ? "dark"
    : "light";
};
const applyThemeToDocument = (theme) => {
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
};
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [navMode, setNavMode] = useState(() =>
    getNavbarMode(location.pathname)
  );
  /*
   * Main TargetTrek is always light.
   * Learn uses saved theme.
   */
  const [theme, setTheme] = useState(() => {
    if (isMainRoute(location.pathname)) {
      return "light";
    }
    return readTheme();
  });
  const profileRef = useRef(null);
  const servicesTimeoutRef = useRef(null);
  const isLearn = navMode === "learn";
  /*
   * Main TargetTrek is always light,
   * even if Learn has dark theme saved.
   */
  const isDark = isLearn && theme === "dark";
  const isAdmin =
    isAuthenticated &&
    (user?.role === "admin" || user?.role === "Employee");
  const userInitial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";
  const closeMenus = () => {
    setMenuOpen(false);
    setServicesOpen(false);
    setProfileOpen(false);
  };
  const goTo = (path) => {
    closeMenus();
    navigate(path);
  };
  const handleLogout = () => {
    dispatch(logout());
    closeMenus();
    navigate(isLearn ? "/learn" : "/");
  };
  /*
   * Theme changes are allowed ONLY inside Learn.
   */
  const changeTheme = (newTheme) => {
    if (!isLearn) {
      return;
    }
    if (newTheme !== "dark" && newTheme !== "light") {
      return;
    }
    setTheme(newTheme);
    window.localStorage.setItem(
      THEME_KEY,
      newTheme
    );
    applyThemeToDocument(newTheme);
    window.dispatchEvent(
      new CustomEvent(THEME_EVENT, {
        detail: {
          theme: newTheme,
        },
      })
    );
  };
  const toggleTheme = () => {
    if (!isLearn) {
      return;
    }
    changeTheme(
      isDark ? "light" : "dark"
    );
  };
  /*
   * Listen for theme updates.
   *
   * Main website always stays light.
   * Learn responds to stored/theme events.
   */
  useEffect(() => {
    const applyCorrectTheme = () => {
      const currentPath =
        window.location.pathname;
      if (isMainRoute(currentPath)) {
        setTheme("light");
        applyThemeToDocument("light");
        return;
      }
      const savedTheme = readTheme();
      setTheme(savedTheme);
      applyThemeToDocument(savedTheme);
    };
    applyCorrectTheme();
    const handleThemeEvent = (event) => {
      const currentPath =
        window.location.pathname;
      /*
       * Never allow dark mode on normal TargetTrek.
       */
      if (isMainRoute(currentPath)) {
        setTheme("light");
        applyThemeToDocument("light");
        return;
      }
      const newTheme =
        event?.detail?.theme;
      if (
        newTheme === "dark" ||
        newTheme === "light"
      ) {
        setTheme(newTheme);
        applyThemeToDocument(newTheme);
      }
    };
    const handleStorage = (event) => {
      if (event.key !== THEME_KEY) {
        return;
      }
      const currentPath =
        window.location.pathname;
      if (isMainRoute(currentPath)) {
        setTheme("light");
        applyThemeToDocument("light");
        return;
      }
      if (
        event.newValue === "dark" ||
        event.newValue === "light"
      ) {
        setTheme(event.newValue);
        applyThemeToDocument(event.newValue);
      }
    };
    window.addEventListener(
      THEME_EVENT,
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
        "storage",
        handleStorage
      );
    };
  }, []);
  /*
   * Navbar mode is completely based on URL.
   *
   * Main routes -> TargetTrek
   * Anything else -> TargetTrek Learn
   */
  useEffect(() => {
    const pathname = location.pathname;
    const mode =
      getNavbarMode(pathname);
    setNavMode(mode);
    if (mode === "main") {
      /*
       * Force normal TargetTrek to light mode.
       *
       * IMPORTANT:
       * We do NOT overwrite localStorage.
       * This preserves the user's Learn theme.
       */
      setTheme("light");
      applyThemeToDocument("light");
    } else {
      /*
       * Restore Learn theme when entering Learn.
       */
      const storedTheme = readTheme();
      setTheme(storedTheme);
      applyThemeToDocument(storedTheme);
    }
    setMenuOpen(false);
    setServicesOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow =
      menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );
    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);
  useEffect(() => {
    return () => {
      if (servicesTimeoutRef.current) {
        clearTimeout(
          servicesTimeoutRef.current
        );
      }
    };
  }, []);
  const handleServicesEnter = () => {
    clearTimeout(
      servicesTimeoutRef.current
    );
    setServicesOpen(true);
  };
  const handleServicesLeave = () => {
    servicesTimeoutRef.current =
      setTimeout(() => {
        setServicesOpen(false);
      }, 150);
  };
  const isActive = (path) =>
    routeMatches(
      location.pathname,
      path
    );
  const booksActive =
    isActive("/books") ||
    isActive("/book") ||
    isActive("/ebook");
  const interviewsActive =
    isActive("/interviews") ||
    isActive("/interview");
  const resourcesActive =
    isActive("/resources") ||
    isActive("/resource");
  const blogsActive =
    isActive("/blogs") ||
    isActive("/blog");
  const learnHomeActive =
    location.pathname === "/" ||
    location.pathname === "/learn";
  const aboutActive =
    isActive("/about");
  const contactActive =
    isActive("/contact");
  const navBackground = isDark
    ? "border-slate-800 bg-[#090D14]/95"
    : "border-slate-200 bg-white/95";
  const drawerBackground = isDark
    ? "border-slate-800 bg-[#0B1119]"
    : "border-slate-200 bg-white";
  const primaryText = isDark
    ? "text-white"
    : "text-slate-950";
  const secondaryText = isDark
    ? "text-slate-400"
    : "text-slate-600";
  const cardBackground = isDark
    ? "border-slate-700 bg-slate-900"
    : "border-slate-200 bg-white";
  const desktopLinkClass = (active) => {
    if (active) {
      return isDark
        ? "bg-blue-950/40 text-blue-300"
        : "bg-blue-50 text-blue-700";
    }
    return isDark
      ? "text-slate-300 hover:bg-slate-800 hover:text-white"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950";
  };
  const mobileLinkClass = (active) => {
    if (active) {
      return isDark
        ? "bg-blue-950/40 text-blue-300"
        : "bg-blue-50 text-blue-700";
    }
    return isDark
      ? "text-slate-300 hover:bg-slate-800"
      : "text-slate-700 hover:bg-slate-100";
  };
  const Brand = ({ mobile = false }) => {
    if (!isLearn) {
      return (
        <button
          type="button"
          onClick={() => goTo("/")}
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Go to TargetTrek home"
        >
          <div
            className={`
              overflow-hidden
              rounded-xl
              border
              shadow-sm
              ${cardBackground}
              ${
                mobile
                  ? "h-9 w-9"
                  : "h-10 w-10"
              }
            `}
          >
            <img
              src={logo}
              alt="TargetTrek"
              className="h-full w-full object-cover"
            />
          </div>
          <span
            className={`
              font-extrabold
              tracking-tight
              ${primaryText}
              ${
                mobile
                  ? "text-lg"
                  : "text-xl"
              }
            `}
          >
            Target
            <span className="text-blue-500">
              Trek
            </span>
          </span>
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={() => goTo("/learn")}
        className="flex shrink-0 items-center gap-2.5"
        aria-label="Go to TargetTrek Learn home"
      >
        <div
          className={`
            overflow-hidden
            rounded-xl
            border
            ${cardBackground}
            ${
              mobile
                ? "h-9 w-9"
                : "h-10 w-10"
            }
          `}
        >
          <img
            src={logo}
            alt="TargetTrek Learn"
            className="h-full w-full object-cover"
          />
        </div>
        <div
          className={`
            relative
            pb-1
            font-extrabold
            leading-none
            tracking-tight
            ${primaryText}
            ${
              mobile
                ? "text-lg"
                : "text-xl"
            }
          `}
        >
          Target
          <span className="text-blue-500">
            Trek
          </span>
          <span
            className="
              absolute
              -bottom-2
              right-0
              text-[8px]
              font-black
              uppercase
              tracking-[0.18em]
              text-blue-500
            "
          >
            Learn
          </span>
        </div>
      </button>
    );
  };
  /*
   * This button is rendered only on Learn.
   */
  const ThemeButton = () => {
    if (!isLearn) {
      return null;
    }
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={
          isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
        className={`
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          transition
          ${
            isDark
              ? "border-slate-700 bg-slate-900 text-yellow-400 hover:bg-slate-800"
              : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
          }
        `}
      >
        {isDark ? (
          <Sun size={18} />
        ) : (
          <Moon size={18} />
        )}
      </button>
    );
  };
  const DesktopProfile = () => {
    if (!isAuthenticated) {
      return null;
    }
    return (
      <div
        ref={profileRef}
        className="relative"
      >
        <button
          type="button"
          onClick={() =>
            setProfileOpen(
              (previous) => !previous
            )
          }
          aria-label="Open profile menu"
          className={`
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            text-sm
            font-black
            transition
            ${
              isDark
                ? "border-slate-700 bg-slate-900 text-blue-300 hover:border-blue-700"
                : "border-slate-200 bg-slate-100 text-blue-700 hover:border-blue-300"
            }
          `}
        >
          {userInitial}
        </button>
        {profileOpen && (
          <div
            className={`
              absolute
              right-0
              top-full
              mt-3
              w-72
              overflow-hidden
              rounded-2xl
              border
              p-2
              shadow-2xl
              ${cardBackground}
            `}
          >
            <div
              className={`
                rounded-xl
                p-3
                ${
                  isDark
                    ? "bg-slate-800"
                    : "bg-slate-50"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-600
                    font-black
                    text-white
                  "
                >
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <p
                    className={`
                      truncate
                      text-sm
                      font-black
                      ${primaryText}
                    `}
                  >
                    {user?.name || "User"}
                  </p>
                  <p
                    className={`
                      mt-0.5
                      truncate
                      text-xs
                      ${secondaryText}
                    `}
                  >
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => goTo("/profile")}
              className={`
                mt-2
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-2.5
                text-left
                text-sm
                font-semibold
                ${secondaryText}
                ${
                  isDark
                    ? "hover:bg-slate-800"
                    : "hover:bg-slate-100"
                }
              `}
            >
              <User size={17} />
              Profile
            </button>
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    goTo("/dashboard")
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    font-semibold
                    ${secondaryText}
                    ${
                      isDark
                        ? "hover:bg-slate-800"
                        : "hover:bg-slate-100"
                    }
                  `}
                >
                  <LayoutDashboard size={17} />
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() =>
                    goTo(
                      "/admin/book/analytics"
                    )
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    px-3
                    py-2.5
                    text-left
                    text-sm
                    font-semibold
                    ${secondaryText}
                    ${
                      isDark
                        ? "hover:bg-slate-800"
                        : "hover:bg-slate-100"
                    }
                  `}
                >
                  <BarChart3 size={17} />
                  Analytics
                </button>
              </>
            )}
            <div
              className={`
                my-2
                border-t
                ${
                  isDark
                    ? "border-slate-800"
                    : "border-slate-200"
                }
              `}
            />
            <button
              type="button"
              onClick={handleLogout}
              className={`
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-2.5
                text-left
                text-sm
                font-semibold
                text-red-500
                ${
                  isDark
                    ? "hover:bg-red-950/30"
                    : "hover:bg-red-50"
                }
              `}
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        )}
      </div>
    );
  };
  const MainDesktopNavigation = () => (
    <>
      <div className="hidden flex-1 items-center justify-center gap-1 xl:flex">
        <NavLink
          to="/about"
          className={`
            rounded-lg
            px-4
            py-2
            text-sm
            font-semibold
            transition
            ${desktopLinkClass(
              isActive("/about")
            )}
          `}
        >
          About
        </NavLink>
        <div
          className="relative"
          onMouseEnter={handleServicesEnter}
          onMouseLeave={handleServicesLeave}
        >
          <NavLink
            to="/services"
            className={`
              flex
              items-center
              gap-1.5
              rounded-lg
              px-4
              py-2
              text-sm
              font-semibold
              transition
              ${desktopLinkClass(
                isActive("/services")
              )}
            `}
          >
            Services
            <ChevronDown
              size={15}
              className={`
                transition-transform
                ${
                  servicesOpen
                    ? "rotate-180"
                    : ""
                }
              `}
            />
          </NavLink>
          {servicesOpen && (
            <div
              className={`
                absolute
                left-1/2
                top-full
                mt-2
                w-80
                -translate-x-1/2
                rounded-2xl
                border
                p-2
                shadow-2xl
                ${cardBackground}
              `}
            >
              <p
                className="
                  px-3
                  pb-2
                  pt-2
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.15em]
                  text-slate-400
                "
              >
                Services
              </p>
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <NavLink
                    key={service.slug}
                    to={`/services/${service.slug}`}
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-sm
                      font-semibold
                      text-slate-600
                      transition
                      hover:bg-blue-50
                      hover:text-blue-700
                    "
                  >
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-lg
                        bg-slate-100
                      "
                    >
                      <Icon size={16} />
                    </div>
                    {service.title}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() =>
            goTo("/learn")
          }
          className={`
            flex
            items-center
            gap-2
            rounded-lg
            px-4
            py-2
            text-sm
            font-semibold
            transition
            ${desktopLinkClass(false)}
          `}
        >
          <GraduationCap size={16} />
          Learn
        </button>
      </div>
      <div className="hidden items-center gap-1 xl:flex">
        <NavLink
          to="/contact"
          className={`
            rounded-lg
            px-3
            py-2
            text-sm
            font-semibold
            transition
            ${desktopLinkClass(
              isActive("/contact")
            )}
          `}
        >
          Contact
        </NavLink>
        {isAdmin && (
          <>
            <button
              type="button"
              onClick={() =>
                goTo("/dashboard")
              }
              className={`
                rounded-lg
                px-3
                py-2
                text-sm
                font-semibold
                transition
                ${desktopLinkClass(false)}
              `}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() =>
                goTo(
                  "/admin/book/analytics"
                )
              }
              className={`
                rounded-lg
                px-3
                py-2
                text-sm
                font-semibold
                transition
                ${desktopLinkClass(false)}
              `}
            >
              Analytics
            </button>
          </>
        )}
        {/*
          No ThemeButton here.
          Main TargetTrek is always light.
        */}
        <DesktopProfile />
      </div>
    </>
  );
  const LearnDesktopNavigation = () => (
    <>
      <div className="hidden flex-1 items-center justify-center gap-1 xl:flex">
        <NavLink
          to="/books"
          className={`
            rounded-lg
            px-4
            py-2
            text-sm
            font-semibold
            transition
            ${desktopLinkClass(booksActive)}
          `}
        >
          Books
        </NavLink>
        <NavLink
          to="/interviews"
          className={`
            rounded-lg
            px-4
            py-2
            text-sm
            font-semibold
            transition
            ${desktopLinkClass(interviewsActive)}
          `}
        >
          Interviews
        </NavLink>
        <NavLink
          to="/resources"
          className={`
            rounded-lg
            px-4
            py-2
            text-sm
            font-semibold
            transition
            ${desktopLinkClass(resourcesActive)}
          `}
        >
          Resources
        </NavLink>
        <NavLink
          to="/blogs"
          className={`
            rounded-lg
            px-4
            py-2
            text-sm
            font-semibold
            transition
            ${desktopLinkClass(blogsActive)}
          `}
        >
          Blogs
        </NavLink>
        <NavLink
          to="/about"
          className={`
            rounded-lg
            px-4
            py-2
            text-sm
            font-semibold
            transition
            ${desktopLinkClass(aboutActive)}
          `}
        >
          About Us
        </NavLink>
      </div>
      <div className="hidden items-center gap-1 xl:flex">
        <NavLink
          to="/contact"
          className={`
            rounded-lg
            px-3
            py-2
            text-sm
            font-semibold
            transition
            ${desktopLinkClass(contactActive)}
          `}
        >
          Contact Us
        </NavLink>
        {isAdmin && (
          <>
            <button
              type="button"
              onClick={() => goTo("/dashboard")}
              className={`
                rounded-lg
                px-3
                py-2
                text-sm
                font-semibold
                transition
                ${desktopLinkClass(isActive("/dashboard"))}
              `}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => goTo("/admin/book/analytics")}
              className={`
                rounded-lg
                px-3
                py-2
                text-sm
                font-semibold
                transition
                ${desktopLinkClass(
                  isActive("/admin/book/analytics")
                )}
              `}
            >
              Analytics
            </button>
          </>
        )}
        <div className="ml-1">
          <ThemeButton />
        </div>
        <DesktopProfile />
      </div>
    </>
  );
  const MobileTopBar = () => (
    <div
      className="
        grid
        h-16
        grid-cols-[40px_1fr_40px]
        items-center
        gap-3
        xl:hidden
      "
    >
      <button
        type="button"
        onClick={() =>
          setMenuOpen(true)
        }
        aria-label="Open menu"
        className={`
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          ${cardBackground}
          ${primaryText}
        `}
      >
        <Menu size={20} />
      </button>
      <div className="flex justify-center">
        <Brand mobile />
      </div>
      {isLearn ? (
        <ThemeButton />
      ) : (
        /*
         * Empty placeholder keeps logo centered.
         */
        <div
          className="h-10 w-10"
          aria-hidden="true"
        />
      )}
    </div>
  );
  const MainMobileNavigation = () => (
    <div className="space-y-1">
      <NavLink
        to="/about"
        onClick={closeMenus}
        className={`
          block
          rounded-xl
          px-4
          py-3
          text-sm
          font-semibold
          ${mobileLinkClass(
            isActive("/about")
          )}
        `}
      >
        About
      </NavLink>
      <div>
        <button
          type="button"
          onClick={() =>
            setServicesOpen(
              (previous) => !previous
            )
          }
          className={`
            flex
            w-full
            items-center
            justify-between
            rounded-xl
            px-4
            py-3
            text-sm
            font-semibold
            ${mobileLinkClass(
              isActive("/services")
            )}
          `}
        >
          Services
          <ChevronDown
            size={17}
            className={`
              transition-transform
              ${
                servicesOpen
                  ? "rotate-180"
                  : ""
              }
            `}
          />
        </button>
        {servicesOpen && (
          <div
            className="
              ml-4
              mt-1
              space-y-1
              border-l
              border-slate-200
              pl-3
            "
          >
            <NavLink
              to="/services"
              onClick={closeMenus}
              className="
                block
                rounded-lg
                px-3
                py-2
                text-xs
                font-black
                text-blue-500
              "
            >
              All Services
            </NavLink>
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <NavLink
                  key={service.slug}
                  to={`/services/${service.slug}`}
                  onClick={closeMenus}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-2.5
                    text-xs
                    font-semibold
                    text-slate-600
                    hover:bg-slate-100
                  "
                >
                  <Icon size={15} />
                  {service.title}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() =>
          goTo("/learn")
        }
        className={`
          flex
          w-full
          items-center
          justify-between
          rounded-xl
          px-4
          py-3
          text-sm
          font-semibold
          ${mobileLinkClass(false)}
        `}
      >
        <span className="flex items-center gap-3">
          <GraduationCap size={18} />
          Learn
        </span>
        <ArrowUpRight size={16} />
      </button>
      <NavLink
        to="/contact"
        onClick={closeMenus}
        className={`
          block
          rounded-xl
          px-4
          py-3
          text-sm
          font-semibold
          ${mobileLinkClass(
            isActive("/contact")
          )}
        `}
      >
        Contact
      </NavLink>
    </div>
  );
  const LearnMobileNavigation = () => (
    <div className="space-y-1">
      <NavLink
        to="/learn"
        onClick={closeMenus}
        className={`
          flex
          items-center
          gap-3
          rounded-xl
          px-4
          py-3
          text-sm
          font-semibold
          ${mobileLinkClass(learnHomeActive)}
        `}
      >
        <GraduationCap size={18} />
        Learn Home
      </NavLink>
      <NavLink
        to="/books"
        onClick={closeMenus}
        className={`
          flex
          items-center
          gap-3
          rounded-xl
          px-4
          py-3
          text-sm
          font-semibold
          ${mobileLinkClass(booksActive)}
        `}
      >
        <BookOpen size={18} />
        Books
      </NavLink>
      <NavLink
        to="/interviews"
        onClick={closeMenus}
        className={`
          flex
          items-center
          gap-3
          rounded-xl
          px-4
          py-3
          text-sm
          font-semibold
          ${mobileLinkClass(interviewsActive)}
        `}
      >
        <Users size={18} />
        Interviews
      </NavLink>
      <NavLink
        to="/resources"
        onClick={closeMenus}
        className={`
          flex
          items-center
          gap-3
          rounded-xl
          px-4
          py-3
          text-sm
          font-semibold
          ${mobileLinkClass(resourcesActive)}
        `}
      >
        <GraduationCap size={18} />
        Resources
      </NavLink>
      <NavLink
        to="/blogs"
        onClick={closeMenus}
        className={`
          flex
          items-center
          gap-3
          rounded-xl
          px-4
          py-3
          text-sm
          font-semibold
          ${mobileLinkClass(blogsActive)}
        `}
      >
        <FileText size={18} />
        Blogs
      </NavLink>
      <div
        className={`
          my-3
          border-t
          ${isDark ? "border-slate-800" : "border-slate-200"}
        `}
      />
      <NavLink
        to="/about"
        onClick={closeMenus}
        className={`
          flex
          items-center
          gap-3
          rounded-xl
          px-4
          py-3
          text-sm
          font-semibold
          ${mobileLinkClass(aboutActive)}
        `}
      >
        <User size={18} />
        About Us
      </NavLink>
      <NavLink
        to="/contact"
        onClick={closeMenus}
        className={`
          flex
          items-center
          gap-3
          rounded-xl
          px-4
          py-3
          text-sm
          font-semibold
          ${mobileLinkClass(contactActive)}
        `}
      >
        <Mail size={18} />
        Contact Us
      </NavLink>
    </div>
  );
  const MobileAdmin = () => {
    if (!isAdmin) {
      return null;
    }
    return (
      <div
        className={`
          mt-6
          border-t
          pt-5
          ${
            isDark
              ? "border-slate-800"
              : "border-slate-200"
          }
        `}
      >
        <p
          className={`
            mb-2
            px-4
            text-[10px]
            font-black
            uppercase
            tracking-[0.16em]
            ${
              isDark
                ? "text-slate-600"
                : "text-slate-400"
            }
          `}
        >
          Administration
        </p>
        <button
          type="button"
          onClick={() =>
            goTo("/dashboard")
          }
          className={`
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-sm
            font-semibold
            ${mobileLinkClass(
              location.pathname ===
                "/dashboard"
            )}
          `}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>
        <button
          type="button"
          onClick={() =>
            goTo(
              "/admin/book/analytics"
            )
          }
          className={`
            mt-1
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-4
            py-3
            text-sm
            font-semibold
            ${mobileLinkClass(
              location.pathname.startsWith(
                "/admin/book/analytics"
              )
            )}
          `}
        >
          <BarChart3 size={18} />
          Analytics
        </button>
      </div>
    );
  };
  const MobileProfile = () => {
    if (!isAuthenticated) {
      return (
        <div
          className={`
            border-t
            p-4
            ${
              isDark
                ? "border-slate-800"
                : "border-slate-200"
            }
          `}
        >
          {isLearn ? (
            <a
              href="mailto:supporttargettrek\@gmail.com"
              className={`
                flex
                items-center
                gap-3
                rounded-xl
                p-3
                text-sm
                font-semibold
                ${
                  isDark
                    ? "bg-slate-900 text-slate-300"
                    : "bg-slate-50 text-slate-700"
                }
              `}
            >
              <Mail size={18} />
              Books & Support
            </a>
          ) : (
            <button
              type="button"
              onClick={() =>
                goTo("/contact")
              }
              className="
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-blue-600
                px-4
                py-3
                text-sm
                font-black
                text-white
              "
            >
              Contact TargetTrek
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      );
    }
    return (
      <div
        className={`
          border-t
          p-4
          ${
            isDark
              ? "border-slate-800"
              : "border-slate-200"
          }
        `}
      >
        <div
          className={`
            rounded-2xl
            border
            p-4
            ${
              isDark
                ? "border-slate-700 bg-slate-900"
                : "border-slate-200 bg-slate-50"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-blue-600
                font-black
                text-white
              "
            >
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`
                  truncate
                  text-sm
                  font-black
                  ${primaryText}
                `}
              >
                {user?.name || "User"}
              </p>
              <p
                className={`
                  mt-0.5
                  truncate
                  text-xs
                  ${secondaryText}
                `}
              >
                {user?.email}
              </p>
              {user?.role && (
                <p
                  className="
                    mt-1
                    text-[10px]
                    font-black
                    uppercase
                    tracking-wider
                    text-blue-500
                  "
                >
                  {user.role}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                goTo("/profile")
              }
              className={`
                rounded-xl
                px-3
                py-2.5
                text-xs
                font-bold
                ${
                  isDark
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }
              `}
            >
              Profile
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className={`
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                px-3
                py-2.5
                text-xs
                font-bold
                text-red-500
                ${
                  isDark
                    ? "bg-red-950/20 hover:bg-red-950/40"
                    : "bg-red-50 hover:bg-red-100"
                }
              `}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  };
  const MobileDrawer = () => (
    <>
      <div
        onClick={() =>
          setMenuOpen(false)
        }
        className={`
          fixed
          inset-0
          z-[70]
          bg-black/50
          backdrop-blur-[2px]
          transition-opacity
          duration-300
          xl:hidden
          ${
            menuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />
      <aside
        className={`
          fixed
          bottom-0
          left-0
          top-0
          z-[80]
          flex
          w-[88vw]
          max-w-[360px]
          flex-col
          border-r
          shadow-2xl
          transition-transform
          duration-300
          ease-out
          xl:hidden
          ${drawerBackground}
          ${
            menuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <div
          className={`
            flex
            h-16
            shrink-0
            items-center
            justify-between
            border-b
            px-4
            ${
              isDark
                ? "border-slate-800"
                : "border-slate-200"
            }
          `}
        >
          <Brand mobile />
          <button
            type="button"
            onClick={() =>
              setMenuOpen(false)
            }
            aria-label="Close menu"
            className={`
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              ${secondaryText}
              ${
                isDark
                  ? "hover:bg-slate-800"
                  : "hover:bg-slate-100"
              }
            `}
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <p
            className={`
              mb-3
              px-4
              text-[10px]
              font-black
              uppercase
              tracking-[0.16em]
              ${
                isDark
                  ? "text-slate-600"
                  : "text-slate-400"
              }
            `}
          >
            {isLearn
              ? "Learning"
              : "Navigation"}
          </p>
          {isLearn ? (
            <LearnMobileNavigation />
          ) : (
            <MainMobileNavigation />
          )}
          <MobileAdmin />
          {(!isLearn || HAS_MAIN_SITE) && (
            <div
              className={`
                mt-6
                border-t
                pt-5
                ${isDark ? "border-slate-800" : "border-slate-200"}
              `}
            >
              {isLearn ? (
                <button
                  type="button"
                  onClick={() => goTo(MAIN_SITE_ENTRY)}
                  className={`
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    ${mobileLinkClass(false)}
                  `}
                >
                  TargetTrek Website
                  <ArrowUpRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => goTo("/learn")}
                  className={`
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    font-bold
                    ${
                      isDark
                        ? "bg-blue-950/40 text-blue-300"
                        : "bg-blue-50 text-blue-700"
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    <GraduationCap size={18} />
                    TargetTrek Learn
                  </span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
        <MobileProfile />
      </aside>
    </>
  );
  return (
    <>
      <nav
        className={`
          fixed
          left-0
          top-0
          z-50
          w-full
          border-b
          backdrop-blur-xl
          transition-colors
          duration-300
          ${navBackground}
        `}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="hidden h-16 items-center xl:flex">
            <Brand />
            {isLearn ? (
              <LearnDesktopNavigation />
            ) : (
              <MainDesktopNavigation />
            )}
          </div>
          <MobileTopBar />
        </div>
      </nav>
      <MobileDrawer />
    </>
  );
};
export default Navbar;
