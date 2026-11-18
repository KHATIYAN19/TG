import {
  ArrowsClockwise, Brain, Bug, Code, Coffee, Cpu, Database, FileText, GraduationCap, Hash, Key, Lightning, ListChecks,
  Memory, Stack, Target, Timer, TreeStructure, Trophy, Briefcase,
} from "@phosphor-icons/react";

import { Section } from "./bookKit";
import { Cards, CodeTabs, Flow } from "./genaiKit";
import { ForYou, Glance, JavaSeriesPage, Plan, QuestionBank, Quiz, SampleAnswers, Swap } from "./javaKit";

/*
  /book/java-interview-handbook: what the book is (at a glance) → why it helps → the series → all 100 questions
  → sample answers → HashMap internals → output quiz → code → production scenarios → 7-day plan → who it's for → FAQ → buy
*/

const SEO = {
  title: "100 Java Interview Questions & Answers (PDF) | Target Trek",
  description: "Java interview handbook with 100 questions & answers: Core Java, OOP, Collections, Streams, JVM, multithreading and modern Java 17/21. Digital PDF ebook.",
  keywords: "java interview questions, java interview questions and answers, java interview book, java handbook pdf, core java interview questions, oops interview questions java, collections interview questions, hashmap internal working, multithreading interview questions, concurrency interview questions, jvm interview questions, garbage collection interview, java 8 stream interview questions, java 17 interview, java 21 virtual threads, java output questions, java interview preparation for freshers, sde java interview",
  long: "A Java interview preparation ebook with 100 curated questions and detailed answers across 12 chapters: Java fundamentals, OOP, Strings, the Collections Framework and HashMap internals, exceptions and generics, Java 8 Streams, multithreading and concurrency, JVM memory and garbage collection, modern Java 17 and 21, coding and output questions, real-world scenarios and tricky follow-ups.",
  category: "Java Interview Preparation Ebook",
  teaches: "Core Java, object-oriented programming, Java Collections Framework, HashMap internals, Stream API, multithreading, concurrency, JVM architecture, garbage collection, Java 17 and Java 21 features",
};

