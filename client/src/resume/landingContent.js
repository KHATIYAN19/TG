/*
  RESUME LAB: the words on /resume-review.
  Kept in one place so the page, the FAQ schema, the HowTo schema and the prerendered HTML all say exactly the same thing.
  Nothing here states a number or a result we can't stand behind: no fake review counts, no invented testimonials.
*/

export const SITE = "https://www.targettrek.in";
export const PAGE_URL = `${SITE}/resume-review`;
export const UPDATED_ISO = "2026-11-16";
export const UPDATED_LABEL = "16 November 2026";

export const SEO = {
  title: "Resume Review by Working Professionals + AI | Resume Lab",
  description:
    "Not getting interview calls? Get your resume and LinkedIn reviewed by AI in minutes, then by working professionals. Fix ATS mistakes and get more shortlists.",
  keywords:
    "resume review, resume review by professionals, ATS resume checker, resume not getting interview calls, why am I not getting interview calls, resume mistakes, LinkedIn profile review, resume rewrite, resume review India, fresher resume review, software engineer resume review",
};

/* ------------------------------------------------------------------ jump links under the hero */
export const SECTIONS = [
  ["pricing", "Plans"],
  ["sample", "Sample result"],
  ["mistakes", "12 mistakes"],
  ["how-it-works", "How it works"],
  ["reviewers", "Human review"],
  ["inside", "What you get"],
  ["who-for", "Who it's for"],
  ["ats", "ATS explained"],
  ["faq", "FAQ"],
];

/* ------------------------------------------------------------------ the hero's quick facts */
export const QUICK_FACTS = [
  ["Minutes", "to get your AI report"],
  ["Working professionals", "write the human review"],
  ["PDF", "upload, up to 10 MB"],
  ["Pay once", "no subscription"],
];

/* ------------------------------------------------------------------ "Getting no interview calls?" */
export const NO_CALLS_ANSWER =
  "If you are applying and not getting interview calls, the cause is usually your resume, not your ability. The five most common reasons are: the resume does not match the job's keywords so an applicant tracking system (ATS) ranks it low, the bullets describe duties instead of results, the target role is unclear, the formatting breaks when software reads it, and the same resume is sent to every job.";

export const SYMPTOMS = [
  {
    sees: "You applied to 50 or more jobs and heard almost nothing back.",
    cause: "The resume is not matching the job's keywords, so an ATS ranks it low before a person sees it.",
    fix: "Mirror the exact skills and job titles from each posting, honestly, and put the best match in the top third of page one.",
  },
  {
    sees: "You get calls, but only for roles you do not want.",
    cause: "The resume does not say clearly what you are aiming for, so recruiters guess.",
    fix: "Write a two-line summary with your target role, years or level, main stack and one proof point. Cut anything that points the other way.",
  },
  {
    sees: "You get a first call but never a second round.",
    cause: "The resume promises more than you can show in the interview, or the claims are vague so the interviewer tests everything.",
    fix: "List only what you can discuss in depth. Add specific results so interviewers ask about your strongest work, not your weakest.",
  },
  {
    sees: "You are rejected within minutes by an automatic email.",
    cause: "A knockout rule fired: wrong location, missing required skill, or the file could not be read properly.",
    fix: "Use a simple single-column PDF with real text, state your location and notice period, and name the required skills the way the job does.",
  },
];

