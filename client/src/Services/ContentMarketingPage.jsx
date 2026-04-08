// import React, { useState } from "react";
// import { HashLink } from "react-router-hash-link";
// import {
//   FileText,
//   PenTool,
//   Search,
//   BarChart,
//   BookOpen,
//   Mail,
//   Zap,
//   ArrowRight,
//   ChevronDown,
//   ChevronUp,
//   CheckCircle2,
//   Layers,
//   Sparkles,
//   PieChart,
//   Target,
//   Share2
// } from "lucide-react";
// import { Helmet } from "react-helmet";

// const ContentMarketingPage = () => {
//   const [faqOpen, setFaqOpen] = useState(null);

//   const toggleFAQ = (index) => {
//     setFaqOpen(faqOpen === index ? null : index);
//   };

//   const contentTools = {
//     planning: ["Notion", "Trello", "Airtable"],
//     writing: ["Jasper AI", "Grammarly Pro", "Hemingway"],
//     seo: ["Semrush", "Ahrefs", "SurferSEO"],
//     distribution: ["Mailchimp", "Medium", "Substack"]
//   };

//   const services = [
//     {
//       title: "SEO-Driven Editorial",
//       description: "We don't just write; we engineer articles that rank. Using semantic keyword research to capture search intent and drive organic growth.",
//       icon: <Search size={24} />,
//       image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80",
//     },
//     {
//       title: "Lead Magnets & Whitepapers",
//       description: "Deep-dive technical content designed to capture high-quality B2B leads and establish your brand as a niche authority.",
//       icon: <BookOpen size={24} />,
//       image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80",
//     },
//     {
//       title: "Email Nurture Sequences",
//       description: "Transforming subscribers into customers with automated, data-driven email journeys that deliver the right message at the right time.",
//       icon: <Mail size={24} />,
//       image: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=800&auto=format&fit=crop&q=80",
//     },
//     {
//       title: "Content Distribution",
//       description: "Amplifying your reach across LinkedIn, Medium, and industry newsletters to ensure your best work gets the eyeballs it deserves.",
//       icon: <Share2 size={24} />,
//       image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80",
//     },
//   ];

//   const faqs = [
//     { 
//       q: "How long does it take for content marketing to show results?", 
//       a: "Content is a long-term play. While high-quality articles start getting indexed in days, significant organic traffic growth typically takes 3-6 months of consistent output." 
//     },
//     { 
//       q: "Do you use AI to write the content?", 
//       a: "We use AI for research and outlining to increase efficiency, but every final piece is crafted and fact-checked by human subject-matter experts to ensure brand tone and accuracy." 
//     },
//     { 
//       q: "What is 'Evergreen Content'?", 
//       a: "Evergreen content refers to topics that remain relevant for years. We prioritize this so your content continues to generate leads long after the publish date." 
//     },
//     { 
//       q: "Can you help update our existing blog posts?", 
//       a: "Yes. Content 'refreshing' is a core part of our strategy. We update old posts with new data and keywords to reclaim lost rankings." 
//     },
//     { 
//       q: "How do you decide what topics to write about?", 
//       a: "We use a 'Topic Cluster' model. We analyze your competitors' gaps and your customers' most frequent pain points to build a comprehensive content roadmap." 
//     }
//   ];

//   return (
//     <div className="bg-white text-slate-900 font-sans selection:bg-blue-100">
//       <Helmet>
//         <title>Content Marketing & SEO Strategy | Target Trek</title>
//       </Helmet>

//       {/* --- HERO SECTION --- */}
//       <section className="relative overflow-hidden pt-28 pb-16 md:pt-40 md:pb-32 bg-gradient-to-br from-blue-50/50 via-white to-slate-50">
//         <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
//           <div className="text-left animate-in fade-in slide-in-from-left duration-700">
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-700 text-sm font-bold mb-6">
//               <PenTool size={16} /> <span>Authority-Based Content Strategy</span>
//             </div>
//             <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight mb-6">
//               Write Less, <br />
//               <span className="text-blue-600 font-serif">Rank Higher.</span>
//             </h1>
//             <p className="text-slate-600 text-lg md:text-xl mb-10 leading-relaxed max-w-lg">
//               Target Trek builds content engines that turn cold traffic into loyal advocates. 
//               We don't just fill pages—we build brand equity.
//             </p>
//             <HashLink to="/contact" className="px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xl shadow-blue-200 inline-flex items-center gap-2">
//               Start Your Strategy <ArrowRight size={18} />
//             </HashLink>
//           </div>
//           <div className="relative">
             
