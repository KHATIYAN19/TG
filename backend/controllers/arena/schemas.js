import { z } from "zod";

import {
  TOPICS, LEVELS, SLOTS, COMPANY_TYPES, LANGUAGES, SESSION_MODES, BUDDY_PREFERENCES, TIMELINES,
} from "../../models/arena/ArenaProfile.js";
import { BUG_CATEGORIES, BUG_SEVERITIES, BUG_STATUSES } from "../../models/arena/ArenaBugReport.js";
import { REPORT_REASONS } from "../../models/arena/ArenaReport.js";
import { DEFAULT_DIAL, digitsOf, isKnownDial, mobileProblem } from "../../utils/phone.js";
import { detectContactInfo, CONTACT_INFO_MESSAGE } from "../../services/arena/privacy.js";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

/* Anonymous free text must not smuggle contact details. */
const anonymousText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((v) => detectContactInfo(v) === null, { message: CONTACT_INFO_MESSAGE });

/* Phone: a country code ("+91") and the national number. Clients that send only `mobile` get +91. */
/** Which site the person is on, so the right email is sent. Unknown or missing = the Arena one. */
export const sourceField = z.enum(["arena", "memories"]).catch("arena").default("arena");
export const countryCodeField = z
  .string()
  .trim()
  .default(DEFAULT_DIAL)
  .transform((v) => (v.startsWith("+") ? v : `+${v}`))
  .refine(isKnownDial, { message: "Choose a valid country code" });
export const mobileField = z.string().trim().min(1, "Enter your mobile number").max(20).transform(digitsOf);
/** Use after the object: z.object({ countryCode, mobile }).superRefine(checkMobile) */
export const checkMobile = (v, ctx) => {
  const problem = mobileProblem(v.countryCode, v.mobile);
  if (problem) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["mobile"], message: problem });
};

export const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/\d/, "Add a number")
  .regex(/[^A-Za-z0-9]/, "Add a special character");

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email").max(120),
    countryCode: countryCodeField,
    mobile: mobileField,
    source: sourceField,
    password: passwordRule,
    confirmPassword: z.string(),
  })
  .superRefine(checkMobile)
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const verifySignupSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const resendSignupSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  source: sourceField,
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(120),
  source: sourceField,
});

export const resetPasswordSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(120),
    otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
    password: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

const skill = z
  .string()
  .trim()
  .min(1)
  .max(30)
  .refine((v) => detectContactInfo(v) === null, { message: CONTACT_INFO_MESSAGE });

/* Company names / job titles are public but must not carry contact details. */
const publicEntity = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((v) => detectContactInfo(v, { entity: true }) === null, { message: CONTACT_INFO_MESSAGE });

const uniqueEnumList = (values, { min = 1, max, minMessage }) =>
  z
    .array(z.enum(values))
    .min(min, minMessage || `Pick at least ${min}`)
    .max(max, `Pick up to ${max}`)
    .transform((a) => [...new Set(a)]);