/* ------------------------------------------------------------------ the 12 mistakes */
export const MISTAKES = [
  {
    title: "Your resume does not match the job's keywords",
    why: "Most mid-size and large employers use an applicant tracking system (ATS) that scores your resume against the posting. If the words the recruiter searches for are not on your page, you can rank low or never appear in their search.",
    fix: [
      "Copy the five to eight most repeated skills and titles from the job description.",
      "Use them word for word wherever they are true for you, and write both forms once: “Amazon Web Services (AWS)”.",
      "Put the strongest matches in your summary, your latest role and your skills section.",
    ],
    before: "Worked on cloud and backend stuff for the payments team.",
    after: "Built and deployed 6 Java Spring Boot microservices on AWS (EC2, RDS, S3) for the payments team.",
  },
  {
    title: "Bullets describe duties, not results",
    why: "“Responsible for” tells a recruiter what your job description said, not what you did. Every other applicant has the same duties. Results are what separate you.",
    fix: [
      "Start each bullet with a strong verb: built, cut, launched, migrated, led.",
      "Say what you did, how, and what changed because of it.",
      "If you cannot measure it, describe the scale: users, requests, team size, data volume.",
    ],
    before: "Responsible for maintaining APIs and fixing bugs.",
    after: "Maintained 40+ REST APIs and cut open production bugs by 35% in two quarters by adding automated tests.",
  },
  {
    title: "There are no numbers anywhere",
    why: "Numbers make claims believable and give an interviewer something specific to ask about. A resume with none reads like opinion.",
    fix: [
      "Add one number to every bullet in your last two roles: percent, time saved, users, revenue, requests, team size.",
      "Use honest estimates (“about”, “over”) instead of inventing precision.",
      "For a student project, use users, data size, response time or test coverage.",
    ],
    before: "Improved the performance of the search feature.",
    after: "Cut search response time from 1.8s to 400ms by adding an index and caching the top 1,000 queries.",
  },
  {
    title: "The summary is generic, or missing",
    why: "“Seeking a challenging position in a reputed company” says nothing. The top of page one is the most-read part of your resume, and wasting it hurts every other section.",
    fix: [
      "Write two lines: who you are, your level, your main stack, and one proof point.",
      "Name the role you want, in the job's own words.",
      "Delete any objective that is about what you want from the employer.",
    ],
    before: "Hard-working fresher seeking a challenging role to utilise my skills and grow.",
    after: "Final-year CSE student building backend services in Java and Spring Boot. Built a booking API handling 5,000 requests a minute. Looking for a backend engineer role.",
  },
  {
    title: "The same resume goes to every job",
    why: "A resume that tries to fit every role fits none. Recruiters and ATS filters look for the best match to this one job.",
    fix: [
      "Keep one master resume with everything.",
      "For each application, reorder and trim so the top third matches that posting.",
      "Change the summary, the skills order and the first two bullets of your latest role. That is usually enough.",
    ],
    before: "One generic resume sent to backend, data and DevOps roles alike.",
    after: "Three versions of the same facts: backend first, data first, platform first.",
  },
  {
    title: "It is too long, or too dense",
    why: "Recruiters skim. A wall of small text is skipped, and the best line on page two is never read.",
    fix: [
      "Freshers and under about 8 years of experience: one page is usually enough.",
      "More experienced: two pages at most, with the best material first.",
      "Cut old, irrelevant roles to one line. Keep four to six bullets for recent roles and two to three for older ones.",
    ],
    before: "Three pages, 12 bullets per job, 8-point font to fit it all in.",
    after: "Two pages, six bullets for the latest role, one line each for roles older than ten years.",
  },
  {
    title: "The formatting cannot be read by software",
    why: "Tables, multiple columns, text boxes, icons, photos and skill bars can scramble when an ATS extracts the text. Your experience can end up out of order or missing.",
    fix: [
      "Use a single column with normal headings: Summary, Experience, Projects, Skills, Education.",
      "Skip tables, text boxes, graphics and contact details in the header or footer.",
      "Test it: open the PDF, select all, paste into a plain text file. If it reads in order, software can read it.",
    ],
    before: "Two-column template with icons, a photo, and skill bars.",
    after: "Single column, standard headings, plain bullets, no graphics.",
  },
  {
    title: "The skills section is a dump",
    why: "A long list of 40 tools tells nothing about what you are good at. Rating bars (“Python 80%”) are meaningless and look odd to a human.",
    fix: [
      "Group skills: Languages, Frameworks, Databases, Cloud and tools.",
      "Keep what you can discuss in an interview and what the job asks for.",
      "Remove outdated or beginner-level items that distract from your strengths.",
    ],
    before: "Python ★★★★☆, Java ★★★☆☆, MS Word, Internet, Teamwork, C, C++, HTML, CSS, JS, SQL, Git…",
    after: "Languages: Java, Python, SQL. Frameworks: Spring Boot, React. Data: PostgreSQL, Redis. Cloud: AWS, Docker.",
  },
  {
    title: "Projects are vague (very common for freshers)",
    why: "“Todo app using React” is on a thousand resumes. Without the stack, the scale and a link, a project proves nothing.",
    fix: [
      "For each project: what problem it solves, the stack, one hard thing you did, and a result or link.",
      "Pick two or three strong projects over eight small ones.",
      "Add a working GitHub or live link, and make sure the README explains it.",
    ],
    before: "Todo app: made a todo app using React and Node.",
    after: "Task tracker (React, Node, PostgreSQL): JWT login, role-based access and a REST API with 90% test coverage. Live demo and GitHub linked.",
  },
  {
    title: "Typos, tense errors and inconsistent formatting",
    why: "One typo can read as lack of care, and inconsistent dates or bullets make a resume look rushed. For roles that need attention to detail, it is an easy reason to say no.",
    fix: [
      "Use past tense for past roles and present tense only for your current one.",
      "Use one date format and one bullet style throughout.",
      "Read it aloud and have another person check it, because your own eyes skip your own errors.",
    ],
    before: "Managed team of 5 engineer. Jan 2022 - 03/2023. Developes new features",
    after: "Managed a team of five engineers. Jan 2022 to Mar 2023. Developed new features.",
  },
  {
    title: "Contact details and links are weak or broken",
    why: "If a recruiter cannot reach you or check your work in one click, they move on. An unprofessional email or a dead link costs you the call.",
    fix: [
      "Use a simple email based on your name, a working phone number and your city.",
      "Add a clean LinkedIn URL, and GitHub or a portfolio if it supports the role.",
      "Click every link in the PDF before you send it.",
    ],
    before: "cool_dude_2004@mail.com, no LinkedIn, GitHub link broken.",
    after: "asha.rao@gmail.com, linkedin.com/in/asha-rao, github.com/asharao with two pinned projects.",
  },
  {
    title: "Gaps, job hops or vague titles are left unexplained",
    why: "A recruiter who sees an unexplained gap or a very short stay will imagine the worst reason. One honest line usually removes the doubt.",
    fix: [
      "Add one line for a gap: studying, caring for family, freelancing, a course, a project.",
      "Use years or months consistently, and say if a role was a contract or an internship.",
      "If your title was unusual, add the standard equivalent: “Member of Technical Staff (Software Engineer)”.",
    ],
    before: "2022 to 2023: blank.",
    after: "2022 to 2023: Career break to care for family. Completed a full-stack course and built two projects.",
  },
];

