import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  A resume being built in the Resume Builder. Everything the person types is kept here as plain data;
  the PDF is drawn from it on demand (see services/resume/builderPdf.js), so a draft can be edited forever.
*/
const str = (max) => ({ type: String, default: "", trim: true, maxlength: max });

const resumeDraftSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "My resume", trim: true, maxlength: 80 },
    template: { type: String, enum: ["classic", "modern", "executive", "minimal", "tech", "compact"], default: "classic" },
    design: { accent: str(7), spacing: { type: String, enum: ["comfortable", "standard", "tight"], default: "standard" } }, // accent = a #rrggbb colour (blank = the template's own)
    jdKeywords: [str(40)], // what an ATS would look for (from the job description, or standard for the role): used for the keyword check in the editor
    keywordSource: { type: String, enum: ["jd", "role"], default: "role" },
    kind: { type: String, enum: ["student", "professional"], default: "student" },
    /* "scratch": built by hand | "reading": AI is reading the upload (runs on the server, the person can leave) | "questions": waiting for the person's answers
       | "writing": AI is writing the resume (also runs on the server) | "ready": written | "failed": a step failed, see error + failedStep (retry is one click) */
    phase: { type: String, enum: ["scratch", "reading", "questions", "writing", "ready", "failed"], default: "scratch" },
    error: str(300),
    failedStep: { type: String, enum: ["", "reading", "writing"], default: "" },
    source: {
      resumeKey: str(300),
      resumeFilename: str(120),
      jobTitle: str(120),
      jobDescription: { type: String, default: "", maxlength: 10000 },
      details: { type: String, default: "", maxlength: 1500 },
      targetRole: str(120),
    },
    /* every link that was really inside the uploaded resume (hyperlinks + written-out addresses): the only links the AI may put in the new one */
    sourceLinks: [{ _id: false, text: str(60), url: str(300) }],
    base: { type: Schema.Types.Mixed, default: null }, // the person's own resume, as read from the upload; the AI rewrites from this, never from its own earlier output
    resumeText: { type: String, default: "", select: false },
    gaps: [{ _id: false, id: String, kind: { type: String, enum: ["skill", "info"], default: "skill" }, field: str(20), keyword: str(60), target: str(8), importance: { type: String, enum: ["must", "nice"], default: "must" }, question: str(400), status: { type: String, enum: ["open", "have", "none"], default: "open" }, detail: str(700), asked: { type: Date, default: Date.now } }],
    step: { type: Number, default: 0, min: 0, max: 20 }, // where the wizard was left
    /* the Resume Builder credit this resume cost (taken when the person pressed Build). Given back if they delete it before it is ever written. */
    credit: { purchase: { type: Schema.Types.ObjectId, ref: "ResumePurchase", default: null }, spent: { type: Boolean, default: false }, refunded: { type: Boolean, default: false } },
    wasReady: { type: Boolean, default: false }, // the AI finished writing it at least once

    basics: {
      name: str(80),
      headline: str(120), // target role / title shown under the name
      email: str(120),
      phone: str(30),
      location: str(80),
    },
    links: [{ _id: false, label: str(30), url: str(300) }],
    summary: str(900),
    education: [{ _id: false, school: str(140), degree: str(140), start: str(20), end: str(20), score: str(40), notes: str(300) }],
    experience: [{ _id: false, company: str(140), role: str(120), location: str(80), start: str(20), end: str(20), current: { type: Boolean, default: false }, bullets: [str(400)] }],
    projects: [{ _id: false, name: str(120), tech: str(200), link: str(300), repo: str(300), bullets: [str(400)] }],
    skills: [{ _id: false, group: str(40), items: [str(60)] }],
    extras: [{ _id: false, heading: str(40), items: [str(300)] }], // certifications, achievements, ...
  },
  { timestamps: true }
);

resumeDraftSchema.index({ user: 1, updatedAt: -1 });

export default mongoose.models.ResumeDraft || mongoose.model("ResumeDraft", resumeDraftSchema);
