/*
  Prep Buddy Arena landing: every word on /prep-buddy lives here.
  The page and its structured data (JSON-LD) are built from the same arrays, so search engines, answer engines and
  AI assistants always read exactly what a visitor sees. Live numbers (price, matches, expiry) come from /api/arena/public
  and are filled in by `buildFaq(info)`; until they load, the generic wording below is used (that is also what the
  prerendered HTML contains).
*/
export const SITE = "https://www.targettrek.in";
export const PAGE_URL = `${SITE}/prep-buddy`;
export const UPDATED_ISO = "2026-11-18";
export const OG_IMAGE = "https://i.postimg.cc/13B9k289/target-Trek-logo-2.jpg";

export const SEO = {
  title: "Prep Buddy Arena: Find an Interview Preparation Partner | Target Trek",
  description:
    "Find a serious interview prep buddy for system design, DSA, frontend, backend, DevOps, SDET and GenAI. Browse anonymous profiles, match only when both accept, chat privately and practise mock interviews together.",
  keywords:
    "interview prep buddy, mock interview partner, study partner for interviews, system design practice partner, DSA study buddy, coding interview partner India, peer mock interview, interview preparation group, accountability partner for placements",
};

/* the one-paragraph answer that answer engines quote */
export const WHAT_IS =
  "Prep Buddy Arena is an online space on Target Trek where people preparing for tech interviews find a practice partner. You create an anonymous profile with your topics, level, role and availability, browse other members, and send a request. When both of you accept, a private chat opens so you can schedule mock interviews, swap questions and keep each other accountable. Your real name and contact details stay hidden until you match, and only the ones you choose are shared.";

export const PAGE_NAV = [
  ["what-is", "What it is"],
  ["how-it-works", "How it works"],
  ["visibility", "What others see"],
  ["topics", "Topics"],
  ["pricing", "Pricing & rules"],
  ["safety", "Safety"],
  ["faq", "FAQ"],
];

export const STEPS = [
  { title: "Sign up and verify your email", text: "Create an account and confirm your email with a one-time code. Every member is verified this way." },
  { title: "Add your details", text: "Topics, level, skills, job title, company, availability and what you want from a buddy. Saved to your account." },
  { title: "Pay once to enter", text: "One payment puts your profile live. Leave and come back any time and you land on the step you were on." },
  { title: "Send or accept a request", text: "Browse profiles, filter by topic, level, language and availability, and send a short message. It only works if both agree." },
  { title: "Chat and practise", text: "Once matched, a private chat opens. Plan mock interviews and choose which personal details to share." },
  { title: "Move on when you're ready", text: "End the partnership any time. If your entry still has matches left, you go straight back to the arena." },
];

export const BENEFITS = [
  ["Free mock interviews", "Take turns as interviewer and candidate. You learn as much from asking questions as answering them."],
  ["Real accountability", "A partner expecting you on Thursday evening is a better deadline than any calendar reminder."],
  ["Know who you're talking to", "See each member's role, company and experience before you send a request, so you pick someone who fits."],
];

export const TOPICS = [
  ["Interview rounds", ["System design (HLD)", "Low-level design (LLD)", "Data structures & algorithms", "Behavioural rounds", "Mock interviews"]],
  ["Roles", ["Frontend", "Backend", "Full stack", "DevOps & cloud", "SDET / QA", "Mobile", "Data engineering", "GenAI & LLMs"]],
  ["Skills people practise", ["React", "Java & Spring", "SQL", "Kafka", "Caching", "Docker", "Kubernetes", "REST APIs", "Concurrency", "Design patterns", "Dynamic programming", "RAG"]],
];

export const SAFETY = [
  ["Verified members", "Every account confirms its email with a one-time code. Code requests are limited per IP, email and mobile number."],
  ["No off-platform shortcuts", "Emails, phone numbers, links and social handles are blocked in public fields and request messages, so nobody can skip the accept step."],
  ["You're in control", "Block, report or end a partnership whenever you like. Our team reviews reports and can suspend accounts."],
];