/* ------------------------------------------------------------------ self-check (client-side only, nothing is sent) */
export const CHECKLIST = [
  "My summary names the role I want and my main stack in two lines.",
  "Every bullet in my last two roles has a number or a clear scale.",
  "The top third of page one matches the job I am applying for right now.",
  "I use the same skill names the job posting uses.",
  "My resume is a single-column PDF with no tables, text boxes or photos.",
  "It is one page (under about 8 years of experience) or two pages at most.",
  "Each project says what I built, with what, and links to a working demo or code.",
  "My skills are grouped and only include what I can discuss in an interview.",
  "I have checked spelling, tense and dates, and someone else has read it.",
  "My email is professional and my LinkedIn, GitHub and other links work.",
];

export const checkAdvice = (done) => {
  const left = CHECKLIST.length - done;
  if (done === CHECKLIST.length) return { tone: "ok", text: "Strong. You've covered the basics. A reviewer can now spend their time on what only a person can judge: your story, level and fit." };
  if (done >= 7) return { tone: "ok", text: `Close. ${left} thing${left === 1 ? "" : "s"} left to fix. These small gaps are often the difference between a shortlist and silence.` };
  if (done >= 4) return { tone: "warn", text: `You have ${left} likely issues. Each one is a common reason resumes do not get calls, and each is fixable.` };
  return { tone: "bad", text: `You have ${left} likely issues. This is very fixable, and it probably explains the silence. A review will show you exactly what to change first.` };
};

/* ------------------------------------------------------------------ how it works */
export const STEPS = [
  {
    title: "Pick the kind of review you need",
    time: "1 minute",
    text: "Choose AI reviews for instant checks, human reviews for a working professional's detailed notes, a LinkedIn review for your profile, or a mix of all three. Every plan lists exactly how many of each you get and how long it lasts.",
  },
  {
    title: "Pay once, securely",
    time: "1 minute",
    text: "Pay with UPI, card or netbanking. It is a one-time payment with no subscription, and your plan starts the moment payment is confirmed. Plans cannot be cancelled once bought, so pick the one that fits.",
  },
  {
    title: "Upload your resume",
    time: "3 to 5 minutes",
    text: "Tell us if you are a student or a working professional, your target role and your experience. Upload your resume as a PDF. Add your LinkedIn link and a job description if your plan covers them.",
  },
  {
    title: "Read your AI report",
    time: "About 2 minutes",
    text: "The AI reads your resume against your target role and gives an overall score, an ATS readiness score, grades for each section, missing keywords, your top fixes and rewritten bullets.",
  },
  {
    title: "Get a working professional's review",
    time: "Within the time shown on your plan",
    text: "If your plan includes human reviews, a working professional reads your resume line by line and writes feedback in plain language: what to keep, what to cut, what to change and what to do next. LinkedIn plans also cover your live profile. You get an email when it is ready.",
  },
  {
    title: "Fix it and apply",
    time: "Your pace",
    text: "Use the report and the reviewer's notes to update your resume. Send in the new version and get it checked again while your plan still has reviews left.",
  },
];

/* ------------------------------------------------------------------ who reviews */
export const REVIEWER_ANSWER =
  "Your resume is reviewed by working professionals: people who work in the industry and read resumes the way a hiring team does. An AI gives you a fast first pass in minutes. A person then reviews the same resume for judgement the AI cannot make, and writes your detailed feedback.";

export const REVIEWER_POINTS = [
  ["They read it like a hiring team", "A working professional reads your resume the way someone deciding who to interview reads it: fast first, then closely if you earn it."],
  ["They judge fit for your target role", "They check whether your experience, level and projects match the role and the type of company you are aiming for."],
  ["They look for proof, not claims", "Every claim should be backed by something specific. They point out the claims that will make an interviewer push back."],
  ["They write for you, not a template", "You get plain-language notes about your resume and your career story, not a generic checklist."],
];

