// // import React, { useState } from "react";

// // const SystemDesignHLD = () => {
// //   // ============================================================
// //   // CONFIGURATION
// //   // ============================================================

// //   const mrp = 999;
// //   const currentPrice = 299;

// //   const PAYMENT_URL =
// //     "https://your-payment-url.com/system-design-hld";

// //   const discount = Math.round(((mrp - currentPrice) / mrp) * 100);

// //   // ============================================================
// //   // PAYMENT
// //   // ============================================================

// //   const handleBuyNow = () => {
// //     window.location.href = PAYMENT_URL;
// //   };

// //   // ============================================================
// //   // FAQ
// //   // ============================================================

// //   const [openFaq, setOpenFaq] = useState(null);

// //   const toggleFaq = (index) => {
// //     setOpenFaq(openFaq === index ? null : index);
// //   };

// //   // ============================================================
// //   // TOPICS
// //   // ============================================================

// //   const topics = [
// //     {
// //       number: "01",
// //       title: "HLD Fundamentals",
// //       description:
// //         "Learn what system design actually means and how to approach large-scale architecture problems.",
// //     },
// //     {
// //       number: "02",
// //       title: "Functional Requirements",
// //       description:
// //         "Convert a problem statement into clear features, user flows and system responsibilities.",
// //     },
// //     {
// //       number: "03",
// //       title: "Non-Functional Requirements",
// //       description:
// //         "Understand scalability, availability, latency, reliability, security and performance requirements.",
// //     },
// //     {
// //       number: "04",
// //       title: "Capacity Estimation",
// //       description:
// //         "Estimate users, QPS, peak traffic, storage, bandwidth and infrastructure requirements.",
// //     },
// //     {
// //       number: "05",
// //       title: "API Design",
// //       description:
// //         "Design clean APIs and understand how different services communicate with each other.",
// //     },
// //     {
// //       number: "06",
// //       title: "Database Design",
// //       description:
// //         "Understand data modeling, indexes, relationships and choosing the right database.",
// //     },
// //     {
// //       number: "07",
// //       title: "SQL vs NoSQL",
// //       description:
// //         "Learn when relational and non-relational databases are appropriate.",
// //     },
// //     {
// //       number: "08",
// //       title: "Database Replication",
// //       description:
// //         "Understand replicas, read scaling, availability and redundancy.",
// //     },
// //     {
// //       number: "09",
// //       title: "Database Sharding",
// //       description:
// //         "Learn how large datasets can be partitioned across multiple database nodes.",
// //     },
// //     {
// //       number: "10",
// //       title: "Redis & Caching",
// //       description:
// //         "Understand caching strategies, TTL, cache invalidation and Redis use cases.",
// //     },
// //     {
// //       number: "11",
// //       title: "Load Balancing",
// //       description:
// //         "Learn how millions of requests can be distributed across multiple servers.",
// //     },
// //     {
// //       number: "12",
// //       title: "CDN",
// //       description:
// //         "Understand how content can be delivered closer to users to reduce latency.",
// //     },
// //     {
// //       number: "13",
// //       title: "Message Queues",
// //       description:
// //         "Learn asynchronous processing and why queues are important for scalable systems.",
// //     },
// //     {
// //       number: "14",
// //       title: "Kafka",
// //       description:
// //         "Understand event streaming, producers, consumers, partitions and scalable processing.",
// //     },
// //     {
// //       number: "15",
// //       title: "Rate Limiting",
// //       description:
// //         "Protect APIs from excessive traffic and control request rates.",
// //     },
// //     {
// //       number: "16",
// //       title: "CAP Theorem",
// //       description:
// //         "Understand consistency, availability and partition tolerance in distributed systems.",
// //     },
// //     {
// //       number: "17",
// //       title: "Distributed Systems",
// //       description:
// //         "Learn how multiple machines and services work together as one system.",
// //     },
// //     {
// //       number: "18",
// //       title: "Microservices",
// //       description:
// //         "Understand service boundaries, communication, scaling and failure isolation.",
// //     },
// //     {
// //       number: "19",
// //       title: "API Gateway",
// //       description:
// //         "Learn routing, authentication, aggregation, rate limiting and request management.",
// //     },
// //     {
// //       number: "20",
// //       title: "Service Discovery",
// //       description:
// //         "Understand how distributed services discover and communicate with each other.",
// //     },
// //     {
// //       number: "21",
// //       title: "Fault Tolerance",
// //       description:
// //         "Design systems that continue operating even when individual components fail.",
// //     },
// //     {
// //       number: "22",
// //       title: "Retries & Circuit Breakers",
// //       description:
// //         "Prevent temporary failures from becoming large cascading system failures.",
// //     },
// //     {
// //       number: "23",
// //       title: "Observability",
// //       description:
// //         "Understand logs, metrics, monitoring and distributed tracing.",
// //     },
// //     {
// //       number: "24",
// //       title: "Security",
// //       description:
// //         "Understand authentication, authorization, API security and system protection.",
// //     },
// //   ];

// //   // ============================================================
// //   // WHO SHOULD TAKE THIS BOOK
// //   // ============================================================

// //   const audience = [
// //     {
// //       title: "Complete Beginner",
// //       description:
// //         "You are starting system design and want a structured path from the fundamentals instead of jumping directly into complex architecture diagrams.",
// //     },
// //     {
// //       title: "SDE-1 Engineers",
// //       description:
// //         "Build the foundation needed to understand how backend applications evolve from simple services into scalable distributed systems.",
// //     },
// //     {
// //       title: "SDE-2 Engineers",
// //       description:
// //         "Strengthen your ability to reason about scalability, reliability, fault tolerance, distributed components and architectural trade-offs.",
// //     },
// //     {
// //       title: "Backend Engineers",
// //       description:
// //         "Go beyond writing APIs and databases and understand how complete backend systems handle very large traffic.",
// //     },
// //     {
// //       title: "AI / ML Engineers",
// //       description:
// //         "Understand how AI services, inference APIs, data pipelines and supporting services can be designed for high traffic and reliability.",
// //     },
// //     {
// //       title: "Software Engineers",
// //       description:
// //         "Learn how databases, caches, queues, load balancers and services fit together in production architectures.",
// //     },
// //     {
// //       title: "System Design Interview Candidates",
// //       description:
// //         "Follow a structured approach from requirements to capacity estimation, architecture, scaling and trade-offs.",
// //     },
// //     {
// //       title: "Developers Preparing for Growth",
// //       description:
// //         "Learn the concepts that become increasingly important as systems grow from thousands to millions or billions of users.",
// //     },
// //   ];

// //   // ============================================================
// //   // DESIGN EXAMPLES
// //   // ============================================================

// //   const examples = [
// //     {
// //       number: "01",
// //       title: "Design Uber",
// //       description:
// //         "Understand users, drivers, location tracking, matching, trip management and real-time communication.",
// //       tags: ["Location", "Matching", "Real-time"],
// //     },
// //     {
// //       number: "02",
// //       title: "Design a URL Shortener",
// //       description:
// //         "Design unique URL generation, redirects, storage, caching and high-volume reads.",
// //       tags: ["Redis", "Database", "Hashing"],
// //     },
// //     {
// //       number: "03",
// //       title: "Design Instagram",
// //       description:
// //         "Explore media upload, feed generation, followers, storage, caching and content delivery.",
// //       tags: ["Feed", "CDN", "Storage"],
// //     },
// //     {
// //       number: "04",
// //       title: "Design YouTube",
// //       description:
// //         "Understand video upload, processing, transcoding, storage and large-scale video delivery.",
// //       tags: ["Video", "CDN", "Storage"],
// //     },
// //     {
// //       number: "05",
// //       title: "Design Netflix",
// //       description:
// //         "Explore content delivery, caching, storage, streaming and large-scale user traffic.",
// //       tags: ["Streaming", "CDN", "Caching"],
// //     },
// //     {
// //       number: "06",
// //       title: "Design WhatsApp",
// //       description:
// //         "Understand messaging, conversations, message delivery, presence and real-time communication.",
// //       tags: ["Messaging", "WebSocket", "Events"],
// //     },
// //     {
// //       number: "07",
// //       title: "Design Twitter / X",
// //       description:
// //         "Understand timeline generation, followers, feed architecture and fan-out strategies.",
// //       tags: ["Feed", "Fan-out", "Caching"],
// //     },
// //     {
// //       number: "08",
// //       title: "Design Dropbox",
// //       description:
// //         "Explore distributed file storage, metadata, synchronization and file access.",
// //       tags: ["Storage", "Sync", "Metadata"],
// //     },
// //     {
// //       number: "09",
// //       title: "Design Google Drive",
// //       description:
// //         "Understand file storage, metadata, sharing, synchronization and scalable access.",
// //       tags: ["Storage", "Sharing", "Database"],
// //     },
// //     {
// //       number: "10",
// //       title: "Design Ticket Booking",
// //       description:
// //         "Handle inventory, concurrent bookings, locking, payments and availability.",
// //       tags: ["Concurrency", "Locking", "Payments"],
// //     },
// //     {
// //       number: "11",
// //       title: "Design Food Delivery",
// //       description:
// //         "Design restaurants, orders, delivery partners, tracking and notifications.",
// //       tags: ["Orders", "Location", "Events"],
// //     },
// //     {
// //       number: "12",
// //       title: "Design Notification System",
// //       description:
// //         "Build scalable email, SMS and push notification delivery using asynchronous processing.",
// //       tags: ["Kafka", "Queue", "Workers"],
// //     },
// //     {
// //       number: "13",
// //       title: "Design a Rate Limiter",
// //       description:
// //         "Protect distributed APIs using scalable rate-limiting strategies and shared state.",
// //       tags: ["Redis", "API", "Distributed"],
// //     },
// //     {
// //       number: "14",
// //       title: "Design News Feed",
// //       description:
// //         "Understand feed generation, ranking, fan-out, caching and high-volume reads.",
// //       tags: ["Feed", "Ranking", "Cache"],
// //     },
// //     {
// //       number: "15",
// //       title: "Design Distributed Job Scheduler",
// //       description:
// //         "Explore job queues, workers, scheduling, retries and failure handling.",
// //       tags: ["Workers", "Queue", "Retries"],
// //     },
// //   ];

// //   // ============================================================
// //   // SYSTEM DESIGN PROCESS
// //   // ============================================================

// //   const process = [
// //     {
// //       number: "01",
// //       title: "Understand the Problem",
// //       description:
// //         "Clarify exactly what the system should do and identify the most important user flows.",
// //     },
// //     {
// //       number: "02",
// //       title: "Define Requirements",
// //       description:
// //         "Separate functional requirements from scalability, availability, latency and reliability requirements.",
// //     },
// //     {
// //       number: "03",
// //       title: "Estimate Scale",
// //       description:
// //         "Estimate users, requests per second, storage, bandwidth and peak traffic.",
// //     },
// //     {
// //       number: "04",
// //       title: "Design APIs",
// //       description:
// //         "Define the interfaces through which clients and services communicate.",
// //     },
// //     {
// //       number: "05",
// //       title: "Choose Data Storage",
// //       description:
// //         "Select databases and data models based on access patterns and scale.",
// //     },
// //     {
// //       number: "06",
// //       title: "Build the Architecture",
// //       description:
// //         "Connect services, databases, caches, queues, load balancers and other components.",
// //     },
// //     {
// //       number: "07",
// //       title: "Scale the System",
// //       description:
// //         "Introduce horizontal scaling, caching, sharding, replication and asynchronous processing.",
// //     },
// //     {
// //       number: "08",
// //       title: "Handle Failures",
// //       description:
// //         "Think about retries, timeouts, circuit breakers, redundancy and graceful degradation.",
// //     },
// //     {
// //       number: "09",
// //       title: "Add Observability",
// //       description:
// //         "Determine how you will monitor latency, errors, traffic, infrastructure and failures.",
// //     },
// //     {
// //       number: "10",
// //       title: "Discuss Trade-offs",
// //       description:
// //         "Explain why you selected a particular architecture and what trade-offs it introduces.",
// //     },
// //   ];

// //   // ============================================================
// //   // FAQ
// //   // ============================================================

