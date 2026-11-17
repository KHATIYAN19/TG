/*
  Does the pasted text look like a job description? A scored guess, not a proof, so the form only WARNS (it never blocks).
  Keep in step with localJdCheck in backend/services/resume/ai.js.
*/
const JD_SIGNALS = [
  /responsibilit/, /requirements?\b/, /qualifications?\b/, /we(?:'re| are) (?:looking|hiring)/, /job description/, /about (?:the )?(?:role|job|position|company|us)\b/,
  /what you(?:'ll| will) (?:do|be doing)/, /who you are/, /nice to have|good to have|preferred|must have/, /\d+\s*\+?\s*(?:-\s*\d+\s*)?years?/,
  /\bapply\b/, /benefits|perks/, /salary|\bctc\b|\blpa\b|stipend/, /full[- ]time|part[- ]time|internship|contract\b/, /work from home|remote|hybrid|on-?site/,
  /you(?:'ll| will| should| must| are)\b/, /\bcandidates?\b/, /\bjoin (?:our|the) team/, /\bnotice period|immediate joiner/,
];
const RESUME_SIGNALS = [
  /[\w.+-]+@[\w-]+\.[\w.]+/, /(?:\+?91[\s-]?)?[6-9]\d{9}\b/, /linkedin\.com\/in\//, /\bdeclaration\b/, /career objective/, /date of birth|\bdob\b/, /\bcgpa\b|\bgpa\b/,
  /\breferences\b/, /\b(?:i am|i have|i worked|i built)\b/, /\bmy (?:name|skills|projects|experience)\b/,
];

export const checkJobDescription = (text) => {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (!t) return { ok: true, empty: true, reason: "" };
  const low = t.toLowerCase();
  const words = low.split(" ");
  const letters = (t.match(/\p{L}/gu) || []).length;
  const jd = JD_SIGNALS.filter((r) => r.test(low)).length;
  const cv = RESUME_SIGNALS.filter((r) => r.test(low)).length;
  if (t.length < 80 || words.length < 15) return { ok: false, reason: "It is too short to be a real job posting." };
  if (letters / t.length < 0.6 || new Set(words).size / words.length < 0.25) return { ok: false, reason: "It looks like random or repeated text." };
  if (cv >= 3 && jd < 6) return { ok: false, reason: "It looks like a resume or personal details, not a job posting." };
  if (jd < 3) return { ok: false, reason: "We can't find the usual parts of a job posting (responsibilities, requirements, skills, years of experience)." };
  return { ok: true, reason: "" };
};
