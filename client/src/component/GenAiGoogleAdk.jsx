// // import React, { useEffect, useMemo, useState } from "react";
// // import {
// //   ArrowRight,
// //   BookOpen,
// //   Check,
// //   ChevronDown,
// //   Code2,
// //   Database,
// //   GitBranch,
// //   Layers3,
// //   Lock,
// //   Network,
// //   Rocket,
// //   Search,
// //   Server,
// //   ShieldCheck,
// //   Sparkles,
// //   Terminal,
// //   TestTube,
// //   Users,
// //   Zap,
// // } from "lucide-react";
// // import PayUCheckoutModal from "../payment/PayUCheckoutModal";

// // export default function GenAiGoogleAdk() {
// //   /* =========================================================
// //      CONFIG
// //      ========================================================= */
// //   const GA_MEASUREMENT_ID = "G-5FPEL1W0VB";
// //   const BASE_URL =
// //     import.meta.env.VITE_BASE_URL || "http://localhost:5001";

// //   const [product, setProduct] = useState(null);
// //   const [loadingProduct, setLoadingProduct] = useState(true);
// //   const [productError, setProductError] = useState("");
// //   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

// //   const GOOGLE_ADK_MRP = Number(product?.mrp ?? 0);
// //   const GOOGLE_ADK_PRICE = Number(product?.price ?? 0);
// //   const GOOGLE_ADK_CURRENCY = product?.currency || "INR";

// //   const [scrollProgress, setScrollProgress] = useState(0);
// //   const [activeCode, setActiveCode] = useState(0);
// //   const [activeSkill, setActiveSkill] = useState(null);
// //   const [openFaq, setOpenFaq] = useState(null);
 
// //   useEffect(() => {
// //   const params = new URLSearchParams(window.location.search);
// //   const referralCode = (
// //     params.get("referralCode") || params.get("ref") || ""
// //   ).trim();

// //   if (referralCode) {
// //     localStorage.setItem("referralCode", referralCode);
// //   }
// // }, []);
// //   /* =========================================================
// //      DATA
// //      ========================================================= */
// //   const codeExamples = useMemo(
// //     () => [
// //       {
// //         id: "agent",
// //         label: "01 • Agent",
// //         title: "Minimal LLM Agent",
// //         description:
// //           "Start with the core agent primitive before composing larger systems.",
// //         code: `from google.adk.agents import Agent

// // root_agent = Agent(
// //     name="support_agent",
// //     model="gemini-flash-latest",
// //     instruction="""
// //     You are a customer-support assistant.
// //     Be concise. Never invent account data.
// //     Use tools when account information is required.
// //     """,
// // )`,
// //       },
// //       {
// //         id: "tool",
// //         label: "02 • Tool",
// //         title: "Function Calling",
// //         description:
// //           "Connect the model to deterministic Python functions and real systems.",
// //         code: `from google.adk.agents import Agent

// // def get_order_status(order_id: str) -> dict:
// //     """Return the status of an order by ID."""
// //     if not order_id.strip():
// //         return {"ok": False, "error": "order_id is required"}

// //     return {
// //         "ok": True,
// //         "order_id": order_id,
// //         "status": "SHIPPED",
// //     }

// // root_agent = Agent(
// //     name="order_agent",
// //     model="gemini-flash-latest",
// //     tools=[get_order_status],
// // )`,
// //       },
// //       {
// //         id: "rag",
// //         label: "03 • RAG",
// //         title: "Retrieval Pipeline",
// //         description:
// //           "Retrieve relevant evidence, then let the agent answer from grounded context.",
// //         code: `def retrieve(query: str, top_k: int = 5) -> list[dict]:
// //     """Retrieve relevant document chunks."""
// //     emb = client.models.embed_content(
// //         model="text-embedding-005",
// //         contents=[query],
// //     ).embeddings[0].values

// //     result = collection.query(
// //         query_embeddings=[emb],
// //         n_results=top_k,
// //     )

// //     return [
// //         {"text": text}
// //         for text in result["documents"][0]
// //     ]`,
// //       },
// //       {
// //         id: "multi",
// //         label: "04 • Multi-Agent",
// //         title: "Sequential Workflow",
// //         description:
// //           "Make orchestration explicit when one agent depends on another agent's output.",
// //         code: `from google.adk.agents import Agent, SequentialAgent

// // researcher = Agent(
// //     name="researcher",
// //     model="gemini-flash-latest",
// //     instruction="Research the topic and produce concise notes.",
// //     output_key="research_notes",
// // )

// // writer = Agent(
// //     name="writer",
// //     model="gemini-flash-latest",
// //     instruction="Write using the research stored in state.",
// // )

// // root_agent = SequentialAgent(
// //     name="research_then_write",
// //     sub_agents=[researcher, writer],
// // )`,
// //       },
// //     ],
// //     []
// //   );

// //   const chapters = useMemo(
// //     () => [
// //       ["01", "Agentic AI Fundamentals", "Agent loops, tools, context, memory, workflows, and when agents make sense."],
// //       ["02", "Google ADK: What It Is & Where It Fits", "Understand ADK, the developer workflow, and the Agents CLI."],
// //       ["03", "Setup, Installation & Authentication", "Install ADK, configure Gemini or Vertex AI, and create your first agent."],
// //       ["04", "Project Structure & Developer Workflow", "Organize agents, services, tests, evaluation datasets, and deployment files."],
// //       ["05", "LlmAgent: The Core Agent Type", "Build LLM-powered agents and understand the decision/tool-use loop."],
// //       ["06", "Sequential, Parallel & Loop Agents", "Master the core workflow agents and practical orchestration patterns."],
// //       ["07", "Custom Agents & Graph Workflows", "Create advanced control flow when standard workflow agents are not enough."],
// //       ["08", "Tools & Function Calling", "Connect agents to application logic, APIs, databases, and external capabilities."],
// //       ["09", "Built-in Tools, Search, Files & Toolsets", "Use built-in capabilities and understand toolset-based architectures."],
// //       ["10", "Callbacks, Plugins & Guardrails", "Observe, intercept, validate, authorize, retry, and control agent behavior."],
// //       ["11", "Sessions, State, Context & Memory", "Understand short-term state, sessions, context, and persistent memory."],
// //       ["12", "RAG: Full Working Pipeline", "Build retrieval-augmented agents with ingestion, embeddings, retrieval, and grounding."],
// //       ["13", "MCP: Model Context Protocol", "Connect ADK agents to MCP servers using practical integration patterns."],
// //       ["14", "A2A: Agent-to-Agent Systems", "Design specialist agents as services and connect them through A2A patterns."],
// //       ["15", "Models, Gemini, LiteLLM & Open Models", "Configure models and understand multi-model routing and integrations."],
// //       ["16", "Streaming, Live Agents & Multimodal Inputs", "Work with streaming events, live interactions, files, and multimodal inputs."],
// //       ["17", "Artifacts & File Handling", "Manage generated files and artifacts safely across agent workflows."],
// //       ["18", "Evaluation: Datasets, Metrics & Eval-Fix Loop", "Create evaluations, measure behavior, and turn failures into regression tests."],
// //       ["19", "Observability, Tracing & Debugging", "Trace agent runs, inspect tool calls, and debug production behavior."],
// //       ["20", "Deployment: Agent Runtime, Cloud Run & GKE", "Move agents from local development into production infrastructure."],
// //       ["21", "Batching, Async Workloads & Performance", "Process workloads efficiently with bounded concurrency and performance controls."],
// //       ["22", "FastAPI / REST Integration", "Expose agent capabilities through application APIs and backend services."],
// //       ["23", "End-to-End Production Agent", "Combine research, RAG, orchestration, synthesis, and review into one system."],
// //       ["24", "Security, Privacy & Reliability", "Handle prompt injection, tool abuse, data leakage, retries, and failure modes."],
// //       ["25", "Structured Output, Schemas & Validation", "Return predictable structured results and validate model-generated data."],
// //       ["26", "Caching, Context Control & Cost Engineering", "Control token usage, context growth, latency, and model costs."],
// //       ["27", "CLI: Commands You Actually Need", "Practical commands for creating, running, evaluating, scaffolding, and deploying agents."],
// //       ["28", "Testing Strategy for Agentic Systems", "Build unit, integration, failure-injection, and behavior-focused tests."],
// //       ["29", "Observability + Evaluation + Guardrails Pipeline", "Connect telemetry, quality checks, guardrails, and continuous improvement."],
// //       ["30", "Troubleshooting Guide", "Diagnose common setup, model, tool, deployment, and runtime problems."],
// //       ["31", "Production Checklist", "A practical checklist for taking an agent system toward production."],
// //       ["32", "Developer Cheat Sheets & Reference Architecture", "Quick references, architecture patterns, commands, and reusable mental models."],
// //     ],
// //     []
// //   );

// //   const learningPoints = [
// //     "Build AI agents from scratch using Google ADK",
// //     "Connect agents with tools and external APIs",
// //     "Work with sessions, state and context",
// //     "Build RAG-powered AI agents",
// //     "Design multi-agent architectures",
// //     "Create sequential and parallel workflows",
// //     "Handle errors and unreliable tool calls",
// //     "Test and evaluate agent behavior",
// //     "Understand production architecture",
// //     "Deploy and expose agents through APIs",
// //   ];

// //   const projects = [
// //     [Sparkles, "Research Agent", "Build an agent that researches a topic, gathers information and produces a structured result."],
// //     [Code2, "API Agent", "Connect an AI agent with external APIs and allow it to perform real-world actions."],
// //     [Layers3, "RAG Agent", "Create an agent that can answer questions using your own documents and knowledge base."],
// //     [Users, "Multi-Agent System", "Create specialized agents and orchestrate them into a complete AI workflow."],
// //   ];

// //   const flowSkills = [
// //     ["01", "Python + LLM Foundations", "Models, prompts, context", "Python, LLM APIs, prompts, context windows, structured outputs and basic model interaction patterns."],
// //     ["02", "Agent Fundamentals", "Instructions, state, sessions", "How an agent combines instructions, model behavior, tools, sessions and state to become a goal-oriented application component."],
// //     ["03", "Tools + Function Calling", "APIs, files, actions", "Tools give agents capabilities outside the model, including APIs, databases, files and controlled application actions."],
// //     ["04", "RAG + Memory", "Retrieval, grounding, context", "RAG retrieves relevant information for grounded answers, while memory and state preserve useful context."],
// //     ["05", "Multi-Agent + Protocols", "Workflows, MCP, A2A", "Compose specialist agents and connect systems through orchestration patterns, MCP and A2A-style communication."],
// //     ["06", "Eval + Observability", "Tests, traces, guardrails", "Evaluation, traces, logs and guardrails help measure quality, diagnose failures and improve systems."],
// //     ["07", "Production Engineering", "FastAPI, deployment, security", "Turn prototypes into services with APIs, deployment, security, reliability, performance and monitoring."],
// //   ];

// //   const faqs = [
// //     ["Who is this ebook for?", "It is designed for developers, backend engineers, GenAI learners, and software engineers who want a practical path from ADK fundamentals to production-oriented agent systems."],
// //     ["What is covered in the 2nd Edition?", "The handbook covers 32 chapters including agents, tools, workflow agents, sessions and memory, RAG, MCP, A2A, LiteLLM, streaming, artifacts, evaluation, observability, deployment, FastAPI, security, testing, performance, and production checklists."],
// //     ["Does the ebook contain code and commands?", "Yes. It follows a concept → flow → code → commands → production notes approach, with implementation examples throughout the handbook."],
// //     ["Is prior Google ADK experience required?", "No. The handbook starts with fundamentals and setup before moving into advanced orchestration, integrations, evaluation, and deployment."],
// //     ["Is this a video course?", "No. It is a developer-focused ebook and reference handbook designed to accompany hands-on implementation."],
// //     ["Is the ebook refundable?", "No. Due to the digital nature of the ebook, all purchases are non-refundable. Please review the contents and FAQ before purchasing."],
// //     ["How can I get support?", "For purchase or ebook-related issues, contact supporttargettrek@gmail.com."],
// //   ];

// //   const chaptersByGroup = [
// //     ["FOUNDATIONS", chapters.slice(0, 5)],
// //     ["ORCHESTRATION & TOOLS", chapters.slice(5, 11)],
// //     ["INTEGRATIONS", chapters.slice(11, 17)],
// //     ["PRODUCTION", chapters.slice(17, 25)],
// //     ["ENGINEERING & REFERENCE", chapters.slice(25)],
// //   ];

// //   /* =========================================================
// //      ANALYTICS + SCROLL
// //      ========================================================= */
// //   /* =========================================================
// //      DYNAMIC BOOK DATA
// //      ========================================================= */
// //   useEffect(() => {
// //     const controller = new AbortController();

// //     const fetchProduct = async () => {
// //       try {
// //         setLoadingProduct(true);
// //         setProductError("");

// //         const redirectUrl = window.location.pathname;
// //         const response = await fetch(
// //           `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(redirectUrl)}`,
// //           {
// //             method: "GET",
// //             headers: { Accept: "application/json" },
// //             signal: controller.signal,
// //           }
// //         );

// //         const result = await response.json().catch(() => null);

// //         if (!response.ok || !result?.success || !result?.data) {
// //           throw new Error(
// //             result?.error?.message ||
// //               result?.message ||
// //               "Unable to load ebook details."
// //           );
// //         }

// //         setProduct(result.data);
// //       } catch (error) {
// //         if (error?.name === "AbortError") return;

// //         console.error("Failed to fetch Google ADK ebook:", error);
// //         setProduct(null);
// //         setProductError(error?.message || "Unable to load ebook details.");
// //       } finally {
// //         if (!controller.signal.aborted) {
// //           setLoadingProduct(false);
// //         }
// //       }
// //     };

// //     fetchProduct();
// //     return () => controller.abort();
// //   }, [BASE_URL]);

// //   useEffect(() => {
// //     if (typeof window === "undefined") return undefined;

// //     window.dataLayer = window.dataLayer || [];
// //     window.gtag =
// //       window.gtag ||
// //       function gtag() {
// //         window.dataLayer.push(arguments);
// //       };

// //     const existingScript = document.querySelector(
// //       `script[data-google-analytics="${GA_MEASUREMENT_ID}"]`
// //     );

// //     if (!existingScript) {
// //       const script = document.createElement("script");
// //       script.async = true;
// //       script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
// //       script.setAttribute("data-google-analytics", GA_MEASUREMENT_ID);
// //       document.head.appendChild(script);
// //     }

// //     window.gtag("js", new Date());
// //     window.gtag("config", GA_MEASUREMENT_ID, {
// //       page_title: document.title,
// //       page_location: window.location.href,
// //     });

// //     const updateProgress = () => {
// //       const total = document.documentElement.scrollHeight - window.innerHeight;
// //       const value = total > 0 ? (window.scrollY / total) * 100 : 0;
// //       setScrollProgress(Math.min(100, Math.max(0, value)));
// //     };

// //     const revealObserver = new IntersectionObserver(
// //       (entries) => {
// //         entries.forEach((entry) => {
// //           if (entry.isIntersecting) {
// //             entry.target.classList.add("is-visible");
// //             revealObserver.unobserve(entry.target);
// //           }
// //         });
// //       },
// //       { threshold: 0.12 }
// //     );

// //     updateProgress();
// //     window.addEventListener("scroll", updateProgress, { passive: true });
// //     document
// //       .querySelectorAll("[data-reveal]")
// //       .forEach((element) => revealObserver.observe(element));

// //     return () => {
// //       window.removeEventListener("scroll", updateProgress);
// //       revealObserver.disconnect();
// //     };
// //   }, []);


// //   /* =========================================================
// //      ACTIONS
// //      ========================================================= */
// //   const handlePurchase = (source = "unknown") => {
// //     if (!product?._id) {
// //       console.error(
// //         productError || "Google ADK ebook information is unavailable."
// //       );
// //       return;
// //     }

// //     try {
// //       window.dataLayer = window.dataLayer || [];

// //       window.dataLayer.push({
// //         event: "adk_purchase_click",
// //         product: product.slug || "google_adk_handbook_2nd_edition",
// //         source,
// //         bookId: product._id,
// //         price: GOOGLE_ADK_PRICE,
// //         currency: GOOGLE_ADK_CURRENCY,
// //       });

// //       if (typeof window.gtag === "function") {
// //         window.gtag("event", "begin_checkout", {
// //           currency: GOOGLE_ADK_CURRENCY,
// //           value: GOOGLE_ADK_PRICE,
// //           source,
// //           items: [
// //             {
// //               item_id: product._id,
// //               item_name:
// //                 product.title ||
// //                 "Google ADK Complete Developer Handbook - 2nd Edition",
// //               price: GOOGLE_ADK_PRICE,
// //               quantity: 1,
// //             },
// //           ],
// //         });
// //       }
// //     } catch (error) {
// //       console.warn("Purchase analytics failed:", error);
// //     }

// //     setIsCheckoutOpen(true);
// //   };

// //   const scrollTo = (id) => {
// //     document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
// //   };

// //   /* =========================================================
// //      SHARED UI HELPERS
// //      ========================================================= */
// //   const sectionLabel = (text, dark = false) => (
// //     <p className={`text-sm font-black uppercase tracking-[0.18em] ${dark ? "text-blue-400" : "text-blue-600"}`}>
// //       {text}
// //     </p>
// //   );

// //   const buttonClass =
// //     "inline-flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-7 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700";

// //   return (
// //     <main className="min-h-screen bg-[#f7f9fc] text-slate-900">
// //       <style>{`
// //         html { scroll-behavior: smooth; }
// //         [data-reveal] {
// //           opacity: 0;
// //           transform: translateY(28px);
// //           transition: opacity .7s ease, transform .7s ease;
// //         }
// //         [data-reveal].is-visible {
// //           opacity: 1;
// //           transform: translateY(0);
// //         }
// //         @keyframes codeIn {
// //           from { opacity: 0; transform: translateY(10px); }
// //           to { opacity: 1; transform: translateY(0); }
// //         }
// //         @keyframes floatBook {
// //           0%,100% { transform: translateY(0) rotate(-3deg); }
// //           50% { transform: translateY(-10px) rotate(-2deg); }
// //         }
// //         .animate-code-in { animation: codeIn .35s ease both; }
// //         .animate-float-book { animation: floatBook 5s ease-in-out infinite; }
// //         @media (prefers-reduced-motion: reduce) {
// //           html { scroll-behavior: auto; }
// //           [data-reveal] { opacity: 1; transform: none; transition: none; }
// //           .animate-code-in,
// //           .animate-float-book { animation: none; }
// //         }
// //       `}</style>

// //       <div className="fixed left-0 right-0 top-0 z-[70] h-1 bg-slate-200">
// //         <div
// //           className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-600 transition-[width] duration-100"
// //           style={{ width: `${scrollProgress}%` }}
// //         />
// //       </div>

// //       {/* HERO */}
// //       <section className="relative overflow-hidden bg-white pt-14 lg:pt-20">
// //         <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />
// //         <div className="absolute -right-40 top-10 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-3xl" />

// //         <div className="relative mx-auto max-w-7xl px-6 pb-20 lg:px-8 lg:pb-28">
// //           <div className="grid items-center gap-16 lg:grid-cols-[1.08fr_.92fr]">
// //             <div>
// //               <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
// //                 <Sparkles size={16} />
// //                 2nd Edition • Developer Handbook
// //               </div>

// //               <h1 className="mt-7 text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
// //                 Learn Google ADK
// //                 <span className="block text-blue-600">by Building Real AI Agents</span>
// //               </h1>

// //               <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
// //                 A practical, code-first developer handbook that takes you from your first Google ADK agent to tools, RAG, MCP, A2A, multi-agent workflows, evaluation and production deployment.
// //               </p>

// //               <div className="mt-8 flex flex-wrap gap-3">
// //                 {["32 Chapters", "Practical Code", "RAG + MCP + A2A", "Production Topics"].map((item) => (
// //                   <span key={item} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
// //                     {item}
// //                   </span>
// //                 ))}
// //               </div>

// //               <div className="mt-10 flex flex-col gap-3 sm:flex-row">
// //                 <button onClick={() => handlePurchase("hero")} className={buttonClass}>
// //                   GET INSTANT PDF ACCESS
// //                   <span className="flex items-center gap-2">
// //                     <span className="text-sm text-blue-200 line-through">₹{GOOGLE_ADK_MRP}</span>
// //                     <span className="text-lg">₹{GOOGLE_ADK_PRICE}</span>
// //                   </span>
// //                   <ArrowRight size={19} />
// //                 </button>

// //                 <button
// //                   type="button"
// //                   onClick={() => scrollTo("contents")}
// //                   className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-4 font-bold text-slate-700 transition hover:bg-slate-50"
// //                 >
// //                   See What's Inside
// //                 </button>
// //               </div>

// //               <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
// //                 <span>✓ One-time payment</span>
// //                 <span>✓ Instant digital access</span>
// //                 <span>✓ No subscription</span>
// //               </div>
// //             </div>

