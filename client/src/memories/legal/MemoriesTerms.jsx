import { Link } from "react-router-dom";

import LegalLayout, { Mail_, Note, P, UL } from "./LegalLayout";
import { D } from "./useLifetime";
import { BRAND, SUPPORT_EMAIL } from "./constants";

const sections = [
  {
    id: "about", title: "About these terms",
    body: <><P>These terms are the agreement between you and {BRAND} for using <b>Memories</b> (the pages at targettrek.in/memories), where you create a personal page (a birthday, apology, proposal, anniversary or thank-you page) and share it with someone by link.</P><P>By creating an account, paying, redeeming a code, creating a page or opening a page someone sent you, you agree to these terms and to our <Link className="font-semibold text-rose-600 hover:underline" to="/memories/privacy">Privacy Policy</Link> and <Link className="font-semibold text-rose-600 hover:underline" to="/memories/refund">Refund Policy</Link>. If you don&apos;t agree, please don&apos;t use Memories.</P></>,
  },
  {
    id: "service", title: "What Memories is",
    body: <><P>Memories lets you pick a template and a look, write your own words, add photos, videos and a voice message, and get a private or public link to share. The person who opens it can interact with the page: pop balloons, open gifts, answer a question and send you a reply.</P><UL items={["Pages are made for personal, non-commercial use between people who know each other.", "We provide the templates and hosting. The content is yours.", <><b>Every page stays online for <D /> days</b> from the day it is created, then it is permanently deleted (see &ldquo;How long a page stays online&rdquo; below).</>, <>The names on a page (the person it is for, and yours) and the email address it is sent to are fixed when you create it and <b>can&apos;t be changed afterwards</b>. If you create a page without an email address you can add one once; after that it is fixed too. Please check the spelling first. We don&apos;t refund or replace a page because of a wrong name or address.</>, "Some features, looks, prices and limits (like the number of photos and videos) can change over time. A change never takes away something you already paid for."]} /></>,
  },
  {
    id: "account", title: "Your account",
    body: <><UL items={["You must be 18 or older, or use Memories with a parent or guardian.", "Give correct details and keep your login private. You are responsible for what happens under your account.", "Tell us at once if you think someone else is using your account."]} /><P>We can limit or close an account that is used to break these terms or the law.</P></>,
  },
  {
    id: "credits", title: "Credits, prices and payment",
    body: <><UL items={[<>You pay for a <b>credit</b> (also called a pass). <b>One credit creates one page.</b> You can buy as many credits as you like and make as many pages as you have credits for.</>, "Every template and every look has its own price, and the price is shown in Indian rupees (INR) before you pay. Taxes are included where the law requires.", "Prices can change over time. The price you see when you pay is the price you are charged, and a price change never affects something you already bought.", "Payments are handled by licensed payment providers (such as Cashfree, Razorpay or PayU). We never see or store your card, UPI or bank details.", "A credit you pay for covers the look you bought and any look that costs the same or less. It is added to your account as soon as the payment provider confirms the payment.", "Credits are for your own use and can't be transferred, sold or exchanged for cash.", <>A page made with a credit stays online for <D /> days. When it expires or is deleted, the credit is not returned.</>, <><b>All purchases are final and not refundable.</b> The only exception is a double payment: if the same purchase is charged to you more than once, email <Mail_ subject="Double payment refund - Memories" /> and we refund the extra payment.</>]} /><P>The details are in our <Link className="font-semibold text-rose-600 hover:underline" to="/memories/refund">Refund Policy</Link>.</P></>,
  },
  {
    id: "upgrades", title: "Dearer looks: paying only the difference",
    body: <><UL items={["If you hold an unused paid credit and want a look that costs more than it covers, you pay only the difference, not the full price again. The difference is added to your credit, and the page you create with it can use that look.", "The same applies to a page you already made: to switch it to a dearer look you pay what is still missing between what you paid for that page and the price of the new look.", "The amount still to pay is worked out fresh every time, so if you have already paid part of it, only the balance is asked for.", "A credit that covers every look (see Codes and Gumroad below) never needs an upgrade.", "A look that costs less than what you paid can always be used at no extra cost."]} /></>,
  },
  {
    id: "room", title: "Extra room (more photos, videos, voice, letter and days)",
    body: <><UL items={["Every page comes with the limits shown for its template: a number of photos and videos, the size and length of each file, a voice message and a message length.", "If you need more, you can buy extra room in packs: more photos, more or longer videos, a bigger or longer voice message, a longer letter, or more days online. The price of each pack is shown before you pay.", "Extra room is paid for separately from the page, whichever way you got your credit, including codes and Gumroad. A credit never includes extra room unless you paid for it.", <>Extra room you buy <b>on a page</b> belongs to that page only. Extra room you buy <b>before creating a page</b> is attached to the credit it was bought for, and goes to the page that credit creates. It is not shared between pages or credits. If you want more room on two pages, buy it for each.</>, "There is a limit to how many packs of each kind one page can have.", "Extra days are added to the end of that page's online time. Extra room ends with the page and is not returned or moved when the page is deleted or expires.", "Room you have not used up is not refunded. Please check the limits before you pay."]} /></>,
  },
  {
    id: "codes", title: "Codes, Gumroad and credits we give you",
    body: <><UL items={["A unique code adds a free credit. Codes can be used once per person, may expire, and can't be sold or shared in bulk.", "A credit from a code, from us (for example a gift or a goodwill credit) or from a redeemed Gumroad order works for any template and any look, at any price.", "To redeem a Gumroad purchase you enter the order number and the email address from your Gumroad receipt. One Gumroad order can be redeemed only once, and a refunded order can't be redeemed.", <><b>Gumroad prices and website prices can be different.</b> What you paid on Gumroad is set on Gumroad, and what you pay on our website is the price shown here. We don&apos;t match, adjust or refund the difference between the two, and a Gumroad price never changes what a website purchase costs, or the other way round.</>, "A Gumroad purchase is sold under Gumroad's own terms. We don't refund Gumroad payments (a Gumroad double charge is for Gumroad to refund), and the credits you redeem follow the same no-refund rule as any credit.", "Credits from a code, from us or from Gumroad cover the page only. Extra room for those pages is bought separately, as described above.", "We may take back a credit that was given by mistake, obtained by misuse, or from an order that was refunded or charged back."]} /></>,
  },
  {
    id: "twice", title: "Paying from more than one tab or device",
    body: <><UL items={["Each payment you make is for the one purchase it was started for. Opening the same purchase in two tabs or on two devices and paying in both counts as two payments.", "Nothing you paid for is lost: a payment is applied once, and never twice. If the same purchase is charged twice, email us and we refund the extra payment, and only that (see the Refund Policy).", "Closing the window, going back or losing your connection never cancels a payment that went through. If the payment provider confirms it, your purchase is added, even if the page you were on didn't update."]} /></>,
  },
  {
    id: "lifetime", title: "How long a page stays online",
    body: (
      <>
        <P>Every page is available for <b><D /> days from the day it is created</b>. This is fixed: you can&apos;t extend, pause or restore a page yourself.</P>
        <UL items={[
          <>When the <D /> days are over, the page disappears. Its link stops working and nobody can open it, including you.</>,
          "Soon after, we permanently delete the page and everything on it: your text, photos and videos (removed from our storage), the replies and answers the other person sent, and the record of what they did on it.",
          "You can delete a page yourself earlier at any time. If you do, there is no refund and no new page: the credit is used up.",
          "The credit used for a page is not returned when the page is deleted or expires. If you want to share something again, create a new page with a new credit.",
          <>Pages that already existed before this rule started got a fresh <D /> days counted from that day.</>,
        ]} />
        <Note>Your My pages screen shows how many days each page has left. Share your link while it is live.</Note>
      </>
    ),
  },
  {
    id: "content", title: "What you can put on a page",
    body: <><P>You are responsible for everything you add: names, messages, photos, videos and replies. Do not use Memories to:</P><UL items={["harass, threaten, shame, blackmail or pressure anyone, including pressuring someone to say yes to a proposal or to forgive you;", "share intimate, sexual or violent content, or anything involving a child that is unsafe or inappropriate;", "post photos or videos of a person without their permission, or impersonate someone;", "break the law, spread hate, scams or malware, or infringe someone else's rights (for example by using music or images you don't have the right to use);", "send unwanted bulk messages, email a page to anyone who doesn't know you or whose address you have no right to use, or use pages for advertising."]} /><P>We may remove or block a page, and close the account, if we find or are told it breaks these rules. We try to be fair, but we can act without notice where safety or the law requires it.</P></>,
  },
  {
    id: "license", title: "Your content and our permission to host it",
    body: <><P>You keep ownership of what you upload. You give us permission to store, process and show it as needed to run your page: to host the files, to show the page to people who open your link, and to make backups. That permission ends when you delete the content or the page, except for a short period needed to finish removing it from our systems.</P><P>You promise that you own what you upload or have the right to use it.</P></>,
  },
  {
    id: "links", title: "Links, PINs and who can see a page",
    body: <><UL items={[<>A <b>public</b> page can be opened by anyone who has the link.</>, <>A <b>private</b> page also needs the 6-digit PIN. Share the PIN only with the person it is for. You can see your PIN in My pages and change it any time, which locks out everyone who had unlocked the page.</>, <>If you tick &ldquo;email this page&rdquo; when you create it, we email the link (and the PIN, for a private page) to the one address you enter. That address is fixed once the page is created, can be sent to a limited number of times, and we stop if the person asks us to. Only use the address of someone who knows you.</>, "You can disable a page, make a new link (the old one stops working) or delete the page whenever you want.", "If you share a link or PIN with the wrong person, or it is forwarded, we can't take that back. Use a new link or PIN."]} /></>,
  },
  {
    id: "activity", title: "What the person who opens your page does",
    body: <><P>When someone opens your page, we record what they do on it so <b>you</b> can see it: when it was opened, which gifts were opened, how far they got, any answer they give (for example yes, no or &ldquo;I need a little time&rdquo;) and any reply they send. This is shown to you in My pages under Activity.</P><UL items={[<>A &ldquo;yes&rdquo; or &ldquo;no&rdquo; to a question on a page is final once given. A &ldquo;need time&rdquo; answer can still change.</>, "How this is recorded is explained in our Privacy Policy. Please be kind and respect every answer."]} /><Note>Please remember a real person is on the other end. A proposal or an apology should never be used to pressure someone.</Note></>,
  },
  {
    id: "availability", title: "Availability and changes",
    body: <><P>We work hard to keep Memories running, but we can&apos;t promise it will always be available or error-free. We may update, change or stop features, and may pause creating new pages for maintenance. If we ever stop the service completely we will give notice and a fair chance to download or keep what you made where that is possible.</P></>,
  },
  {
    id: "liability", title: "Our responsibility",
    body: <><P>Memories is provided &ldquo;as is&rdquo;. To the extent the law allows, {BRAND} is not responsible for indirect or consequential loss, for what other people do with a page you share, or for answers and replies people give. Our total responsibility to you for any claim is limited to the amount you paid for the credit, upgrade or extra room the claim is about.</P><P>Nothing here limits rights you have under Indian consumer law that cannot be limited.</P></>,
  },
  {
    id: "ending", title: "Ending your use",
    body: <><P>You can stop using Memories at any time and delete your pages (deleting a page does not refund its credit or give you another page). You can ask us to delete your account and data by emailing <Mail_ subject="Delete my Memories account" />. We can suspend or end access if you break these terms. There are no refunds (apart from a double payment), including on an account closed for breaking the terms.</P></>,
  },
  {
    id: "changes", title: "Changes to these terms",
    body: <><P>We may update these terms. The date at the top shows the latest version. If a change is significant we will tell you in the app or by email. Using Memories after a change means you accept it.</P></>,
  },
  {
    id: "law", title: "Governing law",
    body: <><P>These terms are governed by the laws of India. Disputes are subject to the courts of India, after you have first given us a chance to fix the problem by contacting {" "}<Mail_ subject="Memories complaint" />.</P></>,
  },
  {
    id: "contact", title: "Contact",
    body: <><P>Questions about these terms? Email <Mail_ /> or see our <Link className="font-semibold text-rose-600 hover:underline" to="/memories/contact">contact page</Link>.</P></>,
  },
];

export default function MemoriesTerms() {
  return <LegalLayout title="Terms of Service" path="/memories/terms" description={`The terms for using Memories by ${BRAND}: credits, pages, content rules, links and PINs. Support: ${SUPPORT_EMAIL}.`} intro="Plain-language terms for creating and sharing pages on Memories. Please read them before you create your first page." sections={sections} />;
}
