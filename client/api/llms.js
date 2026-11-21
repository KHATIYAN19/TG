// GET /llms.txt – concise index for LLM/answer-engine crawlers.
import { createRequire } from "node:module";
import { SITE_URL, SITE_NAME, fetchAllPosts, fetchApi, truncate, send } from "./_lib.js";

const require = createRequire(import.meta.url);
const SEO = require("./_seo-data.json");

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

/* One line per book: generated from the live catalogue + the page's own SEO copy, so a new book or a
   price change shows up here without editing this file. */
function bookLines(books) {
  const seen = new Set();
  const line = (url, title, price, mrp, fallback) => {
    seen.add(url);
    const seo = SEO[url] || {};
    const about = seo.longDescription || seo.description || fallback || "";
    const cost = Number(price) > 0 ? ` Price: ${inr(price)}${Number(mrp) > Number(price) ? ` (list price ${inr(mrp)})` : ""}, one-time payment, PDF delivered instantly by email.` : "";
    return `- [${title}](${SITE_URL}${url}): ${about}${cost}`.trim();
  };
  const packAbout = (b) => {
    const names = (b.includedBooks || []).map((x) => (typeof x === "object" ? x?.title : "")).filter(Boolean);
    if (!names.length) return b.subtitle;
    const lifetime = b.membership?.plan === "lifetime";
    return `${names.length} Target Trek ebooks in one pack${lifetime ? ", plus every book published later emailed free (lifetime access)" : ""}: ${names.join(", ")}.`;
  };
  const out = books
    .filter((b) => b.redirectUrl)
    .map((b) => line(b.redirectUrl, b.title, b.price, b.mrp, packAbout(b)));
  // pages with their own SEO copy that are not (yet) in the catalogue
  Object.entries(SEO).forEach(([url, v]) => {
    if (!seen.has(url) && url.startsWith("/book") && url !== "/books" && url !== "/book" && v.title) {
      out.push(line(url, v.title.replace(/\s*\|.*$/, ""), 0, 0, v.description));
    }
  });
  return out;
}

