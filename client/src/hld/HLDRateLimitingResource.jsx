import { useEffect, useRef, useState } from "react";
import {
  ArrowsClockwise, ArrowsSplit, Cpu, Database, Desktop, Drop, Gauge, Globe, Key, Lightning, Prohibit, ShieldCheck, Users,
} from "@phosphor-icons/react";

import { Btn } from "../resume/ui";
import { Call, Cards, Chips, Code, Compare, Flow, H3, Mark, Prose, ReaderPage, Sec, Specs, Steps, Table } from "../resources/kit/Reader";

/* =====================================================================
   RATE LIMITING  (/resources/hld/rate-limiting)
   Third guide in the system design path. Includes a live token bucket.
===================================================================== */
const GUIDE = {
  id: "rl",
  path: "/resources/hld/rate-limiting",
  short: "Rate limiting",
  section: "System Design",
  seoTitle: "Rate Limiting: Token Bucket & Sliding Window | Target Trek",
  description: "Free guide to rate limiting in system design: fixed and sliding window, token bucket, leaky bucket, Redis and Lua, HTTP 429, plus a live token bucket simulator.",
  keywords: ["rate limiter system design", "token bucket algorithm", "leaky bucket algorithm", "sliding window rate limiter", "fixed window rate limiter", "redis rate limiter", "distributed rate limiter", "HTTP 429 Too Many Requests", "API throttling", "rate limiting interview questions"],
  about: ["Rate limiting", "Token bucket", "Sliding window", "Redis", "API throttling", "System design"],
  tags: ["System design", "Reliability", "Intermediate"],
  h1: "Rate Limiting in System Design",
  sub: "How systems protect themselves from abuse, spikes and runaway clients: every major algorithm, how to make it work across many servers with Redis, and what to do when the limiter itself breaks.",
  answer: "Rate limiting caps how much work a client may ask for: N requests per time window, or N operations in flight at once, keyed by IP, user, API key, tenant or route. Requests over the limit are rejected with HTTP 429 and a Retry-After header, or queued. Token bucket (allows short bursts) and sliding window counter (smooth, low memory) are the usual choices, enforced atomically in a shared store like Redis so every server sees the same count.",
  minutes: 35,
  level: "Intermediate",
  updated: "2026-11-18",
  crumbs: [["Resources", "/resources"], ["System design", "/resources/hld"], ["Rate limiting", "/resources/hld/rate-limiting"]],
  learn: [
    "Fixed window, sliding log, sliding counter, token bucket and leaky bucket",
    "Why per-server limits break, and how Redis and Lua fix it",
    "HTTP 429, Retry-After and avoiding retry storms",
    "Hot keys and global limits across regions",
    "Fail open vs fail closed, per endpoint",
  ],
  toc: [
    { id: "fundamentals", label: "What is rate limiting?" },
    { id: "where", label: "Where the limiter lives" },
    { id: "dimensions", label: "What to limit by" },
    { id: "fixed-window", label: "Fixed window counter" },
    { id: "sliding-log", label: "Sliding window log" },
    { id: "sliding-counter", label: "Sliding window counter" },
    { id: "token-bucket", label: "Token bucket" },
    { id: "leaky-bucket", label: "Leaky bucket" },
    { id: "concurrency", label: "Concurrency limits" },
    { id: "comparison", label: "Choosing an algorithm" },
    { id: "distributed", label: "Distributed limiting with Redis" },
    { id: "headers", label: "HTTP 429 responses" },
    { id: "burst", label: "Bursts and hot keys" },
    { id: "multi-region", label: "Multi-region limits" },
    { id: "bookmyshow", label: "Case study: flash sale" },
    { id: "failures", label: "Failures and metrics" },
  ],
  questions: [
    { q: "Why do we need rate limiting?", a: "To protect services and their dependencies from more work than they can handle, whether from abuse, bots, bugs or genuine spikes; to keep one tenant from starving others; to cap the cost of expensive operations like AI inference or SMS; and to enforce plan quotas." },
    { q: "Where should a rate limiter be placed?", a: "In layers. Coarse per-IP and bot limits at the CDN or WAF, per-user, per-API-key and per-plan quotas at the API gateway, and business rules such as one OTP every 30 seconds inside the service. Each layer rejects what it can see cheapest." },
    { q: "Rate limiting vs throttling?", a: "They're often used interchangeably. A useful distinction: rate limiting rejects requests over the limit (429), while throttling slows them down by queueing or delaying them so they're served later at a controlled rate." },
    { q: "Explain the fixed window counter and its boundary problem.", a: "Count requests per key in fixed buckets, such as each calendar minute, and reject once the count passes the limit. It's cheap, one counter with a TTL, but a client can send the full limit at 10:00:59 and again at 10:01:00, so up to double the limit passes in about a second." },
    { q: "Explain the sliding window log. Why is it memory-heavy?", a: "Store a timestamp for every request (for example in a Redis sorted set), drop entries older than the window, and count what's left. It's exact, but it stores one entry per request, so a 1,000-per-minute limit means up to 1,000 entries per key." },
    { q: "Explain the sliding window counter.", a: "Keep counts for the current and previous fixed windows and weight the previous one by how much of it still overlaps the rolling window: estimate = previous × (1 − elapsed fraction) + current. It's nearly as smooth as a log with just two counters per key." },
    { q: "Explain the token bucket. Why does it allow bursts?", a: "A bucket holds up to C tokens and refills at R tokens per second; each request takes a token or is rejected. A client that has been quiet has a full bucket and can burst C requests at once, but its sustained rate can never exceed R." },
    { q: "Token bucket vs leaky bucket?", a: "Token bucket limits the average rate but lets bursts through when tokens have saved up. Leaky bucket queues incoming requests and lets them out at a constant rate, so output is smooth and bursts wait or overflow. Use token bucket for APIs, leaky bucket to protect something that needs steady input." },
    { q: "What is concurrency limiting, and how is it different from an RPS limit?", a: "It caps how many operations are in progress at once, for example at most 20 AI generations running at a time. An RPS limit caps how many requests start per second. When request durations vary wildly, concurrency is what actually protects CPU, GPU or connection pools." },
    { q: "How do you rate limit across many application servers?", a: "Per-server counters let each server allow the full limit, so three servers mean three times the limit. Keep the counter in shared, fast state, usually Redis, keyed by identity, and update it atomically; or use a gateway that does this for you." },
    { q: "How do race conditions break a rate limiter, and how does Lua help?", a: "If two requests both read 99, both decide they're under 100, and both increment, the limit is exceeded. A Redis Lua script runs atomically on the server, so the read, the check and the update happen as one step with no other command in between." },
    { q: "What should a client receive when it's rate limited?", a: "HTTP 429 Too Many Requests with a Retry-After header (seconds, or an HTTP date), ideally plus RateLimit-Limit, RateLimit-Remaining and RateLimit-Reset headers, and a clear JSON error body. Clients should wait at least Retry-After and back off with jitter." },
    { q: "How do you prevent retry storms after 429s?", a: "Always send Retry-After, add jitter on the client so retries spread out, use exponential backoff with a cap, and make SDKs honour these by default. The limiter should also be cheap enough that rejecting requests doesn't overload it." },
    { q: "How do free and premium users get different limits?", a: "The gateway resolves the caller's plan from the token or API key, looks up that plan's rule (for example 100 vs 5,000 per minute, with its own burst size) and builds the limiter key from the identity, such as rate:plan:pro:user:42." },
    { q: "How would you rate limit OTP generation?", a: "Use several keys at once: per phone number (one every 30 seconds and five per hour), per IP and per device, plus a daily cap. Fail closed if the limiter is unavailable, because SMS costs money and OTP floods are a common abuse vector." },
    { q: "How do you handle a hot key in the rate limiter?", a: "Enforce a local per-instance limit first so most excess traffic never reaches Redis, reject obvious floods at the edge, shard the counter across several keys for approximate limits, or give very large tenants dedicated limiter capacity." },
    { q: "How would you implement a global limit across regions?", a: "Choose by how exact it must be. A central counter is exact but adds cross-region latency and a dependency. Splitting the quota between regions is fast but can strand unused quota. Locally enforced limits with asynchronous global sync are fast but may briefly overshoot. Most systems use a hybrid." },
    { q: "Exact vs approximate rate limiting: when does it matter?", a: "Abuse protection can tolerate a few percent of overshoot, so approximate algorithms and async sync are fine. Billing quotas, paid API credits or anything with real cost per call needs stronger, exact enforcement." },
    { q: "When would you fail open, and when fail closed?", a: "Fail open (allow traffic when the limiter is down) for low-risk reads where availability matters more than strict quotas. Fail closed for login, OTP, payments and expensive operations where unlimited access is dangerous. A local in-memory limit is a good middle ground for both." },
    { q: "How would you protect an expensive AI inference endpoint?", a: "Combine a per-user token bucket for request rate, a per-user and global concurrency limit for in-flight jobs, a quota on tokens or credits per day, and a queue with backpressure when GPUs are saturated, returning 429 or 503 with Retry-After." },
  ],
  quiz: [
    { q: "Limit: 100 requests per minute, fixed windows. What is the most a client can get through in about 2 seconds?", options: ["100", "101", "200", "Unlimited"], answer: 2, why: "100 at 10:00:59 and another 100 at 10:01:00. That is the fixed-window boundary problem." },
    { q: "Which algorithm lets a quiet client burst, but caps its long-run average rate?", options: ["Leaky bucket", "Token bucket", "Fixed window", "Concurrency limit"], answer: 1, why: "Unused tokens accumulate up to the bucket's capacity, so a burst can spend them; refill rate caps the sustained average." },
    { q: "Three API servers each keep their own counter with a limit of 100/min. What can a user actually get?", options: ["100/min", "Up to 300/min", "33/min", "It depends on the algorithm"], answer: 1, why: "Each server independently allows 100. Shared state (e.g. Redis) is needed for one true limit." },
    { q: "Two requests read the counter as 99 at the same moment and both are allowed. What fixes this?", options: ["A longer TTL", "An atomic check-and-increment, e.g. a Lua script", "More Redis replicas", "Sliding window log"], answer: 1, why: "The bug is a non-atomic read-modify-write. Doing the check and the update in one atomic operation removes the race." },
    { q: "Your AI endpoint's requests take 1 to 60 seconds. What protects the GPUs best?", options: ["A requests-per-second limit only", "A concurrency limit on in-flight jobs", "IP-based fixed windows", "Longer client timeouts"], answer: 1, why: "With wildly varying durations, limiting how many jobs run at once is what bounds GPU usage." },
    { q: "Redis is down. Which endpoint should fail closed?", options: ["GET /movies", "GET /search", "POST /otp/send", "GET /health"], answer: 2, why: "Unlimited OTP sends cost money and enable abuse. Low-risk reads can fail open or fall back to local limits." },
  ],
  glossary: [
    ["Rate limit", "A cap on requests per time window for a given key (user, IP, API key…)."],
    ["Limiter key", "The identity a quota belongs to, e.g. rate:user:42:route:/payments."],
    ["Fixed window", "Counts per calendar interval; cheap, but allows bursts at the boundaries."],
    ["Sliding window", "Counts over the last N seconds from now: exact with a log, approximate with two counters."],
    ["Token bucket", "Tokens refill at rate R up to capacity C; each request spends one."],
    ["Leaky bucket", "Requests queue and leave at a constant rate, smoothing bursts."],
    ["Concurrency limit", "A cap on operations in flight at the same time."],
    ["HTTP 429", "Too Many Requests: the standard response to a client over its limit."],
    ["Retry-After", "Response header telling the client how long to wait before retrying."],
    ["Fail open / closed", "Allow, or reject, traffic when the limiter itself is unavailable."],
  ],
  takeaways: [
    "Rate limiting protects capacity, cost and fairness. It's a safety system, not a feature.",
    "Layer it: coarse limits at the edge, identity-based quotas at the gateway, business rules in the service.",
    "Pick the key carefully: IP alone is unfair behind NAT; prefer user, API key or tenant once authenticated.",
    "Token bucket for APIs that should allow bursts; sliding window counter for smooth limits at low memory; concurrency limits for slow, expensive work.",
    "Across servers, keep counters in shared state (Redis) and update them atomically with Lua.",
    "Always return 429 with Retry-After, and make clients back off with jitter.",
    "Decide fail-open vs fail-closed per endpoint before the outage, not during it.",
  ],
  faq: [
    { q: "What is rate limiting in system design?", a: "Rate limiting controls how many requests a client, user, API key, tenant or route may make in a period, or how many operations may run at once. Requests beyond the limit are rejected with HTTP 429 or queued, which protects services from overload and abuse." },
    { q: "Which rate limiting algorithm is best?", a: "There's no single best one. Token bucket is the common default for APIs because it allows controlled bursts; sliding window counter gives smooth limits with little memory; fixed window is simplest; leaky bucket smooths output; concurrency limits protect slow, expensive operations." },
    { q: "Why is Redis used for distributed rate limiting?", a: "Redis is fast, shared by all application servers, supports TTLs, and can run Lua scripts atomically. That lets every server check and update the same counter in about a millisecond without race conditions." },
    { q: "What HTTP status code should a rate limiter return?", a: "429 Too Many Requests, with a Retry-After header telling the client when to try again. Many APIs also send RateLimit-Limit, RateLimit-Remaining and RateLimit-Reset headers." },
    { q: "Should rate limits be based only on IP address?", a: "No. IP limits are useful for anonymous traffic, but many users can share one IP behind NAT or a corporate proxy, and attackers rotate IPs. Once a user is authenticated, limit by user ID, API key, tenant or route as well." },
    { q: "What is the difference between token bucket and leaky bucket?", a: "Token bucket allows short bursts up to the bucket size while capping the average rate. Leaky bucket processes requests at a constant rate, queueing or dropping the excess, so its output is smooth." },
  ],
  next: { title: "Caching", path: "/resources/hld/cache", text: "Once traffic is under control, make the reads fast: cache-aside, invalidation, stampedes, hot keys and Redis design." },
  book: {
    path: "/book/system-design/hld", label: "HLD book", title: "See rate limiting inside complete designs",
    text: "Combine rate limiting with caching, databases, load balancing, queues, locking and failure handling in complete HLD interview designs.",
    short: "Complete interview designs, end to end.",
    chips: ["Rate limiter", "Redis", "Caching", "Queues", "BookMyShow", "Concurrency"],
  },
};

