import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Plus, Users, Mail, Phone, Building, Search, X, FileText, MapPin, Loader2 } from "lucide-react";
import BASE_URL from "../utils/Url";
import { useSelector } from 'react-redux';
const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const requiredFields = ["name", "companyName", "email", "phone", "address"];
   const [token] = useState(useSelector((state) => state.auth.token));
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // 1. Scroll to top on Refresh/Mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch Logic
  const fetchClients = useCallback(async () => {
    try {
      setFetching(true);
      const res = await axios.get(`${BASE_URL}/client`,{
         headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClients(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (err) {
      toast.error("Database sync failed.");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // 2. SEARCH FILTER LOGIC
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const search = searchQuery.toLowerCase();
      return (
        c.name?.toLowerCase().includes(search) ||
        c.companyName?.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search)
      );
    });
  }, [clients, searchQuery]);

  /* ================= VALIDATION ================= */
  const validateField = (name, value) => {
  let error = "";

  if (requiredFields.includes(name) && !value?.trim()) {
    error = "Required field";
  } 
  else if (name === "email" && value && !/\S+@\S+\.\S+/.test(value)) {
    error = "Invalid email format";
  } 
  else if (name === "phone" && value && !/^\d{10}$/.test(value)) {
    error = "10 digits required";
  }

  setErrors((prev) => ({ ...prev, [name]: error }));
  return error;
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    requiredFields.forEach((key) => {
    const err = validateField(key, form[key]);
    if (err) newErrors[key] = err;
    });

    if (Object.values(newErrors).some((x) => x)) return;

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/client`, form,{
         headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Client onboarded successfully");
      setOpen(false);
      setForm({ name: "", companyName: "", email: "", phone: "", address: "", notes: "" });
      setErrors({});
      fetchClients();
    } catch (err) {
      toast.error(err.response?.data?.message || "Protocol Error");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] p-8 font-sans text-slate-900 mt-20">
      <Helmet>
        <title>Clients -Target Trek</title>
      </Helmet>
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Client Directory</h1>
          <p className="text-slate-500 mt-1">
            Centralized management system for active business profiles.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-sm active:scale-95"
        >
          <Plus size={18} strokeWidth={2.5} />
          Onboard Client
        </button>
      </header>

      {/* 3. SEARCH BAR */}
      <div className="mb-8 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Search by name, company, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-400 outline-none transition-all text-sm"
        />
        {searchQuery && (
          <X 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer hover:text-slate-600" 
            size={16} 
            onClick={() => setSearchQuery("")}
          />
        )}
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">ID</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Client Name</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Business</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Email Address</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">Contact</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-right">Onboarded At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fetching ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <Loader2 className="animate-spin inline-block text-slate-400" size={24} />
                    <p className="mt-2 text-slate-400 text-sm">Retrieving database...</p>
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-medium">
                    {searchQuery ? "No matching records found." : "Directory empty. Onboard your first client."}
                  </td>
                </tr>
              ) : (
                filteredClients.map((c) => (
                  <tr 
                    key={c._id} 
                    onClick={() => navigate(`/clients/${c._id}/services`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 text-xs font-mono text-slate-400 group-hover:text-slate-600">
                      #{c._id}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{c.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{c.companyName}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{c.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-mono tracking-tighter">{c.phone}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 text-right whitespace-nowrap">
                      {formatDateTime(c.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center bg-slate-50 px-8 py-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Client Onboarding</h2>
                <p className="text-slate-500 text-sm mt-0.5">Input verified business parameters.</p>
              </div>
              <button onClick={() => {setOpen(false); setErrors({});}} className="text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-slate-200 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { label: "Full Name*", name: "name", type: "text", placeholder: "Alex Johnson" },
                  { label: "Company Name*", name: "companyName", type: "text", placeholder: "Nexus Labs" },
                  { label: "Business Email*", name: "email", type: "email", placeholder: "alex@nexus.com" },
                  { label: "Phone Number*", name: "phone", type: "tel", placeholder: "10-digit mobile" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2 tracking-wide">{f.label}</label>
                    <input
                      name={f.name}
                      type={f.type}
                      placeholder={f.placeholder}
                      value={form[f.name]}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none text-sm ${
                        errors[f.name] 
                          ? "border-red-400 bg-red-50 focus:border-red-500" 
                          : "border-slate-200 bg-slate-50 focus:border-slate-900 focus:bg-white"
                      }`}
                    />
                    {errors[f.name] && <p className="text-red-600 text-[10px] font-bold mt-1.5 uppercase italic tracking-wider">{errors[f.name]}</p>}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2 tracking-wide">Registered Address*</label>
                <div className="relative">
                   <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                   <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter full physical address"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all outline-none text-sm ${
                        errors.address ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-slate-900 focus:bg-white"
                    }`}
                  />
                </div>
                {errors.address && <p className="text-red-600 text-[10px] font-bold mt-1.5 uppercase italic tracking-wider">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2 tracking-wide">Internal Management Notes</label>
                <textarea
                  name="notes"
                  rows="4"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Record strategic requirements or contract specifics here..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-slate-900 focus:bg-white outline-none text-sm resize-none transition-all"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {setOpen(false); setErrors({});}}
                  className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors text-sm"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3 font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 rounded-xl transition-all text-sm shadow-md"
                >
                  {loading ? "Registering Client..." : "Complete Onboarding"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
