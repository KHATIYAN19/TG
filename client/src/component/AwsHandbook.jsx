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
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronRight,
  Cloud,
  Database,
  GitBranch,
  Globe,
  HardDrive,
  Layers3,
  Lightbulb,
  Lock,
  Network,
  ShieldCheck,
  Server,
  Sparkles,
  Terminal,
  Wallet,
  Workflow,
  Zap,
} from "lucide-react";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { trackViewContent } from "../lib/metaPixel.js";
import { styles as baseStyles, readTheme, ScrollProgress, CountUp, ScrollScale } from "./SystemDesignLLD.jsx";
import { sqlStyles, CopyButton } from "./SqlInterviewHandbook.jsx";
import { gcpStyles, ShellHighlight, spot } from "./GcpHandbook.jsx";

const SITE_NAME = "Target Trek";
const SITE_URL = "https://www.targettrek.in";
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";
const PAGE_PATH = "/book/cloud/aws";
const PAGE_URL = `${SITE_URL}${PAGE_PATH}`;
const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SEO_TITLE = "AWS: The Complete Cloud Engineer's Handbook | Target Trek";
const SEO_DESCRIPTION =
  "Learn AWS end to end: IAM, EC2, Lambda, S3, DynamoDB, VPC, security, Bedrock, IaC, FinOps, 4 hands-on labs and interview questions. Updated for 2025-26.";
const SEO_LONG_DESCRIPTION =
  "AWS: The Complete Cloud Engineer's Handbook covers 14 parts: global infrastructure, accounts and Control Tower, IAM, EC2, Auto Scaling, Lambda, containers (ECS, Fargate, ECR, EKS), S3, EBS, EFS, RDS, Aurora, DynamoDB, VPC, Route 53, CloudFront, API Gateway, KMS, Secrets Manager, SQS, SNS, EventBridge, Step Functions, Kinesis, Athena, Glue, Redshift, OpenSearch, Amazon Bedrock, SageMaker AI, CloudFormation, CDK, Terraform, CloudWatch, cost management and FinOps, two reference architectures, four hands-on labs and appendices with a CLI cheat sheet, quotas and interview questions.";
const SEO_KEYWORDS =
  "AWS handbook, AWS ebook, Amazon Web Services tutorial, AWS interview questions, AWS certification preparation, IAM policies, EC2, Lambda, S3, DynamoDB, VPC, CloudFront, Amazon Bedrock, SageMaker AI, AWS CLI cheat sheet, AWS reference architecture, AWS FinOps, AWS for beginners, TargetTrek";

