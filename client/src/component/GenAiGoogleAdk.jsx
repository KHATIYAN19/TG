// import React, {
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import { Helmet } from "react-helmet";


// import {
//   ArrowRight,
//   BookOpen,
//   Check,
//   ChevronDown,
//   Code2,
//   Database,
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

// const SITE_URL =
//   "https://www.targettrek.in";

// const PAGE_PATH =
//   "/book/genai/google-adk";

// const PAGE_URL =
//   `${SITE_URL}${PAGE_PATH}`;

// const SITE_NAME =
//   "TargetTrek";

// const THEME_KEY =
//   "theme";

// const THEME_EVENT =
//   "targettrek-theme-change";

// const SEO_TITLE =
//   "Google ADK Complete Developer Handbook – AI Agents, RAG, MCP & A2A | TargetTrek";

// const SEO_DESCRIPTION =
//   "Learn Google ADK with a practical developer handbook covering AI agents, tools, RAG, MCP, A2A, multi-agent workflows, sessions, evaluation, observability, security, FastAPI and production deployment.";

// const readTheme = () => {
//   if (
//     typeof window === "undefined"
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

// const CODE_EXAMPLES = [
//   {
//     id: "agent",
//     label: "01 • Agent",
//     title: "Minimal LLM Agent",
//     description:
//       "Start with the core agent primitive before composing larger systems.",
//     code: `from google.adk.agents import Agent

// root_agent = Agent(
//     name="support_agent",
//     model="gemini-flash-latest",
//     instruction="""
//     You are a customer-support assistant.
//     Be concise.
//     Never invent account data.
//     Use tools when account information is required.
//     """,
// )`,
//   },

//   {
//     id: "tool",
//     label: "02 • Tool",
//     title: "Function Calling",
//     description:
//       "Connect an agent to deterministic Python functions and external systems.",
//     code: `from google.adk.agents import Agent

// def get_order_status(order_id: str) -> dict:
//     """Return the status of an order by ID."""

//     if not order_id.strip():
//         return {
//             "ok": False,
//             "error": "order_id is required"
//         }

//     return {
//         "ok": True,
//         "order_id": order_id,
//         "status": "SHIPPED"
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
//     description:
//       "Retrieve relevant evidence and use grounded context for agent responses.",
//     code: `def retrieve(
//     query: str,
//     top_k: int = 5
// ) -> list[dict]:

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
//     description:
//       "Make orchestration explicit when one agent depends on another agent's output.",
//     code: `from google.adk.agents import (
//     Agent,
//     SequentialAgent
// )

// researcher = Agent(
//     name="researcher",
//     model="gemini-flash-latest",
//     instruction="""
//     Research the topic and
//     produce concise notes.
//     """,
//     output_key="research_notes",
// )

// writer = Agent(
//     name="writer",
//     model="gemini-flash-latest",
//     instruction="""
//     Write using the research
//     stored in state.
//     """,
// )

// root_agent = SequentialAgent(
//     name="research_then_write",
//     sub_agents=[
//         researcher,
//         writer,
//     ],
// )`,
//   },
// ];

// const CHAPTERS = [
//   [
//     "01",
//     "Agentic AI Fundamentals",
//     "Agent loops, tools, context, memory, workflows and when agents make sense.",
//   ],
//   [
//     "02",
//     "Google ADK: What It Is & Where It Fits",
//     "Understand ADK, the developer workflow and the Agents CLI.",
//   ],
//   [
//     "03",
//     "Setup, Installation & Authentication",
//     "Install ADK, configure Gemini or Vertex AI and create your first agent.",
//   ],
//   [
//     "04",
//     "Project Structure & Developer Workflow",
//     "Organize agents, services, tests, evaluation datasets and deployment files.",
//   ],
//   [
//     "05",
//     "LlmAgent: The Core Agent Type",
//     "Build LLM-powered agents and understand the decision and tool-use loop.",
//   ],
//   [
//     "06",
//     "Sequential, Parallel & Loop Agents",
//     "Master core workflow agents and practical orchestration patterns.",
//   ],
//   [
//     "07",
//     "Custom Agents & Graph Workflows",
//     "Create advanced control flow when standard workflow agents are not enough.",
//   ],
//   [
//     "08",
//     "Tools & Function Calling",
//     "Connect agents to application logic, APIs, databases and external capabilities.",
//   ],
//   [
//     "09",
//     "Built-in Tools, Search, Files & Toolsets",
//     "Use built-in capabilities and understand toolset-based architectures.",
//   ],
//   [
//     "10",
//     "Callbacks, Plugins & Guardrails",
//     "Observe, intercept, validate, authorize, retry and control agent behavior.",
//   ],
//   [
//     "11",
//     "Sessions, State, Context & Memory",
//     "Understand short-term state, sessions, context and persistent memory.",
//   ],
//   [
//     "12",
//     "RAG: Full Working Pipeline",
//     "Build retrieval-augmented agents with ingestion, embeddings, retrieval and grounding.",
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
//     "Work with streaming events, live interactions, files and multimodal inputs.",
//   ],
//   [
//     "17",
//     "Artifacts & File Handling",
//     "Manage generated files and artifacts safely across agent workflows.",
//   ],
//   [
//     "18",
//     "Evaluation: Datasets, Metrics & Eval-Fix Loop",
//     "Create evaluations, measure behavior and turn failures into regression tests.",
//   ],
//   [
//     "19",
//     "Observability, Tracing & Debugging",
//     "Trace agent runs, inspect tool calls and debug production behavior.",
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
//     "Combine research, RAG, orchestration, synthesis and review into one system.",
//   ],
//   [
//     "24",
//     "Security, Privacy & Reliability",
//     "Handle prompt injection, tool abuse, data leakage, retries and failure modes.",
//   ],
//   [
//     "25",
//     "Structured Output, Schemas & Validation",
//     "Return predictable structured results and validate model-generated data.",
//   ],
//   [
//     "26",
//     "Caching, Context Control & Cost Engineering",
//     "Control token usage, context growth, latency and model costs.",
//   ],
//   [
//     "27",
//     "CLI: Commands You Actually Need",
//     "Practical commands for creating, running, evaluating and deploying agents.",
//   ],
//   [
//     "28",
//     "Testing Strategy for Agentic Systems",
//     "Build unit, integration, failure-injection and behavior-focused tests.",
//   ],
//   [
//     "29",
//     "Observability + Evaluation + Guardrails Pipeline",
//     "Connect telemetry, quality checks, guardrails and continuous improvement.",
//   ],
//   [
//     "30",
//     "Troubleshooting Guide",
//     "Diagnose common setup, model, tool, deployment and runtime problems.",
//   ],
//   [
//     "31",
//     "Production Checklist",
//     "A practical checklist for taking an agent system toward production.",
//   ],
//   [
//     "32",
//     "Developer Cheat Sheets & Reference Architecture",
//     "Quick references, architecture patterns, commands and reusable mental models.",
//   ],
// ];

// const LEARNING_POINTS = [
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

// const PROJECTS = [
//   [
//     Sparkles,
//     "Research Agent",
//     "Build an agent that researches a topic, gathers information and produces a structured result.",
//   ],
//   [
//     Code2,
//     "API Agent",
//     "Connect an AI agent with external APIs and allow it to perform controlled actions.",
//   ],
//   [
//     Layers3,
//     "RAG Agent",
//     "Create an agent that answers questions using your documents and knowledge base.",
//   ],
//   [
//     Users,
//     "Multi-Agent System",
//     "Create specialized agents and orchestrate them into a complete AI workflow.",
//   ],
// ];

// const FLOW_SKILLS = [
//   [
//     "01",
//     "Python + LLM Foundations",
//     "Models, prompts, context",
//     "Python, LLM APIs, prompts, context windows, structured outputs and basic model interaction patterns.",
//   ],
//   [
//     "02",
//     "Agent Fundamentals",
//     "Instructions, state, sessions",
//     "Understand how instructions, model behavior, tools, sessions and state form an agent.",
//   ],
//   [
//     "03",
//     "Tools + Function Calling",
//     "APIs, files, actions",
//     "Give agents controlled access to APIs, databases, files and application actions.",
//   ],
//   [
//     "04",
//     "RAG + Memory",
//     "Retrieval, grounding, context",
//     "Use retrieval for grounded answers while state and memory preserve useful context.",
//   ],
//   [
//     "05",
//     "Multi-Agent + Protocols",
//     "Workflows, MCP, A2A",
//     "Compose specialist agents and connect systems through workflows, MCP and A2A.",
//   ],
//   [
//     "06",
//     "Eval + Observability",
//     "Tests, traces, guardrails",
//     "Evaluate quality, inspect traces, diagnose failures and improve agent behavior.",
//   ],
//   [
//     "07",
//     "Production Engineering",
//     "FastAPI, deployment, security",
//     "Turn prototypes into services with APIs, security, reliability, performance and monitoring.",
//   ],
// ];

// const FAQS = [
//   [
//     "Who is this ebook for?",
//     "It is designed for developers, backend engineers, GenAI learners and software engineers who want a practical path from Google ADK fundamentals to production-oriented agent systems.",
//   ],
//   [
//     "What is covered in the 2nd Edition?",
//     "The handbook contains 32 chapters covering agents, tools, workflow agents, sessions and memory, RAG, MCP, A2A, models, streaming, artifacts, evaluation, observability, deployment, FastAPI, security, testing, performance and production checklists.",
//   ],
//   [
//     "Does the ebook contain code and commands?",
//     "Yes. It follows a concept → flow → code → commands → production notes approach with implementation examples throughout the handbook.",
//   ],
//   [
//     "Is prior Google ADK experience required?",
//     "No. The handbook starts with fundamentals and setup before moving into advanced orchestration, integrations, evaluation and deployment.",
//   ],
//   [
//     "Is this a video course?",
//     "No. It is a developer-focused digital ebook and reference handbook designed to accompany hands-on implementation.",
//   ],
//   [
//     "Is the ebook refundable?",
//     "No. Due to the digital nature of the ebook, all purchases are non-refundable. Please review the contents and FAQ before purchasing.",
//   ],
//   [
//     "How can I get support?",
//     "For purchase or ebook-related issues, contact supporttargettrek@gmail.com.",
//   ],
// ];

// const CHAPTER_GROUPS = [
//   [
//     "FOUNDATIONS",
//     CHAPTERS.slice(
//       0,
//       5
//     ),
//   ],
//   [
//     "ORCHESTRATION & TOOLS",
//     CHAPTERS.slice(
//       5,
//       11
//     ),
//   ],
//   [
//     "INTEGRATIONS",
//     CHAPTERS.slice(
//       11,
//       17
//     ),
//   ],
//   [
//     "PRODUCTION",
//     CHAPTERS.slice(
//       17,
//       25
//     ),
//   ],
//   [
//     "ENGINEERING & REFERENCE",
//     CHAPTERS.slice(25),
//   ],
// ];

// export default function GenAiGoogleAdk() {
//   const GA_MEASUREMENT_ID =
//     "G-5FPEL1W0VB";

//   const BASE_URL =
//     import.meta.env
//       .VITE_BASE_URL ||
//     "http://localhost:5001";

//   const [
//     theme,
//     setTheme,
//   ] = useState(
//     readTheme
//   );

//   const [
//     product,
//     setProduct,
//   ] = useState(null);

//   const [
//     loadingProduct,
//     setLoadingProduct,
//   ] = useState(true);

//   const [
//     productError,
//     setProductError,
//   ] = useState("");

//   const [
//     isCheckoutOpen,
//     setIsCheckoutOpen,
//   ] = useState(false);

//   const [
//     retryCount,
//     setRetryCount,
//   ] = useState(0);

//   const [
//     scrollProgress,
//     setScrollProgress,
//   ] = useState(0);

//   const [
//     activeCode,
//     setActiveCode,
//   ] = useState(0);

//   const [
//     activeSkill,
//     setActiveSkill,
//   ] = useState(null);

//   const [
//     openFaq,
//     setOpenFaq,
//   ] = useState(null);

//   const isDark =
//     theme === "dark";

//   const GOOGLE_ADK_PRICE =
//     product?.price !==
//       null &&
//     product?.price !==
//       undefined &&
//     product?.price !== ""
//       ? Number(
//           product.price
//         )
//       : null;

//   const GOOGLE_ADK_MRP =
//     product?.mrp !== null &&
//     product?.mrp !==
//       undefined &&
//     product?.mrp !== ""
//       ? Number(
//           product.mrp
//         )
//       : null;

//   const GOOGLE_ADK_CURRENCY =
//     product?.currency ||
//     "INR";

//   const hasValidPrice =
//     GOOGLE_ADK_PRICE !==
//       null &&
//     Number.isFinite(
//       GOOGLE_ADK_PRICE
//     ) &&
//     GOOGLE_ADK_PRICE >= 0;

//   const hasMrp =
//     GOOGLE_ADK_MRP !==
//       null &&
//     Number.isFinite(
//       GOOGLE_ADK_MRP
//     ) &&
//     hasValidPrice &&
//     GOOGLE_ADK_MRP >
//       GOOGLE_ADK_PRICE;

//   const canBuy =
//     Boolean(
//       product?._id
//     ) &&
//     hasValidPrice &&
//     !loadingProduct &&
//     !productError;

//   const productName =
//     product?.title ||
//     "Google ADK Complete Developer Handbook – 2nd Edition";

//   const seoImage =
//     product?.coverPageUrl ||
//     product?.coverpageurl ||
//     product?.cover_page_url ||
//     "";

//   const localeByCurrency = {
//     INR: "en-IN",
//     USD: "en-US",
//     GBP: "en-GB",
//     EUR: "en-IE",
//     AUD: "en-AU",
//     CAD: "en-CA",
//   };

//   const formatMoney = (
//     amount
//   ) => {
//     const value =
//       Number(amount);

//     if (
//       !Number.isFinite(
//         value
//       )
//     ) {
//       return "";
//     }

//     try {
//       return new Intl.NumberFormat(
//         localeByCurrency[
//           GOOGLE_ADK_CURRENCY
//         ] || "en",
//         {
//           style:
//             "currency",
//           currency:
//             GOOGLE_ADK_CURRENCY,
//           minimumFractionDigits:
//             Number.isInteger(
//               value
//             )
//               ? 0
//               : 2,
//           maximumFractionDigits: 2,
//         }
//       ).format(value);
//     } catch {
//       return `${GOOGLE_ADK_CURRENCY} ${value}`;
//     }
//   };

//   useEffect(() => {
//     const handleThemeChange =
//       (event) => {
//         const newTheme =
//           event?.detail
//             ?.theme;

//         if (
//           newTheme ===
//             "dark" ||
//           newTheme ===
//             "light"
//         ) {
//           setTheme(
//             newTheme
//           );
//         }
//       };

//     const handleStorage =
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

//     setTheme(
//       readTheme()
//     );

//     window.addEventListener(
//       THEME_EVENT,
//       handleThemeChange
//     );

//     window.addEventListener(
//       "storage",
//       handleStorage
//     );

//     return () => {
//       window.removeEventListener(
//         THEME_EVENT,
//         handleThemeChange
//       );

//       window.removeEventListener(
//         "storage",
//         handleStorage
//       );
//     };
//   }, []);

//   useEffect(() => {
//     const params =
//       new URLSearchParams(
//         window.location.search
//       );

//     const referralCode =
//       (
//         params.get(
//           "referralCode"
//         ) ||
//         params.get(
//           "ref"
//         ) ||
//         ""
//       ).trim();

//     if (
//       referralCode
//     ) {
//       window.localStorage.setItem(
//         "referralCode",
//         referralCode
//       );
//     }
//   }, []);

//   useEffect(() => {
//     const controller =
//       new AbortController();

//     const fetchProduct =
//       async () => {
//         try {
//           setLoadingProduct(
//             true
//           );

//           setProductError(
//             ""
//           );

//           const response =
//             await fetch(
//               `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(
//                 PAGE_PATH
//               )}`,
//               {
//                 method:
//                   "GET",
//                 cache:
//                   "no-store",
//                 headers: {
//                   Accept:
//                     "application/json",
//                 },
//                 signal:
//                   controller.signal,
//               }
//             );

//           const result =
//             await response
//               .json()
//               .catch(
//                 () => null
//               );

//           if (
//             !response.ok ||
//             !result?.success ||
//             !result?.data
//           ) {
//             throw new Error(
//               result?.error
//                 ?.message ||
//                 result?.message ||
//                 "Unable to load ebook details."
//             );
//           }

//           const data =
//             result.data;

//           const price =
//             Number(
//               data.price
//             );

//           if (
//             !data._id ||
//             data.price ===
//               null ||
//             data.price ===
//               undefined ||
//             String(
//               data.price
//             ).trim() ===
//               "" ||
//             !Number.isFinite(
//               price
//             ) ||
//             price < 0
//           ) {
//             throw new Error(
//               "The ebook price is currently unavailable. Please try again."
//             );
//           }

//           setProduct(
//             data
//           );
//         } catch (
//           error
//         ) {
//           if (
//             error?.name ===
//             "AbortError"
//           ) {
//             return;
//           }

//           console.error(
//             "Failed to fetch Google ADK ebook:",
//             error
//           );

//           setProduct(
//             null
//           );

//           setProductError(
//             error?.message ||
//               "Unable to load ebook details."
//           );
//         } finally {
//           if (
//             !controller
//               .signal
//               .aborted
//           ) {
//             setLoadingProduct(
//               false
//             );
//           }
//         }
//       };

//     fetchProduct();

//     return () =>
//       controller.abort();
//   }, [
//     BASE_URL,
//     retryCount,
//   ]);

//   useEffect(() => {
//     if (
//       typeof window ===
//       "undefined"
//     ) {
//       return;
//     }

//     window.dataLayer =
//       window.dataLayer ||
//       [];

//     window.gtag =
//       window.gtag ||
//       function gtag() {
//         window.dataLayer.push(
//           arguments
//         );
//       };

//     const existingScript =
//       document.querySelector(
//         `script[data-google-analytics="${GA_MEASUREMENT_ID}"]`
//       );

//     if (
//       !existingScript
//     ) {
//       const script =
//         document.createElement(
//           "script"
//         );

//       script.async =
//         true;

//       script.src =
//         `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;

//       script.setAttribute(
//         "data-google-analytics",
//         GA_MEASUREMENT_ID
//       );

//       document.head.appendChild(
//         script
//       );
//     }

//     window.gtag(
//       "js",
//       new Date()
//     );