export default async function handler(req, res) {
  // best-effort: the product list matters more than the blog list
  let posts = [];
  let partial = false;
  try {
    posts = await fetchAllPosts();
  } catch {
    partial = true;
  }

  let books = [];
  try {
    const r = await fetchApi("/book");
    books = Array.isArray(r.body?.data) ? r.body.data : [];
  } catch {
    partial = true;
  }

  let interviews = [];
  try {
    const r = await fetchApi("/api/interview?page=1");
    interviews = r.body?.data || [];
  } catch {
    /* optional */
  }

  const lines = [
    `# ${SITE_NAME}`,
    "",
    "> Target Trek (targettrek.in) is an Indian platform for software engineers preparing for tech interviews: practical PDF ebooks (system design HLD and LLD, Java, Spring Boot, SQL, AWS, Google Cloud, Docker, Git, operating systems, computer networks, GenAI: RAG, MCP, Google ADK), a resume review service with a free ATS score checker, job referrals, an interview prep-partner network, mock interviews, free system design guides and interactive greeting pages (Memories).",
    "",
    "Key facts: prices are in INR and paid once (UPI, cards, net banking), with no subscription for ebooks. Ebooks are digital PDFs emailed instantly after payment. Support: supporttargettrek@gmail.com.",
    "",
    "## Blog articles",
    ...posts
      .filter((p) => !p.seo?.noIndex)
      .map(
        (p) =>
          `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${truncate(p.excerpt, 160)}`
      ),
    "",
    "## Interview experiences",
    `- [All interview experiences](${SITE_URL}/interviews)`,
    ...interviews.map(
      (it) => `- [${it.title}](${SITE_URL}/interview/${it.slug}): ${truncate(it.summaryMarkdown || "", 140)}`
    ),
    "",
    "## Ebooks",
    `- [All ebooks](${SITE_URL}/books)`,
    `- [Bundle offers: buy multiple ebooks and save](${SITE_URL}/books/bundle-offers): Build your own bundle of Target Trek ebooks (system design, Java, Spring Boot, SQL, AWS, GCP, GenAI, OS, networks) in one order at a discount. Offer types include a fixed bundle price, percentage or flat amount off, a per-book price, buy X get Y free and tiered discounts. Pay once in INR (UPI, cards, net banking, wallets); every PDF is available instantly and emailed. Coupons can't be combined with bundles; purchases are final except double payments or genuine payment issues.`,
    ...bookLines(books),
    "",
    "## Memories: interactive greeting pages",
    `- [Memories](${SITE_URL}/memories): Make an interactive page for a birthday, proposal, anniversary, apology, thank you or Christmas, and share it as one link. Add a message, photos, videos and your own voice; the receiver opens it in any browser with no app or sign-up and can reply. Built for India: priced in INR, paid once with UPI, cards or netbanking (people abroad pay through Gumroad). Pages stay online for a limited time (30 days by default), can be public or locked with a PIN, and show the owner when and how they were opened. Six templates: birthday, proposal, anniversary, sorry, thank you, Christmas.`,
    `- [Birthday surprise page maker](${SITE_URL}/memories/birthday): A personalised birthday page for a partner, friend, parent or sibling, with balloons to pop, a cake to cut, gifts, a pinata, photos, video, voice and a wish they send back. Made in about 10 minutes, opened from a link with no app.`,
    `- [Live birthday page demo](${SITE_URL}/memories/preview/birthday): The real template with sample data.`,
    "",
    "## Resume Lab: resume and LinkedIn review",
    `- [Resume Lab](${SITE_URL}/resume-review): An online resume and LinkedIn review service for students, freshers and working professionals applying to technology jobs. An AI report (overall and ATS scores, section grades, missing keywords, rewritten bullets) arrives in minutes, then a working professional reviews the same resume and writes detailed feedback within the time shown on the chosen plan. Plans: single reviews, complete resume rewrites, and unlimited passes valid for a set number of days (for example 30 or 60). One-time payment in INR by UPI, card or netbanking, no subscription. Upload a PDF up to 10 MB. Resumes are private and never shared with recruiters. No guarantee of interviews or jobs is made.`,
    `- [Free ATS Score Checker](${SITE_URL}/resume-review/ats-score-checker): A free ATS resume checker and ATS score calculator with no sign-up. Paste resume text or upload a PDF (read on the visitor's device, never uploaded), optionally paste a job description, and get a score out of 100 with a grade (80+ strong, 65-79 good, 50-64 needs work, under 50 weak). Eight weighted checks: keywords from the job 30 (required skills flagged), standard sections 14, measurable results 14, contact details 10, action verbs 10, length 8, readable by software 8, clean language 6. Without a job description the keyword weight is spread over the other checks. The page also explains what an ATS score is, what a good ATS score is, how to improve it and the ATS-friendly resume format. It is an estimate, not any one employer's ATS number.`,
    `- Why am I not getting interview calls? Usual causes: missing job keywords so an ATS ranks the resume low, bullets that describe duties instead of results, an unclear target role, formatting that software cannot read (tables, columns, graphics), and one generic resume sent to every job. The Resume Lab page lists 12 common resume mistakes with before and after fixes, an ATS explanation and a free 10-point self-check.`,
    "",
    "## Referrals: ask employees for a job referral",
    `- [Referrals](${SITE_URL}/referral): A members-only way to get a job referral. Search a company, see members who work there with their role, headline and years of experience, send your resume, LinkedIn link and the job ID or link, and chat privately once they accept. Members who give referrals can hide their name. Searching and sending requests is free; the sender pays a small fee in INR to open a chat after a referrer accepts, or uses a chat credit. When they are on sale, an Unlimited monthly subscription (unlimited requests and free chats) and Priority (one-time passes of a few days, or monthly, that add a badge and list the member's requests first) are also available; subscriptions can be cancelled any time and stay active until they expire. All payments are non-refundable; duplicate charges are refunded on request to supporttargettrek@gmail.com. Members can also post "we are hiring" or "I can refer for these roles" on a job board. Referrers never pay. Target Trek does not guarantee a referral, interview or job.`,
    "",
    "## Prep Buddy Arena: find an interview preparation partner",
    `- [Prep Buddy Arena](${SITE_URL}/prep-buddy): A place to find a practice partner for tech interviews (system design, low-level design, DSA, frontend, backend, DevOps, SDET, GenAI and behavioural rounds). Members create an anonymous profile with topics, level, skills, job title, company, experience and availability, browse other members and send a request. A match happens only when both accept; then a private real-time chat opens for planning mock interviews. The page includes a free 4-week mock interview practice plan for two people and a comparison of a prep buddy with preparing alone and with paid one-to-one mock interviews. Real name, email, phone and LinkedIn stay hidden until matching and are shared only if the member switches them on. Emails, phone numbers and links are blocked in public fields. One-time entry fee in INR (UPI, cards, netbanking) that includes a set number of matches, used one at a time; no subscription. Every member verifies their email; members can block, report or end a partnership at any time.`,
    "",
    "## Mock interviews",
    `- [Mock interviews](${SITE_URL}/mock-interviews): Book one-to-one mock interviews for DSA, system design (HLD), low-level design (LLD) and Java rounds with working engineers, with written feedback.`,
    "",
    "## Sections",
    `- [Learn hub](${SITE_URL}/learn)`,
    `- [Free resources](${SITE_URL}/resources)`,
    `- [System design (HLD) guides](${SITE_URL}/resources/hld)`,
    `- [Caching](${SITE_URL}/resources/hld/cache)`,
    `- [Load balancing](${SITE_URL}/resources/hld/load-balancing)`,
    `- [Database design](${SITE_URL}/resources/hld/database)`,
    `- [Message queues](${SITE_URL}/resources/hld/message-queue)`,
    `- [Rate limiting](${SITE_URL}/resources/hld/rate-limiting)`,
    `- [API gateway](${SITE_URL}/resources/hld/api-gateway)`,
    `- [SQL complete guide](${SITE_URL}/resources/sql)`,
    `- [API design guide](${SITE_URL}/resources/apis)`,
    `- [All articles](${SITE_URL}/blogs)`,
    `- [RSS feed](${SITE_URL}/rss.xml)`,
    `- [Sitemap](${SITE_URL}/sitemap.xml)`,
    "",
  ];

  return send(res, 200, lines.join("\n"), {
    type: "text/plain; charset=utf-8",
    cache: partial
      ? "public, max-age=0, s-maxage=120"
      : "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  });
}
