

// import React, { useEffect } from 'react';
// import { NavLink } from 'react-router-dom';
// import { Target, Eye, Rocket, Users, Zap, Lightbulb, CheckSquare, Settings, BarChart3, TrendingUp, Handshake, Briefcase } from 'lucide-react';
// import { HashLink } from 'react-router-hash-link';
// import { FaInstagram, FaFacebookF, FaWhatsapp, FaLinkedinIn } from 'react-icons/fa';
// import Helmet from 'react-helmet';
// const AboutPage = () => {
//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   const coreValues = [
//     { icon: <Lightbulb size={28} className="text-blue-600" />, title: 'Fresh Perspectives', description: 'We bring innovative ideas and modern strategies, unburdened by outdated methods.' },
//     { icon: <Target size={28} className="text-blue-600" />, title: 'Client-Centric Focus', description: 'Your success is our primary goal. We are dedicated to understanding and achieving your objectives.' },
//     { icon: <Handshake size={28} className="text-blue-600" />, title: 'Collaborative Spirit', description: 'We believe in true partnership, working closely with you every step of the way.' },
//     { icon: <CheckSquare size={28} className="text-blue-600" />, title: 'Agility & Adaptability', description: 'As a new agency, we are nimble and quick to adapt to the latest digital trends.' },
//   ];

//   const approachSteps = [
//     { icon: <Settings size={28} className="text-purple-600" />, title: 'Understand & Strategize', description: 'We start with a deep dive into your business to build a tailored, effective roadmap.' },
//     { icon: <Zap size={28} className="text-purple-600" />, title: 'Implement & Refine', description: 'We execute campaigns diligently, focusing on continuous improvement and optimization.' },
//     { icon: <BarChart3 size={28} className="text-purple-600" />, title: 'Measure & Report', description: 'We track progress closely and provide clear reports on key performance indicators.' },
//     { icon: <TrendingUp size={28} className="text-purple-600" />, title: 'Grow & Scale', description: 'Our goal is to build a strong foundation for your long-term digital growth.' },
//   ];

//   const commitmentPoints = [
//     { icon: <Users size={32} className="text-white" />, label: 'Dedicated Support' },
//     { icon: <TrendingUp size={32} className="text-white" />, label: 'Focus on Growth' },
//     { icon: <Lightbulb size={32} className="text-white" />, label: 'Innovative Solutions' },
//   ];


//   const phoneNumber = "9873208210";
//   const whatsappMessage = "Hello, I'm interested in learning more about Target Trek's services.";
//   const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;


//   return (
//     <div className="pt-16 md:pt-20 bg-white min-h-screen">
//       <Helmet>
//         <title>About  - Target Trek</title>
//         <meta name="description" content="Explore the latest digital marketing insights, trends, and strategies on the Target Trek blog." />
//         <meta property="og:title" content="Blog - Target Trek" />
//         <meta property="og:description" content="Explore the latest digital marketing insights, trends, and strategies on the Target Trek blog." />
//         <meta property="og:type" content="website" />
//       </Helmet>
//       <section className="py-16 lg:py-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-center">
//         <div className="max-w-4xl mx-auto px-4">
//           <h1 className="text-4xl md:text-5xl font-bold mb-3" itemProp="headline">About Target Trek</h1>
//           <p className="text-lg md:text-xl text-indigo-100" itemProp="description">
//             Your New Partner in Digital Growth and Innovation.
//           </p>
//         </div>
//       </section>