// //             <div className="flex justify-center lg:justify-end">
// //               <div className="relative">
// //                 <div className="absolute -inset-12 rounded-full bg-blue-500/15 blur-3xl" />
// //                 <div className="animate-float-book relative w-[300px] rounded-r-2xl rounded-l-md border border-slate-200 bg-gradient-to-br from-[#173d78] via-[#0d63c9] to-[#37238d] p-8 shadow-2xl sm:w-[360px]">
// //                   <div className="absolute left-0 top-0 h-full w-3 rounded-l-md bg-black/20" />
// //                   <div className="flex h-[480px] flex-col justify-between">
// //                     <div>
// //                       <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
// //                         <Terminal size={15} />
// //                         Developer Handbook
// //                       </div>
// //                       <div className="mt-7 h-px bg-white/20" />
// //                       <p className="mt-10 text-xs font-black uppercase tracking-[0.22em] text-blue-100">2nd Edition</p>
// //                       <h2 className="mt-4 text-4xl font-black leading-[1.02] text-white">
// //                         Google<br />ADK<br />Complete<br />Developer<br />Handbook
// //                       </h2>
// //                       <p className="mt-5 max-w-[240px] text-sm leading-6 text-blue-100">
// //                         From first agent to RAG, MCP, A2A, evaluation, observability and production deployment.
// //                       </p>
// //                     </div>
// //                     <div>
// //                       <div className="flex flex-wrap gap-2">
// //                         {["Agents", "RAG", "MCP", "A2A", "Production"].map((tag) => (
// //                           <span key={tag} className="rounded-lg bg-white/10 px-3 py-2 text-[10px] font-bold text-white">{tag}</span>
// //                         ))}
// //                       </div>
// //                       <p className="mt-5 text-xs font-bold text-blue-100">Practical • Code-first • Production-aware</p>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div className="absolute -bottom-6 -right-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-2xl sm:-right-8">
// //                   <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Current Price</p>
// //                   <div className="mt-1 flex items-center gap-2">
// //                     <span className="text-sm font-bold text-slate-400 line-through">₹{GOOGLE_ADK_MRP}</span>
// //                     <span className="text-3xl font-black text-blue-600">₹{GOOGLE_ADK_PRICE}</span>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* TRUST */}
// //       <section className="border-y border-slate-200 bg-white" data-reveal>
// //         <div className="mx-auto grid max-w-6xl grid-cols-2 lg:grid-cols-4">
// //           {[
// //             ["32 Chapters", "Structured learning path"],
// //             ["Code-First", "Commands + implementation"],
// //             ["RAG / MCP / A2A", "Modern agent integrations"],
// //             ["Production", "Evaluation + deployment"],
// //           ].map(([title, description]) => (
// //             <div key={title} className="border-r border-slate-200 px-5 py-7 text-center last:border-r-0">
// //               <p className="font-black">{title}</p>
// //               <p className="mt-1 text-sm text-slate-500">{description}</p>
// //             </div>
// //           ))}
// //         </div>
// //       </section>

// //       {/* VALUE */}
// //       <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8" data-reveal>
// //         <div className="grid items-center gap-14 lg:grid-cols-[.82fr_1.18fr]">
// //           <div>
// //             {sectionLabel("Built for developers")}
// //             <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Stop jumping between scattered concepts.</h2>
// //             <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
// //               Learning agent development can involve agents, tools, orchestration, memory, RAG, protocols, evaluation and deployment. This handbook puts those topics into one structured developer-focused learning path.
// //             </p>
// //           </div>

// //           <div className="grid gap-5 sm:grid-cols-2">
// //             {[
// //               [BookOpen, "Structured path", "Move from fundamentals to advanced topics instead of learning isolated concepts."],
// //               [Code2, "Implementation focused", "Follow concepts with flows, code, commands and practical development context."],
// //               [Network, "Connect the pieces", "Understand how agents, tools, RAG, MCP, A2A and APIs fit together."],
// //               [Rocket, "Production aware", "Explore evaluation, observability, security, testing and deployment."],
// //             ].map(([Icon, title, description]) => (
// //               <div key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
// //                 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={23} /></div>
// //                 <h3 className="mt-5 text-xl font-black">{title}</h3>
// //                 <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </section>

// //       {/* WHY HANDBOOK */}
// //       <section className="bg-white py-24" data-reveal>
// //         <div className="mx-auto max-w-6xl px-6 lg:px-8">
// //           <div className="grid gap-12 lg:grid-cols-2">
// //             <div>
// //               {sectionLabel("The real value")}
// //               <h2 className="mt-3 text-4xl font-black sm:text-5xl">Why not just use the free documentation?</h2>
// //               <p className="mt-6 text-lg leading-8 text-slate-600">
// //                 Official documentation remains an important source of truth. This handbook is positioned differently: it gives you a structured learning sequence focused on the developer journey from fundamentals through implementation and production topics.
// //               </p>
// //             </div>

// //             <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
// //               <div className="grid grid-cols-2 border-b border-slate-200">
// //                 <div className="p-5 text-sm font-black text-slate-500">Learning challenge</div>
// //                 <div className="p-5 text-sm font-black text-blue-600">Handbook approach</div>
// //               </div>
// //               {[
// //                 ["Where do I start?", "Fundamentals → setup → first agent"],
// //                 ["How do concepts connect?", "Concept → flow → code"],
// //                 ["What comes after agents?", "Tools → workflows → RAG → protocols"],
// //                 ["How do I approach production?", "Evaluation → observability → security → deployment"],
// //               ].map(([left, right]) => (
// //                 <div key={left} className="grid grid-cols-2 border-b border-slate-200 last:border-b-0">
// //                   <div className="p-5 text-sm text-slate-500">{left}</div>
// //                   <div className="p-5 text-sm font-semibold text-slate-700">{right}</div>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* LEARNING */}
// //       <section className="bg-slate-50 py-24" data-reveal>
// //         <div className="mx-auto max-w-7xl px-6 lg:px-8">
// //           <div className="grid gap-14 lg:grid-cols-[.78fr_1.22fr]">
// //             <div>
// //               {sectionLabel("What you learn")}
// //               <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">One handbook for the full agent lifecycle.</h2>
// //               <p className="mt-5 leading-8 text-slate-600">Start with the mental model and setup. Then move into orchestration, integrations, evaluation, operations and production.</p>
// //               <button onClick={() => handlePurchase("learning_section")} className={`${buttonClass} mt-8`}>
// //                 Get Instant Access <ArrowRight size={18} />
// //               </button>
// //             </div>

// //             <div className="grid gap-3 sm:grid-cols-2">
// //               {learningPoints.map((item) => (
// //                 <div key={item} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
// //                   <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"><Check size={13} strokeWidth={3} /></span>
// //                   <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* TOPICS */}
// //       <section className="bg-white py-24" data-reveal>
// //         <div className="mx-auto max-w-7xl px-6 lg:px-8">
// //           <div className="text-center">
// //             {sectionLabel("What is inside")}
// //             <h2 className="mt-3 text-4xl font-black sm:text-5xl">The topics developers actually need.</h2>
// //           </div>

// //           <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
// //             {[
// //               [Terminal, "Agents", "LlmAgent, custom agents and agent behavior."],
// //               [Zap, "Orchestration", "Sequential, parallel, loop and graph workflows."],
// //               [Database, "RAG", "Retrieval, grounding, ingestion and knowledge systems."],
// //               [Network, "Protocols", "MCP and A2A integration patterns."],
// //               [Search, "Tools", "Function calling, APIs, files and toolsets."],
// //               [TestTube, "Evaluation", "Datasets, metrics and eval-fix workflows."],
// //               [Server, "Deployment", "Runtime, Cloud Run, GKE and REST APIs."],
// //               [Lock, "Security", "Privacy, reliability, guardrails and failure modes."],
// //             ].map(([Icon, title, description]) => (
// //               <div key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-lg">
// //                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={21} /></div>
// //                 <h3 className="mt-5 text-lg font-black">{title}</h3>
// //                 <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </section>

// //       {/* PROJECTS */}
// //       <section className="bg-slate-50 py-24" data-reveal>
// //         <div className="mx-auto max-w-7xl px-6 lg:px-8">
// //           {sectionLabel("Build with the concepts")}
// //           <h2 className="mt-3 max-w-3xl text-4xl font-black sm:text-5xl">Learn by thinking in real agent systems.</h2>
// //           <p className="mt-5 max-w-3xl leading-8 text-slate-600">The handbook includes patterns around research agents, API agents, RAG systems and multi-agent architectures.</p>

// //           <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
// //             {projects.map(([Icon, title, description], index) => (
// //               <div key={title} className="group rounded-3xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
// //                 <div className="flex items-center justify-between">
// //                   <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={23} /></div>
// //                   <span className="font-mono text-xs font-bold text-slate-400">0{index + 1}</span>
// //                 </div>
// //                 <h3 className="mt-6 text-xl font-black">{title}</h3>
// //                 <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </section>

// //       {/* INTERVIEW */}
// //       <section className="bg-blue-50 py-24" data-reveal>
// //         <div className="mx-auto max-w-7xl px-6 lg:px-8">
// //           <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
// //             <div>
// //               <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-black text-blue-700">
// //                 <Zap size={16} /> Interview quick revision
// //               </div>
// //               <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
// //                 Less time before your interview?
// //                 <span className="block text-blue-700">Use the handbook for fast revision.</span>
// //               </h2>
// //               <p className="mt-6 text-lg leading-8 text-slate-600">
// //                 If you have less time for an interview, this handbook gives you a structured way to quickly revise the major GenAI and Google ADK topics — agents, workflows, RAG, MCP, A2A, evaluation, observability, deployment, security and production patterns.
// //               </p>
// //               <button onClick={() => handlePurchase("interview_revision")} className={`${buttonClass} mt-8`}>
// //                 Revise Faster <ArrowRight size={18} />
// //               </button>
// //             </div>

// //             <div className="grid gap-3 sm:grid-cols-2">
// //               {[
// //                 ["01", "Core concepts", "Agent mental model, ADK and setup"],
// //                 ["02", "Architecture", "Tools, workflows, RAG, MCP and A2A"],
// //                 ["03", "Production", "Evals, tracing, security and deployment"],
// //                 ["04", "Reference", "Commands, checklists and architecture patterns"],
// //               ].map(([number, title, description]) => (
// //                 <div key={number} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
// //                   <span className="font-mono text-xs font-black text-blue-600">{number}</span>
// //                   <h3 className="mt-4 text-lg font-black">{title}</h3>
// //                   <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* FLOW */}
// //       <section className="relative z-20 bg-white py-24" data-reveal>
// //         <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8">
// //           <div className="mx-auto max-w-3xl text-center">
// //             {sectionLabel("GenAI engineer roadmap")}
// //             <h2 className="mt-3 text-4xl font-black sm:text-5xl">See how the skills connect.</h2>
// //             <p className="mt-5 leading-8 text-slate-600">
// //               Follow the connected path from foundations to production. Hover on desktop or tap on mobile to understand each skill.
// //             </p>
// //           </div>

// //           <div className="relative mt-14">
// //             <div className="pointer-events-none absolute left-[6%] right-[6%] top-[78px] hidden h-1 rounded-full bg-gradient-to-r from-blue-100 via-blue-400 to-indigo-200 lg:block" />

// //             <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-7">
// //               {flowSkills.map(([number, title, short, detail], index) => {
// //                 const isActive = activeSkill === number;

// //                 return (
// //                   <div
// //                     key={number}
// //                     className="relative z-40"
// //                     onMouseEnter={() => setActiveSkill(number)}
// //                     onMouseLeave={() => setActiveSkill(null)}
// //                   >
// //                     <button
// //                       type="button"
// //                       onFocus={() => setActiveSkill(number)}
// //                       onClick={() => setActiveSkill(isActive ? null : number)}
// //                       className={`relative flex min-h-[210px] w-full flex-col rounded-[28px] border p-5 text-left transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
// //                         isActive
// //                           ? "-translate-y-2 border-blue-300 bg-blue-50 shadow-xl shadow-blue-100"
// //                           : "border-slate-200 bg-white hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
// //                       }`}
// //                     >
// //                       <div className="flex items-center justify-between">
// //                         <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xs font-black text-blue-700 ring-1 ring-blue-100">{number}</span>
// //                         {index < flowSkills.length - 1 && <ArrowRight className="hidden text-blue-300 lg:block" size={18} />}
// //                       </div>
// //                       <h3 className="mt-6 text-sm font-black leading-5">{title}</h3>
// //                       <p className="mt-2 text-xs leading-5 text-slate-500">{short}</p>
// //                       <div className={`mt-auto pt-5 transition-all ${isActive ? "w-full" : "w-8"} h-1 rounded-full bg-blue-500`} />
// //                     </button>

// //                     {isActive && (
// //                       <div className="pointer-events-auto absolute bottom-full left-1/2 z-[100] mb-3 w-[280px] -translate-x-1/2 rounded-2xl border border-blue-100 bg-white p-5 text-left shadow-2xl">
// //                         <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">{number} • Skill</p>
// //                         <h4 className="mt-2 text-sm font-black">{title}</h4>
// //                         <p className="mt-2 text-xs leading-6 text-slate-600">{detail}</p>
// //                       </div>
// //                     )}
// //                   </div>
// //                 );
// //               })}
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* CODE TABS */}
// //       <section className="bg-white py-24" data-reveal>
// //         <div className="mx-auto max-w-7xl px-6 lg:px-8">
// //           <div className="mx-auto max-w-3xl text-center">
// //             {sectionLabel("Interactive code tour")}
// //             <h2 className="mt-3 text-4xl font-black sm:text-5xl">Hover or tap to switch the examples.</h2>
// //             <p className="mt-5 leading-8 text-slate-600">Explore four representative patterns: a core agent, function calling, RAG retrieval and sequential multi-agent orchestration.</p>
// //           </div>

// //           <div className="mt-12 overflow-hidden rounded-[28px] border border-slate-800 bg-[#050b14] shadow-2xl">
// //             <div className="border-b border-slate-700 bg-white/[0.03] p-2">
// //               <div className="flex gap-2 overflow-x-auto">
// //                 {codeExamples.map((item, index) => (
// //                   <button
// //                     key={item.id}
// //                     type="button"
// //                     onMouseEnter={() => setActiveCode(index)}
// //                     onFocus={() => setActiveCode(index)}
// //                     onClick={() => setActiveCode(index)}
// //                     className={`group relative min-w-max rounded-xl px-4 py-3 text-left transition-all duration-300 ${activeCode === index ? "bg-white/10 text-white shadow-lg" : "text-slate-500 hover:bg-white/[0.06] hover:text-slate-200"}`}
// //                   >
// //                     <span className="block text-[11px] font-black uppercase tracking-[0.12em]">{item.label}</span>
// //                     <span className="mt-0.5 block text-xs font-semibold">{item.title}</span>
// //                     <span className={`absolute inset-x-3 bottom-0 h-0.5 origin-left rounded-full bg-blue-400 transition-transform duration-300 ${activeCode === index ? "scale-x-100" : "scale-x-0"}`} />
// //                   </button>
// //                 ))}
// //               </div>
// //             </div>

// //             <div className="grid lg:grid-cols-[.8fr_1.2fr]">
// //               <div className="border-b border-slate-700 p-7 lg:border-b-0 lg:border-r lg:p-9">
// //                 <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-blue-400"><Code2 size={15} />{codeExamples[activeCode].label}</div>
// //                 <h3 className="mt-4 text-2xl font-black text-white">{codeExamples[activeCode].title}</h3>
// //                 <p className="mt-4 text-sm leading-7 text-slate-400">{codeExamples[activeCode].description}</p>
// //                 <div className="mt-7 flex flex-wrap gap-2">
// //                   {["Concept", "Flow", "Code", "Production"].map((tag) => (
// //                     <span key={tag} className="rounded-full border border-slate-700 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-slate-400">{tag}</span>
// //                   ))}
// //                 </div>
// //               </div>

// //               <div className="min-h-[390px] bg-[#02060d]">
// //                 <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
// //                   <span className="h-3 w-3 rounded-full bg-red-400" />
// //                   <span className="h-3 w-3 rounded-full bg-yellow-400" />
// //                   <span className="h-3 w-3 rounded-full bg-green-400" />
// //                   <span className="ml-3 text-xs font-semibold text-slate-500">{codeExamples[activeCode].id}.py</span>
// //                 </div>
// //                 <pre className="max-h-[520px] overflow-auto p-6 text-[12px] leading-6 text-slate-300 sm:text-[13px]">
// //                   <code key={codeExamples[activeCode].id} className="block animate-code-in">{codeExamples[activeCode].code}</code>
// //                 </pre>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* CODE-FIRST */}
// //       <section className="bg-blue-50 py-24" data-reveal>
// //         <div className="mx-auto max-w-7xl px-6 lg:px-8">
// //           <div className="grid items-center gap-12 lg:grid-cols-2">
// //             <div>
// //               {sectionLabel("Code-first learning")}
// //               <h2 className="mt-3 text-4xl font-black sm:text-5xl">Understand the flow.<br />Then write the code.</h2>
// //               <p className="mt-6 leading-8 text-slate-600">The handbook does not stop at definitions. It explains how agent components connect and gives implementation examples and commands for important building blocks.</p>
// //               <div className="mt-8 grid gap-3 sm:grid-cols-2">
// //                 {["Installation & authentication", "Agent implementations", "Workflow orchestration", "RAG implementation", "MCP integration", "Evaluation & deployment"].map((item) => (
// //                   <div key={item} className="flex items-center gap-2 text-sm font-bold text-slate-700"><Check size={17} className="text-blue-600" />{item}</div>
// //                 ))}
// //               </div>
// //             </div>

// //             <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
// //               <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
// //                 <span className="h-3 w-3 rounded-full bg-red-400" />
// //                 <span className="h-3 w-3 rounded-full bg-yellow-400" />
// //                 <span className="h-3 w-3 rounded-full bg-green-400" />
// //                 <span className="ml-3 text-xs text-slate-500">agent.py</span>
// //               </div>
// //               <pre className="overflow-x-auto p-6 text-sm leading-7 text-slate-300"><code>{`from google.adk.agents import LlmAgent

// // root_agent = LlmAgent(
// //     name="research_agent",
// //     model="gemini-2.5-flash",
// //     instruction="""
// //     Research the user's topic and
// //     return a structured answer.
// //     """,
// // )

// // # Then add tools, sessions,
// // # orchestration, evaluation,
// // # observability and deployment.`}</code></pre>
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* CONTENTS */}
// //       <section id="contents" className="bg-white py-24" data-reveal>
// //         <div className="mx-auto max-w-7xl px-6 lg:px-8">
// //           {sectionLabel("32-chapter contents")}
// //           <h2 className="mt-3 max-w-3xl text-4xl font-black sm:text-5xl">From your first agent to production architecture.</h2>
// //           <p className="mt-5 max-w-3xl leading-8 text-slate-600">Every chapter follows a practical structure: concept → flow → code → commands → how it works → production notes.</p>

// //           <div className="mt-14 space-y-12">
// //             {chaptersByGroup.map(([label, items]) => (
// //               <div key={label}>
// //                 <p className="mb-4 text-xs font-black tracking-[0.2em] text-blue-600">{label}</p>
// //                 <div className="grid gap-3 md:grid-cols-2">
// //                   {items.map(([number, title, description]) => (
// //                     <div key={number} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:bg-slate-50">
// //                       <div className="flex gap-4">
// //                         <span className="font-mono text-sm font-black text-blue-600">{number}</span>
// //                         <div>
// //                           <h3 className="font-bold">{title}</h3>
// //                           <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
// //                         </div>
// //                       </div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </section>

// //       {/* MID CTA */}
// //       <section className="border-y border-slate-200 bg-blue-50 py-16">
// //         <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-7 px-6 text-center lg:flex-row lg:text-left lg:px-8">
// //           <div>
// //             <p className="text-sm font-black uppercase tracking-[.18em] text-blue-600">Ready to build?</p>
// //             <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Get the complete developer handbook.</h2>
// //             <p className="mt-2 text-slate-600">32 chapters • Code • RAG • MCP • A2A • Production</p>
// //           </div>
// //           <button onClick={() => handlePurchase("mid_page")} className="inline-flex shrink-0 items-center gap-3 rounded-xl bg-blue-600 px-7 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">
// //             Get Instant PDF Access
// //             <span>₹{GOOGLE_ADK_PRICE}</span>
// //             <ArrowRight size={19} />
// //           </button>
// //         </div>
// //       </section>

// //       {/* PRICING */}
// //       <section id="pricing" className="bg-slate-50 py-24" data-reveal>
// //         <div className="mx-auto max-w-5xl px-6 lg:px-8">
// //           <div className="text-center">
// //             <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"><Sparkles size={16} /> Google ADK • 2nd Edition</div>
// //             <h2 className="mt-5 text-4xl font-black sm:text-5xl">A practical reference for your ADK journey.</h2>
// //             <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">Learn the concepts, follow the implementation patterns and understand the production lifecycle in one developer handbook.</p>
// //           </div>

// //           <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
// //             <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />
// //             <div className="grid lg:grid-cols-[1.2fr_.8fr]">
// //               <div className="p-8 sm:p-10 lg:p-12">
// //                 <p className="text-sm font-black uppercase tracking-wider text-blue-600">Google ADK Complete Developer Handbook</p>
// //                 <h3 className="mt-2 text-3xl font-black">2nd Edition</h3>
// //                 <p className="mt-4 leading-7 text-slate-600">32 chapters covering agent fundamentals, orchestration, tools, RAG, MCP, A2A, evaluation, observability, deployment, security, testing, performance and developer references.</p>
// //                 <div className="mt-8 grid gap-3 sm:grid-cols-2">
// //                   {["32 structured chapters", "Code & command examples", "RAG + MCP + A2A", "Evaluation & observability", "Deployment & FastAPI", "Security & testing"].map((item) => (
// //                     <div key={item} className="flex gap-2 text-sm font-semibold text-slate-600"><Check size={17} className="mt-0.5 shrink-0 text-blue-600" />{item}</div>
// //                   ))}
// //                 </div>
// //               </div>

