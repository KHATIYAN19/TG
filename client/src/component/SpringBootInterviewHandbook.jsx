
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Helmet } from "react-helmet-async";

import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Code2,
  Coffee,
  Copy,
  Database,
  Download,
  FileText,
  Flame,
  GitBranch,
  GraduationCap,
  Layers3,
  Loader2,
  LockKeyhole,
  MessageSquareText,
  MonitorSmartphone,
  RefreshCcw,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
  Workflow,
  X,
  XCircle,
  Zap,
} from "lucide-react";

import PayUCheckoutModal from "../payment/PayUCheckoutModal.jsx";
import { trackViewContent } from "../lib/metaPixel.js";

/* ==========================================================
   CONFIGURATION
========================================================== */

const BASE_URL = (
  import.meta.env.VITE_BASE_URL ||
  "http://localhost:5001"
).replace(/\/+$/, "");

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";

const BOOK_PATH = "/book/springboot-interview-handbook";

const BOOK_ENDPOINT = `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(
  BOOK_PATH
)}`;

// Companion book shown right after the hero (loaded from the backend).
const JAVA_BOOK_PATH = "/book/java-interview-handbook";

const JAVA_BOOK_ENDPOINT = `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(
  JAVA_BOOK_PATH
)}`;

const STORAGE_THEME_KEY = "theme";

// Title <= 60 chars, description <= 160 chars.
const SEO_TITLE = "Spring Boot Interview Questions (100 Q&A) PDF | Target Trek";

const SEO_DESCRIPTION =
  "Spring Boot interview handbook: 100 questions & answers on IoC, REST, JPA, Security, JWT, microservices, Redis, Kafka and real backend scenarios. PDF ebook.";

const SEO_LONG_DESCRIPTION =
  "100 Spring Boot interview questions covering Spring Core, REST APIs, JPA, Spring Security, transactions, microservices, Redis, Kafka and real-world backend scenarios.";

const SEO_KEYWORDS =
  "spring boot interview questions, spring boot interview questions and answers, spring boot interview book, spring boot pdf, spring data jpa interview questions, spring security jwt interview, spring boot microservices interview, dependency injection interview, spring transactional interview, kafka redis spring boot, backend interview preparation";

const CHAPTERS = [
  {
    number: "01",
    title: "Spring & Spring Boot Fundamentals",
    subtitle: "Understand the foundation",
    range: "Q1–Q10",
    level: "Beginner",
    icon: BookOpen,
    topics: [
      "Spring Framework vs Spring Boot",
      "@SpringBootApplication internals",
      "Auto-configuration",
      "Spring Boot starters",
      "Application startup lifecycle",
      "Embedded servers",
      "JAR vs WAR deployment",
      "Properties and YAML configuration",
    ],
    questions: [
      "What is Spring Boot and why is it used?",
      "How is Spring Boot different from Spring?",
      "What are the advantages and limitations?",
      "What does @SpringBootApplication do?",
      "How does auto-configuration work?",
      "What are Spring Boot starters?",
      "What happens during application startup?",
      "What is an embedded server?",
      "What is the difference between JAR and WAR?",
      "How does externalized configuration work?",
    ],
  },
  {
    number: "02",
    title: "Spring Core, IoC & Dependency Injection",
    subtitle: "Master Spring internals",
    range: "Q11–Q20",
    level: "Core",
    icon: Layers3,
    topics: [
      "Inversion of Control",
      "Dependency injection types",
      "Constructor vs field injection",
      "Spring beans",
      "Stereotype annotations",
      "@Bean vs @Component",
      "Bean scopes and lifecycle",
      "ApplicationContext",
      "@Primary and @Qualifier",
    ],
    questions: [
      "What is Inversion of Control?",
      "What is dependency injection?",
      "Why is constructor injection preferred?",
      "What exactly is a Spring Bean?",
      "Compare component stereotype annotations.",
      "How are @Bean and @Component different?",
      "What are the different bean scopes?",
      "Explain the Spring Bean lifecycle.",
      "What is ApplicationContext?",
      "Explain @Primary, @Qualifier and @Lazy.",
    ],
  },
  {
    number: "03",
    title: "REST APIs & Exception Handling",
    subtitle: "Build robust backend APIs",
    range: "Q21–Q30",
    level: "Core",
    icon: Server,
    topics: [
      "REST controller architecture",
      "HTTP mapping annotations",
      "Path variables and query parameters",
      "DTO and request handling",
      "ResponseEntity",
      "JSON serialization",
      "Bean Validation",
      "Global exception handling",
      "PUT vs PATCH",
      "Pagination and sorting",
    ],
    questions: [
      "How do you create REST APIs?",
      "@Controller vs @RestController?",
      "Explain HTTP mapping annotations.",
      "Compare @PathVariable and @RequestParam.",
      "When should ResponseEntity be used?",
      "How does JSON conversion work?",
      "How does request validation work?",
      "How do you handle exceptions globally?",
      "What is the difference between PUT and PATCH?",
      "How do pagination and sorting work?",
    ],
  },
  {
    number: "04",
    title: "Spring Data JPA & Hibernate",
    subtitle: "Database integration explained",
    range: "Q31–Q40",
    level: "Intermediate",
    icon: Database,
    topics: [
      "JPA vs Hibernate",
      "Repository interfaces",
      "Entity mapping",
      "Relationships and cascading",
      "Lazy vs eager loading",
      "N+1 query problem",
      "Persistence context and flush",
      "JPQL vs native queries",
      "Optimistic and pessimistic locking",
      "Database pooling and migrations",
    ],
    questions: [
      "JPA vs Hibernate vs Spring Data JPA?",
      "CrudRepository vs JpaRepository?",
      "What are JPA entity annotations?",
      "Explain entity relationships.",
      "Lazy loading vs eager loading?",
      "What is the N+1 query problem?",
      "save() vs flush() vs saveAndFlush()?",
      "JPQL vs native SQL?",
      "Optimistic vs pessimistic locking?",
      "How do connection pooling and migrations work?",
    ],
  },
  {
    number: "05",
    title: "Transactions, AOP & Internals",
    subtitle: "Know what happens behind the scenes",
    range: "Q41–Q50",
    level: "Advanced",
    icon: Workflow,
    topics: [
      "@Transactional internals",
      "Transaction propagation",
      "Isolation levels",
      "Self-invocation problems",
      "Spring AOP",
      "JDK and CGLIB proxies",
      "Aspect advice types",
      "Circular dependencies",
      "BeanPostProcessor",
      "Spring application events",
    ],
    questions: [
      "How does @Transactional work?",
      "What are transaction propagation types?",
      "Explain transaction isolation.",
      "Why does @Transactional sometimes fail?",
      "What is Spring AOP?",
      "JDK dynamic proxy vs CGLIB?",
      "What are the different types of advice?",
      "How does Spring handle circular dependencies?",
      "Explain bean lifecycle hooks.",
      "How does Spring event publishing work?",
    ],
  },
  {
    number: "06",
    title: "Spring Security, JWT & OAuth2",
    subtitle: "Authentication and secure APIs",
    range: "Q51–Q60",
    level: "Advanced",
    icon: ShieldCheck,
    topics: [
      "Spring Security filter chain",
      "Authentication vs authorization",
      "JWT authentication",
      "Session vs stateless security",
      "OAuth2 and OpenID Connect",
      "Role-based access control",
      "CORS",
      "CSRF protection",
      "Password hashing",
      "Production API security",
    ],
    questions: [
      "How does Spring Security work?",
      "Authentication vs authorization?",
      "How do you implement JWT authentication?",
      "Session vs JWT authentication?",
      "Explain OAuth2, OIDC and JWT.",
      "How do you implement RBAC?",
      "What is CORS?",
      "What is CSRF?",
      "How should passwords be stored?",
      "How do you secure production APIs?",
    ],
  },
  {
    number: "07",
    title: "Spring Boot Microservices",
    subtitle: "Service communication and resilience",
    range: "Q61–Q70",
    level: "Advanced",
    icon: GitBranch,
    topics: [
      "Monolith vs microservices",
      "Service communication",
      "RestClient and WebClient",
      "Service discovery",
      "Spring Cloud Gateway",
      "Circuit breakers",
      "Retries and timeouts",
      "Saga pattern",
      "Centralized configuration",
      "Distributed tracing",
    ],
    questions: [
      "Microservices vs monolithic architecture?",
      "How do microservices communicate?",
      "RestTemplate vs RestClient vs WebClient?",
      "What is service discovery?",
      "What is an API Gateway?",
      "How does a circuit breaker work?",
      "Explain retry, timeout and bulkhead.",
      "What is the Saga pattern?",
      "How is configuration managed?",
      "How does distributed tracing work?",
    ],
  },
  {
    number: "08",
    title: "Redis, Kafka & Async Processing",
    subtitle: "Real-world backend integrations",
    range: "Q71–Q80",
    level: "Advanced",
    icon: Zap,
    topics: [
      "Spring Cache abstraction",
      "Redis caching",
      "Cache invalidation",
      "Kafka producers and consumers",
      "Kafka retry and DLQ",
      "Duplicate message handling",
      "@Async",
      "CompletableFuture",
      "@Scheduled",
      "Background job reliability",
    ],
    questions: [
      "How does Spring caching work?",
      "How do you integrate Redis?",
      "How do you invalidate cached data?",
      "How do you integrate Kafka?",
      "What happens when Kafka processing fails?",
      "How do you prevent duplicate consumption?",
      "How does @Async work?",
      "CompletableFuture vs reactive processing?",
      "How do scheduled tasks work?",
      "How do you build reliable background jobs?",
    ],
  },
  {
    number: "09",
    title: "Testing, Performance & Monitoring",
    subtitle: "Production readiness",
    range: "Q81–Q90",
    level: "Advanced",
    icon: MonitorSmartphone,
    topics: [
      "JUnit and Mockito",
      "Spring Boot test slices",
      "MockMvc",
      "Testcontainers",
      "API performance tuning",
      "Concurrent request handling",
      "Spring WebFlux",
      "Spring Boot Actuator",
      "Metrics and tracing",
      "Memory and CPU troubleshooting",
    ],
    questions: [
      "How do you write unit tests?",
      "SpringBootTest vs WebMvcTest vs DataJpaTest?",
      "How do you test REST APIs?",
      "How does Testcontainers work?",
      "How do you optimize slow APIs?",
      "How does Spring handle concurrent requests?",
      "Spring MVC vs WebFlux?",
      "What is Spring Boot Actuator?",
      "How do you implement observability?",
      "How do you debug memory leaks?",
    ],
  },
  {
    number: "10",
    title: "Real-World Backend Interview Scenarios",
    subtitle: "Think like an SDE-2",
    range: "Q91–Q100",
    level: "Scenario",
    icon: Trophy,
    topics: [
      "Preventing overselling",
      "Payment webhook idempotency",
      "Debugging slow APIs",
      "High-traffic failures",
      "Processing millions of records",
      "Secure token refresh",
      "Distributed rate limiting",
      "Cascading failure prevention",
      "Zero-downtime deployment",
      "End-to-end backend architecture",
    ],
    questions: [
      "How do you prevent concurrent overselling?",
      "How do you handle duplicate payment webhooks?",
      "How would you debug a 5-second API?",
      "Why might an application crash under load?",
      "How do you process 1 million records?",
      "How would you design secure refresh tokens?",
      "How would you build a distributed rate limiter?",
      "How do you handle database failures?",
      "How do you deploy with zero downtime?",
      "Explain a complete production backend request flow.",
    ],
  },
];

const BENEFITS = [
  {
    icon: Brain,
    title: "Understand the why",
    text:
      "Go beyond memorized definitions. Understand how Spring Boot components actually work.",
  },
  {
    icon: Code2,
    title: "Learn through Java code",
    text:
      "Study practical examples, annotation usage, configurations and real implementation patterns.",
  },
  {
    icon: MessageSquareText,
    title: "Answer with confidence",
    text:
      "Prepare concise interview answers and learn the deeper concepts behind likely follow-ups.",
  },
  {
    icon: Server,
    title: "Think like a backend engineer",
    text:
      "Connect concepts to REST APIs, databases, security, concurrency and real production systems.",
  },
  {
    icon: Rocket,
    title: "Prepare for SDE-1 and SDE-2",
    text:
      "Build from fundamentals to advanced architecture and troubleshooting scenarios.",
  },
  {
    icon: RefreshCcw,
    title: "Revise efficiently",
    text:
      "Use organized questions, topic groups and chapter summaries for focused interview revision.",
  },
];

const INCLUDED = [
  "100 carefully structured interview questions",
  "Direct answers and detailed explanations",
  "Java and Spring Boot code examples",
  "Spring Core, IoC, DI and bean lifecycle",
  "REST API development and exception handling",
  "Spring Data JPA and Hibernate",
  "Transactions, locks and Spring AOP",
  "Spring Security, JWT and OAuth2 concepts",
  "Microservices and resilience patterns",
  "Redis, Kafka and asynchronous processing",
  "Testing, Actuator and observability",
  "Real production and SDE-2 scenarios",
  "Common exceptions and debugging concepts",
  "Interview revision roadmap",
];

const AUDIENCE = [
  {
    icon: GraduationCap,
    label: "Students & freshers",
    text:
      "Build a strong foundation before your first Java backend interview.",
  },
  {
    icon: Coffee,
    label: "Java developers",
    text:
      "Move from Core Java to Spring Boot interview preparation.",
  },
  {
    icon: Server,
    label: "Backend engineers",
    text:
      "Strengthen practical understanding of APIs, databases and production systems.",
  },
  {
    icon: Trophy,
    label: "SDE-1 / SDE-2 candidates",
    text:
      "Prepare for theory, internals, implementation and scenario-based rounds.",
  },
];

const FAQS = [
  {
    q: "Is this book suitable for beginners?",
    a:
      "Yes. The handbook begins with Spring Framework and Spring Boot fundamentals before moving to database integration, security, microservices and production scenarios. Basic Java knowledge is recommended.",
  },
  {
    q: "Does the book contain 100 interview questions?",
    a:
      "The book is structured around 100 questions across 10 chapters, progressing from fundamental concepts to advanced real-world backend scenarios.",
  },
  {
    q: "Does it include Java code examples?",
    a:
      "Yes. The planned handbook includes Java and Spring Boot examples to explain key annotations, APIs, transactions, JPA, security, caching and other topics.",
  },
  {
    q: "Is this useful for SDE-2 interviews?",
    a:
      "Yes. The later chapters cover transactions, concurrency, Spring internals, microservices, Kafka, Redis, observability and scenario-based interview questions.",
  },
  {
    q: "Is this the same as the HLD or LLD book?",
    a:
      "No. HLD focuses on architecture and scalability, while LLD focuses on object-oriented design. This handbook focuses on Spring Boot and Java backend interview questions.",
  },
  {
    q: "What is the book format?",
    a:
      "This is a digital ebook. After a successful purchase, access and download instructions are provided through the checkout and delivery flow.",
  },
  {
    q: "Is this a complete Spring Boot development course?",
    a:
      "No. This book is optimized for technical interviews and revision. It covers concepts in detail, but it is not intended to replace a full project-based development course.",
  },
];

const REVISION = [
  ["Day 01", "Spring Boot fundamentals & IoC"],
  ["Day 02", "REST APIs, controllers & validation"],
  ["Day 03", "Spring Data JPA & Hibernate"],
  ["Day 04", "Transactions, proxies & AOP"],
  ["Day 05", "Spring Security & microservices"],
  ["Day 06", "Redis, Kafka, testing & monitoring"],
  ["Day 07", "Real-world scenarios & mock revision"],
];

const CODE_SAMPLES = [
  {
    label: "Dependency Injection",
    filename: "BookService.java",
    code: `@Service
public class BookService {

    private final BookRepository repository;

    public BookService(BookRepository repository) {
        this.repository = repository;
    }

    public List<Book> getBooks() {
        return repository.findAll();
    }
}`,
    explanation:
      "Understand constructor injection, Spring-managed dependencies and testable service-layer design.",
  },
  {
    label: "REST API",
    filename: "BookController.java",
    code: `@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService service;

    public BookController(BookService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Book>> getBooks() {
        return ResponseEntity.ok(
            service.getBooks()
        );
    }
}`,
    explanation:
      "Learn controller mapping, HTTP responses, dependency injection and layered API design.",
  },
  {
    label: "Transactions",
    filename: "InventoryService.java",
    code: `@Service
public class InventoryService {

    private final InventoryRepository repository;

    public InventoryService(
        InventoryRepository repository
    ) {
        this.repository = repository;
    }

    @Transactional
    public void reserveItem(Long itemId) {
        Inventory item = repository
            .findByIdForUpdate(itemId)
            .orElseThrow();

        if (item.getQuantity() <= 0) {
            throw new IllegalStateException(
                "Out of stock"
            );
        }

        item.setQuantity(item.getQuantity() - 1);
    }
}`,
    explanation:
      "Explore transactions, row-level locking and preventing race conditions in a real backend workflow.",
  },
];


/* ==========================================================
   EXTRA CONTENT (SEO + engagement)
========================================================== */

const EASE = [0.22, 1, 0.36, 1];

const ctaPrimary =
  "tt-shimmer group relative inline-flex min-h-[50px] items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-6 text-sm font-extrabold text-white shadow-xl shadow-orange-500/25 transition hover:-translate-y-0.5 hover:shadow-orange-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-60";

const NAV_LINKS = [
  ["#java-book", "Java book"],
  ["#why-spring", "Why this book"],
  ["#spring-quiz", "Quick quiz"],
  ["#sb-syllabus", "Syllabus"],
  ["#spring-code", "Code"],
  ["#spring-scenarios", "Scenarios"],
  ["#spring-plan", "7-day plan"],
  ["#sb-pricing", "Pricing"],
  ["#spring-faq", "FAQ"],
];

const MARQUEE_TERMS = [
  "Spring Boot",
  "IoC & DI",
  "Auto-configuration",
  "REST APIs",
  "Spring Data JPA",
  "Hibernate",
  "@Transactional",
  "Spring AOP",
  "Spring Security",
  "JWT",
  "OAuth2",
  "Microservices",
  "Redis",
  "Kafka",
  "Actuator",
  "Testcontainers",
];

const SCENARIOS = [
  {
    icon: Database,
    title: "Two users, one product",
    text: "How would you prevent overselling when two requests try to purchase the last available item?",
  },
  {
    icon: ShieldCheck,
    title: "Duplicate payment webhook",
    text: "How would you make webhook processing idempotent and avoid duplicate order fulfillment?",
  },
  {
    icon: Clock3,
    title: "A 5-second API",
    text: "How do you identify whether latency comes from database queries, thread pools or downstream calls?",
  },
  {
    icon: Zap,
    title: "High traffic spikes",
    text: "What happens when your application exhausts database connections or request threads?",
  },
  {
    icon: Workflow,
    title: "Kafka consumer failures",
    text: "How should retries, dead-letter topics and duplicate events be handled safely?",
  },
  {
    icon: Rocket,
    title: "Zero-downtime deployment",
    text: "How do you roll out new code safely while maintaining application availability?",
  },
];

const SPRING_QUIZ = [
  {
    question: "Which single annotation combines @Configuration, @EnableAutoConfiguration and @ComponentScan?",
    options: ["@SpringBootApplication", "@EnableWebMvc", "@ComponentScan", "@SpringBootConfiguration"],
    answer: 0,
    explain:
      "@SpringBootApplication is a convenience annotation that bundles those three. It is the entry point of auto-configuration and component scanning.",
  },
  {
    question: "Two beans of the same type exist. Which annotation lets you pick one explicitly at the injection point?",
    options: ["@Lazy", "@Qualifier", "@Scope", "@Value"],
    answer: 1,
    explain:
      "@Qualifier selects a bean by name at the injection point. @Primary marks a default candidate instead, so the two are often used together.",
  },
  {
    question: "A @Transactional method is called from another method in the same class. What happens to the transaction?",
    code: `@Service
public class OrderService {

    public void placeOrder() {
        reserveStock();      // internal call
    }

    @Transactional
    public void reserveStock() { /* ... */ }
}`,
    options: [
      "A new transaction always starts",
      "It is not applied — self-invocation bypasses the proxy",
      "Spring throws BeanCreationException",
      "It always rolls back",
    ],
    answer: 1,
    explain:
      "Spring applies @Transactional through a proxy. A call from inside the same class never goes through that proxy, so no transactional behaviour is added. Move the method to another bean to fix it.",
  },
];

const PAIN_POINTS = [
  {
    before: "Memorising annotations without knowing how they work",
    after: "Internals explained: proxies, bean lifecycle and auto-configuration",
  },
  {
    before: "Knowing CRUD but freezing on transaction and locking questions",
    after: "JPA, transactions and concurrency covered with code",
  },
  {
    before: "Theory-only answers when asked “what if production breaks?”",
    after: "A full chapter of real-world SDE-2 backend scenarios",
  },
  {
    before: "Scattered notes across blogs and videos",
    after: "100 questions, 10 chapters, one revision roadmap",
  },
];

