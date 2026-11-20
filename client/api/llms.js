// GET /llms.txt – concise index for LLM/answer-engine crawlers.
import { SITE_URL, SITE_NAME, fetchAllPosts, fetchApi, truncate, send } from "./_lib.js";

export default async function handler(req, res) {
  let posts;
  try {
    posts = await fetchAllPosts();
  } catch {
    return send(res, 503, "Temporarily unavailable", {
      type: "text/plain; charset=utf-8",
      cache: "no-store",
    });
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
    "> Practical eBooks, interview preparation and engineering articles on System Design, Backend Engineering and GenAI.",
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
    `- [System Design HLD – 19 case studies](${SITE_URL}/book/system-design/hld)`,
    `- [Java LLD – 23 patterns, 16 case studies](${SITE_URL}/book/system-design/lld)`,
    `- [SQL & Database Interview Handbook – 26 chapters](${SITE_URL}/book/database/sql)`,
    `- [Google Cloud (GCP) Engineer's Handbook – 18 parts](${SITE_URL}/book/cloud/gcp)`,
    `- [AWS: The Complete Cloud Engineer's Handbook – 14 parts](${SITE_URL}/book/cloud/aws)`,
    `- [Docker Handbook + Docker Cheat Sheet – 2 PDFs in one purchase](${SITE_URL}/book/docker): Docker: The Complete Engineer's Handbook (177 pages, 25 chapters in 8 parts, 18 diagrams, command and concept index; every command and YAML file with output captured live on Docker Engine 29.10.0, Compose v5.7.1 and Buildx 0.39.0) plus the Docker Cheat Sheet (20 pages, 19 sections of command tables). Covers containers, Dockerfile, BuildKit/buildx/bake, volumes, networking, Docker Compose, Swarm, Compose to Kubernetes, security (Docker Scout, SBOM, rootless), CI/CD with GitHub Actions, Model Runner, MCP Toolkit, recipes and interview questions.`,
    `- [Git & GitHub Complete Guide + Git & GitHub Cheat Sheet – 2 PDFs in one purchase](${SITE_URL}/book/git): Git & GitHub: The Complete Guide (123 pages, 21 chapters, beginner to advanced; every command with real output and diagrams, most local Git outputs captured from a real Git session; table of contents and a command index of every git and gh command) plus the Git & GitHub Cheat Sheet (19 pages, 18 sections of command tables with small diagrams for merge, rebase, reset and PR flow). Covers Git internals, commits, history, reset/revert/reflog, branching, merging, rebasing, stash, cherry-pick, bisect, worktree, Git Flow, GitHub Flow, trunk-based development, remotes and force-with-lease, pull requests and code review, CODEOWNERS, merge queue, GitHub CLI (gh), signed commits, rulesets, Dependabot, CodeQL, GitHub Actions CI/CD with OIDC, Conventional Commits, Git LFS, partial clone, filter-repo, 25 interview questions and a 30-day plan.`,
    `- [HLD + LLD combo](${SITE_URL}/book/system-design/hld-lld/combo)`,
    `- [Java Interview Handbook](${SITE_URL}/book/java-interview-handbook)`,
    `- [Spring Boot Interview Handbook](${SITE_URL}/book/springboot-interview-handbook)`,
    `- [Google ADK Handbook](${SITE_URL}/book/genai/google-adk)`,
    `- [MCP Ebook](${SITE_URL}/book/genai/mcp)`,
    `- [RAG Ebook](${SITE_URL}/book/genai/rag)`,
    `- [Computer Networks Ebook](${SITE_URL}/book/computer-network)`,
    "",
    "## Memories: interactive greeting pages",
    `- [Memories](${SITE_URL}/memories): Make an interactive page for a birthday, proposal, anniversary, apology, thank you or Christmas, and share it as one link. Add a message, photos, videos and your own voice; the receiver opens it in any browser with no app or sign-up and can reply. Built for India: priced in INR, paid once with UPI, cards or netbanking (people abroad pay through Gumroad). Pages stay online for a limited time (30 days by default), can be public or locked with a PIN, and show the owner when and how they were opened. Six templates: birthday, proposal, anniversary, sorry, thank you, Christmas.`,
    `- [Birthday surprise page maker](${SITE_URL}/memories/birthday): A personalised birthday page for a partner, friend, parent or sibling, with balloons to pop, a cake to cut, gifts, a pinata, photos, video, voice and a wish they send back. Made in about 10 minutes, opened from a link with no app.`,
    `- [Live birthday page demo](${SITE_URL}/memories/preview/birthday): The real template with sample data.`,
    "",
    "## Resume Lab: resume and LinkedIn review",
    `- [Resume Lab](${SITE_URL}/resume-review): An online resume and LinkedIn review service for students, freshers and working professionals applying to technology jobs. An AI report (overall and ATS scores, section grades, missing keywords, rewritten bullets) arrives in minutes, then a working professional reviews the same resume and writes detailed feedback within the time shown on the chosen plan. Plans: single reviews, complete resume rewrites, and unlimited passes valid for a set number of days (for example 30 or 60). One-time payment in INR by UPI, card or netbanking, no subscription. Upload a PDF up to 10 MB. Resumes are private and never shared with recruiters. No guarantee of interviews or jobs is made.`,
    `- Why am I not getting interview calls? Usual causes: missing job keywords so an ATS ranks the resume low, bullets that describe duties instead of results, an unclear target role, formatting that software cannot read (tables, columns, graphics), and one generic resume sent to every job. The Resume Lab page lists 12 common resume mistakes with before and after fixes, an ATS explanation and a free 10-point self-check.`,
    "",
    "## Referrals: ask employees for a job referral",
    `- [Referrals](${SITE_URL}/referral): A members-only way to get a job referral. Search a company, see members who work there with their role, headline and years of experience, send your resume, LinkedIn link and the job ID or link, and chat privately once they accept. Members who give referrals can hide their name. Searching and sending requests is free; the sender pays a small fee in INR to open a chat after a referrer accepts, or uses a chat credit. When they are on sale, an Unlimited monthly subscription (unlimited requests and free chats) and Priority (one-time passes of a few days, or monthly, that add a badge and list the member's requests first) are also available; subscriptions can be cancelled any time and stay active until they expire. All payments are non-refundable; duplicate charges are refunded on request to supporttargettrek@gmail.com. Members can also post "we are hiring" or "I can refer for these roles" on a job board. Referrers never pay. Target Trek does not guarantee a referral, interview or job.`,
    "",
    "## Prep Buddy Arena: find an interview preparation partner",
    `- [Prep Buddy Arena](${SITE_URL}/prep-buddy): A place to find a practice partner for tech interviews (system design, low-level design, DSA, frontend, backend, DevOps, SDET, GenAI and behavioural rounds). Members create an anonymous profile with topics, level, skills, job title, company, experience and availability, browse other members and send a request. A match happens only when both accept; then a private real-time chat opens for planning mock interviews. Real name, email, phone and LinkedIn stay hidden until matching and are shared only if the member switches them on. Emails, phone numbers and links are blocked in public fields. One-time entry fee in INR (UPI, cards, netbanking) that includes a set number of matches, used one at a time; no subscription. Every member verifies their email; members can block, report or end a partnership at any time.`,
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
    cache: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  });
}
