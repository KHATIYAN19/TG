import {
  Briefcase, Calculator, ChatsCircle, Cpu, Exam, FileText, GraduationCap, ListChecks, Memory, Target, TerminalWindow,
} from "@phosphor-icons/react";

/* Content for /books/operating-systems (Operating Systems: The Placement Handbook). Curriculum and code samples are carried over from the previous page. */

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

export const SCHEDULERS = [
  ["FCFS", "Non-preemptive", "Simple batch systems", "Easy to implement but suffers from the convoy effect; long jobs delay everyone."],
  ["SJF", "Non-preemptive", "Minimizing average waiting time", "Optimal average waiting time among non-preemptive policies, but needs burst estimates and can starve long jobs."],
  ["SRTF", "Preemptive", "Short-job responsiveness", "Preemptive SJF; best average waiting time, higher context-switch overhead and starvation risk."],
  ["Priority", "Either", "Systems with importance levels", "Low-priority processes can starve; aging gradually raises their priority to fix it."],
  ["Round Robin", "Preemptive", "Time-sharing and interactive systems", "Fair and responsive; performance depends heavily on the time quantum."],
  ["MLFQ", "Preemptive", "General-purpose OS (Linux, Windows style)", "Moves processes between queues based on behaviour, balancing responsiveness and throughput."],
];

export const OS_BOOK = {
  key: "os",
  path: "/books/operating-systems",
  crumb: "Operating Systems",
  productName: "Operating Systems: The Placement Handbook",
  seo: {
    title: "Operating System Ebook: Interview & Placement Guide | Target Trek",
    description: "Master Operating Systems for exams, placements and real jobs: processes, threads, CPU scheduling, synchronization, deadlocks, memory, virtual memory, file systems, Linux toolkit and solved problems.",
    keywords: "operating system ebook, OS interview questions, operating system notes, CPU scheduling, deadlock, paging, virtual memory, process synchronization, GATE operating system, placement preparation, Linux",
    long: "A complete Operating Systems handbook for students, placement candidates and working engineers: processes, threads, CPU scheduling, synchronization, deadlocks, memory management, virtual memory, file systems, I/O, virtualization and a Linux toolkit, with 16 solved problems and 60 interview questions.",
    category: "Operating Systems Ebook",
  },
  pill: "CS core series · PDF ebook",
  h1: <>Operating Systems, <span className="hb-mark">explained the way interviews ask.</span></>,
  lead: "Processes, threads, CPU scheduling, synchronization, deadlocks, paging, virtual memory and file systems, built up from zero. Then 16 solved problems, 60 rapid-fire interview questions and a Linux toolkit for real servers.",
  stats: [["15", "chapters"], ["16", "solved problems"], ["60", "interview Q&A"], ["6", "scheduling algorithms"]],
  cover: { title: "Operating Systems", subtitle: "The Placement Handbook", line: "Scheduling · Deadlocks · Paging · Linux" },
  nav: [["answers", "Quick answers"], ["try", "Try it: scheduler & paging"], ["models", "Mental models"], ["syllabus", "Syllabus"], ["code", "Code samples"], ["bundle", "CS core set"], ["faq", "FAQ"]],
  quick: [
    { q: "What is the difference between a process and a thread?", a: "A process is a program in execution with its own address space, files and resources. A thread is a unit of execution inside a process; threads of one process share its memory and files but each has its own stack, registers and program counter, so switching between them is cheaper." },
    { q: "What are the four conditions for deadlock?", a: "Mutual exclusion, hold and wait, no preemption and circular wait. A deadlock can happen only when all four hold at once, so breaking any one of them prevents it." },
    { q: "What is the difference between a mutex and a semaphore?", a: "A mutex is a lock with ownership: only the thread that locked it can unlock it, and it protects one critical section. A semaphore is a counter that any thread can signal; a counting semaphore can let several threads in, which suits resource pools and producer-consumer." },
    { q: "What is thrashing?", a: "Thrashing is when a process has too few frames, so it page-faults constantly and the system spends more time swapping pages than running code. CPU utilisation collapses; the fix is to give processes enough frames for their working set or run fewer of them." },
  ],
  flows: {
    title: "Two flows explain most of the OS",
    lead: "Most questions are about how a process moves between states, and how a virtual address becomes a physical one.",
    items: [
      { n: "01", title: "Process lifecycle", icon: Cpu, copy: "A process moves between states as the scheduler, I/O and the kernel interact. Knowing each transition makes scheduling, synchronization and deadlocks easy.",
        steps: ["New", "Ready", "Running", "Waiting", "Done"], note: "Every context switch saves the running process in its PCB and restores another, which is the hidden cost behind scheduling decisions." },
      { n: "02", title: "Virtual address translation", icon: Memory, copy: "Each process sees a private address space. The MMU, TLB and page tables translate virtual addresses, and the OS fetches missing pages from disk.",
        steps: ["Virtual addr", "TLB", "Page table", "Physical RAM", "Disk"], note: "A TLB hit is fast; a miss walks the page table; a page fault loads the page from disk. Effective access time numericals follow directly from this." },
    ],
  },
  curriculum: CURRICULUM,
  syllabusTitle: "15 chapters, from the kernel to the Linux shell",
  syllabusLead: "Core foundations, scheduling and concurrency, memory and storage, security and real-world Linux, then a full practice and revision part.",
  samples: CODE_EXAMPLES,
  samplesTitle: "OS concepts you can compile and run",
  samplesLead: "fork and exec in C, schedulers, semaphores, Banker's algorithm and page replacement in Python, and the shell commands for a slow server.",
  forTitle: "Written for exams, interviews and production systems",
  audiences: [
    { icon: GraduationCap, title: "Students", copy: "Built around university and GATE-style syllabi. Concepts explained from zero with diagrams, worked numericals and revision tables.", points: ["Syllabus-aligned flow", "Step-by-step numericals", "Formula sheets"] },
    { icon: Target, title: "Placement prep", copy: "OS is asked in almost every campus and off-campus technical round. Practise the exact questions, with answers short enough to say out loud.", points: ["60 rapid-fire Q&A", "Solved problems", "Night-before checklist"] },
    { icon: Briefcase, title: "Working professionals", copy: "Understand what happens under your code. Debug CPU, memory and I/O issues in production with the Linux toolkit.", points: ["Linux toolkit", "Containers and cgroups", "Debugging mindset"] },
  ],
  value: [
    { icon: FileText, title: "15 chapters, kernel to Linux", copy: "Every concept explained with diagrams and tables." },
    { icon: Calculator, title: "16 solved numerical problems", copy: "Gantt charts, Banker's, page replacement, TLB, disk scheduling." },
    { icon: ChatsCircle, title: "60 interview questions", copy: "Crisp model answers plus coding-round OS problems." },
    { icon: ListChecks, title: "Quick revision kit", copy: "Formula sheet, algorithm comparison, night-before checklist." },
    { icon: TerminalWindow, title: "Linux toolkit", copy: "ps, top, strace, lsof, vmstat, iostat, /proc and pipes." },
    { icon: Exam, title: "GATE and semester ready", copy: "Follows the standard university syllabus." },
  ],
  faqs: [
    { q: "Who is this Operating System ebook for?", a: "It is written for three groups: college students preparing for semester exams and GATE, candidates preparing for campus and off-campus placements, and working professionals who want to understand what happens beneath their code and debug production systems." },
    { q: "Do I need prior knowledge of operating systems?", a: "No. The book starts with kernel and system-call fundamentals and builds step by step. Basic familiarity with programming is enough." },
    { q: "Does it include numerical problems?", a: "Yes. A dedicated chapter of 16 solved numerical problems covers CPU scheduling Gantt charts, Banker's algorithm, page replacement, TLB and effective access time, disk scheduling and more, with every step shown." },
    { q: "Will it help in technical interviews?", a: "Yes. The Interview Rapid-Fire chapter has 60 questions with concise model answers across all topics, and the Quick Revision chapter condenses the entire book into cheat sheets for the night before an interview." },
    { q: "Is Linux covered?", a: "Yes. The OS in Practice chapter covers the Linux toolkit: ps, top, strace, lsof, vmstat, iostat, /proc, signals, permissions and a debugging workflow for high CPU, memory and I/O problems." },
    { q: "In what format will I receive the book?", a: "It is a digital PDF ebook. After a successful payment you receive access through the same flow used for all Target Trek ebooks. For any payment or access issue, contact our support email." },
  ],
  final: {
    title: <>Stop memorising definitions. <span className="hb-mark">Understand what the kernel does.</span></>,
    line: "15 chapters, 16 solved problems and 60 interview questions, in one PDF you can read anywhere.",
  },
  footLine: "Operating Systems: The Placement Handbook · Digital PDF ebook · Digital purchases are not refundable",
};