const NAV = [["glance", "At a glance"], ["questions", "100 questions"], ["samples", "Sample answers"], ["hashmap", "HashMap internals"], ["quiz", "Output quiz"], ["code", "Code"], ["scenarios", "Scenarios"], ["plan", "7-day plan"], ["bundle", "Series"], ["faq", "FAQ"]];
const STATS = [["100", "questions"], ["12", "chapters"], ["3", "difficulty levels"], ["8→21", "Java versions"]];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const CHAPTERS = [
  { n: "01", title: "Java Fundamentals", range: "Q1–Q10", level: "Beginner",
    description: "How Java runs, language basics and the foundational questions every round starts with.",
    questions: ["What is Java and why is it platform-independent?", "JDK vs JRE vs JVM", "Compilation and Java bytecode", "Features of Java", "Primitive vs reference data types", "== vs equals()", "final vs finally vs finalize()", "Static vs instance variables", "Is Java pass-by-value?", "Method overloading vs overriding"] },
  { n: "02", title: "Object-Oriented Programming", range: "Q11–Q20", level: "Beginner",
    description: "The four pillars, interfaces, inheritance, polymorphism and immutable object design.",
    questions: ["The four pillars of OOP", "Encapsulation vs abstraction", "Abstract class vs interface", "Default and static interface methods", "Multiple inheritance in Java", "Constructor overloading", "Inheritance vs composition", "Runtime polymorphism", "this vs super", "How to write an immutable class"] },
  { n: "03", title: "Strings and Object Handling", range: "Q21–Q28", level: "Beginner",
    description: "String internals, the constant pool, equality, copying and the Object class contract.",
    questions: ["Why is String immutable?", "The String Constant Pool", "String vs StringBuilder vs StringBuffer", "String literal vs new String()", "Shallow copy vs deep copy", "Methods of the Object class", "The equals() and hashCode() contract", "Wrapper classes and autoboxing"] },
  { n: "04", title: "Java Collections Framework", range: "Q29–Q40", level: "Intermediate",
    description: "Collection types, how they are built inside, their complexity and when to pick which.",
    questions: ["The Java Collections Framework", "List vs Set vs Queue vs Map", "ArrayList vs LinkedList", "How HashMap works internally", "How HashMap handles collisions", "HashMap vs Hashtable vs ConcurrentHashMap", "HashSet vs LinkedHashSet vs TreeSet", "Comparable vs Comparator", "Fail-fast vs weakly consistent iterators", "PriorityQueue internals", "CopyOnWriteArrayList", "Choosing the right collection"] },
  { n: "05", title: "Exception Handling and Generics", range: "Q41–Q48", level: "Intermediate",
    description: "Robust error handling, resource management, generics and type erasure.",
    questions: ["Checked vs unchecked exceptions", "How try-catch-finally behaves", "Try-with-resources", "throw vs throws", "Writing custom exceptions", "Java generics", "Type erasure", "Wildcard generics (? extends, ? super)"] },
  { n: "06", title: "Java 8+ and the Stream API", range: "Q49–Q60", level: "Intermediate",
    description: "Lambdas, functional interfaces, Streams, Optional and Collectors in practice.",
    questions: ["Lambda expressions", "Functional interfaces", "Predicate, Function, Consumer and Supplier", "The Stream API", "map() vs flatMap()", "Intermediate vs terminal operations", "filter(), map() and reduce()", "findFirst() vs findAny()", "Parallel streams and when to avoid them", "Optional", "Method references", "Collectors.groupingBy() and partitioningBy()"] },
  { n: "07", title: "Multithreading and Concurrency", range: "Q61–Q72", level: "Advanced",
    description: "Thread safety, locks, visibility, deadlocks and the executor framework.",
    questions: ["Process vs thread", "The thread lifecycle", "Thread vs Runnable vs Callable", "start() vs run()", "Synchronization and race conditions", "synchronized vs ReentrantLock", "The volatile keyword", "Preventing deadlocks", "wait() vs sleep() vs join()", "ExecutorService and thread pools", "Future vs CompletableFuture", "Atomic variables and CAS"] },
  { n: "08", title: "JVM and Memory Management", range: "Q73–Q82", level: "Advanced",
    description: "JVM architecture, heap and stack, garbage collectors, class loading and the JIT.",
    questions: ["JVM architecture", "Stack vs heap memory", "Metaspace vs PermGen", "How garbage collection works", "Minor, major and full GC", "G1 GC and ZGC", "Memory leaks in Java", "OutOfMemoryError vs StackOverflowError", "The class loading mechanism", "The JIT compiler"] },
  { n: "09", title: "Modern Java Features", range: "Q83–Q88", level: "Intermediate",
    description: "The Java 17 and Java 21 features interviewers now expect you to know.",
    questions: ["Java records", "Sealed classes and interfaces", "Switch expressions and pattern matching", "Virtual threads (Java 21)", "Text blocks and sequenced collections", "Other modern language improvements"] },
  { n: "10", title: "Java Coding and Output Questions", range: "Q89–Q94", level: "Intermediate",
    description: "Trace code like the interviewer does, and write the classic implementations.",
    questions: ["String equality output questions", "Overloading and overriding output puzzles", "Find duplicate elements with Streams", "First non-repeating character", "LRU cache with LinkedHashMap", "A thread-safe counter"] },
  { n: "11", title: "Real-World Java Scenarios", range: "Q95–Q98", level: "Advanced",
    description: "Production questions for backend developers: memory, races, latency and caching.",
    questions: ["Debugging high memory usage", "Investigating a race condition", "Diagnosing application latency", "Designing a thread-safe cache"] },
  { n: "12", title: "Tricky Java Interview Questions", range: "Q99–Q100", level: "Advanced",
    description: "Subtle behaviour that shows up as the follow-up that separates good answers from great ones.",
    questions: ["Mutable HashMap keys and broken lookups", "Why volatile does not make count++ atomic"] },
];

