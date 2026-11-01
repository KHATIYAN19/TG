import { useEffect, useState } from "react";
import { z } from "zod";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  CreditCard,
  Download,
  Headphones,
  Loader2,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Helmet } from "react-helmet";
import BASE_URL from "../utils/Url.js";

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SUPPORT_EMAIL = "supporttargettrek@gmail.com";


const EASE = [0.25, 0.1, 0.25, 1];

const contactSchema = z.object({
  name: z.string().trim().min(2, {
    message: "Name must be at least 2 characters",
  }),

  email: z.string().trim().email({
    message: "Please enter a valid email address",
  }),

  contactNumber: z.string().regex(/^[0-9]{10}$/, {
    message: "Enter a valid 10 digit mobile number",
  }),

  message: z.string().trim().optional(),
});

const getStoredTheme = () => {
  if (typeof window === "undefined") return "light";

  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* storage unavailable */
  }

  return "light";
};

const supportTopics = [
  {
    icon: BookOpen,
    title: "Book Support",
    description:
      "Questions related to our HLD, LLD, GenAI and other learning resources.",
  },
  {
    icon: CreditCard,
    title: "Payment Help",
    description:
      "Need assistance with payment confirmation or an order?",
  },
  {
    icon: Download,
    title: "Download Help",
    description:
      "Having trouble accessing or downloading your purchased ebook?",
  },
  {
    icon: MessageCircle,
    title: "General Enquiry",
    description:
      "Have a suggestion, business enquiry or something else to discuss?",
  },
];

const faqs = [
  {
    q: "I paid but can't access my book. What should I do?",
    a: "Send us a message with the email address you used while purchasing and, if you have it, your payment confirmation. This helps us find your order quickly.",
  },
  {
    q: "I'm having trouble downloading my ebook.",
    a: "Tell us which book you purchased and what you see when you try to download it. Include the email used for the purchase so we can check your access.",
  },
  {
    q: "Which email should I use for which query?",
    a: `Use ${SUPPORT_EMAIL} for book access, payment and download support.`,
  },
  {
    q: "Can I send a suggestion or feedback?",
    a: "Yes. Choose the contact form below and describe your suggestion — we use feedback to improve our books and resources.",
  },
];

/* -------------------------------------------------------------------------- */
/* Animation helper: soft + quick fade in / out while scrolling               */
/* -------------------------------------------------------------------------- */

