import {
  ArrowRight, ArrowsClockwise, BookOpen, Brain, ChartBar, ChatCircleText, Cloud, Code, Cpu, Database, FileText, Funnel, Gauge, GitBranch,
  HardDrives, LockKey, MagnifyingGlass, Scissors, ShieldCheck, Stack, Package,
} from "@phosphor-icons/react";

import { Section, scrollToId } from "./bookKit";
import { Cards, Chapters, CodeTabs, Flow, GenaiBookPage } from "./genaiKit";

/*
  /book/genai/rag: two pipelines → why RAG → building blocks → 25 chapters → vector databases
  → real code → production → projects → system design interview → other GenAI books → FAQ → buy
*/

const SEO = {
  title: "RAG Pipeline Ebook: Python & LangChain Guide | Target Trek",
  description: "Master RAG with Python and LangChain: chunking, embeddings, vector databases, hybrid search, reranking, evaluation and production RAG.",
  keywords: "RAG book, RAG pipeline, retrieval augmented generation ebook, LangChain RAG, chunking strategies, embeddings, vector database, FAISS, Chroma, Pinecone, Qdrant, pgvector, HNSW, hybrid search, BM25, reciprocal rank fusion, reranking, RAG evaluation, RAGAS, RAG system design interview, GenAI interview",
  long: "A Retrieval-Augmented Generation ebook in 25 chapters: offline ingestion and indexing, online retrieval and generation, document parsing, chunking, embeddings, vector databases, ANN indexes, hybrid search, query transformation, reranking, context engineering, evaluation, debugging, production architecture, security, complete Python and LangChain projects and RAG system design interviews.",
  category: "Generative AI Retrieval-Augmented Generation Ebook",
};

const NAV = [["pipelines", "Two pipelines"], ["why", "Why RAG"], ["concepts", "Building blocks"], ["contents", "25 chapters"], ["vector-dbs", "Vector DBs"], ["code", "Code"], ["projects", "Projects"], ["interview", "System design"], ["bundle", "GenAI series"], ["faq", "FAQ"]];
const STATS = [["25", "chapters"], ["2", "RAG pipelines"], ["8", "vector databases"], ["3", "projects"]];

const STAGES = [
  {
    id: "foundations", title: "RAG Foundations", subtitle: "Understand the complete RAG mental model",
    chapters: [
      { n: "01", title: "RAG from first principles", details: "Why retrieval-augmented generation exists, hallucination, knowledge freshness, private data, RAG vs fine-tuning, long-context models, and the complete request lifecycle." },
      { n: "02", title: "The two RAG pipelines", details: "Separate offline ingestion/indexing from online retrieval/generation. Understand which components run once, which run per query, and where latency and failures occur." },
      { n: "03", title: "Python + LangChain setup", details: "Project structure, virtual environments, LangChain packages, model providers, environment variables, loaders, text splitters, embeddings, vector stores, and LCEL." },
    ],
  },
  {
    id: "ingestion", title: "Ingestion & Indexing", subtitle: "Prepare knowledge for reliable retrieval",
    chapters: [
      { n: "04", title: "Document loading and parsing", details: "PDF, TXT, Markdown, HTML, CSV, JSON, DOCX, web pages, APIs, databases, OCR, document IDs, metadata, cleaning, deduplication, versioning, and incremental ingestion." },
      { n: "05", title: "Chunking deeply explained", details: "Fixed, recursive, token, sentence, semantic, structure-aware, parent-child, and hierarchical chunking. Tune chunk size and overlap using retrieval quality rather than guesses." },
      { n: "06", title: "Embeddings", details: "Dense vectors, dimensions, semantic similarity, cosine similarity, dot product, Euclidean distance, batching, normalization, model selection, multilingual and domain embeddings." },
      { n: "07", title: "Vector databases", details: "FAISS, Chroma, Pinecone, Qdrant, Weaviate, Milvus, pgvector and Elasticsearch/OpenSearch: indexes, metadata filtering, persistence, scale, operations and trade-offs." },
      { n: "08", title: "ANN and vector indexes", details: "Exact search, approximate nearest neighbors, HNSW, IVF, IVF-PQ, product quantization, recall/latency trade-offs, M, efConstruction and efSearch." },
    ],
  },
  {
    id: "retrieval", title: "Retrieval & Generation", subtitle: "Retrieve evidence and generate grounded answers",
    chapters: [
      { n: "09", title: "Retrievers and Top-K", details: "Similarity search, score thresholds, metadata filters, retriever interfaces, Top-K selection, recall vs precision and query/document mismatch." },
      { n: "10", title: "Sparse, dense & hybrid search", details: "TF-IDF, BM25, inverted indexes, dense retrieval, score normalization, weighted fusion and Reciprocal Rank Fusion with complete Python/LangChain examples." },
      { n: "11", title: "Query transformation", details: "Query rewriting, expansion, decomposition, multi-query retrieval, HyDE, step-back prompting, entity expansion and conversation-aware standalone queries." },
      { n: "12", title: "Reranking", details: "Bi-encoder retrieval, cross-encoder reranking, LLM reranking, candidate Top-K vs final Top-K, latency trade-offs and production placement." },
      { n: "13", title: "Context engineering", details: "Deduplication, ordering, token budgets, neighboring chunks, compression, lost-in-the-middle, source metadata and dynamic context construction." },
      { n: "14", title: "RAG prompting & grounded answers", details: "Prompt templates, context boundaries, citations, structured output, insufficient-context behavior, injection resistance and LangChain runnable composition." },
    ],
  },
  {
    id: "advanced", title: "Advanced & Production RAG", subtitle: "Evaluation, security, architecture and scale",
    chapters: [
      { n: "15", title: "Advanced retrieval patterns", details: "Parent document retrieval, multi-vector retrieval, contextual retrieval, sentence windows, metadata-aware RAG and hierarchical retrieval." },
      { n: "16", title: "Conversational, multimodal & agentic RAG", details: "Chat history, query contextualization, tables, images, OCR, multimodal retrieval, RAG as a tool, routing, retrieval grading and self-correction." },
      { n: "17", title: "RAG evaluation", details: "Precision@K, Recall@K, Hit Rate, MRR, MAP, NDCG, faithfulness, answer relevance, context relevance, RAGAS, LangSmith, golden datasets and LLM-as-judge." },
      { n: "18", title: "Debugging RAG failures", details: "Diagnose bad answers by separating ingestion, retrieval, context and generation failures. Cover stale data, duplicates, poor chunks, low recall and hallucination." },
      { n: "19", title: "Production architecture", details: "FastAPI, queues, workers, Redis, object storage, PostgreSQL, vector DBs, retries, streaming, caching, tracing, scaling, multi-tenancy and deployment." },
      { n: "20", title: "Security, cost & latency", details: "Prompt injection, malicious documents, permissions, tenant isolation, PII, authorization filters, semantic caching, batching, async retrieval and latency budgets." },
    ],
  },
  {
    id: "projects", title: "Projects & Interviews", subtitle: "Build and explain real RAG applications",
    chapters: [
      { n: "21", title: "Basic RAG — complete build", details: "Build PDF → loader → splitter → embeddings → vector store → retriever → prompt → LLM → answer with runnable Python and LangChain." },
      { n: "22", title: "Production RAG — complete build", details: "Build hybrid retrieval, RRF, reranking, context compression, citations, evaluation, caching and an API layer as a cohesive production-style system." },
      { n: "23", title: "Enterprise document assistant", details: "Upload and version documents, store metadata, enforce permissions, retrieve and rerank evidence, answer with citations, collect feedback, test and deploy." },
      { n: "24", title: "RAG system design interview", details: "Design for millions of documents: requirements, APIs, ingestion, storage, indexes, scaling, multi-tenancy, updates, deletes, observability, cost and failure recovery." },
      { n: "25", title: "Interview question bank", details: "Fundamentals through production system design: chunking, embeddings, vector DBs, ANN, hybrid search, reranking, evaluation, security, debugging and optimization." },
    ],
  },
];

const OFFLINE = [
  { icon: FileText, title: "Load", tag: "1", text: "Parse PDFs, web pages, APIs and databases into documents." },
  { icon: Scissors, title: "Chunk", tag: "2", text: "Split into retrievable pieces with the right size and overlap." },
  { icon: Cpu, title: "Embed", tag: "3", text: "Turn each chunk into a dense vector." },
  { icon: Database, title: "Index", tag: "4", text: "Store vectors and metadata in a searchable index." },
];
const ONLINE = [
  { icon: ChatCircleText, title: "Query", tag: "1", text: "Take the user's question, rewritten if needed." },
  { icon: MagnifyingGlass, title: "Retrieve", tag: "2", text: "Fetch candidate evidence from the index." },
  { icon: Funnel, title: "Rerank", tag: "3", text: "Re-order candidates so the best evidence comes first." },
  { icon: Brain, title: "Answer", tag: "4", text: "Build context and generate a grounded response." },
];

