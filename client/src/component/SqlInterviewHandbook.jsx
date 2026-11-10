import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Helmet } from "react-helmet-async";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  Copy,
  Database,
  Layers3,
  Lightbulb,
  LockKeyhole,
  Network,
  ShieldCheck,
  Sparkles,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { trackViewContent } from "../lib/metaPixel.js";
import {
  styles as baseStyles,
  readTheme,
  ScrollProgress,
  CountUp,
  ScrollScale,
} from "./SystemDesignLLD.jsx";

const SITE_NAME = "Target Trek";
const SITE_URL = "https://www.targettrek.in";
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";
const PAGE_PATH = "/book/database/sql";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";
const HLD_URL = "/book/system-design/hld";
const LLD_URL = "/book/system-design/lld";

// Title <= 60 chars, description <= 160 chars so SERP snippets are not truncated.
const SEO_TITLE = "SQL & Database Interview Handbook (PDF) | Target Trek";
const SEO_DESCRIPTION =
  "SQL and database interview ebook: joins, window functions, indexing, transactions, isolation, MVCC, replication, sharding, 14 classic problems and a 7-day plan.";
const SEO_LONG_DESCRIPTION =
  "Prepare for SQL and database interviews with 26 chapters: SELECT, joins, CTEs, window functions, 14 classic problems, normalization, schema design, indexing, query optimization, ACID, isolation levels, MVCC, deadlocks, WAL, replication, partitioning, sharding, caching, distributed transactions, security, an interview question bank and a 7-day revision plan.";
const SEO_KEYWORDS =
  "SQL interview questions, database interview handbook, SQL ebook, DBMS interview preparation, window functions, SQL joins, database indexing, B+ tree index, transaction isolation levels, MVCC, deadlocks, database sharding, replication, normalization, PostgreSQL interview, SQL window functions interview, SQL for backend interviews, TargetTrek";

const stats = [
  ["26", "Chapters"],
  ["6", "Parts"],
  ["14", "Classic SQL problems"],
  ["7", "Day revision plan"],
];

const PARTS = [
  {
    id: "I",
    title: "SQL Foundations",
    icon: Database,
    summary: "From keys and constraints to joins, CTEs, window functions and the 14 problems interviewers keep asking.",
    chapters: [
      { n: "0", title: "How to Use This Book", topics: ["What this handbook covers", "How every chapter is built", "Suggested study paths", "Run the examples yourself"] },
      { n: "1", title: "Database Fundamentals", topics: ["What is a database and a DBMS?", "Keys: the glue of the relational model", "Constraints: let the database defend your data", "Data types you must know", "SQL is a family of sub-languages", "The sample database used in every chapter"] },
      { n: "2", title: "SELECT Essentials", topics: ["Execution order: the mental model behind every query", "Filtering with WHERE", "NULL: the value that is not a value", "Sorting, limiting and removing duplicates", "Aggregation and GROUP BY", "CASE, COALESCE and common functions"] },
      { n: "3", title: "Joins", topics: ["Why joins exist", "INNER JOIN", "LEFT JOIN: keep everything from the left", "RIGHT and FULL OUTER JOIN", "Anti-join: find rows with NO match", "Self join: employees and their managers", "CROSS JOIN", "Joining three or more tables", "Join traps interviewers love", "How databases execute joins (preview)"] },
      { n: "4", title: "Subqueries, CTEs and Set Operations", topics: ["Subquery types", "EXISTS vs IN, and the NOT IN trap", "Common Table Expressions (WITH)", "Recursive CTE: walking hierarchies", "Set operations", "LATERAL: a subquery that can see the row to its left"] },
      { n: "5", title: "Window Functions", topics: ["The idea", "Ranking: ROW_NUMBER vs RANK vs DENSE_RANK", "Top-N per group", "LAG and LEAD: compare with the previous / next row", "Running totals and moving averages", "Per-group comparison and share of total"] },
      { n: "6", title: "Classic SQL Interview Problems", topics: ["Second highest salary (without LIMIT tricks)", "Nth highest salary per department", "Find duplicate rows", "Delete duplicates, keeping one row", "Employees earning more than their manager", "Department with the highest average salary", "Departments with no employees", "Top 3 salaries in each department", "Consecutive days: gaps and islands", "Running total per customer", "Month-over-month growth", "Median salary", "Pivot with conditional aggregation", "Customers whose total spend exceeds the average customer spend"] },
      { n: "7", title: "DDL, DML and Database Programmability", topics: ["INSERT, UPDATE, DELETE and RETURNING", "UPSERT: insert or update in one atomic statement", "DELETE vs TRUNCATE vs DROP", "ALTER TABLE safely", "Views and materialized views", "Functions, stored procedures and triggers", "Temporary tables, sequences and identity"] },
    ],
  },
  {
    id: "II",
    title: "Database Design",
    icon: Layers3,
    summary: "Normalize with intent, denormalize on purpose, and model real systems such as multi-tenant SaaS.",
    chapters: [
      { n: "8", title: "Normalization", topics: ["Why normalize? The three anomalies", "Functional dependencies: the vocabulary", "First Normal Form (1NF): atomic values, no repeating groups", "Second Normal Form (2NF): no partial dependencies", "Third Normal Form (3NF): no transitive dependencies", "Boyce-Codd Normal Form (BCNF)", "Higher forms in one minute", "Normalization at a glance", "Denormalization: breaking the rules on purpose"] },
      { n: "9", title: "Schema Design and Data Modeling", topics: ["Relationships and how to implement them", "Choosing a primary key", "Standard columns worth adding", "Keeping history: Slowly Changing Dimension Type 2", "Multi-tenant designs (SaaS)", "Anti-patterns to avoid", "Mini design walk-through: URL shortener"] },
    ],
  },
  {
    id: "III",
    title: "Storage, Indexing and Performance",
    icon: Zap,
    summary: "See how rows become bytes, why an index helps or is ignored, and how to read EXPLAIN like a pro.",
    chapters: [
      { n: "10", title: "Storage Internals and Paging", topics: ["From table to bytes", "Where is my row? The ctid", "The buffer pool: RAM in front of disk", "What happens on UPDATE and DELETE (PostgreSQL)", "Paging through results (pagination)"] },
      { n: "11", title: "Indexing in Depth", topics: ["The problem indexes solve", "B+ tree: the default index", "Clustered vs non-clustered", "See an index change a query plan", "Composite indexes and the leftmost-prefix rule", "Covering indexes and index-only scans", "Partial and expression indexes", "Why my index is NOT used", "Index types beyond B-tree", "The cost of indexes"] },
      { n: "12", title: "Query Execution and Optimization", topics: ["The optimizer is cost-based", "Reading EXPLAIN", "Scan types", "Join algorithms in action", "Statistics and misestimates", "The tuning checklist", "Common anti-patterns"] },
    ],
  },
  {
    id: "IV",
    title: "Transactions, Concurrency and Failure Recovery",
    icon: LockKeyhole,
    summary: "ACID, isolation anomalies with live demos, MVCC, locking, deadlocks, WAL and crash recovery.",
    chapters: [
      { n: "13", title: "Transactions and ACID", topics: ["Why transactions exist", "BEGIN, COMMIT and ROLLBACK", "Autocommit", "Savepoints: partial rollback", "Transactions in application code", "Transaction best practices"] },
      { n: "14", title: "Isolation Levels and Concurrency Anomalies", topics: ["The problem: concurrency", "The anomalies", "The four standard isolation levels", "Demo 1: non-repeatable read at READ COMMITTED", "Demo 2: REPEATABLE READ keeps a stable snapshot (and no phantoms in PostgreSQL)", "Demo 3: lost update", "Demo 4: write skew: snapshot isolation is not serializable", "Setting the isolation level"] },
      { n: "15", title: "Locking, MVCC and Deadlocks", topics: ["Two ways to isolate: locks and versions", "MVCC: how PostgreSQL keeps versions", "Lock modes", "Pessimistic locking: SELECT ... FOR UPDATE", "Optimistic locking: detect conflicts instead of preventing them", "Deadlocks", "Finding blockers in production", "Other lock concepts to mention"] },
      { n: "16", title: "Durability, WAL, Failures and Recovery", topics: ["The durability problem", "Crash recovery: a real experiment", "What can fail? A failure catalogue", "Backups: the last line of defence", "RPO and RTO"] },
    ],
  },
  {
    id: "V",
    title: "Scaling and Distributed Databases",
    icon: Network,
    summary: "Replication, partitioning, sharding, caching and distributed consistency, explained as an interview roadmap.",
    chapters: [
      { n: "17", title: "Scaling Databases: The Roadmap", topics: ["Scaling is about bottlenecks", "Vertical vs horizontal scaling", "Read-heavy vs write-heavy", "Back-of-envelope numbers worth knowing"] },
      { n: "18", title: "Replication and High Availability", topics: ["What replication does", "Real experiment: a streaming replica", "Synchronous vs asynchronous replication", "Replication lag and its anomalies", "Physical vs logical replication", "Failover and split brain", "Consensus in one paragraph", "Leaderless quorums", "HA checklist for an interview answer"] },
      { n: "19", title: "Partitioning", topics: ["What and why", "Hands-on: monthly range partitions", "Rules and gotchas", "Horizontal vs vertical partitioning", "Partitioning vs sharding"] },
      { n: "20", title: "Sharding", topics: ["What is sharding?", "Choosing the shard key (the most important decision)", "Strategies compared", "Consistent hashing, proven in code", "Global unique IDs across shards", "What sharding breaks (and the workarounds)", "Resharding without downtime", "When NOT to shard"] },
      { n: "21", title: "Caching and Connection Pooling", topics: ["Why a cache", "Hard problems", "Connection pooling"] },
      { n: "22", title: "Distributed Transactions and Consistency", topics: ["CAP theorem", "Consistency models, strongest to weakest", "ACID vs BASE", "Two-Phase Commit (2PC)", "Saga: a sequence of local transactions with compensations", "The transactional outbox", "Idempotency: making retries safe"] },
      { n: "23", title: "SQL vs NoSQL, OLTP vs OLAP and NewSQL", topics: ["SQL vs NoSQL", "OLTP vs OLAP", "NewSQL and distributed SQL", "Quick decision guide"] },
    ],
  },
  {
    id: "VI",
    title: "Security, Interview Bank and Cheat Sheets",
    icon: ShieldCheck,
    summary: "Lock the database down, drill the full question bank and finish with a 7-day revision plan.",
    chapters: [
      { n: "24", title: "Database Security", topics: ["SQL injection", "Authentication, roles and least privilege", "Row-Level Security (RLS)", "Protecting data at rest and in transit"] },
      { n: "25", title: "Interview Question Bank", topics: ["A. SQL and database basics", "B. Querying", "C. Design and normalization", "D. Indexing and performance", "E. Transactions and concurrency", "F. Durability, failures and recovery", "G. Scaling and distributed databases", "H. Eight scenario questions"] },
      { n: "26", title: "Cheat Sheets and 7-Day Revision Plan", topics: ["SQL syntax cheat sheet", "Window function cheat sheet", "Isolation levels at a glance", "Index cheat sheet", "Error codes worth recognising (PostgreSQL SQLSTATE)", "PostgreSQL vs MySQL (InnoDB): talking points", "Failure and scaling quick reference", "7-day revision plan", "Interview-day checklist", "Glossary", "Final words"] },
    ],
  },
];

const highlights = [
  { icon: Code2, title: "Run every example", text: "Each chapter uses one sample database, so queries, plans and results can be reproduced on your own machine." },
  { icon: Workflow, title: "Real experiments", text: "Crash recovery, a streaming replica, monthly partitions and four isolation-level demos, not just diagrams." },
  { icon: Clock3, title: "Built for interviews", text: "14 classic problems, a 7-day revision plan, an interview-day checklist and eight scenario questions." },
  { icon: Layers3, title: "From queries to scale", text: "One path from SELECT and joins through indexing, transactions, replication and sharding." },
];

const flowSteps = [
  { title: "Learn the query", text: "SELECT, joins, CTEs and window functions" },
  { title: "Design the schema", text: "Keys, normal forms and trade-offs" },
  { title: "Make it fast", text: "Indexes, EXPLAIN and the optimizer" },
  { title: "Keep it correct", text: "Transactions, isolation and locking" },
  { title: "Survive failure", text: "WAL, backups, RPO and RTO" },
  { title: "Scale it out", text: "Replication, partitioning and sharding" },
];

// Short, self-contained answers so search engines and AI assistants can quote them.
const QUICK_ANSWER =
  "The SQL & Database Interview Handbook is a 26-chapter ebook that covers everything a backend or data interview asks about databases: SQL queries (joins, CTEs, window functions), schema design and normalization, indexing and query optimization, transactions and isolation levels, MVCC and locking, WAL and recovery, and scaling with replication, partitioning and sharding. It includes 14 classic SQL problems, an interview question bank and a 7-day revision plan.";

const FAQS = [
  { q: "What is the SQL & Database Interview Handbook?", a: "It is a Target Trek ebook of 26 chapters in 6 parts that takes you from SQL basics to database internals and distributed systems. It covers SQL queries, joins, window functions, schema design, indexing, query optimization, transactions, isolation levels, MVCC, locking, replication, sharding, security and a full interview question bank." },
  { q: "Which SQL topics does the book cover?", a: "SELECT and execution order, NULL handling, aggregation, all join types including anti-joins and self joins, subqueries, EXISTS vs IN, CTEs, recursive CTEs, LATERAL, set operations, window functions (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, running totals), DDL, DML, UPSERT, views, stored procedures and triggers." },
  { q: "Does it include classic SQL interview problems?", a: "Yes. Chapter 6 solves 14 classic problems: second and Nth highest salary, finding and deleting duplicates, top 3 salaries per department, gaps and islands, running totals, month-over-month growth, median salary, pivots with conditional aggregation and customers spending above average." },
  { q: "Does the book explain indexing and query optimization?", a: "Yes. It covers B+ trees, clustered vs non-clustered indexes, composite indexes and the leftmost-prefix rule, covering indexes, partial and expression indexes, why an index is not used, index types beyond B-tree, reading EXPLAIN, scan types, join algorithms, statistics and a tuning checklist." },
  { q: "Are transactions, isolation levels and locking covered?", a: "Yes. Part IV explains ACID, savepoints, the four standard isolation levels, and runs four live demos: non-repeatable read, stable snapshots, lost update and write skew. It also covers MVCC, lock modes, SELECT ... FOR UPDATE, optimistic locking, deadlocks and WAL-based crash recovery." },
  { q: "Does it cover scaling, replication and sharding?", a: "Yes. Part V covers vertical vs horizontal scaling, replication and high availability, failover and split brain, partitioning, choosing a shard key, consistent hashing, resharding, caching, connection pooling, CAP theorem, two-phase commit, sagas, the transactional outbox and idempotency." },
  { q: "Is the book based on PostgreSQL or MySQL?", a: "Examples and experiments use PostgreSQL, and the book includes a PostgreSQL vs MySQL (InnoDB) chapter section with interview talking points. Core SQL and concepts apply to any relational database." },
  { q: "Who is this book for?", a: "Backend developers, full-stack engineers, data and analytics candidates, and anyone preparing for SQL or database rounds at product companies. It works for beginners starting from keys and constraints and for experienced engineers revising internals and scaling." },
  { q: "How long does it take to prepare with this book?", a: "The final chapter includes a 7-day revision plan, an interview-day checklist and cheat sheets for SQL syntax, window functions, isolation levels and indexes, so you can structure your preparation in a week." },
  { q: "How does checkout work and what format is it?", a: "It is a digital ebook with instant access after checkout, and payment opens in a secure checkout window. Digital products are non-refundable after purchase. For help write to supporttargettrek@gmail.com." },
];

