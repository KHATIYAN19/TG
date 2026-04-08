// import React, { useState } from "react";
// import { HashLink } from "react-router-hash-link";
// import {
//   Network,
//   Users,
//   ShieldAlert,
//   BarChart3,
//   Link2,
//   Handshake,
//   Zap,
//   ArrowRight,
//   ChevronDown,
//   ChevronUp,
//   CheckCircle2,
//   Layers,
//   Sparkles,
//   PieChart,
//   Target,
//   Trophy
// } from "lucide-react";
// import { Helmet } from "react-helmet";

// const AffiliateMarketingPage = () => {
//   const [faqOpen, setFaqOpen] = useState(null);

//   const toggleFAQ = (index) => {
//     setFaqOpen(faqOpen === index ? null : index);
//   };

//   const affiliateTools = {
//     tracking: ["Impact", "PartnerStack", "Post Affiliate Pro"],
//     networks: ["ShareASale", "CJ Affiliate", "Awin"],
//     fraud_prevention: ["Anura", "Fraudlogix", "Impact Radius"],
//     analytics: ["GA4", "Custom Dashboards", "Tableau"]
//   };

//   const services = [
//     {
//       title: "Affiliate Program Strategy",
//       description: "Designing commission structures and terms that attract top-tier partners while ensuring your margins remain healthy and profitable.",
//       icon: <Network size={24} />,
//       image: "https://images.unsplash.com/photo-1556761175-b973dc0f32e7?w=800&auto=format&fit=crop&q=80",
//     },
//     {
//       title: "Partner Recruitment",
//       description: "Actively scouting and onboarding influencers, bloggers, and loyalty sites that align with your brand's core values and target audience.",
//       icon: <Handshake size={24} />,
//       image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80",
//     },
//     {
//       title: "Infrastructure & Tracking",
//       description: "Implementing robust server-to-server (S2S) tracking to ensure every conversion is attributed correctly across all devices.",
//       icon: <Link2 size={24} />,
//       image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
//     },
//     {
//       title: "Fraud Detection",
//       description: "Continuous monitoring to protect your spend from cookie-stuffing, ad-hijacking, and bot-driven fake conversions.",
//       icon: <ShieldAlert size={24} />,
//       image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
//     },
//   ];

//   const faqs = [
//     { 
//       q: "What is the difference between an affiliate and an influencer?", 
//       a: "An affiliate typically works on a performance-based model (CPA), earning commission only when a sale occurs. Influencers often work on a flat fee for brand awareness, though many now adopt hybrid models." 
//     },
//     { 
//       q: "How do you prevent affiliate fraud?", 
//       a: "We use advanced tracking software that monitors IP addresses, click-to-conversion time, and proxy usage to automatically flag and block suspicious activity." 
//     },
//     { 
//       q: "Which tracking platform should we use?", 
//       a: "It depends on your scale. For mid-market SaaS, we recommend PartnerStack; for global E-commerce, Impact or CJ are industry leaders. We help you choose and integrate the best fit." 
//     },
//     { 
//       q: "Do you handle the affiliate payments?", 
//       a: "We manage the approval of commissions and the reconciliation of data, while the actual payouts are usually handled through the tracking platform or your internal finance system." 
//     },
//     { 
//       q: "How do you find high-quality affiliates?", 
//       a: "We use proprietary outreach tools and our internal database of vetted partners across niches like Tech, Fashion, Finance, and Health." 
//     }
//   ];

//   return (
//     <div className="bg-white text-slate-900 font-sans selection:bg-blue-100">
//       <Helmet>
//         <title>Affiliate & Partner Marketing Management | Target Trek</title>
//       </Helmet>

