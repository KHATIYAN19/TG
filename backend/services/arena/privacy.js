import crypto from "crypto";

/*
  PRIVACY BOUNDARY
  ----------------
  Every profile that leaves the server goes through one of these
  projections. Controllers must never return raw profile documents
  to a member. Hidden fields are simply not present in the payload,
  so they cannot be recovered from the network tab.
*/

const ALIAS_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

export const generateAlias = () => {
  const bytes = crypto.randomBytes(5);
  let out = "";
  for (const b of bytes) out += ALIAS_ALPHABET[b % ALIAS_ALPHABET.length];
  return `Member-${out}`;
};

const id = (v) => String(v?._id ?? v);

/* Profiles saved by older versions can lack newer fields; never let that throw. */
const list = (v) => (Array.isArray(v) ? v : []);

/** Topics of a profile, including the old single `topic` field. */
export const topicsOf = (p) => {
  const t = list(p?.topics);
  return t.length ? t : p?.topic ? [p.topic] : [];
};

/** Do two profiles share at least one topic? */
export const sharesTopic = (a, b) => {
  const mine = new Set(topicsOf(b));
  return topicsOf(a).some((t) => mine.has(t));
};

/*
  FIELD VISIBILITY — the single source of truth
  ---------------------------------------------
  Drives (a) the public landing page's "what's public / private" table and
  (b) a unit test that proves publicCard()/buddyView() really behave this way.
  If you add a profile field, add it here, or the test fails.

    public               shown on your card to every paid arena member
    after_match_optional hidden until a match; then shown ONLY if you allow it
    never                never shown to other members
*/
export const FIELD_VISIBILITY = [
  // ---- public: identity & focus
  { key: "alias", label: "Anonymous member ID", group: "Identity", visibility: "public", note: "Something like Member-K7QX2. Not linked to your name." },
  { key: "topics", label: "Focus topics", group: "Preparation", visibility: "public", note: "Every topic you're preparing for." },
  { key: "level", label: "Your level", group: "Preparation", visibility: "public" },
  { key: "skills", label: "Skills", group: "Preparation", visibility: "public" },
  { key: "goal", label: "What you want from a buddy", group: "Preparation", visibility: "public" },
  { key: "timeline", label: "Interview timeline", group: "Preparation", visibility: "public" },
  // ---- public: background
  { key: "companyName", label: "Company / college name", group: "Background", visibility: "public", note: "Shown so people know who they're writing to." },
  { key: "designation", label: "Job title", group: "Background", visibility: "public" },
  { key: "companyType", label: "Company type", group: "Background", visibility: "public", note: "Student, startup, product, service, MNC." },
  { key: "yearsExperience", label: "Years of experience", group: "Background", visibility: "public" },
  { key: "targetCompanies", label: "Companies you're targeting", group: "Background", visibility: "public" },
  { key: "bio", label: "About you", group: "Background", visibility: "public", note: "Scanned: emails, phone numbers and links are blocked." },
  // ---- public: practice style
  { key: "availability", label: "When you can practise", group: "Practice style", visibility: "public" },
  { key: "sessionsPerWeek", label: "Sessions per week", group: "Practice style", visibility: "public" },
  { key: "sessionModes", label: "Chat / voice / video", group: "Practice style", visibility: "public" },
  { key: "languages", label: "Languages", group: "Practice style", visibility: "public" },
  { key: "buddyPreference", label: "Preferred buddy type", group: "Practice style", visibility: "public" },
  // ---- after match, only if the owner allows
  { key: "name", label: "Your real name", group: "Private", visibility: "after_match_optional", defaultShared: true, note: "Hidden until you both accept." },
  { key: "email", label: "Email address", group: "Private", visibility: "after_match_optional", defaultShared: false },
  { key: "phone", label: "Phone / WhatsApp", group: "Private", visibility: "after_match_optional", defaultShared: false },
  { key: "linkedin", label: "LinkedIn profile", group: "Private", visibility: "after_match_optional", defaultShared: false },
  // ---- never
  { key: "password", label: "Password", group: "Never shared", visibility: "never" },
  { key: "payment", label: "Payment & card details", group: "Never shared", visibility: "never", note: "Handled by the payment gateway; we never see card numbers." },
  { key: "blocks", label: "Who you've blocked or reported", group: "Never shared", visibility: "never" },
];

