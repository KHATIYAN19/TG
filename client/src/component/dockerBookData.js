/*
  Content for /book/docker: the two Docker PDF ebooks.
  Everything here comes from the book listings. Do not add chapters, sections or claims that are not in the books.
*/

/* one product, two PDFs: buying it gives both books */
export const PAGE_URL = "/book/docker";

export const HANDBOOK = {
  title: "Docker: The Complete Engineer's Handbook",
  tagline: "From your first container to production-grade stacks. Every command and every YAML file, with real output.",
  pages: 177,
  chapters: 25,
  parts: 8,
  diagrams: 18,
  includes: [
    "25 chapters in 8 parts",
    "18 diagrams",
    "Table of contents",
    "Command index",
    "Concept index",
    "Page numbers on every page",
  ],
};

export const CHEATSHEET = {
  title: "Docker Cheat Sheet",
  tagline: "Every important command and file in one quick reference. No index, just fast revision.",
  pages: 20,
  sections: 19,
  includes: [
    "19 sections",
    "Mostly “command | what it does” tables",
    "Every important command and file in one place",
    "Built for fast revision",
  ],
};

/* Handbook: 8 parts, 25 chapters (numbered in reading order) */
const PARTS_RAW = [
  { number: "I", title: "Foundations", chapters: [
    "What Docker is and the problem it solves",
    "Architecture: client, dockerd, containerd, runc",
    "Installing and configuring Docker",
    "Your first containers",
  ] },
  { number: "II", title: "Working with Containers", chapters: [
    "Container lifecycle and management",
    "Inspecting, debugging and monitoring",
    "Resource limits, restart policies and health checks",
  ] },
  { number: "III", title: "Images, Dockerfile and Builds", chapters: [
    "Images and registries",
    "The Dockerfile in depth",
    "Smarter builds: BuildKit, cache, multi-stage builds, buildx, bake, secrets, SBOM and provenance",
  ] },
  { number: "IV", title: "Storage and Networking", chapters: [
    "Volumes, bind mounts and tmpfs",
    "Bridge, host and overlay networks, DNS and port publishing",
  ] },
  { number: "V", title: "Docker Compose", chapters: [
    "Compose fundamentals",
    "The complete compose.yaml reference: services, networks, volumes, secrets, profiles, healthcheck, depends_on, variables, extends, include, anchors, models",
    "Full-stack project: nginx + Node.js API + PostgreSQL + Redis + Adminer",
    "Compose CLI, overrides, profiles and watch",
  ] },
  { number: "VI", title: "Orchestration", chapters: [
    "Docker Swarm: services, rolling updates, rollback, secrets, stacks",
    "From Compose to Kubernetes",
  ] },
  { number: "VII", title: "Production", chapters: [
    "Security: hardening, Docker Scout, SBOM, rootless mode, capabilities",
    "Logging, monitoring and troubleshooting",
    "CI/CD with GitHub Actions",
    "AI with Docker: Model Runner, MCP Toolkit",
  ] },
  { number: "VIII", title: "Practice and Reference", chapters: [
    "Recipes: Node, Python, Java, Go, React, WordPress + MySQL, Postgres + pgAdmin, MongoDB, Redis, RabbitMQ",
    "Complete CLI command reference",
    "Cheat sheets, interview questions and answers, glossary",
  ] },
];

let chapterNo = 0;
export const handbookParts = PARTS_RAW.map((p) => ({
  ...p,
  chapters: p.chapters.map((title) => { chapterNo += 1; return { number: String(chapterNo).padStart(2, "0"), title }; }),
}));

/* How the handbook labels command output */
export const outputLabels = [
  { label: "OUTPUT", copy: "Captured live on Docker Engine 29.10.0, Compose v5.7.1 and Buildx 0.39.0." },
  { label: "SAMPLE OUTPUT", copy: "Representative output, for commands that need internet or a registry." },
];

export const TOOL_VERSIONS = [["Docker Engine", "29.10.0"], ["Compose", "v5.7.1"], ["Buildx", "0.39.0"]];

/* Cheat sheet: 19 sections */
export const cheatSheetSections = [
  { title: "Docker in one page", detail: "Architecture, lifecycle" },
  { title: "Install, verify and configure" },
  { title: "Run containers", detail: "docker run flags" },
  { title: "Manage containers" },
  { title: "Inspect, debug and monitor", detail: "With exit codes, health checks" },
  { title: "Images and registries" },
  { title: "Dockerfile", detail: "Instructions, multi-stage example, ENTRYPOINT vs CMD, .dockerignore" },
  { title: "Build", detail: "BuildKit, buildx, bake" },
  { title: "Storage", detail: "Volumes, bind mounts, tmpfs" },
  { title: "Networking" },
  { title: "Docker Compose: commands" },
  { title: "Docker Compose: the YAML file", detail: "Full example, key reference, variables, overrides, extends, include, watch" },
  { title: "Docker Swarm and the Kubernetes mapping" },
  { title: "Security essentials" },
  { title: "Logging, cleanup and troubleshooting" },
  { title: "Format strings and filters" },
  { title: "Handy one-liners, CI snippet, Model Runner" },
  { title: "Best practices checklist" },
  { title: "Interview quick answers" },
].map((s, i) => ({ ...s, number: `${i < 9 ? "0" : ""}${i + 1}` }));

/* Side-by-side comparison of the two books */
export const bookComparison = [
  ["Pages", "177", "20"],
  ["Structure", "25 chapters in 8 parts", "19 sections, mostly “command | what it does” tables"],
  ["Diagrams", "18", "Not listed"],
  ["Navigation", "Table of contents, command index, concept index, page numbers on every page", "No index, built for fast revision"],
  ["Command output", "Live “OUTPUT” blocks and representative “SAMPLE OUTPUT” blocks", "Not listed"],
  ["Use it to", "Go from your first container to production-grade stacks", "Revise every important command and file in one place"],
];