//       {/* --- HERO SECTION --- */}
//       <section className="relative overflow-hidden pt-28 pb-16 md:pt-40 md:pb-32 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50">
//         <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
//           <div className="text-left animate-in fade-in slide-in-from-left duration-700">
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-700 text-sm font-bold mb-6">
//               <Network size={16} /> <span>Performance-Based Partnership Growth</span>
//             </div>
//             <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight mb-6">
//               Scale with <br />
//               <span className="text-blue-600 font-serif">Partnerships.</span>
//             </h1>
//             <p className="text-slate-600 text-lg md:text-xl mb-10 leading-relaxed max-w-lg">
//               Target Trek builds and manages affiliate ecosystems that drive risk-free revenue. 
//               Only pay for the sales you actually make.
//             </p>
//             <HashLink to="/contact" className="px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xl shadow-blue-200 inline-flex items-center gap-2">
//               Build Your Program <ArrowRight size={18} />
//             </HashLink>
//           </div>
//           <div className="relative">
             
//             <img
//               src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80"
//               alt="Affiliate Network Visualization"
//               className="relative rounded-[2rem] border-8 border-white shadow-2xl z-10 w-full h-[400px] object-cover"
//             />
//           </div>
//         </div>
//       </section>

//       {/* --- LIGHT TECH STACK --- */}
//       <section className="py-24 bg-white">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="bg-blue-50/50 rounded-[3rem] p-10 md:p-16 border border-blue-100 relative shadow-sm">
//             <div className="text-center mb-16">
//               <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">The Partner Ecosystem</h2>
//               <p className="text-slate-500">Integrating the best tracking and management tech for your program.</p>
//             </div>
            
//             <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               {Object.entries(affiliateTools).map(([category, tools]) => (
//                 <div key={category} className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:border-blue-400 transition-all">
//                   <h4 className="text-blue-600 font-bold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
//                     <Sparkles size={12} /> {category.replace('_', ' ')}
//                   </h4>
//                   <div className="flex flex-wrap gap-2">
//                     {tools.map(t => (
//                       <span key={t} className="px-3 py-1 bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-100">
//                         {t}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* --- ATTRIBUTION FLOW (Image Left) --- */}
//       <section className="py-20 max-w-7xl mx-auto px-6">
//         <div className="grid lg:grid-cols-2 gap-16 items-center">
//           <div className="order-2 lg:order-1">
             
//              <img src="https://images.unsplash.com/photo-1551288049-bbbda536ad89?w=600&h=350&auto=format&fit=crop" alt="Tracking Systems" className="rounded-3xl shadow-xl w-full h-[350px] object-cover border border-slate-100" />
//           </div>
//           <div className="order-1 lg:order-2">
//             <h2 className="text-4xl font-bold mb-6">Server-Side Accuracy</h2>
//             <p className="text-slate-600 mb-8 text-lg">
//               In a cookie-less world, traditional tracking fails. We implement <strong>Postback URLs</strong> and <strong>S2S Tracking</strong> to ensure every affiliate sale is captured accurately, even across different devices and browsers.
//             </p>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle2 className="text-blue-600" size={16}/> Zero-Cookie Attribution</div>
//               <div className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle2 className="text-blue-600" size={16}/> Cross-Device Tracking</div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* --- PERFORMANCE ANALYSIS (Image Right) --- */}
//       <section className="py-20 bg-slate-50/50">
//         <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
//           <div>
//             <h2 className="text-4xl font-bold mb-6">Partner Portfolio Audit</h2>
//             <p className="text-slate-600 mb-8 text-lg">
//               We apply the 80/20 rule. By identifying your top 20% of partners who drive 80% of revenue, we create custom incentive programs to help them scale their efforts.
//             </p>
//             <div className="space-y-4">
//               <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm font-bold">
//                 <Trophy className="text-blue-600" /> Multi-Tier Commission Setup
//               </div>
//               <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm font-bold">
//                 <PieChart className="text-blue-600" /> EPC (Earn Per Click) Optimization
//               </div>
//             </div>
//           </div>
//           <div className="relative">
             
//             <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=350&auto=format&fit=crop" alt="Performance Metrics" className="rounded-3xl shadow-xl w-full h-[350px] object-cover border border-slate-100" />
//           </div>
//         </div>
//       </section>

