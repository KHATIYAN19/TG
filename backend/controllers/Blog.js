import crypto from "crypto";
import fs from "fs/promises";

import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import sanitizeHtml from "sanitize-html";

import BlogPost from "../models/Blog.js";

import uploadFile, {
  deleteFile,
} from "../utils/cloudinary.js";

import redis from "../utils/redis.js";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const BLOG_VIEW_TTL =
  60 * 60 * 24;

const MAX_PUBLIC_LIMIT = 50;
const MAX_ADMIN_LIMIT = 100;

/*
|--------------------------------------------------------------------------
| BOOLEAN HELPER
|--------------------------------------------------------------------------
*/

const parseBoolean = (
  value,
  defaultValue = false
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  if (
    value === true ||
    value === "true" ||
    value === 1 ||
    value === "1"
  ) {
    return true;
  }

  if (
    value === false ||
    value === "false" ||
    value === 0 ||
    value === "0"
  ) {
    return false;
  }

  return defaultValue;
};

/*
|--------------------------------------------------------------------------
| ARRAY HELPER
|--------------------------------------------------------------------------
|
| Supports:
|
| ["java", "backend"]
|
| OR
|
| "java,backend"
|
| OR multipart JSON:
|
| '["java","backend"]'
|
*/

const parseArrayField = (
  value
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return [];
  }

  if (Array.isArray(value)) {
    return [
      ...new Set(
        value
          .map((item) =>
            String(item)
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      ),
    ];
  }

  if (
    typeof value === "string"
  ) {
    const trimmed =
      value.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed =
        JSON.parse(trimmed);

      if (
        Array.isArray(parsed)
      ) {
        return parseArrayField(
          parsed
        );
      }
    } catch {
      // Normal comma separated value.
    }

    return [
      ...new Set(
        trimmed
          .split(",")
          .map((item) =>
            item
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      ),
    ];
  }

  return [];
};

/*
|--------------------------------------------------------------------------
| REGEX ESCAPE
|--------------------------------------------------------------------------
*/

const escapeRegex = (
  value = ""
) => {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

/*
|--------------------------------------------------------------------------
| PLAIN TEXT SANITIZER
|--------------------------------------------------------------------------
*/

const sanitizePlainText = (
  value = ""
) => {
  return sanitizeHtml(
    String(value),
    {
      allowedTags: [],
      allowedAttributes: {},
    }
  )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
};

/*
|--------------------------------------------------------------------------
| RICH HTML SANITIZER
|--------------------------------------------------------------------------
|
| Admin content can contain:
|
| headings
| paragraph
| bold
| italic
| underline
| strike
| text color
| background color
| alignment
| font size
| font family
| lists
| links
| blockquotes
| code
| tables
| images
| figure
| mark
|
| Unsafe JavaScript / script tags are removed.
|
*/

const sanitizeBlogHtml = (
  html = ""
) => {
  return sanitizeHtml(
    String(html),
    {
      allowedTags: [
        ...sanitizeHtml
          .defaults
          .allowedTags,

        "img",
        "figure",
        "figcaption",

        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",

        "table",
        "thead",
        "tbody",
        "tfoot",
        "tr",
        "th",
        "td",

        "mark",
        "u",
        "s",
        "del",

        "pre",
        "code",

        "hr",
      ],

      allowedAttributes: {
        "*": [
          "class",
          "style",
          "id",
        ],

        a: [
          "href",
          "target",
          "rel",
          "title",
          "class",
          "style",
        ],

        img: [
          "src",
          "alt",
          "title",
          "width",
          "height",
          "loading",
          "class",
          "style",
        ],

        td: [
          "colspan",
          "rowspan",
          "class",
          "style",
        ],

        th: [
          "colspan",
          "rowspan",
          "class",
          "style",
        ],
      },

      allowedSchemes: [
        "http",
        "https",
        "mailto",
      ],

      allowedStyles: {
        "*": {
          color: [
            /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-zA-Z]+)$/,
          ],

          "background-color": [
            /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-zA-Z]+)$/,
          ],

          "text-align": [
            /^(left|right|center|justify)$/,
          ],

          "font-weight": [
            /^(normal|bold|bolder|lighter|[1-9]00)$/,
          ],

          "font-style": [
            /^(normal|italic|oblique)$/,
          ],

          "text-decoration": [
            /^(none|underline|line-through|overline)(\s+(underline|line-through|overline))*$/,
          ],

          "font-size": [
            /^\d+(\.\d+)?(px|rem|em|%)$/,
          ],

          "line-height": [
            /^\d+(\.\d+)?(px|rem|em|%)?$/,
          ],

          "font-family": [
            /^[a-zA-Z0-9 ,"'_-]+$/,
          ],

          "margin-left": [
            /^\d+(\.\d+)?(px|rem|em|%)$/,
          ],

          "margin-right": [
            /^\d+(\.\d+)?(px|rem|em|%)$/,
          ],
        },
      },

      transformTags: {
        a: (
          tagName,
          attribs
        ) => {
          if (
            attribs.target ===
            "_blank"
          ) {
            attribs.rel =
              "noopener noreferrer";
          }

          return {
            tagName,
            attribs,
          };
        },

        img: (
          tagName,
          attribs
        ) => {
          return {
            tagName,

            attribs: {
              ...attribs,

              loading:
                attribs.loading ||
                "lazy",
            },
          };
        },
      },
    }
  );
};

/*
|--------------------------------------------------------------------------
| SLUG
|--------------------------------------------------------------------------
*/

const normalizeSlug = (
  value = ""
) => {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
};

/*
|--------------------------------------------------------------------------
| URL VALIDATION
|--------------------------------------------------------------------------
*/

const isValidHttpUrl = (
  value
) => {
  if (!value) {
    return true;
  }

  try {
    const parsed =
      new URL(value);

    return (
      parsed.protocol ===
        "http:" ||
      parsed.protocol ===
        "https:"
    );
  } catch {
    return false;
  }
};

