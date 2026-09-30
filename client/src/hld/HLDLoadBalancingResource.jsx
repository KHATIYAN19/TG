import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Cloud,
  Code2,
  Database,
  Globe2,
  HeartPulse,
  Layers3,
  Lightbulb,
  LockKeyhole,
  Network,
  RefreshCcw,
  Route,
  Server,
  ShieldCheck,
  Sparkles,
  Timer,
  TriangleAlert,
  Users,
  Wifi,
  Zap,
} from "lucide-react";

const SITE_URL = "https://www.targettrek.in";
const PAGE_URL = `${SITE_URL}/resources/hld/load-balancing`;
const BOOK_URL = "/book/system-design/hld";

const PREVIOUS_TOPIC = {
  title: "Caching",
  description:
    "Learn cache-aside, Redis, cache stampede, hot keys, eviction and distributed locking.",
  path: "/resources/hld/cache",
};

const NEXT_TOPIC = {
  title: "Database Scaling",
  description:
    "Learn replication, partitioning, sharding, indexes, read replicas, consistency and database bottlenecks.",
  path: "/resources/hld/database",
};

const CONTENT_SECTIONS = [
  { id: "what-is-load-balancer", label: "Basics" },
  { id: "types", label: "Types" },
  { id: "l4-vs-l7", label: "L4 vs L7" },
  { id: "algorithms", label: "Algorithms" },
  { id: "health-checks", label: "Health Checks" },
  { id: "sticky-sessions", label: "Sticky Sessions" },
  { id: "reverse-proxy", label: "Reverse Proxy" },
  { id: "tls", label: "TLS" },
  { id: "high-availability", label: "High Availability" },
  { id: "millions", label: "Millions of Requests" },
  { id: "global", label: "Global Load Balancing" },
  { id: "websockets", label: "WebSockets" },
  { id: "case-study", label: "BookMyShow Case Study" },
  { id: "failures", label: "Failure Handling" },
  { id: "interview", label: "Interview Questions" },
];

const LOAD_BALANCER_TYPES = [
  {
    name: "Layer 4 Load Balancer",
    category: "Network / Transport",
    summary:
      "Routes traffic mainly using IP addresses, TCP/UDP ports and connection information without needing to understand HTTP business semantics.",
    howItWorks:
      "The balancer accepts a network connection and forwards packets or connections to one of the healthy backends. Because it does not need to inspect application-level fields such as URL paths, routing can be fast and protocol-agnostic.",
    useCases:
      "TCP services, UDP services, databases, game servers, high-throughput network traffic and situations where application-aware routing is unnecessary.",
    tradeOff:
      "It cannot normally make rich decisions such as /payments → payment-service or route by HTTP header, cookie or user plan.",
  },
  {
    name: "Layer 7 Load Balancer",
    category: "Application",
    summary:
      "Understands application protocols such as HTTP/HTTPS and can route using host, URL path, headers, cookies, methods or other request attributes.",
    howItWorks:
      "The balancer typically terminates the client HTTP/TLS connection, reads the request and applies application-aware routing rules before opening or reusing a connection to the selected backend.",
    useCases:
      "Microservices, REST APIs, web applications, path-based routing, canary releases, authentication-aware gateways and TLS termination.",
    tradeOff:
      "More processing and more configuration than simple transport-level routing. It also becomes part of the application request path, so capacity and failure handling matter.",
  },
  {
    name: "Hardware Load Balancer",
    category: "Deployment",
    summary:
      "A dedicated physical appliance designed to distribute traffic using specialized hardware and vendor software.",
    howItWorks:
      "Traffic is sent through a dedicated appliance installed in a data center. The device may provide L4/L7 balancing, TLS offload, health checks, security controls and advanced traffic policies.",
    useCases:
      "Traditional enterprise data centers, regulated environments and organizations already invested in dedicated networking appliances.",
    tradeOff:
      "Higher cost, procurement time, hardware capacity limits and operational overhead compared with software or managed cloud solutions.",
  },
  {
    name: "Software Load Balancer",
    category: "Deployment",
    summary:
      "Load-balancing software runs on normal virtual machines, containers or bare-metal servers.",
    howItWorks:
      "Software such as NGINX, HAProxy or Envoy receives traffic and forwards it to configured or dynamically discovered upstream services.",
    useCases:
      "Self-managed infrastructure, Kubernetes ingress, service proxies, private clouds and environments requiring fine-grained control.",
    tradeOff:
      "Your team owns deployment, upgrades, scaling, security, observability and high availability unless another platform manages these concerns.",
  },
  {
    name: "Managed Cloud Load Balancer",
    category: "Deployment",
    summary:
      "A cloud provider operates the load-balancing control plane and much of the data-plane lifecycle for you.",
    howItWorks:
      "You configure listeners, target pools, routing rules, certificates and health checks while the provider handles infrastructure provisioning and scaling within product limits.",
    useCases:
      "Cloud-native applications that need simpler operations, integrated autoscaling, TLS certificates, logging and regional or global routing.",
    tradeOff:
      "Provider-specific behavior, quotas, pricing and reduced low-level control. Architecture still needs multi-zone design and healthy backends.",
  },
  {
    name: "External / Public Load Balancer",
    category: "Traffic Scope",
    summary:
      "Receives traffic from the public internet and routes it to application entry points.",
    howItWorks:
      "A public IP or globally advertised endpoint accepts requests, applies security and routing policies, then forwards traffic to private application instances.",
    useCases:
      "Public websites, mobile APIs, SaaS applications and public REST/GraphQL APIs.",
    tradeOff:
      "Must be protected with TLS, DDoS controls, WAF/rate limiting where appropriate and strict backend network rules.",
  },
  {
    name: "Internal / Private Load Balancer",
    category: "Traffic Scope",
    summary:
      "Balances traffic only inside a private network, VPC or internal service environment.",
    howItWorks:
      "Internal clients resolve or connect to a private endpoint that distributes requests across private backend instances.",
    useCases:
      "Service-to-service traffic, internal admin systems, private APIs, database proxies and multi-tier architectures.",
    tradeOff:
      "It is not directly reachable from the public internet, but internal authentication, authorization and network segmentation are still required.",
  },
  {
    name: "Client-Side Load Balancing",
    category: "Routing Ownership",
    summary:
      "The client or client library chooses a backend instance instead of sending every request through a central proxy.",
    howItWorks:
      "The client receives a list of healthy service instances from service discovery and selects one using an algorithm such as round robin or random.",
    useCases:
      "Some service-mesh and RPC architectures where clients can safely perform service discovery and routing.",
    tradeOff:
      "Every client needs routing logic, discovery integration, retries and health awareness. Versioning that logic across many clients can be difficult.",
  },
  {
    name: "Server-Side / Proxy Load Balancing",
    category: "Routing Ownership",
    summary:
      "Clients send requests to a load-balancing proxy, and the proxy selects the backend.",
    howItWorks:
      "The client knows only the stable load-balancer endpoint. The balancer maintains or discovers the backend pool and performs routing centrally.",
    useCases:
      "Most public web applications, APIs, ingress layers and architectures where clients should not know backend topology.",
    tradeOff:
      "The proxy layer must be highly available and sufficiently provisioned because it sits directly in the request path.",
  },
  {
    name: "DNS / Global Load Balancing",
    category: "Global Routing",
    summary:
      "Distributes users across regions or endpoints using DNS responses, Anycast, global proxies or traffic-management policies.",
    howItWorks:
      "A global routing layer considers region health, geography, latency, policy or capacity and directs the user toward an appropriate regional entry point.",
    useCases:
      "Multi-region applications, disaster recovery, latency reduction and global active-active deployments.",
    tradeOff:
      "DNS caching and TTL can delay failover. Global traffic policy must also consider data locality, session state and database consistency.",
  },
];

const ALGORITHMS = [
  {
    name: "Round Robin",
    family: "Static",
    formula: "S1 → S2 → S3 → S1 → ...",
    theory:
      "Requests are assigned to healthy servers sequentially. Each server gets a turn, making the algorithm simple and predictable.",
    bestFor:
      "Backends with roughly equal capacity and requests with similar processing cost.",
    tradeOff:
      "It does not know whether one server is already busy, slow or handling expensive requests.",
  },
  {
    name: "Weighted Round Robin",
    family: "Static / Weighted",
    formula: "S1 weight 5, S2 weight 3, S3 weight 2",
    theory:
      "Each backend receives traffic in proportion to a configured weight. A stronger machine can receive more requests than a smaller machine.",
    bestFor:
      "Mixed-capacity servers or gradual traffic shifting between old and new deployments.",
    tradeOff:
      "Static weights may not reflect real-time CPU, memory, latency or queue depth.",
  },
  {
    name: "Least Connections",
    family: "Dynamic",
    formula: "Choose backend with minimum active connections",
    theory:
      "The next request goes to the healthy server currently handling the fewest active connections.",
    bestFor:
      "Long-lived or uneven requests where active connection count is a useful approximation of load.",
    tradeOff:
      "One connection can be much more expensive than another, so connection count is not a perfect measure of actual resource usage.",
  },
  {
    name: "Weighted Least Connections",
    family: "Dynamic / Weighted",
    formula: "Connections are normalized by server capacity",
    theory:
      "Combines live connection counts with backend capacity. A powerful server is allowed to hold more concurrent connections.",
    bestFor:
      "Heterogeneous fleets where request duration varies and server capacity is not equal.",
    tradeOff:
      "Requires reasonable capacity weights and accurate connection accounting.",
  },
  {
    name: "Least Response Time",
    family: "Dynamic",
    formula: "Prefer low latency + low active load",
    theory:
      "The balancer uses observed response time, often together with connection count, to prefer backends that are responding quickly.",
    bestFor:
      "Systems where backend latency varies meaningfully during runtime.",
    tradeOff:
      "Needs continuous measurements. Poor sampling or temporary latency spikes can cause traffic oscillation.",
  },
  {
    name: "Random",
    family: "Static / Probabilistic",
    formula: "Pick one random healthy backend",
    theory:
      "A healthy backend is selected randomly. Across a large number of requests and sufficiently uniform servers, traffic tends to spread out.",
    bestFor:
      "Simple large pools where a small amount of short-term imbalance is acceptable.",
    tradeOff:
      "Individual decisions do not consider live server load.",
  },
  {
    name: "Power of Two Choices",
    family: "Dynamic / Probabilistic",
    formula: "Pick 2 random servers → choose the less loaded",
    theory:
      "The balancer samples two healthy backends and selects the less loaded one. This offers much better balance than pure random while avoiding a full scan of every backend.",
    bestFor:
      "Large backend pools where checking every server on every request would be expensive.",
    tradeOff:
      "Needs a meaningful load metric and is more complex than basic random routing.",
  },
  {
    name: "IP Hash",
    family: "Hash Based",
    formula: "hash(clientIP) % N",
    theory:
      "A hash of the client IP determines the backend. The same IP tends to map to the same server while the backend set remains stable.",
    bestFor:
      "Simple client affinity where approximate stickiness is enough.",
    tradeOff:
      "Many users can share one NAT IP, client IPs can change, and adding/removing servers can remap many clients.",
  },
  {
    name: "URL / Key Hash",
    family: "Hash Based",
    formula: "hash(path or resourceKey) → backend",
    theory:
      "Routing uses a stable request attribute such as URL, tenant ID, user ID or resource key rather than only the client address.",
    bestFor:
      "Cache locality, tenant affinity or workloads where related requests should reach the same shard or worker.",
    tradeOff:
      "Bad key distribution can create hot spots and the routing key must be available before backend selection.",
  },
  {
    name: "Consistent Hashing",
    family: "Hash Based",
    formula: "hash(key) → position on hash ring",
    theory:
      "Both servers and routing keys are mapped to a logical hash ring. When a server is added or removed, only a portion of keys are remapped instead of nearly every key.",
    bestFor:
      "Distributed caches, partition-aware routing and systems where routing stability matters as the backend pool changes.",
    tradeOff:
      "More complex than modulo hashing and usually needs virtual nodes or good weighting for balanced distribution.",
  },
  {
    name: "Resource / Adaptive Routing",
    family: "Dynamic",
    formula: "CPU + memory + queue + latency + errors",
    theory:
      "Routing decisions use one or more runtime signals such as CPU, memory, queue depth, outstanding requests, error rate or custom load scores.",
    bestFor:
      "Specialized workloads where simple connection count is a poor proxy for backend capacity.",
    tradeOff:
      "Telemetry is delayed and noisy. A badly designed feedback loop can cause traffic to bounce between servers.",
  },
];

const FAILURE_SCENARIOS = [
  {
    title: "Backend crashes",
    text:
      "Health checks should mark the instance unhealthy and remove it from new routing. Existing connections may fail and need safe retry behavior at the appropriate layer.",
  },
  {
    title: "Backend becomes slow but stays alive",
    text:
      "A shallow /health endpoint may still return 200. Track latency, timeouts, queue depth and passive error signals so a slow instance can be drained or receive less traffic.",
  },
  {
    title: "Load balancer instance fails",
    text:
      "Run multiple balancer instances across failure domains. Use active-active or active-passive failover and a stable frontend such as managed anycast, VIP or DNS/global routing.",
  },
  {
    title: "Sudden traffic spike",
    text:
      "Use CDN and caching to absorb read traffic, autoscale stateless services, enforce admission control/rate limits and queue work that does not need synchronous execution.",
  },
  {
    title: "Retry storm",
    text:
      "Retries multiply traffic during an outage. Use bounded retries, exponential backoff, jitter, deadlines and retry budgets; do not blindly retry non-idempotent operations.",
  },
  {
    title: "Deployment causes connection loss",
    text:
      "Mark an instance as draining, stop sending new requests, allow in-flight requests or long-lived connections to finish, then terminate the instance after a safe deadline.",
  },
];

const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.localStorage.getItem("theme") === "dark" ? "dark" : "light";
};

