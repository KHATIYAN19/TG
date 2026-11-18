import {
  ArrowsClockwise, BookOpen, BracketsCurly, Database, FileText, Globe, HardDrives, Lightning, LockKey, Plugs, Robot, ShieldCheck,
  Sparkle, Stack, Terminal,
} from "@phosphor-icons/react";

import { Section } from "./bookKit";
import { BeforeAfter, Cards, Chapters, CodeTabs, FileTree, Flow, GenaiBookPage, Versus } from "./genaiKit";

/*
  /book/genai/mcp: what MCP is → how the parts talk → tools/resources/prompts → transports
  → the 16 chapters → real code → the full project → skills → other GenAI books → FAQ → buy
*/

const SEO = {
  title: "MCP Ebook: Model Context Protocol & FastMCP | Target Trek",
  description: "Learn Model Context Protocol: hosts, clients, servers, JSON-RPC, STDIO, Streamable HTTP, FastMCP, LangChain, auth and a full Python project.",
  keywords: "MCP book, Model Context Protocol, MCP ebook, FastMCP, MCP server Python, MCP client, JSON-RPC, STDIO transport, Streamable HTTP, MCP Inspector, LangChain MCP, MultiServerMCPClient, GenAI interview, AI agents tools",
  long: "A practical Model Context Protocol ebook: host, client and server architecture, JSON-RPC 2.0 lifecycle, tools, resources and prompts, STDIO and Streamable HTTP transports, MCP Inspector, authentication, LangChain agents and a complete authenticated Python reminder application with tests and Docker.",
  category: "Generative AI Model Context Protocol Ebook",
};

const NAV = [["what", "What is MCP"], ["architecture", "Architecture"], ["capabilities", "Tools · Resources · Prompts"], ["transports", "Transports"], ["contents", "16 chapters"], ["code", "Code"], ["project", "Project"], ["bundle", "GenAI series"], ["faq", "FAQ"]];
const STATS = [["16", "chapters"], ["4", "learning stages"], ["10", "project files"], ["2", "transports built"]];

const STAGES = [
  {
    id: "fundamentals", title: "MCP Fundamentals", subtitle: "Understand the protocol before writing code",
    chapters: [
      { n: "01", title: "Why MCP exists", details: "The integration problem, capability discovery, MCP versus REST, model tool calling, and where LangChain fits." },
      { n: "02", title: "Host, client, server, and lifecycle", details: "Responsibilities, architecture diagram, JSON-RPC 2.0, connection creation, initialization, capability negotiation, discovery, sessions, ping, shutdown, timeouts, server restarts, and reconnection." },
      { n: "03", title: "Python setup and installation", details: "Python virtual environment, pinned packages, command-line tooling, Node.js and npx for Inspector, and version checks." },
    ],
  },
  {
    id: "implementation", title: "Build & Connect", subtitle: "Develop servers, clients, tools, and resources",
    chapters: [
      { n: "04", title: "FastMCP tools and validation", details: "A Hello MCP server, Python type annotations, tool descriptions, generated input schemas, structured results, and validation errors." },
      { n: "05", title: "Resources and prompts", details: "Register resource URIs, publish reusable prompts, and list, read, and request capabilities from a client." },
      { n: "06", title: "Local STDIO server and client", details: "Start servers as child processes, communicate over stdin and stdout, inspect stderr, make calls, and clean up processes." },
      { n: "07", title: "Streamable HTTP server and client", details: "Run a server at /mcp, connect by URL, send tool calls, and compare network and local process behavior." },
      { n: "08", title: "MCP Inspector and debugging", details: "Launch Inspector for STDIO or HTTP, inspect schemas, call tools, browse resources and prompts, and diagnose failures." },
    ],
  },
  {
    id: "agents", title: "Agents, Security & Interviews", subtitle: "Integrate with real GenAI applications",
    chapters: [
      { n: "09", title: "Authentication and authorization", details: "Verify callers, restrict access to private records, use bearer credentials, and understand why prompts are not security controls." },
      { n: "10", title: "LangChain agents with MCP", details: "Use MultiServerMCPClient, load MCP tools for an optional LangChain agent, and compare agent calls with direct calls." },
      { n: "11", title: "Interview questions and quick reference", details: "Explain transport choices, lifecycle, failures, security, tool discovery, JSON-RPC messages, and retries." },
    ],
  },
  {
    id: "project", title: "Complete Reminder Application", subtitle: "A practical, end-to-end Python implementation",
    chapters: [
      { n: "12", title: "Project design and database", details: "Requirements, project tree, registration and login, owner-scoped tables, UTC dates, and request walkthrough." },
      { n: "13", title: "Full source code, file by file", details: "Complete Python modules for storage, identity, FastAPI authentication, business service, FastMCP server, clients, agent, tests, and Docker." },
      { n: "14", title: "Run and verify every component", details: "Install dependencies, register and log in, run transports, open Inspector, execute clients, run the agent, and test." },
      { n: "15", title: "Docker and cloud deployment", details: "Single-host Compose workflow, container builds, HTTP deployment, persistent storage, and a Cloud Run migration path." },
      { n: "16", title: "Security, testing, and operations", details: "Isolation checks, credential handling, logs, production safeguards, timeouts, backups, and operational limitations." },
    ],
  },
];

