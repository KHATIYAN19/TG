import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowRight, ArrowSquareOut, Check, Gift, GlobeHemisphereWest, Key, LockKey, Package, ShieldCheck, Sparkle, Ticket } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { claimFreeCredit, redeemCode, redeemGumroadOrder } from "./memApi";
import AddonPicker, { useQuote } from "./AddonPicker";
import { PAY_MESSAGES, payFor } from "./payFlow";
import { Loading } from "./AppShell";
import { SUPPORT_EMAIL } from "./legal/constants";
import { chooseGateway, gatewayLabel } from "./paymentGateway";
import { firstLook, limitsWithExtra, lookPrice, occasionOf, pickPass, priceLabel, rupees, themesOf, upgradeFrom } from "./pricing";
import { META } from "./Showcase";
import { TEMPLATES } from "./templates";
import { Btn, LookArt, OCCASION } from "./landingUi";
import { Banner, IconTile, PageHead } from "./appUi";
import { cx } from "./ui";

const STEPS = ["Account", "Choose and pay", "Create your page"];

export function Stepper({ current }) {
  return (
    <ol className="mx-auto mb-8 flex max-w-xl items-center" aria-label="Progress">
      {STEPS.map((label, i) => (
        <li key={label} className={cx("flex items-center", i < STEPS.length - 1 && "flex-1")} aria-current={i === current ? "step" : undefined}>
          <span className="flex items-center gap-2">
            <span className={cx("body-4 grid h-8 w-8 shrink-0 place-items-center rounded-full", i < current && "bg-emerald-500 text-white", i === current && "bg-[#e11d48] text-white", i > current && "bg-white text-[#a07890] ring-1 ring-inset ring-[#f8d7e0]")}>
              {i < current ? <Check size={14} weight="bold" aria-hidden /> : i + 1}
            </span>
            <span className={cx("body-4 hidden sm:block", i === current ? "text-[#2a1023]" : "text-[#a07890]")}>{label}</span>
          </span>
          {i < STEPS.length - 1 && <span className={cx("mx-3 h-0.5 flex-1 rounded", i < current ? "bg-emerald-300" : "bg-[#f8d7e0]")} aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

const Label = ({ htmlFor, children }) => <label htmlFor={htmlFor} className="title-4 mb-2 block text-[#4a2340]">{children}</label>;

/* ------------------------------------------------------------------ redeem: a unique code, or a Gumroad order */
function Redeem({ cfg, reload, after, wantsGumroad }) {
  const user = useSelector((s) => s.auth?.user);
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [gOrder, setGOrder] = useState("");
  const [gEmail, setGEmail] = useState(user?.email || "");
  const [gBusy, setGBusy] = useState(false);
  const [gError, setGError] = useState("");
  const gumRef = useRef(null);
  const gum = cfg?.gumroad;

  useEffect(() => { if (gum?.enabled && wantsGumroad) gumRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [gum?.enabled, wantsGumroad]);

  const redeem = async (e) => {
    e.preventDefault();
    if (code.trim().length < 3) return setCodeError("Enter your unique code.");
    setRedeeming(true); setCodeError("");
    try { await redeemCode(code.trim()); await reload(); toast.success("Code accepted. You can create a page.", { id: "memories-credit" }); after("code"); } catch (err) { setCodeError(errMsg(err)); } finally { setRedeeming(false); }
  };
  const redeemGumroad = async (e) => {
    e.preventDefault();
    if (gOrder.trim().length < 4 || !/^\S+@\S+\.\S+$/.test(gEmail.trim())) return setGError("Enter your order number and the email you used on Gumroad.");
    setGBusy(true); setGError("");
    try {
      const r = await redeemGumroadOrder(gOrder.trim(), gEmail.trim());
      await reload();
      toast.success(`${r.added} page${r.added === 1 ? "" : "s"} added.`, { id: "memories-credit" });
      after("code", r.added);
    } catch (err) { setGError(errMsg(err)); } finally { setGBusy(false); }
  };

  return (
    <div className={cx("grid grid-cols-1 gap-6", gum?.enabled && "lg:grid-cols-2")}>
      <section className="ma-card ma-in ma-lift flex min-w-0 flex-col p-6 sm:p-8" aria-labelledby="code-h">
        <IconTile className="ma-wiggle bg-amber-50 text-amber-600"><Ticket size={24} weight="duotone" aria-hidden /></IconTile>
        <h2 id="code-h" className="heading-6 mt-4 text-[#2a1023]">Have a unique code?</h2>
        <p className="body-6 mt-2 text-[#7a5370]">Enter it and a page is yours, free. A code works for <b>any template and look</b>.</p>
        <form onSubmit={redeem} className="mt-6" noValidate>
          <Label htmlFor="mem-code">Your code</Label>
          <div className="relative">
            <Key size={18} weight="duotone" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#e11d48]" aria-hidden />
            <input id="mem-code" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeError(""); }} maxLength={40} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="LOVE2025"
              className={cx("ml-input !pl-12 font-mono tracking-widest", codeError && "ml-input-bad")} aria-invalid={Boolean(codeError)} aria-describedby={codeError ? "code-err" : undefined} />
          </div>
          {codeError && <p id="code-err" role="alert" className="caption-4 mt-2 text-[#be123c]">{codeError}</p>}
          <Btn type="submit" className="mt-4 w-full" loading={redeeming}><Sparkle size={16} weight="fill" aria-hidden /> Use this code</Btn>
        </form>
        <p className="caption-5 mt-auto pt-6 text-[#8a6a80]">A code can be used once per person and can expire. Wrong tries are limited to keep codes safe.</p>
      </section>

      {gum?.enabled && (
        <section ref={gumRef} id="gumroad" className="ma-card ma-in ma-lift mem-anchor min-w-0 p-6 sm:p-8" style={{ "--i": 1 }} aria-labelledby="gum-h">
          <IconTile className="bg-sky-50 text-sky-600"><GlobeHemisphereWest size={24} weight="duotone" aria-hidden /></IconTile>
          <h2 id="gum-h" className="heading-6 mt-4 text-[#2a1023]">Outside India? Pay in any currency</h2>
          <p className="body-6 mt-2 text-[#7a5370]">Pay on Gumroad with a card or PayPal. Gumroad emails you a receipt with an <b>Order ID</b>. Enter it here with the email you paid with and your pages are added.</p>
          {gum.primary && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#fff0f4] p-3 pl-4">
              <span className="body-4 min-w-0 text-[#2a1023]">1. {gum.primary.name} <span className="font-normal text-[#8a6a80]">· {gum.primary.credits} page{gum.primary.credits === 1 ? "" : "s"}</span></span>
              {gum.primary.url
                ? <Btn href={gum.primary.url} target="_blank" rel="noopener noreferrer" size="sm">{gum.primary.price ? `Buy ${gum.primary.price}` : "Buy"} <ArrowSquareOut size={14} weight="bold" aria-hidden /></Btn>
                : <span className="body-4 text-[#2a1023]">{gum.primary.price}</span>}
            </div>
          )}
          <form onSubmit={redeemGumroad} noValidate className="mt-6 space-y-4">
            <p className="body-4 text-[#2a1023]">2. Add your pages</p>
            <div>
              <Label htmlFor="mem-gorder">Order ID</Label>
              <input id="mem-gorder" value={gOrder} onChange={(e) => { setGOrder(e.target.value); setGError(""); }} maxLength={60} autoComplete="off" spellCheck={false} placeholder="From your receipt" className={cx("ml-input font-mono", gError && "ml-input-bad")} aria-invalid={Boolean(gError)} />
            </div>
            <div>
              <Label htmlFor="mem-gemail">Email you paid with</Label>
              <input id="mem-gemail" type="email" inputMode="email" autoCapitalize="none" value={gEmail} onChange={(e) => { setGEmail(e.target.value); setGError(""); }} maxLength={254} autoComplete="email" placeholder="you@example.com" className={cx("ml-input", gError && "ml-input-bad")} aria-invalid={Boolean(gError)} aria-describedby={gError ? "gkey-err" : undefined} />
            </div>
            {gError && <p id="gkey-err" role="alert" className="caption-4 text-[#be123c]">{gError}</p>}
            <Btn type="submit" variant="ghost" className="w-full" loading={gBusy}><Sparkle size={16} weight="fill" aria-hidden /> Add my pages</Btn>
            <p className="caption-5 text-[#8a6a80]">Both must match your Gumroad receipt. Each purchase can be used one time, for one account.</p>
          </form>
        </section>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ checkout for one template + look */
/* "photos:2,days:1" from the templates page -> { photos: 2, days: 1 }, only add-ons that are on sale (the server checks the rest) */
const parsePacks = (raw, catalog) => {
  const ok = new Set((catalog || []).map((a) => a.key));
  const out = {};
  for (const part of String(raw || "").split(",")) {
    const [k, n] = part.split(":");
    const v = Math.floor(Number(n));
    if (ok.has(k) && v > 0) out[k] = Math.min(v, 100);
  }
  return out;
};

function Checkout({ cfg, reload, templateId, askedTheme, askedAudience, askedPacks }) {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth?.user);
  const occ = occasionOf(cfg, templateId);
  const t = TEMPLATES.find((x) => x.id === templateId);
  const meta = META[templateId];
  const looks = themesOf(occ);
  const [themeId, setThemeId] = useState(looks.some((l) => l.id === askedTheme) ? askedTheme : firstLook(occ));
  const [packs, setPacks] = useState(() => parsePacks(askedPacks, cfg.addons));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [again, setAgain] = useState(0); // bumped after a part payment so the price still missing is asked again

  const price = lookPrice(occ, themeId);
  const pass = pickPass(cfg.passes, price); // a pass the user already holds that covers this look
  const picked = Object.values(packs).reduce((a, b) => a + b, 0);
  const { quote, loading, error: quoteError } = useQuote({ kind: "page", occasionId: occ.id, theme: themeId, packs }, !pass || picked > 0, again);
  // a cheaper page already paid for: only the difference is charged (the server says the same in quote.upgrade)
  const roomOnly = Boolean(pass) && picked > 0; // a pass covers the look: only the extra room is paid for
  const up = !pass ? quote?.upgrade ? { from: quote.upgrade.from, diff: quote.base } : upgradeFrom(cfg.passes, price) : null;
  const total = roomOnly ? quote?.total ?? 0 : quote?.total ?? (up ? up.diff : price);
  const gateway = chooseGateway(cfg);
  const lookName = (id) => meta?.themes.find((x) => x.id === id)?.name || id;

  const goCreate = async () => {
    await reload();
    const q = new URLSearchParams({ ...(themeId ? { theme: themeId } : {}), ...(askedAudience ? { audience: askedAudience } : {}) }).toString();
    navigate(`/memories/app/create/${templateId}${q ? `?${q}` : ""}`, { replace: true, state: { welcome: "payment" } });
  };

  const pay = async () => {
    setBusy(true); setError("");
    try {
      if (pass && !roomOnly) return await goCreate();
      if (total <= 0) { await claimFreeCredit(occ.id, themeId); return await goCreate(); }
      const r = await payFor({ cfg, buy: { kind: "page", occasionId: occ.id, theme: themeId, packs }, user, price: total, description: roomOnly ? "Extra room for your page" : `${t?.name || "Memories"} page` });
      if (r.status === "redirect") return;
      if (r.status === "paid") {
        const fresh = await reload();
        if (fresh && !pickPass(fresh.passes, price) && !roomOnly) { // paid, but the look still costs more than the pass now holds (another tab paid first, or the price changed): show what is left
          setAgain((n) => n + 1);
          return toast.success("Payment received. A little more is needed for this look.", { id: "memories-credit" });
        }
        toast.success("Payment received.", { id: "memories-credit" });
        return await goCreate();
      }
      if (r.status === "dismissed") toast(PAY_MESSAGES.dismissed, { icon: "ℹ️", id: "memories-pay-cancel" });
      else setError(PAY_MESSAGES[r.status]);
    } catch (e) { setError(errMsg(e)); } finally { setBusy(false); }
  };

  const noGateway = total > 0 && !gateway;
  const current = { ...limitsWithExtra(occ.limits, null), days: cfg.pageLifetimeDays };

  const o = OCCASION[templateId];
  const payLabel = total <= 0 ? <><Gift size={16} weight="fill" aria-hidden /> Start for free</> : <><LockKey size={16} weight="fill" aria-hidden /> Pay {priceLabel(total)}{roomOnly ? " for extra room" : up ? " to upgrade" : ""}</>;
  const totalText = loading && picked > 0 ? "…" : priceLabel(total);
  const ready = pass && !roomOnly;
  const notes = (
    <>
      {(error || quoteError) && <Banner tone="error" className="mt-3"><p>{error || quoteError}</p></Banner>}
      {noGateway && <Banner tone="warn" className="mt-3"><p>Online payment isn&apos;t available right now. If you have a unique code, use it below.</p></Banner>}
    </>
  );

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-6">
        {/* the look */}
        <section className="ma-card ma-in p-4 sm:p-6" aria-labelledby="look-h">
          <div className="flex items-center gap-3">
            <IconTile style={{ background: o?.tint, color: o?.ink }}>{o && <o.Icon size={24} weight="duotone" aria-hidden />}</IconTile>
            <div className="min-w-0">
              <h2 id="look-h" className="heading-6 text-[#2a1023]">{t?.name}: pick a look</h2>
              <p className="caption-5 text-[#8a6a80]">Pay for the look you want. You can switch to any look at the same price or less later.</p>
            </div>
          </div>
          {looks.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4" role="radiogroup" aria-label="Looks">
              {looks.map((l) => {
                const th = meta?.themes.find((x) => x.id === l.id);
                const on = l.id === themeId;
                return (
                  <button key={l.id} type="button" role="radio" aria-checked={on} onClick={() => { setThemeId(l.id); setError(""); }} className="ma-pick min-w-0 rounded-2xl p-2 text-left">
                    <LookArt swatch={th?.swatch} className="h-14 rounded-lg" />
                    {on && <span className="ma-tick" aria-hidden><Check size={12} weight="bold" /></span>}
                    <span className="caption-3 mt-2 block truncate px-1 text-[#2a1023]">{th?.name || l.id}</span>
                    <span className={cx("body-4 block px-1 tabular-nums", l.price > 0 ? "text-[#be123c]" : "text-emerald-600")}>{priceLabel(l.price)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* add-ons */}
        <section className="ma-card ma-in p-4 sm:p-6" style={{ "--i": 1 }} aria-labelledby="add-h">
          <div className="flex items-center gap-3">
            <IconTile className="bg-amber-50 text-amber-600"><Package size={24} weight="duotone" aria-hidden /></IconTile>
            <div className="min-w-0">
              <h2 id="add-h" className="heading-6 text-[#2a1023]">Need more room? <span className="caption-4 text-[#a07890]">Optional</span></h2>
              <p className="caption-5 text-[#8a6a80]">Every page includes {current.photos} photos, {current.videos} video{current.videos === 1 ? "" : "s"} and a voice message. Add more only if you need it. You can also do this later, on the page.</p>
            </div>
          </div>
          <div className="mt-4"><AddonPicker catalog={cfg.addons} packs={packs} onChange={(p) => { setPacks(p); setError(""); }} current={current} disabled={busy} /></div>
        </section>
        {pass && <Banner tone="ok" title="You're all set for this look."><p>The page is included. Extra photos, longer videos or a longer letter are optional and paid separately above.</p></Banner>}
      </div>

      {/* the bill: beside the choices on large screens */}
      <aside className="ma-in hidden lg:sticky lg:top-6 lg:block" style={{ "--i": 2 }} aria-label="Order summary">
        <div className="ma-card overflow-hidden">
          <div className="relative overflow-hidden bg-[#ffe4ec] p-6">
            <Sparkle size={72} weight="fill" className="ma-float absolute -right-4 -top-4 text-[#fda4af]" style={{ "--r": "14deg" }} aria-hidden />
            <p className="ml-kicker caption-3 relative">Your order</p>
            <p key={totalText} className="ma-bump relative mt-2 inline-block text-5xl font-semibold leading-none tabular-nums text-[#2a1023]">{ready ? "Paid" : totalText}</p>
            <p className="caption-4 relative mt-2 text-[#7a5370]">One payment. No subscription.</p>
          </div>
          <div className="p-6">
            <dl className="space-y-3">
              <div className="body-6 flex justify-between gap-3"><dt className="min-w-0 text-[#6b3a5a]">{t?.name} · {lookName(themeId)}</dt><dd className="shrink-0 font-semibold tabular-nums text-[#2a1023]">{pass ? "Included" : priceLabel(up ? price : quote?.base ?? price)}</dd></div>
              {up && <div className="body-6 flex justify-between gap-3"><dt className="text-emerald-700">Already paid for a page</dt><dd className="shrink-0 font-semibold tabular-nums text-emerald-700">&minus;{rupees(up.from)}</dd></div>}
              {quote?.addons?.map((a) => (
                <div key={a.key} className="body-6 flex justify-between gap-3"><dt className="min-w-0 text-[#6b3a5a]">{a.name} <span className="text-[#a07890]">x{a.packs}</span></dt><dd className="shrink-0 font-semibold tabular-nums text-[#2a1023]">{rupees(a.price)}</dd></div>
              ))}
            </dl>
            {up && <p className="caption-4 mt-4 rounded-2xl bg-[#ecfdf5] p-3 text-emerald-900">You already paid {rupees(up.from)} for a page, so you only pay the {rupees(up.diff)} difference. Your paid page is upgraded, not bought again.</p>}
            {ready ? (
              <>
                <p className="caption-4 mt-4 rounded-2xl bg-[#ecfdf5] p-3 text-emerald-900">You already have a page ready for this look. Create it now, or pick extra room first.</p>
                <Btn className="mt-4 w-full" onClick={goCreate}>Create my page <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
              </>
            ) : (
              <>
                {notes}
                <Btn className="mt-4 w-full" onClick={pay} loading={busy} disabled={noGateway || (picked > 0 && !quote)}>{payLabel}</Btn>
                {total > 0 && <p className="caption-5 mt-3 flex items-start gap-2 text-[#8a6a80]"><ShieldCheck size={16} weight="fill" className="shrink-0 text-emerald-600" aria-hidden /> UPI, cards and netbanking on {gatewayLabel(gateway) || "a secure page"}. All sales are final; only a double payment is refunded.</p>}
              </>
            )}
          </div>
        </div>
      </aside>

      {/* phones and tablets: the total and the button stay in reach above the tabs */}
      <div className="sticky bottom-20 z-30 min-w-0 lg:hidden" aria-label="Order summary">
        {!ready && notes}
        <div className="ma-dock mt-3">
          <div className="min-w-0 flex-1">
            <p className="caption-4 truncate text-[#fda4af]">{ready ? "This look is paid for" : up ? `Upgrade, ${rupees(up.from)} already paid` : picked > 0 ? `${lookName(themeId)} + extras` : `${lookName(themeId)} · paid once`}</p>
            <p key={totalText} className="ma-bump inline-block text-xl font-semibold leading-7 tabular-nums sm:text-2xl sm:leading-8">{ready ? "Paid" : totalText}</p>
          </div>
          {ready
            ? <Btn onClick={goCreate}>Create my page <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
            : <Btn onClick={pay} loading={busy} disabled={noGateway || (picked > 0 && !quote)}>{total <= 0 ? <><Gift size={16} weight="fill" aria-hidden /> Start free</> : <><LockKey size={16} weight="fill" aria-hidden /> Pay {priceLabel(total)}</>}</Btn>}
        </div>
      </div>
    </div>
  );
}

/*
  CHECKOUT. Every template and look has its own price, set by the admin. Pick a look, add extras if you want (more photos, longer videos...),
  pay once, then build the page. With no template chosen this is the place to redeem a code or a Gumroad order.
*/
export default function MemoriesPay({ cfg, reload }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const templateId = params.get("template");
  const wantsGumroad = params.get("gumroad") === "1";
  if (!cfg) return <Loading label="Getting things ready…" />;

  const occ = templateId ? occasionOf(cfg, templateId) : null;
  // after a code, keep everything that was chosen on the way here (the look and, for a thank-you page, who it is for)
  const codeQuery = new URLSearchParams({ ...(params.get("theme") ? { theme: params.get("theme") } : {}), ...(params.get("audience") ? { audience: params.get("audience") } : {}) }).toString();
  const after = () => (occ ? navigate(`/memories/app/create/${templateId}${codeQuery ? `?${codeQuery}` : ""}`, { replace: true, state: { welcome: "code" } }) : navigate("/memories/app", { replace: true, state: { welcome: "code" } }));

  return (
    <div className="py-6 sm:py-8">
      <PageHead kicker={occ ? "Checkout" : "Codes and Gumroad"} title={occ ? "Almost there. Pay, then build your page" : "Redeem a code"}
        text={occ ? `You pay once for a page. It stays online for ${cfg.pageLifetimeDays || 30} days.` : "Have a unique code or a Gumroad order? Add it here, then pick any template."} />

      <div className="mt-8">
        {templateId && !occ ? (
          <Banner tone="warn"><p>This template isn&apos;t available right now. <Link to="/memories/app" className="font-semibold underline">Choose another</Link></p></Banner>
        ) : occ ? (
          <Checkout key={occ.id} cfg={cfg} reload={reload} templateId={templateId} askedTheme={params.get("theme")} askedAudience={params.get("audience")} askedPacks={params.get("packs")} />
        ) : (
          <Banner><p>Want to pay instead? <Link to="/memories/app" className="font-semibold text-[#be123c] underline">Choose a template</Link> and the price is right there.</p></Banner>
        )}

        <div className="mt-8">
          {occ && <h2 className="ml-kicker caption-3 mb-4 text-center">Or use a code</h2>}
          <Redeem cfg={cfg} reload={reload} after={after} wantsGumroad={wantsGumroad} />
        </div>
      </div>

      <p className="body-6 mx-auto mt-8 max-w-2xl text-center text-[#8a6a80]">Payment problem or a question? <a className="ml-link break-all font-semibold text-[#be123c]" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. <Link to="/memories/refund" className="ml-link font-semibold text-[#be123c]">Refund policy</Link></p>
    </div>
  );
}
