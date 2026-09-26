import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import BASE_URL from "../utils/Url";

const getToday = () => {
  const date = new Date();
  return date.toISOString().split("T")[0];
};

const getMonthStart = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-01`;
};

const getYearStart = () => {
  return `${new Date().getFullYear()}-01-01`;
};

const getDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split("T")[0];
};

const formatCurrency = (value, currency = "INR") => {
  const amount = Number(value || 0);

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

const formatNumber = (value) => {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
};

const formatPercentage = (value) => {
  if (value === null || value === undefined) {
    return "New";
  }

  return `${Number(value).toFixed(2)}%`;
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatShortDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(date);
};

const safeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "ALL"
    ) {
      searchParams.set(key, value);
    }
  });

  return searchParams.toString();
};

const mergeBookOptions = (current, incoming) => {
  const map = new Map();

  safeArray(current).forEach((book) => {
    if (book?.bookId) {
      map.set(String(book.bookId), book);
    }
  });

  safeArray(incoming).forEach((book) => {
    if (book?.bookId) {
      map.set(String(book.bookId), book);
    }
  });

  return Array.from(map.values());
};

const mergeAffiliateOptions = (current, incoming) => {
  const map = new Map();

  safeArray(current).forEach((affiliate) => {
    if (affiliate?.affiliateCode) {
      map.set(affiliate.affiliateCode, affiliate);
    }
  });

  safeArray(incoming).forEach((affiliate) => {
    if (affiliate?.affiliateCode) {
      map.set(affiliate.affiliateCode, affiliate);
    }
  });

  return Array.from(map.values());
};

const KpiCard = ({
  title,
  value,
  subtitle,
  tone = "blue",
}) => {
  const tones = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    green: "bg-emerald-50 border-emerald-100 text-emerald-700",
    orange: "bg-orange-50 border-orange-100 text-orange-700",
    purple: "bg-violet-50 border-violet-100 text-violet-700",
    red: "bg-red-50 border-red-100 text-red-700",
    slate: "bg-slate-50 border-slate-200 text-slate-700",
  };

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        tones[tone] || tones.blue
      }`}
    >
      <div className="text-sm font-medium opacity-80">{title}</div>

      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </div>

      {subtitle && (
        <div className="mt-2 text-xs font-medium opacity-80">{subtitle}</div>
      )}
    </div>
  );
};

const ComparisonCard = ({
  title,
  data,
  currency,
}) => {
  const revenueGrowth = data?.change?.revenuePercent;
  const orderGrowth = data?.change?.ordersPercent;
  const aovGrowth = data?.change?.aovPercent;

  const Growth = ({ value }) => {
    if (value === null || value === undefined) {
      return (
        <span className="font-semibold text-blue-600">
          New
        </span>
      );
    }

    const positive = Number(value) >= 0;

    return (
      <span
        className={`font-semibold ${
          positive ? "text-emerald-600" : "text-red-600"
        }`}
      >
        {positive ? "↑" : "↓"} {Math.abs(Number(value)).toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900">{title}</h3>

      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Revenue</div>
            <div className="mt-1 font-bold text-slate-900">
              {formatCurrency(data?.current?.revenue, currency)}
            </div>
          </div>

          <Growth value={revenueGrowth} />
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">Orders</div>
              <div className="mt-1 font-bold text-slate-900">
                {formatNumber(data?.current?.orders)}
              </div>
            </div>

            <Growth value={orderGrowth} />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">AOV</div>
              <div className="mt-1 font-bold text-slate-900">
                {formatCurrency(data?.current?.aov, currency)}
              </div>
            </div>

            <Growth value={aovGrowth} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({
  title,
  description,
  children,
  right,
  className = "",
}) => {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>

          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>

        {right}
      </div>

      <div className="p-6">{children}</div>
    </section>
  );
};

const EmptyState = ({ message = "No data available" }) => {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-xl bg-slate-50 text-sm font-medium text-slate-500">
      {message}
    </div>
  );
};

const LoadingBlock = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-14 animate-pulse rounded-xl bg-slate-100"
        />
      ))}
    </div>
  );
};

