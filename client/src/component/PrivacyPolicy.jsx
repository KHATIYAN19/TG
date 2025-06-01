import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 mt-20"
    >
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">
        Privacy Policy for Target Trek
      </h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          1. Introduction
        </h2>
        <p className="text-gray-700 leading-relaxed">
          At Target Trek, we are committed to protecting your privacy and ensuring
          the security of your personal information. This Privacy Policy outlines
          how we collect, use, disclose, and safeguard your data when you visit
          our website or use our services. By accessing or using our website, you
          consent to the practices described in this policy.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          2. Information We Collect
        </h2>
        <p className="text-gray-700 leading-relaxed">
          We may collect the following types of information from you:
        </p>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2">
          <li>
            **Personal Information:** This includes your name, email address, phone
            number, and any other information you voluntarily provide when
            contacting us, subscribing to our newsletter, or filling out forms on
            our website.
          </li>
          <li>
            **Usage Data:** We may collect information about how you interact with
            our website, such as the pages you visit, the time and date of your
            visit, the links you click, your IP address, browser type, and operating
            system. This data helps us analyze trends and improve our website's
            functionality.
          </li>
          <li>
            **Cookies and Tracking Technologies:** We use cookies and similar
            tracking technologies to enhance your browsing experience, personalize
            content, and gather information about website usage. You can manage
            your cookie preferences through your browser settings.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          3. How We Use Your Information
        </h2>
        <p className="text-gray-700 leading-relaxed">
          We may use your information for the following purposes:
        </p>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2">
          <li>To provide and maintain our website and services.</li>
          <li>To respond to your inquiries and provide customer support.</li>
          <li>To personalize your experience on our website.</li>
          <li>To send you newsletters, marketing communications, and updates about
            our services (if you have opted in to receive them).
          </li>
          <li>To analyze website usage and improve our content and functionality.</li>
          <li>To detect, prevent, and address technical issues and security
            incidents.
          </li>
          <li>To comply with legal obligations.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          4. Sharing Your Information
        </h2>
        <p className="text-gray-700 leading-relaxed">
          We may share your information with third parties in the following
          circumstances:
        </p>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2">
          <li>
            **Service Providers:** We may engage third-party service providers to
            assist us with website hosting, data analysis, email marketing, and
            other services. These providers are contractually obligated to protect
            your information and only use it for the purposes we specify.
          </li>
          <li>
            **Business Transfers:** In the event of a merger, acquisition, or sale
            of all or a portion of our assets, your information may be transferred
            as part of the transaction, subject to the terms of this Privacy Policy.
          </li>
          <li>
            **Legal Requirements:** We may disclose your information if required to
            do so by law or in response to a valid legal request, such as a court
            order or government investigation.
          </li>
          <li>
            **With Your Consent:** We may share your information with third parties
            when we have your explicit consent to do so.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          5. Data Security
        </h2>
        <p className="text-gray-700 leading-relaxed">
          We take reasonable measures to protect your personal information from
          unauthorized access, use, or disclosure. These measures include technical,
          administrative, and physical safeguards. However, please understand that
          no method of data transmission over the internet or electronic storage
          is completely secure, and we cannot guarantee absolute security.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          6. Your Rights
        </h2>
        <p className="text-gray-700 leading-relaxed">
          You have certain rights regarding your personal information, including:
        </p>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2">
          <li>
            **Access:** You have the right to request access to the personal
            information we hold about you.
          </li>
          <li>
            **Correction:** You can request that we correct any inaccurate or
            incomplete personal information.
          </li>
          <li>
            **Deletion:** You can request the deletion of your personal
            information, subject to certain exceptions.
          </li>
          <li>
            **Objection to Processing:** You may object to the processing of your
            personal information for certain purposes, such as direct marketing.
          </li>
          <li>
            **Data Portability:** You may have the right to receive your personal
            information in a structured, commonly used, and machine-readable
            format.
          </li>
          <li>
            **Withdrawal of Consent:** If we rely on your consent to process your
            personal information, you have the right to withdraw your consent at
            any time.
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-2">
          To exercise any of these rights, please contact us using the information
          provided below. We may require you to verify your identity before
          responding to your request.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          7. Cookies and Tracking Technologies
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Our website uses cookies and similar tracking technologies to collect
          information about your browsing activities. Cookies are small text files
          that are stored on your device when you visit a website. We use cookies
          for purposes such as:
        </p>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2">
          <li>To remember your preferences and settings.</li>
          <li>To analyze how you use our website.</li>
          <li>To personalize content and advertisements.</li>
          <li>To improve website performance and security.</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-2">
          You can control cookies through your browser settings. Most browsers
          allow you to block or delete cookies. However, please note that disabling
          cookies may affect the functionality and user experience of our website.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          8. Third-Party Links
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Our website may contain links to third-party websites or services that
          are not operated by us. We are not responsible for the privacy practices
          of these third-party websites. We encourage you to review the privacy
          policies of any website you visit.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          9. Changes to This Privacy Policy
        </h2>
        <p className="text-gray-700 leading-relaxed">
          We may update this Privacy Policy from time to time to reflect changes
          in our practices or legal requirements. We will post any changes on this
          page and update the "Last Updated" date at the top. We encourage you to
          review this Privacy Policy periodically. Your continued use of our
          website after any changes constitutes your acceptance of the revised
          Privacy Policy.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          10. Contact Us
        </h2>
        <p className="text-gray-700 leading-relaxed">
          If you have any questions about this Privacy Policy or our privacy
          practices, please contact us at:
        </p>
        <p className="text-gray-700 leading-relaxed">
          Email: <a href="mailto:enquiry@targettrek.in">enquiry@targettrek.in</a>
        </p>
        <p className="text-gray-700 leading-relaxed">
          Phone: <a href="tel:+919536681633">+91 98732 08210</a>
        </p>
      </section>
    </motion.div>
  );
};

export default PrivacyPolicy;