//             <img
//               src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80"
//               alt="Content Strategy Planning"
//               className="relative rounded-[2rem] border-8 border-white shadow-2xl z-10 w-full h-[400px] object-cover"
//             />
//           </div>
//         </div>
//       </section>

//       {/* --- LIGHT TECH STACK --- */}
//       <section className="py-24 bg-white">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="bg-slate-50 rounded-[3rem] p-10 md:p-16 border border-slate-100 relative shadow-sm">
//             <div className="text-center mb-16">
//               <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">The Content Toolkit</h2>
//               <p className="text-slate-500">Data-driven tools for research, SEO, and distribution.</p>
//             </div>
            
//             <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               {Object.entries(contentTools).map(([category, tools]) => (
//                 <div key={category} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 transition-all">
//                   <h4 className="text-blue-600 font-bold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
//                     <Sparkles size={12} /> {category}
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

//       {/* --- SEO STRATEGY (Image Left) --- */}
//       <section className="py-20 max-w-7xl mx-auto px-6">
//         <div className="grid lg:grid-cols-2 gap-16 items-center">
//           <div className="order-2 lg:order-1">
             
//              <img src="https://images.unsplash.com/photo-1432888622747-4eb9a8f2c207?w=600&h=350&auto=format&fit=crop" alt="SEO Analysis" className="rounded-3xl shadow-xl w-full h-[350px] object-cover border border-slate-100" />
//           </div>
//           <div className="order-1 lg:order-2">
//             <h2 className="text-4xl font-bold mb-6">Pillar-Cluster Strategy</h2>
//             <p className="text-slate-600 mb-8 text-lg">
//               We organize your content into <strong>Topic Pillars</strong>. This establishes your site's "Topical Authority" in the eyes of Google, helping you outrank competitors with much larger budgets.
//             </p>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle2 className="text-blue-600" size={16}/> Intent Mapping</div>
//               <div className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle2 className="text-blue-600" size={16}/> Internal Link Siloing</div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* --- ANALYTICS (Image Right) --- */}
//       <section className="py-20 bg-slate-50/50">
//         <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
//           <div>
//             <h2 className="text-4xl font-bold mb-6">Performance-First Content</h2>
//             <p className="text-slate-600 mb-8 text-lg">
//               We don't measure "views"—we measure "value." Every piece of content is tracked for lead conversion, dwell time, and assisted conversions.
//             </p>
//             <div className="space-y-4">
//               <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm font-bold">
//                 <BarChart className="text-blue-600" /> ROI & Conversion Tracking
//               </div>
//               <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm font-bold">
//                 <Target className="text-blue-600" /> Competitor Gap Analysis
//               </div>
//             </div>
//           </div>
//           <div className="relative">
             
//             <img src="https://images.unsplash.com/photo-1551288049-bbbda536ad89?w=600&h=350&auto=format&fit=crop" alt="Content Analytics" className="rounded-3xl shadow-xl w-full h-[350px] object-cover border border-slate-100" />
//           </div>
//         </div>
//       </section>

//       {/* --- SERVICES GRID --- */}
//       <section className="py-24 max-w-7xl mx-auto px-6">
//         <h2 className="text-center text-4xl font-bold mb-16">Core Content Services</h2>
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
//         <h2 className="text-4xl font-bold mb-16 text-center">Content Marketing FAQ</h2>
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
//             Own the <span className="text-blue-600">Search Results.</span>
//           </h2>
//           <p className="text-slate-600 text-xl mb-12 max-w-3xl mx-auto relative z-10">
//             Stop producing noise. Start producing assets. Let Target Trek build your 
//             authority and drive sustainable organic growth.
//           </p>
//           <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
//             <HashLink to="/contact" className="px-12 py-5 rounded-full bg-blue-600 text-white font-bold text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
//               Get a Content Audit
//             </HashLink>
//             <a href="mailto:hello@targettrek.in" className="px-12 py-5 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xl hover:bg-slate-50 transition-all">
//               Talk to a Strategist
//             </a>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default ContentMarketingPage;

import React, { useState, useEffect } from "react";
import { HashLink } from "react-router-hash-link";
import {
  PenTool,
  Search,
  BookOpen,
  Mail,
  Share2,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Rocket,
  ShieldCheck,
  LineChart
} from "lucide-react";
import { Helmet } from "react-helmet";

