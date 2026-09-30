// // import React, { useCallback, useEffect, useMemo, useState } from "react";
// // import { Helmet } from "react-helmet";
// // import { useNavigate, useParams } from "react-router-dom";
// // import { toast } from "react-hot-toast";
// // import {
// //   ArrowLeft,
// //   BadgeCheck,
// //   BookOpen,
// //   BriefcaseBusiness,
// //   Building2,
// //   CalendarDays,
// //   CheckCircle2,
// //   CircleUserRound,
// //   Clock3,
// //   Code2,
// //   ExternalLink,
// //   Hash,
// //   MapPin,
// //   Moon,
// //   Plus,
// //   ShieldCheck,
// //   Sparkles,
// //   Star,
// //   Sun,
// //   Tag,
// // } from "lucide-react";

// // import BASE_URL from "../utils/Url.js";
// // import {
// //   SITE_URL,
// //   buildDescription,
// //   formatDate,
// //   formatLabel,
// //   getDifficultyClasses,
// //   getExperienceText,
// //   getResultClasses,
// //   getTimeAgo,
// //   markdownToHtml,
// //   usePersistentTheme,
// // } from "../utils/InterviewUiUtils.js";

// // const ThemeButton = ({ theme, onToggle }) => {
// //   const dark = theme === "dark";
// //   return (
// //     <button
// //       type="button"
// //       onClick={onToggle}
// //       aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
// //       title={dark ? "Light mode" : "Dark mode"}
// //       className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-700 dark:hover:text-blue-400"
// //     >
// //       {dark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
// //     </button>
// //   );
// // };

// // const DetailSkeleton = () => {
// //   return (
// //     <div className="mx-auto max-w-7xl animate-pulse px-4 py-6 sm:px-6 lg:px-8">
// //       <div className="h-10 w-28 rounded-xl bg-slate-200 dark:bg-slate-800" />
// //       <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
// //         <div className="h-4 w-44 rounded bg-slate-200 dark:bg-slate-800" />
// //         <div className="mt-4 h-10 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
// //         <div className="mt-4 h-4 w-1/2 rounded bg-slate-100 dark:bg-slate-800/70" />
// //         <div className="mt-8 h-4 w-full rounded bg-slate-100 dark:bg-slate-800/70" />
// //         <div className="mt-3 h-4 w-11/12 rounded bg-slate-100 dark:bg-slate-800/70" />
// //         <div className="mt-3 h-4 w-5/6 rounded bg-slate-100 dark:bg-slate-800/70" />
// //       </div>
// //     </div>
// //   );
// // };

// // const InterviewDetailPage = () => {
// //   const { slug } = useParams();
// //   const navigate = useNavigate();
// //   const { theme, toggleTheme } = usePersistentTheme();

// //   const API_BASE = useMemo(
// //     () => `${BASE_URL.replace(/\/$/, "")}/api/interview`,
// //     []
// //   );

// //   const [interview, setInterview] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   const fetchInterview = useCallback(async () => {
// //     if (!slug) return;

// //     try {
// //       setLoading(true);
// //       const response = await fetch(`${API_BASE}/${encodeURIComponent(slug)}`);
// //       const data = await response.json();

// //       if (!response.ok) {
// //         throw new Error(data?.message || "Unable to load interview experience.");
// //       }

// //       setInterview(data?.data || null);
// //     } catch (error) {
// //       console.error("Interview detail error:", error);
// //       toast.error(error?.message || "Unable to load interview experience.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [API_BASE, slug]);

