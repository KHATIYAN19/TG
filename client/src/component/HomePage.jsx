import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { Rocket, BarChart, PenTool, Smartphone, Users, Star, ChevronRight } from 'lucide-react';
import BASE_URL from "../utils/Url.js";

const HomePage = () => {
  const services = [
    { icon: <BarChart size={32} className="text-blue-600" />, title: 'Digital Marketing', description: 'Targeted campaigns that deliver real results', link: '/services#marketing' },
    { icon: <Users size={32} className="text-blue-600" />, title: 'Social Media', description: 'Build authentic audience engagement', link: '/services#social' },
    { icon: <PenTool size={32} className="text-blue-600" />, title: 'Content Strategy', description: 'Compelling stories that resonate', link: '/services#content' },
    { icon: <Smartphone size={32} className="text-blue-600" />, title: 'Web Development', description: 'Modern, responsive websites', link: '/services#web' },
  ];

  const [reviews, setReviews] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/admin/reviews/published`);
        response.data?.success && setReviews(response.data.reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setApiError(true);
      }
    };
    fetchReviews();
  }, []);

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
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-900 leading-tight">
              Elevate Your Business with<br />
              <span className="text-blue-600">Digital Excellence</span>
            </h1>
            <p className="text-lg text-blue-700 max-w-xl">
              Transform your online presence with our strategic digital solutions
            </p>
            <div className="flex gap-4">
              <NavLink 
                to="/services"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Rocket size={20} />
                Get Started
              </NavLink>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              alt="Digital strategy"
              className="rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">
              Our Services
            </h2>
            <p className="text-blue-600 text-lg max-w-2xl mx-auto">
              Comprehensive solutions tailored to your business needs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <div 
                key={service.title}
                className="bg-white p-8 rounded-xl border border-blue-50 hover:border-blue-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-lg mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-blue-600 mb-6">{service.description}</p>
                <NavLink
                  to={service.link}
                  className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700 group"
                >
                  Learn More
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </NavLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {reviews.length > 0 && (
        <section className="py-24 bg-blue-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-blue-900 mb-4">
                Client Success Stories
              </h2>
              <p className="text-blue-600 text-lg max-w-2xl mx-auto">
                See how we've helped businesses grow online
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {reviews.slice(0, 3).map((review) => (
                <div 
                  key={review._id}
                  className="bg-white p-8 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">{review.name}</h4>
                      <p className="text-sm text-blue-600">{review.companyName}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-4">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-blue-700 italic mb-6">
                    &ldquo;{review.clientFeedback}&rdquo;
                  </p>
                  <div className="text-sm text-blue-500">
                    {new Date(review.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-blue-600 p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Let's create a custom digital strategy that drives growth
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink
                to="/contact"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <PenTool size={20} />
                Start Now
              </NavLink>
              <NavLink
                to="/services"
                className="border border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-medium transition-colors"
              >
                View Services
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;