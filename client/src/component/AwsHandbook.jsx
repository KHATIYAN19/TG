import CloudHandbookPage from "./CloudHandbookPage.jsx";
import * as data from "./awsBookData";

/*
  /book/cloud/aws: AWS: The Complete Cloud Engineer's Handbook.
  Layout lives in CloudHandbookPage.jsx (shared with /book/cloud/gcp); book facts live in awsBookData.js.
  The SEO_* constants below are also read by scripts/gen-seo-data.mjs for the server-rendered page.
*/

const SEO_TITLE = "AWS Ebook (PDF): Complete Cloud Engineer's Handbook | Target Trek";
const SEO_DESCRIPTION = "Learn AWS end to end in one PDF: IAM, EC2, Lambda, S3, DynamoDB, VPC, security, Bedrock, IaC and FinOps, plus 4 labs, a CLI cheat sheet and interview questions.";
const SEO_LONG_DESCRIPTION = "AWS: The Complete Cloud Engineer's Handbook is a PDF ebook by Target Trek in 14 parts plus 7 appendices: global infrastructure, accounts and Control Tower, IAM and IAM Identity Center, EC2, Auto Scaling and Elastic Load Balancing, Lambda, containers (ECS, Fargate, ECR, EKS), S3, EBS, EFS, FSx, RDS, Aurora, DynamoDB, ElastiCache, VPC, Route 53, CloudFront, API Gateway, KMS, Secrets Manager, threat detection, SQS, SNS, EventBridge, Step Functions, Kinesis, Athena, Glue, Redshift, OpenSearch, Amazon Bedrock, Bedrock AgentCore, SageMaker AI, CloudFormation, CDK, SAM, Terraform, CI/CD with GitHub Actions and OIDC, CloudWatch, X-Ray, Systems Manager, governance and FinOps. Most service chapters go from what it is to core concepts, hands-on CLI and infrastructure-as-code examples and gotchas. It ends with two reference architectures (three-tier web application and event-driven serverless), four hands-on labs and appendices with a service catalogue, AWS CLI cheat sheet, limits and quotas, interview and certification questions, glossary, version snapshot and an A–Z index. Updated for 2025 to 2026.";
const SEO_KEYWORDS = "AWS book, AWS ebook, AWS PDF, AWS handbook, AWS book for beginners, learn AWS, Amazon Web Services tutorial, AWS interview questions, AWS certification preparation, AWS Solutions Architect preparation, AWS cloud engineer, IAM policies, EC2, Lambda, S3, DynamoDB, RDS, Aurora, VPC, CloudFront, API Gateway, SQS SNS EventBridge, Amazon Bedrock, SageMaker AI, CloudFormation, AWS CDK, Terraform on AWS, AWS CLI cheat sheet, AWS reference architecture, AWS FinOps, AWS book India";

const NUMBERED = data.PARTS_RAW.filter((p) => /^\d+$/.test(p.number));
const CHAPTER_COUNT = NUMBERED.reduce((n, p) => n + p.chapters.length, 0);

const CONFIG = {
  path: data.PAGE_URL,
  otherUrl: data.OTHER_URL,
  data,
  seo: { title: SEO_TITLE, description: SEO_DESCRIPTION, longDescription: SEO_LONG_DESCRIPTION, keywords: SEO_KEYWORDS },
  crumb: "AWS Handbook",
  shortName: "AWS",
  cliName: "AWS CLI",
  wiki: { name: "Amazon Web Services", url: "https://en.wikipedia.org/wiki/Amazon_Web_Services" },
  teaches: ["AWS IAM and least-privilege access", "Amazon EC2, Auto Scaling and load balancing", "AWS Lambda and serverless", "Containers on ECS, Fargate and EKS", "Amazon S3 and storage", "RDS, Aurora and DynamoDB", "Amazon VPC and networking", "AWS security: KMS, Secrets Manager, threat detection", "SQS, SNS, EventBridge and Step Functions", "Analytics with Athena, Glue and Redshift", "Generative AI with Amazon Bedrock", "Infrastructure as code with CloudFormation, CDK and Terraform", "Observability with CloudWatch", "AWS cost management and FinOps"],
  pill: "AWS handbook · PDF ebook · updated for 2025–26",
  heroTitle: <>Learn AWS the way you’ll use it at work, <span className="hb-mark">from first account to production.</span></>,
  heroLead: "14 parts through IAM, EC2, Lambda, containers, S3, DynamoDB, VPC, security, Bedrock, infrastructure as code and FinOps. Hands-on CLI examples in every service chapter, plus 2 reference architectures, 4 labs and interview questions.",
  stats: [[String(NUMBERED.length), "parts"], [String(CHAPTER_COUNT), "chapters"], [String(data.LABS.length), "hands-on labs"], ["7", "appendices"]],
  coverFallback: { title: "AWS Handbook", subtitle: "The Complete Cloud Engineer's Handbook", line: "14 parts · 4 labs · updated 2025–26" },
  templateSection: {
    title: "How each service chapter is written",
    lead: "Most service chapters take the same four steps, so you always know where to find the concept, the command or the trap.",
    items: data.CHAPTER_FLOW,
  },
  deepLabel: "Service deep-dive",
  searchHint: "Search: Lambda, VPC, Bedrock, Terraform…",
  archTitle: "2 reference architectures and 4 hands-on labs",
  archLead: "Part 14 ties the services together, then you build, secure and clean up in your own account.",
  finalTitle: <>Build on AWS with a plan, <span className="hb-mark">not a pile of browser tabs.</span></>,
  finalLine: "14 parts, hands-on CLI examples, 4 labs and interview questions in one digital PDF you can read anywhere.",
  footerLine: "AWS: The Complete Cloud Engineer's Handbook · Digital PDF ebook · Digital purchases are not refundable",
  footerLinks: [[data.OTHER_URL, "Google Cloud (GCP) Handbook"], ["/book/docker", "Docker Handbook"], ["/book/git", "Git & GitHub"]],
};

export default function AwsHandbook() {
  return <CloudHandbookPage config={CONFIG} />;
}
