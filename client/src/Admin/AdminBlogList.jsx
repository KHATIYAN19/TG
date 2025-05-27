import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Trash2, Eye, EyeOff, PlusCircle, RefreshCw, Loader2, AlertTriangle, ExternalLink, ShieldAlert } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import BASE_URL from "../utils/Url.js";
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';

const AdminBlogManagementPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);

    const fetchBlogs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BASE_URL}/blogs/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data && response.data.success && Array.isArray(response.data.data)) {
                const sortedBlogs = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setBlogs(sortedBlogs);
            } else {
                setBlogs([]);
                setError(response.data?.message || 'Received unexpected data format from server.');
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to fetch blog posts. Please try again.';
            setError(message);
            toast.error(message);
            setBlogs([]);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
        fetchBlogs();
    }, [fetchBlogs]);

    const handleTogglePublish = async (id, currentStatus, event) => {
        event.stopPropagation();
        const originalBlogs = [...blogs];
        const optimisticBlogs = blogs.map(blog =>
            blog._id === id ? { ...blog, isPublished: !currentStatus } : blog
        );
        setBlogs(optimisticBlogs);

        try {
            const apiCall = axios.patch(`${BASE_URL}/blogs/${id}/toggle-publish`, null, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            await toast.promise(
                apiCall,
                {
                    loading: currentStatus ? 'Unpublishing...' : 'Publishing...',
                    success: 'Status updated successfully!',
                    error: (err) => err.response?.data?.message || 'Failed to update status.'
                },
                {
                    style: { minWidth: '200px' },
                    success: { duration: 3000 },
                    error: { duration: 4000 },
                }
            );
        } catch (err) {
            setBlogs(originalBlogs);
        }
    };

    const openDeleteModal = (id, title, event) => {
        event.stopPropagation();
        setBlogToDelete({ id, title });
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setBlogToDelete(null);
    };

    const confirmDeleteBlog = async () => {
        if (!blogToDelete) return;

        const { id } = blogToDelete;
        closeDeleteModal();

        const originalBlogs = [...blogs];
        const optimisticBlogs = blogs.filter(blog => blog._id !== id);
        setBlogs(optimisticBlogs);

        try {
            const apiCall = axios.delete(`${BASE_URL}/blogs/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            await toast.promise(
                apiCall,
                {
                    loading: 'Deleting blog post...',
                    success: 'Blog post deleted successfully!',
                    error: (err) => err.response?.data?.message || 'Failed to delete blog post.'
                },
                {
                    style: { minWidth: '200px' },
                    success: { duration: 3000 },
                    error: { duration: 4000 },
                }
            );
        } catch (err) {
            setBlogs(originalBlogs);
        }
    };

    const handleRowClick = (slug) => {
        navigate(`/blog/${slug}`);
    };

    return (
        <>
            <Helmet>
                <title>Manage Blog Posts | Target Trek</title>
                <meta name="description" content="Manage blog posts, including publishing, editing, and deleting, on Techistha." />
            </Helmet>
            <div className="pt-20 md:pt-24 pb-16 min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
                <Toaster position="top-center" reverseOrder={false} toastOptions={{ className: 'text-sm' }} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Manage Blog Posts</h1>
                        <div className="flex space-x-3">
                            <button
                                onClick={fetchBlogs}
                                disabled={isLoading}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition duration-150"
                            >
                                <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            <NavLink
                                to="/admin/add-blog"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                            >
                                <PlusCircle size={16} className="mr-2" />
                                Add New Blog
                            </NavLink>
                        </div>
                    </div>

                    {isLoading && !blogs.length && (
                        <div className="text-center py-16">
                            <Loader2 className="animate-spin h-10 w-10 text-indigo-600 mx-auto" />
                            <p className="mt-3 text-lg text-gray-600">Loading posts...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow" role="alert">
                            <div className="flex items-center">
                                <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                                <div>
                                    <p className="font-bold">Error</p>
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!isLoading && !error && blogs.length === 0 && (
                        <div className="text-center py-16 bg-white shadow-lg rounded-lg border border-gray-200">
                            <h3 className="text-2xl font-semibold text-gray-700">No Blog Posts Yet</h3>
                            <p className="mt-3 text-gray-500">Ready to share some insights? Create your first post!</p>
                            <NavLink
                                to="/admin/add-blog"
                                className="mt-6 inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                            >
                                <PlusCircle size={18} className="mr-2" />
                                Create First Blog Post
                            </NavLink>
                        </div>
                    )}

                    {!isLoading && blogs.length > 0 && (
                        <div className="bg-white shadow-xl overflow-hidden sm:rounded-lg border border-gray-200">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                                Created At
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {blogs.map((blog, index) => (
                                            <tr
                                                key={blog._id}
                                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors duration-150 cursor-pointer`}
                                                onClick={() => handleRowClick(blog.slug)}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{blog.title || 'No Title'}</div>
                                                    <div className="text-xs text-gray-500">{blog.author || 'Unknown Author'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${blog.isPublished ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                                                        {blog.isPublished ? 'Published' : 'Draft'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                    {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center space-x-3">
                                                        <button
                                                            onClick={(e) => handleTogglePublish(blog._id, blog.isPublished, e)}
                                                            title={blog.isPublished ? 'Unpublish' : 'Publish'}
                                                            className={`p-1.5 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${blog.isPublished ? 'text-green-600 hover:bg-green-100 focus:ring-green-500' : 'text-yellow-600 hover:bg-yellow-100 focus:ring-yellow-500'}`}
                                                        >
                                                            {blog.isPublished ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </button>
                                                        <NavLink
                                                            to={`/blog/${blog.slug}`}
                                                            title="View Post"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-100 p-1.5 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
                                                        >
                                                            <ExternalLink size={18} />
                                                        </NavLink>

                                                        <button
                                                            onClick={(e) => openDeleteModal(blog._id, blog.title, e)}
                                                            title="Delete"
                                                            className="text-red-600 hover:text-red-900 hover:bg-red-100 p-1.5 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {showDeleteModal && blogToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="bg-white rounded-lg shadow-xl transform transition-all sm:max-w-lg sm:w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <ShieldAlert className="h-6 w-6 text-red-600" aria-hidden="true" />
                                </div>
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                    <h3 className="text-lg leading-6 font-semibold text-gray-900" id="modal-title">
                                        Delete Blog Post
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600">
                                            Are you sure you want to permanently delete the post titled: <strong className="font-medium">"{blogToDelete.title || 'this post'}"</strong>? This action cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-150"
                                    onClick={confirmDeleteBlog}
                                >
                                    Delete Permanently
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-150"
                                    onClick={closeDeleteModal}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default AdminBlogManagementPage;