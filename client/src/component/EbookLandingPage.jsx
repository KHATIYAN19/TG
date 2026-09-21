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
    "Google ADK pricing is not configured correctly. Please set VITE_GOOGLE_ADK_MRP and VITE_GOOGLE_ADK_PRICE in your .env file."
  );
}

/* =========================================================
   PURCHASE
   ========================================================= */

const handlePurchase = () => {
  window.open(paymentLink, "_blank", "noopener,noreferrer");
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
   FAQ ITEM
   ========================================================= */

function FAQItem({ question, answer }) {
  return (
    <details className="group rounded-2xl border border-slate-200 bg-white p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
        {question}

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

/* =========================================================
   MAIN PAGE
   ========================================================= */

export default function EbookPage() {
  const highlights = [
    ["32", "Chapters"],
    ["RAG", "MCP & A2A"],
    ["Code", "Commands & Flows"],
    ["Prod", "Deployment & Security"],
  ];

  const learn = [
    "Google ADK setup, authentication and developer workflow",
    "LlmAgent, Sequential, Parallel, Loop and custom workflows",
    "Tools, function calling, callbacks, plugins and guardrails",
    "Sessions, state, context, memory and artifacts",
    "A complete RAG pipeline with ingestion and retrieval",
    "MCP and A2A integration patterns",
    "Gemini, LiteLLM, open models and model routing",
    "Streaming, multimodal inputs and async batch workloads",
    "Evaluation, observability, tracing and production debugging",
    "Agent Runtime, Cloud Run, GKE and FastAPI integration",
    "Security, structured outputs, validation and reliability",
    "Testing, cost control, troubleshooting and production checklists",
  ];

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
    <main className="min-h-screen bg-[#f8fafc] text-slate-900">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#07111f] text-white">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute -right-32 top-20 h-[500px] w-[500px] rounded-full bg-indigo-500/15 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-16 lg:grid-cols-[1.15fr_.85fr]">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-sm font-semibold text-blue-300">
                <Sparkles size={16} />
                2nd Edition • Developer Handbook
              </div>

              <h1 className="mt-7 max-w-4xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
                Google ADK
                <span className="block text-blue-400">
                  Complete Developer Handbook
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                A practical, code-first guide to building, orchestrating,
                evaluating, securing, observing and deploying AI agent systems
                with Google ADK.
              </p>

              <div className="mt-9 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {highlights.map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"
                  >
                    <p className="text-xl font-black text-white">
                      {value}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-400">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handlePurchase}
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-blue-500 px-7 py-4 font-bold text-white shadow-xl shadow-blue-950/40 transition hover:bg-blue-400"
                >
                  Get the 2nd Edition

                  <span className="flex items-center gap-2">
                    <span className="text-blue-200 line-through">
                      ₹{GOOGLE_ADK_MRP}
                    </span>

                    <span>
                      ₹{GOOGLE_ADK_PRICE}
                    </span>
                  </span>

                  <ArrowRight size={18} />
                </button>

                <a
                  href="#contents"
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 py-4 font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  Explore 32 Chapters
                </a>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
                <span>✓ One-time payment</span>
                <span>✓ Instant digital access</span>
                <span>✓ Developer-focused</span>
              </div>
            </div>

            {/* BOOK MOCKUP */}

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

                      <p className="mt-10 text-xs font-bold uppercase tracking-[0.22em] text-blue-100">
                        2nd Edition
                      </p>

                      <h2 className="mt-4 text-4xl font-black leading-[1.05] text-white">
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

                      <p className="mt-5 max-w-[230px] text-sm leading-6 text-blue-100">
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
                            className="rounded-lg bg-white/10 px-3 py-2 text-[10px] font-semibold text-white"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <p className="mt-5 text-xs font-semibold text-blue-100">
                        Practical • Code-first • Production-aware
                      </p>
                    </div>
                  </div>
                </div>

                {/* PRICE BADGE */}

                <div className="absolute -bottom-5 -right-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-2xl sm:-right-8">

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Launch Price
                  </p>

                  <div className="mt-1 flex items-center gap-2">

                    <span className="text-sm font-semibold text-slate-400 line-through">
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
          POSITIONING
      ===================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 lg:grid-cols-4">

          {[
            ["32 Chapters", "From fundamentals to production"],
            ["Code-First", "Commands, flows and examples"],
            ["Advanced", "RAG, MCP, A2A & orchestration"],
            ["Production", "Evaluation, security & deployment"],
          ].map(([title, text]) => (
            <div
              key={title}
              className="border-r border-slate-200 px-5 py-7 text-center last:border-r-0"
            >
              <p className="font-black text-slate-900">
                {title}
              </p>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                {text}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* =====================================================
          WHY
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">

        <div className="grid items-center gap-14 lg:grid-cols-[.8fr_1.2fr]">

          <div>
            <p className="text-sm font-black uppercase tracking-[.18em] text-blue-600">
              Built for developers
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Not just another AI agents introduction.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              This handbook moves from the mental model of an agent to the
              engineering details needed to build real systems.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">

            {[
              [
                Terminal,
                "Learn the core",
                "Understand agents, models, tools, sessions, state, memory and workflows.",
              ],
              [
                Code2,
                "Build with code",
                "Follow implementation-focused examples, commands and project structures.",
              ],
              [
                Layers3,
                "Connect systems",
                "Explore RAG, MCP, A2A, APIs, artifacts, multimodal inputs and model integrations.",
              ],
              [
                Rocket,
                "Ship responsibly",
                "Cover evaluation, tracing, guardrails, security, performance and deployment.",
              ],
            ].map(([Icon, title, text]) => (
              <div
                key={title}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={23} />
                </div>

                <h3 className="mt-5 text-xl font-black">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {text}
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* =====================================================
          WHAT YOU GET
      ===================================================== */}

      <section className="bg-white py-24">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]">

            <div>

              <p className="text-sm font-black uppercase tracking-[.18em] text-blue-600">
                Inside the handbook
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-tight">
                One reference for the full agent lifecycle.
              </h2>

              <p className="mt-5 leading-8 text-slate-600">
                Start with the basics, then move through architecture,
                integrations, quality, operations and deployment.
              </p>

              <button
                onClick={handlePurchase}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white hover:bg-blue-700"
              >
                Get the Handbook
                <ArrowRight size={18} />
              </button>

            </div>

            <div className="grid gap-3 sm:grid-cols-2">

              {learn.map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Check size={13} strokeWidth={3} />
                  </span>

                  <p className="text-sm font-medium leading-6 text-slate-700">
                    {item}
                  </p>
                </div>
              ))}

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENTS
      ===================================================== */}

      <section
        id="contents"
        className="bg-[#07111f] py-24 text-white"
      >

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="max-w-3xl">

            <p className="text-sm font-black uppercase tracking-[.18em] text-blue-400">
              32-chapter contents
            </p>

            <h2 className="mt-3 text-4xl font-black sm:text-5xl">
              From first agent to production architecture.
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              Each section follows the handbook's practical structure:
              concept → flow → code → commands → how it works → production notes.
            </p>

          </div>

          <div className="mt-14 space-y-12">

            {chaptersByGroup.map((group) => (
              <div key={group.label}>

                <p className="mb-4 text-xs font-black tracking-[.2em] text-blue-400">
                  {group.label}
                </p>

                <div className="grid gap-3 md:grid-cols-2">

                  {group.items.map(
                    ([number, title, description]) => (
                      <div
                        key={number}
                        className="rounded-2xl border border-white/10 bg-white/[.045] p-5 transition hover:border-blue-400/40 hover:bg-white/[.07]"
                      >
                        <div className="flex gap-4">

                          <span className="font-mono text-sm font-bold text-blue-400">
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
          CODE
      ===================================================== */}

      <section className="bg-blue-50 py-24">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            <div>

              <p className="text-sm font-black uppercase tracking-[.18em] text-blue-600">
                Code-first learning
              </p>

              <h2 className="mt-3 text-4xl font-black sm:text-5xl">
                Understand the flow.
                <br />
                Then write the code.
              </h2>

              <p className="mt-6 leading-8 text-slate-600">
                The handbook does not stop at definitions. It explains how
                agent components connect and gives implementation examples and
                commands for the important building blocks.
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
                    className="flex items-center gap-2 text-sm font-semibold text-slate-700"
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
              2nd Edition
            </div>

            <h2 className="mt-5 text-4xl font-black text-white sm:text-5xl">
              Build your next AI agent with a practical reference beside you.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
              Get the complete developer handbook covering the concepts,
              implementation patterns and production topics in one place.
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
                      className="flex gap-2 text-sm text-slate-600"
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

                  <p className="text-sm font-semibold text-slate-500">
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
                    onClick={handlePurchase}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                  >
                    Get the Ebook
                    <ArrowRight size={18} />
                  </button>

                  <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
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

          {/* PURCHASE NOTICE */}

          <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-white/10 bg-white/[.04] px-6 py-5 text-center">

            <p className="text-sm font-semibold text-slate-300">
              Digital Product — Non-Refundable
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Due to the digital nature of this ebook, all purchases are final
              and non-refundable. Please review the contents and FAQ before
              purchasing.
            </p>

            <p className="mt-2 text-xs text-slate-500">
              For any purchase or ebook-related issue, contact{" "}
              <a
                href="mailto:supporttargettrek@gmail.com"
                className="font-semibold text-slate-400 underline decoration-slate-600 underline-offset-2 hover:text-white"
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

            <p className="text-sm font-black uppercase tracking-[.18em] text-blue-600">
              FAQ
            </p>

            <h2 className="mt-3 text-4xl font-black sm:text-5xl">
              Questions before you buy?
            </h2>

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
          FOOTER CTA
      ===================================================== */}

      <section className="border-t border-slate-200 bg-white px-6 py-20 text-center">

        <div className="mx-auto max-w-3xl">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Rocket size={27} />
          </div>

          <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
            Start building AI agents with Google ADK.
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
            Learn the fundamentals, understand the architecture, write the
            code, and explore the production lifecycle in one developer handbook.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">

            <span className="text-xl font-bold text-slate-400 line-through">
              ₹{GOOGLE_ADK_MRP}
            </span>

            <span className="text-4xl font-black text-blue-600">
              ₹{GOOGLE_ADK_PRICE}
            </span>

          </div>

          <button
            onClick={handlePurchase}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Get the 2nd Edition
            <ArrowRight size={19} />
          </button>

          <p className="mt-6 text-xs leading-5 text-slate-400">
            Non-refundable digital product • For support:{" "}
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

    </main>
  );
}