const EXTRA_FAQS = [
  {
    q: "Which Spring Boot topics are covered in the 100 interview questions?",
    a: "Spring and Spring Boot fundamentals, IoC and dependency injection, REST APIs and exception handling, Spring Data JPA and Hibernate, transactions and AOP, Spring Security with JWT and OAuth2, microservices, Redis, Kafka and async processing, testing and monitoring, and real-world backend scenarios.",
  },
  {
    q: "Is there a Java interview book as well?",
    a: "Yes. Target Trek also has a Java Interview Handbook with 100 Core Java questions — OOP, Collections, Streams, concurrency, JVM and modern Java. It is linked right below the hero on this page.",
  },
];

/* ==========================================================
   SMALL HELPERS
========================================================== */

const cx = (...classes) => classes.filter(Boolean).join(" ");

const normalizeTheme = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "dark" || normalized === "light" ? normalized : null;
};

const readThemeFromStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return normalizeTheme(window.localStorage.getItem(STORAGE_THEME_KEY));
  } catch {
    return null;
  }
};

const readThemeFromDom = () => {
  if (typeof document === "undefined") return null;
  const html = document.documentElement;
  const body = document.body;

  const explicit =
    normalizeTheme(html.getAttribute("data-theme")) ||
    normalizeTheme(body?.getAttribute("data-theme"));
  if (explicit) return explicit;

  if (html.classList.contains("dark") || body?.classList.contains("dark")) return "dark";
  if (html.classList.contains("light") || body?.classList.contains("light")) return "light";
  return null;
};

function getStoredTheme() {
  if (typeof window === "undefined") return "light";

  return (
    readThemeFromStorage() ||
    readThemeFromDom() ||
    (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light")
  );
}

function normalizeBookResponse(json) {
  if (!json || json.success !== true || !json.data) {
    throw new Error(json?.message || "The book is currently unavailable.");
  }

  // Supports a product object returned directly or inside data.product.
  const data = json.data;
  const product = data.product && typeof data.product === "object" ? data.product : data;

  if (!product._id && !product.id) {
    throw new Error("The API did not return a valid book ID.");
  }

  const price = Number(product.price);

  if (!Number.isFinite(price) || price < 0 || product.price === null || product.price === undefined) {
    throw new Error("The book price is currently unavailable.");
  }

  if (product.active === false || product.isActive === false) {
    throw new Error("This book is not currently available for purchase.");
  }

  return product;
}

function formatPrice(value, currency = "INR") {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "Price unavailable";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

/* ==========================================================
   ANIMATION HELPERS
========================================================== */

function Reveal({ children, delay = 0, y = 26, className, as = "div", ...rest }) {
  const reduce = useReducedMotion();

  if (reduce) {
    const Plain = as;
    return (
      <Plain className={className} {...rest}>
        {children}
      </Plain>
    );
  }

  const Tag = motion[as] || motion.div;

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function CountUp({ to, suffix = "", duration = 1.4 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView) return undefined;

    if (reduce) {
      setValue(to);
      return undefined;
    }

    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setValue(Math.round(latest)),
    });

    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[120] h-[3px] origin-left bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600"
      style={{ scaleX }}
    />
  );
}

function TiltBook({ children }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 150, damping: 18 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 18 });

  const onMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  if (reduce) return <div>{children}</div>;

  return (
    <div style={{ perspective: 1000 }} onMouseMove={onMove} onMouseLeave={onLeave}>
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
        <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>{children}</motion.div>
      </motion.div>
    </div>
  );
}

function Section({ id, alt = false, isDarkMode, children, narrow = false, label }) {
  return (
    <section
      id={id}
      aria-labelledby={label}
      className={cx(
        "scroll-mt-28 py-16 sm:py-20 lg:py-24",
        alt && "border-y",
        alt && (isDarkMode ? "border-white/10 bg-[#17191e]" : "border-orange-100 bg-[#fff6ed]/70")
      )}
    >
      <div className={cx("mx-auto px-4 sm:px-6 lg:px-8", narrow ? "max-w-5xl" : "max-w-7xl")}>{children}</div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, description, centered = false, isDarkMode = false, id }) {
  return (
    <Reveal className={cx("max-w-3xl", centered && "mx-auto text-center")}>
      <p className="mb-3 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.19em] text-orange-600 dark:text-orange-400">
        <Sparkles size={14} />
        {eyebrow}
      </p>

      <h2
        id={id}
        className={cx(
          "text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:text-[43px]",
          isDarkMode ? "text-white" : "text-slate-950"
        )}
      >
        {title}
      </h2>

      {description && (
        <p className={cx("mt-4 text-sm leading-7 sm:text-base", isDarkMode ? "text-slate-400" : "text-slate-600")}>
          {description}
        </p>
      )}
    </Reveal>
  );
}

/* ==========================================================
   BOOK ARTWORK (fallback when no cover URL)
========================================================== */

