/*
|--------------------------------------------------------------------------
| BLOG AGENT – ADMIN ENDPOINTS
|--------------------------------------------------------------------------
|
| POST   /blogs/admin/agent/stream   live generation (Server-Sent Events)
| POST   /blogs/admin/agent/save     save the (edited) draft
| DELETE /blogs/admin/agent/cover    discard an unused generated cover
|
*/

import { z } from "zod";

import BlogPost from "../models/Blog.js";
import redis from "../utils/redis.js";

import {
  sanitizeBlogHtml,
  sanitizePlainText,
  normalizeSlug,
  parseArrayField,
  isValidHttpUrl,
} from "./Blog.js";

import {
  produceDraft,
  saveDraft,
  discardCover,
  COVER_FOLDER,
} from "../services/blogAgent/pipeline.js";

import {
  isOpenAIConfigured,
  modelFor,
} from "../services/blogAgent/openai.js";

import { CATEGORIES } from "../services/blogAgent/prompts.js";

/* ------------------------------------------------------------------ */

const HOURLY_LIMIT = Number(
  process.env.BLOG_AGENT_HOURLY_LIMIT ||
    12
);

const actorId = (req) =>
  String(
    req.user?._id ||
      req.user?.id ||
      req.user?.email ||
      "admin"
  );

async function underRateLimit(req) {
  try {
    const key = `blogagent:rl:${actorId(
      req
    )}:${new Date()
      .toISOString()
      .slice(0, 13)}`;

    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, 3700);
    }

    return count <= HOURLY_LIMIT;
  } catch {
    /* Redis problems must not block the admin. */
    return true;
  }
}

const streamSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(
      10,
      "Describe the topic in at least 10 characters."
    )
    .max(4000),

  category: z
    .string()
    .trim()
    .toLowerCase()
    .max(80)
    .optional()
    .default(""),

  length: z
    .enum(["short", "medium", "long"])
    .default("medium"),

  audience: z
    .string()
    .trim()
    .max(200)
    .optional()
    .default(""),

  tone: z
    .string()
    .trim()
    .max(100)
    .optional()
    .default(""),

  research: z.boolean().default(true),
  factCheck: z.boolean().default(true),
  cover: z.boolean().default(true),
});

/* ------------------------------------------------------------------ */
/* STREAM                                                              */
/* ------------------------------------------------------------------ */

export const streamBlogAgent = async (
  req,
  res
) => {
  if (!isOpenAIConfigured()) {
    return res.status(503).json({
      success: false,

      error: {
        message:
          "OPENAI_API_KEY is not configured on the server.",
      },
    });
  }

  const parsed = streamSchema.safeParse(
    req.body || {}
  );

  if (!parsed.success) {
    return res.status(400).json({
      success: false,

      error: {
        message:
          parsed.error.issues[0]
            ?.message ||
          "Invalid request.",
      },
    });
  }

  if (!(await underRateLimit(req))) {
    return res.status(429).json({
      success: false,

      error: {
        message: `Limit reached: ${HOURLY_LIMIT} generations per hour.`,
      },
    });
  }

  const input = parsed.data;

  /* ---------------- SSE setup ---------------- */

  res.status(200);

  res.set({
    "Content-Type":
      "text/event-stream; charset=utf-8",

    "Cache-Control":
      "no-cache, no-transform",

    Connection: "keep-alive",

    /* stop proxies buffering the stream */
    "X-Accel-Buffering": "no",
  });

  res.flushHeaders?.();

  const send = (event, data) => {
    if (res.writableEnded) {
      return;
    }

    res.write(
      `event: ${event}\ndata: ${JSON.stringify(
        data
      )}\n\n`
    );

    res.flush?.();
  };

  const controller =
    new AbortController();

  let finished = false;

  res.on("close", () => {
    if (!finished) {
      /* Admin pressed Stop or closed the tab: stop paying for tokens. */
      controller.abort(
        new Error("Client disconnected")
      );
    }
  });

  const heartbeat = setInterval(() => {
    if (!res.writableEnded) {
      res.write(": ping\n\n");
      res.flush?.();
    }
  }, 15_000);

  try {
    send("start", {
      model: modelFor("writer"),
    });

    const draft = await produceDraft({
      brief: input.prompt,
      category: CATEGORIES.includes(
        input.category
      )
        ? input.category
        : "",

      length: input.length,
      audience: input.audience,
      tone: input.tone,
      research: input.research,
      factCheck: input.factCheck,
      cover: input.cover,

      signal: controller.signal,
      emit: send,
      stream: true,
    });

    send("draft", draft);
    send("done", { ok: true });
  } catch (error) {
    if (!controller.signal.aborted) {
      console.error(
        "[blog-agent] stream failed:",
        error
      );

      send("error", {
        message:
          error.message ||
          "Generation failed.",
      });
    }
  } finally {
    finished = true;
    clearInterval(heartbeat);
    res.end();
  }
};

/* ------------------------------------------------------------------ */
/* SAVE                                                                */
/* ------------------------------------------------------------------ */