const ALGOS = [
  { title: "Fixed window counter", tag: "Simple", facts: [["How", "One counter per key per interval, e.g. per minute."], ["Good for", "Simple APIs where edge bursts are acceptable."], ["Benefit", "Cheapest possible: one INCR and a TTL.", "good"], ["Trade-off", "Up to 2× the limit at window boundaries.", "cost"]] },
  { title: "Sliding window log", tag: "Exact", facts: [["How", "A timestamp per request; count those inside the rolling window."], ["Good for", "Low-to-medium traffic where exact limits matter."], ["Benefit", "Exact rolling limit.", "good"], ["Trade-off", "Memory grows with every request.", "cost"]] },
  { title: "Sliding window counter", tag: "Balanced", facts: [["How", "Weighted blend of the previous and current window counts."], ["Good for", "Most high-traffic APIs."], ["Benefit", "Smooth limits with two counters per key.", "good"], ["Trade-off", "An approximation (usually within a few %).", "cost"]] },
  { title: "Token bucket", tag: "Bursts", facts: [["How", "Refill R tokens/sec up to capacity C; each request spends one."], ["Good for", "Public APIs that should tolerate short bursts."], ["Benefit", "Bursts allowed, average still capped.", "good"], ["Trade-off", "Refill and spend must be atomic.", "cost"]] },
  { title: "Leaky bucket", tag: "Smooth", facts: [["How", "Queue requests; process them at a constant rate."], ["Good for", "Protecting a downstream that needs steady input."], ["Benefit", "Turns bursts into predictable output.", "good"], ["Trade-off", "Adds waiting; overflow is dropped.", "cost"]] },
  { title: "Concurrency limiter", tag: "In flight", facts: [["How", "Cap the number of operations running at once."], ["Good for", "AI inference, exports, uploads, slow queries."], ["Benefit", "Bounds real resource use when durations vary.", "good"], ["Trade-off", "Doesn't cap requests per second by itself.", "cost"]] },
];

/* ============================ live token bucket ============================ */
const CAP = 10;
const REFILL = 2; // tokens per second
function TokenBucketDemo() {
  const [tokens, setTokens] = useState(CAP);
  const [stats, setStats] = useState({ ok: 0, bad: 0 });
  const [log, setLog] = useState([]);
  const last = useRef(0);

  useEffect(() => {
    last.current = performance.now();
    const t = setInterval(() => {
      const now = performance.now();
      const add = ((now - last.current) / 1000) * REFILL;
      last.current = now;
      setTokens((v) => Math.min(CAP, v + add));
    }, 100);
    return () => clearInterval(t);
  }, []);

  const send = (n) => {
    let left = tokens;
    const out = [];
    for (let i = 0; i < n; i++) {
      if (left >= 1) { left -= 1; out.push("ok"); } else out.push("bad");
    }
    setTokens(left);
    setStats((s) => ({ ok: s.ok + out.filter((x) => x === "ok").length, bad: s.bad + out.filter((x) => x === "bad").length }));
    setLog((l) => [...out.map((x) => ({ x, k: Math.random() })), ...l].slice(0, 30));
  };
  const reset = () => { setTokens(CAP); setStats({ ok: 0, bad: 0 }); setLog([]); };
  const whole = Math.floor(tokens);

  return (
    <div className="rk-demo" aria-label="Interactive token bucket simulator">
      <div className="rk-demo-top"><span><Drop size={16} weight="fill" aria-hidden />Try it: a live token bucket</span><small>capacity {CAP} · refills {REFILL} tokens / sec</small></div>
      <div className="rk-bucket" role="img" aria-label={`${whole} of ${CAP} tokens available`}>
        {Array.from({ length: CAP }, (_, i) => <i key={i} className={i < whole ? "on" : ""} />)}
      </div>
      <dl className="rk-demo-stats">
        <div><dt>Tokens</dt><dd>{tokens.toFixed(1)}</dd></div>
        <div><dt>Allowed</dt><dd className="ok">{stats.ok}</dd></div>
        <div><dt>429s</dt><dd className="bad">{stats.bad}</dd></div>
      </dl>
      <div className="rk-demo-btns">
        <Btn onClick={() => send(1)}>Send 1 request</Btn>
        <Btn variant="ghost" onClick={() => send(5)}>Burst of 5</Btn>
        <Btn variant="ghost" onClick={() => send(15)}>Flood of 15</Btn>
        <Btn variant="ghost" onClick={reset}>Reset</Btn>
      </div>
      <div className="rk-demo-log" aria-live="polite">{log.map((e) => <span key={e.k} className={e.x}>{e.x === "ok" ? "200" : "429"}</span>)}</div>
      <p className="rk-demo-note">Send a flood: the first 10 pass because the bucket was full, the rest get 429. Wait a few seconds and tokens come back at 2 per second. <strong>That's a burst allowance with a capped average rate.</strong></p>
    </div>
  );
}

