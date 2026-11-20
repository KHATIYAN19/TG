/*
  RESUME STRENGTH: how a resume is judged, as a transparent checklist (runs in the browser, so it updates as you type).

  It follows what recruiters and applicant tracking systems (ATS) reward:
    - the right keywords from the job (ATS search and ranking)           22
    - points that start with a strong action verb                         14
    - points that show a result (numbers, scale)                          14   Google's "XYZ" idea: accomplished X, as measured by Y, by doing Z
    - points of a readable length (one line, 8 to 28 words)               10
    - complete contact details                                            10
    - a short, specific summary                                            8
    - enough substance per job and project                                 6
    - links to real profiles (LinkedIn, GitHub)                            6
    - a clear skills section                                               6
    - no first person or empty buzzwords                                   6
    - varied verbs (no repeats)                                            4
    - education present                                                    4
  Nothing here changes the resume: it only tells the person what to improve.
*/
const WEAK_START = /^(responsible|worked|helped|assisted|participated|involved|tasked|handled|dealt|utilized|made|did|was|were|part of|contributed to|various|many)\b/i;
const FLUFF = /\b(hard[- ]?working|team player|passionate|results[- ]driven|go[- ]getter|self[- ]motivated|detail[- ]oriented|dynamic|synergy|think outside the box|seeking a challenging)\b/i;
const PRONOUN = /(^|\s)(I|my|me|we|our)\s/;
const ALIAS = { js: "javascript", javascript: "js", ts: "typescript", typescript: "ts", postgres: "postgresql", postgresql: "postgres", mongo: "mongodb", mongodb: "mongo", k8s: "kubernetes", kubernetes: "k8s", node: "node.js", "node.js": "node", nodejs: "node.js", react: "react.js", "react.js": "react", aws: "amazon web services", ml: "machine learning", "machine learning": "ml", ci: "ci/cd", "ci/cd": "ci", "rest api": "rest", rest: "rest api", "c++": "cpp" };

const loose = (s) => ` ${String(s ?? "").toLowerCase().replace(/[^a-z0-9+#./]+/g, " ").replace(/\s+/g, " ").trim()} `;
const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean);

const bulletsOf = (d) => [
  ...(d.experience || []).flatMap((e) => (e.bullets || []).map((t) => String(t || "").trim()).filter(Boolean)),
  ...(d.projects || []).flatMap((p) => (p.bullets || []).map((t) => String(t || "").trim()).filter(Boolean)),
];

const fullText = (d) => loose([
  d.basics?.headline, d.summary,
  ...(d.experience || []).flatMap((e) => [e.role, e.company, ...(e.bullets || [])]),
  ...(d.projects || []).flatMap((p) => [p.name, p.tech, ...(p.bullets || [])]),
  ...(d.skills || []).flatMap((g) => g.items || []),
  ...(d.education || []).flatMap((e) => [e.degree, e.school]),
  ...(d.extras || []).flatMap((g) => g.items || []),
].join(" "));

const hasTerm = (hay, term) => {
  const t = loose(term).trim();
  if (!t) return true;
  const forms = [t, t.replace(/ /g, ""), ALIAS[t]].filter(Boolean).map((x) => loose(x).trim());
  return forms.some((f) => hay.includes(` ${f} `) || hay.includes(` ${f}s `));
};

const clamp = (n) => Math.max(0, Math.min(1, n));

