import {
  ChartBar, ChatsCircle, Code, Database, FileText, Flask, Gauge, GraduationCap, ListChecks, Trophy,
} from "@phosphor-icons/react";

/* Content for /book/database/sql (SQL & Database Interview Handbook). Parts, FAQs and lessons are carried over from the previous page. */

const PARTS = [
  {
    id: "I",
    title: "SQL Foundations",
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
    summary: "Normalize with intent, denormalize on purpose, and model real systems such as multi-tenant SaaS.",
    chapters: [
      { n: "8", title: "Normalization", topics: ["Why normalize? The three anomalies", "Functional dependencies: the vocabulary", "First Normal Form (1NF): atomic values, no repeating groups", "Second Normal Form (2NF): no partial dependencies", "Third Normal Form (3NF): no transitive dependencies", "Boyce-Codd Normal Form (BCNF)", "Higher forms in one minute", "Normalization at a glance", "Denormalization: breaking the rules on purpose"] },
      { n: "9", title: "Schema Design and Data Modeling", topics: ["Relationships and how to implement them", "Choosing a primary key", "Standard columns worth adding", "Keeping history: Slowly Changing Dimension Type 2", "Multi-tenant designs (SaaS)", "Anti-patterns to avoid", "Mini design walk-through: URL shortener"] },
    ],
  },
  {
    id: "III",
    title: "Storage, Indexing and Performance",
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
    summary: "Lock the database down, drill the full question bank and finish with a 7-day revision plan.",
    chapters: [
      { n: "24", title: "Database Security", topics: ["SQL injection", "Authentication, roles and least privilege", "Row-Level Security (RLS)", "Protecting data at rest and in transit"] },
      { n: "25", title: "Interview Question Bank", topics: ["A. SQL and database basics", "B. Querying", "C. Design and normalization", "D. Indexing and performance", "E. Transactions and concurrency", "F. Durability, failures and recovery", "G. Scaling and distributed databases", "H. Eight scenario questions"] },
      { n: "26", title: "Cheat Sheets and 7-Day Revision Plan", topics: ["SQL syntax cheat sheet", "Window function cheat sheet", "Isolation levels at a glance", "Index cheat sheet", "Error codes worth recognising (PostgreSQL SQLSTATE)", "PostgreSQL vs MySQL (InnoDB): talking points", "Failure and scaling quick reference", "7-day revision plan", "Interview-day checklist", "Glossary", "Final words"] },
    ],
  },
];

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

/* the old page's parts in the shared syllabus shape */
const CURRICULUM = PARTS.map((p) => ({
  id: p.id, number: p.id, title: p.title, subtitle: p.summary,
  chapters: p.chapters.map((c) => ({ n: c.n.padStart(2, "0"), title: c.title, sections: c.topics })),
}));

/* the free lessons as runnable samples: query, then its output as a comment */
const SAMPLES = LESSONS.map((l) => ({
  id: l.id, label: l.tab, filename: l.file, title: l.title,
  description: `${l.intro} Tip: ${l.tip}`,
  code: `${l.sql}\n\n-- Output\n${l.out.split("\n").map((r) => `-- ${r}`).join("\n")}`,
}));

/* sample data used by every lab on the page */
export const EMPLOYEES = [
  { id: 1, name: "Asha", dept_id: 1, salary: 190000 },
  { id: 2, name: "Ravi", dept_id: 1, salary: 165000 },
  { id: 3, name: "Neha", dept_id: 1, salary: 165000 },
  { id: 4, name: "Meera", dept_id: 2, salary: 120000 },
  { id: 5, name: "Kabir", dept_id: 2, salary: 95000 },
  { id: 6, name: "Isha", dept_id: 3, salary: 70000 },
  { id: 7, name: "Arjun", dept_id: null, salary: 60000 },
];
export const DEPARTMENTS = [
  { id: 1, name: "Engineering" },
  { id: 2, name: "Sales" },
  { id: 3, name: "Support" },
  { id: 4, name: "Research" },
];

export const ISOLATION = [
  ["READ UNCOMMITTED", "Possible", "Possible", "Possible", "PostgreSQL treats it as READ COMMITTED"],
  ["READ COMMITTED", "Prevented", "Possible", "Possible", "Default in PostgreSQL and Oracle"],
  ["REPEATABLE READ", "Prevented", "Prevented", "Possible", "Default in MySQL InnoDB; no phantoms in PostgreSQL"],
  ["SERIALIZABLE", "Prevented", "Prevented", "Prevented", "Safest; may abort transactions that must retry"],
];

