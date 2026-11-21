import { Link } from "react-router-dom";
import {
  ArrowsLeftRight, Broadcast, Code, Cpu, Database, Desktop, Globe, Key, Lightning, Lock, PaperPlaneTilt, Path, ShieldCheck, Stack, TreeStructure, Users, WebhooksLogo,
} from "@phosphor-icons/react";

import { Call, Cards, Chips, Code as CodeBlock, Compare, Flow, H3, Mark, Prose, ReaderPage, Sec, Specs, Steps, Table } from "../resources/kit/Reader";

/* =====================================================================
   API ENGINEERING  (/resources/apis)
   From "what is an API" to production contracts: HTTP, REST, errors,
   pagination, idempotency, auth, caching, GraphQL, webhooks, OpenAPI.
===================================================================== */
const GUIDE = {
  id: "apis",
  path: "/resources/apis",
  short: "API design",
  section: "Backend",
  seoTitle: "API Design Guide: REST, GraphQL & Auth | Target Trek",
  description: "Free API design guide: HTTP methods and status codes, REST, pagination, versioning, idempotency keys, auth, CORS, ETags, GraphQL vs REST, webhooks and gRPC.",
  keywords: ["api design", "rest api", "restful api", "http methods", "http status codes", "401 vs 403", "put vs patch", "idempotency key", "api pagination cursor", "api versioning", "jwt authentication", "cors preflight", "etag caching", "graphql vs rest", "webhooks", "openapi swagger", "api interview questions"],
  about: ["API design", "REST", "HTTP", "GraphQL", "Authentication", "Webhooks", "OpenAPI"],
  tags: ["Core engineering", "Backend", "Beginner → Advanced"],
  h1: "API Engineering: REST, HTTP, GraphQL and Beyond",
  sub: "How clients and servers talk, how to design APIs people can depend on, and how real systems handle auth, retries, caching, rate limits, webhooks and failure.",
  answer: "An API (application programming interface) is a contract that says how one piece of software can ask another for data or actions: which endpoints exist, what to send, what comes back and what each status code means. Most web APIs are REST over HTTP: resources such as /users/42 manipulated with GET, POST, PUT, PATCH and DELETE. A production API also needs consistent errors, pagination, versioning, idempotent retries, authentication, authorization, caching and rate limits.",
  minutes: 50,
  level: "Beginner → Advanced",
  updated: "2026-11-18",
  crumbs: [["Resources", "/resources"], ["API engineering", "/resources/apis"]],
  learn: [
    "HTTP methods, safety, idempotency and status codes",
    "REST resource design, errors, pagination and versioning",
    "Idempotency keys and safe retries for payments",
    "Authentication vs authorization, CORS and API security",
    "REST vs GraphQL, webhooks, gRPC and OpenAPI",
  ],
  toc: [
    { id: "introduction", label: "What is an API?" },
    { id: "api-types", label: "API styles and audiences" },
    { id: "http-foundation", label: "HTTP foundation" },
    { id: "request-response", label: "Request and response" },
    { id: "http-methods", label: "HTTP methods" },
    { id: "status-codes", label: "Status codes" },
    { id: "rest", label: "What makes an API RESTful" },
    { id: "resource-design", label: "Resource design" },
    { id: "parameters", label: "Path, query, header, body" },
    { id: "errors", label: "Responses and errors" },
    { id: "pagination", label: "Pagination" },
    { id: "filtering", label: "Filtering and sorting" },
    { id: "versioning", label: "Versioning" },
    { id: "idempotency", label: "Idempotency and retries" },
    { id: "authentication", label: "Authentication and authorization" },
    { id: "security", label: "Security and CORS" },
    { id: "caching", label: "Caching and ETags" },
    { id: "rate-limiting", label: "Rate limiting" },
    { id: "graphql", label: "GraphQL vs REST" },
    { id: "webhooks", label: "Webhooks" },
    { id: "other-api-styles", label: "RPC, gRPC, SOAP, WebSockets" },
    { id: "openapi", label: "OpenAPI and Swagger" },
    { id: "gateway", label: "Gateway and observability" },
    { id: "testing", label: "Testing" },
    { id: "production-design", label: "Production design" },
    { id: "checklist", label: "Production checklist" },
  ],
  questions: [
    { q: "What is an API, and why does the contract matter?", a: "An API is the agreed interface between two pieces of software: operations, inputs, outputs, errors and behaviour. Clients depend on that contract, not on your code, so changing it carelessly breaks everyone who integrated. Treat it like a public promise." },
    { q: "What makes an API RESTful?", a: "It models things as resources with stable URIs, uses HTTP methods for their defined meaning, is stateless (each request carries what it needs), makes responses cacheable where appropriate, and follows a uniform interface. Using HTTP and JSON alone doesn't make an API RESTful." },
    { q: "URI vs URL?", a: "A URI identifies a resource; a URL is a URI that also tells you how to locate it (scheme and host). In everyday API work the terms are used almost interchangeably." },
    { q: "GET vs POST vs PUT vs PATCH vs DELETE?", a: "GET reads. POST creates or triggers an action. PUT replaces a resource with the full representation sent. PATCH changes only the fields sent. DELETE removes. GET, PUT and DELETE are idempotent; POST isn't (unless you add an idempotency key); PATCH depends on how it's written." },
    { q: "What does “safe” mean, and why is GET safe?", a: "A safe method has read-only semantics: calling it shouldn't change server state. Browsers, crawlers and caches may fetch GET URLs freely, so a GET that deletes or charges something is a serious bug." },
    { q: "What does idempotent mean? Is POST idempotent? Why is DELETE?", a: "Idempotent means repeating the request has the same effect as sending it once. POST isn't: two POST /orders can create two orders. DELETE is: after the first delete, the resource is gone, and repeating it changes nothing more, even if the second call returns 404." },
    { q: "401 vs 403?", a: "401 Unauthorized means you're not authenticated: the credentials are missing, invalid or expired, so log in again. 403 Forbidden means you're authenticated but not allowed to do this, and re-authenticating won't help." },
    { q: "When do you return 400, 409 or 422?", a: "400 when the request is malformed (invalid JSON, wrong types). 422 when it's well-formed but semantically invalid (an end date before the start date). 409 when it conflicts with the resource's current state (a duplicate email, a stale version, booking an already-booked seat)." },
    { q: "200 vs 201 vs 202 vs 204?", a: "200: success with a body. 201: a resource was created; include a Location header and usually the resource. 202: accepted for async processing and not done yet; return a status URL. 204: success with no body, common for DELETE and some PUT/PATCH." },
    { q: "Path parameters vs query parameters?", a: "Use a path parameter when the value identifies which resource you mean (/users/42). Use query parameters to filter, search, sort, paginate or shape the representation (/products?category=books&sort=-price)." },
    { q: "Offset vs cursor pagination?", a: "Offset (?page=3&limit=20) is simple and supports jumping to a page, but large offsets are slow and changing data causes skipped or duplicated items. Cursor pagination (?after=<opaque cursor>) is fast at any depth and stable while data changes, but can't jump to page 50." },
    { q: "How would you version an API?", a: "Most commonly with a URI prefix (/api/v1), sometimes a header (API-Version: 2026-09-01) or a media type. More importantly, avoid needing versions: make additive, backward-compatible changes, and reserve a new version for genuinely breaking changes, with a deprecation timeline." },
    { q: "What is an idempotency key, and why do payment APIs use one?", a: "A unique key the client sends with a non-idempotent request. The server stores the result under that key; a retry with the same key returns the stored result instead of charging again. It makes POST /payments safe to retry after a timeout." },
    { q: "JWT vs session authentication?", a: "Sessions keep state on the server and send the browser an opaque cookie: easy to revoke, but they need a shared session store. JWTs are signed, self-contained tokens the API can verify without a lookup: they scale easily but are hard to revoke before expiry, so keep them short-lived and pair them with refresh tokens." },
    { q: "Authentication vs authorization?", a: "Authentication verifies who the caller is (login, API key, token). Authorization decides what they may do (may user 42 read order 9001?). Check authorization on every protected resource, not just at login." },
    { q: "OAuth 2.0 vs OpenID Connect?", a: "OAuth 2.0 is an authorization framework for delegated access: an app gets an access token to call an API on a user's behalf. OpenID Connect adds an identity layer on top (an ID token and user info) so it can also be used for login." },
    { q: "What is CORS, and what is a preflight request?", a: "CORS is how a browser decides whether JavaScript from one origin may read responses from another. For non-simple requests (custom headers, PUT or DELETE, JSON content type) the browser first sends an OPTIONS preflight, and the server answers with Access-Control-Allow-* headers. CORS doesn't protect your API from non-browser clients; that's what auth is for." },
    { q: "What do Cache-Control and ETag do?", a: "Cache-Control tells clients and CDNs whether and how long they may cache (public, private, max-age, no-store). An ETag is a version identifier: the client sends If-None-Match, and if nothing changed the server replies 304 Not Modified with no body." },
    { q: "REST vs GraphQL: when would you use each?", a: "REST suits resource-oriented, cache-friendly, public APIs whose costs are easy to reason about. GraphQL suits rich clients that need many related fields in one round trip and evolve quickly. GraphQL adds query-cost limits, resolver authorization and harder HTTP caching." },
    { q: "What is the N+1 problem in GraphQL?", a: "A resolver fetches a list (one query) and then each item's related data separately (N queries). DataLoader-style batching collects those N lookups into one batched query per request." },
    { q: "What are webhooks, and webhook vs polling?", a: "A webhook is the provider calling your HTTP endpoint when an event happens, such as payment.success. Polling asks repeatedly whether anything has changed. Webhooks are near-real-time and waste less traffic, but you need a public endpoint, signature verification and idempotent handling of retries." },
    { q: "How do you secure and process a webhook safely?", a: "Verify the HMAC signature over the raw body with the shared secret, reject old timestamps to stop replays, deduplicate by event ID, return 2xx quickly and queue the heavy work, and monitor failures and retries." },
    { q: "API gateway vs load balancer?", a: "A load balancer spreads traffic across instances of a service. An API gateway is an API-aware front door: routing by path, authentication, quotas, transformation and aggregation. Real systems usually have both." },
    { q: "What is OpenAPI, and OpenAPI vs Swagger?", a: "OpenAPI is a machine-readable specification for describing HTTP APIs in YAML or JSON. Swagger is the original name and a family of tools (Swagger UI, Editor, Codegen) for working with OpenAPI documents. The spec drives docs, validation, SDKs and contract tests." },
    { q: "How do you safely retry failed API calls?", a: "Retry only transient failures (timeouts, 502, 503, 504, 429 with Retry-After), and only idempotent requests or those with an idempotency key. Use bounded attempts with exponential backoff and jitter, respect Retry-After, and set an overall deadline." },
    { q: "How do you handle concurrent updates to the same resource?", a: "Use optimistic concurrency: the client sends the version it read (If-Match with an ETag, or a version field) and the server updates only if it still matches, otherwise it returns 409 or 412. Use transactions or locks where conflicts are frequent." },
    { q: "How would you design a production-ready payment API?", a: "POST /payments with an Idempotency-Key; validate the amount and currency; authenticate and authorize the merchant; create a PENDING payment, call the provider with its own idempotency key, and confirm via a signed webhook; return 201 or 202 with a status URL; consistent errors; rate limits; audit logs; and no card data in logs." },
  ],
  quiz: [
    { q: "A logged-in user requests another user's private order. What status fits best?", options: ["401 Unauthorized", "403 Forbidden (or 404 to hide existence)", "400 Bad Request", "500 Internal Server Error"], answer: 1, why: "They are authenticated (so not 401) but not permitted. Some APIs return 404 so they don't reveal that the resource exists." },
    { q: "Which method should update only the email field of /users/42?", options: ["PUT", "PATCH", "POST", "GET"], answer: 1, why: "PATCH applies a partial change. PUT means replacing the whole representation." },
    { q: "The client times out on POST /payments and doesn't know if it worked. What makes a retry safe?", options: ["Retry immediately", "An Idempotency-Key header", "Switching to GET", "A longer timeout"], answer: 1, why: "The server returns the stored result for a repeated key instead of charging again." },
    { q: "A feed of 50 million posts needs fast, stable paging while new posts arrive. Which pagination?", options: ["Offset (?page=)", "Cursor-based", "Return everything", "Random sampling"], answer: 1, why: "A cursor jumps straight to a position through an index and doesn't skip or duplicate items as data changes." },
    { q: "The client sends If-None-Match: \"v12\" and the resource hasn't changed. What does the server return?", options: ["200 with the full body", "304 Not Modified", "204 No Content", "409 Conflict"], answer: 1, why: "304 tells the client its cached copy is still valid, with no body sent." },
    { q: "A webhook arrives twice with the same event ID. What should the handler do?", options: ["Process it twice", "Return 500 the second time", "Recognise the event ID and safely no-op", "Disable the webhook"], answer: 2, why: "Providers retry, so duplicates are expected. Deduplicate by event ID and still return 2xx." },
  ],
  glossary: [
    ["Endpoint", "A URL + method combination clients call, e.g. GET /users/42."],
    ["Resource", "A thing the API exposes (user, order) identified by a URI."],
    ["Safe method", "Read-only semantics: GET, HEAD, OPTIONS."],
    ["Idempotent", "Repeating the request has the same effect as once: GET, PUT, DELETE."],
    ["Status code", "A three-digit result class: 2xx success, 4xx client error, 5xx server error."],
    ["Idempotency key", "A client-supplied ID that makes retried writes safe."],
    ["Bearer token", "An access token sent as Authorization: Bearer <token>; JWT is one format."],
    ["CORS", "The browser rules for cross-origin requests, negotiated with Access-Control-* headers."],
    ["ETag", "A version tag enabling conditional requests and 304 Not Modified."],
    ["Webhook", "A provider pushing an event to your HTTP endpoint."],
    ["OpenAPI", "A machine-readable specification of an HTTP API."],
    ["N+1 problem", "One query for a list, then one more per item: fix with batching."],
  ],
  takeaways: [
    "An API is a contract. Design it for the people who depend on it, and change it carefully.",
    "Use HTTP methods and status codes for what they mean: GET is safe, PUT and DELETE are idempotent, 401 ≠ 403.",
    "Model resources (nouns), not actions in URLs; use path parameters for identity and query parameters for selection.",
    "Return one consistent error shape with stable codes and a request ID; never leak internals.",
    "Bound every collection with pagination, preferably cursor-based at scale.",
    "Make retries safe: idempotency keys on writes, backoff with jitter, and timeouts everywhere.",
    "Authenticate every request, authorize every resource, rate-limit sensitive routes, and verify every webhook.",
  ],
  faq: [
    { q: "What is an API?", a: "An API (application programming interface) is a defined contract that lets software systems communicate: the operations available, the inputs they accept, the outputs they return and how errors are reported." },
    { q: "What is the difference between a REST API and a RESTful API?", a: "They're used interchangeably. “RESTful” emphasises that the API consistently follows REST principles (resources, standard HTTP semantics, statelessness, cacheability) rather than merely using HTTP and JSON." },
    { q: "What is the difference between PUT and PATCH?", a: "PUT replaces the entire resource with the representation you send; PATCH applies a partial change to only the fields you send." },
    { q: "What is the difference between 401 and 403?", a: "401 means the request isn't authenticated (missing or invalid credentials). 403 means the caller is authenticated but doesn't have permission for that action." },
    { q: "Is GraphQL better than REST?", a: "Neither is better in general. GraphQL helps clients fetch exactly the related data they need in one request; REST is simpler to cache, secure and reason about for resource-oriented APIs. Many companies use both." },
    { q: "What is API idempotency?", a: "An operation is idempotent when making the same request repeatedly has the same effect as making it once. GET, PUT and DELETE are idempotent by definition; POST can be made retry-safe with an idempotency key." },
  ],
  next: { title: "API Gateway", path: "/resources/hld/api-gateway", text: "Put your APIs behind one controlled front door: routing, auth, quotas, aggregation and circuit breakers." },
  book: {
    path: "/book/springboot-interview-handbook", label: "Spring Boot handbook", title: "Build these APIs in Spring Boot",
    text: "REST controllers, validation, security, persistence, error handling and production practices, with the interview questions that go with them.",
    short: "REST, security and persistence in Spring Boot.",
    cta: "Explore the Spring Boot handbook",
    chips: ["REST", "Validation", "Security", "JPA", "Error handling", "Interview Q&A"],
  },
};

