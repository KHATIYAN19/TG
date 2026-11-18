import { Link } from "react-router-dom";
import {
  Copyright,
  CreditCard,
  Prohibit,
  Robot,
  Scales,
  UserCircle,
} from "@phosphor-icons/react";

import LegalPage, {
  Mail,
  Note,
  P,
  PRODUCTS,
  Products,
  Split,
  SUPPORT_EMAIL,
  Table,
  UL,
} from "./legal/LegalKit.jsx";

/* ======================================================
   CONSTANTS (dates are intentionally unchanged)
====================================================== */

const LAST_UPDATED = "October 3, 2026";
const DATE_MODIFIED = "2026-10-03";

const SEO = {
  title: "Terms of Service | Target Trek",
  description:
    "The terms for using Target Trek and buying its ebooks, Resume Lab reviews, Memories, Prep Arena and mock interviews: accounts, payments, the no-refund rule, personal-use licence, acceptable use and governing law.",
  keywords: [
    "Target Trek terms of service",
    "Target Trek terms and conditions",
    "ebook licence personal use",
    "Resume Lab terms",
    "Memories terms",
    "Prep Arena terms",
    "mock interview terms",
    "digital product terms India",
  ].join(", "),
  readMins: 12,
};

const SUPPORT_SUBJECT = "Question about the Terms - Target Trek";
const SUPPORT_BODY = `Hello Target Trek Support,

I have a question about the Terms of Service.

Email address on my account:
Product (if any):
My question:

Thank you.`;

const REPORT_SUBJECT = "Report misuse or shared content - Target Trek";
const REPORT_BODY = `Hello Target Trek Support,

I would like to report misuse on Target Trek.

What I found (link, screenshot or description):
Where I found it:
Your email (optional):

Thank you.`;

/* ======================================================
   CONTENT
====================================================== */

const summary = {
  title: "The key points",
  items: [
    <>
      Use Target Trek for <b>learning and career prep</b>, honestly and legally.
    </>,
    <>
      What you buy is for <b>your personal use</b>. Please don’t share or resell it.
    </>,
    <>
      <b>Purchases are final.</b> Refunds only for double payments or genuine issues.
    </>,
    <>
      We help you prepare. We <b>can’t guarantee</b> a job or interview result.
    </>,
    <>
      Questions? <b>{SUPPORT_EMAIL}</b>
    </>,
  ],
};

const glance = [
  { Icon: UserCircle, title: "Your account", text: "Keep your details accurate and your password private.", to: "accounts" },
  { Icon: CreditCard, title: "Payments", text: "Prices in INR, paid through a secure payment gateway.", to: "payments" },
  { Icon: Prohibit, tone: "bad", title: "No refunds after purchase", text: "Except double payments and genuine payment or delivery issues.", to: "refunds" },
  { Icon: Copyright, title: "Personal-use licence", text: "Read, learn and use. Don't copy, share or resell paid content.", to: "licence" },
  { Icon: Robot, tone: "warn", title: "AI-assisted features", text: "Helpful, but not always perfect. Use your own judgement.", to: "ai" },
  { Icon: Scales, title: "Indian law", text: "These Terms are governed by the laws of India.", to: "governing-law" },
];

const sections = [
  {
    id: "acceptance",
    title: "Accepting these Terms",
    body: (
      <>
        <P>
          These Terms of Service (“Terms”) are an agreement between you and <b>Target Trek</b> (“we”, “us”, “our”). They
          apply when you visit <b>targettrek.in</b>, create an account, or buy or use any Target Trek product.
        </P>
        <P>
          By using the website or completing a purchase, you agree to these Terms, our{" "}
          <Link className="lg-link" to="/privacy-policy">Privacy Policy</Link> and our{" "}
          <Link className="lg-link" to="/refund-policy">Refund Policy</Link>. If you don’t agree, please don’t use Target
          Trek.
        </P>
      </>
    ),
  },
  {
    id: "about",
    title: "About Target Trek and our products",
    body: (
      <>
        <P>
          Target Trek is a learning and career platform for software engineers and students. Alongside free articles and
          resources, we offer these paid products:
        </P>
        <Products items={PRODUCTS} />
        <P>
          Each product page shows what is included, the price and any product-specific rules before you pay. Those details
          form part of these Terms for that purchase.
        </P>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Your account",
    body: (
      <UL
        items={[
          "Give accurate details when you sign up or buy, especially your email address, because that's where your access and receipts are sent.",
          "Keep your password and sign-in codes private. You are responsible for activity on your account.",
          "One account is for one person. Don't share your login or let others use your paid access.",
          "Tell us straight away at " + SUPPORT_EMAIL + " if you think someone else has used your account.",
          "If you are under 18, use Target Trek with the consent and supervision of a parent or guardian.",
        ]}
      />
    ),
  },
  {
    id: "payments",
    title: "Prices and payments",
    body: (
      <>
        <UL
          items={[
            "Prices are shown in Indian Rupees (INR) and include any applicable taxes unless stated otherwise.",
            "Payments are processed by a third-party payment gateway. We don't see or store your full card, UPI or bank details.",
            "An order is complete only when the payment gateway confirms the payment.",
            "Prices, offers and coupons may change at any time. A change doesn't affect orders that are already paid.",
            "Coupons can't be exchanged for cash and may have their own conditions and expiry dates.",
            "If a price is shown wrongly because of an obvious error, we may cancel the order and refund what you paid.",
          ]}
        />
        <Note tone="info" title="Wait before paying again">
          If a payment looks stuck, check your bank or UPI app and wait a little before trying again. This helps avoid a
          double payment.
        </Note>
      </>
    ),
  },
  {
    id: "delivery",
    title: "Delivery of digital products",
    body: (
      <>
        <P>Everything we sell is digital and is usually delivered within minutes of a confirmed payment:</P>
        <Table
          rows={[
            ["Ebooks & All Access", "Unlocked in your account, or sent as an access or download link to your email."],
            ["Resume Lab", "Plans and review credits are added to your account. Reviews are delivered in your Resume Lab space."],
            ["Memories", "Credits, upgrades and extra room are added to your account for you to use on your pages."],
            ["Prep Arena", "Your arena access starts and your profile can go live."],
            ["Mock interviews", "Your booking is confirmed by email with the date, time and joining details."],
          ]}
        />
        <P>
          If something hasn’t arrived within a few hours, check your spam folder, then email{" "}
          <Mail subject="Product not received - Target Trek" /> with your order details and we’ll fix it.
        </P>
      </>
    ),
  },
  {
    id: "refunds",
    title: "Refunds and cancellations",
    sub: "Full details are in our Refund Policy.",
    body: (
      <>
        <Note tone="bad" title="No refunds after purchase">
          All purchases of ebooks, Resume Lab, Memories and Prep Arena are <b>final and non-refundable</b> once payment is
          confirmed.
        </Note>
        <P>We make a refund only when:</P>
        <UL
          items={[
            "you were charged twice (a double or duplicate payment) for the same order;",
            "money was deducted but the order failed and the bank didn't reverse it;",
            "you were charged more than the price shown at checkout; or",
            "we couldn't deliver or fix what you bought because of a problem on our side.",
          ]}
        />
        <P>
          To ask for a refund, email <Mail subject="Refund request - Target Trek" /> with your order and payment details.
          Mock interviews can be cancelled by email at least 24 hours before the start time, with a ₹199 cancellation fee.
          Read the full <Link className="lg-link" to="/refund-policy">Refund Policy</Link>.
        </P>
      </>
    ),
  },
  {
    id: "mock-interviews",
    title: "Mock interview bookings",
    body: (
      <UL
        items={[
          "Check the date, time (IST), duration, topics and price before you pay.",
          "Join on time with a working device, a stable internet connection and a quiet place.",
          "Keep the meeting link private. Don't share it or let anyone else join in your place.",
          "Be respectful to the interviewer. We may end a session early if someone behaves abusively.",
          "Missed sessions (no-shows) are not refunded or rescheduled unless we agree otherwise.",
        ]}
      />
    ),
  },
  {
    id: "licence",
    title: "Your personal-use licence",
    body: (
      <>
        <P>
          When you buy a product, we give you a <b>personal, non-transferable, non-exclusive licence</b> to use it for your
          own learning and career preparation. You don’t buy ownership of the content itself.
        </P>
        <Split
          yesTitle="You can"
          yes={[
            "Read and study the content on your own devices.",
            "Make notes and practise with the code examples.",
            "Use what you learn in interviews and at work.",
            "Print pages for your own study.",
          ]}
          noTitle="You can't"
          no={[
            "Share, upload or forward the files or access links.",
            "Resell, rent or give away paid content.",
            "Post paid content in groups, channels, drives or forums.",
            "Copy it into courses, books or products of your own.",
            "Remove watermarks or copyright notices.",
          ]}
        />
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <P>When using Target Trek, please don’t:</P>
        <UL
          cross
          items={[
            "break any law or anyone else's rights;",
            "upload content that is illegal, hateful, sexually explicit, violent, defamatory or harassing;",
            "upload photos, videos or personal details of other people without their permission;",
            "pretend to be someone else, or use a false name or company in Prep Arena;",
            "spam, harass or pressure other members, or ask them for money;",
            "try to hack, overload, scrape or reverse-engineer the website;",
            "use bots or scripts to create accounts, claim offers or access paid content;",
            "misuse coupons, referral offers or the refund process.",
          ]}
        />
        <P>
          If you see misuse or paid content being shared, please report it to{" "}
          <Mail subject={REPORT_SUBJECT} body={REPORT_BODY} />.
        </P>
      </>
    ),
  },
  {
    id: "your-content",
    title: "Content you upload",
    body: (
      <>
        <P>
          You keep ownership of what you upload, such as your resume, photos, videos, messages and profile details. You
          give us permission to store, process and display that content only as needed to provide the product to you, for
          example to review your resume, build your memory page or show your arena profile to members.
        </P>
        <UL
          items={[
            "Only upload content you own or have permission to use.",
            "You are responsible for the content you upload and share.",
            "We may remove content, or block a page or profile, if it breaks these Terms or the law.",
          ]}
        />
      </>
    ),
  },
  {
    id: "ai",
    title: "AI-assisted features",
    body: (
      <P>
        Some features, such as resume scoring, job-match checks and suggested improvements, use automated and AI-assisted
        analysis. These results are meant to help you, but they can be incomplete or wrong. Please review any suggestion
        before you use it. You are responsible for what you finally put on your resume or say in an interview.
      </P>
    ),
  },
  {
    id: "ip",
    title: "Intellectual property",
    body: (
      <P>
        All Target Trek content, including ebooks, articles, diagrams, code samples, designs, templates, logos and the
        website itself, belongs to Target Trek or its licensors and is protected by copyright and other laws. Apart from the
        personal-use licence above, no rights are given to you. The “Target Trek” name and logo may not be used without our
        written permission.
      </P>
    ),
  },
  {
    id: "no-guarantee",
    title: "Learning purpose and no guarantee of results",
    body: (
      <>
        <P>
          Our products are for <b>learning and preparation</b>. They help you prepare, but we can’t control hiring
          decisions.
        </P>
        <Note tone="warn" title="No job guarantee">
          Buying an ebook, a resume review, Prep Arena access or a mock interview does <b>not guarantee</b> a job offer,
          interview call, shortlisting, promotion, salary or any other result.
        </Note>
        <P>
          Technical content and code examples are provided for learning. Technology changes quickly, so always check
          official documentation before using code or advice in production.
        </P>
      </>
    ),
  },
  {
    id: "communications",
    title: "Emails and communication",
    body: (
      <>
        <P>By creating an account or making a purchase, you agree that we may email you:</P>
        <UL
          items={[
            <><b>Order and account emails</b>, such as receipts, access links, booking details, refund updates and security alerts. These are always sent.</>,
            <><b>Marketing emails</b> about new product launches, new ebooks, features and offers.</>,
          ]}
        />
        <P>
          You can stop marketing emails at any time with the unsubscribe link at the bottom of each one. You’ll still get
          order and transaction emails. See the <Link className="lg-link" to="/privacy-policy#emails">Privacy Policy</Link>.
        </P>
      </>
    ),
  },
  {
    id: "availability",
    title: "Website availability and changes",
    body: (
      <UL
        items={[
          "We try to keep Target Trek available at all times, but it may sometimes be slow or offline for maintenance or reasons outside our control.",
          "We may update, improve, rename or stop features and products. Where a paid product is stopped, we will try to give you reasonable notice or access to its content.",
          "New editions of ebooks may be added at our discretion.",
        ]}
      />
    ),
  },
  {
    id: "suspension",
    title: "Suspending or closing accounts",
    body: (
      <P>
        We may suspend or close an account, remove content or block access to paid products if these Terms are broken, for
        example by sharing paid content, abusing other members, fraud or misuse of payments. Where it’s reasonable, we will
        tell you why. Access taken away for breaking these Terms is not refunded. You can close your account at any time by
        emailing {SUPPORT_EMAIL}.
      </P>
    ),
  },
  {
    id: "third-party",
    title: "Third-party services",
    body: (
      <P>
        Target Trek uses trusted third parties for some services, such as the payment gateway, sign-in with Google, video
        meeting tools for mock interviews and analytics. Your use of those services may also be covered by their own terms.
        We aren’t responsible for their availability or actions.
      </P>
    ),
  },
  {
    id: "disclaimer",
    title: "Disclaimer",
    body: (
      <P>
        Target Trek and its products are provided “as is” and “as available”. As far as the law allows, we don’t promise
        that the website will always be error-free or uninterrupted, or that content will always be complete or up to
        date.
      </P>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <P>
        As far as the law allows, Target Trek is not liable for indirect or consequential loss, such as lost job
        opportunities, lost income or lost data. Our total liability for any claim about a product is limited to the amount
        you paid for that product. Nothing in these Terms limits liability that cannot be limited under Indian law.
      </P>
    ),
  },
  {
    id: "indemnity",
    title: "Your responsibility",
    body: (
      <P>
        If you break these Terms or the law, or upload content that infringes someone else’s rights, you agree to be
        responsible for the resulting claims and losses, and not Target Trek.
      </P>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law and disputes",
    body: (
      <>
        <P>
          These Terms are governed by the laws of <b>India</b>, subject to any consumer protection rights that apply to you.
        </P>
        <P>
          If you have a problem, please email us first. Most issues are resolved quickly and directly. If a dispute can’t be
          resolved this way, it will be handled by the competent courts in India.
        </P>
      </>
    ),
  },
  {
    id: "general",
    title: "General",
    body: (
      <UL
        items={[
          "If any part of these Terms is found invalid, the rest stays in force.",
          "If we don't enforce a right straight away, we haven't given it up.",
          "These Terms, together with the Privacy Policy, Refund Policy and product page details, are the full agreement between you and Target Trek.",
          "You may not transfer your account or these Terms to someone else.",
        ]}
      />
    ),
  },
  {
    id: "changes",
    title: "Changes to these Terms",
    body: (
      <P>
        We may update these Terms from time to time. The date at the top of this page shows when they were last updated.
        Using Target Trek after a change means you accept the updated Terms. Purchases already made are covered by the Terms
        in force at the time of purchase.
      </P>
    ),
  },
];

const faqs = [
  {
    q: "Can I share an ebook I bought with a friend?",
    a: "No. Each purchase gives a personal licence for one person. Sharing files, access links or login details isn't allowed and may lead to your access being removed.",
  },
  {
    q: "Are purchases refundable?",
    a: "No, purchases are final. We refund only double payments and genuine payment or delivery issues. Mock interviews can be cancelled at least 24 hours in advance with a ₹199 fee. See the Refund Policy for details.",
  },
  {
    q: "Will buying a product get me a job?",
    a: "Our products help you prepare, but we can't guarantee any job offer, interview call, salary or result.",
  },
  {
    q: "Who owns the resume and photos I upload?",
    a: "You do. We only use them to provide the product you're using, such as reviewing your resume or building your memory page.",
  },
  {
    q: "Which law applies to these Terms?",
    a: "The laws of India, subject to any consumer protection rights that apply to you.",
  },
];

const contact = {
  title: "Questions about these Terms?",
  text: "If something here isn't clear, or you want to report misuse or shared paid content, email us. We read every message.",
  actions: [
    { label: "Ask about the Terms", subject: SUPPORT_SUBJECT, body: SUPPORT_BODY },
    { label: "Report misuse", subject: REPORT_SUBJECT, body: REPORT_BODY },
  ],
};

/* ======================================================
   PAGE
====================================================== */

const TermsOfService = () => (
  <LegalPage
    slug="terms"
    seo={SEO}
    eyebrow="Terms of service"
    heading={
      <>
        The rules, in <span className="lg-mark">plain words.</span>
      </>
    }
    lead="What you can expect from Target Trek, and what we expect from you, when you use the website or buy ebooks, Resume Lab, Memories, Prep Arena or a mock interview."
    lastUpdated={LAST_UPDATED}
    dateModified={DATE_MODIFIED}
    summary={summary}
    glance={glance}
    sections={sections}
    faqs={faqs}
    contact={contact}
  />
);

export default TermsOfService;