const ARCH = [
  { icon: Robot, title: "AI host", tag: "app", text: "Owns the user experience and manages connections." },
  { icon: Plugs, title: "MCP client", tag: "protocol", text: "Handles initialization, discovery and protocol calls." },
  { icon: HardDrives, title: "MCP server", tag: "capabilities", text: "Publishes capabilities and validates requests." },
  { icon: Database, title: "App / data", tag: "backend", text: "Runs business logic using authorized data." },
];

const CAPS = [
  { icon: Lightning, kicker: "Do something", title: "Tools", text: "Callable operations with named inputs and outputs. Use them when a client needs to perform an action or get a computed result.", code: "greet(name) · add(a, b)" },
  { icon: BookOpen, kicker: "Read something", title: "Resources", text: "Named content exposed through URIs. Clients discover and read them as reference material.", code: "hello://guide" },
  { icon: Sparkle, kicker: "Reuse a template", title: "Prompts", text: "Reusable messages or prompt templates that clients discover and request with arguments.", code: "welcome_topic(topic)" },
];

const TRANSPORTS = [
  { icon: Terminal, title: "STDIO", badge: "Local process", text: "The host launches the MCP server as a child process and exchanges protocol messages through its standard input and output.",
    points: ["Useful for local integrations", "Process lifecycle managed by the host", "Separate stderr diagnostics", "No HTTP listener needed"] },
  { icon: Globe, title: "Streamable HTTP", badge: "Network service", text: "The MCP server exposes an HTTP endpoint that clients connect to over a network. It runs independently of the host.",
    points: ["Useful for remote integrations", "Independent server deployment", "HTTP authentication and network concerns", "Endpoint and session handling"] },
];

const CODE = [
  { id: "hello", label: "Hello MCP", title: "Your first MCP server", filename: "hello_mcp.py", description: "Register a Python function as an MCP tool using FastMCP.",
    code: `from fastmcp import FastMCP

mcp = FastMCP("Hello MCP")

@mcp.tool()
def greet(name: str) -> str:
    clean = name.strip()

    if not clean:
        raise ValueError("name must not be blank")

    return f"Hello, {clean}!"

if __name__ == "__main__":
    mcp.run()` },
  { id: "setup", label: "Setup", title: "Install and run MCP", filename: "terminal", description: "Create an environment, install the tested package, and start the local example over STDIO and HTTP.",
    code: `python3 -m venv .venv
source .venv/bin/activate

python -m pip install fastmcp==3.4.7

python hello_mcp.py
python local_client.py

MCP_TRANSPORT=http python hello_mcp.py
python http_client.py` },
  { id: "inspector", label: "Inspector", title: "Inspect without an LLM", filename: "terminal", description: "Discover capabilities, inspect schemas and call tools with MCP Inspector — no model calls needed.",
    code: `npx @modelcontextprotocol/inspector python hello_mcp.py

npx @modelcontextprotocol/inspector http://127.0.0.1:8000/mcp

fastmcp inspect hello_mcp.py
fastmcp list hello_mcp.py` },
  { id: "project", label: "Full project", title: "Run the reminder application", filename: "terminal", description: "Start the authentication API, the MCP server, the direct client, and the tests.",
    code: `python -m pip install -r reminder_app/requirements.txt

python -m pytest -q tests/test_reminder.py

uvicorn reminder_app.auth_api:app --host 127.0.0.1 --port 8081

python -m reminder_app.client --transport stdio --username alice

MCP_TRANSPORT=http PORT=8000 python -m reminder_app.server

python -m reminder_app.client --transport http --username alice` },
];

