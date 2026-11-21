import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft, BookOpen, CalendarBlank, CaretRight, ChartLineUp, Check, CreditCard, CurrencyInr, Eye, EyeSlash, Funnel,
  GearSix, Info, Lightning, MagnifyingGlass, PauseCircle, Receipt, ShieldCheck, SlidersHorizontal, Tag, Timer, UserPlus, Users, X,
} from "@phosphor-icons/react";

import { accountHttp, errMsg } from "../arena/api";
import { Btn, Page, cx } from "../resume/ui";
import { Badge, Switch, useConfirm } from "../referral/ui";
import { Card, ago, count, day } from "../component/UserProfile.jsx";
import { PartnerView, PRODUCT_ICON, previewApi } from "../partner/PartnerDashboard.jsx";
import "../referral/referral.css";
import "./adminReferrals.css";
import "./adminResume.css";
import "../component/profile.css";
import "./adminUsers.css";
import "../partner/partner.css";

/*
  ADMIN · PARTNERS  (/admin/partners)
    #partners            every account with the Partner role and what each can see
    #settings            the ceiling for ALL partners: switch something off here and no partner sees it
    #partner=<id>        one partner: access editor (products, sections, columns, limits) + live preview

  A partner account is made in Admin → Users (role "Partner"). Access starts closed: open the products they need here.
  Customer details are never available to partners, whatever is switched on.
*/

const API = {
  list: () => accountHttp.get("/admin/partners").then((r) => r.data.data),
  saveSettings: (body) => accountHttp.put("/admin/partners/settings", body).then((r) => r.data),
  saveAccess: (id, body) => accountHttp.put(`/admin/partners/${id}/access`, body).then((r) => r.data),
  referralCodes: () => accountHttp.get("/admin/partners/referral-codes").then((r) => r.data.data.codes),
  hide: (id, body) => accountHttp.patch(`/admin/partners/${id}/hidden`, body).then((r) => r.data), // id "all" = every partner
};

const VIEWS = [
  { key: "partners", label: "Partners", icon: Users },
  { key: "settings", label: "Settings", icon: GearSix },
];
const HISTORY_LABEL = (d) => (d ? `Last ${d} days` : "No limit");
const DELAY_LABEL = (d) => (!d ? "Show up to now" : d === 1 ? "Hide today" : `Hide the newest ${d} days`);
const fmtDay = (v) => (v ? day(`${v}T00:00:00+05:30`) : "");
const rupees = (paise) => (paise === null || paise === undefined ? "" : String(paise / 100));
const todayIst = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
const windowText = (w) => (w?.from && w?.to ? `${fmtDay(w.from)} – ${fmtDay(w.to)}` : w?.from ? `From ${fmtDay(w.from)}` : w?.to ? `Up to ${fmtDay(w.to)}` : "Any date");

/* The editor works in rupees and a codes text box; the API stores paise and a list. */
const toDraft = (a) => ({ ...a, minAmount: rupees(a.minAmount), maxAmount: rupees(a.maxAmount), codes: (a.codes || []).join(", "), window: { from: a.window?.from || "", to: a.window?.to || "" } });
const toBody = (d) => ({ ...d, minAmount: d.minAmount === "" ? null : Number(d.minAmount), maxAmount: d.maxAmount === "" ? null : Number(d.maxAmount), codes: d.codes });
const codesOf = (text) => [...new Set(String(text || "").split(/[\s,]+/).map((c) => c.trim().toUpperCase()).filter(Boolean))];
const sameDraft = (a, b) => same({ ...a, codes: codesOf(a.codes).join(",") }, { ...b, codes: codesOf(b.codes).join(",") });

const readHash = () => {
  const h = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
  const q = new URLSearchParams(h.includes("=") ? h : "");
  if (q.get("partner")) return { view: "partners", person: q.get("partner") };
  return { view: VIEWS.some((v) => v.key === h) ? h : "partners", person: null };
};
const writeHash = (h) => { try { window.history.replaceState(null, "", `#${h}`); } catch { /* ignore */ } };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const allOf = (list, v) => Object.fromEntries(list.map((x) => [x.key, v]));

/* Common setups, applied on top of what's there. */
const PRESETS = [
  { key: "revenue", label: "Revenue only", hint: "Totals and the chart. No individual payments.", apply: (a, c) => ({ ...a, sections: { ...allOf(c.sections, false), overview: true, revenue: true }, fields: { ...allOf(c.fields, false), amount: true, refund: true } }) },
  { key: "ledger", label: "Transactions, no IDs", hint: "Amounts, items, codes. Transaction and order IDs stay hidden.", apply: (a, c) => ({ ...a, sections: { ...allOf(c.sections, true), export: false }, fields: { ...allOf(c.fields, true), transactionId: false, orderId: false, gateway: false } }) },
  { key: "full", label: "Full finance", hint: "Everything on the list, including CSV export.", apply: (a, c) => ({ ...a, sections: allOf(c.sections, true), fields: allOf(c.fields, true) }) },
  { key: "codes", label: "Codes & referrals", hint: "How coupons and referral codes perform.", apply: (a, c) => ({ ...a, sections: { ...allOf(c.sections, false), overview: true, transactions: true, codes: true }, fields: { ...allOf(c.fields, false), amount: true, coupon: true, referralCode: true, referralAmount: true, status: true, item: true } }) },
];

function useLoad(fn) {
  const [state, setState] = useState({ data: null, error: "", loading: true });
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const run = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try { setState({ data: await fnRef.current(), error: "", loading: false }); } catch (e) { setState((s) => ({ ...s, error: errMsg(e), loading: false })); }
  }, []);
  useEffect(() => { run(); }, [run]);
  return { ...state, reload: run, set: (d) => setState((s) => ({ ...s, data: typeof d === "function" ? d(s.data) : d })) };
}

/* warn before leaving with unsaved changes */
function useUnsavedGuard(dirty) {
  useEffect(() => {
    if (!dirty) return undefined;
    const on = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", on);
    return () => window.removeEventListener("beforeunload", on);
  }, [dirty]);
}

const ErrorBox = ({ error, retry }) => <div className="acx-error" role="alert"><span>{error}</span><Btn variant="ghost" size="sm" onClick={retry}>Try again</Btn></div>;

