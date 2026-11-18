import {
  ArrowsClockwise, ArrowsSplit, CheckCircle, Cloud, Database, Desktop, Globe, Heartbeat, Lightning, Lock, Path, Queue, ShieldCheck, Stack, Timer, Users, Warning, WifiHigh,
} from "@phosphor-icons/react";

import { Call, Cards, Chips, Code, Compare, Flow, H3, Mark, Prose, ReaderPage, Sec, Specs, Steps, Table } from "../resources/kit/Reader";

/* =====================================================================
   LOAD BALANCING  (/resources/hld/load-balancing)
   First guide in the system design path. Non-body content lives in GUIDE;
   the kit renders the shared blocks and the structured data from it.
===================================================================== */
const GUIDE = {
  id: "lb",
  path: "/resources/hld/load-balancing",
  short: "Load balancing",
  section: "System Design",
  seoTitle: "Load Balancing in System Design: L4 vs L7, Algorithms, Health Checks | Target Trek",
  description: "A free, complete guide to load balancing for system design interviews: L4 vs L7, round robin, least connections, consistent hashing, health checks, sticky sessions, TLS termination, high availability, global load balancing, WebSockets and a ticket-booking case study.",
  keywords: ["load balancing system design", "load balancer", "L4 vs L7 load balancer", "round robin vs least connections", "consistent hashing load balancing", "health checks", "sticky sessions", "reverse proxy vs load balancer", "global load balancing", "websocket load balancing", "HLD interview questions"],
  about: ["Load balancing", "System design", "High availability", "Horizontal scaling", "Reverse proxy", "Consistent hashing"],
  tags: ["System design", "Scalability", "Fundamental"],
  h1: "Load Balancing in System Design",
  sub: "Why one server is never enough, how a load balancer decides where each request goes, and how to keep the balancer itself from becoming the thing that breaks.",
  answer: "A load balancer sits between clients and a pool of servers and decides which healthy server gets each new request or connection. It lets you scale horizontally, survive individual server failures and deploy without downtime. Layer 4 balancers route by IP and port; Layer 7 balancers read HTTP and can route by host, path, header or cookie.",
  minutes: 30,
  level: "Fundamental",
  updated: "2026-11-18",
  crumbs: [["Resources", "/resources"], ["System design", "/resources/hld"], ["Load balancing", "/resources/hld/load-balancing"]],
  learn: [
    "L4 vs L7, and the four ways to classify a load balancer",
    "Eleven routing algorithms, from round robin to power of two choices",
    "Health checks, readiness and connection draining",
    "Why sticky sessions hurt, and what to do instead",
    "Keeping the balancer itself highly available, regionally and globally",
  ],
  toc: [
    { id: "what-is-load-balancer", label: "What is a load balancer?" },
    { id: "types", label: "Types of load balancers" },
    { id: "l4-vs-l7", label: "L4 vs L7" },
    { id: "algorithms", label: "Routing algorithms" },
    { id: "health-checks", label: "Health checks" },
    { id: "sticky-sessions", label: "Sticky sessions" },
    { id: "reverse-proxy", label: "Load balancer vs reverse proxy" },
    { id: "tls", label: "TLS termination" },
    { id: "high-availability", label: "High availability" },
    { id: "millions", label: "Millions of requests" },
    { id: "global", label: "Global load balancing" },
    { id: "websockets", label: "WebSockets" },
    { id: "case-study", label: "Case study: ticket booking" },
    { id: "failures", label: "Failure handling" },
  ],
  questions: [
    { q: "What is a load balancer and why do we need one?", a: "It distributes incoming requests or connections across a pool of servers. One server has finite CPU, memory and connections and is a single point of failure; a load balancer lets you run many identical servers, route around failed ones and add or remove capacity without clients noticing." },
    { q: "What are the different types of load balancers?", a: "Classify them on four independent axes: by protocol layer (L4 or L7), by deployment (hardware appliance, software like NGINX/HAProxy/Envoy, or a managed cloud service), by traffic scope (external, internal, global) and by who makes the decision (a central proxy, or client-side load balancing in the caller's library)." },
    { q: "What is the difference between L4 and L7 load balancing?", a: "L4 works with connection metadata (IP addresses, TCP/UDP ports) and forwards connections without understanding HTTP, so it is fast and protocol-agnostic. L7 terminates HTTP, reads the host, path, headers and cookies, and can route /orders and /payments to different services, terminate TLS, rewrite headers and do canary releases." },
    { q: "When would you choose L4 over L7?", a: "For non-HTTP traffic such as databases, game servers, MQTT or raw TCP/UDP; when you need maximum throughput with minimal processing; or when you want end-to-end TLS to the backend without the balancer decrypting it." },
    { q: "Round robin vs least connections?", a: "Round robin sends requests to servers in turn and ignores load, which is fine when servers and requests are uniform. Least connections sends the next request to the server with the fewest active connections, which handles uneven request durations and long-lived connections much better." },
    { q: "What is weighted round robin used for?", a: "Giving bigger machines proportionally more traffic, or shifting traffic gradually during a migration or canary: for example 95% to the old version and 5% to the new one." },
    { q: "What is the power of two choices?", a: "Pick two healthy servers at random and send the request to the less loaded one. It gets close to the balance of checking every server, at a fraction of the cost, and avoids the herd effect where every balancer picks the same 'least loaded' server at once." },
    { q: "IP hash vs consistent hashing?", a: "IP hash maps hash(client IP) mod N to a server; when N changes almost every client moves. Consistent hashing places servers and keys on a ring, so adding or removing a server only remaps the keys next to it. Use it where routing stability matters, such as cache shards." },
    { q: "What are active and passive health checks?", a: "Active checks probe each backend on a schedule (a TCP connect or GET /health/ready) and remove it after N failures. Passive checks watch real traffic for timeouts, resets and 5xx errors. Use both: a server can pass a shallow probe while failing real requests." },
    { q: "Liveness vs readiness?", a: "Liveness asks whether the process is alive or should be restarted. Readiness asks whether it should receive traffic right now. A server warming caches or unable to reach its database is alive but not ready, and the balancer should route on readiness." },
    { q: "What is connection draining?", a: "Before removing a server for a deploy or scale-down, the balancer stops sending it new requests but lets in-flight requests and open connections finish, up to a deadline, before the instance is terminated. It prevents dropped requests during rolling deploys." },
    { q: "What are sticky sessions and why can they be harmful?", a: "Sticky sessions pin a user to one server, usually through a cookie, so in-memory session data keeps working. They cause uneven load, lose sessions when that server dies and complicate deploys and autoscaling. The better design is stateless servers with session state in Redis or a signed token." },
    { q: "Load balancer vs reverse proxy?", a: "A reverse proxy stands in front of servers and forwards requests to them, hiding the backend; it can do TLS, caching, compression and header rewriting. Load balancing is one thing a reverse proxy can do. NGINX, HAProxy and Envoy do both, which is why the terms are often used together." },
    { q: "What is TLS termination, and when do you re-encrypt?", a: "The balancer holds the certificate, decrypts HTTPS and can then read the HTTP request to route it. It centralises certificate management. If security or compliance requires encryption inside the network, it opens a new TLS connection to the backend (re-encryption)." },
    { q: "How do you stop the load balancer from becoming a single point of failure?", a: "Run several balancer instances across availability zones, active-active or active-passive, behind a stable entry point such as a virtual IP, anycast address or DNS name. Managed cloud load balancers do this for you, but you still design for zone and region failure." },
    { q: "Active-active vs active-passive?", a: "In active-active every balancer serves traffic, so you use all capacity and lose only a share when one fails. In active-passive a standby waits to take over, which is simpler but wastes capacity and adds failover time." },
    { q: "How would you handle millions of requests per second?", a: "Reduce traffic before it reaches the balancer (CDN, caching), filter abuse (WAF, rate limits), pick a region with global load balancing, spread requests across zone-aware regional balancers and autoscaled stateless services, queue non-urgent work and protect the database with caches, replicas and sharding." },
    { q: "How does global load balancing work, and why is DNS failover slow?", a: "A global layer (GeoDNS, anycast or a global proxy) picks a region by latency, geography, health and policy; then the regional balancer picks a server. DNS answers are cached by resolvers and clients until their TTL expires, and sometimes longer, so DNS-based failover can take minutes." },
    { q: "How do you load balance WebSockets?", a: "The balancer picks a backend when the connection upgrades, and the connection then stays there for minutes or hours. Use least connections or capacity-aware routing rather than round robin, a pub/sub layer so servers can reach users connected elsewhere, and graceful draining with client reconnects for deploys." },
    { q: "How do retries cause a retry storm, and how do you prevent it?", a: "When a backend slows down, every client retries, multiplying the load on an already struggling system. Prevent it with bounded retries, exponential backoff with jitter, request deadlines, retry budgets, and never blindly retrying non-idempotent writes." },
    { q: "Why doesn't load balancing solve double booking?", a: "Two users can be routed to two different booking servers and compete for the same seat; stickiness can't prevent that. Correctness must live in shared, authoritative state: an atomic seat lock plus a conditional update or unique constraint in the database." },
    { q: "What happens if payment succeeds after the seat-lock timeout?", a: "The seat may already be released or sold. The payment callback must be idempotent and run a reconciliation: confirm the booking if the seat is still free, otherwise refund automatically or offer an alternative. The flow should never leave a user charged with no seat." },
  ],
  quiz: [
    { q: "You need to route /payments and /orders on the same domain to different services. Which balancer do you need?", options: ["Layer 4", "Layer 7", "DNS round robin", "Any of them"], answer: 1, why: "Path-based routing requires reading the HTTP request, which only a Layer 7 balancer does. L4 sees only IPs and ports." },
    { q: "Requests vary from 5 ms to 5 seconds. Which algorithm usually balances best?", options: ["Round robin", "Random", "Least connections", "IP hash"], answer: 2, why: "Long requests keep connections open, so the active connection count tracks real load. Round robin would keep handing work to a server stuck on slow requests." },
    { q: "Your /health endpoint returns 200, but real requests to that server time out. What would catch this?", options: ["A longer health check interval", "Passive health checks on real traffic", "Sticky sessions", "Weighted round robin"], answer: 1, why: "Passive checks watch timeouts and 5xx errors on live traffic, so they catch a server that passes the synthetic probe but fails real work." },
    { q: "What is the main downside of sticky sessions?", options: ["They need TLS", "They make L7 routing impossible", "Uneven load, and lost sessions when a server dies", "They only work for WebSockets"], answer: 2, why: "Users are pinned to specific servers, so load skews, a crash loses that server's in-memory sessions, and deploys get harder." },
    { q: "Adding one server to a modulo-hashed pool of 10 moves about how many keys?", options: ["About 10%", "About half", "Almost all of them", "None"], answer: 2, why: "hash mod 10 vs hash mod 11 disagree for most keys, so nearly everything moves. Consistent hashing moves only about 1/11 of the keys." },
    { q: "Why can DNS-based regional failover take minutes?", options: ["DNS servers are slow", "Resolvers and clients cache answers until the TTL expires", "TLS certificates must be reissued", "Load balancers must restart"], answer: 1, why: "Cached DNS answers keep sending users to the failed region until they expire, and some clients cache longer than the TTL." },
  ],
  glossary: [
    ["Backend pool", "The set of servers a load balancer can send traffic to. Also called a target group or upstream."],
    ["Layer 4 (L4)", "Transport-layer balancing by IP address and TCP/UDP port."],
    ["Layer 7 (L7)", "Application-layer balancing that reads HTTP host, path, headers and cookies."],
    ["Health check", "A probe or signal that decides whether a backend may receive traffic."],
    ["Readiness", "Whether an instance should receive traffic right now, as opposed to just being alive."],
    ["Connection draining", "Letting in-flight requests finish before removing a server."],
    ["Sticky session", "Routing a user to the same backend every time. Also: session affinity."],
    ["TLS termination", "Decrypting HTTPS at the balancer so it can read and route the request."],
    ["Anycast", "One IP address announced from many locations; the network routes users to the nearest one."],
    ["Retry storm", "A surge of retries that overloads an already struggling service."],
  ],
  takeaways: [
    "A load balancer turns many servers into one stable endpoint. It enables horizontal scaling, failover and zero-downtime deploys.",
    "L4 routes connections by IP and port; L7 reads HTTP and routes by host, path, header or cookie.",
    "Pick the algorithm from the workload: round robin for uniform requests, least connections for uneven ones, consistent hashing when routing must stay stable.",
    "Route on readiness, combine active and passive health checks, and drain connections before removing a server.",
    "Keep servers stateless; put session state in Redis or a token instead of relying on sticky sessions.",
    "The balancer must not be a single point of failure: run it across zones, and use global load balancing across regions.",
    "Load balancing spreads load; it doesn't create capacity or correctness. Caches, queues, rate limits and database design do the rest.",
  ],
  faq: [
    { q: "What is a load balancer in simple words?", a: "A load balancer is a traffic manager in front of a group of servers. Each incoming request goes to one healthy server, chosen by a rule such as 'next in line' or 'least busy', so no single server is overloaded and a failed server is skipped automatically." },
    { q: "What is the difference between L4 and L7 load balancers?", a: "A Layer 4 balancer routes by IP address and port without reading the request, which is fast and works for any TCP or UDP protocol. A Layer 7 balancer understands HTTP and can route by URL path, host, header or cookie, terminate TLS and support canary releases." },
    { q: "Which load balancing algorithm is best?", a: "There is no single best one. Round robin suits identical servers and similar requests; least connections suits uneven or long-lived requests; weighted variants handle mixed capacity; consistent hashing suits caches and partitioned data where the same key should reach the same server." },
    { q: "Is a load balancer a single point of failure?", a: "It can be if you run only one. Production setups run several balancer instances across availability zones, active-active or active-passive, behind a virtual IP, anycast address or DNS name. Managed cloud load balancers are built this way." },
    { q: "Are NGINX and HAProxy load balancers?", a: "Yes. NGINX, HAProxy and Envoy are software reverse proxies that also load balance at Layer 4 and Layer 7. Cloud providers offer managed equivalents, such as application and network load balancers." },
    { q: "Do I need a load balancer for a small app?", a: "Not for a single server. You need one as soon as you run two or more instances, want zero-downtime deploys, or need to survive one server failing, which is usually when an app first goes to production with real users." },
  ],
  next: { title: "API Gateway", path: "/resources/hld/api-gateway", text: "One front door for routing, authentication, throttling, aggregation and BFFs across your microservices." },
  book: {
    path: "/book/system-design/hld", label: "HLD book", title: "Learn complete system design, not isolated definitions",
    text: "Go from requirements to APIs, services, databases, caching, load balancing, queues, concurrency and failures in complete interview-style systems.",
    short: "Complete interview designs, end to end.",
    chips: ["Load balancing", "Caching", "Databases", "Queues", "BookMyShow", "Uber"],
  },
};

