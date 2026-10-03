import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  CreditCard,
  Download,
  Headphones,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Helmet } from "react-helmet";
import BASE_URL from "../utils/Url.js";

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

/*
|--------------------------------------------------------------------------
| Environment variables
|--------------------------------------------------------------------------
|
| Add these to your .env:
|
| VITE_OPERATOR_NAME=Your Name
| VITE_OPERATOR_MOBILE=+91XXXXXXXXXX
| VITE_OPERATOR_ADDRESS=Your Business Address
|
*/

const OPERATOR_NAME = (
  import.meta.env.VITE_OPERATOR_NAME || ""
).trim();

const OPERATOR_MOBILE = (
  import.meta.env.VITE_OPERATOR_MOBILE || ""
).trim();

const OPERATOR_ADDRESS = (
  import.meta.env.VITE_OPERATOR_ADDRESS || ""
).trim();

const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const ENQUIRY_EMAIL = "enquiry@targettrek.in";

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
      message: "Enter a valid 10 digit mobile number",
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

  if (
    storedTheme === "dark" ||
    storedTheme === "light"
  ) {
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
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const isDark = theme === "dark";

  const hasOperatorInformation = Boolean(
    OPERATOR_NAME ||
      OPERATOR_MOBILE ||
      OPERATOR_ADDRESS
  );

  const operatorPhoneHref = useMemo(() => {
    if (!OPERATOR_MOBILE) return "";

    const cleanedNumber =
      OPERATOR_MOBILE.replace(/[^\d+]/g, "");

    return `tel:${cleanedNumber}`;
  }, []);

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

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    window.addEventListener(
      THEME_EVENT,
      syncTheme
    );

    syncTheme();

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        THEME_EVENT,
        syncTheme
      );
    };
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "contactNumber") {
      const numericValue = value.replace(
        /\D/g,
        ""
      );

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

    const validationResult =
      contactSchema.safeParse(formData);

    if (!validationResult.success) {
      const errors =
        validationResult.error.flatten()
          .fieldErrors;

      setFormErrors(errors);

      toast.error(
        "Please fix the highlighted fields."
      );

      return;
    }

    setIsSubmitting(true);

    const dataToSend = {
      ...validationResult.data,

      contactNumber:
        "+91" +
        validationResult.data.contactNumber,

      service: "Other Inquiry",
    };

    const loadingToastId = toast.loading(
      "Sending your message..."
    );

    try {
      const response = await axios.post(
        `${BASE_URL}/messages/us`,
        dataToSend
      );

      toast.dismiss(loadingToastId);

      if (
        response.status === 200 ||
        response.status === 201
      ) {
        toast.success(
          "Message sent successfully! We'll get back to you soon."
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
          "Received an unexpected server response."
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
        "Unable to send your message. Please try again.";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (hasError = false) => `
    w-full
    rounded-2xl
    border
    px-4
    py-3.5
    text-sm
    outline-none
    transition-all
    duration-200

    ${
      isDark
        ? `
          bg-slate-950/70
          text-white
          placeholder:text-slate-500
          ${
            hasError
              ? `
                border-red-500
                focus:border-red-500
                focus:ring-4
                focus:ring-red-500/10
              `
              : `
                border-slate-700
                hover:border-slate-600
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-500/10
              `
          }
        `
        : `
          bg-white
          text-slate-900
          placeholder:text-slate-400
          ${
            hasError
              ? `
                border-red-400
                focus:border-red-500
                focus:ring-4
                focus:ring-red-100
              `
              : `
                border-slate-200
                hover:border-slate-300
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-100
              `
          }
        `
    }

    disabled:cursor-not-allowed
    disabled:opacity-60
  `;

  const errorText = (field) =>
    formErrors[field]?.[0];

  return (
    <div
      className={`
        min-h-screen
        pt-16
        transition-colors
        duration-300
        md:pt-20
        ${
          isDark
            ? "bg-[#070b14] text-slate-100"
            : "bg-[#f8fafc] text-slate-900"
        }
      `}
    >
      <Helmet>
        <title>
          Contact Target Trek | Book, Payment &
          Customer Support
        </title>

        <meta
          name="description"
          content="Contact Target Trek for ebook support, payment queries, downloads, educational resources and general enquiries."
        />

        <meta
          name="keywords"
          content="Target Trek contact, Target Trek support, ebook support, system design book support, Target Trek payment support"
        />

        <meta
          name="robots"
          content="index, follow"
        />

        <link
          rel="canonical"
          href="https://www.targettrek.in/contact"
        />

        <meta
          property="og:title"
          content="Contact Target Trek"
        />

        <meta
          property="og:description"
          content="Need assistance with a Target Trek book, payment or download? Contact our support team."
        />

        <meta
          property="og:url"
          content="https://www.targettrek.in/contact"
        />

        <meta
          property="og:type"
          content="website"
        />
      </Helmet>

      <Toaster
        position="top-center"
        reverseOrder={false}
      />

      {/* HERO */}
      <section
        className={`
          relative
          overflow-hidden
          border-b
          ${
            isDark
              ? "border-slate-800/70"
              : "border-slate-200"
          }
        `}
      >
        <div
          className={`
            absolute
            inset-0
            ${
              isDark
                ? "bg-gradient-to-br from-blue-950/30 via-[#070b14] to-violet-950/20"
                : "bg-gradient-to-br from-blue-50 via-white to-violet-50"
            }
          `}
        />

        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div
              className={`
                mx-auto
                mb-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                px-4
                py-2
                text-sm
                font-semibold
                ${
                  isDark
                    ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }
              `}
            >
              <Headphones size={16} />

              Target Trek Support
            </div>

            <h1
              className={`
                text-4xl
                font-black
                tracking-tight
                sm:text-5xl
                md:text-6xl
                lg:text-7xl
                ${
                  isDark
                    ? "text-white"
                    : "text-slate-950"
                }
              `}
            >
              How can we{" "}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                help you?
              </span>
            </h1>

            <p
              className={`
                mx-auto
                mt-6
                max-w-2xl
                text-base
                leading-7
                sm:text-lg
                ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-600"
                }
              `}
            >
              Questions about our books, payment,
              download access or anything else?
              Send us a message and we'll help you
              resolve it.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <div
                className={`
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  ${
                    isDark
                      ? "text-slate-300"
                      : "text-slate-700"
                  }
                `}
              >
                <CheckCircle2
                  size={18}
                  className="text-emerald-500"
                />

                Book support
              </div>

              <div
                className={`
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  ${
                    isDark
                      ? "text-slate-300"
                      : "text-slate-700"
                  }
                `}
              >
                <CheckCircle2
                  size={18}
                  className="text-emerald-500"
                />

                Payment queries
              </div>

              <div
                className={`
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  ${
                    isDark
                      ? "text-slate-300"
                      : "text-slate-700"
                  }
                `}
              >
                <CheckCircle2
                  size={18}
                  className="text-emerald-500"
                />

                Download assistance
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT CATEGORIES */}
      <section className="relative -mt-1 py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SupportFeature
              icon={BookOpen}
              title="Book Support"
              description="Questions related to our HLD, LLD, GenAI and other learning resources."
              isDark={isDark}
              accent="blue"
            />

            <SupportFeature
              icon={CreditCard}
              title="Payment Help"
              description="Need assistance with payment confirmation or an order?"
              isDark={isDark}
              accent="violet"
            />

            <SupportFeature
              icon={Download}
              title="Download Help"
              description="Having trouble accessing or downloading your purchased ebook?"
              isDark={isDark}
              accent="emerald"
            />

            <SupportFeature
              icon={MessageCircle}
              title="General Enquiry"
              description="Have a suggestion, business enquiry or something else to discuss?"
              isDark={isDark}
              accent="amber"
            />
          </div>
        </div>
      </section>

      {/* MAIN CONTACT AREA */}
      <section className="pb-16 pt-4 sm:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-10">
            {/* LEFT */}
            <div className="space-y-6">
              {/* CONTACT EMAILS */}
              <div
                className={`
                  overflow-hidden
                  rounded-3xl
                  border
                  ${
                    isDark
                      ? "border-slate-800 bg-slate-900/70"
                      : "border-slate-200 bg-white shadow-sm"
                  }
                `}
              >
                <div className="p-6 sm:p-7">
                  <div
                    className={`
                      mb-2
                      inline-flex
                      items-center
                      gap-2
                      text-xs
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      ${
                        isDark
                          ? "text-blue-400"
                          : "text-blue-600"
                      }
                    `}
                  >
                    <Sparkles size={14} />
                    Contact
                  </div>

                  <h2
                    className={`
                      text-2xl
                      font-bold
                      tracking-tight
                      ${
                        isDark
                          ? "text-white"
                          : "text-slate-950"
                      }
                    `}
                  >
                    Reach Target Trek
                  </h2>

                  <p
                    className={`
                      mt-2
                      text-sm
                      leading-6
                      ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-600"
                      }
                    `}
                  >
                    Choose the most relevant contact
                    channel for your query.
                  </p>

                  <div className="mt-7 space-y-3">
                    <ContactRow
                      icon={Headphones}
                      title="Customer Support"
                      description={SUPPORT_EMAIL}
                      href={`mailto:${SUPPORT_EMAIL}`}
                      isDark={isDark}
                      color="emerald"
                    />

                    <ContactRow
                      icon={Mail}
                      title="General Enquiries"
                      description={ENQUIRY_EMAIL}
                      href={`mailto:${ENQUIRY_EMAIL}`}
                      isDark={isDark}
                      color="blue"
                    />
                  </div>
                </div>

                <div
                  className={`
                    border-t
                    px-6
                    py-4
                    sm:px-7
                    ${
                      isDark
                        ? "border-slate-800 bg-slate-950/40"
                        : "border-slate-100 bg-slate-50"
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />

                    <p
                      className={`
                        text-xs
                        leading-5
                        ${
                          isDark
                            ? "text-slate-400"
                            : "text-slate-600"
                        }
                      `}
                    >
                      For order-related queries, include
                      the email address used while
                      purchasing for faster assistance.
                    </p>
                  </div>
                </div>
              </div>

              {/* OPERATOR / BUSINESS INFO */}
              {hasOperatorInformation && (
                <div
                  className={`
                    rounded-3xl
                    border
                    p-6
                    sm:p-7
                    ${
                      isDark
                        ? "border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/70"
                        : "border-slate-200 bg-white shadow-sm"
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        ${
                          isDark
                            ? "bg-violet-500/10 text-violet-400"
                            : "bg-violet-50 text-violet-600"
                        }
                      `}
                    >
                      <BadgeCheck size={23} />
                    </div>

                    <div>
                      <p
                        className={`
                          text-xs
                          font-bold
                          uppercase
                          tracking-[0.14em]
                          ${
                            isDark
                              ? "text-violet-400"
                              : "text-violet-600"
                          }
                        `}
                      >
                        Business Information
                      </p>

                      <h2
                        className={`
                          mt-1
                          text-xl
                          font-bold
                          ${
                            isDark
                              ? "text-white"
                              : "text-slate-950"
                          }
                        `}
                      >
                        Target Trek
                      </h2>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {OPERATOR_NAME && (
                      <OperatorInfoRow
                        icon={UserRound}
                        label="Target Trek is Operated by"
                        isDark={isDark}
                      >
                        {OPERATOR_NAME}
                      </OperatorInfoRow>
                    )}

                    {OPERATOR_MOBILE && (
                      <OperatorInfoRow
                        icon={Phone}
                        label="Mobile"
                        isDark={isDark}
                      >
                        <a
                          href={operatorPhoneHref}
                          className={`
                            transition-colors
                            ${
                              isDark
                                ? "hover:text-blue-400"
                                : "hover:text-blue-600"
                            }
                          `}
                        >
                          {OPERATOR_MOBILE}
                        </a>
                      </OperatorInfoRow>
                    )}

                    {OPERATOR_ADDRESS && (
                      <OperatorInfoRow
                        icon={MapPin}
                        label="Address"
                        isDark={isDark}
                        alignTop
                      >
                        <address className="whitespace-pre-line not-italic">
                          {OPERATOR_ADDRESS}
                        </address>
                      </OperatorInfoRow>
                    )}
                  </div>
                </div>
              )}

              {/* TRUST */}
              <div
                className={`
                  rounded-3xl
                  border
                  p-6
                  ${
                    isDark
                      ? "border-blue-500/20 bg-blue-500/5"
                      : "border-blue-100 bg-blue-50/70"
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      ${
                        isDark
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-white text-blue-600 shadow-sm"
                      }
                    `}
                  >
                    <ShieldCheck size={21} />
                  </div>

                  <div>
                    <h3
                      className={`
                        font-semibold
                        ${
                          isDark
                            ? "text-white"
                            : "text-slate-900"
                        }
                      `}
                    >
                      We're here to help
                    </h3>

                    <p
                      className={`
                        mt-1
                        text-sm
                        leading-6
                        ${
                          isDark
                            ? "text-slate-400"
                            : "text-slate-600"
                        }
                      `}
                    >
                      If you have purchased a Target
                      Trek digital book and face an
                      access, payment or download issue,
                      contact our support team with your
                      purchase details.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM */}
            <div
              id="contact-us"
              className={`
                relative
                overflow-hidden
                rounded-[28px]
                border
                ${
                  isDark
                    ? "border-slate-800 bg-slate-900/80 shadow-2xl shadow-black/20"
                    : "border-slate-200 bg-white shadow-xl shadow-slate-200/60"
                }
              `}
            >
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative p-6 sm:p-8 lg:p-10">
                <div className="mb-8">
                  <div
                    className={`
                      mb-5
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      ${
                        isDark
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-blue-50 text-blue-600"
                      }
                    `}
                  >
                    <Send size={21} />
                  </div>

                  <h2
                    className={`
                      text-2xl
                      font-bold
                      tracking-tight
                      sm:text-3xl
                      ${
                        isDark
                          ? "text-white"
                          : "text-slate-950"
                      }
                    `}
                  >
                    Send us a message
                  </h2>

                  <p
                    className={`
                      mt-2
                      max-w-lg
                      text-sm
                      leading-6
                      ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-600"
                      }
                    `}
                  >
                    Tell us what you need help with and
                    provide enough detail for us to
                    understand your query.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  noValidate
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* NAME */}
                    <div>
                      <FormLabel
                        htmlFor="name"
                        isDark={isDark}
                        required
                      >
                        Full Name
                      </FormLabel>

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
                        placeholder="Your name"
                      />

                      {errorText("name") && (
                        <ErrorMessage>
                          {errorText("name")}
                        </ErrorMessage>
                      )}
                    </div>

                    {/* EMAIL */}
                    <div>
                      <FormLabel
                        htmlFor="email"
                        isDark={isDark}
                        required
                      >
                        Email Address
                      </FormLabel>

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

                      {errorText("email") && (
                        <ErrorMessage>
                          {errorText("email")}
                        </ErrorMessage>
                      )}
                    </div>
                  </div>

                  {/* CONTACT */}
                  <div>
                    <FormLabel
                      htmlFor="contactNumber"
                      isDark={isDark}
                      required
                    >
                      Contact Number
                    </FormLabel>

                    <div className="flex">
                      <span
                        className={`
                          inline-flex
                          items-center
                          rounded-l-2xl
                          border
                          border-r-0
                          px-4
                          text-sm
                          font-semibold
                          ${
                            formErrors.contactNumber
                              ? "border-red-400"
                              : isDark
                              ? "border-slate-700 bg-slate-800 text-slate-300"
                              : "border-slate-200 bg-slate-50 text-slate-700"
                          }
                        `}
                      >
                        +91
                      </span>

                      <input
                        type="tel"
                        inputMode="numeric"
                        id="contactNumber"
                        name="contactNumber"
                        autoComplete="tel"
                        value={
                          formData.contactNumber
                        }
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        maxLength={10}
                        placeholder="XXXXXXXXXX"
                        className={`
                          w-full
                          rounded-r-2xl
                          border
                          px-4
                          py-3.5
                          text-sm
                          outline-none
                          transition-all
                          duration-200

                          ${
                            isDark
                              ? "bg-slate-950/70 text-white placeholder:text-slate-500"
                              : "bg-white text-slate-900 placeholder:text-slate-400"
                          }

                          ${
                            formErrors.contactNumber
                              ? `
                                border-red-400
                                focus:border-red-500
                                focus:ring-4
                                focus:ring-red-500/10
                              `
                              : isDark
                              ? `
                                border-slate-700
                                hover:border-slate-600
                                focus:border-blue-500
                                focus:ring-4
                                focus:ring-blue-500/10
                              `
                              : `
                                border-slate-200
                                hover:border-slate-300
                                focus:border-blue-500
                                focus:ring-4
                                focus:ring-blue-100
                              `
                          }

                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        `}
                      />
                    </div>

                    {errorText("contactNumber") && (
                      <ErrorMessage>
                        {errorText("contactNumber")}
                      </ErrorMessage>
                    )}
                  </div>

                  {/* MESSAGE */}
                  <div>
                    <FormLabel
                      htmlFor="message"
                      isDark={isDark}
                    >
                      Message{" "}
                      <span
                        className={`
                          ml-1
                          text-xs
                          font-normal
                          ${
                            isDark
                              ? "text-slate-500"
                              : "text-slate-400"
                          }
                        `}
                      >
                        (Optional)
                      </span>
                    </FormLabel>

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
                      placeholder="Describe your query, order issue, payment concern, book access problem, feedback, or anything else..."
                    />

                    {errorText("message") && (
                      <ErrorMessage>
                        {errorText("message")}
                      </ErrorMessage>
                    )}
                  </div>

                  <div
                    className={`
                      flex
                      items-start
                      gap-3
                      rounded-2xl
                      border
                      p-4
                      ${
                        isDark
                          ? "border-slate-800 bg-slate-950/50"
                          : "border-slate-200 bg-slate-50"
                      }
                    `}
                  >
                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />

                    <p
                      className={`
                        text-xs
                        leading-5
                        ${
                          isDark
                            ? "text-slate-400"
                            : "text-slate-600"
                        }
                      `}
                    >
                      By submitting this form, you agree
                      that Target Trek may contact you
                      regarding your enquiry.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
                      group
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      bg-gradient-to-r
                      from-blue-600
                      to-indigo-600
                      px-6
                      py-4
                      text-sm
                      font-bold
                      text-white
                      shadow-lg
                      shadow-blue-600/20
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:shadow-xl
                      hover:shadow-blue-600/25
                      focus:outline-none
                      focus:ring-4
                      focus:ring-blue-500/20
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      disabled:hover:translate-y-0
                    "
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />

                        Sending message...
                      </>
                    ) : (
                      <>
                        Send Message

                        <ArrowRight
                          size={18}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section
        className={`
          border-t
          ${
            isDark
              ? "border-slate-800 bg-slate-900/40"
              : "border-slate-200 bg-white"
          }
        `}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div
            className={`
              relative
              overflow-hidden
              rounded-3xl
              border
              p-6
              sm:p-8
              lg:p-10
              ${
                isDark
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-slate-50"
              }
            `}
          >
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className={`
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    ${
                      isDark
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-blue-100 text-blue-600"
                    }
                  `}
                >
                  <Headphones size={22} />
                </div>

                <div>
                  <h2
                    className={`
                      text-xl
                      font-bold
                      ${
                        isDark
                          ? "text-white"
                          : "text-slate-950"
                      }
                    `}
                  >
                    Need help with a purchase?
                  </h2>

                  <p
                    className={`
                      mt-1
                      max-w-2xl
                      text-sm
                      leading-6
                      ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-600"
                      }
                    `}
                  >
                    For book access, payment,
                    downloading, order confirmation or
                    customer support, you can contact us
                    directly by email.
                  </p>
                </div>
              </div>

              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className={`
                  inline-flex
                  shrink-0
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  px-5
                  py-3
                  text-sm
                  font-bold
                  transition-all
                  ${
                    isDark
                      ? "bg-white text-slate-950 hover:bg-slate-100"
                      : "bg-slate-950 text-white hover:bg-slate-800"
                  }
                `}
              >
                <Mail size={17} />

                Email Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const SupportFeature = ({
  icon: Icon,
  title,
  description,
  isDark,
  accent,
}) => {
  const accentClasses = {
    blue: isDark
      ? "bg-blue-500/10 text-blue-400"
      : "bg-blue-50 text-blue-600",

    violet: isDark
      ? "bg-violet-500/10 text-violet-400"
      : "bg-violet-50 text-violet-600",

    emerald: isDark
      ? "bg-emerald-500/10 text-emerald-400"
      : "bg-emerald-50 text-emerald-600",

    amber: isDark
      ? "bg-amber-500/10 text-amber-400"
      : "bg-amber-50 text-amber-600",
  };

  return (
    <div
      className={`
        group
        rounded-3xl
        border
        p-5
        transition-all
        duration-300
        hover:-translate-y-1
        ${
          isDark
            ? "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            : "border-slate-200 bg-white shadow-sm hover:shadow-lg"
        }
      `}
    >
      <div
        className={`
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-2xl
          ${accentClasses[accent]}
        `}
      >
        <Icon size={20} />
      </div>

      <h3
        className={`
          mt-4
          font-bold
          ${
            isDark
              ? "text-white"
              : "text-slate-900"
          }
        `}
      >
        {title}
      </h3>

      <p
        className={`
          mt-2
          text-sm
          leading-6
          ${
            isDark
              ? "text-slate-400"
              : "text-slate-600"
          }
        `}
      >
        {description}
      </p>
    </div>
  );
};

const ContactRow = ({
  icon: Icon,
  title,
  description,
  href,
  isDark,
  color,
}) => {
  const iconColor =
    color === "emerald"
      ? isDark
        ? "bg-emerald-500/10 text-emerald-400"
        : "bg-emerald-50 text-emerald-600"
      : isDark
      ? "bg-blue-500/10 text-blue-400"
      : "bg-blue-50 text-blue-600";

  return (
    <a
      href={href}
      className={`
        group
        flex
        items-center
        gap-4
        rounded-2xl
        border
        p-4
        transition-all
        ${
          isDark
            ? "border-slate-800 bg-slate-950/40 hover:border-slate-700"
            : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white hover:shadow-sm"
        }
      `}
    >
      <div
        className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${iconColor}
        `}
      >
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p
          className={`
            text-sm
            font-semibold
            ${
              isDark
                ? "text-slate-200"
                : "text-slate-900"
            }
          `}
        >
          {title}
        </p>

        <p
          className={`
            mt-0.5
            break-all
            text-sm
            ${
              isDark
                ? "text-slate-400"
                : "text-slate-600"
            }
          `}
        >
          {description}
        </p>
      </div>

      <ArrowRight
        size={17}
        className={`
          ml-auto
          shrink-0
          transition-transform
          group-hover:translate-x-1
          ${
            isDark
              ? "text-slate-600"
              : "text-slate-400"
          }
        `}
      />
    </a>
  );
};

const OperatorInfoRow = ({
  icon: Icon,
  label,
  children,
  isDark,
  alignTop = false,
}) => {
  return (
    <div
      className={`
        flex
        gap-3
        ${
          alignTop
            ? "items-start"
            : "items-center"
        }
      `}
    >
      <div
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${
            isDark
              ? "bg-slate-800 text-slate-400"
              : "bg-slate-100 text-slate-600"
          }
        `}
      >
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p
          className={`
            text-xs
            font-medium
            ${
              isDark
                ? "text-slate-500"
                : "text-slate-500"
            }
          `}
        >
          {label}
        </p>

        <div
          className={`
            mt-0.5
            break-words
            text-sm
            font-medium
            leading-6
            ${
              isDark
                ? "text-slate-200"
                : "text-slate-800"
            }
          `}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const FormLabel = ({
  htmlFor,
  children,
  isDark,
  required = false,
}) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`
        mb-2
        block
        text-sm
        font-semibold
        ${
          isDark
            ? "text-slate-300"
            : "text-slate-700"
        }
      `}
    >
      {children}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>
  );
};

const ErrorMessage = ({ children }) => {
  return (
    <p className="mt-1.5 text-xs font-medium text-red-500">
      {children}
    </p>
  );
};

export default ContactPage;