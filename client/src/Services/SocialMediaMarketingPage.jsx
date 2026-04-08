// import React, { useState } from "react";
// import { HashLink } from "react-router-hash-link";
// import {
//   Share2,
//   MessageCircle,
//   Heart,
//   Zap,
//   Users,
//   BarChart3,
//   Camera,
//   Sparkles,
//   ArrowRight,
//   ChevronDown,
//   ChevronUp,
//   CheckCircle2,
//   Smartphone,
//   Globe,
//   Palette,
//   Megaphone
// } from "lucide-react";
// import { Helmet } from "react-helmet";

// const SocialMediaMarketingPage = () => {
//   const [faqOpen, setFaqOpen] = useState(null);

//   const toggleFAQ = (index) => {
//     setFaqOpen(faqOpen === index ? null : index);
//   };

//   const socialTools = {
//     platforms: ["Instagram", "LinkedIn", "X (Twitter)", "TikTok"],
//     management: ["Buffer", "Hootsuite", "Sprout Social"],
//     analytics: ["Phlanx", "SocialBlade", "Iconosquare"],
//     creative: ["Canva", "CapCut", "Adobe Premiere"]
//   };

//   const services = [
//     {
//       title: "Content Strategy & Production",
//       description: "Crafting a unique brand voice through high-quality reels, carousels, and thought-leadership posts tailored for each platform.",
//       icon: <Palette size={24} />,
//       image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80",
//     },
//     {
//       title: "Community Management",
//       description: "Proactive engagement with your audience. We handle comments, DMs, and community building to turn followers into fans.",
//       icon: <MessageCircle size={24} />,
//       image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80",
//     },
//     {
//       title: "Influencer Partnerships",
//       description: "Identifying and managing collaborations with key opinion leaders (KOLs) to expand your brand's reach and trust.",
//       icon: <Users size={24} />,
//       image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80",
//     },
//     {
//       title: "Viral Trend Hijacking",
//       description: "Staying ahead of the curve by identifying emerging trends and adapting them to your brand for maximum organic reach.",
//       icon: <Zap size={24} />,
//       image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
//     },
//   ];

//   const faqs = [
//     { 
//       q: "How often should my business post on social media?", 
//       a: "Consistency beats frequency. We usually recommend 3-5 high-quality posts per week for platforms like Instagram and LinkedIn, supplemented by daily Stories for engagement." 
//     },
//     { 
//       q: "Does social media marketing help with SEO?", 
//       a: "Directly, no. Indirectly, yes. Social signals drive traffic and brand searches, which tell Google your brand is an authority in its niche." 
//     },
//     { 
//       q: "Which platform should I focus on first?", 
//       a: "If you are B2B, LinkedIn is non-negotiable. If you are B2C or E-commerce, Instagram and TikTok will drive the most visual engagement." 
//     },
//     { 
//       q: "How do you measure the success of a social campaign?", 
//       a: "We look beyond 'likes.' Our KPIs include Engagement Rate, Profile Visits, DM Inquiries, and Click-Through Rate (CTR) to your website." 
//     },
//     { 
//       q: "Do you handle negative comments or PR crises?", 
//       a: "Yes. We have a standard response protocol for customer complaints and negative feedback to ensure your brand reputation remains intact." 
//     }
//   ];

//   return (
//     <div className="bg-white text-slate-900 font-sans selection:bg-blue-100">
//       <Helmet>
//         <title>Social Media Marketing & Management | Target Trek</title>
//       </Helmet>

//       {/* --- HERO SECTION --- */}
//       <section className="relative overflow-hidden pt-28 pb-16 md:pt-40 md:pb-32 bg-gradient-to-br from-pink-50/50 via-white to-blue-50/50">
//         <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
//           <div className="text-left animate-in fade-in slide-in-from-left duration-700">
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-700 text-sm font-bold mb-6">
//               <Megaphone size={16} /> <span>Social Engineering for Brands</span>
//             </div>
//             <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight mb-6">
//               Build a <span className="text-blue-600">Community</span>, <br />
//               Not Just a Page.
//             </h1>
//             <p className="text-slate-600 text-lg md:text-xl mb-10 leading-relaxed max-w-lg">
//               Target Trek transforms your social presence into a powerful growth channel. 
//               We blend creative storytelling with data-backed algorithms.
//             </p>
//             <HashLink to="/contact" className="px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xl shadow-blue-200 inline-flex items-center gap-2">
//               Scale Your Presence <ArrowRight size={18} />
//             </HashLink>
//           </div>
//           <div className="relative">
            