/*
|--------------------------------------------------------------------------
| SEO PARSER
|--------------------------------------------------------------------------
|
| Works with JSON request:
|
| seo: {
|   metaTitle,
|   metaDescription,
|   keywords
| }
|
| Also works with multipart:
|
| metaTitle
| metaDescription
| seoKeywords
| canonicalUrl
| ogImageUrl
| noIndex
|
*/

const parseSeoPayload = (
  body = {}
) => {
  let nestedSeo = {};

  if (
    body.seo !== undefined
  ) {
    if (
      typeof body.seo ===
      "object" &&
      body.seo !== null
    ) {
      nestedSeo =
        body.seo;
    } else if (
      typeof body.seo ===
      "string"
    ) {
      try {
        const parsed =
          JSON.parse(
            body.seo
          );

        if (
          parsed &&
          typeof parsed ===
            "object"
        ) {
          nestedSeo =
            parsed;
        }
      } catch {
        nestedSeo = {};
      }
    }
  }

  const seo = {};

  const metaTitle =
    nestedSeo.metaTitle ??
    body.metaTitle ??
    body.seoMetaTitle;

  if (
    metaTitle !== undefined
  ) {
    seo.metaTitle =
      sanitizePlainText(
        metaTitle
      ).substring(
        0,
        70
      );
  }

  const metaDescription =
    nestedSeo.metaDescription ??
    body.metaDescription ??
    body.seoMetaDescription;

  if (
    metaDescription !==
    undefined
  ) {
    seo.metaDescription =
      sanitizePlainText(
        metaDescription
      ).substring(
        0,
        180
      );
  }

  const keywords =
    nestedSeo.keywords ??
    body.seoKeywords;

  if (
    keywords !== undefined
  ) {
    seo.keywords =
      parseArrayField(
        keywords
      );
  }

  const canonicalUrl =
    nestedSeo.canonicalUrl ??
    body.canonicalUrl;

  if (
    canonicalUrl !==
    undefined
  ) {
    seo.canonicalUrl =
      String(
        canonicalUrl
      ).trim();
  }

  const ogImageUrl =
    nestedSeo.ogImageUrl ??
    body.ogImageUrl;

  if (
    ogImageUrl !==
    undefined
  ) {
    seo.ogImageUrl =
      String(
        ogImageUrl
      ).trim();
  }

  const noIndex =
    nestedSeo.noIndex ??
    body.noIndex;

  if (
    noIndex !== undefined
  ) {
    seo.noIndex =
      parseBoolean(
        noIndex
      );
  }

  return seo;
};

/*
|--------------------------------------------------------------------------
| REMOVE TEMP MULTER FILE
|--------------------------------------------------------------------------
*/

const cleanupTempFile =
  async (file) => {
    if (!file?.path) {
      return;
    }

    try {
      await fs.unlink(
        file.path
      );
    } catch {
      // File already removed or unavailable.
    }
  };

/*
|--------------------------------------------------------------------------
| OBJECT ID
|--------------------------------------------------------------------------
*/

const isValidObjectId = (
  id
) => {
  return mongoose.Types.ObjectId.isValid(
    id
  );
};

/*
|--------------------------------------------------------------------------
| ADMIN ACTOR
|--------------------------------------------------------------------------
*/

const getActor = (
  req
) => {
  return String(
    req.user?.email ||
      req.user?.name ||
      req.user?.username ||
      req.user?._id ||
      "admin"
  );
};

/*
|--------------------------------------------------------------------------
| CREATE BLOG
|--------------------------------------------------------------------------
*/

