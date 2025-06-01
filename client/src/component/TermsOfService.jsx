import React from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

const TermsOfService = () => {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  const termsOfServiceTitle = 'Terms of Service | Target Trek - Your Digital Marketing Guide';
  const termsOfServiceDescription =
    'Read Target Trek\'s Terms of Service for using our website and services. Understand your rights and responsibilities, our service description, disclaimers, and limitations of liability.';

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="container mx-auto py-10 px-4 sm:px-6 lg:px-8"
    >
      <Helmet>
        <title>{termsOfServiceTitle}</title>
        <meta name="description" content={termsOfServiceDescription} />
        <link rel="canonical" href="https://yourwebsite.com/terms-of-service" />
      </Helmet>

      <h1 className="text-3xl font-semibold text-gray-900 mb-6 mt-20">
        Terms of Service for Target Trek
      </h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          1. Acceptance of Terms
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Welcome to Target Trek. By accessing or using our website,
          https://yourwebsite.com (the "Website"), and any services provided by
          us ("Services"), you agree to be bound by these Terms of Service ("Terms").
          These Terms constitute a legal agreement between you and Target Trek. If
          you do not agree with any part of these Terms, you must not access or
          use our Website or Services.  These terms are governed by the laws of India.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          2. Description of Services
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Target Trek provides digital marketing services, including but not limited
          to:
        </p>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2">
          <li>Email Marketing</li>
          <li>Social Media Marketing (SMM)</li>
          <li>Content Marketing</li>
          <li>Website Design and Development</li>
          <li>Affiliate Marketing</li>
          <li>Other related digital marketing services.</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          The specific details and scope of the Services will be outlined in a
          separate agreement or proposal provided to you. We reserve the right to
          modify or discontinue any Service at any time with or without notice.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          3. User Conduct
        </h2>
        <p className="text-gray-700 leading-relaxed">
          You agree to use the Website and Services only for lawful purposes and
          in a manner that does not violate these Terms or any applicable laws and
          regulations in India, including but not limited to the Information
          Technology Act, 2000, and its amendments. You agree not to:
        </p>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2">
          <li>
            Engage in any activity that is illegal, fraudulent, or harmful, or that
            facilitates such activity.
          </li>
          <li>
            Transmit any content that is defamatory, obscene, pornographic,
            offensive, or otherwise objectionable.
          </li>
          <li>
            Impersonate any person or entity, or falsely state or misrepresent
            your affiliation with any person or entity.
          </li>
          <li>
            Interfere with or disrupt the operation of the Website or Services,
            including hacking, transmitting viruses, or engaging in denial-of-service
            attacks.
          </li>
          <li>
            Violate or infringe upon the intellectual property rights of Target Trek
            or any third party.
          </li>
          <li>
            Collect or harvest any information about other users without their
            consent.
          </li>
          <li>
            Use any automated system, including robots, spiders, or scrapers, to
            access the Website or Services without our express written permission.
          </li>
          <li>
            Circumvent any security measures or access controls on the Website or
            Services.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          4. Intellectual Property
        </h2>
        <p className="text-gray-700 leading-relaxed">
          The Website and its original content, features, and functionality,
          including but not limited to text, graphics, logos, images, software, and
          code, are owned by Target Trek and are protected by copyright, trademark,
          and other intellectual property laws in India and internationally.
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          You may not reproduce, modify, distribute, display, perform, or create
          derivative works of any part of the Website or Services without our
          express written consent.
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          Any trademarks, service marks, and trade names of Target Trek used on the
          Website are trademarks or registered trademarks of Target Trek.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          5. User-Generated Content
        </h2>
        <p className="text-gray-700 leading-relaxed">
          If you submit, post, or upload any content to the Website or through the
          Services ("User-Generated Content"), you retain ownership of that content.
          However, you grant Target Trek a non-exclusive, worldwide, royalty-free,
          perpetual, irrevocable, and sublicensable license to use, reproduce,
          modify, adapt, publish, translate, create derivative works from,
          distribute, and display such User-Generated Content in connection with
          providing and promoting the Website and Services.
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          You represent and warrant that you have the necessary rights to grant
          this license and that your User-Generated Content does not violate any
          third-party rights or applicable laws, including those related to
          defamation, privacy, and intellectual property.
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          We have the right to remove or disable access to any User-Generated
          Content that we believe violates these Terms or is otherwise
          objectionable.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          6. Disclaimer of Warranties
        </h2>
        <p className="text-gray-700 leading-relaxed">
          The Website and Services are provided on an "as is" and "as available"
          basis. To the fullest extent permitted by applicable law in India, Target Trek
          disclaims all warranties, express or implied, including but not limited to
          implied warranties of merchantability, fitness for a particular purpose,
          and non-infringement.
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          Target Trek does not warrant that the Website or Services will be
          uninterrupted, error-free, secure, or free from viruses or other harmful
          components. We do not warrant the accuracy, completeness, or reliability
          of any content or information provided through the Website or Services.
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          You acknowledge and agree that your use of the Website and Services is
          at your sole risk.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          7. Limitation of Liability
        </h2>
        <p className="text-gray-700 leading-relaxed">
          To the fullest extent permitted by applicable law in India, Target Trek
          shall not be liable for any direct, indirect, incidental, special,
          consequential, or punitive damages, including but not limited to damages
          for loss of profits, goodwill, use, data, or other intangible losses,
          arising out of or relating to your use of or inability to use the
          Website or Services, even if Target Trek has been advised of the
          possibility of such damages.
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          In no event shall Target Trek's total liability to you for all claims
          arising out of or relating to these Terms or the Website or Services
          exceed the amount you paid to Target Trek, if any, for access to the
          Services.
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          Some jurisdictions may not allow the exclusion or limitation of liability
          for certain types of damages, so some of the above limitations may not
          apply to you to the extent prohibited by applicable law.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          8. Indemnification
        </h2>
        <p className="text-gray-700 leading-relaxed">
          You agree to indemnify, defend, and hold harmless Target Trek and its
          officers, directors, employees, and agents from and against any and all
          claims, liabilities, damages, losses, costs, and expenses, including
          reasonable attorneys' fees, arising out of or relating to:
        </p>
        <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2">
          <li>Your use of the Website or Services.</li>
          <li>Your breach of these Terms.</li>
          <li>
            Your violation of any applicable law or regulation, including those of
            India.
          </li>
          <li>
            Your User-Generated Content.
          </li>
          <li>
            Your violation of any third-party rights, including intellectual
            property rights.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          9. Governing Law and Dispute Resolution
        </h2>
        <p className="text-gray-700 leading-relaxed">
          These Terms shall be governed by and construed in accordance with the
          laws of India, without regard to its conflict of laws principles.
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          Any dispute arising out of or relating to these Terms or the Website or
          Services shall be subject to the exclusive jurisdiction of the courts
          located in [Specify the city and state, e.g., Noida, Uttar Pradesh], India.
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          You agree to attempt to resolve any dispute amicably through negotiation
          before resorting to litigation.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          10. Termination
        </h2>
        <p className="text-gray-700 leading-relaxed">
          We may terminate or suspend your access to the Website and/or Services
          at any time, with or without cause, and with or without notice, including
          if we believe that you have violated these Terms.
        </p>
        <p className="text-gray-700 leading-relaxed mt-4">
          Upon termination, your right to use the Website and Services will
          immediately cease. Any provisions of these Terms that by their nature
          should survive termination shall survive, including but not limited to
          Sections 4 (Intellectual Property), 6 (Disclaimer of Warranties), 7
          (Limitation of Liability), 8 (Indemnification), and 9 (Governing Law and
          Dispute Resolution).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          11. Changes to These Terms
        </h2>
        <p className="text-gray-700 leading-relaxed">
          We may update these Terms from time to time to reflect changes in our
          practices or legal requirements. We will post any changes on this page
          and update the "Last Updated" date at the top. We encourage you to
          review these Terms periodically. Your continued use of the Website or
          Services after any changes constitutes your acceptance of the revised
          Terms.
        </p>
      </section>

      <section className="mt-20">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          12. Contact Us
        </h2>
        <p className="text-gray-700 leading-relaxed">
          If you have any questions about these Terms of Service, please contact
          us at:
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

export default TermsOfService;

