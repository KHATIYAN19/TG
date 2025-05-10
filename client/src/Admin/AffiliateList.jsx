import React, { useState, useEffect, useCallback } from 'react';
import { Phone, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet'; // Changed to react-helmet-async
import { useSelector } from 'react-redux';
import axios from 'axios';
import BASE_URL from '../utils/Url';

const AffiliateList = () => {
    const [affiliates, setAffiliates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const token = useSelector((state) => state.auth.token);
    const [deletingId, setDeletingId] = useState(null);

    const fetchAffiliates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BASE_URL}/affiliate`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data && response.data.success) {
                setAffiliates(response.data.data || []);
            } else {
                setAffiliates([]);
                toast.error("Failed to fetch affiliates: Unexpected response structure.");
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch affiliates';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to top on component mount
        fetchAffiliates();

        return () => {
            toast.remove();
        };
    }, [fetchAffiliates]);

    const handleDelete = useCallback(async (id, name) => {
        if (!deleteConfirmation || deleteConfirmation.id !== id) return;

        setDeletingId(id);
        toast.promise(
            axios.delete(`${BASE_URL}/affiliate/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }),
            {
                loading: `Deleting ${name}...`,
                success: () => {
                    setAffiliates(affiliates.filter((affiliate) => affiliate._id !== id));
                    setDeleteConfirmation(null);
                    setDeletingId(null);
                    return 'Affiliate deleted successfully';
                },
                error: (err) => {
                    const errorMessage = err.response?.data?.message || 'Failed to delete affiliate';
                    setError(errorMessage);
                    setDeletingId(null);
                    return errorMessage;
                },
            },
            {
                success: { duration: 3000 },
                error: { duration: 5000 },
            }
        );
    }, [token, affiliates, deleteConfirmation, BASE_URL]);

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const showDeleteConfirmation = (id, name) => {
        setDeleteConfirmation({ id, name });
    };

    const hideDeleteConfirmation = () => {
        setDeleteConfirmation(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                <span className="ml-3 text-blue-500 text-lg">Loading Affiliates...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen text-red-500">
                Error: {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 mt-20">
            <Helmet>
                <title>Affiliate List | Target Trek</title>
                <meta name="description" content="List of affiliates registered with Target Trek." />
                <meta name="keywords" content="affiliates, partners, marketing, sales" />
            </Helmet>
            <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text">
                Affiliate List
            </h1>

            <div className="rounded-md border overflow-x-auto shadow-sm">
                <table className="min-w-full table-auto">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-gray-700">Name</th>
                            <th className="px-6 py-3 text-left text-gray-700">Email</th>
                            <th className="px-6 py-3 text-left text-gray-700">Phone</th>
                            <th className="px-6 py-3 text-left text-gray-700">Company</th>
                            <th className="px-6 py-3 text-left text-gray-700">Service</th>
                            <th className="px-6 py-3 text-left text-gray-700">Created At</th>
                            <th className="px-6 py-3 text-right text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {affiliates && affiliates.length > 0 ? (
                                affiliates.map((affiliate) => (
                                    <motion.tr
                                        key={affiliate._id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-3" style={{ width: '200px' }}>{affiliate.name}</td>
                                        <td className="px-6 py-3" style={{ width: '250px' }}>{affiliate.email}</td>
                                        <td className="px-6 py-3">
                                            <a
                                                href={`tel:${affiliate.phone}`}
                                                className="text-blue-500 hover:underline flex items-center"
                                                aria-label={`Call ${affiliate.name}`}
                                            >
                                                <Phone className="w-4 h-4 mr-1" />
                                                {affiliate.phone}
                                            </a>
                                        </td>
                                        <td className="px-6 py-3" style={{ width: '250px' }}>{affiliate.companyName}</td>
                                        <td className="px-6 py-3">{affiliate.service}</td>
                                        <td className="px-6 py-3">{formatDateTime(affiliate.createdAt)}</td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end">
                                                <button
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                    onClick={() => showDeleteConfirmation(affiliate._id, affiliate.name)}
                                                    disabled={deletingId === affiliate._id}
                                                    aria-label={`Delete ${affiliate.name}`}
                                                >
                                                    {deletingId === affiliate._id ? (
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                                        {loading ? 'Loading affiliates...' : 'No affiliates found.'}
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {deleteConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirm Deletion</h2>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete <span className="font-semibold">{deleteConfirmation.name}</span>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="destructive"
                                onClick={() => handleDelete(deleteConfirmation.id, deleteConfirmation.name)}
                                disabled={deletingId === deleteConfirmation.id}
                            >
                                {deletingId === deleteConfirmation.id ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete'
                                )}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={hideDeleteConfirmation}
                                disabled={deletingId}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

function Button(props) {
    const { variant = 'default', size = 'default', className, children, ...rest } = props;

    let baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors duration-200';

    switch (variant) {
        case 'default':
            baseClasses += ' bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500';
            break;
        case 'secondary':
            baseClasses += ' bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-gray-200';
            break;
        case 'destructive':
            baseClasses += ' bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-500';
            break;
        case 'outline':
            baseClasses += ' border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-300';
            break;
        case 'ghost':
            baseClasses = 'text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-transparent';
            break;
        default:
            baseClasses += ' bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500';
    }

    switch (size) {
        case 'sm':
            baseClasses += ' px-3 py-1.5 text-sm';
            break;
        case 'lg':
            baseClasses += ' px-6 py-3 text-lg';
            break;
        case 'icon':
            baseClasses = 'p-2 rounded-full';
            break;
        default:
            baseClasses += ' px-4 py-2';
    }

    const combinedClasses = `${baseClasses} ${className || ''}`;

    return (
        <button className={combinedClasses} {...rest}>
            {children}
        </button>
    );
}

export default AffiliateList;