const SectionHeading = ({
  id,
  eyebrow,
  title,
  description,
  icon: Icon,
  isDark,
}) => (
  <div id={id} className="scroll-mt-40 sm:scroll-mt-44">
    {eyebrow && (
      <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-500">
        {eyebrow}
      </p>
    )}

    <div className="mt-2 flex items-start gap-3">
      {Icon && (
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isDark
              ? "bg-blue-950/50 text-blue-300"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      )}

      <div className="min-w-0">
        <h2
          className={`text-2xl font-black tracking-tight sm:text-3xl ${
            isDark ? "text-white" : "text-slate-950"
          }`}
        >
          {title}
        </h2>

        {description && (
          <p
            className={`mt-2 max-w-4xl text-sm leading-7 sm:text-base ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  </div>
);

const DiagramNode = ({
  icon: Icon,
  title,
  subtitle,
  isDark,
  highlight = false,
  danger = false,
}) => (
  <div
    className={`min-w-0 rounded-xl border p-3 text-center sm:p-4 ${
      danger
        ? isDark
          ? "border-red-900 bg-red-950/20"
          : "border-red-200 bg-red-50"
        : highlight
          ? isDark
            ? "border-blue-700 bg-blue-950/40"
            : "border-blue-200 bg-blue-50"
          : isDark
            ? "border-slate-700 bg-slate-900"
            : "border-slate-200 bg-white"
    }`}
  >
    {Icon && (
      <Icon
        className={`mx-auto h-5 w-5 ${
          danger
            ? "text-red-500"
            : highlight
              ? "text-blue-500"
              : isDark
                ? "text-slate-400"
                : "text-slate-500"
        }`}
      />
    )}

    <p className={`mt-2 text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>
      {title}
    </p>

    {subtitle && (
      <p className={`mt-1 text-[11px] leading-5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        {subtitle}
      </p>
    )}
  </div>
);

const DownArrow = ({ label, isDark }) => (
  <div className="flex flex-col items-center py-2">
    {label && (
      <span
        className={`mb-1 text-center text-[10px] font-black uppercase tracking-wide ${
          isDark ? "text-slate-500" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    )}

    <ArrowRight
      className={`h-5 w-5 rotate-90 ${
        isDark ? "text-slate-600" : "text-slate-300"
      }`}
    />
  </div>
);

const HorizontalArrow = ({ label, isDark }) => (
  <div className="hidden min-w-[72px] shrink-0 flex-col items-center justify-center md:flex">
    {label && (
      <span
        className={`mb-1 text-center text-[9px] font-black uppercase tracking-wide ${
          isDark ? "text-slate-500" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    )}
    <ArrowRight className={`h-5 w-5 ${isDark ? "text-slate-600" : "text-slate-300"}`} />
  </div>
);

const Callout = ({ type = "info", title, children, isDark }) => {
  const values = {
    info: {
      icon: Lightbulb,
      light: "border-blue-100 bg-blue-50 text-blue-950",
      dark: "border-blue-900/50 bg-blue-950/20 text-blue-100",
      iconColor: "text-blue-500",
    },
    warning: {
      icon: TriangleAlert,
      light: "border-amber-200 bg-amber-50 text-amber-950",
      dark: "border-amber-900/50 bg-amber-950/20 text-amber-100",
      iconColor: "text-amber-500",
    },
    success: {
      icon: CheckCircle2,
      light: "border-emerald-200 bg-emerald-50 text-emerald-950",
      dark: "border-emerald-900/50 bg-emerald-950/20 text-emerald-100",
      iconColor: "text-emerald-500",
    },
  };

  const selected = values[type] || values.info;
  const Icon = selected.icon;

  return (
    <div
      className={`my-5 rounded-2xl border p-4 sm:p-5 ${
        isDark ? selected.dark : selected.light
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected.iconColor}`} />

        <div className="min-w-0">
          {title && <p className="font-black">{title}</p>}
          <div className="mt-1 text-sm leading-7">{children}</div>
        </div>
      </div>
    </div>
  );
};

const CodeBlock = ({ title, children }) => (
  <div className="my-5 min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#07101f]">
    {title && (
      <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-400">
        <Code2 className="h-3.5 w-3.5" />
        {title}
      </div>
    )}

    <pre className="block w-full max-w-full overflow-x-hidden whitespace-pre-wrap break-words p-4 font-mono text-[11px] leading-5 text-slate-100 sm:overflow-x-auto sm:whitespace-pre sm:text-sm sm:leading-6">
      <code>{children}</code>
    </pre>
  </div>
);

const TheoryCard = ({
  title,
  children,
  isDark,
  icon: Icon = Layers3,
  badge,
}) => (
  <article
    className={`rounded-2xl border p-5 sm:p-6 ${
      isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
    }`}
  >
    <div className="flex items-start gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          isDark ? "bg-slate-800 text-blue-300" : "bg-blue-50 text-blue-600"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        {badge && (
          <span className="inline-flex rounded-full bg-blue-600/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-blue-500">
            {badge}
          </span>
        )}
        <h3
          className={`mt-1 text-lg font-black ${
            isDark ? "text-white" : "text-slate-950"
          }`}
        >
          {title}
        </h3>
        <div
          className={`mt-3 space-y-3 text-sm leading-7 ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  </article>
);

const Step = ({ number, title, text, isDark }) => (
  <div
    className={`flex gap-3 rounded-2xl border p-4 sm:p-5 ${
      isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
    }`}
  >
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
      {number}
    </span>
    <div>
      <h3 className={`font-black ${isDark ? "text-white" : "text-slate-950"}`}>
        {title}
      </h3>
      <p className={`mt-1 text-sm leading-7 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
        {text}
      </p>
    </div>
  </div>
);

const HLDLoadBalancingResource = () => {
  const [theme, setTheme] = useState(getStoredTheme);
  const isDark = theme === "dark";

  useEffect(() => {
    const syncTheme = () => {
      const nextTheme = getStoredTheme();
      setTheme((currentTheme) =>
        currentTheme === nextTheme ? currentTheme : nextTheme
      );
    };

    const handleStorage = (event) => {
      if (!event.key || event.key === "theme") {
        syncTheme();
      }
    };

    const handleThemeInteraction = () => {
      window.requestAnimationFrame(syncTheme);
    };

    const observer = new MutationObserver(syncTheme);

    window.addEventListener("storage", handleStorage);
    window.addEventListener("themechange", syncTheme);
    window.addEventListener("focus", syncTheme);
    document.addEventListener("click", handleThemeInteraction, true);
    document.addEventListener("keydown", handleThemeInteraction, true);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    syncTheme();

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("themechange", syncTheme);
      window.removeEventListener("focus", syncTheme);
      document.removeEventListener("click", handleThemeInteraction, true);
      document.removeEventListener("keydown", handleThemeInteraction, true);
      observer.disconnect();
    };
  }, []);

  const surface = isDark
    ? "border-slate-800 bg-slate-900"
    : "border-slate-200 bg-white";

  const textPrimary = isDark ? "text-white" : "text-slate-950";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-600";

  const seoTitle =
    "Load Balancing in System Design: Types, Algorithms, L4 vs L7 & BookMyShow | TargetTrek";

  const seoDescription =
    "Complete load balancing HLD guide covering L4 vs L7, hardware/software/cloud load balancers, algorithms, health checks, sticky sessions, high availability, WebSockets, global routing and a BookMyShow system design case study.";

  const faqData = useMemo(
    () => [
      {
        question: "What is a load balancer in system design?",
        answer:
          "A load balancer is an entry layer that distributes incoming traffic across multiple healthy backend instances. It improves scalability, availability and failure isolation by preventing every request from depending on one server.",
      },
      {
        question: "What are the main types of load balancers?",
        answer:
          "Common classifications include Layer 4 and Layer 7, hardware and software, managed cloud, external and internal, client-side and server-side, plus DNS or global traffic load balancing.",
      },
      {
        question: "What is the difference between L4 and L7 load balancing?",
        answer:
          "L4 makes routing decisions mainly from transport-level information such as IP addresses and TCP or UDP ports. L7 understands application protocols such as HTTP and can route by host, path, header, cookie or method.",
      },
      {
        question: "Which load balancing algorithm is best?",
        answer:
          "There is no universal best algorithm. Round Robin is simple for uniform backends, Least Connections helps with uneven request duration, weighted algorithms handle different capacities, and hashing is useful when routing affinity or cache locality matters.",
      },
      {
        question: "How does load balancing help a BookMyShow-style booking system?",
        answer:
          "Load balancing distributes browsing, show search, seat-map and booking requests across healthy service instances. It does not itself prevent double booking; seat locking, idempotency, database constraints and transactional booking logic are needed for concurrency correctness.",
      },
      {
        question: "Can a load balancer become a single point of failure?",
        answer:
          "Yes. Production systems use multiple load-balancer instances or managed highly available load-balancing services, often across zones and sometimes across regions.",
      },
    ],
    []
  );

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline:
      "Load Balancing in System Design: Types, Algorithms, L4 vs L7 and BookMyShow Case Study",
    description: seoDescription,
    url: PAGE_URL,
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    articleSection: "System Design",
    educationalLevel: "Intermediate",
    learningResourceType: "System Design Tutorial",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": PAGE_URL,
    },
    author: {
      "@type": "Organization",
      name: "TargetTrek",
    },
    publisher: {
      "@type": "Organization",
      name: "TargetTrek",
      url: SITE_URL,
    },
    isPartOf: {
      "@type": "WebSite",
      name: "TargetTrek",
      url: SITE_URL,
    },
    about: [
      "Load Balancing",
      "Layer 4 Load Balancer",
      "Layer 7 Load Balancer",
      "Load Balancing Algorithms",
      "Health Checks",
      "Reverse Proxy",
      "Consistent Hashing",
      "BookMyShow System Design",
      "Distributed Systems",
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "TargetTrek",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "HLD Resources",
        item: `${SITE_URL}/resources/hld`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Load Balancing",
        item: PAGE_URL,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <Helmet htmlAttributes={{ lang: "en" }}>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="author" content="TargetTrek" />
        <meta
          name="keywords"
          content="load balancer system design, load balancing types, L4 vs L7 load balancer, hardware load balancer, software load balancer, cloud load balancer, round robin, weighted round robin, least connections, consistent hashing, reverse proxy, sticky sessions, health checks, BookMyShow system design, HLD interview"
        />
        <meta
          name="robots"
          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        />
        <meta name="theme-color" content={isDark ? "#090d14" : "#f8fafc"} />

        <link rel="canonical" href={PAGE_URL} />
        <link rel="prev" href={`${SITE_URL}${PREVIOUS_TOPIC.path}`} />
        <link rel="next" href={`${SITE_URL}${NEXT_TOPIC.path}`} />

        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="TargetTrek" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={PAGE_URL} />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />

        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div
        className={`min-h-screen overflow-x-hidden pt-20 transition-colors duration-300 sm:pt-24 ${
          isDark ? "bg-[#090d14] text-slate-100" : "bg-slate-50 text-slate-900"
        }`}
      >
        <div
          className={`border-b ${
            isDark ? "border-slate-800 bg-[#090d14]" : "border-slate-200 bg-white"
          }`}
        >
          <div className="mx-auto flex max-w-7xl items-center px-3 py-3 sm:px-6 lg:px-8">
            <Link
              to="/resources/hld"
              aria-label="Back to HLD resources"
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-700 hover:text-blue-400"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">HLD Resources</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>

        <header
          className={`border-b ${
            isDark
              ? "border-slate-800 bg-gradient-to-b from-indigo-950/25 to-[#090d14]"
              : "border-slate-200 bg-gradient-to-b from-indigo-50 to-white"
          }`}
        >
          <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-14 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-black ${
                    isDark
                      ? "border-blue-800 bg-blue-950/50 text-blue-300"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                  }`}
                >
                  HLD
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    isDark
                      ? "bg-slate-800 text-slate-300"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  System Design
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                    isDark
                      ? "bg-slate-800 text-slate-300"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Clock3 className="h-3 w-3" />
                  Detailed Guide
                </span>
              </div>

              <h1
                className={`mt-5 text-[2rem] font-black leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl ${
                  isDark ? "text-white" : "text-slate-950"
                }`}
              >
                Load Balancing in System Design
              </h1>

              <p
                className={`mt-5 max-w-4xl text-base leading-8 sm:text-lg ${textSecondary}`}
              >
                Learn load balancing from first principles: why it is needed,
                every major type of load balancer, L4 vs L7, routing algorithms,
                health checks, sticky sessions, reverse proxies, TLS,
                high availability, multi-region traffic, WebSockets, failure
                handling and a complete BookMyShow-style booking case study.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="#what-is-load-balancer"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                >
                  Start Learning
                </a>

                <Link
                  to={BOOK_URL}
                  className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-black ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  Master HLD Book
                </Link>
              </div>
            </div>
          </div>
        </header>

        <nav
          aria-label="Load balancing topic navigation"
          className={`sticky top-0 z-30 border-b backdrop-blur ${
            isDark
              ? "border-slate-800 bg-[#090d14]/95"
              : "border-slate-200 bg-white/95"
          }`}
        >
          <div className="mx-auto max-w-7xl overflow-x-auto px-3 sm:px-6 lg:px-8">
            <div className="flex min-w-max gap-1.5 py-3">
              {CONTENT_SECTIONS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                    isDark
                      ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-6xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
          <section>
            <SectionHeading
              id="what-is-load-balancer"
              eyebrow="Fundamentals"
              title="What Is a Load Balancer?"
              description="A load balancer is a traffic-distribution layer placed between clients and a pool of backend servers. Its job is to decide which healthy backend should receive each new request or connection."
              icon={Network}
              isDark={isDark}
            />

            <div className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}>
              <div className="mx-auto max-w-3xl">
                <DiagramNode
                  icon={Users}
                  title="Clients"
                  subtitle="Web, mobile, API consumers"
                  isDark={isDark}
                />
                <DownArrow label="Incoming traffic" isDark={isDark} />
                <DiagramNode
                  icon={Network}
                  title="Load Balancer"
                  subtitle="Health check + routing decision"
                  isDark={isDark}
                  highlight
                />
                <DownArrow label="Select healthy backend" isDark={isDark} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <DiagramNode
                    icon={Server}
                    title="App Server A"
                    subtitle="Healthy"
                    isDark={isDark}
                  />
                  <DiagramNode
                    icon={Server}
                    title="App Server B"
                    subtitle="Healthy"
                    isDark={isDark}
                  />
                  <DiagramNode
                    icon={Server}
                    title="App Server C"
                    subtitle="Healthy"
                    isDark={isDark}
                  />
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <TheoryCard title="Why one server is not enough" icon={Server} isDark={isDark}>
                <p>
                  A single application server has finite CPU, memory, network
                  bandwidth and connection capacity. Even if vertical scaling
                  gives it more resources, it still remains one failure domain.
                </p>
                <p>
                  Horizontal scaling solves this by running multiple application
                  instances. The load balancer makes horizontal scaling useful by
                  spreading traffic across those instances.
                </p>
              </TheoryCard>

              <TheoryCard title="What the load balancer actually knows" icon={Activity} isDark={isDark}>
                <p>
                  Depending on the type, it may know backend health, connection
                  count, response latency, request host/path, cookies, headers,
                  server weights and other routing signals.
                </p>
                <p>
                  It should not send new traffic to a server that has been marked
                  unhealthy, and it should support draining when a server is being
                  removed or deployed.
                </p>
              </TheoryCard>
            </div>

            <Callout
              type="info"
              title="Core interview idea"
              isDark={isDark}
            >
              <p>
                <strong>Load balancing is not only about performance.</strong> It
                also improves availability, enables horizontal scaling, supports
                rolling deployments, isolates failures and creates a stable
                frontend while backend instances are added or removed.
              </p>
            </Callout>

            <h3 className={`mt-8 text-xl font-black ${textPrimary}`}>
              Request Lifecycle
            </h3>

            <div className="mt-4 grid gap-3 md:grid-cols-5">
              {[
                ["1", "Client sends request", "The user calls a stable domain or IP."],
                ["2", "Frontend receives it", "DNS/CDN/WAF may sit before the load balancer."],
                ["3", "LB checks routing state", "Only eligible healthy targets are considered."],
                ["4", "Algorithm selects target", "For example Round Robin or Least Connections."],
                ["5", "Backend responds", "Response returns through the proxy or directly depending on architecture."],
              ].map(([number, title, text]) => (
                <div key={number} className={`rounded-xl border p-4 ${surface}`}>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                    {number}
                  </span>
                  <h4 className={`mt-3 text-sm font-black ${textPrimary}`}>{title}</h4>
                  <p className={`mt-2 text-xs leading-6 ${textSecondary}`}>{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <SectionHeading
              id="types"
              eyebrow="Classification"
              title="Types of Load Balancers"
              description="The phrase 'type of load balancer' can mean different things. In interviews, classify them by network layer, deployment model, traffic scope and who owns the routing decision."
              icon={Layers3}
              isDark={isDark}
            />

            <Callout type="success" title="How to answer this in an interview" isDark={isDark}>
              First say that <strong>L4 vs L7</strong> is a protocol-layer
              classification. Then mention deployment types such as hardware,
              software and managed cloud; traffic scope such as external and
              internal; and routing ownership such as client-side and
              server-side. This avoids mixing completely different categories.
            </Callout>

            <div className="mt-7 grid gap-5 lg:grid-cols-2">
              {LOAD_BALANCER_TYPES.map((item) => (
                <article
                  key={item.name}
                  className={`rounded-2xl border p-5 sm:p-6 ${surface}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                      {item.category}
                    </span>
                  </div>

                  <h3 className={`mt-3 text-xl font-black ${textPrimary}`}>
                    {item.name}
                  </h3>

                  <p className={`mt-3 text-sm leading-7 ${textSecondary}`}>
                    {item.summary}
                  </p>

                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-blue-500">
                        How it works
                      </p>
                      <p className={`mt-1 text-sm leading-7 ${textSecondary}`}>
                        {item.howItWorks}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-emerald-500">
                        Common use
                      </p>
                      <p className={`mt-1 text-sm leading-7 ${textSecondary}`}>
                        {item.useCases}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-amber-500">
                        Trade-off
                      </p>
                      <p className={`mt-1 text-sm leading-7 ${textSecondary}`}>
                        {item.tradeOff}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <h3 className={`mt-9 text-xl font-black ${textPrimary}`}>
              Type Classification Diagram
            </h3>

            <div className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}>
              <DiagramNode
                icon={Network}
                title="Load Balancer"
                subtitle="Classify it using multiple independent dimensions"
                isDark={isDark}
                highlight
              />
              <DownArrow isDark={isDark} />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <DiagramNode
                  icon={Layers3}
                  title="Protocol Layer"
                  subtitle="L4 / L7"
                  isDark={isDark}
                />
                <DiagramNode
                  icon={Server}
                  title="Deployment"
                  subtitle="Hardware / Software / Managed"
                  isDark={isDark}
                />
                <DiagramNode
                  icon={Globe2}
                  title="Traffic Scope"
                  subtitle="External / Internal / Global"
                  isDark={isDark}
                />
                <DiagramNode
                  icon={Route}
                  title="Routing Ownership"
                  subtitle="Client-side / Server-side"
                  isDark={isDark}
                />
              </div>
            </div>
          </section>

          <section className="mt-16">
            <SectionHeading
              id="l4-vs-l7"
              eyebrow="Core Interview Topic"
              title="Layer 4 vs Layer 7 Load Balancing"
              description="L4 and L7 solve the same high-level problem—selecting a backend—but they operate with different information and therefore support different routing capabilities."
              icon={Layers3}
              isDark={isDark}
            />

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <TheoryCard
                title="Layer 4 Load Balancer"
                badge="Transport Layer"
                icon={Network}
                isDark={isDark}
              >
                <p>
                  L4 routing works primarily with connection metadata such as
                  source/destination IP, TCP/UDP port and protocol. It does not
                  need to understand the meaning of an HTTP URL.
                </p>
                <p>
                  It is useful when the service is not HTTP, when very high
                  transport throughput is required, or when application-aware
                  routing is unnecessary.
                </p>
                <p>
                  Example: traffic arriving on TCP port 5432 can be distributed
                  to a pool of PostgreSQL proxies without parsing HTTP because
                  there is no HTTP request to parse.
                </p>
              </TheoryCard>

              <TheoryCard
                title="Layer 7 Load Balancer"
                badge="Application Layer"
                icon={Globe2}
                isDark={isDark}
              >
                <p>
                  L7 understands application protocols such as HTTP. It can read
                  hostnames, paths, methods, headers and cookies and then route
                  requests based on application meaning.
                </p>
                <p>
                  It is commonly used in microservice architectures because a
                  single domain can route /users, /orders and /payments to
                  different backend pools.
                </p>
                <p>
                  L7 can also perform TLS termination, redirects, header
                  manipulation, authentication integration, canary routing and
                  other application-layer features.
                </p>
              </TheoryCard>
            </div>

            <div className={`mt-7 overflow-hidden rounded-2xl border ${surface}`}>
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full text-left text-sm">
                  <thead className={isDark ? "bg-slate-800/70" : "bg-slate-50"}>
                    <tr>
                      {["Area", "Layer 4", "Layer 7"].map((heading) => (
                        <th
                          key={heading}
                          className={`px-5 py-4 font-black ${textPrimary}`}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={textSecondary}>
                    {[
                      ["Primary information", "IP, port, TCP/UDP connection", "Host, path, header, cookie, HTTP method"],
                      ["HTTP awareness", "No", "Yes"],
                      ["Path routing", "No", "Yes"],
                      ["TLS termination", "Not an application-level feature", "Commonly supported"],
                      ["Protocol flexibility", "Excellent for raw TCP/UDP", "Best when application protocol is understood"],
                      ["Processing", "Less application parsing", "More request inspection"],
                      ["Typical example", "TCP service or network load balancer", "Web/API ingress or application load balancer"],
                    ].map(([area, l4, l7]) => (
                      <tr
                        key={area}
                        className={`border-t ${
                          isDark ? "border-slate-800" : "border-slate-200"
                        }`}
                      >
                        <td className={`px-5 py-4 font-bold ${textPrimary}`}>{area}</td>
                        <td className="px-5 py-4 leading-6">{l4}</td>
                        <td className="px-5 py-4 leading-6">{l7}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <h3 className={`mt-9 text-xl font-black ${textPrimary}`}>
              L4 Routing Diagram
            </h3>

            <div className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}>
              <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
                <DiagramNode
                  icon={Users}
                  title="Client"
                  subtitle="TCP connection"
                  isDark={isDark}
                />
                <HorizontalArrow label="IP + Port" isDark={isDark} />
                <DiagramNode
                  icon={Network}
                  title="L4 Load Balancer"
                  subtitle="Connection-level decision"
                  isDark={isDark}
                  highlight
                />
                <HorizontalArrow label="Forward connection" isDark={isDark} />
                <DiagramNode
                  icon={Server}
                  title="Backend"
                  subtitle="Selected healthy target"
                  isDark={isDark}
                />
              </div>
            </div>

            <h3 className={`mt-8 text-xl font-black ${textPrimary}`}>
              L7 Path-Based Routing Diagram
            </h3>

            <div className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}>
              <DiagramNode
                icon={Globe2}
                title="api.example.com"
                subtitle="HTTPS requests"
                isDark={isDark}
              />
              <DownArrow label="Inspect HTTP request" isDark={isDark} />
              <DiagramNode
                icon={Route}
                title="L7 Load Balancer"
                subtitle="Host / path / header rules"
                isDark={isDark}
                highlight
              />
              <DownArrow isDark={isDark} />
              <div className="grid gap-3 sm:grid-cols-3">
                <DiagramNode
                  icon={Server}
                  title="/users"
                  subtitle="User Service"
                  isDark={isDark}
                />
                <DiagramNode
                  icon={Server}
                  title="/orders"
                  subtitle="Order Service"
                  isDark={isDark}
                />
                <DiagramNode
                  icon={Server}
                  title="/payments"
                  subtitle="Payment Service"
                  isDark={isDark}
                />
              </div>
            </div>
          </section>

          <section className="mt-16">
            <SectionHeading
              id="algorithms"
              eyebrow="Routing Strategy"
              title="Load Balancing Algorithms"
              description="After deciding which backends are healthy and eligible, the load balancer still needs an algorithm to choose the next target. Static algorithms use little live state; dynamic algorithms react to runtime load."
              icon={RefreshCcw}
              isDark={isDark}
            />

            <div className="mt-7 space-y-4">
              {ALGORITHMS.map((algorithm, index) => (
                <article
                  key={algorithm.name}
                  className={`rounded-2xl border p-5 sm:p-6 ${surface}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`text-lg font-black ${textPrimary}`}>
                          {algorithm.name}
                        </h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                            isDark
                              ? "bg-slate-800 text-slate-300"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {algorithm.family}
                        </span>
                      </div>

                      <p className={`mt-2 font-mono text-xs sm:text-sm ${textSecondary}`}>
                        {algorithm.formula}
                      </p>

                      <p className={`mt-4 text-sm leading-7 ${textSecondary}`}>
                        {algorithm.theory}
                      </p>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div
                          className={`rounded-xl border p-4 ${
                            isDark
                              ? "border-emerald-900/50 bg-emerald-950/10"
                              : "border-emerald-100 bg-emerald-50"
                          }`}
                        >
                          <p className="text-xs font-black uppercase text-emerald-500">
                            Best for
                          </p>
                          <p className={`mt-2 text-sm leading-6 ${textSecondary}`}>
                            {algorithm.bestFor}
                          </p>
                        </div>

                        <div
                          className={`rounded-xl border p-4 ${
                            isDark
                              ? "border-amber-900/50 bg-amber-950/10"
                              : "border-amber-100 bg-amber-50"
                          }`}
                        >
                          <p className="text-xs font-black uppercase text-amber-500">
                            Trade-off
                          </p>
                          <p className={`mt-2 text-sm leading-6 ${textSecondary}`}>
                            {algorithm.tradeOff}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <h3 className={`mt-9 text-xl font-black ${textPrimary}`}>
              Round Robin Example
            </h3>

            <div className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}>
              <div className="grid gap-3 sm:grid-cols-3">
                <DiagramNode icon={Users} title="Request 1" isDark={isDark} />
                <DiagramNode icon={Users} title="Request 2" isDark={isDark} />
                <DiagramNode icon={Users} title="Request 3" isDark={isDark} />
              </div>
              <DownArrow isDark={isDark} />
              <DiagramNode
                icon={Network}
                title="Round Robin"
                subtitle="Cycle through healthy servers"
                isDark={isDark}
                highlight
              />
              <DownArrow isDark={isDark} />
              <div className="grid gap-3 sm:grid-cols-3">
                <DiagramNode
                  icon={Server}
                  title="Server A"
                  subtitle="Request 1"
                  isDark={isDark}
                />
                <DiagramNode
                  icon={Server}
                  title="Server B"
                  subtitle="Request 2"
                  isDark={isDark}
                />
                <DiagramNode
                  icon={Server}
                  title="Server C"
                  subtitle="Request 3"
                  isDark={isDark}
                />
              </div>
            </div>

            <Callout type="warning" title="Algorithm choice does not replace capacity planning" isDark={isDark}>
              A perfect routing algorithm cannot save a system whose total
              backend capacity is smaller than incoming demand. Load balancing,
              autoscaling, caching, queueing, rate limiting and database scaling
              solve different parts of the overall capacity problem.
            </Callout>
          </section>

          <section className="mt-16">
            <SectionHeading
              id="health-checks"
              eyebrow="Reliability"
              title="Health Checks and Backend Eligibility"
              description="The balancer must know which targets can safely receive traffic. Health checking is therefore part of routing correctness, not only monitoring."
              icon={HeartPulse}
              isDark={isDark}
            />

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <TheoryCard title="Active Health Checks" icon={Activity} isDark={isDark}>
                <p>
                  The balancer periodically probes a backend endpoint or opens a
                  connection. After a configured number of failed checks, the
                  backend is removed from rotation.
                </p>
                <p>
                  A recovery threshold is normally used before returning the
                  instance to service so one intermittent success does not cause
                  flapping.
                </p>
                <CodeBlock title="Example health endpoint">
{`GET /health/ready

200 OK
{
  "status": "UP",
  "ready": true
}`}
                </CodeBlock>
              </TheoryCard>

              <TheoryCard title="Passive Health Signals" icon={TriangleAlert} isDark={isDark}>
                <p>
                  The balancer can observe real production traffic: timeouts,
                  connection resets, excessive 5xx responses or unusually high
                  latency.
                </p>
                <p>
                  Passive checks are valuable because a process can answer a
                  synthetic health endpoint while real user requests are failing.
                </p>
              </TheoryCard>
            </div>

            <h3 className={`mt-8 text-xl font-black ${textPrimary}`}>
              Health State Diagram
            </h3>

            <div className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}>
              <DiagramNode
                icon={Network}
                title="Load Balancer"
                subtitle="Maintains healthy target pool"
                isDark={isDark}
                highlight
              />
              <DownArrow label="Health probes" isDark={isDark} />
              <div className="grid gap-3 sm:grid-cols-3">
                <DiagramNode
                  icon={Server}
                  title="Server A"
                  subtitle="Healthy ✓ receives traffic"
                  isDark={isDark}
                />
                <DiagramNode
                  icon={Server}
                  title="Server B"
                  subtitle="Unhealthy ✕ removed"
                  isDark={isDark}
                  danger
                />
                <DiagramNode
                  icon={Server}
                  title="Server C"
                  subtitle="Healthy ✓ receives traffic"
                  isDark={isDark}
                />
              </div>
            </div>

            <Callout type="warning" title="Liveness is not the same as readiness" isDark={isDark}>
              A process may be alive but not ready to serve traffic. During
              startup it may still be loading configuration or warming caches.
              During failure it may be unable to reach critical dependencies.
              Use readiness semantics to decide whether new traffic should be
              routed to the instance.
            </Callout>

            <h3 className={`mt-8 text-xl font-black ${textPrimary}`}>
              Connection Draining
            </h3>

            <p className={`mt-3 text-sm leading-7 ${textSecondary}`}>
              During a deployment or scale-down, immediately killing an instance
              can terminate user requests. Instead, mark the target as draining:
              stop new routing, keep existing requests or connections for a
              configured grace period, then remove the server after in-flight
              work completes or a deadline is reached.
            </p>
          </section>

          <section className="mt-16">
            <SectionHeading
              id="sticky-sessions"
              eyebrow="Session Affinity"
              title="Sticky Sessions"
              description="Sticky sessions route repeated requests from the same user or session to the same backend. They can be useful, but they also couple users to individual instances."
              icon={LockKeyhole}
              isDark={isDark}
            />

            <div className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}>
              <DiagramNode
                icon={Users}
                title="User A"
                subtitle="Session cookie or affinity key"
                isDark={isDark}
              />
              <DownArrow label="Affinity key" isDark={isDark} />
              <DiagramNode
                icon={Network}
                title="Load Balancer"
                subtitle="Maps User A → Server 2"
                isDark={isDark}
                highlight
              />
              <DownArrow isDark={isDark} />
              <div className="grid gap-3 sm:grid-cols-3">
                <DiagramNode icon={Server} title="Server 1" isDark={isDark} />
                <DiagramNode
                  icon={Server}
                  title="Server 2"
                  subtitle="User A keeps returning here"
                  isDark={isDark}
                  highlight
                />
                <DiagramNode icon={Server} title="Server 3" isDark={isDark} />
              </div>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <TheoryCard title="Why teams use it" icon={CheckCircle2} isDark={isDark}>
                <p>
                  It can preserve in-memory session state, improve cache locality
                  or support a legacy service that was not designed to be fully
                  stateless.
                </p>
              </TheoryCard>

              <TheoryCard title="Why it can hurt scaling" icon={TriangleAlert} isDark={isDark}>
                <p>
                  Traffic can become uneven, a failed server can lose local
                  session state, and deployments become harder because users are
                  coupled to specific instances.
                </p>
              </TheoryCard>
            </div>

            <Callout type="success" title="Preferred scalable design" isDark={isDark}>
              Keep application instances stateless where practical. Store shared
              session state in an appropriate distributed store such as Redis or
              use signed/token-based session mechanisms when the security model
              allows it. Then any healthy backend can serve the next request.
            </Callout>
          </section>

          <section className="mt-16">
            <SectionHeading
              id="reverse-proxy"
              eyebrow="Related Concept"
              title="Load Balancer vs Reverse Proxy"
              description="A reverse proxy represents one or more backend servers to clients. Load balancing is one capability a reverse proxy can provide, but reverse proxies can do much more."
              icon={Route}
              isDark={isDark}
            />

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <TheoryCard title="Load Balancer" icon={Network} isDark={isDark}>
                <p>
                  The primary concern is distributing traffic across multiple
                  eligible backend instances while considering health and a
                  routing algorithm.
                </p>
                <p>
                  The same product may also perform TLS termination, routing and
                  observability, but traffic distribution is the defining role.
                </p>
              </TheoryCard>

              <TheoryCard title="Reverse Proxy" icon={Route} isDark={isDark}>
                <p>
                  A reverse proxy terminates the client-facing connection and
                  forwards requests to backend services. It hides backend
                  topology and can centralize cross-cutting behavior.
                </p>
                <p>
                  Common features include TLS, compression, caching, redirects,
                  authentication integration, request/response header changes and
                  load balancing.
                </p>
              </TheoryCard>
            </div>

            <div className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}>
              <DiagramNode
                icon={Users}
                title="Client"
                subtitle="Knows only public endpoint"
                isDark={isDark}
              />
              <DownArrow isDark={isDark} />
              <DiagramNode
                icon={Route}
                title="Reverse Proxy / L7 Load Balancer"
                subtitle="TLS + routing + balancing + policy"
                isDark={isDark}
                highlight
              />
              <DownArrow isDark={isDark} />
              <div className="grid gap-3 sm:grid-cols-3">
                <DiagramNode icon={Server} title="Service A" isDark={isDark} />
                <DiagramNode icon={Server} title="Service B" isDark={isDark} />
                <DiagramNode icon={Server} title="Service C" isDark={isDark} />
              </div>
            </div>

            <Callout type="info" title="Examples" isDark={isDark}>
              Products such as NGINX, HAProxy and Envoy can perform reverse-proxy
              and load-balancing responsibilities. Cloud application load
              balancers and ingress controllers also combine several of these
              concepts.
            </Callout>
          </section>

          <section className="mt-16">
            <SectionHeading
              id="tls"
              eyebrow="Security"
              title="TLS Termination and Re-encryption"
              description="An application-aware load balancer can terminate HTTPS, inspect the HTTP request and optionally create a new encrypted connection to the backend."
              icon={ShieldCheck}
              isDark={isDark}
            />

            <div className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}>
              <DiagramNode
                icon={Users}
                title="Client"
                subtitle="HTTPS"
                isDark={isDark}
              />
              <DownArrow label="Encrypted connection" isDark={isDark} />
              <DiagramNode
                icon={ShieldCheck}
                title="L7 Load Balancer"
                subtitle="Certificate + TLS termination"
                isDark={isDark}
                highlight
              />
              <DownArrow label="HTTP or new HTTPS connection" isDark={isDark} />
              <DiagramNode
                icon={Server}
                title="Backend Service"
                subtitle="Private application network"
                isDark={isDark}
              />
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <TheoryCard title="Why terminate TLS at the balancer?" icon={ShieldCheck} isDark={isDark}>
                <p>
                  It centralizes certificate management and allows the L7 proxy to
                  inspect HTTP routing information. It can also reduce repeated
                  certificate configuration across every backend.
                </p>
              </TheoryCard>

              <TheoryCard title="Why re-encrypt to the backend?" icon={LockKeyhole} isDark={isDark}>
                <p>
                  Some security and compliance models require encryption even
                  inside the private network. In that case the load balancer
                  creates another TLS connection to the selected backend.
                </p>
              </TheoryCard>
            </div>
          </section>

          <section className="mt-16">
            <SectionHeading
              id="high-availability"
              eyebrow="Avoid Single Point of Failure"
              title="High Availability of the Load-Balancing Layer"
              description="If every request depends on one load-balancer process, that process becomes a new single point of failure. The load-balancing tier itself must therefore be redundant."
              icon={ShieldCheck}
              isDark={isDark}
            />

            <div className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}>
              <DiagramNode
                icon={Globe2}
                title="Stable Frontend"
                subtitle="DNS / Anycast / VIP / managed global entry"
                isDark={isDark}
              />
              <DownArrow isDark={isDark} />
              <div className="grid gap-3 sm:grid-cols-2">
                <DiagramNode
                  icon={Network}
                  title="Load Balancer A"
                  subtitle="Zone A"
                  isDark={isDark}
                  highlight
                />
                <DiagramNode
                  icon={Network}
                  title="Load Balancer B"
                  subtitle="Zone B"
                  isDark={isDark}
                  highlight
                />
              </div>
              <DownArrow isDark={isDark} />
              <div className="grid gap-3 sm:grid-cols-3">
                <DiagramNode icon={Server} title="App 1" isDark={isDark} />
                <DiagramNode icon={Server} title="App 2" isDark={isDark} />
                <DiagramNode icon={Server} title="App N" isDark={isDark} />
              </div>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <TheoryCard title="Active-Passive" icon={Network} isDark={isDark}>
                <p>
                  One balancer handles traffic while another is ready to take
                  over. Failure detection triggers failover to the standby.
                </p>
                <p>
                  It is conceptually simple but standby capacity is underused and
                  failover time matters.
                </p>
              </TheoryCard>

              <TheoryCard title="Active-Active" icon={Zap} isDark={isDark}>
                <p>
                  Multiple balancers serve traffic simultaneously. Traffic is
                  distributed among them and the remaining instances continue if
                  one fails.
                </p>
                <p>
                  This improves both availability and usable capacity, but shared
                  state and configuration must be handled carefully.
                </p>
              </TheoryCard>
            </div>

            <Callout type="info" title="Managed load balancers" isDark={isDark}>
              Cloud-managed services hide much of this infrastructure, but the
              system designer still needs to think about zones, backend health,
              quotas, regional failure and whether global failover is required.
            </Callout>
          </section>

          <section className="mt-16">
            <SectionHeading
              id="millions"
              eyebrow="Scale"
              title="Handling Millions of Requests"
              description="At high scale, load balancing is only one layer. The system reduces unnecessary origin traffic before distributing the remaining requests across regions, services and backend instances."
              icon={Zap}
              isDark={isDark}
            />

            <div className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}>
              <div className="mx-auto max-w-3xl">
                <DiagramNode
                  icon={Users}
                  title="Millions of Users"
                  subtitle="Web + mobile + API traffic"
                  isDark={isDark}
                />
                <DownArrow isDark={isDark} />
                <DiagramNode
                  icon={Cloud}
                  title="CDN / Edge Cache"
                  subtitle="Serve static and cacheable content near users"
                  isDark={isDark}
                  highlight
                />
                <DownArrow isDark={isDark} />
                <DiagramNode
                  icon={ShieldCheck}
                  title="WAF / Rate Limiting"
                  subtitle="Protect origin and control abusive traffic"
                  isDark={isDark}
                />
                <DownArrow isDark={isDark} />
                <DiagramNode
                  icon={Globe2}
                  title="Global Traffic Manager"
                  subtitle="Choose healthy region"
                  isDark={isDark}
                />
                <DownArrow isDark={isDark} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <DiagramNode
                    icon={Network}
                    title="Regional LB A"
                    subtitle="Zone-aware backend pool"
                    isDark={isDark}
                    highlight
                  />
                  <DiagramNode
                    icon={Network}
                    title="Regional LB B"
                    subtitle="Zone-aware backend pool"
                    isDark={isDark}
                    highlight
                  />
                </div>
                <DownArrow isDark={isDark} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <DiagramNode icon={Server} title="App 1" isDark={isDark} />
                  <DiagramNode icon={Server} title="App 2" isDark={isDark} />
                  <DiagramNode icon={Server} title="App N" isDark={isDark} />
                </div>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["CDN", "Remove static and cacheable traffic before it reaches application servers."],
                ["Autoscaling", "Add stateless application capacity when sustained demand grows."],
                ["Caching", "Avoid repeated database and service work for popular reads."],
                ["Rate Limiting", "Protect the system from abusive or accidental overload."],
                ["Queueing", "Move non-immediate work out of the synchronous request path."],
                ["Database Scaling", "Scale reads, partition data and protect the write path independently."],
              ].map(([title, text]) => (
                <div key={title} className={`rounded-2xl border p-5 ${surface}`}>
                  <h3 className={`font-black ${textPrimary}`}>{title}</h3>
                  <p className={`mt-2 text-sm leading-7 ${textSecondary}`}>{text}</p>
                </div>
              ))}
            </div>

            <Callout type="warning" title="Do not say 'add a load balancer' and stop" isDark={isDark}>
              In an HLD interview, explain where traffic is reduced, where it is
              distributed, how backend capacity scales, how the database is
              protected and what happens when one layer becomes unhealthy.
            </Callout>
          </section>

          <section className="mt-16">
            <SectionHeading
              id="global"
              eyebrow="Multi-Region"
              title="Global Load Balancing"
              description="Global load balancing chooses a region or edge entry point before regional load balancing chooses an individual backend."
              icon={Globe2}
              isDark={isDark}
            />

            <div className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}>
              <DiagramNode
                icon={Users}
                title="Global Users"
                subtitle="India, Europe, US and other regions"
                isDark={isDark}
              />
              <DownArrow isDark={isDark} />
              <DiagramNode
                icon={Globe2}
                title="Global Traffic Manager"
                subtitle="Latency + geography + health + policy"
                isDark={isDark}
                highlight
              />
              <DownArrow isDark={isDark} />
              <div className="grid gap-3 md:grid-cols-3">
                <DiagramNode
                  icon={Network}
                  title="India Region"
                  subtitle="Regional LB + app fleet"
                  isDark={isDark}
                />
                <DiagramNode
                  icon={Network}
                  title="Europe Region"
                  subtitle="Regional LB + app fleet"
                  isDark={isDark}
                />
                <DiagramNode
                  icon={Network}
                  title="US Region"
                  subtitle="Regional LB + app fleet"
                  isDark={isDark}
                />
              </div>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <TheoryCard title="Common routing signals" icon={Route} isDark={isDark}>
                <p>
                  Geographic proximity, measured latency, region health,
                  regulatory requirements, capacity, cost and explicit business
                  policy can all affect region selection.
                </p>
              </TheoryCard>

              <TheoryCard title="The hard part is data" icon={Database} isDark={isDark}>
                <p>
                  Routing users to another region is much easier than keeping
                  data correct across regions. Replication lag, write ownership,
                  data residency and conflict handling often dominate the
                  multi-region design.
                </p>
              </TheoryCard>
            </div>

            <Callout type="warning" title="DNS failover is not instantaneous" isDark={isDark}>
              Recursive resolvers and clients can cache DNS answers until TTL
              expiry, and some software may cache longer. DNS-based failover must
              therefore be designed with realistic caching behavior in mind.
            </Callout>
          </section>

          <section className="mt-16">
            <SectionHeading
              id="websockets"
              eyebrow="Long-Lived Connections"
              title="Load Balancing WebSockets"
              description="WebSocket connections remain open for a long time, so the balancing problem is different from short independent HTTP requests."
              icon={Wifi}
              isDark={isDark}
            />

            <div className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}>
              <DiagramNode
                icon={Users}
                title="Client"
                subtitle="HTTP upgrade request"
                isDark={isDark}
              />
              <DownArrow label="Upgrade: websocket" isDark={isDark} />
              <DiagramNode
                icon={Network}
                title="WebSocket-Aware Load Balancer"
                subtitle="Select backend when connection opens"
                isDark={isDark}
                highlight
              />
              <DownArrow label="Long-lived connection" isDark={isDark} />
              <DiagramNode
                icon={Server}
                title="Realtime Server"
                subtitle="Connection remains attached"
                isDark={isDark}
              />
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <TheoryCard title="Why connection count matters" icon={Activity} isDark={isDark}>
                <p>
                  A server with many long-lived WebSockets can remain busy even
                  when it is receiving few new HTTP requests. Least Connections
                  or capacity-aware routing is often more meaningful than plain
                  Round Robin.
                </p>
              </TheoryCard>

              <TheoryCard title="Broadcast and cross-server messaging" icon={Network} isDark={isDark}>
                <p>
                  If User A is connected to Server 1 and User B to Server 4,
                  realtime events may need a shared pub/sub or messaging layer so
                  one application server can reach users connected elsewhere.
                </p>
              </TheoryCard>
            </div>

            <Callout type="info" title="Deployment behavior" isDark={isDark}>
              During deployments, connection draining is especially important
              because WebSockets can remain open for minutes or hours. You need a
              maximum connection age, graceful shutdown strategy or client
              reconnect behavior.
            </Callout>
          </section>

          <section className="mt-16">
            <SectionHeading
              id="case-study"
              eyebrow="Complete HLD Example"
              title="BookMyShow-Style Booking System: Where Load Balancing Fits"
              description="A ticket-booking platform has two very different traffic patterns: extremely heavy read traffic for discovery and seat maps, and correctness-sensitive write traffic when users lock and purchase seats."
              icon={BookOpen}
              isDark={isDark}
            />

            <Callout type="warning" title="Important note" isDark={isDark}>
              This section is an <strong>interview design model for a
              BookMyShow-style system</strong>. It explains how you can design the
              problem; it is not a claim about BookMyShow's private production
              architecture.
            </Callout>

            <h3 className={`mt-8 text-xl font-black ${textPrimary}`}>
              What happens during a blockbuster ticket release?
            </h3>

            <p className={`mt-3 text-sm leading-7 sm:text-base ${textSecondary}`}>
              Imagine tickets for a highly anticipated movie open at 10:00 AM.
              Thousands or millions of users may refresh the same city, movie and
              showtime pages within seconds. Most of those requests are reads:
              movie metadata, theatre list, show timings and seat maps. A smaller
              percentage reaches the critical booking path, where the same seat
              can be requested by many users at nearly the same time.
            </p>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <TheoryCard title="Read Spike" icon={Users} isDark={isDark}>
                <p>
                  Discovery endpoints receive huge fan-out. CDN, application
                  caching and read replicas can reduce origin/database load.
                </p>
              </TheoryCard>

              <TheoryCard title="Booking Contention" icon={LockKeyhole} isDark={isDark}>
                <p>
                  Multiple users can select the same seat. Correctness requires
                  atomic locking or reservation logic with expiration.
                </p>
              </TheoryCard>

              <TheoryCard title="Payment Uncertainty" icon={Timer} isDark={isDark}>
                <p>
                  Payment can succeed, fail, time out or return late. The booking
                  workflow must be idempotent and recoverable.
                </p>
              </TheoryCard>
            </div>

            <h3 className={`mt-9 text-xl font-black ${textPrimary}`}>
              High-Level Traffic Architecture
            </h3>

            <div className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}>
              <div className="mx-auto max-w-4xl">
                <DiagramNode
                  icon={Users}
                  title="Users"
                  subtitle="Search, browse, seat map, booking"
                  isDark={isDark}
                />
                <DownArrow isDark={isDark} />
                <DiagramNode
                  icon={Cloud}
                  title="CDN / Edge"
                  subtitle="Static assets + cacheable public content"
                  isDark={isDark}
                  highlight
                />
                <DownArrow isDark={isDark} />
                <DiagramNode
                  icon={ShieldCheck}
                  title="WAF + Rate Limiter"
                  subtitle="Protect high-demand endpoints"
                  isDark={isDark}
                />
                <DownArrow isDark={isDark} />
                <DiagramNode
                  icon={Network}
                  title="L7 Load Balancer / API Entry"
                  subtitle="Health-aware routing by path/service"
                  isDark={isDark}
                  highlight
                />
                <DownArrow isDark={isDark} />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <DiagramNode
                    icon={Server}
                    title="Search Service"
                    subtitle="Movies + theatres"
                    isDark={isDark}
                  />
                  <DiagramNode
                    icon={Server}
                    title="Show Service"
                    subtitle="Timings + seat map"
                    isDark={isDark}
                  />
                  <DiagramNode
                    icon={LockKeyhole}
                    title="Booking Service"
                    subtitle="Locks + reservation state"
                    isDark={isDark}
                  />
                  <DiagramNode
                    icon={Server}
                    title="Payment Service"
                    subtitle="Payment orchestration"
                    isDark={isDark}
                  />
                </div>
                <DownArrow isDark={isDark} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <DiagramNode
                    icon={Database}
                    title="Cache / Redis"
                    subtitle="Hot reads + short-lived locks"
                    isDark={isDark}
                  />
                  <DiagramNode
                    icon={Database}
                    title="Booking Database"
                    subtitle="Authoritative seat + booking state"
                    isDark={isDark}
                  />
                  <DiagramNode
                    icon={Network}
                    title="Event / Queue Layer"
                    subtitle="Notifications + async processing"
                    isDark={isDark}
                  />
                </div>
              </div>
            </div>

            <Callout type="info" title="What the load balancer solves here" isDark={isDark}>
              The load balancer spreads requests across healthy instances of
              Search, Show, Booking and Payment services. It allows those services
              to scale horizontally and survive individual server failures.
              <strong> It does not decide who owns a seat.</strong> Double-booking
              prevention belongs to the booking/inventory consistency design.
            </Callout>

            <h3 className={`mt-9 text-xl font-black ${textPrimary}`}>
              Step-by-Step Seat Booking Flow
            </h3>

            <div className="mt-4 space-y-3">
              <Step
                number="1"
                title="User opens a show"
                text="The request reaches the L7 load balancer and is routed to a healthy Show Service instance. Frequently requested show metadata can be served from cache."
                isDark={isDark}
              />
              <Step
                number="2"
                title="Seat map is loaded"
                text="The service reads current seat state from an appropriate cache/database model. Available, locked and sold seats must be distinguishable."
                isDark={isDark}
              />
              <Step
                number="3"
                title="User chooses Seat A10"
                text="The booking request is routed to any healthy Booking Service instance. The application should not rely on that one server keeping the lock only in local memory."
                isDark={isDark}
              />
              <Step
                number="4"
                title="Booking Service acquires an atomic temporary lock"
                text="The system attempts to transition A10 from AVAILABLE to LOCKED for this user/order, normally with a short TTL. Only one competing request should succeed."
                isDark={isDark}
              />
              <Step
                number="5"
                title="Create a PENDING booking"
                text="Persist a booking/order identifier and the locked seats before redirecting the user into payment. The request should carry an idempotency key so retries do not create duplicate bookings."
                isDark={isDark}
              />
              <Step
                number="6"
                title="Payment starts"
                text="The payment service creates or tracks the payment attempt. The seat remains locked only for the booking window rather than forever."
                isDark={isDark}
              />
              <Step
                number="7"
                title="Payment success confirms seats"
                text="On verified success, the authoritative seat state is changed to BOOKED/SOLD and the booking becomes CONFIRMED. Database uniqueness or conditional updates provide another correctness boundary."
                isDark={isDark}
              />
              <Step
                number="8"
                title="Failure or timeout releases the lock"
                text="If payment fails or the reservation TTL expires, the seat returns to AVAILABLE. Late payment callbacks need reconciliation so a user is not charged for an unavailable seat without recovery handling."
                isDark={isDark}
              />
              <Step
                number="9"
                title="Async events are published"
                text="Confirmation email/SMS, analytics, invoice generation and other non-critical tasks can be processed through an event or queue layer instead of blocking the booking response."
                isDark={isDark}
              />
            </div>

            <h3 className={`mt-9 text-xl font-black ${textPrimary}`}>
              Seat Locking Diagram
            </h3>

            <div className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}>
              <div className="grid gap-3 sm:grid-cols-2">
                <DiagramNode
                  icon={Users}
                  title="User A"
                  subtitle="Requests Seat A10"
                  isDark={isDark}
                />
                <DiagramNode
                  icon={Users}
                  title="User B"
                  subtitle="Requests Seat A10 at same time"
                  isDark={isDark}
                />
              </div>
              <DownArrow label="Both requests reach booking tier" isDark={isDark} />
              <DiagramNode
                icon={Network}
                title="Load Balancer"
                subtitle="Requests can go to different Booking Service instances"
                isDark={isDark}
                highlight
              />
              <DownArrow isDark={isDark} />
              <div className="grid gap-3 sm:grid-cols-2">
                <DiagramNode
                  icon={Server}
                  title="Booking Instance 1"
                  subtitle="Handles User A"
                  isDark={isDark}
                />
                <DiagramNode
                  icon={Server}
                  title="Booking Instance 2"
                  subtitle="Handles User B"
                  isDark={isDark}
                />
              </div>
              <DownArrow label="Shared atomic seat state" isDark={isDark} />
              <DiagramNode
                icon={LockKeyhole}
                title="Seat Lock / Inventory Store"
                subtitle="A10 can be locked by only one booking"
                isDark={isDark}
                highlight
              />
              <DownArrow isDark={isDark} />
              <div className="grid gap-3 sm:grid-cols-2">
                <DiagramNode
                  icon={CheckCircle2}
                  title="User A"
                  subtitle="Lock acquired → continue to payment"
                  isDark={isDark}
                />
                <DiagramNode
                  icon={TriangleAlert}
                  title="User B"
                  subtitle="Lock rejected → choose another seat"
                  isDark={isDark}
                  danger
                />
              </div>
            </div>

            <Callout type="warning" title="Why sticky sessions do not solve double booking" isDark={isDark}>
              Even if every request from User A goes to the same application
              server, User B can be routed to another server and compete for the
              same seat. Correctness must live in shared, authoritative state with
              atomic operations, constraints or transactional logic—not in the
              load balancer.
            </Callout>

            <h3 className={`mt-9 text-xl font-black ${textPrimary}`}>
              What Happens During a Huge Ticket Drop?
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                [
                  "1. Edge absorbs public content",
                  "Posters, static JavaScript, CSS and other cacheable resources should not consume booking-service capacity.",
                ],
                [
                  "2. Read endpoints scale independently",
                  "Search/show services can run many stateless replicas behind load balancers and use cache/read replicas where appropriate.",
                ],
                [
                  "3. Admission control protects writes",
                  "If demand exceeds safe booking capacity, rate limiting, waiting rooms or queues are safer than allowing every request to hammer the database.",
                ],
                [
                  "4. Booking path stays correctness-first",
                  "Seat locks, idempotency and database constraints remain authoritative even when thousands of application instances are serving traffic.",
                ],
                [
                  "5. Payment callbacks are idempotent",
                  "Duplicate callbacks or client retries should not confirm the same booking twice or charge twice.",
                ],
                [
                  "6. Async work is separated",
                  "Email, SMS and analytics should not make the synchronous seat-confirmation transaction slower.",
                ],
              ].map(([title, text]) => (
                <div key={title} className={`rounded-2xl border p-5 ${surface}`}>
                  <h4 className={`font-black ${textPrimary}`}>{title}</h4>
                  <p className={`mt-2 text-sm leading-7 ${textSecondary}`}>{text}</p>
                </div>
              ))}
            </div>

            <CodeBlock title="Simplified seat-state idea">
{`AVAILABLE
   |
   | atomic lock(userId, bookingId, expiresAt)
   v
LOCKED
   | \
   |  \ lock expires / payment fails
   |   -----------------------------> AVAILABLE
   |
   | verified payment success
   v
BOOKED`}
            </CodeBlock>
          </section>

          <section className="mt-16">
            <SectionHeading
              id="failures"
              eyebrow="Production Reliability"
              title="Failure Handling and Operational Concerns"
              description="A production load-balancing design is incomplete unless you explain what happens when backends become unhealthy, retries increase load, deployments drain connections or the balancing layer itself fails."
              icon={TriangleAlert}
              isDark={isDark}
            />

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {FAILURE_SCENARIOS.map((item) => (
                <div key={item.title} className={`rounded-2xl border p-5 ${surface}`}>
                  <div className="flex gap-3">
                    <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                    <div>
                      <h3 className={`font-black ${textPrimary}`}>{item.title}</h3>
                      <p className={`mt-2 text-sm leading-7 ${textSecondary}`}>
                        {item.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h3 className={`mt-9 text-xl font-black ${textPrimary}`}>
              Important Timeout and Retry Path
            </h3>

            <div className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}>
              <DiagramNode
                icon={Users}
                title="Client"
                subtitle="Request with deadline"
                isDark={isDark}
              />
              <DownArrow isDark={isDark} />
              <DiagramNode
                icon={Network}
                title="Load Balancer"
                subtitle="Connect + request timeout"
                isDark={isDark}
                highlight
              />
              <DownArrow isDark={isDark} />
              <DiagramNode
                icon={Server}
                title="Slow Backend"
                subtitle="May time out without crashing"
                isDark={isDark}
                danger
              />
              <DownArrow label="Retry only when safe" isDark={isDark} />
              <DiagramNode
                icon={RefreshCcw}
                title="Bounded Retry + Backoff + Jitter"
                subtitle="Avoid synchronized retry storms"
                isDark={isDark}
              />
            </div>

            <Callout type="warning" title="Be careful retrying writes" isDark={isDark}>
              Retrying GET-like idempotent reads is usually simpler than retrying
              booking, payment or order-creation requests. For writes, use
              idempotency keys and clearly define whether a timeout means
              "failed" or merely "result unknown."
            </Callout>

            <h3 className={`mt-9 text-xl font-black ${textPrimary}`}>
              Metrics to Monitor
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {[
                "Requests / sec",
                "P50 / P95 / P99 latency",
                "5xx rate",
                "4xx rate",
                "Active connections",
                "New connections / sec",
                "Healthy hosts",
                "Unhealthy hosts",
                "Backend queue depth",
                "Connection errors",
                "Timeout rate",
                "TLS errors",
              ].map((metric) => (
                <div
                  key={metric}
                  className={`rounded-xl border p-4 text-center text-xs font-bold sm:text-sm ${surface}`}
                >
                  {metric}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <SectionHeading
              id="interview"
              eyebrow="Interview Preparation"
              title="Load Balancing Interview Questions"
              description="After studying this chapter, you should be able to answer these questions with theory, trade-offs and a diagram."
              icon={Sparkles}
              isDark={isDark}
            />

            <div className="mt-7 space-y-3">
              {[
                "What is a load balancer and why do we need one?",
                "What problems are solved by horizontal scaling plus load balancing?",
                "What are the different types of load balancers?",
                "Hardware vs software vs managed cloud load balancer?",
                "External vs internal load balancer?",
                "Client-side vs server-side load balancing?",
                "What is the difference between L4 and L7 load balancing?",
                "When would you choose L4 over L7?",
                "Round Robin vs Weighted Round Robin?",
                "Round Robin vs Least Connections?",
                "What is Weighted Least Connections?",
                "What is Least Response Time?",
                "What is Power of Two Choices?",
                "IP Hash vs consistent hashing?",
                "Why is consistent hashing useful when nodes change?",
                "What are active and passive health checks?",
                "Liveness vs readiness?",
                "What is connection draining?",
                "What are sticky sessions and why can they be harmful?",
                "Load balancer vs reverse proxy?",
                "What is TLS termination and backend re-encryption?",
                "How do you prevent the load balancer from becoming an SPOF?",
                "Active-active vs active-passive load balancing?",
                "How would you handle millions of requests per second?",
                "Where should CDN, WAF, rate limiter and load balancer sit?",
                "How does global load balancing work?",
                "Why can DNS TTL delay regional failover?",
                "How do you load balance WebSockets?",
                "How do retries create retry storms?",
                "How would a load balancer fit into BookMyShow system design?",
                "Why does load balancing not solve double booking?",
                "How would you lock a seat while a payment is in progress?",
                "What happens if payment succeeds after a seat-lock timeout?",
              ].map((question, index) => (
                <div
                  key={question}
                  className={`flex gap-3 rounded-xl border p-4 ${surface}`}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                    {index + 1}
                  </span>

                  <p className={`pt-1 text-sm font-semibold ${textPrimary}`}>
                    {question}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <SectionHeading
              eyebrow="Quick Revision"
              title="Frequently Asked Questions"
              description="Short answers for the most important load-balancing concepts."
              icon={Lightbulb}
              isDark={isDark}
            />

            <div className="mt-7 space-y-4">
              {faqData.map((item) => (
                <div key={item.question} className={`rounded-2xl border p-5 ${surface}`}>
                  <h3 className={`font-black ${textPrimary}`}>{item.question}</h3>
                  <p className={`mt-2 text-sm leading-7 ${textSecondary}`}>
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-xl sm:p-9">
              <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-blue-100">
                    <BookOpen className="h-3.5 w-3.5" />
                    Mastering System Design — HLD
                  </div>

                  <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                    Learn complete system design, not isolated definitions.
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                    Move from requirements to APIs, services, databases,
                    caching, load balancing, queues, concurrency, scalability and
                    failure handling in complete interview-style systems.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-blue-100">
                    {[
                      "Caching",
                      "Load Balancing",
                      "Databases",
                      "Queues",
                      "Rate Limiting",
                      "BookMyShow",
                      "Uber",
                      "Scalability",
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-white/10 px-3 py-1.5"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to={BOOK_URL}
                  className="inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-50 md:w-auto"
                >
                  Explore HLD Book
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          <section
            className={`mt-10 border-t pt-8 ${
              isDark ? "border-slate-800" : "border-slate-200"
            }`}
          >
            <p
              className={`mb-4 text-xs font-black uppercase tracking-[0.14em] ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Continue Learning
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <Link
                to={PREVIOUS_TOPIC.path}
                className={`group rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 sm:p-6 ${
                  isDark
                    ? "border-slate-800 bg-slate-900 hover:border-blue-700"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      isDark
                        ? "bg-slate-800 text-slate-300"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <ArrowLeft className="h-5 w-5 transition group-hover:-translate-x-1" />
                  </div>

                  <div>
                    <p
                      className={`text-[11px] font-black uppercase tracking-wider ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      Previous Topic
                    </p>

                    <h3
                      className={`mt-1 text-xl font-black ${
                        isDark ? "text-white" : "text-slate-950"
                      }`}
                    >
                      {PREVIOUS_TOPIC.title}
                    </h3>

                    <p className={`mt-2 text-sm leading-6 ${textSecondary}`}>
                      {PREVIOUS_TOPIC.description}
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                to={NEXT_TOPIC.path}
                className={`group rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 sm:p-6 ${
                  isDark
                    ? "border-blue-900 bg-blue-950/20 hover:border-blue-600"
                    : "border-blue-200 bg-blue-50/50 hover:border-blue-400 hover:shadow-lg"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-blue-500">
                      Next Topic
                    </p>

                    <h3
                      className={`mt-1 text-xl font-black ${
                        isDark ? "text-white" : "text-slate-950"
                      }`}
                    >
                      {NEXT_TOPIC.title}
                    </h3>

                    <p className={`mt-2 text-sm leading-6 ${textSecondary}`}>
                      {NEXT_TOPIC.description}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default HLDLoadBalancingResource;