export const profileSchema = z.object({
  topics: uniqueEnumList(TOPICS, { max: 5, minMessage: "Pick at least one focus topic" }),
  level: z.enum(LEVELS),
  skills: z.array(skill).min(1, "Add at least one skill").max(12).transform((a) => [...new Set(a.map((s) => s.toLowerCase()))]),
  yearsExperience: z.coerce.number().int().min(0).max(40),
  companyType: z.enum(COMPANY_TYPES),
  companyName: publicEntity(80).optional().default(""),
  designation: publicEntity(60).optional().default(""),
  targetCompanies: z
    .array(publicEntity(40).pipe(z.string().min(1)))
    .max(8, "Up to 8 target companies")
    .optional()
    .default([])
    .transform((a) => [...new Set(a)]),
  languages: uniqueEnumList(LANGUAGES, { max: 6, minMessage: "Pick at least one language" }).default(["english"]),
  sessionsPerWeek: z.coerce.number().int().min(1).max(7).default(2),
  sessionModes: uniqueEnumList(SESSION_MODES, { max: 3, minMessage: "Pick at least one way to practise" }).default(["chat"]),
  buddyPreference: z.enum(BUDDY_PREFERENCES).default("any"),
  timeline: z.enum(TIMELINES).default("exploring"),
  availability: z.array(z.enum(SLOTS)).min(1, "Pick at least one time slot"),
  bio: anonymousText(400).optional().default(""),
  goal: anonymousText(200).optional().default(""),
  contact: z.object({
    email: z.string().trim().toLowerCase().email().or(z.literal("")).optional().default(""),
    phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit number").or(z.literal("")).optional().default(""),
    linkedin: z
      .string()
      .trim()
      .max(200)
      .refine((v) => v === "" || /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\//i.test(v), "Enter a valid LinkedIn URL")
      .optional()
      .default(""),
  }).default({}),
});

export const deleteAccountSchema = z
  .object({
    password: z.string().min(1, "Enter your password").max(128),
    confirmPassword: z.string().max(128),
    confirm: z.literal("DELETE", { errorMap: () => ({ message: "Type DELETE to confirm" }) }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

export const visibilitySchema = z.object({ hidden: z.boolean() });

export const editMessageSchema = z.object({ text: z.string().max(5000) });

export const reactionSchema = z.object({ emoji: z.string().max(16).nullable() });

export const shareSettingsSchema = z.object({
  name: z.boolean(),
  email: z.boolean(),
  phone: z.boolean(),
  linkedin: z.boolean(),
});

export const browseQuerySchema = z.object({
  topic: z.enum(TOPICS).optional(),
  language: z.enum(LANGUAGES).optional(),
  level: z.enum(LEVELS).optional(),
  slot: z.enum(SLOTS).optional(),
  skill: z.string().trim().toLowerCase().max(30).optional(),
  companyType: z.enum(COMPANY_TYPES).optional(),
  page: z.coerce.number().int().min(1).max(500).default(1),
});

export const sendRequestSchema = z.object({
  toProfileId: objectId,
  message: anonymousText(300).optional().default(""),
});

export const blockSchema = z.object({ profileId: objectId });

export const reportSchema = z.object({
  profileId: objectId,
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(1000).optional().default(""),
});

export const couponCodeSchema = z.object({
  code: z.string().trim().min(3).max(30),
});

export const checkoutSchema = z.object({
  couponCode: z.string().trim().max(30).optional().or(z.literal("")),
  // Referral code remembered by the browser (localStorage "referralCode"). Unknown codes are ignored.
  affiliateCode: z.string().trim().max(64).regex(/^[a-zA-Z0-9_-]*$/).optional(),
});

export const verifyPaymentSchema = z.object({
  // Our gateway order id (Cashfree order_id / Razorpay order_id).
  orderId: z.string().trim().min(5).max(64),
  // Razorpay popup only:
  paymentId: z.string().trim().min(5).max(64).optional(),
  signature: z.string().trim().min(10).max(256).optional(),
});

/* ---------------- admin ---------------- */

export const adminSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  // Admin enters rupees; stored as paise.
  entryPriceRupees: z.coerce.number().min(0).max(50000).optional(),
  cancellationFeePercent: z.coerce.number().min(0).max(100).optional(),
  maxOutgoingRequests: z.coerce.number().int().min(1).max(100).optional(),
  requestExpiryDays: z.coerce.number().int().min(1).max(90).optional(),
  minMatchDaysBeforeEnd: z.coerce.number().int().min(0).max(90).optional(),
  matchesPerEntry: z.coerce.number().int().min(1).max(5).optional(),
  cancelRefundEnabled: z.boolean().optional(),
  accountDeletionEnabled: z.boolean().optional(),
  memberVisibilityToggleEnabled: z.boolean().optional(),
  affiliateEnabled: z.boolean().optional(),
  offerEnabled: z.boolean().optional(),
  // ISO date-time, or null / "" for "no end date".
  offerEndsAt: z.union([z.string().datetime({ offset: true }), z.literal(""), z.null()]).optional(),
  offerText: z.string().trim().max(300).optional(),
});

export const bugReportSchema = z.object({
  category: z.enum(BUG_CATEGORIES),
  severity: z.enum(BUG_SEVERITIES).default("medium"),
  title: z.string().trim().min(5, "Give the bug a short title").max(120),
  description: z.string().trim().min(15, "Please describe what happened (at least a sentence)").max(2000),
  stepsToReproduce: z.string().trim().max(1500).optional().default(""),
  pageUrl: z.string().trim().max(300).optional().default(""),
});

export const adminAdjustMatchesSchema = z
  .object({
    action: z.enum(["add", "remove", "set"]),
    amount: z.coerce.number().int().min(0).max(100),
    reason: z.string().trim().max(300).optional().default(""),
  })
  .superRefine((v, ctx) => {
    if ((v.action === "add" || v.action === "remove") && v.amount < 1) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: "Enter at least 1" });
    }
  });

export const adminBugUpdateSchema = z.object({
  status: z.enum(BUG_STATUSES),
  adminNote: z.string().trim().max(1000).optional().default(""),
});

export const adminCouponSchema = z
  .object({
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,30}$/, "3–30 chars: A-Z, 0-9, - _"),
    description: z.string().trim().max(200).optional().default(""),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    // percent for PERCENTAGE, rupees for FIXED
    discountValue: z.coerce.number().positive(),
    maxDiscountRupees: z.coerce.number().min(0).nullable().optional(),
    validFrom: z.coerce.date().nullable().optional(),
    validUntil: z.coerce.date().nullable().optional(),
    usageLimit: z.coerce.number().int().min(1).nullable().optional(),
    perUserLimit: z.coerce.number().int().min(1).max(10).default(1),
    active: z.boolean().default(true),
  })
  .superRefine((v, ctx) => {
    if (v.discountType === "PERCENTAGE" && (v.discountValue > 100 || v.discountValue < 1)) {
      ctx.addIssue({ code: "custom", path: ["discountValue"], message: "Percentage must be 1–100" });
    }
    if (v.validFrom && v.validUntil && v.validUntil <= v.validFrom) {
      ctx.addIssue({ code: "custom", path: ["validUntil"], message: "End must be after start" });
    }
  });

export const adminSuspendSchema = z.object({ reason: z.string().trim().min(3).max(500) });

export const adminResolveReportSchema = z.object({
  status: z.enum(["actioned", "dismissed"]),
  resolution: z.string().trim().max(500).optional().default(""),
  suspendReported: z.boolean().optional().default(false),
});

export { objectId };
