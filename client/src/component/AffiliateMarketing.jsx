import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { z } from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowRightCircle, BarChart, Users, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet';
import BASE_URL from '../utils/Url';

const formSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    companyName: z.string().min(1, 'Company name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
});

const AffiliateMarketing = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedService, setSelectedService] = useState('');
    const [formData, setFormData] = useState({ name: '', companyName: '', email: '', phone: '' });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false); // State to track form submission

    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
    }, []);

    const openModal = (service) => {
        setSelectedService(service);
        setIsOpen(true);
        document.body.classList.add('no-scroll');
    };

    const closeModal = () => {
        setIsOpen(false);
        document.body.classList.remove('no-scroll');
        setTimeout(() => {
            setFormData({ name: '', companyName: '', email: '', phone: '' });
            setErrors({});
            setSelectedService('');
            setIsSubmitting(false); // Reset submitting state on close
        }, 300);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) setErrors({ ...errors, [name]: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = formSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors = {};
            result.error.errors.forEach((err) => { fieldErrors[err.path[0]] = err.message; });
            setErrors(fieldErrors);
            toast.error('Please fix the form errors');
            return;
        }

        setIsSubmitting(true);
        const submitToastId = toast.loading('Submitting application...'); // Store the toast ID

        try {
            const response = await fetch(`${BASE_URL}/affiliate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...result.data,
                    service: selectedService.toLowerCase(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Submission failed');
            }

            toast.success(`Thank you! We'll contact you shortly.`, { id: 'submit-success' });
            closeModal();
        } catch (error) {
            toast.error(error.message || 'Submission failed. Please try again.', { id: 'submit-error' });
        } finally {
            setIsSubmitting(false);
            toast.dismiss(submitToastId); // Dismiss the loading toast
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans pt-24">
            <Helmet>
                <title>Affiliate - Target Trek</title>
                <meta
                    name="description"
                    content="Partner with Target Trek to grow your business through our affiliate marketing program. Reach new audiences and increase revenue."
                />
            </Helmet>
            <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <header className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-clip-text">
                        Accelerate Growth with Performance-Driven Affiliate Marketing
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Transform your digital strategy through strategic partnerships. Whether you're an advertiser seeking growth or a publisher monetizing influence, our platform delivers measurable results.
                    </p>
                </header>

                <div className="bg-white rounded-3xl shadow-xl p-8 mb-20 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="bg-blue-100 w-max p-3 rounded-xl mb-6">
                            <BarChart className="text-blue-600 w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Maximize ROI with Performance Partnerships</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Leverage our affiliate network to access 500K+ premium publishers across 150+ verticals. Our AI-driven matching algorithm connects you with partners that align perfectly with your target audience.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-bold text-blue-600 mb-2">Advertisers</h3>
                                <p className="text-sm text-gray-600">Scale acquisition cost-effectively</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-bold text-green-600 mb-2">Publishers</h3>
                                <p className="text-sm text-gray-600">Monetize your audience effectively</p>
                            </div>
                        </div>
                    </div>
                    <img
                        src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7"
                        alt="Affiliate marketing collaboration"
                        className="rounded-2xl h-full object-cover shadow-lg"
                        loading="lazy"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 rounded-3xl shadow-xl">
                        <div className="mb-6">
                            <div className="bg-white/20 w-max p-3 rounded-xl mb-6">
                                <Users className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Advertiser Solutions</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="text-green-400" />
                                    Access to 500K+ vetted publishers
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="text-green-400" />
                                    Real-time performance tracking
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="text-green-400" />
                                    Dedicated account management
                                </li>
                            </ul>
                        </div>
                        <button
                            onClick={() => openModal('Advertiser')}
                            className="w-full bg-white text-blue-600 px-6 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                        >
                            Start Advertising Program
                            <ArrowRightCircle className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-8 rounded-3xl shadow-xl">
                        <div className="mb-6">
                            <div className="bg-white/20 w-max p-3 rounded-xl mb-6">
                                <DollarSign className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Publisher Solutions</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="text-yellow-400" />
                                    10K+ premium offers
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="text-yellow-400" />
                                    Competitive commissions
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="text-yellow-400" />
                                    Timely payments
                                </li>
                            </ul>
                        </div>
                        <button
                            onClick={() => openModal('Publisher')}
                            className="w-full bg-white text-green-600 px-6 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                        >
                            Start Earning Today
                            <ArrowRightCircle className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </section>

            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white p-8 shadow-2xl transition-all">
                                    <div className="mb-6">
                                        <Dialog.Title className="text-2xl font-bold text-gray-900">
                                            {selectedService} Inquiry
                                        </Dialog.Title>
                                        <p className="text-gray-500 mt-1">Complete the form to get started</p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {['name', 'companyName', 'email', 'phone'].map((field) => (
                                            <div key={field}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {field === 'companyName' ? 'Company Name' : field.charAt(0).toUpperCase() + field.slice(1)}
                                                </label>
                                                <input
                                                    name={field}
                                                    value={formData[field]}
                                                    onChange={handleChange}
                                                    placeholder={`Enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                                                    className={`w-full px-4 py-3 rounded-lg border ${errors[field] ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                                    disabled={isSubmitting} // Disable input during submission
                                                />
                                                {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
                                            </div>
                                        ))}

                                        <button
                                            type="submit"
                                            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors ${isSubmitting ? 'cursor-not-allowed' : ''}`}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <div className="flex items-center justify-center">
                                                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                                    Submitting...
                                                </div>
                                            ) : (
                                                'Submit Application'
                                            )}
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
};

export default AffiliateMarketing;