export const sqlStyles = `
/* ---------- shared ---------- */
.sql-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
.tk-kw { color: #FDBA74; font-weight: 700; }
.tk-fn { color: #7DD3FC; }
.tk-str { color: #86EFAC; }
.tk-num { color: #FCA5A5; }
.tk-cm { color: #8F857B; font-style: italic; }
@keyframes sqlBob { 0%,100% { translate: 0 0; } 50% { translate: 0 -10px; } }
@keyframes sqlBlob { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(30px,-24px,0) scale(1.15); } }
@keyframes sqlBlink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
@keyframes sqlMarquee { to { transform: translateX(-50%); } }
@keyframes sqlPanelIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes sqlRowIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: none; } }

/* ---------- hero ---------- */
.sql-hero { padding: 56px 0 72px; overflow: hidden; }
.sql-hero-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.sql-blob { position: absolute; border-radius: 50%; filter: blur(70px); opacity: .55; animation: sqlBlob 11s ease-in-out infinite; }
.sql-blob-a { width: 380px; height: 380px; right: -60px; top: -80px; background: color-mix(in srgb, var(--accent) 45%, transparent); }
.sql-blob-b { width: 300px; height: 300px; left: -80px; bottom: -120px; background: color-mix(in srgb, #F59E0B 40%, transparent); animation-delay: -5s; }
.sql-gridlines { position: absolute; inset: 0; background-image: linear-gradient(color-mix(in srgb, var(--accent) 10%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--accent) 10%, transparent) 1px, transparent 1px); background-size: 44px 44px; mask-image: radial-gradient(ellipse at 70% 40%, #000 10%, transparent 70%); -webkit-mask-image: radial-gradient(ellipse at 70% 40%, #000 10%, transparent 70%); }
.sql-hero .lld-hero-grid { z-index: 1; align-items: center; }
.sql-hero h1 { font-size: clamp(34px, 5.2vw, 60px); }
.sql-rotator { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin: 0 0 14px; font-size: 14px; font-weight: 700; color: var(--hero-muted); }
.sql-rotator-word { display: inline-flex; min-width: 168px; padding: 5px 12px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent); font-weight: 900; font-size: 13px; }
.sql-trust { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
.sql-trust span { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border: 1px solid var(--hero-eyebrow-border); border-radius: 999px; background: var(--hero-eyebrow-bg); color: var(--hero-text); font-size: 12px; font-weight: 800; }
.sql-trust svg { color: var(--accent); }

.sql-stage { --mx: 0; --my: 0; position: relative; display: grid; place-items: center; padding: 30px 0 40px; min-width: 0; }
.sql-term { position: relative; z-index: 2; width: 100%; max-width: 560px; border-radius: 18px; background: #1C1917; color: #F5E9DC; border: 1px solid rgba(253,186,116,.3); box-shadow: 0 34px 80px rgba(32,19,12,.38), 0 0 0 1px rgba(255,255,255,.03) inset; overflow: hidden; transform: perspective(1100px) rotateY(calc(var(--mx) * -5deg)) rotateX(calc(var(--my) * 4deg)); transition: transform .25s ease-out; animation: sqlBob 6.5s ease-in-out infinite; }
.sql-term-bar { display: flex; align-items: center; gap: 12px; padding: 11px 14px; background: #26211D; border-bottom: 1px solid rgba(253,186,116,.16); }
.sql-dots { display: flex; gap: 6px; }
.sql-dots i { width: 10px; height: 10px; border-radius: 50%; background: #F87171; }
.sql-dots i:nth-child(2) { background: #FBBF24; }
.sql-dots i:nth-child(3) { background: #4ADE80; }
.sql-term-title { color: #CDBFB1; font-size: 11px; font-weight: 700; }
.sql-term-badge { margin-left: auto; padding: 3px 9px; border-radius: 999px; background: rgba(249,115,22,.16); color: #FDBA74; font-size: 10px; font-weight: 800; white-space: nowrap; }
.sql-term-code { margin: 0; padding: 16px 18px; min-height: 176px; font: 12.5px/1.75 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; white-space: pre-wrap; word-break: break-word; color: #F5E9DC; }
.sql-caret { display: inline-block; width: 7px; height: 15px; margin-left: 2px; vertical-align: -2px; background: #FB923C; animation: sqlBlink 1s steps(1) infinite; }
.sql-result { border-top: 1px solid rgba(253,186,116,.16); background: #171411; min-height: 138px; }
.sql-result-head { display: flex; justify-content: space-between; gap: 8px; padding: 9px 16px; color: #A39689; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.sql-result-head b { color: #4ADE80; }
.sql-table { width: 100%; border-collapse: collapse; font: 11.5px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; }
.sql-table th { padding: 6px 16px; text-align: left; color: #FDBA74; font-weight: 800; border-bottom: 1px solid rgba(253,186,116,.14); }
.sql-table td { padding: 6px 16px; color: #E9DDD0; border-bottom: 1px solid rgba(255,255,255,.05); }
.sql-table tbody tr { animation: sqlRowIn .4s ease both; }
.sql-dotsbar { display: flex; gap: 6px; justify-content: center; margin-top: 12px; }
.sql-dotsbar i { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,.2); transition: all .3s; }
.sql-dotsbar i.on { width: 20px; border-radius: 4px; background: #FB923C; }
.sql-chip { position: absolute; z-index: 3; display: flex; align-items: center; gap: 8px; padding: 9px 12px; border: 1px solid var(--chip-border); border-radius: 14px; background: var(--chip-bg); color: var(--chip-text); box-shadow: var(--chip-shadow); font-size: 11px; font-weight: 800; backdrop-filter: blur(10px); animation: sqlBob 5s ease-in-out infinite; }
.sql-chip-a { top: 0; right: 0; }
.sql-chip-b { bottom: 8px; left: -8px; animation-delay: -2s; }
.sql-mini-book { position: absolute; z-index: 3; right: -14px; bottom: -4px; width: 96px; aspect-ratio: .72; border-radius: 4px 10px 10px 4px; overflow: hidden; background: linear-gradient(150deg,#221B17,#482919 65%,#9A3412); border: 1px solid rgba(253,186,116,.4); box-shadow: 12px 16px 30px rgba(32,19,12,.4); rotate: 6deg; animation: sqlBob 5.5s ease-in-out infinite; animation-delay: -1s; }
.sql-mini-book img { width: 100%; height: 100%; object-fit: cover; display: block; }
.sql-mini-book div { display: flex; height: 100%; flex-direction: column; justify-content: flex-end; padding: 9px; color: #fff; font-size: 14px; font-weight: 900; line-height: 1.05; }
.sql-mini-book small { display: block; margin-bottom: 4px; color: #FDBA74; font-size: 6px; letter-spacing: .12em; text-transform: uppercase; }

/* ---------- marquee ---------- */
.sql-marquee { overflow: hidden; border-block: 1px solid var(--border); background: var(--surface); padding: 14px 0; mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
.sql-marquee-track { display: flex; gap: 12px; width: max-content; animation: sqlMarquee 38s linear infinite; }
.sql-marquee:hover .sql-marquee-track { animation-play-state: paused; }
.sql-marquee-track span { padding: 7px 16px; border: 1px solid var(--border); border-radius: 999px; background: var(--surface-2); color: var(--text); font-size: 12px; font-weight: 800; white-space: nowrap; }
.sql-marquee-track span:nth-child(3n) { color: var(--accent); background: var(--soft); }

/* ---------- quick answer + highlights ---------- */
.sql-marquee + .lld-shell .lld-stats { margin-top: 30px; }
.sql-lessons, .sql-lessons .lld-shell, .sql-lesson > * { min-width: 0; }
.sql-code pre { max-width: 100%; }
.sql-quick { max-width: 880px; margin: 0 auto; padding: 22px 24px; border: 1px solid var(--border); border-left: 4px solid var(--accent); border-radius: 16px; background: var(--surface); }
.sql-quick h2 { margin: 6px 0 10px; font-size: clamp(20px, 3vw, 26px); }
.sql-quick p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.8; }
.sql-highlights { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.sql-highlight { padding: 20px; }
.sql-highlight h3 { margin: 14px 0 6px; font-size: 15px; }
.sql-highlight p { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.7; }

/* ---------- tab rails (lessons + parts) ---------- */
.sql-rail { display: flex; gap: 8px; overflow-x: auto; padding: 4px 2px 12px; scroll-snap-type: x proximity; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.sql-rail::-webkit-scrollbar { display: none; }
.sql-rail-wrap { position: relative; }
.sql-pill { flex: none; scroll-snap-align: start; padding: 10px 16px; border: 1px solid var(--border); border-radius: 999px; background: var(--surface); color: var(--muted); font-size: 12.5px; font-weight: 800; cursor: pointer; transition: all .25s ease; white-space: nowrap; }
.sql-pill:hover { color: var(--accent); border-color: var(--accent); translate: 0 -2px; }
.sql-pill.is-active { background: linear-gradient(110deg, #EA580C, #F97316); color: #fff; border-color: transparent; box-shadow: 0 10px 22px rgba(234,88,12,.28); }

/* ---------- free lessons ---------- */
.sql-lessons { background: radial-gradient(ellipse at 15% 0%, color-mix(in srgb, var(--accent) 9%, transparent), transparent 55%); }
.sql-lesson { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); width: 100%; gap: 22px; align-items: start; margin-top: 8px; animation: sqlPanelIn .5s cubic-bezier(.22,1,.36,1) both; }
.sql-lesson[hidden] { display: none; }
.sql-lesson-info { padding: 24px; }
.sql-lesson-meta { display: flex; flex-wrap: wrap; gap: 8px; }
.sql-badge { padding: 4px 10px; border-radius: 999px; background: var(--soft); color: var(--accent); font-size: 10px; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }
.sql-badge.easy { background: rgba(22,163,74,.14); color: #16a34a; }
.sql-badge.medium { background: rgba(245,158,11,.16); color: #d97706; }
.sql-badge.hard { background: rgba(239,68,68,.14); color: #dc2626; }
.sql-lesson-info h3 { margin: 14px 0 8px; font-size: clamp(19px, 2.4vw, 24px); line-height: 1.2; }
.sql-lesson-info p { margin: 0; color: var(--muted); font-size: 13.5px; line-height: 1.75; }
.sql-tip { display: flex; gap: 10px; margin-top: 18px; padding: 14px; border: 1px dashed color-mix(in srgb, var(--accent) 50%, var(--border)); border-radius: 14px; background: color-mix(in srgb, var(--accent) 7%, var(--surface)); color: var(--text); font-size: 12.5px; line-height: 1.65; }
.sql-tip svg { flex: none; margin-top: 2px; color: var(--accent); }
.sql-code { min-width: 0; border-radius: 18px; background: #1C1917; border: 1px solid rgba(253,186,116,.26); box-shadow: 0 24px 56px rgba(32,19,12,.28); overflow: hidden; }
.sql-code-bar { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #26211D; border-bottom: 1px solid rgba(253,186,116,.15); }
.sql-code-name { color: #CDBFB1; font-size: 11px; font-weight: 700; }
.sql-copy { display: inline-flex; align-items: center; gap: 6px; margin-left: auto; padding: 6px 11px; border: 1px solid rgba(253,186,116,.28); border-radius: 9px; background: transparent; color: #FDBA74; font-size: 11px; font-weight: 800; cursor: pointer; transition: background .2s; }
.sql-copy:hover { background: rgba(249,115,22,.16); }
.sql-code pre { margin: 0; padding: 16px 18px; overflow-x: auto; -webkit-overflow-scrolling: touch; font: 12.5px/1.8 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #F5E9DC; tab-size: 2; }
.sql-out { border-top: 1px solid rgba(253,186,116,.16); background: #171411; }
.sql-out-label { padding: 9px 16px 0; color: #4ADE80; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.sql-out pre { padding-top: 6px; color: #D9CCBE; font-size: 11.5px; }

/* ---------- parts explorer ---------- */
.sql-ptabs { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px; }
.sql-ptab { position: relative; display: flex; flex-direction: column; gap: 6px; padding: 14px; text-align: left; border: 1px solid var(--border); border-radius: 16px; background: var(--surface); color: var(--text); cursor: pointer; transition: all .3s cubic-bezier(.22,1,.36,1); overflow: hidden; }
.sql-ptab:hover { translate: 0 -4px; border-color: var(--accent); }
.sql-ptab-num { font-size: 22px; font-weight: 900; letter-spacing: -.04em; color: var(--accent); line-height: 1; }
.sql-ptab-title { font-size: 12px; font-weight: 800; line-height: 1.3; }
.sql-ptab-meta { font-size: 10px; font-weight: 700; color: var(--muted); }
.sql-ptab.is-active { border-color: transparent; background: linear-gradient(145deg, #EA580C, #F97316 70%, #FB923C); color: #fff; box-shadow: 0 16px 34px rgba(234,88,12,.32); translate: 0 -4px; }
.sql-ptab.is-active .sql-ptab-num, .sql-ptab.is-active .sql-ptab-meta { color: rgba(255,255,255,.86); }
.sql-panel { position: relative; margin-top: 18px; padding: 26px; overflow: hidden; animation: sqlPanelIn .5s cubic-bezier(.22,1,.36,1) both; }
.sql-panel[hidden] { display: none; }
.sql-panel-mark { position: absolute; right: 18px; top: -18px; font-size: 150px; font-weight: 900; letter-spacing: -.06em; color: var(--soft); line-height: 1; pointer-events: none; user-select: none; }
.sql-panel-head { position: relative; display: flex; gap: 14px; align-items: flex-start; max-width: 720px; }
.sql-panel-head h3 { margin: 2px 0 6px; font-size: clamp(19px, 2.6vw, 25px); }
.sql-panel-head p { margin: 0; color: var(--muted); font-size: 13.5px; line-height: 1.7; }
.sql-panel-stats { position: relative; display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.sql-ch-grid { position: relative; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 290px), 1fr)); gap: 14px; margin-top: 22px; }
.sql-ch { display: flex; flex-direction: column; padding: 18px; border: 1px solid var(--border); border-radius: 18px; background: var(--surface-2); animation: sqlPanelIn .55s cubic-bezier(.22,1,.36,1) both; animation-delay: calc(var(--i, 0) * 55ms); transition: translate .3s ease, border-color .3s ease, box-shadow .3s ease; }
.sql-ch:hover { translate: 0 -4px; border-color: color-mix(in srgb, var(--accent) 55%, var(--border)); box-shadow: 0 18px 38px rgba(234,88,12,.13); }
.sql-ch-top { display: flex; align-items: center; gap: 11px; }
.sql-ch-n { flex: none; display: grid; place-items: center; min-width: 36px; height: 36px; padding: 0 6px; border-radius: 11px; background: linear-gradient(135deg, #EA580C, #FB923C); color: #fff; font-size: 13px; font-weight: 900; box-shadow: 0 8px 16px rgba(234,88,12,.25); }
.sql-ch h4 { margin: 0; font-size: 14.5px; line-height: 1.3; color: var(--text); }
.sql-ch ul { margin: 14px 0 0; padding: 0; list-style: none; display: grid; gap: 7px; }
.sql-ch li { position: relative; padding-left: 20px; color: var(--muted); font-size: 12px; line-height: 1.5; }
.sql-ch li::before { content: ""; position: absolute; left: 3px; top: 6px; width: 8px; height: 8px; border-radius: 50%; border: 2px solid var(--accent); }
.sql-ch li.is-extra { display: none; }
.sql-ch.is-open li.is-extra { display: block; }
.sql-more { align-self: flex-start; margin-top: 14px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 999px; background: var(--surface); color: var(--accent); font-size: 11px; font-weight: 800; cursor: pointer; transition: all .2s; }
.sql-more:hover { border-color: var(--accent); background: var(--soft); }

.sql-related { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 22px; }

/* ---------- responsive ---------- */
@media (max-width: 1100px) { .sql-ptabs { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 950px) {
  .sql-highlights { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sql-lesson { grid-template-columns: minmax(0, 1fr); }
  .sql-hero .lld-hero-grid { grid-template-columns: minmax(0, 1fr); }
  .sql-hero .lld-hero-grid > * { min-width: 0; }
  .sql-stage { padding-top: 10px; }
  .sql-term { max-width: 620px; }
}
@media (max-width: 720px) {
  .sql-hero { padding: 30px 0 44px; }
  .sql-hero h1 { font-size: clamp(32px, 9vw, 42px); }
  .sql-rotator-word { min-width: 0; }
  .sql-trust span { font-size: 11px; padding: 6px 10px; }
  .sql-mini-book { display: none; }
  .sql-chip-a { top: -6px; right: 4px; }
  .sql-chip-b { left: 0; bottom: 2px; }
  .sql-term-code { padding: 13px 14px; font-size: 11.5px; min-height: 160px; }
  .sql-table { font-size: 10.5px; }
  .sql-table th, .sql-table td { padding: 5px 10px; }
  .sql-result { min-height: 124px; }
  .sql-rail { margin-inline: -14px; padding-inline: 14px; }
  .sql-ptabs { display: flex; gap: 8px; overflow-x: auto; margin-inline: -14px; padding: 4px 14px 12px; scroll-snap-type: x proximity; scrollbar-width: none; }
  .sql-ptabs::-webkit-scrollbar { display: none; }
  .sql-ptab { flex: none; width: 148px; scroll-snap-align: start; }
  .sql-panel { padding: 18px 16px; border-radius: 20px; }
  .sql-panel-mark { font-size: 96px; top: -8px; right: 8px; }
  .sql-ch-grid { gap: 10px; margin-top: 18px; }
  .sql-lesson-info { padding: 18px; }
  .sql-code pre { padding: 13px 14px; font-size: 11.5px; line-height: 1.75; }
  .sql-quick { padding: 18px; }
  .sql-highlights { grid-template-columns: 1fr; gap: 10px; }
  .sql-highlight { padding: 16px; }
  .sql-marquee { padding: 10px 0; }
}
@media (max-width: 520px) {
  .sql-chip { display: none; }
  .sql-stage { padding: 4px 0 8px; }
  .sql-term-badge { display: none; }
  .sql-hero .lld-hero-actions .lld-cta { width: 100%; }
  .sql-related .lld-cta { width: 100%; }
  .sql-pill { padding: 9px 13px; font-size: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .sql-term, .sql-chip, .sql-mini-book, .sql-blob, .sql-marquee-track, .sql-caret, .sql-lesson, .sql-panel, .sql-ch, .sql-table tbody tr { animation: none !important; }
  .sql-marquee-track { flex-wrap: wrap; width: auto; justify-content: center; }
  .sql-term { transform: none; }
}
`;

