// GET /rss.xml
import { SITE_URL, SITE_NAME, fetchAllPosts, stripHtml, send, absoluteUrl } from "./_lib.js";

const x = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export default async function handler(req, res) {
  let posts;
  try {
    posts = (await fetchAllPosts()).filter((p) => !p.seo?.noIndex).slice(0, 50);
  } catch {
    return send(res, 503, "Feed temporarily unavailable", {
      type: "text/plain; charset=utf-8",
      cache: "no-store",
    });
  }

  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/blog/${p.slug}`;
      const date = new Date(p.publishedAt || p.createdAt).toUTCString();
      return `<item>
<title>${x(p.title)}</title>
<link>${x(url)}</link>
<guid isPermaLink="true">${x(url)}</guid>
<pubDate>${date}</pubDate>
<dc:creator>${x(p.author)}</dc:creator>
<category>${x(p.category)}</category>
<description>${x(stripHtml(p.excerpt))}</description>${
        p.imageUrl ? `\n<enclosure url="${x(absoluteUrl(p.imageUrl))}" type="image/jpeg" length="0" />` : ""
      }
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
<title>${x(SITE_NAME)} Blog</title>
<link>${SITE_URL}/blogs</link>
<description>Software engineering, system design, backend and GenAI articles from ${x(SITE_NAME)}.</description>
<language>en</language>
<atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
</channel>
</rss>`;

  return send(res, 200, xml, {
    type: "application/rss+xml; charset=utf-8",
    cache: "public, max-age=0, s-maxage=1800, stale-while-revalidate=86400",
  });
}
