import React from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";

const RefundPolicy = () => {
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
        <title>Refund Policy | Target Trek</title>

        <meta
          name="description"
          content="Read Target Trek's refund and cancellation policy for ebooks and digital educational products, including duplicate payments, failed delivery, incorrect files, and digital product access."
        />

        <link
          rel="canonical"
          href="https://www.targettrek.in/refund-policy"
        />
      </Helmet>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">

        {/* HEADER */}
        <div className="border-b border-gray-200 pb-8 mb-10">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-3">
            Target Trek
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-950">
            Refund & Cancellation Policy
          </h1>

          <p className="mt-4 max-w-3xl text-gray-600 leading-7">
            This Refund & Cancellation Policy explains the circumstances
            in which a refund, replacement, or other resolution may be
            available when purchasing ebooks or other digital products
            from <strong>Target Trek</strong>.
          </p>

          <p className="mt-4 text-sm text-gray-500">
            <strong>Last Updated:</strong> September 24, 2026
          </p>
        </div>

        {/* IMPORTANT NOTICE */}
        <div className="mb-10 rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Important: Digital Products Are Generally Non-Refundable
          </h2>

          <p className="text-gray-700 leading-7">
            Target Trek primarily sells{" "}
            <strong>digital ebooks and educational resources</strong>.
            These products may become available immediately after a
            successful payment.
          </p>

          <p className="mt-3 text-gray-700 leading-7">
            Because a digital product can be accessed, viewed, saved, or
            downloaded after delivery, purchases are generally{" "}
            <strong>non-refundable and non-returnable once delivered</strong>,
            except where an eligible issue described in this policy occurs
            or where a refund or other remedy is required by applicable law.
          </p>
        </div>

        {/* 1 */}
        <Section number="1" title="Scope of This Policy">
          <p>
            This policy applies to digital products purchased directly
            through the Target Trek website, including:
          </p>

          <BulletList>
            <li>Digital ebooks.</li>
            <li>PDF books and guides.</li>
            <li>Interview preparation material.</li>
            <li>Technical learning resources.</li>
            <li>Digital study material.</li>
            <li>Other downloadable or digitally accessible products.</li>
          </BulletList>

          <p>
            If a particular product has additional refund or purchase
            conditions, those conditions may also be displayed on its
            product or checkout page.
          </p>
        </Section>

        {/* 2 */}
        <Section number="2" title="Digital Product Delivery">
          <p>
            Target Trek products are primarily delivered electronically.
            Depending on the product, delivery may occur through:
          </p>

          <BulletList>
            <li>A PDF or another downloadable digital file.</li>

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
              An email containing access or purchase information.
            </li>

            <li>
              Another electronic delivery method specified during
              purchase.
            </li>
          </BulletList>

          <p>
            A digital product will generally be considered delivered when
            the purchased file, download option, viewer, access page, or
            equivalent method of accessing the product has been made
            available to the purchaser.
          </p>
        </Section>

        {/* 3 */}
        <Section number="3" title="General No-Refund Policy">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-bold text-gray-900 leading-7">
              Once an ebook or digital product has been successfully
              delivered or made accessible, the purchase is generally
              final and is not eligible for a refund merely because the
              customer changes their mind.
            </p>
          </div>

          <p>
            Digital products differ from physical products because they
            cannot ordinarily be returned after they have been accessed,
            copied, saved, or downloaded.
          </p>

          <p>
            Customers should therefore carefully review the{" "}
            <strong>
              product title, description, topics covered, edition,
              language, format, price, and other available information
            </strong>{" "}
            before completing a purchase.
          </p>
        </Section>

        {/* 4 */}
        <Section number="4" title="When a Refund or Resolution May Be Available">
          <p>
            Although digital purchases are generally non-refundable, we
            will review genuine purchase or delivery problems.
          </p>

          <p>
            A refund, replacement, restored access, or another appropriate
            resolution may be considered in situations including:
          </p>

          <BulletList>
            <li>
              <strong>Duplicate Payment:</strong> You were charged more
              than once for the same intended purchase.
            </li>

            <li>
              <strong>Payment Completed but Product Not Delivered:</strong>{" "}
              Your payment was successfully completed, but you did not
              receive access to the purchased digital product.
            </li>

            <li>
              <strong>Incorrect Product:</strong> The digital product
              delivered to you is materially different from the product
              you purchased.
            </li>

            <li>
              <strong>Corrupted or Unusable File:</strong> The delivered
              file is technically corrupted or cannot reasonably be
              opened and we are unable to provide a working replacement.
            </li>

            <li>
              <strong>Technical Delivery Failure:</strong> A problem with
              our delivery system prevents you from receiving the product
              and we are unable to restore access.
            </li>

            <li>
              <strong>Legal Requirement:</strong> A refund, replacement,
              or other remedy is required under applicable law.
            </li>
          </BulletList>

          <p>
            Depending on the circumstances, Target Trek may first attempt
            to resolve the issue by providing the correct product,
            replacing a corrupted file, or restoring access.
          </p>
        </Section>

        {/* 5 */}
        <Section number="5" title="Situations That Are Generally Not Eligible for a Refund">
          <p>
            Subject to applicable law, refunds generally will not be
            provided solely because:
          </p>

          <BulletList>
            <li>
              You changed your mind after purchasing the ebook.
            </li>

            <li>
              You purchased the product accidentally but subsequently
              accessed, viewed, or downloaded it.
            </li>

            <li>
              You no longer need the ebook.
            </li>

            <li>
              You expected topics or features that were not stated in
              the product description.
            </li>

            <li>
              You did not read the product description before purchasing.
            </li>

            <li>
              You already knew some or all of the material covered in
              the ebook.
            </li>

            <li>
              You found similar information elsewhere after purchasing
              the product.
            </li>

            <li>
              You did not achieve a particular interview, examination,
              employment, salary, or learning outcome.
            </li>

            <li>
              You do not like the writing style, formatting, design, or
              presentation after accessing the product.
            </li>

            <li>
              Your device does not support the file because of
              device-specific software or configuration issues that are
              outside our reasonable control.
            </li>

            <li>
              You shared, redistributed, copied, or otherwise misused the
              purchased product in violation of our Terms & Conditions.
            </li>
          </BulletList>
        </Section>

        {/* 6 */}
        <Section number="6" title="Duplicate Payments">
          <p>
            If you believe you were charged more than once for the same
            intended order, contact Target Trek ebook support.
          </p>

          <p>
            Please provide enough information for us to identify the
            transactions, such as:
          </p>

          <BulletList>
            <li>The email address used during checkout.</li>
            <li>The product purchased.</li>
            <li>Order reference, if available.</li>
            <li>Transaction reference, if available.</li>
            <li>Date and approximate time of payment.</li>
            <li>Amount charged.</li>
          </BulletList>

          <p>
            We will review the transaction records. If an unintended
            duplicate charge is confirmed, an appropriate refund or
            resolution may be processed.
          </p>
        </Section>

        {/* 7 */}
        <Section
          number="7"
          title="Payment Successful but Ebook Not Received"
        >
          <p>
            If your payment is successfully completed but you do not
            receive access to the ebook, please first:
          </p>

          <BulletList>
            <li>
              Check whether the success or download page is still open.
            </li>

            <li>
              Check the email address used during the purchase.
            </li>

            <li>
              Check your spam, promotions, or junk email folders if
              delivery information was sent by email.
            </li>

            <li>
              Verify that the transaction actually shows as successfully
              completed rather than pending or failed.
            </li>
          </BulletList>

          <p>
            If you still cannot access the purchased ebook, contact our
            support team. We may verify the transaction and restore
            access or provide the appropriate product where possible.
          </p>

          <p>
            If a successful purchase cannot reasonably be fulfilled, we
            may provide another appropriate remedy, including a refund
            where applicable.
          </p>
        </Section>

        {/* 8 */}
        <Section number="8" title="Failed, Pending, or Cancelled Payments">
          <p>
            A failed, cancelled, or pending transaction does not
            necessarily mean that Target Trek has received the payment.
          </p>

          <p>
            In some cases, your bank or payment provider may temporarily
            show an authorization or debit even though the transaction
            did not successfully complete.
          </p>

          <p>
            Such transactions may be automatically reversed by the bank
            or payment provider according to their processing timelines.
          </p>

          <p>
            If a transaction remains unresolved, contact your bank or
            payment provider as appropriate. You may also contact Target
            Trek support so that we can check whether our records show a
            successful payment.
          </p>
        </Section>

        {/* 9 */}
        <Section number="9" title="Incorrect or Corrupted Ebook">
          <p>
            If the file delivered is corrupted, materially incomplete,
            or is not the product you purchased, please contact support.
          </p>

          <p>
            Where possible, our first step will generally be to:
          </p>

          <BulletList>
            <li>Provide a working replacement file.</li>
            <li>Provide the correct purchased product.</li>
            <li>Restore access to the correct ebook.</li>
            <li>Resolve the underlying technical problem.</li>
          </BulletList>

          <p>
            If we cannot provide the purchased digital product after
            confirming the issue, an appropriate refund or other remedy
            may be considered.
          </p>
        </Section>

        {/* 10 */}
        <Section number="10" title="Refund Request Process">
          <p>
            To request review of an eligible purchase issue, email:
          </p>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <p className="font-bold text-gray-900">
              Target Trek Ebook Support
            </p>

            <p className="mt-3">
              <strong>Email:</strong>{" "}
              <a
                href="mailto:supporttargettrek@gmail.com"
                className="font-bold text-blue-700 underline hover:text-blue-900"
              >
                supporttargettrek@gmail.com
              </a>
            </p>
          </div>

          <p>
            Please include, where available:
          </p>

          <BulletList>
            <li>Your name.</li>
            <li>The email address used during checkout.</li>
            <li>The name of the ebook purchased.</li>
            <li>Your order reference.</li>
            <li>Your transaction/payment reference.</li>
            <li>The amount paid.</li>
            <li>The date of purchase.</li>
            <li>A clear description of the issue.</li>
          </BulletList>

          <p>
            Providing complete information helps us locate and review
            your transaction more efficiently.
          </p>
        </Section>

        {/* 11 */}
        <Section number="11" title="Do Not Share Sensitive Payment Information">
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="font-bold text-gray-900 leading-7">
              Never send your UPI PIN, OTP, CVV, banking password,
              complete debit/credit card number, or internet banking
              password to Target Trek by email.
            </p>
          </div>

          <p>
            We may request an order number, transaction reference, amount,
            date, or other limited information needed to identify your
            purchase, but we do not need your banking password, PIN, OTP,
            or CVV to review an ebook purchase issue.
          </p>
        </Section>

        {/* 12 */}
        <Section number="12" title="Refund Processing">
          <p>
            If a refund is approved, it will generally be initiated using
            the appropriate payment or transaction channel available to
            us.
          </p>

          <p>
            After a refund has been initiated, the time required for the
            amount to appear in your account may depend on your bank,
            payment provider, card network, or other financial
            institution.
          </p>

          <p>
            Target Trek does not control the processing time of a bank or
            independent payment provider after a refund has been
            successfully initiated from our side.
          </p>
        </Section>

        {/* 13 */}
        <Section number="13" title="Cancellation Policy">
          <p>
            Digital products are often processed and delivered
            automatically after successful payment.
          </p>

          <p>
            As a result, an order generally{" "}
            <strong>
              cannot be cancelled after the digital product has been
              delivered or access has been provided
            </strong>.
          </p>

          <p>
            If you contact us before digital delivery has occurred, we
            may review the request, but cancellation is not guaranteed
            where automated processing has already begun.
          </p>
        </Section>

        {/* 14 */}
        <Section number="14" title="Promotional and Discounted Purchases">
          <p>
            Products purchased during a sale, launch offer, promotional
            campaign, coupon offer, or discounted period remain subject
            to this Refund & Cancellation Policy unless the specific
            promotion expressly states otherwise.
          </p>

          <p>
            A later change in the price of an ebook does not by itself
            create an entitlement to a refund or reimbursement of the
            difference.
          </p>
        </Section>

        {/* 15 */}
        <Section number="15" title="Product Updates and New Editions">
          <p>
            Target Trek may update an ebook or release a new edition in
            the future.
          </p>

          <p>
            Purchasing an existing edition does not automatically entitle
            the purchaser to a refund because a newer edition, revised
            product, discounted version, or additional resource becomes
            available later.
          </p>

          <p>
            Access to future editions or updates will depend on the terms
            associated with the particular product.
          </p>
        </Section>

        {/* 16 */}
        <Section number="16" title="Interview and Learning Outcomes">
          <p>
            Target Trek ebooks are educational resources. Purchasing an
            ebook does not guarantee:
          </p>

          <BulletList>
            <li>Employment or an internship.</li>
            <li>An interview call.</li>
            <li>Selection in an interview.</li>
            <li>A particular examination result.</li>
            <li>A particular salary.</li>
            <li>A specific professional outcome.</li>
          </BulletList>

          <p>
            Failure to achieve a particular educational, interview, or
            career outcome is not by itself a basis for a refund.
          </p>
        </Section>

        {/* 17 */}
        <Section number="17" title="Unauthorized Sharing or Redistribution">
          <p>
            Target Trek ebooks are licensed for personal use unless
            otherwise stated.
          </p>

          <p>
            Customers must not unlawfully resell, publicly upload,
            redistribute, or share paid ebooks or protected purchase
            links.
          </p>

          <p>
            Refund requests associated with fraudulent activity,
            unauthorized redistribution, abuse of access controls, or
            other material violations of our Terms & Conditions may be
            denied to the extent permitted by applicable law.
          </p>
        </Section>

        {/* 18 */}
        <Section number="18" title="Chargebacks and Payment Disputes">
          <p>
            If you experience a legitimate purchase problem, we encourage
            you to contact Target Trek support first so that we can
            investigate and attempt to resolve the issue.
          </p>

          <p>
            We may provide transaction and digital delivery records to
            payment providers, banks, or other relevant parties where
            reasonably necessary to respond to a payment dispute or
            chargeback.
          </p>

          <p>
            Nothing in this section prevents you from exercising any
            rights available to you under applicable law or through your
            payment provider.
          </p>
        </Section>

        {/* 19 */}
        <Section number="19" title="Consumer Rights">
          <p>
            This Refund & Cancellation Policy is intended to describe
            Target Trek's general policy for digital products.
          </p>

          <p>
            <strong>
              Nothing in this policy is intended to exclude, waive, or
              restrict any consumer right, statutory guarantee, refund,
              replacement, or other remedy that cannot legally be
              excluded under applicable law.
            </strong>
          </p>

          <p>
            Where this policy conflicts with a mandatory legal
            requirement, the applicable legal requirement will prevail
            to the extent of that conflict.
          </p>
        </Section>

        {/* 20 */}
        <Section number="20" title="Changes to This Refund Policy">
          <p>
            Target Trek may update this Refund & Cancellation Policy from
            time to time to reflect changes in our products, payment
            processes, business practices, or applicable requirements.
          </p>

          <p>
            The updated policy will be published on this page and the{" "}
            <strong>Last Updated</strong> date may be changed accordingly.
          </p>
        </Section>

        {/* 21 */}
        <Section number="21" title="Contact Target Trek Ebook Support">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Need Help With Your Ebook Purchase?
            </h3>

            <p>
              For duplicate payments, missing ebooks, incorrect files,
              corrupted downloads, payment confirmation, or other
              ebook-related purchase issues:
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
              Please include the{" "}
              <strong>email address used during checkout</strong>, the{" "}
              <strong>ebook name</strong>, and your{" "}
              <strong>order or transaction reference</strong> where
              available.
            </p>

            <p className="mt-3 text-sm font-bold text-gray-700">
              Do not send your OTP, UPI PIN, CVV, banking password, or
              complete card information.
            </p>
          </div>
        </Section>

        {/* FOOTER */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-sm text-gray-500 leading-6">
            This Refund & Cancellation Policy should be read together
            with Target Trek's <strong>Terms & Conditions</strong>,{" "}
            <strong>Privacy Policy</strong>, and any product-specific
            information displayed before purchase.
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

export default RefundPolicy;