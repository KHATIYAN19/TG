import React from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  FileCode2,
  Layers3,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
  Users,
} from "lucide-react";

import ADK_PAYMENT_URL from '../utils/adk_payment_url'
const paymentLink = ADK_PAYMENT_URL;

const handlePurchase = () => {
  window.open(paymentLink, "_blank", "noopener,noreferrer");
};

const chapters = [
  {
    number: "01",
    title: "AI Agents Fundamentals",
    description:
      "Understand agents, LLMs, tools, memory, workflows, and how modern agent systems work.",
  },
  {
    number: "02",
    title: "Google ADK Setup",
    description:
      "Set up your development environment and create your first Google ADK agent from scratch.",
  },
  {
    number: "03",
    title: "Building Your First Agent",
    description:
      "Build a working agent, configure instructions, select models, and interact with it.",
  },
  {
    number: "04",
    title: "Tools & Function Calling",
    description:
      "Connect agents to real-world functions and external capabilities.",
  },
  {
    number: "05",
    title: "Sessions & State",
    description:
      "Learn how agents maintain conversations, state, and context.",
  },
  {
    number: "06",
    title: "API & Database Agents",
    description:
      "Build agents that work with APIs, databases, and application data.",
  },
  {
    number: "07",
    title: "RAG Agents",
    description:
      "Create knowledge-based agents that retrieve information from your own data.",
  },
  {
    number: "08",
    title: "Multi-Agent Systems",
    description:
      "Build multiple specialized agents and make them work together.",
  },
  {
    number: "09",
    title: "Sequential & Parallel Agents",
    description:
      "Learn practical orchestration patterns for complex agent workflows.",
  },
  {
    number: "10",
    title: "Production Agents",
    description:
      "Cover error handling, testing, evaluation, security, logging, and deployment concepts.",
  },
];

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

const faqs = [
  {
    question: "Is this ebook suitable for beginners?",
    answer:
      "Yes. The book starts with fundamentals and gradually moves toward practical agent systems and production concepts. Basic programming knowledge is recommended.",
  },
  {
    question: "Do I need prior Google ADK experience?",
    answer:
      "No. The setup and first-agent chapters walk you through the environment and core concepts step by step.",
  },
  {
    question: "Will I get copy-paste code?",
    answer:
      "Yes. The ebook is designed around practical implementation with commands, project structures and code examples wherever applicable.",
  },
  {
    question: "What will I build while reading?",
    answer:
      "You will work through practical examples involving tools, APIs, databases, RAG, multi-agent workflows and production-oriented patterns.",
  },
  {
    question: "Is this a video course?",
    answer:
      "No. This is a practical developer-focused ebook designed to be used as a reference while building AI agent applications.",
  },
  {
    question: "How much does the ebook cost?",
    answer:
      "The current launch price is ₹149. The regular price is ₹299.",
  },
];

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

