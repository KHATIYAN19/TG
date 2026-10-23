
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
  BarChart3,
  BookOpen,
  Boxes,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Cloud,
  Code2,
  Copy,
  Cpu,
  Database,
  FileCode2,
  FileText,
  Filter,
  Gauge,
  GitBranch,
  Layers3,
  LockKeyhole,
  MessagesSquare,
  Network,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Split,
  Target,
  Terminal,
  Workflow,
  X,
  Zap,
} from "lucide-react";

// ======================================================
// CONFIGURATION
// ======================================================

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";
const PAGE_PATH = "/book/genai/rag";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  "http://localhost:5001";

const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SEO_TITLE =
  "Master RAG Pipeline for GenAI Interviews – Python & LangChain Ebook | Target Trek";

const SEO_DESCRIPTION =
  "Master Retrieval-Augmented Generation for GenAI interviews with Python and LangChain. Learn chunking, embeddings, vector databases, hybrid search, reranking, evaluation, security, production RAG and system design.";

// ======================================================
// UTILITIES
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

const formatMoney = (value, currency = "INR") => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";

  const localeMap = {
    INR: "en-IN",
    USD: "en-US",
    GBP: "en-GB",
    EUR: "en-IE",
    AUD: "en-AU",
    CAD: "en-CA",
  };

  try {
    return new Intl.NumberFormat(
      localeMap[currency] || "en-IN",
      {
        style: "currency",
        currency,
        minimumFractionDigits:
          Number.isInteger(amount) ? 0 : 2,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

// ======================================================
// COMPLETE CURRICULUM - 25 CHAPTERS
// ======================================================

const CURRICULUM = [
  {
    id: "foundations",
    number: "01",
    title: "RAG Foundations",
    subtitle: "Understand the complete RAG mental model",
    chapters: [
      {
        n: "01",
        title: "RAG from first principles",
        details:
          "Why retrieval-augmented generation exists, hallucination, knowledge freshness, private data, RAG vs fine-tuning, long-context models, and the complete request lifecycle.",
      },
      {
        n: "02",
        title: "The two RAG pipelines",
        details:
          "Separate offline ingestion/indexing from online retrieval/generation. Understand which components run once, which run per query, and where latency and failures occur.",
      },
      {
        n: "03",
        title: "Python + LangChain setup",
        details:
          "Project structure, virtual environments, LangChain packages, model providers, environment variables, loaders, text splitters, embeddings, vector stores, and LCEL.",
      },
    ],
  },
  {
    id: "ingestion",
    number: "02",
    title: "Ingestion & Indexing",
    subtitle: "Prepare knowledge for reliable retrieval",
    chapters: [
      {
        n: "04",
        title: "Document loading and parsing",
        details:
          "PDF, TXT, Markdown, HTML, CSV, JSON, DOCX, web pages, APIs, databases, OCR, document IDs, metadata, cleaning, deduplication, versioning, and incremental ingestion.",
      },
      {
        n: "05",
        title: "Chunking deeply explained",
        details:
          "Fixed, recursive, token, sentence, semantic, structure-aware, parent-child, and hierarchical chunking. Tune chunk size and overlap using retrieval quality rather than guesses.",
      },
      {
        n: "06",
        title: "Embeddings",
        details:
          "Dense vectors, dimensions, semantic similarity, cosine similarity, dot product, Euclidean distance, batching, normalization, model selection, multilingual and domain embeddings.",
      },
      {
        n: "07",
        title: "Vector databases",
        details:
          "FAISS, Chroma, Pinecone, Qdrant, Weaviate, Milvus, pgvector and Elasticsearch/OpenSearch: indexes, metadata filtering, persistence, scale, operations and trade-offs.",
      },
      {
        n: "08",
        title: "ANN and vector indexes",
        details:
          "Exact search, approximate nearest neighbors, HNSW, IVF, IVF-PQ, product quantization, recall/latency trade-offs, M, efConstruction and efSearch.",
      },
    ],
  },
  {
    id: "retrieval",
    number: "03",
    title: "Retrieval & Generation",
    subtitle: "Retrieve evidence and generate grounded answers",
    chapters: [
      {
        n: "09",
        title: "Retrievers and Top-K",
        details:
          "Similarity search, score thresholds, metadata filters, retriever interfaces, Top-K selection, recall vs precision and query/document mismatch.",
      },
      {
        n: "10",
        title: "Sparse, dense & hybrid search",
        details:
          "TF-IDF, BM25, inverted indexes, dense retrieval, score normalization, weighted fusion and Reciprocal Rank Fusion with complete Python/LangChain examples.",
      },
      {
        n: "11",
        title: "Query transformation",
        details:
          "Query rewriting, expansion, decomposition, multi-query retrieval, HyDE, step-back prompting, entity expansion and conversation-aware standalone queries.",
      },
      {
        n: "12",
        title: "Reranking",
        details:
          "Bi-encoder retrieval, cross-encoder reranking, LLM reranking, candidate Top-K vs final Top-K, latency trade-offs and production placement.",
      },
      {
        n: "13",
        title: "Context engineering",
        details:
          "Deduplication, ordering, token budgets, neighboring chunks, compression, lost-in-the-middle, source metadata and dynamic context construction.",
      },
      {
        n: "14",
        title: "RAG prompting & grounded answers",
        details:
          "Prompt templates, context boundaries, citations, structured output, insufficient-context behavior, injection resistance and LangChain runnable composition.",
      },
    ],
  },
  {
    id: "advanced",
    number: "04",
    title: "Advanced & Production RAG",
    subtitle: "Evaluation, security, architecture and scale",
    chapters: [
      {
        n: "15",
        title: "Advanced retrieval patterns",
        details:
          "Parent document retrieval, multi-vector retrieval, contextual retrieval, sentence windows, metadata-aware RAG and hierarchical retrieval.",
      },
      {
        n: "16",
        title: "Conversational, multimodal & agentic RAG",
        details:
          "Chat history, query contextualization, tables, images, OCR, multimodal retrieval, RAG as a tool, routing, retrieval grading and self-correction.",
      },
      {
        n: "17",
        title: "RAG evaluation",
        details:
          "Precision@K, Recall@K, Hit Rate, MRR, MAP, NDCG, faithfulness, answer relevance, context relevance, RAGAS, LangSmith, golden datasets and LLM-as-judge.",
      },
      {
        n: "18",
        title: "Debugging RAG failures",
        details:
          "Diagnose bad answers by separating ingestion, retrieval, context and generation failures. Cover stale data, duplicates, poor chunks, low recall and hallucination.",
      },
      {
        n: "19",
        title: "Production architecture",
        details:
          "FastAPI, queues, workers, Redis, object storage, PostgreSQL, vector DBs, retries, streaming, caching, tracing, scaling, multi-tenancy and deployment.",
      },
      {
        n: "20",
        title: "Security, cost & latency",
        details:
          "Prompt injection, malicious documents, permissions, tenant isolation, PII, authorization filters, semantic caching, batching, async retrieval and latency budgets.",
      },
    ],
  },
  {
    id: "projects",
    number: "05",
    title: "Projects & Interviews",
    subtitle: "Build and explain real RAG applications",
    chapters: [
      {
        n: "21",
        title: "Basic RAG — complete build",
        details:
          "Build PDF → loader → splitter → embeddings → vector store → retriever → prompt → LLM → answer with runnable Python and LangChain.",
      },
      {
        n: "22",
        title: "Production RAG — complete build",
        details:
          "Build hybrid retrieval, RRF, reranking, context compression, citations, evaluation, caching and an API layer as a cohesive production-style system.",
      },
      {
        n: "23",
        title: "Enterprise document assistant",
        details:
          "Upload and version documents, store metadata, enforce permissions, retrieve and rerank evidence, answer with citations, collect feedback, test and deploy.",
      },
      {
        n: "24",
        title: "RAG system design interview",
        details:
          "Design for millions of documents: requirements, APIs, ingestion, storage, indexes, scaling, multi-tenancy, updates, deletes, observability, cost and failure recovery.",
      },
      {
        n: "25",
        title: "Interview question bank",
        details:
          "Fundamentals through production system design: chunking, embeddings, vector DBs, ANN, hybrid search, reranking, evaluation, security, debugging and optimization.",
      },
    ],
  },
];

// ======================================================
// VECTOR DATABASES
// ======================================================

const VECTOR_DATABASES = [
  {
    name: "FAISS",
    type: "Library / Index",
    ideal: "Local experiments & custom services",
    description:
      "Fast local ANN search; you manage persistence, metadata, and service concerns.",
  },
  {
    name: "Chroma",
    type: "Vector Store",
    ideal: "Learning & smaller applications",
    description:
      "Simple developer experience and convenient local persistence.",
  },
  {
    name: "Pinecone",
    type: "Managed Vector DB",
    ideal: "Managed production RAG",
    description:
      "Hosted operations, namespaces, filtering, and managed scaling.",
  },
  {
    name: "Qdrant",
    type: "Vector DB",
    ideal: "Cloud or self-hosted RAG",
    description:
      "Strong filtering and production-oriented vector search.",
  },
  {
    name: "Weaviate",
    type: "Vector DB",
    ideal: "Search + RAG systems",
    description:
      "Vector search with rich object and metadata capabilities.",
  },
  {
    name: "Milvus",
    type: "Distributed Vector DB",
    ideal: "Large vector workloads",
    description:
      "Designed for distributed vector search at scale.",
  },
  {
    name: "pgvector",
    type: "PostgreSQL Extension",
    ideal: "Existing PostgreSQL stacks",
    description:
      "Keep relational data and vectors close when scale and workload fit.",
  },
  {
    name: "OpenSearch",
    type: "Search Engine",
    ideal: "Hybrid enterprise search",
    description:
      "Keyword and vector search where search infrastructure already exists.",
  },
];

// ======================================================
// CODE EXAMPLES - EXISTING CONTENT
// ======================================================

const CODE_EXAMPLES = [
  {
    id: "ingestion",
    label: "Ingestion",
    filename: "ingest.py",
    title: "Load, chunk and index a PDF",
    description:
      "The offline pipeline converts source documents into retrievable chunks and stores their embeddings.",
    code: `from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

docs = PyPDFLoader("handbook.pdf").load()

splitter = RecursiveCharacterTextSplitter(
    chunk_size=900,
    chunk_overlap=150,
)

chunks = splitter.split_documents(docs)

vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=OpenAIEmbeddings(),
    persist_directory="./rag_index",
)

print(f"Indexed {len(chunks)} chunks")`,
  },
  {
    id: "retrieval",
    label: "Retrieval",
    filename: "retrieve.py",
    title: "Create a retriever and fetch evidence",
    description:
      "The online pipeline queries the vector store for relevant chunks.",
    code: `retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 6},
)

query = "How does hybrid retrieval work?"

docs = retriever.invoke(query)

for rank, doc in enumerate(docs, start=1):
    print(rank, doc.metadata)
    print(doc.page_content[:240])`,
  },
  {
    id: "rag",
    label: "RAG Chain",
    filename: "rag_chain.py",
    title: "Build a grounded LangChain RAG chain",
    description:
      "Retrieved evidence is formatted into a controlled prompt before generation.",
    code: `from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI

def format_docs(docs):
    return "\\n\\n".join(
        doc.page_content
        for doc in docs
    )

prompt = ChatPromptTemplate.from_template("""
Answer only from the supplied context.
If the answer is missing, say you do not
have enough context.

Context:
{context}

Question:
{question}
""")

chain = (
    {
        "context": retriever | format_docs,
        "question": RunnablePassthrough(),
    }
    | prompt
    | ChatOpenAI(
        model="gpt-4.1-mini",
        temperature=0,
    )
    | StrOutputParser()
)

print(
    chain.invoke(
        "What is reranking?"
    )
)`,
  },
  {
    id: "evaluation",
    label: "Evaluation",
    filename: "retrieval_eval.py",
    title: "Measure retrieval recall",
    description:
      "A compact evaluator that checks whether expected evidence appears in Top-K.",
    code: `def recall_at_k(
    retrieved_ids,
    relevant_ids,
    k,
):
    retrieved = set(
        retrieved_ids[:k]
    )

    relevant = set(
        relevant_ids
    )

    if not relevant:
        return 0.0

    return (
        len(
            retrieved & relevant
        )
        / len(relevant)
    )

score = recall_at_k(
    retrieved_ids=[
        "c12",
        "c07",
        "c91",
        "c31",
    ],
    relevant_ids=[
        "c07",
        "c31",
    ],
    k=4,
)

print(
    f"Recall@4: {score:.2f}"
)`,
  },
];

// ======================================================
// FAQ
// ======================================================

const FAQS = [
  {
    question: "Does this ebook explain both RAG pipelines?",
    answer:
      "Yes. The book separates the offline ingestion/indexing pipeline from the online retrieval/generation pipeline, then explains how both work together in a complete production architecture.",
  },
  {
    question: "Is the implementation based on LangChain?",
    answer:
      "Yes. Python and LangChain are the main implementation stack, with examples covering loaders, splitters, embeddings, vector stores, retrievers, runnable chains, hybrid retrieval, and evaluation.",
  },
  {
    question: "Will it cover advanced GenAI interview topics?",
    answer:
      "Yes. It covers ANN/HNSW, hybrid retrieval, RRF, reranking, query transformation, evaluation, multi-tenancy, security, latency, cost, and production system design.",
  },
  {
    question: "Does the book contain complete projects?",
    answer:
      "Yes. The curriculum progresses from a basic RAG implementation to a production-style pipeline and an enterprise document assistant architecture.",
  },
  {
    question: "Which vector databases are included?",
    answer:
      "The book discusses FAISS, Chroma, Pinecone, Qdrant, Weaviate, Milvus, pgvector, and Elasticsearch/OpenSearch, including practical trade-offs.",
  },
  {
    question: "Is this book suitable for RAG system design interviews?",
    answer:
      "Yes. It includes requirements, architecture, ingestion, indexing, retrieval, scaling, multi-tenancy, reliability, evaluation, security, cost, and failure scenarios.",
  },
];

// ======================================================
// REUSABLE COMPONENTS
// ======================================================

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  actionHref,
}) {
  return (
    <div className="rag-section-heading">
      <div>
        <span className="rag-eyebrow">
          <i />
          {eyebrow}
        </span>

        <h2>{title}</h2>

        {description && <p>{description}</p>}
      </div>

      {action && actionHref && (
        <a href={actionHref} className="rag-text-link">
          {action}
          <ArrowUpRight size={16} />
        </a>
      )}
    </div>
  );
}

function Tag({ children }) {
  return <span className="rag-tag">{children}</span>;
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
      <div className="rag-price-skeleton">
        <span />
        <span />
      </div>
    );
  }

  if (price === null) {
    return (
      <span className="rag-price-unavailable">
        Price unavailable
      </span>
    );
  }

  return (
    <div className="rag-price-display">
      <strong>{formatMoney(price, currency)}</strong>

      {mrp !== null && mrp > price && (
        <del>{formatMoney(mrp, currency)}</del>
      )}

      {discount > 0 && (
        <span className="rag-discount">
          {discount}% OFF
        </span>
      )}
    </div>
  );
}

