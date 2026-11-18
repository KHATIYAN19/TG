import { Fragment } from "react";
import {
  ArrowRight, Brain, BookOpen, Cloud, Code, Database, FileText, FlowArrow, GitBranch, Lightning, LockKey, MagnifyingGlass, Network,
  Robot, ShieldCheck, Sparkle, Stack, Terminal, TestTube, Users,
} from "@phosphor-icons/react";

import { Section } from "./bookKit";
import { Cards, Chapters, CodeTabs, Flow, GenaiBookPage } from "./genaiKit";

/*
  /book/genai/google-adk: why this handbook → how an agent works → what you master → 7-step journey
  → 32 chapters → real code → projects → production → handbook approach → other GenAI books → FAQ → buy
*/

const SEO = {
  title: "Google ADK Handbook: AI Agents, RAG & MCP | Target Trek",
  description: "Practical Google ADK handbook: AI agents, tools, RAG, MCP, A2A, multi-agent workflows, evaluation, FastAPI and production deployment.",
  keywords: "Google ADK, Google ADK book, Agent Development Kit, AI agents book, LlmAgent, SequentialAgent, multi-agent systems, Gemini agents, Vertex AI agents, RAG agent, MCP, A2A, agent evaluation, agent deployment, Cloud Run, FastAPI agents, GenAI interview",
  long: "A code-first Google ADK developer handbook (2nd edition) in 32 chapters: agent fundamentals, LlmAgent, workflow agents, tools and function calling, callbacks and guardrails, sessions and memory, RAG, MCP, A2A, models, streaming, evaluation, observability, deployment, FastAPI, security, testing, cost engineering and production checklists.",
  category: "Generative AI Agents Google ADK Ebook",
};

const NAV = [["why", "Why this book"], ["architecture", "How agents work"], ["master", "What you'll master"], ["journey", "7-step journey"], ["contents", "32 chapters"], ["code", "Code"], ["projects", "Projects"], ["production", "Production"], ["bundle", "GenAI series"], ["faq", "FAQ"]];
const STATS = [["32", "chapters"], ["5", "learning stages"], ["4", "agent projects"], ["7", "step journey"]];

const CHAPTERS = [
  ["01", "Agentic AI Fundamentals", "Agent loops, tools, context, memory, workflows and when agents make sense."],
  ["02", "Google ADK: What It Is & Where It Fits", "Understand ADK, the developer workflow and the Agents CLI."],
  ["03", "Setup, Installation & Authentication", "Install ADK, configure Gemini or Vertex AI and create your first agent."],
  ["04", "Project Structure & Developer Workflow", "Organize agents, services, tests, evaluation datasets and deployment files."],
  ["05", "LlmAgent: The Core Agent Type", "Build LLM-powered agents and understand the decision and tool-use loop."],
  ["06", "Sequential, Parallel & Loop Agents", "Master core workflow agents and practical orchestration patterns."],
  ["07", "Custom Agents & Graph Workflows", "Create advanced control flow when standard workflow agents are not enough."],
  ["08", "Tools & Function Calling", "Connect agents to application logic, APIs, databases and external capabilities."],
  ["09", "Built-in Tools, Search, Files & Toolsets", "Use built-in capabilities and understand toolset-based architectures."],
  ["10", "Callbacks, Plugins & Guardrails", "Observe, intercept, validate, authorize, retry and control agent behavior."],
  ["11", "Sessions, State, Context & Memory", "Understand short-term state, sessions, context and persistent memory."],
  ["12", "RAG: Full Working Pipeline", "Build retrieval-augmented agents with ingestion, embeddings, retrieval and grounding."],
  ["13", "MCP: Model Context Protocol", "Connect ADK agents to MCP servers using practical integration patterns."],
  ["14", "A2A: Agent-to-Agent Systems", "Design specialist agents as services and connect them through A2A patterns."],
  ["15", "Models, Gemini, LiteLLM & Open Models", "Configure models and understand multi-model routing and integrations."],
  ["16", "Streaming, Live Agents & Multimodal Inputs", "Work with streaming events, live interactions, files and multimodal inputs."],
  ["17", "Artifacts & File Handling", "Manage generated files and artifacts safely across agent workflows."],
  ["18", "Evaluation: Datasets, Metrics & Eval-Fix Loop", "Create evaluations, measure behavior and turn failures into regression tests."],
  ["19", "Observability, Tracing & Debugging", "Trace agent runs, inspect tool calls and debug production behavior."],
  ["20", "Deployment: Agent Runtime, Cloud Run & GKE", "Move agents from local development into production infrastructure."],
  ["21", "Batching, Async Workloads & Performance", "Process workloads efficiently with bounded concurrency and performance controls."],
  ["22", "FastAPI / REST Integration", "Expose agent capabilities through application APIs and backend services."],
  ["23", "End-to-End Production Agent", "Combine research, RAG, orchestration, synthesis and review into one system."],
  ["24", "Security, Privacy & Reliability", "Handle prompt injection, tool abuse, data leakage, retries and failure modes."],
  ["25", "Structured Output, Schemas & Validation", "Return predictable structured results and validate model-generated data."],
  ["26", "Caching, Context Control & Cost Engineering", "Control token usage, context growth, latency and model costs."],
  ["27", "CLI: Commands You Actually Need", "Practical commands for creating, running, evaluating and deploying agents."],
  ["28", "Testing Strategy for Agentic Systems", "Build unit, integration, failure-injection and behavior-focused tests."],
  ["29", "Observability + Evaluation + Guardrails Pipeline", "Connect telemetry, quality checks, guardrails and continuous improvement."],
  ["30", "Troubleshooting Guide", "Diagnose common setup, model, tool, deployment and runtime problems."],
  ["31", "Production Checklist", "A practical checklist for taking an agent system toward production."],
  ["32", "Developer Cheat Sheets & Reference Architecture", "Quick references, architecture patterns, commands and reusable mental models."],
].map(([n, title, details]) => ({ n, title, details }));