/*
  Anonymous card: what anyone in the arena may see.
  Company name, job title and experience are deliberately PUBLIC (members
  asked for them so requests feel informed). Real name, email, phone and
  LinkedIn are never included.
*/
export const publicCard = (p) => ({
  id: id(p),
  alias: p.alias,
  topics: topicsOf(p),
  level: p.level,
  skills: list(p.skills),
  yearsExperience: p.yearsExperience,
  companyType: p.companyType,
  companyName: p.companyName || "",
  designation: p.designation || "",
  targetCompanies: list(p.targetCompanies),
  languages: list(p.languages),
  sessionsPerWeek: p.sessionsPerWeek,
  sessionModes: list(p.sessionModes),
  buddyPreference: p.buddyPreference,
  timeline: p.timeline,
  availability: list(p.availability),
  bio: p.bio,
  goal: p.goal,
});

/** What I may see of my matched buddy – exactly what THEY chose to share. */
export const buddyView = (p) => {
  const s = p.shareSettings || {};
  const view = { ...publicCard(p), shared: {} };

  if (s.name) view.shared.name = p.realName;
  if (s.email && p.contact?.email) view.shared.email = p.contact.email;
  if (s.phone && p.contact?.phone) view.shared.phone = p.contact.phone;
  if (s.linkedin && p.contact?.linkedin) view.shared.linkedin = p.contact.linkedin;

  return view;
};

/** The owner's own full profile. */
export const ownerView = (p) => ({
  ...publicCard(p),
  realName: p.realName,
  contact: p.contact,
  shareSettings: p.shareSettings,
  status: p.status,
  hidden: p.hidden === true,
  hiddenBy: p.hidden === true ? p.hiddenBy ?? "user" : null,
  activatedAt: p.activatedAt,
  suspendedReason: p.status === "suspended" ? p.suspendedReason : null,
});

/** Admin moderation view (full detail). */
export const adminView = (p) => ({
  ...ownerView(p),
  user: id(p.user),
  suspendedAt: p.suspendedAt,
  createdAt: p.createdAt,
});

/*
  CONTACT / PII DETECTION
  -----------------------
  Anything a member can type that other members see BEFORE a match
  (bio, goal, skills, the intro message sent with a request) is scanned
  here so people can't trade contact details and skip the arena.

  Text is normalised first (Unicode compatibility, zero-width characters,
  spelled-out digits, "(at)" / "dot" tricks), then tested for:
    - emails (including obfuscated forms)
    - phone numbers (digits, separated digits, spelled-out digits)
    - links and bare domains / shorteners
    - @handles and "message me on <platform>" style hand-offs
    - phrases like "my name is", "call me", "my number"
*/

const ZERO_WIDTH = /[\u200B-\u200F\u2060\uFEFF\u00AD]/g;

const DIGIT_WORDS = {
  zero: "0", oh: "0", one: "1", two: "2", three: "3", four: "4",
  five: "5", six: "6", seven: "7", eight: "8", nine: "9",
};

// Technical names that look like domains but aren't contact details.
const TECH_ALLOWLIST =
  /(?<![a-z0-9])(?:socket\.io|node\.js|nodejs|asp\.net|vb\.net|\.net|nest\.js|next\.js|nuxt\.js|vue\.js|react\.js|express\.js|angular\.js|ember\.js|d3\.js|three\.js|chart\.js|spring\.io|redux\.js|deno\.land)(?![a-z0-9])/g;

const TLDS =
  "com|in|io|me|co|net|org|app|dev|ly|gl|link|page|xyz|ai|tech|info|us|uk|online|site|live|store|to|gg|tv|fm|cc|biz|edu|gov|ink|bio|cloud";

const PLATFORMS =
  "whats\\s?app|watsapp|whatsap|wa|telegram|tg|insta(?:gram)?|snap(?:chat)?|discord|skype|signal|linkedin|linked\\s?in|github|facebook|fb|twitter|gmail|hangouts|zoom|meet\\.google|google\\s?meet";

export const normalizeForScan = (input) => {
  let t = String(input ?? "")
    .normalize("NFKC")
    .replace(ZERO_WIDTH, "")
    .toLowerCase();

  // spelled-out digits → digits ("nine eight seven" → "9 8 7")
  t = t.replace(
    /\b(zero|oh|one|two|three|four|five|six|seven|eight|nine)\b/g,
    (_, w) => ` ${DIGIT_WORDS[w]} `
  );

  return t;
};

