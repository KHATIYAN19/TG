import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

import {
  Plus,
  Search,
  TicketPercent,
  Users,
  BookOpen,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Percent,
  IndianRupee,
  ChevronRight,
  RefreshCw,
  CalendarDays,
  Check,
} from "lucide-react";

import BASE_URL from "../utils/Url";


const PAGE_LIMIT = 10;


const AdminCouponDashboard = () => {
  const navigate = useNavigate();

  const token = useSelector(
    (state) => state.auth.token
  );


  const [coupons, setCoupons] =
    useState([]);

  const [books, setBooks] =
    useState([]);

  const [booksLoading, setBooksLoading] =
    useState(false);

  const [bookSearch, setBookSearch] =
    useState("");


  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("all");


  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [total, setTotal] =
    useState(0);


  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [creating, setCreating] =
    useState(false);

  const [createError, setCreateError] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  const [formData, setFormData] =
    useState({
      code: "",
      name: "",
      description: "",

      discountType:
        "PERCENTAGE",

      discountValue: "",

      maxDiscountAmount: "",

      minimumOrderAmount: "",

      appliesToAllBooks: true,

      applicableBooks: [],

      usageLimit: "",

      perUserLimit: "1",

      validFrom: "",

      validTill: "",

      isActive: true,
    });


  const buildHeaders = () => ({
    "Content-Type":
      "application/json",

    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),
  });


  const extractBooks = (result) => {
    if (
      Array.isArray(result)
    ) {
      return result;
    }

    if (
      Array.isArray(result?.data)
    ) {
      return result.data;
    }

    if (
      Array.isArray(
        result?.data?.books
      )
    ) {
      return result.data.books;
    }

    if (
      Array.isArray(result?.books)
    ) {
      return result.books;
    }

    return [];
  };


  const fetchBooks =
    useCallback(async () => {
      try {
        setBooksLoading(true);

        const response =
          await fetch(
            `${BASE_URL}/book`,
            {
              method: "GET",

              headers:
                buildHeaders(),
            }
          );

        const result =
          await response
            .json()
            .catch(() => null);

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Unable to fetch books."
          );
        }

        setBooks(
          extractBooks(result)
        );
      } catch (err) {
        console.error(
          "Fetch books error:",
          err
        );
      } finally {
        setBooksLoading(false);
      }
    }, [token]);


  const fetchCoupons =
    useCallback(
      async (
        page = 1,
        showRefreshLoader = false
      ) => {
        try {
          if (
            showRefreshLoader
          ) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const params =
            new URLSearchParams();

          params.set(
            "page",
            page
          );

          params.set(
            "limit",
            PAGE_LIMIT
          );

          if (search.trim()) {
            params.set(
              "search",
              search.trim()
            );
          }

          if (
            status !== "all"
          ) {
            params.set(
              "status",
              status
            );
          }

          const response =
            await fetch(
              `${BASE_URL}/api/coupon/admin?${params.toString()}`,
              {
                method: "GET",

                headers:
                  buildHeaders(),
              }
            );

          const data =
            await response
              .json()
              .catch(() => null);

          if (
            !response.ok ||
            !data?.success
          ) {
            throw new Error(
              data?.message ||
                "Unable to fetch coupons."
            );
          }

          setCoupons(
            data.data || []
          );

          setTotal(
            data.pagination
              ?.total || 0
          );

          setTotalPages(
            data.pagination
              ?.totalPages || 1
          );

          setCurrentPage(
            data.pagination
              ?.page || page
          );
        } catch (err) {
          console.error(
            "Fetch coupons error:",
            err
          );

          setError(
            err.message ||
              "Unable to fetch coupons."
          );
        } finally {
          setLoading(false);

          setRefreshing(false);
        }
      },
      [
        token,
        search,
        status,
      ]
    );


  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);


  useEffect(() => {
    const timeout =
      setTimeout(() => {
        setCurrentPage(1);

        fetchCoupons(1);
      }, 350);

    return () => {
      clearTimeout(
        timeout
      );
    };
  }, [
    search,
    status,
    fetchCoupons,
  ]);


  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      description: "",

      discountType:
        "PERCENTAGE",

      discountValue: "",

      maxDiscountAmount: "",

      minimumOrderAmount: "",

      appliesToAllBooks: true,

      applicableBooks: [],

      usageLimit: "",

      perUserLimit: "1",

      validFrom: "",

      validTill: "",

      isActive: true,
    });

    setBookSearch("");

    setCreateError("");
  };


  const openCreateModal = () => {
    resetForm();

    setShowCreateModal(true);

    if (!books.length) {
      fetchBooks();
    }
  };


  const closeCreateModal = () => {
    if (creating) {
      return;
    }

    setShowCreateModal(false);

    resetForm();
  };


  const handleInputChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );
  };


  const toggleBook = (
    bookId
  ) => {
    setFormData(
      (previous) => {
        const selected =
          previous
            .applicableBooks
            .includes(bookId);

        return {
          ...previous,

          applicableBooks:
            selected
              ? previous
                  .applicableBooks
                  .filter(
                    (id) =>
                      id !==
                      bookId
                  )
              : [
                  ...previous
                    .applicableBooks,
                  bookId,
                ],
        };
      }
    );
  };


  const selectAllBooks = () => {
    setFormData(
      (previous) => ({
        ...previous,

        applicableBooks:
          books
            .map(
              (book) =>
                book._id
            )
            .filter(Boolean),
      })
    );
  };


  const clearAllBooks = () => {
    setFormData(
      (previous) => ({
        ...previous,

        applicableBooks: [],
      })
    );
  };


  const createCoupon =
    async (event) => {
      event.preventDefault();

      try {
        setCreating(true);

        setCreateError("");


        if (
          !formData.code.trim()
        ) {
          throw new Error(
            "Coupon code is required."
          );
        }


        if (
          !formData.name.trim()
        ) {
          throw new Error(
            "Coupon name is required."
          );
        }


        if (
          formData
            .discountValue ===
          ""
        ) {
          throw new Error(
            "Discount value is required."
          );
        }


        if (
          Number(
            formData
              .discountValue
          ) < 0
        ) {
          throw new Error(
            "Discount cannot be negative."
          );
        }


        if (
          formData
            .discountType ===
            "PERCENTAGE" &&
          Number(
            formData
              .discountValue
          ) > 100
        ) {
          throw new Error(
            "Percentage discount cannot exceed 100%."
          );
        }


        if (
          !formData
            .appliesToAllBooks &&
          formData
            .applicableBooks
            .length === 0
        ) {
          throw new Error(
            "Select at least one book."
          );
        }


        if (
          formData.validFrom &&
          formData.validTill &&
          new Date(
            formData.validTill
          ) <=
            new Date(
              formData.validFrom
            )
        ) {
          throw new Error(
            "Valid Till must be after Valid From."
          );
        }


        const payload = {
          code:
            formData.code
              .trim()
              .toUpperCase(),

          name:
            formData.name
              .trim(),

          description:
            formData
              .description
              .trim() ||
            null,

          discountType:
            formData
              .discountType,

          discountValue:
            Number(
              formData
                .discountValue
            ),

          maxDiscountAmount:
            formData
              .maxDiscountAmount ===
            ""
              ? null
              : Number(
                  formData
                    .maxDiscountAmount
                ),

          minimumOrderAmount:
            formData
              .minimumOrderAmount ===
            ""
              ? 0
              : Number(
                  formData
                    .minimumOrderAmount
                ),

          appliesToAllBooks:
            formData
              .appliesToAllBooks,

          applicableBooks:
            formData
              .appliesToAllBooks
              ? []
              : formData
                  .applicableBooks,

          usageLimit:
            formData
              .usageLimit ===
            ""
              ? null
              : Number(
                  formData
                    .usageLimit
                ),

          perUserLimit:
            formData
              .perUserLimit ===
            ""
              ? 1
              : Number(
                  formData
                    .perUserLimit
                ),

          validFrom:
            formData.validFrom
              ? new Date(
                  formData.validFrom
                ).toISOString()
              : null,

          validTill:
            formData.validTill
              ? new Date(
                  formData.validTill
                ).toISOString()
              : null,

          isActive:
            formData.isActive,
        };


        const response =
          await fetch(
            `${BASE_URL}/api/coupon/admin`,
            {
              method:
                "POST",

              headers:
                buildHeaders(),

              body:
                JSON.stringify(
                  payload
                ),
            }
          );


        const data =
          await response
            .json()
            .catch(() => null);


        if (
          !response.ok ||
          !data?.success
        ) {
          throw new Error(
            data?.message ||
              "Unable to create coupon."
          );
        }


        setShowCreateModal(
          false
        );

        resetForm();

        setSuccessMessage(
          "Coupon created successfully."
        );

        await fetchCoupons(
          1,
          true
        );

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } catch (err) {
        console.error(
          "Create coupon error:",
          err
        );

        setCreateError(
          err.message ||
            "Unable to create coupon."
        );
      } finally {
        setCreating(false);
      }
    };


  const filteredBooks =
    useMemo(() => {
      const query =
        bookSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return books;
      }

      return books.filter(
        (book) =>
          book.title
            ?.toLowerCase()
            .includes(query) ||
          book.slug
            ?.toLowerCase()
            .includes(query) ||
          book.category
            ?.toLowerCase()
            .includes(query)
      );
    }, [
      books,
      bookSearch,
    ]);


  const stats =
    useMemo(() => {
      const active =
        coupons.filter(
          (coupon) =>
            coupon.isActive
        ).length;

      const inactive =
        coupons.length -
        active;

      const totalUsed =
        coupons.reduce(
          (
            sum,
            coupon
          ) =>
            sum +
            Number(
              coupon.usedCount ||
                0
            ),
          0
        );

      return {
        active,
        inactive,
        totalUsed,
      };
    }, [coupons]);


  const formatDate = (
    value
  ) => {
    if (!value) {
      return "No expiry";
    }

    return new Date(
      value
    ).toLocaleString(
      "en-IN",
      {
        dateStyle:
          "medium",

        timeStyle:
          "short",
      }
    );
  };


  const getDiscountLabel = (
    coupon
  ) => {
    if (
      coupon.discountType ===
      "PERCENTAGE"
    ) {
      return `${coupon.discountValue}% OFF`;
    }

    return `₹${coupon.discountValue} OFF`;
  };


  const getPageNumbers = () => {
    if (
      totalPages <= 1
    ) {
      return [];
    }

    const pages = [];

    let start =
      Math.max(
        currentPage - 2,
        1
      );

    let end =
      Math.min(
        start + 4,
        totalPages
      );

    if (
      end - start < 4
    ) {
      start =
        Math.max(
          end - 4,
          1
        );
    }

    for (
      let page = start;
      page <= end;
      page++
    ) {
      pages.push(page);
    }

    return pages;
  };


  return (
    <div className="min-h-screen bg-slate-50">

      {/* Added top spacing for admin navbar/header */}
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 sm:pt-28 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <TicketPercent
                  size={23}
                />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Coupon Management
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Create and manage discount coupons.
                </p>
              </div>

            </div>

          </div>


          <div className="flex gap-3">

            <button
              type="button"
              onClick={() =>
                fetchCoupons(
                  currentPage,
                  true
                )
              }
              disabled={
                refreshing
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>


            <button
              type="button"
              onClick={
                openCreateModal
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus
                size={18}
              />

              Add Coupon
            </button>

          </div>

        </div>


        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            <CheckCircle2
              size={18}
            />

            {
              successMessage
            }
          </div>
        )}


        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={
              <TicketPercent
                size={22}
              />
            }
            label="Total Coupons"
            value={total}
          />

          <StatCard
            icon={
              <CheckCircle2
                size={22}
              />
            }
            label="Active On Page"
            value={
              stats.active
            }
          />

          <StatCard
            icon={
              <X
                size={22}
              />
            }
            label="Inactive On Page"
            value={
              stats.inactive
            }
          />

          <StatCard
            icon={
              <Users
                size={22}
              />
            }
            label="Uses On Page"
            value={
              stats.totalUsed
            }
          />

        </div>


        {/* Search and Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 md:flex-row">

            <div className="relative flex-1">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search coupon code or name..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>


            <select
              value={status}
              onChange={(
                event
              ) =>
                setStatus(
                  event.target
                    .value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="all">
                All Coupons
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

          </div>

        </div>


        {/* List */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center">

              <div className="text-center">

                <Loader2
                  size={30}
                  className="mx-auto mb-3 animate-spin text-blue-600"
                />

                <p className="text-sm text-slate-500">
                  Loading coupons...
                </p>

              </div>

            </div>
          ) : error ? (
            <div className="flex min-h-[350px] items-center justify-center p-6">

              <div className="max-w-md text-center">

                <AlertCircle
                  size={36}
                  className="mx-auto mb-3 text-red-500"
                />

                <p className="mb-4 text-sm font-semibold text-red-600">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    fetchCoupons(
                      currentPage
                    )
                  }
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Try Again
                </button>

              </div>

            </div>
          ) : coupons.length ===
            0 ? (
            <div className="flex min-h-[350px] items-center justify-center p-6">

              <div className="text-center">

                <TicketPercent
                  size={44}
                  className="mx-auto mb-4 text-slate-300"
                />

                <h3 className="text-lg font-bold text-slate-800">
                  No coupons found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Create a coupon to get started.
                </p>

                <button
                  type="button"
                  onClick={
                    openCreateModal
                  }
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Add Coupon
                </button>

              </div>

            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {coupons.map(
                (coupon) => (
                  <CouponRow
                    key={
                      coupon._id
                    }
                    coupon={
                      coupon
                    }
                    formatDate={
                      formatDate
                    }
                    getDiscountLabel={
                      getDiscountLabel
                    }
                    onClick={() =>
                      navigate(
                        `/admin/coupon/${coupon._id}`
                      )
                    }
                  />
                )
              )}

            </div>
          )}

        </div>


        {/* Pagination */}
        {!loading &&
          !error &&
          total > PAGE_LIMIT &&
          totalPages > 1 && (
            <div className="mt-7 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row">

              <div>

                <p className="text-sm font-semibold text-slate-700">
                  Page{" "}
                  {currentPage}{" "}
                  of{" "}
                  {totalPages}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  {total} total coupons · {PAGE_LIMIT} per page
                </p>

              </div>


              <div className="flex flex-wrap items-center justify-center gap-2">

                <button
                  type="button"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    fetchCoupons(
                      currentPage -
                        1
                    )
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>


                {getPageNumbers().map(
                  (page) => (
                    <button
                      type="button"
                      key={page}
                      onClick={() =>
                        fetchCoupons(
                          page
                        )
                      }
                      className={`h-9 min-w-9 rounded-lg px-3 text-sm font-bold transition ${
                        page ===
                        currentPage
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}


                <button
                  type="button"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    fetchCoupons(
                      currentPage +
                        1
                    )
                  }
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>

              </div>

            </div>
          )}

      </div>


      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Create Coupon
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Configure coupon rules and applicable books.
                </p>

              </div>


              <button
                type="button"
                onClick={
                  closeCreateModal
                }
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X
                  size={20}
                />
              </button>

            </div>


            <form
              onSubmit={
                createCoupon
              }
              className="space-y-6 p-6"
            >

              {createError && (
                <ErrorBox>
                  {createError}
                </ErrorBox>
              )}


              <div className="grid gap-5 md:grid-cols-2">

                <InputField
                  label="Coupon Code"
                  required
                >
                  <input
                    name="code"
                    value={
                      formData.code
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="SAVE20"
                    className={
                      inputClass
                    }
                  />
                </InputField>


                <InputField
                  label="Coupon Name"
                  required
                >
                  <input
                    name="name"
                    value={
                      formData.name
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="Summer Sale"
                    className={
                      inputClass
                    }
                  />
                </InputField>

              </div>


              <InputField
                label="Description"
              >
                <textarea
                  rows={3}
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={
                    handleInputChange
                  }
                  placeholder="Optional coupon description..."
                  className={
                    inputClass
                  }
                />
              </InputField>


              <div className="grid gap-5 md:grid-cols-2">

                <InputField
                  label="Discount Type"
                  required
                >
                  <select
                    name="discountType"
                    value={
                      formData
                        .discountType
                    }
                    onChange={
                      handleInputChange
                    }
                    className={
                      inputClass
                    }
                  >
                    <option value="PERCENTAGE">
                      Percentage
                    </option>

                    <option value="FIXED">
                      Fixed Amount
                    </option>
                  </select>
                </InputField>


                <InputField
                  label="Discount Value"
                  required
                >
                  <input
                    type="number"
                    min="0"
                    max={
                      formData
                        .discountType ===
                      "PERCENTAGE"
                        ? 100
                        : undefined
                    }
                    step="0.01"
                    name="discountValue"
                    value={
                      formData
                        .discountValue
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder={
                      formData
                        .discountType ===
                      "PERCENTAGE"
                        ? "20"
                        : "100"
                    }
                    className={
                      inputClass
                    }
                  />
                </InputField>

              </div>


              <div className="grid gap-5 md:grid-cols-2">

                <InputField
                  label="Maximum Discount"
                  hint="Optional. Mostly useful for percentage coupons."
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="maxDiscountAmount"
                    value={
                      formData
                        .maxDiscountAmount
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="200"
                    className={
                      inputClass
                    }
                  />
                </InputField>


                <InputField
                  label="Minimum Order Amount"
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="minimumOrderAmount"
                    value={
                      formData
                        .minimumOrderAmount
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="299"
                    className={
                      inputClass
                    }
                  />
                </InputField>

              </div>


              {/* BOOK SELECTION */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                <div className="flex items-start gap-3">

                  <input
                    type="checkbox"
                    id="all-books"
                    name="appliesToAllBooks"
                    checked={
                      formData
                        .appliesToAllBooks
                    }
                    onChange={
                      handleInputChange
                    }
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600"
                  />


                  <label
                    htmlFor="all-books"
                    className="cursor-pointer"
                  >
                    <p className="text-sm font-bold text-slate-900">
                      Apply coupon to all books
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      When enabled, this coupon works on every active book.
                    </p>
                  </label>

                </div>


                {!formData
                  .appliesToAllBooks && (
                  <div className="mt-5 border-t border-slate-200 pt-5">

                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <p className="font-bold text-slate-900">
                          Select Books
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formData.applicableBooks.length} book(s) selected
                        </p>

                      </div>


                      <div className="flex gap-2">

                        <button
                          type="button"
                          onClick={
                            selectAllBooks
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Select All
                        </button>

                        <button
                          type="button"
                          onClick={
                            clearAllBooks
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          Clear
                        </button>

                      </div>

                    </div>


                    <div className="relative mb-4">

                      <Search
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        value={
                          bookSearch
                        }
                        onChange={(
                          event
                        ) =>
                          setBookSearch(
                            event.target
                              .value
                          )
                        }
                        placeholder="Search books..."
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                    </div>


                    {booksLoading ? (
                      <div className="flex items-center justify-center py-10">

                        <Loader2
                          size={24}
                          className="animate-spin text-blue-600"
                        />

                      </div>
                    ) : filteredBooks.length ===
                      0 ? (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center">

                        <BookOpen
                          size={30}
                          className="mx-auto mb-2 text-slate-300"
                        />

                        <p className="text-sm font-semibold text-slate-600">
                          No books found.
                        </p>

                      </div>
                    ) : (
                      <div className="grid max-h-80 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">

                        {filteredBooks.map(
                          (book) => (
                            <BookOption
                              key={
                                book._id
                              }
                              book={
                                book
                              }
                              selected={
                                formData
                                  .applicableBooks
                                  .includes(
                                    book._id
                                  )
                              }
                              onClick={() =>
                                toggleBook(
                                  book._id
                                )
                              }
                            />
                          )
                        )}

                      </div>
                    )}

                  </div>
                )}

              </div>


              <div className="grid gap-5 md:grid-cols-2">

                <InputField
                  label="Total Usage Limit"
                  hint="Leave empty for unlimited usage."
                >
                  <input
                    type="number"
                    min="1"
                    name="usageLimit"
                    value={
                      formData
                        .usageLimit
                    }
                    onChange={
                      handleInputChange
                    }
                    placeholder="100"
                    className={
                      inputClass
                    }
                  />
                </InputField>


                <InputField
                  label="Per User Limit"
                >
                  <input
                    type="number"
                    min="1"
                    name="perUserLimit"
                    value={
                      formData
                        .perUserLimit
                    }
                    onChange={
                      handleInputChange
                    }
                    className={
                      inputClass
                    }
                  />
                </InputField>

              </div>


              <div className="grid gap-5 md:grid-cols-2">

                <InputField
                  label="Valid From"
                >
                  <input
                    type="datetime-local"
                    name="validFrom"
                    value={
                      formData.validFrom
                    }
                    onChange={
                      handleInputChange
                    }
                    className={
                      inputClass
                    }
                  />
                </InputField>


                <InputField
                  label="Valid Till"
                >
                  <input
                    type="datetime-local"
                    name="validTill"
                    value={
                      formData.validTill
                    }
                    onChange={
                      handleInputChange
                    }
                    className={
                      inputClass
                    }
                  />
                </InputField>

              </div>


              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">

                <input
                  type="checkbox"
                  name="isActive"
                  checked={
                    formData.isActive
                  }
                  onChange={
                    handleInputChange
                  }
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />

                <div>

                  <p className="text-sm font-bold text-slate-800">
                    Coupon Active
                  </p>

                  <p className="text-xs text-slate-500">
                    Customers can immediately use this coupon.
                  </p>

                </div>

              </label>


              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={
                    closeCreateModal
                  }
                  disabled={
                    creating
                  }
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={
                    creating
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus
                        size={17}
                      />

                      Create Coupon
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};


const BookOption = ({
  book,
  selected,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-3 rounded-xl border p-3 text-left transition ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-slate-200 bg-white hover:border-blue-300"
      }`}
    >

      {book.coverPageUrl ? (
        <img
          src={
            book.coverPageUrl
          }
          alt={
            book.title
          }
          className="h-14 w-10 shrink-0 rounded-md border border-slate-200 object-cover"
        />
      ) : (
        <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-400">
          <BookOpen
            size={18}
          />
        </div>
      )}


      <div className="min-w-0 flex-1">

        <p className="line-clamp-2 text-sm font-bold text-slate-900">
          {
            book.title ||
            "Untitled Book"
          }
        </p>

        <div className="mt-1 flex items-center gap-2">

          {book.price !==
            undefined && (
            <span className="text-xs font-semibold text-blue-600">
              ₹
              {book.price}
            </span>
          )}

          {book.category && (
            <span className="truncate text-xs text-slate-400">
              {
                book.category
              }
            </span>
          )}

        </div>

      </div>


      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
          selected
            ? "border-blue-600 bg-blue-600 text-white"
            : "border-slate-300 bg-white"
        }`}
      >
        {selected && (
          <Check
            size={14}
          />
        )}
      </div>

    </button>
  );
};


const CouponRow = ({
  coupon,
  onClick,
  formatDate,
  getDiscountLabel,
}) => {
  const expired =
    coupon.validTill &&
    new Date(
      coupon.validTill
    ) < new Date();

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full flex-col gap-4 p-5 text-left transition hover:bg-slate-50 lg:flex-row lg:items-center lg:justify-between"
    >

      <div className="flex min-w-0 flex-1 items-start gap-4">

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

          {coupon.discountType ===
          "PERCENTAGE" ? (
            <Percent
              size={21}
            />
          ) : (
            <IndianRupee
              size={21}
            />
          )}

        </div>


        <div className="min-w-0">

          <div className="mb-1 flex flex-wrap items-center gap-2">

            <span className="rounded-lg bg-slate-900 px-2.5 py-1 font-mono text-sm font-bold text-white">
              {
                coupon.code
              }
            </span>

            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                coupon.isActive &&
                !expired
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {expired
                ? "Expired"
                : coupon.isActive
                  ? "Active"
                  : "Inactive"}
            </span>

          </div>


          <h3 className="truncate font-semibold text-slate-900">
            {
              coupon.name
            }
          </h3>


          {coupon.description && (
            <p className="mt-1 line-clamp-1 text-sm text-slate-500">
              {
                coupon.description
              }
            </p>
          )}

        </div>

      </div>


      <div className="grid w-full grid-cols-2 gap-4 lg:w-auto lg:grid-cols-4 lg:gap-8">

        <InfoItem
          label="Discount"
          value={
            getDiscountLabel(
              coupon
            )
          }
        />

        <InfoItem
          label="Used"
          value={
            coupon.usageLimit
              ? `${coupon.usedCount || 0}/${coupon.usageLimit}`
              : `${
                  coupon.usedCount ||
                  0
                }`
          }
        />

        <InfoItem
          label="Books"
          value={
            coupon
              .appliesToAllBooks
              ? "All Books"
              : `${coupon.applicableBooks?.length || 0} Books`
          }
        />

        <InfoItem
          label="Expires"
          value={
            formatDate(
              coupon.validTill
            )
          }
        />

      </div>


      <ChevronRight
        size={20}
        className="hidden shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600 lg:block"
      />

    </button>
  );
};


const StatCard = ({
  icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
      {icon}
    </div>

    <p className="text-sm font-medium text-slate-500">
      {label}
    </p>

    <p className="mt-1 text-2xl font-bold text-slate-900">
      {value}
    </p>

  </div>
);


const InfoItem = ({
  label,
  value,
}) => (
  <div>

    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 max-w-[170px] truncate text-sm font-semibold text-slate-700">
      {value}
    </p>

  </div>
);


const InputField = ({
  label,
  hint,
  required,
  children,
}) => (
  <div>

    <label className="mb-2 block text-sm font-semibold text-slate-700">

      {label}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}

    </label>

    {children}

    {hint && (
      <p className="mt-1 text-xs text-slate-400">
        {hint}
      </p>
    )}

  </div>
);


const ErrorBox = ({
  children,
}) => (
  <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">

    <AlertCircle
      size={18}
      className="mt-0.5 shrink-0"
    />

    {children}

  </div>
);


const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";


export default AdminCouponDashboard;