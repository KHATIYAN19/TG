import React, { useState,useEffect } from "react";
import { HashLink } from "react-router-hash-link";
import {
  TrendingUp,
  Search,
  Users,
  Target,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Rocket,
  ShieldCheck,
  LineChart,
  ArrowRight
} from "lucide-react";
import { Helmet } from "react-helmet";

const PPCAdvertisingPage = () => {
  const [faqOpen, setFaqOpen] = useState(null);
  
  useEffect(() => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "instant"
   });
  }, []);

  const toggleFAQ = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const services = [
    {
      title: "Search Engine Advertising",
      icon: <Search size={20} />,
      desc: "High-intent Google & Bing campaigns built for ROI and predictable growth."
    },
    {
      title: "Social Media Ads",
      icon: <Users size={20} />,
      desc: "Creative-driven Meta, LinkedIn & TikTok campaigns that convert attention into revenue."
    },
    {
      title: "Conversion Optimization",
      icon: <Target size={20} />,
      desc: "Landing page testing & CRO to increase conversion rate and reduce CPA."
    },
    {
      title: "Ecommerce & Shopping Ads",
      icon: <DollarSign size={20} />,
      desc: "Product feed optimization and ROAS-focused shopping campaigns."
    }
  ];

  const process = [
    { title: "Audit & Research", desc: "Competitor & keyword analysis." },
    { title: "Campaign Setup", desc: "Clean, scalable account structure." },
    { title: "Launch & Test", desc: "Creative testing & targeting refinement." },
    { title: "Optimize & Scale", desc: "ROAS scaling with continuous testing." }
  ];

  const faqs = [
    {
      q: "How do you reduce wasted ad spend?",
      a: "We use structured campaigns, negative keywords, exclusions, and weekly optimization to eliminate inefficiencies."
    },
    {
      q: "When will I start seeing results?",
      a: "Traffic starts instantly. Real optimization insights typically emerge within 2–4 weeks."
    },
    {
      q: "Do I need a large budget?",
      a: "No. We validate performance first, then scale what works."
    },
    {
      q: "Do you manage everything?",
      a: "Yes. Strategy, creatives, tracking, reporting — fully managed end-to-end."
    }
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans">
      <Helmet>
        <title>PPC & Performance Marketing | Target Trek</title>
      </Helmet>

      {/* HERO */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold mb-4">
              <TrendingUp size={14} /> Performance Marketing Agency
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight mb-4 md:mb-6">
              Turn Ad Spend Into <span className="text-blue-600">Revenue</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-6 md:mb-10 max-w-lg">
              We engineer high-performance PPC campaigns that generate measurable, scalable growth.
            </p>

            <HashLink
              to="/contact"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold rounded-full transition-all shadow-lg"
            >
              Get Free Strategy Call <ArrowRight size={16} />
            </HashLink>
          </div>

          <div>
            <img
              src="https://images.unsplash.com/photo-1556155092-490a1ba16284?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHBjfGVufDB8fDB8fHww"
              alt="PPC Dashboard"
              className="rounded-2xl md:rounded-3xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 md:mb-16">
            Performance Marketing Services
          </h2>

          <div className="grid sm:grid-cols-2 gap-6 md:gap-10">
            {services.map((item, i) => (
              <div
                key={i}
                className="p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 bg-slate-50 hover:shadow-md transition"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  {item.icon}
                </div>
                <h3 className="text-base md:text-lg font-bold mb-2">
                  {item.title}
                </h3>
                <p className="text-sm md:text-base text-slate-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-16 md:py-24 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 md:mb-16">
            Why Target Trek?
          </h2>

          <div className="grid sm:grid-cols-3 gap-6 md:gap-10">
            <div className="p-6 md:p-8 bg-white rounded-2xl shadow-sm">
              <Rocket className="text-blue-600 mb-3 mx-auto" size={24} />
              <h4 className="font-semibold mb-2 text-sm md:text-base">
                Data-Driven Strategy
              </h4>
              <p className="text-xs md:text-sm text-slate-600">
                Every decision backed by performance data.
              </p>
            </div>

            <div className="p-6 md:p-8 bg-white rounded-2xl shadow-sm">
              <ShieldCheck className="text-blue-600 mb-3 mx-auto" size={24} />
              <h4 className="font-semibold mb-2 text-sm md:text-base">
                Full Transparency
              </h4>
              <p className="text-xs md:text-sm text-slate-600">
                Clear reporting & measurable results.
              </p>
            </div>

            <div className="p-6 md:p-8 bg-white rounded-2xl shadow-sm">
              <LineChart className="text-blue-600 mb-3 mx-auto" size={24} />
              <h4 className="font-semibold mb-2 text-sm md:text-base">
                Scalable Growth
              </h4>
              <p className="text-xs md:text-sm text-slate-600">
                Built to scale profitably.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 md:mb-16">
            PPC FAQ
          </h2>

          <div className="space-y-4">
            {faqs.map((item, idx) => (
              <div key={idx} className="border rounded-xl bg-slate-50">
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full p-4 md:p-6 text-left flex justify-between items-center font-semibold text-sm md:text-base"
                >
                  {item.q}
                  {faqOpen === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {faqOpen === idx && (
                  <div className="px-4 md:px-6 pb-4 md:pb-6 text-xs md:text-sm text-slate-600">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA - LIGHT BACKGROUND */}
      <section className="py-16 md:py-24 bg-blue-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-6 text-slate-900">
            Ready to Scale Profitably?
          </h2>
          <p className="text-sm md:text-lg text-slate-600 mb-8 md:mb-10">
            Let’s turn your ad budget into a consistent revenue engine.
          </p>
          <HashLink
            to="/contact"
            className="px-8 md:px-12 py-3 md:py-4 bg-blue-600 text-white text-sm md:text-lg font-semibold rounded-full hover:bg-blue-700 transition-all shadow-md"
          >
            Book Free Consultation
          </HashLink>
        </div>
      </section>
    </div>
  );
};

export default PPCAdvertisingPage;