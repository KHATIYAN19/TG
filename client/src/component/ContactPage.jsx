import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import BASE_URL from "../utils/Url.js";
import { MapPin, Phone, Mail, Send, Loader2, ChevronDown } from 'lucide-react';
import { Helmet } from "react-helmet"

const servicesList = [
  'PPC Advertising',
  'Affiliate Marketing',
  'Email Marketing',
  'Web Development',
  'Other Inquiry'
];

const contactSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  contactNumber: z.string()
    .regex(/^([0-9]{10})$/, { message: 'Number must be 10 digits' })
    .transform(val => val),
  service: z.string().min(1, { message: 'Please select a service' }),
  message: z.string().optional(),
});

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    service: '',
    message: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Scroll to the top of the page on component mount
        window.scrollTo(0, 0);

        // Attempt to manage scroll restoration, though not always reliably supported
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        // Apply smooth scrolling to the documentElement
        document.documentElement.style.scrollBehavior = 'smooth';

        // Cleanup: Remove smooth scrolling when the component unmounts
        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []); // Empty dependency array ensures this runs only once on mount



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "contactNumber") {
      const numericValue = value.replace(/\D/g, '');
        if (numericValue.length <= 10) {
          setFormData(prev => ({ ...prev, [name]: numericValue }));
        }
    }
     else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmitting(true);

    const validationResult = contactSchema.safeParse(formData);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      setFormErrors(errors);
      toast.error('Please fix the errors in the form.');
      setIsSubmitting(false);
      return;
    }
      const dataToSend = {
      ...validationResult.data,
      contactNumber: '+91' + validationResult.data.contactNumber
    }

    const loadingToastId = toast.loading('Sending your message...');

    try {
      const apiUrl = `${BASE_URL}/messages/us`;
      const response = await axios.post(apiUrl, dataToSend);

      toast.dismiss(loadingToastId);

      if (response.status === 200 || response.status === 201) {
        toast.success("Message sent successfully! Our team will contact you soon.");
        setFormData({ name: '', email: '', contactNumber: '', service: '', message: '' });
      } else {
        console.warn("Unexpected success status:", response.status);
        toast.error('Received an unexpected response from the server.');
      }

    } catch (error) {
      toast.dismiss(loadingToastId);
      console.error('Submission error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again later.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-16 md:pt-20 bg-gradient-to-b from-gray-50 to-blue-50 min-h-screen">
      <Helmet>
        <title>Contact - Target Trek</title>
        <meta
          name="description"
          content="Contact Target Trek for your digital marketing and web service needs.  Reach out to our team with your questions or project inquiries."
        />
      </Helmet>
      <Toaster position="top-center" reverseOrder={false} />

      <section className="py-12 md:py-16 bg-blue-600 text-white text-center shadow-md">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Get In Touch</h1>
          <p className="text-lg md:text-xl text-blue-100">
            We'd love to hear from you! Reach out with questions or project inquiries.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 mb-4">Contact Information</h2>
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-start">
                    <MapPin size={20} className="text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <span>
                      [Your Street Address],<br />
                      [Your City], [State] [Zip Code]<br />
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Phone size={20} className="text-blue-600 mr-3 flex-shrink-0" />
                    <span>[Your Phone Number]</span>
                  </div>
                  <div className="flex items-center">
                    <Mail size={20} className="text-blue-600 mr-3 flex-shrink-0" />
                    <span>[Your Email Address]</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Driving Digital Growth</h3>
                <div className="bg-gray-200 rounded-lg shadow-md overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
                    alt="Team collaborating on a digital project"
                    className="w-full h-64 object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x300/e2e8f0/94a3b8?text=Collaboration"; }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 italic">Let's build something great together.</p>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl">
              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-800 mb-6" id="contact-us">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} disabled={isSubmitting}
                    className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${formErrors.name ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:border-blue-500'}`}
                    placeholder="e.g., Jane Doe"
                  />
                  {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name[0]}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} disabled={isSubmitting}
                    className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${formErrors.email ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:border-blue-500'}`}
                    placeholder="you@example.com"
                  />
                  {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email[0]}</p>}
                </div>

                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border-t border-l border-b border-gray-300 text-gray-900 sm:text-sm">
                      +91
                    </span>
                    <input
                      type="tel"
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${formErrors.contactNumber ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:border-blue-500'}`}
                      placeholder="XXXXXXXXXX"
                      maxLength={10}
                    />
                  </div>
                  {formErrors.contactNumber && <p className="mt-1 text-xs text-red-500">{formErrors.contactNumber[0]}</p>}
                </div>

                <div className="relative">
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">Service Interested In</label>
                  <select
                    id="service" name="service" value={formData.service} onChange={handleInputChange} disabled={isSubmitting}
                    className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 appearance-none ${formErrors.service ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:border-blue-500'} ${formData.service ? 'text-gray-900' : 'text-gray-500'}`}
                    >
                    <option value="" disabled>Select a Service</option>
                    {servicesList.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-gray-700">
                    <ChevronDown size={20} />
                  </div>
                  {formErrors.service && <p className="mt-1 text-xs text-red-500">{formErrors.service[0]}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                  <textarea
                    id="message" name="message" rows="5" value={formData.message} onChange={handleInputChange} disabled={isSubmitting}
                    className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${formErrors.message ? 'border-red-500 focus:ring-red-300' : 'border-gray-300 focus:border-blue-500'}`}
                    placeholder="How can we help you?"
                  ></textarea>
                  {formErrors.message && <p className="mt-1 text-xs text-red-500">{formErrors.message[0]}</p>}
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out">
                    {isSubmitting ? ( <><Loader2 className="animate-spin h-5 w-5 mr-3" /> Sending...</> ) : ( <><Send size={18} className="mr-2" /> Send Message</> )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default ContactPage;
