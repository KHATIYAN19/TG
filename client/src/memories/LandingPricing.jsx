import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Clock, FilmStrip, Images, Microphone, ShieldCheck, Sparkle, Ticket, TextAa } from "@phosphor-icons/react";

import { formatPrice } from "./api";
import { ADDON_META, secLabel } from "./pricing";
import { META } from "./Showcase";
import { Btn, OCCASION, SIGNUP, SectionHead } from "./landingUi";

/*
  The landing page's pricing: every number here comes from what the admin set (public info), nothing is typed in by hand.
    - the price of each template and of each look
    - what a page of that template includes (photos, videos, video length, voice message, letter, days online)
    - the add-ons on sale, with the admin's pack size, price and maximum
*/

const range = (nums) => { const lo = Math.min(...nums); const hi = Math.max(...nums); return lo === hi ? formatPrice(lo) : `${formatPrice(lo)} to ${formatPrice(hi)}`; };
const nameOf = (theme, id) => META[theme]?.themes.find((t) => t.id === id)?.name || id;

/* ---------------------------------------------------- tagline: words light up one at a time as they scroll into the trigger zone */
export function TaglineReveal() {
  const ref = useRef(null);
  const words = "Some feelings are too big for a text message. Give them a page they can open, hear and keep.".split(" ");

  useEffect(() => {
    const spans = [...ref.current.querySelectorAll(".mem-word")];
    const calm = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (calm || typeof IntersectionObserver === "undefined") { spans.forEach((w) => w.classList.add("on")); return undefined; }
    // a word turns on when it crosses a line 35% up from the bottom of the screen, and stays on (it never replays)
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -35% 0px", threshold: 0 });
    spans.forEach((w) => io.observe(w));
    return () => io.disconnect();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6" aria-label="Why Memories">
      <p ref={ref} className="heading-1 mx-auto max-w-[680px] text-center text-[#2a1023]">
        {words.map((w, i) => <span key={i} className="mem-word">{w}{i < words.length - 1 ? " " : ""}</span>)}
      </p>
    </section>
  );
}

/* ---------------------------------------------------- one template's price card */
function PriceCard({ o, days, i }) {
  const occ = OCCASION[o.theme];
  const Icon = occ?.Icon || Sparkle;
  const l = o.limits;
  const prices = o.themes.length ? o.themes.map((t) => t.price) : [o.price];
  const same = new Set(prices).size === 1;
  const lines = [
    [Images, `${l.photos} photos, up to ${l.photoMb} MB each`],
    [FilmStrip, `${l.videos} video${l.videos === 1 ? "" : "s"}, up to ${secLabel(l.videoSec)} and ${l.videoMb} MB each`],
    [Microphone, `Voice message up to ${secLabel(l.audioSec)}`],
    [TextAa, `Letter up to ${l.messageChars.toLocaleString("en-IN")} characters`],
    [Clock, `Online for ${days} days`],
  ];
  return (
    <li className="mem-reveal" style={{ "--rd": `${(i % 3) * 0.08}s` }}>
      <div className="ml-card flex h-full flex-col rounded-3xl bg-white p-6 ring-1 ring-[#f5dfe4]">
        <div className="flex items-center gap-3">
          <span className="ml-card-icon grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: occ?.tint || "#ffe4ec", color: occ?.ink || "#be123c" }}><Icon size={24} weight="duotone" aria-hidden /></span>
          <div className="min-w-0">
            <h3 className="heading-6 text-[#2a1023]">{o.name}</h3>
            <p className="body-6 text-[#8a6a80]">{o.themes.length} look{o.themes.length === 1 ? "" : "s"}</p>
          </div>
        </div>
        <p className="mt-6 text-4xl font-semibold tabular-nums tracking-tight text-[#2a1023]">{range(prices)}</p>
        <p className="body-6 mt-1 text-[#8a6a80]">{same ? "Every look, one payment" : "Depends on the look, one payment"}</p>

        {!same && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label={`${o.name} looks and prices`}>
            {o.themes.map((t) => <li key={t.id} className="caption-4 rounded-full bg-rose-50 px-3 py-1 text-[#6b3a5a]">{nameOf(o.theme, t.id)} <b className="font-semibold text-[#be123c]">{formatPrice(t.price)}</b></li>)}
          </ul>
        )}

        <ul className="mb-6 mt-6 space-y-3">
          {lines.map(([Ic, text]) => <li key={text} className="body-6 flex items-start gap-3 text-[#4a2340]"><Ic size={16} weight="duotone" className="mt-0.5 shrink-0 text-[#e11d48]" aria-hidden /> {text}</li>)}
        </ul>
        <Btn to={SIGNUP} variant="ghost" className="mt-auto w-full">Create a {o.name.toLowerCase()} page</Btn>
      </div>
    </li>
  );
}

