import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Helmet } from "react-helmet";
import toast from "react-hot-toast";

import {
  Mail,
  Plus,
  X,
  Send,
  Trash2,
  RefreshCw,
  Eye,
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  ChevronDown,
  ChevronUp,
  Search,
  Loader2,
  Code2,
  FileText,
  AlertTriangle,
  CalendarDays,
  Hash,
  Copy,
  Check,
} from "lucide-react";

import BASE_URL from "../utils/Url.js";

const CAMPAIGN_API =
  `${BASE_URL}/api/admin/email-campaigns`;

const EmailCampaignDashboard = () => {
  const [campaigns, setCampaigns] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [
    selectedCampaign,
    setSelectedCampaign,
  ] = useState(null);

  const [
    deleteCampaign,
    setDeleteCampaign,
  ] = useState(null);

  const [
    expandedCampaign,
    setExpandedCampaign,
  ] = useState(null);

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [page, setPage] =
    useState(1);

  const [
    totalPages,
    setTotalPages,
  ] = useState(1);

  const [
    totalCampaigns,
    setTotalCampaigns,
  ] = useState(0);

  const [form, setForm] =
    useState({
      subject: "",
      emails: "",
      html: "",
    });

  const getToken = () => {
    return localStorage.getItem(
      "token"
    );
  };

  const getHeaders = () => {
    const token =
      getToken();

    return {
      "Content-Type":
        "application/json",

      ...(token
        ? {
            Authorization:
              `Bearer ${token}`,
          }
        : {}),
    };
  };

  const parseEmails = (
    value
  ) => {
    if (!value) return [];

    return [
      ...new Set(
        value
          .split(/[\s,;]+/)
          .map((email) =>
            email
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      ),
    ];
  };

  const emails =
    useMemo(
      () =>
        parseEmails(
          form.emails
        ),
      [form.emails]
    );

  const invalidEmails =
    useMemo(() => {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      return emails.filter(
        (email) =>
          !emailRegex.test(
            email
          )
      );
    }, [emails]);

  const validEmails =
    useMemo(() => {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      return emails.filter(
        (email) =>
          emailRegex.test(
            email
          )
      );
    }, [emails]);

  const fetchCampaigns =
    async ({
      currentPage = page,
      currentSearch = search,
      currentStatus =
        statusFilter,
    } = {}) => {
      try {
        setLoading(true);

        const params =
          new URLSearchParams();

        params.set(
          "page",
          currentPage
        );

        params.set(
          "limit",
          "10"
        );

        if (
          currentSearch.trim()
        ) {
          params.set(
            "search",
            currentSearch.trim()
          );
        }

        if (currentStatus) {
          params.set(
            "status",
            currentStatus
          );
        }

        const response =
          await fetch(
            `${CAMPAIGN_API}?${params.toString()}`,
            {
              method: "GET",
              headers:
                getHeaders(),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to fetch campaigns."
          );
        }

        setCampaigns(
          data?.campaigns ||
            []
        );

        setTotalPages(
          data?.totalPages ||
            1
        );

        setTotalCampaigns(
          data?.total || 0
        );
      } catch (error) {
        console.error(
          error
        );

        toast.error(
          error.message ||
            "Unable to fetch campaigns."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchCampaigns();
  }, [
    page,
    statusFilter,
  ]);

  useEffect(() => {
    const timer =
      setTimeout(() => {
        setPage(1);

        fetchCampaigns({
          currentPage: 1,

          currentSearch:
            search,

          currentStatus:
            statusFilter,
        });
      }, 450);

    return () =>
      clearTimeout(timer);
  }, [search]);

  const handleInputChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setForm(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );
    };

  const resetForm = () => {
    setForm({
      subject: "",
      emails: "",
      html: "",
    });
  };

  const openCampaignForm =
    () => {
      resetForm();
      setShowForm(true);
    };

  const closeCampaignForm =
    () => {
      if (sending) return;

      setShowForm(false);
      resetForm();
    };

  const validateForm = () => {
    if (
      !form.subject.trim()
    ) {
      toast.error(
        "Please enter the email subject."
      );

      return false;
    }

    if (
      emails.length === 0
    ) {
      toast.error(
        "Please enter at least one email address."
      );

      return false;
    }

    if (
      invalidEmails.length >
      0
    ) {
      toast.error(
        `${invalidEmails.length} invalid email address${
          invalidEmails.length >
          1
            ? "es"
            : ""
        } found.`
      );

      return false;
    }

    if (
      !form.html.trim()
    ) {
      toast.error(
        "Please enter the HTML content."
      );

      return false;
    }

    return true;
  };

  const handleSendCampaign =
    async (event) => {
      event.preventDefault();

      if (
        !validateForm()
      ) {
        return;
      }

      try {
        setSending(true);

        const response =
          await fetch(
            `${CAMPAIGN_API}/send`,
            {
              method: "POST",

              headers:
                getHeaders(),

              body:
                JSON.stringify({
                  subject:
                    form.subject.trim(),

                  html:
                    form.html,

                  emails:
                    validEmails,
                }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to send campaign."
          );
        }

        toast.success(
          `Campaign completed. ${
            data?.campaign
              ?.successCount ||
            0
          } sent, ${
            data?.campaign
              ?.failedCount ||
            0
          } failed.`
        );

        setShowForm(
          false
        );

        resetForm();

        setPage(1);

        await fetchCampaigns(
          {
            currentPage: 1,
            currentSearch:
              "",
            currentStatus:
              "",
          }
        );
      } catch (error) {
        console.error(
          error
        );

        toast.error(
          error.message ||
            "Failed to send campaign."
        );
      } finally {
        setSending(
          false
        );
      }
    };

  const handleDeleteCampaign =
    async () => {
      if (
        !deleteCampaign?._id
      ) {
        return;
      }

      try {
        setDeleting(true);

        const response =
          await fetch(
            `${CAMPAIGN_API}/${deleteCampaign._id}`,
            {
              method:
                "DELETE",

              headers:
                getHeaders(),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to delete campaign."
          );
        }

        toast.success(
          "Campaign deleted permanently."
        );

        setDeleteCampaign(
          null
        );

        setSelectedCampaign(
          null
        );

        await fetchCampaigns();
      } catch (error) {
        console.error(
          error
        );

        toast.error(
          error.message ||
            "Unable to delete campaign."
        );
      } finally {
        setDeleting(
          false
        );
      }
    };

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "-";
    }

    try {
      return new Intl.DateTimeFormat(
        "en-IN",
        {
          dateStyle:
            "medium",

          timeStyle:
            "short",
        }
      ).format(
        new Date(date)
      );
    } catch {
      return date;
    }
  };

  const getStatusStyle =
    (status) => {
      switch (status) {
        case "COMPLETED":
          return "bg-green-50 text-green-700 border-green-200";

        case "PARTIAL_SUCCESS":
          return "bg-amber-50 text-amber-700 border-amber-200";

        case "FAILED":
          return "bg-red-50 text-red-700 border-red-200";

        case "PROCESSING":
          return "bg-blue-50 text-blue-700 border-blue-200";

        default:
          return "bg-gray-50 text-gray-700 border-gray-200";
      }
    };

  const getRecipientStatusStyle =
    (status) => {
      switch (status) {
        case "SENT":
          return "text-green-700 bg-green-50";

        case "FAILED":
          return "text-red-700 bg-red-50";

        default:
          return "text-amber-700 bg-amber-50";
      }
    };

  const campaignStats =
    useMemo(() => {
      return campaigns.reduce(
        (
          acc,
          campaign
        ) => {
          acc.sent +=
            Number(
              campaign.successCount ||
                0
            );

          acc.failed +=
            Number(
              campaign.failedCount ||
                0
            );

          acc.total +=
            Number(
              campaign.totalEmails ||
                0
            );

          return acc;
        },
        {
          total: 0,
          sent: 0,
          failed: 0,
        }
      );
    }, [campaigns]);

  return (
    <>
      <Helmet>
        <title>
          Email Campaigns |
          Admin Dashboard |
          Target Trek
        </title>

        <meta
          name="description"
          content="Manage Target Trek email campaigns, send HTML promotional emails, monitor campaign performance, recipient delivery status, and email history."
        />

        <meta
          name="robots"
          content="noindex,nofollow"
        />

        <meta
          name="googlebot"
          content="noindex,nofollow"
        />
      </Helmet>

      <div className="min-h-screen bg-slate-50 pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* HEADER */}

          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-600">
                <Mail
                  size={
                    17
                  }
                />

                Admin Email
                Management
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Email Campaigns
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Create HTML
                email campaigns,
                send them to one
                or multiple
                recipients,
                preview the
                email before
                sending, and
                monitor delivery
                results.
              </p>
            </div>

            <button
              onClick={
                openCampaignForm
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus
                size={
                  18
                }
              />

              New Campaign
            </button>
          </div>

          {/* STATS */}

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={
                <Mail
                  size={
                    20
                  }
                />
              }
              title="Campaigns"
              value={
                totalCampaigns
              }
            />

            <StatCard
              icon={
                <Users
                  size={
                    20
                  }
                />
              }
              title="Emails"
              value={
                campaignStats.total
              }
            />

            <StatCard
              icon={
                <CheckCircle2
                  size={
                    20
                  }
                />
              }
              title="Successful"
              value={
                campaignStats.sent
              }
            />

            <StatCard
              icon={
                <XCircle
                  size={
                    20
                  }
                />
              }
              title="Failed"
              value={
                campaignStats.failed
              }
            />
          </div>

          {/* FILTERS */}

          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search
                size={
                  17
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search by subject or recipient email..."
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event
                      .target
                      .value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) => {
                setStatusFilter(
                  event
                    .target
                    .value
                );

                setPage(
                  1
                );
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                All Status
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="PARTIAL_SUCCESS">
                Partial Success
              </option>

              <option value="FAILED">
                Failed
              </option>

              <option value="PROCESSING">
                Processing
              </option>
            </select>

            <button
              onClick={() =>
                fetchCampaigns()
              }
              disabled={
                loading
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={
                  17
                }
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>

          {/* CAMPAIGNS */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto mb-3 animate-spin text-blue-600" />

                  <p className="text-sm text-slate-500">
                    Loading
                    campaigns...
                  </p>
                </div>
              </div>
            ) : campaigns.length ===
              0 ? (
              <div className="flex min-h-[350px] flex-col items-center justify-center px-5 text-center">
                <div className="mb-4 rounded-full bg-blue-50 p-4 text-blue-600">
                  <Mail
                    size={
                      28
                    }
                  />
                </div>

                <h3 className="font-semibold text-slate-900">
                  No email
                  campaigns found
                </h3>

                <p className="mt-2 max-w-md text-sm text-slate-500">
                  Create your
                  first email
                  campaign and
                  send formatted
                  HTML emails to
                  your users.
                </p>

                <button
                  onClick={
                    openCampaignForm
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  <Plus
                    size={
                      17
                    }
                  />

                  Create Campaign
                </button>
              </div>
            ) : (
              <div>
                {campaigns.map(
                  (
                    campaign
                  ) => {
                    const expanded =
                      expandedCampaign ===
                      campaign._id;

                    return (
                      <div
                        key={
                          campaign._id
                        }
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <div className="p-5 sm:p-6">
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                                    campaign.status
                                  )}`}
                                >
                                  {campaign.status?.replaceAll(
                                    "_",
                                    " "
                                  )}
                                </span>

                                <span className="text-xs text-slate-400">
                                  {formatDate(
                                    campaign.createdAt
                                  )}
                                </span>
                              </div>

                              <h2 className="truncate text-lg font-semibold text-slate-900">
                                {
                                  campaign.subject
                                }
                              </h2>

                              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5">
                                  <Users
                                    size={
                                      15
                                    }
                                  />

                                  {
                                    campaign.totalEmails
                                  }{" "}
                                  recipients
                                </span>

                                <span className="flex items-center gap-1.5 text-green-700">
                                  <CheckCircle2
                                    size={
                                      15
                                    }
                                  />

                                  {
                                    campaign.successCount
                                  }{" "}
                                  sent
                                </span>

                                <span className="flex items-center gap-1.5 text-red-600">
                                  <XCircle
                                    size={
                                      15
                                    }
                                  />

                                  {
                                    campaign.failedCount
                                  }{" "}
                                  failed
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setSelectedCampaign(
                                    campaign
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                <Eye
                                  size={
                                    16
                                  }
                                />

                                View
                              </button>

                              <button
                                onClick={() =>
                                  setExpandedCampaign(
                                    expanded
                                      ? null
                                      : campaign._id
                                  )
                                }
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"
                              >
                                {expanded ? (
                                  <ChevronUp
                                    size={
                                      17
                                    }
                                  />
                                ) : (
                                  <ChevronDown
                                    size={
                                      17
                                    }
                                  />
                                )}
                              </button>

                              <button
                                onClick={() =>
                                  setDeleteCampaign(
                                    campaign
                                  )
                                }
                                className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                              >
                                <Trash2
                                  size={
                                    17
                                  }
                                />
                              </button>
                            </div>
                          </div>

                          {expanded && (
                            <RecipientTable
                              recipients={
                                campaign.recipients ||
                                []
                              }
                              formatDate={
                                formatDate
                              }
                              getStatusStyle={
                                getRecipientStatusStyle
                              }
                            />
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* PAGINATION */}

          {totalPages >
            1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Page {page}{" "}
                of{" "}
                {
                  totalPages
                }
              </p>

              <div className="flex gap-2">
                <button
                  disabled={
                    page <=
                    1
                  }
                  onClick={() =>
                    setPage(
                      (
                        previous
                      ) =>
                        previous -
                        1
                    )
                  }
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  disabled={
                    page >=
                    totalPages
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
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE CAMPAIGN MODAL */}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 py-8 backdrop-blur-sm">
          <div className="mb-10 max-h-[94vh] w-full max-w-7xl overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  New Email
                  Campaign
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Compose,
                  preview and
                  send your
                  email campaign.
                </p>
              </div>

              <button
                onClick={
                  closeCampaignForm
                }
                disabled={
                  sending
                }
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X
                  size={
                    20
                  }
                />
              </button>
            </div>

            <form
              onSubmit={
                handleSendCampaign
              }
              className="grid max-h-[calc(94vh-74px)] overflow-y-auto lg:grid-cols-2"
            >

              {/* LEFT FORM */}

              <div className="border-b border-slate-200 p-5 sm:p-6 lg:border-b-0 lg:border-r">
                <div className="space-y-6">

                  {/* SUBJECT */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-800">
                      Email Subject
                    </label>

                    <input
                      type="text"
                      name="subject"
                      value={
                        form.subject
                      }
                      onChange={
                        handleInputChange
                      }
                      placeholder="Example: Special Offer for Developers"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      {
                        form.subject
                          .length
                      }{" "}
                      characters
                    </p>
                  </div>

                  {/* RECIPIENTS */}

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-800">
                        Recipients
                      </label>

                      {emails.length >
                        0 && (
                        <span className="text-xs font-medium text-blue-600">
                          {
                            validEmails.length
                          }{" "}
                          valid
                          recipient
                          {validEmails.length !==
                          1
                            ? "s"
                            : ""}
                        </span>
                      )}
                    </div>

                    <textarea
                      name="emails"
                      value={
                        form.emails
                      }
                      onChange={
                        handleInputChange
                      }
                      rows={
                        5
                      }
                      placeholder={`user1@gmail.com, user2@gmail.com
user3@gmail.com user4@gmail.com`}
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Separate email
                      addresses using
                      a comma, space,
                      semicolon or
                      new line.
                      Duplicate
                      addresses are
                      automatically
                      removed.
                    </p>

                    {invalidEmails.length >
                      0 && (
                      <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                        <p className="mb-2 text-xs font-semibold text-red-700">
                          Invalid
                          email
                          addresses
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {invalidEmails.map(
                            (
                              email
                            ) => (
                              <span
                                key={
                                  email
                                }
                                className="rounded bg-red-100 px-2 py-1 text-xs text-red-700"
                              >
                                {
                                  email
                                }
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {validEmails.length >
                      0 && (
                      <div className="mt-3 max-h-28 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex flex-wrap gap-1.5">
                          {validEmails.map(
                            (
                              email
                            ) => (
                              <span
                                key={
                                  email
                                }
                                className="rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs text-blue-700"
                              >
                                {
                                  email
                                }
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* HTML */}

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Code2
                          size={
                            16
                          }
                        />

                        HTML Content
                      </label>

                      <span className="text-xs text-slate-400">
                        {
                          form.html
                            .length
                        }{" "}
                        characters
                      </span>
                    </div>

                    <textarea
                      name="html"
                      value={
                        form.html
                      }
                      onChange={
                        handleInputChange
                      }
                      rows={
                        18
                      }
                      spellCheck="false"
                      placeholder={`<!DOCTYPE html>
<html>
  <body>
    <h1>Hello Developers!</h1>
    <p>Write your email here...</p>
  </body>
</html>`}
                      className="w-full resize-y rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* BUTTONS */}

                  <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={
                        sending
                      }
                      onClick={
                        closeCampaignForm
                      }
                      className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        sending
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sending ? (
                        <>
                          <Loader2
                            size={
                              17
                            }
                            className="animate-spin"
                          />

                          Sending...
                        </>
                      ) : (
                        <>
                          <Send
                            size={
                              17
                            }
                          />

                          Send to{" "}
                          {
                            validEmails.length
                          }{" "}
                          Recipient
                          {validEmails.length !==
                          1
                            ? "s"
                            : ""}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* LIVE PREVIEW */}

              <div className="bg-slate-50 p-5 sm:p-6">
                <div className="sticky top-0">

                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <Eye
                        size={
                          17
                        }
                        className="text-blue-600"
                      />

                      <h3 className="font-semibold text-slate-900">
                        Live Email
                        Preview
                      </h3>
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Preview
                      updates
                      automatically
                      as you edit
                      the HTML.
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 bg-slate-100 px-4 py-3">
                      <div className="space-y-1 text-xs">

                        <div>
                          <span className="font-semibold text-slate-500">
                            Subject:
                          </span>{" "}

                          <span className="text-slate-800">
                            {form.subject ||
                              "No subject"}
                          </span>
                        </div>

                        <div>
                          <span className="font-semibold text-slate-500">
                            To:
                          </span>{" "}

                          <span className="text-slate-800">
                            {validEmails.length >
                            0
                              ? `${validEmails.length} recipient${
                                  validEmails.length !==
                                  1
                                    ? "s"
                                    : ""
                                }`
                              : "No recipients"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="h-[570px] bg-white">
                      {form.html.trim() ? (
                        <iframe
                          title="Email HTML Preview"
                          srcDoc={
                            form.html
                          }
                          sandbox=""
                          className="h-full w-full border-0 bg-white"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                          <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-400">
                            <FileText
                              size={
                                28
                              }
                            />
                          </div>

                          <h4 className="font-semibold text-slate-700">
                            Nothing
                            to preview
                            yet
                          </h4>

                          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
                            Enter your
                            HTML
                            content on
                            the left
                            and the
                            email
                            preview
                            will
                            appear
                            here.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-700">
                    The preview
                    runs inside a
                    sandboxed
                    iframe. Your
                    HTML styling
                    is isolated
                    from the admin
                    dashboard.
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CAMPAIGN DETAILS */}

      {selectedCampaign && (
        <CampaignDetailsModal
          campaign={
            selectedCampaign
          }
          onClose={() =>
            setSelectedCampaign(
              null
            )
          }
          onDelete={() => {
            setDeleteCampaign(
              selectedCampaign
            );

            setSelectedCampaign(
              null
            );
          }}
          formatDate={
            formatDate
          }
          getStatusStyle={
            getStatusStyle
          }
          getRecipientStatusStyle={
            getRecipientStatusStyle
          }
        />
      )}

      {/* DELETE CONFIRMATION */}

      {deleteCampaign && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle
                size={
                  23
                }
              />
            </div>

            <h2 className="text-xl font-bold text-slate-900">
              Delete Campaign?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You are about
              to permanently
              delete the
              campaign{" "}

              <strong className="text-slate-700">
                "
                {
                  deleteCampaign.subject
                }
                "
              </strong>

              . This will also
              remove all stored
              recipient delivery
              history.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                disabled={
                  deleting
                }
                onClick={() =>
                  setDeleteCampaign(
                    null
                  )
                }
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>

              <button
                disabled={
                  deleting
                }
                onClick={
                  handleDeleteCampaign
                }
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2
                      size={
                        16
                      }
                      className="animate-spin"
                    />

                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2
                      size={
                        16
                      }
                    />

                    Delete
                    Permanently
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  icon,
  title,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-slate-900">
        {Number(
          value || 0
        ).toLocaleString(
          "en-IN"
        )}
      </p>
    </div>
  );
};

/* =========================================================
   RECIPIENT TABLE
========================================================= */

const RecipientTable = ({
  recipients,
  formatDate,
  getStatusStyle,
}) => {
  if (
    !recipients ||
    recipients.length ===
      0
  ) {
    return (
      <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
        No recipient
        information
        available.
      </div>
    );
  }

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">

          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Time
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Error
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">

            {recipients.map(
              (
                recipient,
                index
              ) => (
                <tr
                  key={`${recipient.email}-${index}`}
                >

                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                    {
                      recipient.email
                    }
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                        recipient.status
                      )}`}
                    >
                      {
                        recipient.status
                      }
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                    {recipient.sentAt
                      ? formatDate(
                          recipient.sentAt
                        )
                      : recipient.failedAt
                        ? formatDate(
                            recipient.failedAt
                          )
                        : "-"}
                  </td>

                  <td className="max-w-xs break-words px-4 py-3 text-xs text-red-600">
                    {recipient.error ||
                      "-"}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================================
   CAMPAIGN DETAILS MODAL
========================================================= */

const CampaignDetailsModal = ({
  campaign,
  onClose,
  onDelete,
  formatDate,
  getStatusStyle,
  getRecipientStatusStyle,
}) => {
  const [
    copied,
    setCopied,
  ] = useState(false);

  const copyHtmlCode =
    async () => {
      const html =
        campaign?.html ||
        "";

      if (!html.trim()) {
        toast.error(
          "No HTML content available to copy."
        );

        return;
      }

      try {
        if (
          navigator.clipboard &&
          window.isSecureContext
        ) {
          await navigator.clipboard.writeText(
            html
          );
        } else {
          const textarea =
            document.createElement(
              "textarea"
            );

          textarea.value =
            html;

          textarea.style.position =
            "fixed";

          textarea.style.left =
            "-999999px";

          textarea.style.top =
            "-999999px";

          document.body.appendChild(
            textarea
          );

          textarea.focus();
          textarea.select();

          document.execCommand(
            "copy"
          );

          textarea.remove();
        }

        setCopied(true);

        toast.success(
          "HTML code copied."
        );

        setTimeout(
          () => {
            setCopied(
              false
            );
          },
          2000
        );
      } catch (error) {
        console.error(
          error
        );

        toast.error(
          "Unable to copy HTML code."
        );
      }
    };

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto bg-slate-950/50 p-3 py-8 backdrop-blur-sm">

      <div className="flex min-h-full items-start justify-center">

        {/*
          mb-12 gives the modal proper
          space below it when scrolling.
        */}

        <div className="mb-12 w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">

          {/* MODAL HEADER */}

          <div className="sticky top-0 z-20 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-5 sm:px-6">

            <div className="min-w-0 pr-4">

              <div className="mb-2">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                    campaign.status
                  )}`}
                >
                  {campaign.status?.replaceAll(
                    "_",
                    " "
                  )}
                </span>
              </div>

              <h2 className="break-words text-xl font-bold text-slate-900">
                {
                  campaign.subject
                }
              </h2>

              <p className="mt-1 break-all text-xs text-slate-500">
                Campaign ID:{" "}
                {
                  campaign._id
                }
              </p>
            </div>

            <button
              onClick={
                onClose
              }
              className="shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            >
              <X
                size={
                  20
                }
              />
            </button>
          </div>

          {/* MODAL CONTENT */}

          <div className="p-5 pb-12 sm:p-6 sm:pb-14">

            {/* STATS */}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <SmallStat
                title="Recipients"
                value={
                  campaign.totalEmails
                }
                icon={
                  <Users />
                }
              />

              <SmallStat
                title="Successful"
                value={
                  campaign.successCount
                }
                icon={
                  <CheckCircle2 />
                }
              />

              <SmallStat
                title="Failed"
                value={
                  campaign.failedCount
                }
                icon={
                  <XCircle />
                }
              />

              <SmallStat
                title="Pending"
                value={
                  campaign.pendingCount
                }
                icon={
                  <Clock3 />
                }
              />
            </div>

            {/* TIMING + SUMMARY */}

            <div className="mt-6 grid gap-4 md:grid-cols-2">

              <div className="rounded-xl border border-slate-200 p-4">

                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CalendarDays
                    size={
                      16
                    }
                  />

                  Campaign Timing
                </div>

                <div className="space-y-2 text-sm text-slate-500">

                  <p>
                    <span className="font-medium text-slate-700">
                      Created:
                    </span>{" "}

                    {formatDate(
                      campaign.createdAt
                    )}
                  </p>

                  <p>
                    <span className="font-medium text-slate-700">
                      Started:
                    </span>{" "}

                    {formatDate(
                      campaign.startedAt
                    )}
                  </p>

                  <p>
                    <span className="font-medium text-slate-700">
                      Completed:
                    </span>{" "}

                    {formatDate(
                      campaign.completedAt
                    )}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">

                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Hash
                    size={
                      16
                    }
                  />

                  Campaign Summary
                </div>

                <p className="text-sm leading-6 text-slate-500">
                  Successfully
                  delivered to{" "}

                  <strong className="text-green-700">
                    {
                      campaign.successCount
                    }
                  </strong>{" "}

                  of{" "}

                  <strong className="text-slate-800">
                    {
                      campaign.totalEmails
                    }
                  </strong>{" "}

                  recipients.
                </p>

                {Number(
                  campaign.failedCount ||
                    0
                ) > 0 && (
                  <p className="mt-2 text-sm leading-6 text-red-600">
                    {
                      campaign.failedCount
                    }{" "}
                    recipient
                    {Number(
                      campaign.failedCount
                    ) !==
                    1
                      ? "s"
                      : ""}{" "}
                    failed.
                  </p>
                )}
              </div>
            </div>

            {/* EMAIL PREVIEW */}

            <div className="mt-7">

              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <Eye
                    size={
                      17
                    }
                    className="text-blue-600"
                  />

                  <h3 className="font-semibold text-slate-900">
                    Email Preview
                  </h3>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  This is the
                  email HTML as
                  rendered for
                  the campaign.
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">

                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">
                      Subject:
                    </span>{" "}

                    {
                      campaign.subject
                    }
                  </p>
                </div>

                <iframe
                  title={`Campaign preview ${campaign._id}`}
                  srcDoc={
                    campaign.html ||
                    ""
                  }
                  sandbox=""
                  className="h-[500px] w-full border-0 bg-white"
                />
              </div>
            </div>

            {/* EXACT HTML SOURCE */}

            <div className="mt-7">

              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <div className="flex items-center gap-2">
                    <Code2
                      size={
                        17
                      }
                      className="text-blue-600"
                    />

                    <h3 className="font-semibold text-slate-900">
                      HTML Source
                      Code
                    </h3>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Exact HTML
                    stored for
                    this campaign.
                    You can copy
                    and reuse it.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    copyHtmlCode
                  }
                  disabled={
                    !campaign.html
                  }
                  className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition ${
                    copied
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {copied ? (
                    <>
                      <Check
                        size={
                          16
                        }
                      />

                      Copied
                    </>
                  ) : (
                    <>
                      <Copy
                        size={
                          16
                        }
                      />

                      Copy HTML
                    </>
                  )}
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">

                {/* CODE HEADER */}

                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2.5">

                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />

                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />

                    <div className="h-2.5 w-2.5 rounded-full bg-green-400" />

                    <span className="ml-2 text-xs text-slate-400">
                      email.html
                    </span>
                  </div>

                  <span className="text-xs text-slate-500">
                    {
                      (
                        campaign.html ||
                        ""
                      ).length
                    }{" "}
                    characters
                  </span>
                </div>

                {/* RAW CODE */}

                <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap break-words p-4 text-left font-mono text-xs leading-6 text-slate-200 sm:text-sm">
                  <code>
                    {campaign.html ||
                      "<!-- No HTML content available -->"}
                  </code>
                </pre>
              </div>
            </div>

            {/* RECIPIENT DELIVERY */}

            <div className="mt-7">

              <div className="flex items-center gap-2">
                <Users
                  size={
                    17
                  }
                  className="text-blue-600"
                />

                <h3 className="font-semibold text-slate-900">
                  Recipient
                  Delivery
                  Details
                </h3>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                View individual
                successful and
                failed email
                attempts.
              </p>

              <RecipientTable
                recipients={
                  campaign.recipients ||
                  []
                }
                formatDate={
                  formatDate
                }
                getStatusStyle={
                  getRecipientStatusStyle
                }
              />
            </div>

            {/* FOOTER ACTIONS */}

            <div className="mb-4 mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">

              <button
                onClick={
                  onDelete
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                <Trash2
                  size={
                    16
                  }
                />

                Delete Campaign
              </button>

              <div className="flex flex-col-reverse gap-2 sm:flex-row">

                <button
                  type="button"
                  onClick={
                    copyHtmlCode
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {copied ? (
                    <>
                      <Check
                        size={
                          16
                        }
                        className="text-green-600"
                      />

                      HTML Copied
                    </>
                  ) : (
                    <>
                      <Copy
                        size={
                          16
                        }
                      />

                      Copy HTML
                    </>
                  )}
                </button>

                <button
                  onClick={
                    onClose
                  }
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   SMALL STAT
========================================================= */

const SmallStat = ({
  title,
  value,
  icon,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

      <div className="mb-3 flex h-8 w-8 items-center justify-center text-blue-600 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </div>

      <p className="text-xs font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900">
        {Number(
          value || 0
        ).toLocaleString(
          "en-IN"
        )}
      </p>
    </div>
  );
};

export default EmailCampaignDashboard;