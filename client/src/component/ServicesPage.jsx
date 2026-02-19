import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import {
  Megaphone,
  Users,
  Mail,
  Edit3,
  TrendingUp,
  CheckCircle,
  Code,
  DollarSign,
  Info, // Added for "Show More" icon
  X, // Added for modal close icon
} from 'lucide-react';
import { Helmet } from 'react-helmet';

const ServicesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const sectionRefs = useRef({});

  useEffect(() => {
    // Scroll to top on page reload/mount
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      id: 'ppc',
      icon: <Megaphone size={32} className="text-blue-600" />,
      title: 'Pay-Per-Click (PPC) Advertising',
      description:
        'Get immediate visibility and targeted traffic with expertly managed PPC campaigns on platforms like Google Ads and social media. We focus on maximizing your ROI by optimizing ad spend, targeting the right audience, and creating compelling ad copy.',
      imageUrl:
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      altText: 'Person pointing at charts showing advertising results',
      points: [
        'Google Ads & Bing Ads Management',
        'Social Media Advertising (Facebook, Instagram, LinkedIn)',
        'Keyword Targeting & Bid Management',
        'Ad Copywriting & A/B Testing',
        'Landing Page Optimization',
        'Remarketing & Retargeting Campaigns',
        'Conversion Tracking & Reporting',
        'A/B Testing for Ad Creatives and Landing Pages',
        'Competitor Analysis and Strategy Adjustment',
        'Fraud Detection and Prevention',
      ],
      benefits: [
        '**Immediate Results:** See traffic and conversions almost instantly.',
        '**Targeted Audience:** Reach users actively searching for your products/services.',
        '**Measurable ROI:** Easily track performance and optimize for better returns.',
        '**Budget Control:** Set and manage your daily or monthly ad spend.',
        '**Increased Brand Visibility:** Appear at the top of search results and social feeds.',
        '**Flexibility:** Quickly adapt campaigns to market changes or new promotions.',
        '**Competitive Advantage:** Outrank competitors in search results.',
        '**Data-Driven Decisions:** Use insights to refine your overall marketing strategy.',
      ],
      longDescription: `
        Our Pay-Per-Click (PPC) advertising services are designed to put your business directly in front of your ideal customers when they are most ready to convert. We meticulously craft and manage campaigns across major platforms like **Google Ads (Search, Display, Shopping, YouTube)** and leading social media channels, including **Facebook, Instagram, and LinkedIn**.

        We start with an in-depth analysis of your target audience, industry, and competitive landscape. This allows us to perform comprehensive keyword research, identify high-intent keywords, and develop a robust bidding strategy that maximizes your return on ad spend (ROAS).

        Our team excels in creating compelling and persuasive ad copy that resonates with your audience and drives clicks. We also implement rigorous A/B testing on ad creatives, headlines, and descriptions to continuously improve performance. Beyond just clicks, we focus heavily on **landing page optimization** to ensure that once users arrive on your site, they have a seamless and conversion-focused experience.

        We provide transparent reporting and constant communication, keeping you informed about your campaign's progress, key metrics, and our strategic adjustments. Our goal is not just to drive traffic, but to drive quality traffic that converts into valuable leads and sales for your business.
      `,
    },
    {
      id: 'social',
      icon: <Users size={32} className="text-blue-600" />,
      title: 'Social Media Marketing (SMM)',
      description:
        'Build brand awareness, engage your community, and drive conversions through strategic social media marketing. We create and manage campaigns across relevant platforms, fostering meaningful interactions and growing your online presence.',
      imageUrl:
        'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80',
      altText: 'Various social media logos displayed on screens',
      points: [
        'Platform Strategy & Selection',
        'Content Creation & Curation',
        'Community Management & Engagement',
        'Social Media Advertising Campaigns',
        'Analytics & Performance Reporting',
        'Influencer Marketing Collaboration',
        'Social Listening & Trend Monitoring',
        'Brand Reputation Management',
        'Cross-Platform Integration',
      ],
      benefits: [
        '**Enhanced Brand Visibility:** Reach a massive and diverse audience.',
        '**Improved Brand Loyalty:** Build stronger relationships with your customers.',
        '**Increased Website Traffic:** Drive users directly to your site from social platforms.',
        '**Cost-Effective Advertising:** Target specific demographics with precision.',
        '**Valuable Customer Insights:** Understand your audience better through social data.',
        '**Direct Customer Engagement:** Communicate and resolve issues in real-time.',
        '**Higher Conversion Rates:** Turn followers into paying customers.',
        '**Competitive Edge:** Stand out from competitors with a strong social presence.',
      ],
      longDescription: `
        Our Social Media Marketing (SMM) services go beyond just posting. We develop a comprehensive social media strategy tailored to your brand's unique voice and business objectives. We identify the most relevant platforms for your target audience, whether it's **Facebook, Instagram, LinkedIn, X (formerly Twitter), TikTok, or Pinterest**.

        Our creative team crafts engaging and high-quality content, including captivating visuals, compelling captions, and interactive polls or stories. We manage your social media presence daily, actively engaging with your community, responding to comments and messages, and fostering a loyal following.

        We also specialize in running highly targeted **social media advertising campaigns** to expand your reach, generate leads, and drive sales. This includes audience segmentation, A/B testing of ad creatives, and continuous optimization for maximum ROI. We leverage social listening tools to monitor conversations around your brand and industry, allowing us to proactively address feedback and identify emerging trends. Our detailed analytics and performance reports provide full transparency into your social media success.
      `,
    },
    {
      id: 'content',
      icon: <Edit3 size={32} className="text-blue-600" />,
      title: 'Content Marketing',
      description:
        'Attract, engage, and retain your audience with high-quality, valuable content. We develop content strategies and create compelling blog posts, articles, infographics, videos, and more to establish thought leadership and support your SEO efforts.',
      imageUrl:
        'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      altText: 'Person writing content on a laptop with coffee',
      points: [
        'Content Strategy Development',
        'Blog Writing & Article Creation',
        'Infographic & Video Production',
        'SEO Content Optimization',
        'Content Distribution & Promotion',
        'Ebooks & Whitepapers Creation',
        'Case Studies & Testimonials',
        'Website Copywriting',
        'Content Audits & Revamp',
      ],
      benefits: [
        '**Establishes Authority & Trust:** Position your brand as an industry leader.',
        '**Drives Organic Traffic:** Improve search engine rankings with valuable content.',
        '**Generates Leads:** Attract and nurture potential customers.',
        '**Increases Brand Awareness:** Get your message in front of a wider audience.',
        '**Supports Sales Funnel:** Guide customers through their buying journey.',
        '**Builds Customer Loyalty:** Provide ongoing value to retain customers.',
        '**Cost-Effective Long-Term Strategy:** Content continues to work for you over time.',
        '**Enhances Social Media Engagement:** Shareable content boosts your social presence.',
      ],
      longDescription: `
        Content marketing is the cornerstone of a strong digital presence. Our content marketing services are focused on creating and distributing valuable, relevant, and consistent content to attract and retain a clearly defined audience — and, ultimately, to drive profitable customer action.

        We begin by developing a comprehensive **content strategy** aligned with your business goals and target audience's needs. This involves thorough keyword research, competitor analysis, and identifying content gaps. Our team of experienced writers and designers then create a diverse range of content assets, including **engaging blog posts, insightful articles, informative infographics, compelling videos, and downloadable e-books or whitepapers.**

        Every piece of content is meticulously **optimized for search engines (SEO)** to ensure maximum visibility and organic traffic. We also implement effective content distribution strategies across various channels, including your website, social media, email newsletters, and relevant third-party platforms, to maximize its reach. Our content marketing efforts aim to establish your brand as a thought leader, build trust with your audience, and seamlessly guide them through the sales funnel.
      `,
    },
    {
      id: 'email',
      icon: <Mail size={32} className="text-blue-600" />,
      title: 'Email Marketing',
      description:
        'Nurture leads, retain customers, and drive sales with targeted email marketing campaigns. We design, implement, and manage email workflows, newsletters, and automated sequences to deliver the right message at the right time.',
      imageUrl:
        'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      altText: 'Laptop screen showing email icons and interface',
      points: [
        'Email List Building & Segmentation',
        'Campaign Design & Copywriting',
        'Marketing Automation Setup',
        'A/B Testing & Optimization',
        'Performance Tracking & Reporting',
        'Welcome Series & Onboarding Emails',
        'Promotional & Sales Campaigns',
        'Abandoned Cart Recovery Emails',
        'Re-engagement Campaigns',
      ],
      benefits: [
        '**High ROI:** Email marketing consistently delivers one of the highest ROIs in digital marketing.',
        '**Direct Communication:** Reach your audience directly in their inbox.',
        '**Personalization:** Deliver tailored messages based on user behavior and preferences.',
        '**Customer Retention:** Nurture existing customer relationships and drive repeat purchases.',
        '**Lead Nurturing:** Guide leads through the sales funnel with automated sequences.',
        '**Measurable Results:** Track open rates, click-through rates, and conversions easily.',
        '**Cost-Effective:** Compared to other marketing channels, email is highly affordable.',
        '**Builds Loyalty:** Fosters a sense of community and direct connection with your brand.',
      ],
      longDescription: `
        Email marketing remains one of the most powerful and cost-effective digital marketing channels. Our email marketing services are designed to help you build strong relationships with your audience, nurture leads, and drive conversions.

        We assist with **email list building strategies** and meticulous **segmentation** to ensure your messages reach the right people at the right time. Our team crafts engaging email campaigns, from visually appealing newsletters to highly effective promotional emails and automated sequences. We focus on compelling copywriting, strong calls-to-action, and responsive design to ensure your emails look great on any device.

        We implement sophisticated **marketing automation setups** for welcome series, abandoned cart recovery, re-engagement campaigns, and more, allowing you to nurture leads and customers effortlessly. Through continuous **A/B testing** of subject lines, content, and send times, we optimize your campaigns for maximum open rates, click-through rates, and conversions. You'll receive comprehensive performance tracking and reporting, giving you clear insights into the success of your email marketing efforts.
      `,
    },
    {
      id: 'affiliate',
      icon: <DollarSign size={32} className="text-blue-600" />,
      title: 'Affiliate Marketing Management',
      description:
        'Expand your reach and drive revenue through strategic affiliate partnerships. We manage your affiliate program, recruit quality partners, track performance, and optimize for maximum return.',
      imageUrl:
        'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      altText: 'People shaking hands over a business deal',
      points: [
        'Affiliate Program Setup & Strategy',
        'Partner Recruitment & Vetting',
        'Commission Structure Optimization',
        'Performance Monitoring & Reporting',
        'Creative & Offer Management',
        'Affiliate Communication & Support',
        'Fraud Prevention & Compliance',
        'Competitor Analysis in Affiliate Space',
        'Seasonal Campaign Planning',
      ],
      benefits: [
        '**Performance-Based Marketing:** Only pay for results (sales, leads, clicks).',
        '**Expanded Reach:** Tap into new audiences through your affiliates.',
        '**Cost-Effective Customer Acquisition:** Lower your customer acquisition cost (CAC).',
        '**Increased Brand Awareness:** Affiliates promote your brand to their networks.',
        '**Scalability:** Easily scale your marketing efforts by adding more partners.',
        '**Diversified Traffic Sources:** Reduce reliance on single marketing channels.',
        '**Access to Niche Audiences:** Reach highly specific segments through specialized affiliates.',
        '**Reduced Marketing Risk:** Lower upfront investment compared to traditional advertising.',
      ],
      longDescription: `
        Affiliate marketing offers a powerful way to scale your business by leveraging a network of partners who promote your products or services in exchange for a commission. Our affiliate marketing management services cover every aspect of building and growing a successful affiliate program.

        We start with **affiliate program setup and strategy development**, helping you define your goals, target audience, and ideal affiliate profile. We then meticulously **recruit and vet high-quality affiliates**, including bloggers, influencers, content creators, and coupon sites, ensuring they align with your brand values.

        We optimize your **commission structures** to incentivize performance and manage all creative assets and offers provided to affiliates. Our continuous **performance monitoring and reporting** ensure transparency and allow for strategic adjustments to maximize your ROI. We also handle all affiliate communication, support, and implement robust fraud prevention measures to safeguard your program's integrity. With our expertise, you can confidently expand your market reach and drive significant revenue through a thriving affiliate network.
      `,
    },
    {
      id: 'webdev',
      icon: <Code size={32} className="text-blue-600" />,
      title: 'Web Development Services',
      description:
        'Build a powerful online presence with a professional, high-performing website. We offer custom web development using modern technologies like the MERN stack (MongoDB, Express, React, Node.js) and popular platforms like WordPress.',
      imageUrl:
        'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      altText: 'Code displayed on a computer screen',
      points: [
        'Custom Website Design & Development',
        'MERN Stack Application Development',
        'WordPress Theme & Plugin Development',
        'E-commerce Solutions (e.g., Shopify, WooCommerce)',
        'Website Maintenance & Support',
        'Responsive Design & Mobile Optimization',
        'SEO-Friendly Website Structure',
        'Website Speed Optimization',
        'API Integration & Custom Features',
      ],
      benefits: [
        '**Strong Online Presence:** Establish credibility and reach a global audience.',
        '**Improved User Experience (UX):** Keep visitors engaged with intuitive navigation.',
        '**Higher Conversion Rates:** A well-designed site drives more leads and sales.',
        '**Scalability:** Build a website that can grow with your business.',
        '**Enhanced Security:** Protect your data and your users.',
        '**Better SEO Performance:** Websites optimized for search engines rank higher.',
        '**Competitive Advantage:** Stand out with a unique and professional site.',
        '**24/7 Availability:** Your business is always open to potential customers.',
      ],
      longDescription: `
        Your website is your digital storefront, and our web development services are dedicated to building high-performing, visually appealing, and user-friendly websites that perfectly represent your brand. We offer a range of solutions, from custom web development to robust platform-based builds.

        For highly dynamic and scalable web applications, we specialize in **MERN Stack development (MongoDB, Express.js, React, Node.js)**, enabling us to build fast, secure, and feature-rich applications tailored to your exact specifications. Whether you need a complex web application, a custom CRM, or a unique online platform, we have the expertise.

        We also excel in **WordPress development**, creating bespoke themes and custom plugins to extend functionality and ensure your site is both powerful and easy to manage. Our e-commerce solutions, including platforms like **Shopify and WooCommerce**, are designed to provide seamless shopping experiences that maximize sales.

        Beyond development, we provide ongoing **website maintenance and support**, ensuring your site remains secure, fast, and up-to-date. Every website we build is **responsive and mobile-optimized**, guaranteeing a flawless experience across all devices. We also integrate SEO best practices from the ground up, ensuring your site is structured for optimal search engine visibility.
      `,
    },
  ];

  const openModal = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
    // Disable body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
    // Re-enable body scroll when modal is closed
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="pt-20 bg-gray-50">
      <Helmet>
        <title>Services - Target Trek</title>
        <meta
          name="description"
          content="Explore Target Trek's comprehensive digital marketing and web services, designed to elevate your brand and drive online results. Learn about our PPC, social media, content, email, affiliate marketing, and web development solutions."
        />
        <meta
          name="keywords"
          content="digital marketing services, web development, PPC, social media marketing, content marketing, email marketing, affiliate marketing, MERN stack, WordPress"
        />
      </Helmet>
      <section className="py-16 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3" itemProp="headline">
            Our Digital Marketing & Web Services
          </h1>
          <p className="text-lg md:text-xl text-blue-100" itemProp="description">
            Comprehensive solutions designed to elevate your brand and drive
            results online.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 lg:space-y-24">
          {services.map((service, index) => (
            <div
              key={service.id}
              ref={(el) => (sectionRefs.current[service.id] = el)}
              id={service.id}
              className={`flex flex-col ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } items-center gap-8 md:gap-12 lg:gap-16`}
              itemProp="service"
            >
              <div className="w-full md:w-1/2 lg:w-5/12 flex-shrink-0" itemProp="image">
                <img
                  src={service.imageUrl}
                  alt={service.altText}
                  className="rounded-lg shadow-xl object-cover w-full h-64 md:h-80 lg:h-96"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      'https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Found';
                  }}
                />
              </div>
              <div className="w-full md:w-1/2 lg:w-7/12" itemProp="description">
                <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4 w-16 h-16">
                  {service.icon}
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4" itemProp="title">
                  {service.title}
                </h2>
                <p className="text-gray-600 text-lg mb-6">{service.description}</p>
                {service.points && (
                  <ul className="space-y-2 mb-6" itemProp="keyFeatures">
                    {service.points.slice(0, 3).map((point, pointIndex) => (
                      <li key={pointIndex} className="flex items-start">
                        <CheckCircle
                          size={20}
                          className="text-green-500 mr-3 mt-1 flex-shrink-0"
                        />
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                    {service.points.length > 3 && (
                      <li className="flex items-start">
                        <span className="text-gray-700 font-semibold italic">...and more!</span>
                      </li>
                    )}
                  </ul>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => openModal(service)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                  >
                    Show More
                    <Info size={20} className="ml-2" />
                  </button>
                  <HashLink
                    to="/contact#contact-us"
                    className="inline-flex items-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    Get Started
                    <TrendingUp size={20} className="ml-2" />
                  </HashLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-blue-700 text-white" itemProp="callToAction">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Grow Your Business Online?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Let our team of experts craft a tailored digital marketing strategy
            to achieve your specific goals. Contact us today for a free
            consultation!
          </p>
          <HashLink
            to="/contact#contact-us"
            className="inline-block bg-white text-blue-600 px-10 py-3 rounded-full text-lg font-medium hover:bg-gray-100 transition duration-300 ease-in-out shadow-lg transform hover:scale-105"
            style={{ scrollBehavior: 'smooth' }}
          >
            Request a Free Consultation
          </HashLink>
        </div>
      </section>

      {/* Modal for Service Details */}
      {isModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-3xl font-bold text-gray-900">
                {selectedService.title}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition duration-150 ease-in-out"
                aria-label="Close modal"
              >
                <X size={28} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
              {/* Added a custom-scrollbar class for hiding scrollbar */}
              <p className="text-gray-700 text-lg mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: selectedService.longDescription }}></p>

              {selectedService.points && (
                <>
                  <h4 className="text-2xl font-semibold text-gray-800 mb-4">
                    Key Features of Our {selectedService.title} Service:
                  </h4>
                  <ul className="space-y-3 mb-6 list-disc list-inside text-gray-700 text-lg">
                    {selectedService.points.map((point, pointIndex) => (
                      <li key={`modal-point-${pointIndex}`}>{point}</li>
                    ))}
                  </ul>
                </>
              )}

              {selectedService.benefits && (
                <>
                  <h4 className="text-2xl font-semibold text-gray-800 mb-4">
                    How This Service Benefits You:
                  </h4>
                  <ul className="space-y-3 mb-6 list-disc list-inside text-gray-700 text-lg">
                    {selectedService.benefits.map((benefit, benefitIndex) => (
                      <li key={`modal-benefit-${benefitIndex}`} dangerouslySetInnerHTML={{ __html: benefit }}></li>
                    ))}
                  </ul>
                </>
              )}

              <p className="text-gray-800 text-lg mt-8 italic">
                Ready to transform your online presence with our {selectedService.title} service?
                Contact us today for a personalized strategy!
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <HashLink
                to="/contact#contact-us"
                onClick={closeModal} // Close modal when navigating
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                style={{ scrollBehavior: 'smooth' }}
              >
                Get a Free Consultation
                <TrendingUp size={20} className="ml-2" />
              </HashLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;