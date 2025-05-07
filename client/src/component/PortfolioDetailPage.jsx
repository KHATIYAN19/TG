import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import { Trash2, Eye, EyeOff, CalendarDays, Loader2, AlertTriangle, FileQuestion, Pencil, ArrowLeft } from 'lucide-react'; // Added ArrowLeft
import BASE_URL from '../utils/Url';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
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
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};


function PortfolioDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    let isMounted = true; // Flag to prevent state update on unmounted component
    const fetchPortfolioItem = async () => {
      if (!slug) {
        setError("No portfolio slug provided.");
        setIsLoading(false);
        return;
      }
      // Reset states on new fetch attempt
      setIsLoading(true);
      setError(null);
      setItem(null);

      try {
        const response = await axios.get(`${BASE_URL}/portfolio/${slug}`);
        if (!isMounted) return; // Don't update state if component unmounted

        if (response.data && response.data.success) {
          setItem(response.data.data);
        } else {
          // Use 404 status specifically for "Not Found"
          if (response.status === 404) {
             setError('Portfolio item not found.');
          } else {
             throw new Error(response.data?.message || 'Failed to load portfolio item.');
          }
        }
      } catch (err) {
        if (!isMounted) return; // Don't update state if component unmounted
        console.error("Failed to fetch portfolio item:", err);
        const message = err.response?.status === 404
           ? 'Portfolio item not found.'
           : (err.response?.data?.message || err.message || 'Failed to load portfolio item.');
        setError(message);
        toast.error(message); // Show toast on error
      } finally {
         if (isMounted) {
           setIsLoading(false);
         }
      }
    };

    fetchPortfolioItem();

    // Cleanup function to set isMounted to false when component unmounts
    return () => {
      isMounted = false;
    };
  }, [slug]); // Dependency array only includes slug

  const handleDelete = async () => {
    if (!item?._id) return;
    setShowDeleteModal(false);
    const toastId = toast.loading('Deleting item...');
    try {
      const response = await axios.delete(`${BASE_URL}/portfolio/${item._id}`);
       if (response.data && response.data.success) {
           toast.success('Portfolio item deleted successfully!', { id: toastId });
           navigate('/portfolio');
       } else {
           throw new Error(response.data?.message || 'Failed to delete item.');
       }
    } catch (err) {
      console.error("Failed to delete portfolio item:", err);
      const message = err.response?.data?.message || err.message || 'Failed to delete item.';
      toast.error(message, { id: toastId });
    }
  };

  const handleTogglePublish = async () => {
    if (!item?._id) return;
    const originalStatus = item.isPublished;
    const actionVerb = originalStatus ? 'Unpublishing' : 'Publishing';
    const toastId = toast.loading(`${actionVerb} item...`);

    setItem(prev => ({ ...prev, isPublished: !prev.isPublished }));

    try {
      const response = await axios.patch(`${BASE_URL}/portfolio/${item._id}/toggle`);
       if (response.data && response.data.success) {
           toast.success(`Item ${originalStatus ? 'unpublished' : 'published'} successfully!`, { id: toastId });
           setItem(response.data.data);
       } else {
           setItem(prev => ({ ...prev, isPublished: originalStatus }));
           throw new Error(response.data?.message || `Failed to ${actionVerb.toLowerCase()} item.`);
       }
    } catch (err) {
      setItem(prev => ({ ...prev, isPublished: originalStatus }));
      console.error("Failed to toggle publish status:", err);
      const message = err.response?.data?.message || err.message || `Failed to ${actionVerb.toLowerCase()} item.`;
      toast.error(message, { id: toastId });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Improved Error and Not Found States
  if (error || !item) {
    const isNotFoundError = error === 'Portfolio item not found.';
    const bgColor = isNotFoundError
      ? "from-gray-100 via-white to-gray-50"
      : "from-red-50 via-white to-red-100";
    const iconColor = isNotFoundError ? "text-blue-300" : "text-red-400";
    const titleColor = isNotFoundError ? "text-gray-700" : "text-red-700";
    const textColor = isNotFoundError ? "text-gray-500" : "text-red-600";
    const IconComponent = isNotFoundError ? FileQuestion : AlertTriangle;
    const errorTitle = isNotFoundError ? "Portfolio Item Not Found" : "Error Loading Project";
    const errorMessage = isNotFoundError
       ? "We couldn't find the specific project you were looking for. It might have been moved or deleted."
       : error;

    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${bgColor} p-4`}>
        <div className="text-center p-10 bg-white rounded-xl shadow-xl max-w-lg border border-gray-200">
           <IconComponent className={`h-20 w-20 ${iconColor} mx-auto mb-5`} strokeWidth={1.5}/>
           <h2 className={`text-3xl font-bold ${titleColor} mb-3`}>{errorTitle}</h2>
           <p className={`${textColor} text-lg mb-6`}>{errorMessage}</p>
           <Link
             to="/portfolio"
             className="inline-flex items-center px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out shadow-md hover:shadow-lg"
           >
              <ArrowLeft size={16} className="mr-2" />
              Return to Portfolio
           </Link>
        </div>
      </div>
    );
  }


  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete the portfolio item "${item.title}"? This action cannot be undone.`}
      />
      {/* Added pt-20 here */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 pt-20 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-5xl mx-auto relative">

          {isAdmin && (
            <div className="absolute top-0 right-0 -mt-4 sm:-mt-6 lg:-mt-8 flex items-center space-x-3 z-10 bg-white p-2 rounded-bl-lg rounded-tr-lg shadow-md border border-gray-200/70 " >
               <span
                 title={`Status: ${item.isPublished ? 'Published' : 'Draft'}`}
                 className={`flex items-center px-3 py-1 text-xs font-bold rounded-md ${item.isPublished ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}
               >
                 {item.isPublished ? <Eye size={14} className="mr-1.5"/> : <EyeOff size={14} className="mr-1.5"/>}
                 {item.isPublished ? 'Published' : 'Draft'}
               </span>
               <div className="flex space-x-1 border-l border-gray-200 pl-2">
                  <button
                    onClick={handleTogglePublish}
                    title={item.isPublished ? 'Unpublish Item' : 'Publish Item'}
                    className={`p-2 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 ${item.isPublished ? 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:ring-yellow-500' : 'text-green-700 bg-green-100 hover:bg-green-200 focus:ring-green-500'}`}
                  >
                    {item.isPublished ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    title="Delete Item"
                    className="p-2 rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 transition duration-150 ease-in-out"
                  >
                    <Trash2 size={18} />
                  </button>
               </div>
            </div>
          )}

          <div className="mb-10">
            <Link to="/portfolio" className="inline-flex items-center text-base font-medium text-blue-700 hover:text-blue-900 group transition-colors duration-200 ease-in-out">
              <ArrowLeft size={20} className="mr-2 transform transition-transform duration-200 ease-in-out group-hover:-translate-x-1" />
              Back to Portfolio
            </Link>
          </div>

          <article className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200/50">
            <div className="w-full h-72 sm:h-96 lg:h-[500px] bg-gray-100">
               {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.altText || item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                       e.target.onerror = null;
                       e.target.src=`https://placehold.co/1200x600/EBF4FF/4299E1?text=Image+Unavailable`;
                       e.target.alt = 'Image not available';
                    }}
                  />
               ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
               )}
            </div>

            <div className="p-8 sm:p-10 lg:p-12">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-y-2">
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">
                    {item.category || 'Uncategorized'}
                  </p>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                     <CalendarDays size={16} className="mr-1.5 text-gray-400 flex-shrink-0"/>
                     <span>Created: {formatDate(item.createdAt)}</span>
                  </div>
               </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                {item.title}
              </h1>

              <div className="prose prose-lg prose-blue max-w-none text-gray-700 leading-relaxed mb-10">
                {item.description.split('\n').map((paragraph, index) =>
                  paragraph.trim() && <p key={index}>{paragraph.trim()}</p>
                )}
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-5">Technologies & Skills</h3>
                  <div className="flex flex-wrap gap-3">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-800 rounded-lg border border-blue-100 shadow-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </>
  );
}

export default PortfolioDetailPage;