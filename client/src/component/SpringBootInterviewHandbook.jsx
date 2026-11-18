import {
  ArrowsClockwise, Brain, Briefcase, ChatCircleText, Code, Coffee, Database, FileText, Funnel, GraduationCap, Lightning,
  Queue, Rocket, ShieldCheck, Stack, Timer, Trophy, Plugs,
} from "@phosphor-icons/react";

import { Section } from "./bookKit";
import { Cards, CodeTabs, Flow } from "./genaiKit";
import { ForYou, Glance, JavaSeriesPage, Plan, QuestionBank, Quiz, SampleAnswers, Swap } from "./javaKit";

/*
  /book/springboot-interview-handbook: what the book is (at a glance) → why it helps → the series → all 100 questions
  → sample answers → one request through Spring → quiz → code → SDE-2 scenarios → 7-day plan → who it's for → FAQ → buy
*/

const SEO = {
  title: "Spring Boot Interview Questions (100 Q&A) PDF | Target Trek",
  description: "Spring Boot interview handbook: 100 questions & answers on IoC, REST, JPA, Security, JWT, microservices, Redis, Kafka and real backend scenarios. PDF ebook.",
  keywords: "spring boot interview questions, spring boot interview questions and answers, spring boot interview book, spring boot pdf, spring interview questions for experienced, spring core interview questions, dependency injection interview, spring data jpa interview questions, hibernate interview questions, n+1 problem, spring transactional interview, spring aop interview, spring security jwt interview, oauth2 interview, spring boot microservices interview, kafka redis spring boot, spring boot actuator, backend interview preparation, java backend sde 2 interview",
  long: "A Spring Boot interview preparation ebook with 100 questions and detailed answers across 10 chapters: Spring Boot fundamentals and auto-configuration, IoC and dependency injection, REST APIs and exception handling, Spring Data JPA and Hibernate, transactions and AOP, Spring Security with JWT and OAuth2, microservices, Redis, Kafka and async processing, testing and monitoring, and real-world SDE-2 backend scenarios.",
  category: "Spring Boot Interview Preparation Ebook",
  teaches: "Spring Boot, auto-configuration, dependency injection, REST APIs, Spring Data JPA, Hibernate, @Transactional, Spring AOP, Spring Security, JWT, OAuth2, microservices, Redis, Kafka, testing, Actuator and observability",
};

const NAV = [["glance", "At a glance"], ["questions", "100 questions"], ["samples", "Sample answers"], ["request", "Request flow"], ["quiz", "Quiz"], ["code", "Code"], ["scenarios", "Scenarios"], ["plan", "7-day plan"], ["bundle", "Series"], ["faq", "FAQ"]];
const STATS = [["100", "questions"], ["10", "chapters"], ["10", "SDE-2 scenarios"], ["7", "day revision plan"]];
const LEVELS = ["Beginner", "Core", "Intermediate", "Advanced", "Scenario"];

