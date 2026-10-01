import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Boxes,
  Braces,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clipboard,
  ClipboardCheck,
  Clock3,
  Cloud,
  Code2,
  Database,
  FileCode2,
  Filter,
  Gauge,
  GitBranch,
  Globe2,
  Hash,
  KeyRound,
  Layers3,
  Link2,
  ListFilter,
  LockKeyhole,
  Network,
  PackageCheck,
  RefreshCcw,
  Repeat2,
  Route,
  Search,
  Send,
  Server,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Unplug,
  Users,
  Webhook,
  Workflow,
  XCircle,
  Zap,
} from "lucide-react";

const SITE_URL = "https://www.targettrek.in";
const PAGE_PATH = "/resource/api";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const sections = [
  { id: "introduction", label: "What is an API?" },
  { id: "api-types", label: "Types of APIs" },
  { id: "http-foundation", label: "HTTP Foundation" },
  { id: "request-response", label: "Request & Response" },
  { id: "http-methods", label: "HTTP Methods" },
  { id: "status-codes", label: "Status Codes" },
  { id: "rest", label: "REST & RESTful APIs" },
  { id: "resource-design", label: "Resource Design" },
  { id: "parameters", label: "API Parameters" },
  { id: "responses", label: "Response Design" },
  { id: "errors", label: "Error Handling" },
  { id: "pagination", label: "Pagination" },
  { id: "filtering", label: "Filtering & Sorting" },
  { id: "versioning", label: "Versioning" },
  { id: "idempotency", label: "Idempotency" },
  { id: "authentication", label: "Authentication" },
  { id: "authorization", label: "Authorization" },
  { id: "security", label: "API Security" },
  { id: "cors", label: "CORS" },
  { id: "caching", label: "Caching" },
  { id: "rate-limiting", label: "Rate Limiting" },
  { id: "graphql", label: "GraphQL" },
  { id: "rest-vs-graphql", label: "REST vs GraphQL" },
  { id: "webhooks", label: "Webhooks" },
  { id: "other-api-styles", label: "Other API Styles" },
  { id: "openapi", label: "OpenAPI / Swagger" },
  { id: "gateway", label: "API Gateway" },
  { id: "observability", label: "Observability" },
  { id: "testing", label: "API Testing" },
  { id: "production-design", label: "Production Design" },
  { id: "interview", label: "Interview Questions" },
  { id: "checklist", label: "API Checklist" },
];

const httpMethods = [
  {
    method: "GET",
    purpose: "Read a resource or collection.",
    example: "GET /api/v1/users/42",
    safe: "Yes",
    idempotent: "Yes",
    typical: "200 OK",
    note: "Should not intentionally change application state.",
  },
  {
    method: "POST",
    purpose: "Create a resource or execute an operation.",
    example: "POST /api/v1/orders",
    safe: "No",
    idempotent: "No*",
    typical: "201 Created",
    note: "Can be made retry-safe with an idempotency key.",
  },
  {
    method: "PUT",
    purpose: "Replace the complete representation of a resource.",
    example: "PUT /api/v1/users/42",
    safe: "No",
    idempotent: "Yes",
    typical: "200 / 204",
    note: "Repeated identical requests should have the same intended effect.",
  },
  {
    method: "PATCH",
    purpose: "Partially update a resource.",
    example: "PATCH /api/v1/users/42",
    safe: "No",
    idempotent: "Depends",
    typical: "200 / 204",
    note: "Updates selected fields instead of replacing the complete resource.",
  },
  {
    method: "DELETE",
    purpose: "Remove a resource.",
    example: "DELETE /api/v1/users/42",
    safe: "No",
    idempotent: "Yes",
    typical: "204 No Content",
    note: "Deleting an already deleted resource should not create another effect.",
  },
  {
    method: "HEAD",
    purpose: "Get headers that a GET request would return.",
    example: "HEAD /api/v1/books/100",
    safe: "Yes",
    idempotent: "Yes",
    typical: "200 OK",
    note: "Useful for metadata and availability checks.",
  },
  {
    method: "OPTIONS",
    purpose: "Discover communication options for a resource.",
    example: "OPTIONS /api/v1/users",
    safe: "Yes",
    idempotent: "Yes",
    typical: "200 / 204",
    note: "Frequently appears in browser CORS preflight requests.",
  },
];

const statusGroups = [
  {
    range: "1xx",
    title: "Informational",
    description:
      "The request is still being processed or the protocol is changing.",
    examples: ["100 Continue", "101 Switching Protocols"],
  },
  {
    range: "2xx",
    title: "Success",
    description: "The server successfully processed the request.",
    examples: [
      "200 OK",
      "201 Created",
      "202 Accepted",
      "204 No Content",
      "206 Partial Content",
    ],
  },
  {
    range: "3xx",
    title: "Redirection",
    description:
      "The client may need another request or can reuse a cached representation.",
    examples: [
      "301 Moved Permanently",
      "302 Found",
      "304 Not Modified",
      "307 Temporary Redirect",
      "308 Permanent Redirect",
    ],
  },
  {
    range: "4xx",
    title: "Client Error",
    description:
      "Something about the request, authentication, permissions or requested resource is invalid.",
    examples: [
      "400 Bad Request",
      "401 Unauthorized",
      "403 Forbidden",
      "404 Not Found",
      "409 Conflict",
      "422 Unprocessable Content",
      "429 Too Many Requests",
    ],
  },
  {
    range: "5xx",
    title: "Server Error",
    description:
      "The server or an upstream dependency failed while serving a valid request.",
    examples: [
      "500 Internal Server Error",
      "502 Bad Gateway",
      "503 Service Unavailable",
      "504 Gateway Timeout",
    ],
  },
];

const apiStyles = [
  {
    name: "REST",
    icon: Route,
    summary:
      "Resource-oriented API style commonly built on HTTP methods, URLs and representations such as JSON.",
    usefulFor:
      "Public APIs, CRUD services, microservices, mobile/web backends and general HTTP services.",
  },
  {
    name: "GraphQL",
    icon: GitBranch,
    summary:
      "A typed query language where clients specify the fields they need from a schema.",
    usefulFor:
      "Complex frontend data requirements, multiple related resources and rapidly changing clients.",
  },
  {
    name: "RPC",
    icon: Send,
    summary:
      "Treats the API as a collection of remote operations such as createInvoice or calculatePrice.",
    usefulFor:
      "Action-heavy internal services where operations are more natural than resources.",
  },
  {
    name: "gRPC",
    icon: Zap,
    summary:
      "High-performance RPC commonly using Protocol Buffers and HTTP/2.",
    usefulFor:
      "Low-latency service-to-service communication and strongly typed internal systems.",
  },
  {
    name: "SOAP",
    icon: FileCode2,
    summary:
      "XML-based messaging protocol with formal contracts and enterprise-oriented standards.",
    usefulFor:
      "Legacy enterprise systems and environments requiring established WS-* standards.",
  },
  {
    name: "WebSocket",
    icon: ArrowLeftRight,
    summary:
      "Persistent bidirectional connection between client and server.",
    usefulFor:
      "Chat, multiplayer systems, collaboration, trading dashboards and realtime communication.",
  },
  {
    name: "Webhook",
    icon: Webhook,
    summary:
      "Server-to-server callback where one system pushes an event to another system.",
    usefulFor:
      "Payment updates, Git events, order events, email delivery events and asynchronous integrations.",
  },
];

const restConstraints = [
  {
    title: "Client–Server",
    text: "UI/client concerns and server/data concerns are separated. Either side can evolve independently as long as the contract remains compatible.",
  },
  {
    title: "Stateless",
    text: "Every request should contain the information needed to process it. The server should not depend on conversational client session state between requests.",
  },
  {
    title: "Cacheable",
    text: "Responses should communicate whether they may be cached. Correct caching can reduce latency, server load and bandwidth.",
  },
  {
    title: "Uniform Interface",
    text: "Resources use consistent identifiers and standard interaction semantics so clients do not need resource-specific transport behavior.",
  },
  {
    title: "Layered System",
    text: "The client does not need to know whether it communicates directly with the origin server, an API gateway, proxy, CDN or another intermediary.",
  },
  {
    title: "Code on Demand",
    text: "An optional REST constraint allowing a server to extend client functionality by transferring executable code.",
  },
];

const restBadGood = [
  {
    bad: "GET /getAllUsers",
    good: "GET /users",
    reason: "The HTTP method already communicates the action.",
  },
  {
    bad: "POST /createUser",
    good: "POST /users",
    reason: "Model the endpoint as a resource rather than a CRUD verb.",
  },
  {
    bad: "GET /deleteUser?id=42",
    good: "DELETE /users/42",
    reason: "GET should not be used to request destructive operations.",
  },
  {
    bad: "/user/42/orders",
    good: "/users/42/orders",
    reason: "Use consistent resource naming conventions.",
  },
  {
    bad: "/api/users/getById/42",
    good: "/api/v1/users/42",
    reason: "Resource path + HTTP method is generally enough.",
  },
];

const interviewQuestions = [
  "What is an API and why is an API contract important?",
  "What is REST and what makes an API RESTful?",
  "REST vs REST API vs RESTful API — are they exactly the same thing?",
  "What is the difference between URI and URL?",
  "GET vs POST vs PUT vs PATCH?",
  "Why is GET considered safe?",
  "What does idempotent mean?",
  "Is POST idempotent?",
  "Why is DELETE considered idempotent?",
  "What is the difference between 401 and 403?",
  "When should you return 400, 409 or 422?",
  "When should an API return 200 vs 201 vs 202 vs 204?",
  "What are path parameters and query parameters?",
  "Offset pagination vs cursor pagination?",
  "How would you version an API?",
  "What is an idempotency key and why do payment APIs use one?",
  "JWT vs session authentication?",
  "Authentication vs authorization?",
  "OAuth 2.0 vs OpenID Connect?",
  "What is CORS and why does the browser enforce it?",
  "What is a CORS preflight request?",
  "What is rate limiting?",
  "Token bucket vs fixed window vs sliding window?",
  "What does Cache-Control do?",
  "What are ETag and If-None-Match?",
  "What is GraphQL?",
  "GraphQL query vs mutation vs subscription?",
  "REST vs GraphQL — when would you use each?",
  "What is the N+1 problem in GraphQL?",
  "What is an API Gateway?",
  "API Gateway vs Load Balancer?",
  "What are webhooks?",
  "Webhook vs polling?",
  "How do you secure a webhook?",
  "What is OpenAPI?",
  "OpenAPI vs Swagger?",
  "How would you design a production-ready payment API?",
  "How do you safely retry failed API calls?",
  "How do you handle concurrent updates?",
  "How would you observe and debug an API in production?",
];

