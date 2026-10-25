
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Code2,
  Coffee,
  Database,
  Download,
  FileCode2,
  Flame,
  GitBranch,
  GraduationCap,
  Layers3,
  LockKeyhole,
  Menu,
  MessageSquareText,
  MonitorSmartphone,
  PlayCircle,
  RefreshCcw,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";

// Adjust only this import path to match your project.
import PayUCheckoutModal from
  "../payment/PayUCheckoutModal.jsx";

const BASE_URL = (
  import.meta.env.VITE_BASE_URL ||
  "http://localhost:5001"
).replace(/\/+$/, "");

const BOOK_PATH =
  "/book/springboot-interview-handbook";

const BOOK_ENDPOINT =
  `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(
    BOOK_PATH
  )}`;

const STORAGE_THEME_KEY = "theme";

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

const css = `
.tt-spring-page {
  --sb-bg: #fffdf9;
  --sb-surface: #ffffff;
  --sb-surface-soft: #fff6ed;
  --sb-surface-alt: #fff0df;
  --sb-text: #201a17;
  --sb-muted: #71665e;
  --sb-border: #f0dfcf;
  --sb-primary: #ed690b;
  --sb-primary-deep: #c64e04;
  --sb-primary-soft: #fff0df;
  --sb-shadow: 0 12px 35px rgba(86, 47, 12, .06);
  --sb-code-bg: #191d25;
  color: var(--sb-text);
  background: var(--sb-bg);
  min-height: 100vh;
  font-family: Inter, ui-sans-serif, system-ui,
    -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  overflow-x: clip;
}

.tt-spring-page[data-sb-theme="dark"] {
  --sb-bg: #11100f;
  --sb-surface: #1b1917;
  --sb-surface-soft: #221b16;
  --sb-surface-alt: #302014;
  --sb-text: #f8f3ee;
  --sb-muted: #b5a89c;
  --sb-border: #39302a;
  --sb-primary: #fb923c;
  --sb-primary-deep: #f97316;
  --sb-primary-soft: #352314;
  --sb-shadow: 0 12px 35px rgba(0, 0, 0, .12);
  --sb-code-bg: #0d1117;
}

.tt-spring-page *,
.tt-spring-page *::before,
.tt-spring-page *::after {
  box-sizing: border-box;
}

.tt-spring-page button,
.tt-spring-page input {
  font: inherit;
}

.tt-spring-page button {
  cursor: pointer;
}

.tt-spring-page button:disabled {
  cursor: not-allowed;
}

.tt-spring-page button:focus-visible,
.tt-spring-page a:focus-visible {
  outline: 3px solid var(--sb-primary);
  outline-offset: 4px;
}

.tt-spring-page a {
  color: inherit;
  text-decoration: none;
}

.tt-spring-page .sb-container {
  width: min(1150px, calc(100% - 40px));
  margin-inline: auto;
}

.tt-spring-page .sb-section {
  padding: 78px 0;
}

.tt-spring-page .sb-section.alt {
  background: var(--sb-surface-soft);
  border-block: 1px solid var(--sb-border);
}

.tt-spring-page .sb-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--sb-primary);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.7px;
}

.tt-spring-page .sb-heading {
  font-size: clamp(29px, 3.7vw, 43px);
  font-weight: 850;
  letter-spacing: -1.8px;
  line-height: 1.13;
  margin: 12px 0 14px;
}

.tt-spring-page .sb-muted {
  color: var(--sb-muted);
}

.tt-spring-page .sb-lead {
  color: var(--sb-muted);
  font-size: 16px;
  line-height: 1.85;
  max-width: 650px;
}

.tt-spring-page .sb-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: var(--sb-primary-soft);
  color: var(--sb-primary);
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 750;
  border: 1px solid var(--sb-border);
}

.tt-spring-page .sb-primary-btn {
  border: 0;
  background: linear-gradient(
    110deg,
    var(--sb-primary),
    var(--sb-primary-deep)
  );
  color: #fff;
  padding: 15px 22px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 800;
  transition: transform .2s, filter .2s;
  box-shadow: 0 8px 18px rgba(234, 102, 11, .18);
}

.tt-spring-page .sb-primary-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.04);
}

.tt-spring-page .sb-primary-btn:disabled {
  opacity: .52;
  box-shadow: none;
}

.tt-spring-page .sb-outline-btn {
  border: 1px solid var(--sb-border);
  background: var(--sb-surface);
  color: var(--sb-text);
  padding: 14px 20px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  font-size: 14px;
  font-weight: 750;
  transition: border-color .2s, transform .2s;
}

.tt-spring-page .sb-outline-btn:hover {
  border-color: var(--sb-primary);
  transform: translateY(-2px);
}

.tt-spring-page .sb-hero {
  padding: 46px 0 65px;
  position: relative;
  overflow: hidden;
}

.tt-spring-page .sb-hero::before {
  content: "";
  position: absolute;
  width: 680px;
  height: 680px;
  right: -280px;
  top: -270px;
  pointer-events: none;
  background: radial-gradient(
    circle,
    rgba(248, 145, 48, .13),
    transparent 67%
  );
}

.tt-spring-page .sb-hero-grid {
  display: grid;
  grid-template-columns: 1.12fr .88fr;
  gap: 55px;
  align-items: center;
  position: relative;
}

.tt-spring-page .sb-hero-title {
  font-size: clamp(39px, 5vw, 66px);
  line-height: 1.09;
  letter-spacing: -3px;
  font-weight: 900;
  margin: 20px 0;
}

.tt-spring-page .sb-accent {
  color: var(--sb-primary);
}

.tt-spring-page .sb-hero-desc {
  font-size: 16px;
  line-height: 1.85;
  color: var(--sb-muted);
  max-width: 590px;
}

.tt-spring-page .sb-hero-checks {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  margin: 24px 0 28px;
}

.tt-spring-page .sb-hero-check {
  display: flex;
  gap: 7px;
  align-items: center;
  font-size: 13px;
  font-weight: 650;
}

.tt-spring-page .sb-hero-check svg {
  color: var(--sb-primary);
}

.tt-spring-page .sb-price-line {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.tt-spring-page .sb-price {
  font-size: 40px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: -1.7px;
}

.tt-spring-page .sb-mrp {
  font-size: 18px;
  color: var(--sb-muted);
  text-decoration: line-through;
}

.tt-spring-page .sb-discount {
  font-size: 12px;
  background: var(--sb-primary-soft);
  color: var(--sb-primary);
  padding: 6px 10px;
  border-radius: 6px;
  font-weight: 800;
}

.tt-spring-page .sb-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tt-spring-page .sb-microcopy {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  margin-top: 15px;
  color: var(--sb-muted);
}

.tt-spring-page .sb-visual {
  position: relative;
  padding: 28px 8px;
}

.tt-spring-page .sb-book {
  position: relative;
  max-width: 380px;
  margin-inline: auto;
  min-height: 495px;
  padding: 34px 30px;
  background:
    radial-gradient(
      circle at 90% 7%,
      rgba(255, 144, 51, .24),
      transparent 44%
    ),
    linear-gradient(
      155deg,
      #27201e 0%,
      #151414 60%,
      #27201e 100%
    );
  color: #fff;
  border-radius: 8px 14px 14px 8px;
  border-left: 11px solid #ea6b1c;
  box-shadow:
    13px 17px 0 -6px rgba(105, 67, 39, .16),
    22px 30px 55px rgba(28, 17, 8, .26);
  transform: rotate(-3deg);
  overflow: hidden;
}

.tt-spring-page .sb-book::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 26px,
    rgba(255, 255, 255, .018) 27px
  );
  pointer-events: none;
}

.tt-spring-page .sb-book::after {
  content: "";
  position: absolute;
  height: 230px;
  width: 230px;
  border-radius: 50%;
  right: -90px;
  bottom: -75px;
  border: 32px solid rgba(249, 115, 22, .09);
}

.tt-spring-page .sb-book-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  letter-spacing: 2px;
  font-weight: 850;
  position: relative;
  z-index: 1;
}

.tt-spring-page .sb-book-mark {
  width: 56px;
  height: 56px;
  border-radius: 15px;
  margin-top: 54px;
  display: grid;
  place-items: center;
  background: rgba(249, 115, 22, .18);
  color: #fb923c;
  border: 1px solid rgba(251, 146, 60, .36);
  position: relative;
  z-index: 1;
}

.tt-spring-page .sb-book-title {
  margin: 21px 0 13px;
  font-size: clamp(32px, 4vw, 43px);
  letter-spacing: -1.5px;
  line-height: 1.08;
  font-weight: 900;
  position: relative;
  z-index: 1;
}

.tt-spring-page .sb-book-subtitle {
  font-size: 14px;
  color: #d7c6ba;
  line-height: 1.65;
  position: relative;
  z-index: 1;
}

.tt-spring-page .sb-book-bottom {
  border-top: 1px solid rgba(255,255,255,.16);
  padding-top: 17px;
  margin-top: 57px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  position: relative;
  z-index: 1;
  color: #ffb779;
  font-size: 12px;
  font-weight: 800;
}

.tt-spring-page .sb-visual-chip {
  position: absolute;
  padding: 11px 13px;
  border-radius: 10px;
  background: var(--sb-surface);
  border: 1px solid var(--sb-border);
  box-shadow: var(--sb-shadow);
  color: var(--sb-text);
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 750;
  font-size: 12px;
  z-index: 2;
}

.tt-spring-page .sb-visual-chip svg {
  color: var(--sb-primary);
}

.tt-spring-page .sb-chip-one {
  top: 65px;
  right: -15px;
}

.tt-spring-page .sb-chip-two {
  bottom: 65px;
  left: -20px;
}

.tt-spring-page .sb-stats {
  background: var(--sb-surface);
  border-block: 1px solid var(--sb-border);
}

.tt-spring-page .sb-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.tt-spring-page .sb-stat {
  padding: 24px 10px;
  text-align: center;
  border-right: 1px solid var(--sb-border);
}

.tt-spring-page .sb-stat:last-child {
  border-right: 0;
}

.tt-spring-page .sb-stat-value {
  font-weight: 900;
  font-size: 26px;
  letter-spacing: -.7px;
  color: var(--sb-primary);
}

.tt-spring-page .sb-stat-label {
  font-size: 12px;
  color: var(--sb-muted);
  margin-top: 5px;
}

.tt-spring-page .sb-section-head {
  max-width: 760px;
  margin-bottom: 32px;
}

.tt-spring-page .sb-center {
  text-align: center;
  margin-inline: auto;
}

.tt-spring-page .sb-center .sb-lead {
  margin-inline: auto;
}

.tt-spring-page .sb-benefit-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 17px;
}

.tt-spring-page .sb-benefit {
  background: var(--sb-surface);
  border: 1px solid var(--sb-border);
  border-radius: 15px;
  padding: 23px;
  transition: transform .2s, border-color .2s;
}

.tt-spring-page .sb-benefit:hover {
  transform: translateY(-4px);
  border-color: var(--sb-primary);
}

.tt-spring-page .sb-icon-box {
  height: 45px;
  width: 45px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--sb-primary-soft);
  color: var(--sb-primary);
  margin-bottom: 19px;
}

.tt-spring-page .sb-benefit h3 {
  font-size: 16px;
  letter-spacing: -.3px;
  margin: 0 0 9px;
}

.tt-spring-page .sb-benefit p {
  font-size: 13px;
  line-height: 1.8;
  color: var(--sb-muted);
  margin: 0;
}

.tt-spring-page .sb-chapter-list {
  display: grid;
  gap: 11px;
}

.tt-spring-page .sb-chapter {
  background: var(--sb-surface);
  border: 1px solid var(--sb-border);
  border-radius: 13px;
  overflow: hidden;
  transition: border-color .2s;
}

.tt-spring-page .sb-chapter.open {
  border-color: var(--sb-primary);
}

.tt-spring-page .sb-chapter-toggle {
  width: 100%;
  display: flex;
  text-align: left;
  align-items: center;
  gap: 15px;
  padding: 18px 20px;
  border: 0;
  color: var(--sb-text);
  background: transparent;
}

.tt-spring-page .sb-chapter-icon {
  min-width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: var(--sb-primary-soft);
  color: var(--sb-primary);
}

.tt-spring-page .sb-chapter-main {
  flex: 1;
  min-width: 0;
}

.tt-spring-page .sb-chapter-index {
  font-size: 10px;
  font-weight: 800;
  color: var(--sb-primary);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.tt-spring-page .sb-chapter-name {
  font-size: 15px;
  font-weight: 800;
  margin-top: 5px;
}

.tt-spring-page .sb-chapter-sub {
  font-size: 12px;
  color: var(--sb-muted);
  margin-top: 5px;
}

.tt-spring-page .sb-chapter-chevron {
  color: var(--sb-muted);
  transition: transform .2s;
}

.tt-spring-page .sb-chapter.open .sb-chapter-chevron {
  transform: rotate(180deg);
}

.tt-spring-page .sb-chapter-content {
  padding: 0 20px 22px;
  border-top: 1px solid var(--sb-border);
}

.tt-spring-page .sb-topic-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 19px;
}

.tt-spring-page .sb-topic {
  font-size: 11px;
  color: var(--sb-muted);
  padding: 7px 10px;
  background: var(--sb-surface-soft);
  border: 1px solid var(--sb-border);
  border-radius: 7px;
}

.tt-spring-page .sb-question-preview {
  margin-top: 18px;
  background: var(--sb-surface-soft);
  border-radius: 9px;
  padding: 17px;
}

.tt-spring-page .sb-question-preview h4 {
  font-size: 12px;
  margin: 0 0 12px;
  color: var(--sb-primary);
}

.tt-spring-page .sb-question-preview ol {
  padding-left: 20px;
  margin: 0;
  display: grid;
  gap: 9px;
}

.tt-spring-page .sb-question-preview li {
  font-size: 12px;
  line-height: 1.6;
  color: var(--sb-text);
}

.tt-spring-page .sb-code-layout {
  display: grid;
  grid-template-columns: .75fr 1.25fr;
  gap: 40px;
  align-items: center;
}

.tt-spring-page .sb-code-tabs {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid #38404c;
  background: #222733;
}

.tt-spring-page .sb-code-tab {
  padding: 15px 18px;
  background: transparent;
  border: 0;
  white-space: nowrap;
  color: #aeb7c7;
  font-size: 12px;
  font-weight: 700;
}

.tt-spring-page .sb-code-tab.active {
  color: #ffac6f;
  box-shadow: inset 0 -2px #f97316;
}

.tt-spring-page .sb-code-window {
  border-radius: 15px;
  overflow: hidden;
  background: var(--sb-code-bg);
  border: 1px solid #3c4149;
  box-shadow: 0 18px 45px rgba(0,0,0,.13);
}

.tt-spring-page .sb-code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #222733;
  border-bottom: 1px solid #38404c;
  color: #c9d1de;
  font-size: 12px;
}

.tt-spring-page .sb-window-dots {
  display: flex;
  gap: 5px;
}

.tt-spring-page .sb-window-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #6b7280;
}

.tt-spring-page .sb-window-dot:nth-child(1) {
  background: #f87171;
}

.tt-spring-page .sb-window-dot:nth-child(2) {
  background: #fbbf24;
}

.tt-spring-page .sb-window-dot:nth-child(3) {
  background: #4ade80;
}

.tt-spring-page .sb-code-pre {
  margin: 0;
  padding: 22px;
  overflow-x: auto;
  min-height: 260px;
  color: #dbe4ed;
  font-family: "SFMono-Regular", Consolas,
    "Liberation Mono", monospace;
  font-size: 12px;
  line-height: 1.9;
  tab-size: 4;
}

.tt-spring-page .sb-audience-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.tt-spring-page .sb-audience-card {
  border: 1px solid var(--sb-border);
  background: var(--sb-surface);
  border-radius: 12px;
  padding: 23px;
}

.tt-spring-page .sb-audience-card svg {
  color: var(--sb-primary);
  margin-bottom: 17px;
}

.tt-spring-page .sb-audience-card h3 {
  font-size: 14px;
  margin: 0 0 9px;
}

.tt-spring-page .sb-audience-card p {
  color: var(--sb-muted);
  font-size: 12px;
  line-height: 1.75;
  margin: 0;
}

.tt-spring-page .sb-revision-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 9px;
}

.tt-spring-page .sb-day {
  border: 1px solid var(--sb-border);
  background: var(--sb-surface);
  padding: 16px 11px;
  border-radius: 11px;
  min-height: 127px;
}

.tt-spring-page .sb-day-label {
  color: var(--sb-primary);
  font-size: 11px;
  font-weight: 850;
  margin-bottom: 12px;
}

.tt-spring-page .sb-day-title {
  font-size: 12px;
  font-weight: 750;
  line-height: 1.55;
}

.tt-spring-page .sb-included-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 30px;
}

.tt-spring-page .sb-included-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  line-height: 1.65;
}

.tt-spring-page .sb-included-item svg {
  flex: 0 0 auto;
  color: var(--sb-primary);
  margin-top: 2px;
}

.tt-spring-page .sb-offer {
  background: var(--sb-surface);
  border: 1px solid var(--sb-border);
  border-radius: 18px;
  overflow: hidden;
  max-width: 750px;
  margin-inline: auto;
  box-shadow: var(--sb-shadow);
}

.tt-spring-page .sb-offer-top {
  background: var(--sb-primary-soft);
  padding: 15px;
  text-align: center;
  font-size: 12px;
  font-weight: 850;
  color: var(--sb-primary);
  border-bottom: 1px solid var(--sb-border);
}

.tt-spring-page .sb-offer-body {
  padding: 32px;
}

.tt-spring-page .sb-offer-title {
  font-size: 24px;
  font-weight: 850;
  letter-spacing: -.7px;
  margin: 0 0 12px;
}

.tt-spring-page .sb-offer-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 12px;
  margin: 22px 0;
}

.tt-spring-page .sb-offer-btn {
  width: 100%;
  margin-top: 25px;
}

.tt-spring-page .sb-faq-list {
  max-width: 830px;
  margin-inline: auto;
  display: grid;
  gap: 10px;
}

.tt-spring-page .sb-faq {
  border: 1px solid var(--sb-border);
  border-radius: 11px;
  background: var(--sb-surface);
  overflow: hidden;
}

.tt-spring-page .sb-faq-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 19px;
  border: 0;
  width: 100%;
  background: transparent;
  color: var(--sb-text);
  text-align: left;
  font-size: 13px;
  font-weight: 800;
}

.tt-spring-page .sb-faq-btn svg {
  flex-shrink: 0;
  color: var(--sb-primary);
  transition: transform .2s;
}

.tt-spring-page .sb-faq.open .sb-faq-btn svg {
  transform: rotate(180deg);
}

.tt-spring-page .sb-faq-answer {
  padding: 0 19px 19px;
  color: var(--sb-muted);
  font-size: 13px;
  line-height: 1.85;
}

.tt-spring-page .sb-final-cta {
  background: linear-gradient(
    135deg,
    #c64e04,
    #f97316
  );
  color: #fff;
  border-radius: 18px;
  padding: 44px 30px;
  text-align: center;
}

.tt-spring-page .sb-final-cta h2 {
  font-size: clamp(26px, 4vw, 38px);
  letter-spacing: -1px;
  font-weight: 900;
  margin: 0 0 14px;
}

.tt-spring-page .sb-final-cta p {
  color: #fff3e8;
  max-width: 550px;
  margin: 0 auto 25px;
  line-height: 1.8;
  font-size: 14px;
}

.tt-spring-page .sb-final-cta button {
  background: #fff;
  color: #b94704;
  box-shadow: none;
}

.tt-spring-page .sb-error-box {
  padding: 13px;
  border-radius: 9px;
  border: 1px solid var(--sb-border);
  background: var(--sb-surface-soft);
  color: var(--sb-muted);
  font-size: 12px;
  line-height: 1.7;
  margin: 15px 0;
}

.tt-spring-page .sb-mobile-bar {
  display: none;
}

@media (max-width: 1000px) {
  .tt-spring-page .sb-hero-grid {
    gap: 28px;
  }

  .tt-spring-page .sb-audience-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tt-spring-page .sb-revision-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .tt-spring-page .sb-book {
    min-height: 450px;
  }
}

@media (max-width: 760px) {
  .tt-spring-page .sb-container {
    width: min(100% - 32px, 1150px);
  }

  .tt-spring-page .sb-section {
    padding: 52px 0;
  }

  .tt-spring-page .sb-hero {
    padding: 20px 0 45px;
  }

  .tt-spring-page .sb-hero-grid,
  .tt-spring-page .sb-code-layout {
    grid-template-columns: 1fr;
  }

  .tt-spring-page .sb-hero-title {
    font-size: clamp(36px, 8vw, 49px);
    letter-spacing: -1.9px;
  }

  .tt-spring-page .sb-hero-desc {
    font-size: 14px;
  }

  .tt-spring-page .sb-visual {
    max-width: 410px;
    margin: 0 auto;
    width: 100%;
    padding: 18px 10px;
  }

  .tt-spring-page .sb-book {
    max-width: 305px;
    min-height: 415px;
    padding: 26px 22px;
  }

  .tt-spring-page .sb-book-mark {
    margin-top: 39px;
  }

  .tt-spring-page .sb-book-title {
    font-size: 34px;
  }

  .tt-spring-page .sb-book-bottom {
    margin-top: 39px;
  }

  .tt-spring-page .sb-chip-one {
    right: -3px;
    top: 25px;
  }

  .tt-spring-page .sb-chip-two {
    left: -5px;
    bottom: 25px;
  }

  .tt-spring-page .sb-benefit-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 11px;
  }

  .tt-spring-page .sb-benefit {
    padding: 16px;
  }

  .tt-spring-page .sb-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tt-spring-page .sb-stat {
    border-bottom: 1px solid var(--sb-border);
  }

  .tt-spring-page .sb-stat:nth-child(even) {
    border-right: 0;
  }

  .tt-spring-page .sb-stat:nth-child(n+3) {
    border-bottom: 0;
  }

  .tt-spring-page .sb-included-grid {
    grid-template-columns: 1fr;
  }

  .tt-spring-page .sb-mobile-bar {
    position: fixed;
    display: flex;
    gap: 14px;
    align-items: center;
    justify-content: space-between;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 11px 16px calc(11px + env(safe-area-inset-bottom));
    background: var(--sb-surface);
    border-top: 1px solid var(--sb-border);
    box-shadow: 0 -6px 25px rgba(0,0,0,.06);
    z-index: 40;
  }

  .tt-spring-page .sb-mobile-bar .sb-primary-btn {
    padding: 13px 16px;
  }

  .tt-spring-page {
    padding-bottom: 84px;
  }
}

@media (max-width: 480px) {
  .tt-spring-page .sb-heading {
    font-size: 28px;
    letter-spacing: -1px;
  }

  .tt-spring-page .sb-benefit-grid,
  .tt-spring-page .sb-audience-grid {
    grid-template-columns: 1fr;
  }

  .tt-spring-page .sb-benefit {
    padding: 20px;
  }

  .tt-spring-page .sb-revision-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tt-spring-page .sb-chapter-toggle {
    padding: 15px 13px;
    gap: 10px;
  }

  .tt-spring-page .sb-chapter-icon {
    min-width: 39px;
    height: 39px;
  }

  .tt-spring-page .sb-chapter-name {
    font-size: 13px;
  }

  .tt-spring-page .sb-chapter-content {
    padding: 0 13px 15px;
  }

  .tt-spring-page .sb-offer-body {
    padding: 23px 19px;
  }

  .tt-spring-page .sb-hero-actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .tt-spring-page .sb-hero-actions button,
  .tt-spring-page .sb-hero-actions a {
    width: 100%;
  }

  .tt-spring-page .sb-price {
    font-size: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tt-spring-page *,
  .tt-spring-page *::before,
  .tt-spring-page *::after {
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
    animation-duration: .01ms !important;
  }
}
`;

function getStoredTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    return localStorage.getItem(STORAGE_THEME_KEY) ===
      "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function normalizeBookResponse(json) {
  if (
    !json ||
    json.success !== true ||
    !json.data
  ) {
    throw new Error(
      json?.message ||
      "The book is currently unavailable."
    );
  }

  // Supports a product object returned directly
  // or inside data.product.
  const data = json.data;

  const product =
    data.product &&
    typeof data.product === "object"
      ? data.product
      : data;

  if (!product._id && !product.id) {
    throw new Error(
      "The API did not return a valid book ID."
    );
  }

  const price = Number(product.price);

  if (
    !Number.isFinite(price) ||
    price < 0 ||
    product.price === null ||
    product.price === undefined
  ) {
    throw new Error(
      "The book price is currently unavailable."
    );
  }

  if (
    product.active === false ||
    product.isActive === false
  ) {
    throw new Error(
      "This book is not currently available for purchase."
    );
  }

  return product;
}

function formatPrice(value, currency = "INR") {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Price unavailable";
  }

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

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}) {
  return (
    <div
      className={
        `sb-section-head ${
          centered ? "sb-center" : ""
        }`
      }
    >
      <span className="sb-eyebrow">
        <Sparkles size={14} />
        {eyebrow}
      </span>

      <h2 className="sb-heading">{title}</h2>

      {description && (
        <p className="sb-lead">{description}</p>
      )}
    </div>
  );
}

