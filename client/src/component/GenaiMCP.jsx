
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
  Braces,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  Copy,
  Database,
  Download,
  ExternalLink,
  FileCode2,
  FileText,
  GitBranch,
  Globe2,
  KeyRound,
  Layers3,
  LockKeyhole,
  Network,
  Play,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Workflow,
  X,
  Zap,
} from "lucide-react";

// ======================================================
// CONFIGURATION - EXISTING ROUTE AND API
// ======================================================

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";

const PAGE_PATH = "/book/genai/mcp";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  "http://localhost:5001";

const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SEO_TITLE =
  "Master GenAI Interview MCP – Model Context Protocol, FastMCP & LangChain | Target Trek";

const SEO_DESCRIPTION =
  "Learn Model Context Protocol with the Target Trek MCP ebook. Understand hosts, clients, servers, JSON-RPC 2.0, STDIO, Streamable HTTP, FastMCP, LangChain, authentication, deployment, and a complete Python project.";

// ======================================================
// THEME & PRICE HELPERS
// ======================================================

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
  if (amount === null || amount === undefined || amount === "") {
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
        minimumFractionDigits: Number.isInteger(number)
          ? 0
          : 2,
        maximumFractionDigits: 2,
      }
    ).format(number);
  } catch {
    return `${currency} ${number}`;
  }
};

// ======================================================
// BOOK CURRICULUM - EXISTING 16 CHAPTER STRUCTURE
// ======================================================

const CURRICULUM = [
  {
    id: "fundamentals",
    label: "01",
    title: "MCP Fundamentals",
    subtitle: "Understand the protocol before writing code",
    chapters: [
      {
        n: "01",
        title: "Why MCP exists",
        details:
          "The integration problem, capability discovery, MCP versus REST, model tool calling, and where LangChain fits.",
      },
      {
        n: "02",
        title: "Host, client, server, and lifecycle",
        details:
          "Responsibilities, architecture diagram, JSON-RPC 2.0, connection creation, initialization, capability negotiation, discovery, sessions, ping, shutdown, timeouts, server restarts, and reconnection.",
      },
      {
        n: "03",
        title: "Python setup and installation",
        details:
          "Python virtual environment, pinned packages, command-line tooling, Node.js and npx for Inspector, and version checks.",
      },
    ],
  },
  {
    id: "implementation",
    label: "02",
    title: "Build & Connect",
    subtitle: "Develop servers, clients, tools, and resources",
    chapters: [
      {
        n: "04",
        title: "FastMCP tools and validation",
        details:
          "A Hello MCP server, Python type annotations, tool descriptions, generated input schemas, structured results, and validation errors.",
      },
      {
        n: "05",
        title: "Resources and prompts",
        details:
          "Register resource URIs, publish reusable prompts, and list, read, and request capabilities from a client.",
      },
      {
        n: "06",
        title: "Local STDIO server and client",
        details:
          "Start servers as child processes, communicate over stdin and stdout, inspect stderr, make calls, and clean up processes.",
      },
      {
        n: "07",
        title: "Streamable HTTP server and client",
        details:
          "Run a server at /mcp, connect by URL, send tool calls, and compare network and local process behavior.",
      },
      {
        n: "08",
        title: "MCP Inspector and debugging",
        details:
          "Launch Inspector for STDIO or HTTP, inspect schemas, call tools, browse resources and prompts, and diagnose failures.",
      },
    ],
  },
  {
    id: "agents",
    label: "03",
    title: "Agents, Security & Interviews",
    subtitle: "Integrate with real GenAI applications",
    chapters: [
      {
        n: "09",
        title: "Authentication and authorization",
        details:
          "Verify callers, restrict access to private records, use bearer credentials, and understand why prompts are not security controls.",
      },
      {
        n: "10",
        title: "LangChain agents with MCP",
        details:
          "Use MultiServerMCPClient, load MCP tools for an optional LangChain agent, and compare agent calls with direct calls.",
      },
      {
        n: "11",
        title: "Interview questions and quick reference",
        details:
          "Explain transport choices, lifecycle, failures, security, tool discovery, JSON-RPC messages, and retries.",
      },
    ],
  },
  {
    id: "project",
    label: "04",
    title: "Complete Reminder Application",
    subtitle: "A practical, end-to-end Python implementation",
    chapters: [
      {
        n: "12",
        title: "Project design and database",
        details:
          "Requirements, project tree, registration and login, owner-scoped tables, UTC dates, and request walkthrough.",
      },
      {
        n: "13",
        title: "Full source code, file by file",
        details:
          "Complete Python modules for storage, identity, FastAPI authentication, business service, FastMCP server, clients, agent, tests, and Docker.",
      },
      {
        n: "14",
        title: "Run and verify every component",
        details:
          "Install dependencies, register and log in, run transports, open Inspector, execute clients, run the agent, and test.",
      },
      {
        n: "15",
        title: "Docker and cloud deployment",
        details:
          "Single-host Compose workflow, container builds, HTTP deployment, persistent storage, and a Cloud Run migration path.",
      },
      {
        n: "16",
        title: "Security, testing, and operations",
        details:
          "Isolation checks, credential handling, logs, production safeguards, timeouts, backups, and operational limitations.",
      },
    ],
  },
];

// ======================================================
// PROJECT FILES - FROM EXISTING PAGE
// ======================================================

const PROJECT_FILES = [
  {
    name: "storage.py",
    description:
      "SQLite connection management, users, reminders, and owner-scoped indexes.",
  },
  {
    name: "identity.py",
    description:
      "Password hashing, token creation, expiry, and verification.",
  },
  {
    name: "auth_api.py",
    description:
      "FastAPI registration, login, and health endpoints.",
  },
  {
    name: "service.py",
    description:
      "Input validation, UTC conversion, and owner-restricted CRUD.",
  },
  {
    name: "server.py",
    description:
      "FastMCP tools, resource, prompt, authentication, and transports.",
  },
  {
    name: "login_token.py",
    description:
      "Local login helper for obtaining an Inspector token.",
  },
  {
    name: "client.py",
    description:
      "Direct client that discovers tools and calls STDIO or HTTP MCP.",
  },
  {
    name: "agent.py",
    description:
      "Optional LangChain host that loads MCP tools for an agent.",
  },
  {
    name: "tests/test_reminder.py",
    description:
      "Account isolation, validation, and MCP invocation tests.",
  },
  {
    name: "Dockerfile + compose.yaml",
    description:
      "Container image and two-service local deployment with SQLite volume.",
  },
];

// ======================================================
// INTERACTIVE CODE EXAMPLES
// ======================================================

const CODE_EXAMPLES = [
  {
    id: "hello",
    label: "Hello MCP",
    title: "Your first MCP server",
    filename: "hello_mcp.py",
    description:
      "Register a Python function as an MCP tool using FastMCP.",
    code: `from fastmcp import FastMCP

mcp = FastMCP("Hello MCP")

@mcp.tool()
def greet(name: str) -> str:
    clean = name.strip()

    if not clean:
        raise ValueError("name must not be blank")

    return f"Hello, {clean}!"

if __name__ == "__main__":
    mcp.run()`,
  },
  {
    id: "setup",
    label: "Setup",
    title: "Install and run MCP",
    filename: "terminal",
    description:
      "Create an environment, install the tested package, and start the local example.",
    code: `python3 -m venv .venv
source .venv/bin/activate

python -m pip install fastmcp==3.4.7

python hello_mcp.py
python local_client.py

MCP_TRANSPORT=http python hello_mcp.py
python http_client.py`,
  },
  {
    id: "inspector",
    label: "Inspector",
    title: "Inspect without an LLM",
    filename: "terminal",
    description:
      "Discover capabilities, inspect schemas, and call tools using MCP Inspector.",
    code: `npx @modelcontextprotocol/inspector python hello_mcp.py

npx @modelcontextprotocol/inspector http://127.0.0.1:8000/mcp

fastmcp inspect hello_mcp.py
fastmcp list hello_mcp.py`,
  },
  {
    id: "project",
    label: "Full Project",
    title: "Run the reminder application",
    filename: "terminal",
    description:
      "Start the authentication API, MCP server, direct client, and tests.",
    code: `python -m pip install -r reminder_app/requirements.txt

python -m pytest -q tests/test_reminder.py

uvicorn reminder_app.auth_api:app --host 127.0.0.1 --port 8081

python -m reminder_app.client --transport stdio --username alice

MCP_TRANSPORT=http PORT=8000 python -m reminder_app.server

python -m reminder_app.client --transport http --username alice`,
  },
];

// ======================================================
// FAQ
// ======================================================