// //               <div className="border-t border-slate-200 bg-slate-50 p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-10">
// //                 <div className="flex h-full flex-col justify-center">
// //                   <p className="text-sm font-bold text-slate-500">Regular price</p>
// //                   <div className="mt-2 flex items-end gap-3">
// //                     <span className="text-2xl font-bold text-slate-400 line-through">₹{GOOGLE_ADK_MRP}</span>
// //                     <span className="text-5xl font-black">₹{GOOGLE_ADK_PRICE}</span>
// //                   </div>
// //                   <p className="mt-3 text-sm leading-6 text-slate-500">One-time payment.<br />No subscription required.</p>
// //                   <button onClick={() => handlePurchase("pricing")} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-black text-white shadow-lg transition hover:bg-blue-700">
// //                     GET INSTANT PDF ACCESS <ArrowRight size={18} />
// //                   </button>
// //                   <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400"><ShieldCheck size={15} className="text-green-500" />Secure payment • Instant access</div>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center">
// //             <p className="text-sm font-semibold text-slate-700">Digital Product</p>
// //             <p className="mt-1 text-xs leading-5 text-slate-500">Due to the digital nature of this ebook, all purchases are final and non-refundable. Please review the contents and FAQ before purchasing.</p>
// //             <p className="mt-2 text-xs text-slate-500">Purchase or ebook support: <a href="mailto:supporttargettrek@gmail.com" className="font-semibold underline">supporttargettrek@gmail.com</a></p>
// //           </div>
// //         </div>
// //       </section>

// //       {/* FAQ */}
// //       <section className="bg-white py-24" data-reveal>
// //         <div className="mx-auto max-w-4xl px-6 lg:px-8">
// //           <div className="text-center">
// //             {sectionLabel("FAQ")}
// //             <h2 className="mt-3 text-4xl font-black sm:text-5xl">Questions before you buy?</h2>
// //             <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">Here are the important details about the handbook and purchase.</p>
// //           </div>

// //           <div className="mt-10 space-y-3">
// //             {faqs.map(([question, answer], index) => (
// //               <div key={question} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
// //                 <button
// //                   type="button"
// //                   onClick={() => setOpenFaq(openFaq === index ? null : index)}
// //                   className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold"
// //                 >
// //                   <span>{question}</span>
// //                   <ChevronDown size={20} className={`shrink-0 text-slate-400 transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
// //                 </button>
// //                 {openFaq === index && <p className="px-5 pb-5 pr-12 text-sm leading-7 text-slate-600">{answer}</p>}
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </section>

// //       {/* FINAL CTA */}
// //       <section className="border-t border-slate-200 bg-white px-6 py-24 text-center" data-reveal>
// //         <div className="mx-auto max-w-3xl">
// //           <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Rocket size={27} /></div>
// //           <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-5xl">Start building AI agents with Google ADK.</h2>
// //           <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-600">Learn the fundamentals, understand the architecture, write the code and explore the production lifecycle in one developer handbook.</p>
// //           <div className="mt-7 flex items-center justify-center gap-3">
// //             <span className="text-xl font-bold text-slate-400 line-through">₹{GOOGLE_ADK_MRP}</span>
// //             <span className="text-4xl font-black text-blue-600">₹{GOOGLE_ADK_PRICE}</span>
// //           </div>
// //           <button onClick={() => handlePurchase("footer")} className={`${buttonClass} mt-7`}>
// //             GET INSTANT PDF ACCESS <ArrowRight size={19} />
// //           </button>
// //           <p className="mt-6 text-xs leading-5 text-slate-400">Non-refundable digital product • Support: <a href="mailto:supporttargettrek@gmail.com" className="font-semibold text-slate-500">supporttargettrek@gmail.com</a></p>
// //           <p className="mt-2 text-xs text-slate-400">Google ADK Complete Developer Handbook • 2nd Edition</p>
// //         </div>
// //       </section>

// //       {/* MOBILE CTA */}
// //       <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
// //         <div className="mx-auto flex max-w-lg items-center gap-3">
// //           <div className="min-w-0 flex-1">
// //             <p className="truncate text-xs font-bold text-slate-500">Google ADK Handbook</p>
// //             <div className="flex items-center gap-2">
// //               <span className="text-xs font-bold text-slate-400 line-through">₹{GOOGLE_ADK_MRP}</span>
// //               <span className="text-lg font-black text-blue-600">₹{GOOGLE_ADK_PRICE}</span>
// //             </div>
// //           </div>
// //           <button onClick={() => handlePurchase("mobile_sticky")} className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg">
// //             Buy Now <ArrowRight size={16} />
// //           </button>
// //         </div>
// //       </div>
// //       <PayUCheckoutModal
// //         isOpen={isCheckoutOpen}
// //         onClose={() => setIsCheckoutOpen(false)}
// //         product={product}
// //       />

// //     </main>
// //   );
// // }
// import React, { useEffect, useMemo, useState } from "react";
// import { Helmet } from "react-helmet";

// import {

//   ArrowRight,

//   BookOpen,

//   Check,

//   ChevronDown,

//   Code2,

//   Database,

//   GitBranch,

//   Layers3,

//   Lock,

//   Network,

//   Rocket,

//   Search,

//   Server,

//   ShieldCheck,

//   Sparkles,

//   Terminal,

//   TestTube,

//   Users,

//   Zap,

// } from "lucide-react";

// import PayUCheckoutModal from "../payment/PayUCheckoutModal";



// const SITE_URL = "https://www.targettrek.in";
// const SITE_NAME = "Target Trek";
// const SEO_TITLE = "Google ADK Complete Developer Handbook | AI Agents Ebook";
// const SEO_DESCRIPTION =
//   "Learn Google ADK with a practical developer handbook covering AI agents, tools, RAG, MCP, A2A, multi-agent workflows, evaluation, observability, security and production deployment.";

// export default function GenAiGoogleAdk() {

  

//   const GA_MEASUREMENT_ID = "G-5FPEL1W0VB";

//   const BASE_URL =

//     import.meta.env.VITE_BASE_URL || "http://localhost:5001";



//   const [product, setProduct] = useState(null);

//   const [loadingProduct, setLoadingProduct] = useState(true);

//   const [productError, setProductError] = useState("");

//   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
//   const [retryCount, setRetryCount] = useState(0);



//   const GOOGLE_ADK_PRICE =
//     product?.price !== null && product?.price !== undefined && product?.price !== ""
//       ? Number(product.price)
//       : null;

//   const GOOGLE_ADK_MRP =
//     product?.mrp !== null && product?.mrp !== undefined && product?.mrp !== ""
//       ? Number(product.mrp)
//       : null;

//   const GOOGLE_ADK_CURRENCY = product?.currency || "INR";
//   const hasValidPrice =
//     GOOGLE_ADK_PRICE !== null &&
//     Number.isFinite(GOOGLE_ADK_PRICE) &&
//     GOOGLE_ADK_PRICE >= 0;
//   const hasMrp =
//     GOOGLE_ADK_MRP !== null &&
//     Number.isFinite(GOOGLE_ADK_MRP) &&
//     hasValidPrice &&
//     GOOGLE_ADK_MRP > GOOGLE_ADK_PRICE;
//   const canBuy =
//     Boolean(product?._id) && hasValidPrice && !loadingProduct && !productError;



//   const [scrollProgress, setScrollProgress] = useState(0);

//   const [activeCode, setActiveCode] = useState(0);

//   const [activeSkill, setActiveSkill] = useState(null);

//   const [openFaq, setOpenFaq] = useState(null);

//   useEffect(() => {

//   const params = new URLSearchParams(window.location.search);

//   const referralCode = (

//     params.get("referralCode") || params.get("ref") || ""

//   ).trim();



//   if (referralCode) {

//     localStorage.setItem("referralCode", referralCode);

//   }

// }, []);

  

//   const codeExamples = useMemo(

//     () => [

//       {

//         id: "agent",

//         label: "01 • Agent",

//         title: "Minimal LLM Agent",

//         description:

//           "Start with the core agent primitive before composing larger systems.",

//         code: `from google.adk.agents import Agent



// root_agent = Agent(

//     name="support_agent",

//     model="gemini-flash-latest",

//     instruction="""

//     You are a customer-support assistant.

//     Be concise. Never invent account data.

//     Use tools when account information is required.

//     """,

// )`,

//       },

//       {

//         id: "tool",

//         label: "02 • Tool",

//         title: "Function Calling",

//         description:

//           "Connect the model to deterministic Python functions and real systems.",

//         code: `from google.adk.agents import Agent



// def get_order_status(order_id: str) -> dict:

//     """Return the status of an order by ID."""

//     if not order_id.strip():

//         return {"ok": False, "error": "order_id is required"}



//     return {

//         "ok": True,

//         "order_id": order_id,

//         "status": "SHIPPED",

//     }



// root_agent = Agent(

//     name="order_agent",

//     model="gemini-flash-latest",

//     tools=[get_order_status],

// )`,

//       },

//       {

//         id: "rag",

//         label: "03 • RAG",

//         title: "Retrieval Pipeline",

//         description:

//           "Retrieve relevant evidence, then let the agent answer from grounded context.",

//         code: `def retrieve(query: str, top_k: int = 5) -> list[dict]:

//     """Retrieve relevant document chunks."""

//     emb = client.models.embed_content(

//         model="text-embedding-005",

//         contents=[query],

//     ).embeddings[0].values



//     result = collection.query(

//         query_embeddings=[emb],

//         n_results=top_k,

//     )



//     return [

//         {"text": text}

//         for text in result["documents"][0]

//     ]`,

//       },

//       {

//         id: "multi",

//         label: "04 • Multi-Agent",

//         title: "Sequential Workflow",

//         description:

//           "Make orchestration explicit when one agent depends on another agent's output.",

//         code: `from google.adk.agents import Agent, SequentialAgent



// researcher = Agent(

//     name="researcher",

//     model="gemini-flash-latest",

//     instruction="Research the topic and produce concise notes.",

//     output_key="research_notes",

// )



// writer = Agent(

//     name="writer",

//     model="gemini-flash-latest",

//     instruction="Write using the research stored in state.",

// )



// root_agent = SequentialAgent(

//     name="research_then_write",

//     sub_agents=[researcher, writer],

// )`,

//       },

//     ],

//     []

//   );



//   const chapters = useMemo(

//     () => [

//       ["01", "Agentic AI Fundamentals", "Agent loops, tools, context, memory, workflows, and when agents make sense."],

//       ["02", "Google ADK: What It Is & Where It Fits", "Understand ADK, the developer workflow, and the Agents CLI."],

//       ["03", "Setup, Installation & Authentication", "Install ADK, configure Gemini or Vertex AI, and create your first agent."],

//       ["04", "Project Structure & Developer Workflow", "Organize agents, services, tests, evaluation datasets, and deployment files."],

//       ["05", "LlmAgent: The Core Agent Type", "Build LLM-powered agents and understand the decision/tool-use loop."],

//       ["06", "Sequential, Parallel & Loop Agents", "Master the core workflow agents and practical orchestration patterns."],

//       ["07", "Custom Agents & Graph Workflows", "Create advanced control flow when standard workflow agents are not enough."],

//       ["08", "Tools & Function Calling", "Connect agents to application logic, APIs, databases, and external capabilities."],

//       ["09", "Built-in Tools, Search, Files & Toolsets", "Use built-in capabilities and understand toolset-based architectures."],

//       ["10", "Callbacks, Plugins & Guardrails", "Observe, intercept, validate, authorize, retry, and control agent behavior."],

//       ["11", "Sessions, State, Context & Memory", "Understand short-term state, sessions, context, and persistent memory."],

//       ["12", "RAG: Full Working Pipeline", "Build retrieval-augmented agents with ingestion, embeddings, retrieval, and grounding."],

//       ["13", "MCP: Model Context Protocol", "Connect ADK agents to MCP servers using practical integration patterns."],

//       ["14", "A2A: Agent-to-Agent Systems", "Design specialist agents as services and connect them through A2A patterns."],

//       ["15", "Models, Gemini, LiteLLM & Open Models", "Configure models and understand multi-model routing and integrations."],

//       ["16", "Streaming, Live Agents & Multimodal Inputs", "Work with streaming events, live interactions, files, and multimodal inputs."],

//       ["17", "Artifacts & File Handling", "Manage generated files and artifacts safely across agent workflows."],

//       ["18", "Evaluation: Datasets, Metrics & Eval-Fix Loop", "Create evaluations, measure behavior, and turn failures into regression tests."],

//       ["19", "Observability, Tracing & Debugging", "Trace agent runs, inspect tool calls, and debug production behavior."],

//       ["20", "Deployment: Agent Runtime, Cloud Run & GKE", "Move agents from local development into production infrastructure."],

//       ["21", "Batching, Async Workloads & Performance", "Process workloads efficiently with bounded concurrency and performance controls."],

//       ["22", "FastAPI / REST Integration", "Expose agent capabilities through application APIs and backend services."],

//       ["23", "End-to-End Production Agent", "Combine research, RAG, orchestration, synthesis, and review into one system."],

//       ["24", "Security, Privacy & Reliability", "Handle prompt injection, tool abuse, data leakage, retries, and failure modes."],

//       ["25", "Structured Output, Schemas & Validation", "Return predictable structured results and validate model-generated data."],

//       ["26", "Caching, Context Control & Cost Engineering", "Control token usage, context growth, latency, and model costs."],

//       ["27", "CLI: Commands You Actually Need", "Practical commands for creating, running, evaluating, scaffolding, and deploying agents."],

//       ["28", "Testing Strategy for Agentic Systems", "Build unit, integration, failure-injection, and behavior-focused tests."],

//       ["29", "Observability + Evaluation + Guardrails Pipeline", "Connect telemetry, quality checks, guardrails, and continuous improvement."],

//       ["30", "Troubleshooting Guide", "Diagnose common setup, model, tool, deployment, and runtime problems."],

//       ["31", "Production Checklist", "A practical checklist for taking an agent system toward production."],

//       ["32", "Developer Cheat Sheets & Reference Architecture", "Quick references, architecture patterns, commands, and reusable mental models."],

//     ],

//     []

//   );



//   const learningPoints = [

//     "Build AI agents from scratch using Google ADK",

//     "Connect agents with tools and external APIs",

//     "Work with sessions, state and context",

//     "Build RAG-powered AI agents",

//     "Design multi-agent architectures",

//     "Create sequential and parallel workflows",

//     "Handle errors and unreliable tool calls",

//     "Test and evaluate agent behavior",

//     "Understand production architecture",

//     "Deploy and expose agents through APIs",

//   ];



//   const projects = [

//     [Sparkles, "Research Agent", "Build an agent that researches a topic, gathers information and produces a structured result."],

//     [Code2, "API Agent", "Connect an AI agent with external APIs and allow it to perform real-world actions."],

//     [Layers3, "RAG Agent", "Create an agent that can answer questions using your own documents and knowledge base."],

//     [Users, "Multi-Agent System", "Create specialized agents and orchestrate them into a complete AI workflow."],

//   ];



//   const flowSkills = [

//     ["01", "Python + LLM Foundations", "Models, prompts, context", "Python, LLM APIs, prompts, context windows, structured outputs and basic model interaction patterns."],

//     ["02", "Agent Fundamentals", "Instructions, state, sessions", "How an agent combines instructions, model behavior, tools, sessions and state to become a goal-oriented application component."],

//     ["03", "Tools + Function Calling", "APIs, files, actions", "Tools give agents capabilities outside the model, including APIs, databases, files and controlled application actions."],

//     ["04", "RAG + Memory", "Retrieval, grounding, context", "RAG retrieves relevant information for grounded answers, while memory and state preserve useful context."],

//     ["05", "Multi-Agent + Protocols", "Workflows, MCP, A2A", "Compose specialist agents and connect systems through orchestration patterns, MCP and A2A-style communication."],

//     ["06", "Eval + Observability", "Tests, traces, guardrails", "Evaluation, traces, logs and guardrails help measure quality, diagnose failures and improve systems."],

//     ["07", "Production Engineering", "FastAPI, deployment, security", "Turn prototypes into services with APIs, deployment, security, reliability, performance and monitoring."],

//   ];



//   const faqs = [

//     ["Who is this ebook for?", "It is designed for developers, backend engineers, GenAI learners, and software engineers who want a practical path from ADK fundamentals to production-oriented agent systems."],

//     ["What is covered in the 2nd Edition?", "The handbook covers 32 chapters including agents, tools, workflow agents, sessions and memory, RAG, MCP, A2A, LiteLLM, streaming, artifacts, evaluation, observability, deployment, FastAPI, security, testing, performance, and production checklists."],

//     ["Does the ebook contain code and commands?", "Yes. It follows a concept → flow → code → commands → production notes approach, with implementation examples throughout the handbook."],

//     ["Is prior Google ADK experience required?", "No. The handbook starts with fundamentals and setup before moving into advanced orchestration, integrations, evaluation, and deployment."],

//     ["Is this a video course?", "No. It is a developer-focused ebook and reference handbook designed to accompany hands-on implementation."],

//     ["Is the ebook refundable?", "No. Due to the digital nature of the ebook, all purchases are non-refundable. Please review the contents and FAQ before purchasing."],

//     ["How can I get support?", "For purchase or ebook-related issues, contact supporttargettrek@gmail.com."],

//   ];



//   const chaptersByGroup = [

//     ["FOUNDATIONS", chapters.slice(0, 5)],

//     ["ORCHESTRATION & TOOLS", chapters.slice(5, 11)],

//     ["INTEGRATIONS", chapters.slice(11, 17)],

//     ["PRODUCTION", chapters.slice(17, 25)],

//     ["ENGINEERING & REFERENCE", chapters.slice(25)],

//   ];



  

  

//   useEffect(() => {

//     const controller = new AbortController();



//     const fetchProduct = async () => {

//       try {

//         setLoadingProduct(true);

//         setProductError("");



//         const redirectUrl = window.location.pathname;

//         const response = await fetch(

//           `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(redirectUrl)}`,

//           {

//             method: "GET",

//             cache: "no-store",

//             headers: { Accept: "application/json" },

//             signal: controller.signal,

//           }

//         );



//         const result = await response.json().catch(() => null);



//         if (!response.ok || !result?.success || !result?.data) {

//           throw new Error(

//             result?.error?.message ||

//               result?.message ||

//               "Unable to load ebook details."

//           );

//         }



//         const data = result.data;
//         const price = Number(data.price);

//         if (
//           !data._id ||
//           data.price === null ||
//           data.price === undefined ||
//           String(data.price).trim() === "" ||
//           !Number.isFinite(price) ||
//           price < 0
//         ) {
//           throw new Error("The ebook price is currently unavailable. Please try again.");
//         }

//         setProduct(data);

//       } catch (error) {

//         if (error?.name === "AbortError") return;



//         console.error("Failed to fetch Google ADK ebook:", error);

//         setProduct(null);

//         setProductError(error?.message || "Unable to load ebook details.");

//       } finally {

//         if (!controller.signal.aborted) {

//           setLoadingProduct(false);

//         }

//       }

//     };



//     fetchProduct();

//     return () => controller.abort();

//   }, [BASE_URL, retryCount]);



//   useEffect(() => {

//     if (typeof window === "undefined") return undefined;



//     window.dataLayer = window.dataLayer || [];

//     window.gtag =

//       window.gtag ||

//       function gtag() {

//         window.dataLayer.push(arguments);

//       };



//     const existingScript = document.querySelector(

//       `script[data-google-analytics="${GA_MEASUREMENT_ID}"]`

//     );



//     if (!existingScript) {

//       const script = document.createElement("script");

//       script.async = true;

//       script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

//       script.setAttribute("data-google-analytics", GA_MEASUREMENT_ID);

//       document.head.appendChild(script);

//     }



//     window.gtag("js", new Date());

//     window.gtag("config", GA_MEASUREMENT_ID, {

//       page_title: document.title,

//       page_location: window.location.href,

//     });



//     const updateProgress = () => {

//       const total = document.documentElement.scrollHeight - window.innerHeight;

//       const value = total > 0 ? (window.scrollY / total) * 100 : 0;

//       setScrollProgress(Math.min(100, Math.max(0, value)));

//     };



//     const revealObserver = new IntersectionObserver(

//       (entries) => {

//         entries.forEach((entry) => {

//           if (entry.isIntersecting) {

//             entry.target.classList.add("is-visible");

//             revealObserver.unobserve(entry.target);

//           }

//         });

//       },

//       { threshold: 0.12 }

//     );



//     updateProgress();

//     window.addEventListener("scroll", updateProgress, { passive: true });

//     document

//       .querySelectorAll("[data-reveal]")

//       .forEach((element) => revealObserver.observe(element));



//     return () => {

//       window.removeEventListener("scroll", updateProgress);

//       revealObserver.disconnect();

//     };

//   }, []);





  

//   const handlePurchase = (source = "unknown") => {

//     if (!canBuy) {

//       console.error(

//         productError || "Google ADK ebook information is unavailable."

//       );

//       return;

//     }



//     try {

//       window.dataLayer = window.dataLayer || [];



//       window.dataLayer.push({

//         event: "adk_purchase_click",

//         product: product.slug || "google_adk_handbook_2nd_edition",

//         source,

//         bookId: product._id,

//         price: GOOGLE_ADK_PRICE,

//         currency: GOOGLE_ADK_CURRENCY,

//       });



//       if (typeof window.gtag === "function") {

//         window.gtag("event", "begin_checkout", {

//           currency: GOOGLE_ADK_CURRENCY,

//           value: GOOGLE_ADK_PRICE,

//           source,

//           items: [

//             {

//               item_id: product._id,

//               item_name:

//                 product.title ||

//                 "Google ADK Complete Developer Handbook - 2nd Edition",

//               price: GOOGLE_ADK_PRICE,

//               quantity: 1,

//             },

//           ],

//         });

//       }

//     } catch (error) {

//       console.warn("Purchase analytics failed:", error);

//     }



//     setIsCheckoutOpen(true);

//   };