/* ------------------------------------------------------------ shared editor blocks */
function FlagGroup({ title, list, values, onChange, ceiling, disabled }) {
  const allOn = list.every((x) => values[x.key]);
  return (
    <div className="ptx-group">
      <h4>{title}<Btn variant="ghost" size="sm" disabled={disabled} onClick={() => onChange(allOf(list, !allOn))}>{allOn ? "Turn all off" : "Turn all on"}</Btn></h4>
      <div className="ptx-grid">
        {list.map((x) => {
          const locked = ceiling && !ceiling[x.key];
          const Icon = PRODUCT_ICON[x.key];
          return (
            <div key={x.key} className={cx(locked && "ptx-lock")}>
              <Switch checked={Boolean(values[x.key])} disabled={disabled} onChange={(v) => onChange({ ...values, [x.key]: v })}
                title={Icon ? <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Icon size={16} weight="bold" aria-hidden />{x.label}</span> : x.label}
                hint={x.hint || (Icon ? "Revenue and payments from this product." : undefined)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HistorySelect({ id, label, value, choices, onChange, disabled }) {
  return (
    <div className="ptx-row-select">
      <label htmlFor={id}>{label}</label>
      <select id={id} className="rv-input" value={value} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))}>
        {choices.map((d) => <option key={d} value={d}>{HISTORY_LABEL(d)}</option>)}
      </select>
    </div>
  );
}

/* from / to dates, both optional */
function DateWindow({ value, onChange, min, max, disabled, label = "Visible dates" }) {
  const bad = value.from && value.to && value.from > value.to;
  return (
    <div className="ptx-group">
      <h4><CalendarBlank size={14} weight="bold" aria-hidden />{label}{(value.from || value.to) && <Btn variant="ghost" size="sm" disabled={disabled} onClick={() => onChange({ from: "", to: "" })}>Clear dates</Btn>}</h4>
      <div className="ptx-dates">
        <label><span>From</span><input type="date" className="rv-input" value={value.from} min={min} max={value.to || max} disabled={disabled} onChange={(e) => onChange({ ...value, from: e.target.value })} /></label>
        <span className="ptx-dash" aria-hidden>–</span>
        <label><span>To</span><input type="date" className="rv-input" value={value.to} min={value.from || min} max={max} disabled={disabled} onChange={(e) => onChange({ ...value, to: e.target.value })} /></label>
      </div>
      <p className={cx("acx-note", bad && "ptx-bad")}>{bad ? "“From” must be on or before “To”." : value.from || value.to ? value.from && value.to ? `Only payments from ${fmtDay(value.from)} to ${fmtDay(value.to)} (both days included) are visible.` : value.from ? `Only payments from ${fmtDay(value.from)} onwards are visible.` : `Only payments up to ${fmtDay(value.to)} (included) are visible.` : "Leave both empty for no fixed dates."}</p>
    </div>
  );
}

/* tick boxes as chips; [] = all */
function GatewayPicker({ list, value, onChange, ceiling, disabled }) {
  const all = !value.length;
  const on = (k) => all || value.includes(k);
  const toggle = (k) => {
    const cur = all ? list.map((g) => g.key) : value;
    const next = cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k];
    onChange(next.length === list.length ? [] : next);
  };
  return (
    <div className="ptx-group">
      <h4><CreditCard size={14} weight="bold" aria-hidden />Payment gateways{!all && <Btn variant="ghost" size="sm" disabled={disabled} onClick={() => onChange([])}>All gateways</Btn>}</h4>
      <div className="ptx-chips" role="group" aria-label="Payment gateways">
        {list.map((g) => {
          const locked = ceiling && ceiling.length && !ceiling.includes(g.key);
          return (
            <button key={g.key} type="button" className={cx("ptx-chip", on(g.key) && "on", locked && "locked")} aria-pressed={on(g.key)} disabled={disabled} onClick={() => toggle(g.key)} title={locked ? "Hidden for all partners in Settings" : undefined}>
              {on(g.key) ? <Check size={13} weight="bold" aria-hidden /> : <X size={13} weight="bold" aria-hidden />}{g.label}
            </button>
          );
        })}
      </div>
      <p className={cx("acx-note", value.length === 0 && !all && "ptx-bad")}>{all ? "Payments from every gateway are visible." : `Only ${list.filter((g) => value.includes(g.key)).map((g) => g.label).join(", ")} payments are visible.`}{ceiling?.length ? " Crossed-out gateways are hidden for everyone in Settings." : ""}</p>
    </div>
  );
}

function AmountRange({ min, max, onChange, disabled }) {
  const bad = min !== "" && max !== "" && Number(min) > Number(max);
  const set = (k) => (e) => onChange(k, e.target.value.replace(/[^\d.]/g, ""));
  return (
    <div className="ptx-group">
      <h4><CurrencyInr size={14} weight="bold" aria-hidden />Amount paid</h4>
      <div className="ptx-dates">
        <label><span>Minimum ₹</span><input className="rv-input" inputMode="decimal" placeholder="No minimum" value={min} disabled={disabled} onChange={set("minAmount")} /></label>
        <span className="ptx-dash" aria-hidden>–</span>
        <label><span>Maximum ₹</span><input className="rv-input" inputMode="decimal" placeholder="No maximum" value={max} disabled={disabled} onChange={set("maxAmount")} /></label>
      </div>
      <p className={cx("acx-note", bad && "ptx-bad")}>{bad ? "The minimum can't be more than the maximum." : "Only payments in this range are visible, and only they count in totals. Leave empty for any amount."}</p>
    </div>
  );
}

function CodesBox({ value, onChange, max, disabled }) {
  const list = codesOf(value);
  return (
    <div className="ptx-group">
      <h4><Tag size={14} weight="bold" aria-hidden />Only these coupon / referral codes</h4>
      <input className="rv-input" value={value} disabled={disabled} placeholder="e.g. CREATOR20, SAVE10   (empty = every payment)" onChange={(e) => onChange(e.target.value)} aria-label="Codes" />
      {list.length > 0 && <div className="ptx-chips">{list.map((c) => <span key={c} className="pt-code">{c}</span>)}</div>}
      <p className={cx("acx-note", list.length > max && "ptx-bad")}>{list.length > max ? `Up to ${max} codes.` : list.length ? "Only payments that used one of these codes (as a coupon or a referral code) are visible. Good for a creator who should only see their own sales." : "Separate codes with commas or spaces."}</p>
    </div>
  );
}

function BookPicker({ books, value, onChange, disabled, max }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = s ? books.filter((b) => b.title.toLowerCase().includes(s)) : books;
    return [...list.filter((b) => value.includes(b.id)), ...list.filter((b) => !value.includes(b.id))].slice(0, 60);
  }, [books, q, value]);
  const toggle = (id) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  return (
    <div className="ptx-group">
      <h4><BookOpen size={14} weight="bold" aria-hidden />Only these books{value.length > 0 && <Btn variant="ghost" size="sm" disabled={disabled} onClick={() => onChange([])}>All books</Btn>}</h4>
      {books.length > 8 && (
        <label className="pt-search"><MagnifyingGlass size={17} aria-hidden /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search books" aria-label="Search books" /></label>
      )}
      <div className="ptx-chips ptx-books" role="group" aria-label="Books">
        {shown.map((b) => (
          <button key={b.id} type="button" className={cx("ptx-chip", value.includes(b.id) && "on")} aria-pressed={value.includes(b.id)} disabled={disabled || (!value.includes(b.id) && value.length >= max)} onClick={() => toggle(b.id)}>
            {value.includes(b.id) && <Check size={13} weight="bold" aria-hidden />}{b.title}
          </button>
        ))}
        {!shown.length && <p className="acx-note">No book matches.</p>}
      </div>
      <p className="acx-note">{value.length ? `Book sales are limited to ${value.length} selected ${value.length === 1 ? "book" : "books"} (offer orders count if they include one). Other products are not affected.` : "Every book is included. Pick books to limit Book sales to them."}</p>
    </div>
  );
}

/* ------------------------------------------------------------ referral codes: which to show, which to hide (every product) */
const CODE_RX = /^[A-Z0-9_-]{2,40}$/;
function CodeList({ label, tone, list, onChange, placeholder }) {
  const [text, setText] = useState("");
  const add = () => {
    const next = codesOf(text).filter((c) => CODE_RX.test(c));
    if (next.length) onChange([...new Set([...list, ...next])]);
    setText("");
  };
  return (
    <div className="ptx-group">
      <h4>{tone === "hide" ? <EyeSlash size={14} weight="bold" aria-hidden /> : <Eye size={14} weight="bold" aria-hidden />}{label}</h4>
      <div className="ptx-dates">
        <input className="rv-input" value={text} placeholder={placeholder} aria-label={label} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <Btn variant="ghost" size="sm" onClick={add} disabled={!codesOf(text).length}>Add</Btn>
      </div>
      {list.length > 0 && (
        <div className="ptx-chips">
          {list.map((c) => (
            <span key={c} className="ptx-idchip">
              <span className="mono">{c}</span>
              <button type="button" onClick={() => onChange(list.filter((x) => x !== c))} aria-label={`Remove ${c}`}><X size={12} weight="bold" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RefCodesBox({ show, hide, onShow, onHide, max, seen }) {
  const [q, setQ] = useState("");
  const rows = (seen || []).filter((r) => !q || r.code.includes(q.trim().toUpperCase())).slice(0, 40);
  const toggle = (code, list, setList, other, setOther) => {
    setOther(other.filter((c) => c !== code));
    setList(list.includes(code) ? list.filter((c) => c !== code) : [...list, code]);
  };
  return (
    <div className="ptx-grid">
      <CodeList label="Only show these referral codes" tone="show" list={show} onChange={onShow} placeholder="e.g. RAHUL10   (empty = every referral code)" />
      <CodeList label="Hide these referral codes" tone="hide" list={hide} onChange={onHide} placeholder="e.g. TEST99" />
      <p className={cx("acx-note", (show.length > max || hide.length > max) && "ptx-bad")}>
        {show.length > max || hide.length > max ? `Up to ${max} codes in each list.` : "Applies to every product (books, memories, resume, referrals, Prep Buddy). A hidden code's payments are left out of their lists, totals, charts and CSV. “Only show” keeps just the payments that came through those codes."}
      </p>
      <div className="ptx-group">
        <h4><Tag size={14} weight="bold" aria-hidden />Referral codes seen on payments</h4>
        {seen === null ? <p className="acx-note">Loading…</p> : seen.length === 0 ? <p className="acx-note">No referral codes on any paid payment yet.</p> : (
          <>
            <label className="pt-search"><MagnifyingGlass size={17} aria-hidden /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search codes" aria-label="Search referral codes" /></label>
            <div className="ptx-chips">
              {rows.map((r) => (
                <span key={r.code} className="ptx-idchip">
                  <span className="mono">{r.code}</span><small>&nbsp;{count(r.count)}</small>
                  <button type="button" className={show.includes(r.code) ? "on" : undefined} onClick={() => toggle(r.code, show, onShow, hide, onHide)} title={show.includes(r.code) ? "Stop showing only this code" : "Only show this code"} aria-label={`Only show ${r.code}`}><Eye size={12} weight="bold" /></button>
                  <button type="button" className={hide.includes(r.code) ? "on" : undefined} onClick={() => toggle(r.code, hide, onHide, show, onShow)} title={hide.includes(r.code) ? "Show this code again" : "Hide this code"} aria-label={`Hide ${r.code}`}><EyeSlash size={12} weight="bold" /></button>
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* dates whose payments are never shown: single days or ranges (IST, inclusive) */
function DaysBox({ value, onChange, max, everyone, inherited = 0 }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const bad = Boolean(from && to && to < from);
  const add = () => {
    if (!from || bad) return;
    const r = { from, to: to || from };
    if (!value.some((x) => x.from === r.from && x.to === r.to)) onChange([...value, r].sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0)));
    setFrom(""); setTo("");
  };
  return (
    <div className="ptx-group">
      <div className="ptx-dates">
        <label><span>From</span><input type="date" className="rv-input" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <span className="ptx-dash" aria-hidden>–</span>
        <label><span>To (optional)</span><input type="date" className="rv-input" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} /></label>
        <Btn size="sm" onClick={add} disabled={!from || bad}>Hide these dates</Btn>
      </div>
      {value.length > 0 && (
        <div className="ptx-chips">
          {value.map((r) => (
            <span key={`${r.from}_${r.to}`} className="ptx-idchip">
              <span>{r.from === r.to ? fmtDay(r.from) : `${fmtDay(r.from)} – ${fmtDay(r.to)}`}</span>
              <button type="button" onClick={() => onChange(value.filter((x) => x !== r))} aria-label="Show these dates again" title="Show again"><X size={12} weight="bold" /></button>
            </span>
          ))}
        </div>
      )}
      <p className={cx("acx-note", (bad || value.length > max) && "ptx-bad")}>
        {bad ? "The end date must be on or after the start date." : value.length > max ? `Up to ${max} date ranges.` : `Every payment made on these days (IST) is left out of ${everyone ? "every partner's" : "this partner's"} lists, totals, charts and CSV. Leave “To” empty for a single day.`}
      </p>
      {inherited > 0 && <p className="acx-note">Also hidden for every partner in Settings: <b>{inherited}</b> {inherited === 1 ? "range" : "ranges"}.</p>}
    </div>
  );
}

/* transaction / order IDs that are never shown. value is a list; the text box is free-form (lines, commas or spaces). */
const idsOf = (text) => [...new Set(String(text || "").split(/[\s,;]+/).map((v) => v.trim()).filter(Boolean))];
const ID_RX = /^[A-Za-z0-9_\-.:|/]{3,120}$/;
function HiddenBox({ value, onChange, max, everyone, inherited = [] }) {
  const [text, setText] = useState(value.join("\n"));
  const last = useRef(value);
  // outside changes (a Hide button, a discard) replace the text; typing doesn't fight the cursor
  useEffect(() => { if (!same(value, last.current)) { setText(value.join("\n")); last.current = value; } }, [value]);
  const edit = (t) => { setText(t); const ids = idsOf(t); last.current = ids; onChange(ids); };
  const bad = value.filter((v) => !ID_RX.test(v));
  const remove = (id) => edit(value.filter((x) => x !== id).join("\n"));
  return (
    <div className="ptx-group">
      <textarea className="ptx-textarea mono" value={text} onChange={(e) => edit(e.target.value)} spellCheck={false}
        placeholder={"One per line, e.g.\npay_NxA81b2Q7f\norder_9182736\nBK-2026-00123"} aria-label={everyone ? "Hidden for every partner" : "Hidden for this partner"} />
      <span className="ptx-count">{value.length}/{max}</span>
      {value.length > 0 && (
        <div className="ptx-chips">
          {value.slice(0, 80).map((id) => (
            <span key={id} className={cx("ptx-idchip", !ID_RX.test(id) && "bad")}>
              <span className="mono">{id}</span>
              <button type="button" onClick={() => remove(id)} aria-label={`Show ${id} again`} title="Show again"><X size={12} weight="bold" /></button>
            </span>
          ))}
          {value.length > 80 && <span className="acx-note">+{value.length - 80} more</span>}
        </div>
      )}
      <p className={cx("acx-note", (bad.length || value.length > max) && "ptx-bad")}>
        {bad.length ? `“${bad[0].slice(0, 30)}” doesn't look like a transaction or order ID (letters, digits, - _ . : | / only).`
          : value.length > max ? `Up to ${max} IDs.`
          : `Matches the gateway transaction ID or the order ID, in every product. A hidden payment is left out of ${everyone ? "every partner's" : "this partner's"} lists, totals, charts, codes and CSV, as if it never happened. Tip: use “Hide” on a row in the preview.`}
      </p>
      {inherited.length > 0 && <p className="acx-note">Also hidden for every partner in Settings: <b>{inherited.length}</b>.</p>}
    </div>
  );
}

function SaveBar({ dirty, saving, onSave, onDiscard, text, invalid }) {
  if (!dirty) return null;
  return (
    <div className="ptx-savebar" role="region" aria-label="Unsaved changes">
      <p className={cx(invalid && "ptx-bad")}>{invalid ? "Fix the highlighted fields before saving." : text || "You have unsaved changes."}</p>
      <div className="rf-btns"><Btn variant="ghost" size="sm" onClick={onDiscard} disabled={saving}>Discard</Btn><Btn size="sm" onClick={onSave} loading={saving} disabled={invalid}>Save changes</Btn></div>
    </div>
  );
}

/* ------------------------------------------------------------ #settings: the ceiling for every partner */
function SettingsView({ data, onSaved }) {
  const { catalog, settings } = data;
  const [draft, setDraft] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [ask, dialog] = useConfirm();
  useEffect(() => setDraft(settings), [settings]);
  const dirty = !same(draft, settings);
  const invalid = Boolean((draft.window.from && draft.window.to && draft.window.from > draft.window.to)
    || draft.hiddenTxns.length > catalog.maxHiddenAll || draft.hiddenTxns.some((v) => !ID_RX.test(v))
    || draft.hiddenDays.length > catalog.maxHiddenDays);
  useUnsavedGuard(dirty);
  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));

  const save = async () => {
    if (settings.enabled && !draft.enabled && !(await ask({ title: "Switch off the partner dashboard?", message: "Every partner loses access straight away until you turn it back on. Their own settings are kept.", confirmLabel: "Switch off" }))) return;
    setSaving(true);
    try { const r = await API.saveSettings(draft); toast.success(r.message || "Saved"); onSaved(r.data); }
    catch (e) { toast.error(errMsg(e)); } finally { setSaving(false); }
  };

  return (
    <div className="acx-stack">
      <div className="ptx-info" role="note">
        <ShieldCheck size={18} weight="fill" aria-hidden />
        <div><b>These settings apply to every partner</b><small>Anything switched off here is hidden from all partners, even if it is switched on for one of them. Customer names, emails, phone numbers and user IDs are never shown to partners.</small></div>
      </div>

      <Card icon={Lightning} title="Partner dashboard" caption="Master switch for /partners/dashboard.">
        <Switch checked={draft.enabled} onChange={set("enabled")} title="Partner dashboard is on" hint="Off = every partner sees “switched off for now”. Nothing else changes." />
      </Card>

      <Card icon={SlidersHorizontal} title="What partners can ever see" caption="The most any partner can be given.">
        <div className="acx-stack">
          <FlagGroup title="Products" list={catalog.products} values={draft.products} onChange={set("products")} />
          <FlagGroup title="Sections" list={catalog.sections} values={draft.sections} onChange={set("sections")} />
          <FlagGroup title="Columns & numbers" list={catalog.fields} values={draft.fields} onChange={set("fields")} />
        </div>
      </Card>

      <Card icon={EyeSlash} title="Limits & privacy">
        <div className="acx-stack">
          <HistorySelect id="ptx-max-history" label="Furthest back any partner can look" value={draft.maxHistoryDays} choices={catalog.historyChoices} onChange={set("maxHistoryDays")} />
          <Switch checked={draft.maskTransactionIds} onChange={set("maskTransactionIds")} title="Partly hide IDs for everyone" hint="Transaction and order IDs show only their last 4 characters (••••1234), and can't be searched." />
        </div>
      </Card>

      <Card icon={Funnel} title="Which transactions partners can ever see" caption="Rules for every partner. Each partner can be limited further, never opened up beyond these.">
        <div className="acx-stack">
          <DateWindow value={draft.window} max={todayIst()} onChange={set("window")} label="Visible dates for everyone" />
          <div className="ptx-row-select">
            <label htmlFor="ptx-delay-all">Hide the newest payments</label>
            <select id="ptx-delay-all" className="rv-input" value={draft.delayDays} onChange={(e) => set("delayDays")(Number(e.target.value))}>
              {catalog.delayChoices.map((d) => <option key={d} value={d}>{DELAY_LABEL(d)}</option>)}
            </select>
            <p className="acx-note">Useful while payments settle or refunds are still possible.</p>
          </div>
          <FlagGroup title="Payment statuses" list={catalog.statuses} values={draft.statuses} onChange={set("statuses")} />
          <GatewayPicker list={catalog.gateways} value={draft.gateways} onChange={set("gateways")} />
        </div>
      </Card>

      <Card icon={EyeSlash} title="Hidden transactions (every partner)" caption="Payments no partner should ever see, e.g. test orders, staff purchases or disputed payments.">
        <HiddenBox value={draft.hiddenTxns} onChange={set("hiddenTxns")} max={catalog.maxHiddenAll} everyone />
      </Card>

      <Card icon={CalendarBlank} title="Hidden dates (every partner)" caption="Payments made on these days are never shown to any partner, e.g. a testing day or a day with a billing problem.">
        <DaysBox value={draft.hiddenDays} onChange={set("hiddenDays")} max={catalog.maxHiddenDays} everyone />
      </Card>

      <Card icon={Info} title="Message for partners" caption="Shown at the top of every partner's dashboard. Leave empty for none.">
        <div className="ptx-row-select">
          <textarea className="ptx-textarea" value={draft.notice} maxLength={500} onChange={(e) => set("notice")(e.target.value)} placeholder="e.g. Payouts for October are processed on 5 November." aria-label="Message for partners" />
          <span className="ptx-count">{draft.notice.length}/500</span>
        </div>
      </Card>

      <SaveBar dirty={dirty} saving={saving} invalid={invalid} onSave={save} onDiscard={() => setDraft(settings)} text="Changes apply to every partner once saved." />
      {dialog}
    </div>
  );
}

/* ------------------------------------------------------------ #partners: the list */
function PartnerList({ data, onOpen }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? data.partners.filter((p) => `${p.name} ${p.email}`.toLowerCase().includes(s)) : data.partners;
  }, [data.partners, q]);
  const labels = Object.fromEntries(data.catalog.products.map((p) => [p.key, p.label]));
  const active = data.partners.filter((p) => p.effective.active).length;

  return (
    <div className="acx-stack">
      {!data.settings.enabled && (
        <div className="aux-alert"><PauseCircle size={18} weight="fill" /><div><b>The partner dashboard is switched off</b><small>No partner can see anything until you turn it on in Settings.</small></div></div>
      )}
      <div className="arx-kpis">
        <div className="arx-kpi"><span><Users size={16} weight="bold" aria-hidden />Partners</span><b>{count(data.partners.length)}</b><small>Accounts with the Partner role</small></div>
        <div className="arx-kpi"><span><Eye size={16} weight="bold" aria-hidden />Can see data</span><b>{count(active)}</b><small>At least one product open</small></div>
        <div className="arx-kpi"><span><PauseCircle size={16} weight="bold" aria-hidden />Nothing shared</span><b>{count(data.partners.length - active)}</b><small>Paused or no products</small></div>
        <div className="arx-kpi"><span><GearSix size={16} weight="bold" aria-hidden />Dashboard</span><b className="txt">{data.settings.enabled ? "On" : "Off"}</b><small>{data.settingsUpdatedAt ? `Settings changed ${ago(data.settingsUpdatedAt)}` : "Default settings"}</small></div>
      </div>

      {data.partners.length > 4 && (
        <label className="pt-search">
          <MagnifyingGlass size={17} aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search partners by name or email" aria-label="Search partners" />
        </label>
      )}

      {data.partners.length === 0 ? (
        <div className="rf-empty">
          <span className="e">🤝</span>
          <h3>No partners yet</h3>
          <p>Create an account (or open an existing one) in Users and give it the <b>Partner</b> role. It shows up here, with nothing shared until you open products for it.</p>
          <Btn as={Link} to="/admin/users#all" size="sm" style={{ marginTop: 10 }}><UserPlus size={15} />Go to Users</Btn>
        </div>
      ) : (
        <div className="ptx-list">
          {list.map((p) => (
            <button key={p.id} type="button" className="ptx-person" onClick={() => onOpen(p.id)}>
              <span className="acx-av aux-av" aria-hidden>{(p.name || "?").trim().split(/\s+/).slice(0, 2).map((x) => x[0]?.toUpperCase()).join("")}</span>
              <span className="who">
                <b>{p.name}</b>
                <small>{p.email} · {p.lastSeenAt ? `opened dashboard ${ago(p.lastSeenAt)}` : "hasn't opened the dashboard yet"}</small>
                <span className="tags">
                  {p.status !== "active" && <Badge tone="bad">{p.status}</Badge>}
                  {p.pendingSetup && <Badge tone="warn">Setup pending</Badge>}
                  {p.effective.expired && <Badge tone="bad">Access ended</Badge>}
                  {(p.effective.window?.from || p.effective.window?.to) && <Badge tone="info">{windowText(p.effective.window)}</Badge>}
                  {p.effective.codes?.length > 0 && <Badge tone="info">{p.effective.codes.length} {p.effective.codes.length === 1 ? "code" : "codes"}</Badge>}
                  {!p.access.enabled ? <Badge tone="warn">Paused</Badge> : p.effective.products.length === 0 ? <Badge tone="muted">Nothing shared</Badge> : <Badge tone="ok">Active</Badge>}
                  {p.effective.products.map((k) => { const I = PRODUCT_ICON[k]; return <em key={k}>{I && <I size={12} weight="bold" aria-hidden />}{labels[k]}</em>; })}
                </span>
              </span>
              <CaretRight size={18} className="go" aria-hidden />
            </button>
          ))}
          {list.length === 0 && <p className="acx-note">No partner matches “{q}”.</p>}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ #partner=<id>: one partner */
function PartnerPage({ id, data, back, onSaved }) {
  const p = data.partners.find((x) => x.id === id);
  const { catalog, settings } = data;
  const [tab, setTab] = useState("access");
  const [draft, setDraft] = useState(() => (p ? toDraft(p.access) : null));
  const [saving, setSaving] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [seenCodes, setSeenCodes] = useState(null);
  useEffect(() => { API.referralCodes().then(setSeenCodes).catch(() => setSeenCodes([])); }, []);
  const [ask, dialog] = useConfirm();
  const dirtyRef = useRef(false);
  useEffect(() => {
    if (!p) return;
    // a quick Hide from the preview refreshes p: keep unsaved edits, take only the new hidden list
    setDraft((d) => (d && dirtyRef.current ? { ...d, hiddenTxns: p.access.hiddenTxns } : toDraft(p.access)));
  }, [p]);
  const dirty = Boolean(p && draft && !sameDraft(draft, toDraft(p.access)));
  dirtyRef.current = dirty;
  const invalid = Boolean(draft && (
    (draft.window.from && draft.window.to && draft.window.from > draft.window.to)
    || (draft.minAmount !== "" && draft.maxAmount !== "" && Number(draft.minAmount) > Number(draft.maxAmount))
    || codesOf(draft.codes).length > catalog.maxCodes
    || draft.hiddenTxns.length > catalog.maxHidden || draft.hiddenTxns.some((v) => !ID_RX.test(v))
    || draft.hiddenDays.length > catalog.maxHiddenDays
    || draft.refShow.length > catalog.maxCodes || draft.refHide.length > catalog.maxCodes));
  useUnsavedGuard(dirty);

  if (!p) return (
    <div className="acx-stack">
      <button type="button" className="aux-back" onClick={back}><ArrowLeft size={16} weight="bold" />All partners</button>
      <div className="rf-empty"><span className="e">🔍</span><h3>Partner not found</h3><p>This account isn&apos;t a partner any more, or was deleted.</p></div>
    </div>
  );

  const set = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));
  const save = async (body = toBody(draft)) => {
    setSaving(true);
    try { const r = await API.saveAccess(id, body); toast.success(r.message || "Saved"); onSaved(r.data); setPreviewKey((n) => n + 1); }
    catch (e) { toast.error(errMsg(e)); } finally { setSaving(false); }
  };
  const hideOne = async (txn) => {
    try {
      const r = await API.hide(id, { add: [txn] });
      onSaved(r.data);
      setPreviewKey((n) => n + 1);
      toast.success(<span>Hidden <b>{txn}</b> from {p.name}. Undo it in Access → Hidden transactions.</span>, { duration: 5000 });
    } catch (e) { toast.error(errMsg(e)); }
  };
  const reset = async () => {
    if (await ask({ title: "Reset access?", message: "Closes every product and goes back to the basic columns. Takes effect straight away.", confirmLabel: "Reset" })) save({ reset: true });
  };
  const ceilingOff = [...catalog.products, ...catalog.sections, ...catalog.fields].filter((x) => (settings.products[x.key] ?? settings.sections[x.key] ?? settings.fields[x.key]) === false);
  const eff = p.effective;
  const label = (list, keys) => list.filter((x) => keys.includes(x.key)).map((x) => x.label);

  return (
    <div className="acx-stack">
      <button type="button" className="aux-back" onClick={back}><ArrowLeft size={16} weight="bold" />All partners</button>

      <header className="acx-hero aux-hero">
        <div className="who">
          <span className="acx-av aux-av lg" aria-hidden><ChartLineUp size={22} weight="bold" /></span>
          <div>
            <h1>{p.name}</h1>
            <ul className="acx-contact"><li><span>{p.email}</span></li></ul>
            <div className="acx-badges">
              <Badge tone="ok">Partner</Badge>
              {p.status !== "active" && <Badge tone="bad">{p.status}</Badge>}
              {p.pendingSetup && <Badge tone="warn">Setup pending</Badge>}
              {eff.expired && <Badge tone="bad">Access ended</Badge>}
              {!p.access.enabled ? <Badge tone="warn">Paused</Badge> : eff.active ? <Badge tone="ok">Can see data</Badge> : <Badge tone="muted">Nothing shared</Badge>}
            </div>
          </div>
        </div>
        <div className="acx-since"><Receipt size={18} weight="fill" aria-hidden /><div><small>Last opened dashboard</small><b>{p.lastSeenAt ? ago(p.lastSeenAt) : "Never"}</b></div></div>
      </header>

      <nav className="aux-ptabs" aria-label="Sections">
        <button type="button" aria-current={tab === "access" ? "page" : undefined} onClick={() => setTab("access")}><SlidersHorizontal size={16} weight={tab === "access" ? "fill" : "bold"} />Access</button>
        <button type="button" aria-current={tab === "preview" ? "page" : undefined} onClick={() => setTab("preview")}><Eye size={16} weight={tab === "preview" ? "fill" : "bold"} />Preview as partner</button>
        <Link to={`/admin/users#user=${p.id}&from=all`} className="ptx-userlink" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", fontSize: 14, fontWeight: 700, color: "var(--rv-muted)" }}><Users size={16} weight="bold" />Account</Link>
      </nav>

      {tab === "preview" ? (
        <>
          {dirty && <div className="ptx-info" role="note"><Info size={18} weight="fill" aria-hidden /><div><b>Unsaved changes</b><small>The preview shows what is saved. Save your changes to see them here.</small></div></div>}
          <Card icon={Eye} title="Exactly what this partner sees" caption="Same data, same hidden columns. Use “Hide” on any payment to remove it from this partner's dashboard. Export is not available in preview.">
            <PartnerView key={previewKey} api={previewApi(id)} preview onHide={hideOne} />
          </Card>
        </>
      ) : (
        <>
          <Card icon={ShieldCheck} title="What they can see now" caption={`After the global settings${settings.enabled ? "" : " (the dashboard is switched OFF for everyone)"}.`}>
            <dl className="ptx-summary">
              <div><dt>Products</dt><dd>{eff.products.length ? label(catalog.products, eff.products).map((l) => <Badge key={l} tone="ok">{l}</Badge>) : <Badge tone="muted">None</Badge>}</dd></div>
              <div><dt>Sections</dt><dd>{eff.sections.length ? label(catalog.sections, eff.sections).map((l) => <Badge key={l} tone="info">{l}</Badge>) : <Badge tone="muted">None</Badge>}</dd></div>
              <div><dt>Columns</dt><dd>{eff.fields.length ? label(catalog.fields, eff.fields).map((l) => <Badge key={l} tone="muted">{l}</Badge>) : <Badge tone="muted">Date and product only</Badge>}</dd></div>
              <div><dt>Dates</dt><dd>{eff.visible?.empty ? <Badge tone="bad">No dates overlap: nothing visible</Badge> : windowText(eff.visible)}{eff.historyDays ? ` · last ${eff.historyDays} days` : ""}{eff.delayDays ? ` · newest ${eff.delayDays} ${eff.delayDays === 1 ? "day" : "days"} hidden` : ""}</dd></div>
              <div><dt>Statuses</dt><dd>{eff.statuses?.length ? label(catalog.statuses, eff.statuses).map((l) => <Badge key={l} tone="muted">{l}</Badge>) : <Badge tone="bad">None: nothing visible</Badge>}</dd></div>
              <div><dt>Gateways</dt><dd>{!eff.gateways ? "All" : eff.gateways.length ? label(catalog.gateways, eff.gateways).join(", ") : <Badge tone="bad">None: nothing visible</Badge>}</dd></div>
              {(eff.minAmount !== null || eff.maxAmount !== null) && <div><dt>Amount</dt><dd>{eff.minAmount !== null ? `from ₹${eff.minAmount / 100}` : ""}{eff.minAmount !== null && eff.maxAmount !== null ? " " : ""}{eff.maxAmount !== null ? `up to ₹${eff.maxAmount / 100}` : ""}</dd></div>}
              {eff.codes?.length > 0 && <div><dt>Codes</dt><dd>{eff.codes.map((c) => <span key={c} className="pt-code">{c}</span>)}</dd></div>}
              {eff.books?.length > 0 && <div><dt>Books</dt><dd>{eff.books.length} selected</dd></div>}
              {(eff.refShow?.length > 0 || eff.refHide?.length > 0) && <div><dt>Referral codes</dt><dd>{eff.refShow?.length > 0 && <>Only: {eff.refShow.map((c) => <span key={c} className="pt-code">{c}</span>)} </>}{eff.refHide?.length > 0 && <>Hidden: {eff.refHide.map((c) => <span key={c} className="pt-code">{c}</span>)}</>}</dd></div>}
              {(eff.hiddenDaysOwn > 0 || eff.hiddenDaysAll > 0) && <div><dt>Hidden dates</dt><dd>{eff.hiddenDaysOwn > 0 && `${eff.hiddenDaysOwn} for this partner`}{eff.hiddenDaysOwn > 0 && eff.hiddenDaysAll > 0 && " · "}{eff.hiddenDaysAll > 0 && `${eff.hiddenDaysAll} for everyone`}</dd></div>}
              {(eff.hiddenOwn > 0 || eff.hiddenAll > 0) && <div><dt>Hidden</dt><dd>{eff.hiddenOwn > 0 && `${eff.hiddenOwn} for this partner`}{eff.hiddenOwn > 0 && eff.hiddenAll > 0 && " · "}{eff.hiddenAll > 0 && `${eff.hiddenAll} for everyone`}</dd></div>}
              {p.access.expiresAt && <div><dt>Ends</dt><dd>{eff.expired ? <Badge tone="bad">Ended {fmtDay(p.access.expiresAt)}</Badge> : fmtDay(p.access.expiresAt)}</dd></div>}
            </dl>
            {p.updatedAt && <p className="acx-note" style={{ marginTop: 10 }}>Access last changed {day(p.updatedAt)}.</p>}
          </Card>

          <Card icon={Lightning} title="Access">
            <Switch checked={draft.enabled} onChange={set("enabled")} title="Access is on" hint="Off = pause this partner without losing their settings." />
          </Card>

          <Card icon={SlidersHorizontal} title="Quick setups" caption="Apply a common setup, then fine-tune it below. Nothing is saved until you press Save.">
            <div className="ptx-presets">
              {PRESETS.map((x) => <Btn key={x.key} variant="ghost" size="sm" title={x.hint} onClick={() => setDraft((d) => x.apply(d, catalog))}>{x.label}</Btn>)}
              <Btn variant="ghost" size="sm" onClick={reset} disabled={saving}>Reset to default</Btn>
            </div>
          </Card>

          <Card icon={Eye} title="What this partner can see" caption={ceilingOff.length ? "Dimmed items are switched off for all partners in Settings, so they stay hidden even when on here." : "Only what's switched on is sent to their dashboard."}>
            <div className="acx-stack">
              <FlagGroup title="Products" list={catalog.products} values={draft.products} onChange={set("products")} ceiling={settings.products} />
              <FlagGroup title="Sections" list={catalog.sections} values={draft.sections} onChange={set("sections")} ceiling={settings.sections} />
              <FlagGroup title="Columns & numbers" list={catalog.fields} values={draft.fields} onChange={set("fields")} ceiling={settings.fields} />
            </div>
          </Card>

          <Card icon={EyeSlash} title="Limits & privacy">
            <div className="acx-stack">
              <HistorySelect id="ptx-history" label="How far back they can look" value={draft.historyDays} choices={catalog.historyChoices} onChange={set("historyDays")} />
              {settings.maxHistoryDays > 0 && <p className="acx-note">Settings limit every partner to {settings.maxHistoryDays} days, whichever is shorter wins.</p>}
              <Switch checked={draft.maskTransactionIds || settings.maskTransactionIds} disabled={settings.maskTransactionIds} onChange={set("maskTransactionIds")} title="Partly hide IDs" hint={settings.maskTransactionIds ? "Hidden for every partner in Settings." : "Transaction and order IDs show only their last 4 characters."} />
            </div>
          </Card>

          <Card icon={Funnel} title="Which transactions they can see" caption="Every list, total, chart and CSV follows these rules. Only payments that pass all of them are shown.">
            <div className="acx-stack">
              <DateWindow value={draft.window} max={todayIst()} onChange={set("window")} />
              {(settings.window.from || settings.window.to) && <p className="acx-note">Settings already limit every partner to <b>{windowText(settings.window)}</b>. The overlap of both is used.</p>}
              <div className="ptx-row-select">
                <label htmlFor="ptx-delay">Hide the newest payments</label>
                <select id="ptx-delay" className="rv-input" value={draft.delayDays} onChange={(e) => set("delayDays")(Number(e.target.value))}>
                  {catalog.delayChoices.map((d) => <option key={d} value={d}>{DELAY_LABEL(d)}</option>)}
                </select>
                {settings.delayDays > draft.delayDays && <p className="acx-note">Settings hide the newest {settings.delayDays} days for everyone; the longer delay wins.</p>}
              </div>
              <FlagGroup title="Payment statuses" list={catalog.statuses} values={draft.statuses} onChange={set("statuses")} ceiling={settings.statuses} />
              <GatewayPicker list={catalog.gateways} value={draft.gateways} onChange={set("gateways")} ceiling={settings.gateways} />
              <AmountRange min={draft.minAmount} max={draft.maxAmount} onChange={(k, v) => set(k)(v)} />
              <CodesBox value={draft.codes} onChange={set("codes")} max={catalog.maxCodes} />
              {draft.products.books && <BookPicker books={catalog.books || []} value={draft.books} onChange={set("books")} max={catalog.maxBooks} />}
            </div>
          </Card>

          <Card icon={EyeSlash} title="Hidden transactions" caption={`Payments ${p.name} should never see, whatever product they belong to.`}>
            <HiddenBox value={draft.hiddenTxns} onChange={set("hiddenTxns")} max={catalog.maxHidden} inherited={settings.hiddenTxns} />
          </Card>

          <Card icon={Tag} title="Referral codes" caption={`Choose which referral codes ${p.name} can see and which stay hidden, for every product.`}>
            <RefCodesBox show={draft.refShow} hide={draft.refHide} onShow={set("refShow")} onHide={set("refHide")} max={catalog.maxCodes} seen={seenCodes} />
          </Card>

          <Card icon={CalendarBlank} title="Hidden dates" caption={`Payments made on these days never show up for ${p.name}.`}>
            <DaysBox value={draft.hiddenDays} onChange={set("hiddenDays")} max={catalog.maxHiddenDays} inherited={settings.hiddenDays.length} />
          </Card>

          <Card icon={Timer} title="Access period" caption="Access switches itself off after this day. Their settings are kept, so you can extend it later.">
            <div className="ptx-dates">
              <label><span>Access ends on</span><input type="date" className="rv-input" value={draft.expiresAt} min={todayIst()} onChange={(e) => set("expiresAt")(e.target.value)} /></label>
              {draft.expiresAt && <Btn variant="ghost" size="sm" onClick={() => set("expiresAt")("")}>No end date</Btn>}
            </div>
            <p className="acx-note" style={{ marginTop: 8 }}>{draft.expiresAt ? `They can use the dashboard until the end of ${fmtDay(draft.expiresAt)} (IST).` : "No end date: access lasts until you pause it."}</p>
          </Card>

          <Card icon={Info} title="Private note" caption="Only admins see this.">
            <div className="ptx-row-select">
              <textarea className="ptx-textarea" value={draft.note} maxLength={300} onChange={(e) => set("note")(e.target.value)} placeholder="e.g. Books partner since Oct 2026, 20% revenue share." aria-label="Private note" />
              <span className="ptx-count">{draft.note.length}/300</span>
            </div>
          </Card>

          <SaveBar dirty={dirty} saving={saving} onSave={() => save()} invalid={invalid} onDiscard={() => setDraft(toDraft(p.access))} text={`Changes reach ${p.name}'s dashboard as soon as you save.`} />
        </>
      )}
      {dialog}
    </div>
  );
}

/* ------------------------------------------------------------ page */
export default function AdminPartners() {
  const [{ view, person }, setNav] = useState(readHash);
  const res = useLoad(API.list);

  const go = useCallback((k) => { setNav({ view: k, person: null }); writeHash(k); window.scrollTo({ top: 0 }); }, []);
  const open = useCallback((id) => { setNav({ view: "partners", person: String(id) }); writeHash(`partner=${id}`); window.scrollTo({ top: 0 }); }, []);
  useEffect(() => { const on = () => setNav(readHash()); window.addEventListener("hashchange", on); return () => window.removeEventListener("hashchange", on); }, []);

  const onSettings = (d) => res.set((cur) => ({ ...cur, ...d }));
  const onAccess = (card) => res.set((cur) => ({ ...cur, partners: cur.partners.map((x) => (x.id === card.id ? card : x)) }));
  // settings change what every partner can see: reload the list so the summaries are right
  const onSettingsSaved = (d) => { onSettings(d); res.reload(); };

  const head = view === "settings" ? ["Partner settings", "The ceiling for every partner: what can ever be shown, limits and a message."] : ["Partners", "Choose what each partner sees on their dashboard. Customer details are never shown."];

  return (
    <Page title="Partners · Admin · Target Trek" top={false}>
      <div className="arx rlx acx aux pt">
        <div className="arx-layout">
          <aside className="arx-side" aria-label="Partner sections">
            <div className="acx-me"><span className="acx-av"><ChartLineUp size={20} weight="bold" /></span><div><b>Partners</b><small>Admin console</small></div></div>
            <nav className="arx-nav">
              <span>Partners</span>
              {VIEWS.map((v) => (
                <button key={v.key} type="button" aria-current={view === v.key && !person ? "page" : undefined} onClick={() => go(v.key)}>
                  <v.icon size={18} weight={view === v.key ? "fill" : "regular"} />{v.label}
                  {v.key === "partners" && res.data?.partners.length > 0 && <em style={{ background: "var(--rv-surface-3)", color: "var(--rv-text)" }}>{res.data.partners.length}</em>}
                </button>
              ))}
            </nav>
            <div className="arx-foot"><Btn as={Link} to="/admin/users#all" size="sm" variant="ghost"><UserPlus size={15} />Add partner in Users</Btn></div>
          </aside>

          <main className="arx-main">
            <div className="acx-body acx-stack">
              {!person && (
                <div className="aux-head">
                  <div><h1>{head[0]}</h1><p>{head[1]}</p></div>
                  {view === "partners" && <Btn as={Link} to="/admin/users#all" size="sm"><UserPlus size={16} />Add partner</Btn>}
                </div>
              )}
              {res.error && !res.data ? <ErrorBox error={res.error} retry={res.reload} />
                : !res.data ? <div className="acx-stack"><div className="arx-kpis">{Array.from({ length: 4 }, (_, i) => <div key={i} className="acx-skel" style={{ height: 92 }} />)}</div><div className="acx-skel" style={{ height: 320 }} /></div>
                : person ? <PartnerPage key={person} id={person} data={res.data} back={() => go("partners")} onSaved={onAccess} />
                : view === "settings" ? <SettingsView data={res.data} onSaved={onSettingsSaved} />
                : <PartnerList data={res.data} onOpen={open} />}
            </div>
          </main>
        </div>

        <nav className="acx-tabbar" aria-label="Partner sections" style={{ gridTemplateColumns: `repeat(${VIEWS.length}, minmax(0, 1fr))` }}>
          {VIEWS.map((v) => (
            <button key={v.key} type="button" aria-label={v.label} title={v.label} aria-current={view === v.key && !person ? "page" : undefined} onClick={() => go(v.key)}>
              <v.icon size={24} weight={view === v.key ? "fill" : "regular"} aria-hidden />
            </button>
          ))}
        </nav>
      </div>
    </Page>
  );
}
