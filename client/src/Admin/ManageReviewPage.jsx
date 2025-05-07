import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Check, X, Star, Loader2, AlertTriangle, ToggleLeft, ToggleRight, User, Building, Briefcase, MessageSquare, CalendarDays } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import BASE_URL from '../utils/Url'; 

const ManageReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const[token,setToken]=useState(useSelector((state)=>state.auth.token));
    const fetchReviews = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BASE_URL}/admin/reviews/all`, {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              });
            setReviews(response.data || []);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to load reviews.';
            setError(errorMsg);
            toast.error(errorMsg);
            setReviews([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    // Handle toggling the publish status
    const handleTogglePublish = async (reviewId, currentStatus) => {
        const action = currentStatus ? 'Unpublish' : 'Publish';
        const toastId = toast.loading(`${action}ing review...`);

        try {
            const response = await axios.patch(
                `${BASE_URL}/admin/reviews/${reviewId}/toggle-publish`,
                null,
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );
              
            setReviews(prevReviews =>
                prevReviews.map(review =>
                    review._id === reviewId ? { ...review, isPublished: !currentStatus } : review
                )
            );
            toast.success(response.data.message || `Review ${action.toLowerCase()}ed successfully!`, { id: toastId });

        } catch (err) {
            console.error(`Error ${action.toLowerCase()}ing review:`, err);
            const errorMsg = err.response?.data?.message || err.message || `Failed to ${action.toLowerCase()} review.`;
            toast.error(errorMsg, { id: toastId });
        }
    };

    const renderStars = (rating) => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={16}
                        className={`mr-0.5 ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                ))}
                <span className='text-xs ml-1 text-gray-500'>({rating}/5)</span>
            </div>
        );
    };

    return (
        <div className="pt-20 pb-16 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen">
            <Toaster position="top-center" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">Manage Client Reviews</h1>

                {error && !isLoading && (
                    <div className="mb-6 p-4 rounded-md bg-red-100 border border-red-300 text-sm text-red-800 flex items-center shadow-md">
                        <AlertTriangle size={18} className="mr-2 flex-shrink-0" /> Error: {error}
                    </div>
                )}

                {/* Review Cards Grid */}
                <div className="space-y-6">
                    {isLoading ? (
                        <div className="p-10 text-center text-gray-500">
                            <Loader2 className="animate-spin h-10 w-10 mx-auto mb-3 text-blue-600" /> Loading reviews...
                        </div>
                    ) : reviews.length === 0 ? (
                         <div className="p-10 text-center text-gray-500 bg-white rounded-lg shadow-md">
                            No reviews found. You can generate review links to send to clients.
                         </div>
                    ) : (
                        // Use a grid layout for the cards
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.map((review) => (
                                // Review Card
                                <div key={review._id} className={`bg-white rounded-xl shadow-lg border ${review.isPublished ? 'border-green-200' : 'border-gray-200'} p-5 flex flex-col justify-between transition-shadow duration-200 hover:shadow-xl`}>
                                    <div>
                                        {/* Rating and Date */}
                                        <div className="flex justify-between items-center mb-3">
                                            {renderStars(review.rating)}
                                            <span className="text-xs text-gray-400 flex items-center">
                                                <CalendarDays size={14} className="mr-1"/>
                                                {format(parseISO(review.createdAt), 'dd MMM yyyy')}
                                            </span>
                                        </div>

                                        {/* Client Feedback */}
                                        <p className="text-gray-700 mb-4 text-base italic leading-relaxed before:content-['“'] before:mr-1 before:font-serif before:text-xl before:text-gray-400 after:content-['”'] after:ml-1 after:font-serif after:text-xl after:text-gray-400">
                                            {review.clientFeedback}
                                        </p>

                                        {/* Client Info */}
                                        <div className="border-t border-gray-100 pt-3 mt-auto space-y-1.5 text-sm">
                                            <p className="flex items-center font-semibold text-gray-800">
                                                <User size={14} className="mr-2 text-blue-500"/> {review.name}
                                            </p>
                                            <p className="flex items-center text-gray-600">
                                                 <Building size={14} className="mr-2 text-gray-400"/> {review.companyName}
                                            </p>
                                            <p className="flex items-center text-gray-600">
                                                 <Briefcase size={14} className="mr-2 text-gray-400"/> {review.position}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Publish Toggle */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end items-center">
                                         <span className={`text-xs font-medium mr-2 ${review.isPublished ? 'text-green-600' : 'text-gray-500'}`}>
                                            {review.isPublished ? 'Published' : 'Not Published'}
                                         </span>
                                        <button
                                            onClick={() => handleTogglePublish(review._id, review.isPublished)}
                                            className={`cursor-pointer p-1 rounded-full transition-colors duration-200 ${review.isPublished ? 'text-green-500 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}
                                            title={review.isPublished ? 'Click to Unpublish' : 'Click to Publish'}
                                        >
                                            {review.isPublished ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageReviewsPage;