//   const scrollTo = (id) => {

//     document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

//   };



  

//   const sectionLabel = (text, dark = false) => (

//     <p className={`text-sm font-black uppercase tracking-[0.18em] ${dark ? "text-blue-400" : "text-blue-600"}`}>

//       {text}

//     </p>

//   );



//   const buttonClass =
//     "inline-flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-7 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-blue-600";

//   const localeByCurrency = {
//     INR: "en-IN",
//     USD: "en-US",
//     GBP: "en-GB",
//     EUR: "en-IE",
//     AUD: "en-AU",
//     CAD: "en-CA",
//   };

//   const formatMoney = (amount) => {
//     const value = Number(amount);
//     if (!Number.isFinite(value)) return "";

//     try {
//       return new Intl.NumberFormat(localeByCurrency[GOOGLE_ADK_CURRENCY] || "en", {
//         style: "currency",
//         currency: GOOGLE_ADK_CURRENCY,
//         minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
//         maximumFractionDigits: 2,
//       }).format(value);
//     } catch {
//       return `${GOOGLE_ADK_CURRENCY} ${value}`;
//     }
//   };

//   const retryProduct = () => setRetryCount((count) => count + 1);

//   const canonicalUrl =
//     typeof window !== "undefined"
//       ? `${SITE_URL}${window.location.pathname}`
//       : SITE_URL;

//   const seoImage =
//     product?.coverpageurl ||
//     product?.coverPageUrl ||
//     product?.cover_page_url ||
//     "";

//   const productName =
//     product?.title || "Google ADK Complete Developer Handbook - 2nd Edition";

//   const productSchema = canBuy
//     ? {
//         "@type": "Product",
//         "@id": `${canonicalUrl}#product`,
//         name: productName,
//         description: SEO_DESCRIPTION,
//         ...(seoImage ? { image: [seoImage] } : {}),
//         category: "Google ADK AI Agents Developer Ebook",
//         brand: {
//           "@type": "Brand",
//           name: SITE_NAME,
//         },
//         offers: {
//           "@type": "Offer",
//           url: canonicalUrl,
//           price: GOOGLE_ADK_PRICE,
//           priceCurrency: GOOGLE_ADK_CURRENCY,
//           availability: "https://schema.org/InStock",
//           itemCondition: "https://schema.org/NewCondition",
//           seller: {
//             "@type": "Organization",
//             name: SITE_NAME,
//           },
//           ...(hasMrp
//             ? {
//                 priceSpecification: {
//                   "@type": "UnitPriceSpecification",
//                   price: GOOGLE_ADK_MRP,
//                   priceCurrency: GOOGLE_ADK_CURRENCY,
//                   priceType: "https://schema.org/StrikethroughPrice",
//                 },
//               }
//             : {}),
//         },
//       }
//     : null;

//   const structuredData = {
//     "@context": "https://schema.org",
//     "@graph": [
//       {
//         "@type": "Organization",
//         "@id": `${SITE_URL}/#organization`,
//         name: SITE_NAME,
//         url: SITE_URL,
//         email: "supporttargettrek@gmail.com",
//       },
//       {
//         "@type": "WebSite",
//         "@id": `${SITE_URL}/#website`,
//         url: SITE_URL,
//         name: SITE_NAME,
//         publisher: {
//           "@id": `${SITE_URL}/#organization`,
//         },
//       },
//       {
//         "@type": "WebPage",
//         "@id": `${canonicalUrl}#webpage`,
//         url: canonicalUrl,
//         name: SEO_TITLE,
//         description: SEO_DESCRIPTION,
//         isPartOf: {
//           "@id": `${SITE_URL}/#website`,
//         },
//         about: {
//           "@id": `${canonicalUrl}#book`,
//         },
//       },
//       {
//         "@type": "BreadcrumbList",
//         "@id": `${canonicalUrl}#breadcrumbs`,
//         itemListElement: [
//           {
//             "@type": "ListItem",
//             position: 1,
//             name: "Home",
//             item: SITE_URL,
//           },
//           {
//             "@type": "ListItem",
//             position: 2,
//             name: "Books",
//             item: `${SITE_URL}/books`,
//           },
//           {
//             "@type": "ListItem",
//             position: 3,
//             name: "Google ADK Complete Developer Handbook",
//             item: canonicalUrl,
//           },
//         ],
//       },
//       {
//         "@type": "Book",
//         "@id": `${canonicalUrl}#book`,
//         name: productName,
//         description: SEO_DESCRIPTION,
//         bookEdition: product?.edition || "2nd Edition",
//         inLanguage: product?.language || "English",
//         url: canonicalUrl,
//         publisher: {
//           "@id": `${SITE_URL}/#organization`,
//         },
//         ...(seoImage ? { image: seoImage } : {}),
//       },
//       ...(productSchema ? [productSchema] : []),
//       {
//         "@type": "FAQPage",
//         "@id": `${canonicalUrl}#faq`,
//         mainEntity: faqs.map(([question, answer]) => ({
//           "@type": "Question",
//           name: question,
//           acceptedAnswer: {
//             "@type": "Answer",
//             text: answer,
//           },
//         })),
//       },
//     ],
//   };

//   const PurchaseError = ({ compact = false }) =>
//     productError ? (
//       <div
//         role="alert"
//         className={`rounded-xl border border-red-200 bg-red-50 text-red-700 ${
//           compact ? "mt-2 px-3 py-2 text-[11px]" : "mt-4 p-4 text-sm"
//         }`}
//       >
//         <span>{productError}</span>
//         <button
//           type="button"
//           onClick={retryProduct}
//           className="ml-2 font-bold underline underline-offset-2"
//         >
//           Retry
//         </button>
//       </div>
//     ) : null;



//   return (

//     <main className="min-h-screen bg-[#f7f9fc] text-slate-900">
//       <Helmet>
//         <title>{SEO_TITLE}</title>
//         <meta name="description" content={SEO_DESCRIPTION} />
//         <meta name="author" content={SITE_NAME} />
//         <meta name="application-name" content={SITE_NAME} />
//         <meta
//           name="robots"
//           content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
//         />
//         <meta
//           name="googlebot"
//           content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
//         />
//         <meta name="theme-color" content="#2563eb" />
//         <link rel="canonical" href={canonicalUrl} />
//         <meta property="og:type" content="website" />
//         <meta property="og:site_name" content={SITE_NAME} />
//         <meta property="og:locale" content="en_IN" />
//         <meta property="og:title" content={SEO_TITLE} />
//         <meta property="og:description" content={SEO_DESCRIPTION} />
//         <meta property="og:url" content={canonicalUrl} />
//         {seoImage && <meta property="og:image" content={seoImage} />}
//         {seoImage && (
//           <meta
//             property="og:image:alt"
//             content={`${productName} ebook cover`}
//           />
//         )}
//         {canBuy && (
//           <meta
//             property="product:price:amount"
//             content={String(GOOGLE_ADK_PRICE)}
//           />
//         )}
//         {canBuy && (
//           <meta
//             property="product:price:currency"
//             content={GOOGLE_ADK_CURRENCY}
//           />
//         )}
//         <meta name="twitter:card" content="summary_large_image" />
//         <meta name="twitter:title" content={SEO_TITLE} />
//         <meta name="twitter:description" content={SEO_DESCRIPTION} />
//         {seoImage && <meta name="twitter:image" content={seoImage} />}
//         <script type="application/ld+json">
//           {JSON.stringify(structuredData)}
//         </script>
//       </Helmet>

//       <style>{`

//         html { scroll-behavior: smooth; }

//         [data-reveal] {

//           opacity: 0;

//           transform: translateY(28px);

//           transition: opacity .7s ease, transform .7s ease;

//         }

//         [data-reveal].is-visible {

//           opacity: 1;

//           transform: translateY(0);

//         }

//         @keyframes codeIn {

//           from { opacity: 0; transform: translateY(10px); }

//           to { opacity: 1; transform: translateY(0); }

//         }

//         @keyframes floatBook {

//           0%,100% { transform: translateY(0) rotate(-3deg); }

//           50% { transform: translateY(-10px) rotate(-2deg); }

//         }

//         .animate-code-in { animation: codeIn .35s ease both; }

//         .animate-float-book { animation: floatBook 5s ease-in-out infinite; }

//         @media (prefers-reduced-motion: reduce) {

//           html { scroll-behavior: auto; }

//           [data-reveal] { opacity: 1; transform: none; transition: none; }

//           .animate-code-in,

//           .animate-float-book { animation: none; }

//         }

//       `}</style>



//       <div className="fixed left-0 right-0 top-0 z-[70] h-1 bg-slate-200">

//         <div

//           className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-600 transition-[width] duration-100"

//           style={{ width: `${scrollProgress}%` }}

//         />

//       </div>



      

//       <section className="relative overflow-hidden bg-white pt-14 lg:pt-20">

//         <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />

//         <div className="absolute -right-40 top-10 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-3xl" />



//         <div className="relative mx-auto max-w-7xl px-6 pb-20 lg:px-8 lg:pb-28">

//           <div className="grid items-center gap-16 lg:grid-cols-[1.08fr_.92fr]">

//             <div>

//               <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">

//                 <Sparkles size={16} />

//                 2nd Edition • Developer Handbook

//               </div>



//               <h1 className="mt-7 text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">

//                 Learn Google ADK

//                 <span className="block text-blue-600">by Building Real AI Agents</span>

//               </h1>



//               <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">

//                 A practical, code-first developer handbook that takes you from your first Google ADK agent to tools, RAG, MCP, A2A, multi-agent workflows, evaluation and production deployment.

//               </p>



//               <div className="mt-8 flex flex-wrap gap-3">

//                 {["32 Chapters", "Practical Code", "RAG + MCP + A2A", "Production Topics"].map((item) => (

//                   <span key={item} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">

//                     {item}

//                   </span>

//                 ))}

//               </div>



//               <div className="mt-10 flex flex-col gap-3 sm:flex-row">

//                 <button
//                   type="button"
//                   onClick={() => handlePurchase("hero")}
//                   disabled={!canBuy}
//                   className={buttonClass}
//                 >
//                   {loadingProduct
//                     ? "LOADING PRICE..."
//                     : canBuy
//                     ? "GET INSTANT PDF ACCESS"
//                     : "PRICE UNAVAILABLE"}

//                   {canBuy && (
//                     <span className="flex items-center gap-2">
//                       {hasMrp && (
//                         <span className="text-sm text-blue-200 line-through">
//                           {formatMoney(GOOGLE_ADK_MRP)}
//                         </span>
//                       )}
//                       <span className="text-lg">
//                         {formatMoney(GOOGLE_ADK_PRICE)}
//                       </span>
//                     </span>
//                   )}

//                   <ArrowRight size={19} />
//                 </button>



//                 <button

//                   type="button"

//                   onClick={() => scrollTo("contents")}

//                   className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-4 font-bold text-slate-700 transition hover:bg-slate-50"

//                 >

//                   See What's Inside

//                 </button>

//               </div>

//               <PurchaseError />

//               <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">

//                 <span>✓ One-time payment</span>

//                 <span>✓ Instant digital access</span>

//                 <span>✓ No subscription</span>

//               </div>

//             </div>



//             <div className="flex justify-center lg:justify-end">

//               <div className="relative">

//                 <div className="absolute -inset-12 rounded-full bg-blue-500/15 blur-3xl" />

//                 <div className="animate-float-book relative w-[300px] rounded-r-2xl rounded-l-md border border-slate-200 bg-gradient-to-br from-[#173d78] via-[#0d63c9] to-[#37238d] p-8 shadow-2xl sm:w-[360px]">

//                   <div className="absolute left-0 top-0 h-full w-3 rounded-l-md bg-black/20" />

//                   <div className="flex h-[480px] flex-col justify-between">

//                     <div>

//                       <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">

//                         <Terminal size={15} />

//                         Developer Handbook

//                       </div>

//                       <div className="mt-7 h-px bg-white/20" />

//                       <p className="mt-10 text-xs font-black uppercase tracking-[0.22em] text-blue-100">2nd Edition</p>

//                       <h2 className="mt-4 text-4xl font-black leading-[1.02] text-white">

//                         Google<br />ADK<br />Complete<br />Developer<br />Handbook

//                       </h2>

//                       <p className="mt-5 max-w-[240px] text-sm leading-6 text-blue-100">

//                         From first agent to RAG, MCP, A2A, evaluation, observability and production deployment.

//                       </p>

//                     </div>

//                     <div>

//                       <div className="flex flex-wrap gap-2">

//                         {["Agents", "RAG", "MCP", "A2A", "Production"].map((tag) => (

//                           <span key={tag} className="rounded-lg bg-white/10 px-3 py-2 text-[10px] font-bold text-white">{tag}</span>

//                         ))}

//                       </div>

//                       <p className="mt-5 text-xs font-bold text-blue-100">Practical • Code-first • Production-aware</p>

//                     </div>

//                   </div>

//                 </div>



//                 <div className="absolute -bottom-6 -right-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-2xl sm:-right-8">

//                   <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Current Price</p>

//                   <div className="mt-1 flex items-center gap-2">
//                     {loadingProduct ? (
//                       <span className="text-sm font-bold text-slate-500">
//                         Loading price...
//                       </span>
//                     ) : canBuy ? (
//                       <>
//                         {hasMrp && (
//                           <span className="text-sm font-bold text-slate-400 line-through">
//                             {formatMoney(GOOGLE_ADK_MRP)}
//                           </span>
//                         )}
//                         <span className="text-3xl font-black text-blue-600">
//                           {formatMoney(GOOGLE_ADK_PRICE)}
//                         </span>
//                       </>
//                     ) : (
//                       <span className="text-sm font-bold text-red-600">
//                         Price unavailable
//                       </span>
//                     )}
//                   </div>

//                 </div>

//               </div>

//             </div>

//           </div>

//         </div>

//       </section>



      

//       <section className="border-y border-slate-200 bg-white" data-reveal>

//         <div className="mx-auto grid max-w-6xl grid-cols-2 lg:grid-cols-4">

//           {[

//             ["32 Chapters", "Structured learning path"],

//             ["Code-First", "Commands + implementation"],

//             ["RAG / MCP / A2A", "Modern agent integrations"],

//             ["Production", "Evaluation + deployment"],

//           ].map(([title, description]) => (

//             <div key={title} className="border-r border-slate-200 px-5 py-7 text-center last:border-r-0">

//               <p className="font-black">{title}</p>

//               <p className="mt-1 text-sm text-slate-500">{description}</p>

//             </div>

//           ))}

//         </div>

//       </section>



      

//       <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8" data-reveal>

//         <div className="grid items-center gap-14 lg:grid-cols-[.82fr_1.18fr]">

//           <div>

//             {sectionLabel("Built for developers")}

//             <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Stop jumping between scattered concepts.</h2>

//             <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">

//               Learning agent development can involve agents, tools, orchestration, memory, RAG, protocols, evaluation and deployment. This handbook puts those topics into one structured developer-focused learning path.

//             </p>

//           </div>



//           <div className="grid gap-5 sm:grid-cols-2">

//             {[

//               [BookOpen, "Structured path", "Move from fundamentals to advanced topics instead of learning isolated concepts."],

//               [Code2, "Implementation focused", "Follow concepts with flows, code, commands and practical development context."],

//               [Network, "Connect the pieces", "Understand how agents, tools, RAG, MCP, A2A and APIs fit together."],

//               [Rocket, "Production aware", "Explore evaluation, observability, security, testing and deployment."],

//             ].map(([Icon, title, description]) => (

//               <div key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

//                 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={23} /></div>

//                 <h3 className="mt-5 text-xl font-black">{title}</h3>

//                 <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>

//               </div>

//             ))}

//           </div>

//         </div>

//       </section>



      

//       <section className="bg-white py-24" data-reveal>

//         <div className="mx-auto max-w-6xl px-6 lg:px-8">

//           <div className="grid gap-12 lg:grid-cols-2">

//             <div>

//               {sectionLabel("The real value")}

//               <h2 className="mt-3 text-4xl font-black sm:text-5xl">Why not just use the free documentation?</h2>

//               <p className="mt-6 text-lg leading-8 text-slate-600">

//                 Official documentation remains an important source of truth. This handbook is positioned differently: it gives you a structured learning sequence focused on the developer journey from fundamentals through implementation and production topics.

//               </p>

//             </div>



//             <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">

//               <div className="grid grid-cols-2 border-b border-slate-200">

//                 <div className="p-5 text-sm font-black text-slate-500">Learning challenge</div>

//                 <div className="p-5 text-sm font-black text-blue-600">Handbook approach</div>

//               </div>

//               {[

//                 ["Where do I start?", "Fundamentals → setup → first agent"],

//                 ["How do concepts connect?", "Concept → flow → code"],

//                 ["What comes after agents?", "Tools → workflows → RAG → protocols"],

//                 ["How do I approach production?", "Evaluation → observability → security → deployment"],

//               ].map(([left, right]) => (

//                 <div key={left} className="grid grid-cols-2 border-b border-slate-200 last:border-b-0">

//                   <div className="p-5 text-sm text-slate-500">{left}</div>

//                   <div className="p-5 text-sm font-semibold text-slate-700">{right}</div>

//                 </div>

//               ))}

//             </div>

//           </div>

//         </div>

//       </section>



      

//       <section className="bg-slate-50 py-24" data-reveal>

//         <div className="mx-auto max-w-7xl px-6 lg:px-8">

//           <div className="grid gap-14 lg:grid-cols-[.78fr_1.22fr]">

//             <div>

//               {sectionLabel("What you learn")}

//               <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">One handbook for the full agent lifecycle.</h2>

//               <p className="mt-5 leading-8 text-slate-600">Start with the mental model and setup. Then move into orchestration, integrations, evaluation, operations and production.</p>

//               <button
//                 type="button"
//                 onClick={() => handlePurchase("learning_section")}
//                 disabled={!canBuy}
//                 className={`${buttonClass} mt-8`}
//               >
//                 {loadingProduct
//                   ? "Loading price..."
//                   : canBuy
//                   ? "Get Instant Access"
//                   : "Price unavailable"}{" "}
//                 <ArrowRight size={18} />
//               </button>
//               <PurchaseError />

//             </div>



//             <div className="grid gap-3 sm:grid-cols-2">

//               {learningPoints.map((item) => (

//                 <div key={item} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">

//                   <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"><Check size={13} strokeWidth={3} /></span>

//                   <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>

//                 </div>

//               ))}

//             </div>

//           </div>

//         </div>

//       </section>



      

//       <section className="bg-white py-24" data-reveal>

//         <div className="mx-auto max-w-7xl px-6 lg:px-8">

//           <div className="text-center">

//             {sectionLabel("What is inside")}

//             <h2 className="mt-3 text-4xl font-black sm:text-5xl">The topics developers actually need.</h2>

//           </div>



//           <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

//             {[

//               [Terminal, "Agents", "LlmAgent, custom agents and agent behavior."],

//               [Zap, "Orchestration", "Sequential, parallel, loop and graph workflows."],

//               [Database, "RAG", "Retrieval, grounding, ingestion and knowledge systems."],

//               [Network, "Protocols", "MCP and A2A integration patterns."],

//               [Search, "Tools", "Function calling, APIs, files and toolsets."],

//               [TestTube, "Evaluation", "Datasets, metrics and eval-fix workflows."],

//               [Server, "Deployment", "Runtime, Cloud Run, GKE and REST APIs."],

//               [Lock, "Security", "Privacy, reliability, guardrails and failure modes."],

//             ].map(([Icon, title, description]) => (

//               <div key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-lg">

//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={21} /></div>

//                 <h3 className="mt-5 text-lg font-black">{title}</h3>

//                 <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

//               </div>

//             ))}

//           </div>

//         </div>

//       </section>



      

//       <section className="bg-slate-50 py-24" data-reveal>

//         <div className="mx-auto max-w-7xl px-6 lg:px-8">

//           {sectionLabel("Build with the concepts")}

//           <h2 className="mt-3 max-w-3xl text-4xl font-black sm:text-5xl">Learn by thinking in real agent systems.</h2>

//           <p className="mt-5 max-w-3xl leading-8 text-slate-600">The handbook includes patterns around research agents, API agents, RAG systems and multi-agent architectures.</p>



//           <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

//             {projects.map(([Icon, title, description], index) => (

//               <div key={title} className="group rounded-3xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">

//                 <div className="flex items-center justify-between">

//                   <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={23} /></div>

//                   <span className="font-mono text-xs font-bold text-slate-400">0{index + 1}</span>

//                 </div>

//                 <h3 className="mt-6 text-xl font-black">{title}</h3>

//                 <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>

//               </div>

//             ))}

//           </div>

//         </div>

//       </section>



      

//       <section className="bg-blue-50 py-24" data-reveal>

//         <div className="mx-auto max-w-7xl px-6 lg:px-8">

//           <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">

//             <div>

//               <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-black text-blue-700">

//                 <Zap size={16} /> Interview quick revision

//               </div>

//               <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">

//                 Less time before your interview?

//                 <span className="block text-blue-700">Use the handbook for fast revision.</span>

//               </h2>

//               <p className="mt-6 text-lg leading-8 text-slate-600">

//                 If you have less time for an interview, this handbook gives you a structured way to quickly revise the major GenAI and Google ADK topics — agents, workflows, RAG, MCP, A2A, evaluation, observability, deployment, security and production patterns.

//               </p>

//               <button
//                 type="button"
//                 onClick={() => handlePurchase("interview_revision")}
//                 disabled={!canBuy}
//                 className={`${buttonClass} mt-8`}
//               >
//                 {loadingProduct
//                   ? "Loading price..."
//                   : canBuy
//                   ? "Revise Faster"
//                   : "Price unavailable"}{" "}
//                 <ArrowRight size={18} />
//               </button>
//               <PurchaseError />