const ContentMarketingPage = () => {
  const [faqOpen, setFaqOpen] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleFAQ = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const services = [
    {
      title: "SEO Blog Strategy",
      icon: <Search size={20} />,
      desc: "Search-intent driven content built to rank and generate consistent organic traffic."
    },
    {
      title: "Lead Magnets & Whitepapers",
      icon: <BookOpen size={20} />,
      desc: "High-authority gated content designed to capture qualified leads."
    },
    {
      title: "Email Nurture Sequences",
      icon: <Mail size={20} />,
      desc: "Automated email journeys that turn subscribers into customers."
    },
    {
      title: "Content Distribution",
      icon: <Share2 size={20} />,
      desc: "Strategic amplification across LinkedIn, newsletters, and media channels."
    }
  ];

  const faqs = [
    {
      q: "How long does content marketing take to generate results?",
      a: "Content marketing is a long-term growth strategy. While indexing begins within days, meaningful traffic growth typically builds over 3–6 months of consistent publishing."
    },
    {
      q: "Do you write SEO-optimized content?",
      a: "Yes. Every piece is built around search intent, semantic keyword clusters, and internal linking strategies to maximize ranking potential."
    },
    {
      q: "Can you improve our existing blog content?",
      a: "Absolutely. We audit, update, and re-optimize older posts to recover lost rankings and increase conversions."
    },
    {
      q: "How do you measure content performance?",
      a: "We track organic traffic, keyword rankings, dwell time, assisted conversions, and lead generation — not vanity metrics."
    },
    {
      q: "Will content marketing actually generate leads?",
      a: "Yes. When aligned with funnels and CTAs, content becomes a powerful acquisition engine that compounds over time."
    }
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans">
      <Helmet>
        <title>Content Marketing & SEO | Target Trek</title>
      </Helmet>

      {/* HERO */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold mb-4">
              <PenTool size={14} /> Authority-Driven Content Strategy
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight mb-4 md:mb-6">
              Build Authority. <span className="text-blue-600">Drive Organic Growth.</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-6 md:mb-10 max-w-lg">
              We create SEO-focused content systems that rank on Google, build trust,
              and convert readers into long-term customers.
            </p>

            <HashLink
              to="/contact"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold rounded-full transition-all shadow-lg"
            >
              Get Free Content Audit <ArrowRight size={16} />
            </HashLink>
          </div>

          <div>
            <img
              src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80"
              alt="Content Strategy"
              className="rounded-2xl md:rounded-3xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 md:mb-16">
            Content Marketing Services
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

      {/* WHY US */}
      <section className="py-16 md:py-24 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-10 md:mb-16">
            Why Target Trek?
          </h2>

          <div className="grid sm:grid-cols-3 gap-6 md:gap-10">
            <div className="p-6 md:p-8 bg-white rounded-2xl shadow-sm">
              <Rocket className="text-blue-600 mb-3 mx-auto" size={24} />
              <h4 className="font-semibold mb-2 text-sm md:text-base">
                SEO-First Approach
              </h4>
              <p className="text-xs md:text-sm text-slate-600">
                Built around search intent and keyword clusters.
              </p>
            </div>

            <div className="p-6 md:p-8 bg-white rounded-2xl shadow-sm">
              <ShieldCheck className="text-blue-600 mb-3 mx-auto" size={24} />
              <h4 className="font-semibold mb-2 text-sm md:text-base">
                Authority Building
              </h4>
              <p className="text-xs md:text-sm text-slate-600">
                Content designed to establish industry leadership.
              </p>
            </div>

            <div className="p-6 md:p-8 bg-white rounded-2xl shadow-sm">
              <LineChart className="text-blue-600 mb-3 mx-auto" size={24} />
              <h4 className="font-semibold mb-2 text-sm md:text-base">
                Performance Tracking
              </h4>
              <p className="text-xs md:text-sm text-slate-600">
                Measured by leads and conversions — not just traffic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 md:mb-16">
            Content Marketing FAQ
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

      {/* FINAL CTA */}
      <section className="py-16 md:py-24 bg-blue-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-6 text-slate-900">
            Ready to Dominate Search?
          </h2>
          <p className="text-sm md:text-lg text-slate-600 mb-8 md:mb-10">
            Let’s build a content engine that compounds traffic and revenue.
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

export default ContentMarketingPage;