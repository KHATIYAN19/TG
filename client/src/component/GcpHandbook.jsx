import CloudHandbookPage from "./CloudHandbookPage.jsx";
import * as data from "./gcpBookData";

/*
  /book/cloud/gcp: the Google Cloud (GCP) Engineer's Handbook.
  Layout lives in CloudHandbookPage.jsx (shared with /book/cloud/aws); book facts live in gcpBookData.js.
  The SEO_* constants below are also read by scripts/gen-seo-data.mjs for the server-rendered page.
*/

const SEO_TITLE = "Google Cloud (GCP) Ebook PDF: Engineer's Handbook | Target Trek";
const SEO_DESCRIPTION = "Learn Google Cloud end to end in one PDF: IAM, GKE, Cloud Run, BigQuery, Pub/Sub, networking, security, AI, FinOps, 5 reference architectures and interview prep.";
const SEO_LONG_DESCRIPTION = "The Google Cloud (GCP) Engineer's Handbook is a PDF ebook by Target Trek in 18 parts plus appendices: global infrastructure, the resource hierarchy, gcloud and billing, IAM, service accounts, Workload Identity Federation, Compute Engine, managed instance groups, GKE, Artifact Registry, Cloud Run, Cloud Run functions, App Engine, Workflows, Eventarc, Cloud Storage, Filestore, Cloud SQL, AlloyDB, Cloud Spanner, Bigtable, Firestore, Memorystore, BigQuery, Pub/Sub, Dataflow, Dataproc, Cloud Composer, Looker, VPC, Cloud Load Balancing, Cloud CDN, Cloud DNS, Cloud NAT, Cloud Armor, Cloud KMS, Secret Manager, Security Command Center, Identity-Aware Proxy, VPC Service Controls, Gemini Enterprise Agent Platform (formerly Vertex AI), the Agent Development Kit, Vector Search and RAG Engine, TPUs and GPUs, Cloud Build, Cloud Deploy, Terraform, Cloud Logging and Monitoring, SLO practice, FinOps, Apigee, Firebase and migration. Every service chapter follows the same 12-part template: at a glance, what it is, when to use it, key concepts, architecture, console walkthrough, gcloud commands, deep dives, billing, best practices, pitfalls and interview and certification notes. It ends with five reference architectures, certification guidance, interview questions, a gcloud cheat sheet, a glossary and an A–Z catalogue of about 120 services.";
const SEO_KEYWORDS = "Google Cloud book, GCP book, GCP ebook, GCP PDF, Google Cloud handbook, learn Google Cloud, GCP tutorial, GCP for beginners, Google Cloud interview questions, GCP certification preparation, Associate Cloud Engineer preparation, Professional Cloud Architect preparation, Cloud Run, GKE, BigQuery, Pub/Sub, Dataflow, Cloud Spanner, Cloud SQL, AlloyDB, Vertex AI, Gemini Enterprise Agent Platform, Google ADK, IAM, VPC, Cloud Armor, gcloud cheat sheet, GCP reference architecture, GCP FinOps, Google Cloud book India";

const ALL = data.PARTS_RAW.filter((p) => /^\d+$/.test(p.number)).flatMap((p) => p.chapters);
const PART_COUNT = data.PARTS_RAW.filter((p) => /^\d+$/.test(p.number)).length;
const DEEP_COUNT = ALL.filter((c) => c.deep).length;

const CONFIG = {
  path: data.PAGE_URL,
  otherUrl: data.OTHER_URL,
  data,
  seo: { title: SEO_TITLE, description: SEO_DESCRIPTION, longDescription: SEO_LONG_DESCRIPTION, keywords: SEO_KEYWORDS },
  crumb: "Google Cloud Handbook",
  shortName: "Google Cloud",
  cliName: "gcloud",
  wiki: { name: "Google Cloud Platform", url: "https://en.wikipedia.org/wiki/Google_Cloud_Platform" },
  teaches: ["Google Cloud resource hierarchy and billing", "IAM, service accounts and Workload Identity Federation", "Compute Engine and managed instance groups", "Google Kubernetes Engine (GKE)", "Cloud Run and serverless", "Cloud Storage", "Cloud SQL, AlloyDB, Spanner, Bigtable and Firestore", "BigQuery, Pub/Sub and Dataflow", "VPC, load balancing and Cloud Armor", "Cloud KMS, Secret Manager and Security Command Center", "Gemini Enterprise Agent Platform, ADK and RAG Engine", "Cloud Build, Cloud Deploy and Terraform", "Cloud Logging, Monitoring and SLOs", "Google Cloud cost management and FinOps", "Google Cloud certification preparation"],
  pill: "Google Cloud handbook · PDF ebook · 2026 service names",
  heroTitle: <>Learn Google Cloud end to end, <span className="hb-mark">one service at a time.</span></>,
  heroLead: `18 parts through IAM, GKE, Cloud Run, BigQuery, Pub/Sub, networking, security, AI, DevOps and FinOps. ${DEEP_COUNT} service chapters built on the same 12-part template, with gcloud commands, billing, pitfalls and interview notes, plus 5 reference architectures.`,
  stats: [[String(PART_COUNT), "parts"], [String(ALL.length), "chapters"], [String(DEEP_COUNT), "service deep-dives"], [String(data.REF_ARCHS.length), "reference architectures"]],
  coverFallback: { title: "Google Cloud Handbook", subtitle: "GCP Engineer's Handbook", line: "18 parts · 5 reference architectures" },
  templateSection: {
    title: "The same 12 sections in every service chapter",
    lead: `All ${DEEP_COUNT} service deep-dives follow this template, so you can compare services side by side and revise fast before an interview.`,
    items: data.SERVICE_TEMPLATE,
  },
  deepLabel: "12-part deep-dive",
  searchHint: "Search: BigQuery, GKE, Spanner, IAM…",
  archTitle: "5 reference architectures, with the reasoning",
  archLead: "Part 17 ties the services together and explains why each one was chosen, the way design interviews expect.",
  finalTitle: <>Know which Google Cloud service to pick, <span className="hb-mark">and why.</span></>,
  finalLine: `18 parts, ${DEEP_COUNT} service deep-dives, 5 reference architectures and interview questions in one digital PDF.`,
  footerLine: "Google Cloud (GCP) Engineer's Handbook · Digital PDF ebook · Digital purchases are not refundable",
  footerLinks: [[data.OTHER_URL, "AWS Handbook"], ["/book/genai/google-adk", "Google ADK (GenAI)"], ["/book/docker", "Docker Handbook"]],
};

export default function GcpHandbook() {
  return <CloudHandbookPage config={CONFIG} />;
}
