import React from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";

const TermsOfService = () => {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  };

  const termsOfServiceTitle =
    "Terms & Conditions | Target Trek";

  const termsOfServiceDescription =
    "Read Target Trek's Terms and Conditions for purchasing and using ebooks, digital products, educational resources, and other services.";

  const Section = ({ number, title, children }) => (
    <section className="mb-10">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
        {number}. {title}
      </h2>

      <div className="space-y-4 text-gray-700 leading-7">
        {children}
      </div>
    </section>
  );

  const BulletList = ({ children }) => (
    <ul className="list-disc pl-6 space-y-2 text-gray-700 leading-7">
      {children}
    </ul>
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-white"
    >
      <Helmet>
        <title>{termsOfServiceTitle}</title>

        <meta
          name="description"
          content={termsOfServiceDescription}
        />

        <link
          rel="canonical"
          href="https://www.targettrek.in/terms-of-service"
        />
      </Helmet>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">

        {/* HEADER */}
        <div className="border-b border-gray-200 pb-8 mb-10">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-3">
            Target Trek
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950">
            Terms & Conditions
          </h1>

          <p className="mt-4 max-w-3xl text-gray-600 leading-7">
            These Terms & Conditions govern your use of the{" "}
            <strong>Target Trek</strong> website and your purchase,
            access, download, and use of our ebooks and other
            digital educational products.
          </p>

          <p className="mt-4 text-sm text-gray-500">
            <strong>Last Updated:</strong> September 24, 2026
          </p>
        </div>

        {/* IMPORTANT PURCHASE NOTICE */}
        <div className="mb-10 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Important Digital Product Notice
          </h2>

          <p className="text-gray-700 leading-7">
            Target Trek primarily sells{" "}
            <strong>digital educational products and ebooks</strong>.
            Digital products may become accessible immediately after
            successful payment.
          </p>

          <p className="text-gray-700 leading-7 mt-3">
            Because digital products cannot ordinarily be returned after
            access or delivery, purchases are generally{" "}
            <strong>non-refundable and non-returnable</strong>, except
            where a refund or other remedy is required by applicable law
            or where an eligible purchase issue described below occurs.
          </p>
        </div>

        <Section number="1" title="Acceptance of Terms">
          <p>
            Welcome to <strong>Target Trek</strong>. By accessing
            our website, purchasing a product, downloading an ebook,
            accessing digital content, or otherwise using our services,
            you agree to these Terms & Conditions.
          </p>

          <p>
            If you do not agree with these Terms, you should not purchase
            or use our products or services.
          </p>

          <p>
            These Terms should be read together with our{" "}
            <strong>Privacy Policy</strong> and any additional purchase,
            access, or product-specific terms displayed on our website.
          </p>
        </Section>

        <Section number="2" title="About Target Trek">
          <p>
            Target Trek provides digital educational resources,
            including ebooks, guides, interview preparation materials,
            technical learning resources, and other digital content.
          </p>

          <p>
            Products available on Target Trek may change from time to
            time. The features, description, pricing, availability,
            edition, and content of each product will be shown on the
            applicable product page.
          </p>
        </Section>

        <Section number="3" title="Digital Products and Ebook Delivery">
          <p>
            Products sold through Target Trek are primarily{" "}
            <strong>digital products</strong>. No physical book or
            physical product will be delivered unless a product page
            explicitly states otherwise.
          </p>

          <p>
            After successful payment, ebook access may be provided
            through:
          </p>

          <BulletList>
            <li>A PDF or other digital file.</li>

            <li>A secure browser-based document viewer.</li>

            <li>A temporary or purchase-specific access link.</li>

            <li>A download or access page.</li>

            <li>
              An email containing purchase or access information.
            </li>

            <li>
              Another digital delivery method described during purchase.
            </li>
          </BulletList>

          <p>
            Delivery may depend on successful confirmation of the
            transaction by our payment processing system.
          </p>
        </Section>

        <Section number="4" title="Pricing and Payments">
          <p>
            Product prices are displayed on the applicable product page
            before purchase.
          </p>

          <p>
            Prices may be changed from time to time. A price change does
            not ordinarily affect a transaction that has already been
            successfully completed.
          </p>

          <p>
            Payments may be processed through third-party payment
            providers. By completing a transaction, you may also be
            subject to the payment provider's applicable terms and
            privacy practices.
          </p>

          <p>
            <strong>
              Never send Target Trek your UPI PIN, OTP, CVV, banking
              password, or complete card credentials by email.
            </strong>
          </p>
        </Section>

        <Section number="5" title="Non-Refundable Digital Products">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="font-bold text-gray-900 leading-7">
              Ebook and digital product purchases are generally
              non-refundable and non-returnable once the product or
              access to the product has been delivered, except where
              applicable law requires otherwise.
            </p>
          </div>

          <p>
            Digital products can generally be accessed, copied,
            downloaded, or consumed immediately after delivery. For this
            reason, they cannot ordinarily be returned in the same way as
            physical goods.
          </p>

          <p>
            Please review the product description carefully before
            completing your purchase.
          </p>

          <p>
            A refund, replacement, restoration of access, or another
            appropriate remedy may be considered where applicable,
            including situations such as:
          </p>

          <BulletList>
            <li>
              You were charged multiple times for the same purchase.
            </li>

            <li>
              Payment was successfully completed but the purchased
              product was not delivered.
            </li>

            <li>
              The delivered file is corrupted or cannot reasonably be
              accessed and we are unable to provide a working copy.
            </li>

            <li>
              You received a different digital product from the one
              purchased.
            </li>

            <li>
              A refund or other remedy is required under applicable law.
            </li>
          </BulletList>

          <p>
            <strong>
              A change of mind after receiving or accessing an ebook does
              not ordinarily qualify for a refund.
            </strong>
          </p>

          <p>
            Nothing in these Terms is intended to exclude or restrict
            rights that cannot legally be excluded under applicable
            consumer law.
          </p>
        </Section>

        <Section number="6" title="Customer Responsibilities">
          <p>
            When purchasing or accessing a Target Trek product, you agree
            to provide accurate information where requested.
          </p>

          <p>You are responsible for:</p>

          <BulletList>
            <li>
              Providing a valid email address during checkout.
            </li>

            <li>
              Checking product details before completing your purchase.
            </li>

            <li>
              Keeping purchase-specific access links and tokens secure.
            </li>

            <li>
              Downloading or saving your purchased ebook where the
              product delivery instructions recommend doing so.
            </li>

            <li>
              Using the product only in accordance with these Terms.
            </li>
          </BulletList>

          <p>
            Target Trek is not responsible for access problems caused
            solely by incorrect information supplied by the customer,
            subject to applicable law.
          </p>
        </Section>

        <Section number="7" title="Personal-Use Licence">
          <p>
            Unless otherwise stated on the product page, purchasing a
            Target Trek ebook gives you a{" "}
            <strong>
              limited, non-exclusive, non-transferable licence for
              personal use
            </strong>.
          </p>

          <p>
            Purchasing an ebook does not transfer ownership of the
            copyright, trademarks, source materials, or other
            intellectual property associated with the product.
          </p>
        </Section>

        <Section number="8" title="Prohibited Ebook Sharing and Redistribution">
          <p>
            Unless expressly authorized by Target Trek or permitted by
            applicable law, you may not:
          </p>

          <BulletList>
            <li>Resell a Target Trek ebook.</li>

            <li>
              Upload a paid ebook to a public website, cloud folder,
              messaging group, torrent, repository, or file-sharing
              platform.
            </li>

            <li>
              Share purchase-specific download or access links with
              unauthorized users.
            </li>

            <li>
              Reproduce or distribute substantial portions of a paid
              ebook for commercial purposes.
            </li>

            <li>
              Remove copyright, ownership, or other proprietary notices
              from a product.
            </li>

            <li>
              Present Target Trek content as your own original paid
              product.
            </li>

            <li>
              Sell, sublicense, rent, or commercially redistribute a
              purchased ebook without authorization.
            </li>
          </BulletList>

          <p>
            We may take reasonable steps to protect our digital products
            and intellectual property where unauthorized distribution or
            misuse is detected.
          </p>
        </Section>

        <Section number="9" title="Intellectual Property">
          <p>
            Unless otherwise stated, Target Trek owns or licenses the
            content made available through its website and products,
            including applicable:
          </p>

          <BulletList>
            <li>Text and written educational material.</li>
            <li>Book layouts and original diagrams.</li>
            <li>Graphics and illustrations.</li>
            <li>Website content and design.</li>
            <li>Original code examples and explanations.</li>
            <li>Branding and other proprietary material.</li>
          </BulletList>

          <p>
            Third-party names, trademarks, technologies, products, and
            services referenced for educational purposes remain the
            property of their respective owners.
          </p>
        </Section>

        <Section number="10" title="Educational Purpose">
          <p>
            Target Trek ebooks and learning materials are provided for{" "}
            <strong>educational and informational purposes</strong>.
          </p>

          <p>
            We aim to provide useful and carefully prepared material,
            but technology, software, APIs, interview practices, cloud
            platforms, pricing, documentation, and industry standards can
            change over time.
          </p>

          <p>
            You should verify information that is important to a
            production system, financial decision, security decision, or
            other critical use case against current authoritative
            documentation.
          </p>
        </Section>

        <Section number="11" title="No Interview, Employment, or Career Guarantee">
          <p>
            Purchasing or using a Target Trek educational product does
            not guarantee:
          </p>

          <BulletList>
            <li>A job or internship.</li>
            <li>An interview call.</li>
            <li>Selection in an interview.</li>
            <li>A particular salary or compensation package.</li>
            <li>Admission to a company or educational institution.</li>
            <li>A specific examination or interview result.</li>
          </BulletList>

          <p>
            Learning outcomes depend on many factors, including the
            learner's preparation, experience, practice, and individual
            circumstances.
          </p>
        </Section>

        <Section number="12" title="Technical Content and Code Examples">
          <p>
            Some Target Trek products may contain source code,
            architecture examples, configuration examples, commands,
            system designs, or other technical material.
          </p>

          <p>
            These examples are primarily intended for learning and
            demonstration.
          </p>

          <p>
            Before using any example in a production environment, you
            should independently review and test it for security,
            correctness, scalability, compatibility, licensing, and
            suitability for your specific requirements.
          </p>
        </Section>

        <Section number="13" title="Product Updates and Editions">
          <p>
            We may periodically update, revise, correct, expand, or
            release new editions of our ebooks and digital products.
          </p>

          <p>
            Purchasing one edition does not automatically guarantee
            access to every future edition, replacement product, course,
            or separately released resource unless explicitly stated at
            the time of purchase.
          </p>
        </Section>

        <Section number="14" title="Website Availability">
          <p>
            We aim to keep Target Trek and its digital delivery systems
            reasonably available. However, temporary interruptions may
            occur because of:
          </p>

          <BulletList>
            <li>Maintenance.</li>
            <li>Hosting outages.</li>
            <li>Network failures.</li>
            <li>Payment-provider outages.</li>
            <li>Security incidents.</li>
            <li>Software updates.</li>
            <li>Events outside our reasonable control.</li>
          </BulletList>

          <p>
            We do not guarantee uninterrupted availability of every
            website feature at all times.
          </p>
        </Section>

        <Section number="15" title="Unauthorized Access and Abuse">
          <p>
            You must not attempt to:
          </p>

          <BulletList>
            <li>
              Bypass payment or product access controls.
            </li>

            <li>
              Obtain paid content without authorization.
            </li>

            <li>
              Manipulate payment callbacks, purchase tokens, order
              identifiers, or access URLs.
            </li>

            <li>
              Probe or exploit vulnerabilities in our website or
              infrastructure.
            </li>

            <li>
              Interfere with the normal operation or security of the
              website.
            </li>

            <li>
              Use automated systems to abuse, scrape, overload, or
              improperly access protected services.
            </li>
          </BulletList>
        </Section>

        <Section number="16" title="Third-Party Services">
          <p>
            Target Trek may rely on third-party services for payment
            processing, website hosting, cloud infrastructure, analytics,
            email delivery, file hosting, and other functionality.
          </p>

          <p>
            Third-party services operate under their own terms and
            privacy policies. Their availability and functionality may
            be outside Target Trek's direct control.
          </p>
        </Section>

        <Section number="17" title="Disclaimer of Warranties">
          <p>
            To the extent permitted by applicable law, the website and
            digital products are provided on an{" "}
            <strong>"as available"</strong> basis.
          </p>

          <p>
            While we aim to maintain accurate and useful educational
            material, we do not guarantee that every piece of content
            will always be complete, current, error-free, or suitable
            for every user's particular purpose.
          </p>

          <p>
            Nothing in this section excludes warranties, guarantees, or
            rights that cannot legally be excluded.
          </p>
        </Section>

        <Section number="18" title="Limitation of Liability">
          <p>
            To the extent permitted by applicable law, Target Trek will
            not be responsible for indirect, incidental, special, or
            consequential losses arising solely from the use of our
            website or educational digital products.
          </p>

          <p>
            Where liability cannot lawfully be excluded, any limitation
            will apply only to the maximum extent permitted by applicable
            law.
          </p>

          <p>
            Nothing in these Terms excludes or limits liability where
            doing so would be prohibited by law.
          </p>
        </Section>

        <Section number="19" title="Suspension of Access">
          <p>
            We may restrict or suspend access to protected digital
            services where reasonably necessary to address:
          </p>

          <BulletList>
            <li>Fraudulent transactions.</li>
            <li>Unauthorized redistribution.</li>
            <li>Security threats.</li>
            <li>Abuse of access controls.</li>
            <li>Material violations of these Terms.</li>
          </BulletList>

          <p>
            Where appropriate, legitimate purchase and access issues can
            be raised with our ebook support team.
          </p>
        </Section>

        <Section number="20" title="Privacy">
          <p>
            Information collected when you visit Target Trek or purchase
            a product is handled in accordance with our{" "}
            <strong>Privacy Policy</strong>.
          </p>

          <p>
            Please review the Privacy Policy for information about the
            categories of information we may collect, why we use it,
            payment-related processing, cookies, data retention, and
            privacy rights.
          </p>
        </Section>

        <Section number="21" title="Changes to These Terms">
          <p>
            Target Trek may update these Terms from time to time to
            reflect changes to our products, website, technology,
            business practices, or applicable requirements.
          </p>

          <p>
            The latest version will be published on this page and the{" "}
            <strong>Last Updated</strong> date may be revised.
          </p>
        </Section>

        <Section number="22" title="Governing Law">
          <p>
            These Terms are governed by the applicable laws of{" "}
            <strong>India</strong>, subject to any mandatory consumer
            protection or other rights that may apply.
          </p>

          <p>
            If a dispute arises, we encourage you to contact Target Trek
            first so that we can attempt to resolve the matter
            reasonably and promptly.
          </p>
        </Section>

        <Section number="23" title="Severability">
          <p>
            If any provision of these Terms is found to be invalid,
            unlawful, or unenforceable, the remaining provisions will
            continue to apply to the extent permitted by law.
          </p>
        </Section>

        <Section number="24" title="Ebook Support">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Target Trek Ebook Support
            </h3>

            <p>
              For questions relating to an ebook purchase, payment
              confirmation, duplicate payment, missing ebook, corrupted
              file, access problem, or other digital-product issue,
              contact:
            </p>

            <p className="mt-4">
              <strong>Email:</strong>{" "}
              <a
                href="mailto:supporttargettrek@gmail.com"
                className="font-bold text-blue-700 underline hover:text-blue-900"
              >
                supporttargettrek@gmail.com
              </a>
            </p>

            <p className="mt-4 text-sm text-gray-600">
              When contacting support about a purchase, include the{" "}
              <strong>email address used during checkout</strong> and
              your <strong>order or transaction reference</strong> where
              available.
            </p>

            <p className="mt-3 text-sm font-bold text-gray-700">
              Never send your OTP, UPI PIN, CVV, banking password, or
              complete card information by email.
            </p>
          </div>
        </Section>

        {/* FINAL NOTICE */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500 leading-6">
            By purchasing or accessing a Target Trek digital product,
            you acknowledge that you have had an opportunity to review
            these Terms & Conditions and the applicable product
            information before completing your purchase.
          </p>

          <p className="text-sm text-gray-500 mt-3">
            © {new Date().getFullYear()}{" "}
            <strong>Target Trek</strong>. All rights reserved.
          </p>
        </div>
      </main>
    </motion.div>
  );
};

export default TermsOfService;