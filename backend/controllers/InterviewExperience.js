import crypto from "crypto";
import mongoose from "mongoose";
import InterviewExperience from "../models/InterviewExperience.js";

const PAGE_SIZE = 25;

const SUBMISSION_LIMIT = 3;
const SUBMISSION_WINDOW_MS = 6 * 60 * 60 * 1000;

const ALLOWED_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "PUBLISHED",
  "ARCHIVED",
];

const ALLOWED_RESULTS = [
  "SELECTED",
  "REJECTED",
  "WAITING",
  "OFFER_DECLINED",
  "NOT_DISCLOSED",
];

const ALLOWED_DIFFICULTIES = [
  "EASY",
  "MEDIUM",
  "MEDIUM_HARD",
  "HARD",
  "NOT_SPECIFIED",
];

const ALLOWED_INTERVIEW_MODES = [
  "ONLINE",
  "OFFLINE",
  "HYBRID",
  "NOT_SPECIFIED",
];

const normalizeString = (value = "") => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const normalizeEmail = (value = "") => {
  return normalizeString(value).toLowerCase();
};

const normalizeSlug = (value = "") => {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const normalizeStringArray = (values = []) => {
  if (!Array.isArray(values)) {
    return [];
  }

  return [
    ...new Set(
      values
        .map((value) => normalizeString(value))
        .filter(Boolean)
    ),
  ];
};

const escapeRegex = (value = "") => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const isValidEmail = (email = "") => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidMobile = (mobile = "") => {
  return /^[+0-9()\-\s]{7,25}$/.test(mobile);
};

const getAdminId = (req) => {
  return (
    req.user?._id ||
    req.user?.id ||
    req.admin?._id ||
    req.admin?.id ||
    null
  );
};

const createIpHash = (req) => {
  const salt = process.env.INTERVIEW_IP_HASH_SALT;

  if (!salt) {
    return "";
  }

  const forwardedIp = req.headers["x-forwarded-for"];

  const ip = forwardedIp
    ? forwardedIp.toString().split(",")[0].trim()
    : req.ip || req.socket?.remoteAddress || "";

  if (!ip) {
    return "";
  }

  return crypto
    .createHash("sha256")
    .update(`${salt}:${ip}`)
    .digest("hex");
};

const createContentHash = (content = "") => {
  const normalized = content
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  return crypto
    .createHash("sha256")
    .update(normalized)
    .digest("hex");
};

const calculateSpamScore = ({
  title = "",
  content = "",
}) => {
  let score = 0;
  const reasons = [];

  const text = `${title} ${content}`.toLowerCase();

  const links =
    text.match(/https?:\/\/[^\s]+/g) || [];

  if (links.length >= 3) {
    score += 2;
    reasons.push("MULTIPLE_EXTERNAL_LINKS");
  }

  if (links.length >= 6) {
    score += 3;
    reasons.push("EXCESSIVE_EXTERNAL_LINKS");
  }

  const promotionalTerms = [
    "join my telegram",
    "join telegram",
    "telegram channel",
    "whatsapp me",
    "whatsapp group",
    "buy my course",
    "buy course",
    "limited offer",
    "dm me",
    "contact me on telegram",
    "earn money",
    "subscribe my channel",
    "subscribe to my channel",
    "follow my instagram",
  ];

  promotionalTerms.forEach((term) => {
    if (text.includes(term)) {
      score += 2;
      reasons.push(`PROMOTIONAL_TERM:${term}`);
    }
  });

  if (content.trim().length < 100) {
    score += 2;
    reasons.push("VERY_SHORT_CONTENT");
  }

  const repeatedCharacterPattern =
    /(.)\1{10,}/;

  if (repeatedCharacterPattern.test(content)) {
    score += 2;
    reasons.push("REPEATED_CHARACTERS");
  }

  return {
    score,
    reasons: [...new Set(reasons)],
  };
};

const checkSubmissionRateLimit = async ({
  email,
  ipHash,
}) => {
  const since = new Date(
    Date.now() - SUBMISSION_WINDOW_MS
  );

  const identifiers = [];

  if (email) {
    identifiers.push({
      "user.email": email,
    });
  }

  if (ipHash) {
    identifiers.push({
      "submissionMeta.ipHash": ipHash,
    });
  }

  if (!identifiers.length) {
    return {
      allowed: true,
      remaining: SUBMISSION_LIMIT,
      count: 0,
    };
  }

  const submissions =
    await InterviewExperience.find({
      createdAt: {
        $gte: since,
      },
      $or: identifiers,
    })
      .select("createdAt")
      .sort({
        createdAt: 1,
      })
      .lean();

  const count = submissions.length;

  if (count < SUBMISSION_LIMIT) {
    return {
      allowed: true,
      remaining: SUBMISSION_LIMIT - count,
      count,
    };
  }

  const oldestSubmission =
    submissions[0];

  const allowedAgainAt = new Date(
    new Date(
      oldestSubmission.createdAt
    ).getTime() +
      SUBMISSION_WINDOW_MS
  );

  const retryAfterMs = Math.max(
    allowedAgainAt.getTime() -
      Date.now(),
    0
  );

  return {
    allowed: false,
    remaining: 0,
    count,
    allowedAgainAt,
    retryAfterSeconds:
      Math.ceil(retryAfterMs / 1000),
    retryAfterMinutes:
      Math.ceil(
        retryAfterMs / (60 * 1000)
      ),
  };
};

const applyStatusMetadata = (
  interview,
  status,
  adminId = null
) => {
  const now = new Date();

  interview.status = status;

  interview.moderation.reviewedAt = now;

  if (adminId) {
    interview.moderation.reviewedBy =
      adminId;
  }

  if (status === "ACCEPTED") {
    interview.moderation.acceptedAt =
      interview.moderation.acceptedAt ||
      now;

    interview.moderation.archivedAt =
      null;
  }

  if (status === "PUBLISHED") {
    interview.moderation.acceptedAt =
      interview.moderation.acceptedAt ||
      now;

    interview.moderation.publishedAt =
      interview.moderation.publishedAt ||
      now;

    interview.moderation.archivedAt =
      null;
  }

  if (status === "ARCHIVED") {
    interview.moderation.archivedAt =
      now;
  }

  if (status === "PENDING") {
    interview.moderation.archivedAt =
      null;
  }
};

const serializePublicInterview = (document) => {
  const interview =
    typeof document.toObject === "function"
      ? document.toObject()
      : { ...document };

  const user = interview.user || {};

  interview.author = {
    name: user.isAnonymous
      ? "Anonymous"
      : user.publicName ||
        user.name ||
        "Anonymous",

    isAnonymous:
      user.isAnonymous !== false,
  };

  interview.publishedAt =
    interview?.moderation?.publishedAt ||
    interview.createdAt;

  delete interview.user;
  delete interview.originalContent;
  delete interview.moderation;
  delete interview.submissionMeta;

  return interview;
};

export const addInterviewExperience =
  async (req, res) => {
    try {
      const {
        title,
        company,
        role,

        name,
        email,
        mobile,

        isAnonymous = true,
        publicName = "",

        experienceYears,
        experienceMonths,

        location,
        country,

        interviewDate,
        applicationSource,
        interviewMode,
        difficulty,
        result,

        content,
        originalContent,
      } = req.body;

      const normalizedTitle =
        normalizeString(title);

      const companyName =
        typeof company === "string"
          ? normalizeString(company)
          : normalizeString(
              company?.name
            );

      const roleTitle =
        typeof role === "string"
          ? normalizeString(role)
          : normalizeString(
              role?.title
            );

      const normalizedName =
        normalizeString(name);

      const normalizedEmail =
        normalizeEmail(email);

      const normalizedMobile =
        normalizeString(mobile);

      const interviewContent =
        normalizeString(
          originalContent ||
            content
        );

      if (!normalizedTitle) {
        return res.status(400).json({
          success: false,
          message:
            "Interview title is required.",
        });
      }

      if (
        normalizedTitle.length < 10
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide a more descriptive title.",
        });
      }

      if (!companyName) {
        return res.status(400).json({
          success: false,
          message:
            "Company name is required.",
        });
      }

      if (!roleTitle) {
        return res.status(400).json({
          success: false,
          message:
            "Role is required.",
        });
      }

      if (!normalizedName) {
        return res.status(400).json({
          success: false,
          message:
            "Name is required.",
        });
      }

      if (
        !normalizedEmail ||
        !isValidEmail(
          normalizedEmail
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide a valid email.",
        });
      }

      if (
        !normalizedMobile ||
        !isValidMobile(
          normalizedMobile
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide a valid mobile number.",
        });
      }

      if (
        !interviewContent ||
        interviewContent.length < 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please write at least 100 characters about your interview experience.",
        });
      }

      let parsedYears = null;

      if (
        experienceYears !== undefined &&
        experienceYears !== null &&
        experienceYears !== ""
      ) {
        parsedYears =
          Number(experienceYears);

        if (
          !Number.isFinite(
            parsedYears
          ) ||
          parsedYears < 0 ||
          parsedYears > 50
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Experience years must be between 0 and 50.",
            });
        }
      }

      let parsedMonths = null;

      if (
        experienceMonths !==
          undefined &&
        experienceMonths !== null &&
        experienceMonths !== ""
      ) {
        parsedMonths =
          Number(
            experienceMonths
          );

        if (
          !Number.isFinite(
            parsedMonths
          ) ||
          parsedMonths < 0 ||
          parsedMonths > 11
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Experience months must be between 0 and 11.",
            });
        }
      }

      const ipHash =
        createIpHash(req);

      const rateLimit =
        await checkSubmissionRateLimit(
          {
            email:
              normalizedEmail,
            ipHash,
          }
        );

      if (!rateLimit.allowed) {
        res.set(
          "Retry-After",
          String(
            rateLimit.retryAfterSeconds
          )
        );

        return res
          .status(429)
          .json({
            success: false,

            code:
              "INTERVIEW_SUBMISSION_LIMIT",

            message:
              "You can submit a maximum of 3 interview experiences within 6 hours.",

            retryAfterMinutes:
              rateLimit.retryAfterMinutes,

            allowedAgainAt:
              rateLimit.allowedAgainAt,
          });
      }

      const duplicateSince =
        new Date(
          Date.now() -
            10 * 60 * 1000
        );

      const duplicate =
        await InterviewExperience.findOne(
          {
            "user.email":
              normalizedEmail,

            "company.slug":
              normalizeSlug(
                companyName
              ),

            "role.slug":
              normalizeSlug(
                roleTitle
              ),

            createdAt: {
              $gte:
                duplicateSince,
            },
          }
        ).select("_id");

      if (duplicate) {
        return res.status(409).json({
          success: false,

          code:
            "DUPLICATE_SUBMISSION",

          message:
            "A similar interview experience was submitted recently.",
        });
      }

      const exactContentDuplicate =
        await InterviewExperience.findOne(
          {
            originalContent:
              interviewContent,

            createdAt: {
              $gte: new Date(
                Date.now() -
                  24 *
                    60 *
                    60 *
                    1000
              ),
            },
          }
        ).select("_id");

      if (
        exactContentDuplicate
      ) {
        return res.status(409).json({
          success: false,

          code:
            "DUPLICATE_CONTENT",

          message:
            "This interview experience appears to have already been submitted.",
        });
      }

      const spam =
        calculateSpamScore({
          title:
            normalizedTitle,

          content:
            interviewContent,
        });

      const interview =
        new InterviewExperience({
          title:
            normalizedTitle,

          company: {
            name: companyName,
          },

          role: {
            title: roleTitle,
          },

          user: {
            name:
              normalizedName,

            email:
              normalizedEmail,

            mobile:
              normalizedMobile,

            isAnonymous:
              Boolean(
                isAnonymous
              ),

            publicName:
              normalizeString(
                publicName
              ),
          },

          interviewInfo: {
            experienceYears:
              parsedYears,

            experienceMonths:
              parsedMonths,

            location:
              normalizeString(
                location
              ),

            country:
              normalizeString(
                country
              ),

            interviewDate:
              interviewDate ||
              null,

            applicationSource:
              normalizeString(
                applicationSource
              ),

            interviewMode:
              ALLOWED_INTERVIEW_MODES.includes(
                interviewMode
              )
                ? interviewMode
                : "NOT_SPECIFIED",

            difficulty:
              ALLOWED_DIFFICULTIES.includes(
                difficulty
              )
                ? difficulty
                : "NOT_SPECIFIED",

            result:
              ALLOWED_RESULTS.includes(
                result
              )
                ? result
                : "NOT_DISCLOSED",
          },

          originalContent:
            interviewContent,

          contentMarkdown:
            interviewContent,

          status: "PENDING",

          submissionMeta: {
            source: "USER",

            ipHash,

            userAgent:
              req.get(
                "user-agent"
              ) || "",

            referrer:
              req.get(
                "referer"
              ) || "",

            spamScore:
              spam.score,

            spamReasons:
              spam.reasons,
          },
        });

      await interview.save();

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Your interview experience has been submitted successfully and is waiting for review.",

          data: {
            id:
              interview._id,

            title:
              interview.title,

            company:
              interview.company
                .name,

            role:
              interview.role
                .title,

            status:
              interview.status,

            submissionsRemaining:
              Math.max(
                rateLimit.remaining -
                  1,
                0
              ),

            createdAt:
              interview.createdAt,
          },
        });
    } catch (error) {
      console.error(
        "addInterviewExperience:",
        error
      );

      if (error?.code === 11000) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "An interview experience with this URL already exists.",
          });
      }

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to submit interview experience.",
        });
    }
  };

export const getAllInterviewExperience =
  async (req, res) => {
    try {
      const page = Math.max(
        Number(req.query.page) || 1,
        1
      );

      const {
        company,
        role,
        topic,
        technology,
        location,
        result,
        difficulty,
        q,
      } = req.query;

      const filter = {
        status: "PUBLISHED",
      };

      if (company) {
        filter["company.slug"] =
          normalizeSlug(company);
      }

      if (role) {
        filter["role.slug"] =
          normalizeSlug(role);
      }

      if (topic) {
        filter.topicSlugs =
          normalizeSlug(topic);
      }

      if (technology) {
        filter.technologySlugs =
          normalizeSlug(
            technology
          );
      }

      if (location) {
        filter[
          "interviewInfo.locationSlug"
        ] = normalizeSlug(
          location
        );
      }

      if (result) {
        const value = result
          .toString()
          .toUpperCase();

        if (
          ALLOWED_RESULTS.includes(
            value
          )
        ) {
          filter[
            "interviewInfo.result"
          ] = value;
        }
      }

      if (difficulty) {
        const value = difficulty
          .toString()
          .toUpperCase();

        if (
          ALLOWED_DIFFICULTIES.includes(
            value
          )
        ) {
          filter[
            "interviewInfo.difficulty"
          ] = value;
        }
      }

      if (
        q &&
        normalizeString(q)
      ) {
        const regex =
          new RegExp(
            escapeRegex(
              normalizeString(q)
            ),
            "i"
          );

        filter.$or = [
          {
            title: regex,
          },
          {
            "company.name":
              regex,
          },
          {
            "role.title":
              regex,
          },
          {
            topics: regex,
          },
          {
            technologies:
              regex,
          },
          {
            tags: regex,
          },
        ];
      }

      const skip =
        (page - 1) *
        PAGE_SIZE;

      const [
        interviews,
        total,
      ] =
        await Promise.all([
          InterviewExperience.find(
            filter
          )
            .select(
              [
                "title",
                "slug",
                "company",
                "role",

                "user.name",
                "user.publicName",
                "user.isAnonymous",

                "interviewInfo",

                "summaryMarkdown",

                "topics",
                "technologies",
                "tags",

                "engagement",

                "readingTimeMinutes",

                "featured",
                "editorPick",

                "moderation.publishedAt",

                "createdAt",
                "updatedAt",
              ].join(" ")
            )
            .sort({
              featured: -1,
              displayPriority: -1,
              "moderation.publishedAt":
                -1,
              createdAt: -1,
            })
            .skip(skip)
            .limit(PAGE_SIZE)
            .lean(),

          InterviewExperience.countDocuments(
            filter
          ),
        ]);

      return res
        .status(200)
        .json({
          success: true,

          pagination: {
            page,
            limit: PAGE_SIZE,
            total,

            totalPages:
              Math.ceil(
                total /
                  PAGE_SIZE
              ),

            hasNextPage:
              page *
                PAGE_SIZE <
              total,

            hasPreviousPage:
              page > 1,
          },

          data:
            interviews.map(
              serializePublicInterview
            ),
        });
    } catch (error) {
      console.error(
        "getAllInterviewExperience:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to fetch interview experiences.",
        });
    }
  };

export const getInterviewExperienceBySlug =
  async (req, res) => {
    try {
      const slug =
        normalizeSlug(
          req.params.slug
        );

      const interview =
        await InterviewExperience.findOne(
          {
            slug,
            status:
              "PUBLISHED",
          }
        ).lean();

      if (!interview) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Interview experience not found.",
          });
      }

      await InterviewExperience.updateOne(
        {
          _id:
            interview._id,
        },
        {
          $inc: {
            "engagement.views":
              1,
          },
        }
      );

      interview.engagement =
        interview.engagement ||
        {};

      interview.engagement.views =
        (interview
          .engagement.views ||
          0) + 1;

      return res
        .status(200)
        .json({
          success: true,

          data:
            serializePublicInterview(
              interview
            ),
        });
    } catch (error) {
      console.error(
        "getInterviewExperienceBySlug:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to fetch interview experience.",
        });
    }
  };

export const getInterviewFilterOptions =
  async (req, res) => {
    try {
      const filter = {
        status: "PUBLISHED",
      };

      const [
        companies,
        roles,
        locations,
        topics,
        technologies,
        tags,
      ] =
        await Promise.all([
          InterviewExperience.distinct(
            "company.name",
            filter
          ),

          InterviewExperience.distinct(
            "role.title",
            filter
          ),

          InterviewExperience.distinct(
            "interviewInfo.location",
            filter
          ),

          InterviewExperience.distinct(
            "topics",
            filter
          ),

          InterviewExperience.distinct(
            "technologies",
            filter
          ),

          InterviewExperience.distinct(
            "tags",
            filter
          ),
        ]);

      const clean = (
        values
      ) =>
        values
          .filter(Boolean)
          .sort((a, b) =>
            a.localeCompare(b)
          );

      return res
        .status(200)
        .json({
          success: true,

          data: {
            companies:
              clean(
                companies
              ),

            roles:
              clean(roles),

            locations:
              clean(
                locations
              ),

            topics:
              clean(topics),

            technologies:
              clean(
                technologies
              ),

            tags:
              clean(tags),
          },
        });
    } catch (error) {
      console.error(
        "getInterviewFilterOptions:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to fetch interview filters.",
        });
    }
  };

export const getAllInterviewsForAdmin =
  async (req, res) => {
    try {
      const page = Math.max(
        Number(req.query.page) || 1,
        1
      );

      const {
        status,
        company,
        role,
        q,
        spamOnly,
      } = req.query;

      const filter = {};

      if (status) {
        const value = status
          .toString()
          .toUpperCase();

        if (
          !ALLOWED_STATUSES.includes(
            value
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Invalid status.",
            });
        }

        filter.status =
          value;
      }

      if (company) {
        filter[
          "company.slug"
        ] =
          normalizeSlug(
            company
          );
      }

      if (role) {
        filter[
          "role.slug"
        ] =
          normalizeSlug(
            role
          );
      }

      if (
        spamOnly ===
        "true"
      ) {
        filter[
          "submissionMeta.spamScore"
        ] = {
          $gte: 3,
        };
      }

      if (
        q &&
        normalizeString(q)
      ) {
        const regex =
          new RegExp(
            escapeRegex(
              normalizeString(
                q
              )
            ),
            "i"
          );

        filter.$or = [
          {
            title: regex,
          },

          {
            "company.name":
              regex,
          },

          {
            "role.title":
              regex,
          },

          {
            "user.name":
              regex,
          },

          {
            "user.email":
              regex,
          },

          {
            "user.mobile":
              regex,
          },
        ];
      }

      const skip =
        (page - 1) *
        PAGE_SIZE;

      const [
        interviews,
        total,
      ] =
        await Promise.all([
          InterviewExperience.find(
            filter
          )
            .select(
              [
                "+user.email",
                "+user.mobile",

                "+moderation.adminNotes",

                "+submissionMeta.ipHash",
                "+submissionMeta.userAgent",
                "+submissionMeta.referrer",
                "+submissionMeta.spamScore",
                "+submissionMeta.spamReasons",
              ].join(" ")
            )
            .sort({
              createdAt: -1,
            })
            .skip(skip)
            .limit(PAGE_SIZE)
            .lean(),

          InterviewExperience.countDocuments(
            filter
          ),
        ]);

      return res
        .status(200)
        .json({
          success: true,

          pagination: {
            page,
            limit:
              PAGE_SIZE,

            total,

            totalPages:
              Math.ceil(
                total /
                  PAGE_SIZE
              ),

            hasNextPage:
              page *
                PAGE_SIZE <
              total,

            hasPreviousPage:
              page > 1,
          },

          data:
            interviews,
        });
    } catch (error) {
      console.error(
        "getAllInterviewsForAdmin:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to fetch interview experiences.",
        });
    }
  };

export const getInterviewByIdForAdmin =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid interview ID.",
          });
      }

      const interview =
        await InterviewExperience.findById(
          id
        ).select(
          [
            "+user.email",
            "+user.mobile",

            "+moderation.adminNotes",

            "+submissionMeta.ipHash",
            "+submissionMeta.userAgent",
            "+submissionMeta.referrer",
            "+submissionMeta.spamScore",
            "+submissionMeta.spamReasons",
          ].join(" ")
        );

      if (!interview) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Interview experience not found.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,
          data:
            interview,
        });
    } catch (error) {
      console.error(
        "getInterviewByIdForAdmin:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to fetch interview experience.",
        });
    }
  };

export const updateInterviewByAdmin =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid interview ID.",
          });
      }

      const interview =
        await InterviewExperience.findById(
          id
        ).select(
          [
            "+user.email",
            "+user.mobile",
            "+moderation.adminNotes",
          ].join(" ")
        );

      if (!interview) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Interview experience not found.",
          });
      }

      const body =
        req.body || {};

      if (
        body.title !==
        undefined
      ) {
        const title =
          normalizeString(
            body.title
          );

        if (!title) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Title cannot be empty.",
            });
        }

        interview.title =
          title;
      }

      if (
        body.slug !==
        undefined
      ) {
        const slug =
          normalizeSlug(
            body.slug
          );

        if (!slug) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Slug cannot be empty.",
            });
        }

        const existing =
          await InterviewExperience.findOne(
            {
              slug,

              _id: {
                $ne:
                  interview._id,
              },
            }
          ).select("_id");

        if (existing) {
          return res
            .status(409)
            .json({
              success: false,
              message:
                "This slug is already in use.",
            });
        }

        interview.slug =
          slug;

        if (
          !body.seo
            ?.canonicalPath
        ) {
          interview.seo.canonicalPath =
            `/interviews/${slug}`;
        }
      }

      if (
        body.company?.name !==
        undefined
      ) {
        const companyName =
          normalizeString(
            body.company.name
          );

        if (!companyName) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Company name cannot be empty.",
            });
        }

        interview.company.name =
          companyName;
      }

      if (
        body.company
          ?.logoUrl !==
        undefined
      ) {
        interview.company.logoUrl =
          normalizeString(
            body.company
              .logoUrl
          );
      }

      if (
        body.role?.title !==
        undefined
      ) {
        const roleTitle =
          normalizeString(
            body.role.title
          );

        if (!roleTitle) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Role cannot be empty.",
            });
        }

        interview.role.title =
          roleTitle;
      }

      if (
        body.role
          ?.category !==
        undefined
      ) {
        interview.role.category =
          normalizeString(
            body.role
              .category
          );
      }

      if (
        body.role?.level !==
        undefined
      ) {
        interview.role.level =
          normalizeString(
            body.role.level
          );
      }

      if (
        body.user?.name !==
        undefined
      ) {
        interview.user.name =
          normalizeString(
            body.user.name
          );
      }

      if (
        body.user
          ?.publicName !==
        undefined
      ) {
        interview.user.publicName =
          normalizeString(
            body.user
              .publicName
          );
      }

      if (
        body.user
          ?.isAnonymous !==
        undefined
      ) {
        interview.user.isAnonymous =
          Boolean(
            body.user
              .isAnonymous
          );
      }

      if (
        body.user?.email !==
        undefined
      ) {
        const email =
          normalizeEmail(
            body.user.email
          );

        if (
          !isValidEmail(
            email
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Invalid email address.",
            });
        }

        interview.user.email =
          email;
      }

      if (
        body.user?.mobile !==
        undefined
      ) {
        const mobile =
          normalizeString(
            body.user.mobile
          );

        if (
          !isValidMobile(
            mobile
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Invalid mobile number.",
            });
        }

        interview.user.mobile =
          mobile;
      }

      if (
        body.interviewInfo
      ) {
        const info =
          body.interviewInfo;

        if (
          info.experienceYears !==
          undefined
        ) {
          if (
            info.experienceYears ===
              "" ||
            info.experienceYears ===
              null
          ) {
            interview.interviewInfo.experienceYears =
              null;
          } else {
            const value =
              Number(
                info.experienceYears
              );

            if (
              !Number.isFinite(
                value
              ) ||
              value < 0 ||
              value > 50
            ) {
              return res
                .status(400)
                .json({
                  success:
                    false,
                  message:
                    "Experience years must be between 0 and 50.",
                });
            }

            interview.interviewInfo.experienceYears =
              value;
          }
        }

        if (
          info.experienceMonths !==
          undefined
        ) {
          if (
            info.experienceMonths ===
              "" ||
            info.experienceMonths ===
              null
          ) {
            interview.interviewInfo.experienceMonths =
              null;
          } else {
            const value =
              Number(
                info.experienceMonths
              );

            if (
              !Number.isFinite(
                value
              ) ||
              value < 0 ||
              value > 11
            ) {
              return res
                .status(400)
                .json({
                  success:
                    false,
                  message:
                    "Experience months must be between 0 and 11.",
                });
            }

            interview.interviewInfo.experienceMonths =
              value;
          }
        }

        if (
          info.location !==
          undefined
        ) {
          interview.interviewInfo.location =
            normalizeString(
              info.location
            );
        }

        if (
          info.country !==
          undefined
        ) {
          interview.interviewInfo.country =
            normalizeString(
              info.country
            );
        }

        if (
          info.interviewDate !==
          undefined
        ) {
          interview.interviewInfo.interviewDate =
            info.interviewDate ||
            null;
        }

        if (
          info.applicationSource !==
          undefined
        ) {
          interview.interviewInfo.applicationSource =
            normalizeString(
              info.applicationSource
            );
        }

        if (
          info.interviewMode !==
          undefined
        ) {
          if (
            !ALLOWED_INTERVIEW_MODES.includes(
              info.interviewMode
            )
          ) {
            return res
              .status(400)
              .json({
                success:
                  false,
                message:
                  "Invalid interview mode.",
              });
          }

          interview.interviewInfo.interviewMode =
            info.interviewMode;
        }

        if (
          info.difficulty !==
          undefined
        ) {
          if (
            !ALLOWED_DIFFICULTIES.includes(
              info.difficulty
            )
          ) {
            return res
              .status(400)
              .json({
                success:
                  false,
                message:
                  "Invalid difficulty.",
              });
          }

          interview.interviewInfo.difficulty =
            info.difficulty;
        }

        if (
          info.result !==
          undefined
        ) {
          if (
            !ALLOWED_RESULTS.includes(
              info.result
            )
          ) {
            return res
              .status(400)
              .json({
                success:
                  false,
                message:
                  "Invalid interview result.",
              });
          }

          interview.interviewInfo.result =
            info.result;
        }
      }

      if (
        body.contentMarkdown !==
        undefined
      ) {
        interview.contentMarkdown =
          normalizeString(
            body.contentMarkdown
          );
      }

      if (
        body.summaryMarkdown !==
        undefined
      ) {
        interview.summaryMarkdown =
          normalizeString(
            body.summaryMarkdown
          );
      }

      if (
        body.preparationMarkdown !==
        undefined
      ) {
        interview.preparationMarkdown =
          normalizeString(
            body.preparationMarkdown
          );
      }

      if (
        body.adviceMarkdown !==
        undefined
      ) {
        interview.adviceMarkdown =
          normalizeString(
            body.adviceMarkdown
          );
      }

      if (
        body.keyTakeawaysMarkdown !==
        undefined
      ) {
        interview.keyTakeawaysMarkdown =
          normalizeString(
            body.keyTakeawaysMarkdown
          );
      }

      if (
        body.rounds !==
        undefined
      ) {
        if (
          !Array.isArray(
            body.rounds
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Rounds must be an array.",
            });
        }

        interview.rounds =
          body.rounds.map(
            (
              round,
              index
            ) => ({
              ...round,
              order:
                index + 1,
            })
          );
      }

      if (
        body.topics !==
        undefined
      ) {
        interview.topics =
          normalizeStringArray(
            body.topics
          );
      }

      if (
        body.technologies !==
        undefined
      ) {
        interview.technologies =
          normalizeStringArray(
            body.technologies
          );
      }

      if (
        body.tags !==
        undefined
      ) {
        interview.tags =
          normalizeStringArray(
            body.tags
          );
      }

      if (
        body.searchKeywords !==
        undefined
      ) {
        interview.searchKeywords =
          normalizeStringArray(
            body.searchKeywords
          );
      }

      if (body.seo) {
        if (
          body.seo.title !==
          undefined
        ) {
          interview.seo.title =
            normalizeString(
              body.seo.title
            );
        }

        if (
          body.seo.description !==
          undefined
        ) {
          interview.seo.description =
            normalizeString(
              body.seo
                .description
            );
        }

        if (
          body.seo.canonicalPath !==
          undefined
        ) {
          interview.seo.canonicalPath =
            normalizeString(
              body.seo
                .canonicalPath
            );
        }

        if (
          body.seo.ogTitle !==
          undefined
        ) {
          interview.seo.ogTitle =
            normalizeString(
              body.seo
                .ogTitle
            );
        }

        if (
          body.seo.ogDescription !==
          undefined
        ) {
          interview.seo.ogDescription =
            normalizeString(
              body.seo
                .ogDescription
            );
        }

        if (
          body.seo.ogImage !==
          undefined
        ) {
          interview.seo.ogImage =
            normalizeString(
              body.seo
                .ogImage
            );
        }
      }

      if (
        body.featured !==
        undefined
      ) {
        interview.featured =
          Boolean(
            body.featured
          );
      }

      if (
        body.editorPick !==
        undefined
      ) {
        interview.editorPick =
          Boolean(
            body.editorPick
          );
      }

      if (
        body.displayPriority !==
        undefined
      ) {
        const priority =
          Number(
            body.displayPriority
          );

        interview.displayPriority =
          Number.isFinite(
            priority
          )
            ? priority
            : 0;
      }

      if (
        body.adminNotes !==
        undefined
      ) {
        interview.moderation.adminNotes =
          normalizeString(
            body.adminNotes
          );
      }

      if (
        body.status !==
        undefined
      ) {
        const status =
          body.status
            .toString()
            .toUpperCase();

        if (
          !ALLOWED_STATUSES.includes(
            status
          )
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "Invalid interview status.",
            });
        }

        applyStatusMetadata(
          interview,
          status,
          getAdminId(
            req
          )
        );
      } else {
        interview.moderation.reviewedAt =
          new Date();

        const adminId =
          getAdminId(
            req
          );

        if (adminId) {
          interview.moderation.reviewedBy =
            adminId;
        }
      }

      await interview.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Interview experience updated successfully.",

          data:
            interview,
        });
    } catch (error) {
      console.error(
        "updateInterviewByAdmin:",
        error
      );

      if (error?.code === 11000) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "This interview slug already exists.",
          });
      }

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to update interview experience.",
        });
    }
  };

