import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  One resume sent in under a paid plan: what the person sent, the AI's first look and the human's final word.

  status
    ai_reviewing     the AI is reading it
    awaiting_review  the AI is done and a human review was asked for; waiting for a person to pick it up
    in_review        a person has taken it
    completed        the review is delivered (AI report only, or AI + human)
*/
const resumeRequestSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    purchase: { type: Schema.Types.ObjectId, ref: "ResumePurchase", required: true, index: true }, // the plan the AI review came from
    /* did the person ask for a human review (and which plan paid for it)? Without it the review ends after the AI report. */
    humanRequested: { type: Boolean, default: false, index: true },
    humanPurchase: { type: Schema.Types.ObjectId, ref: "ResumePurchase", default: null },
    /* was a LinkedIn review asked for (and which plan paid for it)? */
    linkedinRequested: { type: Boolean, default: false },
    linkedinPurchase: { type: Schema.Types.ObjectId, ref: "ResumePurchase", default: null },
    packageSnapshot: {
      key: String,
      name: String,
      deliveryHours: Number,
      includes: { resume: Boolean, linkedin: Boolean, jobMatch: Boolean, humanReview: Boolean, rewrittenResume: Boolean },
    },

    profile: {
      kind: { type: String, enum: ["student", "professional"], required: true },
      currentRole: { type: String, default: "", trim: true, maxlength: 100 },
      experienceYears: { type: Number, default: 0, min: 0, max: 60 },
      organization: { type: String, default: "", trim: true, maxlength: 140 },
      course: { type: String, default: "", trim: true, maxlength: 120 },
      targetRole: { type: String, default: "", trim: true, maxlength: 120 },
    },
    linkedinUrl: { type: String, default: "", trim: true, maxlength: 300 },
    jobDescription: { type: String, default: "", maxlength: 10000 },
    notes: { type: String, default: "", maxlength: 1500 },
    resume: {
      key: { type: String, default: "" },
      filename: { type: String, default: "", maxlength: 200 },
      size: { type: Number, default: 0 },
    },

    status: { type: String, enum: ["ai_reviewing", "awaiting_review", "in_review", "completed"], default: "ai_reviewing", index: true },

    ai: {
      status: { type: String, enum: ["pending", "running", "done", "failed"], default: "pending" },
      model: { type: String, default: "" },
      provider: { type: String, default: "" }, // openai | gemini | anthropic: who wrote this review
      startedAt: { type: Date, default: null },
      finishedAt: { type: Date, default: null },
      error: { type: String, default: "" },
      userMessage: { type: String, default: "" }, // what the person is told when it failed
      refunded: { type: Boolean, default: false }, // the AI credit was given back to the plan
      chargedPurchase: { type: Schema.Types.ObjectId, ref: "ResumePurchase", default: null }, // the plan the latest run's credit came from (a re-run can use another plan); a refund goes back here
      result: { type: Schema.Types.Mixed, default: null },
      runId: { type: String, default: "" }, // the run that owns this review; a run that was taken over stops writing
      heartbeatAt: { type: Date, default: null }, // last progress write: a run that has gone quiet for long is taken as dead
      /* the agents' live progress (planner, reviewer, validator, reviser, finalizer), shown on the page as it happens. See services/resume/agents/README.md */
      pipeline: { type: Schema.Types.Mixed, default: null },
    },

    human: {
      reviewer: { type: Schema.Types.ObjectId, ref: "User", default: null },
      reviewerName: { type: String, default: "" },
      claimedAt: { type: Date, default: null },
      completedAt: { type: Date, default: null },
      score: { type: Number, default: null, min: 0, max: 100 },
      summary: { type: String, default: "", maxlength: 4000 },
      /* the long, formatted write-up (blank lines = paragraphs, "- " = bullets, "## " = headings) */
      detailedFeedback: { type: String, default: "", maxlength: 30000 },
      strengths: { type: [String], default: [] },
      improvements: { type: [String], default: [] },
      linkedinFeedback: { type: String, default: "", maxlength: 8000 },
      jobMatchFeedback: { type: String, default: "", maxlength: 8000 },
      nextSteps: { type: String, default: "", maxlength: 6000 },
      internalNotes: { type: String, default: "", maxlength: 3000 }, // reviewers and admins only
      /* a complete rewritten resume, for plans that include one */
      deliverable: { key: { type: String, default: "" }, filename: { type: String, default: "" }, size: { type: Number, default: 0 } },
    },
    notifiedAt: { type: Date, default: null },
    /* the member deleted it: hidden from them everywhere, kept for the admin (who can delete it for good) */
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

resumeRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.ResumeRequest || mongoose.model("ResumeRequest", resumeRequestSchema);