const KEYWORDS = new Set(
  "SELECT FROM WHERE GROUP BY ORDER HAVING JOIN LEFT RIGHT INNER OUTER FULL ON AS AND OR NOT IN EXISTS NULL IS WITH RECURSIVE UNION ALL DISTINCT LIMIT OVER PARTITION DESC ASC CASE WHEN THEN ELSE END CREATE INDEX TABLE INSERT INTO VALUES UPDATE SET DELETE BEGIN COMMIT ROLLBACK FOR EXPLAIN ANALYZE USING BETWEEN".split(" "),
);
const FUNCS = new Set(
  "MAX MIN COUNT SUM AVG DENSE_RANK RANK ROW_NUMBER LAG LEAD COALESCE".split(" "),
);

function Highlight({ code }) {
  const out = [];
  const re = /(--[^\n]*)|('(?:[^']|'')*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|([\s\S])/g;
  let m;
  let i = 0;
  while ((m = re.exec(code)) !== null) {
    const [text, comment, str, num, word] = m;
    let cls = null;
    if (comment) cls = "tk-cm";
    else if (str) cls = "tk-str";
    else if (num) cls = "tk-num";
    else if (word) {
      const up = word.toUpperCase();
      if (FUNCS.has(up)) cls = "tk-fn";
      else if (KEYWORDS.has(up)) cls = "tk-kw";
    }
    out.push(cls ? <span key={i} className={cls}>{text}</span> : <React.Fragment key={i}>{text}</React.Fragment>);
    i += 1;
  }
  return <>{out}</>;
}