export default function HLDRateLimitingResource() {
  return (
    <ReaderPage guide={GUIDE}>
      {/* 01 */}
      <Sec id="fundamentals" n={1} eyebrow="Fundamentals" title="What is rate limiting?" lead="A cap on how much work a client may ask for, per time window or at the same time, so the system only accepts what it can safely do.">
        <Flow across steps={[
          { t: "Client", s: "1,000 requests", i: Users },
          { t: "Rate limiter", s: "Allows 100 / min", i: Gauge, tone: "hot" },
          { t: "Application", s: "Protected", i: Desktop, tone: "good", via: "allowed only" },
        ]} note={<>The other 900 get <b>HTTP 429 Too Many Requests</b>.</>} />
        <Call tone="tip" title="It's a protection mechanism">Every request may be perfectly valid. The problem is volume: more work than the service, its database or a paid third-party API can safely handle.</Call>
        <H3>Why every public system needs one</H3>
        <Cards items={[
          ["Stop abuse", "Scrapers, credential stuffing and bots can't send unlimited requests.", ShieldCheck],
          ["Protect infrastructure", "Databases, queues and downstream services never see more than they can take.", Database],
          ["Control cost", "AI inference, SMS and third-party APIs cost money per call.", Cpu],
          ["Fairness", "One noisy tenant can't consume everyone's capacity.", Users],
          ["DDoS defence in depth", "One layer of a wider traffic-protection strategy.", Prohibit],
          ["Business quotas", "Free, Pro and Enterprise plans get different limits.", Key],
        ]} />
      </Sec>

      {/* 02 */}
      <Sec id="where" n={2} eyebrow="Architecture" title="Where should the limiter live?" lead="Several layers can enforce limits, and big systems use all of them. Each rejects what it can see most cheaply.">
        <Flow steps={[
          { t: "Internet traffic", i: Users },
          { t: "CDN / edge / WAF", s: "Coarse per-IP and bot limits", i: Globe },
          { t: "API gateway", s: "Per-user, per-API-key, per-route quotas", i: ShieldCheck, tone: "hot" },
          { t: "Application", s: "Business rules: “one OTP per 30 s”", i: Desktop },
          { t: "Database / downstream", s: "The protected resources", i: Database },
        ]} />
        <Call tone="ok" title="Layer your limits">The edge drops obvious floods before they cost anything. The gateway knows who is calling, so it enforces quotas. The service knows the domain, so it enforces rules like “five password resets per hour”.</Call>
      </Sec>

      {/* 03 */}
      <Sec id="dimensions" n={3} eyebrow="Identity" title="What do you limit by?" lead="The limiter key decides who shares a quota. Get it wrong and you either block innocent users or miss the abuser.">
        <Table head={["Key", "Use it for", "Watch out for"]} rows={[
          ["IP address", "Anonymous traffic, basic abuse control", "Many users behind one NAT; attackers rotate IPs"],
          ["User ID", "Per-account quotas once logged in", "Needs authentication first"],
          ["API key", "Developer and partner APIs", "Leaked keys: allow rotation and per-key limits"],
          ["Tenant / org", "Plan limits in multi-tenant SaaS", "One tenant's users share the pool"],
          ["Endpoint", "Stricter limits on expensive routes", "Keep the route list maintainable"],
          ["Operation", "OTP, password reset, AI generation, exports", "Often needs several keys at once"],
        ]} />
        <Code title="A composite limiter key" lang="text">{`
rate:tenant:company_123:user:user_42:route:POST /api/payments`}</Code>
      </Sec>

      {/* 04 */}
      <Sec id="fixed-window" n={4} eyebrow="Algorithm 1" title="Fixed window counter" lead="Split time into fixed intervals and keep one counter per key per interval.">
        <Code title="Limit: 100 requests per minute" lang="text">{`
Window 1: 10:00:00 – 10:00:59   counter resets at 10:01:00
Window 2: 10:01:00 – 10:01:59   counter resets at 10:02:00`}</Code>
        <Call tone="warn" title="The boundary problem">100 requests at <strong>10:00:59</strong> are accepted. Another 100 at <strong>10:01:00</strong> are accepted too, because it's a new window. That's <Mark>200 requests in about one second</Mark>, double the intended rate.</Call>
        <Code title="Fixed window in Redis (atomic)" lang="lua">{`
-- KEYS[1] = rate:user:42:202611181546   (key includes the minute)
-- ARGV[1] = limit, ARGV[2] = window seconds
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[2])   -- set the TTL only on the first hit
end
if count > tonumber(ARGV[1]) then
  return 0                                 -- reject
end
return 1                                   -- allow`}</Code>
        <Call tone="ok" title="Why use it anyway?">It's simple, needs one small counter per key, and is fast. For coarse abuse protection, the boundary burst usually doesn't matter.</Call>
      </Sec>

      {/* 05 */}
      <Sec id="sliding-log" n={5} eyebrow="Algorithm 2" title="Sliding window log" lead="Store a timestamp for each request and count only those inside the last N seconds, measured from now.">
        <Code title="Rolling 60-second window at 10:01:20" lang="text">{`
stored:  10:00:25  10:00:40  10:00:55  10:01:10  10:01:18
drop anything older than 10:00:20  →  5 requests in the window`}</Code>
        <Code title="Sliding log with a Redis sorted set" lang="lua">{`
-- KEYS[1] = rate:log:user:42
-- ARGV[1] = now (ms), ARGV[2] = window (ms), ARGV[3] = limit, ARGV[4] = unique request id
redis.call("ZREMRANGEBYSCORE", KEYS[1], 0, ARGV[1] - ARGV[2])   -- forget old requests
if redis.call("ZCARD", KEYS[1]) >= tonumber(ARGV[3]) then
  return 0
end
redis.call("ZADD", KEYS[1], ARGV[1], ARGV[4])
redis.call("PEXPIRE", KEYS[1], ARGV[2])
return 1`}</Code>
        <Compare
          left={{ tone: "good", title: "Benefit", items: ["Exact rolling limit", "No boundary bursts"] }}
          right={{ tone: "bad", title: "Cost", items: ["One entry per request", "A 10,000/min limit can mean 10,000 entries per key"] }}
        />
      </Sec>

      {/* 06 */}
      <Sec id="sliding-counter" n={6} eyebrow="Algorithm 3" title="Sliding window counter" lead="Approximate the rolling window by blending the previous window's count with the current one.">
        <Code title="The estimate" lang="text">{`
previous window count  = 80
current window count   = 20
current window is 25% elapsed, so 75% of the previous window still overlaps

estimate = 80 × 0.75 + 20 = 80   →   under a limit of 100, allow`}</Code>
        <Call tone="info" title="The common production choice">Two counters per key, smooth limits, and typically within a few percent of an exact log. Many API gateways and CDNs use this or a close variant.</Call>
      </Sec>

      {/* 07 */}
      <Sec id="token-bucket" n={7} eyebrow="Algorithm 4" title="Token bucket" lead="Tokens drip into a bucket at a fixed rate up to its capacity. Each request takes one token; no token, no request.">
        <Flow steps={[
          { t: "Refill", s: "+10 tokens / second", i: ArrowsClockwise },
          { t: "Token bucket", s: "Capacity 100", i: Drop, tone: "hot" },
          { t: "API", s: "Request allowed", i: Desktop, tone: "good", via: "each request spends 1 token" },
        ]} />
        <Prose><p>A client that has been quiet has a full bucket and can send a burst of up to 100 requests at once. But it can never <em>sustain</em> more than 10 per second, because that's how fast tokens come back. <Mark>Bursts are allowed; the long-run average is capped.</Mark></p></Prose>
        <TokenBucketDemo />
        <Code title="Token bucket in Redis (atomic Lua)" lang="lua">{`
-- KEYS[1] = bucket key; ARGV: capacity, refill_per_sec, now_ms, cost
local capacity = tonumber(ARGV[1])
local rate     = tonumber(ARGV[2])
local now      = tonumber(ARGV[3])
local cost     = tonumber(ARGV[4])

local b = redis.call("HMGET", KEYS[1], "tokens", "ts")
local tokens = tonumber(b[1]) or capacity
local ts     = tonumber(b[2]) or now

tokens = math.min(capacity, tokens + (now - ts) / 1000 * rate)   -- refill since last call

local allowed = 0
if tokens >= cost then
  tokens = tokens - cost
  allowed = 1
end

redis.call("HSET", KEYS[1], "tokens", tokens, "ts", now)
redis.call("PEXPIRE", KEYS[1], math.ceil(capacity / rate * 1000) * 2)   -- idle buckets expire
return allowed`}</Code>
      </Sec>

      {/* 08 */}
      <Sec id="leaky-bucket" n={8} eyebrow="Algorithm 5" title="Leaky bucket" lead="Requests pour into a bucket (a queue) and drain out at a constant rate. When the bucket is full, new requests overflow.">
        <Flow steps={[
          { t: "Burst traffic", s: "1,000 requests / sec", i: Users },
          { t: "Bucket / queue", s: "Finite capacity", i: Drop, tone: "hot" },
          { t: "Backend", s: "Steady 100 requests / sec", i: Desktop, tone: "good", via: "constant leak rate" },
        ]} />
        <Call tone="info" title="Token bucket vs leaky bucket">Token bucket lets bursts <strong>through</strong> when tokens are saved up. Leaky bucket makes bursts <strong>wait</strong> and releases work at a steady pace. Pick leaky when the thing behind it needs smooth input, such as a payment provider or a fragile legacy system.</Call>
      </Sec>

      {/* 09 */}
      <Sec id="concurrency" n={9} eyebrow="Expensive operations" title="Concurrency limiting" lead="When one request takes 50 ms and another 50 seconds, requests per second stops meaning much. Limit what's running instead.">
        <Code title="In-flight cap" lang="text">{`
max concurrent AI generations: 20
currently running:             20
new request:                   reject (429 / 503 + Retry-After) or queue`}</Code>
        <Compare
          left={{ tone: "plain", title: "Rate limit (RPS)", items: ["How many requests start per interval", "Cheap to check", "Blind to how long each one runs"] }}
          right={{ tone: "plain", title: "Concurrency limit", items: ["How many run at the same time", "Bounds CPU, GPU, memory and connections", "Release the slot on finish, error or timeout"] }}
        />
      </Sec>

      {/* 10 */}
      <Sec id="comparison" n={10} eyebrow="Selection" title="Which algorithm should you use?" lead="It depends on how exact the limit must be, whether bursts are OK, how much state you can afford, and how complex you're willing to go.">
        <Specs items={ALGOS} />
        <Call tone="interview" title="a safe default">“Token bucket per API key at the gateway, in Redis with a Lua script, plus a concurrency limit on the expensive endpoints.” Then mention the trade-off you'd revisit if requirements changed.</Call>
      </Sec>

      {/* 11 */}
      <Sec id="distributed" n={11} eyebrow="Distributed systems" title="Distributed rate limiting with Redis" lead="A limiter inside one server is easy. With many servers behind a load balancer, each one only sees part of the traffic.">
        <H3>The broken local design</H3>
        <Flow steps={[
          { t: "User", s: "Limit = 100 / min", i: Users },
          { row: [{ t: "API 1", s: "allows 100", i: Desktop }, { t: "API 2", s: "allows 100", i: Desktop }, { t: "API 3", s: "allows 100", i: Desktop }] },
        ]} note={<>Effective limit: <b>300 per minute</b>, and it grows with every server you add.</>} />
        <H3>Shared state</H3>
        <Flow steps={[
          { row: [{ t: "API 1", i: Desktop }, { t: "API 2", i: Desktop }, { t: "API 3", i: Desktop }] },
          { t: "Redis", s: "rate:user:42 → 76 / 100", i: Database, tone: "hot", via: "one shared counter" },
        ]} />
        <H3>Why atomicity matters</H3>
        <Code title="The race that breaks a naive limiter" lang="text">{`
Request A:  GET counter → 99
Request B:  GET counter → 99
A: 99 < 100 → allow      B: 99 < 100 → allow
Both increment → counter = 101. The limit is broken.`}</Code>
        <Prose><p>The fix is to make <strong>check + update one atomic step</strong>. Redis runs a Lua script without interleaving other commands, so every script in this guide is race-free. Load it once with <code>SCRIPT LOAD</code> and call it with <code>EVALSHA</code> to avoid resending the script.</p></Prose>
        <Call tone="warn" title="INCR then EXPIRE, separately, can leak keys">If the app increments a new key and crashes before setting its TTL, that counter lives forever and the user stays blocked. Do both inside one script, or use <code>SET key 0 EX 60 NX</code> before <code>INCR</code>.</Call>
      </Sec>

      {/* 12 */}
      <Sec id="headers" n={12} eyebrow="API behaviour" title="HTTP 429 and rate-limit responses" lead="Tell clients clearly that they were limited, and when they can try again.">
        <Code title="A good 429 response" lang="http">{`
HTTP/1.1 429 Too Many Requests
Retry-After: 30
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 30
Content-Type: application/json

{ "error": "rate_limited", "message": "Too many requests. Try again in 30 seconds.", "retryAfterSeconds": 30 }`}</Code>
        <Call tone="warn" title="Don't let clients retry instantly">If thousands of clients get a 429 and retry in a tight loop, the limiter becomes part of a retry storm. Clients and SDKs should wait at least <code>Retry-After</code> and add exponential backoff with jitter.</Call>
      </Sec>

      {/* 13 */}
      <Sec id="burst" n={13} eyebrow="Traffic spikes" title="Bursts and hot keys" lead="A limiter must tell an acceptable short burst from sustained overload, and survive one identity sending enormous traffic.">
        <Flow steps={[
          { t: "Normal traffic", s: "100 requests / sec", i: Users },
          { t: "Flash event", s: "10,000 requests / sec", i: Lightning, tone: "bad" },
          { t: "Token bucket", s: "Allows a bounded burst", i: Drop, tone: "hot" },
          { t: "Backend", s: "Protected", i: Desktop, tone: "good" },
        ]} />
        <Cards items={[
          ["Burst capacity", "Temporary traffic above the steady rate (the bucket size)."],
          ["Sustained rate", "Long-term throughput (the refill rate)."],
          ["Queueing", "Work that can wait goes to a queue instead of being rejected."],
          ["Load shedding", "Under extreme pressure, drop optional requests first."],
        ]} />
        <H3>The rate limiter's own hot key</H3>
        <Flow steps={[
          { row: [{ t: "R1", i: Users }, { t: "R2", i: Users }, { t: "R3", i: Users }, { t: "Millions", i: Users }] },
          { t: "rate:api-key:popular", s: "One hot Redis key", i: Database, tone: "bad", via: "same API key" },
        ]} />
        <Cards items={[
          ["Local + global limits", "A small per-instance limit absorbs most excess before it reaches Redis."],
          ["Sharded counters", "For approximate limits, spread one counter across several keys."],
          ["Edge enforcement", "Reject obvious floods before central infrastructure."],
          ["Dedicated capacity", "Very large tenants get their own limiter state."],
        ]} />
      </Sec>

      {/* 14 */}
      <Sec id="multi-region" n={14} eyebrow="Global systems" title="Multi-region rate limiting" lead="A worldwide limit gets hard when each region handles traffic independently.">
        <Flow steps={[
          { t: "Global user", s: "Limit = 1,000 / min worldwide", i: Users },
          { row: [{ t: "India", s: "allows 400", i: Globe }, { t: "US", s: "allows 400", i: Globe }, { t: "Europe", s: "allows 400", i: Globe }] },
        ]} note={<>Independent regional limits could allow <b>1,200</b> instead of 1,000.</>} />
        <Table head={["Approach", "Accuracy", "Cost"]} rows={[
          ["Central global counter", "Exact", "Cross-region latency on every request, plus a global dependency"],
          ["Split quota per region", "Exact overall", "Unused quota gets stranded in quiet regions"],
          ["Async-synced counters", "Briefly overshoots", "Fast and local"],
          ["Hybrid", "Close", "Strict local ceilings, global quota reconciled in the background"],
        ]} />
        <Call tone="info" title="First ask: must it be exact?">Abuse limits can tolerate a little overshoot. Billing quotas and paid credits usually can't. Let that answer pick the design.</Call>
      </Sec>

      {/* 15 */}
      <Sec id="bookmyshow" n={15} eyebrow="Case study" title="Rate limiting a ticket flash sale" lead="Tickets for a blockbuster open at exactly 10:00 AM, and half a million people press the button together.">
        <Call tone="info" title="About this example">A conceptual design for learning, not a description of any company's private implementation.</Call>
        <Flow steps={[
          { t: "500K+ users", s: "Tickets open", i: Users },
          { t: "CDN / edge", s: "Static assets + coarse abuse controls", i: Globe },
          { t: "Rate limiter", s: "IP + user + booking limits", i: Gauge, tone: "hot" },
          { t: "Load balancer", i: ArrowsSplit, via: "allowed traffic" },
          { row: [{ t: "Booking 1", i: Desktop }, { t: "Booking 2", i: Desktop }, { t: "Booking N", i: Desktop }] },
          { row: [{ t: "Redis", s: "Seat holds + quota state", i: Lightning }, { t: "Booking DB", s: "Durable bookings", i: Database }] },
        ]} />
        <Table head={["Limit", "Why"]} rows={[
          ["Per IP", "Cut obvious bot floods early."],
          ["Per user", "One account can't hammer the booking API."],
          ["Per show", "One hot show can't overwhelm shared booking state."],
          ["OTP sends", "No unlimited SMS (fail closed)."],
          ["Payment attempts", "Protect the payment provider and limit fraud."],
          ["Search", "Higher limits, since browsing isn't correctness-critical."],
        ]} />
        <H3>Layered protection, in order</H3>
        <Steps items={[
          ["Edge", "Filters obvious abusive traffic."],
          ["Gateway", "Enforces IP, user and API-key quotas."],
          ["Booking service", "Applies stricter business limits."],
          ["Token bucket", "Allows a controlled burst at 10:00:00."],
          ["Load balancer", "Spreads the accepted traffic."],
          ["Redis", "Holds distributed quota state and seat holds."],
          ["Seat locking", "Prevents concurrent booking conflicts."],
          ["Database", "Guarantees final booking correctness."],
        ]} />
        <Call tone="warn" title="Rate limiting doesn't solve seat concurrency">It reduces how many requests arrive. Seat holds, conditional database updates and idempotency are what stop double booking.</Call>
      </Sec>

      {/* 16 */}
      <Sec id="failures" n={16} eyebrow="Production engineering" title="Failures and metrics" lead="The limiter sits on the critical path, so its own failure modes need explicit answers.">
        <Table head={["Failure", "What to do"]} rows={[
          ["Redis is down", "Fail open or closed per endpoint; fall back to a local in-memory limit."],
          ["Race condition", "Atomic Lua scripts so concurrent requests can't exceed the quota."],
          ["Clock skew", "Use Redis server time (TIME) or one clock source, not each app server's clock."],
          ["Hot key", "Local pre-limits, sharded counters, edge enforcement."],
          ["Limiter adds latency", "Co-locate Redis, pipeline calls, use local limits for coarse checks."],
          ["Config mistake", "10/min deployed instead of 10,000/min is an outage: validate and roll out in stages."],
          ["Regional partition", "Global quotas drift; define the acceptable overshoot."],
          ["Retry storm", "Retry-After, client backoff with jitter."],
        ]} />
        <H3>Fail open vs fail closed</H3>
        <Compare
          left={{ tone: "good", title: "Fail open", text: "Limiter down → allow the request.", items: ["When availability beats strict quotas", "Search, browsing, public reads", "Best with a local fallback limit"] }}
          right={{ tone: "bad", title: "Fail closed", text: "Limiter down → reject the request.", items: ["When the operation is costly or abusable", "Login, OTP, payments, AI generation", "Show a clear “try again shortly” message"] }}
        />
        <H3>Metrics to watch</H3>
        <Chips label="Rate limiter metrics" items={["Allowed requests", "Rejected requests", "429 rate", "Limiter latency", "Redis latency & errors", "Hot keys", "Top limited users & IPs", "Limit utilisation", "Fail-open count", "Fail-closed count", "Burst rate", "Quota exhaustion", "Regional drift", "Config changes"]} />
        <Call tone="tip" title="Watch for false positives">A spike in 429s for logged-in users behind one corporate IP usually means your key is wrong, not that you're under attack. Monitor who you're blocking, not just how many.</Call>
      </Sec>
    </ReaderPage>
  );
}