export const acceptInterviewExperience =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid interview ID.",
          });
      }

      const interview =
        await InterviewExperience.findById(
          id
        );

      if (!interview) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Interview experience not found.",
          });
      }

      applyStatusMetadata(
        interview,
        "ACCEPTED",
        getAdminId(req)
      );

      if (
        req.body
          ?.adminNotes !==
        undefined
      ) {
        interview.moderation.adminNotes =
          normalizeString(
            req.body
              .adminNotes
          );
      }

      await interview.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Interview experience accepted successfully.",

          data: {
            id:
              interview._id,
            status:
              interview.status,
            acceptedAt:
              interview
                .moderation
                .acceptedAt,
          },
        });
    } catch (error) {
      console.error(
        "acceptInterviewExperience:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to accept interview experience.",
        });
    }
  };

export const publishInterviewExperience =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid interview ID.",
          });
      }

      const interview =
        await InterviewExperience.findById(
          id
        );

      if (!interview) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Interview experience not found.",
          });
      }

      if (
        !normalizeString(
          interview.contentMarkdown
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Interview content is required before publishing.",
          });
      }

      applyStatusMetadata(
        interview,
        "PUBLISHED",
        getAdminId(req)
      );

      await interview.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Interview experience published successfully.",

          data: {
            id:
              interview._id,

            title:
              interview.title,

            slug:
              interview.slug,

            status:
              interview.status,

            publishedAt:
              interview
                .moderation
                .publishedAt,
          },
        });
    } catch (error) {
      console.error(
        "publishInterviewExperience:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to publish interview experience.",
        });
    }
  };

