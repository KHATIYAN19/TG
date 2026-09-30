import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  AlarmClock,
  ArrowLeft,
  ArrowRight,
  BadgeAlert,
  Bell,
  BookOpen,
  Boxes,
  CheckCircle2,
  Clock3,
  Cloud,
  Code2,
  Database,
  FileClock,
  GitBranch,
  Inbox,
  Layers3,
  Lightbulb,
  ListOrdered,
  LockKeyhole,
  MailWarning,
  MessageCircleMore,
  MessageSquareMore,
  Network,
  PackageCheck,
  Radio,
  RefreshCcw,
  Repeat2,
  Route,
  Server,
  ShieldCheck,
  Sparkles,
  BrainCircuit,
  TicketPercent,
  Timer,
  TriangleAlert,
  Users,
  Workflow,
} from "lucide-react";

const SITE_URL =
  "https://www.targettrek.in";

const PAGE_URL =
  `${SITE_URL}/resources/hld/message-queue`;

const BOOK_URL =
  "/book/system-design/hld";

const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.localStorage.getItem("theme") === "dark"
    ? "dark"
    : "light";
};

const PREVIOUS_TOPIC = {
  title: "Database Design",

  description:
    "Learn SQL, NoSQL, replication, sharding, indexes, consistency, ACID, CAP and database selection.",

  path:
    "/resources/hld/database",
};

const NEXT_TOPIC = {
  title: "Rate Limiting",

  description:
    "Learn token bucket, leaky bucket, sliding windows, Redis-based distributed rate limiting and handling traffic spikes.",

  path:
    "/resources/hld/rate-limiting",
};

const CONTENT_SECTIONS = [
  { id: "fundamentals", label: "What is a Queue?" },
  { id: "sync-vs-async", label: "Sync vs Async" },
  { id: "architecture", label: "Architecture" },
  { id: "selection-guide", label: "Which Pattern to Choose?" },
  { id: "point-to-point", label: "Point-to-Point" },
  { id: "work-queue", label: "Work Queue" },
  { id: "pub-sub", label: "Pub/Sub" },
  { id: "fanout", label: "Fanout" },
  { id: "topic-routing", label: "Topic Routing" },
  { id: "fifo", label: "FIFO" },
  { id: "priority", label: "Priority Queue" },
  { id: "delayed", label: "Delayed Queue" },
  { id: "retry", label: "Retry Queue" },
  { id: "dlq", label: "DLQ" },
  { id: "request-reply", label: "Request-Reply" },
  { id: "streams", label: "Streams / Logs" },
  { id: "consumer-groups", label: "Consumer Groups" },
  { id: "guarantees", label: "Delivery Guarantees" },
  { id: "ordering", label: "Ordering" },
  { id: "ack", label: "ACK / Visibility" },
  { id: "idempotency", label: "Idempotency" },
  { id: "backpressure", label: "Backpressure" },
  { id: "partitioning", label: "Partitioning" },
  { id: "kafka-internals", label: "Kafka Internals" },
  { id: "rabbitmq-internals", label: "RabbitMQ Internals" },
  { id: "managed-queues", label: "Managed Queues" },
  { id: "comparison", label: "Technology Choice" },
  { id: "code-examples", label: "Code Examples" },
  { id: "bookmyshow", label: "BookMyShow Case Study" },
  { id: "failures", label: "Failures" },
  { id: "interview", label: "Interview Q&A" },
];

const QUEUE_TYPES = [
  {
    id: "point-to-point",
    title: "Point-to-Point Queue",
    icon: Inbox,
    speciality: "A producer sends a message to a queue and one consumer instance normally processes that message.",
    theory: [
      "Point-to-point messaging is the simplest queue model. Producers write independent units of work to a queue. Consumers compete for those messages, and a single message is normally completed by one consumer.",
      "The queue decouples producer speed from consumer speed. If producers temporarily create 20,000 jobs per second while workers process only 10,000, the backlog grows instead of forcing every producer request to wait for workers.",
      "This model is ideal when the work itself should happen once, not once per subscriber. If three independent systems all need the same event, use pub-sub or an event stream instead of putting all three systems behind one competing-consumer queue.",
    ],
    bestWhen: [
      "One job should be owned by one worker.",
      "You want background processing and horizontal worker scaling.",
      "Temporary traffic spikes should be buffered.",
      "The producer does not need the final result immediately.",
    ],
    avoidWhen: [
      "Many independent services must each receive the same message.",
      "You need replay of historical events for new consumers.",
      "Strict global ordering is more important than parallel processing.",
    ],
    useCases: ["Email jobs", "Image processing", "Invoice generation", "Order fulfilment jobs", "Payment reconciliation"],
    benefit: "Simple competing-consumer model with natural horizontal scaling.",
    issue: "Duplicate delivery is still possible after failures, so consumers should be idempotent.",
    ordering: "Usually no global ordering guarantee unless the queue explicitly provides FIFO semantics.",
    delivery: "Commonly at-least-once with ACK/delete semantics.",
    scaling: "Add consumers until worker capacity catches up with production, subject to downstream limits.",
    commonTech: "RabbitMQ queues, Amazon SQS standard queues, Azure Service Bus queues, Google Cloud Tasks/Pub/Sub subscriptions depending on semantics.",
    interviewTip: "Say 'one message -> one successful worker' rather than 'one queue can have only one consumer'. Multiple consumers can compete for the same queue.",
    diagram: {
      source: "Order API",
      sourceSub: "Creates background job",
      middle: "orders.queue",
      middleSub: "M1 • M2 • M3",
      targets: [
        ["Worker 1", "Processes M1", Server],
        ["Worker 2", "Processes M2", Server],
        ["Worker 3", "Processes M3", Server],
      ],
      label: "each message -> one worker",
    },
  },
  {
    id: "work-queue",
    title: "Work Queue / Competing Consumers",
    icon: Workflow,
    speciality: "Multiple workers consume from the same queue to divide expensive or slow work.",
    theory: [
      "A work queue is a point-to-point queue specifically used to distribute jobs across a worker pool. Every worker runs the same or compatible processing logic and competes for available work.",
      "The most important design controls are worker concurrency, prefetch/batch size, acknowledgement timing and downstream capacity. Fetching too many jobs per worker can create unfairness; fetching too few can underutilize workers.",
      "Work queues are commonly autoscaled from queue depth, oldest-message age, consumer utilization or processing latency. Queue depth alone is not enough because a queue containing ten 30-minute video jobs is very different from ten 20-millisecond jobs.",
    ],
    bestWhen: ["CPU-heavy or I/O-heavy background jobs", "Jobs are independent", "Workers can be scaled horizontally", "The user does not need synchronous completion"],
    avoidWhen: ["Every downstream system needs a copy", "A single job must be processed by several stages with different semantics without explicit workflow design", "Work depends on strict cross-job ordering"],
    useCases: ["Video transcoding", "PDF generation", "Thumbnail generation", "ML inference jobs", "Bulk email sending"],
    benefit: "Throughput increases by adding workers while keeping producers simple.",
    issue: "One slow job can occupy a worker for a long time; use timeouts, visibility extension, job splitting or dedicated queues where needed.",
    ordering: "Usually weak ordering because multiple workers run concurrently.",
    delivery: "At-least-once is common; ACK only after successful completion.",
    scaling: "Autoscale worker count while protecting databases, APIs and other dependencies.",
    commonTech: "RabbitMQ, SQS, Celery brokers, cloud task queues, Redis-backed job systems for simpler workloads.",
    interviewTip: "Mention prefetch/concurrency and poison-job handling. Scaling workers without protecting downstream systems can move the bottleneck instead of solving it.",
    diagram: {
      source: "Upload API",
      sourceSub: "video.mp4",
      middle: "transcode.jobs",
      middleSub: "buffered work",
      targets: [
        ["Worker A", "1080p", Server],
        ["Worker B", "720p", Server],
        ["Worker C", "480p", Server],
      ],
      label: "competing workers",
    },
  },
  {
    id: "pub-sub",
    title: "Publish / Subscribe",
    icon: Radio,
    speciality: "A publisher emits an event without knowing every subscriber; multiple independent subscribers can each receive it.",
    theory: [
      "Pub-sub is used when an event is interesting to multiple independent systems. A publisher writes to a topic or exchange, and subscriptions independently receive the event.",
      "Each subscriber owns its own processing progress. Notification can fail while analytics succeeds. This independence is one of the biggest benefits of event-driven architecture.",
      "Pub-sub should represent something that happened, such as ORDER_CREATED or PAYMENT_SUCCEEDED, rather than a tightly coupled remote procedure call disguised as a message whenever possible.",
    ],
    bestWhen: ["Multiple systems react to the same business event", "You want loose coupling between publisher and subscribers", "Subscribers can fail or scale independently", "New subscribers may be added later"],
    avoidWhen: ["Exactly one worker should own the task", "The publisher requires an immediate response from every subscriber", "The event contract is unstable and unmanaged"],
    useCases: ["Order created events", "Booking confirmed events", "Audit pipelines", "Analytics", "Cache invalidation"],
    benefit: "New consumers can be added without changing the producer's core business flow.",
    issue: "Schema evolution, duplicate events and eventual consistency must be designed explicitly.",
    ordering: "Depends on topic/partition model; often ordered only within a key or partition.",
    delivery: "Frequently at-least-once per subscription/consumer group.",
    scaling: "Each subscription scales independently, which prevents one slow consumer from blocking unrelated consumers.",
    commonTech: "Kafka topics with different consumer groups, Google Pub/Sub topics/subscriptions, SNS+SQS, RabbitMQ exchanges with multiple queues.",
    interviewTip: "Differentiate pub-sub from fanout implementation. Pub-sub is the communication model; fanout is one routing behavior that broadcasts to all bound consumers.",
    diagram: {
      source: "Order Service",
      sourceSub: "ORDER_CREATED",
      middle: "orders.created",
      middleSub: "topic / event bus",
      targets: [
        ["Notification", "send confirmation", Bell],
        ["Analytics", "record conversion", Activity],
        ["Warehouse", "store event", Database],
      ],
      label: "each subscriber receives the event",
    },
  },
  {
    id: "fanout",
    title: "Fanout / Broadcast",
    icon: GitBranch,
    speciality: "Every bound subscriber receives a copy of every published message.",
    theory: [
      "Fanout is a broadcast routing pattern. The publisher does not select a destination using a routing key; every bound queue/subscriber gets the message.",
      "It is useful for system-wide events where all subscribers care about the same information. It is intentionally less selective than topic routing.",
      "Because one input message becomes many deliveries, fanout can multiply traffic substantially. Payload size, subscriber count and retry behavior should be considered before broadcasting high-volume events.",
    ],
    bestWhen: ["All subscribers truly need every event", "Broadcasting configuration or cache invalidation", "Independent audit/notification pipelines"],
    avoidWhen: ["Most consumers only need a small subset", "Subscriber count is huge and payloads are large", "Selective routing would dramatically reduce traffic"],
    useCases: ["Cache invalidation", "System-wide domain events", "Audit copies", "Broadcast notifications"],
    benefit: "Very simple broadcast semantics.",
    issue: "Network/storage cost grows with the number of subscribers.",
    ordering: "Ordering is normally determined independently for each subscriber/queue.",
    delivery: "Each subscriber gets its own delivery/acknowledgement lifecycle.",
    scaling: "Subscribers scale independently, but publisher fanout amplification must be budgeted.",
    commonTech: "RabbitMQ fanout exchange, SNS fanout to SQS, pub-sub systems with multiple subscriptions.",
    interviewTip: "Use fanout only when broadcast is intended. Do not send every event to every service and make consumers discard 99% of traffic.",
    diagram: {
      source: "Config Service",
      sourceSub: "CONFIG_CHANGED",
      middle: "fanout exchange",
      middleSub: "broadcast",
      targets: [
        ["Service A", "refresh config", Server],
        ["Service B", "refresh config", Server],
        ["Service C", "refresh config", Server],
      ],
      label: "broadcast copy",
    },
  },
  {
    id: "topic-routing",
    title: "Topic-Based Routing",
    icon: Route,
    speciality: "Subscribers receive only events whose topic/routing key matches their subscription pattern.",
    theory: [
      "Topic routing sits between one-to-one queues and full broadcast. Producers publish a meaningful routing key such as payment.success, payment.failed or order.created.",
      "Subscribers bind to exact keys or patterns such as payment.*. This keeps unrelated traffic away from consumers and makes ownership clearer.",
      "Topic taxonomies are part of architecture. Without naming conventions and schema ownership, organizations accumulate ambiguous event names and brittle consumers.",
    ],
    bestWhen: ["Consumers need subsets of events", "Event families share a broker", "Routing rules are stable and meaningful"],
    avoidWhen: ["Every consumer needs every message", "Routing logic becomes so complicated that it hides business workflow", "Topics are being used as a replacement for authorization"],
    useCases: ["payments.*", "orders.created", "users.registered", "region.in.*", "inventory.low"],
    benefit: "Reduces unnecessary deliveries while keeping publishers decoupled.",
    issue: "Topic and schema governance become important at scale.",
    ordering: "Usually ordering is scoped to a topic/partition/queue, not globally across unrelated keys.",
    delivery: "Broker dependent; often durable at-least-once.",
    scaling: "Different routing keys can feed independent queues and worker pools.",
    commonTech: "RabbitMQ topic exchanges, Kafka topic naming conventions, cloud pub-sub filters, SNS filtering.",
    interviewTip: "Give a concrete key such as payment.success and show which services subscribe to it instead of defining topic routing abstractly.",
    diagram: {
      source: "Payment Service",
      sourceSub: "routingKey=payment.success",
      middle: "payments exchange",
      middleSub: "topic routing",
      targets: [
        ["Booking Queue", "payment.success", Inbox],
        ["Fraud Queue", "payment.*", ShieldCheck],
        ["Failure Queue", "payment.failed", MailWarning],
      ],
      label: "routing-key match",
    },
  },
  {
    id: "fifo",
    title: "FIFO / Ordered Queue",
    icon: ListOrdered,
    speciality: "Messages are processed in an intended sequence, often globally or within a message group/key.",
    theory: [
      "FIFO is needed when processing M2 before M1 would produce an invalid state. A common example is CREATED -> PAID -> SHIPPED for the same order.",
      "The strongest form, global ordering, severely limits parallelism because all messages effectively pass through one ordering lane. Large systems therefore prefer per-entity or per-key ordering.",
      "A practical design hashes orderId, bookingId or accountId to a partition/message group. Different entities run in parallel while events for the same entity remain ordered.",
    ],
    bestWhen: ["State transitions must be applied in order", "Per-account ledger events", "Inventory mutations for the same SKU", "Workflow steps for one entity"],
    avoidWhen: ["Jobs are independent", "Throughput matters more than ordering", "You are demanding global ordering without a business requirement"],
    useCases: ["Order lifecycle", "Account events", "Seat state transitions", "Per-SKU inventory updates"],
    benefit: "Prevents out-of-order state transitions where sequence matters.",
    issue: "Ordering reduces parallelism and one slow/poison message can block later messages in the same ordered lane.",
    ordering: "Global FIFO or, preferably, per-key/message-group FIFO.",
    delivery: "Can still be at-least-once; FIFO does not automatically mean exactly-once business effects.",
    scaling: "Scale across many keys/partitions rather than trying to parallelize one strict ordered stream.",
    commonTech: "Kafka partition ordering, SQS FIFO message groups, RabbitMQ single-active-consumer or carefully designed queues.",
    interviewTip: "Ask 'ordering for what?' Per-order ordering is usually enough; global ordering for every order in the company is rarely required.",
    diagram: {
      source: "Order Service",
      sourceSub: "key=order-501",
      middle: "Partition / FIFO Group",
      middleSub: "CREATED -> PAID -> SHIPPED",
      targets: [["Order Consumer", "applies sequence", Server]],
      label: "ordered consumption",
    },
  },
  {
    id: "priority",
    title: "Priority Queue",
    icon: BadgeAlert,
    speciality: "Higher-priority work is processed ahead of lower-priority work.",
    theory: [
      "Priority queues are useful when not all work has equal urgency. Security incidents, payment reconciliation or premium interactive jobs may need to jump ahead of marketing or batch work.",
      "A single priority number is not enough for production design. You must prevent starvation of low-priority work through aging, weighted scheduling or reserved worker capacity.",
      "Many teams use separate queues per priority because it gives clearer capacity controls and avoids broker-specific priority behavior.",
    ],
    bestWhen: ["Business urgency differs significantly", "SLA classes exist", "Critical incidents must bypass bulk jobs"],
    avoidWhen: ["Everything is marked high priority", "Fairness is required", "Priority adds complexity without an actual SLA difference"],
    useCases: ["Security alerts", "Payment incidents", "Premium customer jobs", "Urgent notifications"],
    benefit: "Critical work is not trapped behind a large low-priority backlog.",
    issue: "Low-priority jobs can starve if scheduling has no fairness mechanism.",
    ordering: "Priority usually overrides pure FIFO across priority levels; FIFO may still hold within one level.",
    delivery: "Same as the underlying queue; priority changes scheduling, not reliability semantics.",
    scaling: "Often use separate worker pools or reserved capacity for high-priority lanes.",
    commonTech: "RabbitMQ priority queues, separate SQS queues, Redis/job frameworks with priority lanes.",
    interviewTip: "Discuss starvation. A priority queue answer is incomplete without explaining how low-priority work eventually progresses.",
    diagram: {
      source: "Job Producers",
      sourceSub: "P1 / P2 / P3",
      middle: "Priority Scheduler",
      middleSub: "P1 first, fairness applied",
      targets: [
        ["Critical Worker", "P1 security", ShieldCheck],
        ["Normal Worker", "P2 payments", Server],
        ["Bulk Worker", "P3 marketing", Server],
      ],
      label: "priority-aware dispatch",
    },
  },
  {
    id: "delayed",
    title: "Delayed / Scheduled Queue",
    icon: AlarmClock,
    speciality: "A message becomes eligible for processing only after a delay or scheduled timestamp.",
    theory: [
      "Delayed queues represent future work without repeatedly scanning a database. The broker or scheduler stores a job until its due time and then makes it consumable.",
      "This is useful for booking expiry, retry-after delays, reminder notifications and cart abandonment. The delay should be treated as approximate unless the technology explicitly provides strict scheduling guarantees.",
      "For extremely large scheduling horizons or millions of long-term timers, consider whether a dedicated scheduler plus durable database is more appropriate than keeping every future task inside a broker.",
    ],
    bestWhen: ["Short/medium future actions", "Booking or lock expiry", "Retry after backoff", "Reminder workflows"],
    avoidWhen: ["You need sub-millisecond timer precision", "Jobs are scheduled months/years out and broker retention/cost is unsuitable", "The queue technology does not support delay semantics cleanly"],
    useCases: ["Release seat hold in 5 minutes", "Send reminder tomorrow", "Retry in 30 seconds", "Cart abandonment email"],
    benefit: "Avoids wasteful database polling for every future task.",
    issue: "Clock behavior, cancellation and large scheduled-job volume must be handled carefully.",
    ordering: "Due-time order may not be exact under retries and distributed processing.",
    delivery: "Normally inherits at-least-once semantics from the underlying queue.",
    scaling: "Partition timers/scheduled jobs and make handlers idempotent because expiry can race with success events.",
    commonTech: "SQS delay queues/timers, RabbitMQ delayed-message patterns, cloud schedulers + queues, Redis sorted sets for controlled workloads.",
    interviewTip: "In booking systems, explain the race: payment success may arrive at the same time as seat-expiry. The consumer must check authoritative booking state before releasing the seat.",
    diagram: {
      source: "Booking Service",
      sourceSub: "expire hold at T+5m",
      middle: "Delayed Queue",
      middleSub: "hidden until due time",
      targets: [["Expiry Worker", "HELD -> AVAILABLE if still unpaid", Timer]],
      label: "after delay",
    },
  },
  {
    id: "retry",
    title: "Retry Queue",
    icon: Repeat2,
    speciality: "Temporarily failed work is retried after controlled backoff instead of immediately hammering the dependency.",
    theory: [
      "Retries are for transient failure: network timeouts, temporary 5xx responses, rate limits or short dependency outages. Permanent validation errors should not loop through retries forever.",
      "A strong retry design uses bounded attempts, exponential backoff and jitter. Jitter prevents thousands of failed messages from retrying at exactly the same second and recreating the outage.",
      "Many architectures use retry tiers such as 5 seconds, 30 seconds and 5 minutes before moving to a DLQ. The original attempt count and failure reason should travel with the message metadata.",
    ],
    bestWhen: ["Temporary downstream failure", "Recoverable timeout", "Provider rate limiting with retry guidance", "Transient database/network issue"],
    avoidWhen: ["Invalid payload", "Business-rule rejection", "Permanent authentication/authorization failure", "Side effect is not idempotent"],
    useCases: ["Email provider timeout", "Payment callback handling", "Webhook delivery", "Temporary DB outage"],
    benefit: "Allows dependencies to recover without losing work.",
    issue: "Unlimited/immediate retries create retry storms and can make an outage worse.",
    ordering: "Retries can break original ordering unless retry behavior is integrated with the ordered partition/group.",
    delivery: "At-least-once by design; duplicate-safe handlers are mandatory.",
    scaling: "Separate retry traffic from fresh traffic when old failures could overwhelm the healthy path.",
    commonTech: "Retry queues/exchanges, SQS redrive policies, Kafka retry topics, application-level scheduled retries.",
    interviewTip: "Classify errors before retrying. 'Retry everything 3 times' is not a robust strategy.",
    diagram: {
      source: "Consumer",
      sourceSub: "provider timeout",
      middle: "Retry Tier",
      middleSub: "5s -> 30s -> 5m + jitter",
      targets: [
        ["Consumer Retry", "success -> ACK", CheckCircle2],
        ["DLQ", "max attempts", MailWarning],
      ],
      label: "bounded retry",
    },
  },
  {
    id: "dlq",
    title: "Dead Letter Queue (DLQ)",
    icon: MailWarning,
    speciality: "Messages that cannot be processed successfully are isolated for investigation and controlled replay.",
    theory: [
      "A DLQ prevents poison messages from blocking healthy traffic forever. Messages usually arrive after exhausting retries, failing validation or violating processing rules.",
      "The DLQ is not the end of the design. Production systems need alerts, dashboards, failure metadata, inspection tooling and a safe replay path after the underlying bug or data issue is fixed.",
      "Blindly replaying an entire DLQ can repeat the outage. Replay should be rate-limited, observable and often filtered by failure reason or event version.",
    ],
    bestWhen: ["Poison messages must be isolated", "You need operator visibility", "You need controlled replay after fixing bugs"],
    avoidWhen: ["Used as a substitute for validation", "Nobody owns monitoring/replay", "Sensitive payloads are stored without correct retention/security controls"],
    useCases: ["Schema mismatch", "Repeated provider failure", "Unexpected data", "Buggy consumer version"],
    benefit: "Bad messages stop poisoning the normal processing path.",
    issue: "An unmonitored DLQ becomes a silent data-loss graveyard.",
    ordering: "Moving one failed message out can allow later messages to progress, which may affect ordering semantics.",
    delivery: "Stores failed deliveries for later inspection/replay.",
    scaling: "DLQ volume should normally be low; sudden growth is an incident signal, not a scaling target.",
    commonTech: "SQS DLQ, RabbitMQ dead-letter exchange, Kafka dead-letter topics, Service Bus dead-letter subqueues.",
    interviewTip: "Always mention alerting + replay strategy. Saying 'after 3 retries move to DLQ' is only half the answer.",
    diagram: {
      source: "Main Consumer",
      sourceSub: "fails repeatedly",
      middle: "DLQ",
      middleSub: "payload + reason + attempts",
      targets: [
        ["Alerting", "page/notify owner", Bell],
        ["Replay Tool", "fix -> controlled replay", RefreshCcw],
      ],
      label: "investigate before replay",
    },
  },
  {
    id: "request-reply",
    title: "Request-Reply over Messaging",
    icon: MessageCircleMore,
    speciality: "A requester sends a command with correlation/reply metadata and waits for a response message.",
    theory: [
      "Request-reply can be built on a broker when asynchronous transport is required but the caller still expects a response. The request carries a correlationId and usually a reply destination.",
      "This pattern is more complex than normal HTTP/gRPC because you must handle timeouts, abandoned replies, correlation state and duplicate responses. It should not be chosen merely to avoid synchronous APIs.",
      "It is useful across unreliable or disconnected boundaries, long-running operations or messaging-only environments. For ordinary low-latency service-to-service calls, HTTP/gRPC is often simpler.",
    ],
    bestWhen: ["Messaging is the required transport", "Operation may survive requester reconnection", "You need queued requests but eventual responses"],
    avoidWhen: ["Simple low-latency RPC is enough", "Caller cannot tolerate asynchronous timeout semantics", "Correlation state would add unnecessary complexity"],
    useCases: ["Long-running report generation", "Legacy broker integrations", "Device/edge communication", "Async command status"],
    benefit: "Keeps queued transport while still supporting correlated responses.",
    issue: "Timeouts, duplicate responses and reply-queue lifecycle are harder than ordinary one-way messaging.",
    ordering: "Usually based on correlation/request IDs rather than global ordering.",
    delivery: "Both request and reply paths need reliability/idempotency decisions.",
    scaling: "Workers scale like a work queue; response routing must remain correlated to callers.",
    commonTech: "RabbitMQ reply-to patterns, JMS request/reply, custom broker-based command-response workflows.",
    interviewTip: "Do not force request-reply into an architecture where plain HTTP/gRPC would be clearer. Explain why queued transport is necessary.",
    diagram: {
      source: "Report API",
      sourceSub: "correlationId=req-42",
      middle: "report.request",
      middleSub: "replyTo=report.reply",
      targets: [["Report Worker", "publishes correlated result", Server], ["Reply Queue", "req-42 response", Inbox]],
      label: "correlated reply",
    },
  },
  {
    id: "streams",
    title: "Event Stream / Append-Only Log",
    icon: FileClock,
    speciality: "Events are appended to a durable ordered log and retained so consumers can replay them independently.",
    theory: [
      "A stream/log differs from a traditional destructive queue. Consuming an event usually advances a consumer offset rather than deleting the event immediately for everyone.",
      "Retention makes replay possible. A new analytics consumer can start from older offsets, or an existing consumer can rebuild state after a bug fix.",
      "Partitioning provides scale. Events with the same key are routed to the same partition for ordered processing, while unrelated keys are processed in parallel across partitions.",
    ],
    bestWhen: ["Replay matters", "Many independent consumers", "High-throughput event pipelines", "CDC/analytics/event sourcing", "Long-lived domain events"],
    avoidWhen: ["You only need a simple small task queue", "Operating partitions/offsets/retention is unnecessary complexity", "Per-message rich routing is the dominant requirement"],
    useCases: ["Kafka pipelines", "CDC", "Activity streams", "Analytics", "Event sourcing", "Data lake ingestion"],
    benefit: "Durable history can be replayed by many independent consumers.",
    issue: "Partitioning, retention, offset management and schema evolution add operational/design complexity.",
    ordering: "Ordered within a partition, not globally across all partitions.",
    delivery: "Commonly at-least-once; stronger semantics may exist within a defined platform scope.",
    scaling: "Increase partitions for parallelism, then scale consumers within each consumer group up to partition count.",
    commonTech: "Apache Kafka, Redpanda, Amazon Kinesis, Pulsar-like streaming platforms.",
    interviewTip: "The key difference is retained log + independent offsets/replay, not simply 'Kafka is faster than RabbitMQ'.",
    diagram: {
      source: "Event Producers",
      sourceSub: "append events",
      middle: "orders topic",
      middleSub: "P0 | P1 | P2 + retained offsets",
      targets: [
        ["Analytics Group", "own offsets", Activity],
        ["Notification Group", "own offsets", Bell],
        ["Warehouse Group", "replay/history", Database],
      ],
      label: "independent consumer groups",
    },
  },
];

const TECHNOLOGY_CHOICES = [
  {
    name: "Kafka / Distributed Log",
    useWhen: "You need retained events, replay, very high throughput, partitions, consumer groups, CDC or stream processing.",
    avoidWhen: "You only need a tiny task queue with simple per-message routing and do not need replay/retention complexity.",
    strengths: ["Replayable retained log", "High throughput", "Partition ordering", "Independent consumer groups", "Strong ecosystem for CDC/streaming"],
    tradeoffs: ["Partition planning", "Consumer lag/offset operations", "Schema governance", "Cluster/managed-service complexity"],
  },
  {
    name: "RabbitMQ / Traditional Broker",
    useWhen: "You need work queues, acknowledgements, flexible routing, exchanges, per-message delivery controls and business messaging.",
    avoidWhen: "Your primary requirement is a long-retained high-throughput event history that many consumers replay independently.",
    strengths: ["Direct/topic/fanout routing", "Natural task queues", "ACK/prefetch controls", "Mature business messaging semantics"],
    tradeoffs: ["Replay is not its core model", "Queue topology needs design", "Large retained event-history workloads may fit logs better"],
  },
  {
    name: "Managed Queue (SQS-style)",
    useWhen: "You want durable asynchronous task processing without operating broker clusters yourself.",
    avoidWhen: "You need sophisticated broker-side routing or long replayable streams as the central abstraction.",
    strengths: ["Low operational burden", "Elastic scaling", "Visibility timeout", "DLQ/redrive", "Cloud integration"],
    tradeoffs: ["Provider semantics/limits", "Less control over internals", "Cross-cloud portability", "Feature set differs by provider"],
  },
  {
    name: "Managed Pub/Sub",
    useWhen: "Many independent cloud services need the same event and you want managed topic/subscription scaling.",
    avoidWhen: "Only one worker should own a task and no broadcast/subscription model is needed.",
    strengths: ["Independent subscriptions", "Elastic fanout", "Push/pull options depending on provider", "Low broker operations"],
    tradeoffs: ["Provider-specific filtering/ordering", "At-least-once duplicates", "Cost can grow with fanout/egress"],
  },
];

const INTERVIEW_QUESTIONS = [
  {
    category: "Fundamentals",
    question: "Why do we use a message queue in system design?",
    answer: "A queue decouples producers from consumers, lets work happen asynchronously, buffers traffic bursts, isolates temporary consumer failures and lets producers/consumers scale independently. The trade-off is eventual consistency plus new concerns such as retries, duplicates, ordering, monitoring and DLQs.",
  },
  {
    category: "Fundamentals",
    question: "When should I NOT use a message queue?",
    answer: "Do not add a queue when the caller needs an immediate authoritative response and a synchronous API is simpler, when the workload is tiny and operational complexity outweighs benefit, or when delayed/eventual processing would violate business semantics. A queue is an architectural boundary, not a default for every service call.",
  },
  {
    category: "Patterns",
    question: "Queue vs pub-sub — what is the difference?",
    answer: "A work queue normally delivers one job to one successful consumer from a competing worker pool. Pub-sub lets multiple independent subscriptions each receive the same event. Use a queue for 'do this job once'; use pub-sub for 'this happened and several systems may react'.",
  },
  {
    category: "Patterns",
    question: "Fanout vs topic routing?",
    answer: "Fanout broadcasts every message to every bound subscriber. Topic routing uses a key/pattern such as payment.success or payment.* so only interested subscribers receive it. Fanout is simpler; topic routing reduces unnecessary traffic and is better when subscriber interests differ.",
  },
  {
    category: "Patterns",
    question: "FIFO vs standard queue — which is better?",
    answer: "Neither is universally better. Choose FIFO only when business correctness requires ordering for a key or group. Standard queues usually allow greater throughput and parallelism. In interviews, first identify the ordering scope: per-order or per-account ordering is commonly enough, while global ordering is expensive.",
  },
  {
    category: "Reliability",
    question: "At-most-once vs at-least-once vs exactly-once?",
    answer: "At-most-once may lose messages but avoids broker-level redelivery. At-least-once retries, reducing loss but allowing duplicates, so consumers must be idempotent. Exactly-once must be defined carefully: a broker may provide exactly-once processing within its own scope, but external databases, payment APIs and emails still require transactions/idempotency to produce one business effect.",
  },
  {
    category: "Reliability",
    question: "Why can duplicate delivery happen even after a consumer successfully processes a message?",
    answer: "The consumer may commit the database transaction and then crash before sending the ACK. The broker cannot know the business side effect succeeded, so it redelivers. This is why processing and deduplication/idempotency must be designed together.",
  },
  {
    category: "Reliability",
    question: "How do you make a consumer idempotent?",
    answer: "Use a stable eventId or business idempotency key, enforce a unique database constraint, keep a processed-events table, perform deduplication in the same database transaction as the business update, and make external side effects use provider idempotency keys when available.",
  },
  {
    category: "Reliability",
    question: "What is a poison message?",
    answer: "A poison message consistently fails because of invalid data, incompatible schema or a deterministic code path. Retrying forever wastes capacity. After classification/bounded retries, move it to a DLQ with failure metadata and alert the owning team.",
  },
  {
    category: "Reliability",
    question: "How should retries be designed?",
    answer: "Retry only transient failures; use bounded attempts, exponential backoff and jitter. Separate retry traffic from fresh traffic when necessary, preserve attempt count and last error, and move exhausted/permanent failures to a DLQ. Never immediately retry a failing dependency in a tight loop.",
  },
  {
    category: "Reliability",
    question: "What is a visibility timeout?",
    answer: "In queue systems such as SQS-style services, receiving a message temporarily hides it from other consumers. If the consumer deletes/ACKs it before the timeout, processing is complete. If the consumer crashes or the timeout expires, the message becomes visible again and may be processed by another worker.",
  },
  {
    category: "Ordering",
    question: "How do you preserve order without destroying throughput?",
    answer: "Use per-key ordering. Hash orderId/accountId/bookingId to a partition or FIFO message group. Events for the same entity remain sequential while different keys are processed in parallel. Avoid global ordering unless it is truly required.",
  },
  {
    category: "Ordering",
    question: "What happens when one message in an ordered stream keeps failing?",
    answer: "If later messages must not pass it, that partition/group can become blocked. You need bounded retry, quarantine/DLQ policy and a business decision about whether later messages may proceed. This is one reason ordered systems need explicit poison-message handling.",
  },
  {
    category: "Scaling",
    question: "What is backpressure?",
    answer: "Backpressure appears when producers create work faster than consumers and the backlog grows. Handle it with consumer autoscaling, producer throttling, batching, admission control, prioritization, load shedding for non-critical work and downstream protection. A queue can absorb bursts but cannot absorb infinite sustained overload.",
  },
  {
    category: "Scaling",
    question: "Which metric is more useful: queue depth or oldest-message age?",
    answer: "Both matter. Queue depth tells you backlog size, while oldest-message age tells you user-visible delay/SLA impact. Also monitor production rate, consumption rate, processing latency, retry rate, DLQ rate and downstream saturation.",
  },
  {
    category: "Kafka",
    question: "Why does Kafka use partitions?",
    answer: "Partitions split a topic into parallel ordered logs. They provide horizontal throughput, distribute storage and let consumers in one group process different partitions concurrently. Ordering is guaranteed within a partition, so partition-key choice directly affects correctness and load distribution.",
  },
  {
    category: "Kafka",
    question: "What happens if a consumer group has 10 consumers but the topic has 3 partitions?",
    answer: "At most three consumers can actively process those three partitions at one time in that group; the remaining consumers are idle or standby. To increase parallelism, increase partition count or redesign the workload—but adding partitions has ordering/key-distribution consequences.",
  },
  {
    category: "Kafka",
    question: "What is consumer lag?",
    answer: "Lag is the distance between the latest available offsets and the offsets a consumer group has processed/committed. Rising lag means the group is falling behind. Diagnose processing latency, downstream bottlenecks, insufficient consumers, hot partitions or failures.",
  },
  {
    category: "Kafka",
    question: "How do you choose a Kafka partition key?",
    answer: "Choose a stable key that groups events requiring order, such as orderId. It should also have high enough cardinality to distribute load. A poor key such as one celebrityId or one region can create a hot partition even when other partitions are idle.",
  },
  {
    category: "RabbitMQ",
    question: "Direct vs topic vs fanout exchange?",
    answer: "Direct routes when the routing key exactly matches a binding key. Topic supports wildcard patterns such as payment.*. Fanout ignores routing keys and broadcasts to all bound queues. Choose based on how selective routing must be.",
  },
  {
    category: "RabbitMQ",
    question: "What is prefetch and why does it matter?",
    answer: "Prefetch limits how many unacknowledged messages a consumer can hold. Too high can create unfair distribution and large redelivery after a crash; too low can underutilize fast workers because they repeatedly wait for the broker. Tune it to processing cost and concurrency.",
  },
  {
    category: "Managed Queue",
    question: "When would you choose SQS-style managed queues instead of Kafka?",
    answer: "Choose managed queues for durable async jobs when you value low operational overhead, visibility timeouts, elastic scaling and simple task ownership. Choose Kafka-style logs when replayable retained streams, many independent consumer groups, partitioned ordering and event-history processing are central.",
  },
  {
    category: "Architecture",
    question: "What is the dual-write problem?",
    answer: "If a service commits a database update and publishes an event as two separate operations, one can succeed while the other fails. The transactional outbox solves this by storing the business row and an outbox row in one DB transaction, then publishing the outbox asynchronously through a worker or CDC.",
  },
  {
    category: "Architecture",
    question: "What is the transactional inbox pattern?",
    answer: "An inbox stores incoming event IDs/messages in the consumer's database transaction before or while applying business state. It provides durable deduplication and makes at-least-once delivery easier to handle when the same event is received again.",
  },
  {
    category: "Architecture",
    question: "Command vs event — what should go on the queue?",
    answer: "A command asks a specific capability to do something, such as GenerateInvoice. An event states a fact that already happened, such as InvoiceGenerated. Commands usually have one logical owner; events may have many independent consumers. Keeping this distinction makes event-driven systems easier to reason about.",
  },
  {
    category: "BookMyShow",
    question: "Should BookMyShow put seat locking behind a queue?",
    answer: "Usually no for the user-facing lock decision. The user needs an immediate answer on whether the seat was acquired, so use an atomic lock/conditional database operation synchronously. Queues are excellent after that critical decision for expiry timers, ticket generation, notifications, analytics and other asynchronous side effects.",
  },
  {
    category: "BookMyShow",
    question: "Does a queue prevent double booking?",
    answer: "Not by itself. Double booking is prevented by authoritative concurrency control such as an atomic seat lock, conditional update, unique constraint or transaction. A queue can serialize some workflows, but correctness should not depend on assuming messages never duplicate or arrive late.",
  },
  {
    category: "BookMyShow",
    question: "How would you release a seat after the payment window expires?",
    answer: "Publish a delayed expiry event containing bookingId/seatId/holdVersion. At expiry, the worker reads authoritative booking state and releases only if the booking is still HELD/PENDING and the hold version matches. If payment already succeeded, the expiry becomes a no-op. This makes the race safe and idempotent.",
  },
  {
    category: "Scenario",
    question: "How would you send 10 million emails without overloading the provider?",
    answer: "Write email jobs to a durable work queue, partition/categorize if needed, run workers with concurrency and provider rate limits, use batching where supported, retry transient failures with backoff+jitter, put permanent failures in a DLQ, track idempotency and monitor queue age, success rate and provider throttling.",
  },
  {
    category: "Scenario",
    question: "A queue backlog is growing even after doubling workers. What do you check?",
    answer: "Compare arrival vs processing rate, inspect oldest-message age, worker CPU, external API/DB saturation, lock contention, hot partitions, per-message latency, retry storms and poison messages. If the bottleneck is the database or provider, adding more workers can make throughput worse.",
  },
  {
    category: "Scenario",
    question: "How do you safely replay a DLQ?",
    answer: "First fix or classify the root cause, validate schema/version compatibility, choose a bounded subset, replay at a controlled rate through the normal idempotent handler, monitor downstream capacity and keep audit metadata. Never bulk-replay blindly into the same failing dependency.",
  },
  {
    category: "Scenario",
    question: "How do you evolve message schemas without breaking consumers?",
    answer: "Prefer backward-compatible additions, version events, avoid silently changing field meaning, use schema validation/registry where appropriate, support old/new versions during migration, deploy consumers before producers for compatible changes and define ownership/deprecation rules.",
  },
];


