import {
  Briefcase, Calculator, ChatsCircle, Exam, FileText, Globe, GraduationCap, ListChecks, Stack, Target, TerminalWindow,
} from "@phosphor-icons/react";

/* Content for /book/computer-network (Computer Networks: The Placement Handbook) */

const CURRICULUM = [
  { id: "foundations", number: "01", title: "Foundations & Models", subtitle: "Basics, layered models and the physical layer", chapters: [
    { n: "01", title: "Introduction & Network Basics", details: "What a network is, how networks are classified by size, topologies, transmission modes and switching, the four packet delays, and the metrics used to measure performance.",
      sections: ["What is a Computer Network?", "Types of Networks by Size", "Network Topologies", "Transmission Modes & Switching", "Delays in Packet-Switched Networks", "Network Performance Metrics"] },
    { n: "02", title: "OSI & TCP/IP Reference Models", details: "Why networks are layered, the OSI and TCP/IP models side by side, how data is encapsulated and decapsulated, and which address is used at each layer.",
      sections: ["Why Layered Architecture?", "OSI vs TCP/IP", "Encapsulation & Decapsulation", "Addresses at Each Layer"] },
    { n: "03", title: "Physical Layer", details: "Transmission media, analog vs digital signals, bandwidth and baud, channel capacity with Nyquist and Shannon, line coding and multiplexing.",
      sections: ["Transmission Media", "Analog vs Digital, Bandwidth, Baud", "Channel Capacity: Nyquist and Shannon", "Line Coding", "Multiplexing"] },
  ] },
  { id: "link-network", number: "02", title: "Link, IP & Routing", subtitle: "Frames, addresses and how packets find their way", chapters: [
    { n: "04", title: "Data Link Layer", details: "Framing and stuffing, error detection and correction, flow control with sliding-window ARQ, medium access control, and Ethernet, switches, VLANs and ARP.",
      sections: ["Responsibilities of the Data Link Layer", "Framing & Stuffing", "Error Detection and Correction", "Flow Control & ARQ Protocols", "Medium Access Control (MAC)", "Ethernet, Switches, VLANs, ARP"] },
    { n: "05", title: "Network Layer: IP, Subnetting, NAT", details: "IPv4 addressing, subnetting, VLSM, CIDR and longest prefix match, the IPv4 header and fragmentation, ICMP, DHCP, NAT and IPv6.",
      sections: ["Network Layer Functions", "IPv4 Addressing", "Subnetting", "VLSM", "CIDR, Supernetting & Longest Prefix Match", "IPv4 Header and Fragmentation", "ICMP, DHCP and NAT", "IPv6"] },
    { n: "06", title: "Routing Algorithms & Protocols", details: "Forwarding vs routing, distance vector with Bellman-Ford, link state with Dijkstra and OSPF, and BGP, the routing protocol of the internet.",
      sections: ["Forwarding vs Routing", "Distance Vector Routing (Bellman-Ford)", "Link State Routing (Dijkstra) - OSPF", "BGP - the Routing Protocol of the Internet"] },
  ] },
  { id: "transport-app", number: "03", title: "Transport & Application", subtitle: "TCP, UDP, DNS, HTTP and email", chapters: [
    { n: "07", title: "Transport Layer: TCP & UDP", details: "Process-to-process delivery, UDP, the TCP connection lifecycle, flow control, congestion control, timeouts and RTT estimation, and a clear TCP vs UDP comparison.",
      sections: ["Process-to-Process Delivery", "UDP - User Datagram Protocol", "TCP - Transmission Control Protocol", "Flow Control", "Congestion Control", "Timeouts and RTT Estimation", "TCP vs UDP"] },
    { n: "08", title: "Application Layer", details: "Client-server vs peer-to-peer, DNS resolution, HTTP versions and methods, email with SMTP, POP3 and IMAP, and other everyday application protocols.",
      sections: ["Client-Server vs Peer-to-Peer", "DNS - Domain Name System", "HTTP", "Email: SMTP, POP3, IMAP", "Other Application Protocols"] },
  ] },
  { id: "security-modern", number: "04", title: "Security & Modern Infra", subtitle: "TLS, firewalls, Wi-Fi, CDNs and debugging", chapters: [
    { n: "09", title: "Network Security Essentials", details: "Security goals, cryptography building blocks, how TLS and HTTPS use certificates, firewalls, IDS/IPS and VPNs, and common attacks with their defences.",
      sections: ["Security Goals", "Cryptography Building Blocks", "TLS / HTTPS and Certificates", "Firewalls, IDS/IPS, VPN", "Common Attacks and Defences"] },
    { n: "10", title: "Wireless, Modern Infrastructure & Tools", details: "Wi-Fi (IEEE 802.11), load balancers, proxies and CDNs, the command-line tools every engineer uses, and a step-by-step checklist for 'the website will not load'.",
      sections: ["Wi-Fi (IEEE 802.11)", "Load Balancers, Proxies, CDNs", "Command-line Tools", "Troubleshooting: \"The website will not load\""] },
  ] },
  { id: "practice", number: "05", title: "Practice & Revision", subtitle: "Solve, drill and revise before the interview", chapters: [
    { n: "11", title: "Numerical Practice Set", details: "25 numerical questions on delays, Shannon and Nyquist, CRC, sliding window, subnetting, CIDR, TCP and more, each with a full worked answer.",
      sections: ["25 questions with answers and working"] },
    { n: "12", title: "Interview Questions & Quick Revision", details: "Interview questions grouped by topic plus scenario questions, followed by a one-page formula sheet and a port number cheat-sheet.",
      sections: ["Fundamentals", "Data Link & Network Layer", "Transport Layer", "Application Layer & Web", "Security", "Scenario Questions", "One-page Formula Sheet", "Port Number Cheat-sheet"] },
  ] },
];

