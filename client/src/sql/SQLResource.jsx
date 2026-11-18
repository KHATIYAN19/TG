import { Link } from "react-router-dom";
import { Database, Desktop, Lock, ShieldCheck, TreeStructure } from "@phosphor-icons/react";

import { Call, Cards, Chips, Code, Compare, Flow, H3, Mark, Prose, ReaderPage, Sec, Steps, Table } from "../resources/kit/Reader";

/* =====================================================================
   SQL COMPLETE GUIDE  (/resources/sql)
   Beginner → advanced, in the order to learn it. Every topic has the
   theory, a runnable example and the interview angle.
===================================================================== */
const GUIDE = {
  id: "sql",
  path: "/resources/sql",
  short: "SQL",
  section: "Databases",
  seoTitle: "SQL Complete Guide: Joins, CTEs, Window Functions, Indexes, Interview Queries | Target Trek",
  description: "Learn SQL from basics to advanced, free: SELECT, WHERE, joins, GROUP BY, subqueries, EXISTS, CTEs, recursive CTEs, window functions, normalisation, indexes, EXPLAIN, transactions, isolation, locking, SQL injection, optimisation and solved interview queries.",
  keywords: ["sql tutorial", "learn sql", "sql joins", "group by having", "sql subquery", "exists vs in", "cte sql", "recursive cte", "window functions", "row_number rank dense_rank", "sql indexes", "sql transactions", "sql interview questions", "second highest salary sql", "nth highest salary"],
  about: ["SQL", "Relational databases", "Joins", "Window functions", "Indexes", "Transactions", "SQL interview preparation"],
  tags: ["Core engineering", "Databases", "Beginner → Advanced"],
  h1: "SQL Complete Guide: Beginner to Advanced",
  sub: "Everything from your first SELECT to window functions, indexes and transactions, with runnable examples, the mistakes interviewers look for, and solved interview queries.",
  answer: "SQL (Structured Query Language) is the standard language for defining, querying and changing data in relational databases such as PostgreSQL, MySQL, SQL Server and Oracle. You describe what data you want (SELECT … FROM … WHERE …) and the database's optimiser decides how to get it. For interviews, focus on joins, GROUP BY and HAVING, subqueries and EXISTS, CTEs, window functions, indexes, transactions and isolation levels.",
  minutes: 60,
  level: "Beginner → Advanced",
  updated: "2026-11-18",
  crumbs: [["Resources", "/resources"], ["SQL", "/resources/sql"]],
  learn: [
    "Query, filter, sort and paginate data correctly",
    "Every join type, set operations, subqueries and EXISTS",
    "CTEs, recursive CTEs and window functions",
    "Indexes, EXPLAIN and query optimisation",
    "Transactions, isolation, locking and deadlocks",
  ],
  toc: [
    { id: "basics", label: "Databases, DBMS and keys" },
    { id: "ddl", label: "Data types and tables" },
    { id: "select", label: "INSERT and SELECT" },
    { id: "filtering", label: "Filtering with WHERE" },
    { id: "null", label: "NULL, DISTINCT, ORDER BY" },
    { id: "pagination", label: "Pagination" },
    { id: "modify", label: "UPDATE, DELETE, ALTER" },
    { id: "constraints", label: "Constraints and foreign keys" },
    { id: "aggregation", label: "Aggregates and GROUP BY" },
    { id: "joins", label: "Joins and set operations" },
    { id: "subqueries", label: "Subqueries and EXISTS" },
    { id: "cte", label: "CTEs and recursion" },
    { id: "functions", label: "CASE and functions" },
    { id: "window-functions", label: "Window functions" },
    { id: "normalization", label: "Normalisation and relationships" },
    { id: "views", label: "Views" },
    { id: "indexes", label: "Indexes and EXPLAIN" },
    { id: "transactions", label: "Transactions and isolation" },
    { id: "locking", label: "Locking and deadlocks" },
    { id: "db-logic", label: "Procedures, triggers, partitions" },
    { id: "sql-injection", label: "SQL injection" },
    { id: "optimization", label: "Query optimisation" },
    { id: "schema-design", label: "E-commerce schema" },
    { id: "interview-queries", label: "Solved interview queries" },
    { id: "cheat-sheet", label: "Cheat sheet" },
  ],
  questions: [
    { q: "What is SQL, and how is it different from MySQL?", a: "SQL is a language. MySQL, PostgreSQL, SQL Server, Oracle and SQLite are database systems that implement it, each with its own extensions and small syntax differences." },
    { q: "Primary key vs unique key?", a: "Both enforce uniqueness. A table has exactly one primary key; it can't be NULL and it identifies the row (often the clustered index). A table can have many unique keys, and most databases allow NULLs in them." },
    { q: "What is a foreign key?", a: "A column (or set) that must match a key in another table, enforcing referential integrity: you can't add an order for a user who doesn't exist. ON DELETE and ON UPDATE rules decide what happens when the referenced row changes." },
    { q: "Candidate, composite, natural and surrogate keys?", a: "A candidate key is any minimal column set that uniquely identifies rows; one becomes the primary key. A composite key spans several columns. A natural key comes from the real world (an email); a surrogate key is artificial (an auto-increment ID or UUID)." },
    { q: "DELETE vs TRUNCATE vs DROP?", a: "DELETE removes chosen rows (WHERE) row by row and can be rolled back. TRUNCATE quickly removes all rows and keeps the table, often resetting identity counters. DROP removes the table itself. Locking and transaction behaviour vary by engine." },
    { q: "WHERE vs HAVING?", a: "WHERE filters rows before grouping; HAVING filters groups after aggregation. Use WHERE for row conditions (status = 'PAID') and HAVING for aggregate conditions (SUM(amount) > 10000)." },
    { q: "In what order does SQL logically run a query?", a: "FROM and JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT/OFFSET. That's why a SELECT alias can't be used in WHERE but can be used in ORDER BY." },
    { q: "UNION vs UNION ALL?", a: "UNION combines results and removes duplicates, which needs a sort or hash. UNION ALL keeps duplicates and is cheaper. Use UNION ALL unless you actually need de-duplication." },
    { q: "INNER JOIN vs LEFT JOIN?", a: "INNER JOIN returns only rows that match on both sides. LEFT JOIN returns every row from the left table plus matches, with NULLs where there's no match, which is why LEFT JOIN … WHERE right.id IS NULL finds rows with no match." },
    { q: "IN vs EXISTS, and why is NOT IN dangerous?", a: "Both test membership; EXISTS stops at the first match and suits correlated checks. NOT IN returns no rows at all if the subquery yields a single NULL, because x NOT IN (1, NULL) is UNKNOWN. NOT EXISTS doesn't have that problem." },
    { q: "What is a correlated subquery?", a: "A subquery that references the outer query's current row, so logically it runs once per outer row. EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id) is the classic example. Index the correlation column." },
    { q: "CTE vs subquery?", a: "A CTE (WITH …) names a subquery so complex logic reads top to bottom, can be referenced several times, and can be recursive. Performance is usually similar; some engines materialise CTEs, so check the plan." },
    { q: "What is a recursive CTE?", a: "A CTE with an anchor query plus a recursive part that references the CTE itself, joined with UNION ALL. It repeats until no new rows appear. It's used for hierarchies such as org charts, category trees and folder paths." },
    { q: "What are window functions?", a: "Functions that compute over a set of related rows (the window, defined by OVER (PARTITION BY … ORDER BY …)) without collapsing them like GROUP BY does. Each row keeps its detail and gains a computed column: a rank, a running total, the previous value." },
    { q: "ROW_NUMBER vs RANK vs DENSE_RANK?", a: "For salaries 100, 100, 90: ROW_NUMBER gives 1, 2, 3 (always unique); RANK gives 1, 1, 3 (ties share, then a gap); DENSE_RANK gives 1, 1, 2 (ties share, no gap). Use DENSE_RANK for “Nth highest distinct value”." },
    { q: "What are LAG and LEAD?", a: "They read a column from the previous (LAG) or next (LEAD) row in the window's order. They're ideal for day-over-day growth, gaps between events and finding consecutive values, without a self-join." },
    { q: "What is normalisation? Explain 1NF, 2NF, 3NF and BCNF.", a: "Organising tables to remove redundancy and update anomalies. 1NF: atomic values, no repeating groups. 2NF: no non-key column depends on only part of a composite key. 3NF: no non-key column depends on another non-key column. BCNF: every determinant is a candidate key." },
    { q: "What is an index, and how does a B-tree index work?", a: "An extra structure that finds rows without scanning the table. A B-tree keeps keys sorted in a balanced tree of pages, so equality, range and ORDER BY lookups take a few page reads, O(log n), even on huge tables." },
    { q: "When should you not add an index?", a: "On small tables, low-selectivity columns (a boolean flag), write-heavy tables where the extra maintenance hurts, or columns no real query filters or sorts on. Each index slows writes and uses storage." },
    { q: "What is the leftmost-prefix rule, and what is a covering index?", a: "A composite index on (a, b, c) helps queries filtering on a, on a and b, or on a, b and c, but not on b alone. A covering index contains every column a query needs, so the database answers from the index without touching the table." },
    { q: "Clustered vs non-clustered index?", a: "A clustered index defines the physical order of the table's rows (InnoDB clusters on the primary key), so there's only one. Non-clustered (secondary) indexes are separate structures pointing back to the rows." },
    { q: "Explain ACID and the isolation anomalies.", a: "Atomicity, consistency, isolation and durability. The anomalies isolation prevents: a dirty read (seeing uncommitted data), a non-repeatable read (a row changes between reads) and a phantom read (new rows appear in a repeated range query)." },
    { q: "What is a deadlock, and how do you prevent it?", a: "Two transactions each hold a lock the other needs, so neither can continue; the database kills one as the victim. Prevent it by locking rows in a consistent order, keeping transactions short, indexing so fewer rows lock, and retrying the victim." },
    { q: "View vs materialised view?", a: "A view stores a query and runs it every time, so it's always fresh. A materialised view stores the result, so reads are fast, but it must be refreshed and can be stale. Use views for abstraction and access control, materialised views for expensive reports." },
    { q: "What does EXPLAIN do?", a: "It shows the plan the optimiser chose: scan types, the indexes used, the join algorithms and order, and estimated rows. EXPLAIN ANALYZE also runs the query and reports actual rows and timings." },
    { q: "Why can SELECT * be inefficient?", a: "It reads and sends every column, defeats covering indexes, wastes network and memory, and breaks silently when columns change. Select only the columns you need." },
    { q: "OFFSET vs keyset (cursor) pagination?", a: "OFFSET 100000 still makes the database walk past 100,000 rows, and pages shift when data changes. Keyset pagination (WHERE id > :lastId ORDER BY id LIMIT 20) jumps straight to the position through an index and stays stable." },
    { q: "What is SQL injection, and how do prepared statements prevent it?", a: "Injection happens when user input is concatenated into SQL and changes its meaning, for example ' OR '1'='1. Prepared statements send the SQL and the values separately, so input is always treated as data, never as code." },
    { q: "Partitioning vs sharding?", a: "Partitioning splits one logical table into pieces inside one database, for example by month. Sharding spreads data across separate database servers. Partitioning helps manageability and pruning; sharding scales storage and writes horizontally." },
    { q: "SQL vs NoSQL: when do you choose each?", a: "Choose SQL for transactions, constraints, joins and flexible queries: money, orders, inventory. Choose NoSQL when one access pattern dominates at huge scale or the data is naturally schemaless, and accept fewer transactional guarantees." },
  ],
  quiz: [
    { q: "Which query finds users with a NULL phone?", options: ["WHERE phone = NULL", "WHERE phone IS NULL", "WHERE phone == NULL", "WHERE phone IN (NULL)"], answer: 1, why: "Any comparison with NULL using = is UNKNOWN, so it never matches. Use IS NULL or IS NOT NULL." },
    { q: "You need customers whose total spend is over ₹10,000. Where does SUM(amount) > 10000 go?", options: ["WHERE", "HAVING", "ON", "ORDER BY"], answer: 1, why: "It's a condition on an aggregate, so it filters groups after GROUP BY: that's HAVING." },
    { q: "Salaries 100, 100, 90. What does DENSE_RANK give the 90?", options: ["1", "2", "3", "4"], answer: 1, why: "DENSE_RANK gives ties the same rank and doesn't skip: 1, 1, 2. RANK would give 3." },
    { q: "The subquery in WHERE id NOT IN (SELECT manager_id FROM employees) returns a NULL. What happens?", options: ["NULLs are ignored", "The query returns no rows", "It throws an error", "It returns every row"], answer: 1, why: "x NOT IN (…, NULL) is never TRUE, so no row qualifies. NOT EXISTS avoids this trap." },
    { q: "Index on (user_id, status). Which filter can't use it efficiently?", options: ["user_id = 7", "user_id = 7 AND status = 'PAID'", "status = 'PAID'", "user_id = 7 ORDER BY status"], answer: 2, why: "Leftmost-prefix rule: without the first column, the index's order doesn't help." },
    { q: "Page 5,000 of a feed with OFFSET is slow. What fixes it best?", options: ["A bigger LIMIT", "Keyset pagination on an indexed column", "SELECT DISTINCT", "A subquery"], answer: 1, why: "Keyset pagination seeks directly to the last-seen key through an index instead of walking past every skipped row." },
  ],
  glossary: [
    ["DDL / DML / DQL", "Defining structure (CREATE, ALTER) / changing data (INSERT, UPDATE) / querying (SELECT)."],
    ["Primary key", "The column(s) that uniquely identify each row; never NULL."],
    ["Foreign key", "A column that must match a key in another table."],
    ["NULL", "An unknown or missing value: not zero, not an empty string."],
    ["JOIN", "Combining rows from tables using related columns."],
    ["Subquery", "A query nested inside another; correlated if it uses the outer row."],
    ["CTE", "A named temporary result set defined with WITH."],
    ["Window function", "A calculation over related rows using OVER(), keeping each row."],
    ["Index", "A sorted structure that finds rows without a full scan."],
    ["Execution plan", "How the database will run a query; shown by EXPLAIN."],
    ["Transaction", "A group of statements that commit or roll back together."],
    ["Deadlock", "Two transactions waiting on each other's locks forever."],
  ],
  takeaways: [
    "SQL is declarative: describe the result, and let the optimiser choose the plan. Then check the plan.",
    "Know the logical order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.",
    "NULL means unknown: use IS NULL, COALESCE, and NOT EXISTS instead of NOT IN.",
    "Joins, GROUP BY + HAVING, CTEs and window functions solve most interview problems.",
    "Design indexes from real queries; respect the leftmost-prefix rule and the write cost.",
    "Keep transactions short, lock in a consistent order, and know your isolation level.",
    "Always parameterise queries. Concatenated SQL is an injection waiting to happen.",
  ],
  faq: [
    { q: "How long does it take to learn SQL?", a: "Basic querying (SELECT, WHERE, JOIN, GROUP BY) takes one to two weeks of practice. Interview-level SQL (subqueries, CTEs, window functions, indexes and transactions) usually takes four to six weeks of regular problem solving." },
    { q: "Which SQL topics are asked most in interviews?", a: "Joins, GROUP BY with HAVING, subqueries and EXISTS, window functions (ROW_NUMBER, RANK, DENSE_RANK, LAG/LEAD), Nth-highest salary, duplicate detection, indexes, transactions, isolation levels and query optimisation." },
    { q: "Should I learn MySQL or PostgreSQL?", a: "Either. The core SQL is the same. PostgreSQL is stricter and has richer features (CTEs, window functions, JSONB, partial indexes); MySQL is very common in industry. Learn one well and note the differences." },
    { q: "What is the difference between WHERE and HAVING?", a: "WHERE filters individual rows before grouping; HAVING filters groups after aggregate functions like COUNT or SUM have been calculated." },
    { q: "What is the best way to find the Nth highest salary?", a: "Use DENSE_RANK() OVER (ORDER BY salary DESC) in a CTE and select the rows where the rank equals N. It handles ties correctly and works for any N." },
    { q: "Are window functions supported in MySQL?", a: "Yes, from MySQL 8.0. PostgreSQL, SQL Server, Oracle and SQLite (3.25+) also support them." },
  ],
  next: { title: "API Engineering", path: "/resources/apis", text: "REST, HTTP, GraphQL, authentication, pagination, idempotency, caching, rate limiting and webhooks: the contract on top of your data." },
  book: {
    path: "/book/database/sql", label: "SQL handbook", title: "SQL Interview Handbook",
    text: "Hundreds of interview-style problems with step-by-step solutions, from joins and window functions to schema design and query tuning.",
    short: "Interview problems with worked solutions.",
    cta: "Explore the SQL handbook",
    chips: ["Joins", "Window functions", "CTEs", "Indexes", "Transactions", "Interview problems"],
  },
};