export const SQL_BOOK = {
  key: "sql",
  path: "/book/database/sql",
  crumb: "SQL & Databases",
  productName: "SQL & Database Interview Handbook",
  seo: {
    title: "SQL & Database Interview Handbook (PDF) | Target Trek",
    description: "SQL and database interview ebook: joins, window functions, indexing, transactions, isolation, MVCC, replication, sharding, 14 classic problems and a 7-day plan.",
    keywords: "SQL interview questions, database interview handbook, SQL ebook, DBMS interview preparation, window functions, SQL joins, database indexing, B+ tree index, transaction isolation levels, MVCC, deadlocks, database sharding, replication, normalization, PostgreSQL interview, SQL window functions interview, SQL for backend interviews, TargetTrek",
    long: "Prepare for SQL and database interviews with 26 chapters: SELECT, joins, CTEs, window functions, 14 classic problems, normalization, schema design, indexing, query optimization, ACID, isolation levels, MVCC, deadlocks, WAL, replication, partitioning, sharding, caching, distributed transactions, security, an interview question bank and a 7-day revision plan.",
    category: "SQL and Database Interview Ebook",
  },
  pill: "SQL & database handbook · PDF ebook",
  h1: <>SQL and databases, <span className="hb-mark">from first query to sharding.</span></>,
  lead: "26 chapters that take you from SELECT and joins through window functions, indexing, EXPLAIN, transactions, isolation and MVCC, to replication and sharding. 14 classic problems, a question bank and a 7-day revision plan included.",
  stats: [["26", "chapters"], ["6", "parts"], ["14", "classic SQL problems"], ["7", "day revision plan"]],
  cover: { title: "SQL & Databases", subtitle: "Interview Handbook", line: "Joins · Windows · Indexes · MVCC · Sharding" },
  nav: [["answers", "Quick answers"], ["try", "Try it: SQL labs"], ["models", "Mental models"], ["syllabus", "Syllabus"], ["code", "Free problems"], ["bundle", "CS core set"], ["faq", "FAQ"]],
  quick: [
    { q: "What is the difference between WHERE and HAVING?", a: "WHERE filters individual rows before they are grouped, so it cannot use aggregates. HAVING filters whole groups after GROUP BY, so it can, for example HAVING COUNT(*) >= 2." },
    { q: "ROW_NUMBER vs RANK vs DENSE_RANK?", a: "All three number rows in a window. ROW_NUMBER gives every row a unique number even on ties. RANK gives ties the same number and then skips (1, 2, 2, 4). DENSE_RANK gives ties the same number without gaps (1, 2, 2, 3), which is why it is used for the Nth highest salary." },
    { q: "Clustered vs non-clustered index?", a: "A clustered index stores the table rows themselves in index order, so a table has at most one. A non-clustered index is a separate structure of keys pointing back to the rows; a table can have many, and a query it fully covers can be answered from the index alone." },
    { q: "Which isolation level prevents which anomaly?", a: "READ COMMITTED prevents dirty reads. REPEATABLE READ also prevents non-repeatable reads. SERIALIZABLE prevents those plus phantoms and write skew. Higher levels are safer but block or abort more transactions." },
  ],
  flows: {
    title: "Two paths explain most database interviews",
    lead: "One is how a single query runs. The other is the journey every growing product takes with its database.",
    items: [
      { n: "01", title: "How a query runs", icon: Gauge, copy: "The database parses your SQL, the cost-based optimizer picks a plan, and the executor reads pages through the buffer pool, writing changes to the WAL first.",
        steps: ["Parse", "Optimize", "Execute", "Buffer pool", "WAL & disk"], note: "Most 'why is this slow' answers live in the optimize and execute steps: wrong plan, missing index or stale statistics. EXPLAIN ANALYZE shows both." },
      { n: "02", title: "From first query to scaled database", icon: Database, copy: "The book follows the same order: write correct queries, design the schema, make it fast, keep it correct under concurrency, survive failures, then scale out.",
        steps: ["Query", "Design", "Index", "Transact", "Recover", "Scale"], note: "Interviewers move along this path too. If you can explain each step's trade-off, you can follow any follow-up question." },
    ],
  },
  curriculum: CURRICULUM,
  syllabusTitle: "26 chapters in 6 parts",
  syllabusLead: "SQL foundations, database design, storage and indexing, transactions and recovery, scaling and distributed databases, then security, a question bank and cheat sheets.",
  samples: SAMPLES,
  samplesTitle: "Six interview problems, solved",
  samplesLead: "Straight from the book: the query, the output and the one line to say in the interview.",
  forTitle: "Made for SQL and database rounds at product companies",
  audiences: [
    { icon: Code, title: "Backend and full-stack engineers", copy: "Go past CRUD: indexing, EXPLAIN, transactions, isolation, locking and the scaling questions asked in senior rounds.", points: ["Indexes and EXPLAIN", "Isolation and MVCC", "Replication and sharding"] },
    { icon: ChartBar, title: "Data and analytics candidates", copy: "Window functions, CTEs, gaps and islands, pivots and the 14 classic problems that show up in SQL screens.", points: ["Window functions", "14 classic problems", "Pivots and CTEs"] },
    { icon: GraduationCap, title: "Freshers and students", copy: "Starts from keys and constraints and builds up, so DBMS theory and practical SQL are covered in one place.", points: ["Normal forms", "ACID", "7-day plan"] },
  ],
  value: [
    { icon: FileText, title: "26 chapters in 6 parts", copy: "One path from SELECT to distributed databases." },
    { icon: Code, title: "Run every example", copy: "One sample database across chapters, so every query and plan reproduces." },
    { icon: Flask, title: "Real experiments", copy: "Crash recovery, a streaming replica, partitions and four isolation demos." },
    { icon: Trophy, title: "14 classic SQL problems", copy: "Nth salary, duplicates, top-N per group, gaps and islands, median." },
    { icon: ChatsCircle, title: "Interview question bank", copy: "Eight sections plus eight scenario questions." },
    { icon: ListChecks, title: "Cheat sheets and a 7-day plan", copy: "SQL, windows, isolation, indexes and an interview-day checklist." },
  ],
  faqs: FAQS,
  final: {
    title: <>Walk into the SQL round <span className="hb-mark">knowing why, not just how.</span></>,
    line: "26 chapters, 14 classic problems and a 7-day revision plan, in one PDF you can read anywhere.",
  },
  footLine: "SQL & Database Interview Handbook · Digital PDF ebook · Digital purchases are not refundable",
};
