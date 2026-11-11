import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  Copy,
  ExternalLink,
  Eye,
  Gift,
  IndianRupee,
  Layers,
  Loader2,
  Package,
  Pencil,
  Percent,
  Plus,
  Power,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";

import BASE_URL from "../utils/Url";
import { describeOffer, inr, isBookEligible, priceSelection } from "../Ebooks/bundleRules";

/* =====================================================
   ADMIN: BOOK OFFERS

   An offer = THE DEAL  x  WHICH BOOKS  x  HOW THE BUYER CHOOSES

   Deals     flat price / percent off / rupees off / same price each /
             buy X get Y free / tiered percent
   Books     all books, or any mix of tags + categories + hand-picked books,
             minus excluded books, optionally limited by book price
   Choosing  buyer picks the books, or gets every qualifying book

   The editor shows the live result (eligible books and example prices)
   using the same rules file the server and the buyer page use.
===================================================== */

const ROOT = String(BASE_URL || "").replace(/\/+$/, "");
const API = `${ROOT}/api/admin/book-offers`;

const errText = (e, f) => e?.response?.data?.message || e?.message || f;

const DEAL_TYPES = [
  { id: "FIXED_PRICE", icon: Tag, title: "Flat price", example: "Any 5 books for ₹999", help: "The buyer picks N books and pays one fixed total." },
  { id: "PERCENT_OFF", icon: Percent, title: "Percent off", example: "4+ books, 60% off", help: "A percentage off the total of the books picked." },
  { id: "AMOUNT_OFF", icon: IndianRupee, title: "Rupees off", example: "₹200 off on 3+ books", help: "A fixed rupee amount taken off the total." },
  { id: "PER_BOOK_PRICE", icon: Coins, title: "Same price each", example: "Any 4+ books at ₹199 each", help: "Every picked book costs the same price." },
  { id: "FREE_BOOKS", icon: Gift, title: "Buy X, get Y free", example: "Buy 3, get 1 free", help: "The cheapest Y books of the pick are free." },
  { id: "TIERED_PERCENT", icon: Layers, title: "Tiered discount", example: "3 books 20%, 5 books 40%", help: "The more books, the bigger the discount." },
];

const EMPTY = {
  name: "",
  slug: "",
  slugTouched: false,
  description: "",
  badge: "",

  type: "FIXED_PRICE",
  selectionMode: "PICK",
  minBooks: 5,
  maxBooks: 20,
  fixedPrice: 999,
  discountPercent: 60,
  maxDiscountAmount: 0,
  amountOff: 200,
  perBookPrice: 199,
  buyBooks: 3,
  freeBooks: 1,
  tiers: [
    { minBooks: 3, percent: 20 },
    { minBooks: 5, percent: 40 },
  ],

  scopeMode: "ALL",
  tags: [],
  tagMatch: "ANY",
  categories: [],
  bookIds: [],
  excludeBookIds: [],
  minBookPrice: 0,
  maxBookPrice: 0,

  startsAt: "",
  endsAt: "",
  maxUses: 0,
  position: 1,
  isActive: true,
};

