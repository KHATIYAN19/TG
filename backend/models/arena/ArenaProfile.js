import mongoose from "mongoose";

const { Schema } = mongoose;

export const TOPICS = [
  "HLD", "LLD", "DSA", "GENAI", "JAVA",
  "FRONTEND", "BACKEND", "FULLSTACK", "NODEJS", "PYTHON", "SQL",
  "DEVOPS", "CLOUD", "SRE", "SDET", "MOBILE",
  "DATAENG", "DATASCI", "CYBERSEC", "BEHAVIORAL",
];
export const LEVELS = ["beginner", "intermediate", "advanced"];
export const SLOTS = [
  "weekday_morning",
  "weekday_evening",
  "weekend_morning",
  "weekend_evening",
];
export const LANGUAGES = [
  "english", "hindi", "tamil", "telugu", "kannada", "malayalam", "marathi", "bengali", "gujarati", "punjabi", "other",
];
export const SESSION_MODES = ["chat", "voice", "video"];
export const BUDDY_PREFERENCES = ["similar_level", "more_experienced", "any"];
export const TIMELINES = ["within_1_month", "within_3_months", "within_6_months", "exploring"];
export const COMPANY_TYPES = [
  "student",
  "startup",
  "product",
  "service",
  "mnc",
  "other",
];

/*
  draft      – profile exists but has no paid, unused entry
  active     – paid entry, visible in the arena, can send/accept requests
  matched    – locked to one buddy
  suspended  – removed from the arena by an admin
*/
export const PROFILE_STATUSES = ["draft", "active", "matched", "suspended"];

const profileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Public, anonymous identifier shown instead of the real name.
    alias: { type: String, required: true, unique: true },

    // PRIVATE until the owner allows it after acceptance.
    realName: { type: String, required: true, trim: true, maxlength: 80 },
    contact: {
      _id: false,
      email: { type: String, trim: true, lowercase: true, default: "" },
      phone: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, maxlength: 200, default: "" },
    },

    // PUBLIC (anonymous) fields.
    topics: {
      type: [{ type: String, enum: TOPICS }],
      validate: (v) => Array.isArray(v) && v.length >= 1 && v.length <= 5,
    },
    level: { type: String, enum: LEVELS, required: true },
    skills: {
      type: [{ type: String, trim: true, maxlength: 30 }],
      validate: (v) => Array.isArray(v) && v.length >= 1 && v.length <= 12,
    },
    yearsExperience: { type: Number, min: 0, max: 40, default: 0 },
    companyType: { type: String, enum: COMPANY_TYPES, default: "other" },
    // Company name and job title are public (shown on arena cards).
    companyName: { type: String, trim: true, maxlength: 80, default: "" },
    designation: { type: String, trim: true, maxlength: 60, default: "" },
    targetCompanies: { type: [{ type: String, trim: true, maxlength: 40 }], default: [] },
    languages: { type: [{ type: String, enum: LANGUAGES }], default: ["english"] },
    sessionsPerWeek: { type: Number, min: 1, max: 7, default: 2 },
    sessionModes: { type: [{ type: String, enum: SESSION_MODES }], default: ["chat"] },
    buddyPreference: { type: String, enum: BUDDY_PREFERENCES, default: "any" },
    timeline: { type: String, enum: TIMELINES, default: "exploring" },
    availability: {
      type: [{ type: String, enum: SLOTS }],
      validate: (v) => Array.isArray(v) && v.length >= 1,
    },
    bio: { type: String, trim: true, maxlength: 400, default: "" },
    goal: { type: String, trim: true, maxlength: 200, default: "" },

    // What the OWNER agrees to reveal to their buddy once matched.
    shareSettings: {
      _id: false,
      name: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      phone: { type: Boolean, default: false },
      linkedin: { type: Boolean, default: false },
    },

    status: {
      type: String,
      enum: PROFILE_STATUSES,
      default: "draft",
      index: true,
    },
    // Temporarily invisible in the arena (not browsable, can't receive new
    // requests). Independent of `status`, so it survives matching/unmatching.
    hidden: { type: Boolean, default: false },
    hiddenBy: { type: String, enum: ["user", "admin", null], default: null },
    hiddenAt: { type: Date, default: null },

    statusBeforeSuspend: { type: String, default: null },
    suspendedReason: { type: String, default: null, maxlength: 500 },
    suspendedAt: { type: Date, default: null },
    suspendedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },

    entry: { type: Schema.Types.ObjectId, ref: "ArenaEntry", default: null },
    match: { type: Schema.Types.ObjectId, ref: "ArenaMatch", default: null },
    activatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Arena browse query.
profileSchema.index({ status: 1, topics: 1, level: 1, activatedAt: -1 });
profileSchema.index({ status: 1, skills: 1 });
profileSchema.index({ status: 1, hidden: 1, activatedAt: -1 });

export default mongoose.models.ArenaProfile ||
  mongoose.model("ArenaProfile", profileSchema);
