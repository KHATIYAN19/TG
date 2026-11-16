/* A made-up review in exactly the shape the real page receives, so the landing page can show the real screen. */
const result = {
  overallScore: 62, atsScore: 71,
  headline: "Solid base, but the resume hides your best work.",
  summary: "Your experience is real, but most bullets describe duties and the top third of page one does not say what role you want. Fix the items below and this becomes a resume that gets shortlisted.",
  sections: [
    { name: "Summary", score: 40, feedback: "Generic. Name the role, your level, your stack and one proof point." },
    { name: "Experience", score: 66, feedback: "Good scope, but 7 of 10 bullets have no numbers." },
    { name: "Projects", score: 58, feedback: "Two projects, no links and no stack listed." },
    { name: "Skills", score: 78, feedback: "Well grouped. Remove three beginner-level tools." },
    { name: "Education", score: 90, feedback: "Clear and complete." },
    { name: "Formatting", score: 74, feedback: "Single column and readable. Move contact details out of the header." },
  ],
  strengths: ["Clear career progression across three roles", "Relevant stack: Java, Spring Boot, PostgreSQL", "Single-column, text-based PDF that software can read"],
  missingKeywords: ["Kafka", "System design", "CI/CD", "Docker", "Microservices", "AWS"],
  improvements: [
    { issue: "The summary says nothing about the role you want", why: "Recruiters decide in seconds. A generic objective wastes the best space on the page.", fix: "Write two lines: role, level, main stack and one proof point." },
    { issue: "Bullets list duties, not results", why: "“Responsible for” tells them what the job was, not what you did.", fix: "Start with a verb and add a number: users, time saved, requests, team size." },
    { issue: "Projects have no stack or link", why: "Without them a project proves nothing.", fix: "Add the stack, one hard thing you built and a GitHub or live link." },
  ],
  rewrittenBullets: [
    { before: "Worked on APIs and fixed bugs for the payments team.", after: "Built 6 Spring Boot microservices for payments and cut open production bugs by [35]% in [two] quarters." },
    { before: "Improved the performance of the search feature.", after: "Cut search response time from [1.8s] to [400ms] by adding an index and caching the top 1,000 queries." },
  ],
  jobMatch: { score: 58, advice: "You cover the core Java stack, but this posting asks for event-driven design and cloud deployment, which your resume never mentions.", matched: ["Java", "Spring Boot", "PostgreSQL", "REST APIs"], missing: ["Kafka", "AWS", "Docker", "CI/CD"] },
  linkedin: { headlineIdea: "Backend Engineer · Java, Spring Boot, AWS | Building payment systems at scale", aboutIdea: "Open with the payments platform you own, then two lines on your stack and what you are looking for next.", tips: ["Add a banner and a clear photo", "Pin your two best projects in Featured", "Turn on “Open to work” for recruiters only"] },
};

const base = {
  id: "sample", purchaseId: "sample", createdAt: "2026-11-16T10:02:00.000Z",
  package: { name: "Pro Review", deliveryHours: 48, includes: { jobMatch: true, linkedin: true, humanReview: true, rewrittenResume: true } },
  profile: { kind: "professional", currentRole: "Backend Engineer", experienceYears: 3, organization: "Acme Payments", targetRole: "Backend Engineer · 3 years" },
  resume: { filename: "Asha-Rao-Resume.pdf" }, linkedinUrl: "https://www.linkedin.com/in/asha-rao", jobDescription: "sample",
  ai: { status: "done", result },
};

/* one: the AI report is ready and the person can still ask for a human review. two: the human review has been delivered. */
export const SAMPLE_AI = { ...base, status: "completed", humanRequested: false, human: null };
export const SAMPLE_HUMAN = {
  ...base, status: "completed", humanRequested: true,
  human: {
    score: 64, reviewerName: "Rahul Verma", completedAt: "2026-11-17T16:30:00.000Z", deliverable: { filename: "Asha-Rao-Backend-Engineer.pdf" },
    summary: "## Overall\nYou are a stronger engineer than this resume shows. The work is there, but a recruiter has to dig for it.\n\n- Lead with the payments platform\n- Cut the first role to three bullets\n- Be specific about scale",
    detailedFeedback: "## Your story\nYou moved from support to backend in 18 months, which is a good story to tell. Make it the first thing a reader learns.\n\n## Experience\nThe payments work shows real ownership. Put the numbers next to it: how many transactions, what uptime, which team size.\n\n## Level\nAim for **mid-level backend** roles now, not senior yet. In 12 months, with the system design gaps closed, senior becomes realistic.",
    strengths: ["Ownership shows up in the payments work", "A clean, readable layout", "Honest, specific project descriptions"],
    improvements: ["Move the payments platform to the top of your latest role", "Drop the 2019 internship to one line", "Aim for mid-level backend roles, not senior yet", "Link your two best repositories"],
    linkedinFeedback: "Your headline says “Software Engineer”. Change it to **Backend Engineer · Java, Spring Boot, AWS**.\n\nYour About section repeats the resume. Use it to tell the payments story in three lines.",
    jobMatchFeedback: "For this posting, move Kafka and AWS into your latest role, not just the skills list. If you have used either, even on a side project, say so with one concrete line.",
    nextSteps: "1. Apply the four changes above\n2. Send the new version back for an AI re-check\n3. Start applying to 10 roles a week",
  },
};
export const SAMPLE_POOL = { humanLeft: 1 };