const CHAPTERS = [
  { n: "01", title: "Spring & Spring Boot Fundamentals", range: "Q1–Q10", level: "Beginner",
    description: "What Spring Boot adds on top of Spring: auto-configuration, starters, startup, embedded servers and configuration.",
    questions: ["What is Spring Boot and why is it used?", "How is Spring Boot different from Spring?", "What are its advantages and limitations?", "What does @SpringBootApplication do?", "How does auto-configuration work?", "What are Spring Boot starters?", "What happens during application startup?", "What is an embedded server?", "What is the difference between JAR and WAR?", "How does externalized configuration work?"] },
  { n: "02", title: "Spring Core, IoC & Dependency Injection", range: "Q11–Q20", level: "Core",
    description: "The container itself: inversion of control, injection styles, beans, scopes and the bean lifecycle.",
    questions: ["What is Inversion of Control?", "What is dependency injection?", "Why is constructor injection preferred?", "What exactly is a Spring Bean?", "Compare the stereotype annotations", "How are @Bean and @Component different?", "What are the different bean scopes?", "Explain the Spring Bean lifecycle", "What is ApplicationContext?", "Explain @Primary, @Qualifier and @Lazy"] },
  { n: "03", title: "REST APIs & Exception Handling", range: "Q21–Q30", level: "Core",
    description: "Building clean APIs: controllers, mappings, DTOs, validation, global error handling and pagination.",
    questions: ["How do you create REST APIs?", "@Controller vs @RestController", "Explain the HTTP mapping annotations", "@PathVariable vs @RequestParam", "When should ResponseEntity be used?", "How does JSON conversion work?", "How does request validation work?", "How do you handle exceptions globally?", "What is the difference between PUT and PATCH?", "How do pagination and sorting work?"] },
  { n: "04", title: "Spring Data JPA & Hibernate", range: "Q31–Q40", level: "Intermediate",
    description: "Database access done right: repositories, mappings, fetching, the N+1 problem, locking and migrations.",
    questions: ["JPA vs Hibernate vs Spring Data JPA", "CrudRepository vs JpaRepository", "What are the JPA entity annotations?", "Explain entity relationships and cascading", "Lazy loading vs eager loading", "What is the N+1 query problem?", "save() vs flush() vs saveAndFlush()", "JPQL vs native SQL", "Optimistic vs pessimistic locking", "How do connection pooling and migrations work?"] },
  { n: "05", title: "Transactions, AOP & Internals", range: "Q41–Q50", level: "Advanced",
    description: "What happens behind the annotations: proxies, propagation, isolation, AOP and circular dependencies.",
    questions: ["How does @Transactional work?", "What are the transaction propagation types?", "Explain transaction isolation levels", "Why does @Transactional sometimes fail?", "What is Spring AOP?", "JDK dynamic proxy vs CGLIB", "What are the different types of advice?", "How does Spring handle circular dependencies?", "Explain bean lifecycle hooks and BeanPostProcessor", "How does Spring event publishing work?"] },
  { n: "06", title: "Spring Security, JWT & OAuth2", range: "Q51–Q60", level: "Advanced",
    description: "Authentication and secure APIs: the filter chain, JWT, OAuth2 and OIDC, RBAC, CORS, CSRF and passwords.",
    questions: ["How does Spring Security work?", "Authentication vs authorization", "How do you implement JWT authentication?", "Session vs JWT authentication", "Explain OAuth2, OIDC and JWT", "How do you implement role-based access control?", "What is CORS?", "What is CSRF?", "How should passwords be stored?", "How do you secure production APIs?"] },
  { n: "07", title: "Spring Boot Microservices", range: "Q61–Q70", level: "Advanced",
    description: "Services that talk to each other and survive failure: clients, discovery, gateways, resilience and sagas.",
    questions: ["Microservices vs monolithic architecture", "How do microservices communicate?", "RestTemplate vs RestClient vs WebClient", "What is service discovery?", "What is an API Gateway?", "How does a circuit breaker work?", "Explain retry, timeout and bulkhead", "What is the Saga pattern?", "How is configuration managed centrally?", "How does distributed tracing work?"] },
  { n: "08", title: "Redis, Kafka & Async Processing", range: "Q71–Q80", level: "Advanced",
    description: "Real-world integrations: caching, cache invalidation, Kafka producers and consumers, async and scheduled jobs.",
    questions: ["How does Spring caching work?", "How do you integrate Redis?", "How do you invalidate cached data?", "How do you integrate Kafka?", "What happens when Kafka processing fails?", "How do you prevent duplicate consumption?", "How does @Async work?", "CompletableFuture vs reactive processing", "How do scheduled tasks work?", "How do you build reliable background jobs?"] },
  { n: "09", title: "Testing, Performance & Monitoring", range: "Q81–Q90", level: "Advanced",
    description: "Production readiness: test slices, Testcontainers, tuning slow APIs, WebFlux, Actuator and observability.",
    questions: ["How do you write unit tests?", "@SpringBootTest vs @WebMvcTest vs @DataJpaTest", "How do you test REST APIs?", "How does Testcontainers work?", "How do you optimize slow APIs?", "How does Spring handle concurrent requests?", "Spring MVC vs WebFlux", "What is Spring Boot Actuator?", "How do you implement observability?", "How do you debug memory leaks?"] },
  { n: "10", title: "Real-World Backend Interview Scenarios", range: "Q91–Q100", level: "Scenario",
    description: "Think like an SDE-2: reason through concurrency, payments, latency, scale and deployment problems out loud.",
    questions: ["How do you prevent concurrent overselling?", "How do you handle duplicate payment webhooks?", "How would you debug a 5-second API?", "Why might an application crash under load?", "How do you process 1 million records?", "How would you design secure refresh tokens?", "How would you build a distributed rate limiter?", "How do you handle database failures?", "How do you deploy with zero downtime?", "Explain a complete production backend request flow"] },
];

