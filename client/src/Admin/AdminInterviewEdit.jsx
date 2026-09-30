import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Helmet } from "react-helmet";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import {
  Archive,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  Eye,
  FileText,
  Plus,
  RefreshCcw,
  RotateCcw,
  Save,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";

import BASE_URL from "../utils/Url.js";

const STATUS_OPTIONS = [
  "PENDING",
  "ACCEPTED",
  "PUBLISHED",
  "ARCHIVED",
];

const DIFFICULTIES = [
  "NOT_SPECIFIED",
  "EASY",
  "MEDIUM",
  "MEDIUM_HARD",
  "HARD",
];

const RESULTS = [
  "NOT_DISCLOSED",
  "SELECTED",
  "REJECTED",
  "WAITING",
  "OFFER_DECLINED",
];

const MODES = [
  "NOT_SPECIFIED",
  "ONLINE",
  "OFFLINE",
  "HYBRID",
];

const createQuestion = () => ({
  question: "",
  type: "OTHER",
  difficulty:
    "NOT_SPECIFIED",
  topics: [],
  descriptionMarkdown: "",
  approachMarkdown: "",
  followUps: [],
  externalUrl: "",
});

const createRound = (
  order = 1
) => ({
  order,
  title: "",
  type: "OTHER",
  durationMinutes: null,
  difficulty:
    "NOT_SPECIFIED",
  mode: "NOT_SPECIFIED",
  platform: "",
  contentMarkdown: "",
  topics: [],
  questions: [],
  takeawayMarkdown: "",
});

const arrayToText = (
  value
) =>
  Array.isArray(value)
    ? value.join(", ")
    : "";

const textToArray = (
  value
) =>
  [
    ...new Set(
      String(value || "")
        .split(",")
        .map((item) =>
          item.trim()
        )
        .filter(Boolean)
    ),
  ];

const formatDateTime = (
  value
) => {
  if (!value) return "-";

  const date =
    new Date(value);

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

const Input = ({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  disabled = false,
}) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-slate-700">
      {label}
    </label>

    <input
      type={type}
      value={value ?? ""}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      disabled={disabled}
      placeholder={
        placeholder
      }
      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100 disabled:text-slate-500"
    />
  </div>
);

const Textarea = ({
  label,
  value,
  onChange,
  rows = 6,
  placeholder = "",
  disabled = false,
}) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-slate-700">
      {label}
    </label>

    <textarea
      rows={rows}
      value={value ?? ""}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      disabled={disabled}
      placeholder={
        placeholder
      }
      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-100 disabled:text-slate-500"
    />
  </div>
);

const Select = ({
  label,
  value,
  onChange,
  options,
}) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-slate-700">
      {label}
    </label>

    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      >
        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option.replaceAll(
                "_",
                " "
              )}
            </option>
          )
        )}
      </select>

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  </div>
);

const AdminInterviewEdit =
  () => {
    const { id } =
      useParams();

    const navigate =
      useNavigate();

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
      loading,
      setLoading,
    ] = useState(true);

    const [
      saving,
      setSaving,
    ] = useState(false);

    const [
      interview,
      setInterview,
    ] = useState(null);

    const [form, setForm] =
      useState(null);

    /*
    |--------------------------------------------------------------------------
    | FETCH
    |--------------------------------------------------------------------------
    */

    const fetchInterview =
      useCallback(
        async () => {
          try {
            setLoading(true);

            const response =
              await fetch(
                `${API_BASE}/admin/${id}`,
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
                  "Unable to load interview."
              );
            }

            const item =
              data.data;

            setInterview(item);

            setForm({
              title:
                item.title || "",

              slug:
                item.slug || "",

              company: {
                name:
                  item.company
                    ?.name ||
                  "",

                logoUrl:
                  item.company
                    ?.logoUrl ||
                  "",
              },

              role: {
                title:
                  item.role
                    ?.title ||
                  "",

                category:
                  item.role
                    ?.category ||
                  "",

                level:
                  item.role
                    ?.level ||
                  "",
              },

              user: {
                name:
                  item.user
                    ?.name ||
                  "",

                email:
                  item.user
                    ?.email ||
                  "",

                mobile:
                  item.user
                    ?.mobile ||
                  "",

                isAnonymous:
                  item.user
                    ?.isAnonymous !==
                  false,

                publicName:
                  item.user
                    ?.publicName ||
                  "",
              },

              interviewInfo: {
                experienceYears:
                  item
                    .interviewInfo
                    ?.experienceYears ??
                  "",

                experienceMonths:
                  item
                    .interviewInfo
                    ?.experienceMonths ??
                  "",

                location:
                  item
                    .interviewInfo
                    ?.location ||
                  "",

                country:
                  item
                    .interviewInfo
                    ?.country ||
                  "",

                interviewDate:
                  item
                    .interviewInfo
                    ?.interviewDate
                    ? new Date(
                        item.interviewInfo.interviewDate
                      )
                        .toISOString()
                        .slice(
                          0,
                          10
                        )
                    : "",

                applicationSource:
                  item
                    .interviewInfo
                    ?.applicationSource ||
                  "",

                interviewMode:
                  item
                    .interviewInfo
                    ?.interviewMode ||
                  "NOT_SPECIFIED",

                difficulty:
                  item
                    .interviewInfo
                    ?.difficulty ||
                  "NOT_SPECIFIED",

                result:
                  item
                    .interviewInfo
                    ?.result ||
                  "NOT_DISCLOSED",
              },

              contentMarkdown:
                item.contentMarkdown ||
                "",

              summaryMarkdown:
                item.summaryMarkdown ||
                "",

              preparationMarkdown:
                item.preparationMarkdown ||
                "",

              adviceMarkdown:
                item.adviceMarkdown ||
                "",

              keyTakeawaysMarkdown:
                item.keyTakeawaysMarkdown ||
                "",

              topics:
                item.topics || [],

              technologies:
                item.technologies ||
                [],

              tags:
                item.tags || [],

              searchKeywords:
                item.searchKeywords ||
                [],

              rounds:
                Array.isArray(
                  item.rounds
                )
                  ? item.rounds
                  : [],

              seo: {
                title:
                  item.seo
                    ?.title ||
                  "",

                description:
                  item.seo
                    ?.description ||
                  "",

                canonicalPath:
                  item.seo
                    ?.canonicalPath ||
                  "",

                ogTitle:
                  item.seo
                    ?.ogTitle ||
                  "",

                ogDescription:
                  item.seo
                    ?.ogDescription ||
                  "",

                ogImage:
                  item.seo
                    ?.ogImage ||
                  "",
              },

              featured:
                Boolean(
                  item.featured
                ),

              editorPick:
                Boolean(
                  item.editorPick
                ),

              displayPriority:
                item.displayPriority ??
                0,

              status:
                item.status ||
                "PENDING",

              adminNotes:
                item
                  .moderation
                  ?.adminNotes ||
                "",
            });
          } catch (error) {
            console.error(
              error
            );

            toast.error(
              error.message
            );
          } finally {
            setLoading(false);
          }
        },
        [
          API_BASE,
          id,
          token,
        ]
      );

    useEffect(() => {
      if (token && id) {
        fetchInterview();
      }
    }, [
      token,
      id,
      fetchInterview,
    ]);

    /*
    |--------------------------------------------------------------------------
    | UPDATE HELPERS
    |--------------------------------------------------------------------------
    */

    const updateRoot = (
      key,
      value
    ) => {
      setForm(
        (previous) => ({
          ...previous,
          [key]: value,
        })
      );
    };

    const updateNested = (
      section,
      key,
      value
    ) => {
      setForm(
        (previous) => ({
          ...previous,
          [section]: {
            ...previous[
              section
            ],
            [key]: value,
          },
        })
      );
    };

    /*
    |--------------------------------------------------------------------------
    | ROUND HELPERS
    |--------------------------------------------------------------------------
    */

    const addRound = () => {
      setForm(
        (previous) => ({
          ...previous,

          rounds: [
            ...previous.rounds,
            createRound(
              previous
                .rounds
                .length + 1
            ),
          ],
        })
      );
    };

    const removeRound = (
      roundIndex
    ) => {
      setForm(
        (previous) => ({
          ...previous,

          rounds:
            previous.rounds
              .filter(
                (
                  _,
                  index
                ) =>
                  index !==
                  roundIndex
              )
              .map(
                (
                  round,
                  index
                ) => ({
                  ...round,
                  order:
                    index + 1,
                })
              ),
        })
      );
    };

    const updateRound = (
      roundIndex,
      key,
      value
    ) => {
      setForm(
        (previous) => {
          const rounds =
            [
              ...previous.rounds,
            ];

          rounds[
            roundIndex
          ] = {
            ...rounds[
              roundIndex
            ],

            [key]: value,
          };

          return {
            ...previous,
            rounds,
          };
        }
      );
    };

    const addQuestion = (
      roundIndex
    ) => {
      setForm(
        (previous) => {
          const rounds =
            structuredClone(
              previous.rounds
            );

          rounds[
            roundIndex
          ].questions =
            [
              ...(rounds[
                roundIndex
              ].questions ||
                []),

              createQuestion(),
            ];

          return {
            ...previous,
            rounds,
          };
        }
      );
    };

    const removeQuestion = (
      roundIndex,
      questionIndex
    ) => {
      setForm(
        (previous) => {
          const rounds =
            structuredClone(
              previous.rounds
            );

          rounds[
            roundIndex
          ].questions =
            (
              rounds[
                roundIndex
              ].questions ||
              []
            ).filter(
              (_, index) =>
                index !==
                questionIndex
            );

          return {
            ...previous,
            rounds,
          };
        }
      );
    };

    const updateQuestion = (
      roundIndex,
      questionIndex,
      key,
      value
    ) => {
      setForm(
        (previous) => {
          const rounds =
            structuredClone(
              previous.rounds
            );

          rounds[
            roundIndex
          ].questions[
            questionIndex
          ] = {
            ...rounds[
              roundIndex
            ].questions[
              questionIndex
            ],

            [key]: value,
          };

          return {
            ...previous,
            rounds,
          };
        }
      );
    };

    /*
    |--------------------------------------------------------------------------
    | SAVE
    |--------------------------------------------------------------------------
    */

    const saveInterview =
      async () => {
        if (!form) {
          return;
        }

        if (
          !form.title.trim()
        ) {
          toast.error(
            "Title is required."
          );

          return;
        }

        if (
          !form.company.name.trim()
        ) {
          toast.error(
            "Company is required."
          );

          return;
        }

        if (
          !form.role.title.trim()
        ) {
          toast.error(
            "Role is required."
          );

          return;
        }

        try {
          setSaving(true);

          const payload = {
            ...form,

            displayPriority:
              Number(
                form.displayPriority
              ) || 0,

            interviewInfo: {
              ...form.interviewInfo,

              experienceYears:
                form
                  .interviewInfo
                  .experienceYears ===
                ""
                  ? null
                  : Number(
                      form
                        .interviewInfo
                        .experienceYears
                    ),

              experienceMonths:
                form
                  .interviewInfo
                  .experienceMonths ===
                ""
                  ? null
                  : Number(
                      form
                        .interviewInfo
                        .experienceMonths
                    ),
            },

            rounds:
              form.rounds.map(
                (
                  round,
                  index
                ) => ({
                  ...round,

                  order:
                    index + 1,

                  durationMinutes:
                    round.durationMinutes ===
                      "" ||
                    round.durationMinutes ===
                      null
                      ? null
                      : Number(
                          round.durationMinutes
                        ),
                })
              ),
          };

          const response =
            await fetch(
              `${API_BASE}/admin/${id}`,
              {
                method:
                  "PATCH",

                headers: {
                  "Content-Type":
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,
                },

                body:
                  JSON.stringify(
                    payload
                  ),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Unable to save interview."
            );
          }

          toast.success(
            "Interview updated successfully."
          );

          await fetchInterview();
        } catch (error) {
          console.error(
            error
          );

          toast.error(
            error.message ||
              "Unable to update interview."
          );
        } finally {
          setSaving(false);
        }
      };

    /*
    |--------------------------------------------------------------------------
    | STATUS ACTIONS
    |--------------------------------------------------------------------------
    */

    const executeAction =
      async (action) => {
        try {
          let url =
            `${API_BASE}/admin/${id}/${action}`;

          const body = {};

          if (
            action ===
            "reject"
          ) {
            body.reason =
              form.adminNotes ||
              "Rejected by admin.";
          }

          const response =
            await fetch(
              url,
              {
                method:
                  "PATCH",

                headers: {
                  "Content-Type":
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,
                },

                body:
                  JSON.stringify(
                    body
                  ),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Unable to update status."
            );
          }

          toast.success(
            data.message ||
              "Status updated."
          );

          await fetchInterview();
        } catch (error) {
          toast.error(
            error.message
          );
        }
      };

    const archiveInterview =
      async () => {
        try {
          const response =
            await fetch(
              `${API_BASE}/admin/${id}`,
              {
                method:
                  "DELETE",

                headers: {
                  "Content-Type":
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,
                },

                body:
                  JSON.stringify(
                    {
                      reason:
                        form.adminNotes,
                    }
                  ),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Unable to archive interview."
            );
          }

          toast.success(
            "Interview archived."
          );

          await fetchInterview();
        } catch (error) {
          toast.error(
            error.message
          );
        }
      };

    const hardDelete =
      async () => {
        const confirmed =
          window.confirm(
            "This permanently deletes the interview from MongoDB. This cannot be undone. Continue?"
          );

        if (!confirmed) {
          return;
        }

        try {
          const response =
            await fetch(
              `${API_BASE}/admin/${id}/hard`,
              {
                method:
                  "DELETE",

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
                "Unable to delete interview."
            );
          }

          toast.success(
            "Interview permanently deleted."
          );

          navigate(
            "/admin/interviews"
          );
        } catch (error) {
          toast.error(
            error.message
          );
        }
      };

    if (loading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading interview...
            </p>
          </div>
        </div>
      );
    }

    if (!form) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          Interview not
          found.
        </div>
      );
    }

    return (
      <>
        <Helmet>
          <title>
            Edit Interview |
            TargetTrek Admin
          </title>

          <meta
            name="robots"
            content="noindex,nofollow"
          />
        </Helmet>

        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* HEADER */}

            <div className="mb-6">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/interviews"
                  )
                }
                className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Interviews
              </button>

              <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
                    Interview Review
                  </p>

                  <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                    {form.title}
                  </h1>

                  <p className="mt-2 text-sm text-slate-500">
                    {
                      form.company
                        .name
                    }{" "}
                    •{" "}
                    {
                      form.role
                        .title
                    }
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={
                      fetchInterview
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Reload
                  </button>

                  <button
                    type="button"
                    disabled={
                      saving
                    }
                    onClick={
                      saveInterview
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />

                    {saving
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    executeAction(
                      "accept"
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700"
                >
                  <Check className="h-4 w-4" />
                  Accept
                </button>

                <button
                  type="button"
                  onClick={() =>
                    executeAction(
                      "publish"
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700"
                >
                  <Eye className="h-4 w-4" />
                  Publish
                </button>

                <button
                  type="button"
                  onClick={() =>
                    executeAction(
                      "reject"
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>

                {interview.status ===
                  "ARCHIVED" && (
                  <button
                    type="button"
                    onClick={() =>
                      executeAction(
                        "restore"
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-50 px-4 py-2.5 text-sm font-bold text-purple-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore
                  </button>
                )}

                <button
                  type="button"
                  onClick={
                    archiveInterview
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </button>

                {interview.status ===
                  "ARCHIVED" && (
                  <button
                    type="button"
                    onClick={
                      hardDelete
                    }
                    className="ml-auto inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                    Permanently Delete
                  </button>
                )}
              </div>
            </section>

            <div className="space-y-6">
              {/* BASIC */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-black text-slate-900">
                  Basic Information
                </h2>

                <div className="grid gap-5 md:grid-cols-2">
                  <Input
                    label="Title"
                    value={
                      form.title
                    }
                    onChange={(
                      value
                    ) =>
                      updateRoot(
                        "title",
                        value
                      )
                    }
                  />

                  <Input
                    label="Slug"
                    value={
                      form.slug
                    }
                    onChange={(
                      value
                    ) =>
                      updateRoot(
                        "slug",
                        value
                      )
                    }
                  />

                  <Input
                    label="Company"
                    value={
                      form.company
                        .name
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "company",
                        "name",
                        value
                      )
                    }
                  />

                  <Input
                    label="Company Logo URL"
                    value={
                      form.company
                        .logoUrl
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "company",
                        "logoUrl",
                        value
                      )
                    }
                  />

                  <Input
                    label="Role"
                    value={
                      form.role
                        .title
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "role",
                        "title",
                        value
                      )
                    }
                  />

                  <Input
                    label="Role Category"
                    value={
                      form.role
                        .category
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "role",
                        "category",
                        value
                      )
                    }
                  />

                  <Input
                    label="Role Level"
                    value={
                      form.role
                        .level
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "role",
                        "level",
                        value
                      )
                    }
                  />

                  <Select
                    label="Status"
                    value={
                      form.status
                    }
                    onChange={(
                      value
                    ) =>
                      updateRoot(
                        "status",
                        value
                      )
                    }
                    options={
                      STATUS_OPTIONS
                    }
                  />
                </div>
              </section>

              {/* USER */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-black text-slate-900">
                  Candidate Information
                </h2>

                <div className="grid gap-5 md:grid-cols-2">
                  <Input
                    label="Name"
                    value={
                      form.user
                        .name
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "user",
                        "name",
                        value
                      )
                    }
                  />

                  <Input
                    label="Email"
                    value={
                      form.user
                        .email
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "user",
                        "email",
                        value
                      )
                    }
                  />

                  <Input
                    label="Mobile"
                    value={
                      form.user
                        .mobile
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "user",
                        "mobile",
                        value
                      )
                    }
                  />

                  <Input
                    label="Public Display Name"
                    value={
                      form.user
                        .publicName
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "user",
                        "publicName",
                        value
                      )
                    }
                  />
                </div>

                <label className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    checked={
                      form.user
                        .isAnonymous
                    }
                    onChange={(
                      event
                    ) =>
                      updateNested(
                        "user",
                        "isAnonymous",
                        event
                          .target
                          .checked
                      )
                    }
                  />

                  <span className="text-sm font-bold text-slate-700">
                    Publish
                    anonymously
                  </span>
                </label>
              </section>

              {/* INTERVIEW INFO */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-black text-slate-900">
                  Interview Details
                </h2>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  <Input
                    label="Experience Years"
                    value={
                      form
                        .interviewInfo
                        .experienceYears
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "interviewInfo",
                        "experienceYears",
                        value
                      )
                    }
                  />

                  <Input
                    label="Experience Months"
                    value={
                      form
                        .interviewInfo
                        .experienceMonths
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "interviewInfo",
                        "experienceMonths",
                        value
                      )
                    }
                  />

                  <Input
                    label="Location"
                    value={
                      form
                        .interviewInfo
                        .location
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "interviewInfo",
                        "location",
                        value
                      )
                    }
                  />

                  <Input
                    label="Country"
                    value={
                      form
                        .interviewInfo
                        .country
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "interviewInfo",
                        "country",
                        value
                      )
                    }
                  />

                  <Input
                    label="Interview Date"
                    type="date"
                    value={
                      form
                        .interviewInfo
                        .interviewDate
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "interviewInfo",
                        "interviewDate",
                        value
                      )
                    }
                  />

                  <Input
                    label="Application Source"
                    value={
                      form
                        .interviewInfo
                        .applicationSource
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "interviewInfo",
                        "applicationSource",
                        value
                      )
                    }
                  />

                  <Select
                    label="Interview Mode"
                    value={
                      form
                        .interviewInfo
                        .interviewMode
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "interviewInfo",
                        "interviewMode",
                        value
                      )
                    }
                    options={
                      MODES
                    }
                  />

                  <Select
                    label="Difficulty"
                    value={
                      form
                        .interviewInfo
                        .difficulty
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "interviewInfo",
                        "difficulty",
                        value
                      )
                    }
                    options={
                      DIFFICULTIES
                    }
                  />

                  <Select
                    label="Result"
                    value={
                      form
                        .interviewInfo
                        .result
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "interviewInfo",
                        "result",
                        value
                      )
                    }
                    options={
                      RESULTS
                    }
                  />
                </div>
              </section>

              {/* ORIGINAL */}

              <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-700" />

                  <h2 className="font-black text-amber-900">
                    Original User
                    Submission
                  </h2>
                </div>

                <p className="mb-4 text-xs leading-5 text-amber-800">
                  This is the
                  immutable original
                  text submitted by
                  the user. Edit the
                  public content below
                  instead.
                </p>

                <Textarea
                  label="Original Content"
                  value={
                    interview.originalContent
                  }
                  onChange={() => {}}
                  rows={14}
                  disabled
                />
              </section>

              {/* PUBLIC CONTENT */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />

                  <h2 className="text-lg font-black text-slate-900">
                    Public Content
                  </h2>
                </div>

                <div className="space-y-5">
                  <Textarea
                    label="Main Interview Content (Markdown)"
                    value={
                      form.contentMarkdown
                    }
                    onChange={(
                      value
                    ) =>
                      updateRoot(
                        "contentMarkdown",
                        value
                      )
                    }
                    rows={22}
                    placeholder="Admin can remove external promotions, improve formatting and add relevant TargetTrek links here."
                  />

                  <Textarea
                    label="Summary"
                    value={
                      form.summaryMarkdown
                    }
                    onChange={(
                      value
                    ) =>
                      updateRoot(
                        "summaryMarkdown",
                        value
                      )
                    }
                    rows={6}
                  />

                  <Textarea
                    label="Preparation Strategy"
                    value={
                      form.preparationMarkdown
                    }
                    onChange={(
                      value
                    ) =>
                      updateRoot(
                        "preparationMarkdown",
                        value
                      )
                    }
                  />

                  <Textarea
                    label="Advice"
                    value={
                      form.adviceMarkdown
                    }
                    onChange={(
                      value
                    ) =>
                      updateRoot(
                        "adviceMarkdown",
                        value
                      )
                    }
                  />

                  <Textarea
                    label="Key Takeaways"
                    value={
                      form.keyTakeawaysMarkdown
                    }
                    onChange={(
                      value
                    ) =>
                      updateRoot(
                        "keyTakeawaysMarkdown",
                        value
                      )
                    }
                  />
                </div>
              </section>

              {/* ROUNDS */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Structured
                      Interview Rounds
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Optional
                      structured data
                      for richer public
                      pages.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addRound}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Add Round
                  </button>
                </div>

                <div className="space-y-5">
                  {form.rounds.map(
                    (
                      round,
                      roundIndex
                    ) => (
                      <div
                        key={
                          round._id ||
                          roundIndex
                        }
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                      >
                        <div className="mb-5 flex items-center justify-between">
                          <h3 className="font-black text-slate-900">
                            Round{" "}
                            {roundIndex +
                              1}
                          </h3>

                          <button
                            type="button"
                            onClick={() =>
                              removeRound(
                                roundIndex
                              )
                            }
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          <Input
                            label="Round Title"
                            value={
                              round.title
                            }
                            onChange={(
                              value
                            ) =>
                              updateRound(
                                roundIndex,
                                "title",
                                value
                              )
                            }
                          />

                          <Input
                            label="Type"
                            value={
                              round.type
                            }
                            onChange={(
                              value
                            ) =>
                              updateRound(
                                roundIndex,
                                "type",
                                value
                              )
                            }
                          />

                          <Input
                            label="Duration Minutes"
                            value={
                              round.durationMinutes ??
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateRound(
                                roundIndex,
                                "durationMinutes",
                                value
                              )
                            }
                          />

                          <Select
                            label="Difficulty"
                            value={
                              round.difficulty ||
                              "NOT_SPECIFIED"
                            }
                            onChange={(
                              value
                            ) =>
                              updateRound(
                                roundIndex,
                                "difficulty",
                                value
                              )
                            }
                            options={
                              DIFFICULTIES
                            }
                          />

                          <Select
                            label="Mode"
                            value={
                              round.mode ||
                              "NOT_SPECIFIED"
                            }
                            onChange={(
                              value
                            ) =>
                              updateRound(
                                roundIndex,
                                "mode",
                                value
                              )
                            }
                            options={
                              MODES
                            }
                          />

                          <Input
                            label="Platform"
                            value={
                              round.platform ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateRound(
                                roundIndex,
                                "platform",
                                value
                              )
                            }
                          />
                        </div>

                        <div className="mt-4 space-y-4">
                          <Input
                            label="Topics - comma separated"
                            value={arrayToText(
                              round.topics
                            )}
                            onChange={(
                              value
                            ) =>
                              updateRound(
                                roundIndex,
                                "topics",
                                textToArray(
                                  value
                                )
                              )
                            }
                          />

                          <Textarea
                            label="Round Content"
                            value={
                              round.contentMarkdown ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateRound(
                                roundIndex,
                                "contentMarkdown",
                                value
                              )
                            }
                          />

                          <Textarea
                            label="Round Takeaway"
                            value={
                              round.takeawayMarkdown ||
                              ""
                            }
                            onChange={(
                              value
                            ) =>
                              updateRound(
                                roundIndex,
                                "takeawayMarkdown",
                                value
                              )
                            }
                            rows={4}
                          />
                        </div>

                        {/* QUESTIONS */}

                        <div className="mt-5 border-t border-slate-200 pt-5">
                          <div className="mb-4 flex items-center justify-between">
                            <h4 className="font-bold text-slate-800">
                              Questions
                            </h4>

                            <button
                              type="button"
                              onClick={() =>
                                addQuestion(
                                  roundIndex
                                )
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Question
                            </button>
                          </div>

                          <div className="space-y-4">
                            {(
                              round.questions ||
                              []
                            ).map(
                              (
                                question,
                                questionIndex
                              ) => (
                                <div
                                  key={
                                    question._id ||
                                    questionIndex
                                  }
                                  className="rounded-xl border border-slate-200 bg-white p-4"
                                >
                                  <div className="mb-4 flex justify-between">
                                    <span className="text-xs font-black uppercase text-slate-500">
                                      Question{" "}
                                      {questionIndex +
                                        1}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        removeQuestion(
                                          roundIndex,
                                          questionIndex
                                        )
                                      }
                                      className="text-red-500"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>

                                  <div className="space-y-4">
                                    <Textarea
                                      label="Question"
                                      value={
                                        question.question ||
                                        ""
                                      }
                                      onChange={(
                                        value
                                      ) =>
                                        updateQuestion(
                                          roundIndex,
                                          questionIndex,
                                          "question",
                                          value
                                        )
                                      }
                                      rows={
                                        3
                                      }
                                    />

                                    <div className="grid gap-4 md:grid-cols-2">
                                      <Input
                                        label="Type"
                                        value={
                                          question.type ||
                                          "OTHER"
                                        }
                                        onChange={(
                                          value
                                        ) =>
                                          updateQuestion(
                                            roundIndex,
                                            questionIndex,
                                            "type",
                                            value
                                          )
                                        }
                                      />

                                      <Select
                                        label="Difficulty"
                                        value={
                                          question.difficulty ||
                                          "NOT_SPECIFIED"
                                        }
                                        onChange={(
                                          value
                                        ) =>
                                          updateQuestion(
                                            roundIndex,
                                            questionIndex,
                                            "difficulty",
                                            value
                                          )
                                        }
                                        options={
                                          DIFFICULTIES
                                        }
                                      />
                                    </div>

                                    <Input
                                      label="Topics - comma separated"
                                      value={arrayToText(
                                        question.topics
                                      )}
                                      onChange={(
                                        value
                                      ) =>
                                        updateQuestion(
                                          roundIndex,
                                          questionIndex,
                                          "topics",
                                          textToArray(
                                            value
                                          )
                                        )
                                      }
                                    />

                                    <Textarea
                                      label="Description"
                                      value={
                                        question.descriptionMarkdown ||
                                        ""
                                      }
                                      onChange={(
                                        value
                                      ) =>
                                        updateQuestion(
                                          roundIndex,
                                          questionIndex,
                                          "descriptionMarkdown",
                                          value
                                        )
                                      }
                                    />

                                    <Textarea
                                      label="Approach"
                                      value={
                                        question.approachMarkdown ||
                                        ""
                                      }
                                      onChange={(
                                        value
                                      ) =>
                                        updateQuestion(
                                          roundIndex,
                                          questionIndex,
                                          "approachMarkdown",
                                          value
                                        )
                                      }
                                    />

                                    <Input
                                      label="Follow-ups - comma separated"
                                      value={arrayToText(
                                        question.followUps
                                      )}
                                      onChange={(
                                        value
                                      ) =>
                                        updateQuestion(
                                          roundIndex,
                                          questionIndex,
                                          "followUps",
                                          textToArray(
                                            value
                                          )
                                        )
                                      }
                                    />

                                    <Input
                                      label="External URL"
                                      value={
                                        question.externalUrl ||
                                        ""
                                      }
                                      onChange={(
                                        value
                                      ) =>
                                        updateQuestion(
                                          roundIndex,
                                          questionIndex,
                                          "externalUrl",
                                          value
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}

                  {form.rounds
                    .length ===
                    0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
                      No structured
                      rounds yet.
                    </div>
                  )}
                </div>
              </section>

              {/* TAXONOMY */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-black text-slate-900">
                  Topics, Technologies
                  & Search
                </h2>

                <div className="space-y-5">
                  <Input
                    label="Topics - comma separated"
                    value={arrayToText(
                      form.topics
                    )}
                    onChange={(
                      value
                    ) =>
                      updateRoot(
                        "topics",
                        textToArray(
                          value
                        )
                      )
                    }
                  />

                  <Input
                    label="Technologies - comma separated"
                    value={arrayToText(
                      form.technologies
                    )}
                    onChange={(
                      value
                    ) =>
                      updateRoot(
                        "technologies",
                        textToArray(
                          value
                        )
                      )
                    }
                  />

                  <Input
                    label="Tags - comma separated"
                    value={arrayToText(
                      form.tags
                    )}
                    onChange={(
                      value
                    ) =>
                      updateRoot(
                        "tags",
                        textToArray(
                          value
                        )
                      )
                    }
                  />

                  <Input
                    label="Search Keywords - comma separated"
                    value={arrayToText(
                      form.searchKeywords
                    )}
                    onChange={(
                      value
                    ) =>
                      updateRoot(
                        "searchKeywords",
                        textToArray(
                          value
                        )
                      )
                    }
                  />
                </div>
              </section>

              {/* SEO */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-black text-slate-900">
                  SEO Metadata
                </h2>

                <div className="space-y-5">
                  <Input
                    label="SEO Title"
                    value={
                      form.seo.title
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "seo",
                        "title",
                        value
                      )
                    }
                  />

                  <Textarea
                    label="SEO Description"
                    value={
                      form.seo
                        .description
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "seo",
                        "description",
                        value
                      )
                    }
                    rows={4}
                  />

                  <Input
                    label="Canonical Path"
                    value={
                      form.seo
                        .canonicalPath
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "seo",
                        "canonicalPath",
                        value
                      )
                    }
                  />

                  <Input
                    label="OG Title"
                    value={
                      form.seo
                        .ogTitle
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "seo",
                        "ogTitle",
                        value
                      )
                    }
                  />

                  <Textarea
                    label="OG Description"
                    value={
                      form.seo
                        .ogDescription
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "seo",
                        "ogDescription",
                        value
                      )
                    }
                    rows={4}
                  />

                  <Input
                    label="OG Image URL"
                    value={
                      form.seo
                        .ogImage
                    }
                    onChange={(
                      value
                    ) =>
                      updateNested(
                        "seo",
                        "ogImage",
                        value
                      )
                    }
                  />
                </div>
              </section>

              {/* ADMIN */}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-lg font-black text-slate-900">
                  Admin Controls
                </h2>

                <div className="grid gap-5 md:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                    <input
                      type="checkbox"
                      checked={
                        form.featured
                      }
                      onChange={(
                        event
                      ) =>
                        updateRoot(
                          "featured",
                          event
                            .target
                            .checked
                        )
                      }
                    />

                    <span className="text-sm font-bold">
                      Featured
                    </span>
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                    <input
                      type="checkbox"
                      checked={
                        form.editorPick
                      }
                      onChange={(
                        event
                      ) =>
                        updateRoot(
                          "editorPick",
                          event
                            .target
                            .checked
                        )
                      }
                    />

                    <span className="text-sm font-bold">
                      Editor's Pick
                    </span>
                  </label>

                  <Input
                    label="Display Priority"
                    value={
                      form.displayPriority
                    }
                    onChange={(
                      value
                    ) =>
                      updateRoot(
                        "displayPriority",
                        value
                      )
                    }
                  />
                </div>

                <div className="mt-5">
                  <Textarea
                    label="Private Admin Notes"
                    value={
                      form.adminNotes
                    }
                    onChange={(
                      value
                    ) =>
                      updateRoot(
                        "adminNotes",
                        value
                      )
                    }
                    rows={6}
                    placeholder="Why was it rejected? What was edited? Any moderation notes..."
                  />
                </div>
              </section>

              {/* READ ONLY SYSTEM INFO */}

              <section className="rounded-2xl border border-slate-200 bg-slate-100 p-6">
                <h2 className="mb-5 font-black text-slate-900">
                  System Information
                </h2>

                <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <span className="text-xs text-slate-500">
                      Views
                    </span>

                    <p className="mt-1 font-bold">
                      {interview
                        ?.engagement
                        ?.views ||
                        0}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500">
                      Helpful
                    </span>

                    <p className="mt-1 font-bold">
                      {interview
                        ?.engagement
                        ?.helpful ||
                        0}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500">
                      Reports
                    </span>

                    <p className="mt-1 font-bold">
                      {interview
                        ?.engagement
                        ?.reports ||
                        0}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500">
                      Spam Score
                    </span>

                    <p className="mt-1 font-bold">
                      {interview
                        ?.submissionMeta
                        ?.spamScore ||
                        0}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500">
                      Created
                    </span>

                    <p className="mt-1 font-bold">
                      {formatDateTime(
                        interview.createdAt
                      )}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500">
                      Published
                    </span>

                    <p className="mt-1 font-bold">
                      {formatDateTime(
                        interview
                          ?.moderation
                          ?.publishedAt
                      )}
                    </p>
                  </div>
                </div>

                {interview
                  ?.submissionMeta
                  ?.spamReasons
                  ?.length >
                  0 && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-xs font-black uppercase text-red-700">
                      Spam Flags
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {interview.submissionMeta.spamReasons.map(
                        (
                          reason
                        ) => (
                          <span
                            key={
                              reason
                            }
                            className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700"
                          >
                            {
                              reason
                            }
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* BOTTOM SAVE */}

              <div className="sticky bottom-4 z-20 flex justify-end">
                <button
                  type="button"
                  disabled={
                    saving
                  }
                  onClick={
                    saveInterview
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-black text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />

                  {saving
                    ? "Saving..."
                    : "Save All Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

export default AdminInterviewEdit;