// //   const faqs = [
// //     {
// //       question: "Is this book suitable for a complete beginner?",
// //       answer:
// //         "Yes. The material is structured to start with HLD fundamentals and progressively move toward databases, caching, distributed systems, scalability, fault tolerance and complete system-design case studies.",
// //     },
// //     {
// //       question: "Is this book useful for SDE-1 interviews?",
// //       answer:
// //         "Yes. It provides the foundational concepts needed to start understanding HLD problems and gives a structured framework for approaching system-design discussions.",
// //     },
// //     {
// //       question: "Is this useful for SDE-2 engineers?",
// //       answer:
// //         "Yes. SDE-2 engineers can use it to strengthen concepts such as scalability, distributed systems, replication, sharding, fault tolerance, reliability and architectural trade-offs.",
// //     },
// //     {
// //       question: "Why would an AI engineer need system design?",
// //       answer:
// //         "AI applications also depend on APIs, databases, caching, queues, storage, distributed services, observability and scalable infrastructure. Understanding HLD helps AI engineers reason about how AI-powered systems can operate reliably at larger scale.",
// //     },
// //     {
// //       question: "Does the book teach Redis?",
// //       answer:
// //         "The book explains Redis and caching from a system-design perspective, including where caching fits into an architecture and the problems it can help solve.",
// //     },
// //     {
// //       question: "Does it cover Kafka and message queues?",
// //       answer:
// //         "Yes. Message queues and Kafka are included as important building blocks for asynchronous processing and event-driven architectures.",
// //     },
// //     {
// //       question: "Does it cover databases?",
// //       answer:
// //         "Yes. Database design, SQL vs NoSQL, replication, sharding, indexing and data-storage decisions are covered.",
// //     },
// //     {
// //       question: "Can this help with system design interviews?",
// //       answer:
// //         "The book is designed around a structured HLD approach covering requirements, scale estimation, APIs, architecture, databases, caching, scalability, reliability and trade-offs.",
// //     },
// //     {
// //       question: "Is this a physical book?",
// //       answer:
// //         "No. This is a digital PDF ebook.",
// //     },
// //     {
// //       question: "Is the ebook refundable?",
// //       answer:
// //         "No. This is a digital product and purchases are non-refundable after successful payment.",
// //     },
// //     {
// //       question: "How can I contact support?",
// //       answer:
// //         "For questions regarding the ebook or your purchase, contact supporttargettrek@gmail.com.",
// //     },
// //   ];

// //   return (
// //     <div className="min-h-screen bg-[#f8fbff] text-slate-900">

// //       {/* ============================================================
// //           HERO
// //       ============================================================ */}

// //       <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-[#eef7ff] via-white to-[#f5faff]">
// //         <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-100/50 blur-3xl" />

// //         <div className="absolute -left-40 bottom-0 h-[350px] w-[350px] rounded-full bg-sky-100/50 blur-3xl" />

// //         <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">

// //           <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">

// //             {/* HERO LEFT */}

// //             <div>

// //               <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
// //                 <span className="h-2 w-2 rounded-full bg-blue-600" />
// //                 {discount}% OFF • Limited Time Deal
// //               </div>

// //               <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
// //                 Mastering System Design
// //                 <span className="block text-blue-600">
// //                   High-Level Design
// //                 </span>
// //               </h1>

// //               <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
// //                 Learn how modern systems are designed to handle growing
// //                 traffic, millions of users, distributed workloads, failures,
// //                 high availability and massive amounts of data.
// //               </p>

// //               <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
// //                 From your first HLD concept to interview-ready system design,
// //                 this book takes you through the architecture building blocks
// //                 used to design scalable and fault-tolerant systems.
// //               </p>

// //               <div className="mt-8 flex flex-wrap gap-3">
// //                 {[
// //                   "Beginner Friendly",
// //                   "Interview Ready",
// //                   "24+ Core Topics",
// //                   "15+ Design Examples",
// //                   "Digital PDF",
// //                 ].map((item) => (
// //                   <span
// //                     key={item}
// //                     className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"
// //                   >
// //                     ✓ {item}
// //                   </span>
// //                 ))}
// //               </div>

// //               <div className="mt-9 flex flex-col gap-4 sm:flex-row">

// //                 <button
// //                   onClick={handleBuyNow}
// //                   className="rounded-2xl bg-blue-600 px-8 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
// //                 >
// //                   Instant Buy Now →
// //                 </button>

// //                 <a
// //                   href="#why-hld"
// //                   className="rounded-2xl border border-slate-300 bg-white px-8 py-4 text-center font-bold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50"
// //                 >
// //                   Why HLD?
// //                 </a>

// //               </div>

// //             </div>

// //             {/* PRICE CARD */}

// //             <div className="mx-auto w-full max-w-md">

// //               <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-100/50 sm:p-8">

// //                 <div className="rounded-2xl bg-[#eff7ff] p-6">

// //                   <div className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
// //                     {discount}% OFF
// //                   </div>

// //                   <p className="mt-5 text-xs font-black uppercase tracking-widest text-blue-600">
// //                     Digital Ebook
// //                   </p>

// //                   <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950">
// //                     Mastering System Design
// //                   </h2>

// //                   <p className="mt-1 font-bold text-slate-500">
// //                     High-Level Design
// //                   </p>

// //                   <div className="mt-7 flex items-end gap-3">

// //                     <span className="text-4xl font-black text-slate-950">
// //                       ₹{currentPrice}
// //                     </span>

// //                     <span className="pb-1 text-lg text-slate-400 line-through">
// //                       ₹{mrp}
// //                     </span>

// //                   </div>

// //                   <p className="mt-2 text-sm font-semibold text-blue-600">
// //                     Limited-time offer
// //                   </p>

// //                 </div>

// //                 <div className="mt-6 space-y-3">

// //                   {[
// //                     "Complete System Design PDF",
// //                     "Beginner → Interview Ready",
// //                     "24+ Important HLD Topics",
// //                     "15+ Real-World Design Examples",
// //                     "Scalability & Distributed Systems",
// //                     "Fault Tolerance & Reliability",
// //                   ].map((item) => (
// //                     <div
// //                       key={item}
// //                       className="flex items-center gap-3 text-sm font-semibold text-slate-700"
// //                     >
// //                       <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
// //                         ✓
// //                       </span>

// //                       {item}
// //                     </div>
// //                   ))}

// //                 </div>

// //                 <button
// //                   onClick={handleBuyNow}
// //                   className="mt-7 w-full rounded-2xl bg-blue-600 py-4 font-black text-white transition hover:bg-blue-700"
// //                 >
// //                   Get the Ebook for ₹{currentPrice}
// //                 </button>

// //                 {/* SMALL SUPPORT / REFUND */}

// //                 <div className="mt-4 text-center text-[11px] leading-5 text-slate-400">
// //                   <p>
// //                     Digital product • Non-refundable after successful purchase
// //                   </p>

// //                   <p>
// //                     Need help?{" "}
// //                     <a
// //                       href="mailto:supporttargettrek@gmail.com"
// //                       className="font-semibold text-slate-500 hover:text-blue-600"
// //                     >
// //                       supporttargettrek@gmail.com
// //                     </a>
// //                   </p>
// //                 </div>

// //               </div>

// //             </div>

// //           </div>

// //         </div>
// //       </section>

// //       {/* ============================================================
// //           QUICK VALUE STRIP
// //       ============================================================ */}

// //       <section className="border-b border-slate-200 bg-white">

// //         <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">

// //           {[
// //             ["24+", "Core HLD Topics"],
// //             ["15+", "Design Examples"],
// //             ["Beginner", "Starting Point"],
// //             ["Interview", "Focused Learning"],
// //           ].map(([number, label]) => (

// //             <div
// //               key={label}
// //               className="border-r border-slate-100 px-4 py-7 text-center last:border-0"
// //             >

// //               <div className="text-2xl font-black text-blue-600">
// //                 {number}
// //               </div>

// //               <div className="mt-1 text-sm font-semibold text-slate-500">
// //                 {label}
// //               </div>

// //             </div>

// //           ))}

// //         </div>

// //       </section>

// //       {/* ============================================================
// //           WHY HLD IS IMPORTANT
// //       ============================================================ */}

// //       <section
// //         id="why-hld"
// //         className="mx-auto max-w-7xl px-5 py-20 lg:px-8"
// //       >

// //         <div className="grid gap-14 lg:grid-cols-2 lg:items-center">

// //           <div>

// //             <p className="text-sm font-black uppercase tracking-widest text-blue-600">
// //               Why High-Level Design?
// //             </p>

// //             <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
// //               Writing code is only one part of building a system.
// //             </h2>

// //             <p className="mt-6 text-lg leading-8 text-slate-600">
// //               A small application can work perfectly with one server and one
// //               database. But what happens when the number of users grows from
// //               thousands to millions?
// //             </p>

// //             <p className="mt-5 leading-8 text-slate-500">
// //               Suddenly you need to think about traffic spikes, database load,
// //               caching, queues, replication, load balancing, service failures,
// //               network latency, data consistency and system recovery.
// //             </p>

// //             <p className="mt-5 leading-8 text-slate-500">
// //               High-Level Design helps you understand how these pieces fit
// //               together before you start implementing the system.
// //             </p>

// //           </div>

// //           <div className="grid gap-4 sm:grid-cols-2">

// //             {[
// //               {
// //                 title: "Scalability",
// //                 text: "How do we handle increasing users and traffic without the system collapsing?",
// //               },
// //               {
// //                 title: "Availability",
// //                 text: "How can the system continue serving users even when individual components fail?",
// //               },
// //               {
// //                 title: "Performance",
// //                 text: "How do we keep response times low as traffic and data increase?",
// //               },
// //               {
// //                 title: "Fault Tolerance",
// //                 text: "What happens when a server, database, network or service fails?",
// //               },
// //               {
// //                 title: "Distributed Systems",
// //                 text: "How can multiple machines and services work together reliably?",
// //               },
// //               {
// //                 title: "Reliability",
// //                 text: "How do we build systems that users can depend on consistently?",
// //               },
// //             ].map((item) => (

// //               <div
// //                 key={item.title}
// //                 className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
// //               >

// //                 <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-600">
// //                   ✓
// //                 </div>

// //                 <h3 className="font-black text-slate-950">
// //                   {item.title}
// //                 </h3>

// //                 <p className="mt-2 text-sm leading-6 text-slate-500">
// //                   {item.text}
// //                 </p>

// //               </div>

// //             ))}

// //           </div>

// //         </div>

// //       </section>

// //       {/* ============================================================
// //           MILLION / BILLION USERS
// //       ============================================================ */}

// //       <section className="bg-[#edf7ff] py-20">

// //         <div className="mx-auto max-w-7xl px-5 lg:px-8">

// //           <div className="mx-auto max-w-3xl text-center">

// //             <p className="text-sm font-black uppercase tracking-widest text-blue-600">
// //               Think at Scale
// //             </p>

// //             <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
// //               What changes when your system grows?
// //             </h2>

// //             <p className="mt-5 leading-7 text-slate-600">
// //               The architecture that works for 10,000 users may not work for
// //               10 million users. At larger scale, every component introduces
// //               new engineering challenges.
// //             </p>

// //           </div>

// //           <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

// //             {[
// //               {
// //                 number: "10K",
// //                 title: "Users",
// //                 text: "A simple architecture may be enough for early products.",
// //               },
// //               {
// //                 number: "1M",
// //                 title: "Users",
// //                 text: "Caching, load balancing and database optimization become increasingly important.",
// //               },
// //               {
// //                 number: "100M",
// //                 title: "Users",
// //                 text: "Distributed architecture, partitioning, replication and asynchronous processing become critical design considerations.",
// //               },
// //               {
// //                 number: "1B+",
// //                 title: "Users",
// //                 text: "Systems require careful capacity planning, distributed infrastructure, fault isolation and multiple layers of scalability.",
// //               },
// //             ].map((item) => (

// //               <div
// //                 key={item.number}
// //                 className="rounded-2xl border border-blue-100 bg-white p-6"
// //               >

// //                 <div className="text-3xl font-black text-blue-600">
// //                   {item.number}
// //                 </div>

// //                 <div className="mt-1 font-black text-slate-950">
// //                   {item.title}
// //                 </div>

// //                 <p className="mt-3 text-sm leading-6 text-slate-500">
// //                   {item.text}
// //                 </p>

// //               </div>

// //             ))}

// //           </div>

// //         </div>

// //       </section>

// //       {/* ============================================================
// //           WHO SHOULD TAKE THIS BOOK
// //       ============================================================ */}

// //       <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">

// //         <div className="mx-auto max-w-3xl text-center">

// //           <p className="text-sm font-black uppercase tracking-widest text-blue-600">
// //             Who Should Take This Book?
// //           </p>

// //           <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
// //             From beginner to interview-ready
// //           </h2>

// //           <p className="mt-5 leading-7 text-slate-600">
// //             Whether you are learning system design for the first time or
// //             preparing for your next software engineering interview, the book
// //             gives you a structured path through the major HLD concepts.
// //           </p>

// //         </div>

// //         <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

// //           {audience.map((item, index) => (

// //             <div
// //               key={item.title}
// //               className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
// //             >

// //               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-600">
// //                 {String(index + 1).padStart(2, "0")}
// //               </div>

// //               <h3 className="mt-5 font-black text-slate-950">
// //                 {item.title}
// //               </h3>

// //               <p className="mt-3 text-sm leading-6 text-slate-500">
// //                 {item.description}
// //               </p>

// //             </div>

// //           ))}

// //         </div>

// //       </section>

// //       {/* ============================================================
// //           BEGINNER TO INTERVIEW READY
// //       ============================================================ */}

// //       <section className="bg-slate-950 py-20 text-white">

// //         <div className="mx-auto max-w-7xl px-5 lg:px-8">

// //           <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

// //             <div>

// //               <p className="text-sm font-black uppercase tracking-widest text-blue-400">
// //                 Beginner → Interview Ready
// //               </p>

// //               <h2 className="mt-3 text-3xl font-black sm:text-4xl">
// //                 You don't need to know everything before you start.
// //               </h2>