//     window.gtag(
//       "config",
//       GA_MEASUREMENT_ID,
//       {
//         page_title:
//           SEO_TITLE,
//         page_location:
//           window.location.href,
//       }
//     );
//   }, []);

//   useEffect(() => {
//     const updateProgress =
//       () => {
//         const total =
//           document
//             .documentElement
//             .scrollHeight -
//           window.innerHeight;

//         const value =
//           total > 0
//             ? (
//                 window.scrollY /
//                 total
//               ) *
//               100
//             : 0;

//         setScrollProgress(
//           Math.min(
//             100,
//             Math.max(
//               0,
//               value
//             )
//           )
//         );
//       };

//     updateProgress();

//     window.addEventListener(
//       "scroll",
//       updateProgress,
//       {
//         passive: true,
//       }
//     );

//     return () => {
//       window.removeEventListener(
//         "scroll",
//         updateProgress
//       );
//     };
//   }, []);

//   const handlePurchase = (
//     source =
//       "unknown"
//   ) => {
//     if (
//       !canBuy
//     ) {
//       return;
//     }

//     try {
//       window.dataLayer =
//         window.dataLayer ||
//         [];

//       window.dataLayer.push(
//         {
//           event:
//             "adk_purchase_click",
//           product:
//             product.slug ||
//             "google_adk_handbook_2nd_edition",
//           source,
//           bookId:
//             product._id,
//           price:
//             GOOGLE_ADK_PRICE,
//           currency:
//             GOOGLE_ADK_CURRENCY,
//         }
//       );

//       if (
//         typeof window.gtag ===
//         "function"
//       ) {
//         window.gtag(
//           "event",
//           "begin_checkout",
//           {
//             currency:
//               GOOGLE_ADK_CURRENCY,
//             value:
//               GOOGLE_ADK_PRICE,
//             source,
//             items: [
//               {
//                 item_id:
//                   product._id,
//                 item_name:
//                   productName,
//                 price:
//                   GOOGLE_ADK_PRICE,
//                 quantity: 1,
//               },
//             ],
//           }
//         );
//       }
//     } catch (
//       error
//     ) {
//       console.warn(
//         "Purchase analytics failed:",
//         error
//       );
//     }

//     setIsCheckoutOpen(
//       true
//     );
//   };

//   const scrollToContents =
//     () => {
//       document
//         .getElementById(
//           "contents"
//         )
//         ?.scrollIntoView({
//           behavior:
//             "smooth",
//         });
//     };

//   const retryProduct =
//     () => {
//       setRetryCount(
//         (count) =>
//           count + 1
//       );
//     };

//   const structuredData =
//     useMemo(() => {
//       const graph = [
//         {
//           "@type":
//             "Organization",
//           "@id":
//             `${SITE_URL}/#organization`,
//           name:
//             SITE_NAME,
//           url:
//             SITE_URL,
//           email:
//             "supporttargettrek@gmail.com",
//         },

//         {
//           "@type":
//             "WebSite",
//           "@id":
//             `${SITE_URL}/#website`,
//           name:
//             SITE_NAME,
//           url:
//             SITE_URL,
//           publisher: {
//             "@id":
//               `${SITE_URL}/#organization`,
//           },
//         },

//         {
//           "@type":
//             "WebPage",
//           "@id":
//             `${PAGE_URL}#webpage`,
//           name:
//             SEO_TITLE,
//           url:
//             PAGE_URL,
//           description:
//             SEO_DESCRIPTION,
//           isPartOf: {
//             "@id":
//               `${SITE_URL}/#website`,
//           },
//           about: {
//             "@id":
//               `${PAGE_URL}#book`,
//           },
//         },

//         {
//           "@type":
//             "BreadcrumbList",
//           "@id":
//             `${PAGE_URL}#breadcrumbs`,
//           itemListElement: [
//             {
//               "@type":
//                 "ListItem",
//               position: 1,
//               name:
//                 "TargetTrek",
//               item:
//                 SITE_URL,
//             },
//             {
//               "@type":
//                 "ListItem",
//               position: 2,
//               name:
//                 "Books",
//               item:
//                 `${SITE_URL}/books`,
//             },
//             {
//               "@type":
//                 "ListItem",
//               position: 3,
//               name:
//                 "Google ADK Complete Developer Handbook",
//               item:
//                 PAGE_URL,
//             },
//           ],
//         },

//         {
//           "@type":
//             "Book",
//           "@id":
//             `${PAGE_URL}#book`,
//           name:
//             productName,
//           description:
//             SEO_DESCRIPTION,
//           bookEdition:
//             product?.edition ||
//             "2nd Edition",
//           inLanguage:
//             product?.language ||
//             "English",
//           url:
//             PAGE_URL,
//           publisher: {
//             "@id":
//               `${SITE_URL}/#organization`,
//           },
//           ...(seoImage
//             ? {
//                 image:
//                   seoImage,
//               }
//             : {}),
//         },

//         {
//           "@type":
//             "FAQPage",
//           "@id":
//             `${PAGE_URL}#faq`,
//           mainEntity:
//             FAQS.map(
//               ([
//                 question,
//                 answer,
//               ]) => ({
//                 "@type":
//                   "Question",
//                 name:
//                   question,
//                 acceptedAnswer:
//                   {
//                     "@type":
//                       "Answer",
//                     text:
//                       answer,
//                   },
//               })
//             ),
//         },
//       ];

//       if (
//         canBuy
//       ) {
//         graph.push({
//           "@type":
//             "Product",
//           "@id":
//             `${PAGE_URL}#product`,
//           name:
//             productName,
//           description:
//             SEO_DESCRIPTION,
//           category:
//             "Developer Ebook",
//           url:
//             PAGE_URL,
//           brand: {
//             "@type":
//               "Brand",
//             name:
//               SITE_NAME,
//           },
//           ...(seoImage
//             ? {
//                 image: [
//                   seoImage,
//                 ],
//               }
//             : {}),
//           offers: {
//             "@type":
//               "Offer",
//             url:
//               PAGE_URL,
//             price:
//               GOOGLE_ADK_PRICE,
//             priceCurrency:
//               GOOGLE_ADK_CURRENCY,
//             availability:
//               "https://schema.org/InStock",
//             itemCondition:
//               "https://schema.org/NewCondition",
//             seller: {
//               "@id":
//                 `${SITE_URL}/#organization`,
//             },
//           },
//         });
//       }

//       return {
//         "@context":
//           "https://schema.org",
//         "@graph":
//           graph,
//       };
//     }, [
//       canBuy,
//       GOOGLE_ADK_CURRENCY,
//       GOOGLE_ADK_PRICE,
//       product?.edition,
//       product?.language,
//       productName,
//       seoImage,
//     ]);

//   const pageBg =
//     isDark
//       ? "bg-[#080D14]"
//       : "bg-[#F7FAFC]";

//   const alternateBg =
//     isDark
//       ? "bg-[#0B111A]"
//       : "bg-white";

//   const card =
//     isDark
//       ? "border-slate-800 bg-[#101720]"
//       : "border-slate-200 bg-white";

//   const softCard =
//     isDark
//       ? "border-slate-800 bg-[#0C131C]"
//       : "border-slate-200 bg-slate-50";

//   const primaryText =
//     isDark
//       ? "text-white"
//       : "text-slate-950";

//   const secondaryText =
//     isDark
//       ? "text-slate-400"
//       : "text-slate-600";

//   const mutedText =
//     isDark
//       ? "text-slate-500"
//       : "text-slate-500";

//   const border =
//     isDark
//       ? "border-slate-800"
//       : "border-slate-200";

//   const sectionLabel =
//     (text) => (
//       <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-500 sm:text-sm">
//         {text}
//       </p>
//     );

//   const purchaseButton =
//     `
//       inline-flex
//       min-h-[48px]
//       items-center
//       justify-center
//       gap-2
//       rounded-xl
//       bg-blue-600
//       px-5
//       py-3
//       text-sm
//       font-black
//       text-white
//       shadow-lg
//       shadow-blue-600/15
//       transition
//       hover:-translate-y-0.5
//       hover:bg-blue-700
//       disabled:cursor-not-allowed
//       disabled:opacity-50
//       disabled:hover:translate-y-0
//       disabled:hover:bg-blue-600
//       sm:px-6
//     `;

//   const PurchaseError = ({
//     compact = false,
//   }) => {
//     if (
//       !productError
//     ) {
//       return null;
//     }

//     return (
//       <div
//         role="alert"
//         className={`
//           rounded-xl
//           border
//           ${
//             isDark
//               ? "border-red-900/60 bg-red-950/20 text-red-300"
//               : "border-red-200 bg-red-50 text-red-700"
//           }
//           ${
//             compact
//               ? "mt-2 px-3 py-2 text-[11px]"
//               : "mt-4 p-4 text-sm"
//           }
//         `}
//       >
//         <span>
//           {productError}
//         </span>

//         <button
//           type="button"
//           onClick={
//             retryProduct
//           }
//           className="ml-2 font-black underline underline-offset-2"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   };

//   return (
//     <>
//       <Helmet>
//         <title>
//           {SEO_TITLE}
//         </title>

//         <meta
//           name="description"
//           content={
//             SEO_DESCRIPTION
//           }
//         />

//         <meta
//           name="keywords"
//           content="Google ADK ebook, Google Agent Development Kit, Google ADK tutorial, Google ADK agents, AI agents book, agentic AI, multi agent systems, RAG, MCP, model context protocol, A2A, Gemini agents, Vertex AI agents, GenAI interview preparation"
//         />

//         <meta
//           name="author"
//           content={
//             SITE_NAME
//           }
//         />

//         <meta
//           name="robots"
//           content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
//         />

//         <meta
//           name="googlebot"
//           content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
//         />

//         <link
//           rel="canonical"
//           href={
//             PAGE_URL
//           }
//         />

//         <meta
//           name="theme-color"
//           content={
//             isDark
//               ? "#080D14"
//               : "#ffffff"
//           }
//         />

//         <meta
//           property="og:type"
//           content="website"
//         />

//         <meta
//           property="og:site_name"
//           content={
//             SITE_NAME
//           }
//         />

//         <meta
//           property="og:locale"
//           content="en_IN"
//         />

//         <meta
//           property="og:title"
//           content={
//             SEO_TITLE
//           }
//         />

//         <meta
//           property="og:description"
//           content={
//             SEO_DESCRIPTION
//           }
//         />

//         <meta
//           property="og:url"
//           content={
//             PAGE_URL
//           }
//         />

//        {seoImage && (
//   <meta
//     property="og:image"
//     content={seoImage}
//   />
// )}

// {seoImage && (
//   <meta
//     property="og:image:alt"
//     content={`${productName} ebook cover`}
//   />
// )}

//         <meta
//           name="twitter:card"
//           content={
//             seoImage
//               ? "summary_large_image"
//               : "summary"
//           }
//         />

//         <meta
//           name="twitter:title"
//           content={
//             SEO_TITLE
//           }
//         />

//         <meta
//           name="twitter:description"
//           content={
//             SEO_DESCRIPTION
//           }
//         />

//         {seoImage && (
//           <meta
//             name="twitter:image"
//             content={
//               seoImage
//             }
//           />
//         )}

//         <script
//           type="application/ld+json"
//         >
//           {JSON.stringify(
//             structuredData
//           )}
//         </script>
//       </Helmet>

//       <main
//         className={`
//           min-h-screen
//           w-full
//           overflow-x-hidden
//           pb-20
//           pt-16
//           transition-colors
//           duration-300
//           md:pb-0
//           ${pageBg}
//           ${primaryText}
//         `}
//       >
//         <style>{`
//           html {
//             scroll-behavior: smooth;
//           }

//           @keyframes adk-book-float {
//             0%, 100% {
//               transform: translateY(0) rotate(-2deg);
//             }

//             50% {
//               transform: translateY(-8px) rotate(-1deg);
//             }
//           }

//           .adk-book-float {
//             animation: adk-book-float 5s ease-in-out infinite;
//           }

//           @media (prefers-reduced-motion: reduce) {
//             html {
//               scroll-behavior: auto;
//             }

//             .adk-book-float {
//               animation: none;
//             }
//           }
//         `}</style>

//         {/* Scroll progress */}

//         <div
//           className={`
//             fixed
//             left-0
//             right-0
//             top-16
//             z-40
//             h-[2px]
//             ${
//               isDark
//                 ? "bg-slate-900"
//                 : "bg-slate-200"
//             }
//           `}
//         >
//           <div
//             className="h-full bg-blue-500 transition-[width] duration-100"
//             style={{
//               width:
//                 `${scrollProgress}%`,
//             }}
//           />
//         </div>

//         {/* Hero */}

//         <section
//           className={`
//             relative
//             overflow-hidden
//             border-b
//             ${border}
//             ${alternateBg}
//           `}
//         >
//           <div className="pointer-events-none absolute inset-0">
//             <div
//               className={`
//                 absolute
//                 -left-40
//                 -top-40
//                 h-[480px]
//                 w-[480px]
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
//                 -right-48
//                 top-10
//                 h-[540px]
//                 w-[540px]
//                 rounded-full
//                 blur-[140px]
//                 ${
//                   isDark
//                     ? "bg-indigo-900/10"
//                     : "bg-indigo-100/60"
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
//             <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
//               <div>
//                 <div
//                   className={`
//                     inline-flex
//                     items-center
//                     gap-2
//                     rounded-full
//                     border
//                     px-3.5
//                     py-2
//                     text-xs
//                     font-black
//                     ${
//                       isDark
//                         ? "border-blue-900/60 bg-blue-950/30 text-blue-300"
//                         : "border-blue-200 bg-blue-50 text-blue-700"
//                     }
//                   `}
//                 >
//                   <Sparkles
//                     size={
//                       15
//                     }
//                   />

//                   2nd Edition •
//                   Developer Handbook
//                 </div>

//                 <h1
//                   className={`
//                     mt-6
//                     max-w-3xl
//                     text-4xl
//                     font-black
//                     leading-[1.04]
//                     tracking-tight
//                     sm:text-5xl
//                     lg:text-6xl
//                     xl:text-7xl
//                     ${primaryText}
//                   `}
//                 >
//                   Learn Google ADK
//                   by building{" "}

//                   <span className="text-blue-500">
//                     real AI agents.
//                   </span>
//                 </h1>

//                 <p
//                   className={`
//                     mt-6
//                     max-w-2xl
//                     text-base
//                     leading-8
//                     sm:text-lg
//                     ${secondaryText}
//                   `}
//                 >
//                   A practical,
//                   code-first developer
//                   handbook that takes
//                   you from your first
//                   Google ADK agent to
//                   tools, RAG, MCP,
//                   A2A, multi-agent
//                   workflows,
//                   evaluation and
//                   production
//                   deployment.
//                 </p>

//                 <div className="mt-7 flex flex-wrap gap-2.5">
//                   {[
//                     "32 Chapters",
//                     "Practical Code",
//                     "RAG + MCP + A2A",
//                     "Production Topics",
//                   ].map(
//                     (
//                       item
//                     ) => (
//                       <span
//                         key={
//                           item
//                         }
//                         className={`
//                           rounded-full
//                           border
//                           px-3
//                           py-1.5
//                           text-xs
//                           font-bold
//                           sm:px-4
//                           sm:py-2
//                           sm:text-sm
//                           ${card}
//                         `}
//                       >
//                         {
//                           item
//                         }
//                       </span>
//                     )
//                   )}
//                 </div>

//                 <div className="mt-8 flex flex-col gap-3 sm:flex-row">
//                   <button
//                     type="button"
//                     onClick={() =>
//                       handlePurchase(
//                         "hero"
//                       )
//                     }
//                     disabled={
//                       !canBuy
//                     }
//                     className={
//                       purchaseButton
//                     }
//                   >
//                     {loadingProduct
//                       ? "Loading price..."
//                       : canBuy
//                       ? "Get Instant PDF Access"
//                       : "Price unavailable"}

//                     {canBuy && (
//                       <span className="flex items-center gap-2">
//                         {hasMrp && (
//                           <span className="text-xs text-blue-200 line-through sm:text-sm">
//                             {formatMoney(
//                               GOOGLE_ADK_MRP
//                             )}
//                           </span>
//                         )}

//                         <span>
//                           {formatMoney(
//                             GOOGLE_ADK_PRICE
//                           )}
//                         </span>
//                       </span>
//                     )}

//                     <ArrowRight
//                       size={
//                         17
//                       }
//                     />
//                   </button>

//                   <button
//                     type="button"
//                     onClick={
//                       scrollToContents
//                     }
//                     className={`
//                       inline-flex
//                       min-h-[48px]
//                       items-center
//                       justify-center
//                       rounded-xl
//                       border
//                       px-5
//                       py-3
//                       text-sm
//                       font-black
//                       transition
//                       ${
//                         isDark
//                           ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-700 hover:bg-slate-800"
//                           : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50"
//                       }
//                     `}
//                   >
//                     See What's Inside
//                   </button>
//                 </div>

//                 <PurchaseError />

//                 <div
//                   className={`
//                     mt-5
//                     flex
//                     flex-wrap
//                     gap-x-5
//                     gap-y-2
//                     text-xs
//                     sm:text-sm
//                     ${mutedText}
//                   `}
//                 >
//                   <span>
//                     ✓ One-time payment
//                   </span>

//                   <span>
//                     ✓ Instant digital access
//                   </span>

//                   <span>
//                     ✓ No subscription
//                   </span>
//                 </div>
//               </div>

//               {/* Book visual */}

//               <div className="flex justify-center lg:justify-end">
//                 <div className="relative w-full max-w-[330px] sm:max-w-[380px]">
//                   <div className="absolute -inset-10 rounded-full bg-blue-500/10 blur-3xl" />

//                   <div
//                     className="
//                       adk-book-float
//                       relative
//                       overflow-hidden
//                       rounded-r-3xl
//                       rounded-l-md
//                       border
//                       border-blue-400/20
//                       bg-gradient-to-br
//                       from-[#173d78]
//                       via-[#0d63c9]
//                       to-[#37238d]
//                       p-7
//                       shadow-2xl
//                       sm:p-8
//                     "
//                   >
//                     <div className="absolute left-0 top-0 h-full w-3 bg-black/20" />

//                     <div className="flex min-h-[430px] flex-col justify-between sm:min-h-[500px]">
//                       <div>
//                         <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
//                           <Terminal
//                             size={
//                               15
//                             }
//                           />

//                           Developer Handbook
//                         </div>

//                         <div className="mt-7 h-px bg-white/20" />