//       {/* --- SERVICES GRID --- */}
//       <section className="py-24 max-w-7xl mx-auto px-6">
//         <h2 className="text-center text-4xl font-bold mb-16">Our Partnership Services</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
//           {services.map((s, i) => (
//             <div key={i} className="group bg-white rounded-3xl p-8 border border-slate-100 hover:shadow-xl transition-all duration-300">
//               <div className="flex flex-col md:flex-row gap-8">
//                 <div className="w-full md:w-1/3 overflow-hidden rounded-2xl">
//                   <img src={s.image} alt={s.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform" />
//                 </div>
//                 <div className="flex-1">
//                   <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">{s.icon}</div>
//                   <h3 className="text-xl font-bold mb-2">{s.title}</h3>
//                   <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* --- FAQ --- */}
//       <section className="py-24 max-w-7xl mx-auto px-6 border-t border-slate-100">
//         <h2 className="text-4xl font-bold mb-16 text-center">Affiliate Program FAQ</h2>
//         <div className="max-w-5xl mx-auto space-y-4">
//           {faqs.map((item, idx) => (
//             <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
//               <button onClick={() => toggleFAQ(idx)} className="w-full p-8 text-left flex justify-between items-center hover:bg-slate-50 transition-colors font-bold text-lg text-slate-800">
//                 {item.q}
//                 {faqOpen === idx ? <ChevronUp className="text-blue-600" /> : <ChevronDown className="text-slate-400" />}
//               </button>
//               {faqOpen === idx && <div className="px-8 pb-8 text-slate-500 text-lg leading-relaxed animate-in fade-in duration-300">{item.a}</div>}
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* --- FINAL CTA --- */}
//       <section className="py-24 px-6 bg-white">
//         <div className="max-w-7xl mx-auto text-center p-12 md:p-20 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-sm relative overflow-hidden">
//           <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -mr-32 -mt-32" />
//           <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-8 relative z-10">
//             Pay only for <span className="text-blue-600">Results.</span>
//           </h2>
//           <p className="text-slate-600 text-xl mb-12 max-w-3xl mx-auto relative z-10">
//             Stop burning budget on clicks that don't convert. Build a performance-based 
//             affiliate engine with Target Trek and scale risk-free.
//           </p>
//           <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
//             <HashLink to="/contact" className="px-12 py-5 rounded-full bg-blue-600 text-white font-bold text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
//               Scale My Program
//             </HashLink>
//             <a href="mailto:hello@targettrek.in" className="px-12 py-5 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xl hover:bg-slate-50 transition-all">
//               Consult a Specialist
//             </a>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default AffiliateMarketingPage;

import React, { useState, useEffect } from "react";
import { HashLink } from "react-router-hash-link";
import {
  Network,
  Users,
  ShieldAlert,
  BarChart3,
  Link2,
  Handshake,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Layers,
  Sparkles,
  PieChart,
  Target,
  Trophy
} from "lucide-react";
import { Helmet } from "react-helmet";

