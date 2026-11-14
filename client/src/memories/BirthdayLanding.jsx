import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, Cake, Check, Eye, Plus, Sparkle } from "@phosphor-icons/react";

import { fetchPublicInfo, formatPrice } from "./api";
import { useMemoriesChrome, useReveal } from "./chrome";
import { TEMPLATES } from "./templates";
import { LivePhone } from "./Showcase";
import { THEME_LIST } from "./templates/birthday/themes";
import { AUDIENCES } from "./templates/birthday/audiences";
import MemoriesFooter from "./legal/MemoriesFooter";
import { FONT_LINKS, Logo, cx } from "./ui";
import { Btn, SIGNUP, SectionHead, useStickyFix } from "./landingUi";
import { trackCtaClick } from "./metaTracking";
import "./memories.css";
import "./landing.css";

/*
  /memories/birthday : the public page that explains and sells the Birthday template.
  It is written to be found and quoted: one clear answer near the top, plain question-and-answer headings, a comparison
  table, steps and an FAQ, with matching structured data (WebPage, SoftwareApplication, HowTo, FAQPage, BreadcrumbList).
  It is prerendered at build time (scripts/prerender.mjs), so everything a crawler needs is in the first HTML.
*/
const URL = "https://www.targettrek.in/memories/birthday";
const DEMO = "/memories/preview/birthday";
const BIRTHDAY = TEMPLATES.find((t) => t.id === "birthday");
const WHO = AUDIENCES.filter((a) => ["partner", "friend", "parent", "sibling", "child", "colleague"].includes(a.id));
const WHO_NAMES = { partner: "Girlfriend, boyfriend, husband or wife", friend: "Best friend", parent: "Mum or Dad", sibling: "Brother or sister", child: "Son or daughter", colleague: "Colleague or boss" };

const INSIDE = [
  ["🎟️", "An invitation to open", "The page starts as a ticket with their name on it. One tap opens the party and turns the sound on."],
  ["🎈", "Balloons to pop", "Every balloon bursts with one of your wishes. A golden one rains confetti, and one carries their age."],
  ["🪩", "A party switch", "One button drops a mirror ball, sweeps coloured lights across the screen and plays the birthday song."],
  ["🎂", "A cake to cut", "They blow out the candles, then drag the knife down twice to lift out a real slice. Fireworks follow."],
  ["🌠", "A wish they send you", "You ask a question, like “What is your birthday wish?”. Their answer comes straight back to you."],
  ["🎁", "Gifts you name yourself", "Write “Movie date” or “Weekend getaway”. Each one is a wrapped box that bursts open into a voucher."],
  ["🍫", "Chocolate and drinks", "A chocolate bar to unwrap and bite, and a drinks bar where they pour a glass and clink it with yours."],
  ["🪅", "A pinata with a fortune", "Five whacks and it bursts into sweets. A fortune for their year drops out."],
  ["💌", "Reasons, as a deck of cards", "Write why they are special. They flip through your reasons one card at a time."],
  ["🎟️", "Coupons to redeem", "Little promises like “One free coffee run”. They tap a ticket to stamp it Redeemed."],
  ["📸", "Photos, video and your voice", "A camera that prints your main photo, a scratch card, a film reel, a photo wall and a voice message."],
  ["✉️", "A sealed letter and fireworks", "Your letter writes itself out in handwriting. The page ends with a sky full of fireworks."],
];

const STEPS = [
  ["Pick who it is for and a look", "Choose partner, friend, parent, sibling, child or colleague. The whole page is worded for them. Then pick one of 11 looks."],
  ["Add your words and gifts", "Their name, their age, your letter, the wish you want to ask, gifts, reasons, coupons and your memories through the years."],
  ["Add photos, a video and your voice", "Upload your favourite pictures, one video and a voice message. Watch the live preview change as you type."],
  ["Send one link", "Share the link on WhatsApp, Instagram or email. Keep it private with a 6 digit PIN if you like. Then see what they opened and read their reply."],
];

const COMPARE = [
  ["What they do", "Play: pop, cut, unwrap, pour, break, reply", "Read it once", "Watch it once", "Flip a card"],
  ["Personal to them", "Their name, age, your photos, voice, gifts and reasons", "Text and emoji", "Photos and clips", "A stock design with a name"],
  ["They can answer you", "Yes: a birthday wish and a message, saved for you", "Only in the chat", "No", "Rarely"],
  ["You know they opened it", "Yes: opens, time spent and what they played with", "A blue tick", "No", "Sometimes"],
  ["Works from far away", "Yes: any phone, no app, no account", "Yes", "Yes", "Yes"],
  ["Time to make", "About 10 minutes", "1 minute", "1 to 2 hours", "5 minutes"],
];

const faqItems = (days, price) => [
  ["What is a birthday surprise page?", "A birthday surprise page is a small private website you make for one person and send as a link. When they open it they get a birthday party on their phone: balloons to pop, a cake to cut, gifts to unwrap, your photos, video and voice, a letter from you, and a box to write back."],
  ["How do I make a birthday page for someone?", "Sign up on Memories, choose the Birthday template, pick who it is for and a look, then fill in their name, your letter, gifts, reasons and photos. It takes about 10 minutes. You get one link to share on WhatsApp, Instagram or email."],
  ["How much does a birthday page cost?", price ? (price === "Free" ? "Birthday pages are free right now. There is no subscription." : `Birthday pages start from ${price}, paid once. There is no subscription. Each look shows its own price before you pay, and you can try the full template for free first.`) : "You pay a small one time price per page. There is no subscription. Each look shows its own price before you pay, and you can try the full template for free first."],
  ["Can I make one for my girlfriend, boyfriend, husband or wife?", "Yes. Choose Partner and the page is written as a love letter: romantic greeting, love coupons, reasons I love you, and a wish question like “What is your birthday wish, my love?”. The Love look adds hearts and a rose bouquet."],
  ["Can I make one for my mum, dad, brother, sister or best friend?", "Yes. There is separate wording for a parent, a brother or sister, a son or daughter, a best friend, family, a colleague and a teacher or mentor. A page for Mum reads grateful, a page for a brother reads cheeky, and a page for a colleague stays light and polite."],
  ["Does the birthday person need an app or an account?", "No. They just open your link in any browser on a phone, tablet or computer. If you made the page private, they type the 6 digit PIN first."],
  ["Can they reply to my birthday page?", "Yes. They can send you their birthday wish and a message from the page. You read both in your Activity screen, along with when they opened the page, how long they stayed and what they played with."],
  ["Can I add my own photos, video and voice?", "Yes. You can add several photos, a video and a voice message you record or upload. One photo is printed by a little camera on the page, another hides under a scratch card, and all of them go on a photo wall."],
  ["Is it good for long distance or belated birthdays?", "Yes. It is made for birthdays you cannot be there for. They open it wherever they are, and it still feels like a party you threw for them. It works just as well a day late."],
  ["How long does the page stay online?", `Each page is online for ${days} days from the day you create it, so they can come back and replay it. After that it is removed with its photos and videos. You can buy extra days as an add on.`],
  ["Can I keep the page private?", "Yes. Choose private and set a 6 digit PIN. Only someone with both the link and the PIN can open it. You can close the link or change the PIN at any time."],
  ["Can I change the page after I send it?", "Yes. While the page is online you can edit the letter, gifts, reasons, coupons, photos and video. The two names are locked when the page is created, so check the spelling first."],
];

const jsonLd = (obj) => <script type="application/ld+json">{JSON.stringify(obj)}</script>;

function Header() {
  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3">
      <div className="ml-nav mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full py-2 pl-4 pr-2">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex" aria-label="On this page">
          {[["inside", "What's inside"], ["who", "Who it's for"], ["looks", "Looks"], ["how", "How it works"], ["faq", "FAQ"]].map(([id, label]) => <a key={id} href={`#${id}`} className="button-sm text-[#6b3a5a] hover:text-[#e11d48]">{label}</a>)}
        </nav>
        <Btn to={SIGNUP} size="sm">Create a birthday page</Btn>
      </div>
    </header>
  );
}