//             <img
//               src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80"
//               alt="Social Media Management"
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
//               <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">The Social Stack</h2>
//               <p className="text-slate-500">Mastering the algorithms with industry-leading tools.</p>
//             </div>
            
//             <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               {Object.entries(socialTools).map(([category, tools]) => (
//                 <div key={category} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all">
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

//       {/* --- CONTENT STRATEGY (Image Left) --- */}
//       <section className="py-20 max-w-7xl mx-auto px-6">
//         <div className="grid lg:grid-cols-2 gap-16 items-center">
//           <div className="order-2 lg:order-1">
//              <img src="https://images.unsplash.com/photo-1493119508367-ad1fd1f0c946?w=600&h=350&auto=format&fit=crop" alt="Content Creation" className="rounded-3xl shadow-xl w-full h-[350px] object-cover border border-slate-100" />
//           </div>
//           <div className="order-1 lg:order-2">
//             <h2 className="text-4xl font-bold mb-6">Strategic Content Engines</h2>
//             <p className="text-slate-600 mb-8 text-lg">
//               Content is currency. We don't just post; we create high-value assets—from viral TikToks to LinkedIn thought leadership—designed to build authority and trust.
//             </p>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle2 className="text-blue-600" size={16}/> Professional Videography</div>
//               <div className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle2 className="text-blue-600" size={16}/> AI-Driven Copywriting</div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* --- ANALYTICS (Image Right) --- */}
//       <section className="py-20 bg-slate-50/50">
//         <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
//           <div>
//             <h2 className="text-4xl font-bold mb-6">Algorithm Mastery</h2>
//             <p className="text-slate-600 mb-8 text-lg">
//               We decode platform algorithms to ensure your content reaches the right eyes. By analyzing peak engagement times and sentiment data, we optimize your organic reach.
//             </p>
//             <div className="space-y-4">
//               <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm font-bold">
//                 <BarChart3 className="text-blue-600" /> Monthly Growth Audits
//               </div>
//               <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm font-bold">
//                 <Users className="text-blue-600" /> Sentiment Analysis
//               </div>
//             </div>
//           </div>
//           <div className="relative">
            
//             <img src="https://images.unsplash.com/photo-1551288049-bbbda536ad89?w=600&h=350&auto=format&fit=crop" alt="Social Analytics" className="rounded-3xl shadow-xl w-full h-[350px] object-cover border border-slate-100" />
//           </div>
//         </div>
//       </section>

//       {/* --- SERVICES GRID --- */}
//       <section className="py-24 max-w-7xl mx-auto px-6">
//         <h2 className="text-center text-4xl font-bold mb-16">Full-Service SMM</h2>
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
//         <h2 className="text-4xl font-bold mb-16 text-center">Social Strategy FAQ</h2>
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
//             Own the <span className="text-blue-600">Conversation.</span>
//           </h2>
//           <p className="text-slate-600 text-xl mb-12 max-w-3xl mx-auto relative z-10">
//             Ready to stop broadcasting and start engaging? Let Target Trek build a 
//             social strategy that actually drives revenue.
//           </p>
//           <div className="flex flex-col sm:flex-row justify-center gap-6 relative z-10">
//             <HashLink to="/contact" className="px-12 py-5 rounded-full bg-blue-600 text-white font-bold text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
//               Get a Social Audit
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

// export default SocialMediaMarketingPage;


import React, { useState, useEffect } from "react";
import { HashLink } from "react-router-hash-link";
import {
  Megaphone,
  Users,
  MessageCircle,
  Palette,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Rocket,
  ShieldCheck,
  LineChart
} from "lucide-react";
import { Helmet } from "react-helmet";

