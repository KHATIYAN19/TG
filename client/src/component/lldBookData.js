/*
  MASTERING SYSTEM DESIGN: LLD (JAVA) — the words and lists on /book/system-design/lld.
  Kept apart from the page so the page, the FAQ schema and the curriculum schema always say the same thing.
*/
import { BookOpen, Clock, Code, FlowArrow, LockKey, Network, ShieldCheck, Sparkle, Stack } from "@phosphor-icons/react";

export const modules = [
  { number: "01", title: "LLD & interview foundations", detail: "Design trade-offs, requirements, class ownership, interview evaluation and incremental modeling.", icon: BookOpen },
  { number: "02", title: "Core and modern Java", detail: "Types, memory, interfaces, collections, generics, functional Java, exceptions and validation.", icon: Code },
  { number: "03", title: "Object-oriented programming", detail: "Encapsulation, abstraction, polymorphism, inheritance, composition, identity and dependency injection.", icon: Stack },
  { number: "04", title: "UML and engineering diagrams", detail: "Class, sequence, activity, state and architecture diagrams, plus Mermaid and PlantUML.", icon: Network },
  { number: "05", title: "Software design principles", detail: "SOLID, DRY, KISS, YAGNI, GRASP, code smells and safe refactoring.", icon: ShieldCheck },
  { number: "06", title: "23 GoF design patterns", detail: "Creational, structural and behavioral patterns, selection guidelines and combined applications.", icon: Sparkle },
  { number: "07", title: "Enterprise architecture patterns", detail: "Layered and clean architecture, domain-driven design, events, messaging and resilience patterns.", icon: FlowArrow },
  { number: "08", title: "Java multithreading", detail: "Thread lifecycle, Executor framework, CompletableFuture, Java Memory Model and advanced concurrency.", icon: Clock },
  { number: "09", title: "Synchronization and locking", detail: "Race conditions, intrinsic/explicit locks, atomics, deadlocks and distributed consistency.", icon: LockKey },
  { number: "10", title: "Data structures for LLD", detail: "Choose efficient collections, build reusable in-memory components and analyze performance.", icon: Code },
  { number: "11", title: "APIs, databases and Spring Boot", detail: "REST contracts, persistence, JPA/Hibernate, clean architecture, security and observability.", icon: Network },
  { number: "12", title: "Testing and production engineering", detail: "Unit, integration and concurrency testing, maintainability, quality and production readiness.", icon: ShieldCheck },
  { number: "13", title: "60-minute interview framework", detail: "Scope requirements, communicate diagrams, write core code and handle follow-up questions.", icon: Clock },
  { number: "14", title: "16 real-world LLD case studies", detail: "Booking, inventory, parking, notifications, rate limiting, payments and more with Java implementations.", icon: BookOpen },
];

export const FRAMEWORK_STEPS = [
  ["01", "Clarify requirements", "Identify scope, actors and core use cases."],
  ["02", "Find entities", "Extract nouns, domain objects and responsibilities."],
  ["03", "Define relationships", "Association, aggregation, composition and inheritance."],
  ["04", "Assign responsibilities", "Decide which class owns which behaviour."],
  ["05", "Identify changing parts", "Find areas likely to change independently."],
  ["06", "Apply principles", "Use SOLID, KISS, DRY and low coupling."],
  ["07", "Choose patterns", "Use patterns only where they solve a real problem."],
  ["08", "Handle concurrency", "Identify shared state and synchronisation needs."],
  ["09", "Write code", "Implement interfaces, classes and collaborations."],
  ["10", "Discuss tradeoffs", "Explain alternatives and why your design works."],
];

export const PATTERN_CUES = [
  ["Changing algorithm?", "Think Strategy."],
  ["Different object creation?", "Think Factory."],
  ["Multiple subscribers?", "Think Observer."],
  ["Additional behaviour?", "Think Decorator."],
  ["Many optional fields?", "Think Builder."],
  ["Different object states?", "Think State."],
  ["Incompatible external API?", "Think Adapter."],
  ["Multiple handlers?", "Think Chain of Responsibility."],
];

export const AUDIENCE = [
  ["Complete beginners", "Learn OOP, SOLID, relationships and design patterns from the ground up."],
  ["SDE 1 developers", "Build the foundation required for machine coding and LLD interviews."],
  ["SDE 2 developers", "Improve design thinking, extensibility and tradeoff discussions."],
  ["Backend engineers", "Turn business requirements into clean object oriented services."],
  ["Java developers", "See how object oriented design, patterns, concurrency and locking become clean Java."],
  ["Interview candidates", "Practice realistic LLD questions with a structured design process."],
];

