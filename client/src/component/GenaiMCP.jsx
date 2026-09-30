// // import React, { useEffect, useState } from "react";
// // import PayUCheckoutModal from "../payment/PayUCheckoutModal";
// // import {
// //   ArrowRight, BookOpen, Braces, Check, CheckCircle2, ChevronDown,
// //   Code2, Copy, Database, FileCode2, Globe2,
// //   KeyRound, Layers3, Network, Play, RefreshCw, Server,
// //   ShieldCheck, Sparkles, Terminal, Workflow, Zap,
// // } from "lucide-react";

// // const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";

// // const curriculum = [
// //   {
// //     group: "Part 01 / MCP fundamentals",
// //     chapters: [
// //       { n: "01", title: "Why MCP exists", details: "The integration problem, capability discovery, MCP versus REST, model tool calling, and where LangChain fits." },
// //       { n: "02", title: "Host, client, server, and lifecycle", details: "Responsibilities, architecture diagram, JSON-RPC 2.0, connection creation, initialization, capability negotiation, discovery, messages, sessions, ping, shutdown, timeouts, server restarts, and reconnection." },
// //       { n: "03", title: "Python setup and installation", details: "Python virtual environment, pinned packages, command-line tooling, Node.js and npx for Inspector, and version checks." },
// //     ],
// //   },
// //   {
// //     group: "Part 02 / Build and connect",
// //     chapters: [
// //       { n: "04", title: "FastMCP tools and validation", details: "A neutral Hello MCP server, Python type annotations, tool descriptions, generated input schemas, structured results, and validation errors." },
// //       { n: "05", title: "Resources and prompts", details: "Register a resource URI, publish a reusable prompt, then list, read, and request each capability from a client." },
// //       { n: "06", title: "Local STDIO server and client", details: "Start a server as a child process, communicate over stdin and stdout, inspect stderr, make calls, and understand process cleanup." },
// //       { n: "07", title: "Streamable HTTP server and client", details: "Run the same server independently at /mcp, connect by URL, send tool calls, and compare network and local process behavior." },
// //       { n: "08", title: "MCP Inspector and debugging", details: "Launch Inspector for STDIO or HTTP, inspect schemas, call tools, browse resources and prompts, and diagnose common failures." },
// //     ],
// //   },
// //   {
// //     group: "Part 03 / Agents and practical decisions",
// //     chapters: [
// //       { n: "09", title: "Authentication and authorization", details: "Verify who is calling, restrict access to private records, use bearer credentials, and understand the limits of prompts as security controls." },
// //       { n: "10", title: "LangChain agents with MCP", details: "Use MultiServerMCPClient, turn MCP capabilities into LangChain tools, run an optional agent, and compare agent calls with deterministic direct calls." },
// //       { n: "11", title: "Interview questions and quick reference", details: "Explain transport choices, lifecycle, failures, security, tool discovery, JSON-RPC messages, and retries in plain language." },
// //     ],
// //   },
// //   {
// //     group: "Part 04 / Complete reminder application",
// //     chapters: [
// //       { n: "12", title: "Project design and database", details: "Requirements, complete project tree, registration and login flow, owner-scoped tables, UTC dates, and request walkthrough." },
// //       { n: "13", title: "Full source code, file by file", details: "Complete Python modules for storage, identity, FastAPI auth, business service, FastMCP server, login helper, direct client, LangChain agent, tests, and Docker files." },
// //       { n: "14", title: "Run and verify every component", details: "Install dependencies, register and log in, run local and HTTP transports, open Inspector, run the agent, and execute the tests." },
// //       { n: "15", title: "Docker and cloud deployment", details: "Single-host Compose workflow, container build, HTTP deployment boundary, persistent storage requirements, and a Cloud Run migration path." },
// //       { n: "16", title: "Security, testing, and operations", details: "Isolation checks, credential handling, logs, production safeguards, timeouts, backups, and operational limitations." },
// //     ],
// //   },
// // ];

// // const files = [
// //   ["storage.py", "SQLite connection management, users and reminders tables, and owner-scoped indexes."],
// //   ["identity.py", "Password hashing, token creation, expiry, and token verification."],
// //   ["auth_api.py", "FastAPI registration, login, and local health endpoint."],
// //   ["service.py", "Input validation, UTC conversion, and reminder CRUD restricted to the verified owner."],
// //   ["server.py", "FastMCP tools, a resource, a prompt, auth boundary, and STDIO/HTTP mode."],
// //   ["login_token.py", "Local login helper used to obtain a short-lived token for Inspector."],
// //   ["client.py", "Direct client that logs in, discovers tools, and calls STDIO or HTTP MCP."],
// //   ["agent.py", "Optional LangChain host that loads MCP tools for an LLM agent."],
// //   ["tests/test_reminder.py", "Account isolation, invalid date, and in-memory MCP invocation checks."],
// //   ["Dockerfile + compose.yaml", "Image and local two-service setup with a persistent SQLite volume."],
// // ];

// // const commandSets = [
// //   {
// //     label: "Hello MCP",
// //     title: "Run the small example first",
// //     explanation: "A neutral server introduces tools, resources, prompts, and both transports before the project code.",
// //     code: `python3 -m venv .venv
// // source .venv/bin/activate
// // python -m pip install fastmcp==3.4.7
// // python hello_mcp.py                         # STDIO server waits for a client
// // python local_client.py                      # Starts STDIO server and calls a tool
// // MCP_TRANSPORT=http python hello_mcp.py      # HTTP server, separate terminal
// // python http_client.py                       # Calls http://127.0.0.1:8000/mcp`,
// //   },
// //   {
// //     label: "Inspector",
// //     title: "Inspect tools without a model",
// //     explanation: "Open the address printed in the terminal, connect, list capabilities, and manually call a tool.",
// //     code: `npx @modelcontextprotocol/inspector python hello_mcp.py
// // # Or connect to the running HTTP example:
// // npx @modelcontextprotocol/inspector http://127.0.0.1:8000/mcp
// // # Also inspect local declarations:
// // fastmcp inspect hello_mcp.py
// // fastmcp list hello_mcp.py`,
// //   },
// //   {
// //     label: "Reminder app",
// //     title: "Run every application component",
// //     explanation: "The project chapter walks through registration, login, both transports, the direct client, and tests.",
// //     code: `python -m pip install -r reminder_app/requirements.txt
// // python -m pytest -q tests/test_reminder.py
// // uvicorn reminder_app.auth_api:app --host 127.0.0.1 --port 8081
// // python -m reminder_app.client --transport stdio --username alice
// // MCP_TRANSPORT=http PORT=8000 python -m reminder_app.server
// // python -m reminder_app.client --transport http --username alice`,
// //   },
// // ];

// // const faqs = [
// //   ["Does the book explain MCP architecture deeply?", "Yes. It covers hosts, clients, servers, JSON-RPC 2.0, connection setup, the initialization handshake used by the tested stack, discovery, sessions, ping, shutdown, timeouts, and reconnect behavior."],
// //   ["Will I build both local and HTTP servers?", "Yes. You start with a neutral FastMCP server and call it using both STDIO and Streamable HTTP. The complete reminder app also supports both transports."],
// //   ["Is there full project source code?", "Yes. The reminder app section includes the file tree, explanations for the files, complete listings, run commands, tests, and deployment guidance."],
// //   ["Do I need an LLM API key for the book's exercises?", "Only the optional LangChain agent call needs a model provider key. The server, direct client, Inspector, and project tests work without a paid LLM call."],
// //   ["Is the reminder app ready to scale on a cloud platform as is?", "Its SQLite setup is for local or single-host use. The book explains the durable shared database and identity changes needed before multi-instance cloud deployment."],
// //   ["Is this useful for an interview?", "Yes. The explanations and interview questions cover the protocol's why, what, and how, while the code gives you concrete examples to discuss."],
// // ];

// // const helloCode = `from fastmcp import FastMCP

// // mcp = FastMCP("Hello MCP")

// // @mcp.tool()
// // def greet(name: str) -> str:
// //     """Return a greeting for a nonblank name."""
// //     clean = name.strip()
// //     if not clean:
// //         raise ValueError("name must not be blank")
// //     return f"Hello, {clean}!"

// // if __name__ == "__main__":
// //     mcp.run()`;

// // function SectionIntro({ eyebrow, title, text, center = false }) {
// //   return (
// //     <div className={`mb-10 max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
// //       <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</span>
// //       <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#142A4B] sm:text-4xl lg:text-[42px]">{title}</h2>
// //       {text && <p className="mt-4 text-base leading-7 text-slate-600">{text}</p>}
// //     </div>
// //   );
// // }

// // function CodeWindow({ filename, children }) {
// //   return (
// //     <div className="overflow-hidden rounded-2xl border border-blue-100 bg-[#F8FBFF] shadow-xl shadow-blue-900/5">
// //       <div className="flex items-center justify-between border-b border-blue-100 bg-[#EAF3FF] px-5 py-3 text-xs text-slate-600">
// //         <span className="flex gap-1.5"><i className="h-2 w-2 rounded-full bg-red-400" /><i className="h-2 w-2 rounded-full bg-amber-300" /><i className="h-2 w-2 rounded-full bg-emerald-300" /></span>
// //         <span className="font-semibold">{filename}</span>
// //         <span>PYTHON</span>
// //       </div>
// //       <pre className="overflow-x-auto p-5 text-[12px] leading-7 text-slate-800 sm:p-7"><code>{children}</code></pre>
// //     </div>
// //   );
// // }

// // export default function GenaiMCP() {
// //   const [activeCommand, setActiveCommand] = useState(0);
// //   const [openFaq, setOpenFaq] = useState(0);
// //   const [copied, setCopied] = useState(false);
// //   const [product, setProduct] = useState(null);
// //   const [loadingProduct, setLoadingProduct] = useState(true);
// //   const [productError, setProductError] = useState("");
// //   const [retryCount, setRetryCount] = useState(0);
// //   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

// //   useEffect(() => {
// //     const params = new URLSearchParams(window.location.search);
// //     const referralCode = (params.get("referralCode") || params.get("ref") || "").trim();
// //     if (referralCode) localStorage.setItem("referralCode", referralCode);
// //   }, []);

// //   useEffect(() => {
// //     const controller = new AbortController();

// //     const fetchProduct = async () => {
// //       setLoadingProduct(true);
// //       setProductError("");
// //       setProduct(null);
// //       setIsCheckoutOpen(false);

// //       try {
// //         const redirectUrl = window.location.pathname;
// //         const response = await fetch(
// //           `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(redirectUrl)}`,
// //           { method: "GET", signal: controller.signal }
// //         );
// //         const result = await response.json().catch(() => null);
// //         if (!response.ok || !result?.success || !result?.data) {
// //           throw new Error("Something went wrong. Please try again.");
// //         }

// //         const data = result.data;
// //         const price = Number(data.price);
// //         if (
// //           !data._id ||
// //           typeof data.title !== "string" || !data.title.trim() ||
// //           data.price === null || data.price === undefined ||
// //           !String(data.price).trim() ||
// //           !Number.isFinite(price) || price < 0
// //         ) {
// //           throw new Error("Something went wrong. Please try again.");
// //         }
// //         if (!controller.signal.aborted) setProduct(data);
// //       } catch (error) {
// //         if (error?.name === "AbortError" || controller.signal.aborted) return;
// //         console.error("Failed to fetch MCP product:", error);
// //         setProductError("Something went wrong. Please try again.");
// //       } finally {
// //         if (!controller.signal.aborted) setLoadingProduct(false);
// //       }
// //     };

// //     fetchProduct();
// //     return () => controller.abort();
// //   }, [retryCount]);

// //   const currentPrice = product ? Number(product.price) : null;
// //   const rawMrp = product?.mrp;
// //   const mrp = rawMrp !== null && rawMrp !== undefined && rawMrp !== ""
// //     ? Number(rawMrp)
// //     : null;
// //   const hasMrp = mrp !== null && Number.isFinite(mrp) && mrp > currentPrice;
// //   const discount = hasMrp ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0;
// //   const currency = product?.currency || "INR";
// //   const productTitle = "MASTER GENAI INTERVIEW MCP";
// //   const canBuy = Boolean(product?._id) && !loadingProduct && !productError;

// //   const formatMoney = (amount) => {
// //     try {
// //       return new Intl.NumberFormat("en-IN", {
// //         style: "currency", currency, maximumFractionDigits: 0,
// //       }).format(amount);
// //     } catch {
// //       return `₹${amount}`;
// //     }
// //   };

// //   const handleBuyNow = () => {
// //     if (!canBuy) return;
// //     setIsCheckoutOpen(true);
// //   };

// //   const retryProduct = () => setRetryCount((count) => count + 1);

// //   const copyCommand = async () => {
// //     try {
// //       await navigator.clipboard.writeText(commandSets[activeCommand].code);
// //       setCopied(true);
// //       window.setTimeout(() => setCopied(false), 1700);
// //     } catch {
// //       setCopied(false);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen overflow-x-hidden bg-[#F8FAFE] text-[#23344A] antialiased">
// //       <main>
// //         {/* HERO */}
// //         <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F3F8FF] to-[#EAF3FF] text-[#142A4B]">
// //           <div className="pointer-events-none absolute -right-40 -top-56 h-[550px] w-[550px] rounded-full bg-blue-300/20 blur-3xl" />
// //           <div className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full border border-blue-200/60" />
// //           <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:py-24">
// //             <div>
// //               <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-[11px] font-bold tracking-widest text-blue-700 shadow-sm"><Sparkles size={14} /> TARGET TREK · DEVELOPER SERIES</span>
// //               <h1 className="mt-6 max-w-2xl text-[42px] font-black leading-[1.06] tracking-[-0.055em] sm:text-6xl lg:text-[68px]">{productTitle}</h1>
// //               <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">{product?.shortDescription || product?.subtitle || "Understand Model Context Protocol, build Python servers and clients, connect them with LangChain, and finish with a complete authenticated reminder application."}</p>
// //               <div className="mt-7 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
// //                 {["Architecture & JSON-RPC 2.0", "STDIO + Streamable HTTP", "FastMCP + LangChain", "Full project code & commands"].map((item) => <span className="flex items-center gap-2" key={item}><CheckCircle2 size={17} className="shrink-0 text-teal-600" />{item}</span>)}
// //               </div>
// //               <div className="mt-9 flex flex-wrap items-center gap-3">
// //                 <button type="button" onClick={handleBuyNow} disabled={!canBuy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300">{loadingProduct ? "Loading price..." : canBuy ? `Get the ebook for ${formatMoney(currentPrice)}` : "Price unavailable"} <ArrowRight size={18} /></button>
// //                 <a href="#curriculum" className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-4 text-sm font-bold text-blue-700 transition hover:bg-blue-50">Explore all topics <ArrowRight size={16} /></a>
// //               </div>
// //               <p className="mt-5 text-xs text-slate-500">Python examples · One complete project</p>
// //               {productError && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Something went wrong. Please try again. <button type="button" onClick={retryProduct} className="ml-2 font-bold underline">Retry</button></div>}
// //             </div>
// //             <div className="relative mx-auto w-full max-w-[390px] py-5" aria-label="Illustrated cover of MASTER GENAI INTERVIEW MCP">
// //               <div className="absolute inset-10 rounded-full bg-blue-300/30 blur-[80px]" />
// //               <div className="relative mx-auto flex min-h-[465px] max-w-[325px] -rotate-3 flex-col overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-white to-[#E6F1FF] p-7 text-[#142A4B] shadow-[0_30px_80px_rgba(54,96,153,.18)] ring-8 ring-blue-100/60">
// //                 <span className="text-[10px] font-black tracking-widest">TARGET TREK <span className="text-slate-500">/ DEVELOPER SERIES</span></span>
// //                 <div className="relative mt-10 h-32" aria-hidden="true">
// //                   <div className="absolute left-4 top-7 h-[1px] w-40 rotate-12 bg-sky-300/80" /><div className="absolute left-20 top-10 h-[1px] w-32 -rotate-[35deg] bg-sky-300/80" /><div className="absolute left-20 top-12 h-[1px] w-40 rotate-[30deg] bg-sky-300/80" />
// //                   <div className="absolute left-3 top-5 h-4 w-4 rounded-full bg-sky-300 shadow-[0_0_22px_#7dd3fc]" /><div className="absolute left-20 top-10 h-4 w-4 rounded-full bg-sky-300 shadow-[0_0_22px_#7dd3fc]" /><div className="absolute right-6 top-0 h-4 w-4 rounded-full bg-sky-300 shadow-[0_0_22px_#7dd3fc]" /><div className="absolute bottom-0 right-2 h-4 w-4 rounded-full bg-sky-300 shadow-[0_0_22px_#7dd3fc]" />
// //                 </div>
// //                 <div className="mt-5 text-[28px] font-black leading-[1.12] tracking-tight">MASTER GENAI<br />INTERVIEW MCP</div>
// //                 <p className="mt-3 text-xs leading-5 text-slate-600">Architecture, protocol internals<br />and deployment</p>
// //                 <span className="mt-auto pt-5 text-[9px] text-slate-500">FastMCP · LangChain · Python · HTTP · STDIO</span>
// //               </div>
// //               <div className="absolute -right-3 top-11 hidden items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 shadow-lg sm:flex"><Server size={15} /> MCP SERVER</div>
// //               <div className="absolute -bottom-1 -left-3 hidden items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 shadow-lg sm:flex"><Code2 size={15} /> PYTHON CODE</div>
// //             </div>
// //           </div>
// //         </section>

// //         {/* FACTS */}
// //         <div className="border-b border-blue-100 bg-white"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-5 py-6 text-xs font-bold text-slate-700 sm:px-8 md:grid-cols-4 md:text-sm">{[[BookOpen, "Python code examples"], [Network, "Architecture diagram"], [Terminal, "Runnable commands"], [ShieldCheck, "Auth and security"]].map(([Icon, label]) => <span key={label} className="flex items-center gap-2"><Icon size={18} className="shrink-0 text-blue-600" />{label}</span>)}</div></div>

// //         {/* MCP EXPLAINED */}
// //         <section id="what-is-mcp" className="bg-white px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">
// //           <SectionIntro eyebrow="THE FUNDAMENTAL IDEA" title="What is MCP?" text="Model Context Protocol (MCP) is an open way for AI applications to connect to external capabilities. A host creates an MCP client connection to a server; the server describes what it can do, and the client can request an operation through a common protocol." />
// //           <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
// //             <div className="rounded-2xl border border-blue-100 bg-[#F8FBFF] p-6 sm:p-8">
// //               <h3 className="text-xl font-extrabold text-[#142A4B]">Why was a protocol needed?</h3>
// //               <p className="mt-3 text-sm leading-7 text-slate-600">Imagine an AI assistant that needs a calendar, an issue tracker, a document store, and a database. If every application and every service has a custom integration, the same connection, schema, and error handling work gets repeated. MCP gives compatible clients and servers a shared way to discover and use capabilities.</p>
// //               <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-blue-100 bg-white p-4"><strong className="text-sm text-blue-700">The host decides</strong><p className="mt-1 text-xs leading-6 text-slate-600">Which servers to connect to and which tools a model may see.</p></div><div className="rounded-xl border border-blue-100 bg-white p-4"><strong className="text-sm text-blue-700">The server executes</strong><p className="mt-1 text-xs leading-6 text-slate-600">Validates requests and enforces access before touching data.</p></div></div>
// //             </div>
// //             <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8"><span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">THE 20-SECOND VIEW</span><div className="mt-6 space-y-4">{[["1", "Your app is the host", "It receives the user's request and owns the user experience."], ["2", "It uses an MCP client", "The client opens a local or network connection to one server."], ["3", "The server publishes capabilities", "Tools, resources, and prompts are discovered through protocol calls."], ["4", "The server returns a result", "The host decides how to use the returned data or tool output."]].map(([number, title, detail]) => <div key={number} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">{number}</span><div><div className="text-sm font-extrabold text-[#142A4B]">{title}</div><p className="mt-0.5 text-xs leading-5 text-slate-600">{detail}</p></div></div>)}</div></div>
// //           </div>
// //           <p className="mt-6 rounded-xl border border-sky-100 bg-sky-50 px-5 py-4 text-sm leading-7 text-slate-700"><strong className="text-blue-700">In this ebook:</strong> you first run a neutral Hello MCP service. Only after you know the client and server flow do you build the authenticated reminder project.</p>
// //         </div></section>

// //         {/* MCP CAPABILITIES */}
// //         <section id="capabilities" className="bg-[#F2F7FE] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">
// //           <SectionIntro eyebrow="THE THREE CORE CAPABILITIES" title="Tools, resources, and prompts" text="These are different ways a server shares functionality with a client. The book shows how to publish each one in FastMCP and request it from Python." />
// //           <div className="grid gap-5 md:grid-cols-3">
// //             {[[Zap, "Tools", "Do something", "Callable operations with named inputs and outputs. Use a tool when the client needs an action or a computed answer.", "greet(name) · add(a, b)", "tools/list → tools/call"], [BookOpen, "Resources", "Read something", "Named content available by URI. Use a resource for reference information that a client can list and read.", "hello://guide", "resources/list → resources/read"], [Sparkles, "Prompts", "Start from a template", "Reusable messages or instructions that a client can discover and request with arguments.", "welcome_topic(topic)", "prompts/list → prompts/get"]].map(([Icon, title, badge, detail, example, flow]) => <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm" key={title}><span className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-600"><Icon size={23}/></span><div className="mt-5 text-[11px] font-black uppercase tracking-widest text-teal-700">{badge}</div><h3 className="mt-1 text-xl font-extrabold text-[#142A4B]">{title}</h3><p className="mt-3 min-h-24 text-sm leading-7 text-slate-600">{detail}</p><div className="mt-5 rounded-lg bg-[#F2F7FE] px-3 py-2 font-mono text-xs text-blue-700">{example}</div><p className="mt-3 font-mono text-[11px] text-slate-500">{flow}</p></article>)}
// //           </div>
// //           <div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-blue-100 bg-white p-5"><h3 className="font-bold text-[#142A4B]">Where does LangChain fit?</h3><p className="mt-2 text-sm leading-6 text-slate-600">It can run the host-side agent and adapt discovered MCP tools into tools a model can use. The server still checks the operation.</p></div><div className="rounded-xl border border-blue-100 bg-white p-5"><h3 className="font-bold text-[#142A4B]">Is a model required?</h3><p className="mt-2 text-sm leading-6 text-slate-600">No. A direct MCP client can list capabilities and call tools without a model. The optional LangChain chapter comes later.</p></div></div>
// //         </div></section>

// //         {/* WHY THIS BOOK */}
// //         <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
// //           <SectionIntro eyebrow="WHY READ THIS GUIDE" title="Understand the protocol. Then make it work." text="A practical path from MCP fundamentals to working code, with the design decisions an engineer needs to explain in an interview." center />
// //           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
// //             {[
// //               [Layers3, "Start with the why", "Learn what MCP standardizes and how hosts, clients, servers, tools, resources, and prompts relate."],
// //               [Braces, "See the wire protocol", "Study JSON-RPC 2.0 messages, handshake and versioning, discovery, responses, notifications, and errors."],
// //               [RefreshCw, "Understand failures", "See how STDIO and HTTP connections fail, when clients reconnect, and what must be discovered again."],
// //               [Code2, "Build for real", "Move from a neutral Hello MCP example to a full reminder application with Python code."],
// //             ].map(([Icon, title, text]) => <article key={title} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"><span className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-600"><Icon size={23} /></span><h3 className="mt-5 text-lg font-extrabold text-[#142A4B]">{title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{text}</p></article>)}
// //           </div>
// //         </section>

// //         {/* ARCHITECTURE */}
// //         <section id="architecture" className="bg-[#F2F7FE] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">
// //           <SectionIntro eyebrow="THE BIG PICTURE" title="How an MCP request travels" text="The model can suggest an action. The host decides what to expose, the MCP client handles the protocol, and the server executes authorized work." />
// //           <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
// //             {[
// //               ["01", "User & host", "Receives the user request, handles approvals, chooses connected servers and model tools.", Workflow],
// //               ["02", "MCP client", "Opens STDIO pipes or an HTTP connection, exchanges JSON-RPC and discovers capabilities.", Network],
// //               ["03", "MCP server", "Publishes tools, resources and prompts; validates requests and authorizes sensitive actions.", Server],
// //               ["04", "App / database", "Performs business logic, stores durable data and filters records by verified identity.", Database],
// //             ].map(([n, title, text, Icon], i) => <React.Fragment key={title}><div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-blue-600"><span className="text-xs font-black tracking-widest">{n}</span><Icon size={22} /></div><h3 className="mt-6 text-base font-extrabold text-[#142A4B]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>{i < 3 && <ArrowRight className="mx-auto self-center rotate-90 text-blue-500 lg:rotate-0" size={20} />}</React.Fragment>)}
// //           </div>
// //           <div className="mt-7 grid gap-4 md:grid-cols-3">
// //             {[["Connection", "STDIO starts a child process; HTTP connects to an already running endpoint."], ["Handshake", "The tested protocol revision exchanges initialize and initialized before normal calls."], ["Restart", "A fresh connection repeats setup and tool discovery; write retries require care."]].map(([title, detail]) => <div className="rounded-xl border border-blue-100 bg-white/80 p-5" key={title}><span className="font-extrabold text-blue-700">{title}</span><p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p></div>)}
// //           </div>
// //         </div></section>

// //         {/* PROTOCOL LIFECYCLE */}
// //         <section className="bg-white px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">
// //           <SectionIntro eyebrow="FROM CONNECT TO RESULT" title="What actually happens on the wire?" text="MCP uses JSON-RPC 2.0 messages. The specific startup sequence depends on protocol revision; the code in this book targets the revision verified with its installed libraries." />
// //           <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{[["01", "Create connection", "A host launches a child process for STDIO or contacts an HTTP /mcp endpoint."], ["02", "Initialize", "In the tested revision, the client and server exchange version, identity, and capability information."], ["03", "Discover", "The client asks for tools, resources, or prompts and receives their descriptions and schemas."], ["04", "Call and respond", "A request carries a JSON-RPC id and method. Its response uses the same id; notifications do not require a reply."], ["05", "Close or reconnect", "On exit or failure, the host closes or creates a new connection and refreshes the discovered capabilities."]].map(([n, title, detail]) => <div key={n} className="rounded-xl border border-blue-100 bg-[#F8FBFF] p-5"><span className="text-xs font-black tracking-widest text-blue-600">STEP {n}</span><h3 className="mt-4 font-extrabold text-[#142A4B]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p></div>)}</div>
// //           <div className="mt-6 grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-blue-100 bg-blue-50 p-5"><h3 className="font-extrabold text-blue-700">If a server stops</h3><p className="mt-2 text-sm leading-6 text-slate-600">A STDIO client can observe process exit or EOF. An HTTP client may receive refusal, reset, timeout, or a lost-session response. The host must reconnect according to its own policy.</p></div><div className="rounded-xl border border-blue-100 bg-blue-50 p-5"><h3 className="font-extrabold text-blue-700">If a request was a write</h3><p className="mt-2 text-sm leading-6 text-slate-600">A missing response does not prove the write failed. The project discusses checking stored state and using idempotency instead of blindly repeating creates.</p></div></div>
// //         </div></section>

// //         {/* CONTENTS */}
// //         <section id="curriculum" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
// //           <SectionIntro eyebrow="COMPLETE TABLE OF CONTENTS" title="Every topic, in the order you need it" text="The first three parts use general MCP examples. The final part brings everything together in the reminder app." />
// //           <div className="grid gap-6 lg:grid-cols-2">{curriculum.map((part) => <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm" key={part.group}><div className="border-b border-blue-100 bg-[#EAF3FF] px-6 py-4 text-xs font-black uppercase tracking-widest text-blue-700">{part.group}</div><div className="divide-y divide-slate-100 px-6">{part.chapters.map((ch) => <article key={ch.n} className="flex gap-4 py-5"><span className="mt-0.5 text-xs font-black text-blue-600">{ch.n}</span><div><h3 className="font-extrabold text-[#142A4B]">{ch.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{ch.details}</p></div></article>)}</div></div>)}</div>
// //           <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50/60 px-5 py-4 text-sm leading-6 text-slate-700"><BookOpen size={18} className="mr-2 inline text-blue-600"/>The book closes with official protocol and SDK references and the CampusX MCP YouTube playlist for further study.</div>
// //         </section>

// //         {/* TRANSPORTS */}
// //         <section className="bg-[#F2F7FE] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">
// //           <SectionIntro eyebrow="TWO WAYS TO CONNECT" title="STDIO versus Streamable HTTP" text="Understand when a host launches the server locally and when a client connects to a separate network service." />
// //           <div className="grid gap-5 md:grid-cols-2">
// //             {[
// //               { icon: Terminal, name: "Local STDIO", badge: "HOST-LAUNCHED", points: ["The host starts a Python child process.", "The client writes JSON-RPC to stdin and reads stdout.", "stderr carries server diagnostics.", "A restarted process needs a fresh client connection and discovery."] },
// //               { icon: Globe2, name: "Streamable HTTP", badge: "NETWORK SERVICE", points: ["The server starts independently at an /mcp endpoint.", "The client connects to its URL and sends HTTP requests.", "Protected services need verified credentials.", "A restart may invalidate a legacy logical session; reconnect and rediscover."] },
// //             ].map(({ icon: Icon, name, badge, points }) => <article key={name} className="rounded-2xl border border-blue-100 bg-white p-7 shadow-sm"><div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-3 text-blue-600"><Icon size={24}/></span><div><div className="text-[10px] font-black tracking-widest text-blue-600">{badge}</div><h3 className="text-xl font-black text-[#142A4B]">{name}</h3></div></div><ul className="mt-6 space-y-4">{points.map((point) => <li key={point} className="flex gap-3 text-sm leading-6 text-slate-600"><Check size={16} className="mt-1 shrink-0 text-teal-600"/>{point}</li>)}</ul></article>)}
// //           </div>
// //         </div></section>

// //         {/* CODE */}
// //         <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-24">
// //           <div><SectionIntro eyebrow="LEARN BY RUNNING" title="A simple example before the complete project" text="Create a FastMCP server, publish a typed tool, run it locally, then add HTTP, resources, prompts, Inspector, and LangChain."/><ul className="space-y-4 text-sm text-slate-700">{["Working server and direct client examples", "Commands for each transport and Inspector", "Typed schemas, results and validation", "An optional LangChain agent example"].map((item) => <li className="flex items-start gap-3" key={item}><CheckCircle2 className="mt-0.5 shrink-0 text-teal-600" size={18}/>{item}</li>)}</ul></div>
// //           <CodeWindow filename="hello_mcp.py">{helloCode}</CodeWindow>
// //         </section>

// //         {/* COMMANDS */}
// //         <section id="commands" className="bg-[#F2F7FE] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">
// //           <SectionIntro eyebrow="RUN EACH COMPONENT" title="Commands, not just screenshots" text="The book gives copyable instructions for the neutral service and the complete project. Here is a sample of the workflow." />
// //           <div className="flex flex-wrap gap-2" role="tablist" aria-label="Command examples">{commandSets.map((set, index) => <button key={set.label} type="button" role="tab" aria-selected={activeCommand === index} onClick={() => { setActiveCommand(index); setCopied(false); }} className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${activeCommand === index ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "border border-blue-100 bg-white text-slate-600 hover:bg-blue-50"}`}>{set.label}</button>)}</div>
// //           <div role="tabpanel" className="mt-5 overflow-hidden rounded-2xl border border-blue-100 bg-white text-[#142A4B] shadow-xl shadow-blue-900/5"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 bg-[#EAF3FF] px-5 py-4"><div><h3 className="font-bold">{commandSets[activeCommand].title}</h3><p className="mt-1 text-xs text-slate-600">{commandSets[activeCommand].explanation}</p></div><button type="button" onClick={copyCommand} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50">{copied ? <Check size={15}/> : <Copy size={15}/>} {copied ? "Copied" : "Copy"}</button></div><pre className="overflow-x-auto p-5 text-xs leading-7 text-slate-800 sm:p-7"><code>{commandSets[activeCommand].code}</code></pre></div>
// //           <p className="mt-4 text-xs leading-6 text-slate-600">Project processes such as the auth API and HTTP MCP server run in separate terminals. The ebook explains environment variables and the required order.</p>
// //         </div></section>

// //         {/* PROJECT */}
// //         <section id="project" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
// //           <SectionIntro eyebrow="THE CAPSTONE PROJECT" title="Build a complete MCP reminder application" text="The final chapters bring authentication, data storage, MCP transports, clients, LangChain, tests, and deployment into one coherent project." />
// //           <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
// //             <div className="space-y-5">
// //               {[
// //                 ["1", "Register and log in", "FastAPI registers a user, validates the password, and issues a short-lived signed token.", KeyRound],
// //                 ["2", "Connect to the MCP server", "A local client launches STDIO or a network client connects to an authenticated /mcp endpoint.", Network],
// //                 ["3", "Discover and call tools", "The client finds create, list, complete, and delete operations, then sends validated arguments.", Workflow],
// //                 ["4", "Enforce ownership", "The server derives identity from verified credentials; SQL filters and updates use the owner ID.", ShieldCheck],
// //                 ["5", "Run, test, and deploy", "Inspector exercises, isolation tests, Docker commands, and cloud migration boundaries complete the workflow.", Play],
// //               ].map(([n, title, detail, Icon]) => <div className="flex gap-4 rounded-xl border border-blue-100 bg-white p-5 shadow-sm" key={n}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-600">{n}</span><div><div className="flex items-center gap-2 font-extrabold text-[#142A4B]"><Icon size={17} className="text-blue-600"/>{title}</div><p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p></div></div>)}
// //             </div>
// //             <div className="self-start overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-900/5"><div className="flex items-center gap-2 border-b border-blue-100 bg-[#EAF3FF] px-5 py-4 font-extrabold text-[#142A4B]"><FileCode2 size={18} className="text-blue-600"/> Files explained in the book</div><div className="divide-y divide-slate-100 px-5">{files.map(([name, purpose]) => <div className="py-3" key={name}><div className="font-mono text-[13px] font-bold text-blue-700">{name}</div><p className="mt-0.5 text-xs leading-5 text-slate-600">{purpose}</p></div>)}</div><div className="bg-[#F2F7FE] px-5 py-4 text-xs font-bold text-blue-700">Full source listings and step-by-step run commands included.</div></div>
// //           </div>
// //         </section>