const STYLES = [
  { title: "REST", tag: "Resources over HTTP", facts: [["Model", "Resources identified by URLs, manipulated with HTTP methods, usually JSON."], ["Good fit", "Public APIs, CRUD services, web and mobile backends.", "good"]] },
  { title: "GraphQL", tag: "Typed query language", facts: [["Model", "One typed schema; clients ask for exactly the fields they need."], ["Good fit", "Rich frontends with complex, changing data needs.", "good"]] },
  { title: "RPC / gRPC", tag: "Remote operations", facts: [["Model", "Call named procedures (createInvoice); gRPC uses Protocol Buffers over HTTP/2."], ["Good fit", "Fast, strongly typed service-to-service calls.", "good"]] },
  { title: "WebSocket", tag: "Persistent, two-way", facts: [["Model", "A long-lived connection where both sides send messages any time."], ["Good fit", "Chat, live dashboards, collaboration, games.", "good"]] },
  { title: "Webhook", tag: "Server push", facts: [["Model", "The provider calls your endpoint when an event happens."], ["Good fit", "Payment updates, Git events, delivery notifications.", "good"]] },
  { title: "SOAP", tag: "XML messaging", facts: [["Model", "XML envelopes with formal WSDL contracts and WS-* standards."], ["Good fit", "Legacy enterprise and banking integrations.", "good"]] },
];

