import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowUpRight, CaretDown, Check, Clock, Confetti, FilmStrip, Images, Microphone, Package, Sparkle, Stack, TextAa, Ticket } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { claimFreeCredit } from "./memApi";
import AddonPicker from "./AddonPicker";
import { TEMPLATES, TemplateScene, rememberTemplate } from "./templates";
import { LivePhone, META } from "./Showcase";
import { AUDIENCES } from "./templates/thanks/audiences";
import { firstLook, limitsWithExtra, lookPrice, packsTotal, pickPass, priceLabel, rupees, secLabel, themesOf, upgradeFrom } from "./pricing";
import { useMedia } from "./chrome";
import { Btn, LookArt, OCCASION } from "./landingUi";
import { Banner, IconTile, SectionTitle } from "./appUi";
import { cx } from "./ui";

const WELCOME = {
  payment: "Payment received. Create your page below.",
  code: "Code accepted. Pick a template and create your page.",
  free: "Your free page is ready.",
  gift: "Your Lifetime pack includes a free page.",
};

const packsQuery = (packs) => Object.entries(packs).filter(([, n]) => n > 0).map(([k, n]) => `${k}:${n}`).join(",");

/* a number with a label: the real limits of a page, from what the admin set */
function Stat({ Icon, value, label, note, i }) {
  return (
    <li className="ma-in ma-lift ma-card flex min-w-0 items-center gap-3 p-3" style={{ "--i": i }}>
      <span className="ma-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ffe4ec] text-[#e11d48]"><Icon size={20} weight="duotone" aria-hidden /></span>
      <div className="min-w-0">
        <p className="body-1 tabular-nums text-[#2a1023]">{value}</p>
        <p className="caption-5 text-[#7a5370]">{label}{note ? ` · ${note}` : ""}</p>
      </div>
    </li>
  );
}

