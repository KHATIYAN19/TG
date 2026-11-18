import { useState } from "react";
import {
  Alarm, ArrowLeft, ArrowRight, ArrowsClockwise, Bell, Broadcast, ChartLine, CheckCircle, ClockCounterClockwise, Database, Desktop, EnvelopeSimple,
  FlowArrow, GitFork, Lock, ListNumbers, Path, Queue, Repeat, ShieldCheck, SortAscending, Ticket, Timer, Tray, Users, Warning, WarningOctagon,
} from "@phosphor-icons/react";

import { Btn } from "../resume/ui";
import { Call, Cards, Chips, Code, Compare, Flow, H3, ReaderPage, Sec, Steps, Table } from "../resources/kit/Reader";

/* =====================================================================
   MESSAGE QUEUES  (/resources/hld/message-queue)
   Last guide in the system design path. The 12 messaging patterns live
   in PATTERNS and render in an explorer; all panels stay in the HTML.
===================================================================== */
const GUIDE = {
  id: "mq",
  path: "/resources/hld/message-queue",
  short: "Message queues",
  section: "System Design",
  seoTitle: "Message Queues in System Design: Kafka, RabbitMQ, Pub/Sub, DLQ | Target Trek",
  description: "A free, complete guide to message queues and event-driven systems for interviews: 12 messaging patterns, Kafka and RabbitMQ internals, managed queues, delivery guarantees, ordering, idempotent consumers, retries, DLQs, backpressure, the transactional outbox, code examples and a booking case study.",
  keywords: ["message queue system design", "kafka system design", "rabbitmq vs kafka", "pub sub vs queue", "dead letter queue", "consumer groups", "at least once delivery", "exactly once", "idempotent consumer", "transactional outbox", "event driven architecture", "HLD interview questions"],
  about: ["Message queues", "Kafka", "RabbitMQ", "Event-driven architecture", "Pub/sub", "Distributed systems"],
  tags: ["System design", "Async systems", "Intermediate"],
  h1: "Message Queues and Event-Driven Systems",
  sub: "How queues decouple services, absorb spikes and move slow work off the request path, and how to handle the duplicates, ordering, retries and failures they bring with them.",
  answer: "A message queue is a durable buffer between services: a producer writes a message and moves on, and consumers process it when they can. Queues give you asynchronous processing, load levelling, independent scaling and failure isolation. Most systems deliver at least once, so consumers must be idempotent. Use a work queue when one worker should do each job, pub/sub when many services react to one event, and a retained log like Kafka when you need replay and ordered partitions.",
  minutes: 45,
  level: "Intermediate",
  updated: "2026-11-18",
  crumbs: [["Resources", "/resources"], ["System design", "/resources/hld"], ["Message queues", "/resources/hld/message-queue"]],
  learn: [
    "12 messaging patterns, and how to choose between them",
    "At-most-once, at-least-once and what “exactly-once” really means",
    "Ordering with partitions, consumer groups and offsets",
    "Idempotent consumers, retries with jitter and DLQs",
    "The dual-write problem and the transactional outbox",
  ],
  toc: [
    { id: "fundamentals", label: "What is a message queue?" },
    { id: "sync-vs-async", label: "Sync vs async" },
    { id: "architecture", label: "Architecture and messages" },
    { id: "selection-guide", label: "Choosing a pattern" },
    { id: "patterns", label: "12 messaging patterns" },
    { id: "consumer-groups", label: "Consumer groups" },
    { id: "guarantees", label: "Delivery guarantees" },
    { id: "ordering", label: "Ordering and partitions" },
    { id: "ack", label: "ACKs and visibility timeout" },
    { id: "idempotency", label: "Idempotent consumers" },
    { id: "retries", label: "Retries and backpressure" },
    { id: "kafka-internals", label: "Kafka internals" },
    { id: "rabbitmq-internals", label: "RabbitMQ internals" },
    { id: "managed-queues", label: "Managed queues" },
    { id: "comparison", label: "Kafka vs RabbitMQ vs managed" },
    { id: "outbox", label: "Transactional outbox" },
    { id: "code-examples", label: "Code examples" },
    { id: "bookmyshow", label: "Case study: booking" },
    { id: "failures", label: "Failures and metrics" },
  ],
  questions: [
    { q: "Why do we use a message queue in system design?", a: "It decouples producers from consumers, lets work happen asynchronously, buffers traffic bursts, isolates temporary consumer failures and lets producers and consumers scale independently. The cost is eventual consistency plus new concerns: retries, duplicates, ordering, monitoring and DLQs." },
    { q: "When should you NOT use a message queue?", a: "When the caller needs an immediate, authoritative answer and a synchronous API is simpler; when the workload is tiny and the operational cost outweighs the benefit; or when delayed processing would break business semantics. A queue is an architectural boundary, not a default for every call." },
    { q: "Queue vs pub/sub: what's the difference?", a: "A work queue delivers each job to one successful consumer in a competing worker pool. Pub/sub lets several independent subscriptions each receive the same event. Use a queue for “do this job once”, pub/sub for “this happened, and several systems may react”." },
    { q: "Fanout vs topic routing?", a: "Fanout broadcasts every message to every bound subscriber. Topic routing uses a key or pattern such as payment.success or payment.* so only interested subscribers receive it. Fanout is simpler; topic routing cuts unnecessary traffic when subscribers' interests differ." },
    { q: "FIFO vs standard queue?", a: "Neither is better in general. Choose FIFO only when correctness needs ordering for a key or group. Standard queues allow more throughput and parallelism. Per-order or per-account ordering is usually enough; global ordering is expensive." },
    { q: "At-most-once vs at-least-once vs exactly-once?", a: "At-most-once may lose messages but never redelivers. At-least-once retries until acknowledged, so it rarely loses messages but can duplicate them, which means consumers must be idempotent. Exactly-once must be scoped carefully: a broker may offer it within its own system, but external databases, payment APIs and emails still need idempotency or transactions to produce one business effect." },
    { q: "Why can a duplicate arrive even after successful processing?", a: "The consumer commits its database transaction and then crashes before sending the ACK. The broker can't know the work succeeded, so it redelivers. That's why processing and deduplication must be designed together." },
    { q: "How do you make a consumer idempotent?", a: "Give every event a stable eventId or business key, enforce a unique constraint, record processed event IDs in the same database transaction as the business change, and pass provider idempotency keys to external APIs." },
    { q: "What is a poison message?", a: "A message that always fails, because of bad data, an incompatible schema or a deterministic bug. Retrying it forever wastes capacity and can block an ordered partition. After bounded retries, move it to a DLQ with failure metadata and alert the owning team." },
    { q: "How should retries be designed?", a: "Retry only transient failures, with bounded attempts, exponential backoff and jitter. Keep the attempt count and last error with the message, separate retry traffic from fresh traffic when needed, and send exhausted or permanent failures to a DLQ. Never retry a failing dependency in a tight loop." },
    { q: "What is a visibility timeout?", a: "In SQS-style queues, receiving a message hides it from other consumers for a period. If the consumer deletes (ACKs) it in time, it's done. If the consumer crashes or the timeout expires first, the message becomes visible again and another worker can take it." },
    { q: "How do you keep order without destroying throughput?", a: "Use per-key ordering: hash orderId, accountId or bookingId to a partition or FIFO message group. Events for one entity stay in sequence while different entities process in parallel. Avoid global ordering unless it's truly required." },
    { q: "What happens when one message in an ordered stream keeps failing?", a: "Later messages for that partition or group can't pass it, so the lane blocks. You need bounded retries, a quarantine or DLQ policy, and a business decision on whether later messages may proceed without it." },
    { q: "What is backpressure, and how do you handle it?", a: "Producers create work faster than consumers finish it, so the backlog grows. Handle it with consumer autoscaling, producer throttling, batching, admission control, prioritisation, shedding optional work and protecting downstream systems. A queue absorbs bursts, not infinite sustained overload." },
    { q: "Queue depth or oldest-message age: which matters more?", a: "Both. Depth shows backlog size; oldest-message age shows the delay users actually feel, which is what SLAs care about. Also watch produce and consume rates, processing latency, retry rate, DLQ rate and downstream saturation." },
    { q: "Why does Kafka use partitions?", a: "A partition is an ordered, append-only log. Splitting a topic into partitions spreads storage and throughput across brokers and lets consumers in a group work in parallel. Order is guaranteed only within a partition, so the partition key decides both correctness and load balance." },
    { q: "A consumer group has 10 consumers but the topic has 3 partitions. What happens?", a: "Only three consumers do work, one per partition; the other seven sit idle as standbys. To get more parallelism, add partitions (which changes key-to-partition mapping) or redesign the workload." },
    { q: "What is consumer lag?", a: "The distance between the newest offset in a partition and the offset a consumer group has committed. Rising lag means the group is falling behind. Look at processing latency, downstream bottlenecks, too few consumers, hot partitions and errors." },
    { q: "How do you choose a Kafka partition key?", a: "Pick a stable key that groups events needing order, such as orderId, with enough cardinality to spread load. A poor key, such as one celebrity ID or a region, creates a hot partition while the others idle." },
    { q: "Direct vs topic vs fanout exchanges in RabbitMQ?", a: "Direct routes when the routing key exactly matches a binding key. Topic supports wildcards such as payment.* (one word) and order.# (zero or more words). Fanout ignores keys and broadcasts to every bound queue." },
    { q: "What is prefetch, and why does it matter?", a: "Prefetch caps how many unacknowledged messages a consumer holds. Too high causes unfair distribution and big redelivery after a crash; too low leaves fast workers waiting on the broker. Tune it to message cost and worker concurrency." },
    { q: "When would you choose SQS-style managed queues over Kafka?", a: "For durable background jobs when you value low operations, visibility timeouts, elastic scaling and simple ownership. Choose Kafka-style logs when retained, replayable streams, many independent consumer groups and partitioned ordering are central." },
    { q: "What is the dual-write problem?", a: "A service commits a database change and then publishes an event as two separate steps; one can succeed while the other fails, leaving the database and downstream systems out of sync. The transactional outbox fixes it by writing the business row and an outbox row in one transaction and publishing from the outbox afterwards." },
    { q: "What is the transactional inbox?", a: "The consumer stores each incoming event ID (or the message) in its own database, in the same transaction as the business change. That gives durable deduplication, so at-least-once delivery becomes effectively-once processing." },
    { q: "Command vs event: what goes on the queue?", a: "A command asks one capability to do something (GenerateInvoice) and has one logical owner. An event states a fact that already happened (InvoiceGenerated) and may have many consumers. Keeping them distinct makes event-driven systems far easier to reason about." },
    { q: "Should seat locking in a booking system go behind a queue?", a: "Usually not. The user needs an immediate answer on whether they got the seat, so use an atomic lock or conditional database update synchronously. Queues are great after that decision: hold expiry, ticket generation, notifications and analytics." },
    { q: "How would you release a seat after the payment window expires?", a: "Schedule a delayed expiry message with bookingId, seat IDs and a hold version. When it fires, the worker reads the authoritative booking and releases only if it's still HELD with the same version. If payment already succeeded, the expiry is a no-op." },
    { q: "How would you send 10 million emails without overloading the provider?", a: "Write email jobs to a durable work queue; run workers with bounded concurrency and the provider's rate limit; batch where the API supports it; retry transient errors with backoff and jitter; send permanent failures to a DLQ; use idempotency keys; and monitor oldest-message age, success rate and throttling." },
    { q: "The backlog keeps growing after doubling workers. What do you check?", a: "Arrival rate vs processing rate, oldest-message age, worker CPU, database or API saturation, lock contention, hot partitions, per-message latency, retry storms and poison messages. If the bottleneck is downstream, more workers can make it worse." },
    { q: "How do you safely replay a DLQ?", a: "Fix or classify the root cause first, check schema and version compatibility, pick a bounded subset, replay at a controlled rate through the normal idempotent handler, watch downstream capacity, and keep an audit trail. Never bulk-replay blindly into the same failing dependency." },
    { q: "How do you evolve message schemas without breaking consumers?", a: "Prefer backward-compatible additions, version events, never silently change a field's meaning, validate with a schema registry where useful, support old and new versions during migration, deploy consumers before producers for compatible changes, and define ownership and deprecation rules." },
  ],
  quiz: [
    { q: "An order event must reach notification, analytics and the warehouse. Which pattern?", options: ["One work queue with three competing workers", "Pub/sub (or a stream with three consumer groups)", "A FIFO queue", "A delayed queue"], answer: 1, why: "Each subsystem needs its own copy. Competing consumers would give each event to only one of them." },
    { q: "With at-least-once delivery, what must every consumer be?", options: ["Stateless", "Idempotent", "Single-threaded", "Synchronous"], answer: 1, why: "Duplicates are expected, so processing the same message twice must not apply the effect twice." },
    { q: "A topic has 4 partitions; you run 8 consumers in one group. How many actively consume?", options: ["8", "4", "2", "1"], answer: 1, why: "Each partition is owned by at most one consumer in a group, so 4 work and 4 wait." },
    { q: "Events for the same order must stay in sequence, at high throughput. What do you do?", options: ["One global FIFO queue", "Partition by orderId", "Random partitioning", "Disable retries"], answer: 1, why: "Per-key ordering: the same order always lands on the same partition, while different orders run in parallel." },
    { q: "The service saves an order, then the publish to Kafka fails. What pattern prevents this gap?", options: ["Retry queue", "Transactional outbox", "Fanout exchange", "Prefetch"], answer: 1, why: "The order and the event are written in one database transaction; a separate publisher reliably ships the outbox row." },
    { q: "A message fails validation every time. Where should it end up?", options: ["Retried forever", "In a DLQ with failure metadata and an alert", "Silently dropped", "Re-sent to the producer"], answer: 1, why: "Permanent failures don't get better with retries. Isolate them, alert someone, and replay after a fix." },
  ],
  glossary: [
    ["Producer / consumer", "The service that writes messages / the one that processes them."],
    ["Broker", "The system that stores and delivers messages (Kafka, RabbitMQ, SQS…)."],
    ["Work queue", "Competing consumers: each message is handled by one worker."],
    ["Pub/sub", "Each subscription receives its own copy of every event."],
    ["Partition", "An ordered append-only log; a topic is split into several."],
    ["Offset", "A record's position in a partition; consumer groups track progress by it."],
    ["Consumer group", "Consumers sharing a topic's partitions; each partition has one owner."],
    ["ACK", "The consumer's confirmation that a message is done."],
    ["Visibility timeout", "How long a received message stays hidden before it can be redelivered."],
    ["DLQ", "Dead-letter queue: where messages go after they can't be processed."],
    ["Idempotent consumer", "Processing the same message twice has the same effect as once."],
    ["Transactional outbox", "Writing the event in the same DB transaction as the change, then publishing it."],
  ],
  takeaways: [
    "Queues decouple, buffer and level load. They trade immediate consistency for resilience and scale.",
    "Pick the pattern from semantics first: one worker (work queue), many systems (pub/sub), replay (log), ordering (keyed partitions), future work (delayed).",
    "Assume at-least-once delivery. Make every consumer idempotent with event IDs and unique constraints.",
    "Order per key, not globally: partition by the entity that needs ordering.",
    "Retry only transient failures, with backoff and jitter. Send the rest to a monitored DLQ with a replay plan.",
    "Use the transactional outbox whenever a database change and an event must both happen.",
    "Keep correctness-critical decisions (seat locks, payments) synchronous and atomic; queue the side effects.",
  ],
  faq: [
    { q: "Why do we use a message queue in system design?", a: "Message queues decouple producers from consumers, enable asynchronous processing, absorb traffic bursts and let each side scale and fail independently." },
    { q: "What is the difference between a queue and pub/sub?", a: "In a work queue, each message is handled by one consumer. In pub/sub, every subscriber receives its own copy of each published event." },
    { q: "What is a dead letter queue?", a: "A dead letter queue (DLQ) holds messages that couldn't be processed after the allowed retries, or that broke processing rules, so they stop blocking healthy traffic and can be inspected and replayed later." },
    { q: "When should I choose Kafka instead of RabbitMQ?", a: "Choose Kafka when retained event history, replay, very high-throughput streams, partitioned ordering and many independent consumer groups are central. Choose RabbitMQ for flexible routing, classic work queues and acknowledgement-driven business messaging." },
    { q: "Does a message queue guarantee exactly-once processing?", a: "Not end to end. Failures can still cause duplicate deliveries. Exactly-once business effects need a clearly defined scope plus idempotency, transactions, unique constraints or provider idempotency keys." },
    { q: "Where should queues be used in a booking system?", a: "Keep seat locking and the immediate booking decision synchronous and atomic. Use queues for hold expiry, payment events, ticket generation, notifications, analytics and retries." },
  ],
  next: { title: "SQL", path: "/resources/sql", text: "Every one of these systems ends in queries. Joins, CTEs, window functions, indexes and transactions, with interview problems." },
  book: {
    path: "/book/system-design/hld", label: "HLD book", title: "See queues inside complete designs",
    text: "Learn how caching, databases, load balancing, queues, rate limiting, concurrency and failure handling work together in systems like BookMyShow and Uber.",
    short: "Complete interview designs, end to end.",
    chips: ["Kafka", "Pub/sub", "Retry", "DLQ", "Outbox", "BookMyShow"],
  },
};

