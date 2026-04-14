import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Helmet } from "react-helmet";
import { useSelector } from 'react-redux';
import { 
  Plus, IndianRupee, ArrowLeft, Search, X, Loader2, 
  User, Building2, Mail, Phone, MapPin, Calendar, Clock, FileText, StickyNote 
} from "lucide-react";
import BASE_URL from "../utils/Url";

const ClientServices = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [token] = useState(useSelector((state) => state.auth.token));
  const [clientData, setClientData] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    serviceName: "",
    notes: "",
    pricingType: "ONE-TIME",
    price: "",
    gst: "0",
    startDate: "",
    endDate: "",
  });

  const fetchClientInfo = useCallback(async () => {
    try {
      setFetching(true);
      const res = await axios.get(`${BASE_URL}/client/${clientId}/services`,{
         headers: {
          Authorization: `Bearer ${token}`,
        },
      }
        
      );
      if (res.data.success) {
        setClientData(res.data.data);
      }
    } catch (err) {
      toast.error("Critical: Client Profile Not Found");
    } finally {
      setFetching(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClientInfo();
  }, [fetchClientInfo]);

  /* ================= VALIDATION LOGIC ================= */
  const validateField = (name, value) => {
    let error = "";
    if (name === "serviceName" && !value.trim()) error = "Service name is required";
    if (name === "price" && (!value || value <= 0)) error = "Valid price is required";
    if (name === "startDate" && !value) error = "Start date is required";
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let updatedForm = { ...form, [name]: value };

    // Auto-calculate 18% GST if Price changes
    if (name === "price") {
      const calculatedGst = value ? (parseFloat(value) * 0.18).toFixed(2) : "0";
      updatedForm.gst = calculatedGst;
    }

    setForm(updatedForm);
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final check
    const e1 = validateField("serviceName", form.serviceName);
    const e2 = validateField("price", form.price);
    const e3 = validateField("startDate", form.startDate);

    if (e1 || e2 || e3) {
      toast.error("Please fix the highlighted errors");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/client/${clientId}/services`, form,{
         headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Service deployed successfully");
      setOpen(false);
      setForm({ serviceName: "", notes: "", pricingType: "ONE-TIME", price: "", gst: "0", startDate: "", endDate: "" });
      setErrors({});
      fetchClientInfo();
    } catch (err) {
      toast.error(err.response?.data?.message || "Deployment Error");
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = useMemo(() => {
    return clientData?.services?.filter((s) =>
      s.serviceName?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }, [clientData, searchQuery]);

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-900" size={40} />
    </div>
  );

  if (!clientData) return (
    <div className="p-20 text-center font-bold text-red-500">404: Client Records Missing</div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 mt-16 font-sans">
      <Helmet><title>{clientData.name} | Services Terminal</title></Helmet>  

      <div className="max-w-7xl mx-auto space-y-6">
        <button onClick={() => navigate("/clients")} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} /> Back to Directory
        </button>

        {/* 1. CLIENT INFO CARD (Light Themed) */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-tighter">
                <User size={12} /> Account Identity
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{clientData.name}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-slate-600 text-sm font-medium"><Building2 size={16} className="text-slate-400" /> {clientData.companyName}</div>
                <div className="flex items-center gap-3 text-slate-600 text-sm font-medium"><Mail size={16} className="text-slate-400" /> {clientData.email}</div>
                <div className="flex items-center gap-3 text-slate-600 text-sm font-medium"><Phone size={16} className="text-slate-400" /> {clientData.phone}</div>
                <div className="flex items-center gap-3 text-slate-600 text-sm font-medium"><MapPin size={16} className="text-slate-400" /> {clientData.address}</div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <StickyNote size={12} /> Internal Client Notes
                </label>
                <p className="text-sm text-slate-500 italic leading-relaxed">{clientData.notes || "No strategic notes recorded."}</p>
              </div>
            </div>
            
            {/* UPDATED LIGHT COLOR CARD */}
            <div className="bg-blue-50 border border-blue-100 p-8 rounded-[2rem] flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Account Status</p>
                <h3 className="text-2xl font-black text-blue-600 tracking-tighter">{clientData.status}</h3>
              </div>
              <div className="space-y-3 mt-8">
                <div className="flex justify-between text-xs border-b border-blue-200/50 pb-2">
                  <span className="text-blue-400 font-bold uppercase tracking-tighter">Active Services</span>
                  <span className="font-black text-blue-700">{clientData.services?.length || 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-blue-400 font-bold uppercase tracking-tighter">Onboarded</span>
                  <span className="font-black text-blue-700">{new Date(clientData.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SERVICES SECTION */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Service Terminal</h2>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input placeholder="Filter by service name..." className="pl-10 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-slate-900 outline-none w-full md:w-72 text-sm font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
              <button onClick={() => setOpen(true)} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200"><Plus size={18} strokeWidth={3} /> Add New</button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Service Details</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pricing</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Remaining Amt</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Created</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timeline</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredServices.map((s) => (
                    <tr key={s._id} onClick={() => navigate(`/clients/${clientId}/services/${s._id}`)} className="hover:bg-slate-50/80 cursor-pointer transition-all group">
                      <td className="px-8 py-6">
                        <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{s.serviceName}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-tighter">ID: #{s._id?.slice(-6)}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded ${s.pricingType === 'MONTHLY' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{s.pricingType}</span>
                        <div className="mt-1 font-bold text-slate-900">₹{s.totalPrice?.toLocaleString()}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`mt-1 font-bold text-slate-900 ${s.remainingAmount === '0' ? 'text-green-700' : 'text-red-700'}`}>₹{s.remainingAmount?.toLocaleString()}</div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-2 text-xs text-slate-500 font-medium"><Clock size={14} className="text-slate-300" />{new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</div>
                         <p className="text-[10px] text-slate-400 ml-5 font-bold">Created Date</p>
                      </td>
                      <td className="px-8 py-6 text-sm text-slate-600 font-medium">
                        <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-400"/> {new Date(s.startDate).toLocaleDateString()}</div>
                        {s.endDate && <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1"><Clock size={12}/> Ends: {new Date(s.endDate).toLocaleDateString()}</div>}
                      </td>
                      <td className="px-8 py-6 text-right"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ADD SERVICE MODAL */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
            <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase italic">Provision Service</h2>
                <p className="text-xs text-slate-500 font-medium font-mono">CLIENT: {clientData.name.toUpperCase()}</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 bg-white hover:bg-red-50 hover:text-red-500 rounded-full transition-all shadow-sm"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Service Name*</label>
                  <input name="serviceName" className={`w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 transition-all outline-none text-sm font-semibold ${errors.serviceName ? 'border-orange-400 ring-4 ring-orange-50' : 'border-slate-100 focus:border-slate-900'}`} placeholder="e.g. SEO Campaign" value={form.serviceName} onChange={handleInputChange} />
                  {errors.serviceName && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">{errors.serviceName}</p>}
                </div>

                <div className="mt-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Pricing Model*</label>
                  <select name="pricingType" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none text-sm font-bold appearance-none cursor-pointer" value={form.pricingType} onChange={handleInputChange}>
                    <option value="ONE-TIME">ONE-TIME</option>
                    <option value="MONTHLY">MONTHLY</option>
                  </select>
                </div>

                <div className="mt-3">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 block">Net Contract Value</label>
                  <div className="w-full px-5 py-3.5 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center gap-1 shadow-lg shadow-blue-100">
                    <IndianRupee size={14} /> {(Number(form.price || 0) + Number(form.gst || 0)).toLocaleString()}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Base Price (Excl. GST)*</label>
                  <input name="price" type="number" className={`w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 transition-all outline-none text-sm font-bold ${errors.price ? 'border-orange-400 ring-4 ring-orange-50' : 'border-slate-100 focus:border-slate-900'}`} value={form.price} onChange={handleInputChange} />
                  {errors.price && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">{errors.price}</p>}
                </div>

                <div className="mt-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">GST Amount (Editable)</label>
                  <input name="gst" type="number" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none text-sm font-bold" value={form.gst} onChange={handleInputChange} />
                </div>

                <div className="mt-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Start Date*</label>
                  <input name="startDate" type="date" className={`w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 transition-all outline-none text-sm font-bold ${errors.startDate ? 'border-orange-400 ring-4 ring-orange-50' : 'border-slate-100 focus:border-slate-900'}`} value={form.startDate} onChange={handleInputChange} />
                  {errors.startDate && <p className="text-[10px] text-red-500 font-bold mt-1 ml-2">{errors.startDate}</p>}
                </div>

                <div className="mt-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">End Date (Opt.)</label>
                  <input name="endDate" type="date" className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none text-sm font-bold" value={form.endDate} onChange={handleInputChange} />
                </div>
              </div>

              <div className="mt-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Strategic Notes</label>
                <textarea name="notes" className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none text-sm font-medium h-20 resize-none" placeholder="Enter scope details..." value={form.notes} onChange={handleInputChange} />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all shadow-xl active:scale-[0.98] disabled:bg-slate-300">
                {loading ? "PROVISIONING..." : "DEPLOY CONTRACT"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientServices;