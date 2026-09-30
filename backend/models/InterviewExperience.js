import mongoose from "mongoose";

const { Schema } = mongoose;

const normalizeSlug = (value = "") => {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const normalizeArray = (values = []) => {
  if (!Array.isArray(values)) {
    return [];
  }

  return [
    ...new Set(
      values
        .map((value) =>
          typeof value === "string"
            ? value.trim()
            : ""
        )
        .filter(Boolean)
    ),
  ];
};

/*
|--------------------------------------------------------------------------
| QUESTION SCHEMA
|--------------------------------------------------------------------------
|
| User does not have to provide this.
| Admin can structure questions later.
|
*/

const questionSchema = new Schema(
  {
    question: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    type: {
      type: String,
      default: "OTHER",
      trim: true,
      uppercase: true,
      maxlength: 100,
    },

    difficulty: {
      type: String,
      enum: [
        "EASY",
        "MEDIUM",
        "MEDIUM_HARD",
        "HARD",
        "NOT_SPECIFIED",
      ],
      default: "NOT_SPECIFIED",
    },

    topics: {
      type: [String],
      default: [],
    },

    topicSlugs: {
      type: [String],
      default: [],
    },

    descriptionMarkdown: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20000,
    },

    approachMarkdown: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20000,
    },

    followUps: {
      type: [String],
      default: [],
    },

    externalUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  }
);

/*
|--------------------------------------------------------------------------
| ROUND SCHEMA
|--------------------------------------------------------------------------
|
| Admin can convert raw interview content into structured rounds.
|
*/