//                         <p className="mt-9 text-xs font-black uppercase tracking-[0.2em] text-blue-100">
//                           2nd Edition
//                         </p>

//                         <h2 className="mt-4 text-3xl font-black leading-[1.05] text-white sm:text-4xl">
//                           Google
//                           <br />
//                           ADK
//                           <br />
//                           Complete
//                           <br />
//                           Developer
//                           <br />
//                           Handbook
//                         </h2>

//                         <p className="mt-5 max-w-[250px] text-sm leading-6 text-blue-100">
//                           From first
//                           agent to RAG,
//                           MCP, A2A,
//                           evaluation,
//                           observability
//                           and production
//                           deployment.
//                         </p>
//                       </div>

//                       <div>
//                         <div className="flex flex-wrap gap-2">
//                           {[
//                             "Agents",
//                             "RAG",
//                             "MCP",
//                             "A2A",
//                             "Production",
//                           ].map(
//                             (
//                               tag
//                             ) => (
//                               <span
//                                 key={
//                                   tag
//                                 }
//                                 className="rounded-lg bg-white/10 px-2.5 py-1.5 text-[10px] font-bold text-white"
//                               >
//                                 {
//                                   tag
//                                 }
//                               </span>
//                             )
//                           )}
//                         </div>

//                         <p className="mt-5 text-xs font-bold text-blue-100">
//                           Practical •
//                           Code-first •
//                           Production-aware
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   <div
//                     className={`
//                       relative
//                       mx-auto
//                       -mt-5
//                       w-[calc(100%-32px)]
//                       rounded-2xl
//                       border
//                       px-4
//                       py-3
//                       text-center
//                       shadow-xl
//                       sm:absolute
//                       sm:-bottom-5
//                       sm:-right-5
//                       sm:mt-0
//                       sm:w-auto
//                       sm:text-left
//                       ${card}
//                     `}
//                   >
//                     <p
//                       className={`text-[10px] font-black uppercase tracking-wider ${mutedText}`}
//                     >
//                       Current Price
//                     </p>

//                     <div className="mt-1 flex items-center justify-center gap-2 sm:justify-start">
//                       {loadingProduct ? (
//                         <span
//                           className={`text-sm font-bold ${secondaryText}`}
//                         >
//                           Loading...
//                         </span>
//                       ) : canBuy ? (
//                         <>
//                           {hasMrp && (
//                             <span
//                               className={`text-sm font-bold line-through ${mutedText}`}
//                             >
//                               {formatMoney(
//                                 GOOGLE_ADK_MRP
//                               )}
//                             </span>
//                           )}

//                           <span className="text-2xl font-black text-blue-500 sm:text-3xl">
//                             {formatMoney(
//                               GOOGLE_ADK_PRICE
//                             )}
//                           </span>
//                         </>
//                       ) : (
//                         <span className="text-sm font-bold text-red-500">
//                           Price unavailable
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Quick facts */}

//         <section
//           className={`border-b ${border} ${alternateBg}`}
//         >
//           <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
//             {[
//               [
//                 "32 Chapters",
//                 "Structured learning path",
//               ],
//               [
//                 "Code-First",
//                 "Commands + implementation",
//               ],
//               [
//                 "RAG / MCP / A2A",
//                 "Modern integrations",
//               ],
//               [
//                 "Production",
//                 "Evaluation + deployment",
//               ],
//             ].map(
//               ([
//                 title,
//                 description,
//               ]) => (
//                 <div
//                   key={
//                     title
//                   }
//                   className={`
//                     border-b
//                     p-4
//                     text-center
//                     sm:p-6
//                     md:border-b-0
//                     md:border-r
//                     md:last:border-r-0
//                     ${border}
//                   `}
//                 >
//                   <p
//                     className={`text-sm font-black sm:text-base ${primaryText}`}
//                   >
//                     {
//                       title
//                     }
//                   </p>

//                   <p
//                     className={`mt-1 text-xs leading-5 sm:text-sm ${mutedText}`}
//                   >
//                     {
//                       description
//                     }
//                   </p>
//                 </div>
//               )
//             )}
//           </div>
//         </section>

//         {/* Value */}

//         <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
//           <div className="grid items-center gap-10 lg:grid-cols-[.82fr_1.18fr] lg:gap-14">
//             <div>
//               {sectionLabel(
//                 "Built for developers"
//               )}

//               <h2
//                 className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
//               >
//                 Stop jumping between
//                 scattered concepts.
//               </h2>

//               <p
//                 className={`mt-5 max-w-xl text-base leading-8 sm:text-lg ${secondaryText}`}
//               >
//                 Agent development
//                 involves tools,
//                 orchestration,
//                 memory, RAG,
//                 protocols,
//                 evaluation and
//                 deployment. This
//                 handbook organizes
//                 those topics into one
//                 developer-focused
//                 learning path.
//               </p>
//             </div>

//             <div className="grid gap-4 sm:grid-cols-2">
//               {[
//                 [
//                   BookOpen,
//                   "Structured path",
//                   "Move from fundamentals to advanced topics instead of learning isolated concepts.",
//                 ],
//                 [
//                   Code2,
//                   "Implementation focused",
//                   "Follow concepts with flows, code, commands and practical development context.",
//                 ],
//                 [
//                   Network,
//                   "Connect the pieces",
//                   "Understand how agents, tools, RAG, MCP, A2A and APIs fit together.",
//                 ],
//                 [
//                   Rocket,
//                   "Production aware",
//                   "Explore evaluation, observability, security, testing and deployment.",
//                 ],
//               ].map(
//                 ([
//                   Icon,
//                   title,
//                   description,
//                 ]) => (
//                   <div
//                     key={
//                       title
//                     }
//                     className={`
//                       rounded-2xl
//                       border
//                       p-5
//                       transition
//                       hover:-translate-y-1
//                       sm:p-6
//                       ${card}
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
//                       <Icon
//                         size={
//                           21
//                         }
//                       />
//                     </div>

//                     <h3
//                       className={`mt-5 text-lg font-black ${primaryText}`}
//                     >
//                       {
//                         title
//                       }
//                     </h3>

//                     <p
//                       className={`mt-2 text-sm leading-7 ${secondaryText}`}
//                     >
//                       {
//                         description
//                       }
//                     </p>
//                   </div>
//                 )
//               )}
//             </div>
//           </div>
//         </section>

//         {/* Documentation comparison */}

//         <section
//           className={`border-y py-16 sm:py-20 lg:py-24 ${border} ${alternateBg}`}
//         >
//           <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
//             <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
//               <div>
//                 {sectionLabel(
//                   "The handbook approach"
//                 )}

//                 <h2
//                   className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
//                 >
//                   A structured path
//                   alongside official
//                   documentation.
//                 </h2>

//                 <p
//                   className={`mt-5 text-base leading-8 sm:text-lg ${secondaryText}`}
//                 >
//                   Official
//                   documentation remains
//                   an important source
//                   of truth. The
//                   handbook focuses on
//                   organizing the
//                   developer journey
//                   from fundamentals
//                   through
//                   implementation and
//                   production topics.
//                 </p>
//               </div>

//               <div
//                 className={`overflow-hidden rounded-2xl border ${softCard}`}
//               >
//                 <div
//                   className={`grid grid-cols-2 border-b ${border}`}
//                 >
//                   <div
//                     className={`p-4 text-xs font-black sm:p-5 sm:text-sm ${mutedText}`}
//                   >
//                     Learning challenge
//                   </div>

//                   <div className="p-4 text-xs font-black text-blue-500 sm:p-5 sm:text-sm">
//                     Handbook approach
//                   </div>
//                 </div>

//                 {[
//                   [
//                     "Where do I start?",
//                     "Fundamentals → setup → first agent",
//                   ],
//                   [
//                     "How do concepts connect?",
//                     "Concept → flow → code",
//                   ],
//                   [
//                     "What comes after agents?",
//                     "Tools → workflows → RAG → protocols",
//                   ],
//                   [
//                     "How do I approach production?",
//                     "Evaluation → observability → security → deployment",
//                   ],
//                 ].map(
//                   ([
//                     left,
//                     right,
//                   ]) => (
//                     <div
//                       key={
//                         left
//                       }
//                       className={`grid grid-cols-2 border-b last:border-b-0 ${border}`}
//                     >
//                       <div
//                         className={`p-4 text-xs leading-6 sm:p-5 sm:text-sm ${mutedText}`}
//                       >
//                         {
//                           left
//                         }
//                       </div>

//                       <div
//                         className={`p-4 text-xs font-semibold leading-6 sm:p-5 sm:text-sm ${secondaryText}`}
//                       >
//                         {
//                           right
//                         }
//                       </div>
//                     </div>
//                   )
//                 )}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* What you learn */}

//         <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
//           <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:gap-14">
//             <div>
//               {sectionLabel(
//                 "What you learn"
//               )}

//               <h2
//                 className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
//               >
//                 One handbook for the
//                 full agent lifecycle.
//               </h2>

//               <p
//                 className={`mt-5 leading-8 ${secondaryText}`}
//               >
//                 Start with the mental
//                 model and setup. Then
//                 move into
//                 orchestration,
//                 integrations,
//                 evaluation,
//                 operations and
//                 production.
//               </p>

//               <button
//                 type="button"
//                 onClick={() =>
//                   handlePurchase(
//                     "learning_section"
//                   )
//                 }
//                 disabled={
//                   !canBuy
//                 }
//                 className={`${purchaseButton} mt-7`}
//               >
//                 {loadingProduct
//                   ? "Loading price..."
//                   : canBuy
//                   ? "Get Instant Access"
//                   : "Price unavailable"}

//                 <ArrowRight
//                   size={
//                     17
//                   }
//                 />
//               </button>

//               <PurchaseError />
//             </div>

//             <div className="grid gap-3 sm:grid-cols-2">
//               {LEARNING_POINTS.map(
//                 (
//                   item
//                 ) => (
//                   <div
//                     key={
//                       item
//                     }
//                     className={`flex gap-3 rounded-2xl border p-4 ${card}`}
//                   >
//                     <span
//                       className={`
//                         mt-0.5
//                         flex
//                         h-5
//                         w-5
//                         shrink-0
//                         items-center
//                         justify-center
//                         rounded-full
//                         ${
//                           isDark
//                             ? "bg-blue-950/50 text-blue-300"
//                             : "bg-blue-100 text-blue-600"
//                         }
//                       `}
//                     >
//                       <Check
//                         size={
//                           12
//                         }
//                         strokeWidth={
//                           3
//                         }
//                       />
//                     </span>

//                     <p
//                       className={`text-sm font-semibold leading-6 ${secondaryText}`}
//                     >
//                       {item}
//                     </p>
//                   </div>
//                 )
//               )}
//             </div>
//           </div>
//         </section>

//         {/* Topics */}

//         <section
//           className={`border-y py-16 sm:py-20 lg:py-24 ${border} ${alternateBg}`}
//         >
//           <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//             <div className="mx-auto max-w-3xl text-center">
//               {sectionLabel(
//                 "What's inside"
//               )}

//               <h2
//                 className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
//               >
//                 Topics developers
//                 actually need.
//               </h2>

//               <p
//                 className={`mt-4 leading-7 ${secondaryText}`}
//               >
//                 Go from core agent
//                 concepts to
//                 production
//                 engineering without
//                 treating each topic as
//                 an isolated idea.
//               </p>
//             </div>

//             <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//               {[
//                 [
//                   Terminal,
//                   "Agents",
//                   "LlmAgent, custom agents and agent behavior.",
//                 ],
//                 [
//                   Zap,
//                   "Orchestration",
//                   "Sequential, parallel, loop and graph workflows.",
//                 ],
//                 [
//                   Database,
//                   "RAG",
//                   "Retrieval, grounding, ingestion and knowledge systems.",
//                 ],
//                 [
//                   Network,
//                   "Protocols",
//                   "MCP and A2A integration patterns.",
//                 ],
//                 [
//                   Search,
//                   "Tools",
//                   "Function calling, APIs, files and toolsets.",
//                 ],
//                 [
//                   TestTube,
//                   "Evaluation",
//                   "Datasets, metrics and eval-fix workflows.",
//                 ],
//                 [
//                   Server,
//                   "Deployment",
//                   "Runtime, Cloud Run, GKE and REST APIs.",
//                 ],
//                 [
//                   Lock,
//                   "Security",
//                   "Privacy, reliability, guardrails and failure modes.",
//                 ],
//               ].map(
//                 ([
//                   Icon,
//                   title,
//                   description,
//                 ]) => (
//                   <div
//                     key={
//                       title
//                     }
//                     className={`rounded-2xl border p-5 transition hover:-translate-y-1 sm:p-6 ${softCard}`}
//                   >
//                     <div
//                       className={`
//                         flex
//                         h-10
//                         w-10
//                         items-center
//                         justify-center
//                         rounded-xl
//                         ${
//                           isDark
//                             ? "bg-slate-800 text-blue-300"
//                             : "bg-blue-50 text-blue-600"
//                         }
//                       `}
//                     >
//                       <Icon
//                         size={
//                           20
//                         }
//                       />
//                     </div>

//                     <h3
//                       className={`mt-5 text-lg font-black ${primaryText}`}
//                     >
//                       {
//                         title
//                       }
//                     </h3>

//                     <p
//                       className={`mt-2 text-sm leading-6 ${secondaryText}`}
//                     >
//                       {
//                         description
//                       }
//                     </p>
//                   </div>
//                 )
//               )}
//             </div>
//           </div>
//         </section>

//         {/* Projects */}

//         <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
//           {sectionLabel(
//             "Build with the concepts"
//           )}

//           <h2
//             className={`mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
//           >
//             Learn by thinking in real
//             agent systems.
//           </h2>

//           <p
//             className={`mt-5 max-w-3xl leading-8 ${secondaryText}`}
//           >
//             The handbook includes
//             patterns around research
//             agents, API agents, RAG
//             systems and multi-agent
//             architectures.
//           </p>

//           <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//             {PROJECTS.map(
//               ([
//                 Icon,
//                 title,
//                 description,
//               ], index) => (
//                 <div
//                   key={
//                     title
//                   }
//                   className={`group rounded-2xl border p-5 transition hover:-translate-y-1 sm:p-6 ${card}`}
//                 >
//                   <div className="flex items-center justify-between">
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
//                       <Icon
//                         size={
//                           21
//                         }
//                       />
//                     </div>

//                     <span
//                       className={`font-mono text-xs font-black ${mutedText}`}
//                     >
//                       0
//                       {index +
//                         1}
//                     </span>
//                   </div>

//                   <h3
//                     className={`mt-5 text-lg font-black ${primaryText}`}
//                   >
//                     {
//                       title
//                     }
//                   </h3>

//                   <p
//                     className={`mt-2 text-sm leading-7 ${secondaryText}`}
//                   >
//                     {
//                       description
//                     }
//                   </p>
//                 </div>
//               )
//             )}
//           </div>
//         </section>

//         {/* Interview revision */}

//         <section
//           className={`border-y py-16 sm:py-20 lg:py-24 ${border} ${
//             isDark
//               ? "bg-[#0B111A]"
//               : "bg-blue-50/60"
//           }`}
//         >
//           <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//             <div className="grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-14">
//               <div>
//                 <div
//                   className={`
//                     inline-flex
//                     items-center
//                     gap-2
//                     rounded-full
//                     border
//                     px-3.5
//                     py-2
//                     text-xs
//                     font-black
//                     ${
//                       isDark
//                         ? "border-blue-900/50 bg-blue-950/25 text-blue-300"
//                         : "border-blue-200 bg-white text-blue-700"
//                     }
//                   `}
//                 >
//                   <Zap
//                     size={
//                       15
//                     }
//                   />

//                   Interview quick
//                   revision
//                 </div>

//                 <h2
//                   className={`mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl ${primaryText}`}
//                 >
//                   Less time before
//                   your interview?

//                   <span className="mt-2 block text-blue-500">
//                     Use a structured
//                     path for revision.
//                   </span>
//                 </h2>

//                 <p
//                   className={`mt-5 text-base leading-8 sm:text-lg ${secondaryText}`}
//                 >
//                   Revise agents,
//                   workflows, RAG,
//                   MCP, A2A,
//                   evaluation,
//                   observability,
//                   deployment,
//                   security and
//                   production patterns
//                   from one organized
//                   reference.
//                 </p>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     handlePurchase(
//                       "interview_revision"
//                     )
//                   }
//                   disabled={
//                     !canBuy
//                   }
//                   className={`${purchaseButton} mt-7`}
//                 >
//                   {loadingProduct
//                     ? "Loading price..."
//                     : canBuy
//                     ? "Get the Handbook"
//                     : "Price unavailable"}

//                   <ArrowRight
//                     size={
//                       17
//                     }
//                   />
//                 </button>

//                 <PurchaseError />
//               </div>

//               <div className="grid gap-3 sm:grid-cols-2">
//                 {[
//                   [
//                     "01",
//                     "Core concepts",
//                     "Agent mental model, ADK and setup",
//                   ],
//                   [
//                     "02",
//                     "Architecture",
//                     "Tools, workflows, RAG, MCP and A2A",
//                   ],
//                   [
//                     "03",
//                     "Production",
//                     "Evals, tracing, security and deployment",
//                   ],
//                   [
//                     "04",
//                     "Reference",
//                     "Commands, checklists and architecture patterns",
//                   ],
//                 ].map(
//                   ([
//                     number,
//                     title,
//                     description,
//                   ]) => (
//                     <div
//                       key={
//                         number
//                       }
//                       className={`rounded-2xl border p-5 sm:p-6 ${card}`}
//                     >
//                       <span className="font-mono text-xs font-black text-blue-500">
//                         {
//                           number
//                         }
//                       </span>

//                       <h3
//                         className={`mt-4 text-lg font-black ${primaryText}`}
//                       >
//                         {
//                           title
//                         }
//                       </h3>

//                       <p
//                         className={`mt-2 text-sm leading-6 ${secondaryText}`}
//                       >
//                         {
//                           description
//                         }
//                       </p>
//                     </div>
//                   )
//                 )}
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Roadmap */}

//         <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
//           <div className="mx-auto max-w-3xl text-center">
//             {sectionLabel(
//               "GenAI engineer roadmap"
//             )}

//             <h2
//               className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
//             >
//               See how the skills
//               connect.
//             </h2>

//             <p
//               className={`mt-4 leading-7 ${secondaryText}`}
//             >
//               Follow the connected
//               path from foundations
//               to production. Tap a
//               card to see more
//               detail.
//             </p>
//           </div>

//           <div className="relative mt-10">
//             <div
//               className={`
//                 pointer-events-none
//                 absolute
//                 left-[6%]
//                 right-[6%]
//                 top-[62px]
//                 hidden
//                 h-px
//                 lg:block
//                 ${
//                   isDark
//                     ? "bg-slate-800"
//                     : "bg-blue-200"
//                 }
//               `}
//             />

//             <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
//               {FLOW_SKILLS.map(
//                 ([
//                   number,
//                   title,
//                   short,
//                   detail,
//                 ]) => {
//                   const selected =
//                     activeSkill ===
//                     number;

//                   return (
//                     <button
//                       type="button"
//                       key={
//                         number
//                       }
//                       onClick={() =>
//                         setActiveSkill(
//                           selected
//                             ? null
//                             : number
//                         )
//                       }
//                       className={`
//                         relative
//                         z-10
//                         min-h-[180px]
//                         rounded-2xl
//                         border
//                         p-4
//                         text-left
//                         transition
//                         focus:outline-none
//                         focus:ring-2
//                         focus:ring-blue-500
//                         lg:min-h-[210px]
//                         ${
//                           selected
//                             ? isDark
//                               ? "border-blue-700 bg-blue-950/25"
//                               : "border-blue-300 bg-blue-50"
//                             : card
//                         }
//                       `}
//                     >
//                       <span
//                         className={`
//                           flex
//                           h-10
//                           w-10
//                           items-center
//                           justify-center
//                           rounded-xl
//                           font-mono
//                           text-xs
//                           font-black
//                           ${
//                             isDark
//                               ? "bg-slate-800 text-blue-300"
//                               : "bg-blue-50 text-blue-700"
//                           }
//                         `}
//                       >
//                         {
//                           number
//                         }
//                       </span>

//                       <h3
//                         className={`mt-5 text-sm font-black leading-5 ${primaryText}`}
//                       >
//                         {
//                           title
//                         }
//                       </h3>

//                       <p
//                         className={`mt-2 text-xs leading-5 ${mutedText}`}
//                       >
//                         {
//                           short
//                         }
//                       </p>

//                       {selected && (
//                         <p
//                           className={`mt-4 border-t pt-4 text-xs leading-6 ${border} ${secondaryText}`}
//                         >
//                           {
//                             detail
//                           }
//                         </p>
//                       )}
//                     </button>
//                   );
//                 }
//               )}
//             </div>
//           </div>
//         </section>

//         {/* Code examples */}

//         <section
//           className={`border-y py-16 sm:py-20 lg:py-24 ${border} ${alternateBg}`}
//         >
//           <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//             <div className="mx-auto max-w-3xl text-center">
//               {sectionLabel(
//                 "Code-first learning"
//               )}

//               <h2
//                 className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
//               >
//                 Understand the flow,
//                 then study the code.
//               </h2>

//               <p
//                 className={`mt-4 leading-7 ${secondaryText}`}
//               >
//                 Explore
//                 representative
//                 patterns for agents,
//                 function calling,
//                 retrieval and
//                 multi-agent
//                 orchestration.
//               </p>
//             </div>

//             <div className="mt-10 overflow-hidden rounded-2xl border border-slate-800 bg-[#050B14] shadow-2xl">
//               <div className="border-b border-slate-800 p-2">
//                 <div className="flex gap-2 overflow-x-auto">
//                   {CODE_EXAMPLES.map(
//                     (
//                       item,
//                       index
//                     ) => (
//                       <button
//                         key={
//                           item.id
//                         }
//                         type="button"
//                         onClick={() =>
//                           setActiveCode(
//                             index
//                           )
//                         }
//                         className={`
//                           min-w-max
//                           rounded-xl
//                           px-4
//                           py-3
//                           text-left
//                           transition
//                           ${
//                             activeCode ===
//                             index
//                               ? "bg-white/10 text-white"
//                               : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200"
//                           }
//                         `}
//                       >
//                         <span className="block text-[10px] font-black uppercase tracking-[0.12em]">
//                           {
//                             item.label
//                           }
//                         </span>

//                         <span className="mt-1 block text-xs font-semibold">
//                           {
//                             item.title
//                           }
//                         </span>
//                       </button>
//                     )
//                   )}
//                 </div>
//               </div>

//               <div className="grid lg:grid-cols-[.75fr_1.25fr]">
//                 <div className="border-b border-slate-800 p-6 lg:border-b-0 lg:border-r lg:p-8">
//                   <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-blue-400">
//                     <Code2
//                       size={
//                         15
//                       }
//                     />

//                     {
//                       CODE_EXAMPLES[
//                         activeCode
//                       ].label
//                     }
//                   </div>

//                   <h3 className="mt-4 text-2xl font-black text-white">
//                     {
//                       CODE_EXAMPLES[
//                         activeCode
//                       ].title
//                     }
//                   </h3>

//                   <p className="mt-4 text-sm leading-7 text-slate-400">
//                     {
//                       CODE_EXAMPLES[
//                         activeCode
//                       ]
//                         .description
//                     }
//                   </p>

//                   <div className="mt-6 flex flex-wrap gap-2">
//                     {[
//                       "Concept",
//                       "Flow",
//                       "Code",
//                       "Production",
//                     ].map(
//                       (
//                         tag
//                       ) => (
//                         <span
//                           key={
//                             tag
//                           }
//                           className="rounded-full border border-slate-700 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-slate-400"
//                         >
//                           {
//                             tag
//                           }
//                         </span>
//                       )
//                     )}
//                   </div>
//                 </div>

//                 <div className="min-w-0 bg-[#02060D]">
//                   <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3 sm:px-5">
//                     <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
//                     <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
//                     <span className="h-2.5 w-2.5 rounded-full bg-green-400" />

//                     <span className="ml-2 text-xs text-slate-500">
//                       {
//                         CODE_EXAMPLES[
//                           activeCode
//                         ].id
//                       }
//                       .py
//                     </span>
//                   </div>

//                   <pre
//                     className="
//                       max-h-[520px]
//                       w-full
//                       max-w-full
//                       overflow-x-auto
//                       p-4
//                       text-[11px]
//                       leading-6
//                       text-slate-300
//                       sm:p-6
//                       sm:text-[13px]
//                     "
//                   >
//                     <code>
//                       {
//                         CODE_EXAMPLES[
//                           activeCode
//                         ].code
//                       }
//                     </code>
//                   </pre>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Chapters */}

//         <section
//           id="contents"
//           className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
//         >
//           {sectionLabel(
//             "32-chapter contents"
//           )}

//           <h2
//             className={`mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
//           >
//             From your first agent to
//             production architecture.
//           </h2>

//           <p
//             className={`mt-5 max-w-3xl leading-8 ${secondaryText}`}
//           >
//             Every chapter follows a
//             practical structure:
//             concept → flow → code →
//             commands → how it works →
//             production notes.
//           </p>

//           <div className="mt-10 space-y-10">
//             {CHAPTER_GROUPS.map(
//               ([
//                 label,
//                 items,
//               ]) => (
//                 <div
//                   key={
//                     label
//                   }
//                 >
//                   <p className="mb-4 text-xs font-black tracking-[0.18em] text-blue-500">
//                     {
//                       label
//                     }
//                   </p>

//                   <div className="grid gap-3 md:grid-cols-2">
//                     {items.map(
//                       ([
//                         number,
//                         title,
//                         description,
//                       ]) => (
//                         <div
//                           key={
//                             number
//                           }
//                           className={`rounded-2xl border p-4 transition sm:p-5 ${card}`}
//                         >
//                           <div className="flex gap-4">
//                             <span className="font-mono text-sm font-black text-blue-500">
//                               {
//                                 number
//                               }
//                             </span>

//                             <div>
//                               <h3
//                                 className={`font-black ${primaryText}`}
//                               >
//                                 {
//                                   title
//                                 }
//                               </h3>

//                               <p
//                                 className={`mt-2 text-sm leading-6 ${secondaryText}`}
//                               >
//                                 {
//                                   description
//                                 }
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       )
//                     )}
//                   </div>
//                 </div>
//               )
//             )}
//           </div>
//         </section>

//         {/* Mid CTA */}

//         <section
//           className={`border-y py-12 sm:py-14 ${border} ${alternateBg}`}
//         >
//           <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
//             <div>
//               {sectionLabel(
//                 "Ready to build?"
//               )}

//               <h2
//                 className={`mt-2 text-2xl font-black sm:text-3xl ${primaryText}`}
//               >
//                 Get the complete
//                 developer handbook.
//               </h2>

//               <p
//                 className={`mt-2 text-sm sm:text-base ${secondaryText}`}
//               >
//                 32 chapters • Code •
//                 RAG • MCP • A2A •
//                 Production
//               </p>
//             </div>

//             <div className="w-full shrink-0 lg:w-auto">
//               <button
//                 type="button"
//                 onClick={() =>
//                   handlePurchase(
//                     "mid_page"
//                   )
//                 }
//                 disabled={
//                   !canBuy
//                 }
//                 className={`${purchaseButton} w-full lg:w-auto`}
//               >
//                 {loadingProduct
//                   ? "Loading price..."
//                   : canBuy
//                   ? "Get Instant PDF Access"
//                   : "Price unavailable"}

//                 {canBuy && (
//                   <span>
//                     {formatMoney(
//                       GOOGLE_ADK_PRICE
//                     )}
//                   </span>
//                 )}

//                 <ArrowRight
//                   size={
//                     17
//                   }
//                 />
//               </button>

//               <PurchaseError
//                 compact
//               />
//             </div>
//           </div>
//         </section>

//         {/* Pricing */}

//         <section
//           id="pricing"
//           className="mx-auto max-w-5xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
//         >
//           <div className="text-center">
//             <div
//               className={`
//                 inline-flex
//                 items-center
//                 gap-2
//                 rounded-full
//                 border
//                 px-3.5
//                 py-2
//                 text-xs
//                 font-bold
//                 ${
//                   isDark
//                     ? "border-blue-900/50 bg-blue-950/25 text-blue-300"
//                     : "border-blue-200 bg-blue-50 text-blue-700"
//                 }
//               `}
//             >
//               <Sparkles
//                 size={
//                   15
//                 }
//               />

//               Google ADK • 2nd
//               Edition
//             </div>

//             <h2
//               className={`mt-5 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
//             >
//               A practical reference
//               for your ADK journey.
//             </h2>

//             <p
//               className={`mx-auto mt-4 max-w-2xl leading-7 ${secondaryText}`}
//             >
//               Learn the concepts,
//               follow implementation
//               patterns and understand
//               the production
//               lifecycle in one
//               developer handbook.
//             </p>
//           </div>

//           <div
//             className={`mx-auto mt-10 max-w-4xl overflow-hidden rounded-3xl border shadow-xl ${card}`}
//           >
//             <div className="h-1 bg-blue-500" />

//             <div className="grid lg:grid-cols-[1.2fr_.8fr]">
//               <div className="p-6 sm:p-8 lg:p-10">
//                 <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-500">
//                   Google ADK Complete
//                   Developer Handbook
//                 </p>

//                 <h3
//                   className={`mt-2 text-2xl font-black sm:text-3xl ${primaryText}`}
//                 >
//                   2nd Edition
//                 </h3>

//                 <p
//                   className={`mt-4 leading-7 ${secondaryText}`}
//                 >
//                   32 chapters covering
//                   agent fundamentals,
//                   orchestration,
//                   tools, RAG, MCP,
//                   A2A, evaluation,
//                   observability,
//                   deployment,
//                   security, testing,
//                   performance and
//                   developer
//                   references.
//                 </p>

//                 <div className="mt-7 grid gap-3 sm:grid-cols-2">
//                   {[
//                     "32 structured chapters",
//                     "Code & command examples",
//                     "RAG + MCP + A2A",
//                     "Evaluation & observability",
//                     "Deployment & FastAPI",
//                     "Security & testing",
//                   ].map(
//                     (
//                       item
//                     ) => (
//                       <div
//                         key={
//                           item
//                         }
//                         className={`flex gap-2 text-sm font-semibold ${secondaryText}`}
//                       >
//                         <Check
//                           size={
//                             16
//                           }
//                           className="mt-0.5 shrink-0 text-blue-500"
//                         />

//                         {
//                           item
//                         }
//                       </div>
//                     )
//                   )}
//                 </div>
//               </div>

//               <div
//                 className={`
//                   border-t
//                   p-6
//                   sm:p-8
//                   lg:border-l
//                   lg:border-t-0
//                   lg:p-10
//                   ${border}
//                   ${
//                     isDark
//                       ? "bg-[#0C131C]"
//                       : "bg-slate-50"
//                   }
//                 `}
//               >
//                 <div className="flex h-full flex-col justify-center">
//                   <p
//                     className={`text-sm font-bold ${mutedText}`}
//                   >
//                     {hasMrp
//                       ? "Regular price"
//                       : "Current price"}
//                   </p>

//                   <div className="mt-2 flex flex-wrap items-end gap-2">
//                     {loadingProduct ? (
//                       <span
//                         className={`text-xl font-black ${secondaryText}`}
//                       >
//                         Loading price...
//                       </span>
//                     ) : canBuy ? (
//                       <>
//                         {hasMrp && (
//                           <span
//                             className={`text-xl font-bold line-through ${mutedText}`}
//                           >
//                             {formatMoney(
//                               GOOGLE_ADK_MRP
//                             )}
//                           </span>
//                         )}

//                         <span
//                           className={`text-4xl font-black sm:text-5xl ${primaryText}`}
//                         >
//                           {formatMoney(
//                             GOOGLE_ADK_PRICE
//                           )}
//                         </span>
//                       </>
//                     ) : (
//                       <span className="text-xl font-black text-red-500">
//                         Price unavailable
//                       </span>
//                     )}
//                   </div>

//                   <p
//                     className={`mt-3 text-sm leading-6 ${mutedText}`}
//                   >
//                     One-time payment.
//                     <br />
//                     No subscription
//                     required.
//                   </p>

//                   <button
//                     type="button"
//                     onClick={() =>
//                       handlePurchase(
//                         "pricing"
//                       )
//                     }
//                     disabled={
//                       !canBuy
//                     }
//                     className={`${purchaseButton} mt-7 w-full`}
//                   >
//                     {loadingProduct
//                       ? "Loading price..."
//                       : canBuy
//                       ? "Get Instant PDF Access"
//                       : "Price unavailable"}

//                     <ArrowRight
//                       size={
//                         17
//                       }
//                     />
//                   </button>

//                   <PurchaseError />

//                   <div
//                     className={`mt-5 flex items-center justify-center gap-2 text-xs font-semibold ${mutedText}`}
//                   >
//                     <ShieldCheck
//                       size={
//                         15
//                       }
//                       className="text-emerald-500"
//                     />

//                     Secure payment •
//                     Instant access
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div
//             className={`mx-auto mt-5 max-w-4xl rounded-2xl border px-5 py-5 text-center ${softCard}`}
//           >
//             <p
//               className={`text-sm font-black ${primaryText}`}
//             >
//               Digital Product
//             </p>

//             <p
//               className={`mx-auto mt-2 max-w-2xl text-xs leading-6 ${mutedText}`}
//             >
//               Due to the digital
//               nature of this ebook,
//               all purchases are final
//               and non-refundable.
//               Please review the
//               contents and FAQ before
//               purchasing.
//             </p>

//             <p
//               className={`mt-2 break-words text-xs ${mutedText}`}
//             >
//               Purchase or ebook
//               support:{" "}

//               <a
//                 href="mailto:supporttargettrek@gmail.com"
//                 className="font-black text-blue-500 underline underline-offset-2"
//               >
//                 supporttargettrek@gmail.com
//               </a>
//             </p>
//           </div>
//         </section>

//         {/* FAQ */}

//         <section
//           className={`border-y py-16 sm:py-20 lg:py-24 ${border} ${alternateBg}`}
//         >
//           <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
//             <div className="text-center">
//               {sectionLabel(
//                 "Frequently asked questions"
//               )}

//               <h2
//                 className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
//               >
//                 Questions before you
//                 buy?
//               </h2>

//               <p
//                 className={`mx-auto mt-4 max-w-2xl leading-7 ${secondaryText}`}
//               >
//                 Important details
//                 about the handbook,
//                 learning path and
//                 purchase.
//               </p>
//             </div>

//             <div className="mt-9 space-y-3">
//               {FAQS.map(
//                 ([
//                   question,
//                   answer,
//                 ], index) => {
//                   const opened =
//                     openFaq ===
//                     index;

//                   return (
//                     <div
//                       key={
//                         question
//                       }
//                       className={`overflow-hidden rounded-2xl border ${card}`}
//                     >
//                       <button
//                         type="button"
//                         onClick={() =>
//                           setOpenFaq(
//                             opened
//                               ? null
//                               : index
//                           )
//                         }
//                         aria-expanded={
//                           opened
//                         }
//                         aria-controls={`adk-faq-${index}`}
//                         className={`
//                           flex
//                           w-full
//                           items-center
//                           justify-between
//                           gap-4
//                           p-4
//                           text-left
//                           text-sm
//                           font-black
//                           sm:p-5
//                           sm:text-base
//                           ${primaryText}
//                         `}
//                       >
//                         <span>
//                           {
//                             question
//                           }
//                         </span>

//                         <ChevronDown
//                           size={
//                             19
//                           }
//                           className={`
//                             shrink-0
//                             transition-transform
//                             ${mutedText}
//                             ${
//                               opened
//                                 ? "rotate-180"
//                                 : ""
//                             }
//                           `}
//                         />
//                       </button>

//                       {opened && (
//                         <p
//                           id={`adk-faq-${index}`}
//                           className={`px-4 pb-5 text-sm leading-7 sm:px-5 sm:pr-12 ${secondaryText}`}
//                         >
//                           {
//                             answer
//                           }
//                         </p>
//                       )}
//                     </div>
//                   );
//                 }
//               )}
//             </div>
//           </div>
//         </section>

//         {/* Final CTA */}

//         <section className="px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
//           <div
//             className={`
//               mx-auto
//               max-w-4xl
//               rounded-3xl
//               border
//               p-6
//               sm:p-10
//               ${card}
//             `}
//           >
//             <div
//               className={`
//                 mx-auto
//                 flex
//                 h-12
//                 w-12
//                 items-center
//                 justify-center
//                 rounded-xl
//                 ${
//                   isDark
//                     ? "bg-blue-950/40 text-blue-300"
//                     : "bg-blue-50 text-blue-600"
//                 }
//               `}
//             >
//               <Rocket
//                 size={
//                   23
//                 }
//               />
//             </div>

//             <h2
//               className={`mx-auto mt-6 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${primaryText}`}
//             >
//               Start building AI
//               agents with Google ADK.
//             </h2>

//             <p
//               className={`mx-auto mt-4 max-w-xl leading-7 ${secondaryText}`}
//             >
//               Learn the fundamentals,
//               understand the
//               architecture, study the
//               code and explore the
//               production lifecycle in
//               one developer handbook.
//             </p>

//             <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
//               {loadingProduct ? (
//                 <span
//                   className={`text-lg font-black ${secondaryText}`}
//                 >
//                   Loading price...
//                 </span>
//               ) : canBuy ? (
//                 <>
//                   {hasMrp && (
//                     <span
//                       className={`text-lg font-bold line-through ${mutedText}`}
//                     >
//                       {formatMoney(
//                         GOOGLE_ADK_MRP
//                       )}
//                     </span>
//                   )}

//                   <span className="text-3xl font-black text-blue-500 sm:text-4xl">
//                     {formatMoney(
//                       GOOGLE_ADK_PRICE
//                     )}
//                   </span>
//                 </>
//               ) : (
//                 <span className="text-lg font-black text-red-500">
//                   Price unavailable
//                 </span>
//               )}
//             </div>

//             <button
//               type="button"
//               onClick={() =>
//                 handlePurchase(
//                   "final_cta"
//                 )
//               }
//               disabled={
//                 !canBuy
//               }
//               className={`${purchaseButton} mt-7`}
//             >
//               {loadingProduct
//                 ? "Loading price..."
//                 : canBuy
//                 ? "Get Instant PDF Access"
//                 : "Price unavailable"}

//               <ArrowRight
//                 size={
//                   17
//                 }
//               />
//             </button>

//             <PurchaseError />

//             <p
//               className={`mx-auto mt-6 max-w-xl break-words text-xs leading-6 ${mutedText}`}
//             >
//               Non-refundable digital
//               product • Support:{" "}

//               <a
//                 href="mailto:supporttargettrek@gmail.com"
//                 className="font-black text-blue-500"
//               >
//                 supporttargettrek@gmail.com
//               </a>
//             </p>
//           </div>
//         </section>

//         {/* Mobile sticky purchase */}

//         <div
//           className={`
//             fixed
//             inset-x-0
//             bottom-0
//             z-40
//             border-t
//             p-3
//             shadow-2xl
//             backdrop-blur-xl
//             md:hidden
//             ${border}
//             ${
//               isDark
//                 ? "bg-[#080D14]/95"
//                 : "bg-white/95"
//             }
//           `}
//         >
//           <div className="mx-auto flex max-w-lg items-center gap-3">
//             <div className="min-w-0 flex-1">
//               <p
//                 className={`truncate text-[11px] font-bold ${mutedText}`}
//               >
//                 Google ADK Handbook
//               </p>

//               <div className="mt-0.5 flex items-center gap-2">
//                 {loadingProduct ? (
//                   <span
//                     className={`text-xs font-bold ${secondaryText}`}
//                   >
//                     Loading...
//                   </span>
//                 ) : canBuy ? (
//                   <>
//                     {hasMrp && (
//                       <span
//                         className={`text-[11px] font-bold line-through ${mutedText}`}
//                       >
//                         {formatMoney(
//                           GOOGLE_ADK_MRP
//                         )}
//                       </span>
//                     )}

//                     <span className="text-base font-black text-blue-500">
//                       {formatMoney(
//                         GOOGLE_ADK_PRICE
//                       )}
//                     </span>
//                   </>
//                 ) : (
//                   <span className="text-xs font-bold text-red-500">
//                     Price unavailable
//                   </span>
//                 )}
//               </div>
//             </div>

//             <button
//               type="button"
//               onClick={() =>
//                 handlePurchase(
//                   "mobile_sticky"
//                 )
//               }
//               disabled={
//                 !canBuy
//               }
//               className="
//                 flex
//                 min-h-[44px]
//                 shrink-0
//                 items-center
//                 gap-2
//                 rounded-xl
//                 bg-blue-600
//                 px-4
//                 py-2.5
//                 text-sm
//                 font-black
//                 text-white
//                 transition
//                 hover:bg-blue-700
//                 disabled:cursor-not-allowed
//                 disabled:opacity-50
//               "
//             >
//               Buy Now

//               <ArrowRight
//                 size={
//                   15
//                 }
//               />
//             </button>
//           </div>

//           <PurchaseError
//             compact
//           />
//         </div>

//         <PayUCheckoutModal
//           isOpen={
//             isCheckoutOpen &&
//             canBuy
//           }
//           onClose={() =>
//             setIsCheckoutOpen(
//               false
//             )
//           }
//           product={
//             product
//           }
//         />
//       </main>
//     </>
//   );
// }

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Helmet } from "react-helmet-async";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { trackViewContent } from "../lib/metaPixel";

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bot,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Cloud,
  Code2,
  Copy,
  Database,
  FileCode2,
  GitBranch,
  Layers3,
  Lock,
  Network,
  RefreshCw,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  TestTube,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";

// =====================================================
// WEBSITE CONFIGURATION
// =====================================================

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";
const PAGE_PATH = "/book/genai/google-adk";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  "http://localhost:5001";

const GA_MEASUREMENT_ID = "G-5FPEL1W0VB";

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

const SEO_TITLE =
  "Google ADK Complete Developer Handbook – AI Agents, RAG, MCP & A2A | Target Trek";

const SEO_DESCRIPTION =
  "Learn Google ADK with a practical developer handbook covering AI agents, tools, RAG, MCP, A2A, multi-agent workflows, sessions, evaluation, observability, security, FastAPI and production deployment.";

// =====================================================
// HELPERS
// =====================================================

