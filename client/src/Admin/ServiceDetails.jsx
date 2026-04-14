import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from 'react-redux';
import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet";
import { 
  ArrowLeft, FileText, IndianRupee, Calendar, Clock, 
  ExternalLink, Upload, Loader2, X, ReceiptIndianRupee, 
  Layers, CreditCard, Activity
} from "lucide-react";
import BASE_URL from "../utils/Url";

const ServiceDetails = () => {
  const { clientId, serviceId } = useParams();
  const navigate = useNavigate();
 const [token] = useState(useSelector((state) => state.auth.token));
  const [service, setService] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [payModal, setPayModal] = useState(false);
  const [docModal, setDocModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form & Error States
  const [payForm, setPayForm] = useState({ amount: "", paidBy: "UPI", transactionId: "", notes: "" });
  const [docForm, setDocForm] = useState({ name: "", file: null });
  const [payErrors, setPayErrors] = useState({});
  const [docErrors, setDocErrors] = useState({});

  const fetchDetails = useCallback(async () => {
    try {
      setFetching(true);
      const res = await axios.get(`${BASE_URL}/client/${clientId}/services/${serviceId}`,{
         headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success) setService(res.data.data);
    } catch (err) {
      toast.error("Service records not found");
    } finally {
      setFetching(false);
    }
  }, [clientId, serviceId]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('en-GB')} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const validatePay = (name, value) => {
    let error = "";
    if (name === "amount" && (!value || value <= 0)) error = "Valid amount required";
    if (name === "amount" && value > service?.remainingAmount) error = "Exceeds balance";
    setPayErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const validateDoc = (name, value) => {
    let error = "";
    if (name === "name" && !value.trim()) error = "Name is required";
    if (name === "file" && !value) error = "File is required";
    setDocErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (validatePay("amount", payForm.amount)) return;
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/client/${clientId}/services/${serviceId}/payments`, payForm,{
         headers: {
          Authorization: `Bearer ${token}`,
        },
      }
        
      );
      toast.success("Payment Recorded");
      setPayModal(false);
      setPayForm({ amount: "", paidBy: "UPI", transactionId: "", notes: "" });
      fetchDetails();
    } catch (err) { toast.error("Payment Error"); } finally { setLoading(false); }
  };

  const handleDocument = async (e) => {
    e.preventDefault();
    if (validateDoc("name", docForm.name) || validateDoc("file", docForm.file)) return;
    const formData = new FormData();
    formData.append("name", docForm.name);
    formData.append("file", docForm.file);
    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/client/${clientId}/services/${serviceId}/documents`, formData,{
         headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("File Uploaded");
      setDocModal(false);
      setDocForm({ name: "", file: null });
      fetchDetails();
    } catch (err) { toast.error("Upload Error"); } finally { setLoading(false); }
  };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-900" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fcfdfe] p-4 md:p-8 mt-16 font-sans">
      <Helmet><title>{service.serviceName} - Target Trek</title></Helmet>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* NAV */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase tracking-[0.2em] transition-all">
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        {/* 1. LIGHT THEMED SERVICE OVERVIEW CARD */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 md:p-12 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Service Terminal</span>
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${service.status === 'ACTIVE' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                  {service.status}
                </span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{service.serviceName}</h1>
              <p className="text-slate-400 text-sm font-medium">{service.notes || "No detailed notes available."}</p>
            </div>

            <div className="flex gap-4">
               <div className="bg-slate-50 p-4 px-6 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Balance</p>
                  <p className="text-2xl font-black text-slate-900">₹{service.totalPrice.toLocaleString()}</p>
               </div>
               <div className="bg-orange-50 p-4 px-6 rounded-2xl border border-orange-100 text-center">
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Remaining</p>
                  <p className="text-2xl font-black text-orange-600">₹{service.remainingAmount.toLocaleString()}</p>
               </div>
            </div>
          </div>

          <div className="p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Clock size={12}/> Timeline</p>
              <p className="text-xs font-bold text-slate-700">In: {formatDateTime(service.createdAt)}</p>
              <p className="text-xs font-bold text-slate-700">Up: {formatDateTime(service.updatedAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Activity size={12}/> Activity</p>
              <p className="text-xs font-bold text-slate-700 underline decoration-blue-200 underline-offset-4">{service.documents.length} Files Uploaded</p>
              <p className="text-xs font-bold text-slate-700 underline decoration-green-200 underline-offset-4">{service.payments.length} Payments Processed</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Layers size={12}/> Contract</p>
              <p className="text-xs font-bold text-slate-700">{service.pricingType} Model</p>
              <p className="text-xs font-bold text-slate-700">GST: ₹{service.gst.toLocaleString()}</p>
             <p className="text-xs font-bold text-slate-700">Price: ₹{service.price.toLocaleString()}</p>

            </div>
            <div className="flex items-center justify-end">
               <button onClick={() => setPayModal(true)} disabled={service.remainingAmount <= 0} className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all disabled:bg-slate-200">
                Record Payment
               </button>
            </div>
          </div>
        </section>

        {/* 2. DOCUMENTS LIST (Full Width) */}
        <section className="space-y-6">
  <div className="flex justify-between items-center border-b border-slate-200 pb-4">
    <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3">
      Files & Attachments 
      <span className="bg-slate-200 text-slate-600 text-xs py-1 px-3 rounded-full not-italic tracking-normal">
        {service.documents.length}
      </span>
    </h2>
    <button 
      onClick={() => setDocModal(true)} 
      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
    >
      <Upload size={14}/> Add Document
    </button>
  </div>

  <div className="space-y-3">
    {service.documents.length > 0 ? (
      service.documents.map((doc, idx) => (
        <div 
          key={idx} 
          className="group flex flex-col md:flex-row md:items-center justify-between bg-white border border-slate-200 p-4 px-6 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all gap-4"
        >
          {/* File Info */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <FileText size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-900">{doc.name}</p>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tight">
                {doc.fileName}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center">
            <a 
              href={doc.fileUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center justify-center gap-2 px-6 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all w-full md:w-auto"
            >
              View Asset <ExternalLink size={12}/>
            </a>
          </div>
        </div>
      ))
    ) : (
      <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
        <p className="text-slate-400 font-black uppercase text-xs tracking-[0.2em]">Repository Empty</p>
      </div>
    )}
  </div>
</section>

        {/* 3. PAYMENTS LEDGER (Full Width) */}
        <section className="space-y-6 pb-20">
          <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter flex items-center gap-3 border-b border-slate-100 pb-4">
             Transaction Records <span className="bg-slate-100 text-slate-500 text-xs py-1 px-3 rounded-full not-italic tracking-normal">{service.payments.length}</span>
          </h2>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Metadata</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {service.payments.length > 0 ? service.payments.map((p, idx) => (
                  <tr key={idx} className="group">
                    <td className="px-8 py-6">
                      <p className="text-xs font-black text-slate-800">{formatDateTime(p.createdAt)}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {p.transactionId || 'N/A'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500">{p.paidBy}</span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-lg font-black text-slate-900 tracking-tighter">₹{p.amount.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className={`text-xs ${p.notes ? 'text-slate-600 font-medium' : 'text-slate-300 italic'}`}>
                        {p.notes || "Not Found"}
                      </p>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-[0.3em]">No credits found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* PAYMENT MODAL */}
      {payModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
            <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">New Transaction</h2>
              <button onClick={() => setPayModal(false)} className="p-2 hover:bg-white rounded-full transition-all"><X size={18}/></button>
            </div>
            <form onSubmit={handlePayment} className="p-8 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Payable Amount*</label>
                <input type="number" className={`w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 transition-all outline-none text-sm font-bold ${payErrors.amount ? 'border-orange-400 bg-orange-50/20' : 'border-slate-100 focus:border-slate-900'}`} value={payForm.amount} onChange={(e) => { setPayForm({...payForm, amount: e.target.value}); validatePay("amount", e.target.value); }} placeholder="0.00" />
                {payErrors.amount && <p className="text-[10px] text-orange-600 font-bold mt-1 ml-2 tracking-tight">{payErrors.amount}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Mode</label>
                  <select className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none text-xs font-black uppercase" value={payForm.paidBy} onChange={(e) => setPayForm({...payForm, paidBy: e.target.value})}>
                    <option value="UPI">UPI</option>
                    <option value="BANK">BANK</option>
                    <option value="CASH">CASH</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Txn ID</label>
                  <input className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-slate-900 outline-none text-sm font-bold" value={payForm.transactionId} onChange={(e) => setPayForm({...payForm, transactionId: e.target.value})} placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Internal Note</label>
                <textarea className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-slate-900 outline-none text-sm font-medium h-24 resize-none" value={payForm.notes} onChange={(e) => setPayForm({...payForm, notes: e.target.value})} placeholder="Describe this payment..." />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black transition-all shadow-xl">
                {loading ? "SAVING..." : "COMMIT PAYMENT"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT MODAL */}
      {docModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
            <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Add Asset</h2>
              <button onClick={() => setDocModal(false)} className="p-2 hover:bg-white rounded-full transition-all"><X size={18}/></button>
            </div>
            <form onSubmit={handleDocument} className="p-8 space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Document Label*</label>
                <input className={`w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 transition-all outline-none text-sm font-bold ${docErrors.name ? 'border-orange-400 bg-orange-50/20' : 'border-slate-100 focus:border-slate-900'}`} value={docForm.name} onChange={(e) => { setDocForm({...docForm, name: e.target.value}); validateDoc("name", e.target.value); }} placeholder="e.g. KYC_Aadhar" />
                {docErrors.name && <p className="text-[10px] text-orange-600 font-bold mt-1 ml-2 tracking-tight">{docErrors.name}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Select File*</label>
                <input type="file" className={`w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 transition-all text-sm font-bold ${docErrors.file ? 'border-orange-400 bg-orange-50/20' : 'border-slate-100'}`} onChange={(e) => { setDocForm({...docForm, file: e.target.files[0]}); validateDoc("file", e.target.files[0]); }} />
                {docErrors.file && <p className="text-[10px] text-orange-600 font-bold mt-1 ml-2 tracking-tight">{docErrors.file}</p>}
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                {loading ? "UPLOADING..." : "UPLOAD ASSET"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetails;