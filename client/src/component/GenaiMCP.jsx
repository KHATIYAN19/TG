import React, { useEffect, useState } from "react";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import {
  ArrowRight, BookOpen, Braces, Check, CheckCircle2, ChevronDown,
  Code2, Copy, Database, FileCode2, Globe2,
  KeyRound, Layers3, Network, Play, RefreshCw, Server,
  ShieldCheck, Sparkles, Terminal, Workflow, Zap,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";

const curriculum = [
  {
    group: "Part 01 / MCP fundamentals",
    chapters: [
      { n: "01", title: "Why MCP exists", details: "The integration problem, capability discovery, MCP versus REST, model tool calling, and where LangChain fits." },
      { n: "02", title: "Host, client, server, and lifecycle", details: "Responsibilities, architecture diagram, JSON-RPC 2.0, connection creation, initialization, capability negotiation, discovery, messages, sessions, ping, shutdown, timeouts, server restarts, and reconnection." },
      { n: "03", title: "Python setup and installation", details: "Python virtual environment, pinned packages, command-line tooling, Node.js and npx for Inspector, and version checks." },
    ],
  },
  {
    group: "Part 02 / Build and connect",
    chapters: [
      { n: "04", title: "FastMCP tools and validation", details: "A neutral Hello MCP server, Python type annotations, tool descriptions, generated input schemas, structured results, and validation errors." },
      { n: "05", title: "Resources and prompts", details: "Register a resource URI, publish a reusable prompt, then list, read, and request each capability from a client." },
      { n: "06", title: "Local STDIO server and client", details: "Start a server as a child process, communicate over stdin and stdout, inspect stderr, make calls, and understand process cleanup." },
      { n: "07", title: "Streamable HTTP server and client", details: "Run the same server independently at /mcp, connect by URL, send tool calls, and compare network and local process behavior." },
      { n: "08", title: "MCP Inspector and debugging", details: "Launch Inspector for STDIO or HTTP, inspect schemas, call tools, browse resources and prompts, and diagnose common failures." },
    ],
  },
  {
    group: "Part 03 / Agents and practical decisions",
    chapters: [
      { n: "09", title: "Authentication and authorization", details: "Verify who is calling, restrict access to private records, use bearer credentials, and understand the limits of prompts as security controls." },
      { n: "10", title: "LangChain agents with MCP", details: "Use MultiServerMCPClient, turn MCP capabilities into LangChain tools, run an optional agent, and compare agent calls with deterministic direct calls." },
      { n: "11", title: "Interview questions and quick reference", details: "Explain transport choices, lifecycle, failures, security, tool discovery, JSON-RPC messages, and retries in plain language." },
    ],
  },
  {
    group: "Part 04 / Complete reminder application",
    chapters: [
      { n: "12", title: "Project design and database", details: "Requirements, complete project tree, registration and login flow, owner-scoped tables, UTC dates, and request walkthrough." },
      { n: "13", title: "Full source code, file by file", details: "Complete Python modules for storage, identity, FastAPI auth, business service, FastMCP server, login helper, direct client, LangChain agent, tests, and Docker files." },
      { n: "14", title: "Run and verify every component", details: "Install dependencies, register and log in, run local and HTTP transports, open Inspector, run the agent, and execute the tests." },
      { n: "15", title: "Docker and cloud deployment", details: "Single-host Compose workflow, container build, HTTP deployment boundary, persistent storage requirements, and a Cloud Run migration path." },
      { n: "16", title: "Security, testing, and operations", details: "Isolation checks, credential handling, logs, production safeguards, timeouts, backups, and operational limitations." },
    ],
  },
];

const files = [
  ["storage.py", "SQLite connection management, users and reminders tables, and owner-scoped indexes."],
  ["identity.py", "Password hashing, token creation, expiry, and token verification."],
  ["auth_api.py", "FastAPI registration, login, and local health endpoint."],
  ["service.py", "Input validation, UTC conversion, and reminder CRUD restricted to the verified owner."],
  ["server.py", "FastMCP tools, a resource, a prompt, auth boundary, and STDIO/HTTP mode."],
  ["login_token.py", "Local login helper used to obtain a short-lived token for Inspector."],
  ["client.py", "Direct client that logs in, discovers tools, and calls STDIO or HTTP MCP."],
  ["agent.py", "Optional LangChain host that loads MCP tools for an LLM agent."],
  ["tests/test_reminder.py", "Account isolation, invalid date, and in-memory MCP invocation checks."],
  ["Dockerfile + compose.yaml", "Image and local two-service setup with a persistent SQLite volume."],
];

const commandSets = [
  {
    label: "Hello MCP",
    title: "Run the small example first",
    explanation: "A neutral server introduces tools, resources, prompts, and both transports before the project code.",
    code: `python3 -m venv .venv
source .venv/bin/activate
python -m pip install fastmcp==3.4.7
python hello_mcp.py                         # STDIO server waits for a client
python local_client.py                      # Starts STDIO server and calls a tool
MCP_TRANSPORT=http python hello_mcp.py      # HTTP server, separate terminal
python http_client.py                       # Calls http://127.0.0.1:8000/mcp`,
  },
  {
    label: "Inspector",
    title: "Inspect tools without a model",
    explanation: "Open the address printed in the terminal, connect, list capabilities, and manually call a tool.",
    code: `npx @modelcontextprotocol/inspector python hello_mcp.py
# Or connect to the running HTTP example:
npx @modelcontextprotocol/inspector http://127.0.0.1:8000/mcp
# Also inspect local declarations:
fastmcp inspect hello_mcp.py
fastmcp list hello_mcp.py`,
  },
  {
    label: "Reminder app",
    title: "Run every application component",
    explanation: "The project chapter walks through registration, login, both transports, the direct client, and tests.",
    code: `python -m pip install -r reminder_app/requirements.txt
python -m pytest -q tests/test_reminder.py
uvicorn reminder_app.auth_api:app --host 127.0.0.1 --port 8081
python -m reminder_app.client --transport stdio --username alice
MCP_TRANSPORT=http PORT=8000 python -m reminder_app.server
python -m reminder_app.client --transport http --username alice`,
  },
];

const faqs = [
  ["Does the book explain MCP architecture deeply?", "Yes. It covers hosts, clients, servers, JSON-RPC 2.0, connection setup, the initialization handshake used by the tested stack, discovery, sessions, ping, shutdown, timeouts, and reconnect behavior."],
  ["Will I build both local and HTTP servers?", "Yes. You start with a neutral FastMCP server and call it using both STDIO and Streamable HTTP. The complete reminder app also supports both transports."],
  ["Is there full project source code?", "Yes. The reminder app section includes the file tree, explanations for the files, complete listings, run commands, tests, and deployment guidance."],
  ["Do I need an LLM API key for the book's exercises?", "Only the optional LangChain agent call needs a model provider key. The server, direct client, Inspector, and project tests work without a paid LLM call."],
  ["Is the reminder app ready to scale on a cloud platform as is?", "Its SQLite setup is for local or single-host use. The book explains the durable shared database and identity changes needed before multi-instance cloud deployment."],
  ["Is this useful for an interview?", "Yes. The explanations and interview questions cover the protocol's why, what, and how, while the code gives you concrete examples to discuss."],
];

const helloCode = `from fastmcp import FastMCP

mcp = FastMCP("Hello MCP")

@mcp.tool()
def greet(name: str) -> str:
    """Return a greeting for a nonblank name."""
    clean = name.strip()
    if not clean:
        raise ValueError("name must not be blank")
    return f"Hello, {clean}!"

if __name__ == "__main__":
    mcp.run()`;

function SectionIntro({ eyebrow, title, text, center = false }) {
  return (
    <div className={`mb-10 max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</span>
      <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#142A4B] sm:text-4xl lg:text-[42px]">{title}</h2>
      {text && <p className="mt-4 text-base leading-7 text-slate-600">{text}</p>}
    </div>
  );
}

function CodeWindow({ filename, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-[#F8FBFF] shadow-xl shadow-blue-900/5">
      <div className="flex items-center justify-between border-b border-blue-100 bg-[#EAF3FF] px-5 py-3 text-xs text-slate-600">
        <span className="flex gap-1.5"><i className="h-2 w-2 rounded-full bg-red-400" /><i className="h-2 w-2 rounded-full bg-amber-300" /><i className="h-2 w-2 rounded-full bg-emerald-300" /></span>
        <span className="font-semibold">{filename}</span>
        <span>PYTHON</span>
      </div>
      <pre className="overflow-x-auto p-5 text-[12px] leading-7 text-slate-800 sm:p-7"><code>{children}</code></pre>
    </div>
  );
}

export default function GenaiMCP() {
  const [activeCommand, setActiveCommand] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [copied, setCopied] = useState(false);
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referralCode = (params.get("referralCode") || params.get("ref") || "").trim();
    if (referralCode) localStorage.setItem("referralCode", referralCode);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      setLoadingProduct(true);
      setProductError("");
      setProduct(null);
      setIsCheckoutOpen(false);

      try {
        const redirectUrl = window.location.pathname;
        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(redirectUrl)}`,
          { method: "GET", signal: controller.signal }
        );
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.success || !result?.data) {
          throw new Error("Something went wrong. Please try again.");
        }

        const data = result.data;
        const price = Number(data.price);
        if (
          !data._id ||
          typeof data.title !== "string" || !data.title.trim() ||
          data.price === null || data.price === undefined ||
          !String(data.price).trim() ||
          !Number.isFinite(price) || price < 0
        ) {
          throw new Error("Something went wrong. Please try again.");
        }
        if (!controller.signal.aborted) setProduct(data);
      } catch (error) {
        if (error?.name === "AbortError" || controller.signal.aborted) return;
        console.error("Failed to fetch MCP product:", error);
        setProductError("Something went wrong. Please try again.");
      } finally {
        if (!controller.signal.aborted) setLoadingProduct(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [retryCount]);

  const currentPrice = product ? Number(product.price) : null;
  const rawMrp = product?.mrp;
  const mrp = rawMrp !== null && rawMrp !== undefined && rawMrp !== ""
    ? Number(rawMrp)
    : null;
  const hasMrp = mrp !== null && Number.isFinite(mrp) && mrp > currentPrice;
  const discount = hasMrp ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0;
  const currency = product?.currency || "INR";
  const productTitle = "MASTER GENAI INTERVIEW MCP";
  const canBuy = Boolean(product?._id) && !loadingProduct && !productError;

  const formatMoney = (amount) => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency", currency, maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `₹${amount}`;
    }
  };

  const handleBuyNow = () => {
    if (!canBuy) return;
    setIsCheckoutOpen(true);
  };

  const retryProduct = () => setRetryCount((count) => count + 1);

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(commandSets[activeCommand].code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1700);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8FAFE] text-[#23344A] antialiased">
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F3F8FF] to-[#EAF3FF] text-[#142A4B]">
          <div className="pointer-events-none absolute -right-40 -top-56 h-[550px] w-[550px] rounded-full bg-blue-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full border border-blue-200/60" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-[11px] font-bold tracking-widest text-blue-700 shadow-sm"><Sparkles size={14} /> TARGET TREK · DEVELOPER SERIES</span>
              <h1 className="mt-6 max-w-2xl text-[42px] font-black leading-[1.06] tracking-[-0.055em] sm:text-6xl lg:text-[68px]">{productTitle}</h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">{product?.shortDescription || product?.subtitle || "Understand Model Context Protocol, build Python servers and clients, connect them with LangChain, and finish with a complete authenticated reminder application."}</p>
              <div className="mt-7 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                {["Architecture & JSON-RPC 2.0", "STDIO + Streamable HTTP", "FastMCP + LangChain", "Full project code & commands"].map((item) => <span className="flex items-center gap-2" key={item}><CheckCircle2 size={17} className="shrink-0 text-teal-600" />{item}</span>)}
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <button type="button" onClick={handleBuyNow} disabled={!canBuy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300">{loadingProduct ? "Loading price..." : canBuy ? `Get the ebook for ${formatMoney(currentPrice)}` : "Price unavailable"} <ArrowRight size={18} /></button>
                <a href="#curriculum" className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-4 text-sm font-bold text-blue-700 transition hover:bg-blue-50">Explore all topics <ArrowRight size={16} /></a>
              </div>
              <p className="mt-5 text-xs text-slate-500">Python examples · One complete project</p>
              {productError && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Something went wrong. Please try again. <button type="button" onClick={retryProduct} className="ml-2 font-bold underline">Retry</button></div>}
            </div>
            <div className="relative mx-auto w-full max-w-[390px] py-5" aria-label="Illustrated cover of MASTER GENAI INTERVIEW MCP">
              <div className="absolute inset-10 rounded-full bg-blue-300/30 blur-[80px]" />
              <div className="relative mx-auto flex min-h-[465px] max-w-[325px] -rotate-3 flex-col overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-white to-[#E6F1FF] p-7 text-[#142A4B] shadow-[0_30px_80px_rgba(54,96,153,.18)] ring-8 ring-blue-100/60">
                <span className="text-[10px] font-black tracking-widest">TARGET TREK <span className="text-slate-500">/ DEVELOPER SERIES</span></span>
                <div className="relative mt-10 h-32" aria-hidden="true">
                  <div className="absolute left-4 top-7 h-[1px] w-40 rotate-12 bg-sky-300/80" /><div className="absolute left-20 top-10 h-[1px] w-32 -rotate-[35deg] bg-sky-300/80" /><div className="absolute left-20 top-12 h-[1px] w-40 rotate-[30deg] bg-sky-300/80" />
                  <div className="absolute left-3 top-5 h-4 w-4 rounded-full bg-sky-300 shadow-[0_0_22px_#7dd3fc]" /><div className="absolute left-20 top-10 h-4 w-4 rounded-full bg-sky-300 shadow-[0_0_22px_#7dd3fc]" /><div className="absolute right-6 top-0 h-4 w-4 rounded-full bg-sky-300 shadow-[0_0_22px_#7dd3fc]" /><div className="absolute bottom-0 right-2 h-4 w-4 rounded-full bg-sky-300 shadow-[0_0_22px_#7dd3fc]" />
                </div>
                <div className="mt-5 text-[28px] font-black leading-[1.12] tracking-tight">MASTER GENAI<br />INTERVIEW MCP</div>
                <p className="mt-3 text-xs leading-5 text-slate-600">Architecture, protocol internals<br />and deployment</p>
                <span className="mt-auto pt-5 text-[9px] text-slate-500">FastMCP · LangChain · Python · HTTP · STDIO</span>
              </div>
              <div className="absolute -right-3 top-11 hidden items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 shadow-lg sm:flex"><Server size={15} /> MCP SERVER</div>
              <div className="absolute -bottom-1 -left-3 hidden items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 shadow-lg sm:flex"><Code2 size={15} /> PYTHON CODE</div>
            </div>
          </div>
        </section>

        {/* FACTS */}
        <div className="border-b border-blue-100 bg-white"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-5 py-6 text-xs font-bold text-slate-700 sm:px-8 md:grid-cols-4 md:text-sm">{[[BookOpen, "Python code examples"], [Network, "Architecture diagram"], [Terminal, "Runnable commands"], [ShieldCheck, "Auth and security"]].map(([Icon, label]) => <span key={label} className="flex items-center gap-2"><Icon size={18} className="shrink-0 text-blue-600" />{label}</span>)}</div></div>

        {/* MCP EXPLAINED */}
        <section id="what-is-mcp" className="bg-white px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">
          <SectionIntro eyebrow="THE FUNDAMENTAL IDEA" title="What is MCP?" text="Model Context Protocol (MCP) is an open way for AI applications to connect to external capabilities. A host creates an MCP client connection to a server; the server describes what it can do, and the client can request an operation through a common protocol." />
          <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <div className="rounded-2xl border border-blue-100 bg-[#F8FBFF] p-6 sm:p-8">
              <h3 className="text-xl font-extrabold text-[#142A4B]">Why was a protocol needed?</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">Imagine an AI assistant that needs a calendar, an issue tracker, a document store, and a database. If every application and every service has a custom integration, the same connection, schema, and error handling work gets repeated. MCP gives compatible clients and servers a shared way to discover and use capabilities.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-blue-100 bg-white p-4"><strong className="text-sm text-blue-700">The host decides</strong><p className="mt-1 text-xs leading-6 text-slate-600">Which servers to connect to and which tools a model may see.</p></div><div className="rounded-xl border border-blue-100 bg-white p-4"><strong className="text-sm text-blue-700">The server executes</strong><p className="mt-1 text-xs leading-6 text-slate-600">Validates requests and enforces access before touching data.</p></div></div>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8"><span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">THE 20-SECOND VIEW</span><div className="mt-6 space-y-4">{[["1", "Your app is the host", "It receives the user's request and owns the user experience."], ["2", "It uses an MCP client", "The client opens a local or network connection to one server."], ["3", "The server publishes capabilities", "Tools, resources, and prompts are discovered through protocol calls."], ["4", "The server returns a result", "The host decides how to use the returned data or tool output."]].map(([number, title, detail]) => <div key={number} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">{number}</span><div><div className="text-sm font-extrabold text-[#142A4B]">{title}</div><p className="mt-0.5 text-xs leading-5 text-slate-600">{detail}</p></div></div>)}</div></div>
          </div>
          <p className="mt-6 rounded-xl border border-sky-100 bg-sky-50 px-5 py-4 text-sm leading-7 text-slate-700"><strong className="text-blue-700">In this ebook:</strong> you first run a neutral Hello MCP service. Only after you know the client and server flow do you build the authenticated reminder project.</p>
        </div></section>

        {/* MCP CAPABILITIES */}
        <section id="capabilities" className="bg-[#F2F7FE] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">
          <SectionIntro eyebrow="THE THREE CORE CAPABILITIES" title="Tools, resources, and prompts" text="These are different ways a server shares functionality with a client. The book shows how to publish each one in FastMCP and request it from Python." />
          <div className="grid gap-5 md:grid-cols-3">
            {[[Zap, "Tools", "Do something", "Callable operations with named inputs and outputs. Use a tool when the client needs an action or a computed answer.", "greet(name) · add(a, b)", "tools/list → tools/call"], [BookOpen, "Resources", "Read something", "Named content available by URI. Use a resource for reference information that a client can list and read.", "hello://guide", "resources/list → resources/read"], [Sparkles, "Prompts", "Start from a template", "Reusable messages or instructions that a client can discover and request with arguments.", "welcome_topic(topic)", "prompts/list → prompts/get"]].map(([Icon, title, badge, detail, example, flow]) => <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm" key={title}><span className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-600"><Icon size={23}/></span><div className="mt-5 text-[11px] font-black uppercase tracking-widest text-teal-700">{badge}</div><h3 className="mt-1 text-xl font-extrabold text-[#142A4B]">{title}</h3><p className="mt-3 min-h-24 text-sm leading-7 text-slate-600">{detail}</p><div className="mt-5 rounded-lg bg-[#F2F7FE] px-3 py-2 font-mono text-xs text-blue-700">{example}</div><p className="mt-3 font-mono text-[11px] text-slate-500">{flow}</p></article>)}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2"><div className="rounded-xl border border-blue-100 bg-white p-5"><h3 className="font-bold text-[#142A4B]">Where does LangChain fit?</h3><p className="mt-2 text-sm leading-6 text-slate-600">It can run the host-side agent and adapt discovered MCP tools into tools a model can use. The server still checks the operation.</p></div><div className="rounded-xl border border-blue-100 bg-white p-5"><h3 className="font-bold text-[#142A4B]">Is a model required?</h3><p className="mt-2 text-sm leading-6 text-slate-600">No. A direct MCP client can list capabilities and call tools without a model. The optional LangChain chapter comes later.</p></div></div>
        </div></section>

        {/* WHY THIS BOOK */}
        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <SectionIntro eyebrow="WHY READ THIS GUIDE" title="Understand the protocol. Then make it work." text="A practical path from MCP fundamentals to working code, with the design decisions an engineer needs to explain in an interview." center />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Layers3, "Start with the why", "Learn what MCP standardizes and how hosts, clients, servers, tools, resources, and prompts relate."],
              [Braces, "See the wire protocol", "Study JSON-RPC 2.0 messages, handshake and versioning, discovery, responses, notifications, and errors."],
              [RefreshCw, "Understand failures", "See how STDIO and HTTP connections fail, when clients reconnect, and what must be discovered again."],
              [Code2, "Build for real", "Move from a neutral Hello MCP example to a full reminder application with Python code."],
            ].map(([Icon, title, text]) => <article key={title} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"><span className="inline-flex rounded-xl bg-blue-50 p-3 text-blue-600"><Icon size={23} /></span><h3 className="mt-5 text-lg font-extrabold text-[#142A4B]">{title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{text}</p></article>)}
          </div>
        </section>

        {/* ARCHITECTURE */}
        <section id="architecture" className="bg-[#F2F7FE] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">
          <SectionIntro eyebrow="THE BIG PICTURE" title="How an MCP request travels" text="The model can suggest an action. The host decides what to expose, the MCP client handles the protocol, and the server executes authorized work." />
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
            {[
              ["01", "User & host", "Receives the user request, handles approvals, chooses connected servers and model tools.", Workflow],
              ["02", "MCP client", "Opens STDIO pipes or an HTTP connection, exchanges JSON-RPC and discovers capabilities.", Network],
              ["03", "MCP server", "Publishes tools, resources and prompts; validates requests and authorizes sensitive actions.", Server],
              ["04", "App / database", "Performs business logic, stores durable data and filters records by verified identity.", Database],
            ].map(([n, title, text, Icon], i) => <React.Fragment key={title}><div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-blue-600"><span className="text-xs font-black tracking-widest">{n}</span><Icon size={22} /></div><h3 className="mt-6 text-base font-extrabold text-[#142A4B]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>{i < 3 && <ArrowRight className="mx-auto self-center rotate-90 text-blue-500 lg:rotate-0" size={20} />}</React.Fragment>)}
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[["Connection", "STDIO starts a child process; HTTP connects to an already running endpoint."], ["Handshake", "The tested protocol revision exchanges initialize and initialized before normal calls."], ["Restart", "A fresh connection repeats setup and tool discovery; write retries require care."]].map(([title, detail]) => <div className="rounded-xl border border-blue-100 bg-white/80 p-5" key={title}><span className="font-extrabold text-blue-700">{title}</span><p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p></div>)}
          </div>
        </div></section>

        {/* PROTOCOL LIFECYCLE */}
        <section className="bg-white px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">
          <SectionIntro eyebrow="FROM CONNECT TO RESULT" title="What actually happens on the wire?" text="MCP uses JSON-RPC 2.0 messages. The specific startup sequence depends on protocol revision; the code in this book targets the revision verified with its installed libraries." />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{[["01", "Create connection", "A host launches a child process for STDIO or contacts an HTTP /mcp endpoint."], ["02", "Initialize", "In the tested revision, the client and server exchange version, identity, and capability information."], ["03", "Discover", "The client asks for tools, resources, or prompts and receives their descriptions and schemas."], ["04", "Call and respond", "A request carries a JSON-RPC id and method. Its response uses the same id; notifications do not require a reply."], ["05", "Close or reconnect", "On exit or failure, the host closes or creates a new connection and refreshes the discovered capabilities."]].map(([n, title, detail]) => <div key={n} className="rounded-xl border border-blue-100 bg-[#F8FBFF] p-5"><span className="text-xs font-black tracking-widest text-blue-600">STEP {n}</span><h3 className="mt-4 font-extrabold text-[#142A4B]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p></div>)}</div>
          <div className="mt-6 grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-blue-100 bg-blue-50 p-5"><h3 className="font-extrabold text-blue-700">If a server stops</h3><p className="mt-2 text-sm leading-6 text-slate-600">A STDIO client can observe process exit or EOF. An HTTP client may receive refusal, reset, timeout, or a lost-session response. The host must reconnect according to its own policy.</p></div><div className="rounded-xl border border-blue-100 bg-blue-50 p-5"><h3 className="font-extrabold text-blue-700">If a request was a write</h3><p className="mt-2 text-sm leading-6 text-slate-600">A missing response does not prove the write failed. The project discusses checking stored state and using idempotency instead of blindly repeating creates.</p></div></div>
        </div></section>

        {/* CONTENTS */}
        <section id="curriculum" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <SectionIntro eyebrow="COMPLETE TABLE OF CONTENTS" title="Every topic, in the order you need it" text="The first three parts use general MCP examples. The final part brings everything together in the reminder app." />
          <div className="grid gap-6 lg:grid-cols-2">{curriculum.map((part) => <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm" key={part.group}><div className="border-b border-blue-100 bg-[#EAF3FF] px-6 py-4 text-xs font-black uppercase tracking-widest text-blue-700">{part.group}</div><div className="divide-y divide-slate-100 px-6">{part.chapters.map((ch) => <article key={ch.n} className="flex gap-4 py-5"><span className="mt-0.5 text-xs font-black text-blue-600">{ch.n}</span><div><h3 className="font-extrabold text-[#142A4B]">{ch.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{ch.details}</p></div></article>)}</div></div>)}</div>
          <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50/60 px-5 py-4 text-sm leading-6 text-slate-700"><BookOpen size={18} className="mr-2 inline text-blue-600"/>The book closes with official protocol and SDK references and the CampusX MCP YouTube playlist for further study.</div>
        </section>

        {/* TRANSPORTS */}
        <section className="bg-[#F2F7FE] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">
          <SectionIntro eyebrow="TWO WAYS TO CONNECT" title="STDIO versus Streamable HTTP" text="Understand when a host launches the server locally and when a client connects to a separate network service." />
          <div className="grid gap-5 md:grid-cols-2">
            {[
              { icon: Terminal, name: "Local STDIO", badge: "HOST-LAUNCHED", points: ["The host starts a Python child process.", "The client writes JSON-RPC to stdin and reads stdout.", "stderr carries server diagnostics.", "A restarted process needs a fresh client connection and discovery."] },
              { icon: Globe2, name: "Streamable HTTP", badge: "NETWORK SERVICE", points: ["The server starts independently at an /mcp endpoint.", "The client connects to its URL and sends HTTP requests.", "Protected services need verified credentials.", "A restart may invalidate a legacy logical session; reconnect and rediscover."] },
            ].map(({ icon: Icon, name, badge, points }) => <article key={name} className="rounded-2xl border border-blue-100 bg-white p-7 shadow-sm"><div className="flex items-center gap-3"><span className="rounded-xl bg-blue-50 p-3 text-blue-600"><Icon size={24}/></span><div><div className="text-[10px] font-black tracking-widest text-blue-600">{badge}</div><h3 className="text-xl font-black text-[#142A4B]">{name}</h3></div></div><ul className="mt-6 space-y-4">{points.map((point) => <li key={point} className="flex gap-3 text-sm leading-6 text-slate-600"><Check size={16} className="mt-1 shrink-0 text-teal-600"/>{point}</li>)}</ul></article>)}
          </div>
        </div></section>

        {/* CODE */}
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-24">
          <div><SectionIntro eyebrow="LEARN BY RUNNING" title="A simple example before the complete project" text="Create a FastMCP server, publish a typed tool, run it locally, then add HTTP, resources, prompts, Inspector, and LangChain."/><ul className="space-y-4 text-sm text-slate-700">{["Working server and direct client examples", "Commands for each transport and Inspector", "Typed schemas, results and validation", "An optional LangChain agent example"].map((item) => <li className="flex items-start gap-3" key={item}><CheckCircle2 className="mt-0.5 shrink-0 text-teal-600" size={18}/>{item}</li>)}</ul></div>
          <CodeWindow filename="hello_mcp.py">{helloCode}</CodeWindow>
        </section>

        {/* COMMANDS */}
        <section id="commands" className="bg-[#F2F7FE] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">
          <SectionIntro eyebrow="RUN EACH COMPONENT" title="Commands, not just screenshots" text="The book gives copyable instructions for the neutral service and the complete project. Here is a sample of the workflow." />
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Command examples">{commandSets.map((set, index) => <button key={set.label} type="button" role="tab" aria-selected={activeCommand === index} onClick={() => { setActiveCommand(index); setCopied(false); }} className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${activeCommand === index ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "border border-blue-100 bg-white text-slate-600 hover:bg-blue-50"}`}>{set.label}</button>)}</div>
          <div role="tabpanel" className="mt-5 overflow-hidden rounded-2xl border border-blue-100 bg-white text-[#142A4B] shadow-xl shadow-blue-900/5"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 bg-[#EAF3FF] px-5 py-4"><div><h3 className="font-bold">{commandSets[activeCommand].title}</h3><p className="mt-1 text-xs text-slate-600">{commandSets[activeCommand].explanation}</p></div><button type="button" onClick={copyCommand} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50">{copied ? <Check size={15}/> : <Copy size={15}/>} {copied ? "Copied" : "Copy"}</button></div><pre className="overflow-x-auto p-5 text-xs leading-7 text-slate-800 sm:p-7"><code>{commandSets[activeCommand].code}</code></pre></div>
          <p className="mt-4 text-xs leading-6 text-slate-600">Project processes such as the auth API and HTTP MCP server run in separate terminals. The ebook explains environment variables and the required order.</p>
        </div></section>

        {/* PROJECT */}
        <section id="project" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
          <SectionIntro eyebrow="THE CAPSTONE PROJECT" title="Build a complete MCP reminder application" text="The final chapters bring authentication, data storage, MCP transports, clients, LangChain, tests, and deployment into one coherent project." />
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-5">
              {[
                ["1", "Register and log in", "FastAPI registers a user, validates the password, and issues a short-lived signed token.", KeyRound],
                ["2", "Connect to the MCP server", "A local client launches STDIO or a network client connects to an authenticated /mcp endpoint.", Network],
                ["3", "Discover and call tools", "The client finds create, list, complete, and delete operations, then sends validated arguments.", Workflow],
                ["4", "Enforce ownership", "The server derives identity from verified credentials; SQL filters and updates use the owner ID.", ShieldCheck],
                ["5", "Run, test, and deploy", "Inspector exercises, isolation tests, Docker commands, and cloud migration boundaries complete the workflow.", Play],
              ].map(([n, title, detail, Icon]) => <div className="flex gap-4 rounded-xl border border-blue-100 bg-white p-5 shadow-sm" key={n}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-600">{n}</span><div><div className="flex items-center gap-2 font-extrabold text-[#142A4B]"><Icon size={17} className="text-blue-600"/>{title}</div><p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p></div></div>)}
            </div>
            <div className="self-start overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-lg shadow-blue-900/5"><div className="flex items-center gap-2 border-b border-blue-100 bg-[#EAF3FF] px-5 py-4 font-extrabold text-[#142A4B]"><FileCode2 size={18} className="text-blue-600"/> Files explained in the book</div><div className="divide-y divide-slate-100 px-5">{files.map(([name, purpose]) => <div className="py-3" key={name}><div className="font-mono text-[13px] font-bold text-blue-700">{name}</div><p className="mt-0.5 text-xs leading-5 text-slate-600">{purpose}</p></div>)}</div><div className="bg-[#F2F7FE] px-5 py-4 text-xs font-bold text-blue-700">Full source listings and step-by-step run commands included.</div></div>
          </div>
        </section>

        {/* AUDIENCE */}
        <section className="bg-[#F2F7FE] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><SectionIntro eyebrow="WHO SHOULD READ THIS" title="Made for developers who want to explain and build MCP" center/><div className="grid gap-5 md:grid-cols-3">{[[Server, "Backend engineers", "Learn process and HTTP transports, identity boundaries, validation, failure handling, and deployment choices."], [Zap, "GenAI builders", "Connect a real MCP server to LangChain and understand the tool path from user request to result."], [BookOpen, "Interview candidates", "Use architecture, wire examples, project trade-offs, and interview answers to explain the system clearly."]].map(([Icon, title, detail]) => <div className="rounded-2xl border border-blue-100 bg-white p-7" key={title}><Icon className="text-blue-600" size={26}/><h3 className="mt-4 text-lg font-extrabold text-[#142A4B]">{title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{detail}</p></div>)}</div></div></section>

        {/* PRICING */}
        <section id="pricing" className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_0.85fr] lg:py-24">
          <div><SectionIntro eyebrow="GET THE EBOOK" title="One guide. From protocol to working project." text="Learn from the neutral examples, follow the detailed application flow, and keep the full code and command reference at hand."/><div className="grid gap-3 sm:grid-cols-2">{["Architecture diagram and lifecycle", "JSON-RPC 2.0 and handshake", "STDIO and HTTP server/client", "MCP Inspector walkthrough", "LangChain integration", "Full reminder app code", "Auth, testing, and deployment", "Official sources and further reading"].map((item) => <div key={item} className="flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-teal-600"/>{item}</div>)}</div></div>
          <div className="rounded-3xl border border-blue-100 bg-white p-7 shadow-[0_24px_70px_rgba(20,42,75,.11)] sm:p-9">
            <span className="text-xs font-black uppercase tracking-widest text-blue-700">{productTitle}</span>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <strong className="text-5xl font-black tracking-tighter text-[#142A4B] sm:text-6xl">{loadingProduct ? "Loading price..." : canBuy ? formatMoney(currentPrice) : "Price unavailable"}</strong>
              {canBuy && hasMrp && <del className="text-2xl font-semibold text-slate-400">{formatMoney(mrp)}</del>}
              {canBuy && discount > 0 && <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">{discount}% OFF</span>}
            </div>
            {product?.subtitle && <p className="mt-3 text-sm text-slate-600">{product.subtitle}</p>}
            {product?.shortDescription && <p className="mt-3 text-sm leading-6 text-slate-600">{product.shortDescription}</p>}
            {product?.description && <p className="mt-3 text-sm leading-6 text-slate-600">{product.description}</p>}
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
              {[product?.edition, product?.language, product?.format, product?.level, product?.resource_type, ...(Array.isArray(product?.categories) ? product.categories : [])].filter(Boolean).map((value, index) => <span key={`${value}-${index}`} className="rounded-full bg-blue-50 px-3 py-1">{value}</span>)}
            </div>
            <div className="my-6 border-t border-slate-100" />
            <button type="button" onClick={handleBuyNow} disabled={!canBuy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Get the ebook <ArrowRight size={18}/></button>
            {productError && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Something went wrong. Please try again. <button type="button" onClick={retryProduct} className="font-bold underline">Retry</button></div>}
            <div className="mt-5 space-y-1 text-center text-[11px] leading-5 text-slate-500"><p>This digital book is not refundable.</p><p>For support, contact <a href="mailto:supporttargettrek@gmail.com" className="underline decoration-slate-300 underline-offset-2 hover:text-blue-700">supporttargettrek@gmail.com</a></p></div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-[#F2F7FE] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-3xl"><SectionIntro eyebrow="QUESTIONS" title="Frequently asked questions" center/><div className="divide-y divide-blue-100 border-y border-blue-100">{faqs.map(([question, answer], index) => <div key={question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index} aria-controls={`mcp-faq-${index}`} className="flex w-full items-center justify-between gap-6 py-5 text-left font-bold text-[#142A4B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"><span>{question}</span><ChevronDown className={`shrink-0 transition-transform ${openFaq === index ? "rotate-180" : ""}`} size={19}/></button><div id={`mcp-faq-${index}`} hidden={openFaq !== index} className="pb-5 pr-9 text-sm leading-7 text-slate-600">{answer}</div></div>)}</div></div></section>

        <section className="bg-[#EAF3FF] px-5 py-14 text-[#142A4B] sm:px-8"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 md:flex-row md:items-center"><div><span className="text-xs font-black uppercase tracking-widest text-blue-600">READY TO BUILD?</span><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Learn MCP from the wire to the app.</h2><p className="mt-2 text-sm text-slate-600">Architecture, examples, full project, and commands in one ebook.</p></div><button type="button" onClick={handleBuyNow} disabled={!canBuy} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-extrabold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{canBuy ? `Get the ebook — ${formatMoney(currentPrice)}` : loadingProduct ? "Loading price..." : "Price unavailable"} <ArrowRight size={18}/></button></div><p className="mx-auto mt-6 max-w-7xl text-[11px] leading-5 text-slate-500">This digital book is not refundable. For support: <a className="underline hover:text-blue-700" href="mailto:supporttargettrek@gmail.com">supporttargettrek@gmail.com</a></p></section>
      </main>
      <PayUCheckoutModal isOpen={isCheckoutOpen && canBuy} onClose={() => setIsCheckoutOpen(false)} product={product} />
      {/* Mobile buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-blue-100 bg-white px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-9px_32px_rgba(20,42,75,.14)] md:hidden">
        <div className="leading-tight">
          {canBuy && hasMrp && <div className="text-[10px] text-slate-500"><del>{formatMoney(mrp)}</del>{discount > 0 && <span className="ml-2 font-extrabold text-green-700">{discount}% OFF</span>}</div>}
          <strong className="text-lg font-black text-[#142A4B]">{loadingProduct ? "Loading..." : canBuy ? formatMoney(currentPrice) : "Price unavailable"}</strong>
        </div>
        <button type="button" onClick={handleBuyNow} disabled={!canBuy} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-3 text-xs font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50">Get ebook <ArrowRight size={16}/></button>
      </div>
      <div className="h-16 bg-[#EAF3FF] md:hidden" aria-hidden="true" />
    </div>
  );
}
