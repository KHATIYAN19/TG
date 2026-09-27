// import React, { useState, useEffect } from 'react';
// import { NavLink } from 'react-router-dom';
// import axios from 'axios';
// import {
//   Rocket, BarChart, PenTool, Smartphone, Users, Star, ChevronRight,
//   Lightbulb, Briefcase, TrendingUp, Handshake, ShieldCheck, Award,
//   Globe, Code, Target, Megaphone, Clock, CalendarCheck, Quote
// } from 'lucide-react';
// import BASE_URL from "../utils/Url.js";
// import { Helmet } from 'react-helmet';
// import { PiBuildingOffice } from "react-icons/pi";

// import LeadPopup from './LeadPopup.jsx';
// const HomePage = () => {
//   const services = [
//   { 
//     icon: <BarChart size={32} className="text-blue-600" />, 
//     title: 'Digital Marketing', 
//     description: 'Targeted campaigns that deliver real results and drive measurable growth.', 
//     link: '/services/affiliate-marketing' 
//   },
//   { 
//     icon: <Users size={32} className="text-blue-600" />, 
//     title: 'Social Media Management', 
//     description: 'Build authentic audience engagement and amplify your brand presence across all platforms.', 
//     link: '/services/social-media-marketing' 
//   },
//   { 
//     icon: <PenTool size={32} className="text-blue-600" />, 
//     title: 'Content Strategy & Creation', 
//     description: 'Craft compelling stories and valuable content that resonates with your target audience.', 
//     link: '/services/content-marketing' 
//   },
//   { 
//     icon: <Smartphone size={32} className="text-blue-600" />, 
//     title: 'Web Development & Design', 
//     description: 'Develop modern, responsive, and high-performing websites that captivate your visitors.', 
//     link: '/services/web-development' 
//   },
//   { 
//     icon: <Megaphone size={32} className="text-blue-600" />, 
//     title: 'Paid Advertising (PPC)', 
//     description: 'Maximize your ROI with precisely targeted pay-per-click campaigns on leading platforms.', 
//     link: '/services/ppc-advertising' 
//   },
//   { 
//     icon: <Code size={32} className="text-blue-600" />, 
//     title: 'GenAI Solutions', 
//     description: 'Leverage cutting-edge generative AI to automate workflows, enhance creativity, and drive innovation.', 
//     link: '/services/genai-solutions' 
//   },
// ];

//   const whyChooseUs = [
//     { icon: <Lightbulb size={32} className="text-green-600" />, title: 'Innovative Strategies', description: 'We stay ahead of the curve, employing the latest trends and technologies to give you an edge.' },
//     { icon: <Handshake size={32} className="text-green-600" />, title: 'Client-Centric Approach', description: 'Your success is our priority. We work closely with you to understand and achieve your goals.' },
//     { icon: <Award size={32} className="text-green-600" />, title: 'Proven Track Record', description: 'Our history of successful campaigns and satisfied clients speaks for itself.' },
//     { icon: <ShieldCheck size={32} className="text-green-600" />, title: 'Transparency & Trust', description: 'We believe in clear communication and honest reporting every step of the way.' },
//   ];

//   const ourProcess = [
//     { icon: <Target size={32} className="text-purple-600" />, title: 'Discovery & Analysis', description: 'We dive deep to understand your brand, audience, and objectives.' },
//     { icon: <PenTool size={32} className="text-purple-600" />, title: 'Strategy Development', description: 'Crafting a tailored plan designed for maximum impact and ROI.' },
//     { icon: <Rocket size={32} className="text-purple-600" />, title: 'Execution & Optimization', description: 'Implementing campaigns with continuous monitoring and refinement.' },
//     { icon: <TrendingUp size={32} className="text-purple-600" />, title: 'Reporting & Growth', description: 'Providing clear insights and evolving strategies for sustained success.' },
//   ];

//   const [reviews, setReviews] = useState([]);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [apiError, setApiError] = useState(false);
//   const[AutoSlide,setAutoSlide]=useState(true);
//   useEffect(() => {
//   window.scrollTo(0, 0);
//   }, []);
//   useEffect(() => {
//     const fetchReviews = async () => {
//       try {
//         const response = await axios.get(`${BASE_URL}/admin/reviews/published`);
//         if (response.data?.success && response.data.reviews.length > 0) {
//           setReviews(response.data.reviews.filter(review => review.clientFeedback && review.name && review.rating));
//         } else {
//           setApiError(true);
//         }
//       } catch (error) {
//         console.error("Error fetching reviews:", error);
//         setApiError(true);
//       }
//     };
//     fetchReviews();
//   }, []);

  
//   const renderStars = (rating) => {
//     return [...Array(5)].map((_, i) => (
//       <Star
//         key={i}
//         size={18}
//         className={`${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
//       />
//     ));
//   };

//   return (
    
