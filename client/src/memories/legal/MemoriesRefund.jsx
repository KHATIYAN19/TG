import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

import LegalLayout, { Mail_, Note, P, UL } from "./LegalLayout";
import { D } from "./useLifetime";
import { BRAND, SUPPORT_EMAIL, mailto } from "./constants";
import { Button } from "../ui";

const REQUEST_BODY = `Hello Target Trek Support,

I was charged more than once for the same Memories purchase and would like the extra payment refunded.

Account email:
Date(s) of payment:
Amount charged each time:
Payment reference / order ID of EACH payment (from the confirmation or bank SMS):
Screenshot or bank statement lines (optional):

Thank you.`;

const sections = [
  {
    id: "summary", title: "The short version",
    body: (
      <>
        <UL items={[
          <><b>All purchases are final.</b> Memories credits are not refundable.</>,
          <><b>One exception: a double payment.</b> If you were charged more than once for the same purchase, we refund the extra payment in full.</>,
          <>If you paid but your credit didn&apos;t arrive, we don&apos;t refund it: we add the credit you paid for.</>,
          <><b>Pages are online for <D /> days</b> from creation, then they are deleted. That is part of the service, so it doesn&apos;t make a credit refundable.</>,
        ]} />
        <div className="mt-5"><Button as="a" href={mailto("Double payment refund - Memories", REQUEST_BODY)}><Mail className="h-4 w-4" aria-hidden /> Report a double payment</Button></div>
      </>
    ),
  },
  {
    id: "how", title: "How payments and credits work",
    body: <P>Memories is not a subscription. You pay once for a credit, and <b>one credit creates one page</b>. A credit is added to your account as soon as your payment provider confirms the payment, usually within a minute. The page you make with it stays online for <D /> days. You can see your credits at the top of the app. The price is always shown before you pay.</P>,
  },
  {
    id: "none", title: "What isn't refundable",
    body: (
      <>
        <P>Because a credit is a digital product that is available to you the moment it is added, we don&apos;t give refunds for it. This includes:</P>
        <UL items={[
          "changing your mind, or buying a credit you don't use;",
          "a credit that was used to create a page, including pages you later delete, disable or are unhappy with;",
          "a page the other person didn't open, liked or answered in the way you hoped;",
          <>a page that reached the end of its <D /> days and was deleted (every page is online for <D /> days from the day it is created);</>,
          "pages removed or blocked for breaking our Terms;",
          "free credits from a unique code (nothing was paid).",
        ]} />
        <Note>Please look at the template and its live preview before you pay. Every template is shown exactly as the other person will see it, and you can try the looks first.</Note>
      </>
    ),
  },
  {
    id: "double", title: "Double payments (the one refund we make)",
    body: (
      <>
        <P>A double payment means the <b>same purchase was charged to you more than once</b>: for example you pressed pay twice, a payment page was refreshed, or your bank charged you again for one order. You are only meant to pay once for one credit.</P>
        <UL items={[
          "We check the payments with our payment provider. If two or more payments went through for one purchase, you keep the one credit and we refund every extra payment in full.",
          "Please tell us as soon as you notice, ideally within 30 days of the payment.",
          "Two separate purchases of two credits are not a double payment: each is a credit you asked for.",
        ]} />
      </>
    ),
  },
  {
    id: "missing", title: "Paid but no credit?",
    body: (
      <>
        <P>Sometimes a bank or payment app takes a few minutes to confirm. Wait a little and refresh the app. If your money was taken and there is still no credit, email us with the payment reference and we&apos;ll add the credit you paid for. This isn&apos;t a refund: you simply get what you bought.</P>
        <P>If a payment <b>failed or was cancelled</b> and the money left your account, your bank normally returns it by itself in about 5 to 7 working days. Write to us if it doesn&apos;t arrive.</P>
      </>
    ),
  },
  {
    id: "ask", title: "How to report a double payment",
    body: (
      <>
        <P>Email <Mail_ subject="Double payment refund - Memories" body={REQUEST_BODY} /> from the email on your account and include:</P>
        <UL items={["the date and amount of each payment;", "the payment reference or order ID of each payment, from your confirmation or bank message;", "a screenshot or bank statement lines, if you have them (optional, but it speeds things up)."]} />
        <P>We reply with a decision, usually within 2 working days.</P>
      </>
    ),
  },
  {
    id: "when", title: "When and how you get the money",
    body: <P>An approved refund goes back to the original payment method (card, UPI or bank). We start it right away; it then usually shows up in <b>5 to 7 working days</b>, depending on your bank or payment app. We don&apos;t charge a fee for it.</P>,
  },
  {
    id: "contact", title: "Contact",
    body: <P>Anything unclear? Write to <Mail_ subject="Question about a payment" /> or visit the <Link to="/memories/contact" className="font-semibold text-rose-600 hover:underline">contact page</Link>.</P>,
  },
];

export default function MemoriesRefund() {
  return <LegalLayout title="Refund Policy" path="/memories/refund" description={`Memories by ${BRAND}: all purchases are final, except a refund for a double payment. Support: ${SUPPORT_EMAIL}.`} intro="Purchases are final. The only refund we make is when you are accidentally charged twice for the same purchase." sections={sections} />;
}
