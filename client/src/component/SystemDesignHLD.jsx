// import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
// import { Helmet } from "react-helmet";
// import { ArrowRight, BookOpen, Check, ChevronDown, Clock3, Copy, PartyPopper, Sparkles } from "lucide-react";
// import { pdfjs } from "react-pdf";
// import PayUCheckoutModal from "../payment/PayUCheckoutModal";
// import HLD_PREVIEW_PDF from "../assest/master_hld_preview.pdf";

// pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

// const SITE_URL = "https://www.targettrek.in";
// const SITE_NAME = "Target Trek";
// const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";
// const THEME_STORAGE_KEY = "theme";
// const LLD_REDIRECT_URL = "/book/system-design/lld";
// const PIZZA_PRICE = 199; // reference pizza price (INR); the book price always comes from the DB
// const SEO_TITLE = "Mastering System Design HLD | 67 Chapters + 19 Interview Case Studies";
// const SEO_DESCRIPTION =
//   "A practical High-Level Design ebook: 67 chapters, 250+ diagrams, networking to Kafka to multi-region, a 30-step interview framework and 19 full case studies with APIs, schemas, databases and follow-up questions.";

// /* ---- book palette (same part colours as the PDF) ---- */
// const PC = ["#1E5AA8", "#0F8B8D", "#6A4C93", "#D9691A", "#C2185B", "#2E7D32", "#B71C1C", "#37474F", "#00838F", "#5D4037", "#283593", "#AD1457", "#8D6E00", "#00695C"];
// const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV"];

// const CASES = [
//   ["URL Shortener", "Read-heavy", "KGS · Redis · DynamoDB"], ["WhatsApp / Messaging", "Real-time", "WebSocket · Cassandra · E2E"],
//   ["Uber / Ride-Hailing", "Real-time", "H3 · Redis GEO · CAS"], ["Instagram", "Read-heavy", "Feed fan-out · S3 · CDN"],
//   ["YouTube", "Media", "Transcoding DAG · ABR · CDN"], ["Netflix", "Media", "Open Connect · DRM · Live"],
//   ["Twitter / X", "Read-heavy", "Snowflake · Earlybird · CMS"], ["Dropbox", "Media", "Chunking · Journal · Sync"],
//   ["Google Drive + Docs", "Real-time", "ACLs · OT vs CRDT"], ["BookMyShow", "Contention", "Seat holds · Saga · Waiting room"],
//   ["Food Delivery", "Real-time", "Dispatch · ETA · Batching"], ["Notification System", "Pipelines", "Priority lanes · DLQ · Failover"],
//   ["Distributed Rate Limiter", "Pipelines", "Token bucket · Lua · Leases"], ["News Feed", "Read-heavy", "Ranking · Feature store"],
//   ["Job Scheduler", "Pipelines", "Leases · Fencing · Misfire"], ["Search Autocomplete", "Read-heavy", "Trie top-K · FST · Flink"],
//   ["Web Crawler", "Pipelines", "Frontier · Bloom · SimHash"], ["Payment System", "Contention", "Idempotency · Ledger · Recon"],
//   ["E-commerce Platform", "Contention", "Inventory · Saga · Flash sale"],
// ];
// const FAMILIES = ["All", "Read-heavy", "Contention", "Real-time", "Media", "Pipelines"];

// const PARTS = [
//   ["Foundations", "Introduction to System Design|Requirements Engineering|Back-of-the-Envelope Estimation|Networking Fundamentals"],
//   ["APIs & Architecture", "API Design|Monoliths to Microservices|API Gateway & Service Discovery"],
//   ["Data & Databases", "Database Fundamentals|SQL vs NoSQL|Indexing & Query Optimization|Replication|Partitioning & Sharding|Transactions & Data Correctness"],
//   ["Scaling & Performance", "Scalability|Load Balancing|Caching & Redis|CDN & Edge"],
//   ["Messaging & Events", "Message Queues|Kafka Deep Dive|Event-Driven Architecture"],
//   ["Distributed Systems", "Fundamentals|CAP & Consistency|Coordination (Raft, Paxos)|Consistent Hashing|Distributed IDs"],
//   ["Reliability & Production", "Fault Tolerance|Timeouts, Retries, Circuit Breakers|Availability & SRE|Observability"],
//   ["Security", "AuthN & AuthZ (OAuth, JWT)|Rate Limiting|System Security"],
//   ["Storage & Specialized", "Object & File Storage|Search Systems|Real-Time Systems"],
//   ["Advanced Data Processing", "Data Modeling|CDC & Stream Processing|Backpressure & Load Shedding"],
//   ["Global & Production", "Multi-Region & DR|Deployment & Change Management|Multi-Tenancy|Job Scheduling"],
//   ["Specialized Systems", "Geospatial|Time-Series|Vector Search & RAG|Cost Engineering"],
//   ["Interview Methodology", "Complete HLD Interview Framework (30 steps)"],
//   ["Interview Case Studies", CASES.map((c) => c[0]).join("|") + "|Cheat Sheets & Scorecard"],
// ];

// const AZ = "API gateway|B-tree & Bloom filter|CAP & CDN|Distributed IDs|Event sourcing|Fault tolerance|Geohash & H3|HLS & HNSW|Idempotency|JWT & OAuth|Kafka|Load balancing|MVCC|N+1 queries|Observability|Paxos & Partitioning|Quorum|Raft & Rate limits|Sharding & SLOs|TLS & Token bucket|UUID & ULID|Vector search|WebSockets & WAL|XSS & CSRF|YouTube design|Zero-downtime deploys".split("|");

// const PHASES = [
//   ["Requirements", "Steps 1–3"], ["Numbers", "Steps 4–7"], ["Foundations", "Steps 8–11"],
//   ["Building blocks", "Steps 12–17"], ["Correctness + ops", "Steps 18–23"], ["Review + wrap-up", "Steps 24–30"],
// ];

// const QA = [
//   ["Why not hold a database transaction open until the user pays?", "Payment takes minutes; open transactions hold locks and exhaust the connection pool. The hold is a row state with an expiry, committed in milliseconds, so other users are never blocked."],
//   ["A PSP call times out. What do you do?", "Keep the payment PROCESSING. Query the PSP by our reference with backoff, accept its webhook, reconcile next day. Never mark failed or retry elsewhere before the first outcome is known."],
//   ["Why is a Redis lock not enough for correctness?", "Locks expire and failovers can grant them twice. Use the lock as a fast gate and let a database compare-and-set or unique constraint be the final truth, plus fencing tokens for stale holders."],
//   ["Celebrity posts to 100M followers. Push or pull?", "Hybrid: push to normal users' Redis feeds, skip celebrities and inactive users, and pull celebrity posts at read time and merge. Writes stay at one while reads add a few cache lookups."],
//   ["How do you get exactly-once delivery?", "You cannot across crashes. Use at-least-once delivery plus idempotency keys and dedupe so repeats produce one logical effect."],
// ];

// const FAQS = [
//   ["Is this book only for experienced engineers?", "No. It starts from fundamentals (networking, estimation, APIs, databases) and builds up to distributed systems and full case studies, so SDE-1 to senior engineers can follow it."],
//   ["How are the 19 case studies structured?", "Each has the interview question, clarifying questions, requirements and estimates, interviewer signals, every entity with fields, all APIs, a database choice per service, an HLD diagram, request flows, deep dives, trade-offs and 8–10 follow-up questions with model answers."],
//   ["Does it cover Redis, Kafka, sharding, CAP and consensus?", "Yes: Redis, Kafka, CDC, consistent hashing, Raft/Paxos, quorums, sharding, replication, caching, CDNs, observability, security and multi-region design each have their own chapter."],
//   ["What does the price compare to?", "The page compares the live price with a pizza (about ₹199). It is shown as a fun reference only; the real price always comes from our store."],
//   ["Can I preview the book?", "Yes. The preview PDF is rendered page by page as images directly in the page, with no PDF toolbar or nested scroller."],
//   ["Is this a physical book? Is it refundable?", "It is a digital PDF ebook. Digital purchases are non-refundable after successful payment."],
//   ["How can I contact support?", "Email supporttargettrek@gmail.com for purchase or ebook support."],
// ];

// const READY = ["Estimate QPS, storage and bandwidth", "Explain CAP vs PACELC", "Design idempotent payments", "Choose SQL vs NoSQL per access pattern",
//   "Explain hybrid feed fan-out", "Prevent double booking", "Design a rate limiter", "Explain Kafka partitions and consumer groups"];

// const QUIZ_STORAGE_KEY = "targettrek-hld-discount-quiz-v1";
// const QUIZ_RETRY_MS = 24 * 60 * 60 * 1000;
// const DISCOUNT_CODE = "TARGETTREKHLD10OFF";
// const QUIZ = [
//   { question: "Which approach is the best fit for a read-heavy service that serves frequently requested data?", options: ["Read-through caching", "A longer database transaction", "A single global write lock", "Disabling database indexes"], answer: 0 },
//   { question: "What is the safest way to handle a payment request after a client timeout?", options: ["Immediately charge again with a new ID", "Keep it pending and reconcile using the same idempotency key", "Assume the payment failed", "Delete the payment record"], answer: 1 },
//   { question: "What does a partition key primarily determine in a distributed datastore?", options: ["The encryption algorithm", "Which shard stores a record", "The API response format", "The cache expiration policy"], answer: 1 },
//   { question: "How can a system reduce hot-key pressure from a celebrity's very large follower graph?", options: ["Fan out every post synchronously", "Use a hybrid push/pull feed strategy", "Turn off feed pagination", "Store all feed data in one SQL row"], answer: 1 },
//   { question: "Which combination is a practical way to achieve one logical effect with at-least-once message delivery?", options: ["Idempotency keys and deduplication", "A bigger message broker", "Longer client timeouts", "A single consumer for every topic"], answer: 0 },
// ];

// const CSS = `
// .rv{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.7,.2,1)}
// .rv.in{opacity:1;transform:none}
// @keyframes flt{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
// @keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
// @keyframes sl{from{opacity:0;transform:scale(.4) rotate(-20deg)}to{opacity:1;transform:none}}
// @keyframes trv{0%{left:0;opacity:0}10%{opacity:1}90%{opacity:1}100%{left:calc(100% - 10px);opacity:0}}
// @keyframes grd{0%,100%{background-position:0 50%}50%{background-position:100% 50%}}
// @keyframes stm{0%{opacity:0;transform:translateY(8px)}50%{opacity:.7}100%{opacity:0;transform:translateY(-14px)}}
// @keyframes confetti{0%{opacity:0;transform:translate3d(0,-10vh,0) rotate(0) scale(.5)}10%{opacity:1}100%{opacity:0;transform:translate3d(var(--dx),110vh,0) rotate(620deg) scale(1)}}
// @keyframes resultPop{0%{opacity:0;transform:scale(.65) translateY(16px)}70%{transform:scale(1.04)}100%{opacity:1;transform:scale(1) translateY(0)}}
// @keyframes firework{0%{opacity:0;transform:scale(.15)}30%{opacity:1}100%{opacity:0;transform:scale(1.7)}}
// @keyframes quizFlash{0%{opacity:0}18%{opacity:.65}100%{opacity:0}}
// @keyframes celebrationGlow{0%,100%{opacity:0}35%{opacity:.7}65%{opacity:0}}
// .flt{animation:flt 6s ease-in-out infinite}.mq{animation:mq 38s linear infinite}.mq:hover{animation-play-state:paused}
// .grd{background-size:200% 200%;animation:grd 7s ease infinite}
// .sl{animation:sl .5s both}.trv{animation:trv 3.4s linear infinite}.stm{animation:stm 2.4s ease-in-out infinite}
// .result-pop{animation:resultPop .65s cubic-bezier(.2,.8,.2,1) both}
// .confetti{animation:confetti 1.8s cubic-bezier(.12,.7,.4,1) both}
// .firework{animation:firework .9s ease-out both}
// .quiz-flash{animation:quizFlash .7s ease-out both}
// .celebration-glow{animation:celebrationGlow 1.2s ease-in-out 2}
// @keyframes trvback{0%{right:0;opacity:0}10%{opacity:1}90%{opacity:1}100%{right:calc(100% - 10px);opacity:0}}
// .trvback{animation:trvback 3.4s linear infinite 1.7s}
// @media (prefers-reduced-motion:reduce){.rv{opacity:1;transform:none;transition:none}.flt,.mq,.grd,.sl,.trv,.trvback,.stm,.result-pop,.confetti,.firework,.quiz-flash,.celebration-glow{animation:none}}
// `;

// const cx = (...c) => c.filter(Boolean).join(" ");
// const norm = (v) => { const n = String(v || "").trim().toLowerCase(); return n === "dark" || n === "light" ? n : null; };
// const readQuizAttempt = () => {
//   if (typeof window === "undefined") return null;
//   try {
//     const saved = JSON.parse(window.localStorage.getItem(QUIZ_STORAGE_KEY) || "null");
//     return saved && Number.isFinite(saved.attemptedAt) && typeof saved.passed === "boolean" ? saved : null;
//   } catch (error) {
//     console.error("Could not read the saved discount quiz result:", error);
//     return null;
//   }
// };
// const themeFromStorage = () => (typeof window === "undefined" ? null : norm(window.localStorage.getItem(THEME_STORAGE_KEY)));
// const themeFromDom = () => {
//   if (typeof document === "undefined") return null;
//   const h = document.documentElement, b = document.body;
//   const e = norm(h?.getAttribute("data-theme")) || norm(b?.getAttribute("data-theme"));
//   if (e) return e;
//   if (h?.classList?.contains("dark") || b?.classList?.contains("dark")) return "dark";
//   if (h?.classList?.contains("light") || b?.classList?.contains("light")) return "light";
//   return null;
// };
// const readTheme = () => typeof window === "undefined" ? "light" :
//   themeFromStorage() || themeFromDom() || (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light");

// const getCover = (p) => p?.coverpageurl || p?.coverPageUrl || p?.cover_page_url || "";

// function useInView() {
//   const ref = useRef(null);
//   const [on, setOn] = useState(false);
//   useEffect(() => {
//     const el = ref.current;
//     if (!el || typeof IntersectionObserver === "undefined") { setOn(true); return undefined; }
//     const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.12 });
//     io.observe(el);
//     return () => io.disconnect();
//   }, []);
//   return [ref, on];
// }

// function Reveal({ children, delay = 0, className = "" }) {
//   const [ref, on] = useInView();
//   return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={cx("rv", on && "in", className)}>{children}</div>;
// }

// function Count({ to, suffix = "" }) {
//   const [ref, on] = useInView();
//   const [v, setV] = useState(0);
//   useEffect(() => {
//     if (!on) return undefined;
//     let raf, t0;
//     const step = (t) => { t0 = t0 || t; const k = Math.min(1, (t - t0) / 1200); setV(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(step); };
//     raf = requestAnimationFrame(step);
//     return () => cancelAnimationFrame(raf);
//   }, [on, to]);
//   return <span ref={ref}>{v}{suffix}</span>;
// }

// function Sec({ id, eyebrow, title, desc, dark, color = PC[0], children, alt }) {
//   return (
//     <section id={id} className={cx("scroll-mt-20 py-16 sm:py-20 lg:py-24", alt && (dark ? "border-y border-white/10 bg-white/[0.02]" : "border-y border-slate-200 bg-slate-50/70"))}>
//       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//         <Reveal className="max-w-3xl">
//           <p className="text-xs font-extrabold uppercase tracking-[0.2em]" style={{ color }}>{eyebrow}</p>
//           <h2 className={cx("mt-3 text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl", dark ? "text-white" : "text-[#102A43]")} style={{ fontStretch: "90%" }}>{title}</h2>
//           {desc && <p className={cx("mt-4 text-base leading-7 sm:text-lg", dark ? "text-slate-300" : "text-slate-600")}>{desc}</p>}
//         </Reveal>
//         <div className="mt-10">{children}</div>
//       </div>
//     </section>
//   );
// }

// function SystemDesignHLD() {
//   const [theme, setTheme] = useState(readTheme);
//   const dark = theme === "dark";
//   const [product, setProduct] = useState(null);
//   const [loadingProduct, setLoadingProduct] = useState(true);
//   const [productError, setProductError] = useState("");
//   const [lldProduct, setLldProduct] = useState(null);
//   const [loadingLldProduct, setLoadingLldProduct] = useState(true);
//   const [checkoutProduct, setCheckoutProduct] = useState(null);
//   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
//   const [openFaq, setOpenFaq] = useState(null);
//   const [previewImages, setPreviewImages] = useState([]);
//   const [previewTotalPages, setPreviewTotalPages] = useState(0);
//   const [previewLoading, setPreviewLoading] = useState(true);
//   const [previewError, setPreviewError] = useState("");
//   const [part, setPart] = useState(0);
//   const [family, setFamily] = useState("All");
//   const [shown, setShown] = useState({});
//   const [ready, setReady] = useState({});
//   const [progress, setProgress] = useState(0);
//   const [tilt, setTilt] = useState({ x: 0, y: 0 });
//   const [quizAnswers, setQuizAnswers] = useState({});
//   const [quizAttempt, setQuizAttempt] = useState(readQuizAttempt);
//   const quizSubmitPosition = useRef(null);
//   const quizResultRef = useRef(null);
//   const [quizNow, setQuizNow] = useState(Date.now());
//   const [quizJustSubmitted, setQuizJustSubmitted] = useState(false);
//   const [quizStorageError, setQuizStorageError] = useState("");
//   const [copyStatus, setCopyStatus] = useState("");

//   useEffect(() => {
//     if (!quizAttempt || quizAttempt.passed || quizAttempt.attemptedAt + QUIZ_RETRY_MS <= Date.now()) return undefined;
//     const timer = window.setInterval(() => {
//       const now = Date.now();
//       setQuizNow(now);
//       if (quizAttempt.attemptedAt + QUIZ_RETRY_MS <= now) window.clearInterval(timer);
//     }, 1000);
//     return () => window.clearInterval(timer);
//   }, [quizAttempt]);

//   useLayoutEffect(() => {
//     if (!quizJustSubmitted || quizSubmitPosition.current === null || !quizResultRef.current) return;
//     const resultTop = quizResultRef.current.getBoundingClientRect().top;
//     const scrollDelta = resultTop - quizSubmitPosition.current;
//     if (Math.abs(scrollDelta) > 2) window.scrollBy({ top: scrollDelta, behavior: "auto" });
//     quizSubmitPosition.current = null;
//   }, [quizAttempt, quizJustSubmitted]);

//   /* theme sync (unchanged behaviour) */
//   useEffect(() => {
//     if (typeof window === "undefined" || typeof document === "undefined") return undefined;
//     let lastS = themeFromStorage(), lastD = themeFromDom();
//     const commit = (n) => n && setTheme((c) => (c === n ? c : n));
//     const sync = () => {
//       const s = themeFromStorage(), d = themeFromDom();
//       if (s && s !== lastS) { lastS = s; lastD = d; commit(s); return; }
//       if (d && d !== lastD) { lastD = d; lastS = s; commit(d); return; }
//       lastS = s; lastD = d;
//       commit(s || d || (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light"));
//     };
//     const onStorage = (e) => { if (!e.key || e.key === THEME_STORAGE_KEY) sync(); };
//     const onVis = () => { if (document.visibilityState === "visible") sync(); };
//     const media = window.matchMedia?.("(prefers-color-scheme: dark)");
//     const obs = new MutationObserver(sync);
//     obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
//     if (document.body) obs.observe(document.body, { attributes: true, attributeFilter: ["class", "data-theme"] });
//     sync();
//     const id = window.setInterval(sync, 120);
//     window.addEventListener("storage", onStorage); window.addEventListener("themechange", sync); window.addEventListener("focus", sync);
//     document.addEventListener("visibilitychange", onVis); media?.addEventListener?.("change", sync);
//     return () => {
//       obs.disconnect(); window.clearInterval(id);
//       window.removeEventListener("storage", onStorage); window.removeEventListener("themechange", sync); window.removeEventListener("focus", sync);
//       document.removeEventListener("visibilitychange", onVis); media?.removeEventListener?.("change", sync);
//     };
//   }, []);

//   useEffect(() => {
//     const p = new URLSearchParams(window.location.search);
//     const code = (p.get("referralCode") || p.get("ref") || "").trim();
//     if (code) localStorage.setItem("referralCode", code);
//   }, []);

//   useEffect(() => {
//     let raf = 0;
//     const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const h = document.documentElement; setProgress(Math.min(100, (window.scrollY / Math.max(1, h.scrollHeight - h.clientHeight)) * 100)); }); };
//     window.addEventListener("scroll", on, { passive: true });
//     return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
//   }, []);

//   const fetchBook = async (redirectUrl, signal) => {
//     const res = await fetch(`${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(redirectUrl)}`, { method: "GET", cache: "no-store", headers: { Accept: "application/json" }, signal });
//     const json = await res.json().catch(() => null);
//     if (!res.ok || !json?.success || !json?.data) throw new Error(json?.error?.message || "Book not found.");
//     return json.data;
//   };

//   useEffect(() => {
//     const ctrl = new AbortController();
//     (async () => {
//       try { setLoadingProduct(true); setProductError(""); setProduct(await fetchBook(window.location.pathname, ctrl.signal)); }
//       catch (e) { if (e?.name === "AbortError") return; console.error("Failed to fetch HLD product:", e); setProduct(null); setProductError(e?.message || "Book not found."); }
//       finally { if (!ctrl.signal.aborted) setLoadingProduct(false); }
//     })();
//     return () => ctrl.abort();
//   }, []);

//   useEffect(() => {
//     const ctrl = new AbortController();
//     (async () => {
//       try { setLoadingLldProduct(true); setLldProduct(await fetchBook(LLD_REDIRECT_URL, ctrl.signal)); }
//       catch (e) { if (e?.name === "AbortError") return; console.error("Failed to fetch LLD product:", e); setLldProduct(null); }
//       finally { if (!ctrl.signal.aborted) setLoadingLldProduct(false); }
//     })();
//     return () => ctrl.abort();
//   }, []);

