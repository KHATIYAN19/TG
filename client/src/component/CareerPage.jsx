

// import React, { useState } from "react";
// import { 
//   Search, 
//   MapPin, 
//   Briefcase, 
//   Clock, 
//   Filter, 
//   X, 
//   ArrowRight, 
//   CheckCircle2, 
//   Upload,
//   ChevronRight,
//   Building2,
//   DollarSign,
//   Calendar,
//   Layers,
//   Award,
//   Wallet,
//   Zap,
//   Globe
// } from "lucide-react";
// import { Helmet } from "react-helmet";

// const CareerPage = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

//   const categories = ["All", "Engineering", "Marketing", "Design", "Sales", "HR"];

//   const jobs = [
//     {
//       id: 1,
//       title: "Lead Frontend Engineer",
//       department: "Engineering",
//       location: "Remote / Noida, India",
//       type: "Full-time",
//       salaryRange: "₹18L - ₹25L PA",
//       experience: "5+ Years",
//       createdAt: "Feb 15, 2026",
//       expiresAt: "March 30, 2026",
//       description: "We are seeking a high-caliber Frontend Lead to revolutionize our client-side architecture. You will mentor junior devs and own the UI performance metrics.",
//       responsibilities: [
//         "Architect scalable React/Next.js applications.",
//         "Ensure 95+ Core Web Vitals score across all projects.",
//         "Implement rigorous unit and integration testing (Jest/Cypress).",
//         "Collaborate with UX designers to build pixel-perfect interfaces."
//       ],
//       skills: ["React 19", "TypeScript", "Tailwind CSS", "Redux Toolkit", "Next.js"],
//       benefits: ["Equity Options", "Unlimited PTO", "Learning Budget ($1k/yr)", "Premium Health Cover"]
//     },
//     {
//       id: 2,
//       title: "Growth Marketing Specialist",
//       department: "Marketing",
//       location: "Hybrid / Bangalore",
//       type: "Full-time",
//       salaryRange: "₹12L - ₹18L PA",
//       experience: "3+ Years",
//       createdAt: "Feb 18, 2026",
//       expiresAt: "April 15, 2026",
//       description: "Focus on scaling our SaaS client base through aggressive performance marketing and data-driven experimentation.",
//       responsibilities: [
//         "Manage monthly ad spend across Google, Meta, and LinkedIn.",
//         "Perform A/B testing on landing pages to optimize conversion rates.",
//         "Weekly reporting on ROAS and CAC metrics to the leadership team.",
//         "Set up advanced GTM and GA4 tracking for complex user journeys."
//       ],
//       skills: ["Google Ads", "Meta Business Suite", "GA4", "SQL", "Copywriting"],
//       benefits: ["Quarterly Performance Bonus", "Gym Membership", "Internet Reimbursement"]
//     }
//   ];

//   const filteredJobs = jobs.filter(job => {
//     const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = selectedCategory === "All" || job.department === selectedCategory;
//     return matchesSearch && matchesCategory;
//   });

//   return (
//     <div className="bg-white text-slate-900 font-sans min-h-screen">
//       <Helmet>
//         <title>Careers | Join Target Trek Engineering & Marketing</title>
//       </Helmet>

//       {/* --- HERO SECTION --- */}
//       <section className="pt-32 pb-16 bg-gradient-to-b from-blue-50/50 to-white border-b border-slate-100">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center mb-12">
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 text-blue-700 text-sm font-bold mb-6">
//               <Award size={16} /> <span>Work with the top 1% of Talent</span>
//             </div>
//             <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6">
//               Your next <span className="text-blue-600 italic">Big Leap</span> starts here.
//             </h1>
//             <p className="text-slate-600 text-lg max-w-2xl mx-auto">
//               Browse our open positions and find a role where you can build, break, 
//               and create high-impact digital solutions.
//             </p>
//           </div>

//           {/* SEARCH & FILTER BAR */}
//           <div className="max-w-5xl mx-auto bg-white p-3 rounded-[2rem] shadow-2xl shadow-blue-100 border border-slate-100 flex flex-col md:flex-row gap-3">
//             <div className="flex-[2] relative">
//               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
//               <input 
//                 type="text" 
//                 placeholder="Job Title or Keyword..." 
//                 className="w-full pl-14 pr-4 py-5 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-800"
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             <div className="flex-1">
//               <select 
//                 className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
//                 onChange={(e) => setSelectedCategory(e.target.value)}
//               >
//                 {categories.map(cat => <option key={cat} value={cat}>{cat} Department</option>)}
//               </select>
//             </div>
//             <button className="px-10 py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
//               Find Jobs <ArrowRight size={18} />
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* --- JOB EXPLORER --- */}
//       <section className="py-20 max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12">
//         {/* LEFT: JOB CARDS */}
//         <div className="lg:col-span-5 space-y-5">
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest text-xs">
//               <Layers size={14} /> Available Roles ({filteredJobs.length})
//             </h3>
//           </div>
//           {filteredJobs.map(job => (
//             <div 
//               key={job.id} 
//               onClick={() => setSelectedJob(job)}
//               className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden ${selectedJob?.id === job.id ? 'border-blue-600 bg-blue-50/30 shadow-lg translate-x-2' : 'border-slate-100 bg-white hover:border-blue-200'}`}
//             >
//               <div className="flex justify-between items-start mb-4">
//                 <h4 className="font-bold text-xl">{job.title}</h4>
//                 <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-1 rounded text-slate-500">Exp: {job.experience}</span>
//               </div>
//               <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-500">
//                 <div className="flex items-center gap-2"><MapPin size={14} className="text-blue-500"/> {job.location}</div>
//                 <div className="flex items-center gap-2"><Clock size={14} className="text-blue-500"/> {job.type}</div>
//                 <div className="flex items-center gap-2"><Calendar size={14} className="text-blue-500"/> Ends: {job.expiresAt}</div>
//                 <div className="flex items-center gap-2 font-bold text-blue-600"><Wallet size={14} /> {job.salaryRange.split(' ')[0]}...</div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* RIGHT: COMPREHENSIVE JOB VIEW */}
//         <div className="lg:col-span-7">
//           {selectedJob ? (
//             <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 sticky top-24 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
//               <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 pb-10 border-b border-slate-100">
//                 <div>
//                   <div className="flex items-center gap-3 text-sm font-bold text-blue-600 mb-2 uppercase tracking-widest">
//                     {selectedJob.department} • Posted {selectedJob.createdAt}
//                   </div>
//                   <h2 className="text-4xl font-extrabold mb-4">{selectedJob.title}</h2>
//                   <div className="flex flex-wrap gap-4">
//                     <div className="flex items-center gap-1 text-slate-600 font-bold text-sm bg-slate-100 px-4 py-2 rounded-full">
//                       <DollarSign size={14} /> {selectedJob.salaryRange}
//                     </div>
//                     <div className="flex items-center gap-1 text-slate-600 font-bold text-sm bg-slate-100 px-4 py-2 rounded-full">
//                       <Briefcase size={14} /> {selectedJob.experience} Required
//                     </div>
//                   </div>
//                 </div>
//                 <button 
//                   onClick={() => setIsApplyModalOpen(true)}
//                   className="w-full md:w-auto px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
//                 >
//                   Apply to Role
//                 </button>
//               </div>

//               <div className="space-y-10">
//                 <section>
//                   <h5 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
//                     <Globe size={20} className="text-blue-600"/> The Opportunity
//                   </h5>
//                   <p className="text-slate-600 leading-relaxed text-lg">{selectedJob.description}</p>
//                 </section>

//                 <div className="grid md:grid-cols-2 gap-10">
//                   <section>
//                     <h5 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-widest text-blue-600">Roles & Responsibilities</h5>
//                     <ul className="space-y-3">
//                       {selectedJob.responsibilities.map((item, i) => (
//                         <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
//                           <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-1" /> {item}
//                         </li>
//                       ))}
//                     </ul>
//                   </section>
//                   <section>
//                     <h5 className="font-bold text-slate-900 mb-4 uppercase text-xs tracking-widest text-blue-600">Skills Required</h5>
//                     <div className="flex flex-wrap gap-2">
//                       {selectedJob.skills.map((skill, i) => (
//                         <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">{skill}</span>
//                       ))}
//                     </div>
//                   </section>
//                 </div>

//                 <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
//                   <h5 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
//                     <Zap size={18} className="text-yellow-500"/> Employee Benefits
//                   </h5>
//                   <div className="grid grid-cols-2 gap-4">
//                     {selectedJob.benefits.map((benefit, i) => (
//                       <div key={i} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
//                         <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" /> {benefit}
//                       </div>
//                     ))}
//                   </div>
//                 </section>
//               </div>
//             </div>
//           ) : (
//             <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 p-12 text-center">
//               <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 mb-6 shadow-sm">
//                 <Briefcase size={40} />
//               </div>
//               <h4 className="text-2xl font-bold text-slate-800 mb-3">Explore Your Next Challenge</h4>
//               <p className="text-slate-500 max-w-sm">Select a vacancy from the left to view comprehensive details and application requirements.</p>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* --- ENHANCED APPLY MODAL --- */}
//       {isApplyModalOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
//           <div className="w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl relative my-8 animate-in zoom-in-95 duration-300">
//             <button 
//               onClick={() => setIsApplyModalOpen(false)} 
//               className="absolute top-8 right-8 p-3 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-full transition-all z-10"
//             >
//               <X size={24} />
//             </button>

//             <div className="p-8 md:p-16">
//               <div className="mb-12">
//                 <h3 className="text-3xl font-extrabold mb-2">Application for {selectedJob.title}</h3>
//                 <p className="text-slate-500">Please provide accurate professional and financial details.</p>
//               </div>

//               <form className="space-y-8">
//                 {/* PERSONAL INFO */}
//                 <div className="grid md:grid-cols-3 gap-6">
//                   <div className="space-y-2">
//                     <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Full Name *</label>
//                     <input type="text" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
//                   </div>
//                   <div className="space-y-2">
//                     <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Email Address *</label>
//                     <input type="email" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
//                   </div>
//                   <div className="space-y-2">
//                     <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Phone Number *</label>
//                     <input type="tel" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
//                   </div>
//                 </div>

//                 {/* CAREER DETAILS */}
//                 <div className="grid md:grid-cols-2 gap-6">
//                   <div className="space-y-2">
//                     <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Current Company</label>
//                     <input type="text" placeholder="Current Employer" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
//                   </div>
//                   <div className="space-y-2">
//                     <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Current Location</label>
//                     <input type="text" placeholder="City, Country" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
//                   </div>
//                 </div>

//                 {/* EXPERIENCE & SALARY */}
//                 <div className="grid md:grid-cols-3 gap-6">
//                   <div className="space-y-2">
//                     <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Years of Experience (YOE)</label>
//                     <input type="text" placeholder="e.g. 5 Years 4 Months" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
//                   </div>
//                   <div className="space-y-2">
//                     <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Current Salary (CTC)</label>
//                     <input type="text" placeholder="e.g. ₹15,00,000" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
//                   </div>
//                   <div className="space-y-2">
//                     <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Expected Salary</label>
//                     <input type="text" placeholder="e.g. ₹20,00,000" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
//                   </div>
//                 </div>

//                 {/* LINKS */}
//                 <div className="grid md:grid-cols-2 gap-6">
//                   <div className="space-y-2">
//                     <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Portfolio / LinkedIn URL</label>
//                     <input type="url" placeholder="https://linkedin.com/in/..." className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
//                   </div>
//                   <div className="space-y-2">
//                     <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Resume Link (G-Drive/Dropbox)</label>
//                     <input type="url" placeholder="Link to your PDF resume" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Message for the Team (Optional)</label>
//                   <textarea rows="3" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="Tell us something that isn't on your resume..."></textarea>
//                 </div>

//                 <button className="w-full py-5 bg-blue-600 text-white font-bold rounded-[1.5rem] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 text-lg">
//                   Submit Official Application
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CareerPage;


import React, { useState, useEffect } from "react";
import { 
  Search, MapPin, Briefcase, Clock, X, ArrowRight, CheckCircle2, 
  Upload, ChevronRight, Building2, DollarSign, Calendar, Layers, 
  Award, Wallet, Globe, Zap, Sparkles, User, Mail, Phone, Link as LinkIcon
} from "lucide-react";
import { Helmet } from "react-helmet";

const CareerPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplyDrawerOpen, setIsApplyDrawerOpen] = useState(false);

  const categories = ["All", "Engineering", "Marketing", "Design", "Sales"];

  const jobs = [
    {
      id: 1,
      title: "Lead Frontend Engineer",
      department: "Engineering",
      location: "Remote / Noida",
      type: "Full-time",
      salaryRange: "₹18L - ₹25L PA",
      experience: "5+ Years",
      createdAt: "Feb 15, 2026",
      expiresAt: "March 30, 2026",
      description: "Join our core engineering team to build high-performance React architectures. You'll be working on global-scale SaaS products using React 19 and Next.js.",
      responsibilities: ["Architect scalable UI components", "Optimize for Core Web Vitals", "Mentor junior developers"],
      skills: ["React", "TypeScript", "Tailwind", "Next.js"],
      benefits: ["Remote First", "Equity Options", "Annual Retreats"]
    },
    {
      id: 2,
      title: "Growth Marketing Lead",
      department: "Marketing",
      location: "Hybrid / Bangalore",
      type: "Full-time",
      salaryRange: "₹15L - ₹22L PA",
      experience: "4+ Years",
      createdAt: "Feb 20, 2026",
      expiresAt: "April 10, 2026",
      description: "Scale our client acquisition engines through data-driven PPC and SEO strategies. You'll manage a monthly budget of $50k+.",
      responsibilities: ["Manage multi-channel ad spend", "Funnel optimization", "Weekly ROI reporting"],
      skills: ["Google Ads", "GA4", "SQL", "Copywriting"],
      benefits: ["Performance Bonus", "Health Insurance", "MacBook Pro"]
    }
  ];

  // Auto-select first job on load for better desktop UX
  useEffect(() => {
    if (!selectedJob && jobs.length > 0) setSelectedJob(jobs[0]);
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || job.department === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-[#fcfcfd] text-slate-900 font-sans min-h-screen selection:bg-blue-100">
      <Helmet>
        <title>Careers | Target Trek</title>
      </Helmet>

      {/* --- HERO --- */}
      <section className="pt-32 pb-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
                <Sparkles size={14} /> Join the Trek
              </span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-4">
                Work on things that <span className="text-blue-600 italic underline decoration-blue-200">matter.</span>
              </h1>
              <p className="text-slate-500 text-lg">Help us engineer the future of digital performance marketing.</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${selectedCategory === cat ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN EXPLORER --- */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT: SEARCH & CARDS (Scrollable area) */}
          <div className="lg:col-span-5 space-y-4 h-fit">
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by role name..." 
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all shadow-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {filteredJobs.map(job => (
                <div 
                  key={job.id} 
                  onClick={() => setSelectedJob(job)}
                  className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer group relative ${selectedJob?.id === job.id ? 'border-blue-600 bg-white shadow-xl translate-x-1' : 'border-transparent bg-white hover:border-slate-200 shadow-sm'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className={`font-bold text-lg leading-tight ${selectedJob?.id === job.id ? 'text-blue-600' : 'text-slate-800'}`}>{job.title}</h4>
                    <span className="shrink-0 text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
                      {job.experience}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1"><MapPin size={12} className="text-blue-500"/> {job.location}</span>
                    <span className="flex items-center gap-1"><Clock size={12} className="text-green-500"/> {job.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: DETAILED VIEW (Sticky) */}
          <div className="lg:col-span-7">
            {selectedJob ? (
              <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden sticky top-8 shadow-2xl shadow-slate-200/50 animate-in fade-in zoom-in-95 duration-300">
                <div className="p-8 md:p-12">
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-blue-100">
                      {selectedJob.department}
                    </span>
                    <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-100">
                      Posted: {selectedJob.createdAt}
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 leading-none">{selectedJob.title}</h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Salary Range</p>
                      <p className="text-sm font-bold text-slate-700">{selectedJob.salaryRange}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Experience</p>
                      <p className="text-sm font-bold text-slate-700">{selectedJob.experience}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Location</p>
                      <p className="text-sm font-bold text-slate-700">{selectedJob.location.split('/')[0]}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Deadline</p>
                      <p className="text-sm font-bold text-red-500">{selectedJob.expiresAt}</p>
                    </div>
                  </div>

                  <div className="prose prose-slate mb-10">
                    <h4 className="text-lg font-bold mb-3">About the Role</h4>
                    <p className="text-slate-600 leading-relaxed">{selectedJob.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <div>
                      <h4 className="text-sm font-black uppercase text-slate-400 mb-4 tracking-tighter">Your Mission</h4>
                      <ul className="space-y-3">
                        {selectedJob.responsibilities.map((r, i) => (
                          <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium leading-snug">
                            <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" /> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase text-slate-400 mb-4 tracking-tighter">Tech Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.skills.map((s, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setIsApplyDrawerOpen(true)}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-[1.5rem] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-200 group"
                  >
                    Apply for this position <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[500px] border-2 border-dashed border-slate-200 rounded-[3rem]">
                <p className="text-slate-400 font-medium">Select a role to view details</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- APPLICATION DRAWER (Scrollable & Readable) --- */}
      {isApplyDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsApplyDrawerOpen(false)}
          />
          
          {/* Side Drawer */}
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            {/* Drawer Header */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Application</h3>
                <p className="text-sm text-blue-600 font-bold">{selectedJob.title}</p>
              </div>
              <button 
                onClick={() => setIsApplyDrawerOpen(false)}
                className="p-3 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-10 custom-scrollbar">
              
              {/* Personal Info */}
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <User size={14} className="text-blue-500"/> Personal Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 ml-1">Full Name</label>
                    <input type="text" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Enter name"/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 ml-1">Email</label>
                    <input type="email" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="email@example.com"/>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 ml-1">Phone Number</label>
                  <input type="tel" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="+91 ..."/>
                </div>
              </div>

              {/* Employment Meta */}
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <Building2 size={14} className="text-blue-500"/> Employment Details
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 ml-1">Current Company</label>
                    <input type="text" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Company Name"/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 ml-1">Current Location</label>
                    <input type="text" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="e.g. Noida, India"/>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 ml-1">Current CTC</label>
                    <input type="text" className="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="₹ ..."/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 ml-1">Expected CTC</label>
                    <input type="text" className="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="₹ ..."/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 ml-1">YOE</label>
                    <input type="text" className="w-full px-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="e.g. 4.5"/>
                  </div>
                </div>
              </div>

              {/* Links & Resume */}
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <LinkIcon size={14} className="text-blue-500"/> Professional Links
                </h4>
                <div className="space-y-4">
                  <input type="url" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="LinkedIn / Portfolio URL"/>
                  <div className="border-2 border-dashed border-slate-100 rounded-[2rem] p-10 text-center hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer group">
                    <Upload className="mx-auto text-slate-300 mb-3 group-hover:text-blue-500 group-hover:scale-110 transition-all" size={32} />
                    <p className="text-sm font-bold text-slate-600">Drop your CV here</p>
                    <p className="text-xs text-slate-400 mt-1">Accepting PDF, DOC up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Optional Message */}
              <div className="space-y-6 pb-20">
                 <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">Anything else?</h4>
                 <textarea rows="4" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Tell us why you're a great fit..."></textarea>
              </div>
            </div>

            {/* Sticky Drawer Footer */}
            <div className="p-8 border-t border-slate-100 bg-white sticky bottom-0 z-20">
              <button className="w-full py-5 bg-slate-900 hover:bg-black text-white font-bold rounded-[1.5rem] transition-all shadow-xl">
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPage;