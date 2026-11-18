import { Link } from "react-router-dom";
import {
  BellSimpleSlash,
  ChartLine,
  CreditCard,
  HandPalm,
  LockKey,
  Trash,
} from "@phosphor-icons/react";

import LegalPage, {
  H3,
  Mail,
  Note,
  P,
  PRODUCTS,
  Products,
  Split,
  Steps,
  SUPPORT_EMAIL,
  Table,
  Template,
  UL,
} from "./legal/LegalKit.jsx";

/* ======================================================
   CONSTANTS (dates are intentionally unchanged)
====================================================== */

const LAST_UPDATED = "October 3, 2026";
const DATE_MODIFIED = "2026-10-03";

const SEO = {
  title: "Privacy Policy | Target Trek",
  description:
    "How Target Trek collects, uses and protects your data across ebooks, Resume Lab, Memories, Prep Arena and mock interviews. We never sell your data, payment details go only to the payment gateway, and you can ask us to delete your data at any time.",
  keywords: [
    "Target Trek privacy policy",
    "Target Trek data deletion",
    "we do not sell your data",
    "payment gateway data sharing",
    "website analytics privacy",
    "unsubscribe marketing emails",
    "Resume Lab privacy",
    "Memories privacy",
    "Prep Arena privacy",
  ].join(", "),
  readMins: 11,
};

/* ======================================================
   EMAIL TEMPLATES
====================================================== */

const DELETE_SUBJECT = "Data deletion request - Target Trek";
const DELETE_BODY = `Hello Target Trek Support,

Please delete my personal data from Target Trek.

Full name:
Email address on my account:
Products I have used (Ebooks / Resume Lab / Memories / Prep Arena / Mock interviews):
Delete everything, or only specific data (please describe):

I understand that records of payments may be kept where the law requires it.

Thank you.`;

const PRIVACY_SUBJECT = "Privacy question - Target Trek";
const PRIVACY_BODY = `Hello Target Trek Support,

I have a question about my data.

Email address on my account:
My question / request (access, correction, unsubscribe, other):

Thank you.`;

/* ======================================================
   CONTENT
====================================================== */

const summary = {
  title: "Your privacy in five lines",
  items: [
    <>
      <b>We never sell your data.</b> Not to advertisers, not to anyone.
    </>,
    <>
      We keep a record of <b>what you bought</b>. Payment details go <b>only to the payment gateway</b>.
    </>,
    <>
      We use <b>analytics tools</b> to understand traffic and improve the website.
    </>,
    <>
      Marketing emails have an <b>unsubscribe link</b>. Order emails still arrive.
    </>,
    <>
      Want your data deleted? Email <b>{SUPPORT_EMAIL}</b>.
    </>,
  ],
};

const glance = [
  {
    Icon: HandPalm,
    tone: "ok",
    title: "We don't sell your data",
    text: "Your personal data is never sold, rented or traded.",
    to: "no-selling",
  },
  {
    Icon: CreditCard,
    title: "Payments stay with the gateway",
    text: "We store your purchase record. Card and UPI details are handled by the payment gateway.",
    to: "payments",
  },
  {
    Icon: ChartLine,
    title: "Analytics for traffic",
    text: "We measure visits and page use to make the website better.",
    to: "analytics",
  },
  {
    Icon: BellSimpleSlash,
    tone: "warn",
    title: "Unsubscribe any time",
    text: "One click at the bottom of any marketing email stops future marketing mail.",
    to: "emails",
  },
  {
    Icon: Trash,
    tone: "bad",
    title: "Delete your data",
    text: `Email ${SUPPORT_EMAIL} and we will delete it.`,
    to: "delete-data",
  },
  {
    Icon: LockKey,
    title: "Kept secure",
    text: "Encrypted connections, hashed passwords and limited access.",
    to: "security",
  },
];