const Reveal = ({
  children,
  className = "",
  delay = 0,
  x = 0,
  y = 28,
}) => {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.45, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

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
  const [openFaq, setOpenFaq] = useState(0);

  const isDark = theme === "dark";
  const reduce = useReducedMotion();

  const t = isDark
    ? {
        page: "bg-[#0c0907] text-stone-100",
        h: "text-white",
        p: "text-stone-400",
        muted: "text-stone-500",
        eyebrow: "text-orange-400",
        alt: "bg-[#120d0a]",
        card: "border-orange-500/10 bg-stone-900/60 backdrop-blur-sm",
        cardHover:
          "hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10",
        inner: "border-orange-500/10 bg-stone-950/60",
        iconBox: "bg-orange-500/10 text-orange-400",
        chip: "border-orange-500/20 bg-orange-500/10 text-orange-300",
        border: "border-orange-500/10",
        glowA: "bg-orange-500/20",
        glowB: "bg-amber-500/10",
        grid: "rgba(251,146,60,0.07)",
      }
    : {
        page: "bg-[#fffaf5] text-stone-900",
        h: "text-stone-950",
        p: "text-stone-600",
        muted: "text-stone-500",
        eyebrow: "text-orange-600",
        alt: "bg-orange-50/70",
        card: "border-orange-100 bg-white shadow-sm shadow-orange-100/60",
        cardHover:
          "hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-200/60",
        inner: "border-orange-100 bg-orange-50/50",
        iconBox: "bg-orange-100 text-orange-600",
        chip: "border-orange-200 bg-orange-50 text-orange-700",
        border: "border-orange-100",
        glowA: "bg-orange-300/40",
        glowB: "bg-amber-200/50",
        grid: "rgba(234,88,12,0.08)",
      };

  /* Scroll progress + hero parallax */
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
  });
  const { scrollY } = useScroll();
  const glowY = useTransform(scrollY, [0, 600], [0, 140]);
  const heroFade = useTransform(scrollY, [0, 450], [1, 0.2]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const syncTheme = () => setTheme(getStoredTheme());

    const handleStorageChange = (event) => {
      if (event.key === THEME_KEY) syncTheme();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(THEME_EVENT, syncTheme);
    syncTheme();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(THEME_EVENT, syncTheme);
    };
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "contactNumber") {
      const numericValue = value.replace(/\D/g, "");

      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    setFormErrors({});

    const validationResult = contactSchema.safeParse(formData);

    if (!validationResult.success) {
      setFormErrors(validationResult.error.flatten().fieldErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);

    const dataToSend = {
      ...validationResult.data,
      contactNumber: "+91" + validationResult.data.contactNumber,
      service: "Other Inquiry",
    };

    const loadingToastId = toast.loading("Sending your message...");

    try {
      const response = await axios.post(
        `${BASE_URL}/messages/us`,
        dataToSend
      );

      toast.dismiss(loadingToastId);

      if (response.status === 200 || response.status === 201) {
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
        toast.error("Received an unexpected server response.");
      }
    } catch (error) {
      toast.dismiss(loadingToastId);

      console.error("Contact form submission error:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Unable to send your message. Please try again.";

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (hasError = false) =>
    `w-full rounded-2xl border px-4 py-3.5 text-sm outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
      isDark
        ? "bg-stone-950/70 text-white placeholder:text-stone-500"
        : "bg-white text-stone-900 placeholder:text-stone-400"
    } ${
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
        : isDark
        ? "border-stone-700 hover:border-orange-500/40 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
        : "border-orange-100 hover:border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
    }`;

  const errorText = (field) => formErrors[field]?.[0];

  const labelClass = `mb-2 block text-sm font-semibold ${
    isDark ? "text-stone-300" : "text-stone-700"
  }`;

  return (
    <div
      className={`relative min-h-screen overflow-x-clip pt-16 transition-colors duration-500 md:pt-20 ${t.page}`}
    >
      <Helmet>
        <title>Contact Target Trek | Book, Payment &amp; Customer Support</title>

        <meta
          name="description"
          content="Contact Target Trek for ebook support, payment queries, downloads, educational resources and general enquiries."
        />

        <meta
          name="keywords"
          content="Target Trek contact, Target Trek support, ebook support, system design book support, Target Trek payment support"
        />

        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.targettrek.in/contact" />

        <meta property="og:title" content="Contact Target Trek" />
        <meta
          property="og:description"
          content="Need assistance with a Target Trek book, payment or download? Contact our support team."
        />
        <meta property="og:url" content="https://www.targettrek.in/contact" />
        <meta property="og:type" content="website" />
      </Helmet>

      <Toaster position="top-center" reverseOrder={false} />

      {/* Scroll progress */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[100] h-[3px] origin-left bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600"
      />

      {/* ================================================================ */}
      {/* HERO                                                             */}
      {/* ================================================================ */}
      <section className={`relative overflow-hidden border-b ${t.border}`}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${t.grid} 1px, transparent 1px), linear-gradient(90deg, ${t.grid} 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
          }}
        />

        <motion.div
          aria-hidden="true"
          style={reduce ? undefined : { y: glowY }}
          className={`pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full blur-[110px] ${t.glowA}`}
        />
        <motion.div
          aria-hidden="true"
          animate={
            reduce ? undefined : { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }
          }
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className={`pointer-events-none absolute -bottom-48 -left-40 h-[440px] w-[440px] rounded-full blur-[110px] ${t.glowB}`}
        />

        <motion.div
          style={reduce ? undefined : { opacity: heroFade }}
          className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
        >
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={reduce ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE }}
              className={`mx-auto mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${t.chip}`}
            >
              <Headphones size={16} />
              Target Trek Support
            </motion.div>

            <h1
              className={`text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl ${t.h}`}
            >
              {["How", "can", "we"].map((word, i) => (
                <motion.span
                  key={word}
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.07, ease: EASE }}
                  className="mr-3 inline-block"
                >
                  {word}
                </motion.span>
              ))}

              <motion.span
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.35, ease: EASE }}
                className="inline-block bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent"
              >
                help you?
              </motion.span>
            </h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: EASE }}
              className={`mx-auto mt-6 max-w-2xl text-base leading-7 sm:text-lg ${t.p}`}
            >
              Questions about our books, payment, download access or anything
              else? Send us a message and we'll help you resolve it.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55, ease: EASE }}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <a
                href="#contact-us"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40"
              >
                Send a Message
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>

              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-bold transition hover:-translate-y-0.5 ${
                  isDark
                    ? "border-orange-500/30 bg-stone-900/70 text-stone-100 hover:bg-orange-500/10"
                    : "border-orange-200 bg-white text-stone-800 hover:border-orange-400 hover:bg-orange-50"
                }`}
              >
                <Mail size={17} />
                Email Support
              </a>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ================================================================ */}
      {/* SUPPORT TOPICS                                                   */}
      {/* ================================================================ */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {supportTopics.map((item, i) => {
              const Icon = item.icon;

              return (
                <Reveal key={item.title} delay={i * 0.05}>
                  <div
                    className={`group h-full rounded-3xl border p-6 transition duration-300 hover:-translate-y-1.5 ${t.card} ${t.cardHover}`}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl transition duration-300 group-hover:rotate-6 group-hover:bg-orange-500 group-hover:text-white ${t.iconBox}`}
                    >
                      <Icon size={22} />
                    </div>

                    <h3 className={`mt-4 font-black ${t.h}`}>{item.title}</h3>

                    <p className={`mt-2 text-sm leading-6 ${t.p}`}>
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* CONTACT + FORM                                                   */}
      {/* ================================================================ */}
      <section className={`border-y py-16 sm:py-20 ${t.border} ${t.alt}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-10">
            {/* LEFT */}
            <div className="space-y-6 lg:sticky lg:top-28">
              <Reveal x={-24}>
                <div className={`overflow-hidden rounded-3xl border ${t.card}`}>
                  <div className="p-6 sm:p-7">
                    <div
                      className={`mb-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] ${t.eyebrow}`}
                    >
                      <Sparkles size={14} />
                      Contact
                    </div>

                    <h2
                      className={`text-2xl font-black tracking-tight sm:text-3xl ${t.h}`}
                    >
                      Reach Target Trek
                    </h2>

                    <p className={`mt-2 text-sm leading-6 ${t.p}`}>
                      Choose the most relevant contact channel for your query.
                    </p>

                    <div className="mt-7 space-y-3">
                      <ContactRow
                        icon={Headphones}
                        title="Customer Support"
                        description={SUPPORT_EMAIL}
                        href={`mailto:${SUPPORT_EMAIL}`}
                        t={t}
                        isDark={isDark}
                      />

                   
                    </div>
                  </div>

                  <div
                    className={`flex items-start gap-3 border-t px-6 py-4 sm:px-7 ${t.border} ${
                      isDark ? "bg-stone-950/40" : "bg-orange-50/60"
                    }`}
                  >
                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-orange-500"
                    />

                    <p className={`text-xs leading-5 ${t.p}`}>
                      For order-related queries, include the email address used
                      while purchasing for faster assistance.
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal x={-24} delay={0.08}>
                <div
                  className={`rounded-3xl border p-6 ${
                    isDark
                      ? "border-orange-500/25 bg-orange-500/5"
                      : "border-orange-200 bg-orange-50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.iconBox}`}
                    >
                      <ShieldCheck size={21} />
                    </div>

                    <div>
                      <h3 className={`font-black ${t.h}`}>We're here to help</h3>

                      <p className={`mt-1 text-sm leading-6 ${t.p}`}>
                        If you have purchased a Target Trek digital book and
                        face an access, payment or download issue, contact our
                        support team with your purchase details.
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* FORM */}
            <Reveal x={24}>
              <div
                id="contact-us"
                className={`relative scroll-mt-28 overflow-hidden rounded-[28px] border ${
                  isDark
                    ? "border-orange-500/15 bg-stone-900/70 shadow-2xl shadow-black/30"
                    : "border-orange-100 bg-white shadow-xl shadow-orange-100/70"
                }`}
              >
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full blur-3xl ${t.glowA}`}
                />

                <div className="relative p-6 sm:p-8 lg:p-10">
                  <div className="mb-8">
                    <div
                      className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30`}
                    >
                      <Send size={21} />
                    </div>

                    <h2
                      className={`text-2xl font-black tracking-tight sm:text-3xl ${t.h}`}
                    >
                      Send us a message
                    </h2>

                    <p className={`mt-2 max-w-lg text-sm leading-6 ${t.p}`}>
                      Tell us what you need help with and provide enough detail
                      for us to understand your query.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="name" className={labelClass}>
                          Full Name <span className="ml-0.5 text-red-500">*</span>
                        </label>

                        <input
                          type="text"
                          id="name"
                          name="name"
                          autoComplete="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className={inputClass(Boolean(formErrors.name))}
                          placeholder="Your name"
                        />

                        <FieldError message={errorText("name")} />
                      </div>

                      <div>
                        <label htmlFor="email" className={labelClass}>
                          Email Address{" "}
                          <span className="ml-0.5 text-red-500">*</span>
                        </label>

                        <input
                          type="email"
                          id="email"
                          name="email"
                          autoComplete="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                          className={inputClass(Boolean(formErrors.email))}
                          placeholder="you@example.com"
                        />

                        <FieldError message={errorText("email")} />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contactNumber" className={labelClass}>
                        Contact Number{" "}
                        <span className="ml-0.5 text-red-500">*</span>
                      </label>

                      <div className="flex">
                        <span
                          className={`inline-flex items-center rounded-l-2xl border border-r-0 px-4 text-sm font-semibold ${
                            formErrors.contactNumber
                              ? "border-red-400"
                              : isDark
                              ? "border-stone-700 bg-stone-800 text-stone-300"
                              : "border-orange-100 bg-orange-50 text-stone-700"
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
                          placeholder="XXXXXXXXXX"
                          className={`${inputClass(
                            Boolean(formErrors.contactNumber)
                          )} !rounded-l-none`}
                        />
                      </div>

                      <FieldError message={errorText("contactNumber")} />
                    </div>

                    <div>
                      <label htmlFor="message" className={labelClass}>
                        Message{" "}
                        <span
                          className={`ml-1 text-xs font-normal ${t.muted}`}
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
                        placeholder="Describe your query, order issue, payment concern, book access problem, feedback, or anything else..."
                      />

                      <FieldError message={errorText("message")} />
                    </div>

                    <div
                      className={`flex items-start gap-3 rounded-2xl border p-4 ${t.inner}`}
                    >
                      <ShieldCheck
                        size={18}
                        className="mt-0.5 shrink-0 text-orange-500"
                      />

                      <p className={`text-xs leading-5 ${t.p}`}>
                        By submitting this form, you agree that Target Trek may
                        contact you regarding your enquiry.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40 focus:outline-none focus:ring-4 focus:ring-orange-500/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={19} className="animate-spin" />
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
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* FAQ                                                              */}
      {/* ================================================================ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <span
              className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] ${t.eyebrow}`}
            >
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-orange-500" />
              Quick Answers
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-orange-500" />
            </span>

            <h2
              className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${t.h}`}
            >
              Common{" "}
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                questions
              </span>
            </h2>
          </Reveal>

          <div className="mt-10 space-y-3">
            {faqs.map((item, i) => {
              const open = openFaq === i;

              return (
                <Reveal key={item.q} delay={i * 0.04} y={20}>
                  <div
                    className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${t.card} ${
                      open ? (isDark ? "border-orange-500/40" : "border-orange-300") : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? -1 : i)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left"
                    >
                      <span className={`text-sm font-bold sm:text-base ${t.h}`}>
                        {item.q}
                      </span>

                      <ChevronDown
                        size={20}
                        className={`shrink-0 text-orange-500 transition-transform duration-300 ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: EASE }}
                        >
                          <p className={`px-5 pb-5 text-sm leading-7 ${t.p}`}>
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* BOTTOM CTA                                                       */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden bg-[#0c0907] py-16 text-white sm:py-20">
        <motion.div
          aria-hidden="true"
          animate={
            reduce ? undefined : { scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/30 blur-[120px]"
        />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <Headphones size={38} className="mx-auto text-orange-400" />

            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Need help with a{" "}
              <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                purchase?
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-stone-300">
              For book access, payment, downloading, order confirmation or
              customer support, you can contact us directly by email.
            </p>

            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="group mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition hover:-translate-y-0.5"
            >
              <Mail size={17} />
              Email Support
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </a>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

const ContactRow = ({ icon: Icon, title, description, href, t, isDark }) => (
  <a
    href={href}
    className={`group flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 ${
      isDark
        ? "border-orange-500/10 bg-stone-950/50 hover:border-orange-500/40"
        : "border-orange-100 bg-orange-50/50 hover:border-orange-300 hover:bg-white hover:shadow-md"
    }`}
  >
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition duration-300 group-hover:bg-orange-500 group-hover:text-white ${t.iconBox}`}
    >
      <Icon size={19} />
    </div>

    <div className="min-w-0">
      <p className={`text-sm font-bold ${t.h}`}>{title}</p>
      <p className={`mt-0.5 break-all text-sm ${t.p}`}>{description}</p>
    </div>

    <ArrowRight
      size={17}
      className="ml-auto shrink-0 text-orange-500 transition-transform group-hover:translate-x-1"
    />
  </a>
);

const FieldError = ({ message }) => (
  <AnimatePresence>
    {message && (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-1.5 text-xs font-medium text-red-500"
      >
        {message}
      </motion.p>
    )}
  </AnimatePresence>
);

export default ContactPage;