export const createBlogPost =
  asyncHandler(
    async (req, res) => {
      let uploadedPublicId =
        "";

      try {
        const {
          title,
          excerpt,
          author,
          content,
          category,
          altText,
        } = req.body;

        /*
        |--------------------------------------------------------------------------
        | TITLE
        |--------------------------------------------------------------------------
        */

        const cleanTitle =
          sanitizePlainText(
            title
          );

        if (
          !cleanTitle ||
          cleanTitle.length < 5
        ) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "Title is required and must contain at least 5 characters.",
              },
            });
        }

        /*
        |--------------------------------------------------------------------------
        | EXCERPT
        |--------------------------------------------------------------------------
        */

        const cleanExcerpt =
          sanitizePlainText(
            excerpt
          );

        if (
          !cleanExcerpt ||
          cleanExcerpt.length <
            10
        ) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "Excerpt is required and must contain at least 10 characters.",
              },
            });
        }

        /*
        |--------------------------------------------------------------------------
        | AUTHOR
        |--------------------------------------------------------------------------
        */

        const cleanAuthor =
          sanitizePlainText(
            author
          );

        if (
          !cleanAuthor ||
          cleanAuthor.length < 2
        ) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "Author is required and must contain at least 2 characters.",
              },
            });
        }

        /*
        |--------------------------------------------------------------------------
        | CATEGORY
        |--------------------------------------------------------------------------
        */

        const cleanCategory =
          sanitizePlainText(
            category
          ).toLowerCase();

        if (!cleanCategory) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "Category is required.",
              },
            });
        }

        /*
        |--------------------------------------------------------------------------
        | CONTENT
        |--------------------------------------------------------------------------
        */

        if (
          !content ||
          !String(
            content
          ).trim()
        ) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "Blog content is required.",
              },
            });
        }

        const cleanContent =
          sanitizeBlogHtml(
            content
          );

        const plainContent =
          sanitizePlainText(
            cleanContent
          );

        if (
          plainContent.length <
          20
        ) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "Blog content is too short.",
              },
            });
        }

        /*
        |--------------------------------------------------------------------------
        | TAGS
        |--------------------------------------------------------------------------
        */

        const tags =
          parseArrayField(
            req.body.tags
          );

        if (
          tags.length === 0
        ) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "At least one valid tag is required.",
              },
            });
        }

        if (
          tags.length > 15
        ) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "Maximum 15 tags are allowed.",
              },
            });
        }

        /*
        |--------------------------------------------------------------------------
        | SLUG
        |--------------------------------------------------------------------------
        */

        const slug =
          normalizeSlug(
            req.body.slug ||
              cleanTitle
          );

        if (
          !slug ||
          !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
            slug
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "A valid slug is required.",
              },
            });
        }

        const existingSlug =
          await BlogPost.findOne(
            {
              slug,
            }
          ).select("_id");

        if (existingSlug) {
          return res
            .status(409)
            .json({
              success: false,

              error: {
                message:
                  "Slug already exists. Please choose another slug.",
              },
            });
        }

        /*
        |--------------------------------------------------------------------------
        | COVER IMAGE
        |--------------------------------------------------------------------------
        */

        let finalImageUrl =
          String(
            req.body.imageUrl ||
              ""
          ).trim();

        if (
          req.file &&
          finalImageUrl
        ) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "Provide either an image file or image URL, not both.",
              },
            });
        }

        if (
          finalImageUrl &&
          !isValidHttpUrl(
            finalImageUrl
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "Invalid image URL.",
              },
            });
        }

        let cloudinaryPublicId =
          "";

        if (req.file) {
          const result =
            await uploadFile(
              req.file.path
            );

          finalImageUrl =
            result.secure_url;

          cloudinaryPublicId =
            result.public_id;

          uploadedPublicId =
            result.public_id;
        }

        if (!finalImageUrl) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "A cover image URL or image upload is required.",
              },
            });
        }

        /*
        |--------------------------------------------------------------------------
        | SEO
        |--------------------------------------------------------------------------
        */

        const seo =
          parseSeoPayload(
            req.body
          );

        if (
          seo.canonicalUrl &&
          !isValidHttpUrl(
            seo.canonicalUrl
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "Invalid canonical URL.",
              },
            });
        }

        if (
          seo.ogImageUrl &&
          !isValidHttpUrl(
            seo.ogImageUrl
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "Invalid OG image URL.",
              },
            });
        }

        /*
        |--------------------------------------------------------------------------
        | CREATE
        |--------------------------------------------------------------------------
        */

        const post =
          new BlogPost({
            title:
              cleanTitle,

            slug,

            excerpt:
              cleanExcerpt,

            content:
              cleanContent,

            author:
              cleanAuthor,

            category:
              cleanCategory,

            tags,

            imageUrl:
              finalImageUrl,

            altText:
              sanitizePlainText(
                altText
              ),

            cloudinaryPublicId,

            isPublished:
              parseBoolean(
                req.body
                  .isPublished
              ),

            isFeatured:
              parseBoolean(
                req.body
                  .isFeatured
              ),

            editorChoice:
              parseBoolean(
                req.body
                  .editorChoice
              ),

            seo,
          });

        const savedPost =
          await post.save();

        /*
         * Mongo save succeeded,
         * so Cloudinary image
         * should not be cleaned up.
         */

        uploadedPublicId =
          "";

        return res
          .status(201)
          .json({
            success: true,

            message:
              "Blog created successfully.",

            data:
              savedPost,
          });
      } catch (error) {
        /*
         * Image was uploaded but
         * Mongo creation failed.
         *
         * Remove orphaned image.
         */

        if (
          uploadedPublicId
        ) {
          try {
            await deleteFile(
              uploadedPublicId
            );
          } catch (
            cleanupError
          ) {
            console.error(
              "Cloudinary rollback error:",
              cleanupError
            );
          }
        }

        throw error;
      } finally {
        await cleanupTempFile(
          req.file
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| PUBLIC - GET ALL PUBLISHED BLOGS
|--------------------------------------------------------------------------
|
| Full HTML content is intentionally excluded.
|
*/

export const getAllPublishedBlogPosts =
  asyncHandler(
    async (req, res) => {
      const page =
        Math.max(
          1,
          Number(
            req.query.page
          ) || 1
        );

      const limit =
        Math.min(
          MAX_PUBLIC_LIMIT,
          Math.max(
            1,
            Number(
              req.query.limit
            ) || 12
          )
        );

      const filter = {
        isPublished: true,
        isDeleted: false,
      };

      /*
      |--------------------------------------------------------------------------
      | CATEGORY
      |--------------------------------------------------------------------------
      */

      if (
        req.query.category
      ) {
        filter.category =
          String(
            req.query
              .category
          )
            .trim()
            .toLowerCase();
      }

      /*
      |--------------------------------------------------------------------------
      | TAG
      |--------------------------------------------------------------------------
      */

      if (req.query.tag) {
        filter.tags =
          String(
            req.query.tag
          )
            .trim()
            .toLowerCase();
      }

      /*
      |--------------------------------------------------------------------------
      | FEATURED
      |--------------------------------------------------------------------------
      */

      if (
        req.query.featured ===
        "true"
      ) {
        filter.isFeatured =
          true;
      }

      /*
      |--------------------------------------------------------------------------
      | EDITOR CHOICE
      |--------------------------------------------------------------------------
      */

      if (
        req.query.editorChoice ===
        "true"
      ) {
        filter.editorChoice =
          true;
      }

      /*
      |--------------------------------------------------------------------------
      | SEARCH
      |--------------------------------------------------------------------------
      */

      if (
        req.query.search
      ) {
        const searchRegex =
          new RegExp(
            escapeRegex(
              req.query.search
            ),
            "i"
          );

        filter.$or = [
          {
            title:
              searchRegex,
          },

          {
            excerpt:
              searchRegex,
          },

          {
            author:
              searchRegex,
          },

          {
            category:
              searchRegex,
          },

          {
            tags:
              searchRegex,
          },
        ];
      }

      /*
      |--------------------------------------------------------------------------
      | SORT
      |--------------------------------------------------------------------------
      */

      const sortOptions = {
        latest: {
          publishedAt: -1,
          createdAt: -1,
        },

        oldest: {
          publishedAt: 1,
        },

        trending: {
          views: -1,
          publishedAt: -1,
        },

        title: {
          title: 1,
        },
      };

      const sort =
        sortOptions[
          req.query.sort
        ] ||
        sortOptions.latest;

      const [
        posts,
        total,
      ] =
        await Promise.all([
          BlogPost.find(
            filter
          )
            .sort(sort)
            .skip(
              (page - 1) *
                limit
            )
            .limit(limit)
            .select(
              [
                "slug",
                "title",
                "excerpt",
                "author",
                "imageUrl",
                "altText",
                "category",
                "tags",
                "isFeatured",
                "editorChoice",
                "views",
                "readingTimeMinutes",
                "publishedAt",
                "createdAt",
                "updatedAt",
              ].join(" ")
            )
            .lean(),

          BlogPost.countDocuments(
            filter
          ),
        ]);

      return res
        .status(200)
        .json({
          success: true,

          data:
            posts,

          pagination: {
            page,
            limit,
            total,

            totalPages:
              Math.ceil(
                total /
                  limit
              ),

            hasNextPage:
              page *
                limit <
              total,

            hasPreviousPage:
              page > 1,
          },
        });
    }
  );

/*
|--------------------------------------------------------------------------
| PUBLIC - GET BLOG BY SLUG
|--------------------------------------------------------------------------
*/

export const getBlogPostBySlug =
  asyncHandler(
    async (req, res) => {
      const slug =
        String(
          req.params.slug ||
            ""
        )
          .trim()
          .toLowerCase();

      const post =
        await BlogPost.findOne({
          slug,

          isPublished: true,

          isDeleted: false,
        })
          .select(
            [
              "-cloudinaryPublicId",
              "-isDeleted",
              "-deletedAt",
              "-deletedBy",
            ].join(" ")
          )
          .lean();

      if (!post) {
        return res
          .status(404)
          .json({
            success: false,

            error: {
              message:
                "Blog post not found.",
            },
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          data:
            post,
        });
    }
  );

/*
|--------------------------------------------------------------------------
| PUBLIC - RECORD VIEW
|--------------------------------------------------------------------------
|
| Upstash Redis
|
| One view per:
|
| blog + visitor
|
| every 24 hours.
|
*/

export const recordBlogView =
  asyncHandler(
    async (req, res) => {
      const slug =
        String(
          req.params.slug ||
            ""
        )
          .trim()
          .toLowerCase();

      if (!slug) {
        return res
          .status(400)
          .json({
            success: false,

            error: {
              message:
                "Blog slug is required.",
            },
          });
      }

      const blog =
        await BlogPost.findOne({
          slug,

          isPublished: true,

          isDeleted: false,
        }).select(
          "_id views"
        );

      if (!blog) {
        return res
          .status(404)
          .json({
            success: false,

            error: {
              message:
                "Blog post not found.",
            },
          });
      }

      /*
       * This visitor ID can later
       * be provided by the client.
       *
       * We never store it raw.
       */

      const visitorId =
        String(
          req.get(
            "x-blog-visitor-id"
          ) || ""
        ).trim();

      if (!visitorId) {
        return res
          .status(200)
          .json({
            success: true,

            counted: false,

            views:
              blog.views,

            message:
              "Visitor identifier not provided.",
          });
      }

      if (
        visitorId.length >
        200
      ) {
        return res
          .status(400)
          .json({
            success: false,

            error: {
              message:
                "Invalid visitor identifier.",
            },
          });
      }

      /*
       * Hash visitor ID before
       * storing anything in Redis.
       */

      const visitorHash =
        crypto
          .createHash(
            "sha256"
          )
          .update(
            visitorId
          )
          .digest("hex");

      const redisKey =
        `blog:view:${blog._id}:${visitorHash}`;

      let redisKeyCreated =
        false;

      try {
        /*
         * Upstash syntax.
         *
         * NX:
         * only create if the key
         * does not already exist.
         *
         * EX:
         * expire after 24 hours.
         */

        const redisResult =
          await redis.set(
            redisKey,
            "1",
            {
              nx: true,
              ex:
                BLOG_VIEW_TTL,
            }
          );

        /*
         * Redis returns null when
         * NX condition fails.
         */

        if (!redisResult) {
          return res
            .status(200)
            .json({
              success: true,

              counted: false,

              views:
                blog.views,
            });
        }

        redisKeyCreated =
          true;

        /*
         * Atomic Mongo increment.
         */

        const updatedBlog =
          await BlogPost.findOneAndUpdate(
            {
              _id:
                blog._id,

              isPublished:
                true,

              isDeleted:
                false,
            },
            {
              $inc: {
                views: 1,
              },
            },
            {
              new: true,
            }
          ).select(
            "views"
          );

        if (
          !updatedBlog
        ) {
          /*
           * Blog disappeared between
           * Redis and Mongo update.
           */

          try {
            await redis.del(
              redisKey
            );
          } catch {
            // ignore
          }

          return res
            .status(404)
            .json({
              success: false,

              error: {
                message:
                  "Blog post not found.",
              },
            });
        }

        return res
          .status(200)
          .json({
            success: true,

            counted: true,

            views:
              updatedBlog.views,
          });
      } catch (error) {
        /*
         * If Redis lock was created
         * but Mongo increment failed,
         * remove the Redis key so
         * another request can retry.
         */

        if (
          redisKeyCreated
        ) {
          try {
            await redis.del(
              redisKey
            );
          } catch (
            redisDeleteError
          ) {
            console.error(
              "Redis rollback error:",
              redisDeleteError
            );
          }
        }

        console.error(
          "Blog view count error:",
          error
        );

        /*
         * View analytics should not
         * break the blog experience.
         */

        return res
          .status(200)
          .json({
            success: true,

            counted: false,

            views:
              blog.views,
          });
      }
    }
  );

/*
|--------------------------------------------------------------------------
| ADMIN - GET ALL ACTIVE BLOGS
|--------------------------------------------------------------------------
|
| Soft deleted blogs are excluded.
|
*/

export const getAllBlogPostsAdmin =
  asyncHandler(
    async (req, res) => {
      const page =
        Math.max(
          1,
          Number(
            req.query.page
          ) || 1
        );

      const limit =
        Math.min(
          MAX_ADMIN_LIMIT,
          Math.max(
            1,
            Number(
              req.query.limit
            ) || 20
          )
        );

      const filter = {
        isDeleted: false,
      };

      /*
      |--------------------------------------------------------------------------
      | PUBLISH STATUS
      |--------------------------------------------------------------------------
      */

      if (
        req.query.status ===
        "published"
      ) {
        filter.isPublished =
          true;
      }

      if (
        req.query.status ===
        "draft"
      ) {
        filter.isPublished =
          false;
      }

      /*
      |--------------------------------------------------------------------------
      | CATEGORY
      |--------------------------------------------------------------------------
      */

      if (
        req.query.category
      ) {
        filter.category =
          String(
            req.query
              .category
          )
            .trim()
            .toLowerCase();
      }

      /*
      |--------------------------------------------------------------------------
      | FEATURED
      |--------------------------------------------------------------------------
      */

      if (
        req.query.featured ===
        "true"
      ) {
        filter.isFeatured =
          true;
      }

      /*
      |--------------------------------------------------------------------------
      | EDITOR CHOICE
      |--------------------------------------------------------------------------
      */

      if (
        req.query.editorChoice ===
        "true"
      ) {
        filter.editorChoice =
          true;
      }

      /*
      |--------------------------------------------------------------------------
      | SEARCH
      |--------------------------------------------------------------------------
      */

      if (
        req.query.search
      ) {
        const searchRegex =
          new RegExp(
            escapeRegex(
              req.query.search
            ),
            "i"
          );

        filter.$or = [
          {
            title:
              searchRegex,
          },

          {
            slug:
              searchRegex,
          },

          {
            author:
              searchRegex,
          },

          {
            category:
              searchRegex,
          },

          {
            tags:
              searchRegex,
          },
        ];
      }

      /*
      |--------------------------------------------------------------------------
      | SORT
      |--------------------------------------------------------------------------
      */

      const sortOptions = {
        latest: {
          createdAt: -1,
        },

        oldest: {
          createdAt: 1,
        },

        published: {
          publishedAt: -1,
        },

        views: {
          views: -1,
        },

        title: {
          title: 1,
        },
      };

      const sort =
        sortOptions[
          req.query.sort
        ] ||
        sortOptions.latest;

      const [
        posts,
        total,
      ] =
        await Promise.all([
          BlogPost.find(
            filter
          )
            .sort(sort)
            .skip(
              (page - 1) *
                limit
            )
            .limit(limit)
            .select(
              "-content"
            )
            .lean(),

          BlogPost.countDocuments(
            filter
          ),
        ]);

      return res
        .status(200)
        .json({
          success: true,

          data:
            posts,

          pagination: {
            page,
            limit,
            total,

            totalPages:
              Math.ceil(
                total /
                  limit
              ),

            hasNextPage:
              page *
                limit <
              total,

            hasPreviousPage:
              page > 1,
          },
        });
    }
  );

/*
|--------------------------------------------------------------------------
| ADMIN - GET BLOG BY ID
|--------------------------------------------------------------------------
*/

export const getBlogPostByIdAdmin =
  asyncHandler(
    async (req, res) => {
      const { id } =
        req.params;

      if (
        !isValidObjectId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            error: {
              message:
                "Invalid blog ID.",
            },
          });
      }

      const post =
        await BlogPost.findOne({
          _id: id,
          isDeleted: false,
        });

      if (!post) {
        return res
          .status(404)
          .json({
            success: false,

            error: {
              message:
                "Blog post not found.",
            },
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          data:
            post,
        });
    }
  );

/*
|--------------------------------------------------------------------------
| ADMIN - UPDATE BLOG
|--------------------------------------------------------------------------
*/

export const updateBlogPost =
  asyncHandler(
    async (req, res) => {
      let newUploadedPublicId =
        "";

      let previousCloudinaryPublicIdToDelete =
        "";

      try {
        const { id } =
          req.params;

        if (
          !isValidObjectId(
            id
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "Invalid blog ID.",
              },
            });
        }

        const post =
          await BlogPost.findOne({
            _id: id,
            isDeleted: false,
          });

        if (!post) {
          return res
            .status(404)
            .json({
              success: false,

              error: {
                message:
                  "Blog post not found.",
              },
            });
        }

        /*
        |--------------------------------------------------------------------------
        | TITLE
        |--------------------------------------------------------------------------
        */

        if (
          req.body.title !==
          undefined
        ) {
          const title =
            sanitizePlainText(
              req.body.title
            );

          if (
            title.length < 5
          ) {
            return res
              .status(400)
              .json({
                success: false,

                error: {
                  message:
                    "Title must contain at least 5 characters.",
                },
              });
          }

          post.title =
            title;
        }

        /*
        |--------------------------------------------------------------------------
        | SLUG
        |--------------------------------------------------------------------------
        */

        if (
          req.body.slug !==
          undefined
        ) {
          const slug =
            normalizeSlug(
              req.body.slug
            );

          if (
            !slug ||
            !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
              slug
            )
          ) {
            return res
              .status(400)
              .json({
                success: false,

                error: {
                  message:
                    "Invalid slug.",
                },
              });
          }

          const existingSlug =
            await BlogPost.findOne(
              {
                slug,

                _id: {
                  $ne:
                    post._id,
                },
              }
            ).select("_id");

          if (
            existingSlug
          ) {
            return res
              .status(409)
              .json({
                success: false,

                error: {
                  message:
                    "Slug already exists.",
                },
              });
          }

          post.slug =
            slug;
        }

        /*
        |--------------------------------------------------------------------------
        | EXCERPT
        |--------------------------------------------------------------------------
        */

        if (
          req.body.excerpt !==
          undefined
        ) {
          const excerpt =
            sanitizePlainText(
              req.body.excerpt
            );

          if (
            excerpt.length <
            10
          ) {
            return res
              .status(400)
              .json({
                success: false,

                error: {
                  message:
                    "Excerpt must contain at least 10 characters.",
                },
              });
          }

          post.excerpt =
            excerpt;
        }

        /*
        |--------------------------------------------------------------------------
        | AUTHOR
        |--------------------------------------------------------------------------
        */

        if (
          req.body.author !==
          undefined
        ) {
          const author =
            sanitizePlainText(
              req.body.author
            );

          if (
            author.length < 2
          ) {
            return res
              .status(400)
              .json({
                success: false,

                error: {
                  message:
                    "Author must contain at least 2 characters.",
                },
              });
          }

          post.author =
            author;
        }

        /*
        |--------------------------------------------------------------------------
        | CATEGORY
        |--------------------------------------------------------------------------
        */

        if (
          req.body.category !==
          undefined
        ) {
          const category =
            sanitizePlainText(
              req.body.category
            ).toLowerCase();

          if (!category) {
            return res
              .status(400)
              .json({
                success: false,

                error: {
                  message:
                    "Category cannot be empty.",
                },
              });
          }

          post.category =
            category;
        }

        /*
        |--------------------------------------------------------------------------
        | TAGS
        |--------------------------------------------------------------------------
        */

        if (
          req.body.tags !==
          undefined
        ) {
          const tags =
            parseArrayField(
              req.body.tags
            );

          if (
            tags.length === 0
          ) {
            return res
              .status(400)
              .json({
                success: false,

                error: {
                  message:
                    "At least one tag is required.",
                },
              });
          }

          if (
            tags.length > 15
          ) {
            return res
              .status(400)
              .json({
                success: false,

                error: {
                  message:
                    "Maximum 15 tags are allowed.",
                },
              });
          }

          post.tags =
            tags;
        }

        /*
        |--------------------------------------------------------------------------
        | CONTENT
        |--------------------------------------------------------------------------
        */

        if (
          req.body.content !==
          undefined
        ) {
          const content =
            sanitizeBlogHtml(
              req.body.content
            );

          const plainContent =
            sanitizePlainText(
              content
            );

          if (
            plainContent.length <
            20
          ) {
            return res
              .status(400)
              .json({
                success: false,

                error: {
                  message:
                    "Blog content is too short.",
                },
              });
          }

          post.content =
            content;
        }

        /*
        |--------------------------------------------------------------------------
        | ALT TEXT
        |--------------------------------------------------------------------------
        */

        if (
          req.body.altText !==
          undefined
        ) {
          post.altText =
            sanitizePlainText(
              req.body.altText
            );
        }

        /*
        |--------------------------------------------------------------------------
        | PUBLISH
        |--------------------------------------------------------------------------
        */

        if (
          req.body
            .isPublished !==
          undefined
        ) {
          post.isPublished =
            parseBoolean(
              req.body
                .isPublished
            );

          if (
            post.isPublished &&
            !post.publishedAt
          ) {
            post.publishedAt =
              new Date();
          }
        }

        /*
        |--------------------------------------------------------------------------
        | FEATURED
        |--------------------------------------------------------------------------
        */

        if (
          req.body
            .isFeatured !==
          undefined
        ) {
          post.isFeatured =
            parseBoolean(
              req.body
                .isFeatured
            );
        }

        /*
        |--------------------------------------------------------------------------
        | EDITOR CHOICE
        |--------------------------------------------------------------------------
        */

        if (
          req.body
            .editorChoice !==
          undefined
        ) {
          post.editorChoice =
            parseBoolean(
              req.body
                .editorChoice
            );
        }

        /*
        |--------------------------------------------------------------------------
        | SEO
        |--------------------------------------------------------------------------
        */

        const seoUpdate =
          parseSeoPayload(
            req.body
          );

        if (
          seoUpdate.canonicalUrl &&
          !isValidHttpUrl(
            seoUpdate.canonicalUrl
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "Invalid canonical URL.",
              },
            });
        }

        if (
          seoUpdate.ogImageUrl &&
          !isValidHttpUrl(
            seoUpdate.ogImageUrl
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "Invalid OG image URL.",
              },
            });
        }

        if (
          Object.keys(
            seoUpdate
          ).length > 0
        ) {
          if (!post.seo) {
            post.seo = {};
          }

          Object.entries(
            seoUpdate
          ).forEach(
            ([
              key,
              value,
            ]) => {
              post.seo[key] =
                value;
            }
          );
        }

        /*
        |--------------------------------------------------------------------------
        | IMAGE
        |--------------------------------------------------------------------------
        */

        const externalImageUrl =
          req.body.imageUrl !==
          undefined
            ? String(
                req.body
                  .imageUrl ||
                  ""
              ).trim()
            : undefined;

        const removeImage =
          parseBoolean(
            req.body
              .removeImage
          );

        if (
          req.file &&
          externalImageUrl
        ) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "Provide either a new image file or image URL, not both.",
              },
            });
        }

        if (
          externalImageUrl &&
          !isValidHttpUrl(
            externalImageUrl
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,

              error: {
                message:
                  "Invalid image URL.",
              },
            });
        }

        /*
         * Upload new image first.
         */

        if (req.file) {
          const uploadResult =
            await uploadFile(
              req.file.path
            );

          newUploadedPublicId =
            uploadResult.public_id;

          previousCloudinaryPublicIdToDelete =
            post.cloudinaryPublicId ||
            "";

          post.imageUrl =
            uploadResult.secure_url;

          post.cloudinaryPublicId =
            uploadResult.public_id;
        } else if (
          removeImage
        ) {
          previousCloudinaryPublicIdToDelete =
            post.cloudinaryPublicId ||
            "";

          post.imageUrl =
            "";

          post.cloudinaryPublicId =
            "";
        } else if (
          externalImageUrl !==
          undefined
        ) {
          previousCloudinaryPublicIdToDelete =
            post.cloudinaryPublicId ||
            "";

          post.imageUrl =
            externalImageUrl;

          post.cloudinaryPublicId =
            "";
        }

        /*
        |--------------------------------------------------------------------------
        | SAVE MONGO FIRST
        |--------------------------------------------------------------------------
        */

        const updatedPost =
          await post.save();

        /*
         * Mongo succeeded.
         *
         * Don't rollback new image.
         */

        newUploadedPublicId =
          "";

        /*
         * Now it is safe to remove
         * the old Cloudinary image.
         */

        if (
          previousCloudinaryPublicIdToDelete &&
          previousCloudinaryPublicIdToDelete !==
            post.cloudinaryPublicId
        ) {
          try {
            await deleteFile(
              previousCloudinaryPublicIdToDelete
            );
          } catch (
            cloudinaryDeleteError
          ) {
            console.error(
              "Old Cloudinary image cleanup error:",
              cloudinaryDeleteError
            );
          }
        }

        return res
          .status(200)
          .json({
            success: true,

            message:
              "Blog updated successfully.",

            data:
              updatedPost,
          });
      } catch (error) {
        /*
         * New upload happened but
         * Mongo update failed.
         *
         * Delete the new upload.
         */

        if (
          newUploadedPublicId
        ) {
          try {
            await deleteFile(
              newUploadedPublicId
            );
          } catch (
            rollbackError
          ) {
            console.error(
              "Cloudinary rollback error:",
              rollbackError
            );
          }
        }

        throw error;
      } finally {
        await cleanupTempFile(
          req.file
        );
      }
    }
  );

