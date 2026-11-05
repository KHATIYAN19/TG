import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, CheckCircle2, Info, Loader2, Mail, Send, X } from "lucide-react";

import BASE_URL from "../utils/Url";

/*
  "Send Promotional Mail" for one payment (opened from the ⋯ Manage menu of the Book
  Payments page).

  The admin only chooses which books to offer and which coupon applies to each. The
  server builds the whole email (cover, name, coupon code, amount to pay, book links with
  ?ref=, Prep Arena, unsubscribe) and checks it with the same rules as checkout, so what
  is previewed here is exactly what the customer receives.
*/

const API = `${BASE_URL}/api/admin/notification`;
const MAX_BOOKS = 10;

const inr = (n) => {
  const v = Math.round((Number(n) || 0) * 100) / 100;
  return `₹${v.toLocaleString("en-IN", { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 })}`;
};

const couponLabel = (c) => {
  const off = c.discountType === "PERCENTAGE" ? `${c.discountValue}% off` : `${inr(c.discountValue)} off`;
  const reach = c.appliesToAllBooks ? "all books" : `${(c.applicableBooks || []).length} book(s)`;
  return `${c.code} — ${off} · ${reach}`;
};

const modeOf = (item) => (item.couponMode === "own" ? `own:${item.couponCode}` : item.couponMode);

async function call(path, token, { method = "GET", body } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || `Request failed (${response.status})`);
  }
  return result;
}

const inputCls =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200";

export default function PromoMailModal({ order, token, onClose }) {
  const [options, setOptions] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [items, setItems] = useState([]);
  const [defaultCoupon, setDefaultCoupon] = useState("");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState(null);
  const [previewError, setPreviewError] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [sending, setSending] = useState(false);

  const orderKey = order?._id || order?.orderId;
  const purchasedId = String(order?.bookId?._id || order?.bookId || "");
  const customer = order?.customer || {};

  /* books + coupons to choose from */
  useEffect(() => {
    let cancelled = false;
    call("/promo-mail/options", token)
      .then((data) => !cancelled && setOptions(data))
      .catch((e) => !cancelled && setLoadError(e.message));
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !sending && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, sending]);

  const body = useMemo(() => ({ offer: { defaultCouponCode: defaultCoupon, items }, note }), [defaultCoupon, items, note]);
  const bodyKey = JSON.stringify(body);

  /* live preview from the server (debounced) */
  useEffect(() => {
    if (!items.length) {
      setPreview(null);
      setPreviewError("");
      return undefined;
    }
    let cancelled = false;
    setPreviewing(true);
    const timer = setTimeout(() => {
      call(`/orders/${encodeURIComponent(orderKey)}/promo-mail/preview`, token, { method: "POST", body: JSON.parse(bodyKey) })
        .then((data) => {
          if (cancelled) return;
          setPreview(data);
          setPreviewError("");
        })
        .catch((e) => {
          if (cancelled) return;
          setPreview(null);
          setPreviewError(e.message);
        })
        .finally(() => !cancelled && setPreviewing(false));
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [bodyKey, orderKey, token, items.length]);

  const books = useMemo(() => (options?.books || []).filter((b) => String(b._id) !== purchasedId), [options, purchasedId]);
  const bookById = useMemo(() => new Map((options?.books || []).map((b) => [String(b._id), b])), [options]);
  const priceOf = useMemo(() => new Map((preview?.lines || []).map((l) => [l.bookId, l])), [preview]);
  const coupons = options?.coupons || [];

  const toggleBook = (id) => {
    setItems((list) => {
      if (list.some((i) => i.bookId === id)) return list.filter((i) => i.bookId !== id);
      if (list.length >= MAX_BOOKS) {
        toast.error(`Up to ${MAX_BOOKS} books.`);
        return list;
      }
      return [...list, { bookId: id, couponMode: "default", couponCode: "" }];
    });
  };

  const setLineCoupon = (id, value) =>
    setItems((list) =>
      list.map((i) => {
        if (i.bookId !== id) return i;
        if (value === "default" || value === "none") return { ...i, couponMode: value, couponCode: "" };
        return { ...i, couponMode: "own", couponCode: value.slice(4) };
      })
    );

  const send = useCallback(async () => {
    setSending(true);
    try {
      const result = await call(`/orders/${encodeURIComponent(orderKey)}/promo-mail/send`, token, { method: "POST", body });
      toast.success(result.message || "Promotional mail sent.");
      onClose(true);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  }, [orderKey, token, body, onClose]);

  const canSend = Boolean(preview?.ok) && !previewing && !sending;
  const problems = [...(preview?.errors || []), ...(previewError ? [previewError] : [])];

  return (
    <div className="fixed inset-0 z-[9995] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Send promotional mail">
      <div className="absolute inset-0 bg-slate-900/60" onClick={() => !sending && onClose()} />

      <div className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        {/* header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <Mail className="h-5 w-5 text-orange-600" /> Send promotional mail
            </h2>
            <p className="mt-1 truncate text-sm text-slate-600">
              To <b>{customer.name || "Customer"}</b> &lt;{customer.email || "no email"}&gt; · bought <b>{order?.book?.title || "a book"}</b>
            </p>
          </div>
          <button type="button" onClick={() => !sending && onClose()} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* body */}
        <div className="grid flex-1 gap-6 overflow-y-auto p-5 lg:grid-cols-2">
          <div className="space-y-5">
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
              The email starts with “Thanks for purchasing {order?.book?.title || "…"}”, then shows each book you pick with its cover, coupon code and the amount to pay, then a short note about Prep Arena. Book links get <code>?ref=lkh</code>. Replies go to supporttargettrek@gmail.com and an unsubscribe link is included.
            </p>

            {!options && !loadError && (
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading books and coupons…
              </p>
            )}
            {loadError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{loadError}</p>}

            {options && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-800">1. Books to offer ({items.length}/{MAX_BOOKS})</label>
                  <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                    {books.map((b) => {
                      const on = items.some((i) => i.bookId === String(b._id));
                      return (
                        <button
                          key={b._id}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggleBook(String(b._id))}
                          className={`rounded-full border px-3 py-1.5 text-sm transition ${
                            on ? "border-orange-500 bg-orange-50 font-semibold text-orange-800" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {b.title} · {inr(b.price)}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">A book this customer already owns (or a bundle containing it) is left out automatically.</p>
                </div>

                <div>
                  <label htmlFor="promo-coupon" className="mb-1.5 block text-sm font-semibold text-slate-800">
                    2. Coupon
                  </label>
                  <select id="promo-coupon" value={defaultCoupon} onChange={(e) => setDefaultCoupon(e.target.value)} className={inputCls}>
                    <option value="">No coupon (normal prices)</option>
                    {coupons.map((c) => (
                      <option key={c._id} value={c.code}>
                        {couponLabel(c)}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-slate-500">Used for every book below unless you give a book its own coupon. Create coupons in Admin → Coupons.</p>
                </div>

                {items.length > 0 && (
                  <div className="space-y-2">
                    {items.map((item) => {
                      const book = bookById.get(item.bookId);
                      const line = priceOf.get(item.bookId);
                      const owned = preview?.alreadyOwns?.includes(book?.title);
                      return (
                        <div key={item.bookId} className="rounded-xl border border-slate-200 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-slate-900">{book?.title || "Book"}</div>
                              <div className="mt-0.5 text-sm tabular-nums">
                                {owned ? (
                                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">Already owns it. Left out.</span>
                                ) : line?.discountAmount > 0 ? (
                                  <>
                                    <span className="text-xs text-slate-400 line-through">{inr(line.price)}</span>{" "}
                                    <b className="text-emerald-700">{inr(line.finalAmount)}</b>{" "}
                                    <span className="text-xs text-slate-500">with {line.couponCode}</span>
                                  </>
                                ) : (
                                  <b className="text-slate-800">{inr(line?.price ?? book?.price)}</b>
                                )}
                              </div>
                            </div>
                            <button type="button" onClick={() => toggleBook(item.bookId)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove ${book?.title || "book"}`}>
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <select value={modeOf(item)} onChange={(e) => setLineCoupon(item.bookId, e.target.value)} className={`${inputCls} mt-2`} aria-label={`Coupon for ${book?.title || "this book"}`}>
                            <option value="default">Use the coupon above{defaultCoupon ? ` (${defaultCoupon})` : " (none)"}</option>
                            <option value="none">No coupon for this book</option>
                            {item.couponMode === "own" && !coupons.some((c) => c.code === item.couponCode) && <option value={`own:${item.couponCode}`}>{item.couponCode} (not available)</option>}
                            {coupons.map((c) => (
                              <option key={c._id} value={`own:${c.code}`}>
                                {couponLabel(c)}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div>
                  <label htmlFor="promo-note" className="mb-1.5 block text-sm font-semibold text-slate-800">
                    3. Personal note <span className="font-normal text-slate-500">(optional)</span>
                  </label>
                  <textarea id="promo-note" rows={3} maxLength={1500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. This offer is valid till Sunday." className={inputCls} />
                </div>
              </>
            )}

            {/* checks */}
            <div className="space-y-2">
              {!items.length && options && <p className="text-xs text-slate-500">Pick at least one book to see the email.</p>}
              {problems.map((m) => (
                <p key={m} className="flex gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-800">
                  <AlertTriangle className="mt-px h-4 w-4 shrink-0" /> {m}
                </p>
              ))}
              {(preview?.warnings || []).map((m) => (
                <p key={m} className="flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  <Info className="mt-px h-4 w-4 shrink-0" /> {m}
                </p>
              ))}
              {(preview?.previous || []).length > 0 && (
                <p className="flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  <Info className="mt-px h-4 w-4 shrink-0" />
                  <span>
                    Already sent to this customer:{" "}
                    {preview.previous.map((p) => `${new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}${p.couponCodes?.length ? ` (${p.couponCodes.join(", ")})` : ""}`).join(" · ")}
                  </span>
                </p>
              )}
              {preview?.ok && !previewing && (
                <p className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Ready to send
                  {preview.lines.length > 1 ? ` · total ${inr(preview.total)}${preview.savings > 0 ? `, saves ${inr(preview.savings)}` : ""}` : ""}
                </p>
              )}
            </div>
          </div>

          {/* preview */}
          <div className="lg:sticky lg:top-0 lg:self-start">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Preview {previewing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            </p>
            {preview?.html ? (
              <>
                <p className="mb-2 truncate rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <b>Subject:</b> {preview.subject}
                </p>
                <iframe title="Email preview" sandbox="" srcDoc={preview.html} className="h-[520px] w-full rounded-xl border border-slate-200 bg-white" />
              </>
            ) : (
              <div className="grid h-[320px] place-items-center rounded-xl border border-dashed border-slate-300 text-center text-sm text-slate-400">
                The email preview appears here
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
          <button type="button" onClick={() => !sending && onClose()} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSend}
            onClick={send}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send to {customer.email || "customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