const slugify = (v) =>
  String(v || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const toLocalInput = (v) => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fromOffer = (o) => ({
  ...EMPTY,
  name: o.name,
  slug: o.slug,
  slugTouched: true,
  description: o.description || "",
  badge: o.badge || "",
  type: o.type,
  selectionMode: o.selectionMode || "PICK",
  minBooks: o.minBooks,
  maxBooks: o.maxBooks || 20,
  fixedPrice: o.fixedPrice || 0,
  discountPercent: o.discountPercent || 0,
  maxDiscountAmount: o.maxDiscountAmount || 0,
  amountOff: o.amountOff || 0,
  perBookPrice: o.perBookPrice || 0,
  buyBooks: Math.max(1, (o.minBooks || 0) - (o.freeBooks || 0)) || 1,
  freeBooks: o.freeBooks || 1,
  tiers: o.tiers?.length ? o.tiers.map((t) => ({ minBooks: t.minBooks, percent: t.percent })) : EMPTY.tiers,
  scopeMode: o.scope?.mode && o.scope.mode !== "ALL" ? "CUSTOM" : "ALL",
  tags: o.scope?.tags || [],
  tagMatch: o.scope?.tagMatch || "ANY",
  categories: o.scope?.categories || [],
  bookIds: (o.scope?.bookIds || []).map(String),
  excludeBookIds: (o.scope?.excludeBookIds || []).map(String),
  minBookPrice: o.scope?.minBookPrice || 0,
  maxBookPrice: o.scope?.maxBookPrice || 0,
  startsAt: toLocalInput(o.startsAt),
  endsAt: toLocalInput(o.endsAt),
  maxUses: o.maxUses || 0,
  position: o.position >= 999999 ? 1 : o.position,
  isActive: o.isActive !== false,
});

/* ------------------ form -> the rule object the shared rules understand ------------------ */

const n = (v) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

const sortedTiers = (f) =>
  f.tiers
    .map((t) => ({ minBooks: Math.floor(n(t.minBooks)), percent: n(t.percent) }))
    .filter((t) => t.minBooks > 0 || t.percent > 0)
    .sort((a, b) => a.minBooks - b.minBooks);

function counts(f) {
  const all = f.selectionMode === "ALL";
  let min = Math.floor(n(f.minBooks));
  let max = Math.floor(n(f.maxBooks)) || 50;

  if (f.type === "FREE_BOOKS") min = Math.floor(n(f.buyBooks)) + Math.floor(n(f.freeBooks));
  if (f.type === "TIERED_PERCENT") min = sortedTiers(f)[0]?.minBooks || 0;

  if (all) max = 50;
  else if (f.type === "FIXED_PRICE" || f.type === "FREE_BOOKS") max = min;

  return { min, max };
}

function draftOffer(f) {
  const { min, max } = counts(f);
  return {
    name: f.name,
    type: f.type,
    selectionMode: f.selectionMode,
    minBooks: min,
    maxBooks: max,
    fixedPrice: n(f.fixedPrice),
    discountPercent: n(f.discountPercent),
    maxDiscountAmount: n(f.maxDiscountAmount),
    amountOff: n(f.amountOff),
    perBookPrice: n(f.perBookPrice),
    freeBooks: Math.floor(n(f.freeBooks)),
    tiers: sortedTiers(f),
    scope: {
      mode: f.scopeMode,
      tags: f.tags,
      tagMatch: f.tagMatch,
      categories: f.categories,
      bookIds: f.bookIds,
      excludeBookIds: f.excludeBookIds,
      minBookPrice: n(f.minBookPrice),
      maxBookPrice: n(f.maxBookPrice),
    },
  };
}

const toBody = (f) => ({
  name: f.name,
  slug: f.slug || slugify(f.name),
  description: f.description,
  badge: f.badge,
  type: f.type,
  selectionMode: f.selectionMode,
  minBooks: counts(f).min,
  maxBooks: Number(f.maxBooks),
  fixedPrice: n(f.fixedPrice),
  discountPercent: n(f.discountPercent),
  maxDiscountAmount: n(f.maxDiscountAmount),
  amountOff: n(f.amountOff),
  perBookPrice: n(f.perBookPrice),
  buyBooks: n(f.buyBooks),
  freeBooks: n(f.freeBooks),
  tiers: sortedTiers(f),
  scope: {
    mode: f.scopeMode,
    tags: f.tags,
    tagMatch: f.tagMatch,
    categories: f.categories,
    bookIds: f.bookIds,
    excludeBookIds: f.excludeBookIds,
    minBookPrice: n(f.minBookPrice),
    maxBookPrice: n(f.maxBookPrice),
  },
  startsAt: f.startsAt ? new Date(f.startsAt).toISOString() : null,
  endsAt: f.endsAt ? new Date(f.endsAt).toISOString() : null,
  maxUses: Math.floor(n(f.maxUses)),
  position: Math.floor(n(f.position)) || 1,
  isActive: f.isActive,
});

/* ------------------------------------ validation ------------------------------------ */

function validate(f, eligibleCount) {
  const deal = [];
  const books = [];
  const details = [];
  const { min, max } = counts(f);

  switch (f.type) {
    case "FIXED_PRICE":
      if (!(n(f.fixedPrice) > 0)) deal.push("Enter the flat price.");
      break;
    case "PERCENT_OFF":
      if (!(n(f.discountPercent) >= 1 && n(f.discountPercent) <= 95)) deal.push("Discount must be between 1% and 95%.");
      break;
    case "AMOUNT_OFF":
      if (!(n(f.amountOff) > 0)) deal.push("Enter the rupees off.");
      break;
    case "PER_BOOK_PRICE":
      if (!(n(f.perBookPrice) > 0)) deal.push("Enter the price per book.");
      break;
    case "FREE_BOOKS":
      if (!(n(f.buyBooks) >= 1)) deal.push("Books to buy must be at least 1.");
      if (!(n(f.freeBooks) >= 1)) deal.push("Free books must be at least 1.");
      break;
    case "TIERED_PERCENT": {
      const tiers = sortedTiers(f);
      if (!tiers.length) deal.push("Add at least one tier.");
      tiers.forEach((t, i) => {
        if (t.minBooks < 2 || t.minBooks > 50) deal.push(`Tier ${i + 1}: books must be between 2 and 50.`);
        if (!(t.percent >= 1 && t.percent <= 95)) deal.push(`Tier ${i + 1}: discount must be between 1% and 95%.`);
        if (i > 0 && t.minBooks === tiers[i - 1].minBooks) deal.push(`Tiers ${i} and ${i + 1} have the same number of books.`);
        if (i > 0 && t.percent <= tiers[i - 1].percent) deal.push(`Tier ${i + 1} must give a bigger discount than tier ${i}.`);
      });
      break;
    }
    default:
      break;
  }

  if (f.type !== "TIERED_PERCENT" && f.type !== "FREE_BOOKS" && !(min >= 2 && min <= 50)) {
    deal.push("The offer needs between 2 and 50 books.");
  }
  if (f.type === "FREE_BOOKS" && !(min >= 2 && min <= 50)) deal.push("Buy + free books must be between 2 and 50.");
  if (f.selectionMode === "PICK" && ["PERCENT_OFF", "AMOUNT_OFF", "PER_BOOK_PRICE", "TIERED_PERCENT"].includes(f.type)) {
    const lastTier = f.type === "TIERED_PERCENT" ? sortedTiers(f).at(-1)?.minBooks || 0 : 0;
    if (max < Math.max(min, lastTier) || max > 50) deal.push(`Maximum books must be between ${Math.max(min, lastTier)} and 50.`);
  }

  if (f.scopeMode === "CUSTOM" && !f.tags.length && !f.categories.length && !f.bookIds.length) {
    books.push("Choose at least one tag, category or book, or switch to all books.");
  }
  if (n(f.maxBookPrice) > 0 && n(f.minBookPrice) > n(f.maxBookPrice)) books.push("Minimum book price is higher than the maximum.");
  if (min > 0 && eligibleCount < min) {
    books.push(`Only ${eligibleCount} book${eligibleCount === 1 ? "" : "s"} qualify but the offer needs ${min}.`);
  }
  if (f.selectionMode === "ALL" && eligibleCount > 50) books.push("An all-books offer can include at most 50 books. Narrow the books.");

  if (!f.name.trim()) details.push("Give the offer a name.");
  if (!slugify(f.slug || f.name)) details.push("The link name (slug) is empty.");
  if (f.startsAt && f.endsAt && new Date(f.endsAt) < new Date(f.startsAt)) details.push("End date is before the start date.");

  return { deal, books, details };
}

/* ------------------------------------ small pieces ------------------------------------ */

const input =
  "h-11 w-full rounded-xl border border-orange-200 bg-white px-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";

function Field({ label, hint, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-600">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs leading-relaxed text-slate-500">{hint}</span>}
    </label>
  );
}

function Num({ value, onChange, ...rest }) {
  return <input type="number" inputMode="decimal" className={input} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />;
}

function Chip({ on, onClick, children, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
        on
          ? "border-transparent bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/30"
          : "border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-400"
      }`}
    >
      {on && <Check size={12} strokeWidth={3.5} />}
      {children}
      {count !== undefined && <span className={on ? "text-white/80" : "text-orange-400"}>{count}</span>}
    </button>
  );
}

function Notice({ tone = "warn", children }) {
  const style =
    tone === "err"
      ? "border-red-200 bg-red-50 text-red-700"
      : tone === "ok"
        ? "border-green-200 bg-green-50 text-green-800"
        : "border-amber-200 bg-amber-50 text-amber-800";
  return (
    <p className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold leading-relaxed ${style}`}>
      <AlertTriangle size={15} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function Covers({ books, max = 5 }) {
  const shown = books.filter((b) => b.coverPageUrl).slice(0, max);
  if (!shown.length) return null;
  return (
    <span className="flex items-center">
      {shown.map((b, i) => (
        <img
          key={b._id}
          src={b.coverPageUrl}
          alt=""
          loading="lazy"
          className="h-10 w-7 rounded border-2 border-white object-cover shadow"
          style={{ marginLeft: i ? -8 : 0, zIndex: max - i, position: "relative" }}
        />
      ))}
      {books.length > shown.length && <span className="ml-2 text-[11px] font-bold text-slate-500">+{books.length - shown.length}</span>}
    </span>
  );
}