const FILES = [
  { name: "storage.py", description: "SQLite connection management, users, reminders, and owner-scoped indexes." },
  { name: "identity.py", description: "Password hashing, token creation, expiry, and verification." },
  { name: "auth_api.py", description: "FastAPI registration, login, and health endpoints." },
  { name: "service.py", description: "Input validation, UTC conversion, and owner-restricted CRUD." },
  { name: "server.py", description: "FastMCP tools, resource, prompt, authentication, and transports." },
  { name: "login_token.py", description: "Local login helper for obtaining an Inspector token." },
  { name: "client.py", description: "Direct client that discovers tools and calls STDIO or HTTP MCP." },
  { name: "agent.py", description: "Optional LangChain host that loads MCP tools for an agent." },
  { name: "tests/test_reminder.py", description: "Account isolation, validation, and MCP invocation tests." },
  { name: "Dockerfile + compose.yaml", description: "Container image and two-service local deployment with a SQLite volume." },
];

const SKILLS = [
  { icon: Stack, title: "Architecture", text: "Explain host, client, server and capability responsibilities." },
  { icon: BracketsCurly, title: "Protocol internals", text: "Understand JSON-RPC, initialization, messages and discovery." },
  { icon: ArrowsClockwise, title: "Failure handling", text: "Discuss retries, timeouts, restarts and reconnection behavior." },
  { icon: LockKey, title: "Security", text: "Apply identity verification, authorization and data isolation." },
];

const FAQS = [
  { q: "Does the ebook explain MCP architecture?", a: "Yes. It covers hosts, clients, servers, JSON-RPC 2.0, connection setup, initialization, capability discovery, sessions, timeouts, shutdown, and reconnect behavior." },
  { q: "Will I build both STDIO and HTTP servers?", a: "Yes. You start with a small FastMCP example using both STDIO and Streamable HTTP. The complete reminder application also supports both transports." },
  { q: "Does the book contain complete source code?", a: "Yes. The reminder project contains the complete application structure, Python modules, instructions, direct client, optional LangChain agent, tests, and deployment guidance." },
  { q: "Do I need a paid LLM API key?", a: "Only the optional LangChain agent call requires a model-provider API key. Server, client, Inspector, and application tests can be explored without a paid model call." },
  { q: "Does it cover production deployment?", a: "The book explains local deployment, Docker, operational safeguards, and a path toward cloud deployment. Its SQLite implementation is intended for local or single-host use rather than an unchanged multi-instance production deployment." },
  { q: "Is this useful for GenAI interviews?", a: "Yes. The ebook includes protocol internals, transport comparisons, lifecycle, security, debugging, practical projects, and interview questions." },
  { q: "What format is the book and is it refundable?", a: "It is a digital PDF ebook you can read on a phone, tablet or laptop. Digital purchases are non-refundable. For payment or access help, write to supporttargettrek@gmail.com." },
];

