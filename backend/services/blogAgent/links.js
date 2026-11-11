import { FRONTEND_URL } from "../../config/urls.js";
/*
|--------------------------------------------------------------------------
| LINK CATALOG
|--------------------------------------------------------------------------
|
| The agent may only link to pages that really exist:
|
|   - published blog posts
|   - active books
|   - fixed resource / product pages
|
| Anything else is stripped from the generated HTML (see content.js).
|
*/

import BlogPost from "../../models/Blog.js";
import Book from "../../models/Book.js";

export const SITE_URL =
  process.env.PUBLIC_SITE_URL ||
  FRONTEND_URL;

const STATIC_PAGES = [
  ["All books", "/books"],
  ["Free learning resources", "/resources"],
  ["System design (HLD) resources", "/resources/hld"],
  ["Caching in system design", "/resources/hld/cache"],
  ["Load balancing", "/resources/hld/load-balancing"],
  ["Database design", "/resources/hld/database"],
  ["Message queues", "/resources/hld/message-queue"],
  ["Rate limiting", "/resources/hld/rate-limiting"],
  ["API gateway", "/resources/hld/api-gateway"],
  ["SQL complete guide", "/resources/sql"],
  ["API design guide", "/resources/apis"],
  ["Interview experiences", "/interviews"],
  ["Mock interviews", "/mock-interviews"],
  ["All blog articles", "/blogs"],
];

export async function buildLinkCatalog() {
  const [posts, books] =
    await Promise.all([
      BlogPost.find({
        isPublished: true,
        isDeleted: false,
      })
        .sort({ publishedAt: -1 })
        .limit(60)
        .select("title slug category")
        .lean(),

      Book.find({ isActive: true })
        .limit(30)
        .select("title redirectUrl")
        .lean()
        .catch(() => []),
    ]);

  const items = [
    ...STATIC_PAGES.map(
      ([title, path]) => ({
        title,
        path,
        kind: "page",
      })
    ),

    ...books
      .filter((b) => b.redirectUrl)
      .map((b) => ({
        title: b.title,
        path: b.redirectUrl,
        kind: "book",
      })),

    ...posts.map((p) => ({
      title: p.title,
      path: `/blog/${p.slug}`,
      kind: "blog",
      category: p.category,
    })),
  ];

  return {
    items,

    internalPaths: new Set(
      items.map((i) => i.path)
    ),

    existingTitles: posts.map(
      (p) => p.title
    ),
  };
}

export async function recentTitles(
  limit = 80
) {
  const posts = await BlogPost.find({
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("title")
    .lean();

  return posts.map((p) => p.title);
}

/*
 * Compact text for prompts.
 */
export const catalogForPrompt = (
  catalog,
  max = 70
) =>
  catalog.items
    .slice(0, max)
    .map(
      (i) =>
        `- ${i.title} -> ${SITE_URL}${i.path}`
    )
    .join("\n");