// //               <p className="mt-5 leading-8 text-slate-400">
// //                 Start with the fundamentals. Understand requirements and
// //                 capacity estimation. Then learn databases, caching, queues,
// //                 load balancing and distributed systems.
// //               </p>

// //               <p className="mt-5 leading-8 text-slate-400">
// //                 Finally, combine these concepts to reason about complete
// //                 systems and explain architectural trade-offs in an interview.
// //               </p>

// //             </div>

// //             <div className="space-y-3">

// //               {[
// //                 ["01", "Understand HLD Fundamentals"],
// //                 ["02", "Learn Core Architecture Components"],
// //                 ["03", "Understand Scalability"],
// //                 ["04", "Learn Distributed Systems"],
// //                 ["05", "Handle Failures & Reliability"],
// //                 ["06", "Study Real-World Systems"],
// //                 ["07", "Practice System Design"],
// //                 ["08", "Become Interview Ready"],
// //               ].map(([number, title]) => (

// //                 <div
// //                   key={number}
// //                   className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4"
// //                 >

// //                   <span className="text-sm font-black text-blue-400">
// //                     {number}
// //                   </span>

// //                   <span className="font-bold">
// //                     {title}
// //                   </span>

// //                 </div>

// //               ))}

// //             </div>

// //           </div>

// //         </div>

// //       </section>

// //       {/* ============================================================
// //           TOPICS
// //       ============================================================ */}

// //       <section className="bg-white py-20">

// //         <div className="mx-auto max-w-7xl px-5 lg:px-8">

// //           <div className="mx-auto max-w-3xl text-center">

// //             <p className="text-sm font-black uppercase tracking-widest text-blue-600">
// //               Inside The Book
// //             </p>

// //             <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
// //               The HLD topics you need to know
// //             </h2>

// //             <p className="mt-4 leading-7 text-slate-600">
// //               Learn the major building blocks used when designing scalable
// //               backend and distributed systems.
// //             </p>

// //           </div>

// //           <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

// //             {topics.map((topic) => (

// //               <div
// //                 key={topic.title}
// //                 className="rounded-2xl border border-slate-200 bg-[#f9fcff] p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg"
// //               >

// //                 <div className="text-xs font-black text-blue-600">
// //                   {topic.number}
// //                 </div>

// //                 <h3 className="mt-4 font-black text-slate-950">
// //                   {topic.title}
// //                 </h3>

// //                 <p className="mt-2 text-sm leading-6 text-slate-500">
// //                   {topic.description}
// //                 </p>

// //               </div>

// //             ))}

// //           </div>

// //         </div>

// //       </section>

// //       {/* ============================================================
// //           DESIGN EXAMPLES
// //       ============================================================ */}

// //       <section className="bg-[#f4f9fd] py-20">

// //         <div className="mx-auto max-w-7xl px-5 lg:px-8">

// //           <div className="max-w-3xl">

// //             <p className="text-sm font-black uppercase tracking-widest text-blue-600">
// //               Practice With Real-World Problems
// //             </p>

// //             <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
// //               15+ system design examples
// //             </h2>

// //             <p className="mt-4 leading-7 text-slate-600">
// //               Learn how the core concepts can be applied to familiar
// //               large-scale applications and common system-design problems.
// //             </p>

// //           </div>

// //           <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

// //             {examples.map((example) => (

// //               <div
// //                 key={example.number}
// //                 className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
// //               >

// //                 <div className="flex items-center justify-between">

// //                   <span className="text-xs font-black text-blue-600">
// //                     CASE STUDY {example.number}
// //                   </span>

// //                   <span className="text-slate-300">
// //                     ↗
// //                   </span>

// //                 </div>

// //                 <h3 className="mt-5 text-xl font-black text-slate-950">
// //                   {example.title}
// //                 </h3>

// //                 <p className="mt-3 text-sm leading-6 text-slate-500">
// //                   {example.description}
// //                 </p>

// //                 <div className="mt-5 flex flex-wrap gap-2">

// //                   {example.tags.map((tag) => (

// //                     <span
// //                       key={tag}
// //                       className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
// //                     >
// //                       {tag}
// //                     </span>

// //                   ))}

// //                 </div>

// //               </div>

// //             ))}

// //           </div>

// //           <p className="mt-7 text-center text-xs leading-5 text-slate-400">
// //             Named platforms are used as educational system-design case
// //             studies. This material does not claim to represent proprietary
// //             internal architectures of those companies.
// //           </p>

// //         </div>

// //       </section>

// //       {/* ============================================================
// //           SYSTEM DESIGN PROCESS
// //       ============================================================ */}

// //       <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">

// //         <div className="mx-auto max-w-3xl text-center">

// //           <p className="text-sm font-black uppercase tracking-widest text-blue-600">
// //             Learn The Process
// //           </p>

// //           <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
// //             How to approach an HLD interview question
// //           </h2>

// //           <p className="mt-4 leading-7 text-slate-600">
// //             Learn a structured process instead of randomly drawing boxes and
// //             choosing technologies.
// //           </p>

// //         </div>

// //         <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">

// //           {process.map((item) => (

// //             <div
// //               key={item.number}
// //               className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
// //             >

// //               <span className="text-sm font-black text-blue-600">
// //                 {item.number}
// //               </span>

// //               <h3 className="mt-4 font-black text-slate-950">
// //                 {item.title}
// //               </h3>

// //               <p className="mt-2 text-sm leading-6 text-slate-500">
// //                 {item.description}
// //               </p>

// //             </div>

// //           ))}

// //         </div>

// //       </section>

// //       {/* ============================================================
// //           TECHNOLOGIES
// //       ============================================================ */}

// //       <section className="bg-[#edf7ff] py-20">

// //         <div className="mx-auto max-w-6xl px-5 text-center lg:px-8">

// //           <p className="text-sm font-black uppercase tracking-widest text-blue-600">
// //             Architecture Building Blocks
// //           </p>

// //           <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
// //             Understand where the technologies fit
// //           </h2>

// //           <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
// //             System design isn't about memorizing technology names. It's about
// //             understanding what problem each component solves.
// //           </p>

// //           <div className="mt-10 flex flex-wrap justify-center gap-3">

// //             {[
// //               "Redis",
// //               "Kafka",
// //               "SQL",
// //               "NoSQL",
// //               "Load Balancer",
// //               "CDN",
// //               "API Gateway",
// //               "Microservices",
// //               "Message Queue",
// //               "Replication",
// //               "Sharding",
// //               "Caching",
// //               "Object Storage",
// //               "WebSockets",
// //               "Rate Limiter",
// //               "Service Discovery",
// //               "Circuit Breaker",
// //               "Monitoring",
// //               "Logging",
// //               "Distributed Tracing",
// //               "Authentication",
// //               "Authorization",
// //             ].map((technology) => (

// //               <span
// //                 key={technology}
// //                 className="rounded-xl border border-blue-100 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm"
// //               >
// //                 {technology}
// //               </span>

// //             ))}

// //           </div>

// //         </div>

// //       </section>

// //       {/* ============================================================
// //           FAQ
// //       ============================================================ */}

// //       <section className="mx-auto max-w-4xl px-5 py-20 lg:px-8">

// //         <div className="text-center">

// //           <p className="text-sm font-black uppercase tracking-widest text-blue-600">
// //             FAQ
// //           </p>

// //           <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
// //             Frequently asked questions
// //           </h2>

// //         </div>

// //         <div className="mt-10 space-y-3">

// //           {faqs.map((faq, index) => {

// //             const isOpen = openFaq === index;

// //             return (
// //               <div
// //                 key={faq.question}
// //                 className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
// //               >

// //                 <button
// //                   onClick={() => toggleFaq(index)}
// //                   className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left"
// //                 >

// //                   <span className="font-bold text-slate-900">
// //                     {faq.question}
// //                   </span>

// //                   <span
// //                     className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition ${
// //                       isOpen ? "rotate-45" : ""
// //                     }`}
// //                   >
// //                     +
// //                   </span>

// //                 </button>

// //                 {isOpen && (
// //                   <div className="border-t border-slate-100 px-5 pb-5 pt-4 text-sm leading-7 text-slate-500">
// //                     {faq.answer}
// //                   </div>
// //                 )}

// //               </div>
// //             );

// //           })}

// //         </div>

// //       </section>

// //       {/* ============================================================
// //           FINAL PURCHASE SECTION
// //       ============================================================ */}

// //       <section className="px-5 pb-20">

// //         <div className="mx-auto max-w-5xl rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 text-center sm:p-12">

// //           <div className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-black text-blue-700">
// //             {discount}% OFF • Limited Time Deal
// //           </div>

// //           <h2 className="mt-5 text-3xl font-black text-slate-950 sm:text-4xl">
// //             Start learning system design today.
// //           </h2>

// //           <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
// //             Build your HLD fundamentals, understand scalable architecture and
// //             learn how distributed systems handle growing traffic and failures.
// //           </p>

// //           <div className="mt-7 flex items-center justify-center gap-3">

// //             <span className="text-4xl font-black text-blue-600">
// //               ₹{currentPrice}
// //             </span>

// //             <span className="text-xl text-slate-400 line-through">
// //               ₹{mrp}
// //             </span>

// //           </div>

// //           <button
// //             onClick={handleBuyNow}
// //             className="mt-7 rounded-2xl bg-blue-600 px-10 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
// //           >
// //             Instant Buy Now →
// //           </button>

// //           {/* SMALL SUPPORT / REFUND */}

// //           <div className="mt-5 text-[11px] leading-5 text-slate-400">

// //             <p>
// //               This is a digital PDF product and is non-refundable after
// //               successful purchase.
// //             </p>

// //             <p>
// //               For any help, contact{" "}
// //               <a
// //                 href="mailto:supporttargettrek@gmail.com"
// //                 className="font-semibold text-slate-500 hover:text-blue-600"
// //               >
// //                 supporttargettrek@gmail.com
// //               </a>
// //             </p>

// //           </div>

// //         </div>

// //       </section>

// //       {/* ============================================================
// //           SMALL BOTTOM NOTICE
// //       ============================================================ */}

// //       <div className="border-t border-slate-200 bg-white px-5 py-7 text-center">

// //         <p className="text-xs leading-6 text-slate-400">
// //           Mastering System Design — High-Level Design
// //           <span className="mx-2">•</span>
// //           Digital PDF
// //           <span className="mx-2">•</span>
// //           Non-refundable digital product
// //         </p>

// //         <p className="mt-1 text-xs text-slate-400">
// //           Support:{" "}
// //           <a
// //             href="mailto:supporttargettrek@gmail.com"
// //             className="hover:text-blue-600"
// //           >
// //             supporttargettrek@gmail.com
// //           </a>
// //         </p>

// //       </div>

// //     </div>
// //   );
// // };

// // export default SystemDesignHLD;
// import React, { useEffect, useState } from "react";

// const SystemDesignHLD = () => {
//   // ============================================================
//   // DYNAMIC PRODUCT DATA
//   // ============================================================

//   // If you already export BASE_URL from a utility file in your project,
//   // replace this line with your existing import.
//   const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";

//   const [product, setProduct] = useState(null);
//   const [loadingProduct, setLoadingProduct] = useState(true);
//   const [productError, setProductError] = useState("");

//   useEffect(() => {
//     const controller = new AbortController();

//     const fetchProduct = async () => {
//       try {
//         setLoadingProduct(true);
//         setProductError("");

//         // Example:
//         // https://xyz.com/books/system-design/hld
//         // sends redirectUrl=/books/system-design/hld
//         const redirectUrl = window.location.pathname;

//         const response = await fetch(
//           `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(
//             redirectUrl
//           )}`,
//           {
//             method: "GET",
//             signal: controller.signal,
//           }
//         );

//         const result = await response.json().catch(() => null);

//         if (!response.ok || !result?.success || !result?.data) {
//           throw new Error(result?.error?.message || "Book not found.");
//         }

//         setProduct(result.data);
//       } catch (error) {
//         if (error?.name === "AbortError") return;

//         console.error("Failed to fetch HLD product:", error);
//         setProduct(null);
//         setProductError(error?.message || "Book not found.");
//       } finally {
//         if (!controller.signal.aborted) {
//           setLoadingProduct(false);
//         }
//       }
//     };

//     fetchProduct();

//     return () => controller.abort();
//   }, [BASE_URL]);

//   const currentPrice = Number(product?.price ?? 0);
//   const mrp = Number(product?.mrp ?? 0);
//   const currency = product?.currency || "INR";
//   const paymentUrl = product?.paymentUrl || "";

//   const discount =
//     mrp > currentPrice && currentPrice >= 0
//       ? Math.round(((mrp - currentPrice) / mrp) * 100)
//       : 0;

//   const formatMoney = (amount) => {
//     try {
//       return new Intl.NumberFormat("en-IN", {
//         style: "currency",
//         currency,
//         maximumFractionDigits: 0,
//       }).format(Number(amount || 0));
//     } catch {
//       return `₹${Number(amount || 0)}`;
//     }
//   };

//   const handleBuyNow = () => {
//     if (!paymentUrl) return;
//     window.location.href = paymentUrl;
//   };

//   // ============================================================
//   // FAQ
//   // ============================================================

//   const [openFaq, setOpenFaq] = useState(null);

//   const toggleFaq = (index) => {
//     setOpenFaq(openFaq === index ? null : index);
//   };

//   // ============================================================
//   // TOPICS
//   // ============================================================

//   const topics = [
//     {
//       number: "01",
//       title: "HLD Fundamentals",
//       description:
//         "Learn what system design actually means and how to approach large-scale architecture problems.",
//     },
//     {
//       number: "02",
//       title: "Functional Requirements",
//       description:
//         "Convert a problem statement into clear features, user flows and system responsibilities.",
//     },
//     {
//       number: "03",
//       title: "Non-Functional Requirements",
//       description:
//         "Understand scalability, availability, latency, reliability, security and performance requirements.",
//     },
//     {
//       number: "04",
//       title: "Capacity Estimation",
//       description:
//         "Estimate users, QPS, peak traffic, storage, bandwidth and infrastructure requirements.",
//     },
//     {
//       number: "05",
//       title: "API Design",
//       description:
//         "Design clean APIs and understand how different services communicate with each other.",
//     },
//     {
//       number: "06",
//       title: "Database Design",
//       description:
//         "Understand data modeling, indexes, relationships and choosing the right database.",
//     },
//     {
//       number: "07",
//       title: "SQL vs NoSQL",
//       description:
//         "Learn when relational and non-relational databases are appropriate.",
//     },
//     {
//       number: "08",
//       title: "Database Replication",
//       description:
//         "Understand replicas, read scaling, availability and redundancy.",
//     },
//     {
//       number: "09",
//       title: "Database Sharding",
//       description:
//         "Learn how large datasets can be partitioned across multiple database nodes.",
//     },
//     {
//       number: "10",
//       title: "Redis & Caching",
//       description:
//         "Understand caching strategies, TTL, cache invalidation and Redis use cases.",
//     },
//     {
//       number: "11",
//       title: "Load Balancing",
//       description:
//         "Learn how millions of requests can be distributed across multiple servers.",
//     },
//     {
//       number: "12",
//       title: "CDN",
//       description:
//         "Understand how content can be delivered closer to users to reduce latency.",
//     },
//     {
//       number: "13",
//       title: "Message Queues",
//       description:
//         "Learn asynchronous processing and why queues are important for scalable systems.",
//     },
//     {
//       number: "14",
//       title: "Kafka",
//       description:
//         "Understand event streaming, producers, consumers, partitions and scalable processing.",
//     },
//     {
//       number: "15",
//       title: "Rate Limiting",
//       description:
//         "Protect APIs from excessive traffic and control request rates.",
//     },
//     {
//       number: "16",
//       title: "CAP Theorem",
//       description:
//         "Understand consistency, availability and partition tolerance in distributed systems.",
//     },
//     {
//       number: "17",
//       title: "Distributed Systems",
//       description:
//         "Learn how multiple machines and services work together as one system.",
//     },
//     {
//       number: "18",
//       title: "Microservices",
//       description:
//         "Understand service boundaries, communication, scaling and failure isolation.",
//     },
//     {
//       number: "19",
//       title: "API Gateway",
//       description:
//         "Learn routing, authentication, aggregation, rate limiting and request management.",
//     },
//     {
//       number: "20",
//       title: "Service Discovery",
//       description:
//         "Understand how distributed services discover and communicate with each other.",
//     },
//     {
//       number: "21",
//       title: "Fault Tolerance",
//       description:
//         "Design systems that continue operating even when individual components fail.",
//     },
//     {
//       number: "22",
//       title: "Retries & Circuit Breakers",
//       description:
//         "Prevent temporary failures from becoming large cascading system failures.",
//     },
//     {
//       number: "23",
//       title: "Observability",
//       description:
//         "Understand logs, metrics, monitoring and distributed tracing.",
//     },
//     {
//       number: "24",
//       title: "Security",
//       description:
//         "Understand authentication, authorization, API security and system protection.",
//     },
//   ];

//   // ============================================================
//   // WHO SHOULD TAKE THIS BOOK
//   // ============================================================

//   const audience = [
//     {
//       title: "Complete Beginner",
//       description:
//         "You are starting system design and want a structured path from the fundamentals instead of jumping directly into complex architecture diagrams.",
//     },
//     {
//       title: "SDE-1 Engineers",
//       description:
//         "Build the foundation needed to understand how backend applications evolve from simple services into scalable distributed systems.",
//     },
//     {
//       title: "SDE-2 Engineers",
//       description:
//         "Strengthen your ability to reason about scalability, reliability, fault tolerance, distributed components and architectural trade-offs.",
//     },
//     {
//       title: "Backend Engineers",
//       description:
//         "Go beyond writing APIs and databases and understand how complete backend systems handle very large traffic.",
//     },
//     {
//       title: "AI / ML Engineers",
//       description:
//         "Understand how AI services, inference APIs, data pipelines and supporting services can be designed for high traffic and reliability.",
//     },
//     {
//       title: "Software Engineers",
//       description:
//         "Learn how databases, caches, queues, load balancers and services fit together in production architectures.",
//     },
//     {
//       title: "System Design Interview Candidates",
//       description:
//         "Follow a structured approach from requirements to capacity estimation, architecture, scaling and trade-offs.",
//     },
//     {
//       title: "Developers Preparing for Growth",
//       description:
//         "Learn the concepts that become increasingly important as systems grow from thousands to millions or billions of users.",
//     },
//   ];

//   // ============================================================
//   // DESIGN EXAMPLES
//   // ============================================================

//   const examples = [
//     {
//       number: "01",
//       title: "Design Uber",
//       description:
//         "Understand users, drivers, location tracking, matching, trip management and real-time communication.",
//       tags: ["Location", "Matching", "Real-time"],
//     },
//     {
//       number: "02",
//       title: "Design a URL Shortener",
//       description:
//         "Design unique URL generation, redirects, storage, caching and high-volume reads.",
//       tags: ["Redis", "Database", "Hashing"],
//     },
//     {
//       number: "03",
//       title: "Design Instagram",
//       description:
//         "Explore media upload, feed generation, followers, storage, caching and content delivery.",
//       tags: ["Feed", "CDN", "Storage"],
//     },
//     {
//       number: "04",
//       title: "Design YouTube",
//       description:
//         "Understand video upload, processing, transcoding, storage and large-scale video delivery.",
//       tags: ["Video", "CDN", "Storage"],
//     },
//     {
//       number: "05",
//       title: "Design Netflix",
//       description:
//         "Explore content delivery, caching, storage, streaming and large-scale user traffic.",
//       tags: ["Streaming", "CDN", "Caching"],
//     },
//     {
//       number: "06",
//       title: "Design WhatsApp",
//       description:
//         "Understand messaging, conversations, message delivery, presence and real-time communication.",
//       tags: ["Messaging", "WebSocket", "Events"],
//     },
//     {
//       number: "07",
//       title: "Design Twitter / X",
//       description:
//         "Understand timeline generation, followers, feed architecture and fan-out strategies.",
//       tags: ["Feed", "Fan-out", "Caching"],
//     },
//     {
//       number: "08",
//       title: "Design Dropbox",
//       description:
//         "Explore distributed file storage, metadata, synchronization and file access.",
//       tags: ["Storage", "Sync", "Metadata"],
//     },
//     {
//       number: "09",
//       title: "Design Google Drive",
//       description:
//         "Understand file storage, metadata, sharing, synchronization and scalable access.",
//       tags: ["Storage", "Sharing", "Database"],
//     },
//     {
//       number: "10",
//       title: "Design Ticket Booking",
//       description:
//         "Handle inventory, concurrent bookings, locking, payments and availability.",
//       tags: ["Concurrency", "Locking", "Payments"],
//     },
//     {
//       number: "11",
//       title: "Design Food Delivery",
//       description:
//         "Design restaurants, orders, delivery partners, tracking and notifications.",
//       tags: ["Orders", "Location", "Events"],
//     },
//     {
//       number: "12",
//       title: "Design Notification System",
//       description:
//         "Build scalable email, SMS and push notification delivery using asynchronous processing.",
//       tags: ["Kafka", "Queue", "Workers"],
//     },
//     {
//       number: "13",
//       title: "Design a Rate Limiter",
//       description:
//         "Protect distributed APIs using scalable rate-limiting strategies and shared state.",
//       tags: ["Redis", "API", "Distributed"],
//     },
//     {
//       number: "14",
//       title: "Design News Feed",
//       description:
//         "Understand feed generation, ranking, fan-out, caching and high-volume reads.",
//       tags: ["Feed", "Ranking", "Cache"],
//     },
//     {
//       number: "15",
//       title: "Design Distributed Job Scheduler",
//       description:
//         "Explore job queues, workers, scheduling, retries and failure handling.",
//       tags: ["Workers", "Queue", "Retries"],
//     },
//   ];

//   // ============================================================
//   // SYSTEM DESIGN PROCESS
//   // ============================================================

//   const process = [
//     {
//       number: "01",
//       title: "Understand the Problem",
//       description:
//         "Clarify exactly what the system should do and identify the most important user flows.",
//     },
//     {
//       number: "02",
//       title: "Define Requirements",
//       description:
//         "Separate functional requirements from scalability, availability, latency and reliability requirements.",
//     },
//     {
//       number: "03",
//       title: "Estimate Scale",
//       description:
//         "Estimate users, requests per second, storage, bandwidth and peak traffic.",
//     },
//     {
//       number: "04",
//       title: "Design APIs",
//       description:
//         "Define the interfaces through which clients and services communicate.",
//     },
//     {
//       number: "05",
//       title: "Choose Data Storage",
//       description:
//         "Select databases and data models based on access patterns and scale.",
//     },
//     {
//       number: "06",
//       title: "Build the Architecture",
//       description:
//         "Connect services, databases, caches, queues, load balancers and other components.",
//     },
//     {
//       number: "07",
//       title: "Scale the System",
//       description:
//         "Introduce horizontal scaling, caching, sharding, replication and asynchronous processing.",
//     },
//     {
//       number: "08",
//       title: "Handle Failures",
//       description:
//         "Think about retries, timeouts, circuit breakers, redundancy and graceful degradation.",
//     },
//     {
//       number: "09",
//       title: "Add Observability",
//       description:
//         "Determine how you will monitor latency, errors, traffic, infrastructure and failures.",
//     },
//     {
//       number: "10",
//       title: "Discuss Trade-offs",
//       description:
//         "Explain why you selected a particular architecture and what trade-offs it introduces.",
//     },
//   ];

//   // ============================================================
//   // FAQ
//   // ============================================================

//   const faqs = [
//     {
//       question: "Is this book suitable for a complete beginner?",
//       answer:
//         "Yes. The material is structured to start with HLD fundamentals and progressively move toward databases, caching, distributed systems, scalability, fault tolerance and complete system-design case studies.",
//     },
//     {
//       question: "Is this book useful for SDE-1 interviews?",
//       answer:
//         "Yes. It provides the foundational concepts needed to start understanding HLD problems and gives a structured framework for approaching system-design discussions.",
//     },
//     {
//       question: "Is this useful for SDE-2 engineers?",
//       answer:
//         "Yes. SDE-2 engineers can use it to strengthen concepts such as scalability, distributed systems, replication, sharding, fault tolerance, reliability and architectural trade-offs.",
//     },
//     {
//       question: "Why would an AI engineer need system design?",
//       answer:
//         "AI applications also depend on APIs, databases, caching, queues, storage, distributed services, observability and scalable infrastructure. Understanding HLD helps AI engineers reason about how AI-powered systems can operate reliably at larger scale.",
//     },
//     {
//       question: "Does the book teach Redis?",
//       answer:
//         "The book explains Redis and caching from a system-design perspective, including where caching fits into an architecture and the problems it can help solve.",
//     },
//     {
//       question: "Does it cover Kafka and message queues?",
//       answer:
//         "Yes. Message queues and Kafka are included as important building blocks for asynchronous processing and event-driven architectures.",
//     },
//     {
//       question: "Does it cover databases?",
//       answer:
//         "Yes. Database design, SQL vs NoSQL, replication, sharding, indexing and data-storage decisions are covered.",
//     },
//     {
//       question: "Can this help with system design interviews?",
//       answer:
//         "The book is designed around a structured HLD approach covering requirements, scale estimation, APIs, architecture, databases, caching, scalability, reliability and trade-offs.",
//     },
//     {
//       question: "Is this a physical book?",
//       answer:
//         "No. This is a digital PDF ebook.",
//     },
//     {
//       question: "Is the ebook refundable?",
//       answer:
//         "No. This is a digital product and purchases are non-refundable after successful payment.",
//     },
//     {
//       question: "How can I contact support?",
//       answer:
//         "For questions regarding the ebook or your purchase, contact supporttargettrek@gmail.com.",
//     },
//   ];

//   if (loadingProduct) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
//         <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
//           <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

//           <h1 className="mt-6 text-xl font-black text-slate-950">
//             Loading book...
//           </h1>