/* A searchable, tickable list of books (used for "special books" and for exclusions) */
function BookPicker({ books, selected, onChange, tagList, emptyText }) {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return books.filter((b) => {
      const okTag = !tag || (b.tags || []).some((t) => t.toLowerCase() === tag);
      const okQ = !needle || `${b.title} ${b.category} ${(b.tags || []).join(" ")}`.toLowerCase().includes(needle);
      return okTag && okQ;
    });
  }, [books, q, tag]);

  const chosen = new Set(selected);
  const toggle = (id) => onChange(chosen.has(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  const allShown = visible.length > 0 && visible.every((b) => chosen.has(String(b._id)));

  return (
    <div className="rounded-2xl border border-orange-100 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-orange-100 p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search books"
            className="h-10 w-full rounded-lg border border-orange-200 pl-9 pr-3 text-sm outline-none focus:border-orange-500"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            const ids = visible.map((b) => String(b._id));
            onChange(allShown ? selected.filter((id) => !ids.includes(id)) : [...new Set([...selected, ...ids])]);
          }}
          className="h-10 rounded-lg border border-orange-300 bg-orange-50 px-3 text-xs font-extrabold text-orange-700"
        >
          {allShown ? "Unselect shown" : "Select all shown"}
        </button>
        {selected.length > 0 && (
          <button type="button" onClick={() => onChange([])} className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600">
            Clear ({selected.length})
          </button>
        )}
      </div>

      {tagList?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto border-b border-orange-100 px-3 py-2.5">
          <Chip on={!tag} onClick={() => setTag("")}>
            All
          </Chip>
          {tagList.slice(0, 10).map((t) => (
            <Chip key={t.name} on={tag === t.name.toLowerCase()} onClick={() => setTag(tag === t.name.toLowerCase() ? "" : t.name.toLowerCase())}>
              {t.name}
            </Chip>
          ))}
        </div>
      )}

      <ul className="max-h-72 divide-y divide-orange-50 overflow-y-auto">
        {visible.map((b) => {
          const on = chosen.has(String(b._id));
          return (
            <li key={b._id}>
              <button
                type="button"
                onClick={() => toggle(String(b._id))}
                aria-pressed={on}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${on ? "bg-orange-50" : "hover:bg-slate-50"}`}
              >
                {b.coverPageUrl ? (
                  <img src={b.coverPageUrl} alt="" loading="lazy" className="h-11 w-8 shrink-0 rounded object-cover" />
                ) : (
                  <span className="h-11 w-8 shrink-0 rounded bg-slate-200" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-sm font-bold text-slate-900">{b.title}</span>
                  <span className="text-xs text-slate-500">
                    {inr(b.price)}
                    {b.category ? ` · ${b.category}` : ""}
                  </span>
                </span>
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition ${
                    on ? "border-orange-500 bg-orange-500 text-white" : "border-slate-300 text-transparent"
                  }`}
                >
                  <Check size={14} strokeWidth={3.5} />
                </span>
              </button>
            </li>
          );
        })}
        {visible.length === 0 && <li className="p-6 text-center text-sm text-slate-500">{emptyText || "No books match."}</li>}
      </ul>
    </div>
  );
}

/* --------------------------------------- editor --------------------------------------- */

const STEPS = [
  { id: "deal", title: "The deal", sub: "How much is saved" },
  { id: "books", title: "The books", sub: "Which books qualify" },
  { id: "details", title: "Details", sub: "Name & schedule" },
  { id: "review", title: "Review", sub: "Check & save" },
];

