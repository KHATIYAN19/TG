import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  IndianRupee,
  Loader2,
  Percent,
  Plus,
  Power,
  Search,
  ShoppingBag,
  Sparkles,
  TicketPercent,
  Trash2,
  Users,
  X,
} from "lucide-react";

import BASE_URL from "../utils/Url";

/* =====================================================
   CONSTANTS & HELPERS
===================================================== */

const PAGE_LIMIT = 9;

const EMPTY_FORM = {
  code: "",
  name: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  maxDiscountAmount: "",
  minimumOrderAmount: "",
  appliesToAllBooks: true,
  applicableBooks: [],
  showOnPaymentPage: false,
  usageLimit: "",
  perUserLimit: "1",
  validFrom: "",
  validTill: "",
  isActive: true,
};

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const formatDate = (value) => {
  if (!value) return "No expiry";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "No expiry";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getState = (coupon) => {
  const now = new Date();

  if (coupon.validTill && new Date(coupon.validTill) < now) {
    return "expired";
  }

  if (coupon.validFrom && new Date(coupon.validFrom) > now) {
    return "scheduled";
  }

  if (
    coupon.usageLimit &&
    (coupon.usedCount || 0) >= coupon.usageLimit
  ) {
    return "exhausted";
  }

  return coupon.isActive ? "active" : "inactive";
};

const STATE_STYLES = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  inactive: "bg-stone-100 text-stone-600 ring-stone-200",
  expired: "bg-rose-50 text-rose-700 ring-rose-200",
  scheduled: "bg-sky-50 text-sky-700 ring-sky-200",
  exhausted: "bg-amber-50 text-amber-800 ring-amber-200",
};

const STATE_LABELS = {
  active: "Active",
  inactive: "Disabled",
  expired: "Expired",
  scheduled: "Scheduled",
  exhausted: "Limit reached",
};

// Light, always-visible tinted top for every state
// (disabled coupons keep a clear stone tint, not a missing background).
const TOP_TONES = {
  active: {
    bar: "from-orange-400 to-amber-300",
    top: "bg-gradient-to-br from-orange-100 via-orange-50 to-amber-50 text-orange-950",
    sub: "text-orange-900/70",
    chip: "bg-white/80 text-orange-600",
  },
  inactive: {
    bar: "from-stone-300 to-stone-200",
    top: "bg-gradient-to-br from-stone-200 via-stone-100 to-stone-50 text-stone-800",
    sub: "text-stone-600",
    chip: "bg-white/80 text-stone-500",
  },
  expired: {
    bar: "from-rose-300 to-rose-200",
    top: "bg-gradient-to-br from-rose-100 via-rose-50 to-orange-50 text-rose-950",
    sub: "text-rose-900/70",
    chip: "bg-white/80 text-rose-500",
  },
  scheduled: {
    bar: "from-sky-300 to-sky-200",
    top: "bg-gradient-to-br from-sky-100 via-sky-50 to-orange-50 text-sky-950",
    sub: "text-sky-900/70",
    chip: "bg-white/80 text-sky-500",
  },
  exhausted: {
    bar: "from-amber-300 to-yellow-200",
    top: "bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-50 text-amber-950",
    sub: "text-amber-900/70",
    chip: "bg-white/80 text-amber-600",
  },
};

const inputClass =
  "w-full rounded-xl border border-orange-100 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100";

/* =====================================================
   PAGE
===================================================== */

const AdminCouponDashboard = () => {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [books, setBooks] = useState([]);
  const [booksLoading, setBooksLoading] = useState(false);

  const [toast, setToast] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const toastTimer = useRef(null);

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const notify = useCallback((type, message) => {
    clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  /* ---------------- data ---------------- */

  const fetchBooks = useCallback(async () => {
    try {
      setBooksLoading(true);

      const response = await fetch(`${BASE_URL}/book`, { headers });
      const result = await response.json().catch(() => null);

      const list = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.data?.books)
            ? result.data.books
            : Array.isArray(result?.books)
              ? result.books
              : [];

      setBooks(list);
    } catch (err) {
      console.error("Fetch books error:", err);
    } finally {
      setBooksLoading(false);
    }
  }, [headers]);

  const fetchCoupons = useCallback(
    async (targetPage = 1, soft = false) => {
      try {
        if (!soft) setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: String(targetPage),
          limit: String(PAGE_LIMIT),
        });

        if (search.trim()) params.set("search", search.trim());
        if (status !== "all") params.set("status", status);

        const response = await fetch(
          `${BASE_URL}/api/coupon/admin?${params}`,
          { headers }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Unable to fetch coupons.");
        }

        setCoupons(data.data || []);
        setTotal(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
        setPage(data.pagination?.page || targetPage);
      } catch (err) {
        console.error("Fetch coupons error:", err);
        setError(err.message || "Unable to fetch coupons.");
      } finally {
        setLoading(false);
      }
    },
    [headers, search, status]
  );

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCoupons(1), 350);
    return () => clearTimeout(timer);
  }, [fetchCoupons]);

  /* ---------------- actions ---------------- */

  const patchCoupon = async (coupon, fields, successMessage) => {
    try {
      setBusyId(coupon._id);

      const response = await fetch(
        `${BASE_URL}/api/coupon/admin/${coupon._id}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(fields),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to update coupon.");
      }

      setCoupons((current) =>
        current.map((item) =>
          item._id === coupon._id ? { ...item, ...fields } : item
        )
      );

      notify("success", successMessage);
    } catch (err) {
      notify("error", err.message || "Unable to update coupon.");
    } finally {
      setBusyId(null);
    }
  };

  const hardDelete = async (coupon) => {
    const response = await fetch(
      `${BASE_URL}/api/coupon/admin/${coupon._id}/permanent`,
      { method: "DELETE", headers }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success) {
      throw new Error(
        data?.message || "Unable to permanently delete coupon."
      );
    }

    setDeleteTarget(null);
    notify("success", data.message || "Coupon permanently deleted.");

    // Step back a page if the last item of a page was removed.
    const nextPage = coupons.length === 1 && page > 1 ? page - 1 : page;
    await fetchCoupons(nextPage, true);
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      notify("success", `Copied ${code}`);
    } catch {
      notify("error", "Unable to copy the code.");
    }
  };

  /* ---------------- stats ---------------- */

  const stats = useMemo(() => {
    const active = coupons.filter((c) => getState(c) === "active").length;
    const visible = coupons.filter((c) => c.showOnPaymentPage).length;
    const redeemed = coupons.reduce((t, c) => t + (c.usedCount || 0), 0);

    return { active, visible, redeemed };
  }, [coupons]);

  /* ---------------- render ---------------- */

  return (
    <div className="relative min-h-screen overflow-hidden bg-orange-50/70">
      {/* soft decorative glow */}
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-96 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />

      <main className="relative mx-auto mt-20 max-w-7xl px-4 pb-20 sm:px-6 lg:mt-24 lg:px-8">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-100 via-amber-50 to-white p-6 shadow-sm sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-orange-200/50 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-amber-200/50 blur-2xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-md shadow-orange-200/60 ring-1 ring-orange-100">
                <TicketPercent size={30} />
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight text-orange-950 sm:text-4xl">
                  Coupons
                </h1>
                <p className="mt-1 max-w-xl text-sm leading-6 text-orange-900/70">
                  Create offers, pick the ones that appear on the payment
                  page, and keep an eye on how they are used.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCreate(true);
                if (!books.length) fetchBooks();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-300/60 transition hover:-translate-y-0.5 hover:bg-orange-600"
            >
              <Plus size={18} />
              New Coupon
            </button>
          </div>

          {/* STATS */}
          <div className="relative mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              tone="bg-orange-100 text-orange-600"
              icon={<TicketPercent size={20} />}
              label="Total coupons"
              value={total}
            />
            <StatCard
              tone="bg-emerald-100 text-emerald-600"
              icon={<CheckCircle2 size={20} />}
              label="Active on this page"
              value={stats.active}
            />
            <StatCard
              tone="bg-amber-100 text-amber-600"
              icon={<ShoppingBag size={20} />}
              label="Shown at checkout"
              value={stats.visible}
            />
            <StatCard
              tone="bg-rose-100 text-rose-500"
              icon={<Users size={20} />}
              label="Redemptions"
              value={stats.redeemed}
            />
          </div>
        </section>

        {/* TOOLBAR */}
        <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-orange-100 bg-white/90 p-3 shadow-sm backdrop-blur md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-orange-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code or name"
              className={`${inputClass} border-transparent bg-orange-50/60 pl-10`}
            />
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-orange-50 p-1">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatus(filter.value)}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                  status === filter.value
                    ? "bg-white text-orange-600 shadow-sm ring-1 ring-orange-100"
                    : "text-orange-800/70 hover:bg-white/60"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            <AlertCircle size={17} />
            {error}
          </div>
        )}

        {/* LIST */}
        {loading ? (
          <div className="grid gap-5 pt-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-3xl border border-orange-100 bg-white"
              />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-orange-200 bg-white/80 px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
              <Sparkles size={28} />
            </div>
            <h3 className="mt-4 text-lg font-black text-orange-950">
              No coupons found
            </h3>
            <p className="mt-1 text-sm text-orange-900/60">
              {search || status !== "all"
                ? "Try a different search or filter."
                : "Create your first coupon to start offering discounts."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 pt-6 md:grid-cols-2 xl:grid-cols-3">
            {coupons.map((coupon) => (
              <CouponCard
                key={coupon._id}
                coupon={coupon}
                busy={busyId === coupon._id}
                onOpen={() => navigate(`/admin/coupon/${coupon._id}`)}
                onCopy={() => copyCode(coupon.code)}
                onToggleActive={() =>
                  patchCoupon(
                    coupon,
                    { isActive: !coupon.isActive },
                    coupon.isActive
                      ? `${coupon.code} disabled`
                      : `${coupon.code} enabled`
                  )
                }
                onToggleVisible={() =>
                  patchCoupon(
                    coupon,
                    { showOnPaymentPage: !coupon.showOnPaymentPage },
                    coupon.showOnPaymentPage
                      ? `${coupon.code} hidden from payment page`
                      : `${coupon.code} now shown on payment page`
                  )
                }
                onDelete={() => setDeleteTarget(coupon)}
              />
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => fetchCoupons(page - 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-white px-3.5 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Prev
            </button>

            <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-orange-900/70 ring-1 ring-orange-100">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => fetchCoupons(page + 1)}
              className="inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-white px-3.5 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-50 disabled:opacity-40"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>

      {showCreate && (
        <CreateCouponModal
          books={books}
          booksLoading={booksLoading}
          headers={headers}
          onClose={() => setShowCreate(false)}
          onCreated={async () => {
            setShowCreate(false);
            notify("success", "Coupon created successfully.");
            await fetchCoupons(1, true);
          }}
        />
      )}

      {deleteTarget && (
        <HardDeleteModal
          coupon={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => hardDelete(deleteTarget)}
        />
      )}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 z-[10000] flex -translate-x-1/2 items-center gap-2 rounded-2xl border bg-white px-4 py-3 text-sm font-bold shadow-xl ${
            toast.type === "error"
              ? "border-rose-200 text-rose-700 shadow-rose-100"
              : "border-orange-200 text-orange-950 shadow-orange-100"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={16} />
          ) : (
            <Check size={16} className="text-orange-500" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
};

/* =====================================================
   STAT CARD
===================================================== */

const StatCard = ({ icon, label, value, tone }) => (
  <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 p-4 shadow-sm backdrop-blur">
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="truncate text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </div>
  </div>
);

/* =====================================================
   COUPON CARD
===================================================== */

const CouponCard = ({
  coupon,
  busy,
  onOpen,
  onCopy,
  onToggleActive,
  onToggleVisible,
  onDelete,
}) => {
  const state = getState(coupon);
  const tone = TOP_TONES[state];
  const used = coupon.usedCount || 0;
  const limit = coupon.usageLimit;
  const percent = limit ? Math.min((used / limit) * 100, 100) : 0;

  const big =
    coupon.discountType === "PERCENTAGE"
      ? `${coupon.discountValue}%`
      : `₹${coupon.discountValue}`;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-200/50">
      {busy && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
          <Loader2 className="animate-spin text-orange-500" />
        </div>
      )}

      {/* colour strip */}
      <div className={`h-1.5 bg-gradient-to-r ${tone.bar}`} />

      {/* light tinted top */}
      <div className={`relative px-5 pb-6 pt-5 ${tone.top}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-end gap-1.5">
              <span className="text-5xl font-black leading-none tracking-tight">
                {big}
              </span>
              <span className="pb-1 text-sm font-black uppercase tracking-widest opacity-70">
                off
              </span>
            </div>

            <p className={`mt-2 truncate text-sm font-semibold ${tone.sub}`}>
              {coupon.name}
            </p>
          </div>

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm ${tone.chip}`}
          >
            {coupon.discountType === "PERCENTAGE" ? (
              <Percent size={20} />
            ) : (
              <IndianRupee size={20} />
            )}
          </div>
        </div>

        {/* ticket perforation */}
        <div className="absolute inset-x-5 -bottom-px border-b-2 border-dashed border-orange-200/80" />
        <span className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full border border-orange-100 bg-orange-50" />
        <span className="absolute -bottom-3 -right-3 h-6 w-6 rounded-full border border-orange-100 bg-orange-50" />
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCopy}
            title="Copy code"
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-orange-300 bg-orange-50 px-2.5 py-1 font-mono text-sm font-black tracking-wide text-orange-700 transition hover:bg-orange-100"
          >
            {coupon.code}
            <Copy size={13} />
          </button>

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${STATE_STYLES[state]}`}
          >
            {STATE_LABELS[state]}
          </span>

          {coupon.showOnPaymentPage && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700 ring-1 ring-orange-200">
              <Eye size={12} /> At checkout
            </span>
          )}
        </div>

        {coupon.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
            {coupon.description}
          </p>
        )}

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl bg-orange-50/60 p-3.5 text-sm">
          <Info
            icon={<BookOpen size={14} />}
            label="Books"
            value={
              coupon.appliesToAllBooks
                ? "All books"
                : `${coupon.applicableBooks?.length || 0} selected`
            }
          />
          <Info
            icon={<IndianRupee size={14} />}
            label="Min order"
            value={
              coupon.minimumOrderAmount
                ? `₹${coupon.minimumOrderAmount}`
                : "None"
            }
          />
          <Info
            icon={<Users size={14} />}
            label="Per customer"
            value={coupon.perUserLimit ?? 1}
          />
          <Info
            icon={<CalendarDays size={14} />}
            label="Expires"
            value={formatDate(coupon.validTill)}
          />
        </dl>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Redeemed</span>
            <span className="text-slate-800">
              {limit ? `${used} / ${limit}` : `${used} (no limit)`}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-orange-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-300 to-orange-500 transition-all"
              style={{ width: limit ? `${percent}%` : "0%" }}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onOpen}
            className="flex-1 rounded-xl bg-orange-500 px-3 py-2.5 text-sm font-black text-white shadow-sm shadow-orange-200 transition hover:bg-orange-600"
          >
            View / Edit
          </button>

          <IconButton
            title={
              coupon.showOnPaymentPage
                ? "Hide from payment page"
                : "Show on payment page"
            }
            onClick={onToggleVisible}
            active={coupon.showOnPaymentPage}
          >
            {coupon.showOnPaymentPage ? (
              <Eye size={16} />
            ) : (
              <EyeOff size={16} />
            )}
          </IconButton>

          <IconButton
            title={coupon.isActive ? "Disable coupon" : "Enable coupon"}
            onClick={onToggleActive}
            active={coupon.isActive}
          >
            <Power size={16} />
          </IconButton>

          <button
            type="button"
            title="Delete permanently"
            onClick={onDelete}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-500 transition hover:bg-rose-500 hover:text-white"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
};

const IconButton = ({ title, onClick, active, children }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
      active
        ? "border-orange-300 bg-orange-100 text-orange-700 hover:bg-orange-200"
        : "border-slate-200 text-slate-400 hover:bg-slate-100"
    }`}
  >
    {children}
  </button>
);

const Info = ({ icon, label, value }) => (
  <div className="min-w-0">
    <dt className="flex items-center gap-1 text-xs font-semibold text-slate-400">
      {icon}
      {label}
    </dt>
    <dd className="mt-0.5 truncate font-bold text-slate-800">{value}</dd>
  </div>
);

/* =====================================================
   PERMANENT DELETE MODAL (type the code to confirm)
===================================================== */

const HardDeleteModal = ({ coupon, onCancel, onConfirm }) => {
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const matches = typed.trim().toUpperCase() === coupon.code;

  const submit = async () => {
    try {
      setDeleting(true);
      setError("");
      await onConfirm();
    } catch (err) {
      setError(err.message || "Unable to delete coupon.");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-orange-950/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <Trash2 size={22} />
        </div>

        <h2 className="mt-4 text-xl font-black text-slate-900">
          Delete permanently?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          <strong className="font-mono text-slate-900">
            {coupon.code}
          </strong>{" "}
          will be removed from the database for good. This cannot be
          undone. To just stop customers using it, disable the coupon
          instead.
        </p>

        <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-medium leading-5 text-orange-800">
          Past orders keep their own copy of the coupon details, so
          order history and reports are not affected.
        </div>

        <label className="mt-4 block text-sm font-bold text-slate-700">
          Type{" "}
          <span className="font-mono text-red-600">{coupon.code}</span>{" "}
          to confirm
        </label>
        <input
          autoFocus
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && matches && !deleting) submit();
          }}
          className={`${inputClass} mt-1.5 font-mono uppercase`}
          placeholder={coupon.code}
        />

        {error && (
          <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!matches || deleting}
            onClick={submit}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            Delete forever
          </button>
        </div>
      </div>
    </div>
  );
};

/* =====================================================
   CREATE COUPON MODAL
===================================================== */

const CreateCouponModal = ({
  books,
  booksLoading,
  headers,
  onClose,
  onCreated,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [bookSearch, setBookSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setField = (name, value) =>
    setForm((current) => ({ ...current, [name]: value }));

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setField(name, type === "checkbox" ? checked : value);
  };

  const filteredBooks = useMemo(() => {
    const query = bookSearch.trim().toLowerCase();

    if (!query) return books;

    return books.filter(
      (book) =>
        book.title?.toLowerCase().includes(query) ||
        book.slug?.toLowerCase().includes(query) ||
        book.category?.toLowerCase().includes(query)
    );
  }, [books, bookSearch]);

  const toggleBook = (id) =>
    setForm((current) => ({
      ...current,
      applicableBooks: current.applicableBooks.includes(id)
        ? current.applicableBooks.filter((b) => b !== id)
        : [...current.applicableBooks, id],
    }));

  const submit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!form.code.trim()) throw new Error("Coupon code is required.");
      if (!form.name.trim()) throw new Error("Coupon name is required.");
      if (form.discountValue === "")
        throw new Error("Discount value is required.");

      const value = Number(form.discountValue);

      if (!Number.isFinite(value) || value < 0)
        throw new Error("Enter a valid discount value.");

      if (form.discountType === "PERCENTAGE" && value > 100)
        throw new Error("Percentage discount cannot exceed 100.");

      if (!form.appliesToAllBooks && form.applicableBooks.length === 0)
        throw new Error("Select at least one book.");

      if (
        form.validFrom &&
        form.validTill &&
        new Date(form.validTill) <= new Date(form.validFrom)
      )
        throw new Error("Valid till must be after valid from.");

      const num = (v) => (v === "" ? null : Number(v));

      const payload = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        description: form.description.trim() || null,
        discountType: form.discountType,
        discountValue: value,
        maxDiscountAmount:
          form.discountType === "PERCENTAGE"
            ? num(form.maxDiscountAmount)
            : null,
        minimumOrderAmount: form.minimumOrderAmount === ""
          ? 0
          : Number(form.minimumOrderAmount),
        appliesToAllBooks: form.appliesToAllBooks,
        applicableBooks: form.appliesToAllBooks
          ? []
          : form.applicableBooks,
        showOnPaymentPage: form.showOnPaymentPage,
        usageLimit: num(form.usageLimit),
        perUserLimit: form.perUserLimit === "" ? 1 : Number(form.perUserLimit),
        validFrom: form.validFrom
          ? new Date(form.validFrom).toISOString()
          : null,
        validTill: form.validTill
          ? new Date(form.validTill).toISOString()
          : null,
        isActive: form.isActive,
      };

      const response = await fetch(`${BASE_URL}/api/coupon/admin`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to create coupon.");
      }

      await onCreated();
    } catch (err) {
      setError(err.message || "Unable to create coupon.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-orange-950/30 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <form
        onSubmit={submit}
        className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-orange-100 bg-gradient-to-r from-orange-100 via-amber-50 to-white px-6 py-4 text-orange-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm ring-1 ring-orange-100">
              <TicketPercent size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black leading-tight">
                New coupon
              </h2>
              <p className="text-xs text-orange-900/70">
                Customers apply it with a code, or in one click if shown
                on the payment page.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => !saving && onClose()}
            className="rounded-lg p-1.5 text-orange-700 transition hover:bg-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <Section title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Coupon code *">
                <input
                  name="code"
                  value={form.code}
                  onChange={(e) =>
                    setField(
                      "code",
                      e.target.value.toUpperCase().replace(/\s+/g, "")
                    )
                  }
                  placeholder="SAVE20"
                  className={`${inputClass} font-mono font-bold uppercase`}
                />
              </Field>

              <Field label="Display name *">
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Festive offer"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Description (shown to customers)">
              <textarea
                name="description"
                rows={2}
                value={form.description}
                onChange={onChange}
                placeholder="Flat 20% off on all ebooks"
                className={inputClass}
              />
            </Field>
          </Section>

          <Section title="Discount">
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-orange-50 p-1">
              {[
                ["PERCENTAGE", "Percentage (%)"],
                ["FIXED", "Fixed amount (₹)"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setField("discountType", value)}
                  className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                    form.discountType === value
                      ? "bg-orange-500 text-white shadow"
                      : "text-orange-700 hover:bg-orange-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label={
                  form.discountType === "PERCENTAGE"
                    ? "Discount % *"
                    : "Discount ₹ *"
                }
              >
                <input
                  type="number"
                  min="0"
                  name="discountValue"
                  value={form.discountValue}
                  onChange={onChange}
                  className={inputClass}
                />
              </Field>

              {form.discountType === "PERCENTAGE" && (
                <Field label="Max discount ₹">
                  <input
                    type="number"
                    min="0"
                    name="maxDiscountAmount"
                    value={form.maxDiscountAmount}
                    onChange={onChange}
                    placeholder="No cap"
                    className={inputClass}
                  />
                </Field>
              )}

              <Field label="Minimum order ₹">
                <input
                  type="number"
                  min="0"
                  name="minimumOrderAmount"
                  value={form.minimumOrderAmount}
                  onChange={onChange}
                  placeholder="0"
                  className={inputClass}
                />
              </Field>
            </div>
          </Section>

          <Section title="Limits & validity">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Total usage limit">
                <input
                  type="number"
                  min="1"
                  name="usageLimit"
                  value={form.usageLimit}
                  onChange={onChange}
                  placeholder="Unlimited"
                  className={inputClass}
                />
              </Field>

              <Field label="Uses per customer">
                <input
                  type="number"
                  min="1"
                  name="perUserLimit"
                  value={form.perUserLimit}
                  onChange={onChange}
                  className={inputClass}
                />
              </Field>

              <Field label="Valid from">
                <input
                  type="datetime-local"
                  name="validFrom"
                  value={form.validFrom}
                  onChange={onChange}
                  className={inputClass}
                />
              </Field>

              <Field label="Valid till">
                <input
                  type="datetime-local"
                  name="validTill"
                  value={form.validTill}
                  onChange={onChange}
                  className={inputClass}
                />
              </Field>
            </div>
          </Section>

          <Section title="Applicable books">
            <Switch
              name="appliesToAllBooks"
              checked={form.appliesToAllBooks}
              onChange={onChange}
              title="Apply to all books"
              hint="Turn off to choose specific books."
            />

            {!form.appliesToAllBooks && (
              <div className="rounded-2xl border border-orange-100 p-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400"
                    />
                    <input
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      placeholder="Search books"
                      className={`${inputClass} pl-9`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setField(
                        "applicableBooks",
                        books.map((b) => b._id).filter(Boolean)
                      )
                    }
                    className="rounded-xl border border-orange-200 px-3 py-2 text-xs font-bold text-orange-700 hover:bg-orange-50"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={() => setField("applicableBooks", [])}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Clear
                  </button>
                </div>

                <p className="mt-2 text-xs font-bold text-orange-700">
                  {form.applicableBooks.length} selected
                </p>

                <div className="mt-2 grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {booksLoading ? (
                    <p className="col-span-full py-6 text-center text-sm text-slate-500">
                      Loading books...
                    </p>
                  ) : filteredBooks.length === 0 ? (
                    <p className="col-span-full py-6 text-center text-sm text-slate-500">
                      No books found.
                    </p>
                  ) : (
                    filteredBooks.map((book) => {
                      const selected = form.applicableBooks.includes(
                        book._id
                      );

                      return (
                        <button
                          key={book._id}
                          type="button"
                          onClick={() => toggleBook(book._id)}
                          className={`flex items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                            selected
                              ? "border-orange-400 bg-orange-50"
                              : "border-slate-200 hover:border-orange-300"
                          }`}
                        >
                          {book.coverPageUrl ? (
                            <img
                              src={book.coverPageUrl}
                              alt=""
                              className="h-12 w-9 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-9 shrink-0 items-center justify-center rounded bg-orange-100 text-orange-500">
                              <BookOpen size={15} />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {book.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              ₹{book.price}
                            </p>
                          </div>

                          {selected && (
                            <Check
                              size={16}
                              className="shrink-0 text-orange-600"
                            />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </Section>

          <Section title="Visibility">
            <Switch
              name="showOnPaymentPage"
              checked={form.showOnPaymentPage}
              onChange={onChange}
              title="Show on payment page"
              hint="Lists this coupon on checkout for eligible books and prices, so customers can apply it in one click."
            />
            <Switch
              name="isActive"
              checked={form.isActive}
              onChange={onChange}
              title="Coupon active"
              hint="Inactive coupons cannot be used at all."
            />
          </Section>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-orange-100 bg-orange-50/50 px-6 py-4">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-orange-300/50 transition hover:bg-orange-600 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Create coupon
          </button>
        </div>
      </form>
    </div>
  );
};

/* =====================================================
   FORM PRIMITIVES
===================================================== */

const Section = ({ title, children }) => (
  <section className="space-y-4">
    <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-orange-600">
      <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
      {title}
    </h3>
    {children}
  </section>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-bold text-slate-700">
      {label}
    </span>
    {children}
  </label>
);

const Switch = ({ name, checked, onChange, title, hint }) => (
  <label
    className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 transition ${
      checked
        ? "border-orange-300 bg-orange-50"
        : "border-slate-200 hover:border-orange-200"
    }`}
  >
    <span className="min-w-0">
      <span className="block text-sm font-bold text-slate-900">{title}</span>
      <span className="mt-0.5 block text-xs text-slate-500">{hint}</span>
    </span>

    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="peer sr-only"
    />

    <span
      aria-hidden="true"
      className="relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition peer-checked:bg-orange-500 peer-focus-visible:ring-4 peer-focus-visible:ring-orange-200 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-all peer-checked:after:translate-x-5"
    />
  </label>
);

export default AdminCouponDashboard;