//   /* PDF preview -> images (unchanged behaviour) */
//   useEffect(() => {
//     let cancelled = false, task = null;
//     const urls = [];
//     const toBlob = (c) => new Promise((r) => c.toBlob((b) => r(b), "image/jpeg", 0.94));
//     (async () => {
//       try {
//         setPreviewLoading(true); setPreviewError(""); setPreviewImages([]);
//         task = pdfjs.getDocument(HLD_PREVIEW_PDF);
//         const pdf = await task.promise;
//         if (cancelled) return;
//         setPreviewTotalPages(pdf.numPages);
//         for (let n = 1; n <= pdf.numPages; n += 1) {
//           if (cancelled) return;
//           const page = await pdf.getPage(n);
//           const base = page.getViewport({ scale: 1 });
//           const target = Math.min(1500, Math.max(1050, window.innerWidth * 1.35));
//           const viewport = page.getViewport({ scale: Math.max(1.25, target / base.width) });
//           const canvas = document.createElement("canvas");
//           const ctx = canvas.getContext("2d", { alpha: false });
//           canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
//           if (!ctx) throw new Error("Canvas is not supported in this browser.");
//           ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
//           await page.render({ canvasContext: ctx, viewport, background: "white" }).promise;
//           const blob = await toBlob(canvas);
//           if (!blob) throw new Error(`Could not render preview page ${n}.`);
//           const src = URL.createObjectURL(blob); urls.push(src);
//           if (!cancelled) setPreviewImages((cur) => [...cur, { pageNumber: n, src, width: canvas.width, height: canvas.height }]);
//           page.cleanup?.(); canvas.width = 1; canvas.height = 1;
//         }
//       } catch (e) { if (!cancelled) { console.error("HLD preview image rendering failed:", e); setPreviewError(e?.message || "Unable to render the preview pages as images."); } }
//       finally { if (!cancelled) setPreviewLoading(false); }
//     })();
//     return () => { cancelled = true; try { task?.destroy?.(); } catch { /* no-op */ } urls.forEach((u) => URL.revokeObjectURL(u)); };
//   }, []);

//   /* pricing */
//   const price = Number(product?.price ?? 0), mrp = Number(product?.mrp ?? 0), currency = product?.currency || "INR";
//   const discount = mrp > price && price >= 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
//   const cover = getCover(product);
//   const name = product?.title || "Mastering System Design — High-Level Design";
//   const lldPrice = Number(lldProduct?.price ?? 0), lldMrp = Number(lldProduct?.mrp ?? 0), lldCur = lldProduct?.currency || "INR";
//   const lldDiscount = lldMrp > lldPrice && lldPrice >= 0 ? Math.round(((lldMrp - lldPrice) / lldMrp) * 100) : 0;
//   const lldTitle = lldProduct?.title || "Mastering System Design — LLD (Java)";
//   const lldSub = lldProduct?.subtitle || "Java-first Low-Level Design interview handbook";
//   const lldCover = getCover(lldProduct);

//   const fmt = (amount, cur = currency) => {
//     const v = Number(amount || 0);
//     const loc = { INR: "en-IN", USD: "en-US", GBP: "en-GB", EUR: "en-IE", AUD: "en-AU", CAD: "en-CA" };
//     try { return new Intl.NumberFormat(loc[cur] || "en", { style: "currency", currency: cur, minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 }).format(v); }
//     catch { return `${cur} ${v}`; }
//   };

//   const ratio = currency === "INR" && price > 0 ? price / PIZZA_PRICE : null;
//   const pizzaText = ratio == null ? "about the price of a pizza" : ratio <= 0.6 ? "less than one pizza" : ratio <= 1.25 ? "about one pizza" : `about ${ratio.toFixed(1)} pizzas`;
//   const unit = [["Per chapter", price / 67, "67 chapters"], ["Per case study", price / 19, "19 interview designs"], ["Per day of a 30-day prep", price / 30, "30-day study plan"]];

//   const buy = () => { if (product?._id) { setCheckoutProduct(product); setIsCheckoutOpen(true); } };
//   const buyLld = () => { if (lldProduct?._id) { setCheckoutProduct(lldProduct); setIsCheckoutOpen(true); } };
//   const quizLocked = Boolean(quizAttempt && !quizAttempt.passed && quizAttempt.attemptedAt + QUIZ_RETRY_MS > quizNow);
//   const quizRemainingMs = quizLocked ? quizAttempt.attemptedAt + QUIZ_RETRY_MS - quizNow : 0;
//   const quizScore = quizAttempt?.score ?? 0;
//   const quizCanSubmit = QUIZ.every((_, i) => Number.isInteger(quizAnswers[i]));
//   const showQuizQuestions = !quizAttempt?.passed && !quizLocked;
//   const submitQuiz = (event) => {
//     event?.preventDefault();
//     event?.stopPropagation();
//     if (!quizCanSubmit || quizLocked || quizAttempt?.passed) return;
//     quizSubmitPosition.current = document.activeElement?.getBoundingClientRect?.().top ?? window.innerHeight / 2;
//     const score = QUIZ.reduce((total, question, i) => total + (quizAnswers[i] === question.answer ? 1 : 0), 0);
//     const result = { attemptedAt: Date.now(), passed: score >= 4, score };
//     setQuizAttempt(result);
//     setQuizJustSubmitted(true);
//     setQuizNow(Date.now());
//     setQuizAnswers({});
//     try {
//       window.localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(result));
//       setQuizStorageError("");
//     } catch (error) {
//       console.error("Could not save the discount quiz result:", error);
//       setQuizStorageError("We couldn't save this result on your device. Keep this page open to retain your result.");
//     }
//   };
//   const copyDiscountCode = async () => {
//     try {
//       await navigator.clipboard.writeText(DISCOUNT_CODE);
//       setCopyStatus("Copied!");
//       window.setTimeout(() => setCopyStatus(""), 2200);
//     } catch (error) {
//       console.error("Could not copy the discount code:", error);
//       setCopyStatus("Copy failed — select the code to copy it.");
//     }
//   };
//   const remainingTime = `${String(Math.floor(quizRemainingMs / 3600000)).padStart(2, "0")}:${String(Math.floor((quizRemainingMs % 3600000) / 60000)).padStart(2, "0")}:${String(Math.floor((quizRemainingMs % 60000) / 1000)).padStart(2, "0")}`;

//   const pathname = typeof window !== "undefined" ? window.location.pathname : "/book/system-design/hld";
//   const canonical = `${SITE_URL}${pathname}`;
//   const ld = useMemo(() => ({
//     "@context": "https://schema.org",
//     "@graph": [
//       { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, email: "supporttargettrek@gmail.com" },
//       { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, publisher: { "@id": `${SITE_URL}/#organization` } },
//       { "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: SEO_TITLE, description: SEO_DESCRIPTION, isPartOf: { "@id": `${SITE_URL}/#website` } },
//       {
//         "@type": "Product", "@id": `${canonical}#product`, name, description: SEO_DESCRIPTION, url: canonical,
//         category: "System Design High-Level Design Ebook", brand: { "@type": "Brand", name: SITE_NAME },
//         ...(product?._id ? { sku: String(product._id) } : {}), ...(cover ? { image: [cover] } : {}),
//         ...(price > 0 ? { offers: { "@type": "Offer", url: canonical, price, priceCurrency: currency, availability: "https://schema.org/OnlineOnly", itemCondition: "https://schema.org/NewCondition", seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL } } } : {}),
//       },
//       { "@type": "FAQPage", "@id": `${canonical}#faq`, mainEntity: FAQS.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
//     ],
//   }), [cover, canonical, currency, price, product?._id, name]);

//   const ink = dark ? "text-white" : "text-[#102A43]";
//   const sub = dark ? "text-slate-400" : "text-slate-600";
//   const card = dark ? "border-white/10 bg-white/[0.04]" : "border-slate-200 bg-white";
//   const shell = dark ? "bg-[#0A1020] text-slate-100" : "bg-white text-[#1F2933]";
//   const FONT = { fontFamily: "'Noto Sans','DejaVu Sans',system-ui,-apple-system,'Segoe UI',sans-serif" };

//   const head = (
//     <Helmet htmlAttributes={{ lang: "en" }}>
//       <title>{SEO_TITLE}</title>
//       <meta name="description" content={SEO_DESCRIPTION} />
//       <meta name="author" content={SITE_NAME} />
//       <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
//       <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
//       <meta name="theme-color" content={dark ? "#0A1020" : "#ffffff"} />
//       <meta name="color-scheme" content={dark ? "dark" : "light"} />
//       <link rel="canonical" href={canonical} />
//       <link rel="preconnect" href="https://fonts.googleapis.com" />
//       <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
//       <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wdth,wght@75..100,400..800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet" />
//       <meta property="og:type" content="website" /><meta property="og:site_name" content={SITE_NAME} /><meta property="og:locale" content="en_IN" />
//       <meta property="og:title" content={SEO_TITLE} /><meta property="og:description" content={SEO_DESCRIPTION} /><meta property="og:url" content={canonical} />
//       {cover && <meta property="og:image" content={cover} />}
//       {cover && <meta property="og:image:alt" content={`${name} ebook cover`} />}
//       <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content={SEO_TITLE} /><meta name="twitter:description" content={SEO_DESCRIPTION} />
//       {cover && <meta name="twitter:image" content={cover} />}
//       <script type="application/ld+json">{JSON.stringify(ld)}</script>
//     </Helmet>
//   );

//   if (loadingProduct) {
//     return (
//       <div className={cx("flex min-h-screen items-center justify-center px-4", shell)} style={FONT}>
//         {head}
//         <div className={cx("w-full max-w-md rounded-[28px] border p-8 text-center shadow-xl", card)}>
//           <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
//           <h1 className="mt-6 text-xl font-extrabold">Loading the HLD handbook…</h1>
//           <p className={cx("mt-2 text-sm", sub)}>Fetching the latest product details and price.</p>
//         </div>
//       </div>
//     );
//   }

//   if (!product || productError) {
//     return (
//       <div className={cx("flex min-h-screen items-center justify-center px-4", shell)} style={FONT}>
//         <Helmet><title>Book Not Found | Target Trek</title><meta name="robots" content="noindex, nofollow" /></Helmet>
//         <div className={cx("w-full max-w-lg rounded-[28px] border p-8 text-center shadow-xl", card)}>
//           <BookOpen className="mx-auto h-12 w-12 text-blue-500" />
//           <h1 className="mt-5 text-2xl font-extrabold">Book details are unavailable</h1>
//           <p className={cx("mt-3 text-sm", sub)}>{productError || "Please refresh the page and try again."}</p>
//         </div>
//       </div>
//     );
//   }

//   const [pname, pchaps] = PARTS[part];
//   const startNo = PARTS.slice(0, part).reduce((s, p) => s + p[1].split("|").length, 0);
//   const pcol = PC[part];
//   const readyPct = Math.round((Object.values(ready).filter(Boolean).length / READY.length) * 100);
//   const caseList = CASES.map((c, i) => ({ c, i })).filter(({ c }) => family === "All" || c[1] === family);
//   const BuyBtn = ({ className = "", label = "Get the ebook" }) => (
//     <button type="button" onClick={buy} disabled={!product?._id}
//       className={cx("group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1E5AA8] via-[#283593] to-[#6A4C93] px-6 py-4 font-extrabold text-white shadow-xl shadow-indigo-500/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60", className)}>
//       {label} {fmt(price)} <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
//     </button>
//   );

//   return (
//     <div className={cx("min-h-screen overflow-x-hidden pb-28 md:pb-0", shell)} style={FONT}>
//       {head}
//       <style>{CSS}</style>
//       <div className="fixed inset-x-0 top-0 z-[90] h-1"><div className="h-full bg-gradient-to-r from-[#1E5AA8] via-[#C2185B] to-[#D9691A]" style={{ width: `${progress}%` }} /></div>

//       <nav aria-label="Breadcrumb" className={cx("border-b px-4 py-3 text-sm", dark ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-500")}>
//         <ol className="mx-auto flex max-w-7xl items-center gap-2">
//           <li><a className="font-semibold hover:text-blue-500" href="/">Home</a></li><li aria-hidden="true">/</li>
//           <li><a className="font-semibold hover:text-blue-500" href="/books">Books</a></li><li aria-hidden="true">/</li>
//           <li className={cx("font-bold", dark ? "text-slate-200" : "text-slate-800")}>System Design HLD</li>
//         </ol>
//       </nav>

//       <main>
//         {/* HERO */}
//         <section className="relative overflow-hidden" style={{ backgroundImage: `radial-gradient(circle, ${dark ? "rgba(129,140,248,.14)" : "rgba(30,90,168,.09)"} 1.2px, transparent 1.2px)`, backgroundSize: "36px 36px" }}>
//           <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#1E5AA8]/15 blur-3xl" />
//           <div className="pointer-events-none absolute -right-20 top-40 h-80 w-80 rounded-full bg-[#C2185B]/10 blur-3xl" />
//           <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-8">
//             <div>
//               <span className={cx("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] sm:text-xs", dark ? "border-blue-400/25 bg-white/5 text-blue-300" : "border-blue-200 bg-white text-[#1E5AA8]")}>
//                 <Sparkles className="h-4 w-4" /> System Design · High-Level Design
//               </span>
//               <h1 className={cx("mt-7 text-[2.7rem] font-extrabold leading-[1] tracking-tight sm:text-6xl lg:text-7xl", ink)} style={{ fontStretch: "88%" }}>
//                 Everything you need for your <span className="grd bg-gradient-to-r from-[#1E5AA8] via-[#C2185B] to-[#D9691A] bg-clip-text text-transparent">next system design interview.</span>
//               </h1>
//               <p className={cx("mt-6 max-w-2xl text-base leading-8 sm:text-lg", sub)}>
//                 From TCP and DNS to Kafka, Raft and multi-region failover: 67 chapters, 250+ diagrams, a 30-step interview framework and 19 complete case studies with entities, APIs, databases and follow-up answers.
//               </p>
//               <div className="mt-8 flex flex-col gap-3 sm:flex-row">
//                 <BuyBtn />
//                 <a href="#book-preview" className={cx("inline-flex items-center justify-center gap-2 rounded-2xl border px-6 py-4 font-extrabold transition hover:-translate-y-0.5", dark ? "border-white/15 bg-white/5" : "border-slate-300 bg-white")}>
//                   <BookOpen className="h-5 w-5" /> Preview the book
//                 </a>
//               </div>
//               <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold">
//                 <span className="text-[#C2185B]">{pizzaText} · {fmt(price)}</span>
//                 {discount > 0 && <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-extrabold text-emerald-500">{discount}% OFF</span>}
//                 {mrp > price && <span className={cx("line-through", sub)}>{fmt(mrp)}</span>}
//               </p>
//             </div>

//             <div className="mx-auto w-full max-w-[440px]" onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 12, y: ((e.clientY - r.top) / r.height - 0.5) * -12 }); }} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
//               <div className="flt relative mx-auto w-[74%]" style={{ perspective: 900 }}>
//                 <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-br from-[#1E5AA8]/25 via-[#C2185B]/10 to-[#D9691A]/20 blur-3xl" />
//                 <div className="relative overflow-hidden rounded-[18px] border border-white/30 bg-[#102A43] shadow-[0_35px_80px_rgba(16,42,67,.35)] transition-transform duration-200" style={{ transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }}>
//                   {cover ? <img src={cover} alt={`${name} ebook cover`} className="block h-auto w-full" loading="eager" fetchPriority="high" /> : (
//                     <div className="aspect-[0.72] bg-gradient-to-br from-[#1E5AA8] to-[#102A43] p-8 text-white">
//                       <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-200">Mastering</p>
//                       <h2 className="mt-10 text-4xl font-extrabold leading-none">System Design</h2><p className="mt-4 font-bold text-orange-300">High-Level Design</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <div className="mt-6 grid grid-cols-3 gap-2 text-center">
//                 {[["67", "chapters"], ["250", "diagrams", "+"], ["19", "case studies"]].map(([n, l, s]) => (
//                   <div key={l} className={cx("rounded-2xl border px-2 py-3", card)}><div className="text-2xl font-extrabold text-[#1E5AA8]"><Count to={Number(n)} suffix={s || ""} /></div><div className={cx("text-[11px] font-bold uppercase tracking-wider", sub)}>{l}</div></div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* topic marquee */}
//         <div className={cx("overflow-hidden border-y py-4", dark ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50")}>
//           <div className="mq flex w-max gap-3">
//             {[...AZ, ...AZ].map((t, i) => <span key={i} className="rounded-full px-4 py-1.5 text-xs font-bold text-white" style={{ background: PC[i % PC.length] }}>{t}</span>)}
//           </div>
//         </div>

//         {/* LLD */}
//         <Sec id="lld-book" eyebrow="Build the other half of your interview skills" title="Pair HLD thinking with confident object design" desc="Move from large-scale architecture to the classes, interfaces and patterns that make each component maintainable. The Java-first LLD handbook is a natural next step." dark={dark} color={PC[3]} alt>
//           <div className={cx("mx-auto grid max-w-4xl overflow-hidden rounded-[28px] border shadow-xl sm:grid-cols-[250px_1fr]", card)}>
//             <div className={cx("flex items-center justify-center p-7", dark ? "bg-[#112442]" : "bg-gradient-to-br from-[#eaf3fa] to-[#f7eafb]")}>
//               {loadingLldProduct ? <div className="h-64 w-44 animate-pulse rounded-2xl bg-slate-300/40" /> : lldCover ? (
//                 <img src={lldCover} alt={`${lldTitle} ebook cover`} loading="lazy" decoding="async" className="max-h-72 w-auto rounded-xl shadow-2xl transition duration-500 hover:-rotate-2 hover:scale-[1.03]" />
//               ) : (
//                 <div className="flex aspect-[0.72] w-44 flex-col justify-between rounded-xl bg-gradient-to-br from-[#1E5AA8] via-[#283593] to-[#6A4C93] p-5 text-white shadow-2xl">
//                   <span className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-blue-100">Target Trek · Java</span>
//                   <div><span className="text-xs font-bold text-orange-300">MASTERING</span><div className="mt-2 text-3xl font-extrabold leading-none">Low-Level Design</div><div className="mt-3 text-xs font-semibold text-blue-100">Patterns · Principles · Practice</div></div>
//                 </div>
//               )}
//             </div>
//             <div className="p-6 sm:p-9">
//               <div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#1E5AA8]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#1E5AA8]">LLD handbook</span><span className="rounded-full bg-[#2E7D32]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#2E7D32]">Java-first</span>{lldDiscount > 0 && <span className="rounded-full bg-[#D9691A]/10 px-3 py-1 text-[10px] font-extrabold text-[#D9691A]">{lldDiscount}% OFF</span>}</div>
//               <h2 className="mt-4 text-2xl font-extrabold leading-tight sm:text-3xl">{lldTitle}</h2>
//               <p className="mt-2 text-sm font-bold text-[#1E5AA8]">{lldSub}</p>
//               <p className={cx("mt-4 text-sm leading-7", sub)}>Practice translating requirements into clean object models, apply SOLID principles with intent, choose patterns for the right reasons, and walk through complete interview-style design problems.</p>
//               <div className="mt-5 grid gap-2 sm:grid-cols-2">
//                 {["Object modelling & relationships", "SOLID principles in practice", "Design patterns & trade-offs", "End-to-end LLD interview problems"].map((item) => <div key={item} className="flex items-center gap-2 text-xs font-semibold"><Check className="h-4 w-4 shrink-0 text-[#2E7D32]" strokeWidth={3} />{item}</div>)}
//               </div>
//               <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-slate-200/70 pt-5">
//                 <div><p className={cx("text-[10px] font-extrabold uppercase tracking-[0.18em]", sub)}>Digital handbook</p><div className="mt-1 flex items-end gap-2"><span className="text-2xl font-extrabold">{loadingLldProduct ? "Loading…" : fmt(lldPrice, lldCur)}</span>{lldMrp > lldPrice && <span className={cx("pb-0.5 text-xs font-bold line-through", sub)}>{fmt(lldMrp, lldCur)}</span>}</div></div>
//                 <div className="flex w-full gap-2 sm:w-auto">
//                   <button type="button" onClick={buyLld} disabled={!lldProduct?._id} className="group inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#1E5AA8] px-5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none">Get the LLD book <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></button>
//                   <a href={LLD_REDIRECT_URL} className={cx("inline-flex min-h-[46px] items-center justify-center rounded-xl border px-4 text-sm font-extrabold text-[#1E5AA8] transition hover:-translate-y-0.5", card)} aria-label="See Low-Level Design book details">Details</a>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </Sec>

//         {/* PIZZA */}
//         <Sec id="pizza" eyebrow="A simple value check" title={<>A whole system design library for {pizzaText}.</>} desc="Use the pizza as a familiar price reference. The ebook price is fetched live from the store; the comparison is just here to make the value easier to picture." dark={false} color="#C2185B" alt>
//           <div className="rounded-3xl border border-rose-100 bg-white p-5 shadow-[0_16px_45px_rgba(30,41,59,.07)] sm:p-8">
//             <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
//               <div className="rounded-2xl bg-blue-50 p-5 sm:p-6">
//                 <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">HLD ebook · live store price</p>
//                 <div className="mt-2 flex items-end gap-2"><span className="text-4xl font-black tracking-tight text-[#173F7A]">{fmt(price)}</span>{mrp > price && <span className="pb-1 text-sm font-bold text-slate-500 line-through">{fmt(mrp)}</span>}</div>
//                 <div className="mt-4 flex flex-wrap gap-2">
//                   {[["67", "chapters"], ["250+", "diagrams"], ["19", "case studies"]].map(([value, label]) => <span key={label} className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-bold text-slate-700"><strong className="text-[#173F7A]">{value}</strong> {label}</span>)}
//                 </div>
//               </div>

//               <div className="flex items-center justify-center gap-3 md:flex-col">
//                 <span className="h-px w-8 bg-rose-200 md:h-8 md:w-px" />
//                 <span className="rounded-full bg-rose-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-rose-600">vs</span>
//                 <span className="h-px w-8 bg-rose-200 md:h-8 md:w-px" />
//               </div>

//               <div className="rounded-2xl bg-amber-50 p-5 sm:p-6">
//                 <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-amber-800">One pizza · example reference</p>
//                 <div className="mt-2 flex items-center gap-3"><span className="text-5xl" role="img" aria-label="Pizza">🍕</span><span className="text-4xl font-black tracking-tight text-amber-900">{fmt(PIZZA_PRICE, "INR")}</span></div>
//                 <p className="mt-3 text-xs leading-5 text-amber-900/75">An illustrative estimate only; actual pizza prices vary by location.</p>
//               </div>
//             </div>

//             <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
//               {unit.map(([label, amount, detail]) => (
//                 <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
//                   <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
//                   <p className="mt-1 text-xl font-extrabold text-[#C2185B]">{fmt(amount)}</p>
//                   <p className="mt-1 text-xs text-slate-500">{detail} in the handbook</p>
//                 </div>
//               ))}
//             </div>
//             <div className="mt-5 flex flex-col items-start justify-between gap-4 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:p-5">
//               <p className="max-w-xl text-sm leading-6 text-slate-600">A single purchase gives you a practical reference to revisit while preparing for system design interviews.</p>
//               <BuyBtn className="w-full sm:w-auto" label="Get the HLD handbook" />
//             </div>
//           </div>
//         </Sec>

//         {/* DISCOUNT QUIZ */}
//         <Sec id="discount-quiz" eyebrow="Five quick system design questions" title="Know your concepts? Earn 10% off." desc="Get at least four answers right to unlock a 10% discount code. One attempt is available every 24 hours." dark={dark} color="#D9691A">
//           <div className={cx("relative mx-auto max-w-4xl overflow-hidden rounded-[30px] border p-5 shadow-xl sm:p-8 lg:p-10", card)}>
//             {quizAttempt?.passed && quizJustSubmitted && (
//               <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
//                 <span className="celebration-glow absolute inset-0 bg-gradient-to-b from-amber-200/40 via-rose-100/20 to-transparent" />
//                 {Array.from({ length: 72 }, (_, i) => (
//                   <span key={`confetti-${i}`} className="confetti absolute top-0 h-3 w-2 rounded-sm" style={{ left: `${(i * 37) % 100}%`, background: ["#F4B942", "#C2185B", "#1E5AA8", "#2E7D32", "#8B5CF6"][i % 5], "--dx": `${((i * 47) % 240) - 120}px`, animationDelay: `${(i % 18) * 65}ms` }} />
//                 ))}
//                 {Array.from({ length: 9 }, (_, i) => (
//                   <span key={`party-${i}`} className="confetti absolute top-0 text-3xl sm:text-5xl" style={{ left: `${5 + ((i * 29) % 90)}%`, "--dx": `${(i % 2 ? 1 : -1) * (20 + (i * 13) % 60)}px`, animationDelay: `${i * 110}ms` }}>🎉</span>
//                 ))}
//                 {Array.from({ length: 3 }, (_, i) => (
//                   <span key={`firework-${i}`} className="firework absolute top-1/3 h-10 w-10 rounded-full" style={{ left: `${22 + i * 28}%`, background: "radial-gradient(circle, #fff 0 4%, #ffd166 7% 12%, transparent 14% 100%)", boxShadow: "0 0 14px 5px rgba(255,209,102,.8)", animationDelay: `${i * 180}ms` }} />
//                 ))}
//               </div>
//             )}
//             <div className="flex flex-wrap items-start justify-between gap-4">
//               <div>
//                 <div className="inline-flex items-center gap-2 rounded-full bg-[#D9691A]/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#D9691A]"><Sparkles className="h-4 w-4" /> 10% off your HLD ebook</div>
//                 <h3 className="mt-4 text-2xl font-extrabold sm:text-3xl">The System Design quick check</h3>
//                 <p className={cx("mt-2 max-w-2xl text-sm leading-6", sub)}>Choose one answer for each question. Score 4 out of 5 and your coupon is yours.</p>
//               </div>
//               <div className={cx("rounded-2xl border px-4 py-3 text-center", card)}>
//                 <div className="text-2xl font-black text-[#D9691A]">{quizAttempt?.passed ? "5/5" : `${Object.keys(quizAnswers).length}/5`}</div>
//                 <div className={cx("text-[10px] font-extrabold uppercase tracking-wider", sub)}>Questions</div>
//               </div>
//             </div>

//             {quizAttempt && !quizAttempt.passed && !quizLocked && <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 text-sm font-bold text-emerald-600" role="status">Your next attempt is ready. Take a breath and give it another go!</div>}
//             {showQuizQuestions && <div className="mt-6 space-y-4">
//                   {QUIZ.map((item, questionIndex) => (
//                     <fieldset key={item.question} className={cx("rounded-2xl border p-4 sm:p-5", card)} disabled={quizLocked || quizAttempt?.passed}>
//                       <legend className="max-w-full px-1 text-sm font-extrabold leading-6 sm:text-base"><span className="mr-2 text-[#D9691A]">0{questionIndex + 1}</span>{item.question}</legend>
//                       <div className="mt-3 grid gap-2 sm:grid-cols-2">
//                         {item.options.map((option, optionIndex) => {
//                           const selected = quizAnswers[questionIndex] === optionIndex;
//                           return (
//                             <button key={option} type="button" onClick={() => setQuizAnswers((answers) => ({ ...answers, [questionIndex]: optionIndex }))} aria-pressed={selected} className={cx("flex min-h-[48px] items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition", selected ? "border-[#1E5AA8] bg-[#1E5AA8]/10 text-[#1E5AA8]" : dark ? "border-white/10 bg-white/[0.02] hover:border-white/25" : "border-slate-200 bg-slate-50 hover:border-slate-300")}>
//                               <span className={cx("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-black", selected ? "border-[#1E5AA8] bg-[#1E5AA8] text-white" : dark ? "border-white/30" : "border-slate-300")}>{String.fromCharCode(65 + optionIndex)}</span>
//                               {option}
//                             </button>
//                           );
//                         })}
//                       </div>
//                     </fieldset>
//                   ))}
//             </div>}
//             {showQuizQuestions && <div className="mt-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
//               <p className={cx("text-xs leading-5", sub)}>{quizLocked ? `You can try again in ${remainingTime}.` : quizAttempt?.passed ? "Quiz completed. Your discount code is ready." : "Your answers are only scored when you submit. A failed submission starts a 24-hour retry cooldown."}</p>
//               <button
//                 type="button"
//                 onClick={submitQuiz}
//                 disabled={!quizCanSubmit}
//                 className={cx("inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D9691A] to-[#C2185B] px-6 text-sm font-extrabold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto")}
//               >
//                 Check my answers
//                 <ArrowRight className="h-4 w-4" />
//               </button>
//             </div>}

//             {quizAttempt?.passed ? (
//               <div ref={quizResultRef} className={cx(quizJustSubmitted && "result-pop", "relative z-10 mt-7 rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.08] p-6 text-center sm:p-8")} role="status" aria-live="polite">
//                 <PartyPopper className="mx-auto h-10 w-10 text-emerald-500" />
//                 <div className="mt-3 text-5xl" aria-hidden="true">🎉</div>
//                 <h4 className="mt-2 text-2xl font-black text-emerald-600">Brilliant! You passed {quizScore}/5.</h4>
//                 <p className={cx("mx-auto mt-2 max-w-lg text-sm leading-6", sub)}>Here is your 10% off code. Copy it and use it at checkout for the HLD ebook.</p>
//                 <div className="mx-auto mt-5 flex max-w-md flex-col items-center justify-center gap-3 rounded-2xl border border-emerald-500/20 bg-white/70 p-3 dark:bg-black/20 sm:flex-row">
//                   <code className="select-all break-all px-2 py-2 font-mono text-sm font-extrabold tracking-wide text-[#102A43] dark:text-white">{DISCOUNT_CODE}</code>
//                   <button type="button" onClick={copyDiscountCode} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-extrabold text-white transition hover:bg-emerald-700 sm:w-auto" aria-label="Copy discount code">
//                     {copyStatus === "Copied!" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copyStatus === "Copied!" ? "Copied!" : "Copy code"}
//                   </button>
//                 </div>
//                 {copyStatus && copyStatus !== "Copied!" && <p className="mt-2 text-xs font-semibold text-amber-600" role="status">{copyStatus}</p>}
//               </div>
//             ) : quizLocked ? (
//               <div ref={quizResultRef} className={cx(quizJustSubmitted && "result-pop", "mt-7 rounded-3xl border border-amber-500/30 bg-amber-500/[0.07] p-6 text-center sm:p-8")} role="status" aria-live="polite">
//                 <div className="text-5xl" aria-hidden="true">😔</div>
//                 <h4 className="mt-3 text-2xl font-black">You got {quizScore}/5 — keep learning!</h4>
//                 <p className={cx("mx-auto mt-2 max-w-lg text-sm leading-6", sub)}>You’ll be able to try again when the 24-hour cooldown ends. Review the chapters, then come back stronger.</p>
//                 <div aria-live="off" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-3 font-mono text-lg font-black text-amber-600"><Clock3 className="h-5 w-5" />{remainingTime}</div>
//                 <p className={cx("mt-2 text-xs", sub)}>Time remaining · saved on this device</p>
//               </div>
//             ) : null}
//             {quizStorageError && <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-semibold text-amber-700 dark:text-amber-300" role="alert">{quizStorageError}</p>}
//           </div>
//         </Sec>

//         {/* LEARNING MAP */}
//         <Sec id="what-you-learn" eyebrow="A practical learning path" title="Go beyond definitions. Learn how to make design decisions." desc="Each section connects fundamentals to production trade-offs, so you can explain not just what a component does, but why it belongs in a design." dark={dark} color="#D9691A">
//           <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
//             {[
//               ["01", "Start with the problem", "Turn an open-ended prompt into a clear design brief.", ["Clarify users, scope and core use cases", "Separate functional and non-functional requirements", "Estimate traffic, storage and bandwidth"]],
//               ["02", "Build the right foundations", "Choose interfaces and data models that match real access patterns.", ["Design APIs and service boundaries", "Compare SQL, NoSQL and search stores", "Use indexes, replication and partitioning intentionally"]],
//               ["03", "Scale without guesswork", "Understand where bottlenecks appear and how each layer helps.", ["Load balancing, caching and CDNs", "Sharding, hot keys and fan-out strategies", "Kafka partitions, queues and backpressure"]],
//               ["04", "Design for correctness", "Reason about failure, retries and concurrent changes.", ["Consistency, quorums and distributed coordination", "Idempotency, transactions and saga workflows", "Rate limits, leases and duplicate delivery"]],
//               ["05", "Operate in production", "Make systems observable, resilient and safe to change.", ["Timeouts, retries and circuit breakers", "Metrics, logs, tracing and SLOs", "Multi-region recovery, deployments and cost"]],
//               ["06", "Communicate like an interviewer", "Turn a sound design into a clear, collaborative discussion.", ["A repeatable 30-step interview framework", "Trade-offs, bottlenecks and deep dives", "19 complete designs with follow-up questions"]],
//             ].map(([number, title, summary, details], i) => (
//               <Reveal key={number} delay={(i % 3) * 70}>
//                 <article className={cx("relative h-full overflow-hidden rounded-3xl border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl", card)}>
//                   <div className="absolute -right-2 -top-5 text-8xl font-black opacity-[0.06]" style={{ color: PC[(i + 1) % PC.length] }}>{number}</div>
//                   <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white" style={{ background: PC[(i + 1) % PC.length] }}>{number}</span>
//                   <h3 className="mt-5 text-xl font-extrabold">{title}</h3>
//                   <p className={cx("mt-2 text-sm leading-6", sub)}>{summary}</p>
//                   <ul className="mt-5 space-y-3">
//                     {details.map((detail) => <li key={detail} className={cx("flex items-start gap-2 text-sm leading-5", sub)}><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: PC[(i + 1) % PC.length] }} strokeWidth={3} />{detail}</li>)}
//                   </ul>
//                 </article>
//               </Reveal>
//             ))}
//           </div>
//         </Sec>

//         {/* BOOK MAP */}
//         <Sec id="inside" eyebrow="Inside the book" title="14 parts. 67 chapters. One continuous path." desc="Pick a part to see its chapters, in the same colours as the book." dark={dark} color={pcol} alt>
//           <div className="flex gap-2 overflow-x-auto pb-3">
//             {PARTS.map((p, i) => (
//               <button key={p[0]} type="button" onClick={() => setPart(i)} className={cx("shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold transition", part === i ? "text-white shadow-lg" : card)} style={part === i ? { background: PC[i], borderColor: PC[i] } : { color: PC[i] }}>
//                 Part {ROMAN[i]}
//               </button>
//             ))}
//           </div>
//           <div key={part} className="rv in mt-4 overflow-hidden rounded-3xl border" style={{ borderColor: `${pcol}55` }}>
//             <div className="p-6 text-white sm:p-8" style={{ background: pcol }}>
//               <div className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">Part {ROMAN[part]}</div>
//               <div className="mt-1 text-3xl font-extrabold" style={{ fontStretch: "90%" }}>{pname}</div>
//             </div>
//             <div className={cx("grid gap-2 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3", dark ? "bg-white/[0.03]" : "bg-white")}>
//               {pchaps.split("|").map((c, i) => (
//                 <div key={c} className="flex items-center gap-3 rounded-xl p-3" style={{ background: `${pcol}${dark ? "1F" : "12"}` }}>
//                   <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white" style={{ background: pcol }}>{startNo + i + 1}</span>
//                   <span className="text-sm font-semibold">{c}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </Sec>

//         {/* FRAMEWORK */}
//         <Sec id="framework" eyebrow="The 30-step method" title="A repeatable plan for the 45 minutes" desc="Requirements, numbers, foundations, building blocks, correctness and a strong close. The same structure works for every question." dark={dark} color="#00838F">
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//             {PHASES.map(([t, s], i) => (
//               <Reveal key={t} delay={i * 70}>
//                 <div className={cx("relative h-full overflow-hidden rounded-3xl border p-6", card)}>
//                   <div className="absolute right-4 top-2 text-7xl font-extrabold opacity-[0.07]" style={{ color: PC[i] }}>{String.fromCharCode(65 + i)}</div>
//                   <span className="rounded-full px-3 py-1 text-xs font-extrabold text-white" style={{ background: PC[i] }}>{s}</span>
//                   <h3 className="mt-4 text-xl font-extrabold">{t}</h3>
//                 </div>
//               </Reveal>
//             ))}
//           </div>
//           <div className="mt-8 overflow-hidden rounded-3xl border p-6 sm:p-8" style={{ borderColor: `${PC[0]}44` }}>
//             <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#1E5AA8]">Request lifecycle, animated</p>
//             <div className="relative mt-6 flex items-center justify-between gap-1">
//               <div className="absolute inset-x-6 top-1/2 h-0.5 bg-gradient-to-r from-[#1E5AA8] via-[#D9691A] to-[#6A4C93]" />
//               <span aria-hidden="true" className="trv absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#C2185B]" />
//               <span aria-hidden="true" className="trvback absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#2E7D32]" />
//               {["Client", "DNS", "Load balancer", "App server", "Cache", "Database"].map((n, i) => (
//                 <span key={n} className="relative z-10 rounded-xl px-2 py-2 text-[10px] font-extrabold text-white shadow-lg sm:px-4 sm:text-xs" style={{ background: PC[[0, 3, 1, 5, 6, 2][i]] }}>{n}</span>
//               ))}
//             </div>
//           </div>
//         </Sec>

//         {/* CASE STUDIES */}
//         <Sec id="case-studies" eyebrow="19 complete case studies" title="Practise the questions interviewers keep asking" desc="Every case: the question, clarifying questions, estimates, every entity with fields, all APIs, a database per service, an HLD diagram, flows, deep dives, trade-offs and follow-ups." dark={dark} color={PC[13]} alt>
//           <div className="flex flex-wrap gap-2">
//             {FAMILIES.map((f) => (
//               <button key={f} type="button" onClick={() => setFamily(f)} className={cx("rounded-full border px-4 py-2 text-xs font-extrabold transition", family === f ? "border-[#00695C] bg-[#00695C] text-white" : card)}>{f}</button>
//             ))}
//           </div>
//           <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
//             {caseList.map(({ c, i }) => {
//               const col = PC[(i + 3) % PC.length];
//               return (
//                 <div key={c[0]} className={cx("group relative overflow-hidden rounded-3xl border p-6 transition hover:-translate-y-1 hover:shadow-2xl", card)}>
//                   <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: col }} />
//                   <div className="flex items-center justify-between"><span className="text-xs font-extrabold tracking-[0.18em]" style={{ color: col }}>CASE {String(i + 1).padStart(2, "0")} · CH {48 + i}</span><span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: `${col}22`, color: col }}>{c[1]}</span></div>
//                   <h3 className="mt-4 text-xl font-extrabold" style={{ fontStretch: "92%" }}>Design {c[0]}</h3>
//                   <p className={cx("mt-2 font-mono text-xs", sub)}>{c[2]}</p>
//                   <button type="button" onClick={() => setShown((s) => ({ ...s, [i]: !s[i] }))} className="mt-4 inline-flex items-center gap-1 text-xs font-extrabold" style={{ color: col }}>
//                     What's inside <ChevronDown className={cx("h-4 w-4 transition", shown[i] && "rotate-180")} />
//                   </button>
//                   {shown[i] && <ul className={cx("rv in mt-3 grid gap-1.5 text-xs", sub)}>{["Question + clarifying Qs", "FR, NFR and estimates", "Every entity and DB field", "All APIs + DB per service", "HLD diagram + request flows", "Deep dive + 8–10 follow-ups"].map((x) => <li key={x} className="flex items-center gap-2"><Check className="h-3.5 w-3.5" style={{ color: col }} strokeWidth={3} />{x}</li>)}</ul>}
//                 </div>
//               );
//             })}
//           </div>
//         </Sec>

//         {/* Q&A */}
//         <Sec id="try-it" eyebrow="Try one yourself" title="Answer first. Then reveal the model answer." desc="A taste of the follow-up questions that close every case study." dark={dark} color="#B71C1C">
//           <div className="grid gap-3 lg:grid-cols-2">
//             {QA.map(([q, a], i) => {
//               const k = `qa${i}`;
//               return (
//                 <div key={q} className={cx("rounded-3xl border p-5", card)}>
//                   <p className="font-extrabold">{q}</p>
//                   <button type="button" onClick={() => setShown((s) => ({ ...s, [k]: !s[k] }))} className="mt-3 rounded-full px-4 py-1.5 text-xs font-extrabold text-white" style={{ background: PC[(i * 3) % PC.length] }}>{shown[k] ? "Hide answer" : "Reveal answer"}</button>
//                   {shown[k] && <p className={cx("rv in mt-3 text-sm leading-7", sub)}>{a}</p>}
//                 </div>
//               );
//             })}
//           </div>
//         </Sec>

//         {/* READINESS */}
//         <Sec id="readiness" eyebrow="Interview readiness check" title="How many can you explain right now?" desc="Tick what you could explain confidently in an interview. The book covers every one of these in depth." dark={dark} color="#2E7D32" alt>
//           <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_.8fr]">
//             <div className="grid gap-2 sm:grid-cols-2">
//               {READY.map((r, i) => (
//                 <label key={r} className={cx("flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm font-semibold transition hover:-translate-y-0.5", card)}>
//                   <input type="checkbox" checked={!!ready[i]} onChange={() => setReady((s) => ({ ...s, [i]: !s[i] }))} className="h-4 w-4 accent-[#2E7D32]" />{r}
//                 </label>
//               ))}
//             </div>
//             <div className={cx("rounded-3xl border p-6 text-center", card)}>
//               <div className="text-6xl font-extrabold" style={{ color: readyPct >= 75 ? "#2E7D32" : readyPct >= 40 ? "#D9691A" : "#B71C1C" }}>{readyPct}%</div>
//               <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200/70"><div className="h-full rounded-full bg-gradient-to-r from-[#B71C1C] via-[#D9691A] to-[#2E7D32] transition-all duration-700" style={{ width: `${readyPct}%` }} /></div>
//               <p className={cx("mt-4 text-sm", sub)}>{readyPct >= 75 ? "Strong. Use the case studies to polish deep dives." : "Great gap-finder. Close these gaps chapter by chapter."}</p>
//               <BuyBtn className="mt-4 w-full" label="Close the gaps" />
//             </div>
//           </div>
//         </Sec>

//         {/* PREVIEW */}
//         <Sec id="book-preview" eyebrow="Real book preview" title="Read actual pages before you buy" desc="Every preview page is rendered as a normal page image, so mobile and desktop users simply scroll the page." dark={dark} color={PC[0]}>
//           <div className={cx("rounded-3xl border p-3 sm:p-5 lg:p-7", dark ? "border-white/10 bg-[#0d1428]" : "border-blue-100 bg-[#f7f9ff]")}>
//             <p className={cx("px-1 pb-4 text-xs font-bold", sub)}>{previewLoading ? "Rendering preview pages…" : previewTotalPages ? `${previewTotalPages} preview pages` : "Preview pages"}</p>
//             {previewLoading && previewImages.length === 0 && <div className="space-y-6">{[1, 2, 3].map((n) => <div key={n} className={cx("mx-auto aspect-[0.707] w-full max-w-[920px] animate-pulse rounded-2xl", dark ? "bg-white/5" : "bg-white")} />)}</div>}
//             {previewError && previewImages.length === 0 && <div className={cx("mx-auto max-w-2xl rounded-2xl border p-6 text-center", card)}><BookOpen className="mx-auto h-9 w-9 text-blue-500" /><p className="mt-3 font-extrabold">Preview could not be rendered</p><p className={cx("mt-2 text-sm", sub)}>{previewError}</p></div>}
//             {previewImages.length > 0 && (
//               <div className="space-y-7 sm:space-y-10">
//                 {previewImages.map((p) => (
//                   <article key={p.pageNumber} className="mx-auto w-full max-w-[940px]">
//                     <div className="mb-2 flex justify-between px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500"><span>Preview page {String(p.pageNumber).padStart(2, "0")}</span><span>{p.pageNumber} / {previewTotalPages}</span></div>
//                     <div className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_55px_rgba(15,23,42,.16)] ring-1 ring-black/5">
//                       <img src={p.src} alt={`Mastering System Design HLD preview page ${p.pageNumber}`} width={p.width} height={p.height} loading={p.pageNumber <= 2 ? "eager" : "lazy"} decoding="async" className="block h-auto w-full bg-white" />
//                     </div>
//                   </article>
//                 ))}
//               </div>
//             )}
//           </div>
//         </Sec>

