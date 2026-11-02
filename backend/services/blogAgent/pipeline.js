/*
|--------------------------------------------------------------------------
| BLOG AGENT PIPELINE
|--------------------------------------------------------------------------
|
|  produceDraft()   brief -> research -> write (streaming) -> fact-check
|                   -> polish (links / Quill-safe HTML) -> cover image
|                   Used by BOTH the live admin page and the daily job.
|
|  saveDraft()      stores the result as a blog post
|  runDaily()       research today's news, plan N topics, produceDraft each
|
*/

import fs from "fs/promises";
import os from "os";
import path from "path";

import BlogPost from "../../models/Blog.js";

import uploadFile, {
  deleteFile,
} from "../../utils/cloudinary.js";

import {
  parseArrayField,
  sanitizePlainText,
  normalizeSlug,
  isValidHttpUrl,
} from "../../controllers/Blog.js";

import {
  callModel,
  generateImage,
} from "./openai.js";

import {
  buildLinkCatalog,
  recentTitles,
  SITE_URL,
} from "./links.js";

import {
  processContent,
  normalizeUrl,
  cleanUrl,
  plainTextOf,
  wordCountOf,
  countLinks,
} from "./content.js";

import {
  CATEGORIES,
  LENGTH_MIN,
  OUTLINE_SYSTEM,
  outlineUser,
  expandUser,
  RESEARCH_SYSTEM,
  researchUser,
  WRITER_SYSTEM,
  writerUser,
  CHECKER_SYSTEM,
  checkerUser,
  DAILY_RESEARCH_USER,
  PLANNER_SYSTEM,
  plannerUser,
} from "./prompts.js";

export const COVER_FOLDER =
  "targettrek/blog-agent";

/* ------------------------------------------------------------------ */
/* Parsing helpers                                                     */
/* ------------------------------------------------------------------ */

export function parseJson(text) {
  const t = String(text)
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(t);
  } catch {
    const starts = ["{", "["]
      .map((c) => t.indexOf(c))
      .filter((i) => i !== -1);

    const first = Math.min(...starts);

    const last = Math.max(
      t.lastIndexOf("}"),
      t.lastIndexOf("]")
    );

    if (
      !starts.length ||
      last < first
    ) {
      throw new Error(
        "Model did not return JSON."
      );
    }

    return JSON.parse(
      t.slice(first, last + 1)
    );
  }
}

/*
 * Splits the writer's marked output while it streams:
 *   ===META=== json ===CONTENT=== html ===SOURCES=== json ===END===
 * Emits meta once, and content deltas as they arrive.
 */
class StreamSplitter {
  constructor({ onMeta, onContent }) {
    this.onMeta = onMeta;
    this.onContent = onContent;
    this.buf = "";
    this.state = "pre";
    this.started = false;
  }

  push(delta) {
    this.buf += delta;
    this.drain(false);
  }

  end() {
    this.drain(true);
  }

  emitContent(text) {
    let out = text;

    if (!this.started) {
      out = out.replace(/^\s+/, "");

      if (!out) {
        return;
      }

      this.started = true;
    }

    if (out) {
      this.onContent(out);
    }
  }

  drain(final) {
    for (;;) {
      if (this.state === "pre") {
        const i =
          this.buf.indexOf(
            "===META==="
          );

        if (i === -1) {
          this.buf = final
            ? ""
            : this.buf.slice(-12);

          return;
        }

        this.buf = this.buf.slice(
          i + "===META===".length
        );

        this.state = "meta";
        continue;
      }

      if (this.state === "meta") {
        const i =
          this.buf.indexOf(
            "===CONTENT==="
          );

        if (i === -1) {
          return;
        }

        try {
          this.onMeta(
            parseJson(
              this.buf.slice(0, i)
            )
          );
        } catch {
          /* parsed again from the full text */
        }

        this.buf = this.buf.slice(
          i + "===CONTENT===".length
        );

        this.state = "content";
        continue;
      }

      if (this.state === "content") {
        const markers = [
          "===SOURCES===",
          "===END===",
        ]
          .map((m) =>
            this.buf.indexOf(m)
          )
          .filter((i) => i !== -1);

        if (markers.length) {
          this.emitContent(
            this.buf.slice(
              0,
              Math.min(...markers)
            )
          );

          this.buf = "";
          this.state = "tail";
          return;
        }

        if (final) {
          this.emitContent(this.buf);
          this.buf = "";
          return;
        }

        /* keep a tail so a split marker is never emitted */
        const safe =
          this.buf.length - 14;

        if (safe > 0) {
          this.emitContent(
            this.buf.slice(0, safe)
          );

          this.buf =
            this.buf.slice(safe);
        }

        return;
      }

      return;
    }
  }
}

const section = (
  text,
  start,
  ends
) => {
  const i = text.indexOf(start);

  if (i === -1) {
    return null;
  }

  const from = i + start.length;

  const stops = ends
    .map((e) => text.indexOf(e, from))
    .filter((j) => j !== -1);

  return text
    .slice(
      from,
      stops.length
        ? Math.min(...stops)
        : text.length
    )
    .trim();
};

function parseWriterOutput(text) {
  const metaRaw = section(
    text,
    "===META===",
    ["===CONTENT==="]
  );

  const content = section(
    text,
    "===CONTENT===",
    ["===SOURCES===", "===END==="]
  );

  const sourcesRaw = section(
    text,
    "===SOURCES===",
    ["===END==="]
  );

  if (!metaRaw || !content) {
    throw new Error(
      "The writer returned an unexpected format."
    );
  }

  let sources = [];

  try {
    sources = sourcesRaw
      ? parseJson(sourcesRaw)
      : [];
  } catch {
    sources = [];
  }

  return {
    meta: parseJson(metaRaw),
    content,
    sources: Array.isArray(sources)
      ? sources
      : [],
  };
}

/*
 * Applies the fact-checker's JSON edits to the article HTML. The checker never
 * rewrites prose (search-tool output would leak citations into the text); it
 * only proposes exact find/replace corrections.
 */
export function applyEdits(html, edits = []) {
  let out = html;
  let applied = 0;
  const skipped = [];

  for (const edit of Array.isArray(edits)
    ? edits.slice(0, 12)
    : []) {
    const find = String(edit?.find || "");

    if (find.length < 4) {
      continue;
    }

    /* plain text only – no markdown / links / HTML from the checker */
    const replace = String(
      edit?.replace ?? ""
    )
      .replace(
        /\s*\(\s*\[[^\]]+\]\([^)]*\)\s*\)/g,
        ""
      )
      .replace(/<[^>]*>/g, "")
      .replace(
        /\[([^\]]+)\]\([^)]*\)/g,
        "$1"
      )
      .trim();

    const index = out.indexOf(find);

    if (
      index === -1 ||
      out.indexOf(find, index + 1) !== -1
    ) {
      skipped.push(
        String(edit?.reason || find)
          .slice(0, 120)
      );

      continue;
    }

    out =
      out.slice(0, index) +
      replace +
      out.slice(index + find.length);

    applied += 1;
  }

  return { html: out, applied, skipped };
}

/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */

const urlsFrom = (list = []) =>
  list
    .map((x) =>
      typeof x === "string"
        ? x
        : x?.url ||
          x?.source_url
    )
    .filter(Boolean);

async function researchStep({
  brief,
  seedSources = [],
  signal,
  emit,
}) {
  const { text, citations } =
    await callModel({
      stage: "research",
      system: RESEARCH_SYSTEM,

      user:
        researchUser({ brief }) +
        (seedSources.length
          ? `\n\nStart from these sources (open them, then look for more):\n${urlsFrom(
              seedSources
            )
              .map((u) => `- ${u}`)
              .join("\n")}`
          : ""),

      search: true,
      maxTokens: 6000,
      signal,

      onSearch: (query) =>
        emit("search", { query }),
    });

  let research;

  try {
    research = parseJson(text);
  } catch {
    research = {
      summary: text.slice(0, 1500),
      facts: [],
      angles: [],
    };
  }

  const external = new Set();

  for (const u of [
    ...urlsFrom(research.facts),
    ...urlsFrom(seedSources),
    ...urlsFrom(citations),
  ]) {
    const n = normalizeUrl(u);

    if (n) {
      external.add(n);
    }
  }

  return { research, external };
}

/* ------------------------------------------------------------------ */

async function ensureUniqueSlug(
  base
) {
  const root =
    normalizeSlug(base).slice(
      0,
      150
    ) || "post";

  let slug = root;
  let n = 2;

  while (
    await BlogPost.exists({ slug })
  ) {
    slug = `${root}-${n++}`;
  }

  return slug;
}