/* the seven OSI layers, top to bottom, for the layer explorer */
export const OSI_LAYERS = [
  { n: 7, name: "Application", tcpip: "Application", pdu: "Data", address: "—", hdr: "HTTP", cls: "h-l7",
    job: "The protocols applications speak: fetching pages, resolving names, sending mail.", protocols: ["HTTP", "DNS", "SMTP", "FTP", "SSH"], devices: "Hosts, proxies, API gateways",
    q: "Is DNS on TCP or UDP?", a: "Mostly UDP on port 53 for quick lookups. It falls back to TCP for responses too large for one datagram and for zone transfers." },
  { n: 6, name: "Presentation", tcpip: "Application", pdu: "Data", address: "—", hdr: "TLS", cls: "h-l7",
    job: "How data is represented: encoding, compression and encryption.", protocols: ["TLS", "JPEG", "UTF-8", "MIME"], devices: "Hosts",
    q: "Where does TLS sit?", a: "In OSI terms it is presentation-layer work (encryption), but in the TCP/IP model it runs between TCP and the application, so most engineers just call it part of the application layer." },
  { n: 5, name: "Session", tcpip: "Application", pdu: "Data", address: "—", hdr: null, cls: "h-l7",
    job: "Opening, keeping and closing conversations between two applications.", protocols: ["RPC", "NetBIOS", "SOCKS"], devices: "Hosts",
    q: "Why does TCP/IP have no session layer?", a: "TCP/IP folds session, presentation and application into one application layer. Applications handle sessions themselves, for example with cookies or tokens." },
  { n: 4, name: "Transport", tcpip: "Transport", pdu: "Segment / Datagram", address: "Port number", hdr: "TCP", cls: "h-l4",
    job: "Process-to-process delivery: ports, reliability, ordering, flow and congestion control.", protocols: ["TCP", "UDP", "QUIC"], devices: "Hosts, L4 load balancers",
    q: "Why a 3-way handshake and not 2?", a: "Both sides must pick and confirm an initial sequence number. With two messages the server could never know the client received its sequence number, and old duplicate SYNs could open ghost connections." },
  { n: 3, name: "Network", tcpip: "Internet", pdu: "Packet", address: "IP address", hdr: "IP", cls: "h-l3",
    job: "Logical addressing and routing packets across different networks.", protocols: ["IPv4", "IPv6", "ICMP", "OSPF", "BGP"], devices: "Routers, L3 switches",
    q: "What changes at each router hop?", a: "The IP addresses stay the same end to end (unless NAT rewrites them). The MAC addresses change on every hop, and the TTL drops by one." },
  { n: 2, name: "Data Link", tcpip: "Network Access", pdu: "Frame", address: "MAC address", hdr: "ETH", cls: "h-l2",
    job: "Delivery between neighbours on one link: framing, MAC addresses, error detection.", protocols: ["Ethernet", "Wi-Fi 802.11", "ARP", "PPP"], devices: "Switches, bridges, NICs",
    q: "What does ARP do?", a: "It finds the MAC address that belongs to an IP on the local network by broadcasting “who has this IP?” and caching the reply." },
  { n: 1, name: "Physical", tcpip: "Network Access", pdu: "Bits", address: "—", hdr: null, cls: "h-l1",
    job: "Moving raw bits over a medium as voltages, light or radio waves.", protocols: ["Copper", "Fibre", "Radio", "Line coding"], devices: "Hubs, repeaters, cables",
    q: "Bandwidth vs bit rate?", a: "Bandwidth is the range of frequencies a channel carries (Hz). Bit rate is how many bits per second you send. Nyquist and Shannon link the two." },
];