const SAMPLES = [
  { short: "@SpringBootApplication", category: "Fundamentals", level: "Beginner", q: "What does @SpringBootApplication do?",
    a: "It is a shortcut for three annotations. @SpringBootConfiguration marks the class as a source of bean definitions, @EnableAutoConfiguration loads the auto-configuration classes whose conditions match your classpath and properties, and @ComponentScan picks up your @Component, @Service, @Repository and @Controller classes from that package downwards.",
    points: ["Auto-configuration is conditional: @ConditionalOnClass, @ConditionalOnMissingBean", "A bean you define yourself always wins over the auto-configured one", "Run with --debug to print the condition evaluation report"],
    followUp: "How would you exclude one auto-configuration class, and why might you need to?" },
  { short: "Constructor injection", category: "IoC & DI", level: "Core", q: "Why is constructor injection preferred over field injection?",
    a: "Dependencies become final and mandatory, so the object can never exist half-built. The class is easy to unit test with a plain new and a mock, and a constructor with too many parameters is an honest signal that the class does too much. Field injection hides dependencies and needs reflection or a Spring context to test.",
    code: `@Service
public class OrderService {

    private final PaymentClient payments;

    // single constructor: no @Autowired needed
    public OrderService(PaymentClient payments) {
        this.payments = payments;
    }
}`,
    followUp: "Do you need @Autowired on a class with a single constructor?" },
  { short: "@Transactional not working", category: "Transactions", level: "Advanced", q: "Why does @Transactional sometimes not work?",
    a: "Spring applies @Transactional through a proxy, so it only takes effect when the call passes through that proxy. It silently does nothing when a method calls another method in the same class (self-invocation), on methods the proxy cannot intercept such as private ones, and on objects Spring does not manage. By default it also rolls back only for unchecked exceptions, not checked ones.",
    points: ["Move the transactional method into a separate bean", "Use rollbackFor = Exception.class for checked exceptions", "Keep transactional methods public and called from outside"],
    followUp: "What is the difference between REQUIRED and REQUIRES_NEW propagation?" },
  { short: "N+1 query problem", category: "JPA & Hibernate", level: "Intermediate", q: "What is the N+1 query problem and how do you fix it?",
    a: "You load N parent rows with one query, then touching a lazy collection on each parent fires one more query per row: 1 + N queries in total. It is invisible in small tests and slow in production. The fix is to fetch what you need in the first query, using JOIN FETCH, an @EntityGraph, or batch fetching.",
    code: `@Query("""
    select o from Order o
    join fetch o.items
    where o.status = :status""")
List<Order> findWithItems(Status status);`,
    followUp: "Why is JOIN FETCH combined with pagination a problem in Hibernate?" },
  { short: "Session vs JWT", category: "Security", level: "Advanced", q: "Session vs JWT authentication: which would you choose?",
    a: "With sessions the server keeps the login state and the browser sends a session cookie; logout and revocation are easy, but you need shared session storage once you run several instances. With JWT the server signs a token carrying the user's claims, so any instance can verify it without a lookup, but a token stays valid until it expires. So keep access tokens short-lived and pair them with a refresh token you can revoke.",
    followUp: "Where would you store a JWT in the browser, and what are the risks of each option?" },
];

const REQUEST_FLOW = [
  { icon: ShieldCheck, title: "Security filter chain", tag: "filters", text: "The JWT is validated and the SecurityContext is set before any controller runs." },
  { icon: Funnel, title: "DispatcherServlet", tag: "front controller", text: "Finds the matching @RequestMapping handler and converts the JSON body into your DTO." },
  { icon: Plugs, title: "Controller", tag: "@Valid", text: "Validates input and delegates. Failures go to your @RestControllerAdvice." },
  { icon: Stack, title: "Service proxy", tag: "@Transactional", text: "A proxy opens the transaction, calls your method, then commits or rolls back." },
  { icon: Database, title: "Repository", tag: "JPA", text: "Spring Data builds the query; Hibernate tracks entities and flushes on commit." },
];

const QUIZ = [
  { question: "Which single annotation combines @Configuration, @EnableAutoConfiguration and @ComponentScan?",
    options: ["@SpringBootApplication", "@EnableWebMvc", "@ComponentScan", "@SpringBootConfiguration"], answer: 0,
    explain: "@SpringBootApplication bundles those three (strictly, @SpringBootConfiguration, which is itself a @Configuration). It is the entry point for auto-configuration and component scanning." },
  { question: "Two beans of the same type exist. Which annotation picks one explicitly at the injection point?",
    options: ["@Lazy", "@Qualifier", "@Scope", "@Value"], answer: 1,
    explain: "@Qualifier selects a bean by name where it is injected. @Primary marks a default candidate instead, and the two are often used together." },
  { question: "A @Transactional method is called from another method in the same class. What happens?", file: "OrderService.java",
    code: `@Service
public class OrderService {

    public void placeOrder() {
        reserveStock();      // internal call
    }

    @Transactional
    public void reserveStock() { /* ... */ }
}`,
    options: ["A new transaction always starts", "No transaction: the call bypasses the proxy", "Spring throws BeanCreationException", "It always rolls back"], answer: 1,
    explain: "Spring applies @Transactional through a proxy. A call from inside the same class never goes through the proxy, so no transaction is started. Move the method to another bean to fix it." },
  { question: "A controller returns an entity, and serialising order.getItems() fails after the service method has returned. Which exception do you most likely see?", file: "OrderController.java",
    code: `@GetMapping("/orders/{id}")
public Order get(@PathVariable Long id) {
    return orderService.find(id);   // items is LAZY
}
// spring.jpa.open-in-view=false`,
    options: ["NullPointerException", "LazyInitializationException", "TransactionRequiredException", "EntityNotFoundException"], answer: 1,
    explain: "With open-in-view disabled, the persistence context closes when the transactional service method returns. Touching the lazy collection afterwards throws LazyInitializationException. Return a DTO, or fetch the items in the query." },
  { question: "A POST endpoint creates a new resource. Which response fits REST conventions best?",
    options: ["200 OK with the body", "201 Created with a Location header", "202 Accepted", "204 No Content"], answer: 1,
    explain: "201 Created tells the client a resource now exists, and the Location header points to it. In Spring: ResponseEntity.created(uri).body(dto)." },
];

const CODE = [
  { id: "di", label: "Dependency injection", filename: "BookService.java", title: "Constructor injection",
    description: "Spring-managed dependencies, final fields and a service you can unit test without starting Spring. Chapter 02 explains why interviewers care.",
    code: `@Service
public class BookService {

    private final BookRepository repository;

    public BookService(BookRepository repository) {
        this.repository = repository;
    }

    public List<Book> getBooks() {
        return repository.findAll();
    }
}` },
  { id: "rest", label: "REST API", filename: "BookController.java", title: "A clean REST controller",
    description: "Mappings, validation, ResponseEntity and the right status codes, covered in Chapter 03.",
    code: `@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService service;

    public BookController(BookService service) {
        this.service = service;
    }

    @GetMapping
    public List<BookDto> all() {
        return service.getBooks();
    }

    @PostMapping
    public ResponseEntity<BookDto> create(@Valid @RequestBody NewBook body) {
        BookDto saved = service.create(body);
        URI location = URI.create("/api/books/" + saved.id());
        return ResponseEntity.created(location).body(saved);
    }
}` },
  { id: "errors", label: "Error handling", filename: "GlobalExceptionHandler.java", title: "Global exception handling",
    description: "One place that turns exceptions into consistent JSON errors using Spring 6 ProblemDetail.",
    code: `@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BookNotFoundException.class)
    public ProblemDetail notFound(BookNotFoundException ex) {
        return ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail invalid(MethodArgumentNotValidException ex) {
        ProblemDetail body = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        body.setDetail("Validation failed");
        body.setProperty("errors", ex.getBindingResult().getFieldErrors()
            .stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .toList());
        return body;
    }
}` },
  { id: "tx", label: "Transactions & locks", filename: "InventoryService.java", title: "Prevent overselling with a row lock",
    description: "A transaction plus a pessimistic lock so two buyers can never take the last item. This is scenario Q91, worked through in the book.",
    code: `public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)   // SELECT ... FOR UPDATE
    @Query("select i from Inventory i where i.id = :id")
    Optional<Inventory> findByIdForUpdate(Long id);
}

@Service
public class InventoryService {

    private final InventoryRepository repository;

    public InventoryService(InventoryRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void reserveItem(Long itemId) {
        Inventory item = repository.findByIdForUpdate(itemId)
            .orElseThrow();

        if (item.getQuantity() <= 0) {
            throw new IllegalStateException("Out of stock");
        }
        item.setQuantity(item.getQuantity() - 1);   // flushed on commit
    }
}` },
];

