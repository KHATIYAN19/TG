import {
  Archive, ArrowsClockwise, ChartBar, Cpu, Database, Desktop, FileCode, Graph, Hash, Key, Lightning, MagnifyingGlass, Rows, ShieldCheck, Stack, Table as TableIcon,
  TreeStructure, Users, Waveform,
} from "@phosphor-icons/react";

import { Call, Cards, Chips, Code, Compare, Flow, H3, Mark, Prose, ReaderPage, Sec, Specs, Steps, Table } from "../resources/kit/Reader";

/* =====================================================================
   DATABASE DESIGN  (/resources/hld/database)
   Fifth guide in the system design path.
===================================================================== */
const GUIDE = {
  id: "db",
  path: "/resources/hld/database",
  short: "Database design",
  section: "System Design",
  seoTitle: "Database Design in System Design: SQL vs NoSQL, Sharding, Replication | Target Trek",
  description: "A free, complete database guide for system design interviews: SQL vs NoSQL and ten database families, normalization, ACID, isolation levels, locking, MVCC, CAP, indexes, query plans, connection pools, replication, sharding, consistent hashing, quorum, WAL, backups and a booking schema.",
  keywords: ["database design system design", "sql vs nosql", "database sharding", "database replication", "read replicas", "isolation levels", "optimistic vs pessimistic locking", "MVCC", "CAP theorem", "database indexing", "consistent hashing", "quorum reads writes", "RPO RTO", "HLD interview questions"],
  about: ["Database design", "SQL", "NoSQL", "Sharding", "Replication", "Transactions", "Indexing"],
  tags: ["System design", "Data", "Fundamental"],
  h1: "Database Design in System Design",
  sub: "How to choose a datastore from access patterns, keep data correct under concurrency, and scale it from one machine to many: transactions, indexes, replication and sharding.",
  answer: "Choose a database from your access patterns and correctness needs, not its popularity. Use a relational database (PostgreSQL, MySQL) when you need transactions, constraints and joins; a key-value, document, wide-column, search, time-series or vector store when one access pattern dominates. Scale in order: fix queries and indexes, pool connections, cache hot reads, add read replicas, partition and archive, and shard only when one primary can't handle the writes or the data.",
  minutes: 40,
  level: "Fundamental",
  updated: "2026-11-18",
  crumbs: [["Resources", "/resources"], ["System design", "/resources/hld"], ["Database design", "/resources/hld/database"]],
  learn: [
    "Ten database families, and how to pick from access patterns",
    "ACID, isolation levels, locking and MVCC",
    "Indexes, query plans and connection pools",
    "Replication, read/write splitting and replication lag",
    "Partitioning, sharding, hot shards and consistent hashing",
  ],
  toc: [
    { id: "fundamentals", label: "How to think about databases" },
    { id: "database-types", label: "Ten database families" },
    { id: "selection", label: "Which database to use" },
    { id: "normalization", label: "Normalisation" },
    { id: "acid", label: "ACID and BASE" },
    { id: "isolation", label: "Isolation levels" },
    { id: "locking", label: "Locking and MVCC" },
    { id: "cap", label: "CAP and consistency" },
    { id: "indexes", label: "Indexes and query plans" },
    { id: "pooling", label: "Connection pooling" },
    { id: "replication", label: "Replication" },
    { id: "sharding", label: "Partitioning and sharding" },
    { id: "consistent-hashing", label: "Consistent hashing and quorum" },
    { id: "durability", label: "WAL, buffer pool, backups" },
    { id: "operations", label: "Migrations and lifecycle" },
    { id: "scaling", label: "The scaling ladder" },
    { id: "bookmyshow", label: "Case study: booking schema" },
    { id: "failures", label: "Failures and metrics" },
  ],
  questions: [
    { q: "How do you choose between SQL and NoSQL?", a: "Start from access patterns and correctness. If you need multi-row transactions, constraints, joins and ad-hoc queries (payments, orders, bookings), use SQL. If one access pattern dominates at very large scale (key lookups, huge write volumes, flexible documents, full-text search, time ranges), a specialised NoSQL store may fit better. Many systems use both." },
    { q: "When would you choose PostgreSQL, MongoDB, Cassandra or Redis?", a: "PostgreSQL for transactional, relational data. MongoDB when records are naturally self-contained JSON documents with evolving fields. Cassandra for enormous write-heavy workloads with known query patterns and multi-node availability. Redis for sub-millisecond key-value access: cache, sessions, counters, rate limits, locks." },
    { q: "Why isn't Elasticsearch usually the source of truth?", a: "It's optimised for search and ranking, not transactions; indexing is near-real-time rather than immediate; and its durability and consistency guarantees are weaker than a primary database's. Keep the truth in the database and sync to the search index via events or change-data-capture." },
    { q: "OLTP vs OLAP?", a: "OLTP serves many small, low-latency reads and writes for live users, such as placing an order. OLAP runs large scans and aggregations over history for analytics and dashboards. They want different storage layouts (row vs column), so analytics usually moves to a warehouse like BigQuery, Snowflake or ClickHouse." },
    { q: "Normalisation vs denormalisation?", a: "Normalisation stores each fact once, avoiding update anomalies, at the cost of joins. Denormalisation duplicates selected data to make hot reads cheap, at the cost of keeping the copies in sync. Normalise by default; denormalise specific read paths you've measured to be slow." },
    { q: "What are the ACID properties?", a: "Atomicity: all of a transaction's changes happen or none do. Consistency: transactions keep the defined rules and constraints. Isolation: concurrent transactions don't interfere beyond the chosen isolation level. Durability: committed data survives crashes, typically via a write-ahead log." },
    { q: "Explain the isolation levels and the anomalies they prevent.", a: "READ UNCOMMITTED allows dirty reads. READ COMMITTED prevents dirty reads but allows non-repeatable reads. REPEATABLE READ keeps rows stable within a transaction; phantoms depend on the database. SERIALIZABLE behaves as if transactions ran one at a time. Higher levels mean fewer anomalies and less concurrency." },
    { q: "What is a lost update, and how do you prevent it?", a: "Two transactions read the same value, both modify it, and the second write silently overwrites the first. Prevent it with atomic updates (SET x = x + 1), pessimistic locks (SELECT … FOR UPDATE), optimistic locking with a version column, or a stricter isolation level." },
    { q: "Optimistic vs pessimistic locking?", a: "Pessimistic locking locks the row up front (SELECT … FOR UPDATE), so other writers wait. It's good when conflicts are frequent. Optimistic locking lets everyone proceed and checks a version on write (UPDATE … WHERE version = 7); if no rows change, someone else won and you retry. It's good when conflicts are rare." },
    { q: "What is MVCC?", a: "Multi-version concurrency control keeps several versions of a row, so readers see a consistent snapshot while writers create new versions, and reads don't block writes. PostgreSQL and MySQL InnoDB use it. Writers still lock rows against other writers, and old versions need cleanup (VACUUM, purge)." },
    { q: "Explain the CAP theorem correctly.", a: "When a network partition separates nodes, a distributed system must choose between consistency (refuse or delay requests it can't answer correctly) and availability (answer from whatever data it has). Without a partition you can have both; then the real trade-off is latency vs consistency, as PACELC puts it." },
    { q: "What is a database index, and why does it slow writes?", a: "A separate structure, usually a B-tree, that maps column values to rows so lookups don't scan the table. Every INSERT, UPDATE or DELETE must update each affected index too, and indexes take storage, so add the ones your real queries need, not every possible one." },
    { q: "What is a composite index, and why does column order matter?", a: "An index on several columns, such as (user_id, status). It's sorted by the first column, then the second, so it helps queries that filter on user_id, or on user_id and status, but not queries on status alone: the leftmost-prefix rule." },
    { q: "What does EXPLAIN ANALYZE show?", a: "The plan the optimiser chose (sequential vs index scan, join type and order) together with actual row counts and timings. Look for sequential scans on big tables, estimates far from actual rows, expensive sorts and nested loops over large inputs." },
    { q: "Why do applications use connection pools, and how can autoscaling exhaust connections?", a: "Opening a database connection is expensive, and each one uses database memory. A pool reuses a bounded set. But 200 autoscaled instances × 100 pooled connections is 20,000 connections, far more than most databases handle, so size pools globally or put a proxy like PgBouncer or RDS Proxy in front." },
    { q: "Single-leader vs multi-leader vs leaderless replication?", a: "Single-leader: one primary takes writes and followers copy them; simple and the common default. Multi-leader: several nodes accept writes, useful across regions, but you must resolve conflicts. Leaderless (Dynamo-style): clients write to and read from several replicas with quorums; highly available, but you reason about versions and repairs." },
    { q: "Synchronous vs asynchronous replication?", a: "Synchronous waits for a replica to confirm before acknowledging the write: stronger durability, higher latency. Asynchronous acknowledges immediately: fast, but replicas lag, and a failover can lose the newest writes. Many setups use semi-synchronous: wait for one replica, the rest async." },
    { q: "How do you solve read-after-write inconsistency with replicas?", a: "Route a user's reads to the primary for a short time after they write, read from the primary for consistency-sensitive screens, track the replication position and only use replicas that have caught up, or use a database that offers read-your-writes sessions." },
    { q: "Partitioning vs sharding?", a: "Partitioning splits a dataset into pieces, for example by month, often inside one database server. Sharding places those pieces on different servers so storage and write throughput scale horizontally. Sharding is partitioning across machines." },
    { q: "Hash vs range sharding, and what makes a good shard key?", a: "Hash sharding spreads keys evenly but makes range queries scatter across shards. Range sharding keeps ranges together but risks hot spots, for example all new data landing on the latest range. A good key has high cardinality, spreads traffic evenly, and matches the most common query so most requests touch one shard." },
    { q: "What is a hot shard, and how do you fix it?", a: "One shard gets far more traffic than the others, usually a celebrity or a skewed key. Fixes: cache its hot reads, add read replicas, salt the key (user:123#0..9), split that partition, precompute popular data, or choose a better shard key." },
    { q: "What is consistent hashing, and why virtual nodes?", a: "Nodes and keys are hashed onto a ring; each key belongs to the next node clockwise, so adding or removing a node moves only about 1/N of the keys. Virtual nodes give each server many points on the ring, which evens out load and spreads a failed node's keys across many servers." },
    { q: "What are N, R and W in quorum systems?", a: "N is the number of replicas, W the acknowledgements a write needs, and R the replicas a read consults. If R + W > N, read and write sets overlap, so a read normally sees the latest write. Real guarantees also depend on versioning, sloppy quorums and repair." },
    { q: "What is a write-ahead log?", a: "Before changing data pages, the database appends the change to a sequential, durable log and fsyncs it at commit. After a crash it replays the log to recover committed transactions. The same log feeds replication and point-in-time recovery." },
    { q: "Replication vs backup, and what are RPO and RTO?", a: "Replication copies every change, including an accidental DROP TABLE, so it's not a backup. Backups are point-in-time copies you can restore. RPO is how much data you can afford to lose (for example 5 minutes); RTO is how long recovery may take (for example 1 hour). Test restores regularly." },
    { q: "How would you run a zero-downtime schema migration?", a: "Expand and contract: add the new column or table in a backward-compatible way, deploy code that writes both and reads either, backfill old rows in small batches, switch reads, verify, and only later remove the old schema. Avoid one huge locking migration." },
    { q: "How would you scale a read-heavy vs a write-heavy database?", a: "Read-heavy: indexes, caching, read replicas, denormalised read models and CDNs for public data. Write-heavy: batch writes, simplify indexes, partition, move work to queues, choose a write-optimised store (LSM-based like Cassandra) where it fits, and eventually shard by a key that spreads writes evenly." },
    { q: "How would you prevent double seat booking in the database?", a: "Guard the final write with a conditional update (UPDATE … WHERE status = 'AVAILABLE' AND version = :v, and check that one row changed) or a SELECT … FOR UPDATE inside a short transaction, plus a unique constraint on (show_id, seat_id) in the bookings table. Use a Redis hold for the fast UX, and the database for correctness." },
  ],
  quiz: [
    { q: "Payments, orders and bookings need multi-row transactions and constraints. Which store fits best?", options: ["Key-value store", "Relational database", "Search engine", "Time-series database"], answer: 1, why: "Relational databases give ACID transactions, constraints and joins, which is exactly what money and inventory need." },
    { q: "Index on (user_id, status). Which query can NOT use it efficiently?", options: ["WHERE user_id = 42", "WHERE user_id = 42 AND status = 'PAID'", "WHERE status = 'PAID'", "WHERE user_id = 42 ORDER BY status"], answer: 2, why: "Composite indexes follow the leftmost-prefix rule. Filtering on status alone skips the first column." },
    { q: "A user updates their profile, refreshes, and sees the old value. Most likely cause?", options: ["A missing index", "Reading from a lagging async replica", "Deadlock", "Wrong isolation level"], answer: 1, why: "Read-after-write inconsistency: the write went to the primary, the read hit a replica that hasn't caught up." },
    { q: "Conflicts on a record are rare and you want high concurrency. Which locking style?", options: ["Pessimistic (SELECT … FOR UPDATE)", "Optimistic with a version column", "Table lock", "No locking"], answer: 1, why: "Optimistic locking lets everyone proceed and only retries the rare loser, so throughput stays high." },
    { q: "N = 3 replicas. Which R and W give overlapping read and write quorums?", options: ["R = 1, W = 1", "R = 1, W = 2", "R = 2, W = 2", "R = 1, W = 0"], answer: 2, why: "R + W = 4 > N = 3, so every read set overlaps every write set." },
    { q: "Someone runs DROP TABLE orders on the primary. What saves you?", options: ["Synchronous replicas", "Read replicas", "A tested backup with point-in-time recovery", "More shards"], answer: 2, why: "Replication faithfully copies the drop. Only backups (plus WAL archiving for PITR) can restore what was lost." },
  ],
  glossary: [
    ["OLTP / OLAP", "Transactional workloads for live users vs analytical scans over history."],
    ["ACID", "Atomicity, consistency, isolation, durability: the transaction guarantees."],
    ["Isolation level", "How much concurrent transactions can see of each other's work."],
    ["MVCC", "Keeping row versions so readers see a snapshot without blocking writers."],
    ["Index", "A sorted structure (usually a B-tree) that finds rows without a full scan."],
    ["Replica lag", "How far a replica trails the primary."],
    ["Sharding", "Splitting data across several database servers by a shard key."],
    ["Hot shard", "A shard getting disproportionate traffic."],
    ["Quorum", "The number of replicas that must agree for a read (R) or write (W) to count."],
    ["WAL", "Write-ahead log: changes are logged durably before data pages are updated."],
    ["RPO / RTO", "Maximum acceptable data loss / maximum acceptable recovery time."],
    ["Expand–contract", "A migration pattern: add the new schema, move over, then remove the old one."],
  ],
  takeaways: [
    "Choose the database from access patterns, transaction needs and consistency, not from what's popular.",
    "Relational by default for money, inventory and bookings; specialised stores for the access patterns they were built for.",
    "Know your isolation level, and prevent lost updates with atomic updates, locks or version checks.",
    "Indexes speed reads and cost writes. Design them from real queries and check with EXPLAIN ANALYZE.",
    "Replicas scale reads but lag, so route read-after-write traffic deliberately.",
    "Shard last, with a key that spreads load and keeps common queries on one shard.",
    "Replication is not backup. Define RPO and RTO and test restores.",
  ],
  faq: [
    { q: "How should I choose a database in a system design interview?", a: "List the access patterns first: read/write ratio, point lookups vs ranges vs search, transaction and consistency needs, relationships, data size and QPS. Then pick the store that fits, commonly a relational database for core transactional data plus specialised stores (cache, search, analytics) where needed, and explain the trade-off." },
    { q: "What is the difference between partitioning and sharding?", a: "Partitioning splits data into smaller pieces, often within one database server. Sharding distributes those pieces across multiple servers so storage and write capacity scale horizontally." },
    { q: "What is database replication?", a: "Replication keeps copies of data on multiple nodes. It improves availability (fail over to a replica), durability (more copies) and read scalability (serve reads from replicas), at the cost of possible replica lag." },
    { q: "What is a hot shard?", a: "A hot shard receives far more reads or writes than the others, usually because of a skewed shard key or a celebrity entity, so it becomes a bottleneck while other shards sit idle." },
    { q: "Is NoSQL faster than SQL?", a: "Not inherently. NoSQL stores are fast for the access patterns they're designed around, often by giving up joins or multi-row transactions. A well-indexed relational database is very fast for most workloads and scales further than many people assume." },
    { q: "When should I shard a database?", a: "Only after query tuning, indexes, connection pooling, caching, vertical scaling, read replicas, partitioning and archiving are no longer enough, typically when write throughput or data size exceeds what one primary can handle." },
  ],
  next: { title: "Message Queues", path: "/resources/hld/message-queue", text: "Move slow work off the request path: Kafka, RabbitMQ, consumer groups, ordering, retries, DLQs and exactly-once myths." },
  book: {
    path: "/book/system-design/hld", label: "HLD book", title: "See databases inside complete designs",
    text: "Learn how databases, caching, load balancing, queues, rate limiting, locking and scaling work together in complete interview-style architectures.",
    short: "Complete interview designs, end to end.",
    chips: ["SQL", "NoSQL", "Indexes", "Replication", "Sharding", "BookMyShow"],
  },
};