//             </div>



//             <div className="grid gap-3 sm:grid-cols-2">

//               {[

//                 ["01", "Core concepts", "Agent mental model, ADK and setup"],

//                 ["02", "Architecture", "Tools, workflows, RAG, MCP and A2A"],

//                 ["03", "Production", "Evals, tracing, security and deployment"],

//                 ["04", "Reference", "Commands, checklists and architecture patterns"],

//               ].map(([number, title, description]) => (

//                 <div key={number} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

//                   <span className="font-mono text-xs font-black text-blue-600">{number}</span>

//                   <h3 className="mt-4 text-lg font-black">{title}</h3>

//                   <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

//                 </div>

//               ))}

//             </div>

//           </div>

//         </div>

//       </section>



      

//       <section className="relative z-20 bg-white py-24" data-reveal>

//         <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8">

//           <div className="mx-auto max-w-3xl text-center">

//             {sectionLabel("GenAI engineer roadmap")}

//             <h2 className="mt-3 text-4xl font-black sm:text-5xl">See how the skills connect.</h2>

//             <p className="mt-5 leading-8 text-slate-600">

//               Follow the connected path from foundations to production. Hover on desktop or tap on mobile to understand each skill.

//             </p>

//           </div>



//           <div className="relative mt-14">

//             <div className="pointer-events-none absolute left-[6%] right-[6%] top-[78px] hidden h-1 rounded-full bg-gradient-to-r from-blue-100 via-blue-400 to-indigo-200 lg:block" />



//             <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-7">

//               {flowSkills.map(([number, title, short, detail], index) => {

//                 const isActive = activeSkill === number;



//                 return (

//                   <div

//                     key={number}

//                     className="relative z-40"

//                     onMouseEnter={() => setActiveSkill(number)}

//                     onMouseLeave={() => setActiveSkill(null)}

//                   >

//                     <button

//                       type="button"

//                       onFocus={() => setActiveSkill(number)}

//                       onClick={() => setActiveSkill(isActive ? null : number)}

//                       className={`relative flex min-h-[210px] w-full flex-col rounded-[28px] border p-5 text-left transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 ${

//                         isActive

//                           ? "-translate-y-2 border-blue-300 bg-blue-50 shadow-xl shadow-blue-100"

//                           : "border-slate-200 bg-white hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"

//                       }`}

//                     >

//                       <div className="flex items-center justify-between">

//                         <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xs font-black text-blue-700 ring-1 ring-blue-100">{number}</span>

//                         {index < flowSkills.length - 1 && <ArrowRight className="hidden text-blue-300 lg:block" size={18} />}

//                       </div>

//                       <h3 className="mt-6 text-sm font-black leading-5">{title}</h3>

//                       <p className="mt-2 text-xs leading-5 text-slate-500">{short}</p>

//                       <div className={`mt-auto pt-5 transition-all ${isActive ? "w-full" : "w-8"} h-1 rounded-full bg-blue-500`} />

//                     </button>



//                     {isActive && (

//                       <div className="pointer-events-auto absolute bottom-full left-1/2 z-[100] mb-3 w-[280px] -translate-x-1/2 rounded-2xl border border-blue-100 bg-white p-5 text-left shadow-2xl">

//                         <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">{number} • Skill</p>

//                         <h4 className="mt-2 text-sm font-black">{title}</h4>

//                         <p className="mt-2 text-xs leading-6 text-slate-600">{detail}</p>

//                       </div>

//                     )}

//                   </div>

//                 );

//               })}

//             </div>

//           </div>

//         </div>

//       </section>



      

//       <section className="bg-white py-24" data-reveal>

//         <div className="mx-auto max-w-7xl px-6 lg:px-8">

//           <div className="mx-auto max-w-3xl text-center">

//             {sectionLabel("Interactive code tour")}

//             <h2 className="mt-3 text-4xl font-black sm:text-5xl">Hover or tap to switch the examples.</h2>

//             <p className="mt-5 leading-8 text-slate-600">Explore four representative patterns: a core agent, function calling, RAG retrieval and sequential multi-agent orchestration.</p>

//           </div>



//           <div className="mt-12 overflow-hidden rounded-[28px] border border-slate-800 bg-[#050b14] shadow-2xl">

//             <div className="border-b border-slate-700 bg-white/[0.03] p-2">

//               <div className="flex gap-2 overflow-x-auto">

//                 {codeExamples.map((item, index) => (

//                   <button

//                     key={item.id}

//                     type="button"

//                     onMouseEnter={() => setActiveCode(index)}

//                     onFocus={() => setActiveCode(index)}

//                     onClick={() => setActiveCode(index)}

//                     className={`group relative min-w-max rounded-xl px-4 py-3 text-left transition-all duration-300 ${activeCode === index ? "bg-white/10 text-white shadow-lg" : "text-slate-500 hover:bg-white/[0.06] hover:text-slate-200"}`}

//                   >

//                     <span className="block text-[11px] font-black uppercase tracking-[0.12em]">{item.label}</span>

//                     <span className="mt-0.5 block text-xs font-semibold">{item.title}</span>

//                     <span className={`absolute inset-x-3 bottom-0 h-0.5 origin-left rounded-full bg-blue-400 transition-transform duration-300 ${activeCode === index ? "scale-x-100" : "scale-x-0"}`} />

//                   </button>

//                 ))}

//               </div>

//             </div>



//             <div className="grid lg:grid-cols-[.8fr_1.2fr]">

//               <div className="border-b border-slate-700 p-7 lg:border-b-0 lg:border-r lg:p-9">

//                 <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-blue-400"><Code2 size={15} />{codeExamples[activeCode].label}</div>

//                 <h3 className="mt-4 text-2xl font-black text-white">{codeExamples[activeCode].title}</h3>

//                 <p className="mt-4 text-sm leading-7 text-slate-400">{codeExamples[activeCode].description}</p>

//                 <div className="mt-7 flex flex-wrap gap-2">

//                   {["Concept", "Flow", "Code", "Production"].map((tag) => (

//                     <span key={tag} className="rounded-full border border-slate-700 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-slate-400">{tag}</span>

//                   ))}

//                 </div>

//               </div>



//               <div className="min-h-[390px] bg-[#02060d]">

//                 <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">

//                   <span className="h-3 w-3 rounded-full bg-red-400" />

//                   <span className="h-3 w-3 rounded-full bg-yellow-400" />

//                   <span className="h-3 w-3 rounded-full bg-green-400" />

//                   <span className="ml-3 text-xs font-semibold text-slate-500">{codeExamples[activeCode].id}.py</span>

//                 </div>

//                 <pre className="max-h-[520px] overflow-auto p-6 text-[12px] leading-6 text-slate-300 sm:text-[13px]">

//                   <code key={codeExamples[activeCode].id} className="block animate-code-in">{codeExamples[activeCode].code}</code>

//                 </pre>

//               </div>

//             </div>

//           </div>

//         </div>

//       </section>



      

//       <section className="bg-blue-50 py-24" data-reveal>

//         <div className="mx-auto max-w-7xl px-6 lg:px-8">

//           <div className="grid items-center gap-12 lg:grid-cols-2">

//             <div>

//               {sectionLabel("Code-first learning")}

//               <h2 className="mt-3 text-4xl font-black sm:text-5xl">Understand the flow.<br />Then write the code.</h2>

//               <p className="mt-6 leading-8 text-slate-600">The handbook does not stop at definitions. It explains how agent components connect and gives implementation examples and commands for important building blocks.</p>

//               <div className="mt-8 grid gap-3 sm:grid-cols-2">

//                 {["Installation & authentication", "Agent implementations", "Workflow orchestration", "RAG implementation", "MCP integration", "Evaluation & deployment"].map((item) => (

//                   <div key={item} className="flex items-center gap-2 text-sm font-bold text-slate-700"><Check size={17} className="text-blue-600" />{item}</div>

//                 ))}

//               </div>

//             </div>



//             <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">

//               <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">

//                 <span className="h-3 w-3 rounded-full bg-red-400" />

//                 <span className="h-3 w-3 rounded-full bg-yellow-400" />

//                 <span className="h-3 w-3 rounded-full bg-green-400" />

//                 <span className="ml-3 text-xs text-slate-500">agent.py</span>

//               </div>

//               <pre className="overflow-x-auto p-6 text-sm leading-7 text-slate-300"><code>{`from google.adk.agents import LlmAgent



// root_agent = LlmAgent(

//     name="research_agent",

//     model="gemini-2.5-flash",

//     instruction="""

//     Research the user's topic and

//     return a structured answer.

//     """,

// )`}</code></pre>

//             </div>

//           </div>

//         </div>

//       </section>



      

//       <section id="contents" className="bg-white py-24" data-reveal>

//         <div className="mx-auto max-w-7xl px-6 lg:px-8">

//           {sectionLabel("32-chapter contents")}

//           <h2 className="mt-3 max-w-3xl text-4xl font-black sm:text-5xl">From your first agent to production architecture.</h2>

//           <p className="mt-5 max-w-3xl leading-8 text-slate-600">Every chapter follows a practical structure: concept → flow → code → commands → how it works → production notes.</p>



//           <div className="mt-14 space-y-12">

//             {chaptersByGroup.map(([label, items]) => (

//               <div key={label}>

//                 <p className="mb-4 text-xs font-black tracking-[0.2em] text-blue-600">{label}</p>

//                 <div className="grid gap-3 md:grid-cols-2">

//                   {items.map(([number, title, description]) => (

//                     <div key={number} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:bg-slate-50">

//                       <div className="flex gap-4">

//                         <span className="font-mono text-sm font-black text-blue-600">{number}</span>

//                         <div>

//                           <h3 className="font-bold">{title}</h3>

//                           <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>

//                         </div>

//                       </div>

//                     </div>

//                   ))}

//                 </div>

//               </div>

//             ))}

//           </div>

//         </div>

//       </section>



      

//       <section className="border-y border-slate-200 bg-blue-50 py-16">

//         <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-7 px-6 text-center lg:flex-row lg:text-left lg:px-8">

//           <div>

//             <p className="text-sm font-black uppercase tracking-[.18em] text-blue-600">Ready to build?</p>

//             <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Get the complete developer handbook.</h2>

//             <p className="mt-2 text-slate-600">32 chapters • Code • RAG • MCP • A2A • Production</p>

//           </div>

//           <div className="shrink-0">
//             <button
//               type="button"
//               onClick={() => handlePurchase("mid_page")}
//               disabled={!canBuy}
//               className="inline-flex items-center gap-3 rounded-xl bg-blue-600 px-7 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-blue-600"
//             >
//               {loadingProduct
//                 ? "Loading price..."
//                 : canBuy
//                 ? "Get Instant PDF Access"
//                 : "Price unavailable"}
//               {canBuy && <span>{formatMoney(GOOGLE_ADK_PRICE)}</span>}
//               <ArrowRight size={19} />
//             </button>
//             <PurchaseError compact />
//           </div>

//         </div>

//       </section>



      

//       <section id="pricing" className="bg-slate-50 py-24" data-reveal>

//         <div className="mx-auto max-w-5xl px-6 lg:px-8">

//           <div className="text-center">

//             <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"><Sparkles size={16} /> Google ADK • 2nd Edition</div>

//             <h2 className="mt-5 text-4xl font-black sm:text-5xl">A practical reference for your ADK journey.</h2>

//             <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">Learn the concepts, follow the implementation patterns and understand the production lifecycle in one developer handbook.</p>

//           </div>



//           <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

//             <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />

//             <div className="grid lg:grid-cols-[1.2fr_.8fr]">

//               <div className="p-8 sm:p-10 lg:p-12">

//                 <p className="text-sm font-black uppercase tracking-wider text-blue-600">Google ADK Complete Developer Handbook</p>

//                 <h3 className="mt-2 text-3xl font-black">2nd Edition</h3>

//                 <p className="mt-4 leading-7 text-slate-600">32 chapters covering agent fundamentals, orchestration, tools, RAG, MCP, A2A, evaluation, observability, deployment, security, testing, performance and developer references.</p>

//                 <div className="mt-8 grid gap-3 sm:grid-cols-2">

//                   {["32 structured chapters", "Code & command examples", "RAG + MCP + A2A", "Evaluation & observability", "Deployment & FastAPI", "Security & testing"].map((item) => (

//                     <div key={item} className="flex gap-2 text-sm font-semibold text-slate-600"><Check size={17} className="mt-0.5 shrink-0 text-blue-600" />{item}</div>

//                   ))}

//                 </div>

//               </div>



//               <div className="border-t border-slate-200 bg-slate-50 p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-10">

//                 <div className="flex h-full flex-col justify-center">

//                   <p className="text-sm font-bold text-slate-500">
//                     {hasMrp ? "Regular price" : "Current price"}
//                   </p>

//                   <div className="mt-2 flex items-end gap-3">
//                     {loadingProduct ? (
//                       <span className="text-2xl font-black text-slate-500">
//                         Loading price...
//                       </span>
//                     ) : canBuy ? (
//                       <>
//                         {hasMrp && (
//                           <span className="text-2xl font-bold text-slate-400 line-through">
//                             {formatMoney(GOOGLE_ADK_MRP)}
//                           </span>
//                         )}
//                         <span className="text-5xl font-black">
//                           {formatMoney(GOOGLE_ADK_PRICE)}
//                         </span>
//                       </>
//                     ) : (
//                       <span className="text-2xl font-black text-red-600">
//                         Price unavailable
//                       </span>
//                     )}
//                   </div>

//                   <p className="mt-3 text-sm leading-6 text-slate-500">One-time payment.<br />No subscription required.</p>

//                   <button
//                     type="button"
//                     onClick={() => handlePurchase("pricing")}
//                     disabled={!canBuy}
//                     className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-black text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//                   >
//                     {loadingProduct
//                       ? "LOADING PRICE..."
//                       : canBuy
//                       ? "GET INSTANT PDF ACCESS"
//                       : "PRICE UNAVAILABLE"}{" "}
//                     <ArrowRight size={18} />
//                   </button>
//                   <PurchaseError />

//                   <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400"><ShieldCheck size={15} className="text-green-500" />Secure payment • Instant access</div>

//                 </div>

//               </div>

//             </div>

//           </div>



//           <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center">

//             <p className="text-sm font-semibold text-slate-700">Digital Product</p>

//             <p className="mt-1 text-xs leading-5 text-slate-500">Due to the digital nature of this ebook, all purchases are final and non-refundable. Please review the contents and FAQ before purchasing.</p>

//             <p className="mt-2 text-xs text-slate-500">Purchase or ebook support: <a href="mailto:supporttargettrek@gmail.com" className="font-semibold underline">supporttargettrek@gmail.com</a></p>

//           </div>

//         </div>

//       </section>



      

//       <section className="bg-white py-24" data-reveal>

//         <div className="mx-auto max-w-4xl px-6 lg:px-8">

//           <div className="text-center">

//             {sectionLabel("FAQ")}

//             <h2 className="mt-3 text-4xl font-black sm:text-5xl">Questions before you buy?</h2>

//             <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">Here are the important details about the handbook and purchase.</p>

//           </div>



//           <div className="mt-10 space-y-3">

//             {faqs.map(([question, answer], index) => (

//               <div key={question} className="rounded-2xl border border-slate-200 bg-white shadow-sm">

//                 <button
//                   type="button"
//                   onClick={() => setOpenFaq(openFaq === index ? null : index)}
//                   aria-expanded={openFaq === index}
//                   aria-controls={`adk-faq-${index}`}
//                   className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold"
//                 >

//                   <span>{question}</span>

//                   <ChevronDown size={20} className={`shrink-0 text-slate-400 transition-transform ${openFaq === index ? "rotate-180" : ""}`} />

//                 </button>

//                 {openFaq === index && (
//                   <p
//                     id={`adk-faq-${index}`}
//                     className="px-5 pb-5 pr-12 text-sm leading-7 text-slate-600"
//                   >
//                     {answer}
//                   </p>
//                 )}

//               </div>

//             ))}

//           </div>

//         </div>

//       </section>



      

//       <section className="border-t border-slate-200 bg-white px-6 py-24 text-center" data-reveal>

//         <div className="mx-auto max-w-3xl">

//           <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Rocket size={27} /></div>

//           <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-5xl">Start building AI agents with Google ADK.</h2>

//           <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-600">Learn the fundamentals, understand the architecture, write the code and explore the production lifecycle in one developer handbook.</p>

//           <div className="mt-7 flex items-center justify-center gap-3">
//             {loadingProduct ? (
//               <span className="text-lg font-bold text-slate-500">Loading price...</span>
//             ) : canBuy ? (
//               <>
//                 {hasMrp && (
//                   <span className="text-xl font-bold text-slate-400 line-through">
//                     {formatMoney(GOOGLE_ADK_MRP)}
//                   </span>
//                 )}
//                 <span className="text-4xl font-black text-blue-600">
//                   {formatMoney(GOOGLE_ADK_PRICE)}
//                 </span>
//               </>
//             ) : (
//               <span className="text-lg font-bold text-red-600">Price unavailable</span>
//             )}
//           </div>

//           <button
//             type="button"
//             onClick={() => handlePurchase("footer")}
//             disabled={!canBuy}
//             className={`${buttonClass} mt-7`}
//           >
//             {loadingProduct
//               ? "LOADING PRICE..."
//               : canBuy
//               ? "GET INSTANT PDF ACCESS"
//               : "PRICE UNAVAILABLE"}{" "}
//             <ArrowRight size={19} />
//           </button>
//           <PurchaseError />

//           <p className="mt-6 text-xs leading-5 text-slate-400">Non-refundable digital product • Support: <a href="mailto:supporttargettrek@gmail.com" className="font-semibold text-slate-500">supporttargettrek@gmail.com</a></p>

//           <p className="mt-2 text-xs text-slate-400">Google ADK Complete Developer Handbook • 2nd Edition</p>

//         </div>

//       </section>



      

//       <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
//         <div className="mx-auto max-w-lg">
//           <div className="flex items-center gap-3">
//             <div className="min-w-0 flex-1">
//               <p className="truncate text-xs font-bold text-slate-500">Google ADK Handbook</p>
//               <div className="flex items-center gap-2">
//                 {loadingProduct ? (
//                   <span className="text-xs font-bold text-slate-500">Loading...</span>
//                 ) : canBuy ? (
//                   <>
//                     {hasMrp && (
//                       <span className="text-xs font-bold text-slate-400 line-through">
//                         {formatMoney(GOOGLE_ADK_MRP)}
//                       </span>
//                     )}
//                     <span className="text-lg font-black text-blue-600">
//                       {formatMoney(GOOGLE_ADK_PRICE)}
//                     </span>
//                   </>
//                 ) : (
//                   <span className="text-xs font-bold text-red-600">Price unavailable</span>
//                 )}
//               </div>
//             </div>

//             <button
//               type="button"
//               onClick={() => handlePurchase("mobile_sticky")}
//               disabled={!canBuy}
//               className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               Buy Now <ArrowRight size={16} />
//             </button>
//           </div>
//           <PurchaseError compact />
//         </div>
//       </div>

//       <PayUCheckoutModal

//         isOpen={isCheckoutOpen && canBuy}

//         onClose={() => setIsCheckoutOpen(false)}

//         product={product}

//       />



//     </main>

//   );

// }
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Helmet } from "react-helmet";


import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Database,
  Layers3,
  Lock,
  Network,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  TestTube,
  Users,
  Zap,
} from "lucide-react";

import PayUCheckoutModal from "../payment/PayUCheckoutModal";

const SITE_URL =
  "https://www.targettrek.in";

const PAGE_PATH =
  "/book/genai/google-adk";

const PAGE_URL =
  `${SITE_URL}${PAGE_PATH}`;

const SITE_NAME =
  "TargetTrek";

const THEME_KEY =
  "theme";

const THEME_EVENT =
  "targettrek-theme-change";

const SEO_TITLE =
  "Google ADK Complete Developer Handbook – AI Agents, RAG, MCP & A2A | TargetTrek";

const SEO_DESCRIPTION =
  "Learn Google ADK with a practical developer handbook covering AI agents, tools, RAG, MCP, A2A, multi-agent workflows, sessions, evaluation, observability, security, FastAPI and production deployment.";

const readTheme = () => {
  if (
    typeof window === "undefined"
  ) {
    return "light";
  }

  const saved =
    window.localStorage.getItem(
      THEME_KEY
    );

  return saved === "dark"
    ? "dark"
    : "light";
};

const CODE_EXAMPLES = [
  {
    id: "agent",
    label: "01 • Agent",
    title: "Minimal LLM Agent",
    description:
      "Start with the core agent primitive before composing larger systems.",
    code: `from google.adk.agents import Agent

root_agent = Agent(
    name="support_agent",
    model="gemini-flash-latest",
    instruction="""
    You are a customer-support assistant.
    Be concise.
    Never invent account data.
    Use tools when account information is required.
    """,
)`,
  },

  {
    id: "tool",
    label: "02 • Tool",
    title: "Function Calling",
    description:
      "Connect an agent to deterministic Python functions and external systems.",
    code: `from google.adk.agents import Agent

def get_order_status(order_id: str) -> dict:
    """Return the status of an order by ID."""

    if not order_id.strip():
        return {
            "ok": False,
            "error": "order_id is required"
        }

    return {
        "ok": True,
        "order_id": order_id,
        "status": "SHIPPED"
    }

root_agent = Agent(
    name="order_agent",
    model="gemini-flash-latest",
    tools=[get_order_status],
)`,
  },

  {
    id: "rag",
    label: "03 • RAG",
    title: "Retrieval Pipeline",
    description:
      "Retrieve relevant evidence and use grounded context for agent responses.",
    code: `def retrieve(
    query: str,
    top_k: int = 5
) -> list[dict]:

    emb = client.models.embed_content(
        model="text-embedding-005",
        contents=[query],
    ).embeddings[0].values

    result = collection.query(
        query_embeddings=[emb],
        n_results=top_k,
    )

    return [
        {"text": text}
        for text in result["documents"][0]
    ]`,
  },

  {
    id: "multi",
    label: "04 • Multi-Agent",
    title: "Sequential Workflow",
    description:
      "Make orchestration explicit when one agent depends on another agent's output.",
    code: `from google.adk.agents import (
    Agent,
    SequentialAgent
)

researcher = Agent(
    name="researcher",
    model="gemini-flash-latest",
    instruction="""
    Research the topic and
    produce concise notes.
    """,
    output_key="research_notes",
)

writer = Agent(
    name="writer",
    model="gemini-flash-latest",
    instruction="""
    Write using the research
    stored in state.
    """,
)

root_agent = SequentialAgent(
    name="research_then_write",
    sub_agents=[
        researcher,
        writer,
    ],
)`,
  },
];

