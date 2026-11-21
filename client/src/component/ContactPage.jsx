import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { z } from "zod";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowRight, BookOpen, CaretRight, ChatCircleText, Check, CheckCircle, Clock, Copy, CreditCard, DownloadSimple,
  Envelope, Headset, MapPin, PaperPlaneTilt, ShieldCheck, User,
} from "@phosphor-icons/react";

import BASE_URL from "../utils/Url.js";
import { Btn, Field, Page, cx, useReveal } from "../resume/ui";
import { OPERATOR, HAS_OPERATOR_INFO } from "../config/operator";
import "./about.css";

/* =====================================================================
   SEO
===================================================================== */
const SITE_URL = "https://www.targettrek.in";
const PAGE_URL = `${SITE_URL}/contact`;
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const SEO_TITLE = "Contact Target Trek | Book, Payment & Customer Support";
const SEO_DESCRIPTION = "Contact Target Trek for ebook support, payment queries, downloads, educational resources and general enquiries.";
const MESSAGE_MAX = 2000;

/* =====================================================================
   CONTENT
===================================================================== */
const TOPICS = [
  {
    id: "book", icon: BookOpen, title: "Book support",
    text: "Questions about our HLD, LLD, GenAI and other learning resources.",
    include: ["The book's name", "The chapter or topic you're asking about"],
  },
  {
    id: "payment", icon: CreditCard, title: "Payment help",
    text: "Need help confirming a payment or finding an order?",
    include: ["The email you paid with", "Payment ID or screenshot, if you have it"],
  },
  {
    id: "download", icon: DownloadSimple, title: "Download help",
    text: "Trouble opening or downloading a book you bought?",
    include: ["The email you paid with", "Which book, and what you see when you try"],
  },
  {
    id: "general", icon: ChatCircleText, title: "General enquiry",
    text: "A suggestion, a business enquiry or anything else.",
    include: ["What it's about", "How we can best reply to you"],
  },
];

const FAQS = [
  ["I paid but can't access my book. What should I do?", "Send us a message with the email address you used while purchasing and, if you have it, your payment confirmation. This helps us find your order quickly."],
  ["I'm having trouble downloading my ebook.", "Tell us which book you purchased and what you see when you try to download it. Include the email used for the purchase so we can check your access."],
  ["Which email should I use for which query?", `Use ${SUPPORT_EMAIL} for book access, payment and download support.`],
  ["Can I send a suggestion or feedback?", "Yes. Pick “General enquiry” in the form and describe your idea. We use feedback to improve our books and resources."],
];

const contactSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  contactNumber: z.string().regex(/^[0-9]{10}$/, { message: "Enter a valid 10 digit mobile number" }),
  message: z.string().trim().max(MESSAGE_MAX, { message: `Keep it under ${MESSAGE_MAX} characters` }).optional(),
});

const EMPTY = { name: "", email: "", contactNumber: "", message: "" };

/* =====================================================================
   PIECES
===================================================================== */
function Head() {
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage", "@id": `${PAGE_URL}#webpage`, url: PAGE_URL, name: SEO_TITLE, description: SEO_DESCRIPTION,
        about: { "@type": "Organization", name: "Target Trek", url: SITE_URL, email: SUPPORT_EMAIL, contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: SUPPORT_EMAIL, availableLanguage: ["English", "Hindi"] } },
      },
      {
        "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Contact", item: PAGE_URL },
        ],
      },
      { "@type": "FAQPage", mainEntity: FAQS.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ],
  });
  return (
    <Helmet>
      <meta name="keywords" content="Target Trek contact, Target Trek support, ebook support, system design book support, Target Trek payment support" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={PAGE_URL} />
      <meta property="og:title" content="Contact Target Trek" />
      <meta property="og:description" content="Need assistance with a Target Trek book, payment or download? Contact our support team." />
      <meta property="og:url" content={PAGE_URL} />
      <meta property="og:type" content="website" />
      <script type="application/ld+json">{schema}</script>
    </Helmet>
  );
}

function MailCard() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy. Please select the address instead.");
    }
  };
  return (
    <div className="ct-mail">
      <div className="ct-mail-row">
        <span className="tt-ico"><Headset size={24} weight="duotone" aria-hidden /></span>
        <div>
          <span className="ct-mail-k">Customer support</span>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="ct-mail-v">{SUPPORT_EMAIL}</a>
        </div>
      </div>
      {HAS_OPERATOR_INFO && (
        <dl className="ct-op">
          {OPERATOR.name && (
            <div><User size={18} weight="duotone" aria-hidden /><span><dt>Operated by</dt><dd>{OPERATOR.name}</dd></span></div>
          )}
          {OPERATOR.email && (
            <div><Envelope size={18} weight="duotone" aria-hidden /><span><dt>Email</dt><dd><a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a></dd></span></div>
          )}
          {OPERATOR.address && (
            <div><MapPin size={18} weight="duotone" aria-hidden /><span><dt>Business address</dt><dd><address>{OPERATOR.address}</address></dd></span></div>
          )}
        </dl>
      )}
      <div className="ct-mail-btns">
        <Btn as="a" href={`mailto:${SUPPORT_EMAIL}`} variant="ghost" size="sm"><Envelope size={16} weight="bold" aria-hidden />Open email</Btn>
        <Btn variant="ghost" size="sm" onClick={copy} aria-live="polite">
          {copied ? <><Check size={16} weight="bold" aria-hidden />Copied</> : <><Copy size={16} weight="bold" aria-hidden />Copy address</>}
        </Btn>
      </div>
    </div>
  );
}

