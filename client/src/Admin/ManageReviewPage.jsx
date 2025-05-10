import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Check, X, Star, Loader2, AlertTriangle, ToggleLeft, ToggleRight, User, Building, Briefcase, CalendarDays, Trash2, } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import BASE_URL from '../utils/Url';
import { Helmet } from 'react-helmet';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150 ease-in-out"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const ManageReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(useSelector((state) => state.auth.token));
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);

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
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, []);

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

    const openDeleteModal = (review) => {
        setReviewToDelete(review);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setReviewToDelete(null);
    };

    const confirmDeleteReview = async () => {
        if (!reviewToDelete) return;
        const { _id } = reviewToDelete;
        const toastId = toast.loading('Deleting review...');
        setShowDeleteModal(false);
        try {
            const response = await axios.delete(`${BASE_URL}/admin/reviews/${_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
           
            if (response.data && response.data.success) {
                setReviews(prevReviews => prevReviews.filter(r => r._id !== _id));
                toast.success(response.data.message || 'Review deleted successfully', { id: toastId });
            } else {
                const errorMessage = response.data?.message || 'Failed to delete review';
                toast.error(errorMessage, { id: toastId }); 
                throw new Error(errorMessage);
            }

        } catch (error) {
            const message = error.response?.data?.message || error.message || 'Failed to delete review';
            toast.error(message, { id: toastId });
        } 
    };

    return (
        <>
            <Helmet>
                <title>Manage Client Reviews | Techistha</title>
                <meta name="description" content="Manage client reviews for Techistha.  Approve, delete, and view client feedback." />
            </Helmet>
            <div className="pt-20 pb-16 bg-gradient-to-br from-gray-100 to-blue-50 min-h-screen">
                <Toaster position="top-center" />
                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={closeDeleteModal}
                    onConfirm={confirmDeleteReview}
                    title="Delete Review"
                    message={reviewToDelete ? `Are you sure you want to delete this review?` : ''}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">Manage Client Reviews</h1>

                    {error && !isLoading && (
                        <div className="mb-6 p-4 rounded-md bg-red-100 border border-red-300 text-sm text-red-800 flex items-center shadow-md">
                            <AlertTriangle size={18} className="mr-2 flex-shrink-0" /> Error: {error}
                        </div>
                    )}

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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {reviews.map((review) => (
                                    <div
                                        key={review._id}
                                        className={`bg-white rounded-xl shadow-lg border ${review.isPublished ? 'border-green-200' : 'border-gray-200'} p-5 flex flex-col justify-between transition-shadow duration-200 hover:shadow-xl`}
                                    >
                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                {renderStars(review.rating)}
                                                <span className="text-xs text-gray-400 flex items-center">
                                                    <CalendarDays size={14} className="mr-1" />
                                                    {format(parseISO(review.createdAt), 'dd MMM, yyyy')}
                                                </span>
                                            </div>

                                            <p className="text-gray-700 mb-4 text-base italic leading-relaxed before:content-['“'] before:mr-1 before:font-serif before:text-xl before:text-gray-400 after:content-['”'] after:ml-1 after:font-serif after:text-xl after:text-gray-400">
                                                {review.clientFeedback}
                                            </p>

                                            <div className="border-t border-gray-100 pt-3 mt-auto space-y-1.5 text-sm">
                                                <p className="flex items-center font-semibold text-gray-800">
                                                    <User size={14} className="mr-2 text-blue-500" /> {review.name}
                                                </p>
                                                <p className="flex items-center text-gray-600">
                                                    <Building size={14} className="mr-2 text-gray-400" /> {review.companyName}
                                                </p>
                                                <p className="flex items-center text-gray-600">
                                                    <Briefcase size={14} className="mr-2 text-gray-400" /> {review.position}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                            <span className={`text-xs font-medium  ${review.isPublished ? 'text-green-600' : 'text-gray-500'}`}>
                                                {review.isPublished ? 'Published' : 'Not Published'}
                                            </span>
                                            <div className='flex gap-2'>
                                            <button
                                                onClick={() => handleTogglePublish(review._id, review.isPublished)}
                                                className={`cursor-pointer p-1 rounded-full transition-colors duration-200 ${review.isPublished ? 'text-green-500 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}
                                                title={review.isPublished ? 'Click to Unpublish' : 'Click to Publish'}
                                            >
                                                {review.isPublished ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(review)}
                                                className="text-red-600 hover:text-red-900 hover:bg-red-100 p-1 rounded-full transition-colors duration-200"
                                                title="Delete Review"
                                            >
                                                <Trash2 size={24} />
                                            </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ManageReviewsPage;