//         {/* FAQ */}
//         <Sec id="faq" eyebrow="FAQ" title="Before you get the HLD handbook" desc="Quick answers about the format, preview and what is covered." dark={dark} color={PC[10]}>
//           <div className="mx-auto max-w-3xl space-y-3">
//             {FAQS.map(([q, a], i) => {
//               const open = openFaq === i;
//               return (
//                 <article key={q} className={cx("overflow-hidden rounded-2xl border", card)}>
//                   <button type="button" onClick={() => setOpenFaq(open ? null : i)} className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left" aria-expanded={open} aria-controls={`faq-answer-${i}`}>
//                     <span className="font-extrabold sm:text-lg">{q}</span><ChevronDown className={cx("h-5 w-5 shrink-0 text-blue-500 transition", open && "rotate-180")} />
//                   </button>
//                   {open && <div id={`faq-answer-${i}`} className={cx("border-t px-5 py-5 text-sm leading-7 sm:text-base", dark ? "border-white/10" : "border-slate-200", sub)}>{a}</div>}
//                 </article>
//               );
//             })}
//           </div>
//         </Sec>

//         {/* FINAL CTA */}
//         <section className="px-4 pb-20 sm:px-6 lg:px-8">
//           <div className="grid max-w-6xl gap-8 overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1E5AA8] via-[#283593] to-[#6A4C93] p-7 text-white shadow-2xl shadow-indigo-600/25 sm:p-10 lg:mx-auto lg:grid-cols-[1fr_auto] lg:items-end lg:p-14">
//             <div>
//               <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em]"><Sparkles className="h-4 w-4" /> Interview-ready system design</div>
//               <h2 className="mt-5 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl" style={{ fontStretch: "90%" }}>Walk into your next interview able to explain why your architecture works.</h2>
//               <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">All for {pizzaText}.</p>
//             </div>
//             <div className="min-w-[240px] rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
//               <div className="flex items-end gap-2"><span className="text-3xl font-extrabold">{fmt(price)}</span>{mrp > price && <span className="pb-1 text-sm font-bold text-blue-100 line-through">{fmt(mrp)}</span>}</div>
//               <button type="button" onClick={buy} disabled={!product?._id} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-extrabold text-[#283593] transition hover:-translate-y-0.5 disabled:opacity-60">Get the ebook <ArrowRight className="h-5 w-5" /></button>
//             </div>
//           </div>
//         </section>
//       </main>

//       <footer className={cx("border-t px-4 py-8 text-center text-xs leading-6", dark ? "border-white/10 text-slate-500" : "border-slate-200 text-slate-500")}>
//         <p>Mastering System Design — High-Level Design • Digital PDF ebook • Non-refundable digital product</p>
//         <p className="mt-1">Support: <a className="font-bold hover:text-blue-500" href="mailto:supporttargettrek@gmail.com">supporttargettrek@gmail.com</a></p>
//       </footer>

//       <div className="fixed inset-x-0 bottom-0 z-[80] px-3 pb-[max(10px,env(safe-area-inset-bottom))] md:hidden">
//         <div className={cx("mx-auto grid max-w-xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-3xl border p-3 shadow-[0_-10px_45px_rgba(15,23,42,.18)] backdrop-blur-xl", dark ? "border-white/10 bg-[#0b1122]/95" : "border-white/90 bg-white/95")}>
//           <div className="min-w-0 pl-1">
//             <div className="flex items-end gap-2"><span className="text-lg font-extrabold leading-none">{fmt(price)}</span>{discount > 0 && <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-500">{discount}% off</span>}</div>
//             <p className={cx("mt-1.5 truncate text-[11px] font-extrabold", sub)}>{pizzaText}</p>
//           </div>
//           <button type="button" onClick={buy} disabled={!product?._id} className="flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1E5AA8] via-[#283593] to-[#6A4C93] px-5 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/20 disabled:opacity-60">Get the ebook <ArrowRight className="h-4 w-4" /></button>
//         </div>
//       </div>

//       <PayUCheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} product={checkoutProduct || product} />
//     </div>
//   );
// }

// export default SystemDesignHLD;

import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Check,
  ChevronDown,
  Cloud,
  Code2,
  Database,
  Gauge,
  GitBranch,
  HardDrive,
  Layers3,
  LockKeyhole,
  Network,
  RadioTower,
  RefreshCcw,
  Search,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import { pdfjs } from "react-pdf";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import HLD_PREVIEW_PDF from "../assest/master_hld_preview.pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";
const THEME_STORAGE_KEY = "theme";
const LLD_REDIRECT_URL = "/book/system-design/lld";

const SEO_TITLE =
  "Mastering System Design HLD | 19 High-Level Design Case Studies";
const SEO_DESCRIPTION =
  "Learn High-Level Design with a 45-minute interview playbook, core distributed-system building blocks, and 19 production-style case studies covering APIs, databases, caching, Kafka, scaling, failure handling and trade-offs.";

const normalizeTheme = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "dark" || normalized === "light" ? normalized : null;
};

const readThemeFromStorage = () => {
  if (typeof window === "undefined") return null;
  return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
};

const readThemeFromDom = () => {
  if (typeof document === "undefined") return null;

  const html = document.documentElement;
  const body = document.body;

  const explicitTheme =
    normalizeTheme(html?.getAttribute("data-theme")) ||
    normalizeTheme(body?.getAttribute("data-theme"));

  if (explicitTheme) return explicitTheme;

  if (html?.classList?.contains("dark") || body?.classList?.contains("dark")) {
    return "dark";
  }

  if (html?.classList?.contains("light") || body?.classList?.contains("light")) {
    return "light";
  }

  return null;
};

const readStoredTheme = () => {
  if (typeof window === "undefined") return "light";

  return (
    readThemeFromStorage() ||
    readThemeFromDom() ||
    (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
      ? "dark"
      : "light")
  );
};

const cx = (...classes) => classes.filter(Boolean).join(" ");

const formatTwoDigits = (value) => String(value).padStart(2, "0");

const caseStudies = [
  {
    number: "01",
    title: "URL Shortener",
    subtitle: "bit.ly style redirect platform",
    summary:
      "Short-code generation, read-heavy architecture, Redis caching, redirect latency, click analytics, expiry and multi-region design.",
    tags: ["KGS", "Redis", "DynamoDB", "Kafka"],
  },
  {
    number: "02",
    title: "WhatsApp / Messaging",
    subtitle: "Real-time 1:1 and group chat",
    summary:
      "WebSockets, session registry, message ordering, offline delivery, fan-out, idempotency, presence and encrypted media flows.",
    tags: ["WebSocket", "Cassandra", "Redis", "Kafka"],
  },
  {
    number: "03",
    title: "Uber / Ride-Hailing",
    subtitle: "Location + matching at scale",
    summary:
      "Driver location ingestion, geo indexes, dispatch, atomic assignment, trip state machine, ETA, surge and payment flow.",
    tags: ["H3", "Redis GEO", "CAS", "Kafka"],
  },
  {
    number: "04",
    title: "Instagram",
    subtitle: "Media, social graph and feed",
    summary:
      "Upload pipeline, CDN, object storage, feed generation, fan-out, caching, likes/comments, celebrity users and search.",
    tags: ["CDN", "Feed", "S3", "Fan-out"],
  },
  {
    number: "05",
    title: "YouTube",
    subtitle: "Video upload and delivery",
    summary:
      "Chunked upload, transcoding, metadata, object storage, adaptive streaming, CDN distribution and recommendation events.",
    tags: ["Video", "Transcoding", "CDN", "Object Store"],
  },
  {
    number: "06",
    title: "Netflix / Video Streaming",
    subtitle: "Global playback platform",
    summary:
      "Playback APIs, catalog, recommendation, encoding ladders, CDN strategy, regional resiliency and massive read traffic.",
    tags: ["Streaming", "CDN", "Cache", "Multi-region"],
  },
  {
    number: "07",
    title: "Twitter / X",
    subtitle: "Timeline and social graph",
    summary:
      "Tweet storage, home timeline, fan-out-on-write vs read, celebrity handling, cache hierarchy, search and trending events.",
    tags: ["Timeline", "Fan-out", "Redis", "Kafka"],
  },
  {
    number: "08",
    title: "Dropbox",
    subtitle: "Distributed file sync",
    summary:
      "Chunking, deduplication, metadata, sync conflicts, uploads, versioning, object storage and desktop/mobile consistency.",
    tags: ["Chunking", "Metadata", "Sync", "Object Store"],
  },
  {
    number: "09",
    title: "Google Drive + Docs",
    subtitle: "Files, sharing and collaboration",
    summary:
      "File metadata, permissions, sync, document collaboration, versioning, real-time updates and scalable blob delivery.",
    tags: ["Sharing", "Collaboration", "Versioning", "Storage"],
  },
  {
    number: "10",
    title: "Ticket Booking / BookMyShow",
    subtitle: "Zero double-booking seat inventory",
    summary:
      "Seat holds, TTL, transactions, locking, payment saga, hot-show traffic, waiting rooms and idempotent confirmation.",
    tags: ["Locking", "TTL", "Saga", "Transactions"],
  },
  {
    number: "11",
    title: "Food Delivery",
    subtitle: "Swiggy / Zomato style platform",
    summary:
      "Restaurant discovery, cart, order lifecycle, delivery-partner assignment, live tracking, payments and notifications.",
    tags: ["Orders", "Geo", "Events", "State Machine"],
  },
  {
    number: "12",
    title: "Notification System",
    subtitle: "Email, SMS and push at scale",
    summary:
      "Priority queues, provider routing, retries, dedupe, scheduling, frequency caps, fallback channels and bulk campaigns.",
    tags: ["Kafka", "Retry", "Dedupe", "Workers"],
  },
  {
    number: "13",
    title: "Distributed Rate Limiter",
    subtitle: "Low-latency API protection",
    summary:
      "Token bucket, sliding windows, Redis atomicity, sharding, dynamic rules, burst handling and fail-open/fail-closed choices.",
    tags: ["Redis", "Lua", "Token Bucket", "Gateway"],
  },
  {
    number: "14",
    title: "News Feed",
    subtitle: "Personalized feed generation",
    summary:
      "Fan-out strategies, ranking, cache layers, pagination, celebrity users, freshness and asynchronous feed materialization.",
    tags: ["Feed", "Ranking", "Fan-out", "Cache"],
  },
  {
    number: "15",
    title: "Distributed Job Scheduler",
    subtitle: "Reliable delayed and recurring work",
    summary:
      "Scheduling, worker leases, retries, idempotency, partitioning, failure recovery, cron semantics and execution history.",
    tags: ["Scheduler", "Queue", "Lease", "Retry"],
  },
  {
    number: "16",
    title: "Search Autocomplete",
    subtitle: "Typeahead at very high QPS",
    summary:
      "Trie/FST indexes, top-K precomputation, hot prefixes, cache hierarchy, offline rebuilds, trends and personalization.",
    tags: ["Trie", "Top-K", "Cache", "Flink"],
  },
  {
    number: "17",
    title: "Web Crawler",
    subtitle: "Distributed internet-scale crawling",
    summary:
      "URL frontier, politeness, dedupe, Bloom filters, retries, robots rules, spider-trap defense and recrawl scheduling.",
    tags: ["Frontier", "Bloom Filter", "Kafka", "Object Store"],
  },
  {
    number: "18",
    title: "Payment System",
    subtitle: "Correct money movement",
    summary:
      "Payment state machines, idempotency, ledger entries, webhook reliability, PSP routing, reconciliation and security.",
    tags: ["Ledger", "Idempotency", "Webhook", "Reconciliation"],
  },
  {
    number: "19",
    title: "E-commerce Platform",
    subtitle: "Amazon / Flipkart scale",
    summary:
      "Catalog, search, cart, inventory reservation, checkout saga, flash-sale controls, seller flows, fulfillment and tracking.",
    tags: ["Inventory", "Saga", "Search", "Flash Sale"],
  },
];

const caseStudyFramework = [
  {
    number: "01",
    title: "Interview question",
    copy: "Start from the prompt exactly as it is likely to be asked in a real interview.",
  },
  {
    number: "02",
    title: "Clarifying questions",
    copy: "Narrow the scope before drawing boxes: scale, features, consistency, retention and geography.",
  },
  {
    number: "03",
    title: "FR + NFR + estimates",
    copy: "Turn the prompt into functional requirements, SLOs and back-of-the-envelope traffic/storage numbers.",
  },
  {
    number: "04",
    title: "Interviewer signals",
    copy: "Know what strong answers should surface, the common red flags and likely follow-up questions.",
  },
  {
    number: "05",
    title: "Entities + APIs + DB",
    copy: "Model the core domain, define API contracts and choose storage from actual access patterns.",
  },
  {
    number: "06",
    title: "HLD architecture",
    copy: "Connect clients, gateways, services, queues, caches, databases, storage and analytics components.",
  },
  {
    number: "07",
    title: "Request flows",
    copy: "Walk the interviewer through the most important success path and state transitions step by step.",
  },
  {
    number: "08",
    title: "Algorithms + deep dives",
    copy: "Go deep on the hard part: geo search, key generation, rate limiting, fan-out, locking or scheduling.",
  },
  {
    number: "09",
    title: "Trade-offs + failures",
    copy: "Discuss retries, hot keys, crashes, consistency, recovery and the cost of every major design choice.",
  },
];

const interviewPlaybook = [
  { time: "05 min", title: "Requirements", copy: "Scope, users, critical flows, FRs and NFRs." },
  { time: "03 min", title: "Estimation", copy: "QPS, peak load, storage, bandwidth and concurrency." },
  { time: "07 min", title: "APIs + Entities", copy: "Data model, API surface and important states." },
  { time: "10 min", title: "HLD", copy: "Core services, data stores, caches and async paths." },
  { time: "15 min", title: "Deep dive", copy: "Solve the 1–2 genuinely hard parts of the design." },
  { time: "05 min", title: "Failures + trade-offs", copy: "Recovery, consistency, bottlenecks and alternatives." },
];

const buildingBlocks = [
  {
    title: "API Gateway",
    icon: Network,
    copy: "Authentication, routing, TLS termination, quotas and edge rate limiting.",
    accent: "from-blue-500 to-indigo-500",
  },
  {
    title: "Load Balancing",
    icon: Workflow,
    copy: "L4/L7 routing, health checks, horizontal scale and failure isolation.",
    accent: "from-indigo-500 to-violet-500",
  },
  {
    title: "Redis",
    icon: Zap,
    copy: "Cache, counters, TTLs, geo indexes, sorted sets, dedupe keys and locks.",
    accent: "from-violet-500 to-fuchsia-500",
  },
  {
    title: "Kafka",
    icon: RadioTower,
    copy: "Durable async backbone, replay, decoupling, partition ordering and burst absorption.",
    accent: "from-blue-500 to-cyan-500",
  },
  {
    title: "CDC",
    icon: RefreshCcw,
    copy: "Stream database changes to search, caches and analytics without unsafe dual writes.",
    accent: "from-cyan-500 to-sky-500",
  },
  {
    title: "Elasticsearch",
    icon: Search,
    copy: "Full-text search, faceting, autocomplete support and read-optimized search indexes.",
    accent: "from-sky-500 to-blue-500",
  },
  {
    title: "Object Store + CDN",
    icon: Cloud,
    copy: "Store large media blobs and deliver static/video content close to users.",
    accent: "from-indigo-500 to-blue-500",
  },
  {
    title: "SQL Databases",
    icon: Database,
    copy: "Transactions, relational integrity, locking, indexes and strongly consistent workflows.",
    accent: "from-blue-500 to-violet-500",
  },
  {
    title: "NoSQL Databases",
    icon: HardDrive,
    copy: "Horizontal scale for key-based, write-heavy and extremely large access patterns.",
    accent: "from-violet-500 to-blue-500",
  },
  {
    title: "Sharding",
    icon: GitBranch,
    copy: "Partition data by user, region, city, key-range or hash while controlling hot partitions.",
    accent: "from-cyan-500 to-indigo-500",
  },
  {
    title: "Replication",
    icon: Layers3,
    copy: "Read scale, redundancy, failover, RPO/RTO choices and sync vs async replicas.",
    accent: "from-indigo-500 to-sky-500",
  },
  {
    title: "Rate Limiting",
    icon: Gauge,
    copy: "Token bucket, fixed/sliding windows, Redis atomicity and per-tenant policy enforcement.",
    accent: "from-blue-500 to-purple-500",
  },
  {
    title: "Distributed Coordination",
    icon: LockKeyhole,
    copy: "Leases, locks, compare-and-set, leader election and correctness under concurrency.",
    accent: "from-purple-500 to-indigo-500",
  },
  {
    title: "Service Architecture",
    icon: Boxes,
    copy: "Service boundaries, synchronous RPC, asynchronous events and graceful degradation.",
    accent: "from-indigo-500 to-blue-500",
  },
  {
    title: "Observability",
    icon: ServerCog,
    copy: "Logs, metrics, tracing, queue lag, error rate and latency SLOs for production systems.",
    accent: "from-sky-500 to-cyan-500",
  },
  {
    title: "Security + Reliability",
    icon: ShieldCheck,
    copy: "AuthN/AuthZ, secrets, encryption, retries, circuit breakers and idempotent operations.",
    accent: "from-cyan-500 to-blue-500",
  },
];

const deepDives = [
  {
    kicker: "URL SHORTENER",
    title: "Generate short codes without collisions",
    copy: "Compare hashing, counters, Snowflake IDs and a Key Generation Service, then reason about 301 vs 302, hot links and async click analytics.",
    chips: ["Base62", "KGS", "Negative cache", "Multi-region"],
  },
  {
    kicker: "MESSAGING",
    title: "Guarantee ordering without pretending exactly-once exists",
    copy: "Use per-conversation ordering, time-sortable IDs, persistent WebSockets, session routing and at-least-once delivery with idempotent dedupe.",
    chips: ["WebSocket", "ULID", "Fan-out", "Reconnect"],
  },
  {
    kicker: "UBER",
    title: "Match millions of moving drivers",
    copy: "Separate the GPS write firehose from the transactional trip store, use H3/geohash cells, rank by ETA and protect assignment with lock + CAS.",
    chips: ["H3", "Redis GEO", "ETA", "CAS"],
  },
  {
    kicker: "BOOKMYSHOW",
    title: "Prevent double booking under flash-sale traffic",
    copy: "Model inventory per show-seat, create temporary holds, keep payment outside long DB transactions and confirm atomically with idempotent state transitions.",
    chips: ["Seat hold", "TTL", "Saga", "Waiting room"],
  },
  {
    kicker: "PAYMENTS",
    title: "Make money movement auditable and replay-safe",
    copy: "Design idempotency keys, append-only ledger entries, verified webhooks, reconciliation and retry rules that never create duplicate charges.",
    chips: ["Ledger", "Webhook", "PSP", "Reconciliation"],
  },
  {
    kicker: "E-COMMERCE",
    title: "Keep browsing fast while inventory remains correct",
    copy: "Let catalog/search be cache-heavy and eventually consistent, but make checkout and stock reservation strongly consistent with sagas and atomic inventory updates.",
    chips: ["Inventory", "Search", "Saga", "Flash sale"],
  },
];

const toneStyles = {
  blue: {
    borderLight: "border-blue-200/80",
    borderDark: "border-blue-400/15",
    softLight: "bg-blue-50",
    softDark: "bg-blue-400/[0.07]",
    textLight: "text-blue-700",
    textDark: "text-blue-300",
    chipLight: "bg-blue-100 text-blue-700",
    chipDark: "bg-blue-400/10 text-blue-300",
    icon: "from-blue-600 to-sky-500",
    line: "from-blue-500 to-sky-400",
  },
  cyan: {
    borderLight: "border-cyan-200/80",
    borderDark: "border-cyan-400/15",
    softLight: "bg-cyan-50",
    softDark: "bg-cyan-400/[0.07]",
    textLight: "text-cyan-700",
    textDark: "text-cyan-300",
    chipLight: "bg-cyan-100 text-cyan-700",
    chipDark: "bg-cyan-400/10 text-cyan-300",
    icon: "from-cyan-500 to-sky-500",
    line: "from-cyan-500 to-sky-400",
  },
  indigo: {
    borderLight: "border-indigo-200/80",
    borderDark: "border-indigo-400/15",
    softLight: "bg-indigo-50",
    softDark: "bg-indigo-400/[0.07]",
    textLight: "text-indigo-700",
    textDark: "text-indigo-300",
    chipLight: "bg-indigo-100 text-indigo-700",
    chipDark: "bg-indigo-400/10 text-indigo-300",
    icon: "from-indigo-600 to-violet-500",
    line: "from-indigo-500 to-violet-400",
  },
  violet: {
    borderLight: "border-violet-200/80",
    borderDark: "border-violet-400/15",
    softLight: "bg-violet-50",
    softDark: "bg-violet-400/[0.07]",
    textLight: "text-violet-700",
    textDark: "text-violet-300",
    chipLight: "bg-violet-100 text-violet-700",
    chipDark: "bg-violet-400/10 text-violet-300",
    icon: "from-violet-600 to-fuchsia-500",
    line: "from-violet-500 to-fuchsia-400",
  },
  emerald: {
    borderLight: "border-emerald-200/80",
    borderDark: "border-emerald-400/15",
    softLight: "bg-emerald-50",
    softDark: "bg-emerald-400/[0.07]",
    textLight: "text-emerald-700",
    textDark: "text-emerald-300",
    chipLight: "bg-emerald-100 text-emerald-700",
    chipDark: "bg-emerald-400/10 text-emerald-300",
    icon: "from-emerald-500 to-teal-500",
    line: "from-emerald-500 to-teal-400",
  },
  amber: {
    borderLight: "border-amber-200/80",
    borderDark: "border-amber-400/15",
    softLight: "bg-amber-50",
    softDark: "bg-amber-400/[0.07]",
    textLight: "text-amber-700",
    textDark: "text-amber-300",
    chipLight: "bg-amber-100 text-amber-700",
    chipDark: "bg-amber-400/10 text-amber-300",
    icon: "from-amber-500 to-orange-500",
    line: "from-amber-500 to-orange-400",
  },
  rose: {
    borderLight: "border-rose-200/80",
    borderDark: "border-rose-400/15",
    softLight: "bg-rose-50",
    softDark: "bg-rose-400/[0.07]",
    textLight: "text-rose-700",
    textDark: "text-rose-300",
    chipLight: "bg-rose-100 text-rose-700",
    chipDark: "bg-rose-400/10 text-rose-300",
    icon: "from-rose-500 to-pink-500",
    line: "from-rose-500 to-pink-400",
  },
  sky: {
    borderLight: "border-sky-200/80",
    borderDark: "border-sky-400/15",
    softLight: "bg-sky-50",
    softDark: "bg-sky-400/[0.07]",
    textLight: "text-sky-700",
    textDark: "text-sky-300",
    chipLight: "bg-sky-100 text-sky-700",
    chipDark: "bg-sky-400/10 text-sky-300",
    icon: "from-sky-500 to-blue-500",
    line: "from-sky-500 to-blue-400",
  },
};

