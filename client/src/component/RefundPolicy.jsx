import { Link } from "react-router-dom";
import {
  CopySimple,
  Prohibit,
  Receipt,
  ShieldWarning,
  Timer,
  VideoCamera,
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

const INTERVIEW_CANCELLATION_FEE = 199;
const INTERVIEW_NOTICE_HOURS = 24;

const SEO = {
  title: "Refund & Cancellation Policy | Target Trek",
  description:
    "Target Trek refund policy for ebooks, Resume Lab, Memories, Prep Arena and mock interviews. Purchases are final; refunds are made only for double payments and genuine payment or delivery issues. Email supporttargettrek@gmail.com.",
  keywords: [
    "Target Trek refund policy",
    "Target Trek no refund policy",
    "double payment refund",
    "duplicate payment refund",
    "ebook refund policy",
    "Resume Lab refund",
    "Memories refund",
    "Prep Arena refund",
    "mock interview cancellation fee",
  ].join(", "),
  readMins: 9,
};

/* ======================================================
   EMAIL TEMPLATES
====================================================== */

const REFUND_SUBJECT = "Refund request (double payment / payment issue) - Target Trek";
const REFUND_BODY = `Hello Target Trek Support,

I would like to request a refund review for a payment issue.

Product (Ebook / Resume Lab / Memories / Prep Arena / Mock interview):
What happened (double payment / charged but not delivered / wrong amount / other):

Full name:
Email used for the purchase:
Order ID (if you have it):
Date(s) of payment:
Amount charged each time:
Payment method (UPI / card / net banking / wallet):
Transaction ID / UTR / payment reference for EACH payment:

I have attached a screenshot or bank statement showing the payment(s).

Thank you.`;

const SUPPORT_SUBJECT = "Purchase help - Target Trek";
const SUPPORT_BODY = `Hello Target Trek Support,

I need help with a purchase.

Product:
Email used for the purchase:
Order ID / transaction reference:
What went wrong:

Thank you.`;

const CANCEL_SUBJECT = "Mock interview cancellation request - Target Trek";
const CANCEL_BODY = `Hello Target Trek Support,

I would like to cancel my booked mock interview.

Candidate name:
Email used to book:
Booking ID:
Scheduled date and time (IST):
Payment / order reference:
Reason (optional):

I understand the request must reach you at least ${INTERVIEW_NOTICE_HOURS} hours before the start time and that a ₹${INTERVIEW_CANCELLATION_FEE} cancellation fee applies.

Thank you.`;

/* ======================================================
   CONTENT
====================================================== */

const summary = {
  title: "The short version",
  items: [
    <>
      <b>All purchases are final.</b> No refunds once you have paid.
    </>,
    <>
      <b>Only exception:</b> a double payment or a genuine payment / delivery issue.
    </>,
    <>
      The same rule covers <b>ebooks, Resume Lab, Memories and Prep Arena</b>.
    </>,
    <>
      Email <b>{SUPPORT_EMAIL}</b> with your payment proof.
    </>,
    <>Approved refunds go back to your original payment method.</>,
  ],
};

const glance = [
  {
    Icon: Prohibit,
    tone: "bad",
    title: "No refunds after purchase",
    text: "Digital products are delivered instantly, so changing your mind isn't covered.",
    to: "no-refunds",
  },
  {
    Icon: CopySimple,
    tone: "ok",
    title: "Double payment? Refunded",
    text: "Charged twice for one order? We refund every extra payment in full.",
    to: "when-we-refund",
  },
  {
    Icon: ShieldWarning,
    tone: "warn",
    title: "Other genuine issues",
    text: "Money deducted but nothing delivered, or a wrong amount charged.",
    to: "when-we-refund",
  },
  {
    Icon: Receipt,
    title: "How to ask",
    text: `Email ${SUPPORT_EMAIL} with your order and payment reference.`,
    to: "how-to-request",
  },
  {
    Icon: Timer,
    title: "Timeline",
    text: "Reply in about 2 working days. Approved refunds start within 7 days.",
    to: "timeline",
  },
  {
    Icon: VideoCamera,
    title: "Mock interviews",
    text: `Cancel ${INTERVIEW_NOTICE_HOURS}+ hours before. A ₹${INTERVIEW_CANCELLATION_FEE} fee applies.`,
    to: "mock-interviews",
  },
];

const sections = [
  {
    id: "scope",
    title: "What this policy covers",
    sub: "One refund policy for every paid product on Target Trek.",
    body: (
      <>
        <P>
          This Refund & Cancellation Policy explains when money paid to Target Trek can be returned. It applies to every
          purchase made on <b>targettrek.in</b> and its product pages, including:
        </P>
        <Products items={PRODUCTS} />
        <P>
          The <b>same rule</b> applies to ebooks, Resume Lab, Memories and Prep Arena: purchases are final, and we refund
          only for a double payment or a genuine payment or delivery issue. Mock interviews are booked for a set time, so
          they also have a cancellation option, explained in its own section below.
        </P>
        <P>
          This policy is part of our <Link className="lg-link" to="/terms-of-service">Terms of Service</Link>. By completing a
          payment you agree to it.
        </P>
      </>
    ),
  },
  {
    id: "no-refunds",
    title: "No refunds after purchase",
    sub: "Please check your choice before you pay.",
    body: (
      <>
        <P>
          Everything we sell is digital. Ebooks unlock, review credits are added, memory credits appear and arena access
          starts as soon as the payment is confirmed. Because the product is available to you right away and cannot be
          “returned”, <b>all purchases are final and non-refundable</b>, except in the cases listed in the next section.
        </P>
        <Split
          yesTitle="What we will refund"
          yes={[
            "A double or duplicate payment for the same order.",
            "Money deducted, but the order failed and the bank did not reverse it.",
            "An amount charged that is higher than the price shown at checkout.",
            "A product we could not deliver or fix because of a problem on our side.",
          ]}
          noTitle="What we will not refund"
          no={[
            "Changing your mind after paying.",
            "Buying the wrong product, plan, look or edition by mistake.",
            "Not reading, downloading or using what you bought.",
            "Used credits, delivered reviews, created pages or used matches.",
            "Not getting the job, interview or result you hoped for.",
            "A price drop, sale or new coupon after you bought.",
          ]}
        />
        <Note tone="info" title="Try before you buy">
          Most products have a free preview, sample chapter, sample review or live preview. Please look at it, and check
          the product name, plan and price on the checkout screen, before you pay.
        </Note>
      </>
    ),
  },
  {
    id: "when-we-refund",
    title: "When we do refund",
    sub: "Double payments and genuine issues. This applies to every product.",
    body: (
      <>
        <H3>1. Double or duplicate payment</H3>
        <P>
          A double payment means the <b>same order was charged to you more than once</b>. This usually happens when:
        </P>
        <UL
          items={[
            "the pay button was pressed twice, or the payment page was refreshed;",
            "the same order was paid from two tabs, two devices or two payment apps;",
            "a payment looked stuck, so you paid again, and both went through;",
            "your bank or UPI app charged you twice for one transaction.",
          ]}
        />
        <P>
          Once we confirm it with the payment gateway, <b>you keep the product and we refund every extra payment in full</b>,
          with no fee.
        </P>

        <H3>2. Other genuine payment or delivery issues</H3>
        <Table
          rows={[
            [
              "Paid, but nothing arrived",
              "Money left your account but the ebook, credit, page or access never appeared. We first add what you paid for. If we can't, we refund you.",
            ],
            [
              "Failed order, money deducted",
              "The checkout showed failure but money was taken and the bank didn't reverse it automatically.",
            ],
            [
              "Wrong amount charged",
              "You were charged more than the final price shown at checkout. We refund the difference.",
            ],
            [
              "Broken on our side",
              "A file is corrupted, a link doesn't work, or a feature you paid for doesn't work because of our error, and we can't fix it within a reasonable time.",
            ],
          ]}
        />
        <Note tone="warn" title="Two purchases are not a double payment">
          Buying two different ebooks, two review credits or room for two different pages is two separate orders. Each is
          something you chose, so neither is a double payment.
        </Note>
      </>
    ),
  },
  {
    id: "by-product",
    title: "How this works for each product",
    sub: "Same rule everywhere, with a few product-specific details.",
    body: (
      <>
        <H3>Ebooks & All Access</H3>
        <UL
          items={[
            "Ebook and bundle purchases are final once access is unlocked or a download link is sent.",
            "If the file won't open, is missing pages or the link has expired, email us and we will send a working copy or restore access.",
            "New editions and updates are added at our discretion and do not create a right to a refund.",
          ]}
        />
        <H3>Resume Lab</H3>
        <UL
          items={[
            "Review plans and credits are final once added to your account.",
            "A credit used to submit a resume, or a review that has been delivered, is not refundable.",
            "If a review didn't arrive, or something clearly went wrong with it, write to us and we will look into it and put it right.",
          ]}
        />
        <H3>Memories</H3>
        <UL
          items={[
            "Credits, upgrades and extra room are final once added to your account.",
            "A credit used to create a page is used up. Deleting a page doesn't return the credit or the money.",
            "Pages stay online for the period shown when you buy. A page reaching the end of that period is not a reason for a refund.",
          ]}
        />
        <H3>Prep Arena</H3>
        <UL
          items={[
            "Arena entry is final once your access starts.",
            "Matches that have been used, and chats that have started, are not refundable.",
            "We don't refund because another member didn't reply, cancelled or wasn't the right fit.",
            "If the pricing section shows a cancellation option at the moment you pay, the terms shown there apply to that purchase.",
          ]}
        />
      </>
    ),
  },
  {
    id: "mock-interviews",
    title: "Mock interview cancellations",
    sub: "Sessions are booked for a set date and time, so they have their own cancellation rule.",
    body: (
      <>
        <Table
          rows={[
            ["Cancel by email", <>Send your request to <Mail subject={CANCEL_SUBJECT} body={CANCEL_BODY} /></>],
            ["Notice needed", `At least ${INTERVIEW_NOTICE_HOURS} hours before the scheduled start time (IST).`],
            ["Cancellation fee", `₹${INTERVIEW_CANCELLATION_FEE} per cancelled session.`],
            ["You receive", `The amount you paid minus ₹${INTERVIEW_CANCELLATION_FEE}, to your original payment method.`],
            ["Less than 24 hours left", "No refund. Missed sessions (no-shows) are also not refunded."],
          ]}
        />
        <P>
          If we have to cancel or can’t run your session because of a problem on our side, you can choose a new slot or get
          a <b>full refund with no fee</b>.
        </P>
        <Template title="Cancellation email template" subject={CANCEL_SUBJECT} body={CANCEL_BODY} />
      </>
    ),
  },
  {
    id: "how-to-request",
    title: "How to request a refund",
    sub: "One email is all it takes.",
    body: (
      <>
        <Steps
          items={[
            [
              "Email us",
              <>
                Write to <Mail subject={REFUND_SUBJECT} body={REFUND_BODY} />, ideally from the email you used to buy.
              </>,
            ],
            ["Tell us what happened", "Which product, what went wrong, and the date and amount of each payment."],
            ["Attach proof", "A screenshot of the payment, the bank SMS or a bank statement line showing the charge(s)."],
            ["We check with the payment gateway", "We match your payments against our orders and confirm what went through."],
            ["You hear back", "We reply with a decision, and if approved, start the refund straight away."],
          ]}
        />
        <Note tone="info" title="Please write within 30 days">
          Report a double payment or payment issue as soon as you notice it, ideally within 30 days of the payment. Older
          payments are harder for the payment gateway to trace.
        </Note>
      </>
    ),
  },
  {
    id: "proof",
    title: "What to include in your email",
    sub: "The more you send, the faster we can sort it out.",
    body: (
      <>
        <UL
          items={[
            "Your full name and the email used for the purchase.",
            "The product (ebook name, Resume Lab plan, Memories item, Prep Arena entry or mock interview).",
            "The order ID, if you have it.",
            "The date, time and amount of each payment.",
            "The transaction ID, UTR or payment reference for each payment.",
            "A screenshot or bank statement line showing the charge(s).",
          ]}
        />
        <Template title="Refund request template" subject={REFUND_SUBJECT} body={REFUND_BODY} />
      </>
    ),
  },
  {
    id: "timeline",
    title: "Review time and refund timeline",
    sub: "Where your money goes, and how long it takes.",
    body: (
      <>
        <Table
          rows={[
            ["Our reply", "Usually within 2 working days of receiving your email with proof."],
            ["Refund started", "Within 7 days of approval."],
            ["Money in your account", "Usually 5 to 7 working days after we start it, depending on your bank or payment app."],
            ["Where it goes", "Back to the original payment method (UPI, card, net banking or wallet)."],
            ["Fees", "None for double payments or issues caused on our side."],
          ]}
        />
        <P>
          We can’t send refunds to a different account, card or UPI ID. If the original method is closed, your bank will
          normally credit the linked account.
        </P>
      </>
    ),
  },
  {
    id: "failed-payments",
    title: "Failed, pending or cancelled payments",
    body: (
      <>
        <P>
          If a payment fails or stays “pending”, the money is usually <b>reversed automatically</b> by your bank or the
          payment gateway, often within 5 to 7 working days. In that case no refund from us is needed.
        </P>
        <UL
          items={[
            "Please wait at least 48 hours before paying again for the same thing, or check your account first. This avoids a double payment.",
            "If the money hasn't come back after 7 working days, email us with the transaction reference and we'll follow it up with the payment gateway.",
            "If the payment later succeeds, you will get the product, or we will refund it if you already bought it again.",
          ]}
        />
      </>
    ),
  },
  {
    id: "discounts",
    title: "Coupons, sales and discounted purchases",
    body: (
      <UL
        items={[
          "If a refund is approved, we refund the amount you actually paid, not the original price.",
          "Coupon codes used on a refunded order are not reissued.",
          "A later sale, price drop or new coupon is not a reason for a refund or partial refund.",
          "Free products, free credits and promotional access have no cash value and can't be refunded.",
        ]}
      />
    ),
  },
  {
    id: "chargebacks",
    title: "Chargebacks and misuse",
    body: (
      <>
        <P>
          If something goes wrong, please email us first. Most issues are fixed in a day or two, which is faster than a
          bank dispute.
        </P>
        <UL
          items={[
            "If a chargeback is raised for an order we have already refunded or delivered, we may share order and delivery records with the payment gateway.",
            "Access to the disputed product may be paused while a chargeback is open.",
            "Refund requests that are false, repeated to abuse the policy, or linked to sharing paid content may be refused, and the account may be closed.",
          ]}
        />
      </>
    ),
  },
  {
    id: "safety",
    title: "Keep your payment details safe",
    body: (
      <Note tone="bad" title="Never send us these">
        We will <b>never</b> ask for your OTP, UPI PIN, CVV, full card number, net-banking password or any screen-sharing
        app. A transaction ID and a screenshot of the payment are enough. If anyone asks for these in our name, don’t share
        them and let us know at {SUPPORT_EMAIL}.
      </Note>
    ),
  },
  {
    id: "consumer-rights",
    title: "Your rights under the law",
    body: (
      <P>
        Nothing in this policy takes away any right you have under applicable Indian consumer protection law that cannot be
        excluded by agreement. If the law gives you a right to a refund in a situation not listed here, we will honour it.
      </P>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <P>
        We may update this policy as our products change. The date at the top of this page shows when it was last updated.
        The version in force when you made a payment applies to that payment.
      </P>
    ),
  },
];

const faqs = [
  {
    q: "Can I get a refund if I change my mind?",
    a: "No. All purchases on Target Trek are final once payment is confirmed, because the product is delivered digitally and right away. Refunds are only made for double payments and genuine payment or delivery issues.",
  },
  {
    q: "I was charged twice for the same order. What do I do?",
    a: `Email ${SUPPORT_EMAIL} with the date, amount and transaction reference of both payments and a screenshot. Once we confirm it with the payment gateway, we refund the extra payment in full and you keep your purchase.`,
  },
  {
    q: "Is the refund policy the same for ebooks, Resume Lab, Memories and Prep Arena?",
    a: "Yes. The same rule applies to all of them: no refunds after purchase, except for double payments and genuine payment or delivery issues. Mock interviews also have a cancellation option with 24 hours' notice and a ₹199 fee.",
  },
  {
    q: "Money was deducted but I didn't get my product.",
    a: `Email ${SUPPORT_EMAIL} with your transaction reference. We will check the payment and add what you paid for. If we can't deliver it, we refund you.`,
  },
  {
    q: "How long does an approved refund take?",
    a: "We start an approved refund within 7 days. It usually reaches your account 5 to 7 working days after that, depending on your bank or payment app.",
  },
  {
    q: "Can the refund be sent to a different account or UPI ID?",
    a: "No. Refunds can only go back to the original payment method used for the payment.",
  },
  {
    q: "How do I cancel a mock interview?",
    a: `Email ${SUPPORT_EMAIL} at least 24 hours before the start time. You get back the amount paid minus the ₹199 cancellation fee. With less than 24 hours left, no refund is given.`,
  },
];

const contact = {
  title: "Need a refund or help with a payment?",
  text: "Email us with your order details and payment proof. We usually reply within 2 working days, and we'll tell you exactly what happens next.",
  actions: [
    { label: "Request a refund", subject: REFUND_SUBJECT, body: REFUND_BODY },
    { label: "Get purchase help", subject: SUPPORT_SUBJECT, body: SUPPORT_BODY },
    { label: "Cancel a mock interview", subject: CANCEL_SUBJECT, body: CANCEL_BODY },
  ],
};

/* ======================================================
   PAGE
====================================================== */

const RefundPolicy = () => (
  <LegalPage
    slug="refund"
    seo={SEO}
    eyebrow="Refund & cancellation"
    heading={
      <>
        Purchases are final. <span className="lg-mark">Double payments</span> are always refunded.
      </>
    }
    lead="A clear, single refund rule for ebooks, Resume Lab, Memories and Prep Arena, plus how mock interview cancellations work and exactly how to reach us if a payment goes wrong."
    lastUpdated={LAST_UPDATED}
    dateModified={DATE_MODIFIED}
    summary={summary}
    glance={glance}
    sections={sections}
    faqs={faqs}
    contact={contact}
  />
);

export default RefundPolicy;