const WHY = [
  { icon: Brain, title: "Understand the why", text: "Go beyond definitions and learn how Spring Boot components actually work underneath." },
  { icon: Code, title: "Learn through Java code", text: "Annotations, configuration and real implementation patterns, shown in short runnable snippets." },
  { icon: ChatCircleText, title: "Answer with confidence", text: "A concise answer for each question, plus the deeper concept behind the likely follow-up." },
  { icon: Database, title: "Think like a backend engineer", text: "Connect every concept to REST APIs, databases, security, concurrency and production systems." },
  { icon: Rocket, title: "SDE-1 to SDE-2", text: "Climb from fundamentals to internals, architecture and troubleshooting scenarios." },
  { icon: ArrowsClockwise, title: "Revise efficiently", text: "Questions grouped by topic, chapter summaries and a 7-day plan for the week before." },
];

const PAIN = [
  { before: "Memorising annotations without knowing how they work", after: "Internals explained: proxies, bean lifecycle and auto-configuration" },
  { before: "Knowing CRUD but freezing on transaction and locking questions", after: "JPA, transactions and concurrency covered with code" },
  { before: "Theory-only answers when asked what happens if production breaks", after: "A full chapter of real-world SDE-2 backend scenarios" },
  { before: "Scattered notes across blogs and videos", after: "100 questions, 10 chapters, one revision plan" },
];

const SCENARIOS = [
  { icon: Database, kicker: "Q91 · Concurrency", title: "Two users, one product", text: "Two requests try to buy the last item at the same time. How do you prevent overselling?", code: "@Lock(PESSIMISTIC_WRITE) · @Version" },
  { icon: ShieldCheck, kicker: "Q92 · Payments", title: "Duplicate payment webhook", text: "The gateway sends the same webhook twice. How do you make processing idempotent?", code: "unique event id + upsert" },
  { icon: Timer, kicker: "Q93 · Latency", title: "A 5-second API", text: "Is the time going to slow queries, an exhausted thread pool or a downstream call? How do you find out?", code: "Actuator · tracing · slow query log" },
  { icon: Lightning, kicker: "Q94 · Load", title: "Crashes under traffic spikes", text: "What happens when request threads or database connections run out, and how do you protect the app?", code: "HikariCP pool · bulkhead" },
  { icon: Queue, kicker: "Q75 · Kafka", title: "Kafka consumer failures", text: "How should retries, dead-letter topics and duplicate events be handled safely?", code: "retry topic → DLT" },
  { icon: Rocket, kicker: "Q99 · Deployment", title: "Zero-downtime deployment", text: "How do you roll out new code and database changes while staying available?", code: "rolling · readiness probes" },
];

const PLAN = [
  { title: "Fundamentals and IoC", text: "Auto-configuration, starters, startup, DI, bean scopes and lifecycle.", chapters: "Ch 01–02 · Q1–Q20" },
  { title: "REST APIs", text: "Controllers, mappings, DTOs, validation, global errors, PUT vs PATCH.", chapters: "Ch 03 · Q21–Q30" },
  { title: "JPA and Hibernate", text: "Relationships, lazy loading, N+1, flush, JPQL and locking.", chapters: "Ch 04 · Q31–Q40" },
  { title: "Transactions and AOP", text: "Proxies, propagation, isolation, self-invocation and CGLIB.", chapters: "Ch 05 · Q41–Q50" },
  { title: "Security and microservices", text: "Filter chain, JWT, OAuth2, gateways, circuit breakers and sagas.", chapters: "Ch 06–07 · Q51–Q70" },
  { title: "Redis, Kafka and testing", text: "Caching, Kafka failures, @Async, test slices, Actuator and tracing.", chapters: "Ch 08–09 · Q71–Q90" },
  { title: "Scenarios and mock revision", text: "Work through all 10 production scenarios out loud, then re-read every answer you hesitated on.", chapters: "Ch 10 · Q91–Q100" },
];

