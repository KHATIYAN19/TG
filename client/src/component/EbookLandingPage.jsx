// import React, { useEffect, useState } from "react";
// import {
//   ArrowRight,
//   Check,
//   ChevronDown,
//   Code2,
//   Layers3,
//   Rocket,
//   ShieldCheck,
//   Sparkles,
//   Terminal,
//   Users,
//   BookOpen,
//   Database,
//   Network,
//   Search,
//   Zap,
//   Server,
//   TestTube,
//   Lock,
//   GitBranch,
// } from "lucide-react";

// import ADK_PAYMENT_URL from "../utils/adk_payment_url";

// const paymentLink = ADK_PAYMENT_URL;

// const GA_MEASUREMENT_ID = "G-5FPEL1W0VB";

// const codeExamples = [
//   {
//     id: "agent",
//     label: "01 • Agent",
//     title: "Minimal LLM Agent",
//     description: "Start with the core agent primitive before composing larger systems.",
//     language: "python",
//     code: `from google.adk.agents import Agent

// root_agent = Agent(
//     name="support_agent",
//     model="gemini-flash-latest",
//     instruction="""
//     You are a customer-support assistant.
//     Be concise. Never invent account data.
//     Use tools when account information is required.
//     """,
// )`,
//   },
//   {
//     id: "tool",
//     label: "02 • Tool",
//     title: "Function Calling",
//     description: "Connect the model to deterministic Python functions and real systems.",
//     language: "python",
//     code: `from google.adk.agents import Agent

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
//   },
//   {
//     id: "rag",
//     label: "03 • RAG",
//     title: "Retrieval Pipeline",
//     description: "Retrieve relevant evidence, then let the agent answer from grounded context.",
//     language: "python",
//     code: `def retrieve(query: str, top_k: int = 5) -> list[dict]:
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
//   },
//   {
//     id: "multi",
//     label: "04 • Multi-Agent",
//     title: "Sequential Workflow",
//     description: "Make orchestration explicit when one agent depends on another agent's output.",
//     language: "python",
//     code: `from google.adk.agents import Agent, SequentialAgent

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
//   },
// ];

// function CodeTabs() {
//   const [active, setActive] = useState(0);

//   return (
//     <div className="overflow-hidden rounded-[28px] border border-slate-800 bg-[#050b14] shadow-2xl">
//       <div className="border-b border-white/10 bg-white/[0.03] p-2">
//         <div className="flex gap-2 overflow-x-auto">
//           {codeExamples.map((item, index) => (
//             <button
//               key={item.id}
//               type="button"
//               onMouseEnter={() => setActive(index)}
//               onFocus={() => setActive(index)}
//               onClick={() => setActive(index)}
//               className={`group relative min-w-max rounded-xl px-4 py-3 text-left transition-all duration-300 ${
//                 active === index
//                   ? "bg-white/10 text-white shadow-lg"
//                   : "text-slate-500 hover:bg-white/[0.06] hover:text-slate-200"
//               }`}
//             >
//               <span className="block text-[11px] font-black uppercase tracking-[0.12em]">
//                 {item.label}
//               </span>
//               <span className="mt-0.5 block text-xs font-semibold">
//                 {item.title}
//               </span>
//               <span
//                 className={`absolute inset-x-3 bottom-0 h-0.5 origin-left rounded-full bg-blue-400 transition-transform duration-300 ${
//                   active === index ? "scale-x-100" : "scale-x-0"
//                 }`}
//               />
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="grid lg:grid-cols-[.8fr_1.2fr]">
//         <div className="border-b border-white/10 p-7 lg:border-b-0 lg:border-r lg:p-9">
//           <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-blue-400">
//             <Code2 size={15} />
//             {codeExamples[active].label}
//           </div>
//           <h3 className="mt-4 text-2xl font-black text-white">
//             {codeExamples[active].title}
//           </h3>
//           <p className="mt-4 text-sm leading-7 text-slate-400">
//             {codeExamples[active].description}
//           </p>
//           <div className="mt-7 flex flex-wrap gap-2">
//             {["Concept", "Flow", "Code", "Production"].map((tag) => (
//               <span
//                 key={tag}
//                 className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-slate-400"
//               >
//                 {tag}
//               </span>
//             ))}
//           </div>
//         </div>

//         <div className="relative min-h-[390px] bg-[#02060d]">
//           <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
//             <span className="h-3 w-3 rounded-full bg-red-400" />
//             <span className="h-3 w-3 rounded-full bg-yellow-400" />
//             <span className="h-3 w-3 rounded-full bg-green-400" />
//             <span className="ml-3 text-xs font-semibold text-slate-600">
//               {codeExamples[active].id}.py
//             </span>
//           </div>
//           <pre className="max-h-[520px] overflow-auto p-6 text-[12px] leading-6 text-slate-300 sm:text-[13px]">
//             <code key={codeExamples[active].id} className="block animate-code-in">
//               {codeExamples[active].code}
//             </code>
//           </pre>
//         </div>
//       </div>
//     </div>
//   );
// }

// function GenAIEngineerFlow() {
//   const steps = [
//     ["01", "Python + LLM Foundations", "Models, prompts, context"],
//     ["02", "Agent Fundamentals", "Instructions, state, sessions"],
//     ["03", "Tools + Function Calling", "APIs, files, actions"],
//     ["04", "RAG + Memory", "Retrieval, grounding, context"],
//     ["05", "Multi-Agent + Protocols", "Workflows, MCP, A2A"],
//     ["06", "Eval + Observability", "Tests, traces, guardrails"],
//     ["07", "Production Engineering", "FastAPI, deployment, security"],
//   ];

