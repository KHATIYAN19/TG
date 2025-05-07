import React from 'react';
import { NavLink } from 'react-router-dom';
import { Target, Eye, Heart, Users, Zap, Lightbulb, CheckSquare, Settings, BarChart3, Briefcase, TrendingUp, Award as AwardIcon, Rocket, Handshake } from 'lucide-react'; // Added more relevant icons

const AboutPage = () => {

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

  // Replaced impact metrics with commitment points
  const commitmentPoints = [
      { icon: <Users size={32} className="text-white" />, label: 'Dedicated Support' },
      { icon: <TrendingUp size={32} className="text-white" />, label: 'Focus on Growth' },
      { icon: <Lightbulb size={32} className="text-white" />, label: 'Innovative Solutions' },
  ];

  // const teamMembers = [
  //   { name: 'Jane Doe', title: 'Founder & CEO', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  //   { name: 'John Smith', title: 'Head of SEO', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  //   { name: 'Alice Brown', title: 'Social Media Strategist', imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80' },
  // ];


  return (
    <div className="pt-16 md:pt-20 bg-white min-h-screen">

      <section className="py-16 lg:py-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">About Target Trek</h1>
          <p className="text-lg md:text-xl text-indigo-100">
            Your New Partner in Digital Growth and Innovation.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-1 md:order-2">
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80" // Changed image to reflect startup/planning
              alt="Team planning digital strategy"
              className="rounded-lg shadow-xl object-cover w-full"
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/e2e8f0/94a3b8?text=Planning"; }}
            />
          </div>
          <div className="order-2 md:order-1 space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4 inline-flex items-center">
                  <Eye size={28} className="mr-3 text-blue-600"/> Our Mission
              </h2>
              <p className="text-lg text-gray-600">
                  To empower emerging and established businesses to thrive in the digital space through creative, data-informed strategies and a commitment to genuine partnership. We aim to make impactful digital marketing accessible and effective.
              </p>
            </div>
             <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4 inline-flex items-center">
                  <Rocket size={28} className="mr-3 text-purple-600"/> Our Vision
              </h2>
              <p className="text-lg text-gray-600">
                  To become a trusted digital growth partner, known for our innovative approach, transparent practices, and dedication to helping our clients achieve their ambitious online goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Our Approach Section --- */}
      <section className="py-16 lg:py-24 bg-gray-50">
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
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Our Story Section (Commented Out) --- */}
      {/*
      <section className="py-16 lg:py-24 bg-gray-50">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Our Story</h2>
             <p className="text-lg text-gray-600 mb-6 leading-relaxed">
               Founded recently by a team passionate about digital potential, [Your Agency Name] was born from a desire to offer fresh, effective digital marketing solutions. We saw an opportunity to provide agile, client-focused services tailored to today's fast-paced online world. We're excited to build our story by helping you build yours.
             </p>
             <p className="text-lg text-gray-600 leading-relaxed">
               We believe in the power of collaboration and innovation to unlock growth. Our journey is just beginning, and we're eager to partner with businesses ready to make their mark online.
             </p>
         </div>
       </section>
      */}


      <section className="py-16 lg:py-24">
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
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Industries We Focus On Section --- */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Briefcase size={32} className="mx-auto text-indigo-600 mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Industries We're Excited About</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                We're eager to apply our digital skills across various sectors. We're particularly interested in partnering with businesses in:
            </p>
            <div className="flex flex-wrap justify-center gap-4">
                <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-full">Startups & Tech</span>
                <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-full">E-commerce Brands</span>
                <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-full">Local Businesses</span>
                <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-full">Creative Industries</span>
                <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-full">Service Providers</span>
            </div>
             <p className="text-md text-gray-500 mt-6">
                (Don't see your industry? Let's chat! We love new challenges.)
            </p>
        </div>
      </section>

      {/* --- Team Section (Commented Out) --- */}
      {/*
       <section className="py-16 lg:py-24 bg-blue-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-12 lg:mb-16">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Meet Our Founding Team</h2>
             <p className="text-lg text-gray-600 max-w-2xl mx-auto">
               The passionate individuals launching [Your Agency Name].
             </p>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 lg:gap-10 justify-center">
             {teamMembers.map((member) => (
               <div key={member.name} className="text-center bg-white p-6 rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-300 ease-in-out">
                 <img
                   className="mx-auto h-24 w-24 rounded-full mb-4 object-cover"
                   src={member.imageUrl}
                   alt={`Photo of ${member.name}`}
                   onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/96x96/cccccc/ffffff?text=??"; }}
                 />
                 <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                 <p className="text-blue-600">{member.title}</p>
               </div>
             ))}
           </div>
         </div>
       </section>
      */}

      {/* --- Our Commitment Section --- */}
      <section className="py-16 lg:py-20 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Our Commitment to You</h2>
            <p className="text-lg text-indigo-100 mt-2">What you can expect when partnering with us.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {commitmentPoints.map((point) => (
              <div key={point.label}>
                <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-full mb-3 w-16 h-16">
                    {point.icon}
                </div>
                {/* <div className="text-4xl font-bold">{point.value}</div> */}
                <div className="text-xl font-semibold mt-1">{point.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Grow With Us?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Be one of our first partners! Contact us today to discuss how our fresh approach can benefit your business.
          </p>
          <NavLink
            to="/contact"
            className="inline-block bg-white text-blue-700 px-10 py-3 rounded-full text-lg font-medium hover:bg-gray-100 transition duration-300 ease-in-out shadow-lg transform hover:scale-105"
          >
            Get In Touch
          </NavLink>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
