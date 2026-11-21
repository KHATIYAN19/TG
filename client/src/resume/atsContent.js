/*
  FREE ATS SCORE CHECKER: every word on /resume-review/ats-score-checker.
  The page, its FAQ / HowTo / WebApplication structured data and the prerendered HTML are all built from these arrays, so search
  engines, answer engines and AI assistants read exactly what a visitor sees. No invented statistics, no fake user counts.
*/
import { ATS_WEIGHTS } from "./atsCheck";

export const SITE = "https://www.targettrek.in";
export const PAGE_PATH = "/resume-review/ats-score-checker";
export const PAGE_URL = `${SITE}${PAGE_PATH}`;
export const LAB_URL = `${SITE}/resume-review`;
export const UPDATED_ISO = "2026-11-20";
export const UPDATED_LABEL = "20 November 2026";
export const OG_IMAGE = "https://www.targettrek.in/brand/target-trek-logo.jpg";

export const SEO = {
  title: "Free ATS Score Checker: Check Resume ATS Score | Resume Lab",
  description:
    "Free ATS resume checker: paste your resume or upload a PDF, add the job description and get an ATS score out of 100 with missing keywords. No sign-up.",
  keywords:
    "ATS score checker, ATS resume checker, free ATS checker, ATS score calculator, check ATS score of resume, resume ATS score, ATS friendly resume checker, resume score checker, ATS resume scanner, resume keyword checker, job description keyword match, ATS checker India, ATS score for freshers, how to check ATS score, ATS friendly resume format",
};

export const HERO = {
  eyebrow: "Free tool · no sign-up",
  title: "Free ATS Score Checker",
  mark: "for your resume",
  lead: "Paste your resume or upload a PDF, add the job description, and see your ATS score out of 100: which keywords you match, which you're missing, and exactly what to fix. It runs in your browser, so your resume never leaves your device.",
};

export const HERO_FACTS = [
  ["Free", "no sign-up, no limit"],
  ["Private", "runs on your device"],
  ["8 checks", "each one explained"],
  ["Seconds", "to get your score"],
];

/* the one-paragraph answers that answer engines quote */
export const WHAT_IS_ATS_SCORE =
  "An ATS score is an estimate, out of 100, of how well an applicant tracking system (ATS) can read your resume and how closely it matches a job. It mostly depends on whether your resume uses the job's keywords, has standard sections, is in a simple one-column format the software can parse, and shows clear, measurable experience. Each ATS product calculates match differently, so treat any score as a guide to what to fix, not a pass mark.";

export const GOOD_SCORE_ANSWER =
  "On this checker, 80 or above is strong, 65 to 79 is good, 50 to 64 needs work and below 50 is weak. Aim for 75 or more against each job you apply to. Most of the gain usually comes from adding the job's missing keywords (honestly) and rewriting duty-style bullets as results with numbers.";

export const SCORE_BANDS = [
  { range: "80–100", label: "Strong", tone: "ok", text: "Matches the job well and is easy for software to read. Polish the top third of page one and apply." },
  { range: "65–79", label: "Good", tone: "ok", text: "Readable and relevant. Add the missing must-have keywords and a few more numbers." },
  { range: "50–64", label: "Needs work", tone: "warn", text: "Likely to rank below other applicants. Fix the red checks first: keywords, results and sections." },
  { range: "0–49", label: "Weak", tone: "bad", text: "Either the format is hard to read or the resume doesn't match this job. Start with the format, then tailor." },
];

export { ATS_WEIGHTS };

/* how to use the checker: also the HowTo structured data */
export const HOW_TO = [
  { title: "Paste your resume or upload a PDF", text: "Copy all the text from your resume, or pick your PDF. The text is read on your own device; nothing is uploaded to our servers." },
  { title: "Paste the job description", text: "Optional, but it is what makes the score useful. Copy the full posting, including responsibilities and requirements." },
  { title: "Check your ATS score", text: "You get a score out of 100, a grade and eight checks, each marked green, amber or red with the reason." },
  { title: "Add the missing keywords you really have", text: "Work the skills the job asks for into your summary, experience and projects, using the job's exact wording." },
  { title: "Fix the red checks and check again", text: "Rewrite weak bullets with numbers, add missing sections or contact details, and re-run until you reach 75 or more." },
];

/* how to improve an ATS score: a numbered list people search for */
export const IMPROVE = [
  ["Tailor to each job", "Use the exact skill and job-title words from the posting, wherever they are true for you. One generic resume for every job is the most common reason for a low match."],
  ["Use standard headings", "Summary, Experience, Projects, Skills, Education. An ATS looks for these words to sort your content into the right fields."],
  ["Keep one column", "Tables, text boxes, columns, icons and skill bars can scramble the order the software reads. A simple one-column layout reads the same everywhere."],
  ["Show results with numbers", "\"Cut API latency from 800ms to 220ms\" beats \"Worked on performance\". Numbers help both the ranking and the recruiter."],
  ["Start bullets with action verbs", "Built, Led, Automated, Migrated. Avoid \"Responsible for\" and \"Worked on\"."],
  ["Put contact details in the body", "Some systems skip headers and footers. Keep email, phone, LinkedIn and city in the first lines of the page."],
  ["Save as a text-based PDF", "Export from Word or Google Docs. If you can't select and copy the text in your PDF, an ATS can't read it either."],
  ["Don't stuff keywords", "Listing skills you can't discuss gets you into interviews you then fail. Add only what you can back up."],
];

/* resume file and format questions, in a do / don't table */
export const FORMAT_ROWS = [
  ["File type", "Text-based PDF or .docx", "Scanned PDF, image, or a design export where text can't be selected"],
  ["Layout", "One column, clear headings", "Two or three columns, tables, text boxes"],
  ["Fonts", "Standard fonts such as Calibri, Arial or Georgia, 10–12 pt", "Decorative fonts, icons used instead of words"],
  ["Contact details", "In the body, top of page one", "Only in the header or footer"],
  ["Skills", "Written as words: Java, Spring Boot, Docker", "Star ratings, progress bars or logos"],
  ["Photo and personal details", "Leave them out (unless the employer asks)", "Photo, date of birth, marital status, declaration"],
];

/* ATS products commonly used by employers hiring in India: named so the page answers "which ATS does X use" style questions */
export const ATS_LIST = ["Workday", "Oracle Taleo", "SAP SuccessFactors", "Greenhouse", "Lever", "iCIMS", "SmartRecruiters", "Zoho Recruit", "Darwinbox", "Naukri RMS"];

export const PAGE_NAV = [
  ["checker", "ATS checker"],
  ["what-is", "What is an ATS score?"],
  ["good-score", "Good ATS score"],
  ["how-calculated", "How it's calculated"],
  ["improve", "Improve your score"],
  ["format", "ATS-friendly format"],
  ["faq", "FAQ"],
];

export const FAQ = [
  { q: "What is an ATS score?", a: WHAT_IS_ATS_SCORE },
  { q: "How can I check my resume's ATS score for free?", a: "Use the free ATS score checker on this page. Paste your resume text or upload a PDF, paste the job description, and press Check my ATS score. You get a score out of 100 with eight explained checks and the job keywords you match and miss. There's no sign-up and no limit." },
  { q: "What is a good ATS score?", a: GOOD_SCORE_ANSWER },
  { q: "Is 70 a good ATS score?", a: "Yes, 70 is a good score on this checker, but you can usually reach 80 or more for a specific job by adding the must-have keywords you are missing and putting numbers in your bullet points." },
  { q: "How is the ATS score calculated?", a: `This checker scores eight things and shows each weight: ${ATS_WEIGHTS.map((w) => `${w.label.toLowerCase()} (${w.weight})`).join(", ")}. Without a job description, the keyword weight is shared across the other checks. Real ATS products each use their own matching rules, so no outside tool can show the exact number an employer sees.` },
  { q: "Does the ATS score checker store or upload my resume?", a: "No. The text is analysed by code running in your browser, and a PDF is read on your own device. Nothing is sent to our servers or saved, and you don't need an account." },
  { q: "Can an ATS read a PDF resume?", a: "Yes, if it is a text-based PDF exported from Word, Google Docs or a resume builder. A scanned PDF or an image is just a picture to most systems. Test yours: if you can select and copy the text, an ATS can read it." },
  { q: "Is PDF or Word better for ATS?", a: "Both work with modern systems. A text-based PDF keeps your layout fixed, so it's the safer default. Send .docx only if the job posting asks for Word." },
  { q: "Can an ATS read tables, columns and Canva resumes?", a: "Often badly. Tables, columns and text boxes can come out in the wrong order or be skipped, and many design-tool templates are built from them. A one-column layout with plain headings reads correctly everywhere." },
  { q: "How many keywords should a resume have for ATS?", a: "There's no fixed number. Cover the skills and tools the job lists as required, and as many of the preferred ones as are true for you. Use each important keyword in context, in a bullet or project, not only in a skills list." },
  { q: "How do I find the right keywords for a job?", a: "Paste the job description into this checker: it lists the skills and tools the posting mentions and marks the ones it calls required. Repeated words and anything near \"must have\" or \"required\" matter most." },
  { q: "Should I add a photo, date of birth or declaration to my resume?", a: "No, unless the employer asks. They take space, can introduce bias and add nothing for an ATS. Most Indian tech employers no longer expect them." },
  { q: "Is a one-page resume better for ATS?", a: "An ATS doesn't care about page count. Recruiters do: one page suits students and freshers, and up to two pages suits people with several years of experience." },
  { q: "Do Naukri, LinkedIn and company career sites use ATS?", a: "Most medium and large employers run applications through an ATS, whichever site you apply from. Common ones include Workday, Taleo, SuccessFactors, Greenhouse, Lever, iCIMS, Zoho Recruit and Darwinbox, and Naukri offers its own recruiter tools. Write one clean, keyword-matched resume and it works in all of them." },
  { q: "Can I get a 100 ATS score?", a: "It is possible but not the goal. Above about 80, gains come from stuffing keywords, which hurts you with the recruiter who reads the resume next. Aim for a strong, honest match." },
  { q: "What is the best resume format for ATS for freshers?", a: "One page, one column: name and contact details, a two-line summary, education, projects with results, skills, then internships, certifications or achievements. Lead with projects if you have no work experience." },
  { q: "Does a high ATS score guarantee an interview?", a: "No. A good score means software can read your resume and it matches the job. A person still decides, so the resume also has to show real, specific results. That's what a human review is for." },
  { q: "How is this different from Resume Lab's paid review?", a: "The checker is instant and rule-based. A Resume Lab review adds an AI report with rewritten bullets and section grades, then a working professional reads your resume and writes detailed notes for your target role." },
];

