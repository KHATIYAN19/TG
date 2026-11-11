import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertTriangle,
  BellRing,
  Check,
  Copy,
  Eye,
  FileDown,
  Link2,
  Loader2,
  Mail,
  Megaphone,
  MoreVertical,
  Search,
  Send,
  ShieldOff,
  Star,
  TimerReset,
  X,
} from "lucide-react";

import BASE_URL from "../utils/Url";

/* =====================================================
   ORDER ACTIONS for the Offer Payments page

   Manage menu (three dots) -> in-page modal for each action:
     Send Book Access, Email Ebook PDFs, Extend Access,
     Revoke Book Access, Generate Review Link, Send Review Email,
     Send Promotional Mail (+ payment reminder for pending orders)
   No browser popups: every confirmation is a modal.
===================================================== */

const ROOT = String(BASE_URL || "").replace(/\/+$/, "");
const MAIL = `${ROOT}/api/admin/notification`;
const REVIEW = `${ROOT}/api/book/review/admin/order`;

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const errText = (e, f) => e?.response?.data?.message || e?.message || f;

export const ACTIONS = [
  { id: "access", label: "Send Book Access", icon: Mail, needs: "paid" },
  { id: "pdfs", label: "Email Ebook PDFs", icon: FileDown, needs: "paid" },
  { id: "extend", label: "Extend Access", icon: TimerReset, needs: "paid" },
  { id: "revoke", label: "Revoke Book Access", icon: ShieldOff, needs: "paid", danger: true },
  { id: "reviewLink", label: "Generate Review Link", icon: Link2, needs: "paid" },
  { id: "reviewMail", label: "Send Review Email", icon: Star, needs: "paid" },
  { id: "promo", label: "Send Promotional Mail", icon: Megaphone, needs: "paid" },
  { id: "pending", label: "Send Payment Reminder", icon: BellRing, needs: "pending" },
];

const isEnabled = (a, order) => {
  if (a.needs === "paid" && order.orderStatus !== "PAID") return false;
  if (a.needs === "pending" && order.orderStatus !== "PENDING") return false;
  if (a.id === "revoke" && order.access?.revoked) return false;
  return true;
};

/* ------------------------- manage (three dots) menu ------------------------- */