//       <section className="py-16 lg:py-24">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
//           <div className="order-1 md:order-2">
//             <img
//               src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80"
//               alt="Team planning digital strategy"
//               className="rounded-lg shadow-xl object-cover w-full"
//               itemProp="image"
//               onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e2e8f0/94a3b8?text=Planning"; }}
//             />
//           </div>
//           <div className="order-2 md:order-1 space-y-6">
//             <div itemProp="mission">
//               <h2 className="text-3xl font-bold text-gray-800 mb-4 inline-flex items-center">
//                 <Eye size={28} className="mr-3 text-blue-600" /> Our Mission
//               </h2>
//               <p className="text-lg text-gray-600">
//                 To empower emerging and established businesses to thrive in the digital space through creative, data-informed strategies and a commitment to genuine partnership. We aim to make impactful digital marketing accessible and effective.
//               </p>
//             </div>
//             <div itemProp="vision">
//               <h2 className="text-3xl font-bold text-gray-800 mb-4 inline-flex items-center">
//                 <Rocket size={28} className="mr-3 text-purple-600" /> Our Vision
//               </h2>
//               <p className="text-lg text-gray-600">
//                 To become a trusted digital growth partner, known for our innovative approach, transparent practices, and dedication to helping our clients achieve their ambitious online goals.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className="py-16 lg:py-24 bg-gray-50" itemProp="approach">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12 lg:mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Our Planned Approach</h2>
//             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//               A structured methodology we'll employ for your success.
//             </p>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
//             {approachSteps.map((step) => (
//               <div key={step.title} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out border border-gray-100">
//                 <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4 w-14 h-14">
//                   {step.icon}
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-800 mb-2" itemProp="approachStepTitle">{step.title}</h3>
//                 <p className="text-gray-600 text-sm" itemProp="approachStepDescription">{step.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section className="py-16 lg:py-24" itemProp="coreValues">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12 lg:mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Our Core Values</h2>
//             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
//               The principles guiding our launch and future growth.
//             </p>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
//             {coreValues.map((value) => (
//               <div key={value.title} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out border border-gray-100">
//                 <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4 w-14 h-14">
//                   {value.icon}
//                 </div>
//                 <h3 className="text-xl font-semibold text-gray-800 mb-2" itemProp="coreValueTitle">{value.title}</h3>
//                 <p className="text-gray-600 text-sm" itemProp="coreValueDescription">{value.description}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section className="py-16 lg:py-24 bg-gray-50" itemProp="industryFocus">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <Briefcase size={32} className="mx-auto text-indigo-600 mb-4" />
//           <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Industries We're Excited About</h2>
//           <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
//             We're eager to apply our digital skills across various sectors. We're particularly interested in partnering with businesses in:
//           </p>
//           <div className="flex flex-wrap justify-center gap-4">
//             <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-full" itemProp="industry">Startups & Tech</span>
//             <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-full" itemProp="industry">E-commerce Brands</span>
//             <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-full" itemProp="industry">Local Businesses</span>
//             <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-full" itemProp="industry">Creative Industries</span>
//             <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-full" itemProp="industry">Service Providers</span>
//           </div>
//           <p className="text-md text-gray-500 mt-6">
//             (Don't see your industry? Let's chat! We love new challenges.)
//           </p>
//         </div>
//       </section>

//       <section className="py-16 lg:py-24 bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50" itemProp="commitment">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//           {/* Heading */}
//           <div className="text-center mb-12">
//             <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
//               Our Commitment to You
//             </h2>
//             <p className="text-lg text-gray-600 mt-2">
//               What you can expect when partnering with us.
//             </p>
//           </div>

//           {/* Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

//             {commitmentPoints.map((point) => (
//               <div
//                 key={point.label}
//                 className="bg-white rounded-xl shadow-md hover:shadow-lg transition duration-300 p-8 text-center border border-gray-100"
//                 itemProp="commitmentPoint"
//               >
//                 <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-indigo-100 text-indigo-600">
//                   {point.icon}
//                 </div>

//                 <h3 className="text-xl font-semibold text-gray-800 mb-2" itemProp="commitmentPointLabel">
//                   {point.label}
//                 </h3>

//                 <p className="text-gray-600 text-sm">
//                   {point.label === "Dedicated Support" && "We’re always here to assist you with quick responses and ongoing guidance."}
//                   {point.label === "Focus on Growth" && "Every strategy we create is designed to deliver measurable results and long-term success."}
//                   {point.label === "Innovative Solutions" && "We bring fresh ideas and modern techniques to keep you ahead of the competition."}
//                 </p>
//               </div>
//             ))}