const SAMPLES = [
  { short: "Pass-by-value?", category: "Core Java", level: "Beginner", q: "Is Java pass-by-value or pass-by-reference?",
    a: "Java is always pass-by-value. For an object, the value that gets copied is the reference, so the method can change the object's state through it, but reassigning the parameter to a new object never changes the caller's variable.",
    code: `void rename(User u) {
    // same object: caller sees it
    u.setName("Asha");
    // local copy only: caller does not
    u = new User("Ravi");
}`,
    followUp: "What happens if you reassign the object parameter inside the method?" },
  { short: "HashMap internals", category: "Collections", level: "Intermediate", q: "How does HashMap work internally?",
    a: "HashMap keeps an array of buckets. put() hashes the key, picks a bucket with (n - 1) & hash, and uses equals() to find an existing key in that bucket. Collisions are chained in a linked list, and since Java 8 a bucket with 8 or more entries becomes a red-black tree once the table has at least 64 buckets. When size passes capacity × 0.75 the table doubles.",
    points: ["Average O(1) get and put, O(log n) in a treeified bucket", "Keys need a consistent equals() and hashCode()", "Not thread-safe: use ConcurrentHashMap for shared access"],
    followUp: "What happens when two different keys have the same hashCode()?" },
  { short: "volatile vs count++", category: "Concurrency", level: "Advanced", q: "Why does volatile not make count++ thread-safe?",
    a: "volatile guarantees visibility and ordering: every thread reads the latest written value. But count++ is three steps (read, add, write), so two threads can read the same value and both write the same result, losing an update. You need atomicity, from AtomicInteger, a lock or synchronized.",
    code: `AtomicInteger count = new AtomicInteger();

// one atomic compare-and-set
count.incrementAndGet();`,
    followUp: "How does AtomicInteger use compare-and-swap (CAS) to solve this?" },
  { short: "map() vs flatMap()", category: "Java 8+", level: "Intermediate", q: "What is the difference between map() and flatMap()?",
    a: "map() turns each element into exactly one new value, so a Stream<T> becomes a Stream<R>. flatMap() turns each element into a stream and joins all of those streams into one, which is how you flatten nested data such as a List<List<Integer>>.",
    code: `var nested = List.of(List.of(1, 2), List.of(3));

nested.stream()
      .flatMap(List::stream)
      .toList();   // [1, 2, 3]`,
    followUp: "When would you use flatMap() with Optional?" },
  { short: "Memory leaks", category: "JVM", level: "Advanced", q: "Can Java applications have memory leaks?",
    a: "Yes. The garbage collector only frees objects that are unreachable. If something still holds a reference you no longer need, the object stays alive forever. Common causes are unbounded caches and static collections, listeners that are never removed, and ThreadLocal values left on pooled threads.",
    points: ["Spot it: heap usage that keeps rising after each full GC", "Confirm it: take a heap dump and inspect it in Eclipse MAT or VisualVM", "Fix it: bound caches, remove listeners, clear ThreadLocals"],
    followUp: "Which tools would you use to investigate a suspected Java memory leak?" },
];

const HASHMAP_FLOW = [
  { icon: Hash, title: "Hash the key", tag: "hashCode()", text: "Calls key.hashCode(), then folds the high 16 bits into the low ones." },
  { icon: Key, title: "Pick a bucket", tag: "index", text: "index = (n − 1) & hash. The table size n is always a power of two." },
  { icon: ListChecks, title: "Match the key", tag: "equals()", text: "Same hash and equals() is true: replace the value. Otherwise add a node." },
  { icon: TreeStructure, title: "Handle collisions", tag: "treeify", text: "A bucket chains nodes; at 8 nodes (table ≥ 64) it becomes a red-black tree." },
  { icon: ArrowsClockwise, title: "Resize", tag: "0.75", text: "Past capacity × load factor the table doubles and nodes are split across buckets." },
];