//     <div className="bg-white">
//       <Helmet>
//         <title>Home - Target Trek | Digital Marketing & Web Solutions</title>
//         <meta name="description" content="Target Trek offers expert digital marketing, web development, and social media services to elevate your business online. Get started today!" />
//         <meta property="og:title" content="Home - Target Trek | Digital Marketing & Web Solutions" />
//         <meta property="og:description" content="Target Trek offers expert digital marketing, web development, and social media services to elevate your business online. Get started today!" />
//         <meta property="og:type" content="website" />
//         <meta property="og:url" content="https://www.yourwebsitename.com/" />
//         <meta property="og:image" content="https://images.unsplash.com/photo-1517245381832-ce26706f5263?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
//         <link rel="canonical" href="https://www.yourwebsitename.com/" />
//       </Helmet>
//       <LeadPopup />
//       {/* Hero Section */}
//       <section className="bg-gradient-to-br from-blue-50 to-white">
//         <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center gap-16">
//           <div className="md:w-1/2 space-y-6 text-center md:text-left">
//             <h1 className="text-4xl md:text-5xl font-bold text-blue-900 leading-tight">
//               Elevate Your Business with<br />
//               <span className="text-blue-600">Digital Excellence</span>
//             </h1>
//             <p className="text-lg text-blue-700 max-w-xl mx-auto md:mx-0">
//               Transform your online presence with our strategic digital solutions tailored for growth and impact.
//             </p>
//             <div className="flex gap-4 justify-center md:justify-start">
//               <NavLink
//                 to="/services"
//                 className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
//               >
//                 <Rocket size={20} />
//                 Explore Services
//               </NavLink>
//               <NavLink
//                 to="/contact"
//                 className="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
//               >
//                 <Handshake size={20} />
//                 Get a Quote
//               </NavLink>
//             </div>
//           </div>
//           <div className="md:w-1/2">
//             <img
//               src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
//               alt="Digital strategy and collaboration"
//               className="rounded-2xl shadow-xl w-full h-auto object-cover max-h-[500px]"
//             />
//           </div>
//         </div>
//       </section>

//       ---

//       {/* About Us / Mission Section */}
//       <section className="py-24 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
//           <div className="md:w-1/2">
//             <img
//               src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=884&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
//               alt="Our Team Working Together"
//               className="rounded-2xl shadow-xl w-full h-auto object-cover max-h-[500px]"
//             />
//           </div>
//           <div className="md:w-1/2 space-y-6 text-center md:text-left">
//             <h2 className="text-3xl font-bold text-blue-900 mb-4">
//               Who We Are: Your Partner in Digital Growth
//             </h2>
//             <p className="text-lg text-blue-700">
//               At <b className='text-black'>Target Trek</b>, we're passionate about helping businesses thrive in the digital landscape.
//               We combine cutting-edge strategies with a deep understanding of your unique challenges
//               to deliver measurable results. Our team of experts is dedicated to transforming your online presence
//               into a powerful engine for success.
//             </p>
//             <p className="text-lg text-blue-700">
//               From boosting your brand visibility to generating quality leads, we're here to guide you
//               every step of the way. Let's achieve your digital goals together.
//             </p>
//             <NavLink
//               to="/about"
//               className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 group mt-4"
//             >
//               Learn More About Us
//               <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
//             </NavLink>
//           </div>
//         </div>
//       </section>

//       ---

//       {/* Services Section */}
//       <section className="py-24 bg-white">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl font-bold text-blue-900 mb-4">
//               Our Comprehensive Digital Solutions
//             </h2>
//             <p className="text-blue-600 text-lg max-w-2xl mx-auto">
//               From strategic planning to execution, we offer a full suite of services designed to accelerate your business growth.
//             </p>
//           </div>
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
//             {services.map((service) => (
//               <div
//                 key={service.title}
//                 className="bg-white p-8 rounded-xl border border-blue-50 hover:border-blue-100 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1"
//               >
//                 <div className="w-14 h-14 flex items-center justify-center bg-blue-50 rounded-full mb-6">
//                   {service.icon}
//                 </div>
//                 <h3 className="text-xl font-semibold text-blue-900 mb-3">
//                   {service.title}
//                 </h3>
//                 <p className="text-blue-600 text-base mb-6">{service.description}</p>
//                 <NavLink
//                   to={service.link}
//                   className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 group"
//                 >
//                   Discover More
//                   <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                 </NavLink>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       ---

