/*
  Content for /book/cloud/aws: AWS: The Complete Cloud Engineer's Handbook.
  Everything here comes from the book's table of contents. Do not add parts, chapters or claims that are not in the book.
  Plain data only (no imports, no references between constants): scripts/gen-seo-data.mjs reads HANDBOOK, PARTS_RAW,
  QUICK_ANSWER and PICKER from this file to build the server-rendered page that search engines and AI crawlers see.
*/

export const PAGE_URL = "/book/cloud/aws";
export const OTHER_URL = "/book/cloud/gcp";

export const HANDBOOK = {
  title: "AWS: The Complete Cloud Engineer's Handbook",
  tagline: "Amazon Web Services from your first account to production: 14 parts, 4 hands-on labs, 2 reference architectures and 7 appendices, updated for 2025–26.",
  includes: [
    "14 parts from foundations to reference architectures",
    "What it is → core concepts → hands-on → gotchas, in every service chapter",
    "AWS CLI, CloudFormation, CDK, SAM and Terraform examples",
    "2 reference architectures and 4 hands-on labs",
    "What changed in 2025 to 2026: launches, renames, lifecycle notices",
    "Appendices: CLI cheat sheet, quotas, interview questions, glossary, A–Z index",
  ],
};

export const QUICK_ANSWER =
  "AWS: The Complete Cloud Engineer's Handbook is a 14-part PDF ebook by Target Trek that teaches Amazon Web Services from foundations to production: global infrastructure, accounts and IAM, compute (EC2, Lambda, containers), storage, databases, networking, security, application integration, analytics, AI with Amazon Bedrock, infrastructure as code, observability and cost management. It includes two reference architectures, four hands-on labs, an AWS CLI cheat sheet and interview and certification questions, and covers what changed in 2025 and 2026.";

/* number: shown in the accordion; title; summary; chapters: { title, topics[] } */
export const PARTS_RAW = [
  {
    number: "Start", title: "Start Here",
    summary: "How the book works, the whole AWS map on one page and what changed across 2025 and 2026.",
    chapters: [
      { title: "About This Book", topics: ["How every chapter is structured", "Callout legend", "What \"verified\" means in this edition", "Reading paths"] },
      { title: "The AWS Map in One Page", topics: ["The twelve building blocks"] },
      { title: "What Changed in 2025 to 2026", topics: ["Headline launches and renames", "Lifecycle notices to design around", "Runtime and version snapshot"] },
    ],
  },
  {
    number: "01", title: "Foundations",
    summary: "Regions, accounts, the shared responsibility model, tooling and how AWS pricing really works.",
    chapters: [
      { title: "Global Infrastructure", topics: ["Global, regional and zonal services", "How to choose a Region", "Gotchas"] },
      { title: "Accounts, Organizations and Control Tower", topics: ["Recommended account layout", "Creating and guarding accounts"] },
      { title: "Shared Responsibility and the Well-Architected Framework", topics: ["The shared responsibility model", "The six Well-Architected pillars", "Design principles to apply everywhere"] },
      { title: "Tools: Console, CLI, SDKs and Infrastructure as Code", topics: ["Credentials: the safe way", "CLI techniques worth learning early"] },
      { title: "How AWS Pricing Works", topics: ["The three pricing ideas", "Cost dimensions by service family", "Purchase options for compute", "The Free Tier", "Five cost levers that matter most"] },
    ],
  },
  {
    number: "02", title: "Identity and Access Management",
    summary: "Policies, evaluation logic, roles, federation and the habits that keep an account safe.",
    chapters: [
      { title: "AWS IAM", topics: ["Anatomy of a policy", "Policy evaluation logic", "Identity-based versus resource-based policies", "Roles and temporary credentials", "Hands-on: a least-privilege role from the CLI", "Attribute-based access control (ABAC)", "Root user and account hygiene", "Limits worth knowing", "Gotchas"] },
      { title: "IAM Identity Center, Federation and Cognito", topics: ["IAM Identity Center", "Amazon Cognito", "Other identity services", "Federating GitHub Actions without stored keys"] },
    ],
  },
  {
    number: "03", title: "Compute",
    summary: "EC2, Auto Scaling, load balancing, Lambda and containers on ECS, Fargate, ECR and EKS.",
    chapters: [
      { title: "Amazon EC2", topics: ["Instance families at a glance", "Launch an instance (CLI)", "Purchasing, lifecycle and states", "Security baseline", "CloudFormation: a launch template", "Gotchas"] },
      { title: "EC2 Auto Scaling and Elastic Load Balancing", topics: ["Auto Scaling concepts", "Load balancer types", "Build it from the CLI", "Gotchas"] },
      { title: "AWS Lambda", topics: ["Limits that shape designs", "Supported runtimes", "Write, package and deploy", "The same function with AWS SAM", "Performance and cost tuning", "Gotchas"] },
      { title: "Containers on AWS: ECS, Fargate, ECR and EKS", topics: ["Choosing a container service", "Amazon ECS", "Amazon ECR", "Amazon EKS"] },
      { title: "Other Compute Services", topics: [] },
    ],
  },
  {
    number: "04", title: "Storage",
    summary: "S3 in depth, block and file storage, backup, data transfer and hybrid storage.",
    chapters: [
      { title: "Amazon S3", topics: ["Storage classes", "Security: the checklist", "Hands-on with the CLI", "Replication, events and other features", "New data-centric S3 capabilities", "Gotchas"] },
      { title: "Block and File Storage: EBS, EFS and FSx", topics: ["Amazon EBS", "Amazon EFS", "Amazon FSx"] },
      { title: "Backup, Transfer and Hybrid Storage", topics: ["AWS Backup", "Data movement and hybrid services"] },
    ],
  },
  {
    number: "05", title: "Databases",
    summary: "Choose the right database, then go deep on RDS, Aurora, DynamoDB and caching.",
    chapters: [
      { title: "Choosing a Database on AWS", topics: [] },
      { title: "Amazon RDS and Aurora", topics: ["Core concepts", "Hands-on", "Operational practice"] },
      { title: "Amazon DynamoDB", topics: ["Core concepts", "Designing for DynamoDB", "Limits worth memorising"] },
      { title: "ElastiCache, MemoryDB and the Specialised Databases", topics: ["In-memory", "Document, graph, wide-column and time series", "Migration and modernisation tools"] },
    ],
  },
  {
    number: "06", title: "Networking and Content Delivery",
    summary: "VPC, DNS, CDN, APIs and how to connect networks together.",
    chapters: [
      { title: "Amazon VPC", topics: ["Security groups versus network ACLs", "Hands-on", "Gotchas"] },
      { title: "Route 53 and CloudFront", topics: ["Amazon Route 53", "Amazon CloudFront"] },
      { title: "API Gateway, Hybrid Networking and Service Connectivity", topics: ["Amazon API Gateway", "Connecting networks"] },
    ],
  },
  {
    number: "07", title: "Security and Compliance",
    summary: "Encryption, secrets, threat detection, auditing and a baseline for every new account.",
    chapters: [
      { title: "Encryption and Secrets: KMS, Secrets Manager, ACM", topics: ["AWS Key Management Service (KMS)", "Secrets Manager and Parameter Store", "Certificates and other cryptographic services"] },
      { title: "Threat Detection, Compliance and Auditing", topics: ["The detection and governance services", "Turn on the essentials organisation-wide", "A pragmatic baseline for every new account"] },
      { title: "Edge and Network Protection", topics: [] },
    ],
  },
  {
    number: "08", title: "Application Integration",
    summary: "Decouple systems with queues, topics, events, workflows and streaming.",
    chapters: [
      { title: "SQS, SNS and EventBridge", topics: ["Why decouple", "The three building blocks", "Amazon SQS in detail", "SNS and EventBridge in practice", "Choosing among them"] },
      { title: "Step Functions, AppSync and Messaging Services", topics: ["AWS Step Functions", "Other application-integration services"] },
      { title: "Streaming: Kinesis, MSK and Firehose", topics: [] },
    ],
  },
  {
    number: "09", title: "Analytics and Data",
    summary: "Data lakes and lakehouses, Athena, Glue, Redshift, OpenSearch and business intelligence.",
    chapters: [
      { title: "The Data Lake and Lakehouse on AWS", topics: ["The core services", "Design principles"] },
      { title: "Athena and Glue in Practice", topics: ["Amazon Athena", "AWS Glue ETL (PySpark)"] },
      { title: "Redshift, OpenSearch and Business Intelligence", topics: ["Amazon Redshift", "Amazon OpenSearch Service", "Amazon Quick (formerly Amazon QuickSight)", "Choosing an analytics engine"] },
    ],
  },
  {
    number: "10", title: "AI and Machine Learning",
    summary: "Amazon Bedrock, RAG, guardrails, agents, SageMaker AI and ready-made AI services.",
    chapters: [
      { title: "Amazon Bedrock", topics: ["Discover models and call one", "Retrieval-augmented generation (RAG)", "Guardrails"] },
      { title: "Bedrock AgentCore and the Agentic AWS Services", topics: ["Amazon Bedrock AgentCore", "Agents that work on AWS for you"] },
      { title: "Amazon SageMaker AI and Custom Machine Learning", topics: ["What it is", "AWS ML silicon"] },
      { title: "Ready-Made AI Services", topics: [] },
    ],
  },
  {
    number: "11", title: "Developer Tools and Observability",
    summary: "Infrastructure as code, CI/CD, deployment strategies and observability.",
    chapters: [
      { title: "Infrastructure as Code: CloudFormation, CDK, SAM and Terraform", topics: ["Why IaC", "CloudFormation essentials", "CDK in Python", "Terraform backend and a resource"] },
      { title: "CI/CD and Developer Services", topics: ["A buildspec for CodeBuild", "GitHub Actions deploying with OIDC (no stored keys)", "Deployment strategies"] },
      { title: "Observability: CloudWatch, X-Ray and OpenTelemetry", topics: ["Amazon CloudWatch", "Tracing and open standards", "Alarming principles"] },
    ],
  },
  {
    number: "12", title: "Management, Governance and Cost",
    summary: "Operate fleets, govern accounts and keep the bill under control.",
    chapters: [
      { title: "Systems Manager and Fleet Operations", topics: [] },
      { title: "Governance: Organizations, Control Tower, Config and Service Catalog", topics: [] },
      { title: "Cost Management and FinOps", topics: ["Cost reduction checklist"] },
    ],
  },
  {
    number: "13", title: "The Long Tail of AWS Services",
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
    number: "14", title: "Reference Architectures and Hands-On Labs",
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
    number: "A–G", title: "Appendices and Index",
    summary: "Service catalogue, CLI cheat sheet, quotas, interview questions, glossary, version snapshot and an A–Z index.",
    chapters: [
      { title: "Appendix A: Service Catalog by Category", topics: [] },
      { title: "Appendix B: AWS CLI Cheat Sheet", topics: [] },
      { title: "Appendix C: Common Limits and Quotas", topics: [] },
      { title: "Appendix D: Interview and Certification Questions", topics: [] },
      { title: "Appendix E: Glossary", topics: [] },
      { title: "Appendix F: Lifecycle and Version Snapshot", topics: [] },
      { title: "Appendix G: Learning Resources", topics: [] },
      { title: "A–Z Index", topics: [] },
    ],
  },
];

/* how most service chapters are written */
export const CHAPTER_FLOW = [
  { title: "What it is", copy: "A plain explanation of the service and the problem it solves." },
  { title: "Core concepts", copy: "The vocabulary and building blocks you must know." },
  { title: "Hands-on", copy: "AWS CLI and infrastructure-as-code examples you can run." },
  { title: "Gotchas", copy: "Limits and traps that catch engineers in production." },
];

export const STAGES = [
  { title: "Start & Foundations", parts: "Start Here · Part 1", copy: "How to read the book, what changed in 2025 and 2026, Regions, accounts, pricing and tooling." },
  { title: "Identity & Compute", parts: "Parts 2–3", copy: "IAM policies and roles, then EC2, Auto Scaling, Lambda and containers." },
  { title: "Storage & Databases", parts: "Parts 4–5", copy: "S3, EBS, EFS, FSx, RDS, Aurora, DynamoDB and caching." },
  { title: "Network & Security", parts: "Parts 6–7", copy: "VPC, Route 53, CloudFront, API Gateway, KMS, Secrets Manager and threat detection." },
  { title: "Integrate, Analyse & AI", parts: "Parts 8–10", copy: "SQS, SNS, EventBridge, Step Functions, Athena, Glue, Redshift, Bedrock and SageMaker AI." },
  { title: "Ship, Govern & Practise", parts: "Parts 11–14 · Appendices", copy: "IaC, CI/CD, observability, FinOps, reference architectures, labs and interview questions." },
];