const RULES = [
  [
    "email",
    (t) =>
      /[a-z0-9._%+-]+\s*(?:@|\(\s*at\s*\)|\[\s*at\s*\]|\{\s*at\s*\})\s*[a-z0-9-]+\s*(?:\.|\(\s*dot\s*\)|\[\s*dot\s*\]|\bdot\b)\s*[a-z]{2,}/.test(t) ||
      /\b[a-z0-9._-]+\s+at\s+(?:gmail|yahoo|outlook|hotmail|proton(?:mail)?|icloud|rediff|live)\b/.test(t) ||
      /\b(?:gmail|yahoo|outlook|hotmail|protonmail|icloud|rediff)(?:mail)?\s*(?:\.|dot)\s*com\b/.test(t),
  ],
  [
    "phone number",
    (t) => {
      // 9+ digits in one run, allowing common separators (phones are 10).
      if (/(?:\d[\s().\-_/]*){9,}/.test(t.replace(/\b(19|20)\d{2}\s*[-–]\s*(19|20)\d{2}\b/g, " "))) return true;
      // international prefix followed by digits
      if (/\+\s*\d{1,3}[\s.-]*\d{3,}/.test(t)) return true;
      return false;
    },
  ],
  [
    "link",
    (t) => {
      const cleaned = t.replace(TECH_ALLOWLIST, " ");
      return (
        /(?:https?:|ftp:)?\/\/\S+/.test(cleaned) ||
        /\bwww\s*\./.test(cleaned) ||
        /\b(?:bit\.ly|t\.co|tinyurl|wa\.me|t\.me|linktr\.ee|goo\.gl|rb\.gy|lnkd\.in)\b/.test(cleaned) ||
        /\bdot\s*(?:com|in|io|me|net|org|co)\b/.test(cleaned)
      );
    },
  ],
  [
    "domain",
    (t) => {
      const cleaned = t.replace(TECH_ALLOWLIST, " ");
      return new RegExp(`\\b[a-z0-9-]{2,}\\s*(?:\\.|\\(\\s*dot\\s*\\)|\\[\\s*dot\\s*\\])\\s*(?:${TLDS})\\b`).test(cleaned);
    },
  ],
  ["social handle", (t) => /(?:^|[\s(\[{,;:])@[a-z0-9._]{3,}/.test(t)],
  [
    "off-platform contact",
    (t) =>
      new RegExp(`\\b(?:${PLATFORMS})\\b\\s*[:=\\-–]\\s*[a-z0-9]`).test(t) ||
      new RegExp(
        `\\b(?:${PLATFORMS})\\b[^a-z0-9]{0,6}(?:id|handle|number|no\\.?|username|user|me|dm|link|profile|@|\\d)`
      ).test(t) ||
      new RegExp(
        `\\b(?:dm|message|msg|text|ping|add|contact|reach|find|follow|call|mail|email|e-mail)\\s+(?:me|us)\\b`
      ).test(t) ||
      /\bmy\s+(?:number|no\.?|phone|mobile|contact|whats\s?app|email|e-mail|mail|id|insta|handle|linkedin|telegram)\b/.test(t) ||
      /\b(?:call|reach|contact)\s+me\s+(?:on|at|@)\b/.test(t),
  ],
  [
    "name",
    (t) =>
      /\bmy\s+(?:real\s+|full\s+)?name\s+(?:is|=|:)\b/.test(t) ||
      /\bi\s*(?:am|'m)\s+called\b/.test(t) ||
      /\bcall\s+me\s+[a-z]{2,}/.test(t) ||
      /\bthis\s+is\s+[a-z]{2,}\s+(?:here|speaking)\b/.test(t),
  ],
];

/**
 * Returns the kind of contact info found ("email", "link", …) or null.
 *
 * Pass { entity: true } for company names / job titles: bare domains such as
 * "Observe.AI" or "Notion.so" are legitimate there, but emails, phone numbers,
 * URLs, handles and hand-offs are still rejected.
 */
export const detectContactInfo = (input, { entity = false } = {}) => {
  if (typeof input !== "string" || !input.trim()) return null;
  const t = normalizeForScan(input);
  for (const [label, test] of RULES) {
    if (entity && (label === "domain" || label === "name")) continue;
    if (test(t)) return label;
  }
  return null;
};

export const containsContactInfo = (text) => detectContactInfo(text) !== null;

export const CONTACT_INFO_MESSAGE =
  "Please remove personal contact details (emails, phone numbers, links, social handles, names). You can share them with your buddy after you match.";
