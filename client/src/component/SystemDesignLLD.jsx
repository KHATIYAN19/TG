/* eslint-disable react/prop-types */
import API_BASE_URL from "../utils/Url";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Helmet } from "react-helmet-async";
import { Document, Page, pdfjs } from "react-pdf";
import lldPreviewPdf from "../assest/master_lld_java_preview.pdf";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Code,
  DownloadSimple,
  FileText,
  FlowArrow,
  Lock,
  LockKey,
  Network,
  ShieldCheck,
  Sparkle,
  Stack,
} from "@phosphor-icons/react";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { gatewayLabel, preferredGateway } from "../payment/gatewayConfig";
import { trackViewContent } from "../lib/metaPixel.js";
import {
  AnimatePresence,
  BookOfferCard,
  Breadcrumb,
  BuyBar,
  EASE,
  FLOAT_EASE,
  FONT_HREF,
  FaqList,
  FinalCta,
  FloatChip,
  FloatNav,
  PillTabs,
  PriceSkeleton,
  Reveal,
  ScrollProgress,
  Section,
  SectionHeader,
  SkipLink,
  StatsStrip,
  TaglineReveal,
  Tilt,
  cx,
  motion,
  twoDigits,
  useGoToSection,
  useInViewport,
  useNavOffset,
  useReducedMotion,
  useSiteTheme,
} from "./systemDesign/ui.jsx";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();
const SITE_NAME = "Target Trek";
const SITE_URL = "https://www.targettrek.in";
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const BASE_URL = API_BASE_URL;
// Title <= 60 chars and description <= 160 chars so SERP snippets are not truncated.
const SEO_TITLE = "Java LLD Book: 23 Patterns & 16 Case Studies | Target Trek";
const SEO_DESCRIPTION =
  "Low-Level Design in Java: OOP, UML, SOLID, 23 GoF patterns, Spring Boot, concurrency, a 60-minute interview framework and 16 coded case studies. PDF ebook.";
const SEO_LONG_DESCRIPTION =
  "Master Low-Level Design with Java, OOP, UML, SOLID, 23 GoF patterns, Spring Boot, APIs, persistence, concurrency, testing, a 60-minute interview framework and 16 coded case studies.";
const PAGE_PATH = "/book/system-design/lld";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const HLD_REDIRECT_URL = "/book/system-design/hld";
const COMBO_REDIRECT_URL = "/book/system-design/hld-lld/combo";

