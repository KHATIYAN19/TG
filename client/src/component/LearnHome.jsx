// import React, {
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import {
//   ArrowRight,
//   BookOpen,
//   Briefcase,
//   CheckCircle2,
//   Code2,
//   Database,
//   FileText,
//   GraduationCap,
//   Layers3,
//   Network,
//   Rocket,
//   ShieldCheck,
//   Sparkles,
//   Users,
// } from "lucide-react";

// import {
//   Link,
// } from "react-router-dom";

// import {
//   Helmet,
// } from "react-helmet";

// /*
// |--------------------------------------------------------------------------
// | CONSTANTS
// |--------------------------------------------------------------------------
// */

// const SITE_URL =
//   "https://www.targettrek.in";

// const PAGE_URL =
//   `${SITE_URL}/learn`;

// const THEME_KEY =
//   "theme";

// const THEME_EVENT =
//   "targettrek-theme-change";

// /*
// |--------------------------------------------------------------------------
// | READ THEME
// |--------------------------------------------------------------------------
// */

// const readTheme = () => {
//   if (
//     typeof window ===
//     "undefined"
//   ) {
//     return "light";
//   }

//   const saved =
//     window.localStorage.getItem(
//       THEME_KEY
//     );

//   return saved === "dark"
//     ? "dark"
//     : "light";
// };

// /*
// |--------------------------------------------------------------------------
// | MAIN LEARNING AREAS
// |--------------------------------------------------------------------------
// */

// const LEARNING_AREAS = [
//   {
//     title:
//       "Technical Books",

//     description:
//       "Structured technical books for developers preparing for system design, backend and software engineering interviews.",

//     path:
//       "/books",

//     button:
//       "Explore Books",

//     icon:
//       BookOpen,

//     items: [
//       "System Design HLD",
//       "System Design LLD",
//       "GenAI learning",
//     ],
//   },

//   {
//     title:
//       "Interview Experiences",

//     description:
//       "Explore real interview processes, coding rounds, LLD, HLD, backend, AI and managerial discussions.",

//     path:
//       "/interviews",

//     button:
//       "Read Interviews",

//     icon:
//       Briefcase,

//     items: [
//       "SDE Interviews",
//       "Backend Interviews",
//       "AI / GenAI Interviews",
//     ],
//   },

//   {
//     title:
//       "Free Resources",

//     description:
//       "Learn focused engineering concepts through practical explanations, diagrams, examples and interview-oriented notes.",

//     path:
//       "/resources/hld/cache",

//     button:
//       "Start Learning",

//     icon:
//       GraduationCap,

//     items: [
//       "System Design",
//       "Architecture Concepts",
//       "Engineering Fundamentals",
//     ],
//   },

//   {
//     title:
//       "Engineering Blogs",

//     description:
//       "Read articles covering software engineering, development, interview preparation and practical technical topics.",

//     path:
//       "/blogs",

//     button:
//       "Read Blogs",

//     icon:
//       FileText,

//     items: [
//       "Engineering",
//       "Interview Preparation",
//       "Developer Learning",
//     ],
//   },
// ];

// /*
// |--------------------------------------------------------------------------
// | FEATURED BOOKS
// |--------------------------------------------------------------------------
// */

// const FEATURED_BOOKS = [
//   {
//     title:
//       "Mastering System Design — HLD",

//     label:
//       "High-Level Design",

//     description:
//       "Build a strong system-design interview approach covering requirements, APIs, databases, caching, scalability, concurrency, failure handling and architectural trade-offs.",

//     topics: [
//       "Requirements",
//       "Architecture",
//       "Caching",
//       "Databases",
//       "Scalability",
//       "Trade-offs",
//     ],

//     path:
//       "/book/system-design/hld",

//     icon:
//       Network,
//   },

//   {
//     title:
//       "Mastering System Design — LLD",

//     label:
//       "Java",

//     description:
//       "Strengthen object-oriented design using Java with OOP, SOLID, design patterns, UML, concurrency and interview-focused low-level design problems.",

//     topics: [
//       "OOP",
//       "SOLID",
//       "Java",
//       "Patterns",
//       "UML",
//       "Concurrency",
//     ],

//     path:
//       "/book/system-design/lld",

//     icon:
//       Code2,
//   },
// ];

// /*
// |--------------------------------------------------------------------------
// | CURRENT FREE RESOURCES
// |--------------------------------------------------------------------------
// |
// | These routes currently exist in App.jsx.
// |
// */

// const FREE_RESOURCES = [
//   {
//     title:
//       "Caching",

//     description:
//       "Understand caching strategies, invalidation, eviction policies, hot keys and distributed caching concepts.",

//     path:
//       "/resources/hld/cache",

//     icon:
//       Layers3,
//   },

//   {
//     title:
//       "Load Balancing",

//     description:
//       "Learn traffic distribution, L4 vs L7, balancing algorithms, health checks and high availability.",

//     path:
//       "/resources/hld/load-balancing",

//     icon:
//       Network,
//   },

//   {
//     title:
//       "Database Design",

//     description:
//       "Explore database selection, indexing, replication, sharding, consistency and scaling fundamentals.",

//     path:
//       "/resources/hld/database",

//     icon:
//       Database,
//   },

//   {
//     title:
//       "Message Queues",

//     description:
//       "Learn asynchronous processing, queues, consumer groups, retries, delivery guarantees and event-driven systems.",

//     path:
//       "/resources/hld/message-queue",

//     icon:
//       Rocket,
//   },

//   {
//     title:
//       "Rate Limiting",

//     description:
//       "Understand token bucket, leaky bucket, sliding windows and distributed API rate limiting.",

//     path:
//       "/resources/hld/rate-limiting",

//     icon:
//       ShieldCheck,
//   },

//   {
//     title:
//       "API Gateway",

//     description:
//       "Learn routing, authentication, authorization, throttling, resilience and API gateway architecture.",

//     path:
//       "/resources/hld/api-gateway",

//     icon:
//       Network,
//   },
// ];

// /*
// |--------------------------------------------------------------------------
// | WHY TARGETTREK
// |--------------------------------------------------------------------------
// */

// const BENEFITS = [
//   {
//     title:
//       "Practical Learning",

//     description:
//       "Focused explanations built around concepts developers actually encounter in interviews and engineering work.",

//     icon:
//       Code2,
//   },

//   {
//     title:
//       "Interview Focused",

//     description:
//       "Connect technical concepts with interview questions, design discussions and real interview experiences.",

//     icon:
//       Briefcase,
//   },

//   {
//     title:
//       "Structured Content",

//     description:
//       "Move from individual concepts to complete preparation without jumping through disconnected material.",

//     icon:
//       Layers3,
//   },

//   {
//     title:
//       "Free + In-Depth",

//     description:
//       "Start with free resources and use structured books when you want deeper, connected preparation.",

//     icon:
//       BookOpen,
//   },
// ];

// /*
// |--------------------------------------------------------------------------
// | SECTION HEADER
// |--------------------------------------------------------------------------
// */

// const SectionHeader = ({
//   eyebrow,
//   title,
//   description,
//   isDark,
//   center = false,
// }) => {
//   return (
//     <div
//       className={
//         center
//           ? "mx-auto max-w-3xl text-center"
//           : "max-w-3xl"
//       }
//     >
//       {eyebrow && (
//         <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-500">
//           {eyebrow}
//         </p>
//       )}

//       <h2
//         className={`mt-2 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl ${
//           isDark
//             ? "text-white"
//             : "text-slate-950"
//         }`}
//       >
//         {title}
//       </h2>

//       {description && (
//         <p
//           className={`mt-3 text-sm leading-7 sm:text-base ${
//             isDark
//               ? "text-slate-400"
//               : "text-slate-600"
//           }`}
//         >
//           {description}
//         </p>
//       )}
//     </div>
//   );
// };

// /*
// |--------------------------------------------------------------------------
// | LEARN HOME
// |--------------------------------------------------------------------------
// */

// const LearnHome = () => {
//   /*
//   |--------------------------------------------------------------------------
//   | THEME
//   |--------------------------------------------------------------------------
//   |
//   | Navbar controls the theme.
//   |
//   | This page:
//   |
//   | - reads localStorage
//   | - listens to Navbar
//   | - DOES NOT contain a toggle
//   |
//   */

//   const [
//     theme,
//     setTheme,
//   ] = useState(
//     readTheme
//   );

//   const isDark =
//     theme === "dark";

//   /*
//   |--------------------------------------------------------------------------
//   | LISTEN TO NAVBAR THEME
//   |--------------------------------------------------------------------------
//   */

//   useEffect(() => {
//     setTheme(
//       readTheme()
//     );

//     /*
//     |--------------------------------------------------------------------------
//     | SAME TAB
//     |--------------------------------------------------------------------------
//     */

//     const handleThemeChange =
//       (event) => {
//         const newTheme =
//           event?.detail
//             ?.theme;

//         if (
//           newTheme === "dark" ||
//           newTheme === "light"
//         ) {
//           setTheme(
//             newTheme
//           );
//         }
//       };

//     /*
//     |--------------------------------------------------------------------------
//     | OTHER TAB
//     |--------------------------------------------------------------------------
//     */

//     const handleStorageChange =
//       (event) => {
//         if (
//           event.key !==
//           THEME_KEY
//         ) {
//           return;
//         }

//         if (
//           event.newValue ===
//             "dark" ||
//           event.newValue ===
//             "light"
//         ) {
//           setTheme(
//             event.newValue
//           );
//         }
//       };

//     window.addEventListener(
//       THEME_EVENT,
//       handleThemeChange
//     );

//     window.addEventListener(
//       "storage",
//       handleStorageChange
//     );

//     return () => {
//       window.removeEventListener(
//         THEME_EVENT,
//         handleThemeChange
//       );

//       window.removeEventListener(
//         "storage",
//         handleStorageChange
//       );
//     };
//   }, []);

//   /*
//   |--------------------------------------------------------------------------
//   | THEME CLASSES
//   |--------------------------------------------------------------------------
//   */

//   const pageBg =
//     isDark
//       ? "bg-[#080D14]"
//       : "bg-[#F7FAFC]";

//   const sectionBg =
//     isDark
//       ? "bg-[#0B111A]"
//       : "bg-white";

//   const surface =
//     isDark
//       ? "border-slate-800 bg-[#101720]"
//       : "border-slate-200 bg-white";

//   const surfaceSoft =
//     isDark
//       ? "border-slate-800 bg-[#0C131C]"
//       : "border-slate-200 bg-slate-50";

//   const textPrimary =
//     isDark
//       ? "text-white"
//       : "text-slate-950";

//   const textSecondary =
//     isDark
//       ? "text-slate-400"
//       : "text-slate-600";

//   /*
//   |--------------------------------------------------------------------------
//   | SEO
//   |--------------------------------------------------------------------------
//   */

//   const seoDescription =
//     "Learn software engineering with TargetTrek. Explore system design books, Java LLD preparation, real software engineering interview experiences, free engineering resources and technical blogs.";

//   const webPageSchema =
//     useMemo(
//       () => ({
//         "@context":
//           "https://schema.org",

//         "@type":
//           "CollectionPage",

//         name:
//           "TargetTrek Learn",

//         headline:
//           "Software Engineering Books, Interviews and Learning Resources",

//         description:
//           seoDescription,

//         url:
//           PAGE_URL,

//         isPartOf: {
//           "@type":
//             "WebSite",

//           name:
//             "TargetTrek",

//           url:
//             SITE_URL,
//         },

//         publisher: {
//           "@type":
//             "Organization",

//           name:
//             "TargetTrek",

//           url:
//             SITE_URL,
//         },

//         about: [
//           "Software Engineering",
//           "System Design",
//           "Java",
//           "Backend Engineering",
//           "Technical Interviews",
//           "Developer Learning",
//         ],
//       }),
//       [
//         seoDescription,
//       ]
//     );

//   const breadcrumbSchema =
//     useMemo(
//       () => ({
//         "@context":
//           "https://schema.org",

//         "@type":
//           "BreadcrumbList",

//         itemListElement: [
//           {
//             "@type":
//               "ListItem",

//             position: 1,

//             name:
//               "TargetTrek",

//             item:
//               SITE_URL,
//           },

//           {
//             "@type":
//               "ListItem",

//             position: 2,

//             name:
//               "Learn",

//             item:
//               PAGE_URL,
//           },
//         ],
//       }),
//       []
//     );

//   const learningListSchema =
//     useMemo(
//       () => ({
//         "@context":
//           "https://schema.org",

//         "@type":
//           "ItemList",

//         name:
//           "TargetTrek Learning Sections",

//         itemListElement:
//           [
//             {
//               name:
//                 "Books",

//               url:
//                 `${SITE_URL}/books`,
//             },

//             {
//               name:
//                 "Interview Experiences",

//               url:
//                 `${SITE_URL}/interviews`,
//             },

//             {
//               name:
//                 "Engineering Blogs",

//               url:
//                 `${SITE_URL}/blogs`,
//             },

//             ...FREE_RESOURCES.map(
//               (
//                 resource
//               ) => ({
//                 name:
//                   resource.title,

//                 url:
//                   `${SITE_URL}${resource.path}`,
//               })
//             ),
//           ].map(
//             (
//               item,
//               index
//             ) => ({
//               "@type":
//                 "ListItem",

//               position:
//                 index + 1,

//               name:
//                 item.name,

//               url:
//                 item.url,
//             })
//           ),
//       }),
//       []
//     );

//   return (
//     <>
//       {/* ============================================================ */}
//       {/* SEO */}
//       {/* ============================================================ */}

//       <Helmet>
//         <title>
//           Learn Software Engineering,
//           System Design & Interviews |
//           TargetTrek
//         </title>

//         <meta
//           name="description"
//           content={
//             seoDescription
//           }
//         />

//         <meta
//           name="keywords"
//           content="software engineering resources, system design interview preparation, system design books, HLD book, LLD Java book, software engineer interview experiences, backend engineering, developer resources, TargetTrek learn"
//         />

//         <meta
//           name="robots"
//           content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
//         />

//         <link
//           rel="canonical"
//           href={
//             PAGE_URL
//           }
//         />

//         {/* OPEN GRAPH */}

//         <meta
//           property="og:type"
//           content="website"
//         />

//         <meta
//           property="og:site_name"
//           content="TargetTrek"
//         />

//         <meta
//           property="og:title"
//           content="TargetTrek Learn — Software Engineering Books, Interviews & Resources"
//         />

//         <meta
//           property="og:description"
//           content={
//             seoDescription
//           }
//         />

//         <meta
//           property="og:url"
//           content={
//             PAGE_URL
//           }
//         />

//         {/* TWITTER */}

//         <meta
//           name="twitter:card"
//           content="summary"
//         />

//         <meta
//           name="twitter:title"
//           content="TargetTrek Learn — Software Engineering Learning Hub"
//         />

//         <meta
//           name="twitter:description"
//           content={
//             seoDescription
//           }
//         />

//         {/* STRUCTURED DATA */}

//         <script
//           type="application/ld+json"
//         >
//           {JSON.stringify(
//             webPageSchema
//           )}
//         </script>

//         <script
//           type="application/ld+json"
//         >
//           {JSON.stringify(
//             breadcrumbSchema
//           )}
//         </script>

//         <script
//           type="application/ld+json"
//         >
//           {JSON.stringify(
//             learningListSchema
//           )}
//         </script>
//       </Helmet>

//       {/* ============================================================ */}
//       {/* PAGE */}
//       {/* ============================================================ */}

//       <main
//         className={`
//           min-h-screen
//           pt-16
//           transition-colors
//           duration-300
//           sm:pt-16
//           ${pageBg}
//         `}
//       >
//         {/* ========================================================== */}
//         {/* HERO */}
//         {/* ========================================================== */}

//         <section
//           className={`
//             relative
//             overflow-hidden
//             border-b
//             ${
//               isDark
//                 ? "border-slate-800 bg-[#080D14]"
//                 : "border-slate-200 bg-white"
//             }
//           `}
//         >
//           {/* SUBTLE DECORATION */}

//           <div className="pointer-events-none absolute inset-0 overflow-hidden">
//             <div
//               className={`
//                 absolute
//                 left-[8%]
//                 top-[-190px]
//                 h-[420px]
//                 w-[420px]
//                 rounded-full
//                 blur-[130px]
//                 ${
//                   isDark
//                     ? "bg-blue-900/15"
//                     : "bg-blue-100/70"
//                 }
//               `}
//             />

//             <div
//               className={`
//                 absolute
//                 right-[-160px]
//                 top-[20%]
//                 h-[400px]
//                 w-[400px]
//                 rounded-full
//                 blur-[130px]
//                 ${
//                   isDark
//                     ? "bg-cyan-900/10"
//                     : "bg-cyan-100/50"
//                 }
//               `}
//             />
//           </div>

//           <div
//             className="
//               relative
//               mx-auto
//               max-w-7xl
//               px-4
//               py-14

//               sm:px-6
//               sm:py-20

//               lg:px-8
//               lg:py-24
//             "
//           >
//             <div className="mx-auto max-w-4xl text-center">
//               {/* BADGE */}

//               <div
//                 className={`
//                   inline-flex
//                   items-center
//                   gap-2
//                   rounded-full
//                   border
//                   px-3.5
//                   py-1.5
//                   text-[11px]
//                   font-black
//                   uppercase
//                   tracking-[0.15em]
//                   ${
//                     isDark
//                       ? "border-blue-900/60 bg-blue-950/25 text-blue-300"
//                       : "border-blue-200 bg-blue-50 text-blue-700"
//                   }
//                 `}
//               >
//                 <Sparkles className="h-3.5 w-3.5" />

//                 TargetTrek Learn
//               </div>

//               {/* TITLE */}

//               <h1
//                 className={`
//                   mt-6
//                   text-4xl
//                   font-black
//                   leading-[1.08]
//                   tracking-tight

//                   sm:text-5xl

//                   lg:text-6xl

//                   ${textPrimary}
//                 `}
//               >
//                 Practical learning
//                 for{" "}

//                 <span className="text-blue-500">
//                   software engineers.
//                 </span>
//               </h1>

//               {/* DESCRIPTION */}

//               <p
//                 className={`
//                   mx-auto
//                   mt-6
//                   max-w-3xl
//                   text-base
//                   leading-8

//                   sm:text-lg

//                   ${textSecondary}
//                 `}
//               >
//                 Explore structured
//                 technical books, real
//                 interview experiences,
//                 free engineering
//                 resources and
//                 practical software
//                 development content
//                 in one place.
//               </p>

//               {/* CTA */}

//               <div
//                 className="
//                   mt-8
//                   flex
//                   flex-col
//                   items-stretch
//                   justify-center
//                   gap-3

//                   sm:flex-row
//                   sm:items-center
//                 "
//               >
//                 <Link
//                   to="/books"
//                   className="
//                     inline-flex
//                     min-h-[48px]
//                     items-center
//                     justify-center
//                     gap-2
//                     rounded-xl
//                     bg-blue-600
//                     px-6
//                     py-3
//                     text-sm
//                     font-black
//                     text-white
//                     transition
//                     hover:bg-blue-700
//                   "
//                 >
//                   Explore Books

//                   <ArrowRight className="h-4 w-4" />
//                 </Link>

//                 <Link
//                   to="/interviews"
//                   className={`
//                     inline-flex
//                     min-h-[48px]
//                     items-center
//                     justify-center
//                     gap-2
//                     rounded-xl
//                     border
//                     px-6
//                     py-3
//                     text-sm
//                     font-black
//                     transition
//                     ${
//                       isDark
//                         ? "border-slate-700 bg-slate-900 text-white hover:border-blue-700"
//                         : "border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:shadow-sm"
//                     }
//                   `}
//                 >
//                   Read Interviews
//                 </Link>
//               </div>

//               {/* TAGS */}

//               <div className="mt-8 flex flex-wrap justify-center gap-2">
//                 {[
//                   "System Design",
//                   "Java",
//                   "Backend",
//                   "Interviews",
//                   "Architecture",
//                   "GenAI",
//                 ].map(
//                   (item) => (
//                     <span
//                       key={
//                         item
//                       }
//                       className={`
//                         rounded-full
//                         border
//                         px-3
//                         py-1.5
//                         text-xs
//                         font-semibold
//                         ${
//                           isDark
//                             ? "border-slate-800 bg-slate-900/70 text-slate-400"
//                             : "border-slate-200 bg-slate-50 text-slate-600"
//                         }
//                       `}
//                     >
//                       {item}
//                     </span>
//                   )
//                 )}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ========================================================== */}
//         {/* EXPLORE */}
//         {/* ========================================================== */}

//         <section
//           className="
//             mx-auto
//             max-w-7xl
//             px-4
//             py-14

//             sm:px-6
//             sm:py-16

//             lg:px-8
//             lg:py-20
//           "
//         >
//           <SectionHeader
//             eyebrow="Explore TargetTrek"
//             title="Choose how you want to learn"
//             description="Use free resources for focused concepts, explore real interview experiences, read technical articles, or go deeper with structured books."
//             isDark={
//               isDark
//             }
//             center
//           />

//           <div
//             className="
//               mt-10
//               grid
//               gap-5

//               sm:grid-cols-2

//               xl:grid-cols-4
//             "
//           >
//             {LEARNING_AREAS.map(
//               (section) => {
//                 const Icon =
//                   section.icon;

//                 return (
//                   <Link
//                     key={
//                       section.title
//                     }
//                     to={
//                       section.path
//                     }
//                     className={`
//                       group
//                       flex
//                       min-h-full
//                       flex-col
//                       rounded-2xl
//                       border
//                       p-5
//                       transition-all
//                       duration-300

//                       sm:p-6

//                       hover:-translate-y-1

//                       ${surface}

//                       ${
//                         isDark
//                           ? "hover:border-blue-800"
//                           : "hover:border-blue-300 hover:shadow-lg"
//                       }
//                     `}
//                   >
//                     <div
//                       className={`
//                         flex
//                         h-11
//                         w-11
//                         items-center
//                         justify-center
//                         rounded-xl
//                         ${
//                           isDark
//                             ? "bg-blue-950/40 text-blue-300"
//                             : "bg-blue-50 text-blue-600"
//                         }
//                       `}
//                     >
//                       <Icon className="h-5 w-5" />
//                     </div>

//                     <h2
//                       className={`mt-5 text-lg font-black sm:text-xl ${textPrimary}`}
//                     >
//                       {
//                         section.title
//                       }
//                     </h2>

//                     <p
//                       className={`mt-2 flex-1 text-sm leading-7 ${textSecondary}`}
//                     >
//                       {
//                         section.description
//                       }
//                     </p>

//                     <div className="mt-5 space-y-2">
//                       {section.items.map(
//                         (
//                           item
//                         ) => (
//                           <div
//                             key={
//                               item
//                             }
//                             className="flex items-center gap-2"
//                           >
//                             <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />

//                             <span
//                               className={`text-xs ${
//                                 isDark
//                                   ? "text-slate-500"
//                                   : "text-slate-500"
//                               }`}
//                             >
//                               {
//                                 item
//                               }
//                             </span>
//                           </div>
//                         )
//                       )}
//                     </div>

//                     <div className="mt-6 flex items-center gap-2 text-sm font-black text-blue-500">
//                       {
//                         section.button
//                       }

//                       <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//                     </div>
//                   </Link>
//                 );
//               }
//             )}
//           </div>
//         </section>

//         {/* ========================================================== */}
//         {/* FEATURED BOOKS */}
//         {/* ========================================================== */}

//         <section
//           className={`
//             border-y
//             ${
//               isDark
//                 ? "border-slate-800 bg-[#0B111A]"
//                 : "border-slate-200 bg-white"
//             }
//           `}
//         >
//           <div
//             className="
//               mx-auto
//               max-w-7xl
//               px-4
//               py-14

//               sm:px-6
//               sm:py-16

//               lg:px-8
//               lg:py-20
//             "
//           >
//             <div
//               className="
//                 flex
//                 flex-col
//                 gap-5

//                 md:flex-row
//                 md:items-end
//                 md:justify-between
//               "
//             >
//               <SectionHeader
//                 eyebrow="Featured Books"
//                 title="Structured preparation when you want to go deeper"
//                 description="Move beyond isolated concepts with books designed to connect fundamentals, architecture, trade-offs and interview preparation."
//                 isDark={
//                   isDark
//                 }
//               />

//               <Link
//                 to="/books"
//                 className={`
//                   inline-flex
//                   shrink-0
//                   items-center
//                   gap-2
//                   self-start
//                   rounded-xl
//                   border
//                   px-4
//                   py-2.5
//                   text-sm
//                   font-bold
//                   transition

//                   md:self-auto

//                   ${
//                     isDark
//                       ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-700"
//                       : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
//                   }
//                 `}
//               >
//                 View All Books

//                 <ArrowRight className="h-4 w-4" />
//               </Link>
//             </div>

//             <div
//               className="
//                 mt-10
//                 grid
//                 gap-6

//                 lg:grid-cols-2
//               "
//             >
//               {FEATURED_BOOKS.map(
//                 (book) => {
//                   const Icon =
//                     book.icon;

//                   return (
//                     <article
//                       key={
//                         book.title
//                       }
//                       className={`
//                         group
//                         rounded-3xl
//                         border
//                         p-6
//                         transition-all
//                         duration-300

//                         sm:p-8

//                         ${surface}

//                         ${
//                           isDark
//                             ? "hover:border-blue-800"
//                             : "hover:border-blue-300 hover:shadow-xl"
//                         }
//                       `}
//                     >
//                       <div className="flex items-start justify-between gap-4">
//                         <div
//                           className={`
//                             flex
//                             h-12
//                             w-12
//                             items-center
//                             justify-center
//                             rounded-2xl
//                             ${
//                               isDark
//                                 ? "bg-blue-950/40 text-blue-300"
//                                 : "bg-blue-50 text-blue-600"
//                             }
//                           `}
//                         >
//                           <Icon className="h-6 w-6" />
//                         </div>

//                         <span
//                           className={`
//                             rounded-full
//                             px-3
//                             py-1
//                             text-[10px]
//                             font-black
//                             uppercase
//                             tracking-wider
//                             ${
//                               isDark
//                                 ? "bg-slate-800 text-slate-300"
//                                 : "bg-slate-100 text-slate-600"
//                             }
//                           `}
//                         >
//                           {book.label}
//                         </span>
//                       </div>

//                       <h3
//                         className={`mt-6 text-2xl font-black leading-tight ${textPrimary}`}
//                       >
//                         {book.title}
//                       </h3>

//                       <p
//                         className={`mt-3 text-sm leading-7 ${textSecondary}`}
//                       >
//                         {
//                           book.description
//                         }
//                       </p>

//                       <div className="mt-5 flex flex-wrap gap-2">
//                         {book.topics.map(
//                           (
//                             topic
//                           ) => (
//                             <span
//                               key={
//                                 topic
//                               }
//                               className={`
//                                 rounded-lg
//                                 px-2.5
//                                 py-1.5
//                                 text-xs
//                                 font-semibold
//                                 ${
//                                   isDark
//                                     ? "bg-slate-800 text-slate-400"
//                                     : "bg-slate-100 text-slate-600"
//                                 }
//                               `}
//                             >
//                               {
//                                 topic
//                               }
//                             </span>
//                           )
//                         )}
//                       </div>

//                       <Link
//                         to={
//                           book.path
//                         }
//                         className="
//                           mt-7
//                           inline-flex
//                           min-h-[44px]
//                           items-center
//                           justify-center
//                           gap-2
//                           rounded-xl
//                           bg-blue-600
//                           px-5
//                           py-2.5
//                           text-sm
//                           font-black
//                           text-white
//                           transition
//                           hover:bg-blue-700
//                         "
//                       >
//                         View Book

//                         <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//                       </Link>
//                     </article>
//                   );
//                 }
//               )}
//             </div>
//           </div>
//         </section>

//         {/* ========================================================== */}
//         {/* INTERVIEW EXPERIENCE */}
//         {/* ========================================================== */}

//         <section
//           className="
//             mx-auto
//             max-w-7xl
//             px-4
//             py-14

//             sm:px-6
//             sm:py-16

//             lg:px-8
//             lg:py-20
//           "
//         >
//           <div
//             className={`
//               overflow-hidden
//               rounded-3xl
//               border
//               ${surface}
//             `}
//           >
//             <div
//               className="
//                 grid

//                 lg:grid-cols-[1.1fr_0.9fr]
//               "
//             >
//               {/* LEFT */}

//               <div className="p-6 sm:p-8 lg:p-10">
//                 <div
//                   className={`
//                     inline-flex
//                     items-center
//                     gap-2
//                     rounded-full
//                     border
//                     px-3
//                     py-1.5
//                     text-[11px]
//                     font-black
//                     uppercase
//                     tracking-[0.14em]
//                     ${
//                       isDark
//                         ? "border-slate-700 bg-slate-800 text-slate-300"
//                         : "border-slate-200 bg-slate-50 text-slate-600"
//                     }
//                   `}
//                 >
//                   <Briefcase className="h-3.5 w-3.5" />

//                   Interview Experiences
//                 </div>

//                 <h2
//                   className={`mt-5 text-2xl font-black tracking-tight sm:text-3xl ${textPrimary}`}
//                 >
//                   Learn from real
//                   software engineering
//                   interview journeys.
//                 </h2>

//                 <p
//                   className={`mt-4 max-w-2xl text-sm leading-7 sm:text-base ${textSecondary}`}
//                 >
//                   Understand interview
//                   rounds, questions,
//                   design discussions
//                   and preparation
//                   approaches across
//                   software engineering,
//                   backend and AI roles.
//                 </p>

//                 <div className="mt-6 grid gap-3 sm:grid-cols-2">
//                   {[
//                     "DSA & Coding",
//                     "LLD Discussions",
//                     "HLD Interviews",
//                     "Backend Questions",
//                     "GenAI Interviews",
//                     "Managerial Rounds",
//                   ].map(
//                     (
//                       item
//                     ) => (
//                       <div
//                         key={
//                           item
//                         }
//                         className="flex items-center gap-2"
//                       >
//                         <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />

//                         <span
//                           className={`text-sm ${textSecondary}`}
//                         >
//                           {item}
//                         </span>
//                       </div>
//                     )
//                   )}
//                 </div>

//                 <Link
//                   to="/interviews"
//                   className="
//                     mt-7
//                     inline-flex
//                     min-h-[44px]
//                     items-center
//                     justify-center
//                     gap-2
//                     rounded-xl
//                     bg-blue-600
//                     px-5
//                     py-2.5
//                     text-sm
//                     font-black
//                     text-white
//                     transition
//                     hover:bg-blue-700
//                   "
//                 >
//                   Explore Interviews

//                   <ArrowRight className="h-4 w-4" />
//                 </Link>
//               </div>

//               {/* RIGHT */}

//               <div
//                 className={`
//                   flex
//                   items-center
//                   justify-center
//                   border-t
//                   p-6

//                   sm:p-8

//                   lg:border-l
//                   lg:border-t-0
//                   lg:p-10

//                   ${
//                     isDark
//                       ? "border-slate-800 bg-[#0C131C]"
//                       : "border-slate-200 bg-slate-50"
//                   }
//                 `}
//               >
//                 <div className="w-full max-w-md space-y-3">
//                   {[
//                     {
//                       title:
//                         "SDE Interview",

//                       flow:
//                         "DSA → LLD → HLD → Managerial",
//                     },

//                     {
//                       title:
//                         "Backend Interview",

//                       flow:
//                         "Java → APIs → SQL → Architecture",
//                     },

//                     {
//                       title:
//                         "AI / GenAI Interview",

//                       flow:
//                         "RAG → Agents → MCP → Projects",
//                     },
//                   ].map(
//                     (
//                       item,
//                       index
//                     ) => (
//                       <div
//                         key={
//                           item.title
//                         }
//                         className={`
//                           rounded-2xl
//                           border
//                           p-4

//                           sm:p-5

//                           ${surface}

//                           ${
//                             index ===
//                             1
//                               ? "sm:ml-5"
//                               : ""
//                           }
//                         `}
//                       >
//                         <div className="flex items-center gap-3">
//                           <div
//                             className={`
//                               flex
//                               h-9
//                               w-9
//                               shrink-0
//                               items-center
//                               justify-center
//                               rounded-xl
//                               ${
//                                 isDark
//                                   ? "bg-slate-800 text-blue-300"
//                                   : "bg-blue-50 text-blue-600"
//                               }
//                             `}
//                           >
//                             <Users className="h-4 w-4" />
//                           </div>

//                           <div className="min-w-0">
//                             <p
//                               className={`text-sm font-black ${textPrimary}`}
//                             >
//                               {
//                                 item.title
//                               }
//                             </p>

//                             <p
//                               className={`mt-1 text-xs leading-5 ${textSecondary}`}
//                             >
//                               {
//                                 item.flow
//                               }
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     )
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ========================================================== */}
//         {/* FREE RESOURCES */}
//         {/* ========================================================== */}

