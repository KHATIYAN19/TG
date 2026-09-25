import React, { useEffect, useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  LockKeyhole,
  Loader2,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

const BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  "https://target-trek.onrender.com";

export default function PayUCheckoutModal({
  isOpen,
  onClose,
  product,
}) {
  const [formData, setFormData] = useState({
    firstname: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [paymentLoading, setPaymentLoading] =
    useState(false);
  const [serverError, setServerError] =
    useState("");

  // --------------------------------------------------
  // Lock background scroll while modal is open
  // --------------------------------------------------

  useEffect(() => {
    if (!isOpen) return;

    const oldOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        oldOverflow;
    };
  }, [isOpen]);

  // --------------------------------------------------
  // ESC closes modal
  // --------------------------------------------------

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (
        event.key === "Escape" &&
        !paymentLoading
      ) {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [isOpen, onClose, paymentLoading]);

  // --------------------------------------------------
  // Format price
  // --------------------------------------------------

  const formatMoney = (amount) => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency:
          product?.currency || "INR",
        maximumFractionDigits: 0,
      }).format(Number(amount || 0));
    } catch {
      return `₹${Number(amount || 0)}`;
    }
  };

  // --------------------------------------------------
  // Input change
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    let finalValue = value;

    if (name === "phone") {
      finalValue = value
        .replace(/\D/g, "")
        .slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname =
        "Please enter your name.";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Please enter your email.";
    } else {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          formData.email.trim()
        )
      ) {
        newErrors.email =
          "Please enter a valid email.";
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Please enter your phone number.";
    } else if (
      !/^[6-9]\d{9}$/.test(
        formData.phone
      )
    ) {
      newErrors.phone =
        "Please enter a valid 10-digit Indian phone number.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length ===
      0
    );
  };

  // --------------------------------------------------
  // Get affiliate code from localStorage
  // --------------------------------------------------

  const getAffiliateCode = () => {
    try {
      const affiliateCode =
        localStorage.getItem(
          "affiliateCode"
        );

      if (!affiliateCode) {
        return "tt";
      }

      return affiliateCode
        .trim()
        .toLowerCase();
    } catch (error) {
      console.error(
        "Unable to read affiliate code:",
        error
      );
      return null;
    }
  };

  // --------------------------------------------------
  // Submit PayU form
  // --------------------------------------------------

  const submitToPayU = (
    paymentUrl,
    paymentData
  ) => {
    if (
      !paymentUrl ||
      !paymentData
    ) {
      throw new Error(
        "Invalid PayU payment response."
      );
    }

    const form =
      document.createElement("form");

    form.method = "POST";
    form.action = paymentUrl;
    form.style.display = "none";

    Object.entries(
      paymentData
    ).forEach(([key, value]) => {
      const input =
        document.createElement(
          "input"
        );

      input.type = "hidden";
      input.name = key;
      input.value = value ?? "";

      form.appendChild(input);
    });

    document.body.appendChild(form);

    form.submit();
  };

  // --------------------------------------------------
  // Start payment
  // --------------------------------------------------

  const handlePayment = async (
    event
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!product?._id) {
      setServerError(
        "Book information is unavailable. Please refresh the page."
      );

      return;
    }

    try {
      setPaymentLoading(true);
      setServerError("");

      // ----------------------------------------------
      // Read affiliate code from localStorage
      // ----------------------------------------------

      const affiliateCode =
        getAffiliateCode();

      // ----------------------------------------------
      // Marketing parameters
      // ----------------------------------------------

      const params =
        new URLSearchParams(
          window.location.search
        );

      const response =
        await fetch(
          `${BASE_URL}/payment/payu/create`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              bookId:
                product._id,

              firstname:
                formData.firstname.trim(),

              email:
                formData.email
                  .trim()
                  .toLowerCase(),

              phone:
                formData.phone.trim(),

              // Affiliate tracking
              affiliateCode,

              // Marketing tracking
              utmSource:
                params.get(
                  "utm_source"
                ) || null,

              utmMedium:
                params.get(
                  "utm_medium"
                ) || null,

              utmCampaign:
                params.get(
                  "utm_campaign"
                ) || null,
            }),
          }
        );

      const result =
        await response
          .json()
          .catch(() => null);

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Unable to start payment."
        );
      }

      const paymentUrl =
        result?.data?.paymentUrl;

      const paymentData =
        result?.data?.paymentData;

      if (
        !paymentUrl ||
        !paymentData
      ) {
        throw new Error(
          "Invalid payment information received from server."
        );
      }

      // Browser leaves Target Trek
      // and POSTs directly to PayU

      submitToPayU(
        paymentUrl,
        paymentData
      );
    } catch (error) {
      console.error(
        "PayU payment error:",
        error
      );

      setServerError(
        error?.message ||
          "Unable to start payment. Please try again."
      );

      setPaymentLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
      {/* Overlay */}

      <button
        type="button"
        aria-label="Close checkout"
        disabled={paymentLoading}
        onClick={() => {
          if (!paymentLoading) {
            onClose();
          }
        }}
        className="absolute inset-0 cursor-default bg-slate-950/50 backdrop-blur-sm"
      />

      {/* Modal */}

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

        {/* Header */}

        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">

            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                <ShieldCheck
                  size={14}
                />

                Secure Checkout
              </div>

              <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
                Complete your purchase
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Enter your details to
                continue to PayU.
              </p>
            </div>

            <button
              type="button"
              disabled={
                paymentLoading
              }
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={18} />
            </button>

          </div>
        </div>

        {/* Product */}

        <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-4">

            {product?.coverPageUrl && (
              <img
                src={
                  product.coverPageUrl
                }
                alt={
                  product.title
                }
                className="h-16 w-12 shrink-0 rounded-lg border border-slate-200 object-cover shadow-sm"
              />
            )}

            <div className="min-w-0 flex-1">

              <p className="line-clamp-2 text-sm font-bold text-slate-900">
                {product?.title ||
                  "Target Trek Ebook"}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2">

                <span className="text-lg font-black text-blue-600">
                  {formatMoney(
                    product?.price
                  )}
                </span>

                {Number(
                  product?.mrp
                ) >
                  Number(
                    product?.price
                  ) && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatMoney(
                      product?.mrp
                    )}
                  </span>
                )}

              </div>
            </div>

          </div>
        </div>

        {/* Form */}

        <form
          onSubmit={
            handlePayment
          }
          className="space-y-4 px-5 py-5 sm:px-6 sm:py-6"
        >

          {/* Name */}

          <div>
            <label
              htmlFor="checkout-name"
              className="mb-1.5 block text-sm font-bold text-slate-700"
            >
              Full Name
            </label>

            <div className="relative">

              <User
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="checkout-name"
                type="text"
                name="firstname"
                autoComplete="name"
                value={
                  formData.firstname
                }
                onChange={
                  handleChange
                }
                disabled={
                  paymentLoading
                }
                placeholder="Enter your full name"
                className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                  errors.firstname
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                    : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                }`}
              />

            </div>

            {errors.firstname && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {
                  errors.firstname
                }
              </p>
            )}
          </div>

          {/* Email */}

          <div>
            <label
              htmlFor="checkout-email"
              className="mb-1.5 block text-sm font-bold text-slate-700"
            >
              Email
            </label>

            <div className="relative">

              <Mail
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="checkout-email"
                type="email"
                name="email"
                autoComplete="email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                disabled={
                  paymentLoading
                }
                placeholder="you@example.com"
                className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                  errors.email
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                    : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                }`}
              />

            </div>

            {errors.email && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}

          <div>
            <label
              htmlFor="checkout-phone"
              className="mb-1.5 block text-sm font-bold text-slate-700"
            >
              Phone Number
            </label>

            <div className="relative">

              <Phone
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="checkout-phone"
                type="tel"
                inputMode="numeric"
                name="phone"
                autoComplete="tel"
                value={
                  formData.phone
                }
                onChange={
                  handleChange
                }
                disabled={
                  paymentLoading
                }
                placeholder="9876543210"
                className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                  errors.phone
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
                    : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                }`}
              />

            </div>

            {errors.phone && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {errors.phone}
              </p>
            )}
          </div>

          {/* Server error */}

          {serverError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">
                {serverError}
              </p>
            </div>
          )}

          {/* Pay button */}

          <button
            type="submit"
            disabled={
              paymentLoading
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {paymentLoading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Connecting to PayU...
              </>
            ) : (
              <>
                <CreditCard
                  size={18}
                />

                Pay{" "}
                {formatMoney(
                  product?.price
                )}
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">

            <LockKeyhole
              size={13}
            />

            Payment securely processed
            by PayU

          </div>

        </form>
      </div>
    </div>
  );
}