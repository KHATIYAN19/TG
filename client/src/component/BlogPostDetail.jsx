import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Calendar, User, Loader2, AlertTriangle, Trash2, Eye, EyeOff, AlertTriangle as ModalAlertIcon, X, Frown } from 'lucide-react';
import BASE_URL from "../utils/Url.js"; // Adjust path as needed
import toast, { Toaster } from 'react-hot-toast';

// Inline Confirmation Modal (same as before)
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <ModalAlertIcon className="text-red-500 mr-2" size={20} />{title || 'Confirm Action'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <div className="p-6 text-sm text-gray-700">{message || 'Are you sure?'}</div>
        <div className="flex justify-end p-4 bg-gray-50 border-t space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Confirm Delete</button>
        </div>
      </div>
    </div>
  );
};

const BlogPostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const isAdmin = isAuthenticated && user?.role === 'admin';

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${BASE_URL}/blogs/${slug}`);
        if (response.data.success) {
          setPost(response.data.data);
        } else {
          // Treat backend 'success: false' as an error
          setError(response.data.error?.message || 'Blog post not found.');
          toast.error(response.data.error?.message || 'Could not load post.');
        }
      } catch (err) {
        console.error("Error fetching blog post:", err);
        const errorMsg = err.response?.status === 404
            ? 'Blog post not found.'
            : (err.response?.data?.error?.message || err.message || 'An error occurred.');
        setError(errorMsg);
        // Only show toast if it's not a simple 404
        if (err.response?.status !== 404) {
            toast.error(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    } else {
        setError('No blog slug provided.');
        toast.error('No blog slug provided.');
        setLoading(false);
    }

  }, [slug]);

  const handleDeleteClick = () => {
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!post?._id) return;
    const toastId = toast.loading('Deleting post...');
    try {
      const response = await axios.delete(`${BASE_URL}/blogs/${post._id}`);
      if (response.data.success) {
        toast.success('Blog post deleted successfully.', { id: toastId });
        setIsModalOpen(false);
        navigate('/blogs'); // Navigate back to list
      } else {
         throw new Error(response.data.error?.message || 'Failed to delete post');
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      toast.error(err.message || 'Failed to delete post.', { id: toastId });
      setIsModalOpen(false);
    }
  };

  const handleTogglePublish = async () => {
     if (!post?._id) return;
    const currentStatus = post.isPublished;
    const action = currentStatus ? 'Unpublishing' : 'Publishing';
    const toastId = toast.loading(`${action} post...`);
    try {
        const response = await axios.patch(`${BASE_URL}/blogs/${post._id}/toggle-publish`);
        if (response.data.success) {
            setPost(response.data.data); // Update local state with the response
            toast.success(response.data.message || `Post ${action.toLowerCase()} successful.`, { id: toastId });
        } else {
            throw new Error(response.data.error?.message || `Failed to ${action.toLowerCase()} post.`);
        }
    } catch (err) {
        console.error(`Error ${action.toLowerCase()} post:`, err);
        toast.error(err.message || `Failed to ${action.toLowerCase()} post.`, { id: toastId });
    }
  };

  const formatDate = (dateString) => {
    try {
      const parsed = parseISO(dateString);
      return format(parsed, 'MMMM d, yyyy \'at\' h:mm a');
    } catch (e) {
      console.error(`Could not parse date: ${dateString}`);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  // --- Updated Error/Not Found Handling ---
  if (error || !post) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-8 text-center">
        <Toaster position="top-center" reverseOrder={false} />
        <Frown className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Oops! Post Not Found</h2>
        <p className="text-gray-500 mb-6">
          {error || "We couldn't find the blog post you were looking for."}
        </p>
        <button
            onClick={() => navigate('/blogs')}
            className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
            <ArrowLeft size={18} className="mr-2" /> Go Back to Blogs
        </button>
      </div>
    );
  }
  // --- End Updated Error/Not Found Handling ---

  return (
    <div className="bg-gray-100 min-h-screen pb-16 pt-20">
      <Toaster position="top-center" reverseOrder={false} />

      {post.imageUrl && (
           <div className="w-full h-64 md:h-96 bg-gray-300">
               <img
                src={post.imageUrl}
                alt={post.altText || post.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display='none'; }}
                />
           </div>
      )}

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg -mt-16 md:-mt-24 relative z-10">
        <div className="p-6 md:p-10">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <button onClick={() => navigate('/blogs')} className="inline-flex items-center text-sm text-blue-600 hover:underline">
                    <ArrowLeft size={16} className="mr-1" /> Back to Blogs
                </button>
                {isAdmin && (
                    <div className="flex items-center space-x-3 border border-gray-200 p-2 rounded-md">
                        <button
                            onClick={handleTogglePublish}
                            title={post.isPublished ? 'Unpublish Post' : 'Publish Post'}
                            className={`p-1.5 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 ${post.isPublished ? 'text-yellow-600 hover:bg-yellow-100 focus:ring-yellow-500' : 'text-green-600 hover:bg-green-100 focus:ring-green-500'}`}
                        >
                            {post.isPublished ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                         <div className="border-l h-5 border-gray-300"></div>
                        <button
                            onClick={handleDeleteClick}
                            title="Delete Post"
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                )}
           </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4 gap-x-4 gap-y-1">
            <div className="flex items-center">
              <User size={14} className="mr-1.5"/> {post.author}
            </div>
            <div className="flex items-center">
              <Calendar size={14} className="mr-1.5"/> Published on {formatDate(post.createdAt)}
            </div>
             {!post.isPublished && <span className="text-xs font-semibold px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">Draft</span>}
          </div>
           {post.tags && (
             <div className="mb-6">
               {post.tags.map(tag => (
                 <span key={tag} className="inline-block bg-gray-100 text-gray-700 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full capitalize">
                   #{tag}
                 </span>
               ))}
             </div>
           )}

          <div className="prose prose-lg max-w-none text-gray-800">
            <p>{post.excerpt}</p>
            {/* Add full content rendering here if available */}
            {/* <div dangerouslySetInnerHTML={{ __html: post.content }} /> */}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the post "${post?.title || ''}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default BlogPostDetail;