const HERO_QUERIES = [
  {
    file: "top_earners.sql",
    sql: "SELECT name, dept, salary,\n  RANK() OVER (\n    PARTITION BY dept\n    ORDER BY salary DESC\n  ) AS rnk\nFROM employees;",
    cols: ["name", "dept", "salary", "rnk"],
    rows: [["Asha", "Eng", "190000", "1"], ["Ravi", "Eng", "165000", "2"], ["Meera", "Sales", "120000", "1"]],
    ms: "0.6 ms",
  },
  {
    file: "explain_index.sql",
    sql: "-- Why is this query slow?\nEXPLAIN ANALYZE\nSELECT * FROM orders\nWHERE customer_id = 42;",
    cols: ["plan", "time"],
    rows: [["Seq Scan (no index)", "182 ms"], ["Index Scan idx_cust", "0.04 ms"], ["Rows removed by filter", "0"]],
    ms: "0.1 ms",
  },
  {
    file: "safe_transfer.sql",
    sql: "BEGIN;\nSELECT balance FROM accounts\n  WHERE id = 1 FOR UPDATE;\nUPDATE accounts\n  SET balance = balance - 500\n  WHERE id = 1;\nCOMMIT;",
    cols: ["step", "effect"],
    rows: [["BEGIN", "transaction started"], ["FOR UPDATE", "row id=1 locked"], ["COMMIT", "lock released"]],
    ms: "1.2 ms",
  },
];