const WHY = [
  { icon: BookOpen, title: "Grounded answers", text: "Retrieve relevant context before generation instead of depending only on what the model already knows." },
  { icon: ArrowsClockwise, title: "Fresher information", text: "Update your search index as documents change, without retraining a model for every content update." },
  { icon: LockKey, title: "Private enterprise data", text: "Retrieve authorized information from internal sources while enforcing access controls and isolation." },
];

const CONCEPTS = [
  { icon: Scissors, title: "Chunking", text: "Fixed, semantic, recursive, parent-child and structure-aware strategies." },
  { icon: Cpu, title: "Embeddings", text: "Dense vectors, similarity metrics, batching and embedding model selection." },
  { icon: Database, title: "Vector search", text: "ANN indexes, HNSW, IVF, quantization and filtering." },
  { icon: MagnifyingGlass, title: "Hybrid retrieval", text: "Combine sparse retrieval, dense vectors, BM25 and RRF." },
  { icon: Funnel, title: "Reranking", text: "Improve candidate ordering with cross-encoders and other rerankers." },
  { icon: Stack, title: "Context engineering", text: "Deduplication, token budgets, document ordering and context relevance." },
  { icon: ChartBar, title: "Evaluation", text: "Measure retrieval precision, recall, ranking, faithfulness and answer quality." },
  { icon: ShieldCheck, title: "Production security", text: "Authorization, tenant isolation, PII and prompt-injection risks." },
];

const VECTOR_DBS = [
  ["FAISS", "Library / index", "Local experiments & custom services", "Fast local ANN search; you manage persistence, metadata and service concerns."],
  ["Chroma", "Vector store", "Learning & smaller applications", "Simple developer experience and convenient local persistence."],
  ["Pinecone", "Managed vector DB", "Managed production RAG", "Hosted operations, namespaces, filtering and managed scaling."],
  ["Qdrant", "Vector DB", "Cloud or self-hosted RAG", "Strong filtering and production-oriented vector search."],
  ["Weaviate", "Vector DB", "Search + RAG systems", "Vector search with rich object and metadata capabilities."],
  ["Milvus", "Distributed vector DB", "Large vector workloads", "Designed for distributed vector search at scale."],
  ["pgvector", "PostgreSQL extension", "Existing PostgreSQL stacks", "Keep relational data and vectors close when scale and workload fit."],
  ["OpenSearch", "Search engine", "Hybrid enterprise search", "Keyword and vector search where search infrastructure already exists."],
];