function BookArtwork() {
  return (
    <div
      className="relative mx-auto w-[250px] sm:w-[300px]"
      aria-label="Illustration of the Spring Boot interview handbook"
      role="img"
    >
      <div className="absolute -inset-10 rounded-full bg-orange-500/20 blur-[65px]" />

      <div className="relative aspect-[0.72] overflow-hidden rounded-r-xl rounded-l-sm border-l-[9px] border-[#14110f] bg-gradient-to-br from-[#2a211d] via-[#1b1512] to-[#3a1d0c] p-6 text-white shadow-[18px_25px_60px_rgba(154,52,18,0.28)] sm:p-7">
        <div className="absolute -right-24 top-20 h-72 w-72 rounded-full border border-white/10" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between text-[11px] font-black tracking-[0.2em]">
            <span>TARGET TREK</span>
            <BookOpen size={19} color="#fb923c" />
          </div>

          <div className="mt-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/20">
            <Coffee size={30} className="text-orange-300" />
          </div>

          <p className="mt-6 text-[30px] font-black leading-[1.1] tracking-tight sm:text-[34px]">
            MASTERING
            <br />
            <span className="text-[#ff9d50]">SPRING BOOT</span>
            <br />
            INTERVIEWS
          </p>

          <p className="mt-5 text-[11px] font-semibold leading-5 text-orange-100/90">
            100 Essential Questions
            <br />
            Detailed Answers & Java Code
            <br />
            Real-World Backend Scenarios
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-white/20 pt-3 text-[9px] font-bold tracking-wide text-orange-200">
            <span>JAVA • BACKEND • SPRING</span>
            <span>100 Q&A</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   CONCEPT QUIZ (interactive)
========================================================== */

function ConceptQuiz({ isDarkMode, cardBg, mutedText, mainText }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const quiz = SPRING_QUIZ[index];
  const answered = picked !== null;

  const choose = (optionIndex) => {
    if (answered) return;
    setPicked(optionIndex);
    if (optionIndex === quiz.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 >= SPRING_QUIZ.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  return (
    <div className={cx("mx-auto mt-12 max-w-4xl rounded-3xl border p-5 shadow-sm sm:p-8", cardBg)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-orange-600">
          <Terminal size={16} /> Spring Boot quick quiz
        </span>
        <span className={cx("text-xs font-bold", mutedText)}>
          {done ? "Finished" : `Question ${index + 1} of ${SPRING_QUIZ.length}`} · Score {score}
        </span>
      </div>

      <div className="mt-4 flex gap-1.5" aria-hidden="true">
        {SPRING_QUIZ.map((item, i) => (
          <span
            key={item.question}
            className={cx(
              "h-1.5 flex-1 rounded-full transition-colors duration-500",
              i < index || done ? "bg-orange-500" : i === index ? "bg-orange-300" : isDarkMode ? "bg-white/10" : "bg-slate-200"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            className="py-10 text-center"
          >
            <Trophy className="mx-auto text-orange-500" size={44} />
            <h3 className={cx("mt-4 text-2xl font-black", mainText)}>
              You scored {score} / {SPRING_QUIZ.length}
            </h3>
            <p className={cx("mx-auto mt-2 max-w-md text-sm leading-7", mutedText)}>
              The handbook goes much deeper: 100 questions on Spring internals, JPA, security, microservices and production scenarios.
            </p>
            <button
              type="button"
              onClick={restart}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-orange-300 px-5 py-2.5 text-xs font-extrabold text-orange-600 transition hover:bg-orange-50"
            >
              <RefreshCcw size={15} /> Try again
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={index}
            initial={reduce ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <h3 className={cx("mt-6 text-lg font-extrabold leading-snug sm:text-xl", mainText)}>{quiz.question}</h3>

            {quiz.code && (
              <pre className="mt-4 overflow-x-auto rounded-2xl border border-slate-700 bg-[#151922] p-5 text-[12px] leading-7 text-slate-200 sm:text-[13px]">
                <code>{quiz.code}</code>
              </pre>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2" role="group" aria-label="Answer options">
              {quiz.options.map((option, optionIndex) => {
                const isRight = optionIndex === quiz.answer;
                const isPicked = optionIndex === picked;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => choose(optionIndex)}
                    disabled={answered}
                    className={cx(
                      "flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-bold transition",
                      !answered && "hover:-translate-y-0.5 hover:border-orange-400",
                      answered && isRight && "border-green-500 bg-green-500/10 text-green-600",
                      answered && isPicked && !isRight && "border-red-400 bg-red-500/10 text-red-500",
                      answered && !isRight && !isPicked && "opacity-50",
                      !answered && mainText,
                      !answered && (isDarkMode ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white")
                    )}
                  >
                    <span>{option}</span>
                    {answered && isRight && <CheckCircle2 size={18} className="shrink-0" />}
                    {answered && isPicked && !isRight && <XCircle size={18} className="shrink-0" />}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className={cx("mt-5 rounded-xl border-l-[3px] border-orange-500 p-4", isDarkMode ? "bg-orange-500/10" : "bg-orange-50")}>
                    <p className="text-[11px] font-black uppercase tracking-wider text-orange-600">
                      {picked === quiz.answer ? "Correct" : "Not quite"} — why?
                    </p>
                    <p className={cx("mt-2 text-sm leading-7", mainText)}>{quiz.explain}</p>
                  </div>
                  <button type="button" onClick={next} className={cx(ctaPrimary, "mt-5 min-h-[46px] text-xs")}>
                    {index + 1 >= SPRING_QUIZ.length ? "See my score" : "Next question"}
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==========================================================
   JAVA HANDBOOK COMPANION CARD (backend driven)
========================================================== */

function JavaBookCard({ isDarkMode, product, loading, error, onBuy, onRetry, cardBg, mutedText, mainText }) {
  const price = Number(product?.price);
  const mrpValue = Number(product?.mrp || 0);
  const currencyCode = product?.currency || "INR";
  const hasPrice = Boolean(product) && Number.isFinite(price) && price >= 0;
  const savings = hasPrice && mrpValue > price ? Math.round(((mrpValue - price) / mrpValue) * 100) : 0;

  const cover = product?.coverpageurl || product?.coverPageUrl || product?.cover_page_url || "";
  const title = product?.title || "Java Interview Handbook — 100 Questions";

  const description =
    product?.shortDescription ||
    "100 Core Java interview questions across 12 chapters — OOP, Strings, Collections and HashMap internals, Streams, multithreading, JVM and garbage collection, modern Java 17/21 and tricky output questions.";

  const features = [
    "100 questions · 12 chapters",
    "Collections & HashMap internals",
    "Streams, concurrency & JVM",
    "Java 17/21 & output puzzles",
  ];

  const canBuy = Boolean(product?._id) && hasPrice && !loading;

  return (
    <Reveal
      as="article"
      className={cx(
        "relative overflow-hidden rounded-[28px] border shadow-[0_18px_60px_rgba(154,52,18,0.12)]",
        isDarkMode ? "border-orange-400/25 bg-[#1b1613]" : "border-orange-200 bg-white"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-600 via-amber-400 to-orange-600" />
      <div className="tt-orb pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" aria-hidden="true" />

      <div className="relative grid gap-6 p-5 sm:grid-cols-[210px_1fr] sm:gap-8 sm:p-8 lg:grid-cols-[250px_1fr]">
        <div className="mx-auto w-full max-w-[200px] sm:max-w-none">
          {loading ? (
            <div className={cx("aspect-[0.72] w-full animate-pulse rounded-2xl", isDarkMode ? "bg-white/10" : "bg-orange-100")} />
          ) : cover ? (
            <motion.img
              whileHover={{ rotate: -2, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              src={cover}
              alt={`${title} ebook cover`}
              loading="lazy"
              decoding="async"
              className="w-full rounded-2xl object-contain shadow-[14px_20px_40px_rgba(0,0,0,0.22)] ring-1 ring-black/5"
            />
          ) : (
            <motion.div
              whileHover={{ rotate: -2, scale: 1.04 }}
              className="relative flex aspect-[0.72] w-full flex-col justify-between overflow-hidden rounded-2xl border-l-[8px] border-orange-900 bg-gradient-to-br from-orange-400 via-orange-600 to-orange-900 p-5 text-white shadow-[14px_20px_40px_rgba(0,0,0,0.22)]"
            >
              <span className="text-[10px] font-black tracking-[0.2em]">TARGET TREK</span>
              <div>
                <Coffee size={34} className="mb-3 text-white/85" />
                <p className="text-2xl font-black leading-tight">
                  JAVA
                  <br />
                  INTERVIEW
                  <br />
                  HANDBOOK
                </p>
                <p className="mt-3 text-sm font-bold text-orange-100">100 Questions</p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-orange-600">
              Start with the fundamentals
            </span>
            <span className={cx("rounded-full border px-3 py-1 text-[10px] font-bold", isDarkMode ? "border-white/10 text-slate-300" : "border-slate-200 text-slate-600")}>
              Digital PDF ebook
            </span>
            {savings > 0 && (
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-extrabold text-green-600">{savings}% OFF</span>
            )}
          </div>

          {loading ? (
            <div className="mt-4 space-y-3">
              <div className={cx("h-7 w-4/5 animate-pulse rounded-lg", isDarkMode ? "bg-white/10" : "bg-orange-100")} />
              <div className={cx("h-4 w-full animate-pulse rounded", isDarkMode ? "bg-white/10" : "bg-orange-50")} />
              <div className={cx("h-4 w-2/3 animate-pulse rounded", isDarkMode ? "bg-white/10" : "bg-orange-50")} />
            </div>
          ) : (
            <>
              <h3 className={cx("mt-4 text-2xl font-black leading-tight tracking-tight sm:text-3xl", mainText)}>{title}</h3>
              <p className={cx("mt-3 text-sm leading-7", mutedText)}>{description}</p>

              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {features.map((feature) => (
                  <li key={feature} className={cx("flex items-center gap-2 text-xs font-bold", mainText)}>
                    <CheckCircle2 size={16} className="shrink-0 text-orange-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className={cx("mt-6 flex flex-wrap items-end gap-x-6 gap-y-4 border-t pt-5", isDarkMode ? "border-white/10" : "border-slate-200")}>
            <div>
              {loading ? (
                <div className={cx("h-9 w-28 animate-pulse rounded-lg", isDarkMode ? "bg-white/10" : "bg-orange-100")} />
              ) : hasPrice ? (
                <div className="flex items-end gap-2">
                  <span className={cx("text-3xl font-black tracking-tight", mainText)}>{formatPrice(price, currencyCode)}</span>
                  {mrpValue > price && (
                    <span className={cx("pb-1 text-sm line-through", mutedText)}>{formatPrice(mrpValue, currencyCode)}</span>
                  )}
                </div>
              ) : (
                <span className={cx("text-sm font-semibold", mutedText)}>
                  {error ? "Price unavailable right now" : "See details for pricing"}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-wrap gap-3 sm:justify-end">
              {canBuy && (
                <button type="button" onClick={onBuy} className={ctaPrimary}>
                  <LockKeyhole size={16} />
                  Buy Java book
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </button>
              )}

              <a
                href={JAVA_BOOK_PATH}
                className={cx(
                  "inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl border px-5 text-sm font-extrabold transition hover:-translate-y-0.5 hover:border-orange-500 hover:text-orange-500",
                  cardBg,
                  mainText
                )}
              >
                Explore the book
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>

          {error && !loading && (
            <button type="button" onClick={onRetry} className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-orange-600 underline">
              <RefreshCcw size={14} /> Reload price
            </button>
          )}
        </div>
      </div>
    </Reveal>
  );
}

/* ==========================================================
   CODE TABS
========================================================== */

function CodeTabs() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const sample = CODE_SAMPLES[active];

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(sample.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-[#151922] shadow-2xl">
      <div className="flex gap-1 overflow-x-auto border-b border-slate-700 bg-[#1c2230] p-2" role="tablist" aria-label="Code examples">
        {CODE_SAMPLES.map((item, index) => (
          <button
            key={item.label}
            type="button"
            role="tab"
            aria-selected={active === index}
            onClick={() => {
              setActive(index);
              setCopied(false);
            }}
            className={cx(
              "shrink-0 rounded-lg px-3.5 py-2 text-xs font-bold transition",
              active === index ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between border-b border-slate-700 bg-[#1c2230] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          </div>
          <span className="ml-3 text-xs text-slate-400">{sample.filename}</span>
        </div>

        <button
          type="button"
          onClick={copyCode}
          className="flex items-center gap-1.5 rounded-md border border-slate-600 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={sample.filename}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="overflow-x-auto p-5 sm:p-7">
            <pre className="text-[11px] leading-7 text-slate-200 sm:text-[12px]">
              <code>{sample.code}</code>
            </pre>
          </div>

          <div className="flex items-start gap-2 border-t border-slate-700 bg-[#1c2230] px-5 py-3 text-xs leading-6 text-slate-400">
            <Terminal size={15} className="mt-1 shrink-0 text-orange-400" />
            {sample.explanation}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


/* ==========================================================
   MAIN COMPONENT
========================================================== */

export default function SpringBootInterviewHandbook() {
  const reduce = useReducedMotion();

  const [theme, setTheme] = useState(getStoredTheme);
  const isDarkMode = theme === "dark";

  /* BACKEND PRODUCT — Spring Boot */
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* BACKEND PRODUCT — Java companion book */
  const [javaProduct, setJavaProduct] = useState(null);
  const [loadingJava, setLoadingJava] = useState(true);
  const [javaError, setJavaError] = useState("");
  const [javaReloadKey, setJavaReloadKey] = useState(0);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);

  const [expandedChapters, setExpandedChapters] = useState(["01"]);
  const [chapterQuery, setChapterQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  /* STICKY CARD VISIBILITY */
  const heroRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* THEME SYNC WITH THE EXISTING WEBSITE */
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return undefined;

    let lastStorageTheme = readThemeFromStorage();
    let lastDomTheme = readThemeFromDom();

    const commitTheme = (nextTheme) => {
      if (!nextTheme) return;
      setTheme((current) => (current === nextTheme ? current : nextTheme));
    };

    const syncTheme = () => {
      const storageTheme = readThemeFromStorage();
      const domTheme = readThemeFromDom();

      if (storageTheme && storageTheme !== lastStorageTheme) {
        lastStorageTheme = storageTheme;
        lastDomTheme = domTheme;
        commitTheme(storageTheme);
        return;
      }

      if (domTheme && domTheme !== lastDomTheme) {
        lastDomTheme = domTheme;
        lastStorageTheme = storageTheme;
        commitTheme(domTheme);
        return;
      }

      lastStorageTheme = storageTheme;
      lastDomTheme = domTheme;

      commitTheme(
        storageTheme ||
          domTheme ||
          (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light")
      );
    };

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    if (document.body) {
      observer.observe(document.body, { attributes: true, attributeFilter: ["class", "data-theme"] });
    }

    syncTheme();

    // Handles same-tab updates from a navbar that only writes localStorage.
    const intervalId = window.setInterval(syncTheme, 500);

    window.addEventListener("storage", syncTheme);
    window.addEventListener("themechange", syncTheme);
    window.addEventListener("targettrek-theme-change", syncTheme);
    window.addEventListener("focus", syncTheme);

    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("themechange", syncTheme);
      window.removeEventListener("targettrek-theme-change", syncTheme);
      window.removeEventListener("focus", syncTheme);
    };
  }, []);

  /* REFERRAL TRACKING (compatible with Target Trek) */
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const referral = params.get("referralCode") || params.get("ref");

      if (referral && /^[a-zA-Z0-9_-]{1,64}$/.test(referral)) {
        localStorage.setItem("referralCode", referral);
      }
    } catch {
      // Local storage may be unavailable.
    }
  }, []);

  /* BACKEND PRODUCT FETCH — Spring Boot (unchanged request + validation) */
  const fetchBook = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(BOOK_ENDPOINT, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal,
      });

      let result;

      try {
        result = await response.json();
      } catch {
        throw new Error("Unable to read the book response.");
      }

      if (!response.ok) {
        throw new Error(result?.message || `Request failed (${response.status}).`);
      }

      const book = normalizeBookResponse(result);

      if (signal?.aborted) return;

      setProduct(book);
    } catch (err) {
      if (signal?.aborted || err?.name === "AbortError") return;

      setProduct(null);
      setError(err?.message || "Unable to load the book right now.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchBook(controller.signal);
    return () => controller.abort();
  }, [fetchBook]);

  /* BACKEND PRODUCT FETCH — Java Interview Handbook (same endpoint, other redirectUrl) */
  useEffect(() => {
    const controller = new AbortController();

    const fetchJavaBook = async () => {
      try {
        setLoadingJava(true);
        setJavaError("");

        const response = await fetch(JAVA_BOOK_ENDPOINT, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(result?.message || `Request failed (${response.status}).`);
        }

        const book = normalizeBookResponse(result);

        if (book.isDeleted === true) {
          throw new Error("The Java handbook is currently unavailable.");
        }

        setJavaProduct(book);
      } catch (err) {
        if (err?.name === "AbortError") return;

        console.error("Failed to fetch Java handbook:", err);
        setJavaProduct(null);
        setJavaError(err?.message || "Java handbook details are unavailable.");
      } finally {
        if (!controller.signal.aborted) setLoadingJava(false);
      }
    };

    fetchJavaBook();

    return () => controller.abort();
  }, [javaReloadKey]);

  /* DYNAMIC PRICE FROM BACKEND */
  const currency = product?.currency || "INR";
  const price = product ? Number(product.price) : null;
  const mrp = product ? Number(product.mrp) : null;
  const validMrp = Number.isFinite(mrp) && mrp > price;

  const formattedPrice = product && price !== null ? formatPrice(price, currency) : "Price unavailable";
  const formattedMrp = validMrp ? formatPrice(mrp, currency) : null;
  const savingsAmount = validMrp ? formatPrice(mrp - price, currency) : null;
  const discount = validMrp && price !== null ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const canPurchase = !!product && Number.isFinite(price) && !loading;

  const bookCover = product?.coverpageurl || product?.coverPageUrl || product?.cover_page_url || "";
  const productName = product?.title || "Mastering Spring Boot Interviews";
  const canonicalUrl = `${SITE_URL}${BOOK_PATH}`;

  /* META PIXEL — once per loaded product */
  const trackedContentRef = useRef(null);

  useEffect(() => {
    if (!product || !canPurchase) return;

    const id = String(product._id || product.id);
    const key = `${id}:${price}:${currency}`;
    if (trackedContentRef.current === key) return;

    const sent = trackViewContent({
      id,
      title: product.title || "Spring Boot Interview Handbook",
      price,
      currency,
    });

    if (sent !== false) trackedContentRef.current = key;
  }, [product, canPurchase, price, currency]);

  /* CHECKOUT */
  const handleBuyNow = useCallback(() => {
    if (!canPurchase) return;
    setCheckoutProduct(product);
    setCheckoutOpen(true);
  }, [canPurchase, product]);

  const handleJavaBuyNow = useCallback(() => {
    if (!javaProduct) return;
    setCheckoutProduct(javaProduct);
    setCheckoutOpen(true);
  }, [javaProduct]);

  const closeCheckout = useCallback(() => {
    setCheckoutOpen(false);
  }, []);

  /* PAGE INTERACTIONS */
  const filteredChapters = useMemo(() => {
    const query = chapterQuery.trim().toLowerCase();
    if (!query) return CHAPTERS;

    return CHAPTERS.filter((chapter) =>
      [chapter.title, chapter.subtitle, chapter.range, ...chapter.topics, ...chapter.questions]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [chapterQuery]);

  const allChaptersOpen = expandedChapters.length === CHAPTERS.length;

  const toggleChapter = (number) => {
    setExpandedChapters((previous) =>
      previous.includes(number) ? previous.filter((item) => item !== number) : [...previous, number]
    );
  };

  const toggleAllChapters = () => {
    setExpandedChapters(allChaptersOpen ? [] : CHAPTERS.map((chapter) => chapter.number));
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const allFaqs = useMemo(() => [...FAQS, ...EXTRA_FAQS], []);

  /* STRUCTURED DATA */
  const structuredData = useMemo(() => {
    const priceValidUntil = `${new Date().getFullYear() + 1}-12-31`;

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: SITE_NAME,
          url: SITE_URL,
          email: "supporttargettrek@gmail.com",
        },
        {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          url: SITE_URL,
          name: SITE_NAME,
          inLanguage: "en-IN",
          publisher: { "@id": `${SITE_URL}/#organization` },
        },
        {
          "@type": "WebPage",
          "@id": `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: SEO_TITLE,
          description: SEO_DESCRIPTION,
          inLanguage: "en-IN",
          isPartOf: { "@id": `${SITE_URL}/#website` },
          breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },
          about: { "@id": `${canonicalUrl}#product` },
          ...(bookCover ? { primaryImageOfPage: { "@type": "ImageObject", url: bookCover } } : {}),
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${canonicalUrl}#breadcrumb`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
            { "@type": "ListItem", position: 3, name: "Spring Boot Interview Handbook", item: canonicalUrl },
          ],
        },
        {
          "@type": ["Product", "Book"],
          "@id": `${canonicalUrl}#product`,
          name: productName,
          description: SEO_LONG_DESCRIPTION,
          url: canonicalUrl,
          category: "Spring Boot Interview Preparation Ebook",
          keywords: SEO_KEYWORDS,
          inLanguage: "en",
          bookFormat: "https://schema.org/EBook",
          genre: "Computer science, Spring Boot, interview preparation",
          audience: {
            "@type": "Audience",
            audienceType: "Java backend developers preparing for Spring Boot interviews",
          },
          brand: { "@type": "Brand", name: SITE_NAME },
          author: { "@id": `${SITE_URL}/#organization` },
          publisher: { "@id": `${SITE_URL}/#organization` },
          isAccessibleForFree: false,
          ...(product?._id ? { sku: String(product._id) } : {}),
          ...(bookCover ? { image: [bookCover] } : {}),
          ...(canPurchase
            ? {
                offers: {
                  "@type": "Offer",
                  url: canonicalUrl,
                  price: String(price),
                  priceCurrency: currency,
                  priceValidUntil,
                  availability: "https://schema.org/InStock",
                  itemCondition: "https://schema.org/NewCondition",
                  hasMerchantReturnPolicy: {
                    "@type": "MerchantReturnPolicy",
                    returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
                  },
                  seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
                },
              }
            : {}),
        },
        {
          "@type": "ItemList",
          "@id": `${canonicalUrl}#chapters`,
          name: "Chapters in the Spring Boot Interview Handbook",
          numberOfItems: CHAPTERS.length,
          itemListElement: CHAPTERS.map((chapter, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: `${chapter.title} (${chapter.range})`,
            description: chapter.topics.join(", "),
          })),
        },
        {
          "@type": "FAQPage",
          "@id": `${canonicalUrl}#faq`,
          mainEntity: allFaqs.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        },
      ],
    };
  }, [allFaqs, bookCover, canPurchase, canonicalUrl, currency, price, product?._id, productName]);

  /* THEME CLASSES */
  const pageBg = isDarkMode ? "bg-[#100e0d] text-white" : "bg-[#fffdf9] text-slate-950";
  const cardBg = isDarkMode ? "bg-[#1b1816] border-white/10" : "bg-white border-slate-200";
  const mutedText = isDarkMode ? "text-slate-400" : "text-slate-600";
  const mainText = isDarkMode ? "text-white" : "text-slate-950";
  const subtleBorder = isDarkMode ? "border-white/10" : "border-slate-200";

  const buyLabel = loading ? (
    <>
      <Loader2 size={18} className="animate-spin" />
      Loading book...
    </>
  ) : !canPurchase ? (
    <>
      <RefreshCcw size={17} />
      Currently unavailable
    </>
  ) : (
    <>
      <LockKeyhole size={18} />
      Get the Handbook — {formattedPrice}
      <ArrowRight size={18} className="transition group-hover:translate-x-1" />
    </>
  );

  /* ========================================================
     MAIN JSX
  ======================================================== */

  return (
    <>
      <Helmet htmlAttributes={{ lang: "en" }}>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <meta name="keywords" content={SEO_KEYWORDS} />
        <meta name="author" content={SITE_NAME} />
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        <meta name="theme-color" content={isDarkMode ? "#100e0d" : "#fff7ed"} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en-IN" href={canonicalUrl} />
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
        {bookCover && <link rel="preload" as="image" href={bookCover} />}

        <meta property="og:type" content="product" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:url" content={canonicalUrl} />
        {canPurchase && <meta property="product:price:amount" content={String(price)} />}
        {canPurchase && <meta property="product:price:currency" content={currency} />}
        {bookCover && <meta property="og:image" content={bookCover} />}
        {bookCover && <meta property="og:image:alt" content={`${productName} ebook cover`} />}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESCRIPTION} />
        {bookCover && <meta name="twitter:image" content={bookCover} />}

        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <style>{`
        @media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }

        .tt-gradient-text { background-size: 200% auto; animation: tt-gradient 6s linear infinite; }
        @keyframes tt-gradient { to { background-position: 200% center; } }

        .tt-orb { animation: tt-float 12s ease-in-out infinite; }
        .tt-orb-2 { animation-duration: 16s; animation-delay: -4s; }
        @keyframes tt-float {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(24px,-30px,0) scale(1.08); }
        }

        .tt-shimmer::after {
          content: ""; position: absolute; inset: 0; transform: translateX(-120%);
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.35) 50%, transparent 70%);
          animation: tt-sheen 3.4s ease-in-out infinite; pointer-events: none;
        }
        @keyframes tt-sheen { 0%, 55% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }

        .tt-pulse { animation: tt-pulse 2.4s ease-out infinite; }
        @media (min-width: 768px) { .md-tt-no-pulse { animation: none; } }
        @keyframes tt-pulse {
          0% { box-shadow: 0 0 0 0 rgba(249,115,22,.45); }
          70%, 100% { box-shadow: 0 0 0 14px rgba(249,115,22,0); }
        }

        .tt-marquee { display: flex; width: max-content; animation: tt-marquee 40s linear infinite; }
        .tt-marquee-wrap:hover .tt-marquee { animation-play-state: paused; }
        @keyframes tt-marquee { to { transform: translateX(-50%); } }

        @media (prefers-reduced-motion: reduce) {
          .tt-gradient-text, .tt-orb, .tt-shimmer::after, .tt-pulse, .tt-marquee { animation: none !important; }
          .tt-marquee { flex-wrap: wrap; width: auto; }
        }
      `}</style>

      <ScrollProgress />

      <main
        data-sb-theme={theme}
        className={cx(
          "tt-spring-page mt-16 min-h-screen w-full overflow-x-clip pb-28",
          "font-['Inter',sans-serif] transition-colors duration-300",
          pageBg
        )}
      >
        {/* ON-PAGE NAVIGATION */}
        <nav
          aria-label="On this page"
          className={cx(
            "sticky top-16 z-40 border-b backdrop-blur-xl",
            isDarkMode ? "border-white/10 bg-[#100e0d]/85" : "border-orange-100 bg-white/85"
          )}
        >
          <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 text-xs font-bold sm:px-6 lg:px-8">
            {NAV_LINKS.map(([href, label]) => (
              <li key={href} className="shrink-0">
                <a
                  href={href}
                  className={cx(
                    "inline-block rounded-full px-3 py-1.5 transition hover:bg-orange-500/10 hover:text-orange-500",
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  )}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ================================================
            HERO
        ================================================ */}
        <section
          ref={heroRef}
          aria-labelledby="sb-hero-title"
          className={cx(
            "relative overflow-hidden pt-6 pb-14 sm:pt-10 sm:pb-20 lg:pt-14 lg:pb-24",
            isDarkMode ? "bg-[#100e0d]" : "bg-gradient-to-br from-white via-[#fffdf9] to-orange-50/60"
          )}
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="tt-orb absolute -right-32 top-20 h-[470px] w-[470px] rounded-full bg-orange-400/15 blur-[110px]" />
            <div className="tt-orb tt-orb-2 absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full bg-amber-400/10 blur-[110px]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" className={cx("mb-6 text-xs", mutedText)}>
              <ol className="flex flex-wrap items-center gap-2">
                <li><a className="font-semibold hover:text-orange-500" href="/">Home</a></li>
                <li aria-hidden="true">/</li>
                <li><a className="font-semibold hover:text-orange-500" href="/books">Books</a></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className={cx("font-bold", mainText)}>Spring Boot Interview Handbook</li>
              </ol>
            </nav>

            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <div>
                <Reveal
                  y={14}
                  className={cx(
                    "mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider",
                    isDarkMode
                      ? "border-orange-500/30 bg-orange-500/10 text-orange-300"
                      : "border-orange-200 bg-orange-50 text-orange-700"
                  )}
                >
                  <Flame size={14} />
                  Target Trek interview handbook · PDF ebook
                </Reveal>

                <Reveal
                  as="h1"
                  delay={0.06}
                  id="sb-hero-title"
                  className={cx(
                    "max-w-2xl text-[38px] font-black leading-[1.08] tracking-[-0.05em] sm:text-[54px] lg:text-[62px]",
                    mainText
                  )}
                >
                  Spring Boot Interview
                  <br />
                  Questions{" "}
                  <span className="tt-gradient-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                    & Answers.
                  </span>
                </Reveal>

                <Reveal as="p" delay={0.12} className={cx("mt-6 max-w-xl text-lg font-semibold leading-8", isDarkMode ? "text-slate-200" : "text-slate-800")}>
                  Master Spring Boot and crack your backend interview with 100 essential questions.
                </Reveal>

                <Reveal as="p" delay={0.16} className={cx("mt-4 max-w-xl text-sm leading-7", mutedText)}>
                  From Spring Core and Dependency Injection to REST APIs, JPA, transactions, security,
                  Kafka, Redis and microservices — prepare with detailed explanations and Java code.
                </Reveal>

                <div className="mt-7 grid max-w-xl gap-2.5 sm:grid-cols-2">
                  {["100 interview questions", "10 focused chapters", "Java code examples", "Real backend scenarios"].map(
                    (item, index) => (
                      <Reveal key={item} delay={0.2 + index * 0.07} y={12} className="flex items-center gap-2.5 text-sm font-bold">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-400/15 text-orange-500">
                          <Check size={14} strokeWidth={3} />
                        </span>
                        <span className={isDarkMode ? "text-slate-300" : "text-slate-700"}>{item}</span>
                      </Reveal>
                    )
                  )}
                </div>

                <Reveal delay={0.3} className={cx("mt-8 border-t pt-6", subtleBorder)}>
                  {loading ? (
                    <div className="h-10 w-36 animate-pulse rounded-lg bg-orange-100 dark:bg-white/10" />
                  ) : canPurchase ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={cx("text-[38px] font-black tracking-tight", mainText)}>{formattedPrice}</span>
                      {formattedMrp && <span className={cx("text-lg line-through", mutedText)}>{formattedMrp}</span>}
                      {discount > 0 && (
                        <span className={cx("rounded-md px-2.5 py-1 text-xs font-extrabold", isDarkMode ? "bg-orange-500/15 text-orange-300" : "bg-orange-100 text-orange-700")}>
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className={cx("text-sm font-semibold", mutedText)}>Price unavailable</p>
                  )}

                  {savingsAmount && <p className="mt-2 text-xs font-extrabold text-green-600">You save {savingsAmount} today</p>}

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={handleBuyNow} disabled={!canPurchase} className={ctaPrimary}>
                      {buyLabel}
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollToSection("sb-syllabus")}
                      className={cx(
                        "inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl border px-6 text-sm font-extrabold transition-all hover:-translate-y-0.5 hover:border-orange-500 hover:text-orange-500",
                        cardBg,
                        mainText
                      )}
                    >
                      <BookOpen size={16} />
                      Explore All 100 Questions
                    </button>
                  </div>

                  <div className={cx("mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold", mutedText)}>
                    <span className="inline-flex items-center gap-1.5"><Download size={15} className="text-orange-500" /> Access after successful payment</span>
                    <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-green-600" /> Secure checkout</span>
                    <span className="inline-flex items-center gap-1.5"><FileText size={15} className="text-orange-500" /> Digital ebook</span>
                  </div>

                  {error && (
                    <div role="alert" className="mt-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                      <strong>Book information unavailable.</strong>
                      <p className="mt-1">{error}</p>
                      <button
                        type="button"
                        onClick={() => fetchBook()}
                        disabled={loading}
                        className="mt-3 inline-flex items-center gap-2 font-bold underline"
                      >
                        <RefreshCcw size={14} />
                        Try Again
                      </button>
                    </div>
                  )}
                </Reveal>
              </div>

              <Reveal delay={0.15} y={36} className="relative flex min-h-[400px] items-center justify-center py-5 sm:min-h-[500px]">
                <div className="absolute h-80 w-80 rounded-full bg-orange-500/15 blur-[75px]" aria-hidden="true" />

                <motion.div
                  initial={reduce ? false : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className={cx("absolute right-0 top-6 z-10 hidden items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold shadow-lg sm:flex", cardBg, mainText)}
                >
                  <CheckCircle2 size={17} className="text-green-600" />
                  100 Interview Questions
                </motion.div>

                <div className="relative z-[2] w-full max-w-[350px]">
                  <TiltBook>
                    {bookCover ? (
                      <div className="relative">
                        <div className="absolute inset-6 bg-orange-500/20 blur-3xl" />
                        <img
                          src={bookCover}
                          alt={`${productName} ebook cover`}
                          loading="eager"
                          decoding="async"
                          fetchPriority="high"
                          className="relative mx-auto max-h-[490px] w-full object-contain drop-shadow-[16px_24px_24px_rgba(0,0,0,0.18)]"
                        />
                      </div>
                    ) : (
                      <BookArtwork />
                    )}
                  </TiltBook>
                </div>

                <motion.div
                  initial={reduce ? false : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className={cx("absolute bottom-4 left-0 z-10 hidden items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold shadow-lg sm:flex", cardBg, mainText)}
                >
                  <Terminal size={17} className="text-orange-500" />
                  Code + Concepts
                </motion.div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================================================
            JAVA HANDBOOK — RIGHT AFTER THE HERO
            Loaded from /book/product?redirectUrl=/book/java-interview-handbook
        ================================================ */}
        <section
          id="java-book"
          aria-labelledby="java-book-title"
          className={cx("scroll-mt-28 border-y py-14 sm:py-16", isDarkMode ? "border-white/10 bg-[#15110f]" : "border-orange-100 bg-[#fff6ed]/70")}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              id="java-book-title"
              eyebrow="Also from Target Trek"
              title="Strong Java basics make Spring Boot easier. Get the Java handbook too."
              description="Most Spring Boot interviews start with Core Java — collections, concurrency and the JVM. Buy it now or explore the full syllabus first."
              isDarkMode={isDarkMode}
            />

            <div className="mt-8">
              <JavaBookCard
                isDarkMode={isDarkMode}
                product={javaProduct}
                loading={loadingJava}
                error={javaError}
                onBuy={handleJavaBuyNow}
                onRetry={() => setJavaReloadKey((key) => key + 1)}
                cardBg={cardBg}
                mutedText={mutedText}
                mainText={mainText}
              />
            </div>
          </div>
        </section>

        {/* TOPIC MARQUEE */}
        <div
          className={cx("tt-marquee-wrap overflow-hidden border-b py-4", isDarkMode ? "border-white/10 bg-[#13100e]" : "border-orange-100 bg-white")}
          aria-label="Spring Boot topics covered"
        >
          <div className="tt-marquee">
            {[...MARQUEE_TERMS, ...MARQUEE_TERMS].map((term, index) => (
              <span
                key={`${term}-${index}`}
                aria-hidden={index >= MARQUEE_TERMS.length ? "true" : undefined}
                className={cx(
                  "mx-2 inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em]",
                  isDarkMode ? "border-white/10 bg-white/[0.04] text-slate-300" : "border-orange-100 bg-orange-50/70 text-orange-700"
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                {term}
              </span>
            ))}
          </div>
        </div>

        {/* STATS */}
        <section aria-label="Book at a glance" className={cx("border-b", subtleBorder)}>
          <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
            {[
              [100, "Interview Questions"],
              [10, "Detailed Chapters"],
              ["Java", "Code Examples"],
              ["SDE-1/2", "Interview Focus"],
            ].map(([value, label], index) => (
              <div
                key={label}
                className={cx(
                  "px-4 py-7 text-center",
                  index % 2 === 0 && "border-r",
                  index < 2 && "border-b md:border-b-0",
                  index === 1 && "md:border-r",
                  index === 2 && "md:border-r",
                  subtleBorder
                )}
              >
                <div className="text-3xl font-extrabold text-orange-500 sm:text-4xl">
                  {typeof value === "number" ? <CountUp to={value} /> : value}
                </div>
                <div className={cx("mt-1 text-xs font-bold uppercase tracking-[0.12em] sm:text-sm", mutedText)}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================
            WHY THIS HANDBOOK
        ================================================ */}
        <Section id="why-spring" isDarkMode={isDarkMode} label="why-title">
          <SectionHeading
            id="why-title"
            eyebrow="Why this handbook"
            title="Understand Spring Boot the way interviewers test it."
            description="Go beyond annotations. Learn how Spring works internally, connect it to real production systems and answer follow-ups with confidence."
            centered
            isDarkMode={isDarkMode}
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((item, index) => {
              const Icon = item.icon;

              return (
                <Reveal
                  key={item.title}
                  delay={(index % 3) * 0.07}
                  className={cx("group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-400 hover:shadow-xl", cardBg)}
                >
                  <div
                    className={cx(
                      "mb-6 flex h-12 w-12 items-center justify-center rounded-xl transition duration-300 group-hover:-rotate-6 group-hover:scale-110",
                      isDarkMode ? "bg-orange-500/15" : "bg-orange-50"
                    )}
                  >
                    <Icon size={23} className="text-orange-500" />
                  </div>
                  <h3 className={cx("text-base font-extrabold", mainText)}>{item.title}</h3>
                  <p className={cx("mt-3 text-xs leading-6", mutedText)}>{item.text}</p>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {PAIN_POINTS.map((item, index) => (
              <Reveal key={item.before} delay={(index % 2) * 0.08} className={cx("rounded-2xl border p-5 sm:p-6", cardBg)}>
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                  <p className={cx("text-sm font-semibold leading-6 line-through decoration-rose-400/60", mutedText)}>{item.before}</p>
                </div>
                <div className="mt-3 flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                  <p className={cx("text-sm font-extrabold leading-6", mainText)}>{item.after}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* QUIZ */}
        <Section id="spring-quiz" alt isDarkMode={isDarkMode} label="quiz-title">
          <SectionHeading
            id="quiz-title"
            eyebrow="Try it yourself"
            title="3 quick Spring Boot interview questions."
            description="Pick an answer and read the explanation — the handbook explains 100 questions in this depth."
            centered
            isDarkMode={isDarkMode}
          />
          <ConceptQuiz isDarkMode={isDarkMode} cardBg={cardBg} mutedText={mutedText} mainText={mainText} />
        </Section>

        {/* AUDIENCE */}
        <Section id="who-for" isDarkMode={isDarkMode} label="who-title">
          <SectionHeading
            id="who-title"
            eyebrow="Who is it for"
            title="Built for Java developers moving into backend roles."
            description="From freshers to SDE-2 candidates: theory, internals, implementation and scenario-based rounds."
            isDarkMode={isDarkMode}
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {AUDIENCE.map((item, index) => {
              const Icon = item.icon;

              return (
                <Reveal
                  key={item.label}
                  delay={index * 0.07}
                  className={cx("rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-xl", cardBg)}
                >
                  <div className={cx("mb-5 flex h-11 w-11 items-center justify-center rounded-xl", isDarkMode ? "bg-orange-500/15" : "bg-orange-50")}>
                    <Icon size={21} className="text-orange-500" />
                  </div>
                  <h3 className={cx("text-base font-extrabold", mainText)}>{item.label}</h3>
                  <p className={cx("mt-2 text-sm leading-6", mutedText)}>{item.text}</p>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* ================================================
            SYLLABUS
        ================================================ */}
        <Section id="sb-syllabus" alt isDarkMode={isDarkMode} label="syllabus-title">
          <SectionHeading
            id="syllabus-title"
            eyebrow="Complete table of contents"
            title="10 chapters. 100 Spring Boot interview questions."
            description="Search every chapter, topic and question. Chapter details stay on the page, so you can scan the whole syllabus quickly."
            isDarkMode={isDarkMode}
          />

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className={cx("flex h-12 w-full items-center gap-3 rounded-xl border px-4 sm:max-w-sm", cardBg)}>
              <Search size={18} className="text-orange-500" />
              <input
                type="search"
                value={chapterQuery}
                onChange={(event) => setChapterQuery(event.target.value)}
                placeholder="Search e.g. JWT, Kafka, @Transactional…"
                aria-label="Search chapters, topics and questions"
                className={cx("min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500", mainText)}
              />
              {chapterQuery && (
                <button type="button" onClick={() => setChapterQuery("")} aria-label="Clear search" className={mutedText}>
                  <X size={17} />
                </button>
              )}
            </div>

            <button type="button" onClick={toggleAllChapters} className="flex items-center gap-1.5 text-xs font-extrabold text-orange-600">
              {allChaptersOpen ? "Collapse All" : "Expand All"}
              <ChevronDown size={15} className={cx("transition-transform", allChaptersOpen && "rotate-180")} />
            </button>
          </div>

          <p className={cx("mb-4 mt-5 text-xs font-semibold", mutedText)}>
            Showing <strong>{filteredChapters.length}</strong> of {CHAPTERS.length} chapters
          </p>

          <div className="space-y-3">
            {filteredChapters.map((chapter) => {
              const Icon = chapter.icon;
              const isOpen = expandedChapters.includes(chapter.number);
              const contentId = `sb-chapter-${chapter.number}`;

              return (
                <Reveal
                  key={chapter.number}
                  y={16}
                  className={cx(
                    "overflow-hidden rounded-xl border transition-colors",
                    isOpen ? "border-orange-400" : subtleBorder,
                    isDarkMode ? "bg-[#1b1816]" : "bg-white"
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => toggleChapter(chapter.number)}
                      aria-expanded={isOpen}
                      aria-controls={contentId}
                      className={cx(
                        "flex w-full items-center gap-3 px-4 py-5 text-left sm:gap-5 sm:px-6",
                        isDarkMode ? "hover:bg-white/[0.03]" : "hover:bg-orange-50/40"
                      )}
                    >
                      <span
                        className={cx(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                          isDarkMode ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-600"
                        )}
                      >
                        <Icon size={21} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-extrabold uppercase tracking-widest text-orange-600">
                          Chapter {chapter.number} • {chapter.range}
                        </span>
                        <span className={cx("mt-1 block text-sm font-extrabold sm:text-base", mainText)}>{chapter.title}</span>
                        <span className={cx("mt-0.5 block text-[11px] font-normal sm:text-xs", mutedText)}>{chapter.subtitle}</span>
                      </span>

                      <span className="hidden rounded-md bg-orange-100 px-2.5 py-1 text-[10px] font-extrabold text-orange-700 sm:inline-flex">
                        {chapter.level}
                      </span>

                      <ChevronDown
                        size={19}
                        className={cx("shrink-0 transition-transform duration-300", isOpen ? "rotate-180 text-orange-500" : mutedText)}
                      />
                    </button>
                  </h3>

                  <div
                    id={contentId}
                    role="region"
                    className={cx(
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className={cx("border-t px-5 py-6 sm:px-7", subtleBorder)}>
                        <ul className="flex flex-wrap gap-2">
                          {chapter.topics.map((topic) => (
                            <li
                              key={topic}
                              className={cx(
                                "rounded-full px-3 py-1.5 text-xs font-semibold",
                                isDarkMode ? "bg-orange-500/10 text-orange-300" : "bg-orange-50 text-orange-700"
                              )}
                            >
                              {topic}
                            </li>
                          ))}
                        </ul>

                        <h4 className={cx("mb-3 mt-6 text-xs font-black uppercase tracking-wider", mainText)}>
                          Questions covered in this chapter
                        </h4>

                        <ol className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                          {chapter.questions.map((question, index) => (
                            <li key={question} className="flex items-start gap-3">
                              <span className="mt-0.5 w-5 shrink-0 text-right text-[11px] font-black text-orange-500">{index + 1}.</span>
                              <span className={cx("text-xs leading-6", mutedText)}>{question}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}

            {filteredChapters.length === 0 && (
              <div className={cx("rounded-2xl border border-dashed p-12 text-center", subtleBorder)}>
                <Search size={32} className="mx-auto text-orange-500" />
                <h3 className={cx("mt-4 text-lg font-extrabold", mainText)}>No matching chapters found</h3>
                <p className={cx("mt-2 text-sm", mutedText)}>Try a different search term.</p>
                <button
                  type="button"
                  onClick={() => setChapterQuery("")}
                  className="mt-5 rounded-lg bg-orange-500 px-5 py-2.5 text-xs font-bold text-white"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>

          <Reveal
            className={cx(
              "mt-7 flex flex-col items-start justify-between gap-5 rounded-xl border border-orange-200 p-5 sm:flex-row sm:items-center sm:p-6",
              isDarkMode ? "bg-orange-500/10" : "bg-orange-50"
            )}
          >
            <div className="flex items-start gap-3">
              <BookOpen size={24} className="shrink-0 text-orange-600" />
              <div>
                <h3 className={cx("text-sm font-extrabold", mainText)}>Your complete Spring Boot interview roadmap</h3>
                <p className={cx("mt-1 text-xs", mutedText)}>100 questions organized into 10 chapters.</p>
              </div>
            </div>

            <button type="button" onClick={handleBuyNow} disabled={!canPurchase} className={cx(ctaPrimary, "min-h-[46px] text-xs")}>
              {buyLabel}
            </button>
          </Reveal>
        </Section>

        {/* CODE */}
        <Section id="spring-code" isDarkMode={isDarkMode} label="code-title">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                id="code-title"
                eyebrow="Code-based learning"
                title="Don’t just remember it. Understand the code."
                description="Learn Spring Boot concepts with practical Java examples: dependency injection, API development, transaction handling and other backend fundamentals."
                isDarkMode={isDarkMode}
              />

              <div className="mt-8 space-y-4">
                {[
                  "Understand annotations and lifecycle behavior",
                  "Connect concepts to practical Java implementations",
                  "Prepare for code-based interview follow-ups",
                ].map((item, index) => (
                  <Reveal key={item} delay={index * 0.08} y={14} className="flex items-start gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-orange-500" />
                    <span className={cx("text-sm font-semibold leading-6", mainText)}>{item}</span>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={0.1}>
              <CodeTabs />
            </Reveal>
          </div>
        </Section>

        {/* SCENARIOS */}
        <Section id="spring-scenarios" alt isDarkMode={isDarkMode} label="scenarios-title">
          <SectionHeading
            id="scenarios-title"
            eyebrow="Advanced interview preparation"
            title="Be ready when the interviewer says, “What if…?”"
            description="Learn to reason through backend failures, performance bottlenecks and concurrency problems — not just give theoretical answers."
            isDarkMode={isDarkMode}
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SCENARIOS.map((scenario, index) => {
              const Icon = scenario.icon;

              return (
                <Reveal
                  key={scenario.title}
                  delay={(index % 3) * 0.07}
                  className={cx("group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-400 hover:shadow-xl", cardBg)}
                >
                  <div
                    className={cx(
                      "mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition duration-300 group-hover:rotate-6 group-hover:scale-110",
                      isDarkMode ? "bg-orange-500/15" : "bg-orange-50"
                    )}
                  >
                    <Icon size={22} className="text-orange-500" />
                  </div>
                  <h3 className={cx("text-base font-extrabold", mainText)}>{scenario.title}</h3>
                  <p className={cx("mt-2 text-sm leading-6", mutedText)}>{scenario.text}</p>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* 7-DAY PLAN */}
        <Section id="spring-plan" isDarkMode={isDarkMode} label="plan-title">
          <SectionHeading
            id="plan-title"
            eyebrow="Revision roadmap"
            title="A 7-day plan to revise the whole book."
            description="A simple order to follow before your interview."
            centered
            isDarkMode={isDarkMode}
          />

          <ol className="relative mx-auto mt-12 max-w-3xl space-y-4">
            <span
              aria-hidden="true"
              className="absolute bottom-3 left-[27px] top-3 w-px bg-gradient-to-b from-orange-500 via-orange-400/60 to-transparent"
            />
            {REVISION.map(([day, topic], index) => (
              <motion.li
                key={day}
                initial={reduce ? false : { opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="relative flex items-center gap-4"
              >
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-amber-500 text-xs font-black text-white shadow-lg shadow-orange-500/25">
                  {day.replace("Day ", "D")}
                </span>
                <div className={cx("flex-1 rounded-xl border px-4 py-3.5 transition hover:border-orange-400", cardBg)}>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-orange-600">{day}</p>
                  <p className={cx("mt-0.5 text-sm font-bold", mainText)}>{topic}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </Section>

        {/* ================================================
            PRICING
        ================================================ */}
        <Section id="sb-pricing" alt isDarkMode={isDarkMode} label="pricing-title">
          <SectionHeading
            id="pricing-title"
            eyebrow="Get your copy"
            title="Your Spring Boot interview preparation starts here."
            description="One focused digital handbook covering 100 important Spring Boot and backend questions."
            centered
            isDarkMode={isDarkMode}
          />

          <Reveal
            className={cx(
              "relative mx-auto mt-12 max-w-[520px] overflow-hidden rounded-2xl border border-orange-300 shadow-2xl shadow-orange-500/10",
              isDarkMode ? "bg-[#1b1816]" : "bg-white"
            )}
          >
            <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-6 py-3 text-center text-[11px] font-black uppercase tracking-widest text-white">
              <Flame size={14} className="mr-1.5 inline align-[-2px]" />
              Digital Interview Handbook
            </div>

            <div className="p-6 sm:p-8">
              <h3 className={cx("text-center text-2xl font-black", mainText)}>Mastering Spring Boot Interviews</h3>
              <p className={cx("mt-2 text-center text-[13px] leading-7", mutedText)}>
                100 Questions • 10 Chapters • Detailed Answers & Java Examples
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {loading ? (
                  <div className="h-11 w-36 animate-pulse rounded-lg bg-orange-100 dark:bg-white/10" />
                ) : canPurchase ? (
                  <>
                    <strong className={cx("text-[44px] font-black tracking-tight", mainText)}>{formattedPrice}</strong>
                    {formattedMrp && <del className={cx("text-lg", mutedText)}>{formattedMrp}</del>}
                    {discount > 0 && (
                      <span className="rounded-md bg-orange-100 px-2.5 py-1 text-[11px] font-black text-orange-700">{discount}% OFF</span>
                    )}
                  </>
                ) : (
                  <span className={cx("text-sm", mutedText)}>Price unavailable</span>
                )}
              </div>

              <div className={cx("my-7 border-t", subtleBorder)} />

              <p className={cx("mb-5 text-xs font-black uppercase tracking-wider", mainText)}>What&apos;s included</p>

              <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-1">
                {INCLUDED.map((feature, index) => (
                  <motion.li
                    key={feature}
                    initial={reduce ? false : { opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-orange-500" />
                    <span className={cx("text-xs font-semibold leading-5", mainText)}>{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-9">
                <button type="button" onClick={handleBuyNow} disabled={!canPurchase} className={cx(ctaPrimary, "w-full")}>
                  {buyLabel}
                </button>
              </div>

              <div className={cx("mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px]", mutedText)}>
                <ShieldCheck size={16} className="text-green-600" />
                Secure Checkout
                <span>·</span>
                <LockKeyhole size={14} />
                Access after successful payment
              </div>
            </div>
          </Reveal>
        </Section>

        {/* FAQ */}
        <Section id="spring-faq" isDarkMode={isDarkMode} label="faq-title">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <SectionHeading
                id="faq-title"
                eyebrow="Frequently asked questions"
                title="Everything you need to know."
                description="Answers to common questions about the Spring Boot Interview Handbook."
                isDarkMode={isDarkMode}
              />
              <a href="mailto:supporttargettrek@gmail.com" className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-orange-600">
                Need Help?
                <ArrowUpRight size={17} />
              </a>
            </div>

            <div className={cx("border-t", subtleBorder)}>
              {allFaqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <div key={faq.q} className={cx("border-b", subtleBorder)}>
                    <h3>
                      <button
                        type="button"
                        id={`sb-faq-q-${index}`}
                        aria-expanded={isOpen}
                        aria-controls={`sb-faq-a-${index}`}
                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                        className={cx("flex w-full items-center justify-between gap-5 py-5 text-left text-sm font-extrabold", mainText)}
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          size={19}
                          className={cx("shrink-0 transition-transform duration-300", isOpen ? "rotate-180 text-orange-500" : mutedText)}
                        />
                      </button>
                    </h3>

                    <div
                      id={`sb-faq-a-${index}`}
                      role="region"
                      aria-labelledby={`sb-faq-q-${index}`}
                      className={cx("grid transition-[grid-template-rows] duration-300 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
                    >
                      <div className="overflow-hidden">
                        <p className={cx("pb-6 pr-6 text-sm leading-7", mutedText)}>{faq.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* FINAL CTA */}
        <section aria-labelledby="sb-final-cta" className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-orange-800 via-orange-600 to-amber-500 px-7 py-12 text-white sm:px-12 sm:py-16 lg:px-16">
            <div className="tt-orb absolute -right-32 top-0 h-96 w-96 rounded-full border border-white/20" aria-hidden="true" />
            <div className="tt-orb tt-orb-2 absolute -right-10 bottom-0 h-72 w-72 rounded-full border border-white/10" aria-hidden="true" />

            <div className="relative z-10 max-w-2xl">
              <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-orange-100">
                <Rocket size={15} />
                Target Trek Interview Series
              </p>

              <h2 id="sb-final-cta" className="mt-6 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Your next Spring Boot interview starts with preparation.
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-8 text-orange-50">
                Master essential concepts, practice technical questions and strengthen your backend engineering knowledge with the Target Trek Spring Boot Interview Handbook.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!canPurchase}
                  className="tt-shimmer relative inline-flex min-h-[54px] items-center justify-center gap-3 overflow-hidden rounded-xl bg-white px-7 text-sm font-black text-orange-700 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {canPurchase ? (
                    <>
                      <LockKeyhole size={18} />
                      Get the Handbook — {formattedPrice}
                      <ArrowRight size={18} />
                    </>
                  ) : loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Book Currently Unavailable"
                  )}
                </button>

                <a href={JAVA_BOOK_PATH} className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-50 underline-offset-4 hover:underline">
                  Also see the Java handbook
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </Reveal>
        </section>

        <footer className={cx("border-t px-4 py-8 text-center text-xs leading-6", subtleBorder, mutedText)}>
          <p>Spring Boot Interview Handbook • 100 questions & answers • Digital ebook</p>
          <p className="mt-1">
            Support:{" "}
            <a className="font-bold transition hover:text-orange-500" href="mailto:supporttargettrek@gmail.com">
              supporttargettrek@gmail.com
            </a>
          </p>
          <p className="mt-3 space-x-3">
            <a className="font-semibold transition hover:text-orange-500" href={JAVA_BOOK_PATH}>Java Interview Handbook</a>
            <a className="font-semibold transition hover:text-orange-500" href="/book/system-design/hld">System Design HLD</a>
            <a className="font-semibold transition hover:text-orange-500" href="/books">All books</a>
          </p>
        </footer>
      </main>

      {/* RESPONSIVE STICKY BUY CARD
          mobile: docked strip · tablet: centered card · desktop: wider card
          (appears after the hero on md+) */}
      <div
        className={cx(
          "pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-2.5 pb-[max(10px,env(safe-area-inset-bottom))] transition-all duration-300 sm:px-4 md:pb-5",
          (checkoutOpen || (heroVisible && !loading)) && "md:translate-y-10 md:opacity-0",
          checkoutOpen && "max-md:translate-y-24 max-md:opacity-0"
        )}
      >
        <div
          className={cx(
            "pointer-events-auto grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 rounded-[20px] border p-2.5 shadow-[0_-10px_45px_rgba(15,23,42,.18)] backdrop-blur-xl",
            "sm:max-w-xl sm:gap-4 sm:rounded-[22px] sm:p-3",
            "md:max-w-2xl md:rounded-2xl md:py-3 md:pl-5 md:pr-3",
            "lg:max-w-3xl lg:gap-6 xl:max-w-4xl 2xl:max-w-5xl",
            isDarkMode ? "border-white/10 bg-[#1b1816]/95" : "border-orange-200 bg-white/95"
          )}
        >
          <div className="min-w-0 pl-1">
            <p className={cx("hidden truncate text-sm font-extrabold leading-tight sm:block lg:text-base", mainText)}>
              Spring Boot Interview Handbook — 100 Questions
            </p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 sm:mt-1">
              <span className="text-lg font-extrabold leading-none text-orange-500 sm:text-base lg:text-lg">
                {loading ? "…" : formattedPrice}
              </span>
              {formattedMrp && <span className={cx("text-xs font-bold line-through", mutedText)}>{formattedMrp}</span>}
              {discount > 0 && (
                <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-extrabold text-orange-500">{discount}% off</span>
              )}
            </div>
            <p className={cx("mt-1 truncate text-[11px] font-bold sm:hidden", mutedText)}>Spring Boot Handbook</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollToSection("java-book")}
              className={cx(
                "hidden min-h-[46px] items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition hover:-translate-y-0.5 lg:inline-flex",
                isDarkMode ? "border-white/10 text-white hover:bg-white/5" : "border-orange-200 text-orange-700 hover:bg-orange-50"
              )}
            >
              <Coffee size={16} />
              Java book
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!canPurchase}
              className={cx(ctaPrimary, "tt-pulse md-tt-no-pulse min-h-[50px] px-4 text-[13px] sm:px-6 sm:text-sm")}
            >
              {loading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <>
                  Buy Now
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* EXISTING TARGET TREK CHECKOUT (Spring Boot + Java) */}
      <PayUCheckoutModal isOpen={checkoutOpen} onClose={closeCheckout} product={checkoutProduct} />
    </>
  );
}
