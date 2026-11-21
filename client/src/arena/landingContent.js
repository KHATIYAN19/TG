/*
  Prep Buddy Arena landing: every word on /prep-buddy lives here.
  The page and its structured data (JSON-LD) are built from the same arrays, so search engines, answer engines and
  AI assistants always read exactly what a visitor sees. Live numbers (price, matches, expiry) come from /api/arena/public
  and are filled in by `buildFaq(info)`; until they load, the generic wording below is used (that is also what the
  prerendered HTML contains).
*/
export const SITE = "https://www.targettrek.in";
export const PAGE_URL = `${SITE}/prep-buddy`;
export const UPDATED_ISO = "2026-11-20";
export const UPDATED_LABEL = "20 November 2026";
export const OG_IMAGE = "https://www.targettrek.in/brand/target-trek-logo.jpg";

export const SEO = {
  title: "Find a Mock Interview Partner & Prep Buddy | Prep Buddy Arena",
  description:
    "Find an interview prep partner for system design, DSA, backend, frontend, DevOps and GenAI. Match only when both accept, chat privately and run mock interviews.",
  keywords:
    "interview prep buddy, mock interview partner, find a mock interview partner, study partner for interviews, system design practice partner, DSA study buddy, coding interview partner India, peer mock interview, practice interview with a friend, interview preparation group, accountability partner for placements, LeetCode study partner, placement preparation partner, FAANG interview practice partner",
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
  ["plan", "4-week plan"],
  ["compare", "Compare"],
  ["safety", "Safety"],
  ["faq", "FAQ"],
];

/* quick, quotable answers right under the hero: each one is a question people type into search or ask an assistant */
export const QUICK_ANSWERS = [
  ["How do I find a mock interview partner?", "Create a free account, add your topics, level and availability, pay the one-time entry, then browse members and send a request. When they accept, a private chat opens."],
  ["Is a prep buddy better than practising alone?", "For interviews, yes. Speaking your answer out loud to a real person, under time pressure, is the skill being tested. A partner also keeps you on schedule."],
  ["How often should we practise?", "Two or three 60-minute sessions a week works for most people: swap roles each time so both of you interview and get interviewed."],
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

/* a practical plan for the first month with a buddy: what people search as "how to practise mock interviews with a friend" */
export const PLAN_INTRO =
  "A good prep partnership has a fixed rhythm: two or three sessions a week, roles swapped every time, and written feedback after each round. Here is a four-week plan you can copy into your first chat.";

export const PLAN = [
  {
    week: "Week 1",
    title: "Set the baseline",
    goal: "Agree on the rules and find out where each of you stands.",
    items: [
      "Share your target role, companies and interview date in the first chat.",
      "Fix two or three 60-minute slots a week and put them in your calendars.",
      "Run one warm-up DSA round each: 30 minutes interviewing, 30 minutes being interviewed.",
      "Write down three weak areas each, honestly. That list drives the next three weeks.",
    ],
  },
  {
    week: "Week 2",
    title: "Core rounds",
    goal: "Practise the round your target companies weight most.",
    items: [
      "Two DSA or coding rounds each, timed at 45 minutes, solving out loud.",
      "One system design (HLD) or low-level design (LLD) round, using a shared whiteboard.",
      "After each round the interviewer gives two things that went well and two to fix.",
    ],
  },
  {
    week: "Week 3",
    title: "Pressure and follow-ups",
    goal: "Make it feel like the real interview.",
    items: [
      "Interviewer asks follow-ups: \"Why that data structure?\", \"What if traffic grows 10x?\".",
      "Camera on, no notes, strict timer. Practise saying \"Let me think for a minute\".",
      "Add one behavioural round each: tell a STAR story about a conflict and a failure.",
    ],
  },
  {
    week: "Week 4",
    title: "Full mock loop",
    goal: "Run a complete interview day, then review it together.",
    items: [
      "One back-to-back loop: coding, design and behavioural, with a 10-minute break.",
      "Score each round from 1 to 4 (no hire, lean no, lean yes, strong yes) and explain why.",
      "Compare with week 1. Decide together whether to continue, change focus or end the partnership.",
    ],
  },
];

/* how a prep buddy compares with the other ways people prepare */
export const COMPARE_COLS = ["Prep buddy (Prep Buddy Arena)", "Preparing alone", "Paid 1:1 mock interview"];
export const COMPARE_ROWS = [
  ["Cost", "One-time entry fee, then unlimited sessions with your buddy", "Free", "Paid per session, usually the most expensive option"],
  ["Speaking answers out loud", "Every session", "Rarely", "Every session"],
  ["Live feedback", "From a peer, every session", "None", "From an experienced interviewer"],
  ["Accountability", "A person expects you at a fixed time", "Only self-discipline", "Only for the booked slot"],
  ["You also practise interviewing", "Yes, you swap roles", "No", "No"],
  ["Best for", "Steady weekly practice over weeks", "Learning concepts and solving problems", "A final check before a big interview"],
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
    { q: "How do I practise mock interviews with a friend or partner?", a: "Fix two or three 60-minute sessions a week. In each, one person interviews for 30 minutes and the other answers out loud, then you swap. The interviewer uses a timer, asks follow-up questions and ends with two things that went well and two to fix. The 4-week plan on this page gives a ready schedule." },
    { q: "Can I find a partner for system design interview practice?", a: "Yes. Pick \"System design (HLD)\" or \"Low-level design (LLD)\" as a topic on your profile and filter members by it. Many working engineers join specifically for regular design mocks with a peer at a similar level." },
    { q: "Can I find a DSA or LeetCode study partner here?", a: "Yes. Choose \"Data structures & algorithms\" as a topic, filter by level and availability, and send a request to someone who solves at a similar pace. Most pairs solve problems separately and meet to explain solutions out loud." },
    { q: "Is Prep Buddy Arena useful for campus placements?", a: "Yes. Final-year students use it to find someone for DSA, aptitude-style coding and HR rounds before placement season. Filter by level \"Student\" or by your target companies." },
    { q: "Do I need to show my real name?", a: "No. In the arena you appear only as an anonymous member ID such as Member-K7QX2. After you match, you decide whether your buddy sees your name, email, phone or LinkedIn." },
    { q: "Is it a subscription?", a: "No. You pay once to enter. There are no monthly charges and nothing renews automatically." },
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
        speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".pb-answer", ".pb-qa-a"] },
        keywords: SEO.keywords,
        primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE },
        mainEntity: { "@id": `${PAGE_URL}#faq` },
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
      {
        "@type": "HowTo",
        "@id": `${PAGE_URL}#plan`,
        name: "A 4-week mock interview practice plan with a prep buddy",
        description: PLAN_INTRO,
        totalTime: "P4W",
        step: PLAN.map((w, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: `${w.week}: ${w.title}`,
          text: `${w.goal} ${w.items.join(" ")}`,
          url: `${PAGE_URL}#plan`,
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${PAGE_URL}#topics`,
        name: "Interview topics you can practise with a prep buddy",
        itemListElement: TOPICS.flatMap(([, list]) => list).map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t })),
      },
    ],
  };
}

export const schemaJson = (faq, info) => JSON.stringify(buildSchema(faq, info)).replace(/</g, "\\u003c");
