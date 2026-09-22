import React from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  Layers3,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
  BookOpen,
  Database,
  Network,
  Search,
  Zap,
  Server,
  TestTube,
  Lock,
  GitBranch,
} from "lucide-react";

import ADK_PAYMENT_URL from "../utils/adk_payment_url";

const paymentLink = ADK_PAYMENT_URL;

/* =========================================================
   PRICE CONFIGURATION
   ========================================================= */

const GOOGLE_ADK_MRP = Number(
  import.meta.env.VITE_GOOGLE_ADK_MRP
);

const GOOGLE_ADK_PRICE = Number(
  import.meta.env.VITE_GOOGLE_ADK_PRICE
);

/* =========================================================
   PRICE VALIDATION
   ========================================================= */

if (
  !Number.isFinite(GOOGLE_ADK_MRP) ||
  !Number.isFinite(GOOGLE_ADK_PRICE)
) {
  console.error(
    "Google ADK pricing is not configured correctly. Please set VITE_GOOGLE_ADK_MRP and VITE_GOOGLE_ADK_PRICE."
  );
}

/* =========================================================
   PURCHASE
   ========================================================= */

const handlePurchase = (source = "unknown") => {
  /*
   * Optional analytics.
   * These do nothing if Google Analytics / GTM is not installed.
   */

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
        items: [
          {
            item_id: "google_adk_handbook_2nd_edition",
            item_name:
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

  window.open(
    paymentLink,
    "_blank",
    "noopener,noreferrer"
  );
};

/* =========================================================
   CHAPTERS
   ========================================================= */

const chapters = [
  [
    "01",
    "Agentic AI Fundamentals",
    "Agent loops, tools, context, memory, workflows, and when agents make sense.",
  ],
  [
    "02",
    "Google ADK: What It Is & Where It Fits",
    "Understand ADK, the developer workflow, and the current Agents CLI.",
  ],
  [
    "03",
    "Setup, Installation & Authentication",
    "Install ADK, configure Gemini or Vertex AI, and create your first agent.",
  ],
  [
    "04",
    "Project Structure & Developer Workflow",
    "Organize agents, services, tests, evaluation datasets, and deployment files.",
  ],
  [
    "05",
    "LlmAgent: The Core Agent Type",
    "Build LLM-powered agents and understand the decision/tool-use loop.",
  ],
  [
    "06",
    "Sequential, Parallel & Loop Agents",
    "Master the core workflow agents and practical orchestration patterns.",
  ],
  [
    "07",
    "Custom Agents & Graph Workflows",
    "Create advanced control flow when standard workflow agents are not enough.",
  ],
  [
    "08",
    "Tools & Function Calling",
    "Connect agents to application logic, APIs, databases, and external capabilities.",
  ],
  [
    "09",
    "Built-in Tools, Search, Files & Toolsets",
    "Use built-in capabilities and understand toolset-based architectures.",
  ],
  [
    "10",
    "Callbacks, Plugins & Guardrails",
    "Observe, intercept, validate, authorize, retry, and control agent behavior.",
  ],
  [
    "11",
    "Sessions, State, Context & Memory",
    "Understand short-term state, sessions, context, and persistent memory.",
  ],
  [
    "12",
    "RAG: Full Working Pipeline",
    "Build retrieval-augmented agents with ingestion, embeddings, retrieval, and grounding.",
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
    "Work with streaming events, live interactions, files, and multimodal inputs.",
  ],
  [
    "17",
    "Artifacts & File Handling",
    "Manage generated files and artifacts safely across agent workflows.",
  ],
  [
    "18",
    "Evaluation: Datasets, Metrics & Eval-Fix Loop",
    "Create evaluations, measure behavior, and turn failures into regression tests.",
  ],
  [
    "19",
    "Observability, Tracing & Debugging",
    "Trace agent runs, inspect tool calls, and debug production behavior.",
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
    "Combine research, RAG, orchestration, synthesis, and review into one system.",
  ],
  [
    "24",
    "Security, Privacy & Reliability",
    "Handle prompt injection, tool abuse, data leakage, retries, and failure modes.",
  ],
  [
    "25",
    "Structured Output, Schemas & Validation",
    "Return predictable structured results and validate model-generated data.",
  ],
  [
    "26",
    "Caching, Context Control & Cost Engineering",
    "Control token usage, context growth, latency, and model costs.",
  ],
  [
    "27",
    "CLI: Commands You Actually Need",
    "Practical commands for creating, running, evaluating, scaffolding, and deploying agents.",
  ],
  [
    "28",
    "Testing Strategy for Agentic Systems",
    "Build unit, integration, failure-injection, and behavior-focused tests.",
  ],
  [
    "29",
    "Observability + Evaluation + Guardrails Pipeline",
    "Connect telemetry, quality checks, guardrails, and continuous improvement.",
  ],
  [
    "30",
    "Troubleshooting Guide",
    "Diagnose common setup, model, tool, deployment, and runtime problems.",
  ],
  [
    "31",
    "Production Checklist",
    "A practical checklist for taking an agent system toward production.",
  ],
  [
    "32",
    "Developer Cheat Sheets & Reference Architecture",
    "Quick references, architecture patterns, commands, and reusable mental models.",
  ],
];

/* =========================================================
   LEARNING POINTS
   ========================================================= */

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

/* =========================================================
   PROJECTS
   ========================================================= */

const projects = [
  {
    icon: Sparkles,
    title: "Research Agent",
    description:
      "Build an agent that researches a topic, gathers information and produces a structured result.",
  },
  {
    icon: Code2,
    title: "API Agent",
    description:
      "Connect an AI agent with external APIs and allow it to perform real-world actions.",
  },
  {
    icon: Layers3,
    title: "RAG Agent",
    description:
      "Create an agent that can answer questions using your own documents and knowledge base.",
  },
  {
    icon: Users,
    title: "Multi-Agent System",
    description:
      "Create specialized agents and orchestrate them into a complete AI workflow.",
  },
];

/* =========================================================
   FAQ
   ========================================================= */

const faqs = [
  {
    question: "Who is this ebook for?",
    answer:
      "It is designed for developers, backend engineers, GenAI learners, and software engineers who want a practical path from ADK fundamentals to production-oriented agent systems.",
  },
  {
    question: "What is covered in the 2nd Edition?",
    answer:
      "The handbook covers 32 chapters including agents, tools, workflow agents, sessions and memory, RAG, MCP, A2A, LiteLLM, streaming, artifacts, evaluation, observability, deployment, FastAPI, security, testing, performance, and production checklists.",
  },
  {
    question: "Does the ebook contain code and commands?",
    answer:
      "Yes. It follows a concept → flow → code → commands → production notes approach, with implementation examples throughout the handbook.",
  },
  {
    question: "Is prior Google ADK experience required?",
    answer:
      "No. The handbook starts with fundamentals and setup before moving into advanced orchestration, integrations, evaluation, and deployment.",
  },
  {
    question: "Is this a video course?",
    answer:
      "No. It is a developer-focused ebook and reference handbook designed to accompany hands-on implementation.",
  },
  {
    question: "Is the ebook refundable?",
    answer:
      "No. Due to the digital nature of the ebook, all purchases are non-refundable. Please review the contents and FAQ before purchasing.",
  },
  {
    question: "How can I get support?",
    answer:
      "For purchase or ebook-related issues, contact supporttargettrek@gmail.com.",
  },
];

/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

function FAQItem({ question, answer }) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
        <span>{question}</span>

        <ChevronDown
          size={20}
          className="shrink-0 text-slate-400 transition-transform group-open:rotate-180"
        />
      </summary>

      <p className="mt-4 pr-8 text-sm leading-7 text-slate-600">
        {answer}
      </p>
    </details>
  );
}