export const QUESTION_SUMMARIES = [
  "Model cities, theatres, screens and show-specific seats. Explore temporary seat holds, booking states, category pricing and safe cancellation.",
  "Track product batches across warehouses, reserve stock during checkout, apply issuance policies and trigger low-stock notifications.",
  "Allocate compatible spaces across parking floors, issue tickets and calculate fees with interchangeable pricing policies.",
  "Coordinate email, SMS, push and in-app delivery with templates, preferences, priorities and bounded retry policies.",
  "Compare fixed window, sliding window log, sliding window counter, token bucket and leaky bucket algorithms with concurrent requests.",
  "Design named loggers, severity filters, pluggable appenders, formatters and synchronized writes.",
  "Model trains, routes, coaches and berths with booking states, cancellation rules and waitlist promotion.",
  "Separate future reservations from active rentals, validate date ranges and compose rental pricing with optional add-ons.",
  "Work with equal, exact and percentage splits, consistent rounding, balance sheets and debt settlement.",
  "Model matches, innings and ball events, update scoreboards and notify subscribers as play progresses.",
  "Compose eligibility rules and discount strategies with redemption limits, usage tracking and validation.",
  "Keep driver matching and fare calculation independent while managing ride states and driver availability.",
  "Model provider integrations, payment states, idempotent operations, retries and refunds through a common contract.",
  "Coordinate meeting participants, host permissions, chat and screen sharing through explicit collaboration rules.",
  "Manage carts, order states, inventory reservations, shipments, partial returns and refund calculations.",
  "Coordinate restaurant menus, preparation states, courier assignment, delivery fees and order tracking.",
];

export const patterns = {
  Creational: [
    {
      name: "Singleton",
      purpose:
        "Ensures that a class has only one instance and provides a controlled access point.",
      example: "Logger, Configuration Manager, Cache Manager",
      when: "When exactly one shared instance is required.",
    },
    {
      name: "Factory Method",
      purpose: "Creates objects without exposing the exact object creation logic to the client.",
      example: "Notification Factory, Payment Factory",
      when: "When object creation depends on runtime input.",
    },
    {
      name: "Abstract Factory",
      purpose: "Creates families of related objects without specifying their concrete classes.",
      example: "UI components, payment provider families",
      when: "When multiple related products must work together.",
    },
    {
      name: "Builder",
      purpose: "Constructs complex objects step by step.",
      example: "User, Car, HTTP Request, Pizza",
      when: "When an object has many optional parameters.",
    },
    {
      name: "Prototype",
      purpose: "Creates new objects by copying an existing object.",
      example: "Document templates, game objects",
      when: "When object creation is expensive or cloning is convenient.",
    },
  ],

  Structural: [
    {
      name: "Adapter",
      purpose: "Allows incompatible interfaces to work together.",
      example: "Third-party payment SDK adapter",
      when: "When an existing API does not match your application's interface.",
    },
    {
      name: "Bridge",
      purpose: "Separates abstraction from implementation so both can evolve independently.",
      example: "Notification type + delivery channel",
      when: "When two dimensions of a system change independently.",
    },
    {
      name: "Composite",
      purpose: "Treats individual objects and compositions of objects uniformly.",
      example: "File and Folder hierarchy",
      when: "When you have tree-like structures.",
    },
    {
      name: "Decorator",
      purpose: "Adds behavior dynamically without modifying the original class.",
      example: "Coffee toppings, logging, authorization",
      when: "When functionality needs to be layered dynamically.",
    },
    {
      name: "Facade",
      purpose: "Provides a simple interface over a complex subsystem.",
      example: "Order processing service",
      when: "When clients should not know subsystem complexity.",
    },
    {
      name: "Flyweight",
      purpose: "Shares common immutable state to reduce memory usage.",
      example: "Game objects, character rendering",
      when: "When thousands of similar objects exist.",
    },
    {
      name: "Proxy",
      purpose: "Provides a substitute or controlled access to another object.",
      example: "Caching proxy, authorization proxy",
      when: "When access needs to be controlled or enhanced.",
    },
  ],

  Behavioral: [
    {
      name: "Chain of Responsibility",
      purpose: "Passes a request through a chain of handlers.",
      example: "Authentication → Authorization → Validation",
      when: "When multiple handlers may process a request.",
    },
    {
      name: "Command",
      purpose: "Encapsulates a request as an object.",
      example: "Undo/redo, remote commands",
      when: "When operations need to be queued, logged or undone.",
    },
    {
      name: "Interpreter",
      purpose: "Defines a representation and interpreter for a language or grammar.",
      example: "Rule engines, expression evaluators",
      when: "When a simple domain-specific language is required.",
    },
    {
      name: "Iterator",
      purpose: "Provides sequential access to elements without exposing collection internals.",
      example: "Custom collection traversal",
      when: "When collections need standardized traversal.",
    },
    {
      name: "Mediator",
      purpose: "Centralizes communication between multiple objects.",
      example: "Chat room, air traffic control",
      when: "When many objects communicate directly and become tightly coupled.",
    },
    {
      name: "Memento",
      purpose: "Captures and restores an object's previous state.",
      example: "Undo functionality",
      when: "When object state needs checkpointing.",
    },
    {
      name: "Observer",
      purpose: "Notifies dependent objects when state changes.",
      example: "Notification system, stock updates",
      when: "When multiple subscribers depend on an event.",
    },
    {
      name: "State",
      purpose: "Changes object behavior when its internal state changes.",
      example: "Vending machine, order lifecycle",
      when: "When behavior varies significantly by state.",
    },
    {
      name: "Strategy",
      purpose: "Encapsulates interchangeable algorithms behind a common interface.",
      example: "Payment methods, coupon strategies",
      when: "When an algorithm can vary independently.",
    },
    {
      name: "Template Method",
      purpose:
        "Defines the skeleton of an algorithm while allowing subclasses to customize steps.",
      example: "Payment processing workflow",
      when: "When workflows share common steps.",
    },
    {
      name: "Visitor",
      purpose: "Adds operations to object structures without modifying their classes.",
      example: "Document processing, AST operations",
      when: "When many operations must be performed over a stable object structure.",
    },
  ],
};