/*
  ONE TEMPLATE, IN FULL. Left: the real page in a phone. Right: its looks with their prices, exactly what a page can hold, the extras
  you can add (with prices), and the button. Everything shown comes from the single /config response.
*/
function Detail({ t, occ, cfg, onCreate, busy }) {
  const desk = useMedia("(min-width: 1024px)");
  const tall = useMedia("(min-height: 860px)");
  const looks = themesOf(occ);
  const [theme, setTheme] = useState(null);
  const [audience, setAudience] = useState(null);
  const [packs, setPacks] = useState({});
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [insideOpen, setInsideOpen] = useState(false);
  const meta = META[t.id];
  const o = OCCASION[t.id];

  const current = theme && looks.some((l) => l.id === theme) ? theme : firstLook(occ);
  const price = lookPrice(occ, current);
  const pass = pickPass(cfg.passes, price); // a page the user already paid for that covers this look
  const up = !pass ? upgradeFrom(cfg.passes, price) : null; // a cheaper page already paid for: only the difference is charged
  const extrasTotal = packsTotal(cfg.addons, packs);
  const picked = Object.values(packs).reduce((a, b) => a + b, 0);
  const total = pass ? 0 : Math.round(((up ? up.diff : price) + extrasTotal) * 100) / 100;
  const L = limitsWithExtra(occ.limits, pass?.extra);
  const base = { ...L, days: cfg.pageLifetimeDays };
  const showExtras = extrasOpen || picked > 0;

  const lookName = meta.themes.find((x) => x.id === current)?.name || t.name;
  const label = pass ? `Make my ${t.name.toLowerCase()} page` : up && total > 0 ? `Pay ${rupees(total)} more and make it` : total > 0 ? `Pay ${rupees(total)} and make it` : "Make my page, free";
  const shortLabel = pass ? "Make my page" : total > 0 ? `Pay ${rupees(total)}` : "Start free";
  // one short line above the price: what the number is for
  const dockLine = pass ? `${lookName} · your paid page covers it` : up ? `${lookName} · upgrade, ${rupees(up.from)} already paid` : picked > 0 ? `${lookName} + ${picked} extra pack${picked === 1 ? "" : "s"}` : `${lookName} · paid once`;

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-12">
      {/* the real template */}
      <div className="ma-in mx-auto lg:sticky lg:top-6">
        <div className="ml-stage relative rounded-3xl p-6" style={{ background: o.tint }}>
          <o.Icon size={40} weight="fill" className="ma-float absolute -left-3 -top-3" style={{ color: o.ink, "--r": "-14deg" }} aria-hidden />
          <Sparkle size={28} weight="fill" className="ma-float absolute -right-2 bottom-8 text-[#e11d48]" style={{ "--d": "1.5s", "--r": "12deg" }} aria-hidden />
          <LivePhone key={`${t.id}-${current}`} template={t} theme={current} audience={audience} scale={desk ? (tall ? 1 : 0.84) : 0.86} />
        </div>
        <p className="caption-4 mt-3 text-center text-[#8a6a80]">Live preview of <b className="text-[#2a1023]">{lookName}</b>. Scroll it and tap things.</p>
        <p className="mt-2 text-center md:hidden"><a href={`${t.demo}${current ? `?theme=${current}` : ""}`} target="_blank" rel="noopener noreferrer" className="ml-link body-4 inline-flex items-center gap-1 text-[#be123c]">Open it full screen <ArrowUpRight size={14} weight="bold" aria-hidden /></a></p>
      </div>

      <div className="min-w-0 space-y-8">
        <header className="ma-in">
          <div className="flex flex-wrap items-center gap-3">
            <IconTile style={{ background: o.tint, color: o.ink }}><o.Icon size={24} weight="duotone" aria-hidden /></IconTile>
            <h2 className="heading-3 text-[#2a1023]">{t.name}</h2>
            <span className="ma-chip caption-3 bg-[#ecfdf5] text-emerald-700 ring-1 ring-inset ring-emerald-200">Ready to use</span>
          </div>
          <p className="body-3 mt-3 max-w-xl text-[#7a5370]">{t.tagline}</p>
        </header>

        {/* looks and their prices */}
        <section aria-labelledby="looks-h">
          <SectionTitle id="looks-h"><span className="ma-num mr-2">1</span>Pick a look. {looks.length} to choose from</SectionTitle>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4" role="radiogroup" aria-label={`${t.name} looks`}>
            {looks.map((l, i) => {
              const th = meta.themes.find((x) => x.id === l.id);
              const on = l.id === current;
              return (
                <button key={l.id} type="button" role="radio" aria-checked={on} onClick={() => setTheme(l.id)} title={th?.blurb} style={{ "--i": i }} className="ma-pick ma-in min-w-0 rounded-2xl p-2 text-left">
                  <LookArt swatch={th?.swatch} className="h-16 rounded-lg" />
                  {on && <span className="ma-tick" aria-hidden><Check size={12} weight="bold" /></span>}
                  <span className="caption-3 mt-2 block truncate px-1 text-[#2a1023]">{th?.name || l.id}</span>
                  <span className={cx("body-4 block px-1 tabular-nums", l.price > 0 ? "text-[#be123c]" : "text-emerald-600")}>{priceLabel(l.price)}</span>
                </button>
              );
            })}
          </div>
          {t.id === "thanks" && (
            <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Who are you thanking">
              {AUDIENCES.map((a) => {
                const on = (audience || "friend") === a.id;
                return <button key={a.id} type="button" role="radio" aria-checked={on} onClick={() => setAudience(a.id)} className={cx("ml-chip caption-3 rounded-full px-3 py-2", on ? "bg-[#2a1023] text-white" : "bg-white text-[#6b3a5a] ring-1 ring-inset ring-[#f8d7e0]")}>{a.label}</button>;
              })}
            </div>
          )}
        </section>

        {/* the real limits of a page */}
        <section aria-labelledby="incl-h">
          <SectionTitle id="incl-h"><span className="ma-num mr-2">2</span>See what your page can hold</SectionTitle>
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Stat i={0} Icon={Images} value={`${L.photos} photos`} label={`${L.photoMb} MB each`} />
            <Stat i={1} Icon={FilmStrip} value={`${L.videos} video${L.videos === 1 ? "" : "s"}`} label={`Up to ${secLabel(L.videoSec)}`} note={`${L.videoMb} MB each`} />
            <Stat i={2} Icon={Microphone} value={`Voice ${secLabel(L.audioSec)}`} label={`${L.audioMb} MB file`} />
            <Stat i={3} Icon={TextAa} value={`${L.messageChars.toLocaleString("en-IN")} characters`} label="Your letter" />
            <Stat i={4} Icon={Clock} value={`${cfg.pageLifetimeDays + (pass?.extra?.days || 0)} days`} label="Online, then deleted" />
            <Stat i={5} Icon={Stack} value={`${looks.length} look${looks.length === 1 ? "" : "s"}`} label="Switch to the same price or less" />
          </ul>
          {pass?.extra && Object.values(pass.extra).some((v) => v > 0) && <p className="caption-4 mt-2 text-emerald-700">Includes the extras you already bought.</p>}
        </section>

        {/* extras on sale, with their prices */}
        {cfg.addons?.length > 0 && (
          <section aria-labelledby="extra-h" className="ma-card ma-in p-4 sm:p-6">
            <button type="button" onClick={() => setExtrasOpen((v) => !v)} aria-expanded={showExtras} className="group flex w-full items-center gap-3 rounded-2xl text-left">
              <IconTile className="bg-amber-50 text-amber-600"><Package size={24} weight="duotone" aria-hidden /></IconTile>
              <span className="min-w-0 flex-1">
                <span id="extra-h" className="body-1 block text-[#2a1023]"><span className="ma-num caption-3 mr-2">3</span>Need more room? Add extras</span>
                <span className="body-6 block text-[#8a6a80]">{cfg.addons.length} add ons from {rupees(Math.min(...cfg.addons.map((a) => a.price)))} a pack{picked > 0 ? ` · ${picked} picked` : ""}</span>
              </span>
              <CaretDown size={20} weight="bold" className={cx("shrink-0 text-[#e11d48] transition-transform duration-500", showExtras && "rotate-180")} aria-hidden />
            </button>
            {showExtras && (
              <div className="ml-step mt-4 space-y-3">
                {pass
                  ? <Banner tone="ok"><p>You already have a page ready for this look. Make it, then tap <b>Get more room</b> on the page to buy any of these.</p></Banner>
                  : <p className="body-6 text-[#7a5370]">Pick packs and they are added to your total. You can also buy them later, on the page.</p>}
                <AddonPicker catalog={cfg.addons} packs={pass ? {} : packs} onChange={setPacks} current={base} disabled={Boolean(pass) || busy} />
              </div>
            )}
          </section>
        )}

        <section className="ma-card ma-in p-4 sm:p-6">
          <button type="button" onClick={() => setInsideOpen((v) => !v)} aria-expanded={insideOpen} className="body-1 flex w-full items-center justify-between gap-3 rounded-2xl text-left text-[#2a1023]">
            What they get to do on this page <CaretDown size={20} weight="bold" className={cx("shrink-0 text-[#e11d48] transition-transform duration-500", insideOpen && "rotate-180")} aria-hidden />
          </button>
          {insideOpen && (
            <ul className="ml-step mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {t.inside.map((x) => <li key={x} className="body-6 flex gap-3 text-[#4a2340]"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full" style={{ background: o.tint, color: o.ink }}><Check size={12} weight="bold" aria-hidden /></span>{x}</li>)}
            </ul>
          )}
        </section>

        {/* the price and the one button stay in reach, in a compact dock above the tabs */}
        <div className="sticky bottom-20 z-20 lg:bottom-4">
          <div className="ma-dock">
            <div className="min-w-0 flex-1">
              <p className="caption-4 truncate text-[#fda4af]">{dockLine}</p>
              <p key={total} className="ma-bump inline-block text-xl font-semibold leading-7 tabular-nums sm:text-2xl sm:leading-8">{pass ? "Paid" : priceLabel(total)}</p>
            </div>
            <span className="hidden shrink-0 md:block"><a href={`${t.demo}${current ? `?theme=${current}` : ""}`} target="_blank" rel="noopener noreferrer" className="ma-dock-link button-sm">Full screen <ArrowUpRight size={14} weight="bold" aria-hidden /></a></span>
            <Btn loading={busy} onClick={() => { rememberTemplate(t.theme); onCreate({ t, occ, theme: current, audience, price, pass, packs }); }}>
              <Sparkle size={16} weight="fill" className="hidden min-[400px]:block" aria-hidden /> <span className="sm:hidden">{shortLabel}</span><span className="hidden sm:inline">{label}</span>
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
  THE TEMPLATES PAGE (signed in). Pick a template from the row, see its real price, looks, limits and extras, then make your page.
  A single request (/config) fills the whole page: templates, prices, limits, add-ons, your paid pages and the payment options.
*/
export default function MemoriesStudio({ cfg }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const added = Number(location.state?.added) || 0;
  const welcome = location.state?.welcome === "gift" ? (added > 1 ? `Your Lifetime pack added ${added} free pages.` : WELCOME.gift) : added > 1 ? `Code accepted. ${added} pages added.` : WELCOME[location.state?.welcome];

  // a template the admin has hidden (or switched all its looks off) is not shown at all
  const shown = useMemo(() => TEMPLATES.map((t) => ({ t, occ: cfg.occasions?.find((o) => o.theme === t.theme) })).filter((x) => x.occ), [cfg.occasions]);
  const remembered = (() => { try { return sessionStorage.getItem("memories:template"); } catch { return null; } })();
  const pickedId = [params.get("t"), remembered && TEMPLATES.find((x) => x.theme === remembered)?.id].find((id) => shown.some((s) => s.t.id === id)) || shown[0]?.t.id;
  const sel = shown.find((s) => s.t.id === pickedId);

  const create = async ({ t, occ, theme, audience, price, pass, packs }) => {
    const q = new URLSearchParams({ ...(theme ? { theme } : {}), ...(audience ? { audience } : {}) }).toString();
    if (pass) return navigate(`/memories/app/create/${t.id}${q ? `?${q}` : ""}`);
    const extras = packsQuery(packs);
    if (price > 0 || extras) return navigate(`/memories/app/pay?template=${t.id}${theme ? `&theme=${theme}` : ""}${audience ? `&audience=${audience}` : ""}${extras ? `&packs=${extras}` : ""}`);
    setBusy(true); // a free look with no extras: the page is made right here
    try { await claimFreeCredit(occ.id, theme); navigate(`/memories/app/create/${t.id}${q ? `?${q}` : ""}`); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div className="py-6 sm:py-8">
      {welcome && (
        <Banner tone="ok" title={welcome} className="mb-6"><p className="flex items-center gap-2"><Confetti size={16} weight="fill" className="ma-wiggle shrink-0" aria-hidden /> {location.state?.welcome === "gift" ? "It was added to your account. Pick a template below and make it for someone you love: a birthday, an apology, a thank-you, a proposal." : "Pick a template below and make your page."}</p></Banner>
      )}

      <header className="ma-hero ma-in p-6 sm:p-8">
        <div className="pointer-events-none absolute -bottom-16 right-4 hidden sm:flex" aria-hidden>
          {shown.slice(0, 3).map(({ t }, i) => (
            <span key={t.id} className="ma-float -ml-8 block" style={{ "--r": `${(i - 1) * 9}deg`, "--d": `${i * 0.8}s`, marginTop: i === 1 ? 0 : 24 }}><TemplateScene theme={t.theme} scale={0.42} /></span>
          ))}
        </div>
        <div className="relative sm:max-w-[60%]">
          <p className="ml-kicker caption-3">Templates</p>
          <h1 className="heading-3 mt-2 text-[#2a1023]">What are you celebrating?</h1>
          <p className="body-3 mt-2 text-[#7a5370]">Pick an occasion, choose a look and try it live before you pay. Every price and limit here is the real one.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {cfg.credits > 0 && <span className="ma-chip caption-3 bg-white px-3 py-2 text-emerald-700"><Sparkle size={14} weight="fill" className="ma-wiggle" aria-hidden /> {cfg.credits} paid page{cfg.credits === 1 ? "" : "s"} ready to make</span>}
            <Link to="/memories/app/pay" className="ma-mini caption-3 !rounded-full"><Ticket size={14} weight="fill" aria-hidden /> Have a code?</Link>
          </div>
        </div>
      </header>

      {shown.length === 0 ? (
        <p className="ma-card body-3 mt-10 p-8 text-center text-[#7a5370]">No templates are available right now. Please check back soon.</p>
      ) : (
        <>
          {/* the templates, with their price */}
          <nav className="-mx-4 mt-6 overflow-x-auto px-4 py-2 sm:mx-0 sm:overflow-visible sm:px-0" aria-label="Choose a template">
            <ul className="flex snap-x gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-5">
              {shown.map(({ t, occ }, i) => {
                const prices = occ.themes.length ? occ.themes.map((l) => l.price) : [occ.price];
                const lo = Math.min(...prices);
                const hi = Math.max(...prices);
                const on = t.id === pickedId;
                const o = OCCASION[t.id];
                return (
                  <li key={t.id} className="ma-in w-36 shrink-0 snap-start sm:w-auto" style={{ "--i": i }}>
                    <button type="button" onClick={() => setParams({ t: t.id }, { replace: true })} aria-pressed={on} className="ma-tcard" style={{ background: o.tint }}>
                      <o.Icon size={88} weight="fill" className="ma-tcard-big" style={{ color: o.ink }} aria-hidden />
                      {on && <span className="ma-tick !bg-[#2a1023]" aria-hidden><Check size={12} weight="bold" /></span>}
                      <span className="ma-icon relative grid h-12 w-12 place-items-center rounded-2xl bg-white" style={{ color: o.ink }}><o.Icon size={24} weight={on ? "fill" : "duotone"} aria-hidden /></span>
                      <span className="body-1 relative mt-4 text-[#2a1023]">{t.name}</span>
                      <span className="caption-4 relative" style={{ color: o.ink }}>{OCCASION[t.id].short}</span>
                      <span className="caption-3 relative mt-3 rounded-full bg-white px-2 py-1 tabular-nums text-[#2a1023]">{lo === hi ? priceLabel(lo) : `From ${priceLabel(lo)}`} · {occ.themes.length} look{occ.themes.length === 1 ? "" : "s"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-8">{sel && <Detail key={sel.t.id} t={sel.t} occ={sel.occ} cfg={cfg} onCreate={create} busy={busy} />}</div>
        </>
      )}
    </div>
  );
}
