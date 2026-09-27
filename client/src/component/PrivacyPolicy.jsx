import React from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";
const CANONICAL_URL = `${SITE_URL}/privacy-policy`;

const SEO_TITLE =
  "Privacy Policy for Ebooks & Digital Products | Target Trek";

const SEO_DESCRIPTION =
  "Read Target Trek's Privacy Policy covering personal information, ebook purchases, payments, cookies, analytics, data security, retention, privacy rights, and customer support.";

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
    id: "information-we-collect",
    label: "Information we collect",
  },
  {
    id: "how-we-use-information",
    label: "How we use information",
  },
  {
    id: "payments",
    label: "Payments",
  },
  {
    id: "sharing",
    label: "How information is shared",
  },
  {
    id: "cookies",
    label: "Cookies & analytics",
  },
  {
    id: "security",
    label: "Data security",
  },
  {
    id: "privacy-rights",
    label: "Your privacy rights",
  },
  {
    id: "privacy-contact",
    label: "Privacy contact",
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

const PrivacyPolicy = () => {
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
        about: [
          {
            "@type": "Thing",
            name: "Privacy Policy",
          },
          {
            "@type": "Thing",
            name: "Digital Product Privacy",
          },
          {
            "@type": "Thing",
            name: "Ebook Purchases",
          },
          {
            "@type": "Thing",
            name: "Data Protection",
          },
        ],
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
            name: "Privacy Policy",
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
          <div className="pointer-events-none absolute -right-52 -top-52 h-[520px] w-[520px] rounded-full bg-blue-100/60 blur-3xl" />

          <div className="pointer-events-none absolute -left-36 bottom-0 h-[340px] w-[340px] rounded-full bg-cyan-100/40 blur-3xl" />

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
                Privacy Policy
              </span>
            </nav>

            <div className="max-w-4xl">
              <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-blue-700">
                Target Trek Privacy
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Privacy Policy
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                This Privacy Policy explains how{" "}
                <strong className="font-bold text-slate-900">
                  Target Trek
                </strong>{" "}
                collects, uses, stores, shares, and protects
                information when you visit our website, purchase
                digital products, access ebooks, or contact our
                support team.
              </p>

              <div className="mt-7 flex flex-wrap gap-3 text-sm">
                <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-600 shadow-sm">
                  Last updated: {LAST_UPDATED}
                </span>

                <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-600 shadow-sm">
                  Website privacy
                </span>

                <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-600 shadow-sm">
                  Digital products
                </span>

                <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-600 shadow-sm">
                  Payment information
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">
                Information
              </p>

              <p className="mt-2 text-sm font-bold leading-6 text-slate-800">
                We may process information required for purchases,
                access, support, security, and website operation.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-600">
                Payments
              </p>

              <p className="mt-2 text-sm font-bold leading-6 text-slate-800">
                Payment providers may process sensitive payment
                information directly.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-600">
                Privacy Rights
              </p>

              <p className="mt-2 text-sm font-bold leading-6 text-slate-800">
                Depending on applicable law, you may have access,
                correction, deletion, and other privacy rights.
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
                aria-label="Privacy policy navigation"
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
                  Have a privacy question?
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
            <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-white text-lg font-black text-amber-600">
                  !
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    Important Notice for Digital Ebook Purchases
                  </h2>

                  <p className="mt-3 leading-7 text-slate-700">
                    Target Trek sells downloadable and/or digitally
                    accessible educational products. Because an ebook
                    is a digital product that may become available
                    immediately after a successful purchase, purchases
                    are generally{" "}
                    <strong>
                      non-refundable and non-returnable
                    </strong>
                    , subject to applicable law and the exceptions
                    described in our Refund & Cancellation Policy.
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-10 space-y-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
              <Section
                id="introduction"
                number="1"
                title="Introduction"
              >
                <p>
                  At{" "}
                  <strong className="text-slate-900">
                    Target Trek
                  </strong>
                  , we respect your privacy and take reasonable steps
                  to protect the personal information you provide
                  while using our website and services.
                </p>

                <p>
                  This policy applies to information collected through
                  the Target Trek website, ebook purchase process,
                  payment-related workflows, digital product access
                  pages, customer support communications, and other
                  services operated by Target Trek.
                </p>

                <p>
                  By using our website or services, you acknowledge
                  this Privacy Policy. Where consent is legally
                  required for a particular type of processing, we
                  will request it separately.
                </p>
              </Section>

              <Section
                id="information-we-collect"
                number="2"
                title="Information We Collect"
              >
                <p>
                  Depending on how you interact with Target Trek, we
                  may collect the following categories of information:
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    [
                      "Identity Information",
                      "Your name or other information you provide during checkout or while contacting support.",
                    ],
                    [
                      "Contact Information",
                      "Your email address and other contact information you voluntarily provide.",
                    ],
                    [
                      "Purchase Information",
                      "Product purchased, order reference, transaction reference, payment status, amount, currency and purchase date.",
                    ],
                    [
                      "Payment Information",
                      "Limited transaction information received from payment providers for verifying and processing purchases.",
                    ],
                    [
                      "Technical Information",
                      "IP address, browser type, device type, operating system, referring page, timestamps and website activity.",
                    ],
                    [
                      "Support Communications",
                      "Messages, purchase details and responses associated with customer-support requests.",
                    ],
                    [
                      "Analytics Information",
                      "Information collected through cookies, analytics technologies and similar tools where applicable.",
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

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <p className="font-bold leading-7 text-slate-900">
                    We do not intend to directly store your complete
                    card details, UPI credentials, banking passwords,
                    OTPs, CVVs, or similar sensitive payment
                    credentials.
                  </p>
                </div>
              </Section>

              <Section
                id="how-we-use-information"
                number="3"
                title="How We Use Your Information"
              >
                <p>
                  We may use information collected through Target Trek
                  for purposes including:
                </p>

                <BulletList>
                  <li>
                    Processing and verifying digital product
                    purchases.
                  </li>

                  <li>
                    Providing access to the ebook or digital product
                    you purchased.
                  </li>

                  <li>
                    Sending transactional or purchase-related
                    communications.
                  </li>

                  <li>
                    Responding to customer support requests and
                    resolving access problems.
                  </li>

                  <li>
                    Preventing duplicate transactions, fraud, abuse,
                    unauthorized access, or misuse of our digital
                    products.
                  </li>

                  <li>
                    Maintaining records required for accounting,
                    security, compliance, or dispute resolution.
                  </li>

                  <li>
                    Monitoring website performance and improving our
                    products, website, and user experience.
                  </li>

                  <li>
                    Diagnosing technical problems and protecting the
                    security of our systems.
                  </li>

                  <li>
                    Sending promotional communications where
                    permitted by law and, where required, after
                    obtaining your consent.
                  </li>

                  <li>
                    Complying with applicable legal, regulatory, tax,
                    and contractual obligations.
                  </li>
                </BulletList>
              </Section>

              <Section
                id="ebook-access"
                number="4"
                title="Ebook Purchases and Digital Access"
              >
                <p>
                  When you purchase an ebook from Target Trek,
                  information associated with your transaction may be
                  used to confirm payment and provide access to the
                  purchased digital product.
                </p>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <p className="font-bold leading-7 text-slate-900">
                    Ebook access links, download links, purchase
                    tokens, and other access credentials are intended
                    for the purchaser.
                  </p>
                </div>

                <p>
                  You should not publicly share purchase-specific or
                  access-specific links where doing so could allow
                  unauthorized access to a paid product.
                </p>

                <p>
                  Depending on the product and delivery method, access
                  may be provided through a download, browser-based
                  PDF viewer, temporary link, secure access page, or
                  another digital delivery mechanism.
                </p>

                <p>
                  You are responsible for entering a valid email
                  address and accurately completing the information
                  requested during checkout.
                </p>
              </Section>

              <Section
                id="refund-policy"
                number="5"
                title="Digital Product Refund Policy"
              >
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                  <p className="font-bold leading-7 text-slate-900">
                    Digital ebook purchases are generally
                    non-refundable and non-returnable once the digital
                    product or access has been delivered, except where
                    a refund or other remedy is required by applicable
                    law.
                  </p>
                </div>

                <p>
                  Because digital products can be accessed, viewed, or
                  downloaded immediately after delivery, they cannot
                  ordinarily be returned in the same manner as
                  physical goods.
                </p>

                <p>
                  However, if you experience a genuine issue such as
                  being charged more than once for the same purchase,
                  successful payment without receiving the purchased
                  product, or receiving an incorrect or inaccessible
                  file, please contact us so we can investigate.
                </p>

                <p>
                  Nothing in this policy is intended to exclude,
                  restrict, or override any mandatory consumer rights
                  or remedies available under applicable law.
                </p>

                <a
                  href="/refund-policy"
                  className="inline-flex font-bold text-blue-600 transition hover:text-blue-700"
                >
                  Read our Refund & Cancellation Policy →
                </a>
              </Section>

              <Section
                id="payments"
                number="6"
                title="Payment Processing"
              >
                <p>
                  Payments for Target Trek products may be processed
                  through third-party payment service providers. Those
                  providers may collect and process payment-related
                  information according to their own privacy policies
                  and legal obligations.
                </p>

                <p>
                  Target Trek may receive limited transaction
                  information from a payment provider, such as:
                </p>

                <BulletList>
                  <li>
                    Transaction or payment reference.
                  </li>

                  <li>Order reference.</li>

                  <li>Payment status.</li>

                  <li>
                    Transaction amount and currency.
                  </li>

                  <li>
                    Information required to reconcile or verify the
                    purchase.
                  </li>
                </BulletList>

                <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
                  <p className="font-bold leading-7 text-slate-900">
                    We do not ask customers to send us their banking
                    password, UPI PIN, OTP, CVV, or complete card
                    credentials by email.
                  </p>
                </div>
              </Section>

              <Section
                id="sharing"
                number="7"
                title="How We Share Information"
              >
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="font-black text-slate-900">
                    We do not sell your personal information.
                  </p>
                </div>

                <p>
                  We may share limited information when reasonably
                  necessary for operating our services, including
                  with:
                </p>

                <BulletList>
                  <li>
                    <strong className="text-slate-900">
                      Payment processors
                    </strong>{" "}
                    for processing and verifying transactions.
                  </li>

                  <li>
                    <strong className="text-slate-900">
                      Hosting and infrastructure providers
                    </strong>{" "}
                    used to operate our website, APIs, databases, or
                    digital delivery systems.
                  </li>

                  <li>
                    <strong className="text-slate-900">
                      Email or communication providers
                    </strong>{" "}
                    used for transactional emails and customer
                    support.
                  </li>

                  <li>
                    <strong className="text-slate-900">
                      Analytics and security providers
                    </strong>{" "}
                    used to understand website performance, detect
                    abuse, or improve security.
                  </li>

                  <li>
                    <strong className="text-slate-900">
                      Professional advisers or authorities
                    </strong>{" "}
                    where disclosure is reasonably necessary to comply
                    with applicable law, enforce our rights, respond
                    to lawful requests, or protect users and our
                    services.
                  </li>
                </BulletList>

                <p>
                  Third-party providers may process information
                  according to their own terms and privacy policies.
                </p>
              </Section>

              <Section
                id="cookies"
                number="8"
                title="Cookies and Analytics"
              >
                <p>
                  Target Trek may use cookies, local storage,
                  analytics tools, and similar technologies to operate
                  the website, remember preferences, understand
                  traffic, measure performance, and improve the user
                  experience.
                </p>

                <p>
                  Depending on your browser and applicable
                  requirements, you may be able to block or delete
                  cookies through your browser settings.
                </p>

                <p>
                  Disabling certain cookies or browser storage may
                  affect website functionality.
                </p>
              </Section>

              <Section
                id="security"
                number="9"
                title="Data Security"
              >
                <p>
                  We use reasonable technical and organizational
                  measures designed to protect information against
                  unauthorized access, alteration, disclosure, loss,
                  or misuse.
                </p>

                <p>
                  These measures may include access controls, secure
                  communications, transaction verification,
                  restricted administrative access, and security
                  monitoring where appropriate.
                </p>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="font-bold leading-7 text-slate-900">
                    No website, database, payment system, or internet
                    transmission can be guaranteed to be completely
                    secure.
                  </p>
                </div>
              </Section>

              <Section
                id="retention"
                number="10"
                title="Data Retention"
              >
                <p>
                  We retain personal information only for as long as
                  reasonably necessary for the purposes for which it
                  was collected, including providing purchased
                  products, customer support, transaction
                  reconciliation, fraud prevention, accounting, legal
                  compliance, and dispute resolution.
                </p>

                <p>
                  Different categories of information may be retained
                  for different periods depending on operational and
                  legal requirements.
                </p>
              </Section>

              <Section
                id="privacy-rights"
                number="11"
                title="Your Privacy Rights"
              >
                <p>
                  Depending on applicable law and your location, you
                  may have rights relating to your personal
                  information, which can include the right to:
                </p>

                <BulletList>
                  <li>
                    Request access to certain personal information we
                    hold.
                  </li>

                  <li>
                    Request correction of inaccurate or incomplete
                    personal information.
                  </li>

                  <li>
                    Request deletion of eligible personal information,
                    subject to legal and operational retention
                    requirements.
                  </li>

                  <li>
                    Withdraw consent where processing is based on
                    consent.
                  </li>

                  <li>
                    Object to or request restriction of certain
                    processing where applicable.
                  </li>

                  <li>
                    Opt out of promotional communications where such
                    an option is available.
                  </li>
                </BulletList>

                <p>
                  We may need to verify your identity or purchase
                  information before responding to certain privacy
                  requests.
                </p>
              </Section>

              <Section
                id="children"
                number="12"
                title="Children's Privacy"
              >
                <p>
                  Target Trek's products are primarily educational
                  resources intended for learners, developers,
                  professionals, and interview candidates.
                </p>

                <p>
                  We do not knowingly seek to collect personal
                  information from children in violation of
                  applicable law.
                </p>

                <p>
                  If you believe personal information relating to a
                  child has been provided to us improperly, please
                  contact us so the matter can be reviewed.
                </p>
              </Section>

              <Section
                id="ebook-usage"
                number="13"
                title="Intellectual Property and Ebook Usage"
              >
                <p>
                  Purchasing an ebook gives the purchaser access to
                  the digital product for personal use subject to the
                  applicable purchase terms.
                </p>

                <p>
                  Unless expressly permitted, purchasing an ebook does
                  not transfer ownership of Target Trek's intellectual
                  property rights.
                </p>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <p className="font-bold leading-7 text-slate-900">
                    You should not reproduce, resell, redistribute,
                    publicly upload, or commercially distribute paid
                    Target Trek ebooks without authorization.
                  </p>
                </div>

                <p>
                  This section describes product usage expectations
                  and does not limit any rights available to you under
                  applicable law.
                </p>
              </Section>

              <Section
                id="third-party-services"
                number="14"
                title="Third-Party Websites and Services"
              >
                <p>
                  Our website may contain links to websites, payment
                  services, platforms, or other services operated by
                  third parties.
                </p>

                <p>
                  Target Trek does not control the privacy practices of
                  independent third parties. We recommend reviewing
                  their applicable privacy policies before providing
                  information directly to them.
                </p>
              </Section>

              <Section
                id="policy-changes"
                number="15"
                title="Changes to This Privacy Policy"
              >
                <p>
                  We may update this Privacy Policy from time to time
                  to reflect changes to our website, products,
                  business practices, technology, or applicable
                  requirements.
                </p>

                <p>
                  When the policy is updated, the revised version will
                  be published on this page and the{" "}
                  <strong className="text-slate-900">
                    Last Updated
                  </strong>{" "}
                  date may be changed accordingly.
                </p>
              </Section>

              <Section
                id="privacy-contact"
                number="16"
                title="Ebook Support and Privacy Contact"
              >
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                  <h3 className="text-lg font-black text-slate-950">
                    Target Trek Ebook & Privacy Support
                  </h3>

                  <p className="mt-3">
                    For ebook purchase issues, payment confirmation,
                    access problems, incorrect files, privacy
                    questions, or other ebook-related support,
                    contact:
                  </p>

                  <p className="mt-4">
                    <strong className="text-slate-900">
                      Email:
                    </strong>{" "}
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="break-all font-bold text-blue-700 underline decoration-blue-300 underline-offset-4 transition hover:text-blue-900"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </p>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    When contacting support about a purchase, please
                    include the email address used during checkout and
                    your order or transaction reference where
                    available.
                  </p>

                  <div className="mt-4 rounded-xl border border-blue-100 bg-white p-4">
                    <p className="text-sm font-bold leading-6 text-slate-700">
                      Never send your OTP, UPI PIN, CVV, banking
                      password, or full card details by email.
                    </p>
                  </div>
                </div>
              </Section>
            </div>

            <footer className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-sm leading-7 text-slate-500">
                This Privacy Policy should be read together with our{" "}
                <a
                  href="/terms-of-service"
                  className="font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Terms & Conditions
                </a>
                ,{" "}
                <a
                  href="/refund-policy"
                  className="font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Refund & Cancellation Policy
                </a>
                , applicable purchase terms, and notices displayed
                during checkout or digital product delivery.
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
                  Privacy & support contact
                </a>
              </div>
            </footer>
          </article>
        </div>
      </main>
    </motion.div>
  );
};

export default PrivacyPolicy;