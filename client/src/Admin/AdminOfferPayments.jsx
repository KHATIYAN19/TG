import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import BASE_URL from "../utils/Url";
import { ActionModal, ConfirmModal, ManageMenu } from "./OfferOrderActions";

/* =====================================================
   ADMIN: OFFER PAYMENTS (/admin/book-offers/payments)

   Orders placed through multi-book offers, with the same
   mail actions as the Book Payments page:
     - resend access link (fresh 24h link, payment re-verified)
     - email all PDFs
     - pending-payment reminder
     - extend / revoke access
===================================================== */

const ROOT = String(BASE_URL || "").replace(/\/+$/, "");
const OFFERS_API = `${ROOT}/api/admin/book-offers`;
const MAIL_API = `${ROOT}/api/admin/notification/orders`;

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const when = (d) => (d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "-");
const errText = (e, f) => e?.response?.data?.message || e?.message || f;

const STATUS_STYLE = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  FAILED: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-200 text-slate-600",
  REFUNDED: "bg-purple-100 text-purple-700",
  PARTIALLY_REFUNDED: "bg-purple-100 text-purple-700",
};

const MAIL_STYLE = {
  SENT: "text-green-700",
  PARTIAL: "text-amber-700",
  FAILED: "text-red-700",
  SENDING: "text-blue-700",
};

const STATUSES = ["", "PAID", "PENDING", "FAILED", "CANCELLED", "REFUNDED"];