export const TCP_UDP = [
  ["Connection", "Connection-oriented (3-way handshake)", "Connectionless"],
  ["Reliability", "Acknowledgements, retransmission, ordering", "Best effort, no guarantee"],
  ["Control", "Flow control and congestion control", "None built in"],
  ["Header", "20 to 60 bytes", "8 bytes"],
  ["Used by", "HTTP/HTTPS, SSH, SMTP, FTP", "DNS, VoIP, streaming, gaming, QUIC"],
];

const SAMPLES = [
  { id: "subnet", label: "Subnetting", filename: "subnet.py", title: "Subnet a network with Python",
    description: "Split 192.168.10.0/24 into four /26 subnets and list the network, broadcast and usable host range of each, the same working you do in an exam.",
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
# ...` },
  { id: "capacity", label: "Nyquist / Shannon", filename: "capacity.py", title: "Channel capacity: Nyquist and Shannon",
    description: "Compute the maximum bit rate of a noiseless channel (Nyquist) and a noisy channel (Shannon), two formulas that appear in nearly every exam.",
    code: `import math

def nyquist(bandwidth_hz, levels):
    # noiseless channel: C = 2 * B * log2(L)
    return 2 * bandwidth_hz * math.log2(levels)

def shannon(bandwidth_hz, snr_db):
    # noisy channel: C = B * log2(1 + SNR)
    snr = 10 ** (snr_db / 10)
    return bandwidth_hz * math.log2(1 + snr)

print(nyquist(3000, 4))    # 12000.0 bps
print(shannon(3000, 30))   # ~29902 bps  (SNR = 30 dB = 1000)` },
  { id: "window", label: "Sliding window", filename: "window.py", title: "Sliding window link utilization",
    description: "Compute efficiency of Stop-and-Wait and Go-Back-N from the transmission time and propagation delay.",
    code: `def utilization(frame_bits, bandwidth_bps, prop_delay_s, window=1):
    tx = frame_bits / bandwidth_bps          # transmission time
    rtt = 2 * prop_delay_s
    u = window * tx / (tx + rtt)
    return min(u, 1.0)

# 1000-bit frame, 1 Mbps link, 20 ms one-way delay
print(utilization(1000, 1_000_000, 0.020))             # Stop-and-Wait ~ 0.024
print(utilization(1000, 1_000_000, 0.020, window=20))  # window = 20  ~ 0.48

# Window size needed to fill the pipe: 1 + 2a, where a = Tp / Tt` },
  { id: "socket", label: "TCP socket", filename: "echo_server.py", title: "A TCP echo server and client",
    description: "See the client-server model, ports and the TCP connection in about twenty lines of Python sockets.",
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
    print(c.recv(1024))                  # b'HELLO NETWORK'` },
  { id: "tools", label: "CLI toolkit", filename: "debug.sh", title: "Debug 'the website will not load'",
    description: "A layer-by-layer command sequence: link, IP, DNS, route, port and HTTP, so you can pinpoint where the failure is.",
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
curl -I https://example.com` },
];

export const CN_BOOK = {
  key: "cn",
  path: "/book/computer-network",
  crumb: "Computer Networks",
  productName: "Computer Networks: The Placement Handbook",
  seo: {
    title: "Computer Networks Ebook: Placement Handbook | Target Trek",
    description: "Master Computer Networks for exams and placements: OSI, subnetting, routing, TCP, DNS, HTTP, TLS, 25 solved numericals and interview Q&A.",
    keywords: "computer networks ebook, computer network interview questions, OSI model, TCP/IP, subnetting, VLSM, CIDR, routing algorithms, OSPF, BGP, TCP vs UDP, congestion control, DNS, HTTP, TLS, GATE computer networks, placement preparation",
    long: "The complete placement handbook for students, interview candidates and working engineers. Learn OSI and TCP/IP, subnetting, routing, TCP congestion control, DNS, HTTP and TLS, then practise with 25 solved numericals and interview Q&A.",
    category: "Computer Networks Ebook",
  },
  pill: "CS core series · PDF ebook",
  h1: <>Computer Networks, <span className="hb-mark">from bits to HTTPS.</span></>,
  lead: "The placement handbook for students, interview candidates and working engineers. OSI and TCP/IP, subnetting, routing, TCP congestion control, DNS, HTTP and TLS, then 25 solved numericals and interview Q&A to lock it in.",
  stats: [["12", "chapters"], ["25", "solved numericals"], ["7", "OSI layers, end to end"], ["1", "page formula sheet"]],
  cover: { title: "Computer Networks", subtitle: "The Placement Handbook", line: "OSI · Subnetting · TCP · DNS · TLS" },
  nav: [["answers", "Quick answers"], ["try", "Try it: OSI & subnets"], ["models", "Mental models"], ["syllabus", "Syllabus"], ["code", "Code samples"], ["bundle", "CS core set"], ["faq", "FAQ"]],
  quick: [
    { q: "What is the OSI model?", a: "The OSI model is a 7-layer reference model that splits network communication into Physical, Data Link, Network, Transport, Session, Presentation and Application layers, so each layer can be designed and debugged independently." },
    { q: "What is the difference between TCP and UDP?", a: "TCP is connection-oriented and reliable: it uses a handshake, acknowledgements, retransmission, flow and congestion control. UDP is connectionless and unreliable but faster, with no delivery guarantee, which suits DNS, streaming and gaming." },
    { q: "What happens when you type a URL in a browser?", a: "The browser resolves the domain through DNS, opens a TCP connection to the server, performs a TLS handshake for HTTPS, sends an HTTP request, receives the response and renders the page." },
    { q: "What is subnetting?", a: "Subnetting divides one IP network into smaller subnets by borrowing host bits for the network part. A /26 mask, for example, gives 4 subnets of 62 usable hosts each from a /24 block." },
  ],
  flows: {
    title: "Two flows explain most of networking",
    lead: "Almost every question reduces to how data is wrapped layer by layer, and how a request travels from a name to a server.",
    items: [
      { n: "01", title: "Encapsulation down the stack", icon: Stack, copy: "Each layer adds its own header as data moves down the sender's stack, and the receiver strips them in reverse order.",
        steps: ["Data", "Segment", "Packet", "Frame", "Bits"], note: "Port numbers live in the segment, IP addresses in the packet, MAC addresses in the frame. Knowing this answers a whole class of questions." },
      { n: "02", title: "From URL to web page", icon: Globe, copy: "Loading a page chains DNS, TCP, TLS and HTTP together. Each step has its own latency and its own failure modes.",
        steps: ["DNS", "TCP", "TLS", "HTTP", "Render"], note: "Most 'the website will not load' problems are isolated by checking these steps in order, exactly the checklist in Chapter 10." },
    ],
  },
  curriculum: CURRICULUM,
  syllabusTitle: "12 chapters, from the wire to the web",
  syllabusLead: "Five parts that follow the stack upward, then a practice set and a revision kit. Search for any topic to see where it is covered.",
  samples: SAMPLES,
  samplesTitle: "Run the concepts, not just read them",
  samplesLead: "Short programs and commands from the book. Copy them, run them, change the numbers and watch what happens.",
  forTitle: "Written for exams, interviews and real networks",
  audiences: [
    { icon: GraduationCap, title: "Students", copy: "Built around university and GATE-style syllabi. Every layer explained from zero with diagrams, worked numericals and revision tables.", points: ["Syllabus-aligned flow", "Step-by-step numericals", "Formula sheet"] },
    { icon: Target, title: "Placement prep", copy: "Computer Networks is asked in most campus and off-campus technical rounds. Practise the exact questions, with answers short enough to say aloud.", points: ["Q&A by topic", "Scenario questions", "Port cheat-sheet"] },
    { icon: Briefcase, title: "Working professionals", copy: "Understand what happens beneath your API calls. Debug DNS, TLS, latency and connectivity issues with confidence.", points: ["LBs, proxies, CDNs", "CLI debugging tools", "'Won't load' checklist"] },
  ],
  value: [
    { icon: FileText, title: "12 chapters, physical to application", copy: "Every layer explained with diagrams and tables." },
    { icon: Calculator, title: "25 solved numericals", copy: "Delays, Shannon, CRC, sliding window, subnetting, CIDR, TCP." },
    { icon: ChatsCircle, title: "Interview Q&A by topic", copy: "Plus scenario questions interviewers love." },
    { icon: ListChecks, title: "Formula sheet and port cheat-sheet", copy: "One page each, made for the night before." },
    { icon: TerminalWindow, title: "Real debugging toolkit", copy: "ping, dig, traceroute, nc, openssl and curl, in order." },
    { icon: Exam, title: "GATE and semester ready", copy: "Follows the standard university syllabus." },
  ],
  faqs: [
    { q: "Who is this Computer Networks ebook for?", a: "It is written for college students preparing for semester exams and GATE, candidates preparing for campus and off-campus placements, and working professionals who want to understand and debug the network beneath their applications." },
    { q: "Do I need prior knowledge of networking?", a: "No. The book starts with what a network is and builds layer by layer, from the physical layer up to the application layer. Basic familiarity with programming is enough." },
    { q: "Does it cover subnetting, VLSM and CIDR?", a: "Yes. Chapter 5 covers IPv4 addressing, subnetting, VLSM, CIDR, supernetting and longest prefix match with worked examples, along with ICMP, DHCP, NAT and IPv6." },
    { q: "Are there numerical problems with solutions?", a: "Yes. Chapter 11 is a practice set of 25 numerical questions with full working. Topics include delays, Nyquist and Shannon capacity, sliding window efficiency, subnetting, CIDR and TCP." },
    { q: "Does the book explain TCP congestion control?", a: "Yes. The transport layer chapter covers the TCP handshake, flow control, congestion control, timeouts and RTT estimation, and ends with a TCP vs UDP comparison." },
    { q: "Will it help in technical interviews?", a: "Yes. Chapter 12 groups interview questions by topic (fundamentals, data link and network layer, transport, application and web, security) and adds scenario questions, a one-page formula sheet and a port number cheat-sheet." },
    { q: "Does it cover security, DNS, HTTP and TLS?", a: "Yes. The Application Layer chapter covers DNS, HTTP and email protocols, and the Network Security chapter covers cryptography, TLS/HTTPS certificates, firewalls, IDS/IPS, VPNs and common attacks with defences." },
    { q: "In what format will I receive the book?", a: "It is a digital PDF ebook. After a successful payment you receive access through the same flow used for all Target Trek ebooks. For any payment or access issue, contact our support email." },
  ],
  final: {
    title: <>Know what happens <span className="hb-mark">between the click and the page.</span></>,
    line: "12 chapters, 25 solved numericals and an interview Q&A bank, in one PDF you can read anywhere.",
  },
  footLine: "Computer Networks: The Placement Handbook · Digital PDF ebook · Digital purchases are not refundable",
};