const sections = [
  {
    id: "introduction",
    title: "Who we are and what this covers",
    body: (
      <>
        <P>
          Target Trek (“we”, “us”, “our”) runs <b>targettrek.in</b>, a learning and career platform for software engineers
          and students. This Privacy Policy explains what personal data we collect, why we collect it, who it is shared
          with and the choices you have.
        </P>
        <P>It applies to the website and every Target Trek product, including:</P>
        <Products items={PRODUCTS} />
        <P>
          By using Target Trek you agree to this policy. If you don’t agree, please don’t use the website or buy our
          products. This policy should be read with our <Link className="lg-link" to="/terms-of-service">Terms of Service</Link>{" "}
          and <Link className="lg-link" to="/refund-policy">Refund Policy</Link>.
        </P>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "Information we collect",
    sub: "Only what we need to run the website and deliver what you buy.",
    body: (
      <>
        <Table
          rows={[
            ["Account details", "Name, email address, mobile number (where asked) and a password (stored only in hashed form). We may send a one-time code to verify your email. If you sign in with Google, we receive your name, email and profile photo."],
            ["Purchase records", "What you bought, price, order ID, date, payment status and the payment reference returned by the payment gateway."],
            ["Content you give us", "Resumes and job descriptions for Resume Lab; photos, videos, voice notes and messages for Memories; your profile and chats in Prep Arena; booking details for mock interviews."],
            ["Messages to support", "Emails, bug reports and anything you attach to them."],
            ["Usage and device data", "Pages visited, buttons clicked, time on page, referring site, browser, device type, operating system, approximate location (city / country) and IP address."],
            ["Cookies and local storage", "Small files used to keep you signed in, remember your theme and settings, and measure traffic."],
          ]}
        />
        <Note tone="ok" title="What we never collect">
          We don’t see or store your <b>full card number, CVV, UPI PIN, OTP or net-banking password</b>. You enter these on
          the payment gateway’s secure page, not on ours.
        </Note>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    body: (
      <>
        <UL
          items={[
            "To create and manage your account and let you sign in.",
            "To process orders, confirm payments and deliver ebooks, credits, reviews, pages and access.",
            "To run the product you use, for example scoring and reviewing your resume, building your memory page or matching you with a prep buddy.",
            "To send order confirmations, receipts, access links, booking details and security alerts.",
            "To answer support questions, handle refunds and resolve payment issues.",
            "To understand how the website is used and improve pages, speed and features.",
            "To send product news and offers, if you haven't unsubscribed.",
            "To prevent fraud, abuse, unauthorised sharing of paid content and security problems.",
            "To meet legal, tax and accounting duties.",
          ]}
        />
        <P>
          Some Resume Lab features use automated and AI-assisted analysis to score and review your resume. Your resume is
          processed only to give you that result. <b>We don’t use your private files to advertise to you.</b>
        </P>
      </>
    ),
  },
  {
    id: "payments",
    title: "Payments and what we store",
    sub: "We keep your purchase record. The payment gateway handles the payment.",
    body: (
      <>
        <P>
          Payments on Target Trek are processed by a trusted third-party <b>payment gateway</b>. When you pay, you are taken
          to its secure checkout, and it handles your card, UPI, net-banking or wallet details directly.
        </P>
        <Split
          yesTitle="What we store about a purchase"
          yes={[
            "Your name and email address.",
            "The product or plan you bought and its price.",
            "Order ID, date and time of payment.",
            "Payment status and the gateway's payment reference.",
            "Refund records, if a refund was made.",
          ]}
          noTitle="What we never store"
          no={["Full card number or CVV.", "UPI PIN or OTP.", "Net-banking username or password.", "Bank account login details."]}
        />
        <P>
          <b>The only details we share for a payment are the ones the payment gateway needs to process it</b>, such as your
          name, email, the order amount and order ID. The same details are used if a payment has to be verified or refunded.
          The payment gateway handles this data under its own privacy policy and security standards.
        </P>
      </>
    ),
  },
  {
    id: "no-selling",
    title: "We never sell your data",
    body: (
      <>
        <Note tone="ok" title="Our promise">
          We do <b>not sell, rent, trade or give away</b> your personal data to advertisers, data brokers or anyone else.
        </Note>
        <P>Your data is shared only in these limited cases:</P>
        <Table
          rows={[
            ["Payment gateway", "Only the details needed to process, verify or refund a payment."],
            ["Services that run the website", "Hosting, storage and email delivery providers that process data only to run Target Trek for us, and only as we instruct."],
            ["Analytics tools", "Usage and device data used to measure traffic, as explained below."],
            ["Other members, by your choice", "In Prep Arena, members see only what you choose to show on your profile. A Memories page is seen by the people you share its link with."],
            ["The law", "If we are required to by law, court order or a government authority, or to protect users from fraud or harm."],
          ]}
        />
      </>
    ),
  },
  {
    id: "analytics",
    title: "Analytics and website tracking",
    sub: "We measure traffic so we can make the website better.",
    body: (
      <>
        <P>
          We use a few <b>analytics tools</b> to understand how people find and use Target Trek. They help us see which
          pages are useful, where people get stuck, and whether the website is fast on every device.
        </P>
        <H3>What analytics tools record</H3>
        <UL
          items={[
            "Pages you visit, how long you stay and the links or buttons you click.",
            "The website or search engine that brought you here.",
            "Browser, device type, screen size and operating system.",
            "Approximate location (city or country), worked out from your IP address.",
            "Page speed and technical errors, so we can fix them.",
          ]}
        />
        <P>
          We look at this information mostly as totals and trends, such as “how many people read this page”, not to watch
          what one person does. We don’t use analytics to show you third-party ads.
        </P>
        <Note tone="info" title="You're in control">
          You can block or delete cookies in your browser settings, use private browsing, or use a browser extension that
          blocks analytics. The website will still work, though you may need to sign in again.
        </Note>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and local storage",
    body: (
      <Table
        rows={[
          ["Essential", "Keep you signed in, protect your session and remember items during checkout. These are needed for the website to work."],
          ["Preferences", "Remember choices like light or dark theme and recently viewed pages."],
          ["Analytics", "Help us count visits and understand how pages are used."],
        ]}
      />
    ),
  },
  {
    id: "emails",
    title: "Emails we send you",
    sub: "Order emails always. Marketing emails only until you unsubscribe.",
    body: (
      <>
        <Split
          yesTitle="Order & account emails (always sent)"
          yes={[
            "Order confirmations and receipts.",
            "Ebook access and download links.",
            "Resume review results and plan updates.",
            "Mock interview booking details and reminders.",
            "Refund updates and replies from support.",
            "Password resets and security alerts.",
          ]}
          noTitle="Marketing emails (you can stop these)"
          no={[
            "New product launches.",
            "New ebooks, editions and features.",
            "Offers, discounts and sale announcements.",
            "Tips, guides and newsletters.",
          ]}
        />
        <H3>How to unsubscribe</H3>
        <Steps
          items={[
            ["Open any marketing email from us", "Scroll to the bottom of the email."],
            ["Click the unsubscribe link", "It's in the footer of every marketing email."],
            ["That's it", "You won't receive any future marketing emails from us."],
          ]}
        />
        <Note tone="warn" title="You'll still get order emails">
          Unsubscribing stops marketing only. You will <b>still receive transaction and order-related emails</b>, like
          receipts, access links, booking details and refund updates, because they’re needed to deliver what you bought.
          You can also email <Mail subject="Unsubscribe from marketing - Target Trek" /> to be removed.
        </Note>
      </>
    ),
  },
  {
    id: "security",
    title: "How we protect your data",
    body: (
      <>
        <UL
          items={[
            "All pages are served over encrypted HTTPS connections.",
            "Passwords are stored only as secure hashes, never in plain text.",
            "Payments are handled on the payment gateway's secure checkout.",
            "Access to personal data inside Target Trek is limited to people who need it to help you.",
            "Private files, like resumes, are not public and are not shown to search engines.",
          ]}
        />
        <P>
          No system on the internet is 100% secure, but we work hard to keep your data safe. If we ever learn of a breach
          that affects your data, we will tell you and take steps to fix it as required by law.
        </P>
        <Note tone="bad" title="We will never ask for your OTP or PIN">
          Target Trek will never ask for your password, OTP, UPI PIN or CVV by email, phone or chat.
        </Note>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep data",
    body: (
      <Table
        rows={[
          ["Account details", "While your account is active, or until you ask us to delete it."],
          ["Purchase and payment records", "As long as needed for tax, accounting and legal duties, even after an account is deleted."],
          ["Product content", "Resumes, memory pages and arena profiles are kept for as long as the product needs them, or until you delete them or ask us to."],
          ["Support emails", "As long as needed to resolve the issue and keep a record of it."],
          ["Analytics data", "Kept in summary form to understand trends over time."],
        ]}
      />
    ),
  },
  {
    id: "your-rights",
    title: "Your rights and choices",
    body: (
      <>
        <P>You can ask us at any time to:</P>
        <UL
          items={[
            <><b>See</b> the personal data we hold about you.</>,
            <><b>Correct</b> details that are wrong or out of date.</>,
            <><b>Delete</b> your account and personal data.</>,
            <><b>Withdraw consent</b> to marketing emails (unsubscribe).</>,
            <><b>Ask a question</b> or raise a concern about how your data is used.</>,
          ]}
        />
        <P>
          Email <Mail subject={PRIVACY_SUBJECT} body={PRIVACY_BODY} /> from the email address on your account. To protect
          you, we may ask you to confirm you own the account before we act.
        </P>
      </>
    ),
  },
  {
    id: "delete-data",
    title: "How to delete your data",
    sub: "One email. We handle the rest.",
    body: (
      <>
        <Steps
          items={[
            ["Email us", <>Send a request to <Mail subject={DELETE_SUBJECT} body={DELETE_BODY} />, from the email address on your account.</>],
            ["Tell us what to delete", "Everything, or only one product's data (for example only your Resume Lab files)."],
            ["We confirm it's you", "We may reply to check the request came from the account owner."],
            ["We delete it", "We confirm within about 2 working days and finish deletion within 30 days."],
          ]}
        />
        <Note tone="warn" title="What can't be deleted right away">
          Records of payments and invoices may be kept where tax or accounting law requires it. Deleting your account also
          removes access to products you bought, and this can’t be undone.
        </Note>
        <Template title="Data deletion email template" subject={DELETE_SUBJECT} body={DELETE_BODY} />
      </>
    ),
  },
  {
    id: "children",
    title: "Children's privacy",
    body: (
      <P>
        Target Trek is meant for students and working professionals. If you are under 18, please use Target Trek and make
        purchases only with the consent and supervision of a parent or guardian. We don’t knowingly collect data from young
        children. If you think a child has shared data with us, email {SUPPORT_EMAIL} and we will delete it.
      </P>
    ),
  },
  {
    id: "third-party",
    title: "Links to other websites",
    body: (
      <P>
        Our pages may link to other websites, such as the payment gateway, video meeting tools for mock interviews or
        sign-in with Google. Those websites have their own privacy policies, and we aren’t responsible for how they handle
        your data. Please read their policies before sharing information with them.
      </P>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <P>
        We may update this policy when our products or the law change. The date at the top of this page shows when it was
        last updated. If a change is important, we will make it clear on the website. Using Target Trek after a change means
        you accept the updated policy.
      </P>
    ),
  },
];

const faqs = [
  {
    q: "Do you sell my personal data?",
    a: "No. Target Trek never sells, rents or trades your personal data to advertisers, data brokers or anyone else.",
  },
  {
    q: "Do you store my card or UPI details?",
    a: "No. We store only your purchase record, such as product, price, order ID and payment reference. Card, UPI and bank details are entered on the payment gateway's secure page and handled by the payment gateway.",
  },
  {
    q: "What do you share with the payment gateway?",
    a: "Only the details needed to process the payment, such as your name, email, order amount and order ID. The same details are used if a payment has to be verified or refunded.",
  },
  {
    q: "Do you track my visits?",
    a: "We use analytics tools to measure website traffic: pages visited, device type, referring site and approximate location. We use this to improve the website, not to show third-party ads.",
  },
  {
    q: "How do I stop marketing emails?",
    a: "Click the unsubscribe link at the bottom of any marketing email, and you won't get future marketing emails. You will still receive order and transaction emails like receipts, access links and refund updates.",
  },
  {
    q: "How do I delete my data?",
    a: `Email ${SUPPORT_EMAIL} from the email on your account and tell us what to delete. We confirm within about 2 working days and finish within 30 days. Payment records may be kept where the law requires it.`,
  },
];

const contact = {
  title: "Questions about your data?",
  text: "To delete your data, ask what we hold, correct a detail or raise any privacy concern, email us. The same inbox handles every Target Trek product.",
  actions: [
    { label: "Delete my data", subject: DELETE_SUBJECT, body: DELETE_BODY },
    { label: "Ask a privacy question", subject: PRIVACY_SUBJECT, body: PRIVACY_BODY },
  ],
};

/* ======================================================
   PAGE
====================================================== */

const PrivacyPolicy = () => (
  <LegalPage
    slug="privacy"
    seo={SEO}
    eyebrow="Privacy policy"
    heading={
      <>
        Your data is yours. <span className="lg-mark">We never sell it.</span>
      </>
    }
    lead="What we collect when you use Target Trek, why we need it, who it is shared with, and how to unsubscribe or delete your data with a single email."
    lastUpdated={LAST_UPDATED}
    dateModified={DATE_MODIFIED}
    summary={summary}
    glance={glance}
    sections={sections}
    faqs={faqs}
    contact={contact}
  />
);

export default PrivacyPolicy;