//       {/* Why Choose Us Section */}
//       <section className="py-24 bg-blue-50">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl font-bold text-blue-900 mb-4">
//               Why Partner with Target Trek?
//             </h2>
//             <p className="text-blue-600 text-lg max-w-2xl mx-auto">
//               We're more than just a service provider; we're your dedicated growth partner.
//             </p>
//           </div>
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {whyChooseUs.map((item) => (
//               <div
//                 key={item.title}
//                 className="bg-white p-8 rounded-xl border border-green-50 shadow-sm text-center"
//               >
//                 <div className="w-16 h-16 flex items-center justify-center bg-green-50 rounded-full mx-auto mb-6">
//                   {item.icon}
//                 </div>
//                 <h3 className="text-xl font-semibold text-blue-900 mb-3">
//                   {item.title}
//                 </h3>
//                 <p className="text-gray-600">{item.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       ---

//       {/* Our Process Section */}
//       <section className="py-24 bg-white">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="text-center mb-16">
//             <h2 className="text-3xl font-bold text-blue-900 mb-4">
//               Our Proven Path to Your Success
//             </h2>
//             <p className="text-blue-600 text-lg max-w-2xl mx-auto">
//               We follow a streamlined, client-focused process to ensure optimal results and satisfaction.
//             </p>
//           </div>
//           <div className="relative grid md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {ourProcess.map((step, index) => (
//               <div
//                 key={step.title}
//                 className="relative bg-white p-8 rounded-xl border border-purple-50 shadow-md text-center group"
//               >
//                 <div className="w-16 h-16 flex items-center justify-center bg-purple-50 rounded-full mx-auto mb-6 transition-transform group-hover:scale-110">
//                   {step.icon}
//                 </div>
//                 <h3 className="text-xl font-semibold text-blue-900 mb-3">
//                   {step.title}
//                 </h3>
//                 <p className="text-gray-600">{step.description}</p>
//                 <div className="absolute -top-4 -right-4 bg-purple-600 text-white w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold shadow-lg">
//                   {index + 1}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       ---

//       {/* Testimonials Section - NEW REDESIGN */}
//       {reviews.length > 0 && (
//         <section className="py-20 bg-slate-50 relative overflow-hidden">
//           <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
//           <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

//           <div className="max-w-6xl mx-auto px-6 relative z-10">
//             <div className="text-center mb-12">
//               <span className="text-blue-600 font-bold tracking-widest uppercase text-xs">Testimonials</span>
//               <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">Success Stories</h2>
//             </div>

//             <div 
//               className="overflow-hidden"
//               onMouseEnter={() => setAutoSlide(false)}
//               onMouseLeave={() => setAutoSlide(true)}
//             >
//               <div
//                 className="flex transition-transform duration-700 ease-in-out"
//                 style={{ transform: `translateX(-${currentSlide * 100}%)` }}
//               >
//                 {/* We chunk the reviews into groups of 3 for desktop grid sliding */}
//                 {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, groupIdx) => (
//                   <div key={groupIdx} className="flex-none w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {reviews.slice(groupIdx * 3, groupIdx * 3 + 3).map((review) => (
//                       <div key={review._id} className="h-full">
//                         <div className="group bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
//                           <div className="flex items-center gap-3 mb-4">
//                             <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white text-lg font-bold">
//                               {review.name?.charAt(0)}
//                             </div>
//                             <div className="overflow-hidden">
//                               <h4 className="font-bold text-slate-800 text-sm truncate">{review.name}</h4>
//                               <p className="text-[11px] text-slate-500 truncate">{review.position} @ {review.companyName}</p>
//                             </div>
//                           </div>
//                           <div className="flex gap-0.5 mb-3">{renderStars(review.rating, 14)}</div>
//                           <p className="text-slate-600 text-sm leading-relaxed italic flex-grow">
//                             "{review.clientFeedback}"
//                           </p>
//                           <div className="mt-4 pt-3 border-t border-slate-50 flex justify-between items-center">
//                             <PiBuildingOffice className="text-slate-300" size={16} />
//                             <Quote size={16} className="text-blue-100 group-hover:text-blue-200 transition-colors" />
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Pagination */}
//             <div className="flex justify-center gap-2 mt-10">
//               {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, idx) => (
//                 <button
//                   key={idx}
//                   onClick={() => setCurrentSlide(idx)}
//                   className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300'}`}
//                 />
//               ))}
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Stats/Achievements Section */}
//       <section className="py-24 bg-white">
//         <div className="max-w-7xl mx-auto px-6 text-center">
//           <h2 className="text-3xl font-bold text-blue-900 mb-12">
//             Driving Results for Businesses
//           </h2>
//           <div className="grid md:grid-cols-3 gap-12">
//             <div className="flex flex-col items-center">
//               <TrendingUp size={64} className="text-orange-500 mb-4" />
//               <p className="text-5xl font-bold text-blue-700">250+</p>
//               <p className="text-lg text-gray-600 mt-2">Successful Projects</p>
//             </div>
//             <div className="flex flex-col items-center">
//               <Users size={64} className="text-purple-500 mb-4" />
//               <p className="text-5xl font-bold text-blue-700">100%</p>
//               <p className="text-lg text-gray-600 mt-2">Client Satisfaction</p>
//             </div>
//             <div className="flex flex-col items-center">
//               <Clock size={64} className="text-teal-500 mb-4" />
//               <p className="text-5xl font-bold text-blue-700">5+</p>
//               <p className="text-lg text-gray-600 mt-2">Years of Expertise</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       ---

//       {/* CTA Section - Enhanced and Beautiful */}
//       <section className="py-24 bg-white relative overflow-hidden">
//         <div className="absolute inset-0">
//           <img
//             src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YnVzaW5lc3MlMjBzdHJhdGVneXxlbnwwfHwwfHx8MA%3D%3D"
//             alt="Business Transformation Background"
//             className="w-full h-full object-cover"
//           />
//           <div className="absolute inset-0 bg-white opacity-80"></div> {/* White overlay */}
//         </div>
//         <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
//           <div className="p-8 md:p-12 rounded-2xl bg-blue-600 bg-opacity-90 shadow-xl"> {/* Added a blue background to the internal card */}
//             <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
//               Ready to Transform Your Business <br className="hidden md:inline"/> and Achieve Digital Dominance?
//             </h2>
//             <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
//               Don't let your competitors get ahead. Schedule a free, no-obligation consultation with our experts
//               and discover how a tailored digital strategy can unlock your true potential.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <NavLink
//                 to="/contact"
//                 className="bg-white text-blue-700 px-8 py-4 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 justify-center shadow-lg transform hover:scale-105"
//               >
//                 <CalendarCheck size={20} />
//                 Schedule Your Free Consultation
//               </NavLink>
//               <NavLink
//                 to="/portfolio"
//                 className="border border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-medium transition-colors flex items-center gap-2 justify-center transform hover:scale-105"
//               >
//                 <Globe size={20} />
//                 Explore Our Success Stories
//               </NavLink>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default HomePage;

import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Bot,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Globe,
  Handshake,
  Lightbulb,
  Megaphone,
  PenTool,
  Quote,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Workflow,
  Smartphone,
} from "lucide-react";
import { Helmet } from "react-helmet";
import { PiBuildingOffice } from "react-icons/pi";
import BASE_URL from "../utils/Url.js";

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";
const CANONICAL_URL = `${SITE_URL}/`;
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

const SEO_TITLE =
  "Target Trek | Digital Marketing, Web Development, AI & Developer Ebooks";

const SEO_DESCRIPTION =
  "Target Trek offers digital marketing, social media marketing, web development, AI and GenAI development, PPC, content strategy, and practical developer ebooks for system design and GenAI.";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop";

const TEAM_IMAGE =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1400&auto=format&fit=crop";

const services = [
  {
    icon: BarChart3,
    title: "Digital Marketing",
    description:
      "Growth-focused digital strategies designed to improve visibility, reach the right audience, and turn attention into measurable business opportunities.",
    link: "/services/affiliate-marketing",
    keywords: ["Growth Strategy", "Campaigns", "Performance"],
  },
  {
    icon: Users,
    title: "Social Media Marketing",
    description:
      "Build a stronger brand presence with platform strategy, content planning, audience engagement, and consistent social communication.",
    link: "/services/social-media-marketing",
    keywords: ["Social Strategy", "Content", "Engagement"],
  },
  {
    icon: PenTool,
    title: "Content Strategy & Creation",
    description:
      "Create useful content that supports brand positioning, search visibility, audience education, and customer acquisition across digital channels.",
    link: "/services/content-marketing",
    keywords: ["Content Strategy", "Brand Content", "SEO Content"],
  },
  {
    icon: Smartphone,
    title: "Web Development & Design",
    description:
      "Modern, responsive, and performance-focused websites and web applications built around usability, maintainability, and business goals.",
    link: "/services/web-development",
    keywords: ["Websites", "Web Apps", "API Integration"],
  },
  {
    icon: Megaphone,
    title: "Paid Advertising (PPC)",
    description:
      "Plan and optimize paid campaigns with audience targeting, conversion-focused landing experiences, and performance measurement.",
    link: "/services/ppc-advertising",
    keywords: ["Google Ads", "Paid Campaigns", "Optimization"],
  },
  {
    icon: Bot,
    title: "AI & GenAI Development",
    description:
      "Build AI-powered applications, RAG systems, intelligent assistants, agents, workflow automation, and custom GenAI integrations.",
    link: "/services/genai-solutions",
    keywords: ["AI Apps", "RAG", "AI Agents"],
  },
];

const whyChooseUs = [
  {
    icon: Lightbulb,
    title: "Modern Thinking",
    description:
      "We combine current digital practices, software engineering, AI, and practical experimentation instead of relying on one fixed playbook.",
  },
  {
    icon: Handshake,
    title: "Client-Centric Approach",
    description:
      "We start with your business objective, audience, technical requirements, and constraints before recommending a solution.",
  },
  {
    icon: Award,
    title: "Outcome Focus",
    description:
      "Our work is organized around useful outcomes: stronger digital presence, better systems, effective automation, or clearer learning.",
  },
  {
    icon: ShieldCheck,
    title: "Transparency & Trust",
    description:
      "We value clear communication, realistic expectations, understandable deliverables, and practical reporting throughout the engagement.",
  },
];

const ourProcess = [
  {
    icon: Search,
    title: "Discovery & Analysis",
    description:
      "We understand the business, users, technology, market, current setup, and the outcome you want to achieve.",
  },
  {
    icon: Target,
    title: "Strategy & Architecture",
    description:
      "We define a focused roadmap covering priorities, channels, technical decisions, workflows, and measurable goals.",
  },
  {
    icon: Rocket,
    title: "Build & Execute",
    description:
      "We move from plan to execution across development, AI, content, marketing, or digital product work.",
  },
  {
    icon: TrendingUp,
    title: "Measure & Improve",
    description:
      "We review what is working, identify gaps, iterate on the solution, and improve the next stage using real feedback.",
  },
];

