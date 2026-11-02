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
    `- [System Design HLD – 19 case studies](${SITE_URL}/book/system-design/hld)`,
    `- [Java LLD – 23 patterns, 16 case studies](${SITE_URL}/book/system-design/lld)`,
    `- [HLD + LLD combo](${SITE_URL}/book/system-design/hld-lld/combo)`,
    `- [Java Interview Handbook](${SITE_URL}/book/java-interview-handbook)`,
    `- [Spring Boot Interview Handbook](${SITE_URL}/book/springboot-interview-handbook)`,
    `- [Google ADK Handbook](${SITE_URL}/book/genai/google-adk)`,
    `- [MCP Ebook](${SITE_URL}/book/genai/mcp)`,
    `- [RAG Ebook](${SITE_URL}/book/genai/rag)`,
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
