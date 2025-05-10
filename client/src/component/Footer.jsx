import React from 'react';
import { FaInstagram, FaLinkedin, FaFacebook, FaWhatsapp } from 'react-icons/fa';
import { MdEmail, MdPhone } from 'react-icons/md';
import { AiOutlineArrowRight } from 'react-icons/ai';
import { BiCompass } from 'react-icons/bi';
import { motion } from 'framer-motion';

const Footer = () => {
  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: 'easeInOut',
      },
    },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        delay: 0.2,
      },
    },
  };

  const linkHover = {
    hover: { scale: 1.05, color: '#f5f5f5' },
    transition: { type: 'spring', stiffness: 300 },
  };

  return (
    <motion.footer
      variants={footerVariants}
      initial="hidden"
      animate="visible"
      className="w-full bg-gradient-to-r from-blue-900 to-purple-900 text-white py-12 md:py-16 lg:py-20 border-t border-purple-800/50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* About Us Section */}
          <div className="space-y-6">
            <motion.h3
              variants={fadeInUp}
              className="text-lg md:text-xl font-semibold text-white flex items-center gap-2"
            >
              <BiCompass className="w-6 h-6 text-blue-400" />
              About Target Trek
            </motion.h3>
            <motion.p
              variants={fadeInUp}
              className="text-sm md:text-base text-gray-200 leading-relaxed"
            >
              Target Trek is your guide to digital marketing success. We're
              passionate about helping you reach your goals and navigate the
              online landscape.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex space-x-4">
              <motion.a
                href="http://www.instagram.com/target_trek"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-300 transition-colors"
                variants={linkHover}
                whileHover="hover"
              >
                <FaInstagram className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="https://www.facebook.com/targettreks/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-300 transition-colors"
                variants={linkHover}
                whileHover="hover"
              >
                <FaFacebook className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="https://www.linkedin.com/company/target-trek/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-300 transition-colors"
                variants={linkHover}
                whileHover="hover"
              >
                <FaLinkedin className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="https://wa.me/919536681633"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-300 transition-colors"
                variants={linkHover}
                whileHover="hover"
              >
                <FaWhatsapp className="w-6 h-6" />
              </motion.a>
            </motion.div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-6">
            <motion.h3
              variants={fadeInUp}
              className="text-lg md:text-xl font-semibold text-white"
            >
              Contact Us
            </motion.h3>
            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-2 text-sm md:text-base text-gray-200"
            >
              <MdEmail className="w-5 h-5 text-purple-300" />
              <a
                href="mailto:enquiry@targettrek.in"
                className="hover:text-purple-300 transition-colors"
                variants={linkHover}
                whileHover="hover"
              >
                enquiry@targettrek.in
              </a>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-2 text-sm md:text-base text-gray-200"
            >
              <MdPhone className="w-5 h-5 text-purple-300" />
              <a
                href="tel:+919536681633"
                className="hover:text-purple-300 transition-colors"
                variants={linkHover}
                whileHover="hover"
              >
                +91 95366 81633
              </a>
            </motion.div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-6">
            <motion.h3
              variants={fadeInUp}
              className="text-lg md:text-xl font-semibold text-white"
            >
              Quick Links
            </motion.h3>
            <motion.ul variants={fadeInUp} className="space-y-2">
              <li>
                <a
                  href="/services"
                  className="text-sm md:text-base text-gray-200 hover:text-purple-300 transition-colors flex items-center gap-2 hover:underline"
                  variants={linkHover}
                  whileHover="hover"
                >
                  <AiOutlineArrowRight className="w-4 h-4 text-purple-300" />
                  Services
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-sm md:text-base text-gray-200 hover:text-purple-300 transition-colors flex items-center gap-2 hover:underline"
                  variants={linkHover}
                  whileHover="hover"
                >
                  <AiOutlineArrowRight className="w-4 h-4 text-purple-300" />
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/portfolio"
                  className="text-sm md:text-base text-gray-200 hover:text-purple-300 transition-colors flex items-center gap-2 hover:underline"
                  variants={linkHover}
                  whileHover="hover"
                >
                  <AiOutlineArrowRight className="w-4 h-4 text-purple-300" />
                  Our Work
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-sm md:text-base text-gray-200 hover:text-purple-300 transition-colors flex items-center gap-2 hover:underline"
                  variants={linkHover}
                  whileHover="hover"
                >
                  <AiOutlineArrowRight className="w-4 h-4 text-purple-300" />
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/blogs"
                  className="text-sm md:text-base text-gray-200 hover:text-purple-300 transition-colors flex items-center gap-2 hover:underline"
                  variants={linkHover}
                  whileHover="hover"
                >
                  <AiOutlineArrowRight className="w-4 h-4 text-purple-300" />
                  Blog
                </a>
              </li>
            </motion.ul>
          </div>
        </div>
        <motion.div
          variants={fadeInUp}
          className="mt-12 pt-8 border-t border-purple-800/50 text-center text-sm text-gray-300"
        >
          &copy; {new Date().getFullYear()} Target Trek. All rights reserved. |
          <a
            href="/privacy-policy"
            className="hover:text-purple-200 transition-colors underline"
          >
            Privacy Policy
          </a>{' '}
          |{' '}
          <a
            href="/terms-of-service"
            className="hover:text-purple-200 transition-colors underline"
          >
            Terms of Service
          </a>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;