const STAGES = [
  { id: "foundations", title: "Foundations", subtitle: "The building blocks", chapters: CHAPTERS.slice(0, 5) },
  { id: "orchestration", title: "Orchestration & Tools", subtitle: "Control and extend agents", chapters: CHAPTERS.slice(5, 11) },
  { id: "integrations", title: "Integrations", subtitle: "RAG, MCP, A2A and models", chapters: CHAPTERS.slice(11, 17) },
  { id: "production", title: "Production Engineering", subtitle: "Deployment and reliability", chapters: CHAPTERS.slice(17, 25) },
  { id: "reference", title: "Engineering & Reference", subtitle: "Practical developer guidance", chapters: CHAPTERS.slice(25) },
];

const WHY = [
  { icon: BookOpen, title: "Structured learning", text: "Progress from first principles through agents, tools, integrations and production engineering." },
  { icon: Terminal, title: "Code-first approach", text: "Learn through Python snippets, application flows, commands and implementation concepts." },
  { icon: Network, title: "Connect the ecosystem", text: "See how Google ADK works with RAG, MCP, A2A, models and APIs." },
  { icon: ShieldCheck, title: "Production awareness", text: "Evaluation, observability, testing, security, reliability and deployment." },
];

const ARCH = [
  { icon: Users, title: "User / API", tag: "request", text: "Receives the incoming request." },
  { icon: Robot, title: "ADK agent", tag: "plan", text: "Plans and selects tool calls." },
  { icon: FlowArrow, title: "Tools / workflow", tag: "act", text: "Runs authorized operations." },
  { icon: Database, title: "Data / services", tag: "verify", text: "Returns verified application data." },
];

const MASTER = [
  { icon: Robot, title: "LLM agents", text: "Create agents using instructions, models, tools, state and sessions." },
  { icon: GitBranch, title: "Orchestration", text: "Compose sequential, parallel and loop-based agent workflows." },
  { icon: Lightning, title: "Tools & APIs", text: "Connect agents to deterministic functions, external services and data." },
  { icon: Stack, title: "RAG", text: "Build retrieval-aware agents and grounded response flows." },
  { icon: Network, title: "MCP & A2A", text: "Protocol-based integrations and specialist agent communication." },
  { icon: Brain, title: "State & memory", text: "Work with context, persistent information, sessions and state." },
  { icon: TestTube, title: "Evaluation", text: "Measure agent quality and build an evaluation and regression workflow." },
  { icon: Cloud, title: "Deployment", text: "Runtime, cloud infrastructure, security and production operations." },
];

const JOURNEY = [
  ["01", "Python + LLM Foundations", "Models, prompts and context", "Python, LLM APIs, prompting, context windows, structured outputs and basic interactions."],
  ["02", "Agent Fundamentals", "Instructions, state and sessions", "How models, tools, instructions, sessions and state form an agent."],
  ["03", "Tools & Function Calling", "APIs, files and controlled actions", "Give agents controlled access to application logic, databases and external services."],
  ["04", "RAG & Memory", "Retrieval and grounding", "Use retrieval to ground answers and state or memory to keep useful context."],
  ["05", "Multi-Agent & Protocols", "Workflows, MCP and A2A", "Orchestrate specialist agents and connect systems using protocols."],
  ["06", "Evaluation & Observability", "Tests, traces and guardrails", "Evaluate quality, trace executions, diagnose failures and improve behavior."],
  ["07", "Production Engineering", "Deployment and security", "Expose agents with APIs and implement security, monitoring and reliability."],
];