const QUIZ = [
  { question: "What does this print?", file: "StringPool.java",
    code: `String a = "java";
String b = new String("java");
System.out.println(a == b);
System.out.println(a.equals(b));`,
    options: ["true true", "false true", "true false", "false false"], answer: 1,
    explain: "The literal \"java\" lives in the String constant pool, while new String(...) creates a separate object on the heap. == compares references (false); equals() compares the characters (true)." },
  { question: "What does this print?", file: "IntegerCache.java",
    code: `Integer a = 127, b = 127;
Integer c = 128, d = 128;
System.out.println((a == b) + " " + (c == d));`,
    options: ["true true", "true false", "false false", "false true"], answer: 1,
    explain: "Autoboxing calls Integer.valueOf(), which caches values from −128 to 127. So a and b are the same cached object, while 128 creates two different objects and == is false. Always compare wrappers with equals()." },
  { question: "What does this print?", file: "RemoveWhileIterating.java",
    code: `List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
for (Integer n : list) {
    if (n == 2) list.remove(n);
}
System.out.println(list);`,
    options: ["[1, 3]", "ConcurrentModificationException", "[1, 2, 3]", "[1, 2]"], answer: 0,
    explain: "Removing the second-last element shrinks the list to size 2 while the iterator's cursor is already 2, so hasNext() returns false and the fail-fast check never runs. Remove any other element and you get a ConcurrentModificationException." },
  { question: "What does this print?", file: "FinallyOrder.java",
    code: `static int test() {
    try {
        return 1;
    } finally {
        System.out.print("finally ");
    }
}

System.out.println(test());`,
    options: ["1", "finally 1", "1 finally", "It does not compile"], answer: 1,
    explain: "The return value 1 is computed first, then the finally block runs before the method actually returns. So \"finally \" is printed, and only then does println print 1." },
  { question: "What does this print?", file: "StaticHiding.java",
    code: `class A { static String who() { return "A"; } }
class B extends A { static String who() { return "B"; } }

A obj = new B();
System.out.println(obj.who());`,
    options: ["A", "B", "It does not compile", "NullPointerException"], answer: 0,
    explain: "Static methods are not overridden, they are hidden. The call is resolved at compile time from the reference type A, so A.who() runs even though the object is a B." },
];

const CODE = [
  { id: "dupes", label: "Streams", filename: "FindDuplicates.java", title: "Find duplicates with the Stream API",
    description: "A classic coding question, answered with a Set inside a stream. The book explains why this lambda has a side effect and when to prefer groupingBy().",
    code: `import java.util.*;
import java.util.stream.*;

public class FindDuplicates {

    public static void main(String[] args) {
        List<Integer> numbers = List.of(1, 2, 2, 3, 4, 4);

        Set<Integer> seen = new HashSet<>();

        List<Integer> duplicates = numbers.stream()
            .filter(n -> !seen.add(n))   // add() is false if already present
            .distinct()
            .toList();

        System.out.println(duplicates);  // [2, 4]
    }
}` },
  { id: "lru", label: "LRU cache", filename: "LRUCache.java", title: "An LRU cache in 15 lines",
    description: "LinkedHashMap in access order plus removeEldestEntry() gives you a working least-recently-used cache, a favourite follow-up after HashMap internals.",
    code: `import java.util.LinkedHashMap;
import java.util.Map;

public class LRUCache<K, V> extends LinkedHashMap<K, V> {

    private final int capacity;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);   // true = access order
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;       // evict least recently used
    }

    public static void main(String[] args) {
        LRUCache<Integer, String> cache = new LRUCache<>(2);
        cache.put(1, "one");
        cache.put(2, "two");
        cache.get(1);                   // 1 is now most recent
        cache.put(3, "three");          // evicts 2
        System.out.println(cache.keySet()); // [1, 3]
    }
}` },
  { id: "atomic", label: "Thread-safe counter", filename: "Counter.java", title: "volatile vs AtomicInteger, side by side",
    description: "Run it and the volatile counter loses updates while the atomic one never does. The book walks through the read-modify-write race and how CAS fixes it.",
    code: `import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Counter {

    static volatile int unsafeCount = 0;       // visible, not atomic
    static final AtomicInteger safeCount = new AtomicInteger();

    public static void main(String[] args) throws InterruptedException {
        ExecutorService pool = Executors.newFixedThreadPool(8);

        for (int i = 0; i < 10_000; i++) {
            pool.submit(() -> {
                unsafeCount++;                 // lost updates
                safeCount.incrementAndGet();   // compare-and-set
            });
        }
        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println(unsafeCount);       // often < 10000
        System.out.println(safeCount.get());   // always 10000
    }
}` },
  { id: "virtual", label: "Virtual threads", filename: "VirtualThreads.java", title: "Java 21 virtual threads",
    description: "Ten thousand blocking tasks finish in about a second because a blocked virtual thread frees its carrier OS thread. Covered in the Modern Java chapter.",
    code: `import java.util.concurrent.Executors;
import java.util.stream.IntStream;

public class VirtualThreads {

    public static void main(String[] args) {
        // Java 21: one lightweight virtual thread per task
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            IntStream.range(0, 10_000).forEach(i ->
                executor.submit(() -> {
                    Thread.sleep(1_000);  // parks the virtual thread only
                    return i;
                })
            );
        } // close() waits for every task to finish

        System.out.println("10,000 tasks done in about a second");
    }
}` },
];

