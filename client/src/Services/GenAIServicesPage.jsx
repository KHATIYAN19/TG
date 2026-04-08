import React, { useState,useEffect } from "react";
import { HashLink } from "react-router-hash-link";
import {
  MessageSquare,
  Cpu,
  Zap,
  Bot,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Terminal,
  ShieldCheck,
  BarChart3,
  Globe,
  Settings2,
  Server,
  Database,
  Search,
  Boxes,
  GraduationCap,
  ShoppingCart,
  Building2
} from "lucide-react";
import { Helmet } from "react-helmet";

const GenAIPage = () => {
  const [faqOpen, setFaqOpen] = useState(null);
  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
  const toggleFAQ = (index) => setFaqOpen(faqOpen === index ? null : index);

  const sectors = [
    { name: "Education", icon: <GraduationCap size={24} />, desc: "AI Tutors & Adaptive Learning" },
    { name: "E-Commerce", icon: <ShoppingCart size={24} />, desc: "Personalized Recommendations" },
    { name: "Real Estate", icon: <Building2 size={24} />, desc: "AI Market Analysis" },
    { name: "HealthTech", icon: <ShieldCheck size={24} />, desc: "Patient Data Insights" },
    { name: "SaaS", icon: <Boxes size={24} />, desc: "Intelligent Workflows" },
  ];

  const techStack = {
    frameworks: ["AutoGen", "LangGraph", "LangChain", "LlamaIndex", "Google SDK"],
    models: ["Gemini 1.5 Pro", "GPT-4o", "Llama 3.1", "Claude 3.5 Sonnet"]
  };

  const faqs = [
    { q: "What is Generative AI (GenAI)?", a: "GenAI is an AI technology that can create new content—text, images, code—based on learned patterns." },
    { q: "Which LLMs do you use?", a: "We leverage Gemini 1.5 Pro, GPT-4o, Llama 3.1, Claude 3.5 Sonnet depending on the project requirements." },
    { q: "What is a RAG pipeline?", a: "Retrieval-Augmented Generation fetches relevant data before generating output to ensure accuracy." },
    { q: "How does MCP work?", a: "Model Context Protocol enables AI models to safely connect to your enterprise data in real time." },
    { q: "How secure is my data?", a: "We implement VPC isolation, encrypted storage, and private deployments ensuring full confidentiality." }
  ];

  const useCases = [
    { title: "AI Tutors", desc: "Adaptive learning platforms for students.", icon: <GraduationCap size={24} /> },
    { title: "Smart Recommendations", desc: "E-Commerce personalization at scale.", icon: <ShoppingCart size={24} /> },
    { title: "Real Estate Insights", desc: "AI-driven market analytics.", icon: <Building2 size={24} /> },
  ];

  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-blue-100">
      <Helmet>
        <title>GenAI Solutions | Target Trek</title>
      </Helmet>

      {/* --- HERO --- */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-40 md:pb-32 bg-gradient-to-br from-blue-50/40 to-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 text-blue-700 text-sm font-bold mb-6">
              <Sparkles size={16} /> Next-Gen AI Solutions
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
              Transform your business with <span className="text-blue-600">GenAI</span>
            </h1>
            <p className="text-slate-600 text-lg md:text-xl mb-10 leading-relaxed max-w-lg">
              Target Trek builds advanced generative AI products including agent orchestration, RAG pipelines, and LLM-powered workflows.
            </p>
            <HashLink to="/contact" className="px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-xl">
              Consult an Expert <ArrowRight size={18} />
            </HashLink>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-blue-400/10 rounded-[2rem] blur-2xl -z-10" />
            <img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200" alt="GenAI Hero" className="relative rounded-[2rem] border-8 border-white shadow-2xl z-10 w-full object-cover"/>
          </div>
        </div>
      </section>

      {/* --- WHAT IS GENAI --- */}
      <section className="py-24 max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">What is Generative AI?</h2>
        <p className="text-slate-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          Generative AI is a class of artificial intelligence that can produce text, code, images, and structured data by learning patterns from existing datasets. It enables businesses to automate creativity, scale decision-making, and unlock new insights from data.
        </p>
      </section>

      {/* --- SECTORS --- */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-4xl font-bold">Sectors We Empower</h2>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Our GenAI solutions drive impact across diverse industries.</p>
        </div>
        <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {sectors.map((sector, idx) => (
            <div key={idx} className="group p-6 rounded-2xl border border-slate-100 bg-white hover:bg-blue-50 transition-all cursor-default shadow-sm">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 text-blue-600">{sector.icon}</div>
              <h4 className="font-bold text-lg text-slate-900 group-hover:text-blue-600">{sector.name}</h4>
              <p className="text-slate-500 text-sm mt-2">{sector.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- USE CASES --- */}
      <section className="py-24 max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-12">Use Cases</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {useCases.map((useCase, idx) => (
            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
              <div className="text-blue-600 mb-4">{useCase.icon}</div>
              <h3 className="font-bold text-xl mb-2">{useCase.title}</h3>
              <p className="text-slate-600">{useCase.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- HOW WE WORK --- */}
      <section className="py-24 bg-blue-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">How We Work</h2>
          <p className="text-slate-600 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
            Our AI development follows a structured process: understanding your business, mapping data workflows, building agent orchestration pipelines, integrating LLMs, and deploying secure, scalable solutions.
          </p>
        </div>
      </section>

      {/* --- TECH STACK --- */}
      <section className="py-24 max-w-7xl mx-auto px-6 border-t border-slate-100">
        <h2 className="text-4xl font-bold text-center mb-12">Tech Stack & LLMs</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h4 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
              <Cpu size={18} /> Frameworks
            </h4>
            <div className="flex flex-wrap gap-3">{techStack.frameworks.map((tech) => <span key={tech} className="px-5 py-2 rounded-xl bg-slate-100 font-semibold text-slate-700 hover:bg-blue-600 hover:text-white">{tech}</span>)}</div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h4 className="text-blue-600 font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
              <Zap size={18} /> LLMs
            </h4>
            <div className="flex flex-wrap gap-3">{techStack.models.map((model) => <span key={model} className="px-5 py-2 rounded-xl bg-blue-50 font-semibold text-blue-700 hover:bg-blue-600 hover:text-white">{model}</span>)}</div>
          </div>
        </div>
      </section>

      {/* --- RAG & MCP --- */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">RAG & MCP Pipelines</h2>
            <p className="text-slate-600 mb-6">
              We combine <strong>Retrieval-Augmented Generation</strong> with <strong>Model Context Protocol</strong> to build pipelines that connect AI with your private and enterprise data safely.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 font-semibold text-slate-700"><Database className="text-blue-600" /> Vector DB & Semantic Search</li>
              <li className="flex items-center gap-3 font-semibold text-slate-700"><Server className="text-blue-600" /> Secure MCP Connectors</li>
              <li className="flex items-center gap-3 font-semibold text-slate-700"><Globe className="text-blue-600" /> Enterprise Data Integration</li>
            </ul>
          </div>
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1727434032773-af3cd98375ba?w=600&auto=format&fit=crop&q=60" alt="RAG MCP" className="rounded-3xl border border-slate-200 shadow-xl"/>
          </div>
        </div>
      </section>

      {/* --- GEMINI ENTERPRISE --- */}
      <section className="py-24 bg-blue-50/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Gemini Enterprise</h2>
          <p className="text-slate-600 max-w-3xl mx-auto mb-6 text-lg md:text-xl leading-relaxed">
            Gemini Enterprise integrates with GCP ecosystem, offering your business LLM capabilities with enterprise-grade security, scalable cloud infrastructure, and seamless AI service deployment.
          </p>
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-8">
            {["Seamless GCP Integration","High Scalability","Private Deployment","Secure Enterprise API","Agent Orchestration Ready","Multi-modal AI"].map((item, idx) => (
              <li key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 font-semibold text-slate-700 hover:shadow-md transition-all">{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-24 max-w-7xl mx-auto px-6 border-t border-slate-100">
        <h2 className="text-4xl font-bold mb-16 text-center">FAQs</h2>
        <div className="max-w-5xl mx-auto space-y-4">
          {faqs.map((item, idx) => (
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

      {/* --- CTA --- */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center p-12 md:p-20 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-sm relative overflow-hidden">
          <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-8">Start Your GenAI Journey</h2>
          <p className="text-slate-600 text-xl mb-12 max-w-3xl mx-auto leading-relaxed">
            Target Trek transforms ideas into AI products. Consult with our experts to implement agent orchestration, RAG pipelines, and Gemini Enterprise solutions today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <HashLink to="/contact" className="px-12 py-5 rounded-full bg-blue-600 text-white font-bold text-xl hover:bg-blue-700 shadow-xl">
              Get Consultation
            </HashLink>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GenAIPage;