const AUDIENCE = [
  { icon: GraduationCap, title: "Students and freshers", text: "Build a strong Spring Boot foundation before your first Java backend interview." },
  { icon: Coffee, title: "Java developers", text: "Move from Core Java to the Spring Boot round with the internals behind the annotations." },
  { icon: Briefcase, title: "Backend engineers", text: "Strengthen your grasp of APIs, databases, security and production systems." },
  { icon: Trophy, title: "SDE-1 and SDE-2 candidates", text: "Prepare for theory, internals, implementation and scenario-based rounds." },
];

const INCLUDED = [
  "100 structured interview questions", "Direct answers and detailed explanations", "Java and Spring Boot code examples",
  "Spring Core, IoC, DI and bean lifecycle", "REST APIs and exception handling", "Spring Data JPA and Hibernate",
  "Transactions, locking and Spring AOP", "Spring Security, JWT and OAuth2", "Microservices and resilience patterns",
  "Redis, Kafka and async processing", "Testing, Actuator and observability", "10 real SDE-2 production scenarios",
];

const FAQS = [
  { q: "Is this Spring Boot book suitable for beginners?", a: "Yes. It begins with Spring Framework and Spring Boot fundamentals, then moves to database integration, security, microservices and production scenarios. Basic Core Java knowledge is recommended before you start." },
  { q: "Which Spring Boot topics do the 100 questions cover?", a: "Spring and Spring Boot fundamentals, IoC and dependency injection, REST APIs and exception handling, Spring Data JPA and Hibernate, transactions and AOP, Spring Security with JWT and OAuth2, microservices, Redis, Kafka and async processing, testing and monitoring, and real-world backend scenarios." },
  { q: "Does it include Java code examples?", a: "Yes. Java and Spring Boot examples explain the key annotations, REST controllers, exception handling, JPA queries, transactions and locking, security, caching and other topics." },
  { q: "Is this useful for SDE-2 and experienced developer interviews?", a: "Yes. The later chapters cover transactions, concurrency, Spring internals, microservices, Kafka, Redis, observability, and a full chapter of scenario questions such as overselling, duplicate webhooks, slow APIs and zero-downtime deployment." },
  { q: "How is this different from the HLD and LLD books?", a: "HLD focuses on distributed architecture and scalability, and LLD on object-oriented class design. This handbook focuses on Spring Boot and Java backend interview questions. The LLD (Java) book is a good next step after it." },
  { q: "Is there a Java interview book too?", a: "Yes. The Java Interview Handbook has 100 Core Java questions on OOP, Collections, Streams, concurrency, the JVM and modern Java. Both books are shown in the series section on this page." },
  { q: "Is this a complete Spring Boot development course?", a: "No. It is built for technical interviews and revision. It explains concepts in depth, but it does not replace a full project-based development course." },
  { q: "How do I get the ebook after paying?", a: "It is a digital PDF ebook. After your payment is confirmed you get access through Target Trek's ebook delivery flow, and you can read it on any phone, tablet or laptop." },
  { q: "Can I get a refund, and how do I contact support?", a: "Digital purchases are non-refundable. For payment or access help, email supporttargettrek@gmail.com." },
];

