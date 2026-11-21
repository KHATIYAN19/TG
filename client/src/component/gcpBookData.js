/*
  Content for /book/cloud/gcp: the Google Cloud (GCP) Engineer's Handbook.
  Everything here comes from the book's table of contents. Do not add parts, chapters or claims that are not in the book.
  Plain data only (no imports, no references between constants): scripts/gen-seo-data.mjs reads HANDBOOK, PARTS_RAW,
  QUICK_ANSWER and PICKER from this file to build the server-rendered page that search engines and AI crawlers see.
  A chapter with deep: true is a full service chapter that follows the 12-part template (SERVICE_TEMPLATE).
*/

export const PAGE_URL = "/book/cloud/gcp";
export const OTHER_URL = "/book/cloud/aws";

export const HANDBOOK = {
  title: "Google Cloud (GCP) Engineer's Handbook",
  tagline: "The whole Google Cloud platform in 18 parts: every service chapter built on the same 12-part template, 5 reference architectures, certification guidance, interview questions and a gcloud cheat sheet.",
  includes: [
    "18 parts, from how Google Cloud is built to certifications",
    "Every service chapter follows the same 12-part template",
    "Working gcloud commands and console walkthroughs",
    "How you are billed, best practices and common pitfalls per service",
    "5 reference architectures with the reasoning behind each choice",
    "Interview questions, gcloud cheat sheet, glossary, A–Z catalogue of about 120 services",
  ],
};

export const QUICK_ANSWER =
  "The Google Cloud (GCP) Engineer's Handbook is an 18-part PDF ebook by Target Trek that teaches the whole Google Cloud platform: how Google Cloud is built, identity and governance, compute, containers, serverless, storage, databases, data and analytics, networking, security, AI, DevOps, observability, FinOps, APIs and migration. Every service chapter follows the same 12-part structure, and the book ends with five reference architectures, certification guidance, interview questions and a gcloud cheat sheet. It uses the 2026 service names, such as Gemini Enterprise Agent Platform (formerly Vertex AI).";

export const SERVICE_TEMPLATE = [
  { title: "At a glance", copy: "Category, use it for, compare with, scope and tier." },
  { title: "What it is", copy: "A plain-language explanation of the service." },
  { title: "When to use it", copy: "And, just as important, when not to." },
  { title: "Key concepts", copy: "The vocabulary you need to read the docs." },
  { title: "Architecture", copy: "A diagram of how the pieces fit together." },
  { title: "Console walkthrough", copy: "A mockup and numbered steps." },
  { title: "Command line", copy: "Working gcloud commands." },
  { title: "Deep-dive sections", copy: "Extra sections for the service's trickier ideas." },
  { title: "How you are billed", copy: "What drives the price on the invoice." },
  { title: "Best practices", copy: "Habits that keep production healthy." },
  { title: "Common pitfalls", copy: "Mistakes engineers repeatedly make." },
  { title: "Interview & certification notes", copy: "What gets asked and why." },
];