export default function APIResource() {
  return (
    <ReaderPage guide={GUIDE}>
      {/* 01 */}
      <Sec id="introduction" n={1} eyebrow="Fundamentals" title="What is an API?" lead="API stands for application programming interface: a contract that defines how one piece of software can request data or behaviour from another.">
        <Cards cols={3} items={[
          ["Client", "The caller: a React app, an Android app, another backend service, a CLI or an IoT device.", Desktop],
          ["Server", "Receives the request, validates it, applies business rules, talks to dependencies and responds.", Stack],
          ["Contract", "Endpoints, methods, request formats, auth, response schemas, status codes and behaviour.", Code],
        ]} />
        <Flow across caption="Basic API communication" steps={[
          { t: "Client", i: Desktop }, { t: "HTTP request", i: PaperPlaneTilt }, { t: "Backend API", i: Stack, tone: "hot" }, { t: "Database", i: Database }, { t: "HTTP response", i: PaperPlaneTilt },
        ]} />
        <Call tone="tip" title="Think of a restaurant">You're the client; the menu is the API contract; the waiter carries requests to the kitchen, which is the implementation. You don't need to know how the kitchen cooks. You need to know what you can order and what you'll get.</Call>
      </Sec>

      {/* 02 */}
      <Sec id="api-types" n={2} eyebrow="Architecture" title="API styles and audiences" lead="REST and GraphQL are the best known, but production systems also use RPC, gRPC, WebSockets, webhooks and, occasionally, SOAP.">
        <Specs items={STYLES} />
        <H3>Who the API is for</H3>
        <Cards items={[
          ["Public API", "For outside developers and customers: needs great docs, stable contracts, auth, quotas and backward compatibility."],
          ["Internal API", "Used inside the organisation: still needs contracts, auth, versioning and observability."],
          ["Partner API", "For approved partners, under controlled credentials, permissions and agreements."],
          ["Composite API", "Combines several operations into one call to save client round trips."],
        ]} />
      </Sec>

      {/* 03 */}
      <Sec id="http-foundation" n={3} eyebrow="HTTP" title="The HTTP foundation" lead="Most web APIs run on HTTP. Understand HTTP and REST stops being mysterious.">
        <Cards items={[
          ["URL", "Where the request goes: https://api.example.com/api/v1/users/42?include=orders", Globe],
          ["Method", "What you intend: GET, POST, PUT, PATCH, DELETE.", PaperPlaneTilt],
          ["Headers", "Metadata: Authorization, Accept, Content-Type, Cache-Control, X-Request-ID.", Key],
          ["Body", "Optional content, usually JSON, but also form data, XML or binary.", Code],
        ]} />
        <Table caption="Anatomy of a URL" head={["Part", "Example", "Meaning"]} rows={[
          ["Scheme", "https", "The protocol."],
          ["Host", "api.example.com", "The server's domain."],
          ["Base path", "/api/v1", "Common prefix, often with the version."],
          ["Resource", "/users", "The collection."],
          ["Resource ID", "/42", "One item in it."],
          ["Query string", "?include=orders", "Options that shape the response."],
        ]} />
      </Sec>

      {/* 04 */}
      <Sec id="request-response" n={4} eyebrow="HTTP messages" title="The request and response lifecycle" lead="Every API interaction is two messages: the client's request and the server's response.">
        <CodeBlock title="Client → server" lang="http">{`
GET /api/v1/users/42?include=orders HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer <access-token>
X-Request-ID: req_f8270`}</CodeBlock>
        <CodeBlock title="Server → client" lang="http">{`
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: private, max-age=60
ETag: "user-42-v8"
X-Request-ID: req_f8270

{ "data": { "id": 42, "name": "Aman", "email": "aman@example.com" } }`}</CodeBlock>
        <Flow caption="What happens in between" steps={[
          { t: "User action", s: "Tap “View profile”", i: Users },
          { t: "Client", s: "Builds the HTTP request", i: Desktop },
          { t: "DNS + network", s: "Finds and reaches the server", i: Globe },
          { t: "API", s: "Authenticates, validates", i: Stack, tone: "hot" },
          { t: "Business logic", s: "Applies the rules", i: Cpu },
          { t: "Database / cache", i: Database },
          { t: "Response", s: "Status, headers, body", i: PaperPlaneTilt, tone: "good" },
        ]} />
      </Sec>

      {/* 05 */}
      <Sec id="http-methods" n={5} eyebrow="HTTP semantics" title="HTTP methods" lead="Use each method for what it means. The method tells everyone (clients, caches, proxies, crawlers) what you intend.">
        <Table head={["Method", "Purpose", "Example", "Safe", "Idempotent", "Typical success"]} rows={[
          ["GET", "Read a resource or collection", "GET /api/v1/users/42", "Yes", "Yes", "200 OK"],
          ["POST", "Create, or run an operation", "POST /api/v1/orders", "No", "No*", "201 Created"],
          ["PUT", "Replace the whole resource", "PUT /api/v1/users/42", "No", "Yes", "200 / 204"],
          ["PATCH", "Change some fields", "PATCH /api/v1/users/42", "No", "Depends", "200 / 204"],
          ["DELETE", "Remove a resource", "DELETE /api/v1/users/42", "No", "Yes", "204 No Content"],
          ["HEAD", "Headers only, as GET would return", "HEAD /api/v1/books/100", "Yes", "Yes", "200 OK"],
          ["OPTIONS", "Discover allowed methods (CORS preflight)", "OPTIONS /api/v1/users", "Yes", "Yes", "204"],
        ]} />
        <Prose><p><strong>*</strong> POST becomes retry-safe with an <Mark>idempotency key</Mark>; see section 14.</p></Prose>
        <Cards items={[
          ["Safe", "Read-only semantics. GET must never delete data, charge a card or change an account.", ShieldCheck],
          ["Idempotent", "Repeating it has the same effect as sending it once, which is what lets clients retry after network failures.", ArrowsLeftRight],
        ]} />
        <CodeBlock title="Create a user" lang="http">{`
POST /api/v1/users
Content-Type: application/json
Authorization: Bearer <access-token>

{ "name": "Aman", "email": "aman@example.com" }`}</CodeBlock>
        <CodeBlock title="201 Created" lang="http">{`
HTTP/1.1 201 Created
Location: /api/v1/users/42
Content-Type: application/json

{ "data": { "id": 42, "name": "Aman", "email": "aman@example.com", "createdAt": "2026-11-18T10:30:00Z" } }`}</CodeBlock>
      </Sec>

      {/* 06 */}
      <Sec id="status-codes" n={6} eyebrow="HTTP responses" title="HTTP status codes" lead="The status code tells the client what kind of result it got, before it parses a single byte of the body.">
        <Cards cols={3} items={[
          ["1xx · informational", "Still processing, or switching protocols (101 for WebSocket)."],
          ["2xx · success", "200, 201, 202, 204, 206."],
          ["3xx · redirection", "301, 302, 304 Not Modified, 307, 308."],
          ["4xx · client error", "400, 401, 403, 404, 409, 422, 429."],
          ["5xx · server error", "500, 502, 503, 504."],
        ]} />
        <Table head={["Code", "Use it when"]} rows={[
          ["200 OK", "Success, with a body."],
          ["201 Created", "A new resource was created (add a Location header)."],
          ["202 Accepted", "Accepted for async processing; not finished yet."],
          ["204 No Content", "Success, nothing to return."],
          ["304 Not Modified", "The client's cached copy is still valid."],
          ["400 Bad Request", "Malformed request: invalid JSON, wrong types."],
          ["401 Unauthorized", "Not authenticated: missing or invalid credentials."],
          ["403 Forbidden", "Authenticated, but not allowed."],
          ["404 Not Found", "The resource doesn't exist (or is hidden from you)."],
          ["409 Conflict", "Clashes with the current state: duplicate, stale version."],
          ["422 Unprocessable Content", "Well-formed but semantically invalid."],
          ["429 Too Many Requests", "Over the rate limit (send Retry-After)."],
          ["500 Internal Server Error", "Unexpected failure on the server."],
          ["502 Bad Gateway", "A proxy got a bad response from upstream."],
          ["503 Service Unavailable", "Temporarily can't serve (overload, maintenance)."],
          ["504 Gateway Timeout", "A proxy didn't get a timely response from upstream."],
        ]} />
        <Call tone="interview" title="401 vs 403">401 means “who are you?”: log in again. 403 means “I know who you are, and the answer is no”: logging in again won't help.</Call>
      </Sec>

      {/* 07 */}
      <Sec id="rest" n={7} eyebrow="REST" title="What makes an API RESTful" lead="REST (representational state transfer) is an architectural style, not a protocol or a framework.">
        <Prose><p>A REST API exposes <strong>resources</strong> (users, products, orders), identifies them with URIs, and lets clients act on them through standard HTTP semantics. The response is a <Mark>representation</Mark> of the resource's state, usually JSON.</p></Prose>
        <Table head={["Constraint", "What it means"]} rows={[
          ["Client–server", "UI and data concerns are separated; each evolves independently behind the contract."],
          ["Stateless", "Each request carries everything needed; no server-side conversation state between requests."],
          ["Cacheable", "Responses say whether and how long they can be cached."],
          ["Uniform interface", "Consistent resource identifiers and standard method semantics everywhere."],
          ["Layered system", "Clients can't tell whether they reach the origin, a gateway, a proxy or a CDN."],
          ["Code on demand (optional)", "The server may send executable code to extend the client."],
        ]} />
        <Call tone="info" title="REST API vs RESTful API">The terms are used interchangeably. “RESTful” stresses that the API actually follows these constraints, rather than just speaking HTTP and JSON.</Call>
      </Sec>

      {/* 08 */}
      <Sec id="resource-design" n={8} eyebrow="REST design" title="Designing resources" lead="Start from the domain's nouns. HTTP already provides the verbs.">
        <Table head={["Avoid", "Prefer", "Why"]} rows={[
          ["GET /getAllUsers", "GET /users", "The method already says “get”."],
          ["POST /createUser", "POST /users", "Model the resource, not a CRUD verb."],
          ["GET /deleteUser?id=42", "DELETE /users/42", "GET must never be destructive."],
          ["/user/42/orders", "/users/42/orders", "Consistent plural collection names."],
          ["/api/users/getById/42", "/api/v1/users/42", "Path + method is enough."],
        ]} />
        <Cards items={[
          ["Collection", "/users: all users."],
          ["Single resource", "/users/42: one user."],
          ["Nested resource", "/users/42/orders: orders belonging to user 42."],
          ["Sub-resource", "/orders/9001/items: the items of order 9001."],
        ]} />
        <Call tone="tip" title="Actions that aren't CRUD">For real operations, use a sub-resource noun: <code>POST /orders/9001/cancellation</code> or <code>POST /payments/77/refunds</code>, rather than <code>/cancelOrder</code>.</Call>
      </Sec>

      {/* 09 */}
      <Sec id="parameters" n={9} eyebrow="Request design" title="Path, query, header and body" lead="Four places to put information in a request, each with a clear job.">
        <Table head={["Where", "Example", "Use it for"]} rows={[
          ["Path", "GET /users/42", "Identity: which resource"],
          ["Query", "GET /products?page=2&sort=-price", "Filtering, search, sort, pagination, shape"],
          ["Header", "Authorization: Bearer <token>", "Metadata: auth, content type, idempotency, tracing"],
          ["Body", "{ \"name\": \"Aman\" }", "The data you're creating or changing"],
        ]} />
        <Call tone="ok" title="The easy rule">If the value tells you <strong>which</strong> resource, it goes in the path. If it changes <strong>how</strong> you select or shape the result, it goes in the query.</Call>
      </Sec>

      {/* 10 */}
      <Sec id="errors" n={10} eyebrow="Contract design" title="Consistent responses and errors" lead="Predictable shapes for success, and errors a program can act on.">
        <Compare
          left={{ tone: "plain", title: "Single resource", items: ["{ \"data\": { \"id\": 42, \"name\": \"Aman\" } }"] }}
          right={{ tone: "plain", title: "Collection", items: ["{ \"data\": [ … ],", "  \"pagination\": { \"nextCursor\": \"…\", \"hasNext\": true } }"] }}
        />
        <CodeBlock title="A structured error" lang="json">{`
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "requestId": "req_f8270",
    "details": [ { "field": "email", "message": "A valid email address is required." } ]
  }
}`}</CodeBlock>
        <Compare
          left={{ tone: "bad", title: "Unhelpful", items: ["{ \"error\": \"Something went wrong\" }", "HTTP 200 for every failure", "Stack traces in the response"] }}
          right={{ tone: "good", title: "Useful", items: ["Correct status code", "Stable machine-readable code", "Readable message + field details", "A request ID for support"] }}
        />
        <Call tone="warn" title="Never expose">Database credentials, tokens, private keys, stack traces, raw SQL or infrastructure details in an error response. Log them server-side, against the request ID.</Call>
        <Prose><p>Keep field names and types stable: changing a string to an object, or renaming a field, breaks clients silently. Many teams adopt <strong>RFC 9457 problem details</strong> (<code>application/problem+json</code>) as a standard error shape.</p></Prose>
      </Sec>

      {/* 11 */}
      <Sec id="pagination" n={11} eyebrow="Scalability" title="Pagination" lead="Never return an unbounded collection that can grow.">
        <CodeBlock title="Offset / page pagination" lang="http">{`
GET /api/v1/products?page=3&limit=20

{ "data": [ … ],
  "pagination": { "page": 3, "limit": 20, "totalItems": 242, "totalPages": 13, "hasNext": true } }`}</CodeBlock>
        <CodeBlock title="Cursor pagination" lang="http">{`
GET /api/v1/feed?limit=20&after=eyJpZCI6OTg3fQ

{ "data": [ … ],
  "pageInfo": { "nextCursor": "eyJpZCI6MTAwN30", "hasNextPage": true } }`}</CodeBlock>
        <Table head={["", "Offset", "Cursor"]} rows={[
          ["Jump to page N", "Easy", "Not directly"],
          ["Deep pages, big data", "Gets slow", "Stays fast"],
          ["Data changing underneath", "May skip or duplicate", "Stable with a proper sort key"],
          ["Implementation", "Simple", "More design work"],
        ]} />
        <Call tone="tip" title="Always cap the page size">Enforce a maximum limit (say 100) on the server, whatever the client asks for, and make cursors opaque so clients don't depend on their contents.</Call>
      </Sec>

      {/* 12 */}
      <Sec id="filtering" n={12} eyebrow="Collections" title="Filtering, sorting, search and field selection" lead="Let clients ask for exactly the slice they need, through documented query parameters.">
        <CodeBlock title="One possible design" lang="http">{`
GET /api/v1/products
    ?category=books
    &minPrice=100&maxPrice=1000
    &sort=-createdAt,price
    &fields=id,title,price
    &search=system+design`}</CodeBlock>
        <Cards items={[
          ["Filtering", "?status=PAID&currency=INR"],
          ["Sorting", "?sort=-createdAt,price (minus = descending, if documented)"],
          ["Search", "?search=system+design"],
          ["Sparse fields", "?fields=id,title,price to shrink responses"],
        ]} />
        <Call tone="warn" title="Allow-list everything">Only accept known sort and filter fields, and map them to indexed columns. Passing raw client fields into SQL invites slow queries and injection.</Call>
      </Sec>

      {/* 13 */}
      <Sec id="versioning" n={13} eyebrow="Compatibility" title="API versioning" lead="Versions give breaking changes a controlled path. Most changes shouldn't need one.">
        <Cards cols={3} items={[
          ["URI versioning", "/api/v1/users: visible and simple; the most common."],
          ["Header versioning", "API-Version: 2026-09-01: clean URLs, less visible."],
          ["Media-type versioning", "Accept: application/vnd.app.v2+json: via content negotiation."],
        ]} />
        <Compare
          left={{ tone: "good", title: "Usually backward-compatible", items: ["Adding an optional response field", "Adding a new endpoint", "Adding an optional request parameter"] }}
          right={{ tone: "bad", title: "Breaking", items: ["Removing or renaming a field", "Changing a field's type or meaning", "Making an optional request field required", "Changing an error code clients rely on"] }}
        />
        <Call tone="info" title="Deprecate politely">Announce, set a <code>Deprecation</code> or <code>Sunset</code> header, keep the old version running for a published window, and watch traffic before switching it off.</Call>
      </Sec>

      {/* 14 */}
      <Sec id="idempotency" n={14} eyebrow="Distributed systems" title="Idempotency and safe retries" lead="Networks fail at the worst moment: the server did the work, but the response never arrived.">
        <Flow caption="How a duplicate payment happens" steps={[
          { t: "Client sends the payment", i: Desktop },
          { t: "Server charges the card", i: Stack, tone: "good" },
          { t: "Response is lost", i: Broadcast, tone: "bad" },
          { t: "Client retries", s: "Without protection: a second charge", i: Desktop, tone: "bad" },
        ]} />
        <CodeBlock title="POST with an idempotency key" lang="http">{`
POST /api/v1/payments
Idempotency-Key: pay_01928475
Content-Type: application/json

{ "orderId": "ORD-8429", "amount": 19900, "currency": "INR" }`}</CodeBlock>
        <Steps items={[
          ["Receive the key", "Scope it to the caller (merchant + key)."],
          ["Look it up atomically", "Insert-if-absent so two concurrent retries can't both proceed."],
          ["Already done?", "Return the stored status and body, unchanged."],
          ["Otherwise, do the work once", "Process the payment."],
          ["Store the result", "Keep it for a defined window (e.g. 24 hours)."],
        ]} />
        <Call tone="warn" title="Same key, different body?">Reject it with 422 or 409. A reused key must mean the exact same request; otherwise a client bug could silently return the wrong result.</Call>
      </Sec>

      {/* 15 */}
      <Sec id="authentication" n={15} eyebrow="Security" title="Authentication and authorization" lead="Authentication answers “who are you?”. Authorization answers “what may you do?”.">
        <Specs items={[
          { title: "API key", tag: "Identifies an application", facts: [["How", "X-API-Key: sk_live_…"], ["Use for", "Server-to-server and developer APIs. Never ship it in frontend code."]] },
          { title: "Bearer token / JWT", tag: "Signed access token", facts: [["How", "Authorization: Bearer eyJhbGciOi…"], ["Use for", "Stateless APIs; short expiry plus refresh tokens."]] },
          { title: "Session cookie", tag: "Server-side session", facts: [["How", "A Secure, HttpOnly, SameSite cookie holding a session ID."], ["Use for", "Browser apps; easy revocation."]] },
          { title: "OAuth 2.0 / OpenID Connect", tag: "Delegated access + login", facts: [["How", "An authorization server issues access (and ID) tokens."], ["Use for", "“Sign in with Google”; third-party access to your API."]] },
        ]} />
        <Flow caption="A bearer-token request" steps={[
          { t: "User signs in", i: Users },
          { t: "Identity provider", s: "Issues an access token", i: Key },
          { t: "Client", s: "Sends Authorization: Bearer …", i: Desktop },
          { t: "API", s: "Verifies signature, expiry, audience, scopes", i: ShieldCheck, tone: "hot" },
          { t: "Protected resource", i: Database, tone: "good" },
        ]} />
        <H3>Authorization models</H3>
        <Cards cols={3} items={[
          ["RBAC", "Role-based: permissions attach to roles such as ADMIN, EDITOR, USER."],
          ["ABAC", "Attribute-based: decisions use attributes like department, owner, region, time."],
          ["Resource ownership", "May user 42 read /users/42/orders? Only if they are user 42, or have a permitted relationship."],
        ]} />
        <Call tone="warn" title="Broken object-level authorization">Knowing an ID doesn't grant access to it. Check ownership or permission on <strong>every</strong> request for a protected resource. This is the #1 item on the OWASP API Security Top 10.</Call>
      </Sec>

      {/* 16 */}
      <Sec id="security" n={16} eyebrow="Security" title="API security and CORS" lead="A checklist for every API, then the browser rule that confuses everyone.">
        <Cards items={[
          ["HTTPS everywhere", "TLS protects credentials and data in transit.", ShieldCheck],
          ["Validate all input", "Type, size, range and format; treat every client as untrusted.", ShieldCheck],
          ["Authorize every resource", "IDs are not permissions.", ShieldCheck],
          ["Rate-limit sensitive routes", "Login, OTP, password reset, expensive endpoints.", ShieldCheck],
          ["Protect secrets", "Never in frontend bundles or Git; rotate them.", ShieldCheck],
          ["Short-lived credentials", "Limit the blast radius of a leak.", ShieldCheck],
          ["Audit important actions", "Who did what to which resource, and when.", ShieldCheck],
          ["Return only needed fields", "Don't serialise whole database entities.", ShieldCheck],
          ["Bound payloads", "Body size, JSON depth, GraphQL query cost.", ShieldCheck],
          ["Patch dependencies", "Frameworks, gateways and libraries.", ShieldCheck],
        ]} />
        <H3>CORS: cross-origin resource sharing</H3>
        <Flow across steps={[
          { t: "Browser", s: "app.targettrek.in", i: Globe },
          { t: "OPTIONS preflight", s: "May I PUT with these headers?", i: PaperPlaneTilt },
          { t: "API", s: "Access-Control-Allow-* headers", i: Stack, tone: "hot" },
          { t: "Actual request", i: PaperPlaneTilt, tone: "good" },
        ]} />
        <CodeBlock title="A CORS response" lang="http">{`
Access-Control-Allow-Origin: https://www.targettrek.in
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 600`}</CodeBlock>
        <Call tone="info" title="CORS is not security for your API">It's the browser protecting the <em>user</em> from other sites reading responses. curl, servers and attackers ignore it, so authentication and authorization still do the real work. Never combine <code>Allow-Origin: *</code> with credentials.</Call>
      </Sec>

      {/* 17 */}
      <Sec id="caching" n={17} eyebrow="Performance" title="Caching and ETags" lead="Don't redo work when a previous answer is still good.">
        <Flow steps={[
          { t: "Client", i: Desktop },
          { t: "CDN / cache", s: "Cache hit?", i: Lightning, tone: "hot" },
          { t: "API", s: "Only on a miss", i: Stack, via: "miss" },
          { t: "Database", i: Database },
        ]} />
        <CodeBlock title="Conditional request with an ETag" lang="http">{`
GET /api/v1/books/42
If-None-Match: "book-42-v12"

# unchanged →
HTTP/1.1 304 Not Modified
ETag: "book-42-v12"

# changed →
HTTP/1.1 200 OK
ETag: "book-42-v13"
Content-Type: application/json

{ "id": 42, "title": "System Design" }`}</CodeBlock>
        <Cards items={[
          ["Cache-Control", "public / private, max-age, no-store, stale-while-revalidate."],
          ["ETag + If-None-Match", "Validate a cached copy; 304 saves the whole body."],
          ["304 Not Modified", "“Your copy is fine”, with no body."],
          ["CDN / shared cache", "Public responses served near users; private ones never."],
        ]} />
        <Call tone="warn" title="Never publicly cache personal data">Responses that depend on the user (/me, /orders) must be <code>Cache-Control: private</code> or <code>no-store</code>, or a CDN may serve one user's data to another.</Call>
      </Sec>

      {/* 18 */}
      <Sec id="rate-limiting" n={18} eyebrow="Reliability" title="Rate limiting" lead="Control how often each caller may hit the API, to protect capacity, fairness and cost.">
        <Cards items={[
          ["Fixed window", "100 per minute; simple, but bursty at the boundaries."],
          ["Sliding window", "Counts over a rolling period for smoother limits."],
          ["Token bucket", "Refill at a rate, allow bursts up to capacity."],
          ["Leaky bucket", "Process at a steady output rate."],
        ]} />
        <CodeBlock title="429 with guidance" lang="http">{`
HTTP/1.1 429 Too Many Requests
Retry-After: 30
RateLimit-Limit: 100
RateLimit-Remaining: 0

{ "error": { "code": "RATE_LIMIT_EXCEEDED", "message": "Too many requests. Retry in 30 seconds." } }`}</CodeBlock>
        <Call tone="tip" title="Go deeper">Algorithms, Redis and Lua implementations and multi-region limits are covered in <Link className="rl-textlink" to="/resources/hld/rate-limiting">Rate limiting in system design</Link>.</Call>
      </Sec>

      {/* 19 */}
      <Sec id="graphql" n={19} eyebrow="GraphQL" title="GraphQL, and when to choose it over REST" lead="A typed schema, one endpoint, and clients that ask for exactly the fields they need.">
        <Cards cols={3} items={[
          ["Query", "Read data."],
          ["Mutation", "Change data or trigger side effects."],
          ["Subscription", "Receive updates as events happen."],
        ]} />
        <CodeBlock title="Schema" lang="graphql">{`
type User {
  id: ID!
  name: String!
  email: String!
  orders(first: Int, after: String): OrderConnection!
}

type Query    { user(id: ID!): User }
type Mutation { createUser(input: CreateUserInput!): User! }`}</CodeBlock>
        <CodeBlock title="Query: exactly these fields, one round trip" lang="graphql">{`
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    orders(first: 3) { nodes { id total status } }
  }
}`}</CodeBlock>
        <Compare
          left={{ tone: "good", title: "Why teams like it", items: ["Clients pick the fields they need", "Related data in one request", "A typed, introspectable schema", "Many UIs without new endpoints"] }}
          right={{ tone: "bad", title: "What you must handle", items: ["N+1 resolver queries (use DataLoader)", "Expensive nested queries (depth/cost limits)", "Per-field authorization", "Harder HTTP-level caching"] }}
        />
        <Table head={["", "REST", "GraphQL"]} rows={[
          ["Model", "Resources at URLs", "A typed graph behind one endpoint"],
          ["Data selection", "The server decides per endpoint", "The client selects fields"],
          ["Caching", "Natural with GET + URLs", "Needs client/app-level design"],
          ["Related data", "Several calls or custom endpoints", "One nested query"],
          ["Cost control", "Per-endpoint, easy to reason about", "Needs depth and complexity limits"],
          ["Best for", "Public, resource-oriented, cacheable APIs", "Rich clients with changing data needs"],
        ]} />
      </Sec>

      {/* 20 */}
      <Sec id="webhooks" n={20} eyebrow="Event integrations" title="Webhooks" lead="Instead of polling “anything new?”, the provider calls you when something happens.">
        <Flow steps={[
          { t: "Payment provider", s: "payment.success", i: Broadcast },
          { t: "POST /webhooks/payment", s: "Your public endpoint", i: WebhooksLogo, tone: "hot" },
          { t: "Verify signature", s: "HMAC over the raw body", i: ShieldCheck },
          { t: "Queue + return 2xx", s: "Process asynchronously", i: Stack, tone: "good" },
        ]} />
        <CodeBlock title="A webhook delivery" lang="http">{`
POST /webhooks/payment
X-Webhook-Id: evt_18273
X-Webhook-Timestamp: 1790767200
X-Webhook-Signature: sha256=5f2b…

{ "id": "evt_18273", "type": "payment.success", "data": { "orderId": "ORD-8429", "paymentId": "PAY-2901" } }`}</CodeBlock>
        <CodeBlock title="Verifying the signature (Node.js)" lang="js">{`
import crypto from "node:crypto";

export function verifyWebhook(rawBody, headers, secret) {
  const ts = Number(headers["x-webhook-timestamp"]);
  if (Math.abs(Date.now() / 1000 - ts) > 300) return false;          // reject replays > 5 min old

  const expected = crypto.createHmac("sha256", secret).update(\`\${ts}.\${rawBody}\`).digest("hex");
  const given = String(headers["x-webhook-signature"]).replace(/^sha256=/, "");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given));   // constant-time compare
}`}</CodeBlock>
        <Cards items={[
          ["Verify authenticity", "Signature over the raw body, plus a timestamp check.", ShieldCheck],
          ["Expect retries", "Deduplicate by event ID; handle events idempotently.", ArrowsLeftRight],
          ["Acknowledge fast", "Return 2xx quickly; queue the heavy work.", Lightning],
          ["Observe failures", "Track deliveries, signature failures and dead-lettered events.", Cpu],
        ]} />
        <Table head={["", "Polling", "Webhook"]} rows={[
          ["Direction", "Consumer asks repeatedly", "Provider pushes"],
          ["Latency", "Up to the polling interval", "Near real time"],
          ["Waste", "Many empty responses", "Traffic only on events"],
          ["Complexity", "Simple consumer", "Public endpoint, security, retries"],
        ]} />
      </Sec>

      {/* 21 */}
      <Sec id="other-api-styles" n={21} eyebrow="Beyond REST" title="RPC, gRPC, SOAP and WebSockets" lead="Other shapes of API, and where each one fits.">
        <CodeBlock title="RPC: operations, not resources" lang="http">{`
POST /calculateShipping
POST /generateInvoice
POST /approveLoan`}</CodeBlock>
        <CodeBlock title="gRPC: a typed service contract" lang="text">{`
service UserService {
  rpc GetUser (GetUserRequest) returns (UserResponse);
}`}</CodeBlock>
        <Cards cols={3} items={[
          ["gRPC", "Protocol Buffers over HTTP/2: compact, fast, strongly typed, with streaming. Great between services; needs a proxy for browsers.", Lightning],
          ["SOAP", "XML envelopes, WSDL contracts, WS-Security. Mostly legacy enterprise and banking.", Code],
          ["WebSocket", "One long-lived, two-way connection: chat, live prices, collaboration.", ArrowsLeftRight],
        ]} />
      </Sec>

      {/* 22 */}
      <Sec id="openapi" n={22} eyebrow="Documentation" title="OpenAPI and Swagger" lead="A machine-readable contract that drives docs, validation, SDKs, mocks and tests.">
        <CodeBlock title="openapi.yaml" lang="yaml">{`
openapi: 3.1.0
info:
  title: Target Trek Learning API
  version: 1.0.0
servers:
  - url: https://api.example.com
paths:
  /api/v1/users/{userId}:
    get:
      summary: Get a user
      operationId: getUser
      parameters:
        - name: userId
          in: path
          required: true
          schema: { type: integer }
      responses:
        "200":
          description: User found
          content:
            application/json:
              schema: { $ref: "#/components/schemas/User" }
        "404":
          description: User not found
components:
  schemas:
    User:
      type: object
      required: [id, name]
      properties:
        id:    { type: integer }
        name:  { type: string }
        email: { type: string, format: email }`}</CodeBlock>
        <Compare
          left={{ tone: "plain", title: "OpenAPI", items: ["The specification itself", "YAML or JSON", "Vendor-neutral standard"] }}
          right={{ tone: "plain", title: "Swagger", items: ["The original name, and a family of tools", "Swagger UI, Editor, Codegen", "Used to view and generate from OpenAPI"] }}
        />
        <Flow across caption="API-first workflow" steps={[
          { t: "Define the contract", i: Code }, { t: "Review", i: Users }, { t: "Docs + mocks", i: Globe }, { t: "Implement", i: Stack, tone: "hot" }, { t: "Contract tests + SDKs", i: ShieldCheck, tone: "good" },
        ]} />
      </Sec>

      {/* 23 */}
      <Sec id="gateway" n={23} eyebrow="System design" title="API gateway and observability" lead="The front door to your services, and the telemetry that tells you what happened when things go wrong.">
        <Flow steps={[
          { t: "Client", i: Desktop }, { t: "DNS / CDN", i: Globe }, { t: "Load balancer", i: TreeStructure },
          { t: "API gateway", s: "Auth · rate limit · route", i: ShieldCheck, tone: "hot" },
          { t: "Service", i: Stack }, { t: "Cache / database", i: Database },
        ]} />
        <Call tone="tip" title="Go deeper">Routing, JWT validation, BFFs, circuit breakers and gateway high availability are covered in <Link className="rl-textlink" to="/resources/hld/api-gateway">API gateway in system design</Link>.</Call>
        <H3>Observability: logs, metrics, traces</H3>
        <Cards cols={3} items={[
          ["Logs", "Structured events with request ID, route, status, latency, caller: never secrets."],
          ["Metrics", "Rate, errors and latency percentiles, aggregated over time."],
          ["Traces", "Follow one request across gateway, services, queues and databases."],
        ]} />
        <Chips label="API metrics" items={["Request rate", "p50 / p95 / p99 latency", "4xx rate", "5xx rate", "Timeout rate", "Upstream latency", "Cache hit rate", "429 rejections", "Database latency", "Queue depth"]} />
      </Sec>

      {/* 24 */}
      <Sec id="testing" n={24} eyebrow="Quality" title="Testing an API" lead="Layered tests, and far more than the happy path.">
        <Cards cols={3} items={[
          ["Unit", "Business rules and validation, fast and isolated."],
          ["Integration", "With a real database, cache and queue."],
          ["Contract", "Provider and consumers agree on requests and responses."],
          ["End-to-end", "Critical user flows across services."],
          ["Load", "Behaviour at expected and peak traffic."],
          ["Security", "Auth, access control, input handling."],
        ]} />
        <H3>Test the unhappy paths</H3>
        <Chips label="Negative test cases" items={["Missing token", "Expired or invalid token", "Another user's resource", "Invalid JSON", "Missing required field", "Wrong field type", "Unknown resource", "Duplicate request", "Concurrent update", "Rate limit exceeded", "Database down", "Upstream timeout", "Malformed cursor", "Page size over the max", "Duplicate webhook", "Bad webhook signature"]} />
        <CodeBlock title="cURL" lang="bash">{`
curl --request POST \\
  --url https://api.example.com/api/v1/users \\
  --header "Authorization: Bearer <token>" \\
  --header "Content-Type: application/json" \\
  --data '{ "name": "Aman", "email": "aman@example.com" }'`}</CodeBlock>
        <CodeBlock title="Calling an API from the frontend" lang="js">{`
const res = await fetch("https://api.example.com/api/v1/users/42", {
  headers: { Accept: "application/json", Authorization: \`Bearer \${token}\` },
});
if (!res.ok) {
  const { error } = await res.json().catch(() => ({}));
  throw new Error(\`\${res.status}: \${error?.code ?? "REQUEST_FAILED"}\`);
}
const { data } = await res.json();`}</CodeBlock>
      </Sec>

      {/* 25 */}
      <Sec id="production-design" n={25} eyebrow="Backend" title="Putting it all together" lead="A production API is more than a controller wired straight to a database. Each layer has one job.">
        <Flow across caption="Inside the service" steps={[
          { t: "Controller", s: "HTTP in/out", i: Path }, { t: "Validation", i: ShieldCheck }, { t: "Authorization", i: Lock }, { t: "Service layer", s: "Business rules", i: Cpu, tone: "hot" }, { t: "Repository", i: Database },
        ]} />
        <Cards items={[
          ["Controller", "Translates HTTP into input and output. Keep business logic out."],
          ["Service layer", "Business workflows and domain rules."],
          ["Repository / DAO", "All persistence access in one place."],
          ["DTOs", "Public request/response models, separate from database entities."],
        ]} />
        <CodeBlock title="UserController.java (Spring Boot)" lang="java">{`
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
  private final UserService userService;
  public UserController(UserService userService) { this.userService = userService; }

  @GetMapping("/{id}")
  public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
    return ResponseEntity.ok(userService.getById(id));
  }

  @PostMapping
  public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
    UserResponse created = userService.create(request);
    return ResponseEntity.created(URI.create("/api/v1/users/" + created.id())).body(created);
  }
}`}</CodeBlock>
        <H3>Concurrent updates</H3>
        <CodeBlock title="Optimistic concurrency" lang="sql">{`
-- A and B both read version 8. A saves first → version 9.
UPDATE users SET name = 'New Name', version = 9
WHERE  id = 42 AND version = 8;
-- B's update matches 0 rows → return 409 Conflict (or 412 with If-Match / ETag)`}</CodeBlock>
        <H3>Timeouts, retries and circuit breakers</H3>
        <Cards cols={3} items={[
          ["Timeout", "Never wait forever on a dependency; bound every call."],
          ["Retry", "Only when safe; bounded, with exponential backoff and jitter."],
          ["Circuit breaker", "Stop calling a dependency that keeps failing; fail fast while it recovers."],
        ]} />
      </Sec>

      {/* 26 */}
      <Sec id="checklist" n={26} eyebrow="Revision" title="Production API checklist" lead="Run through this before you ship an endpoint.">
        <Steps items={[
          ["Naming", "Consistent resource names; methods used for their meaning."],
          ["Status codes", "Correct codes, including 201, 204, 401 vs 403, 409, 422, 429."],
          ["Validation", "Every input checked for type, size and range."],
          ["Auth", "Authenticated where required; authorization checked per resource."],
          ["Transport", "HTTPS only; no sensitive fields leaked in responses."],
          ["Errors", "One predictable error shape with codes and request IDs."],
          ["Collections", "Bounded pagination; documented filters and sort."],
          ["Compatibility", "Additive changes; a versioning and deprecation plan."],
          ["Retries", "Idempotency keys on retry-sensitive writes."],
          ["Protection", "Rate limits on capacity and sensitive routes."],
          ["Caching", "Explicit Cache-Control; private data never public."],
          ["Resilience", "Timeouts on every dependency; bounded, safe retries."],
          ["Concurrency", "Conflicting updates detected (versions / ETags)."],
          ["Webhooks", "Signatures verified; duplicates handled."],
          ["Observability", "Request IDs in logs; latency, errors and traffic monitored."],
          ["Docs and tests", "OpenAPI matches reality; contract and integration tests guard it."],
        ]} />
        <Call tone="interview" title="the final mental model">Good APIs are contracts, not just URLs. REST, GraphQL and gRPC are tools; the engineering is in the semantics, the failure modes and the trade-offs behind them.</Call>
      </Sec>
    </ReaderPage>
  );
}
