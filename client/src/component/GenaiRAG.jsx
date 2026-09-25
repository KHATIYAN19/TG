import React, { useEffect, useState } from "react";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import {
  ArrowRight, BookOpen, BrainCircuit, Check, CheckCircle2, ChevronDown,
  Code2, Copy, Database, FileText, Filter, Gauge, Layers3, Network,
  RefreshCw, Search, Server, ShieldCheck, Sparkles, Split, Target,
  Workflow, Zap, Boxes, GitBranch, BarChart3, Cloud, Cpu, MessagesSquare,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";

const curriculum = [
  { group: "Part 01 / RAG foundations", chapters: [
    { n: "01", title: "RAG from first principles", details: "Why retrieval-augmented generation exists, hallucination, knowledge freshness, private data, RAG vs fine-tuning, long-context models, and the complete request lifecycle." },
    { n: "02", title: "The two RAG pipelines", details: "Separate offline ingestion/indexing from online retrieval/generation. Understand which components run once, which run per query, and where latency and failures occur." },
    { n: "03", title: "Python + LangChain setup", details: "Project structure, virtual environments, LangChain packages, model providers, environment variables, loaders, text splitters, embeddings, vector stores, and LCEL." },
  ]},
  { group: "Part 02 / Ingestion & indexing", chapters: [
    { n: "04", title: "Document loading and parsing", details: "PDF, TXT, Markdown, HTML, CSV, JSON, DOCX, web pages, APIs, databases, OCR, document IDs, metadata, cleaning, deduplication, versioning, and incremental ingestion." },
    { n: "05", title: "Chunking deeply explained", details: "Fixed, recursive, token, sentence, semantic, structure-aware, parent-child, and hierarchical chunking. Tune chunk size and overlap using retrieval quality rather than guesses." },
    { n: "06", title: "Embeddings", details: "Dense vectors, dimensions, semantic similarity, cosine similarity, dot product, Euclidean distance, batching, normalization, model selection, multilingual and domain embeddings." },
    { n: "07", title: "Vector databases", details: "FAISS, Chroma, Pinecone, Qdrant, Weaviate, Milvus, pgvector and Elasticsearch/OpenSearch: indexes, metadata filtering, persistence, scale, operations and trade-offs." },
    { n: "08", title: "ANN and vector indexes", details: "Exact search, approximate nearest neighbors, HNSW, IVF, IVF-PQ, product quantization, recall/latency trade-offs, M, efConstruction and efSearch." },
  ]},
  { group: "Part 03 / Retrieval & generation", chapters: [
    { n: "09", title: "Retrievers and Top-K", details: "Similarity search, score thresholds, metadata filters, retriever interfaces, Top-K selection, recall vs precision and query/document mismatch." },
    { n: "10", title: "Sparse, dense & hybrid search", details: "TF-IDF, BM25, inverted indexes, dense retrieval, score normalization, weighted fusion and Reciprocal Rank Fusion with complete Python/LangChain examples." },
    { n: "11", title: "Query transformation", details: "Query rewriting, expansion, decomposition, multi-query retrieval, HyDE, step-back prompting, entity expansion and conversation-aware standalone queries." },
    { n: "12", title: "Reranking", details: "Bi-encoder retrieval, cross-encoder reranking, LLM reranking, candidate Top-K vs final Top-K, latency trade-offs and production placement." },
    { n: "13", title: "Context engineering", details: "Deduplication, ordering, token budgets, neighboring chunks, compression, lost-in-the-middle, source metadata and dynamic context construction." },
    { n: "14", title: "RAG prompting & grounded answers", details: "Prompt templates, context boundaries, citations, structured output, insufficient-context behavior, injection resistance and LangChain runnable composition." },
  ]},
  { group: "Part 04 / Advanced & production RAG", chapters: [
    { n: "15", title: "Advanced retrieval patterns", details: "Parent document retrieval, multi-vector retrieval, contextual retrieval, sentence windows, metadata-aware RAG and hierarchical retrieval." },
    { n: "16", title: "Conversational, multimodal & agentic RAG", details: "Chat history, query contextualization, tables, images, OCR, multimodal retrieval, RAG as a tool, routing, retrieval grading and self-correction." },
    { n: "17", title: "RAG evaluation", details: "Precision@K, Recall@K, Hit Rate, MRR, MAP, NDCG, faithfulness, answer relevance, context relevance, RAGAS, LangSmith, golden datasets and LLM-as-judge." },
    { n: "18", title: "Debugging RAG failures", details: "Diagnose bad answers by separating ingestion, retrieval, context and generation failures. Cover stale data, duplicates, poor chunks, low recall and hallucination." },
    { n: "19", title: "Production architecture", details: "FastAPI, queues, workers, Redis, object storage, PostgreSQL, vector DBs, retries, streaming, caching, tracing, scaling, multi-tenancy and deployment." },
    { n: "20", title: "Security, cost & latency", details: "Prompt injection, malicious documents, permissions, tenant isolation, PII, authorization filters, semantic caching, batching, async retrieval and latency budgets." },
  ]},
  { group: "Part 05 / Projects & interviews", chapters: [
    { n: "21", title: "Basic RAG — complete build", details: "Build PDF → loader → splitter → embeddings → vector store → retriever → prompt → LLM → answer with runnable Python and LangChain." },
    { n: "22", title: "Production RAG — complete build", details: "Build hybrid retrieval, RRF, reranking, context compression, citations, evaluation, caching and an API layer as a cohesive production-style system." },
    { n: "23", title: "Enterprise document assistant", details: "Upload and version documents, store metadata, enforce permissions, retrieve and rerank evidence, answer with citations, collect feedback, test and deploy." },
    { n: "24", title: "RAG system design interview", details: "Design for millions of documents: requirements, APIs, ingestion, storage, indexes, scaling, multi-tenancy, updates, deletes, observability, cost and failure recovery." },
    { n: "25", title: "Interview question bank", details: "Fundamentals through production system design: chunking, embeddings, vector DBs, ANN, hybrid search, reranking, evaluation, security, debugging and optimization." },
  ]},
];

const vectorDbs = [
  ["FAISS", "Library / index", "Local experiments & custom services", "Fast local ANN search; you manage persistence, metadata and service concerns."],
  ["Chroma", "Vector store", "Learning & smaller apps", "Simple developer experience and convenient local persistence."],
  ["Pinecone", "Managed vector DB", "Managed production RAG", "Hosted operations, namespaces/filtering and managed scaling."],
  ["Qdrant", "Vector DB", "Cloud or self-hosted RAG", "Strong filtering and production-oriented vector search."],
  ["Weaviate", "Vector DB", "Search + RAG systems", "Vector search with rich object/metadata capabilities."],
  ["Milvus", "Distributed vector DB", "Large vector workloads", "Designed for distributed vector search at scale."],
  ["pgvector", "PostgreSQL extension", "Existing Postgres stacks", "Keep relational data and vectors close when scale and workload fit."],
  ["OpenSearch", "Search engine", "Hybrid enterprise search", "Keyword + vector search where search infrastructure already exists."],
];

const codeSamples = [
  { label: "Ingestion", filename: "ingest.py", title: "Load, chunk and index a PDF", explanation: "The offline pipeline converts source documents into retrievable chunks and stores their embeddings.", code: `from langchain_community.document_loaders import PyPDFLoader\nfrom langchain_text_splitters import RecursiveCharacterTextSplitter\nfrom langchain_openai import OpenAIEmbeddings\nfrom langchain_chroma import Chroma\n\ndocs = PyPDFLoader("handbook.pdf").load()\n\nsplitter = RecursiveCharacterTextSplitter(\n    chunk_size=900,\n    chunk_overlap=150,\n)\nchunks = splitter.split_documents(docs)\n\nvectorstore = Chroma.from_documents(\n    documents=chunks,\n    embedding=OpenAIEmbeddings(),\n    persist_directory="./rag_index",\n)\n\nprint(f"Indexed {len(chunks)} chunks")` },
  { label: "Retrieval", filename: "retrieve.py", title: "Create a retriever and fetch evidence", explanation: "The online pipeline embeds the query and asks the vector store for the most relevant chunks.", code: `retriever = vectorstore.as_retriever(\n    search_type="similarity",\n    search_kwargs={"k": 6},\n)\n\nquery = "How does hybrid retrieval work?"\ndocs = retriever.invoke(query)\n\nfor rank, doc in enumerate(docs, start=1):\n    print(rank, doc.metadata)\n    print(doc.page_content[:240])` },
  { label: "RAG chain", filename: "rag_chain.py", title: "Build a grounded LangChain RAG chain", explanation: "Retrieved evidence is formatted into a controlled prompt before generation.", code: `from langchain_core.prompts import ChatPromptTemplate\nfrom langchain_core.output_parsers import StrOutputParser\nfrom langchain_core.runnables import RunnablePassthrough\nfrom langchain_openai import ChatOpenAI\n\ndef format_docs(docs):\n    return "\\n\\n".join(doc.page_content for doc in docs)\n\nprompt = ChatPromptTemplate.from_template("""\nAnswer only from the supplied context.\nIf the answer is missing, say you do not have enough context.\n\nContext:\n{context}\n\nQuestion: {question}\n""")\n\nchain = (\n    {"context": retriever | format_docs,\n     "question": RunnablePassthrough()}\n    | prompt\n    | ChatOpenAI(model="gpt-4.1-mini", temperature=0)\n    | StrOutputParser()\n)\n\nprint(chain.invoke("What is reranking?"))` },
  { label: "Evaluation", filename: "retrieval_eval.py", title: "Measure retrieval recall", explanation: "Interview-ready RAG work includes measurement. This small evaluator checks whether expected evidence appears in Top-K.", code: `def recall_at_k(retrieved_ids, relevant_ids, k):\n    retrieved = set(retrieved_ids[:k])\n    relevant = set(relevant_ids)\n    if not relevant:\n        return 0.0\n    return len(retrieved & relevant) / len(relevant)\n\nscore = recall_at_k(\n    retrieved_ids=["c12", "c07", "c91", "c31"],\n    relevant_ids=["c07", "c31"],\n    k=4,\n)\n\nprint(f"Recall@4: {score:.2f}")` },
];

const faqs = [
  ["Does this cover both RAG pipelines?", "Yes. The page and ebook separate the offline ingestion/indexing pipeline from the online retrieval/generation pipeline, then connect them into one production architecture."],
  ["Is the implementation based on LangChain?", "Yes. Python and LangChain are the main implementation stack, with code for loaders, splitters, embeddings, vector stores, retrievers, runnable chains, hybrid retrieval and evaluation."],
  ["Will it cover advanced interview topics?", "Yes. ANN/HNSW, hybrid retrieval, RRF, reranking, query transformation, evaluation metrics, multi-tenancy, security, latency, cost and production system design are included."],
  ["Does the book contain complete projects?", "Yes. It moves from a basic runnable RAG pipeline to a production-style pipeline and an enterprise document assistant architecture."],
];

function SectionIntro({ eyebrow, title, text, center = false }) {
  return <div className={`mb-10 max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
    <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-violet-600">{eyebrow}</span>
    <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#172033] sm:text-4xl lg:text-[42px]">{title}</h2>
    {text && <p className="mt-4 text-base leading-7 text-slate-600">{text}</p>}
  </div>;
}

function CodeWindow({ filename, children }) {
  return <div className="overflow-hidden rounded-2xl border border-violet-100 bg-[#FBFAFF] shadow-xl shadow-violet-900/5">
    <div className="flex items-center justify-between border-b border-violet-100 bg-[#F2EEFF] px-5 py-3 text-xs text-slate-600">
      <span className="flex gap-1.5"><i className="h-2 w-2 rounded-full bg-red-400"/><i className="h-2 w-2 rounded-full bg-amber-300"/><i className="h-2 w-2 rounded-full bg-emerald-300"/></span>
      <span className="font-semibold">{filename}</span><span>PYTHON</span>
    </div>
    <pre className="overflow-x-auto p-5 text-[12px] leading-7 text-slate-800 sm:p-7"><code>{children}</code></pre>
  </div>;
}

function FlowNode({ icon: Icon, title, text, tone = "violet" }) {
  const tones = { violet: "border-violet-100 bg-violet-50 text-violet-700", blue: "border-blue-100 bg-blue-50 text-blue-700", emerald: "border-emerald-100 bg-emerald-50 text-emerald-700", amber: "border-amber-100 bg-amber-50 text-amber-700" };
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <span className={`inline-flex rounded-xl border p-2.5 ${tones[tone]}`}><Icon size={21}/></span>
    <h3 className="mt-4 font-extrabold text-[#172033]">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
  </div>;
}

function ArrowConnector() { return <ArrowRight className="mx-auto self-center rotate-90 text-violet-400 lg:rotate-0" size={20}/>; }

export default function GenaiRAG() {
  const [activeCode, setActiveCode] = useState(0);
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
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
      setLoadingProduct(true); setProductError(""); setProduct(null); setIsCheckoutOpen(false);
      try {
        const redirectUrl = window.location.pathname;
        const response = await fetch(`${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(redirectUrl)}`, { method: "GET", signal: controller.signal });
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.success || !result?.data) throw new Error("Something went wrong. Please try again.");
        const data = result.data;
        const price = Number(data.price);
        if (!data._id || typeof data.title !== "string" || !data.title.trim() || data.price === null || data.price === undefined || !String(data.price).trim() || !Number.isFinite(price) || price < 0) throw new Error("Something went wrong. Please try again.");
        if (!controller.signal.aborted) setProduct(data);
      } catch (error) {
        if (error?.name === "AbortError" || controller.signal.aborted) return;
        console.error("Failed to fetch RAG product:", error);
        setProductError("Something went wrong. Please try again.");
      } finally { if (!controller.signal.aborted) setLoadingProduct(false); }
    };
    fetchProduct();
    return () => controller.abort();
  }, [retryCount]);

  const currentPrice = product ? Number(product.price) : null;
  const rawMrp = product?.mrp;
  const mrp = rawMrp !== null && rawMrp !== undefined && rawMrp !== "" ? Number(rawMrp) : null;
  const hasMrp = mrp !== null && Number.isFinite(mrp) && mrp > currentPrice;
  const discount = hasMrp ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0;
  const currency = product?.currency || "INR";
  const productTitle = "MASTER GENAI INTERVIEW — RAG PIPELINE";
  const canBuy = Boolean(product?._id) && !loadingProduct && !productError;

  const formatMoney = (amount) => { try { return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount); } catch { return `₹${amount}`; } };
  const handleBuyNow = () => { if (canBuy) setIsCheckoutOpen(true); };
  const copyCode = async () => { try { await navigator.clipboard.writeText(codeSamples[activeCode].code); setCopied(true); window.setTimeout(() => setCopied(false), 1700); } catch { setCopied(false); } };

  return <div className="min-h-screen overflow-x-hidden bg-[#FBFCFF] text-[#273248] antialiased">
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#F8F6FF] to-[#EEF7FF]">
        <div className="pointer-events-none absolute -right-44 -top-48 h-[560px] w-[560px] rounded-full bg-violet-300/20 blur-3xl"/>
        <div className="pointer-events-none absolute -bottom-48 left-10 h-[430px] w-[430px] rounded-full bg-sky-200/30 blur-3xl"/>
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-20 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-[11px] font-black tracking-widest text-violet-700 shadow-sm"><Sparkles size={14}/> TARGET TREK · GENAI INTERVIEW SERIES</span>
            <h1 className="mt-6 max-w-3xl text-[42px] font-black leading-[1.04] tracking-[-0.055em] text-[#172033] sm:text-6xl lg:text-[66px]">MASTER GENAI INTERVIEW <span className="text-violet-600">RAG</span> PIPELINE</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{product?.shortDescription || product?.subtitle || "Master retrieval-augmented generation from document ingestion to production retrieval: chunking, embeddings, vector databases, hybrid search, reranking, evaluation, security and system design — with Python + LangChain."}</p>
            <div className="mt-7 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              {["Ingestion + retrieval pipelines", "Python + LangChain code", "Vector DB + hybrid search", "Production + interview system design"].map(x => <span key={x} className="flex items-center gap-2"><CheckCircle2 size={17} className="shrink-0 text-emerald-600"/>{x}</span>)}
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <button onClick={handleBuyNow} disabled={!canBuy} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-violet-600/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">{loadingProduct ? "Loading price..." : canBuy ? `Get the ebook for ${formatMoney(currentPrice)}` : "Price unavailable"}<ArrowRight size={18}/></button>
              <a href="#curriculum" className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-white px-5 py-4 text-sm font-bold text-violet-700 hover:bg-violet-50">Explore curriculum <ArrowRight size={16}/></a>
            </div>
            {productError && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Something went wrong. Please try again. <button onClick={() => setRetryCount(c => c + 1)} className="ml-2 font-bold underline">Retry</button></div>}
          </div>

          <div className="relative mx-auto w-full max-w-[430px] py-6">
            <div className="absolute inset-12 rounded-full bg-violet-300/25 blur-[80px]"/>
            <div className="relative mx-auto min-h-[500px] max-w-[345px] -rotate-2 overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-white via-[#F7F4FF] to-[#E8F5FF] p-8 shadow-[0_32px_90px_rgba(80,62,150,.18)] ring-8 ring-violet-100/60">
              <div className="text-[10px] font-black tracking-[.18em] text-violet-700">TARGET TREK / GENAI SERIES</div>
              <div className="relative mt-10 h-155px h-[155px]">
                <div className="absolute left-2 top-12 rounded-xl border border-blue-200 bg-white p-3 shadow-md"><FileText size={25} className="text-blue-600"/></div>
                <div className="absolute left-[104px] top-4 rounded-xl border border-violet-200 bg-white p-3 shadow-md"><Split size={25} className="text-violet-600"/></div>
                <div className="absolute right-2 top-14 rounded-xl border border-emerald-200 bg-white p-3 shadow-md"><Database size={25} className="text-emerald-600"/></div>
                <div className="absolute bottom-0 left-[130px] rounded-xl border border-amber-200 bg-white p-3 shadow-md"><BrainCircuit size={25} className="text-amber-600"/></div>
                <div className="absolute left-14 top-[68px] h-px w-14 rotate-[-28deg] bg-violet-300"/><div className="absolute right-14 top-[70px] h-px w-14 rotate-[28deg] bg-violet-300"/><div className="absolute left-[164px] top-[60px] h-20 w-px bg-violet-300"/>
              </div>
              <div className="mt-7 text-[30px] font-black leading-[1.08] tracking-tight text-[#172033]">MASTER GENAI<br/>INTERVIEW<br/><span className="text-violet-600">RAG PIPELINE</span></div>
              <p className="mt-4 text-xs leading-5 text-slate-600">Retrieval · embeddings · vector databases<br/>reranking · evaluation · production</p>
              <div className="mt-7 flex flex-wrap gap-2">{["Python", "LangChain", "RAG", "Vector DB"].map(x => <span key={x} className="rounded-full border border-violet-100 bg-white px-3 py-1 text-[9px] font-bold text-violet-700">{x}</span>)}</div>
            </div>
            <div className="absolute -right-5 top-20 hidden rounded-xl border border-violet-100 bg-white px-4 py-3 text-xs font-bold text-violet-700 shadow-lg sm:block"><Search size={15} className="mr-2 inline"/> RETRIEVE</div>
            <div className="absolute -bottom-1 -left-5 hidden rounded-xl border border-blue-100 bg-white px-4 py-3 text-xs font-bold text-blue-700 shadow-lg sm:block"><Code2 size={15} className="mr-2 inline"/> LANGCHAIN</div>
          </div>
        </div>
      </section>

      <div className="border-y border-slate-100 bg-white"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-5 py-6 text-xs font-bold text-slate-700 sm:px-8 md:grid-cols-4 md:text-sm">{[[Workflow,"2 complete pipelines"],[Database,"8 vector DBs discussed"],[Code2,"Runnable Python code"],[BarChart3,"Evaluation & metrics"]].map(([Icon,t]) => <span key={t} className="flex items-center gap-2"><Icon size={18} className="text-violet-600"/>{t}</span>)}</div></div>

      <section className="bg-white px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">
        <SectionIntro eyebrow="START WITH THE MENTAL MODEL" title="RAG is two connected pipelines — not one magic call" text="The ebook makes the separation explicit. Documents are prepared in the offline ingestion pipeline; user questions travel through the online retrieval pipeline. Understanding that boundary makes debugging, scaling and interview explanations much easier."/>
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-violet-100 bg-[#FBFAFF] p-6 sm:p-8"><div className="flex items-center gap-3"><span className="rounded-xl bg-violet-100 p-3 text-violet-700"><Cloud size={24}/></span><div><span className="text-[10px] font-black tracking-widest text-violet-600">PIPELINE 01</span><h3 className="text-xl font-black text-[#172033]">Offline ingestion & indexing</h3></div></div><div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-5 sm:items-center">{[[FileText,"Load"],[Split,"Chunk"],[Cpu,"Embed"],[Database,"Index"],[CheckCircle2,"Ready"]].map(([Icon,t],i) => <React.Fragment key={t}><div className="rounded-xl border border-violet-100 bg-white p-3 text-center"><Icon className="mx-auto text-violet-600" size={20}/><div className="mt-2 text-xs font-extrabold">{t}</div></div>{i<4 && <ArrowRight className="mx-auto hidden text-violet-300 sm:block" size={15}/>}</React.Fragment>)}</div><p className="mt-6 text-sm leading-7 text-slate-600">Parse source data, create retrieval-friendly chunks, attach metadata, generate embeddings and write vectors to an index. Re-run intelligently when documents are added, changed or deleted.</p></article>
          <article className="rounded-3xl border border-blue-100 bg-[#F8FBFF] p-6 sm:p-8"><div className="flex items-center gap-3"><span className="rounded-xl bg-blue-100 p-3 text-blue-700"><Search size={24}/></span><div><span className="text-[10px] font-black tracking-widest text-blue-600">PIPELINE 02</span><h3 className="text-xl font-black text-[#172033]">Online retrieval & generation</h3></div></div><div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-5 sm:items-center">{[[MessagesSquare,"Query"],[Search,"Retrieve"],[Filter,"Rerank"],[Layers3,"Context"],[BrainCircuit,"Answer"]].map(([Icon,t],i) => <React.Fragment key={t}><div className="rounded-xl border border-blue-100 bg-white p-3 text-center"><Icon className="mx-auto text-blue-600" size={20}/><div className="mt-2 text-xs font-extrabold">{t}</div></div>{i<4 && <ArrowRight className="mx-auto hidden text-blue-300 sm:block" size={15}/>}</React.Fragment>)}</div><p className="mt-6 text-sm leading-7 text-slate-600">Transform the user's question, retrieve candidate evidence, optionally fuse and rerank results, construct a bounded context and ask the LLM for a grounded response with sources.</p></article>
        </div>
      </div></section>

      <section className="bg-[#F7F7FD] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">
        <SectionIntro eyebrow="END-TO-END FLOW" title="See every important RAG stage in one architecture" text="This is the architecture you should be able to draw and explain in a GenAI interview — including storage, retrieval quality and the final generation boundary."/>
        <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
            <FlowNode icon={FileText} title="Documents" text="PDF, HTML, DB, APIs, docs" tone="blue"/><ArrowConnector/><FlowNode icon={Split} title="Chunking" text="Structure, semantic, recursive"/><ArrowConnector/><FlowNode icon={Cpu} title="Embeddings" text="Text → dense vectors" tone="amber"/><ArrowConnector/><FlowNode icon={Database} title="Vector index" text="Vectors + metadata" tone="emerald"/><ArrowConnector/><FlowNode icon={CheckCircle2} title="Indexed corpus" text="Ready for online retrieval"/>
          </div>
          <div className="my-7 flex items-center gap-4"><div className="h-px flex-1 bg-slate-200"/><span className="rounded-full bg-violet-50 px-4 py-2 text-[10px] font-black tracking-widest text-violet-700">ONLINE QUERY PATH</span><div className="h-px flex-1 bg-slate-200"/></div>
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch">
            <FlowNode icon={MessagesSquare} title="User query" text="Question + conversation" tone="blue"/><ArrowConnector/><FlowNode icon={GitBranch} title="Retrieve" text="Dense + sparse + filters"/><ArrowConnector/><FlowNode icon={Filter} title="Rerank" text="Best evidence rises" tone="amber"/><ArrowConnector/><FlowNode icon={Layers3} title="Context" text="Budget + citations" tone="emerald"/><ArrowConnector/><FlowNode icon={BrainCircuit} title="LLM answer" text="Grounded generation"/>
          </div>
        </div>
      </div></section>

      <section className="bg-white px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><SectionIntro eyebrow="CORE CONCEPTS" title="Learn each RAG decision, not just the happy path" center/>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[
          [Split,"Chunking","Compare recursive, token, semantic, parent-child and structure-aware strategies. Understand chunk size, overlap and retrieval trade-offs."],
          [Cpu,"Embeddings","Understand vector representations, dimensions, cosine similarity, dot product, normalization, batching and model selection."],
          [Search,"Retrieval","Master Top-K, thresholds, metadata filters, BM25, dense search, hybrid retrieval, RRF and query transformation."],
          [Filter,"Reranking","Learn why retrieval candidates are reranked, how cross-encoders differ from bi-encoders and where latency enters."],
          [Layers3,"Context engineering","Build useful context with deduplication, compression, ordering, token budgets, neighboring chunks and citations."],
          [BarChart3,"Evaluation","Measure retrieval and generation independently using Recall@K, MRR, NDCG, faithfulness, relevance and golden datasets."],
          [ShieldCheck,"Security","Enforce document permissions outside the LLM, isolate tenants and defend against indirect prompt injection and data leakage."],
          [Gauge,"Optimization","Break down latency, cache safely, batch embeddings, parallelize retrieval and choose quality/cost trade-offs deliberately."],
        ].map(([Icon,t,d]) => <article key={t} className="rounded-2xl border border-slate-200 bg-[#FCFCFF] p-6"><span className="inline-flex rounded-xl bg-violet-50 p-3 text-violet-600"><Icon size={23}/></span><h3 className="mt-5 text-lg font-extrabold text-[#172033]">{t}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{d}</p></article>)}</div>
      </div></section>

      <section className="bg-[#F7F7FD] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">
        <SectionIntro eyebrow="DATABASE DECISIONS" title="Vector databases are compared, not treated as a black box" text="The book explains what each category gives you and the operational questions an interviewer expects: indexing, metadata filtering, persistence, scale, latency, cost and integration with your existing stack."/>
        <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm"><div className="hidden grid-cols-[.7fr_.8fr_1fr_1.6fr] gap-4 bg-[#EEEAFE] px-6 py-4 text-xs font-black uppercase tracking-wider text-violet-700 md:grid"><span>Database</span><span>Type</span><span>Good fit</span><span>What you discuss</span></div>{vectorDbs.map(row => <div key={row[0]} className="grid gap-2 border-t border-slate-100 px-6 py-5 text-sm md:grid-cols-[.7fr_.8fr_1fr_1.6fr] md:gap-4"><strong className="text-[#172033]">{row[0]}</strong><span className="text-slate-600">{row[1]}</span><span className="text-slate-600">{row[2]}</span><span className="text-xs leading-6 text-slate-500">{row[3]}</span></div>)}</div>
      </div></section>

      <section className="bg-white px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">
        <SectionIntro eyebrow="HYBRID RETRIEVAL" title="Why production search often combines lexical and semantic signals" text="Dense retrieval is good at meaning; sparse retrieval is strong on exact words, identifiers and rare terms. The book shows how both candidate sets can be fused and then reranked."/>
        <div className="mx-auto max-w-5xl rounded-3xl border border-blue-100 bg-gradient-to-b from-[#FBFDFF] to-[#F5F3FF] p-6 sm:p-9">
          <div className="mx-auto max-w-xs rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm"><MessagesSquare className="mx-auto text-blue-600"/><strong className="mt-2 block">User query</strong></div>
          <div className="mx-auto h-8 w-px bg-violet-200"/>
          <div className="grid gap-5 md:grid-cols-2"><div className="rounded-2xl border border-blue-100 bg-white p-6 text-center"><Search className="mx-auto text-blue-600"/><h3 className="mt-3 font-black">Sparse / BM25</h3><p className="mt-2 text-xs leading-5 text-slate-600">Exact terms, keywords, IDs, product names and lexical relevance.</p></div><div className="rounded-2xl border border-violet-100 bg-white p-6 text-center"><Cpu className="mx-auto text-violet-600"/><h3 className="mt-3 font-black">Dense / vectors</h3><p className="mt-2 text-xs leading-5 text-slate-600">Semantic similarity, paraphrases and concept-level matching.</p></div></div>
          <div className="mx-auto h-8 w-px bg-violet-200"/><div className="mx-auto max-w-md rounded-2xl border border-amber-100 bg-amber-50 p-5 text-center"><GitBranch className="mx-auto text-amber-600"/><h3 className="mt-2 font-black">Fusion — RRF / weighted scores</h3><p className="mt-1 text-xs text-slate-600">Merge ranked candidate lists into a stronger retrieval set.</p></div>
          <div className="mx-auto h-8 w-px bg-violet-200"/><div className="mx-auto max-w-md rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center"><Filter className="mx-auto text-emerald-600"/><h3 className="mt-2 font-black">Cross-encoder / reranker</h3><p className="mt-1 text-xs text-slate-600">Spend more compute only on the small candidate set, then pass the best evidence to the LLM.</p></div>
        </div>
      </div></section>

      <section id="code" className="bg-[#F7F7FD] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl">
        <SectionIntro eyebrow="3–4 REAL CODE EXAMPLES" title="Code that follows the architecture" text="Switch between ingestion, retrieval, the RAG chain and a simple evaluation metric. The ebook expands these into complete modules and production patterns."/>
        <div className="flex flex-wrap gap-2">{codeSamples.map((s,i) => <button key={s.label} onClick={() => {setActiveCode(i);setCopied(false)}} className={`rounded-full px-5 py-2.5 text-sm font-bold ${activeCode===i ? "bg-violet-600 text-white shadow-md shadow-violet-600/20" : "border border-violet-100 bg-white text-slate-600 hover:bg-violet-50"}`}>{s.label}</button>)}</div>
        <div className="mt-5 grid gap-6 lg:grid-cols-[.72fr_1.28fr]"><div className="rounded-2xl border border-violet-100 bg-white p-6"><span className="text-[10px] font-black uppercase tracking-widest text-violet-600">{codeSamples[activeCode].label}</span><h3 className="mt-3 text-2xl font-black text-[#172033]">{codeSamples[activeCode].title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{codeSamples[activeCode].explanation}</p><button onClick={copyCode} className="mt-6 inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700">{copied ? <Check size={15}/> : <Copy size={15}/>} {copied ? "Copied" : "Copy code"}</button></div><CodeWindow filename={codeSamples[activeCode].filename}>{codeSamples[activeCode].code}</CodeWindow></div>
      </div></section>

      <section className="bg-white px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><SectionIntro eyebrow="PRODUCTION DATA LAYER" title="Know where every piece of RAG data belongs" text="A production architecture usually needs more than a vector store. The ebook separates durable source files, business metadata, vectors and short-lived cache/state."/>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{[
          [Cloud,"Object storage","Original PDFs, DOCX, images and raw source files.","S3 · GCS · Blob"],
          [Database,"Relational DB","Users, documents, permissions, versions, ingestion state and feedback.","PostgreSQL"],
          [Boxes,"Vector DB","Chunk vectors, IDs, searchable metadata and ANN indexes.","Qdrant · Pinecone · pgvector"],
          [Zap,"Cache / state","Sessions, rate limits, hot retrieval results, job state and semantic cache.","Redis"],
        ].map(([Icon,t,d,e]) => <article key={t} className="rounded-2xl border border-slate-200 bg-[#FCFCFF] p-6"><Icon className="text-violet-600"/><h3 className="mt-4 font-black text-[#172033]">{t}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{d}</p><div className="mt-4 rounded-lg bg-violet-50 px-3 py-2 font-mono text-[11px] text-violet-700">{e}</div></article>)}</div>
      </div></section>

      <section className="bg-[#F7F7FD] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><SectionIntro eyebrow="QUALITY, NOT GUESSWORK" title="Evaluate retrieval before blaming the LLM" text="The book teaches a debugging sequence: first verify whether the right evidence was indexed and retrieved; then inspect context construction; only then evaluate generation."/>
        <div className="grid gap-5 lg:grid-cols-3">{[
          [Target,"Retrieval quality",["Precision@K","Recall@K","Hit Rate","MRR","MAP","NDCG"]],
          [BrainCircuit,"Generation quality",["Faithfulness","Answer relevance","Correctness","Completeness","Citation quality"]],
          [Gauge,"System quality",["Latency","Cost/query","Index freshness","Failure rate","Cache hit rate","User feedback"]],
        ].map(([Icon,t,items]) => <article key={t} className="rounded-2xl border border-violet-100 bg-white p-7"><Icon className="text-violet-600"/><h3 className="mt-4 text-xl font-black text-[#172033]">{t}</h3><div className="mt-5 grid grid-cols-2 gap-2">{items.map(x => <span key={x} className="rounded-lg bg-[#F7F5FF] px-3 py-2 text-xs font-bold text-slate-600">{x}</span>)}</div></article>)}</div>
      </div></section>

      <section id="curriculum" className="bg-white px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><SectionIntro eyebrow="COMPLETE TABLE OF CONTENTS" title="25 chapters from RAG basics to system design" text="Every chapter is designed for interview preparation: concept, architecture, Python/LangChain implementation, trade-offs, production considerations, common failures and interview follow-ups."/>
        <div className="grid gap-6 lg:grid-cols-2">{curriculum.map(part => <div key={part.group} className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm"><div className="border-b border-violet-100 bg-[#F0ECFF] px-6 py-4 text-xs font-black uppercase tracking-widest text-violet-700">{part.group}</div><div className="divide-y divide-slate-100 px-6">{part.chapters.map(ch => <article key={ch.n} className="flex gap-4 py-5"><span className="mt-0.5 text-xs font-black text-violet-600">{ch.n}</span><div><h3 className="font-extrabold text-[#172033]">{ch.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{ch.details}</p></div></article>)}</div></div>)}</div>
      </div></section>

      <section className="bg-[#F7F7FD] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><SectionIntro eyebrow="INTERVIEW SYSTEM DESIGN" title="Design RAG for millions of documents" text="Move beyond notebook demos. Explain ingestion workers, durable storage, index updates, authorization, hybrid retrieval, reranking, caching, observability and evaluation as one system."/>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-stretch"><FlowNode icon={Cloud} title="Data sources" text="Files, APIs, DBs, web" tone="blue"/><ArrowConnector/><FlowNode icon={Server} title="Ingestion workers" text="Parse, chunk, version"/><ArrowConnector/><FlowNode icon={Database} title="Storage layer" text="Objects + SQL + vectors" tone="emerald"/><ArrowConnector/><FlowNode icon={Network} title="RAG API" text="Retrieve, rerank, answer" tone="amber"/></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{["How do document updates replace stale vectors?","How do you prevent cross-tenant retrieval?","How do you reduce 8s latency to 2s?","How do you know retrieval caused a bad answer?","How do you migrate embedding models?","How do deletes propagate safely?","Where should metadata filters run?","How do you evaluate before deployment?"].map(q => <div key={q} className="rounded-xl border border-violet-100 bg-white p-4 text-sm font-bold leading-6 text-slate-700">{q}</div>)}</div>
      </div></section>

      <section className="bg-white px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><SectionIntro eyebrow="WHO THIS IS FOR" title="Built for engineers preparing to explain RAG clearly" center/><div className="grid gap-5 md:grid-cols-3">{[[Server,"Backend engineers","Connect APIs, databases, queues, storage, caching and authorization to the retrieval lifecycle."],[Sparkles,"GenAI engineers","Go from embeddings and retrievers to hybrid search, reranking, evaluation, agentic RAG and production debugging."],[BookOpen,"Interview candidates","Prepare architecture explanations, trade-offs, metrics, failure scenarios and system-design follow-ups with working code."]].map(([Icon,t,d]) => <article key={t} className="rounded-2xl border border-slate-200 bg-[#FCFCFF] p-7"><Icon className="text-violet-600" size={26}/><h3 className="mt-4 text-lg font-extrabold text-[#172033]">{t}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{d}</p></article>)}</div></div></section>

      <section id="pricing" className="bg-[#F7F7FD] px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_.85fr]">
        <div><SectionIntro eyebrow="GET THE EBOOK" title="One RAG guide from first principles to production" text="Use it as a learning path, an interview revision guide and a practical reference while building retrieval systems."/><div className="grid gap-3 sm:grid-cols-2">{["Two complete RAG pipelines","Python + LangChain examples","Chunking & embeddings","8 vector DBs discussed","Hybrid retrieval + RRF","Reranking & context engineering","Evaluation & debugging","Production system design"].map(x => <div key={x} className="flex items-start gap-2 text-sm text-slate-700"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600"/>{x}</div>)}</div></div>
        <div className="rounded-3xl border border-violet-100 bg-white p-7 shadow-[0_24px_70px_rgba(80,62,150,.10)] sm:p-9"><span className="text-xs font-black uppercase tracking-widest text-violet-700">{productTitle}</span><div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2"><strong className="text-5xl font-black tracking-tighter text-[#172033] sm:text-6xl">{loadingProduct ? "Loading price..." : canBuy ? formatMoney(currentPrice) : "Price unavailable"}</strong>{canBuy && hasMrp && <del className="text-2xl font-semibold text-slate-400">{formatMoney(mrp)}</del>}{canBuy && discount > 0 && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">{discount}% OFF</span>}</div>
          {product?.subtitle && <p className="mt-3 text-sm text-slate-600">{product.subtitle}</p>}{product?.shortDescription && <p className="mt-3 text-sm leading-6 text-slate-600">{product.shortDescription}</p>}{product?.description && <p className="mt-3 text-sm leading-6 text-slate-600">{product.description}</p>}
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">{[product?.edition,product?.language,product?.format,product?.level,product?.resource_type,...(Array.isArray(product?.categories)?product.categories:[])].filter(Boolean).map((v,i)=><span key={`${v}-${i}`} className="rounded-full bg-violet-50 px-3 py-1">{v}</span>)}</div>
          <div className="my-6 border-t border-slate-100"/><button onClick={handleBuyNow} disabled={!canBuy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-4 text-sm font-extrabold text-white shadow-xl shadow-violet-600/20 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">Get the ebook <ArrowRight size={18}/></button>
          {productError && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Something went wrong. Please try again. <button onClick={() => setRetryCount(c=>c+1)} className="font-bold underline">Retry</button></div>}
          <div className="mt-5 space-y-1 text-center text-[11px] leading-5 text-slate-500"><p>This digital book is not refundable.</p><p>For support, contact <a href="mailto:supporttargettrek@gmail.com" className="underline hover:text-violet-700">supporttargettrek@gmail.com</a></p></div>
        </div>
      </div></section>

      <section className="bg-white px-5 py-20 sm:px-8 lg:py-24"><div className="mx-auto max-w-3xl"><SectionIntro eyebrow="QUESTIONS" title="Frequently asked questions" center/><div className="divide-y divide-violet-100 border-y border-violet-100">{faqs.map(([q,a],i)=><div key={q}><button onClick={()=>setOpenFaq(openFaq===i?-1:i)} className="flex w-full items-center justify-between gap-6 py-5 text-left font-bold text-[#172033]"><span>{q}</span><ChevronDown className={`shrink-0 transition-transform ${openFaq===i?"rotate-180":""}`} size={19}/></button><div hidden={openFaq!==i} className="pb-5 pr-9 text-sm leading-7 text-slate-600">{a}</div></div>)}</div></div></section>

      <section className="bg-gradient-to-r from-[#EEEAFE] to-[#EAF6FF] px-5 py-14 sm:px-8"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-7 md:flex-row md:items-center"><div><span className="text-xs font-black uppercase tracking-widest text-violet-600">READY TO MASTER RAG?</span><h2 className="mt-2 text-3xl font-black tracking-tight text-[#172033] sm:text-4xl">Understand retrieval from document to answer.</h2><p className="mt-2 text-sm text-slate-600">Architecture, LangChain code, vector databases, evaluation and interviews in one guide.</p></div><button onClick={handleBuyNow} disabled={!canBuy} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-4 text-sm font-extrabold text-white hover:bg-violet-700 disabled:opacity-50">{canBuy ? `Get the ebook — ${formatMoney(currentPrice)}` : loadingProduct ? "Loading price..." : "Price unavailable"}<ArrowRight size={18}/></button></div></section>
    </main>

    <PayUCheckoutModal isOpen={isCheckoutOpen && canBuy} onClose={() => setIsCheckoutOpen(false)} product={product}/>
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-violet-100 bg-white px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-9px_32px_rgba(80,62,150,.12)] md:hidden"><div>{canBuy && hasMrp && <div className="text-[10px] text-slate-500"><del>{formatMoney(mrp)}</del>{discount>0&&<span className="ml-2 font-extrabold text-emerald-700">{discount}% OFF</span>}</div>}<strong className="text-lg font-black text-[#172033]">{loadingProduct?"Loading...":canBuy?formatMoney(currentPrice):"Price unavailable"}</strong></div><button onClick={handleBuyNow} disabled={!canBuy} className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-4 py-3 text-xs font-extrabold text-white disabled:opacity-50">Get ebook <ArrowRight size={16}/></button></div>
    <div className="h-16 bg-[#EEEAFE] md:hidden" aria-hidden="true"/>
  </div>;
}
