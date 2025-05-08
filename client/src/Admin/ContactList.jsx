// src/components/ContactList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import BASE_URL from "../utils/Url.js";
import { Search, Trash2, Eye, EyeOff, Mail, Phone, Briefcase, Clock, ChevronRight, Loader2, AlertTriangle, AlertTriangle as ModalAlertIcon, X } from 'lucide-react'; // Renamed AlertTriangle for modal clarity
import { useSelector } from 'react-redux';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 id="confirmation-modal-title" className="text-lg font-semibold text-gray-800 flex items-center">
            <ModalAlertIcon className="text-red-500 mr-2" size={20} />
            {title || 'Confirm Action'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 text-sm text-gray-700">
          {message || 'Are you sure you want to proceed? This action cannot be undone.'}
        </div>
        <div className="flex justify-end items-center p-4 bg-gray-50 border-t border-gray-200 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition duration-150 ease-in-out"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};


const ContactList = () => {
  const [token,setToken]=useSelector((state)=>state.auth.token);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/messages/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
       response.data.messages.sort((a, b) => {
          if (a.isRead !== b.isRead) {
              return a.isRead ? 1 : -1;
          }
          return new Date(a.createdAt) - new Date(b.createdAt);
      });
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err.response?.data?.message || 'Failed to fetch messages. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to fetch messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const openDeleteModal = (id, event) => {
    event.stopPropagation();
    setMessageToDelete(id);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setMessageToDelete(null);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;

    const toastId = toast.loading('Deleting message...');
    try {
      await axios.delete(`${BASE_URL}/messages/${messageToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageToDelete));
      toast.success('Message deleted successfully.', { id: toastId });
    } catch (err) {
      console.error("Error deleting message:", err);
      toast.error(err.response?.data?.message || 'Failed to delete message.', { id: toastId });
    } finally {
      closeDeleteModal();
    }
  };

  const handleToggleRead = async (id, event) => {
     event.stopPropagation();
    const toastId = toast.loading('Updating status...');
    try {
      const response = await axios.patch(`${BASE_URL}/messages/${id}/read`, null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === id ? { ...msg, isRead: response.data.contact.isRead } : msg
        ).sort((a, b) => {
            if (a.isRead !== b.isRead) {
                return a.isRead ? 1 : -1;
            }
            return new Date(a.createdAt) - new Date(b.createdAt);
        })
      );
      toast.success(response.data.message || 'Status updated.', { id: toastId });
    } catch (err) {
      console.error("Error toggling read status:", err);
      toast.error(err.response?.data?.message || 'Failed to update status.', { id: toastId });
    }
  };

  const filteredMessages = useMemo(() => {
    if (!searchTerm) {
      return messages;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return messages.filter(msg =>
      msg.name.toLowerCase().includes(lowerSearchTerm) ||
      msg.email.toLowerCase().includes(lowerSearchTerm) ||
      msg.contactNumber.includes(searchTerm)
    );
  }, [messages, searchTerm]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  const handleRowClick = (id) => {
      navigate(`/contact-details/${id}`);
  };


  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen mt-12">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Contact Messages</h1>

      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Loading messages...</span>
        </div>
      )}
      {error && !loading && (
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center" role="alert">
            <AlertTriangle className="mr-2" size={20}/>
            <span className="block sm:inline">{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {filteredMessages.length === 0 ? (
             <p className="text-center text-gray-500 py-10">No messages found.</p>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg._id}
                onClick={() => handleRowClick(msg._id)}
                className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${msg.isRead ? 'border-gray-300' : 'border-blue-500'} hover:shadow-lg transition-shadow duration-200 cursor-pointer`}
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-2">
                  <div className="flex items-center mb-2 md:mb-0">
                     {!msg.isRead && <span className="mr-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>}
                     <h2 className={`text-lg font-semibold ${msg.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{msg.name}</h2>
                     <span className={`ml-3 text-xs font-medium px-2 py-0.5 rounded-full ${msg.isRead ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>
                        {msg.isRead ? 'Read' : 'Unread'}
                     </span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-500">
                    <button
                      onClick={(e) => handleToggleRead(msg._id, e)}
                      title={msg.isRead ? 'Mark as Unread' : 'Mark as Read'}
                      className="p-1 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-400"
                    >
                      {msg.isRead ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                      onClick={(e) => openDeleteModal(msg._id, e)}
                      title="Delete Message"
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full focus:outline-none focus:ring-1 focus:ring-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                     <ChevronRight size={20} className="hidden md:inline-block text-gray-400"/>
                  </div>
                </div>

              

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                   <span className="flex items-center"><Mail size={14} className="mr-1"/> {msg?.email}</span>
                   <span className="flex items-center"><Phone size={14} className="mr-1"/> {msg?.contactNumber}</span>
                   <span className="flex items-center"><Briefcase size={14} className="mr-1"/> {msg?.service}</span>
                   <span className="flex items-center"><Clock size={14} className="mr-1"/> {formatDate(msg?.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to delete this contact message? This action cannot be undone."
      />
    </div>
  );
};

export default ContactList;
