import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import {
  Rocket, BarChart, PenTool, Smartphone, Users, Star, ChevronRight,
  Lightbulb, Briefcase, TrendingUp, Handshake, ShieldCheck, Award,
  Globe, Code, Target, Megaphone, Clock, CalendarCheck, Quote
} from 'lucide-react';
import BASE_URL from "../utils/Url.js";
import { Helmet } from 'react-helmet';
import { PiBuildingOffice } from "react-icons/pi";

const HomePage = () => {
  const services = [
    { icon: <BarChart size={32} className="text-blue-600" />, title: 'Digital Marketing', description: 'Targeted campaigns that deliver real results and drive measurable growth.', link: '/services#marketing' },
    { icon: <Users size={32} className="text-blue-600" />, title: 'Social Media Management', description: 'Build authentic audience engagement and amplify your brand presence across all platforms.', link: '/services#social' },
    { icon: <PenTool size={32} className="text-blue-600" />, title: 'Content Strategy & Creation', description: 'Craft compelling stories and valuable content that resonates with your target audience.', link: '/services#content' },
    { icon: <Smartphone size={32} className="text-blue-600" />, title: 'Web Development & Design', description: 'Develop modern, responsive, and high-performing websites that captivate your visitors.', link: '/services#web' },
    { icon: <Megaphone size={32} className="text-blue-600" />, title: 'Paid Advertising (PPC)', description: 'Maximize your ROI with precisely targeted pay-per-click campaigns on leading platforms.', link: '/services#ppc' },
    { icon: <Code size={32} className="text-blue-600" />, title: 'E-commerce Solutions', description: 'Build robust and scalable online stores designed for conversions and seamless shopping.', link: '/services#ecommerce' },
  ];

  const whyChooseUs = [
    { icon: <Lightbulb size={32} className="text-green-600" />, title: 'Innovative Strategies', description: 'We stay ahead of the curve, employing the latest trends and technologies to give you an edge.' },
    { icon: <Handshake size={32} className="text-green-600" />, title: 'Client-Centric Approach', description: 'Your success is our priority. We work closely with you to understand and achieve your goals.' },
    { icon: <Award size={32} className="text-green-600" />, title: 'Proven Track Record', description: 'Our history of successful campaigns and satisfied clients speaks for itself.' },
    { icon: <ShieldCheck size={32} className="text-green-600" />, title: 'Transparency & Trust', description: 'We believe in clear communication and honest reporting every step of the way.' },
  ];

  const ourProcess = [
    { icon: <Target size={32} className="text-purple-600" />, title: 'Discovery & Analysis', description: 'We dive deep to understand your brand, audience, and objectives.' },
    { icon: <PenTool size={32} className="text-purple-600" />, title: 'Strategy Development', description: 'Crafting a tailored plan designed for maximum impact and ROI.' },
    { icon: <Rocket size={32} className="text-purple-600" />, title: 'Execution & Optimization', description: 'Implementing campaigns with continuous monitoring and refinement.' },
    { icon: <TrendingUp size={32} className="text-purple-600" />, title: 'Reporting & Growth', description: 'Providing clear insights and evolving strategies for sustained success.' },
  ];

  const [reviews, setReviews] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/admin/reviews/published`);
        if (response.data?.success && response.data.reviews.length > 0) {
          setReviews(response.data.reviews.filter(review => review.clientFeedback && review.name && review.rating));
        } else {
          setApiError(true);
          setReviews(fallbackReviews);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setApiError(true);
        setReviews(fallbackReviews);
      }
    };
    fetchReviews();
  }, []);

  const fallbackReviews = [
    {
      _id: '1',
      name: 'Priya Sharma',
      companyName: 'Innovate Tech',
      position: 'CEO',
      rating: 5,
      clientFeedback: 'Target Trek revolutionized our online presence! Their digital marketing strategies led to a significant increase in leads and brand visibility. Truly exceptional service and results!',
      createdAt: '2024-03-15T10:00:00Z'
    },
    {
      _id: '2',
      name: 'Rahul Singh',
      companyName: 'Growth Builders',
      position: 'Marketing Director',
      rating: 4,
      clientFeedback: 'We saw incredible growth in our social media engagement after partnering with Target Trek. Their team is highly professional and deeply understands our audience.',
      createdAt: '2024-02-20T11:30:00Z'
    },
    {
      _id: '3',
      name: 'Anjali Gupta',
      companyName: 'Artisan Crafts',
      position: 'Founder',
      rating: 5,
      clientFeedback: 'Their web development team built us a beautiful, high-converting e-commerce site. It’s user-friendly and perfectly reflects our brand. Highly recommend!',
      createdAt: '2024-01-10T09:00:00Z'
    },
    {
        _id: '4',
        name: 'Suresh Kumar',
        companyName: 'Future Solutions',
        position: 'CTO',
        rating: 4,
        clientFeedback: 'The strategic guidance from Target Trek drastically improved our digital ad spend efficiency, leading to a much better ROI. We are very pleased with the results!',
        createdAt: '2023-11-25T14:45:00Z'
    },
    {
        _id: '5',
        name: 'Neha Verma',
        companyName: 'Health & Wellness Co.',
        position: 'Brand Manager',
        rating: 5,
        clientFeedback: 'Target Trek’s content strategy helped us connect with our customers on a deeper level. The quality of their content is top-notch and truly engaging.',
        createdAt: '2023-10-01T16:00:00Z'
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={18}
        className={`${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
      />
    ));
  };

  return (
    <div className="bg-white">
      <Helmet>
        <title>Home - Target Trek | Digital Marketing & Web Solutions</title>
        <meta name="description" content="Target Trek offers expert digital marketing, web development, and social media services to elevate your business online. Get started today!" />
        <meta property="og:title" content="Home - Target Trek | Digital Marketing & Web Solutions" />
        <meta property="og:description" content="Target Trek offers expert digital marketing, web development, and social media services to elevate your business online. Get started today!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.yourwebsitename.com/" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1517245381832-ce26706f5263?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
        <link rel="canonical" href="https://www.yourwebsitename.com/" />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 leading-tight">
              Elevate Your Business with<br />
              <span className="text-blue-600">Digital Excellence</span>
            </h1>
            <p className="text-lg text-blue-700 max-w-xl mx-auto md:mx-0">
              Transform your online presence with our strategic digital solutions tailored for growth and impact.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              <NavLink
                to="/services"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
              >
                <Rocket size={20} />
                Explore Services
              </NavLink>
              <NavLink
                to="/contact"
                className="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Handshake size={20} />
                Get a Quote
              </NavLink>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Digital strategy and collaboration"
              className="rounded-2xl shadow-xl w-full h-auto object-cover max-h-[500px]"
            />
          </div>
        </div>
      </section>

      ---

      {/* About Us / Mission Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=884&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Our Team Working Together"
              className="rounded-2xl shadow-xl w-full h-auto object-cover max-h-[500px]"
            />
          </div>
          <div className="md:w-1/2 space-y-6 text-center md:text-left">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Who We Are: Your Partner in Digital Growth
            </h2>
            <p className="text-lg text-blue-700">
              At **Target Trek**, we're passionate about helping businesses thrive in the digital landscape.
              We combine cutting-edge strategies with a deep understanding of your unique challenges
              to deliver measurable results. Our team of experts is dedicated to transforming your online presence
              into a powerful engine for success.
            </p>
            <p className="text-lg text-blue-700">
              From boosting your brand visibility to generating quality leads, we're here to guide you
              every step of the way. Let's achieve your digital goals together.
            </p>
            <NavLink
              to="/about"
              className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 group mt-4"
            >
              Learn More About Us
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </NavLink>
          </div>
        </div>
      </section>

      ---

      {/* Services Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Our Comprehensive Digital Solutions
            </h2>
            <p className="text-blue-600 text-lg max-w-2xl mx-auto">
              From strategic planning to execution, we offer a full suite of services designed to accelerate your business growth.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.title}
                className="bg-white p-8 rounded-xl border border-blue-50 hover:border-blue-100 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-blue-50 rounded-full mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-blue-600 text-base mb-6">{service.description}</p>
                <NavLink
                  to={service.link}
                  className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 group"
                >
                  Discover More
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </NavLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      ---

      {/* Why Choose Us Section */}
      <section className="py-24 bg-blue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Why Partner with Target Trek?
            </h2>
            <p className="text-blue-600 text-lg max-w-2xl mx-auto">
              We're more than just a service provider; we're your dedicated growth partner.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item) => (
              <div
                key={item.title}
                className="bg-white p-8 rounded-xl border border-green-50 shadow-sm text-center"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-green-50 rounded-full mx-auto mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      ---

      {/* Our Process Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Our Proven Path to Your Success
            </h2>
            <p className="text-blue-600 text-lg max-w-2xl mx-auto">
              We follow a streamlined, client-focused process to ensure optimal results and satisfaction.
            </p>
          </div>
          <div className="relative grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ourProcess.map((step, index) => (
              <div
                key={step.title}
                className="relative bg-white p-8 rounded-xl border border-purple-50 shadow-md text-center group"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-purple-50 rounded-full mx-auto mb-6 transition-transform group-hover:scale-110">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
                <div className="absolute -top-4 -right-4 bg-purple-600 text-white w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold shadow-lg">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      ---

      {/* Testimonials Section - Greatly Improved */}
      {reviews.length > 0 && (
        <section className="py-24 bg-gradient-to-br from-blue-100 to-blue-50 relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-blue-900 mb-4">
                What Our Valued Clients Say
              </h2>
              <p className="text-blue-700 text-lg max-w-2xl mx-auto">
                Discover the impact of our work through authentic feedback from businesses we've empowered.
              </p>
            </div>

            <div className="relative isolate">
              <div className="absolute inset-0 -z-10 bg-white opacity-40 blur-3xl" aria-hidden="true" />
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="flex-none w-full p-4 box-border md:w-1/2 lg:w-1/3"
                  >
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 flex flex-col h-full transform transition-transform duration-300 hover:scale-[1.02]">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-3xl font-semibold border-2 border-blue-200 shadow-sm">
                          {review.name ? review.name.charAt(0).toUpperCase() : <Users size={32} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-blue-900 text-xl">{review.name}</h4>
                          <p className='text-sm text-blue-600 flex items-center gap-1 mt-1'>
                            <PiBuildingOffice size={16} />
                            <span>{review.companyName} ({review.position})</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 mb-4">
                        {renderStars(review.rating)}
                      </div>
                      <Quote size={28} className="text-blue-300 mb-4 self-start" />
                      <p className="text-blue-800 text-lg flex-grow italic leading-relaxed mb-6">
                        &ldquo;{review.clientFeedback}&rdquo;
                      </p>
                      <div className="text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                        Reviewed on {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {reviews.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 z-20 transition-all hidden md:block"
                  aria-label="Previous review"
                >
                  <ChevronRight size={24} className="rotate-180" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 z-20 transition-all hidden md:block"
                  aria-label="Next review"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            <div className="flex justify-center mt-12 space-x-3">
              {reviews.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full ${currentSlide === idx ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'} transition-colors duration-300 ease-in-out`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      ---

      {/* Stats/Achievements Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-12">
            Driving Results for Businesses
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <TrendingUp size={64} className="text-orange-500 mb-4" />
              <p className="text-5xl font-bold text-blue-700">250+</p>
              <p className="text-lg text-gray-600 mt-2">Successful Projects</p>
            </div>
            <div className="flex flex-col items-center">
              <Users size={64} className="text-purple-500 mb-4" />
              <p className="text-5xl font-bold text-blue-700">100%</p>
              <p className="text-lg text-gray-600 mt-2">Client Satisfaction</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock size={64} className="text-teal-500 mb-4" />
              <p className="text-5xl font-bold text-blue-700">5+</p>
              <p className="text-lg text-gray-600 mt-2">Years of Expertise</p>
            </div>
          </div>
        </div>
      </section>

      ---

      {/* CTA Section - Enhanced and Beautiful */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YnVzaW5lc3MlMjBzdHJhdGVneXxlbnwwfHwwfHx8MA%3D%3D"
            alt="Business Transformation Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white opacity-80"></div> {/* White overlay */}
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="p-8 md:p-12 rounded-2xl bg-blue-600 bg-opacity-90 shadow-xl"> {/* Added a blue background to the internal card */}
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
              Ready to Transform Your Business <br className="hidden md:inline"/> and Achieve Digital Dominance?
            </h2>
            <p className="text-blue-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Don't let your competitors get ahead. Schedule a free, no-obligation consultation with our experts
              and discover how a tailored digital strategy can unlock your true potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink
                to="/contact"
                className="bg-white text-blue-700 px-8 py-4 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center gap-2 justify-center shadow-lg transform hover:scale-105"
              >
                <CalendarCheck size={20} />
                Schedule Your Free Consultation
              </NavLink>
              <NavLink
                to="/portfolio"
                className="border border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-medium transition-colors flex items-center gap-2 justify-center transform hover:scale-105"
              >
                <Globe size={20} />
                Explore Our Success Stories
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;