//         <section
//           className={`
//             border-y
//             ${
//               isDark
//                 ? "border-slate-800 bg-[#0B111A]"
//                 : "border-slate-200 bg-white"
//             }
//           `}
//         >
//           <div
//             className="
//               mx-auto
//               max-w-7xl
//               px-4
//               py-14

//               sm:px-6
//               sm:py-16

//               lg:px-8
//               lg:py-20
//             "
//           >
//             <SectionHeader
//               eyebrow="Free Engineering Resources"
//               title="Strengthen individual concepts before going deeper"
//               description="Explore focused system-design topics with practical explanations, architecture examples and interview-oriented notes."
//               isDark={
//                 isDark
//               }
//               center
//             />

//             <div
//               className="
//                 mt-10
//                 grid
//                 gap-5

//                 sm:grid-cols-2

//                 lg:grid-cols-3
//               "
//             >
//               {FREE_RESOURCES.map(
//                 (
//                   resource
//                 ) => {
//                   const Icon =
//                     resource.icon;

//                   return (
//                     <Link
//                       key={
//                         resource.title
//                       }
//                       to={
//                         resource.path
//                       }
//                       className={`
//                         group
//                         rounded-2xl
//                         border
//                         p-5
//                         transition-all
//                         duration-300
//                         hover:-translate-y-1