const CODE = [
  { id: "agent", label: "LLM Agent", title: "Build your first AI agent", filename: "agent.py", description: "Start with the core Google ADK agent primitive and define its model, instructions and purpose.",
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
)` },
  { id: "tool", label: "Function Tool", title: "Connect an agent to Python functions", filename: "tools.py", description: "Give an agent controlled access to application functions and external services.",
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
)` },
  { id: "rag", label: "RAG", title: "Add retrieval to an agent", filename: "retrieval.py", description: "Retrieve relevant information from a vector collection before producing grounded responses.",
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
    ]` },
  { id: "multi", label: "Multi-Agent", title: "Orchestrate specialist agents", filename: "workflow.py", description: "Combine specialised agents using deterministic sequential orchestration.",
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
)` },
];

const PROJECTS = [
  { icon: Sparkle, kicker: "Project 01", title: "Research agent", text: "An agent that researches a topic, gathers information and returns structured findings.", code: "Research · Tools · Structured output" },
  { icon: Code, kicker: "Project 02", title: "API agent", text: "Connect agents to external APIs and run application actions with controlled function calls.", code: "APIs · Python · Function calling" },
  { icon: Stack, kicker: "Project 03", title: "RAG agent", text: "An agent that answers questions from your documents and knowledge base.", code: "Embeddings · Retrieval · Grounding" },
  { icon: Users, kicker: "Project 04", title: "Multi-agent system", text: "Specialist agents orchestrated into a complete AI workflow.", code: "Sequential · Parallel · Orchestration" },
];

const PRODUCTION = [
  { icon: TestTube, title: "Evaluation", text: "Build datasets, inspect output quality and detect regressions before deployment." },
  { icon: MagnifyingGlass, title: "Observability", text: "Trace agent interactions, monitor tool calls and investigate failure patterns." },
  { icon: LockKey, title: "Security", text: "Protect private information, validate tool arguments and enforce access control." },
  { icon: Cloud, title: "Deployment", text: "Expose agents through FastAPI and explore cloud runtimes and operational concerns." },
];

const APPROACH = [
  ["Where should I start?", ["Fundamentals", "Setup", "First agent"]],
  ["How do the concepts connect?", ["Concept", "Flow", "Code"]],
  ["What comes after basic agents?", ["Tools", "Workflows", "RAG", "Protocols"]],
  ["How should I prepare for production?", ["Evaluation", "Observability", "Security", "Deployment"]],
];

const FAQS = [
  { q: "Who is this ebook for?", a: "It is designed for developers, backend engineers, GenAI learners and software engineers who want a practical path from Google ADK fundamentals to production-oriented agent systems." },
  { q: "What is covered in the 2nd Edition?", a: "The handbook contains 32 chapters covering agents, tools, workflow agents, sessions and memory, RAG, MCP, A2A, models, streaming, artifacts, evaluation, observability, deployment, FastAPI, security, testing, performance and production checklists." },
  { q: "Does the ebook contain code and commands?", a: "Yes. It follows a concept → flow → code → commands → production notes approach with implementation examples throughout the handbook." },
  { q: "Is prior Google ADK experience required?", a: "No. The handbook starts with fundamentals and setup before moving into advanced orchestration, integrations, evaluation and deployment." },
  { q: "Is this a video course?", a: "No. It is a developer-focused digital ebook and reference handbook designed to accompany hands-on implementation." },
  { q: "Is the ebook refundable?", a: "No. Due to the digital nature of the ebook, all purchases are non-refundable. Please review the contents and FAQ before purchasing." },
  { q: "How can I get support?", a: "For purchase or ebook-related issues, contact supporttargettrek@gmail.com." },
];

/* the analytics this page already sent before checkout: a dataLayer event plus GA begin_checkout (not a completed purchase) */
const trackCheckout = (p, source, name) => {
  const price = Number(p?.price);
  const currency = p?.currency || "INR";
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "adk_purchase_click", product: p?.slug || "google_adk_handbook_2nd_edition", source, bookId: p?._id, price, currency });
  if (typeof window.gtag === "function") {
    window.gtag("event", "begin_checkout", { currency, value: price, source, items: [{ item_id: String(p?._id), item_name: name, price, quantity: 1 }] });
  }
};