const TYPES = [
  { title: "Layer 4 load balancer", tag: "Protocol layer", facts: [["How it works", "Accepts a TCP/UDP connection and forwards it to a healthy backend by IP and port, without reading HTTP."], ["Common use", "Databases, game servers, MQTT, raw TCP/UDP and very high-throughput traffic."], ["Strength", "Fast, simple and works for any protocol.", "good"], ["Trade-off", "Can't route by path, header, cookie or user plan.", "cost"]] },
  { title: "Layer 7 load balancer", tag: "Protocol layer", facts: [["How it works", "Terminates HTTP (and usually TLS), reads the request, applies routing rules, then forwards to a backend."], ["Common use", "Microservices, REST APIs, web apps, canary releases, TLS termination."], ["Strength", "Rich routing and per-request control.", "good"], ["Trade-off", "More processing and config, and it sits in every request's path.", "cost"]] },
  { title: "Hardware appliance", tag: "Deployment", facts: [["How it works", "A dedicated physical device in the data centre with vendor software for L4/L7, TLS offload and security."], ["Common use", "Traditional enterprise and regulated data centres."], ["Strength", "Very high, predictable throughput.", "good"], ["Trade-off", "Expensive, slow to buy, fixed capacity.", "cost"]] },
  { title: "Software load balancer", tag: "Deployment", facts: [["How it works", "NGINX, HAProxy or Envoy running on VMs, containers or bare metal."], ["Common use", "Self-managed infra, Kubernetes ingress, service meshes."], ["Strength", "Full control and cheap to scale out.", "good"], ["Trade-off", "Your team owns upgrades, scaling and its high availability.", "cost"]] },
  { title: "Managed cloud load balancer", tag: "Deployment", facts: [["How it works", "You configure listeners, rules, certificates and health checks; the provider runs and scales it."], ["Common use", "Cloud-native apps that want simple operations and autoscaling."], ["Strength", "Little to operate, built-in multi-zone.", "good"], ["Trade-off", "Provider-specific behaviour, quotas and cost.", "cost"]] },
  { title: "External vs internal", tag: "Traffic scope", facts: [["External", "Public endpoint for websites, mobile and public APIs. Needs TLS, DDoS protection and a WAF."], ["Internal", "Private endpoint inside the VPC for service-to-service traffic. Still needs auth and segmentation."]] },
  { title: "Client-side vs server-side", tag: "Who decides", facts: [["Client-side", "The caller's library picks an instance from service discovery. No extra hop, but every client needs routing logic."], ["Server-side", "Clients call one stable endpoint and the proxy picks the backend. Simpler clients; the proxy must be highly available."]] },
  { title: "DNS / global load balancing", tag: "Global routing", facts: [["How it works", "GeoDNS, anycast or a global proxy sends each user to a healthy, nearby region."], ["Common use", "Multi-region apps, disaster recovery, lower latency worldwide."], ["Strength", "Regional failover and latency gains.", "good"], ["Trade-off", "DNS caching delays failover; data across regions is the hard part.", "cost"]] },
];

