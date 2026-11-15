import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import { TEMPLATES } from "./templates";
import { OCCASION } from "./landingUi";

/*
  SEO, AEO and GEO for /memories (this page is prerendered at build time by scripts/prerender.mjs, so all of it is in the first HTML).

  SEO  title, description, canonical, robots, Open Graph / Twitter, breadcrumb, sitelinks-friendly internal links.
  AEO  the answer comes first (see AnswerBlock: one plain definition, quick facts, the occasions), and the FAQ / HowTo / ItemList
       structured data is built from the SAME text the visitor sees, so a search or answer engine can quote it as is.
  GEO  built for India first: en-IN language, region meta, INR prices, UPI / cards / netbanking, areaServed IN; the page also says
       plainly how people abroad pay (Gumroad), because that is the question an AI assistant gets asked.
*/
export const SITE = "https://www.targettrek.in";
export const URL = `${SITE}/memories`;
const IMAGE = "https://i.postimg.cc/13B9k289/target-Trek-logo-2.jpg";

export const TITLE = "Birthday, Proposal & Anniversary Page Maker Online | Memories";
export const DESCRIPTION = "Make an interactive page for a birthday, proposal, anniversary, apology, thank you or Christmas. Add your words, photos, videos and voice, then share one private or public link. Pay once in INR with UPI. No app needed.";

const STEPS = [
  ["Pick an occasion and a look", "Sign up with Google or your email, choose a template and the look that fits them. The price is on screen before you pay."],
  ["Make it yours", "Fill in the names, your letter, the gifts, your photos, videos and a voice message. The page changes live as you type."],
  ["Send one link", "Share it on WhatsApp or anywhere. Keep it private with a PIN, then watch your Activity screen fill in when they open it."],
];

const ld = (obj) => <script type="application/ld+json">{JSON.stringify(obj)}</script>;

export default function LandingSeo({ info, faq }) {
  const live = TEMPLATES.filter((t) => t.status === "live");
  const price = info?.price != null ? String(info.price) : null;
  const priceTo = info?.priceTo != null && info.priceTo > info.price ? String(info.priceTo) : null;

  return (
    <Helmet htmlAttributes={{ lang: "en-IN" }}>
      <title>{TITLE}</title>
      <meta name="description" content={DESCRIPTION} />
      <meta name="keywords" content="birthday surprise page, online birthday wish website, proposal page, anniversary page maker, sorry page for girlfriend, thank you page, Christmas wish page, personalised greeting website, interactive greeting page India, digital greeting card with photos and video" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={URL} />
      <link rel="alternate" hrefLang="en-IN" href={URL} />
      <link rel="alternate" hrefLang="en" href={URL} />
      <link rel="alternate" hrefLang="x-default" href={URL} />
      {/* GEO: who the page is for */}
      <meta httpEquiv="content-language" content="en-IN" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      <meta name="target" content="all" />
      <meta name="audience" content="India" />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={URL} />
      <meta property="og:site_name" content="Memories by Target Trek" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content="Memories: say it with a page they will never forget" />
      <meta property="og:description" content="Birthday, proposal, Christmas, sorry, anniversary and thank you pages with your photos, videos and voice. Share one link, or lock it with a PIN." />
      <meta property="og:image" content={IMAGE} />
      <meta property="og:image:alt" content="Memories by Target Trek: interactive pages for birthdays, proposals and anniversaries" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Memories: say it with a page they will never forget" />
      <meta name="twitter:description" content="Interactive birthday, proposal, anniversary, sorry, thank you and Christmas pages. One link, no app." />
      <meta name="twitter:image" content={IMAGE} />
      <meta name="theme-color" content="#fffaf6" />

      {ld({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage", "@id": `${URL}#page`, url: URL, name: TITLE, description: DESCRIPTION, inLanguage: "en-IN",
            isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${URL}#app` }, primaryImageOfPage: { "@type": "ImageObject", url: IMAGE },
            breadcrumb: { "@id": `${URL}#breadcrumb` }, mainEntity: { "@id": `${URL}#app` }, speakable: { "@type": "SpeakableSpecification", cssSelector: ["[data-answer]"] },
          },
          { "@type": "WebSite", "@id": `${SITE}/#website`, url: SITE, name: "Target Trek", inLanguage: "en-IN", publisher: { "@id": `${SITE}/#org` } },
          { "@type": "Organization", "@id": `${SITE}/#org`, name: "Target Trek", url: SITE, logo: IMAGE, areaServed: { "@type": "Country", name: "India" }, availableLanguage: "English" },
          {
            "@type": "BreadcrumbList", "@id": `${URL}#breadcrumb`,
            itemListElement: [["Home", `${SITE}/`], ["Memories", URL]].map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })),
          },
          {
            "@type": "SoftwareApplication", "@id": `${URL}#app`, name: "Memories by Target Trek", applicationCategory: "LifestyleApplication", operatingSystem: "Any (web browser)",
            url: URL, description: DESCRIPTION, inLanguage: "en-IN", provider: { "@id": `${SITE}/#org` }, areaServed: { "@type": "Country", name: "India" },
            featureList: ["Interactive templates for six occasions", "Photos, videos and a voice message", "Private pages with a PIN", "Activity screen: see when and how they opened it", "Opens from a link, no app or sign-up for the receiver"],
            // the price is only stated when the live price has loaded: a structured price must be the real one
            ...(price ? { offers: priceTo ? { "@type": "AggregateOffer", lowPrice: price, highPrice: priceTo, priceCurrency: "INR", availability: "https://schema.org/InStock", url: URL } : { "@type": "Offer", price, priceCurrency: "INR", availability: "https://schema.org/InStock", url: URL } } : {}),
          },
          {
            "@type": "ItemList", "@id": `${URL}#templates`, name: "Memories templates", numberOfItems: live.length,
            itemListElement: live.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: `${t.name} page`, description: t.tagline, url: t.id === "birthday" ? `${URL}/birthday` : `${SITE}${t.demo}` })),
          },
          { "@type": "HowTo", "@id": `${URL}#howto`, name: "How to make a Memories page", totalTime: "PT10M", step: STEPS.map(([name, text], i) => ({ "@type": "HowToStep", position: i + 1, name, text })) },
          { "@type": "FAQPage", "@id": `${URL}#faq`, mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
        ],
      })}
    </Helmet>
  );
}