export default function SpringBootInterviewHandbook() {
  return (
    <JavaSeriesPage
      id="spring" sibling="java" seo={SEO} nav={NAV} faqs={FAQS} answers={SAMPLES} chapters={CHAPTERS}
      hero={{
        crumb: "Spring Boot Interview Handbook",
        pill: <><FileText size={14} weight="bold" aria-hidden />Spring Boot interview handbook · PDF ebook</>,
        title: <>Answer Spring Boot questions <span className="hb-mark">like a backend engineer.</span></>,
        lead: "100 questions from IoC and auto-configuration to JPA, transactions, Spring Security with JWT, microservices, Redis and Kafka, ending with 10 real SDE-2 production scenarios.",
        stats: STATS,
        coverFallback: { title: "Spring Boot Interview Handbook", subtitle: "100 questions & answers", line: "10 chapters · Core to production" },
      }}
      final={{ title: <>Know what happens <span className="hb-mark">behind every annotation.</span></>, line: "100 questions, 10 chapters, real Spring code and 10 production scenarios, in one PDF you can read anywhere." }}
      footerLine="Spring Boot Interview Handbook · 100 questions & answers · Digital PDF ebook · Digital purchases are not refundable"
    >
      {({ info, buy, offers }) => (
        <>
          <Section id="glance" eyebrow="At a glance" title="What is the Spring Boot Interview Handbook?">
            <Glance
              definition={<><b>The Spring Boot Interview Handbook</b> is a digital PDF ebook by Target Trek with <b>100 Spring Boot interview questions and answers</b> in 10 chapters, covering Spring Core and dependency injection, REST APIs, Spring Data JPA, transactions, Spring Security with JWT, microservices, Redis and Kafka. It ends with 10 real-world backend scenarios of the kind asked in SDE-2 interviews.</>}
              facts={[["Format", "Digital PDF ebook"], ["Questions", "100, with answers"], ["Chapters", "10 · Q1 to Q100"], ["Levels", "Beginner → Scenario"], ["Prerequisite", "Basic Core Java"], ["Best for", "Freshers to SDE-2"], ["Reads on", "Phone, tablet, laptop"], ["Publisher", "Target Trek"]]}
              topics={["Auto-configuration", "IoC & DI", "Bean lifecycle", "REST APIs", "Validation", "Spring Data JPA", "Hibernate", "N+1 problem", "@Transactional", "Spring AOP", "Spring Security", "JWT", "OAuth2", "Microservices", "Redis", "Kafka", "Actuator", "Testcontainers"]}
            />
          </Section>

          <Section id="why" tint eyebrow="Why this book" title="Stop memorising annotations. Explain them." lead="Interviewers ask what @Transactional does, then why it did not roll back. This book prepares you for the second question.">
            <Swap rows={PAIN} />
            <h3 className="gx-sub">What makes it different</h3>
            <Cards items={WHY} cols={3} />
          </Section>

          {offers}

          <Section id="questions" tint eyebrow="Complete syllabus" title="All 100 questions, chapter by chapter" lead="This is the full list. Filter by level, search for a topic such as JWT or N+1, and open any chapter to see every question in it.">
            <QuestionBank chapters={CHAPTERS} levels={LEVELS} placeholder="Search: JWT, N+1, Kafka, @Transactional…" />
          </Section>

          <Section id="samples" eyebrow="Free sample" title="Read five answers from the book" lead="The way every answer is written: a direct reply you can say in the interview, the detail behind it, and the follow-up to expect.">
            <SampleAnswers items={SAMPLES} />
          </Section>

          <Section id="request" tint eyebrow="The big picture" title="Follow one request through a Spring Boot app" lead="Most Spring questions are about one of these five steps. The book takes each one apart.">
            <Flow steps={REQUEST_FLOW} label="How an HTTP request moves through Spring Boot"
              note={<><Brain size={18} weight="bold" aria-hidden /><span><b>Interview tip:</b> most &ldquo;why doesn&rsquo;t my annotation work&rdquo; questions come down to the proxy in step four. Chapter 05 covers proxies, self-invocation and propagation in depth.</span></>}
            />
          </Section>

          <Section id="quiz" eyebrow="Try it now" title="Five Spring Boot questions. How many can you get?" lead="The kind of short checks interviewers use to test real understanding. Pick an answer to see the explanation.">
            <Quiz items={QUIZ} info={info} onBuy={buy} label="Spring Boot quiz" />
          </Section>

          <Section id="code" tint eyebrow="Learn by code" title="Spring code you can explain line by line" lead="Patterns from the book that come up in almost every backend interview.">
            <CodeTabs examples={CODE} points={["Modern Spring Boot style", "Explained step by step in the ebook", "Includes the follow-up questions"]} />
          </Section>

          <Section id="scenarios" eyebrow="Production thinking" title="The scenarios that decide SDE-2 offers" lead="Questions with no single right answer. The book shows how to reason through each one and which trade-offs to name.">
            <Cards items={SCENARIOS} cols={3} />
          </Section>

          <Section id="plan" tint eyebrow="Revision plan" title="Seven days to cover all 100 questions" lead="One focused block a day. The question numbers tell you exactly what to read.">
            <Plan days={PLAN} />
          </Section>

          <Section id="for-you" eyebrow="Who it's for" title="Made for anyone with a Java backend interview coming up">
            <ForYou audience={AUDIENCE} included={INCLUDED} info={info} onBuy={buy} />
          </Section>
        </>
      )}
    </JavaSeriesPage>
  );
}