const ALGOS = [
  { title: "Round robin", tag: "Static", facts: [["Rule", "S1 → S2 → S3 → S1 → …"], ["How", "Each healthy server gets the next request in turn."], ["Best for", "Equal servers and similar request costs.", "good"], ["Trade-off", "Blind to load: a server stuck on slow requests still gets its turn.", "cost"]] },
  { title: "Weighted round robin", tag: "Static, weighted", facts: [["Rule", "S1 weight 5, S2 weight 3, S3 weight 2"], ["How", "Traffic in proportion to configured weights."], ["Best for", "Mixed server sizes and gradual traffic shifts (canaries).", "good"], ["Trade-off", "Static weights don't follow live CPU or latency.", "cost"]] },
  { title: "Least connections", tag: "Dynamic", facts: [["Rule", "Pick the server with the fewest active connections"], ["How", "Tracks open connections per server."], ["Best for", "Uneven or long-lived requests, WebSockets.", "good"], ["Trade-off", "One connection can cost much more than another.", "cost"]] },
  { title: "Weighted least connections", tag: "Dynamic, weighted", facts: [["Rule", "Connections ÷ capacity weight"], ["How", "Bigger servers may hold more concurrent connections."], ["Best for", "Mixed fleets with varying request duration.", "good"], ["Trade-off", "Needs sensible weights and accurate counts.", "cost"]] },
  { title: "Least response time", tag: "Dynamic", facts: [["Rule", "Prefer low latency and low active load"], ["How", "Uses observed response times, often with connection counts."], ["Best for", "Backends whose latency varies at runtime.", "good"], ["Trade-off", "Noisy measurements can make traffic oscillate.", "cost"]] },
  { title: "Random", tag: "Probabilistic", facts: [["Rule", "Pick any healthy server"], ["How", "Over many requests, load evens out."], ["Best for", "Large, uniform pools.", "good"], ["Trade-off", "Short-term imbalance; ignores live load.", "cost"]] },
  { title: "Power of two choices", tag: "Probabilistic, dynamic", facts: [["Rule", "Sample 2 random servers → pick the less loaded"], ["How", "Near-optimal balance without scanning every server."], ["Best for", "Large pools and many independent balancers.", "good"], ["Trade-off", "Needs a meaningful load signal.", "cost"]] },
  { title: "IP hash", tag: "Hash-based", facts: [["Rule", "hash(clientIP) % N"], ["How", "The same IP usually reaches the same server."], ["Best for", "Simple, approximate client affinity.", "good"], ["Trade-off", "NAT puts many users on one IP; changing N remaps most clients.", "cost"]] },
  { title: "URL / key hash", tag: "Hash-based", facts: [["Rule", "hash(path or tenant or userId) → server"], ["How", "Related requests land on the same worker."], ["Best for", "Cache locality and tenant affinity.", "good"], ["Trade-off", "Skewed keys create hot spots.", "cost"]] },
  { title: "Consistent hashing", tag: "Hash-based", facts: [["Rule", "hash(key) → position on a ring → next server clockwise"], ["How", "Adding or removing a server remaps only its neighbours' keys."], ["Best for", "Distributed caches and partition-aware routing.", "good"], ["Trade-off", "More complex; needs virtual nodes for even spread.", "cost"]] },
  { title: "Adaptive / resource-based", tag: "Dynamic", facts: [["Rule", "Score from CPU, memory, queue depth, latency, errors"], ["How", "Routes on live resource signals."], ["Best for", "Workloads where connection count misleads.", "good"], ["Trade-off", "Delayed telemetry can cause feedback loops.", "cost"]] },
];