export const AI_VS_HUMAN = [
  {
    who: "AI first pass",
    when: "In minutes",
    items: [
      "ATS readiness and whether your text can be read in order",
      "Keyword gaps against your target role or job description",
      "A score for each section",
      "Weak bullets rewritten with a stronger verb and a place for a number",
      "A consistent, instant first look so you can start fixing right away",
    ],
  },
  {
    who: "Working professional",
    when: "Within your plan's time",
    items: [
      "Whether your story is believable and well ordered",
      "What to cut, what to lead with, and what level you should aim for",
      "Judgement about your projects, roles and gaps",
      "A live check of your LinkedIn profile against your resume",
      "Tailoring to your job description, and a rewritten resume on rewrite plans",
    ],
  },
];

/* ------------------------------------------------------------------ what you get */
export const INSIDE = [
  ["Overall score and ATS readiness", "A clear score for the whole resume and a separate one for how well software can read and rank it."],
  ["Section-by-section grades", "Summary, experience, projects, skills, education and formatting, each graded with a short reason."],
  ["Your top fixes, in order", "The few changes that will matter most, with what to do for each, so you start in the right place."],
  ["Missing keywords", "The skills and terms a recruiter would search for that are missing from your resume."],
  ["Bullets rewritten", "Weak lines from your own resume, shown before and after, so you can copy the stronger version."],
  ["Detailed notes from a person", "Written feedback from a working professional, laid out with headings and lists so it is easy to act on."],
  ["LinkedIn review", "Your headline, About and experience checked against your resume, so recruiters find a consistent profile."],
  ["Match with a job description", "Paste a posting and see what you match, what is missing, and how to tailor your resume to it."],
  ["A complete rewritten resume", "On rewrite plans, the reviewer sends you a finished resume as a file, ready to apply with."],
];

/* ------------------------------------------------------------------ who it's for */
export const WHO_FOR = [
  ["Final-year students and freshers", "You have little or no experience, so your projects, internships and basics have to carry the resume. We show you how to present them so they count."],
  ["Working professionals, 1 to 10 years", "You have the experience but it reads as duties. We help you turn it into results, and pitch yourself at the right level."],
  ["People switching roles or fields", "Moving from support to development, or from services to product? We help you lead with transferable proof, not your old title."],
  ["People returning after a break", "A gap is easy to handle with one honest line and the right structure. We show you how."],
  ["People who need a job quickly", "Laid off or on a deadline? A plan with many AI reviews lets you check a new version for each application and fix it fast."],
  ["Anyone applying to many jobs", "If you have sent 30, 50 or 100 applications with little response, the resume is the first thing to fix."],
];

/* ------------------------------------------------------------------ ATS explained */
export const ATS_ANSWER =
  "An applicant tracking system (ATS) is software that employers use to collect, store and search job applications. It reads the text in your resume, matches it to the job, and helps recruiters filter and rank candidates. A resume that the ATS cannot read in order, or that lacks the job's keywords, can be ranked low or missed.";

export const ATS_HOW = [
  ["It extracts your text", "The system pulls the text out of your file. If the layout uses tables, columns or images, text can come out scrambled or missing."],
  ["It looks for matches", "It compares your words with the job's skills, titles and requirements. Exact terms and common variants count."],
  ["It ranks or filters", "Recruiters may search by keyword or sort by match. Required items you lack, or a wrong location, can filter you out."],
  ["A person decides", "The ATS does not usually make the final call. A recruiter still reads the resumes that surface, so both software and people have to like yours."],
];

export const ATS_DO = [
  "Use a single column and standard headings such as Experience, Projects, Skills and Education.",
  "Save as a text-based PDF. Test it by selecting all and pasting into a plain text file.",
  "Use the job's own terms for skills and titles, wherever they are true for you.",
  "Write dates and locations clearly and consistently.",
  "Name the file clearly, like Asha-Rao-Backend-Engineer-Resume.pdf.",
];

export const ATS_DONT = [
  "Don't use tables, text boxes, multiple columns or skill bars.",
  "Don't put contact details only in the header or footer.",
  "Don't use a scanned image or a PDF you cannot select text from.",
  "Don't stuff keywords you cannot back up. Interviewers will test them.",
  "Don't use unusual headings like “My Journey” or “Things I Know”.",
];

/* ------------------------------------------------------------------ which plan */
export const WHICH_PLAN = [
  ["I just want a quick, low-cost check", "An AI-only plan. You get instant AI reports with an ATS score, section grades and rewritten bullets, with no human review."],
  ["I want a working professional to read my resume", "A plan with human reviews. Each one gets detailed written feedback from a person, on top of the AI report."],
  ["I want my LinkedIn checked too", "A plan that includes a LinkedIn review, so your resume and profile say the same thing."],
  ["I want someone to write my resume for me", "A rewrite plan. The reviewer sends you a complete rewritten resume as a file."],
  ["I am applying to many different jobs", "A plan with many AI reviews, such as a 30-day pass. Check a version for every posting, and keep your human reviews for your best ones."],
  ["I coach or place many students", "A bulk plan with hundreds or thousands of AI reviews over a year or more."],
];