const CODE = [
  { id: "ingestion", label: "Ingestion", filename: "ingest.py", title: "Load, chunk and index a PDF", description: "The offline pipeline turns source documents into retrievable chunks and stores their embeddings.",
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

print(f"Indexed {len(chunks)} chunks")` },
  { id: "retrieval", label: "Retrieval", filename: "retrieve.py", title: "Create a retriever and fetch evidence", description: "The online pipeline queries the vector store for relevant chunks.",
    code: `retriever = vectorstore.as_retriever(
    search_type="similarity",
    search_kwargs={"k": 6},
)

query = "How does hybrid retrieval work?"

docs = retriever.invoke(query)

for rank, doc in enumerate(docs, start=1):
    print(rank, doc.metadata)
    print(doc.page_content[:240])` },
  { id: "rag", label: "RAG chain", filename: "rag_chain.py", title: "Build a grounded LangChain RAG chain", description: "Retrieved evidence is formatted into a controlled prompt before generation.",
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
)` },
  { id: "evaluation", label: "Evaluation", filename: "retrieval_eval.py", title: "Measure retrieval recall", description: "A compact evaluator that checks whether the expected evidence appears in Top-K.",
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
)` },
];

const PRODUCTION = [
  { icon: GitBranch, title: "Hybrid retrieval", text: "Combine sparse and dense search, fuse rankings and improve evidence coverage." },
  { icon: Gauge, title: "Latency & cost", text: "Tune retrieval counts, caching, token usage and generation budgets." },
  { icon: ShieldCheck, title: "Security", text: "Enforce document permissions, tenant isolation and safe context handling." },
  { icon: ChartBar, title: "Evaluation", text: "Track retrieval relevance, groundedness, rankings and answer quality." },
];

const PROJECTS = [
  { icon: Code, kicker: "Project 01", title: "Basic RAG pipeline", text: "A working retrieval-and-generation flow, from PDF ingestion to grounded answers.",
    points: ["Document loading and parsing", "Chunking and embeddings", "Vector store and retrieval", "Prompt, LLM and response"] },
  { icon: Cloud, kicker: "Project 02", title: "Production-style RAG", text: "Advanced retrieval plus the features a more reliable application needs.",
    points: ["Hybrid search and RRF", "Reranking and compression", "Answer citations", "Caching and evaluation"] },
  { icon: Package, kicker: "Project 03", title: "Enterprise document assistant", text: "A larger RAG application with managed documents, permissions and system-level concerns.",
    points: ["Document uploads and versioning", "Identity and access filters", "Evidence retrieval and citations", "Observability and scaling"] },
];

const INTERVIEW = [
  [HardDrives, "Scalable API design"], [Database, "Index & storage architecture"], [ArrowsClockwise, "Data freshness & reindexing"],
  [ShieldCheck, "Tenant access controls"], [Gauge, "Latency & cost constraints"], [ChartBar, "Evaluation & observability"],
];

const FAQS = [
  { q: "Does this ebook explain both RAG pipelines?", a: "Yes. The book separates the offline ingestion/indexing pipeline from the online retrieval/generation pipeline, then explains how both work together in a complete production architecture." },
  { q: "Is the implementation based on LangChain?", a: "Yes. Python and LangChain are the main implementation stack, with examples covering loaders, splitters, embeddings, vector stores, retrievers, runnable chains, hybrid retrieval, and evaluation." },
  { q: "Will it cover advanced GenAI interview topics?", a: "Yes. It covers ANN/HNSW, hybrid retrieval, RRF, reranking, query transformation, evaluation, multi-tenancy, security, latency, cost, and production system design." },
  { q: "Does the book contain complete projects?", a: "Yes. The curriculum progresses from a basic RAG implementation to a production-style pipeline and an enterprise document assistant architecture." },
  { q: "Which vector databases are included?", a: "The book discusses FAISS, Chroma, Pinecone, Qdrant, Weaviate, Milvus, pgvector, and Elasticsearch/OpenSearch, including practical trade-offs." },
  { q: "Is this book suitable for RAG system design interviews?", a: "Yes. It includes requirements, architecture, ingestion, indexing, retrieval, scaling, multi-tenancy, reliability, evaluation, security, cost, and failure scenarios." },
  { q: "What format is the book and is it refundable?", a: "It is a digital PDF ebook you can read on a phone, tablet or laptop. Digital purchases are non-refundable. For payment or access help, write to supporttargettrek@gmail.com." },
];

export default function GenaiRAG() {
  return (
    <GenaiBookPage
      id="rag" seo={SEO} nav={NAV} faqs={FAQS}
      hero={{
        crumb: "GenAI · RAG",
        pill: <><FileText size={14} weight="bold" aria-hidden />GenAI interview handbook · Python + LangChain</>,
        title: <>Build RAG that <span className="hb-mark">actually finds the answer.</span></>,
        lead: "Learn Retrieval-Augmented Generation from fundamentals to production. Ingestion, chunking, embeddings, vector databases, hybrid retrieval, reranking, evaluation and system design, with Python and LangChain.",
        stats: STATS,
        coverFallback: { title: "Master GenAI Interview", subtitle: "RAG Pipeline", line: "25 chapters · Python + LangChain" },
      }}
      schemaExtra={[{ "@type": "ItemList", idSuffix: "chapters", name: "Chapters of the RAG ebook", numberOfItems: 25,
        itemListElement: STAGES.flatMap((s) => s.chapters).map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.title, description: c.details })) }]}
      final={{ title: <>Go from understanding RAG <span className="hb-mark">to designing production systems.</span></>, line: "Retrieval architecture, Python and LangChain pipelines, vector databases, evaluation and GenAI interview prep in one ebook." }}
      footerLine="Master GenAI Interview — RAG Pipeline · Digital PDF ebook · Digital purchases are not refundable"
    >
      {() => (
        <>
          <Section id="pipelines" eyebrow="RAG architecture" title="RAG is two connected pipelines" lead="Preparing knowledge offline and answering questions online are separate jobs. Knowing which is which is how you debug, scale and answer system design questions.">
            <div className="gx-lanes">
              <div>
                <p className="gx-lane-k"><b>Pipeline 01 · Offline ingestion & indexing</b><span>runs when documents change</span></p>
                <Flow steps={OFFLINE} label="Offline ingestion and indexing pipeline" />
              </div>
              <div>
                <p className="gx-lane-k"><b>Pipeline 02 · Online retrieval & generation</b><span>runs on every question</span></p>
                <Flow steps={ONLINE} label="Online retrieval and generation pipeline"
                  note={<><Gauge size={18} weight="bold" aria-hidden /><span>The offline pipeline runs when documents are added, updated or deleted, not on every question. The online pipeline runs per question, so its retrieval quality and latency shape every answer.</span></>}
                />
              </div>
            </div>
          </Section>

          <Section id="why" tint eyebrow="Foundations" title="Why Retrieval-Augmented Generation?" lead="A language model can write fluent answers without access to your current or private knowledge. RAG supplies the right evidence at generation time.">
            <Cards items={WHY} cols={3} />
          </Section>

          <Section id="concepts" eyebrow="Key engineering concepts" title="The building blocks of a strong RAG system" lead="From how documents are represented to how evidence is ranked, compressed, evaluated and handed to an LLM.">
            <Cards items={CONCEPTS} cols={4} />
          </Section>

          <Section id="contents" tint eyebrow="Complete contents" title="25 chapters in five stages" lead="Start with RAG fundamentals, then move to advanced retrieval, production architecture, complete projects and system design interviews.">
            <Chapters stages={STAGES} placeholder="Search: embeddings, reranking, HNSW, evaluation…" />
          </Section>

          <Section id="vector-dbs" eyebrow="Vector database guide" title="Understand where your embeddings live" lead="The eight vector search technologies the book compares, with how their storage models, operations and typical use cases differ.">
            <div className="gx-table" role="region" aria-label="Vector databases compared" tabIndex={0}>
              <table>
                <thead><tr><th scope="col">Database</th><th scope="col">Type</th><th scope="col">Best for</th><th scope="col">Notes</th></tr></thead>
                <tbody>{VECTOR_DBS.map(([name, type, ideal, note]) => <tr key={name}><th scope="row">{name}</th><td>{type}</td><td><b style={{ color: "var(--text)" }}>{ideal}</b></td><td>{note}</td></tr>)}</tbody>
              </table>
            </div>
            <p className="gx-hint">Swipe the table sideways to see every column.</p>
            <p className="gx-note" style={{ marginTop: 16 }}><Database size={18} weight="bold" aria-hidden /><span>Pick a vector store based on retrieval quality, filtering, cost, scale, operational needs and the rest of your application&apos;s architecture.</span></p>
          </Section>

          <Section id="code" tint eyebrow="Python + LangChain" title="Learn RAG through working code" lead="Snippets for ingestion, retrieval, grounded generation and evaluation, each matching a stage explained in the book.">
            <CodeTabs examples={CODE} points={["Python implementation", "LangChain-oriented examples", "Interview-friendly explanations"]} />
          </Section>

          <Section id="production" eyebrow="Production RAG engineering" title="Build systems that go beyond the demo" lead="A complete RAG architecture needs evaluation, reliable data updates, access control, performance tuning and clear operational boundaries.">
            <Cards items={PRODUCTION} cols={4} />
          </Section>

          <Section id="projects" tint eyebrow="Practical projects" title="From your first RAG app to enterprise architecture" lead="Complete, implementation-oriented builds and an enterprise document assistant design.">
            <Cards items={PROJECTS} cols={3} />
          </Section>

          <Section id="interview" eyebrow="RAG system design interview" title="Can you design RAG for millions of documents?">
            <div className="gx-proj">
              <div className="gx-proj-card">
                <span className="gx-kicker">Interview chapters 24 – 25</span>
                <h3>Go beyond explaining what a vector database is.</h3>
                <p>Reason about ingestion workers, indexing, APIs, retrieval quality, multi-tenancy, consistency, cost, observability and graceful failure.</p>
                <button type="button" className="hb-btn hb-btn-onpanel" style={{ justifySelf: "start" }} onClick={() => scrollToId("contents")}>Explore the chapters<ArrowRight size={16} weight="bold" aria-hidden /></button>
              </div>
              <ul className="gx-cards c2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))" }}>
                {INTERVIEW.map(([Icon, label]) => (
                  <li key={label} className="gx-card" style={{ flexDirection: "row", alignItems: "center" }}>
                    <span className="hb-ico"><Icon size={20} weight="duotone" aria-hidden /></span><h3 style={{ fontSize: 16 }}>{label}</h3>
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
