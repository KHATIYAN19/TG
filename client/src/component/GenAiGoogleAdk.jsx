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
import PayUCheckoutModal from "../payment/PayUCheckoutModal";

export default function GenAiGoogleAdk() {
  /* =========================================================
     CONFIG
     ========================================================= */
  const GA_MEASUREMENT_ID = "G-5FPEL1W0VB";
  const BASE_URL =
    import.meta.env.VITE_BASE_URL || "http://localhost:5001";

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const GOOGLE_ADK_MRP = Number(product?.mrp ?? 0);
  const GOOGLE_ADK_PRICE = Number(product?.price ?? 0);
  const GOOGLE_ADK_CURRENCY = product?.currency || "INR";

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeCode, setActiveCode] = useState(0);
  const [activeSkill, setActiveSkill] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
 
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const referralCode = (
    params.get("referralCode") || params.get("ref") || ""
  ).trim();

  if (referralCode) {
    localStorage.setItem("referralCode", referralCode);
  }
}, []);
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
  /* =========================================================
     DYNAMIC BOOK DATA
     ========================================================= */
  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        setProductError("");

        const redirectUrl = window.location.pathname;
        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(redirectUrl)}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }
        );

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success || !result?.data) {
          throw new Error(
            result?.error?.message ||
              result?.message ||
              "Unable to load ebook details."
          );
        }

        setProduct(result.data);
      } catch (error) {
        if (error?.name === "AbortError") return;

        console.error("Failed to fetch Google ADK ebook:", error);
        setProduct(null);
        setProductError(error?.message || "Unable to load ebook details.");
      } finally {
        if (!controller.signal.aborted) {
          setLoadingProduct(false);
        }
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [BASE_URL]);

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
    if (!product?._id) {
      console.error(
        productError || "Google ADK ebook information is unavailable."
      );
      return;
    }

    try {
      window.dataLayer = window.dataLayer || [];

      window.dataLayer.push({
        event: "adk_purchase_click",
        product: product.slug || "google_adk_handbook_2nd_edition",
        source,
        bookId: product._id,
        price: GOOGLE_ADK_PRICE,
        currency: GOOGLE_ADK_CURRENCY,
      });

      if (typeof window.gtag === "function") {
        window.gtag("event", "begin_checkout", {
          currency: GOOGLE_ADK_CURRENCY,
          value: GOOGLE_ADK_PRICE,
          source,
          items: [
            {
              item_id: product._id,
              item_name:
                product.title ||
                "Google ADK Complete Developer Handbook - 2nd Edition",
              price: GOOGLE_ADK_PRICE,
              quantity: 1,
            },
          ],
        });
      }
    } catch (error) {
      console.warn("Purchase analytics failed:", error);
    }

    setIsCheckoutOpen(true);
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
      <PayUCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={product}
      />

    </main>
  );
}
