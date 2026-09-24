import React from "react";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
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
    <ul className="list-disc pl-6 space-y-2 text-gray-700">
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Header */}
        <div className="border-b border-gray-200 pb-8 mb-10">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-3">
            Target Trek
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950">
            Privacy Policy
          </h1>

          <p className="mt-4 text-gray-600 leading-7 max-w-3xl">
            This Privacy Policy explains how <strong>Target Trek</strong>{" "}
            collects, uses, stores, and protects information when you visit
            our website, purchase digital products, access ebooks, or contact
            us for support.
          </p>

          <p className="mt-4 text-sm text-gray-500">
            <strong>Last Updated:</strong> September 24, 2026
          </p>
        </div>

        {/* Important ebook notice */}
        <div className="mb-10 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="font-bold text-gray-900 text-lg mb-2">
            Important Notice for Digital Ebook Purchases
          </h2>

          <p className="text-gray-700 leading-7">
            Target Trek sells downloadable and/or digitally accessible
            educational products. Because an ebook is a digital product that
            may become available immediately after a successful purchase,
            purchases are generally{" "}
            <strong>non-refundable and non-returnable</strong>, subject to
            applicable law and the exceptions described below.
          </p>
        </div>

        <Section number="1" title="Introduction">
          <p>
            At <strong>Target Trek</strong>, we respect your privacy and take
            reasonable steps to protect the personal information you provide
            while using our website and services.
          </p>

          <p>
            This policy applies to information collected through the Target
            Trek website, ebook purchase process, payment-related workflows,
            digital product access pages, customer support communications,
            and other services operated by Target Trek.
          </p>

          <p>
            By using our website or services, you acknowledge this Privacy
            Policy. Where consent is legally required for a particular type
            of processing, we will request it separately.
          </p>
        </Section>

        <Section number="2" title="Information We Collect">
          <p>
            Depending on how you interact with Target Trek, we may collect
            the following categories of information:
          </p>

          <BulletList>
            <li>
              <strong>Identity Information:</strong> Your name or other
              information you provide during checkout or while contacting
              support.
            </li>

            <li>
              <strong>Contact Information:</strong> Your email address and
              other contact information you voluntarily provide.
            </li>

            <li>
              <strong>Purchase Information:</strong> Information about the
              ebook or digital product purchased, order reference, transaction
              reference, payment status, purchase amount, currency, and
              purchase date.
            </li>

            <li>
              <strong>Payment Information:</strong> Payments may be processed
              by third-party payment service providers. We may receive
              transaction identifiers, payment status, and other information
              necessary to verify your purchase. We do not intend to directly
              store your complete card details, UPI credentials, banking
              passwords, or similar sensitive payment credentials.
            </li>

            <li>
              <strong>Technical Information:</strong> We may collect
              information such as IP address, browser type, device type,
              operating system, referring page, timestamps, and website
              activity.
            </li>

            <li>
              <strong>Support Communications:</strong> If you contact us, we
              may retain your email address, order information, message, and
              our responses for customer support and record-keeping purposes.
            </li>

            <li>
              <strong>Analytics and Tracking Information:</strong> Where
              applicable, cookies and analytics technologies may collect
              information about how visitors interact with our website.
            </li>
          </BulletList>
        </Section>

        <Section number="3" title="How We Use Your Information">
          <p>
            We may use information collected through Target Trek for purposes
            including:
          </p>

          <BulletList>
            <li>Processing and verifying digital product purchases.</li>

            <li>
              Providing access to the ebook or digital product you purchased.
            </li>

            <li>
              Sending transactional or purchase-related communications.
            </li>

            <li>
              Responding to customer support requests and resolving access
              problems.
            </li>

            <li>
              Preventing duplicate transactions, fraud, abuse, unauthorized
              access, or misuse of our digital products.
            </li>

            <li>
              Maintaining records required for accounting, security,
              compliance, or dispute resolution.
            </li>

            <li>
              Monitoring website performance and improving our products,
              website, and user experience.
            </li>

            <li>
              Diagnosing technical problems and protecting the security of our
              systems.
            </li>

            <li>
              Sending promotional communications where permitted by law and,
              where required, after obtaining your consent.
            </li>

            <li>
              Complying with applicable legal, regulatory, tax, and
              contractual obligations.
            </li>
          </BulletList>
        </Section>

        <Section number="4" title="Ebook Purchases and Digital Access">
          <p>
            When you purchase an ebook from Target Trek, information associated
            with your transaction may be used to confirm payment and provide
            access to the purchased digital product.
          </p>

          <p>
            <strong>
              Ebook access links, download links, purchase tokens, and other
              access credentials are intended for the purchaser.
            </strong>{" "}
            You should not publicly share purchase-specific or access-specific
            links where doing so could allow unauthorized access to a paid
            product.
          </p>

          <p>
            Depending on the product and delivery method, access may be
            provided through a download, browser-based PDF viewer, temporary
            link, secure access page, or another digital delivery mechanism.
          </p>

          <p>
            You are responsible for entering a valid email address and
            accurately completing the information requested during checkout.
          </p>
        </Section>

        <Section number="5" title="Digital Product Refund Policy">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="font-bold text-gray-900">
              Digital ebook purchases are generally non-refundable and
              non-returnable once the digital product or access has been
              delivered, except where a refund or other remedy is required by
              applicable law.
            </p>
          </div>

          <p>
            Because digital products can be accessed, viewed, or downloaded
            immediately after delivery, they cannot ordinarily be returned in
            the same manner as physical goods.
          </p>

          <p>
            However, if you experience a genuine issue such as being charged
            more than once for the same purchase, successful payment without
            receiving the purchased product, or receiving an incorrect or
            inaccessible file, please contact us so we can investigate.
          </p>

          <p>
            Nothing in this policy is intended to exclude, restrict, or
            override any mandatory consumer rights or remedies available under
            applicable law.
          </p>
        </Section>

        <Section number="6" title="Payment Processing">
          <p>
            Payments for Target Trek products may be processed through
            third-party payment service providers. Those providers may collect
            and process payment-related information according to their own
            privacy policies and legal obligations.
          </p>

          <p>
            Target Trek may receive limited transaction information from a
            payment provider, such as:
          </p>

          <BulletList>
            <li>Transaction or payment reference.</li>
            <li>Order reference.</li>
            <li>Payment status.</li>
            <li>Transaction amount and currency.</li>
            <li>Information required to reconcile or verify the purchase.</li>
          </BulletList>

          <p>
            <strong>
              We do not ask customers to send us their banking password, UPI
              PIN, OTP, CVV, or complete card credentials by email.
            </strong>
          </p>
        </Section>

        <Section number="7" title="How We Share Information">
          <p>
            We do not sell your personal information. We may share limited
            information when reasonably necessary for operating our services,
            including with:
          </p>

          <BulletList>
            <li>
              <strong>Payment processors</strong> for processing and verifying
              transactions.
            </li>

            <li>
              <strong>Hosting and infrastructure providers</strong> used to
              operate our website, APIs, databases, or digital delivery
              systems.
            </li>

            <li>
              <strong>Email or communication providers</strong> used for
              transactional emails and customer support.
            </li>

            <li>
              <strong>Analytics and security providers</strong> used to
              understand website performance, detect abuse, or improve
              security.
            </li>

            <li>
              <strong>Professional advisers or authorities</strong> where
              disclosure is reasonably necessary to comply with applicable
              law, enforce our rights, respond to lawful requests, or protect
              users and our services.
            </li>
          </BulletList>

          <p>
            Third-party providers may process information according to their
            own terms and privacy policies.
          </p>
        </Section>

        <Section number="8" title="Cookies and Analytics">
          <p>
            Target Trek may use cookies, local storage, analytics tools, and
            similar technologies to operate the website, remember preferences,
            understand traffic, measure performance, and improve the user
            experience.
          </p>

          <p>
            Depending on your browser and applicable requirements, you may be
            able to block or delete cookies through your browser settings.
            Disabling certain cookies may affect website functionality.
          </p>
        </Section>

        <Section number="9" title="Data Security">
          <p>
            We use reasonable technical and organizational measures designed
            to protect information against unauthorized access, alteration,
            disclosure, loss, or misuse.
          </p>

          <p>
            These measures may include access controls, secure communications,
            transaction verification, restricted administrative access, and
            security monitoring where appropriate.
          </p>

          <p>
            However, no website, database, payment system, or internet
            transmission can be guaranteed to be completely secure.
          </p>
        </Section>

        <Section number="10" title="Data Retention">
          <p>
            We retain personal information only for as long as reasonably
            necessary for the purposes for which it was collected, including
            providing purchased products, customer support, transaction
            reconciliation, fraud prevention, accounting, legal compliance,
            and dispute resolution.
          </p>

          <p>
            Different categories of information may be retained for different
            periods depending on operational and legal requirements.
          </p>
        </Section>

        <Section number="11" title="Your Privacy Rights">
          <p>
            Depending on applicable law and your location, you may have rights
            relating to your personal information, which can include the right
            to:
          </p>

          <BulletList>
            <li>Request access to certain personal information we hold.</li>

            <li>
              Request correction of inaccurate or incomplete personal
              information.
            </li>

            <li>
              Request deletion of eligible personal information, subject to
              legal and operational retention requirements.
            </li>

            <li>
              Withdraw consent where processing is based on consent.
            </li>

            <li>
              Object to or request restriction of certain processing where
              applicable.
            </li>

            <li>
              Opt out of promotional communications where such an option is
              available.
            </li>
          </BulletList>

          <p>
            We may need to verify your identity or purchase information before
            responding to certain privacy requests.
          </p>
        </Section>

        <Section number="12" title="Children's Privacy">
          <p>
            Target Trek's products are primarily educational resources intended
            for learners, developers, professionals, and interview candidates.
            We do not knowingly seek to collect personal information from
            children in violation of applicable law.
          </p>

          <p>
            If you believe personal information relating to a child has been
            provided to us improperly, please contact us so the matter can be
            reviewed.
          </p>
        </Section>

        <Section number="13" title="Intellectual Property and Ebook Usage">
          <p>
            Purchasing an ebook gives the purchaser access to the digital
            product for personal use subject to the applicable purchase terms.
            Unless expressly permitted, purchasing an ebook does not transfer
            ownership of Target Trek's intellectual property rights.
          </p>

          <p>
            <strong>
              You should not reproduce, resell, redistribute, publicly upload,
              or commercially distribute paid Target Trek ebooks without
              authorization.
            </strong>
          </p>

          <p>
            This section describes product usage expectations and does not
            limit any rights available to you under applicable law.
          </p>
        </Section>

        <Section number="14" title="Third-Party Websites and Services">
          <p>
            Our website may contain links to websites, payment services,
            platforms, or other services operated by third parties.
          </p>

          <p>
            Target Trek does not control the privacy practices of independent
            third parties. We recommend reviewing their applicable privacy
            policies before providing information directly to them.
          </p>
        </Section>

        <Section number="15" title="Changes to This Privacy Policy">
          <p>
            We may update this Privacy Policy from time to time to reflect
            changes to our website, products, business practices, technology,
            or applicable requirements.
          </p>

          <p>
            When the policy is updated, the revised version will be published
            on this page and the <strong>Last Updated</strong> date may be
            changed accordingly.
          </p>
        </Section>

        <Section number="16" title="Ebook Support and Privacy Contact">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <p className="font-bold text-gray-900 mb-2">
              Target Trek Ebook Support
            </p>

            <p>
              For ebook purchase issues, payment confirmation, access
              problems, incorrect files, privacy questions, or other
              ebook-related support, contact:
            </p>

            <p className="mt-3">
              <strong>Email:</strong>{" "}
              <a
                href="mailto:supporttargettrek@gmail.com"
                className="font-bold text-blue-700 hover:text-blue-900 underline"
              >
                supporttargettrek@gmail.com
              </a>
            </p>

            <p className="mt-3 text-sm text-gray-600">
              When contacting support about a purchase, please include the
              email address used during checkout and your order or transaction
              reference where available.{" "}
              <strong>
                Never send your OTP, UPI PIN, CVV, banking password, or full
                card details by email.
              </strong>
            </p>
          </div>
        </Section>

        {/* Final notice */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500 leading-6">
            This Privacy Policy should be read together with any applicable
            Terms & Conditions, purchase terms, refund terms, and notices
            displayed during checkout or digital product delivery.
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

export default PrivacyPolicy;