/*
|--------------------------------------------------------------------------
| ADMIN - SET PUBLISH STATUS
|--------------------------------------------------------------------------
|
| Preferred over toggle because the
| frontend explicitly tells backend
| the desired final state.
|
*/

export const setPublishStatus =
  asyncHandler(
    async (req, res) => {
      const { id } =
        req.params;

      if (
        !isValidObjectId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            error: {
              message:
                "Invalid blog ID.",
            },
          });
      }

      if (
        req.body
          .isPublished ===
        undefined
      ) {
        return res
          .status(400)
          .json({
            success: false,

            error: {
              message:
                "isPublished is required.",
            },
          });
      }

      const post =
        await BlogPost.findOne({
          _id: id,

          isDeleted: false,
        });

      if (!post) {
        return res
          .status(404)
          .json({
            success: false,

            error: {
              message:
                "Blog post not found.",
            },
          });
      }

      const publish =
        parseBoolean(
          req.body
            .isPublished
        );

      post.isPublished =
        publish;

      if (
        publish &&
        !post.publishedAt
      ) {
        post.publishedAt =
          new Date();
      }

      const updatedPost =
        await post.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            publish
              ? "Blog published successfully."
              : "Blog moved to draft successfully.",

          data:
            updatedPost,
        });
    }
  );