const readTheme = () => {
  if (typeof window === "undefined") return "light";

  try {
    return localStorage.getItem(THEME_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

const formatMoney = (amount, currency = "INR") => {
  if (
    amount === null ||
    amount === undefined ||
    amount === ""
  ) {
    return "";
  }

  const number = Number(amount);

  if (!Number.isFinite(number)) return "";

  const locales = {
    INR: "en-IN",
    USD: "en-US",
    GBP: "en-GB",
    EUR: "en-IE",
    CAD: "en-CA",
    AUD: "en-AU",
  };

  try {
    return new Intl.NumberFormat(
      locales[currency] || "en-IN",
      {
        style: "currency",
        currency,
        minimumFractionDigits:
          Number.isInteger(number) ? 0 : 2,
        maximumFractionDigits: 2,
      }
    ).format(number);
  } catch {
    return `${currency} ${number}`;
  }
};

// =====================================================
// 32 CHAPTERS - PRESERVED FROM EXISTING PAGE
// =====================================================

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

// =====================================================
// CURRICULUM GROUPS
// =====================================================

const CHAPTER_GROUPS = [
  {
    id: "foundations",
    number: "01",
    title: "Foundations",
    subtitle: "The building blocks",
    chapters: CHAPTERS.slice(0, 5),
  },
  {
    id: "orchestration",
    number: "02",
    title: "Orchestration & Tools",
    subtitle: "Control and extend agents",
    chapters: CHAPTERS.slice(5, 11),
  },
  {
    id: "integrations",
    number: "03",
    title: "Integrations",
    subtitle: "RAG, MCP, A2A and models",
    chapters: CHAPTERS.slice(11, 17),
  },
  {
    id: "production",
    number: "04",
    title: "Production Engineering",
    subtitle: "Deployment and reliability",
    chapters: CHAPTERS.slice(17, 25),
  },
  {
    id: "reference",
    number: "05",
    title: "Engineering & Reference",
    subtitle: "Practical developer guidance",
    chapters: CHAPTERS.slice(25),
  },
];

// =====================================================
// CODE EXAMPLES
// =====================================================

const CODE_EXAMPLES = [
  {
    id: "agent",
    label: "LLM Agent",
    title: "Build your first AI agent",
    filename: "agent.py",
    description:
      "Start with the core Google ADK agent primitive and define its model, instructions, and purpose.",
    code: `from google.adk.agents import Agent

root_agent = Agent(
    name="support_agent",
    model="gemini-flash-latest",
    instruction="""
    You are a customer-support assistant.
    Be concise.
    Never invent account data.
    Use tools when account information
    is required.
    """,
)`,
  },
  {
    id: "tool",
    label: "Function Tool",
    title: "Connect an agent to Python functions",
    filename: "tools.py",
    description:
      "Give an agent controlled access to application functions and external services.",
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
    label: "RAG",
    title: "Add retrieval to an agent",
    filename: "retrieval.py",
    description:
      "Retrieve relevant information from a vector collection before producing grounded responses.",
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
    label: "Multi-Agent",
    title: "Orchestrate specialist agents",
    filename: "workflow.py",
    description:
      "Combine specialized agents using deterministic sequential orchestration.",
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

// =====================================================
// LEARNING PATH
// =====================================================

const LEARNING_PATH = [
  {
    n: "01",
    title: "Python + LLM Foundations",
    subtitle: "Models, prompts and context",
    description:
      "Python, LLM APIs, prompting, context windows, structured outputs and basic interactions.",
  },
  {
    n: "02",
    title: "Agent Fundamentals",
    subtitle: "Instructions, state and sessions",
    description:
      "Understand how models, tools, instructions, sessions and state form an agent.",
  },
  {
    n: "03",
    title: "Tools & Function Calling",
    subtitle: "APIs, files and controlled actions",
    description:
      "Give agents controlled access to application logic, databases and external services.",
  },
  {
    n: "04",
    title: "RAG & Memory",
    subtitle: "Retrieval and grounding",
    description:
      "Use retrieval to ground answers and state or memory to preserve useful context.",
  },
  {
    n: "05",
    title: "Multi-Agent & Protocols",
    subtitle: "Workflows, MCP and A2A",
    description:
      "Orchestrate specialist agents and connect systems using protocols.",
  },
  {
    n: "06",
    title: "Evaluation & Observability",
    subtitle: "Tests, traces and guardrails",
    description:
      "Evaluate quality, trace executions, diagnose failures and improve behavior.",
  },
  {
    n: "07",
    title: "Production Engineering",
    subtitle: "Deployment and security",
    description:
      "Expose agents with APIs and implement security, monitoring and reliability.",
  },
];

// =====================================================
// PROJECTS
// =====================================================

const PROJECTS = [
  {
    icon: Sparkles,
    number: "01",
    title: "Research Agent",
    description:
      "Build an AI agent that researches a topic, gathers information and returns structured findings.",
    tags: ["Research", "Tools", "Structured Output"],
  },
  {
    icon: Code2,
    number: "02",
    title: "API Agent",
    description:
      "Connect agents to external APIs and execute application actions with controlled function calls.",
    tags: ["APIs", "Python", "Function Calling"],
  },
  {
    icon: Layers3,
    number: "03",
    title: "RAG Agent",
    description:
      "Create an agent that answers questions from your documents and knowledge base.",
    tags: ["Embeddings", "Retrieval", "Grounding"],
  },
  {
    icon: Users,
    number: "04",
    title: "Multi-Agent System",
    description:
      "Build specialist agents and orchestrate them into a complete AI workflow.",
    tags: ["Sequential", "Parallel", "Orchestration"],
  },
];

// =====================================================
// FAQ - EXISTING CONTENT
// =====================================================

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

// =====================================================
// UI COMPONENTS
// =====================================================

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  actionHref,
}) {
  return (
    <div className="adk-section-heading">
      <div>
        <span className="adk-eyebrow">
          <i />
          {eyebrow}
        </span>

        <h2>{title}</h2>

        {description && <p>{description}</p>}
      </div>

      {action && actionHref && (
        <a href={actionHref} className="adk-text-link">
          {action}
          <ArrowUpRight size={16} />
        </a>
      )}
    </div>
  );
}

function SmallTag({ children }) {
  return <span className="adk-small-tag">{children}</span>;
}

function PriceDisplay({
  price,
  mrp,
  currency,
  discount,
  loading,
}) {
  if (loading) {
    return (
      <div className="adk-price-loading">
        <span />
        <span />
      </div>
    );
  }

  if (price === null) {
    return (
      <span className="adk-price-unavailable">
        Price unavailable
      </span>
    );
  }

  return (
    <div className="adk-price-row">
      <strong>{formatMoney(price, currency)}</strong>

      {mrp !== null && mrp > price && (
        <del>{formatMoney(mrp, currency)}</del>
      )}

      {discount > 0 && (
        <span className="adk-discount">
          {discount}% OFF
        </span>
      )}
    </div>
  );
}

// =====================================================
// BOOK COVER
// =====================================================

function ADKBookCover({ imageUrl }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <div className="adk-cover-stage">
      <div className="adk-cover-ring adk-ring-one" />
      <div className="adk-cover-ring adk-ring-two" />

      <div className="adk-cover-book">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt="Google ADK Complete Developer Handbook book cover"
            className="adk-cover-image"
            onError={() => setImageFailed(true)}
            loading="eager"
          />
        ) : (
          <>
            <div className="adk-cover-brand">
              <span>TARGET TREK</span>
              <span>2ND EDITION</span>
            </div>

            <div className="adk-cover-art">
              <svg
                viewBox="0 0 280 190"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M45 94H94M186 94H234M140 52V26M140 141V166"
                  stroke="#FB923C"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />

                <rect
                  x="91"
                  y="51"
                  width="98"
                  height="91"
                  rx="13"
                  fill="#30231C"
                  stroke="#FB923C"
                  strokeWidth="2"
                />

                <rect
                  x="107"
                  y="74"
                  width="66"
                  height="45"
                  rx="8"
                  fill="#F97316"
                  fillOpacity=".13"
                  stroke="#FDBA74"
                />

                <circle
                  cx="124"
                  cy="94"
                  r="6"
                  fill="#FB923C"
                />

                <circle
                  cx="156"
                  cy="94"
                  r="6"
                  fill="#FB923C"
                />

                <path
                  d="M124 110Q140 120 156 110"
                  stroke="#FB923C"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {[
                  [28, 94],
                  [252, 94],
                  [140, 15],
                  [140, 177],
                ].map(([x, y]) => (
                  <g key={`${x}-${y}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r="14"
                      fill="#FB923C"
                      fillOpacity=".13"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      fill="#FB923C"
                    />
                  </g>
                ))}

                <path
                  d="M116 51V39M164 51V39"
                  stroke="#FDBA74"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div className="adk-cover-content">
              <span className="adk-cover-kicker">
                COMPLETE DEVELOPER HANDBOOK
              </span>

              <h2>
                GOOGLE
                <br />
                <span>ADK</span>
                <br />
                DEVELOPER
                <br />
                HANDBOOK
              </h2>

              <p>
                Agents · Tools · RAG · MCP · A2A
                <br />
                Evaluation · Production
              </p>

              <div className="adk-cover-rule" />

              <small>
                BUILD · ORCHESTRATE · DEPLOY
              </small>
            </div>
          </>
        )}
      </div>

      <div className="adk-cover-float adk-cover-float-one">
        <Bot size={16} />
        AI AGENTS
      </div>

      <div className="adk-cover-float adk-cover-float-two">
        <GitBranch size={16} />
        MULTI-AGENT
      </div>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function GenAiGoogleAdk() {
  const [theme, setTheme] = useState(readTheme);

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [activeChapterGroup, setActiveChapterGroup] =
    useState("foundations");

  const [chapterSearch, setChapterSearch] = useState("");
  const [activeCode, setActiveCode] = useState("agent");
  const [copied, setCopied] = useState(false);

  const [activeSkill, setActiveSkill] = useState("01");
  const [openFaq, setOpenFaq] = useState(0);

  const [scrollProgress, setScrollProgress] = useState(0);

  const trackedProductRef = useRef(null);
  const copyTimerRef = useRef(null);

  const isDark = theme === "dark";

  // ===================================================
  // NAVBAR THEME SYNC
  // ===================================================

  useEffect(() => {
    const syncTheme = (event) => {
      const next = event?.detail?.theme;

      if (next === "light" || next === "dark") {
        setTheme(next);
      } else {
        setTheme(readTheme());
      }
    };

    const onStorage = (event) => {
      if (!event.key || event.key === THEME_KEY) {
        setTheme(readTheme());
      }
    };

    window.addEventListener(THEME_EVENT, syncTheme);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", syncTheme);

    return () => {
      window.removeEventListener(THEME_EVENT, syncTheme);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", syncTheme);
    };
  }, []);

  // ===================================================
  // REFERRAL PARAMETERS
  // ===================================================

  useEffect(() => {
    try {
      const params = new URLSearchParams(
        window.location.search
      );

      const referralCode = (
        params.get("referralCode") ||
        params.get("ref") ||
        ""
      ).trim();

      if (referralCode) {
        localStorage.setItem("referralCode", referralCode);
      }
    } catch (error) {
      console.error("Referral capture error:", error);
    }
  }, []);

  // ===================================================
  // EXISTING PRODUCT API
  // GET /book/product?redirectUrl=/book/genai/google-adk
  // ===================================================

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      setLoadingProduct(true);
      setProductError("");
      setProduct(null);
      setIsCheckoutOpen(false);

      try {
        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(
            PAGE_PATH
          )}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        const result = await response
          .json()
          .catch(() => null);

        if (
          !response.ok ||
          result?.success !== true ||
          !result?.data
        ) {
          throw new Error(
            result?.error?.message ||
              result?.message ||
              "Unable to load ebook details."
          );
        }

        const data = result.data;
        const price = Number(data.price);

        if (
          !data._id ||
          data.price === null ||
          data.price === undefined ||
          String(data.price).trim() === "" ||
          !Number.isFinite(price) ||
          price < 0
        ) {
          throw new Error(
            "The product details returned by the server are incomplete."
          );
        }

        if (!controller.signal.aborted) {
          setProduct(data);
        }
      } catch (error) {
        if (
          error?.name === "AbortError" ||
          controller.signal.aborted
        ) {
          return;
        }

        console.error("Google ADK product error:", error);

        setProductError(
          error?.message ||
            "Unable to load ebook details."
        );

        setProduct(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoadingProduct(false);
        }
      }
    };

    fetchProduct();

    return () => controller.abort();
  }, [retryCount]);

  // ===================================================
  // PRODUCT PRICE
  // ===================================================

  const currency = product?.currency || "INR";

  const currentPrice =
    product?.price !== null &&
    product?.price !== undefined &&
    product?.price !== ""
      ? Number(product.price)
      : null;

  const rawMrp =
    product?.mrp !== null &&
    product?.mrp !== undefined &&
    product?.mrp !== ""
      ? Number(product.mrp)
      : null;

  const hasValidPrice =
    currentPrice !== null &&
    Number.isFinite(currentPrice) &&
    currentPrice >= 0;

  const mrp =
    rawMrp !== null &&
    Number.isFinite(rawMrp) &&
    hasValidPrice &&
    rawMrp > currentPrice
      ? rawMrp
      : null;

  const discount =
    mrp !== null
      ? Math.round(
          ((mrp - currentPrice) / mrp) * 100
        )
      : 0;

  const canBuy =
    Boolean(product?._id) &&
    hasValidPrice &&
    !loadingProduct &&
    !productError;

  const productName =
    product?.title ||
    "Google ADK Complete Developer Handbook – 2nd Edition";

  const coverImage =
    product?.coverPageUrl ||
    product?.coverpageurl ||
    product?.cover_page_url ||
    "";

  // ===================================================
  // META PIXEL - VIEW CONTENT ONLY
  // Purchase is tracked on verified payment success.
  // ===================================================

  useEffect(() => {
    if (!product?._id || !hasValidPrice) return;

    const key = [
      product._id,
      currentPrice,
      currency,
    ].join(":");

    if (trackedProductRef.current === key) return;

    const sent = trackViewContent({
      id: String(product._id),
      title: productName,
      price: currentPrice,
      currency,
    });

    if (sent !== false) {
      trackedProductRef.current = key;
    }
  }, [
    product?._id,
    productName,
    currentPrice,
    currency,
    hasValidPrice,
  ]);

  // ===================================================
  // SCROLL PROGRESS
  // ===================================================

  useEffect(() => {
    const updateProgress = () => {
      const maxScroll =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const value =
        maxScroll > 0
          ? (window.scrollY / maxScroll) * 100
          : 0;

      setScrollProgress(
        Math.min(100, Math.max(0, value))
      );
    };

    updateProgress();

    window.addEventListener(
      "scroll",
      updateProgress,
      { passive: true }
    );

    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener(
        "scroll",
        updateProgress
      );

      window.removeEventListener(
        "resize",
        updateProgress
      );
    };
  }, []);

  // ===================================================
  // CHECKOUT AND GOOGLE ANALYTICS
  // ===================================================

  const handlePurchase = useCallback(
    (source = "unknown") => {
      if (!canBuy || !product) return;

      try {
        window.dataLayer = window.dataLayer || [];

        window.dataLayer.push({
          event: "adk_purchase_click",
          product:
            product.slug ||
            "google_adk_handbook_2nd_edition",
          source,
          bookId: product._id,
          price: currentPrice,
          currency,
        });

        // Existing Google Analytics begin_checkout.
        // Not a completed purchase event.
        if (typeof window.gtag === "function") {
          window.gtag("event", "begin_checkout", {
            currency,
            value: currentPrice,
            source,
            items: [
              {
                item_id: String(product._id),
                item_name: productName,
                price: currentPrice,
                quantity: 1,
              },
            ],
          });
        }
      } catch (error) {
        console.warn(
          "Checkout analytics warning:",
          error
        );
      }

      setIsCheckoutOpen(true);
    },
    [
      canBuy,
      product,
      currentPrice,
      currency,
      productName,
    ]
  );

  const retryProduct = () => {
    setRetryCount((value) => value + 1);
  };

  // ===================================================
  // CURRICULUM SEARCH
  // ===================================================

  const filteredChapterGroups = useMemo(() => {
    const query = chapterSearch.trim().toLowerCase();

    if (!query) return CHAPTER_GROUPS;

    return CHAPTER_GROUPS.map((group) => ({
      ...group,
      chapters: group.chapters.filter(
        ([number, title, description]) =>
          [
            number,
            title,
            description,
            group.title,
            group.subtitle,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
      ),
    })).filter((group) => group.chapters.length > 0);
  }, [chapterSearch]);

  // ===================================================
  // CODE EXAMPLES
  // ===================================================

  const selectedCode =
    CODE_EXAMPLES.find(
      (example) => example.id === activeCode
    ) || CODE_EXAMPLES[0];

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(
        selectedCode.code
      );

      setCopied(true);

      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }

      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 1700);
    } catch (error) {
      console.error("Copy failed:", error);
      setCopied(false);
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  // ===================================================
  // STRUCTURED DATA
  // ===================================================

  const structuredData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: SITE_NAME,
          url: SITE_URL,
          email: SUPPORT_EMAIL,
        },
        {
          "@type": "WebPage",
          "@id": `${PAGE_URL}#webpage`,
          name: SEO_TITLE,
          description: SEO_DESCRIPTION,
          url: PAGE_URL,
        },
        {
          "@type": "Book",
          "@id": `${PAGE_URL}#book`,
          name: productName,
          description: SEO_DESCRIPTION,
          url: PAGE_URL,
          bookFormat: "https://schema.org/EBook",
          bookEdition:
            product?.edition || "2nd Edition",
          inLanguage:
            product?.language || "English",
          ...(coverImage
            ? { image: coverImage }
            : {}),
          publisher: {
            "@id": `${SITE_URL}/#organization`,
          },
        },
        {
          "@type": "Product",
          "@id": `${PAGE_URL}#product`,
          name: productName,
          description: SEO_DESCRIPTION,
          url: PAGE_URL,
          brand: {
            "@type": "Brand",
            name: SITE_NAME,
          },
          ...(coverImage
            ? { image: coverImage }
            : {}),
          ...(canBuy
            ? {
                offers: {
                  "@type": "Offer",
                  price: currentPrice,
                  priceCurrency: currency,
                  url: PAGE_URL,
                  availability:
                    "https://schema.org/InStock",
                },
              }
            : {}),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: SITE_NAME,
              item: SITE_URL,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Books",
              item: `${SITE_URL}/books`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: productName,
              item: PAGE_URL,
            },
          ],
        },
        {
          "@type": "FAQPage",
          mainEntity: FAQS.map(
            ([question, answer]) => ({
              "@type": "Question",
              name: question,
              acceptedAnswer: {
                "@type": "Answer",
                text: answer,
              },
            })
          ),
        },
      ],
    };
  }, [
    productName,
    product?.edition,
    product?.language,
    coverImage,
    canBuy,
    currentPrice,
    currency,
  ]);

  // ===================================================
  // RENDER
  // ===================================================

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
          content="Google ADK ebook, Google Agent Development Kit, AI agents, multi agent systems, Gemini, RAG, MCP, A2A, Vertex AI, evaluation, observability, FastAPI, production AI agents"
        />

        <meta
          name="robots"
          content="index,follow,max-image-preview:large"
        />

        <link rel="canonical" href={PAGE_URL} />

        <meta property="og:type" content="product" />

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

        {coverImage && (
          <meta
            property="og:image"
            content={coverImage}
          />
        )}

        <meta
          name="twitter:card"
          content={
            coverImage
              ? "summary_large_image"
              : "summary"
          }
        />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* ============================================== */}
      {/* DESIGN SYSTEM                                  */}
      {/* ============================================== */}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

        .adkPage {
          --adk-bg: #FAF9F6;
          --adk-surface: #FFFFFF;
          --adk-soft: #F5F1ED;
          --adk-text: #1C1917;
          --adk-muted: #70665E;
          --adk-subtle: #A8A29E;
          --adk-border: #E8E1D9;
          --adk-orange: #EA580C;
          --adk-orange-bright: #F97316;
          --adk-orange-soft: #FFF0E2;
          --adk-orange-border: #FED7AA;
          --adk-shadow: 0 15px 45px rgba(40,28,18,.06);

          min-height: 100vh;
          width: 100%;
          overflow-x: clip;
          background: var(--adk-bg);
          color: var(--adk-text);
          font-family: "DM Sans", sans-serif;
          -webkit-font-smoothing: antialiased;
          transition: background .25s, color .25s;
        }

        .adkPage[data-theme="dark"] {
          --adk-bg: #151311;
          --adk-surface: #211E1B;
          --adk-soft: #2B2622;
          --adk-text: #FAF8F5;
          --adk-muted: #B8AEA6;
          --adk-subtle: #91847B;
          --adk-border: #3B342F;
          --adk-orange: #FB923C;
          --adk-orange-bright: #F97316;
          --adk-orange-soft: #38271B;
          --adk-orange-border: #663D25;
          --adk-shadow: 0 15px 45px rgba(0,0,0,.15);

          color-scheme: dark;
        }

        .adkPage *,
        .adkPage *::before,
        .adkPage *::after {
          box-sizing: border-box;
        }

        .adkPage h1,
        .adkPage h2,
        .adkPage h3,
        .adkPage h4 {
          font-family: "Manrope", sans-serif;
        }

        .adkPage a {
          color: inherit;
          text-decoration: none;
        }

        .adkPage button,
        .adkPage input {
          font-family: inherit;
        }

        .adk-shell {
          width: min(1220px, calc(100% - 40px));
          margin-inline: auto;
        }

        .adk-section {
          padding: 69px 0;
        }

        .adk-section-alt {
          background: var(--adk-surface);
          border-block: 1px solid var(--adk-border);
        }

        .adk-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 30px;
        }

        .adk-section-heading > div {
          max-width: 770px;
        }

        .adk-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .15em;
          color: var(--adk-orange);
          text-transform: uppercase;
        }

        .adk-eyebrow i {
          width: 23px;
          height: 2px;
          border-radius: 4px;
          background: var(--adk-orange-bright);
        }

        .adk-section-heading h2 {
          margin: 12px 0 0;
          font-size: clamp(27px,3.2vw,41px);
          font-weight: 850;
          line-height: 1.16;
          letter-spacing: -.045em;
          color: var(--adk-text);
        }

        .adk-section-heading p {
          margin: 13px 0 0;
          color: var(--adk-muted);
          font-size: 14px;
          line-height: 1.8;
        }

        .adk-text-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--adk-orange) !important;
          font-size: 12px;
          font-weight: 850;
          flex-shrink: 0;
        }

        .adk-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 44px;
          padding: 10px 18px;
          border: 1px solid transparent;
          border-radius: 11px;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
          transition:
            transform .2s,
            background .2s,
            border-color .2s;
        }

        .adk-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .adk-btn:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .adk-btn-orange {
          background: #F97316;
          color: #FFF !important;
        }

        .adk-btn-orange:hover:not(:disabled) {
          background: #EA580C;
        }

        .adk-btn-outline {
          border-color: var(--adk-border);
          background: var(--adk-surface);
          color: var(--adk-text) !important;
        }

        .adk-btn-outline:hover {
          border-color: var(--adk-orange);
        }

        .adk-small-tag {
          display: inline-flex;
          padding: 6px 9px;
          border: 1px solid var(--adk-border);
          border-radius: 7px;
          background: var(--adk-soft);
          color: var(--adk-muted);
          font-size: 10px;
          font-weight: 750;
        }

        .adk-card {
          border: 1px solid var(--adk-border);
          border-radius: 17px;
          background: var(--adk-surface);
          box-shadow: var(--adk-shadow);
        }

        .adk-card h3 {
          color: var(--adk-text);
        }

        .adk-card p {
          color: var(--adk-muted);
        }

        .adk-icon {
          display: grid;
          place-items: center;
          width: 45px;
          height: 45px;
          border-radius: 12px;
          background: var(--adk-orange-soft);
          color: var(--adk-orange);
        }

        .adk-grid-two {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 16px;
        }

        .adk-grid-three {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 15px;
        }

        .adk-grid-four {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 14px;
        }

        /* --------------------------------------------- */
        /* HERO                                          */
        /* --------------------------------------------- */

        .adk-hero {
          position: relative;
          padding: 96px 0 42px;
          background: var(--adk-surface);
          border-bottom: 1px solid var(--adk-border);
          overflow: hidden;
        }

        .adk-hero::before {
          content: "";
          position: absolute;
          width: 490px;
          height: 490px;
          right: -155px;
          top: -245px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(249,115,22,.12),
            transparent 68%
          );
          pointer-events: none;
        }

        .adk-hero-grid {
          display: grid;
          grid-template-columns: minmax(0,1.1fr) minmax(280px,.9fr);
          align-items: center;
          gap: 44px;
        }

        .adk-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 11px;
          border: 1px solid var(--adk-orange-border);
          background: var(--adk-orange-soft);
          color: var(--adk-orange);
          border-radius: 7px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .1em;
        }

        .adk-hero h1 {
          max-width: 670px;
          margin: 19px 0;
          font-size: clamp(38px,5.1vw,64px);
          line-height: 1.07;
          font-weight: 900;
          letter-spacing: -.06em;
        }

        .adk-hero h1 span {
          color: var(--adk-orange-bright);
        }

        .adk-hero-copy {
          max-width: 600px;
          color: var(--adk-muted);
          font-size: 14px;
          line-height: 1.84;
        }

        .adk-hero-points {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 11px;
          margin-top: 21px;
        }

        .adk-hero-points span {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 11px;
          font-weight: 750;
          color: var(--adk-muted);
          line-height: 1.55;
        }

        .adk-hero-points svg {
          color: var(--adk-orange);
          flex-shrink: 0;
        }

        .adk-hero-purchase {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 18px;
          margin-top: 25px;
        }

        .adk-hero-price small {
          display: block;
          color: var(--adk-subtle);
          font-size: 10px;
          font-weight: 850;
          margin-bottom: 5px;
        }

        .adk-price-row {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 9px;
        }

        .adk-price-row strong {
          font-family: "Manrope",sans-serif;
          color: var(--adk-text);
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -.05em;
        }

        .adk-price-row del {
          color: var(--adk-subtle);
          font-size: 12px;
        }

        .adk-discount {
          align-self: center;
          padding: 5px 7px;
          border-radius: 6px;
          background: var(--adk-orange-soft);
          color: var(--adk-orange);
          font-size: 9px;
          font-weight: 900;
        }

        .adk-price-loading {
          display: flex;
          gap: 9px;
        }

        .adk-price-loading span {
          width: 100px;
          height: 24px;
          border-radius: 7px;
          background: var(--adk-soft);
          animation: adkPulse 1.4s infinite;
        }

        .adk-price-loading span:last-child {
          width: 55px;
          height: 16px;
        }

        .adk-price-unavailable {
          font-size: 12px;
          font-weight: 850;
          color: var(--adk-muted);
        }

        .adk-hero-links {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 18px;
          margin-top: 17px;
        }

        .adk-hero-links a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 850;
          color: var(--adk-orange) !important;
        }

        .adk-hero-links span {
          color: var(--adk-muted);
          font-size: 10px;
        }

        /* --------------------------------------------- */
        /* BOOK ART                                      */
        /* --------------------------------------------- */

        .adk-cover-stage {
          position: relative;
          display: grid;
          place-items: center;
          min-height: 415px;
          perspective: 900px;
        }

        .adk-cover-ring {
          position: absolute;
          border: 1px solid var(--adk-orange-border);
          border-radius: 50%;
          opacity: .55;
        }

        .adk-ring-one {
          width: 340px;
          height: 340px;
        }

        .adk-ring-two {
          width: 265px;
          height: 265px;
        }

        .adk-cover-book {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          width: 260px;
          aspect-ratio: 2 / 3;
          padding: 21px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 5px 13px 13px 5px;
          background: linear-gradient(
            145deg,
            #171410,
            #34251B 62%,
            #A74313
          );
          color: #FFF;
          box-shadow:
            22px 27px 46px rgba(0,0,0,.27),
            inset 6px 0 rgba(255,255,255,.07);
          transform: rotateY(-9deg) rotateZ(-2deg);
          transition: transform .35s;
        }

        .adk-cover-stage:hover .adk-cover-book {
          transform: rotateY(-2deg) rotateZ(0);
        }

        .adk-cover-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .adk-cover-brand {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .1em;
          color: #FDBA74;
        }

        .adk-cover-art {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
        }

        .adk-cover-art svg {
          width: 100%;
        }

        .adk-cover-kicker {
          font-size: 8px;
          color: #EBC2A6;
          font-weight: 900;
          letter-spacing: .07em;
        }

        .adk-cover-content h2 {
          font-size: 28px;
          margin: 11px 0;
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -.045em;
          color: #FFF;
        }

        .adk-cover-content h2 span {
          color: #FB923C;
          font-size: 47px;
        }

        .adk-cover-content p {
          font-size: 9px;
          line-height: 1.6;
          color: #E8C4A8;
        }

        .adk-cover-rule {
          width: 46px;
          height: 2px;
          background: #F97316;
          margin: 13px 0 9px;
        }

        .adk-cover-content small {
          color: #E8C4A8;
          font-size: 7px;
          font-weight: 850;
          letter-spacing: .1em;
        }

        .adk-cover-float {
          position: absolute;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 12px;
          border: 1px solid var(--adk-orange-border);
          border-radius: 10px;
          background: var(--adk-surface);
          color: var(--adk-text);
          box-shadow: var(--adk-shadow);
          font-size: 10px;
          font-weight: 850;
        }

        .adk-cover-float svg {
          color: var(--adk-orange);
        }

        .adk-cover-float-one {
          top: 18%;
          right: 1%;
        }

        .adk-cover-float-two {
          left: 1%;
          bottom: 16%;
        }

        /* --------------------------------------------- */
        /* TRUST STRIP                                   */
        /* --------------------------------------------- */

        .adk-trust-strip {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 15px;
          padding: 20px 0;
        }

        .adk-trust-item {
          display: flex;
          align-items: center;
          gap: 9px;
          color: var(--adk-muted);
          font-size: 11px;
          font-weight: 750;
        }

        .adk-trust-item svg {
          color: var(--adk-orange);
          flex-shrink: 0;
        }

        /* --------------------------------------------- */
        /* FEATURES                                      */
        /* --------------------------------------------- */

        .adk-feature-card {
          padding: 23px;
          transition: transform .2s,border-color .2s;
        }

        .adk-feature-card:hover {
          transform: translateY(-4px);
          border-color: var(--adk-orange);
        }

        .adk-feature-card h3 {
          margin: 18px 0 9px;
          font-size: 16px;
          font-weight: 850;
          letter-spacing: -.025em;
        }

        .adk-feature-card p {
          font-size: 12px;
          line-height: 1.8;
          margin: 0;
        }

        /* --------------------------------------------- */
        /* AGENT ARCHITECTURE                            */
        /* --------------------------------------------- */

        .adk-architecture-board {
          border: 1px solid var(--adk-border);
          border-radius: 19px;
          background: var(--adk-surface);
          padding: 26px;
        }

        .adk-architecture-flow {
          display: grid;
          grid-template-columns:
            1fr auto 1fr auto 1fr auto 1fr;
          gap: 10px;
          align-items: center;
        }

        .adk-architecture-node {
          text-align: center;
          padding: 20px 10px;
          min-width: 0;
          background: var(--adk-soft);
          border: 1px solid var(--adk-border);
          border-radius: 12px;
        }

        .adk-architecture-node svg {
          color: var(--adk-orange);
        }

        .adk-architecture-node h3 {
          font-size: 13px;
          font-weight: 850;
          margin: 12px 0 6px;
        }

        .adk-architecture-node p {
          font-size: 10px;
          color: var(--adk-muted);
          line-height: 1.6;
          margin: 0;
        }

        .adk-architecture-arrow {
          color: var(--adk-orange);
        }

        .adk-architecture-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 20px;
          padding: 15px;
          border-radius: 11px;
          border: 1px solid var(--adk-orange-border);
          background: var(--adk-orange-soft);
          color: var(--adk-muted);
          font-size: 12px;
          line-height: 1.7;
        }

        .adk-architecture-note svg {
          color: var(--adk-orange);
          flex-shrink: 0;
        }

        /* --------------------------------------------- */
        /* LEARNING PATH                                 */
        /* --------------------------------------------- */

        .adk-learning-layout {
          display: grid;
          grid-template-columns: 280px minmax(0,1fr);
          gap: 22px;
        }

        .adk-learning-tabs {
          display: grid;
          align-content: start;
          gap: 9px;
        }

        .adk-learning-tab {
          display: flex;
          gap: 11px;
          align-items: center;
          width: 100%;
          padding: 14px;
          border: 1px solid var(--adk-border);
          border-radius: 11px;
          background: var(--adk-surface);
          text-align: left;
          cursor: pointer;
          color: var(--adk-muted);
        }

        .adk-learning-tab.active {
          background: var(--adk-orange-soft);
          border-color: var(--adk-orange-border);
        }

        .adk-learning-tab > span:first-child {
          color: var(--adk-orange);
          font-size: 11px;
          font-weight: 900;
        }

        .adk-learning-tab strong {
          display: block;
          color: var(--adk-text);
          font-size: 12px;
          font-weight: 850;
        }

        .adk-learning-tab small {
          display: block;
          color: var(--adk-muted);
          margin-top: 5px;
          font-size: 10px;
          line-height: 1.5;
        }

        .adk-learning-panel {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 340px;
          padding: 31px;
        }

        .adk-learning-panel-number {
          font-size: 11px;
          font-weight: 900;
          color: var(--adk-orange);
          letter-spacing: .12em;
        }

        .adk-learning-panel h3 {
          font-size: clamp(23px,2.5vw,32px);
          margin: 17px 0 12px;
          font-weight: 850;
          letter-spacing: -.04em;
        }

        .adk-learning-panel p {
          font-size: 14px;
          line-height: 1.85;
        }

        /* --------------------------------------------- */
        /* CURRICULUM                                    */
        /* --------------------------------------------- */

        .adk-curriculum-layout {
          display: grid;
          grid-template-columns: 260px minmax(0,1fr);
          gap: 22px;
        }

        .adk-curriculum-sidebar {
          display: grid;
          align-content: start;
          gap: 8px;
          position: sticky;
          top: 90px;
          height: max-content;
        }

        .adk-curriculum-tab {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 14px;
          border: 1px solid var(--adk-border);
          border-radius: 11px;
          background: var(--adk-surface);
          color: var(--adk-muted);
          text-align: left;
          cursor: pointer;
        }

        .adk-curriculum-tab.active {
          background: var(--adk-orange-soft);
          border-color: var(--adk-orange-border);
        }

        .adk-curriculum-tab > span:first-child {
          color: var(--adk-orange);
          font-weight: 900;
          font-size: 11px;
        }

        .adk-curriculum-tab strong {
          display: block;
          color: var(--adk-text);
          font-size: 12px;
          font-weight: 850;
        }

        .adk-curriculum-tab small {
          display: block;
          color: var(--adk-muted);
          font-size: 10px;
          margin-top: 5px;
        }

        .adk-curriculum-search {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 45px;
          padding: 0 14px;
          margin-bottom: 15px;
          border: 1px solid var(--adk-border);
          border-radius: 11px;
          background: var(--adk-surface);
          color: var(--adk-muted);
        }

        .adk-curriculum-search input {
          flex: 1;
          width: 100%;
          min-width: 0;
          border: 0;
          background: transparent;
          outline: 0;
          color: var(--adk-text);
          font-size: 12px;
        }

        .adk-curriculum-search input::placeholder {
          color: var(--adk-subtle);
        }

        .adk-chapter-list {
          overflow: hidden;
          border: 1px solid var(--adk-border);
          border-radius: 14px;
          background: var(--adk-surface);
        }

        .adk-chapter {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 17px;
          border-bottom: 1px solid var(--adk-border);
        }

        .adk-chapter:last-child {
          border-bottom: 0;
        }

        .adk-chapter-number {
          display: grid;
          place-items: center;
          width: 37px;
          height: 37px;
          flex-shrink: 0;
          border-radius: 10px;
          background: var(--adk-orange-soft);
          color: var(--adk-orange);
          font-size: 11px;
          font-weight: 900;
        }

        .adk-chapter h3 {
          margin: 0;
          color: var(--adk-text);
          font-size: 14px;
          font-weight: 850;
        }

        .adk-chapter p {
          margin: 7px 0 0;
          color: var(--adk-muted);
          font-size: 12px;
          line-height: 1.7;
        }

        /* --------------------------------------------- */
        /* CODE EXAMPLES                                 */
        /* --------------------------------------------- */

        .adk-code-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 15px;
        }

        .adk-code-tab {
          padding: 9px 14px;
          border: 1px solid var(--adk-border);
          border-radius: 8px;
          background: var(--adk-surface);
          color: var(--adk-muted);
          font-size: 11px;
          font-weight: 850;
          cursor: pointer;
        }

        .adk-code-tab.active {
          background: var(--adk-orange-bright);
          border-color: var(--adk-orange-bright);
          color: white;
        }

        .adk-code-layout {
          display: grid;
          grid-template-columns: minmax(0,.72fr) minmax(0,1.28fr);
          gap: 18px;
        }

        .adk-code-intro {
          display: flex;
          flex-direction: column;
          padding: 25px;
        }

        .adk-code-intro h3 {
          font-size: 20px;
          font-weight: 850;
          margin: 17px 0 10px;
          letter-spacing: -.035em;
        }

        .adk-code-intro p {
          font-size: 12px;
          line-height: 1.8;
        }

        .adk-code-window {
          min-width: 0;
          overflow: hidden;
          border: 1px solid #40372F;
          border-radius: 14px;
          background: #1C1917;
        }

        .adk-code-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 15px;
          background: #29231F;
          color: #D9CBC0;
          border-bottom: 1px solid #40372F;
          font-size: 11px;
        }

        .adk-code-dots {
          display: flex;
          gap: 5px;
        }

        .adk-code-dots i {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #F97316;
        }

        .adk-code-dots i:nth-child(2) {
          background: #FDBA74;
        }

        .adk-code-dots i:nth-child(3) {
          background: #81736A;
        }

        .adk-copy-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          background: transparent;
          border: 1px solid #55483E;
          border-radius: 6px;
          color: #E8DCCF;
          font-size: 10px;
          cursor: pointer;
        }

        .adk-code-window pre {
          margin: 0;
          max-height: 390px;
          padding: 20px;
          overflow: auto;
          color: #F4E7DB;
          font-size: 12px;
          line-height: 1.85;
          tab-size: 4;
        }

        /* --------------------------------------------- */
        /* PROJECT CARDS                                 */
        /* --------------------------------------------- */

        .adk-project-card {
          display: flex;
          flex-direction: column;
          padding: 24px;
          min-width: 0;
        }

        .adk-project-card h3 {
          font-size: 17px;
          margin: 18px 0 9px;
          font-weight: 850;
        }

        .adk-project-card p {
          font-size: 12px;
          line-height: 1.8;
        }

        .adk-project-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: auto;
          padding-top: 20px;
        }

        /* --------------------------------------------- */
        /* FAQ                                           */
        /* --------------------------------------------- */

        .adk-faq-layout {
          display: grid;
          grid-template-columns: minmax(230px,.68fr) minmax(0,1.32fr);
          gap: 39px;
          align-items: start;
        }

        .adk-faq-list {
          display: grid;
          gap: 10px;
        }

        .adk-faq-item {
          border: 1px solid var(--adk-border);
          border-radius: 12px;
          background: var(--adk-surface);
          overflow: hidden;
        }

        .adk-faq-item button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 17px;
          width: 100%;
          background: transparent;
          border: 0;
          color: var(--adk-text);
          text-align: left;
          cursor: pointer;
          font-size: 12px;
          font-weight: 850;
        }

        .adk-faq-answer {
          padding: 0 17px 17px;
          color: var(--adk-muted);
          font-size: 12px;
          line-height: 1.8;
        }

        /* --------------------------------------------- */
        /* FINAL PURCHASE                                */
        /* --------------------------------------------- */

        .adk-final-cta {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 26px;
          overflow: hidden;
          padding: 34px;
          background: #1C1917;
          color: #FFF;
          border-radius: 20px;
        }

        .adk-final-cta::before {
          content: "";
          position: absolute;
          right: -120px;
          top: -140px;
          width: 250px;
          height: 250px;
          border: 1px solid rgba(249,115,22,.3);
          border-radius: 50%;
          box-shadow: 0 0 0 36px rgba(249,115,22,.04);
        }

        .adk-final-cta h2 {
          position: relative;
          margin: 14px 0 0;
          max-width: 660px;
          color: white;
          font-size: clamp(23px,3vw,34px);
          line-height: 1.19;
          letter-spacing: -.045em;
          font-weight: 850;
        }

        .adk-final-cta p {
          position: relative;
          max-width: 650px;
          color: #C7B8AB;
          font-size: 12px;
          line-height: 1.8;
          margin: 12px 0 0;
        }

        .adk-final-actions {
          position: relative;
          display: flex;
          align-items: center;
          gap: 17px;
          flex-shrink: 0;
        }

        .adk-final-price strong {
          font-size: 27px;
          font-family: "Manrope",sans-serif;
          font-weight: 900;
          color: #FFF;
        }

        .adk-final-price del {
          margin-left: 7px;
          font-size: 12px;
          color: #AC9B8F;
        }

        /* --------------------------------------------- */
        /* ERROR                                         */
        /* --------------------------------------------- */

        .adk-error {
          padding: 12px 14px;
          margin-top: 15px;
          border-radius: 10px;
          border: 1px solid #FECACA;
          background: #FFF1F2;
          color: #B91C1C;
          font-size: 11px;
          line-height: 1.7;
        }

        .adk-error button {
          margin-left: 8px;
          background: transparent;
          border: 0;
          text-decoration: underline;
          cursor: pointer;
          color: inherit;
          font-weight: 850;
        }

        /* --------------------------------------------- */
        /* MOBILE BAR                                    */
        /* --------------------------------------------- */

        .adk-mobile-buy {
          display: none;
        }

        @keyframes adkPulse {
          50% { opacity: .45; }
        }

        /* --------------------------------------------- */
        /* RESPONSIVE                                    */
        /* --------------------------------------------- */

        @media (max-width: 1080px) {
          .adk-grid-four {
            grid-template-columns: repeat(2,minmax(0,1fr));
          }

          .adk-architecture-flow {
            grid-template-columns: repeat(2,minmax(0,1fr));
          }

          .adk-architecture-arrow {
            display: none;
          }
        }

        @media (max-width: 850px) {
          .adk-hero-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .adk-cover-stage {
            min-height: 365px;
          }

          .adk-cover-book {
            width: 230px;
          }

          .adk-curriculum-layout,
          .adk-learning-layout,
          .adk-code-layout,
          .adk-faq-layout {
            grid-template-columns: 1fr;
          }

          .adk-curriculum-sidebar {
            position: static;
            grid-template-columns: repeat(2,minmax(0,1fr));
          }

          .adk-trust-strip {
            grid-template-columns: repeat(2,minmax(0,1fr));
          }
        }

        @media (max-width: 600px) {
          .adk-shell {
            width: calc(100% - 28px);
          }

          .adk-section {
            padding: 47px 0;
          }

          .adk-section-heading {
            flex-direction: column;
            align-items: flex-start;
          }

          .adk-hero {
            padding: 85px 0 25px;
          }

          .adk-hero h1 {
            font-size: 38px;
          }

          .adk-hero-points {
            grid-template-columns: 1fr 1fr;
            gap: 11px;
          }

          .adk-hero-purchase {
            flex-direction: column;
            align-items: flex-start;
          }

          .adk-hero-purchase .adk-btn {
            width: 100%;
          }

          .adk-cover-stage {
            min-height: 340px;
          }

          .adk-cover-book {
            width: 210px;
            padding: 17px;
          }

          .adk-cover-content h2 {
            font-size: 23px;
          }

          .adk-cover-content h2 span {
            font-size: 40px;
          }

          .adk-cover-float {
            display: none;
          }

          .adk-grid-two,
          .adk-grid-three,
          .adk-grid-four {
            grid-template-columns: 1fr;
          }

          .adk-curriculum-sidebar {
            grid-template-columns: 1fr;
          }

          .adk-learning-panel {
            padding: 23px;
            min-height: 260px;
          }

          .adk-architecture-board {
            padding: 17px;
          }

          .adk-final-cta {
            flex-direction: column;
            align-items: flex-start;
            padding: 25px;
          }

          .adk-final-actions {
            flex-direction: column;
            align-items: stretch;
            width: 100%;
          }

          .adk-mobile-buy {
            position: fixed;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 45;
            padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
            border-top: 1px solid var(--adk-border);
            background: var(--adk-surface);
            box-shadow: 0 -10px 30px rgba(0,0,0,.12);
          }

          .adk-mobile-price small {
            display: block;
            color: var(--adk-muted);
            font-size: 9px;
          }

          .adk-mobile-price strong {
            font-family: "Manrope",sans-serif;
            color: var(--adk-text);
            font-size: 18px;
            font-weight: 900;
          }

          .adkPage {
            padding-bottom: 70px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .adkPage *,
          .adkPage *::before,
          .adkPage *::after {
            transition-duration: .01ms !important;
            animation-duration: .01ms !important;
          }
        }
      `}</style>

      {/* ============================================== */}
      {/* MAIN PAGE                                      */}
      {/* ============================================== */}

      <main
        className="adkPage"
        data-theme={isDark ? "dark" : "light"}
      >
        {/* Scroll progress */}

        <div
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            width: `${scrollProgress}%`,
            height: 2,
            background: "#F97316",
            zIndex: 49,
            pointerEvents: "none",
          }}
        />

        {/* ============================================ */}
        {/* HERO                                        */}
        {/* ============================================ */}

        <section className="adk-hero">
          <div className="adk-shell adk-hero-grid">
            <div>
              <span className="adk-hero-badge">
                <Sparkles size={13} />
                2ND EDITION · DEVELOPER HANDBOOK
              </span>

              <h1>
                Build real AI agents
                <br />
                with <span>Google ADK.</span>
              </h1>

              <p className="adk-hero-copy">
                {product?.shortDescription ||
                  product?.subtitle ||
                  "A practical, code-first guide to Google ADK. Learn agents, tools, RAG, MCP, A2A, multi-agent workflows, evaluation, observability, and production deployment."}
              </p>

              <div className="adk-hero-points">
                {[
                  "32 structured chapters",
                  "Python implementation examples",
                  "RAG, MCP and A2A integration",
                  "Production engineering practices",
                ].map((point) => (
                  <span key={point}>
                    <CheckCircle2 size={15} />
                    {point}
                  </span>
                ))}
              </div>

              <div className="adk-hero-purchase">
                <div className="adk-hero-price">
                  <small>CURRENT EBOOK PRICE</small>

                  <PriceDisplay
                    price={
                      hasValidPrice ? currentPrice : null
                    }
                    mrp={mrp}
                    currency={currency}
                    discount={discount}
                    loading={loadingProduct}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handlePurchase("hero")}
                  disabled={!canBuy}
                  className="adk-btn adk-btn-orange"
                >
                  Get the handbook
                  <ArrowUpRight size={16} />
                </button>
              </div>

              <div className="adk-hero-links">
                <a href="#contents">
                  Explore all 32 chapters
                  <ArrowDown size={14} />
                </a>

                <span>
                  Digital ebook · One-time payment
                </span>
              </div>

              {productError && (
                <div className="adk-error" role="alert">
                  {productError}

                  <button
                    type="button"
                    onClick={retryProduct}
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>

            <ADKBookCover imageUrl={coverImage} />
          </div>
        </section>

        {/* ============================================ */}
        {/* QUICK FACTS                                 */}
        {/* ============================================ */}

        <div className="adk-shell adk-trust-strip">
          {[
            [BookOpen, "32 detailed chapters"],
            [Code2, "Practical Python code"],
            [Network, "RAG · MCP · A2A"],
            [Rocket, "Production focused"],
          ].map(([Icon, label]) => (
            <div className="adk-trust-item" key={label}>
              <Icon size={18} />
              {label}
            </div>
          ))}
        </div>

        {/* ============================================ */}
        {/* WHY THIS HANDBOOK                           */}
        {/* ============================================ */}

        <section className="adk-section adk-section-alt">
          <div className="adk-shell">
            <SectionHeading
              eyebrow="BUILT FOR DEVELOPERS"
              title="Go from AI experiments to real agent systems."
              description="A structured engineering handbook that connects agent fundamentals with implementation, orchestration, integrations, testing, and production deployment."
            />

            <div className="adk-grid-four">
              {[
                {
                  icon: BookOpen,
                  title: "Structured learning",
                  description:
                    "Progress from first principles through agents, tools, integrations, and production engineering.",
                },
                {
                  icon: Terminal,
                  title: "Code-first approach",
                  description:
                    "Learn through Python snippets, application flows, commands, and implementation concepts.",
                },
                {
                  icon: Network,
                  title: "Connect the ecosystem",
                  description:
                    "Understand how Google ADK works with RAG, MCP, A2A, models, and APIs.",
                },
                {
                  icon: ShieldCheck,
                  title: "Production awareness",
                  description:
                    "Explore evaluation, observability, testing, security, reliability, and deployment.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    className="adk-card adk-feature-card"
                    key={item.title}
                  >
                    <div className="adk-icon">
                      <Icon size={22} />
                    </div>

                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* AGENT ARCHITECTURE                          */}
        {/* ============================================ */}

        <section className="adk-section">
          <div className="adk-shell">
            <SectionHeading
              eyebrow="SYSTEM ARCHITECTURE"
              title="Understand how an AI agent actually works."
              description="Learn how a user request reaches an agent, how the agent invokes tools and services, and how the result is returned through the application."
            />

            <div className="adk-architecture-board">
              <div className="adk-architecture-flow">
                {[
                  {
                    icon: Users,
                    title: "User / API",
                    description:
                      "Receives the incoming request",
                  },
                  {
                    icon: Bot,
                    title: "ADK Agent",
                    description:
                      "Plans and selects tool calls",
                  },
                  {
                    icon: Workflow,
                    title: "Tools / Workflow",
                    description:
                      "Executes authorized operations",
                  },
                  {
                    icon: Database,
                    title: "Data / Services",
                    description:
                      "Returns verified application data",
                  },
                ].map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <React.Fragment key={item.title}>
                      {index > 0 && (
                        <ArrowRight
                          size={18}
                          className="adk-architecture-arrow"
                        />
                      )}

                      <div className="adk-architecture-node">
                        <Icon size={27} />

                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="adk-architecture-note">
                <ShieldCheck size={19} />

                <span>
                  The agent may choose actions, but
                  application services still need to
                  enforce authentication, authorization,
                  validation, and safety checks. The
                  handbook explores these controls
                  alongside agent orchestration.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* CORE ADK CAPABILITIES                       */}
        {/* ============================================ */}

        <section className="adk-section adk-section-alt">
          <div className="adk-shell">
            <SectionHeading
              eyebrow="WHAT YOU WILL MASTER"
              title="Everything you need to build with Google ADK."
              description="Understand the framework's most important building blocks and how they fit together in practical projects."
            />

            <div className="adk-grid-four">
              {[
                {
                  icon: Bot,
                  title: "LLM Agents",
                  description:
                    "Create agents using instructions, models, tools, state, and sessions.",
                },
                {
                  icon: GitBranch,
                  title: "Orchestration",
                  description:
                    "Compose sequential, parallel, and loop-based agent workflows.",
                },
                {
                  icon: Zap,
                  title: "Tools & APIs",
                  description:
                    "Connect agents to deterministic functions, external services, and data.",
                },
                {
                  icon: Layers3,
                  title: "RAG",
                  description:
                    "Build retrieval-aware agents and grounded response flows.",
                },
                {
                  icon: Network,
                  title: "MCP & A2A",
                  description:
                    "Explore protocol-based integrations and specialist agent communication.",
                },
                {
                  icon: BrainCircuit,
                  title: "State & Memory",
                  description:
                    "Work with context, persistent information, sessions, and state.",
                },
                {
                  icon: TestTube,
                  title: "Evaluation",
                  description:
                    "Measure agent quality and build an evaluation and regression workflow.",
                },
                {
                  icon: Cloud,
                  title: "Deployment",
                  description:
                    "Explore runtime, cloud infrastructure, security, and production operations.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    className="adk-card adk-feature-card"
                    key={item.title}
                  >
                    <div className="adk-icon">
                      <Icon size={22} />
                    </div>

                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* INTERACTIVE LEARNING PATH                   */}
        {/* ============================================ */}

        <section className="adk-section">
          <div className="adk-shell">
            <SectionHeading
              eyebrow="YOUR LEARNING JOURNEY"
              title="Seven steps from beginner to production."
              description="A practical progression through the topics needed to design, implement, evaluate, and deploy agent systems."
            />

            <div className="adk-learning-layout">
              <div className="adk-learning-tabs">
                {LEARNING_PATH.map((item) => (
                  <button
                    key={item.n}
                    type="button"
                    className={`adk-learning-tab ${
                      activeSkill === item.n
                        ? "active"
                        : ""
                    }`}
                    onClick={() => setActiveSkill(item.n)}
                  >
                    <span>{item.n}</span>

                    <div style={{ flex: 1 }}>
                      <strong>{item.title}</strong>
                      <small>{item.subtitle}</small>
                    </div>

                    <ChevronRight size={15} />
                  </button>
                ))}
              </div>

              <div className="adk-card adk-learning-panel">
                {(() => {
                  const selected =
                    LEARNING_PATH.find(
                      (item) => item.n === activeSkill
                    ) || LEARNING_PATH[0];

                  return (
                    <>
                      <div className="adk-icon">
                        <Rocket size={23} />
                      </div>

                      <span
                        className="adk-learning-panel-number"
                        style={{ marginTop: 20 }}
                      >
                        LEARNING STAGE {selected.n}
                      </span>

                      <h3>{selected.title}</h3>

                      <p>{selected.description}</p>

                      <div style={{
                        marginTop: 25,
                        paddingTop: 18,
                        borderTop:
                          "1px solid var(--adk-border)",
                      }}>
                        <span style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          color: "var(--adk-orange)",
                          fontSize: 11,
                          fontWeight: 850,
                        }}>
                          <CheckCircle2 size={15} />
                          Covered in the handbook
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* COMPLETE CURRICULUM                         */}
        {/* ============================================ */}

        <section
          className="adk-section adk-section-alt"
          id="contents"
          style={{ scrollMarginTop: 90 }}
        >
          <div className="adk-shell">
            <SectionHeading
              eyebrow="COMPLETE BOOK CONTENTS"
              title="32 chapters. One complete developer handbook."
              description="Explore the full learning path from the first ADK agent through tool calling, multi-agent orchestration, RAG, MCP, A2A, evaluation, observability, FastAPI, and deployment."
            />

            <div className="adk-curriculum-layout">
              <div className="adk-curriculum-sidebar">
                {CHAPTER_GROUPS.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    className={`adk-curriculum-tab ${
                      activeChapterGroup === group.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setChapterSearch("");
                      setActiveChapterGroup(group.id);
                    }}
                  >
                    <span>{group.number}</span>

                    <div style={{ flex: 1 }}>
                      <strong>{group.title}</strong>
                      <small>
                        {group.chapters.length} chapters
                      </small>
                    </div>

                    <ChevronRight size={15} />
                  </button>
                ))}
              </div>

              <div style={{ minWidth: 0 }}>
                <div className="adk-curriculum-search">
                  <Search size={17} />

                  <input
                    type="search"
                    value={chapterSearch}
                    onChange={(event) =>
                      setChapterSearch(event.target.value)
                    }
                    placeholder="Search RAG, MCP, memory, evals, deployment..."
                    aria-label="Search ebook chapters"
                  />

                  {chapterSearch && (
                    <button
                      type="button"
                      onClick={() => setChapterSearch("")}
                      aria-label="Clear search"
                      style={{
                        border: 0,
                        background: "transparent",
                        color: "var(--adk-muted)",
                        cursor: "pointer",
                      }}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {(chapterSearch
                  ? filteredChapterGroups
                  : CHAPTER_GROUPS.filter(
                      (group) =>
                        group.id === activeChapterGroup
                    )
                ).map((group) => (
                  <div
                    key={group.id}
                    style={{ marginBottom: 20 }}
                  >
                    <div style={{
                      padding: "5px 0 14px",
                    }}>
                      <h3 style={{
                        fontSize: 17,
                        fontWeight: 850,
                        margin: 0,
                      }}>
                        {group.title}
                      </h3>

                      <p style={{
                        fontSize: 12,
                        color: "var(--adk-muted)",
                        margin: "6px 0 0",
                      }}>
                        {group.subtitle}
                      </p>
                    </div>

                    <div className="adk-chapter-list">
                      {group.chapters.map(
                        ([number, title, description]) => (
                          <article
                            key={number}
                            className="adk-chapter"
                          >
                            <span className="adk-chapter-number">
                              {number}
                            </span>

                            <div>
                              <h3>{title}</h3>
                              <p>{description}</p>
                            </div>
                          </article>
                        )
                      )}
                    </div>
                  </div>
                ))}

                {filteredChapterGroups.length === 0 && (
                  <div className="adk-card" style={{
                    padding: 30,
                    textAlign: "center",
                  }}>
                    <Search
                      size={24}
                      style={{
                        color: "var(--adk-orange)",
                        margin: "0 auto",
                      }}
                    />

                    <p style={{
                      margin: "13px 0",
                      fontSize: 12,
                    }}>
                      No matching chapters found.
                    </p>

                    <button
                      type="button"
                      className="adk-btn adk-btn-outline"
                      onClick={() => setChapterSearch("")}
                    >
                      Show all chapters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* CODE EXAMPLES                               */}
        {/* ============================================ */}

        <section className="adk-section" id="code-examples">
          <div className="adk-shell">
            <SectionHeading
              eyebrow="LEARN WITH REAL PYTHON"
              title="From the first agent to multi-agent workflows."
              description="Explore code examples from the handbook. Switch between creating an agent, adding tools, retrieving knowledge, and orchestrating multiple agents."
            />

            <div className="adk-code-tabs">
              {CODE_EXAMPLES.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  className={`adk-code-tab ${
                    activeCode === example.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    setActiveCode(example.id);
                    setCopied(false);
                  }}
                >
                  {example.label}
                </button>
              ))}
            </div>

            <div className="adk-code-layout">
              <div className="adk-card adk-code-intro">
                <div className="adk-icon">
                  <Terminal size={23} />
                </div>

                <h3>{selectedCode.title}</h3>
                <p>{selectedCode.description}</p>

                <div style={{
                  display: "grid",
                  gap: 12,
                  marginTop: "auto",
                  paddingTop: 24,
                }}>
                  {[
                    "Google ADK examples",
                    "Python implementation",
                    "Developer-oriented explanations",
                  ].map((item) => (
                    <div
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        color: "var(--adk-muted)",
                        fontSize: 11,
                      }}
                    >
                      <CheckCircle2
                        size={15}
                        style={{
                          color: "var(--adk-orange)",
                        }}
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="adk-code-window">
                <div className="adk-code-toolbar">
                  <div className="adk-code-dots">
                    <i />
                    <i />
                    <i />
                  </div>

                  <span>{selectedCode.filename}</span>

                  <button
                    type="button"
                    className="adk-copy-btn"
                    onClick={copyCode}
                  >
                    {copied ? (
                      <Check size={13} />
                    ) : (
                      <Copy size={13} />
                    )}

                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <pre>
                  <code>{selectedCode.code}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* PRACTICAL PROJECTS                           */}
        {/* ============================================ */}

        <section className="adk-section adk-section-alt">
          <div className="adk-shell">
            <SectionHeading
              eyebrow="PRACTICAL IMPLEMENTATION"
              title="Learn by building useful AI agents."
              description="Move beyond an isolated Hello World example and understand how agents can research, call APIs, retrieve knowledge, and cooperate."
            />

            <div className="adk-grid-four">
              {PROJECTS.map((project) => {
                const Icon = project.icon;

                return (
                  <article
                    className="adk-card adk-project-card"
                    key={project.number}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <div className="adk-icon">
                        <Icon size={22} />
                      </div>

                      <span style={{
                        fontSize: 10,
                        fontWeight: 900,
                        color: "var(--adk-orange)",
                      }}>
                        {project.number}
                      </span>
                    </div>

                    <h3>{project.title}</h3>
                    <p>{project.description}</p>

                    <div className="adk-project-tags">
                      {project.tags.map((tag) => (
                        <SmallTag key={tag}>
                          {tag}
                        </SmallTag>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* PRODUCTION ENGINEERING                      */}
        {/* ============================================ */}

        <section className="adk-section">
          <div className="adk-shell">
            <SectionHeading
              eyebrow="PRODUCTION ENGINEERING"
              title="Building an agent is just the beginning."
              description="Understand the engineering work that turns an agent prototype into a more reliable, observable, secure, and maintainable application."
            />

            <div className="adk-grid-four">
              {[
                {
                  icon: TestTube,
                  title: "Evaluation",
                  description:
                    "Build datasets, inspect output quality and detect regressions before deployment.",
                },
                {
                  icon: Search,
                  title: "Observability",
                  description:
                    "Trace agent interactions, monitor tool calls and investigate failure patterns.",
                },
                {
                  icon: Lock,
                  title: "Security",
                  description:
                    "Protect private information, validate tool arguments and enforce access control.",
                },
                {
                  icon: Cloud,
                  title: "Deployment",
                  description:
                    "Expose agents through FastAPI and explore cloud runtimes and operational concerns.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    className="adk-card adk-feature-card"
                    key={item.title}
                  >
                    <div className="adk-icon">
                      <Icon size={22} />
                    </div>

                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* HANDBOOK APPROACH                           */}
        {/* ============================================ */}

        <section className="adk-section adk-section-alt">
          <div className="adk-shell">
            <SectionHeading
              eyebrow="THE DEVELOPER HANDBOOK APPROACH"
              title="A structured path alongside official documentation."
              description="Official documentation remains the source of truth for SDK behavior. This handbook helps organize the developer journey through concepts, implementation, production concerns, and practical examples."
            />

            <div className="adk-card" style={{
              overflow: "hidden",
            }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                background: "var(--adk-soft)",
                fontSize: 11,
                fontWeight: 900,
                color: "var(--adk-text)",
              }}>
                <div style={{ padding: 16 }}>
                  Learning challenge
                </div>

                <div style={{
                  padding: 16,
                  color: "var(--adk-orange)",
                }}>
                  Handbook approach
                </div>
              </div>

              {[
                [
                  "Where should I start?",
                  "Fundamentals → Setup → First Agent",
                ],
                [
                  "How do the concepts connect?",
                  "Concept → Flow → Code",
                ],
                [
                  "What comes after basic agents?",
                  "Tools → Workflows → RAG → Protocols",
                ],
                [
                  "How should I prepare for production?",
                  "Evaluation → Observability → Security → Deployment",
                ],
              ].map(([question, answer]) => (
                <div
                  key={question}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    borderTop:
                      "1px solid var(--adk-border)",
                    fontSize: 12,
                    lineHeight: 1.75,
                  }}
                >
                  <div style={{
                    padding: 17,
                    color: "var(--adk-muted)",
                  }}>
                    {question}
                  </div>

                  <div style={{
                    padding: 17,
                    color: "var(--adk-text)",
                    fontWeight: 750,
                  }}>
                    {answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* FAQ                                          */}
        {/* ============================================ */}

        <section className="adk-section">
          <div className="adk-shell adk-faq-layout">
            <SectionHeading
              eyebrow="FREQUENTLY ASKED QUESTIONS"
              title="Questions about the handbook?"
              description="Details about the chapters, prerequisites, digital format, and purchase support."
            />

            <div className="adk-faq-list">
              {FAQS.map(([question, answer], index) => (
                <div
                  className="adk-faq-item"
                  key={question}
                >
                  <button
                    type="button"
                    aria-expanded={openFaq === index}
                    onClick={() =>
                      setOpenFaq(
                        openFaq === index ? null : index
                      )
                    }
                  >
                    {question}

                    <ChevronDown
                      size={16}
                      style={{
                        flexShrink: 0,
                        color: "var(--adk-orange)",
                        transition: "transform .2s",
                        transform:
                          openFaq === index
                            ? "rotate(180deg)"
                            : "none",
                      }}
                    />
                  </button>

                  {openFaq === index && (
                    <div className="adk-faq-answer">
                      {answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* FINAL PURCHASE                               */}
        {/* ============================================ */}

        <section
          className="adk-section"
          style={{ paddingTop: 15 }}
        >
          <div className="adk-shell">
            <div className="adk-final-cta">
              <div>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#FDBA74",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: ".1em",
                }}>
                  <Sparkles size={14} />
                  TARGET TREK · GOOGLE ADK
                </span>

                <h2>
                  From your first agent to
                  production AI systems.
                </h2>

                <p>
                  Learn Google ADK fundamentals,
                  multi-agent workflows, RAG,
                  MCP, A2A, evaluation,
                  observability, and deployment
                  through a structured code-first
                  developer handbook.
                </p>
              </div>

              <div className="adk-final-actions">
                <div className="adk-final-price">
                  <small style={{
                    display: "block",
                    fontSize: 10,
                    marginBottom: 5,
                    color: "#C7B5A8",
                  }}>
                    EBOOK PRICE
                  </small>

                  <strong>
                    {loadingProduct
                      ? "Loading..."
                      : hasValidPrice
                      ? formatMoney(
                          currentPrice,
                          currency
                        )
                      : "Unavailable"}
                  </strong>

                  {mrp !== null && (
                    <del>
                      {formatMoney(mrp, currency)}
                    </del>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handlePurchase("final_cta")
                  }
                  disabled={!canBuy}
                  className="adk-btn adk-btn-orange"
                >
                  Get the handbook
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>

            <p style={{
              margin: "15px 0 0",
              fontSize: 11,
              color: "var(--adk-muted)",
              lineHeight: 1.8,
            }}>
              This is a digital ebook. Purchases
              are non-refundable. For payment or
              access assistance, contact{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                style={{
                  color: "var(--adk-orange)",
                  fontWeight: 850,
                }}
              >
                {SUPPORT_EMAIL}
              </a>.
            </p>
          </div>
        </section>

        {/* ============================================ */}
        {/* MOBILE STICKY PURCHASE BAR                   */}
        {/* ============================================ */}

        <div className="adk-mobile-buy">
          <div className="adk-mobile-price">
            <small>GOOGLE ADK HANDBOOK</small>

            <strong>
              {loadingProduct
                ? "Loading..."
                : hasValidPrice
                ? formatMoney(currentPrice, currency)
                : "Unavailable"}
            </strong>

            {discount > 0 && (
              <small style={{
                color: "var(--adk-orange)",
                fontWeight: 850,
              }}>
                {discount}% OFF
              </small>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              handlePurchase("mobile_sticky")
            }
            disabled={!canBuy}
            className="adk-btn adk-btn-orange"
          >
            Get Ebook
            <ArrowRight size={15} />
          </button>
        </div>
      </main>

      {/* ============================================== */}
      {/* EXISTING CHECKOUT MODAL                       */}
      {/* ============================================== */}

      <PayUCheckoutModal
        isOpen={isCheckoutOpen && canBuy}
        onClose={() => setIsCheckoutOpen(false)}
        product={product}
      />
    </>
  );
}