const getTone = (tone, isDarkMode) => {
  const styles = toneStyles[tone] || toneStyles.blue;
  return {
    border: isDarkMode ? styles.borderDark : styles.borderLight,
    soft: isDarkMode ? styles.softDark : styles.softLight,
    text: isDarkMode ? styles.textDark : styles.textLight,
    chip: isDarkMode ? styles.chipDark : styles.chipLight,
    icon: styles.icon,
    line: styles.line,
  };
};

const chapterCoverage = [
  {
    number: "01",
    tone: "blue",
    title: "Requirements before architecture",
    subtitle: "Clarify first. Draw later.",
    description:
      "Every case study starts by narrowing scope before choosing technology. The book separates user-facing features from the system qualities that change architecture.",
    bullets: [
      "Functional requirements and critical user flows",
      "Latency, availability, durability and consistency targets",
      "Scope boundaries: region, retention, media, payments, search and analytics",
      "Interviewer follow-ups and red flags before the diagram begins",
    ],
  },
  {
    number: "02",
    tone: "cyan",
    title: "Back-of-envelope estimation",
    subtitle: "Turn vague scale into concrete numbers.",
    description:
      "The handbook repeatedly estimates QPS, peak traffic, concurrent connections, storage, bandwidth and hot-set size so the architecture is tied to a scale assumption.",
    bullets: [
      "Average QPS versus realistic peak multipliers",
      "Read:write ratios and the hot path that deserves optimization",
      "Connection counts for WebSocket-heavy systems",
      "Storage growth, media volume and cache working-set estimates",
    ],
  },
  {
    number: "03",
    tone: "indigo",
    title: "Entities, APIs and state machines",
    subtitle: "Make the system contract explicit.",
    description:
      "Before adding infrastructure, each design defines the important entities, REST/WebSocket interfaces and state transitions that services must preserve.",
    bullets: [
      "REST, WebSocket, SSE and upload-control-plane APIs",
      "Idempotency keys on retryable operations",
      "Explicit lifecycle states for booking, trip, payment and job execution",
      "Version fields and compare-and-set for concurrent updates",
    ],
  },
  {
    number: "04",
    tone: "violet",
    title: "Databases from access patterns",
    subtitle: "SQL and NoSQL are choices, not slogans.",
    description:
      "The book chooses storage from correctness and access patterns: relational databases for transactional inventory and money, wide-column/KV stores for enormous key-based workloads.",
    bullets: [
      "PostgreSQL/MySQL for transactions and relational integrity",
      "Cassandra/DynamoDB for write-heavy or key-value scale",
      "Sharding by city, user, namespace, conversation or hash",
      "Replication, hot partitions, indexes and archival strategies",
    ],
  },
  {
    number: "05",
    tone: "emerald",
    title: "Caching, CDN and search",
    subtitle: "Keep expensive work off the request path.",
    description:
      "Redis, CDN and Elasticsearch appear only where they solve a concrete read path: hot links, product pages, catalog browse, geo state, autocomplete or full-text search.",
    bullets: [
      "Cache-aside, TTL, negative caching and local LRU layers",
      "CDN for static assets, images, video segments and hot reads",
      "Elasticsearch for full-text search, facets and autocomplete alternatives",
      "Hot-key protection, request coalescing and edge caching",
    ],
  },
  {
    number: "06",
    tone: "amber",
    title: "Kafka, queues and event-driven workflows",
    subtitle: "Move non-critical work out of the synchronous chain.",
    description:
      "Analytics, notifications, search indexing, asynchronous fan-out and recovery paths use durable queues so bursts do not turn into cascading failures.",
    bullets: [
      "Kafka partitions for ordering where the key matters",
      "Outbox/CDC to avoid unsafe database + event dual writes",
      "Consumer groups, retries, backoff and dead-letter handling",
      "Burst absorption for campaigns, flash sales and event pipelines",
    ],
  },
  {
    number: "07",
    tone: "rose",
    title: "Consistency, concurrency and idempotency",
    subtitle: "Correctness is a first-class architecture concern.",
    description:
      "The hardest systems in the book are hard because two things happen at once: two buyers pick one seat, two callbacks update one payment, or two workers execute one job.",
    bullets: [
      "Atomic claims, unique constraints and compare-and-set",
      "Redis locks as a fast gate with the database as source of truth",
      "At-least-once delivery plus idempotent dedupe",
      "Leases, fencing tokens, hold TTLs and compensating actions",
    ],
  },
  {
    number: "08",
    tone: "sky",
    title: "Failures, observability and security",
    subtitle: "A design is incomplete until the happy path breaks.",
    description:
      "Every case closes with failure handling and trade-offs: reconnect, retry, failover, degraded features, webhook verification, encryption and operational signals.",
    bullets: [
      "Timeouts, exponential backoff and circuit breakers",
      "Graceful degradation when recommendations or metadata fail",
      "Logs, metrics, tracing, queue lag and end-to-end latency",
      "TLS, tokenization, least privilege, signatures and audit trails",
    ],
  },
];

const scaleSnapshots = [
  {
    tone: "blue",
    system: "URL Shortener",
    number: "40k/s peak reads",
    detail: "100M new URLs/month with a 100:1 read:write ratio; the redirect path is the product.",
  },
  {
    tone: "indigo",
    system: "Messaging",
    number: "20B messages/day",
    detail: "500M DAU, roughly 230k messages/s average and around 100M concurrent connections at peak.",
  },
  {
    tone: "cyan",
    system: "Ride Hailing",
    number: "1.25M GPS writes/s",
    detail: "5M online drivers pinging every four seconds makes location ingestion far larger than trip creation traffic.",
  },
  {
    tone: "violet",
    system: "Netflix",
    number: "~500 Tbps",
    detail: "100M concurrent viewers at 5 Mbps shows why delivery must happen from an edge CDN instead of central data centers.",
  },
  {
    tone: "rose",
    system: "BookMyShow",
    number: "10–50k req/s",
    detail: "A single hot show can receive flash-sale traffic while the real problem is contention on a few hundred seat rows.",
  },
  {
    tone: "emerald",
    system: "Autocomplete",
    number: "~1.5M req/s peak",
    detail: "10B searches/day can generate many suggestion requests per query, so prefix serving must stay memory-first and cacheable.",
  },
  {
    tone: "amber",
    system: "Payments",
    number: "40M ledger rows/day",
    detail: "10M payments/day is not enormous traffic; correctness, auditability and immutable money movement are the difficult parts.",
  },
  {
    tone: "sky",
    system: "E-commerce",
    number: "100k+ views/s peak",
    detail: "100M DAU with sale traffic 100× baseline requires a different consistency model for browsing versus inventory checkout.",
  },
];

const architectureDecisions = [
  {
    tone: "violet",
    title: "SQL when correctness is the feature",
    use: "Seat inventory, orders, payments, trip state and other transactional workflows.",
    reason:
      "Transactions, unique constraints, row locks and compare-and-set make the database the final arbiter when a duplicate action would be incorrect.",
    examples: ["BookMyShow", "Payments", "E-commerce inventory", "Trips"],
  },
  {
    tone: "cyan",
    title: "NoSQL when the access path is enormous and simple",
    use: "Message histories, URL mappings, high-volume time-series or key-based data.",
    reason:
      "Partition-key access, horizontal scale and write throughput matter more than joins or multi-row transactions.",
    examples: ["WhatsApp messages", "URL mappings", "Event trails"],
  },
  {
    tone: "emerald",
    title: "Redis for hot or ephemeral state",
    use: "Caches, rate-limit counters, presence, geo sets, locks, hold gates and dedupe keys.",
    reason:
      "The book uses Redis when losing/rebuilding a hot copy is acceptable or when atomic in-memory operations remove pressure from the primary store.",
    examples: ["Presence", "Seat holds", "Driver geo", "Rate limiting"],
  },
  {
    tone: "amber",
    title: "Kafka when the caller should not wait",
    use: "Analytics, click events, notifications, index updates, fan-out and asynchronous workflows.",
    reason:
      "A durable log absorbs bursts, decouples producers from consumers and allows replay after consumer failure.",
    examples: ["Click analytics", "Booking events", "Search indexing", "Notifications"],
  },
  {
    tone: "blue",
    title: "CDN + object storage for large immutable bytes",
    use: "Images, file blocks, video renditions, manifests, static assets and downloadable media.",
    reason:
      "Application servers should move metadata and authorization, not repeatedly stream petabytes of immutable content.",
    examples: ["YouTube", "Netflix", "Instagram", "Dropbox"],
  },
  {
    tone: "rose",
    title: "Strong consistency only where a wrong answer costs more",
    use: "Money, seat ownership, stock decrement and one-driver/one-trip assignment.",
    reason:
      "Catalogs, feeds and search indexes can tolerate eventual consistency; inventory and money cannot tolerate two successful owners.",
    examples: ["Payments", "Booking", "Inventory", "Dispatch"],
  },
];

const tradeoffCards = [
  {
    tone: "blue",
    title: "301 vs 302 redirect",
    left: "301: browsers cache aggressively and origin traffic drops.",
    right: "302: the service stays in the path, preserving control and click analytics.",
    takeaway: "Choose based on product behavior, not HTTP trivia.",
  },
  {
    tone: "indigo",
    title: "Fan-out on write vs fan-out on read",
    left: "Write-time fan-out makes ordinary feed reads fast.",
    right: "Read-time fan-out avoids exploding work for celebrity or huge-channel publishers.",
    takeaway: "Hybrid designs are often more realistic than one global rule.",
  },
  {
    tone: "cyan",
    title: "Distance vs ETA for driver matching",
    left: "Straight-line distance is cheap but does not model roads or traffic.",
    right: "ETA ranking is costlier but aligns with the rider experience.",
    takeaway: "A coarse geo index narrows candidates before an expensive ranker.",
  },
  {
    tone: "rose",
    title: "Availability vs correctness",
    left: "Browse/catalog/search can stay available with stale data.",
    right: "Booking, inventory and payment paths may reject/delay rather than accept conflicting state.",
    takeaway: "Use different consistency guarantees inside the same product.",
  },
  {
    tone: "amber",
    title: "Exactly-once vs idempotent at-least-once",
    left: "Networks, retries and worker crashes make true end-to-end exactly-once unrealistic.",
    right: "Stable IDs, unique keys and dedupe make repeated delivery produce one logical effect.",
    takeaway: "Design for retries instead of assuming they will not happen.",
  },
  {
    tone: "violet",
    title: "Pull CDN vs pre-positioning",
    left: "UGC systems often pull new content into caches when demand appears.",
    right: "A small predictable catalog can be pushed to edge locations during off-peak periods.",
    takeaway: "Netflix and YouTube have different content economics even though both stream video.",
  },
];

const caseStudySpotlights = [
  {
    tone: "blue",
    caseNo: "01",
    title: "URL Shortener",
    subtitle: "Read-heavy systems and cache-first thinking",
    scale: "100M new URLs/month • 100:1 read:write • ~40k/s peak reads",
    hardPart: "Generate short codes safely and keep redirect p99 extremely low.",
    flow: [
      "Client creates URL through API Gateway",
      "Create Service validates and gets a key from KGS",
      "Mapping is written with an atomic uniqueness condition",
      "Redirect checks local cache → Redis → primary KV store",
      "Click event goes asynchronously to Kafka and analytics",
    ],
    concepts: ["Base62", "KGS", "Redis", "DynamoDB/Cassandra", "Kafka", "Negative cache"],
    failures: [
      "Hot viral links are protected with CDN/local cache/Redis replicas.",
      "Expired links are checked lazily and removed with TTL/background cleanup.",
      "Analytics never blocks the redirect response.",
    ],
  },
  {
    tone: "indigo",
    caseNo: "02",
    title: "WhatsApp / Messaging",
    subtitle: "Connections, ordering and offline delivery",
    scale: "500M DAU • 20B msgs/day • ~100M concurrent connections",
    hardPart: "Route a message to the correct live connection while preserving conversation ordering and retry safety.",
    flow: [
      "Device holds a WebSocket to a chat server",
      "Session registry maps user/device → chat server",
      "Message is persisted before sender receives SENT acknowledgement",
      "Online recipients receive through routed server-to-server delivery",
      "Offline recipients use store-and-forward plus push notification",
    ],
    concepts: ["WebSocket", "Session registry", "ULID/Snowflake", "Cassandra", "Fan-out", "Idempotency"],
    failures: [
      "A dead chat server only loses connections, not persisted messages.",
      "Reconnect drains missing messages from the last acknowledged point.",
      "At-least-once delivery becomes effectively once to the user through dedupe.",
    ],
  },
  {
    tone: "cyan",
    caseNo: "03",
    title: "Uber / Ride Hailing",
    subtitle: "Geo indexing and atomic driver assignment",
    scale: "5M online drivers • ~1.25M location writes/s • 20M rides/day",
    hardPart: "The location firehose is enormous, but one driver must still never be committed to two rides.",
    flow: [
      "Driver pings update ephemeral geo state",
      "Dispatch queries H3/geohash cells around pickup",
      "Candidates are filtered and ranked by ETA",
      "Fast lock protects the offer window",
      "Database compare-and-set commits the winning driver/trip transition",
    ],
    concepts: ["H3", "Redis GEO", "ETA", "CAS", "State machine", "Kafka"],
    failures: [
      "Driver TTL removes stale locations after network loss.",
      "Requested trips can be re-enqueued if dispatch crashes.",
      "City-based partitioning limits blast radius and keeps matching local.",
    ],
  },
  {
    tone: "rose",
    caseNo: "10",
    title: "Ticket Booking / BookMyShow",
    subtitle: "No double booking under flash traffic",
    scale: "500k users at launch • 10–50k req/s on a hot show • ~300 seats/show",
    hardPart: "The challenge is not table size; it is thousands of users competing for the same few rows.",
    flow: [
      "Browse traffic is cached heavily",
      "Booking request creates a temporary seat hold",
      "Inventory DB is the source of truth for AVAILABLE/HELD/BOOKED",
      "Payment happens outside a long database transaction",
      "Webhook confirms seats or timeout worker releases the hold",
    ],
    concepts: ["Seat hold", "TTL", "SQL", "Unique constraint", "Saga", "Waiting room"],
    failures: [
      "Unique constraints remain the last-line safety net.",
      "Late/duplicate payment callbacks are processed idempotently.",
      "Virtual waiting room and rate limits protect a blockbuster release.",
    ],
  },
  {
    tone: "amber",
    caseNo: "15",
    title: "Distributed Job Scheduler",
    subtitle: "Leases, retries and effectively-once execution",
    scale: "Large scheduled workloads • recurring jobs • bursty cron boundaries",
    hardPart: "Find due jobs efficiently and prevent two schedulers/workers from producing duplicate logical execution.",
    flow: [
      "DB keeps durable schedule and next_run_time",
      "Scheduler owns shards using a lease",
      "Lookahead/timing wheel moves due work into a queue",
      "Worker lease + fencing token protects execution ownership",
      "Idempotent handler makes retry safe",
    ],
    concepts: ["Timing wheel", "Lease", "Fencing token", "SKIP LOCKED", "Idempotency", "Misfire policy"],
    failures: [
      "Scheduler ownership transfers after lease expiry.",
      "Outbox retains unpublished runs during queue outages.",
      "Jitter avoids a midnight or top-of-hour thundering herd.",
    ],
  },
  {
    tone: "emerald",
    caseNo: "16",
    title: "Search Autocomplete",
    subtitle: "Top-K prefix serving at massive QPS",
    scale: "100M DAU • 10B queries/day • up to ~1.5M suggestion req/s peak",
    hardPart: "Return top suggestions in tens of milliseconds without running a database LIKE query on every keystroke.",
    flow: [
      "Client debounces keystrokes and checks local cache",
      "CDN/edge caches popular prefix responses",
      "Suggest service routes to the correct in-memory trie/FST shard",
      "Offline batch rebuild computes top-K results",
      "Streaming overlay adds fresh trending signals",
    ],
    concepts: ["Trie/FST", "Top-K", "CDN", "Sharding", "Spark/Flink", "Trending overlay"],
    failures: [
      "Hot prefixes are spread through cache layers.",
      "Blue/green index swap avoids partially loaded serving state.",
      "Eventual consistency is acceptable for ranking freshness.",
    ],
  },
  {
    tone: "violet",
    caseNo: "18",
    title: "Payment System",
    subtitle: "Correctness, auditability and unknown outcomes",
    scale: "10M tx/day • 1–5k/s sale peaks • ~40M ledger rows/day",
    hardPart: "A timeout does not mean failure. The system must discover the truth without charging twice.",
    flow: [
      "Idempotency layer claims one logical payment operation",
      "Payment state machine calls a selected PSP connector",
      "Ledger posts immutable double-entry movements",
      "Outbox/CDC emits events after database commit",
      "Webhooks + polling + reconciliation resolve asynchronous or unknown outcomes",
    ],
    concepts: ["Idempotency", "Double-entry ledger", "Outbox", "Webhook", "Reconciliation", "Tokenization"],
    failures: [
      "Unknown PSP response remains pending until definitive status is known.",
      "Webhook signatures are verified and event IDs are deduplicated.",
      "Reconciliation compares internal ledger, PSP report and bank statement.",
    ],
  },
  {
    tone: "sky",
    caseNo: "19",
    title: "E-commerce Platform",
    subtitle: "Fast browse path, correct inventory path",
    scale: "100M DAU • 100× sale traffic • 100k+ product views/s peak",
    hardPart: "Search/catalog can be eventually consistent while inventory reservation and order state must not oversell.",
    flow: [
      "CDN/Redis serve product and catalog reads",
      "CDC updates Elasticsearch without dual writes",
      "Checkout orchestrator reserves stock before finalizing order",
      "Payment and inventory transitions are coordinated as a saga",
      "Kafka drives fulfillment, notification, analytics and downstream indexing",
    ],
    concepts: ["Inventory reservation", "CDC", "Elasticsearch", "Saga", "Kafka", "Flash-sale gate"],
    failures: [
      "Cart never silently becomes the stock source of truth.",
      "Compensation releases inventory after payment/order failure.",
      "Waiting room and stock gate prevent the database from absorbing the entire sale spike.",
    ],
  },
];

const productionPatterns = [
  {
    tone: "blue",
    title: "Cache only what can be rebuilt",
    copy: "Redis is used as a hot copy or ephemeral state in many designs; the primary database still owns durable truth where correctness matters.",
  },
  {
    tone: "cyan",
    title: "Partition by the unit that moves together",
    copy: "Conversation, city, namespace, user or region keys keep related traffic local and make horizontal scaling predictable.",
  },
  {
    tone: "indigo",
    title: "Order only what must be ordered",
    copy: "Kafka partition keys, per-conversation IDs and version checks provide local ordering without imposing a global serialization bottleneck.",
  },
  {
    tone: "violet",
    title: "Use state machines for multi-step workflows",
    copy: "Trips, payments, bookings, orders and jobs are easier to reason about when transitions and terminal states are explicit.",
  },
  {
    tone: "rose",
    title: "Expect duplicate delivery",
    copy: "Stable request IDs, unique constraints and dedupe tables are safer than assuming a client, queue or webhook will execute once.",
  },
  {
    tone: "amber",
    title: "Keep analytics off the critical path",
    copy: "Click events, search logs, delivery metrics and product analytics are emitted asynchronously so the core user response is not held hostage.",
  },
  {
    tone: "emerald",
    title: "Use TTL for ephemeral ownership",
    copy: "Presence, seat holds, driver availability, leases and temporary dedupe keys naturally expire when their owner disappears.",
  },
  {
    tone: "sky",
    title: "Back-pressure before the database",
    copy: "Rate limits, queues and virtual waiting rooms absorb spikes before hot rows and downstream providers become the bottleneck.",
  },
  {
    tone: "blue",
    title: "Outbox/CDC beats dual writes",
    copy: "Write business state and an outbox record in one transaction, then publish later; this prevents DB-success/Kafka-failure inconsistency.",
  },
  {
    tone: "indigo",
    title: "Degrade optional features first",
    copy: "Playback, checkout or messaging should survive when recommendations, analytics or secondary indexes are unavailable.",
  },
  {
    tone: "rose",
    title: "Locks are not the final truth",
    copy: "A Redis lock can reduce contention, but a durable compare-and-set or unique database constraint still protects correctness after lock loss.",
  },
  {
    tone: "violet",
    title: "Reconciliation is an architecture component",
    copy: "For payments and other externally coordinated systems, a later audit loop catches state drift that online requests cannot perfectly eliminate.",
  },
];

