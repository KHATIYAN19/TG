import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { Zap, Megaphone, Mail, Target, Users, Award, Star, CheckCircle, TrendingUp, MessageSquare, User, Code, ChevronLeft, ChevronRight, Building } from 'lucide-react';
import BASE_URL from "../utils/Url.js"; // Ensure this path is correct

const HomePage = () => {
  const services = [
    { icon: <Megaphone size={40} className="mb-4 text-blue-600" />, title: 'PPC Advertising', description: 'Drive targeted traffic instantly with strategic paid campaigns.', link: '/services#ppc' },
    { icon: <Zap size={40} className="mb-4 text-blue-600" />, title: 'Social Media Marketing', description: 'Engage your audience and build brand loyalty across platforms.', link: '/services#social' },
    { icon: <Mail size={40} className="mb-4 text-blue-600" />, title: 'Email Marketing', description: 'Nurture leads and retain customers with effective email strategies.', link: '/services#email' },
    { icon: <Code size={40} className="mb-4 text-blue-600" />, title: 'Web Development', description: 'Get a high-performing, responsive website built with modern tech (MERN, WordPress).', link: '/services#webdev' },
  ];

  const whyChooseUsPoints = [
    { icon: <Target size={32} className="text-blue-600" />, title: 'Data-Driven Results', description: 'We focus on measurable outcomes, using data to refine strategies and maximize your ROI.' },
    { icon: <Users size={32} className="text-blue-600" />, title: 'Experienced Team', description: 'Our team comprises certified experts passionate about digital marketing trends and technologies.' },
    { icon: <Award size={32} className="text-blue-600" />, title: 'Custom Strategies', description: 'One size doesn\'t fit all. We tailor every campaign to your unique business goals and audience.' },
    { icon: <CheckCircle size={32} className="text-blue-600" />, title: 'Transparent Reporting', description: 'Stay informed with clear, concise reports detailing campaign performance and key insights.' },
  ];

   const processSteps = [
    { icon: <MessageSquare size={30} className="text-blue-600 mb-2" />, title: '1. Discovery & Strategy', description: 'We start by understanding your business, goals, and audience to craft a tailored plan.' },
    { icon: <TrendingUp size={30} className="text-blue-600 mb-2" />, title: '2. Implementation', description: 'Our experts execute the strategy across relevant channels, optimizing for performance.' },
    { icon: <CheckCircle size={30} className="text-blue-600 mb-2" />, title: '3. Reporting & Refinement', description: 'We monitor results, provide transparent reports, and continually refine tactics for growth.' },
  ];

  const [reviews, setReviews] = useState([]);
  // currentStartIndex now tracks the index of the first review displayed in the 3-item view
  const [currentStartIndex, setCurrentStartIndex] = useState(0);
  const [apiError, setApiError] = useState(false);
  const reviewsToShow = 3; // Number of reviews to show at once

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/admin/reviews/published`);
        if (response.data && response.data.success && Array.isArray(response.data.reviews)) {
          setReviews(response.data.reviews);
          setApiError(false);
        } else {
          console.warn("API response format unexpected or success is false:", response.data);
          setReviews([]);
          setApiError(false);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setApiError(true);
        setReviews([]);
      }
    };

    fetchReviews();
  }, []);

  const handleNextReview = () => {
    // Move index forward by 1, but don't go past the point where the last 'reviewsToShow' items are visible
    setCurrentStartIndex((prevIndex) => Math.min(prevIndex + 1, reviews.length - reviewsToShow));
  };

  const handlePrevReview = () => {
    // Move index back by 1, but don't go below 0
    setCurrentStartIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const renderStars = (rating) => {
    const stars = [];
    const numRating = Number(rating);
    const fullStars = Math.floor(numRating);
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} fill="currentColor" size={18} className="text-yellow-500" />);
    }
    const emptyStars = 5 - fullStars;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={18} className="text-yellow-300" />);
    }
    return stars;
  };

  // Calculate which reviews are currently visible
  const visibleReviews = reviews.slice(currentStartIndex, currentStartIndex + reviewsToShow);

  return (
    <div className="pt-16 bg-white">

      {/* --- Hero Section --- */}
      <section className="bg-gradient-to-r from-blue-50 via-white to-blue-50 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight mb-4">
              Elevate Your Brand <span className="text-blue-600">Online</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              We deliver tailored digital marketing & web development solutions that drive growth, engagement, and measurable results for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <NavLink to="/services" className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-blue-700 transition duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-1">
                Explore Services
              </NavLink>
              <NavLink to="/contact" className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-full text-lg font-medium hover:bg-blue-50 transition duration-300 ease-in-out shadow-md hover:shadow-lg">
                Get a Free Quote
              </NavLink>
            </div>
          </div>
          <div className="flex justify-center">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" alt="Digital Marketing Team Collaboration" className="rounded-lg shadow-xl w-full max-w-md object-cover"/>
          </div>
        </div>
      </section>

      {/* --- Services Overview Section --- */}
      <section id="services" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Our Core Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Driving results through a spectrum of digital marketing & web expertise.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <div key={service.title} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300 ease-in-out flex flex-col items-center text-center transform hover:-translate-y-2">
                {service.icon}
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4 flex-grow">{service.description}</p>
                <NavLink to={service.link} className="text-blue-600 hover:text-blue-800 font-medium transition duration-300">Learn More &rarr;</NavLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Why Choose Us Section --- */}
      <section id="why-choose-us" className="py-16 lg:py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-12">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Why Partner With Us?</h2>
             <p className="text-lg text-gray-600 max-w-3xl mx-auto">We combine expertise with dedication to deliver exceptional digital outcomes.</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {whyChooseUsPoints.map((point) => (
               <div key={point.title} className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow hover:shadow-lg transition duration-300">
                 <div className="bg-blue-100 p-3 rounded-full mb-4">
                   {point.icon}
                 </div>
                 <h3 className="text-xl font-semibold text-gray-800 mb-2">{point.title}</h3>
                 <p className="text-gray-600">{point.description}</p>
               </div>
             ))}
           </div>
         </div>
       </section>

      {/* --- Our Process Section --- */}
      <section id="process" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Our Simple Process</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">A clear path to achieving your digital goals.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {processSteps.map((step) => (
              <div key={step.title} className="flex flex-col items-center text-center p-6">
                 {step.icon}
                <h3 className="text-xl font-semibold text-gray-800 mt-2 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Testimonials Section (Multi-Item Carousel) --- */}
      {!apiError && reviews.length > 0 && (
        <section id="testimonials" className="py-16 lg:py-24 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">What Our Clients Say</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Real results from businesses we've helped thrive online.</p>
            </div>

            <div className="relative">
              {/* Previous Button */}
              {reviews.length > reviewsToShow && (
                <button
                  onClick={handlePrevReview}
                  disabled={currentStartIndex === 0} // Disable if at the beginning
                  className={`absolute left-0 top-1/2 -translate-y-1/2 -ml-4 md:-ml-8 lg:-ml-12 p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 transition duration-300 focus:outline-none z-10 ${currentStartIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Previous Reviews"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* Review Cards Container */}
              {/* This outer div clips the content */}
              <div className="overflow-hidden">
                 {/* This inner div holds all reviews and slides */}
                 {/* We don't actually slide this div in this simpler implementation */}
                 {/* Instead, we re-render the visible slice */}
                <div className="flex transition-transform duration-500 ease-in-out gap-6 md:gap-8 justify-center">
                   {/* Map over the calculated visibleReviews slice */}
                   {visibleReviews.map((review) => (
                      <div key={review._id} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0">
                          <div className="bg-blue-50 p-6 h-full rounded-lg shadow-lg flex flex-col items-center text-center">
                              {/* Avatar and Name/Company/Position */}
                              <div className="flex items-center mb-4 w-full justify-center">
                                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center mr-4 border-2 border-blue-300">
                                      <User size={24} className="text-blue-600" />
                                  </div>
                                  <div className="text-left">
                                      <p className="font-semibold text-gray-800">{review.name || 'Anonymous'}</p>
                                      {(review.companyName || review.position) && (
                                          <p className="text-sm text-blue-700">
                                              {review.position || ''}
                                              {review.position && review.companyName ? ' at ' : ''}
                                              {review.companyName || ''}
                                          </p>
                                      )}
                                  </div>
                              </div>
                              {/* Rating Stars */}
                              <div className="flex text-yellow-500 mb-3">
                                  {renderStars(review.rating || 0)}
                              </div>
                              {/* Client Feedback */}
                              <blockquote className="text-gray-700 italic flex-grow text-sm md:text-base">
                                  "{review.clientFeedback || 'No feedback provided.'}"
                              </blockquote>
                          </div>
                      </div>
                   ))}
                 </div>
              </div>

              {/* Next Button */}
              {reviews.length > reviewsToShow && (
                <button
                  onClick={handleNextReview}
                  // Disable if the last group of reviews is already visible
                  disabled={currentStartIndex >= reviews.length - reviewsToShow}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 -mr-4 md:-mr-8 lg:-mr-12 p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 transition duration-300 focus:outline-none z-10 ${currentStartIndex >= reviews.length - reviewsToShow ? 'opacity-50 cursor-not-allowed' : ''}`}
                  aria-label="Next Reviews"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>
          </div>
        </section>
      )}
      <section id="book-call" className="py-16 lg:py-24 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Amplify Your Digital Presence?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">Let's discuss your goals. Book a free, no-obligation consultation call with one of our experts today!</p>
          <NavLink to="/book" className="bg-white text-blue-600 px-10 py-3 rounded-full text-lg font-medium hover:bg-gray-100 transition duration-300 ease-in-out shadow-lg transform hover:scale-105">Book a Free Call Now</NavLink>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
