import { Link } from "react-router-dom";
import {
  ArrowsSplit, CheckCircle, Cloud, Desktop, Globe, Heartbeat, Key, Lightning, Lock, MagnifyingGlass, Prohibit, ShieldCheck, SquaresFour, Users, Warning,
} from "@phosphor-icons/react";

import { Call, Cards, Chips, Code, Compare, Flow, H3, Mark, Prose, ReaderPage, Sec, Steps, Table } from "../resources/kit/Reader";

/* =====================================================================
   API GATEWAY  (/resources/hld/api-gateway)
   Second guide in the system design path.
===================================================================== */
const GUIDE = {
  id: "gw",
  path: "/resources/hld/api-gateway",
  short: "API gateway",
  section: "System Design",
  seoTitle: "API Gateway in System Design: Routing, Auth, BFF, Circuit Breakers | Target Trek",
  description: "A free, complete guide to API gateways for system design interviews: routing, JWT authentication, authorization, rate limiting, validation, transformation, aggregation, BFF, caching, timeouts, retries, circuit breakers, service discovery, observability and high availability.",
  keywords: ["api gateway system design", "api gateway vs load balancer", "api gateway vs reverse proxy", "backend for frontend", "BFF pattern", "circuit breaker", "jwt validation gateway", "api gateway rate limiting", "api aggregation", "canary routing", "microservices gateway", "HLD interview questions"],
  about: ["API gateway", "Microservices", "System design", "Authentication", "Circuit breaker", "Backend for frontend"],
  tags: ["System design", "Architecture", "Intermediate"],
  h1: "API Gateway in System Design",
  sub: "The single, controlled front door to your microservices: what it should handle, what it must never handle, and how to keep it from becoming your biggest point of failure.",
  answer: "An API gateway is the single entry point between clients and backend services. It routes each request to the right service and handles cross-cutting concerns in one place: authentication, coarse authorization, rate limiting, validation, request transformation, aggregation, timeouts and observability. Business logic stays in the services, and the gateway runs as several stateless instances so it is never a single point of failure.",
  minutes: 35,
  level: "Intermediate",
  updated: "2026-11-18",
  crumbs: [["Resources", "/resources"], ["System design", "/resources/hld"], ["API gateway", "/resources/hld/api-gateway"]],
  learn: [
    "Gateway vs load balancer vs reverse proxy, and when one product does all three",
    "JWT validation at the edge, and why services still check permissions",
    "Aggregation and the Backend-for-Frontend (BFF) pattern",
    "Timeouts, safe retries and circuit breakers",
    "Running the gateway highly available across zones and regions",
  ],
  toc: [
    { id: "fundamentals", label: "What is an API gateway?" },
    { id: "architecture", label: "Where it sits" },
    { id: "routing", label: "Routing and versioning" },
    { id: "authentication", label: "Authentication" },
    { id: "authorization", label: "Authorization" },
    { id: "rate-limiting", label: "Rate limiting" },
    { id: "validation", label: "Validation and transformation" },
    { id: "aggregation", label: "Aggregation and BFF" },
    { id: "caching", label: "Gateway caching" },
    { id: "resilience", label: "Timeouts, retries, circuit breakers" },
    { id: "service-discovery", label: "Service discovery" },
    { id: "observability", label: "Observability and security" },
    { id: "high-availability", label: "High availability" },
    { id: "bookmyshow", label: "Case study: flash sale" },
    { id: "failures", label: "Failures and metrics" },
  ],
  questions: [
    { q: "What is an API gateway, and why do microservices use one?", a: "It is one public entry point in front of many services. Without it, every client must know each service's address, auth scheme and contract, and every service must re-implement auth, rate limiting and logging. The gateway centralises those cross-cutting concerns and hides the internal topology." },
    { q: "API gateway vs load balancer?", a: "A load balancer spreads traffic across instances of the same service, based on health and an algorithm. A gateway is an API policy boundary: it decides which service a request is for and applies auth, quotas, transformations and aggregation. In practice the gateway sits behind a load balancer, and gateway instances are themselves load balanced." },
    { q: "API gateway vs reverse proxy?", a: "Every API gateway is a reverse proxy, but not every reverse proxy is a gateway. A reverse proxy forwards traffic and may add TLS, caching or compression. A gateway adds API-specific policy: identity, scopes, per-consumer quotas, versioning and composition." },
    { q: "Where does the gateway sit in the request path?", a: "Typically: client → DNS/CDN/WAF at the edge → load balancer → gateway cluster → services. The CDN and WAF remove cacheable and malicious traffic first; the load balancer spreads requests over gateway instances; the gateway routes to services." },
    { q: "How would JWT validation work at the gateway?", a: "The gateway verifies the token's signature with the issuer's public key (fetched from a JWKS endpoint and cached), then checks exp, nbf, iss, aud and required scopes. On success it forwards trusted identity headers such as X-User-ID; on failure it returns 401 without touching any backend." },
    { q: "Authentication vs authorization?", a: "Authentication answers who is calling (a valid token for user 42). Authorization answers what they may do (can user 42 cancel booking 9001?). The gateway can do authentication and coarse authorization by role or scope; fine-grained, resource-level checks belong in the service that owns the data." },
    { q: "Should backend services trust the gateway completely?", a: "No. Services should accept traffic only from the gateway (private network, mTLS) and still enforce their own resource-level authorization. If anything bypasses the gateway, or it is misconfigured, the services must not become wide open." },
    { q: "Where should rate limiting happen?", a: "At the edge for coarse protection (per IP, at the CDN or WAF), at the gateway for per-user, per-API-key and per-plan quotas, and in critical services for their own protection. The gateway is the natural place for quota tiers because it already knows the caller's identity." },
    { q: "How would free and premium users get different quotas?", a: "The gateway reads the plan from the token or API key and looks up that plan's limit, for example 100 vs 5,000 requests per minute. It enforces it with a token bucket or sliding window in a shared store such as Redis, and returns 429 with Retry-After and X-RateLimit headers when the limit is hit." },
    { q: "Should business logic live in the gateway?", a: "No. Domain logic in the gateway couples every team to one central component, makes deploys risky and turns the gateway into a monolith. Keep it to cross-cutting concerns and light composition; put business rules in services." },
    { q: "What is API aggregation, and what is the risk?", a: "The gateway calls several services in parallel and merges the results into one response, for example a mobile home screen built from profile, orders and recommendations. The risk is latency coupling: the response is as slow as the slowest call. Mitigate with parallel calls, per-call timeouts and partial responses." },
    { q: "What is the Backend for Frontend (BFF) pattern?", a: "A separate gateway or API layer per client type, such as one for web, one for mobile and one for partners. Each BFF shapes responses for its client, so a mobile app gets compact payloads and fewer round trips without forcing the web API to change." },
    { q: "When should gateway responses be cached?", a: "For public, read-heavy, fairly stable GET responses such as popular movies or a product catalogue, with a short TTL. Never cache personalised or authorisation-sensitive responses unless the cache key includes the caller's identity and permissions." },
    { q: "How should gateway timeouts be configured?", a: "Per route, from the downstream service's real latency profile and the business need: perhaps 300 ms for recommendations and 5 s for a payment provider. The gateway timeout must also fit inside the client's overall deadline, and every downstream call should have one." },
    { q: "When is retrying safe, and how can retries duplicate payments?", a: "Retries are safe for idempotent requests (GET, PUT with the same body, or anything carrying an idempotency key) after transient errors. If the gateway retries a POST /payments that actually succeeded but timed out, the customer is charged twice. So: bounded retries, backoff with jitter, and idempotency keys on writes." },
    { q: "What is a circuit breaker? Explain its three states.", a: "It stops calling a dependency that is clearly failing. CLOSED: calls pass and failures are counted. OPEN: after a threshold, calls fail immediately (or use a fallback) for a cooldown period. HALF-OPEN: a few trial calls go through; success closes the circuit, failure opens it again. It fails fast and gives the dependency room to recover." },
    { q: "How does the gateway find backend instances?", a: "Through service discovery rather than hard-coded IPs: a registry (Consul, Eureka), DNS, or the platform (Kubernetes Services, a mesh). Instances register, health checks remove dead ones, and the gateway routes only to healthy instances as they scale up and down." },
    { q: "How would you do versioning and canary releases at the gateway?", a: "Route /api/v1 and /api/v2 (or a version header) to different service versions. For a canary, use weighted routing: send 5–10% of traffic to the new version, watch its error rate, latency and business metrics, then increase gradually or roll back instantly." },
    { q: "What should never be logged at the gateway?", a: "Authorization headers and tokens, passwords, card numbers, OTPs and sensitive personal data. Log the request ID, route, status, latency, caller ID and backend instead, and redact or hash anything sensitive." },
    { q: "How do you stop the gateway from being a single point of failure?", a: "Run many stateless gateway instances across availability zones behind a load balancer, with health checks, autoscaling and graceful draining. Keep shared state (rate-limit counters, config) in replicated external stores, and roll out config changes in stages with fast rollback." },
    { q: "What should happen when the Redis rate limiter is down?", a: "Decide per route ahead of time. Low-risk reads can fail open, perhaps falling back to a local in-memory limit per instance. High-risk routes such as login, OTP and payments should fail closed or use a strict local limit, because unlimited access there is dangerous." },
    { q: "How would you protect a ticket flash sale at the gateway?", a: "Authenticate early, apply per-IP and per-user limits on booking routes, validate payloads, attach trace IDs, route only to healthy booking instances with tight timeouts and circuit breakers, and put a waiting room or queue in front of the booking path if demand exceeds safe capacity. Seat correctness itself stays in the booking service." },
  ],
  quiz: [
    { q: "A request arrives with a valid JWT for user 42, asking to cancel booking 9001 owned by user 77. Who should reject it?", options: ["Nobody: the token is valid", "The gateway, because the signature is wrong", "The booking service, with a resource-level ownership check", "The load balancer"], answer: 2, why: "Authentication passed. Whether user 42 owns booking 9001 is a domain authorization check, and the service that owns booking data should make it." },
    { q: "The payment service is down and every call times out after 5 seconds. What protects the gateway fastest?", options: ["More retries", "A longer timeout", "A circuit breaker that fails fast while the service is unhealthy", "Response caching"], answer: 2, why: "An open circuit rejects calls immediately instead of tying up thousands of connections for 5 seconds each, and lets the service recover." },
    { q: "Why can retrying POST /payments at the gateway be dangerous?", options: ["POST requests can't be retried", "The first attempt may have succeeded, so a retry charges twice", "Retries break TLS", "Gateways don't support retries"], answer: 1, why: "A timeout means the result is unknown, not that it failed. Without an idempotency key, a retry can repeat the side effect." },
    { q: "Your mobile app needs compact responses; your web app needs rich ones. Which pattern fits?", options: ["Sticky sessions", "Backend for Frontend (BFF)", "Write-back caching", "Consistent hashing"], answer: 1, why: "A BFF per client type shapes each API for its client without forcing a single compromise contract." },
    { q: "Which response is a poor candidate for gateway caching?", options: ["GET /movies/popular", "GET /api/users/me", "GET /cities", "GET /theatres?city=pune"], answer: 1, why: "/users/me is personalised. Caching it under a shared key could show one user's data to another." },
    { q: "How do you send 10% of traffic to a new service version?", options: ["IP hash", "Weighted (canary) routing at the gateway", "A longer TTL", "A circuit breaker"], answer: 1, why: "Weighted routing splits traffic by percentage, so you can watch the new version's metrics before shifting more traffic to it." },
  ],
  glossary: [
    ["API gateway", "The single, policy-enforcing entry point in front of backend services."],
    ["Cross-cutting concern", "Something every service needs, such as auth, logging or rate limiting, handled once."],
    ["JWT", "A signed token carrying claims such as user ID, scopes and expiry."],
    ["JWKS", "A published set of public keys the gateway uses to verify token signatures."],
    ["Scope", "A permission attached to a token, such as booking:create."],
    ["BFF", "Backend for Frontend: one API layer per client type."],
    ["Aggregation", "Combining several service calls into one client response."],
    ["Circuit breaker", "Stops calling a failing dependency and fails fast until it recovers."],
    ["Canary release", "Sending a small share of traffic to a new version first."],
    ["Idempotency key", "A client-supplied ID that makes retried writes safe."],
  ],
  takeaways: [
    "The gateway is the one controlled front door: routing plus cross-cutting policy, so services don't each re-implement them.",
    "Authenticate at the gateway; keep resource-level authorization in the service that owns the data.",
    "Quotas belong at the gateway because it knows the caller. Return 429 with Retry-After.",
    "Aggregation and BFFs simplify clients but couple latency: call in parallel with per-call timeouts.",
    "Every downstream call needs a timeout. Retry only idempotent requests, and use circuit breakers to fail fast.",
    "No business logic in the gateway, and never log tokens or personal data.",
    "Run it stateless, multi-instance and multi-zone, with staged config rollouts. Otherwise it becomes the single point of failure.",
  ],
  faq: [
    { q: "What is an API gateway in system design?", a: "An API gateway is the single entry point in front of backend services. It routes requests and handles cross-cutting concerns such as authentication, authorization, rate limiting, observability, request transformation and response aggregation." },
    { q: "What is the difference between an API gateway and a load balancer?", a: "A load balancer distributes traffic across instances of a service. An API gateway decides which service a request belongs to and applies API policies such as auth, quotas, transformation and aggregation. Most architectures use both, with a load balancer in front of the gateway instances." },
    { q: "Can an API gateway become a single point of failure?", a: "Yes, if it runs as one instance. Production gateways run as multiple stateless instances across availability zones behind a load balancer, with health checks, autoscaling and staged configuration changes." },
    { q: "Should business logic be placed inside an API gateway?", a: "No. The gateway should handle cross-cutting concerns and light composition. Domain logic belongs in backend services; putting it in the gateway couples every team to one component." },
    { q: "Which API gateways are commonly used?", a: "Popular options include Kong, NGINX, Envoy-based gateways, Apigee, Spring Cloud Gateway, and managed cloud gateways such as AWS API Gateway and Azure API Management. The design concepts are the same across them." },
    { q: "Is a service mesh the same as an API gateway?", a: "No. A gateway manages north-south traffic, from outside clients into the system. A service mesh manages east-west traffic between services inside it, with mTLS, retries and telemetry. Large systems often use both." },
  ],
  next: { title: "Rate Limiting", path: "/resources/hld/rate-limiting", text: "Token bucket, leaky bucket, sliding windows and Redis-based distributed limits: the gateway's most important policy, in depth." },
  book: {
    path: "/book/system-design/hld", label: "HLD book", title: "See the gateway inside complete architectures",
    text: "Combine gateways, caching, load balancing, databases, queues, rate limiting, locking and failure handling in full HLD interview designs.",
    short: "Complete interview designs, end to end.",
    chips: ["API gateway", "Caching", "Load balancing", "Rate limiting", "BookMyShow", "Scalability"],
  },
};

