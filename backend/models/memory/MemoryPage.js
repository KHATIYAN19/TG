import mongoose from "mongoose";

const { Schema } = mongoose;

const mediaSchema = new Schema(
  {
    kind: { type: String, enum: ["photo", "video", "audio"], required: true },
    key: { type: String, required: true }, // S3 object key (never a URL)
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    originalName: { type: String, maxlength: 200 },
    isMain: { type: Boolean, default: false },
    /* a few words shown under the picture, e.g. "Our first trip" (4 words at most; see cleanCaption in the user controller) */
    caption: { type: String, trim: true, maxlength: 40, default: "" },
    /* measured in the browser before upload (the server never opens the file). Lets the page lay a 16:9 video and a 9:16 video out differently. */
    width: { type: Number, min: 1, max: 20000, default: null },
    height: { type: Number, min: 1, max: 20000, default: null },
    durationSec: { type: Number, min: 0, max: 86400, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

/* a gift the sender wants the receiver to "unwrap" (e.g. "Movie date") */
const giftSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 60 },
    note: { type: String, trim: true, maxlength: 140, default: "" },
    emoji: { type: String, trim: true, maxlength: 8, default: "" },
  },
  { _id: true }
);

/* Anniversary: a moment in the couple's story, and a "love in numbers" fact */
const milestoneSchema = new Schema(
  {
    date: { type: String, trim: true, maxlength: 30, default: "" },
    title: { type: String, required: true, trim: true, maxlength: 60 },
    note: { type: String, trim: true, maxlength: 200, default: "" },
  },
  { _id: true }
);
const statSchema = new Schema(
  { label: { type: String, required: true, trim: true, maxlength: 28 }, value: { type: String, required: true, trim: true, maxlength: 16 } },
  { _id: true }
);

const memoryPageSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    occasion: { type: Schema.Types.ObjectId, ref: "MemoryOccasion", required: true },

    title: { type: String, required: true, trim: true, maxlength: 120 },
    recipientName: { type: String, required: true, trim: true, maxlength: 80 },
    senderName: { type: String, trim: true, maxlength: 80 },
    message: { type: String, maxlength: 10000 },

    /* the look of the page (a theme id for this occasion's template). Chosen by the sender. */
    style: { type: String, trim: true, maxlength: 30, default: "" },
    age: { type: Number, min: 1, max: 120, default: null },
    gifts: { type: [giftSchema], default: [] },
    wishes: { type: [{ type: String, trim: true, maxlength: 60 }], default: [] },
    /* promises the sender makes (Sorry pages show them as flip cards) */
    promises: { type: [{ type: String, trim: true, maxlength: 120 }], default: [] },
    /* Anniversary: "together since" (YYYY-MM-DD), their story, reasons they are loved, and love-in-numbers facts */
    since: { type: String, trim: true, maxlength: 10, default: "" },
    /* Proposal: the question itself, e.g. "Will you marry me?" / "Will you be my girlfriend?". Christmas: the wish question, e.g. "What do you wish for this Christmas?" */
    question: { type: String, trim: true, maxlength: 100, default: "" },
    /* Thank You + Christmas: who it is for (friend, family, colleague, team, mentor, community; partner for Christmas) and the people to thank by name */
    audience: { type: String, enum: ["", "friend", "family", "colleague", "team", "mentor", "community", "partner"], default: "" },
    people: { type: [milestoneSchema], default: [] },
    timeline: { type: [milestoneSchema], default: [] },
    reasons: { type: [{ type: String, trim: true, maxlength: 120 }], default: [] },
    stats: { type: [statSchema], default: [] },

    visibility: { type: String, enum: ["public", "private"], default: "public" },
    pinHash: { type: String, select: false, default: null },
    /* the same PIN, encrypted (not hashed) so the OWNER can look it up later in My pages. Visitors are checked against pinHash only. */
    pinEnc: { type: String, select: false, default: null },

    /* the unguessable part of the share link; regenerating it kills the old link */
    slug: { type: String, required: true, unique: true },
    /* bumped on PIN change / new link / close, which invalidates every unlock token */
    accessVersion: { type: Number, default: 1 },

    status: { type: String, enum: ["active", "closed", "blocked"], default: "active", index: true },
    /*
      "Email this page": chosen when the page is created and LOCKED after that, like the names. The page's link (and its PIN, if private)
      goes to this address. The sender can ask for it to be sent again a couple of times if it didn't arrive.
    */
    shareEmail: { type: String, lowercase: true, trim: true, maxlength: 254, default: "" },
    emailIncludesPin: { type: Boolean, default: true }, // private page: is the PIN written in the email, or does the sender give it separately?
    emailStatus: { type: String, enum: ["", "sent", "failed", "blocked"], default: "" },
    emailSends: { type: Number, default: 0 },
    emailSentAt: { type: Date, default: null },
    /* when the address was put on the page (at creation or later): the daily email limits count from this */
    emailAddedAt: { type: Date, default: null },
    /* a page lives for PAGE_LIFETIME_DAYS (30) from the day it is created; after this it is gone for good (see services/memory/expiry.js) */
    expiresAt: { type: Date, default: null, index: true },
    viewCount: { type: Number, default: 0 },

    /*
      THE RECEIVER'S ANSWER (Proposal: yes / no / "I need time"; Sorry: forgive / "I need time").
      "yes" and "no" are FINAL: once given they can never be changed. "later" is not final, so it can still become yes or no.
    */
    answer: {
      value: { type: String, enum: ["yes", "no", "later", null], default: null },
      final: { type: Boolean, default: false },
      firstAt: { type: Date, default: null }, // the first time they answered anything
      at: { type: Date, default: null }, // when the current answer was given
      history: { type: [{ _id: false, value: String, at: Date }], default: [] },
    },
    /* messages the receiver sent back to the sender */
    replies: { type: [{ _id: false, text: { type: String, maxlength: 500 }, at: { type: Date, default: Date.now }, visitor: { type: String, maxlength: 40, default: "" } }], default: [] },
    /* quick numbers for the My pages list; the detail lives in MemoryEvent */
    activity: {
      opens: { type: Number, default: 0 },
      firstOpenedAt: { type: Date, default: null },
      lastOpenedAt: { type: Date, default: null },
    },

    media: [mediaSchema],

    /* what the buyer paid for this page, in paise (null = a code / Gumroad / admin pass: any theme). The page can switch to any theme costing the same or less. */
    paidPricePaise: { type: Number, default: null, min: 0 },
    /* extra room bought with add-ons, on top of the template's limits */
    extra: {
      photos: { type: Number, default: 0 },
      videos: { type: Number, default: 0 },
      photoMb: { type: Number, default: 0 },
      videoMb: { type: Number, default: 0 },
      videoSec: { type: Number, default: 0 },
      audioMb: { type: Number, default: 0 },
      audioSec: { type: Number, default: 0 },
      chars: { type: Number, default: 0 },
      days: { type: Number, default: 0 },
    },
    /* add-on orders already applied to this page (makes applying an order safe to repeat) */
    addonOrders: { type: [Schema.Types.ObjectId], default: [], select: false },
  },
  { timestamps: true }
);

memoryPageSchema.index({ createdAt: -1 });

export default mongoose.models.MemoryPage || mongoose.model("MemoryPage", memoryPageSchema);