//   return (
//     <div className="relative mt-14">
//       <div className="absolute left-8 right-8 top-1/2 hidden h-px bg-gradient-to-r from-blue-500/10 via-blue-500/70 to-blue-500/10 lg:block" />
//       <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
//         {steps.map(([number, title, description], index) => (
//           <div key={number} className="group relative">
//             <div className="relative flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur transition-all duration-500 hover:-translate-y-2 hover:border-blue-400/50 hover:bg-blue-500/[0.08] hover:shadow-2xl hover:shadow-blue-950/30">
//               <div className="mb-5 flex items-center justify-between">
//                 <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-xs font-black text-blue-300 ring-1 ring-blue-400/20">
//                   {number}
//                 </span>
//                 {index < steps.length - 1 && (
//                   <ArrowRight className="hidden text-blue-400/60 lg:block" size={18} />
//                 )}
//               </div>
//               <h3 className="text-sm font-black leading-5 text-white">{title}</h3>
//               <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
//               <div className="mt-5 h-1 w-0 rounded-full bg-blue-400 transition-all duration-500 group-hover:w-full" />
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function PdfPageShell({ children, className = "" }) {
//   return (
//     <div
//       className={`relative mx-auto aspect-[3/4] w-full max-w-[620px] overflow-hidden rounded-[10px] bg-white shadow-[0_25px_70px_rgba(15,23,42,0.22)] ring-1 ring-slate-200 ${className}`}
//     >
//       {children}
//     </div>
//   );
// }

// function PdfCoverPreview() {
//   const topics = [
//     "Agents & Workflows",
//     "Tools & Function Calling",
//     "RAG",
//     "MCP & A2A",
//     "Guardrails",
//     "Memory & State",
//     "LiteLLM & Models",
//     "Evals & Observability",
//     "FastAPI & Deployment",
//     "Security & Performance",
//   ];

//   return (
//     <div className="group">
//       <div className="mb-4 flex items-center justify-between px-1">
//         <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
//           Preview 01 • Cover
//         </span>
//         <span className="text-xs font-semibold text-slate-400">Actual PDF data</span>
//       </div>

//       <PdfPageShell className="bg-[#07142f] text-white">
//         <div className="absolute inset-y-0 left-0 w-[3.2%] bg-[#2d67e8]" />

//         <div className="absolute left-[12%] right-[9%] top-[10.5%]">
//           <p className="text-[clamp(7px,1.05vw,15px)] font-black tracking-wide text-[#39d4f4]">
//             DEVELOPER EDITION - 2ND EDITION
//           </p>
//         </div>

//         <div className="absolute right-[9.5%] top-[7%] flex items-center gap-4">
//           <span className="h-3 w-3 rounded-full bg-[#2762df] sm:h-4 sm:w-4" />
//           <span className="h-7 w-7 rounded-full bg-[#5de0f2] sm:h-9 sm:w-9" />
//         </div>

//         <div className="absolute left-[12%] right-[8%] top-[23.5%]">
//           <h3 className="text-[clamp(23px,4.7vw,62px)] font-black leading-[1.02] tracking-[-0.045em] text-white">
//             Google ADKComplete
//           </h3>
//           <h3 className="mt-1 text-[clamp(23px,4.7vw,62px)] font-black leading-[1.02] tracking-[-0.045em] text-[#46d8f5]">
//             Developer Handbook
//           </h3>
//           <p className="mt-[8%] text-[clamp(9px,1.65vw,22px)] font-medium text-[#d7e1f4]">
//             The Complete Agentic AI Developer Handbook
//           </p>
//         </div>

//         <div className="absolute left-[3.2%] right-0 top-[41.9%] bottom-0 bg-[#06122d]">
//           <div className="absolute left-[12%] right-[9%] top-[5.2%] flex flex-wrap gap-2 sm:gap-3">
//             {topics.map((topic) => (
//               <span
//                 key={topic}
//                 className="rounded-full bg-[#173363] px-3 py-1.5 text-[clamp(6px,0.82vw,12px)] font-medium leading-none text-[#d8e4fa] ring-1 ring-white/[0.03] sm:px-4 sm:py-2"
//               >
//                 {topic}
//               </span>
//             ))}
//           </div>

//           <div className="absolute bottom-[9.5%] left-[12%] right-[9%]">
//             <p className="text-[clamp(8px,1.45vw,19px)] font-black tracking-wide text-white">
//               PYTHON • GOOGLE ADK • GEMINI • AGENTIC AI
//             </p>
//             <p className="mt-5 text-[clamp(6px,0.9vw,12px)] font-medium text-[#a9b8d1]">
//               Concepts → Architecture → Working Code → Commands → Production Patterns
//             </p>
//             <p className="mt-4 text-[clamp(6px,0.9vw,12px)] font-medium text-[#a9b8d1]">
//               Version-focused practical reference • September 2026
//             </p>
//           </div>
//         </div>
//       </PdfPageShell>
//     </div>
//   );
// }

// function PdfInstallationPreview() {
//   return (
//     <div className="group">
//       <div className="mb-4 flex items-center justify-between px-1">
//         <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
//           Preview 02 • Installation & Authentication
//         </span>
//         <span className="text-xs font-semibold text-slate-400">Actual PDF data</span>
//       </div>

//       <PdfPageShell className="font-sans text-[#14213d]">
//         <div className="absolute left-[8.5%] right-[8.5%] top-[4.2%] flex items-center justify-between border-b border-[#cbd5e1] pb-[2.2%] text-[clamp(5px,0.7vw,10px)] font-bold text-[#596579]">
//           <span>GOOGLE ADK • COMPLETE DEVELOPER HANDBOOK • 2ND EDITION</span>
//           <span>SEPTEMBER 2026</span>
//         </div>

//         <div className="absolute left-[8.5%] right-[8.5%] top-[9.4%] bottom-[7%] overflow-hidden">
//           <h3 className="text-[clamp(16px,2.9vw,38px)] font-black leading-[1.1] tracking-[-0.025em] text-[#101b36]">
//             03. Prerequisites, Installation and Authentication
//           </h3>

//           <p className="mt-[2.2%] text-[clamp(7px,1.02vw,14px)] leading-[1.55] text-[#1d293f]">
//             This chapter gives a clean local setup. Use Python 3.11+, a virtual environment, and either Gemini API-key authentication for development or Google Cloud/Vertex AI authentication for cloud workloads.
//           </p>

//           <h4 className="mt-[4.5%] text-[clamp(12px,1.8vw,24px)] font-black text-[#2f67e8]">
//             Install with pip
//           </h4>

//           <PdfCodeBox label="LOCAL INSTALLATION" language="bash">
// {`python -m venv .venv
// source .venv/bin/activate          # macOS/Linux
// # .venv\\Scripts\\activate         # Windows

// python -m pip install --upgrade pip
// pip install google-adk

// # Optional: install Agents CLI
// # uvx google-agents-cli setup`}
//           </PdfCodeBox>

//           <h4 className="mt-[3.4%] text-[clamp(12px,1.8vw,24px)] font-black text-[#2f67e8]">
//             Gemini API key path
//           </h4>

//           <p className="mt-[1.5%] text-[clamp(6.5px,0.92vw,13px)] leading-[1.5] text-[#1d293f]">
//             Create a Gemini API key in Google AI Studio, then keep it outside source control. For local development, ADK examples commonly use <strong>GEMINI_API_KEY</strong> or <strong>GOOGLE_API_KEY</strong> depending on the configured client.
//           </p>

//           <PdfCodeBox label="ENVIRONMENT VARIABLES" language="dotenv">
// {`# .env
// GEMINI_API_KEY="YOUR_API_KEY"

// # Never commit .env
// echo ".env" >> .gitignore`}
//           </PdfCodeBox>

//           <p className="mt-[2.1%] text-[clamp(6.5px,0.92vw,13px)] leading-[1.5] text-[#1d293f]">
//             A production application should normally use a managed secret or workload identity rather than hard-coding a key.
//           </p>

//           <h4 className="mt-[3.6%] text-[clamp(12px,1.8vw,24px)] font-black text-[#2f67e8]">
//             Vertex AI / Google Cloud path
//           </h4>

//           <PdfCodeBox label="GOOGLE CLOUD AUTHENTICATION" language="bash">
// {`gcloud auth application-default login
// gcloud config set project YOUR_PROJECT_ID

// export GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID
// export GOOGLE_CLOUD_LOCATION=us-central1
// export GOOGLE_GENAI_USE_VERTEXAI=TRUE

// # Confirm the active identity
// gcloud auth application-default print-access-token >/dev/null
// echo "ADC is configured"`}
//           </PdfCodeBox>

//           <p className="mt-[2%] text-[clamp(6px,0.88vw,12px)] leading-[1.45] text-[#1d293f]">
//             The Google Agents CLI authentication guide also documents interactive login/status commands. Keep local developer credentials separate from the service account used by production deployment.
//           </p>
//         </div>

//         <span className="absolute bottom-[2.7%] left-1/2 -translate-x-1/2 text-[clamp(5px,0.7vw,10px)] text-[#64748b]">
//           12
//         </span>
//       </PdfPageShell>
//     </div>
//   );
// }

// function PdfCodeBox({ label, language, children }) {
//   return (
//     <div className="mt-[1.7%] overflow-hidden rounded-[7px] bg-[#111827] text-white shadow-sm">
//       <div className="flex items-center justify-between bg-[#39475c] px-[2.2%] py-[1.1%] text-[clamp(5px,0.65vw,9px)] font-bold tracking-wide text-[#e2e8f0]">
//         <span>{label}</span>
//         <span className="font-normal text-[#cbd5e1]">{language}</span>
//       </div>
//       <pre className="overflow-hidden whitespace-pre-wrap px-[2.2%] py-[2.2%] font-mono text-[clamp(5px,0.68vw,9.5px)] leading-[1.45] text-[#cbd5e1]">
//         <code>{children}</code>
//       </pre>
//     </div>
//   );
// }

// function ReviewSection() {
//   return (
//     <section className="bg-white py-24" data-reveal>
//       <div className="mx-auto max-w-6xl px-6 lg:px-8">
//         <div className="mx-auto max-w-3xl text-center">
//           <SectionLabel>Reader reviews</SectionLabel>
//           <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Built to be useful. Your review comes next.</h2>
//           <p className="mt-5 leading-8 text-slate-600">
//             We are keeping this section honest: there are no invented testimonials here. Once readers share genuine feedback, their verified experiences can be featured on this page.
//           </p>
//         </div>

//         <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
//           {[
//             ["Practical", "Tell us which chapter or project helped you most."],
//             ["Clear", "Share whether the flow from concept to code made learning easier."],
//             ["Interview-ready", "Tell future readers how useful the quick-reference sections were for revision."],
//           ].map(([title, text]) => (
//             <div key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
//               <div className="flex gap-1 text-amber-400">★★★★★</div>
//               <h3 className="mt-5 text-lg font-black text-slate-900">{title}</h3>
//               <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
//             </div>
//           ))}
//         </div>

//         <div className="mx-auto mt-8 flex max-w-5xl flex-col items-center justify-between gap-5 rounded-3xl border border-blue-100 bg-blue-50 p-6 text-center sm:flex-row sm:text-left">
//           <div>
//             <p className="font-black text-slate-900">Have you already read it?</p>
//             <p className="mt-1 text-sm text-slate-600">Share a genuine review and help the next developer decide.</p>
//           </div>
//           <a href="mailto:supporttargettrek@gmail.com?subject=Google ADK Handbook Review" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700">
//             Write a Review <ArrowRight size={17} />
//           </a>
//         </div>
//       </div>
//     </section>
//   );
// }

// /* =========================================================
//    PRICE CONFIGURATION
//    ========================================================= */

// const GOOGLE_ADK_MRP = Number(
//   import.meta.env.VITE_GOOGLE_ADK_MRP
// );

// const GOOGLE_ADK_PRICE = Number(
//   import.meta.env.VITE_GOOGLE_ADK_PRICE
// );

// /* =========================================================
//    PRICE VALIDATION
//    ========================================================= */

// if (
//   !Number.isFinite(GOOGLE_ADK_MRP) ||
//   !Number.isFinite(GOOGLE_ADK_PRICE)
// ) {
//   console.error(
//     "Google ADK pricing is not configured correctly. Please set VITE_GOOGLE_ADK_MRP and VITE_GOOGLE_ADK_PRICE."
//   );
// }

// /* =========================================================
//    PURCHASE
//    ========================================================= */

// const handlePurchase = (source = "unknown") => {
//   /*
//    * Optional analytics.
//    * These do nothing if Google Analytics / GTM is not installed.
//    */

//   try {
//     window.dataLayer = window.dataLayer || [];

//     window.dataLayer.push({
//       event: "adk_purchase_click",
//       product: "google_adk_handbook_2nd_edition",
//       source,
//       price: GOOGLE_ADK_PRICE,
//       currency: "INR",
//     });

//     if (typeof window.gtag === "function") {
//       window.gtag("event", "begin_checkout", {
//         currency: "INR",
//         value: GOOGLE_ADK_PRICE,
//         items: [
//           {
//             item_id: "google_adk_handbook_2nd_edition",
//             item_name:
//               "Google ADK Complete Developer Handbook - 2nd Edition",
//             price: GOOGLE_ADK_PRICE,
//             quantity: 1,
//           },
//         ],
//       });
//     }
//   } catch (error) {
//     console.warn("Purchase analytics failed:", error);
//   }

//   window.open(
//     paymentLink,
//     "_blank",
//     "noopener,noreferrer"
//   );
// };

// /* =========================================================
//    CHAPTERS
//    ========================================================= */

// const chapters = [
//   [
//     "01",
//     "Agentic AI Fundamentals",
//     "Agent loops, tools, context, memory, workflows, and when agents make sense.",
//   ],
//   [
//     "02",
//     "Google ADK: What It Is & Where It Fits",
//     "Understand ADK, the developer workflow, and the current Agents CLI.",
//   ],
//   [
//     "03",
//     "Setup, Installation & Authentication",
//     "Install ADK, configure Gemini or Vertex AI, and create your first agent.",
//   ],
//   [
//     "04",
//     "Project Structure & Developer Workflow",
//     "Organize agents, services, tests, evaluation datasets, and deployment files.",
//   ],
//   [
//     "05",
//     "LlmAgent: The Core Agent Type",
//     "Build LLM-powered agents and understand the decision/tool-use loop.",
//   ],
//   [
//     "06",
//     "Sequential, Parallel & Loop Agents",
//     "Master the core workflow agents and practical orchestration patterns.",
//   ],
//   [
//     "07",
//     "Custom Agents & Graph Workflows",
//     "Create advanced control flow when standard workflow agents are not enough.",
//   ],
//   [
//     "08",
//     "Tools & Function Calling",
//     "Connect agents to application logic, APIs, databases, and external capabilities.",
//   ],
//   [
//     "09",
//     "Built-in Tools, Search, Files & Toolsets",
//     "Use built-in capabilities and understand toolset-based architectures.",
//   ],
//   [
//     "10",
//     "Callbacks, Plugins & Guardrails",
//     "Observe, intercept, validate, authorize, retry, and control agent behavior.",
//   ],
//   [
//     "11",
//     "Sessions, State, Context & Memory",
//     "Understand short-term state, sessions, context, and persistent memory.",
//   ],
//   [
//     "12",
//     "RAG: Full Working Pipeline",
//     "Build retrieval-augmented agents with ingestion, embeddings, retrieval, and grounding.",
//   ],
//   [
//     "13",
//     "MCP: Model Context Protocol",
//     "Connect ADK agents to MCP servers using practical integration patterns.",
//   ],
//   [
//     "14",
//     "A2A: Agent-to-Agent Systems",
//     "Design specialist agents as services and connect them through A2A patterns.",
//   ],
//   [
//     "15",
//     "Models, Gemini, LiteLLM & Open Models",
//     "Configure models and understand multi-model routing and integrations.",
//   ],
//   [
//     "16",
//     "Streaming, Live Agents & Multimodal Inputs",
//     "Work with streaming events, live interactions, files, and multimodal inputs.",
//   ],
//   [
//     "17",
//     "Artifacts & File Handling",
//     "Manage generated files and artifacts safely across agent workflows.",
//   ],
//   [
//     "18",
//     "Evaluation: Datasets, Metrics & Eval-Fix Loop",
//     "Create evaluations, measure behavior, and turn failures into regression tests.",
//   ],
//   [
//     "19",
//     "Observability, Tracing & Debugging",
//     "Trace agent runs, inspect tool calls, and debug production behavior.",
//   ],
//   [
//     "20",
//     "Deployment: Agent Runtime, Cloud Run & GKE",
//     "Move agents from local development into production infrastructure.",
//   ],
//   [
//     "21",
//     "Batching, Async Workloads & Performance",
//     "Process workloads efficiently with bounded concurrency and performance controls.",
//   ],
//   [
//     "22",
//     "FastAPI / REST Integration",
//     "Expose agent capabilities through application APIs and backend services.",
//   ],
//   [
//     "23",
//     "End-to-End Production Agent",
//     "Combine research, RAG, orchestration, synthesis, and review into one system.",
//   ],
//   [
//     "24",
//     "Security, Privacy & Reliability",
//     "Handle prompt injection, tool abuse, data leakage, retries, and failure modes.",
//   ],
//   [
//     "25",
//     "Structured Output, Schemas & Validation",
//     "Return predictable structured results and validate model-generated data.",
//   ],
//   [
//     "26",
//     "Caching, Context Control & Cost Engineering",
//     "Control token usage, context growth, latency, and model costs.",
//   ],
//   [
//     "27",
//     "CLI: Commands You Actually Need",
//     "Practical commands for creating, running, evaluating, scaffolding, and deploying agents.",
//   ],
//   [
//     "28",
//     "Testing Strategy for Agentic Systems",
//     "Build unit, integration, failure-injection, and behavior-focused tests.",
//   ],
//   [
//     "29",
//     "Observability + Evaluation + Guardrails Pipeline",
//     "Connect telemetry, quality checks, guardrails, and continuous improvement.",
//   ],
//   [
//     "30",
//     "Troubleshooting Guide",
//     "Diagnose common setup, model, tool, deployment, and runtime problems.",
//   ],
//   [
//     "31",
//     "Production Checklist",
//     "A practical checklist for taking an agent system toward production.",
//   ],
//   [
//     "32",
//     "Developer Cheat Sheets & Reference Architecture",
//     "Quick references, architecture patterns, commands, and reusable mental models.",
//   ],
// ];

// /* =========================================================
//    LEARNING POINTS
//    ========================================================= */

// const learningPoints = [
//   "Build AI agents from scratch using Google ADK",
//   "Connect agents with tools and external APIs",
//   "Work with sessions, state and context",
//   "Build RAG-powered AI agents",
//   "Design multi-agent architectures",
//   "Create sequential and parallel workflows",
//   "Handle errors and unreliable tool calls",
//   "Test and evaluate agent behavior",
//   "Understand production architecture",
//   "Deploy and expose agents through APIs",
// ];

// /* =========================================================
//    PROJECTS
//    ========================================================= */

// const projects = [
//   {
//     icon: Sparkles,
//     title: "Research Agent",
//     description:
//       "Build an agent that researches a topic, gathers information and produces a structured result.",
//   },
//   {
//     icon: Code2,
//     title: "API Agent",
//     description:
//       "Connect an AI agent with external APIs and allow it to perform real-world actions.",
//   },
//   {
//     icon: Layers3,
//     title: "RAG Agent",
//     description:
//       "Create an agent that can answer questions using your own documents and knowledge base.",
//   },
//   {
//     icon: Users,
//     title: "Multi-Agent System",
//     description:
//       "Create specialized agents and orchestrate them into a complete AI workflow.",
//   },
// ];

// /* =========================================================
//    FAQ
//    ========================================================= */

// const faqs = [
//   {
//     question: "Who is this ebook for?",
//     answer:
//       "It is designed for developers, backend engineers, GenAI learners, and software engineers who want a practical path from ADK fundamentals to production-oriented agent systems.",
//   },
//   {
//     question: "What is covered in the 2nd Edition?",
//     answer:
//       "The handbook covers 32 chapters including agents, tools, workflow agents, sessions and memory, RAG, MCP, A2A, LiteLLM, streaming, artifacts, evaluation, observability, deployment, FastAPI, security, testing, performance, and production checklists.",
//   },
//   {
//     question: "Does the ebook contain code and commands?",
//     answer:
//       "Yes. It follows a concept → flow → code → commands → production notes approach, with implementation examples throughout the handbook.",
//   },
//   {
//     question: "Is prior Google ADK experience required?",
//     answer:
//       "No. The handbook starts with fundamentals and setup before moving into advanced orchestration, integrations, evaluation, and deployment.",
//   },
//   {
//     question: "Is this a video course?",
//     answer:
//       "No. It is a developer-focused ebook and reference handbook designed to accompany hands-on implementation.",
//   },
//   {
//     question: "Is the ebook refundable?",
//     answer:
//       "No. Due to the digital nature of the ebook, all purchases are non-refundable. Please review the contents and FAQ before purchasing.",
//   },
//   {
//     question: "How can I get support?",
//     answer:
//       "For purchase or ebook-related issues, contact supporttargettrek@gmail.com.",
//   },
// ];

// /* =========================================================
//    SMALL COMPONENTS
//    ========================================================= */

// function FAQItem({ question, answer }) {
//   return (
//     <details className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//       <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
//         <span>{question}</span>

//         <ChevronDown
//           size={20}
//           className="shrink-0 text-slate-400 transition-transform group-open:rotate-180"
//         />
//       </summary>

//       <p className="mt-4 pr-8 text-sm leading-7 text-slate-600">
//         {answer}
//       </p>
//     </details>
//   );
// }

// function SectionLabel({ children, dark = false }) {
//   return (
//     <p
//       className={`text-sm font-black uppercase tracking-[0.18em] ${
//         dark ? "text-blue-400" : "text-blue-600"
//       }`}
//     >
//       {children}
//     </p>
//   );
// }

// /* =========================================================
//    MAIN PAGE
//    ========================================================= */

// export default function EbookPage() {
//   const [scrollProgress, setScrollProgress] = useState(0);

//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     window.dataLayer = window.dataLayer || [];
//     window.gtag = window.gtag || function () {
//       window.dataLayer.push(arguments);
//     };

//     if (!document.querySelector(`script[data-google-analytics="${GA_MEASUREMENT_ID}"]`)) {
//       const script = document.createElement("script");
//       script.async = true;
//       script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
//       script.dataset.googleAnalytics = GA_MEASUREMENT_ID;
//       document.head.appendChild(script);
//     }

//     window.gtag("js", new Date());
//     window.gtag("config", GA_MEASUREMENT_ID, {
//       page_title: document.title,
//       page_location: window.location.href,
//     });

//     const updateProgress = () => {
//       const scrollable = document.documentElement.scrollHeight - window.innerHeight;
//       const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
//       setScrollProgress(Math.min(100, Math.max(0, progress)));
//     };

//     updateProgress();
//     window.addEventListener("scroll", updateProgress, { passive: true });

//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             entry.target.classList.add("is-visible");
//             observer.unobserve(entry.target);
//           }
//         });
//       },
//       { threshold: 0.12 }
//     );

//     document.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));

//     return () => {
//       window.removeEventListener("scroll", updateProgress);
//       observer.disconnect();
//     };
//   }, []);

//   const chaptersByGroup = [
//     {
//       label: "FOUNDATIONS",
//       items: chapters.slice(0, 5),
//     },
//     {
//       label: "ORCHESTRATION & TOOLS",
//       items: chapters.slice(5, 11),
//     },
//     {
//       label: "INTEGRATIONS",
//       items: chapters.slice(11, 17),
//     },
//     {
//       label: "PRODUCTION",
//       items: chapters.slice(17, 25),
//     },
//     {
//       label: "ENGINEERING & REFERENCE",
//       items: chapters.slice(25),
//     },
//   ];

//   return (
//     <main className="min-h-screen scroll-smooth bg-slate-50 text-slate-900">
//       <style>{`
//         html { scroll-behavior: smooth; }
//         [data-reveal] { opacity: 0; transform: translateY(28px); transition: opacity .75s ease, transform .75s ease; }
//         [data-reveal].is-visible { opacity: 1; transform: translateY(0); }
//         @keyframes codeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
//         .animate-code-in { animation: codeIn .35s ease both; }
//         @keyframes floatBook { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-10px) rotate(-2deg); } }
//         .animate-float-book { animation: floatBook 5s ease-in-out infinite; }
//         @media (prefers-reduced-motion: reduce) {
//           html { scroll-behavior: auto; }
//           [data-reveal] { opacity: 1; transform: none; transition: none; }
//           .animate-code-in, .animate-float-book { animation: none; }
//         }
//       `}</style>

//       <div className="fixed left-0 right-0 top-0 z-[60] h-1 bg-white/10">
//         <div className="h-full origin-left bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-500 transition-[width] duration-100" style={{ width: `${scrollProgress}%` }} />
//       </div>

//       {/* =====================================================
//           HERO
//       ===================================================== */}

//       <section className="relative overflow-hidden bg-[#07111f] text-white">

//         <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-3xl" />

//         <div className="absolute -right-40 top-10 h-[600px] w-[600px] rounded-full bg-indigo-500/15 blur-3xl" />

//         <div
//           className="absolute inset-0 opacity-[0.045]"
//           style={{
//             backgroundImage:
//               "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
//             backgroundSize: "44px 44px",
//           }}
//         />

//         <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-14 lg:px-8 lg:pb-28 lg:pt-24">

//           <div className="grid items-center gap-16 lg:grid-cols-[1.12fr_.88fr]">

//             {/* LEFT */}

//             <div>

//               <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-bold text-blue-300">
//                 <Sparkles size={16} />
//                 2nd Edition • Developer Handbook
//               </div>

//               <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
//                 Learn Google ADK
//                 <span className="block text-blue-400">
//                   by Building Real AI Agents
//                 </span>
//               </h1>

//               <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
//                 A practical, code-first developer handbook that takes you
//                 from your first Google ADK agent to tools, RAG, MCP, A2A,
//                 multi-agent workflows, evaluation and production deployment.
//               </p>

//               <div className="mt-8 flex flex-wrap gap-3">

//                 {[
//                   "32 Chapters",
//                   "Practical Code",
//                   "RAG + MCP + A2A",
//                   "Production Topics",
//                 ].map((item) => (
//                   <span
//                     key={item}
//                     className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-200"
//                   >
//                     {item}
//                   </span>
//                 ))}

//               </div>

//               {/* CTA */}

//               <div className="mt-10 flex flex-col gap-3 sm:flex-row">

//                 <button
//                   onClick={() => handlePurchase("hero")}
//                   className="group inline-flex items-center justify-center gap-3 rounded-xl bg-blue-500 px-7 py-4 font-black text-white shadow-xl shadow-blue-950/40 transition hover:bg-blue-400"
//                 >
//                   <span>GET INSTANT PDF ACCESS</span>

//                   <span className="flex items-center gap-2">
//                     <span className="text-sm font-semibold text-blue-200 line-through">
//                       ₹{GOOGLE_ADK_MRP}
//                     </span>

//                     <span className="text-lg">
//                       ₹{GOOGLE_ADK_PRICE}
//                     </span>
//                   </span>

//                   <ArrowRight
//                     size={19}
//                     className="transition group-hover:translate-x-1"
//                   />
//                 </button>

//                 <a
//                   href="#contents"
//                   className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] px-7 py-4 font-bold text-slate-200 transition hover:bg-white/10"
//                 >
//                   See What's Inside
//                 </a>

//               </div>

//               <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
//                 <span>✓ One-time payment</span>
//                 <span>✓ Instant digital access</span>
//                 <span>✓ No subscription</span>
//               </div>

//             </div>

//             {/* BOOK */}

//             <div className="flex justify-center lg:justify-end">

//               <div className="relative">

//                 <div className="absolute -inset-12 rounded-full bg-blue-500/20 blur-3xl" />

//                 <div className="animate-float-book relative w-[300px] rotate-[-3deg] rounded-r-2xl rounded-l-md border border-white/10 bg-gradient-to-br from-[#173d78] via-[#0d63c9] to-[#37238d] p-8 shadow-2xl shadow-black/50 sm:w-[360px]">

//                   <div className="absolute left-0 top-0 h-full w-3 rounded-l-md bg-black/20" />

//                   <div className="flex h-[480px] flex-col justify-between">

//                     <div>

//                       <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
//                         <Terminal size={15} />
//                         Developer Handbook
//                       </div>

//                       <div className="mt-7 h-px bg-white/20" />

//                       <p className="mt-10 text-xs font-black uppercase tracking-[0.22em] text-blue-100">
//                         2nd Edition
//                       </p>

//                       <h2 className="mt-4 text-4xl font-black leading-[1.02] text-white">
//                         Google
//                         <br />
//                         ADK
//                         <br />
//                         Complete
//                         <br />
//                         Developer
//                         <br />
//                         Handbook
//                       </h2>

//                       <p className="mt-5 max-w-[240px] text-sm leading-6 text-blue-100">
//                         From first agent to RAG, MCP, A2A, evaluation,
//                         observability and production deployment.
//                       </p>

//                     </div>

//                     <div>

//                       <div className="flex flex-wrap gap-2">
//                         {[
//                           "Agents",
//                           "RAG",
//                           "MCP",
//                           "A2A",
//                           "Production",
//                         ].map((tag) => (
//                           <span
//                             key={tag}
//                             className="rounded-lg bg-white/10 px-3 py-2 text-[10px] font-bold text-white"
//                           >
//                             {tag}
//                           </span>
//                         ))}
//                       </div>

//                       <p className="mt-5 text-xs font-bold text-blue-100">
//                         Practical • Code-first • Production-aware
//                       </p>

//                     </div>

//                   </div>
//                 </div>

//                 {/* PRICE */}

//                 <div className="absolute -bottom-6 -right-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-2xl sm:-right-8">

//                   <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
//                     Current Price
//                   </p>

//                   <div className="mt-1 flex items-center gap-2">

//                     <span className="text-sm font-bold text-slate-400 line-through">
//                       ₹{GOOGLE_ADK_MRP}
//                     </span>

//                     <span className="text-3xl font-black text-blue-600">
//                       ₹{GOOGLE_ADK_PRICE}
//                     </span>

//                   </div>

//                 </div>

//               </div>
//             </div>

//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           TRUST STRIP
//       ===================================================== */}

//       <section className="border-b border-slate-200 bg-white" data-reveal>

//         <div className="mx-auto grid max-w-6xl grid-cols-2 lg:grid-cols-4">

//           {[
//             ["32 Chapters", "Structured learning path"],
//             ["Code-First", "Commands + implementation"],
//             ["RAG / MCP / A2A", "Modern agent integrations"],
//             ["Production", "Evaluation + deployment"],
//           ].map(([title, description]) => (
//             <div
//               key={title}
//               className="border-r border-slate-200 px-5 py-7 text-center last:border-r-0"
//             >
//               <p className="font-black text-slate-900">
//                 {title}
//               </p>

//               <p className="mt-1 text-sm text-slate-500">
//                 {description}
//               </p>
//             </div>
//           ))}

//         </div>
//       </section>

//       {/* =====================================================
//           PROBLEM / VALUE
//       ===================================================== */}

//       <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8" data-reveal>

//         <div className="grid items-center gap-14 lg:grid-cols-[.82fr_1.18fr]">

//           <div>

//             <SectionLabel>
//               Built for developers
//             </SectionLabel>

//             <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
//               Stop jumping between scattered concepts.
//             </h2>

//             <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
//               Learning agent development can involve agents, tools,
//               orchestration, memory, RAG, protocols, evaluation and
//               deployment. This handbook puts those topics into one structured
//               developer-focused learning path.
//             </p>

//           </div>

//           <div className="grid gap-5 sm:grid-cols-2">

//             {[
//               [
//                 BookOpen,
//                 "Structured path",
//                 "Move from fundamentals to advanced topics instead of learning isolated concepts.",
//               ],
//               [
//                 Code2,
//                 "Implementation focused",
//                 "Follow concepts with flows, code, commands and practical development context.",
//               ],
//               [
//                 Network,
//                 "Connect the pieces",
//                 "Understand how agents, tools, RAG, MCP, A2A and APIs fit together.",
//               ],
//               [
//                 Rocket,
//                 "Production aware",
//                 "Explore evaluation, observability, security, testing and deployment.",
//               ],
//             ].map(([Icon, title, description]) => (
//               <div
//                 key={title}
//                 className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
//               >

//                 <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//                   <Icon size={23} />
//                 </div>

//                 <h3 className="mt-5 text-xl font-black">
//                   {title}
//                 </h3>

//                 <p className="mt-3 text-sm leading-7 text-slate-600">
//                   {description}
//                 </p>

//               </div>
//             ))}

//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           WHY NOT JUST DOCS?
//       ===================================================== */}

//       <section className="bg-slate-900 py-24 text-white" data-reveal>

//         <div className="mx-auto max-w-6xl px-6 lg:px-8">

//           <div className="grid gap-12 lg:grid-cols-2">

//             <div>

//               <SectionLabel dark>
//                 The real value
//               </SectionLabel>

//               <h2 className="mt-3 text-4xl font-black sm:text-5xl">
//                 “Why not just use the free documentation?”
//               </h2>

//               <p className="mt-6 text-lg leading-8 text-slate-400">
//                 Official documentation is valuable and remains an important
//                 source of truth. This handbook is positioned differently:
//                 it gives you a structured learning sequence focused on the
//                 developer journey from fundamentals through implementation
//                 and production topics.
//               </p>

//             </div>

//             <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">

//               <div className="grid grid-cols-2 border-b border-white/10">

//                 <div className="p-5 text-sm font-black text-slate-400">
//                   Learning challenge
//                 </div>

//                 <div className="p-5 text-sm font-black text-blue-400">
//                   Handbook approach
//                 </div>

//               </div>

//               {[
//                 [
//                   "Where do I start?",
//                   "Fundamentals → setup → first agent",
//                 ],
//                 [
//                   "How do concepts connect?",
//                   "Concept → flow → code",
//                 ],
//                 [
//                   "What comes after agents?",
//                   "Tools → workflows → RAG → protocols",
//                 ],
//                 [
//                   "How do I approach production?",
//                   "Evaluation → observability → security → deployment",
//                 ],
//               ].map(([left, right]) => (
//                 <div
//                   key={left}
//                   className="grid grid-cols-2 border-b border-white/10 last:border-b-0"
//                 >

//                   <div className="p-5 text-sm text-slate-400">
//                     {left}
//                   </div>

//                   <div className="p-5 text-sm font-semibold text-slate-200">
//                     {right}
//                   </div>

//                 </div>
//               ))}

//             </div>

//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           WHAT YOU LEARN
//       ===================================================== */}

//       <section className="bg-white py-24" data-reveal>

//         <div className="mx-auto max-w-7xl px-6 lg:px-8">

//           <div className="grid gap-14 lg:grid-cols-[.78fr_1.22fr]">

//             <div>

//               <SectionLabel>
//                 What you learn
//               </SectionLabel>

//               <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
//                 One handbook for the full agent lifecycle.
//               </h2>

//               <p className="mt-5 leading-8 text-slate-600">
//                 Start with the mental model and setup. Then move into
//                 orchestration, integrations, evaluation, operations and
//                 production.
//               </p>

//               <button
//                 onClick={() => handlePurchase("learning_section")}
//                 className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-black text-white transition hover:bg-blue-700"
//               >
//                 Get Instant Access
//                 <ArrowRight size={18} />
//               </button>

//             </div>

//             <div className="grid gap-3 sm:grid-cols-2">

//               {learningPoints.map((item) => (
//                 <div
//                   key={item}
//                   className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
//                 >

//                   <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
//                     <Check size={13} strokeWidth={3} />
//                   </span>

//                   <p className="text-sm font-semibold leading-6 text-slate-700">
//                     {item}
//                   </p>

//                 </div>
//               ))}

//             </div>

//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           TOPIC MAP
//       ===================================================== */}

//       <section className="bg-slate-50 py-24" data-reveal>

//         <div className="mx-auto max-w-7xl px-6 lg:px-8">

//           <div className="text-center">

//             <SectionLabel>
//               What is inside
//             </SectionLabel>

//             <h2 className="mt-3 text-4xl font-black sm:text-5xl">
//               The topics developers actually need.
//             </h2>

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
//               <div
//                 key={title}
//                 className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
//               >

//                 <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//                   <Icon size={21} />
//                 </div>

//                 <h3 className="mt-5 text-lg font-black">
//                   {title}
//                 </h3>

//                 <p className="mt-2 text-sm leading-6 text-slate-600">
//                   {description}
//                 </p>

//               </div>
//             ))}

//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           PROJECTS
//       ===================================================== */}

//       <section className="bg-white py-24" data-reveal>

//         <div className="mx-auto max-w-7xl px-6 lg:px-8">

//           <div className="max-w-3xl">

//             <SectionLabel>
//               Build with the concepts
//             </SectionLabel>

//             <h2 className="mt-3 text-4xl font-black sm:text-5xl">
//               Learn by thinking in real agent systems.
//             </h2>

//             <p className="mt-5 leading-8 text-slate-600">
//               The handbook includes patterns around research agents, API
//               agents, RAG systems and multi-agent architectures.
//             </p>

//           </div>

//           <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

//             {projects.map(
//               ({ icon: Icon, title, description }, index) => (
//                 <div
//                   key={title}
//                   className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-lg"
//                 >

//                   <div className="flex items-center justify-between">

//                     <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
//                       <Icon size={23} />
//                     </div>

//                     <span className="font-mono text-xs font-bold text-slate-400">
//                       0{index + 1}
//                     </span>

//                   </div>

//                   <h3 className="mt-6 text-xl font-black">
//                     {title}
//                   </h3>

//                   <p className="mt-3 text-sm leading-7 text-slate-600">
//                     {description}
//                   </p>

//                 </div>
//               )
//             )}

//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           INTERVIEW QUICK REVISION
//       ===================================================== */}

//       <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-950 py-24 text-white" data-reveal>
//         <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl" />
//         <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl" />
//         <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
//           <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
//             <div>
//               <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-black text-blue-100">
//                 <Zap size={16} />
//                 Interview quick revision
//               </div>
//               <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
//                 Less time before your interview?
//                 <span className="block text-cyan-300">Use the handbook for fast revision.</span>
//               </h2>
//               <p className="mt-6 max-w-2xl text-lg leading-8 text-blue-100">
//                 If you have less time for an interview, this handbook gives you a structured way to quickly revise the major GenAI and Google ADK topics — from agents and workflows to RAG, MCP, A2A, evaluation, observability, deployment, security and production patterns.
//               </p>
//               <button onClick={() => handlePurchase("interview_revision")} className="mt-8 inline-flex items-center gap-3 rounded-xl bg-white px-6 py-4 font-black text-blue-700 shadow-2xl transition hover:-translate-y-1 hover:bg-slate-100">
//                 Revise Faster <ArrowRight size={18} />
//               </button>
//             </div>
//             <div className="grid gap-3 sm:grid-cols-2">
//               {[
//                 ["01", "Core concepts", "Agent mental model, ADK and setup"],
//                 ["02", "Architecture", "Tools, workflows, RAG, MCP and A2A"],
//                 ["03", "Production", "Evals, tracing, security and deployment"],
//                 ["04", "Reference", "Commands, checklists and architecture patterns"],
//               ].map(([number, title, description]) => (
//                 <div key={number} className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/[0.11]">
//                   <span className="font-mono text-xs font-black text-cyan-300">{number}</span>
//                   <h3 className="mt-4 text-lg font-black">{title}</h3>
//                   <p className="mt-2 text-sm leading-6 text-blue-100/70">{description}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           GENAI ENGINEER FLOW
//       ===================================================== */}

//       <section className="bg-[#07111f] py-24 text-white" data-reveal>
//         <div className="mx-auto max-w-7xl px-6 lg:px-8">
//           <div className="mx-auto max-w-3xl text-center">
//             <SectionLabel dark>GenAI engineer roadmap</SectionLabel>
//             <h2 className="mt-3 text-4xl font-black sm:text-5xl">See how the skills connect.</h2>
//             <p className="mt-5 leading-8 text-slate-400">
//               Follow the connected path from foundations to production. Each point builds on the previous one, so you can see where Google ADK fits into the larger GenAI engineering journey.
//             </p>
//           </div>
//           <GenAIEngineerFlow />
//         </div>
//       </section>

//       {/* =====================================================
//           PDF PREVIEW
//       ===================================================== */}

//       <section className="bg-slate-50 py-24" data-reveal>
//         <div className="mx-auto max-w-7xl px-6 lg:px-8">
//           <div className="grid items-end gap-8 lg:grid-cols-[1fr_.65fr]">
//             <div>
//               <SectionLabel>Inside the PDF</SectionLabel>
//               <h2 className="mt-3 text-4xl font-black sm:text-5xl">See a few real pages before you buy.</h2>
//               <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
//                 These two previews are recreated directly with HTML, JSX and CSS using the same text, headings, code and labels from the PDF. No preview image files are required.
//               </p>
//             </div>
//             <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
//               <p className="text-sm font-black text-blue-700">What the full handbook contains</p>
//               <p className="mt-2 text-sm leading-6 text-slate-600">59 PDF pages • 32 chapters • concepts → architecture → working code → commands → production patterns.</p>
//             </div>
//           </div>
//           <div className="mt-12 grid gap-7 lg:grid-cols-2">
//             <PdfCoverPreview />
//             <PdfInstallationPreview />
//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           INTERACTIVE CODE TABS
//       ===================================================== */

//       <section className="bg-slate-950 py-24 text-white" data-reveal>
//         <div className="mx-auto max-w-7xl px-6 lg:px-8">
//           <div className="mx-auto max-w-3xl text-center">
//             <SectionLabel dark>Interactive code tour</SectionLabel>
//             <h2 className="mt-3 text-4xl font-black sm:text-5xl">Hover or tap to switch the examples.</h2>
//             <p className="mt-5 leading-8 text-slate-400">
//               Explore four representative patterns from the handbook: a core agent, function calling, RAG retrieval and sequential multi-agent orchestration.
//             </p>
//           </div>
//           <div className="mt-12">
//             <CodeTabs />
//           </div>
//         </div>
//       </section>

//       /* =====================================================
//           CODE SAMPLE
//       ===================================================== */}

//       <section className="bg-blue-50 py-24" data-reveal>

//         <div className="mx-auto max-w-7xl px-6 lg:px-8">

//           <div className="grid items-center gap-12 lg:grid-cols-2">

//             <div>

//               <SectionLabel>
//                 Code-first learning
//               </SectionLabel>

//               <h2 className="mt-3 text-4xl font-black sm:text-5xl">
//                 Understand the flow.
//                 <br />
//                 Then write the code.
//               </h2>

//               <p className="mt-6 leading-8 text-slate-600">
//                 The handbook does not stop at definitions. It explains how
//                 agent components connect and gives implementation examples and
//                 commands for important building blocks.
//               </p>

//               <div className="mt-8 grid gap-3 sm:grid-cols-2">

//                 {[
//                   "Installation & authentication",
//                   "Agent implementations",
//                   "Workflow orchestration",
//                   "RAG implementation",
//                   "MCP integration",
//                   "Evaluation & deployment",
//                 ].map((item) => (
//                   <div
//                     key={item}
//                     className="flex items-center gap-2 text-sm font-bold text-slate-700"
//                   >
//                     <Check size={17} className="text-blue-600" />
//                     {item}
//                   </div>
//                 ))}

//               </div>

//             </div>

//             <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">

//               <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">

//                 <span className="h-3 w-3 rounded-full bg-red-400" />
//                 <span className="h-3 w-3 rounded-full bg-yellow-400" />
//                 <span className="h-3 w-3 rounded-full bg-green-400" />

//                 <span className="ml-3 text-xs text-slate-500">
//                   agent.py
//                 </span>

//               </div>

//               <pre className="overflow-x-auto p-6 text-sm leading-7 text-slate-300">
//                 <code>{`from google.adk.agents import LlmAgent

// root_agent = LlmAgent(
//     name="research_agent",
//     model="gemini-2.5-flash",
//     instruction="""
//     Research the user's topic and
//     return a structured answer.
//     """,
// )

// # Then add tools, sessions,
// # orchestration, evaluation,
// # observability and deployment.`}</code>
//               </pre>

//             </div>

//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           32 CHAPTERS
//       ===================================================== */}

//       <section
//         id="contents"
//         className="bg-[#07111f] py-24 text-white"
//         data-reveal
//       >

//         <div className="mx-auto max-w-7xl px-6 lg:px-8">

//           <div className="max-w-3xl">

//             <SectionLabel dark>
//               32-chapter contents
//             </SectionLabel>

//             <h2 className="mt-3 text-4xl font-black sm:text-5xl">
//               From your first agent to production architecture.
//             </h2>

//             <p className="mt-5 leading-8 text-slate-400">
//               Every chapter follows a practical structure:
//               concept → flow → code → commands → how it works → production notes.
//             </p>

//           </div>

//           <div className="mt-14 space-y-12">

//             {chaptersByGroup.map((group) => (
//               <div key={group.label}>

//                 <p className="mb-4 text-xs font-black tracking-[0.2em] text-blue-400">
//                   {group.label}
//                 </p>

//                 <div className="grid gap-3 md:grid-cols-2">

//                   {group.items.map(
//                     ([number, title, description]) => (
//                       <div
//                         key={number}
//                         className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-blue-400/40 hover:bg-white/[0.07]"
//                       >

//                         <div className="flex gap-4">

//                           <span className="font-mono text-sm font-black text-blue-400">
//                             {number}
//                           </span>

//                           <div>

//                             <h3 className="font-bold text-white">
//                               {title}
//                             </h3>

//                             <p className="mt-2 text-sm leading-6 text-slate-400">
//                               {description}
//                             </p>

//                           </div>

//                         </div>

//                       </div>
//                     )
//                   )}

//                 </div>
//               </div>
//             ))}

//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           MID CTA
//       ===================================================== */}

//       <section className="bg-blue-600 py-16">

//         <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-7 px-6 text-center lg:flex-row lg:text-left lg:px-8">

//           <div>

//             <p className="text-sm font-black uppercase tracking-[.18em] text-blue-100">
//               Ready to build?
//             </p>

//             <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
//               Get the complete developer handbook.
//             </h2>

//             <p className="mt-2 text-blue-100">
//               32 chapters • Code • RAG • MCP • A2A • Production
//             </p>

//           </div>

//           <button
//             onClick={() => handlePurchase("mid_page")}
//             className="inline-flex shrink-0 items-center gap-3 rounded-xl bg-white px-7 py-4 font-black text-blue-700 shadow-xl transition hover:bg-slate-100"
//           >
//             Get Instant PDF Access

//             <span className="font-black">
//               ₹{GOOGLE_ADK_PRICE}
//             </span>

//             <ArrowRight size={19} />
//           </button>

//         </div>
//       </section>

//       {/* =====================================================
//           PRICING
//       ===================================================== */}

//       <section
//         id="pricing"
//         className="relative overflow-hidden bg-[#07111f] py-24"
//         data-reveal
//       >

//         <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[120px]" />

//         <div className="relative mx-auto max-w-5xl px-6 lg:px-8">

//           <div className="text-center">

//             <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
//               <Sparkles size={16} />
//               Google ADK • 2nd Edition
//             </div>

//             <h2 className="mt-5 text-4xl font-black text-white sm:text-5xl">
//               A practical reference for your ADK journey.
//             </h2>

//             <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
//               Learn the concepts, follow the implementation patterns and
//               understand the production lifecycle in one developer handbook.
//             </p>

//           </div>

//           <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">

//             <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />

//             <div className="grid lg:grid-cols-[1.2fr_.8fr]">

//               <div className="p-8 sm:p-10 lg:p-12">

//                 <p className="text-sm font-black uppercase tracking-wider text-blue-600">
//                   Google ADK Complete Developer Handbook
//                 </p>

//                 <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
//                   2nd Edition
//                 </h3>

//                 <p className="mt-4 leading-7 text-slate-600">
//                   32 chapters covering agent fundamentals, orchestration,
//                   tools, RAG, MCP, A2A, evaluation, observability, deployment,
//                   security, testing, performance and developer references.
//                 </p>

//                 <div className="mt-8 grid gap-3 sm:grid-cols-2">

//                   {[
//                     "32 structured chapters",
//                     "Code & command examples",
//                     "RAG + MCP + A2A",
//                     "Evaluation & observability",
//                     "Deployment & FastAPI",
//                     "Security & testing",
//                   ].map((item) => (
//                     <div
//                       key={item}
//                       className="flex gap-2 text-sm font-semibold text-slate-600"
//                     >
//                       <Check
//                         size={17}
//                         className="mt-0.5 shrink-0 text-blue-600"
//                       />
//                       {item}
//                     </div>
//                   ))}

//                 </div>

//               </div>

//               <div className="border-t border-slate-200 bg-slate-50 p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-10">

//                 <div className="flex h-full flex-col justify-center">

//                   <p className="text-sm font-bold text-slate-500">
//                     Regular price
//                   </p>

//                   <div className="mt-2 flex items-end gap-3">

//                     <span className="text-2xl font-bold text-slate-400 line-through">
//                       ₹{GOOGLE_ADK_MRP}
//                     </span>

//                     <span className="text-5xl font-black text-slate-950">
//                       ₹{GOOGLE_ADK_PRICE}
//                     </span>

//                   </div>

//                   <p className="mt-3 text-sm leading-6 text-slate-500">
//                     One-time payment.
//                     <br />
//                     No subscription required.
//                   </p>

//                   <button
//                     onClick={() => handlePurchase("pricing")}
//                     className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
//                   >
//                     GET INSTANT PDF ACCESS
//                     <ArrowRight size={18} />
//                   </button>

//                   <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
//                     <ShieldCheck
//                       size={15}
//                       className="text-green-500"
//                     />
//                     Secure payment • Instant access
//                   </div>

//                 </div>
//               </div>

//             </div>
//           </div>

//           {/* POLICY */}

//           <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 text-center">

//             <p className="text-sm font-semibold text-slate-300">
//               Digital Product
//             </p>

//             <p className="mt-1 text-xs leading-5 text-slate-500">
//               Due to the digital nature of this ebook, all purchases are
//               final and non-refundable. Please review the contents and FAQ
//               before purchasing.
//             </p>

//             <p className="mt-2 text-xs text-slate-500">
//               Purchase or ebook support:{" "}
//               <a
//                 href="mailto:supporttargettrek@gmail.com"
//                 className="font-semibold text-slate-400 underline underline-offset-2 hover:text-white"
//               >
//                 supporttargettrek@gmail.com
//               </a>
//             </p>

//           </div>

//         </div>
//       </section>

//       {/* =====================================================
//           FAQ
//       ===================================================== */}

//       <section className="bg-slate-50 py-24" data-reveal>

//         <div className="mx-auto max-w-4xl px-6 lg:px-8">

//           <div className="text-center">

//             <SectionLabel>
//               FAQ
//             </SectionLabel>

//             <h2 className="mt-3 text-4xl font-black sm:text-5xl">
//               Questions before you buy?
//             </h2>

//             <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
//               Here are the important details about the handbook and purchase.
//             </p>

//           </div>

//           <div className="mt-10 space-y-3">

//             {faqs.map((faq) => (
//               <FAQItem
//                 key={faq.question}
//                 question={faq.question}
//                 answer={faq.answer}
//               />
//             ))}

//           </div>
//         </div>
//       </section>

//       <ReviewSection />

//       {/* =====================================================
//           FINAL CTA
//       ===================================================== */}

//       <section className="border-t border-slate-200 bg-white px-6 py-24 text-center" data-reveal>

//         <div className="mx-auto max-w-3xl">

//           <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
//             <Rocket size={27} />
//           </div>

//           <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-5xl">
//             Start building AI agents with Google ADK.
//           </h2>

//           <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-600">
//             Learn the fundamentals, understand the architecture, write the
//             code and explore the production lifecycle in one developer
//             handbook.
//           </p>

//           <div className="mt-7 flex items-center justify-center gap-3">

//             <span className="text-xl font-bold text-slate-400 line-through">
//               ₹{GOOGLE_ADK_MRP}
//             </span>

//             <span className="text-4xl font-black text-blue-600">
//               ₹{GOOGLE_ADK_PRICE}
//             </span>

//           </div>

//           <button
//             onClick={() => handlePurchase("footer")}
//             className="mt-7 inline-flex items-center gap-3 rounded-xl bg-blue-600 px-8 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
//           >
//             GET INSTANT PDF ACCESS
//             <ArrowRight size={19} />
//           </button>

//           <p className="mt-6 text-xs leading-5 text-slate-400">
//             Non-refundable digital product • Support:{" "}
//             <a
//               href="mailto:supporttargettrek@gmail.com"
//               className="font-semibold text-slate-500 hover:text-blue-600"
//             >
//               supporttargettrek@gmail.com
//             </a>
//           </p>

//           <p className="mt-2 text-xs text-slate-400">
//             Google ADK Complete Developer Handbook • 2nd Edition
//           </p>

//         </div>
//       </section>

//       {/* =====================================================
//           MOBILE STICKY CTA
//       ===================================================== */}

//       <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">

//         <div className="mx-auto flex max-w-lg items-center gap-3">

//           <div className="min-w-0 flex-1">

//             <p className="truncate text-xs font-bold text-slate-500">
//               Google ADK Handbook
//             </p>

//             <div className="flex items-center gap-2">

//               <span className="text-xs font-bold text-slate-400 line-through">
//                 ₹{GOOGLE_ADK_MRP}
//               </span>

//               <span className="text-lg font-black text-blue-600">
//                 ₹{GOOGLE_ADK_PRICE}
//               </span>

//             </div>

//           </div>

//           <button
//             onClick={() => handlePurchase("mobile_sticky")}
//             className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg"
//           >
//             Buy Now
//             <ArrowRight size={16} />
//           </button>

//         </div>
//       </div>

//     </main>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Database,
  GitBranch,
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
import ADK_PAYMENT_URL from "../utils/adk_payment_url";

export default function EbookPage() {
  /* =========================================================
     CONFIG
     ========================================================= */
  const GA_MEASUREMENT_ID = "G-5FPEL1W0VB";
  const paymentLink = ADK_PAYMENT_URL;

  const GOOGLE_ADK_MRP = Number(import.meta.env.VITE_GOOGLE_ADK_MRP);
  const GOOGLE_ADK_PRICE = Number(import.meta.env.VITE_GOOGLE_ADK_PRICE);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeCode, setActiveCode] = useState(0);
  const [activeSkill, setActiveSkill] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  /* =========================================================
     DATA
     ========================================================= */
  const codeExamples = useMemo(
    () => [
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
    Be concise. Never invent account data.
    Use tools when account information is required.
    """,
)`,
      },
      {
        id: "tool",
        label: "02 • Tool",
        title: "Function Calling",
        description:
          "Connect the model to deterministic Python functions and real systems.",
        code: `from google.adk.agents import Agent

def get_order_status(order_id: str) -> dict:
    """Return the status of an order by ID."""
    if not order_id.strip():
        return {"ok": False, "error": "order_id is required"}

    return {
        "ok": True,
        "order_id": order_id,
        "status": "SHIPPED",
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
          "Retrieve relevant evidence, then let the agent answer from grounded context.",
        code: `def retrieve(query: str, top_k: int = 5) -> list[dict]:
    """Retrieve relevant document chunks."""
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
        code: `from google.adk.agents import Agent, SequentialAgent

researcher = Agent(
    name="researcher",
    model="gemini-flash-latest",
    instruction="Research the topic and produce concise notes.",
    output_key="research_notes",
)

writer = Agent(
    name="writer",
    model="gemini-flash-latest",
    instruction="Write using the research stored in state.",
)

root_agent = SequentialAgent(
    name="research_then_write",
    sub_agents=[researcher, writer],
)`,
      },
    ],
    []
  );

  const chapters = useMemo(
    () => [
      ["01", "Agentic AI Fundamentals", "Agent loops, tools, context, memory, workflows, and when agents make sense."],
      ["02", "Google ADK: What It Is & Where It Fits", "Understand ADK, the developer workflow, and the Agents CLI."],
      ["03", "Setup, Installation & Authentication", "Install ADK, configure Gemini or Vertex AI, and create your first agent."],
      ["04", "Project Structure & Developer Workflow", "Organize agents, services, tests, evaluation datasets, and deployment files."],
      ["05", "LlmAgent: The Core Agent Type", "Build LLM-powered agents and understand the decision/tool-use loop."],
      ["06", "Sequential, Parallel & Loop Agents", "Master the core workflow agents and practical orchestration patterns."],
      ["07", "Custom Agents & Graph Workflows", "Create advanced control flow when standard workflow agents are not enough."],
      ["08", "Tools & Function Calling", "Connect agents to application logic, APIs, databases, and external capabilities."],
      ["09", "Built-in Tools, Search, Files & Toolsets", "Use built-in capabilities and understand toolset-based architectures."],
      ["10", "Callbacks, Plugins & Guardrails", "Observe, intercept, validate, authorize, retry, and control agent behavior."],
      ["11", "Sessions, State, Context & Memory", "Understand short-term state, sessions, context, and persistent memory."],
      ["12", "RAG: Full Working Pipeline", "Build retrieval-augmented agents with ingestion, embeddings, retrieval, and grounding."],
      ["13", "MCP: Model Context Protocol", "Connect ADK agents to MCP servers using practical integration patterns."],
      ["14", "A2A: Agent-to-Agent Systems", "Design specialist agents as services and connect them through A2A patterns."],
      ["15", "Models, Gemini, LiteLLM & Open Models", "Configure models and understand multi-model routing and integrations."],
      ["16", "Streaming, Live Agents & Multimodal Inputs", "Work with streaming events, live interactions, files, and multimodal inputs."],
      ["17", "Artifacts & File Handling", "Manage generated files and artifacts safely across agent workflows."],
      ["18", "Evaluation: Datasets, Metrics & Eval-Fix Loop", "Create evaluations, measure behavior, and turn failures into regression tests."],
      ["19", "Observability, Tracing & Debugging", "Trace agent runs, inspect tool calls, and debug production behavior."],
      ["20", "Deployment: Agent Runtime, Cloud Run & GKE", "Move agents from local development into production infrastructure."],
      ["21", "Batching, Async Workloads & Performance", "Process workloads efficiently with bounded concurrency and performance controls."],
      ["22", "FastAPI / REST Integration", "Expose agent capabilities through application APIs and backend services."],
      ["23", "End-to-End Production Agent", "Combine research, RAG, orchestration, synthesis, and review into one system."],
      ["24", "Security, Privacy & Reliability", "Handle prompt injection, tool abuse, data leakage, retries, and failure modes."],
      ["25", "Structured Output, Schemas & Validation", "Return predictable structured results and validate model-generated data."],
      ["26", "Caching, Context Control & Cost Engineering", "Control token usage, context growth, latency, and model costs."],
      ["27", "CLI: Commands You Actually Need", "Practical commands for creating, running, evaluating, scaffolding, and deploying agents."],
      ["28", "Testing Strategy for Agentic Systems", "Build unit, integration, failure-injection, and behavior-focused tests."],
      ["29", "Observability + Evaluation + Guardrails Pipeline", "Connect telemetry, quality checks, guardrails, and continuous improvement."],
      ["30", "Troubleshooting Guide", "Diagnose common setup, model, tool, deployment, and runtime problems."],
      ["31", "Production Checklist", "A practical checklist for taking an agent system toward production."],
      ["32", "Developer Cheat Sheets & Reference Architecture", "Quick references, architecture patterns, commands, and reusable mental models."],
    ],
    []
  );

  const learningPoints = [
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

  const projects = [
    [Sparkles, "Research Agent", "Build an agent that researches a topic, gathers information and produces a structured result."],
    [Code2, "API Agent", "Connect an AI agent with external APIs and allow it to perform real-world actions."],
    [Layers3, "RAG Agent", "Create an agent that can answer questions using your own documents and knowledge base."],
    [Users, "Multi-Agent System", "Create specialized agents and orchestrate them into a complete AI workflow."],
  ];

  const flowSkills = [
    ["01", "Python + LLM Foundations", "Models, prompts, context", "Python, LLM APIs, prompts, context windows, structured outputs and basic model interaction patterns."],
    ["02", "Agent Fundamentals", "Instructions, state, sessions", "How an agent combines instructions, model behavior, tools, sessions and state to become a goal-oriented application component."],
    ["03", "Tools + Function Calling", "APIs, files, actions", "Tools give agents capabilities outside the model, including APIs, databases, files and controlled application actions."],
    ["04", "RAG + Memory", "Retrieval, grounding, context", "RAG retrieves relevant information for grounded answers, while memory and state preserve useful context."],
    ["05", "Multi-Agent + Protocols", "Workflows, MCP, A2A", "Compose specialist agents and connect systems through orchestration patterns, MCP and A2A-style communication."],
    ["06", "Eval + Observability", "Tests, traces, guardrails", "Evaluation, traces, logs and guardrails help measure quality, diagnose failures and improve systems."],
    ["07", "Production Engineering", "FastAPI, deployment, security", "Turn prototypes into services with APIs, deployment, security, reliability, performance and monitoring."],
  ];

  const faqs = [
    ["Who is this ebook for?", "It is designed for developers, backend engineers, GenAI learners, and software engineers who want a practical path from ADK fundamentals to production-oriented agent systems."],
    ["What is covered in the 2nd Edition?", "The handbook covers 32 chapters including agents, tools, workflow agents, sessions and memory, RAG, MCP, A2A, LiteLLM, streaming, artifacts, evaluation, observability, deployment, FastAPI, security, testing, performance, and production checklists."],
    ["Does the ebook contain code and commands?", "Yes. It follows a concept → flow → code → commands → production notes approach, with implementation examples throughout the handbook."],
    ["Is prior Google ADK experience required?", "No. The handbook starts with fundamentals and setup before moving into advanced orchestration, integrations, evaluation, and deployment."],
    ["Is this a video course?", "No. It is a developer-focused ebook and reference handbook designed to accompany hands-on implementation."],
    ["Is the ebook refundable?", "No. Due to the digital nature of the ebook, all purchases are non-refundable. Please review the contents and FAQ before purchasing."],
    ["How can I get support?", "For purchase or ebook-related issues, contact supporttargettrek@gmail.com."],
  ];

  const chaptersByGroup = [
    ["FOUNDATIONS", chapters.slice(0, 5)],
    ["ORCHESTRATION & TOOLS", chapters.slice(5, 11)],
    ["INTEGRATIONS", chapters.slice(11, 17)],
    ["PRODUCTION", chapters.slice(17, 25)],
    ["ENGINEERING & REFERENCE", chapters.slice(25)],
  ];

  /* =========================================================
     ANALYTICS + SCROLL
     ========================================================= */
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function gtag() {
        window.dataLayer.push(arguments);
      };

    const existingScript = document.querySelector(
      `script[data-google-analytics="${GA_MEASUREMENT_ID}"]`
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      script.setAttribute("data-google-analytics", GA_MEASUREMENT_ID);
      document.head.appendChild(script);
    }

    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    });

    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const value = total > 0 ? (window.scrollY / total) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, value)));
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    document
      .querySelectorAll("[data-reveal]")
      .forEach((element) => revealObserver.observe(element));

    return () => {
      window.removeEventListener("scroll", updateProgress);
      revealObserver.disconnect();
    };
  }, []);


  /* =========================================================
     ACTIONS
     ========================================================= */
  const handlePurchase = (source = "unknown") => {
    try {
      window.dataLayer = window.dataLayer || [];

      window.dataLayer.push({
        event: "adk_purchase_click",
        product: "google_adk_handbook_2nd_edition",
        source,
        price: GOOGLE_ADK_PRICE,
        currency: "INR",
      });

      if (typeof window.gtag === "function") {
        window.gtag("event", "begin_checkout", {
          currency: "INR",
          value: GOOGLE_ADK_PRICE,
          source,
          items: [
            {
              item_id: "google_adk_handbook_2nd_edition",
              item_name: "Google ADK Complete Developer Handbook - 2nd Edition",
              price: GOOGLE_ADK_PRICE,
              quantity: 1,
            },
          ],
        });
      }
    } catch (error) {
      console.warn("Purchase analytics failed:", error);
    }

    if (!paymentLink) {
      console.error("ADK_PAYMENT_URL is not configured.");
      return;
    }

    window.open(paymentLink, "_blank", "noopener,noreferrer");
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  /* =========================================================
     SHARED UI HELPERS
     ========================================================= */
  const sectionLabel = (text, dark = false) => (
    <p className={`text-sm font-black uppercase tracking-[0.18em] ${dark ? "text-blue-400" : "text-blue-600"}`}>
      {text}
    </p>
  );

  const buttonClass =
    "inline-flex items-center justify-center gap-3 rounded-xl bg-blue-600 px-7 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700";

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <style>{`
        html { scroll-behavior: smooth; }
        [data-reveal] {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity .7s ease, transform .7s ease;
        }
        [data-reveal].is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes codeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatBook {
          0%,100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-10px) rotate(-2deg); }
        }
        .animate-code-in { animation: codeIn .35s ease both; }
        .animate-float-book { animation: floatBook 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          [data-reveal] { opacity: 1; transform: none; transition: none; }
          .animate-code-in,
          .animate-float-book { animation: none; }
        }
      `}</style>

      <div className="fixed left-0 right-0 top-0 z-[70] h-1 bg-slate-200">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-600 transition-[width] duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden bg-white pt-14 lg:pt-20">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -right-40 top-10 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 lg:px-8 lg:pb-28">
          <div className="grid items-center gap-16 lg:grid-cols-[1.08fr_.92fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                <Sparkles size={16} />
                2nd Edition • Developer Handbook
              </div>

              <h1 className="mt-7 text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                Learn Google ADK
                <span className="block text-blue-600">by Building Real AI Agents</span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                A practical, code-first developer handbook that takes you from your first Google ADK agent to tools, RAG, MCP, A2A, multi-agent workflows, evaluation and production deployment.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {["32 Chapters", "Practical Code", "RAG + MCP + A2A", "Production Topics"].map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => handlePurchase("hero")} className={buttonClass}>
                  GET INSTANT PDF ACCESS
                  <span className="flex items-center gap-2">
                    <span className="text-sm text-blue-200 line-through">₹{GOOGLE_ADK_MRP}</span>
                    <span className="text-lg">₹{GOOGLE_ADK_PRICE}</span>
                  </span>
                  <ArrowRight size={19} />
                </button>

                <button
                  type="button"
                  onClick={() => scrollTo("contents")}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-4 font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  See What's Inside
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                <span>✓ One-time payment</span>
                <span>✓ Instant digital access</span>
                <span>✓ No subscription</span>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute -inset-12 rounded-full bg-blue-500/15 blur-3xl" />
                <div className="animate-float-book relative w-[300px] rounded-r-2xl rounded-l-md border border-slate-200 bg-gradient-to-br from-[#173d78] via-[#0d63c9] to-[#37238d] p-8 shadow-2xl sm:w-[360px]">
                  <div className="absolute left-0 top-0 h-full w-3 rounded-l-md bg-black/20" />
                  <div className="flex h-[480px] flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                        <Terminal size={15} />
                        Developer Handbook
                      </div>
                      <div className="mt-7 h-px bg-white/20" />
                      <p className="mt-10 text-xs font-black uppercase tracking-[0.22em] text-blue-100">2nd Edition</p>
                      <h2 className="mt-4 text-4xl font-black leading-[1.02] text-white">
                        Google<br />ADK<br />Complete<br />Developer<br />Handbook
                      </h2>
                      <p className="mt-5 max-w-[240px] text-sm leading-6 text-blue-100">
                        From first agent to RAG, MCP, A2A, evaluation, observability and production deployment.
                      </p>
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {["Agents", "RAG", "MCP", "A2A", "Production"].map((tag) => (
                          <span key={tag} className="rounded-lg bg-white/10 px-3 py-2 text-[10px] font-bold text-white">{tag}</span>
                        ))}
                      </div>
                      <p className="mt-5 text-xs font-bold text-blue-100">Practical • Code-first • Production-aware</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-2xl sm:-right-8">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">Current Price</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-400 line-through">₹{GOOGLE_ADK_MRP}</span>
                    <span className="text-3xl font-black text-blue-600">₹{GOOGLE_ADK_PRICE}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-y border-slate-200 bg-white" data-reveal>
        <div className="mx-auto grid max-w-6xl grid-cols-2 lg:grid-cols-4">
          {[
            ["32 Chapters", "Structured learning path"],
            ["Code-First", "Commands + implementation"],
            ["RAG / MCP / A2A", "Modern agent integrations"],
            ["Production", "Evaluation + deployment"],
          ].map(([title, description]) => (
            <div key={title} className="border-r border-slate-200 px-5 py-7 text-center last:border-r-0">
              <p className="font-black">{title}</p>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VALUE */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8" data-reveal>
        <div className="grid items-center gap-14 lg:grid-cols-[.82fr_1.18fr]">
          <div>
            {sectionLabel("Built for developers")}
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Stop jumping between scattered concepts.</h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Learning agent development can involve agents, tools, orchestration, memory, RAG, protocols, evaluation and deployment. This handbook puts those topics into one structured developer-focused learning path.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {[
              [BookOpen, "Structured path", "Move from fundamentals to advanced topics instead of learning isolated concepts."],
              [Code2, "Implementation focused", "Follow concepts with flows, code, commands and practical development context."],
              [Network, "Connect the pieces", "Understand how agents, tools, RAG, MCP, A2A and APIs fit together."],
              [Rocket, "Production aware", "Explore evaluation, observability, security, testing and deployment."],
            ].map(([Icon, title, description]) => (
              <div key={title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={23} /></div>
                <h3 className="mt-5 text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY HANDBOOK */}
      <section className="bg-white py-24" data-reveal>
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              {sectionLabel("The real value")}
              <h2 className="mt-3 text-4xl font-black sm:text-5xl">Why not just use the free documentation?</h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Official documentation remains an important source of truth. This handbook is positioned differently: it gives you a structured learning sequence focused on the developer journey from fundamentals through implementation and production topics.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
              <div className="grid grid-cols-2 border-b border-slate-200">
                <div className="p-5 text-sm font-black text-slate-500">Learning challenge</div>
                <div className="p-5 text-sm font-black text-blue-600">Handbook approach</div>
              </div>
              {[
                ["Where do I start?", "Fundamentals → setup → first agent"],
                ["How do concepts connect?", "Concept → flow → code"],
                ["What comes after agents?", "Tools → workflows → RAG → protocols"],
                ["How do I approach production?", "Evaluation → observability → security → deployment"],
              ].map(([left, right]) => (
                <div key={left} className="grid grid-cols-2 border-b border-slate-200 last:border-b-0">
                  <div className="p-5 text-sm text-slate-500">{left}</div>
                  <div className="p-5 text-sm font-semibold text-slate-700">{right}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LEARNING */}
      <section className="bg-slate-50 py-24" data-reveal>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[.78fr_1.22fr]">
            <div>
              {sectionLabel("What you learn")}
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">One handbook for the full agent lifecycle.</h2>
              <p className="mt-5 leading-8 text-slate-600">Start with the mental model and setup. Then move into orchestration, integrations, evaluation, operations and production.</p>
              <button onClick={() => handlePurchase("learning_section")} className={`${buttonClass} mt-8`}>
                Get Instant Access <ArrowRight size={18} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {learningPoints.map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600"><Check size={13} strokeWidth={3} /></span>
                  <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TOPICS */}
      <section className="bg-white py-24" data-reveal>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            {sectionLabel("What is inside")}
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">The topics developers actually need.</h2>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Terminal, "Agents", "LlmAgent, custom agents and agent behavior."],
              [Zap, "Orchestration", "Sequential, parallel, loop and graph workflows."],
              [Database, "RAG", "Retrieval, grounding, ingestion and knowledge systems."],
              [Network, "Protocols", "MCP and A2A integration patterns."],
              [Search, "Tools", "Function calling, APIs, files and toolsets."],
              [TestTube, "Evaluation", "Datasets, metrics and eval-fix workflows."],
              [Server, "Deployment", "Runtime, Cloud Run, GKE and REST APIs."],
              [Lock, "Security", "Privacy, reliability, guardrails and failure modes."],
            ].map(([Icon, title, description]) => (
              <div key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:bg-white hover:shadow-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={21} /></div>
                <h3 className="mt-5 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="bg-slate-50 py-24" data-reveal>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {sectionLabel("Build with the concepts")}
          <h2 className="mt-3 max-w-3xl text-4xl font-black sm:text-5xl">Learn by thinking in real agent systems.</h2>
          <p className="mt-5 max-w-3xl leading-8 text-slate-600">The handbook includes patterns around research agents, API agents, RAG systems and multi-agent architectures.</p>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {projects.map(([Icon, title, description], index) => (
              <div key={title} className="group rounded-3xl border border-slate-200 bg-white p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={23} /></div>
                  <span className="font-mono text-xs font-bold text-slate-400">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERVIEW */}
      <section className="bg-blue-50 py-24" data-reveal>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-black text-blue-700">
                <Zap size={16} /> Interview quick revision
              </div>
              <h2 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
                Less time before your interview?
                <span className="block text-blue-700">Use the handbook for fast revision.</span>
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                If you have less time for an interview, this handbook gives you a structured way to quickly revise the major GenAI and Google ADK topics — agents, workflows, RAG, MCP, A2A, evaluation, observability, deployment, security and production patterns.
              </p>
              <button onClick={() => handlePurchase("interview_revision")} className={`${buttonClass} mt-8`}>
                Revise Faster <ArrowRight size={18} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["01", "Core concepts", "Agent mental model, ADK and setup"],
                ["02", "Architecture", "Tools, workflows, RAG, MCP and A2A"],
                ["03", "Production", "Evals, tracing, security and deployment"],
                ["04", "Reference", "Commands, checklists and architecture patterns"],
              ].map(([number, title, description]) => (
                <div key={number} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <span className="font-mono text-xs font-black text-blue-600">{number}</span>
                  <h3 className="mt-4 text-lg font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FLOW */}
      <section className="relative z-20 bg-white py-24" data-reveal>
        <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {sectionLabel("GenAI engineer roadmap")}
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">See how the skills connect.</h2>
            <p className="mt-5 leading-8 text-slate-600">
              Follow the connected path from foundations to production. Hover on desktop or tap on mobile to understand each skill.
            </p>
          </div>

          <div className="relative mt-14">
            <div className="pointer-events-none absolute left-[6%] right-[6%] top-[78px] hidden h-1 rounded-full bg-gradient-to-r from-blue-100 via-blue-400 to-indigo-200 lg:block" />

            <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-7">
              {flowSkills.map(([number, title, short, detail], index) => {
                const isActive = activeSkill === number;

                return (
                  <div
                    key={number}
                    className="relative z-40"
                    onMouseEnter={() => setActiveSkill(number)}
                    onMouseLeave={() => setActiveSkill(null)}
                  >
                    <button
                      type="button"
                      onFocus={() => setActiveSkill(number)}
                      onClick={() => setActiveSkill(isActive ? null : number)}
                      className={`relative flex min-h-[210px] w-full flex-col rounded-[28px] border p-5 text-left transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                        isActive
                          ? "-translate-y-2 border-blue-300 bg-blue-50 shadow-xl shadow-blue-100"
                          : "border-slate-200 bg-white hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xs font-black text-blue-700 ring-1 ring-blue-100">{number}</span>
                        {index < flowSkills.length - 1 && <ArrowRight className="hidden text-blue-300 lg:block" size={18} />}
                      </div>
                      <h3 className="mt-6 text-sm font-black leading-5">{title}</h3>
                      <p className="mt-2 text-xs leading-5 text-slate-500">{short}</p>
                      <div className={`mt-auto pt-5 transition-all ${isActive ? "w-full" : "w-8"} h-1 rounded-full bg-blue-500`} />
                    </button>

                    {isActive && (
                      <div className="pointer-events-auto absolute bottom-full left-1/2 z-[100] mb-3 w-[280px] -translate-x-1/2 rounded-2xl border border-blue-100 bg-white p-5 text-left shadow-2xl">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">{number} • Skill</p>
                        <h4 className="mt-2 text-sm font-black">{title}</h4>
                        <p className="mt-2 text-xs leading-6 text-slate-600">{detail}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CODE TABS */}
      <section className="bg-white py-24" data-reveal>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {sectionLabel("Interactive code tour")}
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">Hover or tap to switch the examples.</h2>
            <p className="mt-5 leading-8 text-slate-600">Explore four representative patterns: a core agent, function calling, RAG retrieval and sequential multi-agent orchestration.</p>
          </div>

          <div className="mt-12 overflow-hidden rounded-[28px] border border-slate-800 bg-[#050b14] shadow-2xl">
            <div className="border-b border-slate-700 bg-white/[0.03] p-2">
              <div className="flex gap-2 overflow-x-auto">
                {codeExamples.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onMouseEnter={() => setActiveCode(index)}
                    onFocus={() => setActiveCode(index)}
                    onClick={() => setActiveCode(index)}
                    className={`group relative min-w-max rounded-xl px-4 py-3 text-left transition-all duration-300 ${activeCode === index ? "bg-white/10 text-white shadow-lg" : "text-slate-500 hover:bg-white/[0.06] hover:text-slate-200"}`}
                  >
                    <span className="block text-[11px] font-black uppercase tracking-[0.12em]">{item.label}</span>
                    <span className="mt-0.5 block text-xs font-semibold">{item.title}</span>
                    <span className={`absolute inset-x-3 bottom-0 h-0.5 origin-left rounded-full bg-blue-400 transition-transform duration-300 ${activeCode === index ? "scale-x-100" : "scale-x-0"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-[.8fr_1.2fr]">
              <div className="border-b border-slate-700 p-7 lg:border-b-0 lg:border-r lg:p-9">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-blue-400"><Code2 size={15} />{codeExamples[activeCode].label}</div>
                <h3 className="mt-4 text-2xl font-black text-white">{codeExamples[activeCode].title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">{codeExamples[activeCode].description}</p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {["Concept", "Flow", "Code", "Production"].map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-700 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-slate-400">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="min-h-[390px] bg-[#02060d]">
                <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="ml-3 text-xs font-semibold text-slate-500">{codeExamples[activeCode].id}.py</span>
                </div>
                <pre className="max-h-[520px] overflow-auto p-6 text-[12px] leading-6 text-slate-300 sm:text-[13px]">
                  <code key={codeExamples[activeCode].id} className="block animate-code-in">{codeExamples[activeCode].code}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CODE-FIRST */}
      <section className="bg-blue-50 py-24" data-reveal>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              {sectionLabel("Code-first learning")}
              <h2 className="mt-3 text-4xl font-black sm:text-5xl">Understand the flow.<br />Then write the code.</h2>
              <p className="mt-6 leading-8 text-slate-600">The handbook does not stop at definitions. It explains how agent components connect and gives implementation examples and commands for important building blocks.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {["Installation & authentication", "Agent implementations", "Workflow orchestration", "RAG implementation", "MCP integration", "Evaluation & deployment"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-bold text-slate-700"><Check size={17} className="text-blue-600" />{item}</div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs text-slate-500">agent.py</span>
              </div>
              <pre className="overflow-x-auto p-6 text-sm leading-7 text-slate-300"><code>{`from google.adk.agents import LlmAgent

root_agent = LlmAgent(
    name="research_agent",
    model="gemini-2.5-flash",
    instruction="""
    Research the user's topic and
    return a structured answer.
    """,
)

# Then add tools, sessions,
# orchestration, evaluation,
# observability and deployment.`}</code></pre>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENTS */}
      <section id="contents" className="bg-white py-24" data-reveal>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {sectionLabel("32-chapter contents")}
          <h2 className="mt-3 max-w-3xl text-4xl font-black sm:text-5xl">From your first agent to production architecture.</h2>
          <p className="mt-5 max-w-3xl leading-8 text-slate-600">Every chapter follows a practical structure: concept → flow → code → commands → how it works → production notes.</p>

          <div className="mt-14 space-y-12">
            {chaptersByGroup.map(([label, items]) => (
              <div key={label}>
                <p className="mb-4 text-xs font-black tracking-[0.2em] text-blue-600">{label}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  {items.map(([number, title, description]) => (
                    <div key={number} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:bg-slate-50">
                      <div className="flex gap-4">
                        <span className="font-mono text-sm font-black text-blue-600">{number}</span>
                        <div>
                          <h3 className="font-bold">{title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MID CTA */}
      <section className="border-y border-slate-200 bg-blue-50 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-7 px-6 text-center lg:flex-row lg:text-left lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[.18em] text-blue-600">Ready to build?</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Get the complete developer handbook.</h2>
            <p className="mt-2 text-slate-600">32 chapters • Code • RAG • MCP • A2A • Production</p>
          </div>
          <button onClick={() => handlePurchase("mid_page")} className="inline-flex shrink-0 items-center gap-3 rounded-xl bg-blue-600 px-7 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">
            Get Instant PDF Access
            <span>₹{GOOGLE_ADK_PRICE}</span>
            <ArrowRight size={19} />
          </button>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-slate-50 py-24" data-reveal>
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"><Sparkles size={16} /> Google ADK • 2nd Edition</div>
            <h2 className="mt-5 text-4xl font-black sm:text-5xl">A practical reference for your ADK journey.</h2>
            <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">Learn the concepts, follow the implementation patterns and understand the production lifecycle in one developer handbook.</p>
          </div>

          <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />
            <div className="grid lg:grid-cols-[1.2fr_.8fr]">
              <div className="p-8 sm:p-10 lg:p-12">
                <p className="text-sm font-black uppercase tracking-wider text-blue-600">Google ADK Complete Developer Handbook</p>
                <h3 className="mt-2 text-3xl font-black">2nd Edition</h3>
                <p className="mt-4 leading-7 text-slate-600">32 chapters covering agent fundamentals, orchestration, tools, RAG, MCP, A2A, evaluation, observability, deployment, security, testing, performance and developer references.</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {["32 structured chapters", "Code & command examples", "RAG + MCP + A2A", "Evaluation & observability", "Deployment & FastAPI", "Security & testing"].map((item) => (
                    <div key={item} className="flex gap-2 text-sm font-semibold text-slate-600"><Check size={17} className="mt-0.5 shrink-0 text-blue-600" />{item}</div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 bg-slate-50 p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-10">
                <div className="flex h-full flex-col justify-center">
                  <p className="text-sm font-bold text-slate-500">Regular price</p>
                  <div className="mt-2 flex items-end gap-3">
                    <span className="text-2xl font-bold text-slate-400 line-through">₹{GOOGLE_ADK_MRP}</span>
                    <span className="text-5xl font-black">₹{GOOGLE_ADK_PRICE}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">One-time payment.<br />No subscription required.</p>
                  <button onClick={() => handlePurchase("pricing")} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-black text-white shadow-lg transition hover:bg-blue-700">
                    GET INSTANT PDF ACCESS <ArrowRight size={18} />
                  </button>
                  <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400"><ShieldCheck size={15} className="text-green-500" />Secure payment • Instant access</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center">
            <p className="text-sm font-semibold text-slate-700">Digital Product</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Due to the digital nature of this ebook, all purchases are final and non-refundable. Please review the contents and FAQ before purchasing.</p>
            <p className="mt-2 text-xs text-slate-500">Purchase or ebook support: <a href="mailto:supporttargettrek@gmail.com" className="font-semibold underline">supporttargettrek@gmail.com</a></p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-24" data-reveal>
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center">
            {sectionLabel("FAQ")}
            <h2 className="mt-3 text-4xl font-black sm:text-5xl">Questions before you buy?</h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">Here are the important details about the handbook and purchase.</p>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map(([question, answer], index) => (
              <div key={question} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold"
                >
                  <span>{question}</span>
                  <ChevronDown size={20} className={`shrink-0 text-slate-400 transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                </button>
                {openFaq === index && <p className="px-5 pb-5 pr-12 text-sm leading-7 text-slate-600">{answer}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-slate-200 bg-white px-6 py-24 text-center" data-reveal>
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Rocket size={27} /></div>
          <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-5xl">Start building AI agents with Google ADK.</h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-600">Learn the fundamentals, understand the architecture, write the code and explore the production lifecycle in one developer handbook.</p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <span className="text-xl font-bold text-slate-400 line-through">₹{GOOGLE_ADK_MRP}</span>
            <span className="text-4xl font-black text-blue-600">₹{GOOGLE_ADK_PRICE}</span>
          </div>
          <button onClick={() => handlePurchase("footer")} className={`${buttonClass} mt-7`}>
            GET INSTANT PDF ACCESS <ArrowRight size={19} />
          </button>
          <p className="mt-6 text-xs leading-5 text-slate-400">Non-refundable digital product • Support: <a href="mailto:supporttargettrek@gmail.com" className="font-semibold text-slate-500">supporttargettrek@gmail.com</a></p>
          <p className="mt-2 text-xs text-slate-400">Google ADK Complete Developer Handbook • 2nd Edition</p>
        </div>
      </section>

      {/* MOBILE CTA */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-500">Google ADK Handbook</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 line-through">₹{GOOGLE_ADK_MRP}</span>
              <span className="text-lg font-black text-blue-600">₹{GOOGLE_ADK_PRICE}</span>
            </div>
          </div>
          <button onClick={() => handlePurchase("mobile_sticky")} className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg">
            Buy Now <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </main>
  );
}
