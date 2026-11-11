import API_BASE_URL from "../utils/Url";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Helmet } from "react-helmet-async";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { trackViewContent } from "../lib/metaPixel";

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Cpu,
  FileText,
  Gauge,
  GraduationCap,
  HardDrive,
  Layers3,
  LockKeyhole,
  Network,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Split,
  Target,
  Terminal,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";

// ======================================================
// CONFIGURATION
// ======================================================

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";
const PAGE_PATH = "/books/operating-systems";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const BASE_URL =
  API_BASE_URL;

const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SEO_TITLE =
  "Operating System Ebook: Interview & Placement Guide | Target Trek";

const SEO_DESCRIPTION =
  "Master Operating Systems for exams, placements and real jobs: processes, threads, CPU scheduling, synchronization, deadlocks, memory, virtual memory, file systems, Linux toolkit and solved problems.";

// ======================================================
// UTILITIES
// ======================================================

const readTheme = () => {
  if (typeof window === "undefined") return "light";

  try {
    return localStorage.getItem(THEME_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

const formatMoney = (value, currency = "INR") => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";

  const localeMap = {
    INR: "en-IN",
    USD: "en-US",
    GBP: "en-GB",
    EUR: "en-IE",
    AUD: "en-AU",
    CAD: "en-CA",
  };

  try {
    return new Intl.NumberFormat(localeMap[currency] || "en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

// ======================================================
// CURRICULUM - 15 CHAPTERS
// ======================================================

const CURRICULUM = [
  {
    id: "foundations",
    number: "01",
    title: "Core Foundations",
    subtitle: "Kernel, processes and threads",
    chapters: [
      {
        n: "01",
        title: "Operating System Fundamentals",
        details:
          "What an OS is and does, the types of operating systems, how the kernel is protected with dual mode, interrupts and traps, how programs request services through system calls, and how the OS boots.",
        sections: [
          "What is an Operating System",
          "Functions of an OS",
          "Types of OS",
          "Dual Mode, Interrupts and Traps",
          "System Calls",
          "OS Structures",
          "The Boot Process",
        ],
      },
      {
        n: "02",
        title: "Processes",
        details:
          "Program vs process, process states, the PCB and context switching, schedulers and queues, fork/exec/wait, and inter-process communication.",
        sections: [
          "Program vs Process",
          "Process States",
          "PCB and Context Switch",
          "Schedulers and Queues",
          "Process Creation and Termination (fork, exec, wait)",
          "Inter-Process Communication",
        ],
      },
      {
        n: "03",
        title: "Threads and Multithreading",
        details:
          "What a thread is, user-level vs kernel-level threads with the mapping models, and the difference between concurrency and parallelism along with common thread issues.",
        sections: [
          "What is a Thread",
          "User-Level vs Kernel-Level Threads and Mapping Models",
          "Concurrency, Parallelism and Thread Issues",
        ],
      },
    ],
  },
  {
    id: "scheduling-sync",
    number: "02",
    title: "Scheduling & Concurrency",
    subtitle: "Who runs, when, and how they cooperate",
    chapters: [
      {
        n: "04",
        title: "CPU Scheduling",
        details:
          "Scheduling terms and formulas, every major algorithm, a worked example that runs four processes through four algorithms, and starvation, the convoy effect and real systems.",
        sections: [
          "Basic Terms and Formulas",
          "The Scheduling Algorithms",
          "Worked Example (four processes, four algorithms)",
          "Starvation, Convoy Effect and Real Systems",
        ],
      },
      {
        n: "05",
        title: "Process Synchronization",
        details:
          "Race conditions and the critical-section problem, Peterson's solution, hardware atomics and locks, semaphores, the classic synchronization problems, monitors and priority inversion.",
        sections: [
          "Race Condition and the Critical-Section Problem",
          "Peterson, Hardware Atomics, Locks",
          "Semaphores",
          "Classic Problems (Producer-Consumer, Readers-Writers, Dining Philosophers)",
          "Monitors, Condition Variables and Priority Inversion",
        ],
      },
      {
        n: "06",
        title: "Deadlocks",
        details:
          "What a deadlock is, the strategies to handle it, safe states and Banker's algorithm for avoidance, and detection with recovery.",
        sections: [
          "What is a Deadlock",
          "Handling Deadlocks",
          "Avoidance: Safe State and Banker's Algorithm",
          "Detection and Recovery",
        ],
      },
    ],
  },
  {
    id: "memory-storage",
    number: "03",
    title: "Memory & Storage",
    subtitle: "From RAM and paging to disks and files",
    chapters: [
      {
        n: "07",
        title: "Memory Management",
        details:
          "Logical vs physical addresses and binding, contiguous allocation and fragmentation, paging, segmentation and segmented paging.",
        sections: [
          "Logical vs Physical Address, Binding",
          "Contiguous Allocation and Fragmentation",
          "Paging",
          "Segmentation and Segmented Paging",
        ],
      },
      {
        n: "08",
        title: "Virtual Memory",
        details:
          "Demand paging and page faults, page replacement algorithms, frame allocation and thrashing.",
        sections: [
          "Demand Paging and Page Faults",
          "Page Replacement Algorithms",
          "Frame Allocation and Thrashing",
        ],
      },
      {
        n: "09",
        title: "File Systems",
        details:
          "File concepts, allocation methods, the Unix inode with a worked example, free-space management, links and permissions, journaling, caching and common file systems.",
        sections: [
          "File Concepts",
          "File Allocation Methods",
          "The Unix Inode and Worked Example",
          "Free-Space Management, Links, Permissions",
          "Journaling, Caching and Common File Systems",
        ],
      },
      {
        n: "10",
        title: "I/O Systems and Disk Management",
        details:
          "I/O hardware and techniques, disk structure and access time, disk scheduling algorithms, disk management and RAID.",
        sections: [
          "I/O Hardware and Techniques",
          "Disk Structure and Access Time",
          "Disk Scheduling Algorithms",
          "Disk Management and RAID",
        ],
      },
    ],
  },
  {
    id: "advanced",
    number: "04",
    title: "Security & Real-World OS",
    subtitle: "Protection, virtualization and Linux in practice",
    chapters: [
      {
        n: "11",
        title: "Protection, Security and Virtualization",
        details:
          "How operating systems protect resources and defend against attacks, plus virtualization and containers.",
        sections: [
          "Protection and Security",
          "Virtualization and Containers",
        ],
      },
      {
        n: "12",
        title: "OS in Practice (Linux Toolkit)",
        details:
          "Map everyday Linux commands to the OS concepts behind them, understand file descriptors, redirection and pipes, and follow a troubleshooting checklist.",
        sections: [
          "Everyday Commands Mapped to OS Concepts",
          "File Descriptors, Redirection and Pipes",
          "Troubleshooting Checklist",
        ],
      },
    ],
  },
  {
    id: "interview",
    number: "05",
    title: "Practice & Revision",
    subtitle: "Solve, drill and revise before the interview",
    chapters: [
      {
        n: "13",
        title: "Popular Solved Problems",
        details:
          "16 fully solved numerical problems covering the questions that appear most often in exams and interviews.",
        sections: ["16 numerical problems, solved step by step"],
      },
      {
        n: "14",
        title: "Interview Rapid-Fire",
        details:
          "60 interview questions with crisp model answers, plus OS problems that show up in coding rounds.",
        sections: [
          "60 questions and answers",
          "Coding-Round OS Problems",
        ],
      },
      {
        n: "15",
        title: "Quick Revision",
        details:
          "A formula sheet, algorithm comparison tables and a night-before checklist that condense the whole book.",
        sections: [
          "Formula Sheet",
          "Algorithm Comparison",
          "Night-Before Checklist",
        ],
      },
    ],
  },
];

const TOTAL_CHAPTERS = CURRICULUM.reduce(
  (sum, group) => sum + group.chapters.length,
  0
);

// ======================================================
// CPU SCHEDULING COMPARISON
// ======================================================

const SCHEDULERS = [
  {
    name: "FCFS",
    type: "Non-preemptive",
    ideal: "Simple batch systems",
    description:
      "Easy to implement but suffers from the convoy effect; long jobs delay everyone.",
  },
  {
    name: "SJF",
    type: "Non-preemptive",
    ideal: "Minimizing average waiting time",
    description:
      "Optimal average waiting time among non-preemptive policies, but needs burst estimates and can starve long jobs.",
  },
  {
    name: "SRTF",
    type: "Preemptive",
    ideal: "Short-job responsiveness",
    description:
      "Preemptive SJF; best average waiting time, higher context-switch overhead and starvation risk.",
  },
  {
    name: "Priority",
    type: "Preemptive / Non-preemptive",
    ideal: "Systems with importance levels",
    description:
      "Low-priority processes can starve; aging gradually raises their priority to fix it.",
  },
  {
    name: "Round Robin",
    type: "Preemptive",
    ideal: "Time-sharing and interactive systems",
    description:
      "Fair and responsive; performance depends heavily on the time quantum.",
  },
  {
    name: "MLFQ",
    type: "Preemptive",
    ideal: "General-purpose OS (Linux, Windows style)",
    description:
      "Moves processes between queues based on behaviour, balancing responsiveness and throughput.",
  },
];

// ======================================================
// AUDIENCE
// ======================================================

const AUDIENCES = [
  {
    icon: GraduationCap,
    title: "For Students",
    description:
      "Built around university and GATE-style syllabi. Concepts are explained from zero with diagrams, worked numericals and revision tables so you can score well and truly understand.",
    points: [
      "Syllabus-aligned chapter flow",
      "Step-by-step numerical solutions",
      "Formula sheets for exam week",
    ],
  },
  {
    icon: Target,
    title: "For Placement Prep",
    description:
      "OS is asked in almost every campus and off-campus technical round. Practise the exact questions interviewers ask, with answers short enough to say out loud.",
    points: [
      "Interview rapid-fire question bank",
      "Popular solved problems",
      "Quick revision before the round",
    ],
  },
  {
    icon: Briefcase,
    title: "For Working Professionals",
    description:
      "Understand what actually happens under your code. Debug CPU, memory and I/O issues in production with the Linux toolkit and confident OS fundamentals.",
    points: [
      "Linux toolkit for real servers",
      "Containers, cgroups and virtualization",
      "Performance and debugging mindset",
    ],
  },
];

// ======================================================
// CODE EXAMPLES
// ======================================================

const CODE_EXAMPLES = [
  {
    id: "process",
    label: "fork / exec",
    filename: "process.c",
    title: "Create a child process with fork()",
    description:
      "The classic process-creation pattern: fork a child, replace its image with exec, and have the parent wait so no zombie is left behind.",
    code: `#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>

int main(void) {
    pid_t pid = fork();

    if (pid < 0) {
        perror("fork");
        return 1;
    }

    if (pid == 0) {
        printf("Child  PID=%d\\n", getpid());
        execlp("ls", "ls", "-l", NULL);
        perror("execlp");   /* only runs if exec fails */
        _exit(127);
    }

    int status;
    waitpid(pid, &status, 0);
    printf("Parent: child exited with %d\\n",
           WEXITSTATUS(status));
    return 0;
}`,
  },
  {
    id: "scheduling",
    label: "Scheduling",
    filename: "round_robin.py",
    title: "Round Robin scheduling with metrics",
    description:
      "Simulate Round Robin with arrival times and compute turnaround and waiting time for every process.",
    code: `from collections import deque

def round_robin(procs, quantum):
    # procs: list of (name, arrival, burst)
    procs = sorted(procs, key=lambda p: p[1])
    remaining = {n: b for n, _, b in procs}
    arrival = {n: a for n, a, _ in procs}
    burst = {n: b for n, _, b in procs}
    finish = {}
    queue, time, i = deque(), 0, 0

    def admit():
        nonlocal i
        while i < len(procs) and procs[i][1] <= time:
            queue.append(procs[i][0])
            i += 1

    while len(finish) < len(procs):
        admit()
        if not queue:                 # CPU idle
            time = procs[i][1]
            continue
        name = queue.popleft()
        run = min(quantum, remaining[name])
        time += run
        remaining[name] -= run
        admit()                       # arrivals during the slice
        if remaining[name] > 0:
            queue.append(name)
        else:
            finish[name] = time

    for n in finish:
        tat = finish[n] - arrival[n]
        wt = tat - burst[n]
        print(f"{n}: TAT={tat} WT={wt}")

round_robin([("P1", 0, 5), ("P2", 1, 3), ("P3", 2, 1)], 2)`,
  },
  {
    id: "sync",
    label: "Synchronization",
    filename: "producer_consumer.py",
    title: "Producer-consumer with semaphores",
    description:
      "The bounded-buffer problem solved with two counting semaphores and a mutex, exactly as taught in every OS course.",
    code: `import threading
from collections import deque

N = 5
buffer = deque()
empty = threading.Semaphore(N)   # free slots
full = threading.Semaphore(0)    # filled slots
mutex = threading.Lock()

def producer():
    for item in range(10):
        empty.acquire()
        with mutex:
            buffer.append(item)
            print("produced", item)
        full.release()

def consumer():
    for _ in range(10):
        full.acquire()
        with mutex:
            item = buffer.popleft()
            print("consumed", item)
        empty.release()

p = threading.Thread(target=producer)
c = threading.Thread(target=consumer)
p.start(); c.start()
p.join(); c.join()`,
  },
  {
    id: "deadlock",
    label: "Deadlock",
    filename: "bankers.py",
    title: "Banker's algorithm: safety check",
    description:
      "Decide whether the system is in a safe state and print a safe execution sequence.",
    code: `def is_safe(available, allocation, need):
    work = available[:]
    finish = [False] * len(allocation)
    order = []
    progressed = True

    while progressed:
        progressed = False
        for i in range(len(allocation)):
            if not finish[i] and all(
                n <= w for n, w in zip(need[i], work)
            ):
                work = [w + a for w, a in zip(work, allocation[i])]
                finish[i] = True
                order.append(f"P{i}")
                progressed = True

    return all(finish), order

available = [3, 3, 2]
allocation = [[0,1,0],[2,0,0],[3,0,2],[2,1,1],[0,0,2]]
maximum    = [[7,5,3],[3,2,2],[9,0,2],[2,2,2],[4,3,3]]
need = [[m - a for m, a in zip(mr, ar)]
        for mr, ar in zip(maximum, allocation)]

print(is_safe(available, allocation, need))
# (True, ['P1', 'P3', 'P4', 'P0', 'P2'])`,
  },
  {
    id: "memory",
    label: "Page replacement",
    filename: "lru.py",
    title: "LRU page replacement and page faults",
    description:
      "Count page faults for a reference string using Least Recently Used replacement.",
    code: `from collections import OrderedDict

def lru_faults(pages, frames):
    cache = OrderedDict()
    faults = 0

    for p in pages:
        if p in cache:
            cache.move_to_end(p)          # recently used
        else:
            faults += 1
            if len(cache) == frames:
                cache.popitem(last=False) # evict LRU page
            cache[p] = True
    return faults

refs = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2]
print("Page faults:", lru_faults(refs, 3))   # 9`,
  },
  {
    id: "linux",
    label: "Linux toolkit",
    filename: "debug.sh",
    title: "Debug a slow server from the shell",
    description:
      "A practical sequence of commands to find CPU, memory, I/O and process problems on a Linux machine.",
    code: `# Who is using the CPU / memory?
ps aux --sort=-%cpu | head -5
ps aux --sort=-%mem | head -5

# System-wide view: run queue, swap, I/O wait
vmstat 1 5
free -h
iostat -x 1 3

# What is this process doing?
strace -p <PID> -c          # syscall summary
lsof -p <PID>               # open files and sockets
cat /proc/<PID>/status      # memory, threads, state

# Find zombie processes
ps -eo pid,ppid,stat,cmd | awk '$3 ~ /Z/'

# Who is listening on a port?
ss -tulpn | grep :8080`,
  },
];

// ======================================================
// FAQ
// ======================================================

const FAQS = [
  {
    question: "Who is this Operating System ebook for?",
    answer:
      "It is written for three groups: college students preparing for semester exams and GATE, candidates preparing for campus and off-campus placements, and working professionals who want to understand what happens beneath their code and debug production systems.",
  },
  {
    question: "Do I need prior knowledge of operating systems?",
    answer:
      "No. The book starts with kernel and system-call fundamentals and builds step by step. Basic familiarity with programming is enough.",
  },
  {
    question: "Does it include numerical problems?",
    answer:
      "Yes. A dedicated chapter of 16 solved numerical problems covers CPU scheduling Gantt charts, Banker's algorithm, page replacement, TLB and effective access time, disk scheduling and more, with every step shown.",
  },
  {
    question: "Will it help in technical interviews?",
    answer:
      "Yes. The Interview Rapid-Fire chapter has concise model answers across all topics, and the Quick Revision chapter condenses the entire book into cheat sheets for the night before an interview.",
  },
  {
    question: "Is Linux covered?",
    answer:
      "Yes. The OS in Practice chapter covers the Linux toolkit: ps, top, strace, lsof, vmstat, iostat, /proc, signals, permissions and a debugging workflow for high CPU, memory and I/O problems.",
  },
  {
    question: "In what format will I receive the book?",
    answer:
      "It is a digital ebook. After a successful payment you receive access through the same flow used for all Target Trek ebooks. For any payment or access issue, contact our support email.",
  },
];

// ======================================================
// REUSABLE COMPONENTS
// ======================================================

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="os-section-heading">
      <div>
        <span className="os-eyebrow">
          <i />
          {eyebrow}
        </span>

        <h2>{title}</h2>

        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

function PriceDisplay({
  price,
  mrp,
  currency,
  discount,
  loading,
}) {
  if (loading) {
    return (
      <div className="os-price-skeleton">
        <span />
        <span />
      </div>
    );
  }

  if (price === null) {
    return (
      <span className="os-price-unavailable">
        Price unavailable
      </span>
    );
  }

  return (
    <div className="os-price-display">
      <strong>{formatMoney(price, currency)}</strong>

      {mrp !== null && mrp > price && (
        <del>{formatMoney(mrp, currency)}</del>
      )}

      {discount > 0 && (
        <span className="os-discount">{discount}% OFF</span>
      )}
    </div>
  );
}

function OSBookCover({ coverUrl }) {
  return (
    <div className="os-cover-stage">
      <div className="os-cover-orbit os-orbit-one" />
      <div className="os-cover-orbit os-orbit-two" />

      <div className="os-book-cover">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt="Operating System ebook cover"
            className="os-actual-cover"
            loading="eager"
          />
        ) : (
          <>
            <div className="os-book-top">
              <span>TARGET TREK</span>
              <span>CS CORE SERIES</span>
            </div>

            <div className="os-book-illustration">
              <svg
                viewBox="0 0 280 190"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect
                  x="20"
                  y="12"
                  width="240"
                  height="40"
                  rx="9"
                  fill="#2D241F"
                  stroke="#FB923C"
                  strokeWidth="2"
                />
                <text
                  x="140"
                  y="37"
                  fill="#FDBA74"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                >
                  USER APPLICATIONS
                </text>

                <rect
                  x="20"
                  y="62"
                  width="240"
                  height="62"
                  rx="9"
                  fill="#3A2A1F"
                  stroke="#FB923C"
                  strokeWidth="2"
                />
                <text
                  x="140"
                  y="82"
                  fill="#FFF"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                >
                  KERNEL
                </text>
                {["PROC", "MEM", "FS", "I/O"].map((label, i) => (
                  <g key={label}>
                    <rect
                      x={32 + i * 56}
                      y="92"
                      width="48"
                      height="22"
                      rx="5"
                      fill="#EA580C"
                    />
                    <text
                      x={56 + i * 56}
                      y="107"
                      fill="white"
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {label}
                    </text>
                  </g>
                ))}

                <rect
                  x="20"
                  y="134"
                  width="240"
                  height="42"
                  rx="9"
                  fill="#2D241F"
                  stroke="#FB923C"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                />
                <text
                  x="140"
                  y="160"
                  fill="#FDBA74"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                >
                  HARDWARE · CPU · RAM · DISK
                </text>
              </svg>
            </div>

            <div className="os-book-content">
              <span className="os-book-kicker">
                THE COMPLETE PRACTICAL GUIDE
              </span>

              <h2>
                MASTER
                <span>OPERATING SYSTEMS</span>
              </h2>

              <p>
                Processes · Scheduling · Deadlocks
                <br />
                Memory · File Systems · Linux
              </p>

              <div className="os-book-rule" />

              <small>EXAMS · PLACEMENTS · PROFESSIONALS</small>
            </div>
          </>
        )}
      </div>

      <div className="os-cover-float os-cover-float-one">
        <Cpu size={15} />
        SCHEDULING
      </div>

      <div className="os-cover-float os-cover-float-two">
        <HardDrive size={15} />
        VIRTUAL MEMORY
      </div>
    </div>
  );
}

function PipelineCard({
  number,
  title,
  description,
  steps,
  icon: Icon,
  note,
}) {
  return (
    <article className="os-pipeline-card">
      <div className="os-pipeline-header">
        <div className="os-icon">
          <Icon size={23} />
        </div>

        <div>
          <span className="os-pipeline-number">
            CONCEPT {number}
          </span>

          <h3>{title}</h3>
        </div>
      </div>

      <p className="os-pipeline-description">{description}</p>

      <div className="os-pipeline-steps">
        {steps.map((step, index) => {
          const StepIcon = step.icon;

          return (
            <React.Fragment key={step.label}>
              {index > 0 && (
                <ArrowRight
                  size={14}
                  className="os-pipeline-arrow"
                />
              )}

              <div className="os-pipeline-step">
                <StepIcon size={19} />
                <span>{step.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="os-pipeline-note">
        <CheckCircle2 size={16} />
        {note}
      </div>
    </article>
  );
}

// ======================================================
// MAIN PAGE
// ======================================================

export default function OperatingSystemBook() {
  const [theme, setTheme] = useState(readTheme);

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [activeCurriculum, setActiveCurriculum] =
    useState("foundations");

  const [chapterSearch, setChapterSearch] = useState("");
  const [activeCode, setActiveCode] = useState("process");
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [schedulerSearch, setSchedulerSearch] = useState("");

  const trackedProductRef = useRef(null);
  const copyTimerRef = useRef(null);

  const isDark = theme === "dark";

  // ====================================================
  // THEME SYNC - CONTROLLED BY EXISTING NAVBAR
  // ====================================================

  useEffect(() => {
    const syncTheme = (event) => {
      const value = event?.detail?.theme;

      if (value === "dark" || value === "light") {
        setTheme(value);
      } else {
        setTheme(readTheme());
      }
    };

    const onStorage = (event) => {
      if (!event.key || event.key === THEME_KEY) {
        setTheme(readTheme());
      }
    };

    window.addEventListener(THEME_EVENT, syncTheme);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", syncTheme);

    return () => {
      window.removeEventListener(THEME_EVENT, syncTheme);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", syncTheme);
    };
  }, []);

  // ====================================================
  // REFERRAL TRACKING
  // ====================================================

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);

      const referralCode = (
        params.get("referralCode") ||
        params.get("ref") ||
        ""
      ).trim();

      if (referralCode) {
        localStorage.setItem("referralCode", referralCode);
      }
    } catch (error) {
      console.error("Referral code error:", error);
    }
  }, []);

  // ====================================================
  // PRODUCT API
  // GET /book/product?redirectUrl=/books/operating-systems
  // ====================================================

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      setLoadingProduct(true);
      setProductError("");
      setProduct(null);
      setIsCheckoutOpen(false);

      try {
        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(
            PAGE_PATH
          )}`,
          {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }
        );

        const result = await response.json().catch(() => null);

        if (
          !response.ok ||
          result?.success !== true ||
          !result?.data
        ) {
          throw new Error(
            result?.error?.message ||
              result?.message ||
              "Unable to load product details."
          );
        }

        const data = result.data;
        const price = Number(data.price);

        if (
          !data._id ||
          typeof data.title !== "string" ||
          !data.title.trim() ||
          data.price === null ||
          data.price === undefined ||
          String(data.price).trim() === "" ||
          !Number.isFinite(price) ||
          price < 0
        ) {
          throw new Error(
            "The product data returned by the server is incomplete."
          );
        }

        if (!controller.signal.aborted) {
          setProduct(data);
        }
      } catch (error) {
        if (
          error?.name === "AbortError" ||
          controller.signal.aborted
        ) {
          return;
        }

        console.error("Operating System product API error:", error);

        setProductError(
          error?.message ||
            "Unable to load current product details."
        );

        setProduct(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoadingProduct(false);
        }
      }
    };

    fetchProduct();

    return () => controller.abort();
  }, [retryCount]);

  // ====================================================
  // PRICE & PAYMENT STATE
  // ====================================================

  const currency = product?.currency || "INR";

  const currentPrice =
    product?.price !== null &&
    product?.price !== undefined &&
    product?.price !== ""
      ? Number(product.price)
      : null;

  const rawMrp =
    product?.mrp !== null &&
    product?.mrp !== undefined &&
    product?.mrp !== ""
      ? Number(product.mrp)
      : null;

  const hasValidPrice =
    currentPrice !== null &&
    Number.isFinite(currentPrice) &&
    currentPrice >= 0;

  const mrp =
    rawMrp !== null &&
    Number.isFinite(rawMrp) &&
    hasValidPrice &&
    rawMrp > currentPrice
      ? rawMrp
      : null;

  const discount =
    mrp !== null
      ? Math.round(((mrp - currentPrice) / mrp) * 100)
      : 0;

  const canBuy =
    Boolean(product?._id) &&
    hasValidPrice &&
    !loadingProduct &&
    !productError;

  const coverImage =
    product?.coverPageUrl ||
    product?.coverpageurl ||
    product?.cover_page_url ||
    "";

  // ====================================================
  // META PIXEL - VIEW CONTENT
  // ====================================================

  useEffect(() => {
    if (!product?._id || !hasValidPrice) return;

    const key = [product._id, currentPrice, currency].join(":");

    if (trackedProductRef.current === key) return;

    const sent = trackViewContent({
      id: String(product._id),
      title: product.title,
      price: currentPrice,
      currency,
    });

    if (sent !== false) {
      trackedProductRef.current = key;
    }
  }, [
    product?._id,
    product?.title,
    currentPrice,
    currency,
    hasValidPrice,
  ]);

  // ====================================================
  // CHECKOUT
  // ====================================================

  const handleBuyNow = useCallback(() => {
    if (!canBuy) return;
    setIsCheckoutOpen(true);
  }, [canBuy]);

  const retryProduct = () => {
    setRetryCount((count) => count + 1);
  };

  // ====================================================
  // CURRICULUM SEARCH
  // ====================================================

  const filteredCurriculum = useMemo(() => {
    const query = chapterSearch.trim().toLowerCase();

    if (!query) return CURRICULUM;

    return CURRICULUM.map((group) => ({
      ...group,
      chapters: group.chapters.filter((chapter) =>
        [chapter.title, chapter.details, ...chapter.sections, group.title, group.subtitle]
          .join(" ")
          .toLowerCase()
          .includes(query)
      ),
    })).filter((group) => group.chapters.length > 0);
  }, [chapterSearch]);

  // ====================================================
  // SCHEDULER SEARCH
  // ====================================================

  const filteredSchedulers = useMemo(() => {
    const query = schedulerSearch.trim().toLowerCase();

    if (!query) return SCHEDULERS;

    return SCHEDULERS.filter((item) =>
      [item.name, item.type, item.ideal, item.description]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [schedulerSearch]);

  // ====================================================
  // CODE EXAMPLES
  // ====================================================

  const selectedCode =
    CODE_EXAMPLES.find((item) => item.id === activeCode) ||
    CODE_EXAMPLES[0];

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(selectedCode.code);

      setCopied(true);

      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }

      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Unable to copy code:", error);
      setCopied(false);
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  // ====================================================
  // SEO STRUCTURED DATA
  // ====================================================

  const structuredData = useMemo(() => {
    const productName =
      product?.title?.trim() ||
      "Operating System Interview & Placement Guide";

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: SITE_NAME,
          url: SITE_URL,
        },
        {
          "@type": "WebPage",
          "@id": `${PAGE_URL}#webpage`,
          name: SEO_TITLE,
          description: SEO_DESCRIPTION,
          url: PAGE_URL,
        },
        {
          "@type": "Book",
          "@id": `${PAGE_URL}#book`,
          name: productName,
          description: SEO_DESCRIPTION,
          bookFormat: "https://schema.org/EBook",
          inLanguage: product?.language || "English",
          url: PAGE_URL,
          publisher: { "@id": `${SITE_URL}/#organization` },
          ...(product?.edition
            ? { bookEdition: product.edition }
            : {}),
          ...(coverImage ? { image: coverImage } : {}),
        },
        {
          "@type": "Product",
          "@id": `${PAGE_URL}#product`,
          name: productName,
          description: SEO_DESCRIPTION,
          url: PAGE_URL,
          brand: { "@type": "Brand", name: SITE_NAME },
          ...(coverImage ? { image: coverImage } : {}),
          ...(canBuy
            ? {
                offers: {
                  "@type": "Offer",
                  price: currentPrice,
                  priceCurrency: currency,
                  availability: "https://schema.org/InStock",
                  url: PAGE_URL,
                },
              }
            : {}),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: SITE_NAME,
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
              name: productName,
              item: PAGE_URL,
            },
          ],
        },
        {
          "@type": "FAQPage",
          mainEntity: FAQS.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        },
      ],
    };
  }, [
    product?.title,
    product?.language,
    product?.edition,
    currentPrice,
    currency,
    coverImage,
    canBuy,
  ]);

  return (
    <>
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <meta
          name="keywords"
          content="operating system ebook, OS interview questions, operating system notes, CPU scheduling, deadlock, paging, virtual memory, process synchronization, GATE operating system, placement preparation, Linux"
        />
        <meta
          name="robots"
          content="index,follow,max-image-preview:large"
        />
        <link rel="canonical" href={PAGE_URL} />

        <meta property="og:type" content="product" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        {coverImage && (
          <meta property="og:image" content={coverImage} />
        )}

        <meta
          name="twitter:card"
          content={coverImage ? "summary_large_image" : "summary"}
        />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

        .osPage {
          --os-bg: #FAF9F6;
          --os-surface: #FFFFFF;
          --os-soft: #F5F1ED;
          --os-text: #1C1917;
          --os-muted: #70665E;
          --os-subtle: #A8A29E;
          --os-border: #E8E1D9;
          --os-orange: #EA580C;
          --os-orange-bright: #F97316;
          --os-orange-soft: #FFF0E2;
          --os-orange-border: #FED7AA;
          --os-shadow: 0 15px 45px rgba(40,28,18,.06);
          --os-code-bg: #1C1917;

          width: 100%;
          min-height: 100vh;
          overflow-x: clip;
          background: var(--os-bg);
          color: var(--os-text);
          font-family: "DM Sans", sans-serif;
          -webkit-font-smoothing: antialiased;
          transition: background .25s, color .25s;
        }

        .osPage[data-theme="dark"] {
          --os-bg: #151311;
          --os-surface: #211E1B;
          --os-soft: #2B2622;
          --os-text: #FAF8F5;
          --os-muted: #B8AEA6;
          --os-subtle: #92857C;
          --os-border: #3B342F;
          --os-orange: #FB923C;
          --os-orange-bright: #F97316;
          --os-orange-soft: #38271B;
          --os-orange-border: #663D25;
          --os-shadow: 0 15px 45px rgba(0,0,0,.15);
          --os-code-bg: #100F0E;
          color-scheme: dark;
        }

        .osPage *,
        .osPage *::before,
        .osPage *::after { box-sizing: border-box; }

        .osPage h1, .osPage h2, .osPage h3, .osPage h4 {
          font-family: "Manrope", sans-serif;
        }

        .osPage a { color: inherit; text-decoration: none; }
        .osPage button, .osPage input { font-family: inherit; }

        .os-shell {
          width: min(1220px, calc(100% - 40px));
          margin-inline: auto;
        }

        .os-section { padding: 69px 0; }

        .os-section-alt {
          background: var(--os-surface);
          border-block: 1px solid var(--os-border);
        }

        .os-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 30px;
        }

        .os-section-heading > div { max-width: 760px; }

        .os-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .15em;
          color: var(--os-orange);
          text-transform: uppercase;
        }

        .os-eyebrow i {
          display: inline-block;
          width: 23px;
          height: 2px;
          border-radius: 4px;
          background: var(--os-orange-bright);
        }

        .os-section-heading h2 {
          margin: 12px 0 0;
          color: var(--os-text);
          font-size: clamp(27px,3.2vw,41px);
          line-height: 1.16;
          font-weight: 850;
          letter-spacing: -.045em;
        }

        .os-section-heading p {
          margin: 13px 0 0;
          color: var(--os-muted);
          font-size: 14px;
          line-height: 1.8;
        }

        .os-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 44px;
          padding: 10px 18px;
          border: 1px solid transparent;
          border-radius: 11px;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
          transition: transform .2s, background .2s, border-color .2s;
        }

        .os-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .os-btn:disabled { cursor: not-allowed; opacity: .5; }

        .os-btn-orange { background: #F97316; color: #FFF !important; }
        .os-btn-orange:hover:not(:disabled) { background: #EA580C; }

        .os-btn-outline {
          border-color: var(--os-border);
          background: var(--os-surface);
          color: var(--os-text) !important;
        }
        .os-btn-outline:hover { border-color: var(--os-orange); }

        .os-card {
          background: var(--os-surface);
          border: 1px solid var(--os-border);
          border-radius: 17px;
          box-shadow: var(--os-shadow);
        }
        .os-card h3 { color: var(--os-text); }
        .os-card p { color: var(--os-muted); }

        .os-icon {
          display: grid;
          place-items: center;
          width: 45px;
          height: 45px;
          border-radius: 12px;
          background: var(--os-orange-soft);
          color: var(--os-orange);
          flex-shrink: 0;
        }

        .os-grid-two {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 16px;
        }
        .os-grid-three {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 15px;
        }
        .os-grid-four {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 14px;
        }

        /* HERO */

        .os-hero {
          position: relative;
          padding: 94px 0 45px;
          overflow: hidden;
          background: var(--os-surface);
          border-bottom: 1px solid var(--os-border);
        }

        .os-hero::before {
          content: "";
          position: absolute;
          width: 470px;
          height: 470px;
          right: -145px;
          top: -235px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(249,115,22,.12), transparent 68%);
          pointer-events: none;
        }

        .os-hero-grid {
          display: grid;
          grid-template-columns: minmax(0,1.1fr) minmax(280px,.9fr);
          align-items: center;
          gap: 43px;
        }

        .os-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 11px;
          border: 1px solid var(--os-orange-border);
          border-radius: 7px;
          background: var(--os-orange-soft);
          color: var(--os-orange);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .10em;
        }

        .os-hero h1 {
          max-width: 660px;
          margin: 18px 0;
          font-size: clamp(38px,5vw,63px);
          line-height: 1.065;
          font-weight: 900;
          letter-spacing: -.06em;
        }
        .os-hero h1 span { color: var(--os-orange-bright); }

        .os-hero-copy {
          max-width: 590px;
          color: var(--os-muted);
          font-size: 14px;
          line-height: 1.82;
        }

        .os-hero-bullets {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 11px;
          margin-top: 21px;
        }

        .os-hero-bullets > div {
          display: flex;
          align-items: start;
          gap: 8px;
          font-size: 11px;
          line-height: 1.55;
          font-weight: 750;
          color: var(--os-muted);
        }
        .os-hero-bullets svg { flex-shrink: 0; color: var(--os-orange); }

        .os-hero-purchase {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 17px;
          margin-top: 25px;
        }

        .os-hero-price small {
          display: block;
          margin-bottom: 4px;
          color: var(--os-subtle);
          font-size: 10px;
          font-weight: 850;
          letter-spacing: .05em;
        }

        .os-price-display {
          display: flex;
          align-items: baseline;
          gap: 9px;
          flex-wrap: wrap;
        }
        .os-price-display strong {
          font-family: "Manrope",sans-serif;
          color: var(--os-text);
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -.05em;
        }
        .os-price-display del { color: var(--os-subtle); font-size: 12px; }

        .os-discount {
          align-self: center;
          padding: 5px 7px;
          border-radius: 6px;
          background: var(--os-orange-soft);
          color: var(--os-orange);
          font-size: 9px;
          font-weight: 900;
        }

        .os-price-skeleton { display: flex; gap: 9px; }
        .os-price-skeleton span {
          width: 95px;
          height: 25px;
          border-radius: 7px;
          background: var(--os-soft);
          animation: osPulse 1.4s infinite;
        }
        .os-price-skeleton span:last-child { width: 60px; height: 17px; }

        .os-price-unavailable {
          color: var(--os-muted);
          font-size: 12px;
          font-weight: 800;
        }

        .os-hero-secondary {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 18px;
          margin-top: 17px;
        }
        .os-hero-secondary a {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: var(--os-orange) !important;
          font-size: 11px;
          font-weight: 850;
        }
        .os-hero-secondary span { color: var(--os-muted); font-size: 10px; }

        /* COVER */

        .os-cover-stage {
          position: relative;
          min-height: 410px;
          display: grid;
          place-items: center;
          perspective: 900px;
        }

        .os-cover-orbit {
          position: absolute;
          border: 1px solid var(--os-orange-border);
          border-radius: 50%;
          opacity: .5;
        }
        .os-orbit-one { width: 340px; height: 340px; }
        .os-orbit-two { width: 260px; height: 260px; }

        .os-book-cover {
          position: relative;
          z-index: 2;
          width: 260px;
          aspect-ratio: 2 / 3;
          display: flex;
          flex-direction: column;
          padding: 21px;
          overflow: hidden;
          border-radius: 5px 13px 13px 5px;
          color: #FFF;
          background: linear-gradient(145deg, #181410, #35251A 65%, #A84314);
          box-shadow: 22px 26px 44px rgba(0,0,0,.28), inset 6px 0 rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.16);
          transform: rotateY(-9deg) rotateZ(-2deg);
          transition: transform .35s;
        }
        .os-cover-stage:hover .os-book-cover {
          transform: rotateY(-2deg) rotateZ(0);
        }

        .os-actual-cover {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .os-book-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          color: #FDBA74;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .1em;
        }

        .os-book-illustration {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
        }
        .os-book-illustration svg { width: 100%; }

        .os-book-kicker {
          color: #EBC2A6;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .os-book-content h2 {
          margin: 10px 0;
          color: #FFF;
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -.045em;
          line-height: 1.08;
        }
        .os-book-content h2 span {
          display: block;
          color: #FB923C;
          font-size: 24px;
          margin-top: 4px;
        }
        .os-book-content p {
          color: #E8C4AB;
          font-size: 9px;
          line-height: 1.6;
          margin: 0;
        }
        .os-book-rule {
          width: 46px;
          height: 2px;
          margin: 13px 0 9px;
          background: #F97316;
        }
        .os-book-content small {
          color: #E8C4AB;
          font-size: 7px;
          font-weight: 850;
          letter-spacing: .1em;
        }

        .os-cover-float {
          position: absolute;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 12px;
          border: 1px solid var(--os-orange-border);
          border-radius: 10px;
          background: var(--os-surface);
          box-shadow: var(--os-shadow);
          color: var(--os-text);
          font-size: 10px;
          font-weight: 850;
        }
        .os-cover-float svg { color: var(--os-orange); }
        .os-cover-float-one { right: 1%; top: 17%; }
        .os-cover-float-two { left: 1%; bottom: 15%; }

        /* TRUST */

        .os-trust-strip {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 15px;
          padding: 20px 0;
        }
        .os-trust-item {
          display: flex;
          align-items: center;
          gap: 9px;
          color: var(--os-muted);
          font-size: 11px;
          font-weight: 750;
        }
        .os-trust-item svg { color: var(--os-orange); flex-shrink: 0; }

        /* PIPELINES */

        .os-pipeline-card {
          padding: 24px;
          border: 1px solid var(--os-border);
          border-radius: 17px;
          background: var(--os-surface);
          box-shadow: var(--os-shadow);
          min-width: 0;
        }
        .os-pipeline-header { display: flex; align-items: center; gap: 12px; }
        .os-pipeline-number {
          color: var(--os-orange);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .12em;
        }
        .os-pipeline-header h3 {
          margin: 5px 0 0;
          color: var(--os-text);
          font-size: 18px;
          font-weight: 850;
          line-height: 1.25;
          letter-spacing: -.025em;
        }
        .os-pipeline-description {
          margin: 18px 0 0;
          color: var(--os-muted);
          font-size: 12px;
          line-height: 1.8;
        }
        .os-pipeline-steps {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 22px;
          min-width: 0;
        }
        .os-pipeline-step {
          display: flex;
          flex: 1;
          align-items: center;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          min-width: 0;
          min-height: 76px;
          padding: 10px 4px;
          border: 1px solid var(--os-border);
          border-radius: 9px;
          background: var(--os-soft);
          text-align: center;
        }
        .os-pipeline-step svg, .os-pipeline-arrow {
          color: var(--os-orange);
          flex-shrink: 0;
        }
        .os-pipeline-step span {
          font-size: 9px;
          font-weight: 850;
          color: var(--os-text);
          overflow-wrap: anywhere;
        }
        .os-pipeline-note {
          display: flex;
          gap: 9px;
          align-items: flex-start;
          margin-top: 19px;
          padding: 13px;
          border-radius: 10px;
          background: var(--os-orange-soft);
          border: 1px solid var(--os-orange-border);
          color: var(--os-muted);
          font-size: 11px;
          line-height: 1.65;
        }
        .os-pipeline-note svg { flex-shrink: 0; color: var(--os-orange); }

        /* FEATURES */

        .os-feature-card { padding: 22px; transition: transform .2s, border-color .2s; }
        .os-feature-card:hover { transform: translateY(-4px); border-color: var(--os-orange); }
        .os-feature-card h3 {
          margin: 18px 0 9px;
          font-size: 16px;
          font-weight: 850;
          letter-spacing: -.025em;
        }
        .os-feature-card p { margin: 0; font-size: 12px; line-height: 1.75; }

        /* AUDIENCE */

        .os-audience-points { display: grid; gap: 10px; margin-top: 20px; }
        .os-audience-points span {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          color: var(--os-muted);
          font-size: 11px;
          line-height: 1.6;
        }
        .os-audience-points svg { color: var(--os-orange); flex-shrink: 0; }

        /* CURRICULUM */

        .os-curriculum-layout {
          display: grid;
          grid-template-columns: 260px minmax(0,1fr);
          gap: 22px;
        }
        .os-curriculum-sidebar {
          position: sticky;
          top: 90px;
          height: max-content;
          display: grid;
          gap: 8px;
        }
        .os-curriculum-tab {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 14px;
          border: 1px solid var(--os-border);
          border-radius: 10px;
          background: var(--os-surface);
          color: var(--os-muted);
          text-align: left;
          cursor: pointer;
          transition: background .2s, border-color .2s;
        }
        .os-curriculum-tab.active {
          background: var(--os-orange-soft);
          border-color: var(--os-orange-border);
        }
        .os-curriculum-tab > span:first-child {
          color: var(--os-orange);
          font-size: 11px;
          font-weight: 900;
        }
        .os-curriculum-tab strong {
          display: block;
          color: var(--os-text);
          font-size: 12px;
          font-weight: 850;
        }
        .os-curriculum-tab small {
          display: block;
          color: var(--os-muted);
          font-size: 10px;
          line-height: 1.5;
          margin-top: 5px;
        }

        .os-search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 45px;
          padding: 0 14px;
          margin-bottom: 15px;
          background: var(--os-surface);
          border: 1px solid var(--os-border);
          border-radius: 10px;
          color: var(--os-muted);
        }
        .os-search-box input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: none;
          flex: 1;
          color: var(--os-text);
          background: transparent;
          font-size: 12px;
        }
        .os-search-box input::placeholder { color: var(--os-subtle); }
        .os-search-box.narrow { width: min(100%,390px); height: 43px; margin-bottom: 18px; }
        .os-clear-btn {
          border: 0;
          background: transparent;
          color: var(--os-muted);
          cursor: pointer;
        }

        .os-chapter-list {
          border: 1px solid var(--os-border);
          border-radius: 14px;
          background: var(--os-surface);
          overflow: hidden;
        }
        .os-chapter {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 18px;
          border-bottom: 1px solid var(--os-border);
        }
        .os-chapter:last-child { border-bottom: 0; }
        .os-chapter-number {
          display: grid;
          place-items: center;
          width: 37px;
          height: 37px;
          border-radius: 10px;
          background: var(--os-orange-soft);
          color: var(--os-orange);
          font-size: 11px;
          font-weight: 900;
          flex-shrink: 0;
        }
        .os-chapter h3 { margin: 0; color: var(--os-text); font-size: 14px; font-weight: 850; }
        .os-chapter p { margin: 7px 0 0; color: var(--os-muted); font-size: 12px; line-height: 1.7; }

        .os-section-list {
          list-style: none;
          margin: 12px 0 0;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .os-section-list li {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 9px;
          border: 1px solid var(--os-border);
          border-radius: 7px;
          background: var(--os-soft);
          color: var(--os-muted);
          font-size: 10.5px;
          font-weight: 700;
          line-height: 1.4;
        }
        .os-section-list li b { color: var(--os-orange); font-weight: 900; }

        /* TABLE */

        .os-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--os-border);
          border-radius: 15px;
          background: var(--os-surface);
        }
        .os-table {
          width: 100%;
          min-width: 720px;
          border-collapse: collapse;
          text-align: left;
        }
        .os-table th {
          padding: 15px 17px;
          color: var(--os-muted);
          background: var(--os-soft);
          font-size: 10px;
          letter-spacing: .08em;
          font-weight: 900;
          text-transform: uppercase;
        }
        .os-table td {
          padding: 17px;
          color: var(--os-muted);
          font-size: 12px;
          line-height: 1.6;
          border-top: 1px solid var(--os-border);
        }
        .os-table td:first-child { color: var(--os-text); font-weight: 850; }
        .os-table tr:hover td { background: var(--os-soft); }
        .os-table-type {
          display: inline-block;
          padding: 6px 9px;
          color: var(--os-orange);
          background: var(--os-orange-soft);
          border-radius: 7px;
          font-size: 10px;
          font-weight: 750;
        }

        /* CODE */

        .os-code-tabs { display: flex; flex-wrap: wrap; gap: 7px; margin-bottom: 15px; }
        .os-code-tab {
          padding: 9px 14px;
          border: 1px solid var(--os-border);
          border-radius: 8px;
          background: var(--os-surface);
          color: var(--os-muted);
          font-size: 11px;
          font-weight: 850;
          cursor: pointer;
        }
        .os-code-tab.active {
          background: var(--os-orange-bright);
          border-color: var(--os-orange-bright);
          color: white;
        }
        .os-code-layout {
          display: grid;
          grid-template-columns: minmax(0,.72fr) minmax(0,1.28fr);
          gap: 18px;
        }
        .os-code-intro { padding: 25px; display: flex; flex-direction: column; }
        .os-code-intro h3 {
          margin: 18px 0 10px;
          color: var(--os-text);
          font-size: 20px;
          font-weight: 850;
          letter-spacing: -.035em;
        }
        .os-code-intro p { color: var(--os-muted); font-size: 12px; line-height: 1.8; }

        .os-code-window {
          background: var(--os-code-bg);
          border: 1px solid #41362E;
          border-radius: 14px;
          overflow: hidden;
          min-width: 0;
        }
        .os-code-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 15px;
          background: #28231F;
          border-bottom: 1px solid #40372F;
          color: #DCCFC5;
          font-size: 11px;
        }
        .os-code-dots { display: flex; gap: 5px; }
        .os-code-dots i { width: 8px; height: 8px; border-radius: 50%; background: #F97316; }
        .os-code-dots i:nth-child(2) { background: #FDBA74; }
        .os-code-dots i:nth-child(3) { background: #82756A; }
        .os-copy-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border: 1px solid #51453C;
          border-radius: 6px;
          background: transparent;
          color: #E8DED6;
          font-size: 10px;
          cursor: pointer;
        }
        .os-code-window pre {
          margin: 0;
          padding: 20px;
          max-height: 430px;
          overflow: auto;
          color: #F3E8DA;
          font-size: 12px;
          line-height: 1.85;
          tab-size: 4;
        }

        /* FAQ */

        .os-faq-grid {
          display: grid;
          grid-template-columns: minmax(240px,.67fr) minmax(0,1.33fr);
          align-items: start;
          gap: 38px;
        }
        .os-faq-list { display: grid; gap: 10px; }
        .os-faq-item {
          border: 1px solid var(--os-border);
          border-radius: 12px;
          background: var(--os-surface);
          overflow: hidden;
        }
        .os-faq-item button {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          width: 100%;
          padding: 17px;
          border: 0;
          background: transparent;
          color: var(--os-text);
          text-align: left;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
        }
        .os-faq-answer {
          padding: 0 17px 17px;
          color: var(--os-muted);
          font-size: 12px;
          line-height: 1.8;
        }

        /* FINAL CTA */

        .os-final-cta {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          padding: 34px;
          border-radius: 20px;
          background: #1C1917;
          color: white;
          overflow: hidden;
        }
        .os-final-cta::before {
          content: "";
          position: absolute;
          width: 250px;
          height: 250px;
          top: -140px;
          right: -115px;
          border: 1px solid rgba(249,115,22,.3);
          border-radius: 50%;
          box-shadow: 0 0 0 36px rgba(249,115,22,.04);
        }
        .os-final-cta h2 {
          position: relative;
          margin: 0;
          font-size: clamp(24px,3vw,34px);
          line-height: 1.18;
          letter-spacing: -.045em;
          font-weight: 850;
        }
        .os-final-cta p {
          position: relative;
          max-width: 650px;
          margin: 12px 0 0;
          font-size: 12px;
          line-height: 1.8;
          color: #C7B8AC;
        }
        .os-final-actions {
          position: relative;
          display: flex;
          align-items: center;
          gap: 18px;
          flex-shrink: 0;
        }
        .os-final-price strong {
          font-family: "Manrope",sans-serif;
          font-size: 26px;
          font-weight: 900;
          color: #FFF;
        }
        .os-final-price del { margin-left: 8px; color: #A99C91; font-size: 12px; }

        .os-error {
          margin-top: 15px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #FFF1F2;
          border: 1px solid #FECACA;
          color: #B91C1C;
          font-size: 11px;
          line-height: 1.6;
        }
        .os-error button {
          background: transparent;
          border: 0;
          margin-left: 7px;
          color: inherit;
          text-decoration: underline;
          cursor: pointer;
          font-weight: 850;
        }

        .os-mobile-buy { display: none; }

        @keyframes osPulse { 50% { opacity: .45; } }

        @media(max-width: 1060px) {
          .os-grid-four { grid-template-columns: repeat(2,1fr); }
          .os-grid-three { grid-template-columns: repeat(2,1fr); }
          .os-pipeline-steps { flex-wrap: wrap; }
        }

        @media(max-width: 850px) {
          .os-hero-grid { grid-template-columns: 1fr; gap: 16px; }
          .os-cover-stage { min-height: 360px; }
          .os-book-cover { width: 230px; }
          .os-curriculum-layout { grid-template-columns: 1fr; }
          .os-curriculum-sidebar { position: static; grid-template-columns: repeat(2,1fr); }
          .os-code-layout { grid-template-columns: 1fr; }
          .os-faq-grid { grid-template-columns: 1fr; }
          .os-trust-strip { grid-template-columns: repeat(2,1fr); }
        }

        @media(max-width: 600px) {
          .os-shell { width: calc(100% - 28px); }
          .os-section { padding: 46px 0; }
          .os-section-heading { flex-direction: column; align-items: flex-start; }
          .os-hero { padding: 84px 0 24px; }
          .os-hero h1 { font-size: 38px; }
          .os-hero-purchase { flex-direction: column; align-items: flex-start; }
          .os-hero-purchase .os-btn { width: 100%; }
          .os-cover-stage { min-height: 330px; }
          .os-book-cover { width: 205px; padding: 17px; }
          .os-cover-float { display: none; }
          .os-grid-two, .os-grid-three, .os-grid-four { grid-template-columns: 1fr; }
          .os-pipeline-card { padding: 18px; }
          .os-pipeline-step { min-width: 65px; }
          .os-curriculum-sidebar { grid-template-columns: 1fr; }
          .os-chapter { padding: 15px; }
          .os-final-cta { padding: 25px; flex-direction: column; align-items: flex-start; }
          .os-final-actions { width: 100%; flex-direction: column; align-items: stretch; }

          .os-mobile-buy {
            position: fixed;
            z-index: 45;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 14px calc(10px + env(safe-area-inset-bottom));
            border-top: 1px solid var(--os-border);
            background: var(--os-surface);
            box-shadow: 0 -10px 30px rgba(0,0,0,.12);
          }
          .os-mobile-price small { display: block; font-size: 9px; color: var(--os-muted); }
          .os-mobile-price strong {
            font-family: "Manrope",sans-serif;
            font-weight: 900;
            font-size: 18px;
            color: var(--os-text);
          }
          .osPage { padding-bottom: 73px; }
        }

        @media(prefers-reduced-motion: reduce) {
          .osPage *, .osPage *::before, .osPage *::after {
            transition-duration: .01ms !important;
            animation-duration: .01ms !important;
          }
        }
      `}</style>

      <main className="osPage" data-theme={isDark ? "dark" : "light"}>
        {/* HERO */}
        <section className="os-hero">
          <div className="os-shell os-hero-grid">
            <div>
              <span className="os-hero-badge">
                <Sparkles size={13} />
                TARGET TREK · CS CORE SERIES
              </span>

              <h1>
                Master
                <br />
                Operating <span>Systems.</span>
              </h1>

              <p className="os-hero-copy">
                {product?.shortDescription ||
                  product?.subtitle ||
                  "One complete ebook for students, placement candidates and working professionals. Learn processes, scheduling, synchronization, deadlocks, memory, file systems and Linux, then practise with solved problems and interview rapid-fire."}
              </p>

              <div className="os-hero-bullets">
                {[
                  "For students and exam prep",
                  "For campus and job interviews",
                  "For working professionals",
                  "Solved problems and quick revision",
                ].map((item) => (
                  <div key={item}>
                    <CheckCircle2 size={15} />
                    {item}
                  </div>
                ))}
              </div>

              <div className="os-hero-purchase">
                <div className="os-hero-price">
                  <small>CURRENT EBOOK PRICE</small>

                  <PriceDisplay
                    price={hasValidPrice ? currentPrice : null}
                    mrp={mrp}
                    currency={currency}
                    discount={discount}
                    loading={loadingProduct}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!canBuy}
                  className="os-btn os-btn-orange"
                >
                  Get the ebook
                  <ArrowUpRight size={16} />
                </button>
              </div>

              <div className="os-hero-secondary">
                <a href="#curriculum">
                  Explore {TOTAL_CHAPTERS} chapters
                  <ArrowDown size={14} />
                </a>

                <span>Digital ebook · Concepts + numericals + Linux</span>
              </div>

              {productError && (
                <div className="os-error" role="alert">
                  {productError}

                  <button type="button" onClick={retryProduct}>
                    Retry
                  </button>
                </div>
              )}
            </div>

            <OSBookCover coverUrl={coverImage} />
          </div>
        </section>

        {/* TRUST STRIP */}
        <div className="os-shell os-trust-strip">
          {[
            [BookOpen, `${TOTAL_CHAPTERS} focused chapters`],
            [Target, "60 interview Q&A"],
            [Workflow, "16 solved numericals"],
            [Terminal, "Linux toolkit included"],
          ].map(([Icon, label]) => (
            <div key={label} className="os-trust-item">
              <Icon size={18} />
              {label}
            </div>
          ))}
        </div>

        {/* AUDIENCE */}
        <section className="os-section os-section-alt">
          <div className="os-shell">
            <SectionHeading
              eyebrow="WHO IS THIS BOOK FOR"
              title="Written for exams, interviews and real systems."
              description="Whether you are sitting a semester exam, preparing for a placement drive, or debugging a production server, this book meets you where you are."
            />

            <div className="os-grid-three">
              {AUDIENCES.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="os-card os-feature-card"
                  >
                    <div className="os-icon">
                      <Icon size={22} />
                    </div>

                    <h3>{item.title}</h3>
                    <p>{item.description}</p>

                    <div className="os-audience-points">
                      {item.points.map((point) => (
                        <span key={point}>
                          <Check size={15} />
                          {point}
                        </span>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* CORE CONCEPT VISUALS */}
        <section className="os-section">
          <div className="os-shell">
            <SectionHeading
              eyebrow="CORE MENTAL MODELS"
              title="Understand the two ideas behind everything."
              description="Most OS questions reduce to how work is scheduled on the CPU and how memory is mapped and protected. The book builds both models from the ground up."
            />

            <div className="os-grid-two">
              <PipelineCard
                number="01"
                title="Process lifecycle"
                icon={Cpu}
                description="A process moves between states as the scheduler, I/O and the kernel interact. Knowing each transition makes scheduling, synchronization and deadlocks easy."
                steps={[
                  { icon: FileText, label: "New" },
                  { icon: Clock, label: "Ready" },
                  { icon: Zap, label: "Running" },
                  { icon: RefreshCw, label: "Waiting" },
                  { icon: CheckCircle2, label: "Done" },
                ]}
                note="Every context switch saves the running process in its PCB and restores another, which is the hidden cost behind scheduling decisions."
              />

              <PipelineCard
                number="02"
                title="Virtual address translation"
                icon={HardDrive}
                description="Each process sees a private address space. The MMU, TLB and page tables translate virtual addresses, and the OS fetches missing pages from disk."
                steps={[
                  { icon: Search, label: "Virtual addr" },
                  { icon: Gauge, label: "TLB" },
                  { icon: Layers3, label: "Page table" },
                  { icon: Server, label: "Physical RAM" },
                  { icon: HardDrive, label: "Disk" },
                ]}
                note="A TLB hit is fast; a miss walks the page table; a page fault loads the page from disk. Effective access time numericals follow directly from this."
              />
            </div>
          </div>
        </section>

        {/* KEY CONCEPTS */}
        <section className="os-section os-section-alt">
          <div className="os-shell">
            <SectionHeading
              eyebrow="WHAT YOU WILL MASTER"
              title="Every topic interviewers and examiners return to."
              description="From the kernel and system calls to disks, security and virtualization, each area is explained with intuition, diagrams and worked examples."
            />

            <div className="os-grid-four">
              {[
                {
                  icon: Cpu,
                  title: "Processes & Threads",
                  description:
                    "PCB, states, fork/exec, IPC, threading models and race conditions.",
                },
                {
                  icon: Clock,
                  title: "CPU Scheduling",
                  description:
                    "FCFS, SJF, SRTF, Priority, RR, MLFQ with Gantt charts and metrics.",
                },
                {
                  icon: LockKeyhole,
                  title: "Synchronization",
                  description:
                    "Mutex, semaphores, monitors and classic synchronization problems.",
                },
                {
                  icon: Network,
                  title: "Deadlocks",
                  description:
                    "Conditions, graphs, prevention, Banker's algorithm and recovery.",
                },
                {
                  icon: Layers3,
                  title: "Memory Management",
                  description:
                    "Paging, segmentation, page tables, TLB and fragmentation.",
                },
                {
                  icon: Split,
                  title: "Virtual Memory",
                  description:
                    "Page faults, replacement algorithms, thrashing and working sets.",
                },
                {
                  icon: HardDrive,
                  title: "Files & Disks",
                  description:
                    "Inodes, allocation, journaling, disk scheduling and RAID.",
                },
                {
                  icon: ShieldCheck,
                  title: "Security & Virtualization",
                  description:
                    "Protection, attacks, hypervisors, containers, namespaces and cgroups.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    className="os-card os-feature-card"
                    key={item.title}
                  >
                    <div className="os-icon">
                      <Icon size={22} />
                    </div>

                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* CURRICULUM */}
        <section
          className="os-section"
          id="curriculum"
          style={{ scrollMarginTop: 90 }}
        >
          <div className="os-shell">
            <SectionHeading
              eyebrow="COMPLETE BOOK CONTENTS"
              title={`${TOTAL_CHAPTERS} chapters. Five learning stages.`}
              description="Progress from OS fundamentals to scheduling, memory and storage, real-world Linux, and finally solved problems and rapid revision."
            />

            <div className="os-curriculum-layout">
              <div className="os-curriculum-sidebar">
                {CURRICULUM.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    className={`os-curriculum-tab ${
                      activeCurriculum === group.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setChapterSearch("");
                      setActiveCurriculum(group.id);
                    }}
                  >
                    <span>{group.number}</span>

                    <div style={{ flex: 1 }}>
                      <strong>{group.title}</strong>
                      <small>{group.chapters.length} chapters</small>
                    </div>

                    <ChevronRight size={15} />
                  </button>
                ))}
              </div>

              <div style={{ minWidth: 0 }}>
                <div className="os-search-box">
                  <Search size={17} />

                  <input
                    type="search"
                    value={chapterSearch}
                    onChange={(event) =>
                      setChapterSearch(event.target.value)
                    }
                    placeholder="Search: deadlock, paging, semaphore, scheduling..."
                    aria-label="Search operating system chapters"
                  />

                  {chapterSearch && (
                    <button
                      type="button"
                      className="os-clear-btn"
                      onClick={() => setChapterSearch("")}
                      aria-label="Clear chapter search"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {(chapterSearch
                  ? filteredCurriculum
                  : CURRICULUM.filter(
                      (group) => group.id === activeCurriculum
                    )
                ).map((group) => (
                  <div key={group.id} style={{ marginBottom: 20 }}>
                    <div style={{ padding: "5px 0 14px" }}>
                      <h3
                        style={{
                          fontSize: 17,
                          margin: 0,
                          fontWeight: 850,
                        }}
                      >
                        {group.title}
                      </h3>

                      <p
                        style={{
                          fontSize: 12,
                          margin: "6px 0 0",
                          color: "var(--os-muted)",
                        }}
                      >
                        {group.subtitle}
                      </p>
                    </div>

                    <div className="os-chapter-list">
                      {group.chapters.map((chapter) => (
                        <article key={chapter.n} className="os-chapter">
                          <span className="os-chapter-number">
                            {chapter.n}
                          </span>

                          <div>
                            <h3>{chapter.title}</h3>
                            <p>{chapter.details}</p>

                            <ol className="os-section-list">
                              {chapter.sections.map((section, idx) => (
                                <li key={section}>
                                  <b>
                                    {chapter.n}.{idx + 1}
                                  </b>
                                  {section}
                                </li>
                              ))}
                            </ol>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}

                {chapterSearch && filteredCurriculum.length === 0 && (
                  <div
                    className="os-card"
                    style={{ padding: 30, textAlign: "center" }}
                  >
                    <Search
                      size={23}
                      style={{
                        color: "var(--os-orange)",
                        margin: "0 auto",
                      }}
                    />

                    <p style={{ fontSize: 12, marginTop: 12 }}>
                      No chapters match your search.
                    </p>

                    <button
                      type="button"
                      className="os-btn os-btn-outline"
                      style={{ marginTop: 14 }}
                      onClick={() => setChapterSearch("")}
                    >
                      Show all chapters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SCHEDULER COMPARISON */}
        <section className="os-section os-section-alt">
          <div className="os-shell">
            <SectionHeading
              eyebrow="CPU SCHEDULING GUIDE"
              title="Know which scheduler fits which job."
              description="A quick preview of the comparison tables in the book. Every algorithm is explained with Gantt charts and turnaround, waiting and response time."
            />

            <label className="os-search-box narrow">
              <Search size={16} />

              <input
                type="search"
                value={schedulerSearch}
                onChange={(event) =>
                  setSchedulerSearch(event.target.value)
                }
                placeholder="Search schedulers..."
                aria-label="Filter scheduling algorithms"
              />

              {schedulerSearch && (
                <button
                  type="button"
                  className="os-clear-btn"
                  onClick={() => setSchedulerSearch("")}
                  aria-label="Clear scheduler filter"
                >
                  <X size={15} />
                </button>
              )}
            </label>

            <div className="os-table-wrap">
              <table className="os-table">
                <thead>
                  <tr>
                    <th>Algorithm</th>
                    <th>Type</th>
                    <th>Best for</th>
                    <th>Key consideration</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSchedulers.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td>
                        <span className="os-table-type">
                          {item.type}
                        </span>
                      </td>
                      <td>{item.ideal}</td>
                      <td>{item.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredSchedulers.length === 0 && (
                <div
                  style={{
                    padding: 25,
                    color: "var(--os-muted)",
                    textAlign: "center",
                    fontSize: 12,
                  }}
                >
                  No matching algorithms found.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CODE EXAMPLES */}
        <section className="os-section" id="code-examples">
          <div className="os-shell">
            <SectionHeading
              eyebrow="LEARN BY RUNNING CODE"
              title="See the concepts work in real code."
              description="Short, runnable examples in C, Python and shell that turn abstract OS ideas into things you can execute and modify."
            />

            <div className="os-code-tabs">
              {CODE_EXAMPLES.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  className={`os-code-tab ${
                    activeCode === example.id ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveCode(example.id);
                    setCopied(false);
                  }}
                >
                  {example.label}
                </button>
              ))}
            </div>

            <div className="os-code-layout">
              <div className="os-card os-code-intro">
                <div className="os-icon">
                  <Terminal size={23} />
                </div>

                <h3>{selectedCode.title}</h3>
                <p>{selectedCode.description}</p>

                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 24,
                    display: "grid",
                    gap: 12,
                  }}
                >
                  {[
                    "Runnable C, Python and shell",
                    "Mapped to book chapters",
                    "Interview-friendly explanations",
                  ].map((item) => (
                    <span
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        color: "var(--os-muted)",
                        fontSize: 11,
                      }}
                    >
                      <CheckCircle2
                        size={15}
                        style={{ color: "var(--os-orange)" }}
                      />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="os-code-window">
                <div className="os-code-toolbar">
                  <div className="os-code-dots">
                    <i />
                    <i />
                    <i />
                  </div>

                  <span>{selectedCode.filename}</span>

                  <button
                    type="button"
                    className="os-copy-button"
                    onClick={copyCode}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <pre>
                  <code>{selectedCode.code}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* INTERVIEW */}
        <section className="os-section os-section-alt">
          <div className="os-shell">
            <div
              className="os-card"
              style={{ padding: "clamp(22px,4vw,39px)" }}
            >
              <div className="os-grid-two">
                <div>
                  <span className="os-eyebrow">
                    <i />
                    INTERVIEW & PLACEMENT READY
                  </span>

                  <h2
                    style={{
                      fontSize: "clamp(26px,3vw,38px)",
                      letterSpacing: "-.045em",
                      lineHeight: 1.2,
                      margin: "15px 0",
                    }}
                  >
                    Can you explain what happens when you run a
                    program?
                  </h2>

                  <p style={{ fontSize: 13, lineHeight: 1.85 }}>
                    Move beyond memorised definitions. Learn to
                    answer the classic questions confidently: process
                    vs thread, paging vs segmentation, mutex vs
                    semaphore, how deadlocks are avoided, and what
                    really happens on a page fault.
                  </p>

                  <a
                    href="#curriculum"
                    className="os-btn os-btn-orange"
                    style={{ marginTop: 20 }}
                    onClick={() => {
                      setChapterSearch("");
                      setActiveCurriculum("interview");
                    }}
                  >
                    Explore practice chapters
                    <ArrowUpRight size={16} />
                  </a>
                </div>

                <div
                  style={{
                    background: "var(--os-soft)",
                    border: "1px solid var(--os-border)",
                    borderRadius: 13,
                    padding: 20,
                    display: "grid",
                    gap: 12,
                    alignContent: "center",
                  }}
                >
                  {[
                    [Target, "Interview rapid-fire questions"],
                    [Workflow, "Popular solved numericals"],
                    [FileText, "Formula sheets & comparison tables"],
                    [Users, "Student, fresher & professional friendly"],
                    [Terminal, "Linux debugging scenarios"],
                    [BookOpen, "Last-night quick revision"],
                  ].map(([Icon, label]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 11,
                        fontSize: 12,
                        fontWeight: 750,
                      }}
                    >
                      <Icon
                        size={18}
                        style={{ color: "var(--os-orange)" }}
                      />

                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="os-section">
          <div className="os-shell os-faq-grid">
            <SectionHeading
              eyebrow="FREQUENTLY ASKED QUESTIONS"
              title="Questions about the Operating System ebook?"
              description="Everything you need to know about who it is for, what it covers, and how you receive it."
            />

            <div className="os-faq-list">
              {FAQS.map((faq, index) => (
                <div className="os-faq-item" key={faq.question}>
                  <button
                    type="button"
                    aria-expanded={openFaq === index}
                    onClick={() =>
                      setOpenFaq(openFaq === index ? null : index)
                    }
                  >
                    {faq.question}

                    <ChevronDown
                      size={16}
                      style={{
                        flexShrink: 0,
                        color: "var(--os-orange)",
                        transform:
                          openFaq === index ? "rotate(180deg)" : "none",
                        transition: "transform .2s",
                      }}
                    />
                  </button>

                  {openFaq === index && (
                    <div className="os-faq-answer">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL PURCHASE */}
        <section className="os-section" style={{ paddingTop: 15 }}>
          <div className="os-shell">
            <div className="os-final-cta">
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#FDBA74",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: ".11em",
                    position: "relative",
                  }}
                >
                  <Sparkles size={14} />
                  TARGET TREK · OPERATING SYSTEM EBOOK
                </span>

                <h2 style={{ marginTop: 15 }}>
                  Go from memorising definitions to truly
                  understanding the OS.
                </h2>

                <p>
                  Ace your exams, crack technical interviews and
                  debug real systems with one structured book:
                  concepts, solved problems, Linux tooling and quick
                  revision in a single place.
                </p>
              </div>

              <div className="os-final-actions">
                <div className="os-final-price">
                  <small
                    style={{
                      display: "block",
                      color: "#C5B3A5",
                      fontSize: 10,
                      marginBottom: 5,
                    }}
                  >
                    EBOOK PRICE
                  </small>

                  <strong>
                    {loadingProduct
                      ? "Loading..."
                      : hasValidPrice
                      ? formatMoney(currentPrice, currency)
                      : "Unavailable"}
                  </strong>

                  {mrp !== null && (
                    <del>{formatMoney(mrp, currency)}</del>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!canBuy}
                  className="os-btn os-btn-orange"
                >
                  Get the ebook
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>

            <p
              style={{
                margin: "15px 0 0",
                color: "var(--os-muted)",
                fontSize: 11,
                lineHeight: 1.8,
              }}
            >
              This is a digital ebook. For payment or access
              assistance, contact{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                style={{
                  color: "var(--os-orange)",
                  fontWeight: 850,
                }}
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </div>
        </section>

        {/* MOBILE STICKY PURCHASE BAR */}
        <div className="os-mobile-buy">
          <div className="os-mobile-price">
            <small>OPERATING SYSTEM EBOOK</small>

            <strong>
              {loadingProduct
                ? "Loading..."
                : hasValidPrice
                ? formatMoney(currentPrice, currency)
                : "Unavailable"}
            </strong>

            {discount > 0 && (
              <small
                style={{
                  color: "var(--os-orange)",
                  fontWeight: 850,
                }}
              >
                {discount}% OFF
              </small>
            )}
          </div>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!canBuy}
            className="os-btn os-btn-orange"
          >
            Get Ebook
            <ArrowRight size={15} />
          </button>
        </div>
      </main>

      {/* EXISTING PAYMENT CHECKOUT FLOW */}
      <PayUCheckoutModal
        isOpen={isCheckoutOpen && canBuy}
        onClose={() => setIsCheckoutOpen(false)}
        product={product}
      />
    </>
  );
}
