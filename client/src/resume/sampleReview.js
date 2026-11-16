/* A made-up review in exactly the shape the real page receives, so the landing page can show the real screen. */
const result = {
  overallScore: 62, atsScore: 71,
  headline: "Solid base, but the resume hides your best work.",
  summary: "Your experience is real, but most bullets describe duties and the top third of page one does not say what role you want. Fix the items below and this becomes a resume that gets shortlisted.",
  sections: [
    { name: "Summary", score: 40, feedback: "The summary is a generic objective. It does not name the role, your level, your stack or any result, so the best space on the page is wasted. A recruiter cannot tell from it what you want or why to pick you.", problems: ["No target role named", "No stack or proof point"], fixes: ["Write two lines: role, years, main stack and one result", "Remove the word “seeking”"] },
    { name: "Experience", score: 66, feedback: "The scope is good and the career progression is clear, but seven of ten bullets describe duties, not results. The payments platform work is buried in the third bullet.", problems: ["7 of 10 bullets have no numbers", "Strongest work is not first"], fixes: ["Lead with the payments platform", "Add scale, speed or team size to each bullet"] },
    { name: "Projects", score: 58, feedback: "Two projects are listed in one line each, with no links and no stack. They cannot be checked, so they earn little credit.", problems: ["No links", "No stack listed"], fixes: ["Add stack, the hard problem and a GitHub link to each"] },
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
  recruiterFirstImpression: "A clean layout and a clear Java stack, but the top of page one is a generic objective. Nothing tells me in ten seconds that you own a payments platform, which is your strongest card. I would keep reading, but only because the stack matches.",
  shortlistChance: 41,
  experienceCheck: {
    level: "below", claimedYears: 3, expectedForRole: "Most companies hiring a Senior Backend Engineer look for 5 to 8 years, with ownership of a system in production.",
    assessment: "You are aiming at senior roles with 3 years of experience, and the resume shows one owned system (payments) and no mentoring or design ownership. Applying for senior roles today will mostly end in rejection at the screening stage, while mid-level roles are a realistic match right now.",
    gaps: ["No evidence of designing a system end to end", "No team leadership or mentoring mentioned", "Scale is never stated: traffic, data size or uptime"],
    howToBridge: "Apply for Backend Engineer II or mid-level roles now. Move the payments platform to the top, add its scale, and add one system design example. In 12 to 18 months that story supports a senior application.",
  },
  criticalIssues: [
    { title: "The top of page one does not name a role", severity: "critical", where: "Summary", whatIsWrong: "The summary reads “Hardworking engineer seeking a challenging role”. It names no role, level, stack or result, so it uses the most valuable lines on the page to say nothing.", impact: "Recruiters spend about ten seconds on a resume. A generic opening makes them guess your level, and many simply move on.", howToFix: "Replace it with two lines: “Backend Engineer, 3 years, Java and Spring Boot. Built and own the payments service handling [number] transactions a day.”" },
    { title: "Seven of ten bullets list duties and have no numbers", severity: "critical", where: "Experience, Acme Payments", whatIsWrong: "Lines like “Responsible for fixing bugs” and “Worked on APIs” describe the job, not what you achieved. There is no scale, speed, cost or team size anywhere.", impact: "ATS ranking and recruiters both reward measurable results. Without them you look the same as every other candidate with this title.", howToFix: "Rewrite each bullet as verb, what, how, result. Where you have the number, add it. Where you do not, estimate honestly or leave a bracket to fill in before you send it." },
    { title: "Projects have no stack, links or hard problem", severity: "major", where: "Projects", whatIsWrong: "Both projects are one-line descriptions. They do not say what was built with, what was difficult or where the code lives.", impact: "A project with no link or stack cannot be verified, so it earns no credit.", howToFix: "For each project add the stack, one problem you solved and a GitHub or live link." },
    { title: "Cloud and messaging skills are missing for the target role", severity: "major", where: "Skills", whatIsWrong: "The role you want usually lists AWS, Docker and Kafka. None appears anywhere, so keyword search will filter you out.", impact: "ATS keyword matching can drop the resume before a person reads it.", howToFix: "If you have used any of them, even on a side project, add them with one concrete line. If not, build one small deployed project and add it." },
    { title: "Contact details sit in the page header", severity: "minor", where: "Formatting", whatIsWrong: "Email and phone are in the document header, which many ATS tools ignore.", impact: "The system may record you with no contact details.", howToFix: "Move the contact line into the body, directly under your name." },
  ],
  interviewRisks: [
    { question: "You moved from support to backend in 18 months. How?", whyTheyAsk: "Your first role is in support and the next is backend, with no explanation in between.", prepare: "Give a 60 second story: what you built on the side, who backed you, and the first backend task you owned." },
    { question: "Walk me through the payments platform you own.", whyTheyAsk: "It is the strongest line on your resume, so they will test whether it is real.", prepare: "Be ready to draw the flow, name the failure cases, and give the numbers: traffic, latency and uptime." },
  ],
  marketInsight: "Backend roles in Java and Spring Boot are still in steady demand in India, but most postings now expect cloud and event-driven experience. Candidates at your level who stand out show one owned system with clear scale and a deployed side project. Your payments work is the right raw material; it needs to be shown with numbers.",
  actionPlan: [
    { step: "Rewrite the two-line summary with your role, stack and payments proof point", effort: "20 minutes", payoff: "Fixes your biggest first-impression problem" },
    { step: "Add numbers to your 5 weakest experience bullets", effort: "1 evening", payoff: "Raises the Experience score the most" },
    { step: "Add stack and link to both projects", effort: "30 minutes", payoff: "Makes your projects count" },
    { step: "Add AWS, Docker and Kafka where you have truly used them", effort: "20 minutes", payoff: "Passes keyword filters for the target role" },
  ],
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
