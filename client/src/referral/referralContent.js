/*
  REFERRALS: the words on /referral.
  One place, so the page, the FAQ schema, the HowTo schema and the prerendered HTML always say the same thing.
  No invented numbers, reviews or results: only what the product really does.
*/
export const SITE = "https://www.targettrek.in";
export const PAGE_URL = `${SITE}/referral`;
export const APP_URL = `${SITE}/referral/app`;
export const UPDATED_ISO = "2026-11-19";
export const HELP_EMAIL = "supporttargettrek@gmail.com";
export const UPDATED_LABEL = "19 November 2026";
export const OG_IMAGE = "https://i.postimg.cc/13B9k289/target-Trek-logo-2.jpg";

export const SEO = {
  title: "Job Referrals: Ask Employees at Your Dream Company | Target Trek",
  description:
    "Find people who work at the company you want, send your resume and the job, and chat once they accept. Free to search and request. Made for job seekers in India.",
  keywords:
    "job referral, employee referral, how to get a referral, referral for jobs India, ask for referral at Google, referral platform India, get referred for SDE job, hiring referral, resume referral, referral chat",
};

/* the one-paragraph answer that search and answer engines quote */
export const ANSWER =
  "A job referral is when an employee recommends you to their company's hiring team, so your application is looked at ahead of the pile. On Target Trek Referrals you search a company, see members who work there with their role and years of experience, send your resume and the job ID or link, and chat privately once they accept. Searching and sending requests is free.";

export const FACTS = [
  ["🆓", "Free to ask", "Search and send requests"],
  ["🕶️", "Private", "Referrers can hide their name"],
  ["💬", "Live chat", "Opens once they accept"],
  ["🇮🇳", "Made for India", "Tech jobs, all levels"],
];

export const SEEKER_STEPS = [
  ["Search the company", "Type a company, role or skill. You see members who work there, their role, headline and years of experience."],
  ["Send your request", "Share your resume, LinkedIn and the job ID or link, with a short note on why you fit."],
  ["Chat when they accept", "The referrer reads your details and accepts or declines. After they accept, a private live chat opens."],
];
export const REFERRER_STEPS = [
  ["Add where you work", "Fill in your company, role and years of experience. Headline and about you are optional."],
  ["Tick “I can refer”", "You show up when people search your company. Hide your name if you prefer to stay private."],
  ["Accept or decline", "Read the full details and resume first. Change your mind later: you can accept a request you declined."],
];

export const FEATURES = [
  ["🔎", "sky", "Search by company", "See every member at a company with their role, headline and years of experience."],
  ["💼", "amber", "Job board", "Members post openings, or roles they can refer for. Ask for that exact job."],
  ["🕶️", "violet", "Hide your name", "Referrers can show company and role while their name stays Anonymous."],
  ["💬", "green", "Live private chat", "Reply, react and share details. Your resume stays in the conversation."],
  ["👑", "gold", "Priority", "A badge on your profile, and your requests show first for referrers.", "priority"],
  ["♾️", "green", "Unlimited", "One monthly plan for unlimited requests and free chats. Cancel any time.", "unlimited"],
  ["🔁", "sky", "Change your mind", "A referrer can accept a request they declined earlier. Nothing is lost."],
  ["📥", "violet", "Sent and received", "Every request with its status, in two folders. New ones are marked."],
];

export const FAQ = [
  ["What is a job referral?", "A job referral is when someone who works at a company recommends you to its hiring team. Referred candidates are usually looked at sooner than people who only apply online. A referral does not guarantee an interview or an offer."],
  ["How do I get a referral on Target Trek?", "Open Referrals and search the company you want. Pick a member who works there. Send your resume, LinkedIn and the job ID or link with a short note. If they accept, a private chat opens."],
  ["Is it free?", "Searching, posting and sending requests are free. When a referrer accepts, you open the chat for a small fee, use a chat credit, or use the Unlimited plan. Referrers never pay."],
  ["What is the Unlimited plan?", "A monthly subscription. You can send unlimited requests and every accepted chat opens free. It renews every month until you cancel.", "unlimited"],
  ["What does Priority do?", "Priority adds a badge to your profile. Your requests are listed first for the people you ask. Buy it for a few days, or monthly.", "priority"],
  ["Can I cancel a subscription?", "Yes, any time, in two taps. You are not charged again. Your plan keeps working until the days you paid for run out.", "subscription"],
  ["Do you give refunds?", `No. All payments are final. If you were charged twice for the same thing, email ${"supporttargettrek@gmail.com"} with the payment ID and we refund the duplicate charge.`],
  ["Can I hide my name?", "Yes. Members who give referrals can turn on “Hide my name”. Others then see Anonymous with the company, role and experience."],
  ["What does a referrer see?", "Your name, role, experience, notice period, LinkedIn, your note, the job ID or link, and your resume. Nothing else from your account."],
  ["What if the referrer declines?", "You are told, with their reason if they gave one. They can still accept it later, and you will see the change."],
  ["Do you guarantee a referral or a job?", "No. Each referrer decides on their own. Target Trek connects you and keeps the chat private. It does not promise interviews or offers."],
];