/* ------------------------------------------------------------------ privacy */
export const PRIVACY = [
  ["Who sees your resume", "Only the Target Trek reviewers who work on your review, and the AI that scans it. It is not shared with recruiters or companies."],
  ["How it is stored", "Files are kept in private cloud storage and opened only through short-lived secure links."],
  ["Payments", "Payments are handled by the payment provider. Target Trek does not store your card details."],
  ["Deleting your data", "You can ask us to delete your resume and review at any time by writing to supporttargettrek@gmail.com."],
  ["No promises we can't keep", "We improve the parts of your application that you control. We cannot guarantee an interview or a job, and nobody honestly can."],
];

/* ------------------------------------------------------------------ fact sheet (also useful for answer engines) */
export const FACTS = [
  ["What it is", "Resume Lab is an online resume and LinkedIn review service that combines an instant AI report with detailed feedback from a working professional."],
  ["Provider", "Target Trek (targettrek.in), an Indian learning platform for software engineers."],
  ["Who reviews", "Working professionals review each resume after the AI first pass."],
  ["What you send", "A PDF resume up to 10 MB, your role or college, your target role, and optionally a LinkedIn link and a job description."],
  ["What you get", "Overall and ATS scores, section grades, top fixes, missing keywords, rewritten bullets, written feedback, and on some plans a complete rewritten resume."],
  ["Speed", "The AI report arrives in minutes. The human review arrives within the time shown on your plan."],
  ["Plans", "AI-only checks, bundles that add human reviews, and larger plans valid for 30 days up to several years. Each plan lists its AI reviews, human reviews and validity."],
  ["Payment", "One-time payment in Indian rupees (INR) by UPI, card or netbanking. No subscription."],
  ["Best suited to", "Software, data and other technology roles. For other fields, reviewers focus on structure, clarity and ATS readiness."],
  ["Last updated", "16 November 2026"],
];

/* ------------------------------------------------------------------ FAQ. These exact answers also feed the FAQPage schema. */
export const FAQ = [
  {
    q: "Why am I not getting interview calls?",
    a: "Usually because of your resume, not your ability. The most common causes are: your resume lacks the job's keywords so an ATS ranks it low; bullets describe duties instead of results; your target role is unclear; the formatting breaks when software reads it; and the same resume is sent to every job. A resume review finds which of these apply to you and shows you how to fix each one.",
  },
  {
    q: "What is a resume review?",
    a: "A resume review is an expert check of your resume that shows what is working, what is costing you interviews, and exactly how to fix it. At Resume Lab it combines an instant AI report, with scores and rewritten bullets, and detailed written feedback from a working professional.",
  },
  {
    q: "How does Resume Lab work?",
    a: "You choose a plan and pay. Then you send in your details and upload your resume as a PDF. An AI report arrives within minutes. A working professional then reviews your resume and sends detailed feedback within the time shown on your plan. You fix it, and on an unlimited pass you can send in new versions until the plan ends.",
  },
  {
    q: "Who reviews my resume?",
    a: "Working professionals review your resume after the AI first pass. They read it the way a hiring team does, judge it against your target role, and write feedback specific to you. The AI handles fast, consistent checks, and the person handles judgement.",
  },
  {
    q: "How long does a resume review take?",
    a: "The AI report takes about two minutes. The human review is delivered within the time shown on your plan: within 48 hours, and within 24 hours on the Plus plan and above. You get an email as soon as it is ready.",
  },
  {
    q: "Is an AI-only resume review enough?",
    a: "An AI review is good for speed, ATS checks and keyword gaps, but it cannot judge whether your story is believable, what level you should aim for, or what to cut. That is why plans with human reviews let you add a working professional's review to any resume you send in.",
  },
  {
    q: "What is an ATS, and how do I pass it?",
    a: "An applicant tracking system (ATS) is software that employers use to collect and search applications. To do well, use a single-column, text-based PDF with standard headings, use the job's own keywords where they are true for you, and avoid tables, text boxes and graphics. Test your PDF by selecting all and pasting it into a plain text file: if it reads in order, software can read it.",
  },
  {
    q: "How long should my resume be?",
    a: "One page is usually enough for freshers and people with under about 8 years of experience. More experienced candidates can use two pages. Put the strongest material first, because recruiters skim.",
  },
  {
    q: "I am a fresher with no experience. What should my resume have?",
    a: "Lead with a short summary of the role you want, then your projects, internships, skills and education. Each project should say what you built, with which stack, one hard thing you did, and a link to a working demo or code. Two or three strong projects beat eight small ones.",
  },
  {
    q: "Can you review my LinkedIn profile too?",
    a: "Yes, on plans that include a LinkedIn review. The AI gives ideas based on your resume and target role, because it cannot open LinkedIn. A working professional then checks your live profile against your resume and writes the real feedback. Keep your profile public so the reviewer can open it.",
  },
  {
    q: "What is the difference between the plans?",
    a: "Each plan lists how many AI reviews and human reviews it includes, and how long it is valid. AI-only plans give instant AI reports. Other plans add reviews by working professionals, and some add a LinkedIn review, a job-description match or a complete rewritten resume. Larger plans last 30 days up to several years. You can buy more than one plan and the credits add up.",
  },
  {
    q: "Can you write my resume for me?",
    a: "Yes, on rewrite plans. The reviewer sends you a complete, finished resume as a PDF or Word file, based on what you submit. Other plans give you detailed comments and rewritten bullets so you can make the changes yourself.",
  },
  {
    q: "Which file formats do you accept?",
    a: "Upload your resume as a PDF up to 10 MB. PDF keeps your layout exactly as recruiters see it. Rewritten resumes can be delivered as a PDF or Word file.",
  },
  {
    q: "Can I send more than one version of my resume?",
    a: "Yes, while your plan still has AI reviews left. Send in a new version for each job and have it checked again. Human reviews are optional on each resume, so you can save them for your best version.",
  },
  {
    q: "Is my resume private?",
    a: "Yes. Only the Target Trek reviewers who work on your review, and the AI that scans it, can see your resume. It is stored in private cloud storage and is never shared with recruiters or companies. You can ask us to delete it at any time.",
  },
  {
    q: "Do you guarantee interviews or a job?",
    a: "No, and no honest service can. A review improves what you control: how clear, relevant and easy to read your resume is. Your results also depend on the job market, your skills and how you perform in interviews.",
  },
  {
    q: "Is Resume Lab only for software jobs?",
    a: "Resume Lab is built for software, data and other technology roles, and that is where the feedback is strongest. For other fields, reviewers focus on structure, clarity and ATS readiness.",
  },
  {
    q: "Can I cancel a plan after buying it?",
    a: "No. Plans cannot be cancelled once they are bought. Every plan is a single payment: there is no subscription, nothing renews and you are never charged again. Your reviews stay in your account until the plan's validity ends, so you can use them at your own pace. If you are unsure which plan to pick, the AI-only plan is the lowest-cost way to start, and credits from several plans add up.",
  },
  {
    q: "Can I get a refund?",
    a: "Plans cannot be cancelled, so we do not offer refunds for a change of mind. If something goes wrong on our side, such as a review that is not delivered, write to supporttargettrek@gmail.com and we will make it right.",
  },
];

/* ------------------------------------------------------------------ keep going: internal links */
export const NEXT_STEPS = [
  ["/mock-interviews", "Practice with a mock interview", "Once your resume gets you the call, practise the interview with an experienced engineer."],
  ["/books", "Interview preparation ebooks", "System design, Java, Spring Boot, SQL, cloud and GenAI handbooks for the rounds that follow."],
  ["/interviews", "Real interview experiences", "Read what candidates were actually asked, so you know what your resume needs to prepare you for."],
  ["/blogs", "Career and engineering articles", "Practical guides on interviews, careers and the tools engineers use."],
];

/* ------------------------------------------------------------------ plan types (the tabs above the plans) */
export const PLAN_TYPES = [
  { id: "all", label: "All plans", blurb: "Every plan, from a quick AI check to a full human and LinkedIn review." },
  { id: "ai", label: "AI reviews", blurb: "Instant AI reports in minutes. Best for quick checks and for testing every new version." },
  { id: "human", label: "Human review", blurb: "A working professional reads your resume and writes detailed feedback, on top of the AI report." },
  { id: "linkedin", label: "LinkedIn review", blurb: "Your live LinkedIn profile checked against your resume, so both tell the same story." },
  { id: "mix", label: "Mix: Human + LinkedIn", blurb: "The full package: AI report, a person's resume review and a LinkedIn review in one plan." },
  { id: "builder", label: "Resume builder", blurb: "AI writes a one-page resume for the job you want, from your own resume. One credit per build." },
];

/* a plan belongs to exactly one tab, by what it actually contains */
export const planType = (p) => {
  const h = !!p.human?.enabled;
  const l = !!p.linkedin?.enabled;
  if (!h && !l && p.ai?.enabled === false && p.builder?.enabled) return "builder"; // holds nothing but resume builder credits
  if (h && l) return "mix";
  if (l) return "linkedin";
  if (h) return "human";
  return "ai";
};

/* ------------------------------------------------------------------ sample result shown on the page (illustration only) */
export const SAMPLE = {
  role: "Backend Engineer · 3 years",
  overall: 62,
  ats: 71,
  jobMatch: 58,
  headline: "Solid base, but the resume hides your best work.",
  summary: "Your experience is real, but most bullets describe duties and the top third of page one does not say what role you want. Fix the five items below and this becomes a resume that gets shortlisted.",
  sections: [
    ["Summary", 40, "Generic. Name the role, your level, your stack and one proof point."],
    ["Experience", 66, "Good scope, but 7 of 10 bullets have no numbers."],
    ["Projects", 58, "Two projects, no links and no stack listed."],
    ["Skills", 78, "Well grouped. Remove three beginner-level tools."],
    ["Education", 90, "Clear and complete."],
    ["Formatting", 74, "Single column and readable. Move contact details out of the header."],
  ],
  strengths: ["Clear career progression across three roles", "Relevant stack: Java, Spring Boot, PostgreSQL", "Single-column, text-based PDF that software can read"],
  keywords: ["Kafka", "System design", "CI/CD", "Docker", "Microservices", "AWS"],
  fixes: [
    ["The summary says nothing about the role you want", "Recruiters decide in seconds. A generic objective wastes the best space on the page.", "Write two lines: role, level, main stack and one proof point."],
    ["Bullets list duties, not results", "“Responsible for” tells them what the job was, not what you did.", "Start with a verb and add a number: users, time saved, requests, team size."],
    ["Projects have no stack or link", "Without them a project proves nothing.", "Add stack, one hard thing you built and a GitHub or live link."],
  ],
  bullets: [
    ["Worked on APIs and fixed bugs for the payments team.", "Built 6 Spring Boot microservices for payments and cut open production bugs by [35]% in [two] quarters."],
    ["Improved the performance of the search feature.", "Cut search response time from [1.8s] to [400ms] by adding an index and caching the top 1,000 queries."],
  ],
  human: {
    name: "Rahul",
    role: "Senior Software Engineer",
    score: 64,
    delivered: "Delivered in 31 hours",
    summary: "You are a stronger engineer than this resume shows. The work is there, but a recruiter has to dig for it. Lead with the payments platform, cut the first role to three bullets and be specific about scale.",
    strengths: ["You moved from support to backend in 18 months, which is a good story to tell", "Ownership shows up in the payments work"],
    changes: ["Move the payments platform to the top of your latest role", "Drop the 2019 internship to one line", "Aim for mid-level backend roles, not senior yet", "Link your two best repositories"],
    linkedin: "Your headline says “Software Engineer”. Change it to “Backend Engineer · Java, Spring Boot, AWS”. Your About section repeats the resume, so use it to tell the payments story in three lines.",
    next: ["Apply the five changes above", "Send the new version back for an AI re-check", "Then start applying to 10 roles a week"],
  },
};

/* ------------------------------------------------------------------ the human review, in detail */
export const REVIEWER_PROCESS = [
  ["Reads your resume the way a hiring team does", "A first fast pass, then a slow one. They note what a recruiter would see in the first ten seconds and what is easy to miss."],
  ["Checks it against your target role", "Your level, stack and projects are compared with the role and the kind of company you named, and with your job description if you added one."],
  ["Marks every weak claim", "Vague bullets, claims with no proof and anything an interviewer will push back on are flagged, with the reason."],
  ["Writes plain-language feedback for you", "Headings, short lists and clear next steps, not a template. You can act on it the same day."],
  ["Reviews your LinkedIn profile (LinkedIn plans)", "They open your live profile and compare headline, About and experience with your resume, so a recruiter finds one consistent story."],
  ["Sends a rewritten resume (rewrite plans)", "On rewrite plans you also get a complete, finished resume as a PDF or Word file."],
];

export const INSIDE_TAGS = ["AI", "AI", "AI", "AI", "AI", "Human", "LinkedIn", "AI", "Human"];

/* ------------------------------------------------------------------ REDESIGN: page sections, feature explorer, plan comparison */
export const PAGE_NAV = [
  ["features", "Features"],
  ["how-it-works", "How it works"],
  ["sample", "Sample report"],
  ["pricing", "Plans"],
  ["reviewers", "Human review"],
  ["mistakes", "12 mistakes"],
  ["ats", "ATS guide"],
  ["faq", "FAQ"],
];

export const HERO_FACTS = [
  ["~2 min", "for your AI report"],
  ["Real people", "working professionals review"],
  ["PDF", "upload, up to 10 MB"],
  ["Pay once", "no subscription"],
];

/*
  Every feature, in the order a visitor meets them. `where` says how you get it:
    plan    = paid: comes with the plans named in `plans`
    account = free in your space once you have an account
*/
/* The resume builder is switched on and off by an admin (Resume Lab admin > Builder). `featuresFor` / `compareRowsFor` take that switch. */
const BUILDER_IDS = ["builder"];

