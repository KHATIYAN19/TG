import { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, AreaChart, Area, Legend
} from "recharts";
import { 
  TrendingUp, Users, Wallet, Landmark, 
  Calendar, CheckCircle2, AlertCircle, Clock
} from "lucide-react";
import BASE_URL from "../utils/Url";
import { useSelector } from 'react-redux';
const SalesDashboard = () => {
  const [data, setData] = useState(null);
  const [revPeriod, setRevPeriod] = useState("monthly"); // 'monthly' or 'yearly'
  const [cliPeriod, setCliPeriod] = useState("monthly");
  const[token,setToken]=useState(useSelector((state)=>state.auth.token));
  useEffect(() => {
    // 1. Scroll to top on reload
    window.scrollTo(0, 0);

    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/client/dashboard`,
            {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
            }
        );
        setData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      }
    };
    fetchDashboard();
  }, []);

  const getMonthName = (m) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];

  if (!data) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const { summary, revenue, clients, payments, alerts } = data;

  /* ================= GRAPH DATA FORMATTING ================= */
  const formattedRevData = revPeriod === "monthly" 
    ? revenue.monthly.map(d => ({ name: getMonthName(d.month), revenue: d.totalPrice, gst: d.totalGST }))
    : revenue.yearly.map(d => ({ name: d.year.toString(), revenue: d.totalPrice, gst: d.totalGST }));

  const formattedCliData = cliPeriod === "monthly"
    ? clients.monthly.map(d => ({ name: getMonthName(d.month), count: d.total }))
    : clients.yearly.map(d => ({ name: d.year.toString(), count: d.total }));

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen text-slate-800 pb-20 mt-20">
      <Helmet><title>Sales Dashboard | Analytics</title></Helmet>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 1. TOP HEADER & SUMMARY CARDS */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Dashboard</h1>
            <p className="text-slate-500 font-medium">Monitoring growth and financial performance</p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Today" revenue={summary.revenue.today} clients={summary.clients.today} color="emerald" />
          <StatCard title="This Week" revenue={summary.revenue.week} clients={summary.clients.week} color="blue" />
          <StatCard title="This Month" revenue={summary.revenue.month} clients={summary.clients.month} color="indigo" />
          <StatCard title="This Year" revenue={summary.revenue.year} clients={summary.clients.year} color="amber" />
        </div>

        {/* 2. TOTALS OVERVIEW (DARK SECTION) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-white p-8 rounded-[2rem] text-black shadow-xl">
           <TotalItem label="Total Amount" value={summary.totals.totalAmount} sub="Gross Sales" color="text-black"/>
           <TotalItem label="Total GST" value={summary.totals.totalGST} sub="Tax Collected" color="text-black" />
           <TotalItem label="Total Revenue" value={summary.totals.totalRevenue} sub="Total Amount" color="text-green-600" />
           <TotalItem label="Outstanding" value={summary.totals.totalRemaining} sub="To be Collected" color="text-red-600" />
        </div>

        {/* 3. GRAPHS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* REVENUE GRAPH */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-8 px-2">
              <div>
                <h3 className="text-xl font-bold">Revenue Flow</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Revenue vs GST</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {['monthly', 'yearly'].map(p => (
                  <button key={p} onClick={() => setRevPeriod(p)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${revPeriod === p ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>{p}</button>
                ))}
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedRevData} margin={{ left: 40, right: 10, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(1)+'k' : v}`} />
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={0.1} fill="#6366f1" />
                  <Area type="monotone" dataKey="gst" stroke="#94a3b8" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CLIENT GRAPH */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-8 px-2">
              <div>
                <h3 className="text-xl font-bold">Client Growth</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Acquisition Trend</p>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {['monthly', 'yearly'].map(p => (
                  <button key={p} onClick={() => setCliPeriod(p)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${cliPeriod === p ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}>{p}</button>
                ))}
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedCliData} margin={{ left: 20, right: 10, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none'}} />
                  <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        <section className="p-6 bg-slate-50">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AlertList 
          title="Pending Payments" 
          data={alerts.topPending} 
          color="rose" 
          type="remaining" 
          icon={<AlertCircle size={16}/>} 
        />
        <AlertList 
          title="Expiring Soon" 
          data={alerts.expiringSoon} 
          color="amber" 
          type="date" 
          icon={<Clock size={16}/>} 
        />
        <AlertList 
          title="Expired Services" 
          data={alerts.expired} 
          color="slate" 
          type="date" 
          icon={<Calendar size={16}/>} 
        />
      </div>
    </section>

        {/* 5. RECENT TRANSACTIONS TABLE */}
       <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
  {/* HEADER */}
  <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
      </div>
      <div>
        <h3 className="font-black text-slate-900 text-lg tracking-tight leading-none">Recent Transactions</h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5">Live Payment Feed</p>
      </div>
    </div>
    <button className="px-4 py-2 rounded-xl bg-slate-50 text-slate-900 text-[11px] font-black uppercase tracking-wider border border-slate-200 hover:bg-slate-100 transition-colors">
      View All
    </button>
  </div>

  {/* TABLE AREA */}
  <div className="overflow-x-auto">
    <table className="w-full text-left border-separate border-spacing-0">
      <thead>
        <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black bg-slate-50/50">
          <th className="px-8 py-4 border-b border-slate-100">Client Details</th>
          <th className="px-8 py-4 border-b border-slate-100">Date & Time</th>
          <th className="px-8 py-4 border-b border-slate-100">Payment Mode</th>
          <th className="px-8 py-4 border-b border-slate-100 text-right">Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {payments.last5.map((p, i) => (
          <tr key={i} className="group hover:bg-slate-50/80 transition-all duration-200">
            {/* CLIENT COLUMN */}
            <td className="px-8 py-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-slate-200">
                  {p.clientName.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-slate-900 text-sm leading-tight">{p.clientName}</span>
                  <span className="text-[10px] text-slate-500 font-medium">Verified Client</span>
                </div>
              </div>
            </td>

            {/* DATE COLUMN */}
            <td className="px-8 py-5">
              <div className="flex flex-col">
                <span className="text-sm text-slate-900 font-bold">
                  {new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Completed</span>
              </div>
            </td>

            {/* METHOD COLUMN */}
            <td className="px-8 py-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-tight shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                {p.paidBy}
              </span>
            </td>

            {/* AMOUNT COLUMN */}
            <td className="px-8 py-5 text-right">
              <div className="flex flex-col items-end">
                <span className="text-base font-black text-slate-900 tracking-tight">
                  ₹{p.amount.toLocaleString()}
                </span>
                <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-tighter flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  Received
                </span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    
    {/* EMPTY STATE */}
    {payments.last5.length === 0 && (
      <div className="py-20 text-center">
        <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">No Recent Activity</p>
      </div>
    )}
  </div>
</div>

      </div>
    </div>
  );
};

/* ================= HELPER COMPONENTS ================= */

const StatCard = ({ title, revenue, clients, color }) => {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100"
  };
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-4 ${colors[color]}`}>{title}</div>
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-900">₹{revenue.toLocaleString()}</h2>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-tighter">
          <Users size={12} className="text-slate-300" />
          <span>{clients} New Client{clients !== 1 && 's'}</span>
        </div>
      </div>
    </div>
  );
};

const TotalItem = ({ label, value, sub, color = "text-white" }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
    <h3 className={`text-2xl font-black ${color}`}>₹{value.toLocaleString()}</h3>
    <p className="text-[10px] font-medium text-slate-400">{sub}</p>
  </div>
);

// Theme mapping for the header section
const AlertList = ({ title, data, color, type, icon }) => {
  const themes = {
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200"
  };

  return (
    <div className="bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[450px]">
      {/* Header */}
      <div className={`p-4 border-b font-black text-[11px] tracking-[0.2em] uppercase flex items-center justify-between ${themes[color]}`}>
        <div className="flex items-center gap-2">
          {icon} 
          <span>{title}</span>
        </div>
        <span className="bg-white/80 px-2 py-0.5 rounded-full text-[10px] shadow-sm border border-black/5">
          {data?.length || 0}
        </span>
      </div>

      {/* Content Area */}
      <div className="p-3 space-y-3 overflow-y-auto custom-scrollbar bg-slate-50/30 flex-1">
        {data && data.length > 0 ? (
          data.map((item, i) => (
            <div 
              key={i} 
              className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-slate-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <h5 className="font-bold text-slate-900 text-sm leading-tight">
                  {item.clientName}
                </h5>
                {type === 'remaining' && (
                  <span className="text-rose-600 font-extrabold text-xs whitespace-nowrap">
                    ₹{item.remaining?.toLocaleString() || 0}
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">
                  {item.serviceName} <span className="text-slate-300 mx-1">•</span> {item.company}
                </div>
                
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <span className="opacity-70">Mob:</span> {item.phone}
                </div>

                {type === 'date' && item.endDate && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Expiry Date</span>
                    <span className={`font-black px-2 py-0.5 rounded ${
                      color === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {new Date(item.endDate).toLocaleDateString('en-GB', {
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-2 opacity-40">
            <div className="p-3 bg-slate-100 rounded-full">
              {icon}
            </div>
            <p className="text-center text-slate-500 text-[10px] font-black tracking-widest uppercase">
              No Pending Records
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SalesDashboard;