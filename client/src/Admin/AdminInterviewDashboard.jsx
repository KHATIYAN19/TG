import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import {
  Archive,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileCheck2,
  Filter,
  RefreshCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import BASE_URL from "../utils/Url.js";

const STATUS_FILTERS = [
  {
    value: "",
    label: "All",
  },
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "ACCEPTED",
    label: "Accepted",
  },
  {
    value: "PUBLISHED",
    label: "Published",
  },
  {
    value: "ARCHIVED",
    label: "Rejected / Archived",
  },
];

const STATUS_STYLES = {
  PENDING:
    "border-amber-200 bg-amber-50 text-amber-700",

  ACCEPTED:
    "border-blue-200 bg-blue-50 text-blue-700",

  PUBLISHED:
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  ARCHIVED:
    "border-red-200 bg-red-50 text-red-700",
};

const RESULT_STYLES = {
  SELECTED:
    "bg-emerald-50 text-emerald-700",

  REJECTED:
    "bg-red-50 text-red-700",

  WAITING:
    "bg-amber-50 text-amber-700",

  OFFER_DECLINED:
    "bg-purple-50 text-purple-700",

  NOT_DISCLOSED:
    "bg-slate-100 text-slate-600",
};

const getStatusLabel = (status) => {
  if (status === "ARCHIVED") {
    return "Rejected / Archived";
  }

  return status
    ?.replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return date.toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};