const ALL_FEATURES = [
  {
    id: "ai",
    name: "AI resume report",
    where: "plan",
    plans: ["ai", "human", "linkedin", "mix"],
    time: "About 2 minutes",
    pitch: "Upload a PDF and get a full report before your tea gets cold: what works, what is costing you calls, and what to fix first.",
    points: [
      "Overall score and a separate ATS readiness score",
      "Your chance of being shortlisted for the role you named",
      "Grades for summary, experience, projects, skills, education and formatting",
      "Missing keywords for your target role",
      "Your weakest bullets rewritten, before and after",
      "Likely interview questions and a plan for the week",
    ],
  },
  {
    id: "human",
    name: "Review by a working professional",
    where: "plan",
    plans: ["human", "mix"],
    time: "Within the time on your plan",
    pitch: "A person who works in the industry reads your resume line by line and writes notes for you, not a template.",
    points: [
      "Whether your story is believable and well ordered",
      "What to cut, what to lead with, and what level to aim for",
      "Judgement on projects, roles and gaps",
      "Plain-language notes with headings and next steps",
      "Email the moment it is ready",
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn profile review",
    where: "plan",
    plans: ["linkedin", "mix"],
    time: "Within the time on your plan",
    pitch: "A reviewer opens your live profile and checks it against your resume, so a recruiter finds one consistent story.",
    points: [
      "Headline rewritten for the role you want",
      "About section that tells your best story in three lines",
      "Experience that matches your resume, without repeating it",
      "AI ideas first, then a person's real feedback",
    ],
  },
  {
    id: "jd",
    name: "Job description match",
    where: "plan",
    plans: ["ai", "human", "linkedin", "mix"],
    some: true,
    time: "With your AI report",
    pitch: "Paste the posting you are applying to. See what you match, what is missing, and how to tailor your resume to it.",
    points: [
      "Matched and missing skills, side by side",
      "Which gaps are must-haves and which are nice-to-haves",
      "Where in your resume to add each true match",
    ],
  },
  {
    id: "builder",
    name: "AI resume builder",
    where: "plan",
    plans: ["ai", "human", "linkedin", "mix", "builder"],
    some: true,
    time: "A few minutes",
    pitch: "Upload your resume and a job description (or just the role you want). The AI writes a one-page, ATS-friendly resume from your own facts, and asks before it adds anything.",
    points: [
      "Built from your real jobs, projects and links, never invented",
      "Matches the job description, or the role and details you give",
      "Asks a short question for each gap instead of making up skills",
      "Edit every line and link in a form, then download the PDF",
      "One builder credit per resume",
    ],
  },
  {
    id: "rewrite",
    name: "Complete rewritten resume",
    where: "plan",
    plans: ["human", "mix"],
    some: true,
    time: "Within the time on your plan",
    pitch: "On rewrite plans, the reviewer sends you a finished resume as a file, ready to apply with.",
    points: [
      "Written by the reviewer from what you sent in",
      "Delivered as a PDF or Word file",
      "Keeps your facts, sharpens the words",
    ],
  },
  {
    id: "space",
    name: "Your space",
    where: "account",
    time: "Always on",
    pitch: "Every report, every version and every credit in one place. Send a new version for each job and compare.",
    points: [
      "All your reviews, newest first",
      "Credits left and days left on each plan",
      "Add a human review to any resume you already sent in",
      "Finish an unfinished payment in one tap",
    ],
  },
];

/* the builder is shown only while an admin has it switched on for everyone */
export const featuresFor = (builderOn) => ALL_FEATURES.filter((f) => builderOn || !BUILDER_IDS.includes(f.id));

/* "I want…" shortcuts that pick a plan type */
export const NEEDS = [
  ["A quick, low-cost check", "ai"],
  ["A person to read my resume", "human"],
  ["My LinkedIn checked too", "linkedin"],
  ["Everything together", "mix"],
  ["A new version for every job", "ai"],
];

/* the comparison table: each row is a feature, each cell a plan type. true = yes, false = no, a string = a note */
export const COMPARE_COLS = [
  ["ai", "AI reviews"],
  ["human", "Human review"],
  ["linkedin", "LinkedIn review"],
  ["mix", "Mix"],
  ["builder", "Builder"],
];
const ALL_COMPARE_ROWS = [
  ["AI report with scores, keywords and rewritten bullets", { ai: true, human: true, linkedin: true, mix: true, builder: false }],
  ["Written review by a working professional", { ai: false, human: true, linkedin: false, mix: true, builder: false }],
  ["Live LinkedIn profile review by a person", { ai: false, human: false, linkedin: true, mix: true, builder: false }],
  ["Job description match", { ai: "Some plans", human: "Some plans", linkedin: "Some plans", mix: "Some plans", builder: "In the builder" }],
  ["Complete rewritten resume", { ai: false, human: "Rewrite plans", linkedin: false, mix: "Rewrite plans", builder: false }],
  ["AI resume builder", { ai: "Some plans", human: "Some plans", linkedin: "Some plans", mix: "Some plans", builder: true }],
  ["Credits add up across plans", { ai: true, human: true, linkedin: true, mix: true, builder: true }],
];
export const compareRowsFor = (builderOn) => ALL_COMPARE_ROWS.filter(([label]) => builderOn || !/builder/i.test(label));

export const PLAN_ASSURANCE = [
  ["Secure payment", "UPI, card or netbanking. We never see your card details."],
  ["Pay once", "No subscription. Nothing renews and you are never charged again."],
  ["Credits add up", "Buy more than one plan and your reviews stack. Each plan keeps its own validity."],
  ["No cancellations", "Plans cannot be cancelled once bought, so start small if you are unsure."],
];