export async function makeCover({
  title,
  coverPrompt,
  signal,
}) {
  const prompt = `Editorial cover illustration for a software engineering blog article titled "${title}". ${
    coverPrompt || ""
  } Style: clean modern flat vector illustration, abstract technology motifs (servers, data flows, code, graphs), warm orange (#EA580C) accents on a dark navy background, balanced composition, wide 3:2 format. No text, no letters, no logos, no watermarks, no people's faces.`;

  const buffer =
    await generateImage({
      prompt,
      signal,
    });

  const file = path.join(
    os.tmpdir(),
    `blog-cover-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.png`
  );

  await fs.writeFile(file, buffer);

  try {
    const result = await uploadFile(
      file,
      {
        folder: COVER_FOLDER,
        resource_type: "image",
      }
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } finally {
    await fs
      .unlink(file)
      .catch(() => {});
  }
}

export async function discardCover(
  publicId
) {
  if (
    !publicId ||
    !String(publicId).startsWith(
      `${COVER_FOLDER}/`
    )
  ) {
    return false;
  }

  await deleteFile(publicId);

  return true;
}

/* ------------------------------------------------------------------ */
/* Finalise                                                            */
/* ------------------------------------------------------------------ */

async function finalizeDraft(
  { meta, content, sources },
  { catalog, external, category }
) {
  const title = sanitizePlainText(
    meta.title || ""
  ).slice(0, 180);

  if (title.length < 5) {
    throw new Error(
      "The generated title is too short."
    );
  }

  const html = processContent(
    content,
    {
      internalPaths:
        catalog.internalPaths,

      allowedExternal: external,
    }
  );

  if (
    plainTextOf(html).length < 200
  ) {
    throw new Error(
      "The generated article is too short."
    );
  }

  const excerpt =
    sanitizePlainText(
      meta.excerpt || ""
    ).slice(0, 500) ||
    plainTextOf(html).slice(0, 180);

  const cat = String(
    category ||
      meta.category ||
      "tech news"
  )
    .toLowerCase()
    .trim();

  return {
    title,

    slug: await ensureUniqueSlug(
      meta.slug || title
    ),

    excerpt,
    content: html,
    author: "Target Trek Editorial",

    category: CATEGORIES.includes(cat)
      ? cat
      : "tech news",

    tags: parseArrayField(
      meta.tags
    ).slice(0, 15),

    altText: sanitizePlainText(
      meta.altText || title
    ).slice(0, 200),

    seo: {
      metaTitle: sanitizePlainText(
        meta.metaTitle || title
      ).slice(0, 70),

      metaDescription:
        sanitizePlainText(
          meta.metaDescription ||
            excerpt
        ).slice(0, 180),

      keywords: parseArrayField(
        meta.keywords
      ).slice(0, 10),

      canonicalUrl: "",
      ogImageUrl: "",
      noIndex: false,
    },

    sources: (sources || [])
      .map((s) => ({
        title: sanitizePlainText(
          s?.title || ""
        ).slice(0, 200),

        url: cleanUrl(s?.url || ""),
      }))
      .filter(
        (s) =>
          isValidHttpUrl(s.url) &&
          external.has(
            normalizeUrl(s.url)
          )
      )
      .slice(0, 15),

    coverPrompt: sanitizePlainText(
      meta.coverPrompt || ""
    ).slice(0, 300),

    imageUrl: "",
    cloudinaryPublicId: "",

    stats: {
      words: wordCountOf(html),
      ...Object.fromEntries(
        Object.entries(
          countLinks(html)
        ).map(([k, v]) => [
          `${k}Links`,
          v.length,
        ])
      ),
    },
  };
}

/* ------------------------------------------------------------------ */
/* produceDraft                                                        */
/* ------------------------------------------------------------------ */

export async function produceDraft({
  brief,
  category = "",
  length = "medium",
  audience = "",
  tone = "",
  research: doResearch = true,
  factCheck = true,
  cover = true,
  seedSources = [],
  catalog: givenCatalog,
  signal,
  emit = () => {},
  stream = false,
}) {
  const status = (
    step,
    state,
    message = ""
  ) =>
    emit("status", {
      step,
      state,
      message,
    });

  /* ---- context ---- */

  status(
    "context",
    "start",
    "Loading your site's pages for internal links"
  );

  const catalog =
    givenCatalog ||
    (await buildLinkCatalog());

  status(
    "context",
    "done",
    `${catalog.items.length} linkable pages`
  );

  /* ---- research ---- */

  let research = null;
  let external = new Set();

  if (doResearch) {
    status(
      "research",
      "start",
      "Searching the web for current, verifiable facts"
    );

    const r = await researchStep({
      brief,
      seedSources,
      signal,
      emit,
    });

    research = r.research;
    external = r.external;

    status(
      "research",
      "done",
      `${(research.facts || []).length} facts, ${external.size} sources`
    );
  } else {
    for (const u of urlsFrom(
      seedSources
    )) {
      const n = normalizeUrl(u);

      if (n) {
        external.add(n);
      }
    }

    status(
      "research",
      "skip",
      "Web research is off"
    );
  }

  /* ---- outline ---- */

  let outline = null;

  status(
    "outline",
    "start",
    "Planning the sections in depth"
  );

  try {
    const planned = await callModel({
      stage: "planner",
      system: OUTLINE_SYSTEM,

      user: outlineUser({
        brief,
        research,
        category,
        audience,
        length,
      }),

      maxTokens: 3500,
      signal,
    });

    outline = parseJson(planned.text);

    status(
      "outline",
      "done",
      `${(outline.sections || []).length} sections planned`
    );
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    status(
      "outline",
      "skip",
      "Outline unavailable – writing directly"
    );
  }

  /* ---- write ---- */

  status(
    "write",
    "start",
    "Writing the article"
  );

  const splitter = stream
    ? new StreamSplitter({
        onMeta: (meta) =>
          emit("meta", meta),

        onContent: (text) =>
          emit("delta", { text }),
      })
    : null;

  const written = await callModel({
    stage: "writer",
    system: WRITER_SYSTEM,

    user: writerUser({
      brief,
      research,
      outline,
      catalog,
      externalUrls: [...external],
      length,
      audience,
      tone,
      category,
    }),

    maxTokens:
      length === "long"
        ? 16000
        : length === "short"
          ? 8000
          : 12000,

    signal,

    ...(stream
      ? {
          onText: (d) =>
            splitter.push(d),
        }
      : {}),
  });

  splitter?.end();

  let parsed = parseWriterOutput(
    written.text
  );

  status("write", "done", "");

  const warnings = [];

  /* ---- expand when too thin ---- */

  const minWords =
    LENGTH_MIN[length] ||
    LENGTH_MIN.medium;

  const wordsNow = wordCountOf(
    parsed.content
  );

  if (wordsNow < minWords * 0.7) {
    status(
      "expand",
      "start",
      `Draft is ${wordsNow} words – expanding to at least ${minWords}`
    );

    try {
      const expanded = await callModel({
        stage: "writer",
        system: WRITER_SYSTEM,

        user: expandUser({
          meta: parsed.meta,
          content: parsed.content,
          outline,
          research,
          catalog,
          externalUrls: [...external],
          minWords,
          words: wordsNow,
        }),

        maxTokens:
          length === "long"
            ? 16000
            : 12000,

        signal,
      });

      const body = section(
        expanded.text,
        "===CONTENT===",
        ["===END==="]
      );

      if (
        body &&
        wordCountOf(body) > wordsNow
      ) {
        parsed = {
          ...parsed,
          content: body,
        };
      }

      status(
        "expand",
        "done",
        `${wordCountOf(parsed.content)} words`
      );
    } catch (error) {
      if (signal?.aborted) {
        throw error;
      }

      status(
        "expand",
        "error",
        error.message
      );
    }
  }

  /* ---- fact-check (edits only) ---- */

  if (factCheck && doResearch) {
    status(
      "review",
      "start",
      "Fact-checking every claim against sources"
    );

    try {
      const checked = await callModel(
        {
          stage: "checker",
          system: CHECKER_SYSTEM,

          user: checkerUser({
            meta: parsed.meta,
            content: parsed.content,
          }),

          search: true,
          maxTokens: 4000,
          signal,

          onSearch: (query) =>
            emit("search", {
              query,
            }),
        }
      );

      const review = parseJson(
        checked.text
      );

      const result = applyEdits(
        parsed.content,
        review.edits
      );

      parsed = {
        ...parsed,
        content: result.html,
      };

      for (const issue of review.issues ||
        []) {
        warnings.push(
          String(issue)
        );
      }

      for (const note of result.skipped) {
        warnings.push(
          `Could not auto-apply a fact-check correction – check manually: ${note}`
        );
      }

      if (review.pass === false) {
        warnings.unshift(
          "The fact-checker could not fully verify the main claim. Read this draft carefully before publishing."
        );
      }

      status(
        "review",
        "done",
        review.pass === false
          ? "Flagged"
          : `${result.applied} correction${
              result.applied === 1
                ? ""
                : "s"
            } applied`
      );
    } catch (error) {
      if (signal?.aborted) {
        throw error;
      }

      warnings.push(
        `Fact-check step failed (${error.message}). Review manually.`
      );

      status(
        "review",
        "error",
        error.message
      );
    }
  } else {
    status(
      "review",
      "skip",
      "Fact-check is off"
    );
  }

  /* ---- polish ---- */

  status(
    "polish",
    "start",
    "Validating links and formatting for the editor"
  );

  const draft = await finalizeDraft(
    parsed,
    {
      catalog,
      external,
      category,
    }
  );

  if (draft.stats.words < minWords * 0.7) {
    warnings.push(
      `The article is shorter than requested (${draft.stats.words} words). Consider generating again or expanding it in the editor.`
    );
  }

  status(
    "polish",
    "done",
    `${draft.stats.words} words · ${draft.stats.internalLinks} internal / ${draft.stats.externalLinks} external links`
  );

  /* ---- cover ---- */

  if (cover) {
    status(
      "cover",
      "start",
      "Generating a cover image"
    );

    try {
      const image = await makeCover({
        title: draft.title,
        coverPrompt:
          draft.coverPrompt,
        signal,
      });

      draft.imageUrl = image.url;

      draft.cloudinaryPublicId =
        image.publicId;

      draft.seo.ogImageUrl =
        image.url;

      status("cover", "done", "");
    } catch (error) {
      if (signal?.aborted) {
        throw error;
      }

      warnings.push(
        `Cover image could not be generated (${error.message}). Add one manually.`
      );

      status(
        "cover",
        "error",
        error.message
      );
    }
  } else {
    status(
      "cover",
      "skip",
      "Cover image is off"
    );
  }

  draft.warnings = warnings;

  return draft;
}

/* ------------------------------------------------------------------ */
/* Save                                                                */
/* ------------------------------------------------------------------ */

export async function saveDraft(
  draft,
  {
    isPublished = false,
    isFeatured = false,
    editorChoice = false,
    generatedBy = "ai-writer",
  } = {}
) {
  const post = new BlogPost({
    title: draft.title,
    slug: draft.slug,
    excerpt: draft.excerpt,
    content: draft.content,
    author: draft.author,
    category: draft.category,
    tags: draft.tags,
    altText: draft.altText,
    imageUrl: draft.imageUrl,

    cloudinaryPublicId:
      draft.cloudinaryPublicId || "",

    seo: draft.seo,
    sources: draft.sources || [],
    generatedBy,
    isPublished,
    isFeatured,
    editorChoice,
  });

  return post.save();
}

/* ------------------------------------------------------------------ */
/* Daily job                                                           */
/* ------------------------------------------------------------------ */

export async function runDaily({
  count = 3,
  log = console.log,
} = {}) {
  const catalog =
    await buildLinkCatalog();

  const recent =
    await recentTitles(80);

  log("[blog-agent] researching today's news…");

  const found = await callModel({
    stage: "research",
    system: RESEARCH_SYSTEM,
    user: DAILY_RESEARCH_USER({
      recent,
    }),
    search: true,
    maxTokens: 7000,
  });

  const candidates = parseJson(
    found.text
  );

  const planned = await callModel({
    stage: "planner",
    system: PLANNER_SYSTEM,

    user: plannerUser({
      candidates,
      recent,
      count,
    }),

    maxTokens: 3000,
  });

  const picks = parseJson(
    planned.text
  ).slice(0, count);

  const results = [];

  for (const pick of picks) {
    try {
      log(
        `[blog-agent] writing: ${String(
          pick.brief
        ).slice(0, 80)}…`
      );

      const draft =
        await produceDraft({
          brief: pick.brief,
          category: pick.category,
          seedSources: pick.sources,
          catalog,
          length: "medium",
          research: true,
          factCheck: true,
          cover: true,
        });

      if (
        draft.warnings.some((w) =>
          w.startsWith(
            "The fact-checker could not"
          )
        )
      ) {
        results.push({
          status: "rejected",
          title: draft.title,
          issues: draft.warnings,
        });

        if (draft.cloudinaryPublicId) {
          await discardCover(
            draft.cloudinaryPublicId
          ).catch(() => {});
        }

        continue;
      }

      const saved = await saveDraft(
        draft,
        {
          isPublished: false,
          generatedBy: "daily-agent",
        }
      );

      results.push({
        status: "draft",
        title: saved.title,
        slug: saved.slug,
      });
    } catch (error) {
      log(
        `[blog-agent] failed: ${error.message}`
      );

      results.push({
        status: "error",
        error: error.message,
      });
    }
  }

  return results;
}

export { SITE_URL };