export default function GenaiMCP() {
  return (
    <GenaiBookPage
      id="mcp" seo={SEO} nav={NAV} faqs={FAQS}
      hero={{
        crumb: "GenAI · MCP",
        pill: <><FileText size={14} weight="bold" aria-hidden />GenAI interview handbook · PDF ebook</>,
        title: <>Master MCP, from <span className="hb-mark">protocol to production.</span></>,
        lead: "Understand Model Context Protocol from first principles. Build FastMCP servers and clients in Python, connect them to LangChain, and finish a complete authenticated reminder application.",
        stats: STATS,
        coverFallback: { title: "Master GenAI Interview", subtitle: "Model Context Protocol", line: "16 chapters · FastMCP · Python project" },
      }}
      schemaExtra={[{ "@type": "ItemList", idSuffix: "chapters", name: "Chapters of the MCP ebook", numberOfItems: 16,
        itemListElement: STAGES.flatMap((s) => s.chapters).map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.title, description: c.details })) }]}
      final={{ title: <>Go from understanding MCP <span className="hb-mark">to building with it.</span></>, line: "Learn the architecture, write real Python, compare transports and finish a complete authenticated application." }}
      footerLine="Master GenAI Interview — MCP · Digital PDF ebook · Digital purchases are not refundable"
    >
      {() => (
        <>
          <Section id="what" eyebrow="The foundation" title="What exactly is Model Context Protocol?" lead="MCP standardises how AI applications talk to external capabilities. Instead of a custom integration for every tool, clients discover and call what MCP servers expose.">
            <BeforeAfter
              before={{ label: "Without MCP", text: "An AI app that connects to a document store, issue tracker, database and calendar needs custom schemas, connection handling and error management for each one.", line: "Application-specific integrations and duplicated connection logic." }}
              after={{ label: "With MCP", text: "A host manages connections through clients. Servers expose discoverable tools, resources and prompts. The protocol defines the messages and lifecycle.", line: "One shared protocol for discovery, tool calls and results." }}
            />
          </Section>

          <Section id="architecture" tint eyebrow="Architecture" title="How the four parts work together" lead="Follow one request from the user to an authorized result, and learn who is responsible for what along the way.">
            <Flow steps={ARCH} label="MCP request flow from host to data"
              note={<><ShieldCheck size={18} weight="bold" aria-hidden /><span><b>Important:</b> the host decides which capabilities are available, but the MCP server must still enforce authentication, authorization, validation and access rules before any sensitive operation.</span></>}
            />
          </Section>

          <Section id="capabilities" eyebrow="Core capabilities" title="Tools. Resources. Prompts." lead="The three things an MCP server can expose, each with an example from the book.">
            <Cards items={CAPS} cols={3} />
          </Section>

          <Section id="transports" tint eyebrow="Connectivity" title="STDIO vs Streamable HTTP" lead="When to use a local child process, and when an independently running network service makes more sense. You build both.">
            <Versus items={TRANSPORTS} />
          </Section>

          <Section id="contents" eyebrow="Complete contents" title="16 chapters in four stages" lead="From protocol basics to an authenticated Python app with debugging, testing and deployment. Pick a stage or search every chapter.">
            <Chapters stages={STAGES} placeholder="Search: JSON-RPC, LangChain, FastMCP…" />
          </Section>

          <Section id="code" tint eyebrow="Learn by building" title="From theory to working Python" lead="Real examples from the book: a FastMCP server, setup, Inspector, and the complete reminder application.">
            <CodeTabs examples={CODE} points={["Real Python syntax", "Step-by-step explanation in the ebook", "Practical debugging workflow"]} />
          </Section>

          <Section id="project" eyebrow="End-to-end project" title="Build a complete MCP reminder application" lead="Beyond toy demos: application structure, authentication, owner-scoped data, server and clients, tests, Docker and deployment guidance.">
            <div className="gx-proj">
              <div className="gx-proj-card">
                <span className="gx-kicker">Practical project</span>
                <h3>Learn MCP by building something complete.</h3>
                <p>An authenticated reminder app with FastAPI, FastMCP, SQLite, Python clients and an optional LangChain agent.</p>
                <ul className="hb-checks">
                  {["User registration and login", "Owner-scoped reminder operations", "FastMCP tools, prompts and resources", "STDIO and Streamable HTTP clients", "Testing and Docker deployment"].map((x) => <li key={x}><ShieldCheck size={15} weight="bold" aria-hidden />{x}</li>)}
                </ul>
                <p className="gx-proj-warn"><b>Deployment note:</b> SQLite is used for local and single-host operation. The book explains the changes needed for multi-instance deployment.</p>
              </div>
              <FileTree root="reminder_app/" files={FILES} />
            </div>
          </Section>

          <Section id="skills" tint eyebrow="Engineering skills" title="Understand the protocol. Know the trade-offs." lead="Skills that help with implementation, system integration, debugging and interview discussions.">
            <Cards items={SKILLS} cols={4} />
          </Section>
        </>
      )}
    </GenaiBookPage>
  );
}
