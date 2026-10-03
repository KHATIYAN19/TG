import React, { useEffect, useState } from "react";
import { z } from "zod";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  MapPin,
  Mail,
  Send,
  Loader2,
  Building2,
  UserRound,
} from "lucide-react";
import { Helmet } from "react-helmet";
import BASE_URL from "../utils/Url.js";

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, {
      message: "Name must be at least 2 characters",
    }),

  email: z
    .string()
    .trim()
    .email({
      message: "Please enter a valid email address",
    }),

  contactNumber: z
    .string()
    .regex(/^[0-9]{10}$/, {
      message: "Number must be 10 digits",
    }),

  message: z
    .string()
    .trim()
    .optional(),
});

const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = localStorage.getItem(THEME_KEY);

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return "light";
};

const ContactPage = () => {
  const [theme, setTheme] = useState(getStoredTheme);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    message: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDark = theme === "dark";

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const syncTheme = () => {
      setTheme(getStoredTheme());
    };

    const handleStorageChange = (event) => {
      if (event.key === THEME_KEY) {
        syncTheme();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(THEME_EVENT, syncTheme);

    syncTheme();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(THEME_EVENT, syncTheme);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";

    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "contactNumber") {
      const numericValue = value.replace(/\D/g, "");

      if (numericValue.length <= 10) {
        setFormData((prev) => ({
          ...prev,
          [name]: numericValue,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    setFormErrors({});

    const validationResult = contactSchema.safeParse(formData);

    if (!validationResult.success) {
      const errors =
        validationResult.error.flatten().fieldErrors;

      setFormErrors(errors);

      toast.error(
        "Please fix the errors in the form."
      );

      return;
    }

    setIsSubmitting(true);

    const dataToSend = {
      ...validationResult.data,

      contactNumber:
        "+91" +
        validationResult.data.contactNumber,

      // Service dropdown has been removed.
      // This value will always be sent to backend.
      service: "Other Inquiry",
    };

    const loadingToastId = toast.loading(
      "Sending your message..."
    );

    try {
      const apiUrl = `${BASE_URL}/messages/us`;

      const response = await axios.post(
        apiUrl,
        dataToSend
      );

      toast.dismiss(loadingToastId);

      if (
        response.status === 200 ||
        response.status === 201
      ) {
        toast.success(
          "Message sent successfully! Our team will contact you soon."
        );

        setFormData({
          name: "",
          email: "",
          contactNumber: "",
          message: "",
        });

        setFormErrors({});
      } else {
        toast.error(
          "Received an unexpected response from the server."
        );
      }
    } catch (error) {
      toast.dismiss(loadingToastId);

      console.error(
        "Contact form submission error:",
        error
      );

      const errorMessage =
        error.response?.data?.message ||
        "Failed to send message. Please try again later.";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (hasError = false) => `
    w-full
    rounded-xl
    border
    px-4
    py-3
    text-sm
    outline-none
    transition-all
    duration-200
    ${
      isDark
        ? `
          bg-slate-900
          text-slate-100
          placeholder:text-slate-500
          ${
            hasError
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "border-slate-700 hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          }
        `
        : `
          bg-white
          text-gray-900
          placeholder:text-gray-400
          ${
            hasError
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : "border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          }
        `
    }
    disabled:cursor-not-allowed
    disabled:opacity-60
  `;

  return (
    <div
      className={`min-h-screen pt-16 md:pt-20 transition-colors duration-300 ${
        isDark
          ? "bg-slate-950 text-slate-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <Helmet>
        <title>
          Contact Target Trek | Support & Enquiries
        </title>

        <meta
          name="description"
          content="Contact Target Trek for support, enquiries, digital products, educational resources, web development, GenAI and other questions."
        />

        <meta
          name="robots"
          content="index, follow"
        />

        <link
          rel="canonical"
          href="https://www.targettrek.in/contact"
        />
      </Helmet>

      <Toaster
        position="top-center"
        reverseOrder={false}
      />

      {/* Hero */}
      <section
        className={`relative overflow-hidden border-b ${
          isDark
            ? "border-slate-800 bg-slate-900"
            : "border-blue-100 bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700"
        }`}
      >
        <div
          className={`absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl ${
            isDark
              ? "bg-blue-600/10"
              : "bg-white/10"
          }`}
        />

        <div
          className={`absolute -bottom-32 -left-20 h-72 w-72 rounded-full blur-3xl ${
            isDark
              ? "bg-indigo-500/10"
              : "bg-indigo-300/20"
          }`}
        />

        <div className="relative mx-auto max-w-5xl px-4 py-14 text-center sm:px-6 md:py-20 lg:px-8">
          <div
            className={`mx-auto mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
              isDark
                ? "border-slate-700 bg-slate-800 text-blue-300"
                : "border-white/20 bg-white/10 text-white"
            }`}
          >
            <Mail size={16} />
            Contact Target Trek
          </div>

          <h1
            className={`text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl ${
              isDark
                ? "text-white"
                : "text-white"
            }`}
          >
            Get In Touch
          </h1>

          <p
            className={`mx-auto mt-5 max-w-2xl text-base leading-7 sm:text-lg ${
              isDark
                ? "text-slate-300"
                : "text-blue-100"
            }`}
          >
            Have a question, need support, or want
            to discuss something with us? Send us a
            message and our team will get back to
            you.
          </p>
        </div>
      </section>

      {/* Main */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">

            {/* Left Section */}
            <div className="space-y-6">

              {/* Contact Information */}
              <div
                className={`rounded-2xl border p-6 shadow-sm sm:p-8 ${
                  isDark
                    ? "border-slate-800 bg-slate-900"
                    : "border-gray-200 bg-white"
                }`}
              >
                <h2
                  className={`text-2xl font-bold ${
                    isDark
                      ? "text-white"
                      : "text-gray-900"
                  }`}
                >
                  Contact Information
                </h2>

                <p
                  className={`mt-2 text-sm leading-6 ${
                    isDark
                      ? "text-slate-400"
                      : "text-gray-600"
                  }`}
                >
                  You can reach us using the contact
                  details below.
                </p>

                <div className="mt-8 space-y-6">

                  {/* Address */}
       {/*           <div className="flex items-start gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isDark
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <MapPin size={20} />
                    </div>

                    <div>
                      <p
                        className={`mb-1 font-semibold ${
                          isDark
                            ? "text-slate-200"
                            : "text-gray-900"
                        }`}
                      >
                        Address
                      </p>

                      <address
                        className={`not-italic text-sm leading-6 ${
                          isDark
                            ? "text-slate-400"
                            : "text-gray-600"
                        }`}
                      >
                        Tower-C Unit-120, Plot No-1
                        <br />
                        Bhutani Alphathum, Sector-90
                        <br />
                        Noida, Uttar Pradesh 201305
                        <br />
                        India
                      </address>
                    </div>
                  </div>
                  */ }

                  {/* General Enquiry */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isDark
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <Mail size={20} />
                    </div>

                    <div>
                      <p
                        className={`mb-1 font-semibold ${
                          isDark
                            ? "text-slate-200"
                            : "text-gray-900"
                        }`}
                      >
                        General Enquiries
                      </p>

                      <a
                        href="mailto:enquiry@targettrek.in"
                        className={`text-sm transition-colors ${
                          isDark
                            ? "text-slate-400 hover:text-blue-400"
                            : "text-gray-600 hover:text-blue-600"
                        }`}
                      >
                        enquiry@targettrek.in
                      </a>
                    </div>
                  </div>

                  {/* Support Email */}
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isDark
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      <Mail size={20} />
                    </div>

                    <div>
                      <p
                        className={`mb-1 font-semibold ${
                          isDark
                            ? "text-slate-200"
                            : "text-gray-900"
                        }`}
                      >
                        Customer Support
                      </p>

                      <a
                        href="mailto:supporttargettrek@gmail.com"
                        className={`break-all text-sm transition-colors ${
                          isDark
                            ? "text-slate-400 hover:text-emerald-400"
                            : "text-gray-600 hover:text-emerald-600"
                        }`}
                      >
                        supporttargettrek@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operator */}
              <div
                className={`rounded-2xl border p-6 sm:p-8 ${
                  isDark
                    ? "border-slate-800 bg-slate-900"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      isDark
                        ? "bg-purple-500/10 text-purple-400"
                        : "bg-purple-50 text-purple-600"
                    }`}
                  >
                    <UserRound size={21} />
                  </div>

                  <div>
                    <h3
                      className={`text-lg font-semibold ${
                        isDark
                          ? "text-white"
                          : "text-gray-900"
                      }`}
                    >
                      Website Operator
                    </h3>

                    <p
                      className={`mt-1 text-sm leading-6 ${
                        isDark
                          ? "text-slate-400"
                          : "text-gray-600"
                      }`}
                    >
                      The Target Trek website is
                      operated by{" "}
                      <span
                        className={`font-semibold ${
                          isDark
                            ? "text-slate-200"
                            : "text-gray-800"
                        }`}
                      >
                        Tanu
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div>
                <h3
                  className={`mb-4 text-xl font-semibold ${
                    isDark
                      ? "text-white"
                      : "text-gray-900"
                  }`}
                >
                  Building Better Digital Experiences
                </h3>

                <div
                  className={`overflow-hidden rounded-2xl border shadow-sm ${
                    isDark
                      ? "border-slate-800 bg-slate-900"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <img
                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80"
                    alt="Team collaborating on a digital project"
                    loading="lazy"
                    className="h-60 w-full object-cover sm:h-72"
                    onError={(event) => {
                      event.currentTarget.onerror = null;

                      event.currentTarget.src =
                        "https://placehold.co/800x500/e2e8f0/64748b?text=Target+Trek";
                    }}
                  />
                </div>

                <p
                  className={`mt-3 text-sm italic ${
                    isDark
                      ? "text-slate-500"
                      : "text-gray-500"
                  }`}
                >
                  Have a question? We're here to help.
                </p>
              </div>
            </div>

            {/* Form */}
            <div
              id="contact-us"
              className={`rounded-2xl border p-6 shadow-xl sm:p-8 lg:p-10 ${
                isDark
                  ? "border-slate-800 bg-slate-900 shadow-black/20"
                  : "border-gray-200 bg-white shadow-gray-200/60"
              }`}
            >
              <div className="mb-8">
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${
                    isDark
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <Send size={22} />
                </div>

                <h2
                  className={`text-2xl font-bold sm:text-3xl ${
                    isDark
                      ? "text-white"
                      : "text-gray-900"
                  }`}
                >
                  Send Us a Message
                </h2>

                <p
                  className={`mt-2 text-sm leading-6 ${
                    isDark
                      ? "text-slate-400"
                      : "text-gray-600"
                  }`}
                >
                  Fill out the form below and our
                  team will get back to you as soon
                  as possible.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
                noValidate
              >
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className={`mb-2 block text-sm font-medium ${
                      isDark
                        ? "text-slate-300"
                        : "text-gray-700"
                    }`}
                  >
                    Full Name
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    id="name"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={inputClass(
                      Boolean(formErrors.name)
                    )}
                    placeholder="Enter your full name"
                  />

                  {formErrors.name && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {formErrors.name[0]}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className={`mb-2 block text-sm font-medium ${
                      isDark
                        ? "text-slate-300"
                        : "text-gray-700"
                    }`}
                  >
                    Email Address
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={inputClass(
                      Boolean(formErrors.email)
                    )}
                    placeholder="you@example.com"
                  />

                  {formErrors.email && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {formErrors.email[0]}
                    </p>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <label
                    htmlFor="contactNumber"
                    className={`mb-2 block text-sm font-medium ${
                      isDark
                        ? "text-slate-300"
                        : "text-gray-700"
                    }`}
                  >
                    Contact Number
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="flex">
                    <span
                      className={`inline-flex items-center rounded-l-xl border border-r-0 px-4 text-sm font-medium ${
                        formErrors.contactNumber
                          ? "border-red-500"
                          : isDark
                          ? "border-slate-700 bg-slate-800 text-slate-300"
                          : "border-gray-300 bg-gray-50 text-gray-700"
                      }`}
                    >
                      +91
                    </span>

                    <input
                      type="tel"
                      inputMode="numeric"
                      id="contactNumber"
                      name="contactNumber"
                      autoComplete="tel"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      maxLength={10}
                      className={`
                        w-full
                        rounded-r-xl
                        border
                        px-4
                        py-3
                        text-sm
                        outline-none
                        transition-all
                        duration-200

                        ${
                          isDark
                            ? `
                              bg-slate-900
                              text-slate-100
                              placeholder:text-slate-500
                            `
                            : `
                              bg-white
                              text-gray-900
                              placeholder:text-gray-400
                            `
                        }

                        ${
                          formErrors.contactNumber
                            ? `
                              border-red-500
                              focus:border-red-500
                              focus:ring-2
                              focus:ring-red-500/20
                            `
                            : isDark
                            ? `
                              border-slate-700
                              focus:border-blue-500
                              focus:ring-2
                              focus:ring-blue-500/20
                            `
                            : `
                              border-gray-300
                              focus:border-blue-500
                              focus:ring-2
                              focus:ring-blue-100
                            `
                        }

                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      `}
                      placeholder="XXXXXXXXXX"
                    />
                  </div>

                  {formErrors.contactNumber && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {formErrors.contactNumber[0]}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className={`mb-2 block text-sm font-medium ${
                      isDark
                        ? "text-slate-300"
                        : "text-gray-700"
                    }`}
                  >
                    Message
                    <span
                      className={`ml-1 text-xs font-normal ${
                        isDark
                          ? "text-slate-500"
                          : "text-gray-400"
                      }`}
                    >
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className={`${inputClass(
                      Boolean(formErrors.message)
                    )} resize-none`}
                    placeholder="How can we help you?"
                  />

                  {formErrors.message && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {formErrors.message[0]}
                    </p>
                  )}
                </div>

                {/* Info */}
                <div
                  className={`rounded-xl border p-4 text-xs leading-5 ${
                    isDark
                      ? "border-slate-700 bg-slate-800/60 text-slate-400"
                      : "border-blue-100 bg-blue-50 text-gray-600"
                  }`}
                >
                  By submitting this form, you agree
                  that Target Trek may contact you
                  regarding your enquiry.
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-600
                    px-6
                    py-3.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition-all
                    duration-200
                    hover:bg-blue-700
                    hover:shadow-md
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    focus:ring-offset-2
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        size={19}
                        className="mr-2 animate-spin"
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send
                        size={18}
                        className="mr-2"
                      />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Support Section */}
      <section
        className={`border-t ${
          isDark
            ? "border-slate-800 bg-slate-900/60"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div
            className={`flex flex-col gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8 ${
              isDark
                ? "border-slate-800 bg-slate-900"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  isDark
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                <Building2 size={21} />
              </div>

              <div>
                <h3
                  className={`font-semibold ${
                    isDark
                      ? "text-white"
                      : "text-gray-900"
                  }`}
                >
                  Need help with a Target Trek
                  purchase?
                </h3>

                <p
                  className={`mt-1 text-sm ${
                    isDark
                      ? "text-slate-400"
                      : "text-gray-600"
                  }`}
                >
                  For book, payment, download or
                  customer support queries, contact
                  our support team.
                </p>
              </div>
            </div>

            <a
              href="mailto:supporttargettrek@gmail.com"
              className={`
                inline-flex
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-xl
                px-5
                py-3
                text-sm
                font-semibold
                transition-colors
                ${
                  isDark
                    ? "bg-slate-800 text-slate-200 hover:bg-slate-700"
                    : "bg-white text-gray-800 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
                }
              `}
            >
              <Mail size={17} />
              Email Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;