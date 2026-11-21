/*
  FREE ATS SCORE CHECKER: the scoring engine behind /resume-review/ats-score-checker.

  Runs entirely in the browser on plain text (pasted, or pulled out of a PDF on the visitor's own device). Nothing is uploaded.
  It is a transparent checklist modelled on what applicant tracking systems and recruiters reward. It is NOT a copy of any one
  vendor's secret formula, and the page says so. Every weight below is shown on the page (ATS_WEIGHTS), so the score can be explained.

    keywords from the job        30   only when a job description is pasted; otherwise its weight is spread over the rest
    standard sections            14   Experience, Education, Skills, Projects, Summary, with headings an ATS recognises
    contact details              10   email, phone, LinkedIn, GitHub or portfolio, city
    measurable results           14   bullet points with numbers, %, money, time or scale
    action verbs                 10   bullets that start with a strong verb, not "Responsible for"
    length                        8   roughly one to two pages of text
    readable by software          8   no table or column debris, no garbled characters, real text (not a scanned image)
    clean language                6   no first person, no empty buzzwords, no personal details an Indian resume no longer needs
*/

export const ATS_WEIGHTS = [
  { id: "keywords", label: "Keywords from the job", weight: 30, note: "Only counted when you paste a job description." },
  { id: "sections", label: "Standard sections", weight: 14, note: "Experience, Education, Skills, Projects and a Summary, with plain headings." },
  { id: "impact", label: "Measurable results", weight: 14, note: "Bullet points that show a number: %, ₹, time saved, users, scale." },
  { id: "contact", label: "Contact details", weight: 10, note: "Email, phone, LinkedIn, GitHub or portfolio, and your city." },
  { id: "verbs", label: "Action verbs", weight: 10, note: "Bullets that start with Built, Led, Cut, Shipped, not \"Responsible for\"." },
  { id: "length", label: "Length", weight: 8, note: "About 350 to 900 words: one page for freshers, up to two for experienced." },
  { id: "parse", label: "Readable by software", weight: 8, note: "Real text in one column, without table or text-box debris." },
  { id: "language", label: "Clean language", weight: 6, note: "No I/me/my, no empty buzzwords, no date of birth or marital status." },
];

/* ------------------------------------------------------------------ vocabulary */
/* skills and tools recruiters search for. Lower case. Multi-word terms first so "machine learning" wins over "machine". */
const SKILLS = [
  // languages
  "javascript", "typescript", "python", "java", "c++", "c#", "golang", "go", "rust", "kotlin", "swift", "scala", "ruby", "php", "r", "dart", "sql", "bash", "shell scripting", "perl", "matlab", "solidity",
  // web
  "react", "react native", "next.js", "angular", "vue", "svelte", "redux", "html", "css", "sass", "tailwind", "bootstrap", "jquery", "webpack", "vite", "graphql", "rest api", "rest apis", "restful", "grpc", "websocket", "websockets", "node.js", "express", "nestjs", "django", "flask", "fastapi", "spring boot", "spring", "hibernate", "microservices", "laravel", ".net", "asp.net", "rails",
  // data
  "postgresql", "mysql", "mongodb", "redis", "cassandra", "dynamodb", "elasticsearch", "oracle", "sql server", "sqlite", "firebase", "kafka", "rabbitmq", "spark", "hadoop", "airflow", "snowflake", "bigquery", "databricks", "dbt", "etl", "data warehouse", "data modeling", "pandas", "numpy", "power bi", "tableau", "excel", "looker",
  // cloud & devops
  "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform", "ansible", "jenkins", "github actions", "gitlab ci", "ci/cd", "linux", "nginx", "prometheus", "grafana", "helm", "serverless", "lambda", "ec2", "s3", "cloudformation", "devops", "sre", "observability",
  // ai / ml
  "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch", "scikit-learn", "keras", "llm", "llms", "generative ai", "genai", "rag", "langchain", "prompt engineering", "hugging face", "openai", "vector database", "mlops",
  // testing & quality
  "selenium", "cypress", "playwright", "jest", "junit", "pytest", "testng", "appium", "postman", "unit testing", "integration testing", "test automation", "manual testing", "api testing", "performance testing", "jmeter", "tdd",
  // practice
  "system design", "data structures", "algorithms", "design patterns", "object oriented", "oop", "multithreading", "concurrency", "distributed systems", "caching", "load balancing", "scalability", "security", "oauth", "jwt", "agile", "scrum", "jira", "git", "github", "code review",
  // mobile
  "android", "ios", "flutter", "jetpack compose", "swiftui",
  // product, design, business
  "figma", "ui/ux", "product management", "roadmap", "stakeholder management", "a/b testing", "analytics", "seo", "google analytics", "sales", "crm", "salesforce", "sap", "communication", "leadership", "project management",
];

