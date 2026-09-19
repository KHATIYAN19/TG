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
    <footer className="relative overflow-hidden bg-[#0b1730] text-white">

      {/* =========================================================
          BACKGROUND DECORATION
      ========================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Top blue glow */}
        <div className="absolute left-[10%] top-[-180px] h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[120px]" />

        {/* Right glow */}
        <div className="absolute right-[-150px] top-[30%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[130px]" />

        {/* Bottom glow */}
        <div className="absolute bottom-[-200px] left-[35%] h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[130px]" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

      </div>

      {/* =========================================================
          TOP CTA
      ========================================================= */}

      <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-16 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[28px] border border-blue-400/15 bg-gradient-to-br from-[#142d55] via-[#10264a] to-[#0e2142] px-7 py-9 shadow-2xl shadow-black/20 md:px-10 md:py-11"
        >

          {/* CTA decorative circle */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-blue-400/10" />

          <div className="pointer-events-none absolute -right-10 -top-14 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">

            <div className="max-w-2xl">

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50" />

                <span className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-300">
                  Target Trek
                </span>
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                Build. Learn.{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Grow.
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
                We create practical technology solutions and resources that
                help developers and businesses turn ideas into reality.
              </p>

            </div>

            {/* Contact CTA */}
            <motion.a
              href="/contact"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex shrink-0 items-center gap-3 rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-xl shadow-blue-950/30 transition-all duration-300 hover:bg-blue-500"
            >
              <span>Let's Talk</span>

              <ArrowUpRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </motion.a>

          </div>
        </motion.div>

      </div>

      {/* =========================================================
          MAIN FOOTER
      ========================================================= */}

      <div className="relative border-t border-white/[0.07]">

        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">

          <div className="grid gap-14 md:grid-cols-2 lg:grid-cols-12">

            {/* =====================================================
                BRAND
            ===================================================== */}

            <div className="lg:col-span-5">

              {/* Logo */}
              <a
                href="/"
                className="group inline-flex items-center gap-3"
              >

                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-900/30 transition-transform duration-300 group-hover:scale-105">

                  <Rocket size={23} strokeWidth={2.2} />

                  <div className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />

                </div>

                <div className="text-2xl font-extrabold tracking-tight">
                  <span className="text-white">Target</span>
                  <span className="text-blue-400">Trek</span>
                </div>

              </a>

              <p className="mt-6 max-w-md text-sm leading-7 text-slate-400">
                Target Trek is focused on practical technology, software
                development, and digital solutions that help people and
                businesses move forward.
              </p>

              {/* Socials */}
              <div className="mt-7 flex items-center gap-3">

                <a
                  href="http://www.instagram.com/target_trek"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-pink-400/30 hover:bg-pink-500/10 hover:text-pink-400"
                >
                  <FaInstagram size={17} />
                </a>

                <a
                  href="https://www.facebook.com/targettreks/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-400"
                >
                  <FaFacebook size={17} />
                </a>

                <a
                  href="https://www.linkedin.com/company/target-trek/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-400"
                >
                  <FaLinkedin size={17} />
                </a>

                <a
                  href="https://wa.me/9873208210"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-green-400/30 hover:bg-green-500/10 hover:text-green-400"
                >
                  <FaWhatsapp size={17} />
                </a>

              </div>

            </div>

            {/* =====================================================
                QUICK LINKS
            ===================================================== */}

            <div className="lg:col-span-3">

              <h3 className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                Explore
              </h3>

              <ul className="space-y-4">

                {quickLinks.map((link) => (
                  <li key={link.name}>

                    <a
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-sm text-slate-400 transition-all duration-200 hover:translate-x-1 hover:text-white"
                    >
                      <span className="h-1 w-1 rounded-full bg-blue-500 opacity-0 transition group-hover:opacity-100" />

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

              <h3 className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
                Get in Touch
              </h3>

              {/* Email Card */}
              <a
                href="mailto:enquiry@targettrek.in"
                className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 transition-all duration-300 hover:border-blue-400/20 hover:bg-blue-500/[0.06]"
              >

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 transition group-hover:bg-blue-500/15">
                  <Mail size={19} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">
                    Email us
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-200">
                    enquiry@targettrek.in
                  </p>
                </div>

                <ArrowUpRight
                  size={17}
                  className="ml-auto shrink-0 text-slate-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-400"
                />

              </a>

              {/* Trust Card */}
              <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck size={19} />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-white">
                      Built with purpose
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Practical technology and resources designed with
                      developers and real-world problems in mind.
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

      <div className="relative border-t border-white/[0.07] bg-[#081329]">

        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-6 lg:px-8 md:flex-row md:items-center md:justify-between">

          {/* Copyright */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">

            <span>
              © {currentYear} Target Trek.
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:block" />

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
                className="text-xs text-slate-500 transition hover:text-slate-200"
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