// ======================================================
// BOOK ART
// ======================================================

function RAGBookCover({ coverUrl }) {
  return (
    <div className="rag-cover-stage">
      <div className="rag-cover-orbit rag-orbit-one" />
      <div className="rag-cover-orbit rag-orbit-two" />

      <div className="rag-book-cover">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt="Master GenAI Interview RAG Pipeline ebook cover"
            className="rag-actual-cover"
            loading="eager"
          />
        ) : (
          <>
            <div className="rag-book-top">
              <span>TARGET TREK</span>
              <span>GENAI SERIES</span>
            </div>

            <div className="rag-book-illustration">
              <svg
                viewBox="0 0 280 190"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M32 95H82M114 95H166M198 95H248"
                  stroke="#FB923C"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />

                <rect
                  x="8"
                  y="68"
                  width="66"
                  height="54"
                  rx="9"
                  fill="#2D241F"
                  stroke="#FB923C"
                  strokeWidth="2"
                />

                <rect
                  x="106"
                  y="68"
                  width="68"
                  height="54"
                  rx="9"
                  fill="#2D241F"
                  stroke="#FB923C"
                  strokeWidth="2"
                />

                <rect
                  x="206"
                  y="68"
                  width="66"
                  height="54"
                  rx="9"
                  fill="#2D241F"
                  stroke="#FB923C"
                  strokeWidth="2"
                />

                <path
                  d="M24 82H58M24 92H58M24 102H46"
                  stroke="#FDBA74"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <circle
                  cx="140"
                  cy="95"
                  r="13"
                  stroke="#FDBA74"
                  strokeWidth="2"
                />

                <circle
                  cx="140"
                  cy="95"
                  r="5"
                  fill="#FB923C"
                />

                <path
                  d="M221 83H257M221 95H251M221 107H244"
                  stroke="#FDBA74"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <path
                  d="M140 68V33M41 68V33M239 68V33"
                  stroke="#FB923C"
                  strokeWidth="1.5"
                  strokeOpacity=".55"
                />

                {[
                  [140, 29],
                  [41, 29],
                  [239, 29],
                ].map(([x, y]) => (
                  <circle
                    key={`${x}-${y}`}
                    cx={x}
                    cy={y}
                    r="6"
                    fill="#FB923C"
                    fillOpacity=".8"
                  />
                ))}

                <path
                  d="M140 122V151"
                  stroke="#FB923C"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                <rect
                  x="105"
                  y="151"
                  width="70"
                  height="25"
                  rx="7"
                  fill="#EA580C"
                />

                <text
                  x="140"
                  y="168"
                  fill="white"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                >
                  ANSWER
                </text>
              </svg>
            </div>

            <div className="rag-book-content">
              <span className="rag-book-kicker">
                THE PRACTICAL GENAI HANDBOOK
              </span>

              <h2>
                MASTER GENAI
                <br />
                INTERVIEW
                <span>RAG PIPELINE</span>
              </h2>

              <p>
                Ingestion · Embeddings · Vector DB
                <br />
                Retrieval · Reranking · Evaluation
              </p>

              <div className="rag-book-rule" />

              <small>
                PYTHON · LANGCHAIN · SYSTEM DESIGN
              </small>
            </div>
          </>
        )}
      </div>

      <div className="rag-cover-float rag-cover-float-one">
        <Search size={15} />
        RETRIEVAL
      </div>

      <div className="rag-cover-float rag-cover-float-two">
        <Database size={15} />
        VECTOR DB
      </div>
    </div>
  );
}