export default function SQLResource() {
  return (
    <ReaderPage guide={GUIDE}>
      {/* 01 */}
      <Sec id="basics" n={1} eyebrow="Fundamentals" title="Databases, DBMS, RDBMS and keys" lead="Before writing queries, get the vocabulary straight. Interviews often start here.">
        <Prose>
          <p>A <strong>database</strong> is an organised collection of data that applications can store, search, update and share safely. A <strong>DBMS</strong> (database management system) is the software that manages it: it parses and optimises queries, runs transactions, controls concurrent access, maintains indexes and recovers after crashes.</p>
          <p>An <strong>RDBMS</strong> stores data in <Mark>tables of rows and columns</Mark> and links tables with keys. SQL is the language you use to talk to it.</p>
        </Prose>
        <Flow caption="Inside a DBMS" steps={[
          { t: "Client / application", s: "Sends SQL", i: Desktop },
          { t: "Parser → optimiser → executor", s: "Turns SQL into an efficient plan", i: TreeStructure, tone: "hot" },
          { t: "Transaction + buffer manager", s: "Concurrency, caching, logging", i: Lock },
          { t: "Storage", s: "Data files, indexes, WAL", i: Database },
        ]} />
        <Call tone="info" title="SQL vs MySQL vs PostgreSQL">SQL is the <strong>language</strong>. MySQL, PostgreSQL, SQL Server, Oracle and SQLite are <strong>database systems</strong> that implement it. Core syntax is shared; advanced features and date functions differ.</Call>
        <Code title="A one-to-many relationship" lang="sql">{`
-- users.id  1 ────< many  orders.user_id
CREATE TABLE users  (id BIGINT PRIMARY KEY, name VARCHAR(100) NOT NULL);
CREATE TABLE orders (
  id      BIGINT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  amount  DECIMAL(10,2) NOT NULL
);`}</Code>
        <H3>The terms you must know</H3>
        <Table head={["Term", "Meaning"]} rows={[
          ["Schema", "The logical structure: tables, columns, types, constraints."],
          ["Row / tuple / record", "One entry in a table."],
          ["Column / attribute", "One property of the entity."],
          ["Primary key", "Uniquely identifies each row; never NULL."],
          ["Foreign key", "References a key in another table."],
          ["Candidate key", "Any minimal column set that could be the primary key."],
          ["Super key", "Any column set that uniquely identifies rows (may include extras)."],
          ["Alternate key", "A candidate key not chosen as the primary key."],
          ["Composite key", "A key made of several columns."],
          ["Natural vs surrogate key", "A real-world value (email) vs an artificial one (auto ID, UUID)."],
        ]} />
      </Sec>

      {/* 02 */}
      <Sec id="ddl" n={2} eyebrow="Structure" title="Data types, tables and SQL command categories" lead="Pick precise types, define tables with constraints, and know which family each command belongs to.">
        <Table head={["Type", "Use it for", "Note"]} rows={[
          ["INT / BIGINT / SMALLINT", "Whole numbers", "BIGINT for IDs that may exceed ~2 billion"],
          ["DECIMAL(p, s) / NUMERIC", "Money, exact values", "Never FLOAT for money"],
          ["FLOAT / DOUBLE", "Scientific, approximate values", "Rounding errors are expected"],
          ["CHAR(n) / VARCHAR(n) / TEXT", "Fixed, variable and long text", "VARCHAR for most strings"],
          ["DATE / TIME / TIMESTAMP", "Dates and times", "Store in UTC (TIMESTAMPTZ in PostgreSQL)"],
          ["BOOLEAN", "True / false", "MySQL maps it to TINYINT(1)"],
          ["JSON / JSONB", "Semi-structured data", "JSONB is indexable in PostgreSQL"],
        ]} />
        <Code title="Create a database and a table" lang="sql">{`
CREATE DATABASE targettrek;

CREATE TABLE products (
  id          BIGINT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  price       DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock       INT DEFAULT 0,
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`}</Code>
        <H3>SQL command categories</H3>
        <Cards cols={3} items={[
          ["DDL · definition", "CREATE, ALTER, DROP, TRUNCATE"],
          ["DML · manipulation", "INSERT, UPDATE, DELETE"],
          ["DQL · query", "SELECT"],
          ["DCL · control", "GRANT, REVOKE"],
          ["TCL · transactions", "BEGIN, COMMIT, ROLLBACK, SAVEPOINT"],
        ]} />
      </Sec>

      {/* 03 */}
      <Sec id="select" n={3} eyebrow="Reading and writing" title="INSERT and SELECT" lead="Add rows, then read back exactly the columns you need.">
        <Code title="INSERT" lang="sql">{`
INSERT INTO users (id, name, email, age, city)
VALUES (1, 'Rahul', 'rahul@example.com', 25, 'Delhi');

-- several rows in one statement
INSERT INTO users (id, name, email, age, city) VALUES
  (2, 'Priya', 'priya@example.com', 24, 'Pune'),
  (3, 'Aman',  'aman@example.com',  28, 'Noida');`}</Code>
        <Code title="SELECT" lang="sql">{`
SELECT * FROM users;                                   -- every column (avoid in production code)
SELECT name, email FROM users;                         -- only what you need
SELECT name AS user_name, email AS user_email FROM users;
SELECT name, age, age + 1 AS age_next_year FROM users; -- expressions`}</Code>
        <Call tone="tip" title="Always list your columns">Name the columns in INSERT so table changes don't break it, and in SELECT so you send less data and can benefit from covering indexes.</Call>
      </Sec>

      {/* 04 */}
      <Sec id="filtering" n={4} eyebrow="Filtering" title="WHERE, precedence, IN, BETWEEN and LIKE" lead="WHERE decides which rows a query reads, updates or deletes.">
        <Code title="Comparison and logic" lang="sql">{`
SELECT * FROM users WHERE age > 25;
SELECT * FROM users WHERE age >= 18 AND city = 'Delhi';
SELECT * FROM users WHERE city = 'Delhi' OR city = 'Pune';
SELECT * FROM users WHERE NOT city = 'Delhi';          -- also: city <> 'Delhi'`}</Code>
        <Call tone="warn" title="AND binds tighter than OR">Without parentheses, <code>city = 'Delhi' OR city = 'Mumbai' AND age &gt; 25</code> means “anyone in Delhi, or over-25s in Mumbai”. Always add parentheses when you mix them.</Call>
        <Code title="Make the intent explicit" lang="sql">{`
SELECT * FROM users
WHERE (city = 'Delhi' OR city = 'Mumbai') AND age > 25;`}</Code>
        <Code title="IN, BETWEEN and LIKE" lang="sql">{`
SELECT * FROM users WHERE city IN ('Delhi', 'Pune', 'Mumbai');
SELECT * FROM users WHERE city NOT IN ('Delhi', 'Pune');

SELECT * FROM products WHERE price BETWEEN 500 AND 1000;   -- inclusive on both ends

SELECT * FROM users WHERE name LIKE 'A%';     -- starts with A (can use an index)
SELECT * FROM users WHERE name LIKE '%dev%';  -- contains dev (can't use a normal index)
SELECT * FROM users WHERE name LIKE 'R_hul';  -- _ = exactly one character`}</Code>
      </Sec>

      {/* 05 */}
      <Sec id="null" n={5} eyebrow="Correctness" title="NULL, DISTINCT and ORDER BY" lead="NULL is the source of more wrong SQL answers than anything else.">
        <Prose><p>NULL means <Mark>unknown</Mark>, not zero and not an empty string. Any comparison with NULL gives UNKNOWN, and WHERE keeps only TRUE rows, so <code>= NULL</code> never matches anything. SQL uses three-valued logic: TRUE, FALSE, UNKNOWN.</p></Prose>
        <Code title="Handling NULL" lang="sql">{`
SELECT * FROM users WHERE phone = NULL;     -- wrong: always empty
SELECT * FROM users WHERE phone IS NULL;    -- right
SELECT * FROM users WHERE phone IS NOT NULL;

SELECT name, COALESCE(phone, alternate_phone, 'Not provided') AS phone FROM users;`}</Code>
        <Code title="DISTINCT and ORDER BY" lang="sql">{`
SELECT DISTINCT city FROM users;
SELECT DISTINCT city, age FROM users;            -- distinct pairs

SELECT * FROM users ORDER BY city ASC, age DESC;
SELECT * FROM orders ORDER BY created_at DESC, id DESC;   -- tie-breaker keeps order stable`}</Code>
        <Call tone="warn" title="Don't use DISTINCT to hide a bad join">If a join returns duplicates you didn't expect, the join is wrong. Fix the join condition instead of wrapping the query in DISTINCT.</Call>
      </Sec>

      {/* 06 */}
      <Sec id="pagination" n={6} eyebrow="Performance" title="LIMIT, OFFSET and keyset pagination" lead="OFFSET is fine for page 3. It's a disaster for page 30,000.">
        <Compare
          left={{ tone: "bad", title: "OFFSET pagination", items: ["LIMIT 20 OFFSET 600000 still walks past 600,000 rows", "Pages shift when new rows arrive", "Simple, and fine for small tables"] }}
          right={{ tone: "good", title: "Keyset (cursor) pagination", items: ["WHERE id > :lastSeenId ORDER BY id LIMIT 20", "Seeks directly through an index", "Stable even while data changes"] }}
        />
        <Code title="Both styles" lang="sql">{`
-- OFFSET
SELECT * FROM products ORDER BY id LIMIT 20 OFFSET 40;

-- keyset on one column
SELECT * FROM products WHERE id > 500 ORDER BY id LIMIT 20;

-- keyset on (created_at, id) for a newest-first feed
SELECT * FROM orders
WHERE (created_at, id) < ('2026-11-18 10:00:00', 5000)    -- row-value comparison
ORDER BY created_at DESC, id DESC
LIMIT 20;`}</Code>
      </Sec>

      {/* 07 */}
      <Sec id="modify" n={7} eyebrow="Changing data" title="UPDATE, DELETE, TRUNCATE, DROP and ALTER" lead="The commands that change data. One missing WHERE can ruin your day.">
        <Code title="UPDATE and DELETE" lang="sql">{`
UPDATE users SET age = 26 WHERE id = 1;
UPDATE products SET price = 899.00, updated_at = CURRENT_TIMESTAMP WHERE id = 100;

DELETE FROM users WHERE id = 5;
DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP;

UPDATE users SET active = FALSE;   -- no WHERE: every row changes
DELETE FROM users;                 -- no WHERE: every row is gone`}</Code>
        <Call tone="warn" title="Protect yourself">Run destructive statements inside a transaction, check the affected row count (or run the same WHERE as a SELECT first), and then COMMIT.</Call>
        <Table head={["Command", "Removes", "WHERE?", "Typical behaviour"]} rows={[
          ["DELETE", "Chosen rows", "Yes", "Row by row, logged, can roll back"],
          ["TRUNCATE", "All rows", "No", "Fast, keeps the table, often resets identity"],
          ["DROP", "The whole table", "No", "Structure, data and indexes are gone"],
        ]} />
        <Code title="ALTER TABLE" lang="sql">{`
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ADD COLUMN active BOOLEAN DEFAULT TRUE;
ALTER TABLE users DROP COLUMN phone;
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);`}</Code>
        <Call tone="info" title="ALTER on big production tables">Some changes rewrite or lock the whole table. Plan them as expand-and-contract migrations, and use online tools (pt-online-schema-change, gh-ost) or the engine's online DDL where needed.</Call>
      </Sec>

      {/* 08 */}
      <Sec id="constraints" n={8} eyebrow="Integrity" title="Constraints and foreign key actions" lead="Let the database enforce the rules, so bad data can't get in no matter which code path writes it.">
        <Code title="Constraints in one table" lang="sql">{`
CREATE TABLE employees (
  id            BIGINT PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  name          VARCHAR(100) NOT NULL,
  age           INT CHECK (age >= 18),
  status        VARCHAR(20) DEFAULT 'ACTIVE',
  department_id BIGINT,
  CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES departments(id)
);`}</Code>
        <Cards cols={3} items={[
          ["NOT NULL", "A value is required."],
          ["UNIQUE", "No duplicate values."],
          ["PRIMARY KEY", "Unique + not null; identifies the row."],
          ["FOREIGN KEY", "Must match a row in the referenced table."],
          ["CHECK", "A condition every row must satisfy."],
          ["DEFAULT", "The value used when none is given."],
        ]} />
        <H3>What happens when the referenced row changes</H3>
        <Table head={["Action", "Effect"]} rows={[
          ["ON DELETE CASCADE", "Deleting the parent deletes its children too."],
          ["ON DELETE SET NULL", "Children keep existing; their foreign key becomes NULL."],
          ["RESTRICT / NO ACTION", "The delete is blocked while children exist."],
          ["ON UPDATE CASCADE", "A changed parent key is copied to its children."],
        ]} />
        <Call tone="warn" title="Use CASCADE deliberately">One DELETE can silently remove thousands of rows across tables. Prefer RESTRICT on business data and CASCADE on genuinely owned child rows (for example, order_items of an order).</Call>
      </Sec>

      {/* 09 */}
      <Sec id="aggregation" n={9} eyebrow="Analysis" title="Aggregates, GROUP BY and HAVING" lead="Collapse many rows into summaries, per group, and filter those summaries.">
        <Code title="Aggregate functions" lang="sql">{`
SELECT COUNT(*)               FROM orders;   -- every row
SELECT COUNT(phone)           FROM users;    -- skips NULLs
SELECT COUNT(DISTINCT user_id) FROM orders;
SELECT SUM(amount), AVG(amount), MIN(amount), MAX(amount) FROM orders;`}</Code>
        <Code title="Per-group summaries" lang="sql">{`
SELECT user_id, COUNT(*) AS order_count, SUM(amount) AS total_spent
FROM   orders
WHERE  status = 'PAID'          -- rows, before grouping
GROUP  BY user_id
HAVING SUM(amount) > 10000;     -- groups, after aggregating`}</Code>
        <H3>The logical order of execution</H3>
        <Steps items={[
          ["FROM and JOIN", "Build the working set of rows."],
          ["WHERE", "Keep only rows that match."],
          ["GROUP BY", "Form groups."],
          ["HAVING", "Keep only groups that match."],
          ["SELECT", "Compute the output columns and aliases."],
          ["DISTINCT", "Remove duplicate output rows."],
          ["ORDER BY", "Sort (aliases from SELECT are visible here)."],
          ["LIMIT / OFFSET", "Return only part of the result."],
        ]} />
        <Call tone="interview" title="why can't I use the alias in WHERE?">Because WHERE runs before SELECT, so the alias doesn't exist yet. Explaining that with the execution order is a strong signal.</Call>
      </Sec>

      {/* 10 */}
      <Sec id="joins" n={10} eyebrow="Combining tables" title="Joins and set operations" lead="Joins combine columns from related tables; set operators combine whole result sets.">
        <Table head={["Join", "Returns"]} rows={[
          ["INNER JOIN", "Only rows that match on both sides."],
          ["LEFT JOIN", "Every left row, plus matches (NULLs where none)."],
          ["RIGHT JOIN", "Every right row, plus matches."],
          ["FULL OUTER JOIN", "Everything from both sides, matched where possible."],
          ["CROSS JOIN", "Every combination (rows × rows)."],
          ["SELF JOIN", "A table joined to itself, using aliases."],
        ]} />
        <Code title="The joins you'll use daily" lang="sql">{`
-- matching rows only
SELECT u.name, o.id AS order_id, o.amount
FROM   users u
JOIN   orders o ON o.user_id = u.id;

-- all users, with orders if they have any
SELECT u.name, o.id AS order_id
FROM   users u
LEFT   JOIN orders o ON o.user_id = u.id;

-- users with NO orders (anti-join)
SELECT u.id, u.name
FROM   users u
LEFT   JOIN orders o ON o.user_id = u.id
WHERE  o.id IS NULL;`}</Code>
        <Call tone="warn" title="The LEFT JOIN trap">A condition on the right table in WHERE (<code>WHERE o.status = 'PAID'</code>) turns your LEFT JOIN back into an INNER JOIN. Put it in the ON clause if you want to keep unmatched left rows.</Call>
        <Code title="Self join: employees and their managers" lang="sql">{`
SELECT e.name AS employee, m.name AS manager
FROM   employees e
LEFT   JOIN employees m ON e.manager_id = m.id;`}</Code>
        <Code title="Cross join: generate combinations" lang="sql">{`
SELECT c.name AS colour, s.name AS size
FROM   colours c
CROSS  JOIN sizes s;        -- 4 colours × 3 sizes = 12 rows`}</Code>
        <H3>Set operations</H3>
        <Code title="UNION, UNION ALL, INTERSECT, EXCEPT" lang="sql">{`
SELECT email FROM customers UNION     SELECT email FROM newsletter_users;  -- de-duplicated
SELECT email FROM customers UNION ALL SELECT email FROM newsletter_users;  -- keeps duplicates, faster
SELECT email FROM customers INTERSECT SELECT email FROM newsletter_users;  -- in both
SELECT email FROM customers EXCEPT    SELECT email FROM newsletter_users;  -- first, not second`}</Code>
      </Sec>

      {/* 11 */}
      <Sec id="subqueries" n={11} eyebrow="Nesting" title="Subqueries, correlated subqueries and EXISTS" lead="Queries inside queries, and the NULL trap that catches almost everyone.">
        <Code title="Scalar and multi-row subqueries" lang="sql">{`
-- products pricier than average (scalar: one value)
SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products);

-- users who placed a large order (multi-row)
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders WHERE amount > 5000);`}</Code>
        <Code title="Correlated subquery with EXISTS" lang="sql">{`
SELECT u.id, u.name
FROM   users u
WHERE  EXISTS (
  SELECT 1 FROM orders o
  WHERE  o.user_id = u.id AND o.amount > 5000   -- references the outer row
);`}</Code>
        <Call tone="warn" title="NOT IN and NULL">If <code>SELECT manager_id FROM employees</code> returns even one NULL, <code>WHERE id NOT IN (…)</code> returns <strong>no rows at all</strong>. Use NOT EXISTS for anti-joins.</Call>
        <Code title="The safe anti-join" lang="sql">{`
SELECT * FROM users u
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);`}</Code>
      </Sec>

      {/* 12 */}
      <Sec id="cte" n={12} eyebrow="Readability" title="Common table expressions and recursion" lead="Name your intermediate steps so complex queries read top to bottom, and walk hierarchies with recursion.">
        <Code title="A CTE" lang="sql">{`
WITH high_value_orders AS (
  SELECT id, user_id, amount FROM orders WHERE amount >= 5000
)
SELECT u.name, h.amount
FROM   high_value_orders h
JOIN   users u ON u.id = h.user_id;`}</Code>
        <Code title="Recursive CTE: an org chart" lang="sql">{`
WITH RECURSIVE employee_tree AS (
  SELECT id, name, manager_id, 1 AS level      -- anchor: the CEO
  FROM   employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.name, e.manager_id, t.level + 1   -- recursive step
  FROM   employees e
  JOIN   employee_tree t ON e.manager_id = t.id
)
SELECT * FROM employee_tree ORDER BY level, name;`}</Code>
        <Call tone="info" title="How recursion stops">Each round joins the previous round's rows; when a round produces no new rows, it stops. Bad data with a cycle (A manages B manages A) loops forever, so add a depth limit in production.</Call>
      </Sec>

      {/* 13 */}
      <Sec id="functions" n={13} eyebrow="Expressions" title="CASE and built-in functions" lead="Conditional logic and value transformations inside a query.">
        <Code title="CASE, and conditional aggregation" lang="sql">{`
SELECT name, price,
       CASE WHEN price >= 5000 THEN 'Premium'
            WHEN price >= 1000 THEN 'Mid range'
            ELSE 'Budget' END AS price_category
FROM products;

-- count several categories in one pass
SELECT COUNT(*) FILTER (WHERE status = 'PAID')     AS paid,      -- PostgreSQL
       SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) AS failed  -- portable
FROM orders;`}</Code>
        <Table head={["Family", "Functions", "Watch out"]} rows={[
          ["String", "UPPER, LOWER, LENGTH, CONCAT, TRIM, SUBSTRING", "Names vary (LEN in SQL Server)"],
          ["Numeric", "ROUND, ABS, CEIL, FLOOR, POWER, MOD", "Integer division truncates in some engines"],
          ["Date / time", "CURRENT_DATE, NOW(), DATE_TRUNC, INTERVAL", "Most engine-specific area; agree on UTC"],
          ["NULL handling", "COALESCE, NULLIF", "COALESCE returns the first non-NULL argument"],
        ]} />
      </Sec>

      {/* 14 */}
      <Sec id="window-functions" n={14} eyebrow="Interview favourite" title="Window functions" lead="Calculate across related rows without collapsing them. The most-asked advanced SQL topic.">
        <Compare
          left={{ tone: "plain", title: "GROUP BY", items: ["One row per group", "Detail rows disappear", "SUM(salary) per department"] }}
          right={{ tone: "plain", title: "Window function", items: ["Every row stays", "Adds a computed column", "Each employee + their department average"] }}
        />
        <Code title="A per-department average beside each row" lang="sql">{`
SELECT employee_id, department_id, salary,
       AVG(salary) OVER (PARTITION BY department_id) AS dept_avg_salary
FROM   employees;`}</Code>
        <Code title="ROW_NUMBER, RANK and DENSE_RANK" lang="sql">{`
SELECT employee_id, department_id, salary,
       ROW_NUMBER() OVER (PARTITION BY department_id ORDER BY salary DESC) AS row_num,
       RANK()       OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk,
       DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS dense_rnk
FROM   employees;`}</Code>
        <Table head={["Salary", "ROW_NUMBER", "RANK", "DENSE_RANK"]} rows={[
          ["100", "1", "1", "1"],
          ["100", "2", "1", "1"],
          ["90", "3", "3", "2"],
          ["80", "4", "4", "3"],
        ]} />
        <Code title="LAG, LEAD and a running total" lang="sql">{`
SELECT order_date, revenue,
       LAG(revenue)  OVER (ORDER BY order_date) AS prev_day,
       LEAD(revenue) OVER (ORDER BY order_date) AS next_day,
       revenue - LAG(revenue) OVER (ORDER BY order_date) AS change,
       SUM(revenue)  OVER (ORDER BY order_date
                           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM   daily_revenue;`}</Code>
      </Sec>

      {/* 15 */}
      <Sec id="normalization" n={15} eyebrow="Design" title="Normalisation and relationships" lead="Store each fact once; connect entities with keys.">
        <Table head={["Form", "Rule", "Goal"]} rows={[
          ["1NF", "Atomic values, no repeating groups", "No lists inside a column"],
          ["2NF", "1NF + no partial dependency", "Nothing depends on part of a composite key"],
          ["3NF", "2NF + no transitive dependency", "Non-key columns depend only on the key"],
          ["BCNF", "Every determinant is a candidate key", "Stricter 3NF"],
        ]} />
        <Compare
          left={{ tone: "bad", title: "Before: one wide table", items: ["orders(order_id, customer_name, customer_phone, products = 'Book, Pen, Bag')", "A list inside a column", "Customer data repeated on every order"] }}
          right={{ tone: "good", title: "After: normalised", items: ["customers(id, name, phone)", "orders(id, customer_id, created_at)", "products(id, name, price)", "order_items(order_id, product_id, quantity, price)"] }}
        />
        <H3>Relationship types</H3>
        <Cards cols={3} items={[
          ["One-to-one", "user → user_profile. The foreign key is also unique."],
          ["One-to-many", "user → orders. The foreign key is on the “many” side."],
          ["Many-to-many", "students ↔ courses, through a junction table."],
        ]} />
        <Code title="A many-to-many junction table" lang="sql">{`
CREATE TABLE student_courses (
  student_id BIGINT REFERENCES students(id),
  course_id  BIGINT REFERENCES courses(id),
  PRIMARY KEY (student_id, course_id)        -- a student enrols once per course
);`}</Code>
        <Call tone="info" title="Denormalise on purpose">Read-heavy systems sometimes duplicate selected data to avoid expensive joins. Do it for a measured hot path, with a plan to keep the copies in sync.</Call>
      </Sec>

      {/* 16 */}
      <Sec id="views" n={16} eyebrow="Abstraction" title="Views and materialised views" lead="Save a query under a name, or save its result.">
        <Table head={["", "View", "Materialised view"]} rows={[
          ["Stores", "The query", "The query and its result"],
          ["Freshness", "Always current", "Stale until refreshed"],
          ["Read speed", "Same as the query", "Fast (pre-computed)"],
          ["Use for", "Abstraction, access control", "Expensive reports and dashboards"],
        ]} />
        <Code title="Both" lang="sql">{`
CREATE VIEW active_users AS
SELECT id, name, email FROM users WHERE active = TRUE;

-- PostgreSQL
CREATE MATERIALIZED VIEW monthly_sales AS
SELECT DATE_TRUNC('month', created_at) AS month, SUM(amount) AS revenue
FROM   orders GROUP BY 1;

REFRESH MATERIALIZED VIEW monthly_sales;`}</Code>
      </Sec>

      {/* 17 */}
      <Sec id="indexes" n={17} eyebrow="Performance" title="Indexes and EXPLAIN" lead="Like the index at the back of a book: find the page instead of reading every page.">
        <Code title="Create an index, then use it" lang="sql">{`
CREATE INDEX idx_users_email ON users (email);
SELECT * FROM users WHERE email = 'rahul@example.com';   -- index lookup, not a full scan`}</Code>
        <Table head={["Index type", "Typical use", "Notes"]} rows={[
          ["B-tree", "Equality, ranges, ORDER BY", "The default, general-purpose"],
          ["Hash", "Equality only", "Support varies by engine"],
          ["Composite", "Multi-column filters", "Column order matters"],
          ["Unique", "Uniqueness + lookup", "Rejects duplicates"],
          ["Partial / filtered", "A subset of rows", "e.g. WHERE status = 'ACTIVE'"],
          ["Full-text", "Natural-language text search", "Use it, not LIKE '%word%'"],
          ["GIN / GiST", "Arrays, JSONB, full-text, geometry", "PostgreSQL"],
        ]} />
        <Call tone="warn" title="Indexes aren't free">They use storage, and every INSERT, UPDATE and DELETE must update them. Index real access patterns, not every column.</Call>
        <H3>Composite indexes and column order</H3>
        <Code title="Leftmost-prefix rule" lang="sql">{`
CREATE INDEX idx_orders_user_status_created ON orders (user_id, status, created_at);

-- great: equality, equality, then the sort column
SELECT * FROM orders WHERE user_id = 100 AND status = 'SUCCESS' ORDER BY created_at DESC;

-- fine: uses the first column
SELECT * FROM orders WHERE user_id = 100;

-- poor: skips the leading column
SELECT * FROM orders WHERE status = 'SUCCESS';`}</Code>
        <Prose><p>Put <strong>equality columns first and range or sort columns last</strong>. A <Mark>covering index</Mark> includes every column a query needs, so the database never touches the table.</p></Prose>
        <H3>Read the plan</H3>
        <Code title="EXPLAIN" lang="sql">{`
EXPLAIN SELECT * FROM orders WHERE user_id = 100;           -- the plan
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 100;   -- the plan + real timings (PostgreSQL)`}</Code>
        <Compare
          left={{ tone: "bad", title: "Look out for", items: ["Seq scan / full table scan on a big table", "Estimated rows far from actual", "Sorts that spill to disk", "Nested loops over large inputs"] }}
          right={{ tone: "good", title: "Typical fixes", items: ["Add or reorder an index", "ANALYZE to refresh statistics", "Rewrite the predicate to be sargable", "Filter earlier; select fewer columns"] }}
        />
      </Sec>

      {/* 18 */}
      <Sec id="transactions" n={18} eyebrow="Correctness" title="Transactions, ACID and isolation" lead="Group statements so they succeed or fail together, and decide how much concurrent work can see.">
        <Code title="Commit, roll back, savepoint" lang="sql">{`
BEGIN;
UPDATE accounts SET balance = balance - 1000 WHERE id = 1;
UPDATE accounts SET balance = balance + 1000 WHERE id = 2;
COMMIT;                                       -- both, or (on error) ROLLBACK for neither

BEGIN;
INSERT INTO orders (id, user_id) VALUES (9, 42);
SAVEPOINT order_created;
INSERT INTO payment_attempts (order_id) VALUES (9);
ROLLBACK TO SAVEPOINT order_created;          -- undo only the payment attempt
COMMIT;`}</Code>
        <Cards items={[
          ["Atomicity", "All of it happens, or none of it.", ShieldCheck],
          ["Consistency", "Constraints hold before and after.", ShieldCheck],
          ["Isolation", "Concurrent transactions don't interfere beyond the chosen level.", ShieldCheck],
          ["Durability", "Committed data survives a crash.", ShieldCheck],
        ]} />
        <Table head={["Isolation level", "Dirty read", "Non-repeatable read", "Phantom read"]} rows={[
          ["Read uncommitted", "Possible", "Possible", "Possible"],
          ["Read committed", "Prevented", "Possible", "Possible"],
          ["Repeatable read", "Prevented", "Prevented", "Engine-dependent"],
          ["Serializable", "Prevented", "Prevented", "Prevented"],
        ]} />
        <Cards cols={3} items={[
          ["Dirty read", "Seeing another transaction's uncommitted change."],
          ["Non-repeatable read", "The same row has a different value on a second read."],
          ["Phantom read", "A repeated range query returns new or missing rows."],
        ]} />
      </Sec>

      {/* 19 */}
      <Sec id="locking" n={19} eyebrow="Concurrency" title="Locking, optimistic concurrency and deadlocks" lead="How the database, and your code, keep concurrent updates from corrupting data.">
        <Table head={["", "Optimistic", "Pessimistic"]} rows={[
          ["Assumes", "Conflicts are rare", "Conflicts are likely"],
          ["Locks early", "No", "Yes"],
          ["Mechanism", "Version column", "SELECT … FOR UPDATE"],
          ["Concurrency", "High", "Lower"],
          ["On conflict", "Detect and retry", "Wait"],
        ]} />
        <Code title="Pessimistic: lock the row" lang="sql">{`
BEGIN;
SELECT * FROM inventory WHERE product_id = 100 FOR UPDATE;   -- others wait
UPDATE inventory SET stock = stock - 1 WHERE product_id = 100;
COMMIT;`}</Code>
        <Code title="Optimistic: check the version" lang="sql">{`
UPDATE products
SET    stock = stock - 1, version = version + 1
WHERE  id = 100 AND version = 7;
-- 0 rows affected → someone else changed it first; re-read and retry`}</Code>
        <H3>Deadlocks</H3>
        <Flow across steps={[
          { t: "Transaction A", s: "Holds row 1, needs row 2", i: Lock, tone: "bad" },
          { t: "Transaction B", s: "Holds row 2, needs row 1", i: Lock, tone: "bad" },
        ]} note="Each waits for the other. The database detects the cycle and aborts one as the victim." />
        <Cards items={[
          ["Lock in a consistent order", "e.g. always by ascending id."],
          ["Keep transactions short", "No user interaction or network calls inside."],
          ["Index the WHERE columns", "So fewer rows are locked."],
          ["Retry the victim", "Deadlock errors are expected; retry with backoff."],
        ]} />
      </Sec>

      {/* 20 */}
      <Sec id="db-logic" n={20} eyebrow="In-database logic" title="Stored procedures, triggers and partitioning" lead="Tools that run inside the database. Powerful, and easy to overuse.">
        <Compare
          left={{ tone: "plain", title: "Stored procedures and functions", items: ["Encapsulate repeated database work", "Fewer round trips for multi-step operations", "Can restrict direct table access", "Syntax is very engine-specific; harder to test"] }}
          right={{ tone: "plain", title: "Triggers", items: ["Run automatically on INSERT / UPDATE / DELETE", "Good for auditing and invariants", "Hidden behaviour that surprises developers", "Hard to debug when there are many"] }}
        />
        <Call tone="warn" title="Prefer visible logic">Keep business rules where application developers can see and test them. Use triggers deliberately, for audit trails or constraints the schema can't express.</Call>
        <H3>Table partitioning</H3>
        <Cards cols={3} items={[
          ["Range", "orders by month or year; old partitions drop cheaply."],
          ["List", "Rows by region or category."],
          ["Hash", "Rows spread by a hash of a key."],
        ]} />
        <Call tone="info" title="Partitioning isn't sharding">Partitioning splits one table inside one database server. Sharding spreads data across separate servers. See <Link className="rl-textlink" to="/resources/hld/database#sharding">Database design → sharding</Link>.</Call>
      </Sec>

      {/* 21 */}
      <Sec id="sql-injection" n={21} eyebrow="Security" title="SQL injection" lead="When user input becomes part of the SQL text, attackers can rewrite your query.">
        <Code title="Unsafe: never build SQL from input" lang="js">{`
// email = "' OR '1'='1"  →  returns every user
const sql = "SELECT * FROM users WHERE email = '" + email + "'";`}</Code>
        <Code title="Safe: parameterised query" lang="js">{`
const sql = "SELECT * FROM users WHERE email = ?";   // $1 in PostgreSQL drivers
await db.execute(sql, [email]);                      // the value is sent separately, as data`}</Code>
        <Cards items={[
          ["Parameterise every query", "Prepared statements or your driver's placeholders.", ShieldCheck],
          ["Allow-list identifiers", "Table and column names can't be parameters, so check them against a fixed list.", ShieldCheck],
          ["Least-privilege accounts", "The app user can't DROP tables.", ShieldCheck],
          ["Hide database errors", "Never show raw SQL errors to users.", ShieldCheck],
        ]} />
        <Call tone="warn" title="ORMs aren't automatically safe">Raw-query helpers and string-built filters in ORMs can still be injectable. Use their parameter binding.</Call>
      </Sec>

      {/* 22 */}
      <Sec id="optimization" n={22} eyebrow="Performance" title="Query optimisation" lead="Measure first: read the plan, then fix what it shows.">
        <Chips label="Optimisation checklist" items={["Select only needed columns", "Filter early", "Index real access patterns", "Index foreign keys used in joins", "Avoid needless DISTINCT and sorts", "Keep predicates sargable", "Avoid leading-wildcard LIKE on big tables", "Use the right data types", "Kill N+1 queries", "Batch writes", "Keep transactions short", "Keyset pagination", "Partition or archive huge history", "Watch the slow-query log"]} />
        <Code title="Common performance mistakes" lang="sql">{`
SELECT * FROM large_orders;                       -- 1. every column
SELECT id, user_id, amount FROM large_orders;     --    better

WHERE LOWER(email) = 'user@example.com'           -- 2. function on an indexed column
                                                  --    fix: store normalised, or an expression index

WHERE name LIKE '%developer%'                     -- 3. leading wildcard: no index
                                                  --    fix: full-text search

LIMIT 20 OFFSET 500000                            -- 4. huge offset → keyset pagination

SELECT * FROM users, orders;                      -- 5. accidental cartesian product`}</Code>
        <Call tone="tip" title="“Sargable” predicates">A predicate is sargable when the database can use an index for it: <code>created_at &gt;= '2026-01-01'</code> is; <code>YEAR(created_at) = 2026</code> usually isn't. Keep the indexed column bare on one side of the comparison.</Call>
      </Sec>

      {/* 23 */}
      <Sec id="schema-design" n={23} eyebrow="Putting it together" title="A real e-commerce schema" lead="How the concepts combine in a production-style relational design.">
        <Code title="Schema" lang="sql">{`
CREATE TABLE users      (id BIGINT PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE products   (id BIGINT PRIMARY KEY, name TEXT NOT NULL, price NUMERIC(10,2) NOT NULL, stock INT NOT NULL DEFAULT 0, active BOOLEAN DEFAULT TRUE);
CREATE TABLE orders     (id BIGINT PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id), status TEXT NOT NULL, total_amount NUMERIC(10,2) NOT NULL, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE order_items(id BIGINT PRIMARY KEY, order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, product_id BIGINT NOT NULL REFERENCES products(id), quantity INT NOT NULL CHECK (quantity > 0), unit_price NUMERIC(10,2) NOT NULL);
CREATE TABLE payments   (id BIGINT PRIMARY KEY, order_id BIGINT NOT NULL REFERENCES orders(id), provider TEXT NOT NULL, status TEXT NOT NULL, amount NUMERIC(10,2) NOT NULL, transaction_id TEXT UNIQUE, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE reviews    (id BIGINT PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id), product_id BIGINT NOT NULL REFERENCES products(id), rating INT CHECK (rating BETWEEN 1 AND 5), comment TEXT, UNIQUE (user_id, product_id));

CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);
CREATE INDEX idx_order_items_order    ON order_items (order_id);`}</Code>
        <Code title="Today's orders with item counts" lang="sql">{`
SELECT o.id AS order_id, u.name AS customer, o.status, o.total_amount, COUNT(oi.id) AS total_items
FROM   orders o
JOIN   users u        ON u.id = o.user_id
JOIN   order_items oi ON oi.order_id = o.id
WHERE  o.created_at >= CURRENT_DATE
GROUP  BY o.id, u.name, o.status, o.total_amount
ORDER  BY o.created_at DESC;`}</Code>
      </Sec>

      {/* 24 */}
      <Sec id="interview-queries" n={24} eyebrow="Interview practice" title="Solved interview queries" lead="The patterns that come up again and again in backend, data and SDE interviews. Try each one before reading the solution.">
        <Code title="Second-highest salary" lang="sql">{`
SELECT MAX(salary) AS second_highest
FROM   employees
WHERE  salary < (SELECT MAX(salary) FROM employees);`}</Code>
        <Code title="Nth-highest salary (here N = 3)" lang="sql">{`
WITH ranked AS (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk FROM employees
)
SELECT DISTINCT salary FROM ranked WHERE rnk = 3;`}</Code>
        <Code title="Duplicate emails" lang="sql">{`
SELECT email, COUNT(*) AS occurrences
FROM   users
GROUP  BY email
HAVING COUNT(*) > 1;`}</Code>
        <Code title="Delete duplicates, keep the lowest id" lang="sql">{`
DELETE FROM users u
USING  users d
WHERE  u.email = d.email AND u.id > d.id;          -- PostgreSQL; use a CTE + ROW_NUMBER elsewhere`}</Code>
        <Code title="Employees who earn more than their manager" lang="sql">{`
SELECT e.name AS employee, e.salary, m.name AS manager, m.salary AS manager_salary
FROM   employees e
JOIN   employees m ON e.manager_id = m.id
WHERE  e.salary > m.salary;`}</Code>
        <Code title="Top 3 salaries in every department" lang="sql">{`
WITH ranked AS (
  SELECT id, name, department_id, salary,
         DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk
  FROM   employees
)
SELECT * FROM ranked WHERE rnk <= 3;`}</Code>
        <Code title="Latest order for every user" lang="sql">{`
WITH ranked AS (
  SELECT o.*, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC, id DESC) AS rn
  FROM   orders o
)
SELECT * FROM ranked WHERE rn = 1;`}</Code>
        <Code title="Month-over-month revenue growth" lang="sql">{`
WITH monthly AS (
  SELECT DATE_TRUNC('month', created_at) AS month, SUM(amount) AS revenue
  FROM   orders WHERE status = 'SUCCESS'
  GROUP  BY 1
)
SELECT month, revenue,
       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
             / NULLIF(LAG(revenue) OVER (ORDER BY month), 0), 2) AS growth_pct
FROM   monthly ORDER BY month;`}</Code>
        <Code title="Users who logged in on 3+ consecutive days" lang="sql">{`
WITH days AS (
  SELECT DISTINCT user_id, login_date::date AS d FROM logins
), grp AS (
  SELECT user_id, d, d - (ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY d))::int AS island
  FROM days
)
SELECT user_id, MIN(d) AS from_day, MAX(d) AS to_day, COUNT(*) AS streak
FROM   grp GROUP BY user_id, island
HAVING COUNT(*) >= 3;     -- the "gaps and islands" trick`}</Code>
        <H3>Practise these next</H3>
        <Chips label="Practice problems" items={["First order for every customer", "Customers with more than 5 orders", "Most frequently purchased product", "Products above their category average", "Departments above the company average salary", "Records repeated 3 times in a row", "Running total per user", "Median salary per department"]} />
      </Sec>

      {/* 25 */}
      <Sec id="cheat-sheet" n={25} eyebrow="Revision" title="SQL cheat sheet" lead="The syntax you'll reach for most often, on one screen.">
        <Code title="Quick revision" lang="sql">{`
SELECT col1, col2 FROM t WHERE age >= 18 ORDER BY created_at DESC LIMIT 10;
SELECT city, COUNT(*) FROM users GROUP BY city HAVING COUNT(*) > 10;
SELECT * FROM users u JOIN orders o ON o.user_id = u.id;
SELECT * FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE o.id IS NULL;
SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products);
WITH data AS (SELECT * FROM orders) SELECT * FROM data;
SELECT name, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk FROM employees;
SELECT * FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
SELECT * FROM users WHERE phone IS NULL;
SELECT name, CASE WHEN age >= 18 THEN 'Adult' ELSE 'Minor' END FROM users;
CREATE INDEX idx_users_email ON users (email);
BEGIN; UPDATE accounts SET balance = balance - 100 WHERE id = 1; COMMIT;`}</Code>
        <Call tone="interview" title="what to master">Joins · GROUP BY + HAVING · subqueries and EXISTS · CTEs · window functions · normalisation · indexes and composite indexes · EXPLAIN · transactions, ACID, isolation · locking and deadlocks · pagination · optimisation · SQL injection · schema design.</Call>
      </Sec>
    </ReaderPage>
  );
}

