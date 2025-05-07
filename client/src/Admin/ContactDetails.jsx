// src/components/ContactDetail.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import BASE_URL from "../utils/Url.js";
import { ArrowLeft, Trash2, Eye, EyeOff, Mail, Phone, Briefcase, Clock, MessageSquare, User, Send, Loader2, AlertTriangle, Calendar, AlertTriangle as ModalAlertIcon, X } from 'lucide-react'; // Renamed AlertTriangle for modal clarity
import { useSelector } from 'react-redux'

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

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReplying, setIsReplying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token,setToken]=useState(useSelector((state)=>state.auth.token));
  
  const fetchMessage = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/messages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage(response.data);
    } catch (err) {
      console.error("Error fetching message details:", err);
      setError(err.response?.data?.message || 'Failed to fetch message details.');
      toast.error(err.response?.data?.message || 'Failed to load message.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMessage();
  }, [id]);
  const openDeleteModal = () => {
    setIsModalOpen(true);
  };
  const closeDeleteModal = () => {
    setIsModalOpen(false);
  };
  const confirmDelete = async () => {
    const toastId = toast.loading('Deleting message...');
    try {
      await axios.delete(`${BASE_URL}/messages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Message deleted successfully.', { id: toastId });
      closeDeleteModal(); 
      navigate('/contact-query'); 
    } catch (err) {
      console.error("Error deleting message:", err);
      toast.error(err.response?.data?.message || 'Failed to delete message.', { id: toastId });
      closeDeleteModal();
    }
  };

  const handleToggleRead = async () => {
    const toastId = toast.loading('Updating status...');
    try {
      const response = await axios.patch(`${BASE_URL}/messages/${id}/read`, null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMessage(prevMessage => ({ ...prevMessage, isRead: response.data.contact.isRead }));
      toast.success(response.data.message || 'Status updated.', { id: toastId });
    } catch (err) {
      console.error("Error toggling read status:", err);
      toast.error(err.response?.data?.message || 'Failed to update status.', { id: toastId });
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Reply text cannot be empty.');
      return;
    }
    setIsReplying(true);
    const toastId = toast.loading('Sending reply...');
    try {
      const response = await axios.post(
        `${BASE_URL}/messages/${id}/reply`,
        { replyText },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessage(response.data.contact);
      setReplyText('');
      toast.success('Reply sent successfully.', { id: toastId });
    } catch (err) {
      console.error("Error sending reply:", err);
      toast.error(err.response?.data?.message || 'Failed to send reply.', { id: toastId });
    } finally {
      setIsReplying(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second:'2-digit', hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <Toaster position="top-center" reverseOrder={false} />
        <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <ArrowLeft size={16} className="mr-1" /> Back
        </button>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center" role="alert">
            <AlertTriangle className="mr-2" size={20}/>
            <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
        <div className="p-8 bg-gray-50 min-h-screen text-center text-gray-500">
            <Toaster position="top-center" reverseOrder={false} />
            Message not found.
             <button onClick={() => navigate(-1)} className="mt-4 inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <ArrowLeft size={16} className="mr-1" /> Back
            </button>
        </div>
    );
  }


  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen mt-12">
      <Toaster position="top-center" reverseOrder={false} />

       <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <button onClick={() => navigate(-1)} className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <ArrowLeft size={16} className="mr-2" /> Back to List
            </button>
            <div className="flex items-center space-x-3">
                 <span className={`text-sm font-medium px-3 py-1 rounded-full ${message.isRead ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                    {message.isRead ? 'Read' : 'Unread'}
                 </span>
                <button
                    onClick={handleToggleRead}
                    title={message.isRead ? 'Mark as Unread' : 'Mark as Read'}
                    className="p-2 hover:bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400"
                >
                    {message.isRead ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {/* Updated delete button to open the modal */}
                <button
                    onClick={openDeleteModal}
                    title="Delete Message"
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-400"
                >
                    <Trash2 size={20} />
                </button>
            </div>
       </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">{message.subject}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-700 mb-4">
            <p className="flex items-center"><User size={16} className="mr-2 text-blue-600"/><strong>From:</strong><span className="ml-2">{message.name}</span></p>
            <p className="flex items-center"><Mail size={16} className="mr-2 text-blue-600"/><strong>Email:</strong><span className="ml-2">{message.email}</span></p>
            <p className="flex items-center"><Phone size={16} className="mr-2 text-blue-600"/><strong>Phone:</strong><span className="ml-2">{message.contactNumber}</span></p>
            <p className="flex items-center"><Briefcase size={16} className="mr-2 text-blue-600"/><strong>Service:</strong><span className="ml-2">{message.service}</span></p>
            <p className="flex items-center col-span-1 md:col-span-2"><Clock size={16} className="mr-2 text-blue-600"/><strong>Received:</strong><span className="ml-2">{formatDate(message.createdAt)}</span></p>
        </div>
        <div className="mt-4 pt-4 border-t">
            <h3 className="text-md font-semibold mb-2 text-gray-800 flex items-center"><MessageSquare size={16} className="mr-2 text-blue-600"/> Message Content:</h3>
            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">{message.message}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Replies ({message.replies?.length || 0})</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {message.replies && message.replies.length > 0 ? (
            message.replies.sort((a, b) => new Date(a.replyDate) - new Date(b.replyDate)).map((reply, index) => (
              <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-gray-800 whitespace-pre-wrap mb-1">{reply.replyText}</p>
                <p className="text-xs text-blue-600 text-right flex items-center justify-end">
                    <Calendar size={12} className="mr-1"/> {formatDate(reply.replyDate)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm italic">No replies yet.</p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Send Reply</h2>
        <form onSubmit={handleReplySubmit}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply here..."
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            disabled={isReplying}
          />
          <button
            type="submit"
            disabled={isReplying || !replyText.trim()}
            className="w-full sm:w-auto flex justify-center items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
          >
            {isReplying ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-3" /> Sending...
              </>
            ) : (
              <>
                <Send size={18} className="mr-2" /> Send Reply
              </>
            )}
          </button>
        </form>
      </div>

      {/* Render the Inline Confirmation Modal */}
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

export default ContactDetail;