const saveSchema = z.object({
  title: z.string().trim().min(5).max(180),

  slug: z
    .string()
    .trim()
    .min(3)
    .max(180)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers and hyphens only."
    ),

  excerpt: z.string().trim().min(10).max(500),
  content: z.string().min(1),
  author: z.string().trim().min(2).max(100),
  category: z.string().trim().min(2).max(80),

  tags: z.union([
    z.array(z.string()),
    z.string(),
  ]),

  altText: z.string().trim().max(200).optional().default(""),

  imageUrl: z.string().trim().optional().default(""),

  cloudinaryPublicId: z
    .string()
    .trim()
    .optional()
    .default(""),

  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  editorChoice: z.boolean().default(false),

  seo: z
    .object({
      metaTitle: z.string().max(70).optional().default(""),
      metaDescription: z.string().max(180).optional().default(""),
      keywords: z.union([z.array(z.string()), z.string()]).optional().default([]),
      canonicalUrl: z.string().trim().optional().default(""),
      ogImageUrl: z.string().trim().optional().default(""),
      noIndex: z.boolean().optional().default(false),
    })
    .default({}),

  sources: z
    .array(
      z.object({
        title: z.string().max(200).optional().default(""),
        url: z.string(),
      })
    )
    .optional()
    .default([]),
});

export const saveAgentBlog = async (
  req,
  res
) => {
  const parsed = saveSchema.safeParse(
    req.body || {}
  );

  if (!parsed.success) {
    const issue = parsed.error.issues[0];

    return res.status(400).json({
      success: false,

      error: {
        message: `${issue.path.join(
          "."
        )}: ${issue.message}`,
      },
    });
  }

  const d = parsed.data;

  const tags = parseArrayField(d.tags);

  if (!tags.length || tags.length > 15) {
    return res.status(400).json({
      success: false,

      error: {
        message:
          "Provide between 1 and 15 tags.",
      },
    });
  }

  /* Same sanitiser as the Add Blog endpoint. */
  const content = sanitizeBlogHtml(
    d.content
  );

  if (
    sanitizePlainText(content).length <
    20
  ) {
    return res.status(400).json({
      success: false,

      error: {
        message: "Blog content is too short.",
      },
    });
  }

  for (const [label, value] of [
    ["image URL", d.imageUrl],
    ["canonical URL", d.seo.canonicalUrl],
    ["OG image URL", d.seo.ogImageUrl],
  ]) {
    if (value && !isValidHttpUrl(value)) {
      return res.status(400).json({
        success: false,

        error: {
          message: `Invalid ${label}.`,
        },
      });
    }
  }

  if (!d.imageUrl) {
    return res.status(400).json({
      success: false,

      error: {
        message:
          "A cover image is required. Generate one or paste an image URL.",
      },
    });
  }

  if (
    await BlogPost.exists({
      slug: normalizeSlug(d.slug),
    })
  ) {
    return res.status(409).json({
      success: false,

      error: {
        message:
          "Slug already exists. Please choose another slug.",
      },
    });
  }

  /* Only trust a Cloudinary id that really is one of our agent covers. */
  const publicId =
    d.cloudinaryPublicId.startsWith(
      `${COVER_FOLDER}/`
    )
      ? d.cloudinaryPublicId
      : "";

  const saved = await saveDraft(
    {
      title: sanitizePlainText(d.title),
      slug: normalizeSlug(d.slug),
      excerpt: sanitizePlainText(d.excerpt),
      content,
      author: sanitizePlainText(d.author),
      category: sanitizePlainText(d.category).toLowerCase(),
      tags,
      altText: sanitizePlainText(d.altText),
      imageUrl: d.imageUrl,
      cloudinaryPublicId: publicId,

      seo: {
        metaTitle: sanitizePlainText(d.seo.metaTitle).slice(0, 70),
        metaDescription: sanitizePlainText(d.seo.metaDescription).slice(0, 180),
        keywords: parseArrayField(d.seo.keywords),
        canonicalUrl: d.seo.canonicalUrl,
        ogImageUrl: d.seo.ogImageUrl,
        noIndex: d.seo.noIndex,
      },

      sources: d.sources
        .filter((s) => isValidHttpUrl(s.url))
        .slice(0, 15),
    },
    {
      isPublished: d.isPublished,
      isFeatured: d.isFeatured,
      editorChoice: d.editorChoice,
      generatedBy: "ai-writer",
    }
  );

  return res.status(201).json({
    success: true,

    message: d.isPublished
      ? "Blog published successfully."
      : "Draft saved successfully.",

    data: saved,
  });
};

/* ------------------------------------------------------------------ */
/* DISCARD COVER                                                       */
/* ------------------------------------------------------------------ */

export const discardAgentCover = async (
  req,
  res
) => {
  try {
    const removed = await discardCover(
      String(req.body?.publicId || "")
    );

    return res.status(200).json({
      success: true,
      removed,
    });
  } catch (error) {
    console.error(
      "[blog-agent] discard cover failed:",
      error
    );

    return res.status(200).json({
      success: true,
      removed: false,
    });
  }
};