//           <p className="mt-2 text-sm leading-6 text-slate-500">
//             Please wait while we load the latest product details.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (!product || productError) {
//     return (
//       <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
//         <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
//           <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
//             📚
//           </div>

//           <h1 className="mt-6 text-2xl font-black text-slate-950 sm:text-3xl">
//             Book not found
//           </h1>

//           <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-500 sm:text-base">
//             We could not find this book, or it may no longer be available.
//             Please return to the books page and choose another resource.
//           </p>

//           <button
//             type="button"
//             onClick={() => {
//               window.location.href = "/books";
//             }}
//             className="mt-7 w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-blue-700 sm:w-auto"
//           >
//             ← Return to Books
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen overflow-x-hidden bg-[#f8fbff] text-slate-900">

//       {/* ============================================================
//           HERO
//       ============================================================ */}

//       <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-[#eef7ff] via-white to-[#f5faff]">
//         <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-100/50 blur-3xl" />

//         <div className="absolute -left-40 bottom-0 h-[350px] w-[350px] rounded-full bg-sky-100/50 blur-3xl" />

//         <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">

//           <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">

//             {/* HERO LEFT */}

//             <div>

//               {discount > 0 && (
//                 <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 shadow-sm sm:px-4 sm:text-sm">
//                   <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
//                   {discount}% OFF • Limited Time Deal
//                 </div>
//               )}

//               <h1 className="mt-6 break-words text-3xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
//                 Mastering System Design
//                 <span className="block text-blue-600">
//                   High-Level Design
//                 </span>
//               </h1>

//               <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:mt-7 sm:text-lg sm:leading-8">
//                 Learn how modern systems are designed to handle growing
//                 traffic, millions of users, distributed workloads, failures,
//                 high availability and massive amounts of data.
//               </p>

//               <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
//                 From your first HLD concept to interview-ready system design,
//                 this book takes you through the architecture building blocks
//                 used to design scalable and fault-tolerant systems.
//               </p>

//               <div className="mt-7 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
//                 {[
//                   "Beginner Friendly",
//                   "Interview Ready",
//                   "24+ Core Topics",
//                   "15+ Design Examples",
//                   "Digital PDF",
//                 ].map((item) => (
//                   <span
//                     key={item}
//                     className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm sm:px-4 sm:text-sm"
//                   >
//                     ✓ {item}
//                   </span>
//                 ))}
//               </div>

//               <div className="mt-9 flex flex-col gap-4 sm:flex-row">

//                 <button
//                   type="button"
//                   onClick={handleBuyNow}
//                   disabled={!paymentUrl}
//                   className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-center font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
//                 >
//                   Instant Buy Now →
//                 </button>

//                 <a
//                   href="#why-hld"
//                   className="w-full rounded-2xl border border-slate-300 bg-white px-6 py-4 text-center font-bold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50 sm:w-auto sm:px-8"
//                 >
//                   Why HLD?
//                 </a>

//               </div>

//             </div>

//             {/* PRICE CARD */}

//             <div className="mx-auto w-full max-w-md">

//               <div className="rounded-3xl border border-blue-100 bg-white p-4 shadow-xl shadow-blue-100/50 sm:p-8">

//                 <div className="rounded-2xl bg-[#eff7ff] p-5 sm:p-6">

//                   {discount > 0 && (
//                     <div className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
//                       {discount}% OFF
//                     </div>
//                   )}

//                   <p className="mt-5 text-xs font-black uppercase tracking-widest text-blue-600">
//                     Digital Ebook
//                   </p>

//                   <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950">
//                     Mastering System Design
//                   </h2>

//                   <p className="mt-1 font-bold text-slate-500">
//                     High-Level Design
//                   </p>

//                   <div className="mt-7 flex flex-wrap items-end gap-3">

//                     <span className="text-3xl font-black text-slate-950 sm:text-4xl">
//                       {formatMoney(currentPrice)}
//                     </span>

//                     {mrp > currentPrice && (
//                       <span className="pb-1 text-lg text-slate-400 line-through">
//                         {formatMoney(mrp)}
//                       </span>
//                     )}

//                   </div>

//                   <p className="mt-2 text-sm font-semibold text-blue-600">
//                     Limited-time offer
//                   </p>

//                 </div>

//                 <div className="mt-6 space-y-3">

//                   {[
//                     "Complete System Design PDF",
//                     "Beginner → Interview Ready",
//                     "24+ Important HLD Topics",
//                     "15+ Real-World Design Examples",
//                     "Scalability & Distributed Systems",
//                     "Fault Tolerance & Reliability",
//                   ].map((item) => (
//                     <div
//                       key={item}
//                       className="flex items-center gap-3 text-sm font-semibold text-slate-700"
//                     >
//                       <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
//                         ✓
//                       </span>

//                       {item}
//                     </div>
//                   ))}

//                 </div>

//                 <button
//                   type="button"
//                   onClick={handleBuyNow}
//                   disabled={!paymentUrl}
//                   className="mt-7 w-full rounded-2xl bg-blue-600 px-4 py-4 font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
//                 >
//                   Get the Ebook for {formatMoney(currentPrice)}
//                 </button>

//                 {/* SMALL SUPPORT / REFUND */}

//                 <div className="mt-4 text-center text-[11px] leading-5 text-slate-400">
//                   <p>
//                     Digital product • Non-refundable after successful purchase
//                   </p>

//                   <p>
//                     Need help?{" "}
//                     <a
//                       href="mailto:supporttargettrek@gmail.com"
//                       className="font-semibold text-slate-500 hover:text-blue-600"
//                     >
//                       supporttargettrek@gmail.com
//                     </a>
//                   </p>
//                 </div>

//               </div>

//             </div>

//           </div>

//         </div>
//       </section>

//       {/* ============================================================
//           QUICK VALUE STRIP
//       ============================================================ */}

//       <section className="border-b border-slate-200 bg-white">

//         <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">

//           {[
//             ["24+", "Core HLD Topics"],
//             ["15+", "Design Examples"],
//             ["Beginner", "Starting Point"],
//             ["Interview", "Focused Learning"],
//           ].map(([number, label]) => (

//             <div
//               key={label}
//               className="border-b border-r border-slate-100 px-3 py-6 text-center even:border-r-0 md:border-b-0 md:even:border-r md:last:border-r-0 sm:px-4 sm:py-7"
//             >

//               <div className="text-2xl font-black text-blue-600">
//                 {number}
//               </div>

//               <div className="mt-1 text-sm font-semibold text-slate-500">
//                 {label}
//               </div>

//             </div>

//           ))}

//         </div>

//       </section>

//       {/* ============================================================
//           WHY HLD IS IMPORTANT
//       ============================================================ */}

//       <section
//         id="why-hld"
//         className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
//       >

//         <div className="grid gap-14 lg:grid-cols-2 lg:items-center">

//           <div>

//             <p className="text-sm font-black uppercase tracking-widest text-blue-600">
//               Why High-Level Design?
//             </p>

//             <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
//               Writing code is only one part of building a system.
//             </h2>

//             <p className="mt-6 text-lg leading-8 text-slate-600">
//               A small application can work perfectly with one server and one
//               database. But what happens when the number of users grows from
//               thousands to millions?
//             </p>

//             <p className="mt-5 leading-8 text-slate-500">
//               Suddenly you need to think about traffic spikes, database load,
//               caching, queues, replication, load balancing, service failures,
//               network latency, data consistency and system recovery.
//             </p>

//             <p className="mt-5 leading-8 text-slate-500">
//               High-Level Design helps you understand how these pieces fit
//               together before you start implementing the system.
//             </p>

//           </div>

//           <div className="grid gap-4 sm:grid-cols-2">

//             {[
//               {
//                 title: "Scalability",
//                 text: "How do we handle increasing users and traffic without the system collapsing?",
//               },
//               {
//                 title: "Availability",
//                 text: "How can the system continue serving users even when individual components fail?",
//               },
//               {
//                 title: "Performance",
//                 text: "How do we keep response times low as traffic and data increase?",
//               },
//               {
//                 title: "Fault Tolerance",
//                 text: "What happens when a server, database, network or service fails?",
//               },
//               {
//                 title: "Distributed Systems",
//                 text: "How can multiple machines and services work together reliably?",
//               },
//               {
//                 title: "Reliability",
//                 text: "How do we build systems that users can depend on consistently?",
//               },
//             ].map((item) => (

//               <div
//                 key={item.title}
//                 className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
//               >

//                 <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-600">
//                   ✓
//                 </div>

//                 <h3 className="font-black text-slate-950">
//                   {item.title}
//                 </h3>

//                 <p className="mt-2 text-sm leading-6 text-slate-500">
//                   {item.text}
//                 </p>

//               </div>

//             ))}

//           </div>

//         </div>

//       </section>

//       {/* ============================================================
//           MILLION / BILLION USERS
//       ============================================================ */}

//       <section className="bg-blue-50/60 py-14 sm:py-20">

//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

//           <div className="mx-auto max-w-3xl text-center">

//             <p className="text-sm font-black uppercase tracking-widest text-blue-600">
//               Think at Scale
//             </p>

//             <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
//               What changes when your system grows?
//             </h2>

//             <p className="mt-5 leading-7 text-slate-600">
//               The architecture that works for 10,000 users may not work for
//               10 million users. At larger scale, every component introduces
//               new engineering challenges.
//             </p>

//           </div>

//           <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

//             {[
//               {
//                 number: "10K",
//                 title: "Users",
//                 text: "A simple architecture may be enough for early products.",
//               },
//               {
//                 number: "1M",
//                 title: "Users",
//                 text: "Caching, load balancing and database optimization become increasingly important.",
//               },
//               {
//                 number: "100M",
//                 title: "Users",
//                 text: "Distributed architecture, partitioning, replication and asynchronous processing become critical design considerations.",
//               },
//               {
//                 number: "1B+",
//                 title: "Users",
//                 text: "Systems require careful capacity planning, distributed infrastructure, fault isolation and multiple layers of scalability.",
//               },
//             ].map((item) => (

//               <div
//                 key={item.number}
//                 className="rounded-2xl border border-blue-100 bg-white p-6"
//               >

//                 <div className="text-3xl font-black text-blue-600">
//                   {item.number}
//                 </div>

//                 <div className="mt-1 font-black text-slate-950">
//                   {item.title}
//                 </div>

//                 <p className="mt-3 text-sm leading-6 text-slate-500">
//                   {item.text}
//                 </p>

//               </div>

//             ))}

//           </div>

//         </div>

//       </section>

//       {/* ============================================================
//           WHO SHOULD TAKE THIS BOOK
//       ============================================================ */}

//       <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

//         <div className="mx-auto max-w-3xl text-center">

//           <p className="text-sm font-black uppercase tracking-widest text-blue-600">
//             Who Should Take This Book?
//           </p>

//           <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
//             From beginner to interview-ready
//           </h2>

//           <p className="mt-5 leading-7 text-slate-600">
//             Whether you are learning system design for the first time or
//             preparing for your next software engineering interview, the book
//             gives you a structured path through the major HLD concepts.
//           </p>

//         </div>

//         <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

//           {audience.map((item, index) => (

//             <div
//               key={item.title}
//               className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
//             >

//               <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-600">
//                 {String(index + 1).padStart(2, "0")}
//               </div>

//               <h3 className="mt-5 font-black text-slate-950">
//                 {item.title}
//               </h3>

//               <p className="mt-3 text-sm leading-6 text-slate-500">
//                 {item.description}
//               </p>

//             </div>

//           ))}

//         </div>

//       </section>

//       {/* ============================================================
//           BEGINNER TO INTERVIEW READY
//       ============================================================ */}

//       <section className="border-y border-blue-100 bg-blue-50/60 py-14 sm:py-20">

//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

//           <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">

//             <div className="min-w-0">

//               <p className="text-sm font-black uppercase tracking-widest text-blue-600">
//                 Beginner → Interview Ready
//               </p>

//               <h2 className="mt-3 break-words text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
//                 You don't need to know everything before you start.
//               </h2>

//               <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
//                 Start with the fundamentals. Understand requirements and
//                 capacity estimation. Then learn databases, caching, queues,
//                 load balancing and distributed systems.
//               </p>

//               <p className="mt-4 text-sm leading-7 text-slate-600 sm:mt-5 sm:text-base sm:leading-8">
//                 Finally, combine these concepts to reason about complete
//                 systems and explain architectural trade-offs in an interview.
//               </p>

//             </div>

//             <div className="min-w-0 space-y-3">

//               {[
//                 ["01", "Understand HLD Fundamentals"],
//                 ["02", "Learn Core Architecture Components"],
//                 ["03", "Understand Scalability"],
//                 ["04", "Learn Distributed Systems"],
//                 ["05", "Handle Failures & Reliability"],
//                 ["06", "Study Real-World Systems"],
//                 ["07", "Practice System Design"],
//                 ["08", "Become Interview Ready"],
//               ].map(([number, title]) => (

//                 <div
//                   key={number}
//                   className="flex min-w-0 items-center gap-3 rounded-xl border border-blue-100 bg-white p-4 shadow-sm sm:gap-4"
//                 >

//                   <span className="shrink-0 text-sm font-black text-blue-600">
//                     {number}
//                   </span>

//                   <span className="min-w-0 break-words text-sm font-bold text-slate-800 sm:text-base">
//                     {title}
//                   </span>

//                 </div>

//               ))}

//             </div>

//           </div>

//         </div>

//       </section>

//       {/* ============================================================
//           TOPICS
//       ============================================================ */}

//       <section className="bg-white py-14 sm:py-20">

//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

//           <div className="mx-auto max-w-3xl text-center">

//             <p className="text-sm font-black uppercase tracking-widest text-blue-600">
//               Inside The Book
//             </p>

//             <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
//               The HLD topics you need to know
//             </h2>

//             <p className="mt-4 leading-7 text-slate-600">
//               Learn the major building blocks used when designing scalable
//               backend and distributed systems.
//             </p>

//           </div>

//           <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

//             {topics.map((topic) => (

//               <div
//                 key={topic.title}
//                 className="rounded-2xl border border-slate-200 bg-[#f9fcff] p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg"
//               >

//                 <div className="text-xs font-black text-blue-600">
//                   {topic.number}
//                 </div>

//                 <h3 className="mt-4 font-black text-slate-950">
//                   {topic.title}
//                 </h3>

//                 <p className="mt-2 text-sm leading-6 text-slate-500">
//                   {topic.description}
//                 </p>

//               </div>

//             ))}

//           </div>

//         </div>

//       </section>

//       {/* ============================================================
//           DESIGN EXAMPLES
//       ============================================================ */}

//       <section className="bg-slate-50 py-14 sm:py-20">

//         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

//           <div className="max-w-3xl">

//             <p className="text-sm font-black uppercase tracking-widest text-blue-600">
//               Practice With Real-World Problems
//             </p>

//             <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
//               15+ system design examples
//             </h2>

//             <p className="mt-4 leading-7 text-slate-600">
//               Learn how the core concepts can be applied to familiar
//               large-scale applications and common system-design problems.
//             </p>

//           </div>

//           <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

//             {examples.map((example) => (

//               <div
//                 key={example.number}
//                 className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
//               >

//                 <div className="flex items-center justify-between">

//                   <span className="text-xs font-black text-blue-600">
//                     CASE STUDY {example.number}
//                   </span>

//                   <span className="text-slate-300">
//                     ↗
//                   </span>

//                 </div>

//                 <h3 className="mt-5 text-xl font-black text-slate-950">
//                   {example.title}
//                 </h3>

//                 <p className="mt-3 text-sm leading-6 text-slate-500">
//                   {example.description}
//                 </p>

//                 <div className="mt-5 flex flex-wrap gap-2">

//                   {example.tags.map((tag) => (

//                     <span
//                       key={tag}
//                       className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
//                     >
//                       {tag}
//                     </span>

//                   ))}

//                 </div>

//               </div>

//             ))}

//           </div>

//           <p className="mt-7 text-center text-xs leading-5 text-slate-400">
//             Named platforms are used as educational system-design case
//             studies. This material does not claim to represent proprietary
//             internal architectures of those companies.
//           </p>

//         </div>

//       </section>

//       {/* ============================================================
//           SYSTEM DESIGN PROCESS
//       ============================================================ */}

//       <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

//         <div className="mx-auto max-w-3xl text-center">

//           <p className="text-sm font-black uppercase tracking-widest text-blue-600">
//             Learn The Process
//           </p>

//           <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
//             How to approach an HLD interview question
//           </h2>

//           <p className="mt-4 leading-7 text-slate-600">
//             Learn a structured process instead of randomly drawing boxes and
//             choosing technologies.
//           </p>

//         </div>

//         <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">

//           {process.map((item) => (

//             <div
//               key={item.number}
//               className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
//             >

//               <span className="text-sm font-black text-blue-600">
//                 {item.number}
//               </span>

//               <h3 className="mt-4 font-black text-slate-950">
//                 {item.title}
//               </h3>

//               <p className="mt-2 text-sm leading-6 text-slate-500">
//                 {item.description}
//               </p>

//             </div>

//           ))}

//         </div>

//       </section>

//       {/* ============================================================
//           TECHNOLOGIES
//       ============================================================ */}

//       <section className="bg-blue-50/60 py-14 sm:py-20">

//         <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">

//           <p className="text-sm font-black uppercase tracking-widest text-blue-600">
//             Architecture Building Blocks
//           </p>

//           <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
//             Understand where the technologies fit
//           </h2>

//           <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
//             System design isn't about memorizing technology names. It's about
//             understanding what problem each component solves.
//           </p>

//           <div className="mt-10 flex flex-wrap justify-center gap-3">

//             {[
//               "Redis",
//               "Kafka",
//               "SQL",
//               "NoSQL",
//               "Load Balancer",
//               "CDN",
//               "API Gateway",
//               "Microservices",
//               "Message Queue",
//               "Replication",
//               "Sharding",
//               "Caching",
//               "Object Storage",
//               "WebSockets",
//               "Rate Limiter",
//               "Service Discovery",
//               "Circuit Breaker",
//               "Monitoring",
//               "Logging",
//               "Distributed Tracing",
//               "Authentication",
//               "Authorization",
//             ].map((technology) => (

//               <span
//                 key={technology}
//                 className="rounded-xl border border-blue-100 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm"
//               >
//                 {technology}
//               </span>

//             ))}

//           </div>

//         </div>

//       </section>

//       {/* ============================================================
//           FAQ
//       ============================================================ */}

//       <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

//         <div className="text-center">

//           <p className="text-sm font-black uppercase tracking-widest text-blue-600">
//             FAQ
//           </p>

//           <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
//             Frequently asked questions
//           </h2>

//         </div>

//         <div className="mt-10 space-y-3">

//           {faqs.map((faq, index) => {

//             const isOpen = openFaq === index;

//             return (
//               <div
//                 key={faq.question}
//                 className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
//               >

//                 <button
//                   onClick={() => toggleFaq(index)}
//                   className="flex w-full min-w-0 items-start justify-between gap-3 px-4 py-4 text-left sm:items-center sm:gap-5 sm:px-5 sm:py-5"
//                 >

//                   <span className="min-w-0 break-words pr-2 text-sm font-bold leading-6 text-slate-900 sm:text-base">
//                     {faq.question}
//                   </span>

//                   <span
//                     className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition ${
//                       isOpen ? "rotate-45" : ""
//                     }`}
//                   >
//                     +
//                   </span>

//                 </button>

//                 {isOpen && (
//                   <div className="border-t border-slate-100 px-4 pb-5 pt-4 text-sm leading-7 text-slate-500 sm:px-5">
//                     {faq.answer}
//                   </div>
//                 )}

//               </div>
//             );

//           })}

//         </div>

//       </section>

//       {/* ============================================================
//           FINAL PURCHASE SECTION
//       ============================================================ */}

//       <section className="px-4 pb-14 sm:px-6 sm:pb-20">

//         <div className="mx-auto max-w-5xl rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 text-center sm:p-12">

//           {discount > 0 && (
//             <div className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-black text-blue-700">
//               {discount}% OFF • Limited Time Deal
//             </div>
//           )}

//           <h2 className="mt-5 text-3xl font-black text-slate-950 sm:text-4xl">
//             Start learning system design today.
//           </h2>

//           <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
//             Build your HLD fundamentals, understand scalable architecture and
//             learn how distributed systems handle growing traffic and failures.
//           </p>

//           <div className="mt-7 flex flex-wrap items-center justify-center gap-3">

//             <span className="text-4xl font-black text-blue-600">
//               {formatMoney(currentPrice)}
//             </span>

//             {mrp > currentPrice && (
//               <span className="text-xl text-slate-400 line-through">
//                 {formatMoney(mrp)}
//               </span>
//             )}

//           </div>

//           <button
//             type="button"
//             onClick={handleBuyNow}
//             disabled={!paymentUrl}
//             className="mt-7 w-full rounded-2xl bg-blue-600 px-6 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-10"
//           >
//             Instant Buy Now →
//           </button>

//           {/* SMALL SUPPORT / REFUND */}

//           <div className="mt-5 text-[11px] leading-5 text-slate-400">

//             <p>
//               This is a digital PDF product and is non-refundable after
//               successful purchase.
//             </p>

//             <p>
//               For any help, contact{" "}
//               <a
//                 href="mailto:supporttargettrek@gmail.com"
//                 className="font-semibold text-slate-500 hover:text-blue-600"
//               >
//                 supporttargettrek@gmail.com
//               </a>
//             </p>

//           </div>

//         </div>

//       </section>

//       {/* ============================================================
//           SMALL BOTTOM NOTICE
//       ============================================================ */}

//       <div className="border-t border-slate-200 bg-white px-4 py-7 text-center sm:px-6">

//         <p className="text-xs leading-6 text-slate-400">
//           Mastering System Design — High-Level Design
//           <span className="mx-2">•</span>
//           Digital PDF
//           <span className="mx-2">•</span>
//           Non-refundable digital product
//         </p>

//         <p className="mt-1 text-xs text-slate-400">
//           Support:{" "}
//           <a
//             href="mailto:supporttargettrek@gmail.com"
//             className="hover:text-blue-600"
//           >
//             supporttargettrek@gmail.com
//           </a>
//         </p>

//       </div>

//     </div>
//   );
// };

// export default SystemDesignHLD;

import React, { useEffect, useState } from "react";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";

const SystemDesignHLD = () => {
  // ============================================================
  // DYNAMIC PRODUCT DATA
  // ============================================================

  // If you already export BASE_URL from a utility file in your project,
  // replace this line with your existing import.
  const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        setProductError("");

        // Example:
        // https://xyz.com/books/system-design/hld
        // sends redirectUrl=/books/system-design/hld
        const redirectUrl = window.location.pathname;

        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(
            redirectUrl
          )}`,
          {
            method: "GET",
            signal: controller.signal,
          }
        );

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success || !result?.data) {
          throw new Error(result?.error?.message || "Book not found.");
        }

        setProduct(result.data);
      } catch (error) {
        if (error?.name === "AbortError") return;

        console.error("Failed to fetch HLD product:", error);
        setProduct(null);
        setProductError(error?.message || "Book not found.");
      } finally {
        if (!controller.signal.aborted) {
          setLoadingProduct(false);
        }
      }
    };

    fetchProduct();

    return () => controller.abort();
  }, [BASE_URL]);

  const currentPrice = Number(product?.price ?? 0);
  const mrp = Number(product?.mrp ?? 0);
  const currency = product?.currency || "INR";

  const discount =
    mrp > currentPrice && currentPrice >= 0
      ? Math.round(((mrp - currentPrice) / mrp) * 100)
      : 0;

  const formatMoney = (amount) => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(Number(amount || 0));
    } catch {
      return `₹${Number(amount || 0)}`;
    }
  };

  const handleBuyNow = () => {
    if (!product?._id) return;
    setIsCheckoutOpen(true);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
  };

  // ============================================================
  // FAQ
  // ============================================================

  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // ============================================================
  // TOPICS
  // ============================================================

  const topics = [
    {
      number: "01",
      title: "HLD Fundamentals",
      description:
        "Learn what system design actually means and how to approach large-scale architecture problems.",
    },
    {
      number: "02",
      title: "Functional Requirements",
      description:
        "Convert a problem statement into clear features, user flows and system responsibilities.",
    },
    {
      number: "03",
      title: "Non-Functional Requirements",
      description:
        "Understand scalability, availability, latency, reliability, security and performance requirements.",
    },
    {
      number: "04",
      title: "Capacity Estimation",
      description:
        "Estimate users, QPS, peak traffic, storage, bandwidth and infrastructure requirements.",
    },
    {
      number: "05",
      title: "API Design",
      description:
        "Design clean APIs and understand how different services communicate with each other.",
    },
    {
      number: "06",
      title: "Database Design",
      description:
        "Understand data modeling, indexes, relationships and choosing the right database.",
    },
    {
      number: "07",
      title: "SQL vs NoSQL",
      description:
        "Learn when relational and non-relational databases are appropriate.",
    },
    {
      number: "08",
      title: "Database Replication",
      description:
        "Understand replicas, read scaling, availability and redundancy.",
    },
    {
      number: "09",
      title: "Database Sharding",
      description:
        "Learn how large datasets can be partitioned across multiple database nodes.",
    },
    {
      number: "10",
      title: "Redis & Caching",
      description:
        "Understand caching strategies, TTL, cache invalidation and Redis use cases.",
    },
    {
      number: "11",
      title: "Load Balancing",
      description:
        "Learn how millions of requests can be distributed across multiple servers.",
    },
    {
      number: "12",
      title: "CDN",
      description:
        "Understand how content can be delivered closer to users to reduce latency.",
    },
    {
      number: "13",
      title: "Message Queues",
      description:
        "Learn asynchronous processing and why queues are important for scalable systems.",
    },
    {
      number: "14",
      title: "Kafka",
      description:
        "Understand event streaming, producers, consumers, partitions and scalable processing.",
    },
    {
      number: "15",
      title: "Rate Limiting",
      description:
        "Protect APIs from excessive traffic and control request rates.",
    },
    {
      number: "16",
      title: "CAP Theorem",
      description:
        "Understand consistency, availability and partition tolerance in distributed systems.",
    },
    {
      number: "17",
      title: "Distributed Systems",
      description:
        "Learn how multiple machines and services work together as one system.",
    },
    {
      number: "18",
      title: "Microservices",
      description:
        "Understand service boundaries, communication, scaling and failure isolation.",
    },
    {
      number: "19",
      title: "API Gateway",
      description:
        "Learn routing, authentication, aggregation, rate limiting and request management.",
    },
    {
      number: "20",
      title: "Service Discovery",
      description:
        "Understand how distributed services discover and communicate with each other.",
    },
    {
      number: "21",
      title: "Fault Tolerance",
      description:
        "Design systems that continue operating even when individual components fail.",
    },
    {
      number: "22",
      title: "Retries & Circuit Breakers",
      description:
        "Prevent temporary failures from becoming large cascading system failures.",
    },
    {
      number: "23",
      title: "Observability",
      description:
        "Understand logs, metrics, monitoring and distributed tracing.",
    },
    {
      number: "24",
      title: "Security",
      description:
        "Understand authentication, authorization, API security and system protection.",
    },
  ];

  // ============================================================
  // WHO SHOULD TAKE THIS BOOK
  // ============================================================

  const audience = [
    {
      title: "Complete Beginner",
      description:
        "You are starting system design and want a structured path from the fundamentals instead of jumping directly into complex architecture diagrams.",
    },
    {
      title: "SDE-1 Engineers",
      description:
        "Build the foundation needed to understand how backend applications evolve from simple services into scalable distributed systems.",
    },
    {
      title: "SDE-2 Engineers",
      description:
        "Strengthen your ability to reason about scalability, reliability, fault tolerance, distributed components and architectural trade-offs.",
    },
    {
      title: "Backend Engineers",
      description:
        "Go beyond writing APIs and databases and understand how complete backend systems handle very large traffic.",
    },
    {
      title: "AI / ML Engineers",
      description:
        "Understand how AI services, inference APIs, data pipelines and supporting services can be designed for high traffic and reliability.",
    },
    {
      title: "Software Engineers",
      description:
        "Learn how databases, caches, queues, load balancers and services fit together in production architectures.",
    },
    {
      title: "System Design Interview Candidates",
      description:
        "Follow a structured approach from requirements to capacity estimation, architecture, scaling and trade-offs.",
    },
    {
      title: "Developers Preparing for Growth",
      description:
        "Learn the concepts that become increasingly important as systems grow from thousands to millions or billions of users.",
    },
  ];

  // ============================================================
  // DESIGN EXAMPLES
  // ============================================================

  const examples = [
    {
      number: "01",
      title: "Design Uber",
      description:
        "Understand users, drivers, location tracking, matching, trip management and real-time communication.",
      tags: ["Location", "Matching", "Real-time"],
    },
    {
      number: "02",
      title: "Design a URL Shortener",
      description:
        "Design unique URL generation, redirects, storage, caching and high-volume reads.",
      tags: ["Redis", "Database", "Hashing"],
    },
    {
      number: "03",
      title: "Design Instagram",
      description:
        "Explore media upload, feed generation, followers, storage, caching and content delivery.",
      tags: ["Feed", "CDN", "Storage"],
    },
    {
      number: "04",
      title: "Design YouTube",
      description:
        "Understand video upload, processing, transcoding, storage and large-scale video delivery.",
      tags: ["Video", "CDN", "Storage"],
    },
    {
      number: "05",
      title: "Design Netflix",
      description:
        "Explore content delivery, caching, storage, streaming and large-scale user traffic.",
      tags: ["Streaming", "CDN", "Caching"],
    },
    {
      number: "06",
      title: "Design WhatsApp",
      description:
        "Understand messaging, conversations, message delivery, presence and real-time communication.",
      tags: ["Messaging", "WebSocket", "Events"],
    },
    {
      number: "07",
      title: "Design Twitter / X",
      description:
        "Understand timeline generation, followers, feed architecture and fan-out strategies.",
      tags: ["Feed", "Fan-out", "Caching"],
    },
    {
      number: "08",
      title: "Design Dropbox",
      description:
        "Explore distributed file storage, metadata, synchronization and file access.",
      tags: ["Storage", "Sync", "Metadata"],
    },
    {
      number: "09",
      title: "Design Google Drive",
      description:
        "Understand file storage, metadata, sharing, synchronization and scalable access.",
      tags: ["Storage", "Sharing", "Database"],
    },
    {
      number: "10",
      title: "Design Ticket Booking",
      description:
        "Handle inventory, concurrent bookings, locking, payments and availability.",
      tags: ["Concurrency", "Locking", "Payments"],
    },
    {
      number: "11",
      title: "Design Food Delivery",
      description:
        "Design restaurants, orders, delivery partners, tracking and notifications.",
      tags: ["Orders", "Location", "Events"],
    },
    {
      number: "12",
      title: "Design Notification System",
      description:
        "Build scalable email, SMS and push notification delivery using asynchronous processing.",
      tags: ["Kafka", "Queue", "Workers"],
    },
    {
      number: "13",
      title: "Design a Rate Limiter",
      description:
        "Protect distributed APIs using scalable rate-limiting strategies and shared state.",
      tags: ["Redis", "API", "Distributed"],
    },
    {
      number: "14",
      title: "Design News Feed",
      description:
        "Understand feed generation, ranking, fan-out, caching and high-volume reads.",
      tags: ["Feed", "Ranking", "Cache"],
    },
    {
      number: "15",
      title: "Design Distributed Job Scheduler",
      description:
        "Explore job queues, workers, scheduling, retries and failure handling.",
      tags: ["Workers", "Queue", "Retries"],
    },
  ];

  // ============================================================
  // SYSTEM DESIGN PROCESS
  // ============================================================

  const process = [
    {
      number: "01",
      title: "Understand the Problem",
      description:
        "Clarify exactly what the system should do and identify the most important user flows.",
    },
    {
      number: "02",
      title: "Define Requirements",
      description:
        "Separate functional requirements from scalability, availability, latency and reliability requirements.",
    },
    {
      number: "03",
      title: "Estimate Scale",
      description:
        "Estimate users, requests per second, storage, bandwidth and peak traffic.",
    },
    {
      number: "04",
      title: "Design APIs",
      description:
        "Define the interfaces through which clients and services communicate.",
    },
    {
      number: "05",
      title: "Choose Data Storage",
      description:
        "Select databases and data models based on access patterns and scale.",
    },
    {
      number: "06",
      title: "Build the Architecture",
      description:
        "Connect services, databases, caches, queues, load balancers and other components.",
    },
    {
      number: "07",
      title: "Scale the System",
      description:
        "Introduce horizontal scaling, caching, sharding, replication and asynchronous processing.",
    },
    {
      number: "08",
      title: "Handle Failures",
      description:
        "Think about retries, timeouts, circuit breakers, redundancy and graceful degradation.",
    },
    {
      number: "09",
      title: "Add Observability",
      description:
        "Determine how you will monitor latency, errors, traffic, infrastructure and failures.",
    },
    {
      number: "10",
      title: "Discuss Trade-offs",
      description:
        "Explain why you selected a particular architecture and what trade-offs it introduces.",
    },
  ];

  // ============================================================
  // FAQ
  // ============================================================

  const faqs = [
    {
      question: "Is this book suitable for a complete beginner?",
      answer:
        "Yes. The material is structured to start with HLD fundamentals and progressively move toward databases, caching, distributed systems, scalability, fault tolerance and complete system-design case studies.",
    },
    {
      question: "Is this book useful for SDE-1 interviews?",
      answer:
        "Yes. It provides the foundational concepts needed to start understanding HLD problems and gives a structured framework for approaching system-design discussions.",
    },
    {
      question: "Is this useful for SDE-2 engineers?",
      answer:
        "Yes. SDE-2 engineers can use it to strengthen concepts such as scalability, distributed systems, replication, sharding, fault tolerance, reliability and architectural trade-offs.",
    },
    {
      question: "Why would an AI engineer need system design?",
      answer:
        "AI applications also depend on APIs, databases, caching, queues, storage, distributed services, observability and scalable infrastructure. Understanding HLD helps AI engineers reason about how AI-powered systems can operate reliably at larger scale.",
    },
    {
      question: "Does the book teach Redis?",
      answer:
        "The book explains Redis and caching from a system-design perspective, including where caching fits into an architecture and the problems it can help solve.",
    },
    {
      question: "Does it cover Kafka and message queues?",
      answer:
        "Yes. Message queues and Kafka are included as important building blocks for asynchronous processing and event-driven architectures.",
    },
    {
      question: "Does it cover databases?",
      answer:
        "Yes. Database design, SQL vs NoSQL, replication, sharding, indexing and data-storage decisions are covered.",
    },
    {
      question: "Can this help with system design interviews?",
      answer:
        "The book is designed around a structured HLD approach covering requirements, scale estimation, APIs, architecture, databases, caching, scalability, reliability and trade-offs.",
    },
    {
      question: "Is this a physical book?",
      answer:
        "No. This is a digital PDF ebook.",
    },
    {
      question: "Is the ebook refundable?",
      answer:
        "No. This is a digital product and purchases are non-refundable after successful payment.",
    },
    {
      question: "How can I contact support?",
      answer:
        "For questions regarding the ebook or your purchase, contact supporttargettrek@gmail.com.",
    },
  ];

  if (loadingProduct) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <h1 className="mt-6 text-xl font-black text-slate-950">
            Loading book...
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Please wait while we load the latest product details.
          </p>
        </div>
      </div>
    );
  }

  if (!product || productError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
            📚
          </div>

          <h1 className="mt-6 text-2xl font-black text-slate-950 sm:text-3xl">
            Book not found
          </h1>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-500 sm:text-base">
            We could not find this book, or it may no longer be available.
            Please return to the books page and choose another resource.
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/books";
            }}
            className="mt-7 w-full rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-blue-700 sm:w-auto"
          >
            ← Return to Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fbff] text-slate-900">

      {/* ============================================================
          HERO
      ============================================================ */}

      <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-[#eef7ff] via-white to-[#f5faff]">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-100/50 blur-3xl" />

        <div className="absolute -left-40 bottom-0 h-[350px] w-[350px] rounded-full bg-sky-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">

          <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">

            {/* HERO LEFT */}

            <div>

              {discount > 0 && (
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-700 shadow-sm sm:px-4 sm:text-sm">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                  {discount}% OFF • Limited Time Deal
                </div>
              )}

              <h1 className="mt-6 break-words text-3xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Mastering System Design
                <span className="block text-blue-600">
                  High-Level Design
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:mt-7 sm:text-lg sm:leading-8">
                Learn how modern systems are designed to handle growing
                traffic, millions of users, distributed workloads, failures,
                high availability and massive amounts of data.
              </p>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
                From your first HLD concept to interview-ready system design,
                this book takes you through the architecture building blocks
                used to design scalable and fault-tolerant systems.
              </p>

              <div className="mt-7 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
                {[
                  "Beginner Friendly",
                  "Interview Ready",
                  "24+ Core Topics",
                  "15+ Design Examples",
                  "Digital PDF",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm sm:px-4 sm:text-sm"
                  >
                    ✓ {item}
                  </span>
                ))}
              </div>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!product?._id}
                  className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-center font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
                >
                  Instant Buy Now →
                </button>

                <a
                  href="#why-hld"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-6 py-4 text-center font-bold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50 sm:w-auto sm:px-8"
                >
                  Why HLD?
                </a>

              </div>

            </div>

            {/* PRICE CARD */}

            <div className="mx-auto w-full max-w-md">

              <div className="rounded-3xl border border-blue-100 bg-white p-4 shadow-xl shadow-blue-100/50 sm:p-8">

                <div className="rounded-2xl bg-[#eff7ff] p-5 sm:p-6">

                  {discount > 0 && (
                    <div className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
                      {discount}% OFF
                    </div>
                  )}

                  <p className="mt-5 text-xs font-black uppercase tracking-widest text-blue-600">
                    Digital Ebook
                  </p>

                  <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950">
                    Mastering System Design
                  </h2>

                  <p className="mt-1 font-bold text-slate-500">
                    High-Level Design
                  </p>

                  <div className="mt-7 flex flex-wrap items-end gap-3">

                    <span className="text-3xl font-black text-slate-950 sm:text-4xl">
                      {formatMoney(currentPrice)}
                    </span>

                    {mrp > currentPrice && (
                      <span className="pb-1 text-lg text-slate-400 line-through">
                        {formatMoney(mrp)}
                      </span>
                    )}

                  </div>

                  <p className="mt-2 text-sm font-semibold text-blue-600">
                    Limited-time offer
                  </p>

                </div>

                <div className="mt-6 space-y-3">

                  {[
                    "Complete System Design PDF",
                    "Beginner → Interview Ready",
                    "24+ Important HLD Topics",
                    "15+ Real-World Design Examples",
                    "Scalability & Distributed Systems",
                    "Fault Tolerance & Reliability",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm font-semibold text-slate-700"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        ✓
                      </span>

                      {item}
                    </div>
                  ))}

                </div>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!product?._id}
                  className="mt-7 w-full rounded-2xl bg-blue-600 px-4 py-4 font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Get the Ebook for {formatMoney(currentPrice)}
                </button>

                {/* SMALL SUPPORT / REFUND */}

                <div className="mt-4 text-center text-[11px] leading-5 text-slate-400">
                  <p>
                    Digital product • Non-refundable after successful purchase
                  </p>

                  <p>
                    Need help?{" "}
                    <a
                      href="mailto:supporttargettrek@gmail.com"
                      className="font-semibold text-slate-500 hover:text-blue-600"
                    >
                      supporttargettrek@gmail.com
                    </a>
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ============================================================
          QUICK VALUE STRIP
      ============================================================ */}

      <section className="border-b border-slate-200 bg-white">

        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">

          {[
            ["24+", "Core HLD Topics"],
            ["15+", "Design Examples"],
            ["Beginner", "Starting Point"],
            ["Interview", "Focused Learning"],
          ].map(([number, label]) => (

            <div
              key={label}
              className="border-b border-r border-slate-100 px-3 py-6 text-center even:border-r-0 md:border-b-0 md:even:border-r md:last:border-r-0 sm:px-4 sm:py-7"
            >

              <div className="text-2xl font-black text-blue-600">
                {number}
              </div>

              <div className="mt-1 text-sm font-semibold text-slate-500">
                {label}
              </div>

            </div>

          ))}

        </div>

      </section>

      {/* ============================================================
          WHY HLD IS IMPORTANT
      ============================================================ */}

      <section
        id="why-hld"
        className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8"
      >

        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">

          <div>

            <p className="text-sm font-black uppercase tracking-widest text-blue-600">
              Why High-Level Design?
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Writing code is only one part of building a system.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              A small application can work perfectly with one server and one
              database. But what happens when the number of users grows from
              thousands to millions?
            </p>

            <p className="mt-5 leading-8 text-slate-500">
              Suddenly you need to think about traffic spikes, database load,
              caching, queues, replication, load balancing, service failures,
              network latency, data consistency and system recovery.
            </p>

            <p className="mt-5 leading-8 text-slate-500">
              High-Level Design helps you understand how these pieces fit
              together before you start implementing the system.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-2">

            {[
              {
                title: "Scalability",
                text: "How do we handle increasing users and traffic without the system collapsing?",
              },
              {
                title: "Availability",
                text: "How can the system continue serving users even when individual components fail?",
              },
              {
                title: "Performance",
                text: "How do we keep response times low as traffic and data increase?",
              },
              {
                title: "Fault Tolerance",
                text: "What happens when a server, database, network or service fails?",
              },
              {
                title: "Distributed Systems",
                text: "How can multiple machines and services work together reliably?",
              },
              {
                title: "Reliability",
                text: "How do we build systems that users can depend on consistently?",
              },
            ].map((item) => (

              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >

                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-600">
                  ✓
                </div>

                <h3 className="font-black text-slate-950">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ============================================================
          MILLION / BILLION USERS
      ============================================================ */}

      <section className="bg-blue-50/60 py-14 sm:py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-black uppercase tracking-widest text-blue-600">
              Think at Scale
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              What changes when your system grows?
            </h2>

            <p className="mt-5 leading-7 text-slate-600">
              The architecture that works for 10,000 users may not work for
              10 million users. At larger scale, every component introduces
              new engineering challenges.
            </p>

          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            {[
              {
                number: "10K",
                title: "Users",
                text: "A simple architecture may be enough for early products.",
              },
              {
                number: "1M",
                title: "Users",
                text: "Caching, load balancing and database optimization become increasingly important.",
              },
              {
                number: "100M",
                title: "Users",
                text: "Distributed architecture, partitioning, replication and asynchronous processing become critical design considerations.",
              },
              {
                number: "1B+",
                title: "Users",
                text: "Systems require careful capacity planning, distributed infrastructure, fault isolation and multiple layers of scalability.",
              },
            ].map((item) => (

              <div
                key={item.number}
                className="rounded-2xl border border-blue-100 bg-white p-6"
              >

                <div className="text-3xl font-black text-blue-600">
                  {item.number}
                </div>

                <div className="mt-1 font-black text-slate-950">
                  {item.title}
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {item.text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ============================================================
          WHO SHOULD TAKE THIS BOOK
      ============================================================ */}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

        <div className="mx-auto max-w-3xl text-center">

          <p className="text-sm font-black uppercase tracking-widest text-blue-600">
            Who Should Take This Book?
          </p>

          <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            From beginner to interview-ready
          </h2>

          <p className="mt-5 leading-7 text-slate-600">
            Whether you are learning system design for the first time or
            preparing for your next software engineering interview, the book
            gives you a structured path through the major HLD concepts.
          </p>

        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

          {audience.map((item, index) => (

            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-600">
                {String(index + 1).padStart(2, "0")}
              </div>

              <h3 className="mt-5 font-black text-slate-950">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {item.description}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* ============================================================
          BEGINNER TO INTERVIEW READY
      ============================================================ */}

      <section className="border-y border-blue-100 bg-blue-50/60 py-14 sm:py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">

            <div className="min-w-0">

              <p className="text-sm font-black uppercase tracking-widest text-blue-600">
                Beginner → Interview Ready
              </p>

              <h2 className="mt-3 break-words text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                You don't need to know everything before you start.
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                Start with the fundamentals. Understand requirements and
                capacity estimation. Then learn databases, caching, queues,
                load balancing and distributed systems.
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-600 sm:mt-5 sm:text-base sm:leading-8">
                Finally, combine these concepts to reason about complete
                systems and explain architectural trade-offs in an interview.
              </p>

            </div>

            <div className="min-w-0 space-y-3">

              {[
                ["01", "Understand HLD Fundamentals"],
                ["02", "Learn Core Architecture Components"],
                ["03", "Understand Scalability"],
                ["04", "Learn Distributed Systems"],
                ["05", "Handle Failures & Reliability"],
                ["06", "Study Real-World Systems"],
                ["07", "Practice System Design"],
                ["08", "Become Interview Ready"],
              ].map(([number, title]) => (

                <div
                  key={number}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-blue-100 bg-white p-4 shadow-sm sm:gap-4"
                >

                  <span className="shrink-0 text-sm font-black text-blue-600">
                    {number}
                  </span>

                  <span className="min-w-0 break-words text-sm font-bold text-slate-800 sm:text-base">
                    {title}
                  </span>

                </div>

              ))}

            </div>

          </div>

        </div>

      </section>

      {/* ============================================================
          TOPICS
      ============================================================ */}

      <section className="bg-white py-14 sm:py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-black uppercase tracking-widest text-blue-600">
              Inside The Book
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              The HLD topics you need to know
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Learn the major building blocks used when designing scalable
              backend and distributed systems.
            </p>

          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {topics.map((topic) => (

              <div
                key={topic.title}
                className="rounded-2xl border border-slate-200 bg-[#f9fcff] p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg"
              >

                <div className="text-xs font-black text-blue-600">
                  {topic.number}
                </div>

                <h3 className="mt-4 font-black text-slate-950">
                  {topic.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {topic.description}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ============================================================
          DESIGN EXAMPLES
      ============================================================ */}

      <section className="bg-slate-50 py-14 sm:py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="max-w-3xl">

            <p className="text-sm font-black uppercase tracking-widest text-blue-600">
              Practice With Real-World Problems
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
              15+ system design examples
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Learn how the core concepts can be applied to familiar
              large-scale applications and common system-design problems.
            </p>

          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {examples.map((example) => (

              <div
                key={example.number}
                className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >

                <div className="flex items-center justify-between">

                  <span className="text-xs font-black text-blue-600">
                    CASE STUDY {example.number}
                  </span>

                  <span className="text-slate-300">
                    ↗
                  </span>

                </div>

                <h3 className="mt-5 text-xl font-black text-slate-950">
                  {example.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {example.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">

                  {example.tags.map((tag) => (

                    <span
                      key={tag}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
                    >
                      {tag}
                    </span>

                  ))}

                </div>

              </div>

            ))}

          </div>

          <p className="mt-7 text-center text-xs leading-5 text-slate-400">
            Named platforms are used as educational system-design case
            studies. This material does not claim to represent proprietary
            internal architectures of those companies.
          </p>

        </div>

      </section>

      {/* ============================================================
          SYSTEM DESIGN PROCESS
      ============================================================ */}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

        <div className="mx-auto max-w-3xl text-center">

          <p className="text-sm font-black uppercase tracking-widest text-blue-600">
            Learn The Process
          </p>

          <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            How to approach an HLD interview question
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Learn a structured process instead of randomly drawing boxes and
            choosing technologies.
          </p>

        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">

          {process.map((item) => (

            <div
              key={item.number}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >

              <span className="text-sm font-black text-blue-600">
                {item.number}
              </span>

              <h3 className="mt-4 font-black text-slate-950">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {item.description}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* ============================================================
          TECHNOLOGIES
      ============================================================ */}

      <section className="bg-blue-50/60 py-14 sm:py-20">

        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">

          <p className="text-sm font-black uppercase tracking-widest text-blue-600">
            Architecture Building Blocks
          </p>

          <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            Understand where the technologies fit
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            System design isn't about memorizing technology names. It's about
            understanding what problem each component solves.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">

            {[
              "Redis",
              "Kafka",
              "SQL",
              "NoSQL",
              "Load Balancer",
              "CDN",
              "API Gateway",
              "Microservices",
              "Message Queue",
              "Replication",
              "Sharding",
              "Caching",
              "Object Storage",
              "WebSockets",
              "Rate Limiter",
              "Service Discovery",
              "Circuit Breaker",
              "Monitoring",
              "Logging",
              "Distributed Tracing",
              "Authentication",
              "Authorization",
            ].map((technology) => (

              <span
                key={technology}
                className="rounded-xl border border-blue-100 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm"
              >
                {technology}
              </span>

            ))}

          </div>

        </div>

      </section>

      {/* ============================================================
          FAQ
      ============================================================ */}

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">

        <div className="text-center">

          <p className="text-sm font-black uppercase tracking-widest text-blue-600">
            FAQ
          </p>

          <h2 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">
            Frequently asked questions
          </h2>

        </div>

        <div className="mt-10 space-y-3">

          {faqs.map((faq, index) => {

            const isOpen = openFaq === index;

            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >

                <button
                  onClick={() => toggleFaq(index)}
                  className="flex w-full min-w-0 items-start justify-between gap-3 px-4 py-4 text-left sm:items-center sm:gap-5 sm:px-5 sm:py-5"
                >

                  <span className="min-w-0 break-words pr-2 text-sm font-bold leading-6 text-slate-900 sm:text-base">
                    {faq.question}
                  </span>

                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>

                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 px-4 pb-5 pt-4 text-sm leading-7 text-slate-500 sm:px-5">
                    {faq.answer}
                  </div>
                )}

              </div>
            );

          })}

        </div>

      </section>

      {/* ============================================================
          FINAL PURCHASE SECTION
      ============================================================ */}

      <section className="px-4 pb-14 sm:px-6 sm:pb-20">

        <div className="mx-auto max-w-5xl rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 text-center sm:p-12">

          {discount > 0 && (
            <div className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-black text-blue-700">
              {discount}% OFF • Limited Time Deal
            </div>
          )}

          <h2 className="mt-5 text-3xl font-black text-slate-950 sm:text-4xl">
            Start learning system design today.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            Build your HLD fundamentals, understand scalable architecture and
            learn how distributed systems handle growing traffic and failures.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">

            <span className="text-4xl font-black text-blue-600">
              {formatMoney(currentPrice)}
            </span>

            {mrp > currentPrice && (
              <span className="text-xl text-slate-400 line-through">
                {formatMoney(mrp)}
              </span>
            )}

          </div>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!product?._id}
            className="mt-7 w-full rounded-2xl bg-blue-600 px-6 py-4 font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-10"
          >
            Instant Buy Now →
          </button>

          {/* SMALL SUPPORT / REFUND */}

          <div className="mt-5 text-[11px] leading-5 text-slate-400">

            <p>
              This is a digital PDF product and is non-refundable after
              successful purchase.
            </p>

            <p>
              For any help, contact{" "}
              <a
                href="mailto:supporttargettrek@gmail.com"
                className="font-semibold text-slate-500 hover:text-blue-600"
              >
                supporttargettrek@gmail.com
              </a>
            </p>

          </div>

        </div>

      </section>

      {/* ============================================================
          SMALL BOTTOM NOTICE
      ============================================================ */}

      <PayUCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        product={product}
      />

      <div className="border-t border-slate-200 bg-white px-4 py-7 text-center sm:px-6">

        <p className="text-xs leading-6 text-slate-400">
          Mastering System Design — High-Level Design
          <span className="mx-2">•</span>
          Digital PDF
          <span className="mx-2">•</span>
          Non-refundable digital product
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Support:{" "}
          <a
            href="mailto:supporttargettrek@gmail.com"
            className="hover:text-blue-600"
          >
            supporttargettrek@gmail.com
          </a>
        </p>

      </div>

    </div>
  );
};

export default SystemDesignHLD;