/* ------------------------------------------------------------------ JSON-LD */
export function buildSchema() {
  const org = { "@type": "Organization", "@id": `${SITE}/#organization`, name: "Target Trek", url: SITE, logo: OG_IMAGE, email: "supporttargettrek@gmail.com" };
  return {
    "@context": "https://schema.org",
    "@graph": [
      org,
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: SEO.title,
        description: SEO.description,
        inLanguage: "en-IN",
        isPartOf: { "@type": "WebSite", "@id": `${SITE}/#website`, url: SITE, name: "Target Trek" },
        about: { "@id": `${PAGE_URL}#app` },
        mainEntity: { "@id": `${PAGE_URL}#app` },
        dateModified: UPDATED_ISO,
        keywords: SEO.keywords,
        primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE },
        breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
        speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".rla-answer"] },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Target Trek", item: SITE },
          { "@type": "ListItem", position: 2, name: "Resume Lab", item: LAB_URL },
          { "@type": "ListItem", position: 3, name: "Free ATS Score Checker", item: PAGE_URL },
        ],
      },
      {
        "@type": "WebApplication",
        "@id": `${PAGE_URL}#app`,
        name: "Free ATS Score Checker",
        alternateName: ["ATS resume checker", "ATS score calculator", "Resume ATS scanner"],
        url: PAGE_URL,
        description: SEO.description,
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Resume checker",
        operatingSystem: "Any (runs in a web browser)",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        inLanguage: "en",
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR", availability: "https://schema.org/InStock" },
        featureList: [
          "ATS score out of 100 with a grade",
          "Job description keyword match with required skills flagged",
          "Section, contact details, measurable results and action-verb checks",
          "Readability check for tables, columns and scanned PDFs",
          "PDF upload read on your device; nothing uploaded",
        ],
        provider: { "@id": `${SITE}/#organization` },
        publisher: { "@id": `${SITE}/#organization` },
      },
      {
        "@type": "HowTo",
        "@id": `${PAGE_URL}#howto`,
        name: "How to check your resume's ATS score for free",
        description: "Paste your resume and a job description into the free checker, read the score and checks, and fix what's red.",
        totalTime: "PT5M",
        tool: [{ "@type": "HowToTool", name: "Free ATS Score Checker by Resume Lab" }],
        step: HOW_TO.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.text, url: `${PAGE_URL}#checker` })),
      },
      {
        "@type": "ItemList",
        "@id": `${PAGE_URL}#improve`,
        name: "How to improve your resume's ATS score",
        itemListElement: IMPROVE.map(([name, text], i) => ({ "@type": "ListItem", position: i + 1, name, description: text, url: `${PAGE_URL}#improve` })),
      },
      {
        "@type": "DefinedTerm",
        "@id": `${PAGE_URL}#ats-score`,
        name: "ATS score",
        description: WHAT_IS_ATS_SCORE,
        inDefinedTermSet: `${PAGE_URL}#what-is`,
      },
      {
        "@type": "FAQPage",
        "@id": `${PAGE_URL}#faq`,
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };
}

export const schemaJson = () => JSON.stringify(buildSchema()).replace(/</g, "\\u003c");