const roundSchema = new Schema(
  {
    order: {
      type: Number,
      required: true,
      min: 1,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    type: {
      type: String,
      default: "OTHER",
      trim: true,
      uppercase: true,
      maxlength: 100,
    },

    durationMinutes: {
      type: Number,
      default: null,
      min: 0,
      max: 1440,
    },

    difficulty: {
      type: String,
      enum: [
        "EASY",
        "MEDIUM",
        "MEDIUM_HARD",
        "HARD",
        "NOT_SPECIFIED",
      ],
      default: "NOT_SPECIFIED",
    },

    mode: {
      type: String,
      enum: [
        "ONLINE",
        "OFFLINE",
        "HYBRID",
        "NOT_SPECIFIED",
      ],
      default: "NOT_SPECIFIED",
    },

    platform: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    contentMarkdown: {
      type: String,
      default: "",
      trim: true,
      maxlength: 30000,
    },

    topics: {
      type: [String],
      default: [],
    },

    topicSlugs: {
      type: [String],
      default: [],
    },

    questions: {
      type: [questionSchema],
      default: [],
    },

    takeawayMarkdown: {
      type: String,
      default: "",
      trim: true,
      maxlength: 15000,
    },
  },
  {
    _id: true,
  }
);

/*
|--------------------------------------------------------------------------
| INTERVIEW EXPERIENCE SCHEMA
|--------------------------------------------------------------------------
*/

const interviewExperienceSchema = new Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | BASIC INFORMATION
    |--------------------------------------------------------------------------
    */

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      maxlength: 300,
    },

    /*
    |--------------------------------------------------------------------------
    | COMPANY
    |--------------------------------------------------------------------------
    |
    | No separate Company collection.
    |
    */

    company: {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
      },

      slug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
      },

      logoUrl: {
        type: String,
        default: "",
        trim: true,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | ROLE
    |--------------------------------------------------------------------------
    |
    | No separate Role collection.
    |
    */

    role: {
      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
      },

      slug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true,
      },

      category: {
        type: String,
        default: "",
        trim: true,
        maxlength: 150,
      },

      level: {
        type: String,
        default: "",
        trim: true,
        maxlength: 100,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | USER INFORMATION
    |--------------------------------------------------------------------------
    |
    | Email and mobile are private.
    | Public APIs should never return them.
    |
    */

    user: {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        maxlength: 200,
        select: false,
      },

      mobile: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30,
        select: false,
      },

      isAnonymous: {
        type: Boolean,
        default: true,
      },

      publicName: {
        type: String,
        default: "",
        trim: true,
        maxlength: 120,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | INTERVIEW BASIC INFORMATION
    |--------------------------------------------------------------------------
    */

    interviewInfo: {
      experienceYears: {
        type: Number,
        default: null,
        min: 0,
        max: 50,
      },

      experienceMonths: {
        type: Number,
        default: null,
        min: 0,
        max: 11,
      },

      location: {
        type: String,
        default: "",
        trim: true,
        maxlength: 200,
      },

      locationSlug: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,
        index: true,
      },

      country: {
        type: String,
        default: "",
        trim: true,
        maxlength: 120,
      },

      countrySlug: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,
      },

      interviewDate: {
        type: Date,
        default: null,
      },

      applicationSource: {
        type: String,
        default: "",
        trim: true,
        maxlength: 150,
      },

      interviewMode: {
        type: String,
        enum: [
          "ONLINE",
          "OFFLINE",
          "HYBRID",
          "NOT_SPECIFIED",
        ],
        default: "NOT_SPECIFIED",
      },

      difficulty: {
        type: String,
        enum: [
          "EASY",
          "MEDIUM",
          "MEDIUM_HARD",
          "HARD",
          "NOT_SPECIFIED",
        ],
        default: "NOT_SPECIFIED",
        index: true,
      },

      result: {
        type: String,
        enum: [
          "SELECTED",
          "REJECTED",
          "WAITING",
          "OFFER_DECLINED",
          "NOT_DISCLOSED",
        ],
        default: "NOT_DISCLOSED",
        index: true,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | ORIGINAL USER CONTENT
    |--------------------------------------------------------------------------
    |
    | Never change this after creation.
    |
    | This lets you always know exactly what the user submitted even when
    | the admin modifies the final published content.
    |
    */

    originalContent: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50000,
      immutable: true,
    },

    /*
    |--------------------------------------------------------------------------
    | ADMIN EDITABLE / PUBLIC CONTENT
    |--------------------------------------------------------------------------
    */

    contentMarkdown: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50000,
    },

    summaryMarkdown: {
      type: String,
      default: "",
      trim: true,
      maxlength: 10000,
    },

    preparationMarkdown: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20000,
    },

    adviceMarkdown: {
      type: String,
      default: "",
      trim: true,
      maxlength: 20000,
    },

    keyTakeawaysMarkdown: {
      type: String,
      default: "",
      trim: true,
      maxlength: 15000,
    },

    /*
    |--------------------------------------------------------------------------
    | STRUCTURED INTERVIEW ROUNDS
    |--------------------------------------------------------------------------
    */

    rounds: {
      type: [roundSchema],
      default: [],
    },

    totalRounds: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | TOPICS
    |--------------------------------------------------------------------------
    */

    topics: {
      type: [String],
      default: [],
    },

    topicSlugs: {
      type: [String],
      default: [],
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | TECHNOLOGIES
    |--------------------------------------------------------------------------
    */

    technologies: {
      type: [String],
      default: [],
    },

    technologySlugs: {
      type: [String],
      default: [],
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | TAGS
    |--------------------------------------------------------------------------
    */

    tags: {
      type: [String],
      default: [],
    },

    tagSlugs: {
      type: [String],
      default: [],
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | SEARCH KEYWORDS
    |--------------------------------------------------------------------------
    |
    | For TargetTrek internal search.
    |
    */

    searchKeywords: {
      type: [String],
      default: [],
    },

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    |
    | PENDING
    |     ↓
    | ACCEPTED
    |     ↓
    | PUBLISHED
    |
    | Any post can later become ARCHIVED.
    |
    */

    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "PUBLISHED",
        "ARCHIVED",
      ],
      default: "PENDING",
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | SEO
    |--------------------------------------------------------------------------
    */

    seo: {
      title: {
        type: String,
        default: "",
        trim: true,
        maxlength: 120,
      },

      description: {
        type: String,
        default: "",
        trim: true,
        maxlength: 300,
      },

      canonicalPath: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },

      ogTitle: {
        type: String,
        default: "",
        trim: true,
        maxlength: 200,
      },

      ogDescription: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500,
      },

      ogImage: {
        type: String,
        default: "",
        trim: true,
      },

      robots: {
        type: String,
        enum: [
          "index,follow",
          "noindex,follow",
          "noindex,nofollow",
        ],
        default: "noindex,follow",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | ADMIN / MODERATION
    |--------------------------------------------------------------------------
    */

    moderation: {
      adminNotes: {
        type: String,
        default: "",
        trim: true,
        maxlength: 10000,
        select: false,
      },

      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      reviewedAt: {
        type: Date,
        default: null,
      },

      acceptedAt: {
        type: Date,
        default: null,
      },

      publishedAt: {
        type: Date,
        default: null,
        index: true,
      },

      archivedAt: {
        type: Date,
        default: null,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | ENGAGEMENT
    |--------------------------------------------------------------------------
    */

    engagement: {
      views: {
        type: Number,
        default: 0,
        min: 0,
      },

      helpful: {
        type: Number,
        default: 0,
        min: 0,
      },

      notHelpful: {
        type: Number,
        default: 0,
        min: 0,
      },

      reports: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | SUBMISSION METADATA
    |--------------------------------------------------------------------------
    |
    | Private.
    |
    | Used for:
    | - 3 submissions / 6 hours
    | - spam review
    |
    */

    submissionMeta: {
      source: {
        type: String,
        enum: [
          "USER",
          "ADMIN",
          "IMPORT",
        ],
        default: "USER",
      },

      ipHash: {
        type: String,
        default: "",
        select: false,
      },

      userAgent: {
        type: String,
        default: "",
        select: false,
      },

      referrer: {
        type: String,
        default: "",
        select: false,
      },

      spamScore: {
        type: Number,
        default: 0,
        min: 0,
        select: false,
      },

      spamReasons: {
        type: [String],
        default: [],
        select: false,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | CONTENT METRICS
    |--------------------------------------------------------------------------
    */

    readingTimeMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },

    wordCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | ADMIN DISPLAY OPTIONS
    |--------------------------------------------------------------------------
    */

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    editorPick: {
      type: Boolean,
      default: false,
      index: true,
    },

    displayPriority: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| NORMALIZE BEFORE VALIDATION
|--------------------------------------------------------------------------
*/

interviewExperienceSchema.pre(
  "validate",
  function (next) {
    /*
    |--------------------------------------------------------------------------
    | COMPANY
    |--------------------------------------------------------------------------
    */

    if (this.company?.name) {
      this.company.name =
        this.company.name.trim();

      this.company.slug =
        normalizeSlug(
          this.company.name
        );
    }

    /*
    |--------------------------------------------------------------------------
    | ROLE
    |--------------------------------------------------------------------------
    */

    if (this.role?.title) {
      this.role.title =
        this.role.title.trim();

      this.role.slug =
        normalizeSlug(
          this.role.title
        );
    }

    /*
    |--------------------------------------------------------------------------
    | LOCATION
    |--------------------------------------------------------------------------
    */

    if (
      this.interviewInfo
        ?.location
    ) {
      this.interviewInfo.location =
        this.interviewInfo.location.trim();

      this.interviewInfo.locationSlug =
        normalizeSlug(
          this.interviewInfo.location
        );
    } else if (
      this.interviewInfo
    ) {
      this.interviewInfo.locationSlug =
        "";
    }

    /*
    |--------------------------------------------------------------------------
    | COUNTRY
    |--------------------------------------------------------------------------
    */

    if (
      this.interviewInfo
        ?.country
    ) {
      this.interviewInfo.country =
        this.interviewInfo.country.trim();

      this.interviewInfo.countrySlug =
        normalizeSlug(
          this.interviewInfo.country
        );
    } else if (
      this.interviewInfo
    ) {
      this.interviewInfo.countrySlug =
        "";
    }

    /*
    |--------------------------------------------------------------------------
    | GENERATE UNIQUE SLUG
    |--------------------------------------------------------------------------
    |
    | Example:
    |
    | mastercard-ai-engineer-interview-experience-3fa421
    |
    */

    if (
      !this.slug &&
      this.title
    ) {
      const baseSlug =
        normalizeSlug(
          this.title
        );

      const shortId =
        this._id
          .toString()
          .slice(-6);

      this.slug =
        `${baseSlug}-${shortId}`;
    }

    /*
    |--------------------------------------------------------------------------
    | TOPICS
    |--------------------------------------------------------------------------
    */

    this.topics =
      normalizeArray(
        this.topics
      );

    this.topicSlugs =
      this.topics.map(
        normalizeSlug
      );

    /*
    |--------------------------------------------------------------------------
    | TECHNOLOGIES
    |--------------------------------------------------------------------------
    */

    this.technologies =
      normalizeArray(
        this.technologies
      );

    this.technologySlugs =
      this.technologies.map(
        normalizeSlug
      );

    /*
    |--------------------------------------------------------------------------
    | TAGS
    |--------------------------------------------------------------------------
    */

    this.tags =
      normalizeArray(
        this.tags
      );

    this.tagSlugs =
      this.tags.map(
        normalizeSlug
      );

    /*
    |--------------------------------------------------------------------------
    | SEARCH KEYWORDS
    |--------------------------------------------------------------------------
    */

    this.searchKeywords =
      normalizeArray(
        this.searchKeywords
      ).map((item) =>
        item.toLowerCase()
      );

    /*
    |--------------------------------------------------------------------------
    | ROUNDS
    |--------------------------------------------------------------------------
    */

    if (
      Array.isArray(
        this.rounds
      )
    ) {
      this.rounds.forEach(
        (round, index) => {
          round.order =
            index + 1;

          round.topics =
            normalizeArray(
              round.topics
            );

          round.topicSlugs =
            round.topics.map(
              normalizeSlug
            );

          if (
            Array.isArray(
              round.questions
            )
          ) {
            round.questions.forEach(
              (question) => {
                question.topics =
                  normalizeArray(
                    question.topics
                  );

                question.topicSlugs =
                  question.topics.map(
                    normalizeSlug
                  );

                question.followUps =
                  normalizeArray(
                    question.followUps
                  );
              }
            );
          }
        }
      );
    }

    this.totalRounds =
      Array.isArray(
        this.rounds
      )
        ? this.rounds.length
        : 0;

    /*
    |--------------------------------------------------------------------------
    | DEFAULT SEO
    |--------------------------------------------------------------------------
    */

    if (
      !this.seo.title
    ) {
      this.seo.title =
        `${this.title} | TargetTrek`;
    }

    if (
      !this.seo.description
    ) {
      this.seo.description =
        `Read this ${this.company.name} ${this.role.title} interview experience including interview rounds, questions, difficulty, preparation strategy and candidate insights.`;
    }

    if (
      !this.seo.canonicalPath
    ) {
      this.seo.canonicalPath =
        `/interviews/${this.slug}`;
    }

    if (
      !this.seo.ogTitle
    ) {
      this.seo.ogTitle =
        this.seo.title;
    }

    if (
      !this.seo.ogDescription
    ) {
      this.seo.ogDescription =
        this.seo.description;
    }

    /*
    |--------------------------------------------------------------------------
    | GOOGLE INDEXING
    |--------------------------------------------------------------------------
    |
    | Only published pages should be indexed.
    |
    */

    if (
      this.status ===
      "PUBLISHED"
    ) {
      this.seo.robots =
        "index,follow";
    } else {
      this.seo.robots =
        "noindex,follow";
    }

    /*
    |--------------------------------------------------------------------------
    | WORD COUNT + READING TIME
    |--------------------------------------------------------------------------
    */

    const content =
      this.contentMarkdown ||
      this.originalContent ||
      "";

    const plainText =
      content
        .replace(
          /[#*_>`~[\]()]/g,
          " "
        )
        .replace(
          /\s+/g,
          " "
        )
        .trim();

    const words =
      plainText
        ? plainText
            .split(" ")
            .filter(Boolean)
            .length
        : 0;

    this.wordCount =
      words;

    this.readingTimeMinutes =
      words > 0
        ? Math.max(
            1,
            Math.ceil(
              words / 220
            )
          )
        : 0;

    next();
  }
);

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Public listing
|--------------------------------------------------------------------------
*/

interviewExperienceSchema.index({
  status: 1,
  "moderation.publishedAt": -1,
});

/*
|--------------------------------------------------------------------------
| Company pages
|--------------------------------------------------------------------------
*/

interviewExperienceSchema.index({
  "company.slug": 1,
  status: 1,
  "moderation.publishedAt": -1,
});

/*
|--------------------------------------------------------------------------
| Role pages
|--------------------------------------------------------------------------
*/

interviewExperienceSchema.index({
  "role.slug": 1,
  status: 1,
  "moderation.publishedAt": -1,
});

/*
|--------------------------------------------------------------------------
| Location pages
|--------------------------------------------------------------------------
*/

interviewExperienceSchema.index({
  "interviewInfo.locationSlug": 1,
  status: 1,
  "moderation.publishedAt": -1,
});

/*
|--------------------------------------------------------------------------
| Topics
|--------------------------------------------------------------------------
*/

interviewExperienceSchema.index({
  topicSlugs: 1,
  status: 1,
});

/*
|--------------------------------------------------------------------------
| Technologies
|--------------------------------------------------------------------------
*/

interviewExperienceSchema.index({
  technologySlugs: 1,
  status: 1,
});

/*
|--------------------------------------------------------------------------
| Tags
|--------------------------------------------------------------------------
*/

interviewExperienceSchema.index({
  tagSlugs: 1,
  status: 1,
});

/*
|--------------------------------------------------------------------------
| Email rate-limit lookup
|--------------------------------------------------------------------------
*/

interviewExperienceSchema.index({
  "user.email": 1,
  createdAt: -1,
});

/*
|--------------------------------------------------------------------------
| Hashed IP rate-limit lookup
|--------------------------------------------------------------------------
*/

interviewExperienceSchema.index({
  "submissionMeta.ipHash": 1,
  createdAt: -1,
});

/*
|--------------------------------------------------------------------------
| Spam review
|--------------------------------------------------------------------------
*/

interviewExperienceSchema.index({
  "submissionMeta.spamScore": -1,
  status: 1,
});

/*
|--------------------------------------------------------------------------
| Featured content
|--------------------------------------------------------------------------
*/

interviewExperienceSchema.index({
  featured: -1,
  displayPriority: -1,
  "moderation.publishedAt": -1,
});

/*
|--------------------------------------------------------------------------
| MongoDB text search
|--------------------------------------------------------------------------
*/

interviewExperienceSchema.index({
  title: "text",
  "company.name": "text",
  "role.title": "text",
  contentMarkdown: "text",
  summaryMarkdown: "text",
  topics: "text",
  technologies: "text",
  tags: "text",
  searchKeywords: "text",
});

const InterviewExperience =
  mongoose.model(
    "InterviewExperience",
    interviewExperienceSchema
  );

export default InterviewExperience;