// ======================================================
// PIPELINE CARD
// ======================================================

function PipelineCard({
  number,
  title,
  description,
  steps,
  icon: Icon,
  note,
}) {
  return (
    <article className="rag-pipeline-card">
      <div className="rag-pipeline-header">
        <div className="rag-icon">
          <Icon size={23} />
        </div>

        <div>
          <span className="rag-pipeline-number">
            PIPELINE {number}
          </span>

          <h3>{title}</h3>
        </div>
      </div>

      <p className="rag-pipeline-description">
        {description}
      </p>

      <div className="rag-pipeline-steps">
        {steps.map((step, index) => {
          const StepIcon = step.icon;

          return (
            <React.Fragment key={step.label}>
              {index > 0 && (
                <ArrowRight
                  size={14}
                  className="rag-pipeline-arrow"
                />
              )}

              <div className="rag-pipeline-step">
                <StepIcon size={19} />
                <span>{step.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="rag-pipeline-note">
        <CheckCircle2 size={16} />
        {note}
      </div>
    </article>
  );
}

// ======================================================
// MAIN PAGE
// ======================================================

export default function GenaiRAG() {
  const [theme, setTheme] = useState(readTheme);

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [activeCurriculum, setActiveCurriculum] =
    useState("foundations");

  const [chapterSearch, setChapterSearch] = useState("");
  const [activeCode, setActiveCode] = useState("ingestion");
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [vectorSearch, setVectorSearch] = useState("");

  const trackedProductRef = useRef(null);
  const copyTimerRef = useRef(null);

  const isDark = theme === "dark";

  // ====================================================
  // THEME SYNC - CONTROLLED BY EXISTING NAVBAR
  // ====================================================

  useEffect(() => {
    const syncTheme = (event) => {
      const value = event?.detail?.theme;

      if (value === "dark" || value === "light") {
        setTheme(value);
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

  // ====================================================
  // REFERRAL TRACKING
  // ====================================================

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
      console.error("Referral code error:", error);
    }
  }, []);

  // ====================================================
  // EXISTING API
  // GET /book/product?redirectUrl=/book/genai/rag
  // ====================================================

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
              "Unable to load product details."
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
            "The product data returned by the server is incomplete."
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

        console.error("RAG product API error:", error);

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

  // ====================================================
  // PRICE & PAYMENT STATE
  // ====================================================

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

  // ====================================================
  // META PIXEL - VIEW CONTENT
  // ====================================================

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

  // ====================================================
  // CHECKOUT
  // ====================================================

  const handleBuyNow = useCallback(() => {
    if (!canBuy) return;
    setIsCheckoutOpen(true);
  }, [canBuy]);

  const retryProduct = () => {
    setRetryCount((count) => count + 1);
  };

  // ====================================================
  // CURRICULUM SEARCH
  // ====================================================

  const filteredCurriculum = useMemo(() => {
    const query = chapterSearch.trim().toLowerCase();

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
  }, [chapterSearch]);

  // ====================================================
  // VECTOR DATABASE SEARCH
  // ====================================================

  const filteredVectorDbs = useMemo(() => {
    const query = vectorSearch.trim().toLowerCase();

    if (!query) return VECTOR_DATABASES;

    return VECTOR_DATABASES.filter((db) =>
      [
        db.name,
        db.type,
        db.ideal,
        db.description,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [vectorSearch]);

  // ====================================================
  // CODE EXAMPLES
  // ====================================================

  const selectedCode =
    CODE_EXAMPLES.find((item) => item.id === activeCode) ||
    CODE_EXAMPLES[0];

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
      }, 1800);
    } catch (error) {
      console.error("Unable to copy code:", error);
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

  // ====================================================
  // SEO STRUCTURED DATA
  // ====================================================

  const structuredData = useMemo(() => {
    const productName =
      product?.title?.trim() ||
      "Master GenAI Interview — RAG Pipeline";

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
          name: SEO_TITLE,
          description: SEO_DESCRIPTION,
          url: PAGE_URL,
        },
        {
          "@type": "Book",
          "@id": `${PAGE_URL}#book`,
          name: productName,
          description: SEO_DESCRIPTION,
          bookFormat: "https://schema.org/EBook",
          inLanguage: product?.language || "English",
          url: PAGE_URL,
          publisher: {
            "@id": `${SITE_URL}/#organization`,
          },
          ...(product?.edition
            ? { bookEdition: product.edition }
            : {}),
          ...(coverImage
            ? { image: coverImage }
            : {}),
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
                  availability:
                    "https://schema.org/InStock",
                  url: PAGE_URL,
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
    product?.edition,
    currentPrice,
    currency,
    coverImage,
    canBuy,
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
          content="RAG ebook, Retrieval Augmented Generation, LangChain, Python, vector database, embeddings, chunking, hybrid search, reranking, RAG evaluation, RAG system design"
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

      {/* ================================================== */}
      {/* FULL SCOPED DESIGN SYSTEM                          */}
      {/* ================================================== */}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

        .ragPage {
          --rag-bg: #FAF9F6;
          --rag-surface: #FFFFFF;
          --rag-soft: #F5F1ED;
          --rag-text: #1C1917;
          --rag-muted: #70665E;
          --rag-subtle: #A8A29E;
          --rag-border: #E8E1D9;
          --rag-orange: #EA580C;
          --rag-orange-bright: #F97316;
          --rag-orange-soft: #FFF0E2;
          --rag-orange-border: #FED7AA;
          --rag-shadow: 0 15px 45px rgba(40,28,18,.06);
          --rag-code-bg: #1C1917;

          width: 100%;
          min-height: 100vh;
          overflow-x: clip;
          background: var(--rag-bg);
          color: var(--rag-text);
          font-family: "DM Sans", sans-serif;
          -webkit-font-smoothing: antialiased;
          transition: background .25s, color .25s;
        }

        .ragPage[data-theme="dark"] {
          --rag-bg: #151311;
          --rag-surface: #211E1B;
          --rag-soft: #2B2622;
          --rag-text: #FAF8F5;
          --rag-muted: #B8AEA6;
          --rag-subtle: #92857C;
          --rag-border: #3B342F;
          --rag-orange: #FB923C;
          --rag-orange-bright: #F97316;
          --rag-orange-soft: #38271B;
          --rag-orange-border: #663D25;
          --rag-shadow: 0 15px 45px rgba(0,0,0,.15);
          --rag-code-bg: #100F0E;
          color-scheme: dark;
        }

        .ragPage *,
        .ragPage *::before,
        .ragPage *::after {
          box-sizing: border-box;
        }

        .ragPage h1,
        .ragPage h2,
        .ragPage h3,
        .ragPage h4 {
          font-family: "Manrope", sans-serif;
        }

        .ragPage a {
          color: inherit;
          text-decoration: none;
        }

        .ragPage button,
        .ragPage input {
          font-family: inherit;
        }

        .rag-shell {
          width: min(1220px, calc(100% - 40px));
          margin-inline: auto;
        }

        .rag-section {
          padding: 69px 0;
        }

        .rag-section-alt {
          background: var(--rag-surface);
          border-block: 1px solid var(--rag-border);
        }

        .rag-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 30px;
        }

        .rag-section-heading > div {
          max-width: 760px;
        }

        .rag-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .15em;
          color: var(--rag-orange);
          text-transform: uppercase;
        }

        .rag-eyebrow i {
          display: inline-block;
          width: 23px;
          height: 2px;
          border-radius: 4px;
          background: var(--rag-orange-bright);
        }

        .rag-section-heading h2 {
          margin: 12px 0 0;
          color: var(--rag-text);
          font-size: clamp(27px,3.2vw,41px);
          line-height: 1.16;
          font-weight: 850;
          letter-spacing: -.045em;
        }

        .rag-section-heading p {
          margin: 13px 0 0;
          color: var(--rag-muted);
          font-size: 14px;
          line-height: 1.8;
        }

        .rag-text-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          font-size: 12px;
          font-weight: 850;
          color: var(--rag-orange) !important;
        }

        .rag-btn {
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

        .rag-btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .rag-btn:disabled {
          cursor: not-allowed;
          opacity: .5;
        }

        .rag-btn-orange {
          background: #F97316;
          color: #FFF !important;
        }

        .rag-btn-orange:hover:not(:disabled) {
          background: #EA580C;
        }

        .rag-btn-outline {
          border-color: var(--rag-border);
          background: var(--rag-surface);
          color: var(--rag-text) !important;
        }

        .rag-btn-outline:hover {
          border-color: var(--rag-orange);
        }

        .rag-tag {
          display: inline-flex;
          padding: 6px 9px;
          border: 1px solid var(--rag-border);
          border-radius: 7px;
          background: var(--rag-soft);
          color: var(--rag-muted);
          font-size: 10px;
          font-weight: 750;
        }

        .rag-card {
          background: var(--rag-surface);
          border: 1px solid var(--rag-border);
          border-radius: 17px;
          box-shadow: var(--rag-shadow);
        }

        .rag-card h3 {
          color: var(--rag-text);
        }

        .rag-card p {
          color: var(--rag-muted);
        }

        .rag-icon {
          display: grid;
          place-items: center;
          width: 45px;
          height: 45px;
          border-radius: 12px;
          background: var(--rag-orange-soft);
          color: var(--rag-orange);
        }

        .rag-grid-two {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 16px;
        }

        .rag-grid-three {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 15px;
        }

        .rag-grid-four {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 14px;
        }

        /* HERO */

        .rag-hero {
          position: relative;
          padding: 94px 0 45px;
          overflow: hidden;
          background: var(--rag-surface);
          border-bottom: 1px solid var(--rag-border);
        }

        .rag-hero::before {
          content: "";
          position: absolute;
          width: 470px;
          height: 470px;
          right: -145px;
          top: -235px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(249,115,22,.12),
            transparent 68%
          );
          pointer-events: none;
        }

        .rag-hero-grid {
          display: grid;
          grid-template-columns: minmax(0,1.1fr) minmax(280px,.9fr);
          align-items: center;
          gap: 43px;
        }

        .rag-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 11px;
          border: 1px solid var(--rag-orange-border);
          border-radius: 7px;
          background: var(--rag-orange-soft);
          color: var(--rag-orange);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .10em;
        }

        .rag-hero h1 {
          max-width: 660px;
          margin: 18px 0;
          font-size: clamp(38px,5vw,63px);
          line-height: 1.065;
          font-weight: 900;
          letter-spacing: -.06em;
        }

        .rag-hero h1 span {
          color: var(--rag-orange-bright);
        }

        .rag-hero-copy {
          max-width: 590px;
          color: var(--rag-muted);
          font-size: 14px;
          line-height: 1.82;
        }

        .rag-hero-bullets {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 11px;
          margin-top: 21px;
        }

        .rag-hero-bullets > div {
          display: flex;
          align-items: start;
          gap: 8px;
          font-size: 11px;
          line-height: 1.55;
          font-weight: 750;
          color: var(--rag-muted);
        }

        .rag-hero-bullets svg {
          flex-shrink: 0;
          color: var(--rag-orange);
        }

        .rag-hero-purchase {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 17px;
          margin-top: 25px;
        }

        .rag-hero-price small {
          display: block;
          margin-bottom: 4px;
          color: var(--rag-subtle);
          font-size: 10px;
          font-weight: 850;
          letter-spacing: .05em;
        }

        .rag-price-display {
          display: flex;
          align-items: baseline;
          gap: 9px;
          flex-wrap: wrap;
        }

        .rag-price-display strong {
          font-family: "Manrope",sans-serif;
          color: var(--rag-text);
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -.05em;
        }

        .rag-price-display del {
          color: var(--rag-subtle);
          font-size: 12px;
        }

        .rag-discount {
          align-self: center;
          padding: 5px 7px;
          border-radius: 6px;
          background: var(--rag-orange-soft);
          color: var(--rag-orange);
          font-size: 9px;
          font-weight: 900;
        }

        .rag-price-skeleton {
          display: flex;
          gap: 9px;
        }

        .rag-price-skeleton span {
          width: 95px;
          height: 25px;
          border-radius: 7px;
          background: var(--rag-soft);
          animation: ragPulse 1.4s infinite;
        }

        .rag-price-skeleton span:last-child {
          width: 60px;
          height: 17px;
        }

        .rag-price-unavailable {
          color: var(--rag-muted);
          font-size: 12px;
          font-weight: 800;
        }

        .rag-hero-secondary {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 18px;
          margin-top: 17px;
        }

        .rag-hero-secondary a {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: var(--rag-orange) !important;
          font-size: 11px;
          font-weight: 850;
        }

        .rag-hero-secondary span {
          color: var(--rag-muted);
          font-size: 10px;
        }

        /* COVER */

        .rag-cover-stage {
          position: relative;
          min-height: 410px;
          display: grid;
          place-items: center;
          perspective: 900px;
        }

        .rag-cover-orbit {
          position: absolute;
          border: 1px solid var(--rag-orange-border);
          border-radius: 50%;
          opacity: .5;
        }

        .rag-orbit-one {
          width: 340px;
          height: 340px;
        }

        .rag-orbit-two {
          width: 260px;
          height: 260px;
        }

        .rag-book-cover {
          position: relative;
          z-index: 2;
          width: 260px;
          aspect-ratio: 2 / 3;
          display: flex;
          flex-direction: column;
          padding: 21px;
          overflow: hidden;
          border-radius: 5px 13px 13px 5px;
          color: #FFF;
          background: linear-gradient(
            145deg,
            #181410,
            #35251A 65%,
            #A84314
          );
          box-shadow:
            22px 26px 44px rgba(0,0,0,.28),
            inset 6px 0 rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.16);
          transform: rotateY(-9deg) rotateZ(-2deg);
          transition: transform .35s;
        }

        .rag-cover-stage:hover .rag-book-cover {
          transform: rotateY(-2deg) rotateZ(0);
        }

        .rag-actual-cover {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .rag-book-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          color: #FDBA74;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .1em;
        }

        .rag-book-illustration {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
        }

        .rag-book-illustration svg {
          width: 100%;
        }

        .rag-book-kicker {
          color: #EBC2A6;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .rag-book-content h2 {
          margin: 10px 0;
          color: #FFF;
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -.045em;
          line-height: 1.08;
        }

        .rag-book-content h2 span {
          display: block;
          color: #FB923C;
          font-size: 34px;
          margin-top: 4px;
        }

        .rag-book-content p {
          color: #E8C4AB;
          font-size: 9px;
          line-height: 1.6;
        }

        .rag-book-rule {
          width: 46px;
          height: 2px;
          margin: 13px 0 9px;
          background: #F97316;
        }

        .rag-book-content small {
          color: #E8C4AB;
          font-size: 7px;
          font-weight: 850;
          letter-spacing: .1em;
        }

        .rag-cover-float {
          position: absolute;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 12px;
          border: 1px solid var(--rag-orange-border);
          border-radius: 10px;
          background: var(--rag-surface);
          box-shadow: var(--rag-shadow);
          color: var(--rag-text);
          font-size: 10px;
          font-weight: 850;
        }

        .rag-cover-float svg {
          color: var(--rag-orange);
        }

        .rag-cover-float-one {
          right: 1%;
          top: 17%;
        }

        .rag-cover-float-two {
          left: 1%;
          bottom: 15%;
        }

        /* TRUST */

        .rag-trust-strip {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 15px;
          padding: 20px 0;
        }

        .rag-trust-item {
          display: flex;
          align-items: center;
          gap: 9px;
          color: var(--rag-muted);
          font-size: 11px;
          font-weight: 750;
        }

        .rag-trust-item svg {
          color: var(--rag-orange);
          flex-shrink: 0;
        }

        /* PIPELINES */

        .rag-pipeline-card {
          padding: 24px;
          border: 1px solid var(--rag-border);
          border-radius: 17px;
          background: var(--rag-surface);
          box-shadow: var(--rag-shadow);
          min-width: 0;
        }

        .rag-pipeline-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .rag-pipeline-number {
          color: var(--rag-orange);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .12em;
        }

        .rag-pipeline-header h3 {
          margin: 5px 0 0;
          color: var(--rag-text);
          font-size: 18px;
          font-weight: 850;
          line-height: 1.25;
          letter-spacing: -.025em;
        }

        .rag-pipeline-description {
          margin: 18px 0 0;
          color: var(--rag-muted);
          font-size: 12px;
          line-height: 1.8;
        }

        .rag-pipeline-steps {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 22px;
          min-width: 0;
        }

        .rag-pipeline-step {
          display: flex;
          flex: 1;
          align-items: center;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          min-width: 0;
          min-height: 76px;
          padding: 10px 4px;
          border: 1px solid var(--rag-border);
          border-radius: 9px;
          background: var(--rag-soft);
          text-align: center;
        }

        .rag-pipeline-step svg,
        .rag-pipeline-arrow {
          color: var(--rag-orange);
          flex-shrink: 0;
        }

        .rag-pipeline-step span {
          font-size: 9px;
          font-weight: 850;
          color: var(--rag-text);
          overflow-wrap: anywhere;
        }

        .rag-pipeline-note {
          display: flex;
          gap: 9px;
          align-items: flex-start;
          margin-top: 19px;
          padding: 13px;
          border-radius: 10px;
          background: var(--rag-orange-soft);
          border: 1px solid var(--rag-orange-border);
          color: var(--rag-muted);
          font-size: 11px;
          line-height: 1.65;
        }

        .rag-pipeline-note svg {
          flex-shrink: 0;
          color: var(--rag-orange);
        }

        /* FEATURES */

        .rag-feature-card {
          padding: 22px;
          transition: transform .2s,border-color .2s;
        }

        .rag-feature-card:hover {
          transform: translateY(-4px);
          border-color: var(--rag-orange);
        }

        .rag-feature-card h3 {
          margin: 18px 0 9px;
          font-size: 16px;
          font-weight: 850;
          letter-spacing: -.025em;
        }

        .rag-feature-card p {
          margin: 0;
          font-size: 12px;
          line-height: 1.75;
        }

        /* CURRICULUM */

        .rag-curriculum-layout {
          display: grid;
          grid-template-columns: 260px minmax(0,1fr);
          gap: 22px;
        }

        .rag-curriculum-sidebar {
          position: sticky;
          top: 90px;
          height: max-content;
          display: grid;
          gap: 8px;
        }

        .rag-curriculum-tab {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 14px;
          border: 1px solid var(--rag-border);
          border-radius: 10px;
          background: var(--rag-surface);
          color: var(--rag-muted);
          text-align: left;
          cursor: pointer;
          transition: background .2s,border-color .2s;
        }

        .rag-curriculum-tab.active {
          background: var(--rag-orange-soft);
          border-color: var(--rag-orange-border);
        }

        .rag-curriculum-tab > span:first-child {
          color: var(--rag-orange);
          font-size: 11px;
          font-weight: 900;
        }

        .rag-curriculum-tab strong {
          display: block;
          color: var(--rag-text);
          font-size: 12px;
          font-weight: 850;
        }

        .rag-curriculum-tab small {
          display: block;
          color: var(--rag-muted);
          font-size: 10px;
          line-height: 1.5;
          margin-top: 5px;
        }

        .rag-curriculum-search {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 45px;
          padding: 0 14px;
          margin-bottom: 15px;
          background: var(--rag-surface);
          border: 1px solid var(--rag-border);
          border-radius: 10px;
          color: var(--rag-muted);
        }

        .rag-curriculum-search input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: none;
          flex: 1;
          color: var(--rag-text);
          background: transparent;
          font-size: 12px;
        }

        .rag-curriculum-search input::placeholder {
          color: var(--rag-subtle);
        }

        .rag-chapter-list {
          border: 1px solid var(--rag-border);
          border-radius: 14px;
          background: var(--rag-surface);
          overflow: hidden;
        }

        .rag-chapter {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 18px;
          border-bottom: 1px solid var(--rag-border);
        }

        .rag-chapter:last-child {
          border-bottom: 0;
        }

        .rag-chapter-number {
          display: grid;
          place-items: center;
          width: 37px;
          height: 37px;
          border-radius: 10px;
          background: var(--rag-orange-soft);
          color: var(--rag-orange);
          font-size: 11px;
          font-weight: 900;
          flex-shrink: 0;
        }

        .rag-chapter h3 {
          margin: 0;
          color: var(--rag-text);
          font-size: 14px;
          font-weight: 850;
        }

        .rag-chapter p {
          margin: 7px 0 0;
          color: var(--rag-muted);
          font-size: 12px;
          line-height: 1.7;
        }

        /* VECTOR DATABASE COMPARISON */

        .rag-database-search {
          display: flex;
          align-items: center;
          gap: 9px;
          width: min(100%,390px);
          height: 43px;
          padding: 0 12px;
          border: 1px solid var(--rag-border);
          border-radius: 10px;
          background: var(--rag-surface);
          color: var(--rag-muted);
          margin-bottom: 18px;
        }

        .rag-database-search input {
          flex: 1;
          width: 100%;
          min-width: 0;
          background: transparent;
          border: 0;
          outline: 0;
          color: var(--rag-text);
          font-size: 12px;
        }

        .rag-database-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--rag-border);
          border-radius: 15px;
          background: var(--rag-surface);
        }

        .rag-database-table {
          width: 100%;
          min-width: 720px;
          border-collapse: collapse;
          text-align: left;
        }

        .rag-database-table th {
          padding: 15px 17px;
          color: var(--rag-muted);
          background: var(--rag-soft);
          font-size: 10px;
          letter-spacing: .08em;
          font-weight: 900;
          text-transform: uppercase;
        }

        .rag-database-table td {
          padding: 17px;
          color: var(--rag-muted);
          font-size: 12px;
          line-height: 1.6;
          border-top: 1px solid var(--rag-border);
        }

        .rag-database-table td:first-child {
          color: var(--rag-text);
          font-weight: 850;
        }

        .rag-database-table tr:hover td {
          background: var(--rag-soft);
        }

        .rag-database-type {
          display: inline-block;
          padding: 6px 9px;
          color: var(--rag-orange);
          background: var(--rag-orange-soft);
          border-radius: 7px;
          font-size: 10px;
          font-weight: 750;
        }

        /* CODE EXAMPLES */

        .rag-code-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-bottom: 15px;
        }

        .rag-code-tab {
          padding: 9px 14px;
          border: 1px solid var(--rag-border);
          border-radius: 8px;
          background: var(--rag-surface);
          color: var(--rag-muted);
          font-size: 11px;
          font-weight: 850;
          cursor: pointer;
        }

        .rag-code-tab.active {
          background: var(--rag-orange-bright);
          border-color: var(--rag-orange-bright);
          color: white;
        }

        .rag-code-layout {
          display: grid;
          grid-template-columns: minmax(0,.72fr) minmax(0,1.28fr);
          gap: 18px;
        }

        .rag-code-intro {
          padding: 25px;
          display: flex;
          flex-direction: column;
        }

        .rag-code-intro h3 {
          margin: 18px 0 10px;
          color: var(--rag-text);
          font-size: 20px;
          font-weight: 850;
          letter-spacing: -.035em;
        }

        .rag-code-intro p {
          color: var(--rag-muted);
          font-size: 12px;
          line-height: 1.8;
        }

        .rag-code-window {
          background: var(--rag-code-bg);
          border: 1px solid #41362E;
          border-radius: 14px;
          overflow: hidden;
          min-width: 0;
        }

        .rag-code-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 15px;
          background: #28231F;
          border-bottom: 1px solid #40372F;
          color: #DCCFC5;
          font-size: 11px;
        }

        .rag-code-dots {
          display: flex;
          gap: 5px;
        }

        .rag-code-dots i {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #F97316;
        }

        .rag-code-dots i:nth-child(2) {
          background: #FDBA74;
        }

        .rag-code-dots i:nth-child(3) {
          background: #82756A;
        }

        .rag-copy-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border: 1px solid #51453C;
          border-radius: 6px;
          background: transparent;
          color: #E8DED6;
          font-size: 10px;
          cursor: pointer;
        }

        .rag-code-window pre {
          margin: 0;
          padding: 20px;
          max-height: 390px;
          overflow: auto;
          color: #F3E8DA;
          font-size: 12px;
          line-height: 1.85;
          tab-size: 4;
        }

        /* PROJECTS */

        .rag-project-card {
          padding: 23px;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .rag-project-number {
          color: var(--rag-orange);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .1em;
        }

        .rag-project-card h3 {
          margin: 17px 0 8px;
          font-size: 19px;
          font-weight: 850;
          line-height: 1.3;
        }

        .rag-project-card p {
          font-size: 12px;
          line-height: 1.75;
        }

        .rag-project-list {
          display: grid;
          gap: 10px;
          margin-top: 20px;
        }

        .rag-project-list span {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          color: var(--rag-muted);
          font-size: 11px;
          line-height: 1.6;
        }

        .rag-project-list svg {
          color: var(--rag-orange);
          flex-shrink: 0;
        }

        /* FAQ */

        .rag-faq-grid {
          display: grid;
          grid-template-columns: minmax(240px,.67fr) minmax(0,1.33fr);
          align-items: start;
          gap: 38px;
        }

        .rag-faq-list {
          display: grid;
          gap: 10px;
        }

        .rag-faq-item {
          border: 1px solid var(--rag-border);
          border-radius: 12px;
          background: var(--rag-surface);
          overflow: hidden;
        }

        .rag-faq-item button {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          width: 100%;
          padding: 17px;
          border: 0;
          background: transparent;
          color: var(--rag-text);
          text-align: left;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
        }

        .rag-faq-answer {
          padding: 0 17px 17px;
          color: var(--rag-muted);
          font-size: 12px;
          line-height: 1.8;
        }

        /* FINAL PURCHASE */

        .rag-final-cta {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          padding: 34px;
          border-radius: 20px;
          background: #1C1917;
          color: white;
          overflow: hidden;
        }

        .rag-final-cta::before {
          content: "";
          position: absolute;
          width: 250px;
          height: 250px;
          top: -140px;
          right: -115px;
          border: 1px solid rgba(249,115,22,.3);
          border-radius: 50%;
          box-shadow: 0 0 0 36px rgba(249,115,22,.04);
        }

        .rag-final-cta h2 {
          position: relative;
          margin: 0;
          font-size: clamp(24px,3vw,34px);
          line-height: 1.18;
          letter-spacing: -.045em;
          font-weight: 850;
        }

        .rag-final-cta p {
          position: relative;
          max-width: 650px;
          margin: 12px 0 0;
          font-size: 12px;
          line-height: 1.8;
          color: #C7B8AC;
        }

        .rag-final-actions {
          position: relative;
          display: flex;
          align-items: center;
          gap: 18px;
          flex-shrink: 0;
        }

        .rag-final-price strong {
          font-family: "Manrope",sans-serif;
          font-size: 26px;
          font-weight: 900;
          color: #FFF;
        }

        .rag-final-price del {
          margin-left: 8px;
          color: #A99C91;
          font-size: 12px;
        }

        /* ERRORS */

        .rag-error {
          margin-top: 15px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #FFF1F2;
          border: 1px solid #FECACA;
          color: #B91C1C;
          font-size: 11px;
          line-height: 1.6;
        }

        .rag-error button {
          background: transparent;
          border: 0;
          margin-left: 7px;
          color: inherit;
          text-decoration: underline;
          cursor: pointer;
          font-weight: 850;
        }

        /* MOBILE BAR */

        .rag-mobile-buy {
          display: none;
        }

        @keyframes ragPulse {
          50% { opacity: .45; }
        }

        /* RESPONSIVE */

        @media(max-width: 1060px) {
          .rag-grid-four {
            grid-template-columns: repeat(2,1fr);
          }

          .rag-pipeline-steps {
            flex-wrap: wrap;
          }
        }

        @media(max-width: 850px) {
          .rag-hero-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .rag-cover-stage {
            min-height: 360px;
          }

          .rag-book-cover {
            width: 230px;
          }

          .rag-curriculum-layout {
            grid-template-columns: 1fr;
          }

          .rag-curriculum-sidebar {
            position: static;
            grid-template-columns: repeat(2,1fr);
          }

          .rag-code-layout {
            grid-template-columns: 1fr;
          }

          .rag-faq-grid {
            grid-template-columns: 1fr;
          }

          .rag-trust-strip {
            grid-template-columns: repeat(2,1fr);
          }
        }

        @media(max-width: 600px) {
          .rag-shell {
            width: calc(100% - 28px);
          }

          .rag-section {
            padding: 46px 0;
          }

          .rag-section-heading {
            flex-direction: column;
            align-items: flex-start;
          }

          .rag-hero {
            padding: 84px 0 24px;
          }

          .rag-hero h1 {
            font-size: 38px;
          }

          .rag-hero-bullets {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .rag-hero-purchase {
            flex-direction: column;
            align-items: flex-start;
          }

          .rag-hero-purchase .rag-btn {
            width: 100%;
          }

          .rag-cover-stage {
            min-height: 330px;
          }

          .rag-book-cover {
            width: 205px;
            padding: 17px;
          }

          .rag-cover-float {
            display: none;
          }

          .rag-grid-two,
          .rag-grid-three,
          .rag-grid-four {
            grid-template-columns: 1fr;
          }

          .rag-pipeline-card {
            padding: 18px;
          }

          .rag-pipeline-step {
            min-width: 65px;
          }

          .rag-curriculum-sidebar {
            grid-template-columns: 1fr;
          }

          .rag-chapter {
            padding: 15px;
          }

          .rag-final-cta {
            padding: 25px;
            flex-direction: column;
            align-items: flex-start;
          }

          .rag-final-actions {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }

          .rag-mobile-buy {
            position: fixed;
            z-index: 45;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
            border-top: 1px solid var(--rag-border);
            background: var(--rag-surface);
            box-shadow: 0 -10px 30px rgba(0,0,0,.12);
          }

          .rag-mobile-price small {
            display: block;
            font-size: 9px;
            color: var(--rag-muted);
          }

          .rag-mobile-price strong {
            font-family: "Manrope",sans-serif;
            font-weight: 900;
            font-size: 18px;
            color: var(--rag-text);
          }

          .ragPage {
            padding-bottom: 73px;
          }
        }

        @media(prefers-reduced-motion: reduce) {
          .ragPage *,
          .ragPage *::before,
          .ragPage *::after {
            transition-duration: .01ms !important;
            animation-duration: .01ms !important;
          }
        }
      `}</style>

      <main
        className="ragPage"
        data-theme={isDark ? "dark" : "light"}
      >
        {/* ============================================== */}
        {/* COMPACT HERO                                   */}
        {/* ============================================== */}

        <section className="rag-hero">
          <div className="rag-shell rag-hero-grid">
            <div>
              <span className="rag-hero-badge">
                <Sparkles size={13} />
                TARGET TREK · GENAI HANDBOOK
              </span>

              <h1>
                Master GenAI
                <br />
                Interview <span>RAG.</span>
              </h1>

              <p className="rag-hero-copy">
                {product?.shortDescription ||
                  product?.subtitle ||
                  "Learn Retrieval-Augmented Generation from fundamentals to production systems. Master ingestion, chunking, embeddings, vector databases, hybrid retrieval, reranking, evaluation, and system design with Python and LangChain."}
              </p>

              <div className="rag-hero-bullets">
                {[
                  "Offline and online RAG pipelines",
                  "Python + LangChain examples",
                  "Vector DBs and hybrid search",
                  "Production architecture and interviews",
                ].map((item) => (
                  <div key={item}>
                    <CheckCircle2 size={15} />
                    {item}
                  </div>
                ))}
              </div>

              <div className="rag-hero-purchase">
                <div className="rag-hero-price">
                  <small>CURRENT EBOOK PRICE</small>

                  <PriceDisplay
                    price={hasValidPrice ? currentPrice : null}
                    mrp={mrp}
                    currency={currency}
                    discount={discount}
                    loading={loadingProduct}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!canBuy}
                  className="rag-btn rag-btn-orange"
                >
                  Get the ebook
                  <ArrowUpRight size={16} />
                </button>
              </div>

              <div className="rag-hero-secondary">
                <a href="#curriculum">
                  Explore 25 chapters
                  <ArrowDown size={14} />
                </a>

                <span>
                  Digital ebook · Python + LangChain
                </span>
              </div>

              {productError && (
                <div className="rag-error" role="alert">
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

            <RAGBookCover coverUrl={coverImage} />
          </div>
        </section>

        {/* ============================================== */}
        {/* TRUST STRIP                                    */}
        {/* ============================================== */}

        <div className="rag-shell rag-trust-strip">
          {[
            [BookOpen, "25 detailed chapters"],
            [Workflow, "Two complete RAG pipelines"],
            [Database, "Eight vector DBs"],
            [BarChart3, "Evaluation and metrics"],
          ].map(([Icon, label]) => (
            <div key={label} className="rag-trust-item">
              <Icon size={18} />
              {label}
            </div>
          ))}
        </div>

        {/* ============================================== */}
        {/* TWO RAG PIPELINES                              */}
        {/* ============================================== */}

        <section className="rag-section rag-section-alt">
          <div className="rag-shell">
            <SectionHeading
              eyebrow="RAG ARCHITECTURE"
              title="RAG is two connected pipelines."
              description="Understand the distinction between preparing knowledge offline and answering user questions online. This separation is essential for debugging, scaling, and system design interviews."
            />

            <div className="rag-grid-two">
              <PipelineCard
                number="01"
                title="Offline ingestion & indexing"
                icon={Cloud}
                description="Process source documents, prepare chunks, generate embeddings, and build a searchable knowledge index."
                steps={[
                  { icon: FileText, label: "Load" },
                  { icon: Split, label: "Chunk" },
                  { icon: Cpu, label: "Embed" },
                  { icon: Database, label: "Index" },
                ]}
                note="Runs when documents are added, updated, or deleted—not on every user question."
              />

              <PipelineCard
                number="02"
                title="Online retrieval & generation"
                icon={Search}
                description="Process the question, retrieve candidate evidence, optionally rerank it, build context, and generate a grounded response."
                steps={[
                  { icon: MessagesSquare, label: "Query" },
                  { icon: Search, label: "Retrieve" },
                  { icon: Filter, label: "Rerank" },
                  { icon: BrainCircuit, label: "Answer" },
                ]}
                note="Runs when a user sends a question. Retrieval quality and latency directly influence the response."
              />
            </div>
          </div>
        </section>

        {/* ============================================== */}
        {/* WHY RAG                                       */}
        {/* ============================================== */}

        <section className="rag-section">
          <div className="rag-shell">
            <SectionHeading
              eyebrow="FOUNDATIONS"
              title="Why Retrieval-Augmented Generation?"
              description="A language model can generate fluent answers without access to your current or private knowledge. RAG supplies relevant evidence during generation."
            />

            <div className="rag-grid-three">
              {[
                {
                  icon: BookOpen,
                  title: "Grounded answers",
                  description:
                    "Retrieve relevant context before generation instead of depending exclusively on knowledge already encoded in the model.",
                },
                {
                  icon: RefreshCw,
                  title: "Fresher information",
                  description:
                    "Update your search index as documents change without retraining a language model for every content update.",
                },
                {
                  icon: LockKeyhole,
                  title: "Private enterprise data",
                  description:
                    "Retrieve authorized information from internal sources while enforcing document access controls and isolation.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    className="rag-card rag-feature-card"
                    key={item.title}
                  >
                    <div className="rag-icon">
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
        {/* KEY RAG CONCEPTS                               */}
        {/* ============================================== */}

        <section className="rag-section rag-section-alt">
          <div className="rag-shell">
            <SectionHeading
              eyebrow="KEY ENGINEERING CONCEPTS"
              title="Master the building blocks of a strong RAG system."
              description="From how documents are represented to how retrieved evidence is ranked, compressed, evaluated, and delivered to an LLM."
            />

            <div className="rag-grid-four">
              {[
                {
                  icon: Split,
                  title: "Chunking",
                  description:
                    "Fixed, semantic, recursive, parent-child, and structure-aware strategies.",
                },
                {
                  icon: Cpu,
                  title: "Embeddings",
                  description:
                    "Dense vectors, similarity metrics, batching, and embedding model selection.",
                },
                {
                  icon: Database,
                  title: "Vector Search",
                  description:
                    "ANN indexes, HNSW, IVF, quantization, and filtering.",
                },
                {
                  icon: Search,
                  title: "Hybrid Retrieval",
                  description:
                    "Combine sparse retrieval, dense vectors, BM25, and RRF.",
                },
                {
                  icon: Filter,
                  title: "Reranking",
                  description:
                    "Improve candidate ordering using cross-encoders and other rerankers.",
                },
                {
                  icon: Layers3,
                  title: "Context Engineering",
                  description:
                    "Manage deduplication, token budgets, document ordering, and context relevance.",
                },
                {
                  icon: BarChart3,
                  title: "Evaluation",
                  description:
                    "Measure retrieval precision, recall, ranking, faithfulness, and answer quality.",
                },
                {
                  icon: ShieldCheck,
                  title: "Production Security",
                  description:
                    "Control authorization, tenant isolation, PII, and prompt injection risks.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    className="rag-card rag-feature-card"
                    key={item.title}
                  >
                    <div className="rag-icon">
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
        {/* CURRICULUM                                    */}
        {/* ============================================== */}

        <section
          className="rag-section"
          id="curriculum"
          style={{ scrollMarginTop: 90 }}
        >
          <div className="rag-shell">
            <SectionHeading
              eyebrow="COMPLETE BOOK CONTENTS"
              title="25 chapters. Five learning stages."
              description="Start with RAG fundamentals and progress toward advanced retrieval, production architecture, complete projects, and system design interviews."
            />

            <div className="rag-curriculum-layout">
              <div className="rag-curriculum-sidebar">
                {CURRICULUM.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    className={`rag-curriculum-tab ${
                      activeCurriculum === group.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setChapterSearch("");
                      setActiveCurriculum(group.id);
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
                <div className="rag-curriculum-search">
                  <Search size={17} />

                  <input
                    type="search"
                    value={chapterSearch}
                    onChange={(event) =>
                      setChapterSearch(event.target.value)
                    }
                    placeholder="Search: embeddings, reranking, HNSW, evaluation..."
                    aria-label="Search RAG chapters"
                  />

                  {chapterSearch && (
                    <button
                      type="button"
                      onClick={() => setChapterSearch("")}
                      aria-label="Clear chapter search"
                      style={{
                        border: 0,
                        background: "transparent",
                        color: "var(--rag-muted)",
                        cursor: "pointer",
                      }}
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {(chapterSearch
                  ? filteredCurriculum
                  : CURRICULUM.filter(
                      (group) =>
                        group.id === activeCurriculum
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
                        margin: 0,
                        fontWeight: 850,
                      }}>
                        {group.title}
                      </h3>

                      <p style={{
                        fontSize: 12,
                        margin: "6px 0 0",
                        color: "var(--rag-muted)",
                      }}>
                        {group.subtitle}
                      </p>
                    </div>

                    <div className="rag-chapter-list">
                      {group.chapters.map((chapter) => (
                        <article
                          key={chapter.n}
                          className="rag-chapter"
                        >
                          <span className="rag-chapter-number">
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
                  <div
                    className="rag-card"
                    style={{
                      padding: 30,
                      textAlign: "center",
                    }}
                  >
                    <Search
                      size={23}
                      style={{
                        color: "var(--rag-orange)",
                        margin: "0 auto",
                      }}
                    />

                    <p style={{
                      fontSize: 12,
                      marginTop: 12,
                    }}>
                      No chapters match your search.
                    </p>

                    <button
                      type="button"
                      className="rag-btn rag-btn-outline"
                      style={{ marginTop: 14 }}
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

        {/* ============================================== */}
        {/* VECTOR DB COMPARISON                           */}
        {/* ============================================== */}

        <section className="rag-section rag-section-alt">
          <div className="rag-shell">
            <SectionHeading
              eyebrow="VECTOR DATABASE GUIDE"
              title="Understand where your embeddings live."
              description="Compare eight vector search technologies discussed in the book, including how their storage models, operations, and typical use cases differ."
            />

            <label className="rag-database-search">
              <Search size={16} />

              <input
                type="search"
                value={vectorSearch}
                onChange={(event) =>
                  setVectorSearch(event.target.value)
                }
                placeholder="Search vector databases..."
                aria-label="Filter vector databases"
              />

              {vectorSearch && (
                <button
                  type="button"
                  onClick={() => setVectorSearch("")}
                  aria-label="Clear vector database filter"
                  style={{
                    border: 0,
                    background: "transparent",
                    color: "var(--rag-muted)",
                    cursor: "pointer",
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </label>

            <div className="rag-database-table-wrap">
              <table className="rag-database-table">
                <thead>
                  <tr>
                    <th>Technology</th>
                    <th>Type</th>
                    <th>Typical use case</th>
                    <th>Key consideration</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredVectorDbs.map((db) => (
                    <tr key={db.name}>
                      <td>{db.name}</td>

                      <td>
                        <span className="rag-database-type">
                          {db.type}
                        </span>
                      </td>

                      <td>{db.ideal}</td>
                      <td>{db.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredVectorDbs.length === 0 && (
                <div style={{
                  padding: 25,
                  color: "var(--rag-muted)",
                  textAlign: "center",
                  fontSize: 12,
                }}>
                  No matching vector databases found.
                </div>
              )}
            </div>

            <p style={{
              marginTop: 12,
              color: "var(--rag-muted)",
              fontSize: 11,
              lineHeight: 1.75,
            }}>
              Select a vector store based on retrieval
              quality, filtering, cost, scale,
              operational requirements, and the rest of
              your application's architecture.
            </p>
          </div>
        </section>

        {/* ============================================== */}
        {/* PYTHON CODE EXAMPLES                          */}
        {/* ============================================== */}

        <section className="rag-section" id="code-examples">
          <div className="rag-shell">
            <SectionHeading
              eyebrow="PYTHON + LANGCHAIN"
              title="Learn RAG through working code."
              description="Explore implementation snippets for ingestion, retrieval, grounded generation, and evaluation. The examples correspond to stages explained throughout the ebook."
            />

            <div className="rag-code-tabs">
              {CODE_EXAMPLES.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  className={`rag-code-tab ${
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

            <div className="rag-code-layout">
              <div className="rag-card rag-code-intro">
                <div className="rag-icon">
                  <Terminal size={23} />
                </div>

                <h3>{selectedCode.title}</h3>
                <p>{selectedCode.description}</p>

                <div style={{
                  marginTop: "auto",
                  paddingTop: 24,
                  display: "grid",
                  gap: 12,
                }}>
                  {[
                    "Python implementation",
                    "LangChain-oriented examples",
                    "Interview-friendly explanations",
                  ].map((item) => (
                    <span
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        color: "var(--rag-muted)",
                        fontSize: 11,
                      }}
                    >
                      <CheckCircle2
                        size={15}
                        style={{
                          color: "var(--rag-orange)",
                        }}
                      />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rag-code-window">
                <div className="rag-code-toolbar">
                  <div className="rag-code-dots">
                    <i />
                    <i />
                    <i />
                  </div>

                  <span>{selectedCode.filename}</span>

                  <button
                    type="button"
                    className="rag-copy-button"
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

        {/* ============================================== */}
        {/* ADVANCED PRODUCTION TOPICS                     */}
        {/* ============================================== */}

        <section className="rag-section rag-section-alt">
          <div className="rag-shell">
            <SectionHeading
              eyebrow="PRODUCTION RAG ENGINEERING"
              title="Build systems that go beyond the demo."
              description="A complete RAG architecture needs evaluation, reliable data updates, access control, performance tuning, and clear operational boundaries."
            />

            <div className="rag-grid-four">
              {[
                {
                  icon: GitBranch,
                  title: "Hybrid Retrieval",
                  description:
                    "Combine sparse and dense search, fuse rankings, and improve evidence coverage.",
                },
                {
                  icon: Gauge,
                  title: "Latency & Cost",
                  description:
                    "Tune retrieval counts, caching, token usage, and generation budgets.",
                },
                {
                  icon: ShieldCheck,
                  title: "Security",
                  description:
                    "Enforce document permissions, tenant isolation, and safe context handling.",
                },
                {
                  icon: BarChart3,
                  title: "Evaluation",
                  description:
                    "Track retrieval relevance, groundedness, rankings, and answer quality.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    className="rag-card rag-feature-card"
                    key={item.title}
                  >
                    <div className="rag-icon">
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
        {/* PROJECTS                                      */}
        {/* ============================================== */}

        <section className="rag-section">
          <div className="rag-shell">
            <SectionHeading
              eyebrow="PRACTICAL PROJECTS"
              title="From your first RAG app to enterprise architecture."
              description="The book includes complete implementation-oriented learning paths and an enterprise document assistant design."
            />

            <div className="rag-grid-three">
              {[
                {
                  number: "PROJECT 01",
                  icon: Code2,
                  title: "Basic RAG Pipeline",
                  description:
                    "Build a functional retrieval-and-generation flow from PDF ingestion to grounded answers.",
                  points: [
                    "Document loading and parsing",
                    "Chunking and embeddings",
                    "Vector store and retrieval",
                    "Prompt, LLM, and response",
                  ],
                },
                {
                  number: "PROJECT 02",
                  icon: Workflow,
                  title: "Production-Style RAG",
                  description:
                    "Connect advanced retrieval with the features required for a more reliable application.",
                  points: [
                    "Hybrid search and RRF",
                    "Reranking and compression",
                    "Answer citations",
                    "Caching and evaluation",
                  ],
                },
                {
                  number: "PROJECT 03",
                  icon: Boxes,
                  title: "Enterprise Document Assistant",
                  description:
                    "Design a larger RAG application with managed documents, permissions, and system-level concerns.",
                  points: [
                    "Document uploads and versioning",
                    "Identity and access filters",
                    "Evidence retrieval and citations",
                    "Observability and scaling",
                  ],
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.number}
                    className="rag-card rag-project-card"
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                      <div className="rag-icon">
                        <Icon size={22} />
                      </div>

                      <span className="rag-project-number">
                        {item.number}
                      </span>
                    </div>

                    <h3>{item.title}</h3>

                    <p>{item.description}</p>

                    <div className="rag-project-list">
                      {item.points.map((point) => (
                        <span key={point}>
                          <Check size={15} />
                          {point}
                        </span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================== */}
        {/* INTERVIEW PREPARATION                          */}
        {/* ============================================== */}

        <section className="rag-section rag-section-alt">
          <div className="rag-shell">
            <div
              className="rag-card"
              style={{
                padding: "clamp(22px,4vw,39px)",
              }}
            >
              <div className="rag-grid-two">
                <div>
                  <span className="rag-eyebrow">
                    <i />
                    RAG SYSTEM DESIGN INTERVIEW
                  </span>

                  <h2 style={{
                    fontSize: "clamp(26px,3vw,38px)",
                    letterSpacing: "-.045em",
                    lineHeight: 1.2,
                    margin: "15px 0",
                  }}>
                    Can you design RAG for millions of
                    documents?
                  </h2>

                  <p style={{
                    fontSize: 13,
                    lineHeight: 1.85,
                  }}>
                    Go beyond explaining what a vector
                    database is. Learn to reason about
                    ingestion workers, indexing, APIs,
                    retrieval quality, multi-tenancy,
                    consistency, cost, observability,
                    and graceful failure.
                  </p>

                  <a
                    href="#curriculum"
                    className="rag-btn rag-btn-orange"
                    style={{ marginTop: 20 }}
                    onClick={() => {
                      setChapterSearch("system design");
                      setActiveCurriculum("projects");
                    }}
                  >
                    Explore interview chapters
                    <ArrowUpRight size={16} />
                  </a>
                </div>

                <div style={{
                  background: "var(--rag-soft)",
                  border: "1px solid var(--rag-border)",
                  borderRadius: 13,
                  padding: 20,
                  display: "grid",
                  gap: 12,
                }}>
                  {[
                    [Server, "Scalable API design"],
                    [Database, "Index & storage architecture"],
                    [RefreshCw, "Data freshness & reindexing"],
                    [ShieldCheck, "Tenant access controls"],
                    [Gauge, "Latency & cost constraints"],
                    [BarChart3, "Evaluation & observability"],
                  ].map(([Icon, label]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 11,
                        fontSize: 12,
                        fontWeight: 750,
                      }}
                    >
                      <Icon
                        size={18}
                        style={{
                          color: "var(--rag-orange)",
                        }}
                      />

                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================== */}
        {/* FAQ                                            */}
        {/* ============================================== */}

        <section className="rag-section">
          <div className="rag-shell rag-faq-grid">
            <SectionHeading
              eyebrow="FREQUENTLY ASKED QUESTIONS"
              title="Questions about the RAG ebook?"
              description="Everything you need to know about the chapters, implementation stack, vector databases, projects, and interviews."
            />

            <div className="rag-faq-list">
              {FAQS.map((faq, index) => (
                <div
                  className="rag-faq-item"
                  key={faq.question}
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
                        color: "var(--rag-orange)",
                        transform:
                          openFaq === index
                            ? "rotate(180deg)"
                            : "none",
                        transition: "transform .2s",
                      }}
                    />
                  </button>

                  {openFaq === index && (
                    <div className="rag-faq-answer">
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

        <section className="rag-section" style={{
          paddingTop: 15,
        }}>
          <div className="rag-shell">
            <div className="rag-final-cta">
              <div>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#FDBA74",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: ".11em",
                }}>
                  <Sparkles size={14} />
                  TARGET TREK · RAG EBOOK
                </span>

                <h2 style={{ marginTop: 15 }}>
                  Go from understanding RAG
                  to designing production systems.
                </h2>

                <p>
                  Learn retrieval architecture,
                  implement Python/LangChain pipelines,
                  compare vector databases, evaluate
                  answers, and prepare for GenAI
                  engineering interviews.
                </p>
              </div>

              <div className="rag-final-actions">
                <div className="rag-final-price">
                  <small style={{
                    display: "block",
                    color: "#C5B3A5",
                    fontSize: 10,
                    marginBottom: 5,
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
                    <del>
                      {formatMoney(mrp, currency)}
                    </del>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!canBuy}
                  className="rag-btn rag-btn-orange"
                >
                  Get the ebook
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>

            <p style={{
              margin: "15px 0 0",
              color: "var(--rag-muted)",
              fontSize: 11,
              lineHeight: 1.8,
            }}>
              This is a digital ebook. For payment or
              access assistance, contact{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                style={{
                  color: "var(--rag-orange)",
                  fontWeight: 850,
                }}
              >
                {SUPPORT_EMAIL}
              </a>.
            </p>
          </div>
        </section>

        {/* ============================================== */}
        {/* MOBILE STICKY PURCHASE BAR                      */}
        {/* ============================================== */}

        <div className="rag-mobile-buy">
          <div className="rag-mobile-price">
            <small>RAG PIPELINE EBOOK</small>

            <strong>
              {loadingProduct
                ? "Loading..."
                : hasValidPrice
                ? formatMoney(currentPrice, currency)
                : "Unavailable"}
            </strong>

            {discount > 0 && (
              <small style={{
                color: "var(--rag-orange)",
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
            className="rag-btn rag-btn-orange"
          >
            Get Ebook
            <ArrowRight size={15} />
          </button>
        </div>
      </main>

      {/* ================================================ */}
      {/* EXISTING PAYU / CASHFREE CHECKOUT FLOW          */}
      {/* ================================================ */}

      <PayUCheckoutModal
        isOpen={isCheckoutOpen && canBuy}
        onClose={() => setIsCheckoutOpen(false)}
        product={product}
      />
    </>
  );
}
