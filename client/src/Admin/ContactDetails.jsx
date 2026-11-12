import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Helmet } from 'react-helmet';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import BASE_URL from "../utils/Url.js";
import {
  ArrowLeft, Trash2, Eye, EyeOff, Mail, Phone, Briefcase, Clock, MessageSquare, Send, Loader2,
  AlertTriangle, X, Sparkles, Bot, User as UserIcon, CheckCircle2, ChevronDown, Reply, Monitor, Smartphone,
  PencilLine, ShieldCheck,
} from 'lucide-react';
import { useSelector } from 'react-redux';

const REPLY_TO = 'supporttargettrek@gmail.com';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'link'],
    ['clean'],
  ],
};
const QUILL_FORMATS = ['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'blockquote', 'link'];

const SUGGESTIONS = [
  'Write a friendly reply thanking them and offering a call this week',
  'Politely ask for more details about their requirements and budget',
  'Briefly explain how we can help with their service and suggest next steps',
];

const stripHtml = (html = '') => html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();

const fmt = (d, long = false) =>
  new Date(d).toLocaleString('en-US', long
    ? { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }
    : { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });

const ModalShell = ({ onClose, children, wide }) => (
  <div
    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-3 sm:p-4"
    onClick={onClose}
    role="dialog"
    aria-modal="true"
  >
    <div
      className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-md'} max-h-[92vh] flex flex-col overflow-hidden`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

const DeleteModal = ({ onClose, onConfirm }) => (
  <ModalShell onClose={onClose}>
    <div className="p-6 flex items-start gap-4">
      <div className="shrink-0 w-11 h-11 rounded-full bg-red-100 flex items-center justify-center"><AlertTriangle className="text-red-600" size={22} /></div>
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-slate-900">Delete this query?</h2>
        <p className="mt-1 text-sm text-slate-600">This permanently removes the message and its reply history. This cannot be undone.</p>
      </div>
    </div>
    <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
      <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100">Cancel</button>
      <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
    </div>
  </ModalShell>
);

/* Sandboxed iframe: shows the email exactly as rendered by the server. */
const EmailFrame = ({ html, mobile, loading, height = 520 }) => (
  <div className="relative rounded-xl border border-slate-200 bg-slate-100 p-2 sm:p-3 overflow-auto" style={{ height }}>
    {loading && (
      <div className="absolute top-3 right-4 z-10 text-xs text-slate-500 inline-flex items-center gap-1 bg-white/90 rounded-full px-2 py-1 shadow">
        <Loader2 size={12} className="animate-spin" /> Updating
      </div>
    )}
    <iframe
      title="Email preview"
      sandbox=""
      srcDoc={html || ''}
      className="mx-auto bg-white rounded-lg shadow-sm transition-all"
      style={{ width: mobile ? 380 : '100%', maxWidth: '100%', height: '100%', border: 0 }}
    />
  </div>
);

const ContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // composer
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [tab, setTab] = useState('edit'); // edit | preview
  const [mobile, setMobile] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  // AI agent
  const [chat, setChat] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const chatEnd = useRef(null);

  // history
  const [openReply, setOpenReply] = useState(null);

  const hasBody = stripHtml(bodyHtml).length > 0;
  const canSend = subject.trim().length > 0 && hasBody && !sending;

  const fetchMessage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/messages/${id}`, auth);
      setMessage(response.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch message details.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [id, auth]);

  useEffect(() => { fetchMessage(); window.scrollTo(0, 0); }, [fetchMessage]);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [chat, aiLoading]);

  /* ---------- preview (rendered by the server so it matches the real email) ---------- */
  const needPreview = tab === 'preview' || confirmOpen;
  useEffect(() => {
    if (!needPreview || !message) return undefined;
    let cancelled = false;
    setPreviewLoading(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await axios.post(`${BASE_URL}/messages/${id}/reply/preview`, { subject, bodyHtml }, auth);
        if (!cancelled) setPreviewHtml(data.html);
      } catch (err) {
        if (!cancelled) toast.error(err.response?.data?.message || 'Could not build preview.');
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [needPreview, subject, bodyHtml, id, auth, message]);

  /* ---------- actions ---------- */
  const handleToggleRead = async () => {
    try {
      const response = await axios.patch(`${BASE_URL}/messages/${id}/read`, null, auth);
      setMessage((m) => ({ ...m, isRead: response.data.contact.isRead }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const confirmDelete = async () => {
    const toastId = toast.loading('Deleting message...');
    try {
      await axios.delete(`${BASE_URL}/messages/${id}`, auth);
      toast.success('Message deleted.', { id: toastId });
      navigate('/contact-query');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete message.', { id: toastId });
      setDeleteOpen(false);
    }
  };

  const askAssistant = async (text) => {
    const instruction = (text ?? prompt).trim();
    if (!instruction || aiLoading) return;
    const history = chat.map(({ role, content }) => ({ role, content }));
    setChat((c) => [...c, { role: 'user', content: instruction }]);
    setPrompt('');
    setAiLoading(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/messages/${id}/reply/ai`,
        {
          prompt: instruction,
          history,
          currentDraft: hasBody || subject ? { subject, bodyHtml } : undefined,
        },
        auth
      );
      if (data.subject) setSubject(data.subject);
      if (data.bodyHtml) setBodyHtml(data.bodyHtml);
      setChat((c) => [...c, { role: 'assistant', content: data.assistantMessage || 'Draft updated.', filled: true }]);
      toast.success('Subject and body filled in');
    } catch (err) {
      const msg = err.response?.data?.message || 'Assistant failed. Try again.';
      setChat((c) => [...c, { role: 'assistant', content: msg, error: true }]);
    } finally {
      setAiLoading(false);
    }
  };

  const sendReply = async () => {
    setSending(true);
    const toastId = toast.loading('Sending email...');
    try {
      const { data } = await axios.post(`${BASE_URL}/messages/${id}/reply`, { subject, bodyHtml }, auth);
      setMessage(data.contact);
      setSubject('');
      setBodyHtml('');
      setChat([]);
      setTab('edit');
      setConfirmOpen(false);
      toast.success(`Reply sent to ${message.email}`, { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reply.', { id: toastId });
    } finally {
      setSending(false);
    }
  };

  /* ---------- states ---------- */
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-slate-50"><Loader2 className="animate-spin h-10 w-10 text-indigo-600" /></div>;
  }

  if (error || !message) {
    return (
      <div className="p-8 pt-24 bg-slate-50 min-h-screen">
        <Helmet><title>Contact Query | Admin</title></Helmet>
        <button onClick={() => navigate('/contact-query')} className="mb-4 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center" role="alert">
          <AlertTriangle className="mr-2" size={20} /> {error || 'Message not found.'}
        </div>
      </div>
    );
  }

  const replies = [...(message.replies || [])].sort((a, b) => new Date(b.replyDate) - new Date(a.replyDate));

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 md:px-8">
      <Helmet><title>{message.name} | Contact Query</title></Helmet>
      <Toaster position="top-center" />

      <div className="max-w-6xl mx-auto">
        {/* top bar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => navigate('/contact-query')} className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100">
            <ArrowLeft size={16} /> All queries
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${message.isRead ? 'bg-slate-200 text-slate-600' : 'bg-indigo-100 text-indigo-700'}`}>
              {message.isRead ? 'Read' : 'Unread'}
            </span>
            <button onClick={handleToggleRead} title={message.isRead ? 'Mark as unread' : 'Mark as read'} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800">
              {message.isRead ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
            <button onClick={() => setDeleteOpen(true)} title="Delete" className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 size={17} />
            </button>
          </div>
        </div>

        {/* query card */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="px-5 sm:px-6 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
            <p className="text-xs uppercase tracking-wider text-indigo-200">Customer query</p>
            <h1 className="text-2xl font-bold mt-1">{message.name}</h1>
            <p className="text-sm text-indigo-100 mt-1 inline-flex items-center gap-1.5"><Clock size={14} /> Received {fmt(message.createdAt, true)}</p>
          </div>
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Mail, label: 'Email', value: message.email, href: `mailto:${message.email}` },
              { icon: Phone, label: 'Phone', value: message.contactNumber, href: `tel:${message.contactNumber}` },
              { icon: Briefcase, label: 'Service', value: message.service },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><Icon size={17} /></div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{label}</p>
                  {href ? <a href={href} className="text-sm font-medium text-slate-900 hover:text-indigo-600 break-all">{value}</a> : <p className="text-sm font-medium text-slate-900">{value}</p>}
                </div>
              </div>
            ))}
            <div className="md:col-span-3">
              <p className="text-xs font-medium text-slate-500 mb-2 inline-flex items-center gap-1.5"><MessageSquare size={14} /> Message</p>
              <div className="whitespace-pre-wrap text-slate-800 text-[15px] leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-4">
                {message.message || <span className="italic text-slate-400">No message provided.</span>}
              </div>
            </div>
          </div>
        </section>

        {/* composer + agent */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          {/* composer */}
          <section className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900 inline-flex items-center gap-2"><Reply size={19} className="text-indigo-600" /> Compose reply</h2>
              <div className="inline-flex rounded-lg bg-slate-100 p-1 text-sm">
                {[
                  { k: 'edit', label: 'Write', icon: PencilLine },
                  { k: 'preview', label: 'Preview', icon: Eye },
                ].map(({ k, label, icon: Icon }) => (
                  <button key={k} onClick={() => setTab(k)} className={`px-3 py-1 rounded-md inline-flex items-center gap-1.5 font-medium ${tab === k ? 'bg-white shadow text-indigo-700' : 'text-slate-500 hover:text-slate-800'}`}>
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">To</label>
                  <div className="mt-1 px-3 py-2 text-sm rounded-lg bg-slate-100 text-slate-700 border border-slate-200 truncate">{message.email}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500">Reply-To</label>
                  <div className="mt-1 px-3 py-2 text-sm rounded-lg bg-slate-100 text-slate-700 border border-slate-200 truncate">{REPLY_TO}</div>
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="text-xs font-medium text-slate-500">Subject</label>
                <input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={200}
                  placeholder="e.g. Re: Your enquiry about PPC Advertising"
                  className="mt-1 w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {tab === 'edit' ? (
                <div>
                  <label className="text-xs font-medium text-slate-500">Body</label>
                  <div className="mt-1 contact-reply-editor">
                    <ReactQuill
                      theme="snow"
                      value={bodyHtml}
                      onChange={setBodyHtml}
                      modules={QUILL_MODULES}
                      formats={QUILL_FORMATS}
                      placeholder="Write your reply, or ask the AI assistant to draft it…"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Header, signature and footer are added automatically in the final email.</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-slate-500">Email preview</p>
                    <div className="inline-flex rounded-lg bg-slate-100 p-1">
                      <button onClick={() => setMobile(false)} className={`p-1.5 rounded-md ${!mobile ? 'bg-white shadow text-indigo-700' : 'text-slate-500'}`} title="Desktop"><Monitor size={15} /></button>
                      <button onClick={() => setMobile(true)} className={`p-1.5 rounded-md ${mobile ? 'bg-white shadow text-indigo-700' : 'text-slate-500'}`} title="Mobile"><Smartphone size={15} /></button>
                    </div>
                  </div>
                  <EmailFrame html={previewHtml} mobile={mobile} loading={previewLoading} />
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-400 inline-flex items-center gap-1.5"><ShieldCheck size={14} /> You&apos;ll confirm before anything is sent.</p>
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={!canSend}
                  className="inline-flex justify-center items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} /> Review &amp; send
                </button>
              </div>
            </div>
          </section>

          {/* AI agent */}
          <section className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden lg:max-h-[720px]">
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-indigo-50">
              <h2 className="text-lg font-semibold text-slate-900 inline-flex items-center gap-2"><Sparkles size={18} className="text-violet-600" /> AI reply assistant</h2>
              <p className="text-xs text-slate-500 mt-0.5">Knows this query. Tell it what to say and it fills the subject &amp; body.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[260px] bg-slate-50/50">
              {chat.length === 0 && (
                <div className="text-center py-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center"><Bot size={24} /></div>
                  <p className="text-sm text-slate-500 mt-3 mb-4">Try one of these:</p>
                  <div className="space-y-2">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => askAssistant(s)} disabled={aiLoading} className="w-full text-left text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50 text-slate-700">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chat.map((m, i) => (
                <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-violet-100 text-violet-600'}`}>
                    {m.role === 'user' ? <UserIcon size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`max-w-[85%] text-sm px-3 py-2 rounded-2xl whitespace-pre-wrap ${
                    m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : m.error ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                  }`}>
                    {m.content}
                    {m.filled && <span className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 size={12} /> Subject &amp; body updated</span>}
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div className="flex gap-2">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center"><Bot size={14} /></div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-slate-500 inline-flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Drafting…
                  </div>
                </div>
              )}
              <div ref={chatEnd} />
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); askAssistant(); }}
              className="p-3 border-t border-slate-100 bg-white"
            >
              <div className="flex gap-2 items-end">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAssistant(); } }}
                  rows={2}
                  maxLength={2000}
                  placeholder={hasBody ? 'Ask for changes, e.g. “make it shorter”' : 'Describe the reply you want…'}
                  className="flex-1 resize-none px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  disabled={aiLoading}
                />
                <button
                  type="submit"
                  disabled={aiLoading || !prompt.trim()}
                  className="shrink-0 h-10 w-10 rounded-xl bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 disabled:opacity-50"
                  aria-label="Send to assistant"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">Enter to send · Shift+Enter for a new line · AI can make mistakes, review before sending.</p>
            </form>
          </section>
        </div>

        {/* history */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Reply history <span className="text-slate-400 font-normal">({replies.length})</span></h2>
          {replies.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No replies sent yet.</p>
          ) : (
            <div className="space-y-3">
              {replies.map((r, i) => {
                const open = openReply === i;
                return (
                  <div key={r._id || i} className="border border-slate-200 rounded-xl overflow-hidden">
                    <button onClick={() => setOpenReply(open ? null : i)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><CheckCircle2 size={16} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{r.subject || 'Reply'}</p>
                        <p className="text-xs text-slate-500">{fmt(r.replyDate)}{r.sentBy ? ` · by ${r.sentBy}` : ''}</p>
                      </div>
                      <ChevronDown size={18} className={`text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && (
                      <div className="px-4 pb-4 border-t border-slate-100 bg-slate-50">
                        {r.sentTo && <p className="text-xs text-slate-500 pt-3">To: {r.sentTo}{r.replyTo ? ` · Reply-To: ${r.replyTo}` : ''}</p>}
                        <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{r.replyText}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* confirm send */}
      {confirmOpen && (
        <ModalShell onClose={() => !sending && setConfirmOpen(false)} wide>
          <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Send this email?</h2>
              <p className="text-sm text-slate-500">Check the preview carefully. Sent emails can&apos;t be recalled.</p>
            </div>
            <button onClick={() => setConfirmOpen(false)} disabled={sending} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={22} /></button>
          </div>

          <div className="overflow-y-auto p-6 space-y-4">
            <dl className="grid grid-cols-[88px_1fr] gap-y-2 text-sm bg-slate-50 border border-slate-100 rounded-xl p-4">
              <dt className="text-slate-500">To</dt><dd className="text-slate-900 font-medium break-all">{message.name} &lt;{message.email}&gt;</dd>
              <dt className="text-slate-500">Reply-To</dt><dd className="text-slate-900 break-all">{REPLY_TO}</dd>
              <dt className="text-slate-500">Subject</dt><dd className="text-slate-900 font-medium break-words">{subject}</dd>
            </dl>
            <EmailFrame html={previewHtml} loading={previewLoading} height={380} />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
            <button onClick={() => setConfirmOpen(false)} disabled={sending} className="px-4 py-2 text-sm font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-60">
              Back to editing
            </button>
            <button onClick={sendReply} disabled={sending || previewLoading} className="inline-flex justify-center items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">
              {sending ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <><Send size={16} /> Yes, send email</>}
            </button>
          </div>
        </ModalShell>
      )}

      {deleteOpen && <DeleteModal onClose={() => setDeleteOpen(false)} onConfirm={confirmDelete} />}

      <style>{`
        .contact-reply-editor .ql-toolbar{border-radius:.5rem .5rem 0 0;border-color:#e2e8f0;background:#f8fafc}
        .contact-reply-editor .ql-container{border-radius:0 0 .5rem .5rem;border-color:#e2e8f0;font-size:15px;min-height:260px}
        .contact-reply-editor .ql-editor{min-height:260px;line-height:1.65}
      `}</style>
    </div>
  );
};

export default ContactDetail;