export default function EbookPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">

      {/* =========================================================
          HERO
      ========================================================== */}

      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white">
        <div className="absolute left-0 top-20 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-2">

            {/* HERO LEFT */}

            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                <Sparkles size={16} />
                Practical AI Agent Developer Guide
              </div>

              <h1 className="max-w-3xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Build AI Agents

                <span className="block text-blue-600">
                  with Google ADK
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                A practical, code-first ebook for developers who want to move
                from understanding AI agents to actually building them.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "Step-by-step setup",
                  "Copy-paste code",
                  "Real project examples",
                  "Multi-agent architecture",
                  "RAG & tool calling",
                  "Production concepts",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium text-slate-700"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Check size={15} strokeWidth={3} />
                    </span>

                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">

                <button
                  onClick={handlePurchase}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-xl"
                >
                  Get the Ebook

                  <span className="flex items-center gap-2">
                    <span className="text-blue-200 line-through">
                      ₹299
                    </span>

                    ₹149
                  </span>

                  <ArrowRight
                    size={19}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>

                <a
                  href="#contents"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-7 py-4 font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                >
                  See What's Inside
                </a>

              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                <span>✓ One-time payment</span>
                <span>✓ Developer focused</span>
                <span>✓ Instant access</span>
              </div>
            </div>

            {/* BOOK */}

            <div className="flex justify-center lg:justify-end">
              <div className="relative">

                <div className="absolute -inset-10 rounded-full bg-blue-400/20 blur-3xl" />

                <div className="relative w-[290px] rotate-[-4deg] rounded-r-2xl rounded-l-md border border-blue-900/20 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-8 shadow-2xl shadow-blue-900/30 sm:w-[350px]">

                  <div className="absolute left-0 top-0 h-full w-3 rounded-l-md bg-blue-950/30" />

                  <div className="flex h-[440px] flex-col justify-between sm:h-[500px]">

                    <div>
                      <div className="mb-8 flex items-center gap-2 text-sm font-bold text-blue-100">
                        <Rocket size={18} />
                        TARGET TREK
                      </div>

                      <div className="h-px bg-white/20" />

                      <p className="mt-10 text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">
                        Practical Developer Guide
                      </p>

                      <h2 className="mt-4 text-4xl font-black leading-tight text-white">
                        Build AI
                        <br />
                        Agents
                        <br />
                        with
                        <br />
                        Google ADK
                      </h2>

                      <p className="mt-5 text-sm leading-6 text-blue-100">
                        From your first agent to production-ready
                        multi-agent systems.
                      </p>
                    </div>

                    <div>
                      <div className="mb-5 flex gap-2">
                        <span className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white">
                          AI Agents
                        </span>

                        <span className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white">
                          Google ADK
                        </span>
                      </div>

                      <p className="text-sm font-bold text-white">
                        Target Trek
                      </p>
                    </div>

                  </div>
                </div>

                {/* PRICE BADGE */}

                <div className="absolute -bottom-5 -right-8 rounded-2xl border border-blue-100 bg-white px-5 py-4 shadow-xl">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Launch Price
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-400 line-through">
                      ₹299
                    </span>

                    <span className="text-2xl font-black text-blue-600">
                      ₹149
                    </span>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
          VALUE STRIP
      ========================================================== */}

      <section className="border-y border-slate-200 bg-white">

        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-slate-200 lg:grid-cols-4">

          {[
            ["Code First", "Learn by building"],
            ["Practical", "Real-world examples"],
            ["From Zero", "Step-by-step approach"],
            ["₹149", "Launch price"],
          ].map(([title, subtitle]) => (

            <div
              key={title}
              className="px-5 py-7 text-center"
            >
              <p className="font-bold text-slate-900">
                {title}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {subtitle}
              </p>
            </div>

          ))}

        </div>

      </section>


      {/* =========================================================
          WHY THIS EBOOK
      ========================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

        <div className="mx-auto max-w-3xl text-center">

          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
            Why this ebook?
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Stop watching AI agent demos.
            <br />
            Start building them.
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            AI agents can feel confusing because there are too many concepts,
            frameworks, tools and architectures. This ebook turns those ideas
            into a structured path you can follow while coding.
          </p>

        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">

          {[
            {
              icon: Terminal,
              title: "Learn the fundamentals",
              text: "Understand what an agent is and how models, tools, memory and workflows fit together.",
            },
            {
              icon: Code2,
              title: "Write real code",
              text: "Follow implementation-focused examples instead of spending the entire time reading theory.",
            },
            {
              icon: Rocket,
              title: "Think production",
              text: "Move beyond toy agents into orchestration, testing, observability and deployment concepts.",
            },
          ].map((item) => {

            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={23} />
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {item.text}
                </p>

              </div>
            );

          })}

        </div>

      </section>


      {/* =========================================================
          WHAT YOU WILL LEARN
      ========================================================== */}

      <section className="bg-slate-50 py-20">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

            <div>

              <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                What you'll learn
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Everything you need to start building agents.
              </h2>

              <p className="mt-5 leading-8 text-slate-600">
                The learning path starts with the basics and gradually moves
                toward advanced agent architectures.
              </p>

              <button
                onClick={handlePurchase}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white transition hover:bg-blue-700"
              >
                Start Learning

                <span className="flex items-center gap-2">
                  <span className="text-blue-200 line-through">
                    ₹299
                  </span>

                  ₹149
                </span>

                <ArrowRight size={18} />
              </button>

            </div>

            <div className="grid gap-3 sm:grid-cols-2">

              {learningPoints.map((point) => (

                <div
                  key={point}
                  className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4"
                >

                  <div className="mt-0.5 shrink-0 text-blue-600">
                    <Check size={19} strokeWidth={3} />
                  </div>

                  <p className="text-sm font-medium leading-6 text-slate-700">
                    {point}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          PROJECTS
      ========================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

        <div className="mx-auto max-w-3xl text-center">

          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
            Build while you learn
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Practical projects, not just theory.
          </h2>

          <p className="mt-5 leading-8 text-slate-600">
            Each major concept is connected to an implementation so you can
            understand not only what AI agents are, but how to build them.
          </p>

        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {projects.map((project) => {

            const Icon = project.icon;

            return (
              <div
                key={project.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-blue-200 hover:shadow-xl"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <Icon size={22} />
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  {project.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {project.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-blue-600">
                  Included in ebook
                  <ArrowRight size={15} />
                </div>

              </div>
            );

          })}

        </div>

      </section>


      {/* =========================================================
          CONTENTS
      ========================================================== */}

      <section
        id="contents"
        className="bg-slate-950 py-20 text-white"
      >

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">

            <div>

              <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
                Inside the ebook
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                A structured path from beginner to builder.
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                No random collection of concepts. The chapters are organized
                so that each topic builds on the previous one.
              </p>

              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">

                <div className="flex items-center gap-3">

                  <FileCode2 className="text-blue-400" />

                  <p className="font-bold">
                    Code-first approach
                  </p>

                </div>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Commands, project structures and implementation examples are
                  included throughout the learning path.
                </p>

              </div>

            </div>

            <div className="space-y-3">

              {chapters.map((chapter) => (

                <div
                  key={chapter.number}
                  className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-blue-400/40 hover:bg-white/10"
                >

                  <div className="flex gap-5">

                    <span className="font-mono text-sm font-bold text-blue-400">
                      {chapter.number}
                    </span>

                    <div>

                      <h3 className="font-bold text-white">
                        {chapter.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {chapter.description}
                      </p>

                    </div>

                  </div>

                </div>

              ))}

              <p className="pt-4 text-center text-sm text-slate-500">
                Plus troubleshooting, cheat sheets, glossary, interview
                questions and additional reference material.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          WHO IS IT FOR
      ========================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

        <div className="mx-auto max-w-3xl text-center">

          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
            Is this for you?
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Built for developers who want to build.
          </h2>

        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">

          {[
            {
              title: "Backend Developers",
              text: "Add AI agents and intelligent workflows to your backend applications.",
            },
            {
              title: "AI / GenAI Developers",
              text: "Go beyond basic LLM calls and understand agent architecture.",
            },
            {
              title: "Students & Learners",
              text: "Follow a practical path to understand modern AI agent systems.",
            },
          ].map((item) => (

            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 p-7"
            >

              <h3 className="text-xl font-bold">
                {item.title}
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                {item.text}
              </p>

            </div>

          ))}

        </div>

      </section>


      {/* =========================================================
          CODE SECTION
      ========================================================== */}

      <section className="bg-blue-50 py-20">

        <div className="mx-auto max-w-7xl px-6 lg:px-8">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            <div>

              <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                Learn by coding
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Less theory.
                <br />
                More implementation.
              </h2>

              <p className="mt-5 leading-8 text-slate-600">
                You shouldn't have to read hundreds of pages before writing
                your first agent. The ebook takes you into implementation
                early and keeps the examples practical.
              </p>

              <div className="mt-7 space-y-3">

                {[
                  "Installation commands",
                  "Project structures",
                  "Runnable examples",
                  "Tool implementations",
                  "Agent orchestration",
                  "Production patterns",
                ].map((item) => (

                  <div
                    key={item}
                    className="flex items-center gap-3"
                  >

                    <Check
                      className="text-blue-600"
                      size={18}
                    />

                    <span className="font-medium text-slate-700">
                      {item}
                    </span>

                  </div>

                ))}

              </div>

            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">

              <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">

                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />

                <span className="ml-3 text-xs text-slate-500">
                  agent.py
                </span>

              </div>

              <pre className="overflow-x-auto p-6 text-sm leading-7 text-slate-300">
                <code>{`from google.adk.agents import Agent

root_agent = Agent(
    name="research_agent",
    model="gemini-2.5-flash",
    instruction="""
    Research the user's topic
    and return a structured answer.
    """,
)

# Add tools, sessions,
# orchestration and more...`}</code>
              </pre>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          PREMIUM PRICING
      ========================================================== */}

      <section
        id="pricing"
        className="relative overflow-hidden bg-slate-950 py-24"
      >

        {/* Background glow */}

        <div className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px]" />

        <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 lg:px-8">

          {/* Heading */}

          <div className="mx-auto max-w-3xl text-center">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300">

              <Sparkles size={16} />

              Limited Launch Price

            </div>

            <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">

              Start building

              <span className="block text-blue-400">
                AI agents today.
              </span>

            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Get the practical Google ADK ebook and learn how to build
              AI agents through real implementation, code, and projects.
            </p>

          </div>


          {/* PURCHASE CARD */}

          <div className="mx-auto mt-14 max-w-4xl">

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-2 shadow-2xl shadow-blue-950/40 backdrop-blur-xl">

              <div className="relative overflow-hidden rounded-[22px] bg-white">

                {/* Top blue line */}

                <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />

                <div className="grid lg:grid-cols-[1.25fr_0.75fr]">

                  {/* LEFT SIDE */}

                  <div className="p-8 sm:p-10 lg:p-12">

                    <div className="flex items-start gap-5">

                      <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 sm:flex">

                        <FileCode2 size={27} />

                      </div>

                      <div>

                        <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                          Target Trek
                        </p>

                        <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                          Build AI Agents with Google ADK
                        </h3>

                        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                          A practical developer-focused ebook that takes you
                          from your first AI agent to tools, RAG, multi-agent
                          systems, orchestration, and production concepts.
                        </p>

                      </div>

                    </div>


                    {/* INCLUDED */}

                    <div className="mt-9">

                      <p className="text-sm font-bold text-slate-900">
                        What's included
                      </p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">

                        {[
                          "Step-by-step Google ADK setup",
                          "Copy-paste implementation examples",
                          "Tools & function calling",
                          "RAG-powered agents",
                          "Multi-agent architecture",
                          "Production concepts",
                        ].map((item) => (

                          <div
                            key={item}
                            className="flex items-start gap-2.5"
                          >

                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">

                              <Check
                                size={13}
                                strokeWidth={3}
                              />

                            </div>

                            <span className="text-sm text-slate-600">
                              {item}
                            </span>

                          </div>

                        ))}

                      </div>

                    </div>

                  </div>


                  {/* RIGHT PRICE */}

                  <div className="border-t border-slate-200 bg-slate-50 p-8 sm:p-10 lg:border-l lg:border-t-0 lg:p-10">

                    <div className="flex h-full flex-col justify-center">

                      <div className="flex items-center gap-3">

                        <p className="text-sm font-semibold text-slate-500">
                          Regular price
                        </p>

                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                          SAVE ₹150
                        </span>

                      </div>

                      {/* PRICE */}

                      <div className="mt-2 flex items-end gap-3">

                        <span className="text-2xl font-bold text-slate-400 line-through">
                          ₹299
                        </span>

                        <span className="text-5xl font-black tracking-tight text-slate-950">
                          ₹149
                        </span>

                      </div>

                      <div className="mt-3 inline-flex w-fit items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">

                        <Sparkles
                          size={15}
                          className="text-blue-600"
                        />

                        <span className="text-xs font-bold text-blue-700">
                          Launch offer
                        </span>

                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-500">
                        Pay once and start learning.
                        <br />
                        No subscription required.
                      </p>


                      {/* CTA */}

                      <button
                        onClick={handlePurchase}
                        className="group mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30"
                      >

                        Get the Ebook

                        <ArrowRight
                          size={18}
                          className="transition-transform group-hover:translate-x-1"
                        />

                      </button>


                      {/* TRUST */}

                      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">

                        <ShieldCheck
                          size={15}
                          className="text-green-500"
                        />

                        Secure payment • Instant access

                      </div>


                      {/* PRODUCT TYPE */}

                      <div className="mt-6 border-t border-slate-200 pt-5">

                        <div className="flex items-center justify-between text-xs">

                          <span className="text-slate-400">
                            Perfect for
                          </span>

                          <span className="font-semibold text-slate-700">
                            Developers & AI Builders
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* REASSURANCE */}

          <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-500">

            <span className="flex items-center gap-2">
              <Check
                size={16}
                className="text-blue-400"
              />
              Beginner-friendly
            </span>

            <span className="flex items-center gap-2">
              <Check
                size={16}
                className="text-blue-400"
              />
              Code-focused
            </span>

            <span className="flex items-center gap-2">
              <Check
                size={16}
                className="text-blue-400"
              />
              Practical examples
            </span>

            <span className="flex items-center gap-2">
              <Check
                size={16}
                className="text-blue-400"
              />
              One-time payment
            </span>

          </div>

        </div>

      </section>


      {/* =========================================================
          FAQ
      ========================================================== */}

      <section className="bg-slate-50 py-20">

        <div className="mx-auto max-w-4xl px-6 lg:px-8">

          <div className="text-center">

            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              FAQ
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
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


      {/* =========================================================
          FINAL CTA
      ========================================================== */}

      <section className="border-t border-slate-200 bg-white px-6 py-20 text-center">

        <div className="mx-auto max-w-3xl">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShieldCheck size={27} />
          </div>

          <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
            Your next AI project can start here.
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
            Learn the fundamentals, write the code, understand the
            architecture, and start building your own AI agents with Google
            ADK.
          </p>

          {/* FINAL PRICE */}

          <div className="mt-6 flex items-center justify-center gap-3">

            <span className="text-xl font-bold text-slate-400 line-through">
              ₹299
            </span>

            <span className="text-4xl font-black text-blue-600">
              ₹149
            </span>

          </div>

          <button
            onClick={handlePurchase}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-xl"
          >

            Get the Ebook

            <ArrowRight size={19} />

          </button>

          <p className="mt-4 text-sm text-slate-400">
            ₹299 regular price • ₹149 launch price
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Target Trek • Practical learning for developers
          </p>
          

        </div>

      </section>

    </main>
  );
}