const AffiliateMarketingPage = () => {
  const [faqOpen, setFaqOpen] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleFAQ = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const affiliateTools = {
    tracking: ["Impact", "PartnerStack", "Post Affiliate Pro"],
    networks: ["ShareASale", "CJ Affiliate", "Awin"],
    fraud_prevention: ["Anura", "Fraudlogix", "Impact Radius"],
    analytics: ["GA4", "Custom Dashboards", "Tableau"]
  };

  const services = [
    {
      title: "Affiliate Program Strategy",
      description:
        "Designing commission structures and terms that attract top-tier partners while ensuring your margins remain healthy and profitable.",
      icon: <Network size={24} />,
      image:
        "https://media.istockphoto.com/id/503592634/photo/affiliate-marketing.webp?a=1&b=1&s=612x612&w=0&k=20&c=uK-r_5aQpXiCZJWHmKNbFES_A9OJh5eUvqwS9xtqJy4="
    },
    {
      title: "Partner Recruitment",
      description:
        "Actively scouting and onboarding influencers, bloggers, and loyalty sites that align with your brand's core values and target audience.",
      icon: <Handshake size={24} />,
      image:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80"
    },
    {
      title: "Infrastructure & Tracking",
      description:
        "Implementing robust server-to-server (S2S) tracking to ensure every conversion is attributed correctly across all devices.",
      icon: <Link2 size={24} />,
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80"
    },
    {
      title: "Fraud Detection",
      description:
        "Continuous monitoring to protect your spend from cookie-stuffing, ad-hijacking, and bot-driven fake conversions.",
      icon: <ShieldAlert size={24} />,
      image:
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80"
    }
  ];

  const faqs = [
    {
      q: "What is the difference between an affiliate and an influencer?",
      a: "An affiliate works on performance (CPA) and earns per sale. Influencers often work on flat fees, though hybrid models are becoming common."
    },
    {
      q: "How do you prevent affiliate fraud?",
      a: "We use advanced tracking tools to monitor IP anomalies, proxy usage, abnormal click spikes, and suspicious conversion timelines."
    },
    {
      q: "Which tracking platform should we use?",
      a: "It depends on your scale. We evaluate your goals and integrate the most scalable and reliable tracking ecosystem."
    },
    {
      q: "Do you handle affiliate payouts?",
      a: "We manage approvals and reconciliation while payouts are handled through the selected platform or your finance system."
    },
    {
      q: "How do you recruit quality affiliates?",
      a: "We combine outreach, vetted partner databases, and niche targeting to recruit affiliates aligned with your ICP."
    }
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <Helmet>
        <title>Affiliate & Partner Marketing Management | Target Trek</title>
      </Helmet>

      {/* HERO */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold mb-4">
              <Network size={14} /> Performance-Based Partnership Growth
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight mb-4">
              Scale with <span className="text-blue-600">Partnerships.</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-6 max-w-lg">
              Build a predictable, risk-free revenue engine. Only pay when real
              sales happen — not for impressions or clicks.
            </p>

            <HashLink
              to="/contact"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold rounded-full transition shadow-lg"
            >
              Build Your Program <ArrowRight size={16} />
            </HashLink>
          </div>

          <img
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80"
            alt="Affiliate Network"
            className="rounded-2xl shadow-xl"
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Our 4-Step Affiliate Growth Engine
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[Users, Handshake, BarChart3, Trophy].map((Icon, i) => (
              <div
                key={i}
                className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center"
              >
                <Icon className="mx-auto text-blue-600 mb-4" size={26} />
                <h4 className="font-bold mb-2">Step {i + 1}</h4>
                <p className="text-sm text-slate-600">
                  Structured growth framework designed to scale partner-driven
                  revenue efficiently.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            The Partner Ecosystem
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(affiliateTools).map(([category, tools]) => (
              <div
                key={category}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
              >
                <h4 className="text-blue-600 font-bold uppercase text-xs mb-4 flex items-center gap-2">
                  <Sparkles size={12} /> {category.replace("_", " ")}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1 bg-slate-100 text-xs rounded-lg"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <h2 className="text-center text-4xl font-bold mb-16">
          Our Partnership Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {services.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition"
            >
              <img
                src={s.image}
                alt={s.title}
                className="rounded-2xl mb-6 h-48 w-full object-cover"
              />
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                {s.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{s.title}</h3>
              <p className="text-slate-600 text-sm">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Affiliate Program FAQ
          </h2>

          <div className="space-y-4">
            {faqs.map((item, idx) => (
              <div
                key={idx}
                className="border rounded-xl bg-slate-50 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full p-5 flex justify-between items-center font-semibold text-left"
                >
                  {item.q}
                  {faqOpen === idx ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>

                {faqOpen === idx && (
                  <div className="px-5 pb-5 text-sm text-slate-600">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 bg-blue-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
            Pay Only for <span className="text-blue-600">Results.</span>
          </h2>
          <p className="text-slate-600 mb-10 max-w-2xl mx-auto">
            Build a performance-based affiliate engine that scales revenue
            without scaling ad spend.
          </p>
          <HashLink
            to="/contact"
            className="px-10 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition shadow-md"
          >
            Scale My Program
          </HashLink>
        </div>
      </section>
    </div>
  );
};

export default AffiliateMarketingPage;