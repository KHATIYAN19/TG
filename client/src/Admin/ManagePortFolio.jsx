import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate ,NavLink} from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Trash2, Eye, EyeOff, CalendarDays, Loader2, AlertTriangle, ExternalLink, SearchX, PlusCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import BASE_URL from '../utils/Url';

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
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};

function ManagePortfolio() {
  const navigate = useNavigate();
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const[token,setToken]=useState(useSelector((state)=>state.auth.token));
  const fetchPortfolioItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/portfolio`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data && response.data.success) {
        setPortfolioItems(response.data.data || []);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch portfolio items');
      }
    } catch (err) {
      console.error("Failed to fetch portfolio items:", err);
      const message = err.response?.data?.message || err.message || 'Failed to load portfolio. Please try again later.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioItems();
  }, []);

  const handleDeleteClick = (e, item) => {
    e.stopPropagation();
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete?._id) return;
    const idToDelete = itemToDelete._id;
    const toastId = toast.loading('Deleting item...');
    setItemToDelete(null);

    try {
      const response = await axios.delete(`${BASE_URL}/portfolio/${idToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
       if (response.data && response.data.success) {
            toast.success('Portfolio item deleted successfully!', { id: toastId });
            setPortfolioItems(prevItems => prevItems.filter(item => item._id !== idToDelete));
       } else {
            throw new Error(response.data?.message || 'Failed to delete item.');
       }
    } catch (err) {
      console.error("Failed to delete portfolio item:", err);
      const message = err.response?.data?.message || err.message || 'Failed to delete item.';
      toast.error(message, { id: toastId });
    }
  };

  const handleTogglePublish = async (e, id, currentStatus) => {
    e.stopPropagation();
    const actionVerb = currentStatus ? 'Unpublishing' : 'Publishing';
    const toastId = toast.loading(`${actionVerb} item...`);

    setPortfolioItems(prevItems =>
        prevItems.map(item =>
            item._id === id ? { ...item, isPublished: !item.isPublished } : item
        )
    );

    try {
      const response = await axios.patch(
        `${BASE_URL}/portfolio/${id}/toggle`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
       if (response.data && response.data.success) {
            toast.success(`Item ${currentStatus ? 'unpublished' : 'published'} successfully!`, { id: toastId });
            setPortfolioItems(prevItems =>
                prevItems.map(item =>
                    item._id === id ? response.data.data : item
                )
            );
       } else {
            setPortfolioItems(prevItems =>
                prevItems.map(item =>
                    item._id === id ? { ...item, isPublished: currentStatus } : item
                )
            );
            throw new Error(response.data?.message || `Failed to ${actionVerb.toLowerCase()} item.`);
       }
    } catch (err) {
       setPortfolioItems(prevItems =>
            prevItems.map(item =>
                item._id === id ? { ...item, isPublished: currentStatus } : item
            )
        );
      console.error("Failed to toggle publish status:", err);
      const message = err.response?.data?.message || err.message || `Failed to ${actionVerb.toLowerCase()} item.`;
      toast.error(message, { id: toastId });
    }
  };

   const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch (e) { return 'Invalid Date'; }
  };

  const handleNavigate = (slug) => {
    navigate(`/portfolio/${slug}`);
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete the portfolio item "${itemToDelete?.title}"? This action cannot be undone.`}
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12 px-4 sm:px-6 lg:px-8 font-sans pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="sm:flex sm:items-center sm:justify-between mb-8">
             <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-0">
               Manage Portfolio
             </h1>
             <NavLink
                to="admin/add-portfolio"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out shadow-sm hover:shadow-md"
             >
                <PlusCircle size={18} className="mr-2" />
                Add New Item
             </NavLink>
          </div>


          {isLoading && (
            <div className="text-center py-20">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
            </div>
          )}

          {error && (
            <div className="text-center py-10 px-6 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg max-w-lg mx-auto shadow-md">
               <div className="flex items-center justify-center mb-3">
                 <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
                 <p className="text-xl font-semibold">Loading Failed</p>
               </div>
              <p>{error}</p>
            </div>
          )}

          {!isLoading && !error && portfolioItems.length === 0 && (
            <div className="text-center py-20 px-4 bg-white rounded-lg shadow border border-gray-100">
                <SearchX className="h-16 w-16 text-gray-300 mx-auto mb-4"/>
                <h2 className="text-2xl font-semibold text-gray-600 mb-2">No Portfolio Items Found</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  You haven't added any portfolio items yet. Click the button above to add your first project!
                </p>
            </div>
          )}

          {!isLoading && !error && portfolioItems.length > 0 && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200/70">
              <ul role="list" className="divide-y divide-gray-200">
                {portfolioItems.map((item) => (
                  <li key={item._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50/50 transition duration-150 ease-in-out">
                    {/* Main clickable area */}
                    <div className="flex items-center space-x-4" >
                      {/* Clickable content */}
                      <div
                        className="flex-1 min-w-0 flex items-center space-x-4 cursor-pointer"
                        onClick={() => handleNavigate(item.slug)}
                      >
                          <div className="flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16 rounded-md overflow-hidden bg-gray-100">
                            <img
                              className="h-full w-full object-cover"
                              src={item.imageUrl || `https://placehold.co/100x100/EBF4FF/4299E1?text=No+Img`}
                              alt={item.altText || item.title}
                              onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src=`https://placehold.co/100x100/EBF4FF/4299E1?text=Error`;
                                  e.target.alt = 'Image error';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-blue-600 truncate group-hover:underline">{item.title}</p>
                            <p className="text-xs text-gray-500 truncate">{item.category}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              Created: {formatDate(item.createdAt)}
                            </p>
                          </div>
                      </div>

                      {/* Action buttons area (not part of the main clickable div) */}
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                         <span
                           title={`Status: ${item.isPublished ? 'Published' : 'Draft'}`}
                           className={`px-2 py-0.5 text-xs font-medium rounded-full ${item.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                         >
                           {item.isPublished ? 'Published' : 'Draft'}
                         </span>
                         <button
                            onClick={(e) => handleTogglePublish(e, item._id, item.isPublished)}
                            title={item.isPublished ? 'Unpublish' : 'Publish'}
                            className={`p-1.5 rounded-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 ${item.isPublished ? 'text-yellow-600 hover:bg-yellow-100 focus:ring-yellow-500' : 'text-green-600 hover:bg-green-100 focus:ring-green-500'}`}
                         >
                            {item.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                         </button>
                         {/* Removed the separate ExternalLink as the item is now clickable */}
                         <button
                            onClick={(e) => handleDeleteClick(e, item)}
                            title="Delete"
                            className="p-1.5 rounded-md text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 transition duration-150 ease-in-out"
                         >
                            <Trash2 size={16} />
                         </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ManagePortfolio;
