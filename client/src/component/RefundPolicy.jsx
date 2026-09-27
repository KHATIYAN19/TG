import React from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";
const CANONICAL_URL = `${SITE_URL}/refund-policy`;

const SEO_TITLE =
  "Refund & Cancellation Policy for Ebooks | Target Trek";

const SEO_DESCRIPTION =
  "Read Target Trek's refund and cancellation policy for ebooks and digital products, including duplicate payments, failed delivery, incorrect files, refund requests, cancellations and customer support.";

const LAST_UPDATED = "September 24, 2026";
const DATE_MODIFIED = "2026-09-24";
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

const quickLinks = [
  {
    id: "general-no-refund",
    label: "General no-refund policy",
  },
  {
    id: "eligible-refunds",
    label: "Eligible refund issues",
  },
  {
    id: "duplicate-payments",
    label: "Duplicate payments",
  },
  {
    id: "ebook-not-received",
    label: "Ebook not received",
  },
  {
    id: "refund-request",
    label: "Request a refund review",
  },
  {
    id: "cancellation",
    label: "Cancellation policy",
  },
  {
    id: "support",
    label: "Contact support",
  },
];

const Section = ({
  id,
  number,
  title,
  children,
}) => {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-28 border-b border-slate-100 pb-10 last:border-b-0"
    >
      <div className="flex items-start gap-4">
        <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-black text-blue-700 sm:flex">
          {number}
        </div>

        <div className="min-w-0 flex-1">
          <h2
            id={headingId}
            className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl"
          >
            <span className="mr-2 text-blue-600 sm:hidden">
              {number}.
            </span>

            {title}
          </h2>

          <div className="mt-5 space-y-4 text-[15px] leading-7 text-slate-600 sm:text-base sm:leading-8">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

const BulletList = ({ children }) => (
  <ul className="space-y-3">
    {React.Children.map(children, (child) => (
      <li className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500"
        />

        <div className="min-w-0 flex-1">
          {child.props.children}
        </div>
      </li>
    ))}
  </ul>
);

const RefundPolicy = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        email: SUPPORT_EMAIL,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        inLanguage: "en",
      },
      {
        "@type": "WebPage",
        "@id": `${CANONICAL_URL}#webpage`,
        url: CANONICAL_URL,
        name: SEO_TITLE,
        description: SEO_DESCRIPTION,
        dateModified: DATE_MODIFIED,
        inLanguage: "en",
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        breadcrumb: {
          "@id": `${CANONICAL_URL}#breadcrumb`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${CANONICAL_URL}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Refund & Cancellation Policy",
            item: CANONICAL_URL,
          },
        ],
      },
    ],
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50"
    >
      <Helmet>
        <title>{SEO_TITLE}</title>

        <meta
          name="description"
          content={SEO_DESCRIPTION}
        />

        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        <meta
          name="googlebot"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        <meta
          name="author"
          content={SITE_NAME}
        />

        <meta
          name="application-name"
          content={SITE_NAME}
        />

        <meta
          name="theme-color"
          content="#ffffff"
        />

        <link
          rel="canonical"
          href={CANONICAL_URL}
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:site_name"
          content={SITE_NAME}
        />

        <meta
          property="og:locale"
          content="en_IN"
        />

        <meta
          property="og:title"
          content={SEO_TITLE}
        />

        <meta
          property="og:description"
          content={SEO_DESCRIPTION}
        />

        <meta
          property="og:url"
          content={CANONICAL_URL}
        />

        <meta
          property="article:modified_time"
          content={DATE_MODIFIED}
        />

        <meta
          name="twitter:card"
          content="summary"
        />

        <meta
          name="twitter:title"
          content={SEO_TITLE}
        />

        <meta
          name="twitter:description"
          content={SEO_DESCRIPTION}
        />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <main className="pb-20 pt-24 sm:pt-28">
        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          <div className="pointer-events-none absolute -right-48 -top-48 h-[500px] w-[500px] rounded-full bg-blue-100/60 blur-3xl" />

          <div className="pointer-events-none absolute -left-32 bottom-0 h-[320px] w-[320px] rounded-full bg-slate-100 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <nav
              aria-label="Breadcrumb"
              className="mb-8 flex items-center gap-2 text-xs font-semibold text-slate-400"
            >
              <a
                href="/"
                className="transition hover:text-blue-600"
              >
                Home
              </a>

              <span aria-hidden="true">/</span>

              <span className="text-slate-600">
                Refund & Cancellation Policy
              </span>
            </nav>

            <div className="max-w-4xl">
              <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-blue-700">
                Target Trek Policy
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Refund & Cancellation Policy
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                This policy explains when a refund, replacement,
                restored access, or another resolution may be
                available when purchasing ebooks and other digital
                products from{" "}
                <strong className="font-bold text-slate-900">
                  Target Trek
                </strong>
                .
              </p>

              <div className="mt-7 flex flex-wrap gap-3 text-sm">
                <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-600 shadow-sm">
                  Last updated: {LAST_UPDATED}
                </span>

                <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-600 shadow-sm">
                  Digital products
                </span>

                <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-600 shadow-sm">
                  Ebook purchases
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">
                General Rule
              </p>

              <p className="mt-2 text-sm font-bold leading-6 text-slate-800">
                Delivered digital products are generally
                non-refundable.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-600">
                Eligible Issues
              </p>

              <p className="mt-2 text-sm font-bold leading-6 text-slate-800">
                Duplicate charges, failed delivery, incorrect products,
                or unusable files may be reviewed.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-600">
                Support
              </p>

              <p className="mt-2 text-sm font-bold leading-6 text-slate-800">
                Purchase-related issues can be raised directly with
                Target Trek support.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:px-8 lg:py-14">
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Quick navigation
              </p>

              <nav
                aria-label="Refund policy navigation"
                className="mt-4 space-y-1"
              >
                {quickLinks.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-xs leading-5 text-slate-500">
                  Need help with a purchase?
                </p>

                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="mt-2 block break-all text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          </aside>

          <article className="min-w-0">
            <section className="rounded-3xl border border-red-200 bg-red-50 p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-200 bg-white text-lg font-black text-red-600">
                  !
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    Digital Products Are Generally Non-Refundable
                  </h2>

                  <p className="mt-3 leading-7 text-slate-700">
                    Target Trek primarily sells{" "}
                    <strong>
                      digital ebooks and educational resources
                    </strong>
                    . These products may become available immediately
                    after successful payment.
                  </p>

                  <p className="mt-3 leading-7 text-slate-700">
                    Because a digital product can be accessed, viewed,
                    saved, or downloaded after delivery, purchases are
                    generally{" "}
                    <strong>
                      non-refundable and non-returnable once delivered
                    </strong>
                    , except where an eligible issue described in this
                    policy occurs or where a refund or other remedy is
                    required by applicable law.
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-10 space-y-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
              <Section
                id="scope"
                number="1"
                title="Scope of This Policy"
              >
                <p>
                  This policy applies to digital products purchased
                  directly through the Target Trek website, including:
                </p>

                <BulletList>
                  <li>Digital ebooks.</li>

                  <li>PDF books and guides.</li>

                  <li>Interview preparation material.</li>

                  <li>Technical learning resources.</li>

                  <li>Digital study material.</li>

                  <li>
                    Other downloadable or digitally accessible
                    products.
                  </li>
                </BulletList>

                <p>
                  If a particular product has additional refund or
                  purchase conditions, those conditions may also be
                  displayed on its product or checkout page.
                </p>
              </Section>

              <Section
                id="delivery"
                number="2"
                title="Digital Product Delivery"
              >
                <p>
                  Target Trek products are primarily delivered
                  electronically. Depending on the product, delivery
                  may occur through:
                </p>

                <BulletList>
                  <li>
                    A PDF or another downloadable digital file.
                  </li>

                  <li>
                    A secure browser-based ebook or document viewer.
                  </li>

                  <li>
                    A purchase-specific access page.
                  </li>

                  <li>
                    A temporary or secure download link.
                  </li>

                  <li>
                    An email containing access or purchase
                    information.
                  </li>

                  <li>
                    Another electronic delivery method specified
                    during purchase.
                  </li>
                </BulletList>

                <p>
                  A digital product will generally be considered
                  delivered when the purchased file, download option,
                  viewer, access page, or equivalent method of
                  accessing the product has been made available to the
                  purchaser.
                </p>
              </Section>

              <Section
                id="general-no-refund"
                number="3"
                title="General No-Refund Policy"
              >
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="font-bold leading-7 text-slate-900">
                    Once an ebook or digital product has been
                    successfully delivered or made accessible, the
                    purchase is generally final and is not eligible
                    for a refund merely because the customer changes
                    their mind.
                  </p>
                </div>

                <p>
                  Digital products differ from physical products
                  because they cannot ordinarily be returned after
                  they have been accessed, copied, saved, or
                  downloaded.
                </p>

                <p>
                  Customers should therefore carefully review the{" "}
                  <strong className="text-slate-900">
                    product title, description, topics covered,
                    edition, language, format, price, and other
                    available information
                  </strong>{" "}
                  before completing a purchase.
                </p>
              </Section>

              <Section
                id="eligible-refunds"
                number="4"
                title="When a Refund or Resolution May Be Available"
              >
                <p>
                  Although digital purchases are generally
                  non-refundable, we will review genuine purchase or
                  delivery problems.
                </p>

                <p>
                  A refund, replacement, restored access, or another
                  appropriate resolution may be considered in
                  situations including:
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    [
                      "Duplicate Payment",
                      "You were charged more than once for the same intended purchase.",
                    ],
                    [
                      "Product Not Delivered",
                      "Payment was successfully completed but access to the purchased digital product was not provided.",
                    ],
                    [
                      "Incorrect Product",
                      "The digital product delivered is materially different from the product purchased.",
                    ],
                    [
                      "Corrupted File",
                      "The delivered file cannot reasonably be opened and a working replacement cannot be provided.",
                    ],
                    [
                      "Technical Delivery Failure",
                      "A delivery-system problem prevents access and we are unable to restore it.",
                    ],
                    [
                      "Legal Requirement",
                      "A refund, replacement, or other remedy is required under applicable law.",
                    ],
                  ].map(([title, description]) => (
                    <div
                      key={title}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <h3 className="font-black text-slate-900">
                        {title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {description}
                      </p>
                    </div>
                  ))}
                </div>

                <p>
                  Depending on the circumstances, Target Trek may first
                  attempt to resolve the issue by providing the correct
                  product, replacing a corrupted file, or restoring
                  access.
                </p>
              </Section>

              <Section
                id="not-eligible"
                number="5"
                title="Situations That Are Generally Not Eligible for a Refund"
              >
                <p>
                  Subject to applicable law, refunds generally will
                  not be provided solely because:
                </p>

                <BulletList>
                  <li>
                    You changed your mind after purchasing the ebook.
                  </li>

                  <li>
                    You purchased the product accidentally but
                    subsequently accessed, viewed, or downloaded it.
                  </li>

                  <li>
                    You no longer need the ebook.
                  </li>

                  <li>
                    You expected topics or features that were not
                    stated in the product description.
                  </li>

                  <li>
                    You did not read the product description before
                    purchasing.
                  </li>

                  <li>
                    You already knew some or all of the material
                    covered in the ebook.
                  </li>

                  <li>
                    You found similar information elsewhere after
                    purchasing the product.
                  </li>

                  <li>
                    You did not achieve a particular interview,
                    examination, employment, salary, or learning
                    outcome.
                  </li>

                  <li>
                    You do not like the writing style, formatting,
                    design, or presentation after accessing the
                    product.
                  </li>

                  <li>
                    Your device does not support the file because of
                    device-specific software or configuration issues
                    outside our reasonable control.
                  </li>

                  <li>
                    You shared, redistributed, copied, or otherwise
                    misused the purchased product in violation of our
                    Terms & Conditions.
                  </li>
                </BulletList>
              </Section>

              <Section
                id="duplicate-payments"
                number="6"
                title="Duplicate Payments"
              >
                <p>
                  If you believe you were charged more than once for
                  the same intended order, contact Target Trek ebook
                  support.
                </p>

                <p>
                  Please provide enough information for us to identify
                  the transactions, such as:
                </p>

                <BulletList>
                  <li>
                    The email address used during checkout.
                  </li>

                  <li>The product purchased.</li>

                  <li>
                    Order reference, if available.
                  </li>

                  <li>
                    Transaction reference, if available.
                  </li>

                  <li>
                    Date and approximate time of payment.
                  </li>

                  <li>Amount charged.</li>
                </BulletList>

                <p>
                  We will review the transaction records. If an
                  unintended duplicate charge is confirmed, an
                  appropriate refund or resolution may be processed.
                </p>
              </Section>

              <Section
                id="ebook-not-received"
                number="7"
                title="Payment Successful but Ebook Not Received"
              >
                <p>
                  If your payment is successfully completed but you do
                  not receive access to the ebook, please first:
                </p>

                <BulletList>
                  <li>
                    Check whether the success or download page is
                    still open.
                  </li>

                  <li>
                    Check the email address used during the purchase.
                  </li>

                  <li>
                    Check your spam, promotions, or junk email folders
                    if delivery information was sent by email.
                  </li>

                  <li>
                    Verify that the transaction actually shows as
                    successfully completed rather than pending or
                    failed.
                  </li>
                </BulletList>

                <p>
                  If you still cannot access the purchased ebook,
                  contact our support team. We may verify the
                  transaction and restore access or provide the
                  appropriate product where possible.
                </p>

                <p>
                  If a successful purchase cannot reasonably be
                  fulfilled, we may provide another appropriate
                  remedy, including a refund where applicable.
                </p>
              </Section>

              <Section
                id="failed-payments"
                number="8"
                title="Failed, Pending, or Cancelled Payments"
              >
                <p>
                  A failed, cancelled, or pending transaction does not
                  necessarily mean that Target Trek has received the
                  payment.
                </p>

                <p>
                  In some cases, your bank or payment provider may
                  temporarily show an authorization or debit even
                  though the transaction did not successfully
                  complete.
                </p>

                <p>
                  Such transactions may be automatically reversed by
                  the bank or payment provider according to their
                  processing timelines.
                </p>

                <p>
                  If a transaction remains unresolved, contact your
                  bank or payment provider as appropriate. You may
                  also contact Target Trek support so that we can
                  check whether our records show a successful payment.
                </p>
              </Section>

              <Section
                id="incorrect-product"
                number="9"
                title="Incorrect or Corrupted Ebook"
              >
                <p>
                  If the file delivered is corrupted, materially
                  incomplete, or is not the product you purchased,
                  please contact support.
                </p>

                <p>
                  Where possible, our first step will generally be to:
                </p>

                <BulletList>
                  <li>
                    Provide a working replacement file.
                  </li>

                  <li>
                    Provide the correct purchased product.
                  </li>

                  <li>
                    Restore access to the correct ebook.
                  </li>

                  <li>
                    Resolve the underlying technical problem.
                  </li>
                </BulletList>

                <p>
                  If we cannot provide the purchased digital product
                  after confirming the issue, an appropriate refund or
                  other remedy may be considered.
                </p>
              </Section>

              <Section
                id="refund-request"
                number="10"
                title="Refund Request Process"
              >
                <p>
                  To request review of an eligible purchase issue,
                  contact:
                </p>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                  <p className="text-lg font-black text-slate-950">
                    Target Trek Ebook Support
                  </p>

                  <p className="mt-3">
                    <strong className="text-slate-900">
                      Email:
                    </strong>{" "}
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="break-all font-bold text-blue-700 underline decoration-blue-300 underline-offset-4 hover:text-blue-900"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </p>
                </div>

                <p>Please include, where available:</p>

                <BulletList>
                  <li>Your name.</li>

                  <li>
                    The email address used during checkout.
                  </li>

                  <li>
                    The name of the ebook purchased.
                  </li>

                  <li>Your order reference.</li>

                  <li>
                    Your transaction/payment reference.
                  </li>

                  <li>The amount paid.</li>

                  <li>The date of purchase.</li>

                  <li>
                    A clear description of the issue.
                  </li>
                </BulletList>

                <p>
                  Providing complete information helps us locate and
                  review your transaction more efficiently.
                </p>
              </Section>

              <Section
                id="payment-security"
                number="11"
                title="Do Not Share Sensitive Payment Information"
              >
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                  <p className="font-bold leading-7 text-slate-900">
                    Never send your UPI PIN, OTP, CVV, banking
                    password, complete debit/credit card number, or
                    internet banking password to Target Trek by email.
                  </p>
                </div>

                <p>
                  We may request an order number, transaction
                  reference, amount, date, or other limited
                  information needed to identify your purchase, but we
                  do not need your banking password, PIN, OTP, or CVV
                  to review an ebook purchase issue.
                </p>
              </Section>

              <Section
                id="refund-processing"
                number="12"
                title="Refund Processing"
              >
                <p>
                  If a refund is approved, it will generally be
                  initiated using the appropriate payment or
                  transaction channel available to us.
                </p>

                <p>
                  After a refund has been initiated, the time required
                  for the amount to appear in your account may depend
                  on your bank, payment provider, card network, or
                  other financial institution.
                </p>

                <p>
                  Target Trek does not control the processing time of
                  a bank or independent payment provider after a refund
                  has been successfully initiated from our side.
                </p>
              </Section>

              <Section
                id="cancellation"
                number="13"
                title="Cancellation Policy"
              >
                <p>
                  Digital products are often processed and delivered
                  automatically after successful payment.
                </p>

                <p>
                  As a result, an order generally{" "}
                  <strong className="text-slate-900">
                    cannot be cancelled after the digital product has
                    been delivered or access has been provided
                  </strong>
                  .
                </p>

                <p>
                  If you contact us before digital delivery has
                  occurred, we may review the request, but
                  cancellation is not guaranteed where automated
                  processing has already begun.
                </p>
              </Section>

              <Section
                id="promotions"
                number="14"
                title="Promotional and Discounted Purchases"
              >
                <p>
                  Products purchased during a sale, launch offer,
                  promotional campaign, coupon offer, or discounted
                  period remain subject to this Refund &
                  Cancellation Policy unless the specific promotion
                  expressly states otherwise.
                </p>

                <p>
                  A later change in the price of an ebook does not by
                  itself create an entitlement to a refund or
                  reimbursement of the difference.
                </p>
              </Section>

              <Section
                id="updates"
                number="15"
                title="Product Updates and New Editions"
              >
                <p>
                  Target Trek may update an ebook or release a new
                  edition in the future.
                </p>

                <p>
                  Purchasing an existing edition does not
                  automatically entitle the purchaser to a refund
                  because a newer edition, revised product, discounted
                  version, or additional resource becomes available
                  later.
                </p>

                <p>
                  Access to future editions or updates will depend on
                  the terms associated with the particular product.
                </p>
              </Section>

              <Section
                id="learning-outcomes"
                number="16"
                title="Interview and Learning Outcomes"
              >
                <p>
                  Target Trek ebooks are educational resources.
                  Purchasing an ebook does not guarantee:
                </p>

                <BulletList>
                  <li>Employment or an internship.</li>

                  <li>An interview call.</li>

                  <li>
                    Selection in an interview.
                  </li>

                  <li>
                    A particular examination result.
                  </li>

                  <li>A particular salary.</li>

                  <li>
                    A specific professional outcome.
                  </li>
                </BulletList>

                <p>
                  Failure to achieve a particular educational,
                  interview, or career outcome is not by itself a
                  basis for a refund.
                </p>
              </Section>

              <Section
                id="sharing"
                number="17"
                title="Unauthorized Sharing or Redistribution"
              >
                <p>
                  Target Trek ebooks are licensed for personal use
                  unless otherwise stated.
                </p>

                <p>
                  Customers must not unlawfully resell, publicly
                  upload, redistribute, or share paid ebooks or
                  protected purchase links.
                </p>

                <p>
                  Refund requests associated with fraudulent activity,
                  unauthorized redistribution, abuse of access
                  controls, or other material violations of our Terms
                  & Conditions may be denied to the extent permitted
                  by applicable law.
                </p>
              </Section>

              <Section
                id="chargebacks"
                number="18"
                title="Chargebacks and Payment Disputes"
              >
                <p>
                  If you experience a legitimate purchase problem, we
                  encourage you to contact Target Trek support first
                  so that we can investigate and attempt to resolve
                  the issue.
                </p>

                <p>
                  We may provide transaction and digital delivery
                  records to payment providers, banks, or other
                  relevant parties where reasonably necessary to
                  respond to a payment dispute or chargeback.
                </p>

                <p>
                  Nothing in this section prevents you from exercising
                  any rights available to you under applicable law or
                  through your payment provider.
                </p>
              </Section>

              <Section
                id="consumer-rights"
                number="19"
                title="Consumer Rights"
              >
                <p>
                  This Refund & Cancellation Policy is intended to
                  describe Target Trek's general policy for digital
                  products.
                </p>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <p className="font-bold leading-7 text-slate-900">
                    Nothing in this policy is intended to exclude,
                    waive, or restrict any consumer right, statutory
                    guarantee, refund, replacement, or other remedy
                    that cannot legally be excluded under applicable
                    law.
                  </p>
                </div>

                <p>
                  Where this policy conflicts with a mandatory legal
                  requirement, the applicable legal requirement will
                  prevail to the extent of that conflict.
                </p>
              </Section>

              <Section
                id="policy-changes"
                number="20"
                title="Changes to This Refund Policy"
              >
                <p>
                  Target Trek may update this Refund & Cancellation
                  Policy from time to time to reflect changes in our
                  products, payment processes, business practices, or
                  applicable requirements.
                </p>

                <p>
                  The updated policy will be published on this page
                  and the{" "}
                  <strong className="text-slate-900">
                    Last Updated
                  </strong>{" "}
                  date may be changed accordingly.
                </p>
              </Section>

              <Section
                id="support"
                number="21"
                title="Contact Target Trek Ebook Support"
              >
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                  <h3 className="text-lg font-black text-slate-950">
                    Need Help With Your Ebook Purchase?
                  </h3>

                  <p className="mt-3">
                    For duplicate payments, missing ebooks, incorrect
                    files, corrupted downloads, payment confirmation,
                    or other ebook-related purchase issues:
                  </p>

                  <p className="mt-4">
                    <strong className="text-slate-900">
                      Email:
                    </strong>{" "}
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="break-all font-bold text-blue-700 underline decoration-blue-300 underline-offset-4 hover:text-blue-900"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </p>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    Please include the{" "}
                    <strong className="text-slate-800">
                      email address used during checkout
                    </strong>
                    , the{" "}
                    <strong className="text-slate-800">
                      ebook name
                    </strong>
                    , and your{" "}
                    <strong className="text-slate-800">
                      order or transaction reference
                    </strong>{" "}
                    where available.
                  </p>

                  <div className="mt-4 rounded-xl border border-blue-100 bg-white p-4">
                    <p className="text-sm font-bold leading-6 text-slate-700">
                      Do not send your OTP, UPI PIN, CVV, banking
                      password, or complete card information.
                    </p>
                  </div>
                </div>
              </Section>
            </div>

            <footer className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm leading-7 text-slate-500">
                This Refund & Cancellation Policy should be read
                together with Target Trek's{" "}
                <a
                  href="/terms-of-service"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Terms & Conditions
                </a>
                ,{" "}
                <a
                  href="/privacy-policy"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Privacy Policy
                </a>
                , and any product-specific information displayed
                before purchase.
              </p>

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  © {new Date().getFullYear()}{" "}
                  <strong className="font-semibold text-slate-600">
                    Target Trek
                  </strong>
                  . All rights reserved.
                </p>

                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Contact support
                </a>
              </div>
            </footer>
          </article>
        </div>
      </main>
    </motion.div>
  );
};

export default RefundPolicy;