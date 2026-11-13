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
What the payment was for (credit, upgrade or extra room, and which page):
Payment reference / order ID of EACH payment (from the confirmation or bank SMS):
Screenshot or bank statement lines (optional):

Thank you.`;

const sections = [
  {
    id: "summary", title: "The short version",
    body: (
      <UL items={[
        <><b>All purchases are final and not refundable.</b> This is true for credits, upgrades, extra room and every other payment.</>,
        <><b>The only exception is a double payment.</b> If the same purchase was charged to you more than once, email <Mail_ subject="Double payment refund - Memories" body={REQUEST_BODY} /> and we refund the extra payment.</>,
        <><b>If you delete a page, you get no refund and no new page.</b> The credit used for it is gone for good.</>,
        <>Once a page is created, its names and email address can&apos;t be changed. Please check them before you create it.</>,
        <>If you paid but your purchase didn&apos;t arrive, we don&apos;t refund it: we add what you paid for.</>,
        <><b>Pages are online for <D /> days</b> from creation, then they are deleted. That is part of the service.</>,
      ]} />
    ),
  },
  {
    id: "how", title: "What you can buy",
    body: (
      <>
        <P>Memories is not a subscription. You pay once for each thing you buy:</P>
        <UL items={[
          <><b>A credit.</b> One credit creates one page, for the look you bought or any look that costs the same or less. The page stays online for <D /> days.</>,
          <><b>An upgrade.</b> If you want a dearer look than your credit or page covers, you pay only the difference.</>,
          <><b>Extra room.</b> More photos, videos, voice, letter length or days online, in packs, for one page or for the credit that will make it.</>,
        ]} />
        <P>The price is always shown before you pay. A purchase is added to your account as soon as your payment provider confirms the payment, usually within a minute.</P>
      </>
    ),
  },
  {
    id: "none", title: "No refunds",
    body: (
      <>
        <P>Everything here is a digital product that is available to you the moment it is added, so <b>we don&apos;t give refunds</b>, except for a double payment (see below). This includes, for example:</P>
        <UL items={[
          "changing your mind, or buying a credit, upgrade or room you don't use;",
          "a payment made by mistake, for the wrong template, look, page or amount;",
          "a credit that was used to create a page;",
          "extra room you bought but didn't fill, or that ended with its page;",
          "an upgrade to a look you decide not to use;",
          "a page the other person didn't open, liked or answered in the way you hoped;",
          <>a page that reached the end of its <D /> days and was deleted (every page is online for <D /> days from the day it is created);</>,
          "pages removed or blocked for breaking our Terms, and accounts closed for breaking them;",
          "a price difference between Gumroad and our website, or a price that changed after you bought;",
          "free credits from a unique code or given to you by us (nothing was paid).",
        ]} />
        <Note>Please look at the template and its live preview before you pay. Every template is shown exactly as the other person will see it, and you can try the looks first.</Note>
      </>
    ),
  },
  {
    id: "double", title: "Double payments (the only refund we make)",
    body: (
      <>
        <P>A double payment means the <b>same purchase was charged to you more than once</b>: for example you pressed pay twice, paid the same upgrade or room from two tabs or devices, a payment page was refreshed, or your bank charged you again for one order.</P>
        <UL items={[
          <>Email us at <Mail_ subject="Double payment refund - Memories" body={REQUEST_BODY} /> from the email on your account. Please tell us as soon as you notice, ideally within 30 days of the payment.</>,
          "We check the payments with our payment provider. If two or more payments went through for one purchase, you keep the one purchase and we refund every extra payment in full.",
          "Two separate purchases are not a double payment: for example two credits, or room for two different pages. Each is something you asked for.",
          "A payment made by mistake for the wrong thing, or that you simply no longer want, is not a double payment and is not refunded.",
        ]} />
        <P>In your email, include: the date and amount of each payment; what each payment was for (a credit, an upgrade or extra room, and which page); the payment reference or order ID of each payment from your confirmation or bank message; and, if you have them, a screenshot or bank statement lines. We reply with a decision, usually within 2 working days.</P>
        <P>An approved refund goes back to the original payment method (card, UPI or bank). We start it right away; it then usually shows up in <b>5 to 7 working days</b>, depending on your bank or payment app. We don&apos;t charge a fee for it.</P>
        <div className="mt-5"><Button as="a" href={mailto("Double payment refund - Memories", REQUEST_BODY)}><Mail className="h-4 w-4" aria-hidden /> Report a double payment</Button></div>
      </>
    ),
  },
  {
    id: "delete", title: "If you delete a page",
    body: (
      <>
        <P>You can delete a page yourself at any time. If you do:</P>
        <UL items={[
          <><b>You get no refund.</b></>,
          <><b>You don&apos;t get another page.</b> The credit that made the page is used up and is not given back, so to make a new page you need a new credit.</>,
          "Everything on the page is permanently removed: your text, photos, videos, and the replies and answers the other person sent. We can't bring it back.",
          "Extra room and extra days bought for that page go with it and are not moved to another page.",
        ]} />
        <P>The same is true when a page reaches the end of its <D /> days and is deleted. Please be sure before you delete.</P>
      </>
    ),
  },
  {
    id: "fixed", title: "Things you can't change after a page is created",
    body: (
      <>
        <UL items={[
          <>The name of the person the page is for, and your name on it, are fixed when the page is created and <b>can&apos;t be changed</b>.</>,
          <>The email address a page is sent to is fixed too. If you create a page without one you can add it once; after that it can&apos;t be changed.</>,
          "Because of this, we don't refund or replace a page that was made with a wrong name or email address. Check the spelling before you create it.",
          "Other things, such as the message, photos and the look, can still be edited on your page (a dearer look costs the difference).",
        ]} />
      </>
    ),
  },
  {
    id: "gumroad", title: "Gumroad purchases",
    body: (
      <>
        <UL items={[
          "A Gumroad purchase is a payment to Gumroad, and Gumroad's own terms apply to it. We don't refund it.",
          "Once you redeem a Gumroad order on Memories, the credits are added to your account and the same rules apply as for any credit: no refunds, and none if you delete the page.",
          "A refunded or charged-back Gumroad order can't be redeemed, and we may take back credits from an order that was refunded after it was redeemed.",
          <><b>Gumroad prices and website prices can be different.</b> We don&apos;t refund, match or adjust the difference between the two.</>,
          "A Gumroad credit covers any template and any look. Extra room is not included, and is paid for separately on our website.",
        ]} />
      </>
    ),
  },
  {
    id: "missing", title: "Paid but nothing arrived?",
    body: (
      <>
        <P>Sometimes a bank or payment app takes a few minutes to confirm. Wait a little and refresh the app. If your money was taken and your credit, upgrade or room is still missing, email us with the payment reference and we&apos;ll add what you paid for. This isn&apos;t a refund: you simply get what you bought.</P>
        <P>If a payment <b>failed or was cancelled</b> and the money left your account, your bank normally returns it by itself in about 5 to 7 working days. That return comes from your bank or payment app, not from us. Write to us with the payment reference if it doesn&apos;t arrive.</P>
      </>
    ),
  },
  {
    id: "contact", title: "Contact",
    body: <P>Anything unclear? Write to <Mail_ subject="Question about a payment" /> or visit the <Link to="/memories/contact" className="font-semibold text-rose-600 hover:underline">contact page</Link>.</P>,
  },
];

export default function MemoriesRefund() {
  return <LegalLayout title="Refund Policy" path="/memories/refund" description={`Memories by ${BRAND}: all purchases are final; the only refund is for a double payment. Support: ${SUPPORT_EMAIL}.`} intro="All purchases are final. The only refund is for a double payment (email supporttargettrek@gmail.com). Deleting a page does not give you a refund or a new page." sections={sections} />;
}