/* =====================================================================
   PAGE
===================================================================== */
export default function ContactPage() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [topic, setTopic] = useState("general");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const formRef = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useReveal();

  const current = TOPICS.find((t) => t.id === topic) || TOPICS[3];

  const pickTopic = (id, scroll = false) => {
    setTopic(id);
    setSent(false);
    if (scroll) formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    const next = name === "contactNumber" ? value.replace(/\D/g, "").slice(0, 10) : value;
    setForm((f) => ({ ...f, [name]: next }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setErrors({});

    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setSending(true);
    const body = parsed.data.message ? `[${current.title}]\n\n${parsed.data.message}` : `[${current.title}]`;
    const payload = { ...parsed.data, message: body, contactNumber: `+91${parsed.data.contactNumber}`, service: "Other Inquiry" };
    const tid = toast.loading("Sending your message...");

    try {
      const res = await axios.post(`${BASE_URL}/messages/us`, payload);
      toast.dismiss(tid);
      if (res.status === 200 || res.status === 201) {
        toast.success("Message sent! We'll get back to you soon.");
        setForm(EMPTY);
        setSent(true);
      } else {
        toast.error("Received an unexpected server response.");
      }
    } catch (err) {
      toast.dismiss(tid);
      console.error("Contact form submission error:", err);
      toast.error(err.response?.data?.message || "Unable to send your message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const err = (k) => errors[k]?.[0];

  return (
    <Page title={SEO_TITLE} description={SEO_DESCRIPTION} className="rl ct">
      <Head />
      <Toaster position="top-center" />
      <main>
        {/* ---------- hero + form ---------- */}
        <section className="rl-hero ct-hero" aria-labelledby="contact-h">
          <div className="rv-shell">
            <nav aria-label="Breadcrumb" className="tt-crumb" style={{ marginBottom: 24 }}>
              <Link to="/">Home</Link><CaretRight size={12} weight="bold" aria-hidden /><span aria-current="page">Contact</span>
            </nav>
            <div className="ct-grid">
              <div className="ct-copy rv-in">
                <span className="rl-pill"><span className="rl-dot" aria-hidden />Target Trek support</span>
                <h1 id="contact-h" className="rl-h1">How can we <span className="rl-mark">help you?</span></h1>
                <p className="rl-lead">Questions about a book, a payment, download access or anything else? Send us a message and our team will get back to you.</p>
                <MailCard />
                <ul className="ct-facts">
                  <li><Clock size={18} weight="duotone" aria-hidden /><span><b>We reply by email</b>, to the address you enter in the form.</span></li>
                  <li><ShieldCheck size={18} weight="duotone" aria-hidden /><span>For order queries, include <b>the email you used while purchasing</b>. It&apos;s the fastest way for us to find your order.</span></li>
                </ul>
              </div>

              <div className="rv-in" style={{ "--i": 2, minWidth: 0 }}>
                <div id="contact-us" ref={formRef} className="ct-form">
                  {sent ? (
                    <div className="ct-sent" role="status">
                      <span className="ct-sent-ico"><CheckCircle size={34} weight="fill" aria-hidden /></span>
                      <h2>Message sent</h2>
                      <p>Thanks for writing to us. We&apos;ve received your message and will reply to the email address you gave us.</p>
                      <Btn variant="ghost" onClick={() => setSent(false)}>Send another message</Btn>
                    </div>
                  ) : (
                    <form onSubmit={onSubmit} noValidate style={{ display: "grid", gap: 18 }}>
                      <div className="ct-form-head">
                        <h2>Send us a message</h2>
                        <p>Pick a topic, then tell us enough detail to understand your query.</p>
                      </div>

                      <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
                        <legend className="rv-label">What&apos;s it about?</legend>
                        <div className="ct-topics">
                          {TOPICS.map(({ id, icon: Icon, title }) => (
                            <button key={id} type="button" className="ct-topic" aria-pressed={topic === id} onClick={() => pickTopic(id)} disabled={sending}>
                              <Icon size={18} weight="duotone" aria-hidden /><span>{title}</span>
                            </button>
                          ))}
                        </div>
                      </fieldset>

                      <div className="ct-row">
                        <Field label="Full name" htmlFor="name" error={err("name")} required>
                          <input id="name" name="name" type="text" autoComplete="name" className={cx("rv-input", err("name") && "bad")} value={form.name} onChange={onChange} disabled={sending} placeholder="Your name" aria-invalid={Boolean(err("name"))} />
                        </Field>
                        <Field label="Email address" htmlFor="email" error={err("email")} required>
                          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" className={cx("rv-input", err("email") && "bad")} value={form.email} onChange={onChange} disabled={sending} placeholder="you@example.com" aria-invalid={Boolean(err("email"))} />
                        </Field>
                      </div>

                      <Field label="Mobile number" htmlFor="contactNumber" error={err("contactNumber")} required>
                        <div className={cx("ct-phone", err("contactNumber") && "bad")}>
                          <span aria-hidden>+91</span>
                          <input id="contactNumber" name="contactNumber" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} className={cx("rv-input", err("contactNumber") && "bad")} value={form.contactNumber} onChange={onChange} disabled={sending} placeholder="10 digit number" aria-invalid={Boolean(err("contactNumber"))} />
                        </div>
                      </Field>

                      <div>
                        <Field label="Your message" htmlFor="message" error={err("message")} optional>
                          <textarea id="message" name="message" rows={5} maxLength={MESSAGE_MAX} className={cx("rv-input", err("message") && "bad")} value={form.message} onChange={onChange} disabled={sending} placeholder="Tell us what you need help with..." />
                        </Field>
                        <p className="ct-count rv-mono" aria-live="polite">{form.message.length}/{MESSAGE_MAX}</p>
                      </div>

                      <div className="rv-note" style={{ display: "grid", gap: 8 }}>
                        <b style={{ fontSize: 13.5 }}>Helpful to include for {current.title.toLowerCase()}:</b>
                        <ul style={{ display: "grid", gap: 4 }}>
                          {current.include.map((x) => <li key={x} style={{ display: "flex", gap: 8 }}><Check size={15} weight="bold" aria-hidden style={{ marginTop: 3, color: "var(--rv-brand)", flex: "0 0 auto" }} />{x}</li>)}
                        </ul>
                      </div>

                      <Btn type="submit" size="lg" block loading={sending}>
                        {sending ? "Sending..." : <>Send message <PaperPlaneTilt size={18} weight="bold" aria-hidden /></>}
                      </Btn>
                      <p className="ct-fine">Prefer email? Write to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- topics ---------- */}
        <section id="topics" className="rl-sec rl-sec-tint" aria-labelledby="topics-h">
          <div className="rv-shell">
            <header className="rl-sec-head rv-reveal">
              <span className="rl-eyebrow">What we can help with</span>
              <h2 id="topics-h" className="rl-h2">Pick the closest topic</h2>
              <p className="rl-lead">Choosing a topic sets up the form for you and shows what to include, so we can reply in one go.</p>
            </header>
            <div className="tt-grid four">
              {TOPICS.map(({ id, icon: Icon, title, text, include }, i) => (
                <div key={id} className="tt-card rv-reveal" style={{ "--i": i }}>
                  <span className="tt-ico"><Icon size={24} weight="duotone" aria-hidden /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <div className="ct-help">
                    <span className="ct-help-k">Include</span>
                    <ul>{include.map((x) => <li key={x}><Check size={14} weight="bold" aria-hidden />{x}</li>)}</ul>
                    <Btn variant="ghost" size="sm" onClick={() => pickTopic(id, true)}>Ask about this <ArrowRight size={14} weight="bold" aria-hidden /></Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- faq ---------- */}
        <section id="faq" className="rl-sec" aria-labelledby="faq-h">
          <div className="rv-shell rl-faq-grid">
            <div className="rl-faq-side rv-reveal">
              <span className="rl-eyebrow">FAQ</span>
              <h2 id="faq-h" className="rl-h2">Quick answers</h2>
              <p className="rl-lead">The most common questions about access, payments and downloads.</p>
            </div>
            <div className="rl-faq-list rv-reveal" style={{ "--i": 1 }}>
              {FAQS.map(([q, a], i) => (
                <details key={q} className="rl-faq" open={i === 0}>
                  <summary><h3>{q}</h3></summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- final ---------- */}
        <section className="rl-sec" style={{ paddingTop: 0 }} aria-labelledby="final-h">
          <div className="rv-shell">
            <div className="rl-final rv-reveal">
              <span className="rl-eyebrow" style={{ color: "#5eead4" }}>While you wait</span>
              <h2 id="final-h" className="rl-h2">Keep learning with <span className="rl-mark">Target Trek</span></h2>
              <p>Browse developer books on System Design, LLD, Backend Engineering and GenAI, or start with our free resources.</p>
              <div className="rl-hero-btns">
                <Btn as={Link} to="/books" size="lg">Explore books <ArrowRight size={18} weight="bold" aria-hidden /></Btn>
                <Btn as={Link} to="/resources" size="lg" variant="ghost">Free resources</Btn>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Page>
  );
}
