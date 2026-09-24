import React from "react";
import {
  ArrowUpRight,
  Mail,
  Rocket,
  ShieldCheck,
} from "lucide-react";

import {
  FaInstagram,
  FaLinkedin,
  FaFacebook,
  FaWhatsapp,
} from "react-icons/fa";

import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "About Us", href: "/about" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Blogs", href: "/blogs" },
    { name: "Contact", href: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Refund Policy", href: "/refund-policy" },
  ];

  return (
    <footer className="tt-sans relative overflow-hidden bg-[#F5F9FC] text-[#0B1524]">

      {/* =========================================================
          SUBTLE BACKGROUND
      ========================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Very subtle top blue wash */}
        <div className="absolute left-[8%] top-[-180px] h-[360px] w-[360px] rounded-full bg-[#E4F1FB] opacity-50 blur-[100px]" />

        {/* Right light-blue wash */}
        <div className="absolute right-[-160px] top-[35%] h-[360px] w-[360px] rounded-full bg-[#EAF4FC] opacity-70 blur-[110px]" />

        {/* Editorial line texture */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(29,92,134,0.035) 0px, rgba(29,92,134,0.035) 1px, transparent 1px, transparent 42px)",
          }}
        />

      </div>

      {/* =========================================================
          TOP CTA
      ========================================================= */}

      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 lg:px-8 lg:pb-16 lg:pt-18">

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="
            relative
            overflow-hidden
            rounded-[24px]
            border
            border-[#D9E7F2]
            bg-white
            px-6
            py-8
            shadow-[0_8px_30px_rgba(15,35,58,0.06)]
            sm:px-8
            sm:py-9
            lg:px-10
          "
        >

          {/* Decorative editorial lines */}

          <div className="pointer-events-none absolute right-0 top-0 h-full w-[35%] opacity-70">
            <div className="absolute right-10 top-[-80px] h-56 w-56 rounded-full border border-[#DCEBFA]" />
            <div className="absolute right-20 top-[-45px] h-44 w-44 rounded-full border border-[#EAF0F6]" />
          </div>

          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">

            {/* CTA Content */}

            <div className="max-w-2xl">

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#DCEBFA] bg-[#F5F9FC] px-3.5 py-1.5">

                <span className="h-2 w-2 rounded-full bg-[#2E86C1]" />

                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1D5C86]">
                  Target Trek
                </span>

              </div>

              <h2 className="tt-serif text-3xl font-semibold tracking-tight text-[#0B1524] sm:text-4xl">

                Build. Learn.{" "}

                <span className="text-[#1D5C86]">
                  Grow.
                </span>

              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-[#5B6B82] sm:text-base">
                Practical technology, software development, digital
                solutions, and learning resources designed to help you
                move ideas forward.
              </p>

            </div>

            {/* CTA Button */}

            <motion.a
              href="/contact"
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.975 }}
              className="
                group
                inline-flex
                shrink-0
                items-center
                justify-center
                gap-3
                rounded-xl
                bg-[#0B1524]
                px-6
                py-3.5
                text-sm
                font-bold
                text-white
                shadow-[0_8px_20px_rgba(11,21,36,0.14)]
                transition-all
                duration-300
                hover:bg-[#2E86C1]
                hover:shadow-[0_12px_25px_rgba(46,134,193,0.18)]
              "
            >
              <span>Let's Talk</span>

              <ArrowUpRight
                size={18}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                "
              />
            </motion.a>

          </div>
        </motion.div>

      </div>

      {/* =========================================================
          MAIN FOOTER
      ========================================================= */}

      <div className="relative border-t border-[#E1E9F1] bg-white">

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">

          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-16">

            {/* =====================================================
                BRAND
            ===================================================== */}

            <div className="lg:col-span-5">

              {/* Logo */}

              <a
                href="/"
                className="group inline-flex items-center gap-3"
              >

                <div
                  className="
                    relative
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-2xl
                    bg-[#0B1524]
                    text-white
                    shadow-[0_8px_18px_rgba(11,21,36,0.14)]
                    transition-all
                    duration-300
                    group-hover:-translate-y-0.5
                    group-hover:bg-[#1D5C86]
                  "
                >

                  <Rocket
                    size={22}
                    strokeWidth={2.1}
                  />

                </div>

                <div className="text-2xl font-extrabold tracking-tight">

                  <span className="text-[#0B1524]">
                    Target
                  </span>

                  <span className="text-[#1D5C86]">
                    Trek
                  </span>

                </div>

              </a>

              {/* Description */}

              <p className="mt-6 max-w-md text-sm leading-7 text-[#5B6B82]">
                Target Trek focuses on practical technology, software
                development, digital solutions, and useful learning
                resources that help people and businesses move forward.
              </p>

              {/* Small divider */}

              <div className="mt-7 h-px w-16 bg-[#2E86C1]" />

              {/* Socials */}

              <div className="mt-6 flex items-center gap-2.5">

                {/* Instagram */}

                <a
                  href="http://www.instagram.com/target_trek"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-[#E1E9F1]
                    bg-[#F5F9FC]
                    text-[#5B6B82]
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#D9E7F2]
                    hover:bg-[#EAF4FC]
                    hover:text-[#1D5C86]
                  "
                >
                  <FaInstagram size={17} />
                </a>

                {/* Facebook */}

                <a
                  href="https://www.facebook.com/targettreks/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-[#E1E9F1]
                    bg-[#F5F9FC]
                    text-[#5B6B82]
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#D9E7F2]
                    hover:bg-[#EAF4FC]
                    hover:text-[#1D5C86]
                  "
                >
                  <FaFacebook size={17} />
                </a>

                {/* LinkedIn */}

                <a
                  href="https://www.linkedin.com/company/target-trek/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-[#E1E9F1]
                    bg-[#F5F9FC]
                    text-[#5B6B82]
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#D9E7F2]
                    hover:bg-[#EAF4FC]
                    hover:text-[#1D5C86]
                  "
                >
                  <FaLinkedin size={17} />
                </a>

              

              </div>

            </div>

            {/* =====================================================
                QUICK LINKS
            ===================================================== */}

            <div className="lg:col-span-3">

              <h3 className="mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0B1524]">
                Explore
              </h3>

              <ul className="space-y-3.5">

                {quickLinks.map((link) => (
                  <li key={link.name}>

                    <a
                      href={link.href}
                      className="
                        group
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        text-[#5B6B82]
                        transition-all
                        duration-200
                        hover:translate-x-1
                        hover:text-[#1D5C86]
                      "
                    >

                      <span
                        className="
                          h-1
                          w-1
                          rounded-full
                          bg-[#2E86C1]
                          opacity-0
                          transition
                          group-hover:opacity-100
                        "
                      />

                      {link.name}

                    </a>

                  </li>
                ))}

              </ul>

            </div>

            {/* =====================================================
                CONTACT
            ===================================================== */}

            <div className="lg:col-span-4">

              <h3 className="mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0B1524]">
                Get in Touch
              </h3>

              {/* Email */}

              <a
                href="mailto:enquiry@targettrek.in"
                className="
                  group
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  border
                  border-[#E1E9F1]
                  bg-[#F5F9FC]
                  p-4
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-[#BFDDF2]
                  hover:bg-white
                  hover:shadow-[0_10px_25px_rgba(15,35,58,0.06)]
                "
              >

                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#E4F1FB]
                    text-[#1D5C86]
                  "
                >
                  <Mail size={19} />
                </div>

                <div className="min-w-0">

                  <p className="text-xs font-medium text-[#7C8CA3]">
                    Email us
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-[#0B1524]">
                    enquiry@targettrek.in
                  </p>

                </div>

                <ArrowUpRight
                  size={17}
                  className="
                    ml-auto
                    shrink-0
                    text-[#94A3B8]
                    transition
                    group-hover:-translate-y-0.5
                    group-hover:translate-x-0.5
                    group-hover:text-[#1D5C86]
                  "
                />

              </a>

              {/* Trust card */}

              <div
                className="
                  mt-4
                  rounded-2xl
                  border
                  border-[#E1E9F1]
                  bg-white
                  p-5
                "
              >

                <div className="flex items-start gap-3">

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#EAF4FC]
                      text-[#1D5C86]
                    "
                  >
                    <ShieldCheck size={19} />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-[#0B1524]">
                      Built with purpose
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#7C8CA3]">
                      Practical technology and resources designed around
                      real-world problems and useful outcomes.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =========================================================
          BOTTOM BAR
      ========================================================= */}

      <div className="relative border-t border-[#E1E9F1] bg-[#F5F9FC]">

        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">

          {/* Copyright */}

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#7C8CA3]">

            <span>
              © {currentYear} Target Trek.
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-[#CBD5E1] sm:block" />

            <span>
              All rights reserved.
            </span>

          </div>

          {/* Legal */}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">

            {legalLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="
                  text-xs
                  text-[#7C8CA3]
                  transition
                  hover:text-[#1D5C86]
                "
              >
                {link.name}
              </a>
            ))}

          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;