export function scoreResume(d) {
  const bullets = bulletsOf(d);
  const n = bullets.length;
  const hay = fullText(d);
  const keywords = d.jdKeywords || [];
  const matched = keywords.filter((k) => hasTerm(hay, k));
  const missing = keywords.filter((k) => !hasTerm(hay, k));

  const verbs = bullets.map((b) => words(b)[0]?.toLowerCase().replace(/[^a-z]/g, "")).filter(Boolean);
  const verbCount = verbs.reduce((m, v) => ({ ...m, [v]: (m[v] || 0) + 1 }), {});
  const repeated = Object.entries(verbCount).filter(([, c]) => c > 2).map(([v]) => v);
  const strong = bullets.filter((b) => !WEAK_START.test(b) && /^[A-Z]/.test(b) && !PRONOUN.test(` ${b} `)).length;
  const withNumber = bullets.filter((b) => /\d/.test(b)).length;
  const goodLen = bullets.filter((b) => { const w = words(b).length; return w >= 8 && w <= 28; }).length;

  const b = d.basics || {};
  const contactBits = [b.name, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email || ""), b.phone, b.location].filter(Boolean).length;
  const linkText = (d.links || []).map((l) => `${l.url || ""}`.toLowerCase()).join(" ");
  const hasLi = linkText.includes("linkedin.com");
  const hasGh = linkText.includes("github.com");
  const sumWords = words(d.summary).length;
  const groups = (d.skills || []).filter((g) => (g.items || []).length);
  const skillCount = groups.reduce((c, g) => c + g.items.length, 0);
  const items = [...(d.experience || []).map((e, i) => ({ k: "job", n: (e.bullets || []).filter((x) => x.trim()).length, first: i === 0 })), ...(d.projects || []).map((p) => ({ k: "proj", n: (p.bullets || []).filter((x) => x.trim()).length }))];
  const deep = items.length ? items.filter((x) => x.n >= (x.first ? 3 : 2)).length / items.length : 0;
  const whole = `${d.summary || ""} ${bullets.join(" ")}`;

  const checks = [
    { id: "keywords", weight: 22, label: keywords.length ? `Job keywords: ${matched.length} of ${keywords.length} found` : "Job keywords", v: keywords.length ? clamp(matched.length / Math.max(1, Math.min(keywords.length, 14))) : 1,
      tip: missing.length ? `Add these only where they are true: ${missing.slice(0, 5).join(", ")}.` : "" },
    { id: "verbs", weight: 14, label: "Points start with a strong action verb", v: n ? strong / n : 0, tip: "Start each point with a verb like Built, Designed, Led, Reduced. Avoid “Worked on” and “Responsible for”." },
    { id: "results", weight: 14, label: "Points show results or scale (numbers)", v: n ? clamp(withNumber / n / 0.4) : 0, tip: "Add a real number to more points: users, time saved, speed-up, size, volume. Only if it is true." },
    { id: "length", weight: 10, label: "Points are one clear line (8 to 28 words)", v: n ? goodLen / n : 0, tip: "Shorten points over 28 words, and expand ones under 8 with the result or the tools used." },
    { id: "contact", weight: 10, label: "Complete contact details", v: contactBits / 4, tip: "Add your name, a working email, phone number and city." },
    { id: "summary", weight: 8, label: "Short, specific summary", v: sumWords === 0 ? 0 : sumWords >= 15 && sumWords <= 55 ? 1 : 0.6, tip: sumWords === 0 ? "Add a two-line summary: your role, your strongest skills and what you want next." : "Keep the summary between 15 and 55 words." },
    { id: "depth", weight: 6, label: "Enough substance in each job and project", v: deep, tip: "Give the newest job 3 or more points and every other job or project at least 2." },
    { id: "links", weight: 6, label: "Links to real profiles", v: clamp((hasLi ? 0.6 : 0) + (hasGh ? 0.4 : 0)), tip: `Add ${!hasLi ? "your LinkedIn" : ""}${!hasLi && !hasGh ? " and " : ""}${!hasGh ? "your GitHub" : ""} link.` },
    { id: "skills", weight: 6, label: "Clear skills section", v: groups.length >= 2 && skillCount >= 6 ? 1 : skillCount ? 0.6 : 0, tip: "List at least 6 skills in 2 or more groups (Languages, Frameworks, Tools)." },
    { id: "fluff", weight: 6, label: "No first person or empty buzzwords", v: PRONOUN.test(` ${whole} `) || FLUFF.test(whole) ? 0 : 1, tip: "Remove “I/my/we” and phrases like “hard-working” or “team player”. Show it with facts." },
    { id: "variety", weight: 4, label: "Varied action verbs", v: repeated.length ? 0.4 : 1, tip: repeated.length ? `You start many points with “${repeated[0]}”. Vary the verb.` : "" },
    { id: "education", weight: 4, label: "Education included", v: (d.education || []).some((e) => (e.school || "").trim()) ? 1 : 0, tip: "Add your degree and college." },
  ];

  const total = checks.reduce((s, c) => s + c.weight * c.v, 0);
  const score = Math.round(total);
  const grade = score >= 85 ? { id: "excellent", label: "Excellent" } : score >= 70 ? { id: "strong", label: "Strong" } : score >= 50 ? { id: "fair", label: "Needs work" } : { id: "weak", label: "Weak" };
  const fixes = checks.filter((c) => c.v < 0.95 && c.tip).sort((a, b) => b.weight * (1 - b.v) - a.weight * (1 - a.v));
  return { score, grade, checks, fixes, keywords: { matched, missing, source: d.keywordSource || "role" }, stats: { bullets: n, withNumber, strong } };
}
