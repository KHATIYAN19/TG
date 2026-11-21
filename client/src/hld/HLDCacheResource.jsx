import {
  ArrowsSplit, CheckCircle, Database, Desktop, Fire, Globe, HardDrives, Key, Lightning, Lock, Rocket, ShieldCheck, Stack, Timer, Users,
} from "@phosphor-icons/react";

import { Bullets, Call, Cards, Chips, Code, Compare, Flow, H3, Mark, Nots, Prose, ReaderPage, Sec, Specs, Table } from "../resources/kit/Reader";

/* =====================================================================
   CACHING IN SYSTEM DESIGN  (/resources/hld/cache)
   Everything that isn't body copy lives in GUIDE: SEO, hero, contents,
   interview Q&A, quiz, glossary, takeaways, FAQ. The kit renders those
   blocks and builds the structured data from the same object.
===================================================================== */
const GUIDE = {
  id: "cache",
  path: "/resources/hld/cache",
  short: "Caching",
  section: "System Design",
  seoTitle: "Caching in System Design: Strategies & Redis | Target Trek",
  description: "Free guide to caching in system design: cache-aside, write-through, write-back, TTL, LRU/LFU eviction, invalidation, cache stampede, hot keys and Redis design.",
  keywords: ["caching in system design", "cache aside vs read through", "write through vs write back", "cache invalidation", "cache stampede", "thundering herd", "hot key problem", "redis system design", "redis distributed lock", "LRU vs LFU", "HLD interview questions"],
  about: ["Caching", "Redis", "System design", "Distributed systems", "Cache invalidation", "Cache stampede"],
  tags: ["System design", "Performance", "Intermediate"],
  h1: "Caching in System Design",
  sub: "From first principles to millions of requests per second: where to cache, how reads and writes interact with the cache, how caches fail, and how to talk about all of it in an interview.",
  answer: "A cache is a small, fast store (usually memory) that keeps copies of data that is expensive to fetch or compute, so repeated requests skip the slow database or service. It trades freshness and extra complexity for lower latency and less load. The database stays the source of truth; the cache is an optimisation you must be able to invalidate, lose and rebuild safely.",
  minutes: 25,
  level: "Intermediate",
  updated: "2026-11-18",
  crumbs: [["Resources", "/resources"], ["System design", "/resources/hld"], ["Caching", "/resources/hld/cache"]],
  learn: [
    "The five caching strategies and when each one fits",
    "LRU, LFU, FIFO and TTL, and why TTL is not eviction",
    "How to stop a cache stampede and survive a hot key",
    "Designing Redis keys, TTLs and safe distributed locks",
    "A seat-booking design that never double-books",
  ],
  toc: [
    { id: "what-is-cache", label: "What is a cache?" },
    { id: "architecture", label: "Where you can cache" },
    { id: "strategies", label: "Caching strategies" },
    { id: "eviction", label: "Eviction policies" },
    { id: "invalidation", label: "Cache invalidation" },
    { id: "stampede", label: "Cache stampede" },
    { id: "hot-key", label: "The celebrity problem" },
    { id: "millions", label: "Millions of requests" },
    { id: "redis", label: "Designing Redis well" },
    { id: "bookmyshow", label: "Case study: seat booking" },
    { id: "failures", label: "Failure scenarios" },
    { id: "when-not", label: "When not to cache" },
  ],
  questions: [
    { q: "What problem does caching solve?", a: "It cuts latency and load by serving repeated reads from a faster layer instead of the database or a remote service. That lets the same backend absorb far more traffic and smooths out spikes. The cost is possible staleness, extra memory and another component that can fail." },
    { q: "What is the difference between cache-aside and read-through?", a: "In cache-aside the application owns the logic: it checks the cache, and on a miss it reads the database and writes the value into the cache. In read-through the application only talks to the cache, and the cache itself (or its library) loads missing values from the database. Read-through keeps application code simpler but needs a cache or library that supports loaders." },
    { q: "When would you choose write-through over write-back?", a: "Choose write-through when the cache and database must agree after every write and you can afford the extra write latency, for example account settings or inventory counts. Choose write-back when write throughput matters more and losing the last few seconds of writes is acceptable, for example view counters or analytics." },
    { q: "What is a cache stampede?", a: "When a popular key expires, many concurrent requests miss at the same moment and all go to the database to rebuild the same value. The database sees a sudden burst of identical expensive queries and can fall over, which is why it is also called the thundering herd problem." },
    { q: "How would you prevent a thundering herd?", a: "Let only one request rebuild the value (a mutex or single-flight) while others wait or get the stale value; add random jitter to TTLs so keys don't expire together; serve stale-while-revalidate; refresh very hot keys ahead of expiry; and rate-limit miss traffic to the database as a last line of defence." },
    { q: "What is TTL jitter?", a: "Adding a small random amount to each key's expiry time, for example 300 seconds plus 0 to 60 seconds. It spreads expirations out so thousands of keys written at the same time don't all expire in the same second and trigger a mass rebuild." },
    { q: "What is the celebrity or hot-key problem?", a: "One key receives far more traffic than any other, such as a celebrity's profile or a viral post. All of that traffic lands on the single shard that owns the key, so that node saturates even though the cluster as a whole has plenty of capacity." },
    { q: "How do you invalidate the cache after a database update?", a: "The usual pattern is: write to the database, then delete the cache key, and let the next read repopulate it. Deleting is safer than updating the cache because two concurrent updates can write cached values in the wrong order. Pair it with a TTL so any missed delete heals itself." },
    { q: "What happens if the database update succeeds but cache invalidation fails?", a: "The cache keeps serving the old value until it expires. Defences are a short TTL as a safety net, retrying the delete from a queue, driving invalidation from the database change log (change-data-capture), or using versioned keys so new writes simply use a new key." },
    { q: "What happens if Redis is unavailable?", a: "It depends on the data. For ordinary reads you can fail open and go to the database, but with a circuit breaker and rate limit so the database isn't flattened. For correctness-critical uses such as locks or rate limits you may need to fail closed and reject the operation. Decide this per use case before the outage, not during it." },
    { q: "How do you cache across many application servers?", a: "Use a shared distributed cache such as a Redis cluster so every server sees the same values, optionally with a small in-process cache on each server for the hottest data. Keys are spread across shards, usually with consistent hashing or hash slots." },
    { q: "What is the difference between an L1 local cache and an L2 distributed cache?", a: "L1 lives inside each application process: nanosecond to microsecond reads, no network hop, but each server has its own copy and keeping them in sync is hard, so TTLs are short. L2 is a shared network cache like Redis: about a millisecond away, consistent across servers, and much larger." },
    { q: "LRU vs LFU: when would you use each?", a: "LRU evicts what hasn't been used for the longest time, which works when recent access predicts future access, like sessions or feeds. LFU evicts what is used least often, which protects long-term popular items from being pushed out by a burst of one-off reads, like a product catalogue during a scan." },
    { q: "How would you design caching for millions of requests per second?", a: "Reduce traffic at every layer: browser and CDN for public content, an L1 cache in each server for the hottest keys, a sharded Redis cluster with replicas as L2, and only misses reaching a replicated, partitioned database. Add stampede protection, hot-key handling and monitoring of hit ratio and tail latency." },
    { q: "How would you prevent double booking using Redis?", a: "Hold the seat with an atomic SET key token NX PX ttl so only one request can create the hold, and store a unique token so only the holder can release it. Then confirm the booking in the database with a conditional update that only succeeds if the seat is still AVAILABLE." },
    { q: "Why must the database still protect final booking correctness?", a: "Redis locks can be lost on failover, expire while a slow request is still running, or be bypassed by a bug. The durable database is the source of truth, so a conditional update or unique constraint there is what actually guarantees one seat is sold once." },
    { q: "How do idempotency and caching interact in a payment or booking flow?", a: "Retries are normal, so every booking request carries an idempotency key. The first request does the work and stores its result under that key; retries return the stored result instead of booking or charging again. The cache can hold that result for speed, but the record of the payment must be durable." },
    { q: "What metrics would you monitor for Redis?", a: "Hit and miss ratio, p50/p95/p99 latency, memory use and fragmentation, eviction rate, expired keys, hot keys, connected clients, CPU and network throughput, and replication lag. A falling hit ratio or rising evictions is usually the first sign of trouble." },
  ],
  quiz: [
    { q: "Your app checks Redis, and on a miss reads the database and stores the result in Redis. Which strategy is this?", options: ["Read-through", "Cache-aside", "Write-through", "Write-back"], answer: 1, why: "The application itself checks, loads and populates the cache, which is cache-aside (lazy loading). In read-through the cache would load the data for you." },
    { q: "Which strategy risks losing data if the cache node crashes?", options: ["Cache-aside", "Write-through", "Write-back", "Read-through"], answer: 2, why: "Write-back acknowledges the write once it reaches the cache and persists to the database later, so anything not yet flushed is lost if the cache dies." },
    { q: "A hot key expires and 20,000 requests hit the database at once. What is the most direct fix?", options: ["Increase the database's connection pool", "Let one request rebuild the value while others wait or get stale data", "Switch eviction from LRU to LFU", "Remove the TTL from every key"], answer: 1, why: "Single-flight (a mutex on rebuild) or stale-while-revalidate stops the herd at its source. Bigger pools just let more identical queries through." },
    { q: "After updating a row, what is generally safer for the cache?", options: ["Update the cached value", "Delete the cached key", "Do nothing and wait for LRU", "Flush the whole cache"], answer: 1, why: "Deleting means the next read loads the fresh value. Updating the cache can race with another writer and leave the older value cached." },
    { q: "Why store a random token as the value of a Redis seat lock?", options: ["To make the key shorter", "So only the request that created the lock can delete it", "Because Redis needs a value for NX", "To speed up the GET"], answer: 1, why: "If the lock expires and someone else acquires it, the first holder must not delete the new holder's lock. Comparing the token before deleting prevents that." },
    { q: "TTL and eviction are…", options: ["The same thing", "TTL removes old data; eviction removes data when memory is full", "TTL is only for Redis; eviction only for Memcached", "Eviction removes old data; TTL removes data when memory is full"], answer: 1, why: "TTL is about freshness over time; eviction is about memory pressure. A production cache usually uses both." },
  ],
  glossary: [
    ["Cache hit / miss", "A hit is served from the cache; a miss has to go to the slower source."],
    ["Hit ratio", "Hits ÷ total reads. Below ~80% a cache often isn't paying for itself."],
    ["TTL", "Time to live: how long a key may stay before it expires."],
    ["Eviction", "Removing keys because memory is full, chosen by a policy such as LRU or LFU."],
    ["Cache-aside", "The application checks the cache and loads it on a miss. Also called lazy loading."],
    ["Write-back", "Writes go to the cache first and reach the database later, asynchronously."],
    ["Cache stampede", "Many requests rebuilding the same expired key at once. Also: thundering herd."],
    ["Hot key", "One key with far more traffic than the rest, overloading a single shard."],
    ["Single-flight", "Only one caller does the expensive rebuild; the rest share its result."],
    ["L1 / L2 cache", "L1 is in-process on each server; L2 is a shared network cache such as Redis."],
  ],
  takeaways: [
    "The database is the source of truth. A cache must be safe to lose, invalidate and rebuild.",
    "Name your strategy: cache-aside for most read-heavy systems, write-through for consistency, write-back for write throughput.",
    "On writes, update the database and delete the cache key. Keep a TTL as a safety net for missed deletes.",
    "Expect stampedes and hot keys at scale: single-flight, TTL jitter, local caches and key replication are the standard answers.",
    "Redis locks are for fast temporary holds; final correctness belongs in the database with a conditional update.",
    "Decide per use case what happens when the cache is down: fail open with protection, or fail closed.",
  ],
  faq: [
    { q: "What is caching in system design?", a: "Caching stores frequently used data in a faster layer, usually memory, so repeated requests avoid the slower database or service. It lowers latency and load at the cost of possible staleness and extra complexity." },
    { q: "Is Redis a cache or a database?", a: "Both, depending on use. Redis is an in-memory data store with optional persistence. In most system designs it is used as a cache or for short-lived shared state such as sessions, rate-limit counters and locks, with a durable database behind it." },
    { q: "What is a cache stampede?", a: "A cache stampede happens when a popular cached value expires and many requests miss at the same time, all hitting the database to rebuild it. It is prevented with single-flight rebuilds, TTL jitter, stale-while-revalidate and refresh-ahead." },
    { q: "What is the celebrity or hot-key problem?", a: "It occurs when one key gets far more traffic than others, overloading the single cache shard that holds it. Fixes include a local in-process cache, read replicas, replicating the key under several names, a CDN for public content and pre-warming." },
    { q: "Can Redis prevent double booking?", a: "Redis can hold a seat briefly with an atomic SET NX and a TTL, which handles high concurrency well, but the database must still enforce correctness with a conditional update, and the flow should be idempotent." },
    { q: "How long should a cache TTL be?", a: "As long as the data can safely be stale. Profiles might tolerate minutes, prices seconds, and static assets days. Add jitter so keys don't expire together, and rely on invalidation, not TTL alone, for data that must change immediately." },
  ],
  next: { title: "Database Design", path: "/resources/hld/database", text: "SQL vs NoSQL, indexing, replication, sharding, transactions and consistency: where cache misses end up." },
  book: {
    path: "/book/system-design/hld", label: "HLD book", title: "Master the full system design round",
    text: "Go beyond caching: requirements, APIs, data modelling, scaling, queues, locking and complete interview designs such as BookMyShow and Uber.",
    short: "Complete interview designs, end to end.",
    chips: ["Caching", "Databases", "Rate limiting", "Queues", "BookMyShow", "Uber"],
  },
};

