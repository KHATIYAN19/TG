import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Minus, Plus } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { getQuote } from "./memApi";
import { ADDON_META, rupees } from "./pricing";
import { cx } from "./ui";

/** The price of a selection, asked from the server (it is the only one that knows). Waits a moment while the stepper is being tapped. */
export function useQuote(buy, enabled = true, nonce = 0) { // bump `nonce` to ask again (after a payment, the price still missing)
  const [state, setState] = useState({ quote: null, loading: false, error: "" });
  const key = JSON.stringify(buy);
  const gen = useRef(0);
  useEffect(() => {
    if (!enabled || !buy) { setState({ quote: null, loading: false, error: "" }); return undefined; }
    const mine = ++gen.current;
    setState((s) => ({ ...s, loading: true, error: "" }));
    const t = setTimeout(async () => {
      try {
        const quote = await getQuote(buy);
        if (mine === gen.current) setState({ quote, loading: false, error: "" });
      } catch (e) {
        if (mine === gen.current) setState({ quote: null, loading: false, error: errMsg(e) });
      }
    }, 250);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, nonce]);
  return state;
}

/*
  ADD-ONS: more photos, longer videos, a bigger voice message, a longer letter, more days online.
  Each one is a pack with a price; the stepper picks how many packs. `current` is what the page can hold now (so each card can say
  "10 photos -> 20 photos"), `owned` is the room this page already bought (the server limits the packs per page).
*/
export default function AddonPicker({ catalog, packs, onChange, current = {}, owned = {}, disabled = false }) {
  if (!catalog?.length) return <p className="body-6 rounded-2xl bg-white p-4 text-[#7a5370] ring-1 ring-inset ring-[#f8d7e0]">There are no add ons available right now.</p>;

  const set = (key, n) => onChange({ ...packs, [key]: Math.max(0, n) });
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2" aria-label="Add ons">
      {catalog.map((a, i) => {
        const m = ADDON_META[a.key] || ADDON_META.photos;
        const have = Math.round((owned[a.key] || 0) / a.unit);
        const room = Math.max(0, a.maxPacks - have);
        const n = Math.min(packs?.[a.key] || 0, room);
        const now = m.limit ? current[m.limit] : current.days;
        const after = now != null ? Math.round((now + a.unit * n) * 100) / 100 : null;
        return (
          <li key={a.key} style={{ "--i": i }} className={cx("ma-in ma-lift relative min-w-0 rounded-3xl p-4 transition-colors duration-300", n > 0 ? "bg-[#fff0f4] ring-2 ring-inset ring-[#e11d48]" : "bg-white ring-1 ring-inset ring-[#f8d7e0]")}>
            {n > 0 && <span className="ma-tick" aria-hidden><Check size={12} weight="bold" /></span>}
            <div className="flex items-start gap-3">
              <span className={cx("ma-icon grid h-12 w-12 shrink-0 place-items-center rounded-2xl", m.tone)}><m.Icon className="h-5 w-5" aria-hidden /></span>
              <div className="min-w-0 flex-1 pr-6">
                <p className="body-4 text-[#2a1023]">{a.name}</p>
                <p className="caption-5 mt-1 text-[#8a6a80]">{a.description}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-white p-2 pl-3 ring-1 ring-inset ring-[#f8d7e0]">
              <div className="min-w-0">
                <p className="body-4 tabular-nums text-[#be123c]">{rupees(a.price)} <span className="caption-5 text-[#8a6a80]">a pack</span></p>
                <p className="caption-4 text-[#6b3a5a]">+{a.unit} {a.unitLabel}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#ffe4ec] p-1" role="group" aria-label={`${a.name}: packs`}>
                <button type="button" disabled={disabled || n <= 0} onClick={() => set(a.key, n - 1)} aria-label={`One fewer ${a.name} pack`} className="ma-step bg-white text-[#be123c]"><Minus size={16} weight="bold" aria-hidden /></button>
                <span key={n} className="ma-bump body-1 w-6 text-center tabular-nums text-[#2a1023]" aria-live="polite">{n}</span>
                <button type="button" disabled={disabled || n >= room} onClick={() => set(a.key, n + 1)} aria-label={`One more ${a.name} pack`} className="ma-step bg-[#e11d48] text-white"><Plus size={16} weight="bold" aria-hidden /></button>
              </div>
            </div>

            <div className="caption-4 mt-3 flex flex-wrap items-center justify-between gap-2 text-[#8a6a80]">
              {room === 0 ? <span className="font-semibold text-amber-700">Maximum added</span>
                : n > 0 && after != null ? <span className="inline-flex items-center gap-1"><span className="line-through">{now}</span> <ArrowRight size={12} weight="bold" aria-hidden /> <b className="text-[#2a1023]">{after}</b> {m.noun}</span>
                  : now != null ? <span>Now: <b className="text-[#2a1023]">{now}</b> {m.noun}</span> : <span />}
              {n > 0 ? <span className="font-semibold tabular-nums text-[#be123c]">{n} pack{n === 1 ? "" : "s"} = {rupees(Math.round(a.price * 100) * n / 100)}</span>
                : room > 0 && room < a.maxPacks ? <span>{room} more pack{room === 1 ? "" : "s"} allowed</span> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