const FAQS = [
  {
    question: "Does the ebook explain MCP architecture?",
    answer:
      "Yes. It covers hosts, clients, servers, JSON-RPC 2.0, connection setup, initialization, capability discovery, sessions, timeouts, shutdown, and reconnect behavior.",
  },
  {
    question: "Will I build both STDIO and HTTP servers?",
    answer:
      "Yes. You start with a small FastMCP example using both STDIO and Streamable HTTP. The complete reminder application also supports both transports.",
  },
  {
    question: "Does the book contain complete source code?",
    answer:
      "Yes. The reminder project contains the complete application structure, Python modules, instructions, direct client, optional LangChain agent, tests, and deployment guidance.",
  },
  {
    question: "Do I need a paid LLM API key?",
    answer:
      "Only the optional LangChain agent call requires a model-provider API key. Server, client, Inspector, and application tests can be explored without a paid model call.",
  },
  {
    question: "Does it cover production deployment?",
    answer:
      "The book explains local deployment, Docker, operational safeguards, and a path toward cloud deployment. Its SQLite implementation is intended for local or single-host use rather than an unchanged multi-instance production deployment.",
  },
  {
    question: "Is this useful for GenAI interviews?",
    answer:
      "Yes. The ebook includes protocol internals, transport comparisons, lifecycle, security, debugging, practical projects, and interview questions.",
  },
];

// ======================================================
// REUSABLE UI
// ======================================================

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  actionHref,
}) {
  return (
    <div className="mcp-section-heading">
      <div>
        <span className="mcp-eyebrow">
          <span />
          {eyebrow}
        </span>

        <h2>{title}</h2>

        {description && <p>{description}</p>}
      </div>

      {action && actionHref && (
        <a href={actionHref} className="mcp-text-link">
          {action}
          <ArrowUpRight size={16} />
        </a>
      )}
    </div>
  );
}

function Tag({ children }) {
  return <span className="mcp-tag">{children}</span>;
}

function BookMockup() {
  return (
    <div className="mcp-cover-stage">
      <div className="mcp-cover-ring mcp-cover-ring-one" />
      <div className="mcp-cover-ring mcp-cover-ring-two" />

      <div className="mcp-book-cover">
        <div className="mcp-book-cover-top">
          <span>TARGET TREK</span>
          <span>DEVELOPER SERIES</span>
        </div>

        <div className="mcp-cover-network">
          <svg
            viewBox="0 0 300 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M68 87L150 37L230 87L150 141L68 87Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeOpacity=".7"
            />
            <path
              d="M150 37V141M68 87H230"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeOpacity=".3"
            />

            <path
              d="M68 87L36 37M230 87L266 37M150 37V8M150 141V172"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeOpacity=".5"
            />

            {[
              [68, 87],
              [150, 37],
              [230, 87],
              [150, 141],
              [36, 37],
              [266, 37],
              [150, 8],
              [150, 172],
            ].map(([x, y], index) => (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r={12}
                  fill="#FB923C"
                  fillOpacity=".14"
                />
                <circle
                  cx={x}
                  cy={y}
                  r={5}
                  fill="#FB923C"
                />
              </g>
            ))}

            <rect
              x="108"
              y="64"
              width="84"
              height="47"
              rx="8"
              fill="#1C1917"
              stroke="#FB923C"
              strokeWidth="2"
            />

            <text
              x="150"
              y="91"
              textAnchor="middle"
              fill="#FDBA74"
              fontSize="13"
              fontFamily="monospace"
              fontWeight="bold"
            >
              MCP
            </text>
          </svg>
        </div>

        <div className="mcp-book-cover-content">
          <div className="mcp-book-kicker">
            THE COMPLETE PRACTICAL GUIDE
          </div>

          <h2>
            MASTER
            <br />
            GENAI
            <br />
            INTERVIEW
            <span>MCP</span>
          </h2>

          <p>
            Model Context Protocol
            <br />
            Architecture · Python · FastMCP
          </p>

          <div className="mcp-cover-rule" />

          <small>
            FROM CONCEPTS TO REAL APPLICATIONS
          </small>
        </div>
      </div>

      <div className="mcp-cover-float mcp-cover-float-one">
        <Server size={15} />
        MCP SERVER
      </div>

      <div className="mcp-cover-float mcp-cover-float-two">
        <Code2 size={15} />
        PYTHON CODE
      </div>
    </div>
  );
}

function PriceDisplay({
  price,
  mrp,
  currency,
  loading,
  discount,
}) {
  if (loading) {
    return (
      <div className="mcp-price-skeleton">
        <div />
        <div />
      </div>
    );
  }

  if (price === null) {
    return (
      <strong className="mcp-price-unavailable">
        Price unavailable
      </strong>
    );
  }

  return (
    <div className="mcp-price-display">
      <strong>{formatMoney(price, currency)}</strong>

      {mrp !== null && mrp > price && (
        <del>{formatMoney(mrp, currency)}</del>
      )}

      {discount > 0 && (
        <span className="mcp-discount">
          SAVE {discount}%
        </span>
      )}
    </div>
  );
}

// ======================================================
// MAIN PAGE
// ======================================================

