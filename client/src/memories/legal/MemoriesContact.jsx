import { useState } from "react";
import { Check, Copy, CreditCard, FileWarning, Mail, ShieldAlert, Trash2, Wrench } from "lucide-react";

import LegalLayout, { Mail_, P, UL } from "./LegalLayout";
import { D } from "./useLifetime";
import { BRAND, SUPPORT_EMAIL, mailto } from "./constants";
import { Button, cx } from "../ui";

const TOPICS = [
  { id: "payment", icon: CreditCard, title: "A payment or credit problem", subject: "Payment problem - Memories", body: "Account email:\nPayment reference / order ID:\nAmount and date:\nWhat happened:\n" },
  { id: "page", icon: Wrench, title: "My page isn't working", subject: "Page problem - Memories", body: "Account email:\nPage name or link:\nWhat I expected:\nWhat happened (and on which phone or browser):\n" },
  { id: "report", icon: ShieldAlert, title: "Report a page", subject: "Report a page - Memories", body: "Link of the page:\nWhat is wrong with it:\n(Please don't forward the PIN.)\n" },
  { id: "data", icon: Trash2, title: "Delete my data or account", subject: "Delete my Memories account", body: "Account email:\nPlease delete: (my account and all pages / a specific page)\n" },
  { id: "other", icon: FileWarning, title: "Something else", subject: "Question about Memories", body: "" },
];

function CopyEmail() {
  const [done, setDone] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(SUPPORT_EMAIL); setDone(true); setTimeout(() => setDone(false), 1800); } catch { /* blocked */ } };
  return (
    <div className="mt-4 flex flex-col gap-3 rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 p-5 text-white shadow-lg shadow-rose-200/60 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/80">Support email</p>
        <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-1 block break-all text-xl font-bold hover:underline sm:text-2xl">{SUPPORT_EMAIL}</a>
        <p className="mt-1 text-sm text-white/90">For any issue with payments, pages, PINs or your account.</p>
      </div>
      <div className="flex gap-2">
        <Button as="a" href={`mailto:${SUPPORT_EMAIL}`} variant="outline" size="sm" className="!text-rose-600"><Mail className="h-4 w-4" aria-hidden /> Email us</Button>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/40 hover:bg-white/30">{done ? <><Check className="h-4 w-4" aria-hidden /> Copied</> : <><Copy className="h-4 w-4" aria-hidden /> Copy</>}</button>
      </div>
    </div>
  );
}

/* Writes the email for you: pick what it's about, fill in a few things, and your own email app opens with it ready to send. */
function Composer() {
  const [topic, setTopic] = useState(TOPICS[0].id);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const t = TOPICS.find((x) => x.id === topic);
  const body = `${t.body}${t.body ? "\n" : ""}${msg ? `Details:\n${msg}\n\n` : ""}${name ? `Name: ${name}\n` : ""}${email ? `Reply to: ${email}\n` : ""}`;
  const input = "w-full rounded-xl border border-rose-100 bg-white px-3.5 py-2.5 text-sm text-[#3a1530] outline-none transition placeholder:text-[#c4a8b8] focus:border-rose-400 focus:ring-4 focus:ring-rose-100";
  return (
    <div className="mt-4 rounded-3xl border border-rose-100 bg-[#fffaf6] p-4 sm:p-6">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="What is it about?">
        {TOPICS.map(({ id, icon: Icon, title }) => (
          <button key={id} type="button" role="radio" aria-checked={topic === id} onClick={() => setTopic(id)} className={cx("flex items-center gap-2.5 rounded-2xl border p-3 text-left text-sm font-semibold transition", topic === id ? "border-rose-400 bg-white text-rose-700 ring-2 ring-rose-100" : "border-rose-100 bg-white/70 text-[#6b3a5a] hover:bg-white")}>
            <span className={cx("grid h-9 w-9 shrink-0 place-items-center rounded-xl", topic === id ? "bg-rose-100 text-rose-600" : "bg-rose-50 text-rose-400")}><Icon className="h-[18px] w-[18px]" aria-hidden /></span>{title}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div><label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#a07890]" htmlFor="ct-name">Your name</label><input id="ct-name" className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
        <div><label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#a07890]" htmlFor="ct-email">Your email</label><input id="ct-email" type="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="The one on your account" /></div>
        <div className="sm:col-span-2"><label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#a07890]" htmlFor="ct-msg">Tell us what happened</label><textarea id="ct-msg" rows={4} className={input} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="The more detail, the faster we can help." /></div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button as="a" href={mailto(t.subject, body)} size="lg"><Mail className="h-4 w-4" aria-hidden /> Open my email app</Button>
        <p className="text-xs text-[#8a6a80]">This opens your email app with everything filled in, addressed to {SUPPORT_EMAIL}. Nothing is sent until you press send there.</p>
      </div>
    </div>
  );
}

const sections = [
  { id: "email", title: "Email us", body: <><P>Email is the best way to reach us. Please write from the address on your Memories account so we can find it quickly.</P><CopyEmail /></> },
  { id: "write", title: "Write to us about…", body: <><P>Pick what it&apos;s about and we&apos;ll set up the email for you with the details that help us most.</P><Composer /></> },
  {
    id: "before", title: "Before you write",
    body: (
      <>
        <P>These often solve it in a minute:</P>
        <UL items={[
          <><b>Paid but no credit?</b> Wait a few minutes and refresh the app. Payments can take a little while to confirm.</>,
          <><b>The person can&apos;t open your page?</b> Check the link, and the PIN if it&apos;s private. You can see your PIN in My pages. If the page was disabled, enable it again there.</>,
          <><b>Video won&apos;t play?</b> Use an MP4 file. Some phone formats (like .mov) don&apos;t play in every browser.</>,
          <><b>Wrong name on a page?</b> Names can&apos;t be changed after a page is created. You can make a new page with the right name.</>,
          <><b>A page link stopped working?</b> Every page is online for <D /> days from the day it is created, then it is deleted. Check the date, and make a new page if you want to share it again.</>,
        ]} />
        <P>Never send us your card number, bank details or a page&apos;s PIN by email. We&apos;ll never ask for them.</P>
      </>
    ),
  },
  {
    id: "response", title: "What to expect",
    body: <><P>We read every message and usually reply within 2 working days. Payment problems are looked at first. For urgent safety concerns, such as a page that harasses someone, put &ldquo;Report a page&rdquo; in the subject and include the link.</P><P>{BRAND} · Memories · <a className="font-semibold text-rose-600 hover:underline" href="https://www.targettrek.in/memories">www.targettrek.in/memories</a> · <Mail_ /></P></>,
  },
];

export default function MemoriesContact() {
  return <LegalLayout title="Contact &amp; Support" path="/memories/contact" description={`Contact Memories by ${BRAND} for payment, page or account help: ${SUPPORT_EMAIL}.`} intro="Something not working, a payment question, or a page you want to report? Write to us and we'll sort it out." sections={sections} />;
}