//           </div>
//         </div>
//       </section>

//       <section
//         className="py-16 bg-gradient-to-r from-indigo-200 via-blue-200 to-indigo-300 text-gray-900"
//         itemProp="callToAction"
//       >
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

//           {/* Heading */}
//           <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
//             Ready to Grow With Us?
//           </h2>

//           {/* Subtext */}
//           <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
//             Be one of our first partners! Let’s discuss how our fresh, data-driven approach
//             can help your business grow faster and smarter.
//           </p>

//           {/* CTA Button */}
//           <HashLink
//             to="/contact#contact-us"
//             className="inline-block bg-indigo-600 text-white px-10 py-3 rounded-full text-lg font-medium hover:bg-indigo-700 transition duration-300 shadow-md hover:scale-105"
//           >
//             Get In Touch
//           </HashLink>

//           {/* Social Icons */}
//           <div className="mt-8 flex justify-center gap-5">

//             <a
//               href="https://www.facebook.com/targettreks/"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="p-3 bg-white rounded-full shadow hover:bg-indigo-100 transition"
//               aria-label="Instagram"
//             >
//               <FaInstagram className="text-xl text-gray-700" />
//             </a>

//             <a
//               href="https://www.facebook.com/targettreks/"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="p-3 bg-white rounded-full shadow hover:bg-indigo-100 transition"
//               aria-label="Facebook"
//             >
//               <FaFacebookF className="text-xl text-gray-700" />
//             </a>

//             <a
//               href="https://wa.me/9873208210"
//               className="p-3 bg-white rounded-full shadow hover:bg-indigo-100 transition"
//               aria-label="WhatsApp"
//             >
//               <FaWhatsapp className="text-xl text-gray-700" />
//             </a>

//             <a
//               href="https://www.linkedin.com/company/target-trek/"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="p-3 bg-white rounded-full shadow hover:bg-indigo-100 transition"
//               aria-label="LinkedIn"
//             >
//               <FaLinkedinIn className="text-xl text-gray-700" />
//             </a>

//           </div>

//         </div>
//       </section>
//       <style jsx global>{`

//         /* Added for the click effect */
//         .scale-110 {
//           transform: scale(1.1);
//         }
//         .transition-colors {
//           transition: color 0.3s ease;
//         }
//         .hover\:text-indigo-200:hover {
//           color: #d946ef; /* Tailwind's indigo-200 */
//         }
//         .text-indigo-200{
//           color: #d946ef;
//         }

//       `}</style>
//     </div>
//   );
// };

// export default AboutPage;
import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { Helmet } from "react-helmet";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Briefcase,
  CheckCircle2,
  CheckSquare,
  Code2,
  Eye,
  GraduationCap,
  Handshake,
  Layers3,
  Lightbulb,
  Megaphone,
  MonitorSmartphone,
  Network,
  Rocket,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaWhatsapp,
} from "react-icons/fa";

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";
const CANONICAL_URL = `${SITE_URL}/about`;

const SEO_TITLE =
  "About Target Trek | Ebooks, Digital Marketing, Web & AI Development";

const SEO_DESCRIPTION =
  "Learn about Target Trek and our services including developer ebooks, digital marketing, social media marketing, web development, AI development, GenAI resources, and digital growth solutions.";

const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80";

const PHONE_NUMBER = "9873208210";

const WHATSAPP_MESSAGE =
  "Hello, I'm interested in learning more about Target Trek's services.";

const WHATSAPP_LINK = `https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE
)}`;