const WHY = [
  { icon: Target, title: "Interview-focused", text: "100 questions picked from real Java rounds and ordered from basics to internals, so you revise what actually gets asked." },
  { icon: Code, title: "Practical Java code", text: "Short snippets, output puzzles and full implementations such as an LRU cache and a thread-safe counter." },
  { icon: Cpu, title: "Internals, not definitions", text: "How HashMap, the String pool, the JVM heap, garbage collectors and locks really work underneath." },
  { icon: Lightning, title: "Fast revision", text: "Chapters you can finish in one sitting and a 7-day plan for the week before your interview." },
];

const PAIN = [
  { before: "Reading random blog posts for every Java topic", after: "100 curated questions in one structured handbook" },
  { before: "Memorising definitions you cannot explain", after: "Answers with the internals, an example and the likely follow-up" },
  { before: "Freezing on output and tricky-behaviour questions", after: "Code-output chapters that train you to trace Java line by line" },
  { before: "Skipping concurrency and the JVM because they feel hard", after: "Dedicated chapters on threads, locks, memory and garbage collection" },
];

const SCENARIOS = [
  { icon: Memory, kicker: "Q95 · Memory", title: "Heap keeps climbing", text: "Memory rises until OutOfMemoryError. How do you find the leak with GC logs, a heap dump and Eclipse MAT?", code: "jcmd <pid> GC.heap_dump" },
  { icon: Bug, kicker: "Q96 · Concurrency", title: "Counts are wrong under load", text: "Totals drift only in production. How do you prove a race condition and fix it without killing throughput?", code: "AtomicLong · LongAdder" },
  { icon: Timer, kicker: "Q97 · Latency", title: "p99 latency spikes", text: "Most requests are fast, some take seconds. Is it GC pauses, lock contention or a saturated thread pool?", code: "jstack · GC logs" },
  { icon: Database, kicker: "Q98 · Design", title: "A thread-safe cache", text: "Build an in-memory cache with safe concurrent reads, atomic loading and eviction.", code: "ConcurrentHashMap.computeIfAbsent" },
  { icon: Key, kicker: "Q99 · Tricky", title: "A key vanishes from HashMap", text: "You put a key, change one of its fields, and get() now returns null. Why, and how do you prevent it?", code: "hashCode() of a mutable key" },
  { icon: Stack, kicker: "Q100 · Tricky", title: "volatile still loses updates", text: "Why a visible variable is not an atomic one, and which tool to reach for instead.", code: "count++ = read + add + write" },
];

const PLAN = [
  { title: "Fundamentals and OOP", text: "How Java runs, equality, pass-by-value, the four pillars and immutability.", chapters: "Ch 01–02 · Q1–Q20" },
  { title: "Strings and exceptions", text: "String pool, equals and hashCode, exception flow, generics and type erasure.", chapters: "Ch 03, 05 · Q21–Q28, Q41–Q48" },
  { title: "Collections", text: "HashMap internals, ConcurrentHashMap, sets, comparators and iterators.", chapters: "Ch 04 · Q29–Q40" },
  { title: "Java 8 and Streams", text: "Lambdas, functional interfaces, map vs flatMap, Optional and Collectors.", chapters: "Ch 06 · Q49–Q60" },
  { title: "Multithreading", text: "Locks, volatile, deadlocks, executors, CompletableFuture and CAS.", chapters: "Ch 07 · Q61–Q72" },
  { title: "JVM and modern Java", text: "Heap, GC, class loading, JIT, records, sealed classes and virtual threads.", chapters: "Ch 08–09 · Q73–Q88" },
  { title: "Mock revision", text: "Output puzzles, coding questions, production scenarios and tricky follow-ups. Then say every answer out loud.", chapters: "Ch 10–12 · Q89–Q100" },
];