const STRATEGIES = [
  { title: "Cache-aside", tag: "Lazy loading", facts: [["Read", "The app checks the cache. On a miss it reads the database and writes the result into the cache."], ["Write", "The app writes to the database and deletes the cached key."], ["Good for", "Read-heavy systems where only some rows are ever hot.", "good"], ["Trade-off", "The first read after a miss is slow, and data can be stale if a delete fails.", "cost"]] },
  { title: "Read-through", tag: "The cache loads for you", facts: [["Read", "The app asks the cache. The cache itself loads missing data from the store."], ["Write", "Depends on the cache; usually paired with write-through or invalidation."], ["Good for", "Keeping loading logic out of application code.", "good"], ["Trade-off", "Needs a cache or library that supports loaders.", "cost"]] },
  { title: "Write-through", tag: "Synchronous write", facts: [["Read", "Usually served straight from the cache."], ["Write", "Each write updates the cache and the database before success is returned."], ["Good for", "Data where cache and database must agree after every write.", "good"], ["Trade-off", "Slower writes, since two systems are updated each time.", "cost"]] },
  { title: "Write-back", tag: "Write-behind", facts: [["Read", "Usually served from the cache."], ["Write", "The write lands in the cache first; the database is updated later in batches."], ["Good for", "Very high write rates where a small delay is fine.", "good"], ["Trade-off", "Writes not yet flushed are lost if the cache fails.", "cost"]] },
  { title: "Refresh-ahead", tag: "Proactive refresh", facts: [["Read", "Hot keys are reloaded shortly before their TTL ends, so readers never see a miss."], ["Write", "Combined with another strategy, usually cache-aside."], ["Good for", "Very hot, predictable keys where an expiry would cause a spike.", "good"], ["Trade-off", "May refresh data nobody asks for again.", "cost"]] },
];