// //         {/* AUDIENCE */}
// //         <section className="bg-[#F2F7FE] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><SectionIntro eyebrow="WHO SHOULD READ THIS" title="Made for developers who want to explain and build MCP" center/><div className="grid gap-5 md:grid-cols-3">{[[Server, "Backend engineers", "Learn process and HTTP transports, identity boundaries, validation, failure handling, and deployment choices."], [Zap, "GenAI builders", "Connect a real MCP server to LangChain and understand the tool path from user request to result."], [BookOpen, "Interview candidates", "Use architecture, wire examples, project trade-offs, and interview answers to explain the system clearly."]].map(([Icon, title, detail]) => <div className="rounded-2xl border border-blue-100 bg-white p-7" key={title}><Icon className="text-blue-600" size={26}/><h3 className="mt-4 text-lg font-extrabold text-[#142A4B]">{title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{detail}</p></div>)}</div></div></section>

// //         {/* PRICING */}
// //         <section id="pricing" className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_0.85fr] lg:py-24">
// //           <div><SectionIntro eyebrow="GET THE EBOOK" title="One guide. From protocol to working project." text="Learn from the neutral examples, follow the detailed application flow, and keep the full code and command reference at hand."/><div className="grid gap-3 sm:grid-cols-2">{["Architecture diagram and lifecycle", "JSON-RPC 2.0 and handshake", "STDIO and HTTP server/client", "MCP Inspector walkthrough", "LangChain integration", "Full reminder app code", "Auth, testing, and deployment", "Official sources and further reading"].map((item) => <div key={item} className="flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-teal-600"/>{item}</div>)}</div></div>
// //           <div className="rounded-3xl border border-blue-100 bg-white p-7 shadow-[0_24px_70px_rgba(20,42,75,.11)] sm:p-9">
// //             <span className="text-xs font-black uppercase tracking-widest text-blue-700">{productTitle}</span>
// //             <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
// //               <strong className="text-5xl font-black tracking-tighter text-[#142A4B] sm:text-6xl">{loadingProduct ? "Loading price..." : canBuy ? formatMoney(currentPrice) : "Price unavailable"}</strong>
// //               {canBuy && hasMrp && <del className="text-2xl font-semibold text-slate-400">{formatMoney(mrp)}</del>}
// //               {canBuy && discount > 0 && <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">{discount}% OFF</span>}
// //             </div>
// //             {product?.subtitle && <p className="mt-3 text-sm text-slate-600">{product.subtitle}</p>}
// //             {product?.shortDescription && <p className="mt-3 text-sm leading-6 text-slate-600">{product.shortDescription}</p>}
// //             {product?.description && <p className="mt-3 text-sm leading-6 text-slate-600">{product.description}</p>}
// //             <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
// //               {[product?.edition, product?.language, product?.format, product?.level, product?.resource_type, ...(Array.isArray(product?.categories) ? product.categories : [])].filter(Boolean).map((value, index) => <span key={`${value}-${index}`} className="rounded-full bg-blue-50 px-3 py-1">{value}</span>)}
// //             </div>
// //             <div className="my-6 border-t border-slate-100" />
// //             <button type="button" onClick={handleBuyNow} disabled={!canBuy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Get the ebook <ArrowRight size={18}/></button>
// //             {productError && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Something went wrong. Please try again. <button type="button" onClick={retryProduct} className="font-bold underline">Retry</button></div>}
// //             <div className="mt-5 space-y-1 text-center text-[11px] leading-5 text-slate-500"><p>This digital book is not refundable.</p><p>For support, contact <a href="mailto:supporttargettrek@gmail.com" className="underline decoration-slate-300 underline-offset-2 hover:text-blue-700">supporttargettrek@gmail.com</a></p></div>
// //           </div>
// //         </section>

// //         {/* FAQ */}
// //         <section className="bg-[#F2F7FE] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-3xl"><SectionIntro eyebrow="QUESTIONS" title="Frequently asked questions" center/><div className="divide-y divide-blue-100 border-y border-blue-100">{faqs.map(([question, answer], index) => <div key={question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index} aria-controls={`mcp-faq-${index}`} className="flex w-full items-center justify-between gap-6 py-5 text-left font-bold text-[#142A4B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"><span>{question}</span><ChevronDown className={`shrink-0 transition-transform ${openFaq === index ? "rotate-180" : ""}`} size={19}/></button><div id={`mcp-faq-${index}`} hidden={openFaq !== index} className="pb-5 pr-9 text-sm leading-7 text-slate-600">{answer}</div></div>)}</div></div></section>

// //         <section className="bg-[#EAF3FF] px-5 py-14 text-[#142A4B] sm:px-8"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 md:flex-row md:items-center"><div><span className="text-xs font-black uppercase tracking-widest text-blue-600">READY TO BUILD?</span><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Learn MCP from the wire to the app.</h2><p className="mt-2 text-sm text-slate-600">Architecture, examples, full project, and commands in one ebook.</p></div><button type="button" onClick={handleBuyNow} disabled={!canBuy} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-extrabold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{canBuy ? `Get the ebook — ${formatMoney(currentPrice)}` : loadingProduct ? "Loading price..." : "Price unavailable"} <ArrowRight size={18}/></button></div><p className="mx-auto mt-6 max-w-7xl text-[11px] leading-5 text-slate-500">This digital book is not refundable. For support: <a className="underline hover:text-blue-700" href="mailto:supporttargettrek@gmail.com">supporttargettrek@gmail.com</a></p></section>
// //       </main>
// //       <PayUCheckoutModal isOpen={isCheckoutOpen && canBuy} onClose={() => setIsCheckoutOpen(false)} product={product} />
// //       {/* Mobile buy bar */}
// //       <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-blue-100 bg-white px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-9px_32px_rgba(20,42,75,.14)] md:hidden">
// //         <div className="leading-tight">
// //           {canBuy && hasMrp && <div className="text-[10px] text-slate-500"><del>{formatMoney(mrp)}</del>{discount > 0 && <span className="ml-2 font-extrabold text-green-700">{discount}% OFF</span>}</div>}
// //           <strong className="text-lg font-black text-[#142A4B]">{loadingProduct ? "Loading..." : canBuy ? formatMoney(currentPrice) : "Price unavailable"}</strong>
// //         </div>
// //         <button type="button" onClick={handleBuyNow} disabled={!canBuy} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-3 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">Get ebook <ArrowRight size={16}/></button>
// //       </div>
// //       <div className="h-16 bg-[#EAF3FF] md:hidden" aria-hidden="true" />
// //     </div>
// //   );
// // }

// import React, { useEffect, useState } from "react";
// import { Helmet } from "react-helmet";

// import PayUCheckoutModal from "../payment/PayUCheckoutModal";

// import {

//   ArrowRight, BookOpen, Braces, Check, CheckCircle2, ChevronDown,

//   Code2, Copy, Database, FileCode2, Globe2,

//   KeyRound, Layers3, Network, Play, RefreshCw, Server,

//   ShieldCheck, Sparkles, Terminal, Workflow, Zap,

// } from "lucide-react";

// const SITE_URL = "https://www.targettrek.in";
// const SITE_NAME = "Target Trek";
// const SEO_TITLE = "Master GenAI Interview MCP | Model Context Protocol Ebook";
// const SEO_DESCRIPTION =
//   "Master Model Context Protocol for GenAI interviews with FastMCP, Python, LangChain, STDIO, Streamable HTTP, JSON-RPC, security, deployment, and a complete project.";
// const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";

// const curriculum = [

//   {

//     group: "Part 01 / MCP fundamentals",

//     chapters: [

//       { n: "01", title: "Why MCP exists", details: "The integration problem, capability discovery, MCP versus REST, model tool calling, and where LangChain fits." },

//       { n: "02", title: "Host, client, server, and lifecycle", details: "Responsibilities, architecture diagram, JSON-RPC 2.0, connection creation, initialization, capability negotiation, discovery, messages, sessions, ping, shutdown, timeouts, server restarts, and reconnection." },

//       { n: "03", title: "Python setup and installation", details: "Python virtual environment, pinned packages, command-line tooling, Node.js and npx for Inspector, and version checks." },

//     ],

//   },

//   {

//     group: "Part 02 / Build and connect",

//     chapters: [

//       { n: "04", title: "FastMCP tools and validation", details: "A neutral Hello MCP server, Python type annotations, tool descriptions, generated input schemas, structured results, and validation errors." },

//       { n: "05", title: "Resources and prompts", details: "Register a resource URI, publish a reusable prompt, then list, read, and request each capability from a client." },

//       { n: "06", title: "Local STDIO server and client", details: "Start a server as a child process, communicate over stdin and stdout, inspect stderr, make calls, and understand process cleanup." },

//       { n: "07", title: "Streamable HTTP server and client", details: "Run the same server independently at /mcp, connect by URL, send tool calls, and compare network and local process behavior." },

//       { n: "08", title: "MCP Inspector and debugging", details: "Launch Inspector for STDIO or HTTP, inspect schemas, call tools, browse resources and prompts, and diagnose common failures." },

//     ],

//   },

//   {

//     group: "Part 03 / Agents and practical decisions",

//     chapters: [

//       { n: "09", title: "Authentication and authorization", details: "Verify who is calling, restrict access to private records, use bearer credentials, and understand the limits of prompts as security controls." },

//       { n: "10", title: "LangChain agents with MCP", details: "Use MultiServerMCPClient, turn MCP capabilities into LangChain tools, run an optional agent, and compare agent calls with deterministic direct calls." },

//       { n: "11", title: "Interview questions and quick reference", details: "Explain transport choices, lifecycle, failures, security, tool discovery, JSON-RPC messages, and retries in plain language." },

//     ],

//   },

//   {

//     group: "Part 04 / Complete reminder application",

//     chapters: [

//       { n: "12", title: "Project design and database", details: "Requirements, complete project tree, registration and login flow, owner-scoped tables, UTC dates, and request walkthrough." },

//       { n: "13", title: "Full source code, file by file", details: "Complete Python modules for storage, identity, FastAPI auth, business service, FastMCP server, login helper, direct client, LangChain agent, tests, and Docker files." },

//       { n: "14", title: "Run and verify every component", details: "Install dependencies, register and log in, run local and HTTP transports, open Inspector, run the agent, and execute the tests." },

//       { n: "15", title: "Docker and cloud deployment", details: "Single-host Compose workflow, container build, HTTP deployment boundary, persistent storage requirements, and a Cloud Run migration path." },

//       { n: "16", title: "Security, testing, and operations", details: "Isolation checks, credential handling, logs, production safeguards, timeouts, backups, and operational limitations." },

//     ],

//   },

// ];

// const files = [

//   ["storage.py", "SQLite connection management, users and reminders tables, and owner-scoped indexes."],

//   ["identity.py", "Password hashing, token creation, expiry, and token verification."],

//   ["auth_api.py", "FastAPI registration, login, and local health endpoint."],

//   ["service.py", "Input validation, UTC conversion, and reminder CRUD restricted to the verified owner."],

//   ["server.py", "FastMCP tools, a resource, a prompt, auth boundary, and STDIO/HTTP mode."],

//   ["login_token.py", "Local login helper used to obtain a short-lived token for Inspector."],

//   ["client.py", "Direct client that logs in, discovers tools, and calls STDIO or HTTP MCP."],

//   ["agent.py", "Optional LangChain host that loads MCP tools for an LLM agent."],

//   ["tests/test_reminder.py", "Account isolation, invalid date, and in-memory MCP invocation checks."],

//   ["Dockerfile + compose.yaml", "Image and local two-service setup with a persistent SQLite volume."],

// ];

// const commandSets = [

//   {

//     label: "Hello MCP",

//     title: "Run the small example first",

//     explanation: "A neutral server introduces tools, resources, prompts, and both transports before the project code.",

//     code: `python3 -m venv .venv

// source .venv/bin/activate

// python -m pip install fastmcp==3.4.7

// python hello_mcp.py

// python local_client.py

// MCP_TRANSPORT=http python hello_mcp.py

// python http_client.py`,

//   },

//   {

//     label: "Inspector",

//     title: "Inspect tools without a model",

//     explanation: "Open the address printed in the terminal, connect, list capabilities, and manually call a tool.",

//     code: `npx @modelcontextprotocol/inspector python hello_mcp.py

// npx @modelcontextprotocol/inspector http://127.0.0.1:8000/mcp

// fastmcp inspect hello_mcp.py

// fastmcp list hello_mcp.py`,

//   },

//   {

//     label: "Reminder app",

//     title: "Run every application component",

//     explanation: "The project chapter walks through registration, login, both transports, the direct client, and tests.",

//     code: `python -m pip install -r reminder_app/requirements.txt

// python -m pytest -q tests/test_reminder.py

// uvicorn reminder_app.auth_api:app --host 127.0.0.1 --port 8081

// python -m reminder_app.client --transport stdio --username alice

// MCP_TRANSPORT=http PORT=8000 python -m reminder_app.server

// python -m reminder_app.client --transport http --username alice`,

//   },

// ];

// const faqs = [

//   ["Does the book explain MCP architecture deeply?", "Yes. It covers hosts, clients, servers, JSON-RPC 2.0, connection setup, the initialization handshake used by the tested stack, discovery, sessions, ping, shutdown, timeouts, and reconnect behavior."],

//   ["Will I build both local and HTTP servers?", "Yes. You start with a neutral FastMCP server and call it using both STDIO and Streamable HTTP. The complete reminder app also supports both transports."],

//   ["Is there full project source code?", "Yes. The reminder app section includes the file tree, explanations for the files, complete listings, run commands, tests, and deployment guidance."],

//   ["Do I need an LLM API key for the book's exercises?", "Only the optional LangChain agent call needs a model provider key. The server, direct client, Inspector, and project tests work without a paid LLM call."],

//   ["Is the reminder app ready to scale on a cloud platform as is?", "Its SQLite setup is for local or single-host use. The book explains the durable shared database and identity changes needed before multi-instance cloud deployment."],

//   ["Is this useful for an interview?", "Yes. The explanations and interview questions cover the protocol's why, what, and how, while the code gives you concrete examples to discuss."],

// ];

// const helloCode = `from fastmcp import FastMCP

// mcp = FastMCP("Hello MCP")

// @mcp.tool()

// def greet(name: str) -> str:

//     clean = name.strip()

//     if not clean:

//         raise ValueError("name must not be blank")

//     return f"Hello, {clean}!"

// if __name__ == "__main__":

//     mcp.run()`;

// function SectionIntro({ eyebrow, title, text, center = false }) {

//   return (

//     <div className={`mb-10 max-w-3xl ${center ? "mx-auto text-center" : ""}`}>

//       <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</span>

//       <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#142A4B] sm:text-4xl lg:text-[42px]">{title}</h2>

//       {text && <p className="mt-4 text-base leading-7 text-slate-600">{text}</p>}

//     </div>

//   );

// }

// function CodeWindow({ filename, children }) {

//   return (

//     <div className="overflow-hidden rounded-2xl border border-blue-100 bg-[#F8FBFF] shadow-xl shadow-blue-900/5">

//       <div className="flex items-center justify-between border-b border-blue-100 bg-[#EAF3FF] px-5 py-3 text-xs text-slate-600">

//         <span className="flex gap-1.5"><i className="h-2 w-2 rounded-full bg-red-400" /><i className="h-2 w-2 rounded-full bg-amber-300" /><i className="h-2 w-2 rounded-full bg-emerald-300" /></span>

//         <span className="font-semibold">{filename}</span>

//         <span>PYTHON</span>

//       </div>

//       <pre className="overflow-x-auto p-5 text-[12px] leading-7 text-slate-800 sm:p-7"><code>{children}</code></pre>

//     </div>

//   );

// }

// export default function GenaiMCP() {

//   const [activeCommand, setActiveCommand] = useState(0);

//   const [openFaq, setOpenFaq] = useState(0);

//   const [copied, setCopied] = useState(false);

//   const [product, setProduct] = useState(null);

//   const [loadingProduct, setLoadingProduct] = useState(true);

//   const [productError, setProductError] = useState("");

//   const [retryCount, setRetryCount] = useState(0);

//   const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

//   useEffect(() => {

//     const params = new URLSearchParams(window.location.search);

//     const referralCode = (params.get("referralCode") || params.get("ref") || "").trim();

//     if (referralCode) localStorage.setItem("referralCode", referralCode);

//   }, []);

//   useEffect(() => {

//     const controller = new AbortController();

//     const fetchProduct = async () => {

//       setLoadingProduct(true);

//       setProductError("");

//       setProduct(null);

//       setIsCheckoutOpen(false);

//       try {

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
//               "Unable to load the current product details. Please try again."
//           );
//         }

//         const data = result.data;

//         const price = Number(data.price);

//         if (

//           !data._id ||

//           typeof data.title !== "string" || !data.title.trim() ||

//           data.price === null || data.price === undefined ||

//           !String(data.price).trim() ||

//           !Number.isFinite(price) || price < 0

//         ) {

//           throw new Error("The product data returned by the server is incomplete. Please try again.");

//         }

//         if (!controller.signal.aborted) setProduct(data);

//       } catch (error) {

//         if (error?.name === "AbortError" || controller.signal.aborted) return;

//         console.error("Failed to fetch MCP product:", error);
//         setProduct(null);
//         setProductError(
//           error?.message || "Unable to load the current product details. Please try again."
//         );