const PARTS = [
  {
    id: "start", label: "Start", title: "Start Here", icon: BookOpen,
    summary: "How the book works, the whole AWS map on one page and what changed across 2025 and 2026.",
    chapters: [
      { title: "About This Book", topics: ["How every chapter is structured", "Callout legend", "What \"verified\" means in this edition", "Reading paths"] },
      { title: "The AWS Map in One Page", topics: ["The twelve building blocks"] },
      { title: "What Changed in 2025 to 2026", topics: ["Headline launches and renames", "Lifecycle notices to design around", "Runtime and version snapshot"] },
    ],
  },
  {
    id: 1, label: "01", title: "Foundations", icon: Globe,
    summary: "Regions, accounts, the shared responsibility model, tooling and how AWS pricing really works.",
    chapters: [
      { title: "Global Infrastructure", topics: ["What it is", "Core concepts", "Global, regional and zonal services", "How to choose a Region", "Gotchas"] },
      { title: "Accounts, Organizations and Control Tower", topics: ["What it is", "Core concepts", "Recommended account layout", "Creating and guarding accounts"] },
      { title: "Shared Responsibility and the Well-Architected Framework", topics: ["The shared responsibility model", "The six Well-Architected pillars", "Design principles to apply everywhere"] },
      { title: "Tools: Console, CLI, SDKs and Infrastructure as Code", topics: ["Credentials: the safe way", "CLI techniques worth learning early"] },
      { title: "How AWS Pricing Works", topics: ["The three pricing ideas", "Cost dimensions by service family", "The purchase options for compute", "The Free Tier", "Five cost levers that matter most"] },
    ],
  },
  {
    id: 2, label: "02", title: "Identity and Access Management", icon: ShieldCheck,
    summary: "Policies, evaluation logic, roles, federation and the habits that keep an account safe.",
    chapters: [
      { title: "AWS IAM", topics: ["What it is", "Core concepts", "Anatomy of a policy", "Policy evaluation logic", "Identity-based versus resource-based policies", "Roles and temporary credentials", "Hands-on: create a least-privilege role from the CLI", "Attribute-based access control (ABAC)", "Root user and account hygiene", "Limits worth knowing", "Gotchas"] },
      { title: "IAM Identity Center, Federation and Cognito", topics: ["IAM Identity Center", "Amazon Cognito", "Other identity services", "Federating GitHub Actions without stored keys"] },
    ],
  },
  {
    id: 3, label: "03", title: "Compute", icon: Server,
    summary: "EC2, Auto Scaling, load balancing, Lambda and containers on ECS, Fargate, ECR and EKS.",
    chapters: [
      { title: "Amazon EC2", topics: ["What it is", "Core concepts", "Instance families at a glance", "Launch an instance (CLI)", "Purchasing, lifecycle and states", "Security baseline", "CloudFormation: a launch template", "Gotchas"] },
      { title: "EC2 Auto Scaling and Elastic Load Balancing", topics: ["What they are", "Auto Scaling concepts", "Load balancer types", "Build it from the CLI", "Gotchas"] },
      { title: "AWS Lambda", topics: ["What it is", "Core concepts", "Limits that shape designs", "Supported runtimes", "Write, package and deploy", "The same function with AWS SAM", "Performance and cost tuning", "Gotchas"] },
      { title: "Containers on AWS: ECS, Fargate, ECR and EKS", topics: ["Choosing a container service", "Amazon ECS", "Amazon ECR", "Amazon EKS"] },
      { title: "Other Compute Services", topics: [] },
    ],
  },
  {
    id: 4, label: "04", title: "Storage", icon: HardDrive,
    summary: "S3 in depth, block and file storage, backup, data transfer and hybrid storage.",
    chapters: [
      { title: "Amazon S3", topics: ["What it is", "Core concepts", "Storage classes", "Security: the checklist", "Hands-on with the CLI", "Replication, events and other features", "New data-centric S3 capabilities", "Gotchas"] },
      { title: "Block and File Storage: EBS, EFS and FSx", topics: ["Amazon EBS", "Amazon EFS", "Amazon FSx"] },
      { title: "Backup, Transfer and Hybrid Storage", topics: ["AWS Backup", "Data movement and hybrid services"] },
    ],
  },
  {
    id: 5, label: "05", title: "Databases", icon: Database,
    summary: "Choose the right database, then go deep on RDS, Aurora, DynamoDB and caching.",
    chapters: [
      { title: "Choosing a Database on AWS", topics: [] },
      { title: "Amazon RDS and Aurora", topics: ["What they are", "Core concepts", "Hands-on", "Operational practice"] },
      { title: "Amazon DynamoDB", topics: ["What it is", "Core concepts", "Designing for DynamoDB", "Limits worth memorising"] },
      { title: "ElastiCache, MemoryDB and the Specialised Databases", topics: ["In-memory", "Document, graph, wide-column and time series", "Migration and modernisation tools"] },
    ],
  },
  {
    id: 6, label: "06", title: "Networking and Content Delivery", icon: Network,
    summary: "VPC, DNS, CDN, APIs and how to connect networks together.",
    chapters: [
      { title: "Amazon VPC", topics: ["What it is", "Core concepts", "Security groups versus network ACLs", "Hands-on", "Gotchas"] },
      { title: "Route 53 and CloudFront", topics: ["Amazon Route 53", "Amazon CloudFront"] },
      { title: "API Gateway, Hybrid Networking and Service Connectivity", topics: ["Amazon API Gateway", "Connecting networks"] },
    ],
  },
  {
    id: 7, label: "07", title: "Security and Compliance", icon: Lock,
    summary: "Encryption, secrets, threat detection, auditing and a baseline for every new account.",
    chapters: [
      { title: "Encryption and Secrets: KMS, Secrets Manager, ACM", topics: ["AWS Key Management Service (KMS)", "AWS Secrets Manager and Parameter Store", "Certificates and other cryptographic services"] },
      { title: "Threat Detection, Compliance and Auditing", topics: ["The detection and governance services", "Turn on the essentials (organisation-wide)", "A pragmatic baseline for every new account"] },
      { title: "Edge and Network Protection", topics: [] },
    ],
  },
  {
    id: 8, label: "08", title: "Application Integration", icon: Workflow,
    summary: "Decouple systems with queues, topics, events, workflows and streaming.",
    chapters: [
      { title: "SQS, SNS and EventBridge", topics: ["Why decouple", "The three building blocks", "Amazon SQS in detail", "SNS and EventBridge in practice", "Choosing among them"] },
      { title: "Step Functions, AppSync and Messaging Services", topics: ["AWS Step Functions", "Other application-integration services"] },
      { title: "Streaming: Kinesis, MSK and Firehose", topics: [] },
    ],
  },
  {
    id: 9, label: "09", title: "Analytics and Data", icon: BarChart3,
    summary: "Data lakes and lakehouses, Athena, Glue, Redshift, OpenSearch and business intelligence.",
    chapters: [
      { title: "The Data Lake and Lakehouse on AWS", topics: ["The core services", "Design principles"] },
      { title: "Athena and Glue in Practice", topics: ["Amazon Athena", "AWS Glue ETL (PySpark)"] },
      { title: "Redshift, OpenSearch and Business Intelligence", topics: ["Amazon Redshift", "Amazon OpenSearch Service", "Amazon Quick (formerly Amazon QuickSight)", "Choosing an analytics engine"] },
    ],
  },
  {
    id: 10, label: "10", title: "AI and Machine Learning", icon: BrainCircuit,
    summary: "Amazon Bedrock, RAG, guardrails, agents, SageMaker AI and ready-made AI services.",
    chapters: [
      { title: "Amazon Bedrock", topics: ["What it is", "Core concepts", "Discover models and call one", "Retrieval-augmented generation (RAG)", "Guardrails"] },
      { title: "Bedrock AgentCore and the Agentic AWS Services", topics: ["Amazon Bedrock AgentCore", "Agents that work on AWS for you"] },
      { title: "Amazon SageMaker AI and Custom Machine Learning", topics: ["What it is", "AWS ML silicon"] },
      { title: "Ready-Made AI Services", topics: [] },
    ],
  },
  {
    id: 11, label: "11", title: "Developer Tools and Observability", icon: GitBranch,
    summary: "Infrastructure as code, CI/CD, deployment strategies and observability.",
    chapters: [
      { title: "Infrastructure as Code: CloudFormation, CDK, SAM and Terraform", topics: ["Why IaC", "CloudFormation essentials", "CDK in Python", "Terraform backend and a resource"] },
      { title: "CI/CD and Developer Services", topics: ["A buildspec for CodeBuild", "GitHub Actions deploying with OIDC (no stored keys)", "Deployment strategies"] },
      { title: "Observability: CloudWatch, X-Ray and OpenTelemetry", topics: ["Amazon CloudWatch", "Tracing and open standards", "Alarming principles"] },
    ],
  },
  {
    id: 12, label: "12", title: "Management, Governance and Cost", icon: Wallet,
    summary: "Operate fleets, govern accounts and keep the bill under control.",
    chapters: [
      { title: "Systems Manager and Fleet Operations", topics: [] },
      { title: "Governance: Organizations, Control Tower, Config and Service Catalog", topics: [] },
      { title: "Cost Management and FinOps", topics: ["Cost reduction checklist"] },
    ],
  },
  {
    id: 13, label: "13", title: "The Long Tail of AWS Services", icon: Boxes,
    summary: "The wider catalogue beyond the core, grouped so you know what else exists.",
    chapters: [
      { title: "Migration and Transfer", topics: [] },
      { title: "Internet of Things", topics: [] },
      { title: "Media, Games and Customer Engagement", topics: [] },
      { title: "End-User Computing", topics: [] },
      { title: "Specialised Services", topics: [] },
    ],
  },
  {
    id: 14, label: "14", title: "Reference Architectures and Hands-On Labs", icon: Layers3,
    summary: "Two reference architectures and four labs, from securing an account to cleaning up.",
    chapters: [
      { title: "Reference Architecture: Three-Tier Web Application", topics: [] },
      { title: "Reference Architecture: Event-Driven Serverless", topics: [] },
      { title: "Lab 1: Secure a New Account", topics: [] },
      { title: "Lab 2: Static Site with CloudFront", topics: [] },
      { title: "Lab 3: Serverless API", topics: [] },
      { title: "Lab 4: Clean Up", topics: [] },
    ],
  },
  {
    id: "app", label: "A–G", title: "Appendices and Index", icon: Sparkles,
    summary: "Catalogue, CLI cheat sheet, quotas, interview questions, glossary, version snapshot and the A-Z index.",
    chapters: [
      { title: "Appendix A: Service Catalog by Category", topics: [] },
      { title: "Appendix B: AWS CLI Cheat Sheet", topics: [] },
      { title: "Appendix C: Common Limits and Quotas", topics: [] },
      { title: "Appendix D: Interview and Certification Questions", topics: [] },
      { title: "Appendix E: Glossary", topics: [] },
      { title: "Appendix F: Lifecycle and Version Snapshot", topics: [] },
      { title: "Appendix G: Learning Resources", topics: [] },
      { title: "A-Z Index", topics: [] },
    ],
  },
];