const audience = [
  {
    title: "SDE-1 → SDE-2",
    copy: "Move from knowing components individually to explaining how they work together under load and failure.",
  },
  {
    title: "Backend Engineers",
    copy: "Practice the architecture choices behind APIs, databases, caches, queues, storage and distributed workflows.",
  },
  {
    title: "Interview Preparation",
    copy: "Use one repeatable 45-minute structure instead of memorizing disconnected diagrams for every company question.",
  },
  {
    title: "Revision Before Interviews",
    copy: "Case-study cards and consistent sections make it easier to revisit one design quickly before a system-design round.",
  },
];

const faqs = [
  {
    q: "Is this book only for experienced engineers?",
    a: "No. The page starts from the interview method and core building blocks, then moves into complete case studies. It is especially useful when you already know basic backend development but want a structured HLD approach.",
  },
  {
    q: "How are the 19 case studies structured?",
    a: "Each case follows the same sequence: interview prompt, clarifying questions, functional and non-functional requirements, estimation, interviewer expectations, entities, APIs, database design, HLD, request flows, algorithms/deep dives, trade-offs and failures.",
  },
  {
    q: "Does it cover Redis, Kafka, sharding and distributed systems?",
    a: "Yes. The case studies repeatedly use API gateways, load balancers, Redis, Kafka, CDC, Elasticsearch, object storage/CDNs, SQL/NoSQL choices, sharding, replication, locks, retries, idempotency and observability in context.",
  },
  {
    q: "Does the book include BookMyShow-style concurrency problems?",
    a: "Yes. The ticket-booking case focuses on seat inventory, temporary holds, locking/transactions, payment state transitions, timeout release and flash-sale traffic.",
  },
  {
    q: "Can I preview the book before buying?",
    a: "Yes. The preview PDF is rendered page-by-page into normal image elements, so visitors see every preview page directly in the website without a PDF toolbar or nested scroller.",
  },
  {
    q: "Is this a physical book?",
    a: "No. This is a digital PDF ebook.",
  },
  {
    q: "Is the digital purchase refundable?",
    a: "No. Digital ebook purchases are non-refundable after successful payment.",
  },
  {
    q: "How can I contact support?",
    a: "Email supporttargettrek@gmail.com for purchase or ebook support.",
  },
];