// //   useEffect(() => {
// //     fetchInterview();
// //   }, [fetchInterview]);

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-slate-50 pt-20 dark:bg-[#0b0f17] sm:pt-24">
// //         <DetailSkeleton />
// //       </div>
// //     );
// //   }

// //   if (!interview) {
// //     return (
// //       <div className="min-h-screen bg-slate-50 pt-20 dark:bg-[#0b0f17] sm:pt-24">
// //         <div className="mx-auto max-w-xl px-4 py-20 text-center">
// //           <h1 className="text-2xl font-black text-slate-950 dark:text-white">Interview experience not found</h1>
// //           <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
// //             This interview may have been removed or the URL may be incorrect.
// //           </p>
// //           <button
// //             type="button"
// //             onClick={() => navigate("/interview")}
// //             className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
// //           >
// //             Back to interviews
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   const info = interview?.interviewInfo || {};
// //   const experience = getExperienceText(info);
// //   const publishedAt = interview?.publishedAt || interview?.createdAt;
// //   const updatedAt = interview?.updatedAt || publishedAt;
// //   const canonicalPath = interview?.seo?.canonicalPath || `/interview/${interview.slug}`;
// //   const canonicalUrl = canonicalPath.startsWith("http")
// //     ? canonicalPath
// //     : `${SITE_URL}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;

// //   const seoTitle =
// //     interview?.seo?.title ||
// //     `${interview?.company?.name || "Software Engineering"} ${interview?.role?.title || "Interview"} Experience | TargetTrek`;

// //   const seoDescription = buildDescription(interview);
// //   const ogTitle = interview?.seo?.ogTitle || seoTitle;
// //   const ogDescription = interview?.seo?.ogDescription || seoDescription;
// //   const ogImage = interview?.seo?.ogImage || "";

// //   const structuredData = {
// //     "@context": "https://schema.org",
// //     "@type": "Article",
// //     headline: interview.title,
// //     description: seoDescription,
// //     url: canonicalUrl,
// //     mainEntityOfPage: canonicalUrl,
// //     datePublished: publishedAt,
// //     dateModified: updatedAt,
// //     author: {
// //       "@type": interview?.author?.isAnonymous ? "Organization" : "Person",
// //       name: interview?.author?.isAnonymous
// //         ? "TargetTrek Community"
// //         : interview?.author?.name || "TargetTrek Community",
// //     },
// //     publisher: {
// //       "@type": "Organization",
// //       name: "TargetTrek",
// //       url: SITE_URL,
// //     },
// //     about: [
// //       interview?.company?.name,
// //       interview?.role?.title,
// //       ...(interview?.topics || []),
// //       ...(interview?.technologies || []),
// //     ].filter(Boolean),
// //     ...(ogImage ? { image: [ogImage] } : {}),
// //   };

// //   return (
// //     <>
// //       <Helmet>
// //         <title>{seoTitle}</title>
// //         <meta name="description" content={seoDescription} />
// //         <meta name="robots" content={interview?.seo?.robots || "index,follow,max-image-preview:large"} />
// //         <link rel="canonical" href={canonicalUrl} />

// //         <meta property="og:type" content="article" />
// //         <meta property="og:site_name" content="TargetTrek" />
// //         <meta property="og:title" content={ogTitle} />
// //         <meta property="og:description" content={ogDescription} />
// //         <meta property="og:url" content={canonicalUrl} />
// //         {ogImage && <meta property="og:image" content={ogImage} />}
// //         {publishedAt && <meta property="article:published_time" content={publishedAt} />}
// //         {updatedAt && <meta property="article:modified_time" content={updatedAt} />}

// //         <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
// //         <meta name="twitter:title" content={ogTitle} />
// //         <meta name="twitter:description" content={ogDescription} />
// //         {ogImage && <meta name="twitter:image" content={ogImage} />}

// //         <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
// //       </Helmet>

// //       <div className="min-h-screen bg-slate-50 pt-20 text-slate-900 transition-colors dark:bg-[#0b0f17] dark:text-slate-100 sm:pt-24">
// //         <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
// //           <div className="flex items-center justify-between gap-3">
// //             <button
// //               type="button"
// //               onClick={() => navigate("/interview")}
// //               className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-400"
// //             >
// //               <ArrowLeft className="h-4 w-4" />
// //               <span className="hidden sm:inline">All interviews</span>
// //               <span className="sm:hidden">Back</span>
// //             </button>

// //             <ThemeButton theme={theme} onToggle={toggleTheme} />
// //           </div>
// //         </div>

// //         <main className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
// //           <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
// //             <article className="min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
// //               <header className="border-b border-slate-100 bg-gradient-to-b from-blue-50/70 to-white px-5 py-6 dark:border-slate-800 dark:from-blue-950/25 dark:to-slate-900 sm:px-8 sm:py-8">
// //                 <div className="flex items-start gap-4">
// //                   <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:h-14 sm:w-14">
// //                     {interview?.company?.logoUrl ? (
// //                       <img
// //                         src={interview.company.logoUrl}
// //                         alt={`${interview?.company?.name || "Company"} logo`}
// //                         className="h-full w-full object-contain p-2"
// //                       />
// //                     ) : (
// //                       <Building2 className="h-6 w-6 text-slate-500 dark:text-slate-400" />
// //                     )}
// //                   </div>

// //                   <div className="min-w-0 flex-1">
// //                     <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 sm:text-sm">
// //                       <span className="text-slate-900 dark:text-slate-100">{interview?.company?.name}</span>
// //                       <span className="text-slate-300 dark:text-slate-700">•</span>
// //                       <span>{interview?.role?.title}</span>
// //                       {interview?.role?.level && (
// //                         <>
// //                           <span className="text-slate-300 dark:text-slate-700">•</span>
// //                           <span>{interview.role.level}</span>
// //                         </>
// //                       )}
// //                     </div>

// //                     <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-slate-950 dark:text-white sm:text-3xl lg:text-4xl">
// //                       {interview.title}
// //                     </h1>

// //                     <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
// //                       <span className="inline-flex items-center gap-1.5">
// //                         <CircleUserRound className="h-3.5 w-3.5" />
// //                         {interview?.author?.name || "Anonymous"}
// //                       </span>
// //                       <span className="text-slate-300 dark:text-slate-700">•</span>
// //                       <span className="inline-flex items-center gap-1.5" title={formatDate(publishedAt)}>
// //                         <Clock3 className="h-3.5 w-3.5" /> {getTimeAgo(publishedAt)}
// //                       </span>
// //                       {interview?.readingTimeMinutes > 0 && (
// //                         <>
// //                           <span className="text-slate-300 dark:text-slate-700">•</span>
// //                           <span className="inline-flex items-center gap-1.5">
// //                             <BookOpen className="h-3.5 w-3.5" /> {interview.readingTimeMinutes} min read
// //                           </span>
// //                         </>
// //                       )}
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div className="mt-6 flex flex-wrap gap-2">
// //                   {info?.result && info.result !== "NOT_DISCLOSED" && (
// //                     <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getResultClasses(info.result)}`}>
// //                       Result: {formatLabel(info.result)}
// //                     </span>
// //                   )}
// //                   {info?.difficulty && info.difficulty !== "NOT_SPECIFIED" && (
// //                     <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${getDifficultyClasses(info.difficulty)}`}>
// //                       Difficulty: {formatLabel(info.difficulty)}
// //                     </span>
// //                   )}
// //                   {interview?.editorPick && (
// //                     <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
// //                       <BadgeCheck className="h-3.5 w-3.5" /> Editor's Pick
// //                     </span>
// //                   )}
// //                   {interview?.featured && (
// //                     <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
// //                       <Star className="h-3.5 w-3.5" /> Featured
// //                     </span>
// //                   )}
// //                 </div>
// //               </header>

// //               <div className="px-5 py-6 sm:px-8 sm:py-8">
// //                 {interview?.summaryMarkdown && (
// //                   <section className="mb-8 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 dark:border-blue-900/50 dark:bg-blue-950/20">
// //                     <div className="flex items-center gap-2">
// //                       <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
// //                       <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Quick summary</h2>
// //                     </div>
// //                     <div
// //                       className="mt-2"
// //                       dangerouslySetInnerHTML={{ __html: markdownToHtml(interview.summaryMarkdown) }}
// //                     />
// //                   </section>
// //                 )}

// //                 {interview?.contentMarkdown && (
// //                   <section dangerouslySetInnerHTML={{ __html: markdownToHtml(interview.contentMarkdown) }} />
// //                 )}

// //                 {Array.isArray(interview?.rounds) && interview.rounds.length > 0 && (
// //                   <section className="mt-10 border-t border-slate-200 pt-8 dark:border-slate-800">
// //                     <div className="mb-5 flex items-center gap-2">
// //                       <BriefcaseBusiness className="h-5 w-5 text-blue-600 dark:text-blue-400" />
// //                       <h2 className="text-xl font-black text-slate-950 dark:text-white sm:text-2xl">Interview rounds</h2>
// //                     </div>

// //                     <div className="space-y-4">
// //                       {interview.rounds.map((round, index) => (
// //                         <section
// //                           key={round?._id || `${round?.title}-${index}`}
// //                           className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40 sm:p-5"
// //                         >
// //                           <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
// //                             <div>
// //                               <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">Round {index + 1}</span>
// //                               <h3 className="mt-1 text-lg font-black text-slate-950 dark:text-white">
// //                                 {round?.title || `Round ${index + 1}`}
// //                               </h3>
// //                             </div>

// //                             <div className="flex flex-wrap gap-2">
// //                               {round?.durationMinutes > 0 && (
// //                                 <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
// //                                   {round.durationMinutes} mins
// //                                 </span>
// //                               )}
// //                               {round?.difficulty && round.difficulty !== "NOT_SPECIFIED" && (
// //                                 <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getDifficultyClasses(round.difficulty)}`}>
// //                                   {formatLabel(round.difficulty)}
// //                                 </span>
// //                               )}
// //                             </div>
// //                           </div>

// //                           {round?.contentMarkdown && (
// //                             <div className="mt-4" dangerouslySetInnerHTML={{ __html: markdownToHtml(round.contentMarkdown) }} />
// //                           )}

// //                           {Array.isArray(round?.questions) && round.questions.length > 0 && (
// //                             <div className="mt-5 space-y-3 border-t border-slate-200 pt-5 dark:border-slate-800">
// //                               <h4 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Questions asked</h4>
// //                               {round.questions.map((question, questionIndex) => (
// //                                 <div
// //                                   key={question?._id || questionIndex}
// //                                   className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
// //                                 >
// //                                   <div className="flex gap-3">
// //                                     <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-black text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
// //                                       {questionIndex + 1}
// //                                     </span>
// //                                     <div className="min-w-0 flex-1">
// //                                       <p className="font-semibold leading-6 text-slate-900 dark:text-slate-100">{question?.question}</p>
// //                                       {question?.descriptionMarkdown && (
// //                                         <div className="mt-2" dangerouslySetInnerHTML={{ __html: markdownToHtml(question.descriptionMarkdown) }} />
// //                                       )}
// //                                       {question?.approachMarkdown && (
// //                                         <div className="mt-3 rounded-xl bg-slate-50 px-4 py-1 dark:bg-slate-950/50" dangerouslySetInnerHTML={{ __html: markdownToHtml(question.approachMarkdown) }} />
// //                                       )}
// //                                     </div>
// //                                   </div>
// //                                 </div>
// //                               ))}
// //                             </div>
// //                           )}
// //                         </section>
// //                       ))}
// //                     </div>
// //                   </section>
// //                 )}

// //                 {interview?.preparationMarkdown && (
// //                   <section className="mt-10 border-t border-slate-200 pt-8 dark:border-slate-800">
// //                     <h2 className="text-xl font-black text-slate-950 dark:text-white sm:text-2xl">Preparation</h2>
// //                     <div className="mt-2" dangerouslySetInnerHTML={{ __html: markdownToHtml(interview.preparationMarkdown) }} />
// //                   </section>
// //                 )}

// //                 {interview?.adviceMarkdown && (
// //                   <section className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
// //                     <div className="flex items-center gap-2">
// //                       <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
// //                       <h2 className="text-lg font-black text-slate-950 dark:text-white">Advice for candidates</h2>
// //                     </div>
// //                     <div className="mt-2" dangerouslySetInnerHTML={{ __html: markdownToHtml(interview.adviceMarkdown) }} />
// //                   </section>
// //                 )}

// //                 {interview?.keyTakeawaysMarkdown && (
// //                   <section className="mt-8 rounded-2xl border border-violet-100 bg-violet-50/60 p-5 dark:border-violet-900/50 dark:bg-violet-950/20">
// //                     <div className="flex items-center gap-2">
// //                       <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
// //                       <h2 className="text-lg font-black text-slate-950 dark:text-white">Key takeaways</h2>
// //                     </div>
// //                     <div className="mt-2" dangerouslySetInnerHTML={{ __html: markdownToHtml(interview.keyTakeawaysMarkdown) }} />
// //                   </section>
// //                 )}

// //                 {(interview?.topics?.length > 0 || interview?.technologies?.length > 0 || interview?.tags?.length > 0) && (
// //                   <section className="mt-10 border-t border-slate-200 pt-7 dark:border-slate-800">
// //                     <div className="flex flex-wrap gap-2">
// //                       {interview?.technologies?.map((item) => (
// //                         <span key={`tech-${item}`} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
// //                           <Code2 className="h-3 w-3" /> {item}
// //                         </span>
// //                       ))}
// //                       {interview?.topics?.map((item) => (
// //                         <span key={`topic-${item}`} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
// //                           <Hash className="h-3 w-3" /> {item}
// //                         </span>
// //                       ))}
// //                       {interview?.tags?.map((item) => (
// //                         <span key={`tag-${item}`} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
// //                           <Tag className="h-3 w-3" /> {item}
// //                         </span>
// //                       ))}
// //                     </div>
// //                   </section>
// //                 )}

// //                 <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
// //                   <div className="flex items-start gap-3">
// //                     <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
// //                     <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
// //                       Interview experiences are community-submitted and may vary by team, location, interviewer and hiring cycle.
// //                     </p>
// //                   </div>
// //                 </div>
// //               </div>
// //             </article>

// //             <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
// //               <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
// //                 <h2 className="text-sm font-black text-slate-950 dark:text-white">Interview snapshot</h2>
// //                 <div className="mt-4 space-y-3 text-sm">
// //                   {experience && (
// //                     <div className="flex items-center justify-between gap-4">
// //                       <span className="text-slate-500 dark:text-slate-400">Experience</span>
// //                       <span className="text-right font-bold text-slate-900 dark:text-slate-100">{experience}</span>
// //                     </div>
// //                   )}
// //                   {info?.location && (
// //                     <div className="flex items-center justify-between gap-4">
// //                       <span className="text-slate-500 dark:text-slate-400">Location</span>
// //                       <span className="text-right font-bold text-slate-900 dark:text-slate-100">{info.location}{info?.country ? `, ${info.country}` : ""}</span>
// //                     </div>
// //                   )}
// //                   {info?.interviewMode && info.interviewMode !== "NOT_SPECIFIED" && (
// //                     <div className="flex items-center justify-between gap-4">
// //                       <span className="text-slate-500 dark:text-slate-400">Mode</span>
// //                       <span className="font-bold text-slate-900 dark:text-slate-100">{formatLabel(info.interviewMode)}</span>
// //                     </div>
// //                   )}
// //                   {info?.applicationSource && (
// //                     <div className="flex items-center justify-between gap-4">
// //                       <span className="text-slate-500 dark:text-slate-400">Applied via</span>
// //                       <span className="text-right font-bold text-slate-900 dark:text-slate-100">{info.applicationSource}</span>
// //                     </div>
// //                   )}
// //                   {info?.interviewDate && (
// //                     <div className="flex items-center justify-between gap-4">
// //                       <span className="text-slate-500 dark:text-slate-400">Interview date</span>
// //                       <span className="font-bold text-slate-900 dark:text-slate-100">{formatDate(info.interviewDate)}</span>
// //                     </div>
// //                   )}
// //                   {interview?.totalRounds > 0 && (
// //                     <div className="flex items-center justify-between gap-4">
// //                       <span className="text-slate-500 dark:text-slate-400">Rounds</span>
// //                       <span className="font-bold text-slate-900 dark:text-slate-100">{interview.totalRounds}</span>
// //                     </div>
// //                   )}
// //                 </div>
// //               </section>

// //               <section className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-lg shadow-blue-600/10 dark:border-blue-900/40">
// //                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
// //                   <Plus className="h-5 w-5" />
// //                 </div>
// //                 <h3 className="mt-4 text-lg font-black">Share your own interview</h3>
// //                 <p className="mt-2 text-sm leading-6 text-blue-100">
// //                   Help another engineer prepare better. Anonymous publishing is supported.
// //                 </p>
// //                 <button
// //                   type="button"
// //                   onClick={() => navigate("/interview/create")}
// //                   className="mt-4 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-black text-blue-700 transition hover:bg-blue-50"
// //                 >
// //                   Add interview experience
// //                 </button>
// //               </section>

// //               <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
// //                 <h3 className="text-sm font-black text-slate-950 dark:text-white">Published</h3>
// //                 <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
// //                   <CalendarDays className="h-4 w-4" /> {formatDate(publishedAt)}
// //                 </div>
// //                 <a
// //                   href={canonicalUrl}
// //                   className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
// //                 >
// //                   Canonical page <ExternalLink className="h-3.5 w-3.5" />
// //                 </a>
// //               </section>
// //             </aside>
// //           </div>
// //         </main>
// //       </div>
// //     </>
// //   );
// // };

// // export default InterviewDetailPage;
// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import { Helmet } from "react-helmet";

// import {
//   useNavigate,
//   useParams,
// } from "react-router-dom";

// import { toast } from "react-hot-toast";

// import {
//   ArrowLeft,
//   BadgeCheck,
//   BookOpen,
//   BriefcaseBusiness,
//   Building2,
//   CalendarDays,
//   CheckCircle2,
//   CircleUserRound,
//   Clock3,
//   Code2,
//   Hash,
//   MapPin,
//   Moon,
//   Plus,
//   ShieldCheck,
//   Sparkles,
//   Star,
//   Sun,
//   Tag,
// } from "lucide-react";

// import BASE_URL from "../utils/Url.js";

// import {
//   SITE_URL,
//   buildDescription,
//   formatDate,
//   formatLabel,
//   getDifficultyClasses,
//   getExperienceText,
//   getResultClasses,
//   getTimeAgo,
//   markdownToHtml,
// } from "../utils/InterviewUiUtils.js";

// const ThemeButton = ({
//   isDark,
//   onToggle,
// }) => {
//   return (
//     <button
//       type="button"
//       onClick={onToggle}
//       aria-label={
//         isDark
//           ? "Switch to light mode"
//           : "Switch to dark mode"
//       }
//       title={
//         isDark
//           ? "Light mode"
//           : "Dark mode"
//       }
//       className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
//         isDark
//           ? "border-slate-700 bg-slate-900 text-yellow-400 hover:border-slate-600 hover:bg-slate-800"
//           : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:bg-slate-50 hover:text-blue-600"
//       }`}
//     >
//       {isDark ? (
//         <Sun className="h-5 w-5" />
//       ) : (
//         <Moon className="h-5 w-5" />
//       )}
//     </button>
//   );
// };

// const DetailSkeleton = ({
//   isDark,
// }) => {
//   return (
//     <div className="mx-auto max-w-7xl animate-pulse px-4 py-6 sm:px-6 lg:px-8">
//       <div
//         className={`h-10 w-28 rounded-xl ${
//           isDark
//             ? "bg-slate-800"
//             : "bg-slate-200"
//         }`}
//       />

//       <div
//         className={`mt-6 rounded-3xl border p-5 sm:p-8 ${
//           isDark
//             ? "border-slate-800 bg-slate-900"
//             : "border-slate-200 bg-white"
//         }`}
//       >
//         <div
//           className={`h-4 w-44 rounded ${
//             isDark
//               ? "bg-slate-800"
//               : "bg-slate-200"
//           }`}
//         />

//         <div
//           className={`mt-4 h-10 w-4/5 rounded ${
//             isDark
//               ? "bg-slate-800"
//               : "bg-slate-200"
//           }`}
//         />

//         <div
//           className={`mt-4 h-4 w-1/2 rounded ${
//             isDark
//               ? "bg-slate-800"
//               : "bg-slate-100"
//           }`}
//         />

//         <div
//           className={`mt-8 h-4 w-full rounded ${
//             isDark
//               ? "bg-slate-800"
//               : "bg-slate-100"
//           }`}
//         />

//         <div
//           className={`mt-3 h-4 w-11/12 rounded ${
//             isDark
//               ? "bg-slate-800"
//               : "bg-slate-100"
//           }`}
//         />
//       </div>
//     </div>
//   );
// };

// const InterviewDetailPage = () => {
//   const { slug } =
//     useParams();

//   const navigate =
//     useNavigate();

//   /*
//   |--------------------------------------------------------------------------
//   | THEME
//   |--------------------------------------------------------------------------
//   |
//   | No Tailwind dark: dependency.
//   |
//   | We read the localStorage value and directly apply conditional classes.
//   |
//   */

//   const [
//     theme,
//     setTheme,
//   ] = useState(() => {
//     if (
//       typeof window ===
//       "undefined"
//     ) {
//       return "light";
//     }

//     const saved =
//       window.localStorage.getItem(
//         "theme"
//       );

//     return saved === "dark"
//       ? "dark"
//       : "light";
//   });

//   const isDark =
//     theme === "dark";

//   useEffect(() => {
//     window.localStorage.setItem(
//       "theme",
//       theme
//     );
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme((previous) =>
//       previous === "dark"
//         ? "light"
//         : "dark"
//     );
//   };

//   /*
//   |--------------------------------------------------------------------------
//   | API
//   |--------------------------------------------------------------------------
//   */

//   const API_BASE =
//     useMemo(
//       () =>
//         `${BASE_URL.replace(
//           /\/$/,
//           ""
//         )}/api/interview`,
//       []
//     );

//   const [
//     interview,
//     setInterview,
//   ] = useState(null);

//   const [
//     loading,
//     setLoading,
//   ] = useState(true);

//   const fetchInterview =
//     useCallback(
//       async () => {
//         if (!slug) {
//           return;
//         }

//         try {
//           setLoading(true);

//           const response =
//             await fetch(
//               `${API_BASE}/${encodeURIComponent(
//                 slug
//               )}`
//             );

//           const data =
//             await response.json();

//           if (!response.ok) {
//             throw new Error(
//               data?.message ||
//                 "Unable to load interview experience."
//             );
//           }

//           setInterview(
//             data?.data ||
//               null
//           );
//         } catch (error) {
//           console.error(
//             "Interview detail error:",
//             error
//           );

//           toast.error(
//             error?.message ||
//               "Unable to load interview experience."
//           );
//         } finally {
//           setLoading(false);
//         }
//       },
//       [
//         API_BASE,
//         slug,
//       ]
//     );

//   useEffect(() => {
//     fetchInterview();
//   }, [fetchInterview]);

//   /*
//   |--------------------------------------------------------------------------
//   | LOADING
//   |--------------------------------------------------------------------------
//   */

//   if (loading) {
//     return (
//       <div
//         className={`min-h-screen pt-20 transition-colors sm:pt-24 ${
//           isDark
//             ? "bg-[#0b0f17] text-slate-100"
//             : "bg-slate-50 text-slate-900"
//         }`}
//       >
//         <DetailSkeleton
//           isDark={isDark}
//         />
//       </div>
//     );
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | NOT FOUND
//   |--------------------------------------------------------------------------
//   */

//   if (!interview) {
//     return (
//       <>
//         <Helmet>
//           <title>
//             Interview Experience
//             Not Found |
//             TargetTrek
//           </title>

//           <meta
//             name="robots"
//             content="noindex,nofollow"
//           />
//         </Helmet>

//         <div
//           className={`min-h-screen pt-20 transition-colors sm:pt-24 ${
//             isDark
//               ? "bg-[#0b0f17] text-white"
//               : "bg-slate-50 text-slate-900"
//           }`}
//         >
//           <div className="mx-auto max-w-xl px-4 py-20 text-center">
//             <h1
//               className={`text-2xl font-black ${
//                 isDark
//                   ? "text-white"
//                   : "text-slate-950"
//               }`}
//             >
//               Interview
//               experience not
//               found
//             </h1>

//             <p
//               className={`mt-2 text-sm ${
//                 isDark
//                   ? "text-slate-400"
//                   : "text-slate-500"
//               }`}
//             >
//               This interview may
//               have been removed or
//               the URL may be
//               incorrect.
//             </p>

//             <button
//               type="button"
//               onClick={() =>
//                 navigate(
//                   "/interviews"
//                 )
//               }
//               className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
//             >
//               Back to interviews
//             </button>
//           </div>
//         </div>
//       </>
//     );
//   }

//   /*
//   |--------------------------------------------------------------------------
//   | DETAILS
//   |--------------------------------------------------------------------------
//   */

//   const info =
//     interview
//       ?.interviewInfo ||
//     {};

//   const experience =
//     getExperienceText(info);

//   const publishedAt =
//     interview?.publishedAt ||
//     interview?.createdAt;

//   const updatedAt =
//     interview?.updatedAt ||
//     publishedAt;

//   /*
//   |--------------------------------------------------------------------------
//   | SEO
//   |--------------------------------------------------------------------------
//   |
//   | The visible Canonical Page link is removed.
//   |
//   | But the canonical <link> stays in Helmet because it is good SEO.
//   |
//   */

//   const canonicalPath =
//     interview?.seo
//       ?.canonicalPath ||
//     `/interviews/${interview.slug}`;

//   const canonicalUrl =
//     canonicalPath.startsWith(
//       "http"
//     )
//       ? canonicalPath
//       : `${SITE_URL}${
//           canonicalPath.startsWith(
//             "/"
//           )
//             ? canonicalPath
//             : `/${canonicalPath}`
//         }`;

//   const seoTitle =
//     interview?.seo?.title ||
//     `${interview?.company?.name || "Software Engineering"} ${interview?.role?.title || "Interview"} Experience | TargetTrek`;

//   const seoDescription =
//     buildDescription(
//       interview
//     );

//   const ogTitle =
//     interview?.seo
//       ?.ogTitle ||
//     seoTitle;

//   const ogDescription =
//     interview?.seo
//       ?.ogDescription ||
//     seoDescription;

//   const ogImage =
//     interview?.seo
//       ?.ogImage || "";

//   const structuredData = {
//     "@context":
//       "https://schema.org",

//     "@type":
//       "Article",

//     headline:
//       interview.title,

//     description:
//       seoDescription,

//     url:
//       canonicalUrl,

//     mainEntityOfPage: {
//       "@type":
//         "WebPage",

//       "@id":
//         canonicalUrl,
//     },

//     datePublished:
//       publishedAt,

//     dateModified:
//       updatedAt,

//     author: {
//       "@type":
//         interview?.author
//           ?.isAnonymous
//           ? "Organization"
//           : "Person",

//       name:
//         interview?.author
//           ?.isAnonymous
//           ? "TargetTrek Community"
//           : interview?.author
//               ?.name ||
//             "TargetTrek Community",
//     },

//     publisher: {
//       "@type":
//         "Organization",

//       name:
//         "TargetTrek",

//       url:
//         SITE_URL,
//     },

//     about: [
//       interview?.company
//         ?.name,

//       interview?.role
//         ?.title,

//       ...(interview?.topics ||
//         []),

//       ...(interview
//         ?.technologies ||
//         []),
//     ].filter(Boolean),

//     ...(ogImage
//       ? {
//           image: [
//             ogImage,
//           ],
//         }
//       : {}),
//   };

//   return (
//     <>
//       <Helmet>
//         <title>
//           {seoTitle}
//         </title>

//         <meta
//           name="description"
//           content={
//             seoDescription
//           }
//         />

//         <meta
//           name="robots"
//           content={
//             interview?.seo
//               ?.robots ||
//             "index,follow,max-image-preview:large"
//           }
//         />

//         <link
//           rel="canonical"
//           href={
//             canonicalUrl
//           }
//         />

//         {/* OPEN GRAPH */}

//         <meta
//           property="og:type"
//           content="article"
//         />

//         <meta
//           property="og:site_name"
//           content="TargetTrek"
//         />

//         <meta
//           property="og:title"
//           content={ogTitle}
//         />

//         <meta
//           property="og:description"
//           content={
//             ogDescription
//           }
//         />

//         <meta
//           property="og:url"
//           content={
//             canonicalUrl
//           }
//         />

//         {ogImage && (
//           <meta
//             property="og:image"
//             content={ogImage}
//           />
//         )}

//         {publishedAt && (
//           <meta
//             property="article:published_time"
//             content={
//               publishedAt
//             }
//           />
//         )}

//         {updatedAt && (
//           <meta
//             property="article:modified_time"
//             content={
//               updatedAt
//             }
//           />
//         )}

//         {/* TWITTER */}

//         <meta
//           name="twitter:card"
//           content={
//             ogImage
//               ? "summary_large_image"
//               : "summary"
//           }
//         />

//         <meta
//           name="twitter:title"
//           content={ogTitle}
//         />

//         <meta
//           name="twitter:description"
//           content={
//             ogDescription
//           }
//         />

//         {ogImage && (
//           <meta
//             name="twitter:image"
//             content={ogImage}
//           />
//         )}

//         {/* STRUCTURED DATA */}

//         <script
//           type="application/ld+json"
//         >
//           {JSON.stringify(
//             structuredData
//           )}
//         </script>
//       </Helmet>

//       <div
//         className={`min-h-screen pt-20 transition-colors duration-300 sm:pt-24 ${
//           isDark
//             ? "bg-[#0b0f17] text-slate-100"
//             : "bg-slate-50 text-slate-900"
//         }`}
//       >
//         {/* TOP BAR */}

//         <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between gap-3">
//             <button
//               type="button"
//               onClick={() =>
//                 navigate(
//                   "/interviews"
//                 )
//               }
//               className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-bold transition ${
//                 isDark
//                   ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-700 hover:text-blue-400"
//                   : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-600"
//               }`}
//             >
//               <ArrowLeft className="h-4 w-4" />

//               <span className="hidden sm:inline">
//                 All interviews
//               </span>

//               <span className="sm:hidden">
//                 Back
//               </span>
//             </button>

//             <ThemeButton
//               isDark={
//                 isDark
//               }
//               onToggle={
//                 toggleTheme
//               }
//             />
//           </div>
//         </div>

//         {/* MAIN */}

//         <main className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
//           <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
//             {/* ARTICLE */}

//             <article
//               className={`min-w-0 overflow-hidden rounded-2xl border shadow-sm sm:rounded-3xl ${
//                 isDark
//                   ? "border-slate-800 bg-slate-900"
//                   : "border-slate-200 bg-white"
//               }`}
//             >
//               {/* ARTICLE HEADER */}

//               <header
//                 className={`border-b px-4 py-5 sm:px-8 sm:py-8 ${
//                   isDark
//                     ? "border-slate-800 bg-gradient-to-b from-blue-950/20 to-slate-900"
//                     : "border-slate-100 bg-gradient-to-b from-blue-50/70 to-white"
//                 }`}
//               >
//                 <div className="flex items-start gap-3 sm:gap-4">
//                   <div
//                     className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border sm:h-14 sm:w-14 sm:rounded-2xl ${
//                       isDark
//                         ? "border-slate-700 bg-slate-800"
//                         : "border-slate-200 bg-white shadow-sm"
//                     }`}
//                   >
//                     {interview
//                       ?.company
//                       ?.logoUrl ? (
//                       <img
//                         src={
//                           interview
//                             .company
//                             .logoUrl
//                         }
//                         alt={`${interview?.company?.name || "Company"} logo`}
//                         className="h-full w-full object-contain p-2"
//                       />
//                     ) : (
//                       <Building2
//                         className={`h-5 w-5 sm:h-6 sm:w-6 ${
//                           isDark
//                             ? "text-slate-400"
//                             : "text-slate-500"
//                         }`}
//                       />
//                     )}
//                   </div>

//                   <div className="min-w-0 flex-1">
//                     <div
//                       className={`flex flex-wrap items-center gap-2 text-xs font-bold sm:text-sm ${
//                         isDark
//                           ? "text-slate-400"
//                           : "text-slate-500"
//                       }`}
//                     >
//                       <span
//                         className={
//                           isDark
//                             ? "text-slate-100"
//                             : "text-slate-900"
//                         }
//                       >
//                         {
//                           interview
//                             ?.company
//                             ?.name
//                         }
//                       </span>

//                       <span
//                         className={
//                           isDark
//                             ? "text-slate-700"
//                             : "text-slate-300"
//                         }
//                       >
//                         •
//                       </span>

//                       <span>
//                         {
//                           interview
//                             ?.role
//                             ?.title
//                         }
//                       </span>

//                       {interview
//                         ?.role
//                         ?.level && (
//                         <>
//                           <span
//                             className={
//                               isDark
//                                 ? "text-slate-700"
//                                 : "text-slate-300"
//                             }
//                           >
//                             •
//                           </span>

//                           <span>
//                             {
//                               interview
//                                 .role
//                                 .level
//                             }
//                           </span>
//                         </>
//                       )}
//                     </div>

//                     <h1
//                       className={`mt-2 break-words text-xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl ${
//                         isDark
//                           ? "text-white"
//                           : "text-slate-950"
//                       }`}
//                     >
//                       {
//                         interview.title
//                       }
//                     </h1>

//                     <div
//                       className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium ${
//                         isDark
//                           ? "text-slate-400"
//                           : "text-slate-500"
//                       }`}
//                     >
//                       <span className="inline-flex items-center gap-1.5">
//                         <CircleUserRound className="h-3.5 w-3.5" />

//                         {interview
//                           ?.author
//                           ?.name ||
//                           "Anonymous"}
//                       </span>

//                       <span
//                         className={
//                           isDark
//                             ? "text-slate-700"
//                             : "text-slate-300"
//                         }
//                       >
//                         •
//                       </span>

//                       <span
//                         className="inline-flex items-center gap-1.5"
//                         title={formatDate(
//                           publishedAt
//                         )}
//                       >
//                         <Clock3 className="h-3.5 w-3.5" />

//                         {getTimeAgo(
//                           publishedAt
//                         )}
//                       </span>

//                       {interview
//                         ?.readingTimeMinutes >
//                         0 && (
//                         <>
//                           <span
//                             className={
//                               isDark
//                                 ? "text-slate-700"
//                                 : "text-slate-300"
//                             }
//                           >
//                             •
//                           </span>

//                           <span className="inline-flex items-center gap-1.5">
//                             <BookOpen className="h-3.5 w-3.5" />

//                             {
//                               interview.readingTimeMinutes
//                             }{" "}
//                             min read
//                           </span>
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* BADGES */}

//                 <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
//                   {info?.result &&
//                     info.result !==
//                       "NOT_DISCLOSED" && (
//                       <span
//                         className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getResultClasses(
//                           info.result,
//                           isDark
//                         )}`}
//                       >
//                         Result:{" "}
//                         {formatLabel(
//                           info.result
//                         )}
//                       </span>
//                     )}

//                   {info
//                     ?.difficulty &&
//                     info.difficulty !==
//                       "NOT_SPECIFIED" && (
//                       <span
//                         className={`rounded-full px-3 py-1.5 text-xs font-bold ${getDifficultyClasses(
//                           info.difficulty,
//                           isDark
//                         )}`}
//                       >
//                         Difficulty:{" "}
//                         {formatLabel(
//                           info.difficulty
//                         )}
//                       </span>
//                     )}

//                   {interview
//                     ?.editorPick && (
//                     <span
//                       className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
//                         isDark
//                           ? "bg-blue-950/50 text-blue-300"
//                           : "bg-blue-50 text-blue-700"
//                       }`}
//                     >
//                       <BadgeCheck className="h-3.5 w-3.5" />

//                       Editor's Pick
//                     </span>
//                   )}

//                   {interview
//                     ?.featured && (
//                     <span
//                       className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
//                         isDark
//                           ? "bg-violet-950/50 text-violet-300"
//                           : "bg-violet-50 text-violet-700"
//                       }`}
//                     >
//                       <Star className="h-3.5 w-3.5" />

//                       Featured
//                     </span>
//                   )}
//                 </div>
//               </header>

//               {/* ARTICLE BODY */}

//               <div className="min-w-0 px-4 py-5 sm:px-8 sm:py-8">
//                 {/* SUMMARY */}

//                 {interview
//                   ?.summaryMarkdown && (
//                   <section
//                     className={`mb-8 min-w-0 rounded-2xl border p-4 sm:p-5 ${
//                       isDark
//                         ? "border-blue-900/50 bg-blue-950/20"
//                         : "border-blue-100 bg-blue-50/60"
//                     }`}
//                   >
//                     <div className="flex items-center gap-2">
//                       <Sparkles className="h-4 w-4 text-blue-500" />

//                       <h2
//                         className={`text-sm font-black uppercase tracking-wider ${
//                           isDark
//                             ? "text-white"
//                             : "text-slate-900"
//                         }`}
//                       >
//                         Quick summary
//                       </h2>
//                     </div>

//                     <div
//                       className="mt-2 min-w-0"
//                       dangerouslySetInnerHTML={{
//                         __html:
//                           markdownToHtml(
//                             interview.summaryMarkdown,
//                             isDark
//                           ),
//                       }}
//                     />
//                   </section>
//                 )}

//                 {/* MAIN CONTENT */}

//                 {interview
//                   ?.contentMarkdown && (
//                   <section
//                     className="min-w-0 max-w-full overflow-hidden"
//                     dangerouslySetInnerHTML={{
//                       __html:
//                         markdownToHtml(
//                           interview.contentMarkdown,
//                           isDark
//                         ),
//                     }}
//                   />
//                 )}

//                 {/* ROUNDS */}

//                 {Array.isArray(
//                   interview?.rounds
//                 ) &&
//                   interview.rounds
//                     .length >
//                     0 && (
//                     <section
//                       className={`mt-10 min-w-0 border-t pt-8 ${
//                         isDark
//                           ? "border-slate-800"
//                           : "border-slate-200"
//                       }`}
//                     >
//                       <div className="mb-5 flex items-center gap-2">
//                         <BriefcaseBusiness className="h-5 w-5 text-blue-500" />

//                         <h2
//                           className={`text-xl font-black sm:text-2xl ${
//                             isDark
//                               ? "text-white"
//                               : "text-slate-950"
//                           }`}
//                         >
//                           Interview
//                           rounds
//                         </h2>
//                       </div>

//                       <div className="space-y-4">
//                         {interview.rounds.map(
//                           (
//                             round,
//                             index
//                           ) => (
//                             <section
//                               key={
//                                 round?._id ||
//                                 `${round?.title}-${index}`
//                               }
//                               className={`min-w-0 rounded-2xl border p-4 sm:p-5 ${
//                                 isDark
//                                   ? "border-slate-800 bg-slate-950/40"
//                                   : "border-slate-200 bg-slate-50/70"
//                               }`}
//                             >
//                               <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//                                 <div className="min-w-0">
//                                   <span className="text-[11px] font-black uppercase tracking-wider text-blue-500">
//                                     Round{" "}
//                                     {index +
//                                       1}
//                                   </span>

//                                   <h3
//                                     className={`mt-1 break-words text-lg font-black ${
//                                       isDark
//                                         ? "text-white"
//                                         : "text-slate-950"
//                                     }`}
//                                   >
//                                     {round?.title ||
//                                       `Round ${
//                                         index +
//                                         1
//                                       }`}
//                                   </h3>
//                                 </div>

//                                 <div className="flex flex-wrap gap-2">
//                                   {round?.durationMinutes >
//                                     0 && (
//                                     <span
//                                       className={`rounded-full px-2.5 py-1 text-xs font-bold ${
//                                         isDark
//                                           ? "bg-slate-900 text-slate-300"
//                                           : "bg-white text-slate-600"
//                                       }`}
//                                     >
//                                       {
//                                         round.durationMinutes
//                                       }{" "}
//                                       mins
//                                     </span>
//                                   )}

//                                   {round
//                                     ?.difficulty &&
//                                     round.difficulty !==
//                                       "NOT_SPECIFIED" && (
//                                       <span
//                                         className={`rounded-full px-2.5 py-1 text-xs font-bold ${getDifficultyClasses(
//                                           round.difficulty,
//                                           isDark
//                                         )}`}
//                                       >
//                                         {formatLabel(
//                                           round.difficulty
//                                         )}
//                                       </span>
//                                     )}
//                                 </div>
//                               </div>

//                               {round
//                                 ?.contentMarkdown && (
//                                 <div
//                                   className="mt-4 min-w-0 max-w-full overflow-hidden"
//                                   dangerouslySetInnerHTML={{
//                                     __html:
//                                       markdownToHtml(
//                                         round.contentMarkdown,
//                                         isDark
//                                       ),
//                                   }}
//                                 />
//                               )}

//                               {Array.isArray(
//                                 round?.questions
//                               ) &&
//                                 round
//                                   .questions
//                                   .length >
//                                   0 && (
//                                   <div
//                                     className={`mt-5 min-w-0 space-y-3 border-t pt-5 ${
//                                       isDark
//                                         ? "border-slate-800"
//                                         : "border-slate-200"
//                                     }`}
//                                   >
//                                     <h4
//                                       className={`text-sm font-black uppercase tracking-wider ${
//                                         isDark
//                                           ? "text-slate-300"
//                                           : "text-slate-700"
//                                       }`}
//                                     >
//                                       Questions
//                                       asked
//                                     </h4>

//                                     {round.questions.map(
//                                       (
//                                         question,
//                                         questionIndex
//                                       ) => (
//                                         <div
//                                           key={
//                                             question?._id ||
//                                             questionIndex
//                                           }
//                                           className={`min-w-0 rounded-xl border p-4 ${
//                                             isDark
//                                               ? "border-slate-800 bg-slate-900"
//                                               : "border-slate-200 bg-white"
//                                           }`}
//                                         >
//                                           <div className="flex min-w-0 gap-3">
//                                             <span
//                                               className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
//                                                 isDark
//                                                   ? "bg-blue-950/50 text-blue-300"
//                                                   : "bg-blue-50 text-blue-600"
//                                               }`}
//                                             >
//                                               {questionIndex +
//                                                 1}
//                                             </span>

//                                             <div className="min-w-0 flex-1">
//                                               <p
//                                                 className={`break-words font-semibold leading-6 ${
//                                                   isDark
//                                                     ? "text-slate-100"
//                                                     : "text-slate-900"
//                                                 }`}
//                                               >
//                                                 {
//                                                   question?.question
//                                                 }
//                                               </p>

//                                               {question
//                                                 ?.descriptionMarkdown && (
//                                                 <div
//                                                   className="mt-2 min-w-0 max-w-full overflow-hidden"
//                                                   dangerouslySetInnerHTML={{
//                                                     __html:
//                                                       markdownToHtml(
//                                                         question.descriptionMarkdown,
//                                                         isDark
//                                                       ),
//                                                   }}
//                                                 />
//                                               )}

//                                               {question
//                                                 ?.approachMarkdown && (
//                                                 <div
//                                                   className={`mt-3 min-w-0 max-w-full overflow-hidden rounded-xl px-3 py-1 sm:px-4 ${
//                                                     isDark
//                                                       ? "bg-slate-950/50"
//                                                       : "bg-slate-50"
//                                                   }`}
//                                                   dangerouslySetInnerHTML={{
//                                                     __html:
//                                                       markdownToHtml(
//                                                         question.approachMarkdown,
//                                                         isDark
//                                                       ),
//                                                   }}
//                                                 />
//                                               )}
//                                             </div>
//                                           </div>
//                                         </div>
//                                       )
//                                     )}
//                                   </div>
//                                 )}
//                             </section>
//                           )
//                         )}
//                       </div>
//                     </section>
//                   )}

//                 {/* PREPARATION */}

//                 {interview
//                   ?.preparationMarkdown && (
//                   <section
//                     className={`mt-10 min-w-0 border-t pt-8 ${
//                       isDark
//                         ? "border-slate-800"
//                         : "border-slate-200"
//                     }`}
//                   >
//                     <h2
//                       className={`text-xl font-black sm:text-2xl ${
//                         isDark
//                           ? "text-white"
//                           : "text-slate-950"
//                       }`}
//                     >
//                       Preparation
//                     </h2>

//                     <div
//                       className="mt-2 min-w-0 max-w-full overflow-hidden"
//                       dangerouslySetInnerHTML={{
//                         __html:
//                           markdownToHtml(
//                             interview.preparationMarkdown,
//                             isDark
//                           ),
//                       }}
//                     />
//                   </section>
//                 )}

//                 {/* ADVICE */}

//                 {interview
//                   ?.adviceMarkdown && (
//                   <section
//                     className={`mt-8 min-w-0 rounded-2xl border p-4 sm:p-5 ${
//                       isDark
//                         ? "border-emerald-900/50 bg-emerald-950/20"
//                         : "border-emerald-100 bg-emerald-50/60"
//                     }`}
//                   >
//                     <div className="flex items-center gap-2">
//                       <CheckCircle2 className="h-5 w-5 text-emerald-500" />

//                       <h2
//                         className={`text-lg font-black ${
//                           isDark
//                             ? "text-white"
//                             : "text-slate-950"
//                         }`}
//                       >
//                         Advice for
//                         candidates
//                       </h2>
//                     </div>

//                     <div
//                       className="mt-2 min-w-0 max-w-full overflow-hidden"
//                       dangerouslySetInnerHTML={{
//                         __html:
//                           markdownToHtml(
//                             interview.adviceMarkdown,
//                             isDark
//                           ),
//                       }}
//                     />
//                   </section>
//                 )}

//                 {/* TAKEAWAYS */}

//                 {interview
//                   ?.keyTakeawaysMarkdown && (
//                   <section
//                     className={`mt-8 min-w-0 rounded-2xl border p-4 sm:p-5 ${
//                       isDark
//                         ? "border-violet-900/50 bg-violet-950/20"
//                         : "border-violet-100 bg-violet-50/60"
//                     }`}
//                   >
//                     <div className="flex items-center gap-2">
//                       <Sparkles className="h-5 w-5 text-violet-500" />

//                       <h2
//                         className={`text-lg font-black ${
//                           isDark
//                             ? "text-white"
//                             : "text-slate-950"
//                         }`}
//                       >
//                         Key takeaways
//                       </h2>
//                     </div>

//                     <div
//                       className="mt-2 min-w-0 max-w-full overflow-hidden"
//                       dangerouslySetInnerHTML={{
//                         __html:
//                           markdownToHtml(
//                             interview.keyTakeawaysMarkdown,
//                             isDark
//                           ),
//                       }}
//                     />
//                   </section>
//                 )}

//                 {/* TOPICS */}

//                 {(interview
//                   ?.topics
//                   ?.length >
//                   0 ||
//                   interview
//                     ?.technologies
//                     ?.length >
//                     0 ||
//                   interview?.tags
//                     ?.length >
//                     0) && (
//                   <section
//                     className={`mt-10 border-t pt-7 ${
//                       isDark
//                         ? "border-slate-800"
//                         : "border-slate-200"
//                     }`}
//                   >
//                     <div className="flex flex-wrap gap-2">
//                       {interview?.technologies?.map(
//                         (
//                           item
//                         ) => (
//                           <span
//                             key={`tech-${item}`}
//                             className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${
//                               isDark
//                                 ? "bg-blue-950/50 text-blue-300"
//                                 : "bg-blue-50 text-blue-700"
//                             }`}
//                           >
//                             <Code2 className="h-3 w-3" />

//                             {
//                               item
//                             }
//                           </span>
//                         )
//                       )}

//                       {interview?.topics?.map(
//                         (
//                           item
//                         ) => (
//                           <span
//                             key={`topic-${item}`}
//                             className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
//                               isDark
//                                 ? "bg-slate-800 text-slate-300"
//                                 : "bg-slate-100 text-slate-600"
//                             }`}
//                           >
//                             <Hash className="h-3 w-3" />

//                             {
//                               item
//                             }
//                           </span>
//                         )
//                       )}

//                       {interview?.tags?.map(
//                         (
//                           item
//                         ) => (
//                           <span
//                             key={`tag-${item}`}
//                             className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
//                               isDark
//                                 ? "border-slate-700 bg-slate-900 text-slate-300"
//                                 : "border-slate-200 bg-white text-slate-600"
//                             }`}
//                           >
//                             <Tag className="h-3 w-3" />

//                             {
//                               item
//                             }
//                           </span>
//                         )
//                       )}
//                     </div>
//                   </section>
//                 )}

//                 {/* DISCLAIMER */}

//                 <div
//                   className={`mt-10 rounded-2xl border p-4 ${
//                     isDark
//                       ? "border-slate-800 bg-slate-950/40"
//                       : "border-slate-200 bg-slate-50"
//                   }`}
//                 >
//                   <div className="flex items-start gap-3">
//                     <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

//                     <p
//                       className={`text-xs leading-6 ${
//                         isDark
//                           ? "text-slate-400"
//                           : "text-slate-500"
//                       }`}
//                     >
//                       Interview
//                       experiences are
//                       community-submitted
//                       and may vary by
//                       team, location,
//                       interviewer and
//                       hiring cycle.
//                     </p>
//                   </div>
//                 </div>

//                 {/* BOTTOM BACK BUTTON */}

//                 <div
//                   className={`mt-8 border-t pt-6 ${
//                     isDark
//                       ? "border-slate-800"
//                       : "border-slate-200"
//                   }`}
//                 >
//                   <button
//                     type="button"
//                     onClick={() =>
//                       navigate(
//                         "/interviews"
//                       )
//                     }
//                     className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
//                       isDark
//                         ? "border-slate-700 bg-slate-950 text-slate-300 hover:border-blue-700 hover:text-blue-400"
//                         : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
//                     }`}
//                   >
//                     <ArrowLeft className="h-4 w-4" />

//                     Back to all
//                     interviews
//                   </button>
//                 </div>
//               </div>
//             </article>

//             {/* SIDEBAR */}

//             <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
//               {/* SNAPSHOT */}

//               <section
//                 className={`rounded-2xl border p-5 shadow-sm ${
//                   isDark
//                     ? "border-slate-800 bg-slate-900"
//                     : "border-slate-200 bg-white"
//                 }`}
//               >
//                 <h2
//                   className={`text-sm font-black ${
//                     isDark
//                       ? "text-white"
//                       : "text-slate-950"
//                   }`}
//                 >
//                   Interview snapshot
//                 </h2>

//                 <div className="mt-4 space-y-3 text-sm">
//                   {experience && (
//                     <div className="flex items-center justify-between gap-4">
//                       <span
//                         className={
//                           isDark
//                             ? "text-slate-400"
//                             : "text-slate-500"
//                         }
//                       >
//                         Experience
//                       </span>

//                       <span
//                         className={`text-right font-bold ${
//                           isDark
//                             ? "text-slate-100"
//                             : "text-slate-900"
//                         }`}
//                       >
//                         {experience}
//                       </span>
//                     </div>
//                   )}

//                   {info?.location && (
//                     <div className="flex items-center justify-between gap-4">
//                       <span
//                         className={
//                           isDark
//                             ? "text-slate-400"
//                             : "text-slate-500"
//                         }
//                       >
//                         Location
//                       </span>

//                       <span
//                         className={`text-right font-bold ${
//                           isDark
//                             ? "text-slate-100"
//                             : "text-slate-900"
//                         }`}
//                       >
//                         {
//                           info.location
//                         }

//                         {info?.country
//                           ? `, ${info.country}`
//                           : ""}
//                       </span>
//                     </div>
//                   )}

//                   {info
//                     ?.interviewMode &&
//                     info.interviewMode !==
//                       "NOT_SPECIFIED" && (
//                       <div className="flex items-center justify-between gap-4">
//                         <span
//                           className={
//                             isDark
//                               ? "text-slate-400"
//                               : "text-slate-500"
//                           }
//                         >
//                           Mode
//                         </span>

//                         <span
//                           className={`font-bold ${
//                             isDark
//                               ? "text-slate-100"
//                               : "text-slate-900"
//                           }`}
//                         >
//                           {formatLabel(
//                             info.interviewMode
//                           )}
//                         </span>
//                       </div>
//                     )}

//                   {info
//                     ?.applicationSource && (
//                     <div className="flex items-center justify-between gap-4">
//                       <span
//                         className={
//                           isDark
//                             ? "text-slate-400"
//                             : "text-slate-500"
//                         }
//                       >
//                         Applied via
//                       </span>

//                       <span
//                         className={`text-right font-bold ${
//                           isDark
//                             ? "text-slate-100"
//                             : "text-slate-900"
//                         }`}
//                       >
//                         {
//                           info.applicationSource
//                         }
//                       </span>
//                     </div>
//                   )}

//                   {info
//                     ?.interviewDate && (
//                     <div className="flex items-center justify-between gap-4">
//                       <span
//                         className={
//                           isDark
//                             ? "text-slate-400"
//                             : "text-slate-500"
//                         }
//                       >
//                         Interview date
//                       </span>

//                       <span
//                         className={`font-bold ${
//                           isDark
//                             ? "text-slate-100"
//                             : "text-slate-900"
//                         }`}
//                       >
//                         {formatDate(
//                           info.interviewDate
//                         )}
//                       </span>
//                     </div>
//                   )}

//                   {interview
//                     ?.totalRounds >
//                     0 && (
//                     <div className="flex items-center justify-between gap-4">
//                       <span
//                         className={
//                           isDark
//                             ? "text-slate-400"
//                             : "text-slate-500"
//                         }
//                       >
//                         Rounds
//                       </span>

//                       <span
//                         className={`font-bold ${
//                           isDark
//                             ? "text-slate-100"
//                             : "text-slate-900"
//                         }`}
//                       >
//                         {
//                           interview.totalRounds
//                         }
//                       </span>
//                     </div>
//                   )}
//                 </div>
//               </section>

//               {/* ADD EXPERIENCE */}

//               <section className="overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-lg shadow-blue-600/10">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
//                   <Plus className="h-5 w-5" />
//                 </div>

//                 <h3 className="mt-4 text-lg font-black">
//                   Share your own
//                   interview
//                 </h3>

//                 <p className="mt-2 text-sm leading-6 text-blue-100">
//                   Help another
//                   engineer prepare
//                   better. Anonymous
//                   publishing is
//                   supported.
//                 </p>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     navigate(
//                       "/interview/create"
//                     )
//                   }
//                   className="mt-4 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-black text-blue-700 transition hover:bg-blue-50"
//                 >
//                   Add interview
//                   experience
//                 </button>
//               </section>

//               {/* PUBLISHED */}

//               <section
//                 className={`rounded-2xl border p-5 shadow-sm ${
//                   isDark
//                     ? "border-slate-800 bg-slate-900"
//                     : "border-slate-200 bg-white"
//                 }`}
//               >
//                 <h3
//                   className={`text-sm font-black ${
//                     isDark
//                       ? "text-white"
//                       : "text-slate-950"
//                   }`}
//                 >
//                   Published
//                 </h3>

//                 <div
//                   className={`mt-3 flex items-center gap-2 text-xs ${
//                     isDark
//                       ? "text-slate-400"
//                       : "text-slate-500"
//                   }`}
//                 >
//                   <CalendarDays className="h-4 w-4" />

//                   {formatDate(
//                     publishedAt
//                   )}
//                 </div>

//                 {updatedAt &&
//                   updatedAt !==
//                     publishedAt && (
//                     <div
//                       className={`mt-2 text-xs ${
//                         isDark
//                           ? "text-slate-500"
//                           : "text-slate-400"
//                       }`}
//                     >
//                       Last updated:{" "}
//                       {formatDate(
//                         updatedAt
//                       )}
//                     </div>
//                   )}
//               </section>
//             </aside>
//           </div>
//         </main>
//       </div>
//     </>
//   );
// };

// export default InterviewDetailPage;
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Helmet } from "react-helmet";