//                         sm:p-6

//                         ${surface}

//                         ${
//                           isDark
//                             ? "hover:border-blue-800"
//                             : "hover:border-blue-300 hover:shadow-lg"
//                         }
//                       `}
//                     >
//                       <div
//                         className={`
//                           flex
//                           h-11
//                           w-11
//                           items-center
//                           justify-center
//                           rounded-xl
//                           ${
//                             isDark
//                               ? "bg-slate-800 text-blue-300"
//                               : "bg-blue-50 text-blue-600"
//                           }
//                         `}
//                       >
//                         <Icon className="h-5 w-5" />
//                       </div>

//                       <h3
//                         className={`mt-5 text-lg font-black ${textPrimary}`}
//                       >
//                         {
//                           resource.title
//                         }
//                       </h3>

//                       <p
//                         className={`mt-2 text-sm leading-7 ${textSecondary}`}
//                       >
//                         {
//                           resource.description
//                         }
//                       </p>

//                       <div className="mt-5 flex items-center gap-2 text-sm font-black text-blue-500">
//                         Read Resource

//                         <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
//                       </div>
//                     </Link>
//                   );
//                 }
//               )}
//             </div>
//           </div>
//         </section>

//         {/* ========================================================== */}
//         {/* FREE VS STRUCTURED */}
//         {/* ========================================================== */}

//         <section
//           className="
//             mx-auto
//             max-w-7xl
//             px-4
//             py-14

//             sm:px-6
//             sm:py-16

//             lg:px-8
//             lg:py-20
//           "
//         >
//           <SectionHeader
//             eyebrow="Learn Your Way"
//             title="Free resources and structured books solve different needs"
//             description="Use focused resources when you need one concept. Use books when you want a complete topic connected from fundamentals to interview-level design."
//             isDark={
//               isDark
//             }
//             center
//           />

//           <div
//             className="
//               mx-auto
//               mt-10
//               grid
//               max-w-5xl
//               gap-5

//               md:grid-cols-2
//             "
//           >
//             {/* FREE */}

//             <div
//               className={`
//                 rounded-3xl
//                 border
//                 p-6

//                 sm:p-8

//                 ${surface}
//               `}
//             >
//               <div
//                 className={`
//                   flex
//                   h-11
//                   w-11
//                   items-center
//                   justify-center
//                   rounded-xl
//                   ${
//                     isDark
//                       ? "bg-emerald-950/30 text-emerald-300"
//                       : "bg-emerald-50 text-emerald-600"
//                   }
//                 `}
//               >
//                 <GraduationCap className="h-5 w-5" />
//               </div>