export const WHO_FOR = [
  ["Final-year students", "Preparing for campus placements and want someone to run DSA and HR rounds with."],
  ["Freshers and job switchers", "Applying off-campus and need a steady partner instead of preparing alone."],
  ["Working engineers", "Targeting product companies and want regular system design and LLD mocks with a peer."],
];

/* used until the live list loads, and in the prerendered HTML. Mirrors backend/services/arena/privacy.js */
export const FALLBACK_FIELDS = [
  { key: "alias", label: "Anonymous member ID", group: "Identity", visibility: "public", note: "Something like Member-K7QX2. Not linked to your name." },
  { key: "topics", label: "Focus topics", group: "Preparation", visibility: "public" },
  { key: "level", label: "Your level", group: "Preparation", visibility: "public" },
  { key: "skills", label: "Skills", group: "Preparation", visibility: "public" },
  { key: "goal", label: "What you want from a buddy", group: "Preparation", visibility: "public" },
  { key: "timeline", label: "Interview timeline", group: "Preparation", visibility: "public" },
  { key: "companyName", label: "Company / college name", group: "Background", visibility: "public" },
  { key: "designation", label: "Job title", group: "Background", visibility: "public" },
  { key: "companyType", label: "Company type", group: "Background", visibility: "public" },
  { key: "yearsExperience", label: "Years of experience", group: "Background", visibility: "public" },
  { key: "targetCompanies", label: "Companies you're targeting", group: "Background", visibility: "public" },
  { key: "bio", label: "About you", group: "Background", visibility: "public", note: "Scanned: emails, phone numbers and links are blocked." },
  { key: "availability", label: "When you can practise", group: "Practice style", visibility: "public" },
  { key: "sessionsPerWeek", label: "Sessions per week", group: "Practice style", visibility: "public" },
  { key: "sessionModes", label: "Chat / voice / video", group: "Practice style", visibility: "public" },
  { key: "languages", label: "Languages", group: "Practice style", visibility: "public" },
  { key: "buddyPreference", label: "Preferred buddy type", group: "Practice style", visibility: "public" },
  { key: "name", label: "Your real name", group: "Private", visibility: "after_match_optional", defaultShared: true },
  { key: "email", label: "Email address", group: "Private", visibility: "after_match_optional", defaultShared: false },
  { key: "phone", label: "Phone / WhatsApp", group: "Private", visibility: "after_match_optional", defaultShared: false },
  { key: "linkedin", label: "LinkedIn profile", group: "Private", visibility: "after_match_optional", defaultShared: false },
  { key: "password", label: "Password", group: "Never shared", visibility: "never" },
  { key: "payment", label: "Payment & card details", group: "Never shared", visibility: "never", note: "Handled by the payment gateway; we never see card numbers." },
  { key: "blocks", label: "Who you've blocked or reported", group: "Never shared", visibility: "never" },
];