function BookArtwork() {
  return (
    <div
      className="sb-visual"
      aria-label="Illustration of the Spring Boot interview handbook"
      role="img"
    >
      <div className="sb-visual-chip sb-chip-one">
        <CheckCircle2 size={15} />
        100 Interview Questions
      </div>

      <div className="sb-book">
        <div className="sb-book-top">
          <span>TARGET TREK</span>
          <BookOpen size={19} color="#fb923c" />
        </div>

        <div className="sb-book-mark">
          <Coffee size={31} />
        </div>

        <div className="sb-book-title">
          MASTERING
          <br />
          <span style={{ color: "#ff9d50" }}>
            SPRING BOOT
          </span>
          <br />
          INTERVIEWS
        </div>

        <div className="sb-book-subtitle">
          100 Essential Questions
          <br />
          Detailed Answers & Java Code
          <br />
          Real-World Backend Scenarios
        </div>

        <div className="sb-book-bottom">
          <span>JAVA • BACKEND • SPRING</span>
          <span>100 Q&A</span>
        </div>
      </div>

      <div className="sb-visual-chip sb-chip-two">
        <Terminal size={15} />
        Code + Concepts
      </div>
    </div>
  );
}

function ChapterCard({
  chapter,
  isOpen,
  onToggle,
}) {
  const Icon = chapter.icon;
  const contentId = `sb-chapter-${chapter.number}`;

  return (
    <div
      className={
        `sb-chapter ${isOpen ? "open" : ""}`
      }
    >
      <button
        type="button"
        className="sb-chapter-toggle"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={onToggle}
      >
        <div className="sb-chapter-icon">
          <Icon size={21} />
        </div>

        <div className="sb-chapter-main">
          <div className="sb-chapter-index">
            CHAPTER {chapter.number} • {chapter.range}
          </div>
          <div className="sb-chapter-name">
            {chapter.title}
          </div>
          <div className="sb-chapter-sub">
            {chapter.subtitle}
          </div>
        </div>

        <ChevronDown
          className="sb-chapter-chevron"
          size={20}
        />
      </button>

      {isOpen && (
        <div
          className="sb-chapter-content"
          id={contentId}
        >
          <div className="sb-topic-list">
            {chapter.topics.map((topic) => (
              <span
                key={topic}
                className="sb-topic"
              >
                {topic}
              </span>
            ))}
          </div>

          <div className="sb-question-preview">
            <h4>Questions covered in this chapter</h4>

            <ol>
              {chapter.questions.map((question) => (
                <li key={question}>
                  {question}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SpringBootInterviewHandbook() {
  const [theme, setTheme] = useState(
    getStoredTheme
  );

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [checkoutOpen, setCheckoutOpen] =
    useState(false);

  const [checkoutProduct, setCheckoutProduct] =
    useState(null);

  const [expandedChapters, setExpandedChapters] =
    useState(["01"]);

  const [activeCode, setActiveCode] = useState(0);

  const [openFaq, setOpenFaq] = useState(0);

  const [allChaptersOpen, setAllChaptersOpen] =
    useState(false);

  // --------------------------------------------------
  // Theme synchronization with the existing website
  // --------------------------------------------------

  useEffect(() => {
    const syncTheme = () => {
      const latest = getStoredTheme();

      setTheme((previous) =>
        previous === latest ? previous : latest
      );
    };

    syncTheme();

    window.addEventListener(
      "storage",
      syncTheme
    );

    window.addEventListener(
      "themechange",
      syncTheme
    );

    window.addEventListener(
      "targettrek-theme-change",
      syncTheme
    );

    // Handles theme updates made in the same tab
    // even if an existing navbar only modifies
    // localStorage without dispatching an event.
    const intervalId = window.setInterval(
      syncTheme,
      500
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncTheme
      );

      window.removeEventListener(
        "themechange",
        syncTheme
      );

      window.removeEventListener(
        "targettrek-theme-change",
        syncTheme
      );

      window.clearInterval(intervalId);
    };
  }, []);

  // --------------------------------------------------
  // Referral tracking (compatible with Target Trek)
  // --------------------------------------------------

  useEffect(() => {
    try {
      const params = new URLSearchParams(
        window.location.search
      );

      const referral =
        params.get("referralCode") ||
        params.get("ref");

      if (
        referral &&
        /^[a-zA-Z0-9_-]{1,64}$/.test(referral)
      ) {
        localStorage.setItem(
          "referralCode",
          referral
        );
      }
    } catch {
      // Local storage may be unavailable.
    }
  }, []);

  // --------------------------------------------------
  // Backend product fetch
  // --------------------------------------------------

  const fetchBook = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          BOOK_ENDPOINT,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
            signal,
          }
        );

        let result;

        try {
          result = await response.json();
        } catch {
          throw new Error(
            "Unable to read the book response."
          );
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
            `Request failed (${response.status}).`
          );
        }

        const book = normalizeBookResponse(
          result
        );

        if (signal?.aborted) return;

        setProduct(book);
      } catch (err) {
        if (
          signal?.aborted ||
          err?.name === "AbortError"
        ) {
          return;
        }

        setProduct(null);

        setError(
          err?.message ||
          "Unable to load the book right now."
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchBook(controller.signal);

    return () => controller.abort();
  }, [fetchBook]);

  // --------------------------------------------------
  // Dynamic price from backend
  // --------------------------------------------------

  const currency = product?.currency || "INR";

  const price = product
    ? Number(product.price)
    : null;

  const mrp = product
    ? Number(product.mrp)
    : null;

  const validMrp =
    Number.isFinite(mrp) &&
    mrp > price;

  const formattedPrice =
    product && price !== null
      ? formatPrice(price, currency)
      : "Price unavailable";

  const formattedMrp = validMrp
    ? formatPrice(mrp, currency)
    : null;

  const discount =
    validMrp && price !== null
      ? Math.round(
          ((mrp - price) / mrp) * 100
        )
      : 0;

  const canPurchase =
    !!product &&
    Number.isFinite(price) &&
    !loading;

  // --------------------------------------------------
  // Checkout
  // --------------------------------------------------

  const handleBuyNow = useCallback(() => {
    if (!canPurchase) return;

    setCheckoutProduct(product);
    setCheckoutOpen(true);
  }, [canPurchase, product]);

  const closeCheckout = useCallback(() => {
    setCheckoutOpen(false);
  }, []);

  // --------------------------------------------------
  // Page interactions
  // --------------------------------------------------

  const toggleChapter = (number) => {
    setExpandedChapters((previous) =>
      previous.includes(number)
        ? previous.filter(
            (item) => item !== number
          )
        : [...previous, number]
    );
  };

  const toggleAllChapters = () => {
    if (allChaptersOpen) {
      setExpandedChapters([]);
      setAllChaptersOpen(false);
    } else {
      setExpandedChapters(
        CHAPTERS.map((chapter) => chapter.number)
      );
      setAllChaptersOpen(true);
    }
  };

  const scrollToSection = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Book",
      name: "Mastering Spring Boot Interviews",
      description:
        "100 Spring Boot interview questions covering Spring Core, REST APIs, JPA, Spring Security, transactions, microservices, Redis, Kafka and real-world backend scenarios.",
      inLanguage: "en",
      bookFormat: "https://schema.org/EBook",
      url:
        "https://www.targettrek.in" +
        BOOK_PATH,
      publisher: {
        "@type": "Organization",
        name: "Target Trek",
      },
      ...(canPurchase
        ? {
            offers: {
              "@type": "Offer",
              url:
                "https://www.targettrek.in" +
                BOOK_PATH,
              price: String(price),
              priceCurrency: currency,
              availability:
                "https://schema.org/InStock",
            },
          }
        : {}),
    }),
    [canPurchase, price, currency]
  );

  return (
    <main
      className="tt-spring-page mt-16"
      data-sb-theme={theme}
      style={{ marginTop: "4rem" }}
    >
      <style>{css}</style>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            structuredData
          ).replace(/</g, "\\u003c"),
        }}
      />

      {/* HERO SECTION */}

      <section className="sb-hero">
        <div className="sb-container sb-hero-grid">
          <div>
            <div className="sb-pill">
              <Flame size={14} />
              TARGET TREK INTERVIEW HANDBOOK
            </div>

            <h1 className="sb-hero-title">
              Want to master
              <br />
              <span className="sb-accent">
                Spring Boot
              </span>
              <br />
              & crack your
              <br />
              Backend Interview?
            </h1>

            <p className="sb-hero-desc">
              From Spring Core and Dependency
              Injection to REST APIs, JPA,
              transactions, security, Kafka,
              Redis and microservices —
              prepare with 100 essential
              interview questions, detailed
              explanations and Java code.
            </p>

            <div className="sb-hero-checks">
              {[
                "100 interview questions",
                "10 focused chapters",
                "Java code examples",
                "Real backend scenarios",
              ].map((item) => (
                <div
                  className="sb-hero-check"
                  key={item}
                >
                  <CheckCircle2 size={15} />
                  {item}
                </div>
              ))}
            </div>

            <div className="sb-price-line">
              {loading ? (
                <span className="sb-muted">
                  Loading price...
                </span>
              ) : (
                <>
                  <span className="sb-price">
                    {formattedPrice}
                  </span>

                  {formattedMrp && (
                    <span className="sb-mrp">
                      {formattedMrp}
                    </span>
                  )}

                  {discount > 0 && (
                    <span className="sb-discount">
                      {discount}% OFF
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="sb-hero-actions">
              <button
                type="button"
                className="sb-primary-btn"
                onClick={handleBuyNow}
                disabled={!canPurchase}
              >
                {loading
                  ? "Loading book..."
                  : canPurchase
                    ? "Get the Handbook"
                    : "Currently Unavailable"}

                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                className="sb-outline-btn"
                onClick={() =>
                  scrollToSection("sb-syllabus")
                }
              >
                <BookOpen size={16} />
                Explore All 100 Questions
              </button>
            </div>

            {error && (
              <div
                className="sb-error-box"
                role="alert"
              >
                <strong>
                  Book information unavailable.
                </strong>

                <div>{error}</div>

                <button
                  type="button"
                  onClick={() => fetchBook()}
                  className="sb-outline-btn"
                  style={{ marginTop: 10 }}
                  disabled={loading}
                >
                  <RefreshCcw size={14} />
                  Try Again
                </button>
              </div>
            )}

            <div className="sb-microcopy">
              <LockKeyhole size={13} />

              Digital ebook • Secure checkout •
              Access after successful payment
            </div>
          </div>

          <BookArtwork />
        </div>
      </section>

      {/* QUICK STATS */}

      <section className="sb-stats">
        <div className="sb-container sb-stats-grid">
          {[
            ["100", "Interview Questions"],
            ["10", "Detailed Chapters"],
            ["Java", "Code Examples"],
            ["SDE-1/2", "Interview Focus"],
          ].map(([value, label]) => (
            <div
              className="sb-stat"
              key={label}
            >
              <div className="sb-stat-value">
                {value}
              </div>

              <div className="sb-stat-label">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}

      <section className="sb-section">
        <div className="sb-container">
          <SectionHeading
            eyebrow="WHY THIS HANDBOOK?"
            title="Everything you need to prepare smarter."
            description="Spring Boot interviews are not just about remembering annotations. Interviewers also expect you to explain the internals, understand trade-offs and solve backend problems."
            centered
          />

          <div className="sb-benefit-grid">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <article
                  className="sb-benefit"
                  key={benefit.title}
                >
                  <div className="sb-icon-box">
                    <Icon size={21} />
                  </div>

                  <h3>{benefit.title}</h3>

                  <p>{benefit.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* TOPICS STRIP */}

      <section className="sb-section alt">
        <div className="sb-container">
          <SectionHeading
            eyebrow="WHAT YOU WILL MASTER"
            title="From annotations to production backend systems."
            description="Build a connected understanding of Spring Boot instead of preparing disconnected theory answers."
          />

          <div className="sb-included-grid">
            {INCLUDED.map((item) => (
              <div
                key={item}
                className="sb-included-item"
              >
                <CheckCircle2 size={17} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SYLLABUS */}

      <section
        className="sb-section"
        id="sb-syllabus"
      >
        <div className="sb-container">
          <SectionHeading
            eyebrow="COMPLETE BOOK SYLLABUS"
            title="100 questions. 10 chapters. One clear roadmap."
            description="Every chapter focuses on a major Spring Boot interview area, with questions arranged from foundational understanding to advanced application."
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 15,
            }}
          >
            <button
              type="button"
              className="sb-outline-btn"
              onClick={toggleAllChapters}
              style={{
                padding: "10px 15px",
                fontSize: 12,
              }}
            >
              {allChaptersOpen
                ? "Collapse All"
                : "Expand All Chapters"}

              <ChevronDown size={15} />
            </button>
          </div>

          <div className="sb-chapter-list">
            {CHAPTERS.map((chapter) => (
              <ChapterCard
                key={chapter.number}
                chapter={chapter}
                isOpen={expandedChapters.includes(
                  chapter.number
                )}
                onToggle={() =>
                  toggleChapter(chapter.number)
                }
              />
            ))}
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 29,
            }}
          >
            <p
              className="sb-muted"
              style={{
                fontSize: 13,
                marginBottom: 15,
              }}
            >
              Ready to turn these topics into
              stronger interview answers?
            </p>

            <button
              type="button"
              className="sb-primary-btn"
              onClick={handleBuyNow}
              disabled={!canPurchase}
            >
              Get All 100 Questions
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* CODE EXAMPLES */}

      <section className="sb-section alt">
        <div className="sb-container sb-code-layout">
          <div>
            <span className="sb-eyebrow">
              <FileCode2 size={14} />
              CODE-BASED LEARNING
            </span>

            <h2 className="sb-heading">
              Don't just remember it.
              <br />
              <span className="sb-accent">
                Understand the code.
              </span>
            </h2>

            <p className="sb-lead">
              Learn Spring Boot concepts using
              practical Java examples. Explore
              dependency injection, API
              development, transaction handling
              and other backend fundamentals.
            </p>

            <div
              style={{
                display: "grid",
                gap: 13,
                marginTop: 23,
              }}
            >
              {[
                "Understand annotations and lifecycle behavior",
                "Connect concepts to practical Java implementations",
                "Prepare for code-based interview follow-ups",
              ].map((item) => (
                <div
                  className="sb-included-item"
                  key={item}
                >
                  <CheckCircle2 size={17} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="sb-code-window">
            <div className="sb-code-tabs">
              {CODE_SAMPLES.map((sample, index) => (
                <button
                  key={sample.filename}
                  type="button"
                  onClick={() =>
                    setActiveCode(index)
                  }
                  className={
                    `sb-code-tab ${
                      activeCode === index
                        ? "active"
                        : ""
                    }`
                  }
                >
                  {sample.label}
                </button>
              ))}
            </div>

            <div className="sb-code-header">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div className="sb-window-dots">
                  <span className="sb-window-dot" />
                  <span className="sb-window-dot" />
                  <span className="sb-window-dot" />
                </div>

                <span>
                  {
                    CODE_SAMPLES[activeCode]
                      .filename
                  }
                </span>
              </div>

              <span>Java</span>
            </div>

            <pre className="sb-code-pre">
              <code>
                {CODE_SAMPLES[activeCode].code}
              </code>
            </pre>

            <div
              style={{
                padding: "15px 18px",
                background: "#222733",
                color: "#c3cbd8",
                fontSize: 12,
                lineHeight: 1.7,
              }}
            >
              <span
                style={{
                  color: "#fb923c",
                  fontWeight: 800,
                }}
              >
                WHY IT MATTERS:
              </span>{" "}
              {
                CODE_SAMPLES[activeCode]
                  .explanation
              }
            </div>
          </div>
        </div>
      </section>

      {/* REAL-WORLD SCENARIOS */}

      <section className="sb-section">
        <div className="sb-container">
          <SectionHeading
            eyebrow="ADVANCED INTERVIEW PREPARATION"
            title="Be ready when the interviewer says, 'What if...?'"
            description="Learn to reason through backend failures, performance bottlenecks and concurrency problems—not just give theoretical answers."
          />

          <div className="sb-benefit-grid">
            {[
              {
                icon: Database,
                title: "Two users, one product",
                text:
                  "How would you prevent overselling when two requests try to purchase the last available item?",
              },
              {
                icon: ShieldCheck,
                title: "Duplicate payment webhook",
                text:
                  "How would you make webhook processing idempotent and avoid duplicate order fulfillment?",
              },
              {
                icon: Clock3,
                title: "A 5-second API",
                text:
                  "How do you identify whether latency comes from database queries, thread pools or downstream calls?",
              },
              {
                icon: Zap,
                title: "High traffic spikes",
                text:
                  "What happens when your application exhausts database connections or request threads?",
              },
              {
                icon: Workflow,
                title: "Kafka consumer failures",
                text:
                  "How should retries, dead-letter topics and duplicate events be handled safely?",
              },
              {
                icon: Rocket,
                title: "Zero-downtime deployment",
                text:
                  "How do you roll out new code safely while maintaining application availability?",
              },
            ].map((scenario) => {
              const Icon = scenario.icon;

              return (
                <article
                  key={scenario.title}
                  className="sb-benefit"
                >
                  <div className="sb-icon-box">
                    <Icon size={20} />
                  </div>

                  <h3>{scenario.title}</h3>

                  <p>{scenario.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* TARGET AUDIENCE */}

      <section className="sb-section alt">
        <div className="sb-container">
          <SectionHeading
            eyebrow="WHO SHOULD READ THIS?"
            title="Built for aspiring and working backend engineers."
            description="Whether you're preparing for your first Java backend role or moving towards SDE-2, this handbook provides a structured revision path."
          />

          <div className="sb-audience-grid">
            {AUDIENCE.map((person) => {
              const Icon = person.icon;

              return (
                <div
                  className="sb-audience-card"
                  key={person.label}
                >
                  <Icon size={25} />

                  <h3>{person.label}</h3>

                  <p>{person.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* REVISION ROADMAP */}

      <section className="sb-section">
        <div className="sb-container">
          <SectionHeading
            eyebrow="7-DAY STUDY ROADMAP"
            title="Have an interview coming up?"
            description="Use this focused revision sequence to organize your preparation and prioritize the most important concepts."
          />

          <div className="sb-revision-grid">
            {REVISION.map(([day, topic]) => (
              <div
                className="sb-day"
                key={day}
              >
                <div className="sb-day-label">
                  {day}
                </div>

                <div className="sb-day-title">
                  {topic}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}

      <section
        className="sb-section alt"
        id="sb-pricing"
      >
        <div className="sb-container">
          <SectionHeading
            eyebrow="GET YOUR COPY"
            title="Invest in your next backend interview."
            description="One focused handbook to revise Spring Boot fundamentals, understand the internals and prepare for real-world backend interview questions."
            centered
          />

          <div className="sb-offer">
            <div className="sb-offer-top">
              <Flame
                size={14}
                style={{
                  verticalAlign: "middle",
                  marginRight: 6,
                }}
              />
              DIGITAL INTERVIEW HANDBOOK
            </div>

            <div className="sb-offer-body">
              <h3
                className="sb-offer-title"
                style={{
                  textAlign: "center",
                }}
              >
                Mastering Spring Boot Interviews
              </h3>

              <p
                className="sb-muted"
                style={{
                  textAlign: "center",
                  fontSize: 13,
                  lineHeight: 1.7,
                }}
              >
                100 Questions • 10 Chapters •
                Detailed Answers & Java Examples
              </p>

              <div className="sb-offer-price">
                {loading ? (
                  <span className="sb-muted">
                    Loading price...
                  </span>
                ) : (
                  <>
                    <span className="sb-price">
                      {formattedPrice}
                    </span>

                    {formattedMrp && (
                      <span className="sb-mrp">
                        {formattedMrp}
                      </span>
                    )}
                  </>
                )}
              </div>

              {discount > 0 && (
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: 22,
                  }}
                >
                  <span className="sb-discount">
                    Save {discount}%
                  </span>
                </div>
              )}

              <div className="sb-included-grid">
                {[
                  "100 Spring Boot interview questions",
                  "Detailed concept explanations",
                  "Java code examples",
                  "Spring Data JPA & transactions",
                  "Security, JWT & microservices",
                  "Redis, Kafka & async programming",
                  "Production troubleshooting",
                  "Seven-day revision roadmap",
                ].map((item) => (
                  <div
                    className="sb-included-item"
                    key={item}
                  >
                    <CheckCircle2 size={17} />
                    {item}
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="sb-primary-btn sb-offer-btn"
                onClick={handleBuyNow}
                disabled={!canPurchase}
              >
                <LockKeyhole size={16} />

                {canPurchase
                  ? `Get Instant Access — ${formattedPrice}`
                  : loading
                    ? "Loading book..."
                    : "Currently Unavailable"}

                <ArrowRight size={16} />
              </button>

              <div
                className="sb-microcopy"
                style={{
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginTop: 17,
                }}
              >
                <ShieldCheck size={14} />
                Secure checkout • Digital delivery
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}

      <section className="sb-section">
        <div className="sb-container">
          <SectionHeading
            eyebrow="FREQUENTLY ASKED QUESTIONS"
            title="Everything you should know."
            centered
          />

          <div className="sb-faq-list">
            {FAQS.map((item, index) => (
              <div
                className={
                  `sb-faq ${
                    openFaq === index ? "open" : ""
                  }`
                }
                key={item.q}
              >
                <button
                  type="button"
                  className="sb-faq-btn"
                  aria-expanded={openFaq === index}
                  onClick={() =>
                    setOpenFaq(
                      openFaq === index
                        ? -1
                        : index
                    )
                  }
                >
                  <span>{item.q}</span>
                  <ChevronDown size={18} />
                </button>

                {openFaq === index && (
                  <div className="sb-faq-answer">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA — NOT A FOOTER */}

      <section
        className="sb-section"
        style={{ paddingTop: 15 }}
      >
        <div className="sb-container">
          <div className="sb-final-cta">
            <Sparkles
              size={27}
              style={{ marginBottom: 14 }}
            />

            <h2>
              Your next Spring Boot interview
              starts with preparation.
            </h2>

            <p>
              Master essential concepts, practice
              technical questions and strengthen
              your backend engineering knowledge
              with the Target Trek Spring Boot
              Interview Handbook.
            </p>

            <button
              type="button"
              className="sb-primary-btn"
              onClick={handleBuyNow}
              disabled={!canPurchase}
            >
              {canPurchase
                ? `Get the Handbook — ${formattedPrice}`
                : "Book Currently Unavailable"}

              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* MOBILE STICKY BUY BAR */}

      <div className="sb-mobile-bar">
        <div>
          <div
            style={{
              fontSize: 10,
              color: "var(--sb-muted)",
              fontWeight: 650,
            }}
          >
            SPRING BOOT HANDBOOK
          </div>

          <div
            style={{
              fontSize: 21,
              fontWeight: 900,
              marginTop: 3,
            }}
          >
            {loading
              ? "Loading..."
              : formattedPrice}
          </div>
        </div>

        <button
          type="button"
          className="sb-primary-btn"
          onClick={handleBuyNow}
          disabled={!canPurchase}
        >
          {canPurchase
            ? "Buy Now"
            : "Unavailable"}

          <ArrowRight size={16} />
        </button>
      </div>

      {/* EXISTING TARGET TREK CHECKOUT */}

      <PayUCheckoutModal
        isOpen={checkoutOpen}
        onClose={closeCheckout}
        product={checkoutProduct}
      />
    </main>
  );
}