//               <p className="mt-5 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-500">
//                 Free Resources
//               </p>

//               <h3
//                 className={`mt-2 text-2xl font-black ${textPrimary}`}
//               >
//                 Learn individual
//                 engineering concepts
//               </h3>

//               <p
//                 className={`mt-3 text-sm leading-7 ${textSecondary}`}
//               >
//                 Ideal when you want a
//                 focused explanation,
//                 quick revision or an
//                 introduction to one
//                 technical topic.
//               </p>

//               <div className="mt-5 space-y-3">
//                 {[
//                   "Focused explanations",
//                   "Architecture diagrams",
//                   "Technical examples",
//                   "Interview questions",
//                 ].map(
//                   (
//                     item
//                   ) => (
//                     <div
//                       key={
//                         item
//                       }
//                       className="flex items-center gap-2"
//                     >
//                       <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />

//                       <span
//                         className={`text-sm ${textSecondary}`}
//                       >
//                         {item}
//                       </span>
//                     </div>
//                   )
//                 )}
//               </div>

//               <Link
//                 to="/resources/hld/cache"
//                 className="mt-7 inline-flex items-center gap-2 text-sm font-black text-emerald-500"
//               >
//                 Start Learning

//                 <ArrowRight className="h-4 w-4" />
//               </Link>
//             </div>

//             {/* BOOKS */}

//             <div
//               className={`
//                 rounded-3xl
//                 border
//                 p-6

//                 sm:p-8

//                 ${
//                   isDark
//                     ? "border-blue-900/60 bg-blue-950/10"
//                     : "border-blue-200 bg-blue-50/40"
//                 }
//               `}
//             >
//               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
//                 <BookOpen className="h-5 w-5" />
//               </div>

//               <p className="mt-5 text-[11px] font-black uppercase tracking-[0.16em] text-blue-500">
//                 Structured Books
//               </p>

//               <h3
//                 className={`mt-2 text-2xl font-black ${textPrimary}`}
//               >
//                 Prepare complete
//                 topics in depth
//               </h3>

//               <p
//                 className={`mt-3 text-sm leading-7 ${textSecondary}`}
//               >
//                 Ideal when you want a
//                 connected learning
//                 path, deeper
//                 explanations and
//                 complete interview
//                 preparation.
//               </p>

//               <div className="mt-5 space-y-3">
//                 {[
//                   "Structured progression",
//                   "Deep explanations",
//                   "Connected concepts",
//                   "Complete preparation",
//                 ].map(
//                   (
//                     item
//                   ) => (
//                     <div
//                       key={
//                         item
//                       }
//                       className="flex items-center gap-2"
//                     >
//                       <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />

//                       <span
//                         className={`text-sm ${textSecondary}`}
//                       >
//                         {item}
//                       </span>
//                     </div>
//                   )
//                 )}
//               </div>

//               <Link
//                 to="/books"
//                 className="mt-7 inline-flex items-center gap-2 text-sm font-black text-blue-500"
//               >
//                 Explore Books

//                 <ArrowRight className="h-4 w-4" />
//               </Link>
//             </div>
//           </div>
//         </section>

//         {/* ========================================================== */}
//         {/* WHY TARGETTREK */}
//         {/* ========================================================== */}

//         <section
//           className={`
//             border-y
//             ${
//               isDark
//                 ? "border-slate-800 bg-[#0B111A]"
//                 : "border-slate-200 bg-white"
//             }
//           `}
//         >
//           <div
//             className="
//               mx-auto
//               max-w-7xl
//               px-4
//               py-14

//               sm:px-6
//               sm:py-16

//               lg:px-8
//               lg:py-20
//             "
//           >
//             <SectionHeader
//               eyebrow="Why TargetTrek"
//               title="Learning built around software engineering"
//               description="Technical content should be practical, understandable and connected to the situations developers actually face."
//               isDark={
//                 isDark
//               }
//               center
//             />

//             <div
//               className="
//                 mt-10
//                 grid
//                 gap-5

//                 sm:grid-cols-2

//                 lg:grid-cols-4
//               "
//             >
//               {BENEFITS.map(
//                 (
//                   item
//                 ) => {
//                   const Icon =
//                     item.icon;

//                   return (
//                     <div
//                       key={
//                         item.title
//                       }
//                       className={`
//                         rounded-2xl
//                         border
//                         p-5

//                         sm:p-6

//                         ${surface}
//                       `}
//                     >
//                       <div
//                         className={`
//                           flex
//                           h-10
//                           w-10
//                           items-center
//                           justify-center
//                           rounded-xl
//                           ${
//                             isDark
//                               ? "bg-slate-800 text-blue-300"
//                               : "bg-blue-50 text-blue-600"
//                           }
//                         `}
//                       >
//                         <Icon className="h-5 w-5" />
//                       </div>

//                       <h3
//                         className={`mt-4 font-black ${textPrimary}`}
//                       >
//                         {
//                           item.title
//                         }
//                       </h3>

//                       <p
//                         className={`mt-2 text-sm leading-7 ${textSecondary}`}
//                       >
//                         {
//                           item.description
//                         }
//                       </p>
//                     </div>
//                   );
//                 }
//               )}
//             </div>
//           </div>
//         </section>

//         {/* ========================================================== */}
//         {/* BOTTOM CTA */}
//         {/* NO BLUE/PURPLE GRADIENT */}
//         {/* ========================================================== */}

//         <section
//           className="
//             mx-auto
//             max-w-7xl
//             px-4
//             py-14

//             sm:px-6
//             sm:py-16

//             lg:px-8
//             lg:py-20
//           "
//         >
//           <div
//             className={`
//               relative
//               overflow-hidden
//               rounded-3xl
//               border
//               p-6

//               sm:p-8

//               lg:p-10

//               ${
//                 isDark
//                   ? "border-slate-800 bg-[#080D14]"
//                   : "border-slate-800 bg-[#0B111A]"
//               }
//             `}
//           >
//             {/* SUBTLE BACKGROUND ONLY */}

//             <div className="pointer-events-none absolute inset-0">
//               <div className="absolute right-[-140px] top-[-170px] h-[360px] w-[360px] rounded-full bg-blue-900/15 blur-[110px]" />

//               <div className="absolute bottom-[-180px] left-[20%] h-[300px] w-[300px] rounded-full bg-cyan-900/10 blur-[120px]" />
//             </div>

//             <div
//               className="
//                 relative
//                 grid
//                 gap-8

//                 lg:grid-cols-[1fr_auto]
//                 lg:items-center
//               "
//             >
//               <div className="max-w-3xl">
//                 <div
//                   className="
//                     inline-flex
//                     items-center
//                     gap-2
//                     rounded-full
//                     border
//                     border-slate-700
//                     bg-slate-900/70
//                     px-3
//                     py-1.5
//                     text-[11px]
//                     font-black
//                     uppercase
//                     tracking-[0.15em]
//                     text-blue-300
//                   "
//                 >
//                   <Rocket className="h-3.5 w-3.5" />

//                   Keep Learning
//                 </div>

//                 <h2
//                   className="
//                     mt-5
//                     text-2xl
//                     font-black
//                     tracking-tight
//                     text-white

//                     sm:text-3xl

//                     lg:text-4xl
//                   "
//                 >
//                   Build stronger
//                   engineering skills
//                   with focused,
//                   practical learning.
//                 </h2>

//                 <p
//                   className="
//                     mt-4
//                     max-w-2xl
//                     text-sm
//                     leading-7
//                     text-slate-400

//                     sm:text-base
//                   "
//                 >
//                   Explore technical
//                   concepts, learn from
//                   real interview
//                   experiences and use
//                   structured books
//                   whenever you need
//                   deeper preparation.
//                 </p>
//               </div>

//               {/* BUTTONS */}

//               <div
//                 className="
//                   flex
//                   w-full
//                   flex-col
//                   gap-3

//                   sm:w-auto
//                   sm:flex-row

//                   lg:flex-col
//                 "
//               >
//                 <Link
//                   to="/resources/hld/cache"
//                   className="
//                     inline-flex
//                     min-h-[48px]
//                     w-full
//                     items-center
//                     justify-center
//                     gap-2
//                     rounded-xl
//                     bg-white
//                     px-5
//                     py-3
//                     text-sm
//                     font-black
//                     text-slate-950
//                     transition
//                     hover:bg-slate-100

//                     sm:w-auto
//                   "
//                 >
//                   Explore Resources

//                   <ArrowRight className="h-4 w-4" />
//                 </Link>

//                 <Link
//                   to="/interviews"
//                   className="
//                     inline-flex
//                     min-h-[48px]
//                     w-full
//                     items-center
//                     justify-center
//                     gap-2
//                     rounded-xl
//                     border
//                     border-slate-700
//                     bg-slate-900
//                     px-5
//                     py-3
//                     text-sm
//                     font-black
//                     text-white
//                     transition
//                     hover:border-slate-600
//                     hover:bg-slate-800

//                     sm:w-auto
//                   "
//                 >
//                   Interview Experiences
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>
//     </>
//   );
// };

// export default LearnHome;

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Code2,
  Database,
  FileCode2,
  FileText,
  GraduationCap,
  Layers3,
  Lightbulb,
  LockKeyhole,
  Network,
  RadioTower,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Target,
  Workflow,
  Zap,
} from "lucide-react";

// =====================================================
// CONFIGURATION
// =====================================================

const SITE_URL = "https://www.targettrek.in";
const PAGE_URL = `${SITE_URL}/learn`;

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SEO_TITLE =
  "Learn Software Engineering, System Design & GenAI | Target Trek";

const SEO_DESCRIPTION =
  "Explore software engineering resources at Target Trek. Learn System Design HLD, Java LLD, backend architecture, GenAI, and technical interview preparation through books, free resources, and interview experiences.";

// =====================================================
// THEME
// =====================================================

const readTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    return window.localStorage.getItem(THEME_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

// =====================================================
// EXISTING ROUTES
// =====================================================

const LEARNING_AREAS = [
  {
    id: "books",
    number: "01",
    eyebrow: "GUIDED LEARNING",
    title: "Technical Books",
    description:
      "Comprehensive engineering handbooks that take you from fundamentals to interview-level architecture and implementation.",
    path: "/books",
    action: "Explore books",
    icon: BookOpen,
    topics: [
      "System Design HLD",
      "Java LLD",
      "GenAI & Agents",
    ],
  },
  {
    id: "interviews",
    number: "02",
    eyebrow: "CAREER PREPARATION",
    title: "Interview Experiences",
    description:
      "Explore interview journeys, technical rounds, DSA, low-level design, high-level design, and engineering discussions.",
    path: "/interviews",
    action: "Explore interviews",
    icon: BriefcaseBusiness,
    topics: [
      "DSA & Coding",
      "System Design",
      "Backend & GenAI",
    ],
  },
  {
    id: "resources",
    number: "03",
    eyebrow: "LEARN FOR FREE",
    title: "Engineering Resources",
    description:
      "Focused learning resources on system architecture, scalability, databases, distributed systems, and backend fundamentals.",
    path: "/resources/hld/cache",
    action: "Start learning",
    icon: GraduationCap,
    topics: [
      "Architecture",
      "Databases",
      "Distributed Systems",
    ],
  },
  {
    id: "blogs",
    number: "04",
    eyebrow: "ARTICLES & INSIGHTS",
    title: "Engineering Blogs",
    description:
      "Understand complex engineering ideas through practical explanations, examples, concepts, and technical articles.",
    path: "/blogs",
    action: "Read articles",
    icon: FileText,
    topics: [
      "Development",
      "Engineering",
      "Interview Prep",
    ],
  },
];

// =====================================================
// FEATURED BOOKS
// =====================================================

const FEATURED_BOOKS = [
  {
    number: "01",
    type: "HIGH-LEVEL DESIGN",
    title: "Mastering System Design",
    highlight: "HLD",
    subtitle: "Think in systems. Design for scale.",
    description:
      "Learn to approach system design interviews with clear requirements, APIs, data modeling, scalable architectures, caching, distributed systems, failure handling, and trade-offs.",
    path: "/book/system-design/hld",
    icon: Network,
    topics: [
      "Architecture",
      "Databases",
      "Redis",
      "Kafka",
      "Scalability",
      "Trade-offs",
    ],
    benefits: [
      "Understand production-style architectures",
      "Practice structured system design discussions",
      "Prepare for HLD interviews",
    ],
  },
  {
    number: "02",
    type: "LOW-LEVEL DESIGN",
    title: "Mastering System Design",
    highlight: "LLD",
    subtitle: "Write better Java. Design better software.",
    description:
      "Master object-oriented design in Java through OOP, SOLID principles, UML, design patterns, concurrency, locking, and detailed interview-oriented design problems.",
    path: "/book/system-design/lld",
    icon: Code2,
    topics: [
      "Java",
      "OOP",
      "SOLID",
      "UML",
      "Design Patterns",
      "Concurrency",
    ],
    benefits: [
      "Strengthen object-oriented design skills",
      "Learn reusable design patterns",
      "Practice Java LLD interview questions",
    ],
  },
];

// =====================================================
// EXISTING FREE RESOURCE ROUTES
// =====================================================

const FREE_RESOURCES = [
  {
    number: "01",
    title: "Caching",
    description:
      "Learn caching strategies, eviction policies, cache invalidation, Redis, TTLs, and distributed cache design.",
    icon: Layers3,
    path: "/resources/hld/cache",
    category: "Performance",
    tags: ["Redis", "Cache Aside", "TTL"],
  },
  {
    number: "02",
    title: "Load Balancing",
    description:
      "Understand L4 vs L7 load balancing, request routing, health checks, high availability, and traffic distribution.",
    icon: Network,
    path: "/resources/hld/load-balancing",
    category: "Scalability",
    tags: ["L4 / L7", "Routing", "HA"],
  },
  {
    number: "03",
    title: "Database Design",
    description:
      "Explore SQL vs NoSQL, indexes, replication, sharding, consistency, database selection, and scaling strategies.",
    icon: Database,
    path: "/resources/hld/database",
    category: "Data",
    tags: ["SQL", "NoSQL", "Sharding"],
  },
  {
    number: "04",
    title: "Message Queues",
    description:
      "Understand asynchronous communication, event-driven systems, queues, consumers, retries, and delivery guarantees.",
    icon: RadioTower,
    path: "/resources/hld/message-queue",
    category: "Distributed Systems",
    tags: ["Kafka", "Events", "Retries"],
  },
  {
    number: "05",
    title: "Rate Limiting",
    description:
      "Learn token bucket, leaky bucket, fixed windows, sliding windows, and distributed API rate limiting.",
    icon: ShieldCheck,
    path: "/resources/hld/rate-limiting",
    category: "Reliability",
    tags: ["Token Bucket", "Redis", "API"],
  },
  {
    number: "06",
    title: "API Gateway",
    description:
      "Explore API routing, authentication, authorization, throttling, security, and resilient gateway architecture.",
    icon: Server,
    path: "/resources/hld/api-gateway",
    category: "Architecture",
    tags: ["Routing", "Security", "API"],
  },
];

// =====================================================
// LEARNING BENEFITS
// =====================================================

const BENEFITS = [
  {
    icon: Target,
    title: "Interview-oriented",
    description:
      "Connect technical knowledge with the kinds of questions and discussions used in engineering interviews.",
  },
  {
    icon: Layers3,
    title: "Structured content",
    description:
      "Move from individual concepts to complete systems without relying on disconnected learning materials.",
  },
  {
    icon: Code2,
    title: "Practical engineering",
    description:
      "Understand implementation decisions, design patterns, scalability, concurrency, and production trade-offs.",
  },
  {
    icon: Rocket,
    title: "Learn at your pace",
    description:
      "Use free resources for quick revision or deeper books when preparing a complete subject.",
  },
];

// =====================================================
// INTERVIEW PREPARATION CATEGORIES
// =====================================================

const INTERVIEW_TOPICS = [
  {
    icon: FileCode2,
    title: "DSA & Problem Solving",
    description:
      "Coding questions, algorithmic thinking, optimization, and problem-solving discussions.",
  },
  {
    icon: Code2,
    title: "Low-Level Design",
    description:
      "Object-oriented modeling, design patterns, classes, interfaces, concurrency, and Java.",
  },
  {
    icon: Network,
    title: "High-Level Design",
    description:
      "Architecture, databases, scale, caching, queues, consistency, and distributed systems.",
  },
  {
    icon: Sparkles,
    title: "AI & GenAI Engineering",
    description:
      "RAG, agents, MCP, orchestration, backend integrations, and real-world AI project discussions.",
  },
];

// =====================================================
// REUSABLE COMPONENTS
// =====================================================

const cn = (...classes) => classes.filter(Boolean).join(" ");

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  actionPath,
  center = false,
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        !center &&
          "sm:flex-row sm:items-end sm:justify-between"
      )}
    >
      <div
        className={cn(
          "max-w-[760px]",
          center && "mx-auto text-center"
        )}
      >
        <div className="learn-eyebrow">
          <span className="learn-eyebrow-line" />
          {eyebrow}
        </div>

        <h2 className="learn-section-title">
          {title}
        </h2>

        {description && (
          <p className="learn-section-description">
            {description}
          </p>
        )}
      </div>

      {action && actionPath && (
        <Link
          to={actionPath}
          className="learn-text-link shrink-0"
        >
          {action}
          <ArrowUpRight size={16} />
        </Link>
      )}
    </div>
  );
}

function TopicChip({ children }) {
  return (
    <span className="learn-topic-chip">
      {children}
    </span>
  );
}

function LearningAreaCard({ item }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      className="learn-area-card group"
    >
      <div className="learn-area-top">
        <div className="learn-area-icon">
          <Icon size={23} strokeWidth={1.8} />
        </div>

        <span className="learn-area-number">
          {item.number}
        </span>
      </div>

      <p className="learn-card-kicker">
        {item.eyebrow}
      </p>

      <h3 className="learn-area-title">
        {item.title}
      </h3>

      <p className="learn-area-description">
        {item.description}
      </p>

      <div className="learn-area-topics">
        {item.topics.map((topic) => (
          <TopicChip key={topic}>
            {topic}
          </TopicChip>
        ))}
      </div>

      <div className="learn-area-footer">
        <span>{item.action}</span>

        <span className="learn-arrow-circle">
          <ArrowUpRight size={17} />
        </span>
      </div>
    </Link>
  );
}