const faqs = [
  {
    question: "What is an API?",
    answer:
      "An API is a defined interface that allows software systems to communicate through an agreed contract of operations, inputs, outputs and behavior.",
  },
  {
    question: "What is a REST API?",
    answer:
      "A REST API is an API designed around REST architectural ideas, usually exposing resources over HTTP and using standard HTTP semantics.",
  },
  {
    question: "What is a RESTful API?",
    answer:
      "RESTful commonly describes an API that follows REST constraints and models interactions consistently around resources.",
  },
  {
    question: "What is the difference between PUT and PATCH?",
    answer:
      "PUT conventionally represents replacement of the resource representation, while PATCH applies partial modifications.",
  },
  {
    question: "What is GraphQL?",
    answer:
      "GraphQL is a query language and execution model for APIs where a schema defines available types and clients request selected fields.",
  },
  {
    question: "What is API idempotency?",
    answer:
      "An operation is idempotent when making the same request repeatedly has the same intended server-side effect as making it once.",
  },
];

const requestExample = `GET /api/v1/users/42?include=orders HTTP/1.1
Host: api.example.com
Accept: application/json
Authorization: Bearer <access-token>
X-Request-ID: req_f8270`;

const responseExample = `HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: private, max-age=60
ETag: "user-42-v8"
X-Request-ID: req_f8270

{
  "data": {
    "id": 42,
    "name": "Aman",
    "email": "aman@example.com"
  }
}`;

const createUserExample = `POST /api/v1/users
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "name": "Aman",
  "email": "aman@example.com"
}`;

const createUserResponse = `HTTP/1.1 201 Created
Location: /api/v1/users/42
Content-Type: application/json

{
  "data": {
    "id": 42,
    "name": "Aman",
    "email": "aman@example.com",
    "createdAt": "2026-09-30T10:30:00Z"
  }
}`;

const errorResponse = `{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "requestId": "req_f8270",
    "details": [
      {
        "field": "email",
        "message": "A valid email address is required."
      }
    ]
  }
}`;

const offsetPaginationExample = `GET /api/v1/products?page=3&limit=20

{
  "data": [...],
  "pagination": {
    "page": 3,
    "limit": 20,
    "totalItems": 242,
    "totalPages": 13,
    "hasNext": true,
    "hasPrevious": true
  }
}`;

const cursorPaginationExample = `GET /api/v1/feed?limit=20&after=eyJpZCI6OTg3fQ

{
  "data": [...],
  "pageInfo": {
    "nextCursor": "eyJpZCI6MTAwN30",
    "hasNextPage": true
  }
}`;

const filteringExample = `GET /api/v1/products
  ?category=books
  &minPrice=100
  &maxPrice=1000
  &sort=-createdAt
  &fields=id,title,price
  &search=system+design`;

const idempotencyExample = `POST /api/v1/payments
Idempotency-Key: pay_01928475
Content-Type: application/json

{
  "orderId": "ORD-8429",
  "amount": 19900,
  "currency": "INR"
}`;

const jwtExample = `Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

GET /api/v1/profile`;

const apiKeyExample = `GET /api/v1/weather
X-API-Key: sk_live_xxxxxxxxx`;

const cacheExample = `GET /api/v1/books/42
If-None-Match: "book-42-v12"

# If unchanged:
HTTP/1.1 304 Not Modified
ETag: "book-42-v12"

# If changed:
HTTP/1.1 200 OK
ETag: "book-42-v13"
Content-Type: application/json

{
  "id": 42,
  "title": "System Design"
}`;

const rateLimitHeadersExample = `HTTP/1.1 429 Too Many Requests
Retry-After: 30
RateLimit-Limit: 100
RateLimit-Remaining: 0

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Retry later."
  }
}`;

const graphqlSchemaExample = `type User {
  id: ID!
  name: String!
  email: String!
  orders(first: Int, after: String): OrderConnection!
}

type Order {
  id: ID!
  total: Float!
  status: OrderStatus!
}

type Query {
  user(id: ID!): User
  users(first: Int, after: String): UserConnection!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
}

type Subscription {
  orderStatusChanged(orderId: ID!): Order!
}`;

const graphqlQueryExample = `query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
    orders(first: 3) {
      nodes {
        id
        total
        status
      }
    }
  }
}`;

const graphqlResponseExample = `{
  "data": {
    "user": {
      "id": "42",
      "name": "Aman",
      "email": "aman@example.com",
      "orders": {
        "nodes": [
          {
            "id": "ORD-101",
            "total": 199,
            "status": "PAID"
          }
        ]
      }
    }
  }
}`;

const graphqlMutationExample = `mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
  }
}`;

const webhookExample = `POST /webhooks/payment
X-Webhook-Id: evt_18273
X-Webhook-Timestamp: 1790767200
X-Webhook-Signature: sha256=...

{
  "id": "evt_18273",
  "type": "payment.success",
  "data": {
    "orderId": "ORD-8429",
    "paymentId": "PAY-2901"
  }
}`;

const openApiExample = `openapi: 3.2.0

info:
  title: Target Trek Learning API
  version: 1.0.0
  description: Example API used for learning REST concepts.

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
          schema:
            type: integer

      responses:
        "200":
          description: User found
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/User"

        "404":
          description: User not found

components:
  schemas:
    User:
      type: object
      required:
        - id
        - name

      properties:
        id:
          type: integer

        name:
          type: string

        email:
          type: string`;

const curlExample = `curl --request POST \\
  --url https://api.example.com/api/v1/users \\
  --header "Authorization: Bearer <token>" \\
  --header "Content-Type: application/json" \\
  --data '{
    "name": "Aman",
    "email": "aman@example.com"
  }'`;

const fetchExample = `const response = await fetch(
  "https://api.example.com/api/v1/users/42",
  {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: \`Bearer \${accessToken}\`,
    },
  }
);

if (!response.ok) {
  throw new Error(\`Request failed: \${response.status}\`);
}

const result = await response.json();
console.log(result);`;

const springExample = `@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(
            @PathVariable Long id
    ) {
        UserResponse user = userService.getById(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request
    ) {
        UserResponse created = userService.create(request);

        URI location = URI.create(
            "/api/v1/users/" + created.id()
        );

        return ResponseEntity
                .created(location)
                .body(created);
    }
}`;

const apiGatewayFlow = [
  "Client",
  "DNS / CDN",
  "Load Balancer",
  "API Gateway",
  "Authentication",
  "Rate Limiter",
  "Service",
  "Cache / Database",
];

function readStoredTheme() {
  if (typeof window === "undefined") return "light";

  const savedTheme = window.localStorage.getItem("theme");
  return savedTheme === "dark" ? "dark" : "light";
}

function useThemeFromLocalStorage() {
  const [theme, setTheme] = useState(() => readStoredTheme());

  useEffect(() => {
    const syncTheme = (eventTheme) => {
      const nextTheme =
        eventTheme === "dark" || eventTheme === "light"
          ? eventTheme
          : readStoredTheme();

      setTheme((currentTheme) =>
        currentTheme === nextTheme ? currentTheme : nextTheme
      );
    };

    const handleStorage = (event) => {
      if (!event.key || event.key === "theme") {
        syncTheme();
      }
    };

    const handleThemeChange = (event) => {
      const eventTheme =
        event?.detail?.theme ||
        (typeof event?.detail === "string" ? event.detail : null);

      syncTheme(eventTheme);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) syncTheme();
    };

    syncTheme();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("targettrek-theme-change", handleThemeChange);
    window.addEventListener("themechange", handleThemeChange);
    window.addEventListener("focus", syncTheme);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Same-tab fallback for Navbars that only update localStorage.
    const interval = window.setInterval(() => {
      syncTheme();
    }, 250);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("targettrek-theme-change", handleThemeChange);
      window.removeEventListener("themechange", handleThemeChange);
      window.removeEventListener("focus", syncTheme);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(interval);
    };
  }, []);

  return theme;
}