export default function HLDCacheResource() {
  return (
    <ReaderPage guide={GUIDE}>
      {/* 01 ─────────────────────────────────────────── */}
      <Sec id="what-is-cache" n={1} eyebrow="Fundamentals" title="What is a cache?" lead="A faster storage layer that keeps frequently used, or expensive-to-compute, data close to whoever needs it.">
        <Prose>
          <p>Say your app shows a user profile. Reading it from a distributed database might take 5 to 20 milliseconds and a little database CPU. Reading the same bytes from memory in Redis takes well under a millisecond and costs the database nothing. Do that for every page view and the difference decides whether you need one database or ten.</p>
          <p>That is the whole idea: <Mark>pay once to fetch something, then serve the copy many times</Mark>. Everything else in this guide is about the two hard parts, keeping the copy acceptably fresh and surviving when the cache misbehaves.</p>
        </Prose>
        <Compare
          left={{ tone: "bad", title: "Without a cache", text: "Every request reaches the database or downstream service.", items: ["Higher latency on every read", "More load on the database", "Traffic spikes hit the database directly"] }}
          right={{ tone: "good", title: "With a cache", text: "Repeated reads are served from memory.", items: ["Sub-millisecond reads for hot data", "Far fewer database queries", "Spikes are absorbed before the database"] }}
        />
        <Call tone="warn" title="A cache does not replace the database">The persistent database stays the source of truth. Treat the cache as a disposable optimisation: you should be able to wipe it and rebuild it from the database without losing anything.</Call>
      </Sec>

      {/* 02 ─────────────────────────────────────────── */}
      <Sec id="architecture" n={2} eyebrow="Architecture" title="Where can you cache?" lead="Almost every layer between the user and the database can cache something. Large systems combine several layers instead of relying on one Redis cluster.">
        <Flow caption="A request, layer by layer" steps={[
          { t: "User", s: "Browser or mobile app", i: Users },
          { t: "Browser / CDN cache", s: "Static assets, images, public pages", i: Globe, tone: "hot", via: "request" },
          { t: "Application servers", s: "Local in-memory (L1) cache", i: Desktop },
          { t: "Distributed cache", s: "Redis or Memcached (L2)", i: Lightning, tone: "hot" },
          { t: "Database", s: "Source of truth", i: Database, via: "cache miss" },
        ]} note={<><b>Each layer you hit saves the ones below it.</b> A CDN hit never reaches your servers; a Redis hit never reaches your database.</>} />
        <Cards items={[
          ["Browser cache", "CSS, JavaScript, fonts and cacheable API responses, controlled with Cache-Control and ETag headers.", Desktop],
          ["CDN / edge cache", "Static and public content stored in data centres close to users.", Globe],
          ["Local application cache", "A small per-process cache with microsecond reads. Each server has its own copy.", HardDrives],
          ["Distributed cache", "A shared cache such as Redis that every application server reads from.", Lightning],
          ["Database cache", "Buffer pools and page caches the database manages itself.", Database],
          ["Computed-result cache", "Expensive calculations: search results, recommendations, rendered pages.", Stack],
        ]} />
      </Sec>

      {/* 03 ─────────────────────────────────────────── */}
      <Sec id="strategies" n={3} eyebrow="Core interview topic" title="Caching strategies" lead="Saying “we'll add Redis” isn't an answer. Interviewers want to hear how reads and writes move between the cache and the database.">
        <Specs items={STRATEGIES} />
        <H3>Cache-aside, step by step</H3>
        <Flow across caption="Cache-aside read path" steps={[
          { t: "Client", i: Users },
          { t: "API", s: "GET /users/42", i: Desktop },
          { t: "Redis", s: "GET user:42 → miss", i: Lightning, tone: "hot" },
          { t: "Database", s: "SELECT … then SET in Redis", i: Database },
        ]} note="On a hit, the flow stops at Redis. On a miss, the API loads the row, stores it with a TTL, and returns it." />
        <Code title="Cache-aside read with a TTL" lang="js">{`
async function getUser(userId) {
  const key = \`user:\${userId}\`;

  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);           // hit

  const user = await db.getUser(userId);           // miss: go to the source
  if (!user) return null;

  await redis.set(key, JSON.stringify(user), "EX", 300); // keep for 5 minutes
  return user;
}`}</Code>
        <Call tone="interview" title="pick one out loud">Say which strategy you're using and why: “Cache-aside, because reads outnumber writes 100 to 1 and a few seconds of staleness on profiles is fine.” That one sentence shows you understand the trade-off.</Call>
      </Sec>

      {/* 04 ─────────────────────────────────────────── */}
      <Sec id="eviction" n={4} eyebrow="Memory management" title="Cache eviction policies" lead="Cache memory is finite. When it fills up, something has to go. The eviction policy decides what.">
        <Table head={["Policy", "Evicts", "Works well when"]} rows={[
          ["LRU", "The least recently used key", "Recent access predicts future access: sessions, feeds."],
          ["LFU", "The least frequently used key", "Long-term popular items must survive bursts of one-off reads."],
          ["FIFO", "The oldest inserted key", "You want the simplest possible policy."],
          ["TTL", "Keys whose time is up", "Data goes stale after a known period."],
          ["Random", "Any key", "Overhead matters more than precision."],
        ]} />
        <Call tone="info" title="TTL and eviction are different things">TTL removes data because it is <strong>too old</strong>. Eviction removes data because memory is <strong>full</strong>. Redis does both: keys expire by TTL, and a <code>maxmemory-policy</code> such as <code>allkeys-lru</code> decides what goes when memory runs out.</Call>
      </Sec>

      {/* 05 ─────────────────────────────────────────── */}
      <Sec id="invalidation" n={5} eyebrow="The hard part" title="Cache invalidation" lead="Caching is easy when data never changes. The hard part is keeping cached data fresh enough after writes.">
        <Cards cols={3} items={[
          ["Delete on write", "Update the database, then delete the key. The next read loads the fresh value. The usual default."],
          ["Update the cache", "Update the database, then overwrite the cached copy. Faster next read, but concurrent writers can race."],
          ["Let the TTL expire", "Accept stale data for a bounded time and let keys expire naturally. Simple, but never immediate."],
        ]} />
        <Code title="Update, then invalidate" lang="js">{`
async function updateUser(userId, changes) {
  await db.updateUser(userId, changes);   // 1. the source of truth first
  await redis.del(\`user:\${userId}\`);     // 2. drop the stale copy
  return { ok: true };
}`}</Code>
        <Call tone="warn" title="What if the database write succeeds but the delete fails?">Now Redis serves the old value until it expires. Protect yourself with a short TTL as a safety net, a retry queue for failed deletes, invalidation driven by the database change log (change-data-capture), or versioned keys such as <code>user:42:v7</code> so new writes simply use a new key.</Call>
      </Sec>

      {/* 06 ─────────────────────────────────────────── */}
      <Sec id="stampede" n={6} eyebrow="High traffic" title="Cache stampede (thundering herd)" lead="A hot key expires, and thousands of requests discover the miss in the same instant.">
        <Flow caption="What a stampede looks like" steps={[
          { row: [{ t: "Req 1", i: Users }, { t: "Req 2", i: Users }, { t: "Req 3", i: Users }, { t: "Req N", i: Users }] },
          { t: "Redis", s: "hot:key expired → miss for everyone", i: Lightning, tone: "hot" },
          { t: "Database", s: "Thousands of identical expensive queries at once", i: Database, tone: "bad", via: "all fall through" },
        ]} />
        <H3>Six ways to stop it</H3>
        <Cards items={[
          ["Single-flight / mutex", "Only one request rebuilds the value; the others wait for it or get the old one.", CheckCircle],
          ["TTL jitter", "Add a random offset to expiry times so keys don't all expire together.", CheckCircle],
          ["Stale-while-revalidate", "Serve the slightly stale value while one background job refreshes it.", CheckCircle],
          ["Refresh-ahead", "Reload very popular keys before their TTL runs out.", CheckCircle],
          ["Request coalescing", "Merge identical concurrent misses into one backend call.", CheckCircle],
          ["Rate-limit the misses", "Cap how much miss traffic may reach the database.", CheckCircle],
        ]} />
        <Code title="TTL jitter" lang="js">{`
const BASE_TTL = 300;                              // 5 minutes
const jitter = Math.floor(Math.random() * 60);     // + 0 to 59 seconds

// keys written together now expire across a whole minute, not one second
await redis.set(key, value, "EX", BASE_TTL + jitter);`}</Code>
      </Sec>

      {/* 07 ─────────────────────────────────────────── */}
      <Sec id="hot-key" n={7} eyebrow="Hot keys" title="The celebrity problem" lead="A celebrity posts, and tens of millions of people request the same profile. One key becomes far hotter than everything else, and its shard melts.">
        <Flow caption="One key, one shard, all the traffic" steps={[
          { row: [{ t: "User", i: Users }, { t: "User", i: Users }, { t: "User", i: Users }, { t: "User", i: Users }] },
          { t: "celebrity:123", s: "A single Redis key on a single shard", i: Fire, tone: "bad", via: "millions ask for the same key" },
        ]} note="The cluster has spare capacity overall, but sharding sends every request for this key to one node." />
        <Cards items={[
          ["Local L1 cache", "Keep the hot object inside each app server for a few seconds, so most requests never reach Redis.", HardDrives],
          ["Read replicas", "Spread reads for the key across replicas of its shard.", Stack],
          ["Key replication", "Store copies as hot:123:0 … hot:123:9 and read a random one, spreading load across shards.", Key],
          ["CDN / edge", "For public content, serve it from the edge and keep it away from your origin.", Globe],
          ["Longer TTL", "If freshness allows, don't rebuild extremely popular content often.", Timer],
          ["Pre-warming", "Load known hot data before a predictable event such as a sale or a match.", Rocket],
        ]} />
      </Sec>

      {/* 08 ─────────────────────────────────────────── */}
      <Sec id="millions" n={8} eyebrow="Scale" title="How do you handle millions of requests?" lead="One Redis node is not an architecture. At scale you shave traffic off at every layer before it can reach the primary database.">
        <Flow caption="Traffic shrinks at every layer" steps={[
          { t: "Millions of users", s: "Web and mobile", i: Users },
          { t: "CDN / edge", s: "Absorbs static and cacheable traffic", i: Globe, tone: "hot" },
          { t: "Load balancer", s: "Spreads requests across servers", i: ArrowsSplit },
          { row: [{ t: "API 1", s: "L1 cache", i: Desktop }, { t: "API 2", s: "L1 cache", i: Desktop }, { t: "API N", s: "L1 cache", i: Desktop }] },
          { t: "Redis cluster", s: "Sharded, replicated L2 cache", i: Lightning, tone: "hot" },
          { t: "Database cluster", s: "Primary, replicas, partitions", i: Database, via: "only misses" },
        ]} />
        <Call tone="ok" title="The goal is traffic reduction">If 95% of requests are answered before the database, a million requests per second means fifty thousand database reads, not a million. Quote the hit ratio you're designing for.</Call>
      </Sec>

      {/* 09 ─────────────────────────────────────────── */}
      <Sec id="redis" n={9} eyebrow="Distributed cache" title="Designing Redis well" lead="Redis is fast, but poor key design, missing TTLs or one hot shard still cause real outages.">
        <H3>Name keys like paths</H3>
        <Code title="Redis key naming" lang="text">{`
user:42
user:42:profile
product:1001
movie:778:show:992
show:992:seat:A10
show:992:seat:A10:lock
feed:user:42:v3`}</Code>
        <Cards items={[
          ["Use namespaces", "user:42 and product:42 never collide, and keys are easy to scan and debug."],
          ["Always set a TTL", "Keys without one go stale and use memory forever."],
          ["Keep values small", "Huge serialised objects cost network, CPU and memory on every read."],
          ["Watch the hit ratio", "A cache that rarely hits adds complexity for little gain."],
          ["Find hot keys early", "One popular key can overload a shard while the cluster looks healthy."],
          ["Plan for Redis being down", "Decide in advance what the app does without it."],
        ]} />
      </Sec>

      {/* 10 ─────────────────────────────────────────── */}
      <Sec id="bookmyshow" n={10} eyebrow="Case study" title="Seat booking with Redis locks" lead="Apply caching and distributed locking to a ticketing system where 100 people tap the same seat in the same second.">
        <Call tone="info" title="About this example">This is an interview-style design for a BookMyShow-like platform, showing how Redis can hold seats temporarily. It is not a description of any company's private production code.</Call>
        <H3>Seat states</H3>
        <Flow across steps={[
          { t: "AVAILABLE", s: "Can be selected", i: CheckCircle, tone: "good" },
          { t: "HELD", s: "Temporary Redis lock", i: Lock, tone: "hot" },
          { t: "BOOKED", s: "Saved in the database", i: ShieldCheck },
        ]} note={<>If payment fails, checkout is abandoned or the hold expires: <b>HELD → AVAILABLE</b>.</>} />
        <H3>The booking flow</H3>
        <Flow steps={[
          { t: "User selects seat A10", i: Users },
          { t: "Seat reservation API", s: "Validate the show and the seat", i: Desktop },
          { t: "Atomic Redis lock", s: "SET show:992:seat:A10:lock <token> NX PX 300000", i: Lock, tone: "hot" },
          { t: "5-minute hold", s: "Everyone else sees the seat as taken", i: Timer, via: "lock acquired" },
          { t: "Payment", s: "Idempotent, safe to retry", i: ShieldCheck },
          { t: "Database", s: "Conditionally mark the seat BOOKED", i: Database, via: "payment succeeded" },
        ]} />
        <Code title="Acquire a temporary seat hold" lang="js">{`
const lockKey = \`show:\${showId}:seat:\${seatId}:lock\`;
const token = crypto.randomUUID();          // proves who owns the lock

const acquired = await redis.set(lockKey, token, "NX", "PX", 5 * 60 * 1000);
if (!acquired) {
  throw new Error("Seat is already held by another user");
}
// continue to checkout…`}</Code>
        <H3>Why store a unique token?</H3>
        <Prose><p>User A gets the lock, then stalls. The lock expires and User B gets a new one for the same seat. When A finally cleans up, a plain <code>DEL</code> would delete <strong>B's</strong> lock. Checking the token first, atomically, prevents that.</p></Prose>
        <Code title="Safe unlock (Lua script, runs atomically in Redis)" lang="lua">{`
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end`}</Code>
        <H3>What happens when 100 people tap A10?</H3>
        <Flow steps={[
          { row: [{ t: "U1", i: Users }, { t: "U2", i: Users }, { t: "U3", i: Users }, { t: "U100", i: Users }] },
          { t: "Redis SET … NX", s: "Atomic: only one request can create the key", i: Lock, tone: "hot", via: "same seat" },
          { row: [{ t: "1 winner", s: "Gets the hold, goes to checkout", i: CheckCircle, tone: "good" }, { t: "99 others", s: "NX fails → “seat unavailable”", i: Users, tone: "bad" }] },
        ]} />
        <H3>Redis must not be your only protection</H3>
        <Prose><p>The Redis hold makes checkout fast under heavy concurrency, but locks can be lost on failover or expire mid-request. The final write must be guarded by the database itself:</p></Prose>
        <Code title="Final guard in the database" lang="sql">{`
UPDATE seats
SET    status = 'BOOKED', booking_id = :bookingId
WHERE  show_id = :showId
  AND  seat_id = :seatId
  AND  status  = 'AVAILABLE';   -- 0 rows updated means someone else won`}</Code>
        <Call tone="ok" title="Defence in depth">Redis gives a fast temporary hold. The database gives durable correctness. Idempotency keys make retries safe. The TTL cleans up abandoned checkouts.</Call>
        <Compare
          left={{ tone: "good", ordered: true, title: "Payment succeeds", items: ["Verify the payment", "Create the booking idempotently", "Mark the seat BOOKED in the database", "Release the Redis lock", "Publish a booking event"] }}
          right={{ tone: "bad", ordered: true, title: "Payment fails", items: ["Record the failed attempt", "Release the lock safely, using the token", "Or simply let the TTL expire", "The seat becomes AVAILABLE again", "Notify other viewers of the seat map"] }}
        />
      </Sec>

      {/* 11 ─────────────────────────────────────────── */}
      <Sec id="failures" n={11} eyebrow="Production engineering" title="Caching failure scenarios" lead="A strong design answer explains what happens when the happy path breaks.">
        <Table head={["What goes wrong", "What you do"]} rows={[
          ["Redis goes down", "Fail open or closed per use case. Profile reads can fall back to the database behind a circuit breaker and rate limit; seat locks need strict handling."],
          ["Cache and database disagree", "The database wins. Repair with TTLs, invalidation retries, versioned keys or change events."],
          ["Many keys expire together", "TTL jitter, refresh-ahead and staggered warm-up."],
          ["One key gets extremely hot", "Local cache, replicas, CDN, key replication or precomputed responses."],
          ["Redis memory is full", "Set a maxmemory policy, give every key a TTL, alert on evictions and fragmentation."],
          ["Network partition", "Decide if stale reads are acceptable; never treat a distributed lock as an absolute guarantee."],
        ]} />
        <H3>Metrics worth a dashboard</H3>
        <Chips label="Cache metrics" items={["Hit ratio", "Miss ratio", "p50 / p95 / p99 latency", "Memory used", "Evictions", "Hot keys", "Connections", "CPU", "Network I/O", "Replication lag"]} />
      </Sec>

      {/* 12 ─────────────────────────────────────────── */}
      <Sec id="when-not" n={12} eyebrow="Trade-offs" title="When should you not cache?" lead="Adding Redis to every design is not automatically good design. Skip the cache when:">
        <Nots items={[
          "The data changes constantly and stale reads are unacceptable.",
          "The query is already cheap and traffic is low.",
          "The expected hit ratio is tiny, because every request is unique.",
          "The operational cost of another system outweighs the speed-up.",
          "The data is sensitive and copying it needs a security model you don't have.",
          "Every read needs strong transactional consistency.",
        ]} />
        <Bullets items={[<>Rule of thumb: <strong>measure first</strong>. Add a cache when a specific read path is slow or expensive, and know the hit ratio you expect.</>]} />
      </Sec>
    </ReaderPage>
  );
}