export default function HLDApiGatewayResource() {
  return (
    <ReaderPage guide={GUIDE}>
      {/* 01 */}
      <Sec id="fundamentals" n={1} eyebrow="Fundamentals" title="What is an API gateway?" lead="A controlled entry point through which every client talks to your backend services.">
        <Flow caption="One front door, many services" steps={[
          { t: "Web · mobile · partners", s: "Clients", i: Users },
          { t: "API gateway", s: "Route · authenticate · limit · observe", i: ShieldCheck, tone: "hot", via: "HTTPS" },
          { row: [{ t: "User", s: "service", i: Desktop }, { t: "Order", s: "service", i: Desktop }, { t: "Payment", s: "service", i: Desktop }, { t: "Booking", s: "service", i: Desktop }] },
        ]} />
        <Call tone="tip" title="Think of it as the front door">Instead of exposing every internal service to the internet, you expose one boundary, and decide in one place who gets in, how often, and where they go.</Call>
        <H3>What it takes off every service's plate</H3>
        <Cards items={[
          ["One entry point", "Clients call one public API instead of discovering many services.", CheckCircle],
          ["Central authentication", "Credentials are checked before requests reach internal services.", Key],
          ["Coarse authorization", "Requests that fail route or scope rules never get through.", Lock],
          ["Rate limiting", "Per-user and per-plan quotas protect backends.", Prohibit],
          ["Routing", "Public endpoints map to internal services and versions.", ArrowsSplit],
          ["Observability", "Consistent logs, metrics and trace IDs for every request.", Heartbeat],
          ["Transformation", "Headers, paths and payloads adapted between contracts.", SquaresFour],
          ["Composition", "Several backend calls merged into one response.", SquaresFour],
        ]} />
      </Sec>

      {/* 02 */}
      <Sec id="architecture" n={2} eyebrow="Request flow" title="Where the gateway sits" lead="A real request crosses several layers before it reaches a service. Each layer has a different job.">
        <Flow steps={[
          { t: "Client", i: Users },
          { t: "DNS / CDN / WAF", s: "Edge protection, cached content", i: Globe },
          { t: "Load balancer", s: "Spreads traffic over gateway instances", i: ArrowsSplit },
          { t: "API gateway cluster", s: "Policies + routing", i: ShieldCheck, tone: "hot" },
          { row: [{ t: "Service A", i: Desktop }, { t: "Service B", i: Desktop }, { t: "Service C", i: Desktop }] },
        ]} />
        <H3>Gateway vs load balancer vs reverse proxy</H3>
        <Table head={["Component", "Primary job", "Typical features"]} rows={[
          ["Load balancer", "Distribute traffic across instances", "Health checks, balancing algorithms, failover"],
          ["Reverse proxy", "Stand in for backend servers", "TLS, routing, caching, compression"],
          ["API gateway", "API policy and routing boundary", "Auth, quotas, transformation, aggregation, observability"],
        ]} />
        <Call tone="info" title="One product may play several roles">Envoy, NGINX, Kong and managed cloud gateways overlap heavily. In an interview, talk about the <strong>logical responsibility</strong> of each layer rather than insisting on a separate box for each.</Call>
      </Sec>

      {/* 03 */}
      <Sec id="routing" n={3} eyebrow="Core responsibility" title="Routing and versioning" lead="The gateway maps each incoming request to the right backend service, and can shift traffic between versions safely.">
        <Code title="Path-based routing" lang="http">{`
GET  /api/users/42      →  user-service
GET  /api/orders/501    →  order-service
POST /api/payments      →  payment-service`}</Code>
        <Cards items={[
          ["Path-based", "/users/* → user-service."],
          ["Host-based", "payments.api.example.com → payment-service."],
          ["Header-based", "X-Client-Version: 2 → the new service."],
          ["Weighted (canary)", "10% → v2, 90% → v1 during a rollout."],
          ["Geo routing", "Send traffic to the nearest regional deployment."],
          ["Tenant routing", "Enterprise tenants go to dedicated infrastructure."],
        ]} />
        <H3>Versioning and canary releases</H3>
        <Compare
          left={{ tone: "plain", title: "Versioned routes", items: ["/api/v1/orders → order-service v1", "/api/v2/orders → order-service v2", "Old clients keep working while new ones migrate"] }}
          right={{ tone: "plain", ordered: true, title: "Canary rollout", items: ["Send 10% of traffic to v2", "Watch error rate, latency and business metrics", "Raise to 25%, 50%, 100%, or roll back instantly"] }}
        />
      </Sec>

      {/* 04 */}
      <Sec id="authentication" n={4} eyebrow="Security" title="Authentication at the gateway" lead="Authentication answers one question: who is making this request?">
        <Flow across steps={[
          { t: "Client", s: "Authorization: Bearer <JWT>", i: Users },
          { t: "API gateway", s: "Verify the credential", i: ShieldCheck, tone: "hot" },
          { t: "Backend", s: "Receives a trusted identity", i: Desktop, tone: "good" },
        ]} note="Invalid or expired credentials get a 401 at the gateway and never reach a service." />
        <Cards items={[
          ["JWT", "Verify signature, expiry, issuer, audience and required claims.", Key],
          ["API key", "Identify the calling application or developer.", Key],
          ["OAuth access token", "Validate externally issued tokens and their scopes.", Key],
          ["mTLS", "Authenticate clients or services by certificate.", Lock],
        ]} />
        <Code title="JWT claims the gateway checks" lang="json">{`
{
  "sub":   "user_42",
  "role":  "USER",
  "scope": ["booking:read", "booking:create"],
  "iss":   "auth.targettrek.in",
  "aud":   "api.targettrek.in",
  "exp":   1790678000
}`}</Code>
        <Code title="Verifying a JWT (Node.js, jose)" lang="js">{`
import { createRemoteJWKSet, jwtVerify } from "jose";

// public keys are fetched once and cached; rotation is handled automatically
const JWKS = createRemoteJWKSet(new URL("https://auth.targettrek.in/.well-known/jwks.json"));

export async function authenticate(req) {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) throw httpError(401, "Missing token");

  const { payload } = await jwtVerify(token, JWKS, {
    issuer: "auth.targettrek.in",
    audience: "api.targettrek.in",
  });                                   // throws on bad signature or expired token

  req.headers["x-user-id"] = payload.sub;   // trusted identity for the backend
  req.headers["x-scopes"] = payload.scope.join(" ");
}`}</Code>
        <Call tone="warn" title="Authentication is not authorization">Knowing the caller is user 42 doesn't mean user 42 may open every booking, payment or admin API.</Call>
      </Sec>

      {/* 05 */}
      <Sec id="authorization" n={5} eyebrow="Access control" title="Authorization" lead="Authorization decides what an authenticated caller may do. The gateway handles the broad rules; services handle the specific ones.">
        <Cards items={[
          ["Role-based", "ADMIN, USER, SUPPORT and similar roles.", ShieldCheck],
          ["Scope-based", "booking:create, payment:read and other OAuth-style scopes.", ShieldCheck],
          ["Route policies", "Only administrators may call /admin/*.", ShieldCheck],
          ["Tenant policies", "One organisation can never reach another's APIs.", ShieldCheck],
        ]} />
        <Call tone="info" title="Services still protect their own data">The gateway can say “this caller may call booking APIs”. Only the booking service can say “booking 9001 belongs to this caller”. Keep resource-level checks in the service that owns the data.</Call>
      </Sec>

      {/* 06 */}
      <Sec id="rate-limiting" n={6} eyebrow="Traffic protection" title="Rate limiting at the gateway" lead="The gateway already knows who's calling, which makes it the natural place for quotas, applied before any expensive backend work starts.">
        <Table head={["Who / what", "Limit"]} rows={[
          ["Free plan", "100 requests / minute"],
          ["Pro plan", "5,000 requests / minute"],
          ["Payment route", "20 requests / minute / user"],
          ["OTP route", "1 request / 30 seconds / phone number"],
        ]} />
        <Flow across steps={[
          { t: "Client", s: "Too many requests", i: Users },
          { t: "Gateway limiter", s: "Token bucket / sliding window", i: Prohibit, tone: "hot" },
          { t: "Backend", s: "Protected", i: Desktop, tone: "good", via: "allowed only" },
        ]} note={<>Rejected requests get <b>HTTP 429 Too Many Requests</b> with a <b>Retry-After</b> header.</>} />
        <Call tone="tip" title="The full picture">Algorithms, Redis implementations and multi-region limits are covered in the next guide, <Link to="/resources/hld/rate-limiting" className="rl-textlink">Rate limiting</Link>.</Call>
      </Sec>

      {/* 07 */}
      <Sec id="validation" n={7} eyebrow="Input protection" title="Validation and transformation" lead="Reject obviously bad requests before they cost anything, and translate between the public contract and internal ones.">
        <Cards cols={3} items={[
          ["Payload size", "Reject unexpectedly huge bodies before forwarding."],
          ["Required headers", "Content-Type, API version, auth metadata."],
          ["Schema checks", "Validate the basic request shape (e.g. against OpenAPI)."],
          ["Method rules", "Reject unsupported HTTP methods."],
          ["Content type", "Accept only supported encodings."],
          ["Sanitisation", "Normalise or reject malformed traffic."],
        ]} />
        <H3>Public contract → internal contract</H3>
        <Compare
          left={{ tone: "plain", title: "What the client sends", items: ["POST /api/orders", "{ \"productId\": \"p1\", \"quantity\": 2 }"] }}
          right={{ tone: "plain", title: "What the service receives", items: ["POST /internal/order-service/v2/orders", "X-User-ID: user_42 · X-Request-ID: req_991", "{ \"sku\": \"p1\", \"units\": 2 }"] }}
        />
        <Cards items={[
          ["Header injection", "Add request ID, caller identity and trace context."],
          ["Path rewrite", "Map public route names to internal ones."],
          ["Response filtering", "Strip internal fields before they reach clients."],
          ["Protocol bridging", "REST outside, gRPC inside, where needed."],
        ]} />
        <Call tone="warn" title="Don't turn the gateway into an application">Heavy domain logic in the gateway couples every team's deploys to one central component. Keep transformations thin.</Call>
      </Sec>

      {/* 08 */}
      <Sec id="aggregation" n={8} eyebrow="API composition" title="Aggregation and Backend for Frontend" lead="One screen often needs data from several services. The gateway can fetch them together, or you can give each client its own tailored API.">
        <Flow caption="One request, three services" steps={[
          { t: "Mobile app", s: "GET /home", i: Users },
          { t: "API gateway", s: "Fan out in parallel", i: ShieldCheck, tone: "hot" },
          { row: [{ t: "Profile", i: Desktop }, { t: "Orders", i: Desktop }, { t: "Recommendations", i: Desktop }] },
          { t: "One combined response", i: CheckCircle, tone: "good", via: "merge" },
        ]} />
        <Call tone="warn" title="Aggregation couples latency">The response is only as fast as the slowest call. Call in parallel, set a timeout for each call, return partial data when a non-critical part is slow, and move heavy composition into a dedicated service.</Call>
        <H3>Backend for Frontend (BFF)</H3>
        <Flow steps={[
          { row: [{ t: "Web", i: Desktop }, { t: "Mobile", i: Users }, { t: "Partner", i: Globe }] },
          { row: [{ t: "Web BFF", i: ShieldCheck, tone: "hot" }, { t: "Mobile BFF", i: ShieldCheck, tone: "hot" }, { t: "Partner API", i: ShieldCheck, tone: "hot" }] },
          { t: "Shared microservices", i: SquaresFour },
        ]} />
        <Prose><p>Mobile wants compact responses and few round trips; web wants richer payloads; partners need a stable, versioned contract. <Mark>A BFF per client type</Mark> lets each evolve independently, usually owned by the team that builds that client.</p></Prose>
      </Sec>

      {/* 09 */}
      <Sec id="caching" n={9} eyebrow="Performance" title="Gateway caching" lead="Some read-only responses can be answered by the gateway itself, so they never reach a service.">
        <Flow across steps={[
          { t: "GET /movies/popular", i: Users },
          { t: "Gateway cache", s: "TTL 30 seconds", i: Lightning, tone: "hot" },
          { t: "Movie service", i: Desktop, via: "miss only" },
        ]} />
        <Compare
          left={{ tone: "good", title: "Good candidates", items: ["Public data", "Read-heavy", "Changes slowly: catalogues, city lists, popular items"] }}
          right={{ tone: "bad", title: "Bad candidates", items: ["Personalised responses (/users/me)", "Authorisation-sensitive data", "Fast-changing data without careful cache keys"] }}
        />
      </Sec>

      {/* 10 */}
      <Sec id="resilience" n={10} eyebrow="Resilience" title="Timeouts, retries and circuit breakers" lead="The gateway calls everything, so it's where one slow service can drag down the whole system, or where you stop that from happening.">
        <H3>Timeouts: never wait forever</H3>
        <Table head={["Route", "Timeout", "On timeout"]} rows={[
          ["Recommendations", "300 ms", "Return the page without them"],
          ["Movie search", "500 ms", "Retry once (idempotent GET)"],
          ["Booking", "2 s", "Return an error; the client retries with its idempotency key"],
          ["Payment provider", "5 s", "Mark the result unknown, then reconcile"],
        ]} />
        <Call tone="warn" title="Timeouts follow the business">300 ms is fine for recommendations and completely wrong for a payment provider that legitimately takes seconds. Set them per route, and make them fit inside the client's own deadline.</Call>
        <H3>Retries: only when safe</H3>
        <Compare
          left={{ tone: "good", title: "Safer retry", items: ["Idempotent GETs after a network blip", "Writes carrying an idempotency key", "At most 2–3 attempts, backoff + jitter (100 ms, 200 ms…)"] }}
          right={{ tone: "bad", title: "Dangerous retry", items: ["POST /payments without an idempotency key", "Retrying at every layer (retries multiply)", "Retrying instantly, in lockstep with every other client"] }}
        />
        <H3>Circuit breakers: fail fast</H3>
        <Flow across steps={[
          { t: "CLOSED", s: "Calls pass; failures counted", i: CheckCircle, tone: "good" },
          { t: "OPEN", s: "Reject immediately / fallback", i: Warning, tone: "bad", via: "threshold hit" },
          { t: "HALF-OPEN", s: "Let a few test calls through", i: Heartbeat, tone: "hot", via: "after cooldown" },
        ]} note={<>Test calls succeed → <b>CLOSED</b>. They fail → back to <b>OPEN</b>.</>} />
        <Code title="A minimal circuit breaker" lang="js">{`
class CircuitBreaker {
  constructor({ threshold = 5, cooldownMs = 10_000 } = {}) {
    Object.assign(this, { threshold, cooldownMs, failures: 0, state: "CLOSED", openedAt: 0 });
  }
  async call(fn, fallback) {
    if (this.state === "OPEN") {
      if (Date.now() - this.openedAt < this.cooldownMs) return fallback();  // fail fast
      this.state = "HALF_OPEN";                                             // try again
    }
    try {
      const result = await fn();
      this.failures = 0; this.state = "CLOSED";
      return result;
    } catch (err) {
      if (++this.failures >= this.threshold || this.state === "HALF_OPEN") {
        this.state = "OPEN"; this.openedAt = Date.now();
      }
      return fallback(err);
    }
  }
}`}</Code>
        <Call tone="ok" title="Why fail fast?">If the payment service is clearly down, rejecting in 1 ms beats holding thousands of connections open for 5 seconds each. That frees gateway capacity for everything else and gives the service room to recover.</Call>
      </Sec>

      {/* 11 */}
      <Sec id="service-discovery" n={11} eyebrow="Dynamic infrastructure" title="Gateway + service discovery" lead="Instances appear, disappear and move as services deploy and autoscale. The gateway can't depend on hard-coded IPs.">
        <Flow steps={[
          { t: "API gateway", s: "Needs the booking service", i: ShieldCheck },
          { t: "Service discovery", s: "Registry, DNS or platform", i: MagnifyingGlass, tone: "hot" },
          { row: [{ t: "Booking 1", s: "healthy", i: Desktop, tone: "good" }, { t: "Booking 2", s: "healthy", i: Desktop, tone: "good" }, { t: "Booking 3", s: "starting", i: Desktop }] },
        ]} note="Consul, Eureka, DNS or Kubernetes Services return only healthy instances; new ones join as they pass readiness." />
      </Sec>

      {/* 12 */}
      <Sec id="observability" n={12} eyebrow="Operations and security" title="Observability and security" lead="Almost every external request passes through the gateway, so it's the best place for consistent telemetry, and the first thing attackers hit.">
        <Code title="What to record for every request" lang="text">{`
X-Request-ID: req_18271
Trace-ID:     4bf92f3577b34da6a3ce929d0e0e4736
User:         user_42
Route:        POST /api/bookings
Backend:      booking-service (10.0.3.17)
Latency:      128 ms
Status:       201`}</Code>
        <Cards items={[
          ["Access logs", "Method, route, status, latency and request IDs.", Heartbeat],
          ["Distributed tracing", "Generate or propagate trace context (W3C traceparent) downstream.", Heartbeat],
          ["Metrics", "Request rate, latency percentiles, errors and throttling.", Heartbeat],
          ["Audit logs", "Security-sensitive actions, where compliance requires.", Heartbeat],
        ]} />
        <Call tone="warn" title="Never log secrets">Tokens, passwords, card data, OTPs and sensitive personal data must never reach gateway logs. Redact them at the source.</Call>
        <H3>Hardening checklist</H3>
        <Cards cols={3} items={[
          ["TLS everywhere", "Encrypt all public traffic.", ShieldCheck],
          ["Reject bad credentials early", "Before any backend work.", ShieldCheck],
          ["Route and scope policies", "Least privilege by default.", ShieldCheck],
          ["Payload limits", "Huge bodies can't exhaust memory.", ShieldCheck],
          ["WAF integration", "Filter known attack patterns.", ShieldCheck],
          ["CORS and private backends", "Only allowed origins; services unreachable directly.", ShieldCheck],
        ]} />
      </Sec>

      {/* 13 */}
      <Sec id="high-availability" n={13} eyebrow="Reliability" title="High availability, zones and regions" lead="Every request passes through the gateway, so it must scale out and survive instance, zone and even region failures.">
        <Flow steps={[
          { t: "Users", i: Users },
          { t: "Load balancer", s: "Spreads gateway traffic", i: ArrowsSplit },
          { row: [{ t: "Gateway 1", s: "zone A", i: ShieldCheck, tone: "hot" }, { t: "Gateway 2", s: "zone B", i: ShieldCheck, tone: "hot" }, { t: "Gateway N", s: "zone C", i: ShieldCheck, tone: "hot" }] },
          { t: "Backend services", i: SquaresFour },
        ]} />
        <Cards cols={3} items={[
          ["Stateless instances", "Easy to add, replace and autoscale."],
          ["Many instances, many zones", "Never one gateway process."],
          ["Health checks", "Unhealthy instances leave rotation automatically."],
          ["Autoscaling", "On request rate, CPU or latency."],
          ["External shared state", "Rate-limit counters and config in replicated stores."],
          ["Graceful drain + staged config", "No dropped requests; bad config rolls back fast."],
        ]} />
        <H3>Multi-region</H3>
        <Flow steps={[
          { t: "Global users", i: Users },
          { t: "Global traffic manager", s: "Latency + health routing", i: Globe, tone: "hot" },
          { row: [{ t: "India gateway", i: ShieldCheck }, { t: "US gateway", i: ShieldCheck }, { t: "EU gateway", i: ShieldCheck }] },
        ]} />
        <Call tone="warn" title="Global policy needs a consistency plan">Signing keys, global rate limits and route config must replicate across regions with a defined strategy. Decide what's global, what's regional, and how fast changes propagate.</Call>
      </Sec>

      {/* 14 */}
      <Sec id="bookmyshow" n={14} eyebrow="Case study" title="Protecting a ticket flash sale" lead="How a BookMyShow-style platform could use its gateway when a blockbuster's tickets go live.">
        <Call tone="info" title="About this example">A conceptual ticket-booking design for interview practice, not a description of any company's private implementation.</Call>
        <Flow steps={[
          { t: "Web / mobile", s: "Ticket buyers", i: Users },
          { t: "CDN / WAF", s: "Edge protection", i: Cloud },
          { t: "Load balancer", i: ArrowsSplit },
          { t: "API gateway", s: "Auth · rate limit · route · trace", i: ShieldCheck, tone: "hot" },
          { row: [{ t: "Search", s: "movies", i: MagnifyingGlass }, { t: "Booking", s: "seats", i: Lock }, { t: "Payment", s: "transactions", i: Desktop }, { t: "User", s: "profiles", i: Users }] },
        ]} />
        <Code title="Public routes" lang="http">{`
GET  /api/movies/*     →  search-service
GET  /api/shows/*      →  show-service
POST /api/bookings     →  booking-service
POST /api/payments     →  payment-service
GET  /api/users/me     →  user-service`}</Code>
        <H3>A booking request during the sale</H3>
        <Steps items={[
          ["Edge", "The request passes CDN and WAF checks."],
          ["Authenticate", "The gateway verifies the JWT; anonymous users can browse but not book."],
          ["Rate limit", "Per-IP, per-user and per-route booking quotas are checked."],
          ["Validate", "Payload shape and size are verified."],
          ["Tag", "A request ID and trace context are attached."],
          ["Route", "Sent to a healthy booking instance, with a tight timeout and a circuit breaker."],
          ["Book", "The booking service handles seat locks and the durable booking."],
          ["Pay", "The payment service charges using an idempotency key."],
          ["Respond", "The gateway returns the final response and records the metrics."],
        ]} />
        <Call tone="warn" title="The gateway doesn't prevent double booking">It protects and routes the API. Seat correctness still comes from the booking service: Redis seat holds, database conditional updates and idempotency.</Call>
      </Sec>

      {/* 15 */}
      <Sec id="failures" n={15} eyebrow="Production engineering" title="Failure scenarios and metrics" lead="The gateway sits on the critical path, so every failure mode needs a planned answer.">
        <Table head={["Failure", "Response"]} rows={[
          ["A gateway instance crashes", "The load balancer's health checks stop routing to it."],
          ["A backend fails", "Timeouts, circuit breakers and fallbacks."],
          ["A backend becomes slow", "Bounded timeouts so gateway resources aren't held indefinitely."],
          ["Auth provider is down", "Cached JWKS keys keep JWT validation working; plan what's safe without it."],
          ["Redis rate limiter is down", "Fail open or closed per route; fall back to local limits."],
          ["Gateway CPU saturates", "Autoscale, simplify policies, move heavy work out."],
          ["Retry storm", "Bounded retries with exponential backoff and jitter; retry budgets."],
          ["Bad config deployed", "Validate, roll out in stages, roll back fast."],
          ["Region failure", "Global routing shifts traffic to a healthy region."],
          ["Certificate expires", "Automate renewal and alert well before expiry."],
        ]} />
        <H3>Metrics to watch</H3>
        <Chips label="Gateway metrics" items={["Requests / sec", "p50 / p95 / p99 latency", "2xx / 4xx / 5xx rate", "429 rate", "Auth failures", "Timeout rate", "Retry rate", "Circuit opens", "Gateway CPU & memory", "Active connections", "Backend latency & errors", "Traffic per route", "Cache hit ratio", "TLS errors"]} />
      </Sec>
    </ReaderPage>
  );
}