const RevenueChart = ({
  data,
  currency,
  valueKey = "revenue",
  labelKey = "date",
}) => {
  const items = safeArray(data);

  const points = useMemo(() => {
    if (!items.length) return [];

    const width = 1000;
    const height = 250;
    const paddingLeft = 55;
    const paddingRight = 30;
    const paddingTop = 25;
    const paddingBottom = 45;

    const values = items.map((item) => Number(item?.[valueKey] || 0));
    const max = Math.max(...values, 1);
    const usableWidth = width - paddingLeft - paddingRight;
    const usableHeight = height - paddingTop - paddingBottom;

    return items.map((item, index) => {
      const value = Number(item?.[valueKey] || 0);

      const x =
        paddingLeft +
        (items.length === 1
          ? usableWidth / 2
          : (index / (items.length - 1)) * usableWidth);

      const y = paddingTop + usableHeight - (value / max) * usableHeight;

      return {
        x,
        y,
        value,
        raw: item,
      };
    });
  }, [items, valueKey]);

  if (!items.length) {
    return <EmptyState message="No revenue data for selected period" />;
  }

  const path = points
    .map((point, index) => {
      return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
    })
    .join(" ");

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <svg
          viewBox="0 0 1000 250"
          className="h-[280px] w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 1, 2, 3, 4].map((line) => {
            const y = 25 + line * 45;

            return (
              <line
                key={line}
                x1="55"
                y1={y}
                x2="970"
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            );
          })}

          {points.length > 1 && (
            <path
              d={`${path} L ${points[points.length - 1].x} 205 L ${
                points[0].x
              } 205 Z`}
              fill="url(#revenueGradient)"
            />
          )}

          <path
            d={path}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, index) => (
            <g key={`${point.x}-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4.5"
                fill="#ffffff"
                stroke="#2563eb"
                strokeWidth="3"
              />

              {(index === 0 ||
                index === points.length - 1 ||
                index % Math.max(1, Math.floor(points.length / 6)) === 0) && (
                <text
                  x={point.x}
                  y="232"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#64748b"
                >
                  {labelKey === "date"
                    ? formatShortDate(point.raw?.[labelKey])
                    : point.raw?.[labelKey]}
                </text>
              )}
            </g>
          ))}
        </svg>

        <div className="flex flex-wrap gap-2">
          {items.slice(-6).map((item, index) => (
            <div
              key={index}
              className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600"
            >
              <span className="font-medium">
                {labelKey === "date"
                  ? formatShortDate(item?.[labelKey])
                  : item?.[labelKey]}
              </span>

              <span className="ml-2 font-semibold text-blue-700">
                {formatCurrency(item?.[valueKey], currency)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HorizontalBars = ({
  data,
  labelKey,
  valueKey = "revenue",
  currency = "INR",
  formatter,
  maxItems = 12,
}) => {
  const items = safeArray(data).slice(0, maxItems);

  const maxValue = Math.max(
    ...items.map((item) => Number(item?.[valueKey] || 0)),
    1
  );

  if (!items.length) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const value = Number(item?.[valueKey] || 0);
        const percentage = Math.max((value / maxValue) * 100, 1);

        return (
          <div key={`${item?.[labelKey]}-${index}`}>
            <div className="mb-1.5 flex items-center justify-between gap-4">
              <div className="truncate text-sm font-medium text-slate-700">
                {formatter ? formatter(item) : item?.[labelKey] || "Unknown"}
              </div>

              <div className="shrink-0 text-sm font-semibold text-slate-900">
                {formatCurrency(value, currency)}
              </div>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const BookTable = ({
  books,
  currency,
  search,
  onSelectBook,
}) => {
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return safeArray(books);
    }

    return safeArray(books).filter((book) => {
      return (
        book?.title?.toLowerCase().includes(keyword) ||
        book?.category?.toLowerCase().includes(keyword) ||
        book?.slug?.toLowerCase().includes(keyword)
      );
    });
  }, [books, search]);

  if (!filtered.length) {
    return <EmptyState message="No books found" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Book</th>
            <th className="px-4 py-3 text-right">Orders</th>
            <th className="px-4 py-3 text-right">Revenue</th>
            <th className="px-4 py-3 text-right">AOV</th>
            <th className="px-4 py-3 text-right">Affiliate</th>
            <th className="px-4 py-3 text-right">Direct</th>
            <th className="px-4 py-3 text-right">Share</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((book) => (
            <tr
              key={book.bookId}
              onClick={() => onSelectBook?.(book)}
              className="cursor-pointer border-b border-slate-100 transition hover:bg-blue-50/60"
            >
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  {book.coverPageUrl ? (
                    <img
                      src={book.coverPageUrl}
                      alt={book.title}
                      className="h-12 w-9 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-9 items-center justify-center rounded bg-blue-100 text-xs font-bold text-blue-700">
                      BK
                    </div>
                  )}

                  <div>
                    <div className="max-w-[280px] font-semibold text-slate-900">
                      {book.title}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {book.category || "Uncategorized"}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-4 py-4 text-right text-sm font-medium text-slate-700">
                {formatNumber(book.orders)}
              </td>

              <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900">
                {formatCurrency(book.revenue, currency)}
              </td>

              <td className="px-4 py-4 text-right text-sm text-slate-700">
                {formatCurrency(book.aov, currency)}
              </td>

              <td className="px-4 py-4 text-right text-sm text-slate-700">
                {formatCurrency(book.affiliateRevenue, currency)}
              </td>

              <td className="px-4 py-4 text-right text-sm text-slate-700">
                {formatCurrency(book.directRevenue, currency)}
              </td>

              <td className="px-4 py-4 text-right">
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {Number(book.revenueShare || 0).toFixed(2)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AffiliateTable = ({
  affiliates,
  currency,
  search,
  onSelectAffiliate,
}) => {
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return safeArray(affiliates);
    }

    return safeArray(affiliates).filter((item) =>
      item?.affiliateCode?.toLowerCase().includes(keyword)
    );
  }, [affiliates, search]);

  if (!filtered.length) {
    return <EmptyState message="No affiliates found" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Affiliate</th>
            <th className="px-4 py-3 text-right">Orders</th>
            <th className="px-4 py-3 text-right">Revenue</th>
            <th className="px-4 py-3 text-right">AOV</th>
            <th className="px-4 py-3 text-right">Books</th>
            <th className="px-4 py-3 text-right">Share</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((affiliate) => (
            <tr
              key={affiliate.affiliateCode}
              onClick={() => onSelectAffiliate?.(affiliate)}
              className="cursor-pointer border-b border-slate-100 transition hover:bg-blue-50/60"
            >
              <td className="px-4 py-4">
                <span
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                    affiliate.affiliateCode === "DIRECT"
                      ? "bg-slate-100 text-slate-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {affiliate.affiliateCode}
                </span>
              </td>

              <td className="px-4 py-4 text-right text-sm text-slate-700">
                {formatNumber(affiliate.orders)}
              </td>

              <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900">
                {formatCurrency(affiliate.revenue, currency)}
              </td>

              <td className="px-4 py-4 text-right text-sm text-slate-700">
                {formatCurrency(affiliate.aov, currency)}
              </td>

              <td className="px-4 py-4 text-right text-sm text-slate-700">
                {formatNumber(affiliate.uniqueBooks)}
              </td>

              <td className="px-4 py-4 text-right">
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {Number(affiliate.revenueShare || 0).toFixed(2)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SummaryCards = ({
  data,
  currency,
}) => {
  const summary = data?.summary || {};
  const funnel = data?.paymentFunnel || {};

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title="Gross Revenue"
        value={formatCurrency(summary.grossRevenue, currency)}
        subtitle={`${formatNumber(summary.orders)} successful orders`}
        tone="blue"
      />

      <KpiCard
        title="Estimated Net Revenue"
        value={formatCurrency(summary.estimatedNetRevenue, currency)}
        subtitle={`${formatCurrency(
          summary.estimatedRefundAmount,
          currency
        )} refunded`}
        tone="green"
      />

      <KpiCard
        title="Average Order Value"
        value={formatCurrency(summary.aov, currency)}
        subtitle={`${formatNumber(summary.uniqueCustomers)} unique customers`}
        tone="purple"
      />

      <KpiCard
        title="Payment Success Rate"
        value={`${Number(funnel.successRate || 0).toFixed(2)}%`}
        subtitle={`${formatNumber(
          funnel.failedOrders
        )} failed payments`}
        tone="orange"
      />

      <KpiCard
        title="Affiliate Revenue"
        value={formatCurrency(summary.affiliateRevenue, currency)}
        subtitle={`${formatNumber(summary.affiliateOrders)} affiliate orders`}
        tone="blue"
      />

      <KpiCard
        title="Direct Revenue"
        value={formatCurrency(summary.directRevenue, currency)}
        subtitle={`${formatNumber(summary.directOrders)} direct orders`}
        tone="slate"
      />

      <KpiCard
        title="MRP Value"
        value={formatCurrency(summary.mrpValue, currency)}
        subtitle={`${formatCurrency(
          summary.discountVsMrp,
          currency
        )} total discount`}
        tone="purple"
      />

      <KpiCard
        title="Refunded Orders"
        value={formatNumber(summary.refundedOrders)}
        subtitle={formatCurrency(summary.estimatedRefundAmount, currency)}
        tone="red"
      />
    </div>
  );
};

const AnalyticsView = ({
  data,
  currency,
  bookSearch,
  setBookSearch,
  affiliateSearch,
  setAffiliateSearch,
  onSelectBook,
  onSelectAffiliate,
}) => {
  return (
    <div className="space-y-6">
      <SummaryCards data={data} currency={currency} />

      <div className="grid gap-5 xl:grid-cols-3">
        <ComparisonCard
          title="Previous Period"
          data={data?.comparison?.previousPeriod}
          currency={currency}
        />

        <ComparisonCard
          title="Previous Month"
          data={data?.comparison?.previousMonth}
          currency={currency}
        />

        <ComparisonCard
          title="Previous Year"
          data={data?.comparison?.previousYear}
          currency={currency}
        />
      </div>

      <Section
        title="Revenue Trend"
        description="Revenue generated during the selected period"
      >
        <RevenueChart
          data={data?.revenueTrend}
          currency={currency}
        />
      </Section>

      <div className="grid gap-6 2xl:grid-cols-2">
        <Section
          title="Book Performance"
          description="Revenue contribution by book"
          right={
            <input
              value={bookSearch}
              onChange={(event) => setBookSearch(event.target.value)}
              placeholder="Search books"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 sm:w-56"
            />
          }
        >
          <BookTable
            books={data?.bookWise}
            currency={currency}
            search={bookSearch}
            onSelectBook={onSelectBook}
          />
        </Section>

        <Section
          title="Affiliate Performance"
          description="Revenue generated by each affiliate"
          right={
            <input
              value={affiliateSearch}
              onChange={(event) => setAffiliateSearch(event.target.value)}
              placeholder="Search affiliate"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 sm:w-56"
            />
          }
        >
          <AffiliateTable
            affiliates={data?.affiliateWise}
            currency={currency}
            search={affiliateSearch}
            onSelectAffiliate={onSelectAffiliate}
          />
        </Section>
      </div>
    </div>
  );
};

const BookSalesAnalytics = () => {
  const token = useSelector((state) => state.auth.token);

  const overviewAbortRef = useRef(null);
  const bookAbortRef = useRef(null);
  const affiliateAbortRef = useRef(null);

  const [activeTab, setActiveTab] = useState("overview");

  const [filters, setFilters] = useState({
    from: getMonthStart(),
    to: getToday(),
    timezone: "Asia/Kolkata",
    granularity: "day",
    currency: "INR",
    provider: "",
    method: "",
    bookId: "",
    affiliateCode: "",
  });

  const [overview, setOverview] = useState(null);
  const [bookAnalytics, setBookAnalytics] = useState(null);
  const [affiliateAnalytics, setAffiliateAnalytics] = useState(null);

  const [bookOptions, setBookOptions] = useState([]);
  const [affiliateOptions, setAffiliateOptions] = useState([]);

  const [selectedBookId, setSelectedBookId] = useState("");
  const [selectedAffiliateCode, setSelectedAffiliateCode] = useState("");

  const [bookSearch, setBookSearch] = useState("");
  const [affiliateSearch, setAffiliateSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [bookLoading, setBookLoading] = useState(false);
  const [affiliateLoading, setAffiliateLoading] = useState(false);

  const [error, setError] = useState("");
  const [bookError, setBookError] = useState("");
  const [affiliateError, setAffiliateError] = useState("");

  const currency = filters.currency || "INR";

  const request = useCallback(
    async (url, signal) => {
      if (!token) {
        throw new Error("Admin authentication token is missing");
      }

      const response = await fetch(url, {
        method: "GET",
        signal,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      let body = null;

      try {
        body = await response.json();
      } catch {
        body = null;
      }

      if (!response.ok) {
        throw new Error(
          body?.message || `Request failed with status ${response.status}`
        );
      }

      if (body?.success === false) {
        throw new Error(body?.message || "Request failed");
      }

      return body?.data ?? body;
    },
    [token]
  );

  const baseQuery = useMemo(() => {
    return {
      from: filters.from,
      to: filters.to,
      timezone: filters.timezone,
      granularity: filters.granularity,
      currency: filters.currency,
      provider: filters.provider,
      method: filters.method,
      bookId: filters.bookId,
      affiliateCode: filters.affiliateCode,
    };
  }, [filters]);

  const fetchOverview = useCallback(async () => {
    if (!token) return;

    if (overviewAbortRef.current) {
      overviewAbortRef.current.abort();
    }

    const controller = new AbortController();
    overviewAbortRef.current = controller;

    setLoading(true);
    setError("");

    try {
      const query = buildQueryString(baseQuery);

      const url = `${BASE_URL}/api/admin/analytics/sales${
        query ? `?${query}` : ""
      }`;

      const data = await request(url, controller.signal);

      setOverview(data);

      setBookOptions((current) =>
        mergeBookOptions(current, data?.bookWise)
      );

      setAffiliateOptions((current) =>
        mergeAffiliateOptions(current, data?.affiliateWise)
      );

      if (!selectedBookId && data?.bookWise?.length) {
        setSelectedBookId(String(data.bookWise[0].bookId));
      }

      const firstAffiliate = safeArray(data?.affiliateWise).find(
        (item) => item?.affiliateCode && item.affiliateCode !== "DIRECT"
      );

      if (!selectedAffiliateCode && firstAffiliate) {
        setSelectedAffiliateCode(firstAffiliate.affiliateCode);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message || "Unable to load analytics");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [
    token,
    baseQuery,
    request,
    selectedBookId,
    selectedAffiliateCode,
  ]);

  const fetchBookAnalytics = useCallback(async () => {
    if (!token || !selectedBookId) {
      setBookAnalytics(null);
      return;
    }

    if (bookAbortRef.current) {
      bookAbortRef.current.abort();
    }

    const controller = new AbortController();
    bookAbortRef.current = controller;

    setBookLoading(true);
    setBookError("");

    try {
      const query = buildQueryString({
        from: filters.from,
        to: filters.to,
        timezone: filters.timezone,
        granularity: filters.granularity,
        currency: filters.currency,
        provider: filters.provider,
        method: filters.method,
        affiliateCode: filters.affiliateCode,
      });

      const url = `${BASE_URL}/api/admin/analytics/sales/books/${selectedBookId}${
        query ? `?${query}` : ""
      }`;

      const data = await request(url, controller.signal);

      setBookAnalytics(data);
    } catch (err) {
      if (err.name !== "AbortError") {
        setBookError(err.message || "Unable to load book analytics");
      }
    } finally {
      if (!controller.signal.aborted) {
        setBookLoading(false);
      }
    }
  }, [
    token,
    selectedBookId,
    filters.from,
    filters.to,
    filters.timezone,
    filters.granularity,
    filters.currency,
    filters.provider,
    filters.method,
    filters.affiliateCode,
    request,
  ]);

  const fetchAffiliateAnalytics = useCallback(async () => {
    if (!token || !selectedAffiliateCode) {
      setAffiliateAnalytics(null);
      return;
    }

    if (affiliateAbortRef.current) {
      affiliateAbortRef.current.abort();
    }

    const controller = new AbortController();
    affiliateAbortRef.current = controller;

    setAffiliateLoading(true);
    setAffiliateError("");

    try {
      const query = buildQueryString({
        from: filters.from,
        to: filters.to,
        timezone: filters.timezone,
        granularity: filters.granularity,
        currency: filters.currency,
        provider: filters.provider,
        method: filters.method,
        bookId: filters.bookId,
      });

      const url = `${BASE_URL}/api/admin/analytics/sales/affiliates/${encodeURIComponent(
        selectedAffiliateCode
      )}${query ? `?${query}` : ""}`;

      const data = await request(url, controller.signal);

      setAffiliateAnalytics(data);
    } catch (err) {
      if (err.name !== "AbortError") {
        setAffiliateError(
          err.message || "Unable to load affiliate analytics"
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setAffiliateLoading(false);
      }
    }
  }, [
    token,
    selectedAffiliateCode,
    filters.from,
    filters.to,
    filters.timezone,
    filters.granularity,
    filters.currency,
    filters.provider,
    filters.method,
    filters.bookId,
    request,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOverview();
    }, 350);

    return () => {
      clearTimeout(timer);
    };
  }, [fetchOverview]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookAnalytics();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchBookAnalytics]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAffiliateAnalytics();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchAffiliateAnalytics]);

  useEffect(() => {
    return () => {
      overviewAbortRef.current?.abort();
      bookAbortRef.current?.abort();
      affiliateAbortRef.current?.abort();
    };
  }, []);

  const updateFilter = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const applyPreset = (preset) => {
    const today = getToday();

    if (preset === "today") {
      setFilters((current) => ({
        ...current,
        from: today,
        to: today,
        granularity: "hour",
      }));

      return;
    }

    if (preset === "7d") {
      setFilters((current) => ({
        ...current,
        from: getDaysAgo(6),
        to: today,
        granularity: "day",
      }));

      return;
    }

    if (preset === "30d") {
      setFilters((current) => ({
        ...current,
        from: getDaysAgo(29),
        to: today,
        granularity: "day",
      }));

      return;
    }

    if (preset === "mtd") {
      setFilters((current) => ({
        ...current,
        from: getMonthStart(),
        to: today,
        granularity: "day",
      }));

      return;
    }

    if (preset === "ytd") {
      setFilters((current) => ({
        ...current,
        from: getYearStart(),
        to: today,
        granularity: "month",
      }));
    }
  };

  const resetFilters = () => {
    setFilters({
      from: getMonthStart(),
      to: getToday(),
      timezone: "Asia/Kolkata",
      granularity: "day",
      currency: "INR",
      provider: "",
      method: "",
      bookId: "",
      affiliateCode: "",
    });
  };

  const refreshAll = async () => {
    await Promise.allSettled([
      fetchOverview(),
      fetchBookAnalytics(),
      fetchAffiliateAnalytics(),
    ]);
  };

  const selectBook = (book) => {
    if (!book?.bookId) return;

    setSelectedBookId(String(book.bookId));
    setActiveTab("books");
  };

  const selectAffiliate = (affiliate) => {
    if (!affiliate?.affiliateCode) return;

    setSelectedAffiliateCode(affiliate.affiliateCode);
    setActiveTab("affiliates");
  };

  const escapeCsv = (value) => {
    if (value === null || value === undefined) return "";

    const stringValue = String(value).replace(/"/g, '""');

    return `"${stringValue}"`;
  };

  const downloadCsv = () => {
    let rows = [];
    let filename = "sales-analytics.csv";

    if (activeTab === "books") {
      rows = [
        [
          "Book",
          "Orders",
          "Revenue",
          "AOV",
          "Affiliate Revenue",
          "Direct Revenue",
        ],
        ...safeArray(bookAnalytics?.bookWise).map((item) => [
          item.title,
          item.orders,
          item.revenue,
          item.aov,
          item.affiliateRevenue,
          item.directRevenue,
        ]),
      ];

      filename = "book-sales-analytics.csv";
    } else if (activeTab === "affiliates") {
      rows = [
        ["Affiliate", "Orders", "Revenue", "AOV", "Unique Books"],
        ...safeArray(affiliateAnalytics?.affiliateWise).map((item) => [
          item.affiliateCode,
          item.orders,
          item.revenue,
          item.aov,
          item.uniqueBooks,
        ]),
      ];

      filename = "affiliate-sales-analytics.csv";
    } else {
      rows = [
        [
          "Book",
          "Orders",
          "Revenue",
          "AOV",
          "Affiliate Revenue",
          "Direct Revenue",
          "Revenue Share",
        ],
        ...safeArray(overview?.bookWise).map((item) => [
          item.title,
          item.orders,
          item.revenue,
          item.aov,
          item.affiliateRevenue,
          item.directRevenue,
          item.revenueShare,
        ]),
      ];
    }

    if (rows.length <= 1) return;

    const csv = rows
      .map((row) => row.map((value) => escapeCsv(value)).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  };

  const tabs = [
    {
      key: "overview",
      label: "Overview",
    },
    {
      key: "books",
      label: "Book Analytics",
    },
    {
      key: "affiliates",
      label: "Affiliate Analytics",
    },
    {
      key: "payments",
      label: "Payments",
    },
    {
      key: "attribution",
      label: "Attribution",
    },
    {
      key: "time",
      label: "Time Analytics",
    },
  ];

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            <h2 className="text-lg font-bold">Authentication required</h2>

            <p className="mt-2 text-sm">
              Admin authentication token is not available. Please log in again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 mt-14">
      <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
              Admin Dashboard
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Book Sales Analytics
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Revenue, books, affiliates, payments, campaigns and sales
              performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={downloadCsv}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Export CSV
            </button>

            <button
              onClick={refreshAll}
              disabled={loading || bookLoading || affiliateLoading}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading || bookLoading || affiliateLoading
                ? "Refreshing..."
                : "Refresh Data"}
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex flex-wrap gap-2">
              {[
                ["today", "Today"],
                ["7d", "Last 7 Days"],
                ["30d", "Last 30 Days"],
                ["mtd", "Month To Date"],
                ["ytd", "Year To Date"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {label}
                </button>
              ))}

              <button
                onClick={resetFilters}
                className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                From
              </label>

              <input
                type="date"
                value={filters.from}
                max={filters.to}
                onChange={(event) => updateFilter("from", event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                To
              </label>

              <input
                type="date"
                value={filters.to}
                min={filters.from}
                onChange={(event) => updateFilter("to", event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Group By
              </label>

              <select
                value={filters.granularity}
                onChange={(event) =>
                  updateFilter("granularity", event.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="hour">Hourly</option>
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Book
              </label>

              <select
                value={filters.bookId}
                onChange={(event) =>
                  updateFilter("bookId", event.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="">All Books</option>

                {bookOptions.map((book) => (
                  <option key={book.bookId} value={book.bookId}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Affiliate
              </label>

              <select
                value={filters.affiliateCode}
                onChange={(event) =>
                  updateFilter("affiliateCode", event.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="">All Affiliates</option>

                {affiliateOptions.map((affiliate) => (
                  <option
                    key={affiliate.affiliateCode}
                    value={affiliate.affiliateCode}
                  >
                    {affiliate.affiliateCode}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Provider
              </label>

              <select
                value={filters.provider}
                onChange={(event) =>
                  updateFilter("provider", event.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="">All Providers</option>
                <option value="PayU">PayU</option>
                <option value="Cashfree">Cashfree</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Payment Method
              </label>

              <select
                value={filters.method}
                onChange={(event) =>
                  updateFilter("method", event.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="">All Methods</option>
                <option value="UPI">UPI</option>
                <option value="CC">Credit Card</option>
                <option value="DC">Debit Card</option>
                <option value="NB">Net Banking</option>
                <option value="WALLET">Wallet</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Currency
              </label>

              <select
                value={filters.currency}
                onChange={(event) =>
                  updateFilter("currency", event.target.value)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            <span>
              Period:{" "}
              <strong className="text-slate-700">
                {formatDate(filters.from)} → {formatDate(filters.to)}
              </strong>
            </span>

            <span>•</span>

            <span>
              Timezone:{" "}
              <strong className="text-slate-700">{filters.timezone}</strong>
            </span>

            <span>•</span>

            <span>
              Auto refresh on filter change
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <div className="flex min-w-max gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading && !overview ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <LoadingBlock />
          </div>
        ) : (
          <>
            {activeTab === "overview" && overview && (
              <AnalyticsView
                data={overview}
                currency={currency}
                bookSearch={bookSearch}
                setBookSearch={setBookSearch}
                affiliateSearch={affiliateSearch}
                setAffiliateSearch={setAffiliateSearch}
                onSelectBook={selectBook}
                onSelectAffiliate={selectAffiliate}
              />
            )}

            {activeTab === "books" && (
              <div className="space-y-6">
                <Section
                  title="Book Drill-down"
                  description="Select a book to inspect its detailed sales performance"
                  right={
                    <select
                      value={selectedBookId}
                      onChange={(event) =>
                        setSelectedBookId(event.target.value)
                      }
                      className="min-w-[280px] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="">Select Book</option>

                      {bookOptions.map((book) => (
                        <option key={book.bookId} value={book.bookId}>
                          {book.title}
                        </option>
                      ))}
                    </select>
                  }
                >
                  {bookError ? (
                    <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                      {bookError}
                    </div>
                  ) : bookLoading ? (
                    <LoadingBlock />
                  ) : bookAnalytics ? (
                    <SummaryCards data={bookAnalytics} currency={currency} />
                  ) : (
                    <EmptyState message="Select a book to view analytics" />
                  )}
                </Section>

                {bookAnalytics && !bookLoading && (
                  <>
                    <Section
                      title="Book Revenue Trend"
                      description="Revenue movement for the selected book"
                    >
                      <RevenueChart
                        data={bookAnalytics.revenueTrend}
                        currency={currency}
                      />
                    </Section>

                    <div className="grid gap-6 xl:grid-cols-3">
                      <ComparisonCard
                        title="Previous Period"
                        data={bookAnalytics?.comparison?.previousPeriod}
                        currency={currency}
                      />

                      <ComparisonCard
                        title="Previous Month"
                        data={bookAnalytics?.comparison?.previousMonth}
                        currency={currency}
                      />

                      <ComparisonCard
                        title="Previous Year"
                        data={bookAnalytics?.comparison?.previousYear}
                        currency={currency}
                      />
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                      <Section
                        title="Affiliate Contribution"
                        description="Affiliates generating revenue for this book"
                      >
                        <HorizontalBars
                          data={bookAnalytics.affiliateWise}
                          labelKey="affiliateCode"
                          currency={currency}
                        />
                      </Section>

                      <Section
                        title="Payment Methods"
                        description="Payment method performance for this book"
                      >
                        <HorizontalBars
                          data={bookAnalytics.paymentMethods}
                          labelKey="method"
                          currency={currency}
                        />
                      </Section>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "affiliates" && (
              <div className="space-y-6">
                <Section
                  title="Affiliate Drill-down"
                  description="Inspect revenue and book performance for one affiliate"
                  right={
                    <select
                      value={selectedAffiliateCode}
                      onChange={(event) =>
                        setSelectedAffiliateCode(event.target.value)
                      }
                      className="min-w-[260px] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="">Select Affiliate</option>

                      {affiliateOptions.map((affiliate) => (
                        <option
                          key={affiliate.affiliateCode}
                          value={affiliate.affiliateCode}
                        >
                          {affiliate.affiliateCode}
                        </option>
                      ))}
                    </select>
                  }
                >
                  {affiliateError ? (
                    <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                      {affiliateError}
                    </div>
                  ) : affiliateLoading ? (
                    <LoadingBlock />
                  ) : affiliateAnalytics ? (
                    <SummaryCards
                      data={affiliateAnalytics}
                      currency={currency}
                    />
                  ) : (
                    <EmptyState message="Select an affiliate to view analytics" />
                  )}
                </Section>

                {affiliateAnalytics && !affiliateLoading && (
                  <>
                    <Section
                      title="Affiliate Revenue Trend"
                      description={`Revenue generated through ${
                        selectedAffiliateCode || "selected affiliate"
                      }`}
                    >
                      <RevenueChart
                        data={affiliateAnalytics.revenueTrend}
                        currency={currency}
                      />
                    </Section>

                    <div className="grid gap-6 xl:grid-cols-3">
                      <ComparisonCard
                        title="Previous Period"
                        data={affiliateAnalytics?.comparison?.previousPeriod}
                        currency={currency}
                      />

                      <ComparisonCard
                        title="Previous Month"
                        data={affiliateAnalytics?.comparison?.previousMonth}
                        currency={currency}
                      />

                      <ComparisonCard
                        title="Previous Year"
                        data={affiliateAnalytics?.comparison?.previousYear}
                        currency={currency}
                      />
                    </div>

                    <Section
                      title="Books Sold By Affiliate"
                      description="Books contributing to this affiliate's revenue"
                    >
                      <BookTable
                        books={affiliateAnalytics.bookWise}
                        currency={currency}
                        search={bookSearch}
                        onSelectBook={selectBook}
                      />
                    </Section>
                  </>
                )}
              </div>
            )}

            {activeTab === "payments" && overview && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  <KpiCard
                    title="Total Attempts"
                    value={formatNumber(
                      overview?.paymentFunnel?.totalOrders
                    )}
                    tone="slate"
                  />

                  <KpiCard
                    title="Successful"
                    value={formatNumber(
                      overview?.paymentFunnel?.successfulOrders
                    )}
                    tone="green"
                  />

                  <KpiCard
                    title="Failed"
                    value={formatNumber(
                      overview?.paymentFunnel?.failedOrders
                    )}
                    tone="red"
                  />

                  <KpiCard
                    title="Pending"
                    value={formatNumber(
                      overview?.paymentFunnel?.pendingOrders
                    )}
                    tone="orange"
                  />

                  <KpiCard
                    title="Cancelled"
                    value={formatNumber(
                      overview?.paymentFunnel?.cancelledOrders
                    )}
                    tone="slate"
                  />

                  <KpiCard
                    title="Success Rate"
                    value={`${Number(
                      overview?.paymentFunnel?.successRate || 0
                    ).toFixed(2)}%`}
                    tone="blue"
                  />
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <Section
                    title="Payment Method Performance"
                    description="Revenue and conversion by payment method"
                  >
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                            <th className="px-3 py-3">Method</th>
                            <th className="px-3 py-3 text-right">Attempts</th>
                            <th className="px-3 py-3 text-right">Success</th>
                            <th className="px-3 py-3 text-right">Failed</th>
                            <th className="px-3 py-3 text-right">Rate</th>
                            <th className="px-3 py-3 text-right">Revenue</th>
                          </tr>
                        </thead>

                        <tbody>
                          {safeArray(overview.paymentMethods).map((item) => (
                            <tr
                              key={item.method}
                              className="border-b border-slate-100"
                            >
                              <td className="px-3 py-4 font-semibold text-slate-800">
                                {item.method}
                              </td>

                              <td className="px-3 py-4 text-right text-sm">
                                {formatNumber(item.attempts)}
                              </td>

                              <td className="px-3 py-4 text-right text-sm text-emerald-600">
                                {formatNumber(item.successful)}
                              </td>

                              <td className="px-3 py-4 text-right text-sm text-red-600">
                                {formatNumber(item.failed)}
                              </td>

                              <td className="px-3 py-4 text-right text-sm font-semibold">
                                {Number(item.successRate || 0).toFixed(2)}%
                              </td>

                              <td className="px-3 py-4 text-right text-sm font-semibold">
                                {formatCurrency(item.revenue, currency)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Section>

                  <Section
                    title="Payment Verification"
                    description="Payment security and verification health"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <KpiCard
                        title="Total Paid"
                        value={formatNumber(overview?.verification?.total)}
                        tone="slate"
                      />

                      <KpiCard
                        title="Fully Verified"
                        value={formatNumber(
                          overview?.verification?.fullyVerified
                        )}
                        tone="green"
                      />

                      <KpiCard
                        title="PayU Verified"
                        value={formatNumber(
                          overview?.verification?.payuVerified
                        )}
                        tone="blue"
                      />

                      <KpiCard
                        title="Amount Verified"
                        value={formatNumber(
                          overview?.verification?.amountVerified
                        )}
                        tone="purple"
                      />

                      <KpiCard
                        title="Callback Verified"
                        value={formatNumber(
                          overview?.verification?.callbackVerified
                        )}
                        tone="blue"
                      />

                      <KpiCard
                        title="Verification Rate"
                        value={`${Number(
                          overview?.verification?.verificationRate || 0
                        ).toFixed(2)}%`}
                        tone="green"
                      />
                    </div>
                  </Section>
                </div>
              </div>
            )}

            {activeTab === "attribution" && overview && (
              <div className="grid gap-6 xl:grid-cols-3">
                <Section
                  title="UTM Sources"
                  description="Revenue by acquisition source"
                >
                  <HorizontalBars
                    data={overview?.attribution?.utmSources}
                    labelKey="source"
                    currency={currency}
                  />
                </Section>

                <Section
                  title="UTM Mediums"
                  description="Revenue by acquisition medium"
                >
                  <HorizontalBars
                    data={overview?.attribution?.utmMediums}
                    labelKey="medium"
                    currency={currency}
                  />
                </Section>

                <Section
                  title="UTM Campaigns"
                  description="Revenue by marketing campaign"
                >
                  <HorizontalBars
                    data={overview?.attribution?.utmCampaigns}
                    labelKey="campaign"
                    currency={currency}
                  />
                </Section>
              </div>
            )}

            {activeTab === "time" && overview && (
              <div className="space-y-6">
                <Section
                  title="Monthly Revenue"
                  description="Monthly revenue trend in the selected range"
                >
                  <RevenueChart
                    data={safeArray(
                      overview?.timeAnalytics?.monthlyTrend
                    ).map((item) => ({
                      ...item,
                      date: item.month,
                    }))}
                    currency={currency}
                  />
                </Section>

                <div className="grid gap-6 xl:grid-cols-2">
                  <Section
                    title="Revenue By Day Of Week"
                    description="Identify the strongest selling days"
                  >
                    <HorizontalBars
                      data={overview?.timeAnalytics?.dayOfWeek}
                      labelKey="day"
                      currency={currency}
                      formatter={(item) => {
                        const days = {
                          1: "Sunday",
                          2: "Monday",
                          3: "Tuesday",
                          4: "Wednesday",
                          5: "Thursday",
                          6: "Friday",
                          7: "Saturday",
                        };

                        return days[item.day] || `Day ${item.day}`;
                      }}
                    />
                  </Section>

                  <Section
                    title="Revenue By Hour"
                    description="Identify the strongest purchase hours"
                  >
                    <HorizontalBars
                      data={overview?.timeAnalytics?.hourOfDay}
                      labelKey="hour"
                      currency={currency}
                      maxItems={24}
                      formatter={(item) => {
                        const hour = Number(item.hour || 0);
                        const period = hour >= 12 ? "PM" : "AM";
                        const display = hour % 12 || 12;

                        return `${display}:00 ${period}`;
                      }}
                    />
                  </Section>
                </div>

                <Section
                  title="Current vs Previous Month"
                  description="Day-by-day revenue comparison"
                >
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                          <th className="px-4 py-3">Day</th>
                          <th className="px-4 py-3 text-right">
                            Current Revenue
                          </th>
                          <th className="px-4 py-3 text-right">
                            Previous Revenue
                          </th>
                          <th className="px-4 py-3 text-right">
                            Current Orders
                          </th>
                          <th className="px-4 py-3 text-right">
                            Previous Orders
                          </th>
                          <th className="px-4 py-3 text-right">
                            Revenue Growth
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {safeArray(
                          overview?.timeAnalytics?.monthDayComparison
                        ).map((item) => {
                          const growth = item.revenueGrowth;
                          const positive =
                            growth === null || Number(growth) >= 0;

                          return (
                            <tr
                              key={item.day}
                              className="border-b border-slate-100"
                            >
                              <td className="px-4 py-4 font-semibold text-slate-800">
                                Day {item.day}
                              </td>

                              <td className="px-4 py-4 text-right text-sm">
                                {formatCurrency(
                                  item.currentRevenue,
                                  currency
                                )}
                              </td>

                              <td className="px-4 py-4 text-right text-sm">
                                {formatCurrency(
                                  item.previousRevenue,
                                  currency
                                )}
                              </td>

                              <td className="px-4 py-4 text-right text-sm">
                                {formatNumber(item.currentOrders)}
                              </td>

                              <td className="px-4 py-4 text-right text-sm">
                                {formatNumber(item.previousOrders)}
                              </td>

                              <td
                                className={`px-4 py-4 text-right text-sm font-semibold ${
                                  positive
                                    ? "text-emerald-600"
                                    : "text-red-600"
                                }`}
                              >
                                {formatPercentage(growth)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Section>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookSalesAnalytics;