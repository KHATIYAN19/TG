import mongoose from "mongoose";

const blogPostSchema =
  new mongoose.Schema(
    {
      slug: {
        type: String,
        required: [
          true,
          "Slug is required.",
        ],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [
          3,
          "Slug must be at least 3 characters.",
        ],
        maxlength: [
          180,
          "Slug cannot exceed 180 characters.",
        ],
        match: [
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Slug must contain lowercase letters, numbers and hyphens only.",
        ],
      },

      title: {
        type: String,
        required: [
          true,
          "Title is required.",
        ],
        trim: true,
        minlength: [
          5,
          "Title must be at least 5 characters.",
        ],
        maxlength: [
          180,
          "Title cannot exceed 180 characters.",
        ],
      },

      excerpt: {
        type: String,
        required: [
          true,
          "Excerpt is required.",
        ],
        trim: true,
        minlength: [
          10,
          "Excerpt must be at least 10 characters.",
        ],
        maxlength: [
          500,
          "Excerpt cannot exceed 500 characters.",
        ],
      },

      content: {
        type: String,
        required: [
          true,
          "Blog content is required.",
        ],
      },

      author: {
        type: String,
        required: [
          true,
          "Author is required.",
        ],
        trim: true,
        minlength: [
          2,
          "Author name must be at least 2 characters.",
        ],
        maxlength: [
          100,
          "Author name cannot exceed 100 characters.",
        ],
      },

      imageUrl: {
        type: String,
        trim: true,
        default: "",
      },

      altText: {
        type: String,
        trim: true,
        maxlength: [
          200,
          "Alt text cannot exceed 200 characters.",
        ],
        default: "",
      },

      cloudinaryPublicId: {
        type: String,
        trim: true,
        default: "",
      },

      category: {
        type: String,
        required: [
          true,
          "Category is required.",
        ],
        trim: true,
        lowercase: true,
        maxlength: [
          80,
          "Category cannot exceed 80 characters.",
        ],
        index: true,
      },

      tags: {
        type: [String],

        required: [
          true,
          "At least one tag is required.",
        ],

        validate: {
          validator(tags) {
            return (
              Array.isArray(tags) &&
              tags.length > 0 &&
              tags.length <= 15
            );
          },

          message:
            "Blog must contain between 1 and 15 tags.",
        },

        set: (tags = []) => [
          ...new Set(
            tags
              .map((tag) =>
                String(tag)
                  .trim()
                  .toLowerCase()
              )
              .filter(Boolean)
          ),
        ],
      },

      isPublished: {
        type: Boolean,
        default: false,
        index: true,
      },

      publishedAt: {
        type: Date,
        default: null,
        index: true,
      },

      isFeatured: {
        type: Boolean,
        default: false,
        index: true,
      },

      editorChoice: {
        type: Boolean,
        default: false,
        index: true,
      },

      views: {
        type: Number,
        default: 0,
        min: 0,
        index: true,
      },

      readingTimeMinutes: {
        type: Number,
        default: 1,
        min: 1,
      },

      seo: {
        metaTitle: {
          type: String,
          trim: true,
          maxlength: 70,
          default: "",
        },

        metaDescription: {
          type: String,
          trim: true,
          maxlength: 180,
          default: "",
        },

        keywords: {
          type: [String],
          default: [],

          set: (
            keywords = []
          ) => [
            ...new Set(
              keywords
                .map(
                  (keyword) =>
                    String(
                      keyword
                    )
                      .trim()
                      .toLowerCase()
                )
                .filter(Boolean)
            ),
          ],
        },

        canonicalUrl: {
          type: String,
          trim: true,
          default: "",
        },

        ogImageUrl: {
          type: String,
          trim: true,
          default: "",
        },

        noIndex: {
          type: Boolean,
          default: false,
        },
      },

      isDeleted: {
        type: Boolean,
        default: false,
        index: true,
      },

      deletedAt: {
        type: Date,
        default: null,
      },

      deletedBy: {
        type: String,
        trim: true,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

blogPostSchema.pre(
  "save",
  function (next) {
    if (
      this.isPublished &&
      !this.publishedAt
    ) {
      this.publishedAt =
        new Date();
    }

    if (
      !this.altText &&
      this.title
    ) {
      this.altText =
        `${this.title} - TargetTrek`;
    }

    if (
      !this.seo?.metaTitle &&
      this.title
    ) {
      this.seo.metaTitle =
        this.title.substring(
          0,
          70
        );
    }

    if (
      !this.seo
        ?.metaDescription &&
      this.excerpt
    ) {
      this.seo.metaDescription =
        this.excerpt.substring(
          0,
          180
        );
    }

    if (this.content) {
      const plainText =
        String(this.content)
          .replace(
            /<[^>]*>/g,
            " "
          )
          .replace(
            /&nbsp;/g,
            " "
          )
          .replace(
            /\s+/g,
            " "
          )
          .trim();

      const wordCount =
        plainText
          ? plainText.split(
              /\s+/
            ).length
          : 0;

      this.readingTimeMinutes =
        Math.max(
          1,
          Math.ceil(
            wordCount / 220
          )
        );
    }

    next();
  }
);

blogPostSchema.index({
  isPublished: 1,
  isDeleted: 1,
  publishedAt: -1,
});

blogPostSchema.index({
  isPublished: 1,
  isDeleted: 1,
  views: -1,
});

blogPostSchema.index({
  category: 1,
  isPublished: 1,
  isDeleted: 1,
});

blogPostSchema.index({
  tags: 1,
  isPublished: 1,
  isDeleted: 1,
});

blogPostSchema.index({
  isFeatured: 1,
  isPublished: 1,
  isDeleted: 1,
});

blogPostSchema.index({
  editorChoice: 1,
  isPublished: 1,
  isDeleted: 1,
});

blogPostSchema.index({
  title: "text",
  excerpt: "text",
  tags: "text",
  category: "text",
});

const BlogPost =
  mongoose.model(
    "BlogPost",
    blogPostSchema
  );

export default BlogPost;