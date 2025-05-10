import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Target, Eye, Rocket, Users, Zap, Lightbulb, CheckSquare, Settings, BarChart3, TrendingUp, Handshake, Briefcase } from 'lucide-react';
import { HashLink } from 'react-router-hash-link';
import { FaInstagram, FaFacebookF, FaWhatsapp, FaLinkedinIn } from 'react-icons/fa';

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const coreValues = [
    { icon: <Lightbulb size={28} className="text-blue-600" />, title: 'Fresh Perspectives', description: 'We bring innovative ideas and modern strategies, unburdened by outdated methods.' },
    { icon: <Target size={28} className="text-blue-600" />, title: 'Client-Centric Focus', description: 'Your success is our primary goal. We are dedicated to understanding and achieving your objectives.' },
    { icon: <Handshake size={28} className="text-blue-600" />, title: 'Collaborative Spirit', description: 'We believe in true partnership, working closely with you every step of the way.' },
    { icon: <CheckSquare size={28} className="text-blue-600" />, title: 'Agility & Adaptability', description: 'As a new agency, we are nimble and quick to adapt to the latest digital trends.' },
  ];

  const approachSteps = [
    { icon: <Settings size={28} className="text-purple-600" />, title: 'Understand & Strategize', description: 'We start with a deep dive into your business to build a tailored, effective roadmap.' },
    { icon: <Zap size={28} className="text-purple-600" />, title: 'Implement & Refine', description: 'We execute campaigns diligently, focusing on continuous improvement and optimization.' },
    { icon: <BarChart3 size={28} className="text-purple-600" />, title: 'Measure & Report', description: 'We track progress closely and provide clear reports on key performance indicators.' },
    { icon: <TrendingUp size={28} className="text-purple-600" />, title: 'Grow & Scale', description: 'Our goal is to build a strong foundation for your long-term digital growth.' },
  ];

  const commitmentPoints = [
    { icon: <Users size={32} className="text-white" />, label: 'Dedicated Support' },
    { icon: <TrendingUp size={32} className="text-white" />, label: 'Focus on Growth' },
    { icon: <Lightbulb size={32} className="text-white" />, label: 'Innovative Solutions' },
  ];

  // WhatsApp link generation
    const phoneNumber = "9368264477"; // Replace with the desired phone number, include country code.
    const whatsappMessage = "Hello, I'm interested in learning more about Target Trek's services."; //Optional
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;


  return (
    <div className="pt-16 md:pt-20 bg-white min-h-screen">
      <section className="py-16 lg:py-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3"  itemProp="headline">About Target Trek</h1>
          <p className="text-lg md:text-xl text-indigo-100"  itemProp="description">
            Your New Partner in Digital Growth and Innovation.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-1 md:order-2">
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80"
              alt="Team planning digital strategy"
              className="rounded-lg shadow-xl object-cover w-full"
              itemProp="image"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/e2e8f0/94a3b8?text=Planning"; }}
            />
          </div>
          <div className="order-2 md:order-1 space-y-6">
            <div itemProp="mission">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 inline-flex items-center">
                <Eye size={28} className="mr-3 text-blue-600" /> Our Mission
              </h2>
              <p className="text-lg text-gray-600">
                To empower emerging and established businesses to thrive in the digital space through creative, data-informed strategies and a commitment to genuine partnership. We aim to make impactful digital marketing accessible and effective.
              </p>
            </div>
            <div itemProp="vision">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 inline-flex items-center">
                <Rocket size={28} className="mr-3 text-purple-600" /> Our Vision
              </h2>
              <p className="text-lg text-gray-600">
                To become a trusted digital growth partner, known for our innovative approach, transparent practices, and dedication to helping our clients achieve their ambitious online goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gray-50" itemProp="approach">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Our Planned Approach</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A structured methodology we'll employ for your success.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {approachSteps.map((step) => (
              <div key={step.title} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out border border-gray-100">
                <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-full mb-4 w-14 h-14">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2" itemProp="approachStepTitle">{step.title}</h3>
                <p className="text-gray-600 text-sm" itemProp="approachStepDescription">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24" itemProp="coreValues">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles guiding our launch and future growth.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            {coreValues.map((value) => (
              <div key={value.title} className="text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out border border-gray-100">
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4 w-14 h-14">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2"  itemProp="coreValueTitle">{value.title}</h3>
                <p className="text-gray-600 text-sm" itemProp="coreValueDescription">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-gray-50"  itemProp="industryFocus">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Briefcase size={32} className="mx-auto text-indigo-600 mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Industries We're Excited About</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            We're eager to apply our digital skills across various sectors. We're particularly interested in partnering with businesses in:
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-full"  itemProp="industry">Startups & Tech</span>
            <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-full" itemProp="industry">E-commerce Brands</span>
            <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-full" itemProp="industry">Local Businesses</span>
            <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-full" itemProp="industry">Creative Industries</span>
            <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-full" itemProp="industry">Service Providers</span>
          </div>
          <p className="text-md text-gray-500 mt-6">
            (Don't see your industry? Let's chat! We love new challenges.)
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-indigo-600 text-white" itemProp="commitment">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Our Commitment to You</h2>
            <p className="text-lg text-indigo-100 mt-2">What you can expect when partnering with us.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {commitmentPoints.map((point) => (
              <div key={point.label} itemProp="commitmentPoint">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-full mb-3 w-16 h-16">
                  {point.icon}
                </div>
                <div className="text-xl font-semibold mt-1" itemProp="commitmentPointLabel">{point.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white"  itemProp="callToAction">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Grow With Us?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Be one of our first partners! Contact us today to discuss how our fresh approach can benefit your business.
          </p>
          <HashLink
            to="/contact#contact-us"
            className="inline-block bg-white text-blue-700 px-10 py-3 rounded-full text-lg font-medium hover:bg-gray-100 transition duration-300 ease-in-out shadow-lg transform hover:scale-105"
            style={{ scrollBehavior: 'smooth' }}
          >
            Get In Touch
          </HashLink>
          <div className="mt-6 flex justify-center gap-6">
            <a href="https://www.facebook.com/targettreks/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-indigo-200 transition-colors duration-300" aria-label="Instagram"  style={{ scrollBehavior: 'smooth' }}>
              <FaInstagram className="text-2xl" />
            </a>
            <a href="https://www.facebook.com/targettreks/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-indigo-200 transition-colors duration-300" aria-label="Facebook" style={{ scrollBehavior: 'smooth' }}>
              <FaFacebookF className="text-2xl" />
            </a>
            <a href={"https://wa.me/9536681633"}  rel="noopener noreferrer" className="text-white hover:text-indigo-200 transition-colors duration-300" aria-label="WhatsApp" style={{  }} >
              <FaWhatsapp className="text-2xl" />
            </a>
            <a href="https://www.linkedin.com/company/target-trek/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-indigo-200 transition-colors duration-300" aria-label="LinkedIn" style={{  }} >
              <FaLinkedinIn className="text-2xl" />
            </a>
          </div>
        </div>
      </section>
      <style jsx global>{`

        /* Added for the click effect */
        .scale-110 {
          transform: scale(1.1);
        }
        .transition-colors {
          transition: color 0.3s ease;
        }
        .hover\:text-indigo-200:hover {
          color: #d946ef; /* Tailwind's indigo-200 */
        }
        .text-indigo-200{
          color: #d946ef;
        }

      `}</style>
    </div>
  );
};

export default AboutPage;
