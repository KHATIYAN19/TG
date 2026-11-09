import { Link } from "react-router-dom";

import LegalLayout, { Mail_, Note, P, UL } from "./LegalLayout";
import { D } from "./useLifetime";
import { BRAND, SUPPORT_EMAIL } from "./constants";

const sections = [
  {
    id: "who", title: "Who we are",
    body: <P>{BRAND} (targettrek.in) runs <b>Memories</b>. This policy explains what information Memories collects, why, who sees it and what choices you have. For anything here, write to <Mail_ subject="Memories privacy question" />.</P>,
  },
  {
    id: "collect", title: "What we collect",
    body: (
      <>
        <P><b>When you have an account</b></P>
        <UL items={[
          "Your name and email address (and your Google profile name and email if you sign in with Google).",
          "Login security details such as session records and sign-in times.",
          "A mobile number, if the payment provider needs one to take your payment.",
        ]} />
        <P><b>When you create a page</b></P>
        <UL items={[
          "The names, messages, gifts, reasons, promises, dates and other words you write.",
          "Photos and videos you upload (with their size, type and, for videos, length), and the PIN you choose or we make for a private page.",
          "Your orders: amount, status, time and the payment provider's reference. Not your card or bank details.",
          <>If you choose to email a page to someone, <b>their email address</b> and whether the email was delivered. It is kept with the page and deleted with it. We also keep a short list of addresses that asked never to be emailed.</>,
        ]} />
        <P><b>When someone opens your page</b></P>
        <UL items={[
          "That it was opened, and when; the kind of device (mobile, tablet or desktop); roughly how long they stayed.",
          "What they did on it: for example balloons popped, gifts opened, promises read, a bouquet built, how far a meter went.",
          <>Any answer they give (yes, no or &ldquo;I need a little time&rdquo;) and any replies they write.</>,
          "A random code made by their browser, so we can tell one visitor from two. It is not their name and is not linked to an account.",
        ]} />
        <Note>Visitors never need an account and we don&apos;t ask for their name or contact details. We don&apos;t store the IP address of visitors on your page. Our servers use IP addresses briefly to stop abuse, such as too many wrong PIN attempts.</Note>
      </>
    ),
  },
  {
    id: "use", title: "How we use it",
    body: (
      <>
        <UL items={[
          "To run Memories: create and show your pages, take payments, give you credits and keep your account secure.",
          <>To show <b>you</b>, the page&apos;s owner, what happened on your page (opens, answers, replies and activity).</>,
          "To send the one-time email with the page link (and its PIN, if private) when you tick \"email this page\", and to resend it if asked, a limited number of times.",
          "To prevent fraud and misuse, to fix problems and to improve the product.",
          "To reply to you when you contact support and to send important service messages (for example about a payment).",
          "To meet legal and accounting duties.",
        ]} />
        <P>We don&apos;t sell your information, and we don&apos;t use your photos or messages for advertising.</P>
      </>
    ),
  },
  {
    id: "visible", title: "Who can see what",
    body: (
      <UL items={[
        <><b>Anyone with your link</b> (and the PIN, if the page is private) can see the page: its text, photos and videos.</>,
        <><b>Only you</b> (and our support team, when needed to help you or keep the service safe) can see your Activity screen, the answers, replies and PIN for your pages.</>,
        <>The person who opens a page knows what they type is delivered to the sender. A &ldquo;yes&rdquo; or &ldquo;no&rdquo; they give is stored and can&apos;t be changed.</>,
        "Our team can access data when needed to give support, run the service, keep it safe or follow the law.",
      ]} />
    ),
  },
  {
    id: "payments", title: "Payments",
    body: <P>Payments are made on the secure pages of our payment providers (such as Cashfree, Razorpay and PayU). They collect your card, UPI or bank details under their own privacy policies. We receive the result (paid or failed), the amount and a reference so we can give you your credit.</P>,
  },
  {
    id: "storage", title: "Where your files and data live",
    body: (
      <>
        <UL items={[
          "Photos and videos are stored in a private Amazon Web Services (AWS) storage bucket. They are not public. A page shows them through short-lived secure links.",
          "Account and page data is kept in a managed database. We use encryption in transit, access controls and separate keys for sensitive items such as PINs.",
          "Your PIN is stored in two forms: scrambled (hashed) to check what visitors type, and encrypted so that you can see it again in My pages.",
        ]} />
        <P>Our providers (AWS, our database host, email and payment services) may process data in other countries. We choose reputable providers and only share what each needs.</P>
      </>
    ),
  },
  {
    id: "cookies", title: "Cookies, local storage and analytics",
    body: (
      <>
        <UL items={[
          "We use cookies and similar storage to keep you signed in and to keep a private page unlocked while you look at it.",
          "On a page you open, your browser stores a random visitor code (so repeat visits aren't double-counted) and, for private pages, a temporary unlock token for that tab.",
          "Our website uses analytics such as Vercel Analytics and, on some pages, Meta Pixel to understand how the site is used. These can run on Memories pages too. They don't read what you write on a page.",
        ]} />
        <P>You can clear or block cookies in your browser, but signing in and unlocking private pages may stop working.</P>
      </>
    ),
  },
  {
    id: "keep", title: "How long we keep it",
    body: (
      <UL items={[
        <><b>Every page is kept for <D /> days from the day it is created.</b> After that its link stops working and we automatically delete the page, its text, photos and videos (from storage), the replies and answers that were sent, and the activity record. You can delete a page yourself earlier at any time.</>,
        "When a page is deleted, its files are removed from storage straight away. If our storage provider can't be reached at that moment, we keep retrying until the files are gone.",
        "Files that were uploaded but never added to a page are deleted within about an hour.",
        "Order records are kept for as long as accounting and tax law require.",
        "If you ask us to delete your account, we delete your pages and personal details, except what we must keep by law.",
      ]} />
    ),
  },
  {
    id: "rights", title: "Your choices and rights",
    body: <P>You can see and edit what you wrote (in the app), delete any page, change a PIN or link, ask for a copy of your data, ask us to correct it, or ask us to delete your account. Email <Mail_ subject="My Memories data request" /> from the address on your account and we&apos;ll help. If you&apos;re in India, you also have the rights given by the Digital Personal Data Protection Act, 2023, including to raise a complaint with us first and then with the Data Protection Board.</P>,
  },
  {
    id: "children", title: "Children",
    body: <P>Memories is for adults. We don&apos;t knowingly collect information from children under 18 for an account. If you believe a child has made an account, tell us and we will remove it. Pages can be made for children, but the account holder must be an adult.</P>,
  },
  {
    id: "changes", title: "Changes to this policy",
    body: <P>We may update this policy. The date at the top shows the latest version, and we&apos;ll tell you about important changes in the app or by email.</P>,
  },
  {
    id: "contact", title: "Contact",
    body: <P>Privacy questions or requests: <Mail_ subject="Memories privacy question" /> or the <Link className="font-semibold text-rose-600 hover:underline" to="/memories/contact">contact page</Link>. Please include the email on your account so we can find it.</P>,
  },
];

export default function MemoriesPrivacy() {
  return <LegalLayout title="Privacy Policy" path="/memories/privacy" description={`How Memories by ${BRAND} collects and protects your information, your pages and what visitors do on them. Support: ${SUPPORT_EMAIL}.`} intro="What we collect, why, who can see it, and how you stay in control: written to be read, not skimmed past." sections={sections} />;
}