/*
|--------------------------------------------------------------------------
| ADMIN - OLD TOGGLE ROUTE
|--------------------------------------------------------------------------
|
| Keep for compatibility with your
| existing frontend.
|
*/

export const togglePublishStatus =
  asyncHandler(
    async (req, res) => {
      const { id } =
        req.params;

      if (
        !isValidObjectId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            error: {
              message:
                "Invalid blog ID.",
            },
          });
      }

      const post =
        await BlogPost.findOne({
          _id: id,

          isDeleted: false,
        });

      if (!post) {
        return res
          .status(404)
          .json({
            success: false,

            error: {
              message:
                "Blog post not found.",
            },
          });
      }

      post.isPublished =
        !post.isPublished;

      if (
        post.isPublished &&
        !post.publishedAt
      ) {
        post.publishedAt =
          new Date();
      }

      const updatedPost =
        await post.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            updatedPost.isPublished
              ? "Blog published successfully."
              : "Blog moved to draft successfully.",

          data:
            updatedPost,
        });
    }
  );

/*
|--------------------------------------------------------------------------
| ADMIN - FEATURED STATUS
|--------------------------------------------------------------------------
*/

export const setFeaturedStatus =
  asyncHandler(
    async (req, res) => {
      const { id } =
        req.params;

      if (
        !isValidObjectId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            error: {
              message:
                "Invalid blog ID.",
            },
          });
      }

      if (
        req.body
          .isFeatured ===
        undefined
      ) {
        return res
          .status(400)
          .json({
            success: false,

            error: {
              message:
                "isFeatured is required.",
            },
          });
      }

      const post =
        await BlogPost.findOne({
          _id: id,

          isDeleted: false,
        });

      if (!post) {
        return res
          .status(404)
          .json({
            success: false,

            error: {
              message:
                "Blog post not found.",
            },
          });
      }

      post.isFeatured =
        parseBoolean(
          req.body
            .isFeatured
        );

      const updatedPost =
        await post.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            updatedPost.isFeatured
              ? "Blog marked as featured."
              : "Blog removed from featured.",

          data:
            updatedPost,
        });
    }
  );

