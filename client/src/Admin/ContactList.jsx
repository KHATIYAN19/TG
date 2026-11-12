import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import BASE_URL from "../utils/Url.js";
import {
  Search, Trash2, Eye, EyeOff, Mail, Phone, Clock, ChevronRight, Loader2,
  AlertTriangle, X, Inbox, MailOpen, Reply, CalendarDays, RefreshCw, MessageSquareText,
} from 'lucide-react';
import { useSelector } from 'react-redux';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
  { key: 'replied', label: 'Replied' },
  { key: 'pending', label: 'Needs reply' },
];

const AVATAR_COLORS = [
  'from-indigo-500 to-violet-500', 'from-sky-500 to-cyan-500', 'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500', 'from-rose-500 to-pink-500', 'from-fuchsia-500 to-purple-500',
];

const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

const colorFor = (name = '') =>
  AVATAR_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

const timeAgo = (value) => {
  const diff = Date.now() - new Date(value).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={22} />
            </div>
            <div className="flex-1">
              <h2 id="confirmation-modal-title" className="text-lg font-semibold text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-600">{message}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={20} /></button>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, tone }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tone}`}><Icon size={20} /></div>
    <div>
      <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
      <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
    </div>
  </div>
);

const sortMessages = (list) =>
  [...list].sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

const ContactList = () => {
  const token = useSelector((state) => state.auth.token);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [service, setService] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/messages/`, auth);
      setMessages(sortMessages(response.data.messages || []));
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch messages. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    fetchMessages();
    window.scrollTo(0, 0);
  }, [fetchMessages]);

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
      await axios.delete(`${BASE_URL}/messages/${messageToDelete}`, auth);
      setMessages((prev) => prev.filter((m) => m._id !== messageToDelete));
      toast.success('Message deleted.', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete message.', { id: toastId });
    } finally {
      closeDeleteModal();
    }
  };

  const handleToggleRead = async (id, event) => {
    event.stopPropagation();
    try {
      const response = await axios.patch(`${BASE_URL}/messages/${id}/read`, null, auth);
      setMessages((prev) =>
        sortMessages(prev.map((m) => (m._id === id ? { ...m, isRead: response.data.contact.isRead } : m)))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const services = useMemo(() => [...new Set(messages.map((m) => m.service).filter(Boolean))], [messages]);

  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    return {
      total: messages.length,
      unread: messages.filter((m) => !m.isRead).length,
      replied: messages.filter((m) => m.replies?.length > 0).length,
      week: messages.filter((m) => new Date(m.createdAt).getTime() > weekAgo).length,
    };
  }, [messages]);

  const filteredMessages = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return messages.filter((m) => {
      if (filter === 'unread' && m.isRead) return false;
      if (filter === 'read' && !m.isRead) return false;
      if (filter === 'replied' && !(m.replies?.length > 0)) return false;
      if (filter === 'pending' && m.replies?.length > 0) return false;
      if (service !== 'all' && m.service !== service) return false;
      if (!q) return true;
      return (
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.contactNumber?.includes(searchTerm.trim()) ||
        m.message?.toLowerCase().includes(q)
      );
    });
  }, [messages, searchTerm, filter, service]);

  const countFor = (key) => {
    if (key === 'all') return messages.length;
    if (key === 'unread') return stats.unread;
    if (key === 'read') return messages.length - stats.unread;
    if (key === 'replied') return stats.replied;
    return messages.length - stats.replied;
  };

  return (
    <>
      <Helmet><title>Contact Queries | Admin</title></Helmet>
      <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 md:px-8">
        <Toaster position="top-center" />
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Contact Queries</h1>
              <p className="text-sm text-slate-500 mt-1">Messages sent through the website contact form. Open one to reply by email.</p>
            </div>
            <button
              onClick={fetchMessages}
              disabled={loading}
              className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2 text-sm font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard icon={Inbox} label="Total queries" value={stats.total} tone="bg-indigo-100 text-indigo-600" />
            <StatCard icon={MailOpen} label="Unread" value={stats.unread} tone="bg-amber-100 text-amber-600" />
            <StatCard icon={Reply} label="Replied" value={stats.replied} tone="bg-emerald-100 text-emerald-600" />
            <StatCard icon={CalendarDays} label="Last 7 days" value={stats.week} tone="bg-sky-100 text-sky-600" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search name, email, phone or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All services</option>
                {services.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-full transition ${
                    filter === f.key ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                  <span className={`ml-1.5 text-xs ${filter === f.key ? 'text-indigo-100' : 'text-slate-400'}`}>{countFor(f.key)}</span>
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-16 text-slate-500">
              <Loader2 className="animate-spin h-7 w-7 text-indigo-600 mr-3" /> Loading messages...
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center" role="alert">
              <AlertTriangle className="mr-2" size={20} /> {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-3">
              {filteredMessages.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 text-center">
                  <Inbox className="mx-auto text-slate-300" size={40} />
                  <p className="mt-3 text-slate-500 text-sm">No messages match your filters.</p>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const replied = msg.replies?.length > 0;
                  return (
                    <div
                      key={msg._id}
                      onClick={() => navigate(`/contact-details/${msg._id}`)}
                      className={`group bg-white rounded-2xl border p-4 sm:p-5 cursor-pointer transition hover:shadow-md hover:border-indigo-200 ${
                        msg.isRead ? 'border-slate-200' : 'border-indigo-200 ring-1 ring-indigo-100'
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className={`shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${colorFor(msg.name)} text-white font-semibold flex items-center justify-center`}>
                          {initials(msg.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            {!msg.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                            <h2 className={`text-base truncate ${msg.isRead ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}`}>{msg.name}</h2>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">{msg.service}</span>
                            {replied ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium inline-flex items-center gap-1"><Reply size={11} /> Replied{msg.replies.length > 1 ? ` ×${msg.replies.length}` : ''}</span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">Needs reply</span>
                            )}
                            <span className="ml-auto text-xs text-slate-400 whitespace-nowrap">{timeAgo(msg.createdAt)}</span>
                          </div>

                          {msg.message && (
                            <p className="mt-1.5 text-sm text-slate-600 line-clamp-2 flex gap-1.5">
                              <MessageSquareText size={15} className="shrink-0 mt-0.5 text-slate-400" />
                              <span>{msg.message}</span>
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1"><Mail size={13} /> {msg.email}</span>
                              <span className="inline-flex items-center gap-1"><Phone size={13} /> {msg.contactNumber}</span>
                              <span className="hidden sm:inline-flex items-center gap-1"><Clock size={13} /> {new Date(msg.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => handleToggleRead(msg._id, e)}
                                title={msg.isRead ? 'Mark as unread' : 'Mark as read'}
                                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              >
                                {msg.isRead ? <EyeOff size={17} /> : <Eye size={17} />}
                              </button>
                              <button
                                onClick={(e) => openDeleteModal(msg._id, e)}
                                title="Delete"
                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={17} />
                              </button>
                              <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <p className="text-xs text-slate-400 text-center pt-2">Showing {filteredMessages.length} of {messages.length}</p>
            </div>
          )}

          <ConfirmationModal
            isOpen={isModalOpen}
            onClose={closeDeleteModal}
            onConfirm={confirmDelete}
            title="Delete this query?"
            message="This permanently removes the message and its reply history. This cannot be undone."
          />
        </div>
      </div>
    </>
  );
};

export default ContactList;