/* number; title; summary; chapters: { n, title, deep?, topics? } */
export const PARTS_RAW = [
  {
    number: "01", title: "Foundations: How Google Cloud Is Built",
    summary: "Regions, zones, the resource hierarchy, the console, gcloud, billing and the mental model behind every service.",
    chapters: [
      { n: "1.1", title: "How to Read This Handbook", topics: ["What every service chapter contains", "How commands in this book were checked", "Names changed in 2026: read this once"] },
      { n: "1.2", title: "Global Infrastructure: Regions, Zones and the Edge", topics: ["Choosing a region", "Network service tiers"] },
      { n: "1.3", title: "Resource Hierarchy: Organization, Folders, Projects", topics: ["The three project identifiers", "Labels vs tags", "Recommended structure"] },
      { n: "1.4", title: "The Google Cloud Console: A Guided Tour", topics: ["Five things to learn in your first hour"] },
      { n: "1.5", title: "Tooling: gcloud, Cloud Shell, SDKs, Terraform", topics: ["Installing and initialising gcloud", "Two kinds of login (the most common beginner confusion)", "Configurations, defaults and APIs", "Output control"] },
      { n: "1.6", title: "Billing, Quotas and the Free Tier", topics: ["Free options for learning", "Quotas are not budgets"] },
      { n: "1.7", title: "Well-Architected Framework and Shared Responsibility", topics: ["Shared responsibility, and \"shared fate\""] },
      { n: "1.8", title: "The Service Map: Everything at a Glance" },
    ],
  },
  {
    number: "02", title: "Identity, Access and Governance",
    summary: "Who can do what, with which identity, and which guardrails apply across the whole organization.",
    chapters: [
      { n: "2.1", title: "Identity and Access Management (IAM)", deep: true },
      { n: "2.2", title: "Service Accounts", deep: true },
      { n: "2.3", title: "Workload Identity Federation", deep: true },
      { n: "2.4", title: "Organization Policy and Resource Manager", deep: true },
    ],
  },
  {
    number: "03", title: "Compute: Virtual Machines and Batch",
    summary: "Virtual machines, instance groups, disks and batch processing, plus the other compute options.",
    chapters: [
      { n: "3.1", title: "Compute Engine", deep: true },
      { n: "3.2", title: "Instance Templates and Managed Instance Groups", deep: true },
      { n: "3.3", title: "Persistent Disk and Hyperdisk", deep: true },
      { n: "3.4", title: "Batch", deep: true },
      { n: "3.5", title: "Other Compute Options" },
    ],
  },
  {
    number: "04", title: "Containers and Kubernetes",
    summary: "GKE, Artifact Registry, Cloud Run and service mesh, with a clear guide to choosing between them.",
    chapters: [
      { n: "4.1", title: "Google Kubernetes Engine (GKE)", deep: true },
      { n: "4.2", title: "Artifact Registry", deep: true },
      { n: "4.3", title: "Cloud Run", deep: true },
      { n: "4.4", title: "Cloud Service Mesh and GKE Enterprise", deep: true },
      { n: "4.5", title: "Choosing: Compute Engine vs GKE vs Cloud Run vs Run functions" },
    ],
  },
  {
    number: "05", title: "Serverless and Event-Driven Building Blocks",
    summary: "Functions, App Engine, workflows, events, schedulers and queues for glue and automation.",
    chapters: [
      { n: "5.1", title: "Cloud Run functions", deep: true },
      { n: "5.2", title: "App Engine", deep: true },
      { n: "5.3", title: "Workflows", deep: true },
      { n: "5.4", title: "Eventarc", deep: true },
      { n: "5.5", title: "Cloud Scheduler and Cloud Tasks", deep: true },
    ],
  },
  {
    number: "06", title: "Storage",
    summary: "Object, file and backup storage, moving data in, and the other storage services at a glance.",
    chapters: [
      { n: "6.1", title: "Cloud Storage", deep: true },
      { n: "6.2", title: "Filestore", deep: true },
      { n: "6.3", title: "Backup and DR Service", deep: true },
      { n: "6.4", title: "Storage Transfer Service and Transfer Appliance", deep: true },
      { n: "6.5", title: "Other Storage Services at a Glance" },
    ],
  },
  {
    number: "07", title: "Databases",
    summary: "Relational, wide-column, document and in-memory databases, migration tools and how to choose.",
    chapters: [
      { n: "7.1", title: "Cloud SQL", deep: true },
      { n: "7.2", title: "AlloyDB for PostgreSQL", deep: true },
      { n: "7.3", title: "Cloud Spanner", deep: true },
      { n: "7.4", title: "Bigtable", deep: true },
      { n: "7.5", title: "Firestore", deep: true },
      { n: "7.6", title: "Memorystore", deep: true },
      { n: "7.7", title: "Database Migration Service and Datastream", deep: true },
      { n: "7.8", title: "Choosing a Database on Google Cloud" },
    ],
  },
  {
    number: "08", title: "Data and Analytics",
    summary: "BigQuery, streaming, batch pipelines, orchestration, data governance and BI.",
    chapters: [
      { n: "8.1", title: "BigQuery", deep: true },
      { n: "8.2", title: "Pub/Sub", deep: true },
      { n: "8.3", title: "Dataflow", deep: true },
      { n: "8.4", title: "Managed Service for Apache Spark (Dataproc)", deep: true },
      { n: "8.5", title: "Managed Service for Apache Airflow (Cloud Composer)", deep: true },
      { n: "8.6", title: "Knowledge Catalog (Dataplex and Data Catalog)", deep: true },
      { n: "8.7", title: "Looker and Data Studio", deep: true },
      { n: "8.8", title: "Lakehouse, BigLake and Other Data Tools" },
    ],
  },
  {
    number: "09", title: "Networking",
    summary: "VPCs, load balancing, CDN, DNS, NAT, hybrid connectivity and private access to services.",
    chapters: [
      { n: "9.1", title: "Virtual Private Cloud (VPC)", deep: true },
      { n: "9.2", title: "Cloud Load Balancing", deep: true },
      { n: "9.3", title: "Cloud CDN, Cloud DNS and Cloud NAT", deep: true },
      { n: "9.4", title: "Cloud Armor", deep: true },
      { n: "9.5", title: "Cloud VPN, Interconnect and Network Connectivity Center", deep: true },
      { n: "9.6", title: "Private Service Connect and Network Intelligence Center", deep: true },
    ],
  },
  {
    number: "10", title: "Security",
    summary: "Keys, secrets, threat detection, data protection, zero-trust access and perimeters.",
    chapters: [
      { n: "10.1", title: "Cloud KMS", deep: true },
      { n: "10.2", title: "Secret Manager", deep: true },
      { n: "10.3", title: "Security Command Center (and Wiz)", deep: true },
      { n: "10.4", title: "Sensitive Data Protection (formerly Cloud DLP)", deep: true },
      { n: "10.5", title: "Identity-Aware Proxy (IAP) and BeyondCorp", deep: true },
      { n: "10.6", title: "VPC Service Controls, Binary Authorization and Certificate Manager", deep: true },
    ],
  },
  {
    number: "11", title: "AI and Machine Learning",
    summary: "The agent platform, ADK, vector search and RAG, pretrained APIs, accelerators and AI inside data services.",
    chapters: [
      { n: "11.1", title: "Gemini Enterprise Agent Platform (formerly Vertex AI)", deep: true },
      { n: "11.2", title: "Agent Development Kit (ADK) and Agent Runtime", deep: true },
      { n: "11.3", title: "Vector Search and RAG Engine", deep: true },
      { n: "11.4", title: "Document AI, Vision, Speech, Translation and Natural Language", deep: true },
      { n: "11.5", title: "TPUs, GPUs and AI Hypercomputer", deep: true },
      { n: "11.6", title: "AI Inside Your Data Services" },
    ],
  },
  {
    number: "12", title: "DevOps and Delivery",
    summary: "Build, deploy and manage infrastructure as code, with developer tooling and release metrics.",
    chapters: [
      { n: "12.1", title: "Cloud Build", deep: true },
      { n: "12.2", title: "Cloud Deploy", deep: true },
      { n: "12.3", title: "Infrastructure Manager, Terraform and Config Connector", deep: true },
      { n: "12.4", title: "Cloud Workstations, Cloud Code and Developer Connect", deep: true },
      { n: "12.5", title: "Delivery Metrics and Release Practices" },
    ],
  },
  {
    number: "13", title: "Observability and Operations",
    summary: "Logs, metrics, traces, errors and the practice of running incidents against SLOs.",
    chapters: [
      { n: "13.1", title: "Cloud Logging and Cloud Audit Logs", deep: true },
      { n: "13.2", title: "Cloud Monitoring, Trace, Profiler and Error Reporting", deep: true },
      { n: "13.3", title: "Incident Response and SLO Practice" },
    ],
  },
  {
    number: "14", title: "Cost Management and FinOps",
    summary: "Understand the bill, set budgets and follow a practical checklist to cut spend.",
    chapters: [
      { n: "14.1", title: "Cloud Billing, Budgets and FinOps Tools", deep: true },
      { n: "14.2", title: "A Practical Cost-Optimisation Checklist" },
    ],
  },
  {
    number: "15", title: "Integration and Application Platforms",
    summary: "Expose and manage APIs, and use app-facing services for mobile and web.",
    chapters: [
      { n: "15.1", title: "Apigee, API Gateway and Cloud Endpoints", deep: true },
      { n: "15.2", title: "Firebase and App-Facing Services", deep: true },
    ],
  },
  {
    number: "16", title: "Migration and Hybrid Cloud",
    summary: "Move existing workloads to Google Cloud and run Google Cloud technology on-premises.",
    chapters: [
      { n: "16.1", title: "Migration Center and Migrate to Virtual Machines", deep: true },
      { n: "16.2", title: "GKE Enterprise and Google Distributed Cloud", deep: true },
    ],
  },
  {
    number: "17", title: "Reference Architectures",
    summary: "Five end-to-end designs that tie the services together, each with the reasoning behind the choices.",
    chapters: [
      { n: "17.1", title: "Reference 1: Three-Tier Web Application", topics: ["Why these choices"] },
      { n: "17.2", title: "Reference 2: Event-Driven Microservices" },
      { n: "17.3", title: "Reference 3: Data Lakehouse and Analytics" },
      { n: "17.4", title: "Reference 4: Enterprise Landing Zone" },
      { n: "17.5", title: "Reference 5: Resilience and Disaster Recovery Patterns" },
    ],
  },
  {
    number: "18", title: "Careers: Certifications, Interviews and Cheat Sheets",
    summary: "Pick a certification, follow a study plan, rehearse interview questions and keep a gcloud cheat sheet.",
    chapters: [
      { n: "18.1", title: "Google Cloud Certifications: Which One and How to Prepare", topics: ["A study plan that works"] },
      { n: "18.2", title: "Interview Questions: Core Platform" },
      { n: "18.3", title: "Interview Questions: Data, Reliability and Cost" },
      { n: "18.4", title: "gcloud Cheat Sheet" },
      { n: "18.5", title: "Glossary" },
    ],
  },
  {
    number: "App.", title: "Appendices",
    summary: "An A–Z catalogue of about 120 services, official learning resources and a back-of-the-book index.",
    chapters: [
      { title: "A–Z Service Catalogue", topics: ["About 120 services described in one place"] },
      { title: "Keep Learning: Official Resources", topics: ["Official documentation and learning paths"] },
      { title: "A–Z Index", topics: ["Jump straight to any service, concept or command"] },
    ],
  },
];

export const STAGES = [
  { title: "Foundations & Governance", parts: "Parts 1–2", copy: "Regions, the resource hierarchy, IAM and service accounts, before you build anything." },
  { title: "Build & Run", parts: "Parts 3–5", copy: "Virtual machines, GKE, Cloud Run and the serverless glue that connects them." },
  { title: "Store & Analyse", parts: "Parts 6–8", copy: "Cloud Storage, every database option, BigQuery, Pub/Sub and Dataflow." },
  { title: "Connect & Protect", parts: "Parts 9–10", copy: "VPCs, load balancing, Cloud Armor, KMS, Secret Manager and perimeter security." },
  { title: "Add AI, Deliver & Operate", parts: "Parts 11–13", copy: "Agents and ML, CI/CD, infrastructure as code, logging, monitoring and SLOs." },
  { title: "Optimise, Migrate & Get Hired", parts: "Parts 14–18", copy: "FinOps, APIs, migration, reference architectures, certifications and interviews." },
];

/* "which service should I use?" — need, pick, where in the book, why, and the alternative */
export const PICKER = [
  { need: "Run a container with zero servers to manage", pick: "Cloud Run", where: "Ch 4.3 · Cloud Run", why: "Deploy any container and pay only while it handles requests. It scales to zero and needs no cluster.", alt: "Compare with GKE when you need Kubernetes-level control." },
  { need: "Full Kubernetes control", pick: "Google Kubernetes Engine (GKE)", where: "Ch 4.1 · GKE", why: "Managed Kubernetes for multi-service platforms that need custom networking, operators or sidecars.", alt: "Compare with Cloud Run for simpler stateless services." },
  { need: "Lift-and-shift a server or run custom OS software", pick: "Compute Engine", where: "Ch 3.1 · Compute Engine", why: "Virtual machines with full OS control, for legacy apps and specialised software.", alt: "Pair with managed instance groups for autoscaling and self-healing." },
  { need: "A standard MySQL or PostgreSQL database", pick: "Cloud SQL", where: "Ch 7.1 · Cloud SQL", why: "Managed MySQL, PostgreSQL and SQL Server for typical application databases.", alt: "Consider AlloyDB for demanding PostgreSQL workloads." },
  { need: "A globally scalable relational database", pick: "Cloud Spanner", where: "Ch 7.3 · Cloud Spanner", why: "Relational schema and SQL with horizontal scale and strong consistency across regions.", alt: "Chapter 7.8 compares it with every other database." },
  { need: "Analytics over huge datasets with SQL", pick: "BigQuery", where: "Ch 8.1 · BigQuery", why: "A serverless data warehouse: you write SQL and Google runs the infrastructure.", alt: "Feed it with Pub/Sub and Dataflow for streaming data." },
  { need: "Decouple services with asynchronous events", pick: "Pub/Sub", where: "Ch 8.2 · Pub/Sub", why: "Global messaging for event ingestion and fan-out between loosely coupled systems.", alt: "Connect it to Eventarc, Cloud Run and Dataflow." },
];

export const REF_ARCHS = [
  { title: "Three-Tier Web Application", copy: "Public traffic, a stateless application tier and a managed database.", flow: ["Cloud Load Balancing", "Cloud Run", "Cloud SQL", "Memorystore"] },
  { title: "Event-Driven Microservices", copy: "Services that react to events instead of calling each other directly.", flow: ["Pub/Sub", "Eventarc", "Cloud Run", "Firestore"] },
  { title: "Data Lakehouse and Analytics", copy: "Ingest streams, transform them and serve analytics to the business.", flow: ["Pub/Sub", "Dataflow", "BigQuery", "Looker"] },
  { title: "Enterprise Landing Zone", copy: "The organization-wide foundation every team builds on.", flow: ["Organization", "Folders", "Projects", "Org Policy"] },
  { title: "Resilience and Disaster Recovery", copy: "Patterns that keep working through zone and region failures.", flow: ["Zones", "Regions", "Backup and DR", "Failover"] },
];

/* free samples in the style of the book's command-line sections */
export const SNIPPETS = [
  {
    id: "setup", tab: "Project setup", where: "Ch 1.3 · 1.5 · Foundations", file: "setup.sh",
    title: "Create a project and set your defaults",
    intro: "Every resource lives in a project. Set the project and region once so later commands stay short.",
    code: "# Sign in with your user account\ngcloud auth login\n\n# Create a project (IDs are globally unique)\ngcloud projects create my-app-dev --name=\"My App Dev\"\n\n# Set defaults for this configuration\ngcloud config set project my-app-dev\ngcloud config set compute/region asia-south1\n\n# Turn on the API you plan to use\ngcloud services enable run.googleapis.com",
    out: "Updated property [core/project].\nUpdated property [compute/region].\nOperation \"operations/...\" finished successfully.",
    tip: "Know the two logins: gcloud auth login is for you, application-default login is for code running locally.",
  },
  {
    id: "run", tab: "Deploy to Cloud Run", where: "Ch 4.3 · Cloud Run", file: "deploy.sh",
    title: "Deploy a service straight from source",
    intro: "One command builds your code into a container, deploys it and gives you an HTTPS URL.",
    code: "gcloud run deploy hello-api \\\n  --source . \\\n  --region asia-south1 \\\n  --allow-unauthenticated",
    out: "Building using Dockerfile and deploying container...\nService [hello-api] revision [hello-api-00001-abc] has been deployed\nand is serving 100 percent of traffic.\nService URL: https://hello-api-<hash>-el.a.run.app",
    tip: "Drop --allow-unauthenticated for private services and grant roles/run.invoker to callers instead.",
  },
  {
    id: "iam", tab: "Least-privilege IAM", where: "Ch 2.1 · 2.2 · IAM", file: "iam.sh",
    title: "Give a service account only the role it needs",
    intro: "Create a dedicated service account and bind one narrow role, instead of reusing a powerful default account.",
    code: "gcloud iam service-accounts create report-runner \\\n  --display-name=\"Report runner\"\n\ngcloud projects add-iam-policy-binding my-app-dev \\\n  --member=\"serviceAccount:report-runner@my-app-dev.iam.gserviceaccount.com\" \\\n  --role=\"roles/bigquery.dataViewer\"",
    out: "Created service account [report-runner].\nUpdated IAM policy for project [my-app-dev].",
    tip: "Prefer predefined or custom roles over basic Owner/Editor, and avoid long-lived keys.",
  },
  {
    id: "gke", tab: "GKE Autopilot", where: "Ch 4.1 · GKE", file: "gke.sh",
    title: "Create an Autopilot cluster and connect",
    intro: "Autopilot manages nodes for you. Create the cluster, fetch credentials and talk to it with kubectl.",
    code: "gcloud container clusters create-auto demo-cluster \\\n  --region asia-south1\n\ngcloud container clusters get-credentials demo-cluster \\\n  --region asia-south1\n\nkubectl get nodes",
    out: "Creating cluster demo-cluster... done.\nFetching cluster endpoint and auth data.\nkubeconfig entry generated for demo-cluster.",
    tip: "If one stateless container is enough, Cloud Run is simpler and cheaper.",
  },
  {
    id: "bq", tab: "BigQuery query", where: "Ch 8.1 · BigQuery", file: "bq_query.sh",
    title: "Query a public dataset from the command line",
    intro: "BigQuery is serverless: write standard SQL and it scales for you. Public datasets let you practise.",
    code: "bq query --use_legacy_sql=false \\\n'SELECT name, SUM(number) AS total\n FROM `bigquery-public-data.usa_names.usa_1910_2013`\n WHERE state = \"TX\"\n GROUP BY name\n ORDER BY total DESC\n LIMIT 3'",
    out: "+--------+---------+\n|  name  |  total  |\n+--------+---------+\n| ...    | ...     |   (3 rows)",
    tip: "Cost is driven by bytes scanned: select only the columns you need and filter on partitioned columns.",
  },
  {
    id: "pubsub", tab: "Pub/Sub messaging", where: "Ch 8.2 · Pub/Sub", file: "pubsub.sh",
    title: "Publish and pull a message",
    intro: "A topic receives messages and each subscription gets its own copy, which decouples producers from consumers.",
    code: "gcloud pubsub topics create orders\ngcloud pubsub subscriptions create orders-sub --topic=orders\n\ngcloud pubsub topics publish orders --message='{\"id\":42}'\ngcloud pubsub subscriptions pull orders-sub --auto-ack",
    out: "Created topic [projects/my-app-dev/topics/orders].\nCreated subscription [projects/my-app-dev/subscriptions/orders-sub].\nmessageIds:\n- '1234567890'",
    tip: "Delivery is at-least-once by default, so make consumers idempotent.",
  },
];

export const AUDIENCE = [
  { title: "Developers new to Google Cloud", copy: "Starts from regions, projects, the console and gcloud, then builds up service by service." },
  { title: "DevOps and platform engineers", copy: "GKE, Cloud Run, Cloud Build, Cloud Deploy, Terraform, observability and SLO practice." },
  { title: "Data and AI engineers", copy: "BigQuery, Pub/Sub, Dataflow, Dataproc, Composer, the agent platform, ADK and RAG Engine." },
  { title: "Certification and interview candidates", copy: "Which certification to pick, a study plan, interview questions and a gcloud cheat sheet." },
];

export const VALUE = [
  { title: "18 parts plus appendices", copy: "The whole platform, from the resource hierarchy to migration and hybrid cloud." },
  { title: "One 12-part template per service", copy: "When to use it, architecture, console, gcloud, billing, pitfalls and interview notes, every time." },
  { title: "5 reference architectures", copy: "Web app, event-driven microservices, lakehouse, landing zone and disaster recovery, with the reasoning." },
  { title: "Current 2026 names", copy: "Gemini Enterprise Agent Platform (formerly Vertex AI), Sensitive Data Protection (formerly Cloud DLP) and more." },
];

/* the second cloud book, for the "choose your book" cards */
export const OTHER_BOOK = {
  eyebrow: "Amazon Web Services",
  title: "AWS: The Complete Cloud Engineer's Handbook",
  copy: "The same end-to-end approach for AWS: IAM, EC2, Lambda, S3, DynamoDB, VPC, security, Bedrock, IaC and FinOps.",
  points: ["14 parts plus 7 appendices", "2 reference architectures and 4 hands-on labs", "CLI cheat sheet, quotas, interview questions"],
  cta: "Get the AWS book",
};