export const designQuestions = [
  {
    company: "BookMyShow",
    title: "Movie Ticket Booking",
    focus: "Concurrency + Seat Locking",
    patterns: ["State", "Strategy", "Observer"],
    classes: "Movie, Theatre, Screen, Show, Seat, Booking, Payment, User",
  },
  {
    company: "Zepto",
    title: "Inventory Management",
    focus: "Inventory + concurrency",
    patterns: ["Strategy", "Observer", "Factory Method"],
    classes: "Product, Inventory, Warehouse, StockItem, Order, Reservation",
  },
  {
    company: "Parking System",
    title: "Parking Lot",
    focus: "Object modeling + pricing",
    patterns: ["Strategy", "Factory Method", "State"],
    classes: "ParkingLot, Floor, Spot, Vehicle, Ticket, PricingStrategy",
  },
  {
    company: "Notification Platform",
    title: "Notification System",
    focus: "Multiple channels",
    patterns: ["Factory", "Strategy", "Observer"],
    classes: "Notification, Channel, Template, UserPreference, NotificationDispatcher",
  },
  {
    company: "API Platform",
    title: "Rate Limiter",
    focus: "Algorithms + thread safety",
    patterns: ["Strategy", "Factory Method"],
    classes: "RateLimiter, Algorithm, TokenBucket, SlidingWindow, Client",
  },
  {
    company: "Logging Platform",
    title: "Logger",
    focus: "Thread safety + extensibility",
    patterns: ["Singleton", "Chain of Responsibility", "Strategy"],
    classes: "Logger, LogLevel, LogHandler, ConsoleAppender, FileAppender",
  },
  {
    company: "IRCTC",
    title: "Train Reservation System",
    focus: "Booking + state transitions",
    patterns: ["State", "Strategy", "Observer"],
    classes: "Train, Station, Route, Coach, Seat, Passenger, Booking",
  },
  {
    company: "Zoomcar",
    title: "Car Rental System",
    focus: "Vehicle availability + pricing",
    patterns: ["Strategy", "State", "Factory"],
    classes: "Vehicle, Car, Customer, Rental, Location, PricingStrategy",
  },
  {
    company: "Splitwise",
    title: "Expense Sharing",
    focus: "Strategy + domain modeling",
    patterns: ["Strategy", "Factory Method"],
    classes: "User, Expense, Split, Group, Balance, SplitStrategy",
  },
  {
    company: "Cricbuzz",
    title: "Live Cricket Score",
    focus: "Real-time updates",
    patterns: ["Observer", "State", "Strategy"],
    classes: "Match, Innings, Ball, Score, Subscriber, ScoreBoard",
  },
  {
    company: "Coupon Engine",
    title: "Coupon Application",
    focus: "Business rules",
    patterns: ["Strategy", "Chain of Responsibility", "Factory"],
    classes: "Coupon, Cart, DiscountStrategy, EligibilityRule, CouponEngine",
  },
  {
    company: "Uber",
    title: "Ride Booking",
    focus: "Matching + pricing",
    patterns: ["Strategy", "Observer", "State"],
    classes: "Rider, Driver, Ride, Location, PricingStrategy, MatchingStrategy",
  },
  {
    company: "Payment Platform",
    title: "Payment Gateway",
    focus: "Multiple providers",
    patterns: ["Adapter", "Factory", "Strategy"],
    classes: "Payment, PaymentGateway, PaymentProvider, Transaction, PaymentFactory",
  },
  {
    company: "Video Conferencing",
    title: "Zoom-like Meeting System",
    focus: "Meeting lifecycle",
    patterns: ["State", "Observer", "Mediator"],
    classes: "Meeting, Participant, Host, Room, Chat, MeetingState",
  },
  {
    company: "E-commerce",
    title: "Order Management",
    focus: "Order lifecycle",
    patterns: ["State", "Observer", "Command"],
    classes: "Order, OrderItem, Payment, Shipment, OrderState, Notification",
  },
  {
    company: "Food Delivery",
    title: "Food Delivery System",
    focus: "Dispatch + pricing",
    patterns: ["Strategy", "Observer", "State"],
    classes: "Restaurant, Menu, Order, DeliveryPartner, DispatchStrategy",
  },
];