function SectionHeader({ eyebrow, title, description, align = "left", dark = false }) {
  return (
    <div className={cx(align === "center" && "mx-auto max-w-3xl text-center")}>
      <p
        className={cx(
          "text-xs font-extrabold uppercase tracking-[0.2em] sm:text-sm",
          dark ? "text-blue-300" : "text-blue-600"
        )}
      >
        {eyebrow}
      </p>
      <h2
        className={cx(
          "hld-display mt-3 text-3xl font-extrabold leading-[1.08] tracking-[-0.035em] sm:text-4xl lg:text-[3.15rem]",
          dark ? "text-white" : "text-slate-950"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cx(
            "mt-4 text-base leading-7 sm:text-lg sm:leading-8",
            dark ? "text-slate-300" : "text-slate-600"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function SystemDesignHLD() {
  const [theme, setTheme] = useState(readStoredTheme);
  const isDarkMode = theme === "dark";

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");

  const [lldProduct, setLldProduct] = useState(null);
  const [loadingLldProduct, setLoadingLldProduct] = useState(true);
  const [lldProductError, setLldProductError] = useState("");

  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const [previewImages, setPreviewImages] = useState([]);
  const [previewTotalPages, setPreviewTotalPages] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return undefined;
    }

    let lastStorageTheme = readThemeFromStorage();
    let lastDomTheme = readThemeFromDom();

    const commitTheme = (nextTheme) => {
      if (!nextTheme) return;
      setTheme((currentTheme) =>
        currentTheme === nextTheme ? currentTheme : nextTheme
      );
    };

    const syncTheme = () => {
      const storageTheme = readThemeFromStorage();
      const domTheme = readThemeFromDom();

      // Follow whichever source actually changed. This matters because a navbar
      // often changes localStorage in the same tab (no native `storage` event),
      // while other implementations only toggle the html/body class.
      if (storageTheme && storageTheme !== lastStorageTheme) {
        lastStorageTheme = storageTheme;
        lastDomTheme = domTheme;
        commitTheme(storageTheme);
        return;
      }

      if (domTheme && domTheme !== lastDomTheme) {
        lastDomTheme = domTheme;
        lastStorageTheme = storageTheme;
        commitTheme(domTheme);
        return;
      }

      lastStorageTheme = storageTheme;
      lastDomTheme = domTheme;
      commitTheme(
        storageTheme ||
          domTheme ||
          (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
            ? "dark"
            : "light")
      );
    };

    const onStorage = (event) => {
      if (!event.key || event.key === THEME_STORAGE_KEY) syncTheme();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") syncTheme();
    };

    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const observer = new MutationObserver(syncTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });
    }

    syncTheme();

    // Same-tab localStorage writes do not emit `storage`, so this lightweight
    // check guarantees navbar-driven changes are reflected immediately.
    const intervalId = window.setInterval(syncTheme, 120);

    window.addEventListener("storage", onStorage);
    window.addEventListener("themechange", syncTheme);
    window.addEventListener("focus", syncTheme);
    document.addEventListener("visibilitychange", onVisibility);
    media?.addEventListener?.("change", syncTheme);

    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("themechange", syncTheme);
      window.removeEventListener("focus", syncTheme);
      document.removeEventListener("visibilitychange", onVisibility);
      media?.removeEventListener?.("change", syncTheme);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referralCode = (
      params.get("referralCode") ||
      params.get("ref") ||
      ""
    ).trim();

    if (referralCode) localStorage.setItem("referralCode", referralCode);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        setProductError("");

        const redirectUrl = window.location.pathname;
        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(
            redirectUrl
          )}`,
          {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }
        );

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success || !result?.data) {
          throw new Error(result?.error?.message || "Book not found.");
        }

        setProduct(result.data);
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("Failed to fetch HLD product:", error);
        setProduct(null);
        setProductError(error?.message || "Book not found.");
      } finally {
        if (!controller.signal.aborted) setLoadingProduct(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchLldProduct = async () => {
      try {
        setLoadingLldProduct(true);
        setLldProductError("");

        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(
            LLD_REDIRECT_URL
          )}`,
          {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }
        );

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success || !result?.data) {
          throw new Error(
            result?.error?.message || "LLD book details are unavailable."
          );
        }

        setLldProduct(result.data);
      } catch (error) {
        if (error?.name === "AbortError") return;

        console.error("Failed to fetch LLD product:", error);
        setLldProduct(null);
        setLldProductError(
          error?.message || "LLD book details are unavailable."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingLldProduct(false);
        }
      }
    };

    fetchLldProduct();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loadingTask = null;
    const objectUrls = [];

    const canvasToBlob = (canvas) =>
      new Promise((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob),
          "image/jpeg",
          0.94
        );
      });

    const renderPreviewAsImages = async () => {
      try {
        setPreviewLoading(true);
        setPreviewError("");
        setPreviewImages([]);

        loadingTask = pdfjs.getDocument(HLD_PREVIEW_PDF);
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        setPreviewTotalPages(pdf.numPages);

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;

          const page = await pdf.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const targetWidth = Math.min(
            1500,
            Math.max(1050, typeof window !== "undefined" ? window.innerWidth * 1.35 : 1200)
          );
          const scale = Math.max(1.25, targetWidth / baseViewport.width);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d", { alpha: false });

          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);

          if (!context) throw new Error("Canvas is not supported in this browser.");

          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({
            canvasContext: context,
            viewport,
            background: "white",
          }).promise;

          const blob = await canvasToBlob(canvas);
          if (!blob) throw new Error(`Could not render preview page ${pageNumber}.`);

          const src = URL.createObjectURL(blob);
          objectUrls.push(src);

          if (!cancelled) {
            setPreviewImages((current) => [
              ...current,
              {
                pageNumber,
                src,
                width: canvas.width,
                height: canvas.height,
              },
            ]);
          }

          page.cleanup?.();
          canvas.width = 1;
          canvas.height = 1;
        }
      } catch (error) {
        if (cancelled) return;
        console.error("HLD preview image rendering failed:", error);
        setPreviewError(
          error?.message || "Unable to render the preview pages as images."
        );
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    };

    renderPreviewAsImages();

    return () => {
      cancelled = true;
      try {
        loadingTask?.destroy?.();
      } catch {
        // no-op
      }
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const currentPrice = Number(product?.price ?? 0);
  const mrp = Number(product?.mrp ?? 0);
  const currency = product?.currency || "INR";
  const discount =
    mrp > currentPrice && currentPrice >= 0
      ? Math.round(((mrp - currentPrice) / mrp) * 100)
      : 0;

  const bookCover =
    product?.coverpageurl ||
    product?.coverPageUrl ||
    product?.cover_page_url ||
    "";

  const productName =
    product?.title || "Mastering System Design — High-Level Design";

  const lldCurrentPrice = Number(lldProduct?.price ?? 0);
  const lldMrp = Number(lldProduct?.mrp ?? 0);
  const lldCurrency = lldProduct?.currency || "INR";
  const lldDiscount =
    lldMrp > lldCurrentPrice && lldCurrentPrice >= 0
      ? Math.round(((lldMrp - lldCurrentPrice) / lldMrp) * 100)
      : 0;

  const lldCover =
    lldProduct?.coverpageurl ||
    lldProduct?.coverPageUrl ||
    lldProduct?.cover_page_url ||
    "";

  const lldTitle =
    lldProduct?.title || "Mastering System Design — LLD (Java)";

  const lldSubtitle =
    lldProduct?.subtitle ||
    "Java-first Low-Level Design interview handbook";

  const lldDescription =
    lldProduct?.shortDescription ||
    lldProduct?.description ||
    "Turn requirements into clean object models, apply SOLID principles and design patterns, and practice complete Java-first low-level design problems.";

  const lldMetaItems = [
    lldProduct?.edition ? `Edition: ${lldProduct.edition}` : null,
    lldProduct?.level ? `Level: ${lldProduct.level}` : null,
    lldProduct?.language ? `Language: ${lldProduct.language}` : null,
    lldProduct?.format ? `Format: ${lldProduct.format}` : "Digital ebook",
  ].filter(Boolean);

  const lldCategoryPills = Array.isArray(lldProduct?.categories)
    ? lldProduct.categories
        .map((item) =>
          typeof item === "string"
            ? item
            : item?.name || item?.title || item?.label || ""
        )
        .filter(Boolean)
        .slice(0, 5)
    : [];

  const formatMoney = (amount, currencyCode = currency) => {
    const value = Number(amount || 0);
    const localeMap = {
      INR: "en-IN",
      USD: "en-US",
      GBP: "en-GB",
      EUR: "en-IE",
      AUD: "en-AU",
      CAD: "en-CA",
    };

    try {
      return new Intl.NumberFormat(localeMap[currencyCode] || "en", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `${currencyCode} ${value}`;
    }
  };

  const handleBuyNow = () => {
    if (!product?._id) return;
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };

  const handleLldBuyNow = () => {
    if (!lldProduct?._id) return;
    setCheckoutProduct(lldProduct);
    setIsCheckoutOpen(true);
  };

  const pathname =
    typeof window !== "undefined"
      ? window.location.pathname
      : "/book/system-design/hld";
  const canonicalUrl = `${SITE_URL}${pathname}`;

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: SITE_NAME,
          url: SITE_URL,
          email: "supporttargettrek@gmail.com",
        },
        {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          url: SITE_URL,
          name: SITE_NAME,
          publisher: { "@id": `${SITE_URL}/#organization` },
        },
        {
          "@type": "WebPage",
          "@id": `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: SEO_TITLE,
          description: SEO_DESCRIPTION,
          isPartOf: { "@id": `${SITE_URL}/#website` },
        },
        {
          "@type": "Product",
          "@id": `${canonicalUrl}#product`,
          name: productName,
          description: SEO_DESCRIPTION,
          url: canonicalUrl,
          category: "System Design High-Level Design Ebook",
          brand: { "@type": "Brand", name: SITE_NAME },
          ...(product?._id ? { sku: String(product._id) } : {}),
          ...(bookCover ? { image: [bookCover] } : {}),
          ...(currentPrice > 0
            ? {
                offers: {
                  "@type": "Offer",
                  url: canonicalUrl,
                  price: currentPrice,
                  priceCurrency: currency,
                  availability: "https://schema.org/OnlineOnly",
                  itemCondition: "https://schema.org/NewCondition",
                  seller: {
                    "@type": "Organization",
                    name: SITE_NAME,
                    url: SITE_URL,
                  },
                },
              }
            : {}),
        },
        {
          "@type": "FAQPage",
          "@id": `${canonicalUrl}#faq`,
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.a,
            },
          })),
        },
      ],
    }),
    [bookCover, canonicalUrl, currency, currentPrice, product?._id, productName]
  );

  const pageShell = isDarkMode
    ? "bg-[#070b18] text-slate-100"
    : "bg-white text-slate-950";

  const panel = isDarkMode
    ? "border-white/10 bg-white/[0.04]"
    : "border-slate-200 bg-white";

  const softPanel = isDarkMode
    ? "border-white/10 bg-[#0d1428]"
    : "border-blue-100 bg-[#f7f9ff]";

  const dotBackground = {
    backgroundImage: isDarkMode
      ? "radial-gradient(circle, rgba(129,140,248,.17) 1.2px, transparent 1.2px)"
      : "radial-gradient(circle, rgba(99,102,241,.11) 1.2px, transparent 1.2px)",
    backgroundSize: "40px 40px",
  };

  const seoHead = (
    <Helmet htmlAttributes={{ lang: "en" }}>
      <title>{SEO_TITLE}</title>
      <meta name="description" content={SEO_DESCRIPTION} />
      <meta name="author" content={SITE_NAME} />
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <meta
        name="googlebot"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <meta name="theme-color" content={isDarkMode ? "#070b18" : "#eef2ff"} />
      <meta name="color-scheme" content={isDarkMode ? "dark" : "light"} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={SEO_TITLE} />
      <meta property="og:description" content={SEO_DESCRIPTION} />
      <meta property="og:url" content={canonicalUrl} />
      {bookCover && <meta property="og:image" content={bookCover} />}
      {bookCover && (
        <meta property="og:image:alt" content={`${productName} ebook cover`} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={SEO_TITLE} />
      <meta name="twitter:description" content={SEO_DESCRIPTION} />
      {bookCover && <meta name="twitter:image" content={bookCover} />}

      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );

  if (loadingProduct) {
    return (
      <div className={cx("flex min-h-screen items-center justify-center px-4", pageShell)}>
        {seoHead}
        <div className={cx("w-full max-w-md rounded-[28px] border p-8 text-center shadow-xl", panel)}>
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600 dark:border-blue-950 dark:border-t-blue-400" />
          <h1 className="mt-6 text-xl font-extrabold">Loading the HLD handbook…</h1>
          <p className={cx("mt-2 text-sm leading-6", isDarkMode ? "text-slate-400" : "text-slate-500")}>
            Fetching the latest product details and price.
          </p>
        </div>
      </div>
    );
  }

  if (!product || productError) {
    return (
      <div className={cx("flex min-h-screen items-center justify-center px-4", pageShell)}>
        <Helmet>
          <title>Book Not Found | Target Trek</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className={cx("w-full max-w-lg rounded-[28px] border p-8 text-center shadow-xl", panel)}>
          <BookOpen className="mx-auto h-12 w-12 text-blue-500" />
          <h1 className="mt-5 text-2xl font-extrabold">Book details are unavailable</h1>
          <p className={cx("mt-3 text-sm leading-6", isDarkMode ? "text-slate-400" : "text-slate-600")}>
            {productError || "Please refresh the page and try again."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx("min-h-screen overflow-x-hidden pb-28 md:pb-0", pageShell)}
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
      }}
    >
      {seoHead}

      <nav
        aria-label="Breadcrumb"
        className={cx(
          "border-b px-4 py-3 text-sm",
          isDarkMode
            ? "border-white/10 bg-[#070b18] text-slate-400"
            : "border-slate-200 bg-white text-slate-500"
        )}
      >
        <ol className="mx-auto flex max-w-7xl items-center gap-2">
          <li>
            <a className="font-semibold transition hover:text-blue-500" href="/">
              Home
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <a className="font-semibold transition hover:text-blue-500" href="/books">
              Books
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li className={cx("font-bold", isDarkMode ? "text-slate-200" : "text-slate-800")}>
            System Design HLD
          </li>
        </ol>
      </nav>

      <main>
        <section
          className={cx(
            "relative overflow-hidden border-b",
            isDarkMode
              ? "border-indigo-400/10 bg-[#090f20]"
              : "border-indigo-100 bg-[#f1f5ff]"
          )}
          style={dotBackground}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="absolute -right-24 top-0 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-10 px-3 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
            <div className="min-w-0">
              <div
                className={cx(
                  "inline-flex max-w-full items-center gap-2 rounded-full border px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] shadow-sm sm:text-sm sm:tracking-[0.16em]",
                  isDarkMode
                    ? "border-blue-400/20 bg-white/5 text-blue-300"
                    : "border-blue-200 bg-white/85 text-blue-700"
                )}
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <span className="truncate">HLD SYSTEM DESIGN INTERVIEW HANDBOOK</span>
              </div>

              <h1 className="mt-8 text-[3.15rem] font-extrabold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                <span className={isDarkMode ? "text-white" : "text-[#0b1328]"}>
                  Design for scale.
                </span>
                <span className="mt-2 block bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                  Explain every trade-off.
                </span>
              </h1>

              <p
                className={cx(
                  "mt-7 max-w-2xl text-base font-medium leading-8 sm:text-lg",
                  isDarkMode ? "text-slate-300" : "text-[#53637f]"
                )}
              >
                Learn a repeatable way to turn an open-ended interview prompt into
                requirements, estimates, APIs, data models, a complete architecture,
                deep dives and failure handling — then practice the same approach
                across 19 familiar systems.
              </p>

              <div className="mt-9 grid gap-4 sm:max-w-2xl sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!product?._id}
                  className="group flex min-h-[72px] items-center justify-center gap-3 rounded-[20px] bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 px-6 text-lg font-extrabold text-white shadow-xl shadow-indigo-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Get the ebook {formatMoney(currentPrice)}
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </button>

                <a
                  href="#book-preview"
                  className={cx(
                    "flex min-h-[72px] items-center justify-center gap-3 rounded-[20px] border px-6 text-lg font-extrabold transition hover:-translate-y-0.5",
                    isDarkMode
                      ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"
                      : "border-blue-200 bg-white/85 text-slate-800 hover:border-blue-300 hover:bg-white"
                  )}
                >
                  <BookOpen className="h-5 w-5" />
                  Preview the book
                </a>
              </div>

              <div className="mt-10 grid gap-4 sm:max-w-2xl sm:grid-cols-3">
                {[
                  "19 interview case studies",
                  "45-minute HLD playbook",
                  "APIs • DB • failures • trade-offs",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-extrabold sm:text-[15px]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-500">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    <span className={isDarkMode ? "text-slate-300" : "text-[#53637f]"}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mx-auto w-full max-w-[500px] lg:max-w-[520px]">
              <div className="relative mx-auto w-[78%] min-w-[250px] max-w-[390px] sm:w-[72%] lg:w-[80%]">
                <div className="absolute -inset-8 rounded-[42px] bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-violet-500/20 blur-3xl" />
                <div className="relative rotate-[-1.5deg] overflow-hidden rounded-[22px] border border-white/30 bg-[#101a38] shadow-[0_35px_80px_rgba(24,39,94,.32)]">
                  {bookCover ? (
                    <img
                      src={bookCover}
                      alt={`${productName} ebook cover`}
                      className="block h-auto w-full object-cover"
                      loading="eager"
                      fetchPriority="high"
                    />
                  ) : (
                    <div className="aspect-[0.72] bg-gradient-to-br from-[#122a63] via-[#183b7a] to-[#17204a] p-8 text-white">
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-200">The system design interview guide</p>
                      <h2 className="mt-12 text-4xl font-extrabold leading-none">MASTER SYSTEM DESIGN</h2>
                      <p className="mt-5 font-bold text-blue-200">High-Level Design</p>
                    </div>
                  )}
                </div>
              </div>

              <div className={cx("relative -mt-4 rounded-[24px] border p-5 shadow-xl backdrop-blur-xl sm:p-6", panel)}>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className={cx("text-xs font-extrabold uppercase tracking-[0.18em]", isDarkMode ? "text-blue-300" : "text-blue-600")}>
                      Digital PDF ebook
                    </p>
                    <div className="mt-2 flex flex-wrap items-end gap-2">
                      <span className="text-3xl font-extrabold">{formatMoney(currentPrice)}</span>
                      {mrp > currentPrice && (
                        <span className={cx("pb-1 text-sm font-bold line-through", isDarkMode ? "text-slate-500" : "text-slate-400")}>
                          {formatMoney(mrp)}
                        </span>
                      )}
                    </div>
                  </div>

                  {discount > 0 && (
                    <div className="rounded-full bg-emerald-500/12 px-3 py-1.5 text-xs font-extrabold text-emerald-500">
                      {discount}% OFF
                    </div>
                  )}
                </div>
                <p className={cx("mt-3 text-sm leading-6", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                  Instant access after successful payment. Digital purchases are non-refundable.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={cx("border-b", isDarkMode ? "border-white/10 bg-[#070b18]" : "border-slate-200 bg-white")}>
          <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
            {[
              ["19", "Case studies"],
              ["45 min", "Interview playbook"],
              ["9", "Steps per case"],
              ["Production", "Trade-off focused"],
            ].map(([value, label], index) => (
              <div
                key={label}
                className={cx(
                  "px-4 py-7 text-center",
                  index % 2 === 0 ? "border-r" : "",
                  index < 2 ? "border-b md:border-b-0" : "",
                  index === 1 ? "md:border-r" : "",
                  index === 2 ? "md:border-r" : "",
                  isDarkMode ? "border-white/10" : "border-slate-200"
                )}
              >
                <div className="text-2xl font-extrabold text-blue-500 sm:text-3xl">{value}</div>
                <div className={cx("mt-1 text-xs font-bold uppercase tracking-[0.12em] sm:text-sm", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>
        {!loadingLldProduct && lldProduct && (
          <section
            className={cx(
              "border-b py-8 sm:py-10",
              isDarkMode
                ? "border-white/10 bg-[#080f1f]"
                : "border-[#dbe5ef] bg-[#fbfcfe]"
            )}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <article
                className={cx(
                  "mx-auto w-full max-w-[820px] overflow-hidden rounded-[24px] border shadow-[0_16px_46px_rgba(27,61,103,.10)]",
                  isDarkMode
                    ? "border-[#36597f]/35 bg-[#0d1b32]"
                    : "border-[#c9d9e8] bg-white"
                )}
              >
                <div className="grid sm:grid-cols-[185px_minmax(0,1fr)]">
                  <div
                    className={cx(
                      "relative flex min-h-[230px] items-center justify-center overflow-hidden border-b p-4 sm:border-b-0 sm:border-r",
                      isDarkMode
                        ? "border-white/10 bg-[#112442]"
                        : "border-[#d6e2ee] bg-[#eaf3fa]"
                    )}
                  >
                    <span
                      className={cx(
                        "absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.13em]",
                        isDarkMode
                          ? "border-[#6b91bd]/30 bg-[#2b66a8]/12 text-[#a8c8ea]"
                          : "border-[#bed2e4] bg-white/90 text-[#2b66a8]"
                      )}
                    >
                      Java-first LLD
                    </span>

                    <span
                      className={cx(
                        "absolute -left-8 bottom-2 h-24 w-24 rounded-full blur-2xl",
                        isDarkMode ? "bg-[#78ad83]/10" : "bg-[#dfeee2]"
                      )}
                    />
                    <span
                      className={cx(
                        "absolute -right-6 top-12 h-20 w-20 rounded-full blur-2xl",
                        isDarkMode ? "bg-[#8b6bb8]/10" : "bg-[#eee7f6]"
                      )}
                    />

                    {lldCover ? (
                      <img
                        src={lldCover}
                        alt={`${lldTitle} ebook cover`}
                        loading="lazy"
                        decoding="async"
                        className="relative z-10 max-h-[190px] w-auto max-w-[130px] rounded-[10px] object-contain shadow-[0_14px_28px_rgba(15,23,42,.18)] ring-1 ring-black/5"
                      />
                    ) : (
                      <div className="relative z-10 flex aspect-[0.72] w-full max-w-[130px] flex-col justify-between rounded-[12px] bg-[#244f88] p-4 text-white shadow-xl">
                        <div>
                          <p className="text-[7px] font-extrabold uppercase tracking-[0.16em] text-[#cadcf0]">
                            Java Interview Guide
                          </p>
                          <h3 className="mt-4 text-xl font-extrabold leading-[1.05] tracking-[-0.035em]">
                            Master
                            <br />
                            System
                            <br />
                            Design
                          </h3>
                        </div>
                        <p className="text-[9px] font-bold text-[#d9e6f5]">
                          LLD • Java
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={cx(
                          "rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em]",
                          isDarkMode
                            ? "border-[#5f86b2]/25 bg-[#2b66a8]/10 text-[#a6c7ea]"
                            : "border-[#bfd2e4] bg-[#e8f2f9] text-[#2b66a8]"
                        )}
                      >
                        Low-Level Design
                      </span>

                      <span
                        className={cx(
                          "rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em]",
                          isDarkMode
                            ? "border-[#78ad83]/25 bg-[#78ad83]/10 text-[#a9d3b1]"
                            : "border-[#c9e0ce] bg-[#eaf5ec] text-[#477d52]"
                        )}
                      >
                        Java
                      </span>

                      {lldDiscount > 0 && (
                        <span
                          className={cx(
                            "rounded-full border px-2.5 py-1 text-[9px] font-extrabold",
                            isDarkMode
                              ? "border-[#e2ad62]/25 bg-[#e2ad62]/10 text-[#f0c98e]"
                              : "border-[#efd7b2] bg-[#fff0dc] text-[#9c651f]"
                          )}
                        >
                          {lldDiscount}% OFF
                        </span>
                      )}
                    </div>

                    <p
                      className={cx(
                        "mt-3 text-[10px] font-extrabold uppercase tracking-[0.14em]",
                        isDarkMode ? "text-[#aabbd1]" : "text-[#657b94]"
                      )}
                    >
                      Complete both sides of system-design interviews
                    </p>

                    <h3
                      className={cx(
                        "mt-1.5 text-xl font-extrabold leading-tight tracking-[-0.035em] sm:text-[1.45rem]",
                        isDarkMode ? "text-white" : "text-[#17223a]"
                      )}
                    >
                      {lldTitle}
                    </h3>

                    <p
                      className={cx(
                        "mt-1 text-xs font-bold sm:text-sm",
                        isDarkMode ? "text-[#9bc0ea]" : "text-[#2b66a8]"
                      )}
                    >
                      {lldSubtitle}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {[
                        {
                          label: "Object modelling",
                          light: "border-[#bdd4e7] bg-[#eaf3fa] text-[#285f95]",
                          dark: "border-[#4773a1]/25 bg-[#2b66a8]/10 text-[#a9c8e8]",
                        },
                        {
                          label: "OOP + SOLID",
                          light: "border-[#cae1ce] bg-[#ebf6ed] text-[#477d52]",
                          dark: "border-[#78ad83]/25 bg-[#78ad83]/10 text-[#acd5b4]",
                        },
                        {
                          label: "Design patterns",
                          light: "border-[#efd8b8] bg-[#fff2df] text-[#9d6621]",
                          dark: "border-[#e2ad62]/25 bg-[#e2ad62]/10 text-[#efc98f]",
                        },
                        {
                          label: "LLD problems",
                          light: "border-[#ddd2eb] bg-[#f3eff8] text-[#6d58a0]",
                          dark: "border-[#8b6bb8]/25 bg-[#8b6bb8]/10 text-[#c8bae0]",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={cx(
                            "flex min-h-[36px] items-center gap-2 rounded-[10px] border px-2.5 py-2",
                            isDarkMode ? item.dark : item.light
                          )}
                        >
                          <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
                          <span className="text-[10px] font-bold leading-4 sm:text-[11px]">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-end gap-2">
                        <span
                          className={cx(
                            "text-xl font-extrabold tracking-[-0.035em]",
                            isDarkMode ? "text-white" : "text-[#17223a]"
                          )}
                        >
                          {formatMoney(lldCurrentPrice, lldCurrency)}
                        </span>

                        {lldMrp > lldCurrentPrice && (
                          <span
                            className={cx(
                              "pb-0.5 text-[10px] font-bold line-through",
                              isDarkMode ? "text-slate-600" : "text-[#95a0ad]"
                            )}
                          >
                            {formatMoney(lldMrp, lldCurrency)}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:w-auto">
                        <button
                          type="button"
                          onClick={handleLldBuyNow}
                          disabled={!lldProduct?._id}
                          className="group inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[11px] bg-[#2b66a8] px-4 text-[11px] font-extrabold text-white shadow-[0_7px_16px_rgba(43,102,168,.18)] transition hover:-translate-y-0.5 hover:bg-[#24598f] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Buy LLD
                          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                        </button>

                        <a
                          href={LLD_REDIRECT_URL}
                          className={cx(
                            "group inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[11px] border px-4 text-[11px] font-extrabold transition hover:-translate-y-0.5",
                            isDarkMode
                              ? "border-[#6b86a5]/30 bg-[#172941] text-[#b4cde8] hover:bg-[#1b304d]"
                              : "border-[#c5d5e5] bg-white text-[#2b66a8] hover:bg-[#eef5fa]"
                          )}
                        >
                          Details
                          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </section>
        )}


        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <SectionHeader
            eyebrow="One repeatable framework"
            title="Every case study follows the same interview-ready structure"
            description="The point is not to memorize 19 diagrams. The point is to build one reasoning process you can reuse when the interviewer changes the product, scale or constraint."
            dark={isDarkMode}
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {caseStudyFramework.map((item) => (
              <article
                key={item.number}
                className={cx("rounded-[24px] border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:p-6", panel)}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm font-extrabold tracking-[0.16em] text-blue-500">{item.number}</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-blue-500/40 to-transparent" />
                </div>
                <h3 className="mt-5 text-xl font-extrabold tracking-tight">{item.title}</h3>
                <p className={cx("mt-2 text-sm leading-6", isDarkMode ? "text-slate-400" : "text-slate-600")}>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={cx("border-y py-16 sm:py-20 lg:py-24", isDarkMode ? "border-white/10 bg-[#0a1021]" : "border-indigo-100 bg-[#f6f8ff]")}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="The 45-minute interview plan"
              title="Know what to do with every minute"
              description="A system-design round feels less chaotic when you have a fixed order: scope first, estimate quickly, define interfaces, draw the system, then spend most of the interview on the genuinely hard parts."
              dark={isDarkMode}
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {interviewPlaybook.map((item, index) => (
                <article key={item.title} className={cx("relative overflow-hidden rounded-[24px] border p-6", panel)}>
                  <div className="absolute right-4 top-3 text-6xl font-extrabold tracking-tighter text-blue-500/[0.06]">{formatTwoDigits(index + 1)}</div>
                  <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.15em] text-blue-500">
                    {item.time}
                  </span>
                  <h3 className="mt-5 text-xl font-extrabold">{item.title}</h3>
                  <p className={cx("mt-2 text-sm leading-6", isDarkMode ? "text-slate-400" : "text-slate-600")}>{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <SectionHeader
            eyebrow="Core toolkit"
            title="The building blocks that keep appearing in strong HLD answers"
            description="Instead of learning Redis, Kafka, databases and CDN as isolated definitions, the page connects them to the exact problem they solve inside a production design."
            dark={isDarkMode}
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {buildingBlocks.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className={cx("group rounded-[24px] border p-5 transition hover:-translate-y-1 hover:shadow-xl", panel)}>
                  <div className={cx("flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", item.accent)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-extrabold">{item.title}</h3>
                  <p className={cx("mt-2 text-sm leading-6", isDarkMode ? "text-slate-400" : "text-slate-600")}>{item.copy}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className={cx("border-y py-16 sm:py-20 lg:py-24", isDarkMode ? "border-white/10 bg-[#080e1d]" : "border-slate-200 bg-[#fbfcff]")}> 
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="What the handbook actually teaches"
              title="From the first clarification question to production failure handling"
              description="The book is organized around the decisions you need to make in an interview. Each topic is tied to a real architecture problem rather than presented as an isolated definition."
              dark={isDarkMode}
            />

            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              {chapterCoverage.map((item) => {
                const tone = getTone(item.tone, isDarkMode);
                return (
                  <article
                    key={item.number}
                    className={cx(
                      "relative overflow-hidden rounded-[28px] border p-6 sm:p-7",
                      tone.border,
                      tone.soft
                    )}
                  >
                    <div className={cx("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", tone.line)} />
                    <div className="flex items-start gap-4">
                      <div className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-extrabold text-white shadow-lg", tone.icon)}>
                        {item.number}
                      </div>
                      <div>
                        <p className={cx("text-xs font-extrabold uppercase tracking-[0.18em]", tone.text)}>
                          {item.subtitle}
                        </p>
                        <h3 className="mt-2 text-xl font-extrabold tracking-[-0.02em] sm:text-2xl">
                          {item.title}
                        </h3>
                      </div>
                    </div>

                    <p className={cx("mt-5 text-sm leading-7 sm:text-[15px]", isDarkMode ? "text-slate-300" : "text-slate-600")}>
                      {item.description}
                    </p>

                    <div className="mt-5 grid gap-2.5">
                      {item.bullets.map((bullet) => (
                        <div key={bullet} className="flex items-start gap-3">
                          <span className={cx("mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full", tone.chip)}>
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                          <span className={cx("text-sm leading-6", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                            {bullet}
                          </span>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <SectionHeader
            eyebrow="Scale changes the design"
            title="Numbers from the case studies, not generic architecture claims"
            description="The handbook uses concrete traffic and storage estimates so you can explain why a cache, partitioning strategy, connection model or consistency guarantee is actually needed."
            dark={isDarkMode}
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {scaleSnapshots.map((item) => {
              const tone = getTone(item.tone, isDarkMode);
              return (
                <article key={item.system} className={cx("rounded-[26px] border p-5", tone.border, tone.soft)}>
                  <p className={cx("text-xs font-extrabold uppercase tracking-[0.16em]", tone.text)}>{item.system}</p>
                  <div className="mt-3 text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">{item.number}</div>
                  <p className={cx("mt-3 text-sm leading-6", isDarkMode ? "text-slate-400" : "text-slate-600")}>{item.detail}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className={cx("border-y py-16 sm:py-20 lg:py-24", isDarkMode ? "border-white/10 bg-[#0a1021]" : "border-indigo-100 bg-[#f7f9ff]")}> 
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Architecture decisions"
              title="Know why a component belongs in the diagram"
              description="A strong HLD answer is not a collection of logos. These cards summarize the decision logic repeated across the book."
              dark={isDarkMode}
            />

            <div className="mt-10 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {architectureDecisions.map((item) => {
                const tone = getTone(item.tone, isDarkMode);
                return (
                  <article key={item.title} className={cx("rounded-[26px] border p-6", tone.border, isDarkMode ? "bg-white/[0.025]" : "bg-white")}>
                    <div className={cx("h-1.5 w-16 rounded-full bg-gradient-to-r", tone.line)} />
                    <h3 className="mt-5 text-xl font-extrabold tracking-[-0.02em]">{item.title}</h3>
                    <p className={cx("mt-3 text-sm font-semibold leading-6", tone.text)}>{item.use}</p>
                    <p className={cx("mt-3 text-sm leading-7", isDarkMode ? "text-slate-400" : "text-slate-600")}>{item.reason}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {item.examples.map((example) => (
                        <span key={example} className={cx("rounded-full px-3 py-1.5 text-xs font-semibold", tone.chip)}>{example}</span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <SectionHeader
            eyebrow="Trade-offs interviewers expect"
            title="The answer is usually ‘it depends’ — but you must explain what it depends on"
            description="The book repeatedly compares realistic alternatives and then ties the choice back to latency, correctness, cost, scale or product behavior."
            dark={isDarkMode}
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {tradeoffCards.map((item) => {
              const tone = getTone(item.tone, isDarkMode);
              return (
                <article key={item.title} className={cx("rounded-[28px] border p-6 sm:p-7", tone.border, isDarkMode ? "bg-white/[0.025]" : "bg-white")}>
                  <div className="flex items-center gap-3">
                    <div className={cx("h-2.5 w-2.5 rounded-full bg-gradient-to-br", tone.icon)} />
                    <h3 className="text-xl font-extrabold tracking-[-0.02em]">{item.title}</h3>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className={cx("rounded-2xl border p-4 text-sm leading-6", tone.border, tone.soft)}>{item.left}</div>
                    <div className={cx("rounded-2xl border p-4 text-sm leading-6", tone.border, tone.soft)}>{item.right}</div>
                  </div>
                  <div className={cx("mt-4 rounded-2xl px-4 py-3 text-sm font-semibold", tone.chip)}>{item.takeaway}</div>
                </article>
              );
            })}
          </div>
        </section>

        <section className={cx("border-y py-16 sm:py-20 lg:py-24", isDarkMode ? "border-white/10 bg-[#080e1d]" : "border-slate-200 bg-[#fbfcff]")}> 
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Inside the hardest designs"
              title="Detailed case-study spotlights from the handbook"
              description="These are the parts that usually decide whether an HLD discussion stays superficial or becomes production-grade: routing, concurrency, idempotency, state transitions and recovery."
              dark={isDarkMode}
            />

            <div className="mt-10 space-y-5">
              {caseStudySpotlights.map((item) => {
                const tone = getTone(item.tone, isDarkMode);
                return (
                  <article key={item.caseNo} className={cx("overflow-hidden rounded-[30px] border", tone.border, isDarkMode ? "bg-white/[0.025]" : "bg-white")}>
                    <div className={cx("h-1.5 bg-gradient-to-r", tone.line)} />
                    <div className="grid gap-7 p-6 lg:grid-cols-[.8fr_1.2fr] lg:p-8">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className={cx("rounded-full px-3 py-1 text-xs font-extrabold tracking-[0.15em]", tone.chip)}>CASE {item.caseNo}</span>
                          <span className={cx("text-xs font-semibold uppercase tracking-[0.12em]", tone.text)}>{item.subtitle}</span>
                        </div>
                        <h3 className="mt-4 text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">Design {item.title}</h3>
                        <p className={cx("mt-4 text-sm font-semibold leading-6", tone.text)}>{item.scale}</p>
                        <div className={cx("mt-5 rounded-2xl border p-4", tone.border, tone.soft)}>
                          <p className="text-xs font-extrabold uppercase tracking-[0.14em]">Hard part</p>
                          <p className={cx("mt-2 text-sm leading-6", isDarkMode ? "text-slate-300" : "text-slate-700")}>{item.hardPart}</p>
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                          {item.concepts.map((concept) => (
                            <span key={concept} className={cx("rounded-full px-3 py-1.5 text-xs font-semibold", tone.chip)}>{concept}</span>
                          ))}
                        </div>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div className={cx("rounded-[24px] border p-5", tone.border, isDarkMode ? "bg-black/10" : "bg-slate-50/70")}>
                          <p className={cx("text-xs font-extrabold uppercase tracking-[0.16em]", tone.text)}>Request / state flow</p>
                          <div className="mt-4 space-y-3">
                            {item.flow.map((step, index) => (
                              <div key={step} className="flex items-start gap-3">
                                <span className={cx("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold", tone.chip)}>{index + 1}</span>
                                <span className={cx("text-sm leading-6", isDarkMode ? "text-slate-300" : "text-slate-700")}>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={cx("rounded-[24px] border p-5", tone.border, isDarkMode ? "bg-black/10" : "bg-slate-50/70")}>
                          <p className={cx("text-xs font-extrabold uppercase tracking-[0.16em]", tone.text)}>Failure handling</p>
                          <div className="mt-4 space-y-3">
                            {item.failures.map((failure) => (
                              <div key={failure} className="flex items-start gap-3">
                                <ShieldCheck className={cx("mt-0.5 h-5 w-5 shrink-0", tone.text)} />
                                <span className={cx("text-sm leading-6", isDarkMode ? "text-slate-300" : "text-slate-700")}>{failure}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <SectionHeader
            eyebrow="Production patterns repeated across the book"
            title="Patterns you can reuse when the interview problem changes"
            description="Instead of memorizing only named systems, learn the cross-cutting ideas that appear again and again in reliable distributed architectures."
            dark={isDarkMode}
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {productionPatterns.map((item) => {
              const tone = getTone(item.tone, isDarkMode);
              return (
                <article key={item.title} className={cx("rounded-[24px] border p-5", tone.border, tone.soft)}>
                  <div className={cx("h-1.5 w-12 rounded-full bg-gradient-to-r", tone.line)} />
                  <h3 className="mt-4 text-lg font-extrabold tracking-[-0.015em]">{item.title}</h3>
                  <p className={cx("mt-2 text-sm leading-6", isDarkMode ? "text-slate-400" : "text-slate-600")}>{item.copy}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className={cx("border-y py-16 sm:py-20 lg:py-24", isDarkMode ? "border-white/10 bg-[#0a1021]" : "border-indigo-100 bg-[#f8f9ff]")}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="19 complete case studies"
              title="Practice the problems interviewers keep coming back to"
              description="All 19 use cases from the handbook are kept intact. Each card highlights the core architecture problem so visitors immediately understand what they will practice."
              dark={isDarkMode}
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {caseStudies.map((item, index) => {
                const palette = ["blue", "indigo", "cyan", "violet", "emerald", "sky", "rose", "amber"];
                const tone = getTone(palette[index % palette.length], isDarkMode);
                return (
                  <article
                    key={item.number}
                    className={cx(
                      "group relative overflow-hidden rounded-[26px] border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl",
                      tone.border,
                      isDarkMode ? "bg-white/[0.025]" : "bg-white"
                    )}
                  >
                    <div className={cx("absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-90", tone.line)} />
                    <div className="flex items-center justify-between gap-4">
                      <span className={cx("text-sm font-extrabold tracking-[0.18em]", tone.text)}>CASE {item.number}</span>
                      <div className={cx("flex h-9 w-9 items-center justify-center rounded-xl", tone.chip)}>
                        <Code2 className="h-4 w-4" />
                      </div>
                    </div>
                    <h3 className="mt-5 text-2xl font-extrabold tracking-[-0.025em]">Design {item.title}</h3>
                    <p className={cx("mt-1 text-sm font-semibold", tone.text)}>{item.subtitle}</p>
                    <p className={cx("mt-4 text-sm leading-6", isDarkMode ? "text-slate-400" : "text-slate-600")}>{item.summary}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span key={tag} className={cx("rounded-full px-3 py-1.5 text-xs font-semibold", tone.chip)}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="book-preview" className="mx-auto max-w-7xl scroll-mt-24 px-3 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <SectionHeader
            eyebrow="Real book preview"
            title="Every preview page is rendered as a normal page image"
            description="There is no embedded PDF toolbar and no internal PDF scroller. The browser renders each PDF page to an image and places the pages directly in the normal website flow, so mobile and desktop users simply scroll the page."
            dark={isDarkMode}
          />

          <div className={cx("mt-10 rounded-[30px] border p-3 sm:p-5 lg:p-7", softPanel)}>
            <div className={cx("flex flex-col gap-4 rounded-[22px] border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5", isDarkMode ? "border-white/10 bg-white/[0.025]" : "border-blue-100 bg-white")}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-extrabold tracking-[-0.01em]">Mastering System Design — HLD Preview</p>
                  <p className={cx("mt-1 text-xs font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                    {previewLoading
                      ? "Rendering preview pages…"
                      : previewTotalPages
                      ? `${previewTotalPages} preview pages `
                      : "Preview pages"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-500">Mastering System Design</span>
                <span className="rounded-full bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-500">HLD Preview</span>
              </div>
            </div>

            {previewLoading && previewImages.length === 0 && (
              <div className="mt-5 space-y-6">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className={cx(
                      "mx-auto aspect-[0.707] w-full max-w-[920px] animate-pulse rounded-[18px]",
                      isDarkMode ? "bg-white/[0.05]" : "bg-white"
                    )}
                  />
                ))}
              </div>
            )}

            {previewError && previewImages.length === 0 && (
              <div className={cx("mx-auto mt-5 max-w-2xl rounded-[22px] border p-6 text-center", panel)}>
                <BookOpen className="mx-auto h-9 w-9 text-blue-500" />
                <p className="mt-3 font-extrabold">Preview could not be rendered</p>
                <p className={cx("mt-2 text-sm leading-6", isDarkMode ? "text-slate-400" : "text-slate-600")}>
                  {previewError || "Check the preview PDF path and pdf.js worker configuration."}
                </p>
              </div>
            )}

            {previewImages.length > 0 && (
              <div className="mt-5 space-y-7 sm:mt-7 sm:space-y-10">
                {previewImages.map((page) => (
                  <article key={page.pageNumber} className="mx-auto w-full max-w-[940px]">
                    <div className="mb-2.5 flex items-center justify-between px-1">
                      <span className={cx("text-[11px] font-semibold uppercase tracking-[0.16em]", isDarkMode ? "text-slate-500" : "text-slate-500")}>
                        Preview page {formatTwoDigits(page.pageNumber)}
                      </span>
                      <span className={cx("text-[11px] font-medium", isDarkMode ? "text-slate-600" : "text-slate-400")}>
                        {page.pageNumber} / {previewTotalPages}
                      </span>
                    </div>

                    <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_20px_55px_rgba(15,23,42,.14)] ring-1 ring-black/5">
                      <img
                        src={page.src}
                        alt={`Mastering System Design HLD preview page ${page.pageNumber}`}
                        width={page.width}
                        height={page.height}
                        loading={page.pageNumber <= 2 ? "eager" : "lazy"}
                        decoding="async"
                        className="block h-auto w-full bg-white"
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className={cx("border-y py-16 sm:py-20 lg:py-24", isDarkMode ? "border-white/10 bg-[#0a1021]" : "border-indigo-100 bg-[#f7f9ff]")}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="Production-level deep dives"
              title="The book goes beyond drawing boxes"
              description="The strongest HLD discussion happens after the diagram: collision handling, ordering, concurrency, idempotency, hot keys, failover and the trade-off between correctness and availability."
              dark={isDarkMode}
            />

            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              {deepDives.map((item, index) => {
                const palette = ["blue", "indigo", "cyan", "rose", "violet", "emerald"];
                const tone = getTone(palette[index % palette.length], isDarkMode);
                return (
                  <article key={item.title} className={cx("rounded-[26px] border p-6 sm:p-7", tone.border, isDarkMode ? "bg-white/[0.025]" : "bg-white")}>
                    <p className={cx("text-xs font-extrabold uppercase tracking-[0.18em]", tone.text)}>{item.kicker}</p>
                    <h3 className="mt-3 text-2xl font-extrabold tracking-[-0.025em]">{item.title}</h3>
                    <p className={cx("mt-3 text-sm leading-7 sm:text-base", isDarkMode ? "text-slate-400" : "text-slate-600")}>{item.copy}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {item.chips.map((chip) => (
                        <span key={chip} className={cx("rounded-full px-3 py-1.5 text-xs font-semibold", tone.chip)}>{chip}</span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <SectionHeader
            eyebrow="Who this is for"
            title="Built for engineers who want a system, not another list of buzzwords"
            description="The content is designed around interview reasoning and production trade-offs, with enough repetition in structure to make revision fast."
            dark={isDarkMode}
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {audience.map((item, index) => (
              <article key={item.title} className={cx("rounded-[24px] border p-6", panel)}>
                <span className="text-sm font-extrabold text-blue-500">0{index + 1}</span>
                <h3 className="mt-4 text-xl font-extrabold">{item.title}</h3>
                <p className={cx("mt-3 text-sm leading-6", isDarkMode ? "text-slate-400" : "text-slate-600")}>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="lld-book"
          className={cx(
            "relative overflow-hidden border-y py-12 sm:py-14 lg:py-16",
            isDarkMode
              ? "border-white/10 bg-[#081326]"
              : "border-[#d9e4ef] bg-[#f8fafc]"
          )}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className={cx(
                "absolute -left-14 top-0 h-44 w-44 rounded-full blur-3xl",
                isDarkMode ? "bg-[#2b66a8]/10" : "bg-[#dcecf8]/80"
              )}
            />
            <div
              className={cx(
                "absolute -right-10 bottom-0 h-44 w-44 rounded-full blur-3xl",
                isDarkMode ? "bg-[#8b6bb8]/10" : "bg-[#eee7f6]/85"
              )}
            />
          </div>

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mx-auto max-w-xl text-center">
              <p
                className={cx(
                  "text-[11px] font-extrabold uppercase tracking-[0.18em]",
                  isDarkMode ? "text-[#9bc0ea]" : "text-[#2b66a8]"
                )}
              >
                Also prepare Low-Level Design
              </p>

              <h2
                className={cx(
                  "hld-display mt-2 text-2xl font-extrabold leading-tight tracking-[-0.035em] sm:text-[2rem]",
                  isDarkMode ? "text-white" : "text-[#17223a]"
                )}
              >
                Continue with the Java-first LLD handbook
              </h2>

              <p
                className={cx(
                  "mx-auto mt-2 max-w-lg text-sm leading-6",
                  isDarkMode ? "text-slate-400" : "text-[#68778b]"
                )}
              >
                Object modelling, OOP, SOLID, patterns and complete interview
                problems — in the same interview-first style.
              </p>
            </div>

            {loadingLldProduct && (
              <div
                className={cx(
                  "mx-auto mt-7 grid w-full max-w-[760px] gap-4 rounded-[24px] border p-4 shadow-[0_16px_45px_rgba(24,56,96,.08)] sm:grid-cols-[150px_minmax(0,1fr)]",
                  isDarkMode
                    ? "border-white/10 bg-[#0d1b32]"
                    : "border-[#cad9e8] bg-white"
                )}
              >
                <div
                  className={cx(
                    "mx-auto aspect-[0.72] w-full max-w-[145px] animate-pulse rounded-[16px]",
                    isDarkMode ? "bg-white/[0.06]" : "bg-[#e7f0f8]"
                  )}
                />
                <div className="flex flex-col justify-center">
                  <div
                    className={cx(
                      "h-4 w-32 animate-pulse rounded-full",
                      isDarkMode ? "bg-white/[0.06]" : "bg-[#e7f0f8]"
                    )}
                  />
                  <div
                    className={cx(
                      "mt-3 h-7 w-full max-w-sm animate-pulse rounded-lg",
                      isDarkMode ? "bg-white/[0.06]" : "bg-[#edf2f7]"
                    )}
                  />
                  <div
                    className={cx(
                      "mt-3 h-14 w-full animate-pulse rounded-xl",
                      isDarkMode ? "bg-white/[0.05]" : "bg-[#f2f5f8]"
                    )}
                  />
                  <div className="mt-4 flex gap-2">
                    <div className="h-10 w-28 animate-pulse rounded-xl bg-[#2b66a8]/20" />
                    <div
                      className={cx(
                        "h-10 w-28 animate-pulse rounded-xl",
                        isDarkMode ? "bg-white/[0.05]" : "bg-[#eef2f6]"
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {!loadingLldProduct && lldProduct && (
              <article
                className={cx(
                  "mx-auto mt-7 w-full max-w-[760px] overflow-hidden rounded-[24px] border shadow-[0_18px_50px_rgba(30,64,110,.10)]",
                  isDarkMode
                    ? "border-[#35577f]/35 bg-[#0d1b32]"
                    : "border-[#c8d8e8] bg-white"
                )}
              >
                <div className="grid sm:grid-cols-[175px_minmax(0,1fr)]">
                  <div
                    className={cx(
                      "relative flex min-h-[245px] items-center justify-center overflow-hidden border-b p-4 sm:border-b-0 sm:border-r",
                      isDarkMode
                        ? "border-white/10 bg-[#112442]"
                        : "border-[#d4e1ed] bg-[#eaf3fa]"
                    )}
                  >
                    <div
                      className={cx(
                        "absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.13em]",
                        isDarkMode
                          ? "border-[#6b91bd]/30 bg-[#2b66a8]/12 text-[#a8c8ea]"
                          : "border-[#bcd1e3] bg-white/90 text-[#2b66a8]"
                      )}
                    >
                      Java-first LLD
                    </div>

                    <span
                      className={cx(
                        "absolute -left-7 bottom-5 h-20 w-20 rounded-full blur-2xl",
                        isDarkMode ? "bg-[#78ad83]/10" : "bg-[#dfeee2]"
                      )}
                    />
                    <span
                      className={cx(
                        "absolute -right-7 top-10 h-20 w-20 rounded-full blur-2xl",
                        isDarkMode ? "bg-[#e2ad62]/10" : "bg-[#f7ead7]"
                      )}
                    />

                    {lldCover ? (
                      <img
                        src={lldCover}
                        alt={`${lldTitle} ebook cover`}
                        loading="lazy"
                        decoding="async"
                        className="relative z-10 max-h-[205px] w-auto max-w-[135px] rounded-[10px] object-contain shadow-[0_14px_30px_rgba(15,23,42,.18)] ring-1 ring-black/5"
                      />
                    ) : (
                      <div className="relative z-10 flex aspect-[0.72] w-full max-w-[135px] flex-col justify-between rounded-[12px] bg-[#244f88] p-4 text-white shadow-xl">
                        <div>
                          <p className="text-[7px] font-extrabold uppercase tracking-[0.16em] text-[#cadcf0]">
                            The Java Interview Guide
                          </p>
                          <h3 className="mt-4 text-xl font-extrabold leading-[1.05] tracking-[-0.035em]">
                            Master
                            <br />
                            System
                            <br />
                            Design
                          </h3>
                        </div>
                        <p className="text-[9px] font-bold text-[#d9e6f5]">
                          LLD • Java
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={cx(
                          "rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em]",
                          isDarkMode
                            ? "border-[#5f86b2]/25 bg-[#2b66a8]/10 text-[#a6c7ea]"
                            : "border-[#bed1e4] bg-[#e7f1f9] text-[#2b66a8]"
                        )}
                      >
                        LLD
                      </span>

                      <span
                        className={cx(
                          "rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em]",
                          isDarkMode
                            ? "border-[#78ad83]/25 bg-[#78ad83]/10 text-[#a9d3b1]"
                            : "border-[#c9e0ce] bg-[#e9f5eb] text-[#477d52]"
                        )}
                      >
                        Java
                      </span>

                      {lldDiscount > 0 && (
                        <span
                          className={cx(
                            "rounded-full border px-2.5 py-1 text-[9px] font-extrabold",
                            isDarkMode
                              ? "border-[#e2ad62]/25 bg-[#e2ad62]/10 text-[#f0c98e]"
                              : "border-[#efd7b2] bg-[#fff0dc] text-[#9c651f]"
                          )}
                        >
                          {lldDiscount}% OFF
                        </span>
                      )}
                    </div>

                    <h3
                      className={cx(
                        "mt-3 text-xl font-extrabold leading-tight tracking-[-0.035em] sm:text-[1.45rem]",
                        isDarkMode ? "text-white" : "text-[#17223a]"
                      )}
                    >
                      {lldTitle}
                    </h3>

                    <p
                      className={cx(
                        "mt-1 text-xs font-bold sm:text-sm",
                        isDarkMode ? "text-[#9bc0ea]" : "text-[#2b66a8]"
                      )}
                    >
                      {lldSubtitle}
                    </p>

                    <p
                      className={cx(
                        "mt-2 line-clamp-2 text-xs leading-5 sm:text-sm",
                        isDarkMode ? "text-slate-400" : "text-[#68778b]"
                      )}
                    >
                      {lldDescription}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {[
                        {
                          label: "Object modelling",
                          light: "border-[#bcd4e8] bg-[#e9f3fa] text-[#285f95]",
                          dark: "border-[#4773a1]/25 bg-[#2b66a8]/10 text-[#a9c8e8]",
                        },
                        {
                          label: "OOP + SOLID",
                          light: "border-[#cae1ce] bg-[#ebf6ed] text-[#477d52]",
                          dark: "border-[#78ad83]/25 bg-[#78ad83]/10 text-[#acd5b4]",
                        },
                        {
                          label: "Design patterns",
                          light: "border-[#efd8b8] bg-[#fff2df] text-[#9d6621]",
                          dark: "border-[#e2ad62]/25 bg-[#e2ad62]/10 text-[#efc98f]",
                        },
                        {
                          label: "LLD problems",
                          light: "border-[#ddd2eb] bg-[#f3eff8] text-[#6d58a0]",
                          dark: "border-[#8b6bb8]/25 bg-[#8b6bb8]/10 text-[#c8bae0]",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={cx(
                            "flex min-h-[38px] items-center gap-2 rounded-[11px] border px-2.5 py-2",
                            isDarkMode ? item.dark : item.light
                          )}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/10">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                          <span className="text-[11px] font-bold leading-4 sm:text-xs">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {lldMetaItems.slice(0, 2).map((item) => (
                        <span
                          key={item}
                          className={cx(
                            "rounded-full border px-2.5 py-1 text-[9px] font-semibold",
                            isDarkMode
                              ? "border-white/10 bg-white/[0.04] text-slate-400"
                              : "border-[#dce4ec] bg-[#f7f9fb] text-[#6e7d90]"
                          )}
                        >
                          {item}
                        </span>
                      ))}

                      {lldCategoryPills.slice(0, 2).map((category) => (
                        <span
                          key={category}
                          className={cx(
                            "rounded-full border px-2.5 py-1 text-[9px] font-semibold",
                            isDarkMode
                              ? "border-[#8b6bb8]/25 bg-[#8b6bb8]/10 text-[#c8bae0]"
                              : "border-[#ddd2eb] bg-[#f3eff8] text-[#6d58a0]"
                          )}
                        >
                          {category}
                        </span>
                      ))}
                    </div>

                    <div
                      className={cx(
                        "mt-4 rounded-[14px] border p-3",
                        isDarkMode
                          ? "border-[#466789]/30 bg-[#10223d]"
                          : "border-[#d2dfeb] bg-[#f7fafc]"
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p
                            className={cx(
                              "text-[8px] font-extrabold uppercase tracking-[0.14em]",
                              isDarkMode ? "text-slate-500" : "text-[#7b8999]"
                            )}
                          >
                            Ebook price
                          </p>

                          <div className="mt-1 flex items-end gap-2">
                            <span
                              className={cx(
                                "text-xl font-extrabold tracking-[-0.035em]",
                                isDarkMode ? "text-white" : "text-[#17223a]"
                              )}
                            >
                              {formatMoney(lldCurrentPrice, lldCurrency)}
                            </span>

                            {lldMrp > lldCurrentPrice && (
                              <span
                                className={cx(
                                  "pb-0.5 text-[10px] font-bold line-through",
                                  isDarkMode ? "text-slate-600" : "text-[#95a0ad]"
                                )}
                              >
                                {formatMoney(lldMrp, lldCurrency)}
                              </span>
                            )}
                          </div>
                        </div>

                        <span
                          className={cx(
                            "rounded-full border px-2.5 py-1 text-[9px] font-semibold",
                            isDarkMode
                              ? "border-[#8fb0d3]/15 bg-[#2b66a8]/8 text-[#a8c7e7]"
                              : "border-[#cad9e8] bg-[#eaf3fa] text-[#426b94]"
                          )}
                        >
                          Digital PDF
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleLldBuyNow}
                          disabled={!lldProduct?._id}
                          className="group inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[11px] bg-[#2b66a8] px-3 text-[11px] font-extrabold text-white shadow-[0_7px_16px_rgba(43,102,168,.20)] transition hover:-translate-y-0.5 hover:bg-[#24598f] disabled:cursor-not-allowed disabled:opacity-60 sm:text-xs"
                        >
                          Buy LLD
                          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                        </button>

                        <a
                          href={LLD_REDIRECT_URL}
                          className={cx(
                            "group inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[11px] border px-3 text-[11px] font-extrabold transition hover:-translate-y-0.5 sm:text-xs",
                            isDarkMode
                              ? "border-[#6b86a5]/30 bg-[#172941] text-[#b4cde8] hover:bg-[#1b304d]"
                              : "border-[#c5d5e5] bg-white text-[#2b66a8] hover:bg-[#eef5fa]"
                          )}
                        >
                          See details
                          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )}

            {!loadingLldProduct && !lldProduct && (
              <div
                className={cx(
                  "mx-auto mt-7 w-full max-w-[680px] rounded-[20px] border p-4 shadow-sm",
                  isDarkMode
                    ? "border-[#45668d]/30 bg-[#0d1b32]"
                    : "border-[#cedbea] bg-white"
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p
                      className={cx(
                        "text-sm font-extrabold",
                        isDarkMode ? "text-white" : "text-[#17223a]"
                      )}
                    >
                      Explore the Java LLD handbook
                    </p>
                    <p
                      className={cx(
                        "mt-1 text-xs leading-5",
                        isDarkMode ? "text-slate-400" : "text-[#68778b]"
                      )}
                    >
                      {lldProductError ||
                        "Live LLD product details could not be loaded right now."}
                    </p>
                  </div>

                  <a
                    href={LLD_REDIRECT_URL}
                    className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 rounded-[11px] bg-[#2b66a8] px-3.5 text-[11px] font-extrabold text-white shadow-[0_7px_16px_rgba(43,102,168,.18)] transition hover:bg-[#24598f]"
                  >
                    See LLD details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

                <section className={cx("border-y py-16 sm:py-20 lg:py-24", isDarkMode ? "border-white/10 bg-[#0a1021]" : "border-indigo-100 bg-[#f7f9ff]")}>
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              eyebrow="FAQ"
              title="Before you get the HLD handbook"
              description="Quick answers about the format, preview and what is covered."
              dark={isDarkMode}
            />

            <div className="mt-10 space-y-3">
              {faqs.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <article key={item.q} className={cx("overflow-hidden rounded-[22px] border", panel)}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                    >
                      <span className="font-extrabold sm:text-lg">{item.q}</span>
                      <ChevronDown className={cx("h-5 w-5 shrink-0 text-blue-500 transition", isOpen && "rotate-180")} />
                    </button>
                    {isOpen && (
                      <div id={`faq-answer-${index}`} className={cx("border-t px-5 py-5 text-sm leading-7 sm:px-6 sm:text-base", isDarkMode ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-600")}>
                        {item.a}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-br from-[#153fa9] via-[#3157dc] to-[#6d46e8] p-7 text-white shadow-2xl shadow-indigo-600/25 sm:p-10 lg:p-14">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em]">
                  <Sparkles className="h-4 w-4" />
                  Interview-ready HLD revision
                </div>
                <h2 className="mt-5 max-w-3xl text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl lg:text-5xl">
                  Build the habit of explaining why your architecture works.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">
                  19 complete designs, one consistent method, and the production trade-offs interviewers expect you to discuss after the first diagram.
                </p>
              </div>

              <div className="min-w-[240px] rounded-[24px] bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-extrabold">{formatMoney(currentPrice)}</span>
                  {mrp > currentPrice && (
                    <span className="pb-1 text-sm font-bold text-blue-100 line-through">{formatMoney(mrp)}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!product?._id}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-[18px] bg-white px-5 py-4 font-extrabold text-indigo-700 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Get the ebook
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={cx("border-t px-4 py-8 text-center text-xs leading-6", isDarkMode ? "border-white/10 bg-[#070b18] text-slate-500" : "border-slate-200 bg-white text-slate-500")}>
        <p>Mastering System Design — High-Level Design • Digital PDF ebook • Non-refundable digital product</p>
        <p className="mt-1">
          Support:{" "}
          <a className="font-bold transition hover:text-blue-500" href="mailto:supporttargettrek@gmail.com">
            supporttargettrek@gmail.com
          </a>
        </p>
      </footer>

      {/* Mobile purchase card: intentionally mirrors the screenshot layout. */}
      <div className="fixed inset-x-0 bottom-0 z-[80] px-3 pb-[max(10px,env(safe-area-inset-bottom))] md:hidden">
        <div
          className={cx(
            "mx-auto grid max-w-xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[24px] border p-3 shadow-[0_-10px_45px_rgba(15,23,42,.18)] backdrop-blur-xl",
            isDarkMode
              ? "border-white/10 bg-[#0b1122]/95"
              : "border-white/90 bg-white/95"
          )}
        >
          <div className="min-w-0 pl-1">
            <div className="flex items-end gap-2">
              <span className="text-lg font-extrabold leading-none">{formatMoney(currentPrice)}</span>
              {discount > 0 && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-500">
                  {discount}% off
                </span>
              )}
            </div>
            <p className={cx("mt-2 truncate text-[11px] font-extrabold", isDarkMode ? "text-slate-400" : "text-[#65728b]")}>
              Mastering System Design — HLD
            </p>
          </div>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!product?._id}
            className="flex min-h-[58px] items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Get the ebook
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <PayUCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={checkoutProduct || product}
      />
    </div>
  );
}

export default SystemDesignHLD;