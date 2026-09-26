import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

import {
  ArrowLeft,
  TicketPercent,
  Percent,
  IndianRupee,
  CalendarDays,
  Users,
  BookOpen,
  Edit3,
  Trash2,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Tag,
  Clock,
  ShieldCheck,
  Search,
  Check,
  RefreshCw,
} from "lucide-react";

import BASE_URL from "../utils/Url";


const CouponDetails = () => {
  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();

  const token = useSelector(
    (state) =>
      state.auth.token
  );


  const [coupon, setCoupon] =
    useState(null);

  const [books, setBooks] =
    useState([]);

  const [booksLoading, setBooksLoading] =
    useState(false);

  const [bookSearch, setBookSearch] =
    useState("");


  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    isEditing,
    setIsEditing,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [
    showDeleteConfirm,
    setShowDeleteConfirm,
  ] = useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    editError,
    setEditError,
  ] = useState("");

  const [copied, setCopied] =
    useState(false);

  const [formData, setFormData] =
    useState(null);


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


  const extractBooks = (
    result
  ) => {
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


  const toDateTimeLocal = (
    value
  ) => {
    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    const localDate =
      new Date(
        date.getTime() -
          date.getTimezoneOffset() *
            60000
      );

    return localDate
      .toISOString()
      .slice(0, 16);
  };


  const couponToForm = (
    couponData
  ) => {
    const selectedBookIds =
      couponData
        .applicableBooks
        ?.map((book) =>
          typeof book === "string"
            ? book
            : book?._id
        )
        .filter(Boolean) ||
      [];

    return {
      code:
        couponData.code || "",

      name:
        couponData.name || "",

      description:
        couponData.description ||
        "",

      discountType:
        couponData.discountType ||
        "PERCENTAGE",

      discountValue:
        couponData.discountValue ??
        "",

      maxDiscountAmount:
        couponData
          .maxDiscountAmount ??
        "",

      minimumOrderAmount:
        couponData
          .minimumOrderAmount ??
        "",

      appliesToAllBooks:
        Boolean(
          couponData
            .appliesToAllBooks
        ),

      applicableBooks:
        selectedBookIds,

      usageLimit:
        couponData.usageLimit ??
        "",

      perUserLimit:
        couponData.perUserLimit ??
        1,

      validFrom:
        toDateTimeLocal(
          couponData.validFrom
        ),

      validTill:
        toDateTimeLocal(
          couponData.validTill
        ),

      isActive:
        Boolean(
          couponData.isActive
        ),
    };
  };


  const fetchCoupon =
    useCallback(async () => {
      try {
        setLoading(true);

        setError("");

        const response =
          await fetch(
            `${BASE_URL}/api/coupon/admin/${id}`,
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
              "Unable to fetch coupon."
          );
        }

        setCoupon(
          data.data
        );

        setFormData(
          couponToForm(
            data.data
          )
        );
      } catch (err) {
        console.error(
          "Fetch coupon error:",
          err
        );

        setError(
          err.message ||
            "Unable to fetch coupon."
        );
      } finally {
        setLoading(false);
      }
    }, [
      id,
      token,
    ]);


  useEffect(() => {
    if (!id) {
      return;
    }

    fetchCoupon();

    fetchBooks();
  }, [
    id,
    fetchCoupon,
    fetchBooks,
  ]);


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
                      id !== bookId
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


  const clearBooks = () => {
    setFormData(
      (previous) => ({
        ...previous,

        applicableBooks: [],
      })
    );
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


  const handleUpdate =
    async (event) => {
      event.preventDefault();

      try {
        setSaving(true);

        setEditError("");


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
            "Select at least one applicable book."
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
            `${BASE_URL}/api/coupon/admin/${id}`,
            {
              method:
                "PUT",

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
              "Unable to update coupon."
          );
        }


        /*
         * Fetch again so populated book information
         * is always fresh.
         */
        await fetchCoupon();

        setIsEditing(false);

        setSuccessMessage(
          "Coupon updated successfully."
        );

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } catch (err) {
        console.error(
          "Update coupon error:",
          err
        );

        setEditError(
          err.message ||
            "Unable to update coupon."
        );
      } finally {
        setSaving(false);
      }
    };


  const handleDelete =
    async () => {
      try {
        setDeleting(true);

        const response =
          await fetch(
            `${BASE_URL}/api/coupon/admin/${id}`,
            {
              method:
                "DELETE",

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
              "Unable to delete coupon."
          );
        }


        setShowDeleteConfirm(false);

        navigate(
          "/admin/coupon"
        );
      } catch (err) {
        console.error(
          "Delete coupon error:",
          err
        );

        setEditError(
          err.message ||
            "Unable to delete coupon."
        );

        setShowDeleteConfirm(false);
      } finally {
        setDeleting(false);
      }
    };


  const cancelEditing = () => {
    setFormData(
      couponToForm(
        coupon
      )
    );

    setBookSearch("");

    setEditError("");

    setIsEditing(false);
  };


  const copyCouponCode =
    async () => {
      try {
        await navigator
          .clipboard
          .writeText(
            coupon.code
          );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 1500);
      } catch {}
    };


  const formatDate = (
    value
  ) => {
    if (!value) {
      return "Not set";
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


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 pt-24">

        <div className="text-center">

          <Loader2
            size={34}
            className="mx-auto mb-3 animate-spin text-blue-600"
          />

          <p className="text-sm text-slate-500">
            Loading coupon...
          </p>

        </div>

      </div>
    );
  }


  if (
    error ||
    !coupon ||
    !formData
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 pt-24">

        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">

          <AlertCircle
            size={42}
            className="mx-auto mb-4 text-red-500"
          />

          <h2 className="text-xl font-bold text-slate-900">
            Unable to load coupon
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <div className="mt-6 flex justify-center gap-3">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/coupon"
                )
              }
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Back
            </button>

            <button
              type="button"
              onClick={
                fetchCoupon
              }
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Try Again
            </button>

          </div>

        </div>

      </div>
    );
  }


  const expired =
    coupon.validTill &&
    new Date(
      coupon.validTill
    ) < new Date();


  return (
    <div className="min-h-screen bg-slate-50">

      {/* Added top space for admin navbar */}
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-24 sm:px-6 sm:pt-28 lg:px-8">

        <div className="mb-6 flex items-center justify-between gap-3">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/coupon"
              )
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft
              size={18}
            />

            Back to Coupons
          </button>


          <button
            type="button"
            onClick={
              fetchCoupon
            }
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw
              size={14}
            />

            Refresh
          </button>

        </div>


        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">

            <CheckCircle2
              size={18}
            />

            {
              successMessage
            }

          </div>
        )}


        {editError && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">

            <AlertCircle
              size={18}
            />

            {
              editError
            }

          </div>
        )}


        {/* HEADER */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">

            <div className="flex gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <TicketPercent
                  size={27}
                />
              </div>


              <div>

                <div className="mb-2 flex flex-wrap items-center gap-2">

                  <button
                    type="button"
                    onClick={
                      copyCouponCode
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-white"
                  >
                    {
                      coupon.code
                    }

                    <Copy
                      size={14}
                    />
                  </button>


                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
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


                  {copied && (
                    <span className="text-xs font-semibold text-green-600">
                      Copied
                    </span>
                  )}

                </div>


                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  {
                    coupon.name
                  }
                </h1>


                {coupon.description && (
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    {
                      coupon.description
                    }
                  </p>
                )}

              </div>

            </div>


            <div className="flex flex-wrap gap-3">

              {!isEditing && (
                <button
                  type="button"
                  onClick={() =>
                    setIsEditing(
                      true
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Edit3
                    size={17}
                  />

                  Edit Coupon
                </button>
              )}


              <button
                type="button"
                onClick={() =>
                  setShowDeleteConfirm(
                    true
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100"
              >
                <Trash2
                  size={17}
                />

                Delete Coupon
              </button>

            </div>

          </div>

        </div>


        {isEditing ? (
          <form
            onSubmit={
              handleUpdate
            }
            className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Edit Coupon
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update coupon configuration and applicable books.
              </p>

            </div>


            <div className="grid gap-5 md:grid-cols-2">

              <InputField
                label="Coupon Code"
              >
                <input
                  name="code"
                  value={
                    formData.code
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
                label="Coupon Name"
              >
                <input
                  name="name"
                  value={
                    formData.name
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
                className={
                  inputClass
                }
              />
            </InputField>


            <div className="grid gap-5 md:grid-cols-2">

              <InputField
                label="Discount Type"
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
                  className={
                    inputClass
                  }
                />
              </InputField>

            </div>


            <div className="grid gap-5 md:grid-cols-2">

              <InputField
                label="Maximum Discount"
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
                  className={
                    inputClass
                  }
                />
              </InputField>

            </div>


            {/* BOOK SELECTOR */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <label className="flex cursor-pointer items-start gap-3">

                <input
                  type="checkbox"
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

                <div>

                  <p className="text-sm font-bold text-slate-900">
                    Apply to all books
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Coupon will work on every active book.
                  </p>

                </div>

              </label>


              {!formData
                .appliesToAllBooks && (
                <div className="mt-5 border-t border-slate-200 pt-5">

                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <p className="font-bold text-slate-900">
                        Select Applicable Books
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
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
                      >
                        Select All
                      </button>

                      <button
                        type="button"
                        onClick={
                          clearBooks
                        }
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
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
                    <div className="flex justify-center py-10">

                      <Loader2
                        size={24}
                        className="animate-spin text-blue-600"
                      />

                    </div>
                  ) : filteredBooks.length ===
                    0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">
                      No active books found.
                    </p>
                  ) : (
                    <div className="grid max-h-96 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">

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
                className="h-4 w-4 rounded text-blue-600"
              />

              <div>

                <p className="text-sm font-bold text-slate-800">
                  Coupon Active
                </p>

                <p className="text-xs text-slate-500">
                  Allow customers to use this coupon.
                </p>

              </div>

            </label>


            <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">

              <button
                type="button"
                onClick={
                  cancelEditing
                }
                disabled={
                  saving
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <X
                  size={17}
                />

                Cancel
              </button>


              <button
                type="submit"
                disabled={
                  saving
                }
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save
                      size={17}
                    />

                    Save Changes
                  </>
                )}
              </button>

            </div>

          </form>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <DetailStat
                icon={
                  coupon.discountType ===
                  "PERCENTAGE" ? (
                    <Percent
                      size={21}
                    />
                  ) : (
                    <IndianRupee
                      size={21}
                    />
                  )
                }
                label="Discount"
                value={
                  coupon.discountType ===
                  "PERCENTAGE"
                    ? `${coupon.discountValue}%`
                    : `₹${coupon.discountValue}`
                }
              />

              <DetailStat
                icon={
                  <Users
                    size={21}
                  />
                }
                label="Used"
                value={
                  coupon.usageLimit
                    ? `${coupon.usedCount || 0} / ${coupon.usageLimit}`
                    : `${coupon.usedCount || 0}`
                }
              />

              <DetailStat
                icon={
                  <BookOpen
                    size={21}
                  />
                }
                label="Applicable"
                value={
                  coupon
                    .appliesToAllBooks
                    ? "All Books"
                    : `${coupon.applicableBooks?.length || 0} Books`
                }
              />

              <DetailStat
                icon={
                  <ShieldCheck
                    size={21}
                  />
                }
                label="Per User"
                value={`${coupon.perUserLimit || 1} use`}
              />

            </div>


            <div className="grid gap-6 lg:grid-cols-2">

              <SectionCard
                title="Discount Rules"
                icon={
                  <Tag
                    size={19}
                  />
                }
              >

                <DetailRow
                  label="Discount Type"
                  value={
                    coupon.discountType
                  }
                />

                <DetailRow
                  label="Discount Value"
                  value={
                    coupon.discountType ===
                    "PERCENTAGE"
                      ? `${coupon.discountValue}%`
                      : `₹${coupon.discountValue}`
                  }
                />

                <DetailRow
                  label="Maximum Discount"
                  value={
                    coupon.maxDiscountAmount !==
                      null &&
                    coupon.maxDiscountAmount !==
                      undefined
                      ? `₹${coupon.maxDiscountAmount}`
                      : "No limit"
                  }
                />

                <DetailRow
                  label="Minimum Order"
                  value={`₹${coupon.minimumOrderAmount || 0}`}
                />

              </SectionCard>


              <SectionCard
                title="Usage Limits"
                icon={
                  <Users
                    size={19}
                  />
                }
              >

                <DetailRow
                  label="Used Count"
                  value={
                    coupon.usedCount ||
                    0
                  }
                />

                <DetailRow
                  label="Total Limit"
                  value={
                    coupon.usageLimit ||
                    "Unlimited"
                  }
                />

                <DetailRow
                  label="Per User"
                  value={
                    coupon.perUserLimit ||
                    1
                  }
                />

                <DetailRow
                  label="Remaining"
                  value={
                    coupon.usageLimit
                      ? Math.max(
                          coupon.usageLimit -
                            (coupon.usedCount ||
                              0),
                          0
                        )
                      : "Unlimited"
                  }
                />

              </SectionCard>


              <SectionCard
                title="Validity"
                icon={
                  <CalendarDays
                    size={19}
                  />
                }
              >

                <DetailRow
                  label="Valid From"
                  value={
                    formatDate(
                      coupon.validFrom
                    )
                  }
                />

                <DetailRow
                  label="Valid Till"
                  value={
                    coupon.validTill
                      ? formatDate(
                          coupon.validTill
                        )
                      : "No expiry"
                  }
                />

                <DetailRow
                  label="Status"
                  value={
                    expired
                      ? "Expired"
                      : coupon.isActive
                        ? "Active"
                        : "Inactive"
                  }
                />

              </SectionCard>


              <SectionCard
                title="System Information"
                icon={
                  <Clock
                    size={19}
                  />
                }
              >

                <DetailRow
                  label="Created By"
                  value={
                    coupon.createdBy ||
                    "-"
                  }
                />

                <DetailRow
                  label="Updated By"
                  value={
                    coupon.updatedBy ||
                    "-"
                  }
                />

                <DetailRow
                  label="Created At"
                  value={
                    formatDate(
                      coupon.createdAt
                    )
                  }
                />

                <DetailRow
                  label="Updated At"
                  value={
                    formatDate(
                      coupon.updatedAt
                    )
                  }
                />

              </SectionCard>

            </div>


            <div className="mt-6">

              <SectionCard
                title="Applicable Books"
                icon={
                  <BookOpen
                    size={19}
                  />
                }
              >

                {coupon
                  .appliesToAllBooks ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">

                    <p className="font-bold text-green-700">
                      Applies to all active books
                    </p>

                    <p className="mt-1 text-sm text-green-600">
                      Customers can use this coupon on any active book.
                    </p>

                  </div>
                ) : coupon
                    .applicableBooks
                    ?.length >
                  0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">

                    {coupon
                      .applicableBooks
                      .map(
                        (book) => (
                          <div
                            key={
                              typeof book ===
                              "string"
                                ? book
                                : book._id
                            }
                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
                          >

                            {typeof book !==
                              "string" &&
                            book.coverPageUrl ? (
                              <img
                                src={
                                  book.coverPageUrl
                                }
                                alt={
                                  book.title
                                }
                                className="h-14 w-10 rounded-md border border-slate-200 object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-10 items-center justify-center rounded-md bg-white text-slate-400">
                                <BookOpen
                                  size={18}
                                />
                              </div>
                            )}


                            <div className="min-w-0">

                              <p className="line-clamp-2 text-sm font-bold text-slate-800">
                                {typeof book ===
                                "string"
                                  ? book
                                  : book.title}
                              </p>

                              {typeof book !==
                                "string" && (
                                <p className="mt-1 text-xs text-slate-500">
                                  ₹
                                  {book.price}
                                </p>
                              )}

                            </div>

                          </div>
                        )
                      )}

                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No books selected.
                  </p>
                )}

              </SectionCard>

            </div>
          </>
        )}

      </div>


      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2
                size={22}
              />
            </div>


            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Delete this coupon?
            </h2>


            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <strong className="text-slate-800">
                {coupon.code}
              </strong>
              ? Customers will no longer be able to use this coupon.
            </p>


            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">

              <p className="text-xs font-medium leading-5 text-amber-700">
                Previous orders that used this coupon will keep their stored coupon information.
              </p>

            </div>


            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                disabled={
                  deleting
                }
                onClick={() =>
                  setShowDeleteConfirm(
                    false
                  )
                }
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>


              <button
                type="button"
                disabled={
                  deleting
                }
                onClick={
                  handleDelete
                }
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
              >

                {deleting ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2
                      size={17}
                    />

                    Yes, Delete
                  </>
                )}

              </button>

            </div>

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
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
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

      {book.price !==
        undefined && (
        <p className="mt-1 text-xs font-semibold text-blue-600">
          ₹
          {book.price}
        </p>
      )}

    </div>


    <div
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
        selected
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-slate-300"
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


const DetailStat = ({
  icon,
  label,
  value,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
      {icon}
    </div>

    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-xl font-bold text-slate-900">
      {value}
    </p>

  </div>
);


const SectionCard = ({
  title,
  icon,
  children,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

    <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">

      <span className="text-blue-600">
        {icon}
      </span>

      <h2 className="font-bold text-slate-900">
        {title}
      </h2>

    </div>

    <div className="space-y-4">
      {children}
    </div>

  </div>
);


const DetailRow = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between gap-4">

    <span className="text-sm text-slate-500">
      {label}
    </span>

    <span className="text-right text-sm font-semibold text-slate-800">
      {value}
    </span>

  </div>
);


const InputField = ({
  label,
  children,
}) => (
  <div>

    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {label}
    </label>

    {children}

  </div>
);


const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";


export default CouponDetails;