const rupees = (paise) => `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;

/* FAQ in question → answer form. `info` is the live /public payload (or null); `gw` the payment gateway (or null). */
export function buildFaq(info, gw) {
  const price = info ? rupees(info.entryPricePaise) : null;
  const m = info?.matchesPerEntry;
  const word = m === 1 ? "match" : "matches";
  const refundsOn = info ? Boolean(info.cancelRefundEnabled) && info.cancellationFeePercent != null : true;
  const fee = info?.cancellationFeePercent;
  const feePaise = info && refundsOn ? Math.round((info.entryPricePaise * fee) / 100) : 0;

  return [
    { q: "What is a prep buddy?", a: "A prep buddy is another person preparing for interviews who practises with you: you take turns asking and answering questions, run mock interviews, review each other's answers and keep each other on schedule. Prep Buddy Arena helps you find one who matches your topics, level and availability." },
    { q: "How does matching work?", a: "There's no algorithm choosing for you. You browse profiles, filter by topic, level, language and availability, and send a request with a short message. If they accept, you're matched. You can also accept requests sent to you." },
    { q: "What can other members see about me?", a: "Your anonymous member ID and the items in the \"Public on your card\" list, including company name, job title and experience. Your real name, email, phone and LinkedIn stay hidden until you match, and then only the ones you switch on." },
    { q: "How much does it cost?", a: info ? `${price}, paid once. It puts your profile in the arena and includes ${m} ${word}${m > 1 ? ", one after another" : ""}. There is no subscription.` : "A one-time entry fee, shown in the pricing section. It puts your profile in the arena and includes a set number of matches. There is no subscription." },
    ...(refundsOn ? [{ q: "Can I get a refund?", a: info ? `Yes, until you use your first match. Cancel before that and you get back ${100 - fee}% of what you paid. For ${price} that's ${rupees(info.entryPricePaise - feePaise)}; we keep ${fee}% (${rupees(feePaise)}). Once a match is used the entry isn't refundable.` : "Yes, before your first match, minus a small cancellation fee shown in the pricing section." }] : []),
    { q: "Can I be matched with more than one person?", a: info ? `${m > 1 ? `Yes, up to ${m} per entry, but never at the same time.` : "One match per entry."} While you're matched you can't send or accept other requests, and you can't be re-paired with someone you've already matched with.` : "Not at the same time. Extra matches in an entry happen one after another, and you can't be re-paired with someone you've already matched with." },
    { q: "What happens to my requests?", a: info ? `A request expires after ${info.requestExpiryDays} days if nobody answers. You can have up to ${info.maxOutgoingRequests} pending requests at once. When you match, your other pending requests are cancelled automatically.` : "Requests expire after a few days if nobody answers, and your other pending requests are cancelled automatically when you match." },
    { q: "Which topics can I practise?", a: "System design (HLD), low-level design, DSA, frontend, backend, full stack, DevOps and cloud, SDET and QA, mobile, data engineering, GenAI and behavioural rounds. You pick your topics on your profile and filter other members by them." },
    { q: "Is my payment safe?", a: gw ? `Payments are processed by ${gw.name} (${gw.methods.join(", ")}). We never see or store your card details.` : "Payments are processed by our payment gateway using UPI, cards or netbanking. We never see or store your card details." },
    { q: "What if someone behaves badly?", a: "Block them and your partnership ends instantly. You can also report them. Every member verifies their email, and admins can suspend accounts." },
  ];
}

/* JSON-LD: organisation, page, breadcrumb, service (+ offer once the price loads), FAQ and how-to */
export function buildSchema(faq, info) {
  const org = { "@type": "Organization", "@id": `${SITE}/#organization`, name: "Target Trek", url: SITE, logo: OG_IMAGE, email: "supporttargettrek@gmail.com" };
  const service = {
    "@type": "Service",
    "@id": `${PAGE_URL}#service`,
    name: "Prep Buddy Arena",
    serviceType: "Interview preparation partner matching",
    description: SEO.description,
    provider: { "@id": `${SITE}/#organization` },
    areaServed: [{ "@type": "Country", name: "India" }],
    audience: { "@type": "Audience", audienceType: "Students, freshers and software engineers preparing for technical interviews" },
    url: PAGE_URL,
  };
  if (info?.entryPricePaise) {
    service.offers = { "@type": "Offer", price: String(info.entryPricePaise / 100), priceCurrency: "INR", availability: "https://schema.org/InStock", url: `${PAGE_URL}#pricing`, seller: { "@id": `${SITE}/#organization` } };
  }
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
        about: { "@id": `${PAGE_URL}#service` },
        dateModified: UPDATED_ISO,
        breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
        speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".pb-answer"] },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Target Trek", item: SITE },
          { "@type": "ListItem", position: 2, name: "Prep Buddy Arena", item: PAGE_URL },
        ],
      },
      service,
      { "@type": "FAQPage", "@id": `${PAGE_URL}#faq`, mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      {
        "@type": "HowTo",
        "@id": `${PAGE_URL}#howto`,
        name: "How to find an interview prep buddy on Prep Buddy Arena",
        step: STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.text, url: `${PAGE_URL}#how-it-works` })),
      },
    ],
  };
}

export const schemaJson = (faq, info) => JSON.stringify(buildSchema(faq, info)).replace(/</g, "\\u003c");