const AdminInterviewDashboard =
  () => {
    const navigate =
      useNavigate();

    /*
    |--------------------------------------------------------------------------
    | Change this selector only if your Redux token is stored somewhere else.
    |--------------------------------------------------------------------------
    */

    const token =
      useSelector(
        (state) =>
          state.auth?.token ||
          state.user?.token ||
          state.token ||
          ""
      );

    const API_BASE =
      useMemo(
        () =>
          `${BASE_URL.replace(
            /\/$/,
            ""
          )}/api/interview`,
        []
      );

    const [
      interviews,
      setInterviews,
    ] = useState([]);

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      statsLoading,
      setStatsLoading,
    ] = useState(true);

    const [stats, setStats] =
      useState({
        total: 0,
        pending: 0,
        accepted: 0,
        published: 0,
        archived: 0,
        submissionsLast30Days: 0,
        suspectedSpam: 0,
      });

    const [
      pagination,
      setPagination,
    ] = useState({
      page: 1,
      limit: 25,
      total: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    const [page, setPage] =
      useState(1);

    const [
      status,
      setStatus,
    ] = useState("");

    const [
      search,
      setSearch,
    ] = useState("");

    const [
      debouncedSearch,
      setDebouncedSearch,
    ] = useState("");

    const [
      company,
      setCompany,
    ] = useState("");

    const [
      role,
      setRole,
    ] = useState("");

    const [
      spamOnly,
      setSpamOnly,
    ] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | SEARCH DEBOUNCE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
      const timer =
        window.setTimeout(
          () => {
            setDebouncedSearch(
              search.trim()
            );

            setPage(1);
          },
          400
        );

      return () =>
        window.clearTimeout(
          timer
        );
    }, [search]);

    /*
    |--------------------------------------------------------------------------
    | FETCH STATS
    |--------------------------------------------------------------------------
    */

    const fetchStats =
      useCallback(
        async () => {
          try {
            setStatsLoading(
              true
            );

            const response =
              await fetch(
                `${API_BASE}/admin/stats`,
                {
                  headers: {
                    Authorization:
                      `Bearer ${token}`,
                  },
                }
              );

            const data =
              await response.json();

            if (!response.ok) {
              throw new Error(
                data?.message ||
                  "Unable to fetch interview statistics."
              );
            }

            setStats(
              data?.data || {}
            );
          } catch (error) {
            console.error(
              error
            );

            toast.error(
              error.message ||
                "Unable to load interview statistics."
            );
          } finally {
            setStatsLoading(
              false
            );
          }
        },
        [API_BASE, token]
      );

    /*
    |--------------------------------------------------------------------------
    | FETCH INTERVIEWS
    |--------------------------------------------------------------------------
    */

    const fetchInterviews =
      useCallback(
        async () => {
          try {
            setLoading(true);

            const params =
              new URLSearchParams();

            params.set(
              "page",
              String(page)
            );

            if (status) {
              params.set(
                "status",
                status
              );
            }

            if (
              debouncedSearch
            ) {
              params.set(
                "q",
                debouncedSearch
              );
            }

            if (
              company.trim()
            ) {
              params.set(
                "company",
                company.trim()
              );
            }

            if (
              role.trim()
            ) {
              params.set(
                "role",
                role.trim()
              );
            }

            if (spamOnly) {
              params.set(
                "spamOnly",
                "true"
              );
            }

            const response =
              await fetch(
                `${API_BASE}/admin/all?${params.toString()}`,
                {
                  headers: {
                    Authorization:
                      `Bearer ${token}`,
                  },
                }
              );

            const data =
              await response.json();

            if (!response.ok) {
              throw new Error(
                data?.message ||
                  "Unable to fetch interviews."
              );
            }

            setInterviews(
              Array.isArray(
                data?.data
              )
                ? data.data
                : []
            );

            setPagination(
              data?.pagination ||
                {
                  page,
                  limit: 25,
                  total: 0,
                  totalPages: 1,
                  hasNextPage:
                    false,
                  hasPreviousPage:
                    false,
                }
            );
          } catch (error) {
            console.error(
              error
            );

            toast.error(
              error.message ||
                "Unable to load interviews."
            );
          } finally {
            setLoading(false);
          }
        },
        [
          API_BASE,
          token,
          page,
          status,
          debouncedSearch,
          company,
          role,
          spamOnly,
        ]
      );

    useEffect(() => {
      if (!token) {
        return;
      }

      fetchStats();
    }, [
      token,
      fetchStats,
    ]);

    useEffect(() => {
      if (!token) {
        return;
      }

      fetchInterviews();
    }, [
      token,
      fetchInterviews,
    ]);

    /*
    |--------------------------------------------------------------------------
    | FILTER HELPERS
    |--------------------------------------------------------------------------
    */

    const changeStatus = (
      value
    ) => {
      setStatus(value);
      setPage(1);
    };

    const resetFilters =
      () => {
        setSearch("");
        setDebouncedSearch(
          ""
        );

        setCompany("");
        setRole("");
        setStatus("");
        setSpamOnly(false);
        setPage(1);
      };

    const refreshEverything =
      async () => {
        await Promise.all([
          fetchStats(),
          fetchInterviews(),
        ]);

        toast.success(
          "Interview dashboard refreshed."
        );
      };

    const statCards = [
      {
        label:
          "Total Interviews",
        value: stats.total,
        icon: Users,
        description:
          "All submissions",
      },
      {
        label: "Pending",
        value:
          stats.pending,
        icon: Clock3,
        description:
          "Awaiting review",
      },
      {
        label: "Accepted",
        value:
          stats.accepted,
        icon: FileCheck2,
        description:
          "Approved, not published",
      },
      {
        label: "Published",
        value:
          stats.published,
        icon: CheckCircle2,
        description:
          "Visible publicly",
      },
      {
        label:
          "Rejected / Archived",
        value:
          stats.archived,
        icon: Archive,
        description:
          "Not publicly visible",
      },
      {
        label:
          "Suspected Spam",
        value:
          stats.suspectedSpam,
        icon: ShieldAlert,
        description:
          "Pending spam review",
      },
    ];

    return (
      <>
        <Helmet>
          <title>
            Interview Admin |
            TargetTrek
          </title>

          <meta
            name="robots"
            content="noindex,nofollow"
          />
        </Helmet>

        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1500px]">
            {/* HEADER */}

            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-blue-600">
                  <Sparkles className="h-4 w-4" />
                  TargetTrek Admin
                </div>

                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Interview
                  Experiences
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Review,
                  moderate, edit and
                  publish interview
                  experiences submitted
                  by users.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  refreshEverything
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {/* STATS */}

            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {statCards.map(
                ({
                  label,
                  value,
                  icon: Icon,
                  description,
                }) => (
                  <button
                    key={label}
                    type="button"
                    disabled={
                      statsLoading
                    }
                    onClick={() => {
                      if (
                        label ===
                        "Pending"
                      ) {
                        changeStatus(
                          "PENDING"
                        );
                      }

                      if (
                        label ===
                        "Accepted"
                      ) {
                        changeStatus(
                          "ACCEPTED"
                        );
                      }

                      if (
                        label ===
                        "Published"
                      ) {
                        changeStatus(
                          "PUBLISHED"
                        );
                      }

                      if (
                        label ===
                        "Rejected / Archived"
                      ) {
                        changeStatus(
                          "ARCHIVED"
                        );
                      }

                      if (
                        label ===
                        "Total Interviews"
                      ) {
                        changeStatus(
                          ""
                        );
                      }

                      if (
                        label ===
                        "Suspected Spam"
                      ) {
                        setSpamOnly(
                          true
                        );
                        setStatus(
                          ""
                        );
                        setPage(1);
                      }
                    }}
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md disabled:cursor-default"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>

                    <div className="text-2xl font-black text-slate-950">
                      {statsLoading
                        ? "..."
                        : value ??
                          0}
                    </div>

                    <div className="mt-1 text-sm font-bold text-slate-700">
                      {label}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      {description}
                    </div>
                  </button>
                )
              )}
            </div>

            {/* SECONDARY STAT */}

            <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">
              <p className="text-sm font-medium text-blue-900">
                Submissions in the
                last 30 days:{" "}
                <span className="font-black">
                  {stats
                    .submissionsLast30Days ||
                    0}
                </span>
              </p>
            </div>

            {/* FILTERS */}

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />

                <h2 className="font-bold text-slate-900">
                  Search & Filters
                </h2>
              </div>

              <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">
                {/* SEARCH */}

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    value={search}
                    onChange={(
                      event
                    ) =>
                      setSearch(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Search title, company, role, user email, mobile..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <input
                  value={company}
                  onChange={(
                    event
                  ) => {
                    setCompany(
                      event.target
                        .value
                    );

                    setPage(1);
                  }}
                  placeholder="Company"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

                <input
                  value={role}
                  onChange={(
                    event
                  ) => {
                    setRole(
                      event.target
                        .value
                    );

                    setPage(1);
                  }}
                  placeholder="Role"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              </div>

              {/* STATUS TABS */}

              <div className="mt-5 flex flex-wrap gap-2">
                {STATUS_FILTERS.map(
                  (item) => (
                    <button
                      key={
                        item.label
                      }
                      type="button"
                      onClick={() =>
                        changeStatus(
                          item.value
                        )
                      }
                      className={`
                        rounded-full border px-4 py-2 text-xs font-bold transition

                        ${
                          status ===
                          item.value
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
                        }
                      `}
                    >
                      {
                        item.label
                      }
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSpamOnly(
                      (
                        previous
                      ) =>
                        !previous
                    );

                    setPage(1);
                  }}
                  className={`
                    rounded-full border px-4 py-2 text-xs font-bold transition

                    ${
                      spamOnly
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    }
                  `}
                >
                  Suspected Spam
                </button>
              </div>
            </section>

            {/* TABLE */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Interview
                    Submissions
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {
                      pagination.total
                    }{" "}
                    matching
                    submissions
                  </p>
                </div>

                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                  Page{" "}
                  {pagination.page ||
                    page}{" "}
                  of{" "}
                  {Math.max(
                    pagination.totalPages ||
                      1,
                    1
                  )}
                </span>
              </div>

              {loading ? (
                <div className="flex min-h-[350px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                    <p className="mt-4 text-sm text-slate-500">
                      Loading
                      interviews...
                    </p>
                  </div>
                </div>
              ) : interviews.length ===
                0 ? (
                <div className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">
                  <Search className="h-10 w-10 text-slate-300" />

                  <h3 className="mt-4 font-bold text-slate-800">
                    No interviews
                    found
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Try changing your
                    filters or search
                    query.
                  </p>
                </div>
              ) : (
                <>
                  {/* DESKTOP TABLE */}

                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[1050px]">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          <th className="px-5 py-4">
                            Interview
                          </th>

                          <th className="px-5 py-4">
                            Candidate
                          </th>

                          <th className="px-5 py-4">
                            Status
                          </th>

                          <th className="px-5 py-4">
                            Result
                          </th>

                          <th className="px-5 py-4">
                            Spam
                          </th>

                          <th className="px-5 py-4">
                            Submitted
                          </th>

                          <th className="px-5 py-4 text-right">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {interviews.map(
                          (
                            interview
                          ) => {
                            const spamScore =
                              interview
                                ?.submissionMeta
                                ?.spamScore ||
                              0;

                            return (
                              <tr
                                key={
                                  interview._id
                                }
                                onClick={() =>
                                  navigate(
                                    `/admin/interviews/${interview._id}`
                                  )
                                }
                                className="cursor-pointer transition hover:bg-blue-50/30"
                              >
                                <td className="max-w-[340px] px-5 py-4">
                                  <p className="truncate font-bold text-slate-900">
                                    {
                                      interview.title
                                    }
                                  </p>

                                  <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-slate-500">
                                    <span>
                                      {
                                        interview
                                          ?.company
                                          ?.name
                                      }
                                    </span>

                                    <span>
                                      •
                                    </span>

                                    <span>
                                      {
                                        interview
                                          ?.role
                                          ?.title
                                      }
                                    </span>
                                  </div>
                                </td>

                                <td className="px-5 py-4">
                                  <p className="text-sm font-semibold text-slate-700">
                                    {interview
                                      ?.user
                                      ?.name ||
                                      "-"}
                                  </p>

                                  <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500">
                                    {interview
                                      ?.user
                                      ?.email ||
                                      "-"}
                                  </p>
                                </td>

                                <td className="px-5 py-4">
                                  <span
                                    className={`
                                      inline-flex rounded-full border px-2.5 py-1
                                      text-[11px] font-bold

                                      ${
                                        STATUS_STYLES[
                                          interview
                                            .status
                                        ] ||
                                        "border-slate-200 bg-slate-100 text-slate-600"
                                      }
                                    `}
                                  >
                                    {getStatusLabel(
                                      interview.status
                                    )}
                                  </span>
                                </td>

                                <td className="px-5 py-4">
                                  <span
                                    className={`
                                      inline-flex rounded-lg px-2.5 py-1
                                      text-[11px] font-bold

                                      ${
                                        RESULT_STYLES[
                                          interview
                                            ?.interviewInfo
                                            ?.result
                                        ] ||
                                        "bg-slate-100 text-slate-600"
                                      }
                                    `}
                                  >
                                    {interview
                                      ?.interviewInfo
                                      ?.result?.replaceAll(
                                        "_",
                                        " "
                                      ) ||
                                      "NOT DISCLOSED"}
                                  </span>
                                </td>

                                <td className="px-5 py-4">
                                  <span
                                    className={`text-sm font-bold ${
                                      spamScore >=
                                      5
                                        ? "text-red-600"
                                        : spamScore >=
                                            3
                                          ? "text-amber-600"
                                          : "text-slate-500"
                                    }`}
                                  >
                                    {
                                      spamScore
                                    }
                                  </span>
                                </td>

                                <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                                  {formatDate(
                                    interview.createdAt
                                  )}
                                </td>

                                <td className="px-5 py-4 text-right">
                                  <button
                                    type="button"
                                    onClick={(
                                      event
                                    ) => {
                                      event.stopPropagation();

                                      navigate(
                                        `/admin/interviews/${interview._id}`
                                      );
                                    }}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    Review
                                  </button>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE CARDS */}

                  <div className="divide-y divide-slate-100 lg:hidden">
                    {interviews.map(
                      (
                        interview
                      ) => (
                        <button
                          key={
                            interview._id
                          }
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/interviews/${interview._id}`
                            )
                          }
                          className="w-full p-5 text-left transition hover:bg-slate-50"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-bold text-slate-900">
                                {
                                  interview.title
                                }
                              </h3>

                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  interview
                                    ?.company
                                    ?.name
                                }{" "}
                                •{" "}
                                {
                                  interview
                                    ?.role
                                    ?.title
                                }
                              </p>
                            </div>

                            <span
                              className={`
                                shrink-0 rounded-full border px-2.5 py-1
                                text-[10px] font-bold
                                ${
                                  STATUS_STYLES[
                                    interview
                                      .status
                                  ] ||
                                  ""
                                }
                              `}
                            >
                              {getStatusLabel(
                                interview.status
                              )}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-slate-400">
                                Candidate
                              </span>

                              <p className="mt-1 font-semibold text-slate-700">
                                {interview
                                  ?.user
                                  ?.name ||
                                  "-"}
                              </p>
                            </div>

                            <div>
                              <span className="text-slate-400">
                                Submitted
                              </span>

                              <p className="mt-1 font-semibold text-slate-700">
                                {formatDate(
                                  interview.createdAt
                                )}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                </>
              )}

              {/* PAGINATION */}

              {!loading &&
                pagination.total >
                  0 && (
                  <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500">
                      Showing page{" "}
                      {
                        pagination.page
                      }{" "}
                      of{" "}
                      {Math.max(
                        pagination.totalPages,
                        1
                      )}{" "}
                      •{" "}
                      {
                        pagination.total
                      }{" "}
                      total
                    </p>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={
                          !pagination.hasPreviousPage
                        }
                        onClick={() =>
                          setPage(
                            (
                              previous
                            ) =>
                              Math.max(
                                1,
                                previous -
                                  1
                              )
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </button>

                      <button
                        type="button"
                        disabled={
                          !pagination.hasNextPage
                        }
                        onClick={() =>
                          setPage(
                            (
                              previous
                            ) =>
                              previous +
                              1
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
            </section>
          </div>
        </div>
      </>
    );
  };

export default AdminInterviewDashboard;