/* the same skill written two ways */
const ALIAS = {
  js: "javascript", ts: "typescript", "node": "node.js", nodejs: "node.js", "react.js": "react", reactjs: "react", nextjs: "next.js",
  postgres: "postgresql", mongo: "mongodb", k8s: "kubernetes", "amazon web services": "aws", "google cloud platform": "gcp", "microsoft azure": "azure",
  "ci cd": "ci/cd", "ci-cd": "ci/cd", "springboot": "spring boot", "ml": "machine learning", "dl": "deep learning", "gen ai": "generative ai", "golang": "go",
  "rest": "rest api", "restful": "rest api", "rest apis": "rest api", "websockets": "websocket", "llms": "llm", "sklearn": "scikit-learn", "oops": "oop", "object oriented programming": "oop",
  "object oriented": "oop", "dsa": "data structures", "powerbi": "power bi",
};
const canon = (k) => ALIAS[k] || k;

/* very short or ambiguous words are only counted when written exactly as a skill (case-sensitive, standalone) */
const AMBIGUOUS = new Set(["go", "r", "c#", "rest", "swift", "rust", "spring", "express", "rails", "sap", "seo", "sales", "excel", "security", "analytics", "communication", "leadership", "lambda", "s3", "ec2", "node"]);

const STRONG_VERBS = /^(built|led|launched|shipped|designed|developed|created|implemented|architected|automated|reduced|cut|increased|improved|grew|boosted|optimi[sz]ed|scaled|migrated|delivered|owned|drove|spearheaded|established|introduced|streamlined|accelerated|saved|generated|negotiated|mentored|trained|coached|managed|directed|founded|engineered|refactored|deployed|integrated|analy[sz]ed|researched|resolved|debugged|fixed|wrote|authored|published|won|achieved|secured|expanded|transformed|modernized|modernised|configured|maintained|tested|validated|reviewed|coordinated|organi[sz]ed|planned|prototyped|programmed|enabled|partnered|collaborated|presented|conducted|identified|replaced|consolidated|lowered|raised|doubled|tripled|halved)\b/i;
const WEAK_START = /^(responsible for|responsibilities|worked on|working on|helped|assisted|participated|involved in|was involved|tasked with|handled|dealt with|duties included|in charge of|part of|contributed to)\b/i;
const FLUFF = /\b(hard[- ]?working|team player|passionate|results[- ]driven|go[- ]getter|self[- ]motivated|detail[- ]oriented|dynamic|synergy|think outside the box|seeking a challenging|quick learner|highly motivated|dedicated professional|out of the box)\b/gi;
const PRONOUN = /(^|[\s(])(i|my|me|myself)(?=[\s,.;:)!?]|$)/gim;
const PERSONAL = /\b(date of birth|d\.o\.b|dob|marital status|father'?s name|mother'?s name|religion|nationality|gender|caste|passport no|declaration)\b/i;
const NUMBER = /(\d+(\.\d+)?\s?(%|percent|x\b|k\b|m\b|cr\b|crore|lakh|lpa|ms\b|sec|seconds|minutes|hours|hrs|days|weeks|users|customers|clients|requests|rps|qps|tps)|[₹$€£]\s?\d|\b\d{2,}\b|\b\d+\+)/i;

const HEADINGS = {
  experience: /^(work experience|professional experience|experience|employment history|employment|work history|internships?|internship experience|career history)\b/i,
  education: /^(education|academic background|academics|educational qualifications?|qualifications?|academic details)\b/i,
  skills: /^(technical skills|skills|core skills|key skills|skills (&|and) tools|tech stack|technologies|core competencies|competencies|tools)\b/i,
  projects: /^(projects|personal projects|academic projects|key projects|selected projects|side projects)\b/i,
  summary: /^(summary|professional summary|profile|profile summary|career summary|about me|objective|career objective)\b/i,
  extras: /^(certifications?|achievements|awards|accomplishments|publications|volunteering|leadership|extracurricular|courses|languages)\b/i,
};

const BULLET = /^\s*([•●▪▫◦‣∙·○■□➤➢►▶✓✔\-–—*]|\d{1,2}[.)])\s+/;

/* ------------------------------------------------------------------ helpers */
const clamp = (n, a = 0, b = 100) => Math.max(a, Math.min(b, n));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const words = (s) => (String(s || "").match(/[\p{L}\p{N}][\p{L}\p{N}+#./'-]*/gu) || []);

/* find skill words in a text. Returns a Set of canonical names. */
function skillsIn(text) {
  const raw = ` ${String(text || "")} `;
  const low = raw.toLowerCase();
  const found = new Set();
  const all = [...SKILLS, ...Object.keys(ALIAS)].sort((a, b) => b.length - a.length);
  for (const k of all) {
    const re = new RegExp(`(^|[^a-z0-9+#])${esc(k)}(?=$|[^a-z0-9+#])`, "i");
    if (AMBIGUOUS.has(k)) {
      // only the way a skill is written, never the everyday word: Go / GO, R, C#, REST, Swift, Spring, Excel, SEO, S3...
      const forms = [...new Set([k[0].toUpperCase() + k.slice(1), k.toUpperCase()])];
      if (forms.some((f) => new RegExp(`(^|[\\s,(/|•·:-])${esc(f)}(?=$|[\\s,)/|.;:])`).test(raw))) found.add(canon(k));
      continue;
    }
    if (re.test(low)) found.add(canon(k));
  }
  // "spring boot" already says "spring", "react native" already says "react": keep the longer, more specific skill only
  for (const k of [...found]) {
    if ([...found].some((f) => f !== k && (f.startsWith(`${k} `) || f.endsWith(` ${k}`)))) found.delete(k);
  }
  return found;
}

/* how often a skill appears in the job post: a rough "how much does this job care" signal */
function weightInJob(jd, skill) {
  const low = jd.toLowerCase();
  const variants = [skill, ...Object.entries(ALIAS).filter(([, v]) => v === skill).map(([k]) => k)];
  let n = 0;
  for (const v of variants) n += (low.match(new RegExp(`(^|[^a-z0-9+#])${esc(v)}(?=$|[^a-z0-9+#])`, "g")) || []).length;
  // near "must", "required", "mandatory" counts as a must-have
  const must = variants.some((v) => new RegExp(`(must|required|mandatory|need to have|strong (knowledge|experience) (of|in|with))[^.\\n]{0,80}${esc(v)}|${esc(v)}[^.\\n]{0,40}\\b(must|required|mandatory)\\b`, "i").test(jd));
  return { count: n, must };
}

const lineList = (text) => String(text || "").replace(/\r/g, "").split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);

/* lines that read like achievement bullets: a bullet character, or a sentence of 6+ words in a job/project block */
function bulletLines(lines) {
  const out = [];
  for (const l of lines) {
    const isHeading = Object.values(HEADINGS).some((re) => re.test(l)) && words(l).length <= 5;
    if (isHeading) continue;
    if (BULLET.test(l)) { out.push(l.replace(BULLET, "").trim()); continue; }
    const w = words(l).length;
    if (w >= 7 && w <= 45 && /^[A-Z]/.test(l) && !/@|https?:|linkedin|github|\+91|\|/.test(l)) out.push(l);
  }
  return out.filter((l) => words(l).length >= 4);
}

/* ------------------------------------------------------------------ the check */
/*
  checkAts(resumeText, jobText?) → {
    score, grade, words, hasJob,
    checks: [{ id, label, weight, score (0..100), status: ok|warn|bad, detail, tips: [] }],
    keywords: { matched: [{ name, must }], missing: [{ name, must }], extra: [name] } | null,
    stats: { bullets, quantified, strongStarts, weakStarts },
  }
*/
export function checkAts(resumeText, jobText = "") {
  const text = String(resumeText || "");
  const job = String(jobText || "").trim();
  const lines = lineList(text);
  const all = lines.join("\n");
  const wc = words(all).length;
  const bullets = bulletLines(lines);
  const checks = [];

  /* 1. keywords from the job */
  let keywords = null;
  if (job.length >= 80) {
    const want = [...skillsIn(job)];
    const have = skillsIn(all);
    const scored = want.map((name) => ({ name, ...weightInJob(job, name) }));
    const matched = scored.filter((k) => have.has(k.name));
    const missing = scored.filter((k) => !have.has(k.name)).sort((a, b) => Number(b.must) - Number(a.must) || b.count - a.count);
    const w = (k) => (k.must ? 3 : 1) + Math.min(2, k.count - 1);
    const total = scored.reduce((s, k) => s + w(k), 0);
    const got = matched.reduce((s, k) => s + w(k), 0);
    const pct = total ? Math.round((got / total) * 100) : 0;
    const mustMissing = missing.filter((k) => k.must);
    keywords = {
      matched: matched.map(({ name, must }) => ({ name, must })),
      missing: missing.map(({ name, must }) => ({ name, must })),
      extra: [...have].filter((h) => !want.includes(h)).slice(0, 16),
    };
    const tips = [];
    if (mustMissing.length) tips.push(`The job marks ${mustMissing.slice(0, 3).map((k) => k.name).join(", ")} as required. If you have used them, say where (job, project or course).`);
    if (missing.length) tips.push("Use the job's exact wording: if it says \"CI/CD\", write CI/CD, not just \"pipelines\".");
    tips.push("Put the best-matching skills in your summary and first job, not only in the Skills list.");
    tips.push("Only add skills you can talk about in an interview. Recruiters test them.");
    checks.push({
      id: "keywords",
      label: "Keywords from the job",
      weight: 30,
      score: want.length ? pct : 70,
      detail: want.length
        ? `You match ${matched.length} of ${want.length} skills this job mentions${mustMissing.length ? `, and miss ${mustMissing.length} it calls required` : ""}.`
        : "We couldn't find specific skills or tools in this job description, so keyword match is estimated.",
      tips,
    });
  }

  /* 2. standard sections */
  const found = {};
  for (const [k, re] of Object.entries(HEADINGS)) found[k] = lines.some((l) => re.test(l) && words(l).length <= 6);
  const sectionPts = (found.experience ? 34 : 0) + (found.education ? 22 : 0) + (found.skills ? 22 : 0) + (found.projects ? 12 : 0) + (found.summary ? 10 : 0);
  // a fresher with projects but no experience heading is fine
  const sectionScore = clamp(!found.experience && found.projects ? sectionPts + 22 : sectionPts);
  const missingSections = [
    !found.experience && !found.projects && "Experience (or Internships / Projects)",
    !found.education && "Education",
    !found.skills && "Skills",
    !found.summary && "Summary",
  ].filter(Boolean);
  checks.push({
    id: "sections",
    label: "Standard sections",
    weight: 14,
    score: sectionScore,
    detail: missingSections.length ? `We couldn't find a clear heading for: ${missingSections.join(", ")}.` : "All the main sections have headings an ATS recognises.",
    tips: missingSections.length
      ? ["Use plain headings: Summary, Experience, Projects, Skills, Education. Avoid creative ones like \"My Journey\".", "Put each heading on its own line, in the same style."]
      : ["Keep the order that suits you: experienced people lead with Experience, freshers with Projects or Education."],
  });

  /* 3. measurable results */
  const quantified = bullets.filter((b) => NUMBER.test(b)).length;
  const qShare = bullets.length ? quantified / bullets.length : 0;
  const impactScore = bullets.length < 3 ? 25 : clamp(Math.round((qShare / 0.5) * 100));
  checks.push({
    id: "impact",
    label: "Measurable results",
    weight: 14,
    score: impactScore,
    detail: bullets.length < 3
      ? "We found very few bullet points. Recruiters scan bullets first."
      : `${quantified} of ${bullets.length} bullet points show a number (${Math.round(qShare * 100)}%). Aim for at least half.`,
    tips: [
      "Use the formula: did X, measured by Y, by doing Z. \"Cut page load from 3.1s to 1.2s by lazy-loading images.\"",
      "Numbers can be scale, not only results: users, requests per second, team size, records, ₹ saved, hours saved.",
    ],
  });

  /* 4. contact details */
  const has = {
    email: /[\w.+-]+@[\w-]+\.[\w.-]+/.test(all),
    phone: (all.match(/\+?\d[\d\s().-]{8,16}\d/g) || []).some((m) => { const n = m.replace(/\D/g, "").length; return n >= 10 && n <= 13; }),
    linkedin: /linkedin\.com\/in\//i.test(all) || /\blinkedin\b/i.test(lines.slice(0, 8).join(" ")),
    link: /github\.com\/|gitlab\.com\/|behance\.net|dribbble\.com|kaggle\.com|leetcode\.com|portfolio|https?:\/\/(?!.*linkedin)/i.test(all),
    city: /\b(bengaluru|bangalore|hyderabad|pune|mumbai|delhi|new delhi|noida|gurugram|gurgaon|chennai|kolkata|ahmedabad|jaipur|kochi|indore|chandigarh|coimbatore|lucknow|bhubaneswar|nagpur|remote|india|usa|london|singapore|dubai)\b/i.test(lines.slice(0, 10).join(" ")),
  };
  const contactScore = (has.email ? 35 : 0) + (has.phone ? 30 : 0) + (has.linkedin ? 15 : 0) + (has.link ? 10 : 0) + (has.city ? 10 : 0);
  const missingContact = [!has.email && "email", !has.phone && "phone number", !has.linkedin && "LinkedIn", !has.link && "GitHub or portfolio link", !has.city && "city"].filter(Boolean);
  checks.push({
    id: "contact",
    label: "Contact details",
    weight: 10,
    score: contactScore,
    detail: missingContact.length ? `Missing or hard to find: ${missingContact.join(", ")}.` : "Email, phone, LinkedIn, a link to your work and your city are all there.",
    tips: ["Put contact details in the body of the page, not in a header or footer that some ATS skip.", "Write the city you live in (or \"Open to relocate\"). Some recruiters filter by location."],
  });

  /* 5. action verbs */
  const strong = bullets.filter((b) => STRONG_VERBS.test(b)).length;
  const weak = bullets.filter((b) => WEAK_START.test(b)).length;
  const verbScore = bullets.length < 3 ? 30 : clamp(Math.round((strong / bullets.length / 0.6) * 100) - weak * 8);
  checks.push({
    id: "verbs",
    label: "Action verbs",
    weight: 10,
    score: verbScore,
    detail: bullets.length < 3
      ? "Not enough bullet points to judge how they start."
      : `${strong} of ${bullets.length} bullets start with a strong verb${weak ? `; ${weak} ${weak === 1 ? "starts" : "start"} with a weak phrase like "Responsible for" or "Worked on"` : ""}.`,
    tips: ["Start each bullet with what you did: Built, Led, Cut, Shipped, Automated, Migrated.", "Replace \"Responsible for testing\" with \"Wrote 120 API tests that caught 18 bugs before release\"."],
  });

  /* 6. length */
  const lengthScore = wc < 150 ? 20 : wc < 250 ? 55 : wc < 350 ? 80 : wc <= 900 ? 100 : wc <= 1200 ? 75 : 45;
  checks.push({
    id: "length",
    label: "Length",
    weight: 8,
    score: lengthScore,
    detail: `About ${wc.toLocaleString("en-IN")} words. ${wc < 350 ? "That's short: add results and context to your best work." : wc > 900 ? "That's long: cut older or less relevant points." : "A good length for one to two pages."}`,
    tips: ["Freshers: one page. Three or more years of experience: up to two pages.", "Cut anything older than ten years unless it is directly relevant."],
  });

  /* 7. readable by software */
  const garbled = (all.match(/[^\n\t -~₹€£•●▪◦‣■➤►✓✔–—“”‘’…]/g) || []).length;
  const pipes = lines.filter((l) => (l.match(/\s[|│┃]\s|\t/g) || []).length >= 2).length;
  const tiny = lines.filter((l) => words(l).length === 1).length;
  const fragShare = lines.length ? tiny / lines.length : 0;
  let parseScore = 100;
  if (wc < 120) parseScore -= 50; // likely a scanned image or a design-tool export
  if (garbled > 8) parseScore -= 25;
  if (pipes > 3) parseScore -= 20;
  if (fragShare > 0.35) parseScore -= 20; // many one-word lines: text from columns or text boxes coming out in pieces
  parseScore = clamp(parseScore);
  const parseIssues = [
    wc < 120 && "very little text came through (a scanned or image-only PDF?)",
    garbled > 8 && "unusual characters that may come out garbled",
    pipes > 3 && "table-like rows separated by pipes or tabs",
    fragShare > 0.35 && "many one-word lines, which usually means columns or text boxes",
  ].filter(Boolean);
  checks.push({
    id: "parse",
    label: "Readable by software",
    weight: 8,
    score: parseScore,
    detail: parseIssues.length ? `Possible problems: ${parseIssues.join("; ")}.` : "The text reads in a clean order, the way an ATS will see it.",
    tips: ["Use one column, no tables, text boxes, icons for contact details or skill bars.", "Export to PDF from Word or Google Docs, then check you can select and copy the text."],
  });

  /* 8. clean language */
  const pronouns = (all.match(PRONOUN) || []).length;
  const fluff = [...new Set((all.match(FLUFF) || []).map((f) => f.toLowerCase()))];
  const personal = PERSONAL.test(all);
  const langScore = clamp(100 - Math.min(40, pronouns * 6) - Math.min(36, fluff.length * 12) - (personal ? 24 : 0));
  const langIssues = [pronouns > 0 && `${pronouns} uses of I/me/my`, fluff.length > 0 && `buzzwords (${fluff.slice(0, 3).join(", ")})`, personal && "personal details such as date of birth, marital status or a declaration"].filter(Boolean);
  checks.push({
    id: "language",
    label: "Clean language",
    weight: 6,
    score: langScore,
    detail: langIssues.length ? `Found ${langIssues.join(", ")}.` : "No first person, empty buzzwords or unnecessary personal details.",
    tips: ["Drop \"I\" and \"my\": \"Built a booking API\" not \"I built a booking API\".", "Show qualities with results instead of words like \"hard-working\" or \"team player\".", "Indian resumes no longer need date of birth, father's name, marital status or a declaration."],
  });

  /* total: weighted average over the checks we ran (no job description → keyword weight is spread over the rest) */
  const totalW = checks.reduce((s, c) => s + c.weight, 0);
  const score = Math.round(checks.reduce((s, c) => s + c.score * c.weight, 0) / totalW);
  checks.forEach((c) => { c.score = Math.round(c.score); c.status = c.score >= 75 ? "ok" : c.score >= 50 ? "warn" : "bad"; });

  return {
    score,
    grade: score >= 80 ? "Strong" : score >= 65 ? "Good" : score >= 50 ? "Needs work" : "Weak",
    words: wc,
    hasJob: Boolean(keywords),
    checks,
    keywords,
    stats: { bullets: bullets.length, quantified, strongStarts: strong, weakStarts: weak },
  };
}

/* ------------------------------------------------------------------ PDF → text, on the visitor's device */
/* pdf.js is loaded only when someone picks a file, so the page itself stays light (and prerenders on the server). */
export async function pdfToText(file) {
  const { pdfjs } = await import("react-pdf");
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  }
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data }).promise;
  const pages = [];
  for (let p = 1; p <= Math.min(doc.numPages, 6); p += 1) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    let line = "";
    const out = [];
    for (const item of content.items) {
      if (!("str" in item)) continue;
      line += item.str;
      if (item.hasEOL) { out.push(line); line = ""; }
    }
    if (line) out.push(line);
    pages.push(out.join("\n"));
  }
  await doc.destroy?.();
  return pages.join("\n\n").replace(/[ \t]+\n/g, "\n").trim();
}