/* ============================ the 12 patterns ============================ */
const PATTERNS = [
  { id: "point-to-point", title: "Point-to-point queue", icon: Tray, pitch: "A producer sends a message to a queue and one consumer processes it.",
    theory: ["The simplest model. Producers write independent units of work; consumers compete for them, and each message is completed by one consumer.", "The queue decouples producer speed from consumer speed. If producers create 20,000 jobs a second while workers handle 10,000, the backlog grows instead of making every producer wait.", "Use it when the work should happen once. If three systems all need the same event, use pub/sub instead."],
    flow: [{ t: "Order API", s: "Creates a background job", i: Desktop }, { t: "orders.queue", s: "M1 · M2 · M3", i: Tray, tone: "hot" }, { row: [{ t: "Worker 1", s: "M1", i: Desktop }, { t: "Worker 2", s: "M2", i: Desktop }, { t: "Worker 3", s: "M3", i: Desktop }], via: "each message → one worker" }],
    best: ["One job, one owner", "Background processing that scales with workers", "Buffering temporary spikes", "The producer doesn't need the result now"],
    avoid: ["Many services need the same message", "New consumers need historical replay", "Strict global ordering matters more than parallelism"],
    facts: [["Ordering", "Usually none, unless the queue offers FIFO."], ["Delivery", "Usually at-least-once with ACK or delete."], ["Scaling", "Add consumers until they keep up, within downstream limits."], ["Tech", "RabbitMQ queues, SQS standard, Azure Service Bus queues."]],
    tip: "Say “one message → one successful worker”, not “a queue can only have one consumer”. Many consumers can compete on the same queue." },
  { id: "work-queue", title: "Work queue (competing consumers)", icon: FlowArrow, pitch: "Many workers pull from one queue to share slow or expensive jobs.",
    theory: ["A point-to-point queue used to spread jobs across a worker pool running the same logic.", "The key controls are worker concurrency, prefetch or batch size, when you ACK, and downstream capacity. Too much prefetch is unfair; too little wastes fast workers.", "Autoscale on queue depth and oldest-message age together: ten 30-minute video jobs and ten 20-ms jobs look identical by depth alone."],
    flow: [{ t: "Upload API", s: "video.mp4", i: Desktop }, { t: "transcode.jobs", s: "Buffered work", i: Tray, tone: "hot" }, { row: [{ t: "Worker A", s: "1080p", i: Desktop }, { t: "Worker B", s: "720p", i: Desktop }, { t: "Worker C", s: "480p", i: Desktop }], via: "competing workers" }],
    best: ["CPU- or I/O-heavy background jobs", "Independent jobs", "Workers that scale horizontally", "Users don't wait for completion"],
    avoid: ["Every downstream needs a copy", "Multi-stage jobs without an explicit workflow", "Strict cross-job ordering"],
    facts: [["Ordering", "Weak: many workers run at once."], ["Delivery", "At-least-once; ACK only after success."], ["Scaling", "Autoscale workers while protecting databases and APIs."], ["Tech", "RabbitMQ, SQS, Celery, cloud task queues, Redis job queues."]],
    tip: "Mention prefetch, concurrency and poison jobs. Scaling workers without protecting downstream systems just moves the bottleneck." },
  { id: "pub-sub", title: "Publish / subscribe", icon: Broadcast, pitch: "A publisher emits an event without knowing its subscribers; each subscriber gets its own copy.",
    theory: ["Use it when an event matters to several independent systems. The publisher writes to a topic; each subscription receives the event independently.", "Each subscriber owns its progress: notifications can fail while analytics succeeds. That independence is the core benefit of event-driven design.", "Events should state facts (ORDER_CREATED, PAYMENT_SUCCEEDED), not disguised remote procedure calls."],
    flow: [{ t: "Order service", s: "ORDER_CREATED", i: Desktop }, { t: "orders.created", s: "Topic / event bus", i: Broadcast, tone: "hot" }, { row: [{ t: "Notification", s: "send confirmation", i: Bell }, { t: "Analytics", s: "record conversion", i: ChartLine }, { t: "Warehouse", s: "store the event", i: Database }], via: "every subscriber gets it" }],
    best: ["Several systems react to one business event", "Loose coupling", "Subscribers fail and scale independently", "New subscribers get added later"],
    avoid: ["Exactly one worker should own the task", "The publisher needs a reply from every subscriber", "Unmanaged, unstable event contracts"],
    facts: [["Ordering", "Usually per key or partition."], ["Delivery", "Often at-least-once per subscription."], ["Scaling", "Each subscription scales on its own; a slow one doesn't block others."], ["Tech", "Kafka consumer groups, Google Pub/Sub, SNS → SQS, RabbitMQ exchanges."]],
    tip: "Pub/sub is the communication model; fanout is one routing behaviour that implements broadcast." },
  { id: "fanout", title: "Fanout / broadcast", icon: GitFork, pitch: "Every bound subscriber receives a copy of every message.",
    theory: ["No routing key: every bound queue gets every message.", "Good for system-wide events every subscriber cares about, such as configuration changes or cache invalidation.", "One message becomes many deliveries, so budget for payload size × subscriber count × retries."],
    flow: [{ t: "Config service", s: "CONFIG_CHANGED", i: Desktop }, { t: "Fanout exchange", s: "Broadcast", i: GitFork, tone: "hot" }, { row: [{ t: "Service A", s: "reload", i: Desktop }, { t: "Service B", s: "reload", i: Desktop }, { t: "Service C", s: "reload", i: Desktop }], via: "a copy each" }],
    best: ["Every subscriber needs every event", "Config changes and cache invalidation", "Independent audit and notification copies"],
    avoid: ["Most consumers need only a subset", "Huge subscriber counts with large payloads", "Selective routing would cut traffic a lot"],
    facts: [["Ordering", "Per subscriber queue."], ["Delivery", "Each subscriber has its own ACK lifecycle."], ["Scaling", "Subscribers scale independently; watch fanout amplification."], ["Tech", "RabbitMQ fanout exchange, SNS → SQS, pub/sub subscriptions."]],
    tip: "Use fanout only when broadcast is the point. Don't send everything to everyone and make consumers throw away 99% of it." },
  { id: "topic-routing", title: "Topic-based routing", icon: Path, pitch: "Subscribers receive only the events whose routing key matches their pattern.",
    theory: ["Between one-to-one and full broadcast. Producers publish meaningful keys such as payment.success, payment.failed or order.created.", "Subscribers bind to exact keys or patterns like payment.*, so unrelated traffic never reaches them and ownership stays clear.", "Topic naming is architecture. Without conventions and schema ownership, event names turn ambiguous and consumers turn brittle."],
    flow: [{ t: "Payment service", s: "routingKey = payment.success", i: Desktop }, { t: "payments exchange", s: "Topic routing", i: Path, tone: "hot" }, { row: [{ t: "Booking queue", s: "payment.success", i: Tray }, { t: "Fraud queue", s: "payment.*", i: ShieldCheck }, { t: "Recovery queue", s: "payment.failed", i: WarningOctagon }], via: "routing-key match" }],
    best: ["Consumers need subsets of events", "Event families share one broker", "Stable, meaningful routing rules"],
    avoid: ["Everyone needs everything (use fanout)", "Routing so clever it hides the workflow", "Using topics as authorisation"],
    facts: [["Ordering", "Per topic, partition or queue, not global."], ["Delivery", "Broker-dependent; usually durable at-least-once."], ["Scaling", "Different keys feed independent queues and worker pools."], ["Tech", "RabbitMQ topic exchanges, Kafka topic naming, SNS filtering."]],
    tip: "Give a concrete key (payment.success) and name who subscribes to it, rather than defining topic routing in the abstract." },
  { id: "fifo", title: "FIFO / ordered queue", icon: ListNumbers, pitch: "Messages are processed in sequence, globally or (better) per key.",
    theory: ["FIFO matters when processing M2 before M1 would produce an invalid state, such as CREATED → PAID → SHIPPED for one order.", "Global ordering forces everything through one lane and kills parallelism. Large systems order per entity instead.", "Hash orderId, bookingId or accountId to a partition or message group: different entities run in parallel, each one stays in order."],
    flow: [{ t: "Order service", s: "key = order-501", i: Desktop }, { t: "Partition / FIFO group", s: "CREATED → PAID → SHIPPED", i: ListNumbers, tone: "hot" }, { t: "Order consumer", s: "Applies them in order", i: Desktop }],
    best: ["State transitions that must apply in order", "Per-account ledgers", "Per-SKU inventory changes", "Workflow steps for one entity"],
    avoid: ["Independent jobs", "Throughput matters more than order", "“Global ordering” without a business reason"],
    facts: [["Ordering", "Global, or (preferably) per key / message group."], ["Delivery", "Still often at-least-once: FIFO ≠ exactly-once."], ["Scaling", "Scale across many keys, not within one ordered lane."], ["Tech", "Kafka partitions, SQS FIFO groups, RabbitMQ single active consumer."]],
    tip: "Ask “ordering of what?” Per-order ordering is almost always enough; global ordering across the company rarely is." },
  { id: "priority", title: "Priority queue", icon: SortAscending, pitch: "Urgent work jumps ahead of bulk work.",
    theory: ["Not all work is equally urgent: security incidents and payment reconciliation shouldn't wait behind a marketing blast.", "A priority number alone isn't enough. Prevent starvation of low-priority work with ageing, weighted scheduling or reserved workers.", "Many teams simply use a separate queue per priority, because it makes capacity explicit."],
    flow: [{ t: "Job producers", s: "P1 / P2 / P3", i: Desktop }, { t: "Priority scheduler", s: "P1 first, with fairness", i: SortAscending, tone: "hot" }, { row: [{ t: "Critical", s: "P1 security", i: ShieldCheck }, { t: "Normal", s: "P2 payments", i: Desktop }, { t: "Bulk", s: "P3 marketing", i: Desktop }] }],
    best: ["Real differences in urgency", "SLA tiers", "Incidents that must skip the bulk backlog"],
    avoid: ["Everything marked high priority", "Fairness is the requirement", "No actual SLA difference"],
    facts: [["Ordering", "Priority beats FIFO across levels; FIFO within a level."], ["Delivery", "Same as the underlying queue."], ["Scaling", "Separate pools or reserved capacity for high priority."], ["Tech", "RabbitMQ priority queues, separate SQS queues, job frameworks."]],
    tip: "Always address starvation: explain how low-priority work still makes progress." },
  { id: "delayed", title: "Delayed / scheduled queue", icon: Alarm, pitch: "A message becomes available only after a delay or at a scheduled time.",
    theory: ["Represents future work without repeatedly scanning a database: the broker holds the job until it's due.", "Great for hold expiry, retry-after delays, reminders and cart abandonment. Treat the timing as approximate unless the technology promises otherwise.", "For months-long horizons or millions of long timers, a scheduler plus a durable table may fit better than the broker."],
    flow: [{ t: "Booking service", s: "Expire the hold at T + 5 min", i: Desktop }, { t: "Delayed queue", s: "Hidden until due", i: Alarm, tone: "hot" }, { t: "Expiry worker", s: "HELD → AVAILABLE if still unpaid", i: Timer, via: "after the delay" }],
    best: ["Short and medium future actions", "Hold or lock expiry", "Retry after backoff", "Reminder workflows"],
    avoid: ["Sub-millisecond timer precision", "Jobs scheduled months ahead", "Brokers without clean delay support"],
    facts: [["Ordering", "Due-time order isn't exact under retries."], ["Delivery", "Inherits at-least-once from the queue."], ["Scaling", "Partition timers; make handlers idempotent."], ["Tech", "SQS delay/timers, RabbitMQ delayed messages, Redis sorted sets, schedulers."]],
    tip: "In booking, name the race: payment success can arrive at the same moment as expiry. The worker must check authoritative state first." },
  { id: "retry", title: "Retry queue", icon: Repeat, pitch: "Temporarily failed work is retried later, with backoff, instead of hammering the dependency.",
    theory: ["Retries are for transient failures: timeouts, 5xx, rate limits, short outages. Validation errors shouldn't loop through retries.", "Use bounded attempts, exponential backoff and jitter, so thousands of failed messages don't all retry in the same second.", "Common tiers: 5 s → 30 s → 5 min → DLQ, carrying the attempt count and last error with the message."],
    flow: [{ t: "Consumer", s: "Provider timeout", i: Desktop, tone: "bad" }, { t: "Retry tier", s: "5 s → 30 s → 5 min + jitter", i: Repeat, tone: "hot" }, { row: [{ t: "Retry succeeds", s: "ACK", i: CheckCircle, tone: "good" }, { t: "DLQ", s: "Max attempts hit", i: WarningOctagon, tone: "bad" }] }],
    best: ["Temporary downstream failures", "Recoverable timeouts", "Provider rate limits with retry hints", "Brief database or network issues"],
    avoid: ["Invalid payloads", "Business-rule rejections", "Permanent auth failures", "Non-idempotent side effects"],
    facts: [["Ordering", "Retries can break order unless built into the ordered lane."], ["Delivery", "At-least-once by design; handlers must be duplicate-safe."], ["Scaling", "Separate retry traffic so old failures can't swamp fresh work."], ["Tech", "Retry queues/exchanges, SQS redrive, Kafka retry topics."]],
    tip: "Classify errors before retrying. “Retry everything three times” is not a strategy." },
  { id: "dlq", title: "Dead-letter queue (DLQ)", icon: WarningOctagon, pitch: "Messages that can't be processed are isolated for investigation and controlled replay.",
    theory: ["Stops poison messages from blocking healthy traffic forever. They arrive after exhausting retries or failing validation.", "The DLQ isn't the end: you need alerts, dashboards, failure metadata, inspection tools and a safe replay path after the fix.", "Blind bulk replay can repeat the outage. Replay rate-limited, observed, and filtered by failure reason or version."],
    flow: [{ t: "Main consumer", s: "Fails repeatedly", i: Desktop, tone: "bad" }, { t: "DLQ", s: "Payload + reason + attempts", i: WarningOctagon, tone: "hot" }, { row: [{ t: "Alerting", s: "Notify the owner", i: Bell }, { t: "Replay tool", s: "Fix → controlled replay", i: ArrowsClockwise }] }],
    best: ["Isolating poison messages", "Operator visibility", "Controlled replay after a fix"],
    avoid: ["Replacing input validation", "Nobody owns monitoring or replay", "Sensitive payloads without retention controls"],
    facts: [["Ordering", "Pulling one message out lets later ones pass."], ["Delivery", "Stores failed deliveries for inspection."], ["Scaling", "Should stay small; sudden growth is an incident."], ["Tech", "SQS DLQ, RabbitMQ dead-letter exchange, Kafka DLT, Service Bus."]],
    tip: "Always pair the DLQ with alerting and a replay plan. “After 3 retries, DLQ” is only half an answer." },
  { id: "request-reply", title: "Request-reply over messaging", icon: EnvelopeSimple, pitch: "A command goes out with a correlation ID and reply address; a response message comes back.",
    theory: ["Useful when transport must be queued but the caller still wants a response. The request carries a correlationId and a replyTo.", "Harder than HTTP: timeouts, abandoned replies, correlation state and duplicate responses all need handling.", "Use it for long-running or disconnected work; for ordinary low-latency calls, HTTP or gRPC is simpler."],
    flow: [{ t: "Report API", s: "correlationId = req-42", i: Desktop }, { t: "report.request", s: "replyTo = report.reply", i: EnvelopeSimple, tone: "hot" }, { row: [{ t: "Report worker", s: "Publishes the result", i: Desktop }, { t: "Reply queue", s: "req-42 response", i: Tray }] }],
    best: ["Messaging is the required transport", "Requests outlive the caller's connection", "Queued requests with eventual responses"],
    avoid: ["Plain low-latency RPC is enough", "Callers can't handle async timeouts", "Correlation state isn't worth it"],
    facts: [["Ordering", "By correlation ID, not globally."], ["Delivery", "Both directions need reliability and idempotency."], ["Scaling", "Workers scale like a work queue."], ["Tech", "RabbitMQ reply-to, JMS request/reply."]],
    tip: "Justify why queued transport is needed; otherwise HTTP or gRPC is the clearer answer." },
  { id: "streams", title: "Event stream / append-only log", icon: ClockCounterClockwise, pitch: "Events are appended to a retained, ordered log that consumers read and replay independently.",
    theory: ["Unlike a destructive queue, consuming advances a consumer offset; the event stays for everyone else.", "Retention enables replay: a new analytics consumer can start from old offsets, or a fixed consumer can rebuild its state.", "Partitions provide scale: the same key goes to the same partition (ordered); different keys spread across partitions (parallel)."],
    flow: [{ t: "Event producers", s: "Append events", i: Desktop }, { t: "orders topic", s: "P0 | P1 | P2, with retained offsets", i: ClockCounterClockwise, tone: "hot" }, { row: [{ t: "Analytics group", s: "own offsets", i: ChartLine }, { t: "Notification group", s: "own offsets", i: Bell }, { t: "Warehouse group", s: "replays history", i: Database }], via: "independent consumer groups" }],
    best: ["Replay matters", "Many independent consumers", "High-throughput pipelines", "CDC, analytics, event sourcing"],
    avoid: ["A small task queue is all you need", "Partitions and retention are unneeded complexity", "Rich per-message routing dominates"],
    facts: [["Ordering", "Within a partition, not across the topic."], ["Delivery", "Commonly at-least-once; stronger within platform scope."], ["Scaling", "More partitions → more consumers per group."], ["Tech", "Apache Kafka, Redpanda, Amazon Kinesis, Pulsar."]],
    tip: "The real difference is a retained log with independent offsets and replay, not “Kafka is faster than RabbitMQ”." },
];