function HeroTerminal({ reduce }) {
  const [qi, setQi] = useState(0);
  const [n, setN] = useState(reduce ? HERO_QUERIES[0].sql.length : 0);
  const [showRes, setShowRes] = useState(Boolean(reduce));
  const q = HERO_QUERIES[qi];

  useEffect(() => {
    if (reduce) return undefined;
    let t;
    if (n < q.sql.length) {
      const nl = q.sql[n] === "\n";
      t = setTimeout(() => setN(n + (nl ? 1 : 2)), nl ? 110 : 24);
    } else if (!showRes) {
      t = setTimeout(() => setShowRes(true), 260);
    } else {
      t = setTimeout(() => {
        setShowRes(false);
        setN(0);
        setQi((qi + 1) % HERO_QUERIES.length);
      }, 3400);
    }
    return () => clearTimeout(t);
  }, [n, qi, showRes, reduce, q.sql]);

  const typed = q.sql.slice(0, n);
  return (
    <div className="sql-term" role="img" aria-label="Animated example of SQL queries running in a PostgreSQL terminal">
      <div className="sql-term-bar">
        <span className="sql-dots"><i /><i /><i /></span>
        <span className="sql-term-title sql-mono">{q.file}</span>
        <span className="sql-term-badge">PostgreSQL</span>
      </div>
      <pre className="sql-term-code" aria-hidden="true">
        <Highlight code={typed} />
        {!reduce && <span className="sql-caret" />}
      </pre>
      <div className="sql-result" aria-hidden="true">
        <div className="sql-result-head">
          <span>Result{showRes ? ` · ${q.rows.length} rows` : ""}</span>
          {showRes && <b>✓ {q.ms}</b>}
        </div>
        {showRes && (
          <table className="sql-table">
            <thead><tr>{q.cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>
              {q.rows.map((row, ri) => (
                <tr key={`${qi}-${ri}`} style={{ animationDelay: `${ri * 120}ms` }}>
                  {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="sql-dotsbar" style={{ padding: "0 0 12px", marginTop: 0, background: "#171411" }}>
        {HERO_QUERIES.map((item, i) => <i key={item.file} className={i === qi ? "on" : ""} />)}
      </div>
    </div>
  );
}

const ROTATING_TOPICS = ["Window functions", "Joins & subqueries", "Indexing & EXPLAIN", "Transactions & locks", "Replication & sharding"];

function RotatingTopic({ reduce }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return undefined;
    const id = setInterval(() => setI((v) => (v + 1) % ROTATING_TOPICS.length), 2200);
    return () => clearInterval(id);
  }, [reduce]);
  return (
    <div className="sql-rotator">
      <span>Now learning</span>
      <span className="sql-rotator-word" aria-live="off">
        <AnimatePresence mode="wait">
          <motion.span
            key={ROTATING_TOPICS[i]}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {ROTATING_TOPICS[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

const MARQUEE_TOPICS = [
  "SELECT & NULL", "INNER / LEFT / FULL joins", "Subqueries", "Recursive CTE", "Window functions", "Gaps & islands",
  "Normalization", "Schema design", "B+ tree index", "Covering index", "EXPLAIN", "ACID", "Isolation levels", "MVCC",
  "Deadlocks", "WAL & recovery", "Replication", "Partitioning", "Sharding", "CAP theorem", "Saga & outbox", "SQL injection", "Row-Level Security",
];

const LESSONS = [
  {
    id: "second-highest",
    tab: "2nd highest salary",
    level: "easy",
    chapter: "Ch 6 · Classic problems",
    title: "Second highest salary, without LIMIT tricks",
    intro: "The most asked SQL question. Show two tie-safe answers: a subquery on MAX, and DENSE_RANK that generalises to the Nth highest.",
    file: "second_highest.sql",
    sql: "-- 1) Subquery on MAX: returns NULL if no 2nd value\nSELECT MAX(salary) AS second_highest\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);\n\n-- 2) DENSE_RANK: change 2 to N for the Nth highest\nSELECT DISTINCT salary\nFROM (\n  SELECT salary,\n         DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk\n  FROM employees\n) t\nWHERE rnk = 2;",
    out: " second_highest\n----------------\n         165000",
    tip: "Use DENSE_RANK, not ROW_NUMBER: duplicates of the top salary must not hide the second one.",
  },
  {
    id: "top-n",
    tab: "Top 3 per department",
    level: "medium",
    chapter: "Ch 5 · Window functions",
    title: "Top 3 salaries in each department",
    intro: "Rank inside each group with PARTITION BY, then filter in an outer query. You cannot use a window function directly in WHERE.",
    file: "top_n_per_group.sql",
    sql: "SELECT name, dept_id, salary\nFROM (\n  SELECT name, dept_id, salary,\n         DENSE_RANK() OVER (\n           PARTITION BY dept_id\n           ORDER BY salary DESC\n         ) AS rnk\n  FROM employees\n) ranked\nWHERE rnk <= 3\nORDER BY dept_id, salary DESC;",
    out: " name  | dept_id | salary\n-------+---------+--------\n Asha  |       1 | 190000\n Ravi  |       1 | 165000\n Neha  |       1 | 150000\n Meera |       2 | 120000",
    tip: "Say out loud: window functions run after WHERE and GROUP BY, which is why the filter needs a subquery or CTE.",
  },
  {
    id: "gaps-islands",
    tab: "Gaps & islands",
    level: "hard",
    chapter: "Ch 6 · Classic problems",
    title: "Find consecutive login streaks",
    intro: "Subtract ROW_NUMBER from the date. Consecutive days produce the same constant, so grouping by it gives each streak.",
    file: "login_streaks.sql",
    sql: "SELECT MIN(login_date) AS streak_start,\n       MAX(login_date) AS streak_end,\n       COUNT(*)        AS days\nFROM (\n  SELECT login_date,\n         login_date - (ROW_NUMBER() OVER (\n           ORDER BY login_date))::int AS grp\n  FROM (SELECT DISTINCT login_date FROM logins) d\n) x\nGROUP BY grp\nORDER BY streak_start;",
    out: " streak_start | streak_end | days\n--------------+------------+------\n 2025-03-01   | 2025-03-04 |    4\n 2025-03-09   | 2025-03-10 |    2",
    tip: "De-duplicate dates first, otherwise two logins on one day break the arithmetic.",
  },
  {
    id: "not-in",
    tab: "NOT IN trap",
    level: "medium",
    chapter: "Ch 4 · Subqueries",
    title: "Departments with no employees",
    intro: "NOT IN silently returns zero rows when the subquery contains a NULL. NOT EXISTS (an anti-join) is the safe answer.",
    file: "anti_join.sql",
    sql: "-- Safe: NOT EXISTS\nSELECT d.name\nFROM departments d\nWHERE NOT EXISTS (\n  SELECT 1 FROM employees e\n  WHERE e.dept_id = d.id\n);\n\n-- Same idea with LEFT JOIN\nSELECT d.name\nFROM departments d\nLEFT JOIN employees e ON e.dept_id = d.id\nWHERE e.id IS NULL;",
    out: " name\n---------\n Research",
    tip: "Interviewers love this: explain that x NOT IN (1, NULL) evaluates to UNKNOWN, never TRUE.",
  },
  {
    id: "explain",
    tab: "Index & EXPLAIN",
    level: "medium",
    chapter: "Ch 11-12 · Indexing",
    title: "Make a slow query fast with a composite index",
    intro: "Put the equality column first and the range column second (leftmost-prefix rule), then confirm with EXPLAIN ANALYZE.",
    file: "composite_index.sql",
    sql: "CREATE INDEX idx_orders_cust_date\n  ON orders (customer_id, created_at);\n\nEXPLAIN ANALYZE\nSELECT id, total\nFROM orders\nWHERE customer_id = 42\n  AND created_at >= '2025-01-01';",
    out: " Index Scan using idx_orders_cust_date on orders\n   Index Cond: (customer_id = 42 AND created_at >= '2025-01-01')\n Execution Time: 0.041 ms",
    tip: "An index on (created_at, customer_id) would NOT serve this query as well. Order matters.",
  },
  {
    id: "locking",
    tab: "Safe transfer (locks)",
    level: "hard",
    chapter: "Ch 14-15 · Concurrency",
    title: "Prevent lost updates with SELECT ... FOR UPDATE",
    intro: "Two sessions read the same balance and both write back: one update is lost. Lock the row first so the second session waits.",
    file: "pessimistic_lock.sql",
    sql: "BEGIN;\n\n-- Row is locked until COMMIT / ROLLBACK\nSELECT balance\nFROM accounts\nWHERE id = 1\nFOR UPDATE;\n\nUPDATE accounts\nSET balance = balance - 500\nWHERE id = 1;\n\nCOMMIT;",
    out: "BEGIN\n balance\n---------\n    2000\nUPDATE 1\nCOMMIT",
    tip: "Mention the alternative: optimistic locking with a version column, which detects conflicts instead of preventing them.",
  },
];

export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <button type="button" className="sql-copy" onClick={onCopy} aria-label="Copy SQL code">
      {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
    </button>
  );
}

function FreeLessons({ animation }) {
  const [active, setActive] = useState(LESSONS[0].id);
  return (
    <section className="lld-section sql-lessons" id="free-snippets" aria-labelledby="sql-free-title">
      <div className="lld-shell">
        <motion.div className="lld-section-head" {...animation}>
          <div className="lld-kicker">Free · try before you buy</div>
          <h2 id="sql-free-title">Free SQL interview snippets</h2>
          <p>
            Six real interview problems with ready-to-run PostgreSQL code, the output and the
            talking point interviewers look for. Tap a topic to switch.
          </p>
        </motion.div>
        <div className="sql-rail-wrap">
          <div className="sql-rail" role="tablist" aria-label="Free SQL snippets">
            {LESSONS.map((lesson) => (
              <button
                key={lesson.id}
                type="button"
                role="tab"
                id={`tab-${lesson.id}`}
                aria-selected={active === lesson.id}
                aria-controls={`panel-${lesson.id}`}
                className={`sql-pill${active === lesson.id ? " is-active" : ""}`}
                onClick={() => setActive(lesson.id)}
              >
                {lesson.tab}
              </button>
            ))}
          </div>
        </div>
        {LESSONS.map((lesson) => (
          <div
            key={lesson.id}
            className="sql-lesson"
            role="tabpanel"
            id={`panel-${lesson.id}`}
            aria-labelledby={`tab-${lesson.id}`}
            hidden={active !== lesson.id}
          >
            <div className="lld-card sql-lesson-info">
              <div className="sql-lesson-meta">
                <span className={`sql-badge ${lesson.level}`}>{lesson.level}</span>
                <span className="sql-badge">{lesson.chapter}</span>
              </div>
              <h3>{lesson.title}</h3>
              <p>{lesson.intro}</p>
              <div className="sql-tip">
                <Lightbulb size={16} />
                <span><strong>Interview tip:</strong> {lesson.tip}</span>
              </div>
            </div>
            <div className="sql-code">
              <div className="sql-code-bar">
                <span className="sql-dots"><i /><i /><i /></span>
                <span className="sql-code-name sql-mono">{lesson.file}</span>
                <CopyButton text={lesson.sql} />
              </div>
              <pre><code><Highlight code={lesson.sql} /></code></pre>
              <div className="sql-out">
                <div className="sql-out-label">✓ Output</div>
                <pre>{lesson.out}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChapterCard({ chapter, index }) {
  const [open, setOpen] = useState(false);
  const LIMIT = 4;
  const extra = chapter.topics.length - LIMIT;
  return (
    <article className={`sql-ch${open ? " is-open" : ""}`} style={{ "--i": index }}>
      <div className="sql-ch-top">
        <span className="sql-ch-n">{chapter.n === "0" ? "i" : chapter.n}</span>
        <h4>{chapter.title}</h4>
      </div>
      <ul>
        {chapter.topics.map((topic, ti) => (
          <li key={topic} className={ti >= LIMIT ? "is-extra" : ""}>{topic}</li>
        ))}
      </ul>
      {extra > 0 && (
        <button type="button" className="sql-more" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {open ? "Show less" : `+ ${extra} more topics`}
        </button>
      )}
    </article>
  );
}

function PartsExplorer({ animation }) {
  const [active, setActive] = useState(PARTS[0].id);
  const totalTopics = (part) => part.chapters.reduce((sum, c) => sum + c.topics.length, 0);
  return (
    <section className="lld-section" id="curriculum">
      <div className="lld-shell">
        <motion.div className="lld-section-head" {...animation}>
          <div className="lld-kicker">Complete table of contents</div>
          <h2>Six parts. 26 chapters. Every topic inside.</h2>
          <p>Pick a part to explore its chapters. Tap "more topics" on any chapter to see everything it covers.</p>
        </motion.div>
        <motion.div className="sql-ptabs" role="tablist" aria-label="Book parts" {...animation}>
          {PARTS.map((part) => (
            <button
              key={part.id}
              type="button"
              role="tab"
              id={`ptab-${part.id}`}
              aria-selected={active === part.id}
              aria-controls={`ppanel-${part.id}`}
              className={`sql-ptab${active === part.id ? " is-active" : ""}`}
              onClick={() => setActive(part.id)}
            >
              <span className="sql-ptab-num">{part.id}</span>
              <span className="sql-ptab-title">{part.title}</span>
              <span className="sql-ptab-meta">{part.chapters.length} chapters</span>
            </button>
          ))}
        </motion.div>
        {PARTS.map((part) => {
          const Icon = part.icon;
          return (
            <div
              key={part.id}
              className="lld-card sql-panel"
              role="tabpanel"
              id={`ppanel-${part.id}`}
              aria-labelledby={`ptab-${part.id}`}
              hidden={active !== part.id}
            >
              <span className="sql-panel-mark" aria-hidden="true">{part.id}</span>
              <div className="sql-panel-head">
                <span className="lld-module-icon"><Icon size={19} /></span>
                <div>
                  <div className="lld-kicker">Part {part.id}</div>
                  <h3>{part.title}</h3>
                  <p>{part.summary}</p>
                </div>
              </div>
              <div className="sql-panel-stats">
                <span className="sql-badge">{part.chapters.length} chapters</span>
                <span className="sql-badge">{totalTopics(part)} topics</span>
              </div>
              <div className="sql-ch-grid">
                {part.chapters.map((chapter, index) => (
                  <ChapterCard chapter={chapter} index={index} key={chapter.n + chapter.title} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function SqlInterviewHandbook({ navbarOffset = 64 }) {
  const reduceMotion = useReducedMotion();
  const [theme, setTheme] = useState(readTheme);
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const heroRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleStageMove = (event) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", (((event.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3));
    event.currentTarget.style.setProperty("--my", (((event.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3));
  };
  const handleStageLeave = (event) => {
    event.currentTarget.style.setProperty("--mx", "0");
    event.currentTarget.style.setProperty("--my", "0");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referralCode = (params.get("referralCode") || params.get("ref") || "").trim();
    if (referralCode) window.localStorage.setItem("referralCode", referralCode);
  }, []);

  useEffect(() => {
    setTheme(readTheme());
    const onTheme = (event) => {
      const next = event?.detail?.theme;
      if (next === "dark" || next === "light") setTheme(next);
    };
    const onStorage = (event) => {
      if (event.key === THEME_KEY && (event.newValue === "dark" || event.newValue === "light")) setTheme(event.newValue);
    };
    window.addEventListener(THEME_EVENT, onTheme);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(THEME_EVENT, onTheme);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoadingProduct(true);
        setProductError("");
        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(window.location.pathname)}`,
          { method: "GET", cache: "no-store", headers: { Accept: "application/json" }, signal: controller.signal },
        );
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.success || !result?.data) {
          throw new Error(result?.error?.message || result?.message || "Unable to load the current product details.");
        }
        setProduct(result.data);
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("Failed to fetch SQL product:", error);
        setProduct(null);
        setProductError(error?.message || "Unable to load the current product details.");
      } finally {
        if (!controller.signal.aborted) setLoadingProduct(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const trackedViewRef = useRef(null);
  useEffect(() => {
    if (!product?._id || product.price == null) return;
    const amount = Number(product.price);
    if (!Number.isFinite(amount) || amount < 0) return;
    const key = `${product._id}:${amount}:${product.currency || "INR"}`;
    if (trackedViewRef.current === key) return;
    const sent = trackViewContent({
      id: String(product._id),
      title: product.title || "SQL & Database Interview Handbook",
      price: amount,
      currency: product.currency || "INR",
    });
    if (sent !== false) trackedViewRef.current = key;
  }, [product?._id, product?.title, product?.price, product?.currency]);

  const currency = product?.currency || "INR";
  const currentPrice = Number(product?.price);
  const validPrice = product?.price != null && product.price !== "" && Number.isFinite(currentPrice) && currentPrice >= 0;
  const mrp = Number(product?.mrp ?? 0);
  const discount = mrp > currentPrice && mrp > 0 ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0;
  const formatMoney = (amount, code = currency) => {
    const locale = { INR: "en-IN", USD: "en-US", GBP: "en-GB", EUR: "en-IE", AUD: "en-AU", CAD: "en-CA" }[code] || "en";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: code,
        maximumFractionDigits: Number.isInteger(Number(amount)) ? 0 : 2,
      }).format(Number(amount || 0));
    } catch {
      return `${code} ${Number(amount || 0)}`;
    }
  };
  const canBuy = !loadingProduct && !productError && validPrice && Boolean(product?._id) && product?.isActive !== false;
  const displayedPrice = loadingProduct ? "Loading" : productError || !validPrice ? "Unavailable" : formatMoney(currentPrice);
  const openCheckout = () => {
    if (canBuy) setCheckoutOpen(true);
  };

  const animation = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 28, scale: 0.96 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        viewport: { once: true, amount: 0.16 },
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
      };

  const productName = product?.title || "SQL & Database Interview Handbook";
  const seoImage = product?.coverpageurl || product?.coverPageUrl || product?.cover_page_url || "";
  const allChapters = PARTS.flatMap((part) => part.chapters.map((chapter) => ({ ...chapter, part: part.title })));

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, email: SUPPORT_EMAIL },
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, publisher: { "@id": `${SITE_URL}/#organization` } },
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: SEO_TITLE,
        description: SEO_DESCRIPTION,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${PAGE_URL}#book` },
        speakable: { "@type": "SpeakableSpecification", cssSelector: ["#sql-quick-answer", "#faq"] },
        ...(seoImage ? { primaryImageOfPage: { "@type": "ImageObject", url: seoImage } } : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
          { "@type": "ListItem", position: 3, name: "SQL & Database Interview Handbook", item: PAGE_URL },
        ],
      },
      {
        "@type": "Book",
        "@id": `${PAGE_URL}#book`,
        name: productName,
        description: SEO_LONG_DESCRIPTION,
        url: PAGE_URL,
        bookFormat: "https://schema.org/EBook",
        inLanguage: "en",
        about: ["SQL", "Database design", "Indexing", "Transactions", "Database scaling"],
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        ...(seoImage ? { image: seoImage } : {}),
      },
      {
        "@type": "Product",
        "@id": `${PAGE_URL}#product`,
        name: productName,
        description: SEO_LONG_DESCRIPTION,
        url: PAGE_URL,
        category: "SQL and Database Interview Ebook",
        brand: { "@type": "Brand", name: SITE_NAME },
        ...(product?._id ? { sku: String(product._id) } : {}),
        ...(seoImage ? { image: [seoImage] } : {}),
        ...(canBuy
          ? {
              offers: {
                "@type": "Offer",
                url: PAGE_URL,
                price: currentPrice,
                priceCurrency: currency,
                priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
                availability: "https://schema.org/InStock",
                itemCondition: "https://schema.org/NewCondition",
                hasMerchantReturnPolicy: {
                  "@type": "MerchantReturnPolicy",
                  returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
                },
                seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
              },
            }
          : {}),
      },
      {
        "@type": "ItemList",
        "@id": `${PAGE_URL}#curriculum`,
        name: "Chapters of the SQL & Database Interview Handbook",
        numberOfItems: allChapters.length,
        itemListElement: allChapters.map((chapter, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: chapter.title,
          description: chapter.topics.join(", "),
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${PAGE_URL}#faq`,
        mainEntity: FAQS.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };

  const seoHead = (
    <Helmet htmlAttributes={{ lang: "en" }}>
      <title>{SEO_TITLE}</title>
      <meta name="description" content={SEO_DESCRIPTION} />
      <meta name="keywords" content={SEO_KEYWORDS} />
      <meta name="author" content={SITE_NAME} />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="theme-color" content={theme === "dark" ? "#141210" : "#FAF9F6"} />
      <meta name="color-scheme" content={theme === "dark" ? "dark light" : "light dark"} />
      <link rel="canonical" href={PAGE_URL} />
      <link rel="alternate" hrefLang="en-IN" href={PAGE_URL} />
      <link rel="alternate" hrefLang="x-default" href={PAGE_URL} />
      {seoImage && <link rel="preload" as="image" href={seoImage} />}
      <meta property="og:type" content="product" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={SEO_TITLE} />
      <meta property="og:description" content={SEO_DESCRIPTION} />
      <meta property="og:url" content={PAGE_URL} />
      {seoImage && <meta property="og:image" content={seoImage} />}
      {seoImage && <meta property="og:image:alt" content={`${productName} ebook cover`} />}
      {canBuy && <meta property="product:price:amount" content={String(currentPrice)} />}
      {canBuy && <meta property="product:price:currency" content={currency} />}
      <meta name="twitter:card" content={seoImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={SEO_TITLE} />
      <meta name="twitter:description" content={SEO_DESCRIPTION} />
      {seoImage && <meta name="twitter:image" content={seoImage} />}
      <script type="application/ld+json">{JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>
    </Helmet>
  );

  return (
    <>
      <div
        className="lldPage lld-expanded"
        data-theme={theme}
        style={{ "--lld-navbar-offset": typeof navbarOffset === "number" ? `${navbarOffset}px` : navbarOffset }}
      >
        {seoHead}
        <style>{baseStyles}</style>
        <style>{sqlStyles}</style>
        <ScrollProgress />

        <main id="top">
          <section className="lld-hero sql-hero" ref={heroRef}>
            <div className="sql-hero-bg" aria-hidden="true">
              <span className="sql-gridlines" />
              <span className="sql-blob sql-blob-a" />
              <span className="sql-blob sql-blob-b" />
            </div>
            <div className="lld-shell lld-hero-grid">
              <motion.div {...animation}>
                <div className="lld-eyebrow">
                  <Sparkles size={13} /> SQL & database interview handbook
                </div>
                <h1>
                  Master SQL.
                  <br />
                  <span className="lld-gradient-text">Understand the database.</span>
                </h1>
                <RotatingTopic reduce={reduceMotion} />
                <p className="lld-hero-copy">
                  From joins and window functions to indexing, transactions, MVCC, replication and
                  sharding: 26 chapters, 14 classic SQL problems and a 7-day revision plan to
                  prepare for database rounds and real backend engineering.
                </p>
                <div className="lld-hero-actions">
                  <button className="lld-cta" type="button" onClick={openCheckout} disabled={!canBuy}>
                    Get the ebook {displayedPrice !== "Unavailable" && <span>{displayedPrice}</span>} <ArrowRight size={16} />
                  </button>
                  <a className="lld-cta lld-cta-outline" href="#free-snippets">
                    <Terminal size={16} /> Try free SQL snippets
                  </a>
                </div>
                {productError && (
                  <p className="lld-error">Price is temporarily unavailable. Please try again or contact {SUPPORT_EMAIL}.</p>
                )}
                <div className="sql-trust">
                  <span><Check size={13} /> 14 classic problems</span>
                  <span><Check size={13} /> Real PostgreSQL experiments</span>
                  <span><Check size={13} /> 7-day revision plan</span>
                </div>
              </motion.div>

              <motion.div
                className="sql-stage"
                onMouseMove={handleStageMove}
                onMouseLeave={handleStageLeave}
                initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <div className="sql-chip sql-chip-a"><Database size={15} color="#FB923C" /> Indexing & MVCC</div>
                <div className="sql-chip sql-chip-b"><Zap size={15} color="#F59E0B" /> Replication & sharding</div>
                <HeroTerminal reduce={reduceMotion} />
                <div className="sql-mini-book" aria-hidden="true">
                  {seoImage ? (
                    <img src={seoImage} alt="" loading="lazy" />
                  ) : (
                    <div><small>Target Trek</small>SQL &amp;<br />DB</div>
                  )}
                </div>
              </motion.div>
            </div>
            <div className="lld-hero-bottom" />
          </section>

          <div className="sql-marquee" aria-hidden="true">
            <div className="sql-marquee-track">
              {[...MARQUEE_TOPICS, ...MARQUEE_TOPICS].map((topic, i) => (
                <span key={`${topic}-${i}`}>{topic}</span>
              ))}
            </div>
          </div>

          <section className="lld-shell" aria-label="Book highlights">
            <ScrollScale className="lld-stats-scale">
              <div className="lld-stats">
                {stats.map(([value, label], index) => (
                  <motion.div
                    className="lld-stat"
                    key={label}
                    {...animation}
                    transition={{ ...animation.transition, delay: index * 0.05 }}
                  >
                    <strong><CountUp to={Number(value)} /></strong>
                    <span>{label}</span>
                  </motion.div>
                ))}
              </div>
            </ScrollScale>
          </section>

          <section className="lld-section-tight" aria-labelledby="sql-quick-title">
            <div className="lld-shell">
              <motion.div className="sql-quick" id="sql-quick-answer" {...animation}>
                <div className="lld-kicker">In short</div>
                <h2 id="sql-quick-title">What is the SQL & Database Interview Handbook?</h2>
                <p>{QUICK_ANSWER}</p>
              </motion.div>
            </div>
          </section>

          <section className="lld-section-tight">
            <div className="lld-shell">
              <div className="sql-highlights">
                {highlights.map(({ icon: Icon, title, text }, index) => (
                  <motion.article
                    className="lld-card sql-highlight"
                    key={title}
                    {...animation}
                    transition={{ ...animation.transition, delay: index * 0.06 }}
                  >
                    <span className="lld-module-icon"><Icon size={19} /></span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>

          <FreeLessons animation={animation} />

          <PartsExplorer animation={animation} />

          <section className="lld-section-tight" aria-labelledby="sql-flow-title">
            <div className="lld-shell">
              <motion.div className="lld-section-head" {...animation}>
                <div className="lld-kicker">A repeatable path</div>
                <h2 id="sql-flow-title">From first query to scaled database</h2>
                <p>Learn in the order real systems grow: correct queries, good design, speed, safety, then scale.</p>
              </motion.div>
              <div className="lld-flow">
                {flowSteps.map((step, index) => (
                  <motion.div
                    className="lld-card lld-flow-step"
                    key={step.title}
                    {...animation}
                    transition={{ ...animation.transition, delay: index * 0.055 }}
                  >
                    <div className="lld-flow-icon">
                      {[Code2, Layers3, Zap, LockKeyhole, ShieldCheck, Network][index] &&
                        React.createElement([Code2, Layers3, Zap, LockKeyhole, ShieldCheck, Network][index], { size: 15 })}
                    </div>
                    <span className="lld-flow-num">STEP 0{index + 1}</span>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="lld-section-tight" id="faq">
            <div className="lld-shell">
              <motion.div className="lld-section-head" {...animation}>
                <div className="lld-kicker">Quick answers</div>
                <h2>Before you start</h2>
                <p>What the book covers, who it is for and how buying works.</p>
              </motion.div>
              <div className="lld-faq">
                {FAQS.map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div className="lld-faq-item" key={item.q}>
                      <button
                        className="lld-faq-button"
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        aria-expanded={isOpen}
                        aria-controls={`sql-faq-${index}`}
                      >
                        <span>{item.q}</span>
                        <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                          <ChevronDown size={17} />
                        </motion.span>
                      </button>
                      <div className={`lld-faq-collapse${isOpen ? " is-open" : ""}`} id={`sql-faq-${index}`} role="region">
                        <div className="lld-faq-collapse-inner">
                          <div className="lld-faq-answer">{item.a}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="sql-related">
                <a className="lld-cta lld-cta-outline" href={HLD_URL}>System Design HLD book <ArrowRight size={15} /></a>
                <a className="lld-cta lld-cta-outline" href={LLD_URL}>Java LLD book <ArrowRight size={15} /></a>
              </div>
            </div>
          </section>

          <section className="lld-section-tight">
            <div className="lld-shell">
              <ScrollScale from={0.9}>
                <motion.div className="lld-final-cta" {...animation}>
                  <div className="lld-final-copy">
                    <div className="lld-eyebrow"><Sparkles size={13} /> Ace your database round</div>
                    <h2>Answer SQL and database questions with confidence.</h2>
                    <p>
                      Get the handbook and practice the full journey from queries and schema design
                      to transactions, replication and sharding.
                    </p>
                    <div className="lld-final-checks">
                      <span><Check size={14} /> 26 chapters</span>
                      <span><Check size={14} /> 14 solved problems</span>
                      <span><Check size={14} /> 7-day plan</span>
                    </div>
                  </div>
                  <div className="lld-price-card">
                    <div className="lld-price-label">Digital ebook · instant access after checkout</div>
                    <div className="lld-price-line">
                      {loadingProduct ? (
                        <div className="lld-skeleton" />
                      ) : (
                        <span className="lld-price-now">
                          {productError || !validPrice ? "Price unavailable" : formatMoney(currentPrice)}
                        </span>
                      )}
                      {!loadingProduct && !productError && mrp > currentPrice && (
                        <span className="lld-price-old">{formatMoney(mrp)}</span>
                      )}
                    </div>
                    {!loadingProduct && !productError && discount > 0 && (
                      <div className="lld-discount">Save {discount}% on the current price</div>
                    )}
                    <button className="lld-cta" type="button" onClick={openCheckout} disabled={!canBuy}>
                      {loadingProduct ? "Loading price..." : "Get the ebook"} <ArrowRight size={16} />
                    </button>
                    {productError && <p className="lld-error">{productError}</p>}
                    <p className="lld-price-small">
                      Digital products are non-refundable after purchase.
                      <br />
                      Questions?{" "}
                      <a href={`mailto:${SUPPORT_EMAIL}`} style={{ textDecoration: "underline" }}>{SUPPORT_EMAIL}</a>
                    </p>
                  </div>
                </motion.div>
              </ScrollScale>
            </div>
          </section>
        </main>

        <div
          className={["lld-sticky", heroVisible && !loadingProduct ? "is-hero-visible" : "", checkoutOpen ? "is-checkout-open" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="lld-sticky-card">
            <div className="lld-sticky-info">
              <strong className="lld-sticky-title">SQL & Database Interview Handbook</strong>
              <div className="lld-sticky-price">
                <span className="lld-sticky-now">
                  {loadingProduct ? "Loading…" : productError || !validPrice ? "Price unavailable" : formatMoney(currentPrice)}
                </span>
                {!loadingProduct && !productError && mrp > currentPrice && (
                  <span className="lld-sticky-old">{formatMoney(mrp)}</span>
                )}
                {!loadingProduct && !productError && discount > 0 && <span className="lld-sticky-off">{discount}% off</span>}
              </div>
              <small className="lld-sticky-sub">SQL & Database Handbook</small>
            </div>
            <div className="lld-sticky-actions">
              <a className="lld-cta lld-cta-outline lld-sticky-preview" href="#free-snippets">
                <Terminal size={15} /> Free snippets
              </a>
              <button className="lld-cta lld-pulse" type="button" onClick={openCheckout} disabled={!canBuy}>
                Get the ebook <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <PayUCheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} product={product} />,
          document.body,
        )}
    </>
  );
}