const AUDIENCE = [
  { icon: GraduationCap, title: "Students and freshers", text: "Campus placements and first Java developer interviews, starting from the fundamentals." },
  { icon: Coffee, title: "Java developers", text: "One to four years in, switching jobs and needing to explain the internals behind daily code." },
  { icon: Briefcase, title: "Backend engineers", text: "Preparing for the Core Java round before Spring Boot, microservices and system design." },
  { icon: Trophy, title: "SDE-1 and SDE-2 candidates", text: "Concurrency, JVM and production scenarios for the deeper rounds at product companies." },
];

const INCLUDED = [
  "100 interview questions with detailed answers", "12 chapters from fundamentals to internals", "Likely follow-up for the key questions",
  "Java code snippets and output puzzles", "HashMap, String pool and JVM internals", "Multithreading and concurrency in depth",
  "Java 8 Streams plus Java 17 and 21 features", "Real-world production scenarios", "Digital PDF for phone, tablet or laptop",
];

const FAQS = [
  { q: "Is this Java ebook suitable for beginners?", a: "Yes. It starts with Java fundamentals and object-oriented programming, then moves step by step into Collections, Streams, concurrency, JVM internals and advanced topics. Basic Java syntax is enough to begin." },
  { q: "Which Java topics do the 100 interview questions cover?", a: "Core Java, OOP, Strings, the Collections Framework including HashMap internals, exception handling and generics, Java 8 Streams, multithreading and concurrency, JVM memory and garbage collection, modern Java features (records, sealed classes, pattern matching, virtual threads), coding and output questions, real-world scenarios and tricky follow-ups." },
  { q: "Does it cover Java 8, Java 17 and Java 21?", a: "Yes. A full chapter covers Java 8 lambdas, functional interfaces, the Stream API and Optional, and another covers modern Java: records, sealed classes, switch expressions, pattern matching, text blocks, sequenced collections and Java 21 virtual threads." },
  { q: "Does the book include coding and output questions?", a: "Yes. There are code-output puzzles on String equality, overloading and overriding, plus coding questions such as finding duplicates with Streams, the first non-repeating character, an LRU cache with LinkedHashMap and a thread-safe counter." },
  { q: "Is it useful for experienced developers and SDE-2 interviews?", a: "Yes. The later chapters go deep into multithreading, locks, CAS, JVM memory, garbage collectors and production scenarios such as debugging memory leaks, race conditions and latency, which are common in SDE-2 rounds." },
  { q: "Is this a complete Java programming course?", a: "No. It is an interview preparation handbook built around 100 questions, with explanations, examples and follow-ups. It assumes you can already write basic Java." },
  { q: "Is there a Spring Boot interview book too?", a: "Yes. The Spring Boot Interview Handbook has another 100 questions across 10 chapters on Spring Core, REST APIs, JPA, transactions, Spring Security with JWT, microservices, Redis, Kafka and real backend scenarios. Both books are shown in the series section on this page." },
  { q: "How do I get the ebook after paying?", a: "It is a digital PDF ebook, not a physical book. After your payment is confirmed you get access through Target Trek's ebook delivery flow, and you can read it on any phone, tablet or laptop." },
  { q: "Can I get a refund, and how do I contact support?", a: "Digital purchases are non-refundable. For payment or access help, email supporttargettrek@gmail.com." },
];

