import React, { useState, useEffect } from "react";
import { HashLink } from "react-router-hash-link";
import {
  Code2,
  Database,
  Globe,
  Layout,
  Server,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  Boxes,
  ShoppingCart,
  Building2,
  Stethoscope,
  Briefcase,
  GraduationCap,
  SmartphoneNfc,
  HardDrive,
  Cloud
} from "lucide-react";
import { Helmet } from "react-helmet";

const WebDevelopmentPage = () => {
  const [faqOpen, setFaqOpen] = useState(null);
  const [showScroll, setShowScroll] = useState(false);

  const toggleFAQ = (index) => setFaqOpen(faqOpen === index ? null : index);
 
  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  const sectors = [
    { name: "E-Commerce", icon: <ShoppingCart size={24} />, desc: "High-scale platforms" },
    { name: "FinTech", icon: <Briefcase size={24} />, desc: "Secure banking apps" },
    { name: "HealthTech", icon: <Stethoscope size={24} />, desc: "Compliant portals" },
    { name: "EdTech", icon: <GraduationCap size={24} />, desc: "LMS systems" },
    { name: "SaaS", icon: <Layers size={24} />, desc: "B2B software" },
    { name: "Real Estate", icon: <Building2 size={24} />, desc: "CRM integrations" },
  ];

  const techStack = {
    frontend: ["React", "Next.js", "TypeScript", "Tailwind"],
    backend: ["FastAPI", "Node.js", "Express", "SpringBoot"],
    mobile: ["React Native", "Flutter", "Swift", "Kotlin"],
    database: ["PostgreSQL", "MongoDB", "MySQL", "Redis"]
  };

  const faqItems = [
    { q: "Do you build for both iOS and Android?", a: "Yes. We primarily use React Native and Flutter for cross-platform efficiency, but we also offer native Swift and Kotlin development for performance-critical applications." },
    { q: "How do you handle database migration?", a: "We use staged migration strategies with zero-downtime tools to ensure your existing data moves safely to modern SQL or NoSQL infrastructures." },
    { q: "What is your approach to app security?", a: "We implement end-to-end encryption, biometric authentication, and secure API handshakes to ensure user data is never compromised." }
  ];

  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-blue-100">
      <Helmet>
        <title>Full-Stack Development | Target Trek</title>
      </Helmet>

      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-40 md:pb-32 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-left animate-in fade-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-700 text-sm font-bold mb-6">
              <Code2 size={16} /> <span>End-to-End Product Engineering</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight mb-6">
              Web, Mobile & <br />
              <span className="text-blue-600">Infrastructure.</span>
            </h1>
            <p className="text-slate-600 text-lg md:text-xl mb-10 leading-relaxed max-w-lg">
              Target Trek engineers high-performance digital products. From sleek mobile apps 
              to heavy-duty database architectures, we build it all.
            </p>
            <HashLink to="/contact" className="px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xl shadow-blue-200 inline-flex items-center gap-2">
              Start Your Project <ArrowRight size={18} />
            </HashLink>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80"
              alt="Full Stack Development"
              className="relative rounded-[2rem] border-8 border-white shadow-2xl z-10 w-full h-[400px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* --- TECHNOLOGY STACK --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-blue-50/50 rounded-[3rem] p-10 md:p-16 border border-blue-100 relative shadow-sm">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Our Technology DNA</h2>
              <p className="text-slate-500">Optimized stacks for performance, security, and scalability.</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(techStack).map(([category, techs]) => (
                <div key={category} className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:border-blue-300 transition-all">
                  <h4 className="text-blue-600 font-bold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2">
                    <Zap size={12} /> {category}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {techs.map(t => (
                      <span key={t} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- WEB, MOBILE & DATABASE SECTIONS --- */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <img src="https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=350&auto=format&fit=crop" alt="Web UI" className="rounded-3xl shadow-xl w-full h-[350px] object-cover border border-slate-100" />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-bold mb-6">Scalable Web Systems</h2>
            <p className="text-slate-600 mb-8 text-lg">
              Using <strong>React</strong> and <strong>Next.js</strong>, we build web interfaces that handle millions of requests while maintaining pixel-perfect precision.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle2 className="text-blue-600" size={16}/> Server-Side Rendering</div>
              <div className="flex items-center gap-2 font-bold text-slate-700 text-sm"><CheckCircle2 className="text-blue-600" size={16}/> PWA Ready</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Cross-Platform Mobile</h2>
            <p className="text-slate-600 mb-8 text-lg">
              We specialize in <strong>React Native</strong> and <strong>Flutter</strong> to deliver native-feel apps for iOS and Android from a single codebase, reducing time-to-market by 40%.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm font-bold">
                <SmartphoneNfc className="text-blue-600" /> Native API & Sensor Access
              </div>
            </div>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=350&auto=format&fit=crop" alt="App Development" className="rounded-3xl shadow-xl w-full h-[350px] object-cover border border-slate-100" />
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <img src="https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&h=350&auto=format&fit=crop" alt="Database Systems" className="rounded-3xl shadow-xl w-full h-[350px] object-cover border border-slate-100" />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-bold mb-6">Database Excellence</h2>
            <p className="text-slate-600 mb-8 text-lg">
              Whether it's complex relational data in <strong>PostgreSQL</strong> or high-speed document storage in <strong>MongoDB</strong>, we design schemas optimized for speed and integrity.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 font-bold text-slate-700"><HardDrive className="text-blue-600" /> Distributed System Design</li>
              <li className="flex items-center gap-3 font-bold text-slate-700"><ShieldCheck className="text-blue-600" /> Automated Backups & Sharding</li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- DEVELOPMENT PROCESS --- */}
      <section className="py-24 bg-blue-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">Our Development Process</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1. Plan", desc: "Requirement analysis & roadmap" },
              { step: "2. Design", desc: "Wireframes & UI/UX design" },
              { step: "3. Develop", desc: "Frontend & backend implementation" },
              { step: "4. Deploy", desc: "Testing, CI/CD & production" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="text-2xl font-bold text-blue-600 mb-4">{item.step}</div>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PERFORMANCE & SECURITY --- */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold mb-12 text-center">Performance & Security</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: <Zap className="text-blue-600" />, title: "High Performance", desc: "Optimized code & caching for speed." },
            { icon: <ShieldCheck className="text-blue-600" />, title: "Secure by Design", desc: "End-to-end encryption & secure APIs." },
            { icon: <Server className="text-blue-600" />, title: "Reliable Infrastructure", desc: "Redundancy & monitoring for uptime." }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all text-center">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-xl mb-2">{item.title}</h3>
              <p className="text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- CLOUD & DEVOPS --- */}
      <section className="py-24 bg-blue-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">Cloud & DevOps</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Cloud className="text-blue-600" />, title: "Cloud Deployment", desc: "AWS, Azure & GCP cloud setups." },
              { icon: <Layout className="text-blue-600" />, title: "Continuous Integration", desc: "Automated builds & testing pipelines." },
              { icon: <Database className="text-blue-600" />, title: "Database DevOps", desc: "Managed DBs with scaling & backups." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-xl mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTORS WE SERVE --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Sectors We Serve</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Delivering custom engineering solutions for diverse industries.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {sectors.map((sector, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-blue-600 transition-all duration-300 text-center shadow-sm">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-600 group-hover:bg-blue-500 group-hover:text-white shadow-sm transition-colors">
                  {sector.icon}
                </div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-white">{sector.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 max-w-7xl mx-auto px-6 border-t border-slate-100">
        <h2 className="text-4xl font-bold mb-16 text-center">Development FAQ</h2>
        <div className="max-w-5xl mx-auto space-y-4">
          {faqItems.map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button onClick={() => toggleFAQ(idx)} className="w-full p-8 text-left flex justify-between items-center hover:bg-slate-50 transition-colors font-bold text-lg text-slate-800">
                {item.q}
                {faqOpen === idx ? <ChevronUp className="text-blue-600" /> : <ChevronDown className="text-slate-400" />}
              </button>
              {faqOpen === idx && <div className="px-8 pb-8 text-slate-500 text-lg leading-relaxed animate-in fade-in duration-300">{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center p-12 md:p-20 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -mr-32 -mt-32" />
          <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-8 relative z-10">
            Build your <span className="text-blue-600">next big thing.</span>
          </h2>
          <p className="text-slate-600 mb-12 relative z-10 max-w-2xl mx-auto">
            Let’s create scalable, secure, and high-performance digital products that make an impact.
          </p>
          <HashLink to="/contact" className="relative z-10 px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold inline-flex items-center gap-2">
            Start a Project <ArrowRight size={18} />
          </HashLink>
        </div>
      </section>

      {/* --- SCROLL TO TOP BUTTON --- */}
      {showScroll && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-50"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default WebDevelopmentPage;