export const HOWTO_NAME = "How to get a job referral on Target Trek";

export const BREAD = [["Home", SITE], ["Resume Lab", `${SITE}/resume-review`], ["Referrals", PAGE_URL]];

/* JSON-LD, built from the arrays above so schema and page cannot disagree */
export function buildSchema(info = null) {
  const faq = faqFor(info);
  const org = { "@type": "Organization", "@id": `${SITE}/#organization`, name: "Target Trek", url: SITE, logo: OG_IMAGE, email: "supporttargettrek@gmail.com" };
  return {
    "@context": "https://schema.org",
    "@graph": [
      org,
      { "@type": "WebSite", "@id": `${SITE}/#website`, url: SITE, name: "Target Trek", inLanguage: "en-IN", publisher: { "@id": `${SITE}/#organization` } },
      {
        "@type": "WebPage", "@id": `${PAGE_URL}#webpage`, url: PAGE_URL, name: SEO.title, description: SEO.description, inLanguage: "en-IN",
        isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${PAGE_URL}#service` }, dateModified: UPDATED_ISO,
        primaryImageOfPage: { "@type": "ImageObject", url: OG_IMAGE }, breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
        speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".rfl-answer"] },
      },
      {
        "@type": "Service", "@id": `${PAGE_URL}#service`, name: "Target Trek Referrals", serviceType: "Job referral marketplace", description: ANSWER,
        provider: { "@id": `${SITE}/#organization` }, areaServed: { "@type": "Country", name: "India" }, url: PAGE_URL,
        audience: { "@type": "Audience", audienceType: "Students, freshers and working professionals looking for technology jobs, and employees who want to refer candidates" },
        availableChannel: { "@type": "ServiceChannel", serviceUrl: APP_URL },
        termsOfService: `${SITE}/terms`,
        hasOfferCatalog: {
          "@type": "OfferCatalog", name: "Referral plans",
          itemListElement: [
            { "@type": "Offer", name: "Search and send referral requests", price: 0, priceCurrency: "INR", description: "Free for everyone." },
            ...(info?.paywall ? [{ "@type": "Offer", name: "Open one chat", price: info.unlockFee, priceCurrency: "INR", description: "After a referrer accepts. Payments are non-refundable." }] : []),
            ...(offered(info, "unlimited") ? (info.subPlans || []).filter((p) => p.kind === "unlimited").map((p) => ({ "@type": "Offer", name: `${p.name} (monthly subscription)`, price: p.price, priceCurrency: "INR", description: "Unlimited requests and free chats. Renews monthly. Cancel any time; the plan stays active until it expires. Non-refundable." })) : []),
            ...(offered(info, "priority") ? (info.subPlans || []).filter((p) => p.kind === "priority").map((p) => ({ "@type": "Offer", name: p.name, price: p.price, priceCurrency: "INR", description: p.billing === "monthly" ? "Priority badge and requests listed first. Renews monthly." : `Priority badge and requests listed first for ${p.days} days. One-time.` })) : []),
            ...(info?.plansEnabled !== false ? (info?.plans || []).map((p) => ({ "@type": "Offer", name: p.name, price: p.price, priceCurrency: "INR", description: `${p.unlocks} chat credits.` })) : []),
          ],
        },
      },
      {
        "@type": "HowTo", "@id": `${PAGE_URL}#howto`, name: HOWTO_NAME, description: "Three steps to ask an employee for a referral.",
        step: SEEKER_STEPS.map(([name, text], i) => ({ "@type": "HowToStep", position: i + 1, name, text, url: `${PAGE_URL}#how-it-works` })),
      },
      { "@type": "FAQPage", "@id": `${PAGE_URL}#faq`, mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
      { "@type": "BreadcrumbList", "@id": `${PAGE_URL}#breadcrumb`, itemListElement: BREAD.map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })) },
    ],
  };
}
export const schemaJson = (info) => JSON.stringify(buildSchema(info)).replace(/</g, "\\u003c");

/* Unlimited and Priority are only described when the admin has them on sale (info = the public API answer; null while loading or prerendering) */
export const offered = (info, need) => {
  if (!need) return true;
  if (!info) return false;
  const has = (kind) => (info.subPlans || []).some((p) => p.kind === kind);
  if (need === "unlimited") return Boolean(info.subscriptionEnabled && has("unlimited"));
  if (need === "priority") return Boolean(info.priorityEnabled && has("priority"));
  if (need === "subscription") return offered(info, "unlimited") || Boolean(info.priorityEnabled && (info.subPlans || []).some((p) => p.kind === "priority" && p.billing === "monthly"));
  return true;
};
export const featuresFor = (info) => FEATURES.filter((f) => offered(info, f[4]));
export const faqFor = (info) => FAQ.filter((f) => offered(info, f[2]));