export default function JavaInterviewHandbook() {
  return (
    <JavaSeriesPage
      id="java" sibling="spring" seo={SEO} nav={NAV} faqs={FAQS} answers={SAMPLES} chapters={CHAPTERS}
      hero={{
        crumb: "Java Interview Handbook",
        pill: <><FileText size={14} weight="bold" aria-hidden />Java interview handbook · PDF ebook</>,
        title: <>Crack the Java round with <span className="hb-mark">100 questions that get asked.</span></>,
        lead: "Core Java, OOP, Collections and HashMap internals, Streams, multithreading, the JVM and Java 17 / 21. Every answer explains what happens underneath and the follow-up the interviewer asks next.",
        stats: STATS,
        coverFallback: { title: "Java Interview Handbook", subtitle: "100 questions & answers", line: "12 chapters · Core Java to JVM" },
      }}
      final={{ title: <>Walk into the Java round <span className="hb-mark">ready for the follow-up.</span></>, line: "100 questions, 12 chapters, real code and the internals behind every answer, in one PDF you can read anywhere." }}
      footerLine="Java Interview Handbook · 100 questions & answers · Digital PDF ebook · Digital purchases are not refundable"
    >
      {({ info, buy, offers }) => (
        <>
          <Section id="glance" eyebrow="At a glance" title="What is the Java Interview Handbook?">
            <Glance
              definition={<><b>The Java Interview Handbook</b> is a digital PDF ebook by Target Trek with <b>100 Java interview questions and answers</b> in 12 chapters, from Java fundamentals and OOP to the Collections Framework, the Stream API, multithreading, JVM memory and modern Java 17 and 21. Every answer explains the internals and the follow-up an interviewer is likely to ask.</>}
              facts={[["Format", "Digital PDF ebook"], ["Questions", "100, with answers"], ["Chapters", "12 · Q1 to Q100"], ["Levels", "Beginner → Advanced"], ["Java versions", "Java 8, 17 and 21"], ["Best for", "Freshers to SDE-2"], ["Reads on", "Phone, tablet, laptop"], ["Publisher", "Target Trek"]]}
              topics={["Core Java", "OOP", "Strings", "Collections", "HashMap internals", "Generics", "Stream API", "Lambdas", "Multithreading", "Concurrency", "JVM", "Garbage collection", "Records", "Sealed classes", "Virtual threads"]}
            />
          </Section>

          <Section id="why" tint eyebrow="Why this book" title="Stop memorising. Start explaining." lead="Interviewers rarely stop at the definition. They ask why, then what happens if. This book prepares you for the second and third question, not just the first.">
            <Swap rows={PAIN} />
            <h3 className="gx-sub">What makes it different</h3>
            <Cards items={WHY} cols={4} />
          </Section>

          {offers}

          <Section id="questions" tint eyebrow="Complete syllabus" title="All 100 questions, chapter by chapter" lead="This is the full list. Filter by difficulty, search for a topic such as HashMap or volatile, and open any chapter to see every question in it.">
            <QuestionBank chapters={CHAPTERS} levels={LEVELS} placeholder="Search: HashMap, volatile, Stream…" />
          </Section>

          <Section id="samples" eyebrow="Free sample" title="Read five answers from the book" lead="The way every answer is written: a direct reply you can say in the interview, the detail behind it, and the follow-up to expect.">
            <SampleAnswers items={SAMPLES} />
          </Section>

          <Section id="hashmap" tint eyebrow="Deep dive" title="How HashMap.put() works, step by step" lead="The single most asked Java internals question. The book walks through it like this, then covers the collisions, resizing and thread-safety follow-ups.">
            <Flow steps={HASHMAP_FLOW} label="How HashMap stores a key-value pair"
              note={<><Brain size={18} weight="bold" aria-hidden /><span><b>Why it matters:</b> if a key&rsquo;s fields change after it is stored, its hashCode() changes too and get() looks in the wrong bucket. That is question 99, one of the tricky follow-ups in the last chapter.</span></>}
            />
          </Section>

          <Section id="quiz" eyebrow="Try it now" title="Five output questions. How many can you get?" lead="Real puzzles of the kind the coding chapter trains you on. Pick an answer to see the explanation.">
            <Quiz items={QUIZ} info={info} onBuy={buy} label="Java output quiz" />
          </Section>

          <Section id="code" tint eyebrow="Learn by code" title="Real Java you can run and explain" lead="Implementations from the coding and modern Java chapters, each one a common interview ask.">
            <CodeTabs examples={CODE} points={["Compiles on Java 17 and 21", "Explained line by line in the ebook", "Includes the follow-up questions"]} />
          </Section>

          <Section id="scenarios" eyebrow="Production thinking" title="The questions that decide SDE-2 offers" lead="The last chapters move from definitions to debugging. These are the situations you are asked to reason through out loud.">
            <Cards items={SCENARIOS} cols={3} />
          </Section>

          <Section id="plan" tint eyebrow="Revision plan" title="Seven days to cover all 100 questions" lead="One focused block a day. The question numbers tell you exactly what to read.">
            <Plan days={PLAN} />
          </Section>

          <Section id="for-you" eyebrow="Who it's for" title="Made for anyone with a Java interview coming up">
            <ForYou audience={AUDIENCE} included={INCLUDED} info={info} onBuy={buy} />
          </Section>
        </>
      )}
    </JavaSeriesPage>
  );
}