export default function GenaiMCP() {
  const [theme, setTheme] = useState(readTheme);

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [activeGroup, setActiveGroup] = useState(
    "fundamentals"
  );
  const [searchChapters, setSearchChapters] = useState("");
  const [activeCode, setActiveCode] = useState("hello");
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const trackedProductRef = useRef(null);
  const copyTimerRef = useRef(null);

  const isDark = theme === "dark";

  // ----------------------------------------------------
  // NAVBAR THEME SYNC
  // ----------------------------------------------------

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

  // ----------------------------------------------------
  // REFERRAL TRACKING - EXISTING
  // ----------------------------------------------------

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

  // ----------------------------------------------------
  // FETCH PRODUCT - EXISTING API UNCHANGED
  // GET /book/product?redirectUrl=/book/genai/mcp
  // ----------------------------------------------------

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      setLoadingProduct(true);
      setProductError("");
      setProduct(null);

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
          !result?.success ||
          !result?.data
        ) {
          throw new Error(
            result?.error?.message ||
              result?.message ||
              "Unable to load the ebook. Please try again."
          );
        }

        const data = result.data;
        const price = Number(data.price);

        if (
          !data._id ||
          typeof data.title !== "string" ||
          !data.title.trim() ||
          data.price === null ||
          data.price === undefined ||
          String(data.price).trim() === "" ||
          !Number.isFinite(price) ||
          price < 0
        ) {
          throw new Error(
            "Product details returned by the server are incomplete."
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

        console.error("MCP product API error:", error);

        setProductError(
          error?.message ||
            "Unable to load current product details."
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

  // ----------------------------------------------------
  // LIVE PRICE
  // ----------------------------------------------------

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

  const coverImage =
    product?.coverPageUrl ||
    product?.coverpageurl ||
    product?.cover_page_url ||
    "";

  // ----------------------------------------------------
  // META PIXEL - VIEW CONTENT
  // ----------------------------------------------------

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
      title: product.title,
      price: currentPrice,
      currency,
    });

    if (sent !== false) {
      trackedProductRef.current = key;
    }
  }, [
    product?._id,
    product?.title,
    currentPrice,
    currency,
    hasValidPrice,
  ]);

  // ----------------------------------------------------
  // CHECKOUT
  // ----------------------------------------------------

  const handleBuyNow = useCallback(() => {
    if (!canBuy) return;

    setIsCheckoutOpen(true);
  }, [canBuy]);

  const retryProduct = () => {
    setRetryCount((value) => value + 1);
  };

  // ----------------------------------------------------
  // CODE EXAMPLES
  // ----------------------------------------------------

  const selectedExample =
    CODE_EXAMPLES.find((item) => item.id === activeCode) ||
    CODE_EXAMPLES[0];

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(
        selectedExample.code
      );

      setCopied(true);

      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }

      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 1800);
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

  // ----------------------------------------------------
  // SEARCHABLE CHAPTERS
  // ----------------------------------------------------

  const filteredCurriculum = useMemo(() => {
    const query = searchChapters.trim().toLowerCase();

    if (!query) return CURRICULUM;

    return CURRICULUM.map((group) => ({
      ...group,
      chapters: group.chapters.filter((chapter) =>
        [
          chapter.title,
          chapter.details,
          group.title,
          group.subtitle,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      ),
    })).filter((group) => group.chapters.length > 0);
  }, [searchChapters]);

  // ----------------------------------------------------
  // STRUCTURED DATA
  // ----------------------------------------------------

  const structuredData = useMemo(() => {
    const name =
      product?.title?.trim() ||
      "Master GenAI Interview MCP";

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: SITE_NAME,
          url: SITE_URL,
        },
        {
          "@type": "WebPage",
          "@id": `${PAGE_URL}#webpage`,
          url: PAGE_URL,
          name: SEO_TITLE,
          description: SEO_DESCRIPTION,
        },
        {
          "@type": "Book",
          "@id": `${PAGE_URL}#book`,
          name,
          description: SEO_DESCRIPTION,
          bookFormat: "https://schema.org/EBook",
          inLanguage: product?.language || "English",
          url: PAGE_URL,
          publisher: {
            "@id": `${SITE_URL}/#organization`,
          },
          ...(coverImage ? { image: coverImage } : {}),
        },
        {
          "@type": "Product",
          "@id": `${PAGE_URL}#product`,
          name,
          description: SEO_DESCRIPTION,
          url: PAGE_URL,
          brand: {
            "@type": "Brand",
            name: SITE_NAME,
          },
          ...(coverImage ? { image: coverImage } : {}),
          ...(canBuy
            ? {
                offers: {
                  "@type": "Offer",
                  url: PAGE_URL,
                  price: currentPrice,
                  priceCurrency: currency,
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
              name: "Master GenAI Interview MCP",
              item: PAGE_URL,
            },
          ],
        },
        {
          "@type": "FAQPage",
          mainEntity: FAQS.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        },
      ],
    };
  }, [
    product?.title,
    product?.language,
    coverImage,
    canBuy,
    currentPrice,
    currency,
  ]);

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
          content="Model Context Protocol, MCP ebook, FastMCP, LangChain MCP, MCP server, MCP client, STDIO, Streamable HTTP, JSON-RPC, GenAI interviews"
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
          <meta property="og:image" content={coverImage} />
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

      {/* ================================================== */}
      {/* SCOPED STYLES                                      */}
      {/* ================================================== */}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

        .mcpPage {
          --mcp-bg: #FAF9F6;
          --mcp-surface: #FFFFFF;
          --mcp-soft: #F5F1ED;
          --mcp-text: #1C1917;
          --mcp-muted: #70665E;
          --mcp-subtle: #A8A29E;
          --mcp-border: #E8E1D9;
          --mcp-orange: #EA580C;
          --mcp-orange-bright: #F97316;
          --mcp-orange-soft: #FFF0E2;
          --mcp-orange-border: #FED7AA;
          --mcp-shadow: 0 15px 45px rgba(40,28,18,.06);
          --mcp-code-bg: #1C1917;

          background: var(--mcp-bg);
          color: var(--mcp-text);
          min-height: 100vh;
          width: 100%;
          overflow-x: clip;
          font-family: 'DM Sans',sans-serif;
          -webkit-font-smoothing: antialiased;
          transition: background .25s,color .25s;
        }

        .mcpPage[data-theme="dark"] {
          --mcp-bg: #151311;
          --mcp-surface: #211E1B;
          --mcp-soft: #2B2622;
          --mcp-text: #FAF8F5;
          --mcp-muted: #B8AEA6;
          --mcp-subtle: #8F8178;
          --mcp-border: #3B342F;
          --mcp-orange: #FB923C;
          --mcp-orange-bright: #F97316;
          --mcp-orange-soft: #38271B;
          --mcp-orange-border: #663D25;
          --mcp-shadow: 0 15px 45px rgba(0,0,0,.15);
          --mcp-code-bg: #100F0E;
          color-scheme: dark;
        }

        .mcpPage *,
        .mcpPage *::before,
        .mcpPage *::after {
          box-sizing: border-box;
        }

        .mcpPage h1,
        .mcpPage h2,
        .mcpPage h3,
        .mcpPage h4 {
          font-family: 'Manrope',sans-serif;
        }

        .mcpPage a {
          text-decoration: none;
          color: inherit;
        }

        .mcpPage button,
        .mcpPage input {
          font-family: inherit;
        }

        .mcp-shell {
          width: min(1220px,calc(100% - 40px));
          margin-inline: auto;
        }

        .mcp-section {
          padding: 70px 0;
        }

        .mcp-alt-section {
          background: var(--mcp-surface);
          border-block: 1px solid var(--mcp-border);
        }

        .mcp-section-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 30px;
        }

        .mcp-section-heading > div {
          max-width: 750px;
        }

        .mcp-eyebrow {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--mcp-orange);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .mcp-eyebrow > span {
          width: 22px;
          height: 2px;
          background: var(--mcp-orange-bright);
          border-radius: 4px;
        }

        .mcp-section-heading h2 {
          margin: 12px 0 0;
          font-size: clamp(27px,3.1vw,41px);
          font-weight: 850;
          letter-spacing: -.045em;
          line-height: 1.16;
          color: var(--mcp-text);
        }

        .mcp-section-heading p {
          margin: 12px 0 0;
          color: var(--mcp-muted);
          font-size: 14px;
          line-height: 1.8;
        }

        .mcp-text-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          color: var(--mcp-orange) !important;
          font-size: 12px;
          font-weight: 850;
        }

        .mcp-btn {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 9px;
          padding: 10px 18px;
          min-height: 44px;
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

        .mcp-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .mcp-btn:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .mcp-btn-orange {
          background: #F97316;
          color: #FFFFFF !important;
        }

        .mcp-btn-orange:hover:not(:disabled) {
          background: #EA580C;
        }

        .mcp-btn-outline {
          border-color: var(--mcp-border);
          background: var(--mcp-surface);
          color: var(--mcp-text) !important;
        }

        .mcp-btn-outline:hover {
          border-color: var(--mcp-orange);
        }

        .mcp-tag {
          display: inline-flex;
          padding: 6px 9px;
          border: 1px solid var(--mcp-border);
          border-radius: 7px;
          background: var(--mcp-soft);
          color: var(--mcp-muted);
          font-size: 10px;
          font-weight: 750;
        }

        /* ---------------------------------------------- */
        /* HERO                                           */
        /* ---------------------------------------------- */

        .mcp-hero {
          position: relative;
          padding: 95px 0 45px;
          background: var(--mcp-surface);
          overflow: hidden;
          border-bottom: 1px solid var(--mcp-border);
        }

        .mcp-hero::before {
          content: "";
          position: absolute;
          width: 460px;
          height: 460px;
          right: -120px;
          top: -220px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(249,115,22,.11),
            transparent 68%
          );
          pointer-events: none;
        }

        .mcp-hero-grid {
          display: grid;
          grid-template-columns: minmax(0,1.1fr) minmax(280px,.9fr);
          align-items: center;
          gap: 40px;
        }

        .mcp-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          border: 1px solid var(--mcp-orange-border);
          border-radius: 7px;
          background: var(--mcp-orange-soft);
          color: var(--mcp-orange);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .10em;
        }

        .mcp-hero h1 {
          max-width: 650px;
          margin: 17px 0;
          font-size: clamp(38px,5.1vw,63px);
          letter-spacing: -.058em;
          font-weight: 900;
          line-height: 1.06;
        }

        .mcp-hero h1 span {
          color: var(--mcp-orange-bright);
        }

        .mcp-hero-copy {
          max-width: 600px;
          color: var(--mcp-muted);
          font-size: 14px;
          line-height: 1.8;
          margin: 0;
        }

        .mcp-hero-bullets {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 11px;
          margin-top: 21px;
        }

        .mcp-hero-bullets div {
          display: flex;
          gap: 8px;
          align-items: center;
          font-size: 11px;
          font-weight: 750;
          color: var(--mcp-muted);
        }

        .mcp-hero-bullets svg {
          flex-shrink: 0;
          color: var(--mcp-orange);
        }

        .mcp-hero-purchase {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 14px;
          margin-top: 24px;
        }

        .mcp-hero-price {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mcp-hero-price small {
          color: var(--mcp-subtle);
          font-size: 10px;
          font-weight: 800;
        }

        .mcp-price-display {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .mcp-price-display strong {
          font-family: 'Manrope',sans-serif;
          color: var(--mcp-text);
          font-size: 27px;
          font-weight: 900;
          letter-spacing: -.05em;
        }

        .mcp-price-display del {
          color: var(--mcp-subtle);
          font-size: 12px;
        }

        .mcp-discount {
          padding: 5px 7px;
          border-radius: 6px;
          background: var(--mcp-orange-soft);
          color: var(--mcp-orange);
          font-size: 9px;
          font-weight: 900;
        }

        .mcp-price-unavailable {
          color: var(--mcp-muted);
          font-size: 13px;
        }

        .mcp-price-skeleton {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .mcp-price-skeleton div {
          height: 24px;
          width: 100px;
          border-radius: 6px;
          background: var(--mcp-soft);
          animation: mcpPulse 1.5s infinite;
        }

        .mcp-price-skeleton div:last-child {
          width: 55px;
          height: 14px;
        }

        .mcp-hero-secondary {
          margin-top: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .mcp-hero-secondary a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--mcp-orange) !important;
          font-size: 11px;
          font-weight: 850;
        }

        .mcp-hero-secondary span {
          font-size: 10px;
          color: var(--mcp-muted);
        }

        /* ---------------------------------------------- */
        /* BOOK COVER                                     */
        /* ---------------------------------------------- */

        .mcp-cover-stage {
          position: relative;
          min-height: 405px;
          display: grid;
          place-items: center;
          perspective: 900px;
        }

        .mcp-cover-ring {
          position: absolute;
          width: 330px;
          height: 330px;
          border: 1px solid var(--mcp-orange-border);
          border-radius: 50%;
          opacity: .6;
        }

        .mcp-cover-ring-two {
          width: 260px;
          height: 260px;
          opacity: .45;
        }

        .mcp-book-cover {
          position: relative;
          z-index: 2;
          width: 255px;
          aspect-ratio: 2 / 3;
          display: flex;
          flex-direction: column;
          padding: 21px;
          border-radius: 5px 13px 13px 5px;
          border: 1px solid rgba(255,255,255,.14);
          color: #FFF;
          background: linear-gradient(
            145deg,
            #171410,
            #34251A 60%,
            #A84314
          );
          box-shadow:
            22px 27px 45px rgba(0,0,0,.28),
            inset 6px 0 rgba(255,255,255,.075);
          transform: rotateY(-9deg) rotateZ(-2deg);
          transition: transform .35s;
        }

        .mcp-cover-stage:hover .mcp-book-cover {
          transform: rotateY(-2deg) rotateZ(0);
        }

        .mcp-book-cover-top {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          color: #FDBA74;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .09em;
        }

        .mcp-cover-network {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          color: #FB923C;
        }

        .mcp-cover-network svg {
          width: 100%;
        }

        .mcp-book-kicker {
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .1em;
          color: #E3B99A;
        }

        .mcp-book-cover-content h2 {
          color: #FFF;
          font-size: 28px;
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -.05em;
          margin: 10px 0;
        }

        .mcp-book-cover-content h2 span {
          display: block;
          font-size: 46px;
          color: #FB923C;
        }

        .mcp-book-cover-content p {
          color: #E9C0A6;
          font-size: 9px;
          line-height: 1.55;
        }

        .mcp-cover-rule {
          height: 2px;
          width: 45px;
          background: #F97316;
          margin: 13px 0 9px;
        }

        .mcp-book-cover-content small {
          font-size: 7px;
          letter-spacing: .10em;
          color: #E9C0A6;
        }

        .mcp-cover-float {
          position: absolute;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 12px;
          background: var(--mcp-surface);
          border: 1px solid var(--mcp-orange-border);
          border-radius: 10px;
          color: var(--mcp-text);
          box-shadow: var(--mcp-shadow);
          font-size: 10px;
          font-weight: 850;
        }

        .mcp-cover-float svg {
          color: var(--mcp-orange);
        }

        .mcp-cover-float-one {
          right: 2%;
          top: 18%;
        }

        .mcp-cover-float-two {
          left: 2%;
          bottom: 16%;
        }

        /* ---------------------------------------------- */
        /* KEY BENEFITS                                   */
        /* ---------------------------------------------- */

        .mcp-trust-row {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 18px;
          padding: 19px 0;
        }

        .mcp-trust-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--mcp-muted);
          font-size: 11px;
          font-weight: 750;
        }

        .mcp-trust-item svg {
          color: var(--mcp-orange);
          flex-shrink: 0;
        }

        /* ---------------------------------------------- */
        /* CARDS                                          */
        /* ---------------------------------------------- */

        .mcp-card {
          background: var(--mcp-surface);
          border: 1px solid var(--mcp-border);
          border-radius: 18px;
          box-shadow: var(--mcp-shadow);
        }

        .mcp-card h3 {
          color: var(--mcp-text);
        }

        .mcp-card p {
          color: var(--mcp-muted);
        }

        .mcp-icon {
          display: grid;
          place-items: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          color: var(--mcp-orange);
          background: var(--mcp-orange-soft);
        }

        .mcp-grid-two {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 16px;
        }

        .mcp-grid-three {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 15px;
        }

        .mcp-grid-four {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 14px;
        }

        .mcp-feature-card {
          padding: 22px;
          transition: transform .2s,border-color .2s;
        }

        .mcp-feature-card:hover {
          transform: translateY(-4px);
          border-color: var(--mcp-orange);
        }

        .mcp-feature-card h3 {
          margin: 18px 0 8px;
          font-size: 16px;
          font-weight: 850;
          letter-spacing: -.025em;
        }

        .mcp-feature-card p {
          margin: 0;
          font-size: 12px;
          line-height: 1.75;
        }

        /* ---------------------------------------------- */
        /* ARCHITECTURE                                   */
        /* ---------------------------------------------- */

        .mcp-architecture-board {
          padding: 27px;
          border: 1px solid var(--mcp-border);
          border-radius: 19px;
          background: var(--mcp-surface);
          overflow: hidden;
        }

        .mcp-architecture-flow {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
          gap: 10px;
          align-items: center;
          margin-top: 22px;
        }

        .mcp-architecture-node {
          border: 1px solid var(--mcp-border);
          border-radius: 12px;
          padding: 20px 12px;
          text-align: center;
          background: var(--mcp-soft);
          min-width: 0;
        }

        .mcp-architecture-node svg {
          color: var(--mcp-orange);
        }

        .mcp-architecture-node h3 {
          margin: 11px 0 6px;
          font-size: 13px;
          font-weight: 850;
        }

        .mcp-architecture-node p {
          margin: 0;
          font-size: 10px;
          line-height: 1.6;
          color: var(--mcp-muted);
        }

        .mcp-architecture-arrow {
          color: var(--mcp-orange);
        }

        .mcp-architecture-note {
          margin-top: 21px;
          display: flex;
          align-items: start;
          gap: 11px;
          padding: 15px;
          background: var(--mcp-orange-soft);
          border: 1px solid var(--mcp-orange-border);
          border-radius: 12px;
          font-size: 12px;
          line-height: 1.7;
          color: var(--mcp-muted);
        }

        .mcp-architecture-note svg {
          color: var(--mcp-orange);
          flex-shrink: 0;
        }

        /* ---------------------------------------------- */
        /* CAPABILITIES                                   */
        /* ---------------------------------------------- */

        .mcp-capability-card {
          padding: 24px;
        }

        .mcp-capability-card h3 {
          font-size: 19px;
          margin: 18px 0 8px;
        }

        .mcp-capability-card p {
          font-size: 12px;
          line-height: 1.75;
        }

        .mcp-capability-example {
          margin-top: 20px;
          padding: 11px;
          border-radius: 9px;
          background: var(--mcp-soft);
          color: var(--mcp-orange);
          font-family: monospace;
          font-size: 11px;
          overflow-wrap: anywhere;
        }

        /* ---------------------------------------------- */
        /* CURRICULUM                                     */
        /* ---------------------------------------------- */

        .mcp-curriculum-layout {
          display: grid;
          grid-template-columns: 260px minmax(0,1fr);
          gap: 22px;
        }

        .mcp-curriculum-sidebar {
          display: grid;
          align-content: start;
          gap: 8px;
          position: sticky;
          top: 90px;
          height: max-content;
        }

        .mcp-curriculum-tab {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          border: 1px solid var(--mcp-border);
          background: var(--mcp-surface);
          border-radius: 11px;
          padding: 15px;
          cursor: pointer;
          text-align: left;
          color: var(--mcp-muted);
          transition: background .2s,border-color .2s;
        }

        .mcp-curriculum-tab.active {
          background: var(--mcp-orange-soft);
          border-color: var(--mcp-orange-border);
          color: var(--mcp-text);
        }

        .mcp-curriculum-tab > span:first-child {
          color: var(--mcp-orange);
          font-size: 11px;
          font-weight: 900;
        }

        .mcp-curriculum-tab strong {
          display: block;
          font-size: 12px;
          font-weight: 850;
        }

        .mcp-curriculum-tab small {
          display: block;
          margin-top: 5px;
          font-size: 10px;
          color: var(--mcp-muted);
          line-height: 1.4;
        }

        .mcp-curriculum-main {
          min-width: 0;
        }

        .mcp-curriculum-search {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          border: 1px solid var(--mcp-border);
          border-radius: 11px;
          height: 45px;
          margin-bottom: 15px;
          background: var(--mcp-surface);
          color: var(--mcp-muted);
        }

        .mcp-curriculum-search input {
          border: none;
          outline: none;
          background: transparent;
          min-width: 0;
          flex: 1;
          color: var(--mcp-text);
          font-size: 12px;
        }

        .mcp-curriculum-search input::placeholder {
          color: var(--mcp-subtle);
        }

        .mcp-chapter-list {
          border: 1px solid var(--mcp-border);
          background: var(--mcp-surface);
          border-radius: 14px;
          overflow: hidden;
        }

        .mcp-chapter {
          display: flex;
          align-items: start;
          gap: 16px;
          padding: 18px;
          border-bottom: 1px solid var(--mcp-border);
        }

        .mcp-chapter:last-child {
          border-bottom: 0;
        }

        .mcp-chapter-number {
          display: grid;
          place-items: center;
          width: 37px;
          height: 37px;
          flex-shrink: 0;
          border-radius: 10px;
          color: var(--mcp-orange);
          background: var(--mcp-orange-soft);
          font-size: 11px;
          font-weight: 900;
        }

        .mcp-chapter h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 850;
        }

        .mcp-chapter p {
          margin: 7px 0 0;
          color: var(--mcp-muted);
          font-size: 12px;
          line-height: 1.7;
        }

        /* ---------------------------------------------- */
        /* CODE                                           */
        /* ---------------------------------------------- */

        .mcp-code-tabs {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }

        .mcp-code-tab {
          padding: 9px 14px;
          border: 1px solid var(--mcp-border);
          border-radius: 8px;
          background: var(--mcp-surface);
          color: var(--mcp-muted);
          cursor: pointer;
          font-size: 11px;
          font-weight: 850;
        }

        .mcp-code-tab.active {
          background: var(--mcp-orange-bright);
          border-color: var(--mcp-orange-bright);
          color: #fff;
        }

        .mcp-code-layout {
          display: grid;
          grid-template-columns: minmax(0,.7fr) minmax(0,1.3fr);
          gap: 18px;
          align-items: stretch;
        }

        .mcp-code-description {
          display: flex;
          flex-direction: column;
          padding: 25px;
        }

        .mcp-code-description h3 {
          font-size: 20px;
          margin: 15px 0 9px;
          font-weight: 850;
          letter-spacing: -.035em;
        }

        .mcp-code-description p {
          font-size: 12px;
          line-height: 1.8;
        }

        .mcp-code-window {
          overflow: hidden;
          border: 1px solid #40362F;
          background: var(--mcp-code-bg);
          border-radius: 14px;
        }

        .mcp-code-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 15px;
          background: #28231F;
          color: #D5CBC3;
          border-bottom: 1px solid #40362F;
          font-size: 11px;
        }

        .mcp-code-dots {
          display: flex;
          gap: 5px;
        }

        .mcp-code-dots i {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #F97316;
        }

        .mcp-code-dots i:nth-child(2) {
          background: #FDBA74;
        }

        .mcp-code-dots i:nth-child(3) {
          background: #80736A;
        }

        .mcp-copy-button {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          border-radius: 6px;
          border: 1px solid #51443C;
          background: transparent;
          color: #E7DCD4;
          cursor: pointer;
          font-size: 10px;
        }

        .mcp-code-window pre {
          margin: 0;
          padding: 21px;
          overflow: auto;
          max-height: 360px;
          font-size: 12px;
          line-height: 1.9;
          color: #F5E8DA;
          tab-size: 4;
        }

        /* ---------------------------------------------- */
        /* PROJECT                                        */
        /* ---------------------------------------------- */

        .mcp-project-panel {
          display: grid;
          grid-template-columns: minmax(0,.78fr) minmax(0,1.22fr);
          border: 1px solid var(--mcp-border);
          border-radius: 19px;
          overflow: hidden;
          background: var(--mcp-surface);
        }

        .mcp-project-intro {
          padding: 27px;
          background: #1C1917;
          color: #FFF;
        }

        .mcp-project-intro h3 {
          font-size: 25px;
          line-height: 1.2;
          margin: 16px 0 12px;
          color: #FFF;
          font-weight: 850;
          letter-spacing: -.04em;
        }

        .mcp-project-intro p {
          color: #C5B8AE;
          font-size: 12px;
          line-height: 1.8;
        }

        .mcp-project-points {
          display: grid;
          gap: 13px;
          margin-top: 23px;
        }

        .mcp-project-points span {
          display: flex;
          gap: 9px;
          align-items: start;
          font-size: 11px;
          color: #E7D6C9;
        }

        .mcp-project-points svg {
          color: #FB923C;
          flex-shrink: 0;
        }

        .mcp-project-files {
          padding: 23px;
          display: grid;
          gap: 8px;
          align-content: start;
        }

        .mcp-project-file {
          display: flex;
          gap: 11px;
          align-items: start;
          padding: 11px 12px;
          border-radius: 9px;
          border: 1px solid var(--mcp-border);
          background: var(--mcp-soft);
          min-width: 0;
        }

        .mcp-project-file svg {
          margin-top: 2px;
          color: var(--mcp-orange);
          flex-shrink: 0;
        }

        .mcp-project-file strong {
          display: block;
          font-family: monospace;
          font-size: 11px;
          color: var(--mcp-text);
          overflow-wrap: anywhere;
        }

        .mcp-project-file p {
          margin: 4px 0 0;
          font-size: 10px;
          line-height: 1.6;
          color: var(--mcp-muted);
        }

        /* ---------------------------------------------- */
        /* FAQ                                            */
        /* ---------------------------------------------- */

        .mcp-faq-grid {
          display: grid;
          grid-template-columns: minmax(240px,.68fr) minmax(0,1.32fr);
          gap: 40px;
          align-items: start;
        }

        .mcp-faq-list {
          display: grid;
          gap: 10px;
        }

        .mcp-faq-item {
          border: 1px solid var(--mcp-border);
          border-radius: 12px;
          background: var(--mcp-surface);
          overflow: hidden;
        }

        .mcp-faq-item button {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          width: 100%;
          padding: 17px;
          border: none;
          background: transparent;
          text-align: left;
          cursor: pointer;
          color: var(--mcp-text);
          font-weight: 850;
          font-size: 12px;
        }

        .mcp-faq-answer {
          padding: 0 17px 17px;
          font-size: 12px;
          line-height: 1.8;
          color: var(--mcp-muted);
        }

        /* ---------------------------------------------- */
        /* FINAL PURCHASE                                  */
        /* ---------------------------------------------- */

        .mcp-final-cta {
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          padding: 34px;
          border-radius: 20px;
          background: #1C1917;
          color: white;
        }

        .mcp-final-cta::after {
          content: "";
          position: absolute;
          width: 250px;
          height: 250px;
          right: -120px;
          top: -140px;
          border-radius: 50%;
          border: 1px solid rgba(249,115,22,.3);
          box-shadow: 0 0 0 30px rgba(249,115,22,.04);
        }

        .mcp-final-cta h2 {
          position: relative;
          font-size: clamp(24px,3vw,34px);
          line-height: 1.2;
          letter-spacing: -.045em;
          margin: 0;
          max-width: 640px;
          font-weight: 850;
        }

        .mcp-final-cta p {
          position: relative;
          color: #C8B9AE;
          margin: 11px 0 0;
          font-size: 12px;
          line-height: 1.8;
          max-width: 630px;
        }

        .mcp-final-actions {
          flex-shrink: 0;
          position: relative;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .mcp-final-price strong {
          color: #FFF;
          font-size: 25px;
          font-weight: 900;
          font-family: 'Manrope',sans-serif;
        }

        .mcp-final-price del {
          color: #A99A90;
          font-size: 12px;
          margin-left: 7px;
        }

        /* ---------------------------------------------- */
        /* MOBILE BAR                                     */
        /* ---------------------------------------------- */

        .mcp-mobile-buy {
          display: none;
        }

        .mcp-error {
          padding: 11px 13px;
          border: 1px solid #FECACA;
          background: #FFF1F2;
          color: #B91C1C;
          border-radius: 10px;
          font-size: 11px;
          line-height: 1.6;
        }

        .mcp-error button {
          margin-left: 8px;
          background: transparent;
          border: 0;
          cursor: pointer;
          text-decoration: underline;
          font-weight: 850;
          color: inherit;
        }

        @keyframes mcpPulse {
          50% { opacity: .45; }
        }

        /* ---------------------------------------------- */
        /* RESPONSIVE                                     */
        /* ---------------------------------------------- */

        @media (max-width: 1060px) {
          .mcp-grid-four {
            grid-template-columns: repeat(2,1fr);
          }

          .mcp-architecture-flow {
            grid-template-columns: repeat(2,minmax(0,1fr));
          }

          .mcp-architecture-arrow {
            display: none;
          }
        }

        @media (max-width: 800px) {
          .mcp-hero-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .mcp-cover-stage {
            min-height: 355px;
          }

          .mcp-book-cover {
            width: 230px;
          }

          .mcp-grid-three {
            grid-template-columns: repeat(2,1fr);
          }

          .mcp-curriculum-layout {
            grid-template-columns: 1fr;
          }

          .mcp-curriculum-sidebar {
            position: static;
            display: grid;
            grid-template-columns: repeat(2,minmax(0,1fr));
          }

          .mcp-code-layout,
          .mcp-project-panel,
          .mcp-faq-grid {
            grid-template-columns: 1fr;
          }

          .mcp-trust-row {
            grid-template-columns: repeat(2,1fr);
          }
        }

        @media (max-width: 560px) {
          .mcp-shell {
            width: calc(100% - 28px);
          }

          .mcp-section {
            padding: 48px 0;
          }

          .mcp-hero {
            padding: 85px 0 25px;
          }

          .mcp-hero h1 {
            font-size: 39px;
          }

          .mcp-hero-bullets {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .mcp-hero-purchase {
            align-items: flex-start;
            flex-direction: column;
          }

          .mcp-hero-purchase .mcp-btn {
            width: 100%;
          }

          .mcp-cover-stage {
            min-height: 330px;
          }

          .mcp-book-cover {
            width: 205px;
            padding: 17px;
          }

          .mcp-book-cover-content h2 {
            font-size: 23px;
          }

          .mcp-book-cover-content h2 span {
            font-size: 39px;
          }

          .mcp-cover-float {
            display: none;
          }

          .mcp-grid-two,
          .mcp-grid-three,
          .mcp-grid-four {
            grid-template-columns: 1fr;
          }

          .mcp-architecture-board {
            padding: 17px;
          }

          .mcp-architecture-flow {
            grid-template-columns: 1fr;
          }

          .mcp-curriculum-sidebar {
            grid-template-columns: 1fr;
          }

          .mcp-section-heading {
            flex-direction: column;
            align-items: flex-start;
          }

          .mcp-final-cta {
            padding: 25px;
            flex-direction: column;
            align-items: flex-start;
          }

          .mcp-final-actions {
            flex-direction: column;
            align-items: stretch;
            width: 100%;
          }

          .mcp-final-actions .mcp-btn {
            width: 100%;
          }

          .mcp-mobile-buy {
            position: fixed;
            z-index: 45;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
            border-top: 1px solid var(--mcp-border);
            background: var(--mcp-surface);
            box-shadow: 0 -10px 30px rgba(0,0,0,.12);
          }

          .mcp-mobile-price small {
            display: block;
            color: var(--mcp-muted);
            font-size: 9px;
          }

          .mcp-mobile-price strong {
            font-family: 'Manrope',sans-serif;
            font-size: 18px;
          }

          .mcpPage {
            padding-bottom: 70px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mcpPage *,
          .mcpPage *::before,
          .mcpPage *::after {
            animation-duration: .01ms !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <main
        className="mcpPage"
        data-theme={isDark ? "dark" : "light"}
      >
        {/* ============================================== */}
        {/* HERO                                           */}
        {/* ============================================== */}

        <section className="mcp-hero">
          <div className="mcp-shell mcp-hero-grid">
            <div>
              <span className="mcp-hero-badge">
                <Sparkles size={13} />
                TARGET TREK · GENAI HANDBOOK
              </span>

              <h1>
                Master GenAI
                <br />
                Interview <span>MCP.</span>
              </h1>

              <p className="mcp-hero-copy">
                {product?.shortDescription ||
                  product?.subtitle ||
                  "Understand Model Context Protocol from first principles. Build FastMCP servers and clients in Python, connect them to LangChain, and complete an authenticated reminder application."}
              </p>

              <div className="mcp-hero-bullets">
                {[
                  "Host, client & server architecture",
                  "STDIO + Streamable HTTP",
                  "FastMCP + LangChain",
                  "Complete Python project",
                ].map((item) => (
                  <div key={item}>
                    <CheckCircle2 size={15} />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mcp-hero-purchase">
                <div className="mcp-hero-price">
                  <small>CURRENT EBOOK PRICE</small>

                  <PriceDisplay
                    price={hasValidPrice ? currentPrice : null}
                    mrp={mrp}
                    currency={currency}
                    loading={loadingProduct}
                    discount={discount}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!canBuy}
                  className="mcp-btn mcp-btn-orange"
                >
                  Get the ebook
                  <ArrowUpRight size={16} />
                </button>
              </div>

              <div className="mcp-hero-secondary">
                <a href="#curriculum">
                  Explore all 16 chapters
                  <ArrowDown size={14} />
                </a>

                <span>Digital ebook · Python examples</span>
              </div>

              {productError && (
                <div className="mcp-error" style={{
                  marginTop: 15,
                }}>
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

            <BookMockup />
          </div>
        </section>

        {/* ============================================== */}
        {/* TRUST STRIP                                    */}
        {/* ============================================== */}

        <div className="mcp-shell mcp-trust-row">
          {[
            [BookOpen, "16 detailed chapters"],
            [Terminal, "Runnable Python examples"],
            [Network, "MCP architecture"],
            [ShieldCheck, "Security & deployment"],
          ].map(([Icon, text]) => (
            <div className="mcp-trust-item" key={text}>
              <Icon size={18} />
              {text}
            </div>
          ))}
        </div>

        {/* ============================================== */}
        {/* WHAT IS MCP                                    */}
        {/* ============================================== */}

        <section className="mcp-section mcp-alt-section" id="what-is-mcp">
          <div className="mcp-shell">
            <SectionHeading
              eyebrow="UNDERSTAND THE FOUNDATION"
              title="What exactly is Model Context Protocol?"
              description="MCP standardizes how compatible AI applications communicate with external capabilities. Instead of building a completely different integration for each tool, clients can discover and invoke capabilities exposed by MCP servers."
            />

            <div className="mcp-grid-two">
              <div className="mcp-card mcp-feature-card">
                <div className="mcp-icon">
                  <GitBranch size={23} />
                </div>

                <h3>The integration problem</h3>

                <p>
                  Imagine an AI application connecting to a
                  document store, issue tracker, database,
                  and calendar. Without a shared capability
                  protocol, every integration may require
                  custom schemas, connection handling, and
                  error management.
                </p>

                <div style={{
                  marginTop: 22,
                  padding: 15,
                  background: "var(--mcp-soft)",
                  borderRadius: 10,
                  fontSize: 12,
                  lineHeight: 1.7,
                  color: "var(--mcp-muted)",
                }}>
                  <strong style={{
                    color: "var(--mcp-text)",
                  }}>
                    Without MCP:
                  </strong>
                  {" "}Application-specific integrations
                  and duplicated connection logic.
                </div>
              </div>

              <div className="mcp-card mcp-feature-card">
                <div className="mcp-icon">
                  <Workflow size={23} />
                </div>

                <h3>The MCP approach</h3>

                <p>
                  An MCP host manages connections through
                  clients. Servers expose discoverable
                  tools, resources, and prompts. The
                  protocol defines the message structure
                  and lifecycle for those interactions.
                </p>

                <div style={{
                  marginTop: 22,
                  padding: 15,
                  background: "var(--mcp-orange-soft)",
                  border: "1px solid var(--mcp-orange-border)",
                  borderRadius: 10,
                  fontSize: 12,
                  lineHeight: 1.7,
                  color: "var(--mcp-muted)",
                }}>
                  <strong style={{
                    color: "var(--mcp-orange)",
                  }}>
                    With MCP:
                  </strong>
                  {" "}A shared protocol for capability
                  discovery, tool calls, and results.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================== */}
        {/* ARCHITECTURE                                   */}
        {/* ============================================== */}

        <section className="mcp-section">
          <div className="mcp-shell">
            <SectionHeading
              eyebrow="ARCHITECTURE"
              title="Understand how MCP components work together."
              description="Learn the responsibilities of the host, client, server, and backend application—and follow a request from the user to an authorized result."
            />

            <div className="mcp-architecture-board">
              <div className="mcp-architecture-flow">
                {[
                  {
                    icon: Workflow,
                    title: "AI Host",
                    description:
                      "Owns the user experience and manages connections",
                  },
                  {
                    icon: Network,
                    title: "MCP Client",
                    description:
                      "Handles initialization, discovery, and protocol calls",
                  },
                  {
                    icon: Server,
                    title: "MCP Server",
                    description:
                      "Publishes capabilities and validates requests",
                  },
                  {
                    icon: Database,
                    title: "App / Data",
                    description:
                      "Executes business logic using authorized data",
                  },
                ].map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <React.Fragment key={item.title}>
                      {index > 0 && (
                        <ArrowRight
                          size={18}
                          className="mcp-architecture-arrow"
                        />
                      )}

                      <div className="mcp-architecture-node">
                        <Icon size={26} />

                        <h3>{item.title}</h3>

                        <p>{item.description}</p>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="mcp-architecture-note">
                <ShieldCheck size={19} />

                <span>
                  <strong>Important:</strong> The host decides
                  which connected capabilities are available.
                  The MCP server must still enforce
                  authentication, authorization, validation,
                  and access restrictions before performing
                  sensitive operations.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================== */}
        {/* MCP CAPABILITIES                               */}
        {/* ============================================== */}

        <section className="mcp-section mcp-alt-section">
          <div className="mcp-shell">
            <SectionHeading
              eyebrow="CORE CAPABILITIES"
              title="Tools. Resources. Prompts."
              description="These three capabilities form an important part of how MCP servers expose useful functionality to clients."
            />

            <div className="mcp-grid-three">
              {[
                {
                  icon: Zap,
                  eyebrow: "DO SOMETHING",
                  title: "Tools",
                  description:
                    "Callable operations with named inputs and outputs. Useful when an MCP client needs to perform an action or obtain a computed result.",
                  example: "greet(name) · add(a, b)",
                },
                {
                  icon: BookOpen,
                  eyebrow: "READ SOMETHING",
                  title: "Resources",
                  description:
                    "Named content exposed through URIs. Clients can discover and read these resources as reference material.",
                  example: "hello://guide",
                },
                {
                  icon: Sparkles,
                  eyebrow: "REUSE A TEMPLATE",
                  title: "Prompts",
                  description:
                    "Reusable messages or prompt templates that clients can discover and request with arguments.",
                  example: "welcome_topic(topic)",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    className="mcp-card mcp-capability-card"
                    key={item.title}
                  >
                    <div className="mcp-icon">
                      <Icon size={23} />
                    </div>

                    <div style={{
                      marginTop: 17,
                      color: "var(--mcp-orange)",
                      fontSize: 9,
                      fontWeight: 900,
                      letterSpacing: ".1em",
                    }}>
                      {item.eyebrow}
                    </div>

                    <h3>{item.title}</h3>

                    <p>{item.description}</p>

                    <div className="mcp-capability-example">
                      {item.example}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================== */}
        {/* TRANSPORT COMPARISON                           */}
        {/* ============================================== */}

        <section className="mcp-section">
          <div className="mcp-shell">
            <SectionHeading
              eyebrow="CONNECTIVITY"
              title="STDIO vs Streamable HTTP."
              description="Learn when to use a local child-process connection and when an independently running network service makes more sense."
            />

            <div className="mcp-grid-two">
              {[
                {
                  icon: Terminal,
                  title: "STDIO Transport",
                  badge: "LOCAL PROCESS",
                  description:
                    "The host launches an MCP server process. The client exchanges protocol messages through the process's standard input and output.",
                  points: [
                    "Useful for local integrations",
                    "Process lifecycle managed by the host",
                    "Separate stderr diagnostics",
                    "No dedicated HTTP listener required",
                  ],
                },
                {
                  icon: Globe2,
                  title: "Streamable HTTP",
                  badge: "NETWORK SERVICE",
                  description:
                    "An MCP server exposes an HTTP endpoint that a client connects to over a network. The service can run independently of the host application.",
                  points: [
                    "Useful for remote integrations",
                    "Independent server deployment",
                    "HTTP authentication and network concerns",
                    "Endpoint and session handling",
                  ],
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="mcp-card mcp-feature-card"
                  >
                    <div className="mcp-icon">
                      <Icon size={22} />
                    </div>

                    <span style={{
                      display: "block",
                      marginTop: 17,
                      color: "var(--mcp-orange)",
                      fontSize: 9,
                      fontWeight: 900,
                      letterSpacing: ".1em",
                    }}>
                      {item.badge}
                    </span>

                    <h3>{item.title}</h3>

                    <p>{item.description}</p>

                    <div style={{
                      display: "grid",
                      gap: 10,
                      marginTop: 20,
                    }}>
                      {item.points.map((point) => (
                        <div
                          key={point}
                          style={{
                            display: "flex",
                            gap: 9,
                            alignItems: "flex-start",
                            color: "var(--mcp-muted)",
                            fontSize: 11,
                            lineHeight: 1.6,
                          }}
                        >
                          <Check
                            size={15}
                            style={{
                              color: "var(--mcp-orange)",
                              flexShrink: 0,
                            }}
                          />
                          {point}
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================== */}
        {/* CURRICULUM EXPLORER                            */}
        {/* ============================================== */}

        <section
          id="curriculum"
          className="mcp-section mcp-alt-section"
          style={{ scrollMarginTop: 90 }}
        >
          <div className="mcp-shell">
            <SectionHeading
              eyebrow="COMPLETE BOOK CONTENTS"
              title="16 chapters. Four learning stages."
              description="Follow a structured path from protocol fundamentals to authenticated Python applications, debugging, testing, and deployment."
            />

            <div className="mcp-curriculum-layout">
              <div className="mcp-curriculum-sidebar">
                {CURRICULUM.map((group) => (
                  <button
                    type="button"
                    key={group.id}
                    onClick={() => {
                      setSearchChapters("");
                      setActiveGroup(group.id);
                    }}
                    className={`mcp-curriculum-tab ${
                      activeGroup === group.id
                        ? "active"
                        : ""
                    }`}
                  >
                    <span>{group.label}</span>

                    <div>
                      <strong>{group.title}</strong>
                      <small>
                        {group.chapters.length} chapters
                      </small>
                    </div>

                    <ChevronRight
                      size={15}
                      style={{
                        marginLeft: "auto",
                        flexShrink: 0,
                      }}
                    />
                  </button>
                ))}
              </div>

              <div className="mcp-curriculum-main">
                <div className="mcp-curriculum-search">
                  <Search size={17} />

                  <input
                    type="search"
                    value={searchChapters}
                    onChange={(event) =>
                      setSearchChapters(event.target.value)
                    }
                    placeholder="Search chapters: JSON-RPC, LangChain, FastMCP..."
                    aria-label="Search book chapters"
                  />

                  {searchChapters && (
                    <button
                      type="button"
                      aria-label="Clear chapter search"
                      onClick={() => setSearchChapters("")}
                      style={{
                        display: "grid",
                        placeItems: "center",
                        border: 0,
                        background: "transparent",
                        color: "var(--mcp-muted)",
                        cursor: "pointer",
                      }}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {(searchChapters
                  ? filteredCurriculum
                  : CURRICULUM.filter(
                      (group) => group.id === activeGroup
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
                        margin: 0,
                        fontSize: 17,
                        fontWeight: 850,
                      }}>
                        {group.title}
                      </h3>

                      <p style={{
                        margin: "6px 0 0",
                        fontSize: 12,
                        color: "var(--mcp-muted)",
                      }}>
                        {group.subtitle}
                      </p>
                    </div>

                    <div className="mcp-chapter-list">
                      {group.chapters.map((chapter) => (
                        <article
                          key={chapter.n}
                          className="mcp-chapter"
                        >
                          <span className="mcp-chapter-number">
                            {chapter.n}
                          </span>

                          <div>
                            <h3>{chapter.title}</h3>

                            <p>{chapter.details}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}

                {filteredCurriculum.length === 0 && (
                  <div className="mcp-card" style={{
                    padding: 30,
                    textAlign: "center",
                  }}>
                    <Search
                      size={24}
                      style={{
                        color: "var(--mcp-orange)",
                        margin: "0 auto",
                      }}
                    />

                    <p style={{
                      marginTop: 12,
                      fontSize: 12,
                      color: "var(--mcp-muted)",
                    }}>
                      No chapters match that keyword.
                    </p>

                    <button
                      type="button"
                      onClick={() => setSearchChapters("")}
                      className="mcp-btn mcp-btn-outline"
                      style={{ marginTop: 15 }}
                    >
                      Show all chapters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================== */}
        {/* CODE PLAYGROUND                                */}
        {/* ============================================== */}

        <section className="mcp-section" id="code-examples">
          <div className="mcp-shell">
            <SectionHeading
              eyebrow="LEARN BY BUILDING"
              title="From theory to working Python."
              description="Explore examples from the book. Switch between a FastMCP server, installation, Inspector, and the complete reminder application."
            />

            <div className="mcp-code-tabs">
              {CODE_EXAMPLES.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  onClick={() => {
                    setActiveCode(example.id);
                    setCopied(false);
                  }}
                  className={`mcp-code-tab ${
                    activeCode === example.id
                      ? "active"
                      : ""
                  }`}
                >
                  {example.label}
                </button>
              ))}
            </div>

            <div className="mcp-code-layout">
              <div className="mcp-card mcp-code-description">
                <div className="mcp-icon">
                  <Terminal size={23} />
                </div>

                <h3>{selectedExample.title}</h3>

                <p>{selectedExample.description}</p>

                <div style={{
                  marginTop: "auto",
                  paddingTop: 24,
                  display: "grid",
                  gap: 11,
                }}>
                  {[
                    "Actual Python syntax",
                    "Step-by-step explanation in the ebook",
                    "Practical debugging workflow",
                  ].map((item) => (
                    <span
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 11,
                        color: "var(--mcp-muted)",
                      }}
                    >
                      <CheckCircle2
                        size={15}
                        style={{
                          color: "var(--mcp-orange)",
                        }}
                      />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mcp-code-window">
                <div className="mcp-code-toolbar">
                  <div className="mcp-code-dots">
                    <i />
                    <i />
                    <i />
                  </div>

                  <span>{selectedExample.filename}</span>

                  <button
                    type="button"
                    onClick={copyCode}
                    className="mcp-copy-button"
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
                  <code>{selectedExample.code}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================== */}
        {/* COMPLETE PYTHON PROJECT                        */}
        {/* ============================================== */}

        <section className="mcp-section mcp-alt-section">
          <div className="mcp-shell">
            <SectionHeading
              eyebrow="END-TO-END PROJECT"
              title="Build a complete MCP reminder application."
              description="The book goes beyond toy demos with application structure, authentication, owner-scoped data access, server and client implementations, tests, Docker, and deployment guidance."
            />

            <div className="mcp-project-panel">
              <div className="mcp-project-intro">
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  color: "#FDBA74",
                  fontSize: 10,
                  fontWeight: 850,
                  letterSpacing: ".1em",
                }}>
                  <Code2 size={15} />
                  PRACTICAL PROJECT
                </span>

                <h3>
                  Learn MCP by building something complete.
                </h3>

                <p>
                  Implement an authenticated reminder
                  application with FastAPI, FastMCP,
                  SQLite, Python clients, and optional
                  LangChain agent integration.
                </p>

                <div className="mcp-project-points">
                  {[
                    "User registration and login",
                    "Owner-scoped reminder operations",
                    "FastMCP tools, prompts, and resources",
                    "STDIO and Streamable HTTP clients",
                    "Testing and Docker deployment",
                  ].map((point) => (
                    <span key={point}>
                      <CheckCircle2 size={16} />
                      {point}
                    </span>
                  ))}
                </div>

                <div style={{
                  marginTop: 28,
                  padding: 15,
                  background: "#2E2722",
                  border: "1px solid #4C3B2E",
                  borderRadius: 11,
                  fontSize: 11,
                  lineHeight: 1.7,
                  color: "#E7CDB8",
                }}>
                  <strong style={{
                    color: "#FDBA74",
                  }}>
                    Deployment note:
                  </strong>
                  {" "}SQLite is used for local and
                  single-host operation. The book explains
                  changes needed for multi-instance
                  deployment.
                </div>
              </div>

              <div className="mcp-project-files">
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 8,
                }}>
                  <strong style={{
                    fontSize: 13,
                    fontWeight: 850,
                  }}>
                    Project structure
                  </strong>

                  <span style={{
                    fontSize: 10,
                    color: "var(--mcp-muted)",
                  }}>
                    SOURCE FILES
                  </span>
                </div>

                {PROJECT_FILES.map((file) => (
                  <div
                    key={file.name}
                    className="mcp-project-file"
                  >
                    <FileCode2 size={17} />

                    <div>
                      <strong>{file.name}</strong>
                      <p>{file.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============================================== */}
        {/* WHAT YOU WILL LEARN                            */}
        {/* ============================================== */}

        <section className="mcp-section">
          <div className="mcp-shell">
            <SectionHeading
              eyebrow="ENGINEERING SKILLS"
              title="Understand the protocol. Know the trade-offs."
              description="Develop practical MCP skills that help with implementation, system integration, debugging, and interview discussions."
            />

            <div className="mcp-grid-four">
              {[
                {
                  icon: Layers3,
                  title: "Architecture",
                  description:
                    "Explain host, client, server, and capability responsibilities.",
                },
                {
                  icon: Braces,
                  title: "Protocol internals",
                  description:
                    "Understand JSON-RPC, initialization, messages, and discovery.",
                },
                {
                  icon: RefreshCw,
                  title: "Failure handling",
                  description:
                    "Discuss retries, timeouts, restarts, and reconnection behavior.",
                },
                {
                  icon: LockKeyhole,
                  title: "Security",
                  description:
                    "Apply identity verification, authorization, and data isolation.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="mcp-card mcp-feature-card"
                  >
                    <div className="mcp-icon">
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

        {/* ============================================== */}
        {/* FAQ                                            */}
        {/* ============================================== */}

        <section className="mcp-section mcp-alt-section">
          <div className="mcp-shell mcp-faq-grid">
            <SectionHeading
              eyebrow="FREQUENTLY ASKED QUESTIONS"
              title="Everything you should know."
              description="Answers about the book, prerequisites, projects, security, and how the learning material is organized."
            />

            <div className="mcp-faq-list">
              {FAQS.map((faq, index) => (
                <div
                  key={faq.question}
                  className="mcp-faq-item"
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
                    {faq.question}

                    <ChevronDown
                      size={16}
                      style={{
                        flexShrink: 0,
                        color: "var(--mcp-orange)",
                        transform:
                          openFaq === index
                            ? "rotate(180deg)"
                            : "none",
                        transition: "transform .2s",
                      }}
                    />
                  </button>

                  {openFaq === index && (
                    <div className="mcp-faq-answer">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================== */}
        {/* FINAL PURCHASE                                 */}
        {/* ============================================== */}

        <section className="mcp-section">
          <div className="mcp-shell">
            <div className="mcp-final-cta">
              <div>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  color: "#FDBA74",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: ".1em",
                }}>
                  <Sparkles size={14} />
                  TARGET TREK · MCP EBOOK
                </span>

                <h2 style={{ marginTop: 15 }}>
                  Go from understanding MCP
                  to building with it.
                </h2>

                <p>
                  Learn the architecture, implement real
                  Python examples, explore transport
                  trade-offs, and build a complete
                  authenticated application.
                </p>
              </div>

              <div className="mcp-final-actions">
                <div className="mcp-final-price">
                  <small style={{
                    display: "block",
                    fontSize: 10,
                    marginBottom: 5,
                    color: "#BFAEA1",
                  }}>
                    EBOOK PRICE
                  </small>

                  <strong>
                    {loadingProduct
                      ? "Loading..."
                      : hasValidPrice
                      ? formatMoney(currentPrice, currency)
                      : "Unavailable"}
                  </strong>

                  {mrp !== null && (
                    <del>{formatMoney(mrp, currency)}</del>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!canBuy}
                  className="mcp-btn mcp-btn-orange"
                >
                  Get the ebook
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>

            <p style={{
              margin: "15px 0 0",
              fontSize: 11,
              lineHeight: 1.8,
              color: "var(--mcp-muted)",
            }}>
              This is a digital ebook. Purchases are
              non-refundable. For payment or access
              assistance, contact{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                style={{
                  color: "var(--mcp-orange)",
                  fontWeight: 800,
                }}
              >
                {SUPPORT_EMAIL}
              </a>.
            </p>
          </div>
        </section>

        {/* ============================================== */}
        {/* MOBILE STICKY BUY BAR                          */}
        {/* ============================================== */}

        <div className="mcp-mobile-buy">
          <div className="mcp-mobile-price">
            <small>MCP EBOOK</small>

            <strong>
              {loadingProduct
                ? "Loading..."
                : hasValidPrice
                ? formatMoney(currentPrice, currency)
                : "Unavailable"}
            </strong>

            {discount > 0 && (
              <small style={{
                color: "var(--mcp-orange)",
                fontWeight: 850,
              }}>
                {discount}% OFF
              </small>
            )}
          </div>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!canBuy}
            className="mcp-btn mcp-btn-orange"
          >
            Get Ebook
            <ArrowRight size={15} />
          </button>
        </div>
      </main>

      {/* ================================================ */}
      {/* EXISTING CHECKOUT MODAL                         */}
      {/* ================================================ */}

      <PayUCheckoutModal
        isOpen={isCheckoutOpen && canBuy}
        onClose={() => setIsCheckoutOpen(false)}
        product={product}
      />
    </>
  );
}