/* ---------------------------------------------------- add-ons the admin sells */
function AddonCard({ a }) {
  const m = ADDON_META[a.key] || ADDON_META.photos;
  return (
    <li className="mem-reveal flex gap-4 rounded-3xl bg-white p-4 ring-1 ring-[#f5dfe4]">
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${m.tone}`}><m.Icon className="h-5 w-5" aria-hidden /></span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h4 className="body-1 text-[#2a1023]">{a.name}</h4>
          <p className="body-1 shrink-0 tabular-nums text-[#be123c]">{formatPrice(a.price)}</p>
        </div>
        <p className="body-6 mt-1 text-[#7a5370]">{a.description}</p>
        <p className="caption-4 mt-2 text-[#8a6a80]">Each pack adds {a.unit} {a.unitLabel}. Up to {a.maxPacks} pack{a.maxPacks === 1 ? "" : "s"} per page, so +{Math.round(a.unit * a.maxPacks * 100) / 100} at most.</p>
      </div>
    </li>
  );
}

export default function PricingSection({ info }) {
  const days = info?.onlineDays ?? info?.pageLifetimeDays ?? 30;
  const cards = info?.occasions || [];
  const addons = info?.addons || [];

  // a worked example from the real numbers: the cheapest page, plus one pack of the first add-on that is for sale
  const example = useMemo(() => {
    if (!cards.length || !addons.length) return null;
    const cheapest = cards.map((o) => ({ o, p: Math.min(...(o.themes.length ? o.themes.map((t) => t.price) : [o.price])) })).sort((a, b) => a.p - b.p)[0];
    const a = addons[0];
    return { name: cheapest.o.name, page: cheapest.p, addon: a.name, add: a.price, total: Math.round((cheapest.p + a.price) * 100) / 100, unit: a.unit, label: a.unitLabel };
  }, [cards, addons]);

  return (
    <section className="py-20 sm:py-24" aria-labelledby="pricing-h">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead id="pricing" kicker="Pricing" title={<span id="pricing-h">Pay once for the look you pick</span>} text="Each template has its own price, and some looks cost a little more. One payment per page. No subscription, ever." />

        {cards.length > 0 ? (
          <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{cards.map((o, i) => <PriceCard key={o.theme} o={o} days={days} i={i} />)}</ul>
        ) : (
          <div className="mem-reveal mx-auto mt-12 max-w-md rounded-3xl bg-white p-6 text-center ring-1 ring-[#f5dfe4]">
            <p className="body-1 text-[#2a1023]">The exact price is shown before you pay.</p>
            <Btn to={SIGNUP} className="mt-4">Create your page <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
          </div>
        )}

        {addons.length > 0 && (
          <div className="mt-20">
            <div className="mem-reveal mx-auto max-w-[680px] text-center">
              <h3 className="heading-3 text-[#2a1023]">Need more room? Add it as you go.</h3>
              <p className="body-3 mt-3 text-[#7a5370]">Hit a limit while building? Buy a pack when you reach it, or later from your page. Each pack is a small one time price.</p>
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">{addons.map((a) => <AddonCard key={a.key} a={a} />)}</ul>
            {example && (
              <p className="mem-reveal body-6 mx-auto mt-8 max-w-[680px] rounded-2xl bg-white p-4 text-center text-[#6b3a5a] ring-1 ring-[#f5dfe4]">
                For example: a {example.name} page at {formatPrice(example.page)}, plus one {example.addon.toLowerCase()} pack ({example.unit} {example.label}) at {formatPrice(example.add)}, comes to <b className="text-[#2a1023]">{formatPrice(example.total)}</b> in total.
              </p>
            )}
          </div>
        )}

        {/* what takes the risk out */}
        <ul className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3" aria-label="Before you pay">
          {[
            [CheckCircle, "Try every template first", "Each template on this page is the real thing. Tap it, scroll it and switch looks before you spend anything."],
            [ShieldCheck, "See the total before you pay", "Your look and any add-ons are added up on screen first. You are charged only when you confirm."],
            [Ticket, "Got a unique code?", "Enter it after you sign up and your page is free, on any template and any look."],
          ].map(([Icon, t, d], i) => (
            <li key={t} className="mem-reveal flex gap-3 rounded-3xl bg-[#ecfdf5] p-6" style={{ "--rd": `${i * 0.08}s` }}>
              <Icon size={24} weight="duotone" className="shrink-0 text-emerald-600" aria-hidden />
              <div><p className="body-1 text-[#2a1023]">{t}</p><p className="body-6 mt-1 text-[#4a5f55]">{d}</p></div>
            </li>
          ))}
        </ul>
        <p className="caption-5 mt-4 text-center text-[#8a6a80]">All sales are final. Purchases are not refundable, except a double payment (email supporttargettrek@gmail.com). Deleting a page gives no refund or new page. <Link to="/memories/refund" className="font-semibold text-[#be123c] hover:underline">Refund policy</Link></p>
      </div>
    </section>
  );
}