function Editor({ initial, catalog, offerId, headers, onClose, onSaved }) {
  const [f, setF] = useState(initial);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (patch) => setF((cur) => ({ ...cur, ...patch }));

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const draft = useMemo(() => draftOffer(f), [f]);
  const eligible = useMemo(() => catalog.books.filter((b) => isBookEligible(draft, b)), [catalog, draft]);
  const problems = useMemo(() => validate(f, eligible.length), [f, eligible.length]);
  const stepProblems = (id) => problems[id] || [];
  const hasAny = problems.deal.length + problems.books.length + problems.details.length > 0;

  const sellable = useMemo(() => catalog.books.filter((b) => b.isPublished && b.isActive), [catalog]);

  const { min, max } = counts(f);
  const d = describeOffer(draft, eligible.length);

  /* simulator: example picks priced with the shared rules */
  const examples = useMemo(() => {
    if (!eligible.length || !min) return [];
    const asc = [...eligible].sort((a, b) => a.price - b.price);
    const desc = [...asc].reverse();
    const out = [];

    const add = (label, picks) => {
      if (picks.length < min) return;
      out.push({ label, count: picks.length, books: picks, result: priceSelection(draft, picks) });
    };

    if (f.selectionMode === "ALL") {
      add(`All ${eligible.length} books`, asc);
    } else if (f.type === "TIERED_PERCENT") {
      sortedTiers(f).forEach((t) => add(`${t.minBooks} priciest books`, desc.slice(0, t.minBooks)));
    } else {
      add(`${min} cheapest books`, asc.slice(0, min));
      add(`${min} priciest books`, desc.slice(0, min));
      if (max > min && max <= eligible.length) add(`${max} priciest books`, desc.slice(0, max));
    }
    return out;
  }, [eligible, draft, f, min, max]);

  const addTag = (name) => set({ tags: f.tags.some((t) => t.toLowerCase() === name.toLowerCase()) ? f.tags.filter((t) => t.toLowerCase() !== name.toLowerCase()) : [...f.tags, name] });
  const addCategory = (name) =>
    set({ categories: f.categories.some((c) => c.toLowerCase() === name.toLowerCase()) ? f.categories.filter((c) => c.toLowerCase() !== name.toLowerCase()) : [...f.categories, name] });

  const save = async () => {
    if (hasAny) {
      setStep(problems.deal.length ? 0 : problems.books.length ? 1 : 2);
      return;
    }

    try {
      setSaving(true);
      setServerError("");
      if (offerId) await axios.put(`${API}/${offerId}`, toBody(f), { headers, timeout: 30000 });
      else await axios.post(API, toBody(f), { headers, timeout: 30000 });
      onSaved();
    } catch (e) {
      setServerError(errText(e, "Unable to save the offer."));
    } finally {
      setSaving(false);
    }
  };

  const canNext = step < STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-4">
      <div role="dialog" aria-modal="true" aria-label="Offer editor" className="flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-3xl bg-[#FFFAF3] shadow-2xl sm:rounded-3xl">
        {/* header + stepper */}
        <div className="border-b border-orange-100 bg-gradient-to-r from-orange-100 via-orange-50 to-amber-50 px-5 pb-3 pt-4 sm:px-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[.14em] text-orange-600">{offerId ? "Edit offer" : "New offer"}</p>
              <h2 className="text-xl font-black text-slate-900 sm:text-2xl">{f.name.trim() || "Untitled offer"}</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full border border-orange-200 bg-white">
              <X size={18} />
            </button>
          </div>

          <ol className="mt-4 grid grid-cols-4 gap-2">
            {STEPS.map((s, i) => {
              const bad = s.id !== "review" && stepProblems(s.id).length > 0;
              const active = i === step;
              const done = i < step && !bad;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setStep(i)}
                    className={`w-full rounded-xl border px-2.5 py-2 text-left transition ${
                      active ? "border-orange-500 bg-white shadow-md" : "border-transparent bg-white/60 hover:bg-white"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-black ${
                          bad ? "bg-red-500 text-white" : done || active ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {done ? <Check size={13} strokeWidth={3.5} /> : bad ? "!" : i + 1}
                      </span>
                      <span className="hidden min-w-0 sm:block">
                        <span className="block text-xs font-extrabold text-slate-900">{s.title}</span>
                        <span className="block truncate text-[10px] text-slate-500">{s.sub}</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          {/* ------------------------------ 1. DEAL ------------------------------ */}
          {step === 0 && (
            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-sm font-black text-slate-900">1. How does the buyer choose?</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { id: "PICK", title: "Buyer picks the books", text: "They choose some books from the qualifying ones." },
                    { id: "ALL", title: "Buyer gets all qualifying books", text: "Nothing to choose, e.g. “All placement books for ₹999”." },
                  ].map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => set({ selectionMode: o.id })}
                      aria-pressed={f.selectionMode === o.id}
                      className={`rounded-2xl border-2 p-4 text-left transition ${
                        f.selectionMode === o.id ? "border-orange-500 bg-white shadow-lg shadow-orange-500/10" : "border-orange-100 bg-white/70 hover:border-orange-300"
                      }`}
                    >
                      <p className="text-sm font-black text-slate-900">{o.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{o.text}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-black text-slate-900">2. What is the deal?</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {DEAL_TYPES.map((t) => {
                    const Icon = t.icon;
                    const on = f.type === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => set({ type: t.id })}
                        aria-pressed={on}
                        className={`rounded-2xl border-2 p-4 text-left transition ${
                          on ? "border-orange-500 bg-white shadow-lg shadow-orange-500/10" : "border-orange-100 bg-white/70 hover:border-orange-300"
                        }`}
                      >
                        <span className={`grid h-10 w-10 place-items-center rounded-xl ${on ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white" : "bg-orange-100 text-orange-600"}`}>
                          <Icon size={19} />
                        </span>
                        <p className="mt-3 text-sm font-black text-slate-900">{t.title}</p>
                        <p className="text-xs font-bold text-orange-600">{t.example}</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">{t.help}</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-orange-100 bg-white p-4 sm:p-5">
                <h3 className="mb-4 text-sm font-black text-slate-900">3. The numbers</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {f.type === "FIXED_PRICE" && (
                    <>
                      <Field label="Number of books" hint="The buyer must pick exactly this many.">
                        <Num min="2" max="50" value={f.minBooks} onChange={(v) => set({ minBooks: v })} />
                      </Field>
                      <Field label="Total price (₹)" hint="What the buyer pays for the whole pick.">
                        <Num min="1" value={f.fixedPrice} onChange={(v) => set({ fixedPrice: v })} />
                      </Field>
                    </>
                  )}

                  {f.type === "PERCENT_OFF" && (
                    <>
                      <Field label="Discount (%)">
                        <Num min="1" max="95" value={f.discountPercent} onChange={(v) => set({ discountPercent: v })} />
                      </Field>
                      <Field label="Max discount (₹)" hint="Optional cap. 0 means no cap.">
                        <Num min="0" value={f.maxDiscountAmount} onChange={(v) => set({ maxDiscountAmount: v })} />
                      </Field>
                    </>
                  )}

                  {f.type === "AMOUNT_OFF" && (
                    <Field label="Rupees off (₹)" hint="Taken off the total of the picked books.">
                      <Num min="1" value={f.amountOff} onChange={(v) => set({ amountOff: v })} />
                    </Field>
                  )}

                  {f.type === "PER_BOOK_PRICE" && (
                    <Field label="Price of each book (₹)">
                      <Num min="1" value={f.perBookPrice} onChange={(v) => set({ perBookPrice: v })} />
                    </Field>
                  )}

                  {f.type === "FREE_BOOKS" && (
                    <>
                      <Field label="Books the buyer pays for (X)">
                        <Num min="1" max="49" value={f.buyBooks} onChange={(v) => set({ buyBooks: v })} />
                      </Field>
                      <Field label="Free books (Y)" hint="The cheapest Y of the picked books are free.">
                        <Num min="1" max="49" value={f.freeBooks} onChange={(v) => set({ freeBooks: v })} />
                      </Field>
                    </>
                  )}

                  {(f.type === "PERCENT_OFF" || f.type === "AMOUNT_OFF" || f.type === "PER_BOOK_PRICE") && (
                    <Field label="Minimum books" hint="The deal starts at this many books.">
                      <Num min="2" max="50" value={f.minBooks} onChange={(v) => set({ minBooks: v })} />
                    </Field>
                  )}

                  {f.selectionMode === "PICK" && ["PERCENT_OFF", "AMOUNT_OFF", "PER_BOOK_PRICE", "TIERED_PERCENT"].includes(f.type) && (
                    <Field label="Maximum books" hint="The most a buyer can pick.">
                      <Num min="2" max="50" value={f.maxBooks} onChange={(v) => set({ maxBooks: v })} />
                    </Field>
                  )}

                  {f.type === "TIERED_PERCENT" && (
                    <div className="sm:col-span-2">
                      <span className="mb-1.5 block text-xs font-extrabold uppercase tracking-wide text-slate-600">Tiers</span>
                      <div className="space-y-2">
                        {f.tiers.map((t, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-14 shrink-0 text-xs font-bold text-slate-500">Tier {i + 1}</span>
                            <Num min="2" max="50" value={t.minBooks} onChange={(v) => set({ tiers: f.tiers.map((x, j) => (j === i ? { ...x, minBooks: v } : x)) })} placeholder="Books" />
                            <span className="text-xs font-bold text-slate-500">books</span>
                            <Num min="1" max="95" value={t.percent} onChange={(v) => set({ tiers: f.tiers.map((x, j) => (j === i ? { ...x, percent: v } : x)) })} placeholder="%" />
                            <span className="text-xs font-bold text-slate-500">% off</span>
                            <button
                              type="button"
                              disabled={f.tiers.length <= 1}
                              onClick={() => set({ tiers: f.tiers.filter((_, j) => j !== i) })}
                              aria-label="Remove tier"
                              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const last = sortedTiers(f).at(-1);
                          set({ tiers: [...f.tiers, { minBooks: (last?.minBooks || 2) + 2, percent: Math.min(95, (last?.percent || 10) + 10) }] });
                        }}
                        className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50 px-3 text-xs font-extrabold text-orange-700"
                      >
                        <Plus size={14} /> Add tier
                      </button>
                    </div>
                  )}

                  {f.type === "TIERED_PERCENT" && (
                    <Field label="Max discount (₹)" hint="Optional cap on the rupee discount. 0 means no cap.">
                      <Num min="0" value={f.maxDiscountAmount} onChange={(v) => set({ maxDiscountAmount: v })} />
                    </Field>
                  )}
                </div>

                {f.selectionMode === "ALL" && (
                  <p className="mt-4 text-xs text-slate-500">
                    With “all qualifying books” the buyer gets every book that matches the next step (up to 50). The deal applies to that whole set.
                  </p>
                )}
              </section>

              {stepProblems("deal").map((m) => (
                <Notice key={m} tone="err">{m}</Notice>
              ))}
            </div>
          )}

          {/* ------------------------------ 2. BOOKS ------------------------------ */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { id: "ALL", title: "All books", text: "Every published book can be part of this offer." },
                  { id: "CUSTOM", title: "Specific books", text: "Mix tags, categories and hand-picked special books." },
                ].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => set({ scopeMode: o.id })}
                    aria-pressed={f.scopeMode === o.id}
                    className={`rounded-2xl border-2 p-4 text-left transition ${
                      f.scopeMode === o.id ? "border-orange-500 bg-white shadow-lg shadow-orange-500/10" : "border-orange-100 bg-white/70 hover:border-orange-300"
                    }`}
                  >
                    <p className="text-sm font-black text-slate-900">{o.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{o.text}</p>
                  </button>
                ))}
              </div>

              {f.scopeMode === "CUSTOM" && (
                <>
                  <p className="text-xs text-slate-500">
                    A book qualifies if it matches <b>any</b> of the choices below (a tag, a category, or a book you tick).
                  </p>

                  <section className="rounded-2xl border border-orange-100 bg-white p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-black text-slate-900">Tags</h3>
                      {f.tags.length > 1 && (
                        <div className="inline-flex overflow-hidden rounded-lg border border-orange-200 text-xs font-bold">
                          {[["ANY", "Any tag"], ["ALL", "All tags"]].map(([id, label]) => (
                            <button key={id} type="button" onClick={() => set({ tagMatch: id })} className={`px-3 py-1.5 ${f.tagMatch === id ? "bg-orange-500 text-white" : "bg-white text-orange-700"}`}>
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {catalog.tags.length ? (
                      <div className="flex flex-wrap gap-2">
                        {catalog.tags.map((t) => (
                          <Chip key={t.name} on={f.tags.some((x) => x.toLowerCase() === t.name.toLowerCase())} onClick={() => addTag(t.name)} count={t.count}>
                            {t.name}
                          </Chip>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No tags on your books yet. Add tags in the Books admin.</p>
                    )}
                  </section>

                  <section className="rounded-2xl border border-orange-100 bg-white p-4">
                    <h3 className="mb-3 text-sm font-black text-slate-900">Categories</h3>
                    {catalog.categories.length ? (
                      <div className="flex flex-wrap gap-2">
                        {catalog.categories.map((c) => (
                          <Chip key={c.name} on={f.categories.some((x) => x.toLowerCase() === c.name.toLowerCase())} onClick={() => addCategory(c.name)} count={c.count}>
                            {c.name}
                          </Chip>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No categories yet.</p>
                    )}
                  </section>

                  <section>
                    <h3 className="mb-2 text-sm font-black text-slate-900">
                      Special books <span className="font-semibold text-slate-500">({f.bookIds.length} chosen)</span>
                    </h3>
                    <BookPicker books={sellable} selected={f.bookIds} onChange={(ids) => set({ bookIds: ids })} tagList={catalog.tags} />
                  </section>
                </>
              )}

              <details className="rounded-2xl border border-orange-100 bg-white p-4" open={f.excludeBookIds.length > 0 || n(f.minBookPrice) > 0 || n(f.maxBookPrice) > 0}>
                <summary className="cursor-pointer text-sm font-black text-slate-900">Advanced: exclude books or limit by price</summary>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Only books costing at least (₹)">
                    <Num min="0" value={f.minBookPrice} onChange={(v) => set({ minBookPrice: v })} />
                  </Field>
                  <Field label="Only books costing at most (₹)" hint="0 means no limit.">
                    <Num min="0" value={f.maxBookPrice} onChange={(v) => set({ maxBookPrice: v })} />
                  </Field>
                </div>
                <h4 className="mb-2 mt-4 text-xs font-extrabold uppercase tracking-wide text-slate-600">
                  Never include these books ({f.excludeBookIds.length})
                </h4>
                <BookPicker books={sellable} selected={f.excludeBookIds} onChange={(ids) => set({ excludeBookIds: ids })} />
              </details>

              {/* live result */}
              <section className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-black text-slate-900">
                    <span className={eligible.length >= min ? "text-green-600" : "text-red-600"}>{eligible.length}</span> book
                    {eligible.length === 1 ? "" : "s"} qualify
                    {min ? <span className="font-semibold text-slate-500"> · offer needs {min}</span> : null}
                  </p>
                  <Covers books={eligible} max={6} />
                </div>
                {eligible.length > 0 && (
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">{eligible.map((b) => b.title).join(" · ")}</p>
                )}
              </section>

              {stepProblems("books").map((m) => (
                <Notice key={m} tone="err">{m}</Notice>
              ))}
            </div>
          )}

          {/* ------------------------------ 3. DETAILS ------------------------------ */}
          {step === 2 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Offer name" className="sm:col-span-2" hint="Shown to buyers, e.g. “Placement Combo”.">
                <input
                  className={input}
                  value={f.name}
                  onChange={(e) => set({ name: e.target.value, ...(f.slugTouched ? {} : { slug: slugify(e.target.value) }) })}
                  placeholder="Placement Combo"
                />
              </Field>
              <Field label="Link name (slug)" hint="Used in the offer link: /books/bundle-offers?offer=…">
                <input className={input} value={f.slug} onChange={(e) => set({ slug: slugify(e.target.value), slugTouched: true })} />
              </Field>
              <Field label="Badge (optional)" hint="Small label on the card, e.g. “Best value”.">
                <input className={input} maxLength={30} value={f.badge} onChange={(e) => set({ badge: e.target.value })} />
              </Field>
              <Field label="Short description (optional)" className="sm:col-span-2">
                <input className={input} maxLength={300} value={f.description} onChange={(e) => set({ description: e.target.value })} placeholder="Everything you need to crack campus placements" />
              </Field>
              <Field label="Starts (optional)">
                <input className={input} type="datetime-local" value={f.startsAt} onChange={(e) => set({ startsAt: e.target.value })} />
              </Field>
              <Field label="Ends (optional)">
                <input className={input} type="datetime-local" value={f.endsAt} onChange={(e) => set({ endsAt: e.target.value })} />
              </Field>
              <Field label="Limit on orders (optional)" hint="Stops the offer after this many paid orders. 0 means unlimited.">
                <Num min="0" value={f.maxUses} onChange={(v) => set({ maxUses: v })} />
              </Field>
              <Field label="Order on page" hint="1 shows first.">
                <Num min="1" value={f.position} onChange={(v) => set({ position: v })} />
              </Field>
              <label className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white p-4 sm:col-span-2">
                <input type="checkbox" checked={f.isActive} onChange={(e) => set({ isActive: e.target.checked })} className="h-5 w-5 accent-orange-500" />
                <span>
                  <span className="block text-sm font-black text-slate-900">Offer is live</span>
                  <span className="text-xs text-slate-500">Turn off to keep it as a draft that buyers cannot see.</span>
                </span>
              </label>

              {stepProblems("details").map((m) => (
                <div key={m} className="sm:col-span-2"><Notice tone="err">{m}</Notice></div>
              ))}
            </div>
          )}

          {/* ------------------------------ 4. REVIEW ------------------------------ */}
          {step === 3 && (
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-4">
                {hasAny && (
                  <div className="space-y-2">
                    {[...problems.deal, ...problems.books, ...problems.details].map((m) => (
                      <Notice key={m} tone="err">{m}</Notice>
                    ))}
                  </div>
                )}

                <section className="rounded-2xl border border-orange-100 bg-white p-4 text-sm">
                  <h3 className="mb-2 text-sm font-black text-slate-900">Summary</h3>
                  <dl className="space-y-2 text-xs">
                    {[
                      ["Deal", `${d.line}`],
                      ["Buyer", d.rule],
                      [
                        "Books",
                        f.scopeMode === "ALL"
                          ? "All books"
                          : [
                              f.tags.length ? `Tags: ${f.tags.join(", ")}${f.tags.length > 1 ? ` (${f.tagMatch === "ALL" ? "all" : "any"})` : ""}` : null,
                              f.categories.length ? `Categories: ${f.categories.join(", ")}` : null,
                              f.bookIds.length ? `${f.bookIds.length} chosen book${f.bookIds.length === 1 ? "" : "s"}` : null,
                            ]
                              .filter(Boolean)
                              .join(" + "),
                      ],
                      ["Excluded", f.excludeBookIds.length ? `${f.excludeBookIds.length} book(s)` : null],
                      ["Book price", n(f.minBookPrice) > 0 || n(f.maxBookPrice) > 0 ? `${n(f.minBookPrice) > 0 ? `from ${inr(f.minBookPrice)}` : ""} ${n(f.maxBookPrice) > 0 ? `up to ${inr(f.maxBookPrice)}` : ""}`.trim() : null],
                      ["Qualifying books", `${eligible.length}`],
                      ["Schedule", f.startsAt || f.endsAt ? `${f.startsAt ? new Date(f.startsAt).toLocaleString() : "now"} → ${f.endsAt ? new Date(f.endsAt).toLocaleString() : "no end"}` : "Always on"],
                      ["Order limit", n(f.maxUses) > 0 ? `${f.maxUses} paid orders` : null],
                      ["Status", f.isActive ? "Live" : "Draft (hidden)"],
                    ]
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4 border-b border-orange-50 pb-2 last:border-0">
                          <dt className="shrink-0 font-bold text-slate-500">{k}</dt>
                          <dd className="text-right font-semibold text-slate-900">{v}</dd>
                        </div>
                      ))}
                  </dl>
                </section>

                {/* buyer card preview */}
                <section>
                  <h3 className="mb-2 text-sm font-black text-slate-900">What buyers see</h3>
                  <div className="overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-lg shadow-orange-500/10">
                    <div className="bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 p-5 text-[#3B1D08]">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-orange-800">
                        <Sparkles size={13} /> {f.badge || "Bundle deal"}
                      </span>
                      <p className="mt-3 text-4xl font-black leading-none tracking-tight">{d.big}</p>
                      <p className="mt-1 text-sm font-bold opacity-80">{d.sub}</p>
                      <div className="mt-3"><Covers books={eligible} max={4} /></div>
                    </div>
                    <div className="p-5">
                      <p className="text-lg font-black text-slate-900">{f.name.trim() || "Offer name"}</p>
                      {f.description && <p className="mt-1 text-xs text-slate-500">{f.description}</p>}
                      <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-600"><Check size={14} className="text-green-600" /> {d.rule}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-600"><Check size={14} className="text-green-600" /> {eligible.length} books available</p>
                      <span className="mt-4 flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-sm font-black text-white">
                        {f.selectionMode === "ALL" ? "View books & buy" : "Choose books"}
                      </span>
                    </div>
                  </div>
                </section>
              </div>

              <section className="space-y-3">
                <h3 className="text-sm font-black text-slate-900">Example prices</h3>
                <p className="text-xs text-slate-500">Priced with the same rules the checkout uses, so there are no surprises.</p>

                {examples.length === 0 && <Notice>Not enough qualifying books to show an example yet.</Notice>}

                {examples.map((ex) => (
                  <div key={ex.label} className="rounded-2xl border border-orange-100 bg-white p-4">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-orange-700">{ex.label}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{ex.books.map((b) => b.title).join(" · ")}</p>
                    {ex.result.ok ? (
                      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-2xl font-black text-slate-900">{inr(ex.result.finalAmount)}</span>
                        <s className="text-sm text-slate-400">{inr(ex.result.originalAmount)}</s>
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-black text-green-700">
                          saves {inr(ex.result.discountAmount)} ({ex.result.savingsPercent}%)
                        </span>
                        {ex.result.percentApplied ? <span className="text-xs font-semibold text-slate-500">{ex.result.percentApplied}% tier</span> : null}
                      </div>
                    ) : (
                      <div className="mt-3"><Notice>{ex.result.message} Buyers who pick this combination will see this message.</Notice></div>
                    )}
                  </div>
                ))}
              </section>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="border-t border-orange-100 bg-white px-5 py-3.5 sm:px-7">
          {serverError && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">{serverError}</p>}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => (step === 0 ? onClose() : setStep(step - 1))}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-700"
            >
              {step === 0 ? "Cancel" : <><ChevronLeft size={16} /> Back</>}
            </button>

            {canNext ? (
              <button type="button" onClick={() => setStep(step + 1)} className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-7 text-sm font-black text-white shadow-lg shadow-orange-500/30">
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 text-sm font-black text-white shadow-lg shadow-orange-500/30 disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {offerId ? "Save changes" : f.isActive ? "Create & go live" : "Save as draft"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------- list --------------------------------------- */

function OfferRow({ offer, catalog, onEdit, onDuplicate, onToggle, onDelete, busy }) {
  const d = describeOffer(offer, offer.eligibleCount);
  const eligible = useMemo(() => catalog.books.filter((b) => isBookEligible(offer, b)), [catalog, offer]);
  const short = offer.eligibleCount < offer.minBooks;
  const now = new Date();
  const scheduled = offer.startsAt && new Date(offer.startsAt) > now;
  const ended = offer.endsAt && new Date(offer.endsAt) < now;
  const soldOut = Number(offer.maxUses) > 0 && offer.usedCount >= offer.maxUses;

  const state = !offer.isActive ? ["Draft", "bg-slate-200 text-slate-700"] : ended ? ["Ended", "bg-slate-200 text-slate-700"] : soldOut ? ["Sold out", "bg-red-100 text-red-700"] : scheduled ? ["Scheduled", "bg-blue-100 text-blue-700"] : short ? ["Hidden", "bg-red-100 text-red-700"] : ["Live", "bg-green-100 text-green-700"];

  const scope = offer.scope || {};
  const scopeText =
    !scope.mode || scope.mode === "ALL"
      ? "All books"
      : [
          scope.tags?.length ? `Tags: ${scope.tags.join(", ")}` : null,
          scope.categories?.length ? `Categories: ${scope.categories.join(", ")}` : null,
          scope.bookIds?.length ? `${scope.bookIds.length} chosen` : null,
        ]
          .filter(Boolean)
          .join(" + ");

  return (
    <li className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:shadow-xl hover:shadow-orange-500/10">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="shrink-0 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 px-5 py-4 text-center sm:w-52">
          <p className="text-2xl font-black leading-tight text-[#3B1D08]">{d.big}</p>
          <p className="mt-0.5 text-xs font-bold text-orange-800/80">{d.sub}</p>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black text-slate-900">{offer.name}</h3>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${state[1]}`}>{state[0]}</span>
            {offer.selectionMode === "ALL" && <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-black text-orange-700">ALL BOOKS</span>}
          </div>
          <p className="mt-0.5 text-sm font-semibold text-orange-700">{d.line}</p>
          <p className="mt-1 text-xs text-slate-500">
            {scopeText} · {d.rule}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-600">
            <Covers books={eligible} max={4} />
            <span className={`inline-flex items-center gap-1 ${short ? "text-red-600" : ""}`}>
              <BookOpen size={13} /> {offer.eligibleCount} qualifying book{offer.eligibleCount === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users size={13} /> {offer.usedCount || 0} paid order{offer.usedCount === 1 ? "" : "s"}
              {Number(offer.maxUses) > 0 ? ` of ${offer.maxUses}` : ""}
            </span>
            {(offer.startsAt || offer.endsAt) && (
              <span className="inline-flex items-center gap-1">
                <Clock size={13} /> {offer.startsAt ? new Date(offer.startsAt).toLocaleDateString() : "now"} → {offer.endsAt ? new Date(offer.endsAt).toLocaleDateString() : "no end"}
              </span>
            )}
          </div>

          {offer.isActive && short && (
            <p className="mt-3 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              Not visible to buyers: only {offer.eligibleCount} book{offer.eligibleCount === 1 ? "" : "s"} qualify but {offer.minBooks} are needed.
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:w-44 sm:flex-col sm:items-stretch">
          <button
            type="button"
            onClick={() => onToggle(offer)}
            disabled={busy}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-extrabold transition disabled:opacity-50 ${
              offer.isActive ? "border-green-300 bg-green-50 text-green-700" : "border-slate-300 text-slate-600"
            }`}
          >
            <Power size={14} /> {offer.isActive ? "Live · turn off" : "Turn on"}
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={() => onEdit(offer)} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-orange-500 px-3 text-xs font-extrabold text-white">
              <Pencil size={14} /> Edit
            </button>
            <button type="button" onClick={() => onDuplicate(offer)} aria-label="Duplicate" title="Duplicate" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-300 text-slate-600">
              <Copy size={15} />
            </button>
            <button type="button" onClick={() => onDelete(offer)} aria-label="Delete" title="Delete" className="grid h-10 w-10 place-items-center rounded-xl border border-red-200 text-red-600">
              <Trash2 size={15} />
            </button>
          </div>
          <a href={`/books/bundle-offers?offer=${offer.slug}`} target="_blank" rel="noreferrer" className="hidden items-center justify-center gap-1.5 text-xs font-bold text-orange-700 sm:inline-flex">
            <Eye size={13} /> View on site <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </li>
  );
}

/* --------------------------------------- page --------------------------------------- */

export default function AdminBookOffers() {
  const token = useSelector((s) => s.auth.token);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const [offers, setOffers] = useState([]);
  const [catalog, setCatalog] = useState({ books: [], tags: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");

  const [editor, setEditor] = useState(null); // { initial, offerId }
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    try {
      setError("");
      const [o, c] = await Promise.all([
        axios.get(API, { headers, timeout: 25000 }),
        axios.get(`${API}/catalog`, { headers, timeout: 25000 }),
      ]);
      setOffers(o.data?.data || []);
      setCatalog(c.data?.data || { books: [], tags: [], categories: [] });
    } catch (e) {
      setError(errText(e, "Unable to load offers."));
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    load();
  }, [load]);

  const flash = (text) => {
    setNotice(text);
    setTimeout(() => setNotice(""), 4000);
  };

  const toggle = async (offer) => {
    try {
      setBusyId(offer._id);
      setError("");
      await axios.patch(`${API}/${offer._id}/active`, { isActive: !offer.isActive }, { headers, timeout: 20000 });
      await load();
    } catch (e) {
      setError(errText(e, "Unable to update the offer."));
    } finally {
      setBusyId("");
    }
  };

  const confirmDelete = async () => {
    try {
      setBusyId(deleting._id);
      await axios.delete(`${API}/${deleting._id}`, { headers, timeout: 20000 });
      setDeleting(null);
      flash("Offer deleted. Past orders keep their data.");
      await load();
    } catch (e) {
      setError(errText(e, "Unable to delete the offer."));
      setDeleting(null);
    } finally {
      setBusyId("");
    }
  };

  const stats = useMemo(
    () => ({
      live: offers.filter((o) => o.isActive && o.eligibleCount >= o.minBooks).length,
      drafts: offers.filter((o) => !o.isActive).length,
      orders: offers.reduce((t, o) => t + (o.usedCount || 0), 0),
    }),
    [offers]
  );

  return (
    <main className="min-h-screen bg-[#FFF8F0] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <Helmet>
        <title>Book Offers | Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="mx-auto max-w-5xl">
        <header className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-orange-200 via-orange-300 to-amber-300 p-6 text-[#3B1D08] shadow-xl shadow-orange-500/15 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/40 blur-2xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-orange-800">
                <Package size={13} /> Bundle offers
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Book offers</h1>
              <p className="mt-1 max-w-xl text-sm font-medium opacity-80">
                Create deals like “any 5 books for ₹999”, “all placement books at 40% off” or “buy 3 get 1 free”. Buyers pick on{" "}
                <Link to="/books/bundle-offers" className="font-extrabold underline">/books/bundle-offers</Link>.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Link to="/admin/book-offers/payments" className="inline-flex h-12 items-center rounded-2xl border border-orange-800/20 bg-white/70 px-5 text-sm font-extrabold">
                Offer payments
              </Link>
              <button
                type="button"
                onClick={() => setEditor({ initial: { ...EMPTY, position: (offers.length || 0) + 1 }, offerId: null })}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#3B1D08] px-6 text-sm font-black text-white shadow-lg"
              >
                <Plus size={17} /> New offer
              </button>
            </div>
          </div>

          <dl className="relative mt-6 grid grid-cols-3 gap-3">
            {[["Live offers", stats.live], ["Drafts / off", stats.drafts], ["Paid orders", stats.orders]].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-white/60 px-4 py-3 text-center backdrop-blur">
                <dd className="text-2xl font-black">{v}</dd>
                <dt className="text-[11px] font-bold opacity-70">{k}</dt>
              </div>
            ))}
          </dl>
        </header>

        {notice && <p className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-800">{notice}</p>}
        {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

        {loading ? (
          <div className="grid place-items-center py-24 text-orange-400"><Loader2 className="animate-spin" /></div>
        ) : offers.length === 0 ? (
          <div className="mt-8 rounded-3xl border-2 border-dashed border-orange-200 bg-white/60 p-10 text-center">
            <p className="text-lg font-black text-slate-900">No offers yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Create your first deal. Pick how much is saved, which books qualify and how the buyer chooses.
            </p>
            <button
              type="button"
              onClick={() => setEditor({ initial: EMPTY, offerId: null })}
              className="mt-5 inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-7 text-sm font-black text-white shadow-lg shadow-orange-500/30"
            >
              <Plus size={17} /> Create an offer
            </button>
          </div>
        ) : (
          <ul className="mt-6 grid gap-4">
            {offers.map((o) => (
              <OfferRow
                key={o._id}
                offer={o}
                catalog={catalog}
                busy={busyId === o._id}
                onEdit={(x) => setEditor({ initial: fromOffer(x), offerId: x._id })}
                onDuplicate={(x) =>
                  setEditor({
                    initial: { ...fromOffer(x), name: `${x.name} (copy)`, slug: `${x.slug}-copy`, isActive: false, slugTouched: true },
                    offerId: null,
                  })
                }
                onToggle={toggle}
                onDelete={setDeleting}
              />
            ))}
          </ul>
        )}
      </div>

      {editor && (
        <Editor
          initial={editor.initial}
          offerId={editor.offerId}
          catalog={catalog}
          headers={headers}
          onClose={() => setEditor(null)}
          onSaved={async () => {
            setEditor(null);
            flash(editor.offerId ? "Offer saved." : "Offer created.");
            await load();
          }}
        />
      )}

      {deleting && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-black text-slate-900">Delete “{deleting.name}”?</h2>
            <p className="mt-2 text-sm text-slate-600">Buyers will no longer see this offer. Orders already placed keep their data.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDeleting(null)} className="h-11 rounded-xl border border-slate-300 px-5 text-sm font-bold">Cancel</button>
              <button type="button" onClick={confirmDelete} disabled={busyId === deleting._id} className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-black text-white disabled:opacity-60">
                {busyId === deleting._id && <Loader2 size={15} className="animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