function FeaturedBookCard({ book, index }) {
  const Icon = book.icon;

  return (
    <article
      className={cn(
        "learn-featured-card",
        index === 0 && "learn-featured-primary"
      )}
    >
      <div className="learn-featured-inner">
        <div className="learn-featured-content">
          <div className="learn-featured-meta">
            <span className="learn-featured-number">
              {book.number}
            </span>

            <span className="learn-featured-type">
              {book.type}
            </span>
          </div>

          <h3 className="learn-featured-title">
            {book.title}
            <span>{book.highlight}</span>
          </h3>

          <p className="learn-featured-subtitle">
            {book.subtitle}
          </p>

          <p className="learn-featured-description">
            {book.description}
          </p>

          <div className="learn-featured-topics">
            {book.topics.map((topic) => (
              <span
                key={topic}
                className="learn-featured-topic"
              >
                {topic}
              </span>
            ))}
          </div>

          <div className="learn-featured-benefits">
            {book.benefits.map((benefit) => (
              <div
                key={benefit}
                className="learn-featured-benefit"
              >
                <Check size={15} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <Link
            to={book.path}
            className="learn-btn learn-btn-orange"
          >
            Explore {book.highlight} Book
            <ArrowUpRight size={17} />
          </Link>
        </div>

        <div className="learn-featured-art">
          <div className="learn-art-grid" />

          <div className="learn-art-orbit learn-art-orbit-one" />
          <div className="learn-art-orbit learn-art-orbit-two" />

          <div className="learn-art-book">
            <div className="learn-art-book-top">
              <span>TARGET TREK</span>
              <Icon size={20} />
            </div>

            <div className="learn-art-book-visual">
              {index === 0 ? (
                <svg
                  viewBox="0 0 260 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect
                    x="83"
                    y="60"
                    width="94"
                    height="43"
                    rx="7"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <rect
                    x="96"
                    y="71"
                    width="68"
                    height="20"
                    rx="3"
                    fill="currentColor"
                    fillOpacity=".12"
                  />

                  <path
                    d="M130 60V35M130 103V126M83 81H52M177 81H208"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <rect
                    x="96"
                    y="12"
                    width="68"
                    height="23"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <rect
                    x="16"
                    y="67"
                    width="36"
                    height="28"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <rect
                    x="208"
                    y="67"
                    width="36"
                    height="28"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <rect
                    x="97"
                    y="126"
                    width="66"
                    height="23"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <circle
                    cx="130"
                    cy="81"
                    r="4"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 260 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect
                    x="19"
                    y="20"
                    width="222"
                    height="120"
                    rx="9"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <path
                    d="M19 48H241"
                    stroke="currentColor"
                    strokeWidth="2"
                  />

                  <circle cx="36" cy="34" r="4" fill="currentColor" />
                  <circle cx="50" cy="34" r="4" fill="currentColor" fillOpacity=".65" />
                  <circle cx="64" cy="34" r="4" fill="currentColor" fillOpacity=".35" />

                  <path
                    d="M86 69L62 91L86 113M175 69L199 91L175 113M143 64L118 118"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>

            <div className="learn-art-book-bottom">
              <span className="learn-art-book-label">
                MASTERING SYSTEM DESIGN
              </span>

              <span className="learn-art-book-heading">
                {book.highlight}
              </span>

              <span className="learn-art-book-description">
                {index === 0
                  ? "HIGH-LEVEL DESIGN"
                  : "LOW-LEVEL DESIGN · JAVA"}
              </span>

              <div className="learn-art-book-rule" />

              <span className="learn-art-book-footer">
                ENGINEERING HANDBOOK
              </span>
            </div>
          </div>

          <div className="learn-art-floating-tag">
            <Icon size={16} />
            <span>
              {index === 0
                ? "Architecture"
                : "Java + OOP"}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function ResourceCard({ resource }) {
  const Icon = resource.icon;

  return (
    <Link
      to={resource.path}
      className="learn-resource-card group"
    >
      <div className="learn-resource-header">
        <div className="learn-resource-icon">
          <Icon size={21} strokeWidth={1.8} />
        </div>

        <span className="learn-resource-number">
          {resource.number}
        </span>
      </div>

      <span className="learn-resource-category">
        {resource.category}
      </span>

      <h3 className="learn-resource-title">
        {resource.title}
      </h3>

      <p className="learn-resource-description">
        {resource.description}
      </p>

      <div className="learn-resource-tags">
        {resource.tags.map((tag) => (
          <TopicChip key={tag}>
            {tag}
          </TopicChip>
        ))}
      </div>

      <div className="learn-resource-link">
        Read resource
        <ArrowUpRight size={16} />
      </div>
    </Link>
  );
}

// =====================================================
// MAIN PAGE
// =====================================================

export default function LearnHome() {
  const [theme, setTheme] = useState(readTheme);
  const [activeFaq, setActiveFaq] = useState(null);

  const isDark = theme === "dark";

  // Navbar controls theme. No local theme switch.
  useEffect(() => {
    const syncTheme = (event) => {
      const nextTheme = event?.detail?.theme;

      if (nextTheme === "dark" || nextTheme === "light") {
        setTheme(nextTheme);
        return;
      }

      setTheme(readTheme());
    };

    const onStorage = (event) => {
      if (!event.key || event.key === THEME_KEY) {
        setTheme(readTheme());
      }
    };

    window.addEventListener(THEME_EVENT, syncTheme);
    window.addEventListener("themechange", syncTheme);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", syncTheme);

    return () => {
      window.removeEventListener(THEME_EVENT, syncTheme);
      window.removeEventListener("themechange", syncTheme);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", syncTheme);
    };
  }, []);

  const faqs = [
    {
      question: "Where should I start learning system design?",
      answer:
        "Begin with the free caching, load balancing, database, and API gateway resources. When you want complete system-design interview preparation, explore the HLD book.",
    },
    {
      question: "What's the difference between HLD and LLD?",
      answer:
        "HLD focuses on scalable architecture, APIs, databases, caching, distributed systems, and system-level trade-offs. LLD focuses on object-oriented modeling, classes, interfaces, UML, design patterns, and Java implementation.",
    },
    {
      question: "Are the learning resources free?",
      answer:
        "The resources listed in the Free Engineering Resources section are available through their respective learning pages. The books are separate products; current prices and purchase details are shown on their individual pages.",
    },
    {
      question: "Can I find software engineering interview experiences?",
      answer:
        "Yes. The interview experiences section covers preparation and technical rounds across software engineering, backend, low-level design, high-level design, and AI engineering.",
    },
  ];

  const structuredData = useMemo(() => {
    const resources = [
      ...LEARNING_AREAS.map((item) => ({
        name: item.title,
        url: `${SITE_URL}${item.path}`,
      })),
      ...FREE_RESOURCES.map((item) => ({
        name: item.title,
        url: `${SITE_URL}${item.path}`,
      })),
    ];

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": `${PAGE_URL}#page`,
          name: SEO_TITLE,
          description: SEO_DESCRIPTION,
          url: PAGE_URL,
          isPartOf: {
            "@type": "WebSite",
            name: "Target Trek",
            url: SITE_URL,
          },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Target Trek",
              item: SITE_URL,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Learn",
              item: PAGE_URL,
            },
          ],
        },
        {
          "@type": "ItemList",
          name: "Target Trek learning resources",
          itemListElement: resources.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: item.url,
          })),
        },
      ],
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>{SEO_TITLE}</title>

        <meta
          name="description"
          content={SEO_DESCRIPTION}
        />

        <meta
          name="keywords"
          content="system design, software engineering, Java LLD, HLD, GenAI, backend engineering, developer resources, software engineering interview experiences, Target Trek"
        />

        <meta
          name="robots"
          content="index,follow,max-image-preview:large"
        />

        <link
          rel="canonical"
          href={PAGE_URL}
        />

        <meta property="og:type" content="website" />

        <meta
          property="og:site_name"
          content="Target Trek"
        />

        <meta
          property="og:title"
          content={SEO_TITLE}
        />

        <meta
          property="og:description"
          content={SEO_DESCRIPTION}
        />

        <meta
          property="og:url"
          content={PAGE_URL}
        />

        <meta
          name="twitter:card"
          content="summary"
        />

        <meta
          name="twitter:title"
          content={SEO_TITLE}
        />

        <meta
          name="twitter:description"
          content={SEO_DESCRIPTION}
        />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

        .ttLearn {
          --learn-bg: #FAF9F6;
          --learn-surface: #FFFFFF;
          --learn-surface-alt: #F5F2EE;
          --learn-text: #1C1917;
          --learn-muted: #6B625B;
          --learn-subtle: #A8A29E;
          --learn-border: #E8E2DA;
          --learn-orange: #EA580C;
          --learn-orange-bright: #F97316;
          --learn-orange-soft: #FFF0E4;
          --learn-orange-border: #FED7AA;
          --learn-shadow: 0 16px 48px rgba(39,29,22,.055);

          min-height: 100vh;
          width: 100%;
          overflow-x: clip;
          background: var(--learn-bg);
          color: var(--learn-text);
          font-family: "DM Sans", sans-serif;
          -webkit-font-smoothing: antialiased;
          transition: background .25s, color .25s;
        }

        .ttLearn[data-theme="dark"] {
          --learn-bg: #151311;
          --learn-surface: #211E1B;
          --learn-surface-alt: #2B2622;
          --learn-text: #FAF8F5;
          --learn-muted: #B5ACA5;
          --learn-subtle: #8D827A;
          --learn-border: #39332E;
          --learn-orange: #FB923C;
          --learn-orange-bright: #F97316;
          --learn-orange-soft: #37251B;
          --learn-orange-border: #693B23;
          --learn-shadow: 0 16px 48px rgba(0,0,0,.13);
          color-scheme: dark;
        }

        .ttLearn *,
        .ttLearn *::before,
        .ttLearn *::after {
          box-sizing: border-box;
        }

        .ttLearn a {
          color: inherit;
          text-decoration: none;
        }

        .ttLearn button {
          font: inherit;
        }

        .ttLearn h1,
        .ttLearn h2,
        .ttLearn h3,
        .ttLearn h4 {
          font-family: "Manrope", sans-serif;
        }

        .learn-shell {
          width: min(1220px, calc(100% - 40px));
          margin: 0 auto;
        }

        .learn-section {
          padding: 70px 0;
        }

        .learn-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--learn-orange);
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: .17em;
        }

        .learn-eyebrow-line {
          width: 21px;
          height: 2px;
          flex-shrink: 0;
          border-radius: 4px;
          background: var(--learn-orange-bright);
        }

        .learn-section-title {
          margin: 12px 0 0;
          max-width: 760px;
          font-size: clamp(27px, 3vw, 39px);
          line-height: 1.17;
          letter-spacing: -.045em;
          font-weight: 850;
          color: var(--learn-text);
        }

        .learn-section-description {
          max-width: 680px;
          margin: 13px 0 0;
          font-size: 14px;
          line-height: 1.85;
          color: var(--learn-muted);
        }

        .learn-text-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--learn-orange) !important;
          font-size: 13px;
          font-weight: 800;
          transition: gap .2s;
        }

        .learn-text-link:hover {
          gap: 13px;
        }

        .learn-btn {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 9px;
          min-height: 44px;
          padding: 11px 19px;
          border-radius: 11px;
          font-size: 12px;
          font-weight: 850;
          border: 1px solid transparent;
          transition:
            transform .2s,
            background .2s,
            border-color .2s,
            box-shadow .2s;
        }

        .learn-btn:hover {
          transform: translateY(-2px);
        }

        .learn-btn-orange {
          background: #F97316;
          color: #fff !important;
          box-shadow: 0 9px 20px rgba(249,115,22,.15);
        }

        .learn-btn-orange:hover {
          background: #EA580C;
        }

        .learn-btn-outline {
          border-color: var(--learn-border);
          background: var(--learn-surface);
          color: var(--learn-text) !important;
        }

        .learn-btn-outline:hover {
          border-color: var(--learn-orange);
        }

        /* HERO */

        .learn-hero {
          padding: 108px 0 47px;
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid var(--learn-border);
          background: var(--learn-surface);
        }

        .learn-hero::before {
          content: "";
          position: absolute;
          width: 550px;
          height: 550px;
          right: -170px;
          top: -320px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(249,115,22,.12),
            transparent 68%
          );
          pointer-events: none;
        }

        .learn-hero-grid {
          display: grid;
          grid-template-columns: minmax(0,1.1fr) minmax(300px,.9fr);
          gap: 50px;
          align-items: center;
        }

        .learn-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 11px;
          background: var(--learn-orange-soft);
          border: 1px solid var(--learn-orange-border);
          border-radius: 7px;
          color: var(--learn-orange);
          font-size: 10px;
          font-weight: 850;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .learn-hero h1 {
          max-width: 680px;
          font-size: clamp(38px, 5.2vw, 65px);
          line-height: 1.075;
          letter-spacing: -.06em;
          font-weight: 850;
          margin: 20px 0;
        }

        .learn-hero h1 em {
          font-style: normal;
          color: var(--learn-orange-bright);
        }

        .learn-hero-copy {
          max-width: 565px;
          font-size: 15px;
          line-height: 1.85;
          color: var(--learn-muted);
        }

        .learn-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 11px;
          margin-top: 23px;
        }

        .learn-hero-points {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          margin-top: 25px;
        }

        .learn-hero-points span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--learn-muted);
          font-size: 11px;
          font-weight: 750;
        }

        .learn-hero-points svg {
          color: var(--learn-orange);
        }

        .learn-path-panel {
          position: relative;
          background: #1C1917;
          border: 1px solid #39312C;
          border-radius: 21px;
          padding: 26px;
          color: #fff;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(28,25,23,.14);
        }

        .learn-path-panel::after {
          content: "";
          position: absolute;
          height: 250px;
          width: 250px;
          border-radius: 50%;
          right: -110px;
          top: -110px;
          background: rgba(249,115,22,.10);
          filter: blur(20px);
          pointer-events: none;
        }

        .learn-path-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .learn-path-top strong {
          font-size: 13px;
          font-weight: 850;
          letter-spacing: -.02em;
        }

        .learn-path-top span {
          color: #FB923C;
          font-size: 10px;
          font-weight: 800;
        }

        .learn-path-steps {
          position: relative;
          z-index: 1;
          display: grid;
          gap: 13px;
          margin-top: 25px;
        }

        .learn-path-step {
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid #403831;
          background: #292420;
          border-radius: 12px;
          padding: 15px;
        }

        .learn-path-step-number {
          display: grid;
          place-items: center;
          width: 37px;
          height: 37px;
          border-radius: 10px;
          flex-shrink: 0;
          color: #FDBA74;
          background: rgba(249,115,22,.12);
          font-size: 12px;
          font-weight: 900;
        }

        .learn-path-step h3 {
          margin: 0;
          font-size: 13px;
          font-weight: 800;
          color: #fff;
        }

        .learn-path-step p {
          margin: 4px 0 0;
          font-size: 11px;
          color: #B9AEA5;
          line-height: 1.5;
        }

        .learn-path-bottom {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          padding-top: 17px;
          border-top: 1px solid #403831;
        }

        .learn-path-bottom span {
          color: #D6CBC3;
          font-size: 10px;
          font-weight: 750;
        }

        .learn-path-bottom i {
          height: 3px;
          width: 3px;
          border-radius: 50%;
          background: #FB923C;
        }

        /* LEARNING AREA CARDS */

        .learn-area-grid {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 15px;
          margin-top: 30px;
        }

        .learn-area-card {
          display: flex;
          flex-direction: column;
          min-width: 0;
          padding: 22px;
          border-radius: 17px;
          border: 1px solid var(--learn-border);
          background: var(--learn-surface);
          transition:
            transform .23s,
            border-color .23s,
            box-shadow .23s;
        }

        .learn-area-card:hover {
          transform: translateY(-5px);
          border-color: var(--learn-orange);
          box-shadow: var(--learn-shadow);
        }

        .learn-area-top {
          display: flex;
          align-items: start;
          justify-content: space-between;
        }

        .learn-area-icon,
        .learn-resource-icon {
          display: grid;
          place-items: center;
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: var(--learn-orange-soft);
          color: var(--learn-orange);
        }

        .learn-area-number {
          font-family: "Manrope",sans-serif;
          font-size: 12px;
          font-weight: 850;
          color: var(--learn-subtle);
        }

        .learn-card-kicker {
          margin: 21px 0 0;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .12em;
          color: var(--learn-orange);
        }

        .learn-area-title {
          margin: 8px 0 0;
          color: var(--learn-text);
          font-size: 18px;
          font-weight: 850;
          letter-spacing: -.035em;
        }

        .learn-area-description {
          flex: 1;
          margin: 11px 0 0;
          color: var(--learn-muted);
          font-size: 12px;
          line-height: 1.75;
        }

        .learn-area-topics,
        .learn-resource-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 17px;
        }

        .learn-topic-chip {
          display: inline-flex;
          align-items: center;
          padding: 6px 9px;
          background: var(--learn-surface-alt);
          border: 1px solid var(--learn-border);
          border-radius: 7px;
          color: var(--learn-muted);
          font-size: 10px;
          font-weight: 700;
        }

        .learn-area-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 22px;
          padding-top: 15px;
          border-top: 1px solid var(--learn-border);
          color: var(--learn-orange);
          font-size: 12px;
          font-weight: 850;
        }

        .learn-arrow-circle {
          display: grid;
          place-items: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--learn-orange-soft);
          transition: transform .2s;
        }

        .learn-area-card:hover .learn-arrow-circle {
          transform: translate(2px,-2px);
        }

        /* FEATURED BOOKS */

        .learn-featured-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 17px;
          margin-top: 31px;
        }

        .learn-featured-card {
          min-width: 0;
          overflow: hidden;
          border-radius: 22px;
          border: 1px solid var(--learn-border);
          background: var(--learn-surface);
          box-shadow: var(--learn-shadow);
        }

        .learn-featured-primary {
          border-color: var(--learn-orange-border);
        }

        .learn-featured-inner {
          height: 100%;
          display: grid;
          grid-template-columns: minmax(0,1fr) minmax(125px,.65fr);
        }

        .learn-featured-content {
          display: flex;
          flex-direction: column;
          min-width: 0;
          padding: 25px;
        }

        .learn-featured-meta {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .learn-featured-number {
          display: inline-grid;
          place-items: center;
          width: 27px;
          height: 27px;
          border-radius: 7px;
          background: var(--learn-orange-soft);
          color: var(--learn-orange);
          font-size: 10px;
          font-weight: 900;
        }

        .learn-featured-type {
          font-size: 9px;
          letter-spacing: .09em;
          color: var(--learn-muted);
          font-weight: 900;
        }

        .learn-featured-title {
          margin: 17px 0 0;
          color: var(--learn-text);
          font-size: clamp(21px,2.2vw,28px);
          letter-spacing: -.045em;
          font-weight: 900;
          line-height: 1.2;
        }

        .learn-featured-title span {
          display: block;
          margin-top: 5px;
          color: var(--learn-orange);
        }

        .learn-featured-subtitle {
          margin: 12px 0 0;
          color: var(--learn-text);
          font-size: 12px;
          font-weight: 800;
        }

        .learn-featured-description {
          margin: 11px 0 0;
          font-size: 11px;
          line-height: 1.8;
          color: var(--learn-muted);
        }

        .learn-featured-topics {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 16px;
        }

        .learn-featured-topic {
          font-size: 9px;
          font-weight: 800;
          padding: 6px 8px;
          border: 1px solid var(--learn-border);
          color: var(--learn-muted);
          background: var(--learn-surface-alt);
          border-radius: 6px;
        }

        .learn-featured-benefits {
          display: grid;
          gap: 8px;
          margin: 19px 0 21px;
        }

        .learn-featured-benefit {
          display: flex;
          align-items: start;
          gap: 8px;
          color: var(--learn-muted);
          font-size: 10px;
          line-height: 1.5;
        }

        .learn-featured-benefit svg {
          flex-shrink: 0;
          color: var(--learn-orange);
        }

        .learn-featured-content .learn-btn {
          align-self: flex-start;
          margin-top: auto;
        }

        .learn-featured-art {
          min-width: 0;
          position: relative;
          display: grid;
          place-items: center;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 70% 20%,
              rgba(249,115,22,.19),
              transparent 55%
            ),
            #231D19;
          perspective: 800px;
          padding: 24px 14px;
        }

        .learn-art-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(251,146,60,.06) 1px,transparent 1px),
            linear-gradient(90deg,rgba(251,146,60,.06) 1px,transparent 1px);
          background-size: 25px 25px;
        }

        .learn-art-orbit {
          position: absolute;
          width: 290px;
          height: 290px;
          border-radius: 50%;
          border: 1px solid rgba(251,146,60,.13);
        }

        .learn-art-orbit-two {
          width: 215px;
          height: 215px;
        }

        .learn-art-book {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          width: min(170px,100%);
          aspect-ratio: 2 / 3;
          padding: 17px;
          border: 1px solid rgba(255,255,255,.18);
          border-radius: 4px 10px 10px 4px;
          color: #fff;
          background: linear-gradient(
            140deg,
            #151310,
            #34251B 65%,
            #9A3412
          );
          box-shadow:
            16px 23px 36px rgba(0,0,0,.38),
            inset 5px 0 rgba(255,255,255,.08);
          transform: rotateY(-10deg) rotateZ(-3deg);
          transition: transform .4s;
        }

        .learn-featured-card:hover .learn-art-book {
          transform: rotateY(-3deg) rotateZ(0deg) translateY(-5px);
        }

        .learn-art-book-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 7px;
          color: #FDBA74;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .12em;
        }

        .learn-art-book-visual {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          color: #FDBA74;
        }

        .learn-art-book-visual svg {
          width: 100%;
          max-width: 160px;
        }

        .learn-art-book-bottom {
          display: flex;
          flex-direction: column;
        }

        .learn-art-book-label {
          font-size: 7px;
          font-weight: 850;
          letter-spacing: .08em;
          color: #E9C1A2;
        }

        .learn-art-book-heading {
          margin-top: 5px;
          font-size: 43px;
          line-height: 1;
          font-family: "Manrope",sans-serif;
          font-weight: 900;
          letter-spacing: -.07em;
        }

        .learn-art-book-description {
          margin-top: 6px;
          color: #FDBA74;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: .05em;
        }

        .learn-art-book-rule {
          width: 42px;
          height: 2px;
          margin-top: 12px;
          background: #F97316;
        }

        .learn-art-book-footer {
          margin-top: 8px;
          color: #D6B9A3;
          font-size: 6px;
          letter-spacing: .14em;
          font-weight: 800;
        }

        .learn-art-floating-tag {
          position: absolute;
          bottom: 16%;
          right: 6%;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 10px;
          background: #FFF5EC;
          border: 1px solid #FDBA74;
          border-radius: 9px;
          box-shadow: 0 8px 20px rgba(0,0,0,.15);
          color: #9A3412;
          font-size: 9px;
          font-weight: 900;
          transform: rotate(4deg);
        }

        /* RESOURCES */

        .learn-resources-section {
          border-top: 1px solid var(--learn-border);
          border-bottom: 1px solid var(--learn-border);
          background: var(--learn-surface);
        }

        .learn-resources-grid {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 14px;
          margin-top: 29px;
        }

        .learn-resource-card {
          display: flex;
          flex-direction: column;
          min-width: 0;
          border: 1px solid var(--learn-border);
          border-radius: 16px;
          padding: 21px;
          background: var(--learn-bg);
          transition: transform .2s,border-color .2s,box-shadow .2s;
        }

        .learn-resource-card:hover {
          transform: translateY(-4px);
          border-color: var(--learn-orange);
          box-shadow: var(--learn-shadow);
        }

        .learn-resource-header {
          display: flex;
          justify-content: space-between;
        }

        .learn-resource-number {
          color: var(--learn-subtle);
          font-size: 11px;
          font-weight: 850;
        }

        .learn-resource-category {
          margin-top: 20px;
          color: var(--learn-orange);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .05em;
        }

        .learn-resource-title {
          margin: 8px 0 0;
          font-size: 18px;
          line-height: 1.3;
          font-weight: 850;
          color: var(--learn-text);
          letter-spacing: -.035em;
        }

        .learn-resource-description {
          flex: 1;
          margin: 10px 0 0;
          color: var(--learn-muted);
          font-size: 12px;
          line-height: 1.75;
        }

        .learn-resource-link {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 21px;
          padding-top: 15px;
          border-top: 1px solid var(--learn-border);
          color: var(--learn-orange);
          font-weight: 850;
          font-size: 11px;
        }

        /* INTERVIEW SECTION */

        .learn-interview-panel {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          overflow: hidden;
          border-radius: 22px;
          border: 1px solid var(--learn-border);
          background: var(--learn-surface);
          box-shadow: var(--learn-shadow);
          margin-top: 30px;
        }

        .learn-interview-left {
          padding: 34px;
        }

        .learn-interview-left h3 {
          margin: 17px 0 0;
          font-size: clamp(25px,3vw,34px);
          line-height: 1.19;
          letter-spacing: -.045em;
        }

        .learn-interview-left p {
          margin-top: 14px;
          font-size: 13px;
          line-height: 1.8;
          color: var(--learn-muted);
        }

        .learn-interview-categories {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin: 21px 0;
        }

        .learn-interview-categories span {
          padding: 7px 10px;
          border-radius: 8px;
          border: 1px solid var(--learn-border);
          background: var(--learn-surface-alt);
          color: var(--learn-muted);
          font-size: 10px;
          font-weight: 800;
        }

        .learn-interview-right {
          display: grid;
          gap: 10px;
          align-content: center;
          padding: 27px;
          background: var(--learn-surface-alt);
          border-left: 1px solid var(--learn-border);
        }

        .learn-interview-item {
          display: flex;
          gap: 12px;
          align-items: start;
          border-radius: 12px;
          border: 1px solid var(--learn-border);
          padding: 14px;
          background: var(--learn-surface);
        }

        .learn-interview-item-icon {
          display: grid;
          place-items: center;
          width: 35px;
          height: 35px;
          flex-shrink: 0;
          border-radius: 9px;
          background: var(--learn-orange-soft);
          color: var(--learn-orange);
        }

        .learn-interview-item h4 {
          margin: 0;
          font-size: 12px;
          font-weight: 850;
        }

        .learn-interview-item p {
          margin: 5px 0 0;
          color: var(--learn-muted);
          font-size: 10px;
          line-height: 1.6;
        }

        /* BENEFITS */

        .learn-benefits {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 20px;
          margin-top: 28px;
        }

        .learn-benefit {
          padding: 18px 0;
          border-top: 2px solid var(--learn-border);
        }

        .learn-benefit svg {
          color: var(--learn-orange);
        }

        .learn-benefit h3 {
          margin: 15px 0 0;
          font-size: 14px;
          font-weight: 850;
        }

        .learn-benefit p {
          margin-top: 9px;
          font-size: 12px;
          line-height: 1.75;
          color: var(--learn-muted);
        }

        /* FAQ */

        .learn-faq {
          display: grid;
          grid-template-columns: minmax(230px,.7fr) 1.3fr;
          gap: 50px;
          align-items: start;
        }

        .learn-faq-list {
          display: grid;
          gap: 10px;
        }

        .learn-faq-item {
          border: 1px solid var(--learn-border);
          background: var(--learn-surface);
          border-radius: 12px;
          overflow: hidden;
        }

        .learn-faq-item button {
          display: flex;
          width: 100%;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 18px;
          border: 0;
          background: transparent;
          text-align: left;
          color: var(--learn-text);
          font-size: 13px;
          font-weight: 850;
          cursor: pointer;
        }

        .learn-faq-answer {
          padding: 0 18px 18px;
          color: var(--learn-muted);
          font-size: 12px;
          line-height: 1.75;
        }

        /* FINAL CTA */

        .learn-last-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          border-radius: 20px;
          background: #1C1917;
          color: white;
          padding: 32px;
          overflow: hidden;
          position: relative;
        }

        .learn-last-cta::before {
          content: "";
          position: absolute;
          width: 250px;
          height: 250px;
          right: -120px;
          top: -120px;
          border: 1px solid rgba(249,115,22,.3);
          border-radius: 50%;
          box-shadow:
            0 0 0 30px rgba(249,115,22,.04),
            0 0 0 70px rgba(249,115,22,.03);
        }

        .learn-last-cta h2 {
          position: relative;
          font-size: clamp(23px,2.9vw,32px);
          letter-spacing: -.045em;
          line-height: 1.2;
          margin: 0;
          max-width: 620px;
        }

        .learn-last-cta p {
          position: relative;
          color: #BAAEA5;
          font-size: 12px;
          line-height: 1.7;
          margin: 10px 0 0;
          max-width: 590px;
        }

        .learn-last-actions {
          display: flex;
          flex-shrink: 0;
          gap: 9px;
          position: relative;
        }

        /* RESPONSIVE */

        @media (max-width: 1080px) {
          .learn-area-grid {
            grid-template-columns: repeat(2,minmax(0,1fr));
          }

          .learn-featured-grid {
            grid-template-columns: 1fr;
          }

          .learn-featured-inner {
            grid-template-columns: 1fr minmax(180px,.55fr);
          }

          .learn-benefits {
            grid-template-columns: repeat(2,minmax(0,1fr));
          }
        }

        @media (max-width: 800px) {
          .learn-hero-grid {
            grid-template-columns: 1fr;
            gap: 26px;
          }

          .learn-path-panel {
            max-width: 600px;
          }

          .learn-resources-grid {
            grid-template-columns: repeat(2,minmax(0,1fr));
          }

          .learn-interview-panel {
            grid-template-columns: 1fr;
          }

          .learn-interview-right {
            border-left: 0;
            border-top: 1px solid var(--learn-border);
          }

          .learn-faq {
            grid-template-columns: 1fr;
            gap: 22px;
          }

          .learn-last-cta {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 560px) {
          .learn-shell {
            width: calc(100% - 28px);
          }

          .learn-section {
            padding: 45px 0;
          }

          .learn-hero {
            padding: 86px 0 32px;
          }

          .learn-hero h1 {
            font-size: clamp(35px,10vw,45px);
            margin: 15px 0;
          }

          .learn-hero-copy {
            font-size: 13px;
          }

          .learn-hero-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .learn-hero-actions .learn-btn {
            padding: 11px 9px;
            font-size: 10px;
          }

          .learn-hero-points {
            gap: 9px 13px;
            margin-top: 19px;
          }

          .learn-path-panel {
            padding: 18px;
          }

          .learn-area-grid {
            grid-template-columns: 1fr;
            gap: 11px;
            margin-top: 22px;
          }

          .learn-area-card {
            padding: 18px;
          }

          .learn-featured-inner {
            grid-template-columns: 1fr;
          }

          .learn-featured-content {
            padding: 23px;
          }

          .learn-featured-art {
            min-height: 305px;
          }

          .learn-art-book {
            width: 170px;
          }

          .learn-resources-grid {
            grid-template-columns: 1fr;
          }

          .learn-resource-card {
            padding: 18px;
          }

          .learn-interview-left {
            padding: 23px;
          }

          .learn-interview-right {
            padding: 17px;
          }

          .learn-benefits {
            grid-template-columns: 1fr 1fr;
            gap: 13px;
          }

          .learn-benefit {
            padding: 12px 0;
          }

          .learn-last-cta {
            padding: 24px;
          }

          .learn-last-actions {
            width: 100%;
            flex-direction: column;
          }

          .learn-last-actions .learn-btn {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ttLearn *,
          .ttLearn *::before,
          .ttLearn *::after {
            scroll-behavior: auto !important;
            animation-duration: .01ms !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <main
        className="ttLearn"
        data-theme={isDark ? "dark" : "light"}
      >
        {/* ================================================= */}
        {/* COMPACT HERO                                      */}
        {/* ================================================= */}

        <section className="learn-hero">
          <div className="learn-shell learn-hero-grid">
            <div>
              <span className="learn-hero-badge">
                <Sparkles size={13} />
                TARGET TREK · LEARN
              </span>

              <h1>
                Learn the concepts.
                <br />
                <em>Build the intuition.</em>
              </h1>

              <p className="learn-hero-copy">
                A focused learning space for software
                engineers. Explore System Design, Java LLD,
                practical engineering resources, real
                interview experiences, and technical guides
                designed to help you understand how systems
                actually work.
              </p>

              <div className="learn-hero-actions">
                <Link
                  to="/books"
                  className="learn-btn learn-btn-orange"
                >
                  Explore Books
                  <ArrowUpRight size={16} />
                </Link>

                <Link
                  to="/resources/hld/cache"
                  className="learn-btn learn-btn-outline"
                >
                  Free Resources
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="learn-hero-points">
                {[
                  "System Design",
                  "Java & Backend",
                  "GenAI",
                  "Interview Preparation",
                ].map((item) => (
                  <span key={item}>
                    <Check size={13} />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="learn-path-panel">
              <div className="learn-path-top">
                <strong>From concepts to confidence</strong>
                <span>YOUR LEARNING PATH</span>
              </div>

              <div className="learn-path-steps">
                {[
                  {
                    n: "01",
                    title: "Understand",
                    description:
                      "Build strong engineering fundamentals",
                  },
                  {
                    n: "02",
                    title: "Design",
                    description:
                      "Connect components into real systems",
                  },
                  {
                    n: "03",
                    title: "Apply",
                    description:
                      "Practice interviews and implementation",
                  },
                ].map((item) => (
                  <div
                    className="learn-path-step"
                    key={item.n}
                  >
                    <span className="learn-path-step-number">
                      {item.n}
                    </span>

                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>

                    <ArrowUpRight
                      size={15}
                      style={{
                        marginLeft: "auto",
                        color: "#A89990",
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="learn-path-bottom">
                <span>Free resources</span>
                <i />
                <span>Books</span>
                <i />
                <span>Interviews</span>
                <i />
                <span>Blogs</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* EXPLORE LEARNING AREAS                            */}
        {/* ================================================= */}

        <section className="learn-section">
          <div className="learn-shell">
            <SectionHeading
              eyebrow="EXPLORE TARGET TREK"
              title="Everything you need to keep learning."
              description="Choose your path — whether you're revising a single concept, preparing for an interview, or studying complete software engineering topics."
            />

            <div className="learn-area-grid">
              {LEARNING_AREAS.map((item) => (
                <LearningAreaCard
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* FEATURED HLD / LLD BOOKS                          */}
        {/* ================================================= */}

        <section className="learn-section" style={{
          paddingTop: 18,
        }}>
          <div className="learn-shell">
            <SectionHeading
              eyebrow="DEEPER LEARNING"
              title="Technical books that connect the dots."
              description="Go beyond memorizing concepts. Learn to explain design decisions, understand trade-offs, and prepare for real software engineering discussions."
              action="View all books"
              actionPath="/books"
            />

            <div className="learn-featured-grid">
              {FEATURED_BOOKS.map((book, index) => (
                <FeaturedBookCard
                  key={book.path}
                  book={book}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* FREE SYSTEM DESIGN RESOURCES                      */}
        {/* ================================================= */}

        <section className="learn-resources-section learn-section">
          <div className="learn-shell">
            <SectionHeading
              eyebrow="FREE ENGINEERING RESOURCES"
              title="Master the building blocks of scalable systems."
              description="Focused resources that explain the technologies, architecture decisions, and trade-offs behind modern backend systems."
            />

            <div className="learn-resources-grid">
              {FREE_RESOURCES.map((resource) => (
                <ResourceCard
                  key={resource.path}
                  resource={resource}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* INTERVIEW EXPERIENCE                              */}
        {/* ================================================= */}

        <section className="learn-section">
          <div className="learn-shell">
            <SectionHeading
              eyebrow="INTERVIEW PREPARATION"
              title="Prepare beyond coding questions."
              description="Technical interviews test how you reason about algorithms, software design, engineering trade-offs, and real systems."
            />

            <div className="learn-interview-panel">
              <div className="learn-interview-left">
                <span className="learn-hero-badge">
                  <BriefcaseBusiness size={13} />
                  INTERVIEW EXPERIENCES
                </span>

                <h3>
                  Understand the rounds.
                  <br />
                  Prepare with direction.
                </h3>

                <p>
                  Explore interview experiences covering
                  DSA, backend engineering, Java,
                  system design, AI engineering, and
                  managerial discussions. Use these
                  experiences to understand interview
                  expectations and plan your preparation.
                </p>

                <div className="learn-interview-categories">
                  {[
                    "DSA",
                    "LLD",
                    "HLD",
                    "Java",
                    "Backend",
                    "GenAI",
                  ].map((item) => (
                    <span key={item}>
                      {item}
                    </span>
                  ))}
                </div>

                <Link
                  to="/interviews"
                  className="learn-btn learn-btn-orange"
                >
                  Explore Interviews
                  <ArrowUpRight size={16} />
                </Link>
              </div>

              <div className="learn-interview-right">
                {INTERVIEW_TOPICS.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="learn-interview-item"
                    >
                      <span className="learn-interview-item-icon">
                        <Icon size={18} />
                      </span>

                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* FREE VS STRUCTURED                                */}
        {/* ================================================= */}

        <section className="learn-section" style={{
          paddingTop: 0,
        }}>
          <div className="learn-shell">
            <SectionHeading
              eyebrow="HOW TO LEARN"
              title="Start small. Go deeper when you're ready."
              description="Free learning resources and structured books are complementary. Choose based on the depth of understanding you need."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(min(100%,300px),1fr))",
                gap: 15,
                marginTop: 28,
              }}
            >
              <div
                style={{
                  border: "1px solid var(--learn-border)",
                  background: "var(--learn-surface)",
                  borderRadius: 18,
                  padding: 25,
                }}
              >
                <GraduationCap
                  size={28}
                  color="var(--learn-orange)"
                />

                <h3
                  style={{
                    fontSize: 21,
                    fontWeight: 850,
                    letterSpacing: "-.035em",
                    margin: "17px 0 10px",
                  }}
                >
                  Focused free learning
                </h3>

                <p
                  style={{
                    color: "var(--learn-muted)",
                    fontSize: 13,
                    lineHeight: 1.8,
                  }}
                >
                  Explore individual engineering concepts
                  with explanations and practical examples.
                  Ideal for quick revision and learning
                  one topic at a time.
                </p>

                <div
                  style={{
                    display: "grid",
                    gap: 11,
                    marginTop: 19,
                  }}
                >
                  {[
                    "Understand one topic",
                    "Build conceptual clarity",
                    "Revise engineering fundamentals",
                    "Learn at your own pace",
                  ].map((item) => (
                    <div
                      key={item}
                      style={{
                        display: "flex",
                        gap: 9,
                        alignItems: "center",
                        color: "var(--learn-muted)",
                        fontSize: 12,
                      }}
                    >
                      <Check
                        size={15}
                        color="var(--learn-orange)"
                      />
                      {item}
                    </div>
                  ))}
                </div>

                <Link
                  to="/resources/hld/cache"
                  className="learn-text-link"
                  style={{ marginTop: 24 }}
                >
                  Start with free resources
                  <ArrowUpRight size={16} />
                </Link>
              </div>

              <div
                style={{
                  border: "1px solid var(--learn-orange-border)",
                  background: "var(--learn-orange-soft)",
                  borderRadius: 18,
                  padding: 25,
                }}
              >
                <BookOpen
                  size={28}
                  color="var(--learn-orange)"
                />

                <h3
                  style={{
                    fontSize: 21,
                    fontWeight: 850,
                    letterSpacing: "-.035em",
                    margin: "17px 0 10px",
                  }}
                >
                  Structured deep learning
                </h3>

                <p
                  style={{
                    color: "var(--learn-muted)",
                    fontSize: 13,
                    lineHeight: 1.8,
                  }}
                >
                  Study entire topics through connected
                  chapters, case studies, implementation
                  details, architecture choices, and
                  interview-focused exercises.
                </p>

                <div
                  style={{
                    display: "grid",
                    gap: 11,
                    marginTop: 19,
                  }}
                >
                  {[
                    "Follow structured chapters",
                    "Connect related concepts",
                    "Explore design decisions",
                    "Prepare complete interview topics",
                  ].map((item) => (
                    <div
                      key={item}
                      style={{
                        display: "flex",
                        gap: 9,
                        alignItems: "center",
                        color: "var(--learn-muted)",
                        fontSize: 12,
                      }}
                    >
                      <Check
                        size={15}
                        color="var(--learn-orange)"
                      />
                      {item}
                    </div>
                  ))}
                </div>

                <Link
                  to="/books"
                  className="learn-text-link"
                  style={{ marginTop: 24 }}
                >
                  Explore structured books
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* WHY TARGET TREK                                  */}
        {/* ================================================= */}

        <section className="learn-section">
          <div className="learn-shell">
            <SectionHeading
              eyebrow="WHY TARGET TREK"
              title="Learning with an engineering mindset."
              description="Technical preparation should help you reason about systems, understand implementation details, and communicate engineering decisions."
            />

            <div className="learn-benefits">
              {BENEFITS.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="learn-benefit"
                  >
                    <Icon size={25} strokeWidth={1.7} />

                    <h3>{item.title}</h3>

                    <p>{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* FAQ                                               */}
        {/* ================================================= */}

        <section className="learn-section" style={{
          paddingTop: 15,
        }}>
          <div className="learn-shell learn-faq">
            <SectionHeading
              eyebrow="HELP & GUIDANCE"
              title="Questions about learning?"
              description="A few answers to help you choose the right place to start."
            />

            <div className="learn-faq-list">
              {faqs.map((faq, index) => (
                <div
                  key={faq.question}
                  className="learn-faq-item"
                >
                  <button
                    type="button"
                    aria-expanded={activeFaq === index}
                    onClick={() =>
                      setActiveFaq(
                        activeFaq === index ? null : index
                      )
                    }
                  >
                    <span>{faq.question}</span>

                    <ChevronDown
                      size={17}
                      style={{
                        flexShrink: 0,
                        color: "var(--learn-orange)",
                        transform:
                          activeFaq === index
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        transition: "transform .2s",
                      }}
                    />
                  </button>

                  {activeFaq === index && (
                    <div className="learn-faq-answer">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* FINAL CTA                                         */}
        {/* ================================================= */}

        <section
          className="learn-section"
          style={{ paddingTop: 10 }}
        >
          <div className="learn-shell">
            <div className="learn-last-cta">
              <div>
                <h2>
                  Your next engineering breakthrough
                  starts with one concept.
                </h2>

                <p>
                  Explore free resources, dive into
                  technical books, and learn from
                  interview experiences — all from
                  Target Trek.
                </p>
              </div>

              <div className="learn-last-actions">
                <Link
                  to="/books"
                  className="learn-btn learn-btn-orange"
                >
                  Explore Books
                  <ArrowUpRight size={16} />
                </Link>

                <Link
                  to="/blogs"
                  className="learn-btn"
                  style={{
                    borderColor: "#50453D",
                    color: "#FFF",
                    background: "#302923",
                  }}
                >
                  Read Blogs
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