export const principles = [
  {
    title: "Single Responsibility",
    short: "One class should have one reason to change.",
  },
  {
    title: "Open / Closed",
    short: "Open for extension, closed for modification.",
  },
  {
    title: "Liskov Substitution",
    short: "Subtypes should remain substitutable for their base types.",
  },
  {
    title: "Interface Segregation",
    short: "Prefer focused interfaces over large interfaces.",
  },
  {
    title: "Dependency Inversion",
    short: "High-level logic should depend on abstractions.",
  },
  {
    title: "KISS",
    short: "Keep the design simple unless complexity provides real value.",
  },
  {
    title: "DRY",
    short: "Avoid duplicating business logic and knowledge.",
  },
  {
    title: "YAGNI",
    short: "Do not build functionality before there is a real requirement.",
  },
  {
    title: "Composition over Inheritance",
    short: "Prefer composing behavior when inheritance creates unnecessary coupling.",
  },
  {
    title: "Program to Interfaces",
    short: "Depend on contracts rather than concrete implementations.",
  },
  {
    title: "High Cohesion",
    short: "Keep closely related responsibilities together.",
  },
  {
    title: "Low Coupling",
    short: "Minimize unnecessary dependencies between components.",
  },
];

export const faqItems = [
  { q: "What is covered in the LLD book?", a: "The book spans 14 parts: LLD foundations, Java language and OOP, UML, SOLID/GRASP, all 23 GoF patterns, enterprise and event-driven patterns, multithreading, locking, data structures, APIs, persistence, Spring Boot, security, testing, a 60-minute interview framework and 16 real-world design case studies." },
  { q: "Does it include complete Java code for design problems?", a: "Yes. The case studies include UML class diagrams, Java implementations and runnable driver scenarios for problems such as movie tickets, parking, inventory, notifications and rate limiting." },
  { q: "Does it cover Spring Boot, databases and backend architecture?", a: "Yes. Dedicated chapters cover API design, database and persistence modeling, JPA/Hibernate, clean architecture with Java and Spring Boot, security, resilience and observability. Interview exercises can still focus on in-memory design where appropriate." },
  { q: "Are concurrency and locking explained?", a: "Yes. The book covers Java threads, executors, CompletableFuture, the Java Memory Model, locks, atomic operations, deadlocks, concurrent collections and related consistency issues." },
  { q: "What is the difference between LLD and HLD?", a: "LLD answers how one component is built: classes, interfaces, relationships, SOLID principles, design patterns and working code. HLD answers how a whole system scales: services, databases, caching, messaging and consistency. This page covers LLD; the HLD book and an HLD + LLD combo are linked on this page." },
  { q: "Can I preview before buying?", a: "Yes. Real sample pages from the book are on this page. Read them right here, page by page, with no download or sign-up." },
  { q: "How does checkout work?", a: "Pay once through our secure payment partner. The ebook is a digital PDF that you can read on your phone, tablet or laptop." },
  { q: "Is this a physical book?", a: "No. This is a digital PDF ebook." },
  { q: "Is the digital purchase refundable?", a: "No. Digital ebook purchases are non-refundable after successful payment." },
  { q: "How can I contact support?", a: "Email supporttargettrek@gmail.com for purchase or ebook support." },
];