function SectionLabel({ children, dark = false }) {
  return (
    <p
      className={`text-sm font-black uppercase tracking-[0.18em] ${
        dark ? "text-blue-400" : "text-blue-600"
      }`}
    >
      {children}
    </p>
  );
}

/* =========================================================
   MAIN PAGE
   ========================================================= */

export default function EbookPage() {
  const chaptersByGroup = [
    {
      label: "FOUNDATIONS",
      items: chapters.slice(0, 5),
    },
    {
      label: "ORCHESTRATION & TOOLS",
      items: chapters.slice(5, 11),
    },
    {
      label: "INTEGRATIONS",
      items: chapters.slice(11, 17),
    },
    {
      label: "PRODUCTION",
      items: chapters.slice(17, 25),
    },
    {
      label: "ENGINEERING & REFERENCE",
      items: chapters.slice(25),
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#07111f] text-white">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute -right-40 top-10 h-[600px] w-[600px] rounded-full bg-indigo-500/15 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-14 lg:px-8 lg:pb-28 lg:pt-24">

          <div className="grid items-center gap-16 lg:grid-cols-[1.12fr_.88fr]">

            {/* LEFT */}

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-bold text-blue-300">
                <Sparkles size={16} />
                2nd Edition • Developer Handbook
              </div>

              <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                Learn Google ADK
                <span className="block text-blue-400">
                  by Building Real AI Agents
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                A practical, code-first developer handbook that takes you
                from your first Google ADK agent to tools, RAG, MCP, A2A,
                multi-agent workflows, evaluation and production deployment.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">

                {[
                  "32 Chapters",
                  "Practical Code",
                  "RAG + MCP + A2A",
                  "Production Topics",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-200"
                  >
                    {item}
                  </span>
                ))}

              </div>

              {/* CTA */}

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">

                <button
                  onClick={() => handlePurchase("hero")}
                  className="group inline-flex items-center justify-center gap-3 rounded-xl bg-blue-500 px-7 py-4 font-black text-white shadow-xl shadow-blue-950/40 transition hover:bg-blue-400"
                >
                  <span>GET INSTANT PDF ACCESS</span>

                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-blue-200 line-through">
                      ₹{GOOGLE_ADK_MRP}
                    </span>

                    <span className="text-lg">
                      ₹{GOOGLE_ADK_PRICE}
                    </span>
                  </span>

                  <ArrowRight
                    size={19}
                    className="transition group-hover:translate-x-1"
                  />
                </button>

                <a
                  href="#contents"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] px-7 py-4 font-bold text-slate-200 transition hover:bg-white/10"
                >
                  See What's Inside
                </a>

              </div>

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                <span>✓ One-time payment</span>
                <span>✓ Instant digital access</span>
                <span>✓ No subscription</span>
              </div>

            </div>

            {/* BOOK */}

            <div className="flex justify-center lg:justify-end">

              <div className="relative">

                <div className="absolute -inset-12 rounded-full bg-blue-500/20 blur-3xl" />

                <div className="relative w-[300px] rotate-[-3deg] rounded-r-2xl rounded-l-md border border-white/10 bg-gradient-to-br from-[#173d78] via-[#0d63c9] to-[#37238d] p-8 shadow-2xl shadow-black/50 sm:w-[360px]">

                  <div className="absolute left-0 top-0 h-full w-3 rounded-l-md bg-black/20" />

                  <div className="flex h-[480px] flex-col justify-between">

                    <div>

                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                        <Terminal size={15} />
                        Developer Handbook
                      </div>

                      <div className="mt-7 h-px bg-white/20" />

                      <p className="mt-10 text-xs font-black uppercase tracking-[0.22em] text-blue-100">
                        2nd Edition
                      </p>

                      <h2 className="mt-4 text-4xl font-black leading-[1.02] text-white">
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

                      <p className="mt-5 max-w-[240px] text-sm leading-6 text-blue-100">
                        From first agent to RAG, MCP, A2A, evaluation,
                        observability and production deployment.
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
                        ].map((tag) => (
                          <span
                            key={tag}
                            className="rounded-lg bg-white/10 px-3 py-2 text-[10px] font-bold text-white"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <p className="mt-5 text-xs font-bold text-blue-100">
                        Practical • Code-first • Production-aware
                      </p>

                    </div>

                  </div>
                </div>

                {/* PRICE */}

                <div className="absolute -bottom-6 -right-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-2xl sm:-right-8">

                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
                    Current Price
                  </p>

                  <div className="mt-1 flex items-center gap-2">

                    <span className="text-sm font-bold text-slate-400 line-through">
                      ₹{GOOGLE_ADK_MRP}
                    </span>

                    <span className="text-3xl font-black text-blue-600">
                      ₹{GOOGLE_ADK_PRICE}
                    </span>

                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          TRUST STRIP
      ===================================================== */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto grid max-w-6xl grid-cols-2 lg:grid-cols-4">

          {[
            ["32 Chapters", "Structured learning path"],
            ["Code-First", "Commands + implementation"],
            ["RAG / MCP / A2A", "Modern agent integrations"],
            ["Production", "Evaluation + deployment"],
          ].map(([title, description]) => (
            <div
              key={title}
              className="border-r border-slate-200 px-5 py-7 text-center last:border-r-0"
            >
              <p className="font-black text-slate-900">
                {title}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* =====================================================
          PROBLEM / VALUE
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">

        <div className="grid items-center gap-14 lg:grid-cols-[.82fr_1.18fr]">

          <div>

            <SectionLabel>
              Built for developers
            </SectionLabel>

            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Stop jumping between scattered concepts.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Learning agent development can involve agents, tools,
              orchestration, memory, RAG, protocols, evaluation and
              deployment. This handbook puts those topics into one structured
              developer-focused learning path.
            </p>

          </div>

          <div className="grid gap-5 sm:grid-cols-2">

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
            ].map(([Icon, title, description]) => (
              <div
                key={title}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={23} />
                </div>

                <h3 className="mt-5 text-xl font-black">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {description}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* =====================================================
          WHY NOT JUST DOCS?
      ===================================================== */}

      <section className="bg-slate-900 py-24 text-white">

        <div className="mx-auto max-w-6xl px-6 lg:px-8">

          <div className="grid gap-12 lg:grid-cols-2">

            <div>

              <SectionLabel dark>
                The real value
              </SectionLabel>

              <h2 className="mt-3 text-4xl font-black sm:text-5xl">
                “Why not just use the free documentation?”
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-400">
                Official documentation is valuable and remains an important
                source of truth. This handbook is positioned differently:
                it gives you a structured learning sequence focused on the
                developer journey from fundamentals through implementation
                and production topics.
              </p>

            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">

              <div className="grid grid-cols-2 border-b border-white/10">

                <div className="p-5 text-sm font-black text-slate-400">
                  Learning challenge
                </div>

                <div className="p-5 text-sm font-black text-blue-400">
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
              ].map(([left, right]) => (
                <div
                  key={left}
                  className="grid grid-cols-2 border-b border-white/10 last:border-b-0"
                >

                  <div className="p-5 text-sm text-slate-400">
                    {left}
                  </div>

                  <div className="p-5 text-sm font-semibold text-slate-200">
                    {right}
                  </div>

                </div>
              ))}

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          WHAT YOU LEARN
      ===================================================== */}

      <section className="bg-white py-24">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="grid gap-14 lg:grid-cols-[.78fr_1.22fr]">

            <div>

              <SectionLabel>
                What you learn
              </SectionLabel>

              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                One handbook for the full agent lifecycle.
              </h2>

              <p className="mt-5 leading-8 text-slate-600">
                Start with the mental model and setup. Then move into
                orchestration, integrations, evaluation, operations and
                production.
              </p>

              <button
                onClick={() => handlePurchase("learning_section")}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-black text-white transition hover:bg-blue-700"
              >
                Get Instant Access
                <ArrowRight size={18} />
              </button>

            </div>

            <div className="grid gap-3 sm:grid-cols-2">

              {learningPoints.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >

                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Check size={13} strokeWidth={3} />
                  </span>

                  <p className="text-sm font-semibold leading-6 text-slate-700">
                    {item}
                  </p>

                </div>
              ))}

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          TOPIC MAP
      ===================================================== */}

      <section className="bg-slate-50 py-24">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="text-center">

            <SectionLabel>
              What is inside
            </SectionLabel>

            <h2 className="mt-3 text-4xl font-black sm:text-5xl">
              The topics developers actually need.
            </h2>

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
              <div
                key={title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={21} />
                </div>

                <h3 className="mt-5 text-lg font-black">
                  {title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* =====================================================
          PROJECTS
      ===================================================== */}

      <section className="bg-white py-24">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="max-w-3xl">

            <SectionLabel>
              Build with the concepts
            </SectionLabel>

            <h2 className="mt-3 text-4xl font-black sm:text-5xl">
              Learn by thinking in real agent systems.
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              The handbook includes patterns around research agents, API
              agents, RAG systems and multi-agent architectures.
            </p>

          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            {projects.map(
              ({ icon: Icon, title, description }, index) => (
                <div
                  key={title}
                  className="group rounded-3xl border border-slate-200 bg-slate-50 p-7 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-lg"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <Icon size={23} />
                    </div>

                    <span className="font-mono text-xs font-bold text-slate-400">
                      0{index + 1}
                    </span>

                  </div>

                  <h3 className="mt-6 text-xl font-black">
                    {title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {description}
                  </p>

                </div>
              )
            )}

          </div>
        </div>
      </section>

      {/* =====================================================
          CODE SAMPLE
      ===================================================== */}

      <section className="bg-blue-50 py-24">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            <div>

              <SectionLabel>
                Code-first learning
              </SectionLabel>

              <h2 className="mt-3 text-4xl font-black sm:text-5xl">
                Understand the flow.
                <br />
                Then write the code.
              </h2>

              <p className="mt-6 leading-8 text-slate-600">
                The handbook does not stop at definitions. It explains how
                agent components connect and gives implementation examples and
                commands for important building blocks.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">

                {[
                  "Installation & authentication",
                  "Agent implementations",
                  "Workflow orchestration",
                  "RAG implementation",
                  "MCP integration",
                  "Evaluation & deployment",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm font-bold text-slate-700"
                  >
                    <Check size={17} className="text-blue-600" />
                    {item}
                  </div>
                ))}

              </div>

            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">

              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">

                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />

                <span className="ml-3 text-xs text-slate-500">
                  agent.py
                </span>

              </div>

              <pre className="overflow-x-auto p-6 text-sm leading-7 text-slate-300">
                <code>{`from google.adk.agents import LlmAgent

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
# observability and deployment.`}</code>
              </pre>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          32 CHAPTERS
      ===================================================== */}

      <section
        id="contents"
        className="bg-[#07111f] py-24 text-white"
      >

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="max-w-3xl">

            <SectionLabel dark>
              32-chapter contents
            </SectionLabel>

            <h2 className="mt-3 text-4xl font-black sm:text-5xl">
              From your first agent to production architecture.
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Every chapter follows a practical structure:
              concept → flow → code → commands → how it works → production notes.
            </p>

          </div>

          <div className="mt-14 space-y-12">

            {chaptersByGroup.map((group) => (
              <div key={group.label}>

                <p className="mb-4 text-xs font-black tracking-[0.2em] text-blue-400">
                  {group.label}
                </p>

                <div className="grid gap-3 md:grid-cols-2">

                  {group.items.map(
                    ([number, title, description]) => (
                      <div
                        key={number}
                        className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-blue-400/40 hover:bg-white/[0.07]"
                      >

                        <div className="flex gap-4">

                          <span className="font-mono text-sm font-black text-blue-400">
                            {number}
                          </span>

                          <div>

                            <h3 className="font-bold text-white">
                              {title}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              {description}
                            </p>

                          </div>

                        </div>

                      </div>
                    )
                  )}

                </div>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* =====================================================
          MID CTA
      ===================================================== */}

      <section className="bg-blue-600 py-16">

        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-7 px-6 text-center lg:flex-row lg:text-left lg:px-8">

          <div>

            <p className="text-sm font-black uppercase tracking-[.18em] text-blue-100">
              Ready to build?
            </p>

            <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              Get the complete developer handbook.
            </h2>

            <p className="mt-2 text-blue-100">
              32 chapters • Code • RAG • MCP • A2A • Production
            </p>

          </div>

          <button
            onClick={() => handlePurchase("mid_page")}
            className="inline-flex shrink-0 items-center gap-3 rounded-xl bg-white px-7 py-4 font-black text-blue-700 shadow-xl transition hover:bg-slate-100"
          >
            Get Instant PDF Access

            <span className="font-black">
              ₹{GOOGLE_ADK_PRICE}
            </span>

            <ArrowRight size={19} />
          </button>

        </div>
      </section>

      {/* =====================================================
          PRICING
      ===================================================== */}

      <section
        id="pricing"
        className="relative overflow-hidden bg-[#07111f] py-24"
      >

        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[120px]" />

        <div className="relative mx-auto max-w-5xl px-6 lg:px-8">

          <div className="text-center">

            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300">
              <Sparkles size={16} />
              Google ADK • 2nd Edition
            </div>

            <h2 className="mt-5 text-4xl font-black text-white sm:text-5xl">
              A practical reference for your ADK journey.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
              Learn the concepts, follow the implementation patterns and
              understand the production lifecycle in one developer handbook.
            </p>

          </div>

          <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">

            <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />

            <div className="grid lg:grid-cols-[1.2fr_.8fr]">

              <div className="p-8 sm:p-10 lg:p-12">

                <p className="text-sm font-black uppercase tracking-wider text-blue-600">
                  Google ADK Complete Developer Handbook
                </p>

                <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                  2nd Edition
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
                  32 chapters covering agent fundamentals, orchestration,
                  tools, RAG, MCP, A2A, evaluation, observability, deployment,
                  security, testing, performance and developer references.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">

                  {[
                    "32 structured chapters",
                    "Code & command examples",
                    "RAG + MCP + A2A",
                    "Evaluation & observability",
                    "Deployment & FastAPI",
                    "Security & testing",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex gap-2 text-sm font-semibold text-slate-600"
                    >
                      <Check
                        size={17}
                        className="mt-0.5 shrink-0 text-blue-600"
                      />
                      {item}
                    </div>
                  ))}

                </div>

              </div>

              <div className="border-t border-slate-200 bg-slate-50 p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-10">

                <div className="flex h-full flex-col justify-center">

                  <p className="text-sm font-bold text-slate-500">
                    Regular price
                  </p>

                  <div className="mt-2 flex items-end gap-3">

                    <span className="text-2xl font-bold text-slate-400 line-through">
                      ₹{GOOGLE_ADK_MRP}
                    </span>

                    <span className="text-5xl font-black text-slate-950">
                      ₹{GOOGLE_ADK_PRICE}
                    </span>

                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    One-time payment.
                    <br />
                    No subscription required.
                  </p>

                  <button
                    onClick={() => handlePurchase("pricing")}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                  >
                    GET INSTANT PDF ACCESS
                    <ArrowRight size={18} />
                  </button>

                  <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                    <ShieldCheck
                      size={15}
                      className="text-green-500"
                    />
                    Secure payment • Instant access
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* POLICY */}

          <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-5 text-center">

            <p className="text-sm font-semibold text-slate-300">
              Digital Product
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Due to the digital nature of this ebook, all purchases are
              final and non-refundable. Please review the contents and FAQ
              before purchasing.
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Purchase or ebook support:{" "}
              <a
                href="mailto:supporttargettrek@gmail.com"
                className="font-semibold text-slate-400 underline underline-offset-2 hover:text-white"
              >
                supporttargettrek@gmail.com
              </a>
            </p>

          </div>

        </div>
      </section>

      {/* =====================================================
          FAQ
      ===================================================== */}

      <section className="bg-slate-50 py-24">

        <div className="mx-auto max-w-4xl px-6 lg:px-8">

          <div className="text-center">

            <SectionLabel>
              FAQ
            </SectionLabel>

            <h2 className="mt-3 text-4xl font-black sm:text-5xl">
              Questions before you buy?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
              Here are the important details about the handbook and purchase.
            </p>

          </div>

          <div className="mt-10 space-y-3">

            {faqs.map((faq) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
              />
            ))}

          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="border-t border-slate-200 bg-white px-6 py-24 text-center">

        <div className="mx-auto max-w-3xl">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Rocket size={27} />
          </div>

          <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-5xl">
            Start building AI agents with Google ADK.
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-600">
            Learn the fundamentals, understand the architecture, write the
            code and explore the production lifecycle in one developer
            handbook.
          </p>

          <div className="mt-7 flex items-center justify-center gap-3">

            <span className="text-xl font-bold text-slate-400 line-through">
              ₹{GOOGLE_ADK_MRP}
            </span>

            <span className="text-4xl font-black text-blue-600">
              ₹{GOOGLE_ADK_PRICE}
            </span>

          </div>

          <button
            onClick={() => handlePurchase("footer")}
            className="mt-7 inline-flex items-center gap-3 rounded-xl bg-blue-600 px-8 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            GET INSTANT PDF ACCESS
            <ArrowRight size={19} />
          </button>

          <p className="mt-6 text-xs leading-5 text-slate-400">
            Non-refundable digital product • Support:{" "}
            <a
              href="mailto:supporttargettrek@gmail.com"
              className="font-semibold text-slate-500 hover:text-blue-600"
            >
              supporttargettrek@gmail.com
            </a>
          </p>

          <p className="mt-2 text-xs text-slate-400">
            Google ADK Complete Developer Handbook • 2nd Edition
          </p>

        </div>
      </section>

      {/* =====================================================
          MOBILE STICKY CTA
      ===================================================== */}

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">

        <div className="mx-auto flex max-w-lg items-center gap-3">

          <div className="min-w-0 flex-1">

            <p className="truncate text-xs font-bold text-slate-500">
              Google ADK Handbook
            </p>

            <div className="flex items-center gap-2">

              <span className="text-xs font-bold text-slate-400 line-through">
                ₹{GOOGLE_ADK_MRP}
              </span>

              <span className="text-lg font-black text-blue-600">
                ₹{GOOGLE_ADK_PRICE}
              </span>

            </div>

          </div>

          <button
            onClick={() => handlePurchase("mobile_sticky")}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg"
          >
            Buy Now
            <ArrowRight size={16} />
          </button>

        </div>
      </div>

    </main>
  );
}