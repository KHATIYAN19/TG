import API_BASE_URL from "../utils/Url";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Helmet } from "react-helmet-async";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Activity,
  ArrowRight,
  ArrowRightLeft,
  BarChart3,
  Boxes,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronRight,
  Cloud,
  Database,
  GitBranch,
  Globe,
  GraduationCap,
  HardDrive,
  Layers3,
  Lightbulb,
  Lock,
  Network,
  Plug,
  Server,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wallet,
  Zap,
} from "lucide-react";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { trackViewContent } from "../lib/metaPixel.js";
import { styles as baseStyles, readTheme, ScrollProgress, CountUp, ScrollScale } from "./SystemDesignLLD.jsx";
import { sqlStyles, CopyButton } from "./SqlInterviewHandbook.jsx";

const SITE_NAME = "Target Trek";
const SITE_URL = "https://www.targettrek.in";
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const BASE_URL = API_BASE_URL;
const PAGE_PATH = "/book/cloud/gcp";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SEO_TITLE = "Google Cloud (GCP) Engineer's Handbook | Target Trek";
const SEO_DESCRIPTION =
  "Learn Google Cloud end to end: IAM, GKE, Cloud Run, BigQuery, Pub/Sub, networking, security, AI, FinOps, 5 reference architectures and interview prep. Ebook.";
const SEO_LONG_DESCRIPTION =
  "The complete Google Cloud handbook in 18 parts: global infrastructure, IAM and governance, Compute Engine, GKE, Cloud Run, serverless, Cloud Storage, databases (Cloud SQL, AlloyDB, Spanner, Bigtable, Firestore), BigQuery, Pub/Sub, Dataflow, VPC and load balancing, Cloud Armor, KMS, Secret Manager, Gemini Enterprise Agent Platform (formerly Vertex AI), DevOps, observability, FinOps, Apigee, migration, reference architectures, certifications and interview questions.";
const SEO_KEYWORDS =
  "Google Cloud handbook, GCP ebook, GCP tutorial, Google Cloud interview questions, GCP certification preparation, Cloud Run, GKE, BigQuery, Pub/Sub, Cloud Spanner, Vertex AI, Gemini Enterprise Agent Platform, IAM, VPC, Cloud Armor, gcloud cheat sheet, GCP reference architecture, GCP FinOps, Google Cloud for beginners, TargetTrek";

const SERVICE_SECTIONS = [
  { t: "At a glance", d: "Category, use it for, compare with, scope and tier" },
  { t: "What it is", d: "A plain-language explanation of the service" },
  { t: "When to use it", d: "And just as importantly, when not to" },
  { t: "Key concepts", d: "The vocabulary you need to read the docs" },
  { t: "Architecture", d: "A diagram of how the pieces fit together" },
  { t: "Console walkthrough", d: "A mockup and numbered steps" },
  { t: "Command line", d: "Working gcloud commands" },
  { t: "Deep-dive sections", d: "Extra sections for the service's trickier ideas" },
  { t: "How you are billed", d: "What drives the price on the invoice" },
  { t: "Best practices", d: "Habits that keep production healthy" },
  { t: "Common pitfalls", d: "Mistakes engineers repeatedly make" },
  { t: "Interview & certification notes", d: "What gets asked and why" },
];

const S = true;
const PARTS = [
  {
    id: 1, title: "Foundations: How Google Cloud Is Built", icon: Globe,
    summary: "Regions, zones, the resource hierarchy, the console, gcloud, billing and the mental model behind every service.",
    chapters: [
      { n: "1.1", title: "How to Read This Handbook", topics: ["What every service chapter contains", "How commands in this book were checked", "Names changed in 2026: read this once"] },
      { n: "1.2", title: "Global Infrastructure: Regions, Zones and the Edge", topics: ["Choosing a region", "Network service tiers"] },
      { n: "1.3", title: "Resource Hierarchy: Organization, Folders, Projects", topics: ["The three project identifiers", "Labels vs tags", "Recommended structure"] },
      { n: "1.4", title: "The Google Cloud Console: A Guided Tour", topics: ["Five things to learn in your first hour"] },
      { n: "1.5", title: "Tooling: gcloud, Cloud Shell, SDKs, Terraform", topics: ["Installing and initialising gcloud", "Two kinds of login (the most common beginner confusion)", "Configurations, defaults and APIs", "Output control"] },
      { n: "1.6", title: "Billing, Quotas and the Free Tier", topics: ["Free options for learning", "Quotas are not budgets"] },
      { n: "1.7", title: "Well-Architected Framework and Shared Responsibility", topics: ["Shared responsibility, and \"shared fate\""] },
      { n: "1.8", title: "The Service Map: Everything at a Glance", topics: [] },
    ],
  },
  {
    id: 2, title: "Identity, Access and Governance", icon: ShieldCheck,
    summary: "Who can do what, with which identity, and which guardrails apply across the whole organization.",
    chapters: [
      { n: "2.1", title: "Identity and Access Management (IAM)", s: S },
      { n: "2.2", title: "Service Accounts", s: S },
      { n: "2.3", title: "Workload Identity Federation", s: S },
      { n: "2.4", title: "Organization Policy and Resource Manager", s: S },
    ],
  },
  {
    id: 3, title: "Compute: Virtual Machines and Batch", icon: Server,
    summary: "Virtual machines, instance groups, disks and batch processing, plus the other compute options.",
    chapters: [
      { n: "3.1", title: "Compute Engine", s: S },
      { n: "3.2", title: "Instance Templates and Managed Instance Groups", s: S },
      { n: "3.3", title: "Persistent Disk and Hyperdisk", s: S },
      { n: "3.4", title: "Batch", s: S },
      { n: "3.5", title: "Other Compute Options", topics: [] },
    ],
  },
  {
    id: 4, title: "Containers and Kubernetes", icon: Boxes,
    summary: "GKE, Artifact Registry, Cloud Run and service mesh, with a clear guide to choosing between them.",
    chapters: [
      { n: "4.1", title: "Google Kubernetes Engine (GKE)", s: S },
      { n: "4.2", title: "Artifact Registry", s: S },
      { n: "4.3", title: "Cloud Run", s: S },
      { n: "4.4", title: "Cloud Service Mesh and GKE Enterprise", s: S },
      { n: "4.5", title: "Choosing: Compute Engine vs GKE vs Cloud Run vs Run functions", topics: [] },
    ],
  },
  {
    id: 5, title: "Serverless and Event-Driven Building Blocks", icon: Zap,
    summary: "Functions, App Engine, workflows, events, schedulers and queues for glue and automation.",
    chapters: [
      { n: "5.1", title: "Cloud Run functions", s: S },
      { n: "5.2", title: "App Engine", s: S },
      { n: "5.3", title: "Workflows", s: S },
      { n: "5.4", title: "Eventarc", s: S },
      { n: "5.5", title: "Cloud Scheduler and Cloud Tasks", s: S },
    ],
  },
  {
    id: 6, title: "Storage", icon: HardDrive,
    summary: "Object, file and backup storage, moving data in, and the other storage services at a glance.",
    chapters: [
      { n: "6.1", title: "Cloud Storage", s: S },
      { n: "6.2", title: "Filestore", s: S },
      { n: "6.3", title: "Backup and DR Service", s: S },
      { n: "6.4", title: "Storage Transfer Service and Transfer Appliance", s: S },
      { n: "6.5", title: "Other Storage Services at a Glance", topics: [] },
    ],
  },
  {
    id: 7, title: "Databases", icon: Database,
    summary: "Relational, wide-column, document and in-memory databases, migration tools and how to choose.",
    chapters: [
      { n: "7.1", title: "Cloud SQL", s: S },
      { n: "7.2", title: "AlloyDB for PostgreSQL", s: S },
      { n: "7.3", title: "Cloud Spanner", s: S },
      { n: "7.4", title: "Bigtable", s: S },
      { n: "7.5", title: "Firestore", s: S },
      { n: "7.6", title: "Memorystore", s: S },
      { n: "7.7", title: "Database Migration Service and Datastream", s: S },
      { n: "7.8", title: "Choosing a Database on Google Cloud", topics: [] },
    ],
  },
  {
    id: 8, title: "Data and Analytics", icon: BarChart3,
    summary: "BigQuery, streaming, batch pipelines, orchestration, data governance and BI.",
    chapters: [
      { n: "8.1", title: "BigQuery", s: S },
      { n: "8.2", title: "Pub/Sub", s: S },
      { n: "8.3", title: "Dataflow", s: S },
      { n: "8.4", title: "Managed Service for Apache Spark (Dataproc)", s: S },
      { n: "8.5", title: "Managed Service for Apache Airflow (Cloud Composer)", s: S },
      { n: "8.6", title: "Knowledge Catalog (Dataplex and Data Catalog)", s: S },
      { n: "8.7", title: "Looker and Data Studio", s: S },
      { n: "8.8", title: "Lakehouse, BigLake and Other Data Tools", topics: [] },
    ],
  },
  {
    id: 9, title: "Networking", icon: Network,
    summary: "VPCs, load balancing, CDN, DNS, NAT, hybrid connectivity and private access to services.",
    chapters: [
      { n: "9.1", title: "Virtual Private Cloud (VPC)", s: S },
      { n: "9.2", title: "Cloud Load Balancing", s: S },
      { n: "9.3", title: "Cloud CDN, Cloud DNS and Cloud NAT", s: S },
      { n: "9.4", title: "Cloud Armor", s: S },
      { n: "9.5", title: "Cloud VPN, Interconnect and Network Connectivity Center", s: S },
      { n: "9.6", title: "Private Service Connect and Network Intelligence Center", s: S },
    ],
  },
  {
    id: 10, title: "Security", icon: Lock,
    summary: "Keys, secrets, threat detection, data protection, zero-trust access and perimeters.",
    chapters: [
      { n: "10.1", title: "Cloud KMS", s: S },
      { n: "10.2", title: "Secret Manager", s: S },
      { n: "10.3", title: "Security Command Center (and Wiz)", s: S },
      { n: "10.4", title: "Sensitive Data Protection (formerly Cloud DLP)", s: S },
      { n: "10.5", title: "Identity-Aware Proxy (IAP) and BeyondCorp", s: S },
      { n: "10.6", title: "VPC Service Controls, Binary Authorization and Certificate Manager", s: S },
    ],
  },
  {
    id: 11, title: "AI and Machine Learning", icon: BrainCircuit,
    summary: "The agent platform, ADK, vector search and RAG, pretrained APIs, accelerators and AI inside data services.",
    chapters: [
      { n: "11.1", title: "Gemini Enterprise Agent Platform (formerly Vertex AI)", s: S },
      { n: "11.2", title: "Agent Development Kit (ADK) and Agent Runtime", s: S },
      { n: "11.3", title: "Vector Search and RAG Engine", s: S },
      { n: "11.4", title: "Document AI, Vision, Speech, Translation and Natural Language", s: S },
      { n: "11.5", title: "TPUs, GPUs and AI Hypercomputer", s: S },
      { n: "11.6", title: "AI Inside Your Data Services", topics: [] },
    ],
  },
  {
    id: 12, title: "DevOps and Delivery", icon: GitBranch,
    summary: "Build, deploy and manage infrastructure as code, with developer tooling and release metrics.",
    chapters: [
      { n: "12.1", title: "Cloud Build", s: S },
      { n: "12.2", title: "Cloud Deploy", s: S },
      { n: "12.3", title: "Infrastructure Manager, Terraform and Config Connector", s: S },
      { n: "12.4", title: "Cloud Workstations, Cloud Code and Developer Connect", s: S },
      { n: "12.5", title: "Delivery Metrics and Release Practices", topics: [] },
    ],
  },
  {
    id: 13, title: "Observability and Operations", icon: Activity,
    summary: "Logs, metrics, traces, errors and the practice of running incidents against SLOs.",
    chapters: [
      { n: "13.1", title: "Cloud Logging and Cloud Audit Logs", s: S },
      { n: "13.2", title: "Cloud Monitoring, Trace, Profiler and Error Reporting", s: S },
      { n: "13.3", title: "Incident Response and SLO Practice", topics: [] },
    ],
  },
  {
    id: 14, title: "Cost Management and FinOps", icon: Wallet,
    summary: "Understand the bill, set budgets and follow a practical checklist to cut spend.",
    chapters: [
      { n: "14.1", title: "Cloud Billing, Budgets and FinOps Tools", s: S },
      { n: "14.2", title: "A Practical Cost-Optimisation Checklist", topics: [] },
    ],
  },
  {
    id: 15, title: "Integration and Application Platforms", icon: Plug,
    summary: "Expose and manage APIs, and use app-facing services for mobile and web.",
    chapters: [
      { n: "15.1", title: "Apigee, API Gateway and Cloud Endpoints", s: S },
      { n: "15.2", title: "Firebase and App-Facing Services", s: S },
    ],
  },
  {
    id: 16, title: "Migration and Hybrid Cloud", icon: ArrowRightLeft,
    summary: "Move existing workloads to Google Cloud and run Google Cloud technology on-premises.",
    chapters: [
      { n: "16.1", title: "Migration Center and Migrate to Virtual Machines", s: S },
      { n: "16.2", title: "GKE Enterprise and Google Distributed Cloud", s: S },
    ],
  },
  {
    id: 17, title: "Reference Architectures", icon: Layers3,
    summary: "Five end-to-end designs that tie the services together, each with the reasoning behind the choices.",
    chapters: [
      { n: "17.1", title: "Reference 1: Three-Tier Web Application", topics: ["Why these choices"] },
      { n: "17.2", title: "Reference 2: Event-Driven Microservices", topics: [] },
      { n: "17.3", title: "Reference 3: Data Lakehouse and Analytics", topics: [] },
      { n: "17.4", title: "Reference 4: Enterprise Landing Zone", topics: [] },
      { n: "17.5", title: "Reference 5: Resilience and Disaster Recovery Patterns", topics: [] },
    ],
  },
  {
    id: 18, title: "Careers: Certifications, Interviews and Cheat Sheets", icon: GraduationCap,
    summary: "Pick a certification, follow a study plan, rehearse interview questions and keep a gcloud cheat sheet.",
    chapters: [
      { n: "18.1", title: "Google Cloud Certifications: Which One and How to Prepare", topics: ["A study plan that works"] },
      { n: "18.2", title: "Interview Questions: Core Platform", topics: [] },
      { n: "18.3", title: "Interview Questions: Data, Reliability and Cost", topics: [] },
      { n: "18.4", title: "gcloud Cheat Sheet", topics: [] },
      { n: "18.5", title: "Glossary", topics: [] },
    ],
  },
];

const APPENDICES = [
  { title: "A–Z Service Catalogue", text: "About 120 services described in one place, so you always know what exists and what it is for." },
  { title: "Keep Learning: Official Resources", text: "A curated list of official documentation and learning paths to continue after the book." },
  { title: "A–Z Index", text: "A back-of-the-book index to jump straight to any service, concept or command." },
];

const ALL_CHAPTERS = PARTS.flatMap((p) => p.chapters.map((c) => ({ ...c, part: p.title })));
const CHAPTER_COUNT = ALL_CHAPTERS.length;
const SERVICE_COUNT = ALL_CHAPTERS.filter((c) => c.s).length;

const stats = [
  [PARTS.length, "Parts"],
  [CHAPTER_COUNT, "Chapters"],
  [SERVICE_COUNT, "Service deep-dives"],
  [120, "Services in the A–Z catalogue"],
];

const STAGES = [
  { title: "Foundations & Governance", parts: "Parts 1–2", text: "Understand regions, the resource hierarchy, IAM and service accounts before you build anything.", icon: Globe },
  { title: "Build & Run", parts: "Parts 3–5", text: "Virtual machines, GKE, Cloud Run and the serverless glue that connects them.", icon: Server },
  { title: "Store & Analyse", parts: "Parts 6–8", text: "Cloud Storage, every database option, BigQuery, Pub/Sub and Dataflow.", icon: Database },
  { title: "Connect & Protect", parts: "Parts 9–10", text: "VPCs, load balancing, Cloud Armor, KMS, Secret Manager and perimeter security.", icon: Lock },
  { title: "Deliver, Operate & Add AI", parts: "Parts 11–13", text: "Agents and ML, CI/CD, infrastructure as code, logging, monitoring and SLOs.", icon: BrainCircuit },
  { title: "Optimise, Migrate & Get Hired", parts: "Parts 14–18", text: "FinOps, APIs, migration, reference architectures, certifications and interviews.", icon: GraduationCap },
];

const PICKER = [
  {
    need: "Run a container, zero servers to manage",
    pick: "Cloud Run", chapter: "4.3",
    why: "Deploy any container and pay only while it handles requests. It scales to zero and needs no cluster.",
    alt: "Compare with GKE when you need Kubernetes-level control.",
  },
  {
    need: "Need full Kubernetes control",
    pick: "Google Kubernetes Engine", chapter: "4.1",
    why: "Managed Kubernetes for complex, multi-service platforms that need custom networking, operators or sidecars.",
    alt: "Compare with Cloud Run for simpler stateless services.",
  },
  {
    need: "Lift-and-shift a server or run custom OS software",
    pick: "Compute Engine", chapter: "3.1",
    why: "Virtual machines with full OS control, suitable for legacy apps and specialised software.",
    alt: "Pair with managed instance groups for autoscaling and self-healing.",
  },
  {
    need: "Relational database, standard MySQL or PostgreSQL",
    pick: "Cloud SQL", chapter: "7.1",
    why: "Managed MySQL, PostgreSQL and SQL Server for typical application databases.",
    alt: "Consider AlloyDB for demanding PostgreSQL workloads.",
  },
  {
    need: "Globally scalable relational database",
    pick: "Cloud Spanner", chapter: "7.3",
    why: "Relational schema and SQL with horizontal scale and strong consistency across regions.",
    alt: "Chapter 7.8 compares it with every other database.",
  },
  {
    need: "Analytics over huge datasets with SQL",
    pick: "BigQuery", chapter: "8.1",
    why: "A serverless data warehouse where you write SQL and Google handles the infrastructure.",
    alt: "Feed it with Pub/Sub and Dataflow for streaming data.",
  },
  {
    need: "Decouple services with asynchronous events",
    pick: "Pub/Sub", chapter: "8.2",
    why: "A global messaging service for event ingestion and fan-out between loosely coupled systems.",
    alt: "Connect it to Eventarc, Cloud Run and Dataflow.",
  },
];

const REF_ARCHS = [
  { n: 1, title: "Three-Tier Web Application", text: "Public traffic, stateless application tier and managed database.", flow: ["Cloud Load Balancing", "Cloud Run", "Cloud SQL", "Memorystore"] },
  { n: 2, title: "Event-Driven Microservices", text: "Services that react to events instead of calling each other directly.", flow: ["Pub/Sub", "Eventarc", "Cloud Run", "Firestore"] },
  { n: 3, title: "Data Lakehouse and Analytics", text: "Ingest streams, transform them and serve analytics to the business.", flow: ["Pub/Sub", "Dataflow", "BigQuery", "Looker"] },
  { n: 4, title: "Enterprise Landing Zone", text: "The organization-wide foundation every team builds on.", flow: ["Organization", "Folders", "Projects", "Org Policy"] },
  { n: 5, title: "Resilience and Disaster Recovery", text: "Patterns that keep working through zone and region failures.", flow: ["Zones", "Regions", "Backup and DR", "Failover"] },
];

const FREE_SNIPPETS = [
  {
    id: "setup", tab: "Project setup", level: "easy", chapter: "Ch 1.3 · 1.5 · Foundations",
    title: "Create a project and set your defaults",
    intro: "Every resource lives in a project. Set the project and region once so later commands stay short.",
    file: "setup.sh",
    code: "# Sign in with your user account\ngcloud auth login\n\n# Create a project (IDs are globally unique)\ngcloud projects create my-app-dev --name=\"My App Dev\"\n\n# Set defaults for this configuration\ngcloud config set project my-app-dev\ngcloud config set compute/region asia-south1\n\n# Turn on the API you plan to use\ngcloud services enable run.googleapis.com",
    out: "Updated property [core/project].\nUpdated property [compute/region].\nOperation \"operations/...\" finished successfully.",
    tip: "Know the two logins: gcloud auth login is for you, application-default login is for code running locally.",
  },
  {
    id: "run", tab: "Deploy to Cloud Run", level: "easy", chapter: "Ch 4.3 · Cloud Run",
    title: "Deploy a service straight from source",
    intro: "One command builds your code into a container, deploys it and gives you an HTTPS URL.",
    file: "deploy.sh",
    code: "gcloud run deploy hello-api \\\n  --source . \\\n  --region asia-south1 \\\n  --allow-unauthenticated",
    out: "Building using Dockerfile and deploying container...\nService [hello-api] revision [hello-api-00001-abc] has been deployed\nand is serving 100 percent of traffic.\nService URL: https://hello-api-<hash>-el.a.run.app",
    tip: "Drop --allow-unauthenticated for private services and grant roles/run.invoker to callers instead.",
  },
  {
    id: "iam", tab: "Least-privilege IAM", level: "medium", chapter: "Ch 2.1 · 2.2 · IAM",
    title: "Give a service account only the role it needs",
    intro: "Create a dedicated service account and bind one narrow role, instead of reusing a powerful default account.",
    file: "iam.sh",
    code: "gcloud iam service-accounts create report-runner \\\n  --display-name=\"Report runner\"\n\ngcloud projects add-iam-policy-binding my-app-dev \\\n  --member=\"serviceAccount:report-runner@my-app-dev.iam.gserviceaccount.com\" \\\n  --role=\"roles/bigquery.dataViewer\"",
    out: "Created service account [report-runner].\nUpdated IAM policy for project [my-app-dev].",
    tip: "Say it in interviews: prefer predefined or custom roles over primitive Owner/Editor, and avoid long-lived keys.",
  },
  {
    id: "gke", tab: "GKE Autopilot", level: "medium", chapter: "Ch 4.1 · GKE",
    title: "Create an Autopilot cluster and connect",
    intro: "Autopilot manages nodes for you. Create the cluster, fetch credentials and talk to it with kubectl.",
    file: "gke.sh",
    code: "gcloud container clusters create-auto demo-cluster \\\n  --region asia-south1\n\ngcloud container clusters get-credentials demo-cluster \\\n  --region asia-south1\n\nkubectl get nodes",
    out: "Creating cluster demo-cluster... done.\nFetching cluster endpoint and auth data.\nkubeconfig entry generated for demo-cluster.",
    tip: "Know when not to use it: if one stateless container is enough, Cloud Run is simpler and cheaper.",
  },
  {
    id: "bq", tab: "BigQuery query", level: "easy", chapter: "Ch 8.1 · BigQuery",
    title: "Query a public dataset from the command line",
    intro: "BigQuery is serverless: write standard SQL and it scales for you. Public datasets let you practise for free.",
    file: "bq_query.sh",
    code: "bq query --use_legacy_sql=false \\\n'SELECT name, SUM(number) AS total\n FROM `bigquery-public-data.usa_names.usa_1910_2013`\n WHERE state = \"TX\"\n GROUP BY name\n ORDER BY total DESC\n LIMIT 3'",
    out: "+--------+---------+\n|  name  |  total  |\n+--------+---------+\n| ...    | ...     |   (3 rows)",
    tip: "Cost is driven by bytes scanned: select only the columns you need and filter on partitioned columns.",
  },
  {
    id: "pubsub", tab: "Pub/Sub messaging", level: "easy", chapter: "Ch 8.2 · Pub/Sub",
    title: "Publish and pull a message",
    intro: "A topic receives messages and each subscription gets its own copy, which decouples producers from consumers.",
    file: "pubsub.sh",
    code: "gcloud pubsub topics create orders\ngcloud pubsub subscriptions create orders-sub --topic=orders\n\ngcloud pubsub topics publish orders --message='{\"id\":42}'\ngcloud pubsub subscriptions pull orders-sub --auto-ack",
    out: "Created topic [projects/my-app-dev/topics/orders].\nCreated subscription [projects/my-app-dev/subscriptions/orders-sub].\nmessageIds:\n- '1234567890'",
    tip: "Delivery is at-least-once by default, so make consumers idempotent.",
  },
  {
    id: "gcs", tab: "Cloud Storage", level: "easy", chapter: "Ch 6.1 · Cloud Storage",
    title: "Create a bucket and upload a file",
    intro: "Bucket names are global. Use uniform bucket-level access so IAM alone controls who can read objects.",
    file: "storage.sh",
    code: "gcloud storage buckets create gs://my-unique-bucket-123 \\\n  --location=asia-south1 \\\n  --uniform-bucket-level-access\n\ngcloud storage cp ./report.pdf gs://my-unique-bucket-123/\ngcloud storage ls gs://my-unique-bucket-123",
    out: "Creating gs://my-unique-bucket-123/...\nCopying file://report.pdf to gs://my-unique-bucket-123/report.pdf\ngs://my-unique-bucket-123/report.pdf",
    tip: "Pick the storage class by access pattern, and add lifecycle rules to move or delete cold data.",
  },
];

const HERO_CMDS = [
  {
    file: "deploy.sh",
    cmd: "gcloud run deploy hello-api \\\n  --source . \\\n  --region asia-south1",
    lines: ["Building container image", "Creating revision hello-api-00001", "Routing 100% of traffic", "Service URL: https://hello-api-…run.app"],
    ms: "Deployed",
  },
  {
    file: "cluster.sh",
    cmd: "gcloud container clusters \\\n  create-auto demo-cluster \\\n  --region asia-south1",
    lines: ["Creating Autopilot cluster", "Nodes managed by Google", "kubeconfig entry generated", "Cluster demo-cluster is RUNNING"],
    ms: "Ready",
  },
  {
    file: "events.sh",
    cmd: "gcloud pubsub topics create orders\ngcloud pubsub topics publish orders \\\n  --message='{\"id\":42}'",
    lines: ["Created topic [orders]", "messageIds: '1234567890'", "Subscribers notified", "Decoupled and scalable"],
    ms: "Published",
  },
];