/**
 * The answer first, in plain words a person or an AI assistant can quote: what it is, who it is for, what it costs, how long it lasts.
 * Visible on the page (never hidden), with links to every template.
 */
export function AnswerBlock({ info, priceLabel }) {
  const days = info?.pageLifetimeDays ?? 30;
  const cost = priceLabel ? (priceLabel === "Free" ? "free right now" : `from ${priceLabel}, paid once`) : "paid once, with the exact price shown before you pay";
  const live = TEMPLATES.filter((t) => t.status === "live");
  return (
    <section className="bg-white py-14 sm:py-16" aria-labelledby="what-is-memories">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 id="what-is-memories" className="heading-2 text-center text-[#2a1023]">What is Memories?</h2>
        <p data-answer className="body-3 mx-auto mt-4 max-w-[760px] text-center text-[#6b3a5a] sm:text-lg sm:leading-8">
          Memories by Target Trek is an online maker for interactive greeting pages. You choose an occasion (birthday, proposal, anniversary, apology, thank you or Christmas), add your message, photos, videos and your own voice, and share one link on WhatsApp or anywhere. The other person opens it in any browser with no app and no sign-up, and can send a reply back. Pages cost {cost} in INR through UPI, cards or netbanking, stay online for {days} days, and can be locked with a PIN.
        </p>
        <dl className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Occasions", `${live.length} templates`],
            ["Price", priceLabel ? (priceLabel === "Free" ? "Free right now" : `From ${priceLabel}`) : "Shown before you pay"],
            ["Online for", `${days} days`],
            ["Privacy", "Public link or 6 digit PIN"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-rose-50/60 p-4 text-center ring-1 ring-rose-100">
              <dt className="caption-4 text-[#7a5370]">{k}</dt>
              <dd className="mt-1 font-semibold text-[#2a1023]">{v}</dd>
            </div>
          ))}
        </dl>
        <nav aria-label="Memories templates" className="mt-8">
          <ul className="flex flex-wrap justify-center gap-2">
            {live.map((t) => {
              const Icon = OCCASION[t.id]?.Icon;
              return (
                <li key={t.id}>
                  <Link to={t.id === "birthday" ? "/memories/birthday" : t.demo} title={t.tagline} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-[#be123c] ring-1 ring-[#f5dfe4] hover:bg-rose-50">
                    {Icon && <Icon size={16} weight="fill" aria-hidden />} {t.name} page
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </section>
  );
}
