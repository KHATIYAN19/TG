import React from 'react';
import { NavLink } from 'react-router-dom';
import { Megaphone, Users, Mail, Edit3, TrendingUp, CheckCircle, Link, Code, MonitorSmartphone, DollarSign } from 'lucide-react';
import { Helmet } from 'react-helmet';
const ServicesPage = () => {
  const services = [
    {
      id: 'ppc',
      icon: <Megaphone size={32} className="text-blue-600" />,
      title: 'Pay-Per-Click (PPC) Advertising',
      description: 'Get immediate visibility and targeted traffic with expertly managed PPC campaigns on platforms like Google Ads and social media. We focus on maximizing your ROI by optimizing ad spend, targeting the right audience, and creating compelling ad copy.',
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      altText: 'Person pointing at charts showing advertising results',
      points: [
        'Google Ads & Bing Ads Management',
        'Social Media Advertising (Facebook, Instagram, LinkedIn)',
        'Keyword Targeting & Bid Management',
        'Ad Copywriting & A/B Testing',
        'Landing Page Optimization',
      ]
    },
    {
      id: 'social',
      icon: <Users size={32} className="text-blue-600" />,
      title: 'Social Media Marketing (SMM)',
      description: 'Build brand awareness, engage your community, and drive conversions through strategic social media marketing. We create and manage campaigns across relevant platforms, fostering meaningful interactions and growing your online presence.',
      imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
      altText: 'Various social media logos displayed on screens',
      points: [
        'Platform Strategy & Selection',
        'Content Creation & Curation',
        'Community Management & Engagement',
        'Social Media Advertising Campaigns',
        'Analytics & Performance Reporting',
      ]
    },
    {
      id: 'content',
      icon: <Edit3 size={32} className="text-blue-600" />,
      title: 'Content Marketing',
      description: 'Attract, engage, and retain your audience with high-quality, valuable content. We develop content strategies and create compelling blog posts, articles, infographics, videos, and more to establish thought leadership and support your SEO efforts.',
      imageUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      altText: 'Person writing content on a laptop with coffee',
      points: [
        'Content Strategy Development',
        'Blog Writing & Article Creation',
        'Infographic & Video Production',
        'SEO Content Optimization',
        'Content Distribution & Promotion',
      ]
    },
    {
      id: 'email',
      icon: <Mail size={32} className="text-blue-600" />,
      title: 'Email Marketing',
      description: 'Nurture leads, retain customers, and drive sales with targeted email marketing campaigns. We design, implement, and manage email workflows, newsletters, and automated sequences to deliver the right message at the right time.',
      imageUrl: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      altText: 'Laptop screen showing email icons and interface',
      points: [
        'Email List Building & Segmentation',
        'Campaign Design & Copywriting',
        'Marketing Automation Setup',
        'A/B Testing & Optimization',
        'Performance Tracking & Reporting',
      ]
    },
    {
      id: 'affiliate',
      icon: <DollarSign size={32} className="text-blue-600" />,
      title: 'Affiliate Marketing Management',
      description: 'Expand your reach and drive revenue through strategic affiliate partnerships. We manage your affiliate program, recruit quality partners, track performance, and optimize for maximum return.',
      imageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      altText: 'People shaking hands over a business deal',
      points: [
        'Affiliate Program Setup & Strategy',
        'Partner Recruitment & Vetting',
        'Commission Structure Optimization',
        'Performance Monitoring & Reporting',
        'Creative & Offer Management',
      ]
    },
    {
      id: 'webdev',
      icon: <Code size={32} className="text-blue-600" />,
      title: 'Web Development Services',
      description: 'Build a powerful online presence with a professional, high-performing website. We offer custom web development using modern technologies like the MERN stack (MongoDB, Express, React, Node.js) and popular platforms like WordPress.',
      imageUrl: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      altText: 'Code displayed on a computer screen',
      points: [
        'Custom Website Design & Development',
        'MERN Stack Application Development',
        'WordPress Theme & Plugin Development',
        'E-commerce Solutions (e.g., Shopify, WooCommerce)',
        'Website Maintenance & Support',
      ]
    },
  ];

  return (
    <div className="pt-20 bg-gray-50">
       <Helmet>
        <title>Services - Target Trek</title>
      </Helmet>
      <section className="py-16 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Our Digital Marketing & Web Services</h1>
          <p className="text-lg md:text-xl text-blue-100">
            Comprehensive solutions designed to elevate your brand and drive results online.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 lg:space-y-24">
          {services.map((service, index) => (
            <div
              key={service.id}
              id={service.id}
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-12 lg:gap-16`}
            >
              <div className="w-full md:w-1/2 lg:w-5/12 flex-shrink-0">
                <img
                  src={service.imageUrl}
                  alt={service.altText}
                  className="rounded-lg shadow-xl object-cover w-full h-64 md:h-80 lg:h-96"
                  onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Found"; }}
                />
              </div>
              <div className="w-full md:w-1/2 lg:w-7/12">
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4 w-16 h-16">
                  {service.icon}
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">{service.title}</h2>
                <p className="text-gray-600 text-lg mb-6">{service.description}</p>
                {service.points && (
                  <ul className="space-y-2 mb-6">
                    {service.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start">
                        <CheckCircle size={20} className="text-green-500 mr-3 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <NavLink
                  to="/contact"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                >
                  Get Started with {service.title.split(' ')[0]}
                  <TrendingUp size={20} className="ml-2" />
                </NavLink>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Grow Your Business Online?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Let our team of experts craft a tailored digital marketing strategy to achieve your specific goals. Contact us today for a free consultation!
          </p>
          <NavLink
            to="/contact"
            className="inline-block bg-white text-blue-600 px-10 py-3 rounded-full text-lg font-medium hover:bg-gray-100 transition duration-300 ease-in-out shadow-lg transform hover:scale-105"
          >
            Request a Free Consultation
          </NavLink>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