/* "which service should I use?" — need, pick, where in the book, why, and the alternative */
export const PICKER = [
  { need: "Run code on events, no servers to manage", pick: "AWS Lambda", where: "Part 3 · AWS Lambda", why: "Upload a function and AWS runs it when something happens. You pay for execution time, not idle servers.", alt: "Mind the limits that shape designs, such as maximum run time." },
  { need: "Full control of a virtual machine", pick: "Amazon EC2", where: "Part 3 · Amazon EC2", why: "Resizable virtual machines with a choice of instance families and purchase options.", alt: "Pair with Auto Scaling and a load balancer for resilience." },
  { need: "Run containers without managing servers", pick: "Amazon ECS on Fargate", where: "Part 3 · Containers on AWS", why: "Run containers on ECS with Fargate so AWS manages the underlying compute.", alt: "Choose EKS when you specifically need Kubernetes." },
  { need: "Store files and objects at any scale", pick: "Amazon S3", where: "Part 4 · Amazon S3", why: "Object storage with storage classes, lifecycle rules, events and replication.", alt: "Use EBS for block storage and EFS for shared file storage." },
  { need: "Key-value data with predictable low latency", pick: "Amazon DynamoDB", where: "Part 5 · Amazon DynamoDB", why: "A managed NoSQL database where you design tables around your access patterns.", alt: "Choose RDS or Aurora when you need relational SQL." },
  { need: "A relational database for an application", pick: "Amazon RDS or Aurora", where: "Part 5 · RDS and Aurora", why: "Managed relational databases that handle patching, backups and failover.", alt: "The Choosing a Database chapter compares every option." },
  { need: "Decouple services with queues and events", pick: "SQS, SNS and EventBridge", where: "Part 8 · SQS, SNS and EventBridge", why: "Queues, pub/sub topics and event routing let producers and consumers evolve independently.", alt: "The chapter ends with how to choose among the three." },
  { need: "Add generative AI to an application", pick: "Amazon Bedrock", where: "Part 10 · Amazon Bedrock", why: "Call foundation models through one service, add retrieval (RAG) and apply guardrails.", alt: "Go further with Bedrock AgentCore for agents." },
];

export const REF_ARCHS = [
  { title: "Three-Tier Web Application", copy: "A classic layered design: edge, application tier and database.", flow: ["Route 53", "CloudFront", "Load Balancer", "EC2 / ECS", "RDS / Aurora"] },
  { title: "Event-Driven Serverless", copy: "Managed building blocks wired together by events, with no servers to run.", flow: ["API Gateway", "Lambda", "EventBridge", "SQS", "DynamoDB"] },
];

export const LABS = [
  { title: "Secure a New Account", copy: "Apply the account baseline from the security and governance chapters." },
  { title: "Static Site with CloudFront", copy: "Publish a website and serve it through the content delivery network." },
  { title: "Serverless API", copy: "Build an API with the serverless building blocks from earlier parts." },
  { title: "Clean Up", copy: "Remove what you created so lab resources never turn into a surprise bill." },
];