/*
|--------------------------------------------------------------------------
| ADMIN - EDITOR CHOICE
|--------------------------------------------------------------------------
*/

export const setEditorChoiceStatus =
  asyncHandler(
    async (req, res) => {
      const { id } =
        req.params;

      if (
        !isValidObjectId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            error: {
              message:
                "Invalid blog ID.",
            },
          });
      }

      if (
        req.body
          .editorChoice ===
        undefined
      ) {
        return res
          .status(400)
          .json({
            success: false,

            error: {
              message:
                "editorChoice is required.",
            },
          });
      }

      const post =
        await BlogPost.findOne({
          _id: id,

          isDeleted: false,
        });

      if (!post) {
        return res
          .status(404)
          .json({
            success: false,

            error: {
              message:
                "Blog post not found.",
            },
          });
      }

      post.editorChoice =
        parseBoolean(
          req.body
            .editorChoice
        );

      const updatedPost =
        await post.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            updatedPost.editorChoice
              ? "Blog marked as Editor's Choice."
              : "Blog removed from Editor's Choice.",

          data:
            updatedPost,
        });
    }
  );

/*
|--------------------------------------------------------------------------
| ADMIN - SOFT DELETE
|--------------------------------------------------------------------------
|
| Does NOT delete Cloudinary image.
|
*/