function Row({ k, v, mono }) {
  if (v === null || v === undefined || v === "") return null;
  return (
    <div className="flex justify-between gap-3 border-b border-slate-100 py-1.5 text-xs last:border-0">
      <span className="shrink-0 text-slate-500">{k}</span>
      <span className={`min-w-0 break-all text-right font-semibold text-slate-800 ${mono ? "font-mono text-[11px]" : ""}`}>{v}</span>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="mb-1 text-[11px] font-black uppercase tracking-wider text-orange-700">{title}</p>
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

export default function AdminOfferPayments() {
  const token = useSelector((s) => s.auth.token);
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const [offers, setOffers] = useState([]);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ orders: 0, paid: 0, pending: 0, revenue: 0 });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [offerId, setOfferId] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null); // { type, text }
  const [modal, setModal] = useState(null); // { order, action }
  const [confirmAuto, setConfirmAuto] = useState(false);
  const [expanded, setExpanded] = useState(() => new Set());
  const [mailSettings, setMailSettings] = useState(null); // { autoEbookEmail }
  const [savingSetting, setSavingSetting] = useState(false);

  const toggleOpen = (id) =>
    setExpanded((cur) => {
      const next = new Set(cur);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  useEffect(() => {
    axios
      .get(`${OFFERS_API}/settings`, { headers, timeout: 20000 })
      .then((r) => setMailSettings(r.data?.data || { autoEbookEmail: false }))
      .catch(() => setMailSettings({ autoEbookEmail: false, failed: true }));
  }, [headers]);

  const applyAutoMail = async () => {
    if (!mailSettings || savingSetting) return;
    const next = !mailSettings.autoEbookEmail;

    try {
      setSavingSetting(true);
      const res = await axios.put(`${OFFERS_API}/settings`, { autoEbookEmail: next }, { headers, timeout: 20000 });
      setMailSettings(res.data?.data);
      setNotice({ type: "ok", text: next ? "Automatic PDF email is ON." : "Automatic PDF email is OFF." });
      setConfirmAuto(false);
    } catch (e) {
      setNotice({ type: "err", text: errText(e, "Unable to change the setting.") });
      setConfirmAuto(false);
    } finally {
      setSavingSetting(false);
    }
  };

  useEffect(() => {
    axios
      .get(OFFERS_API, { headers, timeout: 20000 })
      .then((r) => setOffers(r.data?.data || []))
      .catch(() => {});
  }, [headers]);

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${OFFERS_API}/payments`, {
        headers,
        timeout: 25000,
        params: { offerId: offerId || undefined, status: status || undefined, q: q || undefined, page, limit: 20 },
      });
      setRows(res.data?.data || []);
      setSummary(res.data?.summary || { orders: 0, paid: 0, pending: 0, revenue: 0 });
      setPagination(res.data?.pagination || { page: 1, pages: 1, total: 0 });
    } catch (e) {
      setError(errText(e, "Unable to load offer payments."));
    } finally {
      setLoading(false);
    }
  }, [headers, offerId, status, q, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main className="min-h-screen bg-[#F6F8FC] px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <Helmet>
        <title>Offer Payments | Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="mx-auto max-w-6xl">
        <Link to="/admin/book-offers" className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600">
          <ArrowLeft size={15} /> Book offers
        </Link>

        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Offer payments</h1>
            <p className="text-sm text-slate-500">
              Orders bought through bundle offers. Resend access, email the PDFs and manage access.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold"
          >
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-black text-slate-900">
              <Mail size={16} className="text-orange-600" /> Automatic PDF email after payment
              {mailSettings && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    mailSettings.autoEbookEmail ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {mailSettings.autoEbookEmail ? "ON" : "OFF"}
                </span>
              )}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Applies to all books and offers. When OFF, nothing is emailed automatically; use the buttons on each order
              to send the access link or PDFs.
              {mailSettings?.failed && " (Could not read the current value.)"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmAuto(true)}
            disabled={!mailSettings || savingSetting}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-black text-slate-800 hover:border-orange-400 disabled:opacity-50"
          >
            {savingSetting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : mailSettings?.autoEbookEmail ? (
              <ToggleRight size={22} className="text-green-600" />
            ) : (
              <ToggleLeft size={22} className="text-slate-400" />
            )}
            {mailSettings?.autoEbookEmail ? "Turn off" : "Turn on"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Orders" value={summary.orders} />
          <Stat label="Paid" value={summary.paid} />
          <Stat label="Pending" value={summary.pending} />
          <Stat label="Revenue" value={money(summary.revenue)} />
        </div>

        {/* filters */}
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_200px_180px]">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order id, name, email, phone, transaction"
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-orange-500"
            />
          </div>
          <select
            value={offerId}
            onChange={(e) => {
              setOfferId(e.target.value);
              setPage(1);
            }}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">All offers</option>
            {offers.map((o) => (
              <option key={o._id} value={o._id}>
                {o.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s || "All statuses"}
              </option>
            ))}
          </select>
        </div>

        {notice && (
          <p
            role="status"
            className={`mt-4 rounded-xl border p-3 text-sm font-semibold ${
              notice.type === "ok" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {notice.text}
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>
        )}

        {loading ? (
          <div className="grid place-items-center py-20 text-slate-400">
            <Loader2 className="animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
            No offer orders found.
          </p>
        ) : (
          <ul className="mt-5 grid gap-3">
            {rows.map((o) => {
              const paid = o.orderStatus === "PAID";
              const pending = o.orderStatus === "PENDING";
              const accessLive = paid && !o.access?.revoked && o.access?.expiresAt && new Date(o.access.expiresAt) > new Date();

              return (
                <li key={o._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-black text-slate-900">
                        {o.customer?.name || "Customer"}
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${STATUS_STYLE[o.orderStatus] || "bg-slate-100"}`}>
                          {o.orderStatus}
                        </span>
                        {o.refund?.status && o.refund.status !== "NOT_REQUESTED" && (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-black text-purple-700">
                            Refund: {o.refund.status}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {o.customer?.email} · {o.customer?.phone}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-slate-400">{o.orderId}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">{money(o.payment?.amount)}</p>
                      <p className="text-[11px] text-slate-500">
                        {o.payment?.provider} · {o.payment?.method || "-"}
                      </p>
                      <p className="text-[11px] text-slate-500">{when(o.payment?.paidAt || o.createdAt)}</p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl bg-orange-50 p-3">
                    <p className="text-xs font-black text-orange-800">
                      {o.offer?.name} · {o.offer?.bookCount} books · list price {money(o.offer?.originalAmount)} · saved{" "}
                      {money(o.offer?.discountAmount)} · paid {money(o.offer?.finalAmount)}
                    </p>

                    <p className="mb-2 mt-3 text-[11px] font-black uppercase tracking-wider text-slate-500">
                      Books purchased ({(o.books || []).length})
                    </p>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {(o.books || []).map((b) => (
                        <li key={b._id} className="flex items-center gap-2.5 rounded-lg border border-orange-100 bg-white p-2">
                          {b.coverPageUrl ? (
                            <img src={b.coverPageUrl} alt="" loading="lazy" className="h-12 w-9 shrink-0 rounded object-cover" />
                          ) : (
                            <span className="h-12 w-9 shrink-0 rounded bg-slate-200" />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-2 text-xs font-bold leading-snug text-slate-900">{b.title}</span>
                            <span className="text-[11px] text-slate-500">{money(b.price)}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
                    <p>
                      Access:{" "}
                      <b className={accessLive ? "text-green-700" : "text-slate-500"}>
                        {o.access?.revoked ? "Revoked" : accessLive ? `Active until ${when(o.access.expiresAt)}` : paid ? "Expired" : "None"}
                      </b>
                      {paid && ` · opened ${o.access?.accessCount || 0}×`}
                    </p>
                    <p>
                      PDF mail:{" "}
                      <b className={MAIL_STYLE[o.ebookEmail?.status] || "text-slate-500"}>{o.ebookEmail?.status || "NONE"}</b>
                      {o.ebookEmail?.sentAt && ` · ${when(o.ebookEmail.sentAt)}`}
                      {o.ebookEmail?.lastError && <span className="text-red-600"> · {o.ebookEmail.lastError}</span>}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleOpen(o._id)}
                    aria-expanded={expanded.has(o._id)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-orange-700"
                  >
                    {expanded.has(o._id) ? "Hide" : "Show"} all details
                    <ChevronDown size={15} className={`transition ${expanded.has(o._id) ? "rotate-180" : ""}`} />
                  </button>

                  {expanded.has(o._id) && (
                    <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <Panel title="Customer">
                        <Row k="Name" v={o.customer?.name} />
                        <Row k="Email" v={o.customer?.email} />
                        <Row k="Phone" v={o.customer?.phone} />
                        <Row k="Order placed" v={when(o.createdAt)} />
                        <Row k="Last updated" v={when(o.updatedAt)} />
                      </Panel>

                      <Panel title="Payment">
                        <Row k="Order ID" v={o.orderId} mono />
                        <Row k="Gateway" v={o.payment?.provider} />
                        <Row k="Status" v={o.payment?.status} />
                        <Row k="Method" v={o.payment?.method} />
                        <Row k="Transaction ID" v={o.payment?.transactionId} mono />
                        <Row k="Payment ID" v={o.payment?.paymentId} mono />
                        <Row k="Amount" v={money(o.payment?.amount)} />
                        <Row k="Paid at" v={o.payment?.paidAt ? when(o.payment.paidAt) : null} />
                        <Row k="Failed at" v={o.payment?.failedAt ? when(o.payment.failedAt) : null} />
                        <Row k="Amount verified" v={o.verification?.amountVerified ? "Yes" : "No"} />
                      </Panel>

                      <Panel title="Offer">
                        <Row k="Offer" v={o.offer?.name} />
                        <Row k="Type" v={{ FIXED_PRICE: "Flat price", PERCENT_OFF: "Percent off", AMOUNT_OFF: "Rupees off", PER_BOOK_PRICE: "Same price each", FREE_BOOKS: "Buy X get Y free", TIERED_PERCENT: "Tiered discount" }[o.offer?.type] || o.offer?.type} />
                        <Row k="Books" v={o.offer?.bookCount} />
                        <Row k="List price" v={money(o.offer?.originalAmount)} />
                        <Row k="Discount" v={money(o.offer?.discountAmount)} />
                        <Row k="Paid" v={money(o.offer?.finalAmount)} />
                      </Panel>

                      <Panel title="Access">
                        <Row k="State" v={o.access?.revoked ? "Revoked" : accessLive ? "Active" : paid ? "Expired" : "None"} />
                        <Row k="Link created" v={o.access?.generatedAt ? when(o.access.generatedAt) : null} />
                        <Row k="Expires" v={o.access?.expiresAt ? when(o.access.expiresAt) : null} />
                        <Row k="Times opened" v={o.access?.accessCount ?? 0} />
                        <Row k="Last opened" v={o.access?.lastAccessedAt ? when(o.access.lastAccessedAt) : null} />
                      </Panel>

                      <Panel title="Emails">
                        <Row k="PDF mail" v={o.ebookEmail?.status || "NONE"} />
                        <Row k="Triggered by" v={o.ebookEmail?.trigger} />
                        <Row k="Attempts" v={o.ebookEmail?.attempts} />
                        <Row k="Mails sent" v={o.ebookEmail?.mailsSent} />
                        <Row k="Sent to" v={o.ebookEmail?.sentTo} />
                        <Row k="Sent at" v={o.ebookEmail?.sentAt ? when(o.ebookEmail.sentAt) : null} />
                        <Row k="Sent by" v={o.ebookEmail?.sentBy} />
                        <Row k="Last error" v={o.ebookEmail?.lastError} />
                        <Row k="Reminders sent" v={o.pendingMail?.sentCount || null} />
                        <Row k="Last reminder" v={o.pendingMail?.lastSentAt ? when(o.pendingMail.lastSentAt) : null} />
                      </Panel>

                      <Panel title="Source & affiliate">
                        <Row k="Affiliate code" v={o.payment?.affiliateCode} />
                        <Row
                          k="Commission"
                          v={o.payment?.affiliateAmount != null ? money(o.payment.affiliateAmount) : null}
                        />
                        <Row k="Remaining" v={o.payment?.remainingAmount != null ? money(o.payment.remainingAmount) : null} />
                        <Row k="Ad platform" v={o.metadata?.attribution?.platform} />
                        <Row k="UTM source" v={o.metadata?.utmSource} />
                        <Row k="UTM medium" v={o.metadata?.utmMedium} />
                        <Row k="UTM campaign" v={o.metadata?.utmCampaign} />
                        <Row k="Landing page" v={o.metadata?.attribution?.landingPath} />
                        <Row k="Referrer" v={o.metadata?.referrer} />
                        <Row k="IP" v={o.metadata?.ipAddress} mono />
                      </Panel>

                      {o.refund?.status && o.refund.status !== "NOT_REQUESTED" && (
                        <Panel title="Refund">
                          <Row k="Status" v={o.refund.status} />
                          <Row k="Requested" v={money(o.refund.requestedAmount)} />
                          <Row k="Refunded" v={money(o.refund.refundedAmount)} />
                          <Row k="Reason" v={o.refund.reason} />
                          <Row k="Completed" v={o.refund.completedAt ? when(o.refund.completedAt) : null} />
                        </Panel>
                      )}
                    </div>
                  )}

                  <div className="mt-3 flex justify-end">
                    <ManageMenu order={o} onPick={(action) => setModal({ order: o, action })} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3 text-sm font-bold">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-4 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-slate-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              type="button"
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="h-10 rounded-lg border border-slate-300 bg-white px-4 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {modal && (
        <ActionModal
          order={modal.order}
          action={modal.action}
          headers={headers}
          onClose={() => setModal(null)}
          onDone={load}
        />
      )}

      {confirmAuto && mailSettings && (
        <ConfirmModal
          title={mailSettings.autoEbookEmail ? "Turn OFF automatic PDF email?" : "Turn ON automatic PDF email?"}
          confirmLabel={mailSettings.autoEbookEmail ? "Turn off" : "Turn on"}
          danger={mailSettings.autoEbookEmail}
          busy={savingSetting}
          onConfirm={applyAutoMail}
          onClose={() => setConfirmAuto(false)}
          body={
            mailSettings.autoEbookEmail
              ? "New paid orders (all books and offers) will no longer be emailed their PDFs automatically. You can still send access links and PDFs by hand from each order's Manage menu."
              : "Every new paid order (all books and offers) will be emailed its PDFs automatically right after payment."
          }
        />
      )}
    </main>
  );
}