const API_THEME_CSS = `
  .api-resource {
    color-scheme: light;
  }

  .api-resource[data-theme="dark"] {
    color-scheme: dark;
  }

  /*
    IMPORTANT:
    This page intentionally does not use Tailwind dark:* variants.
    The theme is fully scoped to this page through data-theme so an old
    .dark class on <html>, <body>, App, or Navbar cannot create mixed colors.
  */

  .api-resource[data-theme="dark"] [class~="bg-white"] {
    background-color: #0f172a !important;
  }

  .api-resource[data-theme="dark"] [class~="bg-slate-50"] {
    background-color: #111827 !important;
  }

  .api-resource[data-theme="dark"] [class~="bg-slate-100"] {
    background-color: #1e293b !important;
  }

  .api-resource[data-theme="dark"] [class~="border-slate-200"],
  .api-resource[data-theme="dark"] [class~="border-slate-300"] {
    border-color: #334155 !important;
  }

  .api-resource[data-theme="dark"] [class~="border-slate-700"],
  .api-resource[data-theme="dark"] [class~="border-slate-800"] {
    border-color: #334155 !important;
  }

  .api-resource[data-theme="dark"] [class~="text-slate-950"],
  .api-resource[data-theme="dark"] [class~="text-slate-900"],
  .api-resource[data-theme="dark"] [class~="text-slate-800"] {
    color: #f8fafc !important;
  }

  .api-resource[data-theme="dark"] [class~="text-slate-700"] {
    color: #e2e8f0 !important;
  }

  .api-resource[data-theme="dark"] [class~="text-slate-600"] {
    color: #cbd5e1 !important;
  }

  .api-resource[data-theme="dark"] [class~="text-slate-500"] {
    color: #94a3b8 !important;
  }

  .api-resource[data-theme="dark"] [class~="text-slate-400"] {
    color: #94a3b8 !important;
  }

  .api-resource[data-theme="dark"] [class~="bg-blue-50"],
  .api-resource[data-theme="dark"] [class~="bg-blue-50/70"] {
    background-color: rgba(23, 37, 84, 0.46) !important;
  }

  .api-resource[data-theme="dark"] [class~="bg-blue-100"] {
    background-color: rgba(30, 58, 138, 0.55) !important;
  }

  .api-resource[data-theme="dark"] [class~="border-blue-200"] {
    border-color: #1e3a8a !important;
  }

  .api-resource[data-theme="dark"] [class~="text-blue-600"],
  .api-resource[data-theme="dark"] [class~="text-blue-700"],
  .api-resource[data-theme="dark"] [class~="text-blue-950"] {
    color: #93c5fd !important;
  }

  .api-resource[data-theme="dark"] [class~="bg-amber-50"] {
    background-color: rgba(120, 53, 15, 0.2) !important;
  }

  .api-resource[data-theme="dark"] [class~="border-amber-200"] {
    border-color: #78350f !important;
  }

  .api-resource[data-theme="dark"] [class~="text-amber-950"],
  .api-resource[data-theme="dark"] [class~="text-amber-900"],
  .api-resource[data-theme="dark"] [class~="text-amber-900/80"] {
    color: #fde68a !important;
  }

  .api-resource[data-theme="dark"] [class~="bg-red-50"] {
    background-color: rgba(127, 29, 29, 0.2) !important;
  }

  .api-resource[data-theme="dark"] [class~="border-red-200"] {
    border-color: #7f1d1d !important;
  }

  .api-resource[data-theme="dark"] [class~="text-red-900"],
  .api-resource[data-theme="dark"] [class~="text-red-800"] {
    color: #fecaca !important;
  }

  .api-resource[data-theme="dark"] [class~="text-emerald-600"] {
    color: #34d399 !important;
  }

  .api-resource[data-theme="dark"] [class~="from-blue-50/80"],
  .api-resource[data-theme="dark"] [class~="from-blue-50"] {
    --tw-gradient-from: rgba(23, 37, 84, 0.35) var(--tw-gradient-from-position) !important;
    --tw-gradient-to: rgb(23 37 84 / 0) var(--tw-gradient-to-position) !important;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
  }

  .api-resource[data-theme="dark"] [class~="via-white"] {
    --tw-gradient-to: rgb(2 6 23 / 0) var(--tw-gradient-to-position) !important;
    --tw-gradient-stops: var(--tw-gradient-from), #020617 var(--tw-gradient-via-position), var(--tw-gradient-to) !important;
  }

  .api-resource[data-theme="dark"] [class~="to-white"] {
    --tw-gradient-to: #020617 var(--tw-gradient-to-position) !important;
  }

  .api-resource[data-theme="dark"] [class~="to-indigo-50"] {
    --tw-gradient-to: rgba(30, 27, 75, 0.5) var(--tw-gradient-to-position) !important;
  }

  .api-resource[data-theme="dark"] [class~="shadow-slate-200/30"] {
    --tw-shadow-color: transparent !important;
    --tw-shadow: 0 0 #0000 !important;
  }

  .api-resource a,
  .api-resource button,
  .api-resource summary {
    -webkit-tap-highlight-color: transparent;
  }
`;

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className = "",
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 border-b border-slate-200 py-12 sm:py-16 ${className}`}
    >
      <div className="mb-8">
        {eyebrow && (
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
            {eyebrow}
          </p>
        )}

        <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h2>

        {description && (
          <p className="mt-3 max-w-4xl text-[15px] leading-7 text-slate-600 sm:text-base">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

function InfoCard({ icon: Icon, title, children, accent = false }) {
  return (
    <article
      className={`rounded-2xl border p-5 sm:p-6 ${
        accent
          ? "border-blue-200 bg-blue-50/70"
          : "border-slate-200 bg-white"
      }`}
    >
      {Icon && (
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon size={20} />
        </div>
      )}

      <h3 className="text-lg font-bold text-slate-950">
        {title}
      </h3>

      <div className="mt-2 text-sm leading-7 text-slate-600">
        {children}
      </div>
    </article>
  );
}

function CodeBlock({ code, language = "HTTP", title }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
        <div className="min-w-0">
          {title && (
            <p className="truncate text-xs font-semibold text-slate-300">
              {title}
            </p>
          )}
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            {language}
          </p>
        </div>

        <button
          type="button"
          onClick={copyCode}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-slate-500 hover:bg-slate-900 hover:text-white"
          aria-label="Copy code"
        >
          {copied ? <ClipboardCheck size={14} /> : <Clipboard size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="overflow-x-auto p-4 text-[13px] leading-6 text-slate-200 sm:p-5">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function FlowDiagram({ title, items }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      {title && (
        <h3 className="mb-5 text-base font-bold text-slate-950">
          {title}
        </h3>
      )}

      <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center">
        {items.map((item, index) => (
          <React.Fragment key={`${item}-${index}`}>
            <div className="flex min-h-16 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-800 shadow-sm">
              {item}
            </div>

            {index !== items.length - 1 && (
              <>
                <ArrowDown
                  size={18}
                  className="mx-auto text-slate-400 lg:hidden"
                />
                <ArrowRight
                  size={18}
                  className="hidden shrink-0 text-slate-400 lg:block"
                />
              </>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function ComparisonRow({ label, left, right }) {
  return (
    <div className="grid gap-3 border-b border-slate-200 py-4 last:border-none md:grid-cols-[180px_1fr_1fr]">
      <p className="font-bold text-slate-900">{label}</p>
      <p className="text-sm leading-6 text-slate-600">
        {left}
      </p>
      <p className="text-sm leading-6 text-slate-600">
        {right}
      </p>
    </div>
  );
}

function Bullet({ children }) {
  return (
    <li className="flex gap-3">
      <CheckCircle2
        size={18}
        className="mt-1 shrink-0 text-emerald-600"
      />
      <span>{children}</span>
    </li>
  );
}

function APIResource() {
  const theme = useThemeFromLocalStorage();
  const isDark = theme === "dark";

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    }),
    []
  );

  const articleSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline:
        "API Complete Guide: REST, RESTful APIs, GraphQL, HTTP, Authentication and API Design",
      description:
        "Learn APIs from fundamentals to production: HTTP, REST, RESTful APIs, GraphQL, authentication, authorization, caching, pagination, rate limiting, webhooks, OpenAPI, API gateways, security and API design.",
      url: PAGE_URL,
      mainEntityOfPage: PAGE_URL,
      inLanguage: "en",
      author: {
        "@type": "Organization",
        name: "Target Trek",
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: "Target Trek",
        url: SITE_URL,
      },
      about: [
        "API",
        "REST API",
        "RESTful API",
        "GraphQL",
        "HTTP",
        "API Design",
        "Backend Development",
      ],
      educationalLevel: [
        "Beginner",
        "Intermediate",
        "Advanced",
        "Interview Preparation",
      ],
      learningResourceType: "Tutorial",
    }),
    []
  );

  const breadcrumbSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Resources",
          item: `${SITE_URL}/resources`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "API",
          item: PAGE_URL,
        },
      ],
    }),
    []
  );

  return (
    <>
      <Helmet>
        <title>
          API Complete Guide – REST, RESTful API, GraphQL & HTTP | Target Trek
        </title>

        <meta
          name="description"
          content="Complete API guide covering REST, RESTful APIs, GraphQL, HTTP methods, status codes, authentication, authorization, caching, pagination, rate limiting, webhooks, OpenAPI, API gateways, security and production API design."
        />

        <meta
          name="keywords"
          content="API, API tutorial, REST API, RESTful API, GraphQL, HTTP methods, HTTP status codes, API design, API authentication, JWT, OAuth, API security, API gateway, rate limiting, caching, pagination, webhooks, OpenAPI, Swagger, backend development, system design interview"
        />

        <meta name="robots" content="index, follow" />
        <meta name="author" content="Target Trek" />

        <link rel="canonical" href={PAGE_URL} />

        <meta
          property="og:title"
          content="API Complete Guide – REST, GraphQL, HTTP & Production API Design"
        />
        <meta
          property="og:description"
          content="A complete self-explanatory guide to APIs, REST, GraphQL, HTTP, authentication, security, caching, pagination, rate limiting, webhooks and production API architecture."
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:site_name" content="Target Trek" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="API Complete Guide – REST, GraphQL & HTTP"
        />
        <meta
          name="twitter:description"
          content="Learn API fundamentals, REST, GraphQL, security, caching, rate limiting, OpenAPI and production API design."
        />

        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>

        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>

        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <style>{API_THEME_CSS}</style>

      <div
        data-theme={theme}
        className={`api-resource min-h-screen transition-colors duration-300 ${
          isDark
            ? "bg-slate-950 text-slate-100"
            : "bg-white text-slate-900"
        }`}
      >
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition focus:translate-y-0"
        >
          Skip to content
        </a>

        <header className="border-b border-slate-200 bg-gradient-to-b from-blue-50/80 via-white to-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <nav
              aria-label="Breadcrumb"
              className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500"
            >
              <a href="/" className="hover:text-blue-600">
                Home
              </a>
              <span>/</span>
              <a href="/resources" className="hover:text-blue-600">
                Resources
              </a>
              <span>/</span>
              <span className="font-semibold text-slate-800">
                API
              </span>
            </nav>

            <div className="grid items-center gap-10 lg:grid-cols-[1fr_420px]">
              <div>
                <div className="mb-5 flex flex-wrap gap-2">
                  {["REST", "GraphQL", "HTTP", "Security", "System Design"].map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
                      >
                        {item}
                      </span>
                    )
                  )}
                </div>

                <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Complete API Guide
                  <span className="mt-2 block text-blue-600">
                    REST, RESTful APIs & GraphQL
                  </span>
                </h1>

                <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                  Learn APIs from zero to production. Understand how clients and
                  servers communicate, how HTTP works, how REST resources are
                  designed, how GraphQL changes data fetching, and how real
                  systems handle authentication, authorization, caching,
                  pagination, retries, rate limits, webhooks and failures.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#introduction"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    Start learning
                    <ArrowDown size={17} />
                  </a>

                  <a
                    href="#interview"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
                  >
                    Interview questions
                    <BookOpen size={17} />
                  </a>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/30 sm:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <Network size={23} />
                  </div>

                  <div>
                    <p className="font-black text-slate-950">
                      One request in 6 steps
                    </p>
                    <p className="text-xs text-slate-500">
                      The simplest mental model
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    ["1", "Client creates HTTP request"],
                    ["2", "DNS finds the server"],
                    ["3", "Gateway / server receives request"],
                    ["4", "Business logic processes it"],
                    ["5", "Database/cache may be accessed"],
                    ["6", "HTTP response returns to client"],
                  ].map(([number, label]) => (
                    <div
                      key={number}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">
                        {number}
                      </span>
                      <span className="text-sm font-semibold text-slate-700">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
          <aside className="hidden py-12 lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                API Roadmap
              </p>

              <nav aria-label="API resource table of contents">
                <ul className="space-y-1">
                  {sections.map((item, index) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
                      >
                        <span className="w-5 text-[10px] font-bold text-slate-400">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          <main id="main-content" className="min-w-0 pb-20">
            <details className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-slate-900">
                API roadmap
                <ChevronDown size={18} />
              </summary>

              <div className="mt-4 grid gap-1 sm:grid-cols-2">
                {sections.map((item, index) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-white hover:text-blue-600"
                  >
                    {index + 1}. {item.label}
                  </a>
                ))}
              </div>
            </details>

            <Section
              id="introduction"
              eyebrow="API Fundamentals"
              title="What is an API?"
              description="API stands for Application Programming Interface. It is a contract that defines how one software component can request data or behavior from another component."
            >
              <div className="grid gap-5 md:grid-cols-3">
                <InfoCard icon={Users} title="Client">
                  The consumer of the API. It can be a React application,
                  Android app, another backend service, CLI, IoT device or any
                  software capable of making the required request.
                </InfoCard>

                <InfoCard icon={Server} title="Server">
                  Receives the request, validates it, applies business rules,
                  communicates with dependencies and produces a response.
                </InfoCard>

                <InfoCard icon={Braces} title="Contract">
                  Defines endpoints, methods, request formats, authentication,
                  response schemas, status codes and expected behavior.
                </InfoCard>
              </div>

              <div className="mt-6">
                <FlowDiagram
                  title="Basic API communication"
                  items={[
                    "Frontend / Client",
                    "HTTP Request",
                    "Backend API",
                    "Business Logic",
                    "Database",
                    "HTTP Response",
                  ]}
                />
              </div>

              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex gap-3">
                  <Sparkles
                    size={20}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <div>
                    <h3 className="font-bold text-amber-950">
                      Think of an API like a restaurant contract
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-amber-900/80">
                      You are the client. The menu describes what can be
                      requested. The waiter carries your request to the kitchen.
                      The kitchen contains the internal implementation. You
                      normally do not need to know how the kitchen prepares the
                      result—you need to know what you can order and what you
                      will receive.
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            <Section
              id="api-types"
              eyebrow="API Architecture"
              title="Major API styles"
              description="API is a broad concept. REST and GraphQL are two common approaches, but production systems also use RPC, gRPC, SOAP, WebSockets and webhooks."
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {apiStyles.map((style) => (
                  <InfoCard
                    key={style.name}
                    icon={style.icon}
                    title={style.name}
                  >
                    <p>{style.summary}</p>
                    <p className="mt-3">
                      <strong className="text-slate-900">
                        Good fit:
                      </strong>{" "}
                      {style.usefulFor}
                    </p>
                  </InfoCard>
                ))}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoCard title="Public API">
                  Exposed to external developers or customers. It needs strong
                  documentation, stable contracts, authentication, quotas and
                  backward-compatibility planning.
                </InfoCard>

                <InfoCard title="Private / Internal API">
                  Used inside an organization. It may still require strict
                  contracts, observability, authentication and versioning
                  because internal consumers can be numerous.
                </InfoCard>

                <InfoCard title="Partner API">
                  Exposed to approved business partners under controlled
                  authentication, permissions and usage agreements.
                </InfoCard>

                <InfoCard title="Composite API">
                  Combines multiple underlying operations or services into one
                  client-facing interaction to reduce client round trips.
                </InfoCard>
              </div>
            </Section>

            <Section
              id="http-foundation"
              eyebrow="HTTP"
              title="HTTP foundation"
              description="Most web APIs communicate over HTTP. Understanding HTTP is therefore fundamental to understanding REST APIs."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <InfoCard icon={Globe2} title="URL">
                  Identifies where the request should be sent.
                  <div className="mt-4 rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200">
                    https://api.example.com/api/v1/users/42?include=orders
                  </div>
                </InfoCard>

                <InfoCard icon={Send} title="Method">
                  Describes the intended request semantics—for example GET,
                  POST, PUT, PATCH or DELETE.
                </InfoCard>

                <InfoCard icon={Hash} title="Headers">
                  Metadata such as authorization credentials, accepted media
                  types, content type, caching controls, request IDs and client
                  information.
                </InfoCard>

                <InfoCard icon={Braces} title="Body">
                  Optional request content. JSON is very common, but an API can
                  use other media types including XML, form data, binary data or
                  protocol-specific formats.
                </InfoCard>
              </div>

              <div className="mt-7">
                <h3 className="mb-4 text-xl font-bold text-slate-950">
                  Anatomy of a URL
                </h3>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        {["Part", "Example", "Meaning"].map((item) => (
                          <th
                            key={item}
                            className="px-4 py-3 font-bold text-slate-900"
                          >
                            {item}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                      {[
                        ["Scheme", "https", "Protocol used for communication."],
                        [
                          "Host",
                          "api.example.com",
                          "Domain containing the API.",
                        ],
                        [
                          "Base path",
                          "/api/v1",
                          "Common prefix, sometimes containing API version.",
                        ],
                        [
                          "Resource",
                          "/users",
                          "Collection being addressed.",
                        ],
                        [
                          "Resource ID",
                          "/42",
                          "A specific resource inside the collection.",
                        ],
                        [
                          "Query string",
                          "?include=orders",
                          "Optional query parameters modifying the request.",
                        ],
                      ].map(([part, example, meaning]) => (
                        <tr
                          key={part}
                          className="bg-white"
                        >
                          <td className="px-4 py-4 font-semibold text-slate-900">
                            {part}
                          </td>
                          <td className="px-4 py-4 font-mono text-xs text-blue-600">
                            {example}
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            {meaning}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Section>

            <Section
              id="request-response"
              eyebrow="HTTP Messages"
              title="Request and response lifecycle"
              description="Every API interaction has two major messages: a request produced by the client and a response produced by the server."
            >
              <div className="grid gap-6 xl:grid-cols-2">
                <CodeBlock
                  title="Client → server"
                  language="HTTP Request"
                  code={requestExample}
                />

                <CodeBlock
                  title="Server → client"
                  language="HTTP Response"
                  code={responseExample}
                />
              </div>

              <div className="mt-7">
                <FlowDiagram
                  title="Detailed request lifecycle"
                  items={[
                    "User Action",
                    "Client",
                    "DNS / Network",
                    "API",
                    "Validation",
                    "Business Logic",
                    "DB / Cache",
                    "Response",
                  ]}
                />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoCard title="Request contains">
                  <ul className="space-y-2">
                    <Bullet>HTTP method</Bullet>
                    <Bullet>URL / path</Bullet>
                    <Bullet>Query parameters</Bullet>
                    <Bullet>Headers</Bullet>
                    <Bullet>Cookies when applicable</Bullet>
                    <Bullet>Optional request body</Bullet>
                  </ul>
                </InfoCard>

                <InfoCard title="Response contains">
                  <ul className="space-y-2">
                    <Bullet>Status code</Bullet>
                    <Bullet>Response headers</Bullet>
                    <Bullet>Optional response body</Bullet>
                    <Bullet>Cache instructions</Bullet>
                    <Bullet>Correlation or request ID</Bullet>
                    <Bullet>Structured error details on failure</Bullet>
                  </ul>
                </InfoCard>
              </div>
            </Section>

            <Section
              id="http-methods"
              eyebrow="HTTP Semantics"
              title="HTTP methods"
              description="Use methods according to their defined semantics. The method should communicate what the client wants to do with the target resource."
            >
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "Method",
                        "Purpose",
                        "Example",
                        "Safe",
                        "Idempotent",
                        "Common success",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-4 py-3 font-bold text-slate-900"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {httpMethods.map((item) => (
                      <tr
                        key={item.method}
                        className="bg-white align-top"
                      >
                        <td className="px-4 py-4">
                          <span className="rounded-lg bg-blue-50 px-2 py-1 font-mono font-black text-blue-700">
                            {item.method}
                          </span>
                        </td>

                        <td className="max-w-[260px] px-4 py-4 text-slate-600">
                          {item.purpose}
                          <p className="mt-2 text-xs text-slate-500">
                            {item.note}
                          </p>
                        </td>

                        <td className="px-4 py-4 font-mono text-xs text-slate-700">
                          {item.example}
                        </td>

                        <td className="px-4 py-4">{item.safe}</td>
                        <td className="px-4 py-4">{item.idempotent}</td>
                        <td className="px-4 py-4">{item.typical}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoCard icon={ShieldCheck} title="Safe method">
                  A safe method is defined with essentially read-only semantics.
                  GET should therefore retrieve information rather than request
                  deletion, charging a card or changing account data.
                </InfoCard>

                <InfoCard icon={Repeat2} title="Idempotent method">
                  Repeating the same request should have the same intended
                  server-side effect as sending it once. This matters greatly
                  when networks fail and clients need to retry.
                </InfoCard>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <CodeBlock
                  language="HTTP"
                  title="Create a user"
                  code={createUserExample}
                />
                <CodeBlock
                  language="HTTP"
                  title="Successful creation"
                  code={createUserResponse}
                />
              </div>
            </Section>

            <Section
              id="status-codes"
              eyebrow="HTTP Response"
              title="HTTP status codes"
              description="Status codes allow a client to understand the broad result of a request without parsing application-specific response text."
            >
              <div className="grid gap-4 md:grid-cols-2">
                {statusGroups.map((group) => (
                  <InfoCard
                    key={group.range}
                    title={`${group.range} — ${group.title}`}
                  >
                    <p>{group.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {group.examples.map((status) => (
                        <span
                          key={status}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-xs text-slate-700"
                        >
                          {status}
                        </span>
                      ))}
                    </div>
                  </InfoCard>
                ))}
              </div>

              <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Use it when</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {[
                      [
                        "200 OK",
                        "Request succeeded and a normal response representation is returned.",
                      ],
                      [
                        "201 Created",
                        "A new resource was successfully created.",
                      ],
                      [
                        "202 Accepted",
                        "Request was accepted for asynchronous processing but processing is not complete.",
                      ],
                      [
                        "204 No Content",
                        "Operation succeeded and no response body is necessary.",
                      ],
                      [
                        "304 Not Modified",
                        "Conditional request indicates the cached representation is still valid.",
                      ],
                      [
                        "400 Bad Request",
                        "The request is malformed or cannot be understood according to the API contract.",
                      ],
                      [
                        "401 Unauthorized",
                        "Authentication credentials are missing or invalid.",
                      ],
                      [
                        "403 Forbidden",
                        "The caller is authenticated but does not have permission for the operation.",
                      ],
                      ["404 Not Found", "The requested resource cannot be found."],
                      [
                        "409 Conflict",
                        "The request conflicts with the current state of the resource.",
                      ],
                      [
                        "422 Unprocessable Content",
                        "The request syntax may be valid but the content cannot be processed semantically.",
                      ],
                      [
                        "429 Too Many Requests",
                        "The caller has exceeded an enforced request limit.",
                      ],
                      [
                        "500 Internal Server Error",
                        "An unexpected server-side failure occurred.",
                      ],
                      [
                        "502 Bad Gateway",
                        "A gateway/proxy received an invalid response from an upstream service.",
                      ],
                      [
                        "503 Service Unavailable",
                        "The service cannot currently handle the request.",
                      ],
                      [
                        "504 Gateway Timeout",
                        "A gateway/proxy did not receive a timely response from an upstream service.",
                      ],
                    ].map(([code, meaning]) => (
                      <tr key={code}>
                        <td className="px-4 py-4 font-mono font-bold text-blue-600">
                          {code}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {meaning}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section
              id="rest"
              eyebrow="REST"
              title="What is REST?"
              description="REST stands for Representational State Transfer. It is an architectural style for distributed systems rather than a programming language, framework or wire protocol."
            >
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
                <p className="text-sm leading-7 text-blue-950">
                  In a typical HTTP REST API, the server exposes{" "}
                  <strong>resources</strong> such as users, products or orders.
                  The client identifies resources using URIs and interacts with
                  them through standardized HTTP semantics.
                </p>
              </div>

              <h3 className="mb-4 mt-8 text-xl font-bold text-slate-950">
                REST constraints
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {restConstraints.map((constraint, index) => (
                  <div
                    key={constraint.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">
                        {index + 1}
                      </span>

                      <h4 className="font-bold text-slate-950">
                        {constraint.title}
                      </h4>
                    </div>

                    <p className="text-sm leading-7 text-slate-600">
                      {constraint.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-7">
                <FlowDiagram
                  title="REST resource model"
                  items={[
                    "GET /users/42",
                    "User Resource",
                    "Representation",
                    "JSON Response",
                  ]}
                />
              </div>

              <div className="mt-8">
                <h3 className="mb-4 text-xl font-bold text-slate-950">
                  REST API vs RESTful API
                </h3>

                <p className="text-sm leading-7 text-slate-600">
                  In everyday engineering conversation, the terms are often used
                  interchangeably. “RESTful” generally emphasizes that the API
                  follows REST principles consistently rather than merely using
                  HTTP and JSON.
                </p>
              </div>
            </Section>

            <Section
              id="resource-design"
              eyebrow="REST Design"
              title="How to design REST resources"
              description="Start with the domain resources, not controller method names. HTTP already provides operation semantics."
            >
              <div className="space-y-3">
                {restBadGood.map((item) => (
                  <div
                    key={item.bad}
                    className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_60px_1fr]"
                  >
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-500">
                        Avoid
                      </p>
                      <code className="text-sm text-slate-800">
                        {item.bad}
                      </code>
                    </div>

                    <div className="flex items-center justify-center">
                      <ArrowRight className="rotate-90 text-slate-400 md:rotate-0" />
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
                        Prefer
                      </p>
                      <code className="text-sm text-slate-800">
                        {item.good}
                      </code>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {item.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <InfoCard title="Collections">
                  <code className="text-blue-600">
                    /users
                  </code>

                  <p className="mt-2">
                    Represents a collection of user resources.
                  </p>
                </InfoCard>

                <InfoCard title="Single resource">
                  <code className="text-blue-600">
                    /users/42
                  </code>

                  <p className="mt-2">
                    Represents the user whose identifier is 42.
                  </p>
                </InfoCard>

                <InfoCard title="Nested resource">
                  <code className="text-blue-600">
                    /users/42/orders
                  </code>

                  <p className="mt-2">
                    Represents orders scoped to a particular user.
                  </p>
                </InfoCard>

                <InfoCard title="Sub-resource">
                  <code className="text-blue-600">
                    /orders/9001/items
                  </code>

                  <p className="mt-2">
                    Represents items associated with order 9001.
                  </p>
                </InfoCard>
              </div>
            </Section>

            <Section
              id="parameters"
              eyebrow="Request Design"
              title="Path, query, header and body parameters"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard icon={Route} title="Path parameter">
                  Identifies a particular resource.
                  <div className="mt-3 rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-200">
                    GET /users/42
                  </div>
                  <p className="mt-3">Here, 42 is part of resource identity.</p>
                </InfoCard>

                <InfoCard icon={Filter} title="Query parameter">
                  Changes how a collection or representation is selected.
                  <div className="mt-3 rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-200">
                    GET /products?page=2&sort=-price
                  </div>
                </InfoCard>

                <InfoCard icon={Hash} title="Header">
                  Carries request metadata.
                  <div className="mt-3 rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-200">
                    Authorization: Bearer token
                  </div>
                </InfoCard>

                <InfoCard icon={Braces} title="Request body">
                  Carries structured data submitted to the API.
                  <div className="mt-3 rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-200">
                    {`{ "name": "Aman" }`}
                  </div>
                </InfoCard>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                <p className="font-bold text-slate-950">
                  Easy rule
                </p>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Use a <strong>path parameter</strong> when the value identifies
                  which resource you mean. Use a{" "}
                  <strong>query parameter</strong> when it modifies selection,
                  filtering, searching, sorting, pagination or representation.
                </p>
              </div>
            </Section>

            <Section
              id="responses"
              eyebrow="Contract Design"
              title="Designing consistent API responses"
            >
              <div className="grid gap-6 xl:grid-cols-2">
                <InfoCard title="Single resource">
                  <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-200">
                    {`{
  "data": {
    "id": 42,
    "name": "Aman"
  }
}`}
                  </pre>
                </InfoCard>

                <InfoCard title="Collection">
                  <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-200">
                    {`{
  "data": [
    { "id": 41, "name": "Riya" },
    { "id": 42, "name": "Aman" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20
  }
}`}
                  </pre>
                </InfoCard>
              </div>

              <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-600">
                <Bullet>Use stable field names and predictable types.</Bullet>
                <Bullet>
                  Do not change a field from string to object without considering
                  compatibility.
                </Bullet>
                <Bullet>
                  Avoid returning HTTP 200 for every failure and hiding error
                  semantics only inside JSON.
                </Bullet>
                <Bullet>
                  Include correlation/request identifiers when they help support
                  and debugging.
                </Bullet>
              </ul>
            </Section>

            <Section
              id="errors"
              eyebrow="Reliability"
              title="API error handling"
              description="A useful error should tell the caller what category of failure occurred, give a stable machine-readable code and provide enough context to correct the request without leaking sensitive internals."
            >
              <CodeBlock
                code={errorResponse}
                language="JSON"
                title="Structured error response"
              />

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoCard icon={XCircle} title="Bad error">
                  <code>{`{ "error": "Something went wrong" }`}</code>

                  <p className="mt-3">
                    The client cannot programmatically understand the failure.
                  </p>
                </InfoCard>

                <InfoCard icon={BadgeCheck} title="Better error">
                  Stable error code + readable message + request ID + optional
                  field-level details.
                </InfoCard>
              </div>

              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                <h3 className="font-bold text-red-900">
                  Never expose
                </h3>

                <ul className="mt-3 grid gap-2 text-sm text-red-800 md:grid-cols-2">
                  <li>• Database passwords</li>
                  <li>• Access tokens</li>
                  <li>• Private keys</li>
                  <li>• Internal stack traces to public clients</li>
                  <li>• Raw SQL containing sensitive values</li>
                  <li>• Internal infrastructure secrets</li>
                </ul>
              </div>
            </Section>

            <Section
              id="pagination"
              eyebrow="Scalability"
              title="API pagination"
              description="Never return an unbounded collection when that collection can grow significantly."
            >
              <div className="grid gap-6 xl:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-950">
                    Offset / page pagination
                  </h3>

                  <CodeBlock
                    language="HTTP + JSON"
                    code={offsetPaginationExample}
                  />

                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    Easy for users to understand and jump between pages, but
                    large offsets can become expensive and changing datasets can
                    cause duplicate or skipped items.
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-bold text-slate-950">
                    Cursor pagination
                  </h3>

                  <CodeBlock
                    language="HTTP + JSON"
                    code={cursorPaginationExample}
                  />

                  <p className="mt-4 text-sm leading-7 text-slate-600">
                    Better suited to large or frequently changing feeds because
                    the cursor points to a position in an ordered dataset rather
                    than a numeric offset.
                  </p>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                <ComparisonRow
                  label="Jump to page"
                  left="Easy"
                  right="Usually not supported directly"
                />
                <ComparisonRow
                  label="Large datasets"
                  left="Can degrade with large offsets"
                  right="Usually better"
                />
                <ComparisonRow
                  label="Changing data"
                  left="May skip/duplicate rows"
                  right="Usually more stable with correct ordering"
                />
                <ComparisonRow
                  label="Implementation"
                  left="Simple"
                  right="More design work"
                />
              </div>
            </Section>

            <Section
              id="filtering"
              eyebrow="Collections"
              title="Filtering, sorting, searching and field selection"
            >
              <CodeBlock
                language="HTTP"
                title="One possible query design"
                code={filteringExample}
              />

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoCard icon={Filter} title="Filtering">
                  <code>?status=PAID&currency=INR</code>
                </InfoCard>

                <InfoCard icon={ListFilter} title="Sorting">
                  <code>?sort=-createdAt,price</code>
                  <p className="mt-2">
                    A minus prefix can represent descending order if documented
                    by your API.
                  </p>
                </InfoCard>

                <InfoCard icon={Search} title="Search">
                  <code>?search=system+design</code>
                </InfoCard>

                <InfoCard icon={Braces} title="Sparse field selection">
                  <code>?fields=id,title,price</code>
                  <p className="mt-2">
                    Can reduce response size when clients only need selected
                    fields.
                  </p>
                </InfoCard>
              </div>
            </Section>

            <Section
              id="versioning"
              eyebrow="Compatibility"
              title="API versioning"
              description="Versioning gives you a controlled path for breaking contract changes. Not every change requires a new API version."
            >
              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard title="URI versioning">
                  <code>/api/v1/users</code>

                  <p className="mt-3">
                    Very visible and easy for clients and documentation.
                  </p>
                </InfoCard>

                <InfoCard title="Header versioning">
                  <code>API-Version: 2026-09-01</code>

                  <p className="mt-3">
                    Keeps URLs clean but is less obvious when inspecting links.
                  </p>
                </InfoCard>

                <InfoCard title="Media type versioning">
                  <code>Accept: application/vnd.app.v2+json</code>

                  <p className="mt-3">
                    Version information is expressed through content
                    negotiation.
                  </p>
                </InfoCard>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoCard title="Often backward-compatible">
                  <ul className="space-y-2">
                    <Bullet>Adding an optional response field</Bullet>
                    <Bullet>Adding a new endpoint</Bullet>
                    <Bullet>Adding an optional request parameter</Bullet>
                  </ul>
                </InfoCard>

                <InfoCard title="Potentially breaking">
                  <ul className="space-y-2">
                    <Bullet>Removing a field</Bullet>
                    <Bullet>Changing a field type</Bullet>
                    <Bullet>Renaming a field</Bullet>
                    <Bullet>Changing meaning of an existing field</Bullet>
                    <Bullet>Making an optional request field mandatory</Bullet>
                  </ul>
                </InfoCard>
              </div>
            </Section>

            <Section
              id="idempotency"
              eyebrow="Distributed Systems"
              title="Idempotency and safe retries"
              description="Networks fail in uncomfortable places. A client might not know whether the server processed a request because the connection disappeared before the response arrived."
            >
              <FlowDiagram
                title="Why duplicate payments can happen"
                items={[
                  "Client sends payment",
                  "Server charges card",
                  "Response is lost",
                  "Client retries",
                  "Risk of second charge",
                ]}
              />

              <div className="mt-6">
                <CodeBlock
                  code={idempotencyExample}
                  language="HTTP"
                  title="POST with idempotency key"
                />
              </div>

              <div className="mt-6">
                <FlowDiagram
                  title="Idempotency-key flow"
                  items={[
                    "Receive key",
                    "Check idempotency store",
                    "Existing result?",
                    "Return saved result / Process once",
                    "Persist result",
                  ]}
                />
              </div>

              <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <p className="text-sm leading-7 text-blue-950">
                  A production implementation usually associates the
                  idempotency key with the caller and request, stores the
                  outcome for a defined lifetime, and protects concurrent
                  requests using atomic operations or transactional guarantees.
                </p>
              </div>
            </Section>

            <Section
              id="authentication"
              eyebrow="Security"
              title="API authentication"
              description="Authentication answers: Who is making this request?"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard icon={KeyRound} title="API key">
                  Simple credential identifying an application or consumer.
                  <div className="mt-4">
                    <CodeBlock language="HTTP" code={apiKeyExample} />
                  </div>
                </InfoCard>

                <InfoCard icon={LockKeyhole} title="Bearer token / JWT">
                  A bearer access token is included in the Authorization header.
                  JWT is one possible token format.
                  <div className="mt-4">
                    <CodeBlock language="HTTP" code={jwtExample} />
                  </div>
                </InfoCard>

                <InfoCard icon={Users} title="Session / cookie">
                  Common for browser applications. The server may keep
                  server-side session state while the browser sends a session
                  identifier in a secure cookie.
                </InfoCard>

                <InfoCard icon={ShieldCheck} title="OAuth 2.0">
                  Authorization framework frequently used when applications need
                  delegated access to protected APIs. OpenID Connect adds an
                  identity layer for authentication use cases.
                </InfoCard>
              </div>

              <div className="mt-7">
                <FlowDiagram
                  title="Bearer-token request"
                  items={[
                    "User authenticates",
                    "Identity system",
                    "Access token",
                    "Client",
                    "API",
                    "Token validation",
                    "Protected resource",
                  ]}
                />
              </div>
            </Section>

            <Section
              id="authorization"
              eyebrow="Security"
              title="Authentication vs authorization"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <InfoCard
                  icon={KeyRound}
                  title="Authentication — Who are you?"
                  accent
                >
                  Example: verifying a login, API key, session or access token.
                </InfoCard>

                <InfoCard
                  icon={ShieldCheck}
                  title="Authorization — What may you do?"
                  accent
                >
                  Example: determining whether a signed-in employee may delete
                  another user's account or access an admin endpoint.
                </InfoCard>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <InfoCard title="RBAC">
                  Role-Based Access Control.
                  <p className="mt-2">
                    Permissions are associated with roles such as ADMIN, EDITOR
                    or USER.
                  </p>
                </InfoCard>

                <InfoCard title="ABAC">
                  Attribute-Based Access Control.
                  <p className="mt-2">
                    Decisions use attributes such as department, resource owner,
                    environment or location.
                  </p>
                </InfoCard>

                <InfoCard title="Resource ownership">
                  <p>
                    A user may be allowed to read{" "}
                    <code>/users/42/orders</code> only when user 42 represents
                    that caller or another permitted relationship.
                  </p>
                </InfoCard>
              </div>
            </Section>

            <Section
              id="security"
              eyebrow="Security"
              title="API security checklist"
            >
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  [
                    "Use HTTPS",
                    "Protect credentials and application data in transit using TLS.",
                  ],
                  [
                    "Validate input",
                    "Treat all client input as untrusted and enforce size, type, range and format constraints.",
                  ],
                  [
                    "Authorize every protected resource",
                    "Do not assume knowing a resource ID means the caller may access it.",
                  ],
                  [
                    "Rate limit sensitive operations",
                    "Protect login, OTP, password reset and expensive endpoints from abuse.",
                  ],
                  [
                    "Protect secrets",
                    "Do not hardcode API secrets in frontend bundles or commit them to source control.",
                  ],
                  [
                    "Short-lived credentials",
                    "Limit the damage from compromised credentials where your authentication model allows it.",
                  ],
                  [
                    "Audit important actions",
                    "Record security-relevant changes with actor, target, timestamp and request context.",
                  ],
                  [
                    "Limit response data",
                    "Do not expose sensitive fields merely because they exist in the database model.",
                  ],
                  [
                    "Control payload sizes",
                    "Bound uploads, JSON depth, query complexity and other resource-intensive input.",
                  ],
                  [
                    "Secure dependencies",
                    "Patch frameworks, libraries, gateways and infrastructure components.",
                  ],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="flex gap-3 rounded-2xl border border-slate-200 p-4"
                  >
                    <ShieldCheck
                      size={19}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <div>
                      <h3 className="font-bold text-slate-950">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              id="cors"
              eyebrow="Browser Security"
              title="CORS"
              description="Cross-Origin Resource Sharing is an HTTP-header mechanism used by browsers to decide whether frontend JavaScript from one origin may access resources from another origin."
            >
              <FlowDiagram
                title="Typical preflight"
                items={[
                  "Browser",
                  "OPTIONS preflight",
                  "API",
                  "CORS response headers",
                  "Actual request",
                ]}
              />

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoCard title="Origin">
                  Origin consists of scheme + host + port.
                  <div className="mt-3 rounded-xl bg-slate-950 p-3 font-mono text-xs text-slate-200">
                    https://www.targettrek.in
                  </div>
                </InfoCard>

                <InfoCard title="Example response headers">
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs leading-6 text-slate-200">
                    {`Access-Control-Allow-Origin: https://www.targettrek.in
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type, Authorization`}
                  </pre>
                </InfoCard>
              </div>

              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm leading-7 text-amber-900">
                  CORS is primarily a browser-enforced mechanism. It is not a
                  replacement for authentication or authorization. Your backend
                  must still enforce who is allowed to access protected data.
                </p>
              </div>
            </Section>

            <Section
              id="caching"
              eyebrow="Performance"
              title="API caching"
              description="Caching avoids repeating work when a previously generated representation can still be reused."
            >
              <FlowDiagram
                title="Cache lookup"
                items={[
                  "Client",
                  "CDN / Cache",
                  "Cache hit?",
                  "Return cached data / Call origin",
                  "API",
                  "Database",
                ]}
              />

              <div className="mt-6">
                <CodeBlock
                  code={cacheExample}
                  language="HTTP"
                  title="Conditional request with ETag"
                />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoCard icon={Clock3} title="Cache-Control">
                  Can communicate directives such as freshness duration and
                  whether responses are public, private or should not be stored.
                </InfoCard>

                <InfoCard icon={Hash} title="ETag">
                  Validator identifying a representation version. A client can
                  use it in a conditional request.
                </InfoCard>

                <InfoCard icon={RefreshCcw} title="304 Not Modified">
                  Allows the server to tell the client that its cached
                  representation remains valid without returning the full
                  response body again.
                </InfoCard>

                <InfoCard icon={Cloud} title="CDN / shared cache">
                  Useful for cacheable public content close to users, reducing
                  origin requests and network latency.
                </InfoCard>
              </div>
            </Section>

            <Section
              id="rate-limiting"
              eyebrow="Reliability"
              title="Rate limiting"
              description="Rate limiting controls how frequently a caller may perform requests. It protects capacity, fairness, costs and sensitive endpoints."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard icon={Gauge} title="Fixed window">
                  Count requests in fixed intervals such as 100 requests per
                  minute. Simple, but traffic may burst around window
                  boundaries.
                </InfoCard>

                <InfoCard icon={TimerReset} title="Sliding window">
                  Tracks usage over a moving period to provide smoother limits.
                </InfoCard>

                <InfoCard icon={Database} title="Token bucket">
                  Tokens refill at a configured rate. Requests consume tokens,
                  allowing controlled bursts while enforcing a long-term rate.
                </InfoCard>

                <InfoCard icon={Activity} title="Leaky bucket">
                  Processes traffic at a controlled output rate and smooths
                  bursts.
                </InfoCard>
              </div>

              <div className="mt-6">
                <CodeBlock
                  code={rateLimitHeadersExample}
                  language="HTTP"
                  title="Rate limit response"
                />
              </div>

              <div className="mt-6">
                <FlowDiagram
                  title="Distributed rate limiting"
                  items={[
                    "Client",
                    "API Gateway",
                    "Rate Limiter",
                    "Redis / shared counter",
                    "Allow / Reject",
                    "Service",
                  ]}
                />
              </div>
            </Section>

            <Section
              id="graphql"
              eyebrow="GraphQL"
              title="GraphQL API"
              description="GraphQL exposes a typed schema and lets clients select the fields they need. A GraphQL server commonly exposes operations through queries, mutations and subscriptions."
            >
              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard icon={Search} title="Query">
                  Reads data.
                  <p className="mt-2">
                    Similar in intent to data-fetching operations.
                  </p>
                </InfoCard>

                <InfoCard icon={Braces} title="Mutation">
                  Changes data or triggers side effects.
                </InfoCard>

                <InfoCard icon={Activity} title="Subscription">
                  Represents a long-lived operation for receiving updates as
                  events occur.
                </InfoCard>
              </div>

              <div className="mt-7">
                <FlowDiagram
                  title="GraphQL execution flow"
                  items={[
                    "Client Query",
                    "GraphQL Endpoint",
                    "Parse & Validate",
                    "Resolvers",
                    "Services / Data Sources",
                    "Shape Response",
                  ]}
                />
              </div>

              <div className="mt-7 grid gap-6 xl:grid-cols-2">
                <CodeBlock
                  language="GraphQL SDL"
                  title="Schema"
                  code={graphqlSchemaExample}
                />

                <CodeBlock
                  language="GraphQL"
                  title="Query"
                  code={graphqlQueryExample}
                />
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <CodeBlock
                  language="JSON"
                  title="Query response"
                  code={graphqlResponseExample}
                />

                <CodeBlock
                  language="GraphQL"
                  title="Mutation"
                  code={graphqlMutationExample}
                />
              </div>

              <h3 className="mb-4 mt-8 text-xl font-bold text-slate-950">
                Why GraphQL can be useful
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard title="Field selection">
                  The client explicitly asks for fields such as{" "}
                  <code>id, name, orders</code>, reducing unnecessary fields in
                  the representation.
                </InfoCard>

                <InfoCard title="Relationship traversal">
                  Related data can be expressed in one query structure instead
                  of forcing the client to manually coordinate several
                  resource-specific calls.
                </InfoCard>

                <InfoCard title="Typed schema">
                  The schema describes available types, fields, arguments and
                  operation shapes.
                </InfoCard>

                <InfoCard title="Client flexibility">
                  Different clients can request different representations
                  without creating a dedicated REST endpoint for every UI.
                </InfoCard>
              </div>

              <h3 className="mb-4 mt-8 text-xl font-bold text-slate-950">
                GraphQL challenges
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard icon={AlertTriangle} title="N+1 problem">
                  A naive resolver implementation can issue one query for a
                  collection and then one additional query per item. Batching
                  and data-loader patterns can reduce this.
                </InfoCard>

                <InfoCard icon={Gauge} title="Query complexity">
                  Clients can construct expensive nested queries. Production
                  systems may enforce depth, complexity, timeout and size
                  limits.
                </InfoCard>

                <InfoCard icon={ShieldCheck} title="Authorization">
                  Authorization must be applied correctly across fields,
                  resources and resolvers—not merely at the single HTTP
                  endpoint.
                </InfoCard>

                <InfoCard icon={Database} title="Caching">
                  HTTP-level caching is less automatically resource-oriented
                  than classic GET resource URLs, so application and client
                  caching strategies require careful design.
                </InfoCard>
              </div>
            </Section>

            <Section
              id="rest-vs-graphql"
              eyebrow="Comparison"
              title="REST vs GraphQL"
              description="Neither technology is universally superior. Choose based on API consumers, data relationships, caching needs, operational complexity and team experience."
            >
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="hidden grid-cols-[180px_1fr_1fr] bg-slate-50 px-4 py-3 font-bold md:grid">
                  <span>Area</span>
                  <span>REST</span>
                  <span>GraphQL</span>
                </div>

                <ComparisonRow
                  label="Primary model"
                  left="Resources identified through URIs."
                  right="Typed graph exposed through a schema."
                />

                <ComparisonRow
                  label="Data selection"
                  left="Server defines each endpoint representation."
                  right="Client selects requested fields."
                />

                <ComparisonRow
                  label="Endpoints"
                  left="Typically multiple resource URLs."
                  right="Commonly a GraphQL endpoint handling many operations."
                />

                <ComparisonRow
                  label="Caching"
                  left="Works naturally with HTTP GET semantics and URL-addressable resources."
                  right="Often requires more application/client-aware caching design."
                />

                <ComparisonRow
                  label="Related data"
                  left="May require multiple endpoints or purpose-built representations."
                  right="Relationships can be expressed inside one query."
                />

                <ComparisonRow
                  label="Complexity controls"
                  left="Endpoint cost is usually easier to reason about."
                  right="Arbitrary client queries can require depth and complexity limits."
                />

                <ComparisonRow
                  label="Good fit"
                  left="Straightforward resource APIs, public APIs, HTTP-centric services and cacheable resources."
                  right="Rich applications with complex and changing data-fetching requirements."
                />
              </div>
            </Section>

            <Section
              id="webhooks"
              eyebrow="Event Integrations"
              title="Webhooks"
              description="A webhook reverses the usual polling relationship: instead of repeatedly asking whether something changed, the provider sends an HTTP request when an event happens."
            >
              <FlowDiagram
                title="Payment webhook example"
                items={[
                  "Payment Provider",
                  "payment.success event",
                  "POST /webhooks/payment",
                  "Verify signature",
                  "Process event",
                  "Return 2xx",
                ]}
              />

              <div className="mt-6">
                <CodeBlock
                  language="HTTP + JSON"
                  title="Webhook delivery"
                  code={webhookExample}
                />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <InfoCard icon={ShieldCheck} title="Verify authenticity">
                  Verify a cryptographic signature or other provider-supported
                  authentication mechanism before trusting webhook content.
                </InfoCard>

                <InfoCard icon={Repeat2} title="Expect retries">
                  Providers may deliver the same event more than once. Store a
                  stable event ID and process webhook events idempotently.
                </InfoCard>

                <InfoCard icon={Clock3} title="Acknowledge quickly">
                  Avoid performing extremely long synchronous processing before
                  acknowledging the delivery. Queue additional work when
                  appropriate.
                </InfoCard>

                <InfoCard icon={Activity} title="Observe failures">
                  Track delivery attempts, signature failures, processing
                  failures, retries and dead-lettered events.
                </InfoCard>
              </div>

              <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200">
                <div className="hidden grid-cols-[180px_1fr_1fr] bg-slate-50 px-4 py-3 font-bold md:grid">
                  <span>Area</span>
                  <span>Polling</span>
                  <span>Webhook</span>
                </div>

                <ComparisonRow
                  label="Direction"
                  left="Consumer repeatedly asks provider."
                  right="Provider pushes event to consumer."
                />

                <ComparisonRow
                  label="Latency"
                  left="Depends on polling interval."
                  right="Can be near-real-time."
                />

                <ComparisonRow
                  label="Waste"
                  left="Many requests may return no change."
                  right="Traffic occurs primarily for events."
                />

                <ComparisonRow
                  label="Complexity"
                  left="Simple consumer model."
                  right="Requires public callback, security and retry handling."
                />
              </div>
            </Section>

            <Section
              id="other-api-styles"
              eyebrow="Beyond REST"
              title="RPC, gRPC, SOAP and WebSockets"
            >
              <div className="space-y-6">
                <InfoCard icon={Send} title="RPC">
                  <p>
                    Remote Procedure Call APIs model operations rather than
                    resources.
                  </p>

                  <div className="mt-4 rounded-xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-200">
                    {`POST /calculateShipping
POST /generateInvoice
POST /approveLoan`}
                  </div>
                </InfoCard>

                <InfoCard icon={Zap} title="gRPC">
                  gRPC is commonly used for strongly typed high-performance
                  service-to-service APIs. Protocol Buffers define service
                  methods and messages.
                  <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-200">
                    {`service UserService {
  rpc GetUser(GetUserRequest)
      returns (UserResponse);
}`}
                  </pre>
                </InfoCard>

                <InfoCard icon={FileCode2} title="SOAP">
                  SOAP is an XML messaging protocol commonly associated with
                  formal service contracts and enterprise web-service
                  standards.
                </InfoCard>

                <InfoCard icon={ArrowLeftRight} title="WebSocket">
                  A WebSocket connection remains open for bidirectional
                  communication.
                  <FlowDiagram
                    title="Realtime communication"
                    items={[
                      "Client",
                      "Persistent Connection",
                      "Server",
                      "Server Push",
                      "Client",
                    ]}
                  />
                </InfoCard>
              </div>
            </Section>

            <Section
              id="openapi"
              eyebrow="Documentation"
              title="OpenAPI and Swagger"
              description="OpenAPI defines a machine-readable description format for HTTP APIs. Tooling can use that contract for documentation, validation, client generation, server stubs and testing."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard title="OpenAPI">
                  The specification describing how an HTTP API contract can be
                  represented in JSON or YAML.
                </InfoCard>

                <InfoCard title="Swagger">
                  A family of tools historically associated with the
                  specification and commonly used to edit, visualize and work
                  with OpenAPI descriptions.
                </InfoCard>
              </div>

              <div className="mt-6">
                <CodeBlock
                  code={openApiExample}
                  language="YAML"
                  title="OpenAPI example"
                />
              </div>

              <div className="mt-6">
                <FlowDiagram
                  title="API-first workflow"
                  items={[
                    "Define Contract",
                    "Review",
                    "Generate Docs",
                    "Implement",
                    "Contract Tests",
                    "Client SDKs",
                  ]}
                />
              </div>
            </Section>

            <Section
              id="gateway"
              eyebrow="System Design"
              title="API Gateway"
              description="An API Gateway can provide a managed entry point between external clients and backend services."
            >
              <FlowDiagram
                title="Typical API gateway request path"
                items={apiGatewayFlow}
              />

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <InfoCard title="Common responsibilities">
                  <ul className="space-y-2">
                    <Bullet>Authentication integration</Bullet>
                    <Bullet>Authorization policy enforcement</Bullet>
                    <Bullet>Rate limiting</Bullet>
                    <Bullet>Routing</Bullet>
                    <Bullet>Request/response transformation</Bullet>
                    <Bullet>Observability metadata</Bullet>
                  </ul>
                </InfoCard>

                <InfoCard title="Gateway vs load balancer">
                  <p>
                    A load balancer primarily distributes traffic among
                    available backends.
                  </p>

                  <p className="mt-3">
                    An API gateway commonly understands more application/API
                    concerns such as routes, authentication, quotas and API
                    policies.
                  </p>

                  <p className="mt-3">
                    Real architectures frequently contain both.
                  </p>
                </InfoCard>
              </div>
            </Section>

            <Section
              id="observability"
              eyebrow="Production"
              title="API observability"
              description="When an API fails in production, you need enough information to answer what failed, where, for whom and why."
            >
              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard icon={FileCode2} title="Logs">
                  Structured events such as request metadata, errors, business
                  events and dependency failures.
                </InfoCard>

                <InfoCard icon={Gauge} title="Metrics">
                  Numerical measurements aggregated over time.
                </InfoCard>

                <InfoCard icon={Workflow} title="Distributed tracing">
                  Follows a request across gateways, services, queues and
                  downstream dependencies.
                </InfoCard>
              </div>

              <h3 className="mb-4 mt-8 text-xl font-bold text-slate-950">
                Useful API metrics
              </h3>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  "Request rate",
                  "p50 latency",
                  "p95 latency",
                  "p99 latency",
                  "4xx rate",
                  "5xx rate",
                  "Timeout rate",
                  "Upstream latency",
                  "Cache hit rate",
                  "Rate-limit rejections",
                  "Database latency",
                  "Queue depth",
                ].map((metric) => (
                  <div
                    key={metric}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700"
                  >
                    {metric}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <FlowDiagram
                  title="Trace example"
                  items={[
                    "Request ID",
                    "API Gateway",
                    "Order Service",
                    "Payment Service",
                    "Database",
                    "Trace",
                  ]}
                />
              </div>
            </Section>

            <Section
              id="testing"
              eyebrow="Quality"
              title="API testing strategy"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard title="Unit tests">
                  Test isolated business logic and validation rules quickly.
                </InfoCard>

                <InfoCard title="Integration tests">
                  Test your service with real or representative databases,
                  caches, queues and framework layers.
                </InfoCard>

                <InfoCard title="Contract tests">
                  Verify that providers and consumers agree on request and
                  response contracts.
                </InfoCard>

                <InfoCard title="End-to-end tests">
                  Test important user flows through multiple system components.
                </InfoCard>

                <InfoCard title="Load tests">
                  Measure behavior under expected and elevated traffic.
                </InfoCard>

                <InfoCard title="Security tests">
                  Validate authentication, authorization, input handling and
                  sensitive endpoints.
                </InfoCard>
              </div>

              <h3 className="mb-4 mt-8 text-xl font-bold text-slate-950">
                Test more than the happy path
              </h3>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  "Missing authentication token",
                  "Expired or invalid token",
                  "Unauthorized resource access",
                  "Invalid JSON",
                  "Missing required field",
                  "Wrong field type",
                  "Unknown resource",
                  "Duplicate request",
                  "Concurrent update",
                  "Rate limit exceeded",
                  "Database unavailable",
                  "Upstream service timeout",
                  "Malformed pagination cursor",
                  "Maximum page-size enforcement",
                  "Webhook duplicate delivery",
                  "Webhook invalid signature",
                ].map((test) => (
                  <div
                    key={test}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700"
                  >
                    <Check size={16} className="shrink-0 text-emerald-500" />
                    {test}
                  </div>
                ))}
              </div>

              <div className="mt-7 grid gap-6 xl:grid-cols-2">
                <CodeBlock
                  code={curlExample}
                  language="Bash"
                  title="Testing with cURL"
                />

                <CodeBlock
                  code={fetchExample}
                  language="JavaScript"
                  title="Calling an API from frontend"
                />
              </div>
            </Section>

            <Section
              id="production-design"
              eyebrow="Backend"
              title="Putting everything together"
              description="A production API is more than a controller connected directly to a database. Each layer solves a different concern."
            >
              <FlowDiagram
                title="Production API architecture"
                items={[
                  "Client",
                  "CDN / WAF",
                  "Load Balancer",
                  "API Gateway",
                  "Service",
                  "Cache",
                  "Database",
                ]}
              />

              <div className="mt-6">
                <FlowDiagram
                  title="Inside the service"
                  items={[
                    "Controller",
                    "Validation",
                    "Authorization",
                    "Service Layer",
                    "Repository",
                    "Database / External API",
                  ]}
                />
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <InfoCard title="Controller">
                  Converts the transport request into application input and
                  returns the transport response. Avoid putting the entire
                  business domain here.
                </InfoCard>

                <InfoCard title="Service layer">
                  Holds important business workflows and coordinates domain
                  operations.
                </InfoCard>

                <InfoCard title="Repository / DAO">
                  Encapsulates persistence access instead of spreading database
                  queries throughout controllers.
                </InfoCard>

                <InfoCard title="DTO / API model">
                  Keeps your public contract separate from raw database entities
                  where appropriate.
                </InfoCard>
              </div>

              <div className="mt-7">
                <CodeBlock
                  code={springExample}
                  language="Java / Spring Boot"
                  title="REST controller example"
                />
              </div>

              <h3 className="mb-4 mt-8 text-xl font-bold text-slate-950">
                Concurrent updates
              </h3>

              <p className="text-sm leading-7 text-slate-600">
                Two clients may read the same resource and attempt to update it
                at nearly the same time. Depending on the domain, you may use
                database transactions, optimistic locking/version fields,
                conditional requests, pessimistic locks or application-specific
                conflict handling.
              </p>

              <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-xs leading-6 text-slate-200">
                {`Client A reads version = 8
Client B reads version = 8

Client A updates resource -> version = 9

Client B tries:
UPDATE users
SET name = 'New Name', version = 9
WHERE id = 42 AND version = 8

0 rows updated -> conflict detected`}
              </pre>

              <h3 className="mb-4 mt-8 text-xl font-bold text-slate-950">
                Timeouts, retries and circuit breakers
              </h3>

              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard title="Timeout">
                  Never wait forever for a dependency. Bound how long a request
                  or downstream call may take.
                </InfoCard>

                <InfoCard title="Retry">
                  Retry only when the failure and operation semantics make retry
                  safe. Use bounded retries and backoff rather than infinite
                  loops.
                </InfoCard>

                <InfoCard title="Circuit breaker">
                  Temporarily stop sending requests to a dependency that is
                  repeatedly failing, allowing systems to fail faster and
                  recover.
                </InfoCard>
              </div>

              <div className="mt-6">
                <FlowDiagram
                  title="Retry with exponential backoff"
                  items={[
                    "Attempt 1",
                    "Fail",
                    "Wait",
                    "Attempt 2",
                    "Fail",
                    "Longer wait",
                    "Attempt 3",
                  ]}
                />
              </div>
            </Section>

            <Section
              id="interview"
              eyebrow="Interview Preparation"
              title="Important API interview questions"
              description="Use these questions to test whether you understand the concepts rather than only memorizing definitions."
            >
              <div className="grid gap-3 md:grid-cols-2">
                {interviewQuestions.map((question, index) => (
                  <div
                    key={question}
                    className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-600">
                      {index + 1}
                    </span>

                    <p className="text-sm font-medium leading-6 text-slate-700">
                      {question}
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              id="checklist"
              eyebrow="Revision"
              title="Production API design checklist"
            >
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  "Resources and endpoint naming are consistent.",
                  "HTTP methods follow their intended semantics.",
                  "Correct HTTP status codes are returned.",
                  "Request data is validated.",
                  "Authentication is enforced where required.",
                  "Authorization is checked per protected operation/resource.",
                  "TLS/HTTPS is used.",
                  "Sensitive values are never returned accidentally.",
                  "Error responses follow one predictable structure.",
                  "Collections use bounded pagination.",
                  "Filtering and sorting parameters are documented.",
                  "Breaking changes have a compatibility/versioning plan.",
                  "Retry-sensitive writes use appropriate idempotency protection.",
                  "Rate limiting protects capacity and sensitive operations.",
                  "Caching behavior is explicitly designed.",
                  "External dependency calls have timeouts.",
                  "Retries are bounded and safe.",
                  "Concurrent modifications are considered.",
                  "Webhooks verify authenticity.",
                  "Webhook processing handles duplicate events.",
                  "Logs contain request/correlation IDs where useful.",
                  "Latency, errors and traffic are monitored.",
                  "API documentation matches the real contract.",
                  "Automated contract/integration tests protect the API.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    <span className="text-sm leading-6 text-slate-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            <section className="py-12 sm:py-16">
              <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 sm:p-8">
                <div className="max-w-3xl">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                    Final mental model
                  </p>

                  <h2 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">
                    Good APIs are contracts, not just URLs
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                    A strong API combines clear resource or operation design,
                    predictable request/response contracts, correct transport
                    semantics, authentication, authorization, validation,
                    idempotency, scalability, observability and documentation.
                    REST, GraphQL and gRPC are tools; good engineering comes from
                    understanding the trade-offs and failure modes behind them.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-black text-slate-950">
                  Frequently asked questions
                </h2>

                <div className="mt-5 space-y-3">
                  {faqs.map((faq) => (
                    <details
                      key={faq.question}
                      className="group rounded-2xl border border-slate-200 bg-white p-5"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-950">
                        {faq.question}

                        <ChevronDown
                          size={18}
                          className="shrink-0 transition group-open:rotate-180"
                        />
                      </summary>

                      <p className="mt-4 text-sm leading-7 text-slate-600">
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}

export default APIResource;