/* free samples in the style of the book's hands-on sections */
export const SNIPPETS = [
  {
    id: "sso", tab: "Safe credentials", where: "Part 1 · Tools", file: "login.sh",
    title: "Sign in with SSO instead of long-lived keys",
    intro: "Use IAM Identity Center so the CLI gets short-lived credentials, then confirm who you are.",
    code: "# One-time setup of a named profile\naws configure sso --profile dev\n\n# Sign in (opens your browser)\naws sso login --profile dev\n\n# Which identity am I using?\naws sts get-caller-identity --profile dev",
    out: "{\n  \"UserId\": \"AROA...:you@example.com\",\n  \"Account\": \"123456789012\",\n  \"Arn\": \"arn:aws:sts::123456789012:assumed-role/...\"\n}",
    tip: "Prefer temporary credentials and roles over access keys that never expire.",
  },
  {
    id: "s3", tab: "Secure S3 bucket", where: "Part 4 · Amazon S3", file: "s3.sh",
    title: "Create a bucket and block public access",
    intro: "Bucket names are global. Turn on Block Public Access first, then upload and list objects.",
    code: "aws s3 mb s3://my-unique-bucket-123 --region ap-south-1\n\naws s3api put-public-access-block \\\n  --bucket my-unique-bucket-123 \\\n  --public-access-block-configuration \\\n  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true\n\naws s3 cp ./report.pdf s3://my-unique-bucket-123/\naws s3 ls s3://my-unique-bucket-123/",
    out: "make_bucket: my-unique-bucket-123\nupload: ./report.pdf to s3://my-unique-bucket-123/report.pdf\n2025-01-15 10:02:11     48213 report.pdf",
    tip: "Pick the storage class by access pattern and add lifecycle rules for cold data.",
  },
  {
    id: "iam", tab: "Least-privilege role", where: "Part 2 · AWS IAM", file: "iam.sh",
    title: "Create a role and attach only what it needs",
    intro: "A role has a trust policy (who may assume it) and permission policies (what it can do). Keep both narrow.",
    code: "aws iam create-role \\\n  --role-name report-reader \\\n  --assume-role-policy-document file://trust.json\n\naws iam attach-role-policy \\\n  --role-name report-reader \\\n  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess",
    out: "{\n  \"Role\": {\n    \"RoleName\": \"report-reader\",\n    \"Arn\": \"arn:aws:iam::123456789012:role/report-reader\"\n  }\n}",
    tip: "An explicit Deny always wins, and anything not allowed is denied by default.",
  },
  {
    id: "lambda", tab: "Deploy Lambda", where: "Part 3 · AWS Lambda", file: "lambda.sh",
    title: "Create and invoke a function",
    intro: "Package your code as a zip, create the function with an execution role, then invoke it from the CLI.",
    code: "aws lambda create-function \\\n  --function-name hello \\\n  --runtime python3.12 \\\n  --handler app.handler \\\n  --zip-file fileb://function.zip \\\n  --role arn:aws:iam::123456789012:role/lambda-exec\n\naws lambda invoke --function-name hello out.json",
    out: "{\n  \"StatusCode\": 200,\n  \"ExecutedVersion\": \"$LATEST\"\n}",
    tip: "Know the limits that shape designs, and tune memory because CPU scales with it.",
  },
  {
    id: "ddb", tab: "DynamoDB table", where: "Part 5 · Amazon DynamoDB", file: "dynamodb.sh",
    title: "Create an on-demand table with a composite key",
    intro: "Design around access patterns: a partition key plus a sort key lets one table serve several queries.",
    code: "aws dynamodb create-table \\\n  --table-name Orders \\\n  --attribute-definitions \\\n    AttributeName=pk,AttributeType=S \\\n    AttributeName=sk,AttributeType=S \\\n  --key-schema \\\n    AttributeName=pk,KeyType=HASH \\\n    AttributeName=sk,KeyType=RANGE \\\n  --billing-mode PAY_PER_REQUEST",
    out: "{\n  \"TableDescription\": {\n    \"TableName\": \"Orders\",\n    \"TableStatus\": \"CREATING\"\n  }\n}",
    tip: "A good partition key spreads traffic evenly. Hot partitions are the classic DynamoDB pitfall.",
  },
  {
    id: "sqs", tab: "SQS queue", where: "Part 8 · SQS, SNS and EventBridge", file: "sqs.sh",
    title: "Send and receive a message",
    intro: "A queue lets a producer hand off work and a consumer process it later, at its own pace.",
    code: "QUEUE_URL=$(aws sqs create-queue --queue-name orders \\\n  --query QueueUrl --output text)\n\naws sqs send-message \\\n  --queue-url \"$QUEUE_URL\" \\\n  --message-body '{\"id\":42}'\n\naws sqs receive-message --queue-url \"$QUEUE_URL\"",
    out: "{\n  \"MessageId\": \"...\",\n  \"MD5OfMessageBody\": \"...\"\n}",
    tip: "Standard queues deliver at least once, so make consumers idempotent.",
  },
];

export const AUDIENCE = [
  { title: "Developers moving to the cloud", copy: "Start from Regions, accounts and IAM, then build with Lambda, S3 and DynamoDB." },
  { title: "DevOps, cloud and platform engineers", copy: "IaC with CloudFormation, CDK, SAM and Terraform, CI/CD with OIDC, observability and governance." },
  { title: "Data and ML engineers", copy: "Data lakes, Athena, Glue, Redshift, OpenSearch, Bedrock and SageMaker AI." },
  { title: "Interview and certification candidates", copy: "Interview and certification questions, limits and quotas, and a CLI cheat sheet to revise from." },
];

export const VALUE = [
  { title: "14 parts plus 7 appendices", copy: "From global infrastructure to reference architectures, then a catalogue, cheat sheet, glossary and A–Z index." },
  { title: "Hands-on in every service chapter", copy: "CLI commands and infrastructure-as-code examples you can run in your own account." },
  { title: "2 reference architectures and 4 labs", copy: "Three-tier web app and event-driven serverless, then secure an account, ship a site, build an API, clean up." },
  { title: "Current for 2025–26", copy: "A chapter on launches, renames, lifecycle notices and a runtime snapshot." },
];

/* the second cloud book, for the "choose your book" cards */
export const OTHER_BOOK = {
  eyebrow: "Google Cloud",
  title: "Google Cloud (GCP) Engineer's Handbook",
  copy: "The same end-to-end approach for Google Cloud: IAM, GKE, Cloud Run, BigQuery, Pub/Sub, networking, security and AI.",
  points: ["18 parts, 12-part template for every service", "5 reference architectures", "Certifications, interview questions, gcloud cheat sheet"],
  cta: "Get the GCP book",
};