function PatternExplorer() {
  const [i, setI] = useState(0);
  const go = (n) => setI((n + PATTERNS.length) % PATTERNS.length);
  return (
    <div className="rk-ex">
      <div className="rk-ex-tabs" role="tablist" aria-label="Messaging patterns">
        {PATTERNS.map((p, n) => {
          const I = p.icon;
          return (
            <button key={p.id} id={`pt-${p.id}`} role="tab" type="button" aria-selected={i === n} aria-controls={`pp-${p.id}`} onClick={() => setI(n)}>
              <small>{String(n + 1).padStart(2, "0")}</small><I size={18} weight="duotone" aria-hidden />{p.title}
            </button>
          );
        })}
      </div>
      {PATTERNS.map((p, n) => (
        <article key={p.id} id={`pp-${p.id}`} role="tabpanel" aria-labelledby={`pt-${p.id}`} className="rk-ex-panel" hidden={i !== n}>
          <header><small>Pattern {n + 1} of {PATTERNS.length}</small><h3>{p.title}</h3><p>{p.pitch}</p></header>
          <div className="rk-prose">{p.theory.map((t) => <p key={t}>{t}</p>)}</div>
          <Flow steps={p.flow} />
          <Compare
            left={{ tone: "good", title: "Best when", items: p.best }}
            right={{ tone: "bad", title: "Avoid or reconsider when", items: p.avoid }}
          />
          <Table head={["Aspect", "In practice"]} rows={p.facts} />
          <Call tone="interview" title="what to say">{p.tip}</Call>
          <div className="rk-ex-nav">
            <Btn variant="ghost" size="sm" onClick={() => go(n - 1)}><ArrowLeft size={14} weight="bold" aria-hidden />Previous</Btn>
            <Btn size="sm" onClick={() => go(n + 1)}>Next pattern <ArrowRight size={14} weight="bold" aria-hidden /></Btn>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function HLDMessageQueueResource() {
  return (
    <ReaderPage guide={GUIDE}>
      {/* 01 */}
      <Sec id="fundamentals" n={1} eyebrow="Fundamentals" title="What is a message queue?" lead="An intermediary that lets one component hand off work or events without the receiver having to process them right now.">
        <Flow across steps={[
          { t: "Producer", s: "Creates a message", i: Desktop },
          { t: "Queue / broker", s: "Stores it durably", i: Queue, tone: "hot", via: "publish" },
          { t: "Consumer", s: "Processes it", i: Desktop, via: "consume" },
        ]} />
        <Cards cols={3} items={[
          ["Decoupling", "The producer doesn't care when or how fast the work is done.", CheckCircle],
          ["Async processing", "The request finishes while background work continues.", CheckCircle],
          ["Traffic buffering", "Spikes queue up while consumers catch up.", CheckCircle],
          ["Independent scaling", "Producers and consumers scale separately.", CheckCircle],
          ["Failure isolation", "A consumer outage doesn't lose incoming work.", CheckCircle],
          ["Load levelling", "Bursty input becomes smooth downstream processing.", CheckCircle],
        ]} />
        <Call tone="tip" title="“Queue” doesn't automatically mean Kafka">First decide the communication model you need: task queue, pub/sub, replayable stream, ordered events, delayed execution or routing. Then pick the technology.</Call>
      </Sec>

      {/* 02 */}
      <Sec id="sync-vs-async" n={2} eyebrow="Architecture" title="Synchronous vs asynchronous" lead="Queues shine when the caller doesn't need every downstream activity to finish before getting a response.">
        <Compare
          left={{ tone: "plain", title: "Synchronous", text: "Client → Order API → Notification service, and the caller waits.", items: ["Immediate, authoritative answer", "Latency adds up across every hop", "One slow dependency slows the whole request"] }}
          right={{ tone: "plain", title: "Asynchronous", text: "Client → Order API → queue → notification worker, and the API returns at once.", items: ["Fast response; work continues later", "Dependencies can fail without failing the request", "Results arrive eventually, not instantly"] }}
        />
        <Call tone="warn" title="Follow the business semantics">If a user needs to know <em>now</em> whether payment succeeded, hiding it behind a queue may break the experience. Put async boundaries where “eventually” is genuinely acceptable.</Call>
      </Sec>

      {/* 03 */}
      <Sec id="architecture" n={3} eyebrow="Core components" title="Architecture and the message itself" lead="Most messaging systems have producers, a broker with queues or topics, consumers, and some way of tracking what's done.">
        <Flow steps={[
          { row: [{ t: "Producer A", s: "Order service", i: Desktop }, { t: "Producer B", s: "Payment service", i: Desktop }, { t: "Producer C", s: "User service", i: Desktop }] },
          { t: "Message broker", s: "Queues · topics · partitions · retention", i: Queue, tone: "hot", via: "messages / events" },
          { row: [{ t: "Consumer A", s: "Notification", i: Desktop }, { t: "Consumer B", s: "Analytics", i: Desktop }, { t: "Consumer C", s: "Inventory", i: Desktop }] },
        ]} />
        <Code title="A well-formed event" lang="json">{`
{
  "eventId": "evt_99201",
  "eventType": "ORDER_CREATED",
  "version": 1,
  "occurredAt": "2026-11-18T14:00:00Z",
  "correlationId": "req_123",
  "payload": { "orderId": "order_501", "userId": "user_42", "amount": 1999 }
}`}</Code>
        <Table head={["Field", "Why it's there"]} rows={[
          ["eventId", "A unique ID consumers use to deduplicate."],
          ["eventType", "Which business fact this is."],
          ["version", "Lets the schema evolve safely."],
          ["occurredAt", "When it happened, not when it was processed."],
          ["correlationId", "Traces one workflow across services."],
          ["payload", "Only the data consumers actually need."],
        ]} />
      </Sec>

      {/* 04 */}
      <Sec id="selection-guide" n={4} eyebrow="Decision guide" title="Which messaging pattern should you choose?" lead="Start from semantics: who needs the message, whether order or replay matters, and whether it's a command, a job or an event.">
        <Flow steps={[
          { t: "What does the producer need?", s: "job · event · ordered change · future work", i: Queue, tone: "hot" },
          { row: [{ t: "One worker", s: "Work queue", i: FlowArrow }, { t: "Many systems", s: "Pub/sub or stream", i: Broadcast }, { t: "Ordering", s: "Keyed partition / FIFO", i: ListNumbers }, { t: "Later", s: "Delayed queue", i: Alarm }] },
          { row: [{ t: "Retry", s: "transient failures", i: Repeat }, { t: "DLQ", s: "poison messages", i: WarningOctagon }, { t: "Idempotency", s: "duplicate-safe effects", i: ShieldCheck }], via: "then add reliability" },
        ]} />
        <Table head={["Requirement", "Start with", "Why", "Common mistake"]} rows={[
          ["One job → one worker", "Work queue", "Clear ownership; scale workers", "Using pub/sub and doing the job several times"],
          ["Many services react to one fact", "Pub/sub", "Each subscriber has its own progress", "One competing queue, so only one service sees it"],
          ["Replay history", "Event stream / log", "Retention + offsets", "A destructive queue, and history is gone"],
          ["Same entity stays ordered", "Keyed partition / FIFO group", "Order only where needed", "Global ordering that kills throughput"],
          ["Do it later", "Delayed queue", "No database polling", "Assuming exact timing; ignoring races"],
          ["Temporary failure", "Retry queue", "Backoff lets the dependency recover", "Immediate, infinite retries"],
          ["Permanent failure", "DLQ", "Isolate, inspect, replay safely", "A DLQ nobody watches"],
        ]} />
      </Sec>

      {/* 05 */}
      <Sec id="patterns" n={5} eyebrow="Pattern library" title="12 messaging patterns, explained" lead="Pick a pattern to see how it works, a diagram, when to use it, when not to, and what to say in an interview.">
        <PatternExplorer />
      </Sec>

      {/* 06 */}
      <Sec id="consumer-groups" n={6} eyebrow="Kafka concept" title="Consumer groups" lead="Consumers in one group share a topic's partitions; separate groups each read the whole stream independently.">
        <Flow steps={[
          { row: [{ t: "Partition 0", i: ClockCounterClockwise, tone: "hot" }, { t: "Partition 1", i: ClockCounterClockwise, tone: "hot" }, { t: "Partition 2", i: ClockCounterClockwise, tone: "hot" }] },
          { row: [{ t: "Consumer 1", s: "owns P0", i: Desktop }, { t: "Consumer 2", s: "owns P1", i: Desktop }, { t: "Consumer 3", s: "owns P2", i: Desktop }], via: "group: notification" },
        ]} />
        <Call tone="info" title="The scaling rule">With 3 partitions, one group can process at most 3 partitions in parallel. Adding 10 consumers to that group doesn't give you 10-way parallelism; 7 of them sit idle.</Call>
        <H3>Different groups, same stream</H3>
        <Flow steps={[
          { t: "orders topic", i: Broadcast, tone: "hot" },
          { row: [{ t: "notification-group", s: "reads every order", i: Bell }, { t: "analytics-group", s: "reads every order", i: ChartLine }, { t: "warehouse-group", s: "reads every order", i: Database }] },
        ]} />
      </Sec>

      {/* 07 */}
      <Sec id="guarantees" n={7} eyebrow="Reliability" title="Delivery guarantees" lead="What can happen to a message when producers, brokers or consumers fail.">
        <Table head={["Guarantee", "Deliveries", "Risk", "You must…"]} rows={[
          ["At-most-once", "0 or 1", "Messages can be lost", "Accept loss (metrics, logs)"],
          ["At-least-once", "1 or more", "Duplicates", "Make consumers idempotent"],
          ["Exactly-once", "One business effect", "Hard to guarantee end to end", "Define the scope; use idempotency or transactions"],
        ]} />
        <Call tone="warn" title="Exactly-once needs a precise definition">Kafka can provide exactly-once processing <em>within Kafka</em> (transactions across topics and offsets). That doesn't make an external payment API, email provider and your database all happen exactly once together. That part is still idempotency.</Call>
      </Sec>

      {/* 08 */}
      <Sec id="ordering" n={8} eyebrow="Correctness" title="Ordering and partitions" lead="Ordering requirements decide how you partition, and therefore how far you can scale.">
        <Compare
          left={{ tone: "bad", title: "Global ordering", items: ["M1 → M2 → M3 → M4 → M5 for everything", "One lane: very limited parallelism", "Rarely what the business needs"] }}
          right={{ tone: "good", title: "Per-key ordering", items: ["order-1: CREATED → PAID → SHIPPED", "order-2: CREATED → CANCELLED", "Each order in sequence; orders in parallel"] }}
        />
        <Code title="Partition by order ID" lang="js">{`
const partition = hash(orderId) % partitionCount;
// same orderId → same partition → processed in order`}</Code>
        <Flow steps={[
          { t: "Producer", s: "key = orderId", i: Desktop },
          { row: [{ t: "Partition 0", s: "orders A, D, G", i: ClockCounterClockwise, tone: "hot" }, { t: "Partition 1", s: "orders B, E, H", i: ClockCounterClockwise, tone: "hot" }, { t: "Partition 2", s: "orders C, F, I", i: ClockCounterClockwise, tone: "hot" }], via: "hash(key)" },
        ]} />
        <Call tone="warn" title="The hot partition problem">If one key produces a big share of events (one celebrity, one blockbuster show), its partition overloads while the others idle. Order only where you must, and pick keys with high cardinality.</Call>
      </Sec>

      {/* 09 */}
      <Sec id="ack" n={9} eyebrow="Message lifecycle" title="Acknowledgements and visibility timeouts" lead="The broker needs to know when processing really finished.">
        <Flow steps={[
          { t: "Queue", s: "Message available", i: Queue, tone: "hot" },
          { t: "Consumer", s: "Processing…", i: Desktop, via: "receive" },
          { t: "Done", s: "Removed / offset committed", i: CheckCircle, tone: "good", via: "ACK" },
        ]} />
        <H3>What if the consumer crashes before the ACK?</H3>
        <Flow steps={[
          { t: "Consumer A", s: "Receives M1", i: Desktop },
          { t: "No ACK", s: "Not considered complete", i: Warning, tone: "bad", via: "crash" },
          { t: "Consumer B", s: "Processes M1 again", i: Desktop, tone: "good", via: "visible again / reassigned" },
        ]} />
        <Call tone="info" title="Visibility timeout">In SQS-style queues, a received message is hidden from other consumers for a while. Delete it in time and it's done; if the timeout passes first, it reappears. Set the timeout longer than your slowest normal processing, and extend it for long jobs.</Call>
      </Sec>

      {/* 10 */}
      <Sec id="idempotency" n={10} eyebrow="Critical concept" title="Idempotent consumers" lead="If the same message arrives twice, processing it twice must not duplicate the business effect.">
        <Code title="Bad: a duplicate charges the customer twice" lang="js">{`
async function handlePayment(message) {
  await paymentProvider.charge(message.userId, message.amount);
}`}</Code>
        <Code title="Better: deduplicate in the same transaction" lang="js">{`
async function handleEvent(event) {
  await db.transaction(async (tx) => {
    // the unique constraint on event_id makes a duplicate fail here
    const inserted = await tx.query(
      "INSERT INTO processed_events (event_id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING 1",
      [event.eventId]
    );
    if (inserted.rowCount === 0) return;   // already processed → safe no-op

    await applyBusinessChange(tx, event);  // commits together with the marker
  });
}`}</Code>
        <Cards items={[
          ["Unique event ID", "Every event carries a stable identifier."],
          ["Idempotency key", "A business or client key for operations that may be retried."],
          ["Unique DB constraint", "The database itself rejects a repeated effect."],
          ["Processed-events table", "A record of what's already been applied (the transactional inbox)."],
        ]} />
      </Sec>

      {/* 11 */}
      <Sec id="retries" n={11} eyebrow="Resilience" title="Retries and backpressure" lead="Give temporary failures time to recover, and don't let a queue hide sustained overload.">
        <Code title="Exponential backoff with jitter" lang="js">{`
// attempt 1 → now, 2 → ~2 s, 3 → ~4 s, 4 → ~8 s, 5 → ~16 s, then DLQ
const delay  = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** attempt);
const jitter = Math.random() * 1000;          // spread retries out
scheduleRetry(message, delay + jitter);`}</Code>
        <Call tone="warn" title="Why jitter?">If 100,000 messages fail together and all retry after exactly 30 seconds, they hit the recovering dependency together again. Jitter spreads them over time.</Call>
        <Compare
          left={{ tone: "good", title: "Retry", items: ["Network blips and timeouts", "Temporary 5xx", "Rate limits with a retry hint"] }}
          right={{ tone: "bad", title: "Don't blindly retry", items: ["Invalid schema or missing fields", "Business-rule violations", "Permanently invalid accounts"] }}
        />
        <H3>Backpressure</H3>
        <Flow steps={[
          { t: "Incoming", s: "100K jobs / sec", i: Users },
          { t: "Queue", s: "Backlog growing", i: Queue, tone: "bad" },
          { t: "Consumers", s: "Only 20K / sec", i: Desktop, via: "can't keep up" },
        ]} />
        <Cards cols={3} items={[
          ["Autoscale consumers", "On lag and oldest-message age."],
          ["Throttle producers", "Reject, delay or rate-limit non-critical work."],
          ["Batch", "Process many messages per call when downstream benefits."],
          ["Prioritise", "Critical traffic first."],
          ["Shed load", "Drop optional work under severe pressure."],
          ["Bound the queue", "Retention, quotas and alerts, never infinite growth."],
        ]} />
      </Sec>

      {/* 12 */}
      <Sec id="kafka-internals" n={12} eyebrow="Kafka deep dive" title="Kafka internals" lead="Kafka is best understood as a partitioned, replicated, retained log, not just a faster queue.">
        <Flow steps={[
          { row: [{ t: "Producer A", s: "key = order-1", i: Desktop }, { t: "Producer B", s: "key = order-2", i: Desktop }, { t: "Producer C", s: "key = order-3", i: Desktop }] },
          { row: [{ t: "Partition 0", s: "leader + replicas · offsets 0…N", i: ClockCounterClockwise, tone: "hot" }, { t: "Partition 1", s: "leader + replicas · offsets 0…N", i: ClockCounterClockwise, tone: "hot" }, { t: "Partition 2", s: "leader + replicas · offsets 0…N", i: ClockCounterClockwise, tone: "hot" }], via: "partitioner picks a partition" },
          { row: [{ t: "Consumer 1", s: "P0", i: Desktop }, { t: "Consumer 2", s: "P1", i: Desktop }, { t: "Consumer 3", s: "P2", i: Desktop }], via: "group assignment" },
        ]} />
        <Table head={["Concept", "What it means"]} rows={[
          ["Topic", "A named stream of events, e.g. booking.events, split into partitions."],
          ["Partition", "An ordered, append-only log. Order is guaranteed inside one partition only."],
          ["Offset", "A record's position in its partition; groups track progress by offset."],
          ["Leader & replicas", "One broker leads each partition; followers copy it for durability (acks=all + min.insync.replicas)."],
          ["Consumer group", "Each partition is owned by one active consumer in the group."],
          ["Retention", "Events stay for a configured time or size after being read, which enables replay."],
          ["Rebalance", "Partitions move when consumers join or leave; processing pauses briefly."],
          ["Hot partition", "A skewed key overloads one partition while others idle."],
        ]} />
        <Call tone="warn" title="More partitions aren't free">They add metadata, rebalance work and file handles, and changing the count remaps keys to partitions (breaking per-key order for in-flight data). Size partitions for expected throughput and ordering keys up front.</Call>
      </Sec>

      {/* 13 */}
      <Sec id="rabbitmq-internals" n={13} eyebrow="RabbitMQ deep dive" title="RabbitMQ internals" lead="A traditional broker with powerful routing before messages ever reach a queue.">
        <Flow steps={[
          { t: "Producer", s: "routingKey = payment.success", i: Desktop },
          { t: "Exchange", s: "direct · topic · fanout · headers", i: Path, tone: "hot", via: "publish" },
          { row: [{ t: "booking.queue", s: "payment.success", i: Tray }, { t: "fraud.queue", s: "payment.*", i: Tray }, { t: "audit.queue", s: "payment.#", i: Tray }], via: "bindings decide" },
          { t: "Workers", s: "Prefetch limits in-flight messages", i: Desktop, via: "ACK / NACK" },
        ]} />
        <Table head={["Exchange", "Routing rule", "Good for", "Example"]} rows={[
          ["Direct", "Exact key match", "Simple explicit routing", "payment.success → booking.queue"],
          ["Topic", "Wildcards (* = one word, # = any)", "Event families", "payment.* or order.#"],
          ["Fanout", "Every bound queue", "Broadcast", "config.changed → all services"],
          ["Headers", "Match on headers", "Metadata routing", "x-region=IN, x-tier=premium"],
        ]} />
        <Call tone="info" title="Prefetch trades throughput for fairness">With prefetch 100, a consumer can hold 100 unacknowledged messages. That's fast for cheap handlers, but unfair under uneven load and costly to redeliver after a crash. Tune it to message cost.</Call>
      </Sec>

      {/* 14 */}
      <Sec id="managed-queues" n={14} eyebrow="Cloud queues" title="Managed queues" lead="No broker cluster to run, but you still need to know the delivery semantics and limits.">
        <Compare
          left={{ tone: "plain", title: "Standard queue", text: "High-throughput independent jobs.", items: ["Huge parallelism", "Simple worker scaling", "Expect duplicates and loose ordering"] }}
          right={{ tone: "plain", title: "FIFO with message groups", text: "When one key's events must stay in order.", items: ["Ordered per message group", "Different groups in parallel", "Lower throughput limits than standard"] }}
        />
        <Cards items={[
          ["Visibility timeout", "An in-flight message is hidden, and redelivered if not deleted in time."],
          ["Long polling", "Wait for messages instead of hammering empty receives."],
          ["Redrive / DLQ", "After N receives, failing messages move to a DLQ."],
          ["Delay", "Keep a message invisible until a future time."],
        ]} />
      </Sec>

      {/* 15 */}
      <Sec id="comparison" n={15} eyebrow="Technology selection" title="Kafka vs RabbitMQ vs managed queues" lead="Their messaging models are different. Choose the model, then the product.">
        <Table head={["", "Kafka-style log", "RabbitMQ-style broker", "Managed queue"]} rows={[
          ["Core model", "Distributed retained log", "Broker with exchanges and queues", "Hosted queue service"],
          ["Replay", "Native", "Not its model", "Service-dependent"],
          ["Routing", "Topics + partitions", "Rich exchange routing", "Queues, topics, filters"],
          ["Streaming throughput", "Excellent", "Good", "Service-dependent"],
          ["Task queue", "Possible", "Very natural", "Very natural"],
          ["Operations", "Significant (unless managed)", "Significant (unless managed)", "Mostly the provider's"],
          ["Typical use", "Events, CDC, analytics pipelines", "Jobs, routing, business messaging", "Cloud-native async jobs"],
        ]} />
        <H3>Quick picks for interview scenarios</H3>
        <Table head={["Scenario", "Start with"]} rows={[
          ["10M analytics events a day, with replay", "Kafka-style log"],
          ["Generate an invoice once, in the background", "Work queue / managed queue"],
          ["Order event → analytics + notification + warehouse", "Pub/sub or stream with separate groups"],
          ["payment.success → booking; payment.failed → recovery", "Topic or direct routing broker"],
          ["Release a booking hold after 5 minutes", "Delayed queue / scheduler + queue"],
          ["Same order's events must stay sequential", "Partition (or FIFO group) keyed by orderId"],
          ["Small team, durable jobs, minimal ops", "Managed queue"],
          ["Replayable CDC into a warehouse", "Kafka / Kinesis / Pulsar"],
        ]} />
      </Sec>

      {/* 16 */}
      <Sec id="outbox" n={16} eyebrow="Distributed transactions" title="The dual-write problem and the transactional outbox" lead="Updating your database and publishing an event as two separate steps will, eventually, do only one of them.">
        <Flow steps={[
          { t: "Order service", i: Desktop },
          { t: "Database", s: "COMMIT succeeds", i: Database, tone: "good", via: "1. save order" },
          { t: "Broker publish fails", s: "The order exists, the event doesn't", i: Warning, tone: "bad", via: "2. publish event" },
        ]} />
        <Code title="Write the event in the same transaction" lang="sql">{`
BEGIN;
INSERT INTO orders (id, user_id, amount, status) VALUES ('order_501', 'user_42', 1999, 'CREATED');
INSERT INTO outbox (event_id, aggregate_id, event_type, payload)
VALUES ('evt_123', 'order_501', 'ORDER_CREATED', '{"orderId":"order_501"}');
COMMIT;`}</Code>
        <Flow steps={[
          { t: "Application DB", s: "Order + outbox row committed together", i: Database, tone: "hot" },
          { t: "Message broker", s: "ORDER_CREATED", i: Broadcast, via: "outbox poller or CDC (Debezium)" },
        ]} />
        <Call tone="ok" title="Why it works">The business change and the intent to publish commit atomically. The publisher can retry safely, and the eventId keeps downstream consumers idempotent if it publishes twice.</Call>
      </Sec>

      {/* 17 */}
      <Sec id="code-examples" n={17} eyebrow="Implementation" title="Code examples" lead="In interviews you explain the design rather than write framework code, but these make the lifecycle concrete.">
        <Code title="BookingEventPublisher.java (Spring Kafka)" lang="java">{`
@Service
@RequiredArgsConstructor
public class BookingEventPublisher {
  private final KafkaTemplate<String, BookingEvent> kafka;

  public CompletableFuture<SendResult<String, BookingEvent>> publish(BookingEvent event) {
    // bookingId as the key: all events for one booking land on one partition, in order
    return kafka.send("booking.events", event.getBookingId(), event);
  }
}`}</Code>
        <Code title="BookingNotificationConsumer.java (idempotent)" lang="java">{`
@Service
@RequiredArgsConstructor
public class BookingNotificationConsumer {
  private final ProcessedEventRepository processed;
  private final NotificationService notifications;

  @KafkaListener(topics = "booking.events", groupId = "notification-group")
  @Transactional
  public void consume(BookingEvent event) {
    if (processed.existsById(event.getEventId())) return;   // duplicate → no-op
    notifications.createNotificationRecord(event);
    processed.save(new ProcessedEvent(event.getEventId()));
  }
}`}</Code>
        <Call tone="warn" title="External side effects need their own idempotency">Your transaction can atomically store the processed marker and local state, but it can't include an email or payment provider. Use the provider's idempotency key, or write a job/outbox record and make the external call retry-safe.</Call>
        <Code title="RetryPolicy.java (classify before retrying)" lang="java">{`
public RetryDecision classify(Throwable error, int attempt) {
  if (error instanceof ValidationException) return RetryDecision.DLQ;   // permanent
  if (attempt >= 5) return RetryDecision.DLQ;                            // exhausted
  if (error instanceof TimeoutException || error instanceof TemporaryProviderException) {
    return RetryDecision.RETRY_WITH_BACKOFF;                             // transient
  }
  return RetryDecision.DLQ;
}`}</Code>
      </Sec>

      {/* 18 */}
      <Sec id="bookmyshow" n={18} eyebrow="Case study" title="Ticket booking: where queues help and where they don't" lead="A booking system mixes synchronous concurrency control with asynchronous events. The real skill is drawing the boundary.">
        <Call tone="warn" title="A queue is not the seat lock">The user must know immediately whether they got seat A10. Use an atomic lock or conditional update for that decision. Queues handle what happens around it.</Call>
        <H3>The critical seat-hold path stays synchronous</H3>
        <Flow steps={[
          { t: "User A", s: "Selects A10 + A11", i: Users },
          { t: "Seat-lock service", s: "Atomic conditional acquire", i: Lock, tone: "hot", via: "POST /seat-holds" },
          { t: "Seat / booking store", s: "AVAILABLE → HELD, expiresAt = T + 5 min", i: Database, via: "authoritative write" },
          { t: "Hold created", s: "bookingId + expiry", i: CheckCircle, tone: "good", via: "immediate response" },
        ]} />
        <Code title="Atomic seat hold" lang="sql">{`
UPDATE seats
SET    status = 'HELD', held_by = :bookingId, expires_at = :expiresAt, version = version + 1
WHERE  show_id = :showId AND seat_id = :seatId AND status = 'AVAILABLE';
-- 1 row → you have it; 0 rows → someone else does`}</Code>
        <H3>Expiry, and its race with payment</H3>
        <Flow steps={[
          { row: [{ t: "Payment callback", s: "PAYMENT_SUCCEEDED", i: Desktop, tone: "good" }, { t: "Expiry event", s: "HOLD_EXPIRED", i: Alarm, tone: "bad" }] },
          { t: "Booking state machine", s: "Authoritative status + version decides", i: Database, tone: "hot", via: "may arrive together" },
          { row: [{ t: "CONFIRMED", s: "Expiry becomes a no-op", i: CheckCircle, tone: "good" }, { t: "EXPIRED", s: "Late payment → reconciliation", i: Timer, tone: "bad" }] },
        ]} />
        <H3>Confirm + outbox, then fan out</H3>
        <Code title="Booking confirmation transaction" lang="sql">{`
BEGIN;
UPDATE bookings SET status = 'CONFIRMED', payment_id = :paymentId
WHERE  booking_id = :bookingId AND status = 'PENDING';
UPDATE seats SET status = 'BOOKED' WHERE held_by = :bookingId AND status = 'HELD';
INSERT INTO outbox (event_id, aggregate_id, event_type, payload)
VALUES (:eventId, :bookingId, 'BOOKING_CONFIRMED', :payload);
COMMIT;`}</Code>
        <Flow steps={[
          { t: "Outbox / CDC", s: "BOOKING_CONFIRMED", i: Database },
          { t: "booking.events", s: "Retained topic", i: Broadcast, tone: "hot" },
          { row: [{ t: "Notification", s: "email / SMS / push", i: Bell }, { t: "Ticket worker", s: "QR / PDF", i: Ticket }, { t: "Analytics", s: "conversion", i: ChartLine }, { t: "Warehouse", s: "pipeline", i: Database }], via: "independent groups" },
        ]} />
        <Call tone="ok" title="Why this boundary works">Seat ownership and confirmation stay on the synchronous, correct path. Slow or flaky side effects go behind durable queues, so an email outage can't fail a booking and slow analytics can't block the user.</Call>
        <Table head={["Operation", "Sync or async", "Why", "Pattern"]} rows={[
          ["Search shows", "Sync", "User needs results now", "None"],
          ["Acquire seat lock", "Sync", "Immediate correctness decision", "None for the lock itself"],
          ["Create payment intent", "Usually sync", "User enters payment now", "Events may follow"],
          ["Payment callback", "Durable + idempotent", "Must survive retries and duplicates", "Event / queue"],
          ["Hold expiry", "Async, delayed", "Future action at T + N", "Delayed queue"],
          ["Ticket generation", "Async", "Can finish after confirmation", "Work queue"],
          ["Email / SMS", "Async", "Provider slowness mustn't fail booking", "Work queue + retry + DLQ"],
          ["Analytics", "Async", "Eventually consistent", "Pub/sub / stream"],
        ]} />
        <H3>Failure scenarios to explain</H3>
        <Steps items={[
          ["Payment callback delivered twice", "Provider idempotency key + unique payment transaction + idempotent state transition."],
          ["Payment arrives after the hold expired", "Reconciliation; never book a seat someone else may now hold."],
          ["Expiry event delivered twice", "Conditional release on state and version; the second is a no-op."],
          ["Email provider down", "Booking stays confirmed; notifications retry and DLQ if exhausted."],
          ["Broker down right after the commit", "The outbox keeps the event until the publisher can deliver it."],
          ["Consumer commits, then crashes before ACK", "Redelivered; eventId keeps it idempotent."],
          ["Blockbuster traffic spike", "Queue non-critical work, autoscale consumers, rate-limit, watch oldest-message age."],
          ["One show creates a hot partition", "Key by bookingId (not showId) unless per-show ordering is truly needed."],
        ]} />
      </Sec>

      {/* 19 */}
      <Sec id="failures" n={19} eyebrow="Production engineering" title="Failure scenarios and metrics" lead="Queues move complexity rather than remove it. Design for crashes, duplicates, backlog and poison messages.">
        <Table head={["Failure", "Response"]} rows={[
          ["Consumer crashes", "Never ACK unfinished work; the message is redelivered."],
          ["Duplicate message", "Idempotency keys, unique constraints, processed-event tracking."],
          ["Poison message", "Bounded retries, then DLQ with metadata and an alert."],
          ["Consumer too slow", "Watch lag and age, scale workers, check downstream bottlenecks."],
          ["Broker node fails", "Replication, durable storage, acks=all for important topics."],
          ["Producer retries after a timeout", "Stable event IDs and idempotent producers prevent duplicates."],
          ["DB commit succeeds, publish fails", "Transactional outbox."],
          ["Retry storm", "Backoff, jitter and bounded retries."],
          ["Backlog grows forever", "Autoscale, throttle producers, prioritise, alert on sustained lag."],
          ["Schema change", "Versioned contracts; consumers tolerate compatible changes."],
        ]} />
        <H3>Metrics worth a dashboard</H3>
        <Chips label="Queue metrics" items={["Queue depth", "Consumer lag", "Oldest message age", "Messages / sec in and out", "Consumer throughput", "Processing latency", "Retry rate", "DLQ size", "ACK failures", "Rebalances", "Broker disk & CPU", "Partition skew"]} />
        <Call tone="warn" title="Depth alone isn't enough">A million tiny messages may be healthier than 100 expensive jobs stuck for hours. Watch age, throughput and processing latency together.</Call>
      </Sec>
    </ReaderPage>
  );
}

