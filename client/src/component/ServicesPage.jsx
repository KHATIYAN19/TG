import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  Megaphone,
  Users,
  Edit3,
  Mail,
  DollarSign,
  Code,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Calendar,
  Briefcase,
} from "lucide-react";

const ServicesPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      slug: "ppc-advertising",
      title: "PPC Advertising",
      icon: <Megaphone size={28} />,
      image:
        "https://images.unsplash.com/photo-1557838923-2985c318be48?q=80&w=1400",
      description:
        "Strategic Google & Meta Ads campaigns built to generate high-intent leads and maximize ROI through precise targeting and continuous optimization.",
    },
    {
      slug: "social-media-marketing",
      title: "Social Media Marketing",
      icon: <Users size={28} />,
      image:
        "https://images.unsplash.com/photo-1611926653458-09294b3142bf?q=80&w=1400",
      description:
        "Build powerful brand presence across Instagram, LinkedIn & Facebook with engaging content and high-converting paid campaigns.",
    },
    {
      slug: "content-marketing",
      title: "Content Marketing",
      icon: <Edit3 size={28} />,
      image:
        "https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=1400",
      description:
        "SEO-driven blogs, landing pages and authority content designed to rank higher and convert visitors into customers.",
    },
    {
      slug: "affiliate-marketing",
      title: "Affiliate Marketing",
      icon: <DollarSign size={28} />,
      image:
        "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=1400",
      description:
        "Performance-based partnerships that scale your revenue while keeping customer acquisition cost low.",
    },
    {
      slug: "web-development",
      title: "Web Development",
      icon: <Code size={28} />,
      image:
        "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1400",
      description:
        "High-performance websites & web applications built using MERN stack and modern technologies.",
    },
    {
      slug: "genai-solutions",
      title: "GenAI Solutions",
      icon: <Sparkles size={28} />,
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1400",
      description:
        "AI chatbots, automation systems, smart assistants & custom AI workflows powered by Generative AI.",
    },
  ];

  const industries = [
    "Healthcare & Hospitals",
    "Education & E-Learning",
    "Travel & Tourism",
    "E-commerce & Retail",
    "Finance & Banking",
    "Real Estate",
    "Technology & SaaS",
    "Entertainment & Media",
  ];

  return (
    <div className="pt-20 bg-white">
      <Helmet>
        <title>Our Services | Target Trek</title>
        <meta
          name="description"
          content="Explore Target Trek's premium digital marketing, web development and GenAI solutions designed to accelerate business growth."
        />
      </Helmet>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-r from-blue-50 to-white py-24">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Transform Your Digital Presence
              <span className="text-blue-600"> with Target Trek</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              We provide innovative digital marketing, web development, and GenAI
              solutions tailored to accelerate your business growth and impact.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Get Free Consultation
              </Link>

              <Link
                to="/contact"
                className="flex items-center gap-2 border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                <Calendar size={18} />
                Book a Meeting
              </Link>
            </div>
          </div>

          <div>
            <img
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1400"
              alt="Digital Growth"
              className="rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our full suite of services designed to grow your business
            efficiently, with measurable results and innovative solutions.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service) => (
            <Link
              key={service.slug}
              to={`/services/${service.slug}`}
              className="group border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300 hover:-translate-y-2"
            >
              <div className="relative">
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-56 w-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-4 left-4 bg-white p-3 rounded-full shadow-md">
                  {service.icon}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex items-center text-blue-600 font-semibold">
                  Explore Service <ArrowRight size={18} className="ml-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* INDUSTRIES WE SERVE */}
      <section className="py-24 bg-blue-50 text-center">
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Industries We Serve
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our solutions are tailored for businesses across multiple sectors.
            We help companies achieve digital success in their respective
            industries.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {industries.map((industry, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-6 bg-white rounded-2xl shadow hover:shadow-lg transition duration-300"
            >
              <Briefcase className="text-blue-600 mb-3" size={28} />
              <p className="text-gray-800 font-semibold text-lg">{industry}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US / IMPACT */}
      <section className="py-24 bg-blue-50 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-12">
          Why Choose Target Trek
        </h2>

        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            "Data-driven marketing strategies focused on ROI",
            "AI-powered automation for faster scalability",
            "Customized solutions tailored to your business",
            "Transparent reporting and real-time tracking",
            "Conversion-focused website architecture",
            "Long-term growth partnership approach",
          ].map((point, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="text-green-500 mt-1" />
              <p className="text-gray-700 text-lg">{point}</p>
            </div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-10">
          {[
            { number: "250+", label: "Projects Completed" },
            { number: "98%", label: "Client Satisfaction" },
            { number: "3X", label: "Average ROI Growth" },
            { number: "50+", label: "Industries Served" },
          ].map((item, index) => (
            <div key={index}>
              <h3 className="text-4xl font-extrabold text-blue-600 mb-2">
                {item.number}
              </h3>
              <p className="text-gray-700">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA - LIGHT BG */}
      <section className="py-24 bg-blue-50 text-center text-gray-900">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Transform Your Business?
        </h2>
        <p className="max-w-2xl mx-auto mb-10 text-gray-700">
          Get in touch with our experts today and unlock your business potential
          with our tailored solutions.
        </p>

        <div className="flex justify-center gap-6 flex-wrap">
          <Link
            to="/contact"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Get Free Consultation
          </Link>

          <Link
            to="/contact"
            className="border border-blue-600 px-8 py-3 rounded-lg font-semibold text-blue-600 hover:bg-blue-100 transition"
          >
            Schedule a Meeting
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;