const CHAPTERS = [
  [
    "01",
    "Agentic AI Fundamentals",
    "Agent loops, tools, context, memory, workflows and when agents make sense.",
  ],
  [
    "02",
    "Google ADK: What It Is & Where It Fits",
    "Understand ADK, the developer workflow and the Agents CLI.",
  ],
  [
    "03",
    "Setup, Installation & Authentication",
    "Install ADK, configure Gemini or Vertex AI and create your first agent.",
  ],
  [
    "04",
    "Project Structure & Developer Workflow",
    "Organize agents, services, tests, evaluation datasets and deployment files.",
  ],
  [
    "05",
    "LlmAgent: The Core Agent Type",
    "Build LLM-powered agents and understand the decision and tool-use loop.",
  ],
  [
    "06",
    "Sequential, Parallel & Loop Agents",
    "Master core workflow agents and practical orchestration patterns.",
  ],
  [
    "07",
    "Custom Agents & Graph Workflows",
    "Create advanced control flow when standard workflow agents are not enough.",
  ],
  [
    "08",
    "Tools & Function Calling",
    "Connect agents to application logic, APIs, databases and external capabilities.",
  ],
  [
    "09",
    "Built-in Tools, Search, Files & Toolsets",
    "Use built-in capabilities and understand toolset-based architectures.",
  ],
  [
    "10",
    "Callbacks, Plugins & Guardrails",
    "Observe, intercept, validate, authorize, retry and control agent behavior.",
  ],
  [
    "11",
    "Sessions, State, Context & Memory",
    "Understand short-term state, sessions, context and persistent memory.",
  ],
  [
    "12",
    "RAG: Full Working Pipeline",
    "Build retrieval-augmented agents with ingestion, embeddings, retrieval and grounding.",
  ],
  [
    "13",
    "MCP: Model Context Protocol",
    "Connect ADK agents to MCP servers using practical integration patterns.",
  ],
  [
    "14",
    "A2A: Agent-to-Agent Systems",
    "Design specialist agents as services and connect them through A2A patterns.",
  ],
  [
    "15",
    "Models, Gemini, LiteLLM & Open Models",
    "Configure models and understand multi-model routing and integrations.",
  ],
  [
    "16",
    "Streaming, Live Agents & Multimodal Inputs",
    "Work with streaming events, live interactions, files and multimodal inputs.",
  ],
  [
    "17",
    "Artifacts & File Handling",
    "Manage generated files and artifacts safely across agent workflows.",
  ],
  [
    "18",
    "Evaluation: Datasets, Metrics & Eval-Fix Loop",
    "Create evaluations, measure behavior and turn failures into regression tests.",
  ],
  [
    "19",
    "Observability, Tracing & Debugging",
    "Trace agent runs, inspect tool calls and debug production behavior.",
  ],
  [
    "20",
    "Deployment: Agent Runtime, Cloud Run & GKE",
    "Move agents from local development into production infrastructure.",
  ],
  [
    "21",
    "Batching, Async Workloads & Performance",
    "Process workloads efficiently with bounded concurrency and performance controls.",
  ],
  [
    "22",
    "FastAPI / REST Integration",
    "Expose agent capabilities through application APIs and backend services.",
  ],
  [
    "23",
    "End-to-End Production Agent",
    "Combine research, RAG, orchestration, synthesis and review into one system.",
  ],
  [
    "24",
    "Security, Privacy & Reliability",
    "Handle prompt injection, tool abuse, data leakage, retries and failure modes.",
  ],
  [
    "25",
    "Structured Output, Schemas & Validation",
    "Return predictable structured results and validate model-generated data.",
  ],
  [
    "26",
    "Caching, Context Control & Cost Engineering",
    "Control token usage, context growth, latency and model costs.",
  ],
  [
    "27",
    "CLI: Commands You Actually Need",
    "Practical commands for creating, running, evaluating and deploying agents.",
  ],
  [
    "28",
    "Testing Strategy for Agentic Systems",
    "Build unit, integration, failure-injection and behavior-focused tests.",
  ],
  [
    "29",
    "Observability + Evaluation + Guardrails Pipeline",
    "Connect telemetry, quality checks, guardrails and continuous improvement.",
  ],
  [
    "30",
    "Troubleshooting Guide",
    "Diagnose common setup, model, tool, deployment and runtime problems.",
  ],
  [
    "31",
    "Production Checklist",
    "A practical checklist for taking an agent system toward production.",
  ],
  [
    "32",
    "Developer Cheat Sheets & Reference Architecture",
    "Quick references, architecture patterns, commands and reusable mental models.",
  ],
];

const LEARNING_POINTS = [
  "Build AI agents from scratch using Google ADK",
  "Connect agents with tools and external APIs",
  "Work with sessions, state and context",
  "Build RAG-powered AI agents",
  "Design multi-agent architectures",
  "Create sequential and parallel workflows",
  "Handle errors and unreliable tool calls",
  "Test and evaluate agent behavior",
  "Understand production architecture",
  "Deploy and expose agents through APIs",
];

const PROJECTS = [
  [
    Sparkles,
    "Research Agent",
    "Build an agent that researches a topic, gathers information and produces a structured result.",
  ],
  [
    Code2,
    "API Agent",
    "Connect an AI agent with external APIs and allow it to perform controlled actions.",
  ],
  [
    Layers3,
    "RAG Agent",
    "Create an agent that answers questions using your documents and knowledge base.",
  ],
  [
    Users,
    "Multi-Agent System",
    "Create specialized agents and orchestrate them into a complete AI workflow.",
  ],
];

const FLOW_SKILLS = [
  [
    "01",
    "Python + LLM Foundations",
    "Models, prompts, context",
    "Python, LLM APIs, prompts, context windows, structured outputs and basic model interaction patterns.",
  ],
  [
    "02",
    "Agent Fundamentals",
    "Instructions, state, sessions",
    "Understand how instructions, model behavior, tools, sessions and state form an agent.",
  ],
  [
    "03",
    "Tools + Function Calling",
    "APIs, files, actions",
    "Give agents controlled access to APIs, databases, files and application actions.",
  ],
  [
    "04",
    "RAG + Memory",
    "Retrieval, grounding, context",
    "Use retrieval for grounded answers while state and memory preserve useful context.",
  ],
  [
    "05",
    "Multi-Agent + Protocols",
    "Workflows, MCP, A2A",
    "Compose specialist agents and connect systems through workflows, MCP and A2A.",
  ],
  [
    "06",
    "Eval + Observability",
    "Tests, traces, guardrails",
    "Evaluate quality, inspect traces, diagnose failures and improve agent behavior.",
  ],
  [
    "07",
    "Production Engineering",
    "FastAPI, deployment, security",
    "Turn prototypes into services with APIs, security, reliability, performance and monitoring.",
  ],
];

const FAQS = [
  [
    "Who is this ebook for?",
    "It is designed for developers, backend engineers, GenAI learners and software engineers who want a practical path from Google ADK fundamentals to production-oriented agent systems.",
  ],
  [
    "What is covered in the 2nd Edition?",
    "The handbook contains 32 chapters covering agents, tools, workflow agents, sessions and memory, RAG, MCP, A2A, models, streaming, artifacts, evaluation, observability, deployment, FastAPI, security, testing, performance and production checklists.",
  ],
  [
    "Does the ebook contain code and commands?",
    "Yes. It follows a concept → flow → code → commands → production notes approach with implementation examples throughout the handbook.",
  ],
  [
    "Is prior Google ADK experience required?",
    "No. The handbook starts with fundamentals and setup before moving into advanced orchestration, integrations, evaluation and deployment.",
  ],
  [
    "Is this a video course?",
    "No. It is a developer-focused digital ebook and reference handbook designed to accompany hands-on implementation.",
  ],
  [
    "Is the ebook refundable?",
    "No. Due to the digital nature of the ebook, all purchases are non-refundable. Please review the contents and FAQ before purchasing.",
  ],
  [
    "How can I get support?",
    "For purchase or ebook-related issues, contact supporttargettrek@gmail.com.",
  ],
];

const CHAPTER_GROUPS = [
  [
    "FOUNDATIONS",
    CHAPTERS.slice(
      0,
      5
    ),
  ],
  [
    "ORCHESTRATION & TOOLS",
    CHAPTERS.slice(
      5,
      11
    ),
  ],
  [
    "INTEGRATIONS",
    CHAPTERS.slice(
      11,
      17
    ),
  ],
  [
    "PRODUCTION",
    CHAPTERS.slice(
      17,
      25
    ),
  ],
  [
    "ENGINEERING & REFERENCE",
    CHAPTERS.slice(25),
  ],
];

