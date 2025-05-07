import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Star, Send, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import BASE_URL from '../utils/Url';

const reviewSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  companyName: z.string().min(2, { message: 'Company name must be at least 2 characters' }),
  position: z.string().min(2, { message: 'Position must be at least 2 characters' }),
  clientFeedback: z.string().min(10, { message: 'Feedback must be at least 10 characters' }),
  rating: z.number().min(1, { message: 'Rating must be between 1 and 5' }).max(5, { message: 'Rating must be between 1 and 5' }),
});

const SubmitReviewPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', companyName: '', position: '', clientFeedback: '', rating: 0 });
    const [formErrors, setFormErrors] = useState({});
    const [formStatus, setFormStatus] = useState({ submitting: false, success: false, error: null, validToken: true });
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        if (!token) {
            setFormStatus(prev => ({ ...prev, validToken: false, error: 'Review link is missing or invalid.' }));
            toast.error('Review link is missing or invalid.');
        }
    }, [token]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: undefined }));
        setFormStatus({ submitting: false, success: false, error: null, validToken: formStatus.validToken });
    };

    const handleRatingChange = (rate) => {
        setFormData(prev => ({ ...prev, rating: rate }));
        if (formErrors.rating) setFormErrors(prev => ({ ...prev, rating: undefined }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formStatus.validToken) return;

        setFormErrors({});
        setFormStatus({ submitting: true, success: false, error: null, validToken: true });
        const toastId = toast.loading('Submitting review...');

        const dataToValidate = { ...formData, rating: Number(formData.rating) };
        const validationResult = reviewSchema.safeParse(dataToValidate);
        
        if (!validationResult.success) {
            setFormErrors(validationResult.error.flatten().fieldErrors);
            const firstError = Object.values(validationResult.error.flatten().fieldErrors).flat()[0];
            toast.error(firstError || 'Please fix the errors below.', { id: toastId });
            setFormStatus({ submitting: false, success: false, error: 'Please fix the errors below.', validToken: true });
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/admin/reviews/${token}`, validationResult.data);
            toast.success(response.data.message || 'Review submitted successfully!', { id: toastId });
            setFormStatus({ submitting: false, success: true, error: null, validToken: false });
            setTimeout(() => navigate('/'), 3000); 
        } catch (err) {
            console.error("Error submitting review:", err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to submit review.';
            setFormStatus({ submitting: false, success: false, error: errorMsg, validToken: !(err.response?.status === 404 || err.response?.status === 400 || err.response?.status === 410) });
            toast.error(errorMsg, { id: toastId });
        }
    };

    if (!formStatus.validToken && !formStatus.submitting && !formStatus.success) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl text-center animate-fade-in">
                    <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h1 className="text-xl font-bold text-gray-800 mb-3">Invalid Link</h1>
                    <p className="text-gray-600">{formStatus.error || 'This review link is invalid, expired, or has already been used.'}</p>
                </div>
            </div>
        );
    }

    if (formStatus.success) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl text-center animate-fade-in">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h1 className="text-xl font-bold text-gray-800 mb-3">Thank You!</h1>
                    <p className="text-gray-600">Your review has been submitted successfully.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6 transition-all duration-300">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Share Your Experience</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Your Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} disabled={formStatus.submitting}
                                className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                    formErrors.name ? 'border-red-500' : 'border-gray-200'
                                }`} />
                            {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name[0]}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Company Name</label>
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} disabled={formStatus.submitting}
                                className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                    formErrors.companyName ? 'border-red-500' : 'border-gray-200'
                                }`} />
                            {formErrors.companyName && <p className="mt-1 text-xs text-red-500">{formErrors.companyName[0]}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Position</label>
                        <input type="text" name="position" value={formData.position} onChange={handleInputChange} disabled={formStatus.submitting}
                            className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                formErrors.position ? 'border-red-500' : 'border-gray-200'
                            }`} />
                        {formErrors.position && <p className="mt-1 text-xs text-red-500">{formErrors.position[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Rating</label>
                        <div className="flex justify-center space-x-1" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button type="button" key={star} onClick={() => handleRatingChange(star)}
                                    className={`p-1 transition-all duration-200 ${
                                        (hoverRating || formData.rating) >= star 
                                            ? 'text-yellow-400 scale-105' 
                                            : 'text-gray-300'
                                    }`}>
                                    <Star size={28} fill="currentColor" />
                                </button>
                            ))}
                        </div>
                        {formErrors.rating && <p className="mt-1 text-xs text-red-500 text-center">{formErrors.rating[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Feedback</label>
                        <textarea name="clientFeedback" value={formData.clientFeedback} onChange={handleInputChange} disabled={formStatus.submitting}
                            rows="3" className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                                formErrors.clientFeedback ? 'border-red-500' : 'border-gray-200'
                            }`}></textarea>
                        {formErrors.clientFeedback && <p className="mt-1 text-xs text-red-500">{formErrors.clientFeedback[0]}</p>}
                    </div>

                    {formStatus.error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center text-sm">
                            <AlertTriangle size={18} className="mr-2 flex-shrink-0" />
                            <span>{formStatus.error}</span>
                        </div>
                    )}

                    <button type="submit" disabled={formStatus.submitting} 
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-75">
                        {formStatus.submitting ? (
                            <Loader2 className="animate-spin mx-auto h-5 w-5" />
                        ) : (
                            <div className="flex items-center justify-center space-x-2">
                                <Send size={18} />
                                <span>Submit Review</span>
                            </div>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SubmitReviewPage;