export function ManageMenu({ order, onPick }) {
  const [open, setOpen] = useState(false);
  const items = ACTIONS.filter((a) => a.needs !== "pending" || order.orderStatus === "PENDING");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-bold text-slate-800 hover:border-orange-400"
      >
        <MoreVertical size={16} /> Manage
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden="true" />
          <ul
            role="menu"
            className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-2xl"
          >
            {items.map((a) => {
              const Icon = a.icon;
              const enabled = isEnabled(a, order);
              return (
                <li key={a.id} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    disabled={!enabled}
                    onClick={() => {
                      setOpen(false);
                      onPick(a.id);
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      a.danger ? "text-red-600 hover:bg-red-50" : "text-slate-800 hover:bg-orange-50"
                    }`}
                  >
                    <Icon size={16} className={a.danger ? "" : "text-orange-600"} />
                    {a.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

/* ------------------------------ shared modal shell ------------------------------ */

export function Modal({ title, subtitle, onClose, wide, children, footer, locked }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !locked && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, locked]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-900/55 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && !locked && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl ${
          wide ? "max-w-4xl" : "max-w-lg"
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={locked}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-slate-200 bg-slate-50 px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

/* Confirm used for any "are you sure" (also the auto-mail switch on the page) */
export function ConfirmModal({ title, body, confirmLabel = "Confirm", danger, busy, error, onConfirm, onClose }) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      locked={busy}
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={busy} className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-black text-white disabled:opacity-60 ${
              danger ? "bg-red-600" : "bg-orange-500"
            }`}
          >
            {busy && <Loader2 size={15} className="animate-spin" />} {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="text-sm leading-relaxed text-slate-700">{body}</div>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700">{error}</p>}
    </Modal>
  );
}

function OrderBrief({ order }) {
  return (
    <div className="mb-4 rounded-xl border border-orange-100 bg-orange-50 p-3 text-xs text-slate-700">
      <p className="font-black text-slate-900">{order.customer?.name || "Customer"}</p>
      <p>{order.customer?.email}</p>
      <p className="mt-1 text-slate-500">
        {order.offer?.name} · {order.offer?.bookCount} books · {money(order.payment?.amount)} ·{" "}
        <span className="font-mono">{order.orderId}</span>
      </p>
    </div>
  );
}

/* ----------------------------- simple confirm actions ----------------------------- */

const SIMPLE = {
  access: {
    title: "Send Book Access",
    confirmLabel: "Verify & send link",
    text: (o) =>
      `The payment is verified with the gateway, a fresh 24-hour access link for all ${o.offer?.bookCount} books is created and emailed to ${o.customer?.email}. The previous link stops working.`,
    req: (id) => ({ method: "post", url: `${MAIL}/orders/${id}/resend-book-access` }),
  },
  pdfs: {
    title: "Email Ebook PDFs",
    confirmLabel: "Email PDFs",
    text: (o) => `All ${o.offer?.bookCount} PDFs are emailed to ${o.customer?.email}. Large files are sent as download links. This can take a minute.`,
    req: (id) => ({ method: "post", url: `${MAIL}/orders/${id}/send-ebook-pdfs` }),
  },
  revoke: {
    title: "Revoke Book Access",
    confirmLabel: "Revoke access",
    danger: true,
    text: (o) => `${o.customer?.name || "The customer"} will no longer be able to open the books with their current link. You can send a new access link later.`,
    req: (id) => ({ method: "patch", url: `${MAIL}/orders/${id}/access/revoke` }),
  },
  reviewMail: {
    title: "Send Review Email",
    confirmLabel: "Send email",
    text: (o) => `A review request email with a personal review link is sent to ${o.customer?.email}.`,
    req: (id) => ({ method: "post", url: `${REVIEW}/${id}/send-mail` }),
  },
  pending: {
    title: "Send Payment Reminder",
    confirmLabel: "Send reminder",
    text: (o) => `A reminder to complete the payment is emailed to ${o.customer?.email}.`,
    req: (id) => ({ method: "post", url: `${MAIL}/orders/${id}/send-pending-mail` }),
  },
};

function SimpleAction({ order, action, headers, onClose, onDone }) {
  const cfg = SIMPLE[action];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  const run = async () => {
    try {
      setBusy(true);
      setError("");
      const res = await axios({ ...cfg.req(encodeURIComponent(order._id)), headers, timeout: 90000 });
      setResult(res.data?.message || "Done.");
      onDone();
    } catch (e) {
      setError(errText(e, "The action failed."));
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <Modal
        title={cfg.title}
        onClose={onClose}
        footer={<button type="button" onClick={onClose} className="h-11 w-full rounded-xl bg-orange-500 text-sm font-black text-white">Done</button>}
      >
        <p className="flex items-start gap-2 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">
          <Check size={18} className="mt-0.5 shrink-0" /> {result}
        </p>
      </Modal>
    );
  }

  return (
    <ConfirmModal
      title={cfg.title}
      confirmLabel={cfg.confirmLabel}
      danger={cfg.danger}
      busy={busy}
      error={error}
      onConfirm={run}
      onClose={onClose}
      body={
        <>
          <OrderBrief order={order} />
          {cfg.text(order)}
        </>
      }
    />
  );
}

/* ---------------------------------- extend access ---------------------------------- */

function ExtendAction({ order, headers, onClose, onDone }) {
  const [hours, setHours] = useState(24);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  const run = async () => {
    const h = Number(hours);
    if (!Number.isInteger(h) || h < 1 || h > 720) {
      setError("Enter whole hours between 1 and 720.");
      return;
    }
    try {
      setBusy(true);
      setError("");
      const res = await axios.patch(
        `${MAIL}/orders/${encodeURIComponent(order._id)}/access/extend`,
        { hours: h },
        { headers, timeout: 30000 }
      );
      setResult(res.data?.message || `Access extended by ${h} hours.`);
      onDone();
    } catch (e) {
      setError(errText(e, "Unable to extend access."));
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <Modal title="Extend Access" onClose={onClose} footer={<button type="button" onClick={onClose} className="h-11 w-full rounded-xl bg-orange-500 text-sm font-black text-white">Done</button>}>
        <p className="flex items-start gap-2 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">
          <Check size={18} className="mt-0.5 shrink-0" /> {result}
        </p>
      </Modal>
    );
  }

  return (
    <ConfirmModal
      title="Extend Access"
      confirmLabel="Extend access"
      busy={busy}
      error={error}
      onConfirm={run}
      onClose={onClose}
      body={
        <>
          <OrderBrief order={order} />
          <p>Add more time to the customer's existing access link.</p>
          <label className="mt-3 block text-xs font-bold text-slate-700">
            Extend by (hours, 1 to 720)
            <input
              type="number"
              min="1"
              max="720"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-orange-500"
            />
          </label>
          <div className="mt-2 flex gap-2">
            {[24, 72, 168].map((h) => (
              <button key={h} type="button" onClick={() => setHours(h)} className="rounded-full border border-slate-300 px-3 py-1 text-xs font-bold">
                {h >= 24 ? `${h / 24} day${h === 24 ? "" : "s"}` : `${h}h`}
              </button>
            ))}
          </div>
        </>
      }
    />
  );
}

/* --------------------------------- review link --------------------------------- */

function ReviewLinkAction({ order, headers, onClose }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  const run = async () => {
    try {
      setBusy(true);
      setError("");
      const res = await axios.post(`${REVIEW}/${encodeURIComponent(order._id)}/link`, {}, { headers, timeout: 30000 });
      setData({ url: res.data?.data?.reviewUrl, existing: res.data?.data?.alreadyGenerated, message: res.data?.message });
    } catch (e) {
      setError(errText(e, "Unable to generate the review link."));
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the link is visible to copy by hand */
    }
  };

  if (data) {
    return (
      <Modal title="Review Link" onClose={onClose} footer={<button type="button" onClick={onClose} className="h-11 w-full rounded-xl bg-orange-500 text-sm font-black text-white">Done</button>}>
        <p className="text-sm font-semibold text-green-800">{data.message}</p>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
          <input readOnly value={data.url || ""} onFocus={(e) => e.target.select()} className="min-w-0 flex-1 bg-transparent px-1 text-xs outline-none" />
          <button type="button" onClick={copy} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-orange-500 px-3 text-xs font-black text-white">
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">The review is for the first book in this order.</p>
      </Modal>
    );
  }

  return (
    <ConfirmModal
      title="Generate Review Link"
      confirmLabel="Generate link"
      busy={busy}
      error={error}
      onConfirm={run}
      onClose={onClose}
      body={
        <>
          <OrderBrief order={order} />
          Creates a personal link where the customer can review their purchase. Nothing is emailed.
        </>
      }
    />
  );
}

/* -------------------------------- promotional mail -------------------------------- */

const MAX_PROMO_BOOKS = 10;

function PromoAction({ order, headers, onClose }) {
  const [options, setOptions] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [note, setNote] = useState("");

  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(""); // "preview" | "send"
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");

  useEffect(() => {
    axios
      .get(`${MAIL}/promo-mail/options`, { headers, timeout: 30000 })
      .then((r) => setOptions({ books: r.data?.books || [], coupons: r.data?.coupons || [] }))
      .catch((e) => setLoadError(errText(e, "Unable to load books and coupons.")));
  }, [headers]);

  const owned = useMemo(() => new Set((order.purchasedBookIds || []).map(String)), [order]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (options?.books || []).filter((b) => !q || b.title.toLowerCase().includes(q));
  }, [options, search]);

  const toggle = (id) => {
    setPreview(null);
    setError("");
    setPicked((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= MAX_PROMO_BOOKS ? cur : [...cur, id]));
  };

  const body = () => ({
    offer: {
      defaultCouponCode: coupon,
      items: picked.map((bookId) => ({ bookId, couponMode: coupon ? "default" : "none", couponCode: "" })),
    },
    note,
  });

  const url = (path) => `${MAIL}/orders/${encodeURIComponent(order._id)}/promo-mail/${path}`;

  const doPreview = async () => {
    try {
      setBusy("preview");
      setError("");
      const res = await axios.post(url("preview"), body(), { headers, timeout: 60000 });
      setPreview(res.data);
    } catch (e) {
      setPreview(null);
      setError(errText(e, "Unable to build the preview."));
    } finally {
      setBusy("");
    }
  };

  const doSend = async () => {
    try {
      setBusy("send");
      setError("");
      const res = await axios.post(url("send"), body(), { headers, timeout: 60000 });
      setSent(res.data?.message || "Promotional mail sent.");
    } catch (e) {
      setError(errText(e, "Unable to send the mail."));
    } finally {
      setBusy("");
    }
  };

  if (sent) {
    return (
      <Modal title="Send Promotional Mail" onClose={onClose} footer={<button type="button" onClick={onClose} className="h-11 w-full rounded-xl bg-orange-500 text-sm font-black text-white">Done</button>}>
        <p className="flex items-start gap-2 rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800">
          <Check size={18} className="mt-0.5 shrink-0" /> {sent}
        </p>
      </Modal>
    );
  }

  return (
    <Modal
      wide
      title="Send Promotional Mail"
      subtitle={`To ${order.customer?.name || "customer"} · ${order.customer?.email}`}
      onClose={onClose}
      locked={Boolean(busy)}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-slate-500">{picked.length}/{MAX_PROMO_BOOKS} books selected</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} disabled={Boolean(busy)} className="h-11 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold">
              Cancel
            </button>
            <button
              type="button"
              onClick={doPreview}
              disabled={!picked.length || Boolean(busy)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-orange-400 bg-white px-5 text-sm font-black text-orange-700 disabled:opacity-50"
            >
              {busy === "preview" ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />} Preview
            </button>
            <button
              type="button"
              onClick={doSend}
              disabled={!preview?.ok || Boolean(busy)}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-orange-500 px-6 text-sm font-black text-white disabled:opacity-50"
            >
              {busy === "send" ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Send mail
            </button>
          </div>
        </div>
      }
    >
      {loadError && <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{loadError}</p>}
      {!options && !loadError && (
        <div className="grid place-items-center py-14 text-slate-400"><Loader2 className="animate-spin" /></div>
      )}

      {options && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-orange-700">1. Books to offer</p>
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search books"
                className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-orange-500"
              />
            </div>
            <ul className="mt-2 max-h-72 space-y-1.5 overflow-y-auto pr-1">
              {visible.map((b) => {
                const on = picked.includes(b._id);
                const has = owned.has(String(b._id));
                return (
                  <li key={b._id}>
                    <button
                      type="button"
                      onClick={() => toggle(b._id)}
                      aria-pressed={on}
                      className={`flex w-full items-center gap-2.5 rounded-lg border p-2 text-left transition ${
                        on ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-orange-300"
                      }`}
                    >
                      {b.cover ? <img src={b.cover} alt="" loading="lazy" className="h-10 w-8 shrink-0 rounded object-cover" /> : <span className="h-10 w-8 shrink-0 rounded bg-slate-200" />}
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 text-xs font-bold text-slate-900">{b.title}</span>
                        <span className="text-[11px] text-slate-500">{money(b.price)}{has && " · already bought in this order"}</span>
                      </span>
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${on ? "border-orange-500 bg-orange-500 text-white" : "border-slate-300 text-transparent"}`}>
                        <Check size={12} strokeWidth={3.5} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <p className="mb-2 mt-4 text-xs font-black uppercase tracking-wider text-orange-700">2. Coupon (optional)</p>
            <select
              value={coupon}
              onChange={(e) => {
                setCoupon(e.target.value);
                setPreview(null);
              }}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
            >
              <option value="">No coupon (normal prices)</option>
              {options.coupons.map((c) => (
                <option key={c._id || c.code} value={c.code}>
                  {c.code} · {c.discountType === "PERCENTAGE" ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                </option>
              ))}
            </select>

            <p className="mb-2 mt-4 text-xs font-black uppercase tracking-wider text-orange-700">3. Personal note (optional)</p>
            <textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setPreview(null);
              }}
              maxLength={1500}
              rows={3}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-orange-500"
              placeholder="Shown at the top of the email"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-orange-700">Preview</p>

            {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700">{error}</p>}

            {!preview && !error && (
              <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                Pick books, then press Preview to see the exact email, prices and any problems before sending.
              </p>
            )}

            {preview && (
              <div className="space-y-3">
                {preview.errors?.map((m) => (
                  <p key={m} className="flex items-start gap-2 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700"><AlertTriangle size={14} className="mt-0.5 shrink-0" /> {m}</p>
                ))}
                {preview.warnings?.map((m) => (
                  <p key={m} className="rounded-lg bg-amber-50 p-2.5 text-xs font-semibold text-amber-800">{m}</p>
                ))}

                {preview.lines?.length > 0 && (
                  <div className="rounded-xl border border-slate-200 p-3 text-xs">
                    <p className="font-black text-slate-900">Subject: {preview.subject}</p>
                    <ul className="mt-2 space-y-1">
                      {preview.lines.map((l) => (
                        <li key={l.bookId} className="flex justify-between gap-3">
                          <span className="min-w-0 flex-1 truncate">{l.title}</span>
                          <span className="font-bold">{money(l.finalAmount)}{l.finalAmount < l.price && <s className="ml-1 font-normal text-slate-400">{money(l.price)}</s>}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 border-t border-slate-100 pt-2 font-black">Total {money(preview.total)} · saves {money(preview.savings)}</p>
                  </div>
                )}

                {preview.previous?.length > 0 && (
                  <p className="text-[11px] text-slate-500">
                    Earlier promo mails to this customer: {preview.previous.map((p) => new Date(p.createdAt).toLocaleDateString()).join(", ")}
                  </p>
                )}

                {preview.html && (
                  <iframe title="Email preview" sandbox="" srcDoc={preview.html} className="h-80 w-full rounded-xl border border-slate-200 bg-white" />
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------- router for the modal ------------------------------- */

export function ActionModal({ order, action, headers, onClose, onDone }) {
  if (action === "extend") return <ExtendAction order={order} headers={headers} onClose={onClose} onDone={onDone} />;
  if (action === "reviewLink") return <ReviewLinkAction order={order} headers={headers} onClose={onClose} />;
  if (action === "promo") return <PromoAction order={order} headers={headers} onClose={onClose} />;
  if (SIMPLE[action]) return <SimpleAction order={order} action={action} headers={headers} onClose={onClose} onDone={onDone} />;
  return null;
}