const SocialMediaMarketingPage = () => {
  const [faqOpen, setFaqOpen] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleFAQ = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const services = [
    {
      title: "Content Strategy & Production",
      icon: <Palette size={20} />,
      desc: "Platform-specific content built to educate, entertain and convert."
    },
    {
      title: "Community Management",
      icon: <MessageCircle size={20} />,
      desc: "We turn followers into loyal brand advocates through active engagement."
    },
    {
      title: "Influencer Collaborations",
      icon: <Users size={20} />,
      desc: "Strategic creator partnerships to expand reach and build trust."
    },
    {
      title: "Analytics & Growth Optimization",
      icon: <BarChart3 size={20} />,
      desc: "Monthly insights, engagement tracking & performance optimization."
    }
  ];

  const faqs = [
    {
      q: "How long does social media marketing take to show results?",
      a: "Organic growth typically shows traction within 30–60 days. Paid amplification can accelerate results depending on goals and budget."
    },
    {
      q: "Which platform is best for my business?",
      a: "It depends on your audience. B2B brands thrive on LinkedIn, while B2C brands often see stronger engagement on Instagram and TikTok."
    },
    {
      q: "Do you create content or just manage posting?",
      a: "We handle everything — strategy, content creation, captions, posting, engagement, and reporting."
    },
    {
      q: "How do you measure success?",
      a: "We track engagement rate, reach, website clicks, lead generation, and revenue impact — not just likes."
    },
    {
      q: "Can social media actually generate revenue?",
      a: "Yes. With the right content strategy and funnel alignment, social media becomes a strong acquisition and brand-building channel."
    }
  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans">
      <Helmet>
        <title>Social Media Marketing | Target Trek</title>
      </Helmet>

      {/* HERO */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-br from-blue-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold mb-4">
              <Megaphone size={14} /> Social Media Growth Agency
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-tight mb-4 md:mb-6">
              Build Attention. <span className="text-blue-600">Turn It Into Revenue.</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-6 md:mb-10 max-w-lg">
              We build strategic, data-backed social media systems that grow brand authority,
              drive engagement, and convert followers into customers.
            </p>

            <HashLink
              to="/contact"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-semibold rounded-full transition-all shadow-lg"
            >
              Get Free Social Audit <ArrowRight size={16} />
            </HashLink>
          </div>

          <div>
            <img
              src="https://images.unsplash.com/photo-1676282827533-d6058df56a69?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21tfGVufDB8fDB8fHww"
              alt="Social Media Marketing"
              className="rounded-2xl md:rounded-3xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 md:mb-16">
            Social Media Services
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
                Strategy First Approach
              </h4>
              <p className="text-xs md:text-sm text-slate-600">
                Content aligned with real business objectives.
              </p>
            </div>

            <div className="p-6 md:p-8 bg-white rounded-2xl shadow-sm">
              <ShieldCheck className="text-blue-600 mb-3 mx-auto" size={24} />
              <h4 className="font-semibold mb-2 text-sm md:text-base">
                Consistent Brand Voice
              </h4>
              <p className="text-xs md:text-sm text-slate-600">
                Cohesive storytelling across platforms.
              </p>
            </div>

            <div className="p-6 md:p-8 bg-white rounded-2xl shadow-sm">
              <LineChart className="text-blue-600 mb-3 mx-auto" size={24} />
              <h4 className="font-semibold mb-2 text-sm md:text-base">
                Growth Focused
              </h4>
              <p className="text-xs md:text-sm text-slate-600">
                We optimize for engagement and revenue impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 md:mb-16">
            Social Media FAQ
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

      {/* FINAL CTA - LIGHT */}
      <section className="py-16 md:py-24 bg-blue-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-6 text-slate-900">
            Ready to Grow Your Social Presence?
          </h2>
          <p className="text-sm md:text-lg text-slate-600 mb-8 md:mb-10">
            Let’s turn attention into consistent revenue growth.
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

export default SocialMediaMarketingPage;