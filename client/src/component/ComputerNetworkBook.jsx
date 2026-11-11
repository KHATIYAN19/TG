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
  Clock,
  Copy,
  Cpu,
  FileText,
  Globe,
  GraduationCap,
  Layers3,
  LockKeyhole,
  Network,
  RefreshCw,
  Router,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  Users,
  Wifi,
  Workflow,
  X,
  Zap,
} from "lucide-react";

// ======================================================
// CONFIGURATION
// ======================================================

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";
const PAGE_PATH = "/book/computer-network";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;

const BASE_URL =
  API_BASE_URL;

const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SEO_TITLE =
  "Computer Networks Ebook: Placement Handbook | Target Trek";

const SEO_DESCRIPTION =
  "Master Computer Networks for exams and placements: OSI, subnetting, routing, TCP, DNS, HTTP, TLS, 25 solved numericals and interview Q&A.";

const SEO_KEYWORDS =
  "computer networks ebook, computer network interview questions, OSI model, TCP/IP, subnetting, VLSM, CIDR, routing algorithms, OSPF, BGP, TCP vs UDP, congestion control, DNS, HTTP, TLS, GATE computer networks, placement preparation";

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
// CURRICULUM - 12 CHAPTERS
// ======================================================

const CURRICULUM = [
  {
    id: "foundations",
    number: "01",
    title: "Foundations & Models",
    subtitle: "Basics, layered models and the physical layer",
    chapters: [
      {
        n: "01",
        title: "Introduction & Network Basics",
        details:
          "What a network is, how networks are classified by size, topologies, transmission modes and switching, the four packet delays, and the metrics used to measure performance.",
        sections: [
          "What is a Computer Network?",
          "Types of Networks by Size",
          "Network Topologies",
          "Transmission Modes & Switching",
          "Delays in Packet-Switched Networks",
          "Network Performance Metrics",
        ],
      },
      {
        n: "02",
        title: "OSI & TCP/IP Reference Models",
        details:
          "Why networks are layered, the OSI and TCP/IP models side by side, how data is encapsulated and decapsulated, and which address is used at each layer.",
        sections: [
          "Why Layered Architecture?",
          "OSI vs TCP/IP",
          "Encapsulation & Decapsulation",
          "Addresses at Each Layer",
        ],
      },
      {
        n: "03",
        title: "Physical Layer",
        details:
          "Transmission media, analog vs digital signals, bandwidth and baud, channel capacity with Nyquist and Shannon, line coding and multiplexing.",
        sections: [
          "Transmission Media",
          "Analog vs Digital, Bandwidth, Baud",
          "Channel Capacity: Nyquist and Shannon",
          "Line Coding",
          "Multiplexing",
        ],
      },
    ],
  },
  {
    id: "link-network",
    number: "02",
    title: "Link, IP & Routing",
    subtitle: "Frames, addresses and how packets find their way",
    chapters: [
      {
        n: "04",
        title: "Data Link Layer",
        details:
          "Framing and stuffing, error detection and correction, flow control with sliding-window ARQ, medium access control, and Ethernet, switches, VLANs and ARP.",
        sections: [
          "Responsibilities of the Data Link Layer",
          "Framing & Stuffing",
          "Error Detection and Correction",
          "Flow Control & ARQ Protocols",
          "Medium Access Control (MAC)",
          "Ethernet, Switches, VLANs, ARP",
        ],
      },
      {
        n: "05",
        title: "Network Layer: IP, Subnetting, NAT",
        details:
          "IPv4 addressing, subnetting, VLSM, CIDR and longest prefix match, the IPv4 header and fragmentation, ICMP, DHCP, NAT and IPv6.",
        sections: [
          "Network Layer Functions",
          "IPv4 Addressing",
          "Subnetting",
          "VLSM",
          "CIDR, Supernetting & Longest Prefix Match",
          "IPv4 Header and Fragmentation",
          "ICMP, DHCP and NAT",
          "IPv6",
        ],
      },
      {
        n: "06",
        title: "Routing Algorithms & Protocols",
        details:
          "Forwarding vs routing, distance vector with Bellman-Ford, link state with Dijkstra and OSPF, and BGP, the routing protocol of the internet.",
        sections: [
          "Forwarding vs Routing",
          "Distance Vector Routing (Bellman-Ford)",
          "Link State Routing (Dijkstra) - OSPF",
          "BGP - the Routing Protocol of the Internet",
        ],
      },
    ],
  },
  {
    id: "transport-app",
    number: "03",
    title: "Transport & Application",
    subtitle: "TCP, UDP, DNS, HTTP and email",
    chapters: [
      {
        n: "07",
        title: "Transport Layer: TCP & UDP",
        details:
          "Process-to-process delivery, UDP, the TCP connection lifecycle, flow control, congestion control, timeouts and RTT estimation, and a clear TCP vs UDP comparison.",
        sections: [
          "Process-to-Process Delivery",
          "UDP - User Datagram Protocol",
          "TCP - Transmission Control Protocol",
          "Flow Control",
          "Congestion Control",
          "Timeouts and RTT Estimation",
          "TCP vs UDP",
        ],
      },
      {
        n: "08",
        title: "Application Layer",
        details:
          "Client-server vs peer-to-peer, DNS resolution, HTTP versions and methods, email with SMTP, POP3 and IMAP, and other everyday application protocols.",
        sections: [
          "Client-Server vs Peer-to-Peer",
          "DNS - Domain Name System",
          "HTTP",
          "Email: SMTP, POP3, IMAP",
          "Other Application Protocols",
        ],
      },
    ],
  },
  {
    id: "security-modern",
    number: "04",
    title: "Security & Modern Infra",
    subtitle: "TLS, firewalls, Wi-Fi, CDNs and debugging",
    chapters: [
      {
        n: "09",
        title: "Network Security Essentials",
        details:
          "Security goals, cryptography building blocks, how TLS and HTTPS use certificates, firewalls, IDS/IPS and VPNs, and common attacks with their defences.",
        sections: [
          "Security Goals",
          "Cryptography Building Blocks",
          "TLS / HTTPS and Certificates",
          "Firewalls, IDS/IPS, VPN",
          "Common Attacks and Defences",
        ],
      },
      {
        n: "10",
        title: "Wireless, Modern Infrastructure & Tools",
        details:
          "Wi-Fi (IEEE 802.11), load balancers, proxies and CDNs, the command-line tools every engineer uses, and a step-by-step checklist for 'the website will not load'.",
        sections: [
          "Wi-Fi (IEEE 802.11)",
          "Load Balancers, Proxies, CDNs",
          "Command-line Tools",
          'Troubleshooting: "The website will not load"',
        ],
      },
    ],
  },
  {
    id: "practice",
    number: "05",
    title: "Practice & Revision",
    subtitle: "Solve, drill and revise before the interview",
    chapters: [
      {
        n: "11",
        title: "Numerical Practice Set",
        details:
          "25 numerical questions on delays, Shannon and Nyquist, CRC, sliding window, subnetting, CIDR, TCP and more, each with a full worked answer.",
        sections: ["25 questions with answers and working"],
      },
      {
        n: "12",
        title: "Interview Questions & Quick Revision",
        details:
          "Interview questions grouped by topic plus scenario questions, followed by a one-page formula sheet and a port number cheat-sheet.",
        sections: [
          "Fundamentals",
          "Data Link & Network Layer",
          "Transport Layer",
          "Application Layer & Web",
          "Security",
          "Scenario Questions",
          "One-page Formula Sheet",
          "Port Number Cheat-sheet",
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
// QUICK ANSWERS (AEO) - SHORT, DIRECT, QUOTABLE
// ======================================================

const QUICK_ANSWERS = [
  {
    question: "What is the OSI model?",
    answer:
      "The OSI model is a 7-layer reference model that splits network communication into Physical, Data Link, Network, Transport, Session, Presentation and Application layers, so each layer can be designed and debugged independently.",
  },
  {
    question: "What is the difference between TCP and UDP?",
    answer:
      "TCP is connection-oriented and reliable: it uses a handshake, acknowledgements, retransmission, flow and congestion control. UDP is connectionless and unreliable but faster, with no delivery guarantee, which suits DNS, streaming and gaming.",
  },
  {
    question: "What happens when you type a URL in a browser?",
    answer:
      "The browser resolves the domain through DNS, opens a TCP connection to the server, performs a TLS handshake for HTTPS, sends an HTTP request, receives the response and renders the page.",
  },
  {
    question: "What is subnetting?",
    answer:
      "Subnetting divides one IP network into smaller subnets by borrowing host bits for the network part. A /26 mask, for example, gives 4 subnets of 62 usable hosts each from a /24 block.",
  },
];

// ======================================================
// OSI / TCP-IP LAYER TABLE
// ======================================================

const LAYERS = [
  {
    name: "Application",
    tcpip: "Application",
    pdu: "Data / Message",
    address: "Port-based service",
    examples: "HTTP, DNS, SMTP, FTP",
  },
  {
    name: "Transport",
    tcpip: "Transport",
    pdu: "Segment / Datagram",
    address: "Port number",
    examples: "TCP, UDP",
  },
  {
    name: "Network",
    tcpip: "Internet",
    pdu: "Packet",
    address: "IP address",
    examples: "IP, ICMP, OSPF, BGP",
  },
  {
    name: "Data Link",
    tcpip: "Network Access",
    pdu: "Frame",
    address: "MAC address",
    examples: "Ethernet, ARP, Wi-Fi",
  },
  {
    name: "Physical",
    tcpip: "Network Access",
    pdu: "Bits",
    address: "None",
    examples: "Cables, fibre, radio, hubs",
  },
];

// ======================================================
// TCP vs UDP
// ======================================================

const TRANSPORTS = [
  {
    name: "Connection",
    tcp: "Connection-oriented (3-way handshake)",
    udp: "Connectionless",
  },
  {
    name: "Reliability",
    tcp: "Acknowledgements, retransmission, ordering",
    udp: "Best effort, no guarantee",
  },
  {
    name: "Control",
    tcp: "Flow control and congestion control",
    udp: "None built in",
  },
  {
    name: "Header",
    tcp: "20 to 60 bytes",
    udp: "8 bytes",
  },
  {
    name: "Used by",
    tcp: "HTTP/HTTPS, SSH, SMTP, FTP",
    udp: "DNS, VoIP, streaming, gaming, QUIC",
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
      "Built around university and GATE-style syllabi. Every layer is explained from zero with diagrams, worked numericals and revision tables.",
    points: [
      "Syllabus-aligned chapter flow",
      "Step-by-step numerical solutions",
      "Formula sheet for exam week",
    ],
  },
  {
    icon: Target,
    title: "For Placement Prep",
    description:
      "Computer Networks is asked in most campus and off-campus technical rounds. Practise the exact questions interviewers ask, with answers short enough to say aloud.",
    points: [
      "Interview Q&A grouped by topic",
      "Scenario questions",
      "Port number cheat-sheet",
    ],
  },
  {
    icon: Briefcase,
    title: "For Working Professionals",
    description:
      "Understand what happens beneath your API calls. Debug DNS, TLS, latency and connectivity issues with confidence.",
    points: [
      "Load balancers, proxies and CDNs",
      "Command-line debugging tools",
      "'Website will not load' checklist",
    ],
  },
];

// ======================================================
// CODE EXAMPLES
// ======================================================

const CODE_EXAMPLES = [
  {
    id: "subnet",
    label: "Subnetting",
    filename: "subnet.py",
    title: "Subnet a network with Python",
    description:
      "Split 192.168.10.0/24 into four /26 subnets and list the network, broadcast and usable host range of each, the same working you do in an exam.",
    code: `import ipaddress

net = ipaddress.ip_network("192.168.10.0/24")

for sub in net.subnets(new_prefix=26):
    hosts = list(sub.hosts())
    print(
        f"{sub}  broadcast={sub.broadcast_address}"
        f"  usable={hosts[0]} - {hosts[-1]}"
        f"  ({len(hosts)} hosts)"
    )

# 192.168.10.0/26    usable=192.168.10.1 - 192.168.10.62   (62 hosts)
# 192.168.10.64/26   usable=192.168.10.65 - 192.168.10.126 (62 hosts)
# ...`,
  },
  {
    id: "capacity",
    label: "Nyquist / Shannon",
    filename: "capacity.py",
    title: "Channel capacity: Nyquist and Shannon",
    description:
      "Compute the maximum bit rate of a noiseless channel (Nyquist) and a noisy channel (Shannon), two formulas that appear in nearly every exam.",
    code: `import math

def nyquist(bandwidth_hz, levels):
    # noiseless channel: C = 2 * B * log2(L)
    return 2 * bandwidth_hz * math.log2(levels)

def shannon(bandwidth_hz, snr_db):
    # noisy channel: C = B * log2(1 + SNR)
    snr = 10 ** (snr_db / 10)
    return bandwidth_hz * math.log2(1 + snr)

print(nyquist(3000, 4))    # 12000.0 bps
print(shannon(3000, 30))   # ~29902 bps  (SNR = 30 dB = 1000)`,
  },
  {
    id: "window",
    label: "Sliding window",
    filename: "window.py",
    title: "Sliding window link utilization",
    description:
      "Compute efficiency of Stop-and-Wait and Go-Back-N from the transmission time and propagation delay.",
    code: `def utilization(frame_bits, bandwidth_bps, prop_delay_s, window=1):
    tx = frame_bits / bandwidth_bps          # transmission time
    rtt = 2 * prop_delay_s
    u = window * tx / (tx + rtt)
    return min(u, 1.0)

# 1000-bit frame, 1 Mbps link, 20 ms one-way delay
print(utilization(1000, 1_000_000, 0.020))             # Stop-and-Wait ~ 0.024
print(utilization(1000, 1_000_000, 0.020, window=20))  # window = 20  ~ 0.48

# Window size needed to fill the pipe: 1 + 2a, where a = Tp / Tt`,
  },
  {
    id: "socket",
    label: "TCP socket",
    filename: "echo_server.py",
    title: "A TCP echo server and client",
    description:
      "See the client-server model, ports and the TCP connection in about twenty lines of Python sockets.",
    code: `import socket, threading

def server():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind(("127.0.0.1", 9000))
        s.listen()
        conn, addr = s.accept()          # 3-way handshake completes here
        with conn:
            data = conn.recv(1024)
            conn.sendall(data.upper())

threading.Thread(target=server, daemon=True).start()

import time; time.sleep(0.3)
with socket.create_connection(("127.0.0.1", 9000)) as c:
    c.sendall(b"hello network")
    print(c.recv(1024))                  # b'HELLO NETWORK'`,
  },
  {
    id: "tools",
    label: "CLI toolkit",
    filename: "debug.sh",
    title: "Debug 'the website will not load'",
    description:
      "A layer-by-layer command sequence: link, IP, DNS, route, port and HTTP, so you can pinpoint where the failure is.",
    code: `# 1. Is my interface up and do I have an IP?
ip addr show

# 2. Can I reach the gateway and the internet by IP?
ping -c 3 192.168.1.1
ping -c 3 8.8.8.8

# 3. Does DNS resolve?
dig example.com +short
nslookup example.com

# 4. Where along the path does traffic stop?
traceroute example.com

# 5. Is the port open and does TLS work?
nc -vz example.com 443
openssl s_client -connect example.com:443 -servername example.com </dev/null

# 6. What does the HTTP layer say?
curl -I https://example.com`,
  },
];

// ======================================================
// FAQ (also emitted as FAQPage JSON-LD and server HTML)
// ======================================================

const FAQS = [
  {
    question: "Who is this Computer Networks ebook for?",
    answer:
      "It is written for college students preparing for semester exams and GATE, candidates preparing for campus and off-campus placements, and working professionals who want to understand and debug the network beneath their applications.",
  },
  {
    question: "Do I need prior knowledge of networking?",
    answer:
      "No. The book starts with what a network is and builds layer by layer, from the physical layer up to the application layer. Basic familiarity with programming is enough.",
  },
  {
    question: "Does it cover subnetting, VLSM and CIDR?",
    answer:
      "Yes. Chapter 5 covers IPv4 addressing, subnetting, VLSM, CIDR, supernetting and longest prefix match with worked examples, along with ICMP, DHCP, NAT and IPv6.",
  },
  {
    question: "Are there numerical problems with solutions?",
    answer:
      "Yes. Chapter 11 is a practice set of 25 numerical questions with full working. Topics include delays, Nyquist and Shannon capacity, sliding window efficiency, subnetting, CIDR and TCP.",
  },
  {
    question: "Does the book explain TCP congestion control?",
    answer:
      "Yes. The transport layer chapter covers the TCP handshake, flow control, congestion control, timeouts and RTT estimation, and ends with a TCP vs UDP comparison.",
  },
  {
    question: "Will it help in technical interviews?",
    answer:
      "Yes. Chapter 12 groups interview questions by topic (fundamentals, data link and network layer, transport, application and web, security) and adds scenario questions, a one-page formula sheet and a port number cheat-sheet.",
  },
  {
    question: "Does it cover security, DNS, HTTP and TLS?",
    answer:
      "Yes. The Application Layer chapter covers DNS, HTTP and email protocols, and the Network Security chapter covers cryptography, TLS/HTTPS certificates, firewalls, IDS/IPS, VPNs and common attacks with defences.",
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
    <div className="cn-section-heading">
      <div>
        <span className="cn-eyebrow">
          <i />
          {eyebrow}
        </span>

        <h2>{title}</h2>

        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

function PriceDisplay({ price, mrp, currency, discount, loading }) {
  if (loading) {
    return (
      <div className="cn-price-skeleton">
        <span />
        <span />
      </div>
    );
  }

  if (price === null) {
    return (
      <span className="cn-price-unavailable">Price unavailable</span>
    );
  }

  return (
    <div className="cn-price-display">
      <strong>{formatMoney(price, currency)}</strong>

      {mrp !== null && mrp > price && (
        <del>{formatMoney(mrp, currency)}</del>
      )}

      {discount > 0 && (
        <span className="cn-discount">{discount}% OFF</span>
      )}
    </div>
  );
}

function CNBookCover({ coverUrl }) {
  return (
    <div className="cn-cover-stage">
      <div className="cn-cover-orbit cn-orbit-one" />
      <div className="cn-cover-orbit cn-orbit-two" />

      <div className="cn-book-cover">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt="Computer Networks ebook cover"
            className="cn-actual-cover"
            loading="eager"
            width="260"
            height="390"
          />
        ) : (
          <>
            <div className="cn-book-top">
              <span>TARGET TREK</span>
              <span>CS CORE SERIES</span>
            </div>

            <div className="cn-book-illustration">
              <svg
                viewBox="0 0 280 190"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                {["APPLICATION", "TRANSPORT", "NETWORK", "LINK"].map(
                  (label, i) => (
                    <g key={label}>
                      <rect
                        x={20 + i * 8}
                        y={12 + i * 38}
                        width={240 - i * 16}
                        height="30"
                        rx="7"
                        fill={i % 2 ? "#0F2A4A" : "#13355E"}
                        stroke="#38BDF8"
                        strokeWidth="1.6"
                      />
                      <text
                        x="140"
                        y={32 + i * 38}
                        fill="#BAE6FD"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="bold"
                      >
                        {label}
                      </text>
                    </g>
                  )
                )}
                <rect
                  x="52"
                  y="162"
                  width="176"
                  height="22"
                  rx="6"
                  fill="#0284C7"
                />
                <text
                  x="140"
                  y="177"
                  fill="#FFF"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                >
                  PHYSICAL · BITS ON THE WIRE
                </text>
              </svg>
            </div>

            <div className="cn-book-content">
              <span className="cn-book-kicker">
                THE COMPLETE PLACEMENT HANDBOOK
              </span>

              <h2>
                COMPUTER
                <span>NETWORKS</span>
              </h2>

              <p>
                OSI · Subnetting · Routing
                <br />
                TCP · DNS · HTTP · TLS
              </p>

              <div className="cn-book-rule" />

              <small>EXAMS · PLACEMENTS · PROFESSIONALS</small>
            </div>
          </>
        )}
      </div>

      <div className="cn-cover-float cn-cover-float-one">
        <Router size={15} />
        ROUTING
      </div>

      <div className="cn-cover-float cn-cover-float-two">
        <LockKeyhole size={15} />
        TLS &amp; SECURITY
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
    <article className="cn-pipeline-card">
      <div className="cn-pipeline-header">
        <div className="cn-icon">
          <Icon size={23} />
        </div>

        <div>
          <span className="cn-pipeline-number">CONCEPT {number}</span>
          <h3>{title}</h3>
        </div>
      </div>

      <p className="cn-pipeline-description">{description}</p>

      <div className="cn-pipeline-steps">
        {steps.map((step, index) => {
          const StepIcon = step.icon;

          return (
            <React.Fragment key={step.label}>
              {index > 0 && (
                <ArrowRight size={14} className="cn-pipeline-arrow" />
              )}

              <div className="cn-pipeline-step">
                <StepIcon size={19} />
                <span>{step.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div className="cn-pipeline-note">
        <CheckCircle2 size={16} />
        {note}
      </div>
    </article>
  );
}

// ======================================================
// MAIN PAGE
// ======================================================

export default function ComputerNetworkBook() {
  const [theme, setTheme] = useState(readTheme);

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [activeCurriculum, setActiveCurriculum] =
    useState("foundations");

  const [chapterSearch, setChapterSearch] = useState("");
  const [activeCode, setActiveCode] = useState("subnet");
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

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
  // GET /book/product?redirectUrl=/book/computer-network
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

        console.error("Computer Network product API error:", error);

        setProductError(
          error?.message || "Unable to load current product details."
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
        [
          chapter.title,
          chapter.details,
          ...chapter.sections,
          group.title,
          group.subtitle,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      ),
    })).filter((group) => group.chapters.length > 0);
  }, [chapterSearch]);

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
  // SEO + AEO STRUCTURED DATA
  // ====================================================

  const structuredData = useMemo(() => {
    const productName =
      product?.title?.trim() ||
      "Computer Networks: The Complete Placement Handbook";

    const allFaqs = [...QUICK_ANSWERS, ...FAQS];

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
          inLanguage: "en-IN",
          isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
          speakable: {
            "@type": "SpeakableSpecification",
            cssSelector: [".cn-hero h1", ".cn-hero-copy", ".cn-quick-answer"],
          },
        },
        {
          "@type": "Book",
          "@id": `${PAGE_URL}#book`,
          name: productName,
          description: SEO_DESCRIPTION,
          bookFormat: "https://schema.org/EBook",
          inLanguage: product?.language || "English",
          url: PAGE_URL,
          about: [
            "Computer Networks",
            "OSI model",
            "TCP/IP",
            "Subnetting",
            "Routing",
            "Network security",
          ],
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
          "@type": "ItemList",
          name: "Computer Networks ebook chapters",
          itemListElement: CURRICULUM.flatMap((g) => g.chapters).map(
            (chapter, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: `Chapter ${chapter.n}: ${chapter.title}`,
            })
          ),
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
          mainEntity: allFaqs.map((faq) => ({
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
        <meta name="keywords" content={SEO_KEYWORDS} />
        <meta
          name="robots"
          content="index,follow,max-image-preview:large,max-snippet:-1"
        />
        <link rel="canonical" href={PAGE_URL} />

        <meta property="og:type" content="product" />
        <meta property="og:site_name" content={SITE_NAME} />
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
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESCRIPTION} />
        {coverImage && (
          <meta name="twitter:image" content={coverImage} />
        )}

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

        .cnPage {
          --cn-bg: #F7FAFC;
          --cn-surface: #FFFFFF;
          --cn-soft: #EEF4F9;
          --cn-text: #0F172A;
          --cn-muted: #5B6B7F;
          --cn-subtle: #94A3B8;
          --cn-border: #E1E8F0;
          --cn-accent: #0369A1;
          --cn-accent-bright: #0EA5E9;
          --cn-accent-soft: #E6F4FD;
          --cn-accent-border: #BAE0F7;
          --cn-shadow: 0 15px 45px rgba(15,40,70,.07);
          --cn-code-bg: #0B1220;

          width: 100%;
          min-height: 100vh;
          overflow-x: clip;
          background: var(--cn-bg);
          color: var(--cn-text);
          font-family: "DM Sans", sans-serif;
          -webkit-font-smoothing: antialiased;
          -webkit-text-size-adjust: 100%;
          transition: background .25s, color .25s;
        }

        .cnPage[data-theme="dark"] {
          --cn-bg: #0C1117;
          --cn-surface: #141B24;
          --cn-soft: #1B2531;
          --cn-text: #F1F5F9;
          --cn-muted: #A3B1C2;
          --cn-subtle: #74849A;
          --cn-border: #26323F;
          --cn-accent: #38BDF8;
          --cn-accent-bright: #0EA5E9;
          --cn-accent-soft: #112B3D;
          --cn-accent-border: #1E4D6B;
          --cn-shadow: 0 15px 45px rgba(0,0,0,.18);
          --cn-code-bg: #070B11;
          color-scheme: dark;
        }

        .cnPage *,
        .cnPage *::before,
        .cnPage *::after { box-sizing: border-box; }

        .cnPage h1, .cnPage h2, .cnPage h3, .cnPage h4 {
          font-family: "Manrope", sans-serif;
        }

        .cnPage a { color: inherit; text-decoration: none; }
        .cnPage button, .cnPage input { font-family: inherit; }
        .cnPage button { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }

        .cn-shell {
          width: min(1220px, calc(100% - 40px));
          margin-inline: auto;
        }

        .cn-section { padding: 69px 0; }

        .cn-section-alt {
          background: var(--cn-surface);
          border-block: 1px solid var(--cn-border);
        }

        .cn-section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 30px;
        }
        .cn-section-heading > div { max-width: 760px; }

        .cn-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .15em;
          color: var(--cn-accent);
          text-transform: uppercase;
        }
        .cn-eyebrow i {
          display: inline-block;
          width: 23px;
          height: 2px;
          border-radius: 4px;
          background: var(--cn-accent-bright);
        }

        .cn-section-heading h2 {
          margin: 12px 0 0;
          color: var(--cn-text);
          font-size: clamp(25px,3.2vw,41px);
          line-height: 1.16;
          font-weight: 850;
          letter-spacing: -.045em;
        }
        .cn-section-heading p {
          margin: 13px 0 0;
          color: var(--cn-muted);
          font-size: 14px;
          line-height: 1.8;
        }

        .cn-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 46px;
          padding: 10px 18px;
          border: 1px solid transparent;
          border-radius: 11px;
          font-size: 13px;
          font-weight: 850;
          cursor: pointer;
          transition: transform .2s, background .2s, border-color .2s;
        }
        .cn-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .cn-btn:disabled { cursor: not-allowed; opacity: .5; }

        .cn-btn-primary { background: #0284C7; color: #FFF !important; }
        .cn-btn-primary:hover:not(:disabled) { background: #0369A1; }

        .cn-btn-outline {
          border-color: var(--cn-border);
          background: var(--cn-surface);
          color: var(--cn-text) !important;
        }
        .cn-btn-outline:hover { border-color: var(--cn-accent); }

        .cn-card {
          background: var(--cn-surface);
          border: 1px solid var(--cn-border);
          border-radius: 17px;
          box-shadow: var(--cn-shadow);
        }
        .cn-card h3 { color: var(--cn-text); }
        .cn-card p { color: var(--cn-muted); }

        .cn-icon {
          display: grid;
          place-items: center;
          width: 45px;
          height: 45px;
          border-radius: 12px;
          background: var(--cn-accent-soft);
          color: var(--cn-accent);
          flex-shrink: 0;
        }

        .cn-grid-two {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 16px;
        }
        .cn-grid-three {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 15px;
        }
        .cn-grid-four {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 14px;
        }

        /* HERO */

        .cn-hero {
          position: relative;
          padding: 94px 0 45px;
          overflow: hidden;
          background: var(--cn-surface);
          border-bottom: 1px solid var(--cn-border);
        }
        .cn-hero::before {
          content: "";
          position: absolute;
          width: 470px;
          height: 470px;
          right: -145px;
          top: -235px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(14,165,233,.14), transparent 68%);
          pointer-events: none;
        }

        .cn-hero-grid {
          display: grid;
          grid-template-columns: minmax(0,1.1fr) minmax(280px,.9fr);
          align-items: center;
          gap: 43px;
        }

        .cn-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 11px;
          border: 1px solid var(--cn-accent-border);
          border-radius: 7px;
          background: var(--cn-accent-soft);
          color: var(--cn-accent);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .10em;
        }

        .cn-hero h1 {
          max-width: 660px;
          margin: 18px 0;
          font-size: clamp(36px,5vw,63px);
          line-height: 1.065;
          font-weight: 900;
          letter-spacing: -.06em;
        }
        .cn-hero h1 span { color: var(--cn-accent-bright); }

        .cn-hero-copy {
          max-width: 590px;
          color: var(--cn-muted);
          font-size: 14px;
          line-height: 1.82;
        }

        .cn-hero-bullets {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 11px;
          margin-top: 21px;
        }
        .cn-hero-bullets > div {
          display: flex;
          align-items: start;
          gap: 8px;
          font-size: 12px;
          line-height: 1.55;
          font-weight: 750;
          color: var(--cn-muted);
        }
        .cn-hero-bullets svg { flex-shrink: 0; color: var(--cn-accent); }

        .cn-hero-purchase {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 17px;
          margin-top: 25px;
        }
        .cn-hero-price small {
          display: block;
          margin-bottom: 4px;
          color: var(--cn-subtle);
          font-size: 10px;
          font-weight: 850;
          letter-spacing: .05em;
        }

        .cn-price-display {
          display: flex;
          align-items: baseline;
          gap: 9px;
          flex-wrap: wrap;
        }
        .cn-price-display strong {
          font-family: "Manrope",sans-serif;
          color: var(--cn-text);
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -.05em;
        }
        .cn-price-display del { color: var(--cn-subtle); font-size: 13px; }

        .cn-discount {
          align-self: center;
          padding: 5px 7px;
          border-radius: 6px;
          background: var(--cn-accent-soft);
          color: var(--cn-accent);
          font-size: 10px;
          font-weight: 900;
        }

        .cn-price-skeleton { display: flex; gap: 9px; }
        .cn-price-skeleton span {
          width: 95px;
          height: 25px;
          border-radius: 7px;
          background: var(--cn-soft);
          animation: cnPulse 1.4s infinite;
        }
        .cn-price-skeleton span:last-child { width: 60px; height: 17px; }

        .cn-price-unavailable {
          color: var(--cn-muted);
          font-size: 12px;
          font-weight: 800;
        }

        .cn-hero-secondary {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 18px;
          margin-top: 17px;
        }
        .cn-hero-secondary a {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 32px;
          color: var(--cn-accent) !important;
          font-size: 12px;
          font-weight: 850;
        }
        .cn-hero-secondary span { color: var(--cn-muted); font-size: 11px; }

        /* COVER */

        .cn-cover-stage {
          position: relative;
          min-height: 410px;
          display: grid;
          place-items: center;
          perspective: 900px;
        }
        .cn-cover-orbit {
          position: absolute;
          border: 1px solid var(--cn-accent-border);
          border-radius: 50%;
          opacity: .5;
        }
        .cn-orbit-one { width: 340px; height: 340px; }
        .cn-orbit-two { width: 260px; height: 260px; }

        .cn-book-cover {
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
          background: linear-gradient(145deg, #07121F, #0E2A47 65%, #0369A1);
          box-shadow: 22px 26px 44px rgba(0,0,0,.28), inset 6px 0 rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.16);
          transform: rotateY(-9deg) rotateZ(-2deg);
          transition: transform .35s;
        }
        .cn-cover-stage:hover .cn-book-cover {
          transform: rotateY(-2deg) rotateZ(0);
        }
        .cn-actual-cover {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .cn-book-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          color: #7DD3FC;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .1em;
        }
        .cn-book-illustration {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
        }
        .cn-book-illustration svg { width: 100%; }
        .cn-book-kicker {
          color: #A5D8F5;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .08em;
        }
        .cn-book-content h2 {
          margin: 10px 0;
          color: #FFF;
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -.045em;
          line-height: 1.08;
        }
        .cn-book-content h2 span {
          display: block;
          color: #38BDF8;
          font-size: 24px;
          margin-top: 4px;
        }
        .cn-book-content p {
          color: #B7DDF3;
          font-size: 9px;
          line-height: 1.6;
          margin: 0;
        }
        .cn-book-rule {
          width: 46px;
          height: 2px;
          margin: 13px 0 9px;
          background: #0EA5E9;
        }
        .cn-book-content small {
          color: #B7DDF3;
          font-size: 7px;
          font-weight: 850;
          letter-spacing: .1em;
        }

        .cn-cover-float {
          position: absolute;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 12px;
          border: 1px solid var(--cn-accent-border);
          border-radius: 10px;
          background: var(--cn-surface);
          box-shadow: var(--cn-shadow);
          color: var(--cn-text);
          font-size: 10px;
          font-weight: 850;
        }
        .cn-cover-float svg { color: var(--cn-accent); }
        .cn-cover-float-one { right: 1%; top: 17%; }
        .cn-cover-float-two { left: 1%; bottom: 15%; }

        /* TRUST */

        .cn-trust-strip {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 15px;
          padding: 20px 0;
        }
        .cn-trust-item {
          display: flex;
          align-items: center;
          gap: 9px;
          color: var(--cn-muted);
          font-size: 12px;
          font-weight: 750;
        }
        .cn-trust-item svg { color: var(--cn-accent); flex-shrink: 0; }

        /* QUICK ANSWERS (AEO) */

        .cn-quick-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 14px;
        }
        .cn-quick-answer { padding: 22px; }
        .cn-quick-answer h3 {
          margin: 0 0 9px;
          font-size: 16px;
          font-weight: 850;
          letter-spacing: -.02em;
          line-height: 1.35;
        }
        .cn-quick-answer p {
          margin: 0;
          font-size: 13px;
          line-height: 1.75;
        }

        /* PIPELINES */

        .cn-pipeline-card {
          padding: 24px;
          border: 1px solid var(--cn-border);
          border-radius: 17px;
          background: var(--cn-surface);
          box-shadow: var(--cn-shadow);
          min-width: 0;
        }
        .cn-pipeline-header { display: flex; align-items: center; gap: 12px; }
        .cn-pipeline-number {
          color: var(--cn-accent);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .12em;
        }
        .cn-pipeline-header h3 {
          margin: 5px 0 0;
          color: var(--cn-text);
          font-size: 18px;
          font-weight: 850;
          line-height: 1.25;
          letter-spacing: -.025em;
        }
        .cn-pipeline-description {
          margin: 18px 0 0;
          color: var(--cn-muted);
          font-size: 13px;
          line-height: 1.8;
        }
        .cn-pipeline-steps {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 22px;
          min-width: 0;
        }
        .cn-pipeline-step {
          display: flex;
          flex: 1;
          align-items: center;
          flex-direction: column;
          justify-content: center;
          gap: 8px;
          min-width: 0;
          min-height: 76px;
          padding: 10px 4px;
          border: 1px solid var(--cn-border);
          border-radius: 9px;
          background: var(--cn-soft);
          text-align: center;
        }
        .cn-pipeline-step svg, .cn-pipeline-arrow {
          color: var(--cn-accent);
          flex-shrink: 0;
        }
        .cn-pipeline-step span {
          font-size: 10px;
          font-weight: 850;
          color: var(--cn-text);
          overflow-wrap: anywhere;
        }
        .cn-pipeline-note {
          display: flex;
          gap: 9px;
          align-items: flex-start;
          margin-top: 19px;
          padding: 13px;
          border-radius: 10px;
          background: var(--cn-accent-soft);
          border: 1px solid var(--cn-accent-border);
          color: var(--cn-muted);
          font-size: 12px;
          line-height: 1.65;
        }
        .cn-pipeline-note svg { flex-shrink: 0; color: var(--cn-accent); }

        /* FEATURES */

        .cn-feature-card { padding: 22px; transition: transform .2s, border-color .2s; }
        .cn-feature-card:hover { transform: translateY(-4px); border-color: var(--cn-accent); }
        .cn-feature-card h3 {
          margin: 18px 0 9px;
          font-size: 16px;
          font-weight: 850;
          letter-spacing: -.025em;
        }
        .cn-feature-card p { margin: 0; font-size: 13px; line-height: 1.75; }

        .cn-audience-points { display: grid; gap: 10px; margin-top: 20px; }
        .cn-audience-points span {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          color: var(--cn-muted);
          font-size: 12px;
          line-height: 1.6;
        }
        .cn-audience-points svg { color: var(--cn-accent); flex-shrink: 0; }

        /* CURRICULUM */

        .cn-curriculum-layout {
          display: grid;
          grid-template-columns: 260px minmax(0,1fr);
          gap: 22px;
        }
        .cn-curriculum-sidebar {
          position: sticky;
          top: 90px;
          height: max-content;
          display: grid;
          gap: 8px;
        }
        .cn-curriculum-tab {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          min-height: 52px;
          padding: 14px;
          border: 1px solid var(--cn-border);
          border-radius: 10px;
          background: var(--cn-surface);
          color: var(--cn-muted);
          text-align: left;
          cursor: pointer;
          transition: background .2s, border-color .2s;
        }
        .cn-curriculum-tab.active {
          background: var(--cn-accent-soft);
          border-color: var(--cn-accent-border);
        }
        .cn-curriculum-tab > span:first-child {
          color: var(--cn-accent);
          font-size: 11px;
          font-weight: 900;
        }
        .cn-curriculum-tab strong {
          display: block;
          color: var(--cn-text);
          font-size: 12px;
          font-weight: 850;
        }
        .cn-curriculum-tab small {
          display: block;
          color: var(--cn-muted);
          font-size: 10px;
          line-height: 1.5;
          margin-top: 4px;
        }

        .cn-search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 48px;
          padding: 0 14px;
          margin-bottom: 15px;
          background: var(--cn-surface);
          border: 1px solid var(--cn-border);
          border-radius: 10px;
          color: var(--cn-muted);
        }
        .cn-search-box input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: none;
          flex: 1;
          color: var(--cn-text);
          background: transparent;
          font-size: 16px; /* prevents iOS zoom-on-focus */
        }
        .cn-search-box input::placeholder { color: var(--cn-subtle); font-size: 13px; }
        .cn-clear-btn {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border: 0;
          background: transparent;
          color: var(--cn-muted);
          cursor: pointer;
        }

        .cn-chapter-list {
          border: 1px solid var(--cn-border);
          border-radius: 14px;
          background: var(--cn-surface);
          overflow: hidden;
        }
        .cn-chapter {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 18px;
          border-bottom: 1px solid var(--cn-border);
        }
        .cn-chapter:last-child { border-bottom: 0; }
        .cn-chapter > div { min-width: 0; }
        .cn-chapter-number {
          display: grid;
          place-items: center;
          width: 37px;
          height: 37px;
          border-radius: 10px;
          background: var(--cn-accent-soft);
          color: var(--cn-accent);
          font-size: 11px;
          font-weight: 900;
          flex-shrink: 0;
        }
        .cn-chapter h3 { margin: 0; color: var(--cn-text); font-size: 15px; font-weight: 850; }
        .cn-chapter p { margin: 7px 0 0; color: var(--cn-muted); font-size: 13px; line-height: 1.7; }

        .cn-section-list {
          list-style: none;
          margin: 12px 0 0;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .cn-section-list li {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 9px;
          border: 1px solid var(--cn-border);
          border-radius: 7px;
          background: var(--cn-soft);
          color: var(--cn-muted);
          font-size: 11.5px;
          font-weight: 700;
          line-height: 1.4;
        }
        .cn-section-list li b { color: var(--cn-accent); font-weight: 900; }

        /* TABLES */

        .cn-table-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border: 1px solid var(--cn-border);
          border-radius: 15px;
          background: var(--cn-surface);
        }
        .cn-table {
          width: 100%;
          min-width: 640px;
          border-collapse: collapse;
          text-align: left;
        }
        .cn-table caption {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
        }
        .cn-table th {
          padding: 15px 17px;
          color: var(--cn-muted);
          background: var(--cn-soft);
          font-size: 10px;
          letter-spacing: .08em;
          font-weight: 900;
          text-transform: uppercase;
        }
        .cn-table td {
          padding: 16px 17px;
          color: var(--cn-muted);
          font-size: 13px;
          line-height: 1.6;
          border-top: 1px solid var(--cn-border);
        }
        .cn-table td:first-child { color: var(--cn-text); font-weight: 850; }
        .cn-table tr:hover td { background: var(--cn-soft); }
        .cn-table-type {
          display: inline-block;
          padding: 5px 9px;
          color: var(--cn-accent);
          background: var(--cn-accent-soft);
          border-radius: 7px;
          font-size: 11px;
          font-weight: 750;
        }
        .cn-table-hint {
          display: none;
          margin: 0 0 8px;
          color: var(--cn-subtle);
          font-size: 11px;
        }

        .cn-compare-grid {
          display: grid;
          grid-template-columns: minmax(0,1.5fr) minmax(0,1fr);
          gap: 18px;
          align-items: start;
        }

        /* CODE */

        .cn-code-tabs {
          display: flex;
          gap: 7px;
          margin-bottom: 15px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .cn-code-tabs::-webkit-scrollbar { display: none; }
        .cn-code-tab {
          flex-shrink: 0;
          min-height: 42px;
          padding: 9px 14px;
          border: 1px solid var(--cn-border);
          border-radius: 8px;
          background: var(--cn-surface);
          color: var(--cn-muted);
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
        }
        .cn-code-tab.active {
          background: var(--cn-accent-bright);
          border-color: var(--cn-accent-bright);
          color: white;
        }
        .cn-code-layout {
          display: grid;
          grid-template-columns: minmax(0,.72fr) minmax(0,1.28fr);
          gap: 18px;
        }
        .cn-code-intro { padding: 25px; display: flex; flex-direction: column; }
        .cn-code-intro h3 {
          margin: 18px 0 10px;
          color: var(--cn-text);
          font-size: 20px;
          font-weight: 850;
          letter-spacing: -.035em;
        }
        .cn-code-intro p { color: var(--cn-muted); font-size: 13px; line-height: 1.8; margin: 0; }

        .cn-code-window {
          background: var(--cn-code-bg);
          border: 1px solid #1F2C3B;
          border-radius: 14px;
          overflow: hidden;
          min-width: 0;
        }
        .cn-code-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 15px;
          background: #111A26;
          border-bottom: 1px solid #1F2C3B;
          color: #C5D3E2;
          font-size: 11px;
        }
        .cn-code-dots { display: flex; gap: 5px; }
        .cn-code-dots i { width: 8px; height: 8px; border-radius: 50%; background: #0EA5E9; }
        .cn-code-dots i:nth-child(2) { background: #7DD3FC; }
        .cn-code-dots i:nth-child(3) { background: #5B6E84; }
        .cn-copy-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 32px;
          padding: 5px 10px;
          border: 1px solid #2E3F52;
          border-radius: 6px;
          background: transparent;
          color: #DCE6F0;
          font-size: 11px;
          cursor: pointer;
        }
        .cn-code-window pre {
          margin: 0;
          padding: 20px;
          max-height: 430px;
          overflow: auto;
          -webkit-overflow-scrolling: touch;
          color: #E6EEF7;
          font-size: 12px;
          line-height: 1.85;
          tab-size: 4;
        }

        /* FAQ */

        .cn-faq-grid {
          display: grid;
          grid-template-columns: minmax(240px,.67fr) minmax(0,1.33fr);
          align-items: start;
          gap: 38px;
        }
        .cn-faq-list { display: grid; gap: 10px; }
        .cn-faq-item {
          border: 1px solid var(--cn-border);
          border-radius: 12px;
          background: var(--cn-surface);
          overflow: hidden;
        }
        .cn-faq-item h3 { margin: 0; font-size: inherit; }
        .cn-faq-item button {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          width: 100%;
          min-height: 52px;
          padding: 15px 17px;
          border: 0;
          background: transparent;
          color: var(--cn-text);
          text-align: left;
          font-size: 13px;
          font-weight: 850;
          line-height: 1.45;
          cursor: pointer;
        }
        .cn-faq-answer {
          padding: 0 17px 17px;
          color: var(--cn-muted);
          font-size: 13px;
          line-height: 1.8;
        }

        /* FINAL CTA */

        .cn-final-cta {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          padding: 34px;
          border-radius: 20px;
          background: #0B1624;
          color: white;
          overflow: hidden;
        }
        .cn-final-cta::before {
          content: "";
          position: absolute;
          width: 250px;
          height: 250px;
          top: -140px;
          right: -115px;
          border: 1px solid rgba(14,165,233,.3);
          border-radius: 50%;
          box-shadow: 0 0 0 36px rgba(14,165,233,.05);
        }
        .cn-final-cta h2 {
          position: relative;
          margin: 0;
          font-size: clamp(23px,3vw,34px);
          line-height: 1.18;
          letter-spacing: -.045em;
          font-weight: 850;
        }
        .cn-final-cta p {
          position: relative;
          max-width: 650px;
          margin: 12px 0 0;
          font-size: 13px;
          line-height: 1.8;
          color: #AFC3D6;
        }
        .cn-final-actions {
          position: relative;
          display: flex;
          align-items: center;
          gap: 18px;
          flex-shrink: 0;
        }
        .cn-final-price strong {
          font-family: "Manrope",sans-serif;
          font-size: 26px;
          font-weight: 900;
          color: #FFF;
        }
        .cn-final-price del { margin-left: 8px; color: #8CA2B8; font-size: 12px; }

        .cn-error {
          margin-top: 15px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #FFF1F2;
          border: 1px solid #FECACA;
          color: #B91C1C;
          font-size: 12px;
          line-height: 1.6;
        }
        .cn-error button {
          background: transparent;
          border: 0;
          margin-left: 7px;
          min-height: 32px;
          color: inherit;
          text-decoration: underline;
          cursor: pointer;
          font-weight: 850;
        }

        .cn-mobile-buy { display: none; }

        @keyframes cnPulse { 50% { opacity: .45; } }

        @media(max-width: 1060px) {
          .cn-grid-four { grid-template-columns: repeat(2,1fr); }
          .cn-grid-three { grid-template-columns: repeat(2,1fr); }
          .cn-pipeline-steps { flex-wrap: wrap; }
          .cn-compare-grid { grid-template-columns: 1fr; }
        }

        @media(max-width: 850px) {
          .cn-hero-grid { grid-template-columns: 1fr; gap: 16px; }
          .cn-cover-stage { min-height: 360px; }
          .cn-book-cover { width: 230px; }
          .cn-curriculum-layout { grid-template-columns: 1fr; }
          .cn-curriculum-sidebar {
            position: static;
            display: flex;
            overflow-x: auto;
            gap: 8px;
            padding-bottom: 4px;
            scrollbar-width: none;
          }
          .cn-curriculum-sidebar::-webkit-scrollbar { display: none; }
          .cn-curriculum-tab { flex: 0 0 auto; width: auto; min-width: 190px; }
          .cn-curriculum-tab svg { display: none; }
          .cn-code-layout { grid-template-columns: 1fr; }
          .cn-faq-grid { grid-template-columns: 1fr; gap: 20px; }
          .cn-trust-strip { grid-template-columns: repeat(2,1fr); }
          .cn-quick-grid { grid-template-columns: 1fr; }
          .cn-table-hint { display: block; }
        }

        @media(max-width: 600px) {
          .cn-shell { width: calc(100% - 32px); }
          .cn-section { padding: 44px 0; }
          .cn-section-heading { flex-direction: column; align-items: flex-start; margin-bottom: 22px; }
          .cn-hero { padding: 84px 0 24px; }
          .cn-hero h1 { font-size: 36px; }
          .cn-hero-bullets { grid-template-columns: 1fr; }
          .cn-hero-purchase { flex-direction: column; align-items: flex-start; }
          .cn-hero-purchase .cn-btn { width: 100%; }
          .cn-cover-stage { min-height: 320px; }
          .cn-orbit-one { width: 280px; height: 280px; }
          .cn-orbit-two { width: 220px; height: 220px; }
          .cn-book-cover { width: 195px; padding: 16px; }
          .cn-cover-float { display: none; }
          .cn-grid-two, .cn-grid-three, .cn-grid-four { grid-template-columns: 1fr; }
          .cn-pipeline-card { padding: 18px; }
          .cn-pipeline-steps { flex-direction: column; align-items: stretch; }
          .cn-pipeline-step { flex-direction: row; justify-content: flex-start; min-height: 48px; padding: 10px 14px; text-align: left; }
          .cn-pipeline-arrow { transform: rotate(90deg); align-self: center; }
          .cn-chapter { padding: 15px; gap: 12px; }
          .cn-code-intro { padding: 20px; }
          .cn-code-window pre { padding: 15px; font-size: 11.5px; max-height: 360px; }
          .cn-final-cta { padding: 25px; flex-direction: column; align-items: flex-start; }
          .cn-final-actions { width: 100%; flex-direction: column; align-items: stretch; }
          .cn-final-actions .cn-btn { width: 100%; }

          .cn-mobile-buy {
            position: fixed;
            z-index: 45;
            bottom: 0;
            left: 0;
            right: 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
            border-top: 1px solid var(--cn-border);
            background: var(--cn-surface);
            box-shadow: 0 -10px 30px rgba(0,0,0,.12);
          }
          .cn-mobile-price small { display: block; font-size: 9px; color: var(--cn-muted); }
          .cn-mobile-price strong {
            font-family: "Manrope",sans-serif;
            font-weight: 900;
            font-size: 18px;
            color: var(--cn-text);
          }
          .cnPage { padding-bottom: calc(78px + env(safe-area-inset-bottom)); }
        }

        @media(prefers-reduced-motion: reduce) {
          .cnPage *, .cnPage *::before, .cnPage *::after {
            transition-duration: .01ms !important;
            animation-duration: .01ms !important;
          }
        }
      `}</style>

      <main className="cnPage" data-theme={isDark ? "dark" : "light"}>
        {/* HERO */}
        <section className="cn-hero">
          <div className="cn-shell cn-hero-grid">
            <div>
              <span className="cn-hero-badge">
                <Sparkles size={13} />
                TARGET TREK · CS CORE SERIES
              </span>

              <h1>
                Master
                <br />
                Computer <span>Networks.</span>
              </h1>

              <p className="cn-hero-copy">
                {product?.shortDescription ||
                  product?.subtitle ||
                  "The complete placement handbook for students, interview candidates and working engineers. Learn OSI and TCP/IP, subnetting, routing, TCP congestion control, DNS, HTTP and TLS, then practise with 25 solved numericals and interview Q&A."}
              </p>

              <div className="cn-hero-bullets">
                {[
                  "For students and GATE prep",
                  "For campus and job interviews",
                  "For working professionals",
                  "25 solved numericals + cheat-sheets",
                ].map((item) => (
                  <div key={item}>
                    <CheckCircle2 size={15} />
                    {item}
                  </div>
                ))}
              </div>

              <div className="cn-hero-purchase">
                <div className="cn-hero-price">
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
                  className="cn-btn cn-btn-primary"
                >
                  Get the ebook
                  <ArrowUpRight size={16} />
                </button>
              </div>

              <div className="cn-hero-secondary">
                <a href="#curriculum">
                  Explore {TOTAL_CHAPTERS} chapters
                  <ArrowDown size={14} />
                </a>

                <span>
                  Digital ebook · Concepts + numericals + interview Q&amp;A
                </span>
              </div>

              {productError && (
                <div className="cn-error" role="alert">
                  {productError}

                  <button type="button" onClick={retryProduct}>
                    Retry
                  </button>
                </div>
              )}
            </div>

            <CNBookCover coverUrl={coverImage} />
          </div>
        </section>

        {/* TRUST STRIP */}
        <div className="cn-shell cn-trust-strip">
          {[
            [BookOpen, `${TOTAL_CHAPTERS} focused chapters`],
            [Workflow, "25 solved numericals"],
            [Target, "Interview + scenario Q&A"],
            [FileText, "Formula + port cheat-sheets"],
          ].map(([Icon, label]) => (
            <div key={label} className="cn-trust-item">
              <Icon size={18} />
              {label}
            </div>
          ))}
        </div>

        {/* QUICK ANSWERS (AEO) */}
        <section className="cn-section cn-section-alt">
          <div className="cn-shell">
            <SectionHeading
              eyebrow="QUICK ANSWERS"
              title="The four Computer Networks questions everyone asks."
              description="Short, interview-ready answers. The book expands each one with diagrams, header formats and worked examples."
            />

            <div className="cn-quick-grid">
              {QUICK_ANSWERS.map((item) => (
                <article
                  key={item.question}
                  className="cn-card cn-quick-answer"
                >
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* AUDIENCE */}
        <section className="cn-section">
          <div className="cn-shell">
            <SectionHeading
              eyebrow="WHO IS THIS BOOK FOR"
              title="Written for exams, interviews and real networks."
              description="Whether you are sitting a semester exam, preparing for a placement drive, or debugging a production outage, this book meets you where you are."
            />

            <div className="cn-grid-three">
              {AUDIENCES.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="cn-card cn-feature-card"
                  >
                    <div className="cn-icon">
                      <Icon size={22} />
                    </div>

                    <h3>{item.title}</h3>
                    <p>{item.description}</p>

                    <div className="cn-audience-points">
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
        <section className="cn-section cn-section-alt">
          <div className="cn-shell">
            <SectionHeading
              eyebrow="CORE MENTAL MODELS"
              title="Two flows explain most of networking."
              description="Almost every question reduces to how data is wrapped layer by layer, and how a request travels from a name to a server."
            />

            <div className="cn-grid-two">
              <PipelineCard
                number="01"
                title="Encapsulation down the stack"
                icon={Layers3}
                description="Each layer adds its own header as data moves down the sender's stack, and the receiver strips them in reverse order."
                steps={[
                  { icon: FileText, label: "Data" },
                  { icon: Zap, label: "Segment" },
                  { icon: Network, label: "Packet" },
                  { icon: Server, label: "Frame" },
                  { icon: Cpu, label: "Bits" },
                ]}
                note="Port numbers live in the segment, IP addresses in the packet, MAC addresses in the frame. Knowing this answers a whole class of questions."
              />

              <PipelineCard
                number="02"
                title="From URL to web page"
                icon={Globe}
                description="Loading a page chains DNS, TCP, TLS and HTTP together. Each step has its own latency and its own failure modes."
                steps={[
                  { icon: Search, label: "DNS" },
                  { icon: RefreshCw, label: "TCP" },
                  { icon: LockKeyhole, label: "TLS" },
                  { icon: ArrowRight, label: "HTTP" },
                  { icon: CheckCircle2, label: "Render" },
                ]}
                note="Most 'the website will not load' problems are isolated by checking these four steps in order, exactly the checklist in Chapter 10."
              />
            </div>
          </div>
        </section>

        {/* LAYER TABLE */}
        <section className="cn-section" id="layers">
          <div className="cn-shell">
            <SectionHeading
              eyebrow="OSI & TCP/IP AT A GLANCE"
              title="What each layer sends, addresses and runs."
              description="A preview of the layer summary table from Chapter 2."
            />

            <p className="cn-table-hint">Swipe the table sideways to see all columns.</p>

            <div className="cn-table-wrap">
              <table className="cn-table">
                <caption>OSI and TCP/IP layers with PDU, address and examples</caption>
                <thead>
                  <tr>
                    <th scope="col">Layer</th>
                    <th scope="col">TCP/IP layer</th>
                    <th scope="col">PDU</th>
                    <th scope="col">Address</th>
                    <th scope="col">Examples</th>
                  </tr>
                </thead>

                <tbody>
                  {LAYERS.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td>
                        <span className="cn-table-type">{item.tcpip}</span>
                      </td>
                      <td>{item.pdu}</td>
                      <td>{item.address}</td>
                      <td>{item.examples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* KEY CONCEPTS */}
        <section className="cn-section cn-section-alt">
          <div className="cn-shell">
            <SectionHeading
              eyebrow="WHAT YOU WILL MASTER"
              title="Every topic interviewers and examiners return to."
              description="From bits on the wire to TLS certificates, each area is explained with intuition, diagrams and worked examples."
            />

            <div className="cn-grid-four">
              {[
                {
                  icon: Layers3,
                  title: "OSI & TCP/IP",
                  description:
                    "Layered design, encapsulation and addresses at every layer.",
                },
                {
                  icon: Cpu,
                  title: "Physical & Link",
                  description:
                    "Nyquist, Shannon, line coding, framing, CRC, ARQ and MAC protocols.",
                },
                {
                  icon: Network,
                  title: "IP & Subnetting",
                  description:
                    "IPv4, VLSM, CIDR, fragmentation, ICMP, DHCP, NAT and IPv6.",
                },
                {
                  icon: Router,
                  title: "Routing",
                  description:
                    "Distance vector, link state, OSPF and BGP explained step by step.",
                },
                {
                  icon: RefreshCw,
                  title: "TCP & UDP",
                  description:
                    "Handshake, flow control, congestion control and RTT estimation.",
                },
                {
                  icon: Globe,
                  title: "DNS, HTTP, Email",
                  description:
                    "Name resolution, HTTP versions and methods, SMTP, POP3 and IMAP.",
                },
                {
                  icon: ShieldCheck,
                  title: "Network Security",
                  description:
                    "Cryptography, TLS/HTTPS, firewalls, IDS/IPS, VPNs and attacks.",
                },
                {
                  icon: Wifi,
                  title: "Wi-Fi & Infra",
                  description:
                    "802.11, load balancers, proxies, CDNs and debugging tools.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    className="cn-card cn-feature-card"
                    key={item.title}
                  >
                    <div className="cn-icon">
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
          className="cn-section"
          id="curriculum"
          style={{ scrollMarginTop: 90 }}
        >
          <div className="cn-shell">
            <SectionHeading
              eyebrow="COMPLETE BOOK CONTENTS"
              title={`${TOTAL_CHAPTERS} chapters. Five learning stages.`}
              description="Progress from network basics and the layered models to IP and routing, transport and application protocols, security, and finally numericals and rapid revision."
            />

            <div className="cn-curriculum-layout">
              <div className="cn-curriculum-sidebar" role="tablist">
                {CURRICULUM.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    role="tab"
                    aria-selected={activeCurriculum === group.id}
                    className={`cn-curriculum-tab ${
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
                  </button>
                ))}
              </div>

              <div style={{ minWidth: 0 }}>
                <div className="cn-search-box">
                  <Search size={17} />

                  <input
                    type="search"
                    value={chapterSearch}
                    onChange={(event) =>
                      setChapterSearch(event.target.value)
                    }
                    placeholder="Search: subnetting, TCP, DNS, OSPF..."
                    aria-label="Search computer network chapters"
                  />

                  {chapterSearch && (
                    <button
                      type="button"
                      className="cn-clear-btn"
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
                          fontSize: 13,
                          margin: "6px 0 0",
                          color: "var(--cn-muted)",
                        }}
                      >
                        {group.subtitle}
                      </p>
                    </div>

                    <div className="cn-chapter-list">
                      {group.chapters.map((chapter) => (
                        <article key={chapter.n} className="cn-chapter">
                          <span className="cn-chapter-number">
                            {chapter.n}
                          </span>

                          <div>
                            <h3>{chapter.title}</h3>
                            <p>{chapter.details}</p>

                            <ol className="cn-section-list">
                              {chapter.sections.map((section, idx) => (
                                <li key={section}>
                                  <b>
                                    {Number(chapter.n)}.{idx + 1}
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
                    className="cn-card"
                    style={{ padding: 30, textAlign: "center" }}
                  >
                    <Search
                      size={23}
                      style={{
                        color: "var(--cn-accent)",
                        margin: "0 auto",
                      }}
                    />

                    <p style={{ fontSize: 13, marginTop: 12 }}>
                      No chapters match your search.
                    </p>

                    <button
                      type="button"
                      className="cn-btn cn-btn-outline"
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

        {/* TCP vs UDP */}
        <section className="cn-section cn-section-alt">
          <div className="cn-shell">
            <SectionHeading
              eyebrow="TRANSPORT LAYER PREVIEW"
              title="TCP vs UDP: pick the right protocol."
              description="The most common networking interview question, answered in one table. Chapter 7 goes deep on handshakes, windows and congestion control."
            />

            <p className="cn-table-hint">Swipe the table sideways to see all columns.</p>

            <div className="cn-table-wrap">
              <table className="cn-table" style={{ minWidth: 560 }}>
                <caption>TCP compared with UDP</caption>
                <thead>
                  <tr>
                    <th scope="col">Feature</th>
                    <th scope="col">TCP</th>
                    <th scope="col">UDP</th>
                  </tr>
                </thead>

                <tbody>
                  {TRANSPORTS.map((item) => (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td>{item.tcp}</td>
                      <td>{item.udp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CODE EXAMPLES */}
        <section className="cn-section" id="code-examples">
          <div className="cn-shell">
            <SectionHeading
              eyebrow="LEARN BY RUNNING CODE"
              title="See the concepts work in real code."
              description="Short, runnable Python and shell examples that turn subnetting, capacity formulas and TCP into things you can execute and modify."
            />

            <div className="cn-code-tabs" role="tablist">
              {CODE_EXAMPLES.map((example) => (
                <button
                  key={example.id}
                  type="button"
                  role="tab"
                  aria-selected={activeCode === example.id}
                  className={`cn-code-tab ${
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

            <div className="cn-code-layout">
              <div className="cn-card cn-code-intro">
                <div className="cn-icon">
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
                    "Runnable Python and shell",
                    "Mapped to book chapters",
                    "Interview-friendly explanations",
                  ].map((item) => (
                    <span
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        color: "var(--cn-muted)",
                        fontSize: 12,
                      }}
                    >
                      <CheckCircle2
                        size={15}
                        style={{ color: "var(--cn-accent)", flexShrink: 0 }}
                      />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="cn-code-window">
                <div className="cn-code-toolbar">
                  <div className="cn-code-dots">
                    <i />
                    <i />
                    <i />
                  </div>

                  <span>{selectedCode.filename}</span>

                  <button
                    type="button"
                    className="cn-copy-button"
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
        <section className="cn-section cn-section-alt">
          <div className="cn-shell">
            <div
              className="cn-card"
              style={{ padding: "clamp(20px,4vw,39px)" }}
            >
              <div className="cn-grid-two">
                <div>
                  <span className="cn-eyebrow">
                    <i />
                    INTERVIEW &amp; PLACEMENT READY
                  </span>

                  <h2
                    style={{
                      fontSize: "clamp(24px,3vw,38px)",
                      letterSpacing: "-.045em",
                      lineHeight: 1.2,
                      margin: "15px 0",
                    }}
                  >
                    Can you explain what happens when you type a URL?
                  </h2>

                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: 1.85,
                      color: "var(--cn-muted)",
                    }}
                  >
                    Move beyond memorised definitions. Learn to answer
                    the classic questions confidently: TCP vs UDP, how
                    subnetting works, how DNS resolves a name, how TLS
                    secures a connection, and how congestion control
                    reacts to packet loss.
                  </p>

                  <a
                    href="#curriculum"
                    className="cn-btn cn-btn-primary"
                    style={{ marginTop: 20 }}
                    onClick={() => {
                      setChapterSearch("");
                      setActiveCurriculum("practice");
                    }}
                  >
                    Explore practice chapters
                    <ArrowUpRight size={16} />
                  </a>
                </div>

                <div
                  style={{
                    background: "var(--cn-soft)",
                    border: "1px solid var(--cn-border)",
                    borderRadius: 13,
                    padding: 20,
                    display: "grid",
                    gap: 14,
                    alignContent: "center",
                  }}
                >
                  {[
                    [Target, "Interview questions by topic"],
                    [Workflow, "25 solved numericals"],
                    [Clock, "Scenario-based questions"],
                    [FileText, "One-page formula sheet"],
                    [Server, "Port number cheat-sheet"],
                    [Users, "Student, fresher & professional friendly"],
                  ].map(([Icon, label]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 11,
                        fontSize: 13,
                        fontWeight: 750,
                      }}
                    >
                      <Icon
                        size={18}
                        style={{ color: "var(--cn-accent)", flexShrink: 0 }}
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
        <section className="cn-section">
          <div className="cn-shell cn-faq-grid">
            <SectionHeading
              eyebrow="FREQUENTLY ASKED QUESTIONS"
              title="Questions about the Computer Networks ebook?"
              description="Everything you need to know about who it is for, what it covers, and how you receive it."
            />

            <div className="cn-faq-list">
              {FAQS.map((faq, index) => (
                <div className="cn-faq-item" key={faq.question}>
                  <h3>
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
                          color: "var(--cn-accent)",
                          transform:
                            openFaq === index ? "rotate(180deg)" : "none",
                          transition: "transform .2s",
                        }}
                      />
                    </button>
                  </h3>

                  {/* Always in the DOM (hidden when closed) so crawlers and
                      answer engines can read every answer. */}
                  <div
                    className="cn-faq-answer"
                    hidden={openFaq !== index}
                  >
                    {faq.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL PURCHASE */}
        <section className="cn-section" style={{ paddingTop: 15 }}>
          <div className="cn-shell">
            <div className="cn-final-cta">
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#7DD3FC",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: ".11em",
                    position: "relative",
                  }}
                >
                  <Sparkles size={14} />
                  TARGET TREK · COMPUTER NETWORKS EBOOK
                </span>

                <h2 style={{ marginTop: 15 }}>
                  Go from memorising layers to truly understanding the
                  network.
                </h2>

                <p>
                  Ace your exams, crack technical interviews and debug
                  real connectivity issues with one structured book:
                  concepts, solved numericals, security and quick
                  revision in a single place.
                </p>
              </div>

              <div className="cn-final-actions">
                <div className="cn-final-price">
                  <small
                    style={{
                      display: "block",
                      color: "#9FB4C8",
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
                  className="cn-btn cn-btn-primary"
                >
                  Get the ebook
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </div>

            <p
              style={{
                margin: "15px 0 0",
                color: "var(--cn-muted)",
                fontSize: 12,
                lineHeight: 1.8,
              }}
            >
              This is a digital ebook. For payment or access
              assistance, contact{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                style={{
                  color: "var(--cn-accent)",
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
        <div className="cn-mobile-buy">
          <div className="cn-mobile-price">
            <small>COMPUTER NETWORKS EBOOK</small>

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
                  color: "var(--cn-accent)",
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
            className="cn-btn cn-btn-primary"
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