const SectionHeading = ({
  id,
  eyebrow,
  title,
  description,
  icon: Icon,
  isDark,
}) => {
  return (
    <div
      id={id}
      className="scroll-mt-40 sm:scroll-mt-44"
    >
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

        <div>
          <h2
            className={`text-2xl font-black tracking-tight sm:text-3xl ${
              isDark
                ? "text-white"
                : "text-slate-950"
            }`}
          >
            {title}
          </h2>

          {description && (
            <p
              className={`mt-2 max-w-3xl text-sm leading-7 sm:text-base ${
                isDark
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const DiagramNode = ({
  icon: Icon,
  title,
  subtitle,
  isDark,
  highlight = false,
  danger = false,
  success = false,
}) => {
  let classes =
    isDark
      ? "border-slate-700 bg-slate-900"
      : "border-slate-200 bg-white";

  let iconClass =
    isDark
      ? "text-slate-400"
      : "text-slate-500";

  if (highlight) {
    classes =
      isDark
        ? "border-blue-700 bg-blue-950/40"
        : "border-blue-200 bg-blue-50";

    iconClass =
      "text-blue-500";
  }

  if (danger) {
    classes =
      isDark
        ? "border-red-900 bg-red-950/30"
        : "border-red-200 bg-red-50";

    iconClass =
      "text-red-500";
  }

  if (success) {
    classes =
      isDark
        ? "border-emerald-900 bg-emerald-950/30"
        : "border-emerald-200 bg-emerald-50";

    iconClass =
      "text-emerald-500";
  }

  return (
    <div
      className={`min-w-0 rounded-xl border p-3 text-center sm:p-4 ${classes}`}
    >
      {Icon && (
        <Icon
          className={`mx-auto h-5 w-5 ${iconClass}`}
        />
      )}

      <p
        className={`mt-2 break-words text-sm font-black ${
          isDark
            ? "text-white"
            : "text-slate-900"
        }`}
      >
        {title}
      </p>

      {subtitle && (
        <p
          className={`mt-1 break-words text-[11px] leading-5 ${
            isDark
              ? "text-slate-500"
              : "text-slate-500"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

const DownArrow = ({
  label,
  isDark,
}) => {
  return (
    <div className="flex flex-col items-center py-2">
      {label && (
        <span
          className={`mb-1 text-center text-[10px] font-black uppercase tracking-wide ${
            isDark
              ? "text-slate-500"
              : "text-slate-400"
          }`}
        >
          {label}
        </span>
      )}

      <ArrowRight
        className={`h-5 w-5 rotate-90 ${
          isDark
            ? "text-slate-600"
            : "text-slate-300"
        }`}
      />
    </div>
  );
};

const Callout = ({
  type = "info",
  title,
  children,
  isDark,
}) => {
  const values = {
    info: {
      icon:
        Lightbulb,

      light:
        "border-blue-100 bg-blue-50 text-blue-950",

      dark:
        "border-blue-900/50 bg-blue-950/20 text-blue-100",

      iconColor:
        "text-blue-500",
    },

    warning: {
      icon:
        TriangleAlert,

      light:
        "border-amber-200 bg-amber-50 text-amber-950",

      dark:
        "border-amber-900/50 bg-amber-950/20 text-amber-100",

      iconColor:
        "text-amber-500",
    },

    success: {
      icon:
        CheckCircle2,

      light:
        "border-emerald-200 bg-emerald-50 text-emerald-950",

      dark:
        "border-emerald-900/50 bg-emerald-950/20 text-emerald-100",

      iconColor:
        "text-emerald-500",
    },
  };

  const selected =
    values[type] ||
    values.info;

  const Icon =
    selected.icon;

  return (
    <div
      className={`my-5 rounded-2xl border p-4 sm:p-5 ${
        isDark
          ? selected.dark
          : selected.light
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`mt-0.5 h-5 w-5 shrink-0 ${selected.iconColor}`}
        />

        <div className="min-w-0">
          {title && (
            <p className="font-black">
              {title}
            </p>
          )}

          <div className="mt-1 text-sm leading-7">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const CodeBlock = ({
  title,
  children,
}) => {
  return (
    <div className="my-5 min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#07101f]">
      {title && (
        <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-400">
          <Code2 className="h-3.5 w-3.5" />

          {title}
        </div>
      )}

      <pre
        className="
          block
          w-full
          max-w-full
          overflow-x-hidden
          whitespace-pre-wrap
          break-words
          p-4
          font-mono
          text-[11px]
          leading-5
          text-slate-100

          sm:overflow-x-auto
          sm:whitespace-pre
          sm:text-sm
          sm:leading-6
        "
      >
        <code>
          {children}
        </code>
      </pre>
    </div>
  );
};

const QueuePatternDiagram = ({ queue, isDark, surface }) => {
  const diagram = queue.diagram;

  if (!diagram) {
    return null;
  }

  return (
    <div className={`mt-5 rounded-2xl border p-4 sm:p-7 ${surface}`}>
      <DiagramNode
        icon={queue.icon}
        title={diagram.source}
        subtitle={diagram.sourceSub}
        isDark={isDark}
      />

      <DownArrow label="Publish / enqueue" isDark={isDark} />

      <DiagramNode
        icon={Inbox}
        title={diagram.middle}
        subtitle={diagram.middleSub}
        isDark={isDark}
        highlight
      />

      <DownArrow label={diagram.label} isDark={isDark} />

      <div className={`grid gap-3 ${diagram.targets.length === 1 ? "sm:grid-cols-1" : diagram.targets.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {diagram.targets.map(([title, subtitle, Icon]) => (
          <DiagramNode
            key={`${queue.id}-${title}`}
            icon={Icon}
            title={title}
            subtitle={subtitle}
            isDark={isDark}
          />
        ))}
      </div>
    </div>
  );
};


const HLDMessageQueueResource =
  () => {
    const navigate =
      useNavigate();

    const [theme, setTheme] = useState(getStoredTheme);

    const isDark = theme === "dark";

    useEffect(() => {
      if (typeof window === "undefined") {
        return undefined;
      }

      const syncTheme = () => {
        const nextTheme = getStoredTheme();
        setTheme((currentTheme) =>
          currentTheme === nextTheme ? currentTheme : nextTheme
        );
      };

      syncTheme();

      window.addEventListener("storage", syncTheme);
      window.addEventListener("themechange", syncTheme);
      window.addEventListener("focus", syncTheme);
      document.addEventListener("visibilitychange", syncTheme);

      const observer = new MutationObserver(syncTheme);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });

      const intervalId = window.setInterval(syncTheme, 300);

      return () => {
        window.removeEventListener("storage", syncTheme);
        window.removeEventListener("themechange", syncTheme);
        window.removeEventListener("focus", syncTheme);
        document.removeEventListener("visibilitychange", syncTheme);
        observer.disconnect();
        window.clearInterval(intervalId);
      };
    }, []);

    const surface =
      isDark
        ? "border-slate-800 bg-slate-900"
        : "border-slate-200 bg-white";

    const textPrimary =
      isDark
        ? "text-white"
        : "text-slate-950";

    const textSecondary =
      isDark
        ? "text-slate-400"
        : "text-slate-600";

    const seoDescription =
      "Complete message queue and event-driven architecture guide for system design interviews: queue patterns, pub-sub, Kafka, RabbitMQ, managed queues, FIFO, retries, DLQ, delivery guarantees, ordering, idempotency, consumer groups, backpressure, transactional outbox, code examples and a detailed BookMyShow case study.";

    const faqData =
      useMemo(
        () => [
          {
            question:
              "Why do we use a message queue in system design?",

            answer:
              "Message queues decouple producers from consumers, enable asynchronous processing, absorb traffic bursts and allow workloads to be processed independently.",
          },

          {
            question:
              "What is the difference between a queue and pub-sub?",

            answer:
              "In a traditional work queue one message is generally handled by one consumer, while pub-sub allows multiple independent subscribers to receive the same published event.",
          },

          {
            question:
              "What is a dead letter queue?",

            answer:
              "A dead letter queue stores messages that could not be processed successfully after configured retry attempts or because they violate processing rules.",
          },

          {
            question:
              "What is at-least-once delivery?",

            answer:
              "At-least-once delivery means the system retries until the message is processed or acknowledged, so the same message may be delivered more than once.",
          },

          {
            question:
              "Why must consumers be idempotent?",

            answer:
              "Distributed messaging systems can deliver duplicates due to retries or failures, so idempotent consumers prevent repeated delivery from applying the same business effect multiple times.",
          },

          {
            question:
              "When should I choose Kafka instead of RabbitMQ?",

            answer:
              "Choose Kafka-style logs when retained event history, replay, high-throughput streams, partitions and independent consumer groups are central. Choose RabbitMQ-style brokers when flexible routing, traditional work queues and acknowledgement-driven business messaging are the primary need.",
          },

          {
            question:
              "Does a message queue guarantee exactly-once business processing?",

            answer:
              "Not automatically. Distributed failures can still create duplicate deliveries or uncertain side effects. Exactly-once business effects normally require a precise scope plus idempotency, transactions, unique constraints or provider idempotency keys.",
          },

          {
            question:
              "Where should queues be used in a BookMyShow-style booking system?",

            answer:
              "Keep seat locking and immediate booking decisions synchronous and atomic. Use queues for delayed seat-hold expiry, payment events, ticket generation, notifications, analytics, retries and other asynchronous side effects.",
          },
        ],
        []
      );

    const articleSchema = {
      "@context":
        "https://schema.org",

      "@type":
        "TechArticle",

      headline:
        "Message Queues in System Design: Complete HLD Guide",

      description:
        seoDescription,

      url:
        PAGE_URL,

      mainEntityOfPage: {
        "@type":
          "WebPage",

        "@id":
          PAGE_URL,
      },

      author: {
        "@type":
          "Organization",

        name:
          "TargetTrek",
      },

      publisher: {
        "@type":
          "Organization",

        name:
          "TargetTrek",

        url:
          SITE_URL,
      },

      inLanguage: "en",
      isAccessibleForFree: true,
      learningResourceType: "Guide",
      educationalUse: "Interview preparation",
      proficiencyLevel: "Intermediate",
      keywords: [
        "message queue system design",
        "Kafka system design",
        "RabbitMQ",
        "pub-sub",
        "dead letter queue",
        "retry queue",
        "consumer groups",
        "event-driven architecture",
      ],
      isPartOf: {
        "@type": "WebSite",
        name: "TargetTrek",
        url: SITE_URL,
      },
      about: [
        "Message Queues",
        "Kafka",
        "RabbitMQ",
        "Event Driven Architecture",
        "Pub Sub",
        "Distributed Systems",
        "High Level Design",
      ],
    };

    const breadcrumbSchema = {
      "@context":
        "https://schema.org",

      "@type":
        "BreadcrumbList",

      itemListElement: [
        {
          "@type":
            "ListItem",

          position: 1,

          name:
            "TargetTrek",

          item:
            SITE_URL,
        },

        {
          "@type":
            "ListItem",

          position: 2,

          name:
            "HLD Resources",

          item:
            `${SITE_URL}/resources/hld`,
        },

        {
          "@type":
            "ListItem",

          position: 3,

          name:
            "Message Queues",

          item:
            PAGE_URL,
        },
      ],
    };

    const faqSchema = {
      "@context":
        "https://schema.org",

      "@type":
        "FAQPage",

      mainEntity:
        faqData.map(
          (item) => ({
            "@type":
              "Question",

            name:
              item.question,

            acceptedAnswer: {
              "@type":
                "Answer",

              text:
                item.answer,
            },
          })
        ),
    };

    return (
      <>

        <Helmet>
          <title>
            Message Queues in System
            Design: Kafka, Pub/Sub,
            Retry & DLQ | TargetTrek
          </title>

          <meta
            name="description"
            content={
              seoDescription
            }
          />

          <meta
            name="keywords"
            content="message queue system design, event driven architecture, Kafka system design, RabbitMQ, SQS queue, pub sub, work queue, FIFO queue, priority queue, delayed queue, dead letter queue, retry queue, consumer groups, delivery guarantees, idempotency, transactional outbox, BookMyShow system design, HLD interview"
          />

          <meta
            name="robots"
            content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
          />

          <meta
            name="googlebot"
            content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
          />

          <meta
            name="author"
            content="TargetTrek"
          />

          <meta
            name="theme-color"
            content={isDark ? "#090d14" : "#f8fafc"}
          />

          <link
            rel="canonical"
            href={
              PAGE_URL
            }
          />

          <meta
            property="og:type"
            content="article"
          />

          <meta
            property="og:site_name"
            content="TargetTrek"
          />

          <meta
            property="og:locale"
            content="en_IN"
          />

          <meta
            property="og:title"
            content="Message Queues in System Design — Complete HLD Guide"
          />

          <meta
            property="og:description"
            content={
              seoDescription
            }
          />

          <meta
            property="og:url"
            content={
              PAGE_URL
            }
          />

          <meta
            name="twitter:card"
            content="summary_large_image"
          />

          <meta
            name="twitter:title"
            content="Message Queues in System Design — Complete HLD Guide"
          />

          <meta
            name="twitter:description"
            content={
              seoDescription
            }
          />

          <meta
            name="twitter:url"
            content={PAGE_URL}
          />

          <script
            type="application/ld+json"
          >
            {JSON.stringify(
              articleSchema
            )}
          </script>

          <script
            type="application/ld+json"
          >
            {JSON.stringify(
              breadcrumbSchema
            )}
          </script>

          <script
            type="application/ld+json"
          >
            {JSON.stringify(
              faqSchema
            )}
          </script>
        </Helmet>

        <div
          className={`min-h-screen overflow-x-hidden pt-20 transition-colors duration-300 sm:pt-24 ${
            isDark
              ? "bg-[#090d14] text-slate-100"
              : "bg-slate-50 text-slate-900"
          }`}
        >

          <div
            className={`border-b ${
              isDark
                ? "border-slate-800 bg-[#090d14]"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8">
              <button
                type="button"
                aria-label="Back to HLD resources"
                onClick={() =>
                  navigate(
                    "/resources/hld"
                  )
                }
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                  isDark
                    ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-700 hover:text-blue-400"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                <ArrowLeft className="h-4 w-4" />

                <span className="hidden sm:inline">
                  HLD Resources
                </span>

                <span className="sm:hidden">
                  Back
                </span>
              </button>
            </div>
          </div>

          <header
            className={`border-b ${
              isDark
                ? "border-slate-800 bg-gradient-to-b from-violet-950/20 to-[#090d14]"
                : "border-slate-200 bg-gradient-to-b from-violet-50 to-white"
            }`}
          >
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
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
                    Message Queues
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                      isDark
                        ? "bg-slate-800 text-slate-300"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Clock3 className="h-3 w-3" />

                    70+ min detailed guide
                  </span>
                </div>

                <h1
                  className={`mt-5 text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl ${
                    isDark
                      ? "text-white"
                      : "text-slate-950"
                  }`}
                >
                  Message Queues &
                  Event-Driven
                  Systems
                </h1>

                <p
                  className={`mt-5 max-w-3xl text-base leading-8 sm:text-lg ${textSecondary}`}
                >
                  Learn how queues
                  decouple services,
                  absorb traffic
                  spikes and power
                  asynchronous
                  systems. Understand
                  work queues,
                  pub-sub, Kafka,
                  retries, DLQs,
                  delivery
                  guarantees,
                  ordering,
                  consumer groups,
                  idempotency and
                  failure handling.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    aria-label="Start learning message queue fundamentals"
                    onClick={() =>
                      document
                        .getElementById(
                          "fundamentals"
                        )
                        ?.scrollIntoView({
                          behavior:
                            "smooth",
                        })
                    }
                    className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
                  >
                    Start Learning
                  </button>

                  <button
                    type="button"
                    aria-label="Open Mastering System Design HLD book"
                    onClick={() =>
                      navigate(
                        BOOK_URL
                      )
                    }
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto ${
                      isDark
                        ? "border-slate-700 bg-slate-900 text-slate-200"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />

                    Master HLD Book
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div
            className={`sticky top-20 z-30 border-b backdrop-blur sm:top-24 ${
              isDark
                ? "border-slate-800 bg-[#090d14]/95"
                : "border-slate-200 bg-white/95"
            }`}
          >
            <nav aria-label="Message queue topics" className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-max gap-2 py-3">
                {CONTENT_SECTIONS.map(
                  (item) => (
                    <a
                      key={
                        item.id
                      }
                      href={`#${item.id}`}
                      className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                        isDark
                          ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      {
                        item.label
                      }
                    </a>
                  )
                )}
              </div>
            </nav>
          </div>

          <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

            <section>
              <SectionHeading
                id="fundamentals"
                eyebrow="Fundamentals"
                title="What is a Message Queue?"
                description="A message queue is an intermediary that allows one component to send work or events without requiring the receiving component to process them immediately."
                icon={MessageSquareMore}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-5 sm:p-7 ${surface}`}
              >
                <div className="mx-auto max-w-2xl">
                  <DiagramNode
                    icon={Server}
                    title="Producer"
                    subtitle="Creates message"
                    isDark={
                      isDark
                    }
                  />

                  <DownArrow
                    label="Publish"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Inbox}
                    title="Queue / Broker"
                    subtitle="Stores message temporarily"
                    isDark={
                      isDark
                    }
                    highlight
                  />

                  <DownArrow
                    label="Consume"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Consumer"
                    subtitle="Processes message"
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  [
                    "Decoupling",
                    "Producer does not need to know when or how quickly the consumer processes work.",
                  ],

                  [
                    "Asynchronous Processing",
                    "The request can finish while background work continues.",
                  ],

                  [
                    "Traffic Buffering",
                    "A queue can absorb temporary spikes while consumers catch up.",
                  ],

                  [
                    "Independent Scaling",
                    "Producer and consumer can scale separately.",
                  ],

                  [
                    "Failure Isolation",
                    "Temporary consumer failure does not necessarily lose incoming work.",
                  ],

                  [
                    "Load Leveling",
                    "Bursty incoming traffic can become smoother downstream processing.",
                  ],
                ].map(
                  (
                    [
                      title,
                      text,
                    ]
                  ) => (
                    <div
                      key={
                        title
                      }
                      className={`rounded-xl border p-5 ${surface}`}
                    >
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />

                      <h3
                        className={`mt-3 font-black ${textPrimary}`}
                      >
                        {title}
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-7 ${textSecondary}`}
                      >
                        {text}
                      </p>
                    </div>
                  )
                )}
              </div>

              <Callout
                type="info"
                title="Queue does not automatically mean Kafka"
                isDark={
                  isDark
                }
              >
                First identify what
                communication model
                you need: task queue,
                pub-sub, replayable
                stream, ordered
                events, delayed
                execution or routing.
                Then choose the
                technology.
              </Callout>
            </section>

            <section className="mt-16">
              <SectionHeading
                id="sync-vs-async"
                eyebrow="Architecture"
                title="Synchronous vs Asynchronous Communication"
                description="Queues are especially useful when the caller does not need every downstream activity to finish before receiving a response."
                icon={RefreshCcw}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <div
                  className={`rounded-2xl border p-5 sm:p-6 ${surface}`}
                >
                  <h3
                    className={`text-lg font-black ${textPrimary}`}
                  >
                    Synchronous
                  </h3>

                  <div className="mt-5">
                    <DiagramNode
                      icon={Users}
                      title="Client"
                      isDark={
                        isDark
                      }
                    />

                    <DownArrow
                      isDark={
                        isDark
                      }
                    />

                    <DiagramNode
                      icon={Server}
                      title="Order API"
                      isDark={
                        isDark
                      }
                    />

                    <DownArrow
                      label="Wait"
                      isDark={
                        isDark
                      }
                    />

                    <DiagramNode
                      icon={Bell}
                      title="Notification Service"
                      subtitle="Caller waits"
                      isDark={
                        isDark
                      }
                    />
                  </div>

                  <p
                    className={`mt-5 text-sm leading-7 ${textSecondary}`}
                  >
                    Useful when the
                    caller needs an
                    immediate answer
                    from the
                    dependency.
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-5 sm:p-6 ${surface}`}
                >
                  <h3
                    className={`text-lg font-black ${textPrimary}`}
                  >
                    Asynchronous
                  </h3>

                  <div className="mt-5">
                    <DiagramNode
                      icon={Users}
                      title="Client"
                      isDark={
                        isDark
                      }
                    />

                    <DownArrow
                      isDark={
                        isDark
                      }
                    />

                    <DiagramNode
                      icon={Server}
                      title="Order API"
                      isDark={
                        isDark
                      }
                    />

                    <DownArrow
                      label="Publish and return"
                      isDark={
                        isDark
                      }
                    />

                    <DiagramNode
                      icon={Inbox}
                      title="Message Queue"
                      isDark={
                        isDark
                      }
                      highlight
                    />

                    <DownArrow
                      isDark={
                        isDark
                      }
                    />

                    <DiagramNode
                      icon={Bell}
                      title="Notification Worker"
                      isDark={
                        isDark
                      }
                    />
                  </div>

                  <p
                    className={`mt-5 text-sm leading-7 ${textSecondary}`}
                  >
                    Useful when the
                    work can happen
                    independently
                    after the main
                    operation.
                  </p>
                </div>
              </div>

              <Callout
                type="warning"
                title="Do not make critical user confirmation asynchronous without thinking about semantics"
                isDark={
                  isDark
                }
              >
                If a user needs to
                know whether payment
                succeeded, simply
                placing everything
                behind a queue may
                not provide the
                required interaction.
                Async boundaries
                should follow
                business semantics.
              </Callout>
            </section>

            <section className="mt-16">
              <SectionHeading
                id="architecture"
                eyebrow="Core Components"
                title="Message Queue Architecture"
                description="Most messaging systems contain producers, brokers, queues or topics, consumers and some form of acknowledgement or offset tracking."
                icon={Network}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  <DiagramNode
                    icon={Server}
                    title="Producer A"
                    subtitle="Order service"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Producer B"
                    subtitle="Payment service"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Producer C"
                    subtitle="User service"
                    isDark={
                      isDark
                    }
                  />
                </div>

                <DownArrow
                  label="Messages / Events"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Boxes}
                  title="Message Broker"
                  subtitle="Queues • Topics • Partitions • Retention"
                  isDark={
                    isDark
                  }
                  highlight
                />

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <div className="grid gap-3 sm:grid-cols-3">
                  <DiagramNode
                    icon={Server}
                    title="Consumer A"
                    subtitle="Notification"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Consumer B"
                    subtitle="Analytics"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Consumer C"
                    subtitle="Inventory"
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                A Message Usually
                Contains
              </h3>

              <CodeBlock title="Event Example">
{`{
  "eventId": "evt_99201",

  "eventType": "ORDER_CREATED",

  "occurredAt": "2026-09-29T14:00:00Z",

  "version": 1,

  "correlationId": "req_123",

  "payload": {
    "orderId": "order_501",
    "userId": "user_42",
    "amount": 1999
  }
}`}
              </CodeBlock>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "eventId",
                    "Unique ID useful for deduplication.",
                  ],

                  [
                    "eventType",
                    "Identifies business event.",
                  ],

                  [
                    "timestamp",
                    "When event occurred.",
                  ],

                  [
                    "version",
                    "Supports schema evolution.",
                  ],

                  [
                    "correlationId",
                    "Helps trace one workflow across services.",
                  ],

                  [
                    "payload",
                    "Business data required by consumers.",
                  ],
                ].map(
                  (
                    [
                      key,
                      text,
                    ]
                  ) => (
                    <div
                      key={key}
                      className={`rounded-xl border p-4 ${surface}`}
                    >
                      <code className="text-sm font-black text-blue-500">
                        {key}
                      </code>

                      <p
                        className={`mt-1 text-sm ${textSecondary}`}
                      >
                        {text}
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>

            <section className="mt-16">
              <SectionHeading
                id="selection-guide"
                eyebrow="Decision Guide"
                title="Which Messaging Pattern Should You Choose?"
                description="Start from business semantics: who needs the message, whether ordering/replay is required, and whether the work is a command, job or event. Technology comes after the pattern."
                icon={BrainCircuit}
                isDark={isDark}
              />

              <div className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}>
                <DiagramNode
                  icon={MessageSquareMore}
                  title="What does the producer need?"
                  subtitle="job • event • ordered transition • scheduled work"
                  isDark={isDark}
                  highlight
                />

                <DownArrow label="one worker?" isDark={isDark} />

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <DiagramNode icon={Workflow} title="One Worker" subtitle="Work / point-to-point queue" isDark={isDark} />
                  <DiagramNode icon={Radio} title="Many Systems" subtitle="Pub/Sub or event stream" isDark={isDark} />
                  <DiagramNode icon={ListOrdered} title="Ordering" subtitle="FIFO / keyed partition" isDark={isDark} />
                  <DiagramNode icon={AlarmClock} title="Future Work" subtitle="Delayed / scheduled queue" isDark={isDark} />
                </div>

                <DownArrow label="then add reliability behavior" isDark={isDark} />

                <div className="grid gap-3 sm:grid-cols-3">
                  <DiagramNode icon={Repeat2} title="Retry" subtitle="transient failures" isDark={isDark} />
                  <DiagramNode icon={MailWarning} title="DLQ" subtitle="poison/permanent failures" isDark={isDark} />
                  <DiagramNode icon={ShieldCheck} title="Idempotency" subtitle="duplicate-safe business effects" isDark={isDark} />
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border">
                <div className="overflow-x-auto">
                  <table className={`w-full min-w-[1050px] ${isDark ? "bg-slate-900" : "bg-white"}`}>
                    <thead className={isDark ? "bg-slate-800" : "bg-slate-100"}>
                      <tr>
                        {["Requirement", "Best starting pattern", "Why", "Common mistake"].map((item) => (
                          <th key={item} className={`px-5 py-4 text-left text-xs font-black uppercase ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            {item}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["One background job -> one worker", "Work queue", "Simple ownership + horizontal worker scaling", "Using pub-sub and accidentally doing the job multiple times"],
                        ["Many services react to one fact", "Pub/Sub", "Each subscriber has independent progress", "Putting consumers in one competing queue so only one sees the event"],
                        ["Replay historical events", "Event stream/log", "Retention + offsets", "Using a destructive task queue and discovering history is gone"],
                        ["Same entity must stay ordered", "FIFO group / keyed partition", "Order only where business needs it", "Demanding global ordering and destroying throughput"],
                        ["Run work later", "Delayed queue", "No repeated DB polling", "Assuming expiry is exact and ignoring race with success"],
                        ["Temporary failure", "Retry queue", "Backoff gives dependency time to recover", "Immediate infinite retries"],
                        ["Permanent/poison failure", "DLQ", "Isolate + inspect + controlled replay", "Treating DLQ as a trash can nobody monitors"],
                      ].map((row, rowIndex) => (
                        <tr key={rowIndex} className={`border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className={`px-5 py-4 text-sm leading-6 ${cellIndex === 0 ? `font-black ${textPrimary}` : textSecondary}`}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {QUEUE_TYPES.map((queue, index) => (
              <section key={queue.id} className="mt-16">
                <SectionHeading
                  id={queue.id}
                  eyebrow={`Messaging Pattern ${index + 1}`}
                  title={queue.title}
                  description={queue.speciality}
                  icon={queue.icon}
                  isDark={isDark}
                />

                <div className={`mt-7 rounded-2xl border p-5 sm:p-7 ${surface}`}>
                  <h3 className={`text-lg font-black ${textPrimary}`}>Theory</h3>
                  <div className="mt-3 space-y-3">
                    {queue.theory.map((paragraph) => (
                      <p key={paragraph} className={`text-sm leading-7 sm:text-base ${textSecondary}`}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                <QueuePatternDiagram queue={queue} isDark={isDark} surface={surface} />

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div className={`rounded-2xl border p-5 ${isDark ? "border-emerald-900 bg-emerald-950/20" : "border-emerald-200 bg-emerald-50"}`}>
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-500">Best when</p>
                    <div className="mt-3 space-y-2">
                      {queue.bestWhen.map((item) => (
                        <div key={item} className="flex gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                          <span className={`text-sm leading-6 ${textSecondary}`}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`rounded-2xl border p-5 ${isDark ? "border-red-900 bg-red-950/20" : "border-red-200 bg-red-50"}`}>
                    <p className="text-xs font-black uppercase tracking-wider text-red-500">Avoid / reconsider when</p>
                    <div className="mt-3 space-y-2">
                      {queue.avoidWhen.map((item) => (
                        <div key={item} className="flex gap-2">
                          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                          <span className={`text-sm leading-6 ${textSecondary}`}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Ordering", queue.ordering],
                    ["Delivery", queue.delivery],
                    ["Scaling", queue.scaling],
                    ["Common Technologies", queue.commonTech],
                  ].map(([title, text]) => (
                    <div key={title} className={`rounded-xl border p-4 ${surface}`}>
                      <p className="text-xs font-black uppercase tracking-wide text-blue-500">{title}</p>
                      <p className={`mt-2 text-sm leading-6 ${textSecondary}`}>{text}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className={`rounded-xl border p-5 ${surface}`}>
                    <p className={`font-black ${textPrimary}`}>Good use cases</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {queue.useCases.map((item) => (
                        <span key={item} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${isDark ? "border-slate-700 bg-slate-800 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={`rounded-xl border p-5 ${surface}`}>
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-500">Main benefit</p>
                    <p className={`mt-2 text-sm leading-7 ${textSecondary}`}>{queue.benefit}</p>
                    <p className="mt-4 text-xs font-black uppercase tracking-wide text-amber-500">Main trade-off</p>
                    <p className={`mt-2 text-sm leading-7 ${textSecondary}`}>{queue.issue}</p>
                  </div>
                </div>

                <Callout type="info" title="Interview answer" isDark={isDark}>
                  {queue.interviewTip}
                </Callout>
              </section>
            ))}

            <section className="mt-16">
              <SectionHeading
                id="consumer-groups"
                eyebrow="Kafka Concept"
                title="Consumer Groups"
                description="Consumer groups allow multiple consumers to cooperatively process partitions while independent groups can read the same stream separately."
                icon={Users}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <div className="grid gap-2 sm:grid-cols-3">
                  <DiagramNode
                    icon={FileClock}
                    title="Partition 0"
                    isDark={
                      isDark
                    }
                    highlight
                  />

                  <DiagramNode
                    icon={FileClock}
                    title="Partition 1"
                    isDark={
                      isDark
                    }
                    highlight
                  />

                  <DiagramNode
                    icon={FileClock}
                    title="Partition 2"
                    isDark={
                      isDark
                    }
                    highlight
                  />
                </div>

                <DownArrow
                  label="Consumer Group: Notification"
                  isDark={
                    isDark
                  }
                />

                <div className="grid gap-2 sm:grid-cols-3">
                  <DiagramNode
                    icon={Server}
                    title="Consumer 1"
                    subtitle="P0"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Consumer 2"
                    subtitle="P1"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Consumer 3"
                    subtitle="P2"
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>

              <Callout
                type="info"
                title="Important scaling rule"
                isDark={
                  isDark
                }
              >
                If a topic has 3
                partitions, one
                consumer group can
                normally process at
                most 3 partitions in
                parallel. Adding 10
                consumers to the same
                group does not create
                10-way parallelism
                for only 3
                partitions.
              </Callout>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Different Consumer
                Groups
              </h3>

              <div
                className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Radio}
                  title="orders topic"
                  isDark={
                    isDark
                  }
                  highlight
                />

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <div className="grid gap-3 sm:grid-cols-3">
                  <DiagramNode
                    icon={Bell}
                    title="notification-group"
                    subtitle="Reads all orders"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Activity}
                    title="analytics-group"
                    subtitle="Reads all orders"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Database}
                    title="warehouse-group"
                    subtitle="Reads all orders"
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>
            </section>

            <section className="mt-16">
              <SectionHeading
                id="guarantees"
                eyebrow="Reliability"
                title="Message Delivery Guarantees"
                description="Delivery semantics define what can happen when producers, brokers or consumers fail."
                icon={ShieldCheck}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                <div
                  className={`rounded-2xl border p-5 ${surface}`}
                >
                  <h3
                    className={`font-black ${textPrimary}`}
                  >
                    At-Most-Once
                  </h3>

                  <p className="mt-1 text-xs font-black uppercase text-blue-500">
                    0 or 1 delivery
                  </p>

                  <p
                    className={`mt-4 text-sm leading-7 ${textSecondary}`}
                  >
                    Message is not
                    retried in a way
                    that creates
                    duplicates.
                    Failure may cause
                    data loss.
                  </p>

                  <p className="mt-4 text-sm font-bold text-emerald-500">
                    No duplicate
                    processing
                  </p>

                  <p className="mt-1 text-sm font-bold text-red-500">
                    Messages may be
                    lost
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${surface}`}
                >
                  <h3
                    className={`font-black ${textPrimary}`}
                  >
                    At-Least-Once
                  </h3>

                  <p className="mt-1 text-xs font-black uppercase text-blue-500">
                    1 or more
                    deliveries
                  </p>

                  <p
                    className={`mt-4 text-sm leading-7 ${textSecondary}`}
                  >
                    Failed or
                    unacknowledged
                    messages are
                    retried.
                    Duplicates are
                    possible.
                  </p>

                  <p className="mt-4 text-sm font-bold text-emerald-500">
                    Lower risk of
                    message loss
                  </p>

                  <p className="mt-1 text-sm font-bold text-amber-500">
                    Consumer must
                    handle duplicate
                    delivery
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${surface}`}
                >
                  <h3
                    className={`font-black ${textPrimary}`}
                  >
                    Exactly-Once
                  </h3>

                  <p className="mt-1 text-xs font-black uppercase text-blue-500">
                    One business
                    effect
                  </p>

                  <p
                    className={`mt-4 text-sm leading-7 ${textSecondary}`}
                  >
                    Exactly-once
                    processing is
                    difficult across
                    distributed
                    side effects and
                    usually depends
                    on carefully
                    defined scope,
                    transactions or
                    idempotency.
                  </p>
                </div>
              </div>

              <Callout
                type="warning"
                title="Exactly once needs a precise definition"
                isDark={
                  isDark
                }
              >
                A broker may offer
                exactly-once
                guarantees within
                part of its own
                processing model,
                but that does not
                magically make an
                external payment API,
                email provider and
                database transaction
                execute exactly once
                together.
              </Callout>
            </section>

            <section className="mt-16">
              <SectionHeading
                id="ordering"
                eyebrow="Correctness"
                title="Message Ordering"
                description="Ordering requirements directly affect partitioning and parallelism."
                icon={ListOrdered}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <div
                  className={`rounded-2xl border p-5 ${surface}`}
                >
                  <h3
                    className={`font-black ${textPrimary}`}
                  >
                    Global Ordering
                  </h3>

                  <CodeBlock>
{`M1
M2
M3
M4
M5`}
                  </CodeBlock>

                  <p
                    className={`text-sm leading-7 ${textSecondary}`}
                  >
                    Every message
                    needs one global
                    order. This often
                    limits
                    parallelism.
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${surface}`}
                >
                  <h3
                    className={`font-black ${textPrimary}`}
                  >
                    Per-Key Ordering
                  </h3>

                  <CodeBlock>
{`order-1:
CREATED -> PAID -> SHIPPED

order-2:
CREATED -> CANCELLED`}
                  </CodeBlock>

                  <p
                    className={`text-sm leading-7 ${textSecondary}`}
                  >
                    Often enough in
                    real systems.
                    Events for the
                    same entity are
                    routed to the
                    same partition.
                  </p>
                </div>
              </div>

              <CodeBlock title="Partition by Order ID">
{`partition =
    hash(orderId)
    % partitionCount;


// Same orderId
// -> same partition
// -> ordered processing
`}
              </CodeBlock>

              <Callout
                type="success"
                title="Prefer the narrowest ordering guarantee that solves the business problem"
                isDark={
                  isDark
                }
              >
                You often do not need
                every order in the
                company globally
                ordered. You usually
                need events for the
                same order to remain
                ordered.
              </Callout>
            </section>

            <section className="mt-16">
              <SectionHeading
                id="ack"
                eyebrow="Message Lifecycle"
                title="Acknowledgements & Visibility Timeout"
                description="The broker needs a way to determine whether processing completed successfully."
                icon={PackageCheck}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Inbox}
                  title="Queue"
                  subtitle="Message available"
                  isDark={
                    isDark
                  }
                  highlight
                />

                <DownArrow
                  label="Consumer receives message"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Server}
                  title="Consumer"
                  subtitle="Processing..."
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  label="ACK"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={CheckCircle2}
                  title="Message Complete"
                  subtitle="Remove / commit progress"
                  isDark={
                    isDark
                  }
                  success
                />
              </div>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                What if Consumer
                Crashes Before ACK?
              </h3>

              <div
                className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Server}
                  title="Consumer A"
                  subtitle="Gets M1"
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  label="Crash"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={TriangleAlert}
                  title="No ACK"
                  subtitle="Message is not considered complete"
                  isDark={
                    isDark
                  }
                  danger
                />

                <DownArrow
                  label="Visible again / reassigned"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Server}
                  title="Consumer B"
                  subtitle="Processes M1 again"
                  isDark={
                    isDark
                  }
                  success
                />
              </div>

              <Callout
                type="info"
                title="Visibility timeout"
                isDark={
                  isDark
                }
              >
                In queue systems that
                use visibility
                timeouts, a received
                message becomes
                temporarily invisible
                to other consumers.
                If it is not
                successfully deleted
                or acknowledged in
                time, it becomes
                available again.
              </Callout>
            </section>

            <section className="mt-16">
              <SectionHeading
                id="idempotency"
                eyebrow="Critical Concept"
                title="Idempotent Consumers"
                description="If the same message is delivered twice, processing it twice should not accidentally duplicate the business operation."
                icon={ShieldCheck}
                isDark={
                  isDark
                }
              />

              <h3
                className={`mt-7 text-xl font-black ${textPrimary}`}
              >
                Bad Consumer
              </h3>

              <CodeBlock>
{`async function handlePayment(message) {

    // If message is delivered twice,
    // customer may be charged twice.

    await paymentProvider.charge(
        message.userId,
        message.amount
    );
}`}
              </CodeBlock>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Better Pattern
              </h3>

              <CodeBlock title="Deduplicate by Event ID">
{`async function handleEvent(event) {

    const existing =
        await processedEvents.find(
            event.eventId
        );

    if (existing) {
        return;
    }

    await database.transaction(
        async (tx) => {

            await processBusinessLogic(
                tx,
                event
            );

            await tx.processedEvents.insert({
                eventId: event.eventId
            });
        }
    );
}`}
              </CodeBlock>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "Unique Event ID",
                    "Every event should have a stable identifier.",
                  ],

                  [
                    "Idempotency Key",
                    "Use a business key or client-provided key for operations that may be retried.",
                  ],

                  [
                    "Unique DB Constraint",
                    "Database constraints can prevent repeated insertion of the same effect.",
                  ],

                  [
                    "Processed Event Table",
                    "Track which events were already successfully applied.",
                  ],
                ].map(
                  (
                    [
                      title,
                      text,
                    ]
                  ) => (
                    <div
                      key={
                        title
                      }
                      className={`rounded-xl border p-5 ${surface}`}
                    >
                      <h3
                        className={`font-black ${textPrimary}`}
                      >
                        {title}
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-7 ${textSecondary}`}
                      >
                        {text}
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>

            <section className="mt-16">
              <SectionHeading
                eyebrow="Resilience"
                title="Retry Strategy"
                description="Retries should give temporary failures time to recover instead of immediately repeating the same failing operation."
                icon={Repeat2}
                isDark={
                  isDark
                }
              />

              <CodeBlock title="Exponential Backoff">
{`Attempt 1 -> immediately

Attempt 2 -> 2 seconds

Attempt 3 -> 4 seconds

Attempt 4 -> 8 seconds

Attempt 5 -> 16 seconds

Then -> DLQ`}
              </CodeBlock>

              <CodeBlock title="Backoff + Jitter">
{`delay =
    min(
        MAX_DELAY,
        BASE_DELAY * (2 ** retryCount)
    );

jitter =
    random(0, 1000);

nextRetry =
    delay + jitter;
`}
              </CodeBlock>

              <Callout
                type="warning"
                title="Why jitter?"
                isDark={
                  isDark
                }
              >
                If 100,000 messages
                fail at the same time
                and all retry after
                exactly 30 seconds,
                they can overload the
                recovering dependency
                again. Jitter spreads
                retries across time.
              </Callout>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Retry or Don't Retry?
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div
                  className={`rounded-2xl border p-5 ${
                    isDark
                      ? "border-emerald-900 bg-emerald-950/20"
                      : "border-emerald-200 bg-emerald-50"
                  }`}
                >
                  <h4 className="font-black text-emerald-500">
                    Retry
                  </h4>

                  <div
                    className={`mt-3 space-y-2 text-sm ${textSecondary}`}
                  >
                    <p>
                      • Temporary
                      network failure
                    </p>

                    <p>
                      • Dependency
                      timeout
                    </p>

                    <p>
                      • Temporary 5xx
                    </p>

                    <p>
                      • Rate limit
                      with known retry
                      behavior
                    </p>
                  </div>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${
                    isDark
                      ? "border-red-900 bg-red-950/20"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <h4 className="font-black text-red-500">
                    Usually Don't
                    Blindly Retry
                  </h4>

                  <div
                    className={`mt-3 space-y-2 text-sm ${textSecondary}`}
                  >
                    <p>
                      • Invalid
                      schema
                    </p>

                    <p>
                      • Missing
                      required field
                    </p>

                    <p>
                      • Business rule
                      violation
                    </p>

                    <p>
                      • Permanently
                      invalid account
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-16">
              <SectionHeading
                id="backpressure"
                eyebrow="Traffic Spikes"
                title="Backpressure"
                description="A queue helps when producers are temporarily faster than consumers, but an infinitely growing queue is not a complete scaling strategy."
                icon={Activity}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Users}
                  title="Incoming Traffic"
                  subtitle="100K jobs/sec"
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Inbox}
                  title="Queue"
                  subtitle="Growing backlog"
                  isDark={
                    isDark
                  }
                  danger
                />

                <DownArrow
                  label="Consumers only process 20K/sec"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Server}
                  title="Consumers"
                  subtitle="Cannot keep up"
                  isDark={
                    isDark
                  }
                />
              </div>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Ways to Handle It
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "Autoscale Consumers",
                    "Increase workers based on lag or queue depth.",
                  ],

                  [
                    "Rate Limit Producers",
                    "Reject, delay or throttle non-critical production.",
                  ],

                  [
                    "Batch Processing",
                    "Consume multiple messages at once when downstream operations benefit.",
                  ],

                  [
                    "Prioritize",
                    "Process critical traffic before less important jobs.",
                  ],

                  [
                    "Load Shed",
                    "Drop optional work when the system is under severe pressure.",
                  ],

                  [
                    "Bound Queue Growth",
                    "Apply retention, quotas and capacity limits rather than allowing infinite backlog.",
                  ],
                ].map(
                  (
                    [
                      title,
                      text,
                    ]
                  ) => (
                    <div
                      key={
                        title
                      }
                      className={`rounded-xl border p-5 ${surface}`}
                    >
                      <h3
                        className={`font-black ${textPrimary}`}
                      >
                        {title}
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-7 ${textSecondary}`}
                      >
                        {text}
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>

            <section className="mt-16">
              <SectionHeading
                id="partitioning"
                eyebrow="Horizontal Scale"
                title="Partitions"
                description="A single ordered queue can limit throughput. Distributed logs often split a topic into partitions."
                icon={Layers3}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Server}
                  title="Producer"
                  subtitle="key = orderId"
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  label="hash(key)"
                  isDark={
                    isDark
                  }
                />

                <div className="grid gap-3 sm:grid-cols-3">
                  <DiagramNode
                    icon={FileClock}
                    title="Partition 0"
                    subtitle="order A, D, G"
                    isDark={
                      isDark
                    }
                    highlight
                  />

                  <DiagramNode
                    icon={FileClock}
                    title="Partition 1"
                    subtitle="order B, E, H"
                    isDark={
                      isDark
                    }
                    highlight
                  />

                  <DiagramNode
                    icon={FileClock}
                    title="Partition 2"
                    subtitle="order C, F, I"
                    isDark={
                      isDark
                    }
                    highlight
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div
                  className={`rounded-xl border p-5 ${surface}`}
                >
                  <h3
                    className={`font-black ${textPrimary}`}
                  >
                    More Partitions
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    Can increase
                    parallel
                    processing and
                    throughput.
                  </p>
                </div>

                <div
                  className={`rounded-xl border p-5 ${surface}`}
                >
                  <h3
                    className={`font-black ${textPrimary}`}
                  >
                    Same Key
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    Route related
                    events to the same
                    partition when
                    per-key ordering
                    matters.
                  </p>
                </div>
              </div>

              <Callout
                type="warning"
                title="Hot partition problem"
                isDark={
                  isDark
                }
              >
                If one routing key
                produces a huge
                percentage of events,
                one partition can
                become overloaded
                while other
                partitions remain
                mostly idle.
              </Callout>
            </section>

            <section className="mt-16">
              <SectionHeading
                eyebrow="Durability"
                title="Broker Replication & Persistence"
                description="If a broker crashes, important messages should not disappear simply because they existed on only one machine."
                icon={ShieldCheck}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={FileClock}
                  title="Partition Leader"
                  subtitle="Receives writes"
                  isDark={
                    isDark
                  }
                  highlight
                />

                <DownArrow
                  label="Replicate"
                  isDark={
                    isDark
                  }
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <DiagramNode
                    icon={Server}
                    title="Replica 1"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Replica 2"
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>

              <p
                className={`mt-5 text-sm leading-7 ${textSecondary}`}
              >
                Messaging systems
                differ in how they
                persist messages,
                acknowledge producer
                writes, replicate
                partitions and elect
                replacement leaders.
                Higher durability
                generally introduces
                additional latency or
                resource cost.
              </p>
            </section>

            <section className="mt-16">
              <SectionHeading
                id="kafka-internals"
                eyebrow="Kafka Deep Dive"
                title="Kafka Internals: Topics, Partitions, Leaders, Offsets & Consumer Groups"
                description="Kafka is best understood as a partitioned retained log, not merely as a faster queue."
                icon={FileClock}
                isDark={isDark}
              />

              <div className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <DiagramNode icon={Server} title="Producer A" subtitle="key=order-1" isDark={isDark} />
                  <DiagramNode icon={Server} title="Producer B" subtitle="key=order-2" isDark={isDark} />
                  <DiagramNode icon={Server} title="Producer C" subtitle="key=order-3" isDark={isDark} />
                </div>
                <DownArrow label="partitioner selects partition" isDark={isDark} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <DiagramNode icon={FileClock} title="Partition 0" subtitle="leader + replicas • offsets 0..N" isDark={isDark} highlight />
                  <DiagramNode icon={FileClock} title="Partition 1" subtitle="leader + replicas • offsets 0..N" isDark={isDark} highlight />
                  <DiagramNode icon={FileClock} title="Partition 2" subtitle="leader + replicas • offsets 0..N" isDark={isDark} highlight />
                </div>
                <DownArrow label="consumer group assignment" isDark={isDark} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <DiagramNode icon={Server} title="Consumer 1" subtitle="P0" isDark={isDark} />
                  <DiagramNode icon={Server} title="Consumer 2" subtitle="P1" isDark={isDark} />
                  <DiagramNode icon={Server} title="Consumer 3" subtitle="P2" isDark={isDark} />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  ["Topic", "Logical event category such as booking.events. A topic is split into partitions for throughput and parallelism."],
                  ["Partition", "An ordered append-only log. Ordering is guaranteed inside one partition, not across the whole topic."],
                  ["Offset", "Position of a record in a partition. Consumer groups track progress using offsets."],
                  ["Leader & Replicas", "One broker leader handles partition writes/reads while replicas provide durability and failover depending on configuration."],
                  ["Consumer Group", "Consumers cooperate so each partition is owned by at most one active consumer in that group at a time."],
                  ["Retention", "Events remain for a configured period/size even after consumption, enabling replay and new consumers."],
                  ["Rebalance", "Partition ownership moves when consumers join/leave or topology changes. Rebalances can temporarily pause processing and must be considered in long-running handlers."],
                  ["Hot Partition", "A skewed key sends disproportionate traffic to one partition, limiting throughput even when other partitions are idle."],
                ].map(([title, text]) => (
                  <div key={title} className={`rounded-xl border p-5 ${surface}`}>
                    <h3 className={`font-black ${textPrimary}`}>{title}</h3>
                    <p className={`mt-2 text-sm leading-7 ${textSecondary}`}>{text}</p>
                  </div>
                ))}
              </div>

              <Callout type="warning" title="More partitions are not free" isDark={isDark}>
                More partitions can increase parallelism, but they also increase metadata, rebalance work and operational complexity. Changing partition count can also change hash-to-partition mapping for future events. Choose enough partitions for expected throughput and ordering keys instead of treating partition count as an arbitrary performance knob.
              </Callout>
            </section>

            <section className="mt-16">
              <SectionHeading
                id="rabbitmq-internals"
                eyebrow="RabbitMQ Deep Dive"
                title="RabbitMQ Internals: Exchanges, Bindings, Queues, ACKs & Prefetch"
                description="RabbitMQ is a traditional message broker with powerful routing before messages reach queues."
                icon={Route}
                isDark={isDark}
              />

              <div className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}>
                <DiagramNode icon={Server} title="Producer" subtitle="routingKey=payment.success" isDark={isDark} />
                <DownArrow label="publish" isDark={isDark} />
                <DiagramNode icon={Route} title="Exchange" subtitle="direct • topic • fanout • headers" isDark={isDark} highlight />
                <DownArrow label="bindings decide destination queues" isDark={isDark} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <DiagramNode icon={Inbox} title="booking.queue" subtitle="payment.success" isDark={isDark} />
                  <DiagramNode icon={Inbox} title="fraud.queue" subtitle="payment.*" isDark={isDark} />
                  <DiagramNode icon={Inbox} title="audit.queue" subtitle="all payment events" isDark={isDark} />
                </div>
                <DownArrow label="consumers + ACK / NACK" isDark={isDark} />
                <DiagramNode icon={Server} title="Workers" subtitle="prefetch controls in-flight messages" isDark={isDark} />
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border">
                <div className="overflow-x-auto">
                  <table className={`w-full min-w-[900px] ${isDark ? "bg-slate-900" : "bg-white"}`}>
                    <thead className={isDark ? "bg-slate-800" : "bg-slate-100"}>
                      <tr>{["Exchange", "Routing rule", "Good for", "Example"].map((h) => <th key={h} className={`px-5 py-4 text-left text-xs font-black uppercase ${isDark ? "text-slate-300" : "text-slate-600"}`}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {[
                        ["Direct", "Exact routing-key match", "Simple explicit routing", "payment.success -> booking.queue"],
                        ["Topic", "Wildcard patterns", "Event families", "payment.* or order.#"],
                        ["Fanout", "Broadcast to every binding", "All subscribers need every message", "config.changed -> all services"],
                        ["Headers", "Header-based matching", "Special metadata routing", "x-region=IN + x-tier=premium"],
                      ].map((row, i) => <tr key={i} className={`border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>{row.map((cell, j) => <td key={j} className={`px-5 py-4 text-sm ${j === 0 ? `font-black ${textPrimary}` : textSecondary}`}>{cell}</td>)}</tr>)}
                    </tbody>
                  </table>
                </div>
              </div>

              <Callout type="info" title="Prefetch is a throughput/fairness control" isDark={isDark}>
                A consumer with prefetch 100 may hold up to 100 unacknowledged messages. That can improve throughput for fast handlers, but it can also make distribution unfair and increase redelivery after crashes. Tune prefetch to message cost and worker concurrency.
              </Callout>
            </section>

            <section className="mt-16">
              <SectionHeading
                id="managed-queues"
                eyebrow="Cloud Queues"
                title="Managed Queues: Standard vs FIFO, Visibility Timeout, Long Polling & DLQ"
                description="Managed services remove broker-cluster operations, but you still need to understand their delivery semantics and limits."
                icon={Cloud}
                isDark={isDark}
              />

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <div className={`rounded-2xl border p-5 sm:p-6 ${surface}`}>
                  <h3 className={`text-lg font-black ${textPrimary}`}>Standard Queue</h3>
                  <p className={`mt-3 text-sm leading-7 ${textSecondary}`}>Use for high-throughput independent jobs where strict order is unnecessary. Expect at-least-once-style duplicate possibility and make handlers idempotent.</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <p>✓ High parallelism</p>
                    <p>✓ Simple worker scaling</p>
                    <p>✓ Great default for background jobs</p>
                    <p>✕ Do not depend on strict global ordering</p>
                  </div>
                </div>
                <div className={`rounded-2xl border p-5 sm:p-6 ${surface}`}>
                  <h3 className={`text-lg font-black ${textPrimary}`}>FIFO / Message Groups</h3>
                  <p className={`mt-3 text-sm leading-7 ${textSecondary}`}>Use when events for the same key must be ordered. Different message groups can still progress in parallel.</p>
                  <div className="mt-4 space-y-2 text-sm">
                    <p>✓ Per-group ordering</p>
                    <p>✓ Useful for order/account transitions</p>
                    <p>✓ Parallelism across groups</p>
                    <p>✕ More constraints than standard queues</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Visibility Timeout", "Hide an in-flight message; redeliver if the consumer does not finish in time."],
                  ["Long Polling", "Wait for messages instead of repeatedly issuing empty receives, reducing waste and latency."],
                  ["Redrive / DLQ", "Move repeatedly failing messages to a DLQ after a configured receive count."],
                  ["Delay", "Keep a message unavailable until a future delay expires for retries or scheduled work."],
                ].map(([title, text]) => <div key={title} className={`rounded-xl border p-4 ${surface}`}><p className="text-xs font-black uppercase text-blue-500">{title}</p><p className={`mt-2 text-sm leading-6 ${textSecondary}`}>{text}</p></div>)}
              </div>
            </section>

            <section className="mt-16">
              <SectionHeading
                id="comparison"
                eyebrow="Technology Selection"
                title="Kafka vs RabbitMQ vs Managed Queues"
                description="Do not choose based only on popularity. Their messaging models are different."
                icon={BrainCircuit}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 overflow-hidden rounded-2xl border">
                <div className="overflow-x-auto">
                  <table
                    className={`min-w-[980px] w-full ${
                      isDark
                        ? "bg-slate-900"
                        : "bg-white"
                    }`}
                  >
                    <thead
                      className={
                        isDark
                          ? "bg-slate-800"
                          : "bg-slate-100"
                      }
                    >
                      <tr>
                        {[
                          "Feature",
                          "Kafka-style Log",
                          "RabbitMQ-style Broker",
                          "Managed Queue",
                        ].map(
                          (
                            value
                          ) => (
                            <th
                              key={
                                value
                              }
                              className={`px-5 py-4 text-left text-xs font-black uppercase ${
                                isDark
                                  ? "text-slate-300"
                                  : "text-slate-600"
                              }`}
                            >
                              {
                                value
                              }
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {[
                        [
                          "Core model",
                          "Distributed event log",
                          "Message broker / queues",
                          "Managed queue service",
                        ],

                        [
                          "Replay",
                          "Strong fit",
                          "Usually queue-consumption oriented",
                          "Service dependent",
                        ],

                        [
                          "Routing",
                          "Topics + partitions",
                          "Rich exchanges / routing",
                          "Queues + topics depending on service",
                        ],

                        [
                          "High-throughput streams",
                          "Excellent fit",
                          "Possible, but not its only strength",
                          "Depends on managed service",
                        ],

                        [
                          "Task queue",
                          "Possible",
                          "Very natural",
                          "Very natural",
                        ],

                        [
                          "Operational effort",
                          "Can be significant",
                          "Can be significant",
                          "Provider handles more infrastructure",
                        ],

                        [
                          "Typical use",
                          "Events, CDC, streams, analytics pipelines",
                          "Jobs, routing, business messaging",
                          "Cloud-native asynchronous jobs",
                        ],
                      ].map(
                        (
                          row,
                          rowIndex
                        ) => (
                          <tr
                            key={
                              rowIndex
                            }
                            className={`border-t ${
                              isDark
                                ? "border-slate-800"
                                : "border-slate-200"
                            }`}
                          >
                            {row.map(
                              (
                                cell,
                                cellIndex
                              ) => (
                                <td
                                  key={
                                    cellIndex
                                  }
                                  className={`px-5 py-4 text-sm ${
                                    cellIndex ===
                                    0
                                      ? `font-black ${textPrimary}`
                                      : textSecondary
                                  }`}
                                >
                                  {
                                    cell
                                  }
                                </td>
                              )
                            )}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div
                  className={`rounded-2xl border p-5 ${surface}`}
                >
                  <h3
                    className={`font-black ${textPrimary}`}
                  >
                    Choose Kafka-like
                    Stream
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    When event
                    retention, replay,
                    high-throughput
                    streams, consumer
                    groups and
                    partitioned logs
                    are central.
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${surface}`}
                >
                  <h3
                    className={`font-black ${textPrimary}`}
                  >
                    Choose RabbitMQ-like
                    Broker
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    When task queues,
                    routing,
                    acknowledgements
                    and traditional
                    business
                    messaging are the
                    main need.
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${surface}`}
                >
                  <h3
                    className={`font-black ${textPrimary}`}
                  >
                    Choose Managed
                    Queue
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    When you want
                    queue semantics
                    without operating
                    broker clusters
                    yourself.
                  </p>
                </div>
              </div>


              <h3 className={`mt-9 text-xl font-black ${textPrimary}`}>
                Detailed Technology Decision
              </h3>

              <div className="mt-4 grid gap-5 md:grid-cols-2">
                {TECHNOLOGY_CHOICES.map((item) => (
                  <div key={item.name} className={`rounded-2xl border p-5 sm:p-6 ${surface}`}>
                    <h4 className={`text-lg font-black ${textPrimary}`}>{item.name}</h4>

                    <p className="mt-4 text-xs font-black uppercase tracking-wide text-emerald-500">Choose when</p>
                    <p className={`mt-2 text-sm leading-7 ${textSecondary}`}>{item.useWhen}</p>

                    <p className="mt-4 text-xs font-black uppercase tracking-wide text-red-500">Reconsider when</p>
                    <p className={`mt-2 text-sm leading-7 ${textSecondary}`}>{item.avoidWhen}</p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-blue-500">Strengths</p>
                        <div className="mt-2 space-y-2">
                          {item.strengths.map((value) => (
                            <div key={value} className="flex gap-2">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              <span className={`text-sm ${textSecondary}`}>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-black uppercase tracking-wide text-amber-500">Trade-offs</p>
                        <div className="mt-2 space-y-2">
                          {item.tradeoffs.map((value) => (
                            <div key={value} className="flex gap-2">
                              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                              <span className={`text-sm ${textSecondary}`}>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-6 rounded-2xl border p-5 sm:p-6 ${surface}`}>
                <h4 className={`font-black ${textPrimary}`}>Fast interview selection examples</h4>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {[
                    ["10M analytics events/day + replay", "Kafka-style log"],
                    ["Generate invoice once in background", "Work queue / managed queue"],
                    ["Order event must reach analytics + notification + warehouse", "Pub/Sub or event stream with separate consumer groups"],
                    ["payment.success must route to booking, payment.failed to recovery", "Topic/direct routing broker"],
                    ["Release booking hold after 5 minutes", "Delayed queue / scheduler + queue"],
                    ["Same order events must stay sequential", "FIFO message group or partition keyed by orderId"],
                    ["Small team wants durable jobs with minimal operations", "Managed queue"],
                    ["Need replayable CDC pipeline into warehouse", "Kafka/Kinesis/Pulsar-style stream"],
                  ].map(([scenario, choice]) => (
                    <div key={scenario} className={`rounded-xl border p-4 ${isDark ? "border-slate-700 bg-slate-800/60" : "border-slate-200 bg-slate-50"}`}>
                      <p className={`text-sm font-black ${textPrimary}`}>{scenario}</p>
                      <p className="mt-2 text-sm font-bold text-blue-500">Start with: {choice}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-16">
              <SectionHeading
                eyebrow="Distributed Transactions"
                title="The Dual-Write Problem & Transactional Outbox"
                description="A common failure occurs when an application must update its database and publish an event as two separate operations."
                icon={Database}
                isDark={
                  isDark
                }
              />

              <h3
                className={`mt-7 text-xl font-black ${textPrimary}`}
              >
                The Problem
              </h3>

              <div
                className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Server}
                  title="Order Service"
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  label="1. Save order"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Database}
                  title="Database"
                  subtitle="COMMIT succeeds"
                  isDark={
                    isDark
                  }
                  success
                />

                <DownArrow
                  label="2. Publish event"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={TriangleAlert}
                  title="Broker Publish Fails"
                  subtitle="Order exists but event is missing"
                  isDark={
                    isDark
                  }
                  danger
                />
              </div>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Transactional Outbox
              </h3>

              <CodeBlock>
{`BEGIN TRANSACTION;

INSERT INTO orders (...);

INSERT INTO outbox (
    event_id,
    event_type,
    payload
)
VALUES (
    'evt_123',
    'ORDER_CREATED',
    '{...}'
);

COMMIT;`}
              </CodeBlock>

              <div
                className={`mt-5 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Database}
                  title="Application DB"
                  subtitle="Order + Outbox committed atomically"
                  isDark={
                    isDark
                  }
                  highlight
                />

                <DownArrow
                  label="Outbox worker / CDC"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Radio}
                  title="Message Broker"
                  subtitle="ORDER_CREATED"
                  isDark={
                    isDark
                  }
                />
              </div>

              <Callout
                type="success"
                title="Why it helps"
                isDark={
                  isDark
                }
              >
                The business state
                and intent to publish
                are committed in the
                same local database
                transaction. A worker
                can safely retry
                publishing the outbox
                event.
              </Callout>
            </section>

            <section className="mt-16">
              <SectionHeading
                id="code-examples"
                eyebrow="Implementation"
                title="Code Examples: Producer, Consumer, Idempotency & Retry"
                description="In interviews you usually explain the design rather than write framework code, but these examples make the message lifecycle concrete."
                icon={Code2}
                isDark={isDark}
              />

              <h3 className={`mt-7 text-xl font-black ${textPrimary}`}>1. Event Envelope</h3>
              <CodeBlock title="booking-confirmed.json">
{`{
  "eventId": "evt_01H...",
  "eventType": "BOOKING_CONFIRMED",
  "version": 1,
  "occurredAt": "2026-09-30T10:30:00Z",
  "correlationId": "req_123",
  "partitionKey": "booking_991",
  "payload": {
    "bookingId": "booking_991",
    "userId": "user_42",
    "showId": "show_77",
    "seatIds": ["A10", "A11"]
  }
}`}
              </CodeBlock>

              <h3 className={`mt-8 text-xl font-black ${textPrimary}`}>2. Spring Kafka Producer</h3>
              <CodeBlock title="BookingEventPublisher.java">
{`@Service
@RequiredArgsConstructor
public class BookingEventPublisher {

    private final KafkaTemplate<String, BookingEvent> kafkaTemplate;

    public CompletableFuture<SendResult<String, BookingEvent>> publish(
            BookingEvent event) {

        // bookingId is used as the key so events for the same
        // booking are routed to the same partition.
        return kafkaTemplate.send(
                "booking.events",
                event.getBookingId(),
                event
        );
    }
}`}
              </CodeBlock>

              <h3 className={`mt-8 text-xl font-black ${textPrimary}`}>3. Idempotent Spring Kafka Consumer</h3>
              <CodeBlock title="BookingNotificationConsumer.java">
{`@Service
@RequiredArgsConstructor
public class BookingNotificationConsumer {

    private final ProcessedEventRepository processedEventRepository;
    private final NotificationService notificationService;

    @KafkaListener(
        topics = "booking.events",
        groupId = "notification-group"
    )
    @Transactional
    public void consume(BookingEvent event) {

        if (processedEventRepository.existsById(event.getEventId())) {
            return; // duplicate delivery -> safe no-op
        }

        notificationService.createNotificationRecord(event);

        processedEventRepository.save(
            new ProcessedEvent(event.getEventId())
        );
    }
}`}
              </CodeBlock>

              <Callout type="warning" title="External side effects need their own idempotency" isDark={isDark}>
                A database transaction can atomically store the processed-event marker and your local state, but it cannot automatically include an external email/payment provider. For external APIs, use provider idempotency keys where available or store an outbox/job record and make the external call retry-safe.
              </Callout>

              <h3 className={`mt-8 text-xl font-black ${textPrimary}`}>4. Retry Classification</h3>
              <CodeBlock title="RetryPolicy.java">
{`public RetryDecision classify(Throwable error, int attempt) {

    if (error instanceof ValidationException) {
        return RetryDecision.DLQ;       // permanent failure
    }

    if (attempt >= 5) {
        return RetryDecision.DLQ;
    }

    if (error instanceof TimeoutException ||
        error instanceof TemporaryProviderException) {
        return RetryDecision.RETRY_WITH_BACKOFF;
    }

    return RetryDecision.DLQ;
}`}
              </CodeBlock>

              <h3 className={`mt-8 text-xl font-black ${textPrimary}`}>5. Transactional Outbox Worker</h3>
              <CodeBlock title="Outbox publishing flow">
{`// Transaction 1: business write + outbox write
BEGIN;
UPDATE bookings
SET status = 'CONFIRMED'
WHERE booking_id = 'booking_991';

INSERT INTO outbox(event_id, aggregate_id, event_type, payload)
VALUES ('evt_123', 'booking_991', 'BOOKING_CONFIRMED', '{...}');
COMMIT;

// Async publisher / CDC later publishes evt_123.
// After broker acknowledgement, mark the outbox row published.
// If publishing retries, eventId keeps downstream processing idempotent.`}
              </CodeBlock>
            </section>

            <section className="mt-16">
              <SectionHeading
                id="bookmyshow"
                eyebrow="End-to-End Case Study"
                title="BookMyShow-Style Booking: Where Queues Help and Where They Do Not"
                description="A booking system mixes synchronous concurrency control with asynchronous event processing. The hardest interview skill is choosing the correct boundary."
                icon={TicketPercent}
                isDark={isDark}
              />

              <Callout type="warning" title="A queue is not the seat lock" isDark={isDark}>
                The user must immediately know whether Seat A10 was acquired. Use an atomic lock, conditional database update or transaction for that critical decision. Queues are used around the booking flow for expiry, payment events, notifications, ticket generation, analytics and other asynchronous work.
              </Callout>

              <h3 className={`mt-8 text-xl font-black ${textPrimary}`}>1. Read / Discovery Path</h3>
              <p className={`mt-2 text-sm leading-7 ${textSecondary}`}>
                Browsing movies, theatres and show availability is read-heavy. Keep this path fast using CDN/cache/read replicas/search indexes. Do not insert a queue into a normal read request just because the system uses queues elsewhere.
              </p>
              <div className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}>
                <DiagramNode icon={Users} title="User" subtitle="searches movie/show" isDark={isDark} />
                <DownArrow isDark={isDark} />
                <DiagramNode icon={Network} title="API / Load Balancer" subtitle="routes synchronous read" isDark={isDark} highlight />
                <DownArrow isDark={isDark} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <DiagramNode icon={Server} title="Search Service" subtitle="movies/theatres" isDark={isDark} />
                  <DiagramNode icon={Database} title="Cache / Read Store" subtitle="show metadata" isDark={isDark} />
                  <DiagramNode icon={Database} title="Availability Read Model" subtitle="seat status snapshot" isDark={isDark} />
                </div>
              </div>

              <h3 className={`mt-8 text-xl font-black ${textPrimary}`}>2. Critical Seat-Hold Path — Keep It Synchronous</h3>
              <div className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}>
                <DiagramNode icon={Users} title="User A" subtitle="selects A10 + A11" isDark={isDark} />
                <DownArrow label="POST /seat-holds" isDark={isDark} />
                <DiagramNode icon={LockKeyhole} title="Seat Lock Service" subtitle="atomic conditional acquire" isDark={isDark} highlight />
                <DownArrow label="authoritative write" isDark={isDark} />
                <DiagramNode icon={Database} title="Seat / Booking Store" subtitle="AVAILABLE -> HELD, expiresAt=T+5m" isDark={isDark} />
                <DownArrow label="immediate response" isDark={isDark} />
                <DiagramNode icon={CheckCircle2} title="Hold Created" subtitle="bookingId + expiry" isDark={isDark} success />
              </div>

              <CodeBlock title="Atomic seat hold idea">
{`UPDATE seats
SET status = 'HELD',
    held_by = :bookingId,
    expires_at = :expiresAt,
    version = version + 1
WHERE show_id = :showId
  AND seat_id = :seatId
  AND status = 'AVAILABLE';

// affectedRows == 1 -> lock acquired
// affectedRows == 0 -> another user already owns it`}
              </CodeBlock>

              <h3 className={`mt-8 text-xl font-black ${textPrimary}`}>3. Create an Expiry Event</h3>
              <p className={`mt-2 text-sm leading-7 ${textSecondary}`}>
                After the hold succeeds, publish or schedule a delayed expiry job. The job contains bookingId, seat IDs and preferably a hold/version token. The expiry worker must re-read authoritative state before releasing anything.
              </p>
              <div className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}>
                <DiagramNode icon={LockKeyhole} title="Seat Hold Created" subtitle="A10 held until 10:35" isDark={isDark} />
                <DownArrow label="schedule T+5m" isDark={isDark} />
                <DiagramNode icon={AlarmClock} title="booking.expiry" subtitle="delayed queue" isDark={isDark} highlight />
                <DownArrow label="5 minutes later" isDark={isDark} />
                <DiagramNode icon={Timer} title="Expiry Worker" subtitle="release only if still HELD and version matches" isDark={isDark} />
              </div>

              <h3 className={`mt-8 text-xl font-black ${textPrimary}`}>4. Payment Success and the Race with Expiry</h3>
              <p className={`mt-2 text-sm leading-7 ${textSecondary}`}>
                Payment can complete near the exact time the expiry event fires. Do not depend on delivery order between unrelated systems. Both handlers must use state/version checks so one becomes a safe no-op when the other has already won.
              </p>
              <div className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <DiagramNode icon={Server} title="Payment Callback" subtitle="PAYMENT_SUCCEEDED" isDark={isDark} success />
                  <DiagramNode icon={AlarmClock} title="Expiry Event" subtitle="HOLD_EXPIRED" isDark={isDark} danger />
                </div>
                <DownArrow label="both may arrive concurrently" isDark={isDark} />
                <DiagramNode icon={Database} title="Booking State Machine" subtitle="authoritative status + version decides" isDark={isDark} highlight />
                <DownArrow isDark={isDark} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <DiagramNode icon={CheckCircle2} title="CONFIRMED" subtitle="expiry becomes no-op" isDark={isDark} success />
                  <DiagramNode icon={Timer} title="EXPIRED" subtitle="late/invalid payment goes to reconciliation" isDark={isDark} danger />
                </div>
              </div>

              <h3 className={`mt-8 text-xl font-black ${textPrimary}`}>5. Transactional Booking Confirmation + Outbox</h3>
              <p className={`mt-2 text-sm leading-7 ${textSecondary}`}>
                Once payment is valid, confirm the booking and create BOOKING_CONFIRMED in an outbox inside the same database transaction. This avoids the dual-write failure where the booking is confirmed but downstream ticket/notification events are never published.
              </p>
              <CodeBlock title="Booking confirmation transaction">
{`BEGIN;

UPDATE bookings
SET status = 'CONFIRMED',
    payment_id = :paymentId
WHERE booking_id = :bookingId
  AND status = 'PENDING';

UPDATE seats
SET status = 'BOOKED'
WHERE held_by = :bookingId
  AND status = 'HELD';

INSERT INTO outbox(
  event_id,
  aggregate_id,
  event_type,
  payload
)
VALUES(
  :eventId,
  :bookingId,
  'BOOKING_CONFIRMED',
  :payload
);

COMMIT;`}
              </CodeBlock>

              <h3 className={`mt-8 text-xl font-black ${textPrimary}`}>6. Async Fanout After Booking Confirmation</h3>
              <div className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}>
                <DiagramNode icon={Database} title="Outbox / CDC" subtitle="BOOKING_CONFIRMED" isDark={isDark} />
                <DownArrow label="publish once available" isDark={isDark} />
                <DiagramNode icon={Radio} title="booking.events" subtitle="retained topic / pub-sub" isDark={isDark} highlight />
                <DownArrow label="independent consumer groups" isDark={isDark} />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <DiagramNode icon={Bell} title="Notification" subtitle="email / SMS / push" isDark={isDark} />
                  <DiagramNode icon={TicketPercent} title="Ticket Worker" subtitle="generate QR / PDF" isDark={isDark} />
                  <DiagramNode icon={Activity} title="Analytics" subtitle="conversion metrics" isDark={isDark} />
                  <DiagramNode icon={Database} title="Warehouse" subtitle="event pipeline" isDark={isDark} />
                </div>
              </div>

              <Callout type="success" title="Why this boundary works" isDark={isDark}>
                Seat ownership and booking confirmation stay on the synchronous correctness path. Slow or failure-prone side effects move behind durable queues, so an email outage cannot make a successful booking fail and analytics slowness cannot block the user.
              </Callout>

              <h3 className={`mt-8 text-xl font-black ${textPrimary}`}>7. Notification Retry and DLQ</h3>
              <div className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}>
                <DiagramNode icon={Bell} title="Notification Consumer" subtitle="email provider timeout" isDark={isDark} danger />
                <DownArrow label="transient failure" isDark={isDark} />
                <DiagramNode icon={Repeat2} title="Retry Topic / Queue" subtitle="5s -> 30s -> 5m + jitter" isDark={isDark} highlight />
                <DownArrow label="max attempts" isDark={isDark} />
                <DiagramNode icon={MailWarning} title="notification.dlq" subtitle="alert + inspect + replay" isDark={isDark} danger />
              </div>

              <h3 className={`mt-8 text-xl font-black ${textPrimary}`}>8. Which Parts Should Be Sync vs Async?</h3>
              <div className="mt-4 overflow-hidden rounded-2xl border">
                <div className="overflow-x-auto">
                  <table className={`w-full min-w-[1000px] ${isDark ? "bg-slate-900" : "bg-white"}`}>
                    <thead className={isDark ? "bg-slate-800" : "bg-slate-100"}>
                      <tr>{["Operation", "Sync / Async", "Reason", "Queue pattern"].map((h) => <th key={h} className={`px-5 py-4 text-left text-xs font-black uppercase ${isDark ? "text-slate-300" : "text-slate-600"}`}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {[
                        ["Search shows", "Sync", "User needs immediate result", "None"],
                        ["Acquire seat lock", "Sync", "Immediate correctness decision", "None for the lock itself"],
                        ["Create payment intent", "Usually Sync", "User needs payment flow now", "Events may follow"],
                        ["Payment callback processing", "Durable + idempotent", "Must survive retries/duplicates", "Event/queue can decouple downstream work"],
                        ["Seat-hold expiry", "Async delayed", "Future action at T+N", "Delayed queue"],
                        ["Ticket generation", "Async", "Can finish after booking confirmation", "Work queue"],
                        ["Email/SMS", "Async", "Provider slowness must not fail booking", "Work queue + retry + DLQ"],
                        ["Analytics", "Async", "Eventually consistent side effect", "Pub/Sub / event stream"],
                      ].map((row, i) => <tr key={i} className={`border-t ${isDark ? "border-slate-800" : "border-slate-200"}`}>{row.map((cell, j) => <td key={j} className={`px-5 py-4 text-sm leading-6 ${j === 0 ? `font-black ${textPrimary}` : textSecondary}`}>{cell}</td>)}</tr>)}
                    </tbody>
                  </table>
                </div>
              </div>

              <h3 className={`mt-8 text-xl font-black ${textPrimary}`}>9. BookMyShow Failure Scenarios You Should Explain</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {[
                  ["Payment succeeds, callback duplicated", "Use payment/provider idempotency key + unique payment transaction + idempotent booking transition."],
                  ["Payment succeeds, callback delayed past hold", "Move to reconciliation. Never blindly book a seat that another user may now own."],
                  ["Expiry event delivered twice", "Release using conditional state/version check; second event becomes a no-op."],
                  ["Email provider down", "Booking remains confirmed; retry notification asynchronously and DLQ if exhausted."],
                  ["Broker temporarily down after booking commit", "Transactional outbox preserves the event until publisher/CDC can deliver it."],
                  ["Consumer commits DB but crashes before ACK", "Message is redelivered; eventId/business keys keep processing idempotent."],
                  ["Traffic spike for blockbuster release", "Queue non-critical work, autoscale consumers, protect DB/provider with rate limits and watch oldest-message age."],
                  ["One show creates a hot Kafka partition", "Choose partition keys carefully; avoid a key that funnels the entire hot show into one partition unless ordering requires it."],
                ].map(([title, text]) => (
                  <div key={title} className={`rounded-xl border p-5 ${surface}`}>
                    <h4 className={`font-black ${textPrimary}`}>{title}</h4>
                    <p className={`mt-2 text-sm leading-7 ${textSecondary}`}>{text}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-16">
              <SectionHeading
                id="failures"
                eyebrow="Production Engineering"
                title="Message Queue Failure Scenarios"
                description="Messaging systems move complexity rather than eliminating it. You still need to design for consumer crashes, duplicates, backlog and poison messages."
                icon={TriangleAlert}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 space-y-4">
                {[
                  {
                    title:
                      "Consumer Crashes",

                    text:
                      "Do not acknowledge unfinished work. The message should become available to another consumer according to the broker model.",
                  },

                  {
                    title:
                      "Duplicate Message",

                    text:
                      "Use idempotency keys, unique constraints or processed-event tracking so the same event does not apply the business effect twice.",
                  },

                  {
                    title:
                      "Poison Message",

                    text:
                      "A permanently invalid event should eventually move to a dead letter queue instead of retrying forever.",
                  },

                  {
                    title:
                      "Consumer Is Too Slow",

                    text:
                      "Monitor queue depth or consumer lag, scale workers and investigate downstream bottlenecks.",
                  },

                  {
                    title:
                      "Broker Node Fails",

                    text:
                      "Use broker replication, durable storage and appropriate producer acknowledgement configuration.",
                  },

                  {
                    title:
                      "Producer Publishes but Crashes",

                    text:
                      "Producer retries may create duplicates. Stable event IDs and idempotency are important.",
                  },

                  {
                    title:
                      "DB Commit Succeeds but Event Publish Fails",

                    text:
                      "Use transactional outbox or an equivalent reliable event publication pattern.",
                  },

                  {
                    title:
                      "Retry Storm",

                    text:
                      "Use exponential backoff, jitter and bounded retries. Immediate retries can overload an already failing dependency.",
                  },

                  {
                    title:
                      "Queue Backlog Grows Forever",

                    text:
                      "Autoscale consumers, throttle production, prioritize traffic and alert on sustained lag.",
                  },

                  {
                    title:
                      "Schema Changes",

                    text:
                      "Version event contracts and design consumers to handle compatible schema evolution.",
                  },
                ].map(
                  (item) => (
                    <div
                      key={
                        item.title
                      }
                      className={`rounded-2xl border p-5 ${surface}`}
                    >
                      <div className="flex gap-3">
                        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />

                        <div>
                          <h3
                            className={`font-black ${textPrimary}`}
                          >
                            {
                              item.title
                            }
                          </h3>

                          <p
                            className={`mt-2 text-sm leading-7 ${textSecondary}`}
                          >
                            {
                              item.text
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            <section className="mt-16">
              <SectionHeading
                eyebrow="Observability"
                title="What Should You Monitor?"
                description="Queue health is often visible through lag, age, failures and throughput before users notice a complete outage."
                icon={Activity}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  "Queue Depth",
                  "Consumer Lag",
                  "Oldest Message Age",
                  "Messages/sec",
                  "Consumer Throughput",
                  "Retry Rate",
                  "DLQ Size",
                  "Processing Latency",
                  "ACK Failures",
                  "Broker Disk",
                  "Broker CPU",
                  "Partition Skew",
                ].map(
                  (
                    metric
                  ) => (
                    <div
                      key={
                        metric
                      }
                      className={`rounded-xl border p-4 text-center text-sm font-bold ${surface}`}
                    >
                      {metric}
                    </div>
                  )
                )}
              </div>

              <Callout
                type="warning"
                title="Queue depth alone is not enough"
                isDark={
                  isDark
                }
              >
                A queue with one
                million tiny messages
                may be healthier than
                a queue containing
                100 expensive jobs
                that have been stuck
                for hours. Monitor
                age, throughput and
                processing latency as
                well.
              </Callout>
            </section>

            <section className="mt-16">
              <SectionHeading
                id="interview"
                eyebrow="Interview Preparation"
                title="Message Queue Interview Questions with Detailed Answers"
                description="These questions cover fundamentals, pattern selection, failure handling, Kafka, RabbitMQ, managed queues, scaling and BookMyShow-style system design."
                icon={Sparkles}
                isDark={isDark}
              />

              <div className="mt-7 space-y-4">
                {INTERVIEW_QUESTIONS.map((item, index) => (
                  <details
                    key={item.question}
                    className={`group rounded-2xl border ${surface}`}
                  >
                    <summary className="flex cursor-pointer list-none items-start gap-3 p-4 sm:p-5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-wider text-blue-500">{item.category}</p>
                        <h3 className={`mt-1 text-sm font-black leading-6 sm:text-base ${textPrimary}`}>{item.question}</h3>
                      </div>
                      <span className={`mt-1 text-xl font-bold transition group-open:rotate-45 ${isDark ? "text-slate-500" : "text-slate-400"}`}>+</span>
                    </summary>
                    <div className={`border-t px-4 py-4 text-sm leading-7 sm:px-5 ${isDark ? "border-slate-800 text-slate-300" : "border-slate-200 text-slate-600"}`}>
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>

            <section className="mt-16">
              <SectionHeading
                eyebrow="Quick Revision"
                title="Frequently Asked Questions"
                description="Short answers for the most important message-queue concepts."
                icon={Lightbulb}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 space-y-4">
                {faqData.map(
                  (item) => (
                    <div
                      key={
                        item.question
                      }
                      className={`rounded-2xl border p-5 ${surface}`}
                    >
                      <h3
                        className={`font-black ${textPrimary}`}
                      >
                        {
                          item.question
                        }
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-7 ${textSecondary}`}
                      >
                        {
                          item.answer
                        }
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>

            <section className="mt-16">
              <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-xl sm:p-9">
                <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-blue-100">
                      <BookOpen className="h-3.5 w-3.5" />

                      Mastering System
                      Design — HLD
                    </div>

                    <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                      Learn how queues
                      fit into complete
                      system designs.
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                      Go beyond
                      individual
                      concepts. Learn
                      how caching,
                      databases, load
                      balancing,
                      queues, rate
                      limiting,
                      concurrency,
                      locking and
                      failure handling
                      work together in
                      interview systems
                      such as
                      BookMyShow,
                      Uber and other
                      scalable
                      platforms.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-blue-100">
                      {[
                        "Kafka",
                        "Queues",
                        "Pub/Sub",
                        "Retry",
                        "DLQ",
                        "Caching",
                        "Database",
                        "BookMyShow",
                      ].map(
                        (
                          item
                        ) => (
                          <span
                            key={
                              item
                            }
                            className="rounded-full bg-white/10 px-3 py-1.5"
                          >
                            {
                              item
                            }
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        BOOK_URL
                      )
                    }
                    className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-50"
                  >
                    Explore HLD Book

                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>

            <section
              className={`mt-10 border-t pt-8 ${
                isDark
                  ? "border-slate-800"
                  : "border-slate-200"
              }`}
            >
              <p
                className={`mb-4 text-xs font-black uppercase tracking-[0.14em] ${
                  isDark
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              >
                Continue Learning
              </p>

              <div className="grid gap-4 md:grid-cols-2">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      PREVIOUS_TOPIC.path
                    )
                  }
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
                          isDark
                            ? "text-slate-500"
                            : "text-slate-400"
                        }`}
                      >
                        Previous Topic
                      </p>

                      <h3
                        className={`mt-1 text-xl font-black ${
                          isDark
                            ? "text-white"
                            : "text-slate-950"
                        }`}
                      >
                        {
                          PREVIOUS_TOPIC.title
                        }
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-6 ${textSecondary}`}
                      >
                        {
                          PREVIOUS_TOPIC.description
                        }
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      NEXT_TOPIC.path
                    )
                  }
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
                          isDark
                            ? "text-white"
                            : "text-slate-950"
                        }`}
                      >
                        {
                          NEXT_TOPIC.title
                        }
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-6 ${textSecondary}`}
                      >
                        {
                          NEXT_TOPIC.description
                        }
                      </p>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              </div>
            </section>
          </main>
        </div>
      </>
    );
  };

export default HLDMessageQueueResource;