export const deleteBlogPost =
  asyncHandler(
    async (req, res) => {
      const { id } =
        req.params;

      if (
        !isValidObjectId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            error: {
              message:
                "Invalid blog ID.",
            },
          });
      }

      const post =
        await BlogPost.findOne({
          _id: id,

          isDeleted: false,
        });

      if (!post) {
        return res
          .status(404)
          .json({
            success: false,

            error: {
              message:
                "Blog post not found.",
            },
          });
      }

      post.isDeleted =
        true;

      post.deletedAt =
        new Date();

      post.deletedBy =
        getActor(req);

      await post.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Blog moved to trash successfully.",
        });
    }
  );

/*
|--------------------------------------------------------------------------
| ADMIN - GET TRASH
|--------------------------------------------------------------------------
*/

export const getDeletedBlogPostsAdmin =
  asyncHandler(
    async (req, res) => {
      const page =
        Math.max(
          1,
          Number(
            req.query.page
          ) || 1
        );

      const limit =
        Math.min(
          MAX_ADMIN_LIMIT,
          Math.max(
            1,
            Number(
              req.query.limit
            ) || 20
          )
        );

      const filter = {
        isDeleted: true,
      };

      if (
        req.query.search
      ) {
        const searchRegex =
          new RegExp(
            escapeRegex(
              req.query.search
            ),
            "i"
          );

        filter.$or = [
          {
            title:
              searchRegex,
          },

          {
            slug:
              searchRegex,
          },

          {
            author:
              searchRegex,
          },

          {
            category:
              searchRegex,
          },
        ];
      }

      const [
        posts,
        total,
      ] =
        await Promise.all([
          BlogPost.find(
            filter
          )
            .sort({
              deletedAt: -1,
            })
            .skip(
              (page - 1) *
                limit
            )
            .limit(limit)
            .select(
              "-content"
            )
            .lean(),

          BlogPost.countDocuments(
            filter
          ),
        ]);

      return res
        .status(200)
        .json({
          success: true,

          data:
            posts,

          pagination: {
            page,
            limit,
            total,

            totalPages:
              Math.ceil(
                total /
                  limit
              ),
          },
        });
    }
  );