const NUMBERED = PARTS.filter((p) => typeof p.id === "number");
const CHAPTER_COUNT = NUMBERED.reduce((n, p) => n + p.chapters.length, 0);

const stats = [
  [NUMBERED.length, "Parts"],
  [CHAPTER_COUNT, "Chapters"],
  [4, "Hands-on labs"],
  [7, "Appendices"],
];

const CHAPTER_FLOW = [
  { t: "What it is", d: "A plain explanation of the service and the problem it solves", icon: BookOpen },
  { t: "Core concepts", d: "The vocabulary and building blocks you must know", icon: Layers3 },
  { t: "Hands-on", d: "CLI and infrastructure-as-code examples you can run", icon: Terminal },
  { t: "Gotchas", d: "Limits and traps that catch engineers in production", icon: ShieldCheck },
];

const STAGES = [
  { title: "Start & Foundations", parts: "Start Here · Part 1", text: "How to read the book, what changed in 2025 and 2026, regions, accounts, pricing and tooling.", icon: Globe },
  { title: "Identity & Compute", parts: "Parts 2–3", text: "IAM policies and roles, then EC2, Auto Scaling, Lambda and containers.", icon: Server },
  { title: "Storage & Databases", parts: "Parts 4–5", text: "S3, EBS, EFS, FSx, RDS, Aurora, DynamoDB and caching.", icon: Database },
  { title: "Network & Security", parts: "Parts 6–7", text: "VPC, Route 53, CloudFront, API Gateway, KMS, Secrets Manager and threat detection.", icon: Lock },
  { title: "Integrate, Analyse & AI", parts: "Parts 8–10", text: "SQS, SNS, EventBridge, Step Functions, Athena, Glue, Redshift, Bedrock and SageMaker AI.", icon: BrainCircuit },
  { title: "Ship, Govern & Practise", parts: "Parts 11–14 · Appendices", text: "IaC, CI/CD, observability, FinOps, reference architectures, labs and interview questions.", icon: Wallet },
];

const PICKER = [
  { need: "Run code on events, no servers to manage", pick: "AWS Lambda", where: "Part 3 · AWS Lambda", why: "Upload a function and AWS runs it when something happens. You pay for execution time instead of idle servers.", alt: "Mind the limits that shape designs, such as maximum run time." },
  { need: "Full control of a virtual machine", pick: "Amazon EC2", where: "Part 3 · Amazon EC2", why: "Resizable virtual machines with a choice of instance families and purchase options.", alt: "Pair with Auto Scaling and a load balancer for resilience." },
  { need: "Run containers without managing servers", pick: "ECS on Fargate", where: "Part 3 · Containers on AWS", why: "Run containers on Amazon ECS with Fargate so AWS manages the underlying compute.", alt: "Choose EKS when you specifically need Kubernetes." },
  { need: "Store files and objects at any scale", pick: "Amazon S3", where: "Part 4 · Amazon S3", why: "Object storage with multiple storage classes, lifecycle rules, events and replication.", alt: "Use EBS for block storage and EFS for shared file storage." },
  { need: "Key-value data with predictable low latency", pick: "Amazon DynamoDB", where: "Part 5 · Amazon DynamoDB", why: "A managed NoSQL database where you design tables around your access patterns.", alt: "Choose RDS or Aurora when you need relational SQL." },
  { need: "Relational database for an application", pick: "Amazon RDS or Aurora", where: "Part 5 · Amazon RDS and Aurora", why: "Managed relational databases that handle patching, backups and failover for you.", alt: "The Choosing a Database chapter compares every option." },
  { need: "Decouple services with queues and events", pick: "SQS, SNS and EventBridge", where: "Part 8 · SQS, SNS and EventBridge", why: "Queues, pub/sub topics and event routing let producers and consumers evolve independently.", alt: "The chapter ends with how to choose among the three." },
  { need: "Add generative AI to an application", pick: "Amazon Bedrock", where: "Part 10 · Amazon Bedrock", why: "Call foundation models through one service, add retrieval (RAG) and apply guardrails.", alt: "Go further with AgentCore for agents." },
];

const REF_ARCHS = [
  { n: 1, title: "Three-Tier Web Application", text: "A classic layered design: edge, application tier and database.", flow: ["Route 53", "CloudFront", "Load Balancer", "EC2 / ECS", "RDS / Aurora"] },
  { n: 2, title: "Event-Driven Serverless", text: "Managed building blocks wired together by events, with no servers to run.", flow: ["API Gateway", "Lambda", "EventBridge", "SQS", "DynamoDB"] },
];

const LABS = [
  { n: 1, title: "Secure a New Account", text: "Apply the account baseline from the security and governance chapters." },
  { n: 2, title: "Static Site with CloudFront", text: "Publish a website and serve it through the content delivery network." },
  { n: 3, title: "Serverless API", text: "Build an API with the serverless building blocks from earlier parts." },
  { n: 4, title: "Clean Up", text: "Remove what you created so lab resources never turn into a surprise bill." },
];

const FREE_SNIPPETS = [
  {
    id: "sso", tab: "Safe credentials", level: "easy", chapter: "Part 1 · Tools",
    title: "Sign in with SSO instead of long-lived keys",
    intro: "Use IAM Identity Center so the CLI gets short-lived credentials, then confirm who you are.",
    file: "login.sh",
    code: "# One-time setup of a named profile\naws configure sso --profile dev\n\n# Sign in (opens your browser)\naws sso login --profile dev\n\n# Which identity am I using?\naws sts get-caller-identity --profile dev",
    out: "{\n  \"UserId\": \"AROA...:you@example.com\",\n  \"Account\": \"123456789012\",\n  \"Arn\": \"arn:aws:sts::123456789012:assumed-role/...\"\n}",
    tip: "Say it in interviews: prefer temporary credentials and roles over access keys that never expire.",
  },
  {
    id: "s3", tab: "Secure S3 bucket", level: "easy", chapter: "Part 4 · Amazon S3",
    title: "Create a bucket and block public access",
    intro: "Bucket names are global. Turn on Block Public Access first, then upload and list objects.",
    file: "s3.sh",
    code: "aws s3 mb s3://my-unique-bucket-123 --region ap-south-1\n\naws s3api put-public-access-block \\\n  --bucket my-unique-bucket-123 \\\n  --public-access-block-configuration \\\n  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true\n\naws s3 cp ./report.pdf s3://my-unique-bucket-123/\naws s3 ls s3://my-unique-bucket-123/",
    out: "make_bucket: my-unique-bucket-123\nupload: ./report.pdf to s3://my-unique-bucket-123/report.pdf\n2025-01-15 10:02:11     48213 report.pdf",
    tip: "Pick the storage class by access pattern and add lifecycle rules for cold data.",
  },
  {
    id: "iam", tab: "Least-privilege role", level: "medium", chapter: "Part 2 · AWS IAM",
    title: "Create a role and attach only what it needs",
    intro: "A role has a trust policy (who may assume it) and permission policies (what it can do). Keep both narrow.",
    file: "iam.sh",
    code: "aws iam create-role \\\n  --role-name report-reader \\\n  --assume-role-policy-document file://trust.json\n\naws iam attach-role-policy \\\n  --role-name report-reader \\\n  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess",
    out: "{\n  \"Role\": {\n    \"RoleName\": \"report-reader\",\n    \"Arn\": \"arn:aws:iam::123456789012:role/report-reader\"\n  }\n}",
    tip: "Remember the evaluation rule: an explicit Deny always wins, and everything not allowed is denied by default.",
  },
  {
    id: "lambda", tab: "Deploy Lambda", level: "easy", chapter: "Part 3 · AWS Lambda",
    title: "Create and invoke a function",
    intro: "Package your code as a zip, create the function with an execution role, then invoke it from the CLI.",
    file: "lambda.sh",
    code: "aws lambda create-function \\\n  --function-name hello \\\n  --runtime python3.12 \\\n  --handler app.handler \\\n  --zip-file fileb://function.zip \\\n  --role arn:aws:iam::123456789012:role/lambda-exec\n\naws lambda invoke --function-name hello out.json",
    out: "{\n  \"StatusCode\": 200,\n  \"ExecutedVersion\": \"$LATEST\"\n}",
    tip: "Know the limits that shape designs, and tune memory because CPU scales with it.",
  },
  {
    id: "ddb", tab: "DynamoDB table", level: "medium", chapter: "Part 5 · Amazon DynamoDB",
    title: "Create an on-demand table with a composite key",
    intro: "Design around access patterns: a partition key plus a sort key lets one table serve several queries.",
    file: "dynamodb.sh",
    code: "aws dynamodb create-table \\\n  --table-name Orders \\\n  --attribute-definitions \\\n    AttributeName=pk,AttributeType=S \\\n    AttributeName=sk,AttributeType=S \\\n  --key-schema \\\n    AttributeName=pk,KeyType=HASH \\\n    AttributeName=sk,KeyType=RANGE \\\n  --billing-mode PAY_PER_REQUEST",
    out: "{\n  \"TableDescription\": {\n    \"TableName\": \"Orders\",\n    \"TableStatus\": \"CREATING\"\n  }\n}",
    tip: "A good partition key spreads traffic evenly. Hot partitions are the classic DynamoDB pitfall.",
  },
  {
    id: "sqs", tab: "SQS queue", level: "easy", chapter: "Part 8 · SQS, SNS and EventBridge",
    title: "Send and receive a message",
    intro: "A queue lets a producer hand off work and a consumer process it later, at its own pace.",
    file: "sqs.sh",
    code: "QUEUE_URL=$(aws sqs create-queue --queue-name orders \\\n  --query QueueUrl --output text)\n\naws sqs send-message \\\n  --queue-url \"$QUEUE_URL\" \\\n  --message-body '{\"id\":42}'\n\naws sqs receive-message --queue-url \"$QUEUE_URL\"",
    out: "{\n  \"MessageId\": \"...\",\n  \"MD5OfMessageBody\": \"...\"\n}",
    tip: "Standard queues deliver at least once, so make consumers idempotent.",
  },
  {
    id: "bedrock", tab: "Bedrock models", level: "easy", chapter: "Part 10 · Amazon Bedrock",
    title: "Discover the foundation models you can call",
    intro: "Start by listing models available in your Region, then request access and invoke one.",
    file: "bedrock.sh",
    code: "aws bedrock list-foundation-models \\\n  --region us-east-1 \\\n  --query \"modelSummaries[].modelId\" \\\n  --output text",
    out: "<model-id-1>  <model-id-2>  <model-id-3> ...",
    tip: "Model availability differs by Region, so check the Region before designing around a model.",
  },
];

const HERO_CMDS = [
  { file: "upload.sh", cmd: "aws s3 cp ./report.pdf \\\n  s3://my-bucket/", lines: ["upload: ./report.pdf to s3://my-bucket/report.pdf", "Encrypted at rest by default", "Ready for lifecycle rules"], ms: "Uploaded" },
  { file: "invoke.sh", cmd: "aws lambda invoke \\\n  --function-name hello \\\n  out.json", lines: ["\"StatusCode\": 200", "\"ExecutedVersion\": \"$LATEST\"", "Response saved to out.json"], ms: "Invoked" },
  { file: "table.sh", cmd: "aws dynamodb put-item \\\n  --table-name Orders \\\n  --item file://order.json", lines: ["Item written to Orders", "On-demand capacity: no servers to size", "Single-digit-millisecond reads"], ms: "Saved" },
];

const MARQUEE = [
  "IAM", "EC2", "Auto Scaling", "Elastic Load Balancing", "Lambda", "ECS", "Fargate", "ECR", "EKS", "S3", "EBS", "EFS", "FSx", "RDS", "Aurora",
  "DynamoDB", "ElastiCache", "VPC", "Route 53", "CloudFront", "API Gateway", "KMS", "Secrets Manager", "SQS", "SNS", "EventBridge",
  "Step Functions", "Kinesis", "Athena", "Glue", "Redshift", "OpenSearch", "Bedrock", "SageMaker AI", "CloudFormation", "CDK", "CloudWatch", "Systems Manager",
];

const QUICK_ANSWER =
  "AWS: The Complete Cloud Engineer's Handbook is a 14-part ebook that teaches Amazon Web Services from foundations to production: global infrastructure, accounts and IAM, compute (EC2, Lambda, containers), storage, databases, networking, security, application integration, analytics, AI with Amazon Bedrock, infrastructure as code, observability and cost management. It includes two reference architectures, four hands-on labs, a CLI cheat sheet and interview questions, and covers what changed in 2025 and 2026.";

const FAQS = [
  { q: "What is AWS: The Complete Cloud Engineer's Handbook?", a: "It is a Target Trek ebook in 14 parts plus appendices that teaches AWS from the ground up: infrastructure, IAM, compute, storage, databases, networking, security, integration, analytics, AI and machine learning, developer tools, observability, governance and cost, with reference architectures and hands-on labs." },
  { q: "Is the book up to date for 2025 and 2026?", a: "Yes. A dedicated section, What Changed in 2025 to 2026, covers headline launches and renames, lifecycle notices to design around, and a runtime and version snapshot. For example, Amazon QuickSight appears under its newer name, Amazon Quick." },
  { q: "How is each chapter structured?", a: "Most service chapters follow a consistent pattern: what it is, core concepts, hands-on examples and gotchas. The opening section, About This Book, explains the structure, the callout legend, what verified means in this edition and suggested reading paths." },
  { q: "Which compute and container services are covered?", a: "Amazon EC2, EC2 Auto Scaling, Elastic Load Balancing, AWS Lambda, Amazon ECS, AWS Fargate, Amazon ECR and Amazon EKS, plus a chapter on other compute services. A section helps you choose a container service." },
  { q: "Does it cover IAM and security in depth?", a: "Yes. The IAM chapter covers policy anatomy, evaluation logic, identity-based versus resource-based policies, roles and temporary credentials, ABAC and root user hygiene. Part 7 covers KMS, Secrets Manager, ACM, threat detection, compliance, auditing and edge protection." },
  { q: "Are databases and storage covered?", a: "Yes. Storage covers Amazon S3, EBS, EFS, FSx and AWS Backup. Databases cover a how-to-choose chapter, RDS and Aurora, DynamoDB, ElastiCache, MemoryDB and specialised databases." },
  { q: "Does it include AI on AWS?", a: "Yes. Part 10 covers Amazon Bedrock including RAG and guardrails, Bedrock AgentCore and agentic services, Amazon SageMaker AI with AWS ML silicon, and ready-made AI services." },
  { q: "Are there hands-on labs and reference architectures?", a: "Yes. Part 14 has two reference architectures, a three-tier web application and event-driven serverless, and four labs: secure a new account, a static site with CloudFront, a serverless API and a clean-up lab." },
  { q: "Does it cover infrastructure as code and CI/CD?", a: "Yes. It covers CloudFormation, CDK in Python, SAM and Terraform, a CodeBuild buildspec, GitHub Actions deploying with OIDC and no stored keys, and deployment strategies." },
  { q: "Will it help with AWS interviews and certifications?", a: "Yes. Appendix D collects interview and certification questions. Other appendices include a CLI cheat sheet, common limits and quotas, a glossary, a lifecycle and version snapshot, learning resources and an A-Z index." },
  { q: "Who is this book for?", a: "Developers, DevOps and cloud engineers, data engineers, architects and students. It starts from global infrastructure and accounts, so beginners can follow it, and goes deep enough for experienced engineers to use as a reference." },
  { q: "What format is the book and how do I get it?", a: "It is a digital ebook with instant access after checkout, and payment opens in a secure checkout window. Digital products are non-refundable after purchase. For help write to supporttargettrek@gmail.com." },
];

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
    <div className="sql-term" role="img" aria-label="Animated example of AWS CLI commands in a terminal">
      <div className="sql-term-bar">
        <span className="sql-dots"><i /><i /><i /></span>
        <span className="sql-term-title sql-mono">{q.file}</span>
        <span className="sql-term-badge">AWS CLI</span>
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

const ROTATING = ["IAM & security", "Lambda & containers", "S3 & DynamoDB", "VPC & networking", "Bedrock & AI"];
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
    <section className="lld-section sql-lessons" id="free-snippets" aria-labelledby="aws-free-title">
      <div className="lld-shell">
        <motion.div className="lld-section-head" {...animation}>
          <div className="lld-kicker">Free · try before you buy</div>
          <h2 id="aws-free-title">Free AWS CLI snippets</h2>
          <p>Seven hands-on commands with sample output and the point interviewers want to hear. Tap a topic to switch.</p>
        </motion.div>
        <div className="sql-rail" role="tablist" aria-label="Free AWS CLI snippets">
          {FREE_SNIPPETS.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              id={`atab-${x.id}`}
              aria-selected={active === x.id}
              aria-controls={`apanel-${x.id}`}
              className={`sql-pill${active === x.id ? " is-active" : ""}`}
              onClick={() => setActive(x.id)}
            >
              {x.tab}
            </button>
          ))}
        </div>
        {FREE_SNIPPETS.map((x) => (
          <div key={x.id} className="sql-lesson" role="tabpanel" id={`apanel-${x.id}`} aria-labelledby={`atab-${x.id}`} hidden={active !== x.id}>
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
                <div className="sql-out-label">✓ Sample output</div>
                <pre>{x.out}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ChapterFlow({ animation }) {
  return (
    <section className="lld-section-tight" id="anatomy" aria-labelledby="aws-anatomy-title">
      <div className="lld-shell">
        <motion.div className="lld-section-head" {...animation}>
          <div className="lld-kicker">A consistent chapter pattern</div>
          <h2 id="aws-anatomy-title">Learn each service the same way</h2>
          <p>Most service chapters move from the idea to the vocabulary, then to hands-on work and the traps to avoid.</p>
        </motion.div>
        <div className="aws-flow4">
          {CHAPTER_FLOW.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                className="lld-card gcp-spot aws-flow4-card"
                key={s.t}
                onMouseMove={spot}
                {...animation}
                transition={{ ...animation.transition, delay: i * 0.07 }}
              >
                <span className="lld-module-icon"><Icon size={19} /></span>
                <span className="gcp-sec-n">{String(i + 1).padStart(2, "0")}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </motion.div>
            );
          })}
        </div>
        <motion.div className="lld-card gcp-spot aws-fresh" onMouseMove={spot} {...animation}>
          <span className="sql-badge">Updated for 2025–26</span>
          <h3>What changed in 2025 to 2026</h3>
          <p>Headline launches and renames, lifecycle notices to design around and a runtime and version snapshot, so you learn the current platform and not an outdated one.</p>
        </motion.div>
      </div>
    </section>
  );
}

function LearningPath({ animation, reduce }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.3 });
  return (
    <section className="lld-section" id="path" aria-labelledby="aws-path-title">
      <div className="lld-shell">
        <motion.div className="lld-section-head" {...animation}>
          <div className="lld-kicker">Your learning path</div>
          <h2 id="aws-path-title">From first account to production on AWS</h2>
          <p>The book is grouped into six stages, ordered the way real AWS environments are built.</p>
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
    <section className="lld-section-tight" id="picker" aria-labelledby="aws-picker-title">
      <div className="lld-shell">
        <motion.div className="lld-section-head" {...animation}>
          <div className="lld-kicker">Interactive · decision guide</div>
          <h2 id="aws-picker-title">Which AWS service fits?</h2>
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
              <span className="gcp-where">Read more: {item.where}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function ArchAndLabs({ animation }) {
  return (
    <section className="lld-section-tight" id="architectures" aria-labelledby="aws-ref-title">
      <div className="lld-shell">
        <motion.div className="lld-section-head" {...animation}>
          <div className="lld-kicker">Part 14 · build it yourself</div>
          <h2 id="aws-ref-title">Reference architectures and hands-on labs</h2>
          <p>Two architectures show how services combine, and four labs take you from securing an account to cleaning up. Typical flows are shown below.</p>
        </motion.div>
        <div className="gcp-refs aws-refs">
          {REF_ARCHS.map((r, idx) => (
            <motion.article
              className="lld-card gcp-spot gcp-ref"
              key={r.n}
              onMouseMove={spot}
              {...animation}
              transition={{ ...animation.transition, delay: idx * 0.08 }}
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
        <div className="aws-labs">
          {LABS.map((lab, idx) => (
            <motion.div
              className="lld-card gcp-spot aws-lab"
              key={lab.n}
              onMouseMove={spot}
              {...animation}
              transition={{ ...animation.transition, delay: idx * 0.07 }}
            >
              <span className="sql-badge">Lab {lab.n}</span>
              <h3>{lab.title}</h3>
              <p>{lab.text}</p>
            </motion.div>
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
        <span className="sql-ch-n"><BookOpen size={15} /></span>
        <h4>{chapter.title}</h4>
      </div>
      {chapter.topics.length > 0 && (
        <ul>
          {chapter.topics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

function PartsExplorer({ animation }) {
  const [active, setActive] = useState("start");
  return (
    <section className="lld-section" id="curriculum">
      <div className="lld-shell">
        <motion.div className="lld-section-head" {...animation}>
          <div className="lld-kicker">Complete table of contents</div>
          <h2>{NUMBERED.length} parts. {CHAPTER_COUNT} chapters. Every topic inside.</h2>
          <p>Pick a section to explore its chapters and the topics inside them.</p>
        </motion.div>
        <motion.div className="sql-ptabs aws-ptabs" role="tablist" aria-label="Book parts" {...animation}>
          {PARTS.map((part) => (
            <button
              key={part.id}
              type="button"
              role="tab"
              id={`aptab-${part.id}`}
              aria-selected={active === part.id}
              aria-controls={`appanel-${part.id}`}
              className={`sql-ptab${active === part.id ? " is-active" : ""}`}
              onClick={() => setActive(part.id)}
            >
              <span className="sql-ptab-num">{part.label}</span>
              <span className="sql-ptab-title">{part.title}</span>
              <span className="sql-ptab-meta">{part.chapters.length} chapters</span>
            </button>
          ))}
        </motion.div>
        {PARTS.map((part) => {
          const Icon = part.icon;
          return (
            <div key={part.id} className="lld-card sql-panel" role="tabpanel" id={`appanel-${part.id}`} aria-labelledby={`aptab-${part.id}`} hidden={active !== part.id}>
              <span className="sql-panel-mark" aria-hidden="true">{part.label}</span>
              <div className="sql-panel-head">
                <span className="lld-module-icon"><Icon size={19} /></span>
                <div>
                  <div className="lld-kicker">{typeof part.id === "number" ? `Part ${part.id}` : part.title}</div>
                  <h3>{part.title}</h3>
                  <p>{part.summary}</p>
                </div>
              </div>
              <div className="sql-panel-stats">
                <span className="sql-badge">{part.chapters.length} chapters</span>
              </div>
              <div className="sql-ch-grid">
                {part.chapters.map((chapter, index) => (
                  <ChapterCard chapter={chapter} index={index} key={chapter.title} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const awsStyles = `
.aws-flow4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.aws-flow4-card { padding: 20px; overflow: hidden; }
.aws-flow4-card h3 { position: relative; margin: 14px 0 6px; font-size: 16px; }
.aws-flow4-card p { position: relative; margin: 0; color: var(--muted); font-size: 12.5px; line-height: 1.7; }
.aws-fresh { margin-top: 16px; padding: 22px; border-color: color-mix(in srgb, var(--accent) 45%, var(--border)); }
.aws-fresh h3 { position: relative; margin: 10px 0 6px; font-size: 18px; }
.aws-fresh p { position: relative; margin: 0; color: var(--muted); font-size: 13.5px; line-height: 1.75; max-width: 760px; }
.aws-refs { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.aws-refs .gcp-ref:last-child { grid-column: auto; }
.aws-labs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-top: 16px; }
.aws-lab { padding: 20px; }
.aws-lab h3 { position: relative; margin: 12px 0 6px; font-size: 15.5px; }
.aws-lab p { position: relative; margin: 0; color: var(--muted); font-size: 12.5px; line-height: 1.7; }
.aws-ptabs { grid-template-columns: repeat(8, minmax(0, 1fr)); }
.aws-ptabs .sql-ptab-title { min-height: 2.6em; }
@media (max-width: 1200px) { .aws-ptabs { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 1100px) { .aws-flow4, .aws-labs { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 950px) { .aws-refs { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 720px) {
  .aws-ptabs { display: flex; grid-template-columns: none; }
  .aws-flow4, .aws-labs { gap: 10px; }
  .aws-flow4-card, .aws-lab { padding: 16px; }
}
@media (max-width: 520px) { .aws-flow4, .aws-labs { grid-template-columns: minmax(0, 1fr); } }
`;

export default function AwsHandbook({ navbarOffset = 64 }) {
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
        console.error("Failed to fetch AWS product:", error);
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
      title: product.title || "AWS: The Complete Cloud Engineer's Handbook",
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

  const productName = product?.title || "AWS: The Complete Cloud Engineer's Handbook";
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
        speakable: { "@type": "SpeakableSpecification", cssSelector: ["#aws-quick-answer", "#faq"] },
        ...(seoImage ? { primaryImageOfPage: { "@type": "ImageObject", url: seoImage } } : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
          { "@type": "ListItem", position: 3, name: "AWS: The Complete Cloud Engineer's Handbook", item: PAGE_URL },
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
        about: ["Amazon Web Services", "Cloud computing", "Serverless", "Cloud security", "DevOps"],
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
        category: "Amazon Web Services Ebook",
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
        name: "Parts of AWS: The Complete Cloud Engineer's Handbook",
        numberOfItems: PARTS.length,
        itemListElement: PARTS.map((part, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: part.title,
          description: part.chapters.map((c) => c.title).join("; "),
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
        <style>{awsStyles}</style>
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
                  <Cloud size={13} /> AWS · the complete cloud engineer's handbook
                </div>
                <h1>
                  Master AWS.
                  <br />
                  <span className="lld-gradient-text">From account to production.</span>
                </h1>
                <RotatingTopic reduce={reduceMotion} />
                <p className="lld-hero-copy">
                  {NUMBERED.length} parts and {CHAPTER_COUNT} chapters covering IAM, compute, storage,
                  databases, networking, security, integration, analytics and Amazon Bedrock, with
                  reference architectures, four hands-on labs and what changed in 2025 and 2026.
                </p>
                <div className="lld-hero-actions">
                  <button className="lld-cta" type="button" onClick={openCheckout} disabled={!canBuy}>
                    Get the ebook {displayedPrice !== "Unavailable" && <span>{displayedPrice}</span>} <ArrowRight size={16} />
                  </button>
                  <a className="lld-cta lld-cta-outline" href="#free-snippets">
                    <Terminal size={16} /> Try free AWS CLI snippets
                  </a>
                </div>
                {productError && (
                  <p className="lld-error">Price is temporarily unavailable. Please try again or contact {SUPPORT_EMAIL}.</p>
                )}
                <div className="sql-trust">
                  <span><Check size={13} /> 4 hands-on labs</span>
                  <span><Check size={13} /> Updated for 2025–26</span>
                  <span><Check size={13} /> CLI cheat sheet</span>
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
                <div className="sql-chip sql-chip-a"><Zap size={15} color="#FB923C" /> Lambda & containers</div>
                <div className="sql-chip sql-chip-b"><Database size={15} color="#F59E0B" /> S3 & DynamoDB</div>
                <motion.div style={reduceMotion ? undefined : { y: termY }} className="gcp-term-wrap">
                  <HeroTerminal reduce={reduceMotion} />
                </motion.div>
                <div className="sql-mini-book" aria-hidden="true">
                  {seoImage ? (
                    <img src={seoImage} alt="" loading="lazy" />
                  ) : (
                    <div><small>Target Trek</small>AWS<br />Handbook</div>
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
                    <strong><CountUp to={Number(value)} /></strong>
                    <span>{label}</span>
                  </motion.div>
                ))}
              </div>
            </ScrollScale>
          </section>

          <section className="lld-section-tight" aria-labelledby="aws-quick-title">
            <div className="lld-shell">
              <motion.div className="sql-quick" id="aws-quick-answer" {...animation}>
                <div className="lld-kicker">In short</div>
                <h2 id="aws-quick-title">What is AWS: The Complete Cloud Engineer's Handbook?</h2>
                <p>{QUICK_ANSWER}</p>
              </motion.div>
            </div>
          </section>

          <ChapterFlow animation={animation} />
          <LearningPath animation={animation} reduce={reduceMotion} />
          <FreeSnippets animation={animation} />
          <ServicePicker animation={animation} />
          <PartsExplorer animation={animation} />
          <ArchAndLabs animation={animation} />

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
                        aria-controls={`aws-faq-${index}`}
                      >
                        <span>{item.q}</span>
                        <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                          <ChevronDown size={17} />
                        </motion.span>
                      </button>
                      <div className={`lld-faq-collapse${isOpen ? " is-open" : ""}`} id={`aws-faq-${index}`} role="region">
                        <div className="lld-faq-collapse-inner">
                          <div className="lld-faq-answer">{item.a}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="sql-related">
                <a className="lld-cta lld-cta-outline" href="/book/cloud/gcp">Google Cloud book <ArrowRight size={15} /></a>
                <a className="lld-cta lld-cta-outline" href="/book/system-design/hld">System Design HLD book <ArrowRight size={15} /></a>
              </div>
            </div>
          </section>

          <section className="lld-section-tight">
            <div className="lld-shell">
              <ScrollScale from={0.9}>
                <motion.div className="lld-final-cta" {...animation}>
                  <div className="lld-final-copy">
                    <div className="lld-eyebrow"><Sparkles size={13} /> Become fluent in AWS</div>
                    <h2>Go from first account to production architecture.</h2>
                    <p>
                      Get the handbook and learn the core services with a consistent structure,
                      hands-on labs, reference architectures and interview practice.
                    </p>
                    <div className="lld-final-checks">
                      <span><Check size={14} /> {NUMBERED.length} parts</span>
                      <span><Check size={14} /> 4 labs</span>
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
              <strong className="lld-sticky-title">AWS: The Complete Cloud Engineer's Handbook</strong>
              <div className="lld-sticky-price">
                <span className="lld-sticky-now">
                  {loadingProduct ? "Loading…" : productError || !validPrice ? "Price unavailable" : formatMoney(currentPrice)}
                </span>
                {!loadingProduct && !productError && mrp > currentPrice && (
                  <span className="lld-sticky-old">{formatMoney(mrp)}</span>
                )}
                {!loadingProduct && !productError && discount > 0 && <span className="lld-sticky-off">{discount}% off</span>}
              </div>
              <small className="lld-sticky-sub">AWS Handbook</small>
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