const services = [
  {
    icon: BookOpen,
    title: "Developer Ebooks",
    description:
      "Practical technical ebooks and interview resources covering system design, backend engineering, GenAI, AI agents, RAG, MCP, Google ADK, and modern software engineering.",
    points: [
      "System Design & Backend",
      "GenAI & AI Agents",
      "Interview Preparation",
      "Practical Code & Architecture",
    ],
    accent: "blue",
  },
  {
    icon: Megaphone,
    title: "Digital Marketing",
    description:
      "Digital marketing strategies designed to help businesses improve their online presence, reach the right audience, and create measurable growth opportunities.",
    points: [
      "Digital Growth Strategy",
      "Campaign Planning",
      "Audience Acquisition",
      "Performance Optimization",
    ],
    accent: "violet",
  },
  {
    icon: Share2,
    title: "Social Media Marketing",
    description:
      "Social media strategy and execution focused on building brand visibility, engaging audiences, and creating consistent communication across digital platforms.",
    points: [
      "Social Media Strategy",
      "Content Planning",
      "Brand Presence",
      "Audience Engagement",
    ],
    accent: "pink",
  },
  {
    icon: MonitorSmartphone,
    title: "Web Development",
    description:
      "Modern, responsive, and scalable websites and web applications built around your business goals, user experience, performance, and long-term maintainability.",
    points: [
      "Business Websites",
      "Web Applications",
      "Responsive Design",
      "Backend & API Integration",
    ],
    accent: "emerald",
  },
  {
    icon: Bot,
    title: "AI Development",
    description:
      "AI-powered applications and automation solutions using modern GenAI technologies, intelligent workflows, APIs, retrieval systems, and custom AI integrations.",
    points: [
      "AI Applications",
      "GenAI Integration",
      "AI Agents & Automation",
      "RAG & Knowledge Systems",
    ],
    accent: "amber",
  },
];

const coreValues = [
  {
    icon: Lightbulb,
    title: "Fresh Perspectives",
    description:
      "We bring modern thinking to technology, learning, digital marketing, AI, and product development.",
  },
  {
    icon: Target,
    title: "Client-Centric Focus",
    description:
      "We begin with the actual goal instead of forcing the same solution onto every project or customer.",
  },
  {
    icon: Handshake,
    title: "Collaborative Spirit",
    description:
      "We believe strong outcomes come from understanding the problem and working closely with the people we serve.",
  },
  {
    icon: CheckSquare,
    title: "Agility & Adaptability",
    description:
      "We adapt quickly to changing technology, digital platforms, AI capabilities, and evolving business needs.",
  },
];

const approachSteps = [
  {
    icon: Settings,
    title: "Understand",
    description:
      "We first understand the business, user, technical challenge, learning goal, or growth objective.",
  },
  {
    icon: Target,
    title: "Strategize",
    description:
      "We convert the objective into a clear roadmap with priorities, technology, channels, or learning structure.",
  },
  {
    icon: Zap,
    title: "Build & Execute",
    description:
      "We implement the plan through development, AI, content, marketing, or educational resources.",
  },
  {
    icon: BarChart3,
    title: "Measure & Improve",
    description:
      "We review outcomes, identify gaps, improve the solution, and build toward sustainable growth.",
  },
];

const commitmentPoints = [
  {
    icon: Users,
    title: "Dedicated Support",
    description:
      "We aim to provide helpful support across our services, digital products, and ebook purchases.",
  },
  {
    icon: TrendingUp,
    title: "Growth Focused",
    description:
      "Our work is centered around practical improvement, measurable value, and long-term usefulness.",
  },
  {
    icon: Lightbulb,
    title: "Modern Solutions",
    description:
      "We actively explore modern web technologies, AI, GenAI, engineering practices, and digital growth strategies.",
  },
];

const ebookTopics = [
  {
    icon: Network,
    title: "System Design",
    description:
      "High-Level Design and Low-Level Design resources covering scalable architecture, databases, caching, APIs, distributed systems, and interview thinking.",
  },
  {
    icon: Sparkles,
    title: "Generative AI",
    description:
      "Developer-focused material on RAG, MCP, AI agents, Google ADK, orchestration, evaluation, security, and production GenAI systems.",
  },
  {
    icon: Code2,
    title: "Backend Engineering",
    description:
      "Practical concepts around APIs, services, databases, caching, queues, reliability, concurrency, and production engineering.",
  },
  {
    icon: GraduationCap,
    title: "Interview Preparation",
    description:
      "Structured resources connecting concepts, diagrams, trade-offs, implementation, interview questions, and practical revision.",
  },
];