const FAMILIES = [
  { title: "Relational (SQL)", tag: "PostgreSQL · MySQL · SQL Server", facts: [["Built for", "Structured data, relationships, constraints and transactions."], ["Use for", "Payments, orders, bookings, inventory, accounts, wallets."], ["Strength", "ACID, joins, foreign keys, flexible queries, mature tooling.", "good"], ["Trade-off", "Schema changes need planning; horizontal write scaling takes work.", "cost"]] },
  { title: "Document", tag: "MongoDB · Couchbase · Firestore", facts: [["Built for", "Self-contained JSON-like documents with flexible fields."], ["Use for", "Catalogues, profiles, CMS content, varying metadata."], ["Strength", "Flexible schema, natural mapping to app objects.", "good"], ["Trade-off", "Duplication is common; complex relations are awkward.", "cost"]] },
  { title: "Key-value", tag: "Redis · DynamoDB · Aerospike", facts: [["Built for", "Getting a value by a known key, very fast."], ["Use for", "Cache, sessions, carts, counters, rate limits, flags."], ["Strength", "Very high throughput, easy to partition, TTLs.", "good"], ["Trade-off", "Few ad-hoc queries; access patterns must be known up front.", "cost"]] },
  { title: "Wide-column", tag: "Cassandra · ScyllaDB · HBase", facts: [["Built for", "Huge, distributed, write-heavy workloads."], ["Use for", "Event histories, feeds, IoT, messaging metadata."], ["Strength", "Massive write throughput, horizontal scale, availability.", "good"], ["Trade-off", "Model tables per query; a new query may need a new table.", "cost"]] },
  { title: "Graph", tag: "Neo4j · Neptune · JanusGraph", facts: [["Built for", "Traversing relationships between entities."], ["Use for", "Social graphs, fraud rings, recommendations, dependencies."], ["Strength", "Fast many-hop queries.", "good"], ["Trade-off", "Not for general CRUD; distributed traversal is hard.", "cost"]] },
  { title: "Time-series", tag: "TimescaleDB · InfluxDB · VictoriaMetrics", facts: [["Built for", "Timestamped measurements, appended continuously."], ["Use for", "Metrics, monitoring, sensors, telemetry, price ticks."], ["Strength", "Compression, retention, downsampling, time-window queries.", "good"], ["Trade-off", "Not a general transactional store.", "cost"]] },
  { title: "Search engine", tag: "Elasticsearch · OpenSearch · Solr", facts: [["Built for", "Full-text search with inverted indexes and ranking."], ["Use for", "Product search, autocomplete, log search, facets."], ["Strength", "Fuzzy matching, relevance, aggregations.", "good"], ["Trade-off", "Not the source of truth; needs syncing; heavy to operate.", "cost"]] },
  { title: "Vector", tag: "pgvector · Qdrant · Milvus · Pinecone", facts: [["Built for", "Nearest-neighbour search over embeddings."], ["Use for", "RAG, semantic search, image similarity, AI memory."], ["Strength", "Search by meaning, with metadata filters.", "good"], ["Trade-off", "Approximate search trades recall for speed; embeddings need refreshing.", "cost"]] },
  { title: "Columnar / analytical", tag: "ClickHouse · BigQuery · Snowflake", facts: [["Built for", "Scanning and aggregating huge datasets."], ["Use for", "Analytics, dashboards, BI, warehouses."], ["Strength", "Column compression, very fast GROUP BY and SUM.", "good"], ["Trade-off", "Poor at frequent small transactional writes.", "cost"]] },
  { title: "Distributed SQL", tag: "Spanner · CockroachDB · YugabyteDB", facts: [["Built for", "SQL and transactions across many nodes and regions."], ["Use for", "Global transactional apps, multi-region SQL."], ["Strength", "SQL + horizontal scale + replication.", "good"], ["Trade-off", "Distributed transactions add latency; often unnecessary early on.", "cost"]] },
];

export default function HLDDatabaseResource() {
  return (
    <ReaderPage guide={GUIDE}>
      {/* 01 */}
      <Sec id="fundamentals" n={1} eyebrow="Fundamentals" title="How should you think about databases?" lead="Pick storage from the application's access patterns and correctness needs. Popularity is not a requirement.">
        <Prose><p>Before you say PostgreSQL, MongoDB, Cassandra or Redis, answer the questions that actually decide storage design:</p></Prose>
        <Chips label="Questions to answer first" items={["Read patterns?", "Write patterns?", "Need transactions?", "Strong consistency?", "Relationships?", "Ad-hoc queries?", "Dataset size?", "Expected QPS?", "Read- or write-heavy?", "Range queries?", "Can data be stale?", "Global distribution?"]} />
        <Call tone="warn" title="Don't say “NoSQL scales, SQL doesn't”">Modern relational databases scale very far. NoSQL systems usually give up some relational features (joins, multi-row transactions) to excel at a specific distributed access pattern.</Call>
        <H3>OLTP vs OLAP: what kind of work is it?</H3>
        <Compare
          left={{ tone: "plain", title: "OLTP · transactions", items: ["Many small reads and writes", "Live, user-facing, low latency", "Frequent INSERT and UPDATE", "Point lookups by key", "PostgreSQL, MySQL, MongoDB"] }}
          right={{ tone: "plain", title: "OLAP · analytics", items: ["Large scans over history", "Aggregations, GROUP BY", "Dashboards and reports", "Column-oriented storage", "BigQuery, ClickHouse, Snowflake"] }}
        />
      </Sec>

      {/* 02 */}
      <Sec id="database-types" n={2} eyebrow="Storage models" title="Ten database families" lead="Each family is optimised for a different access pattern. Know what each is built for and what it gives up.">
        <Specs items={FAMILIES} />
      </Sec>

      {/* 03 */}
      <Sec id="selection" n={3} eyebrow="Decision guide" title="Which database should you use?" lead="Start from the access pattern, then pick the family built for it.">
        <Flow steps={[
          { t: "Identify the access pattern", s: "Transactions? Search? Analytics? Relationships?", i: Database, tone: "hot" },
          { row: [
            { t: "Transactions", s: "PostgreSQL / MySQL", i: TableIcon }, { t: "Flexible documents", s: "MongoDB", i: FileCode }, { t: "Key lookup", s: "Redis / DynamoDB", i: Key },
            { t: "Huge writes", s: "Cassandra", i: Rows }, { t: "Relationships", s: "Graph DB", i: Graph }, { t: "Metrics", s: "Time-series DB", i: Waveform },
            { t: "Text search", s: "Elasticsearch", i: MagnifyingGlass }, { t: "Semantic search", s: "Vector DB", i: Cpu }, { t: "Analytics", s: "ClickHouse / BigQuery", i: ChartBar },
          ] },
        ]} />
        <Call tone="ok" title="Polyglot persistence is normal">A large system might use PostgreSQL for transactions, Redis for cache and holds, Elasticsearch for search and ClickHouse for analytics. What matters is a clear reason for each one, and one source of truth for each piece of data.</Call>
      </Sec>

      {/* 04 */}
      <Sec id="normalization" n={4} eyebrow="Data modelling" title="Normalisation vs denormalisation" lead="Normalise to store each fact once. Denormalise on purpose, where a measured read path needs it.">
        <Compare
          left={{ tone: "plain", title: "Normalisation", items: ["Each fact stored once", "No update anomalies", "Separate entities, linked by keys", "Reads often need JOINs"] }}
          right={{ tone: "plain", title: "Denormalisation", items: ["Selected data duplicated", "Fewer expensive JOINs on hot paths", "Writes must update every copy", "Needs a sync strategy (events, triggers, jobs)"] }}
        />
        <Table head={["Normal form", "Rule"]} rows={[
          ["1NF", "Atomic values: no repeating groups or lists in a column."],
          ["2NF", "1NF, and no column depends on only part of a composite key."],
          ["3NF", "2NF, and no column depends on another non-key column."],
        ]} />
        <Call tone="interview" title="explain the why">Interviewers care far more about <em>why</em> you normalise or denormalise for this workload than about reciting normal forms.</Call>
      </Sec>

      {/* 05 */}
      <Sec id="acid" n={5} eyebrow="Transactions" title="ACID and BASE" lead="Two ways to reason about correctness: strict transactional guarantees, or availability first with eventual agreement.">
        <Cards items={[
          ["Atomicity", "All of a transaction's changes happen, or none do.", ShieldCheck],
          ["Consistency", "Transactions keep the defined rules and constraints valid.", ShieldCheck],
          ["Isolation", "Concurrent transactions interact only as the isolation level allows.", ShieldCheck],
          ["Durability", "Once committed, data survives crashes.", ShieldCheck],
        ]} />
        <Code title="A bank transfer is atomic" lang="sql">{`
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 'A';
UPDATE accounts SET balance = balance + 100 WHERE id = 'B';
COMMIT;   -- both happen, or (on error / ROLLBACK) neither does`}</Code>
        <H3>BASE</H3>
        <Cards cols={3} items={[
          ["Basically available", "The system keeps answering, even during failures."],
          ["Soft state", "State may change without new input as replicas converge."],
          ["Eventually consistent", "Given no new writes, all replicas agree eventually."],
        ]} />
      </Sec>

      {/* 06 */}
      <Sec id="isolation" n={6} eyebrow="Concurrency" title="Transaction isolation levels" lead="Isolation decides which effects of concurrent transactions you can observe. Stricter means fewer anomalies and less concurrency.">
        <Table head={["Level", "Dirty read", "Non-repeatable read", "Phantom read", "Concurrency"]} rows={[
          ["READ UNCOMMITTED", "Possible", "Possible", "Possible", "Highest"],
          ["READ COMMITTED", "Prevented", "Possible", "Possible", "High"],
          ["REPEATABLE READ", "Prevented", "Prevented", "Depends on DB", "Medium"],
          ["SERIALIZABLE", "Prevented", "Prevented", "Prevented", "Lowest"],
        ]} />
        <Cards items={[
          ["Dirty read", "Reading another transaction's uncommitted change."],
          ["Non-repeatable read", "The same row returns a different committed value later in your transaction."],
          ["Phantom read", "Re-running a range query returns rows that weren't there before."],
          ["Lost update", "Two transactions overwrite each other's change without noticing."],
        ]} />
        <Call tone="info" title="Know your defaults">PostgreSQL defaults to READ COMMITTED; MySQL InnoDB defaults to REPEATABLE READ. Defaults differ, so state the level your design relies on.</Call>
      </Sec>

      {/* 07 */}
      <Sec id="locking" n={7} eyebrow="Concurrency control" title="Locking and MVCC" lead="Two ways to protect a record many users update at once, and the mechanism that lets reads and writes coexist.">
        <Compare
          left={{ tone: "plain", title: "Pessimistic locking", text: "Lock first, then work. Good when conflicts are likely.", items: ["SELECT … FOR UPDATE", "Other writers wait", "Keep the transaction short"] }}
          right={{ tone: "plain", title: "Optimistic locking", text: "Work first, check on write. Good when conflicts are rare.", items: ["UPDATE … WHERE version = 7", "0 rows updated → someone else won; retry", "High concurrency"] }}
        />
        <Code title="Pessimistic" lang="sql">{`
BEGIN;
SELECT * FROM seats WHERE id = 10 FOR UPDATE;   -- others wait here
UPDATE seats SET status = 'BOOKED' WHERE id = 10;
COMMIT;`}</Code>
        <Code title="Optimistic" lang="sql">{`
UPDATE seats
SET    status = 'BOOKED', version = version + 1
WHERE  id = 10 AND version = 7;   -- affected rows = 0 means a conflict`}</Code>
        <H3>MVCC: multi-version concurrency control</H3>
        <Flow steps={[
          { t: "Transaction A", s: "Reads version 1", i: Users },
          { t: "Row version 1", s: "balance = 100", i: Database, tone: "hot" },
          { t: "Row version 2", s: "balance = 150", i: Database, tone: "good", via: "transaction B updates" },
        ]} note="A keeps reading its consistent snapshot (version 1) while newer transactions see version 2. Readers don't block writers." />
        <Call tone="info" title="MVCC doesn't mean “no locks”">Writers still lock rows against other writers, and schema changes take locks. MVCC removes unnecessary read/write blocking, and old versions must be cleaned up (VACUUM in PostgreSQL).</Call>
      </Sec>

      {/* 08 */}
      <Sec id="cap" n={8} eyebrow="Distributed systems" title="CAP and consistency models" lead="When the network splits, a distributed database must choose between answering and answering correctly.">
        <Cards cols={3} items={[
          ["Consistency", "Every read sees the latest write (or an error)."],
          ["Availability", "Every request to a live node gets a response."],
          ["Partition tolerance", "The system keeps working when nodes can't talk to each other."],
        ]} />
        <Call tone="warn" title="CAP is about behaviour during a partition">Partitions will happen, so the real choice is C or A <em>while</em> one is happening. Labelling a database “CA” or “CP” without saying what it does during a partition is misleading. When there's no partition, the trade-off is latency vs consistency (PACELC).</Call>
        <H3>Consistency is a spectrum</H3>
        <Table head={["Model", "What the client gets"]} rows={[
          ["Strong (linearizable)", "Reads always reflect the latest committed write."],
          ["Bounded staleness", "Reads may lag, but only by at most X seconds or versions."],
          ["Causal", "Causally related operations are seen in order."],
          ["Read-your-writes", "You always see your own updates."],
          ["Monotonic reads", "Once you've seen a newer value, you never see an older one."],
          ["Eventual", "Replicas may differ for a while, then converge."],
        ]} />
      </Sec>

      {/* 09 */}
      <Sec id="indexes" n={9} eyebrow="Performance" title="Indexes and query plans" lead="Indexes let the database find rows without reading the whole table. The optimiser decides whether to use them.">
        <Code title="Without an index: a full table scan" lang="sql">{`
SELECT * FROM users WHERE email = 'user@example.com';
-- may scan millions of rows to find one`}</Code>
        <Code title="With an index: a direct lookup" lang="sql">{`
CREATE INDEX idx_users_email ON users (email);`}</Code>
        <Cards items={[
          ["B-tree", "The default: equality, ranges, sorting."],
          ["Hash", "Equality lookups only."],
          ["Composite", "Several columns; follows the leftmost-prefix rule."],
          ["Covering", "Includes every column the query needs, so the table isn't touched."],
          ["Partial", "Indexes only some rows, e.g. WHERE status = 'ACTIVE'."],
          ["Full-text / spatial / vector", "Text search, geography, nearest-neighbour."],
        ]} />
        <Call tone="warn" title="Every index costs writes">Each INSERT, UPDATE and DELETE must update every affected index, and indexes take disk and memory. Add the ones real queries need.</Call>
        <H3>Composite index order matters</H3>
        <Code title="Leftmost-prefix rule" lang="sql">{`
CREATE INDEX idx_orders_user_status ON orders (user_id, status);

-- uses the index:  WHERE user_id = 42
-- uses the index:  WHERE user_id = 42 AND status = 'PAID'
-- can't use it well: WHERE status = 'PAID'`}</Code>
        <H3>How the optimiser picks a plan</H3>
        <Flow steps={[
          { t: "SQL query", i: FileCode },
          { t: "Parser + planner", s: "Generates candidate plans", i: TreeStructure, tone: "hot" },
          { t: "Cost estimator", s: "Uses statistics, cardinality, indexes", i: ChartBar },
          { t: "Execution plan", s: "Index scan / seq scan / join strategy", i: Database, tone: "good" },
        ]} />
        <Code title="Read the plan" lang="sql">{`
EXPLAIN ANALYZE
SELECT id, user_id, status
FROM   orders
WHERE  user_id = 42 AND status = 'PAID';`}</Code>
        <Compare
          left={{ tone: "bad", title: "Red flags in a plan", items: ["Seq scan on a huge table", "Estimated rows far from actual", "Expensive sorts", "Nested loops over large inputs"] }}
          right={{ tone: "good", title: "What fixes them", items: ["The right index", "Fresh statistics (ANALYZE)", "Rewriting the query", "Selective predicates first"] }}
        />
      </Sec>

      {/* 10 */}
      <Sec id="pooling" n={10} eyebrow="Connections" title="Connection pooling" lead="Opening a database connection per request is slow and eats database memory. Reuse a bounded set instead.">
        <Flow steps={[
          { row: [{ t: "App 1", i: Desktop }, { t: "App 2", i: Desktop }, { t: "App N", i: Desktop }] },
          { t: "Connection pool / proxy", s: "e.g. 50 shared connections (PgBouncer, RDS Proxy)", i: Stack, tone: "hot", via: "reuse bounded connections" },
          { t: "Database", i: Database },
        ]} />
        <Call tone="warn" title="Autoscaling can cause a connection explosion">200 app instances × 100 connections each = <strong>20,000</strong> connections. Most databases fall over long before that. Size pools against the database's total capacity, or put a pooling proxy in front.</Call>
      </Sec>

      {/* 11 */}
      <Sec id="replication" n={11} eyebrow="Availability and read scale" title="Replication" lead="Keep copies of the data on several nodes for availability, durability and read capacity.">
        <Flow steps={[
          { t: "Primary", s: "Accepts writes", i: Database, tone: "hot" },
          { row: [{ t: "Replica 1", s: "reads", i: Database }, { t: "Replica 2", s: "reads", i: Database }, { t: "Replica 3", s: "failover standby", i: Database }], via: "replicate" },
        ]} />
        <Cards cols={3} items={[
          ["Single leader", "One primary takes writes; followers copy them. The common default."],
          ["Multi leader", "Several nodes accept writes (e.g. per region). Conflicts must be resolved."],
          ["Leaderless", "Write to and read from several replicas with quorums (Dynamo, Cassandra)."],
        ]} />
        <Compare
          left={{ tone: "plain", title: "Synchronous", items: ["Wait for the replica's acknowledgement", "Stronger durability", "Higher write latency"] }}
          right={{ tone: "plain", title: "Asynchronous", items: ["Acknowledge immediately", "Low write latency", "Replica lag; failover can lose recent writes"] }}
        />
        <H3>Read/write splitting</H3>
        <Flow steps={[
          { row: [{ t: "Writes", i: Desktop }, { t: "Reads", i: Desktop }] },
          { row: [{ t: "Primary", s: "all writes", i: Database, tone: "hot" }, { t: "Replica router", s: "spreads reads", i: Stack }] },
          { row: [{ t: "R1", i: Database }, { t: "R2", i: Database }, { t: "R3", i: Database }] },
        ]} />
        <Call tone="warn" title="The read-after-write problem">A user saves their profile (primary), then refreshes and reads from a lagging replica and sees the old value. Send that user's reads to the primary for a few seconds after a write, or use only replicas that have caught up.</Call>
      </Sec>

      {/* 12 */}
      <Sec id="sharding" n={12} eyebrow="Horizontal scaling" title="Partitioning and sharding" lead="Split big data into pieces. Partitioning splits it; sharding puts the pieces on different machines.">
        <Compare
          left={{ tone: "plain", title: "Horizontal partitioning", text: "Split rows.", items: ["orders_2025, orders_2026, orders_2027", "Great for time-based data", "Old partitions can be archived or dropped cheaply"] }}
          right={{ tone: "plain", title: "Vertical partitioning", text: "Split columns or features.", items: ["users (id, email, name)", "user_profiles (user_id, bio, avatar, preferences)", "Hot narrow table, cold wide table"] }}
        />
        <H3>Sharding</H3>
        <Flow steps={[
          { t: "Application", i: Desktop },
          { t: "Shard router", s: "shard = f(shard key)", i: Hash, tone: "hot", via: "shard key" },
          { row: [{ t: "Shard A", s: "subset", i: Database }, { t: "Shard B", s: "subset", i: Database }, { t: "Shard C", s: "subset", i: Database }] },
        ]} />
        <Table head={["Strategy", "How", "Watch out for"]} rows={[
          ["Hash", "hash(key) mod N or a hash ring", "Range queries hit every shard"],
          ["Range", "Key ranges per shard (A–F, G–M…)", "Hot spots on popular or newest ranges"],
          ["Directory", "A lookup service maps entity → shard", "The directory must be fast and highly available"],
          ["Geo", "By region or country", "Users who move; global queries"],
        ]} />
        <Cards bad items={[
          ["Cross-shard joins", "Expensive or impossible; denormalise or join in the app."],
          ["Cross-shard transactions", "Need 2PC or sagas; avoid them by design."],
          ["Rebalancing", "Moving data when adding shards, without downtime."],
          ["Global uniqueness", "Unique constraints and IDs across shards (use Snowflake-style IDs)."],
        ]} />
        <H3>Hot shards: the celebrity problem again</H3>
        <Flow steps={[
          { row: [{ t: "User", i: Users }, { t: "User", i: Users }, { t: "Millions", i: Users }] },
          { row: [{ t: "Shard A", s: "overloaded", i: Database, tone: "bad" }, { t: "Shard B", s: "mostly idle", i: Database }, { t: "Shard C", s: "mostly idle", i: Database }], via: "celebrity:123" },
        ]} />
        <Compare
          left={{ tone: "good", title: "A good shard key", items: ["High cardinality", "Spreads traffic evenly", "Matches the most common query", "Avoids cross-shard queries"] }}
          right={{ tone: "plain", title: "Fixing a hot shard", items: ["Cache the hot reads", "Read replicas for that shard", "Salt the key (id#0 … id#9)", "Split the hot partition, or change the key"] }}
        />
      </Sec>

      {/* 13 */}
      <Sec id="consistent-hashing" n={13} eyebrow="Distribution" title="Consistent hashing and quorums" lead="Move as few keys as possible when nodes change, and decide how many replicas must agree.">
        <Prose><p>With <code>hash(key) mod N</code>, adding one node remaps almost every key. Consistent hashing places nodes and keys on a ring; each key belongs to the <Mark>next node clockwise</Mark>. Adding or removing a node moves only the keys next to it, about 1/N of them.</p></Prose>
        <Flow across steps={[
          { t: "Node A", i: Database }, { t: "Node B", i: Database }, { t: "Node C", i: Database }, { t: "Node D", i: Database },
        ]} note="Keys are hashed onto the same ring and owned by the next node. Virtual nodes give each server many ring positions for an even spread." />
        <H3>Quorum reads and writes</H3>
        <Table head={["Symbol", "Meaning", "Example"]} rows={[
          ["N", "Replicas of each item", "3"],
          ["W", "Acks needed for a write to succeed", "2"],
          ["R", "Replicas consulted on a read", "2"],
        ]} />
        <Call tone="warn" title="R + W > N is intuition, not the whole story">With R + W &gt; N, read and write sets overlap, so a read usually sees the latest write. Real guarantees also depend on versioning, conflict resolution, sloppy quorums and read repair.</Call>
      </Sec>

      {/* 14 */}
      <Sec id="durability" n={14} eyebrow="Durability" title="WAL, buffer pool and backups" lead="How committed data survives a crash, why most reads never touch disk, and why replication isn't a backup.">
        <Flow steps={[
          { t: "Application write", i: Desktop },
          { t: "Write-ahead log", s: "Durable, sequential record of the change", i: FileCode, tone: "hot" },
          { t: "Data pages", s: "Flushed to disk later", i: Database, via: "commit / ack" },
        ]} note="After a crash, the database replays the WAL to recover every committed transaction. The same log feeds replicas and point-in-time recovery." />
        <Flow across caption="The buffer pool" steps={[
          { t: "SQL query", i: FileCode },
          { t: "Buffer pool", s: "Hot pages in RAM", i: Lightning, tone: "hot" },
          { t: "Disk / SSD", i: Database, via: "miss" },
        ]} />
        <H3>Backups, RPO and RTO</H3>
        <Compare
          left={{ tone: "plain", title: "Backup techniques", items: ["Full and incremental backups", "Storage snapshots", "WAL archiving → point-in-time recovery", "Encrypted, cross-region copies"] }}
          right={{ tone: "plain", title: "Questions to answer", items: ["How much data can we lose?", "How fast must we be back?", "Have we actually tested a restore?", "Can we undo an accidental DELETE?"] }}
        />
        <Cards items={[
          ["RPO · recovery point objective", "The maximum data loss you accept, in time. “We can lose at most 5 minutes.”", Archive],
          ["RTO · recovery time objective", "The maximum time to restore service. “Back within 1 hour.”", ArrowsClockwise],
        ]} />
        <Call tone="warn" title="Replication is not backup">Replicas faithfully copy a <code>DROP TABLE</code> or a buggy mass update within milliseconds. Only backups restore the past.</Call>
      </Sec>

      {/* 15 */}
      <Sec id="operations" n={15} eyebrow="Production changes" title="Migrations, deletes, archival and security" lead="Large tables in production need careful changes, clear data lifecycles and real protection.">
        <H3>Zero-downtime schema migration (expand → contract)</H3>
        <Steps items={[
          ["Expand", "Add the new column or table in a backward-compatible way."],
          ["Dual-compatible code", "Deploy code that writes both and reads either representation."],
          ["Backfill", "Migrate existing rows in small, throttled batches."],
          ["Switch", "Move reads and writes to the new representation."],
          ["Verify", "Check data, metrics and errors."],
          ["Contract", "Remove the old schema in a later release."],
        ]} />
        <Call tone="warn" title="Avoid one huge migration">Rewriting hundreds of millions of rows in one transaction causes long locks, replication lag, WAL bloat and painful recovery.</Call>
        <H3>Soft delete vs hard delete</H3>
        <Compare
          left={{ tone: "plain", title: "Hard delete", items: ["DELETE FROM users WHERE id = 42;", "The row is gone", "Simple queries; meets erasure requests"] }}
          right={{ tone: "plain", title: "Soft delete", items: ["UPDATE users SET deleted_at = NOW() WHERE id = 42;", "Recoverable and auditable", "Every query must filter deleted rows"] }}
        />
        <H3>Hot, warm and cold data</H3>
        <Flow across steps={[
          { t: "Hot", s: "Primary DB, frequent access", i: Lightning, tone: "hot" },
          { t: "Warm", s: "Archive tables, cheaper storage", i: Database },
          { t: "Cold", s: "Object storage, long-term archive", i: Archive },
        ]} />
        <H3>Security</H3>
        <Compare
          left={{ tone: "plain", title: "Access", items: ["Least-privilege users per service", "Private networking, no public endpoint", "Secret rotation", "Audited admin access"] }}
          right={{ tone: "plain", title: "Data", items: ["TLS in transit, encryption at rest", "Encrypted backups", "Protect and minimise PII", "Retention policies"] }}
        />
      </Sec>

      {/* 16 */}
      <Sec id="scaling" n={16} eyebrow="Scaling strategy" title="The database scaling ladder" lead="Sharding is the last rung, not the first. Climb in order and measure at every step.">
        <Steps items={[
          ["Measure the bottleneck", "CPU, I/O, locks, cache hit rate, slow queries, connections."],
          ["Fix inefficient queries", "N+1 queries, SELECT *, missing filters."],
          ["Improve the schema", "Right types, constraints, normalisation."],
          ["Add the right indexes", "From real query patterns."],
          ["Pool connections", "Bounded pools, or a pooling proxy."],
          ["Cache hot reads", "Redis in front of expensive or popular queries."],
          ["Scale vertically", "A bigger machine is often the cheapest fix."],
          ["Add read replicas", "For read-heavy traffic."],
          ["Partition large tables", "By time or range."],
          ["Archive cold data", "Keep the primary lean."],
          ["Shard", "When one primary can't handle the writes or the data size."],
        ]} />
        <Call tone="ok" title="Measure before you scale">Every step should be justified by a metric. “The orders table does 8,000 writes/sec and the primary is at 85% CPU” is a reason to shard; “we might get big” is not.</Call>
      </Sec>

      {/* 17 */}
      <Sec id="bookmyshow" n={17} eyebrow="Case study" title="A ticket booking database" lead="A high-concurrency booking platform is a good example of using several stores, each for what it does best.">
        <Call tone="info" title="About this example">A conceptual design for learning, not a description of any company's private implementation.</Call>
        <Flow steps={[
          { t: "Users", i: Users },
          { t: "Booking service", i: Desktop, tone: "hot" },
          { row: [{ t: "PostgreSQL", s: "bookings + payments", i: TableIcon }, { t: "Redis", s: "seat holds + cache", i: Lightning }, { t: "Search", s: "movie discovery", i: MagnifyingGlass }, { t: "Analytics", s: "reporting", i: ChartBar }] },
        ]} />
        <Code title="Core schema" lang="sql">{`
CREATE TABLE shows (
  id BIGINT PRIMARY KEY, movie_id BIGINT NOT NULL, theatre_id BIGINT NOT NULL,
  screen_id BIGINT NOT NULL, start_time TIMESTAMPTZ NOT NULL
);

CREATE TABLE show_seats (
  show_id BIGINT NOT NULL REFERENCES shows(id),
  seat_id TEXT   NOT NULL,
  status  TEXT   NOT NULL DEFAULT 'AVAILABLE',   -- AVAILABLE | HELD | BOOKED
  price   NUMERIC(10,2) NOT NULL,
  version INT    NOT NULL DEFAULT 0,
  PRIMARY KEY (show_id, seat_id)
);

CREATE TABLE bookings (
  id BIGINT PRIMARY KEY, user_id BIGINT NOT NULL, show_id BIGINT NOT NULL,
  status TEXT NOT NULL, total_amount NUMERIC(10,2) NOT NULL,
  idempotency_key TEXT UNIQUE                        -- safe retries
);

CREATE TABLE booking_seats (
  booking_id BIGINT NOT NULL REFERENCES bookings(id),
  show_id BIGINT NOT NULL, seat_id TEXT NOT NULL,
  UNIQUE (show_id, seat_id)                          -- a seat can be sold once, ever
);`}</Code>
        <H3>Final guard against double booking</H3>
        <Code title="Optimistic conditional update" lang="sql">{`
UPDATE show_seats
SET    status = 'BOOKED', version = version + 1
WHERE  show_id = :showId AND seat_id = :seatId
  AND  status = 'AVAILABLE' AND version = :expectedVersion;
-- 0 rows updated → another transaction changed the seat first`}</Code>
        <Code title="Alternative: pessimistic lock" lang="sql">{`
BEGIN;
SELECT status FROM show_seats
WHERE  show_id = :showId AND seat_id = :seatId
FOR UPDATE;
-- verify AVAILABLE, then:
UPDATE show_seats SET status = 'BOOKED' WHERE show_id = :showId AND seat_id = :seatId;
COMMIT;`}</Code>
        <Prose><p>Redis still helps: a short-lived hold (<code>SET show:992:seat:A10:lock &lt;token&gt; NX PX 300000</code>) keeps the seat during checkout and absorbs contention. The database, with its conditional update and the <code>UNIQUE (show_id, seat_id)</code> constraint, is what guarantees a seat is sold once.</p></Prose>
        <Call tone="ok" title="Layered correctness">Redis for fast temporary state. SQL transactions, conditional updates and constraints for durable truth. Idempotency keys for safe retries.</Call>
      </Sec>

      {/* 18 */}
      <Sec id="failures" n={18} eyebrow="Production" title="Failures and metrics" lead="Good design covers what happens when the storage layer gets slow, fails or disagrees with itself.">
        <Table head={["Failure", "Response"]} rows={[
          ["Primary fails", "Promote a healthy replica (managed failover); clients reconnect and retry safely."],
          ["Replica lag", "Send consistency-sensitive reads to the primary; alert on lag."],
          ["Connection exhaustion", "Bounded pools, a pooling proxy, backpressure, timeouts."],
          ["Hot shard", "Cache, replicas, key salting, split or re-key."],
          ["Slow query", "EXPLAIN ANALYZE, indexes, statistics, lock waits."],
          ["Deadlock", "Short transactions, consistent lock order, retry the victim."],
          ["Disk full", "Capacity alerts, archival, cleanup, emergency expansion."],
          ["Backup failure", "Alert immediately; regularly test real restores."],
          ["Region failure", "Cross-region replicas and a rehearsed disaster-recovery runbook."],
        ]} />
        <H3>Metrics worth a dashboard</H3>
        <Chips label="Database metrics" items={["Query p50 / p95 / p99", "QPS", "CPU", "Memory", "Disk I/O", "Disk space", "Connections", "Pool wait time", "Cache hit ratio", "Replication lag", "Lock waits", "Deadlocks", "Slow queries", "Rows scanned", "Index usage", "Transaction & rollback rate", "Backup status"]} />
      </Sec>
    </ReaderPage>
  );
}