export default function GenAiGoogleAdk() {
  const GA_MEASUREMENT_ID =
    "G-5FPEL1W0VB";

  const BASE_URL =
    import.meta.env
      .VITE_BASE_URL ||
    "http://localhost:5001";

  const [
    theme,
    setTheme,
  ] = useState(
    readTheme
  );

  const [
    product,
    setProduct,
  ] = useState(null);

  const [
    loadingProduct,
    setLoadingProduct,
  ] = useState(true);

  const [
    productError,
    setProductError,
  ] = useState("");

  const [
    isCheckoutOpen,
    setIsCheckoutOpen,
  ] = useState(false);

  const [
    retryCount,
    setRetryCount,
  ] = useState(0);

  const [
    scrollProgress,
    setScrollProgress,
  ] = useState(0);

  const [
    activeCode,
    setActiveCode,
  ] = useState(0);

  const [
    activeSkill,
    setActiveSkill,
  ] = useState(null);

  const [
    openFaq,
    setOpenFaq,
  ] = useState(null);

  const isDark =
    theme === "dark";

  const GOOGLE_ADK_PRICE =
    product?.price !==
      null &&
    product?.price !==
      undefined &&
    product?.price !== ""
      ? Number(
          product.price
        )
      : null;

  const GOOGLE_ADK_MRP =
    product?.mrp !== null &&
    product?.mrp !==
      undefined &&
    product?.mrp !== ""
      ? Number(
          product.mrp
        )
      : null;

  const GOOGLE_ADK_CURRENCY =
    product?.currency ||
    "INR";

  const hasValidPrice =
    GOOGLE_ADK_PRICE !==
      null &&
    Number.isFinite(
      GOOGLE_ADK_PRICE
    ) &&
    GOOGLE_ADK_PRICE >= 0;

  const hasMrp =
    GOOGLE_ADK_MRP !==
      null &&
    Number.isFinite(
      GOOGLE_ADK_MRP
    ) &&
    hasValidPrice &&
    GOOGLE_ADK_MRP >
      GOOGLE_ADK_PRICE;

  const canBuy =
    Boolean(
      product?._id
    ) &&
    hasValidPrice &&
    !loadingProduct &&
    !productError;

  const productName =
    product?.title ||
    "Google ADK Complete Developer Handbook – 2nd Edition";

  const seoImage =
    product?.coverPageUrl ||
    product?.coverpageurl ||
    product?.cover_page_url ||
    "";

  const localeByCurrency = {
    INR: "en-IN",
    USD: "en-US",
    GBP: "en-GB",
    EUR: "en-IE",
    AUD: "en-AU",
    CAD: "en-CA",
  };

  const formatMoney = (
    amount
  ) => {
    const value =
      Number(amount);

    if (
      !Number.isFinite(
        value
      )
    ) {
      return "";
    }

    try {
      return new Intl.NumberFormat(
        localeByCurrency[
          GOOGLE_ADK_CURRENCY
        ] || "en",
        {
          style:
            "currency",
          currency:
            GOOGLE_ADK_CURRENCY,
          minimumFractionDigits:
            Number.isInteger(
              value
            )
              ? 0
              : 2,
          maximumFractionDigits: 2,
        }
      ).format(value);
    } catch {
      return `${GOOGLE_ADK_CURRENCY} ${value}`;
    }
  };

  useEffect(() => {
    const handleThemeChange =
      (event) => {
        const newTheme =
          event?.detail
            ?.theme;

        if (
          newTheme ===
            "dark" ||
          newTheme ===
            "light"
        ) {
          setTheme(
            newTheme
          );
        }
      };

    const handleStorage =
      (event) => {
        if (
          event.key !==
          THEME_KEY
        ) {
          return;
        }

        if (
          event.newValue ===
            "dark" ||
          event.newValue ===
            "light"
        ) {
          setTheme(
            event.newValue
          );
        }
      };

    setTheme(
      readTheme()
    );

    window.addEventListener(
      THEME_EVENT,
      handleThemeChange
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        THEME_EVENT,
        handleThemeChange
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const referralCode =
      (
        params.get(
          "referralCode"
        ) ||
        params.get(
          "ref"
        ) ||
        ""
      ).trim();

    if (
      referralCode
    ) {
      window.localStorage.setItem(
        "referralCode",
        referralCode
      );
    }
  }, []);

  useEffect(() => {
    const controller =
      new AbortController();

    const fetchProduct =
      async () => {
        try {
          setLoadingProduct(
            true
          );

          setProductError(
            ""
          );

          const response =
            await fetch(
              `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(
                PAGE_PATH
              )}`,
              {
                method:
                  "GET",
                cache:
                  "no-store",
                headers: {
                  Accept:
                    "application/json",
                },
                signal:
                  controller.signal,
              }
            );

          const result =
            await response
              .json()
              .catch(
                () => null
              );

          if (
            !response.ok ||
            !result?.success ||
            !result?.data
          ) {
            throw new Error(
              result?.error
                ?.message ||
                result?.message ||
                "Unable to load ebook details."
            );
          }

          const data =
            result.data;

          const price =
            Number(
              data.price
            );

          if (
            !data._id ||
            data.price ===
              null ||
            data.price ===
              undefined ||
            String(
              data.price
            ).trim() ===
              "" ||
            !Number.isFinite(
              price
            ) ||
            price < 0
          ) {
            throw new Error(
              "The ebook price is currently unavailable. Please try again."
            );
          }

          setProduct(
            data
          );
        } catch (
          error
        ) {
          if (
            error?.name ===
            "AbortError"
          ) {
            return;
          }

          console.error(
            "Failed to fetch Google ADK ebook:",
            error
          );

          setProduct(
            null
          );

          setProductError(
            error?.message ||
              "Unable to load ebook details."
          );
        } finally {
          if (
            !controller
              .signal
              .aborted
          ) {
            setLoadingProduct(
              false
            );
          }
        }
      };

    fetchProduct();

    return () =>
      controller.abort();
  }, [
    BASE_URL,
    retryCount,
  ]);

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    window.dataLayer =
      window.dataLayer ||
      [];

    window.gtag =
      window.gtag ||
      function gtag() {
        window.dataLayer.push(
          arguments
        );
      };

    const existingScript =
      document.querySelector(
        `script[data-google-analytics="${GA_MEASUREMENT_ID}"]`
      );

    if (
      !existingScript
    ) {
      const script =
        document.createElement(
          "script"
        );

      script.async =
        true;

      script.src =
        `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

      script.setAttribute(
        "data-google-analytics",
        GA_MEASUREMENT_ID
      );

      document.head.appendChild(
        script
      );
    }

    window.gtag(
      "js",
      new Date()
    );

    window.gtag(
      "config",
      GA_MEASUREMENT_ID,
      {
        page_title:
          SEO_TITLE,
        page_location:
          window.location.href,
      }
    );
  }, []);

  useEffect(() => {
    const updateProgress =
      () => {
        const total =
          document
            .documentElement
            .scrollHeight -
          window.innerHeight;

        const value =
          total > 0
            ? (
                window.scrollY /
                total
              ) *
              100
            : 0;

        setScrollProgress(
          Math.min(
            100,
            Math.max(
              0,
              value
            )
          )
        );
      };

    updateProgress();

    window.addEventListener(
      "scroll",
      updateProgress,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        updateProgress
      );
    };
  }, []);

  const handlePurchase = (
    source =
      "unknown"
  ) => {
    if (
      !canBuy
    ) {
      return;
    }

    try {
      window.dataLayer =
        window.dataLayer ||
        [];

      window.dataLayer.push(
        {
          event:
            "adk_purchase_click",
          product:
            product.slug ||
            "google_adk_handbook_2nd_edition",
          source,
          bookId:
            product._id,
          price:
            GOOGLE_ADK_PRICE,
          currency:
            GOOGLE_ADK_CURRENCY,
        }
      );

      if (
        typeof window.gtag ===
        "function"
      ) {
        window.gtag(
          "event",
          "begin_checkout",
          {
            currency:
              GOOGLE_ADK_CURRENCY,
            value:
              GOOGLE_ADK_PRICE,
            source,
            items: [
              {
                item_id:
                  product._id,
                item_name:
                  productName,
                price:
                  GOOGLE_ADK_PRICE,
                quantity: 1,
              },
            ],
          }
        );
      }
    } catch (
      error
    ) {
      console.warn(
        "Purchase analytics failed:",
        error
      );
    }

    setIsCheckoutOpen(
      true
    );
  };

  const scrollToContents =
    () => {
      document
        .getElementById(
          "contents"
        )
        ?.scrollIntoView({
          behavior:
            "smooth",
        });
    };

  const retryProduct =
    () => {
      setRetryCount(
        (count) =>
          count + 1
      );
    };

  const structuredData =
    useMemo(() => {
      const graph = [
        {
          "@type":
            "Organization",
          "@id":
            `${SITE_URL}/#organization`,
          name:
            SITE_NAME,
          url:
            SITE_URL,
          email:
            "supporttargettrek@gmail.com",
        },

        {
          "@type":
            "WebSite",
          "@id":
            `${SITE_URL}/#website`,
          name:
            SITE_NAME,
          url:
            SITE_URL,
          publisher: {
            "@id":
              `${SITE_URL}/#organization`,
          },
        },

        {
          "@type":
            "WebPage",
          "@id":
            `${PAGE_URL}#webpage`,
          name:
            SEO_TITLE,
          url:
            PAGE_URL,
          description:
            SEO_DESCRIPTION,
          isPartOf: {
            "@id":
              `${SITE_URL}/#website`,
          },
          about: {
            "@id":
              `${PAGE_URL}#book`,
          },
        },

        {
          "@type":
            "BreadcrumbList",
          "@id":
            `${PAGE_URL}#breadcrumbs`,
          itemListElement: [
            {
              "@type":
                "ListItem",
              position: 1,
              name:
                "TargetTrek",
              item:
                SITE_URL,
            },
            {
              "@type":
                "ListItem",
              position: 2,
              name:
                "Books",
              item:
                `${SITE_URL}/books`,
            },
            {
              "@type":
                "ListItem",
              position: 3,
              name:
                "Google ADK Complete Developer Handbook",
              item:
                PAGE_URL,
            },
          ],
        },

        {
          "@type":
            "Book",
          "@id":
            `${PAGE_URL}#book`,
          name:
            productName,
          description:
            SEO_DESCRIPTION,
          bookEdition:
            product?.edition ||
            "2nd Edition",
          inLanguage:
            product?.language ||
            "English",
          url:
            PAGE_URL,
          publisher: {
            "@id":
              `${SITE_URL}/#organization`,
          },
          ...(seoImage
            ? {
                image:
                  seoImage,
              }
            : {}),
        },

        {
          "@type":
            "FAQPage",
          "@id":
            `${PAGE_URL}#faq`,
          mainEntity:
            FAQS.map(
              ([
                question,
                answer,
              ]) => ({
                "@type":
                  "Question",
                name:
                  question,
                acceptedAnswer:
                  {
                    "@type":
                      "Answer",
                    text:
                      answer,
                  },
              })
            ),
        },
      ];

      if (
        canBuy
      ) {
        graph.push({
          "@type":
            "Product",
          "@id":
            `${PAGE_URL}#product`,
          name:
            productName,
          description:
            SEO_DESCRIPTION,
          category:
            "Developer Ebook",
          url:
            PAGE_URL,
          brand: {
            "@type":
              "Brand",
            name:
              SITE_NAME,
          },
          ...(seoImage
            ? {
                image: [
                  seoImage,
                ],
              }
            : {}),
          offers: {
            "@type":
              "Offer",
            url:
              PAGE_URL,
            price:
              GOOGLE_ADK_PRICE,
            priceCurrency:
              GOOGLE_ADK_CURRENCY,
            availability:
              "https://schema.org/InStock",
            itemCondition:
              "https://schema.org/NewCondition",
            seller: {
              "@id":
                `${SITE_URL}/#organization`,
            },
          },
        });
      }

      return {
        "@context":
          "https://schema.org",
        "@graph":
          graph,
      };
    }, [
      canBuy,
      GOOGLE_ADK_CURRENCY,
      GOOGLE_ADK_PRICE,
      product?.edition,
      product?.language,
      productName,
      seoImage,
    ]);

  const pageBg =
    isDark
      ? "bg-[#080D14]"
      : "bg-[#F7FAFC]";

  const alternateBg =
    isDark
      ? "bg-[#0B111A]"
      : "bg-white";

  const card =
    isDark
      ? "border-slate-800 bg-[#101720]"
      : "border-slate-200 bg-white";

  const softCard =
    isDark
      ? "border-slate-800 bg-[#0C131C]"
      : "border-slate-200 bg-slate-50";

  const primaryText =
    isDark
      ? "text-white"
      : "text-slate-950";

  const secondaryText =
    isDark
      ? "text-slate-400"
      : "text-slate-600";

  const mutedText =
    isDark
      ? "text-slate-500"
      : "text-slate-500";

  const border =
    isDark
      ? "border-slate-800"
      : "border-slate-200";

  const sectionLabel =
    (text) => (
      <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-500 sm:text-sm">
        {text}
      </p>
    );

  const purchaseButton =
    `
      inline-flex
      min-h-[48px]
      items-center
      justify-center
      gap-2
      rounded-xl
      bg-blue-600
      px-5
      py-3
      text-sm
      font-black
      text-white
      shadow-lg
      shadow-blue-600/15
      transition
      hover:-translate-y-0.5
      hover:bg-blue-700
      disabled:cursor-not-allowed
      disabled:opacity-50
      disabled:hover:translate-y-0
      disabled:hover:bg-blue-600
      sm:px-6
    `;

  const PurchaseError = ({
    compact = false,
  }) => {
    if (
      !productError
    ) {
      return null;
    }

    return (
      <div
        role="alert"
        className={`
          rounded-xl
          border
          ${
            isDark
              ? "border-red-900/60 bg-red-950/20 text-red-300"
              : "border-red-200 bg-red-50 text-red-700"
          }
          ${
            compact
              ? "mt-2 px-3 py-2 text-[11px]"
              : "mt-4 p-4 text-sm"
          }
        `}
      >
        <span>
          {productError}
        </span>

        <button
          type="button"
          onClick={
            retryProduct
          }
          className="ml-2 font-black underline underline-offset-2"
        >
          Retry
        </button>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>
          {SEO_TITLE}
        </title>

        <meta
          name="description"
          content={
            SEO_DESCRIPTION
          }
        />

        <meta
          name="keywords"
          content="Google ADK ebook, Google Agent Development Kit, Google ADK tutorial, Google ADK agents, AI agents book, agentic AI, multi agent systems, RAG, MCP, model context protocol, A2A, Gemini agents, Vertex AI agents, GenAI interview preparation"
        />

        <meta
          name="author"
          content={
            SITE_NAME
          }
        />

        <meta
          name="robots"
          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        />

        <meta
          name="googlebot"
          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        />

        <link
          rel="canonical"
          href={
            PAGE_URL
          }
        />

        <meta
          name="theme-color"
          content={
            isDark
              ? "#080D14"
              : "#ffffff"
          }
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:site_name"
          content={
            SITE_NAME
          }
        />

        <meta
          property="og:locale"
          content="en_IN"
        />

        <meta
          property="og:title"
          content={
            SEO_TITLE
          }
        />

        <meta
          property="og:description"
          content={
            SEO_DESCRIPTION
          }
        />

        <meta
          property="og:url"
          content={
            PAGE_URL
          }
        />

       {seoImage && (
  <meta
    property="og:image"
    content={seoImage}
  />
)}

{seoImage && (
  <meta
    property="og:image:alt"
    content={`${productName} ebook cover`}
  />
)}

        <meta
          name="twitter:card"
          content={
            seoImage
              ? "summary_large_image"
              : "summary"
          }
        />

        <meta
          name="twitter:title"
          content={
            SEO_TITLE
          }
        />

        <meta
          name="twitter:description"
          content={
            SEO_DESCRIPTION
          }
        />

        {seoImage && (
          <meta
            name="twitter:image"
            content={
              seoImage
            }
          />
        )}

        <script
          type="application/ld+json"
        >
          {JSON.stringify(
            structuredData
          )}
        </script>
      </Helmet>

      <main
        className={`
          min-h-screen
          w-full
          overflow-x-hidden
          pb-20
          pt-16
          transition-colors
          duration-300
          md:pb-0
          ${pageBg}
          ${primaryText}
        `}
      >
        <style>{`
          html {
            scroll-behavior: smooth;
          }

          @keyframes adk-book-float {
            0%, 100% {
              transform: translateY(0) rotate(-2deg);
            }

            50% {
              transform: translateY(-8px) rotate(-1deg);
            }
          }

          .adk-book-float {
            animation: adk-book-float 5s ease-in-out infinite;
          }

          @media (prefers-reduced-motion: reduce) {
            html {
              scroll-behavior: auto;
            }

            .adk-book-float {
              animation: none;
            }
          }
        `}</style>

        {/* Scroll progress */}

        <div
          className={`
            fixed
            left-0
            right-0
            top-16
            z-40
            h-[2px]
            ${
              isDark
                ? "bg-slate-900"
                : "bg-slate-200"
            }
          `}
        >
          <div
            className="h-full bg-blue-500 transition-[width] duration-100"
            style={{
              width:
                `${scrollProgress}%`,
            }}
          />
        </div>

        {/* Hero */}

        <section
          className={`
            relative
            overflow-hidden
            border-b
            ${border}
            ${alternateBg}
          `}
        >
          <div className="pointer-events-none absolute inset-0">
            <div
              className={`
                absolute
                -left-40
                -top-40
                h-[480px]
                w-[480px]
                rounded-full
                blur-[130px]
                ${
                  isDark
                    ? "bg-blue-900/15"
                    : "bg-blue-100/70"
                }
              `}
            />

            <div
              className={`
                absolute
                -right-48
                top-10
                h-[540px]
                w-[540px]
                rounded-full
                blur-[140px]
                ${
                  isDark
                    ? "bg-indigo-900/10"
                    : "bg-indigo-100/60"
                }
              `}
            />
          </div>

          <div
            className="
              relative
              mx-auto
              max-w-7xl
              px-4
              py-14
              sm:px-6
              sm:py-20
              lg:px-8
              lg:py-24
            "
          >
            <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
              <div>
                <div
                  className={`
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    px-3.5
                    py-2
                    text-xs
                    font-black
                    ${
                      isDark
                        ? "border-blue-900/60 bg-blue-950/30 text-blue-300"
                        : "border-blue-200 bg-blue-50 text-blue-700"
                    }
                  `}
                >
                  <Sparkles
                    size={
                      15
                    }
                  />

                  2nd Edition •
                  Developer Handbook
                </div>

                <h1
                  className={`
                    mt-6
                    max-w-3xl
                    text-4xl
                    font-black
                    leading-[1.04]
                    tracking-tight
                    sm:text-5xl
                    lg:text-6xl
                    xl:text-7xl
                    ${primaryText}
                  `}
                >
                  Learn Google ADK
                  by building{" "}

                  <span className="text-blue-500">
                    real AI agents.
                  </span>
                </h1>

                <p
                  className={`
                    mt-6
                    max-w-2xl
                    text-base
                    leading-8
                    sm:text-lg
                    ${secondaryText}
                  `}
                >
                  A practical,
                  code-first developer
                  handbook that takes
                  you from your first
                  Google ADK agent to
                  tools, RAG, MCP,
                  A2A, multi-agent
                  workflows,
                  evaluation and
                  production
                  deployment.
                </p>

                <div className="mt-7 flex flex-wrap gap-2.5">
                  {[
                    "32 Chapters",
                    "Practical Code",
                    "RAG + MCP + A2A",
                    "Production Topics",
                  ].map(
                    (
                      item
                    ) => (
                      <span
                        key={
                          item
                        }
                        className={`
                          rounded-full
                          border
                          px-3
                          py-1.5
                          text-xs
                          font-bold
                          sm:px-4
                          sm:py-2
                          sm:text-sm
                          ${card}
                        `}
                      >
                        {
                          item
                        }
                      </span>
                    )
                  )}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      handlePurchase(
                        "hero"
                      )
                    }
                    disabled={
                      !canBuy
                    }
                    className={
                      purchaseButton
                    }
                  >
                    {loadingProduct
                      ? "Loading price..."
                      : canBuy
                      ? "Get Instant PDF Access"
                      : "Price unavailable"}

                    {canBuy && (
                      <span className="flex items-center gap-2">
                        {hasMrp && (
                          <span className="text-xs text-blue-200 line-through sm:text-sm">
                            {formatMoney(
                              GOOGLE_ADK_MRP
                            )}
                          </span>
                        )}

                        <span>
                          {formatMoney(
                            GOOGLE_ADK_PRICE
                          )}
                        </span>
                      </span>
                    )}

                    <ArrowRight
                      size={
                        17
                      }
                    />
                  </button>

                  <button
                    type="button"
                    onClick={
                      scrollToContents
                    }
                    className={`
                      inline-flex
                      min-h-[48px]
                      items-center
                      justify-center
                      rounded-xl
                      border
                      px-5
                      py-3
                      text-sm
                      font-black
                      transition
                      ${
                        isDark
                          ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-700 hover:bg-slate-800"
                          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50"
                      }
                    `}
                  >
                    See What's Inside
                  </button>
                </div>

                <PurchaseError />

                <div
                  className={`
                    mt-5
                    flex
                    flex-wrap
                    gap-x-5
                    gap-y-2
                    text-xs
                    sm:text-sm
                    ${mutedText}
                  `}
                >
                  <span>
                    ✓ One-time payment
                  </span>

                  <span>
                    ✓ Instant digital access
                  </span>

                  <span>
                    ✓ No subscription
                  </span>
                </div>
              </div>

              {/* Book visual */}

              <div className="flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[330px] sm:max-w-[380px]">
                  <div className="absolute -inset-10 rounded-full bg-blue-500/10 blur-3xl" />

                  <div
                    className="
                      adk-book-float
                      relative
                      overflow-hidden
                      rounded-r-3xl
                      rounded-l-md
                      border
                      border-blue-400/20
                      bg-gradient-to-br
                      from-[#173d78]
                      via-[#0d63c9]
                      to-[#37238d]
                      p-7
                      shadow-2xl
                      sm:p-8
                    "
                  >
                    <div className="absolute left-0 top-0 h-full w-3 bg-black/20" />

                    <div className="flex min-h-[430px] flex-col justify-between sm:min-h-[500px]">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                          <Terminal
                            size={
                              15
                            }
                          />

                          Developer Handbook
                        </div>

                        <div className="mt-7 h-px bg-white/20" />

                        <p className="mt-9 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
                          2nd Edition
                        </p>

                        <h2 className="mt-4 text-3xl font-black leading-[1.05] text-white sm:text-4xl">
                          Google
                          <br />
                          ADK
                          <br />
                          Complete
                          <br />
                          Developer
                          <br />
                          Handbook
                        </h2>

                        <p className="mt-5 max-w-[250px] text-sm leading-6 text-blue-100">
                          From first
                          agent to RAG,
                          MCP, A2A,
                          evaluation,
                          observability
                          and production
                          deployment.
                        </p>
                      </div>

                      <div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "Agents",
                            "RAG",
                            "MCP",
                            "A2A",
                            "Production",
                          ].map(
                            (
                              tag
                            ) => (
                              <span
                                key={
                                  tag
                                }
                                className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[10px] font-bold text-white"
                              >
                                {
                                  tag
                                }
                              </span>
                            )
                          )}
                        </div>

                        <p className="mt-5 text-xs font-bold text-blue-100">
                          Practical •
                          Code-first •
                          Production-aware
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`
                      relative
                      mx-auto
                      -mt-5
                      w-[calc(100%-32px)]
                      rounded-2xl
                      border
                      px-4
                      py-3
                      text-center
                      shadow-xl
                      sm:absolute
                      sm:-bottom-5
                      sm:-right-5
                      sm:mt-0
                      sm:w-auto
                      sm:text-left
                      ${card}
                    `}
                  >
                    <p
                      className={`text-[10px] font-black uppercase tracking-wider ${mutedText}`}
                    >
                      Current Price
                    </p>

                    <div className="mt-1 flex items-center justify-center gap-2 sm:justify-start">
                      {loadingProduct ? (
                        <span
                          className={`text-sm font-bold ${secondaryText}`}
                        >
                          Loading...
                        </span>
                      ) : canBuy ? (
                        <>
                          {hasMrp && (
                            <span
                              className={`text-sm font-bold line-through ${mutedText}`}
                            >
                              {formatMoney(
                                GOOGLE_ADK_MRP
                              )}
                            </span>
                          )}

                          <span className="text-2xl font-black text-blue-500 sm:text-3xl">
                            {formatMoney(
                              GOOGLE_ADK_PRICE
                            )}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-red-500">
                          Price unavailable
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick facts */}

        <section
          className={`border-b ${border} ${alternateBg}`}
        >
          <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
            {[
              [
                "32 Chapters",
                "Structured learning path",
              ],
              [
                "Code-First",
                "Commands + implementation",
              ],
              [
                "RAG / MCP / A2A",
                "Modern integrations",
              ],
              [
                "Production",
                "Evaluation + deployment",
              ],
            ].map(
              ([
                title,
                description,
              ]) => (
                <div
                  key={
                    title
                  }
                  className={`
                    border-b
                    p-4
                    text-center
                    sm:p-6
                    md:border-b-0
                    md:border-r
                    md:last:border-r-0
                    ${border}
                  `}
                >
                  <p
                    className={`text-sm font-black sm:text-base ${primaryText}`}
                  >
                    {
                      title
                    }
                  </p>

                  <p
                    className={`mt-1 text-xs leading-5 sm:text-sm ${mutedText}`}
                  >
                    {
                      description
                    }
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        {/* Value */}

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[.82fr_1.18fr] lg:gap-14">
            <div>
              {sectionLabel(
                "Built for developers"
              )}

              <h2
                className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
              >
                Stop jumping between
                scattered concepts.
              </h2>

              <p
                className={`mt-5 max-w-xl text-base leading-8 sm:text-lg ${secondaryText}`}
              >
                Agent development
                involves tools,
                orchestration,
                memory, RAG,
                protocols,
                evaluation and
                deployment. This
                handbook organizes
                those topics into one
                developer-focused
                learning path.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [
                  BookOpen,
                  "Structured path",
                  "Move from fundamentals to advanced topics instead of learning isolated concepts.",
                ],
                [
                  Code2,
                  "Implementation focused",
                  "Follow concepts with flows, code, commands and practical development context.",
                ],
                [
                  Network,
                  "Connect the pieces",
                  "Understand how agents, tools, RAG, MCP, A2A and APIs fit together.",
                ],
                [
                  Rocket,
                  "Production aware",
                  "Explore evaluation, observability, security, testing and deployment.",
                ],
              ].map(
                ([
                  Icon,
                  title,
                  description,
                ]) => (
                  <div
                    key={
                      title
                    }
                    className={`
                      rounded-2xl
                      border
                      p-5
                      transition
                      hover:-translate-y-1
                      sm:p-6
                      ${card}
                      ${
                        isDark
                          ? "hover:border-blue-800"
                          : "hover:border-blue-300 hover:shadow-lg"
                      }
                    `}
                  >
                    <div
                      className={`
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        ${
                          isDark
                            ? "bg-blue-950/40 text-blue-300"
                            : "bg-blue-50 text-blue-600"
                        }
                      `}
                    >
                      <Icon
                        size={
                          21
                        }
                      />
                    </div>

                    <h3
                      className={`mt-5 text-lg font-black ${primaryText}`}
                    >
                      {
                        title
                      }
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-7 ${secondaryText}`}
                    >
                      {
                        description
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Documentation comparison */}

        <section
          className={`border-y py-16 sm:py-20 lg:py-24 ${border} ${alternateBg}`}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                {sectionLabel(
                  "The handbook approach"
                )}

                <h2
                  className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
                >
                  A structured path
                  alongside official
                  documentation.
                </h2>

                <p
                  className={`mt-5 text-base leading-8 sm:text-lg ${secondaryText}`}
                >
                  Official
                  documentation remains
                  an important source
                  of truth. The
                  handbook focuses on
                  organizing the
                  developer journey
                  from fundamentals
                  through
                  implementation and
                  production topics.
                </p>
              </div>

              <div
                className={`overflow-hidden rounded-2xl border ${softCard}`}
              >
                <div
                  className={`grid grid-cols-2 border-b ${border}`}
                >
                  <div
                    className={`p-4 text-xs font-black sm:p-5 sm:text-sm ${mutedText}`}
                  >
                    Learning challenge
                  </div>

                  <div className="p-4 text-xs font-black text-blue-500 sm:p-5 sm:text-sm">
                    Handbook approach
                  </div>
                </div>

                {[
                  [
                    "Where do I start?",
                    "Fundamentals → setup → first agent",
                  ],
                  [
                    "How do concepts connect?",
                    "Concept → flow → code",
                  ],
                  [
                    "What comes after agents?",
                    "Tools → workflows → RAG → protocols",
                  ],
                  [
                    "How do I approach production?",
                    "Evaluation → observability → security → deployment",
                  ],
                ].map(
                  ([
                    left,
                    right,
                  ]) => (
                    <div
                      key={
                        left
                      }
                      className={`grid grid-cols-2 border-b last:border-b-0 ${border}`}
                    >
                      <div
                        className={`p-4 text-xs leading-6 sm:p-5 sm:text-sm ${mutedText}`}
                      >
                        {
                          left
                        }
                      </div>

                      <div
                        className={`p-4 text-xs font-semibold leading-6 sm:p-5 sm:text-sm ${secondaryText}`}
                      >
                        {
                          right
                        }
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* What you learn */}

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:gap-14">
            <div>
              {sectionLabel(
                "What you learn"
              )}

              <h2
                className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
              >
                One handbook for the
                full agent lifecycle.
              </h2>

              <p
                className={`mt-5 leading-8 ${secondaryText}`}
              >
                Start with the mental
                model and setup. Then
                move into
                orchestration,
                integrations,
                evaluation,
                operations and
                production.
              </p>

              <button
                type="button"
                onClick={() =>
                  handlePurchase(
                    "learning_section"
                  )
                }
                disabled={
                  !canBuy
                }
                className={`${purchaseButton} mt-7`}
              >
                {loadingProduct
                  ? "Loading price..."
                  : canBuy
                  ? "Get Instant Access"
                  : "Price unavailable"}

                <ArrowRight
                  size={
                    17
                  }
                />
              </button>

              <PurchaseError />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {LEARNING_POINTS.map(
                (
                  item
                ) => (
                  <div
                    key={
                      item
                    }
                    className={`flex gap-3 rounded-2xl border p-4 ${card}`}
                  >
                    <span
                      className={`
                        mt-0.5
                        flex
                        h-5
                        w-5
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        ${
                          isDark
                            ? "bg-blue-950/50 text-blue-300"
                            : "bg-blue-100 text-blue-600"
                        }
                      `}
                    >
                      <Check
                        size={
                          12
                        }
                        strokeWidth={
                          3
                        }
                      />
                    </span>

                    <p
                      className={`text-sm font-semibold leading-6 ${secondaryText}`}
                    >
                      {item}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Topics */}

        <section
          className={`border-y py-16 sm:py-20 lg:py-24 ${border} ${alternateBg}`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {sectionLabel(
                "What's inside"
              )}

              <h2
                className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
              >
                Topics developers
                actually need.
              </h2>

              <p
                className={`mt-4 leading-7 ${secondaryText}`}
              >
                Go from core agent
                concepts to
                production
                engineering without
                treating each topic as
                an isolated idea.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [
                  Terminal,
                  "Agents",
                  "LlmAgent, custom agents and agent behavior.",
                ],
                [
                  Zap,
                  "Orchestration",
                  "Sequential, parallel, loop and graph workflows.",
                ],
                [
                  Database,
                  "RAG",
                  "Retrieval, grounding, ingestion and knowledge systems.",
                ],
                [
                  Network,
                  "Protocols",
                  "MCP and A2A integration patterns.",
                ],
                [
                  Search,
                  "Tools",
                  "Function calling, APIs, files and toolsets.",
                ],
                [
                  TestTube,
                  "Evaluation",
                  "Datasets, metrics and eval-fix workflows.",
                ],
                [
                  Server,
                  "Deployment",
                  "Runtime, Cloud Run, GKE and REST APIs.",
                ],
                [
                  Lock,
                  "Security",
                  "Privacy, reliability, guardrails and failure modes.",
                ],
              ].map(
                ([
                  Icon,
                  title,
                  description,
                ]) => (
                  <div
                    key={
                      title
                    }
                    className={`rounded-2xl border p-5 transition hover:-translate-y-1 sm:p-6 ${softCard}`}
                  >
                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        ${
                          isDark
                            ? "bg-slate-800 text-blue-300"
                            : "bg-blue-50 text-blue-600"
                        }
                      `}
                    >
                      <Icon
                        size={
                          20
                        }
                      />
                    </div>

                    <h3
                      className={`mt-5 text-lg font-black ${primaryText}`}
                    >
                      {
                        title
                      }
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-6 ${secondaryText}`}
                    >
                      {
                        description
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Projects */}

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          {sectionLabel(
            "Build with the concepts"
          )}

          <h2
            className={`mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
          >
            Learn by thinking in real
            agent systems.
          </h2>

          <p
            className={`mt-5 max-w-3xl leading-8 ${secondaryText}`}
          >
            The handbook includes
            patterns around research
            agents, API agents, RAG
            systems and multi-agent
            architectures.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROJECTS.map(
              ([
                Icon,
                title,
                description,
              ], index) => (
                <div
                  key={
                    title
                  }
                  className={`group rounded-2xl border p-5 transition hover:-translate-y-1 sm:p-6 ${card}`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        ${
                          isDark
                            ? "bg-blue-950/40 text-blue-300"
                            : "bg-blue-50 text-blue-600"
                        }
                      `}
                    >
                      <Icon
                        size={
                          21
                        }
                      />
                    </div>

                    <span
                      className={`font-mono text-xs font-black ${mutedText}`}
                    >
                      0
                      {index +
                        1}
                    </span>
                  </div>

                  <h3
                    className={`mt-5 text-lg font-black ${primaryText}`}
                  >
                    {
                      title
                    }
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-7 ${secondaryText}`}
                  >
                    {
                      description
                    }
                  </p>
                </div>
              )
            )}
          </div>
        </section>

        {/* Interview revision */}

        <section
          className={`border-y py-16 sm:py-20 lg:py-24 ${border} ${
            isDark
              ? "bg-[#0B111A]"
              : "bg-blue-50/60"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-14">
              <div>
                <div
                  className={`
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    px-3.5
                    py-2
                    text-xs
                    font-black
                    ${
                      isDark
                        ? "border-blue-900/50 bg-blue-950/25 text-blue-300"
                        : "border-blue-200 bg-white text-blue-700"
                    }
                  `}
                >
                  <Zap
                    size={
                      15
                    }
                  />

                  Interview quick
                  revision
                </div>

                <h2
                  className={`mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl ${primaryText}`}
                >
                  Less time before
                  your interview?

                  <span className="mt-2 block text-blue-500">
                    Use a structured
                    path for revision.
                  </span>
                </h2>

                <p
                  className={`mt-5 text-base leading-8 sm:text-lg ${secondaryText}`}
                >
                  Revise agents,
                  workflows, RAG,
                  MCP, A2A,
                  evaluation,
                  observability,
                  deployment,
                  security and
                  production patterns
                  from one organized
                  reference.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    handlePurchase(
                      "interview_revision"
                    )
                  }
                  disabled={
                    !canBuy
                  }
                  className={`${purchaseButton} mt-7`}
                >
                  {loadingProduct
                    ? "Loading price..."
                    : canBuy
                    ? "Get the Handbook"
                    : "Price unavailable"}

                  <ArrowRight
                    size={
                      17
                    }
                  />
                </button>

                <PurchaseError />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "01",
                    "Core concepts",
                    "Agent mental model, ADK and setup",
                  ],
                  [
                    "02",
                    "Architecture",
                    "Tools, workflows, RAG, MCP and A2A",
                  ],
                  [
                    "03",
                    "Production",
                    "Evals, tracing, security and deployment",
                  ],
                  [
                    "04",
                    "Reference",
                    "Commands, checklists and architecture patterns",
                  ],
                ].map(
                  ([
                    number,
                    title,
                    description,
                  ]) => (
                    <div
                      key={
                        number
                      }
                      className={`rounded-2xl border p-5 sm:p-6 ${card}`}
                    >
                      <span className="font-mono text-xs font-black text-blue-500">
                        {
                          number
                        }
                      </span>

                      <h3
                        className={`mt-4 text-lg font-black ${primaryText}`}
                      >
                        {
                          title
                        }
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-6 ${secondaryText}`}
                      >
                        {
                          description
                        }
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap */}

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            {sectionLabel(
              "GenAI engineer roadmap"
            )}

            <h2
              className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
            >
              See how the skills
              connect.
            </h2>

            <p
              className={`mt-4 leading-7 ${secondaryText}`}
            >
              Follow the connected
              path from foundations
              to production. Tap a
              card to see more
              detail.
            </p>
          </div>

          <div className="relative mt-10">
            <div
              className={`
                pointer-events-none
                absolute
                left-[6%]
                right-[6%]
                top-[62px]
                hidden
                h-px
                lg:block
                ${
                  isDark
                    ? "bg-slate-800"
                    : "bg-blue-200"
                }
              `}
            />

            <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
              {FLOW_SKILLS.map(
                ([
                  number,
                  title,
                  short,
                  detail,
                ]) => {
                  const selected =
                    activeSkill ===
                    number;

                  return (
                    <button
                      type="button"
                      key={
                        number
                      }
                      onClick={() =>
                        setActiveSkill(
                          selected
                            ? null
                            : number
                        )
                      }
                      className={`
                        relative
                        z-10
                        min-h-[180px]
                        rounded-2xl
                        border
                        p-4
                        text-left
                        transition
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-500
                        lg:min-h-[210px]
                        ${
                          selected
                            ? isDark
                              ? "border-blue-700 bg-blue-950/25"
                              : "border-blue-300 bg-blue-50"
                            : card
                        }
                      `}
                    >
                      <span
                        className={`
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          font-mono
                          text-xs
                          font-black
                          ${
                            isDark
                              ? "bg-slate-800 text-blue-300"
                              : "bg-blue-50 text-blue-700"
                          }
                        `}
                      >
                        {
                          number
                        }
                      </span>

                      <h3
                        className={`mt-5 text-sm font-black leading-5 ${primaryText}`}
                      >
                        {
                          title
                        }
                      </h3>

                      <p
                        className={`mt-2 text-xs leading-5 ${mutedText}`}
                      >
                        {
                          short
                        }
                      </p>

                      {selected && (
                        <p
                          className={`mt-4 border-t pt-4 text-xs leading-6 ${border} ${secondaryText}`}
                        >
                          {
                            detail
                          }
                        </p>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </section>

        {/* Code examples */}

        <section
          className={`border-y py-16 sm:py-20 lg:py-24 ${border} ${alternateBg}`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {sectionLabel(
                "Code-first learning"
              )}

              <h2
                className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
              >
                Understand the flow,
                then study the code.
              </h2>

              <p
                className={`mt-4 leading-7 ${secondaryText}`}
              >
                Explore
                representative
                patterns for agents,
                function calling,
                retrieval and
                multi-agent
                orchestration.
              </p>
            </div>

            <div className="mt-10 overflow-hidden rounded-2xl border border-slate-800 bg-[#050B14] shadow-2xl">
              <div className="border-b border-slate-800 p-2">
                <div className="flex gap-2 overflow-x-auto">
                  {CODE_EXAMPLES.map(
                    (
                      item,
                      index
                    ) => (
                      <button
                        key={
                          item.id
                        }
                        type="button"
                        onClick={() =>
                          setActiveCode(
                            index
                          )
                        }
                        className={`
                          min-w-max
                          rounded-xl
                          px-4
                          py-3
                          text-left
                          transition
                          ${
                            activeCode ===
                            index
                              ? "bg-white/10 text-white"
                              : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200"
                          }
                        `}
                      >
                        <span className="block text-[10px] font-black uppercase tracking-[0.12em]">
                          {
                            item.label
                          }
                        </span>

                        <span className="mt-1 block text-xs font-semibold">
                          {
                            item.title
                          }
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="grid lg:grid-cols-[.75fr_1.25fr]">
                <div className="border-b border-slate-800 p-6 lg:border-b-0 lg:border-r lg:p-8">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-blue-400">
                    <Code2
                      size={
                        15
                      }
                    />

                    {
                      CODE_EXAMPLES[
                        activeCode
                      ].label
                    }
                  </div>

                  <h3 className="mt-4 text-2xl font-black text-white">
                    {
                      CODE_EXAMPLES[
                        activeCode
                      ].title
                    }
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-400">
                    {
                      CODE_EXAMPLES[
                        activeCode
                      ]
                        .description
                    }
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {[
                      "Concept",
                      "Flow",
                      "Code",
                      "Production",
                    ].map(
                      (
                        tag
                      ) => (
                        <span
                          key={
                            tag
                          }
                          className="rounded-full border border-slate-700 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-slate-400"
                        >
                          {
                            tag
                          }
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="min-w-0 bg-[#02060D]">
                  <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3 sm:px-5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400" />

                    <span className="ml-2 text-xs text-slate-500">
                      {
                        CODE_EXAMPLES[
                          activeCode
                        ].id
                      }
                      .py
                    </span>
                  </div>

                  <pre
                    className="
                      max-h-[520px]
                      w-full
                      max-w-full
                      overflow-x-auto
                      p-4
                      text-[11px]
                      leading-6
                      text-slate-300
                      sm:p-6
                      sm:text-[13px]
                    "
                  >
                    <code>
                      {
                        CODE_EXAMPLES[
                          activeCode
                        ].code
                      }
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chapters */}

        <section
          id="contents"
          className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          {sectionLabel(
            "32-chapter contents"
          )}

          <h2
            className={`mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
          >
            From your first agent to
            production architecture.
          </h2>

          <p
            className={`mt-5 max-w-3xl leading-8 ${secondaryText}`}
          >
            Every chapter follows a
            practical structure:
            concept → flow → code →
            commands → how it works →
            production notes.
          </p>

          <div className="mt-10 space-y-10">
            {CHAPTER_GROUPS.map(
              ([
                label,
                items,
              ]) => (
                <div
                  key={
                    label
                  }
                >
                  <p className="mb-4 text-xs font-black tracking-[0.18em] text-blue-500">
                    {
                      label
                    }
                  </p>

                  <div className="grid gap-3 md:grid-cols-2">
                    {items.map(
                      ([
                        number,
                        title,
                        description,
                      ]) => (
                        <div
                          key={
                            number
                          }
                          className={`rounded-2xl border p-4 transition sm:p-5 ${card}`}
                        >
                          <div className="flex gap-4">
                            <span className="font-mono text-sm font-black text-blue-500">
                              {
                                number
                              }
                            </span>

                            <div>
                              <h3
                                className={`font-black ${primaryText}`}
                              >
                                {
                                  title
                                }
                              </h3>

                              <p
                                className={`mt-2 text-sm leading-6 ${secondaryText}`}
                              >
                                {
                                  description
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* Mid CTA */}

        <section
          className={`border-y py-12 sm:py-14 ${border} ${alternateBg}`}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div>
              {sectionLabel(
                "Ready to build?"
              )}

              <h2
                className={`mt-2 text-2xl font-black sm:text-3xl ${primaryText}`}
              >
                Get the complete
                developer handbook.
              </h2>

              <p
                className={`mt-2 text-sm sm:text-base ${secondaryText}`}
              >
                32 chapters • Code •
                RAG • MCP • A2A •
                Production
              </p>
            </div>

            <div className="w-full shrink-0 lg:w-auto">
              <button
                type="button"
                onClick={() =>
                  handlePurchase(
                    "mid_page"
                  )
                }
                disabled={
                  !canBuy
                }
                className={`${purchaseButton} w-full lg:w-auto`}
              >
                {loadingProduct
                  ? "Loading price..."
                  : canBuy
                  ? "Get Instant PDF Access"
                  : "Price unavailable"}

                {canBuy && (
                  <span>
                    {formatMoney(
                      GOOGLE_ADK_PRICE
                    )}
                  </span>
                )}

                <ArrowRight
                  size={
                    17
                  }
                />
              </button>

              <PurchaseError
                compact
              />
            </div>
          </div>
        </section>

        {/* Pricing */}

        <section
          id="pricing"
          className="mx-auto max-w-5xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <div className="text-center">
            <div
              className={`
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                px-3.5
                py-2
                text-xs
                font-bold
                ${
                  isDark
                    ? "border-blue-900/50 bg-blue-950/25 text-blue-300"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }
              `}
            >
              <Sparkles
                size={
                  15
                }
              />

              Google ADK • 2nd
              Edition
            </div>

            <h2
              className={`mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
            >
              A practical reference
              for your ADK journey.
            </h2>

            <p
              className={`mx-auto mt-4 max-w-2xl leading-7 ${secondaryText}`}
            >
              Learn the concepts,
              follow implementation
              patterns and understand
              the production
              lifecycle in one
              developer handbook.
            </p>
          </div>

          <div
            className={`mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl border shadow-xl ${card}`}
          >
            <div className="h-1 bg-blue-500" />

            <div className="grid lg:grid-cols-[1.2fr_.8fr]">
              <div className="p-6 sm:p-8 lg:p-10">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-500">
                  Google ADK Complete
                  Developer Handbook
                </p>

                <h3
                  className={`mt-2 text-2xl font-black sm:text-3xl ${primaryText}`}
                >
                  2nd Edition
                </h3>

                <p
                  className={`mt-4 leading-7 ${secondaryText}`}
                >
                  32 chapters covering
                  agent fundamentals,
                  orchestration,
                  tools, RAG, MCP,
                  A2A, evaluation,
                  observability,
                  deployment,
                  security, testing,
                  performance and
                  developer
                  references.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {[
                    "32 structured chapters",
                    "Code & command examples",
                    "RAG + MCP + A2A",
                    "Evaluation & observability",
                    "Deployment & FastAPI",
                    "Security & testing",
                  ].map(
                    (
                      item
                    ) => (
                      <div
                        key={
                          item
                        }
                        className={`flex gap-2 text-sm font-semibold ${secondaryText}`}
                      >
                        <Check
                          size={
                            16
                          }
                          className="mt-0.5 shrink-0 text-blue-500"
                        />

                        {
                          item
                        }
                      </div>
                    )
                  )}
                </div>
              </div>

              <div
                className={`
                  border-t
                  p-6
                  sm:p-8
                  lg:border-l
                  lg:border-t-0
                  lg:p-10
                  ${border}
                  ${
                    isDark
                      ? "bg-[#0C131C]"
                      : "bg-slate-50"
                  }
                `}
              >
                <div className="flex h-full flex-col justify-center">
                  <p
                    className={`text-sm font-bold ${mutedText}`}
                  >
                    {hasMrp
                      ? "Regular price"
                      : "Current price"}
                  </p>

                  <div className="mt-2 flex flex-wrap items-end gap-2">
                    {loadingProduct ? (
                      <span
                        className={`text-xl font-black ${secondaryText}`}
                      >
                        Loading price...
                      </span>
                    ) : canBuy ? (
                      <>
                        {hasMrp && (
                          <span
                            className={`text-xl font-bold line-through ${mutedText}`}
                          >
                            {formatMoney(
                              GOOGLE_ADK_MRP
                            )}
                          </span>
                        )}

                        <span
                          className={`text-4xl font-black sm:text-5xl ${primaryText}`}
                        >
                          {formatMoney(
                            GOOGLE_ADK_PRICE
                          )}
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-black text-red-500">
                        Price unavailable
                      </span>
                    )}
                  </div>

                  <p
                    className={`mt-3 text-sm leading-6 ${mutedText}`}
                  >
                    One-time payment.
                    <br />
                    No subscription
                    required.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      handlePurchase(
                        "pricing"
                      )
                    }
                    disabled={
                      !canBuy
                    }
                    className={`${purchaseButton} mt-7 w-full`}
                  >
                    {loadingProduct
                      ? "Loading price..."
                      : canBuy
                      ? "Get Instant PDF Access"
                      : "Price unavailable"}

                    <ArrowRight
                      size={
                        17
                      }
                    />
                  </button>

                  <PurchaseError />

                  <div
                    className={`mt-5 flex items-center justify-center gap-2 text-xs font-semibold ${mutedText}`}
                  >
                    <ShieldCheck
                      size={
                        15
                      }
                      className="text-emerald-500"
                    />

                    Secure payment •
                    Instant access
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`mx-auto mt-5 max-w-4xl rounded-2xl border px-5 py-5 text-center ${softCard}`}
          >
            <p
              className={`text-sm font-black ${primaryText}`}
            >
              Digital Product
            </p>

            <p
              className={`mx-auto mt-2 max-w-2xl text-xs leading-6 ${mutedText}`}
            >
              Due to the digital
              nature of this ebook,
              all purchases are final
              and non-refundable.
              Please review the
              contents and FAQ before
              purchasing.
            </p>

            <p
              className={`mt-2 break-words text-xs ${mutedText}`}
            >
              Purchase or ebook
              support:{" "}

              <a
                href="mailto:supporttargettrek@gmail.com"
                className="font-black text-blue-500 underline underline-offset-2"
              >
                supporttargettrek@gmail.com
              </a>
            </p>
          </div>
        </section>

        {/* FAQ */}

        <section
          className={`border-y py-16 sm:py-20 lg:py-24 ${border} ${alternateBg}`}
        >
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {sectionLabel(
                "Frequently asked questions"
              )}

              <h2
                className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
              >
                Questions before you
                buy?
              </h2>

              <p
                className={`mx-auto mt-4 max-w-2xl leading-7 ${secondaryText}`}
              >
                Important details
                about the handbook,
                learning path and
                purchase.
              </p>
            </div>

            <div className="mt-9 space-y-3">
              {FAQS.map(
                ([
                  question,
                  answer,
                ], index) => {
                  const opened =
                    openFaq ===
                    index;

                  return (
                    <div
                      key={
                        question
                      }
                      className={`overflow-hidden rounded-2xl border ${card}`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenFaq(
                            opened
                              ? null
                              : index
                          )
                        }
                        aria-expanded={
                          opened
                        }
                        aria-controls={`adk-faq-${index}`}
                        className={`
                          flex
                          w-full
                          items-center
                          justify-between
                          gap-4
                          p-4
                          text-left
                          text-sm
                          font-black
                          sm:p-5
                          sm:text-base
                          ${primaryText}
                        `}
                      >
                        <span>
                          {
                            question
                          }
                        </span>

                        <ChevronDown
                          size={
                            19
                          }
                          className={`
                            shrink-0
                            transition-transform
                            ${mutedText}
                            ${
                              opened
                                ? "rotate-180"
                                : ""
                            }
                          `}
                        />
                      </button>

                      {opened && (
                        <p
                          id={`adk-faq-${index}`}
                          className={`px-4 pb-5 text-sm leading-7 sm:px-5 sm:pr-12 ${secondaryText}`}
                        >
                          {
                            answer
                          }
                        </p>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </section>

        {/* Final CTA */}

        <section className="px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div
            className={`
              mx-auto
              max-w-4xl
              rounded-3xl
              border
              p-6
              sm:p-10
              ${card}
            `}
          >
            <div
              className={`
                mx-auto
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                ${
                  isDark
                    ? "bg-blue-950/40 text-blue-300"
                    : "bg-blue-50 text-blue-600"
                }
              `}
            >
              <Rocket
                size={
                  23
                }
              />
            </div>

            <h2
              className={`mx-auto mt-6 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
            >
              Start building AI
              agents with Google ADK.
            </h2>

            <p
              className={`mx-auto mt-4 max-w-xl leading-7 ${secondaryText}`}
            >
              Learn the fundamentals,
              understand the
              architecture, study the
              code and explore the
              production lifecycle in
              one developer handbook.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {loadingProduct ? (
                <span
                  className={`text-lg font-black ${secondaryText}`}
                >
                  Loading price...
                </span>
              ) : canBuy ? (
                <>
                  {hasMrp && (
                    <span
                      className={`text-lg font-bold line-through ${mutedText}`}
                    >
                      {formatMoney(
                        GOOGLE_ADK_MRP
                      )}
                    </span>
                  )}

                  <span className="text-3xl font-black text-blue-500 sm:text-4xl">
                    {formatMoney(
                      GOOGLE_ADK_PRICE
                    )}
                  </span>
                </>
              ) : (
                <span className="text-lg font-black text-red-500">
                  Price unavailable
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                handlePurchase(
                  "final_cta"
                )
              }
              disabled={
                !canBuy
              }
              className={`${purchaseButton} mt-7`}
            >
              {loadingProduct
                ? "Loading price..."
                : canBuy
                ? "Get Instant PDF Access"
                : "Price unavailable"}

              <ArrowRight
                size={
                  17
                }
              />
            </button>

            <PurchaseError />

            <p
              className={`mx-auto mt-6 max-w-xl break-words text-xs leading-6 ${mutedText}`}
            >
              Non-refundable digital
              product • Support:{" "}

              <a
                href="mailto:supporttargettrek@gmail.com"
                className="font-black text-blue-500"
              >
                supporttargettrek@gmail.com
              </a>
            </p>
          </div>
        </section>

        {/* Mobile sticky purchase */}

        <div
          className={`
            fixed
            inset-x-0
            bottom-0
            z-40
            border-t
            p-3
            shadow-2xl
            backdrop-blur-xl
            md:hidden
            ${border}
            ${
              isDark
                ? "bg-[#080D14]/95"
                : "bg-white/95"
            }
          `}
        >
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-[11px] font-bold ${mutedText}`}
              >
                Google ADK Handbook
              </p>

              <div className="mt-0.5 flex items-center gap-2">
                {loadingProduct ? (
                  <span
                    className={`text-xs font-bold ${secondaryText}`}
                  >
                    Loading...
                  </span>
                ) : canBuy ? (
                  <>
                    {hasMrp && (
                      <span
                        className={`text-[11px] font-bold line-through ${mutedText}`}
                      >
                        {formatMoney(
                          GOOGLE_ADK_MRP
                        )}
                      </span>
                    )}

                    <span className="text-base font-black text-blue-500">
                      {formatMoney(
                        GOOGLE_ADK_PRICE
                      )}
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-bold text-red-500">
                    Price unavailable
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                handlePurchase(
                  "mobile_sticky"
                )
              }
              disabled={
                !canBuy
              }
              className="
                flex
                min-h-[44px]
                shrink-0
                items-center
                gap-2
                rounded-xl
                bg-blue-600
                px-4
                py-2.5
                text-sm
                font-black
                text-white
                transition
                hover:bg-blue-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Buy Now

              <ArrowRight
                size={
                  15
                }
              />
            </button>
          </div>

          <PurchaseError
            compact
          />
        </div>

        <PayUCheckoutModal
          isOpen={
            isCheckoutOpen &&
            canBuy
          }
          onClose={() =>
            setIsCheckoutOpen(
              false
            )
          }
          product={
            product
          }
        />
      </main>
    </>
  );
}