const ebookPrinciples = [
  {
    icon: BookOpen,
    title: "Concept First",
    description:
      "Understand why a concept exists before moving into implementation.",
  },
  {
    icon: Layers3,
    title: "Architecture & Flow",
    description:
      "Use diagrams, workflows, and system boundaries to understand how components connect.",
  },
  {
    icon: Code2,
    title: "Implementation",
    description:
      "Move from theory into practical code, commands, APIs, and engineering examples.",
  },
  {
    icon: ShieldCheck,
    title: "Production Thinking",
    description:
      "Consider scalability, failures, security, reliability, observability, cost, and operational trade-offs.",
  },
];

const audiences = [
  "Software Developers",
  "Backend Engineers",
  "GenAI Engineers",
  "Interview Candidates",
  "Startups",
  "Small Businesses",
  "Growing Brands",
  "Businesses Exploring AI",
];

const industryFocus = [
  "Startups & Tech",
  "E-commerce Brands",
  "Local Businesses",
  "Creative Industries",
  "Service Providers",
  "Software Products",
  "Education",
  "AI-First Businesses",
];

const getAccentClasses = (accent) => {
  const accents = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      pill: "bg-blue-50 text-blue-700 border-blue-100",
      hover: "hover:border-blue-200",
    },
    violet: {
      icon: "bg-violet-50 text-violet-600",
      pill: "bg-violet-50 text-violet-700 border-violet-100",
      hover: "hover:border-violet-200",
    },
    pink: {
      icon: "bg-pink-50 text-pink-600",
      pill: "bg-pink-50 text-pink-700 border-pink-100",
      hover: "hover:border-pink-200",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      pill: "bg-emerald-50 text-emerald-700 border-emerald-100",
      hover: "hover:border-emerald-200",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600",
      pill: "bg-amber-50 text-amber-700 border-amber-100",
      hover: "hover:border-amber-200",
    },
  };

  return accents[accent] || accents.blue;
};

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        description:
          "Target Trek provides developer ebooks, digital marketing, social media marketing, web development, AI development, and digital growth solutions.",
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/favicon.ico`,
        },
        sameAs: [
          "https://www.facebook.com/targettreks/",
          "https://www.linkedin.com/company/target-trek/",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: `+91-${PHONE_NUMBER}`,
          contactType: "customer support",
          areaServed: "Worldwide",
          availableLanguage: ["English"],
        },
        knowsAbout: [
          "Developer Ebooks",
          "Software Engineering",
          "System Design",
          "Backend Engineering",
          "Generative AI",
          "AI Agents",
          "Retrieval-Augmented Generation",
          "Model Context Protocol",
          "Google ADK",
          "Digital Marketing",
          "Social Media Marketing",
          "Web Development",
          "Artificial Intelligence Development",
          "GenAI Development",
          "Digital Growth",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: SITE_URL,
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        inLanguage: "en",
      },
      {
        "@type": "AboutPage",
        "@id": `${CANONICAL_URL}#webpage`,
        url: CANONICAL_URL,
        name: SEO_TITLE,
        description: SEO_DESCRIPTION,
        inLanguage: "en",
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        about: {
          "@id": `${SITE_URL}/#organization`,
        },
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        breadcrumb: {
          "@id": `${CANONICAL_URL}#breadcrumb`,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: ABOUT_IMAGE,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${CANONICAL_URL}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "About Target Trek",
            item: CANONICAL_URL,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: "Target Trek Services",
        itemListElement: services.map((service, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type":
              service.title === "Developer Ebooks"
                ? "Product"
                : "Service",
            name: service.title,
            description: service.description,
            provider: {
              "@id": `${SITE_URL}/#organization`,
            },
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white pt-16 md:pt-20">
      <Helmet>
        <title>{SEO_TITLE}</title>

        <meta
          name="description"
          content={SEO_DESCRIPTION}
        />

        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        <meta
          name="googlebot"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
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
          content={ABOUT_IMAGE}
        />

        <meta
          property="og:image:alt"
          content="Target Trek developer ebooks, digital marketing, web development and AI development"
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
          content={ABOUT_IMAGE}
        />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <main>
        <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-white via-blue-50/70 to-indigo-50">
          <div className="pointer-events-none absolute -right-48 -top-48 h-[520px] w-[520px] rounded-full bg-blue-300/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-56 -left-36 h-[480px] w-[480px] rounded-full bg-indigo-300/20 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <nav
              aria-label="Breadcrumb"
              className="mb-9 flex items-center gap-2 text-xs font-semibold text-slate-400"
            >
              <NavLink
                to="/"
                className="transition hover:text-blue-600"
              >
                Home
              </NavLink>

              <span aria-hidden="true">/</span>

              <span className="text-slate-600">
                About
              </span>
            </nav>

            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.15em] text-blue-700 shadow-sm">
                  <Sparkles size={14} />
                  Technology · Learning · Digital Growth
                </div>

                <h1 className="mt-7 text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  We build digital solutions
                  <span className="mt-2 block text-blue-600">
                    and practical learning resources.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  Target Trek is a technology and digital growth
                  platform offering developer ebooks, digital
                  marketing, social media marketing, web development,
                  and AI development services.
                </p>

                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                  Whether you are a developer trying to strengthen
                  your skills or a business looking to improve its
                  digital presence, build a modern application, or
                  explore AI, our focus is on practical solutions that
                  create meaningful value.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <HashLink
                    smooth
                    to="/contact#contact-us"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    Discuss Your Project
                    <ArrowRight size={17} />
                  </HashLink>

                  <NavLink
                    to="/books"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Explore Ebooks
                    <BookOpen size={17} />
                  </NavLink>
                </div>

                <div className="mt-9 flex flex-wrap gap-2">
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
                <div className="absolute inset-10 rounded-full bg-blue-300/20 blur-[80px]" />

                <div className="relative rounded-[32px] border border-blue-100 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] sm:p-7">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 sm:p-7">
                    <span className="text-[11px] font-black uppercase tracking-[0.17em] text-blue-600">
                      Target Trek
                    </span>

                    <h2 className="mt-2 text-2xl font-black text-slate-950">
                      Five areas. One practical approach.
                    </h2>

                    <div className="mt-7 space-y-3">
                      {[
                        [
                          BookOpen,
                          "Developer Learning",
                          "Ebooks, interviews, system design and GenAI.",
                        ],
                        [
                          Megaphone,
                          "Digital Marketing",
                          "Strategy, campaigns and digital growth.",
                        ],
                        [
                          Share2,
                          "Social Media",
                          "Brand presence, content and engagement.",
                        ],
                        [
                          MonitorSmartphone,
                          "Web Development",
                          "Modern websites and web applications.",
                        ],
                        [
                          Bot,
                          "AI Development",
                          "AI apps, agents, automation and GenAI.",
                        ],
                      ].map(([Icon, title, text]) => (
                        <div
                          key={title}
                          className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Icon size={19} />
                          </div>

                          <div>
                            <h3 className="text-sm font-black text-slate-900">
                              {title}
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white py-7">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-4 sm:px-6 md:grid-cols-5 lg:px-8">
            {[
              [BookOpen, "Developer Ebooks"],
              [Megaphone, "Digital Marketing"],
              [Share2, "Social Media"],
              [MonitorSmartphone, "Web Development"],
              [Bot, "AI Development"],
            ].map(([Icon, text]) => (
              <div
                key={text}
                className="flex items-center gap-3 text-sm font-bold text-slate-700"
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                What We Do
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Our services and products
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                Target Trek works across technology, digital growth,
                AI, and education. Each area is different, but the
                approach remains the same: understand the problem,
                build something useful, and continuously improve it.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {services.map((service, index) => {
                const Icon = service.icon;
                const accent = getAccentClasses(service.accent);

                return (
                  <article
                    key={service.title}
                    className={`group rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${accent.hover} ${
                      index === 0
                        ? "lg:col-span-2 lg:grid lg:grid-cols-[.8fr_1.2fr] lg:gap-12 lg:p-9"
                        : ""
                    }`}
                  >
                    <div>
                      <div
                        className={`flex h-13 w-13 h-[52px] w-[52px] items-center justify-center rounded-2xl ${accent.icon}`}
                      >
                        <Icon size={25} />
                      </div>

                      <p className="mt-6 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        {index === 0
                          ? "Learning Products"
                          : "Professional Service"}
                      </p>

                      <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                        {service.title}
                      </h3>

                      <p className="mt-4 text-sm leading-7 text-slate-600">
                        {service.description}
                      </p>

                      {index === 0 && (
                        <NavLink
                          to="/books"
                          className="mt-6 inline-flex items-center gap-2 text-sm font-black text-blue-600 transition hover:text-blue-700"
                        >
                          Explore Developer Ebooks
                          <ArrowRight size={16} />
                        </NavLink>
                      )}

                      {index !== 0 && (
                        <HashLink
                          smooth
                          to="/contact#contact-us"
                          className="mt-6 inline-flex items-center gap-2 text-sm font-black text-blue-600 transition hover:text-blue-700"
                        >
                          Discuss this service
                          <ArrowRight size={16} />
                        </HashLink>
                      )}
                    </div>

                    <div
                      className={`grid gap-3 ${
                        index === 0
                          ? "mt-7 sm:grid-cols-2 lg:mt-0"
                          : "mt-7 sm:grid-cols-2"
                      }`}
                    >
                      {service.points.map((point) => (
                        <div
                          key={point}
                          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold ${accent.pill}`}
                        >
                          <CheckCircle2
                            size={16}
                            className="shrink-0"
                          />

                          {point}
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <div className="relative">
                <div className="absolute -inset-5 rounded-[36px] bg-gradient-to-br from-blue-100 to-indigo-100" />

                <img
                  src={ABOUT_IMAGE}
                  alt="Target Trek team planning technology and digital growth solutions"
                  className="relative aspect-[4/3] w-full rounded-[28px] object-cover shadow-xl"
                  loading="lazy"
                />
              </div>
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Our Purpose
              </span>

              <h2 className="mt-3 flex items-center gap-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                <Eye
                  size={29}
                  className="text-blue-600"
                />
                Our Mission
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                To help businesses and developers make better use of
                technology, digital platforms, and practical knowledge.
              </p>

              <p className="mt-4 text-base leading-8 text-slate-600">
                For businesses, this means helping with digital
                marketing, social media, websites, AI applications,
                and modern digital solutions.
              </p>

              <p className="mt-4 text-base leading-8 text-slate-600">
                For developers, it means building structured technical
                resources that simplify complex engineering topics and
                help connect concepts with implementation and
                production thinking.
              </p>

              <div className="mt-9 border-t border-slate-200 pt-8">
                <span className="text-xs font-black uppercase tracking-[0.16em] text-indigo-600">
                  Where We Are Going
                </span>

                <h2 className="mt-3 flex items-center gap-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  <Rocket
                    size={29}
                    className="text-indigo-600"
                  />
                  Our Vision
                </h2>

                <p className="mt-5 text-base leading-8 text-slate-600">
                  To build Target Trek into a trusted technology,
                  education, and digital-growth platform where
                  businesses can find modern solutions and developers
                  can find practical resources for continuous growth.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Developer Learning
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Ebooks are one part of Target Trek.
              </h2>

              <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                Our developer-learning library focuses on practical
                technical topics that engineers frequently encounter
                while building systems and preparing for software
                engineering or GenAI interviews.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {ebookTopics.map((item) => {
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

            <div className="mt-10 text-center">
              <NavLink
                to="/books"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-7 py-3.5 text-sm font-black text-white transition hover:bg-blue-700"
              >
                Browse Developer Ebooks
                <ArrowRight size={17} />
              </NavLink>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-12 lg:grid-cols-[.85fr_1.15fr]">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                  How We Build Learning Resources
                </span>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Learn the idea, understand the flow, then build it.
                </h2>

                <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
                  Our technical resources aim to connect theory,
                  architecture, implementation, trade-offs, and
                  production considerations rather than presenting
                  topics as isolated definitions.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {ebookPrinciples.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={item.title}
                      className="rounded-3xl border border-slate-200 bg-white p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Icon size={21} />
                        </div>

                        <span className="font-mono text-xs font-black text-slate-300">
                          0{index + 1}
                        </span>
                      </div>

                      <h3 className="mt-5 text-lg font-black text-slate-950">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {item.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-950 py-20 text-white lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr]">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-300">
                  Who We Work For
                </span>

                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  Developers, startups, brands, and businesses.
                </h2>

                <p className="mt-5 max-w-xl leading-8 text-blue-100/80">
                  Because Target Trek works across education,
                  technology, AI, development, and digital growth, our
                  audience ranges from individual software engineers
                  to businesses looking for modern digital solutions.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {audiences.map((audience) => (
                  <div
                    key={audience}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <CheckCircle2
                      size={17}
                      className="shrink-0 text-blue-300"
                    />

                    <span className="text-sm font-bold text-white">
                      {audience}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">
                How We Work
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                A practical four-step approach
              </h2>

              <p className="mt-4 text-lg leading-8 text-slate-600">
                Whether it is a website, AI application, marketing
                strategy, social presence, or learning resource, we
                start by understanding the actual problem.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {approachSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <article
                    key={step.title}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                        <Icon size={23} />
                      </div>

                      <span className="font-mono text-xs font-black text-slate-300">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-black text-slate-950">
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

        <section className="bg-white py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                What Guides Us
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Our Core Values
              </h2>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {coreValues.map((value) => {
                const Icon = value.icon;

                return (
                  <article
                    key={value.title}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg"
                  >
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Icon size={26} />
                    </div>

                    <h3 className="mt-5 text-xl font-black text-slate-950">
                      {value.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {value.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <Briefcase
              size={34}
              className="mx-auto text-indigo-600"
            />

            <span className="mt-5 block text-xs font-black uppercase tracking-[0.16em] text-indigo-600">
              Industries & Businesses
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Businesses we are excited to work with
            </h2>

            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              Our digital marketing, social media, web development,
              and AI development capabilities can support businesses
              across a variety of industries.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {industryFocus.map((industry) => (
                <span
                  key={industry}
                  className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700"
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Our Commitment
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                What you can expect from Target Trek
              </h2>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {commitmentPoints.map((point) => {
                const Icon = point.icon;

                return (
                  <article
                    key={point.title}
                    className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                      <Icon size={30} />
                    </div>

                    <h3 className="mt-6 text-xl font-black text-slate-950">
                      {point.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {point.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-16 text-white lg:py-20">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-300">
              Work With Target Trek
            </span>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Need a website, marketing strategy, or AI solution?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Tell us what you are trying to build or grow. We can
              discuss your requirement and explore how web
              development, AI development, digital marketing, or
              social media can support your goals.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <HashLink
                smooth
                to="/contact#contact-us"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-black text-white transition hover:bg-blue-500"
              >
                Discuss Your Project
                <ArrowRight size={17} />
              </HashLink>

              <NavLink
                to="/books"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Explore Ebooks
                <BookOpen size={17} />
              </NavLink>
            </div>

            <div className="mt-9 flex justify-center gap-4">
              <a
                href="https://www.facebook.com/targettreks/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Target Trek on Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white hover:text-blue-700"
              >
                <FaFacebookF />
              </a>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact Target Trek on WhatsApp"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white hover:text-emerald-600"
              >
                <FaWhatsapp />
              </a>

              <a
                href="https://www.linkedin.com/company/target-trek/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Target Trek on LinkedIn"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white hover:text-blue-700"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;