/*
|--------------------------------------------------------------------------
| ADMIN - RESTORE SOFT DELETED BLOG
|--------------------------------------------------------------------------
*/

export const restoreBlogPost =
  asyncHandler(
    async (req, res) => {
      const { id } =
        req.params;

      if (
        !isValidObjectId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            error: {
              message:
                "Invalid blog ID.",
            },
          });
      }

      const post =
        await BlogPost.findOne({
          _id: id,

          isDeleted: true,
        });

      if (!post) {
        return res
          .status(404)
          .json({
            success: false,

            error: {
              message:
                "Deleted blog post not found.",
            },
          });
      }

      post.isDeleted =
        false;

      post.deletedAt =
        null;

      post.deletedBy =
        "";

      const restoredPost =
        await post.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Blog restored successfully.",

          data:
            restoredPost,
        });
    }
  );

/*
|--------------------------------------------------------------------------
| ADMIN - PERMANENT DELETE
|--------------------------------------------------------------------------
|
| Only use this for a blog already
| inside trash.
|
| Cloudinary image is deleted here.
|
*/

export const hardDeleteBlogPost =
  asyncHandler(
    async (req, res) => {
      const { id } =
        req.params;

      if (
        !isValidObjectId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            error: {
              message:
                "Invalid blog ID.",
            },
          });
      }

      const post =
        await BlogPost.findOne({
          _id: id,

          isDeleted: true,
        });

      if (!post) {
        return res
          .status(404)
          .json({
            success: false,

            error: {
              message:
                "Blog must be in trash before permanent deletion.",
            },
          });
      }

      if (
        post.cloudinaryPublicId
      ) {
        try {
          await deleteFile(
            post.cloudinaryPublicId
          );
        } catch (error) {
          console.error(
            "Cloudinary permanent delete error:",
            error
          );

          /*
           * Don't remove Mongo record
           * if Cloudinary deletion
           * failed.
           */

          return res
            .status(500)
            .json({
              success: false,

              error: {
                message:
                  "Unable to delete the blog image. Blog was not permanently deleted.",
              },
            });
        }
      }

      await BlogPost.deleteOne({
        _id: post._id,
      });

      /*
       * Optional cleanup of Redis
       * view keys is unnecessary
       * because they expire in 24h.
       */

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Blog permanently deleted.",
        });
    }
  );

/*
|--------------------------------------------------------------------------
| ADMIN - BLOG STATS
|--------------------------------------------------------------------------
*/

export const getBlogStats =
  asyncHandler(
    async (req, res) => {
      const [
        total,
        published,
        drafts,
        featured,
        editorChoice,
        deleted,
        viewsAggregation,
        topViewed,
      ] =
        await Promise.all([
          BlogPost.countDocuments({
            isDeleted: false,
          }),

          BlogPost.countDocuments({
            isDeleted: false,
            isPublished: true,
          }),

          BlogPost.countDocuments({
            isDeleted: false,
            isPublished: false,
          }),

          BlogPost.countDocuments({
            isDeleted: false,
            isFeatured: true,
          }),

          BlogPost.countDocuments({
            isDeleted: false,
            editorChoice: true,
          }),

          BlogPost.countDocuments({
            isDeleted: true,
          }),

          BlogPost.aggregate([
            {
              $match: {
                isDeleted:
                  false,
              },
            },

            {
              $group: {
                _id: null,

                totalViews: {
                  $sum:
                    "$views",
                },
              },
            },
          ]),

          BlogPost.find({
            isDeleted: false,
            isPublished: true,
          })
            .sort({
              views: -1,
            })
            .limit(5)
            .select(
              "title slug views imageUrl"
            )
            .lean(),
        ]);

      return res
        .status(200)
        .json({
          success: true,

          data: {
            total,
            published,
            drafts,
            featured,
            editorChoice,
            deleted,

            totalViews:
              viewsAggregation[0]
                ?.totalViews ||
              0,

            topViewed,
          },
        });
    }
  );

/*
|--------------------------------------------------------------------------
| PUBLIC - GET CATEGORIES
|--------------------------------------------------------------------------
|
| THIS IS THE EXPORT THAT WAS
| MISSING IN YOUR ERROR.
|
*/

export const getBlogCategories =
  asyncHandler(
    async (req, res) => {
      const categories =
        await BlogPost.distinct(
          "category",
          {
            isPublished:
              true,

            isDeleted:
              false,
          }
        );

      const cleanedCategories =
        categories
          .filter(Boolean)
          .sort(
            (a, b) =>
              String(a).localeCompare(
                String(b)
              )
          );

      return res
        .status(200)
        .json({
          success: true,

          data:
            cleanedCategories,
        });
    }
  );