import {
  Link,
  useParams,
} from "react-router-dom";

import { toast } from "react-hot-toast";

import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Code2,
  Hash,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";

import BASE_URL from "../utils/Url.js";

import {
  SITE_URL,
  buildDescription,
  formatDate,
  formatLabel,
  getDifficultyClasses,
  getExperienceText,
  getResultClasses,
  getTimeAgo,
  markdownToHtml,
} from "../utils/InterviewUiUtils.js";

const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    return localStorage.getItem("theme") === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

const DetailSkeleton = ({ isDark }) => {
  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="animate-pulse">
        <div
          className={`h-9 w-32 rounded-xl ${
            isDark
              ? "bg-slate-800"
              : "bg-slate-200"
          }`}
        />

        <div
          className={`mt-5 overflow-hidden rounded-2xl border sm:rounded-3xl ${
            isDark
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="p-5 sm:p-8">
            <div className="flex gap-4">
              <div
                className={`h-12 w-12 shrink-0 rounded-xl ${
                  isDark
                    ? "bg-slate-800"
                    : "bg-slate-200"
                }`}
              />

              <div className="min-w-0 flex-1">
                <div
                  className={`h-4 w-44 max-w-full rounded ${
                    isDark
                      ? "bg-slate-800"
                      : "bg-slate-200"
                  }`}
                />

                <div
                  className={`mt-4 h-8 w-4/5 rounded ${
                    isDark
                      ? "bg-slate-800"
                      : "bg-slate-200"
                  }`}
                />

                <div
                  className={`mt-3 h-4 w-1/2 rounded ${
                    isDark
                      ? "bg-slate-800"
                      : "bg-slate-100"
                  }`}
                />
              </div>
            </div>

            <div
              className={`mt-8 h-4 w-full rounded ${
                isDark
                  ? "bg-slate-800"
                  : "bg-slate-100"
              }`}
            />

            <div
              className={`mt-3 h-4 w-11/12 rounded ${
                isDark
                  ? "bg-slate-800"
                  : "bg-slate-100"
              }`}
            />

            <div
              className={`mt-3 h-4 w-4/5 rounded ${
                isDark
                  ? "bg-slate-800"
                  : "bg-slate-100"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SnapshotRow = ({
  label,
  value,
  isDark,
  icon: Icon,
}) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return (
    <div
      className={`flex items-start justify-between gap-4 border-b py-3 last:border-b-0 ${
        isDark
          ? "border-slate-800"
          : "border-slate-100"
      }`}
    >
      <div
        className={`flex min-w-0 items-center gap-2 text-xs font-medium sm:text-sm ${
          isDark
            ? "text-slate-400"
            : "text-slate-500"
        }`}
      >
        {Icon && (
          <Icon className="h-4 w-4 shrink-0" />
        )}

        <span>{label}</span>
      </div>

      <span
        className={`max-w-[58%] break-words text-right text-xs font-bold sm:text-sm ${
          isDark
            ? "text-slate-100"
            : "text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
};

const InterviewDetailPage = () => {
  const { slug } = useParams();

  const [theme, setTheme] = useState(
    getStoredTheme
  );

  const [interview, setInterview] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const isDark = theme === "dark";

  const API_BASE = useMemo(
    () =>
      `${BASE_URL.replace(
        /\/$/,
        ""
      )}/api/interview`,
    []
  );

  useEffect(() => {
    const syncTheme = () => {
      const currentTheme =
        getStoredTheme();

      setTheme((previousTheme) =>
        previousTheme !== currentTheme
          ? currentTheme
          : previousTheme
      );
    };

    const handleStorage = (event) => {
      if (
        event.key === "theme" ||
        event.key === null
      ) {
        syncTheme();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncTheme();
      }
    };

    syncTheme();

    const intervalId =
      window.setInterval(
        syncTheme,
        200
      );

    window.addEventListener(
      "storage",
      handleStorage
    );

    window.addEventListener(
      "focus",
      syncTheme
    );

    window.addEventListener(
      "themechange",
      syncTheme
    );

    window.addEventListener(
      "theme-change",
      syncTheme
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.clearInterval(intervalId);

      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        "focus",
        syncTheme
      );

      window.removeEventListener(
        "themechange",
        syncTheme
      );

      window.removeEventListener(
        "theme-change",
        syncTheme
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  const fetchInterview =
    useCallback(async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE}/${encodeURIComponent(
            slug
          )}`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to load interview experience."
          );
        }

        setInterview(
          data?.data || null
        );
      } catch (error) {
        console.error(
          "Interview detail error:",
          error
        );

        setInterview(null);

        toast.error(
          error?.message ||
            "Unable to load interview experience."
        );
      } finally {
        setLoading(false);
      }
    }, [API_BASE, slug]);

  useEffect(() => {
    fetchInterview();
  }, [fetchInterview]);

  if (loading) {
    return (
      <div
        className={`min-h-screen pt-20 transition-colors duration-300 sm:pt-24 ${
          isDark
            ? "bg-[#0b0f17] text-slate-100"
            : "bg-slate-50 text-slate-900"
        }`}
      >
        <DetailSkeleton
          isDark={isDark}
        />
      </div>
    );
  }

  if (!interview) {
    return (
      <>
        <Helmet>
          <title>
            Interview Experience Not Found |
            TargetTrek
          </title>

          <meta
            name="description"
            content="The requested interview experience could not be found on TargetTrek."
          />

          <meta
            name="robots"
            content="noindex,nofollow"
          />

          <meta
            name="theme-color"
            content={
              isDark
                ? "#0b0f17"
                : "#f8fafc"
            }
          />
        </Helmet>

        <main
          className={`flex min-h-screen items-center justify-center px-4 pt-20 transition-colors duration-300 sm:pt-24 ${
            isDark
              ? "bg-[#0b0f17]"
              : "bg-slate-50"
          }`}
        >
          <div
            className={`w-full max-w-xl rounded-2xl border p-6 text-center shadow-sm sm:rounded-3xl sm:p-10 ${
              isDark
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
            }`}
          >
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
                isDark
                  ? "bg-slate-800 text-slate-400"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <BriefcaseBusiness className="h-6 w-6" />
            </div>

            <h1
              className={`mt-5 text-2xl font-black sm:text-3xl ${
                isDark
                  ? "text-white"
                  : "text-slate-950"
              }`}
            >
              Interview experience not found
            </h1>

            <p
              className={`mx-auto mt-3 max-w-md text-sm leading-6 ${
                isDark
                  ? "text-slate-400"
                  : "text-slate-500"
              }`}
            >
              This interview experience may
              have been removed, unpublished,
              or the URL may be incorrect.
            </p>

            <Link
              to="/interviews"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Browse interviews
            </Link>
          </div>
        </main>
      </>
    );
  }

  const info =
    interview?.interviewInfo || {};

  const companyName =
    interview?.company?.name ||
    "Company";

  const roleTitle =
    interview?.role?.title ||
    "Software Engineer";

  const roleLevel =
    interview?.role?.level || "";

  const experience =
    getExperienceText(info);

  const publishedAt =
    interview?.publishedAt ||
    interview?.createdAt;

  const updatedAt =
    interview?.updatedAt ||
    publishedAt;

  const canonicalPath =
    interview?.seo?.canonicalPath ||
    `/interviews/${
      interview?.slug || slug
    }`;

  const canonicalUrl =
    canonicalPath.startsWith("http")
      ? canonicalPath
      : `${SITE_URL}${
          canonicalPath.startsWith("/")
            ? canonicalPath
            : `/${canonicalPath}`
        }`;

  const seoTitle =
    interview?.seo?.title ||
    `${companyName} ${roleTitle}${
      roleLevel
        ? ` ${roleLevel}`
        : ""
    } Interview Experience | TargetTrek`;

  const generatedDescription =
    buildDescription(interview);

  const seoDescription =
    interview?.seo?.description ||
    generatedDescription ||
    `Read a detailed ${companyName} ${roleTitle} interview experience including interview rounds, questions, preparation, difficulty, result and candidate advice.`;

  const ogTitle =
    interview?.seo?.ogTitle ||
    seoTitle;

  const ogDescription =
    interview?.seo?.ogDescription ||
    seoDescription;

  const ogImage =
    interview?.seo?.ogImage || "";

  const authorName =
    interview?.author?.isAnonymous
      ? "TargetTrek Community"
      : interview?.author?.name ||
        "TargetTrek Community";

  const topics = Array.isArray(
    interview?.topics
  )
    ? interview.topics
    : [];

  const technologies = Array.isArray(
    interview?.technologies
  )
    ? interview.technologies
    : [];

  const tags = Array.isArray(
    interview?.tags
  )
    ? interview.tags
    : [];

  const rounds = Array.isArray(
    interview?.rounds
  )
    ? interview.rounds
    : [];

  const keywordItems = [
    `${companyName} interview experience`,
    `${companyName} interview questions`,
    `${companyName} ${roleTitle} interview`,
    `${roleTitle} interview experience`,
    `${roleTitle} interview questions`,
    roleLevel,
    ...topics,
    ...technologies,
    ...tags,
  ].filter(Boolean);

  const seoKeywords = [
    ...new Set(keywordItems),
  ].join(", ");

  const totalRounds =
    interview?.totalRounds ||
    rounds.length ||
    0;

  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      interview?.title || seoTitle,
    name:
      interview?.title || seoTitle,
    description: seoDescription,
    url: canonicalUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    articleSection:
      "Software Engineering Interview Experiences",
    datePublished:
      publishedAt || undefined,
    dateModified:
      updatedAt || undefined,
    author: {
      "@type":
        interview?.author?.isAnonymous
          ? "Organization"
          : "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "TargetTrek",
      url: SITE_URL,
    },
    keywords: keywordItems,
    about: [
      companyName,
      roleTitle,
      roleLevel,
      ...topics,
      ...technologies,
    ]
      .filter(Boolean)
      .map((name) => ({
        "@type": "Thing",
        name,
      })),
    ...(interview
      ?.readingTimeMinutes > 0
      ? {
          timeRequired: `PT${interview.readingTimeMinutes}M`,
        }
      : {}),
    ...(ogImage
      ? {
          image: [ogImage],
        }
      : {}),
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "TargetTrek",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Interview Experiences",
        item: `${SITE_URL}/interviews`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name:
          interview?.title ||
          `${companyName} ${roleTitle} Interview Experience`,
        item: canonicalUrl,
      },
    ],
  };

  const resultValue =
    info?.result &&
    info.result !== "NOT_DISCLOSED"
      ? formatLabel(info.result)
      : null;

  const difficultyValue =
    info?.difficulty &&
    info.difficulty !== "NOT_SPECIFIED"
      ? formatLabel(
          info.difficulty
        )
      : null;

  const modeValue =
    info?.interviewMode &&
    info.interviewMode !==
      "NOT_SPECIFIED"
      ? formatLabel(
          info.interviewMode
        )
      : null;

  const locationValue =
    info?.location
      ? `${info.location}${
          info?.country
            ? `, ${info.country}`
            : ""
        }`
      : info?.country || null;

  return (
    <>
      <Helmet>
        <html
          lang="en"
          data-theme={theme}
        />

        <title>{seoTitle}</title>

        <meta
          name="description"
          content={seoDescription}
        />

        {seoKeywords && (
          <meta
            name="keywords"
            content={seoKeywords}
          />
        )}

        <meta
          name="author"
          content={authorName}
        />

        <meta
          name="robots"
          content={
            interview?.seo?.robots ||
            "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
          }
        />

        <meta
          name="theme-color"
          content={
            isDark
              ? "#0b0f17"
              : "#f8fafc"
          }
        />

        <link
          rel="canonical"
          href={canonicalUrl}
        />

        <meta
          property="og:type"
          content="article"
        />

        <meta
          property="og:site_name"
          content="TargetTrek"
        />

        <meta
          property="og:locale"
          content="en_IN"
        />

        <meta
          property="og:title"
          content={ogTitle}
        />

        <meta
          property="og:description"
          content={ogDescription}
        />

        <meta
          property="og:url"
          content={canonicalUrl}
        />

        {ogImage && (
          <>
            <meta
              property="og:image"
              content={ogImage}
            />

            <meta
              property="og:image:alt"
              content={`${companyName} ${roleTitle} interview experience`}
            />

            <meta
              name="twitter:image"
              content={ogImage}
            />

            <meta
              name="twitter:image:alt"
              content={`${companyName} ${roleTitle} interview experience`}
            />
          </>
        )}

        {publishedAt && (
          <meta
            property="article:published_time"
            content={publishedAt}
          />
        )}

        {updatedAt && (
          <meta
            property="article:modified_time"
            content={updatedAt}
          />
        )}

        <meta
          property="article:section"
          content="Interview Experiences"
        />

        {[
          ...new Set([
            ...topics,
            ...technologies,
            ...tags,
          ]),
        ].map((item) => (
          <meta
            key={`seo-tag-${item}`}
            property="article:tag"
            content={item}
          />
        ))}

        <meta
          name="twitter:card"
          content={
            ogImage
              ? "summary_large_image"
              : "summary"
          }
        />

        <meta
          name="twitter:title"
          content={ogTitle}
        />

        <meta
          name="twitter:description"
          content={ogDescription}
        />

        <script type="application/ld+json">
          {JSON.stringify(
            articleStructuredData
          )}
        </script>

        <script type="application/ld+json">
          {JSON.stringify(
            breadcrumbStructuredData
          )}
        </script>
      </Helmet>

      <div
        className={`min-h-screen pt-20 transition-colors duration-300 sm:pt-24 ${
          isDark
            ? "bg-[#0b0f17] text-slate-100"
            : "bg-slate-50 text-slate-900"
        }`}
      >
        <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className={`flex min-w-0 items-center gap-1.5 overflow-hidden text-xs font-medium ${
              isDark
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            <Link
              to="/"
              className={`shrink-0 transition ${
                isDark
                  ? "hover:text-blue-400"
                  : "hover:text-blue-600"
              }`}
            >
              TargetTrek
            </Link>

            <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />

            <Link
              to="/interviews"
              className={`shrink-0 transition ${
                isDark
                  ? "hover:text-blue-400"
                  : "hover:text-blue-600"
              }`}
            >
              Interviews
            </Link>

            <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 opacity-50 sm:block" />

            <span
              className={`hidden min-w-0 truncate sm:block ${
                isDark
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              {companyName} {roleTitle}
            </span>
          </nav>

          <div className="mt-3">
            <Link
              to="/interviews"
              className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-bold transition ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-700 hover:bg-slate-800 hover:text-blue-400"
                  : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              <ArrowLeft className="h-4 w-4" />

              <span className="hidden sm:inline">
                All interview experiences
              </span>

              <span className="sm:hidden">
                Back
              </span>
            </Link>
          </div>
        </div>

        <main className="mx-auto w-full max-w-7xl px-3 pb-10 sm:px-6 sm:pb-14 lg:px-8">
          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-6">
            <article
              className={`min-w-0 overflow-hidden rounded-2xl border shadow-sm transition-colors sm:rounded-3xl ${
                isDark
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <header
                className={`border-b px-4 py-5 sm:px-7 sm:py-7 lg:px-8 lg:py-8 ${
                  isDark
                    ? "border-slate-800 bg-gradient-to-b from-blue-950/20 to-slate-900"
                    : "border-slate-100 bg-gradient-to-b from-blue-50/70 to-white"
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border sm:h-14 sm:w-14 sm:rounded-2xl ${
                      isDark
                        ? "border-slate-700 bg-slate-800"
                        : "border-slate-200 bg-white shadow-sm"
                    }`}
                  >
                    {interview?.company
                      ?.logoUrl ? (
                      <img
                        src={
                          interview.company
                            .logoUrl
                        }
                        alt={`${companyName} logo`}
                        loading="eager"
                        decoding="async"
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <Building2
                        className={`h-5 w-5 sm:h-6 sm:w-6 ${
                          isDark
                            ? "text-slate-400"
                            : "text-slate-500"
                        }`}
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold sm:text-sm ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      <span
                        className={
                          isDark
                            ? "text-slate-100"
                            : "text-slate-900"
                        }
                      >
                        {companyName}
                      </span>

                      <span
                        className={
                          isDark
                            ? "text-slate-700"
                            : "text-slate-300"
                        }
                      >
                        •
                      </span>

                      <span>
                        {roleTitle}
                      </span>

                      {roleLevel && (
                        <>
                          <span
                            className={
                              isDark
                                ? "text-slate-700"
                                : "text-slate-300"
                            }
                          >
                            •
                          </span>

                          <span>
                            {roleLevel}
                          </span>
                        </>
                      )}
                    </div>

                    <h1
                      className={`mt-2 break-words text-xl font-black leading-[1.2] tracking-tight sm:text-3xl lg:text-4xl ${
                        isDark
                          ? "text-white"
                          : "text-slate-950"
                      }`}
                    >
                      {interview.title}
                    </h1>

                    <div
                      className={`mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[11px] font-medium sm:gap-x-3 sm:text-xs ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <CircleUserRound className="h-3.5 w-3.5 shrink-0" />
                        {authorName}
                      </span>

                      {publishedAt && (
                        <>
                          <span
                            className={
                              isDark
                                ? "text-slate-700"
                                : "text-slate-300"
                            }
                          >
                            •
                          </span>

                          <time
                            dateTime={
                              publishedAt
                            }
                            className="inline-flex items-center gap-1.5"
                            title={formatDate(
                              publishedAt
                            )}
                          >
                            <Clock3 className="h-3.5 w-3.5 shrink-0" />
                            {getTimeAgo(
                              publishedAt
                            )}
                          </time>
                        </>
                      )}

                      {interview
                        ?.readingTimeMinutes >
                        0 && (
                        <>
                          <span
                            className={
                              isDark
                                ? "text-slate-700"
                                : "text-slate-300"
                            }
                          >
                            •
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5 shrink-0" />
                            {
                              interview.readingTimeMinutes
                            }{" "}
                            min read
                          </span>
                        </>
                      )}

                      {locationValue && (
                        <>
                          <span
                            className={`hidden sm:inline ${
                              isDark
                                ? "text-slate-700"
                                : "text-slate-300"
                            }`}
                          >
                            •
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {locationValue}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
                  {resultValue && (
                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getResultClasses(
                        info.result,
                        isDark
                      )}`}
                    >
                      Result: {resultValue}
                    </span>
                  )}

                  {difficultyValue && (
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${getDifficultyClasses(
                        info.difficulty,
                        isDark
                      )}`}
                    >
                      Difficulty:{" "}
                      {difficultyValue}
                    </span>
                  )}

                  {interview?.editorPick && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                        isDark
                          ? "bg-blue-950/50 text-blue-300"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Editor's Pick
                    </span>
                  )}

                  {interview?.featured && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                        isDark
                          ? "bg-violet-950/50 text-violet-300"
                          : "bg-violet-50 text-violet-700"
                      }`}
                    >
                      <Star className="h-3.5 w-3.5" />
                      Featured
                    </span>
                  )}
                </div>
              </header>

              <div className="min-w-0 px-4 py-5 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
                {interview
                  ?.summaryMarkdown && (
                  <section
                    aria-labelledby="quick-summary-heading"
                    className={`mb-7 min-w-0 rounded-xl border p-4 sm:mb-8 sm:rounded-2xl sm:p-5 ${
                      isDark
                        ? "border-blue-900/50 bg-blue-950/20"
                        : "border-blue-100 bg-blue-50/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 shrink-0 text-blue-500" />

                      <h2
                        id="quick-summary-heading"
                        className={`text-sm font-black uppercase tracking-wider ${
                          isDark
                            ? "text-white"
                            : "text-slate-900"
                        }`}
                      >
                        Quick summary
                      </h2>
                    </div>

                    <div
                      className="mt-3 min-w-0 max-w-full overflow-hidden"
                      dangerouslySetInnerHTML={{
                        __html:
                          markdownToHtml(
                            interview.summaryMarkdown,
                            isDark
                          ),
                      }}
                    />
                  </section>
                )}

                {interview
                  ?.contentMarkdown && (
                  <section
                    aria-label={`${companyName} ${roleTitle} interview experience`}
                    className="min-w-0 max-w-full overflow-hidden"
                    dangerouslySetInnerHTML={{
                      __html:
                        markdownToHtml(
                          interview.contentMarkdown,
                          isDark
                        ),
                    }}
                  />
                )}

                {rounds.length > 0 && (
                  <section
                    aria-labelledby="interview-rounds-heading"
                    className={`mt-9 min-w-0 border-t pt-7 sm:mt-10 sm:pt-8 ${
                      isDark
                        ? "border-slate-800"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="mb-5 flex items-center gap-2">
                      <BriefcaseBusiness className="h-5 w-5 shrink-0 text-blue-500" />

                      <h2
                        id="interview-rounds-heading"
                        className={`text-xl font-black sm:text-2xl ${
                          isDark
                            ? "text-white"
                            : "text-slate-950"
                        }`}
                      >
                        Interview rounds
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {rounds.map(
                        (
                          round,
                          index
                        ) => (
                          <section
                            key={
                              round?._id ||
                              `${round?.title}-${index}`
                            }
                            aria-labelledby={`round-${index + 1}-heading`}
                            className={`min-w-0 rounded-xl border p-4 sm:rounded-2xl sm:p-5 ${
                              isDark
                                ? "border-slate-800 bg-slate-950/40"
                                : "border-slate-200 bg-slate-50/70"
                            }`}
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <span className="text-[11px] font-black uppercase tracking-wider text-blue-500">
                                  Round{" "}
                                  {index +
                                    1}
                                </span>

                                <h3
                                  id={`round-${index + 1}-heading`}
                                  className={`mt-1 break-words text-base font-black sm:text-lg ${
                                    isDark
                                      ? "text-white"
                                      : "text-slate-950"
                                  }`}
                                >
                                  {round?.title ||
                                    `Round ${
                                      index +
                                      1
                                    }`}
                                </h3>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {round
                                  ?.durationMinutes >
                                  0 && (
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                      isDark
                                        ? "bg-slate-900 text-slate-300"
                                        : "bg-white text-slate-600 shadow-sm"
                                    }`}
                                  >
                                    {
                                      round.durationMinutes
                                    }{" "}
                                    mins
                                  </span>
                                )}

                                {round
                                  ?.difficulty &&
                                  round.difficulty !==
                                    "NOT_SPECIFIED" && (
                                    <span
                                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${getDifficultyClasses(
                                        round.difficulty,
                                        isDark
                                      )}`}
                                    >
                                      {formatLabel(
                                        round.difficulty
                                      )}
                                    </span>
                                  )}
                              </div>
                            </div>

                            {round
                              ?.contentMarkdown && (
                              <div
                                className="mt-4 min-w-0 max-w-full overflow-hidden"
                                dangerouslySetInnerHTML={{
                                  __html:
                                    markdownToHtml(
                                      round.contentMarkdown,
                                      isDark
                                    ),
                                }}
                              />
                            )}

                            {Array.isArray(
                              round?.questions
                            ) &&
                              round
                                .questions
                                .length >
                                0 && (
                                <div
                                  className={`mt-5 min-w-0 space-y-3 border-t pt-5 ${
                                    isDark
                                      ? "border-slate-800"
                                      : "border-slate-200"
                                  }`}
                                >
                                  <h4
                                    className={`text-xs font-black uppercase tracking-wider sm:text-sm ${
                                      isDark
                                        ? "text-slate-300"
                                        : "text-slate-700"
                                    }`}
                                  >
                                    Questions asked
                                  </h4>

                                  {round.questions.map(
                                    (
                                      question,
                                      questionIndex
                                    ) => (
                                      <div
                                        key={
                                          question?._id ||
                                          questionIndex
                                        }
                                        className={`min-w-0 rounded-xl border p-3.5 sm:p-4 ${
                                          isDark
                                            ? "border-slate-800 bg-slate-900"
                                            : "border-slate-200 bg-white"
                                        }`}
                                      >
                                        <div className="flex min-w-0 gap-3">
                                          <span
                                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                                              isDark
                                                ? "bg-blue-950/50 text-blue-300"
                                                : "bg-blue-50 text-blue-600"
                                            }`}
                                          >
                                            {questionIndex +
                                              1}
                                          </span>

                                          <div className="min-w-0 flex-1">
                                            <p
                                              className={`break-words text-sm font-semibold leading-6 sm:text-base ${
                                                isDark
                                                  ? "text-slate-100"
                                                  : "text-slate-900"
                                              }`}
                                            >
                                              {
                                                question?.question
                                              }
                                            </p>

                                            {question
                                              ?.descriptionMarkdown && (
                                              <div
                                                className="mt-2 min-w-0 max-w-full overflow-hidden"
                                                dangerouslySetInnerHTML={{
                                                  __html:
                                                    markdownToHtml(
                                                      question.descriptionMarkdown,
                                                      isDark
                                                    ),
                                                }}
                                              />
                                            )}

                                            {question
                                              ?.approachMarkdown && (
                                              <div
                                                className={`mt-3 min-w-0 max-w-full overflow-hidden rounded-xl px-3 py-2 sm:px-4 ${
                                                  isDark
                                                    ? "bg-slate-950/60"
                                                    : "bg-slate-50"
                                                }`}
                                                dangerouslySetInnerHTML={{
                                                  __html:
                                                    markdownToHtml(
                                                      question.approachMarkdown,
                                                      isDark
                                                    ),
                                                }}
                                              />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                          </section>
                        )
                      )}
                    </div>
                  </section>
                )}

                {interview
                  ?.preparationMarkdown && (
                  <section
                    aria-labelledby="preparation-heading"
                    className={`mt-9 min-w-0 border-t pt-7 sm:mt-10 sm:pt-8 ${
                      isDark
                        ? "border-slate-800"
                        : "border-slate-200"
                    }`}
                  >
                    <h2
                      id="preparation-heading"
                      className={`text-xl font-black sm:text-2xl ${
                        isDark
                          ? "text-white"
                          : "text-slate-950"
                      }`}
                    >
                      Interview preparation
                    </h2>

                    <div
                      className="mt-3 min-w-0 max-w-full overflow-hidden"
                      dangerouslySetInnerHTML={{
                        __html:
                          markdownToHtml(
                            interview.preparationMarkdown,
                            isDark
                          ),
                      }}
                    />
                  </section>
                )}

                {interview
                  ?.adviceMarkdown && (
                  <section
                    aria-labelledby="candidate-advice-heading"
                    className={`mt-8 min-w-0 rounded-xl border p-4 sm:rounded-2xl sm:p-5 ${
                      isDark
                        ? "border-emerald-900/50 bg-emerald-950/20"
                        : "border-emerald-100 bg-emerald-50/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />

                      <h2
                        id="candidate-advice-heading"
                        className={`text-lg font-black ${
                          isDark
                            ? "text-white"
                            : "text-slate-950"
                        }`}
                      >
                        Advice for candidates
                      </h2>
                    </div>

                    <div
                      className="mt-3 min-w-0 max-w-full overflow-hidden"
                      dangerouslySetInnerHTML={{
                        __html:
                          markdownToHtml(
                            interview.adviceMarkdown,
                            isDark
                          ),
                      }}
                    />
                  </section>
                )}

                {interview
                  ?.keyTakeawaysMarkdown && (
                  <section
                    aria-labelledby="takeaways-heading"
                    className={`mt-8 min-w-0 rounded-xl border p-4 sm:rounded-2xl sm:p-5 ${
                      isDark
                        ? "border-violet-900/50 bg-violet-950/20"
                        : "border-violet-100 bg-violet-50/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 shrink-0 text-violet-500" />

                      <h2
                        id="takeaways-heading"
                        className={`text-lg font-black ${
                          isDark
                            ? "text-white"
                            : "text-slate-950"
                        }`}
                      >
                        Key takeaways
                      </h2>
                    </div>

                    <div
                      className="mt-3 min-w-0 max-w-full overflow-hidden"
                      dangerouslySetInnerHTML={{
                        __html:
                          markdownToHtml(
                            interview.keyTakeawaysMarkdown,
                            isDark
                          ),
                      }}
                    />
                  </section>
                )}

                {(technologies.length >
                  0 ||
                  topics.length > 0 ||
                  tags.length > 0) && (
                  <section
                    aria-labelledby="topics-heading"
                    className={`mt-9 border-t pt-7 sm:mt-10 ${
                      isDark
                        ? "border-slate-800"
                        : "border-slate-200"
                    }`}
                  >
                    <h2
                      id="topics-heading"
                      className={`mb-4 text-lg font-black ${
                        isDark
                          ? "text-white"
                          : "text-slate-950"
                      }`}
                    >
                      Topics covered
                    </h2>

                    <div className="flex flex-wrap gap-2">
                      {technologies.map(
                        (item) => (
                          <span
                            key={`tech-${item}`}
                            className={`inline-flex max-w-full items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold ${
                              isDark
                                ? "bg-blue-950/50 text-blue-300"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            <Code2 className="h-3 w-3 shrink-0" />
                            <span className="break-words">
                              {item}
                            </span>
                          </span>
                        )
                      )}

                      {topics.map(
                        (item) => (
                          <span
                            key={`topic-${item}`}
                            className={`inline-flex max-w-full items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                              isDark
                                ? "bg-slate-800 text-slate-300"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <Hash className="h-3 w-3 shrink-0" />
                            <span className="break-words">
                              {item}
                            </span>
                          </span>
                        )
                      )}

                      {tags.map(
                        (item) => (
                          <span
                            key={`tag-${item}`}
                            className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                              isDark
                                ? "border-slate-700 bg-slate-900 text-slate-300"
                                : "border-slate-200 bg-white text-slate-600"
                            }`}
                          >
                            <Tag className="h-3 w-3 shrink-0" />
                            <span className="break-words">
                              {item}
                            </span>
                          </span>
                        )
                      )}
                    </div>
                  </section>
                )}

                <div
                  className={`mt-9 rounded-xl border p-4 sm:mt-10 sm:rounded-2xl ${
                    isDark
                      ? "border-slate-800 bg-slate-950/40"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

                    <p
                      className={`text-xs leading-6 ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      Interview experiences
                      are community-submitted
                      and may vary by team,
                      location, interviewer,
                      hiring cycle and role.
                      Use this experience as a
                      preparation reference
                      rather than an exact
                      prediction of another
                      candidate's interview
                      process.
                    </p>
                  </div>
                </div>

                <div
                  className={`mt-7 border-t pt-6 sm:mt-8 ${
                    isDark
                      ? "border-slate-800"
                      : "border-slate-200"
                  }`}
                >
                  <Link
                    to="/interviews"
                    className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                      isDark
                        ? "border-slate-700 bg-slate-950 text-slate-300 hover:border-blue-700 hover:text-blue-400"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to all interviews
                  </Link>
                </div>
              </div>
            </article>

            <aside
              aria-label="Interview details"
              className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start"
            >
              <section
                className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${
                  isDark
                    ? "border-slate-800 bg-slate-900"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-blue-500" />

                  <h2
                    className={`text-sm font-black ${
                      isDark
                        ? "text-white"
                        : "text-slate-950"
                    }`}
                  >
                    Interview snapshot
                  </h2>
                </div>

                <div className="mt-3">
                  <SnapshotRow
                    label="Company"
                    value={companyName}
                    isDark={isDark}
                    icon={Building2}
                  />

                  <SnapshotRow
                    label="Role"
                    value={roleTitle}
                    isDark={isDark}
                    icon={BriefcaseBusiness}
                  />

                  <SnapshotRow
                    label="Level"
                    value={roleLevel}
                    isDark={isDark}
                  />

                  <SnapshotRow
                    label="Experience"
                    value={experience}
                    isDark={isDark}
                    icon={CircleUserRound}
                  />

                  <SnapshotRow
                    label="Result"
                    value={resultValue}
                    isDark={isDark}
                    icon={CheckCircle2}
                  />

                  <SnapshotRow
                    label="Difficulty"
                    value={difficultyValue}
                    isDark={isDark}
                  />

                  <SnapshotRow
                    label="Location"
                    value={locationValue}
                    isDark={isDark}
                    icon={MapPin}
                  />

                  <SnapshotRow
                    label="Interview mode"
                    value={modeValue}
                    isDark={isDark}
                  />

                  <SnapshotRow
                    label="Applied via"
                    value={
                      info?.applicationSource
                    }
                    isDark={isDark}
                  />

                  <SnapshotRow
                    label="Interview date"
                    value={
                      info?.interviewDate
                        ? formatDate(
                            info.interviewDate
                          )
                        : null
                    }
                    isDark={isDark}
                    icon={CalendarDays}
                  />

                  <SnapshotRow
                    label="Rounds"
                    value={
                      totalRounds > 0
                        ? totalRounds
                        : null
                    }
                    isDark={isDark}
                  />

                  <SnapshotRow
                    label="Reading time"
                    value={
                      interview
                        ?.readingTimeMinutes >
                      0
                        ? `${interview.readingTimeMinutes} min`
                        : null
                    }
                    isDark={isDark}
                    icon={BookOpen}
                  />
                </div>
              </section>

              <section className="overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-lg shadow-blue-600/10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <Plus className="h-5 w-5" />
                </div>

                <h2 className="mt-4 text-lg font-black">
                  Share your interview
                  experience
                </h2>

                <p className="mt-2 text-sm leading-6 text-blue-100">
                  Help other engineers
                  prepare with a real
                  interview experience.
                  Anonymous publishing is
                  supported.
                </p>

                <Link
                  to="/interview/create"
                  className="mt-4 flex min-h-[44px] w-full items-center justify-center rounded-xl bg-white px-4 py-2.5 text-center text-sm font-black text-blue-700 transition hover:bg-blue-50"
                >
                  Add interview experience
                </Link>
              </section>

              <section
                className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${
                  isDark
                    ? "border-slate-800 bg-slate-900"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-blue-500" />

                  <h2
                    className={`text-sm font-black ${
                      isDark
                        ? "text-white"
                        : "text-slate-950"
                    }`}
                  >
                    Publication details
                  </h2>
                </div>

                {publishedAt && (
                  <div className="mt-4">
                    <p
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isDark
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      Published
                    </p>

                    <time
                      dateTime={publishedAt}
                      className={`mt-1 block text-sm font-bold ${
                        isDark
                          ? "text-slate-200"
                          : "text-slate-700"
                      }`}
                    >
                      {formatDate(
                        publishedAt
                      )}
                    </time>
                  </div>
                )}

                {updatedAt && (
                  <div
                    className={`mt-4 border-t pt-4 ${
                      isDark
                        ? "border-slate-800"
                        : "border-slate-100"
                    }`}
                  >
                    <p
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isDark
                          ? "text-slate-500"
                          : "text-slate-400"
                      }`}
                    >
                      Last updated
                    </p>

                    <time
                      dateTime={updatedAt}
                      className={`mt-1 block text-sm font-bold ${
                        isDark
                          ? "text-slate-200"
                          : "text-slate-700"
                      }`}
                    >
                      {formatDate(
                        updatedAt
                      )}
                    </time>
                  </div>
                )}

                <div
                  className={`mt-4 border-t pt-4 ${
                    isDark
                      ? "border-slate-800"
                      : "border-slate-100"
                  }`}
                >
                  <p
                    className={`text-[11px] font-bold uppercase tracking-wider ${
                      isDark
                        ? "text-slate-500"
                        : "text-slate-400"
                    }`}
                  >
                    Contributor
                  </p>

                  <p
                    className={`mt-1 break-words text-sm font-bold ${
                      isDark
                        ? "text-slate-200"
                        : "text-slate-700"
                    }`}
                  >
                    {authorName}
                  </p>
                </div>
              </section>

              {(technologies.length >
                0 ||
                topics.length > 0) && (
                <section
                  className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${
                    isDark
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <h2
                    className={`text-sm font-black ${
                      isDark
                        ? "text-white"
                        : "text-slate-950"
                    }`}
                  >
                    Skills & topics
                  </h2>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {technologies
                      .slice(0, 8)
                      .map((item) => (
                        <span
                          key={`side-tech-${item}`}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                            isDark
                              ? "bg-blue-950/50 text-blue-300"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {item}
                        </span>
                      ))}

                    {topics
                      .slice(0, 8)
                      .map((item) => (
                        <span
                          key={`side-topic-${item}`}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                            isDark
                              ? "bg-slate-800 text-slate-300"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item}
                        </span>
                      ))}
                  </div>
                </section>
              )}
            </aside>
          </div>
        </main>
      </div>
    </>
  );
};

export default InterviewDetailPage;