/* Where each topic lives in both books (chapter numbers match handbookParts, section numbers match cheatSheetSections) */
export const topicMap = [
  ["Architecture", "Ch 02: client, dockerd, containerd, runc", "§01 Docker in one page"],
  ["Install and configure", "Ch 03", "§02"],
  ["Running and managing containers", "Ch 04, Ch 05", "§03 docker run flags, §04"],
  ["Inspect, debug and monitor", "Ch 06", "§05 with exit codes, health checks"],
  ["Resource limits, restart policies, health checks", "Ch 07", "§05 health checks"],
  ["Images and registries", "Ch 08", "§06"],
  ["Dockerfile", "Ch 09", "§07 incl. ENTRYPOINT vs CMD, .dockerignore"],
  ["BuildKit, buildx, bake", "Ch 10 incl. cache, multi-stage, secrets, SBOM, provenance", "§08"],
  ["Volumes, bind mounts, tmpfs", "Ch 11", "§09"],
  ["Networking", "Ch 12: bridge, host, overlay, DNS, port publishing", "§10"],
  ["Docker Compose", "Ch 13–16 incl. full compose.yaml reference and a full-stack project", "§11 commands, §12 the YAML file"],
  ["Docker Swarm and Kubernetes", "Ch 17 Swarm, Ch 18 From Compose to Kubernetes", "§13 Swarm and the Kubernetes mapping"],
  ["Security", "Ch 19: hardening, Docker Scout, SBOM, rootless mode, capabilities", "§14 Security essentials"],
  ["Logging and troubleshooting", "Ch 20", "§15 incl. cleanup"],
  ["CI/CD", "Ch 21 GitHub Actions", "§17 CI snippet"],
  ["AI with Docker", "Ch 22: Model Runner, MCP Toolkit", "§17 Model Runner"],
  ["Recipes", "Ch 23: Node, Python, Java, Go, React, WordPress + MySQL, Postgres + pgAdmin, MongoDB, Redis, RabbitMQ", "Not covered"],
  ["CLI reference", "Ch 24 Complete CLI command reference", "Command tables in every section, §16 format strings and filters"],
  ["Interview preparation", "Ch 25 interview questions and answers, cheat sheets, glossary", "§19 Interview quick answers, §18 best practices checklist"],
];

/* FAQ: answers use only facts from the book listings (also used for FAQPage schema and server-rendered HTML) */
export const FAQS = [
  { q: "What do I get when I buy the Docker ebook?",
    a: "Both books in one purchase, as PDF ebooks. Docker: The Complete Engineer's Handbook (177 pages, 25 chapters in 8 parts) takes you from your first container to production-grade stacks. The Docker Cheat Sheet (20 pages, 19 sections) is a quick reference of every important command and file." },
  { q: "What is the difference between the Docker Handbook and the Docker Cheat Sheet?",
    a: "You get both. Use the Handbook to learn Docker in depth: it covers foundations, containers, images and builds, storage and networking, Docker Compose, orchestration, production and practice recipes, with every command and YAML file shown with output. Use the Cheat Sheet for fast revision: 20 pages of mostly “command | what it does” tables with no index." },
  { q: "What does Docker: The Complete Engineer's Handbook cover?",
    a: "25 chapters in 8 parts: Foundations, Working with Containers, Images, Dockerfile and Builds, Storage and Networking, Docker Compose, Orchestration, Production, and Practice and Reference. It includes 18 diagrams, a table of contents, a command index, a concept index and page numbers on every page." },
  { q: "Is the command output in the Docker Handbook real?",
    a: "Blocks labelled “OUTPUT” were captured live on Docker Engine 29.10.0, Compose v5.7.1 and Buildx 0.39.0. Blocks labelled “SAMPLE OUTPUT” are representative, used for commands that need internet or a registry." },
  { q: "Does the Docker Handbook cover Docker Compose?",
    a: "Yes. Part V has four chapters on Compose: Compose fundamentals; the complete compose.yaml reference (services, networks, volumes, secrets, profiles, healthcheck, depends_on, variables, extends, include, anchors, models); a full-stack project with nginx, a Node.js API, PostgreSQL, Redis and Adminer; and the Compose CLI, overrides, profiles and watch." },
  { q: "Does it cover Docker Swarm and Kubernetes?",
    a: "The Handbook's Orchestration part covers Docker Swarm (services, rolling updates, rollback, secrets, stacks) and a chapter called From Compose to Kubernetes. The Cheat Sheet has a section on Docker Swarm and the Kubernetes mapping." },
  { q: "Does it cover Docker security and production use?",
    a: "Yes. Part VII, Production, covers security (hardening, Docker Scout, SBOM, rootless mode, capabilities), logging, monitoring and troubleshooting, CI/CD with GitHub Actions, and AI with Docker using Model Runner and the MCP Toolkit." },
  { q: "Do the Docker ebooks include interview questions?",
    a: "Yes. The Handbook's last chapter has cheat sheets, interview questions and answers, and a glossary. The Cheat Sheet ends with a best practices checklist and interview quick answers." },
  { q: "What is in the Docker Cheat Sheet?",
    a: "19 sections: Docker in one page; install, verify and configure; run containers; manage containers; inspect, debug and monitor; images and registries; Dockerfile; build; storage; networking; Compose commands; the Compose YAML file; Swarm and the Kubernetes mapping; security essentials; logging, cleanup and troubleshooting; format strings and filters; handy one-liners, CI snippet and Model Runner; best practices checklist; interview quick answers." },
  { q: "What format are the Docker ebooks in?",
    a: "Both are PDF ebooks by Target Trek (targettrek.in)." },
];