//       } finally {

//         if (!controller.signal.aborted) setLoadingProduct(false);

//       }

//     };

//     fetchProduct();

//     return () => controller.abort();

//   }, [retryCount]);

//   const currentPrice = product ? Number(product.price) : null;

//   const rawMrp = product?.mrp;

//   const mrp = rawMrp !== null && rawMrp !== undefined && rawMrp !== ""

//     ? Number(rawMrp)

//     : null;

//   const hasMrp = mrp !== null && Number.isFinite(mrp) && mrp > currentPrice;

//   const discount = hasMrp ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0;

//   const currency = product?.currency || "INR";

//   const productTitle = "MASTER GENAI INTERVIEW MCP";

//   const canBuy = Boolean(product?._id) && !loadingProduct && !productError;

//   const formatMoney = (amount) => {
//     const value = Number(amount ?? 0);
//     const localeByCurrency = {
//       INR: "en-IN",
//       USD: "en-US",
//       GBP: "en-GB",
//       EUR: "en-IE",
//       AUD: "en-AU",
//       CAD: "en-CA",
//     };

//     try {
//       return new Intl.NumberFormat(localeByCurrency[currency] || "en", {
//         style: "currency",
//         currency,
//         minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
//         maximumFractionDigits: 2,
//       }).format(value);
//     } catch {
//       return `${currency} ${value}`;
//     }
//   };

//   const handleBuyNow = () => {

//     if (!canBuy) return;

//     setIsCheckoutOpen(true);

//   };

//   const retryProduct = () => setRetryCount((count) => count + 1);

//   const copyCommand = async () => {

//     try {

//       await navigator.clipboard.writeText(commandSets[activeCommand].code);

//       setCopied(true);

//       window.setTimeout(() => setCopied(false), 1700);

//     } catch {

//       setCopied(false);

//     }

//   };

//   const canonicalUrl = `${SITE_URL}${window.location.pathname}`;
//   const seoImage =
//     product?.coverpageurl ||
//     product?.coverPageUrl ||
//     product?.cover_page_url ||
//     "";
//   const schemaProductName = product?.title?.trim() || "Master GenAI Interview MCP";

//   const productSchema = {
//     "@type": "Product",
//     "@id": `${canonicalUrl}#product`,
//     name: schemaProductName,
//     description: SEO_DESCRIPTION,
//     category: "Model Context Protocol GenAI Interview Ebook",
//     brand: {
//       "@type": "Brand",
//       name: SITE_NAME,
//     },
//     ...(seoImage ? { image: [seoImage] } : {}),
//     ...(canBuy
//       ? {
//           offers: {
//             "@type": "Offer",
//             url: canonicalUrl,
//             price: currentPrice,
//             priceCurrency: currency,
//             availability: "https://schema.org/InStock",
//             itemCondition: "https://schema.org/NewCondition",
//             seller: {
//               "@type": "Organization",
//               name: SITE_NAME,
//             },
//             ...(hasMrp
//               ? {
//                   priceSpecification: {
//                     "@type": "UnitPriceSpecification",
//                     price: mrp,
//                     priceCurrency: currency,
//                     priceType: "https://schema.org/StrikethroughPrice",
//                   },
//                 }
//               : {}),
//           },
//         }
//       : {}),
//   };

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
//         publisher: { "@id": `${SITE_URL}/#organization` },
//       },
//       {
//         "@type": "WebPage",
//         "@id": `${canonicalUrl}#webpage`,
//         url: canonicalUrl,
//         name: SEO_TITLE,
//         description: SEO_DESCRIPTION,
//         isPartOf: { "@id": `${SITE_URL}/#website` },
//         about: { "@id": `${canonicalUrl}#product` },
//       },
//       {
//         "@type": "BreadcrumbList",
//         "@id": `${canonicalUrl}#breadcrumb`,
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
//             name: "Master GenAI Interview MCP",
//             item: canonicalUrl,
//           },
//         ],
//       },
//       {
//         "@type": "Book",
//         "@id": `${canonicalUrl}#book`,
//         name: schemaProductName,
//         description: SEO_DESCRIPTION,
//         bookFormat: "https://schema.org/EBook",
//         inLanguage: product?.language || "English",
//         publisher: { "@id": `${SITE_URL}/#organization` },
//         ...(seoImage ? { image: seoImage } : {}),
//       },
//       productSchema,
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

//   return (

//     <div className="min-h-screen overflow-x-hidden bg-[#F8FAFE] text-[#23344A] antialiased">
//       <Helmet>
//         <title>{SEO_TITLE}</title>
//         <meta name="description" content={SEO_DESCRIPTION} />
//         <meta name="author" content={SITE_NAME} />
//         <meta name="application-name" content={SITE_NAME} />
//         <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
//         <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
//         <meta name="theme-color" content="#EAF3FF" />
//         <link rel="canonical" href={canonicalUrl} />
//         <meta property="og:type" content="website" />
//         <meta property="og:site_name" content={SITE_NAME} />
//         <meta property="og:locale" content="en_US" />
//         <meta property="og:title" content={SEO_TITLE} />
//         <meta property="og:description" content={SEO_DESCRIPTION} />
//         <meta property="og:url" content={canonicalUrl} />
//         {seoImage && <meta property="og:image" content={seoImage} />}
//         {seoImage && <meta property="og:image:alt" content={`${schemaProductName} ebook cover`} />}
//         {canBuy && <meta property="product:price:amount" content={String(currentPrice)} />}
//         {canBuy && <meta property="product:price:currency" content={currency} />}
//         <meta name="twitter:card" content="summary_large_image" />
//         <meta name="twitter:title" content={SEO_TITLE} />
//         <meta name="twitter:description" content={SEO_DESCRIPTION} />
//         {seoImage && <meta name="twitter:image" content={seoImage} />}
//         <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
//       </Helmet>

//       <main>

        

//         <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F3F8FF] to-[#EAF3FF] text-[#142A4B]">

//           <div className="pointer-events-none absolute -right-40 -top-56 h-[550px] w-[550px] rounded-full bg-blue-300/20 blur-3xl" />

//           <div className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full border border-blue-200/60" />

//           <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:py-24">

//             <div>

//               <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-[11px] font-bold tracking-widest text-blue-700 shadow-sm"><Sparkles size={14} /> TARGET TREK · DEVELOPER SERIES</span>

//               <h1 className="mt-6 max-w-2xl text-[42px] font-black leading-[1.06] tracking-[-0.055em] sm:text-6xl lg:text-[68px]">{productTitle}</h1>

//               <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">{product?.shortDescription || product?.subtitle || "Understand Model Context Protocol, build Python servers and clients, connect them with LangChain, and finish with a complete authenticated reminder application."}</p>

//               <div className="mt-7 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">

//                 {["Architecture & JSON-RPC 2.0", "STDIO + Streamable HTTP", "FastMCP + LangChain", "Full project code & commands"].map((item) => <span className="flex items-center gap-2" key={item}><CheckCircle2 size={17} className="shrink-0 text-teal-600" />{item}</span>)}

//               </div>

//               <div className="mt-9 flex flex-wrap items-center gap-3">

//                 <button type="button" onClick={handleBuyNow} disabled={!canBuy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300">{loadingProduct ? "Loading price..." : canBuy ? `Get the ebook for ${formatMoney(currentPrice)}` : "Price unavailable"} <ArrowRight size={18} /></button>

//                 <a href="#curriculum" className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-4 text-sm font-bold text-blue-700 transition hover:bg-blue-50">Explore all topics <ArrowRight size={16} /></a>

//               </div>

//               <p className="mt-5 text-xs text-slate-500">Python examples · One complete project</p>

//               {productError && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{productError} <button type="button" onClick={retryProduct} className="ml-2 font-bold underline">Retry</button></div>}

//             </div>

//             <div className="relative mx-auto w-full max-w-[390px] py-5" aria-label="Illustrated cover of MASTER GENAI INTERVIEW MCP">

//               <div className="absolute inset-10 rounded-full bg-blue-300/30 blur-[80px]" />

//               <div className="relative mx-auto flex min-h-[465px] max-w-[325px] -rotate-3 flex-col overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-white to-[#E6F1FF] p-7 text-[#142A4B] shadow-[0_30px_80px_rgba(54,96,153,.18)] ring-8 ring-blue-100/60">

//                 <span className="text-[10px] font-black tracking-widest">TARGET TREK <span className="text-slate-500">/ DEVELOPER SERIES</span></span>

//                 <div className="relative mt-10 h-32" aria-hidden="true">

//                   <div className="absolute left-4 top-7 h-[1px] w-40 rotate-12 bg-sky-300/80" /><div className="absolute left-20 top-10 h-[1px] w-32 -rotate-[35deg] bg-sky-300/80" /><div className="absolute left-20 top-12 h-[1px] w-40 rotate-[30deg] bg-sky-300/80" />

//                   <div className="absolute left-3 top-5 h-4 w-4 rounded-full bg-sky-300 shadow-[0_0_22px_#7dd3fc]" /><div className="absolute left-20 top-10 h-4 w-4 rounded-full bg-sky-300 shadow-[0_0_22px_#7dd3fc]" /><div className="absolute right-6 top-0 h-4 w-4 rounded-full bg-sky-300 shadow-[0_0_22px_#7dd3fc]" /><div className="absolute bottom-0 right-2 h-4 w-4 rounded-full bg-sky-300 shadow-[0_0_22px_#7dd3fc]" />

//                 </div>

//                 <div className="mt-5 text-[28px] font-black leading-[1.12] tracking-tight">MASTER GENAI<br />INTERVIEW MCP</div>

//                 <p className="mt-3 text-xs leading-5 text-slate-600">Architecture, protocol internals<br />and deployment</p>

//                 <span className="mt-auto pt-5 text-[9px] text-slate-500">FastMCP · LangChain · Python · HTTP · STDIO</span>

//               </div>

//               <div className="absolute -right-3 top-11 hidden items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 shadow-lg sm:flex"><Server size={15} /> MCP SERVER</div>

//               <div className="absolute -bottom-1 -left-3 hidden items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 shadow-lg sm:flex"><Code2 size={15} /> PYTHON CODE</div>

//             </div>

//           </div>

//         </section>

        

//         <div className="border-b border-blue-100 bg-white"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-5 py-6 text-xs font-bold text-slate-700 sm:px-8 md:grid-cols-4 md:text-sm">{[[BookOpen, "Python code examples"], [Network, "Architecture diagram"], [Terminal, "Runnable commands"], [ShieldCheck, "Auth and security"]].map(([Icon, label]) => <span key={label} className="flex items-center gap-2"><Icon size={18} className="shrink-0 text-blue-600" />{label}</span>)}</div></div>

        

//         <section id="what-is-mcp" className="bg-white px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">

//           <SectionIntro eyebrow="THE FUNDAMENTAL IDEA" title="What is MCP?" text="Model Context Protocol (MCP) is an open way for AI applications to connect to external capabilities. A host creates an MCP client connection to a server; the server describes what it can do, and the client can request an operation through a common protocol." />

//           <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">

//             <div className="rounded-2xl border border-blue-100 bg-[#F8FBFF] p-6 sm:p-8">

//               <h3 className="text-xl font-extrabold text-[#142A4B]">Why was a protocol needed?</h3>

//               <p className="mt-3 text-sm leading-7 text-slate-600">Imagine an AI assistant that needs a calendar, an issue tracker, a document store, and a database. If every application and every service has a custom integration, the same connection, schema, and error handling work gets repeated. MCP gives compatible clients and servers a shared way to discover and use capabilities.</p>

//               <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-blue-100 bg-white p-4"><strong className="text-sm text-blue-700">The host decides</strong><p className="mt-1 text-xs leading-6 text-slate-600">Which servers to connect to and which tools a model may see.</p></div><div className="rounded-xl border border-blue-100 bg-white p-4"><strong className="text-sm text-blue-700">The server executes</strong><p className="mt-1 text-xs leading-6 text-slate-600">Validates requests and enforces access before touching data.</p></div></div>

//             </div>

//             <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8"><span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">THE 20-SECOND VIEW</span><div className="mt-6 space-y-4">{[["1", "Your app is the host", "It receives the user's request and owns the user experience."], ["2", "It uses an MCP client", "The client opens a local or network connection to one server."], ["3", "The server publishes capabilities", "Tools, resources, and prompts are discovered through protocol calls."], ["4", "The server returns a result", "The host decides how to use the returned data or tool output."]].map(([number, title, detail]) => <div key={number} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">{number}</span><div><div className="text-sm font-extrabold text-[#142A4B]">{title}</div><p className="mt-0.5 text-xs leading-5 text-slate-600">{detail}</p></div></div>)}</div></div>

//           </div>

//           <p className="mt-6 rounded-xl border border-sky-100 bg-sky-50 px-5 py-4 text-sm leading-7 text-slate-700"><strong className="text-blue-700">In this ebook:</strong> you first run a neutral Hello MCP service. Only after you know the client and server flow do you build the authenticated reminder project.</p>

//         </div></section>

        

//         <section id="capabilities" className="bg-[#F2F7FE] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">

//           <SectionIntro eyebrow="THE THREE CORE CAPABILITIES" title="Tools, resources, and prompts" text="These are different ways a server shares functionality with a client. The book shows how to publish each one in FastMCP and request it from Python." />

//           <div className="grid gap-5 md:grid-cols-3">

//             {[[Zap, "Tools", "Do something", "Callable operations with named inputs and outputs. Use a tool when the client needs an action or a computed answer.", "greet(name) · add(a, b)", "tools/list → tools/call"], [BookOpen, "Resources", "Read something", "Named content available by URI. Use a resource for reference information that a client can list and read.", "hello://guide", "resources/list → resources/read"], [Sparkles, "Prompts", "Start from a template", "Reusable messages or instructions that a client can discover and request with arguments.", "welcome_topic(topic)", "prompts/list → prompts/get"]].map(([Icon, title, badge, detail, example, flow]) => <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm" key={title}><span className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-600"><Icon size={23}/></span><div className="mt-5 text-[11px] font-black uppercase tracking-widest text-teal-700">{badge}</div><h3 className="mt-1 text-xl font-extrabold text-[#142A4B]">{title}</h3><p className="mt-3 min-h-24 text-sm leading-7 text-slate-600">{detail}</p><div className="mt-5 rounded-lg bg-[#F2F7FE] px-3 py-2 font-mono text-xs text-blue-700">{example}</div><p className="mt-3 font-mono text-[11px] text-slate-500">{flow}</p></article>)}

//           </div>

//           <div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-blue-100 bg-white p-5"><h3 className="font-bold text-[#142A4B]">Where does LangChain fit?</h3><p className="mt-2 text-sm leading-6 text-slate-600">It can run the host-side agent and adapt discovered MCP tools into tools a model can use. The server still checks the operation.</p></div><div className="rounded-xl border border-blue-100 bg-white p-5"><h3 className="font-bold text-[#142A4B]">Is a model required?</h3><p className="mt-2 text-sm leading-6 text-slate-600">No. A direct MCP client can list capabilities and call tools without a model. The optional LangChain chapter comes later.</p></div></div>

//         </div></section>

        

//         <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">

//           <SectionIntro eyebrow="WHY READ THIS GUIDE" title="Understand the protocol. Then make it work." text="A practical path from MCP fundamentals to working code, with the design decisions an engineer needs to explain in an interview." center />

//           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

//             {[

//               [Layers3, "Start with the why", "Learn what MCP standardizes and how hosts, clients, servers, tools, resources, and prompts relate."],

//               [Braces, "See the wire protocol", "Study JSON-RPC 2.0 messages, handshake and versioning, discovery, responses, notifications, and errors."],

//               [RefreshCw, "Understand failures", "See how STDIO and HTTP connections fail, when clients reconnect, and what must be discovered again."],

//               [Code2, "Build for real", "Move from a neutral Hello MCP example to a full reminder application with Python code."],

//             ].map(([Icon, title, text]) => <article key={title} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"><span className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-600"><Icon size={23} /></span><h3 className="mt-5 text-lg font-extrabold text-[#142A4B]">{title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{text}</p></article>)}

//           </div>

//         </section>

        

//         <section id="architecture" className="bg-[#F2F7FE] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">

//           <SectionIntro eyebrow="THE BIG PICTURE" title="How an MCP request travels" text="The model can suggest an action. The host decides what to expose, the MCP client handles the protocol, and the server executes authorized work." />

//           <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">

//             {[

//               ["01", "User & host", "Receives the user request, handles approvals, chooses connected servers and model tools.", Workflow],

//               ["02", "MCP client", "Opens STDIO pipes or an HTTP connection, exchanges JSON-RPC and discovers capabilities.", Network],

//               ["03", "MCP server", "Publishes tools, resources and prompts; validates requests and authorizes sensitive actions.", Server],

//               ["04", "App / database", "Performs business logic, stores durable data and filters records by verified identity.", Database],

//             ].map(([n, title, text, Icon], i) => <React.Fragment key={title}><div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-blue-600"><span className="text-xs font-black tracking-widest">{n}</span><Icon size={22} /></div><h3 className="mt-6 text-base font-extrabold text-[#142A4B]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>{i < 3 && <ArrowRight className="mx-auto self-center rotate-90 text-blue-500 lg:rotate-0" size={20} />}</React.Fragment>)}

//           </div>