export default function GenAiGoogleAdk() {
  return (
    <GenaiBookPage
      id="adk" seo={SEO} nav={NAV} faqs={FAQS}
      onCheckout={(p, source, name, isThisBook) => { if (isThisBook) trackCheckout(p, source, name); }}
      hero={{
        crumb: "GenAI · Google ADK",
        pill: <><FileText size={14} weight="bold" aria-hidden />2nd edition · Developer handbook · PDF</>,
        title: <>Build real AI agents with <span className="hb-mark">Google ADK.</span></>,
        lead: "A practical, code-first guide to Google ADK. Learn agents, tools, RAG, MCP, A2A, multi-agent workflows, evaluation, observability and production deployment.",
        stats: STATS,
        coverFallback: { title: "Google ADK", subtitle: "Complete Developer Handbook", line: "32 chapters · 2nd edition" },
      }}
      schemaExtra={[{ "@type": "ItemList", idSuffix: "chapters", name: "Chapters of the Google ADK handbook", numberOfItems: CHAPTERS.length,
        itemListElement: CHAPTERS.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.title, description: c.details })) }]}
      final={{ title: <>From your first agent to <span className="hb-mark">production AI systems.</span></>, line: "Google ADK fundamentals, multi-agent workflows, RAG, MCP, A2A, evaluation, observability and deployment in one code-first handbook." }}
      footerLine="Google ADK Complete Developer Handbook · 2nd edition · Digital PDF ebook · Digital purchases are not refundable"
    >
      {() => (
        <>
          <Section id="why" eyebrow="Built for developers" title="Go from AI experiments to real agent systems" lead="A structured engineering handbook that connects agent fundamentals with implementation, orchestration, integrations, testing and production deployment.">
            <Cards items={WHY} cols={4} />
          </Section>

          <Section id="architecture" tint eyebrow="System architecture" title="How an AI agent actually works" lead="How a request reaches an agent, how the agent calls tools and services, and how the result comes back through your application.">
            <Flow steps={ARCH} label="Request flow through a Google ADK agent"
              note={<><ShieldCheck size={18} weight="bold" aria-hidden /><span><b>Keep in mind:</b> the agent may choose actions, but your application services still enforce authentication, authorization, validation and safety checks. The handbook covers these controls alongside orchestration.</span></>}
            />
          </Section>

          <Section id="master" eyebrow="What you will master" title="Everything you need to build with Google ADK" lead="The framework's most important building blocks and how they fit together in practical projects.">
            <Cards items={MASTER} cols={4} />
          </Section>

          <Section id="journey" tint eyebrow="Your learning journey" title="Seven steps from beginner to production" lead="A practical progression through what you need to design, implement, evaluate and deploy agent systems.">
            <ol className="gx-path">
              {JOURNEY.map(([n, title, sub, text]) => (
                <li key={n}><span className="gx-path-n hb-mono">Step {n}</span><b>{title}</b><p>{text}</p><small>{sub}</small></li>
              ))}
            </ol>
          </Section>

          <Section id="contents" eyebrow="Complete contents" title="32 chapters. One complete developer handbook." lead="From the first ADK agent through tool calling, multi-agent orchestration, RAG, MCP, A2A, evaluation, observability, FastAPI and deployment.">
            <Chapters stages={STAGES} placeholder="Search: RAG, MCP, memory, evals, deployment…" />
          </Section>

          <Section id="code" tint eyebrow="Learn with real Python" title="From the first agent to multi-agent workflows" lead="Code from the handbook: create an agent, add tools, retrieve knowledge and orchestrate several agents.">
            <CodeTabs examples={CODE} points={["Google ADK examples", "Python implementation", "Developer-oriented explanations"]} />
          </Section>

          <Section id="projects" eyebrow="Practical implementation" title="Learn by building useful AI agents" lead="Beyond an isolated Hello World: agents that research, call APIs, retrieve knowledge and cooperate.">
            <Cards items={PROJECTS} cols={4} />
          </Section>

          <Section id="production" tint eyebrow="Production engineering" title="Building an agent is just the beginning" lead="The engineering that turns a prototype into a reliable, observable, secure and maintainable application.">
            <Cards items={PRODUCTION} cols={4} />
          </Section>

          <Section id="approach" eyebrow="The handbook approach" title="A structured path alongside the official docs" lead="Official documentation stays the source of truth for SDK behavior. This handbook organises the journey: concepts, implementation, production concerns and examples.">
            <div className="gx-qa">
              <div className="gx-qa-head" aria-hidden><span>Learning challenge</span><span>Handbook approach</span></div>
              <ul>
                {APPROACH.map(([q, steps]) => (
                  <li key={q}>
                    <span className="gx-qa-q">{q}</span>
                    <span className="gx-qa-a">{steps.map((s, i) => <Fragment key={s}>{i > 0 && <ArrowRight size={13} weight="bold" aria-hidden />}<span>{s}</span></Fragment>)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        </>
      )}
    </GenaiBookPage>
  );
}
