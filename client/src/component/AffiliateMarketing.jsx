import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast'; // Import toast
import { ArrowRightCircle, BarChart, Users, DollarSign, CheckCircle } from 'lucide-react'; // Import icons

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  companyName: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format (e.g., +14155552671)'),
  skype: z.string().optional(),
});

export default function AffiliateMarketing() {
  // State management (remains the same)
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [formData, setFormData] = useState({ name: '', companyName: '', email: '', phone: '', skype: '' });
  const [errors, setErrors] = useState({});

  // Modal functions (remain the same)
  const openModal = (service) => { setSelectedService(service); setIsOpen(true); };
  const closeModal = () => {
    setIsOpen(false);
    setTimeout(() => {
        setFormData({ name: '', companyName: '', email: '', phone: '', skype: '' });
        setErrors({});
        setSelectedService('');
    }, 300);
  };

  // Form handlers (remain the same)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) { setErrors({ ...errors, [name]: null }); }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const result = formSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => { fieldErrors[err.path[0]] = err.message; });
      setErrors(fieldErrors);
      toast.error('Please check the form for errors.');
    } else {
      console.log('Form submitted:', result.data, 'Service:', selectedService);
      // TODO: Replace console.log with actual API call
      toast.success(`Enquiry for ${selectedService} submitted successfully!`);
      closeModal();
    }
  };

  return (
    <div className="bg-white py-16 px-6 md:px-20 font-sans pt-24">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="text-center mb-16">
         <h2 className="text-4xl font-bold text-blue-700 mb-4 tracking-tight">Unlock Growth with Affiliate Marketing</h2>
         <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
            We provide comprehensive affiliate marketing solutions designed for success. Connect with the right opportunities through strategic partnerships.
         </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 via-gray-50 to-blue-100 p-8 md:p-12 rounded-2xl shadow-xl mb-20 flex flex-col lg:flex-row items-center gap-10 lg:gap-12 border border-gray-200">
        <div className="lg:w-3/5 text-center lg:text-left">
            <h3 className="text-3xl font-semibold text-gray-800 mb-5 tracking-tight">The Power of Partnership Marketing</h3>
            <p className="text-gray-700 mb-4 leading-relaxed text-lg">
                Affiliate marketing is a dynamic, performance-driven strategy where businesses reward partners (affiliates/publishers) for driving valuable actions, like sales or leads, through the affiliate's unique promotional efforts.
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
                Publishers leverage unique tracking links to promote products or services. When their audience engages and converts, they earn a commission. This synergistic model allows businesses to scale customer acquisition cost-effectively while enabling publishers to monetize their content and influence.
            </p>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-white p-4 rounded-lg shadow border border-blue-200">
                    <BarChart size={24} className="mx-auto mb-2 text-blue-600"/>
                    <h4 className="font-semibold text-sm text-blue-800">Performance ROI</h4>
                    <p className="text-xs text-gray-500">Pay only for results.</p>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow border border-green-200">
                    <Users size={24} className="mx-auto mb-2 text-green-600"/>
                    <h4 className="font-semibold text-sm text-green-800">Targeted Reach</h4>
                     <p className="text-xs text-gray-500">Access niche audiences.</p>
                </div>
                 <div className="bg-white p-4 rounded-lg shadow border border-yellow-300">
                    <DollarSign size={24} className="mx-auto mb-2 text-yellow-600"/>
                    <h4 className="font-semibold text-sm text-yellow-800">Revenue Growth</h4>
                     <p className="text-xs text-gray-500">Scale sales efficiently.</p>
                </div>
            </div>
        </div>
        <div className="lg:w-2/5 w-full mt-8 lg:mt-0">
            <img
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1032&q=80" // Example stock photo URL
                alt="Team collaborating on laptops, representing digital marketing partnerships" // Updated alt text
                className="rounded-xl shadow-lg w-full h-auto object-cover mx-auto border-4 border-white"
                onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop if fallback also fails
                    e.target.src='https://placehold.co/600x450/e0f2fe/0284c7?text=Affiliate+Network';
                    e.target.alt='Placeholder illustration of an affiliate network';
                 }}
            />
        </div>
      </div>


      <div className="flex flex-col md:flex-row justify-center items-stretch gap-10">

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl shadow-lg w-full md:w-1/2 hover:shadow-2xl transition duration-300 ease-in-out flex flex-col">
          <img
            src="https://placehold.co/96x96/e0f2fe/3b82f6?text=📈"
            alt="Advertiser Icon - Sales Growth Graph"
            className="h-24 w-24 object-contain mx-auto mb-5 rounded-full bg-white p-3 shadow-md"
            onError={(e) => e.target.src='https://placehold.co/96x96/cccccc/ffffff?text=Error'}
          />
          <h3 className="text-2xl font-semibold text-blue-800 mb-3 text-center">For Advertisers</h3>
          <div className="text-gray-700 text-left space-y-3 mb-6 flex-grow">
             <p>
               Supercharge sales and visibility. Connect with high-performing publishers ready to promote your brand to relevant audiences.
             </p>
             <p>
               Benefit from managed programs or platform tools. We handle recruitment, tracking, reporting, and payments, ensuring brand safety and maximizing ROAS.
             </p>
             <p>
                Gain detailed insights, optimize campaigns, and build valuable partnerships. Pay for actual results, making it highly cost-effective.
             </p>
          </div>
          <button
            onClick={() => openModal('Advertiser')}
            className="mt-auto w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-150 ease-in-out shadow hover:shadow-md flex items-center justify-center gap-2"
          >
            Grow Your Brand <ArrowRightCircle size={20} />
          </button>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl shadow-lg w-full md:w-1/2 hover:shadow-2xl transition duration-300 ease-in-out flex flex-col">
          <img
             src="https://placehold.co/96x96/d1fae5/059669?text=💻"
            alt="Publisher Icon - Content Creator Laptop"
            className="h-24 w-24 object-contain mx-auto mb-5 rounded-full bg-white p-3 shadow-md"
            onError={(e) => e.target.src='https://placehold.co/96x96/cccccc/ffffff?text=Error'}
          />
          <h3 className="text-2xl font-semibold text-green-800 mb-3 text-center">For Publishers</h3>
           <div className="text-gray-700 text-left space-y-3 mb-6 flex-grow">
             <p>
               Turn your influence into income. Partner with leading brands and promote products/services that align with your audience.
             </p>
             <p>
               Access diverse offers with competitive commissions (CPS, CPL, CPA). Our platform provides reliable tracking, reporting, creative assets, and timely payments.
             </p>
             <p>
                Whether you run a blog, social media community, or niche website, we provide the tools and support to maximize earnings. Get paid for your influence.
             </p>
          </div>
          <button
            onClick={() => openModal('Publisher')}
            className="mt-auto w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition duration-150 ease-in-out shadow hover:shadow-md flex items-center justify-center gap-2"
          >
            Monetize Your Influence <ArrowRightCircle size={20} />
          </button>
        </div>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-20" onClose={closeModal}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-6 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-90" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-90">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900 mb-2">
                    {selectedService} Enquiry
                  </Dialog.Title>
                  <p className="text-sm text-gray-500 mb-4">
                    Fill in your details and we’ll get back to you.
                  </p>
                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {[ {id: 'name', label: 'Your Name', type: 'text', required: true}, {id: 'companyName', label: 'Company Name', type: 'text', required: true}, {id: 'email', label: 'Email Address', type: 'email', required: true}, {id: 'phone', label: 'Phone Number', type: 'tel', required: true}, {id: 'skype', label: 'Skype ID', type: 'text', required: false}, ].map((field) => (
                      <div key={field.id}>
                        <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1"> {field.label} {field.required && <span className="text-red-500">*</span>} </label>
                        <input type={field.type} id={field.id} name={field.id} placeholder={field.required ? `${field.label}` : `${field.label} (Optional)`} value={formData[field.id]} onChange={handleChange} className={`w-full px-4 py-2 rounded-lg border ${errors[field.id] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none focus:ring-2`} />
                        {errors[field.id] && ( <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p> )}
                      </div>
                    ))}
                    <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Submit Enquiry
                    </button>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