//           <div className="mt-7 grid gap-4 md:grid-cols-3">

//             {[["Connection", "STDIO starts a child process; HTTP connects to an already running endpoint."], ["Handshake", "The tested protocol revision exchanges initialize and initialized before normal calls."], ["Restart", "A fresh connection repeats setup and tool discovery; write retries require care."]].map(([title, detail]) => <div className="rounded-xl border border-blue-100 bg-white/80 p-5" key={title}><span className="font-extrabold text-blue-700">{title}</span><p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p></div>)}

//           </div>

//         </div></section>

        

//         <section className="bg-white px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">

//           <SectionIntro eyebrow="FROM CONNECT TO RESULT" title="What actually happens on the wire?" text="MCP uses JSON-RPC 2.0 messages. The specific startup sequence depends on protocol revision; the code in this book targets the revision verified with its installed libraries." />

//           <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{[["01", "Create connection", "A host launches a child process for STDIO or contacts an HTTP /mcp endpoint."], ["02", "Initialize", "In the tested revision, the client and server exchange version, identity, and capability information."], ["03", "Discover", "The client asks for tools, resources, or prompts and receives their descriptions and schemas."], ["04", "Call and respond", "A request carries a JSON-RPC id and method. Its response uses the same id; notifications do not require a reply."], ["05", "Close or reconnect", "On exit or failure, the host closes or creates a new connection and refreshes the discovered capabilities."]].map(([n, title, detail]) => <div key={n} className="rounded-xl border border-blue-100 bg-[#F8FBFF] p-5"><span className="text-xs font-black tracking-widest text-blue-600">STEP {n}</span><h3 className="mt-4 font-extrabold text-[#142A4B]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p></div>)}</div>

//           <div className="mt-6 grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-blue-100 bg-blue-50 p-5"><h3 className="font-extrabold text-blue-700">If a server stops</h3><p className="mt-2 text-sm leading-6 text-slate-600">A STDIO client can observe process exit or EOF. An HTTP client may receive refusal, reset, timeout, or a lost-session response. The host must reconnect according to its own policy.</p></div><div className="rounded-xl border border-blue-100 bg-blue-50 p-5"><h3 className="font-extrabold text-blue-700">If a request was a write</h3><p className="mt-2 text-sm leading-6 text-slate-600">A missing response does not prove the write failed. The project discusses checking stored state and using idempotency instead of blindly repeating creates.</p></div></div>

//         </div></section>

        

//         <section id="curriculum" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">

//           <SectionIntro eyebrow="COMPLETE TABLE OF CONTENTS" title="Every topic, in the order you need it" text="The first three parts use general MCP examples. The final part brings everything together in the reminder app." />

//           <div className="grid gap-6 lg:grid-cols-2">{curriculum.map((part) => <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm" key={part.group}><div className="border-b border-blue-100 bg-[#EAF3FF] px-6 py-4 text-xs font-black uppercase tracking-widest text-blue-700">{part.group}</div><div className="divide-y divide-slate-100 px-6">{part.chapters.map((ch) => <article key={ch.n} className="flex gap-4 py-5"><span className="mt-0.5 text-xs font-black text-blue-600">{ch.n}</span><div><h3 className="font-extrabold text-[#142A4B]">{ch.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{ch.details}</p></div></article>)}</div></div>)}</div>

//           <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50/60 px-5 py-4 text-sm leading-6 text-slate-700"><BookOpen size={18} className="mr-2 inline text-blue-600"/>The book closes with official protocol and SDK references and the CampusX MCP YouTube playlist for further study.</div>

//         </section>

        

//         <section className="bg-[#F2F7FE] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">

//           <SectionIntro eyebrow="TWO WAYS TO CONNECT" title="STDIO versus Streamable HTTP" text="Understand when a host launches the server locally and when a client connects to a separate network service." />

//           <div className="grid gap-5 md:grid-cols-2">

//             {[

//               { icon: Terminal, name: "Local STDIO", badge: "HOST-LAUNCHED", points: ["The host starts a Python child process.", "The client writes JSON-RPC to stdin and reads stdout.", "stderr carries server diagnostics.", "A restarted process needs a fresh client connection and discovery."] },

//               { icon: Globe2, name: "Streamable HTTP", badge: "NETWORK SERVICE", points: ["The server starts independently at an /mcp endpoint.", "The client connects to its URL and sends HTTP requests.", "Protected services need verified credentials.", "A restart may invalidate a legacy logical session; reconnect and rediscover."] },

//             ].map(({ icon: Icon, name, badge, points }) => <article key={name} className="rounded-2xl border border-blue-100 bg-white p-7 shadow-sm"><div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-3 text-blue-600"><Icon size={24}/></span><div><div className="text-[10px] font-black tracking-widest text-blue-600">{badge}</div><h3 className="text-xl font-black text-[#142A4B]">{name}</h3></div></div><ul className="mt-6 space-y-4">{points.map((point) => <li key={point} className="flex gap-3 text-sm leading-6 text-slate-600"><Check size={16} className="mt-1 shrink-0 text-teal-600"/>{point}</li>)}</ul></article>)}

//           </div>

//         </div></section>

        

//         <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-24">

//           <div><SectionIntro eyebrow="LEARN BY RUNNING" title="A simple example before the complete project" text="Create a FastMCP server, publish a typed tool, run it locally, then add HTTP, resources, prompts, Inspector, and LangChain."/><ul className="space-y-4 text-sm text-slate-700">{["Working server and direct client examples", "Commands for each transport and Inspector", "Typed schemas, results and validation", "An optional LangChain agent example"].map((item) => <li className="flex items-start gap-3" key={item}><CheckCircle2 className="mt-0.5 shrink-0 text-teal-600" size={18}/>{item}</li>)}</ul></div>

//           <CodeWindow filename="hello_mcp.py">{helloCode}</CodeWindow>

//         </section>

        

//         <section id="commands" className="bg-[#F2F7FE] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">

//           <SectionIntro eyebrow="RUN EACH COMPONENT" title="Commands, not just screenshots" text="The book gives copyable instructions for the neutral service and the complete project. Here is a sample of the workflow." />

//           <div className="flex flex-wrap gap-2" role="tablist" aria-label="Command examples">{commandSets.map((set, index) => <button key={set.label} type="button" role="tab" aria-selected={activeCommand === index} onClick={() => { setActiveCommand(index); setCopied(false); }} className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${activeCommand === index ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "border border-blue-100 bg-white text-slate-600 hover:bg-blue-50"}`}>{set.label}</button>)}</div>

//           <div role="tabpanel" className="mt-5 overflow-hidden rounded-2xl border border-blue-100 bg-white text-[#142A4B] shadow-xl shadow-blue-900/5"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 bg-[#EAF3FF] px-5 py-4"><div><h3 className="font-bold">{commandSets[activeCommand].title}</h3><p className="mt-1 text-xs text-slate-600">{commandSets[activeCommand].explanation}</p></div><button type="button" onClick={copyCommand} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50">{copied ? <Check size={15}/> : <Copy size={15}/>} {copied ? "Copied" : "Copy"}</button></div><pre className="overflow-x-auto p-5 text-xs leading-7 text-slate-800 sm:p-7"><code>{commandSets[activeCommand].code}</code></pre></div>

//           <p className="mt-4 text-xs leading-6 text-slate-600">Project processes such as the auth API and HTTP MCP server run in separate terminals. The ebook explains environment variables and the required order.</p>

//         </div></section>

        

//         <section id="project" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">

//           <SectionIntro eyebrow="THE CAPSTONE PROJECT" title="Build a complete MCP reminder application" text="The final chapters bring authentication, data storage, MCP transports, clients, LangChain, tests, and deployment into one coherent project." />

//           <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">

//             <div className="space-y-5">

//               {[

//                 ["1", "Register and log in", "FastAPI registers a user, validates the password, and issues a short-lived signed token.", KeyRound],

//                 ["2", "Connect to the MCP server", "A local client launches STDIO or a network client connects to an authenticated /mcp endpoint.", Network],

//                 ["3", "Discover and call tools", "The client finds create, list, complete, and delete operations, then sends validated arguments.", Workflow],

//                 ["4", "Enforce ownership", "The server derives identity from verified credentials; SQL filters and updates use the owner ID.", ShieldCheck],

//                 ["5", "Run, test, and deploy", "Inspector exercises, isolation tests, Docker commands, and cloud migration boundaries complete the workflow.", Play],

//               ].map(([n, title, detail, Icon]) => <div className="flex gap-4 rounded-xl border border-blue-100 bg-white p-5 shadow-sm" key={n}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-600">{n}</span><div><div className="flex items-center gap-2 font-extrabold text-[#142A4B]"><Icon size={17} className="text-blue-600"/>{title}</div><p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p></div></div>)}

//             </div>

//             <div className="self-start overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-900/5"><div className="flex items-center gap-2 border-b border-blue-100 bg-[#EAF3FF] px-5 py-4 font-extrabold text-[#142A4B]"><FileCode2 size={18} className="text-blue-600"/> Files explained in the book</div><div className="divide-y divide-slate-100 px-5">{files.map(([name, purpose]) => <div className="py-3" key={name}><div className="font-mono text-[13px] font-bold text-blue-700">{name}</div><p className="mt-0.5 text-xs leading-5 text-slate-600">{purpose}</p></div>)}</div><div className="bg-[#F2F7FE] px-5 py-4 text-xs font-bold text-blue-700">Full source listings and step-by-step run commands included.</div></div>

//           </div>

//         </section>

        

//         <section className="bg-[#F2F7FE] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><SectionIntro eyebrow="WHO SHOULD READ THIS" title="Made for developers who want to explain and build MCP" center/><div className="grid gap-5 md:grid-cols-3">{[[Server, "Backend engineers", "Learn process and HTTP transports, identity boundaries, validation, failure handling, and deployment choices."], [Zap, "GenAI builders", "Connect a real MCP server to LangChain and understand the tool path from user request to result."], [BookOpen, "Interview candidates", "Use architecture, wire examples, project trade-offs, and interview answers to explain the system clearly."]].map(([Icon, title, detail]) => <div className="rounded-2xl border border-blue-100 bg-white p-7" key={title}><Icon className="text-blue-600" size={26}/><h3 className="mt-4 text-lg font-extrabold text-[#142A4B]">{title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{detail}</p></div>)}</div></div></section>

        

//         <section id="pricing" className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_0.85fr] lg:py-24">

//           <div><SectionIntro eyebrow="GET THE EBOOK" title="One guide. From protocol to working project." text="Learn from the neutral examples, follow the detailed application flow, and keep the full code and command reference at hand."/><div className="grid gap-3 sm:grid-cols-2">{["Architecture diagram and lifecycle", "JSON-RPC 2.0 and handshake", "STDIO and HTTP server/client", "MCP Inspector walkthrough", "LangChain integration", "Full reminder app code", "Auth, testing, and deployment", "Official sources and further reading"].map((item) => <div key={item} className="flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-teal-600"/>{item}</div>)}</div></div>

//           <div className="rounded-3xl border border-blue-100 bg-white p-7 shadow-[0_24px_70px_rgba(20,42,75,.11)] sm:p-9">

//             <span className="text-xs font-black uppercase tracking-widest text-blue-700">{productTitle}</span>

//             <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">

//               <strong className="text-5xl font-black tracking-tighter text-[#142A4B] sm:text-6xl">{loadingProduct ? "Loading price..." : canBuy ? formatMoney(currentPrice) : "Price unavailable"}</strong>

//               {canBuy && hasMrp && <del className="text-2xl font-semibold text-slate-400">{formatMoney(mrp)}</del>}

//               {canBuy && discount > 0 && <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">{discount}% OFF</span>}

//             </div>

//             {product?.subtitle && <p className="mt-3 text-sm text-slate-600">{product.subtitle}</p>}

//             {product?.shortDescription && <p className="mt-3 text-sm leading-6 text-slate-600">{product.shortDescription}</p>}

//             {product?.description && <p className="mt-3 text-sm leading-6 text-slate-600">{product.description}</p>}

//             <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">

//               {[product?.edition, product?.language, product?.format, product?.level, product?.resource_type, ...(Array.isArray(product?.categories) ? product.categories : [])].filter(Boolean).map((value, index) => <span key={`${value}-${index}`} className="rounded-full bg-blue-50 px-3 py-1">{value}</span>)}

//             </div>

//             <div className="my-6 border-t border-slate-100" />

//             <button type="button" onClick={handleBuyNow} disabled={!canBuy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Get the ebook <ArrowRight size={18}/></button>

//             {productError && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{productError} <button type="button" onClick={retryProduct} className="ml-1 font-bold underline">Retry</button></div>}

//             <div className="mt-5 space-y-1 text-center text-[11px] leading-5 text-slate-500"><p>This digital book is not refundable.</p><p>For support, contact <a href="mailto:supporttargettrek@gmail.com" className="underline decoration-slate-300 underline-offset-2 hover:text-blue-700">supporttargettrek@gmail.com</a></p></div>

//           </div>

//         </section>

        

//         <section className="bg-[#F2F7FE] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-3xl"><SectionIntro eyebrow="QUESTIONS" title="Frequently asked questions" center/><div className="divide-y divide-blue-100 border-y border-blue-100">{faqs.map(([question, answer], index) => <div key={question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index} aria-controls={`mcp-faq-${index}`} className="flex w-full items-center justify-between gap-6 py-5 text-left font-bold text-[#142A4B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"><span>{question}</span><ChevronDown className={`shrink-0 transition-transform ${openFaq === index ? "rotate-180" : ""}`} size={19}/></button><div id={`mcp-faq-${index}`} hidden={openFaq !== index} className="pb-5 pr-9 text-sm leading-7 text-slate-600">{answer}</div></div>)}</div></div></section>

//         <section className="bg-[#EAF3FF] px-5 py-14 text-[#142A4B] sm:px-8"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 md:flex-row md:items-center"><div><span className="text-xs font-black uppercase tracking-widest text-blue-600">READY TO BUILD?</span><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Learn MCP from the wire to the app.</h2><p className="mt-2 text-sm text-slate-600">Architecture, examples, full project, and commands in one ebook.</p></div><div><button type="button" onClick={handleBuyNow} disabled={!canBuy} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-extrabold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{canBuy ? `Get the ebook — ${formatMoney(currentPrice)}` : loadingProduct ? "Loading price..." : "Price unavailable"} <ArrowRight size={18}/></button>{productError && <p role="alert" className="mt-2 max-w-sm text-xs font-semibold text-red-600">{productError}</p>}</div></div><p className="mx-auto mt-6 max-w-7xl text-[11px] leading-5 text-slate-500">This digital book is not refundable. For support: <a className="underline hover:text-blue-700" href="mailto:supporttargettrek@gmail.com">supporttargettrek@gmail.com</a></p></section>

//       </main>

//       <PayUCheckoutModal isOpen={isCheckoutOpen && canBuy} onClose={() => setIsCheckoutOpen(false)} product={product} />

      

//       <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-blue-100 bg-white px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-9px_32px_rgba(20,42,75,.14)] md:hidden">

//         <div className="leading-tight">

//           {canBuy && hasMrp && <div className="text-[10px] text-slate-500"><del>{formatMoney(mrp)}</del>{discount > 0 && <span className="ml-2 font-extrabold text-green-700">{discount}% OFF</span>}</div>}

//           <strong className="text-lg font-black text-[#142A4B]">{loadingProduct ? "Loading..." : canBuy ? formatMoney(currentPrice) : "Price unavailable"}</strong>

//         </div>

//         <div className="flex flex-col items-end"><button type="button" onClick={handleBuyNow} disabled={!canBuy} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-3 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">Get ebook <ArrowRight size={16}/></button>{productError && <span role="alert" className="mt-1 max-w-[180px] text-right text-[9px] font-semibold leading-3 text-red-600">{productError}</span>}</div>

//       </div>

//       <div className="h-16 bg-[#EAF3FF] md:hidden" aria-hidden="true" />

//     </div>

//   );

// }
import React, {
  useEffect,
  useState,
} from "react";

import { Helmet } from "react-helmet";

import PayUCheckoutModal from "../payment/PayUCheckoutModal";

import {
  ArrowRight,
  BookOpen,
  Braces,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  Copy,
  Database,
  FileCode2,
  Globe2,
  KeyRound,
  Layers3,
  Network,
  Play,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";

const SITE_URL =
  "https://www.targettrek.in";

const SITE_NAME =
  "TargetTrek";

const PAGE_PATH =
  "/book/genai/mcp";

const PAGE_URL =
  `${SITE_URL}${PAGE_PATH}`;

const SEO_TITLE =
  "Master GenAI Interview MCP – Model Context Protocol, FastMCP & LangChain | TargetTrek";

const SEO_DESCRIPTION =
  "Learn Model Context Protocol with the TargetTrek MCP ebook. Understand hosts, clients, servers, JSON-RPC 2.0, STDIO, Streamable HTTP, FastMCP, LangChain, authentication, deployment and a complete Python project.";

const BASE_URL =
  import.meta.env
    .VITE_BASE_URL ||
  "http://localhost:5001";

const THEME_KEY =
  "theme";

const THEME_EVENT =
  "targettrek-theme-change";

const readTheme = () => {
  if (
    typeof window ===
    "undefined"
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

const curriculum = [
  {
    group:
      "Part 01 / MCP fundamentals",

    chapters: [
      {
        n: "01",
        title:
          "Why MCP exists",
        details:
          "The integration problem, capability discovery, MCP versus REST, model tool calling, and where LangChain fits.",
      },
      {
        n: "02",
        title:
          "Host, client, server, and lifecycle",
        details:
          "Responsibilities, architecture diagram, JSON-RPC 2.0, connection creation, initialization, capability negotiation, discovery, messages, sessions, ping, shutdown, timeouts, server restarts, and reconnection.",
      },
      {
        n: "03",
        title:
          "Python setup and installation",
        details:
          "Python virtual environment, pinned packages, command-line tooling, Node.js and npx for Inspector, and version checks.",
      },
    ],
  },

  {
    group:
      "Part 02 / Build and connect",

    chapters: [
      {
        n: "04",
        title:
          "FastMCP tools and validation",
        details:
          "A neutral Hello MCP server, Python type annotations, tool descriptions, generated input schemas, structured results, and validation errors.",
      },
      {
        n: "05",
        title:
          "Resources and prompts",
        details:
          "Register a resource URI, publish a reusable prompt, then list, read, and request each capability from a client.",
      },
      {
        n: "06",
        title:
          "Local STDIO server and client",
        details:
          "Start a server as a child process, communicate over stdin and stdout, inspect stderr, make calls, and understand process cleanup.",
      },
      {
        n: "07",
        title:
          "Streamable HTTP server and client",
        details:
          "Run the same server independently at /mcp, connect by URL, send tool calls, and compare network and local process behavior.",
      },
      {
        n: "08",
        title:
          "MCP Inspector and debugging",
        details:
          "Launch Inspector for STDIO or HTTP, inspect schemas, call tools, browse resources and prompts, and diagnose common failures.",
      },
    ],
  },

  {
    group:
      "Part 03 / Agents and practical decisions",

    chapters: [
      {
        n: "09",
        title:
          "Authentication and authorization",
        details:
          "Verify who is calling, restrict access to private records, use bearer credentials, and understand the limits of prompts as security controls.",
      },
      {
        n: "10",
        title:
          "LangChain agents with MCP",
        details:
          "Use MultiServerMCPClient, turn MCP capabilities into LangChain tools, run an optional agent, and compare agent calls with deterministic direct calls.",
      },
      {
        n: "11",
        title:
          "Interview questions and quick reference",
        details:
          "Explain transport choices, lifecycle, failures, security, tool discovery, JSON-RPC messages, and retries in plain language.",
      },
    ],
  },

  {
    group:
      "Part 04 / Complete reminder application",

    chapters: [
      {
        n: "12",
        title:
          "Project design and database",
        details:
          "Requirements, complete project tree, registration and login flow, owner-scoped tables, UTC dates, and request walkthrough.",
      },
      {
        n: "13",
        title:
          "Full source code, file by file",
        details:
          "Complete Python modules for storage, identity, FastAPI auth, business service, FastMCP server, login helper, direct client, LangChain agent, tests, and Docker files.",
      },
      {
        n: "14",
        title:
          "Run and verify every component",
        details:
          "Install dependencies, register and log in, run local and HTTP transports, open Inspector, run the agent, and execute the tests.",
      },
      {
        n: "15",
        title:
          "Docker and cloud deployment",
        details:
          "Single-host Compose workflow, container build, HTTP deployment boundary, persistent storage requirements, and a Cloud Run migration path.",
      },
      {
        n: "16",
        title:
          "Security, testing, and operations",
        details:
          "Isolation checks, credential handling, logs, production safeguards, timeouts, backups, and operational limitations.",
      },
    ],
  },
];

const projectFiles = [
  [
    "storage.py",
    "SQLite connection management, users and reminders tables, and owner-scoped indexes.",
  ],
  [
    "identity.py",
    "Password hashing, token creation, expiry, and token verification.",
  ],
  [
    "auth_api.py",
    "FastAPI registration, login, and local health endpoint.",
  ],
  [
    "service.py",
    "Input validation, UTC conversion, and reminder CRUD restricted to the verified owner.",
  ],
  [
    "server.py",
    "FastMCP tools, a resource, a prompt, auth boundary, and STDIO/HTTP mode.",
  ],
  [
    "login_token.py",
    "Local login helper used to obtain a short-lived token for Inspector.",
  ],
  [
    "client.py",
    "Direct client that logs in, discovers tools, and calls STDIO or HTTP MCP.",
  ],
  [
    "agent.py",
    "Optional LangChain host that loads MCP tools for an LLM agent.",
  ],
  [
    "tests/test_reminder.py",
    "Account isolation, invalid date, and in-memory MCP invocation checks.",
  ],
  [
    "Dockerfile + compose.yaml",
    "Image and local two-service setup with a persistent SQLite volume.",
  ],
];

const commandSets = [
  {
    label:
      "Hello MCP",

    title:
      "Run the small example first",

    explanation:
      "A neutral server introduces tools, resources, prompts, and both transports before the project code.",

    code: `python3 -m venv .venv
source .venv/bin/activate

python -m pip install fastmcp==3.4.7

python hello_mcp.py
python local_client.py

MCP_TRANSPORT=http python hello_mcp.py
python http_client.py`,
  },

  {
    label:
      "Inspector",

    title:
      "Inspect tools without a model",

    explanation:
      "Open the address printed in the terminal, connect, list capabilities, and manually call a tool.",

    code: `npx @modelcontextprotocol/inspector python hello_mcp.py

npx @modelcontextprotocol/inspector http://127.0.0.1:8000/mcp

fastmcp inspect hello_mcp.py
fastmcp list hello_mcp.py`,
  },

  {
    label:
      "Reminder app",

    title:
      "Run every application component",

    explanation:
      "The project chapter walks through registration, login, both transports, the direct client, and tests.",

    code: `python -m pip install -r reminder_app/requirements.txt

python -m pytest -q tests/test_reminder.py

uvicorn reminder_app.auth_api:app --host 127.0.0.1 --port 8081

python -m reminder_app.client --transport stdio --username alice

MCP_TRANSPORT=http PORT=8000 python -m reminder_app.server

python -m reminder_app.client --transport http --username alice`,
  },
];

const faqs = [
  [
    "Does the book explain MCP architecture deeply?",
    "Yes. It covers hosts, clients, servers, JSON-RPC 2.0, connection setup, the initialization handshake used by the tested stack, discovery, sessions, ping, shutdown, timeouts, and reconnect behavior.",
  ],
  [
    "Will I build both local and HTTP servers?",
    "Yes. You start with a neutral FastMCP server and call it using both STDIO and Streamable HTTP. The complete reminder app also supports both transports.",
  ],
  [
    "Is there full project source code?",
    "Yes. The reminder app section includes the file tree, explanations for the files, complete listings, run commands, tests, and deployment guidance.",
  ],
  [
    "Do I need an LLM API key for the book's exercises?",
    "Only the optional LangChain agent call needs a model provider key. The server, direct client, Inspector, and project tests work without a paid LLM call.",
  ],
  [
    "Is the reminder app ready to scale on a cloud platform as is?",
    "Its SQLite setup is for local or single-host use. The book explains the durable shared database and identity changes needed before multi-instance cloud deployment.",
  ],
  [
    "Is this useful for an interview?",
    "Yes. The explanations and interview questions cover the protocol's why, what, and how, while the code gives you concrete examples to discuss.",
  ],
];

const helloCode = `from fastmcp import FastMCP

mcp = FastMCP("Hello MCP")

@mcp.tool()
def greet(name: str) -> str:
    clean = name.strip()

    if not clean:
        raise ValueError("name must not be blank")

    return f"Hello, {clean}!"

if __name__ == "__main__":
    mcp.run()`;

function SectionIntro({
  eyebrow,
  title,
  text,
  center = false,
  isDark,
}) {
  return (
    <div
      className={`mb-9 max-w-3xl ${
        center
          ? "mx-auto text-center"
          : ""
      }`}
    >
      <span className="text-xs font-black uppercase tracking-[0.18em] text-blue-500">
        {eyebrow}
      </span>

      <h2
        className={`mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-[44px] ${
          isDark
            ? "text-white"
            : "text-[#142A4B]"
        }`}
      >
        {title}
      </h2>

      {text && (
        <p
          className={`mt-4 text-sm leading-7 sm:text-base ${
            isDark
              ? "text-slate-400"
              : "text-slate-600"
          }`}
        >
          {text}
        </p>
      )}
    </div>
  );
}

function CodeWindow({
  filename,
  children,
  isDark,
}) {
  return (
    <div
      className={`min-w-0 overflow-hidden rounded-2xl border shadow-xl ${
        isDark
          ? "border-slate-800 bg-[#050B14] shadow-black/20"
          : "border-blue-100 bg-[#F8FBFF] shadow-blue-900/5"
      }`}
    >
      <div
        className={`flex items-center justify-between gap-4 border-b px-4 py-3 text-xs sm:px-5 ${
          isDark
            ? "border-slate-800 bg-[#0C131D] text-slate-400"
            : "border-blue-100 bg-[#EAF3FF] text-slate-600"
        }`}
      >
        <span className="flex shrink-0 gap-1.5">
          <i className="h-2 w-2 rounded-full bg-red-400" />
          <i className="h-2 w-2 rounded-full bg-amber-300" />
          <i className="h-2 w-2 rounded-full bg-emerald-300" />
        </span>

        <span className="min-w-0 truncate font-semibold">
          {filename}
        </span>

        <span className="hidden sm:inline">
          PYTHON
        </span>
      </div>

      <pre
        className={`w-full max-w-full overflow-x-auto p-4 text-[11px] leading-6 sm:p-6 sm:text-[13px] ${
          isDark
            ? "text-slate-300"
            : "text-slate-800"
        }`}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function GenaiMCP() {
  const [
    theme,
    setTheme,
  ] = useState(
    readTheme
  );

  const [
    activeCommand,
    setActiveCommand,
  ] = useState(0);

  const [
    openFaq,
    setOpenFaq,
  ] = useState(0);

  const [
    copied,
    setCopied,
  ] = useState(false);

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
    retryCount,
    setRetryCount,
  ] = useState(0);

  const [
    isCheckoutOpen,
    setIsCheckoutOpen,
  ] = useState(false);

  const isDark =
    theme === "dark";

  useEffect(() => {
    setTheme(
      readTheme()
    );

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
        setLoadingProduct(
          true
        );

        setProductError(
          ""
        );

        setProduct(
          null
        );

        setIsCheckoutOpen(
          false
        );

        try {
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
                "Unable to load the current product details. Please try again."
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
            typeof data.title !==
              "string" ||
            !data.title.trim() ||
            data.price ===
              null ||
            data.price ===
              undefined ||
            !String(
              data.price
            ).trim() ||
            !Number.isFinite(
              price
            ) ||
            price < 0
          ) {
            throw new Error(
              "The product data returned by the server is incomplete. Please try again."
            );
          }

          if (
            !controller
              .signal
              .aborted
          ) {
            setProduct(
              data
            );
          }
        } catch (
          error
        ) {
          if (
            error?.name ===
              "AbortError" ||
            controller.signal
              .aborted
          ) {
            return;
          }

          console.error(
            "Failed to fetch MCP product:",
            error
          );

          setProduct(
            null
          );

          setProductError(
            error?.message ||
              "Unable to load the current product details. Please try again."
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
    retryCount,
  ]);

  const currentPrice =
    product?.price !==
      null &&
    product?.price !==
      undefined &&
    product?.price !== ""
      ? Number(
          product.price
        )
      : null;

  const rawMrp =
    product?.mrp;

  const mrp =
    rawMrp !== null &&
    rawMrp !==
      undefined &&
    rawMrp !== ""
      ? Number(
          rawMrp
        )
      : null;

  const hasValidPrice =
    currentPrice !==
      null &&
    Number.isFinite(
      currentPrice
    ) &&
    currentPrice >= 0;

  const hasMrp =
    mrp !== null &&
    Number.isFinite(
      mrp
    ) &&
    hasValidPrice &&
    mrp >
      currentPrice;

  const discount =
    hasMrp
      ? Math.round(
          ((mrp -
            currentPrice) /
            mrp) *
            100
        )
      : 0;

  const currency =
    product?.currency ||
    "INR";

  const productTitle =
    "MASTER GENAI INTERVIEW MCP";

  const schemaProductName =
    product?.title?.trim() ||
    "Master GenAI Interview MCP";

  const canBuy =
    Boolean(
      product?._id
    ) &&
    hasValidPrice &&
    !loadingProduct &&
    !productError;

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
          currency
        ] || "en",
        {
          style:
            "currency",
          currency,
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
      return `${currency} ${value}`;
    }
  };

  const handleBuyNow =
    () => {
      if (
        !canBuy
      ) {
        return;
      }

      setIsCheckoutOpen(
        true
      );
    };

  const retryProduct =
    () => {
      setRetryCount(
        (count) =>
          count + 1
      );
    };

  const copyCommand =
    async () => {
      try {
        await navigator.clipboard.writeText(
          commandSets[
            activeCommand
          ].code
        );

        setCopied(
          true
        );

        window.setTimeout(
          () =>
            setCopied(
              false
            ),
          1700
        );
      } catch {
        setCopied(
          false
        );
      }
    };

  const productSchema = {
    "@type":
      "Product",

    "@id":
      `${PAGE_URL}#product`,

    name:
      schemaProductName,

    description:
      SEO_DESCRIPTION,

    category:
      "Model Context Protocol GenAI Interview Ebook",

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

    ...(canBuy
      ? {
          offers: {
            "@type":
              "Offer",

            url:
              PAGE_URL,

            price:
              currentPrice,

            priceCurrency:
              currency,

            availability:
              "https://schema.org/InStock",

            itemCondition:
              "https://schema.org/NewCondition",

            seller: {
              "@type":
                "Organization",

              name:
                SITE_NAME,
            },
          },
        }
      : {}),
  };

  const structuredData = {
    "@context":
      "https://schema.org",

    "@graph": [
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

        url:
          SITE_URL,

        name:
          SITE_NAME,

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

        url:
          PAGE_URL,

        name:
          SEO_TITLE,

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
          `${PAGE_URL}#breadcrumb`,

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
              "Master GenAI Interview MCP",

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
          schemaProductName,

        description:
          SEO_DESCRIPTION,

        bookFormat:
          "https://schema.org/EBook",

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

      productSchema,

      {
        "@type":
          "FAQPage",

        "@id":
          `${PAGE_URL}#faq`,

        mainEntity:
          faqs.map(
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
    ],
  };

  const pageBg =
    isDark
      ? "bg-[#080D14]"
      : "bg-[#F8FAFE]";

  const sectionBg =
    isDark
      ? "bg-[#0B111A]"
      : "bg-white";

  const softBg =
    isDark
      ? "bg-[#0C131D]"
      : "bg-[#F2F7FE]";

  const cardBg =
    isDark
      ? "bg-[#101924]"
      : "bg-white";

  const primaryText =
    isDark
      ? "text-white"
      : "text-[#142A4B]";

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
      : "border-blue-100";

  const ProductError = ({
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
        className={`rounded-xl border ${
          compact
            ? "mt-2 px-3 py-2 text-[10px]"
            : "mt-4 p-4 text-sm"
        } ${
          isDark
            ? "border-red-900/60 bg-red-950/20 text-red-300"
            : "border-red-200 bg-red-50 text-red-700"
        }`}
      >
        {productError}

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
    <div
      className={`min-h-screen w-full overflow-x-hidden antialiased transition-colors duration-300 ${pageBg} ${primaryText}`}
    >
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
          content="Model Context Protocol ebook, MCP interview preparation, MCP tutorial, FastMCP, LangChain MCP, MCP server, MCP client, STDIO MCP, Streamable HTTP MCP, JSON-RPC 2.0, GenAI interview book, TargetTrek MCP"
        />

        <meta
          name="author"
          content={
            SITE_NAME
          }
        />

        <meta
          name="application-name"
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

        <meta
          name="theme-color"
          content={
            isDark
              ? "#080D14"
              : "#ffffff"
          }
        />

        <link
          rel="canonical"
          href={
            PAGE_URL
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
            content={
              seoImage
            }
          />
        )}

        {seoImage && (
          <meta
            property="og:image:alt"
            content={`${schemaProductName} ebook cover`}
          />
        )}

        {canBuy && (
          <meta
            property="product:price:amount"
            content={String(
              currentPrice
            )}
          />
        )}

        {canBuy && (
          <meta
            property="product:price:currency"
            content={
              currency
            }
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

      <main className="w-full pb-20 pt-16 md:pb-0">
        <section
          className={`relative overflow-hidden border-b ${border} ${sectionBg}`}
        >
          <div className="pointer-events-none absolute inset-0">
            <div
              className={`absolute -right-48 -top-52 h-[520px] w-[520px] rounded-full blur-[130px] ${
                isDark
                  ? "bg-blue-900/20"
                  : "bg-blue-200/50"
              }`}
            />

            <div
              className={`absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full blur-[130px] ${
                isDark
                  ? "bg-indigo-900/10"
                  : "bg-indigo-100/60"
              }`}
            />
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.08fr_.92fr] lg:gap-16 lg:px-8 lg:py-24">
            <div>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] font-black tracking-[0.14em] sm:text-[11px] ${
                  isDark
                    ? "border-blue-900/60 bg-blue-950/30 text-blue-300"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }`}
              >
                <Sparkles
                  size={
                    14
                  }
                />

                TARGETTREK ·
                DEVELOPER SERIES
              </span>

              <h1
                className={`mt-6 max-w-3xl text-4xl font-black leading-[1.04] tracking-[-0.04em] sm:text-5xl lg:text-6xl xl:text-[68px] ${primaryText}`}
              >
                MASTER GENAI
                INTERVIEW{" "}

                <span className="text-blue-500">
                  MCP
                </span>
              </h1>

              <p
                className={`mt-6 max-w-2xl text-base leading-8 sm:text-lg ${secondaryText}`}
              >
                {product?.shortDescription ||
                  product?.subtitle ||
                  "Understand Model Context Protocol, build Python servers and clients, connect them with LangChain, and finish with a complete authenticated reminder application."}
              </p>

              <div
                className={`mt-7 grid gap-3 text-sm sm:grid-cols-2 ${secondaryText}`}
              >
                {[
                  "Architecture & JSON-RPC 2.0",
                  "STDIO + Streamable HTTP",
                  "FastMCP + LangChain",
                  "Full project code & commands",
                ].map(
                  (
                    item
                  ) => (
                    <span
                      key={
                        item
                      }
                      className="flex items-start gap-2"
                    >
                      <CheckCircle2
                        size={
                          17
                        }
                        className="mt-0.5 shrink-0 text-emerald-500"
                      />

                      {
                        item
                      }
                    </span>
                  )
                )}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={
                    handleBuyNow
                  }
                  disabled={
                    !canBuy
                  }
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto"
                >
                  {loadingProduct
                    ? "Loading price..."
                    : canBuy
                    ? `Get the ebook — ${formatMoney(
                        currentPrice
                      )}`
                    : "Price unavailable"}

                  <ArrowRight
                    size={
                      17
                    }
                  />
                </button>

                <a
                  href="#curriculum"
                  className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-black transition sm:w-auto ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-700 hover:bg-slate-800"
                      : "border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
                  }`}
                >
                  Explore all topics

                  <ArrowRight
                    size={
                      16
                    }
                  />
                </a>
              </div>

              <p
                className={`mt-5 text-xs ${mutedText}`}
              >
                Python examples ·
                One complete project
                · Interview focused
              </p>

              <ProductError />
            </div>

            <div
              className="relative mx-auto w-full max-w-[380px] py-4"
              aria-label="Illustrated cover of Master GenAI Interview MCP"
            >
              <div className="absolute inset-10 rounded-full bg-blue-500/15 blur-[90px]" />

              <div
                className={`
                  relative
                  mx-auto
                  flex
                  min-h-[430px]
                  max-w-[305px]
                  -rotate-2
                  flex-col
                  overflow-hidden
                  rounded-xl
                  border
                  p-6
                  shadow-2xl
                  sm:min-h-[470px]
                  sm:max-w-[330px]
                  sm:p-7

                  ${
                    isDark
                      ? "border-blue-800/60 bg-gradient-to-br from-[#111B2A] via-[#0D2748] to-[#172554] text-white ring-8 ring-blue-950/40"
                      : "border-blue-200 bg-gradient-to-br from-white to-[#E6F1FF] text-[#142A4B] ring-8 ring-blue-100/60"
                  }
                `}
              >
                <span className="text-[9px] font-black tracking-[0.16em] sm:text-[10px]">
                  TARGETTREK{" "}

                  <span
                    className={
                      isDark
                        ? "text-slate-400"
                        : "text-slate-500"
                    }
                  >
                    / DEVELOPER SERIES
                  </span>
                </span>

                <div
                  className="relative mt-9 h-28 sm:h-32"
                  aria-hidden="true"
                >
                  <div className="absolute left-4 top-7 h-px w-32 rotate-12 bg-sky-400/70 sm:w-40" />
                  <div className="absolute left-16 top-10 h-px w-28 -rotate-[35deg] bg-sky-400/70 sm:left-20 sm:w-32" />
                  <div className="absolute left-16 top-12 h-px w-32 rotate-[30deg] bg-sky-400/70 sm:left-20 sm:w-40" />

                  <div className="absolute left-3 top-5 h-3.5 w-3.5 rounded-full bg-sky-400 shadow-[0_0_20px_#38bdf8]" />

                  <div className="absolute left-16 top-10 h-3.5 w-3.5 rounded-full bg-sky-400 shadow-[0_0_20px_#38bdf8] sm:left-20" />

                  <div className="absolute right-6 top-0 h-3.5 w-3.5 rounded-full bg-sky-400 shadow-[0_0_20px_#38bdf8]" />

                  <div className="absolute bottom-0 right-2 h-3.5 w-3.5 rounded-full bg-sky-400 shadow-[0_0_20px_#38bdf8]" />
                </div>

                <h2 className="mt-5 text-[26px] font-black leading-[1.1] tracking-tight sm:text-[30px]">
                  MASTER GENAI
                  <br />
                  INTERVIEW
                  <br />
                  MCP
                </h2>

                <p
                  className={`mt-4 text-xs leading-5 ${
                    isDark
                      ? "text-slate-300"
                      : "text-slate-600"
                  }`}
                >
                  Architecture,
                  protocol internals
                  and deployment
                </p>

                <span
                  className={`mt-auto pt-5 text-[9px] ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                >
                  FastMCP · LangChain
                  · Python · HTTP ·
                  STDIO
                </span>
              </div>

              <div
                className={`absolute -right-3 top-10 hidden items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black shadow-lg sm:flex ${border} ${cardBg}`}
              >
                <Server
                  size={
                    15
                  }
                  className="text-blue-500"
                />

                MCP SERVER
              </div>

              <div
                className={`absolute -bottom-1 -left-3 hidden items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black shadow-lg sm:flex ${border} ${cardBg}`}
              >
                <Code2
                  size={
                    15
                  }
                  className="text-blue-500"
                />

                PYTHON CODE
              </div>
            </div>
          </div>
        </section>

        <div
          className={`border-b ${border} ${sectionBg}`}
        >
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 text-xs font-bold sm:px-6 md:grid-cols-4 md:text-sm lg:px-8">
            {[
              [
                BookOpen,
                "Python code examples",
              ],
              [
                Network,
                "Architecture diagram",
              ],
              [
                Terminal,
                "Runnable commands",
              ],
              [
                ShieldCheck,
                "Auth and security",
              ],
            ].map(
              ([
                Icon,
                label,
              ]) => (
                <span
                  key={
                    label
                  }
                  className={`flex items-center gap-2 ${secondaryText}`}
                >
                  <Icon
                    size={
                      18
                    }
                    className="shrink-0 text-blue-500"
                  />

                  {
                    label
                  }
                </span>
              )
            )}
          </div>
        </div>

        <section
          id="what-is-mcp"
          className={`px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${sectionBg}`}
        >
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="The fundamental idea"
              title="What is MCP?"
              text="Model Context Protocol (MCP) gives AI applications a common way to connect to external capabilities. A host creates an MCP client connection to a server, the server describes its capabilities, and the client can request operations through the protocol."
              isDark={
                isDark
              }
            />

            <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
              <div
                className={`rounded-2xl border p-5 sm:p-7 ${border} ${
                  isDark
                    ? "bg-[#0C131D]"
                    : "bg-[#F8FBFF]"
                }`}
              >
                <h3
                  className={`text-xl font-black ${primaryText}`}
                >
                  Why was a protocol
                  needed?
                </h3>

                <p
                  className={`mt-3 text-sm leading-7 ${secondaryText}`}
                >
                  Imagine an AI
                  assistant that needs
                  a calendar, issue
                  tracker, document
                  store and database.
                  Without a shared
                  protocol, each
                  application and
                  service needs its
                  own integration,
                  schemas and error
                  handling. MCP gives
                  compatible clients
                  and servers a common
                  capability model.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div
                    className={`rounded-xl border p-4 ${border} ${cardBg}`}
                  >
                    <strong className="text-sm text-blue-500">
                      The host decides
                    </strong>

                    <p
                      className={`mt-1 text-xs leading-6 ${secondaryText}`}
                    >
                      Which servers to
                      connect to and
                      which tools a
                      model may see.
                    </p>
                  </div>

                  <div
                    className={`rounded-xl border p-4 ${border} ${cardBg}`}
                  >
                    <strong className="text-sm text-blue-500">
                      The server
                      executes
                    </strong>

                    <p
                      className={`mt-1 text-xs leading-6 ${secondaryText}`}
                    >
                      Validates
                      requests and
                      enforces access
                      before touching
                      application
                      data.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl border p-5 shadow-sm sm:p-7 ${border} ${cardBg}`}
              >
                <span className="text-xs font-black uppercase tracking-[0.14em] text-blue-500">
                  The 20-second view
                </span>

                <div className="mt-6 space-y-4">
                  {[
                    [
                      "1",
                      "Your app is the host",
                      "It receives the user's request and owns the user experience.",
                    ],
                    [
                      "2",
                      "It uses an MCP client",
                      "The client opens a local or network connection to a server.",
                    ],
                    [
                      "3",
                      "The server publishes capabilities",
                      "Tools, resources and prompts are discovered through protocol calls.",
                    ],
                    [
                      "4",
                      "The server returns a result",
                      "The host decides how to use returned data or tool output.",
                    ],
                  ].map(
                    ([
                      number,
                      title,
                      detail,
                    ]) => (
                      <div
                        key={
                          number
                        }
                        className="flex gap-3"
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                            isDark
                              ? "bg-blue-950/50 text-blue-300"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {
                            number
                          }
                        </span>

                        <div>
                          <div
                            className={`text-sm font-black ${primaryText}`}
                          >
                            {
                              title
                            }
                          </div>

                          <p
                            className={`mt-1 text-xs leading-5 ${secondaryText}`}
                          >
                            {
                              detail
                            }
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className={`px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${softBg}`}
        >
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="The three core capabilities"
              title="Tools, resources and prompts"
              text="These are different ways an MCP server exposes functionality to a client. The book shows how to publish and consume each one."
              isDark={
                isDark
              }
            />

            <div className="grid gap-4 md:grid-cols-3">
              {[
                [
                  Zap,
                  "Tools",
                  "Do something",
                  "Callable operations with named inputs and outputs. Use a tool when a client needs an action or computed result.",
                  "greet(name) · add(a, b)",
                ],
                [
                  BookOpen,
                  "Resources",
                  "Read something",
                  "Named content available by URI. Use a resource for reference information a client can discover and read.",
                  "hello://guide",
                ],
                [
                  Sparkles,
                  "Prompts",
                  "Start from a template",
                  "Reusable messages or instructions that a client can discover and request with arguments.",
                  "welcome_topic(topic)",
                ],
              ].map(
                ([
                  Icon,
                  title,
                  badge,
                  detail,
                  example,
                ]) => (
                  <article
                    key={
                      title
                    }
                    className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${border} ${cardBg}`}
                  >
                    <span
                      className={`inline-flex rounded-xl p-3 ${
                        isDark
                          ? "bg-blue-950/40 text-blue-300"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <Icon
                        size={
                          22
                        }
                      />
                    </span>

                    <div className="mt-5 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-500">
                      {badge}
                    </div>

                    <h3
                      className={`mt-1 text-xl font-black ${primaryText}`}
                    >
                      {title}
                    </h3>

                    <p
                      className={`mt-3 text-sm leading-7 ${secondaryText}`}
                    >
                      {detail}
                    </p>

                    <div
                      className={`mt-5 break-words rounded-lg px-3 py-2 font-mono text-xs ${
                        isDark
                          ? "bg-slate-900 text-blue-300"
                          : "bg-[#F2F7FE] text-blue-700"
                      }`}
                    >
                      {example}
                    </div>
                  </article>
                )
              )}
            </div>
          </div>
        </section>

        <section className={`px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${sectionBg}`}>
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="Why read this guide"
              title="Understand the protocol. Then make it work."
              text="A practical path from MCP fundamentals to working code, with engineering decisions you can explain in an interview."
              center
              isDark={
                isDark
              }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [
                  Layers3,
                  "Start with the why",
                  "Understand what MCP standardizes and how hosts, clients, servers, tools, resources and prompts relate.",
                ],
                [
                  Braces,
                  "See the wire protocol",
                  "Study JSON-RPC messages, lifecycle, discovery, responses, notifications and errors.",
                ],
                [
                  RefreshCw,
                  "Understand failures",
                  "See how STDIO and HTTP connections fail, reconnect and refresh capabilities.",
                ],
                [
                  Code2,
                  "Build for real",
                  "Move from a small Hello MCP example to a complete authenticated reminder application.",
                ],
              ].map(
                ([
                  Icon,
                  title,
                  text,
                ]) => (
                  <article
                    key={
                      title
                    }
                    className={`rounded-2xl border p-5 sm:p-6 ${border} ${cardBg}`}
                  >
                    <span
                      className={`inline-flex rounded-xl p-3 ${
                        isDark
                          ? "bg-blue-950/40 text-blue-300"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <Icon
                        size={
                          22
                        }
                      />
                    </span>

                    <h3
                      className={`mt-5 text-lg font-black ${primaryText}`}
                    >
                      {title}
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-7 ${secondaryText}`}
                    >
                      {text}
                    </p>
                  </article>
                )
              )}
            </div>
          </div>
        </section>

        <section className={`px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${softBg}`}>
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="The big picture"
              title="How an MCP request travels"
              text="The model can suggest an action. The host controls exposure, the client handles protocol communication, and the server executes authorized work."
              isDark={
                isDark
              }
            />

            <div className="grid gap-4 lg:grid-cols-4">
              {[
                [
                  "01",
                  "User & host",
                  "Receives the user request, handles approvals, chooses connected servers and model tools.",
                  Workflow,
                ],
                [
                  "02",
                  "MCP client",
                  "Opens STDIO or HTTP connections, exchanges JSON-RPC and discovers capabilities.",
                  Network,
                ],
                [
                  "03",
                  "MCP server",
                  "Publishes tools, resources and prompts while validating and authorizing requests.",
                  Server,
                ],
                [
                  "04",
                  "App / database",
                  "Performs business logic, stores durable data and filters records by verified identity.",
                  Database,
                ],
              ].map(
                ([
                  n,
                  title,
                  text,
                  Icon,
                ]) => (
                  <div
                    key={
                      title
                    }
                    className={`rounded-2xl border p-5 shadow-sm ${border} ${cardBg}`}
                  >
                    <div className="flex items-center justify-between text-blue-500">
                      <span className="text-xs font-black tracking-[0.15em]">
                        {n}
                      </span>

                      <Icon
                        size={
                          22
                        }
                      />
                    </div>

                    <h3
                      className={`mt-6 font-black ${primaryText}`}
                    >
                      {title}
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-6 ${secondaryText}`}
                    >
                      {text}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section className={`px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${sectionBg}`}>
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="From connect to result"
              title="What happens on the wire?"
              text="MCP uses JSON-RPC 2.0 messages. The exact startup sequence depends on the protocol revision and SDK implementation."
              isDark={
                isDark
              }
            />

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {[
                [
                  "01",
                  "Create connection",
                  "A host launches a child process for STDIO or contacts an HTTP /mcp endpoint.",
                ],
                [
                  "02",
                  "Initialize",
                  "Client and server exchange version, identity and capability information.",
                ],
                [
                  "03",
                  "Discover",
                  "The client requests tools, resources or prompts and receives descriptions and schemas.",
                ],
                [
                  "04",
                  "Call and respond",
                  "Requests use a JSON-RPC id and method while responses use the same id.",
                ],
                [
                  "05",
                  "Close or reconnect",
                  "After failure or restart, a host creates a fresh connection and refreshes capabilities.",
                ],
              ].map(
                ([
                  n,
                  title,
                  detail,
                ]) => (
                  <div
                    key={
                      n
                    }
                    className={`rounded-xl border p-5 ${border} ${
                      isDark
                        ? "bg-[#0C131D]"
                        : "bg-[#F8FBFF]"
                    }`}
                  >
                    <span className="text-xs font-black tracking-[0.14em] text-blue-500">
                      STEP {n}
                    </span>

                    <h3
                      className={`mt-4 font-black ${primaryText}`}
                    >
                      {title}
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-6 ${secondaryText}`}
                    >
                      {detail}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section
          id="curriculum"
          className={`scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${softBg}`}
        >
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="Complete table of contents"
              title="Every topic, in the order you need it"
              text="The first parts use focused MCP examples. The final section brings the ideas together in a complete reminder application."
              isDark={
                isDark
              }
            />

            <div className="grid gap-5 lg:grid-cols-2">
              {curriculum.map(
                (
                  part
                ) => (
                  <div
                    key={
                      part.group
                    }
                    className={`overflow-hidden rounded-2xl border ${border} ${cardBg}`}
                  >
                    <div
                      className={`border-b px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-blue-500 ${border} ${
                        isDark
                          ? "bg-[#0C131D]"
                          : "bg-[#EAF3FF]"
                      }`}
                    >
                      {
                        part.group
                      }
                    </div>

                    <div
                      className={`divide-y ${
                        isDark
                          ? "divide-slate-800"
                          : "divide-slate-100"
                      } px-5`}
                    >
                      {part.chapters.map(
                        (
                          chapter
                        ) => (
                          <article
                            key={
                              chapter.n
                            }
                            className="flex gap-4 py-5"
                          >
                            <span className="mt-0.5 text-xs font-black text-blue-500">
                              {
                                chapter.n
                              }
                            </span>

                            <div>
                              <h3
                                className={`font-black ${primaryText}`}
                              >
                                {
                                  chapter.title
                                }
                              </h3>

                              <p
                                className={`mt-1 text-sm leading-6 ${secondaryText}`}
                              >
                                {
                                  chapter.details
                                }
                              </p>
                            </div>
                          </article>
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section className={`px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${sectionBg}`}>
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="Two ways to connect"
              title="STDIO versus Streamable HTTP"
              text="Understand when a host launches the server locally and when a client connects to an independently running network service."
              isDark={
                isDark
              }
            />

            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  icon:
                    Terminal,
                  name:
                    "Local STDIO",
                  badge:
                    "HOST-LAUNCHED",
                  points: [
                    "The host starts a Python child process.",
                    "The client writes JSON-RPC to stdin and reads stdout.",
                    "stderr carries server diagnostics.",
                    "A restarted process needs a fresh client connection and discovery.",
                  ],
                },
                {
                  icon:
                    Globe2,
                  name:
                    "Streamable HTTP",
                  badge:
                    "NETWORK SERVICE",
                  points: [
                    "The server starts independently at an /mcp endpoint.",
                    "The client connects to its URL and sends HTTP requests.",
                    "Protected services require verified credentials.",
                    "After restart, the client reconnects and refreshes discovery.",
                  ],
                },
              ].map(
                ({
                  icon:
                    Icon,
                  name,
                  badge,
                  points,
                }) => (
                  <article
                    key={
                      name
                    }
                    className={`rounded-2xl border p-5 shadow-sm sm:p-7 ${border} ${cardBg}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-xl p-3 ${
                          isDark
                            ? "bg-blue-950/40 text-blue-300"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        <Icon
                          size={
                            23
                          }
                        />
                      </span>

                      <div>
                        <div className="text-[10px] font-black tracking-[0.14em] text-blue-500">
                          {badge}
                        </div>

                        <h3
                          className={`text-xl font-black ${primaryText}`}
                        >
                          {name}
                        </h3>
                      </div>
                    </div>

                    <ul className="mt-6 space-y-4">
                      {points.map(
                        (
                          point
                        ) => (
                          <li
                            key={
                              point
                            }
                            className={`flex gap-3 text-sm leading-6 ${secondaryText}`}
                          >
                            <Check
                              size={
                                16
                              }
                              className="mt-1 shrink-0 text-emerald-500"
                            />

                            {
                              point
                            }
                          </li>
                        )
                      )}
                    </ul>
                  </article>
                )
              )}
            </div>
          </div>
        </section>

        <section className={`px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${softBg}`}>
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
            <div>
              <SectionIntro
                eyebrow="Learn by running"
                title="Start with a small example"
                text="Create a FastMCP server, publish a typed tool, run it locally, then expand into HTTP, resources, prompts, Inspector and LangChain."
                isDark={
                  isDark
                }
              />

              <ul className={`space-y-4 text-sm ${secondaryText}`}>
                {[
                  "Working server and direct client examples",
                  "Commands for each transport and Inspector",
                  "Typed schemas, results and validation",
                  "Optional LangChain agent integration",
                ].map(
                  (
                    item
                  ) => (
                    <li
                      key={
                        item
                      }
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2
                        className="mt-0.5 shrink-0 text-emerald-500"
                        size={
                          18
                        }
                      />

                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            <CodeWindow
              filename="hello_mcp.py"
              isDark={
                isDark
              }
            >
              {helloCode}
            </CodeWindow>
          </div>
        </section>

        <section
          id="commands"
          className={`px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${sectionBg}`}
        >
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="Run each component"
              title="Commands, not just screenshots"
              text="The book includes copyable commands for the small example and the complete project."
              isDark={
                isDark
              }
            />

            <div
              className="flex gap-2 overflow-x-auto pb-2"
              role="tablist"
              aria-label="Command examples"
            >
              {commandSets.map(
                (
                  set,
                  index
                ) => (
                  <button
                    key={
                      set.label
                    }
                    type="button"
                    role="tab"
                    aria-selected={
                      activeCommand ===
                      index
                    }
                    onClick={() => {
                      setActiveCommand(
                        index
                      );

                      setCopied(
                        false
                      );
                    }}
                    className={`min-w-max rounded-full px-4 py-2.5 text-sm font-bold transition ${
                      activeCommand ===
                      index
                        ? "bg-blue-600 text-white"
                        : isDark
                        ? "border border-slate-700 bg-slate-900 text-slate-300"
                        : "border border-blue-100 bg-white text-slate-600"
                    }`}
                  >
                    {
                      set.label
                    }
                  </button>
                )
              )}
            </div>

            <div
              role="tabpanel"
              className={`mt-5 overflow-hidden rounded-2xl border shadow-xl ${border} ${
                isDark
                  ? "bg-[#050B14] shadow-black/20"
                  : "bg-white shadow-blue-900/5"
              }`}
            >
              <div
                className={`flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${border} ${
                  isDark
                    ? "bg-[#0C131D]"
                    : "bg-[#EAF3FF]"
                }`}
              >
                <div>
                  <h3
                    className={`font-black ${primaryText}`}
                  >
                    {
                      commandSets[
                        activeCommand
                      ].title
                    }
                  </h3>

                  <p
                    className={`mt-1 text-xs leading-5 ${secondaryText}`}
                  >
                    {
                      commandSets[
                        activeCommand
                      ]
                        .explanation
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    copyCommand
                  }
                  className={`inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black transition ${border} ${
                    isDark
                      ? "bg-slate-900 text-blue-300"
                      : "bg-white text-blue-700"
                  }`}
                >
                  {copied ? (
                    <Check
                      size={
                        15
                      }
                    />
                  ) : (
                    <Copy
                      size={
                        15
                      }
                    />
                  )}

                  {copied
                    ? "Copied"
                    : "Copy"}
                </button>
              </div>

              <pre
                className={`w-full max-w-full overflow-x-auto p-4 text-[11px] leading-6 sm:p-6 sm:text-xs ${
                  isDark
                    ? "text-slate-300"
                    : "text-slate-800"
                }`}
              >
                <code>
                  {
                    commandSets[
                      activeCommand
                    ].code
                  }
                </code>
              </pre>
            </div>
          </div>
        </section>

        <section className={`px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${softBg}`}>
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="The capstone project"
              title="Build a complete MCP reminder application"
              text="The final chapters combine authentication, storage, MCP transports, clients, LangChain, tests and deployment in one project."
              isDark={
                isDark
              }
            />

            <div className="grid gap-7 lg:grid-cols-[1.08fr_.92fr]">
              <div className="space-y-4">
                {[
                  [
                    "1",
                    "Register and log in",
                    "FastAPI registers a user, validates the password and issues a short-lived signed token.",
                    KeyRound,
                  ],
                  [
                    "2",
                    "Connect to the MCP server",
                    "A local client launches STDIO or a network client connects to an authenticated /mcp endpoint.",
                    Network,
                  ],
                  [
                    "3",
                    "Discover and call tools",
                    "The client finds create, list, complete and delete operations then sends validated arguments.",
                    Workflow,
                  ],
                  [
                    "4",
                    "Enforce ownership",
                    "The server derives identity from verified credentials and scopes database operations to the owner.",
                    ShieldCheck,
                  ],
                  [
                    "5",
                    "Run, test and deploy",
                    "Inspector exercises, isolation tests, Docker commands and cloud migration boundaries complete the workflow.",
                    Play,
                  ],
                ].map(
                  ([
                    n,
                    title,
                    detail,
                    Icon,
                  ]) => (
                    <div
                      key={
                        n
                      }
                      className={`flex gap-4 rounded-xl border p-4 shadow-sm sm:p-5 ${border} ${cardBg}`}
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-black ${
                          isDark
                            ? "bg-blue-950/40 text-blue-300"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {n}
                      </span>

                      <div>
                        <div
                          className={`flex items-center gap-2 font-black ${primaryText}`}
                        >
                          <Icon
                            size={
                              17
                            }
                            className="shrink-0 text-blue-500"
                          />

                          {title}
                        </div>

                        <p
                          className={`mt-1 text-sm leading-6 ${secondaryText}`}
                        >
                          {detail}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div
                className={`self-start overflow-hidden rounded-2xl border shadow-lg ${border} ${cardBg}`}
              >
                <div
                  className={`flex items-center gap-2 border-b px-5 py-4 font-black ${border} ${
                    isDark
                      ? "bg-[#0C131D]"
                      : "bg-[#EAF3FF]"
                  } ${primaryText}`}
                >
                  <FileCode2
                    size={
                      18
                    }
                    className="text-blue-500"
                  />

                  Files explained in
                  the book
                </div>

                <div
                  className={`divide-y px-5 ${
                    isDark
                      ? "divide-slate-800"
                      : "divide-slate-100"
                  }`}
                >
                  {projectFiles.map(
                    ([
                      name,
                      purpose,
                    ]) => (
                      <div
                        key={
                          name
                        }
                        className="py-3"
                      >
                        <div className="break-all font-mono text-[12px] font-bold text-blue-500 sm:text-[13px]">
                          {name}
                        </div>

                        <p
                          className={`mt-1 text-xs leading-5 ${secondaryText}`}
                        >
                          {purpose}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={`px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${sectionBg}`}>
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="Who should read this"
              title="Made for developers who want to explain and build MCP"
              center
              isDark={
                isDark
              }
            />

            <div className="grid gap-4 md:grid-cols-3">
              {[
                [
                  Server,
                  "Backend engineers",
                  "Learn process and HTTP transports, identity boundaries, validation, failure handling and deployment choices.",
                ],
                [
                  Zap,
                  "GenAI builders",
                  "Connect a real MCP server to LangChain and understand the tool path from request to result.",
                ],
                [
                  BookOpen,
                  "Interview candidates",
                  "Use architecture, wire examples, project trade-offs and interview answers to explain MCP clearly.",
                ],
              ].map(
                ([
                  Icon,
                  title,
                  detail,
                ]) => (
                  <div
                    key={
                      title
                    }
                    className={`rounded-2xl border p-5 sm:p-7 ${border} ${cardBg}`}
                  >
                    <Icon
                      className="text-blue-500"
                      size={
                        25
                      }
                    />

                    <h3
                      className={`mt-4 text-lg font-black ${primaryText}`}
                    >
                      {title}
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-7 ${secondaryText}`}
                    >
                      {detail}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className={`scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${softBg}`}
        >
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_.85fr]">
            <div>
              <SectionIntro
                eyebrow="Get the ebook"
                title="One guide. From protocol to working project."
                text="Learn from focused examples, follow the complete application flow and keep the full code and command reference at hand."
                isDark={
                  isDark
                }
              />

              <div
                className={`grid gap-3 text-sm sm:grid-cols-2 ${secondaryText}`}
              >
                {[
                  "Architecture diagram and lifecycle",
                  "JSON-RPC 2.0 and handshake",
                  "STDIO and HTTP server/client",
                  "MCP Inspector walkthrough",
                  "LangChain integration",
                  "Full reminder app code",
                  "Auth, testing and deployment",
                  "References and further reading",
                ].map(
                  (
                    item
                  ) => (
                    <div
                      key={
                        item
                      }
                      className="flex items-start gap-2"
                    >
                      <CheckCircle2
                        size={
                          17
                        }
                        className="mt-0.5 shrink-0 text-emerald-500"
                      />

                      {item}
                    </div>
                  )
                )}
              </div>
            </div>

            <div
              className={`rounded-3xl border p-6 shadow-xl sm:p-8 ${border} ${cardBg}`}
            >
              <span className="text-xs font-black uppercase tracking-[0.14em] text-blue-500">
                {productTitle}
              </span>

              <div className="mt-5 flex flex-wrap items-end gap-x-4 gap-y-2">
                <strong
                  className={`text-4xl font-black tracking-tight sm:text-5xl ${primaryText}`}
                >
                  {loadingProduct
                    ? "Loading..."
                    : canBuy
                    ? formatMoney(
                        currentPrice
                      )
                    : "Price unavailable"}
                </strong>

                {canBuy &&
                  hasMrp && (
                    <del
                      className={`text-xl font-semibold ${mutedText}`}
                    >
                      {formatMoney(
                        mrp
                      )}
                    </del>
                  )}

                {canBuy &&
                  discount >
                    0 && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        isDark
                          ? "bg-emerald-950/50 text-emerald-300"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {
                        discount
                      }
                      % OFF
                    </span>
                  )}
              </div>

              {product?.subtitle && (
                <p
                  className={`mt-3 text-sm ${secondaryText}`}
                >
                  {
                    product.subtitle
                  }
                </p>
              )}

              {product?.shortDescription && (
                <p
                  className={`mt-3 text-sm leading-6 ${secondaryText}`}
                >
                  {
                    product.shortDescription
                  }
                </p>
              )}

              <div className={`my-6 border-t ${border}`} />

              <button
                type="button"
                onClick={
                  handleBuyNow
                }
                disabled={
                  !canBuy
                }
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Get the ebook

                <ArrowRight
                  size={
                    18
                  }
                />
              </button>

              <ProductError />

              <div
                className={`mt-5 space-y-1 text-center text-[11px] leading-5 ${mutedText}`}
              >
                <p>
                  This digital book is
                  non-refundable.
                </p>

                <p>
                  For support, contact{" "}

                  <a
                    href="mailto:supporttargettrek@gmail.com"
                    className="font-bold text-blue-500 underline underline-offset-2"
                  >
                    supporttargettrek@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={`px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 ${sectionBg}`}>
          <div className="mx-auto max-w-3xl">
            <SectionIntro
              eyebrow="Questions"
              title="Frequently asked questions"
              center
              isDark={
                isDark
              }
            />

            <div
              className={`divide-y border-y ${
                isDark
                  ? "divide-slate-800 border-slate-800"
                  : "divide-blue-100 border-blue-100"
              }`}
            >
              {faqs.map(
                ([
                  question,
                  answer,
                ], index) => (
                  <div
                    key={
                      question
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaq(
                          openFaq ===
                            index
                            ? -1
                            : index
                        )
                      }
                      aria-expanded={
                        openFaq ===
                        index
                      }
                      aria-controls={`mcp-faq-${index}`}
                      className={`flex w-full items-center justify-between gap-5 py-5 text-left text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base ${primaryText}`}
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
                        className={`shrink-0 transition-transform ${mutedText} ${
                          openFaq ===
                          index
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    <div
                      id={`mcp-faq-${index}`}
                      hidden={
                        openFaq !==
                        index
                      }
                      className={`pb-5 pr-7 text-sm leading-7 ${secondaryText}`}
                    >
                      {answer}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section
          className={`border-t px-4 py-14 sm:px-6 lg:px-8 ${border} ${
            isDark
              ? "bg-[#0B111A]"
              : "bg-[#EAF3FF]"
          }`}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.14em] text-blue-500">
                Ready to build?
              </span>

              <h2
                className={`mt-2 text-3xl font-black tracking-tight sm:text-4xl ${primaryText}`}
              >
                Learn MCP from the
                wire to the app.
              </h2>

              <p
                className={`mt-2 text-sm ${secondaryText}`}
              >
                Architecture,
                examples, project
                code and commands in
                one ebook.
              </p>
            </div>

            <div className="w-full md:w-auto">
              <button
                type="button"
                onClick={
                  handleBuyNow
                }
                disabled={
                  !canBuy
                }
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
              >
                {canBuy
                  ? `Get the ebook — ${formatMoney(
                      currentPrice
                    )}`
                  : loadingProduct
                  ? "Loading price..."
                  : "Price unavailable"}

                <ArrowRight
                  size={
                    18
                  }
                />
              </button>

              <ProductError
                compact
              />
            </div>
          </div>

          <p
            className={`mx-auto mt-6 max-w-7xl text-[11px] leading-5 ${mutedText}`}
          >
            This digital book is
            non-refundable. For
            support:{" "}

            <a
              href="mailto:supporttargettrek@gmail.com"
              className="font-bold text-blue-500 underline underline-offset-2"
            >
              supporttargettrek@gmail.com
            </a>
          </p>
        </section>
      </main>

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

      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(0,0,0,.12)] backdrop-blur-xl md:hidden ${border} ${
          isDark
            ? "bg-[#080D14]/95"
            : "bg-white/95"
        }`}
      >
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div className="min-w-0 leading-tight">
            {canBuy &&
              hasMrp && (
                <div
                  className={`text-[10px] ${mutedText}`}
                >
                  <del>
                    {formatMoney(
                      mrp
                    )}
                  </del>

                  {discount >
                    0 && (
                    <span className="ml-2 font-black text-emerald-500">
                      {
                        discount
                      }
                      % OFF
                    </span>
                  )}
                </div>
              )}

            <strong
              className={`block truncate text-lg font-black ${primaryText}`}
            >
              {loadingProduct
                ? "Loading..."
                : canBuy
                ? formatMoney(
                    currentPrice
                  )
                : "Unavailable"}
            </strong>
          </div>

          <button
            type="button"
            onClick={
              handleBuyNow
            }
            disabled={
              !canBuy
            }
            className="inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Get ebook

            <ArrowRight
              size={
                15
              }
            />
          </button>
        </div>

        <ProductError
          compact
        />
      </div>
    </div>
  );
}