export default function HLDLoadBalancingResource() {
  return (
    <ReaderPage guide={GUIDE}>
      {/* 01 */}
      <Sec id="what-is-load-balancer" n={1} eyebrow="Fundamentals" title="What is a load balancer?" lead="A traffic-distribution layer between clients and a pool of servers. For every new request or connection, it picks one healthy server.">
        <Flow caption="One endpoint, many servers" steps={[
          { t: "Clients", s: "Web, mobile, API consumers", i: Users },
          { t: "Load balancer", s: "Health checks + routing decision", i: ArrowsSplit, tone: "hot", via: "incoming traffic" },
          { row: [{ t: "Server A", s: "healthy", i: Desktop, tone: "good" }, { t: "Server B", s: "healthy", i: Desktop, tone: "good" }, { t: "Server C", s: "healthy", i: Desktop, tone: "good" }], via: "pick a healthy server" },
        ]} />
        <Cards items={[
          ["Why one server is not enough", "A single server has finite CPU, memory, bandwidth and connections, and however big it gets it is still one failure domain. Horizontal scaling runs many copies; the load balancer is what makes many copies usable.", Desktop],
          ["What the balancer knows", "Depending on its type: which backends are healthy, their connection counts and latency, the request's host and path, cookies, headers and server weights. It never sends new traffic to a server marked unhealthy.", Heartbeat],
        ]} />
        <Call tone="interview" title="it's not only about speed">Load balancing also gives you <strong>availability</strong> (route around failures), <strong>elasticity</strong> (add or remove servers freely), <strong>zero-downtime deploys</strong> (drain and replace one server at a time) and a <strong>stable front door</strong> while everything behind it changes.</Call>
        <H3>The life of one request</H3>
        <Steps items={[
          ["The client calls a stable name", "For example api.example.com. It never knows how many servers sit behind it."],
          ["The edge receives it", "DNS, a CDN or a WAF may sit before the load balancer."],
          ["The balancer filters the pool", "Only healthy, ready, non-draining targets are eligible."],
          ["The algorithm picks one", "Round robin, least connections, a hash, and so on."],
          ["The backend responds", "Back through the proxy, or straight to the client in some L4 setups."],
        ]} />
      </Sec>

      {/* 02 */}
      <Sec id="types" n={2} eyebrow="Classification" title="Types of load balancers" lead="“Type” can mean four different things. Interviewers notice when you separate them instead of listing everything in one breath.">
        <Flow caption="Four independent ways to classify a load balancer" steps={[
          { t: "Load balancer", i: ArrowsSplit, tone: "hot" },
          { row: [{ t: "Protocol layer", s: "L4 / L7", i: Stack }, { t: "Deployment", s: "Hardware / software / managed", i: Desktop }, { t: "Traffic scope", s: "External / internal / global", i: Globe }, { t: "Who decides", s: "Client-side / server-side", i: Path }] },
        ]} />
        <Call tone="ok" title="How to answer “what types are there?”">Start with <strong>L4 vs L7</strong> (protocol layer). Then mention deployment (hardware, software, managed cloud), scope (external, internal, global) and decision owner (client-side or proxy). One sentence each, and you've covered the whole space without mixing categories.</Call>
        <Specs items={TYPES} />
      </Sec>

      {/* 03 */}
      <Sec id="l4-vs-l7" n={3} eyebrow="Core interview topic" title="Layer 4 vs Layer 7 load balancing" lead="Both pick a backend. They differ in how much of the request they can see, and therefore in what they can decide.">
        <Compare
          left={{ tone: "plain", title: "Layer 4 · transport", text: "Works with connection metadata only.", items: ["Routes by source/destination IP, port and protocol", "Never parses HTTP, so it works for any TCP/UDP service", "Example: TCP 5432 to a pool of PostgreSQL proxies", "Can pass TLS through untouched"] }}
          right={{ tone: "plain", title: "Layer 7 · application", text: "Understands HTTP and what the request means.", items: ["Routes by host, path, method, header or cookie", "One domain: /users, /orders, /payments to different services", "TLS termination, redirects, header rewrites", "Canary releases, A/B tests, auth integration"] }}
        />
        <Table head={["", "Layer 4", "Layer 7"]} rows={[
          ["Sees", "IP, port, TCP/UDP connection", "Host, path, headers, cookies, method"],
          ["HTTP-aware", "No", "Yes"],
          ["Path routing", "No", "Yes"],
          ["TLS termination", "Usually passes TLS through", "Commonly terminates it"],
          ["Protocols", "Any TCP/UDP", "HTTP/1.1, HTTP/2, gRPC, WebSocket"],
          ["Cost per request", "Lower", "Higher (parses every request)"],
          ["Typical product", "Network load balancer", "Application load balancer, ingress"],
        ]} />
        <H3>L4: a connection-level decision</H3>
        <Flow across steps={[
          { t: "Client", s: "Opens a TCP connection", i: Users },
          { t: "L4 balancer", s: "Decides on IP + port", i: ArrowsSplit, tone: "hot" },
          { t: "Backend", s: "Gets the whole connection", i: Desktop },
        ]} />
        <H3>L7: path-based routing</H3>
        <Flow steps={[
          { t: "api.example.com", s: "HTTPS requests", i: Globe },
          { t: "L7 balancer", s: "Host / path / header rules", i: Path, tone: "hot", via: "reads the HTTP request" },
          { row: [{ t: "/users", s: "User service", i: Desktop }, { t: "/orders", s: "Order service", i: Desktop }, { t: "/payments", s: "Payment service", i: Desktop }] },
        ]} />
      </Sec>

      {/* 04 */}
      <Sec id="algorithms" n={4} eyebrow="Routing strategy" title="Load balancing algorithms" lead="Once the balancer knows which servers are eligible, an algorithm picks one. Static algorithms ignore live load; dynamic ones react to it.">
        <Specs items={ALGOS} />
        <H3>Round robin, visualised</H3>
        <Flow steps={[
          { row: [{ t: "Request 1", i: Users }, { t: "Request 2", i: Users }, { t: "Request 3", i: Users }] },
          { t: "Round robin", s: "Cycle through healthy servers", i: ArrowsClockwise, tone: "hot" },
          { row: [{ t: "Server A", s: "← request 1", i: Desktop }, { t: "Server B", s: "← request 2", i: Desktop }, { t: "Server C", s: "← request 3", i: Desktop }] },
        ]} />
        <Call tone="warn" title="An algorithm can't create capacity">No routing rule saves a system whose total backend capacity is below demand. Load balancing spreads load; autoscaling, caching, queueing, rate limiting and database scaling are what add or protect capacity.</Call>
      </Sec>

      {/* 05 */}
      <Sec id="health-checks" n={5} eyebrow="Reliability" title="Health checks and backend eligibility" lead="The balancer must know which servers can safely take traffic. Health checking is part of routing correctness, not just monitoring.">
        <Compare
          left={{ tone: "plain", title: "Active health checks", text: "The balancer probes each backend on a schedule.", items: ["TCP connect or GET /health/ready every few seconds", "Removed after N consecutive failures", "Re-added only after M successes, to avoid flapping"] }}
          right={{ tone: "plain", title: "Passive health signals", text: "The balancer watches real production traffic.", items: ["Timeouts and connection resets", "Spikes in 5xx responses", "Unusually high latency (outlier detection)"] }}
        />
        <Code title="A readiness endpoint" lang="http">{`
GET /health/ready

HTTP/1.1 200 OK
Content-Type: application/json

{ "status": "UP", "ready": true, "db": "ok", "cache": "ok" }`}</Code>
        <Flow caption="The healthy pool" steps={[
          { t: "Load balancer", s: "Keeps the list of eligible servers", i: ArrowsSplit, tone: "hot" },
          { row: [{ t: "Server A", s: "healthy: gets traffic", i: Desktop, tone: "good" }, { t: "Server B", s: "unhealthy: removed", i: Desktop, tone: "bad" }, { t: "Server C", s: "healthy: gets traffic", i: Desktop, tone: "good" }], via: "health probes" },
        ]} />
        <Call tone="warn" title="Liveness is not readiness">A process can be <strong>alive</strong> but not <strong>ready</strong>: still loading config, warming caches, or unable to reach its database. Route on readiness; restart on liveness.</Call>
        <H3>Connection draining</H3>
        <Prose><p>Killing an instance mid-deploy drops whatever it was serving. Instead, mark it <Mark>draining</Mark>: stop sending new requests, let in-flight requests and open connections finish within a grace period (say 30 seconds), then terminate it. This is how rolling deploys stay invisible to users.</p></Prose>
      </Sec>

      {/* 06 */}
      <Sec id="sticky-sessions" n={6} eyebrow="Session affinity" title="Sticky sessions" lead="Sticky sessions send a user's repeated requests to the same server. Useful sometimes, but they tie users to individual machines.">
        <Flow steps={[
          { t: "User A", s: "Session cookie or affinity key", i: Users },
          { t: "Load balancer", s: "Maps User A → Server 2", i: ArrowsSplit, tone: "hot", via: "affinity key" },
          { row: [{ t: "Server 1", i: Desktop }, { t: "Server 2", s: "User A always lands here", i: Desktop, tone: "hot" }, { t: "Server 3", i: Desktop }] },
        ]} />
        <Compare
          left={{ tone: "good", title: "Why teams use it", items: ["Keeps in-memory sessions working", "Better local cache hit rates", "Supports legacy apps that aren't stateless"] }}
          right={{ tone: "bad", title: "Why it hurts at scale", items: ["Load becomes uneven", "A crashed server loses its users' sessions", "Deploys and autoscaling get harder"] }}
        />
        <Call tone="ok" title="The scalable design">Make servers stateless. Keep session state in a shared store such as Redis, or in a signed token if your security model allows it. Then any healthy server can handle any request, and the balancer is free to spread load evenly.</Call>
      </Sec>

      {/* 07 */}
      <Sec id="reverse-proxy" n={7} eyebrow="Related concept" title="Load balancer vs reverse proxy" lead="A reverse proxy stands in for your servers. Load balancing is one of the things it can do, but not the only one.">
        <Compare
          left={{ tone: "plain", title: "Load balancer", text: "Defined by its job.", items: ["Spreads traffic across many eligible backends", "Health checks and a routing algorithm", "Often also does TLS and observability"] }}
          right={{ tone: "plain", title: "Reverse proxy", text: "Defined by where it sits.", items: ["Terminates client connections and forwards them", "Hides the backend topology", "TLS, compression, caching, redirects, header rewrites, and load balancing"] }}
        />
        <Flow steps={[
          { t: "Client", s: "Knows only the public endpoint", i: Users },
          { t: "Reverse proxy / L7 balancer", s: "TLS + routing + balancing + policy", i: Path, tone: "hot" },
          { row: [{ t: "Service A", i: Desktop }, { t: "Service B", i: Desktop }, { t: "Service C", i: Desktop }] },
        ]} />
        <Call tone="info" title="Real products">NGINX, HAProxy and Envoy do both jobs. Cloud application load balancers and Kubernetes ingress controllers combine them too, which is why the two terms are so often used together.</Call>
      </Sec>

      {/* 08 */}
      <Sec id="tls" n={8} eyebrow="Security" title="TLS termination and re-encryption" lead="An L7 balancer can decrypt HTTPS, read the request to route it, and optionally encrypt again on the way to the backend.">
        <Flow steps={[
          { t: "Client", s: "HTTPS", i: Users },
          { t: "L7 load balancer", s: "Holds the certificate, terminates TLS", i: ShieldCheck, tone: "hot", via: "encrypted" },
          { t: "Backend service", s: "Private network", i: Desktop, via: "HTTP, or a new TLS connection" },
        ]} />
        <Cards items={[
          ["Why terminate at the balancer", "One place to manage certificates, and the balancer can read paths and headers to route. Backends don't each need certificate configuration.", ShieldCheck],
          ["Why re-encrypt to the backend", "Some security and compliance models (PCI DSS, zero-trust networks) require encryption inside the private network too. The balancer opens a second TLS connection.", Lock],
        ]} />
      </Sec>

      {/* 09 */}
      <Sec id="high-availability" n={9} eyebrow="No single point of failure" title="Making the load balancer highly available" lead="If every request goes through one balancer process, you've just moved the single point of failure. The balancing tier must be redundant too.">
        <Flow steps={[
          { t: "Stable front end", s: "DNS name, anycast IP or virtual IP", i: Globe },
          { row: [{ t: "Load balancer A", s: "Zone A", i: ArrowsSplit, tone: "hot" }, { t: "Load balancer B", s: "Zone B", i: ArrowsSplit, tone: "hot" }] },
          { row: [{ t: "App 1", i: Desktop }, { t: "App 2", i: Desktop }, { t: "App N", i: Desktop }] },
        ]} />
        <Compare
          left={{ tone: "plain", title: "Active-passive", text: "One serves; a standby waits.", items: ["Simple to reason about", "Standby capacity sits idle", "Failover time matters (heartbeats, VIP move)"] }}
          right={{ tone: "plain", title: "Active-active", text: "All instances serve at once.", items: ["Uses all capacity", "Losing one costs only its share", "Config and any shared state must stay in sync"] }}
        />
        <Call tone="info" title="Managed balancers still need design">Cloud load balancers hide this machinery, but you still choose zones, size backends, watch quotas and decide what happens when a whole region fails.</Call>
      </Sec>

      {/* 10 */}
      <Sec id="millions" n={10} eyebrow="Scale" title="Handling millions of requests" lead="At high scale, load balancing is one layer of several. You remove unnecessary traffic first, then spread what's left across regions, services and servers.">
        <Flow caption="Traffic, from the edge inwards" steps={[
          { t: "Millions of users", s: "Web, mobile, API", i: Users },
          { t: "CDN / edge cache", s: "Static and cacheable content near users", i: Cloud, tone: "hot" },
          { t: "WAF + rate limiting", s: "Block abuse, protect the origin", i: ShieldCheck },
          { t: "Global traffic manager", s: "Pick a healthy region", i: Globe },
          { row: [{ t: "Regional LB A", s: "Zone-aware pool", i: ArrowsSplit, tone: "hot" }, { t: "Regional LB B", s: "Zone-aware pool", i: ArrowsSplit, tone: "hot" }] },
          { row: [{ t: "App 1", i: Desktop }, { t: "App 2", i: Desktop }, { t: "App N", i: Desktop }] },
        ]} />
        <Cards cols={3} items={[
          ["CDN", "Serve static and cacheable responses before they reach your servers.", Cloud],
          ["Autoscaling", "Add stateless servers when sustained demand rises.", Stack],
          ["Caching", "Skip repeated database and service work for popular reads.", Lightning],
          ["Rate limiting", "Stop abusive or accidental overload.", ShieldCheck],
          ["Queueing", "Move non-urgent work off the request path.", Queue],
          ["Database scaling", "Scale reads, partition data, protect the write path.", Database],
        ]} />
        <Call tone="warn" title="Don't say “add a load balancer” and stop">In an interview, explain where traffic is <strong>reduced</strong>, where it is <strong>distributed</strong>, how backend capacity <strong>scales</strong>, how the database is <strong>protected</strong>, and what happens when any one layer is unhealthy.</Call>
      </Sec>

      {/* 11 */}
      <Sec id="global" n={11} eyebrow="Multi-region" title="Global load balancing" lead="First a global layer picks a region, then that region's balancer picks a server.">
        <Flow steps={[
          { t: "Users worldwide", s: "India, Europe, US…", i: Users },
          { t: "Global traffic manager", s: "Latency + geography + health + policy", i: Globe, tone: "hot" },
          { row: [{ t: "India region", s: "Regional LB + servers", i: ArrowsSplit }, { t: "Europe region", s: "Regional LB + servers", i: ArrowsSplit }, { t: "US region", s: "Regional LB + servers", i: ArrowsSplit }] },
        ]} />
        <Cards items={[
          ["Routing signals", "Proximity, measured latency, region health, data-residency rules, capacity, cost and business policy.", Path],
          ["The hard part is data", "Sending users to another region is easy. Keeping their data correct there is not: replication lag, write ownership and conflicts dominate multi-region design.", Database],
        ]} />
        <Call tone="warn" title="DNS failover is not instant">Resolvers and clients cache DNS answers until the TTL expires, and some cache longer. Plan for minutes, not seconds, or use anycast or a global proxy for faster failover.</Call>
      </Sec>

      {/* 12 */}
      <Sec id="websockets" n={12} eyebrow="Long-lived connections" title="Load balancing WebSockets" lead="A WebSocket stays open for minutes or hours, so balancing is about connections, not individual requests.">
        <Flow steps={[
          { t: "Client", s: "HTTP Upgrade: websocket", i: Users },
          { t: "WebSocket-aware balancer", s: "Picks a server when the connection opens", i: ArrowsSplit, tone: "hot" },
          { t: "Real-time server", s: "The connection stays attached here", i: WifiHigh, via: "long-lived connection" },
        ]} />
        <Cards items={[
          ["Count connections, not requests", "A server holding 50,000 sockets is busy even if it receives few new requests. Prefer least connections or capacity-aware routing over round robin.", Heartbeat],
          ["Messages across servers", "If User A is on server 1 and User B on server 4, server 1 needs a pub/sub layer (Redis, Kafka, NATS) to reach User B.", ArrowsSplit],
        ]} />
        <Call tone="info" title="Deploys need extra care">Draining can take hours for WebSockets. Set a maximum connection age, shut down gracefully, and make clients reconnect with backoff and jitter so they don't all reconnect at once.</Call>
      </Sec>

      {/* 13 */}
      <Sec id="case-study" n={13} eyebrow="Complete example" title="Ticket booking: where load balancing fits" lead="A BookMyShow-style platform has two very different traffic patterns: huge read spikes for browsing, and correctness-critical writes when people grab seats.">
        <Call tone="info" title="About this example">This is an interview design model for a BookMyShow-style system. It isn't a description of any company's private production architecture.</Call>
        <Prose><p>Tickets for a blockbuster open at 10:00 AM. Hundreds of thousands of people refresh the same movie and showtime pages within seconds. <Mark>Most of that traffic is reads</Mark>: posters, theatre lists, timings, seat maps. A small fraction reaches the booking path, where many people want the same seat in the same second.</p></Prose>
        <Cards cols={3} items={[
          ["Read spike", "Discovery pages get enormous fan-out. CDN, caching and read replicas protect the origin.", Users],
          ["Booking contention", "Many users select the same seat. Correctness needs an atomic, expiring lock.", Lock],
          ["Payment uncertainty", "Payment can succeed, fail, time out or arrive late, so booking must be idempotent and recoverable.", Timer],
        ]} />
        <H3>High-level traffic architecture</H3>
        <Flow steps={[
          { t: "Users", s: "Search, browse, seat map, booking", i: Users },
          { t: "CDN / edge", s: "Static assets, cacheable public pages", i: Cloud, tone: "hot" },
          { t: "WAF + rate limiter", s: "Protect high-demand endpoints", i: ShieldCheck },
          { t: "L7 load balancer", s: "Health-aware routing by path", i: ArrowsSplit, tone: "hot" },
          { row: [{ t: "Search", s: "Movies, theatres", i: Desktop }, { t: "Show", s: "Timings, seat map", i: Desktop }, { t: "Booking", s: "Locks, reservations", i: Lock }, { t: "Payment", s: "Orchestration", i: Desktop }] },
          { row: [{ t: "Redis", s: "Hot reads, short-lived locks", i: Lightning }, { t: "Booking DB", s: "Source of truth for seats", i: Database }, { t: "Queue", s: "Notifications, async work", i: Queue }] },
        ]} />
        <Call tone="tip" title="What the load balancer solves here">It spreads requests across healthy instances of every service so each one scales horizontally and survives server failures. <strong>It does not decide who owns a seat.</strong> That belongs to the booking service's consistency design.</Call>
        <H3>Seat booking, step by step</H3>
        <Steps items={[
          ["User opens a show", "The L7 balancer routes to any healthy Show service; show metadata comes from cache."],
          ["Seat map loads", "Seats are available, locked or sold, read from cache with the database behind it."],
          ["User picks seat A10", "The request can reach any Booking instance, so the lock can't live in one server's memory."],
          ["Acquire an atomic, expiring lock", "AVAILABLE → LOCKED for this booking, with a short TTL. Only one competing request wins."],
          ["Create a PENDING booking", "Persist the booking and the locked seats, with an idempotency key so retries don't duplicate it."],
          ["Start payment", "The seat stays locked for the booking window only, never forever."],
          ["Payment succeeds → confirm", "Seats become BOOKED and the booking CONFIRMED, guarded by a conditional update or unique constraint."],
          ["Failure or timeout → release", "The seat returns to AVAILABLE. Late callbacks are reconciled: confirm if still free, otherwise refund."],
          ["Publish events", "Emails, SMS, invoices and analytics run from a queue, off the booking path."],
        ]} />
        <H3>Two users, one seat</H3>
        <Flow steps={[
          { row: [{ t: "User A", s: "wants A10", i: Users }, { t: "User B", s: "wants A10 too", i: Users }] },
          { t: "Load balancer", s: "May send them to different booking servers", i: ArrowsSplit, tone: "hot" },
          { row: [{ t: "Booking 1", s: "handles A", i: Desktop }, { t: "Booking 2", s: "handles B", i: Desktop }] },
          { t: "Shared seat-lock store", s: "A10 can be locked by only one booking", i: Lock, tone: "hot", via: "shared atomic state" },
          { row: [{ t: "User A", s: "Lock acquired → payment", i: CheckCircle, tone: "good" }, { t: "User B", s: "Rejected → pick another seat", i: Warning, tone: "bad" }] },
        ]} />
        <Call tone="warn" title="Sticky sessions don't prevent double booking">Even if all of User A's requests hit one server, User B can be routed elsewhere and compete for the same seat. Correctness must live in shared, authoritative state with atomic operations or constraints, never in the load balancer.</Call>
        <H3>Surviving a huge ticket drop</H3>
        <Cards items={[
          ["Edge absorbs public content", "Posters, JS and CSS never touch booking capacity."],
          ["Reads scale independently", "Search and Show run many stateless replicas with caches and read replicas."],
          ["Admission control protects writes", "Above safe booking capacity, a waiting room or queue beats letting everyone hammer the database."],
          ["Booking stays correctness-first", "Locks, idempotency and database constraints stay authoritative at any scale."],
          ["Payment callbacks are idempotent", "Duplicate callbacks or retries never confirm twice or charge twice."],
          ["Async work is separate", "Email, SMS and analytics don't slow the seat confirmation."],
        ]} />
        <Flow caption="Seat states" across steps={[
          { t: "AVAILABLE", i: CheckCircle, tone: "good" },
          { t: "LOCKED", s: "userId, bookingId, expiresAt", i: Lock, tone: "hot", via: "atomic lock" },
          { t: "BOOKED", s: "after verified payment", i: ShieldCheck },
        ]} note={<>Lock expires or payment fails: <b>LOCKED → AVAILABLE</b>.</>} />
      </Sec>

      {/* 14 */}
      <Sec id="failures" n={14} eyebrow="Production reliability" title="Failure handling" lead="A load-balancing design isn't complete until you explain what happens when things go wrong.">
        <Table head={["Failure", "What should happen"]} rows={[
          ["A backend crashes", "Health checks remove it from rotation. Requests that were in flight may fail and need safe retries at the right layer."],
          ["A backend is slow but alive", "A shallow /health still returns 200. Use passive signals (latency, timeouts, queue depth) to drain it or send it less traffic."],
          ["A load balancer instance fails", "Others across zones keep serving, behind a stable VIP, anycast or DNS entry point."],
          ["A sudden traffic spike", "CDN and caches absorb reads; autoscale stateless services; rate-limit and queue the rest."],
          ["A retry storm", "Bounded retries, exponential backoff with jitter, deadlines and retry budgets. Never blindly retry non-idempotent writes."],
          ["A deploy drops connections", "Drain first: no new requests, let in-flight work finish, terminate after a deadline."],
        ]} />
        <H3>Timeouts and safe retries</H3>
        <Flow steps={[
          { t: "Client", s: "Request with a deadline", i: Users },
          { t: "Load balancer", s: "Connect and request timeouts", i: ArrowsSplit, tone: "hot" },
          { t: "Slow backend", s: "Times out without crashing", i: Desktop, tone: "bad" },
          { t: "Bounded retry", s: "Backoff + jitter, idempotent requests only", i: ArrowsClockwise, via: "retry only when safe" },
        ]} />
        <Code title="Exponential backoff with full jitter" lang="js">{`
async function withRetry(fn, { tries = 3, base = 100, cap = 2000 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt + 1 >= tries || !err.retryable) throw err;
      const max = Math.min(cap, base * 2 ** attempt);   // 100, 200, 400 … ms
      const wait = Math.random() * max;                 // full jitter spreads clients out
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}`}</Code>
        <Call tone="warn" title="Be careful retrying writes">Retrying an idempotent GET is easy. Retrying a booking, payment or order creation needs an idempotency key, and a clear definition of whether a timeout means “failed” or only “result unknown”.</Call>
        <H3>Metrics to watch</H3>
        <Chips label="Load balancer metrics" items={["Requests / sec", "p50 / p95 / p99 latency", "5xx rate", "4xx rate", "Active connections", "New connections / sec", "Healthy hosts", "Unhealthy hosts", "Backend queue depth", "Connection errors", "Timeout rate", "TLS errors"]} />
      </Sec>
    </ReaderPage>
  );
}