export default function BirthdayLanding() {
  useMemoriesChrome();
  const [info, setInfo] = useState(null);
  const [who, setWho] = useState(WHO[1]);
  const [scale, setScale] = useState(0.9);
  const root = useRef(null);
  useStickyFix(root);
  useReveal([info]);

  useEffect(() => {
    let live = true;
    fetchPublicInfo().then((d) => live && setInfo(d)).catch(() => {}); // the page reads fine without live prices
    const fit = () => setScale(window.innerWidth < 640 ? 0.86 : 1);
    fit();
    window.addEventListener("resize", fit);
    const onClick = (e) => { const a = e.target instanceof Element ? e.target.closest('a[href*="mode=signup"]') : null; if (a) trackCtaClick(`birthday: ${a.textContent.trim()}`); };
    document.addEventListener("click", onClick);
    return () => { live = false; window.removeEventListener("resize", fit); document.removeEventListener("click", onClick); };
  }, []);

  const days = info?.pageLifetimeDays ?? 30;
  const price = info ? formatPrice(info.price) : null;
  const faq = faqItems(days, price);
  const title = "Birthday Surprise Page Maker: an online birthday party in one link | Memories";
  const description = "Make a personalised birthday surprise website for your partner, best friend, mum, dad, brother or sister. Balloons to pop, a cake to cut, gifts, a pinata, your photos, video and voice, and a wish they send back. Share one link.";

  return (
    <div ref={root} className="mem-root ml-root min-h-screen overflow-x-clip">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="birthday surprise page, birthday wish website, online birthday surprise, personalised birthday page, birthday website for girlfriend, birthday website for boyfriend, birthday page for best friend, birthday surprise for mom, long distance birthday surprise, virtual birthday card" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href={URL} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={URL} />
        <meta property="og:site_name" content="Memories by Target Trek" />
        <meta property="og:title" content="Throw them a birthday party in one link" />
        <meta property="og:description" content="A personalised birthday page with a cake to cut, gifts, a pinata, your photos and voice, and a wish they send back. Made in 10 minutes." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Throw them a birthday party in one link" />
        <meta name="twitter:description" content="A personalised birthday page with a cake to cut, gifts, a pinata, your photos and voice, and a wish they send back." />
        <meta name="theme-color" content="#fffaf6" />
        {FONT_LINKS.map((l) => <link key={l.href} {...l} />)}
        {jsonLd({ "@context": "https://schema.org", "@type": "WebPage", "@id": `${URL}#page`, url: URL, name: title, description, inLanguage: "en", isPartOf: { "@type": "WebSite", name: "Target Trek", url: "https://www.targettrek.in" }, about: { "@id": `${URL}#app` }, speakable: { "@type": "SpeakableSpecification", cssSelector: ["#answer", "#faq"] } })}
        {jsonLd({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [["Home", "https://www.targettrek.in/"], ["Memories", "https://www.targettrek.in/memories"], ["Birthday page", URL]].map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })) })}
        {jsonLd({
          "@context": "https://schema.org", "@type": "SoftwareApplication", "@id": `${URL}#app`, name: "Memories Birthday Page", applicationCategory: "LifestyleApplication", operatingSystem: "Any (web browser)", url: URL, description,
          featureList: INSIDE.map(([, name]) => name),
          ...(info && info.price != null ? { offers: { "@type": "Offer", price: String(info.price), priceCurrency: "INR", availability: "https://schema.org/InStock", url: URL } } : {}),
        })}
        {jsonLd({ "@context": "https://schema.org", "@type": "HowTo", name: "How to make a birthday surprise page", totalTime: "PT10M", step: STEPS.map(([name, text], i) => ({ "@type": "HowToStep", position: i + 1, name, text })) })}
        {jsonLd({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) })}
      </Helmet>

      <a href="#main" className="button-sm sr-only left-3 top-3 z-[70] rounded-full bg-white px-3 py-2 text-[#2a1023] focus:not-sr-only focus:fixed">Skip to content</a>
      <Header />

      <main id="main">
        {/* ---- hero ---- */}
        <section className="relative overflow-hidden pt-28 sm:pt-32">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
            <div className="text-center lg:text-left">
              <nav aria-label="Breadcrumb" className="caption-4 text-[#7a5370]"><Link to="/memories" className="hover:text-[#e11d48]">Memories</Link> <span aria-hidden>/</span> Birthday</nav>
              <p className="caption-3 mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[#be123c] ring-1 ring-[#f5dfe4]"><Cake size={14} weight="fill" aria-hidden /> Birthday surprise page maker</p>
              <h1 className="ml-hero-title heading-1 mt-5 pb-1">Throw them a birthday party in one link</h1>
              <p className="body-3 mx-auto mt-4 max-w-[620px] text-[#7a5370] sm:text-lg sm:leading-7 lg:mx-0">
                Make a personalised birthday page for your partner, best friend, mum, dad, brother or sister. They pop balloons, cut the cake, unwrap your gifts, break a pinata, read your letter and send their birthday wish back to you.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Btn to={SIGNUP} className="w-full max-w-xs sm:w-auto">Create a birthday page <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
                <Btn to={DEMO} variant="ghost" className="w-full max-w-xs sm:w-auto"><Eye size={16} weight="bold" aria-hidden /> Open the live demo</Btn>
              </div>
              <p className="caption-4 mt-3 text-[#7a5370]">{price ? (price === "Free" ? "Free right now. " : `From ${price}, paid once. `) : ""}No subscription. Try the whole page before you pay.</p>
              <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 lg:justify-start">
                {["Ready in 10 minutes", `${THEME_LIST.length} looks`, `${AUDIENCES.length} relationships`, "No app for them to install"].map((p) => <li key={p} className="caption-4 inline-flex items-center gap-1 text-[#6b3a5a]"><Check size={12} weight="bold" className="text-[#e11d48]" aria-hidden /> {p}</li>)}
              </ul>
            </div>
            <div className="flex flex-col items-center gap-4">
              <LivePhone template={BIRTHDAY} theme={who.theme} audience={who.id} scale={scale} eager />
              <div className="flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="See the page written for">
                {WHO.map((a) => (
                  <button key={a.id} type="button" role="radio" aria-checked={who.id === a.id} onClick={() => setWho(a)} className={cx("button-sm rounded-full px-3 py-1.5 ring-1 transition", who.id === a.id ? "bg-[#e11d48] text-white ring-[#e11d48]" : "bg-white text-[#6b3a5a] ring-[#f5dfe4] hover:bg-rose-50")}>{a.emoji} {a.label}</button>
                ))}
              </div>
              <p className="caption-4 text-[#7a5370]">This is the real page. Tap it to play.</p>
            </div>
          </div>
        </section>

        {/* ---- the short answer (the part answer engines quote) ---- */}
        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div id="answer" className="mem-reveal mx-auto max-w-3xl rounded-3xl bg-white p-6 ring-1 ring-[#f5dfe4] sm:p-10">
            <p className="ml-kicker caption-3">The short answer</p>
            <h2 className="heading-3 mt-3 text-[#2a1023]">What is a birthday surprise page?</h2>
            <p className="body-3 mt-4 text-[#4a2340]">
              A birthday surprise page is a small private website you make for one person and send as a link. When they open it, they get a birthday party on their phone: balloons to pop, a cake to cut, gifts to unwrap, your photos, video and voice, a letter from you, and a box to write back. It takes about 10 minutes to make and needs no app.
            </p>
            <dl className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {[["Made for", "One person: partner, friend, parent, sibling, child or colleague"], ["Time to make", "About 10 minutes"], ["How they open it", "A link, in any browser. No app, no account"], ["Privacy", "Public link, or locked with a 6 digit PIN"], ["They can reply", "Yes: a birthday wish and a message"], ["Online for", `${days} days from the day you create it`]].map(([k, v]) => (
                <div key={k} className="border-t border-[#f5dfe4] pt-3"><dt className="caption-3 text-[#be123c]">{k}</dt><dd className="body-6 mt-1 text-[#4a2340]">{v}</dd></div>
              ))}
            </dl>
          </div>
        </section>

        {/* ---- what is inside ---- */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHead id="inside" kicker="What's inside" title="Everything on a birthday page" text="Twelve things to play with, in the order they find them. Anything you leave empty is simply hidden." />
            <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {INSIDE.map(([emoji, name, text], i) => (
                <li key={name} className="mem-reveal rounded-3xl bg-[#fffaf6] p-6 ring-1 ring-[#f5dfe4]" style={{ "--rd": `${(i % 3) * 0.06}s` }}>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-2xl ring-1 ring-[#f5dfe4]" aria-hidden>{emoji}</span>
                  <h3 className="body-1 mt-4 text-[#2a1023]">{name}</h3>
                  <p className="body-6 mt-2 text-[#7a5370]">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---- who it is for ---- */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHead id="who" kicker="Who it's for" title="Written differently for every relationship" text="Pick who the page is for and the greeting, the wish question, the fortunes, the section titles and the sign-off all change to match." />
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {WHO.map((a, i) => (
                <article key={a.id} className="mem-reveal flex flex-col rounded-3xl bg-white p-6 ring-1 ring-[#f5dfe4]" style={{ "--rd": `${(i % 3) * 0.06}s` }}>
                  <p className="text-3xl" aria-hidden>{a.emoji}</p>
                  <h3 className="heading-5 mt-3 text-[#2a1023]">Birthday page for your {a.label.toLowerCase()}</h3>
                  <p className="caption-4 mt-1 text-[#be123c]">{WHO_NAMES[a.id]}</p>
                  <p className="body-6 mt-3 text-[#7a5370]">&ldquo;{a.heroSub}&rdquo;</p>
                  <dl className="body-6 mt-4 space-y-2 text-[#4a2340]">
                    <div><dt className="inline font-semibold">You ask: </dt><dd className="inline">{a.question}</dd></div>
                    <div><dt className="inline font-semibold">They can pick: </dt><dd className="inline">{a.wishChips.slice(0, 3).join(", ")}</dd></div>
                    <div><dt className="inline font-semibold">Gift ideas: </dt><dd className="inline">{a.giftIdeas.slice(0, 3).join(", ")}</dd></div>
                    <div><dt className="inline font-semibold">Signed: </dt><dd className="inline">{a.signoff}</dd></div>
                  </dl>
                  <Link to={`${DEMO}?audience=${a.id}&theme=${a.theme}`} className="button-sm mt-5 inline-flex items-center gap-1 text-[#e11d48] hover:underline">See this version <ArrowRight size={14} weight="bold" aria-hidden /></Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---- looks ---- */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHead id="looks" kicker="Looks" title={`${THEME_LIST.length} birthday themes`} text="Each look changes the colours, the cake, the balloons, the confetti and the decorations. Open any of them to try it." />
            <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {THEME_LIST.map((t, i) => (
                <li key={t.id} className="mem-reveal" style={{ "--rd": `${(i % 4) * 0.05}s` }}>
                  <Link to={`${DEMO}?theme=${t.id}`} className="block h-full rounded-3xl bg-[#fffaf6] p-4 ring-1 ring-[#f5dfe4] transition hover:-translate-y-1 hover:ring-[#fda4af]">
                    <span className="flex -space-x-2" aria-hidden>{t.swatch.map((c) => <i key={c} className="block h-9 w-9 rounded-full border-2 border-white shadow-sm" style={{ background: c }} />)}</span>
                    <span className="body-1 mt-3 block text-[#2a1023]">{t.name}</span>
                    <span className="caption-4 mt-1 block text-[#7a5370]">{t.blurb}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---- how it works ---- */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHead id="how" kicker="How it works" title="How to make a birthday surprise page" text="Four steps, about ten minutes, and you can change almost everything afterwards." />
            <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(([name, text], i) => (
                <li key={name} className="mem-reveal rounded-3xl bg-white p-6 ring-1 ring-[#f5dfe4]" style={{ "--rd": `${i * 0.06}s` }}>
                  <span className="heading-3 text-[#e11d48]">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="body-1 mt-3 text-[#2a1023]">{name}</h3>
                  <p className="body-6 mt-2 text-[#7a5370]">{text}</p>
                </li>
              ))}
            </ol>
            <div className="mem-reveal mt-10 text-center"><Btn to={SIGNUP}>Start my birthday page <ArrowRight size={16} weight="bold" aria-hidden /></Btn></div>
          </div>
        </section>

        {/* ---- ideas: wish questions by relationship ---- */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHead id="ideas" kicker="Ideas" title="Birthday wish questions to ask them" text="The page asks one question and sends you the answer. These are ready to use, or write your own." />
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {WHO.map((a, i) => (
                <div key={a.id} className="mem-reveal rounded-3xl bg-[#fffaf6] p-6 ring-1 ring-[#f5dfe4]" style={{ "--rd": `${(i % 3) * 0.06}s` }}>
                  <h3 className="body-1 text-[#2a1023]">{a.emoji} Questions for your {a.label.toLowerCase()}</h3>
                  <ul className="body-6 mt-3 list-disc space-y-1.5 pl-5 text-[#7a5370]">{a.questions.map((q) => <li key={q}>{q}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- comparison ---- */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHead kicker="Compare" title="A birthday page vs a message, a video or an e-card" text="A message is read, a video is watched. A page is played with, and it answers back." />
            <div className="mem-reveal mt-12 overflow-x-auto rounded-3xl bg-white ring-1 ring-[#f5dfe4]">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <caption className="sr-only">How a Memories birthday page compares with a text message, a video montage and an e-card</caption>
                <thead>
                  <tr className="caption-3 text-[#7a5370]">
                    <th scope="col" className="p-4" />
                    <th scope="col" className="bg-rose-50 p-4 text-[#be123c]">Memories birthday page</th>
                    <th scope="col" className="p-4">Text message</th>
                    <th scope="col" className="p-4">Video montage</th>
                    <th scope="col" className="p-4">E-card</th>
                  </tr>
                </thead>
                <tbody className="body-6 text-[#4a2340]">
                  {COMPARE.map(([k, ...cells]) => (
                    <tr key={k} className="border-t border-[#f5dfe4]">
                      <th scope="row" className="p-4 font-semibold text-[#2a1023]">{k}</th>
                      {cells.map((c, j) => <td key={j} className={cx("p-4 align-top", j === 0 && "bg-rose-50 font-medium")}>{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ---- FAQ ---- */}
        <section className="bg-white py-20 sm:py-24">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div id="faq" className="mem-anchor mem-reveal lg:sticky lg:top-28 lg:self-start">
              <p className="ml-kicker caption-3">FAQ</p>
              <h2 className="heading-2 mt-3 text-[#2a1023]">Birthday page questions, answered</h2>
              <p className="body-3 mt-4 text-[#7a5370]">Short, straight answers. Something else on your mind?</p>
              <Btn to="/memories/contact" variant="ghost" className="mt-6">Ask us directly <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
            </div>
            <div className="space-y-3">
              {faq.map(([q, a], i) => (
                <details key={q} open={i === 0} className="ml-faq mem-reveal rounded-2xl bg-[#fffaf6] px-4 ring-1 ring-[#f5dfe4] sm:px-6" style={{ "--rd": `${(i % 4) * 0.05}s` }}>
                  <summary className="flex cursor-pointer items-center justify-between gap-4 rounded-lg py-4 text-[#2a1023]">
                    <h3 className="body-1">{q}</h3>
                    <span className="ml-faq-plus grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#e11d48] ring-1 ring-[#f5dfe4]"><Plus size={14} weight="bold" aria-hidden /></span>
                  </summary>
                  <p className="ml-faq-a body-6 pb-4 pr-8 text-[#7a5370]">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---- final call ---- */}
        <section className="px-4 py-20 sm:px-6 sm:py-24">
          <div className="mem-reveal relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#e11d48] px-6 py-16 text-center text-white sm:px-12 sm:py-24">
            <Sparkle size={40} weight="fill" className="mem-beat mx-auto" aria-hidden />
            <h2 className="heading-1 mx-auto mt-6 max-w-[680px]">Their birthday comes once a year. Make it the one they replay.</h2>
            <p className="body-3 mx-auto mt-4 max-w-[680px] text-rose-100">Ten minutes now. A link they will open again and again.</p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Btn to={SIGNUP} variant="light" className="w-full max-w-xs sm:w-auto">Create a birthday page <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
              <p className="caption-4 text-rose-100">{price && price !== "Free" ? `From ${price}, paid once. ` : ""}Try the whole page before you pay.</p>
              <p className="caption-4 text-rose-100">Other occasions: <Link to="/memories" className="underline underline-offset-2">proposal, anniversary, sorry, thank you and Christmas pages</Link></p>
            </div>
          </div>
        </section>
      </main>
      <MemoriesFooter />
    </div>
  );
}