const modules = [
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

const faqItems = [
  { q: "What is covered in the updated LLD book?", a: "The book spans 14 parts: LLD foundations, Java language and OOP, UML, SOLID/GRASP, all 23 GoF patterns, enterprise and event-driven patterns, multithreading, locking, data structures, APIs, persistence, Spring Boot, security, testing, a 60-minute interview framework and 16 real-world design case studies." },
  { q: "Does it include complete Java code for design problems?", a: "Yes. The case-study contents include UML class diagrams, implementations and executable driver scenarios for problems such as movie tickets, parking, inventory, notifications and rate limiting." },
  { q: "Does it cover Spring Boot, databases and backend architecture?", a: "Yes. Dedicated chapters cover API design, database and persistence modeling, JPA/Hibernate, clean architecture with Java and Spring Boot, security, resilience and observability. Individual interview exercises can still focus on in-memory design where appropriate." },
  { q: "Are concurrency and locking explained?", a: "Yes. The book covers Java threads, executors, CompletableFuture, the Java Memory Model, locks, atomic operations, deadlocks, concurrent collections and related consistency issues." },
  { q: "Can I preview before purchasing?", a: "Yes. Click Preview the book near the top of the page to jump to the embedded, read-only PDF sample." },
  { q: "How does checkout work?", a: "The price is loaded from the Target Trek backend. Purchasing opens the existing checkout modal with the product returned by the API." },
];

const flowSteps = [
  { n: "01", title: "Clarify", text: "Functional and non-functional requirements" },
  { n: "02", title: "Model", text: "Entities, responsibilities and invariants" },
  { n: "03", title: "Diagram", text: "Relationships, class and state flow" },
  { n: "04", title: "Choose", text: "Principles and patterns that fit" },
  { n: "05", title: "Code", text: "Core Java classes and behavior" },
  { n: "06", title: "Validate", text: "Concurrency, edge cases and trade-offs" },
];

/* ------------------------------------------------------------------ */
/*  Page copy                                                          */
/* ------------------------------------------------------------------ */

// Same source the checkout modal uses (VITE_BOOKS_PAYMENT_GATEWAY, then
// VITE_PAYMENT_GATEWAY).
const PAYMENT_PROVIDER_NAME = gatewayLabel(preferredGateway("books"));

const NAV_LINKS = [
  { href: "#more-books", label: "HLD and combo" },
  { href: "#curriculum", label: "Curriculum" },
  { href: "#preview", label: "Free preview" },
  { href: "#patterns", label: "23 patterns" },
  { href: "#code", label: "Java code" },
  { href: "#problems", label: "Case studies" },
  { href: "#faq", label: "FAQ" },
];

const TAGLINE =
  "Anyone can name a design pattern. Few can explain why this class owns that behaviour. This book trains that judgment in Java.";

const FLOW_ICONS = [BookOpen, Stack, Network, Sparkle, Code, ShieldCheck];

const WHY_POINTS = [
  "Convert requirements into classes and responsibilities",
  "Identify relationships between objects",
  "Choose composition or inheritance correctly",
  "Recognise when a design pattern actually helps",
  "Handle changing business requirements",
  "Design for concurrency and thread safety",
  "Write clean, testable and extensible code",
  "Explain your design clearly during interviews",
];

const MINDSET = [
  ["01", "Understand", "What exactly does the system need to do?"],
  ["02", "Identify", "What are the entities, responsibilities and relationships?"],
  ["03", "Model", "How should classes collaborate?"],
  ["04", "Choose", "Which principle or pattern solves the design problem?"],
  ["05", "Code", "Convert the design into a clean implementation."],
];

const UML_BOXES = [
  { name: "Show", fields: ["id", "movie · screen · time"], link: "1 to many" },
  { name: "ShowSeat", fields: ["seatId · category", "status: AVAILABLE / LOCKED / BOOKED"], link: "held by" },
  { name: "Booking", fields: ["userId · seats", "status · holdExpiry"] },
];

const OOP_PILLARS = [
  ["Encapsulation", "Keep state and behaviour together while controlling access."],
  ["Abstraction", "Expose what the object does without exposing unnecessary implementation."],
  ["Inheritance", "Reuse and specialise behaviour where an is-a relationship genuinely exists."],
  ["Polymorphism", "Allow different implementations to be used through a common contract."],
];

const PATTERN_KIND = {
  Creational: "Object creation",
  Structural: "Object composition",
  Behavioral: "Object behaviour",
};

const PATTERN_CUES = [
  ["Changing algorithm?", "Think Strategy."],
  ["Different object creation?", "Think Factory."],
  ["Multiple subscribers?", "Think Observer."],
  ["Additional behaviour?", "Think Decorator."],
  ["Many optional fields?", "Think Builder."],
  ["Different object states?", "Think State."],
  ["Incompatible external API?", "Think Adapter."],
  ["Multiple handlers?", "Think Chain of Responsibility."],
];

const FUNCTIONAL = [
  "Create a booking",
  "Cancel a booking",
  "Reserve a seat",
  "Send a notification",
  "Apply a coupon",
  "Process a payment",
  "Update inventory",
  "Calculate a fare",
];

const NON_FUNCTIONAL = [
  "Concurrency",
  "Thread safety",
  "Performance",
  "Scalability",
  "Reliability",
  "Maintainability",
  "Extensibility",
  "Testability",
  "Security",
  "Availability",
];

const CONCURRENCY_TOPICS = [
  "Race conditions",
  "Critical sections",
  "Mutex",
  "Synchronized blocks",
  "Read and write locks",
  "Atomic operations",
  "Deadlocks",
  "Thread safety",
  "Optimistic locking",
  "Pessimistic locking",
];

const FRAMEWORK_STEPS = [
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

const INSIDE_TOPICS = [
  "OOP fundamentals",
  "Classes and objects",
  "Association",
  "Aggregation",
  "Composition",
  "Inheritance",
  "Polymorphism",
  "Interfaces",
  "Abstract classes",
  "SOLID",
  "KISS",
  "DRY",
  "YAGNI",
  "Coupling",
  "Cohesion",
  "Composition vs inheritance",
  "All 23 GoF patterns",
  "UML thinking",
  "Class relationships",
  "Concurrency",
  "Thread safety",
  "Locking",
  "Race conditions",
  "Deadlocks",
  "Functional requirements",
  "Non functional requirements",
  "Design tradeoffs",
  "Machine coding",
  "16 real world systems",
  "Java",
];

const INTERVIEW_QUESTIONS = [
  "Why did you create this interface?",
  "Why Strategy instead of inheritance?",
  "Why Factory instead of new?",
  "Where would you use Observer?",
  "What happens if two threads access this object?",
  "Where is the critical section?",
  "How would you make this design extensible?",
  "What changes if another payment provider is added?",
  "What happens if a new notification channel is introduced?",
  "How would you test this design?",
  "What is the responsibility of each class?",
  "Which part of the design is likely to change?",
];

const AUDIENCE = [
  ["Complete beginners", "Learn OOP, SOLID, relationships and design patterns from the ground up."],
  ["SDE 1 developers", "Build the foundation required for machine coding and LLD interviews."],
  ["SDE 2 developers", "Improve design thinking, extensibility and tradeoff discussions."],
  ["Backend engineers", "Turn business requirements into clean object oriented services."],
  ["Java developers", "See how object oriented design, patterns, concurrency and locking become clean Java."],
  ["Interview candidates", "Practice realistic LLD questions with a structured design process."],
];

const LEARNING_PATH = [
  ["01", "OOP", "Classes, objects, inheritance, abstraction and polymorphism."],
  ["02", "Principles", "SOLID, KISS, DRY, YAGNI, coupling and cohesion."],
  ["03", "Patterns", "All three pattern families and 23 GoF patterns."],
  ["04", "Concurrency", "Threads, locks, race conditions and thread safe design."],
  ["05", "Real systems", "16 practical LLD interview problems."],
];
const QUESTION_SUMMARIES = [
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

  const patterns = {
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

  const designQuestions = [
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

  const codeExamples = {
    Factory: `interface Payment {
    void pay(double amount);
}

class CardPayment implements Payment {
    public void pay(double amount) {
        System.out.println("Card: " + amount);
    }
}

class PaymentFactory {
    static Payment create(String type) {
        if (type.equals("CARD"))
            return new CardPayment();

        throw new IllegalArgumentException("Unknown type");
    }
}

Payment payment = PaymentFactory.create("CARD");
payment.pay(999);`,
    Strategy: `interface PricingStrategy {
    double calculate(double amount);
}

class NormalPricing implements PricingStrategy {
    public double calculate(double amount) {
        return amount;
    }
}

class DiscountPricing implements PricingStrategy {
    public double calculate(double amount) {
        return amount * 0.9;
    }
}

class Order {
    private PricingStrategy strategy;

    Order(PricingStrategy strategy) {
        this.strategy = strategy;
    }

    double getPrice(double amount) {
        return strategy.calculate(amount);
    }
}`,
    Observer: `interface Observer {
    void update(String message);
}

class User implements Observer {
    public void update(String message) {
        System.out.println(message);
    }
}

class NotificationDispatcher {
    private List<Observer> users = new ArrayList<>();

    void subscribe(Observer user) {
        users.add(user);
    }

    void notifyUsers(String message) {
        for (Observer user : users)
            user.update(message);
    }
}`,
    Builder: `class User {
    private String name;
    private String email;
    private int age;

    static class Builder {
        private String name;
        private String email;
        private int age;

        Builder name(String value) {
            name = value;
            return this;
        }

        Builder email(String value) {
            email = value;
            return this;
        }

        Builder age(int value) {
            age = value;
            return this;
        }

        User build() {
            User user = new User();
            user.name = name;
            user.email = email;
            user.age = age;
            return user;
        }
    }
}`,
    Locking: `class Inventory {
    private final Object lock = new Object();
    private int stock = 10;

    boolean reserve(int quantity) {
        synchronized (lock) {
            if (quantity <= 0 || stock < quantity)
                return false;

            stock -= quantity;
            return true;
        }
    }
}`,
  };

  const codeTabs = [
    ["Factory", "Factory Pattern"],
    ["Strategy", "Strategy Pattern"],
    ["Observer", "Observer Pattern"],
    ["Builder", "Builder Pattern"],
    ["Locking", "Thread-Safe Locking"],
  ];

  const principles = [
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

export default function SystemDesignLLD() {
  const reduceMotion = useReducedMotion();
  const theme = useSiteTheme();
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");
  const [hldProduct, setHldProduct] = useState(null);
  const [comboProduct, setComboProduct] = useState(null);
  const [loadingHldProduct, setLoadingHldProduct] = useState(true);
  const [hldProductError, setHldProductError] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);

  // Sticky buy bar: on tablet and up it appears once the hero scrolls away.
  const heroRef = useRef(null);
  const heroVisible = useInViewport(heroRef);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referralCode = (params.get("referralCode") || params.get("ref") || "").trim();
    if (referralCode) window.localStorage.setItem("referralCode", referralCode);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        setProductError("");
        const redirectUrl = window.location.pathname;
        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(redirectUrl)}`,
          {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          },
        );
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.success || !result?.data) {
          throw new Error(
            result?.error?.message ||
              result?.message ||
              "Unable to load the current product details.",
          );
        }
        setProduct(result.data);
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("Failed to fetch LLD product:", error);
        setProduct(null);
        setProductError(error?.message || "Unable to load the current product details.");
      } finally {
        if (!controller.signal.aborted) setLoadingProduct(false);
      }
    };
    fetchProduct();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchHldProduct = async () => {
      try {
        setLoadingHldProduct(true);
        setHldProductError("");
        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(HLD_REDIRECT_URL)}`,
          {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          },
        );
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.success || !result?.data) {
          throw new Error(
            result?.error?.message ||
              result?.message ||
              "Unable to load the HLD book details.",
          );
        }
        setHldProduct(result.data);
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("Failed to fetch HLD product:", error);
        setHldProduct(null);
        setHldProductError(error?.message || "Unable to load the HLD book details.");
      } finally {
        if (!controller.signal.aborted) setLoadingHldProduct(false);
      }
    };
    fetchHldProduct();
    return () => controller.abort();
  }, []);

  // The bundle is optional: only an active and valid backend product is rendered.
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(COMBO_REDIRECT_URL)}`,
          { method: "GET", cache: "no-store", headers: { Accept: "application/json" }, signal: controller.signal },
        );
        const result = await response.json().catch(() => null);
        const item = result?.data;
        const amount = Number(item?.price);
        if (response.ok && result?.success === true && item?._id && item.isActive !== false &&
            item.price !== null && item.price !== undefined && item.price !== "" && Number.isFinite(amount) && amount >= 0) {
          if (!controller.signal.aborted) setComboProduct(item);
        } else if (!controller.signal.aborted) setComboProduct(null);
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.warn("Optional HLD + LLD bundle unavailable:", error);
          if (!controller.signal.aborted) setComboProduct(null);
        }
      }
    })();
    return () => controller.abort();
  }, []);

  // Meta Pixel: real catalog price, fired after product API resolves.
  // The helper returns false if Pixel is unavailable.
  const trackedViewRef = useRef(null);
  useEffect(() => {
    if (!product?._id || product.price == null) return;
    const amount = Number(product.price);
    if (!Number.isFinite(amount) || amount < 0) return;
    const key = `${product._id}:${amount}:${product.currency || "INR"}`;
    if (trackedViewRef.current === key) return;
    const sent = trackViewContent({
      id: String(product._id),
      title: product.title || "Mastering System Design — LLD (Java)",
      price: amount,
      currency: product.currency || "INR",
    });
    if (sent !== false) trackedViewRef.current = key;
  }, [product?._id, product?.title, product?.price, product?.currency]);

  const currency = product?.currency || "INR";
  const currentPrice = Number(product?.price);
  const validPrice =
    product?.price != null &&
    product.price !== "" &&
    Number.isFinite(currentPrice) &&
    currentPrice >= 0;
  const mrp = Number(product?.mrp ?? 0);
  const discount =
    mrp > currentPrice && mrp > 0 ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0;
  const formatMoney = (amount, currencyCode = currency) => {
    const locale =
      { INR: "en-IN", USD: "en-US", GBP: "en-GB", EUR: "en-IE", AUD: "en-AU", CAD: "en-CA" }[
        currencyCode
      ] || "en";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: Number.isInteger(Number(amount)) ? 0 : 2,
      }).format(Number(amount || 0));
    } catch {
      return `${currencyCode} ${Number(amount || 0)}`;
    }
  };
  const canBuy =
    !loadingProduct &&
    !productError &&
    validPrice &&
    Boolean(product?._id) &&
    product?.isActive !== false;
  const hldCurrency = hldProduct?.currency || "INR";
  const hldCurrentPrice = Number(hldProduct?.price);
  const hldValidPrice =
    hldProduct?.price != null &&
    hldProduct.price !== "" &&
    Number.isFinite(hldCurrentPrice) &&
    hldCurrentPrice >= 0;
  const hldMrp = Number(hldProduct?.mrp ?? 0);
  const hldCanBuy =
    !loadingHldProduct &&
    !hldProductError &&
    hldValidPrice &&
    Boolean(hldProduct?._id) &&
    hldProduct?.isActive !== false;
  const hldCoverImage =
    hldProduct?.coverpageurl || hldProduct?.coverPageUrl || hldProduct?.cover_page_url || "";
  const comboPrice = Number(comboProduct?.price);
  const comboMrp = Number(comboProduct?.mrp ?? 0);
  const comboCoverImage = comboProduct?.coverPageUrl || comboProduct?.coverpageurl || comboProduct?.cover_page_url || "";
  const openComboCheckout = () => {
    if (!comboProduct) return;
    setCheckoutProduct(comboProduct);
    setCheckoutOpen(true);
  };
  const openCheckout = () => {
    if (!canBuy) return;
    setCheckoutProduct(product);
    setCheckoutOpen(true);
  };
  const openHldCheckout = () => {
    if (!hldCanBuy) return;
    setCheckoutProduct(hldProduct);
    setCheckoutOpen(true);
  };
  const supportEmail = SUPPORT_EMAIL;
  const canonicalUrl = PAGE_URL;

  const productName = product?.title || "Mastering System Design — Low-Level Design in Java";

  const seoImage = product?.coverpageurl || product?.coverPageUrl || product?.cover_page_url || "";

  const productSchema = {
    "@type": "Product",
    "@id": `${canonicalUrl}#product`,
    name: productName,
    description: SEO_LONG_DESCRIPTION,
    url: canonicalUrl,
    category: "Low-Level Design Java Ebook",
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    ...(product?._id ? { sku: String(product._id) } : {}),
    ...(seoImage ? { image: [seoImage] } : {}),
    ...(canBuy
      ? {
          offers: {
            "@type": "Offer",
            url: canonicalUrl,
            price: currentPrice,
            priceCurrency: currency,
            priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
            },
            seller: {
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
            },
          },
        }
      : {}),
  };

  const bookSchema = {
    "@type": "Book",
    "@id": `${canonicalUrl}#book`,
    name: productName,
    description: SEO_DESCRIPTION,
    url: canonicalUrl,
    bookFormat: "https://schema.org/EBook",
    inLanguage: product?.language || "English",
    ...(product?.edition ? { bookEdition: product.edition } : {}),
    ...(seoImage ? { image: seoImage } : {}),
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        email: supportEmail,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: SEO_TITLE,
        description: SEO_DESCRIPTION,
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        about: {
          "@id": `${canonicalUrl}#book`,
        },
        ...(seoImage
          ? {
              primaryImageOfPage: {
                "@type": "ImageObject",
                url: seoImage,
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
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
            name: "Books",
            item: `${SITE_URL}/books`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "System Design LLD in Java",
            item: canonicalUrl,
          },
        ],
      },
      bookSchema,
      productSchema,
      {
        "@type": "ItemList",
        "@id": `${canonicalUrl}#curriculum`,
        name: "14-part curriculum of the Java LLD handbook",
        numberOfItems: modules.length,
        itemListElement: modules.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.title,
          description: item.detail,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        mainEntity: faqItems.map(({ q: question, a: answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: {
            "@type": "Answer",
            text: answer,
          },
        })),
      },
    ],
  };

  const seoHead = (
    <Helmet htmlAttributes={{ lang: "en" }}>
      <title>{SEO_TITLE}</title>
      <meta name="description" content={SEO_DESCRIPTION} />
      <meta
        name="keywords"
        content="low level design Java, LLD interview preparation, system design LLD, Java OOP, SOLID principles, UML diagrams, Java design patterns, GoF design patterns, concurrency, locking, BookMyShow LLD, parking lot LLD, Splitwise LLD, TargetTrek"
      />
      <meta name="author" content={SITE_NAME} />
      <meta name="application-name" content={SITE_NAME} />
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <meta
        name="googlebot"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <meta name="theme-color" content={theme === "dark" ? "#000000" : "#ffffff"} />
      <meta name="color-scheme" content={theme === "dark" ? "dark light" : "light dark"} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en-IN" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      {seoImage && <link rel="preload" as="image" href={seoImage} />}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href={FONT_HREF} rel="stylesheet" />
      <meta property="og:type" content="product" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={SEO_TITLE} />
      <meta property="og:description" content={SEO_DESCRIPTION} />
      <meta property="og:url" content={canonicalUrl} />
      {seoImage && <meta property="og:image" content={seoImage} />}
      {seoImage && <meta property="og:image:alt" content={`${productName} ebook cover`} />}
      {canBuy && (
        <meta property="product:price:amount" content={String(currentPrice)} />
      )}
      {canBuy && <meta property="product:price:currency" content={currency} />}
      <meta name="twitter:card" content={seoImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={SEO_TITLE} />
      <meta name="twitter:description" content={SEO_DESCRIPTION} />
      {seoImage && <meta name="twitter:image" content={seoImage} />}
      {seoImage && <meta name="twitter:image:alt" content={`${productName} ebook cover`} />}
      <script type="application/ld+json">
        {JSON.stringify(structuredData).replace(/</g, "\\u003c")}
      </script>
    </Helmet>
  );

  /* ---------------------------------------------------------------- */
  /*  Presentation                                                     */
  /* ---------------------------------------------------------------- */

  const rootRef = useRef(null);
  useNavOffset(rootRef);
  const goTo = useGoToSection();
  const goToPreview = (event) => goTo(event, "#preview");

  const priceKnown = !loadingProduct && !productError && validPrice;
  const priceNode = loadingProduct ? <PriceSkeleton /> : priceKnown ? formatMoney(currentPrice) : "Unavailable";
  const mrpNode = priceKnown && mrp > currentPrice ? formatMoney(mrp) : null;
  const savingsAmount = priceKnown && mrp > currentPrice ? mrp - currentPrice : 0;
  const bookCover = product?.coverpageurl || product?.coverPageUrl || product?.cover_page_url || "";

  return (
    <>
      <div ref={rootRef} className="hld min-h-screen overflow-x-hidden pb-28" data-theme={theme}>
        {seoHead}
        <SkipLink />
        <ScrollProgress />
        <FloatNav
          links={NAV_LINKS}
          show={!heroVisible && !checkoutOpen}
          onBuy={openCheckout}
          canBuy={canBuy}
        />
        <Breadcrumb current="System Design LLD (Java)" />

        <main id="page-main">
          {/* ------------------------------ HERO ------------------------------ */}
          <section ref={heroRef} aria-labelledby="lld-hero-title" className="bg-base relative">
            <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center lg:px-8 lg:pb-24 lg:pt-12">
              <div className="min-w-0">
                <Reveal y={16}>
                  <span className="chip chip-accent caption-3">
                    <Code size={14} weight="bold" />
                    Java first LLD handbook · PDF ebook
                  </span>
                </Reveal>

                <Reveal as="h1" delay={0.06} id="lld-hero-title" className="hero-title heading-1 mt-4 max-w-[680px] pb-1">
                  <span className="block">Design with clarity.</span>
                  <span className="block">Code with confidence.</span>
                </Reveal>

                <Reveal as="p" delay={0.12} className="body-3 t2 mt-6 max-w-[680px] sm:text-lg sm:leading-7">
                  From Java OOP and UML to design patterns, Spring Boot, APIs, database modeling,
                  multithreading, testing and 16 coded case studies. Prepare for LLD interviews and
                  for real backend engineering with one handbook.
                </Reveal>

                <Reveal delay={0.18} className="mt-8 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={openCheckout} disabled={!canBuy} className="btn btn-primary btn-lg button-md">
                    Get the ebook {priceNode !== "Unavailable" && priceNode}
                    <ArrowRight className="arrow" size={20} weight="bold" />
                  </button>
                  <a href="#preview" onClick={goToPreview} className="btn btn-ghost btn-lg button-md">
                    <BookOpen size={20} weight="bold" />
                    Preview the book
                  </a>
                </Reveal>

                {productError && (
                  <p className="caption-1 tbad mt-4" role="alert">
                    The price is temporarily unavailable. Please try again or contact {SUPPORT_EMAIL}.
                  </p>
                )}

                <Reveal delay={0.24} className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                  {[
                    [DownloadSimple, "Instant access after payment"],
                    [Lock, `Secure checkout via ${PAYMENT_PROVIDER_NAME}`],
                    [FileText, "Free preview before you buy"],
                  ].map(([Icon, text]) => (
                    <span key={text} className="caption-1 t2 inline-flex items-center gap-2">
                      <Icon className="ta" size={16} weight="bold" />
                      {text}
                    </span>
                  ))}
                </Reveal>
              </div>

              <Reveal delay={0.15} className="mx-auto w-full max-w-sm lg:max-w-none">
                <div className="bg-s2 bd relative rounded-3xl p-6 sm:p-8">
                  <FloatChip className="left-3 top-6 sm:left-4" delay={0.5}>
                    <p className="heading-6 mono ta">23</p>
                    <p className="caption-4 t2">GoF patterns</p>
                  </FloatChip>
                  <FloatChip className="right-3 top-1/3 sm:right-4" delay={0.8}>
                    <p className="heading-6 mono ta">16</p>
                    <p className="caption-4 t2">coded case studies</p>
                  </FloatChip>

                  <Tilt className="mx-auto w-40 sm:w-48">
                    <div className="overflow-hidden rounded-xl bg-[#181818] shadow-[0_24px_48px_rgba(0,0,0,0.3)]">
                      {bookCover ? (
                        <img
                          src={bookCover}
                          alt="Mastering System Design LLD Java ebook cover"
                          className="block h-auto w-full object-cover"
                          loading="eager"
                          decoding="async"
                        />
                      ) : (
                        <div className="flex aspect-[0.72] flex-col justify-between p-4 text-white">
                          <p className="caption-3 uppercase tracking-wider text-[#fb923c]">The Java interview guide</p>
                          <div>
                            <p className="heading-5">Master System Design</p>
                            <p className="body-5 mt-2 text-[#fb923c]">Low Level Design · Java</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Tilt>

                  <div className="card mt-8 rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow caption-3">Digital PDF ebook</p>
                        <div className="mt-2 flex flex-wrap items-baseline gap-2">
                          <span className="heading-4 mono t1">{priceNode}</span>
                          {mrpNode && <span className="body-5 mono t3 strike">{mrpNode}</span>}
                        </div>
                      </div>
                      {priceKnown && discount > 0 && (
                        <span className="chip chip-accent caption-3 mono">{discount}% off</span>
                      )}
                    </div>
                    {savingsAmount > 0 && (
                      <p className="caption-3 tok mt-2">You save {formatMoney(savingsAmount)} today</p>
                    )}
                    <p className="caption-5 t3 mt-2">
                      Instant access after successful payment. Digital purchases are not refundable.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ----------------------- OTHER BOOKS (HLD, COMBO) ------------------- */}
          <Section id="more-books" alt labelledBy="more-books-title">
            <SectionHeader
              id="more-books-title"
              eyebrow="Complete your system design prep"
              title="Add HLD, or get both books together"
              description="LLD teaches you to design classes and object interactions. HLD teaches you to reason about scale, databases, caching, messaging and reliability. Most interview loops test both."
            />

            <div className={cx("mt-10 grid gap-6", comboProduct ? "lg:grid-cols-2" : "max-w-2xl")}>
              <Reveal>
                <BookOfferCard
                  eyebrow="High level design"
                  title={hldProduct?.title || "Mastering System Design: High Level Design"}
                  subtitle="Architecture and scale"
                  description="How production systems grow from one service to a distributed architecture: databases, Redis, load balancing, Kafka, replication, sharding and fault tolerance."
                  cover={hldCoverImage}
                  features={["19 interview case studies", "45 minute interview playbook", "16 core building blocks"]}
                  pills={["Scalability", "Databases", "Redis", "Kafka"]}
                  status={loadingHldProduct ? "loading" : hldProduct && hldValidPrice ? "ready" : "error"}
                  price={hldCurrentPrice}
                  mrp={hldMrp}
                  currency={hldCurrency}
                  onBuy={openHldCheckout}
                  canBuy={hldCanBuy}
                  buyLabel="Get the HLD book"
                  href={HLD_REDIRECT_URL}
                  errorText={hldProductError ? `${hldProductError} You can still open the HLD book page.` : ""}
                />
              </Reveal>

              {comboProduct && (
                <Reveal delay={0.1}>
                  <BookOfferCard
                    featured
                    badge="Best value"
                    eyebrow="Complete system design bundle"
                    title={comboProduct.title || "Mastering System Design: HLD + LLD Combo"}
                    subtitle="Two books, one checkout"
                    description="Distributed architecture, scaling, caching and reliability in HLD, plus Java object design, patterns, concurrency and solved problems in LLD."
                    cover={comboCoverImage}
                    features={["HLD and LLD together", "19 HLD case studies plus 16 LLD problems", "Architecture, Java code and design patterns"]}
                    status="ready"
                    price={comboPrice}
                    mrp={comboMrp}
                    currency={comboProduct.currency || "INR"}
                    onBuy={openComboCheckout}
                    canBuy
                    buyLabel="Get the combo"
                    href={COMBO_REDIRECT_URL}
                  />
                </Reveal>
              )}
            </div>
          </Section>

          {/* ------------------------------ PROOF ------------------------------ */}
          <StatsStrip
            label="Book highlights"
            items={[
              [23, "", "GoF design patterns"],
              [16, "", "Coded case studies"],
              [60, " min", "Interview framework"],
              [14, "", "Detailed parts"],
            ]}
          />

          <TaglineReveal text={TAGLINE} />

          {/* ------------------------------ WHY LLD ---------------------------- */}
          <Section id="why-lld" alt labelledBy="why-title">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div>
                <SectionHeader
                  id="why-title"
                  eyebrow="Why low level design"
                  title="Do not just write classes. Learn how to design them."
                  description="LLD turns requirements into clean, extensible and maintainable object oriented designs. The goal is not to memorise patterns. It is to understand why a design fits a problem."
                />
                <ul className="mt-8 space-y-3">
                  {WHY_POINTS.map((item, index) => (
                    <Reveal as="li" key={item} y={16} delay={Math.min(index, 5) * 0.04} className="flex items-start gap-3">
                      <Check className="ta mt-1 shrink-0" size={16} weight="bold" />
                      <span className="body-3 t1">{item}</span>
                    </Reveal>
                  ))}
                </ul>
              </div>

              <Reveal delay={0.1}>
                <div className="card rounded-3xl p-6 sm:p-8">
                  <p className="eyebrow caption-3">The LLD mindset</p>
                  <h3 className="heading-5 t1 mt-2">Requirement, design, pattern, code</h3>
                  <ol className="mt-6 space-y-3">
                    {MINDSET.map(([number, title, text]) => (
                      <li key={number} className="bg-s2 row-hover flex gap-4 rounded-xl p-4">
                        <span className="tile body-4 mono h-10 w-10 rounded-lg">{number}</span>
                        <div>
                          <p className="body-1 t1">{title}</p>
                          <p className="body-6 t2 mt-1">{text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            </div>
          </Section>

          {/* ----------------------------- CURRICULUM -------------------------- */}
          <Section id="curriculum" labelledBy="curriculum-title">
            <SectionHeader
              id="curriculum-title"
              eyebrow="A clear path from concept to code"
              title="Everything you need to reason through LLD"
              description="The complete 14 part curriculum: Java, UML, 23 GoF patterns, enterprise architecture, concurrency, APIs, Spring Boot, testing and solved interview systems."
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {modules.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.number} delay={(index % 4) * 0.06} y={24}>
                    <article className="card lift flex h-full gap-4 rounded-3xl p-4 sm:flex-col sm:p-6">
                      <div className="flex items-start justify-between gap-3 sm:w-full">
                        <span className="tile h-12 w-12 rounded-xl">
                          <Icon size={24} weight="duotone" />
                        </span>
                        <span className="num caption-3 mono hidden sm:block">{item.number}</span>
                      </div>
                      <div>
                        <h3 className="title-2 t1">{item.title}</h3>
                        <p className="body-6 t2 mt-1 sm:mt-2">{item.detail}</p>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>

            <Reveal className="mt-6">
              <p className="note body-6 rounded-2xl p-4 sm:p-6">
                <strong className="font-semibold">Real backend depth. </strong>
                Alongside interview sized Java modeling exercises, the book covers REST APIs, persistence,
                JPA and Hibernate, Spring Boot clean architecture, security, observability, testing and
                production reliability. All 16 case studies include UML, Java code and driver scenarios.
              </p>
            </Reveal>
          </Section>

          {/* ------------------------------- FLOW ------------------------------ */}
          <Section id="flow" alt labelledBy="flow-title">
            <SectionHeader
              id="flow-title"
              eyebrow="A repeatable interview approach"
              title="From prompt to a design you can explain"
              description="Follow a practical sequence instead of jumping straight into classes or patterns."
            />

            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {flowSteps.map((step, index) => {
                const Icon = FLOW_ICONS[index];
                return (
                  <Reveal key={step.n} delay={index * 0.06} y={24}>
                    <article className="card lift h-full rounded-2xl p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="tile h-10 w-10 rounded-lg">
                          <Icon size={20} weight="duotone" />
                        </span>
                        <span className="num caption-3 mono">{step.n}</span>
                      </div>
                      <h3 className="title-3 t1 mt-4">{step.title}</h3>
                      <p className="body-6 t2 mt-1">{step.text}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>

            <Reveal className="mt-6">
              <div className="card rounded-3xl p-6 sm:p-8">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="heading-6 t1">Example: model a show specific seat booking</h3>
                  <span className="caption-1 t3">Class relationship and state flow</span>
                </div>

                <div
                  className="mt-6 flex flex-col items-stretch gap-3 lg:flex-row lg:items-center"
                  aria-label="Show contains show seats; booking holds selected show seats"
                >
                  {UML_BOXES.map((box, index) => (
                    <React.Fragment key={box.name}>
                      <div className="uml flex-1 rounded-xl p-4">
                        <p className="body-1 mono t1">{box.name}</p>
                        {box.fields.map((field) => (
                          <p key={field} className="caption-2 mono t2 mt-1">
                            {field}
                          </p>
                        ))}
                      </div>
                      {index < UML_BOXES.length - 1 && (
                        <div className="flex items-center justify-center gap-2 lg:flex-col">
                          <ArrowRight className="ta rotate-90 lg:rotate-0" size={20} weight="bold" />
                          <span className="caption-4 t3">{box.link}</span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div
                  className="mt-6 flex flex-wrap items-center gap-3"
                  aria-label="Seat state transitions from available to locked to booked"
                >
                  {["AVAILABLE", "LOCKED", "BOOKED"].map((state, index) => (
                    <React.Fragment key={state}>
                      <motion.span
                        className={cx("chip caption-3 mono", index === 2 && "chip-accent")}
                        animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
                        transition={{ duration: 2.4, delay: index * 0.35, repeat: Infinity, ease: FLOAT_EASE }}
                      >
                        {state}
                      </motion.span>
                      {index < 2 && <ArrowRight className="t3" size={14} weight="bold" aria-hidden="true" />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </Reveal>
          </Section>

          {/* ----------------------------- PREVIEW ----------------------------- */}
          <PdfPreviewSection file={lldPreviewPdf} onBuy={openCheckout} canBuy={canBuy} priceNode={priceNode} />

          {/* ---------------------------- FOUNDATIONS -------------------------- */}
          <Section id="principles" alt labelledBy="principles-title">
            <SectionHeader
              id="principles-title"
              eyebrow="Foundations"
              title="OOP first, then the principles that keep designs clean"
              description="Before patterns, understand how objects own state, expose behaviour and collaborate. Every principle is tied to a practical design problem and a refactoring decision."
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {OOP_PILLARS.map(([title, text], index) => (
                <Reveal key={title} delay={index * 0.07}>
                  <article className="card lift h-full rounded-3xl p-6">
                    <span className="num caption-3 mono">OOP {twoDigits(index + 1)}</span>
                    <h3 className="heading-6 t1 mt-3">{title}</h3>
                    <p className="body-6 t2 mt-2">{text}</p>
                  </article>
                </Reveal>
              ))}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {principles.map((principle, index) => (
                <Reveal key={principle.title} delay={(index % 3) * 0.06} y={24}>
                  <article className="card lift h-full rounded-2xl p-4 sm:p-6">
                    <span className="num caption-3 mono">Principle {twoDigits(index + 1)}</span>
                    <h3 className="title-2 t1 mt-2">{principle.title}</h3>
                    <p className="body-6 t2 mt-1">{principle.short}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </Section>

          {/* ----------------------------- PATTERNS ---------------------------- */}
          <PatternLibrary />

          {/* --------------------------- REQUIREMENTS -------------------------- */}
          <Section id="requirements" alt labelledBy="requirements-title">
            <SectionHeader
              id="requirements-title"
              eyebrow="Start with requirements"
              title="Functional and non functional requirements"
              description="Before drawing classes, understand what the system must do and which qualities it must keep under real conditions."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {[
                ["Functional requirements", "What should the system actually do?", FUNCTIONAL],
                ["Non functional requirements", "How should it behave under real conditions?", NON_FUNCTIONAL],
              ].map(([title, text, items], index) => (
                <Reveal key={title} delay={index * 0.08}>
                  <article className="card h-full rounded-3xl p-6 sm:p-8">
                    <h3 className="heading-6 t1">{title}</h3>
                    <p className="body-6 t2 mt-2">{text}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {items.map((item) => (
                        <span key={item} className="chip caption-1">
                          {item}
                        </span>
                      ))}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </Section>

          {/* ---------------------------- CONCURRENCY -------------------------- */}
          <Section id="concurrency" labelledBy="concurrency-title">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div>
                <SectionHeader
                  id="concurrency-title"
                  eyebrow="Concurrency and thread safety"
                  title="Locking is part of LLD"
                  description="Real LLD problems contain shared state. Two users try for the same seat, two orders update the same inventory, or several threads write to the same resource."
                />
                <Reveal delay={0.08} className="mt-8 flex flex-wrap gap-2">
                  {CONCURRENCY_TOPICS.map((item) => (
                    <span key={item} className="chip caption-1">
                      {item}
                    </span>
                  ))}
                </Reveal>
              </div>

              <Reveal delay={0.1}>
                <div className="card rounded-3xl p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="title-3 t1">Seat and inventory locking</p>
                    <span className="chip chip-accent caption-3 mono">Java</span>
                  </div>
                  <pre className="code mt-4 rounded-xl p-4">{codeExamples.Locking}</pre>
                  <p className="note body-6 mt-4 rounded-xl p-4">
                    The book explains why the critical section exists, which race condition appears
                    without it, and how different locking approaches change the design.
                  </p>
                </div>
              </Reveal>
            </div>
          </Section>

          {/* ------------------------------- CODE ------------------------------ */}
          <CodeShowcase />

          {/* ---------------------------- FRAMEWORK ---------------------------- */}
          <Section id="framework" labelledBy="framework-title">
            <SectionHeader
              id="framework-title"
              eyebrow="Interview framework"
              title="A repeatable LLD design process"
              description="Ten steps you can run in every round, from the first clarifying question to the final tradeoff discussion."
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {FRAMEWORK_STEPS.map(([number, title, text], index) => (
                <Reveal key={number} delay={(index % 5) * 0.06} y={24}>
                  <article className="card lift h-full rounded-2xl p-4 sm:p-6">
                    <span className="num heading-5 mono">{number}</span>
                    <h3 className="title-3 t1 mt-3">{title}</h3>
                    <p className="body-6 t2 mt-1">{text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </Section>

          {/* ---------------------------- CASE STUDIES ------------------------- */}
          <Section id="problems" alt labelledBy="problems-title">
            <SectionHeader
              id="problems-title"
              eyebrow="Real world design practice"
              title="16 system designs covered in the book"
              description="Each card shows the domain, the core classes and the design concepts you will practice. The full prompts and requirements are inside the book."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {designQuestions.map((question, index) => (
                <Reveal key={question.title} delay={(index % 3) * 0.06}>
                  <article className="card lift flex h-full flex-col rounded-3xl p-6">
                    <div className="flex items-center justify-between gap-3">
                      <span className="chip chip-accent caption-3">{question.company}</span>
                      <span className="num caption-3 mono">LLD {twoDigits(index + 1)}</span>
                    </div>
                    <h3 className="heading-6 t1 mt-4">{question.title}</h3>
                    <p className="caption-3 t3 mt-1 uppercase tracking-wider">{question.focus}</p>
                    <p className="body-6 t2 mt-4">{QUESTION_SUMMARIES[index]}</p>
                    <p className="caption-3 t3 mt-4 uppercase tracking-wider">Key classes</p>
                    <p className="caption-2 mono t2 mt-1">{question.classes}</p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-6">
                      {question.patterns.map((pattern) => (
                        <span key={pattern} className="chip caption-4">
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-10 flex flex-col items-center gap-3 text-center">
              <p className="body-2 t1">All 16 designs come with UML and Java code.</p>
              <button type="button" onClick={openCheckout} disabled={!canBuy} className="btn btn-primary btn-lg button-md">
                Get the ebook {priceNode !== "Unavailable" && priceNode}
                <ArrowRight className="arrow" size={18} weight="bold" />
              </button>
            </Reveal>
          </Section>

          {/* --------------------------- INSIDE + QUESTIONS -------------------- */}
          <Section id="inside" labelledBy="inside-title">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div>
                <SectionHeader
                  id="inside-title"
                  eyebrow="Inside the book"
                  title="Everything you need for LLD"
                  description="A structured progression from object oriented thinking to complete design problems and their implementation."
                />
                <Reveal delay={0.08} className="mt-8 flex flex-wrap gap-2">
                  {INSIDE_TOPICS.map((item) => (
                    <span key={item} className="chip caption-1">
                      <Check className="ta" size={12} weight="bold" />
                      {item}
                    </span>
                  ))}
                </Reveal>
              </div>

              <Reveal delay={0.1}>
                <div className="card rounded-3xl p-6 sm:p-8">
                  <p className="eyebrow caption-3">Interview preparation</p>
                  <h3 className="heading-5 t1 mt-2">Questions you will learn to answer</h3>
                  <p className="body-6 t2 mt-2">
                    The goal is to explain your reasoning, not simply draw classes on a whiteboard.
                  </p>
                  <ul className="rule mt-6 grid gap-px overflow-hidden rounded-xl">
                    {INTERVIEW_QUESTIONS.map((question) => (
                      <li key={question} className="bg-s2 row-hover body-5 t1 px-4 py-3">
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </Section>

          {/* ------------------------------ AUDIENCE --------------------------- */}
          <Section id="audience" alt labelledBy="audience-title">
            <SectionHeader
              id="audience-title"
              eyebrow="Who should buy this"
              title="Built for developers who want to design, not just code"
              description="Whether you are starting LLD or preparing for an interview, the book moves from fundamentals to complete real world systems."
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {AUDIENCE.map(([title, text], index) => (
                <Reveal key={title} delay={(index % 3) * 0.07}>
                  <article className="card lift h-full rounded-3xl p-6">
                    <span className="num caption-3 mono">{twoDigits(index + 1)}</span>
                    <h3 className="heading-6 t1 mt-3">{title}</h3>
                    <p className="body-6 t2 mt-2">{text}</p>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-10">
              <p className="eyebrow caption-3">Learning path</p>
              <h3 className="heading-5 t1 mt-2">From beginner to interview ready</h3>
            </Reveal>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {LEARNING_PATH.map(([number, title, text], index) => (
                <Reveal key={number} delay={index * 0.06} y={24}>
                  <article className="card lift h-full rounded-2xl p-4 sm:p-6">
                    <span className="num heading-5 mono">{number}</span>
                    <h4 className="title-3 t1 mt-3">{title}</h4>
                    <p className="body-6 t2 mt-1">{text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </Section>

          {/* -------------------------------- FAQ ------------------------------ */}
          <Section id="faq" narrow labelledBy="faq-title">
            <SectionHeader
              id="faq-title"
              eyebrow="Quick answers"
              title="Before you start"
              description="Book contents, Java code, backend topics and buying details."
              align="center"
            />
            <FaqList items={faqItems} idPrefix="lld-faq" defaultOpen={0} />
          </Section>

          <FinalCta
            titleId="lld-final-title"
            eyebrow="Build a stronger LLD approach"
            title="Turn interview prompts into designs you can defend."
            copy="Get the Java LLD handbook and practice the full journey from requirements to classes, patterns, code and edge cases."
            price={priceNode}
            mrp={mrpNode}
            onBuy={openCheckout}
            canBuy={canBuy}
            buyLabel="Get the ebook"
            secondary={{ label: "Read the free preview first", onClick: goToPreview }}
            note="Digital products are not refundable after purchase."
          />
        </main>

        <footer className="bg-base caption-2 t3 px-4 pb-8 text-center">
          <p>Mastering System Design: Low Level Design in Java · Digital PDF ebook</p>
          <p className="mt-2">
            Questions?{" "}
            <a className="link focusable font-semibold" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
          </p>
          <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2">
            <a className="link focusable font-medium" href={HLD_REDIRECT_URL}>System Design HLD</a>
            <a className="link focusable font-medium" href={COMBO_REDIRECT_URL}>HLD + LLD Combo</a>
            <a className="link focusable font-medium" href="/books">All books</a>
          </p>
        </footer>

        <BuyBar
          title="Mastering System Design LLD (Java)"
          price={priceNode}
          mrp={mrpNode}
          discount={priceKnown ? discount : 0}
          onBuy={openCheckout}
          canBuy={canBuy}
          buyLabel="Get the ebook"
          hidden={checkoutOpen}
          heroVisible={heroVisible && !loadingProduct}
          secondary={{ label: "Free preview", onClick: goToPreview }}
        />
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <PayUCheckoutModal
            isOpen={checkoutOpen}
            onClose={() => {
              setCheckoutOpen(false);
              setCheckoutProduct(null);
            }}
            product={checkoutProduct || product}
          />,
          document.body
        )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Sections with their own state                                      */
/* ------------------------------------------------------------------ */

function PatternLibrary() {
  const reduce = useReducedMotion();
  const categories = Object.keys(patterns);
  const [category, setCategory] = useState(categories[0]);
  const items = patterns[category];

  return (
    <Section id="patterns" labelledBy="patterns-title">
      <SectionHeader
        id="patterns-title"
        eyebrow="Complete pattern library"
        title="All 23 GoF design patterns"
        description="The Creational, Structural and Behavioral families with purpose, use cases, examples and implementation thinking."
      />

      <Reveal className="mt-8">
        <PillTabs
          label="Pattern families"
          value={category}
          onChange={setCategory}
          items={categories.map((name) => ({ id: name, label: name, count: patterns[name].length }))}
        />
      </Reveal>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={category}
          role="tabpanel"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((pattern, index) => (
            <article key={pattern.name} className="card lift flex h-full flex-col rounded-3xl p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="num caption-3 mono">{twoDigits(index + 1)}</span>
                <span className="chip caption-4">{PATTERN_KIND[category]}</span>
              </div>
              <h3 className="heading-6 t1 mt-4">{pattern.name}</h3>
              <p className="body-6 t2 mt-2">{pattern.purpose}</p>
              <div className="bg-s2 mt-4 rounded-xl p-4">
                <p className="caption-3 ta uppercase tracking-wider">Example</p>
                <p className="body-5 t1 mt-1">{pattern.example}</p>
              </div>
              <p className="caption-3 t3 mt-4 uppercase tracking-wider">When to use</p>
              <p className="body-6 t2 mt-1">{pattern.when}</p>
            </article>
          ))}
        </motion.div>
      </AnimatePresence>

      <Reveal className="mt-10">
        <div className="card rounded-3xl p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="eyebrow caption-3">Pattern thinking</p>
              <h3 className="heading-4 t1 mt-2">Do not force a pattern. Let the requirement reveal it.</h3>
              <p className="body-3 t2 mt-4">
                A common LLD mistake is using every pattern in every problem. The book teaches you to
                understand the requirement first, then identify the design pressure.
              </p>
            </div>
            <ul className="rule grid gap-px overflow-hidden rounded-xl">
              {PATTERN_CUES.map(([question, answer]) => (
                <li key={question} className="bg-s2 row-hover flex items-center justify-between gap-4 px-4 py-3">
                  <span className="body-5 t1">{question}</span>
                  <span className="body-4 ta shrink-0">{answer}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

function CodeShowcase() {
  const reduce = useReducedMotion();
  const tabs = codeTabs.filter(([key]) => key !== "Locking");
  const [active, setActive] = useState(tabs[0][0]);

  return (
    <Section id="code" alt labelledBy="code-title">
      <SectionHeader
        id="code-title"
        eyebrow="Code first learning"
        title="Design patterns in Java"
        description="Every design problem is explained as a concept, then translated into practical, interview focused Java code."
      />

      <Reveal className="mt-8">
        <PillTabs
          label="Java examples"
          value={active}
          onChange={setActive}
          items={tabs.map(([key, title]) => ({ id: key, label: title }))}
        />
      </Reveal>

      <Reveal className="mt-6">
        <div className="card rounded-3xl p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="title-3 t1">{tabs.find(([key]) => key === active)?.[1]}</p>
            <span className="chip chip-accent caption-3 mono">Java</span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.pre
              key={active}
              role="tabpanel"
              tabIndex={0}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="code focusable mt-4 rounded-xl p-4"
            >
              {codeExamples[active]}
            </motion.pre>
          </AnimatePresence>
        </div>
      </Reveal>
    </Section>
  );
}

function PdfPreviewSection({ file, onBuy, canBuy, priceNode }) {
  const viewportRef = useRef(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageWidth, setPageWidth] = useState(760);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const updateWidth = () => {
      const horizontalPadding = window.innerWidth <= 720 ? 16 : 32;
      const available = Math.max(220, viewport.clientWidth - horizontalPadding);
      setPageWidth(Math.min(900, available));
    };

    updateWidth();

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateWidth) : null;

    resizeObserver?.observe(viewport);
    window.addEventListener("resize", updateWidth, { passive: true });

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const previewPages = Math.min(pageCount, 5);

  const blockBrowserSaveOrPrint = (event) => {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = String(event.key || "").toLowerCase();
    if (key === "s" || key === "p") event.preventDefault();
  };

  const failure = "The preview could not be loaded. Please refresh and try again.";

  return (
    <Section id="preview" labelledBy="lld-preview-title">
      <SectionHeader
        id="lld-preview-title"
        eyebrow="Read before you buy"
        title="Preview the book right on this page"
        description="Scroll through a short sample of the Java LLD handbook and judge the depth yourself."
      />

      <Reveal className="mt-10">
        <div className="card rounded-3xl p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="tile h-12 w-12 rounded-xl">
                <BookOpen size={24} weight="duotone" />
              </span>
              <div>
                <p className="title-3 t1">Mastering System Design LLD Java sample</p>
                <p className="caption-2 t3 mt-1">Scroll inside the preview to read the pages.</p>
              </div>
            </div>
            <span className="chip chip-accent caption-3 self-start sm:self-auto">
              {previewPages ? `${previewPages} page preview` : "Short preview"}
            </span>
          </div>

          <div
            ref={viewportRef}
            className="pdf-viewport mt-4 rounded-2xl p-2 sm:p-4"
            role="region"
            aria-label="Scrollable PDF book preview"
            tabIndex={0}
            onContextMenu={(event) => event.preventDefault()}
            onDragStart={(event) => event.preventDefault()}
            onKeyDown={blockBrowserSaveOrPrint}
          >
            <Document
              file={file}
              onLoadSuccess={({ numPages }) => {
                setPageCount(numPages);
                setPreviewError("");
              }}
              onLoadError={(error) => {
                console.error("Failed to load LLD preview PDF:", error);
                setPreviewError(failure);
              }}
              loading={<div className="skel-block mx-auto aspect-[0.707] w-full max-w-3xl rounded-xl" role="status" aria-label="Loading book preview" />}
              error={<p className="body-6 t2 p-6 text-center">{previewError || failure}</p>}
              noData={<p className="body-6 t2 p-6 text-center">The preview file is unavailable.</p>}
            >
              <div className="space-y-4">
                {Array.from({ length: previewPages }, (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <div key={pageNumber}>
                      <p className="caption-4 mono t3 mb-2 px-1">
                        Preview page {twoDigits(pageNumber)} / {twoDigits(previewPages)}
                      </p>
                      <Page
                        className="pdf-page flex justify-center"
                        pageNumber={pageNumber}
                        width={pageWidth}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        renderForms={false}
                        loading={<div className="skel-block aspect-[0.707] w-full rounded-xl" />}
                      />
                    </div>
                  );
                })}
              </div>
            </Document>
          </div>

          <p className="caption-2 t3 mt-4 flex items-start gap-2">
            <ShieldCheck className="ta mt-0.5 shrink-0" size={16} weight="bold" />
            This preview holds only a few selected pages, so some topics start or end midway. The
            complete explanations, code, diagrams and remaining content are in the full ebook.
          </p>

          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <button type="button" onClick={onBuy} disabled={!canBuy} className="btn btn-primary btn-lg button-md">
              Get the full ebook {priceNode !== "Unavailable" && priceNode}
              <ArrowRight className="arrow" size={18} weight="bold" />
            </button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