export const rejectInterviewExperience =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid interview ID.",
          });
      }

      const interview =
        await InterviewExperience.findById(
          id
        );

      if (!interview) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Interview experience not found.",
          });
      }

      applyStatusMetadata(
        interview,
        "ARCHIVED",
        getAdminId(req)
      );

      interview.moderation.adminNotes =
        normalizeString(
          req.body?.reason
        ) ||
        "Submission rejected by admin.";

      await interview.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Interview experience rejected and archived.",

          data: {
            id:
              interview._id,

            status:
              interview.status,

            archivedAt:
              interview
                .moderation
                .archivedAt,
          },
        });
    } catch (error) {
      console.error(
        "rejectInterviewExperience:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to reject interview experience.",
        });
    }
  };

export const softDeleteInterviewExperience =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid interview ID.",
          });
      }

      const interview =
        await InterviewExperience.findById(
          id
        );

      if (!interview) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Interview experience not found.",
          });
      }

      applyStatusMetadata(
        interview,
        "ARCHIVED",
        getAdminId(req)
      );

      if (
        req.body?.reason
      ) {
        interview.moderation.adminNotes =
          normalizeString(
            req.body.reason
          );
      }

      await interview.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Interview experience archived successfully.",

          data: {
            id:
              interview._id,

            status:
              interview.status,
          },
        });
    } catch (error) {
      console.error(
        "softDeleteInterviewExperience:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to archive interview experience.",
        });
    }
  };

export const restoreInterviewExperience =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid interview ID.",
          });
      }

      const interview =
        await InterviewExperience.findById(
          id
        );

      if (!interview) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Interview experience not found.",
          });
      }

      if (
        interview.status !==
        "ARCHIVED"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Only archived interview experiences can be restored.",
          });
      }

      applyStatusMetadata(
        interview,
        "ACCEPTED",
        getAdminId(req)
      );

      interview.moderation.archivedAt =
        null;

      await interview.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Interview experience restored successfully.",

          data: {
            id:
              interview._id,

            status:
              interview.status,
          },
        });
    } catch (error) {
      console.error(
        "restoreInterviewExperience:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to restore interview experience.",
        });
    }
  };

export const hardDeleteInterviewExperience =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid interview ID.",
          });
      }

      const interview =
        await InterviewExperience.findById(
          id
        ).select(
          "_id title status"
        );

      if (!interview) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Interview experience not found.",
          });
      }

      if (
        interview.status !==
        "ARCHIVED"
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Archive the interview experience before permanently deleting it.",
          });
      }

      await InterviewExperience.deleteOne(
        {
          _id: id,
        }
      );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Interview experience permanently deleted.",
        });
    } catch (error) {
      console.error(
        "hardDeleteInterviewExperience:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to permanently delete interview experience.",
        });
    }
  };

export const getInterviewAdminStats =
  async (req, res) => {
    try {
      const thirtyDaysAgo =
        new Date(
          Date.now() -
            30 *
              24 *
              60 *
              60 *
              1000
        );

      const [
        total,
        pending,
        accepted,
        published,
        archived,
        last30Days,
        suspectedSpam,
      ] =
        await Promise.all([
          InterviewExperience.countDocuments(),

          InterviewExperience.countDocuments(
            {
              status:
                "PENDING",
            }
          ),

          InterviewExperience.countDocuments(
            {
              status:
                "ACCEPTED",
            }
          ),

          InterviewExperience.countDocuments(
            {
              status:
                "PUBLISHED",
            }
          ),

          InterviewExperience.countDocuments(
            {
              status:
                "ARCHIVED",
            }
          ),

          InterviewExperience.countDocuments(
            {
              createdAt: {
                $gte:
                  thirtyDaysAgo,
              },
            }
          ),

          InterviewExperience.countDocuments(
            {
              "submissionMeta.spamScore":
                {
                  $gte: 3,
                },

              status:
                "PENDING",
            }
          ),
        ]);

      return res
        .status(200)
        .json({
          success: true,

          data: {
            total,
            pending,
            accepted,
            published,
            archived,

            submissionsLast30Days:
              last30Days,

            suspectedSpam,
          },
        });
    } catch (error) {
      console.error(
        "getInterviewAdminStats:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to fetch interview statistics.",
        });
    }
  };