const capabilityCards = [
  {
    icon: Code2,
    title: "Web Products",
    description:
      "Responsive websites, React applications, backend integrations, APIs, dashboards, and business workflows.",
  },
  {
    icon: Bot,
    title: "AI Applications",
    description:
      "GenAI applications, RAG pipelines, AI agents, intelligent workflows, automation, and model integrations.",
  },
  {
    icon: Megaphone,
    title: "Digital Growth",
    description:
      "Digital marketing, social media, content, paid advertising, and conversion-focused digital strategy.",
  },
  {
    icon: BookOpen,
    title: "Developer Learning",
    description:
      "Practical ebooks and resources for system design, backend engineering, GenAI, AI agents, RAG, MCP, and interviews.",
  },
];

const ebookTopics = [
  "System Design HLD",
  "System Design LLD",
  "RAG Pipelines",
  "Model Context Protocol",
  "Google ADK",
  "AI Agents",
  "Backend Engineering",
  "GenAI Interviews",
];

const industries = [
  "Startups",
  "Technology Companies",
  "E-commerce",
  "Local Businesses",
  "Professional Services",
  "Education",
  "Creator Brands",
  "AI-First Products",
];

const faqs = [
  {
    question: "What services does Target Trek offer?",
    answer:
      "Target Trek offers digital marketing, social media marketing, content strategy, web development, paid advertising, AI and GenAI development, and practical developer ebooks and learning resources.",
  },
  {
    question: "Can Target Trek build a website or web application?",
    answer:
      "Yes. We work on modern websites and web applications with responsive user experiences, frontend development, backend integrations, APIs, and business-specific workflows.",
  },
  {
    question: "Do you provide AI and GenAI development services?",
    answer:
      "Yes. Our AI work can include GenAI applications, RAG systems, AI agents, workflow automation, model integrations, and custom AI-powered product features depending on the project requirements.",
  },
  {
    question: "Does Target Trek offer digital and social media marketing?",
    answer:
      "Yes. We provide digital marketing, social media marketing, content strategy, and paid advertising support focused on visibility, audience engagement, campaigns, and measurable growth.",
  },
  {
    question: "What kind of developer ebooks are available?",
    answer:
      "Our developer learning resources focus on practical engineering topics such as High-Level Design, Low-Level Design, backend engineering, RAG, MCP, Google ADK, AI agents, and GenAI interview preparation.",
  },
  {
    question: "How can I discuss a project with Target Trek?",
    answer:
      "You can use the contact page to share your requirement. We can review the objective, scope, expected outcome, and suitable next steps before moving forward.",
  },
];

const HomePage = () => {
  const [reviews, setReviews] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoSlide, setAutoSlide] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/admin/reviews/published`,
          {
            signal: controller.signal,
          }
        );

        const publishedReviews = Array.isArray(response?.data?.reviews)
          ? response.data.reviews.filter(
              (review) =>
                review?.clientFeedback &&
                review?.name &&
                Number(review?.rating) > 0
            )
          : [];

        setReviews(publishedReviews);
      } catch (error) {
        if (
          error?.name === "CanceledError" ||
          error?.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error("Error fetching reviews:", error);
        setReviews([]);
      }
    };

    fetchReviews();

    return () => controller.abort();
  }, []);

  const reviewPageCount = Math.ceil(reviews.length / 3);

  useEffect(() => {
    if (!autoSlide || reviewPageCount <= 1) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setCurrentSlide(
        (current) => (current + 1) % reviewPageCount
      );
    }, 6000);

    return () => window.clearInterval(interval);
  }, [autoSlide, reviewPageCount]);

  useEffect(() => {
    if (
      currentSlide >= reviewPageCount &&
      reviewPageCount > 0
    ) {
      setCurrentSlide(0);
    }
  }, [currentSlide, reviewPageCount]);

  const structuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: SITE_NAME,
          url: SITE_URL,
          email: SUPPORT_EMAIL,
          description:
            "Target Trek provides digital marketing, social media marketing, web development, AI and GenAI development, paid advertising, content strategy, and developer learning resources.",
          sameAs: [
            "https://www.facebook.com/targettreks/",
            "https://www.linkedin.com/company/target-trek/",
          ],
          knowsAbout: [
            "Digital Marketing",
            "Social Media Marketing",
            "Web Development",
            "Artificial Intelligence",
            "Generative AI",
            "RAG",
            "AI Agents",
            "System Design",
            "Backend Engineering",
            "Developer Education",
          ],
        },
        {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          url: SITE_URL,
          name: SITE_NAME,
          publisher: {
            "@id": `${SITE_URL}/#organization`,
          },
          inLanguage: "en",
        },
        {
          "@type": "WebPage",
          "@id": `${CANONICAL_URL}#webpage`,
          url: CANONICAL_URL,
          name: SEO_TITLE,
          description: SEO_DESCRIPTION,
          isPartOf: {
            "@id": `${SITE_URL}/#website`,
          },
          about: {
            "@id": `${SITE_URL}/#organization`,
          },
          publisher: {
            "@id": `${SITE_URL}/#organization`,
          },
          inLanguage: "en",
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: HERO_IMAGE,
          },
        },
        {
          "@type": "ItemList",
          name: "Target Trek Services",
          itemListElement: services.map(
            (service, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Service",
                name: service.title,
                description: service.description,
                provider: {
                  "@id": `${SITE_URL}/#organization`,
                },
                areaServed: "Worldwide",
                url: `${SITE_URL}${service.link}`,
              },
            })
          ),
        },
        {
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        },
      ],
    }),
    []
  );

  const renderStars = (rating) =>
    Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={17}
        aria-hidden="true"
        className={
          index < Number(rating)
            ? "fill-amber-400 text-amber-400"
            : "text-slate-200"
        }
      />
    ));

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Helmet>
        <title>{SEO_TITLE}</title>

        <meta
          name="description"
          content={SEO_DESCRIPTION}
        />

        <meta
          name="author"
          content={SITE_NAME}
        />

        <meta
          name="application-name"
          content={SITE_NAME}
        />

        <meta
          name="theme-color"
          content="#ffffff"
        />

        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        <meta
          name="googlebot"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        <link
          rel="canonical"
          href={CANONICAL_URL}
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:site_name"
          content={SITE_NAME}
        />

        <meta
          property="og:locale"
          content="en_IN"
        />

        <meta
          property="og:title"
          content={SEO_TITLE}
        />

        <meta
          property="og:description"
          content={SEO_DESCRIPTION}
        />

        <meta
          property="og:url"
          content={CANONICAL_URL}
        />

        <meta
          property="og:image"
          content={HERO_IMAGE}
        />

        <meta
          property="og:image:alt"
          content="Target Trek digital marketing, web development, AI development and developer learning"
        />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content={SEO_TITLE}
        />

        <meta
          name="twitter:description"
          content={SEO_DESCRIPTION}
        />

        <meta
          name="twitter:image"
          content={HERO_IMAGE}
        />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-blue-50 to-slate-50">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[460px] w-[460px] rounded-full bg-blue-200/40 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-44 -left-32 h-[380px] w-[380px] rounded-full bg-indigo-100/70 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 md:grid-cols-2 md:py-28 lg:gap-20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-blue-700 shadow-sm">
                <Sparkles size={14} />
                Technology · Marketing · AI · Learning
              </div>

              <h1 className="mt-7 text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Build a stronger digital presence

                <span className="mt-2 block text-blue-600">
                  with technology, AI, and growth.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Target Trek helps businesses with digital
                marketing, social media, web development, paid
                campaigns, and AI development. We also create
                practical developer ebooks for system design,
                backend engineering, and GenAI.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <NavLink
                  to="/services"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  <Rocket size={18} />

                  Explore Services
                </NavLink>

                <NavLink
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-4 text-sm font-black text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <Handshake size={18} />

                  Discuss Your Project
                </NavLink>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  "Digital Marketing",
                  "Social Media",
                  "Web Development",
                  "AI Development",
                  "Developer Ebooks",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-5 rounded-[36px] bg-gradient-to-br from-blue-100 to-indigo-100" />

              <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white p-3 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
                <img
                  src={HERO_IMAGE}
                  alt="Target Trek team planning digital marketing, web and AI solutions"
                  className="aspect-[4/3] w-full rounded-[22px] object-cover"
                  loading="eager"
                  fetchPriority="high"
                />

                <div className="grid gap-3 p-3 sm:grid-cols-2">
                  {[
                    [
                      Code2,
                      "Build",
                      "Web & digital products",
                    ],
                    [
                      Bot,
                      "Automate",
                      "AI & GenAI workflows",
                    ],
                    [
                      Megaphone,
                      "Grow",
                      "Marketing & acquisition",
                    ],
                    [
                      BookOpen,
                      "Learn",
                      "Developer resources",
                    ],
                  ].map(
                    ([Icon, title, description]) => (
                      <div
                        key={title}
                        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                          <Icon size={19} />
                        </div>

                        <div>
                          <p className="text-sm font-black text-slate-900">
                            {title}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {description}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white py-7">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-6 md:grid-cols-4">
            {[
              [Globe, "Digital Growth"],
              [Code2, "Web Development"],
              [Bot, "AI Development"],
              [BookOpen, "Developer Ebooks"],
            ].map(([Icon, text]) => (
              <div
                key={text}
                className="flex items-center justify-center gap-3 text-sm font-bold text-slate-700 md:justify-start"
              >
                <Icon
                  size={19}
                  className="shrink-0 text-blue-600"
                />

                {text}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                What Target Trek Does
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                One platform for digital growth, technology,
                AI, and learning.
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                We work across business growth and software
                technology. That means helping brands improve
                their digital presence while also building
                modern websites, AI solutions, and practical
                developer learning resources.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {capabilityCards.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Icon size={23} />
                    </div>

                    <h3 className="mt-5 text-xl font-black text-slate-950">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2">
            <div>
              <div className="relative">
                <div className="absolute -inset-5 rounded-[34px] bg-blue-100" />

                <img
                  src={TEAM_IMAGE}
                  alt="Target Trek team collaborating on technology and digital growth"
                  className="relative aspect-[4/3] w-full rounded-[28px] object-cover shadow-xl"
                  loading="lazy"
                />
              </div>
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                About Target Trek
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Your partner across digital growth and
                technology.
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                At{" "}
                <strong className="text-slate-900">
                  Target Trek
                </strong>
                , we work at the intersection of marketing,
                software development, AI, and technical
                learning.
              </p>

              <p className="mt-4 text-base leading-8 text-slate-600">
                For businesses, we provide digital marketing,
                social media, content, paid advertising, web
                development, and AI development. For developers,
                we build structured ebooks and learning
                resources around system design, backend
                engineering, and GenAI.
              </p>

              <p className="mt-4 text-base leading-8 text-slate-600">
                The goal is the same in every area: understand
                the problem clearly, build something useful,
                measure the outcome, and continue improving.
              </p>

              <NavLink
                to="/about"
                className="mt-7 inline-flex items-center gap-2 text-sm font-black text-blue-600 transition hover:text-blue-700"
              >
                Learn More About Target Trek

                <ChevronRight size={17} />
              </NavLink>
            </div>
          </div>
        </section>

        <section
          className="bg-white py-20 lg:py-24"
          id="services"
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Our Services
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Digital and technology services built around
                your goals.
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                From increasing online visibility to building
                custom web and AI solutions, our services are
                designed to support different stages of digital
                growth.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <article
                    key={service.title}
                    className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                  >
                    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Icon size={25} />
                    </div>

                    <h3 className="mt-6 text-xl font-black text-slate-950">
                      {service.title}
                    </h3>

                    <p className="mt-3 min-h-[84px] text-sm leading-7 text-slate-600">
                      {service.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {service.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>

                    <NavLink
                      to={service.link}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-black text-blue-600 transition group-hover:text-blue-700"
                    >
                      Discover More

                      <ArrowRight size={16} />
                    </NavLink>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-blue-50/60 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                  AI & Web Development
                </span>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Build modern software, then make it smarter
                  with AI.
                </h2>

                <p className="mt-5 text-base leading-8 text-slate-600">
                  We can help businesses move beyond a basic
                  website into modern web applications and
                  AI-enabled workflows. Depending on the use
                  case, that can include dashboards, APIs,
                  automation, RAG, intelligent assistants,
                  agents, and custom GenAI integrations.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  {[
                    "Responsive websites and web apps",
                    "Backend and API integrations",
                    "RAG and knowledge systems",
                    "AI agents and workflow automation",
                    "Internal tools and dashboards",
                    "Custom GenAI product features",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-4 text-sm font-bold text-slate-700"
                    >
                      <CheckCircle2
                        size={17}
                        className="shrink-0 text-blue-600"
                      />

                      {item}
                    </div>
                  ))}
                </div>

                <NavLink
                  to="/contact"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-blue-700"
                >
                  Discuss a Technology Project

                  <ArrowRight size={17} />
                </NavLink>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  [
                    Code2,
                    "Web Applications",
                    "Modern frontend and backend experiences for business workflows.",
                  ],
                  [
                    Workflow,
                    "Automation",
                    "Connect repetitive processes to APIs, AI, and controlled workflows.",
                  ],
                  [
                    Bot,
                    "AI Agents",
                    "Build assistants and agentic systems that can use tools and business context.",
                  ],
                  [
                    Search,
                    "RAG Systems",
                    "Connect AI applications to business documents and private knowledge.",
                  ],
                ].map(
                  ([Icon, title, description]) => (
                    <div
                      key={title}
                      className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <Icon size={23} />
                      </div>

                      <h3 className="mt-5 text-lg font-black text-slate-950">
                        {title}
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {description}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-12 lg:grid-cols-[.85fr_1.15fr]">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">
                  Developer Ebooks
                </span>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Practical learning resources for software
                  engineers.
                </h2>

                <p className="mt-5 text-base leading-8 text-slate-600">
                  Books are one part of Target Trek. Our
                  developer resources are designed to connect
                  theory with diagrams, implementation,
                  trade-offs, interview thinking, and
                  production considerations.
                </p>

                <NavLink
                  to="/books"
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-blue-700"
                >
                  Browse Developer Ebooks

                  <BookOpen size={17} />
                </NavLink>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {ebookTopics.map((topic, index) => (
                  <div
                    key={topic}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <span className="font-mono text-[10px] font-black text-blue-600">
                      0{index + 1}
                    </span>

                    <p className="mt-2 text-sm font-black text-slate-900">
                      {topic}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-emerald-600">
                Why Target Trek
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                A practical partner, not just another service
                provider.
              </h2>

              <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                We try to keep strategy, execution,
                communication, and technology understandable so
                you know what is being built and why it matters.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {whyChooseUs.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <Icon size={26} />
                    </div>

                    <h3 className="mt-5 text-lg font-black text-slate-950">
                      {item.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">
                Our Process
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                From requirement to measurable improvement.
              </h2>

              <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                The exact work changes by project, but we use a
                simple process to reduce confusion and keep
                execution aligned with the original goal.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {ourProcess.map((step, index) => {
                const Icon = step.icon;

                return (
                  <article
                    key={step.title}
                    className="relative rounded-3xl border border-violet-100 bg-violet-50/40 p-7"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">
                        <Icon size={23} />
                      </div>

                      <span className="font-mono text-xs font-black text-violet-300">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-black text-slate-950">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {step.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-blue-50/50 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Who We Can Work With
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Technology and growth needs look different for
                every business.
              </h2>

              <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                We are open to projects across different
                industries where better digital experiences,
                marketing, automation, or AI can create value.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {industries.map((industry) => (
                <span
                  key={industry}
                  className="rounded-full border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm"
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>
        </section>

        {reviews.length > 0 && (
          <section className="bg-white py-20 lg:py-24">
            <div className="mx-auto max-w-7xl px-6">
              <div className="mx-auto max-w-3xl text-center">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                  Testimonials
                </span>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  What people say about working with us.
                </h2>
              </div>

              <div
                className="mt-12 overflow-hidden"
                onMouseEnter={() =>
                  setAutoSlide(false)
                }
                onMouseLeave={() =>
                  setAutoSlide(true)
                }
              >
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{
                    transform: `translateX(-${
                      currentSlide * 100
                    }%)`,
                  }}
                >
                  {Array.from({
                    length: reviewPageCount,
                  }).map((_, groupIndex) => (
                    <div
                      key={groupIndex}
                      className="grid w-full flex-none grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
                    >
                      {reviews
                        .slice(
                          groupIndex * 3,
                          groupIndex * 3 + 3
                        )
                        .map((review) => (
                          <article
                            key={
                              review._id ||
                              `${review.name}-${review.clientFeedback}`
                            }
                            className="flex h-full flex-col rounded-3xl border border-slate-200 bg-slate-50 p-6"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-lg font-black text-white">
                                {review.name
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <h3 className="truncate text-sm font-black text-slate-900">
                                  {review.name}
                                </h3>

                                <p className="truncate text-xs text-slate-500">
                                  {[
                                    review.position,
                                    review.companyName,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              </div>
                            </div>

                            <div
                              className="mt-4 flex gap-0.5"
                              aria-label={`${review.rating} out of 5 stars`}
                            >
                              {renderStars(
                                review.rating
                              )}
                            </div>

                            <p className="mt-4 flex-1 text-sm italic leading-7 text-slate-600">
                              “{review.clientFeedback}”
                            </p>

                            <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
                              <PiBuildingOffice
                                className="text-slate-300"
                                size={17}
                              />

                              <Quote
                                className="text-blue-200"
                                size={18}
                              />
                            </div>
                          </article>
                        ))}
                    </div>
                  ))}
                </div>
              </div>

              {reviewPageCount > 1 && (
                <div className="mt-9 flex justify-center gap-2">
                  {Array.from({
                    length: reviewPageCount,
                  }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      aria-label={`Show testimonial group ${
                        index + 1
                      }`}
                      onClick={() =>
                        setCurrentSlide(index)
                      }
                      className={`h-2 rounded-full transition-all ${
                        currentSlide === index
                          ? "w-8 bg-blue-600"
                          : "w-2 bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="bg-slate-50 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
              Experience & Results
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Driving results across digital projects.
            </h2>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <TrendingUp
                  size={38}
                  className="mx-auto text-orange-500"
                />

                <p className="mt-5 text-4xl font-black text-slate-950">
                  250+
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Successful Projects
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <Users
                  size={38}
                  className="mx-auto text-violet-500"
                />

                <p className="mt-5 text-4xl font-black text-slate-950">
                  100%
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Client Satisfaction
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <Clock
                  size={38}
                  className="mx-auto text-teal-500"
                />

                <p className="mt-5 text-4xl font-black text-slate-950">
                  5+
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Years of Expertise
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-4xl px-6">
            <div className="text-center">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Frequently Asked Questions
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Questions about Target Trek
              </h2>

              <p className="mt-4 text-base leading-8 text-slate-600">
                A quick overview of our services, technology
                work, and developer learning resources.
              </p>
            </div>

            <div className="mt-10 space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                const answerId = `home-faq-answer-${index}`;

                return (
                  <div
                    key={faq.question}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() =>
                        setOpenFaq(
                          isOpen ? null : index
                        )
                      }
                      className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left"
                    >
                      <span className="font-black text-slate-900">
                        {faq.question}
                      </span>

                      <ChevronDown
                        size={19}
                        className={`shrink-0 text-slate-400 transition-transform ${
                          isOpen
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div
                        id={answerId}
                        className="border-t border-slate-200 bg-white px-5 py-5"
                      >
                        <p className="text-sm leading-7 text-slate-600">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 lg:py-24">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <div className="rounded-[32px] border border-blue-100 bg-white p-8 shadow-[0_25px_70px_rgba(15,23,42,0.08)] sm:p-12">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Start a Conversation
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Ready to build, automate, market, or grow?
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Tell us what you are trying to achieve. We can
                discuss the scope and explore whether digital
                marketing, web development, AI development, or
                another Target Trek service is the right fit.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <NavLink
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 text-sm font-black text-white transition hover:bg-blue-700"
                >
                  <CalendarCheck size={18} />

                  Contact Target Trek
                </NavLink>

                <NavLink
                  to="/books"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-4 text-sm font-black text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  <BookOpen size={18} />

                  Explore Ebooks
                </NavLink>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;