const MARQUEE = [
  "IAM", "Compute Engine", "GKE", "Cloud Run", "App Engine", "Workflows", "Eventarc", "Cloud Storage", "Cloud SQL", "AlloyDB", "Spanner",
  "Bigtable", "Firestore", "BigQuery", "Pub/Sub", "Dataflow", "VPC", "Cloud Load Balancing", "Cloud Armor", "Cloud KMS", "Secret Manager",
  "Gemini Enterprise Agent Platform", "ADK", "Cloud Build", "Cloud Deploy", "Cloud Logging", "Apigee", "Firebase",
];

const QUICK_ANSWER =
  "The Google Cloud (GCP) Engineer's Handbook is an 18-part ebook that teaches the whole platform: how Google Cloud is built, identity and governance, compute, containers, serverless, storage, databases, data and analytics, networking, security, AI, DevOps, observability, FinOps, APIs and migration. Every service chapter follows the same structure, and the book ends with five reference architectures, certification guidance, interview questions and a gcloud cheat sheet.";

const FAQS = [
  { q: "What is the Google Cloud (GCP) Engineer's Handbook?", a: "It is a Target Trek ebook in 18 parts plus appendices that explains Google Cloud from the ground up: global infrastructure, IAM, compute, containers, serverless, storage, databases, analytics, networking, security, AI, DevOps, observability, cost management, migration, reference architectures and career preparation." },
  { q: "What is inside every service chapter?", a: "Each service chapter follows the same 12-part structure: an at-a-glance summary, what it is, when to use it and when not to, key concepts, an architecture diagram, a console walkthrough, gcloud commands, extra deep-dive sections, how you are billed, best practices, common pitfalls and interview and certification notes." },
  { q: "Which compute and container services are covered?", a: "Compute Engine, instance templates and managed instance groups, Persistent Disk and Hyperdisk, Batch, Google Kubernetes Engine, Artifact Registry, Cloud Run, Cloud Service Mesh, GKE Enterprise and Cloud Run functions. A decision chapter compares Compute Engine, GKE, Cloud Run and Run functions." },
  { q: "Does the book cover databases and data analytics?", a: "Yes. Databases include Cloud SQL, AlloyDB for PostgreSQL, Cloud Spanner, Bigtable, Firestore, Memorystore, Database Migration Service and Datastream, plus a guide to choosing one. Analytics covers BigQuery, Pub/Sub, Dataflow, Dataproc, Cloud Composer, Dataplex, Looker and the lakehouse tools." },
  { q: "Are networking and security covered in depth?", a: "Yes. Networking covers VPC, Cloud Load Balancing, Cloud CDN, Cloud DNS, Cloud NAT, Cloud Armor, VPN, Interconnect, Network Connectivity Center and Private Service Connect. Security covers Cloud KMS, Secret Manager, Security Command Center, Sensitive Data Protection, Identity-Aware Proxy, VPC Service Controls, Binary Authorization and Certificate Manager." },
  { q: "Does it include AI and machine learning on Google Cloud?", a: "Yes. Part 11 covers the Gemini Enterprise Agent Platform (formerly Vertex AI), the Agent Development Kit and Agent Runtime, Vector Search and RAG Engine, Document AI, Vision, Speech, Translation and Natural Language, plus TPUs, GPUs and AI Hypercomputer." },
  { q: "Does it explain cost management and observability?", a: "Yes. Part 13 covers Cloud Logging, Audit Logs, Monitoring, Trace, Profiler, Error Reporting, incident response and SLO practice. Part 14 covers billing, budgets, FinOps tools and a practical cost-optimisation checklist." },
  { q: "Are there reference architectures?", a: "Yes. Part 17 walks through five designs: a three-tier web application, event-driven microservices, a data lakehouse and analytics platform, an enterprise landing zone, and resilience and disaster recovery patterns, each explaining why the services were chosen." },
  { q: "Will it help with Google Cloud certifications and interviews?", a: "Yes. Part 18 explains which certification to pick and gives a study plan, then provides interview questions on the core platform and on data, reliability and cost, a gcloud cheat sheet and a glossary. Every service chapter also ends with interview and certification notes." },
  { q: "Does it cover the recent service renames?", a: "Yes. The first part includes a short section on names that changed in 2026, and chapter titles use current names such as Gemini Enterprise Agent Platform (formerly Vertex AI) and Sensitive Data Protection (formerly Cloud DLP)." },
  { q: "Who is this book for?", a: "Developers, DevOps and platform engineers, data engineers, architects and students who want to learn Google Cloud properly. It starts from regions and the console, so beginners can follow it, and deepens into design trade-offs for experienced engineers." },
  { q: "What format is the book and how do I get it?", a: "It is a digital ebook with instant access after checkout, and payment opens in a secure checkout window. Digital products are non-refundable after purchase. For help write to supporttargettrek@gmail.com." },
];

const KW = new Set(["gcloud", "bq", "kubectl", "gsutil", "aws"]);
export function ShellHighlight({ code }) {
  const out = [];
  const re = /(\s+)|(#[^\n]*)|((?:[^\s"']|"[^"]*"|'[^']*')+)/g;
  let m;
  let i = 0;
  let first = true;
  while ((m = re.exec(code)) !== null) {
    const [text, ws, comment, word] = m;
    if (ws) {
      if (ws.includes("\n")) first = true;
      out.push(<React.Fragment key={i}>{text}</React.Fragment>);
    } else if (comment) {
      out.push(<span key={i} className="tk-cm">{text}</span>);
    } else if (word) {
      if (KW.has(word) && first) out.push(<span key={i} className="tk-fn">{text}</span>);
      else if (word.startsWith("-")) {
        const eq = word.indexOf("=");
        if (eq > 0) out.push(<span key={i}><span className="tk-kw">{word.slice(0, eq)}</span><span className="tk-str">{word.slice(eq)}</span></span>);
        else out.push(<span key={i} className="tk-kw">{text}</span>);
      } else if (/^["'].*["']$/.test(word)) out.push(<span key={i} className="tk-str">{text}</span>);
      else if (word.startsWith("$")) out.push(<span key={i} className="tk-num">{text}</span>);
      else out.push(<React.Fragment key={i}>{text}</React.Fragment>);
      if (word !== "\\") first = false;
    }
    i += 1;
  }
  return <>{out}</>;
}

export const spot = (e) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--sx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--sy", `${e.clientY - r.top}px`);
};

function HeroTerminal({ reduce }) {
  const [qi, setQi] = useState(0);
  const [n, setN] = useState(reduce ? HERO_CMDS[0].cmd.length : 0);
  const [done, setDone] = useState(Boolean(reduce));
  const q = HERO_CMDS[qi];

  useEffect(() => {
    if (reduce) return undefined;
    let t;
    if (n < q.cmd.length) {
      const nl = q.cmd[n] === "\n";
      t = setTimeout(() => setN(n + (nl ? 1 : 2)), nl ? 120 : 26);
    } else if (!done) {
      t = setTimeout(() => setDone(true), 280);
    } else {
      t = setTimeout(() => {
        setDone(false);
        setN(0);
        setQi((qi + 1) % HERO_CMDS.length);
      }, 3600);
    }
    return () => clearTimeout(t);
  }, [n, qi, done, reduce, q.cmd]);

  return (
    <div className="sql-term" role="img" aria-label="Animated example of gcloud commands running in Cloud Shell">
      <div className="sql-term-bar">
        <span className="sql-dots"><i /><i /><i /></span>
        <span className="sql-term-title sql-mono">{q.file}</span>
        <span className="sql-term-badge">Cloud Shell</span>
      </div>
      <pre className="sql-term-code" aria-hidden="true">
        <span className="tk-num">$ </span>
        <ShellHighlight code={q.cmd.slice(0, n)} />
        {!reduce && <span className="sql-caret" />}
      </pre>
      <div className="sql-result" aria-hidden="true">
        <div className="sql-result-head">
          <span>Output</span>
          {done && <b>✓ {q.ms}</b>}
        </div>
        {done && (
          <ul className="gcp-lines">
            {q.lines.map((line, i) => (
              <li key={`${qi}-${i}`} style={{ animationDelay: `${i * 140}ms` }}>{line}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="sql-dotsbar" style={{ padding: "0 0 12px", marginTop: 0, background: "#171411" }}>
        {HERO_CMDS.map((item, i) => <i key={item.file} className={i === qi ? "on" : ""} />)}
      </div>
    </div>
  );
}

const ROTATING = ["IAM & governance", "Cloud Run & GKE", "BigQuery & Pub/Sub", "VPC & security", "AI & agents"];
function RotatingTopic({ reduce }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return undefined;
    const id = setInterval(() => setI((v) => (v + 1) % ROTATING.length), 2200);
    return () => clearInterval(id);
  }, [reduce]);
  return (
    <div className="sql-rotator">
      <span>Now learning</span>
      <span className="sql-rotator-word">
        <AnimatePresence mode="wait">
          <motion.span
            key={ROTATING[i]}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {ROTATING[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}

function FreeSnippets({ animation }) {
  const [active, setActive] = useState(FREE_SNIPPETS[0].id);
  return (
    <section className="lld-section sql-lessons" id="free-snippets" aria-labelledby="gcp-free-title">
      <div className="lld-shell">
        <motion.div className="lld-section-head" {...animation}>
          <div className="lld-kicker">Free · try before you buy</div>
          <h2 id="gcp-free-title">Free gcloud snippets</h2>
          <p>Seven hands-on commands you can paste into Cloud Shell, with the expected output and the point interviewers want to hear. Tap a topic to switch.</p>
        </motion.div>
        <div className="sql-rail" role="tablist" aria-label="Free gcloud snippets">
          {FREE_SNIPPETS.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              id={`gtab-${x.id}`}
              aria-selected={active === x.id}
              aria-controls={`gpanel-${x.id}`}
              className={`sql-pill${active === x.id ? " is-active" : ""}`}
              onClick={() => setActive(x.id)}
            >
              {x.tab}
            </button>
          ))}
        </div>
        {FREE_SNIPPETS.map((x) => (
          <div key={x.id} className="sql-lesson" role="tabpanel" id={`gpanel-${x.id}`} aria-labelledby={`gtab-${x.id}`} hidden={active !== x.id}>
            <div className="lld-card sql-lesson-info">
              <div className="sql-lesson-meta">
                <span className={`sql-badge ${x.level}`}>{x.level}</span>
                <span className="sql-badge">{x.chapter}</span>
              </div>
              <h3>{x.title}</h3>
              <p>{x.intro}</p>
              <div className="sql-tip">
                <Lightbulb size={16} />
                <span><strong>Interview tip:</strong> {x.tip}</span>
              </div>
            </div>
            <div className="sql-code">
              <div className="sql-code-bar">
                <span className="sql-dots"><i /><i /><i /></span>
                <span className="sql-code-name sql-mono">{x.file}</span>
                <CopyButton text={x.code} />
              </div>
              <pre><code><ShellHighlight code={x.code} /></code></pre>
              <div className="sql-out">
                <div className="sql-out-label">✓ Expected output</div>
                <pre>{x.out}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ServiceAnatomy({ animation }) {
  return (
    <section className="lld-section-tight" id="anatomy" aria-labelledby="gcp-anatomy-title">
      <div className="lld-shell">
        <motion.div className="lld-section-head" {...animation}>
          <div className="lld-kicker">One structure, {SERVICE_COUNT} services</div>
          <h2 id="gcp-anatomy-title">Every service chapter has the same 12 parts</h2>
          <p>Learn the pattern once and every new service becomes faster to read, compare and remember.</p>
        </motion.div>
        <div className="gcp-anatomy">
          {SERVICE_SECTIONS.map((s, i) => (
            <motion.div
              className="lld-card gcp-spot gcp-sec"
              key={s.t}
              onMouseMove={spot}
              {...animation}
              transition={{ ...animation.transition, delay: (i % 4) * 0.06 }}
            >
              <span className="gcp-sec-n">{String(i + 1).padStart(2, "0")}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LearningPath({ animation, reduce }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.3 });
  return (
    <section className="lld-section" id="path" aria-labelledby="gcp-path-title">
      <div className="lld-shell">
        <motion.div className="lld-section-head" {...animation}>
          <div className="lld-kicker">Your learning path</div>
          <h2 id="gcp-path-title">From first project to production architect</h2>
          <p>Eighteen parts grouped into six stages, ordered the way real Google Cloud platforms are built.</p>
        </motion.div>
        <div className="gcp-path" ref={ref}>
          <div className="gcp-path-rail" aria-hidden="true">
            <motion.span style={reduce ? { scaleY: 1 } : { scaleY }} />
          </div>
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <motion.div
                className="gcp-stage"
                key={stage.title}
                initial={reduce ? false : { opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="gcp-stage-node"><Icon size={16} /></span>
                <div className="lld-card gcp-spot gcp-stage-card" onMouseMove={spot}>
                  <div className="gcp-stage-top">
                    <span className="sql-badge">Stage {i + 1}</span>
                    <span className="gcp-stage-parts">{stage.parts}</span>
                  </div>
                  <h3>{stage.title}</h3>
                  <p>{stage.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ServicePicker({ animation }) {
  const [i, setI] = useState(0);
  const item = PICKER[i];
  return (
    <section className="lld-section-tight" id="picker" aria-labelledby="gcp-picker-title">
      <div className="lld-shell">
        <motion.div className="lld-section-head" {...animation}>
          <div className="lld-kicker">Interactive · decision guide</div>
          <h2 id="gcp-picker-title">Which Google Cloud service fits?</h2>
          <p>The book teaches you to choose, not just to list. Pick a need to see the usual answer and where to read more.</p>
        </motion.div>
        <div className="gcp-picker">
          <div className="gcp-needs" role="tablist" aria-label="Choose a need">
            {PICKER.map((p, idx) => (
              <button
                key={p.need}
                type="button"
                role="tab"
                aria-selected={i === idx}
                className={`gcp-need${i === idx ? " is-active" : ""}`}
                onClick={() => setI(idx)}
              >
                <span>{p.need}</span>
                <ChevronRight size={15} />
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={item.pick}
              className="lld-card gcp-answer"
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
            >
              <span className="sql-badge">Usually the answer</span>
              <h3>{item.pick}</h3>
              <p>{item.why}</p>
              <p className="gcp-alt"><Lightbulb size={15} /> {item.alt}</p>
              <span className="gcp-where">Read more in chapter {item.chapter}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function RefArchitectures({ animation }) {
  return (
    <section className="lld-section-tight" id="architectures" aria-labelledby="gcp-ref-title">
      <div className="lld-shell">
        <motion.div className="lld-section-head" {...animation}>
          <div className="lld-kicker">Part 17 · reference architectures</div>
          <h2 id="gcp-ref-title">Five architectures that tie it all together</h2>
          <p>See how services combine in real designs. Typical flows are shown below, and the book explains why each choice was made.</p>
        </motion.div>
        <div className="gcp-refs">
          {REF_ARCHS.map((r, idx) => (
            <motion.article
              className="lld-card gcp-spot gcp-ref"
              key={r.n}
              onMouseMove={spot}
              {...animation}
              transition={{ ...animation.transition, delay: (idx % 2) * 0.08 }}
            >
              <div className="gcp-ref-head">
                <span className="sql-ch-n">{r.n}</span>
                <div>
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                </div>
              </div>
              <div className="gcp-flow" aria-label={`Typical flow: ${r.flow.join(", then ")}`}>
                {r.flow.map((step, si) => (
                  <React.Fragment key={step}>
                    <span className="gcp-flow-node" style={{ "--d": `${si * 0.35}s` }}>{step}</span>
                    {si < r.flow.length - 1 && <ArrowRight size={14} className="gcp-flow-arrow" aria-hidden="true" />}
                  </React.Fragment>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChapterCard({ chapter, index }) {
  return (
    <article className="sql-ch gcp-spot" style={{ "--i": index }} onMouseMove={spot}>
      <div className="sql-ch-top">
        <span className="sql-ch-n">{chapter.n}</span>
        <h4>{chapter.title}</h4>
      </div>
      {chapter.s ? (
        <>
          <p className="gcp-svc-note">
            <span className="sql-badge">Service deep-dive</span>
          </p>
          <p className="gcp-svc-list">Follows the 12-part structure: at a glance, what it is, when to use it, key concepts, architecture, console walkthrough, gcloud, deep-dives, billing, best practices, pitfalls and interview notes</p>
        </>
      ) : (
        chapter.topics?.length > 0 && (
          <ul>
            {chapter.topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        )
      )}
    </article>
  );
}

function PartsExplorer({ animation }) {
  const [active, setActive] = useState(1);
  return (
    <section className="lld-section" id="curriculum">
      <div className="lld-shell">
        <motion.div className="lld-section-head" {...animation}>
          <div className="lld-kicker">Complete table of contents</div>
          <h2>{PARTS.length} parts. {CHAPTER_COUNT} chapters. Every service covered.</h2>
          <p>Pick a part to explore its chapters and the topics inside them.</p>
        </motion.div>
        <motion.div className="sql-ptabs gcp-ptabs" role="tablist" aria-label="Book parts" {...animation}>
          {PARTS.map((part) => (
            <button
              key={part.id}
              type="button"
              role="tab"
              id={`gptab-${part.id}`}
              aria-selected={active === part.id}
              aria-controls={`gppanel-${part.id}`}
              className={`sql-ptab${active === part.id ? " is-active" : ""}`}
              onClick={() => setActive(part.id)}
            >
              <span className="sql-ptab-num">{String(part.id).padStart(2, "0")}</span>
              <span className="sql-ptab-title">{part.title}</span>
              <span className="sql-ptab-meta">{part.chapters.length} chapters</span>
            </button>
          ))}
        </motion.div>
        {PARTS.map((part) => {
          const Icon = part.icon;
          const svc = part.chapters.filter((c) => c.s).length;
          return (
            <div key={part.id} className="lld-card sql-panel" role="tabpanel" id={`gppanel-${part.id}`} aria-labelledby={`gptab-${part.id}`} hidden={active !== part.id}>
              <span className="sql-panel-mark" aria-hidden="true">{part.id}</span>
              <div className="sql-panel-head">
                <span className="lld-module-icon"><Icon size={19} /></span>
                <div>
                  <div className="lld-kicker">Part {part.id}</div>
                  <h3>{part.title}</h3>
                  <p>{part.summary}</p>
                </div>
              </div>
              <div className="sql-panel-stats">
                <span className="sql-badge">{part.chapters.length} chapters</span>
                {svc > 0 && <span className="sql-badge">{svc} service deep-dives</span>}
              </div>
              <div className="sql-ch-grid">
                {part.chapters.map((chapter, index) => (
                  <ChapterCard chapter={chapter} index={index} key={chapter.n} />
                ))}
              </div>
            </div>
          );
        })}
        <div className="gcp-appendix">
          <motion.h3 {...animation}>Appendices</motion.h3>
          <div className="gcp-appendix-grid">
            {APPENDICES.map((a, idx) => (
              <motion.div
                className="lld-card gcp-spot gcp-app"
                key={a.title}
                onMouseMove={spot}
                {...animation}
                transition={{ ...animation.transition, delay: idx * 0.07 }}
              >
                <span className="sql-ch-n">{String.fromCharCode(65 + idx)}</span>
                <h4>{a.title}</h4>
                <p>{a.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export const gcpStyles = `
@keyframes gcpLine { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
@keyframes gcpPulse { 0%,100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 0%, transparent); } 50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--accent) 18%, transparent); } }
.gcp-term-wrap { width: 100%; max-width: 560px; min-width: 0; position: relative; z-index: 2; }
.gcp-spot { position: relative; }
.gcp-spot::before { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0; transition: opacity .3s ease; background: radial-gradient(280px circle at var(--sx, 50%) var(--sy, 50%), color-mix(in srgb, var(--accent) 20%, transparent), transparent 62%); }
.gcp-spot:hover::before { opacity: 1; }
.gcp-lines { list-style: none; margin: 0; padding: 4px 16px 12px; display: grid; gap: 4px; font: 11.5px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace; color: #E9DDD0; }
.gcp-lines li { animation: gcpLine .4s ease both; }
.gcp-lines li::before { content: "✓ "; color: #4ADE80; }
.sql-hero .sql-stage .sql-term-code { min-height: 150px; }

.gcp-anatomy { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.gcp-sec { padding: 20px; min-height: 150px; overflow: hidden; }
.gcp-sec-n { position: absolute; right: 14px; top: 8px; font-size: 44px; font-weight: 900; letter-spacing: -.05em; color: var(--soft); line-height: 1; }
.gcp-sec h3 { position: relative; margin: 0 0 8px; font-size: 15px; padding-right: 36px; }
.gcp-sec p { position: relative; margin: 0; color: var(--muted); font-size: 12px; line-height: 1.65; }

.gcp-path { position: relative; max-width: 820px; margin: 0 auto; padding-left: 58px; display: grid; gap: 18px; }
.gcp-path-rail { position: absolute; left: 19px; top: 8px; bottom: 8px; width: 3px; border-radius: 3px; background: var(--border); }
.gcp-path-rail span { display: block; width: 100%; height: 100%; border-radius: 3px; background: linear-gradient(180deg, #EA580C, #FB923C, #F59E0B); transform-origin: top; }
.gcp-stage { position: relative; }
.gcp-stage-node { position: absolute; left: -58px; top: 14px; width: 42px; height: 42px; display: grid; place-items: center; border-radius: 50%; background: var(--surface); border: 2px solid var(--accent); color: var(--accent); animation: gcpPulse 3s ease-in-out infinite; }
.gcp-stage-card { padding: 18px 20px; }
.gcp-stage-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.gcp-stage-parts { color: var(--muted); font-size: 11px; font-weight: 800; }
.gcp-stage-card h3 { position: relative; margin: 10px 0 6px; font-size: 17px; }
.gcp-stage-card p { position: relative; margin: 0; color: var(--muted); font-size: 13px; line-height: 1.7; }

.gcp-picker { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px; align-items: stretch; max-width: 1000px; margin: 0 auto; }
.gcp-needs { display: grid; gap: 8px; align-content: start; }
.gcp-need { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 13px 15px; text-align: left; border: 1px solid var(--border); border-radius: 14px; background: var(--surface); color: var(--text); font-size: 13px; font-weight: 700; line-height: 1.4; cursor: pointer; transition: all .25s ease; }
.gcp-need svg { flex: none; color: var(--muted); transition: translate .25s; }
.gcp-need:hover { border-color: var(--accent); translate: 4px 0; }
.gcp-need:hover svg { translate: 3px 0; color: var(--accent); }
.gcp-need.is-active { border-color: transparent; background: linear-gradient(110deg, #EA580C, #F97316); color: #fff; box-shadow: 0 10px 22px rgba(234,88,12,.25); }
.gcp-need.is-active svg { color: #fff; }
.gcp-answer { padding: 24px; min-height: 260px; display: flex; flex-direction: column; gap: 10px; align-items: flex-start; }
.gcp-answer h3 { margin: 6px 0 0; font-size: clamp(22px, 3vw, 28px); background: linear-gradient(100deg, #EA580C, #F59E0B); -webkit-background-clip: text; background-clip: text; color: transparent !important; }
.gcp-answer p { margin: 0; color: var(--muted); font-size: 13.5px; line-height: 1.75; }
.gcp-alt { display: flex; gap: 8px; align-items: flex-start; padding: 12px; border-radius: 12px; background: var(--soft); color: var(--text) !important; font-size: 12.5px !important; }
.gcp-alt svg { flex: none; margin-top: 2px; color: var(--accent); }
.gcp-where { margin-top: auto; color: var(--accent); font-size: 12px; font-weight: 900; }

.gcp-refs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.gcp-refs .gcp-ref:last-child { grid-column: 1 / -1; }
.gcp-ref { padding: 22px; overflow: hidden; }
.gcp-ref-head { position: relative; display: flex; gap: 13px; align-items: flex-start; }
.gcp-ref-head h3 { margin: 2px 0 4px; font-size: 17px; }
.gcp-ref-head p { margin: 0; color: var(--muted); font-size: 12.5px; line-height: 1.65; }
.gcp-flow { position: relative; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 18px; }
.gcp-flow-node { padding: 8px 12px; border: 1px solid color-mix(in srgb, var(--accent) 40%, var(--border)); border-radius: 10px; background: var(--surface-2); color: var(--text); font-size: 11.5px; font-weight: 800; animation: gcpPulse 3.2s ease-in-out infinite; animation-delay: var(--d, 0s); }
.gcp-flow-arrow { color: var(--accent); flex: none; }

.gcp-ptabs { grid-template-columns: repeat(6, minmax(0, 1fr)); }
.gcp-svc-note { margin: 12px 0 6px; }
.gcp-svc-list { margin: 0; color: var(--muted); font-size: 11.5px; line-height: 1.6; }
.gcp-appendix { margin-top: 42px; }
.gcp-appendix h3 { margin: 0 0 14px; text-align: center; font-size: clamp(20px, 3vw, 26px); }
.gcp-appendix-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.gcp-app { padding: 20px; }
.gcp-app h4 { position: relative; margin: 12px 0 6px; font-size: 15px; color: var(--text); }
.gcp-app p { position: relative; margin: 0; color: var(--muted); font-size: 12.5px; line-height: 1.7; }
.gcp-app .sql-ch-n { position: relative; width: 36px; }

@media (max-width: 1100px) { .gcp-ptabs { grid-template-columns: repeat(3, minmax(0, 1fr)); } .gcp-anatomy { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 950px) {
  .gcp-picker { grid-template-columns: minmax(0, 1fr); }
  .gcp-refs { grid-template-columns: minmax(0, 1fr); }
  .gcp-appendix-grid { grid-template-columns: minmax(0, 1fr); }
  .gcp-anatomy { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .gcp-ptabs { display: flex; grid-template-columns: none; }
  .gcp-path { padding-left: 48px; }
  .gcp-path-rail { left: 15px; }
  .gcp-stage-node { left: -48px; width: 34px; height: 34px; top: 12px; }
  .gcp-stage-card { padding: 15px; }
  .gcp-anatomy { gap: 10px; }
  .gcp-sec { padding: 16px; min-height: 0; }
  .gcp-sec-n { font-size: 34px; }
  .gcp-answer { padding: 18px; min-height: 0; }
  .gcp-ref { padding: 16px; }
  .gcp-flow { gap: 6px; }
  .gcp-flow-node { padding: 6px 9px; font-size: 10.5px; }
}
@media (max-width: 520px) { .gcp-anatomy { grid-template-columns: minmax(0, 1fr); } }
@media (hover: none) { .gcp-spot::before { display: none; } }
@media (prefers-reduced-motion: reduce) {
  .gcp-lines li, .gcp-flow-node, .gcp-stage-node { animation: none !important; }
}
`;

export default function GcpHandbook({ navbarOffset = 64 }) {
  const reduceMotion = useReducedMotion();
  const [theme, setTheme] = useState(readTheme);
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");
  const [openFaq, setOpenFaq] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const heroRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(true);
  const { scrollY } = useScroll();
  const blobY = useTransform(scrollY, [0, 700], [0, 130]);
  const blobY2 = useTransform(scrollY, [0, 700], [0, -90]);
  const termY = useTransform(scrollY, [0, 700], [0, 40]);

  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleStageMove = (event) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", (((event.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3));
    event.currentTarget.style.setProperty("--my", (((event.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3));
  };
  const handleStageLeave = (event) => {
    event.currentTarget.style.setProperty("--mx", "0");
    event.currentTarget.style.setProperty("--my", "0");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referralCode = (params.get("referralCode") || params.get("ref") || "").trim();
    if (referralCode) window.localStorage.setItem("referralCode", referralCode);
  }, []);

  useEffect(() => {
    setTheme(readTheme());
    const onTheme = (event) => {
      const next = event?.detail?.theme;
      if (next === "dark" || next === "light") setTheme(next);
    };
    const onStorage = (event) => {
      if (event.key === THEME_KEY && (event.newValue === "dark" || event.newValue === "light")) setTheme(event.newValue);
    };
    window.addEventListener(THEME_EVENT, onTheme);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(THEME_EVENT, onTheme);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoadingProduct(true);
        setProductError("");
        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(window.location.pathname)}`,
          { method: "GET", cache: "no-store", headers: { Accept: "application/json" }, signal: controller.signal },
        );
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.success || !result?.data) {
          throw new Error(result?.error?.message || result?.message || "Unable to load the current product details.");
        }
        setProduct(result.data);
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("Failed to fetch GCP product:", error);
        setProduct(null);
        setProductError(error?.message || "Unable to load the current product details.");
      } finally {
        if (!controller.signal.aborted) setLoadingProduct(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const trackedViewRef = useRef(null);
  useEffect(() => {
    if (!product?._id || product.price == null) return;
    const amount = Number(product.price);
    if (!Number.isFinite(amount) || amount < 0) return;
    const key = `${product._id}:${amount}:${product.currency || "INR"}`;
    if (trackedViewRef.current === key) return;
    const sent = trackViewContent({
      id: String(product._id),
      title: product.title || "Google Cloud (GCP) Engineer's Handbook",
      price: amount,
      currency: product.currency || "INR",
    });
    if (sent !== false) trackedViewRef.current = key;
  }, [product?._id, product?.title, product?.price, product?.currency]);

  const currency = product?.currency || "INR";
  const currentPrice = Number(product?.price);
  const validPrice = product?.price != null && product.price !== "" && Number.isFinite(currentPrice) && currentPrice >= 0;
  const mrp = Number(product?.mrp ?? 0);
  const discount = mrp > currentPrice && mrp > 0 ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0;
  const formatMoney = (amount, code = currency) => {
    const locale = { INR: "en-IN", USD: "en-US", GBP: "en-GB", EUR: "en-IE", AUD: "en-AU", CAD: "en-CA" }[code] || "en";
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: code,
        maximumFractionDigits: Number.isInteger(Number(amount)) ? 0 : 2,
      }).format(Number(amount || 0));
    } catch {
      return `${code} ${Number(amount || 0)}`;
    }
  };
  const canBuy = !loadingProduct && !productError && validPrice && Boolean(product?._id) && product?.isActive !== false;
  const displayedPrice = loadingProduct ? "Loading" : productError || !validPrice ? "Unavailable" : formatMoney(currentPrice);
  const openCheckout = () => {
    if (canBuy) setCheckoutOpen(true);
  };

  const animation = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 28, scale: 0.96 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        viewport: { once: true, amount: 0.16 },
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
      };

  const productName = product?.title || "Google Cloud (GCP) Engineer's Handbook";
  const seoImage = product?.coverpageurl || product?.coverPageUrl || product?.cover_page_url || "";

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, email: SUPPORT_EMAIL },
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, publisher: { "@id": `${SITE_URL}/#organization` } },
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: SEO_TITLE,
        description: SEO_DESCRIPTION,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${PAGE_URL}#book` },
        speakable: { "@type": "SpeakableSpecification", cssSelector: ["#gcp-quick-answer", "#faq"] },
        ...(seoImage ? { primaryImageOfPage: { "@type": "ImageObject", url: seoImage } } : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
          { "@type": "ListItem", position: 3, name: "Google Cloud (GCP) Engineer's Handbook", item: PAGE_URL },
        ],
      },
      {
        "@type": "Book",
        "@id": `${PAGE_URL}#book`,
        name: productName,
        description: SEO_LONG_DESCRIPTION,
        url: PAGE_URL,
        bookFormat: "https://schema.org/EBook",
        inLanguage: "en",
        about: ["Google Cloud Platform", "Cloud computing", "Kubernetes", "BigQuery", "Cloud security"],
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        ...(seoImage ? { image: seoImage } : {}),
      },
      {
        "@type": "Product",
        "@id": `${PAGE_URL}#product`,
        name: productName,
        description: SEO_LONG_DESCRIPTION,
        url: PAGE_URL,
        category: "Google Cloud Platform Ebook",
        brand: { "@type": "Brand", name: SITE_NAME },
        ...(product?._id ? { sku: String(product._id) } : {}),
        ...(seoImage ? { image: [seoImage] } : {}),
        ...(canBuy
          ? {
              offers: {
                "@type": "Offer",
                url: PAGE_URL,
                price: currentPrice,
                priceCurrency: currency,
                priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
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
        "@id": `${PAGE_URL}#curriculum`,
        name: "Parts of the Google Cloud (GCP) Engineer's Handbook",
        numberOfItems: PARTS.length,
        itemListElement: PARTS.map((part, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: part.title,
          description: part.chapters.map((c) => `${c.n} ${c.title}`).join("; "),
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${PAGE_URL}#faq`,
        mainEntity: FAQS.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ],
  };

  const seoHead = (
    <Helmet htmlAttributes={{ lang: "en" }}>
      <title>{SEO_TITLE}</title>
      <meta name="description" content={SEO_DESCRIPTION} />
      <meta name="keywords" content={SEO_KEYWORDS} />
      <meta name="author" content={SITE_NAME} />
      <meta name="application-name" content={SITE_NAME} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="theme-color" content={theme === "dark" ? "#141210" : "#FAF9F6"} />
      <meta name="color-scheme" content={theme === "dark" ? "dark light" : "light dark"} />
      <link rel="canonical" href={PAGE_URL} />
      <link rel="alternate" hrefLang="en-IN" href={PAGE_URL} />
      <link rel="alternate" hrefLang="x-default" href={PAGE_URL} />
      {seoImage && <link rel="preload" as="image" href={seoImage} />}
      <meta property="og:type" content="product" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={SEO_TITLE} />
      <meta property="og:description" content={SEO_DESCRIPTION} />
      <meta property="og:url" content={PAGE_URL} />
      {seoImage && <meta property="og:image" content={seoImage} />}
      {seoImage && <meta property="og:image:alt" content={`${productName} ebook cover`} />}
      {canBuy && <meta property="product:price:amount" content={String(currentPrice)} />}
      {canBuy && <meta property="product:price:currency" content={currency} />}
      <meta name="twitter:card" content={seoImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={SEO_TITLE} />
      <meta name="twitter:description" content={SEO_DESCRIPTION} />
      {seoImage && <meta name="twitter:image" content={seoImage} />}
      <script type="application/ld+json">{JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>
    </Helmet>
  );

  return (
    <>
      <div
        className="lldPage lld-expanded"
        data-theme={theme}
        style={{ "--lld-navbar-offset": typeof navbarOffset === "number" ? `${navbarOffset}px` : navbarOffset }}
      >
        {seoHead}
        <style>{baseStyles}</style>
        <style>{sqlStyles}</style>
        <style>{gcpStyles}</style>
        <ScrollProgress />

        <main id="top">
          <section className="lld-hero sql-hero" ref={heroRef}>
            <div className="sql-hero-bg" aria-hidden="true">
              <span className="sql-gridlines" />
              <motion.span className="sql-blob sql-blob-a" style={reduceMotion ? undefined : { y: blobY }} />
              <motion.span className="sql-blob sql-blob-b" style={reduceMotion ? undefined : { y: blobY2 }} />
            </div>
            <div className="lld-shell lld-hero-grid">
              <motion.div {...animation}>
                <div className="lld-eyebrow">
                  <Cloud size={13} /> Google Cloud · complete engineer's handbook
                </div>
                <h1>
                  Master Google Cloud.
                  <br />
                  <span className="lld-gradient-text">Build, secure, scale.</span>
                </h1>
                <RotatingTopic reduce={reduceMotion} />
                <p className="lld-hero-copy">
                  18 parts, {CHAPTER_COUNT} chapters and {SERVICE_COUNT} service deep-dives: from regions and IAM to
                  GKE, Cloud Run, BigQuery, networking, security and AI, with five reference
                  architectures and interview preparation.
                </p>
                <div className="lld-hero-actions">
                  <button className="lld-cta" type="button" onClick={openCheckout} disabled={!canBuy}>
                    Get the ebook {displayedPrice !== "Unavailable" && <span>{displayedPrice}</span>} <ArrowRight size={16} />
                  </button>
                  <a className="lld-cta lld-cta-outline" href="#free-snippets">
                    <Terminal size={16} /> Try free gcloud snippets
                  </a>
                </div>
                {productError && (
                  <p className="lld-error">Price is temporarily unavailable. Please try again or contact {SUPPORT_EMAIL}.</p>
                )}
                <div className="sql-trust">
                  <span><Check size={13} /> {SERVICE_COUNT} service deep-dives</span>
                  <span><Check size={13} /> Working gcloud commands</span>
                  <span><Check size={13} /> 5 reference architectures</span>
                </div>
              </motion.div>

              <motion.div
                className="sql-stage"
                onMouseMove={handleStageMove}
                onMouseLeave={handleStageLeave}
                initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <div className="sql-chip sql-chip-a"><Zap size={15} color="#FB923C" /> Cloud Run & GKE</div>
                <div className="sql-chip sql-chip-b"><BarChart3 size={15} color="#F59E0B" /> BigQuery & Pub/Sub</div>
                <motion.div style={reduceMotion ? undefined : { y: termY }} className="gcp-term-wrap">
                  <HeroTerminal reduce={reduceMotion} />
                </motion.div>
                <div className="sql-mini-book" aria-hidden="true">
                  {seoImage ? (
                    <img src={seoImage} alt="" loading="lazy" />
                  ) : (
                    <div><small>Target Trek</small>GCP<br />Handbook</div>
                  )}
                </div>
              </motion.div>
            </div>
            <div className="lld-hero-bottom" />
          </section>

          <div className="sql-marquee" aria-hidden="true">
            <div className="sql-marquee-track">
              {[...MARQUEE, ...MARQUEE].map((topic, i) => (
                <span key={`${topic}-${i}`}>{topic}</span>
              ))}
            </div>
          </div>

          <section className="lld-shell" aria-label="Book highlights">
            <ScrollScale className="lld-stats-scale">
              <div className="lld-stats">
                {stats.map(([value, label], index) => (
                  <motion.div
                    className="lld-stat"
                    key={label}
                    {...animation}
                    transition={{ ...animation.transition, delay: index * 0.05 }}
                  >
                    <strong><CountUp to={Number(value)} suffix={value === 120 ? "+" : ""} /></strong>
                    <span>{label}</span>
                  </motion.div>
                ))}
              </div>
            </ScrollScale>
          </section>

          <section className="lld-section-tight" aria-labelledby="gcp-quick-title">
            <div className="lld-shell">
              <motion.div className="sql-quick" id="gcp-quick-answer" {...animation}>
                <div className="lld-kicker">In short</div>
                <h2 id="gcp-quick-title">What is the Google Cloud (GCP) Engineer's Handbook?</h2>
                <p>{QUICK_ANSWER}</p>
              </motion.div>
            </div>
          </section>

          <LearningPath animation={animation} reduce={reduceMotion} />
          <ServiceAnatomy animation={animation} />
          <FreeSnippets animation={animation} />
          <ServicePicker animation={animation} />
          <PartsExplorer animation={animation} />
          <RefArchitectures animation={animation} />

          <section className="lld-section-tight" id="faq">
            <div className="lld-shell">
              <motion.div className="lld-section-head" {...animation}>
                <div className="lld-kicker">Quick answers</div>
                <h2>Before you start</h2>
                <p>What the book covers and who it is for.</p>
              </motion.div>
              <div className="lld-faq">
                {FAQS.map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div className="lld-faq-item" key={item.q}>
                      <button
                        className="lld-faq-button"
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        aria-expanded={isOpen}
                        aria-controls={`gcp-faq-${index}`}
                      >
                        <span>{item.q}</span>
                        <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                          <ChevronDown size={17} />
                        </motion.span>
                      </button>
                      <div className={`lld-faq-collapse${isOpen ? " is-open" : ""}`} id={`gcp-faq-${index}`} role="region">
                        <div className="lld-faq-collapse-inner">
                          <div className="lld-faq-answer">{item.a}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="sql-related">
                <a className="lld-cta lld-cta-outline" href="/book/system-design/hld">System Design HLD book <ArrowRight size={15} /></a>
                <a className="lld-cta lld-cta-outline" href="/book/database/sql">SQL & Database book <ArrowRight size={15} /></a>
              </div>
            </div>
          </section>

          <section className="lld-section-tight">
            <div className="lld-shell">
              <ScrollScale from={0.9}>
                <motion.div className="lld-final-cta" {...animation}>
                  <div className="lld-final-copy">
                    <div className="lld-eyebrow"><Sparkles size={13} /> Become fluent in Google Cloud</div>
                    <h2>Go from first project to production architecture.</h2>
                    <p>
                      Get the handbook and learn every major service with one consistent structure,
                      real commands, reference architectures and interview practice.
                    </p>
                    <div className="lld-final-checks">
                      <span><Check size={14} /> {PARTS.length} parts</span>
                      <span><Check size={14} /> {SERVICE_COUNT} service deep-dives</span>
                      <span><Check size={14} /> Interview prep</span>
                    </div>
                  </div>
                  <div className="lld-price-card">
                    <div className="lld-price-label">Digital ebook · instant access after checkout</div>
                    <div className="lld-price-line">
                      {loadingProduct ? (
                        <div className="lld-skeleton" />
                      ) : (
                        <span className="lld-price-now">
                          {productError || !validPrice ? "Price unavailable" : formatMoney(currentPrice)}
                        </span>
                      )}
                      {!loadingProduct && !productError && mrp > currentPrice && (
                        <span className="lld-price-old">{formatMoney(mrp)}</span>
                      )}
                    </div>
                    {!loadingProduct && !productError && discount > 0 && (
                      <div className="lld-discount">Save {discount}% on the current price</div>
                    )}
                    <button className="lld-cta" type="button" onClick={openCheckout} disabled={!canBuy}>
                      {loadingProduct ? "Loading price..." : "Get the ebook"} <ArrowRight size={16} />
                    </button>
                    {productError && <p className="lld-error">{productError}</p>}
                    <p className="lld-price-small">
                      Digital products are non-refundable after purchase.
                      <br />
                      Questions?{" "}
                      <a href={`mailto:${SUPPORT_EMAIL}`} style={{ textDecoration: "underline" }}>{SUPPORT_EMAIL}</a>
                    </p>
                  </div>
                </motion.div>
              </ScrollScale>
            </div>
          </section>
        </main>

        <div
          className={["lld-sticky", heroVisible && !loadingProduct ? "is-hero-visible" : "", checkoutOpen ? "is-checkout-open" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="lld-sticky-card">
            <div className="lld-sticky-info">
              <strong className="lld-sticky-title">Google Cloud (GCP) Engineer's Handbook</strong>
              <div className="lld-sticky-price">
                <span className="lld-sticky-now">
                  {loadingProduct ? "Loading…" : productError || !validPrice ? "Price unavailable" : formatMoney(currentPrice)}
                </span>
                {!loadingProduct && !productError && mrp > currentPrice && (
                  <span className="lld-sticky-old">{formatMoney(mrp)}</span>
                )}
                {!loadingProduct && !productError && discount > 0 && <span className="lld-sticky-off">{discount}% off</span>}
              </div>
              <small className="lld-sticky-sub">Google Cloud Handbook</small>
            </div>
            <div className="lld-sticky-actions">
              <a className="lld-cta lld-cta-outline lld-sticky-preview" href="#free-snippets">
                <Terminal size={15} /> Free snippets
              </a>
              <button className="lld-cta lld-pulse" type="button" onClick={openCheckout} disabled={!canBuy}>
                Get the ebook <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <PayUCheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} product={product} />,
          document.body,
        )}
    </>
  );
}
